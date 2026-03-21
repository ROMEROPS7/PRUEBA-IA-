/**
 * SiniestrosAI - Orquestador Central de Agentes
 * 
 * Coordina el flujo completo de un siniestro a través de los agentes especializados.
 * Cada agente es un módulo autónomo que recibe contexto y devuelve decisiones.
 */
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../config/database');
const { logger } = require('../utils/logger');
const { v4: uuid } = require('uuid');

// Agentes especializados
const AgenteRecepcionista = require('./specialized/recepcionista');
const AgenteClasificador = require('./specialized/clasificador');
const AgenteAntifraude = require('./specialized/antifraude');
const AgenteValorador = require('./specialized/valorador');
const AgentePeritoVirtual = require('./specialized/peritoVirtual');
const AgenteNegociador = require('./specialized/negociador');
const AgenteComunicaciones = require('./specialized/comunicaciones');
const AgenteLegal = require('./specialized/legal');
const AgentePagos = require('./specialized/pagos');
const AgenteCalidad = require('./specialized/calidad');

class Orquestador {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.modelo = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
    
    this.agentes = {
      recepcionista: new AgenteRecepcionista(this.client, this.modelo),
      clasificador: new AgenteClasificador(this.client, this.modelo),
      antifraude: new AgenteAntifraude(this.client, this.modelo),
      valorador: new AgenteValorador(this.client, this.modelo),
      perito_virtual: new AgentePeritoVirtual(this.client, this.modelo),
      negociador: new AgenteNegociador(this.client, this.modelo),
      comunicaciones: new AgenteComunicaciones(this.client, this.modelo),
      legal: new AgenteLegal(this.client, this.modelo),
      pagos: new AgentePagos(this.client, this.modelo),
      calidad: new AgenteCalidad(this.client, this.modelo)
    };
  }

  /**
   * Procesar un siniestro nuevo de principio a fin
   */
  async procesarSiniestro(siniestroId, empresaId) {
    const inicio = Date.now();
    const pipeline = [];

    try {
      logger.info(`🤖 [Orquestador] Iniciando procesamiento de siniestro ${siniestroId}`);

      // Cargar contexto completo
      const contexto = await this._cargarContexto(siniestroId, empresaId);
      
      // ===== FASE 1: RECEPCIÓN Y CLASIFICACIÓN =====
      await this._actualizarEstado(siniestroId, 'clasificando', 'orquestador');
      
      const recepcion = await this._ejecutarAgente('recepcionista', siniestroId, {
        descripcion: contexto.siniestro.descripcion,
        canal: contexto.siniestro.canal_entrada,
        cliente: contexto.cliente,
        poliza: contexto.poliza
      });
      pipeline.push(recepcion);

      const clasificacion = await this._ejecutarAgente('clasificador', siniestroId, {
        descripcion: contexto.siniestro.descripcion,
        tipo_declarado: contexto.siniestro.tipo,
        poliza: contexto.poliza,
        recepcion: recepcion.output
      });
      pipeline.push(clasificacion);

      // Actualizar siniestro con clasificación
      await db('siniestros').where('id', siniestroId).update({
        tipo: clasificacion.output.tipo_final || contexto.siniestro.tipo,
        prioridad: clasificacion.output.prioridad || 'media',
        datos_adicionales: JSON.stringify({
          ...contexto.siniestro.datos_adicionales,
          clasificacion_ia: clasificacion.output
        })
      });

      // ===== FASE 2: VERIFICACIÓN LEGAL Y ANTIFRAUDE =====
      await this._actualizarEstado(siniestroId, 'en_analisis', 'orquestador');

      const [legal, antifraude] = await Promise.all([
        this._ejecutarAgente('legal', siniestroId, {
          siniestro: contexto.siniestro,
          poliza: contexto.poliza,
          clasificacion: clasificacion.output
        }),
        this._ejecutarAgente('antifraude', siniestroId, {
          siniestro: contexto.siniestro,
          cliente: contexto.cliente,
          poliza: contexto.poliza,
          clasificacion: clasificacion.output,
          historial: contexto.historial_cliente
        })
      ]);
      pipeline.push(legal, antifraude);

      // Si el fraude es alto, escalar a humano
      if (antifraude.output.nivel === 'alto' || antifraude.output.nivel === 'confirmado') {
        await this._actualizarEstado(siniestroId, 'verificando_fraude', 'agente:antifraude');
        await db('siniestros').where('id', siniestroId).update({
          nivel_fraude: antifraude.output.nivel,
          score_fraude: antifraude.output.score,
          indicadores_fraude: JSON.stringify(antifraude.output.indicadores)
        });

        // Notificar al gestor
        await this.agentes.comunicaciones.notificarGestor(siniestroId, {
          tipo: 'alerta_fraude',
          nivel: antifraude.output.nivel,
          indicadores: antifraude.output.indicadores
        });

        logger.warn(`⚠️ [Orquestador] Siniestro ${siniestroId} escalado por fraude (${antifraude.output.nivel})`);
        return this._generarResultado(siniestroId, pipeline, inicio, false, 'escalado_fraude');
      }

      // Si no tiene cobertura, rechazar
      if (!legal.output.tiene_cobertura) {
        await this._actualizarEstado(siniestroId, 'rechazado', 'agente:legal');
        await db('siniestros').where('id', siniestroId).update({
          resolucion_motivo: legal.output.motivo_rechazo,
          fecha_resolucion: new Date()
        });

        await this._ejecutarAgente('comunicaciones', siniestroId, {
          tipo: 'rechazo_cobertura',
          cliente: contexto.cliente,
          motivo: legal.output.motivo_rechazo
        });

        return this._generarResultado(siniestroId, pipeline, inicio, true, 'rechazado_sin_cobertura');
      }

      // ===== FASE 3: VALORACIÓN =====
      await this._actualizarEstado(siniestroId, 'valoracion', 'orquestador');

      const valoracion = await this._ejecutarAgente('valorador', siniestroId, {
        siniestro: contexto.siniestro,
        poliza: contexto.poliza,
        clasificacion: clasificacion.output,
        documentos: contexto.documentos
      });
      pipeline.push(valoracion);

      await db('siniestros').where('id', siniestroId).update({
        valoracion_ia: valoracion.output.importe_estimado
      });

      // Decidir si necesita perito humano
      const limites = contexto.empresa.limites_autonomia;
      const necesitaPerito = valoracion.output.importe_estimado > (limites.requiere_perito_desde || 8000);

      if (necesitaPerito) {
        await this._actualizarEstado(siniestroId, 'peritaje', 'orquestador');
        
        const peritoVirtual = await this._ejecutarAgente('perito_virtual', siniestroId, {
          siniestro: contexto.siniestro,
          valoracion: valoracion.output,
          documentos: contexto.documentos
        });
        pipeline.push(peritoVirtual);

        // Asignar perito humano si es necesario
        if (peritoVirtual.output.requiere_perito_presencial) {
          const perito = await this._asignarPerito(siniestroId, contexto);
          if (perito) {
            await db('siniestros').where('id', siniestroId).update({ perito_id: perito.usuario_id });
            await this._ejecutarAgente('comunicaciones', siniestroId, {
              tipo: 'asignacion_perito',
              cliente: contexto.cliente,
              perito
            });
          }
          return this._generarResultado(siniestroId, pipeline, inicio, false, 'pendiente_perito');
        }
      }

      // ===== FASE 4: NEGOCIACIÓN CON TALLERES (si aplica) =====
      let presupuestoFinal = null;
      if (contexto.siniestro.tipo.startsWith('auto_') && valoracion.output.requiere_reparacion) {
        await this._actualizarEstado(siniestroId, 'negociacion', 'orquestador');

        const negociacion = await this._ejecutarAgente('negociador', siniestroId, {
          siniestro: contexto.siniestro,
          valoracion: valoracion.output,
          talleres: await this._buscarTalleres(contexto)
        });
        pipeline.push(negociacion);
        presupuestoFinal = negociacion.output;
      }

      // ===== FASE 5: APROBACIÓN Y PAGO =====
      const importeFinal = presupuestoFinal?.importe_negociado || valoracion.output.importe_estimado;
      const franquicia = contexto.poliza.franquicia || 0;
      const importeNeto = Math.max(0, importeFinal - franquicia);

      const puedeAutoAprobar = importeNeto <= (limites.auto_aprobacion_max || 5000);

      if (puedeAutoAprobar && antifraude.output.nivel === 'sin_riesgo') {
        // AUTO-APROBACIÓN
        await this._actualizarEstado(siniestroId, 'aprobado', 'orquestador');

        await db('siniestros').where('id', siniestroId).update({
          valoracion_final: importeFinal,
          franquicia_aplicada: franquicia,
          importe_aprobado: importeNeto,
          auto_resuelto: true,
          resolucion_motivo: 'Aprobado automáticamente por IA',
          fecha_resolucion: new Date()
        });

        // Procesar pago
        const pago = await this._ejecutarAgente('pagos', siniestroId, {
          importe: importeNeto,
          cliente: contexto.cliente,
          siniestro: contexto.siniestro
        });
        pipeline.push(pago);

        if (pago.output.procesado) {
          await this._actualizarEstado(siniestroId, 'pagado', 'agente:pagos');
        }

        // Comunicar al cliente
        await this._ejecutarAgente('comunicaciones', siniestroId, {
          tipo: 'resolucion_aprobada',
          cliente: contexto.cliente,
          importe: importeNeto,
          franquicia,
          detalles: valoracion.output
        });

        // Cerrar
        await this._actualizarEstado(siniestroId, 'cerrado', 'orquestador');

        const duracion = Date.now() - inicio;
        await db('siniestros').where('id', siniestroId).update({
          tiempo_resolucion_minutos: Math.round(duracion / 60000),
          agentes_involucrados: JSON.stringify(pipeline.map(p => p.agente)),
          total_interacciones_ia: pipeline.length
        });

        // Programar encuesta de calidad
        await this._ejecutarAgente('calidad', siniestroId, {
          cliente: contexto.cliente,
          siniestro: contexto.siniestro,
          tiempo_resolucion: duracion
        });

        logger.info(`✅ [Orquestador] Siniestro ${siniestroId} resuelto automáticamente en ${Math.round(duracion / 1000)}s`);
        return this._generarResultado(siniestroId, pipeline, inicio, true, 'auto_resuelto');

      } else {
        // REQUIERE APROBACIÓN HUMANA
        await this._actualizarEstado(siniestroId, 'en_analisis', 'orquestador');

        await db('siniestros').where('id', siniestroId).update({
          valoracion_ia: importeFinal,
          franquicia_aplicada: franquicia,
          resumen_ia: JSON.stringify({
            valoracion: valoracion.output,
            antifraude: { nivel: antifraude.output.nivel, score: antifraude.output.score },
            legal: legal.output,
            recomendacion: importeNeto > limites.auto_aprobacion_max 
              ? `Importe (${importeNeto}€) supera límite de auto-aprobación (${limites.auto_aprobacion_max}€). Requiere revisión.`
              : 'Revisar por indicadores de fraude.'
          })
        });

        await this.agentes.comunicaciones.notificarGestor(siniestroId, {
          tipo: 'requiere_aprobacion',
          importe: importeNeto,
          motivo: 'Supera límites de autonomía o requiere supervisión'
        });

        return this._generarResultado(siniestroId, pipeline, inicio, false, 'pendiente_aprobacion');
      }

    } catch (err) {
      logger.error(`❌ [Orquestador] Error procesando siniestro ${siniestroId}:`, err);
      await this._actualizarEstado(siniestroId, 'en_analisis', 'orquestador');
      throw err;
    }
  }

  /**
   * Ejecutar un agente individual y registrar la tarea
   */
  async _ejecutarAgente(nombreAgente, siniestroId, input) {
    const tareaId = uuid();
    const inicio = Date.now();

    try {
      await db('tareas_agente').insert({
        id: tareaId,
        siniestro_id: siniestroId,
        agente: nombreAgente,
        tarea: `${nombreAgente}_procesamiento`,
        estado: 'en_proceso',
        input: JSON.stringify(input),
        modelo_ia: this.modelo
      });

      const agente = this.agentes[nombreAgente];
      if (!agente) throw new Error(`Agente "${nombreAgente}" no encontrado`);

      const resultado = await agente.ejecutar(input);
      const duracion = Date.now() - inicio;

      await db('tareas_agente').where('id', tareaId).update({
        estado: 'completada',
        output: JSON.stringify(resultado.output),
        razonamiento: resultado.razonamiento,
        tokens_usados: resultado.tokens || 0,
        duracion_ms: duracion,
        coste_api: resultado.coste || 0
      });

      logger.info(`  ✓ [${nombreAgente}] completado en ${duracion}ms`);
      return { agente: nombreAgente, output: resultado.output, duracion };

    } catch (err) {
      await db('tareas_agente').where('id', tareaId).update({
        estado: 'fallida',
        output: JSON.stringify({ error: err.message }),
        duracion_ms: Date.now() - inicio
      });
      logger.error(`  ✗ [${nombreAgente}] error: ${err.message}`);
      throw err;
    }
  }

  async _cargarContexto(siniestroId, empresaId) {
    const siniestro = await db('siniestros').where('id', siniestroId).first();
    const empresa = await db('empresas').where('id', empresaId).first();
    const poliza = siniestro.poliza_id ? await db('polizas').where('id', siniestro.poliza_id).first() : null;
    const cliente = siniestro.cliente_id ? await db('usuarios').where('id', siniestro.cliente_id).first() : null;
    const documentos = await db('documentos').where('siniestro_id', siniestroId);
    
    // Historial del cliente (siniestros anteriores)
    const historial_cliente = siniestro.cliente_id 
      ? await db('siniestros')
          .where('cliente_id', siniestro.cliente_id)
          .whereNot('id', siniestroId)
          .orderBy('created_at', 'desc')
          .limit(10)
      : [];

    // Parsear JSONBs
    if (empresa) empresa.limites_autonomia = typeof empresa.limites_autonomia === 'string' ? JSON.parse(empresa.limites_autonomia) : empresa.limites_autonomia;
    if (poliza) {
      poliza.coberturas = typeof poliza.coberturas === 'string' ? JSON.parse(poliza.coberturas) : poliza.coberturas;
      poliza.datos_bien_asegurado = typeof poliza.datos_bien_asegurado === 'string' ? JSON.parse(poliza.datos_bien_asegurado) : poliza.datos_bien_asegurado;
    }

    return { siniestro, empresa, poliza, cliente, documentos, historial_cliente };
  }

  async _actualizarEstado(siniestroId, nuevoEstado, cambiado_por) {
    const actual = await db('siniestros').where('id', siniestroId).select('estado').first();
    await db('siniestros').where('id', siniestroId).update({ estado: nuevoEstado });
    await db('historial_estados').insert({
      id: uuid(),
      siniestro_id: siniestroId,
      estado_anterior: actual?.estado,
      estado_nuevo: nuevoEstado,
      cambiado_por
    });
  }

  async _asignarPerito(siniestroId, contexto) {
    const provincia = contexto.poliza?.datos_bien_asegurado?.provincia || 'Madrid';
    const perito = await db('peritos')
      .where('disponible', true)
      .whereRaw(`zona_cobertura->'provincias' @> '"${provincia}"'`)
      .where('capacidad_actual', '<', db.raw('capacidad_maxima'))
      .orderBy('valoracion_media', 'desc')
      .first();
    
    if (perito) {
      await db('peritos').where('id', perito.id).increment('capacidad_actual', 1);
    }
    return perito;
  }

  async _buscarTalleres(contexto) {
    const provincia = contexto.poliza?.datos_bien_asegurado?.provincia || 'Madrid';
    return db('talleres')
      .where('activo', true)
      .where('provincia', provincia)
      .orderByRaw('concertado DESC, valoracion_media DESC')
      .limit(5);
  }

  _generarResultado(siniestroId, pipeline, inicio, autoResuelto, estado) {
    return {
      siniestro_id: siniestroId,
      auto_resuelto: autoResuelto,
      estado,
      agentes_ejecutados: pipeline.length,
      agentes: pipeline.map(p => ({ nombre: p.agente, duracion_ms: p.duracion })),
      tiempo_total_ms: Date.now() - inicio,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new Orquestador();
