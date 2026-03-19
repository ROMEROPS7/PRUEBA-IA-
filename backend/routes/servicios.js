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

module.exports = router;
