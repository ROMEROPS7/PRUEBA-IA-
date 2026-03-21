const express = require('express');
const router = express.Router();
const { tokenOpcional, verificarToken, requiereRol } = require('../middleware/auth');

// --- Services ---
const webhookService = require('../services/webhookService');
const rulesEngine = require('../services/rulesEngine');
const templateService = require('../services/templateService');
const slaService = require('../services/slaService');
const blockchainService = require('../services/blockchainService');
const voiceBiometricService = require('../services/voiceBiometricService');
const callQueueService = require('../services/callQueueService');
const learningService = require('../services/learningService');
const permissionsService = require('../services/permissionsService');
const tenantModule = require('../middleware/tenant');
const onboardingService = require('../services/onboardingService');
const reparadoresService = require('../services/reparadoresService');
const saasPanelData = require('../saas-panel-data');
const complianceService = require('../services/complianceService');
const competenciaService = require('../services/competenciaService');
const polizasService = require('../services/polizasService');
const cotizacionService = require('../services/cotizacionService');
const peritacionVirtualService = require('../services/peritacionVirtualService');
const logService = require('../services/logService');
const fraudeService = require('../services/fraudeService');
const mainAgent = require('../agents/mainAgent');
const whatsappService = require('../services/whatsappService');
const voiceService = require('../services/voiceService');

// --- Agents ---
const negociadorAgent = require('../agents/negociadorAgent');
const vendedorAgent = require('../agents/vendedorAgent');
const vigilanteAgent = require('../agents/vigilanteAgent');
const rechazosAgent = require('../agents/rechazosAgent');
const retencionAgent = require('../agents/retencionAgent');
const recobroAgent = require('../agents/recobroAgent');
const subrogacionAgent = require('../agents/subrogacionAgent');
const investigacionAgent = require('../agents/investigacionAgent');
const npsAgent = require('../agents/npsAgent');
const riesgoAgent = require('../agents/riesgoAgent');

// Helper: standard error handler (log internally, return generic message)
function handleError(req, res, err) {
  logService.log('ERROR', 'api', err.message, { url: req.url });
  res.status(500).json({ error: 'Error interno del servidor' });
}

// ============================================================
// ANTI-FRAUDE
// ============================================================

router.post('/fraude/analizar/:siniestroId', verificarToken, async (req, res) => {
  try {
    const resultado = await fraudeService.analizarSiniestro(req.params.siniestroId);
    const io = req.app.get('io');
    io?.emit('fraude:analisis', resultado);
    const blockchainSvc = require('../services/blockchainService');
    blockchainSvc.recordDecision('deteccion_fraude', { siniestroId: req.params.siniestroId, score: resultado.score_final }, req.usuario?.id || 'sistema');
    res.json(resultado);
  } catch (err) { handleError(req, res, err); }
});

// ============================================================
// AGENTE IA (main)
// ============================================================

router.post('/agente/clasificar/:siniestroId', verificarToken, async (req, res) => {
  try {
    const resultado = await mainAgent.clasificarSiniestro(req.params.siniestroId);
    req.app.get('io')?.emit('agente:clasificacion', resultado);
    logService.logAgentAction('mainAgent', 'clasificar', { siniestroId: req.params.siniestroId, resultado });
    res.json(resultado);
  } catch (err) { handleError(req, res, err); }
});

router.post('/agente/consultar', verificarToken, async (req, res) => {
  try {
    const respuesta = await mainAgent.consultar(req.body.prompt, req.body.contexto);
    res.json({ respuesta });
  } catch (err) { handleError(req, res, err); }
});

router.get('/agente/resumen/:siniestroId', tokenOpcional, async (req, res) => {
  try { res.json(await mainAgent.generarResumen(req.params.siniestroId)); }
  catch (err) { handleError(req, res, err); }
});

router.post('/agente/chat/:siniestroId', verificarToken, async (req, res) => {
  try {
    const respuesta = await mainAgent.procesarChat(req.params.siniestroId, req.body.mensaje, req.body.usuario || 'Usuario');
    req.app.get('io')?.emit('chat:respuesta', { siniestroId: req.params.siniestroId, respuesta });
    res.json({ respuesta });
  } catch (err) { handleError(req, res, err); }
});

// ============================================================
// WEBHOOKS TWILIO
// ============================================================

router.post('/whatsapp/webhook', (req, res) => whatsappService.handleWebhook(req, res));
router.post('/voz/entrante', (req, res) => voiceService.handleLlamadaEntrante(req, res));
router.post('/voz/procesar-input', (req, res) => voiceService.handleProcesarInput(req, res));

// ============================================================
// WEBHOOKS (app webhooks)
// ============================================================

router.get('/webhooks', tokenOpcional, (req, res) => {
  try {
    res.json(webhookService.list(req.query.tenantId || 'default'));
  } catch (err) { handleError(req, res, err); }
});

router.post('/webhooks', verificarToken, (req, res) => {
  try {
    const { url, events, secret } = req.body;
    const wh = webhookService.register(req.query.tenantId || 'default', url, events, secret);
    res.status(201).json(wh);
  } catch (err) { handleError(req, res, err); }
});

router.delete('/webhooks/:id', verificarToken, requiereRol('admin'), (req, res) => {
  try {
    const ok = webhookService.unregister(req.params.id);
    res.json({ eliminado: ok });
  } catch (err) { handleError(req, res, err); }
});

router.get('/webhooks/:id/log', tokenOpcional, (req, res) => {
  try {
    res.json(webhookService.getDeliveryLog(req.params.id));
  } catch (err) { handleError(req, res, err); }
});

// ============================================================
// RULES ENGINE
// ============================================================

router.get('/rules', tokenOpcional, (req, res) => {
  try { res.json(rulesEngine.listRules()); }
  catch (err) { handleError(req, res, err); }
});

router.post('/rules', verificarToken, (req, res) => {
  try { res.status(201).json(rulesEngine.addRule(req.body)); }
  catch (err) { handleError(req, res, err); }
});

router.put('/rules/:id', verificarToken, (req, res) => {
  try { res.json(rulesEngine.updateRule(req.params.id, req.body)); }
  catch (err) { handleError(req, res, err); }
});

router.delete('/rules/:id', verificarToken, requiereRol('admin'), (req, res) => {
  try { rulesEngine.deleteRule(req.params.id); res.json({ eliminado: true }); }
  catch (err) { handleError(req, res, err); }
});

