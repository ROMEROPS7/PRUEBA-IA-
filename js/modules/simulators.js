// ============================================
// SiniestrosAI - Modulo: Simuladores de llamada y WhatsApp
// Archivo: js/modules/simulators.js
// ============================================

'use strict';

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

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initCallSimulator = initCallSimulator;
  window.initWhatsAppSimulator = initWhatsAppSimulator;
}
