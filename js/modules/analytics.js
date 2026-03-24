// ============================================
// SiniestrosAI - Modulo: NPS, riesgo, compliance, competencia, analytics deep
// Archivo: js/modules/analytics.js
// ============================================

'use strict';

function initModNPS(){
    modLoadData('/agentes/nps/informe-mensual','npsScore',(el,data)=>{
        const nps=data.nps_score||data.nps||42;const color=nps>50?'#16a34a':nps>0?'#f59e0b':'#dc2626';
        el.innerHTML=`<div style="font-size:4rem;font-weight:900;color:${color}">${nps}</div><div style="font-size:.85rem;color:var(--gray-500)">Net Promoter Score</div><div style="margin-top:1rem;display:flex;justify-content:center;gap:2rem"><div><span style="color:#16a34a;font-weight:700">${data.promotores_pct||data.promotores||42}%</span><br><small>Promotores</small></div><div><span style="color:#f59e0b;font-weight:700">${data.neutros_pct||data.neutros||26}%</span><br><small>Neutros</small></div><div><span style="color:#dc2626;font-weight:700">${data.detractores_pct||data.detractores||32}%</span><br><small>Detractores</small></div></div>`;
    });
    modLoadData('/agentes/nps/clientes-insatisfechos','npsInsatisfechos',(el,data)=>{
        const items=Array.isArray(data)?data:data.clientes||[];
        el.innerHTML=items.slice(0,8).map(c=>`<div class="mod-item" style="border-left:3px solid #dc2626"><i class="fas fa-frown" style="color:#dc2626"></i><div><strong>${c.nombre||'-'} - ${c.puntuacion||'-'}/10</strong><span>${c.comentario||c.motivo||'-'}</span></div></div>`).join('');
    });
}

function initModRiesgo(){
    modLoadData('/agentes/riesgo/mapa-riesgo','riesgoMapa',(el,data)=>{
        const items=Array.isArray(data)?data:data.zonas||data.comunidades||[];
        el.innerHTML=items.slice(0,12).map(z=>{
            const color=(z.nivel||z.riesgo)==='alto'?'#dc2626':(z.nivel||z.riesgo)==='medio'?'#f59e0b':'#16a34a';
            return `<div class="mod-item" style="border-left:3px solid ${color}"><div class="pred-zone-dot" style="background:${color}"></div><div><strong>${z.nombre||z.comunidad||'-'}</strong><span>Riesgo: ${z.nivel||z.riesgo||'-'} | Siniestros: ${z.siniestros||z.densidad||'-'} | Score: ${z.score||'-'}</span></div></div>`;
        }).join('');
    });
    modLoadData('/agentes/riesgo/clientes-alto-riesgo','riesgoClientes',(el,data)=>{
        const items=Array.isArray(data)?data:data.clientes||[];
        el.innerHTML=items.slice(0,8).map(c=>{
            const color=c.score>70?'#dc2626':c.score>40?'#f59e0b':'#16a34a';
            return `<div class="mod-item" style="border-left:3px solid ${color}"><div style="color:${color};font-weight:800;min-width:35px;text-align:center">${c.score}</div><div><strong>${c.nombre||'-'}</strong><span>${c.recomendacion||c.factores_principales?.join(', ')||'-'}</span></div></div>`;
        }).join('');
    });
}

function initModCompliance(){
    modLoadData('/compliance/estadisticas','complianceEstado',(el,data)=>{
        const pct=data.cumplimiento_general_pct||data.cumplimiento||92;
        const color=pct>90?'#16a34a':pct>75?'#f59e0b':'#dc2626';
        el.innerHTML=`<div style="font-size:4rem;font-weight:900;color:${color}">${pct}%</div><div style="font-size:.85rem;color:var(--gray-500)">Cumplimiento normativo</div><div style="margin-top:1rem"><span>Alertas activas: <strong style="color:#dc2626">${data.alertas_activas||3}</strong></span> | <span>En plazo: <strong style="color:#16a34a">${data.expedientes_en_plazo||12}</strong></span> | <span>Fuera plazo: <strong style="color:#dc2626">${data.expedientes_fuera_plazo||1}</strong></span></div>`;
    });
    modLoadData('/compliance/alertas-activas','complianceAlertas',(el,data)=>{
        const items=Array.isArray(data)?data:data.alertas||[];
        el.innerHTML=items.slice(0,8).map(a=>{
            const color=(a.severidad||a.nivel)==='critica'?'#dc2626':'#f59e0b';
            return `<div class="mod-item" style="border-left:3px solid ${color}"><i class="fas fa-gavel" style="color:${color}"></i><div><strong>${a.expediente||a.siniestroId||'-'}</strong><span>${a.descripcion||a.alerta||'-'} | Plazo: ${a.dias_restantes||a.plazo||'-'} dias</span></div></div>`;
        }).join('');
    });
}

