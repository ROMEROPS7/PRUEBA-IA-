// ============================================================
// SINIESTROS AI - APP COMPLETA
// ============================================================

// Chart.js instance registry for cleanup
const chartInstances = {};
function createChart(canvasId, config) {
  if (chartInstances[canvasId]) { chartInstances[canvasId].destroy(); delete chartInstances[canvasId]; }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const instance = new Chart(canvas, config);
  chartInstances[canvasId] = instance;
  return instance;
}

const TIPOS_LABEL={coche:'Automovil',hogar:'Hogar',salud:'Salud',robo:'Robo',otro:'Otro'};









const TIPOS_ICON={coche:'fa-car-crash',hogar:'fa-house-damage',salud:'fa-heartbeat',robo:'fa-mask',otro:'fa-file-alt'};

const AI_AGENTS=[
    {id:'recepcionista',nombre:'Ag. Recepcionista',icon:'fa-headset',estado:'active',tareas:47,especialidad:'Atencion llamadas y WhatsApp'},
    {id:'antifraude',nombre:'Ag. Anti-Fraude',icon:'fa-shield-alt',estado:'processing',tareas:23,especialidad:'Deteccion fraude forense'},
    {id:'clasificador',nombre:'Ag. Clasificador',icon:'fa-tags',estado:'active',tareas:56,especialidad:'Clasificacion automatica'},
    {id:'documentalista',nombre:'Ag. Documentalista',icon:'fa-file-alt',estado:'active',tareas:34,especialidad:'OCR y verificacion docs'},
    {id:'perito',nombre:'Ag. Perito IA',icon:'fa-search-dollar',estado:'processing',tareas:18,especialidad:'Valoracion de danos'},
    {id:'grua',nombre:'Ag. Grua',icon:'fa-truck-pickup',estado:'waiting',tareas:12,especialidad:'Asistencia en carretera'},
    {id:'legal',nombre:'Ag. Legal',icon:'fa-balance-scale',estado:'active',tareas:29,especialidad:'Analisis responsabilidad'},
    {id:'seguimiento',nombre:'Ag. Seguimiento',icon:'fa-bell',estado:'active',tareas:41,especialidad:'Notificaciones y tracking'},
    {id:'meteorologo',nombre:'Ag. Meteorologo',icon:'fa-cloud-sun-rain',estado:'active',tareas:31,especialidad:'Cruce datos AEMET'},
    {id:'fotografo',nombre:'Ag. Fotografo',icon:'fa-camera-retro',estado:'processing',tareas:44,especialidad:'Analisis forense imagenes'},
    {id:'traductor',nombre:'Ag. Traductor',icon:'fa-language',estado:'active',tareas:15,especialidad:'Multiidioma EN/FR/DE/AR'},
    {id:'psicologo',nombre:'Ag. Psicologo',icon:'fa-brain',estado:'active',tareas:22,especialidad:'Analisis sentimiento'},
    {id:'abogado',nombre:'Ag. Abogado',icon:'fa-gavel',estado:'processing',tareas:19,especialidad:'Normativa y RGPD'},
    {id:'contable',nombre:'Ag. Contable',icon:'fa-calculator',estado:'active',tareas:38,especialidad:'Facturacion y provisiones'},
    {id:'medico',nombre:'Ag. Medico',icon:'fa-stethoscope',estado:'active',tareas:27,especialidad:'Valoracion lesiones'},
    {id:'reaseguros',nombre:'Ag. Reaseguros',icon:'fa-handshake',estado:'waiting',tareas:8,especialidad:'Cesion reaseguro'},
    {id:'regulatorio',nombre:'Ag. Regulatorio',icon:'fa-landmark',estado:'active',tareas:14,especialidad:'Cumplimiento DGSFP'},
    {id:'marketing',nombre:'Ag. Marketing',icon:'fa-bullhorn',estado:'active',tareas:33,especialidad:'NPS y retencion'},
    {id:'calidad',nombre:'Ag. Calidad',icon:'fa-award',estado:'processing',tareas:21,especialidad:'Auditorias automaticas'},
    {id:'predictor',nombre:'Ag. Predictor',icon:'fa-chart-line',estado:'active',tareas:45,especialidad:'ML prediccion siniestros'}
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

function esc(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

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
    initComunicaciones();initTracker();initPrediccion();initPricing();
    initIOT();initMarketplace();initIntegraciones();initReportes();
    initWhiteLabel();initSaaS();initNotifCenter();
    initNegociador().catch(()=>{});initVendedor().catch(()=>{});initVigilante().catch(()=>{});
    initModPolizas();initModCotizador();initModPeritacionVirtual();initModRechazos();
    initModRetencion();initModRecobro();initModSubrogacion();initModInvestigacion();
    initModNPS();initModRiesgo();initModCompliance();initModCompetencia();
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
    tb.innerHTML=[...siniestros].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).slice(0,6).map(s=>`<tr><td><strong>${esc(s.id)}</strong></td><td>${esc(s.cliente)}</td><td><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</td><td>${statusBadge(s.estado)}</td><td>${fmtDate(s.fecha)}</td><td>${urgBadge(s.urgencia)}</td><td><div class="table-actions"><button onclick="openDetail('${esc(s.id)}')"><i class="fas fa-eye"></i></button></div></td></tr>`).join('');
}
function renderChartSiniestrosMes(){createChart('chartSiniestrosMes',{type:'bar',data:{labels:['Jul','Ago','Sep','Oct','Nov','Dic'],datasets:[{label:'Abiertos',data:[15,12,18,22,20,24],backgroundColor:'#fee2e2',borderColor:'#dc2626',borderWidth:1},{label:'Gestion',data:[28,25,32,35,40,38],backgroundColor:'#fef3c7',borderColor:'#f59e0b',borderWidth:1},{label:'Resueltos',data:[45,52,48,55,60,65],backgroundColor:'#dcfce7',borderColor:'#16a34a',borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{usePointStyle:true,padding:12,font:{size:10}}}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'}}}}});}
function renderChartTipos(){const c={};siniestros.forEach(s=>{c[s.tipo]=(c[s.tipo]||0)+1});createChart('chartTipos',{type:'doughnut',data:{labels:Object.keys(c).map(k=>TIPOS_LABEL[k]),datasets:[{data:Object.values(c),backgroundColor:['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'],borderWidth:0,spacing:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,padding:12,font:{size:10}}}}}});}

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
function addFeed(f,i,pre){const m=AI_FEED_MESSAGES[i%AI_FEED_MESSAGES.length];const t=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'});const d=document.createElement('div');d.className='feed-item';d.innerHTML=`<div class="feed-icon"><i class="fas fa-robot"></i></div><div class="feed-text"><strong>${esc(m.agent)}:</strong> ${esc(m.text)}</div><span class="feed-time">${t}</span>`;if(pre)f.insertBefore(d,f.firstChild);else f.appendChild(d);}

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
    popup.innerHTML=`<button class="popup-close" onclick="this.parentElement.style.display='none'">&times;</button><h4>${esc(city.name)}</h4><p><strong>${city.count}</strong> siniestros activos</p>${s?`<p>Ultimo: <strong>${esc(s.id)}</strong> - ${esc(s.cliente)}</p><p>${TIPOS_LABEL[s.tipo]} | Urgencia: ${s.urgencia}</p>`:''}`;
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
    document.getElementById('expedientesTableBody').innerHTML=f.map(s=>`<tr><td><strong>${esc(s.id)}</strong></td><td>${esc(s.cliente)}</td><td><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</td><td>${statusBadge(s.estado)}</td><td>${fmtDate(s.fecha)}</td><td>${urgBadge(s.urgencia)}</td><td>${fraudBadge(s.fraude)}</td><td><span class="ia-badge ${s.iaGestion==='full'?'ia-full':'ia-partial'}"><i class="fas fa-robot"></i> ${s.iaGestion==='full'?'100% IA':'IA+H'}</span></td><td><div class="table-actions"><button onclick="openDetail('${esc(s.id)}')"><i class="fas fa-eye"></i></button></div></td></tr>`).join('');
}

// ============================================================
// DETAIL
// ============================================================
function renderDetail(s){
    document.getElementById('detalleTitle').textContent=s.id;
    document.getElementById('detalleEstadoBadge').outerHTML=statusBadge(s.estado);
    const ca=(s.iaConfianza/100)*360,cc=s.iaConfianza>=85?'#8b5cf6':s.iaConfianza>=70?'#f59e0b':'#ef4444';
    document.getElementById('iaScoreCard').innerHTML=`<div class="ai-score-content"><div class="ai-confidence-ring" style="background:conic-gradient(${cc} ${ca}deg,#e2e8f0 ${ca}deg)"><div class="ai-confidence-inner"><span class="ai-confidence-value">${s.iaConfianza}%</span><span class="ai-confidence-label">Confianza</span></div></div><div class="ai-score-details"><span class="ai-score-badge ${s.iaGestion==='full'?'full-ai':'human-needed'}"><i class="fas fa-robot"></i> ${s.iaGestion==='full'?'Gestionado 100% por IA':'Requirio intervencion humana'}</span><div class="ai-score-times"><div class="ai-score-time ai-time"><strong>${s.iaTiempo}</strong><span>IA</span></div><div class="ai-score-time human-time"><strong>${s.humanoTiempo}</strong><span>Humano est.</span></div></div></div></div>`;
    document.getElementById('detalleInfo').innerHTML=`<div class="detail-info-item"><label>CLIENTE</label><span>${esc(s.cliente)}</span></div><div class="detail-info-item"><label>TELEFONO</label><span>${esc(s.telefono)}</span></div><div class="detail-info-item"><label>EMAIL</label><span>${esc(s.email)}</span></div><div class="detail-info-item"><label>POLIZA</label><span>${esc(s.poliza)}</span></div><div class="detail-info-item"><label>TIPO</label><span><i class="fas ${TIPOS_ICON[s.tipo]}"></i> ${TIPOS_LABEL[s.tipo]}</span></div><div class="detail-info-item"><label>URGENCIA</label><span>${urgBadge(s.urgencia)}</span></div><div class="detail-info-item"><label>FECHA</label><span>${fmtDate(s.fecha)}</span></div><div class="detail-info-item"><label>ZONA</label><span>${esc(s.zona)}</span></div><div class="detail-info-item"><label>PERITO</label><span>${esc(s.perito||'Sin asignar')}</span></div><div class="detail-info-item"><label>DIRECCION</label><span>${esc(s.direccion)}</span></div><div class="detail-info-item" style="grid-column:1/-1"><label>DESCRIPCION</label><span>${esc(s.descripcion)}</span></div>`;
    document.getElementById('detalleTimeline').innerHTML=s.timeline.map(t=>`<div class="timeline-item"><div class="timeline-dot ${t.tipo}"></div><div class="timeline-content"><h4>${t.titulo}</h4><p>${t.desc}</p><span class="timeline-date">${t.fecha}</span></div></div>`).join('');
    const ch=document.getElementById('chatContainer');ch.innerHTML=s.chat.map(m=>`<div class="chat-message"><div class="chat-avatar">${esc(m.iniciales)}</div><div class="chat-bubble"><div class="chat-name">${esc(m.usuario)}</div><div class="chat-text">${esc(m.texto)}</div><div class="chat-time">${esc(m.hora)}</div></div></div>`).join('');ch.scrollTop=ch.scrollHeight;
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
    const errEl = document.getElementById('formErrors');
    const nombre = document.getElementById('clienteNombre').value.trim();
    const telefono = document.getElementById('clienteTelefono').value.trim();
    const email = document.getElementById('clienteEmail').value.trim();
    const tipo = document.getElementById('tipoSiniestro').value;
    const desc = document.getElementById('descripcion').value.trim();
    const errors = [];
    if (!nombre || nombre.length < 3) errors.push('Nombre debe tener al menos 3 caracteres');
    if (!telefono || !/^\d{9,}$/.test(telefono.replace(/\s/g,''))) errors.push('Telefono debe tener al menos 9 digitos');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email no valido');
    if (!tipo) errors.push('Seleccione un tipo de siniestro');
    if (!desc || desc.length < 10) errors.push('Descripcion debe tener al menos 10 caracteres');
    if (errors.length > 0) { if(errEl) errEl.textContent = errors.join('. '); return; }
    if(errEl) errEl.textContent = '';
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
        roiChartInstance=createChart('roiChart',{type:'bar',data:{labels:['Coste Actual','Coste con IA','Ahorro Mensual'],datasets:[{data:[costActual,costIA,Math.max(0,ahMes)],backgroundColor:['#fca5a5','#86efac','#c4b5fd'],borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'},ticks:{callback:v=>v.toLocaleString('es-ES')+'€'}}}}});
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
    createChart('chartResolucion',{type:'bar',data:{labels:['Auto','Hogar','Salud','Robo','Otro'],datasets:[{data:[3.8,5.2,2.1,6.5,4.0],backgroundColor:['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'],borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:'#f1f5f9'}},y:{grid:{display:false}}}}});
    createChart('chartAhorro',{type:'line',data:{labels:['Jul','Ago','Sep','Oct','Nov','Dic'],datasets:[{data:[12500,19800,26300,33100,40200,47320],borderColor:'#16a34a',backgroundColor:'rgba(22,163,74,.1)',fill:true,tension:.4,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'},ticks:{callback:v=>v.toLocaleString('es-ES')+'€'}}}}});
    createChart('chartSatisfaccion',{type:'line',data:{labels:['Jul','Ago','Sep','Oct','Nov','Dic'],datasets:[{data:[7.8,8.0,8.1,8.3,8.5,8.7],borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,.1)',fill:true,tension:.4,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{min:6,max:10,grid:{color:'#f1f5f9'}}}}});
}

// ============================================================
// NOTIFICATIONS / SEARCH / MODALS / TOASTS / UTILS
// ============================================================
function initNotifications(){const b=document.getElementById('notifBtn'),d=document.getElementById('notifDropdown');b.addEventListener('click',e=>{e.stopPropagation();d.classList.toggle('show');});document.addEventListener('click',()=>d.classList.remove('show'));d.addEventListener('click',e=>e.stopPropagation());document.querySelector('.notif-clear').addEventListener('click',()=>{document.querySelectorAll('.notif-item.unread').forEach(i=>i.classList.remove('unread'));b.querySelector('.badge').style.display='none';});}
function initSearch(){let searchTimeout;document.getElementById('globalSearch').addEventListener('input',e=>{clearTimeout(searchTimeout);searchTimeout=setTimeout(()=>{const q=e.target.value.toLowerCase().trim();if(q.length<2)return;const r=siniestros.filter(s=>s.id.toLowerCase().includes(q)||s.cliente.toLowerCase().includes(q));if(r.length===1)openDetail(r[0].id);else if(r.length>0)navigateTo('expedientes');},300);});}
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

// ============================================================
// CENTRO DE COMUNICACIONES UNIFICADO
// ============================================================
const COMMS_DATA=[
    {id:1,canal:'llamadas',icon:'fa-phone-alt',color:'#16a34a',nombre:'Maria Garcia',asunto:'Accidente M-30 - seguimiento',tiempo:'Hace 2 min',prioridad:'urgente',exp:'EXP-2024-0891',preview:'Llama para preguntar por estado de la grua...', mensajes:[{de:'Cliente',texto:'Hola, llamo por el accidente de esta manana en la M-30.'},{de:'IA',texto:'Buenos dias Sra. Garcia. Su expediente EXP-2024-0891 esta activo. La grua esta en camino, ETA 8 minutos.'},{de:'Cliente',texto:'Perfecto, y el perito?'},{de:'IA',texto:'Carlos Ruiz ha sido asignado. Le visitara manana entre 9:00 y 12:00. Le envio SMS con los detalles.'}]},
    {id:2,canal:'whatsapp',icon:'fab fa-whatsapp',color:'#25d366',nombre:'Carlos Fernandez',asunto:'Fotos inundacion recibidas',tiempo:'Hace 5 min',prioridad:'alta',exp:'EXP-2024-0890',preview:'Envio 3 fotos de los danos por agua...', mensajes:[{de:'Cliente',texto:'Aqui envio las fotos de los danos del agua'},{de:'IA',texto:'Fotos recibidas y analizadas. Danos en parquet y muebles detectados. Estimacion: 4.200-5.800 EUR.'},{de:'Cliente',texto:'Cuando viene el perito?'},{de:'IA',texto:'Elena Torres, perito asignado, le visitara manana de 9 a 12. Le confirmo por SMS.'}]},
    {id:3,canal:'email',icon:'fa-envelope',color:'#3b82f6',nombre:'Laura Mendez',asunto:'RE: Documentacion robo local',tiempo:'Hace 12 min',prioridad:'media',exp:'EXP-2024-0889',preview:'Adjunto denuncia policial y fotos...', mensajes:[{de:'Cliente',texto:'Adjunto la denuncia policial y las fotos de la puerta forzada.'},{de:'IA',texto:'Documentacion recibida. Hemos verificado la denuncia con la policia. El perito Laura Sanchez revisara su caso.'}]},
    {id:4,canal:'chat',icon:'fa-comment-dots',color:'#8b5cf6',nombre:'Pedro Alvarez',asunto:'Consulta cobertura salud',tiempo:'Hace 18 min',prioridad:'media',exp:'EXP-2024-0888',preview:'Pregunta si rehabilitacion esta cubierta...', mensajes:[{de:'Cliente',texto:'La rehabilitacion esta cubierta en mi poliza?'},{de:'IA',texto:'Si, su poliza Salud Premium cubre hasta 30 sesiones de rehabilitacion. Ya tiene 20 sesiones autorizadas para su expediente actual.'}]},
    {id:5,canal:'llamadas',icon:'fa-phone-alt',color:'#16a34a',nombre:'Sofia Rodriguez',asunto:'Llamada perdida - devolver',tiempo:'Hace 25 min',prioridad:'baja',exp:'EXP-2024-0887',preview:'No contesto, dejar mensaje de seguimiento...', mensajes:[]},
    {id:6,canal:'whatsapp',icon:'fab fa-whatsapp',color:'#25d366',nombre:'Carmen Vega',asunto:'Consulta estado expediente robo',tiempo:'Hace 32 min',prioridad:'alta',exp:'EXP-2024-0883',preview:'Score fraude alto, requiere atencion...', mensajes:[{de:'Cliente',texto:'Cuando me van a pagar lo del coche?'},{de:'IA',texto:'Sra. Vega, su expediente esta en fase de verificacion. Necesitamos documentacion adicional. Un gestor le contactara hoy.'}]},
    {id:7,canal:'email',icon:'fa-envelope',color:'#3b82f6',nombre:'Javier Romero',asunto:'Nuevo siniestro - colision rotonda',tiempo:'Hace 45 min',prioridad:'urgente',exp:'EXP-2024-0882',preview:'Accidente multiple, 3 vehiculos...', mensajes:[{de:'Cliente',texto:'He tenido un accidente en una rotonda con 3 coches implicados. Adjunto parte amistoso.'},{de:'IA',texto:'Expediente abierto automaticamente. Dada la gravedad, hemos asignado un perito urgente y solicitado grua.'}]},
    {id:8,canal:'chat',icon:'fa-comment-dots',color:'#8b5cf6',nombre:'Elena Torres (Perito)',asunto:'Informe peritaje #0890 listo',tiempo:'Hace 1 hora',prioridad:'media',exp:'EXP-2024-0890',preview:'Valoracion completada: 5.200 EUR...', mensajes:[{de:'Perito',texto:'Informe de peritaje completado para EXP-2024-0890. Valoracion: 5.200 EUR.'},{de:'IA',texto:'Informe recibido y adjuntado al expediente. Notificacion enviada al cliente.'}]},
];
let commsFilter='todos';

function initComunicaciones(){
    const el=document.getElementById('commsList');if(!el)return;
    renderCommsList();
    document.querySelectorAll('.comms-tab').forEach(t=>t.addEventListener('click',()=>{
        document.querySelectorAll('.comms-tab').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');commsFilter=t.dataset.channel;renderCommsList();
    }));
    // Simular mensajes entrantes
    setInterval(()=>{
        const canales=['llamadas','whatsapp','email','chat'];
        const nombres=['Ana Lopez','Miguel Soto','Raquel Gimenez','Pablo Sanchez','Lucia Fernandez'];
        const asuntos=['Nuevo siniestro reportado','Consulta de cobertura','Envio de documentacion','Seguimiento expediente','Reclamacion urgente'];
        const n=nombres[Math.floor(Math.random()*nombres.length)];
        const c=canales[Math.floor(Math.random()*canales.length)];
        const newMsg={id:Date.now(),canal:c,icon:c==='whatsapp'?'fab fa-whatsapp':c==='llamadas'?'fa-phone-alt':c==='email'?'fa-envelope':'fa-comment-dots',color:c==='whatsapp'?'#25d366':c==='llamadas'?'#16a34a':c==='email'?'#3b82f6':'#8b5cf6',nombre:n,asunto:asuntos[Math.floor(Math.random()*asuntos.length)],tiempo:'Ahora',prioridad:['urgente','alta','media','baja'][Math.floor(Math.random()*4)],exp:'EXP-2024-'+String(Math.floor(Math.random()*100)+900).padStart(4,'0'),preview:'Mensaje entrante...',mensajes:[{de:'Cliente',texto:'Necesito ayuda con mi siniestro.'}]};
        COMMS_DATA.unshift(newMsg);
        if(COMMS_DATA.length>20)COMMS_DATA.pop();
        renderCommsList();
        const badge=document.getElementById('commsTotalBadge');if(badge)badge.textContent=COMMS_DATA.length;
    },12000);
}
function renderCommsList(){
    const el=document.getElementById('commsList');if(!el)return;
    const filtered=commsFilter==='todos'?COMMS_DATA:COMMS_DATA.filter(c=>c.canal===commsFilter);
    const badge=document.getElementById('commsTotalBadge');if(badge)badge.textContent=filtered.length;
    el.innerHTML=filtered.map(c=>`<div class="comms-item ${c.prioridad}" onclick="showCommsDetail(${c.id})">
        <div class="comms-item-icon" style="color:${c.color}"><i class="${c.icon.startsWith('fab')?c.icon:'fas '+c.icon}"></i></div>
        <div class="comms-item-body"><div class="comms-item-top"><strong>${c.nombre}</strong><span class="comms-time">${c.tiempo}</span></div><div class="comms-item-subject">${c.asunto}</div><div class="comms-item-preview">${c.preview}</div></div>
        <div class="comms-item-meta"><span class="comms-priority-badge ${c.prioridad}">${c.prioridad}</span><span class="comms-exp">${c.exp}</span></div>
    </div>`).join('');
}
function showCommsDetail(id){
    const c=COMMS_DATA.find(x=>x.id===id);if(!c)return;
    const el=document.getElementById('commsDetail');
    el.innerHTML=`<div class="comms-detail-header"><div class="comms-detail-icon" style="color:${c.color}"><i class="${c.icon.startsWith('fab')?c.icon:'fas '+c.icon}"></i></div><div><h3>${c.nombre}</h3><p>${c.asunto} | ${c.exp}</p></div><span class="comms-priority-badge ${c.prioridad}">${c.prioridad}</span></div>
    <div class="comms-messages">${c.mensajes.map(m=>`<div class="comms-msg ${m.de==='IA'?'comms-msg-ia':m.de==='Perito'?'comms-msg-perito':'comms-msg-client'}"><div class="comms-msg-sender">${m.de}</div><div class="comms-msg-text">${m.texto}</div></div>`).join('')}</div>
    <div class="comms-reply"><div class="comms-templates"><button class="btn btn-sm btn-outline" onclick="commsQuickReply('Estado actualizado')"><i class="fas fa-robot"></i> Estado</button><button class="btn btn-sm btn-outline" onclick="commsQuickReply('Perito asignado')"><i class="fas fa-user-tie"></i> Perito</button><button class="btn btn-sm btn-outline" onclick="commsQuickReply('Documentacion recibida')"><i class="fas fa-file"></i> Docs</button></div><div class="comms-reply-input"><input type="text" placeholder="Responder..." id="commsReplyInput"><button class="btn btn-primary" onclick="commsQuickReply(document.getElementById('commsReplyInput').value)"><i class="fas fa-paper-plane"></i></button></div></div>`;
    // Show client panel
    const cp=document.getElementById('commsClientPanel');const cb=document.getElementById('commsClientBody');
    if(cp&&cb){cp.style.display='block';cb.innerHTML=`<div class="comms-client-name"><strong>${c.nombre}</strong></div><div class="comms-client-detail"><span>Expediente:</span> ${c.exp}</div><div class="comms-client-detail"><span>Canal:</span> ${c.canal}</div><div class="comms-client-detail"><span>Prioridad:</span> ${c.prioridad}</div><div class="comms-client-detail"><span>Siniestros previos:</span> ${Math.floor(Math.random()*3)+1}</div><div class="comms-client-detail"><span>Antiguedad:</span> ${Math.floor(Math.random()*5)+1} anos</div><div class="comms-client-detail"><span>Satisfaccion:</span> ${(Math.random()*2+7).toFixed(1)}/10</div>`;}
}
function commsQuickReply(text){if(!text)return;showToast('Respuesta IA enviada: '+text,'ai');}

// ============================================================
// TRACKER EN TIEMPO REAL
// ============================================================
let trackerStep=0,trackerInterval=null;
const TRACKER_WAYPOINTS=[{x:20,y:75},{x:25,y:65},{x:32,y:55},{x:38,y:48},{x:45,y:42},{x:52,y:38},{x:58,y:32},{x:65,y:28},{x:72,y:25}];
const TRACKER_NOTIFS=['Perito en camino hacia tu ubicacion','Pasando por Av. de America','Girando en Calle Alcala','Perito a 5 minutos','Perito a 2 minutos','Perito muy cerca','Perito ha llegado a destino'];

function initTracker(){
    const vehicle=document.getElementById('trackerVehicle');if(!vehicle)return;
    const origin=document.getElementById('trackerOrigin');
    const dest=document.getElementById('trackerDest');
    if(origin){origin.style.left='18%';origin.style.top='77%';}
    if(dest){dest.style.left='74%';dest.style.top='22%';}
    vehicle.style.left='20%';vehicle.style.top='75%';
    drawTrackerRoute();
    trackerStep=0;
    trackerInterval=setInterval(()=>{
        if(trackerStep>=TRACKER_WAYPOINTS.length){
            clearInterval(trackerInterval);
            document.getElementById('trackerETA').textContent='Llegado';
            document.getElementById('trackerStateBadge').textContent='Ha llegado';
            document.getElementById('trackerStateBadge').style.background='#16a34a';
            document.getElementById('trackerRating').style.display='block';
            addTrackerNotif('Perito ha llegado. Valora el servicio.');
            return;
        }
        const wp=TRACKER_WAYPOINTS[trackerStep];
        vehicle.style.left=wp.x+'%';vehicle.style.top=wp.y+'%';
        const eta=Math.max(1,(TRACKER_WAYPOINTS.length-trackerStep)*1.5);
        document.getElementById('trackerETA').textContent=Math.round(eta)+' min';
        document.getElementById('trackerDist').textContent=(eta*0.35).toFixed(1)+' km';
        if(trackerStep<TRACKER_NOTIFS.length)addTrackerNotif(TRACKER_NOTIFS[trackerStep]);
        if(trackerStep===TRACKER_WAYPOINTS.length-2){document.getElementById('trackerStateBadge').textContent='Casi ahi';document.getElementById('trackerStateBadge').style.background='#f59e0b';}
        trackerStep++;
    },3000);
    // Stars
    document.querySelectorAll('#trackerStars i').forEach(s=>{
        s.addEventListener('click',()=>{const v=parseInt(s.dataset.v);document.querySelectorAll('#trackerStars i').forEach((x,i)=>x.style.color=i<v?'#f59e0b':'#cbd5e1');});
    });
    const rateBtn=document.getElementById('btnTrackerRate');
    if(rateBtn)rateBtn.addEventListener('click',()=>{showToast('Valoracion enviada. Gracias!','success');document.getElementById('trackerRating').style.display='none';});
}
function drawTrackerRoute(){
    const route=document.getElementById('trackerRoute');if(!route)return;
    route.innerHTML=TRACKER_WAYPOINTS.map(w=>`<div class="tracker-dot" style="left:${w.x}%;top:${w.y}%"></div>`).join('');
}
function addTrackerNotif(text){
    const el=document.getElementById('trackerNotifications');if(!el)return;
    const t=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
    const d=document.createElement('div');d.className='tracker-notif';d.innerHTML=`<i class="fas fa-map-pin"></i><span>${text}</span><small>${t}</small>`;
    el.insertBefore(d,el.firstChild);if(el.children.length>8)el.removeChild(el.lastChild);
}

// ============================================================
// PREDICCION IA
// ============================================================
function initPrediccion(){
    const tbody=document.getElementById('predClientesBody');if(!tbody)return;
    const clientes=[
        {nombre:'Javier Romero',poliza:'POL-2024-00777',tipo:'Auto Premium',prob:78,factor:'Zona alto riesgo + historial'},
        {nombre:'Elena Torres',poliza:'POL-2024-00888',tipo:'Hogar basico',prob:65,factor:'Vivienda antigua + zona inundable'},
        {nombre:'Miguel Angel Soto',poliza:'POL-2024-00999',tipo:'Salud basico',prob:62,factor:'Edad + historial medico'},
        {nombre:'Carmen Vega',poliza:'POL-2024-00234',tipo:'Auto Todo riesgo',prob:55,factor:'Historial siniestros recurrente'},
        {nombre:'Pablo Sanchez',poliza:'POL-2024-01111',tipo:'Auto Todo riesgo',prob:48,factor:'Conductor joven + zona urbana'},
        {nombre:'Raquel Gimenez',poliza:'POL-2024-01010',tipo:'Hogar Plus',prob:42,factor:'Zona humedades + epoca lluvias'},
        {nombre:'Lucia Fernandez',poliza:'POL-2024-01212',tipo:'Auto terceros',prob:38,factor:'Vehiculo antiguo + km altos'},
        {nombre:'Antonio Navarro',poliza:'POL-2024-00890',tipo:'Hogar basico',prob:35,factor:'Instalacion electrica antigua'},
    ];
    tbody.innerHTML=clientes.map(c=>{
        const color=c.prob>=60?'#dc2626':c.prob>=40?'#f59e0b':'#16a34a';
        return `<tr><td><strong>${c.nombre}</strong></td><td>${c.poliza}</td><td>${c.tipo}</td><td><span style="color:${color};font-weight:700">${c.prob}%</span></td><td>${c.factor}</td><td><button class="btn btn-sm btn-outline" onclick="showToast('Alerta preventiva enviada a ${c.nombre}','ai')"><i class="fas fa-bell"></i> Alertar</button></td></tr>`;
    }).join('');
    // Zonas riesgo
    const zones=document.getElementById('predZones');if(zones){
        const zonas=[{z:'Madrid Centro',r:'Alto',c:'#dc2626',n:23},{z:'Barcelona Eixample',r:'Alto',c:'#dc2626',n:18},{z:'Valencia Puerto',r:'Alto',c:'#dc2626',n:15},{z:'Sevilla Este',r:'Medio',c:'#f59e0b',n:12},{z:'Bilbao Centro',r:'Medio',c:'#f59e0b',n:9},{z:'Zaragoza Norte',r:'Bajo',c:'#16a34a',n:5},{z:'Malaga Costa',r:'Medio',c:'#f59e0b',n:11},{z:'Murcia Sur',r:'Bajo',c:'#16a34a',n:4}];
        zones.innerHTML=zonas.map(z=>`<div class="pred-zone"><div class="pred-zone-dot" style="background:${z.c}"></div><div class="pred-zone-info"><strong>${z.z}</strong><span>Riesgo ${z.r} | ${z.n} siniestros predichos</span></div></div>`).join('');
    }
    // Alertas preventivas
    const alerts=document.getElementById('predAlerts');if(alerts){
        alerts.innerHTML=[
            {icon:'fa-cloud-showers-heavy',text:'AEMET alerta de lluvias torrenciales en Valencia proximos 3 dias. 15 polizas hogar en zona de riesgo.',tipo:'warning'},
            {icon:'fa-car',text:'3 clientes con vehiculos >15 anos en zona de accidentes frecuentes A-6.',tipo:'info'},
            {icon:'fa-home',text:'Epoca de heladas: 8 polizas hogar con tuberias expuestas en Castilla y Leon.',tipo:'warning'},
            {icon:'fa-thermometer-full',text:'Ola de calor prevista: riesgo incendios elevado en Andalucia y Extremadura.',tipo:'alert'},
        ].map(a=>`<div class="pred-alert ${a.tipo}"><i class="fas ${a.icon}"></i><span>${a.text}</span></div>`).join('');
    }
    // Chart
    if(document.getElementById('chartPrediccion')){
        createChart('chartPrediccion',{type:'line',data:{labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],datasets:[{label:'Real',data:[45,42,50,48,55,62,58,52,60,65,70,null],borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.1)',fill:true,tension:.4,pointRadius:4},{label:'Prediccion IA',data:[44,43,49,50,54,60,56,53,62,67,72,75],borderColor:'#8b5cf6',borderDash:[5,5],backgroundColor:'rgba(139,92,246,.05)',fill:true,tension:.4,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{usePointStyle:true}}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'}}}}});
    }
}

// ============================================================
// PRICING DINAMICO
// ============================================================
function initPricing(){
    const ids=['pricingEdad','pricingSiniestros','pricingAntiguedad','pricingZona','pricingTipo'];
    ids.forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',updatePricing);});
    updatePricing();
}
function updatePricing(){
    const edad=+(document.getElementById('pricingEdad')?.value||35);
    const sin=+(document.getElementById('pricingSiniestros')?.value||1);
    const ant=+(document.getElementById('pricingAntiguedad')?.value||3);
    const zona=document.getElementById('pricingZona')?.value||'media';
    const tipo=document.getElementById('pricingTipo')?.value||'auto';
    const ev=document.getElementById('pricingEdadVal');if(ev)ev.textContent=edad;
    const sv=document.getElementById('pricingSiniestrosVal');if(sv)sv.textContent=sin;
    const av=document.getElementById('pricingAntiguedadVal');if(av)av.textContent=ant;
    // Calculo
    const base={auto:600,hogar:400,salud:500}[tipo]||600;
    let tradMult=1;
    if(edad<25)tradMult+=0.3;else if(edad>60)tradMult+=0.15;
    tradMult+=sin*0.2;
    if(zona==='alta')tradMult+=0.25;else if(zona==='baja')tradMult-=0.1;
    const trad=Math.round(base*tradMult);
    // IA ajusta mejor
    let iaMult=1;
    if(edad<25)iaMult+=0.15;else if(edad>60)iaMult+=0.08;
    iaMult+=sin*0.12;
    if(ant>5)iaMult-=0.15;else if(ant>2)iaMult-=0.08;
    if(zona==='alta')iaMult+=0.15;else if(zona==='baja')iaMult-=0.15;
    const ia=Math.round(base*iaMult);
    const ahorro=trad-ia;const pct=((ahorro/trad)*100).toFixed(1);
    const et=id=>document.getElementById(id);
    if(et('pricingTradicional'))et('pricingTradicional').textContent=trad+' EUR/ano';
    if(et('pricingIA'))et('pricingIA').textContent=ia+' EUR/ano';
    if(et('pricingAhorro'))et('pricingAhorro').textContent=ahorro+' EUR/ano';
    if(et('pricingPct'))et('pricingPct').textContent=pct+'% menos';
    // Factores
    const factors=document.getElementById('pricingFactors');if(factors){
        factors.innerHTML=`<h4>Factores de ajuste IA</h4>
        <div class="pricing-factor"><span>Edad (${edad} anos)</span><div class="pricing-factor-bar"><div style="width:${Math.min(100,edad*1.3)}%;background:${edad<25?'#f59e0b':'#16a34a'}"></div></div></div>
        <div class="pricing-factor"><span>Siniestros previos (${sin})</span><div class="pricing-factor-bar"><div style="width:${sin*20}%;background:${sin>2?'#dc2626':'#16a34a'}"></div></div></div>
        <div class="pricing-factor"><span>Antiguedad (${ant} anos)</span><div class="pricing-factor-bar"><div style="width:${Math.min(100,ant*5)}%;background:#3b82f6"></div></div></div>
        <div class="pricing-factor"><span>Zona riesgo (${zona})</span><div class="pricing-factor-bar"><div style="width:${zona==='alta'?80:zona==='media'?50:20}%;background:${zona==='alta'?'#dc2626':'#16a34a'}"></div></div></div>`;
    }
    const reco=document.getElementById('pricingReco');if(reco){
        reco.innerHTML=`<div class="pricing-reco-card"><i class="fas fa-robot ai-color"></i><div><h4>Recomendacion IA</h4><p>${sin===0?'Cliente sin siniestros. Ofrecer descuento de fidelidad del 10% adicional para retener.':sin>=3?'Cliente de alto riesgo. Mantener prima o considerar franquicia mas alta. Ofrecer programa de conduccion segura.':'Perfil estandar. Prima competitiva con el mercado. Sugerir poliza anual con pago unico para descuento del 5%.'}</p></div></div>`;
    }
}

// ============================================================
// IOT Y COCHE CONECTADO
// ============================================================
function initIOT(){
    const alerts=document.getElementById('iotAlerts');if(!alerts)return;
    const iotData=[
        {icon:'fa-fire',tipo:'Sensor de humo',device:'Hogar - Salon',cliente:'Elena Torres',estado:'ACTIVADO',color:'#dc2626',accion:'Parte abierto automaticamente'},
        {icon:'fa-car-crash',tipo:'Dashcam impacto',device:'Vehiculo - BMW 320d',cliente:'Javier Romero',estado:'DETECTADO',color:'#f59e0b',accion:'Grua solicitada. Perito notificado.'},
        {icon:'fa-tint',tipo:'Sensor de agua',device:'Hogar - Cocina',cliente:'Raquel Gimenez',estado:'ALERTA',color:'#3b82f6',accion:'Notificacion preventiva enviada'},
    ];
    alerts.innerHTML=iotData.map(a=>`<div class="iot-alert-item" style="border-left:4px solid ${a.color}"><div class="iot-alert-icon" style="color:${a.color}"><i class="fas ${a.icon}"></i></div><div class="iot-alert-body"><div class="iot-alert-title"><strong>${a.tipo}</strong> - <span style="color:${a.color}">${a.estado}</span></div><div class="iot-alert-meta">${a.device} | ${a.cliente}</div><div class="iot-alert-action"><i class="fas fa-robot ai-color"></i> ${a.accion}</div></div><small>${Math.floor(Math.random()*30)+1} min</small></div>`).join('');
    // Vehiculos
    const vehicles=document.getElementById('iotVehicles');if(vehicles){
        const cars=[
            {mat:'1234-ABC',modelo:'BMW 320d',cliente:'Javier Romero',vel:72,bat:85,gps:'Madrid Centro',estado:'Circulando'},
            {mat:'5678-DEF',modelo:'Seat Leon',cliente:'Pablo Sanchez',vel:0,bat:92,gps:'Barcelona Eixample',estado:'Aparcado'},
            {mat:'9012-GHI',modelo:'Toyota Corolla',cliente:'Maria Garcia',vel:0,bat:45,gps:'Madrid M-30',estado:'En taller'},
            {mat:'3456-JKL',modelo:'VW Golf',cliente:'Carlos Fernandez',vel:55,bat:78,gps:'Barcelona Diagonal',estado:'Circulando'},
        ];
        vehicles.innerHTML=cars.map(c=>`<div class="iot-vehicle"><div class="iot-vehicle-icon"><i class="fas fa-car"></i></div><div class="iot-vehicle-info"><strong>${c.modelo}</strong> (${c.mat})<br><small>${c.cliente} | ${c.gps}</small></div><div class="iot-vehicle-stats"><span><i class="fas fa-tachometer-alt"></i> ${c.vel} km/h</span><span><i class="fas fa-battery-three-quarters"></i> ${c.bat}%</span><span class="iot-vehicle-estado ${c.estado==='Circulando'?'active':''}">${c.estado}</span></div></div>`).join('');
    }
    // History
    const hist=document.getElementById('iotHistory');if(hist){
        const events=[
            {t:'14:32',icon:'fa-fire',text:'Sensor humo activado - Hogar Elena Torres - PARTE ABIERTO'},
            {t:'13:15',icon:'fa-car-crash',text:'Impacto detectado - BMW 320d Javier Romero - GRUA ENVIADA'},
            {t:'12:45',icon:'fa-tint',text:'Alerta agua - Cocina Raquel Gimenez - NOTIFICACION ENVIADA'},
            {t:'11:20',icon:'fa-thermometer-full',text:'Temperatura alta motor - Seat Leon Pablo Sanchez'},
            {t:'10:05',icon:'fa-map-marker-alt',text:'GPS inactivo 2h - VW Golf Carlos Fernandez'},
            {t:'09:30',icon:'fa-battery-empty',text:'Bateria baja - Toyota Corolla Maria Garcia'},
        ];
        hist.innerHTML=events.map(e=>`<div class="iot-hist-item"><span class="iot-hist-time">${e.t}</span><i class="fas ${e.icon}"></i><span>${e.text}</span></div>`).join('');
    }
    // Simular alertas nuevas
    setInterval(()=>{
        const el=document.getElementById('iotAlertCount');if(el)el.textContent=parseInt(el.textContent)+1;
    },30000);
}

// ============================================================
// MARKETPLACE DE PERITOS
// ============================================================
function initMarketplace(){
    const grid=document.getElementById('mkpGrid');if(!grid)return;
    const peritos=[
        {id:1,nombre:'Carlos Ruiz Martinez',tipo:'perito',esp:'Auto, Hogar',zona:'Madrid',val:4.9,exp:87,precio:85,disp:true,img:'CR',tiempo:'3.1 dias'},
        {id:2,nombre:'Elena Torres Vidal',tipo:'perito',esp:'Hogar, Salud',zona:'Barcelona',val:4.8,exp:72,precio:80,disp:true,img:'ET',tiempo:'3.4 dias'},
        {id:3,nombre:'Miguel A. Fernandez',tipo:'perito',esp:'Auto',zona:'Sevilla',val:4.7,exp:65,precio:75,disp:true,img:'MF',tiempo:'3.8 dias'},
        {id:4,nombre:'Laura Sanchez Gil',tipo:'perito',esp:'Robo, Hogar',zona:'Valencia',val:4.6,exp:58,precio:70,disp:false,img:'LS',tiempo:'4.0 dias'},
        {id:5,nombre:'Pedro Jimenez Ruiz',tipo:'perito',esp:'Todos',zona:'Bilbao',val:4.5,exp:51,precio:65,disp:true,img:'PJ',tiempo:'4.2 dias'},
        {id:6,nombre:'Gruas Madrid 24h',tipo:'grua',esp:'Vehiculos',zona:'Madrid',val:4.3,exp:120,precio:120,disp:true,img:'GM',tiempo:'0.1 dias'},
        {id:7,nombre:'Dr. Alicia Moreno',tipo:'medico',esp:'Traumatologia',zona:'Madrid',val:4.9,exp:40,precio:150,disp:true,img:'AM',tiempo:'2.0 dias'},
        {id:8,nombre:'Abogados RC Asociados',tipo:'legal',esp:'Responsabilidad Civil',zona:'Madrid',val:4.4,exp:95,precio:200,disp:true,img:'RC',tiempo:'5.0 dias'},
    ];
    renderMarketplace(peritos);
    ['mkpTipo','mkpZona','mkpOrden'].forEach(id=>{
        const el=document.getElementById(id);if(el)el.addEventListener('change',()=>renderMarketplace(peritos));
    });
    const btn=document.getElementById('btnMkpAutoAssign');if(btn)btn.addEventListener('click',()=>{
        const result=document.getElementById('mkpAutoResult');if(!result)return;
        result.innerHTML='<div class="mkp-auto-loading"><div class="spinner-ring"></div> Analizando peritos disponibles...</div>';
        setTimeout(()=>{
            const p=peritos.filter(x=>x.disp)[0];
            result.innerHTML=`<div class="mkp-auto-success"><i class="fas fa-check-circle" style="color:#16a34a;font-size:1.5rem"></i><div><strong>Perito asignado: ${p.nombre}</strong><p>Valoracion: ${p.val}/5 | Zona: ${p.zona} | Precio: ${p.precio} EUR/h</p><p>Motivo IA: Mejor combinacion de valoracion, disponibilidad y proximidad geografica.</p></div></div>`;
        },2000);
    });
}
function renderMarketplace(peritos){
    const grid=document.getElementById('mkpGrid');if(!grid)return;
    const tipo=document.getElementById('mkpTipo')?.value||'';
    const zona=document.getElementById('mkpZona')?.value||'';
    const orden=document.getElementById('mkpOrden')?.value||'valoracion';
    let filtered=[...peritos];
    if(tipo)filtered=filtered.filter(p=>p.tipo===tipo);
    if(zona)filtered=filtered.filter(p=>p.zona===zona);
    if(orden==='valoracion')filtered.sort((a,b)=>b.val-a.val);
    else if(orden==='precio')filtered.sort((a,b)=>a.precio-b.precio);
    else filtered.sort((a,b)=>b.exp-a.exp);
    grid.innerHTML=filtered.map(p=>`<div class="mkp-card ${p.disp?'':'mkp-unavailable'}">
        <div class="mkp-card-header"><div class="mkp-avatar">${p.img}</div><div class="mkp-disp ${p.disp?'available':'unavailable'}">${p.disp?'Disponible':'Ocupado'}</div></div>
        <h4>${p.nombre}</h4><span class="mkp-tipo-badge">${p.tipo}</span>
        <div class="mkp-stats"><div><i class="fas fa-star" style="color:#f59e0b"></i> ${p.val}</div><div><i class="fas fa-briefcase"></i> ${p.exp} exp</div><div><i class="fas fa-euro-sign"></i> ${p.precio}/h</div></div>
        <div class="mkp-meta"><span><i class="fas fa-map-marker-alt"></i> ${p.zona}</span><span><i class="fas fa-clock"></i> ${p.tiempo}</span></div>
        <div class="mkp-esp">${p.esp}</div>
        <button class="btn btn-sm ${p.disp?'btn-primary':'btn-outline'}" ${p.disp?'':`disabled`} onclick="showToast('${p.nombre} asignado al expediente','success')"><i class="fas fa-plus"></i> Asignar</button>
    </div>`).join('');
}

// ============================================================
// INTEGRACIONES
// ============================================================
function initIntegraciones(){
    const grid=document.getElementById('integGrid');if(!grid)return;
    const integs=[
        {nombre:'DGT',desc:'Verificacion de vehiculos y conductores',icon:'fa-car',estado:'conectado',color:'#16a34a'},
        {nombre:'AEMET',desc:'Datos meteorologicos en tiempo real',icon:'fa-cloud-sun',estado:'conectado',color:'#16a34a'},
        {nombre:'Catastro',desc:'Verificacion de inmuebles y propiedades',icon:'fa-building',estado:'conectado',color:'#16a34a'},
        {nombre:'Bizum / Banco',desc:'Pagos e indemnizaciones instantaneas',icon:'fa-university',estado:'conectado',color:'#16a34a'},
        {nombre:'DocuSign',desc:'Firma digital de documentos',icon:'fa-file-signature',estado:'conectado',color:'#16a34a'},
        {nombre:'Google Maps',desc:'Geolocalizacion y rutas',icon:'fa-map-marked-alt',estado:'conectado',color:'#16a34a'},
        {nombre:'WhatsApp Business API',desc:'Comunicacion con clientes via WhatsApp',icon:'fab fa-whatsapp',estado:'pendiente',color:'#f59e0b'},
        {nombre:'Twilio Voice',desc:'Llamadas automaticas con voz IA',icon:'fa-phone-alt',estado:'pendiente',color:'#f59e0b'},
        {nombre:'Claude API (Anthropic)',desc:'Motor de inteligencia artificial',icon:'fa-brain',estado:'pendiente',color:'#f59e0b'},
        {nombre:'ElevenLabs',desc:'Sintesis de voz natural',icon:'fa-microphone',estado:'pendiente',color:'#f59e0b'},
        {nombre:'TIREA / BDNF',desc:'Base de datos nacional de fraude',icon:'fa-database',estado:'conectado',color:'#16a34a'},
        {nombre:'Mapfre Reaseguros',desc:'Cesion automatica de reaseguro',icon:'fa-handshake',estado:'conectado',color:'#16a34a'},
    ];
    grid.innerHTML=integs.map(i=>`<div class="integ-card">
        <div class="integ-icon"><i class="${i.icon.startsWith('fab')?i.icon:'fas '+i.icon}"></i></div>
        <div class="integ-info"><h4>${i.nombre}</h4><p>${i.desc}</p></div>
        <div class="integ-status" style="color:${i.color}"><i class="fas ${i.estado==='conectado'?'fa-check-circle':'fa-exclamation-circle'}"></i> ${i.estado==='conectado'?'CONECTADO':'PENDIENTE CONFIGURAR'}</div>
        <button class="btn btn-sm ${i.estado==='conectado'?'btn-outline':'btn-primary'}" onclick="showToast('${i.nombre}: ${i.estado==='conectado'?'Conexion verificada':'Configuracion abierta'}','${i.estado==='conectado'?'success':'info'}')">${i.estado==='conectado'?'Verificar':'Configurar'}</button>
    </div>`).join('');
}

// ============================================================
// REPORTES AUTOMATICOS
// ============================================================
function initReportes(){
    const grid=document.getElementById('reportsGrid');if(!grid)return;
    const reportes=[
        {id:'semanal',nombre:'Informe Semanal de Siniestralidad',icon:'fa-calendar-week',desc:'Resumen de siniestros abiertos, cerrados y en gestion de la ultima semana.',freq:'Cada lunes'},
        {id:'fraude',nombre:'Informe de Fraude Detectado',icon:'fa-shield-alt',desc:'Expedientes con score de fraude alto, alertas y acciones tomadas.',freq:'Diario'},
        {id:'rendimiento',nombre:'Rendimiento Agentes IA',icon:'fa-robot',desc:'Metricas de cada agente IA: tareas completadas, precision, tiempo medio.',freq:'Semanal'},
        {id:'regulador',nombre:'Informe Regulador DGSFP',icon:'fa-landmark',desc:'Informe normativo para la Direccion General de Seguros.',freq:'Mensual'},
        {id:'peritos',nombre:'Rendimiento de Peritos',icon:'fa-user-tie',desc:'Ranking, tiempos de respuesta, satisfaccion y facturacion por perito.',freq:'Quincenal'},
        {id:'financiero',nombre:'Informe Financiero',icon:'fa-euro-sign',desc:'Provisiones, indemnizaciones pagadas, ahorro IA vs gestion tradicional.',freq:'Mensual'},
    ];
    grid.innerHTML=reportes.map(r=>`<div class="report-card" id="report-${r.id}">
        <div class="report-icon"><i class="fas ${r.icon}"></i></div>
        <h4>${r.nombre}</h4><p>${r.desc}</p>
        <div class="report-freq"><i class="fas fa-clock"></i> ${r.freq}</div>
        <div class="report-actions">
            <button class="btn btn-primary btn-sm" onclick="generarReporte('${r.id}','${r.nombre}')"><i class="fas fa-file-pdf"></i> Generar PDF</button>
            <button class="btn btn-outline btn-sm" onclick="showToast('Enviado a direccion@empresa.com','success')"><i class="fas fa-paper-plane"></i> Enviar</button>
        </div>
        <div class="report-progress" id="reportProgress-${r.id}" style="display:none"><div class="report-progress-bar"></div><span>Generando...</span></div>
    </div>`).join('');
    // History
    const hist=document.getElementById('reportsHistory');if(hist){
        hist.innerHTML=[
            {nombre:'Informe Semanal',fecha:'18/03/2026 09:00',estado:'Enviado'},
            {nombre:'Informe Fraude',fecha:'18/03/2026 08:00',estado:'Enviado'},
            {nombre:'Rendimiento IA',fecha:'17/03/2026 09:00',estado:'Enviado'},
            {nombre:'Informe DGSFP',fecha:'01/03/2026 10:00',estado:'Enviado'},
        ].map(r=>`<div class="report-hist-item"><i class="fas fa-file-pdf" style="color:#dc2626"></i><span>${r.nombre}</span><span>${r.fecha}</span><span class="report-hist-status"><i class="fas fa-check-circle" style="color:#16a34a"></i> ${r.estado}</span></div>`).join('');
    }
}
function generarReporte(id,nombre){
    const prog=document.getElementById('reportProgress-'+id);if(!prog)return;
    prog.style.display='flex';prog.querySelector('span').textContent='Generando...';
    prog.querySelector('.report-progress-bar').style.width='0%';
    let w=0;const iv=setInterval(()=>{w+=Math.random()*15+5;if(w>=100){w=100;clearInterval(iv);prog.querySelector('span').textContent='PDF generado y enviado a direccion';prog.querySelector('.report-progress-bar').style.background='#16a34a';showToast(nombre+' generado correctamente','success');}prog.querySelector('.report-progress-bar').style.width=w+'%';},400);
}

// ============================================================
// WHITE LABEL
// ============================================================
function initWhiteLabel(){
    const f=document.getElementById('wlFraude');if(f)f.addEventListener('input',()=>{document.getElementById('wlFraudeVal').textContent=f.value;});
    const u=document.getElementById('wlUrgencia');if(u)u.addEventListener('input',()=>{document.getElementById('wlUrgenciaVal').textContent=u.value;});
    updateWLPreview();
}
function updateWLPreview(){
    const nombre=document.getElementById('wlNombre')?.value||'SiniestrosAI';
    const ia=document.getElementById('wlIA')?.value||'Agente IA';
    const c1=document.getElementById('wlColor1')?.value||'#8b5cf6';
    const c2=document.getElementById('wlColor2')?.value||'#06b6d4';
    const el=id=>document.getElementById(id);
    if(el('wlPreviewName'))el('wlPreviewName').textContent=nombre;
    if(el('wlPreviewTitle'))el('wlPreviewTitle').textContent=nombre;
    if(el('wlPreviewIAName'))el('wlPreviewIAName').textContent=ia;
    const sidebar=document.getElementById('wlPreviewSidebar');if(sidebar)sidebar.style.background=c1;
    ['wlPreviewCard1','wlPreviewCard2','wlPreviewCard3'].forEach(id=>{const e=el(id);if(e)e.style.background=`linear-gradient(135deg,${c1},${c2})`;});
}

// ============================================================
// PANEL SAAS
// ============================================================
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

// ============================================================
// NOTIFICACIONES CENTRO COMPLETO
// ============================================================
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

// ============================================================
// AGENTE NEGOCIADOR
// ============================================================
async function initNegociador(){
    // Cargar datos del backend
    try{
        const ahorro=await apiRequest('/agentes/negociador/ahorro-total');
        if(ahorro){
            const el=id=>document.getElementById(id);
            if(el('negAhorroTotal'))el('negAhorroTotal').textContent=(ahorro.mes_actual?.ahorro_total||3320).toLocaleString('es-ES');
            if(el('negNegociaciones'))el('negNegociaciones').textContent=ahorro.mes_actual?.negociaciones||18;
            if(el('negAhorroMedio'))el('negAhorroMedio').textContent=(ahorro.anio_actual?.porcentaje_ahorro_medio||26.5).toFixed(1)+'%';
            if(el('negProveedores'))el('negProveedores').textContent=20;
        }
    }catch(e){
        const el=id=>document.getElementById(id);
        if(el('negAhorroTotal'))el('negAhorroTotal').textContent='3.320';
        if(el('negNegociaciones'))el('negNegociaciones').textContent='18';
        if(el('negAhorroMedio'))el('negAhorroMedio').textContent='26.5%';
        if(el('negProveedores'))el('negProveedores').textContent='20';
    }
    // Ranking proveedores
    try{
        const ranking=await apiRequest('/agentes/negociador/ranking');
        const el=document.getElementById('negRanking');
        if(el&&ranking&&ranking.length){
            el.innerHTML=ranking.slice(0,10).map((p,i)=>`<div class="neg-rank-item"><span class="neg-rank-pos ${i<3?['gold','silver','bronze'][i]:''}">${i+1}</span><div class="neg-rank-info"><strong>${p.nombre}</strong><span>${p.tipo} | ${p.zona} | Calidad: ${p.calidad}/5</span></div><div class="neg-rank-price">${p.precio_medio}€<small>/servicio</small></div><div class="neg-rank-score">Score: ${p.score?.toFixed(1)||'-'}</div></div>`).join('');
        }
    }catch(e){}
    // Historial
    try{
        const hist=await apiRequest('/agentes/negociador/historial');
        const tbody=document.getElementById('negHistorialBody');
        if(tbody&&hist&&hist.length){
            tbody.innerHTML=hist.slice(0,10).map(n=>{
                const ahorro=n.precio_inicial-n.precio_final;
                return `<tr><td>${new Date(n.fecha).toLocaleDateString('es-ES')}</td><td><strong>${n.siniestro_id||'-'}</strong></td><td>${n.tipo_servicio||'-'}</td><td>${n.proveedor_nombre||'-'}</td><td>${n.precio_inicial}€</td><td style="color:#16a34a;font-weight:700">${n.precio_final}€</td><td><span style="color:#16a34a;font-weight:700">-${ahorro}€ (${((ahorro/n.precio_inicial)*100).toFixed(0)}%)</span></td></tr>`;
            }).join('');
        }
    }catch(e){}
    // Boton simulacion
    const btn=document.getElementById('btnIniciarNeg');
    if(btn)btn.addEventListener('click',async()=>{
        const feed=document.getElementById('negSimFeed');
        const result=document.getElementById('negSimResult');
        if(!feed)return;
        feed.innerHTML='<div class="neg-sim-loading"><div class="spinner-ring"></div> Iniciando negociacion...</div>';
        if(result)result.style.display='none';
        const tipo=document.getElementById('negTipoServicio')?.value||'taller';
        const zona=document.getElementById('negZona')?.value||'Madrid';
        try{
            const data=await apiRequest('/agentes/negociador/iniciar/SIN-001',{method:'POST',body:JSON.stringify({tipoServicio:tipo,zona:zona})});
            if(data&&data.pasos){
                feed.innerHTML='';
                let i=0;
                const showStep=()=>{
                    if(i>=data.pasos.length){
                        if(result){result.style.display='block';result.innerHTML=`<div class="neg-result-card"><h3>Negociacion completada</h3><div class="neg-result-grid"><div class="neg-result-item"><span>Precio inicial</span><strong style="color:#dc2626">${data.precio_inicial||'-'}€</strong></div><div class="neg-result-item"><span>Precio final</span><strong style="color:#16a34a">${data.precio_final||data.mejor_precio||'-'}€</strong></div><div class="neg-result-item"><span>Ahorro</span><strong style="color:#8b5cf6">${data.ahorro_euros||data.ahorro||'-'}€</strong></div><div class="neg-result-item"><span>Proveedor</span><strong>${data.proveedor_ganador||data.mejor_proveedor||'-'}</strong></div></div></div>`;}
                        return;
                    }
                    const s=data.pasos[i];
                    const d=document.createElement('div');
                    d.className='neg-sim-step '+(s.aceptado?'accepted':s.aceptado===false?'rejected':'neutral');
                    d.innerHTML=`<div class="neg-step-header"><span class="neg-step-num">Paso ${s.paso||i+1}</span><strong>${s.proveedor||''}</strong><span class="neg-step-action">${s.accion||''}</span></div><div class="neg-step-msg"><div class="neg-msg-ia"><i class="fas fa-robot"></i> ${s.mensaje_ia||''}</div>${s.respuesta_proveedor?`<div class="neg-msg-prov"><i class="fas fa-user"></i> ${s.respuesta_proveedor}</div>`:''}</div>${s.precio_conseguido?`<div class="neg-step-price">${s.precio_ofrecido?s.precio_ofrecido+'€ → ':''}${s.precio_conseguido}€ ${s.aceptado?'<i class="fas fa-check" style="color:#16a34a"></i>':'<i class="fas fa-times" style="color:#dc2626"></i>'}</div>`:''}`;
                    feed.appendChild(d);feed.scrollTop=feed.scrollHeight;i++;
                    setTimeout(showStep,1200);
                };
                showStep();
            }else{feed.innerHTML='<p>Respuesta recibida. Formato inesperado.</p>';}
        }catch(e){feed.innerHTML=`<p style="color:#dc2626">Error: ${e.message}</p>`;}
    });
}

// ============================================================
// AGENTE VENDEDOR
// ============================================================
async function initVendedor(){
    try{
        const ventas=await apiRequest('/agentes/vendedor/ventas-mes');
        if(ventas){
            const el=id=>document.getElementById(id);
            if(el('venIngresos'))el('venIngresos').textContent=(ventas.ingresos_totales_num||3140).toLocaleString('es-ES');
            if(el('venVentas'))el('venVentas').textContent=ventas.total_ventas||12;
        }
    }catch(e){
        const el=id=>document.getElementById(id);
        if(el('venIngresos'))el('venIngresos').textContent='3.140';
        if(el('venVentas'))el('venVentas').textContent='12';
    }
    try{
        const conv=await apiRequest('/agentes/vendedor/conversion');
        if(conv){
            const el=id=>document.getElementById(id);
            if(el('venConversion'))el('venConversion').textContent=(conv.tasa_global||32)+'%';
            if(el('venLeads'))el('venLeads').textContent=conv.total_leads||25;
        }
    }catch(e){const el=id=>document.getElementById(id);if(el('venConversion'))el('venConversion').textContent='32%';if(el('venLeads'))el('venLeads').textContent='25';}
    // Pipeline Kanban
    try{
        const pipeline=await apiRequest('/agentes/vendedor/pipeline');
        const el=document.getElementById('venPipeline');
        if(el&&pipeline){
            const cols=['Lead','Contactado','Interesado','Presupuestado','Cerrado'];
            const colors={'Lead':'#6b7280','Contactado':'#3b82f6','Interesado':'#f59e0b','Presupuestado':'#8b5cf6','Cerrado':'#16a34a'};
            const icons={'Lead':'fa-user-plus','Contactado':'fa-phone','Interesado':'fa-star','Presupuestado':'fa-file-invoice','Cerrado':'fa-check-circle'};
            el.innerHTML=cols.map(col=>{
                const leads=(pipeline[col]||pipeline[col.toLowerCase()]||[]);
                return `<div class="ven-kanban-col"><div class="ven-kanban-header" style="border-top:3px solid ${colors[col]}"><i class="fas ${icons[col]}"></i> ${col} <span class="ven-kanban-count">${Array.isArray(leads)?leads.length:leads?.count||0}</span></div><div class="ven-kanban-cards">${Array.isArray(leads)?leads.slice(0,4).map(l=>`<div class="ven-kanban-card"><strong>${l.nombre}</strong><span>${l.producto_interes||l.interes||'-'}</span><span class="ven-kanban-score">Score: ${l.score||'-'}</span></div>`).join(''):'<div class="ven-kanban-card"><span>${leads?.count||0} leads</span></div>'}</div></div>`;
            }).join('');
        }
    }catch(e){}
    // Lead select
    const select=document.getElementById('venLeadSelect');
    if(select){
        select.innerHTML='<option value="lead-001">Maria Lopez - Seguro Coche</option><option value="lead-002">Carlos Torres - Seguro Hogar</option><option value="lead-005">Ana Garcia - Seguro Salud</option><option value="lead-008">Pedro Ruiz - Seguro Vida</option><option value="lead-010">Sofia Martinez - Seguro Mascotas</option>';
    }
    // Comparativa
    try{
        const comp=await apiRequest('/agentes/vendedor/comparativa');
        const el=document.getElementById('venComparativa');
        if(el&&comp){
            el.innerHTML=`<div class="ven-comp-grid"><div class="ven-comp-col"><h4><i class="fas fa-users"></i> Equipo Humano</h4><div class="ven-comp-stat"><span>Llamadas/dia</span><strong>${comp.humano?.llamadas_dia||25}</strong></div><div class="ven-comp-stat"><span>Conversion</span><strong>${comp.humano?.tasa_conversion||'8%'}</strong></div><div class="ven-comp-stat"><span>Ventas/mes</span><strong>${comp.humano?.ventas_mes||8}</strong></div><div class="ven-comp-stat"><span>Coste/venta</span><strong>${comp.humano?.coste_por_venta||'125€'}</strong></div></div><div class="ven-comp-vs">VS</div><div class="ven-comp-col ven-comp-ia"><h4><i class="fas fa-robot ai-color"></i> IA Vendedora</h4><div class="ven-comp-stat"><span>Llamadas/dia</span><strong>${comp.ia?.llamadas_dia||150}</strong></div><div class="ven-comp-stat"><span>Conversion</span><strong>${comp.ia?.tasa_conversion||'32%'}</strong></div><div class="ven-comp-stat"><span>Ventas/mes</span><strong>${comp.ia?.ventas_mes||48}</strong></div><div class="ven-comp-stat"><span>Coste/venta</span><strong>${comp.ia?.coste_por_venta||'12€'}</strong></div></div></div><div class="ven-comp-verdict"><i class="fas fa-trophy" style="color:#f59e0b"></i> La IA vende <strong>${comp.ventaja||'6x'}</strong> mas que el equipo humano con <strong>${comp.ahorro_coste||'90%'}</strong> menos coste</div>`;
        }
    }catch(e){}
    // Renovaciones
    try{
        const ren=await apiRequest('/agentes/vendedor/renovaciones');
        const el=document.getElementById('venRenovaciones');
        if(el&&ren&&ren.length){
            el.innerHTML=ren.map(r=>`<div class="ven-renov-item ${r.urgencia||''}"><div class="ven-renov-info"><strong>${r.nombre}</strong><span>${r.producto||r.tipo_poliza} | ${r.poliza||''}</span></div><div class="ven-renov-date"><i class="fas fa-calendar"></i> Vence: ${r.fecha_vencimiento||r.vencimiento||'-'}</div><div class="ven-renov-prima">${r.prima||r.prima_actual||'-'}€/ano</div><button class="btn btn-sm btn-ai" onclick="showToast('Llamada de renovacion programada','ai')"><i class="fas fa-phone"></i> Llamar</button></div>`).join('');
        }
    }catch(e){}
    // Boton simulacion venta
    const btn=document.getElementById('btnIniciarVenta');
    if(btn)btn.addEventListener('click',async()=>{
        const feed=document.getElementById('venSimFeed');if(!feed)return;
        const leadId=document.getElementById('venLeadSelect')?.value||'lead-001';
        feed.innerHTML='<div class="neg-sim-loading"><div class="spinner-ring"></div> Llamando al lead...</div>';
        try{
            const data=await apiRequest('/agentes/vendedor/contactar/'+leadId,{method:'POST',body:JSON.stringify({})});
            if(data){
                const steps=data.pasos||data.log||[];
                feed.innerHTML='';
                let i=0;
                const show=()=>{
                    if(i>=steps.length){feed.innerHTML+='<div class="ven-sim-result"><i class="fas fa-check-circle" style="color:#16a34a"></i> Llamada completada</div>';return;}
                    const s=steps[i];
                    const d=document.createElement('div');d.className='neg-sim-step neutral';
                    d.innerHTML=`<div class="neg-step-header"><span class="neg-step-num">${s.paso||i+1}</span><strong>${s.tipo||''}</strong></div><div class="neg-step-msg">${s.mensaje_ia?`<div class="neg-msg-ia"><i class="fas fa-robot"></i> ${s.mensaje_ia}</div>`:''}${s.respuesta_cliente?`<div class="neg-msg-prov"><i class="fas fa-user"></i> ${s.respuesta_cliente}</div>`:''}</div>`;
                    feed.appendChild(d);feed.scrollTop=feed.scrollHeight;i++;setTimeout(show,1500);
                };show();
            }else{feed.innerHTML='<p>Lead contactado. Sin detalles de conversacion.</p>';}
        }catch(e){feed.innerHTML=`<p style="color:#dc2626">Error: ${e.message}</p>`;}
    });
}

// ============================================================
// AGENTE VIGILANTE
// ============================================================
async function initVigilante(){
    // Stats
    try{
        const stats=await apiRequest('/agentes/vigilante/estadisticas');
        if(stats){
            const el=id=>document.getElementById(id);
            if(el('vigRescatados'))el('vigRescatados').textContent=stats.expedientes_rescatados||11;
            if(el('vigMonitoreados'))el('vigMonitoreados').textContent=stats.total_monitoreados||19;
            if(el('vigAlertas'))el('vigAlertas').textContent=stats.alertas_detectadas_hoy||43;
            if(el('vigResueltas'))el('vigResueltas').textContent=stats.alertas_resueltas_auto||10;
        }
    }catch(e){
        const el=id=>document.getElementById(id);
        if(el('vigRescatados'))el('vigRescatados').textContent='11';if(el('vigMonitoreados'))el('vigMonitoreados').textContent='19';
        if(el('vigAlertas'))el('vigAlertas').textContent='43';if(el('vigResueltas'))el('vigResueltas').textContent='10';
    }
    // Semaforo
    try{
        const sem=await apiRequest('/agentes/vigilante/semaforo');
        const el=document.getElementById('vigSemaforo');
        if(el&&sem){
            const items=Array.isArray(sem)?sem:sem.siniestros||[];
            const colorMap={verde:'#16a34a',amarillo:'#f59e0b',rojo:'#dc2626',negro:'#1e293b'};
            const iconMap={verde:'fa-check-circle',amarillo:'fa-exclamation-circle',rojo:'fa-times-circle',negro:'fa-ban'};
            const labelMap={verde:'Todo OK',amarillo:'Atencion pronto',rojo:'Accion inmediata',negro:'Bloqueado'};
            el.innerHTML=items.map(s=>{
                const color=colorMap[s.semaforo||s.estado_semaforo||'verde'];
                const icon=iconMap[s.semaforo||s.estado_semaforo||'verde'];
                const label=labelMap[s.semaforo||s.estado_semaforo||'verde'];
                return `<div class="vig-sem-item" style="border-left:4px solid ${color}"><div class="vig-sem-light" style="color:${color}"><i class="fas ${icon}"></i></div><div class="vig-sem-info"><strong>${s.expediente||s.id||'-'}</strong><span>${s.cliente||'-'} | ${s.tipo||'-'} | ${s.estado||'-'}</span>${s.pendiente||s.motivo?`<span class="vig-sem-pending">${s.pendiente||s.motivo}</span>`:''}</div><div class="vig-sem-label" style="color:${color}">${label}</div></div>`;
            }).join('');
        }
    }catch(e){}
    // Feed
    try{
        const feed=await apiRequest('/agentes/vigilante/feed');
        const el=document.getElementById('vigFeed');
        if(el&&feed&&feed.length){
            el.innerHTML=feed.slice(0,12).map(f=>{
                const isAction=f.tipo==='accion'||f.texto?.includes('→');
                return `<div class="vig-feed-item ${isAction?'vig-feed-action':''}"><div class="vig-feed-icon"><i class="fas ${f.icono||'fa-eye'}"></i></div><div class="vig-feed-text">${f.texto||f.mensaje||'-'}</div><span class="vig-feed-time">${f.hora||f.timestamp||'-'}</span></div>`;
            }).join('');
        }
    }catch(e){}
    // Alertas criticas
    try{
        const alertas=await apiRequest('/agentes/vigilante/alertas-activas');
        const el=document.getElementById('vigAlertas');
        if(el&&alertas){
            const items=Array.isArray(alertas)?alertas:alertas.alertas||[];
            el.innerHTML=items.filter(a=>a.severidad==='critica'||a.severidad==='alta').slice(0,8).map(a=>{
                const sevColor={critica:'#dc2626',alta:'#f59e0b',media:'#3b82f6',baja:'#6b7280'};
                return `<div class="vig-alerta-item" style="border-left:4px solid ${sevColor[a.severidad]||'#6b7280'}"><div class="vig-alerta-header"><strong>${a.expediente||a.siniestroId||'-'}</strong><span class="vig-alerta-sev" style="background:${sevColor[a.severidad]};color:#fff">${a.severidad}</span></div><div class="vig-alerta-desc">${a.descripcion||a.tipo_alerta||'-'}</div>${a.accion_tomada?`<div class="vig-alerta-action"><i class="fas fa-robot ai-color"></i> ${a.accion_tomada}</div>`:''}<button class="btn btn-sm btn-outline" onclick="showToast('Alerta resuelta manualmente','success')"><i class="fas fa-check"></i> Resolver</button></div>`;
            }).join('');
        }
    }catch(e){}
    // Boton monitorear
    const btn=document.getElementById('btnVigilanteMonitorear');
    if(btn)btn.addEventListener('click',async()=>{
        btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Monitoreando...';btn.disabled=true;
        try{await apiRequest('/agentes/vigilante/monitorear',{method:'POST'});showToast('Monitoreo completado. Alertas actualizadas.','ai');initVigilante();}
        catch(e){showToast('Error en monitoreo','error');}
        btn.innerHTML='<i class="fas fa-sync"></i> Monitorear ahora';btn.disabled=false;
    });
}

// ============================================================
// MÓDULOS v4 - HELPERS
// ============================================================
function modLoadData(endpoint,elId,renderFn){
    apiRequest(endpoint).then(data=>{if(data){const el=document.getElementById(elId);if(el)renderFn(el,data);}}).catch(()=>{});
}
function modRenderItems(el,items,renderItem){el.innerHTML=items.map(renderItem).join('');}
function modSevColor(s){return{critica:'#dc2626',alta:'#f59e0b',media:'#3b82f6',baja:'#16a34a'}[s]||'#6b7280';}

// ============================================================
// MOTOR DE POLIZAS
// ============================================================
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

// ============================================================
// COTIZADOR
// ============================================================
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

// ============================================================
// PERITACION VIRTUAL
// ============================================================
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

// ============================================================
// RECHAZOS
// ============================================================
function initModRechazos(){
    modLoadData('/agentes/rechazos/estadisticas','rechEstadisticas',(el,data)=>{
        el.innerHTML=`<div class="mod-item"><i class="fas fa-chart-pie" style="color:#dc2626"></i><div><strong>Total rechazados: ${data.total_rechazados||data.total||12}</strong><span>Tasa rechazo: ${data.tasa_rechazo||'8%'} | Conversion mejora: ${data.conversion_mejora_poliza||data.conversion_mejora||'15%'}</span></div></div>${data.por_motivo?Object.entries(data.por_motivo).slice(0,5).map(([k,v])=>`<div class="mod-item"><i class="fas fa-ban" style="color:#f59e0b"></i><div><strong>${k}</strong><span>${v} rechazos</span></div></div>`).join(''):''}`;
    });
    modLoadData('/agentes/rechazos/historial','rechHistorial',(el,data)=>{
        const items=Array.isArray(data)?data:data.historial||[];
        el.innerHTML=items.slice(0,8).map(r=>`<div class="mod-item"><i class="fas fa-file-alt" style="color:#dc2626"></i><div><strong>${r.expediente||r.siniestroId||'-'}</strong><span>${r.motivo||r.tipo||'-'} | ${r.fecha?new Date(r.fecha).toLocaleDateString('es-ES'):'-'}</span></div></div>`).join('');
    });
}

// ============================================================
// RETENCION
// ============================================================
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

// ============================================================
// RECOBRO
// ============================================================
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

// ============================================================
// SUBROGACION
// ============================================================
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

// ============================================================
// INVESTIGACION
// ============================================================
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

// ============================================================
// NPS
// ============================================================
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

// ============================================================
// RIESGO
// ============================================================
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

// ============================================================
// COMPLIANCE
// ============================================================
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

// ============================================================
// COMPETENCIA
// ============================================================
function initModCompetencia(){
    modLoadData('/competencia/analisis','compAnalisis',(el,data)=>{
        const pos=data.posicionamiento||data;
        el.innerHTML=`<div class="mod-item"><i class="fas fa-chart-line ai-color"></i><div><strong>Posicionamiento competitivo</strong><span>${data.resumen||'Analisis de 6 competidores en 8 productos'}</span></div></div>${data.fortalezas?`<div class="mod-item"><i class="fas fa-plus-circle" style="color:#16a34a"></i><div><strong>Fortalezas</strong><span>${Array.isArray(data.fortalezas)?data.fortalezas.join(', '):data.fortalezas}</span></div></div>`:''}${data.debilidades?`<div class="mod-item"><i class="fas fa-minus-circle" style="color:#dc2626"></i><div><strong>Areas de mejora</strong><span>${Array.isArray(data.debilidades)?data.debilidades.join(', '):data.debilidades}</span></div></div>`:''}`;
    });
    modLoadData('/competencia/recomendaciones','compRecomendaciones',(el,data)=>{
        const items=Array.isArray(data)?data:data.recomendaciones||[];
        el.innerHTML=items.slice(0,6).map(r=>`<div class="mod-item"><i class="fas fa-lightbulb" style="color:#f59e0b"></i><div><strong>${r.producto||r.titulo||'-'}</strong><span>${r.recomendacion||r.descripcion||'-'}${r.impacto_estimado?` | Impacto: ${r.impacto_estimado}`:''}</span></div></div>`).join('');
    });
}
