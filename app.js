// ============================================================
// SINIESTROS AI - APP COMPLETA
// ============================================================
const TIPOS_LABEL={coche:'Automovil',hogar:'Hogar',salud:'Salud',robo:'Robo',otro:'Otro'};
const TIPOS_ICON={coche:'fa-car-crash',hogar:'fa-house-damage',salud:'fa-heartbeat',robo:'fa-mask',otro:'fa-file-alt'};

const AI_AGENTS=[
    {id:'recepcionista',nombre:'Ag. Recepcionista',icon:'fa-headset',estado:'active',tareas:47},
    {id:'antifraude',nombre:'Ag. Anti-Fraude',icon:'fa-shield-alt',estado:'processing',tareas:23},
    {id:'clasificador',nombre:'Ag. Clasificador',icon:'fa-tags',estado:'active',tareas:56},
    {id:'documentalista',nombre:'Ag. Documentalista',icon:'fa-file-alt',estado:'active',tareas:34},
    {id:'perito',nombre:'Ag. Perito',icon:'fa-search-dollar',estado:'processing',tareas:18},
    {id:'grua',nombre:'Ag. Grua',icon:'fa-truck-pickup',estado:'waiting',tareas:12},
    {id:'legal',nombre:'Ag. Legal',icon:'fa-balance-scale',estado:'active',tareas:29},
    {id:'seguimiento',nombre:'Ag. Seguimiento',icon:'fa-bell',estado:'active',tareas:41}
];

const AI_FEED_MESSAGES=[
    {agent:'Anti-Fraude',text:'Anomalia detectada en <strong>EXP-2024-0883</strong>. Score: 68.'},
    {agent:'Recepcionista',text:'Llamada de <strong>Maria Garcia</strong> atendida. Parte abierto.'},
    {agent:'Clasificador',text:'Parte hogar clasificado: <strong>inundacion prioridad alta</strong>.'},
    {agent:'Documentalista',text:'Docs de <strong>EXP-2024-0890</strong> verificados con OCR.'},
    {agent:'Perito',text:'Valoracion auto: <strong>EXP-2024-0887</strong> - 2.340 EUR.'},
    {agent:'Grua',text:'Grua enviada a <strong>M-30 km 7.2</strong>. ETA: 15 min.'},
    {agent:'Legal',text:'RC confirmada para <strong>EXP-2024-0884</strong>.'},
    {agent:'Seguimiento',text:'SMS enviado a <strong>Carlos Fernandez</strong>: visita perito manana.'},
    {agent:'Recepcionista',text:'WhatsApp de <strong>Pedro Alvarez</strong> resuelto en 45s.'},
    {agent:'Anti-Fraude',text:'3 siniestros sospechosos en <strong>Valencia</strong> esta semana.'},
    {agent:'Clasificador',text:'Auto-clasificado: <strong>robo con fuerza</strong> urgencia 8.'},
    {agent:'Perito',text:'Vision IA: danos consistentes con <strong>colision frontal</strong>.'},
    {agent:'Seguimiento',text:'<strong>Sofia Rodriguez</strong> puntuo 9/10 tras resolucion.'},
    {agent:'Grua',text:'Vehiculo recogido en <strong>Av. del Puerto 89</strong>.'},
    {agent:'Recepcionista',text:'Llamada atendida en <strong>1.2 seg</strong>. Record del dia.'},
    {agent:'Anti-Fraude',text:'<strong>EXP-2024-0885</strong> limpio. Sin fraude.'}
];

const PUSH_MESSAGES=[
    {icon:'fa-robot',title:'IA cerro expediente',text:'EXP-2024-1089 resuelto en 4 min. Indemnizacion: 3.200 EUR.'},
    {icon:'fa-shield-alt',title:'Fraude detectado y bloqueado',text:'Ahorro estimado: 12.400 EUR. Expediente congelado.'},
    {icon:'fa-phone-alt',title:'Llamada atendida automaticamente',text:'Maria Lopez - Siniestro hogar. Cliente satisfecho.'},
    {icon:'fa-truck',title:'Grua asignada en 45 segundos',text:'Vehiculo recogido en A-6 km 22. Sin intervencion humana.'},
    {icon:'fa-check-circle',title:'Perito asignado por IA',text:'Carlos Ruiz asignado a EXP-2024-1091. Visita manana 10:00.'},
    {icon:'fa-chart-line',title:'Ahorro diario alcanzado',text:'47.890 EUR ahorrados hoy vs gestion tradicional.'},
    {icon:'fa-brain',title:'Modelo IA actualizado',text:'Precision anti-fraude mejorada al 94.8%.'},
    {icon:'fa-comments',title:'Chat WhatsApp resuelto',text:'Siniestro hogar abierto y perito asignado via WhatsApp.'}
];

// MAP POINTS
const MAP_CITIES=[
    {name:'Madrid',x:48,y:44,region:'Madrid',count:12},
    {name:'Barcelona',x:75,y:22,region:'Cataluna',count:9},
    {name:'Valencia',x:65,y:52,region:'Valencia',count:7},
    {name:'Sevilla',x:32,y:76,region:'Andalucia',count:8},
    {name:'Bilbao',x:47,y:11,region:'Pais Vasco',count:4},
    {name:'Zaragoza',x:57,y:28,region:'Aragon',count:5},
    {name:'Malaga',x:40,y:82,region:'Andalucia',count:6},
    {name:'Murcia',x:60,y:68,region:'Murcia',count:4},
    {name:'Palma',x:83,y:48,region:'Baleares',count:3},
    {name:'Vigo',x:7,y:22,region:'Galicia',count:3},
    {name:'Alicante',x:65,y:60,region:'Valencia',count:4},
    {name:'Valladolid',x:35,y:30,region:'Castilla y Leon',count:2},
    {name:'Cordoba',x:37,y:72,region:'Andalucia',count:3},
    {name:'Santander',x:40,y:9,region:'Cantabria',count:2},
    {name:'Toledo',x:43,y:52,region:'C. La Mancha',count:2}
];

