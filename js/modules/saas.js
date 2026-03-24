// ============================================
// SiniestrosAI - Modulo: Panel SaaS y notificaciones
// Archivo: js/modules/saas.js
// ============================================

'use strict';

function initSaaS(){
    const tbody=document.getElementById('saasTableBody');if(!tbody)return;
    const clientes=[
        {nombre:'AseguraTech',plan:'Enterprise',sin:4500,mrr:45000,uso:94,trend:'up',estado:'Activo'},
        {nombre:'MutualSur',plan:'Enterprise',sin:3800,mrr:38000,uso:91,trend:'up',estado:'Activo'},
        {nombre:'ProtectoPlus',plan:'Business',sin:2200,mrr:28000,uso:87,trend:'up',estado:'Activo'},
        {nombre:'SegurosIberia',plan:'Business',sin:1800,mrr:24000,uso:82,trend:'stable',estado:'Activo'},
        {nombre:'EuroSeguro',plan:'Business',sin:1500,mrr:22000,uso:79,trend:'up',estado:'Activo'},
        {nombre:'PremiumGuard',plan:'Starter',sin:800,mrr:12000,uso:73,trend:'up',estado:'Activo'},
        {nombre:'NovaSeguros',plan:'Starter',sin:600,mrr:9500,uso:68,trend:'down',estado:'En riesgo'},
        {nombre:'MediSeguro',plan:'Enterprise',sin:5200,mrr:52000,uso:96,trend:'up',estado:'Activo'},
        {nombre:'SegurHogar',plan:'Business',sin:1200,mrr:18000,uso:77,trend:'stable',estado:'Activo'},
        {nombre:'AutoProtect',plan:'Starter',sin:450,mrr:8000,uso:65,trend:'down',estado:'En riesgo'},
        {nombre:'VidaPlus',plan:'Business',sin:2000,mrr:26000,uso:85,trend:'up',estado:'Activo'},
        {nombre:'GlobalSeguros',plan:'Enterprise',sin:4000,mrr:42000,uso:92,trend:'up',estado:'Activo'},
    ];
    tbody.innerHTML=clientes.map(c=>{
        const tIcon=c.trend==='up'?'fa-arrow-up':c.trend==='down'?'fa-arrow-down':'fa-minus';
        const tColor=c.trend==='up'?'#16a34a':c.trend==='down'?'#dc2626':'#6b7280';
        return `<tr><td><strong>${c.nombre}</strong></td><td><span class="saas-plan-badge ${c.plan.toLowerCase()}">${c.plan}</span></td><td>${c.sin.toLocaleString('es-ES')}</td><td>${c.mrr.toLocaleString('es-ES')} EUR</td><td><div class="saas-usage-bar"><div style="width:${c.uso}%;background:${c.uso>85?'#16a34a':c.uso>70?'#f59e0b':'#dc2626'}"></div></div> ${c.uso}%</td><td style="color:${tColor}"><i class="fas ${tIcon}"></i></td><td><span class="saas-estado ${c.estado==='Activo'?'saas-activo':'saas-riesgo'}">${c.estado}</span></td></tr>`;
    }).join('');
    // Alertas
    const alerts=document.getElementById('saasAlerts');if(alerts){
        alerts.innerHTML=[
            {icon:'fa-chart-line',text:'MediSeguro ha superado 5.000 siniestros/mes. Sugerir upgrade a plan Enterprise Plus.',tipo:'growth'},
            {icon:'fa-exclamation-triangle',text:'NovaSeguros: uso IA bajando 15% este mes. Contactar para retencion.',tipo:'risk'},
            {icon:'fa-star',text:'AseguraTech renovara contrato Enterprise por 3 anos. MRR asegurado.',tipo:'success'},
            {icon:'fa-arrow-up',text:'AutoProtect podria necesitar upgrade: siniestros creciendo 25% mensual.',tipo:'growth'},
        ].map(a=>`<div class="saas-alert ${a.tipo}"><i class="fas ${a.icon}"></i><span>${a.text}</span></div>`).join('');
    }
}