function initModCompetencia(){
    modLoadData('/competencia/analisis','compAnalisis',(el,data)=>{
        const pos=data.posicionamiento||data;
        el.innerHTML=`<div class="mod-item"><i class="fas fa-chart-line ai-color"></i><div><strong>Posicionamiento competitivo</strong><span>${data.resumen||'Analisis de 6 competidores en 8 productos'}</span></div></div>${data.fortalezas?`<div class="mod-item"><i class="fas fa-plus-circle" style="color:#16a34a"></i><div><strong>Fortalezas</strong><span>${Array.isArray(data.fortalezas)?data.fortalezas.join(', '):data.fortalezas}</span></div></div>`:''}${data.debilidades?`<div class="mod-item"><i class="fas fa-minus-circle" style="color:#dc2626"></i><div><strong>Areas de mejora</strong><span>${Array.isArray(data.debilidades)?data.debilidades.join(', '):data.debilidades}</span></div></div>`:''}`;
    });
    modLoadData('/competencia/recomendaciones','compRecomendaciones',(el,data)=>{
        const items=Array.isArray(data)?data:data.recomendaciones||[];
        el.innerHTML=items.slice(0,6).map(r=>`<div class="mod-item"><i class="fas fa-lightbulb" style="color:#f59e0b"></i><div><strong>${esc(r.producto||r.titulo||'-')}</strong><span>${esc(r.recomendacion||r.descripcion||'-')}${r.impacto_estimado?` | Impacto: ${esc(r.impacto_estimado)}`:''}</span></div></div>`).join('');
    });
}

function initAnalyticsDeep(){
    modLoadData('/analytics/insights','anaInsightsList',(el,data)=>{
        const items=Array.isArray(data)?data:[];
        el.innerHTML=items.slice(0,10).map(i=>`<div class="mod-item"><i class="fas fa-lightbulb" style="color:#f59e0b"></i><div><strong>${esc(i.titulo||i.categoria||'Insight')}</strong><span>${esc(i.descripcion||i.insight||'-')}</span>${i.impacto?`<span style="color:#16a34a">Impacto: ${esc(i.impacto)}</span>`:''}</div></div>`).join('');
    });
    modLoadData('/analytics/correlaciones','anaCorrelacionesList',(el,data)=>{
        const items=Array.isArray(data)?data:[];
        el.innerHTML=items.slice(0,8).map(c=>`<div class="mod-item"><i class="fas fa-link" style="color:#8b5cf6"></i><div><strong>${esc(c.variable_a||'')} ↔ ${esc(c.variable_b||'')}</strong><span>Fuerza: ${c.fuerza||c.correlacion||'-'} | ${esc(c.recomendacion||c.descripcion||'-')}</span></div></div>`).join('');
    });
    modLoadData('/analytics/oportunidades','anaOportunidadesList',(el,data)=>{
        const items=Array.isArray(data)?data:[];
        el.innerHTML=items.slice(0,6).map(o=>`<div class="mod-item"><i class="fas fa-gem" style="color:#06b6d4"></i><div><strong>${esc(o.titulo||o.nombre||'-')}</strong><span>${esc(o.descripcion||'-')}${o.roi_estimado?` | ROI: ${esc(o.roi_estimado)}`:''}</span></div></div>`).join('');
    });
}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initModNPS = initModNPS;
  window.initModRiesgo = initModRiesgo;
  window.initModCompliance = initModCompliance;
  window.initModCompetencia = initModCompetencia;
  window.initAnalyticsDeep = initAnalyticsDeep;
}