let siniestros=[
    {id:'EXP-2024-0891',cliente:'Maria Garcia Lopez',telefono:'612 345 678',email:'maria.garcia@email.com',poliza:'POL-2024-00456',tipo:'coche',descripcion:'Colision frontal en M-30 salida 7. Airbags activados.',estado:'Abierto',fecha:'2024-12-18',urgencia:9,fraude:12,perito:null,zona:'Madrid',direccion:'M-30 km 7.2, Madrid',lat:40.4168,lng:-3.7038,iaConfianza:94,iaGestion:'full',iaTiempo:'1.8 min',humanoTiempo:'22 min',
        timeline:[{fecha:'2024-12-18 09:15',titulo:'Registrado',desc:'Apertura automatica',tipo:'completed'},{fecha:'2024-12-18 10:00',titulo:'Pendiente perito',desc:'Zona Madrid',tipo:'active'}],
        chat:[{usuario:'Ana Martinez',iniciales:'AM',texto:'Siniestro grave, airbags activados.',hora:'09:15'}],documentos:[{nombre:'Parte_amistoso.pdf',tamano:'245 KB',icono:'fa-file-pdf'}],cambios:[{texto:'Creado por <strong>IA</strong>',fecha:'18/12/2024 09:15'}]},
    {id:'EXP-2024-0890',cliente:'Carlos Fernandez Ruiz',telefono:'634 567 890',email:'carlos@email.com',poliza:'POL-2024-00312',tipo:'hogar',descripcion:'Inundacion planta baja por rotura tuberia.',estado:'En gestion',fecha:'2024-12-17',urgencia:7,fraude:8,perito:'Elena Torres Vidal',zona:'Barcelona',direccion:'Calle Aragon 234, Barcelona',lat:41.3851,lng:2.1734,iaConfianza:91,iaGestion:'full',iaTiempo:'2.1 min',humanoTiempo:'19 min',
        timeline:[{fecha:'2024-12-17 14:30',titulo:'Registrado',desc:'Inundacion',tipo:'completed'},{fecha:'2024-12-17 15:00',titulo:'Perito asignado',desc:'Elena Torres',tipo:'active'}],
        chat:[{usuario:'Roberto Diaz',iniciales:'RD',texto:'Inundacion importante.',hora:'14:35'}],documentos:[{nombre:'Fotos.zip',tamano:'12 MB',icono:'fa-file-archive'}],cambios:[{texto:'Perito asignado',fecha:'17/12/2024 15:00'}]},
    {id:'EXP-2024-0889',cliente:'Laura Mendez Torres',telefono:'678 901 234',email:'laura@email.com',poliza:'POL-2024-00289',tipo:'robo',descripcion:'Robo con fuerza en local comercial.',estado:'Perito asignado',fecha:'2024-12-16',urgencia:8,fraude:45,perito:'Laura Sanchez Gil',zona:'Valencia',direccion:'Av. del Puerto 89, Valencia',lat:39.4699,lng:-0.3763,iaConfianza:72,iaGestion:'partial',iaTiempo:'3.2 min',humanoTiempo:'25 min',
        timeline:[{fecha:'2024-12-16 07:00',titulo:'Registrado',desc:'Denuncia',tipo:'completed'},{fecha:'2024-12-16 10:00',titulo:'Perito',desc:'Laura Sanchez',tipo:'active'}],
        chat:[{usuario:'Ana Martinez',iniciales:'AM',texto:'Fraude elevado (45).',hora:'07:15'}],documentos:[{nombre:'Denuncia.pdf',tamano:'320 KB',icono:'fa-file-pdf'}],cambios:[{texto:'Score fraude: <strong>45</strong>',fecha:'16/12/2024 10:30'}]},
    {id:'EXP-2024-0888',cliente:'Pedro Alvarez Gomez',telefono:'645 678 901',email:'pedro@email.com',poliza:'POL-2024-00178',tipo:'salud',descripcion:'Apendicitis aguda. Hospital La Paz.',estado:'En gestion',fecha:'2024-12-17',urgencia:10,fraude:3,perito:null,zona:'Madrid',direccion:'Hospital La Paz',lat:40.4815,lng:-3.6872,iaConfianza:98,iaGestion:'full',iaTiempo:'0.8 min',humanoTiempo:'15 min',
        timeline:[{fecha:'2024-12-17 22:00',titulo:'Registrado',desc:'Urgencia',tipo:'completed'},{fecha:'2024-12-18 08:00',titulo:'Seguimiento',desc:'Hospital',tipo:'active'}],
        chat:[{usuario:'Guardia',iniciales:'GN',texto:'Apendicitis urgente.',hora:'22:05'}],documentos:[{nombre:'Informe.pdf',tamano:'890 KB',icono:'fa-file-pdf'}],cambios:[{texto:'Cobertura verificada',fecha:'17/12/2024 22:30'}]},
    {id:'EXP-2024-0887',cliente:'Sofia Rodriguez',telefono:'623 456 789',email:'sofia@email.com',poliza:'POL-2024-00567',tipo:'coche',descripcion:'Danos por granizo. Abolladuras techo/capo.',estado:'Perito asignado',fecha:'2024-12-15',urgencia:4,fraude:5,perito:'Carlos Ruiz',zona:'Zaragoza',direccion:'CC Augusta, Zaragoza',lat:41.6488,lng:-0.8891,iaConfianza:96,iaGestion:'full',iaTiempo:'1.5 min',humanoTiempo:'20 min',
        timeline:[{fecha:'2024-12-15 18:00',titulo:'Registrado',desc:'Granizo',tipo:'completed'},{fecha:'2024-12-16 11:00',titulo:'Valoracion',desc:'En curso',tipo:'active'}],
        chat:[{usuario:'Carlos Ruiz',iniciales:'CR',texto:'3 peritajes misma tormenta.',hora:'09:15'}],documentos:[{nombre:'Fotos.zip',tamano:'5 MB',icono:'fa-file-archive'}],cambios:[{texto:'Perito asignado',fecha:'16/12/2024 09:00'}]},
    {id:'EXP-2024-0886',cliente:'Antonio Navarro',telefono:'656 789 012',email:'antonio@email.com',poliza:'POL-2024-00890',tipo:'hogar',descripcion:'Incendio cocina por cortocircuito.',estado:'Resuelto',fecha:'2024-12-10',urgencia:9,fraude:15,perito:'Miguel A. Fernandez',zona:'Sevilla',direccion:'Calle Betis 56, Sevilla',lat:37.3886,lng:-5.9823,iaConfianza:88,iaGestion:'full',iaTiempo:'2.4 min',humanoTiempo:'28 min',
        timeline:[{fecha:'2024-12-15 16:00',titulo:'Cerrado',desc:'Pago realizado',tipo:'completed'}],
        chat:[{usuario:'Miguel A.',iniciales:'MF',texto:'Valoracion: 23.500 EUR.',hora:'14:30'}],documentos:[{nombre:'Peritaje.pdf',tamano:'3.4 MB',icono:'fa-file-pdf'}],cambios:[{texto:'Cerrado',fecha:'15/12/2024 16:00'}]},
    {id:'EXP-2024-0885',cliente:'Isabel Moreno',telefono:'667 890 123',email:'isabel@email.com',poliza:'POL-2024-00445',tipo:'coche',descripcion:'Alcance trasero en semaforo.',estado:'Resuelto',fecha:'2024-12-08',urgencia:3,fraude:7,perito:'Carlos Ruiz',zona:'Malaga',direccion:'Av. Andalucia 15, Malaga',lat:36.7213,lng:-4.4214,iaConfianza:97,iaGestion:'full',iaTiempo:'1.1 min',humanoTiempo:'18 min',
        timeline:[{fecha:'2024-12-11 09:00',titulo:'Cerrado',desc:'Reparado',tipo:'completed'}],chat:[],documentos:[],cambios:[{texto:'Cerrado',fecha:'11/12/2024'}]},
    {id:'EXP-2024-0884',cliente:'Francisco Herrera',telefono:'689 012 345',email:'fran@email.com',poliza:'POL-2024-00678',tipo:'otro',descripcion:'RC filtracion agua al vecino.',estado:'En gestion',fecha:'2024-12-16',urgencia:5,fraude:10,perito:null,zona:'Bilbao',direccion:'Gran Via 78, Bilbao',lat:43.2630,lng:-2.9350,iaConfianza:85,iaGestion:'full',iaTiempo:'2.0 min',humanoTiempo:'17 min',
        timeline:[{fecha:'2024-12-16 12:00',titulo:'En estudio',desc:'RC',tipo:'active'}],chat:[],documentos:[],cambios:[{texto:'En estudio',fecha:'16/12/2024'}]},
    {id:'EXP-2024-0883',cliente:'Carmen Vega',telefono:'698 123 456',email:'carmen@email.com',poliza:'POL-2024-00234',tipo:'robo',descripcion:'Robo BMW Serie 3 en parking.',estado:'Abierto',fecha:'2024-12-18',urgencia:8,fraude:68,perito:null,zona:'Madrid',direccion:'CC La Vaguada',lat:40.4797,lng:-3.7100,iaConfianza:61,iaGestion:'partial',iaTiempo:'4.1 min',humanoTiempo:'30 min',
        timeline:[{fecha:'2024-12-18 12:30',titulo:'Alerta fraude',desc:'Score 68',tipo:'active'}],chat:[],documentos:[],cambios:[{texto:'Alerta fraude: <strong>68</strong>',fecha:'18/12/2024'}]},
    {id:'EXP-2024-0882',cliente:'Roberto Diaz',telefono:'654 321 098',email:'roberto@email.com',poliza:'POL-2024-00901',tipo:'salud',descripcion:'Rehabilitacion femur. 20 sesiones.',estado:'Resuelto',fecha:'2024-11-20',urgencia:6,fraude:2,perito:null,zona:'Barcelona',direccion:'Clinica Teknon',lat:41.3960,lng:2.1340,iaConfianza:99,iaGestion:'full',iaTiempo:'0.6 min',humanoTiempo:'12 min',
        timeline:[{fecha:'2024-12-16 09:00',titulo:'Cerrado',desc:'Alta medica',tipo:'completed'}],chat:[],documentos:[],cambios:[{texto:'Cerrado',fecha:'16/12/2024'}]}
];

let currentSiniestro=null,savingsBase=47320,feedIndex=0,roiChartInstance=null,catastropheActive=false;

// ============================================================
// WELCOME SCREEN
// ============================================================
(function initWelcome(){
    const title='SiniestrosAI';
    let i=0;
    const el=document.getElementById('welcomeTitle');
    const sub=document.getElementById('welcomeSubtitle');
    const subText='El primer sistema autonomo de gestion de siniestros';
    const typeTitle=()=>{if(i<title.length){el.textContent+=title[i];i++;setTimeout(typeTitle,120);}else{let j=0;const typeSub=()=>{if(j<subText.length){sub.textContent+=subText[j];j++;setTimeout(typeSub,30);}};setTimeout(typeSub,400);}};
    setTimeout(typeTitle,600);
    // Counter animation
    let c=1200000;
    setInterval(()=>{c+=Math.floor(Math.random()*5)+1;document.getElementById('welcomeCounterValue').textContent=c.toLocaleString('es-ES');},50);
    // Enter button
    document.getElementById('btnEntrar').addEventListener('click',dismissWelcome);
    setTimeout(dismissWelcome,12000);
})();