router.post('/rules/:id/test', verificarToken, (req, res) => {
  try { res.json(rulesEngine.testRule(req.params.id, req.body)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/rules/stats', tokenOpcional, (req, res) => {
  try { res.json(rulesEngine.getRuleStats()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// TEMPLATES
// ============================================================

router.get('/templates', tokenOpcional, (req, res) => {
  try { res.json(templateService.listTemplates(req.query)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/templates/history', tokenOpcional, (req, res) => {
  try { res.json(templateService.getHistory(req.query)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/templates/:id', tokenOpcional, (req, res) => {
  try {
    const t = templateService.getTemplate(req.params.id);
    if (!t) return res.status(404).json({ error: 'Template no encontrado' });
    res.json(t);
  } catch (err) { handleError(req, res, err); }
});

router.post('/templates', verificarToken, (req, res) => {
  try { res.status(201).json(templateService.createTemplate(req.body)); }
  catch (err) { handleError(req, res, err); }
});

router.put('/templates/:id', verificarToken, (req, res) => {
  try {
    const t = templateService.updateTemplate(req.params.id, req.body);
    if (!t) return res.status(404).json({ error: 'Template no encontrado' });
    res.json(t);
  } catch (err) { handleError(req, res, err); }
});

router.post('/templates/:id/preview', tokenOpcional, (req, res) => {
  try {
    const rendered = templateService.preview(req.params.id, req.body);
    if (!rendered) return res.status(404).json({ error: 'Template no encontrado' });
    res.json({ rendered });
  } catch (err) { handleError(req, res, err); }
});

router.post('/templates/:id/send', verificarToken, (req, res) => {
  try {
    const rendered = templateService.render(req.params.id, req.body.data || {});
    if (!rendered) return res.status(404).json({ error: 'Template no encontrado' });
    templateService.logSend(req.params.id, req.body.recipientId || 'unknown', req.body.channel || 'email', rendered);
    res.json({ enviado: true, contenido: rendered });
  } catch (err) { handleError(req, res, err); }
});

// ============================================================
// SLAs
// ============================================================

router.get('/sla', tokenOpcional, (req, res) => {
  try { res.json(slaService.listSLAs()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/sla/dashboard', tokenOpcional, (req, res) => {
  try { res.json(slaService.getSLADashboard()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/sla/breaches', tokenOpcional, (req, res) => {
  try { res.json(slaService.getBreaches()); }
  catch (err) { handleError(req, res, err); }
});

router.post('/sla', verificarToken, (req, res) => {
  try { res.status(201).json(slaService.addSLA(req.body)); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// BLOCKCHAIN AUDIT
// ============================================================

router.get('/audit/chain', tokenOpcional, (req, res) => {
  try {
    const { limit, offset } = req.query;
    res.json(blockchainService.getChain(parseInt(limit) || 50, parseInt(offset) || 0));
  } catch (err) { handleError(req, res, err); }
});

router.get('/audit/verify/:expedienteId', tokenOpcional, (req, res) => {
  try { res.json(blockchainService.verifyExpediente(req.params.expedienteId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/audit/stats', tokenOpcional, (req, res) => {
  try { res.json(blockchainService.getChainStats()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/audit/verify', tokenOpcional, (req, res) => {
  try { res.json({ integridad: blockchainService.verifyChain(), bloques: blockchainService.getChainStats() }); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// VOICE BIOMETRIC
// ============================================================

router.post('/biometric/enroll', verificarToken, (req, res) => {
  try { res.json(voiceBiometricService.enrollVoice(req.body.clienteId, req.body.audioData || 'demo-audio')); }
  catch (err) { handleError(req, res, err); }
});

router.post('/biometric/identify', verificarToken, (req, res) => {
  try { res.json(voiceBiometricService.identifyVoice(req.body.audioData || 'demo-audio') || { identified: false }); }
  catch (err) { handleError(req, res, err); }
});

router.post('/biometric/verify', verificarToken, (req, res) => {
  try { res.json(voiceBiometricService.verifyVoice(req.body.clienteId, req.body.audioData || 'demo-audio')); }
  catch (err) { handleError(req, res, err); }
});

router.get('/biometric/enrolled', tokenOpcional, (req, res) => {
  try { res.json(voiceBiometricService.getEnrolledClients()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// CALL QUEUE
// ============================================================

router.get('/callqueue', tokenOpcional, (req, res) => {
  try { res.json(callQueueService.getQueueStatus()); }
  catch (err) { handleError(req, res, err); }
});

router.post('/callqueue', verificarToken, (req, res) => {
  try { res.json(callQueueService.addToQueue(req.body.clienteId, req.body.telefono, req.body.nombre, req.body.tipo, req.body.prioridad)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/callqueue/metrics', tokenOpcional, (req, res) => {
  try { res.json(callQueueService.getQueueMetrics()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// LEARNING
// ============================================================

router.get('/learning/report', tokenOpcional, (req, res) => {
  try { res.json(learningService.getWeeklyReport()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/learning/accuracy', tokenOpcional, (req, res) => {
  try { res.json(learningService.getAccuracyHistory()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/learning/evolution', tokenOpcional, (req, res) => {
  try { res.json(learningService.getEvolutionData()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/learning/patterns', tokenOpcional, (req, res) => {
  try { res.json(learningService.detectPatterns()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// PERMISSIONS
// ============================================================

router.get('/permissions/:userId', tokenOpcional, (req, res) => {
  try { res.json(permissionsService.getPermissions(req.params.userId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/permissions/role/:role', tokenOpcional, (req, res) => {
  try { res.json(permissionsService.getRolePermissions(req.params.role)); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// TENANTS
// ============================================================

router.get('/tenants', tokenOpcional, (req, res) => {
  try { res.json(tenantModule.listTenants()); }
  catch (err) { handleError(req, res, err); }
});

router.post('/tenants', verificarToken, requiereRol('admin'), (req, res) => {
  try { res.status(201).json(tenantModule.createTenant(req.body)); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// AGENTE NEGOCIADOR
// ============================================================

router.post('/agentes/negociador/iniciar/:siniestroId', verificarToken, async (req, res) => {
  try {
    const tipoServicio = req.body.tipoServicio || 'taller';
    const zona = req.body.zona || 'Madrid';
    const resultado = await negociadorAgent.simulateNegotiation(req.params.siniestroId, tipoServicio, zona);
    req.app.get('io')?.emit('feed:actividad', { agente: 'Negociador', texto: `Negociacion completada: ahorro ${resultado.ahorro_euros}€ en ${resultado.proveedor_ganador}`, timestamp: new Date().toISOString() });
    logService.logAgentAction('negociador', 'negociacion', { siniestroId: req.params.siniestroId, ahorro: resultado.ahorro_euros });
    res.json(resultado);
  } catch (err) { handleError(req, res, err); }
});

router.get('/agentes/negociador/historial', tokenOpcional, (req, res) => {
  try { res.json(negociadorAgent.getHistorialNegociaciones()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/negociador/ahorro-total', tokenOpcional, (req, res) => {
  try { res.json(negociadorAgent.getAhorroTotal()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/negociador/proveedores', tokenOpcional, (req, res) => {
  try { res.json(negociadorAgent.getProveedores(req.query.tipo, req.query.zona)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/negociador/ranking', tokenOpcional, (req, res) => {
  try { res.json(negociadorAgent.getRankingProveedores(req.query.tipo)); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// AGENTE VENDEDOR
// ============================================================

router.post('/agentes/vendedor/contactar/:leadId', verificarToken, async (req, res) => {
  try {
    const resultado = await vendedorAgent.simulateVentaCall(req.params.leadId);
    req.app.get('io')?.emit('feed:actividad', { agente: 'Vendedor', texto: `Llamada de venta completada: ${resultado.resultado || 'procesado'}`, timestamp: new Date().toISOString() });
    logService.logAgentAction('vendedor', 'llamada_venta', { leadId: req.params.leadId });
    res.json(resultado);
  } catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vendedor/pipeline', tokenOpcional, (req, res) => {
  try { res.json(vendedorAgent.getPipeline()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vendedor/ventas-mes', tokenOpcional, (req, res) => {
  try { res.json(vendedorAgent.getVentasMes()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vendedor/renovaciones', tokenOpcional, (req, res) => {
  try { res.json(vendedorAgent.getRenovaciones()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vendedor/conversion', tokenOpcional, (req, res) => {
  try { res.json(vendedorAgent.getConversion()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vendedor/comparativa', tokenOpcional, (req, res) => {
  try { res.json(vendedorAgent.getComparativaHumano()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// AGENTE VIGILANTE
// ============================================================

router.get('/agentes/vigilante/alertas-activas', tokenOpcional, (req, res) => {
  try { res.json(vigilanteAgent.getAlertasActivas()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vigilante/acciones-hoy', tokenOpcional, (req, res) => {
  try { res.json(vigilanteAgent.getAccionesHoy()); }
  catch (err) { handleError(req, res, err); }
});

router.post('/agentes/vigilante/resolver-alerta/:alertaId', verificarToken, (req, res) => {
  try {
    const result = vigilanteAgent.resolverAlerta(req.params.alertaId, req.body.accion || 'Resuelto manualmente');
    res.json(result);
  } catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vigilante/estadisticas', tokenOpcional, (req, res) => {
  try { res.json(vigilanteAgent.getEstadisticas()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vigilante/semaforo', tokenOpcional, (req, res) => {
  try { res.json(vigilanteAgent.getSemaforoSiniestros()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/vigilante/feed', tokenOpcional, (req, res) => {
  try { res.json(vigilanteAgent.feedActividad || []); }
  catch (err) { handleError(req, res, err); }
});

router.post('/agentes/vigilante/monitorear', verificarToken, async (req, res) => {
  try {
    const resultado = await vigilanteAgent.monitorear();
    req.app.get('io')?.emit('feed:actividad', { agente: 'Vigilante', texto: `Monitoreo completado: ${resultado.length} alertas detectadas`, timestamp: new Date().toISOString() });
    res.json(resultado);
  } catch (err) { handleError(req, res, err); }
});

// ============================================================
// POLIZAS
// ============================================================

router.get('/polizas/productos/all', tokenOpcional, (req, res) => {
  try { res.json(polizasService.getProductos()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/polizas/:clienteId', tokenOpcional, (req, res) => {
  try { res.json(polizasService.getPolizasCliente(req.params.clienteId)); }
  catch (err) { handleError(req, res, err); }
});

router.post('/polizas/verificar-cobertura', verificarToken, (req, res) => {
  try { res.json(polizasService.verificarCobertura(req.body.clienteId, req.body.tipoSiniestro, req.body.importeEstimado)); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// RECHAZOS
// ============================================================

router.post('/agentes/rechazos/procesar/:siniestroId', verificarToken, (req, res) => {
  try { res.json(rechazosAgent.procesarRechazo(req.params.siniestroId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/rechazos/historial', tokenOpcional, (req, res) => {
  try { res.json(rechazosAgent.getHistorial()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/rechazos/estadisticas', tokenOpcional, (req, res) => {
  try { res.json(rechazosAgent.getEstadisticas()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// PERITACION VIRTUAL
// ============================================================

router.post('/peritacion-virtual/iniciar/:siniestroId', verificarToken, (req, res) => {
  try { res.json(peritacionVirtualService.iniciarPeritacion(req.params.siniestroId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/peritacion-virtual/informe/:siniestroId', tokenOpcional, (req, res) => {
  try {
    const r = peritacionVirtualService.generarInforme(req.params.siniestroId);
    res.json(r || { error: 'No encontrado' });
  } catch (err) { handleError(req, res, err); }
});

router.get('/peritacion-virtual/ahorro', tokenOpcional, (req, res) => {
  try { res.json(peritacionVirtualService.getAhorro()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// RETENCION
// ============================================================

router.get('/agentes/retencion/clientes-riesgo', tokenOpcional, (req, res) => {
  try { res.json(retencionAgent.getClientesRiesgo()); }
  catch (err) { handleError(req, res, err); }
});

router.post('/agentes/retencion/contactar/:clienteId', verificarToken, (req, res) => {
  try { res.json(retencionAgent.contactarCliente(req.params.clienteId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/retencion/estadisticas', tokenOpcional, (req, res) => {
  try { res.json(retencionAgent.getEstadisticas()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// COTIZACION
// ============================================================

router.post('/cotizacion/calcular', verificarToken, (req, res) => {
  try { res.json(cotizacionService.calcularPrima(req.body)); }
  catch (err) { handleError(req, res, err); }
});

router.post('/cotizacion/emitir-poliza', verificarToken, (req, res) => {
  try { res.json(cotizacionService.emitirPoliza(req.body)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/cotizacion/productos-disponibles', tokenOpcional, (req, res) => {
  try { res.json(cotizacionService.getProductosDisponibles()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/cotizacion/estadisticas', tokenOpcional, (req, res) => {
  try { res.json(cotizacionService.getEstadisticas()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// RECOBRO
// ============================================================

router.get('/agentes/recobro/impagados', tokenOpcional, (req, res) => {
  try { res.json(recobroAgent.getImpagados()); }
  catch (err) { handleError(req, res, err); }
});

router.post('/agentes/recobro/iniciar-proceso/:clienteId', verificarToken, (req, res) => {
  try { res.json(recobroAgent.iniciarProceso(req.params.clienteId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/recobro/estadisticas', tokenOpcional, (req, res) => {
  try { res.json(recobroAgent.getEstadisticas()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// SUBROGACION
// ============================================================

router.get('/agentes/subrogacion/casos-activos', tokenOpcional, (req, res) => {
  try { res.json(subrogacionAgent.getCasosActivos()); }
  catch (err) { handleError(req, res, err); }
});

router.post('/agentes/subrogacion/iniciar/:siniestroId', verificarToken, (req, res) => {
  try { res.json(subrogacionAgent.iniciarSubrogacion(req.params.siniestroId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/subrogacion/recuperado-mes', tokenOpcional, (req, res) => {
  try { res.json(subrogacionAgent.getRecuperadoMes()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/subrogacion/estadisticas', tokenOpcional, (req, res) => {
  try { res.json(subrogacionAgent.getEstadisticas()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// INVESTIGACION
// ============================================================

router.post('/agentes/investigacion/analizar/:siniestroId', verificarToken, (req, res) => {
  try { res.json(investigacionAgent.analizarAccidente(req.params.siniestroId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/investigacion/informe/:siniestroId', tokenOpcional, (req, res) => {
  try { res.json(investigacionAgent.generarInforme(req.params.siniestroId)); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// NPS
// ============================================================

router.get('/agentes/nps/puntuaciones', tokenOpcional, (req, res) => {
  try { res.json(npsAgent.getPuntuaciones()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/nps/informe-mensual', tokenOpcional, (req, res) => {
  try { res.json(npsAgent.getInformeMensual()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/nps/clientes-insatisfechos', tokenOpcional, (req, res) => {
  try { res.json(npsAgent.getClientesInsatisfechos()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/nps/evolucion', tokenOpcional, (req, res) => {
  try { res.json(npsAgent.getEvolucion()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// COMPLIANCE
// ============================================================

router.get('/compliance/informe-regulatorio', tokenOpcional, (req, res) => {
  try { res.json(complianceService.getInformeRegulatorio()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/compliance/alertas-activas', tokenOpcional, (req, res) => {
  try { res.json(complianceService.getAlertasActivas()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/compliance/checklist/:siniestroId', tokenOpcional, (req, res) => {
  try { res.json(complianceService.checklistSiniestro(req.params.siniestroId)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/compliance/estadisticas', tokenOpcional, (req, res) => {
  try { res.json(complianceService.getEstadisticas()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// COMPETENCIA
// ============================================================

router.get('/competencia/analisis', tokenOpcional, (req, res) => {
  try { res.json(competenciaService.getAnalisis()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/competencia/alertas', tokenOpcional, (req, res) => {
  try { res.json(competenciaService.getAlertas()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/competencia/recomendaciones', tokenOpcional, (req, res) => {
  try { res.json(competenciaService.getRecomendaciones()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// RIESGO
// ============================================================

router.get('/agentes/riesgo/clientes-alto-riesgo', tokenOpcional, (req, res) => {
  try { res.json(riesgoAgent.getClientesAltoRiesgo()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/riesgo/mapa-riesgo', tokenOpcional, (req, res) => {
  try { res.json(riesgoAgent.getMapaRiesgo()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/riesgo/recomendaciones', tokenOpcional, (req, res) => {
  try { res.json(riesgoAgent.getRecomendaciones()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/agentes/riesgo/proyeccion', tokenOpcional, (req, res) => {
  try { res.json(riesgoAgent.getProyeccion()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// ONBOARDING
// ============================================================

router.post('/onboarding/iniciar', verificarToken, (req, res) => {
  try { res.json(onboardingService.iniciarOnboarding(req.body)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/onboarding/progreso/:tenantId', tokenOpcional, (req, res) => {
  try { res.json(onboardingService.getProgreso(req.params.tenantId)); }
  catch (err) { handleError(req, res, err); }
});

router.post('/onboarding/importar-datos', verificarToken, (req, res) => {
  try { res.json(onboardingService.importarDatos(req.body.tenantId, req.body.tipo, req.body.datos)); }
  catch (err) { handleError(req, res, err); }
});

router.get('/onboarding/lista', tokenOpcional, (req, res) => {
  try { res.json(onboardingService.listarOnboardings()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// REPARADORES
// ============================================================

router.get('/reparadores/lista', tokenOpcional, (req, res) => {
  try { res.json(reparadoresService.getReparadores()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/reparadores/casos-asignados/:reparadorId', tokenOpcional, (req, res) => {
  try { res.json(reparadoresService.getCasosAsignados(req.params.reparadorId)); }
  catch (err) { handleError(req, res, err); }
});

router.put('/reparadores/actualizar-estado/:casoId', verificarToken, (req, res) => {
  try { res.json(reparadoresService.actualizarEstado(req.params.casoId, req.body.estado, req.body.fotos, req.body.notas)); }
  catch (err) { handleError(req, res, err); }
});

router.post('/reparadores/subir-presupuesto/:casoId', verificarToken, (req, res) => {
  try { res.json(reparadoresService.subirPresupuesto(req.params.casoId, req.body.lineas)); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// SAAS PANEL
// ============================================================

router.get('/saas/mrr', tokenOpcional, (req, res) => {
  try { res.json(saasPanelData.getMRR()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/saas/uso', tokenOpcional, (req, res) => {
  try { res.json(saasPanelData.getUsoPorCliente()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/saas/alertas', tokenOpcional, (req, res) => {
  try { res.json(saasPanelData.getAlertas()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/saas/facturacion', tokenOpcional, (req, res) => {
  try { res.json(saasPanelData.getFacturacion()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/saas/proyeccion', tokenOpcional, (req, res) => {
  try { res.json(saasPanelData.getProyeccion()); }
  catch (err) { handleError(req, res, err); }
});

router.get('/saas/churn', tokenOpcional, (req, res) => {
  try { res.json(saasPanelData.getChurn()); }
  catch (err) { handleError(req, res, err); }
});

// ============================================================
// v4 SERVICES
// ============================================================
const legacyService = require('../services/legacyIntegrationService');
const firmaService = require('../services/firmaDigitalService');
const pagoService = require('../services/pagoService');
const mlService = require('../services/mlService');
const voiceRecService = require('../services/voiceRecognitionService');
const videoPerService = require('../services/videoPeritacionService');
const contratosService = require('../services/contratosService');

// Legacy integrations
router.post('/integraciones/legacy/sincronizar', verificarToken, (req, res) => { try { res.json(legacyService.sincronizar(req.body.adapterId)); } catch(e) { handleError(req,res,e); } });
router.get('/integraciones/legacy/estado', tokenOpcional, (req, res) => { try { res.json(legacyService.getEstado()); } catch(e) { handleError(req,res,e); } });
router.post('/integraciones/legacy/importar-excel', verificarToken, (req, res) => { try { res.json(legacyService.importarExcel(req.body)); } catch(e) { handleError(req,res,e); } });
router.get('/integraciones/legacy/sync-log', tokenOpcional, (req, res) => { try { res.json(legacyService.getSyncLog()); } catch(e) { handleError(req,res,e); } });

// Firma digital
router.post('/firma/solicitar/:documentoId', verificarToken, (req, res) => { try { res.json(firmaService.solicitarFirma(req.params.documentoId, req.body.clienteId)); } catch(e) { handleError(req,res,e); } });
router.get('/firma/verificar/:firmaId', tokenOpcional, (req, res) => { try { res.json(firmaService.verificarFirma(req.params.firmaId)); } catch(e) { handleError(req,res,e); } });
router.get('/firma/documentos/:clienteId', tokenOpcional, (req, res) => { try { res.json(firmaService.getDocumentos(req.params.clienteId)); } catch(e) { handleError(req,res,e); } });
router.get('/firma/estadisticas', tokenOpcional, (req, res) => { try { res.json(firmaService.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Pagos
router.post('/pagos/indemnizacion', verificarToken, (req, res) => { try { res.json(pagoService.procesarIndemnizacion(req.body.siniestroId, req.body.importe, req.body.iban)); } catch(e) { handleError(req,res,e); } });
router.post('/pagos/prima', verificarToken, (req, res) => { try { res.json(pagoService.cobrarPrima(req.body.clienteId, req.body.polizaId, req.body.importe)); } catch(e) { handleError(req,res,e); } });
router.get('/pagos/historial/:clienteId', tokenOpcional, (req, res) => { try { res.json(pagoService.getHistorial(req.params.clienteId)); } catch(e) { handleError(req,res,e); } });
router.get('/pagos/tesoreria/dashboard', tokenOpcional, (req, res) => { try { res.json(pagoService.getDashboardTesoreria()); } catch(e) { handleError(req,res,e); } });

// ML
router.get('/ml/estadisticas/:tenantId', tokenOpcional, (req, res) => { try { res.json(mlService.getEstadisticas(req.params.tenantId)); } catch(e) { handleError(req,res,e); } });
router.post('/ml/entrenar/:tenantId', verificarToken, (req, res) => { try { res.json(mlService.entrenar(req.params.tenantId)); } catch(e) { handleError(req,res,e); } });
router.get('/ml/predicciones/:siniestroId', tokenOpcional, (req, res) => { try { res.json(mlService.getPredicciones(req.params.siniestroId)); } catch(e) { handleError(req,res,e); } });
router.get('/ml/evolucion/:tenantId', tokenOpcional, (req, res) => { try { res.json(mlService.getEvolucion(req.params.tenantId)); } catch(e) { handleError(req,res,e); } });

// Voice recognition
router.post('/voz/identificar', verificarToken, (req, res) => { try { res.json(voiceRecService.identificarPorVoz(req.body.audioData)); } catch(e) { handleError(req,res,e); } });
router.post('/voz/emocion', verificarToken, (req, res) => { try { res.json(voiceRecService.analizarEmocion(req.body.audioData)); } catch(e) { handleError(req,res,e); } });
router.get('/voz/estadisticas', tokenOpcional, (req, res) => { try { res.json(voiceRecService.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Video peritacion
router.post('/videoperitacion/iniciar/:siniestroId', verificarToken, (req, res) => { try { res.json(videoPerService.iniciarSesion(req.params.siniestroId)); } catch(e) { handleError(req,res,e); } });
router.post('/videoperitacion/analizar-frame', verificarToken, (req, res) => { try { res.json(videoPerService.analizarFrame(req.body.sessionId, req.body.imageData)); } catch(e) { handleError(req,res,e); } });
router.get('/videoperitacion/informe/:siniestroId', tokenOpcional, (req, res) => { try { res.json(videoPerService.generarInforme(req.params.siniestroId)); } catch(e) { handleError(req,res,e); } });
router.get('/videoperitacion/ahorro', tokenOpcional, (req, res) => { try { res.json(videoPerService.getAhorro()); } catch(e) { handleError(req,res,e); } });

// Contratos
router.post('/contratos/generar', verificarToken, (req, res) => { try { res.json(contratosService.generar(req.body.tipo, req.body)); } catch(e) { handleError(req,res,e); } });
router.get('/contratos/estado/:contratoId', tokenOpcional, (req, res) => { try { res.json(contratosService.getEstado(req.params.contratoId)); } catch(e) { handleError(req,res,e); } });
router.get('/contratos/lista', tokenOpcional, (req, res) => { try { res.json(contratosService.listar()); } catch(e) { handleError(req,res,e); } });
router.get('/contratos/estadisticas', tokenOpcional, (req, res) => { try { res.json(contratosService.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// ============================================================
// DEPARTAMENTOS AUTONOMOS + JUNTA DIRECTIVA
// ============================================================
const rrhhAgent = require('../agents/rrhhAgent');
const financieroAgent = require('../agents/financieroAgent');
const legalAgentDept = require('../agents/legalAgent');
const marketingAgent = require('../agents/marketingAgent');
const itAgent = require('../agents/itAgent');
const comprasAgent = require('../agents/comprasAgent');
const ceoAgent = require('../agents/ceoAgent');
const boardAgent = require('../agents/boardAgent');
const crisisAgent = require('../agents/crisisAgent');
const expansionAgent = require('../agents/expansionAgent');
const innovacionAgent = require('../agents/innovacionAgent');

// RRHH
router.get('/rrhh/estadisticas', tokenOpcional, (req, res) => { try { res.json(rrhhAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });
router.get('/rrhh/nominas', tokenOpcional, (req, res) => { try { res.json(rrhhAgent.getNominas(req.query.mes)); } catch(e) { handleError(req,res,e); } });
router.get('/rrhh/evaluaciones', tokenOpcional, (req, res) => { try { res.json(rrhhAgent.getEvaluaciones()); } catch(e) { handleError(req,res,e); } });
router.get('/rrhh/vacaciones', tokenOpcional, (req, res) => { try { res.json(rrhhAgent.getVacaciones(req.query.mes)); } catch(e) { handleError(req,res,e); } });
router.get('/rrhh/formaciones', tokenOpcional, (req, res) => { try { res.json(rrhhAgent.getFormaciones()); } catch(e) { handleError(req,res,e); } });
router.get('/rrhh/organigrama', tokenOpcional, (req, res) => { try { res.json(rrhhAgent.getOrganigrama()); } catch(e) { handleError(req,res,e); } });
router.get('/rrhh/coste-productividad', tokenOpcional, (req, res) => { try { res.json(rrhhAgent.getCosteVsProductividad()); } catch(e) { handleError(req,res,e); } });

// Finanzas
router.get('/finanzas/balance', tokenOpcional, (req, res) => { try { res.json(financieroAgent.getBalance()); } catch(e) { handleError(req,res,e); } });
router.get('/finanzas/pyl', tokenOpcional, (req, res) => { try { res.json(financieroAgent.getPyL()); } catch(e) { handleError(req,res,e); } });
router.get('/finanzas/cashflow', tokenOpcional, (req, res) => { try { res.json(financieroAgent.getCashflow()); } catch(e) { handleError(req,res,e); } });
router.get('/finanzas/presupuesto', tokenOpcional, (req, res) => { try { res.json(financieroAgent.getPresupuesto()); } catch(e) { handleError(req,res,e); } });
router.get('/finanzas/impuestos', tokenOpcional, (req, res) => { try { res.json(financieroAgent.getImpuestos()); } catch(e) { handleError(req,res,e); } });
router.get('/finanzas/inversiones', tokenOpcional, (req, res) => { try { res.json(financieroAgent.getInversiones()); } catch(e) { handleError(req,res,e); } });
router.get('/finanzas/salud', tokenOpcional, (req, res) => { try { res.json(financieroAgent.getSaludFinanciera()); } catch(e) { handleError(req,res,e); } });
router.get('/finanzas/estadisticas', tokenOpcional, (req, res) => { try { res.json(financieroAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Legal
router.get('/legal/contratos', tokenOpcional, (req, res) => { try { res.json(legalAgentDept.getContratosLegales()); } catch(e) { handleError(req,res,e); } });
router.get('/legal/litigios', tokenOpcional, (req, res) => { try { res.json(legalAgentDept.getLitigios()); } catch(e) { handleError(req,res,e); } });
router.get('/legal/alertas', tokenOpcional, (req, res) => { try { res.json(legalAgentDept.getAlertasLegales()); } catch(e) { handleError(req,res,e); } });
router.get('/legal/acuerdos', tokenOpcional, (req, res) => { try { res.json(legalAgentDept.getAcuerdosExtrajudiciales()); } catch(e) { handleError(req,res,e); } });
router.get('/legal/compliance', tokenOpcional, (req, res) => { try { res.json(legalAgentDept.getComplianceStatus()); } catch(e) { handleError(req,res,e); } });
router.get('/legal/estadisticas', tokenOpcional, (req, res) => { try { res.json(legalAgentDept.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Marketing
router.get('/marketing/campanas', tokenOpcional, (req, res) => { try { res.json(marketingAgent.getCampanas()); } catch(e) { handleError(req,res,e); } });
router.get('/marketing/contenidos', tokenOpcional, (req, res) => { try { res.json(marketingAgent.getContenidos()); } catch(e) { handleError(req,res,e); } });
router.get('/marketing/analytics', tokenOpcional, (req, res) => { try { res.json(marketingAgent.getAnalytics()); } catch(e) { handleError(req,res,e); } });
router.get('/marketing/leads', tokenOpcional, (req, res) => { try { res.json(marketingAgent.getLeadsMarketing()); } catch(e) { handleError(req,res,e); } });
router.get('/marketing/roi', tokenOpcional, (req, res) => { try { res.json(marketingAgent.getROIPorCanal()); } catch(e) { handleError(req,res,e); } });
router.get('/marketing/estadisticas', tokenOpcional, (req, res) => { try { res.json(marketingAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// IT
router.get('/it/estado-sistemas', tokenOpcional, (req, res) => { try { res.json(itAgent.getEstadoSistemas()); } catch(e) { handleError(req,res,e); } });
router.get('/it/incidencias', tokenOpcional, (req, res) => { try { res.json(itAgent.getIncidencias()); } catch(e) { handleError(req,res,e); } });
router.get('/it/seguridad', tokenOpcional, (req, res) => { try { res.json(itAgent.getVulnerabilidades()); } catch(e) { handleError(req,res,e); } });
router.get('/it/metricas', tokenOpcional, (req, res) => { try { res.json(itAgent.getMetricasSistema()); } catch(e) { handleError(req,res,e); } });
router.get('/it/carga', tokenOpcional, (req, res) => { try { res.json(itAgent.getCargaServidor()); } catch(e) { handleError(req,res,e); } });
router.get('/it/costes', tokenOpcional, (req, res) => { try { res.json(itAgent.getCostesInfra()); } catch(e) { handleError(req,res,e); } });
router.get('/it/estadisticas', tokenOpcional, (req, res) => { try { res.json(itAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Compras
router.get('/compras/proveedores', tokenOpcional, (req, res) => { try { res.json(comprasAgent.getProveedoresEmpresa()); } catch(e) { handleError(req,res,e); } });
router.get('/compras/pedidos', tokenOpcional, (req, res) => { try { res.json(comprasAgent.getPedidos()); } catch(e) { handleError(req,res,e); } });
router.get('/compras/gastos', tokenOpcional, (req, res) => { try { res.json(comprasAgent.getGastos(req.query.mes)); } catch(e) { handleError(req,res,e); } });
router.get('/compras/contratos', tokenOpcional, (req, res) => { try { res.json(comprasAgent.getContratosCompras()); } catch(e) { handleError(req,res,e); } });
router.get('/compras/licencias', tokenOpcional, (req, res) => { try { res.json(comprasAgent.getLicencias()); } catch(e) { handleError(req,res,e); } });
router.get('/compras/ahorro', tokenOpcional, (req, res) => { try { res.json(comprasAgent.getAhorroNegociacion()); } catch(e) { handleError(req,res,e); } });
router.get('/compras/estadisticas', tokenOpcional, (req, res) => { try { res.json(comprasAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// CEO
router.get('/ceo/informe-diario', tokenOpcional, (req, res) => { try { res.json(ceoAgent.getInformeDiario()); } catch(e) { handleError(req,res,e); } });
router.get('/ceo/decisiones', tokenOpcional, (req, res) => { try { res.json(ceoAgent.getDecisiones(req.query.periodo)); } catch(e) { handleError(req,res,e); } });
router.get('/ceo/alertas-criticas', tokenOpcional, (req, res) => { try { res.json(ceoAgent.getAlertasCriticas()); } catch(e) { handleError(req,res,e); } });
router.get('/ceo/proyecciones', tokenOpcional, (req, res) => { try { res.json(ceoAgent.getProyecciones()); } catch(e) { handleError(req,res,e); } });
router.get('/ceo/objetivos', tokenOpcional, (req, res) => { try { res.json(ceoAgent.getObjetivosAnuales()); } catch(e) { handleError(req,res,e); } });
router.get('/ceo/estadisticas', tokenOpcional, (req, res) => { try { res.json(ceoAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Board
router.get('/board/reunion-diaria', tokenOpcional, (req, res) => { try { res.json(boardAgent.getReunionDiaria()); } catch(e) { handleError(req,res,e); } });
router.get('/board/decisiones', tokenOpcional, (req, res) => { try { res.json(boardAgent.getDecisiones()); } catch(e) { handleError(req,res,e); } });
router.get('/board/actas', tokenOpcional, (req, res) => { try { res.json(boardAgent.getActas()); } catch(e) { handleError(req,res,e); } });
router.get('/board/directivos', tokenOpcional, (req, res) => { try { res.json(boardAgent.getDirectivos()); } catch(e) { handleError(req,res,e); } });
router.get('/board/votaciones', tokenOpcional, (req, res) => { try { res.json(boardAgent.getVotacionesActivas()); } catch(e) { handleError(req,res,e); } });
router.get('/board/estadisticas', tokenOpcional, (req, res) => { try { res.json(boardAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });
router.post('/board/votar', verificarToken, (req, res) => { try { res.json(boardAgent.votar(req.body.decisionId, req.body.directorId, req.body.voto)); } catch(e) { handleError(req,res,e); } });

// Crisis
router.get('/crisis/activas', tokenOpcional, (req, res) => { try { res.json(crisisAgent.getCrisisActivas()); } catch(e) { handleError(req,res,e); } });
router.get('/crisis/nivel-alerta', tokenOpcional, (req, res) => { try { res.json(crisisAgent.getNivelAlerta()); } catch(e) { handleError(req,res,e); } });
router.get('/crisis/protocolos', tokenOpcional, (req, res) => { try { res.json(crisisAgent.getProtocolos()); } catch(e) { handleError(req,res,e); } });
router.get('/crisis/historial', tokenOpcional, (req, res) => { try { res.json(crisisAgent.getHistorial()); } catch(e) { handleError(req,res,e); } });
router.get('/crisis/estadisticas', tokenOpcional, (req, res) => { try { res.json(crisisAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });
router.post('/crisis/activar-protocolo', verificarToken, (req, res) => { try { res.json(crisisAgent.activarProtocolo(req.body.tipo, req.body.severidad)); } catch(e) { handleError(req,res,e); } });

// Expansion
router.get('/expansion/oportunidades', tokenOpcional, (req, res) => { try { res.json(expansionAgent.getOportunidades()); } catch(e) { handleError(req,res,e); } });
router.get('/expansion/analisis/:pais', tokenOpcional, (req, res) => { try { res.json(expansionAgent.getAnalisisPais(req.params.pais)); } catch(e) { handleError(req,res,e); } });
router.get('/expansion/plan/:pais', tokenOpcional, (req, res) => { try { res.json(expansionAgent.getPlanExpansion(req.params.pais)); } catch(e) { handleError(req,res,e); } });
router.get('/expansion/estadisticas', tokenOpcional, (req, res) => { try { res.json(expansionAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Innovacion
router.get('/innovacion/tendencias', tokenOpcional, (req, res) => { try { res.json(innovacionAgent.getTendencias()); } catch(e) { handleError(req,res,e); } });
router.get('/innovacion/roadmap', tokenOpcional, (req, res) => { try { res.json(innovacionAgent.getRoadmap()); } catch(e) { handleError(req,res,e); } });
router.get('/innovacion/ideas', tokenOpcional, (req, res) => { try { res.json(innovacionAgent.getIdeas()); } catch(e) { handleError(req,res,e); } });
router.get('/innovacion/benchmark', tokenOpcional, (req, res) => { try { res.json(innovacionAgent.getBenchmark()); } catch(e) { handleError(req,res,e); } });
router.get('/innovacion/estadisticas', tokenOpcional, (req, res) => { try { res.json(innovacionAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// ============================================================
// SISTEMA AUTONOMO: EVOLUCION, COORDINACION, CORRECCION
// ============================================================
const autoEvolution = require('../agents/autoEvolutionAgent');
const multiAgent = require('../agents/multiAgentCoordinator');
const errorCorrection = require('../agents/errorCorrectionAgent');
const selfHealing = require('../agents/selfHealingAgent');
const analyticsDeep = require('../agents/analyticsAgent');

// Auto-evolucion
router.get('/evolucion/rendimiento', tokenOpcional, (req, res) => { try { res.json(autoEvolution.analizarRendimiento()); } catch(e) { handleError(req,res,e); } });
router.get('/evolucion/proximas', tokenOpcional, (req, res) => { try { res.json(autoEvolution.getProximasActualizaciones()); } catch(e) { handleError(req,res,e); } });
router.get('/evolucion/historial', tokenOpcional, (req, res) => { try { res.json(autoEvolution.getHistorialEvolucion()); } catch(e) { handleError(req,res,e); } });
router.get('/evolucion/version', tokenOpcional, (req, res) => { try { res.json(autoEvolution.getVersionActual()); } catch(e) { handleError(req,res,e); } });
router.get('/evolucion/roadmap', tokenOpcional, (req, res) => { try { res.json(autoEvolution.getRoadmapAutomatico()); } catch(e) { handleError(req,res,e); } });
router.get('/evolucion/metricas', tokenOpcional, (req, res) => { try { res.json(autoEvolution.getMetricasEvolucion()); } catch(e) { handleError(req,res,e); } });

// Multi-agente coordinacion
router.get('/coordinacion/conversaciones', tokenOpcional, (req, res) => { try { res.json(multiAgent.getConversacionesActivas()); } catch(e) { handleError(req,res,e); } });
router.get('/coordinacion/conflictos', tokenOpcional, (req, res) => { try { res.json(multiAgent.getConflictos()); } catch(e) { handleError(req,res,e); } });
router.get('/coordinacion/agentes', tokenOpcional, (req, res) => { try { res.json(multiAgent.getEstadoAgentes()); } catch(e) { handleError(req,res,e); } });
router.get('/coordinacion/red', tokenOpcional, (req, res) => { try { res.json(multiAgent.getRedComunicacion()); } catch(e) { handleError(req,res,e); } });
router.get('/coordinacion/estadisticas', tokenOpcional, (req, res) => { try { res.json(multiAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });
router.post('/coordinacion/conversacion', verificarToken, (req, res) => { try { res.json(multiAgent.iniciarConversacion(req.body.agentes, req.body.asunto)); } catch(e) { handleError(req,res,e); } });

// Correccion de errores
router.get('/errores/recientes', tokenOpcional, (req, res) => { try { res.json(errorCorrection.getErroresRecientes()); } catch(e) { handleError(req,res,e); } });
router.get('/errores/verificaciones', tokenOpcional, (req, res) => { try { res.json(errorCorrection.getVerificaciones()); } catch(e) { handleError(req,res,e); } });
router.get('/errores/patrones', tokenOpcional, (req, res) => { try { res.json(errorCorrection.getPatronesError()); } catch(e) { handleError(req,res,e); } });
router.get('/errores/precision-agentes', tokenOpcional, (req, res) => { try { res.json(errorCorrection.getPrecisionPorAgente()); } catch(e) { handleError(req,res,e); } });
router.get('/errores/aprendizajes', tokenOpcional, (req, res) => { try { res.json(errorCorrection.getAprendizajes()); } catch(e) { handleError(req,res,e); } });
router.get('/errores/estadisticas', tokenOpcional, (req, res) => { try { res.json(errorCorrection.getEstadisticas()); } catch(e) { handleError(req,res,e); } });
router.post('/errores/verificar', verificarToken, (req, res) => { try { res.json(errorCorrection.verificarDecision(req.body.agenteId, req.body.decision, req.body.contexto)); } catch(e) { handleError(req,res,e); } });

// Self-healing
router.get('/healing/diagnostico', tokenOpcional, (req, res) => { try { res.json(selfHealing.diagnosticar()); } catch(e) { handleError(req,res,e); } });
router.get('/healing/incidentes', tokenOpcional, (req, res) => { try { res.json(selfHealing.getIncidentes()); } catch(e) { handleError(req,res,e); } });
router.get('/healing/preventivas', tokenOpcional, (req, res) => { try { res.json(selfHealing.getAccionesPreventivas()); } catch(e) { handleError(req,res,e); } });
router.get('/healing/historial-salud', tokenOpcional, (req, res) => { try { res.json(selfHealing.getHistorialSalud()); } catch(e) { handleError(req,res,e); } });
router.get('/healing/estadisticas', tokenOpcional, (req, res) => { try { res.json(selfHealing.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Analytics profundo
router.get('/analytics/insights', tokenOpcional, (req, res) => { try { res.json(analyticsDeep.getInsightsDiarios()); } catch(e) { handleError(req,res,e); } });
router.get('/analytics/correlaciones', tokenOpcional, (req, res) => { try { res.json(analyticsDeep.getCorrelaciones()); } catch(e) { handleError(req,res,e); } });
router.get('/analytics/anomalias', tokenOpcional, (req, res) => { try { res.json(analyticsDeep.getAnomalias()); } catch(e) { handleError(req,res,e); } });
router.get('/analytics/predicciones', tokenOpcional, (req, res) => { try { res.json(analyticsDeep.getPrediccionesAvanzadas()); } catch(e) { handleError(req,res,e); } });
router.get('/analytics/oportunidades', tokenOpcional, (req, res) => { try { res.json(analyticsDeep.getOportunidades()); } catch(e) { handleError(req,res,e); } });
router.get('/analytics/dashboard', tokenOpcional, (req, res) => { try { res.json(analyticsDeep.getDashboardInteligente()); } catch(e) { handleError(req,res,e); } });
router.get('/analytics/estadisticas', tokenOpcional, (req, res) => { try { res.json(analyticsDeep.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// ============================================================
// MEMORIA, MENTOR, CANVAS, DAILY NOTES, KNOWLEDGE GRAPH
// ============================================================
const memoriaAgent = require('../agents/memoriaAgent');
const mentorAgent = require('../agents/mentorAgent');
const canvasService = require('../services/canvasService');
const dailyNotes = require('../services/dailyNotesService');
const knowledgeGraph = require('../services/knowledgeGraphService');

// Memoria
router.get('/memoria/cliente/:clienteId', tokenOpcional, async (req, res) => { try { res.json(await memoriaAgent.getMemoriaCliente(req.params.clienteId)); } catch(e) { handleError(req,res,e); } });
router.get('/memoria/briefing/:clienteId', tokenOpcional, async (req, res) => { try { res.json(await memoriaAgent.getBriefingLlamada(req.params.clienteId)); } catch(e) { handleError(req,res,e); } });
router.get('/memoria/contexto/:clienteId', tokenOpcional, async (req, res) => { try { res.json(await memoriaAgent.getContexto(req.params.clienteId)); } catch(e) { handleError(req,res,e); } });
router.get('/memoria/patrones/:clienteId', tokenOpcional, async (req, res) => { try { res.json(await memoriaAgent.getPatronesCliente(req.params.clienteId)); } catch(e) { handleError(req,res,e); } });
router.post('/memoria/recordar', verificarToken, async (req, res) => { try { res.json(await memoriaAgent.recordar(req.body.clienteId, req.body.tipo, req.body.contenido, req.body.meta)); } catch(e) { handleError(req,res,e); } });
router.get('/memoria/buscar', tokenOpcional, async (req, res) => { try { res.json(await memoriaAgent.buscarMemorias(req.query.q)); } catch(e) { handleError(req,res,e); } });
router.get('/memoria/estadisticas', tokenOpcional, async (req, res) => { try { res.json(await memoriaAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Mentor
router.get('/mentor/consejos/:empleadoId', tokenOpcional, async (req, res) => { try { res.json(await mentorAgent.getConsejosTiempoReal(req.params.empleadoId)); } catch(e) { handleError(req,res,e); } });
router.get('/mentor/practicas', tokenOpcional, async (req, res) => { try { res.json(await mentorAgent.getMejoresPracticas()); } catch(e) { handleError(req,res,e); } });
router.get('/mentor/rendimiento/:empleadoId', tokenOpcional, async (req, res) => { try { res.json(await mentorAgent.getRendimientoComparativo(req.params.empleadoId)); } catch(e) { handleError(req,res,e); } });
router.get('/mentor/oportunidades/:empleadoId', tokenOpcional, async (req, res) => { try { res.json(await mentorAgent.detectarOportunidadMejora(req.params.empleadoId)); } catch(e) { handleError(req,res,e); } });
router.post('/mentor/observar', verificarToken, async (req, res) => { try { res.json(await mentorAgent.observarActividad(req.body.empleadoId, req.body.accion, req.body.tiempoMs, req.body.resultado)); } catch(e) { handleError(req,res,e); } });
router.get('/mentor/estadisticas', tokenOpcional, async (req, res) => { try { res.json(await mentorAgent.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Canvas investigacion
router.get('/canvas/boards', tokenOpcional, async (req, res) => { try { res.json(await canvasService.listarBoards()); } catch(e) { handleError(req,res,e); } });
router.get('/canvas/boards/:id', tokenOpcional, async (req, res) => { try { res.json(await canvasService.getBoard(req.params.id)); } catch(e) { handleError(req,res,e); } });
router.post('/canvas/boards', verificarToken, async (req, res) => { try { res.json(await canvasService.crearBoard(req.body.titulo, req.body.descripcion, req.body.autor)); } catch(e) { handleError(req,res,e); } });
router.post('/canvas/nodos', verificarToken, async (req, res) => { try { res.json(await canvasService.agregarNodo(req.body.boardId, req.body.tipo, req.body.referenciaId, req.body.titulo, req.body.datos, req.body.x, req.body.y)); } catch(e) { handleError(req,res,e); } });
router.post('/canvas/conexiones', verificarToken, async (req, res) => { try { res.json(await canvasService.conectarNodos(req.body.boardId, req.body.origenId, req.body.destinoId, req.body.tipo, req.body.etiqueta)); } catch(e) { handleError(req,res,e); } });
router.get('/canvas/patrones/:boardId', tokenOpcional, async (req, res) => { try { res.json(await canvasService.detectarPatrones(req.params.boardId)); } catch(e) { handleError(req,res,e); } });
router.post('/canvas/auto-generar/:siniestroId', verificarToken, async (req, res) => { try { res.json(await canvasService.autoGenerarCanvas(req.params.siniestroId)); } catch(e) { handleError(req,res,e); } });
router.get('/canvas/estadisticas', tokenOpcional, async (req, res) => { try { res.json(await canvasService.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Daily Notes
router.get('/daily-notes/:empleadoId', tokenOpcional, async (req, res) => { try { res.json(await dailyNotes.getNotasRecientes(req.params.empleadoId, parseInt(req.query.dias) || 7)); } catch(e) { handleError(req,res,e); } });
router.post('/daily-notes/generar', verificarToken, async (req, res) => { try { res.json(await dailyNotes.generarNotaDiaria(req.body.empleadoId, req.body.nombre)); } catch(e) { handleError(req,res,e); } });
router.get('/daily-notes/estadisticas', tokenOpcional, async (req, res) => { try { res.json(await dailyNotes.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Knowledge Graph
router.get('/knowledge-graph/completo', tokenOpcional, async (req, res) => { try { res.json(await knowledgeGraph.getGrafoCompleto()); } catch(e) { handleError(req,res,e); } });
router.get('/knowledge-graph/relaciones/:tipo/:id', tokenOpcional, async (req, res) => { try { res.json(await knowledgeGraph.buscarRelaciones(req.params.tipo, req.params.id)); } catch(e) { handleError(req,res,e); } });
router.get('/knowledge-graph/fraude', tokenOpcional, async (req, res) => { try { res.json(await knowledgeGraph.detectarRedFraude()); } catch(e) { handleError(req,res,e); } });
router.get('/knowledge-graph/insights', tokenOpcional, async (req, res) => { try { res.json(await knowledgeGraph.getInsights()); } catch(e) { handleError(req,res,e); } });
router.post('/knowledge-graph/construir', tokenOpcional, async (req, res) => { try { res.json(await knowledgeGraph.construirGrafo()); } catch(e) { handleError(req,res,e); } });
router.get('/knowledge-graph/estadisticas', tokenOpcional, async (req, res) => { try { res.json(await knowledgeGraph.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// ============================================================
// ADESLAS: WORKFLOW, APROBACIONES, KILL SWITCH
// ============================================================
const adeslasConfig = require('../tenants/adeslas');
const workflowEngine = require('../services/workflowEngine');
const aprobacionesService = require('../services/aprobacionesService');
const killSwitchService = require('../services/killSwitchService');

// Config Adeslas
router.get('/adeslas/config', tokenOpcional, (req, res) => { try { res.json(adeslasConfig.getConfig()); } catch(e) { handleError(req,res,e); } });
router.get('/adeslas/productos', tokenOpcional, (req, res) => { try { res.json(adeslasConfig.getProductos()); } catch(e) { handleError(req,res,e); } });
router.get('/adeslas/plazos', tokenOpcional, (req, res) => { try { res.json(adeslasConfig.getPlazos()); } catch(e) { handleError(req,res,e); } });
router.get('/adeslas/automatizacion', tokenOpcional, (req, res) => { try { res.json(adeslasConfig.getAutomatizacion()); } catch(e) { handleError(req,res,e); } });
router.put('/adeslas/config', verificarToken, async (req, res) => { try { res.json(await adeslasConfig.actualizarConfig('segurcaixa-adeslas', req.body.clave, req.body.valor)); } catch(e) { handleError(req,res,e); } });

// Workflow
router.post('/workflow/iniciar/:siniestroId', verificarToken, async (req, res) => { try { res.json(await workflowEngine.iniciarWorkflow(req.params.siniestroId, 'segurcaixa-adeslas')); } catch(e) { handleError(req,res,e); } });
router.post('/workflow/avanzar/:instanciaId', verificarToken, async (req, res) => { try { res.json(await workflowEngine.avanzarPaso(req.params.instanciaId, req.body)); } catch(e) { handleError(req,res,e); } });
router.get('/workflow/estado/:instanciaId', tokenOpcional, async (req, res) => { try { res.json(await workflowEngine.getEstadoWorkflow(req.params.instanciaId)); } catch(e) { handleError(req,res,e); } });
router.get('/workflow/metricas', tokenOpcional, async (req, res) => { try { res.json(await workflowEngine.getMetricasAutomatizacion()); } catch(e) { handleError(req,res,e); } });
router.get('/workflow/pendientes-humano', tokenOpcional, async (req, res) => { try { res.json(await workflowEngine.getPasosPendientesHumano()); } catch(e) { handleError(req,res,e); } });

// Aprobaciones
router.post('/aprobaciones/solicitar', verificarToken, async (req, res) => { try { res.json(await aprobacionesService.solicitarAprobacion(req.body.siniestroId, req.body.importe, req.body.motivo)); } catch(e) { handleError(req,res,e); } });
router.post('/aprobaciones/aprobar/:id', verificarToken, async (req, res) => { try { res.json(await aprobacionesService.aprobar(req.params.id, req.usuario?.id || 'admin', req.body.notas)); } catch(e) { handleError(req,res,e); } });
router.get('/aprobaciones/pendientes', tokenOpcional, async (req, res) => { try { res.json(await aprobacionesService.getAprobacionesPendientes(req.query.nivel)); } catch(e) { handleError(req,res,e); } });
router.get('/aprobaciones/estadisticas', tokenOpcional, async (req, res) => { try { res.json(await aprobacionesService.getEstadisticas()); } catch(e) { handleError(req,res,e); } });

// Kill Switch
router.get('/sistema/modo', tokenOpcional, async (req, res) => { try { res.json(await killSwitchService.getModo('segurcaixa-adeslas')); } catch(e) { handleError(req,res,e); } });
router.post('/sistema/modo', verificarToken, async (req, res) => { try { res.json(await killSwitchService.setModo('segurcaixa-adeslas', req.body.modo, req.body.motivo, req.usuario?.id || 'admin')); } catch(e) { handleError(req,res,e); } });
router.post('/sistema/kill-switch', verificarToken, async (req, res) => { try { res.json(await killSwitchService.killSwitch('segurcaixa-adeslas', req.usuario?.id || 'admin')); } catch(e) { handleError(req,res,e); } });
router.post('/sistema/reactivar', verificarToken, async (req, res) => { try { res.json(await killSwitchService.reactivar('segurcaixa-adeslas', req.body.modo || 'automatico', req.usuario?.id || 'admin')); } catch(e) { handleError(req,res,e); } });
router.get('/sistema/historial', tokenOpcional, async (req, res) => { try { res.json(await killSwitchService.getHistorial('segurcaixa-adeslas')); } catch(e) { handleError(req,res,e); } });
router.get('/sistema/estado-ia', tokenOpcional, async (req, res) => { try { res.json(await killSwitchService.getEstadoIA('segurcaixa-adeslas')); } catch(e) { handleError(req,res,e); } });

// ============================================================
// ELEVENLABS VOZ REAL
// ============================================================
router.post('/voz/generar', async (req, res) => {
  try {
    const { texto, voiceId } = req.body;
    if (!texto) return res.status(400).json({ error: 'Texto requerido' });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

    if (!apiKey || apiKey.includes('xxxx')) {
      return res.status(400).json({ error: 'ELEVENLABS_API_KEY no configurada' });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: texto,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.45, similarity_boost: 0.9, style: 0.35, use_speaker_boost: true },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: 'ElevenLabs error: ' + err });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': buffer.length });
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: 'Error generando voz' });
  }
});

// Listar voces disponibles
router.get('/voz/voces', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.includes('xxxx')) return res.json([]);
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });
    const data = await response.json();
    res.json((data.voices || []).map(v => ({ id: v.voice_id, name: v.name, category: v.category, language: v.fine_tuning?.language })));
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo voces' });
  }
});

module.exports = router;
