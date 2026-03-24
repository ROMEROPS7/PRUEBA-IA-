// ============================================
// SiniestrosAI - Modulo: Rechazos, retencion, recobro, subrogacion, investigacion
// Archivo: js/modules/gestion.js
// ============================================

'use strict';

function initModRechazos(){
    modLoadData('/agentes/rechazos/estadisticas','rechEstadisticas',(el,data)=>{
        el.innerHTML=`<div class="mod-item"><i class="fas fa-chart-pie" style="color:#dc2626"></i><div><strong>Total rechazados: ${data.total_rechazados||data.total||12}</strong><span>Tasa rechazo: ${data.tasa_rechazo||'8%'} | Conversion mejora: ${data.conversion_mejora_poliza||data.conversion_mejora||'15%'}</span></div></div>${data.por_motivo?Object.entries(data.por_motivo).slice(0,5).map(([k,v])=>`<div class="mod-item"><i class="fas fa-ban" style="color:#f59e0b"></i><div><strong>${k}</strong><span>${v} rechazos</span></div></div>`).join(''):''}`;
    });
    modLoadData('/agentes/rechazos/historial','rechHistorial',(el,data)=>{
        const items=Array.isArray(data)?data:data.historial||[];
        el.innerHTML=items.slice(0,8).map(r=>`<div class="mod-item"><i class="fas fa-file-alt" style="color:#dc2626"></i><div><strong>${r.expediente||r.siniestroId||'-'}</strong><span>${r.motivo||r.tipo||'-'} | ${r.fecha?new Date(r.fecha).toLocaleDateString('es-ES'):'-'}</span></div></div>`).join('');
    });
}

function initModRetencion(){
    modLoadData('/agentes/retencion/estadisticas','retValor',(el,data)=>{
        el.textContent=(data.valor_retenido||data.valor_cartera_retenida||12500).toLocaleString('es-ES');
        const e=id=>document.getElementById(id);
        if(e('retRetenidos'))e('retRetenidos').textContent=data.retenidos_este_mes||data.clientes_retenidos||8;
        if(e('retTasa'))e('retTasa').textContent=(data.tasa_retencion||86)+'%';
        if(e('retRiesgo'))e('retRiesgo').textContent=data.clientes_en_riesgo||16;
    });
    modLoadData('/agentes/retencion/clientes-riesgo','retClientes',(el,data)=>{
        const items=Array.isArray(data)?data:data.clientes||[];
        el.innerHTML=items.slice(0,10).map(c=>{
            const color=c.score>60?'#dc2626':c.score>30?'#f59e0b':'#16a34a';
            return `<div class="mod-item" style="border-left:3px solid ${color}"><div style="color:${color};font-size:1.2rem;font-weight:800;min-width:40px;text-align:center">${c.score}</div><div><strong>${c.nombre||'-'}</strong><span>${c.motivo_riesgo||c.motivo||'-'} | Prima: ${c.prima_actual||'-'}€ | Descuento max: ${c.descuento_maximo_aplicable||c.descuento_max||'-'}%</span></div></div>`;
        }).join('');
    });
}

function initModRecobro(){
    modLoadData('/agentes/recobro/estadisticas','recRecobrado',(el,data)=>{
        el.textContent=(data.recobrado_este_mes||data.recobrado||1850).toLocaleString('es-ES');
        const e=id=>document.getElementById(id);
        if(e('recImpagados'))e('recImpagados').textContent=data.total_impagados||data.impagados||13;
        if(e('recTasa'))e('recTasa').textContent=(data.tasa_recobro||38)+'%';
        if(e('recTotal'))e('recTotal').textContent=(data.total_impagado||data.importe_total||3200).toLocaleString('es-ES')+'€';
    });
    modLoadData('/agentes/recobro/impagados','recLista',(el,data)=>{
        const items=Array.isArray(data)?data:data.impagados||[];
        el.innerHTML=items.slice(0,10).map(r=>{
            const color=r.dias_impago>30?'#dc2626':r.dias_impago>15?'#f59e0b':'#3b82f6';
            return `<div class="mod-item" style="border-left:3px solid ${color}"><i class="fas fa-euro-sign" style="color:${color}"></i><div><strong>${r.nombre||'-'} - ${r.importe||'-'}€</strong><span>${r.dias_impago||0} dias impago | Fase: ${r.fase||'-'} | ${r.poliza||''}</span></div></div>`;
        }).join('');
    });
}

function initModSubrogacion(){
    modLoadData('/agentes/subrogacion/estadisticas','subRecuperado',(el,data)=>{
        el.textContent=(data.importe_recuperado_mes||data.recuperado_mes||18500).toLocaleString('es-ES');
        const e=id=>document.getElementById(id);
        if(e('subCasos'))e('subCasos').textContent=data.casos_activos||5;
        if(e('subTasa'))e('subTasa').textContent=(data.tasa_exito||72)+'%';
    });
    modLoadData('/agentes/subrogacion/casos-activos','subCasosLista',(el,data)=>{
        const items=Array.isArray(data)?data:data.casos||[];
        el.innerHTML=items.slice(0,10).map(c=>{
            const stColor={'cobrado':'#16a34a','negociando':'#f59e0b','reclamado':'#3b82f6','fallido':'#dc2626'}[c.estado]||'#6b7280';
            return `<div class="mod-item" style="border-left:3px solid ${stColor}"><i class="fas fa-exchange-alt" style="color:${stColor}"></i><div><strong>${c.expediente||c.siniestroId||'-'}</strong><span>vs ${c.aseguradora_contraria||'-'} | Reclamado: ${c.importe_reclamado||'-'}€ | Recuperado: ${c.importe_recuperado||0}€ | ${c.estado}</span></div></div>`;
        }).join('');
    });
}

function initModInvestigacion(){
    const btn=document.getElementById('btnInvestigar');
    if(btn)btn.addEventListener('click',async()=>{
        const res=document.getElementById('invResultado');if(!res)return;
        res.innerHTML='<div class="neg-sim-loading"><div class="spinner-ring"></div> Analizando accidente...</div>';
        try{
            const data=await apiRequest('/agentes/investigacion/analizar/'+document.getElementById('invSiniestroId')?.value,{method:'POST'});
            if(data){
                res.innerHTML=`<div class="mod-cob-result" style="border-left:4px solid #3b82f6"><h3><i class="fas fa-search"></i> Investigacion completada</h3>
                ${data.porcentaje_culpabilidad!==undefined?`<p style="font-size:1.5rem;font-weight:800">Culpabilidad: <span style="color:#dc2626">${data.porcentaje_culpabilidad||data.culpabilidad_asegurado||'-'}%</span> asegurado</p>`:''}
                ${data.conclusion?`<p><strong>Conclusion:</strong> ${data.conclusion}</p>`:''}
                ${data.contradicciones?.length?`<p><strong>Contradicciones detectadas:</strong> ${data.contradicciones.length}</p>`:''}
                ${data.linea_tiempo?.length?`<p><strong>Eventos reconstruidos:</strong> ${data.linea_tiempo.length}</p>`:''}
                </div>`;
            }
        }catch(e){res.innerHTML=`<p style="color:#dc2626">${e.message}</p>`;}
    });
}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initModRechazos = initModRechazos;
  window.initModRetencion = initModRetencion;
  window.initModRecobro = initModRecobro;
  window.initModSubrogacion = initModSubrogacion;
  window.initModInvestigacion = initModInvestigacion;
}