function dismissWelcome(){
    const w=document.getElementById('welcomeScreen');
    if(!w||w.classList.contains('hiding'))return;
    w.classList.add('hiding');
    setTimeout(()=>w.remove(),800);
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(p){
    document.querySelectorAll('.page').forEach(e=>e.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(e=>e.classList.remove('active'));
    const el=document.getElementById('page-'+p);if(el)el.classList.add('active');
    const nav=document.querySelector(`.nav-item[data-page="${p}"]`);if(nav)nav.classList.add('active');
    document.getElementById('sidebar').classList.remove('open');
}
function openDetail(id){const s=siniestros.find(x=>x.id===id);if(!s)return;currentSiniestro=s;renderDetail(s);navigateTo('detalle');}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.nav-item').forEach(i=>i.addEventListener('click',()=>navigateTo(i.dataset.page)));
    document.getElementById('menuToggle').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
    initDashboard();initAIAgents();initAIFeed();initSavingsCounter();initMap();
    initExpedientes();initForm();initMetricas();initNotifications();initSearch();
    initCallSimulator();initWhatsAppSimulator();initAntiFraud();initComparison();initROI();
    initPushNotifications();initVoiceSimulator();initMobileDemo();
});

// ============================================================
// DASHBOARD
// ============================================================
function initDashboard(){renderDashboardTable();renderChartSiniestrosMes();renderChartTipos();updateKPIs();}
function updateKPIs(){
    const a=siniestros.filter(s=>s.estado==='Abierto').length,g=siniestros.filter(s=>s.estado==='En gestion'||s.estado==='Perito asignado').length,r=siniestros.filter(s=>s.estado==='Resuelto').length;
    animC('kpiAbiertos',a);animC('kpiGestion',g);animC('kpiResueltos',r);animC('kpiTotal',siniestros.length);
}
function animC(id,t){const el=document.getElementById(id);let c=0;const s=Math.max(1,Math.floor(t/20));const iv=setInterval(()=>{c+=s;if(c>=t){c=t;clearInterval(iv);}el.textContent=c;},30);}
function renderDashboardTable(){
    const tb=document.getElementById('dashboardTableBody');
    tb.innerHTML=[...siniestros].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).slice(0,6).map(s=>`<tr><td><strong>${s.id}</strong></td><td>${s.cliente}</td><td><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</td><td>${statusBadge(s.estado)}</td><td>${fmtDate(s.fecha)}</td><td>${urgBadge(s.urgencia)}</td><td><div class="table-actions"><button onclick="openDetail('${s.id}')"><i class="fas fa-eye"></i></button></div></td></tr>`).join('');
}
function renderChartSiniestrosMes(){new Chart(document.getElementById('chartSiniestrosMes'),{type:'bar',data:{labels:['Jul','Ago','Sep','Oct','Nov','Dic'],datasets:[{label:'Abiertos',data:[15,12,18,22,20,24],backgroundColor:'#fee2e2',borderColor:'#dc2626',borderWidth:1},{label:'Gestion',data:[28,25,32,35,40,38],backgroundColor:'#fef3c7',borderColor:'#f59e0b',borderWidth:1},{label:'Resueltos',data:[45,52,48,55,60,65],backgroundColor:'#dcfce7',borderColor:'#16a34a',borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{usePointStyle:true,padding:12,font:{size:10}}}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'}}}}});}
function renderChartTipos(){const c={};siniestros.forEach(s=>{c[s.tipo]=(c[s.tipo]||0)+1});new Chart(document.getElementById('chartTipos'),{type:'doughnut',data:{labels:Object.keys(c).map(k=>TIPOS_LABEL[k]),datasets:[{data:Object.values(c),backgroundColor:['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'],borderWidth:0,spacing:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,padding:12,font:{size:10}}}}}});}

// ============================================================
// AI AGENTS
// ============================================================
function initAIAgents(){
    const g=document.getElementById('agentsGrid');const labels={active:'Activo',processing:'Procesando...',waiting:'En espera'};
    g.innerHTML=AI_AGENTS.map(a=>`<div class="agent-card" id="agent-${a.id}"><div class="agent-avatar"><i class="fas ${a.icon}"></i><div class="agent-status-dot ${a.estado}"></div></div><div class="agent-info"><span class="agent-name">${a.nombre}</span><span class="agent-status-text ${a.estado}">${labels[a.estado]}</span><span class="agent-tasks">${a.tareas} tareas hoy</span></div></div>`).join('');
    setInterval(()=>{const cards=document.querySelectorAll('.agent-card');const r=cards[Math.floor(Math.random()*cards.length)];const d=r.querySelector('.agent-status-dot'),st=r.querySelector('.agent-status-text'),tk=r.querySelector('.agent-tasks');const ns=['active','processing','active'][Math.floor(Math.random()*3)];d.className='agent-status-dot '+ns;st.className='agent-status-text '+ns;st.textContent={active:'Activo',processing:'Procesando...'}[ns];tk.textContent=(parseInt(tk.textContent)+1)+' tareas hoy';},4000);
}

// ============================================================
// AI FEED
// ============================================================
function initAIFeed(){const f=document.getElementById('aiFeed');for(let i=0;i<5;i++)addFeed(f,i);setInterval(()=>{feedIndex=(feedIndex+1)%AI_FEED_MESSAGES.length;addFeed(f,feedIndex,true);if(f.children.length>12)f.removeChild(f.lastChild);},3500);}
function addFeed(f,i,pre){const m=AI_FEED_MESSAGES[i%AI_FEED_MESSAGES.length];const t=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'});const d=document.createElement('div');d.className='feed-item';d.innerHTML=`<div class="feed-icon"><i class="fas fa-robot"></i></div><div class="feed-text"><strong>${m.agent}:</strong> ${m.text}</div><span class="feed-time">${t}</span>`;if(pre)f.insertBefore(d,f.firstChild);else f.appendChild(d);}

// ============================================================
// SAVINGS COUNTER
// ============================================================
function initSavingsCounter(){setInterval(()=>{savingsBase+=Math.random()*3+.5;document.getElementById('savingsCounter').textContent=Math.floor(savingsBase).toLocaleString('es-ES');const ll=document.getElementById('llamadasIA'),pp=document.getElementById('partesAuto');if(Math.random()>.7)ll.textContent=parseInt(ll.textContent)+1;if(Math.random()>.85)pp.textContent=parseInt(pp.textContent)+1;},2000);}

// ============================================================
// INTERACTIVE MAP
// ============================================================
function initMap(){
    const mp=document.getElementById('mapPoints');const legend=document.getElementById('mapLegendSidebar');
    const regions={};
    MAP_CITIES.forEach((c,i)=>{
        const urgency=c.count>8?'urgent':c.count>4?'medium':'low';
        regions[c.region]=(regions[c.region]||0)+c.count;
        const el=document.createElement('div');el.className='map-point';el.style.left=c.x+'%';el.style.top=c.y+'%';
        el.innerHTML=`<div class="map-point-dot ${urgency}" title="${c.name}: ${c.count} siniestros"></div>`;
        el.addEventListener('click',e=>{e.stopPropagation();showMapPopup(c,el);});
        mp.appendChild(el);
    });
    // Legend
    legend.innerHTML=Object.entries(regions).sort((a,b)=>b[1]-a[1]).map(([r,c])=>`<div class="map-legend-item"><span>${r}</span><span class="region-count">${c}</span></div>`).join('');
    document.addEventListener('click',()=>{document.getElementById('mapPopup').style.display='none';});
}
function showMapPopup(city,el){
    const popup=document.getElementById('mapPopup');
    const s=siniestros.find(x=>x.zona===city.region||x.direccion.includes(city.name));
    popup.innerHTML=`<button class="popup-close" onclick="this.parentElement.style.display='none'">&times;</button><h4>${city.name}</h4><p><strong>${city.count}</strong> siniestros activos</p>${s?`<p>Ultimo: <strong>${s.id}</strong> - ${s.cliente}</p><p>${TIPOS_LABEL[s.tipo]} | Urgencia: ${s.urgencia}</p>`:''}`;
    popup.style.left=Math.min(city.x,70)+'%';popup.style.top=Math.min(city.y+5,80)+'%';popup.style.display='block';
}

// ============================================================
// EXPEDIENTES
// ============================================================
function initExpedientes(){renderExpTable();['filtroEstado','filtroTipo','filtroUrgencia','filtroOrden'].forEach(id=>document.getElementById(id).addEventListener('change',renderExpTable));}
function renderExpTable(){
    let f=[...siniestros];const e=document.getElementById('filtroEstado').value,t=document.getElementById('filtroTipo').value,u=parseInt(document.getElementById('filtroUrgencia').value),o=document.getElementById('filtroOrden').value;
    if(e)f=f.filter(s=>s.estado===e);if(t)f=f.filter(s=>s.tipo===t);if(u>0)f=f.filter(s=>s.urgencia>=u);
    if(o==='fecha-desc')f.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));else if(o==='fecha-asc')f.sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));else if(o==='urgencia-desc')f.sort((a,b)=>b.urgencia-a.urgencia);else f.sort((a,b)=>b.fraude-a.fraude);
    document.getElementById('expedientesTableBody').innerHTML=f.map(s=>`<tr><td><strong>${s.id}</strong></td><td>${s.cliente}</td><td><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</td><td>${statusBadge(s.estado)}</td><td>${fmtDate(s.fecha)}</td><td>${urgBadge(s.urgencia)}</td><td>${fraudBadge(s.fraude)}</td><td><span class="ia-badge ${s.iaGestion==='full'?'ia-full':'ia-partial'}"><i class="fas fa-robot"></i> ${s.iaGestion==='full'?'100% IA':'IA+H'}</span></td><td><div class="table-actions"><button onclick="openDetail('${s.id}')"><i class="fas fa-eye"></i></button></div></td></tr>`).join('');
}

// ============================================================
// DETAIL
// ============================================================
function renderDetail(s){
    document.getElementById('detalleTitle').textContent=s.id;
    document.getElementById('detalleEstadoBadge').outerHTML=statusBadge(s.estado);
    const ca=(s.iaConfianza/100)*360,cc=s.iaConfianza>=85?'#8b5cf6':s.iaConfianza>=70?'#f59e0b':'#ef4444';
    document.getElementById('iaScoreCard').innerHTML=`<div class="ai-score-content"><div class="ai-confidence-ring" style="background:conic-gradient(${cc} ${ca}deg,#e2e8f0 ${ca}deg)"><div class="ai-confidence-inner"><span class="ai-confidence-value">${s.iaConfianza}%</span><span class="ai-confidence-label">Confianza</span></div></div><div class="ai-score-details"><span class="ai-score-badge ${s.iaGestion==='full'?'full-ai':'human-needed'}"><i class="fas fa-robot"></i> ${s.iaGestion==='full'?'Gestionado 100% por IA':'Requirio intervencion humana'}</span><div class="ai-score-times"><div class="ai-score-time ai-time"><strong>${s.iaTiempo}</strong><span>IA</span></div><div class="ai-score-time human-time"><strong>${s.humanoTiempo}</strong><span>Humano est.</span></div></div></div></div>`;
    document.getElementById('detalleInfo').innerHTML=`<div class="detail-info-item"><label>CLIENTE</label><span>${s.cliente}</span></div><div class="detail-info-item"><label>TELEFONO</label><span>${s.telefono}</span></div><div class="detail-info-item"><label>EMAIL</label><span>${s.email}</span></div><div class="detail-info-item"><label>POLIZA</label><span>${s.poliza}</span></div><div class="detail-info-item"><label>TIPO</label><span><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</span></div><div class="detail-info-item"><label>URGENCIA</label><span>${urgBadge(s.urgencia)}</span></div><div class="detail-info-item"><label>FECHA</label><span>${fmtDate(s.fecha)}</span></div><div class="detail-info-item"><label>ZONA</label><span>${s.zona}</span></div><div class="detail-info-item"><label>PERITO</label><span>${s.perito||'Sin asignar'}</span></div><div class="detail-info-item"><label>DIRECCION</label><span>${s.direccion}</span></div><div class="detail-info-item" style="grid-column:1/-1"><label>DESCRIPCION</label><span>${s.descripcion}</span></div>`;
    document.getElementById('detalleTimeline').innerHTML=s.timeline.map(t=>`<div class="timeline-item"><div class="timeline-dot ${t.tipo}"></div><div class="timeline-content"><h4>${t.titulo}</h4><p>${t.desc}</p><span class="timeline-date">${t.fecha}</span></div></div>`).join('');
    const ch=document.getElementById('chatContainer');ch.innerHTML=s.chat.map(m=>`<div class="chat-message"><div class="chat-avatar">${m.iniciales}</div><div class="chat-bubble"><div class="chat-name">${m.usuario}</div><div class="chat-text">${m.texto}</div><div class="chat-time">${m.hora}</div></div></div>`).join('');ch.scrollTop=ch.scrollHeight;
    const sc=s.fraude,col=sc<25?'#16a34a':sc<50?'#f59e0b':'#dc2626',lv=sc<25?'Bajo':sc<50?'Medio':'Alto',ang=(sc/100)*360;
    document.getElementById('fraudScoreContainer').innerHTML=`<div class="fraud-gauge" style="background:conic-gradient(${col} ${ang}deg,#e2e8f0 ${ang}deg)"><div class="fraud-gauge-inner"><span class="fraud-gauge-value" style="color:${col}">${sc}</span><span class="fraud-gauge-label">/100</span></div></div><p class="fraud-description" style="color:${col};font-weight:600">${lv}</p>`;
    document.getElementById('documentsList').innerHTML=s.documentos.map(d=>`<div class="doc-item"><i class="fas ${d.icono}"></i><span class="doc-name">${d.nombre}</span><span class="doc-size">${d.tamano}</span></div>`).join('');
    document.getElementById('changesList').innerHTML=s.cambios.map(c=>`<div class="change-item">${c.texto}<span class="change-date">${c.fecha}</span></div>`).join('');
    setupActions(s);
}
function setupActions(s){
    document.getElementById('btnAsignarPerito').onclick=()=>openModal('modalPerito');
    document.getElementById('btnEnviarGrua').onclick=()=>openModal('modalGrua');
    document.getElementById('btnCerrarExpediente').onclick=()=>{if(!confirm('Cerrar?'))return;s.estado='Resuelto';renderDetail(s);updateKPIs();renderExpTable();renderDashboardTable();showToast('Expediente cerrado','success');};
    const ci=document.getElementById('chatInput'),send=()=>{const t=ci.value.trim();if(!t)return;s.chat.push({usuario:'Ana Martinez',iniciales:'AM',texto:t,hora:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})});ci.value='';renderDetail(s);};
    document.getElementById('btnEnviarChat').onclick=send;ci.onkeydown=e=>{if(e.key==='Enter')send();};
    document.getElementById('btnConfirmarPerito').onclick=()=>{const p=document.getElementById('selectPerito').value;s.perito=p;s.estado='Perito asignado';closeModal('modalPerito');renderDetail(s);updateKPIs();renderExpTable();showToast('Perito asignado','success');};
    document.getElementById('btnConfirmarGrua').onclick=()=>{closeModal('modalGrua');showToast('Grua solicitada','success');};
}

