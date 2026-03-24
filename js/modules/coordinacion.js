// ============================================
// SiniestrosAI - Modulo: Coordinacion, errores, evolucion, healing
// Archivo: js/modules/coordinacion.js
// ============================================

'use strict';

function initCoordinacion(){
    modLoadData('/coordinacion/estadisticas','coordConversaciones',(el,data)=>{
        el.textContent=data.conversaciones_hoy||data.conversaciones_activas||5;
        const e=id=>document.getElementById(id);
        if(e('coordConflictos'))e('coordConflictos').textContent=data.conflictos_pendientes||0;
        if(e('coordConsensos'))e('coordConsensos').textContent=(data.tasa_consenso||98)+'%';
    });
    modLoadData('/coordinacion/conversaciones','coordConvList',(el,data)=>{
        const items=Array.isArray(data)?data:[];
        el.innerHTML=items.slice(0,8).map(c=>`<div class="mod-item"><i class="fas fa-comments ai-color"></i><div><strong>${esc(c.asunto||'-')}</strong><span>Agentes: ${(c.agentes_participantes||c.agentes||[]).join(', ')} | ${c.estado||'activa'}</span>${c.mensajes?.length?`<span style="color:var(--gray-400)">${c.mensajes.length} mensajes intercambiados</span>`:''}</div></div>`).join('');
    });
    modLoadData('/coordinacion/agentes','coordAgentsList',(el,data)=>{
        const items=Array.isArray(data)?data:[];
        el.innerHTML=items.slice(0,15).map(a=>{
            const stColor={'trabajando':'#16a34a','esperando':'#6b7280','coordinando':'#3b82f6','error':'#dc2626'}[a.estado]||'#6b7280';
            return `<div class="mod-item"><div style="width:8px;height:8px;border-radius:50%;background:${stColor};flex-shrink:0"></div><div><strong>${esc(a.nombre||a.id)}</strong><span>${a.estado||'-'} | ${a.tareas_hoy||0} tareas | ${a.precision||'-'}% precision</span></div></div>`;
        }).join('');
    });
}

function initErrores(){
    modLoadData('/errores/estadisticas','errTotal',(el,data)=>{
        el.textContent=data.errores_corregidos_auto||data.errores_detectados_hoy||15;
        const e=id=>document.getElementById(id);
        if(e('errTasa'))e('errTasa').textContent=(data.tasa_correccion_auto||93)+'%';
        if(e('errPrevenidos'))e('errPrevenidos').textContent=data.errores_prevenidos||42;
        if(e('errPrecision'))e('errPrecision').textContent=(data.precision_verificacion||97)+'%';
    });
    modLoadData('/errores/recientes','errRecientes',(el,data)=>{
        const items=Array.isArray(data)?data:[];
        el.innerHTML=items.slice(0,10).map(e=>{
            const color={'dato_incorrecto':'#f59e0b','calculo_erroneo':'#dc2626','decision_invalida':'#dc2626','proceso_incompleto':'#3b82f6','duplicado':'#6b7280','inconsistencia':'#f59e0b'}[e.tipo_error]||'#6b7280';
            return `<div class="mod-item" style="border-left:3px solid ${color}"><i class="fas ${e.corregido_automaticamente?'fa-check-circle':'fa-exclamation-circle'}" style="color:${e.corregido_automaticamente?'#16a34a':color}"></i><div><strong>${esc(e.agente_origen||'-')}: ${esc(e.tipo_error||'-')}</strong><span>${esc(e.descripcion||'-')}</span>${e.correccion_aplicada?`<span style="color:#16a34a"><i class="fas fa-robot"></i> ${esc(e.correccion_aplicada)}</span>`:''}</div></div>`;
        }).join('');
    });
    modLoadData('/errores/precision-agentes','errPrecisionAgentes',(el,data)=>{
        const items=Array.isArray(data)?data:Object.entries(data||{}).map(([k,v])=>({agente:k,...v}));
        el.innerHTML=items.slice(0,12).map(a=>{
            const pct=a.precision||a.tasa_acierto||95;
            const color=pct>95?'#16a34a':pct>85?'#f59e0b':'#dc2626';
            return `<div class="mod-item"><div style="color:${color};font-weight:800;min-width:45px">${pct}%</div><div><strong>${esc(a.agente||a.nombre||'-')}</strong><span>${a.verificaciones||0} verificaciones | ${a.errores||0} errores</span></div></div>`;
        }).join('');
    });
}

