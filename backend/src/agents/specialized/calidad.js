const AgenteBase = require('./base');

class AgenteCalidad extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'calidad'); }

  async ejecutar(input) {
    const output = {
      encuesta_programada: true,
      tipo_encuesta: 'post_resolucion',
      canal: 'email',
      plazo_envio: '24 horas',
      preguntas: [
        { id: 1, texto: '¿Cómo valoraría la rapidez de la resolución?', tipo: 'escala_1_10' },
        { id: 2, texto: '¿La comunicación fue clara y frecuente?', tipo: 'escala_1_10' },
        { id: 3, texto: '¿Está satisfecho con el importe de la indemnización?', tipo: 'escala_1_10' },
        { id: 4, texto: '¿Recomendaría SegurCaixa Adeslas?', tipo: 'nps_0_10' },
        { id: 5, texto: '¿Tiene algún comentario adicional?', tipo: 'texto_libre' }
      ],
      metricas_proceso: {
        tiempo_resolucion_ms: input.tiempo_resolucion,
        canal_entrada: input.siniestro?.canal_entrada,
        auto_resuelto: true
      }
    };

    return { output, razonamiento: 'Encuesta de calidad programada automáticamente', tokens: 0, coste: 0 };
  }
}
module.exports = AgenteCalidad;
