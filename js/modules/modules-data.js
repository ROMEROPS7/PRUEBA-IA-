// ============================================
// SiniestrosAI - Modulo: Utilidades compartidas para modulos de datos
// Archivo: js/modules/modules-data.js
// ============================================

'use strict';

function modLoadData(endpoint,elId,renderFn){
    apiRequest(endpoint).then(data=>{if(data){const el=document.getElementById(elId);if(el)renderFn(el,data);}}).catch(()=>{});
}

function modRenderItems(el,items,renderItem){el.innerHTML=items.map(renderItem).join('');}

function modSevColor(s){return{critica:'#dc2626',alta:'#f59e0b',media:'#3b82f6',baja:'#16a34a'}[s]||'#6b7280';}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.modLoadData = modLoadData;
  window.modRenderItems = modRenderItems;
  window.modSevColor = modSevColor;
}
