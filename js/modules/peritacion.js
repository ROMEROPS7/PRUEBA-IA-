// ============================================
// SiniestrosAI - Modulo: Peritacion virtual
// Archivo: js/modules/peritacion.js
// ============================================

'use strict';

function initModPeritacionVirtual(){
    modLoadData('/peritacion-virtual/ahorro','pvAhorro',(el,data)=>{
        el.textContent=(data.ahorro_total||data.total||2700).toLocaleString('es-ES');
        const r=document.getElementById('pvRealizadas');if(r)r.textContent=data.total_peritaciones||data.realizadas||10;
    });
    const btn=document.getElementById('btnIniciarPV');
    if(btn)btn.addEventListener('click',async()=>{
        const feed=document.getElementById('pvFeed');if(!feed)return;
        feed.innerHTML='<div class="neg-sim-loading"><div class="spinner-ring"></div> Iniciando peritacion virtual...</div>';
        try{
            const data=await apiRequest('/peritacion-virtual/iniciar/'+document.getElementById('pvSiniestroId')?.value,{method:'POST'});
            if(data&&data.pasos){
                feed.innerHTML='';let i=0;
                const show=()=>{
                    if(i>=data.pasos.length){
                        feed.innerHTML+=`<div class="neg-sim-step accepted"><div class="neg-step-header"><span class="neg-step-num"><i class="fas fa-check"></i></span><strong>Peritacion completada</strong></div><div class="neg-step-msg"><div class="neg-msg-ia"><i class="fas fa-robot"></i> Estimacion: ${data.estimacion_coste||data.coste_estimado||'-'}€ | ${data.aprobado_auto?'APROBADO automaticamente':'Requiere revision'} | Ahorro vs fisico: ${data.ahorro_vs_fisico||270}€</div></div></div>`;
                        return;
                    }
                    const s=data.pasos[i];const d=document.createElement('div');d.className='neg-sim-step neutral';
                    d.innerHTML=`<div class="neg-step-header"><span class="neg-step-num">${s.paso||i+1}</span><strong>${s.accion||''}</strong></div><div class="neg-step-msg"><div class="neg-msg-ia"><i class="fas fa-robot"></i> ${s.resultado||''}</div></div>${s.confianza?`<div class="neg-step-price">Confianza: ${s.confianza}%</div>`:''}`;
                    feed.appendChild(d);feed.scrollTop=feed.scrollHeight;i++;setTimeout(show,1000);
                };show();
            }
        }catch(e){feed.innerHTML=`<p style="color:#dc2626">${e.message}</p>`;}
    });
}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initModPeritacionVirtual = initModPeritacionVirtual;
}