// ============================================================
// FORM
// ============================================================
function initForm(){
    const form=document.getElementById('formNuevoSiniestro'),urg=document.getElementById('urgencia'),uv=document.getElementById('urgenciaValue'),ua=document.getElementById('uploadArea'),fi=document.getElementById('fileInput'),bg=document.getElementById('btnGeolocalizacion');
    urg.addEventListener('input',()=>{uv.textContent=urg.value;const v=+urg.value;uv.style.color=v<=3?'#16a34a':v<=6?'#f59e0b':v<=8?'#ea580c':'#dc2626';});
    ua.addEventListener('click',()=>fi.click());
    ua.addEventListener('dragover',e=>{e.preventDefault();ua.style.borderColor='var(--primary)';});
    ua.addEventListener('dragleave',()=>ua.style.borderColor='');
    ua.addEventListener('drop',e=>{e.preventDefault();ua.style.borderColor='';handleFiles(e.dataTransfer.files);});
    fi.addEventListener('change',()=>handleFiles(fi.files));
    bg.addEventListener('click',()=>{bg.innerHTML='<i class="fas fa-spinner fa-spin"></i> Obteniendo...';setTimeout(()=>{document.getElementById('geoLat').textContent='40.416775';document.getElementById('geoLng').textContent='-3.703790';document.getElementById('geoAddress').textContent='Madrid (aproximada)';document.getElementById('geoInfo').style.display='block';bg.innerHTML='<i class="fas fa-check"></i> Obtenida';bg.style.background='var(--success-light)';bg.style.color='var(--success)';},1000);});
    form.addEventListener('submit',e=>{e.preventDefault();submitNew();});
}
function handleFiles(files){const g=document.getElementById('previewGrid');Array.from(files).forEach(f=>{if(!f.type.startsWith('image/'))return;const r=new FileReader();r.onload=e=>{const d=document.createElement('div');d.className='preview-item';d.innerHTML=`<img src="${e.target.result}"><button class="remove-btn" type="button" onclick="this.parentElement.remove()">&times;</button>`;g.appendChild(d);};r.readAsDataURL(f);});}
function submitNew(){
    const n=document.getElementById('clienteNombre').value,t=document.getElementById('tipoSiniestro').value,u=+document.getElementById('urgencia').value;
    const id='EXP-2024-'+String(892+siniestros.length-10).padStart(4,'0');
    siniestros.unshift({id,cliente:n,telefono:document.getElementById('clienteTelefono').value,email:document.getElementById('clienteEmail').value,poliza:document.getElementById('clientePoliza').value,tipo:t,descripcion:document.getElementById('descripcion').value,estado:'Abierto',fecha:new Date().toISOString().slice(0,10),urgencia:u,fraude:Math.floor(Math.random()*30),perito:null,zona:'Madrid',direccion:document.getElementById('direccionManual').value||'Madrid',lat:40.4168,lng:-3.7038,iaConfianza:85+Math.floor(Math.random()*15),iaGestion:'full',iaTiempo:(Math.random()*2+.5).toFixed(1)+' min',humanoTiempo:Math.floor(Math.random()*15+10)+' min',timeline:[{fecha:new Date().toISOString().slice(0,16).replace('T',' '),titulo:'Registrado',desc:'IA',tipo:'active'}],chat:[],documentos:[],cambios:[{texto:'Creado por <strong>IA</strong>',fecha:fmtNow()}]});
    resetForm();updateKPIs();renderDashboardTable();renderExpTable();showToast(`${id} registrado`,'ai');navigateTo('expedientes');
}
function resetForm(){document.getElementById('formNuevoSiniestro').reset();document.getElementById('previewGrid').innerHTML='';document.getElementById('geoInfo').style.display='none';document.getElementById('urgenciaValue').textContent='5';const b=document.getElementById('btnGeolocalizacion');b.innerHTML='<i class="fas fa-crosshairs"></i> Ubicacion automatica';b.style.background='';b.style.color='';}

