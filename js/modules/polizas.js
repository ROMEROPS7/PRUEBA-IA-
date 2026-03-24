// ============================================
// SiniestrosAI - Modulo: Gestion de polizas y cotizador
// Archivo: js/modules/polizas.js
// ============================================

'use strict';

function initModPolizas(){
    const btn=document.getElementById('btnVerificarCobertura');
    if(btn)btn.addEventListener('click',async()=>{
        const res=document.getElementById('polResultado');if(!res)return;
        res.innerHTML='<div class="neg-sim-loading"><div class="spinner-ring"></div> Verificando...</div>';
        try{
            const data=await apiRequest('/polizas/verificar-cobertura',{method:'POST',body:JSON.stringify({clienteId:document.getElementById('polClienteId')?.value,tipoSiniestro:document.getElementById('polTipoSiniestro')?.value,importeEstimado:+(document.getElementById('polImporte')?.value||2500)})});
            if(data){
                const color=data.cubierto===true?'#16a34a':data.cubierto==='parcial'?'#f59e0b':'#dc2626';
                const icon=data.cubierto===true?'fa-check-circle':data.cubierto==='parcial'?'fa-exclamation-circle':'fa-times-circle';
                res.innerHTML=`<div class="mod-cob-result" style="border-left:4px solid ${color}"><div style="color:${color};font-size:2rem"><i class="fas ${icon}"></i></div><div><h3 style="color:${color}">${data.cubierto===true?'CUBIERTO':data.cubierto==='parcial'?'PARCIALMENTE CUBIERTO':'NO CUBIERTO'}</h3><p>${data.cobertura_aplicable||data.motivo_exclusion||''}</p>${data.franquicia?`<p>Franquicia: <strong>${data.franquicia}€</strong></p>`:''}${data.limite_maximo?`<p>Limite maximo: <strong>${data.limite_maximo}€</strong></p>`:''}${data.importe_indemnizable?`<p>Indemnizable: <strong style="color:#16a34a">${data.importe_indemnizable}€</strong></p>`:''}</div></div>`;
            }
        }catch(e){res.innerHTML=`<p style="color:#dc2626">${e.message}</p>`;}
    });
    modLoadData('/polizas/productos/all','polProductos',(el,data)=>{
        const prods=Array.isArray(data)?data:Object.values(data);
        el.innerHTML=prods.slice(0,8).map(p=>`<div class="mod-item"><i class="fas fa-shield-alt ai-color"></i><div><strong>${p.nombre||p.id}</strong><span>${p.coberturas?.length||0} coberturas | ${p.tiers?.length||3} niveles</span></div></div>`).join('');
    });
}

function initModCotizador(){
    const btn=document.getElementById('btnCalcularPrima');
    if(btn)btn.addEventListener('click',async()=>{
        const res=document.getElementById('cotResultado');if(!res)return;
        res.innerHTML='<div class="neg-sim-loading"><div class="spinner-ring"></div> Calculando...</div>';
        try{
            const data=await apiRequest('/cotizacion/calcular',{method:'POST',body:JSON.stringify({tipo:document.getElementById('cotProducto')?.value,tier:document.getElementById('cotTier')?.value,edad:+(document.getElementById('cotEdad')?.value||35),zona:document.getElementById('cotZona')?.value})});
            if(data){res.innerHTML=`<div class="mod-cob-result" style="border-left:4px solid #16a34a"><div style="color:#8b5cf6;font-size:2.5rem;font-weight:900">${data.prima_anual||data.prima||data.total||'-'}€<small>/ano</small></div><div>${data.prima_mensual?`<p>Mensual: <strong>${data.prima_mensual}€/mes</strong></p>`:''}${data.coberturas?`<p>Coberturas: ${data.coberturas.length||'-'}</p>`:''}<p>Producto: ${data.producto||data.tipo||'-'} | Tier: ${data.tier||'-'}</p></div></div>`;}
        }catch(e){res.innerHTML=`<p style="color:#dc2626">${e.message}</p>`;}
    });
    modLoadData('/cotizacion/estadisticas','cotEstadisticas',(el,data)=>{
        el.innerHTML=`<div class="mod-item"><i class="fas fa-file-contract"></i><div><strong>Polizas emitidas hoy: ${data.polizas_emitidas_hoy||data.emitidas_hoy||0}</strong><span>Prima total mes: ${data.prima_total_mes||0}€ | Ticket medio: ${data.ticket_medio||0}€</span></div></div>`;
    });
}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initModPolizas = initModPolizas;
  window.initModCotizador = initModCotizador;
}