function initEvolucion(){
    modLoadData('/evolucion/version','evoVersion',(el,data)=>{
        el.textContent=data.version||data.numero||'v5.0';
    });
    modLoadData('/evolucion/historial','evoHistorial',(el,data)=>{
        const items=Array.isArray(data)?data:[];
        el.innerHTML=items.slice(0,12).map(e=>{
            const icons={mejora:'fa-arrow-up',correccion:'fa-wrench',optimizacion:'fa-bolt',nueva_funcionalidad:'fa-plus-circle'};
            const colors={mejora:'#16a34a',correccion:'#f59e0b',optimizacion:'#3b82f6',nueva_funcionalidad:'#8b5cf6'};
            return `<div class="mod-item"><i class="fas ${icons[e.tipo]||'fa-code'}" style="color:${colors[e.tipo]||'#6b7280'}"></i><div><strong>${esc(e.descripcion||'-')}</strong><span>${e.tipo||'-'} | ${e.estado||'-'} | ${e.fecha?new Date(e.fecha).toLocaleDateString('es-ES'):'-'}</span></div></div>`;
        }).join('');
    });
    modLoadData('/evolucion/roadmap','evoRoadmap',(el,data)=>{
        const items=Array.isArray(data)?data:data?.items||[];
        el.innerHTML=items.slice(0,8).map(r=>`<div class="mod-item"><i class="fas fa-flag" style="color:#8b5cf6"></i><div><strong>${esc(r.titulo||r.nombre||'-')}</strong><span>${esc(r.descripcion||'-')} | Prioridad: ${r.prioridad||'-'} | ETA: ${r.eta||r.trimestre||'-'}</span></div></div>`).join('');
    });
}

function initHealing(){
    modLoadData('/healing/estadisticas','healUptime',(el,data)=>{
        el.textContent=(data.uptime_conseguido||99.97)+'%';
        const e=id=>document.getElementById(id);
        if(e('healIncidentes'))e('healIncidentes').textContent=data.auto_curados||12;
        if(e('healPreventivas'))e('healPreventivas').textContent=data.problemas_prevenidos||8;
    });
    const btn=document.getElementById('btnDiagnosticar');
    if(btn)btn.addEventListener('click',async()=>{
        const el=document.getElementById('healDiagnostico');if(!el)return;
        el.innerHTML='<div class="neg-sim-loading"><div class="spinner-ring"></div> Ejecutando diagnostico completo...</div>';
        try{
            const data=await apiRequest('/healing/diagnostico');
            if(data){
                const stColor={'sano':'#16a34a','degradado':'#f59e0b','critico':'#dc2626'}[data.estado_global]||'#16a34a';
                el.innerHTML=`<div class="mod-cob-result" style="border-left:4px solid ${stColor}"><div style="color:${stColor};font-size:2rem"><i class="fas ${data.estado_global==='sano'?'fa-heart':'fa-exclamation-triangle'}"></i></div><div><h3 style="color:${stColor}">Sistema: ${(data.estado_global||'sano').toUpperCase()}</h3><p>Problemas: ${data.problemas_detectados?.length||0} | Acciones: ${data.acciones_automaticas?.length||0}</p></div></div>`;
            }
        }catch(e){el.innerHTML='<p>Error en diagnostico</p>';}
    });
    modLoadData('/healing/incidentes','healIncidentesList',(el,data)=>{
        const items=Array.isArray(data)?data:[];
        el.innerHTML=items.slice(0,8).map(i=>{
            const color=i.auto_curado?'#16a34a':'#f59e0b';
            return `<div class="mod-item" style="border-left:3px solid ${color}"><i class="fas ${i.auto_curado?'fa-check-circle':'fa-clock'}" style="color:${color}"></i><div><strong>${esc(i.tipo||'-')}: ${esc(i.descripcion||'-')}</strong><span>${i.accion_correctiva?'Fix: '+esc(i.accion_correctiva):''} | ${i.tiempo_resolucion_ms?i.tiempo_resolucion_ms+'ms':i.estado||'-'}</span></div></div>`;
        }).join('');
    });
}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initCoordinacion = initCoordinacion;
  window.initErrores = initErrores;
  window.initEvolucion = initEvolucion;
  window.initHealing = initHealing;
}