function initNotifCenter(){
    // Enhanced push notifications with more variety
    const ENHANCED_PUSH=[
        {icon:'fa-robot',title:'IA cerro expediente',text:'EXP-2024-1089 resuelto en 4 min. Indemnizacion: 3.200 EUR.'},
        {icon:'fa-shield-alt',title:'Fraude detectado y bloqueado',text:'Ahorro estimado: 12.400 EUR. Expediente congelado.'},
        {icon:'fa-phone-alt',title:'Llamada atendida automaticamente',text:'Maria Lopez - Siniestro hogar. Cliente satisfecho.'},
        {icon:'fa-truck',title:'Grua asignada en 45 segundos',text:'Vehiculo recogido en A-6 km 22. Sin intervencion humana.'},
        {icon:'fa-check-circle',title:'Perito asignado por IA',text:'Carlos Ruiz asignado a EXP-2024-1091. Visita manana 10:00.'},
        {icon:'fa-chart-line',title:'Ahorro diario alcanzado',text:'47.890 EUR ahorrados hoy vs gestion tradicional.'},
        {icon:'fa-brain',title:'Modelo IA actualizado',text:'Precision anti-fraude mejorada al 94.8%.'},
        {icon:'fa-comments',title:'Chat WhatsApp resuelto',text:'Siniestro hogar abierto y perito asignado via WhatsApp.'},
        {icon:'fa-cloud-sun-rain',title:'Ag. Meteorologo: Alerta AEMET',text:'Lluvias torrenciales previstas en Valencia. 12 polizas en riesgo.'},
        {icon:'fa-camera-retro',title:'Ag. Fotografo: Imagen analizada',text:'Metadatos verificados en EXP-2024-0890. Sin manipulacion.'},
        {icon:'fa-language',title:'Ag. Traductor: Doc traducido',text:'Informe medico traducido EN>ES para EXP-2024-0888.'},
        {icon:'fa-brain',title:'Ag. Psicologo: Sentimiento detectado',text:'Cliente frustrado en llamada. Escalado a gestor humano.'},
        {icon:'fa-gavel',title:'Ag. Abogado: Cumplimiento OK',text:'EXP-2024-0884 cumple normativa RGPD y DGSFP.'},
        {icon:'fa-calculator',title:'Ag. Contable: Provision calculada',text:'Provision mensual actualizada: 234.500 EUR.'},
        {icon:'fa-stethoscope',title:'Ag. Medico: Lesion valorada',text:'Tiempo baja estimado: 21 dias. EXP-2024-0888.'},
        {icon:'fa-handshake',title:'Ag. Reaseguros: Cesion completada',text:'Reaseguro cedido para siniestro >50.000 EUR.'},
        {icon:'fa-landmark',title:'Ag. Regulatorio: Informe DGSFP',text:'Informe trimestral generado automaticamente.'},
        {icon:'fa-bullhorn',title:'Ag. Marketing: NPS actualizado',text:'NPS sube a 72. Mejor trimestre del ano.'},
        {icon:'fa-award',title:'Ag. Calidad: Auditoria completada',text:'Score calidad: 96.2%. Sin incidencias criticas.'},
        {icon:'fa-chart-line',title:'Ag. Predictor: Alerta predictiva',text:'Probabilidad tormenta granizo Zaragoza: 85%. 23 polizas auto.'},
        {icon:'fa-wifi',title:'IoT: Sensor activado',text:'Sensor humo hogar Elena Torres. Parte abierto automaticamente.'},
        {icon:'fa-car',title:'IoT: Impacto detectado',text:'Dashcam BMW 320d registro colision. Grua en camino.'},
        {icon:'fa-fire',title:'Siniestro urgente',text:'Incendio reportado en Calle Betis 56, Sevilla. Bomberos avisados.'},
        {icon:'fa-euro-sign',title:'Pago procesado',text:'Indemnizacion 3.450 EUR enviada a Maria Garcia via Bizum.'},
    ];
    // Override push with enhanced variety
    clearInterval(window._pushInterval);
    window._pushInterval=setInterval(()=>{
        const m=ENHANCED_PUSH[Math.floor(Math.random()*ENHANCED_PUSH.length)];
        const c=document.getElementById('pushNotifications');if(!c)return;
        const d=document.createElement('div');d.className='push-notif';
        d.innerHTML=`<div class="push-notif-icon"><i class="fas ${m.icon}"></i></div><div class="push-notif-content"><span class="push-notif-title">${m.title}</span><span class="push-notif-text">${m.text}</span><span class="push-notif-time">Ahora mismo</span></div>`;
        c.appendChild(d);
        setTimeout(()=>{d.classList.add('leaving');setTimeout(()=>d.remove(),500);},5000);
        if(c.children.length>3)c.firstChild.remove();
    },20000);
}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initSaaS = initSaaS;
  window.initNotifCenter = initNotifCenter;
}