// ============================================================
// CALL SIMULATOR
// ============================================================
function initCallSimulator(){
    const SCRIPT=[{type:'system',text:'Llamada entrante detectada...'},{type:'ai',text:'Buenos dias, soy el asistente IA de SegurosApp. ¿En que puedo ayudarle?'},{type:'client',text:'Hola, acabo de tener un accidente en la A-6.'},{type:'ai',text:'¿Se encuentra bien? ¿Hay heridos?'},{type:'client',text:'Estoy bien. Mi coche tiene danos graves.'},{type:'system',text:'IA identificando... Poliza POL-2024-01234 localizada.'},{type:'ai',text:'Sra. Martinez, tiene cobertura a todo riesgo. Abro el parte automaticamente.'},{type:'client',text:'Estoy en A-6 salida 22, sentido Madrid.'},{type:'system',text:'Expediente EXP-2024-0900 creado. Grua solicitada.'},{type:'ai',text:'Grua en camino, 12 minutos. Perito asignado. Le envio SMS con los datos.'},{type:'client',text:'Increible, que rapido. Gracias.'},{type:'system',text:'Llamada finalizada. Duracion: 1:42. 100% gestionado por IA.'}];
    let ci,ti,si;
    document.getElementById('btnStartCall').addEventListener('click',()=>{
        document.getElementById('callIdle').style.display='none';document.getElementById('callActive').style.display='block';
        document.getElementById('callTranscript').innerHTML='';document.getElementById('btnEndCall').style.display='none';si=0;
        let sec=0;ti=setInterval(()=>{sec++;document.getElementById('callTimer').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');},1000);
        ci=setInterval(()=>{if(si>=SCRIPT.length){clearInterval(ci);document.getElementById('voiceWave').classList.add('paused');document.getElementById('btnEndCall').style.display='inline-flex';return;}
            const l=SCRIPT[si],tr=document.getElementById('callTranscript'),d=document.createElement('div');d.className='transcript-msg '+l.type;
            if(l.type==='ai')d.innerHTML=`<span class="speaker">Agente IA</span>${l.text}`;else if(l.type==='client'){d.innerHTML=`<span class="speaker">Cliente</span>${l.text}`;document.getElementById('callName').textContent='Sra. Martinez';}else d.innerHTML=l.text;
            tr.appendChild(d);tr.scrollTop=tr.scrollHeight;si++;},2500);
    });
    document.getElementById('btnEndCall').addEventListener('click',()=>{clearInterval(ci);clearInterval(ti);document.getElementById('callIdle').style.display='flex';document.getElementById('callActive').style.display='none';});
}

// ============================================================
// WHATSAPP SIMULATOR
// ============================================================
function initWhatsAppSimulator(){
    const SCRIPT=[{type:'sent',text:'Hola, se me ha roto tuberia y hay agua por todo el salon 😰'},{type:'received',sender:'IA',text:'Hola, soy el asistente IA. ¿Ha cortado el agua general?'},{type:'sent',text:'Si, ya lo corte. Pero hay muchos danos.'},{type:'received',sender:'IA',text:'Entendido. Abro parte por inundacion. ¿Puede enviar fotos?'},{type:'sent',text:'📸📸📸 [3 fotos]'},{type:'received',sender:'IA',text:'Analisis IA:\n✅ Parquet danado\n✅ Muebles afectados\nEstimacion: 4.200-5.800€'},{type:'received',sender:'IA',text:'Expediente abierto. Perito manana 9:00-12:00. ¿Le va bien?'},{type:'sent',text:'Perfecto, gracias! 👍'},{type:'received',sender:'IA',text:'Resumen enviado por email. Disponible 24/7 😊'}];
    let wi,si;const btn=document.getElementById('btnStartWhatsapp');
    btn.addEventListener('click',()=>{btn.style.display='none';si=0;const chat=document.getElementById('waChat');
        wi=setInterval(()=>{if(si>=SCRIPT.length){clearInterval(wi);const rb=document.createElement('button');rb.className='btn btn-ai';rb.innerHTML='<i class="fas fa-redo"></i> Reiniciar';rb.onclick=()=>{chat.innerHTML='<div class="wa-date-divider"><span>Hoy</span></div>';document.querySelector('.wa-input-area').innerHTML='';document.querySelector('.wa-input-area').appendChild(btn);btn.style.display='inline-flex';};document.querySelector('.wa-input-area').appendChild(rb);return;}
            const tp=chat.querySelector('.wa-typing');if(tp)tp.remove();
            const l=SCRIPT[si],tm=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),d=document.createElement('div');d.className='wa-msg '+(l.type==='sent'?'sent':'received');
            let c=l.text.replace(/\n/g,'<br>');if(l.sender)c=`<span class="wa-msg-sender">${l.sender}</span>`+c;d.innerHTML=c+`<span class="wa-msg-time">${tm}</span>`;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;si++;
            if(si<SCRIPT.length&&SCRIPT[si].type==='received')setTimeout(()=>{const t=document.createElement('div');t.className='wa-typing';t.innerHTML='<div class="wa-typing-dots"><span></span><span></span><span></span></div>';chat.appendChild(t);chat.scrollTop=chat.scrollHeight;},800);
        },2800);
    });
}

// ============================================================
// ANTI-FRAUD DEMO
// ============================================================
function initAntiFraud(){
    const STEPS=[{text:'Verificando geolocalizacion del siniestro...',result:'ok',icon:'fa-map-marker-alt',msg:'Ubicacion verificada ✓'},{text:'Analizando metadatos de fotos adjuntas...',result:'warning',icon:'fa-camera',msg:'⚠️ ANOMALIA: Metadatos indican fotos tomadas 3 dias antes del siniestro'},{text:'Cruzando historial del cliente...',result:'ok',icon:'fa-user',msg:'2 siniestros previos en 3 anios ✓'},{text:'Detectando red de fraude organizada...',result:'alert',icon:'fa-project-diagram',msg:'🚨 ALERTA: Cliente vinculado a 3 reclamaciones similares en misma zona'},{text:'Comparando con base de datos nacional...',result:'ok',icon:'fa-database',msg:'Sin coincidencias en BDNF ✓'},{text:'Calculando score final...',result:'alert',icon:'fa-calculator',msg:'Score de fraude: 78/100 - ALTO RIESGO'}];
    document.getElementById('btnAnalizarFraude').addEventListener('click',()=>{
        document.getElementById('btnAnalizarFraude').style.display='none';
        const a=document.getElementById('antifraudAnalysis');a.style.display='block';
        const steps=document.getElementById('analysisSteps');steps.innerHTML='';
        document.getElementById('analysisResult').style.display='none';
        let i=0;const run=()=>{if(i>=STEPS.length){document.getElementById('analysisSpinner').querySelector('.spinner-ring').style.animation='none';document.getElementById('analysisTitle').textContent='Analisis completado';
            const r=document.getElementById('analysisResult');r.style.display='block';r.className='analysis-result fraud';r.innerHTML=`<h4 style="color:#dc2626">🚨 Score de Fraude: 78/100 - ALTO RIESGO</h4><p><strong>Recomendacion:</strong> Congelar expediente. Asignar investigador. Las fotos fueron tomadas antes del siniestro reportado y el cliente tiene vinculacion con una red de 3 reclamaciones similares en la zona de Valencia. Probabilidad de fraude: 78%.</p>`;return;}
            document.getElementById('analysisTitle').textContent=STEPS[i].text;
            setTimeout(()=>{const d=document.createElement('div');d.className='analysis-step '+STEPS[i].result;d.innerHTML=`<i class="fas ${STEPS[i].icon}"></i> ${STEPS[i].msg}`;steps.appendChild(d);i++;setTimeout(run,800);},1200);
        };run();
    });
}

// ============================================================
// COMPARISON
// ============================================================
function initComparison(){
    const HUMAN_STEPS=['Contestar telefono','Pedir datos al cliente','Buscar poliza en sistema','Verificar cobertura','Rellenar formulario','Asignar perito manualmente','Llamar a empresa de grua','Enviar email confirmacion'];
    const AI_STEPS=['Recibir llamada automaticamente','Identificar cliente por voz','Verificar poliza y cobertura','Clasificar siniestro','Asignar perito + grua','Enviar SMS + email','Actualizar dashboard','Notificar equipo'];
    document.getElementById('btnStartComparison').addEventListener('click',()=>{
        document.getElementById('btnStartComparison').style.display='none';document.getElementById('comparisonGrid').style.display='grid';document.getElementById('comparisonResult').style.display='none';
        const hs=document.getElementById('humanSteps'),as=document.getElementById('aiSteps');hs.innerHTML='';as.innerHTML='';
        HUMAN_STEPS.forEach(s=>{const d=document.createElement('div');d.className='comp-step pending';d.innerHTML=`<i class="fas fa-clock"></i> ${s}`;hs.appendChild(d);});
        AI_STEPS.forEach(s=>{const d=document.createElement('div');d.className='comp-step pending';d.innerHTML=`<i class="fas fa-clock"></i> ${s}`;as.appendChild(d);});
        let hSec=0,aSec=0,hStep=0,aStep=0,hDone=false,aDone=false;
        const hTimer=setInterval(()=>{hSec++;document.getElementById('humanTime').textContent=String(Math.floor(hSec/60)).padStart(2,'0')+':'+String(hSec%60).padStart(2,'0');document.getElementById('humanBar').style.width=(hSec/1080*100)+'%';
            if(hSec%135===0&&hStep<HUMAN_STEPS.length){const steps=hs.querySelectorAll('.comp-step');if(hStep>0)steps[hStep-1].className='comp-step done',steps[hStep-1].querySelector('i').className='fas fa-check';steps[hStep].className='comp-step doing';steps[hStep].querySelector('i').className='fas fa-spinner fa-spin';if(hSec===405){steps[hStep].className='comp-step error';steps[hStep].querySelector('i').className='fas fa-times';}hStep++;}
            if(hSec>=1080&&!hDone){hDone=true;clearInterval(hTimer);hs.querySelectorAll('.comp-step').forEach(s=>{if(!s.classList.contains('error')){s.className='comp-step done';s.querySelector('i').className='fas fa-check';}});document.getElementById('humanBar').style.width='100%';}
        },16.67);// ~1 real second = 1 simulated minute
        const aTimer=setInterval(()=>{aSec++;document.getElementById('aiTime').textContent=String(Math.floor(aSec/60)).padStart(2,'0')+':'+String(aSec%60).padStart(2,'0');document.getElementById('aiBar').style.width=(aSec/120*100)+'%';
            if(aSec%(15)===0&&aStep<AI_STEPS.length){const steps=as.querySelectorAll('.comp-step');if(aStep>0)steps[aStep-1].className='comp-step done',steps[aStep-1].querySelector('i').className='fas fa-check';steps[aStep].className='comp-step doing';steps[aStep].querySelector('i').className='fas fa-bolt';aStep++;}
            if(aSec>=120&&!aDone){aDone=true;clearInterval(aTimer);as.querySelectorAll('.comp-step').forEach(s=>{s.className='comp-step done';s.querySelector('i').className='fas fa-check';});document.getElementById('aiBar').style.width='100%';
                document.getElementById('comparisonResult').style.display='block';document.getElementById('comparisonResult').innerHTML=`<h3>🎉 SiniestrosAI completo el proceso 9x mas rapido</h3><p>IA: 2 minutos | Humano: 18 minutos | Ahorro: 89% del tiempo</p>`;
                launchConfetti();
            }
        },16.67);
    });
}

// ============================================================
// ROI CALCULATOR
// ============================================================
function initROI(){
    const update=()=>{
        const admin=+document.getElementById('roiAdmin').value,sueldo=+document.getElementById('roiSueldo').value,sin=+document.getElementById('roiSiniestros').value;
        document.getElementById('roiAdminLabel').textContent=admin;document.getElementById('roiSueldoLabel').textContent=sueldo.toLocaleString('es-ES')+' EUR';document.getElementById('roiSiniestrosLabel').textContent=sin;
        const costActual=admin*sueldo,costIA=Math.round(sin*8.5+990),ahMes=costActual-costIA,ahAnual=ahMes*12,ah5=ahAnual*5;
        document.getElementById('roiCostActual').textContent=costActual.toLocaleString('es-ES')+' EUR';document.getElementById('roiCostIA').textContent=costIA.toLocaleString('es-ES')+' EUR';document.getElementById('roiAhorroMes').textContent=Math.max(0,ahMes).toLocaleString('es-ES')+' EUR';document.getElementById('roiAhorroAnual').textContent=Math.max(0,ahAnual).toLocaleString('es-ES')+' EUR';document.getElementById('roiAhorro5').textContent=Math.max(0,ah5).toLocaleString('es-ES')+' EUR';document.getElementById('roiCtaAmount').textContent=Math.max(0,ahAnual).toLocaleString('es-ES');
        if(roiChartInstance)roiChartInstance.destroy();
        roiChartInstance=new Chart(document.getElementById('roiChart'),{type:'bar',data:{labels:['Coste Actual','Coste con IA','Ahorro Mensual'],datasets:[{data:[costActual,costIA,Math.max(0,ahMes)],backgroundColor:['#fca5a5','#86efac','#c4b5fd'],borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'},ticks:{callback:v=>v.toLocaleString('es-ES')+'€'}}}}});
    };
    ['roiAdmin','roiSueldo','roiSiniestros'].forEach(id=>document.getElementById(id).addEventListener('input',update));
    document.getElementById('roiCta').addEventListener('click',()=>openModal('modalContacto'));
    update();
}

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================
function initPushNotifications(){
    setInterval(()=>{
        const m=PUSH_MESSAGES[Math.floor(Math.random()*PUSH_MESSAGES.length)];
        const c=document.getElementById('pushNotifications');
        const d=document.createElement('div');d.className='push-notif';
        d.innerHTML=`<div class="push-notif-icon"><i class="fas ${m.icon}"></i></div><div class="push-notif-content"><span class="push-notif-title">${m.title}</span><span class="push-notif-text">${m.text}</span><span class="push-notif-time">Ahora mismo</span></div>`;
        c.appendChild(d);
        setTimeout(()=>{d.classList.add('leaving');setTimeout(()=>d.remove(),500);},5000);
        if(c.children.length>3)c.firstChild.remove();
    },25000);
}

// ============================================================
// CATASTROPHE MODE
// ============================================================
function activateCatastrophe(){
    if(catastropheActive)return;catastropheActive=true;
    document.body.classList.add('catastrophe-mode');document.getElementById('catastropheBanner').style.display='flex';
    document.getElementById('agentCountLabel').textContent='24 Agentes IA activos';
    // Add extra agents visually
    const g=document.getElementById('agentsGrid');
    for(let i=0;i<4;i++){const names=['Ag. Emergencias','Ag. Triage','Ag. Logistica','Ag. Comunicacion'];
        const d=document.createElement('div');d.className='agent-card cat-agent';d.innerHTML=`<div class="agent-avatar"><i class="fas fa-bolt"></i><div class="agent-status-dot processing"></div></div><div class="agent-info"><span class="agent-name">${names[i]}</span><span class="agent-status-text processing">Procesando...</span><span class="agent-tasks">0 tareas</span></div>`;g.appendChild(d);}
    // Accelerate feed
    showToast('🚨 MODO CATASTROFE ACTIVADO - 47 siniestros DANA','warning');
}
function deactivateCatastrophe(){
    catastropheActive=false;document.body.classList.remove('catastrophe-mode');document.getElementById('catastropheBanner').style.display='none';
    document.getElementById('agentCountLabel').textContent='8 Agentes IA activos';
    document.querySelectorAll('.cat-agent').forEach(e=>e.remove());
    showToast('Modo catastrofe desactivado','success');
}

// ============================================================
// CONFETTI
// ============================================================
function launchConfetti(){
    const canvas=document.getElementById('confettiCanvas'),ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth;canvas.height=window.innerHeight;
    const pieces=[];const colors=['#8b5cf6','#06b6d4','#22c55e','#f59e0b','#ef4444','#3b82f6'];
    for(let i=0;i<150;i++)pieces.push({x:Math.random()*canvas.width,y:Math.random()*-canvas.height,w:Math.random()*8+4,h:Math.random()*4+2,color:colors[Math.floor(Math.random()*colors.length)],speed:Math.random()*3+2,angle:Math.random()*360,spin:Math.random()*10-5});
    let frame=0;const animate=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);pieces.forEach(p=>{p.y+=p.speed;p.angle+=p.spin;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle*Math.PI/180);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();});frame++;if(frame<200)requestAnimationFrame(animate);else ctx.clearRect(0,0,canvas.width,canvas.height);};animate();
}

// ============================================================
// METRICS
// ============================================================
function initMetricas(){
    new Chart(document.getElementById('chartResolucion'),{type:'bar',data:{labels:['Auto','Hogar','Salud','Robo','Otro'],datasets:[{data:[3.8,5.2,2.1,6.5,4.0],backgroundColor:['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'],borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:'#f1f5f9'}},y:{grid:{display:false}}}}});
    new Chart(document.getElementById('chartAhorro'),{type:'line',data:{labels:['Jul','Ago','Sep','Oct','Nov','Dic'],datasets:[{data:[12500,19800,26300,33100,40200,47320],borderColor:'#16a34a',backgroundColor:'rgba(22,163,74,.1)',fill:true,tension:.4,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'},ticks:{callback:v=>v.toLocaleString('es-ES')+'€'}}}}});
    new Chart(document.getElementById('chartSatisfaccion'),{type:'line',data:{labels:['Jul','Ago','Sep','Oct','Nov','Dic'],datasets:[{data:[7.8,8.0,8.1,8.3,8.5,8.7],borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,.1)',fill:true,tension:.4,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{min:6,max:10,grid:{color:'#f1f5f9'}}}}});
}

// ============================================================
// NOTIFICATIONS / SEARCH / MODALS / TOASTS / UTILS
// ============================================================
function initNotifications(){const b=document.getElementById('notifBtn'),d=document.getElementById('notifDropdown');b.addEventListener('click',e=>{e.stopPropagation();d.classList.toggle('show');});document.addEventListener('click',()=>d.classList.remove('show'));d.addEventListener('click',e=>e.stopPropagation());document.querySelector('.notif-clear').addEventListener('click',()=>{document.querySelectorAll('.notif-item.unread').forEach(i=>i.classList.remove('unread'));b.querySelector('.badge').style.display='none';});}
function initSearch(){document.getElementById('globalSearch').addEventListener('input',e=>{const q=e.target.value.toLowerCase().trim();if(q.length<2)return;const r=siniestros.filter(s=>s.id.toLowerCase().includes(q)||s.cliente.toLowerCase().includes(q));if(r.length===1)openDetail(r[0].id);else if(r.length>0)navigateTo('expedientes');});}
function openModal(id){document.getElementById(id).classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('show');}
function showToast(msg,type){const c=document.getElementById('toastContainer'),t=document.createElement('div');t.className=`toast ${type||'info'}`;const icons={success:'fa-check-circle',error:'fa-times-circle',warning:'fa-exclamation-triangle',info:'fa-info-circle',ai:'fa-robot'};t.innerHTML=`<i class="fas ${icons[type]||icons.info}"></i> ${msg}`;c.appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(100%)';setTimeout(()=>t.remove(),300);},3500);}
function statusBadge(e){const c={'Abierto':'status-abierto','En gestion':'status-gestion','Perito asignado':'status-perito','Resuelto':'status-resuelto'};return `<span class="status-badge ${c[e]||''}" id="detalleEstadoBadge">${e}</span>`;}
function urgBadge(l){return `<span class="urgency-badge ${l<=3?'urgency-low':l<=6?'urgency-medium':l<=8?'urgency-high':'urgency-critical'}">${l}</span>`;}
function fraudBadge(s){const[c,i]=s<25?['fraud-low','fa-shield-alt']:s<50?['fraud-medium','fa-exclamation-triangle']:['fraud-high','fa-skull-crossbones'];return `<span class="fraud-badge ${c}"><i class="fas ${i}"></i> ${s}</span>`;}
function fmtDate(d){return new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'});}
function fmtNow(){const n=new Date();return n.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'})+' '+n.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});}

// ============================================================
// 1. VOICE SIMULATOR (Web Speech API)
// ============================================================
function initVoiceSimulator(){
    const VOICE_SCRIPT=[
        {role:'ai',text:'Buenos dias, soy el asistente de inteligencia artificial de SegurosApp. En que puedo ayudarle?'},
        {role:'client',text:'Hola, acabo de tener un accidente de coche en la A 6, necesito ayuda urgente.'},
        {role:'ai',text:'Lamento escuchar eso. Se encuentra usted bien? Hay heridos?'},
        {role:'client',text:'Estoy bien, solo un poco asustada. El otro conductor tambien esta bien.'},
        {role:'ai',text:'Me alegro. He localizado su poliza. Tiene cobertura a todo riesgo. Voy a abrir el parte automaticamente.'},
        {role:'client',text:'Estoy en la A 6, a la altura de la salida 22, sentido Madrid.'},
        {role:'ai',text:'Perfecto. He registrado el siniestro. Ya he solicitado una grua. Llegara en 12 minutos. Un perito le contactara en 2 horas.'},
        {role:'client',text:'Increible, que rapido. Muchas gracias.'},
        {role:'ai',text:'De nada. Le envio un SMS con toda la informacion. Que se mejore. Hasta luego.'}
    ];
    let voiceIdx=0,speaking=false,paused=false,currentUtterance=null;
    const btn=document.getElementById('btnStartVoice');
    if(!btn)return;

    btn.addEventListener('click',()=>{
        if(!window.speechSynthesis){showToast('Speech API no disponible','warning');return;}
        navigateTo('simulador');
        document.getElementById('callIdle').style.display='none';
        document.getElementById('callActive').style.display='block';
        const tr=document.getElementById('callTranscript');
        tr.innerHTML=`<div class="voice-equalizer" id="voiceEq"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
            <div class="voice-status" id="voiceStatus">Iniciando llamada con voz IA...</div>
            <div class="voice-controls"><button class="btn btn-outline" id="btnVoicePause"><i class="fas fa-pause"></i> Pausar</button><button class="btn btn-danger" id="btnVoiceStop"><i class="fas fa-stop"></i> Detener</button></div>`;
        document.getElementById('callName').textContent='Llamada con Voz IA';
        document.getElementById('btnEndCall').style.display='none';
        voiceIdx=0;speaking=true;paused=false;

        // Timer
        let sec=0;const ti=setInterval(()=>{if(!speaking){clearInterval(ti);return;}if(!paused)sec++;document.getElementById('callTimer').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');},1000);

        document.getElementById('btnVoicePause').addEventListener('click',()=>{
            if(paused){speechSynthesis.resume();paused=false;document.getElementById('btnVoicePause').innerHTML='<i class="fas fa-pause"></i> Pausar';document.getElementById('voiceEq').classList.remove('paused');}
            else{speechSynthesis.pause();paused=true;document.getElementById('btnVoicePause').innerHTML='<i class="fas fa-play"></i> Continuar';document.getElementById('voiceEq').classList.add('paused');}
        });
        document.getElementById('btnVoiceStop').addEventListener('click',()=>{
            speechSynthesis.cancel();speaking=false;clearInterval(ti);
            document.getElementById('voiceEq').classList.add('paused');
            document.getElementById('voiceStatus').innerHTML='<i class="fas fa-check-circle" style="color:#22c55e"></i> Llamada completada - Parte abierto automaticamente';
            document.getElementById('btnEndCall').style.display='inline-flex';
        });

        function speakNext(){
            if(voiceIdx>=VOICE_SCRIPT.length||!speaking){
                document.getElementById('voiceEq').classList.add('paused');
                document.getElementById('voiceStatus').innerHTML='<i class="fas fa-check-circle" style="color:#22c55e"></i> Llamada completada - Parte abierto automaticamente';
                document.getElementById('btnEndCall').style.display='inline-flex';
                speaking=false;return;
            }
            const line=VOICE_SCRIPT[voiceIdx];
            // Add transcript message
            const msgDiv=document.createElement('div');
            msgDiv.className='transcript-msg '+(line.role==='ai'?'ai':'client')+' speaking';
            msgDiv.id='voiceMsg'+voiceIdx;
            msgDiv.innerHTML=`<span class="speaker">${line.role==='ai'?'Agente IA':'Cliente'}</span>${line.text}`;
            const container=document.getElementById('callTranscript');
            const eqEl=document.getElementById('voiceEq');
            container.insertBefore(msgDiv,eqEl);
            container.scrollTop=container.scrollHeight;

            const utter=new SpeechSynthesisUtterance(line.text);
            utter.lang='es-ES';utter.rate=1.0;utter.pitch=line.role==='ai'?1.1:0.9;
            // Try to get Spanish female voice
            const voices=speechSynthesis.getVoices();
            const esVoice=voices.find(v=>v.lang.startsWith('es')&&v.name.toLowerCase().includes('female'))||voices.find(v=>v.lang.startsWith('es'));
            if(esVoice)utter.voice=esVoice;
            utter.onstart=()=>{document.getElementById('voiceEq').classList.remove('paused');document.getElementById('voiceStatus').textContent=(line.role==='ai'?'IA hablando...':'Cliente hablando...');};
            utter.onend=()=>{msgDiv.classList.remove('speaking');voiceIdx++;setTimeout(speakNext,600);};
            currentUtterance=utter;
            speechSynthesis.speak(utter);
        }
        // Wait for voices to load
        if(speechSynthesis.getVoices().length)setTimeout(speakNext,500);
        else speechSynthesis.onvoiceschanged=()=>setTimeout(speakNext,500);
    });
}

// ============================================================
// 2. MOBILE CLIENT DEMO
// ============================================================
let currentMobScreen=1,mobAutoplayInterval=null;

function initMobileDemo(){
    // Auto-advance from screen 3 (processing) after delay
}

function goMobScreen(n){
    currentMobScreen=n;
    for(let i=1;i<=5;i++){
        const pg=document.getElementById('mobPage'+i);
        if(pg)pg.classList.toggle('active',i===n);
    }
    document.querySelectorAll('.mob-dot').forEach((d,i)=>d.classList.toggle('active',i===n-1));
}
function nextMobScreen(){if(currentMobScreen<5)goMobScreen(currentMobScreen+1);}
function prevMobScreen(){if(currentMobScreen>1)goMobScreen(currentMobScreen-1);}

function startMobileAutoplay(){
    goMobScreen(1);
    let step=1;
    if(mobAutoplayInterval)clearInterval(mobAutoplayInterval);
    mobAutoplayInterval=setInterval(()=>{
        step++;
        if(step>5){clearInterval(mobAutoplayInterval);mobAutoplayInterval=null;return;}
        goMobScreen(step);
    },3000);
}

// ============================================================
// 3. GUIDED DEMO
// ============================================================
let demoStep=0,demoTimer=null;
const DEMO_STEPS=[
    {page:'dashboard',target:'.savings-banner',title:'Panel de Ahorro en Tiempo Real',text:'Visualiza al instante cuanto ahorra tu empresa frente a la gestion tradicional. El contador sube en tiempo real.'},
    {page:'dashboard',target:'.ai-agents-panel',title:'8 Agentes IA Especializados',text:'Cada agente trabaja 24/7 sin descanso: recepcionista, anti-fraude, clasificador, documentalista, perito, grua, legal y seguimiento.'},
    {page:'dashboard',target:'.ai-feed-panel',title:'Feed de Actividad en Vivo',text:'Cada accion de la IA se registra y ejecuta automaticamente. Transparencia total sobre lo que hace el sistema.'},
    {page:'simulador',target:'.call-simulator',title:'Voz IA Indistinguible de un Humano',text:'La IA atiende llamadas, identifica al cliente, abre partes y asigna recursos. Todo en menos de 2 minutos.'},
    {page:'simulador',target:'.whatsapp-simulator',title:'Gestion Completa por WhatsApp',text:'Tus clientes resuelven siniestros desde WhatsApp sin esperas, sin formularios, sin frustracion.'},
    {page:'antifraude',target:'.antifraud-container',title:'Deteccion de Fraude en Segundos',text:'El motor anti-fraude analiza geolocalizacion, metadatos, historial y redes de fraude en tiempo real.'},
    {page:'comparativa',target:'.comparison-container',title:'9 Veces Mas Rapido que un Humano',text:'Compara en directo: lo que un administrativo tarda 18 minutos, la IA lo resuelve en 2 minutos.'},
    {page:'roi',target:'.roi-container',title:'Calcula Tu Ahorro Ahora',text:'Introduce tus datos reales y descubre cuanto ahorras al mes, al ano y a 5 anos con SiniestrosAI.'},
    {page:'cliente',target:'.mobile-frame',title:'Experiencia del Cliente Perfecta',text:'Desde el boton SOS hasta las 5 estrellas. Todo automatico, sin llamadas, sin esperas.'}
];

function startGuidedDemo(){
    demoStep=0;
    document.getElementById('demoOverlay').style.display='block';
    showDemoStep();
}

function showDemoStep(){
    if(demoStep>=DEMO_STEPS.length){showDemoFinal();return;}
    const step=DEMO_STEPS[demoStep];
    // Navigate to the correct page
    navigateTo(step.page);
    // Wait for page to render
    setTimeout(()=>{
        const targetEl=document.querySelector(step.target);
        const spotlight=document.getElementById('demoSpotlight');
        const tooltip=document.getElementById('demoTooltip');
        const progress=document.getElementById('demoProgressFill');

        progress.style.width=((demoStep+1)/DEMO_STEPS.length*100)+'%';
        document.getElementById('demoStepLabel').textContent=`Paso ${demoStep+1}/${DEMO_STEPS.length}`;
        document.getElementById('demoTooltipTitle').textContent=step.title;
        document.getElementById('demoTooltipText').textContent=step.text;

        if(targetEl){
            const rect=targetEl.getBoundingClientRect();
            spotlight.style.left=(rect.left-8)+'px';
            spotlight.style.top=(rect.top-8)+'px';
            spotlight.style.width=(rect.width+16)+'px';
            spotlight.style.height=(rect.height+16)+'px';
            // Position tooltip
            const tooltipTop=rect.bottom+16;
            const tooltipLeft=Math.min(rect.left,window.innerWidth-400);
            tooltip.style.top=Math.min(tooltipTop,window.innerHeight-200)+'px';
            tooltip.style.left=Math.max(16,tooltipLeft)+'px';
            // Scroll into view
            targetEl.scrollIntoView({behavior:'smooth',block:'center'});
        }

        // Auto-advance
        if(demoTimer)clearTimeout(demoTimer);
        demoTimer=setTimeout(nextDemoStep,10000);
    },400);
}

function nextDemoStep(){
    if(demoTimer)clearTimeout(demoTimer);
    demoStep++;
    if(demoStep>=DEMO_STEPS.length){showDemoFinal();return;}
    showDemoStep();
}

function showDemoFinal(){
    const overlay=document.getElementById('demoOverlay');
    overlay.innerHTML=`<div class="demo-final"><div class="demo-final-content">
        <h2>Listo para transformar tu gestion de siniestros?</h2>
        <p>SiniestrosAI ahorra una media de 67% en costes operativos</p>
        <div style="display:flex;gap:1rem;justify-content:center;margin-top:1rem">
            <button class="btn btn-ai btn-xl" onclick="skipGuidedDemo();openModal('modalContacto')"><i class="fas fa-rocket"></i> SOLICITAR DEMO PERSONALIZADA</button>
            <button class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,.3)" onclick="skipGuidedDemo()">Cerrar</button>
        </div>
    </div></div>`;
    if(demoTimer)clearTimeout(demoTimer);
}

function skipGuidedDemo(){
    if(demoTimer)clearTimeout(demoTimer);
    const overlay=document.getElementById('demoOverlay');
    overlay.style.display='none';
    // Restore overlay content for future use
    overlay.innerHTML=`<div class="demo-progress-bar"><div class="demo-progress-fill" id="demoProgressFill"></div></div>
        <div class="demo-spotlight" id="demoSpotlight"></div>
        <div class="demo-tooltip" id="demoTooltip">
            <div class="demo-tooltip-step" id="demoStepLabel">Paso 1/10</div>
            <h3 id="demoTooltipTitle"></h3>
            <p id="demoTooltipText"></p>
            <div class="demo-tooltip-actions">
                <button class="btn btn-outline btn-sm" onclick="skipGuidedDemo()">Saltar demo</button>
                <button class="btn btn-ai btn-sm" id="btnDemoNext" onclick="nextDemoStep()">Siguiente <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>`;
    navigateTo('dashboard');
}
