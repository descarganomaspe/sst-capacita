/* 15/11/2026 · Videollamada con traducción — PILOTO, sin publicar (Claude, rama claude-llamada).
   Para dos personas: cada una habla en su idioma y lee lo que dice la otra, traducido; el original siempre a la vista.
   Piezas (ninguna librería de fuera: la política de seguridad de Netlify las bloquea):
   · Mesa de entrada y subtítulos: Supabase Realtime, canal de difusión «realtime:llamada-<código>» (sin tablas ni SQL).
     Por ahí pasan el pedido para entrar, la oferta y la respuesta de WebRTC, los candidatos de red y los subtítulos:
     si el video no conecta (datos del celular sin servidor TURN), los subtítulos siguen llegando.
   · Video y audio: RTCPeerConnection nativo (quien crea la sala hace la oferta).
   · Voz a texto: el reconocimiento de voz del navegador (Chrome y Edge).
   · Traducción: el traductor integrado de Chrome (solo en computadora). Traduce el equipo de quien habla; si ese equipo no
     tiene traductor (celular), traduce el de quien escucha. Si ninguno lo tiene, sale el original y se dice.
   · Lo tomado del prototipo «Intérprete en Vivo» v2: chromeStart (el traductor se crea dentro de un clic y se calienta
     solo; cada idioma que falte bajar pide su clic), bombear (volver a traducir lo dicho cada ~300 ms mientras se habla),
     el anti-eco de la voz, la voz y los subtítulos. */
(function(){
'use strict';
var SB = { url:'https://gwjjkknuiumgysezeatz.supabase.co', key:'sb_publishable_7fLOMEbxMHW9ButihszpoQ_gkfNKnnx' };
/* 15/11/2026 · un solo motor, dos marcas: esta página es la de OBRASST; «Intérprete en Vivo» (la página aparte para vender)
   carga antes un marca.js con window.MARCA_LLAMADA = {nombre, canal, ...}. Lo demás es igual en las dos. */
var MARCA = (window.MARCA_LLAMADA && typeof window.MARCA_LLAMADA === 'object') ? window.MARCA_LLAMADA : {};
var NOMBRE = typeof MARCA.nombre === 'string' && MARCA.nombre ? MARCA.nombre : 'OBRASST';
var CANAL = (typeof window.__LLAMADA_CANAL === 'string' && /^[a-z0-9-]{3,40}$/.test(window.__LLAMADA_CANAL)) ? window.__LLAMADA_CANAL
  : (typeof MARCA.canal === 'string' && /^[a-z0-9-]{3,40}$/.test(MARCA.canal) ? MARCA.canal : 'llamada-');
var ICE = [{urls:'stun:stun.l.google.com:19302'}, {urls:'stun:stun.cloudflare.com:3478'}];

var IDIOMAS = {
  es:{n:'Español', voz:'es-PE', tts:'es', et:'ES'},
  en:{n:'English', voz:'en-US', tts:'en', et:'EN'},
  pt:{n:'Português', voz:'pt-BR', tts:'pt', et:'PT'},
  fr:{n:'Français', voz:'fr-FR', tts:'fr', et:'FR'},
  zh:{n:'中文', voz:'zh-CN', tts:'zh', et:'中文'}
};
// 15/11/2026 · el quechua se retiró (era una prueba para saber si se podía): ver Estado — Intérprete en Vivo

/* ── textos: castellano del Perú; para quien habla otro idioma, en inglés (el portal no tiene traductor) ── */
var TXT = {
  es:{
    'titulo':'Videollamada con traducción', 'lema':'Cada uno habla en su idioma y lee lo que dice el otro, traducido. Es para dos personas.',
    'tus-datos':'Tus datos', 'tu-nombre':'Tu nombre', 'hablas':'Hablas', 'sala':'La sala', 'crear':'Crear sala',
    'o-codigo':'¿Te pasaron un código?', 'unirme':'Unirme',
    'privacidad':'Para pasar tu voz a texto, Chrome manda el audio a Google. El video va directo entre los dos equipos. Los subtítulos pasan por el servidor de {marca} y no se guardan. Lo traducido siempre sale junto al original.',
    'comparte':'Comparte este código o el enlace con la otra persona:', 'copiar':'Copiar el enlace', 'compartir':'Compartir',
    'esperando':'Esperando que alguien entre…', 'tocando':'Pidiendo permiso para entrar…', 'tocando-2':'Quien creó la sala tiene que dejarte entrar.',
    'cancelar':'Cancelar', 'sin-video':'Esperando el video de la otra persona…', 'sin-video-2':'La otra persona no tiene la cámara prendida.',
    'm-mic':'Micrófono', 'm-cam':'Cámara', 'm-voz':'Voz', 'm-texto':'Lo dicho', 'm-colgar':'Colgar', 'enviar':'Enviar',
    'escribir':'Escribe aquí si no puedes hablar', 'entendido':'Entendido',
    'motor-pc':'En esta computadora traduce el traductor de Chrome. La primera vez que uses un idioma, Chrome puede pedirte un clic para bajarlo.',
    'motor-cel':'En este equipo no hay traductor: solo existe en Chrome de computadora. Verás lo que dice la otra persona en su idioma. Si ella está en una computadora con Chrome, su equipo te manda la traducción. Traducir en el celular necesita una función del servidor que todavía no existe.',
    'motor-cel-corto':'En este equipo no hay traductor. Si la otra persona está en una computadora con Chrome, su equipo te manda la traducción.',
    'sin-rec':'Este navegador no pasa la voz a texto: usa Chrome o Edge. Igual puedes escribir.',
    'invitado':'Te invitaron a una sala. Revisa tu nombre y tu idioma, y pulsa «Unirme».',
    'codigo-mal':'Ese código no está completo: son 10 letras y números.', 'falta-nombre':'Escribe tu nombre.',
    'conectando':'Conectando…', 'sin-conexion':'No se pudo conectar con el servidor de la sala. Revisa tu internet y vuelve a intentar.',
    'canal-no':'El servidor no dejó abrir la sala. Avísale a {marca}.', 'reconectando':'Se cortó la conexión con la sala. Reconectando…',
    'pide':'{n} ({i}) quiere entrar', 'dejar':'Dejar entrar', 'no':'No',
    'rechazado':'No te dejaron entrar a la sala.', 'llena':'La sala ya tiene dos personas.',
    'nadie':'Nadie responde todavía. Revisa el código o espera a que entre quien creó la sala.',
    'entro':'{n} entró a la llamada.', 'salio':'{n} salió de la llamada.', 'esperando-otro':'Esperando a la otra persona',
    'video-falla':'El video no conecta en esta red (pasa a veces con los datos del celular). Los subtítulos siguen llegando.',
    'video-corte':'El video se cortó un momento…',
    'sin-camara':'No hay cámara ni micrófono, o no diste permiso. Igual puedes leer y escribir.',
    'mic-permiso':'El navegador no dio permiso al micrófono para pasar la voz a texto.',
    'voz-otra-ventana':'Otra ventana de este navegador está usando la voz a texto (Chrome deja una sola a la vez).', 'voz-aqui':'Usar aquí',
    'voz-red-lenta':'El servicio de voz de Chrome no responde bien; se reintenta solo. Mientras, puedes escribir abajo.',
    'voz-sin-internet':'Sin internet: la voz a texto vuelve sola cuando regrese la conexión. Mientras, puedes escribir.',
    'voz-sin-servicio':'Este navegador no llega al servicio de voz (pasa en Opera, Chromium y otros, o si la red lo bloquea). Abre esta página en Google Chrome o Microsoft Edge; aquí puedes escribir.',
    'reintentar':'Reintentar', 'voz-mic-ocupado':'El micrófono lo está usando otro programa: ciérralo para que vuelva la voz a texto.',
    'voz-idioma':'Este navegador no reconoce la voz en tu idioma. Puedes escribir.',
    'copiado':'Enlace copiado.', 'tu':'Tú', 'sin-traducir':'Sin traducir: no hay traductor en ninguno de los dos equipos.',
    'no-tradujo':'No se pudo traducir esta frase.',
    'motor-chrome':'⚡ Traductor de Chrome', 'motor-bajando':'Bajando el traductor de Chrome: {p} %', 'motor-preparando':'Preparando el traductor de Chrome…',
    'motor-toca':'👆 Toca aquí para activar el traductor', 'motor-otro':'Traduce el equipo de {n}', 'motor-no':'Sin traductor en este equipo',
    'mismo':'Hablan el mismo idioma', 'copiar-todo':'Copiar la conversación', 'cerrar':'Cerrar', 'copiada':'Conversación copiada.',
    'colgado':'Saliste de la llamada.', 'sala-chip':'Sala {c}',
    'toca-video':'Toca aquí para ver el video.', 'se-corto':'Se perdió la conexión con {n}.', 'volver-pedir':'Vuelve a pedir permiso para entrar…',
    'm-pantalla':'Pantalla', 'm-marcar':'Marcar', 'm-reunion':'Reunión', 'tab-dicho':'Lo dicho', 'tab-resumen':'Resumen',
    'notas-ayuda':'Se guardan solas, solo en este equipo, y salen en el acta.', 'm-notas':'Notas', 'notas-ph':'Escribe aquí tus notas de la reunión…',
    'n-ultimo':'+ Lo último dicho', 'n-hora':'⏱ Hora', 'notas-guardadas':'Guardadas', 'notas-recuperadas':'Recuperé tus notas de la llamada que se cerró de golpe.',
    'notas-no-guardadas':'No se pudieron guardar en este equipo', 'nada-dicho':'Todavía no hay nada dicho.', 'notas-otra-ventana':'Notas de una ventana que se cerró · {f}',
    'resumen-ayuda':'El resumen se arma con lo dicho, tus notas y lo que marcaste con ⭐. Revísalo antes de mandarlo.',
    'hacer-resumen':'Hacer el resumen', 'descargar-acta':'Descargar el acta', 'imprimir':'Imprimir o guardar en PDF', 'borrar':'Borrar',
    'ultima':'Tu última reunión', 'ultima-dato':'{f} · {d} min · con {p}. Queda solo en este equipo hasta que la borres.',
    'voz-si':'🔊 Voz: sí', 'voz-no':'🔇 Voz: no', 'marcado':'⭐ Marcado: «{t}»', 'nada-marcar':'Todavía no hay nada dicho para marcar.',
    'pantalla-on':'Estás compartiendo tu pantalla. Toca «Pantalla» otra vez para dejar de compartir.', 'pantalla-otro':'comparte su pantalla',
    'pantalla-sin-cam':'Para compartir la pantalla, primero tiene que estar conectado el video (y haber entrado con la cámara).',
    'pantalla-no':'No se pudo compartir la pantalla.',
    'res-chrome':'Resumen hecho por Chrome en esta computadora (revísalo)', 'res-preparando':'Preparando el resumen de Chrome… La primera vez puede tardar mientras baja lo que necesita.',
    'res-sin-chrome':'En este equipo no está el resumen de Chrome (solo existe en Chrome de computadora reciente). Te dejo lo que marcaste y las frases con compromisos o fechas.',
    'res-falla':'Chrome no pudo hacer el resumen. Te dejo lo que marcaste y las frases con compromisos o fechas.',
    'res-marcados':'⭐ Lo que marcaste', 'res-acuerdos':'Acuerdos y pendientes (frases con compromisos o fechas: revísalas)',
    'res-nada':'Todavía no hay nada dicho.', 'res-ninguno':'(ninguno)', 'acta-titulo':'ACTA DE LA REUNIÓN', 'acta-fecha':'Fecha',
    'acta-part':'Participantes', 'acta-sala':'Sala', 'acta-dicho':'LO DICHO', 'acta-notas':'NOTAS', 'acta-resumen':'RESUMEN', 'min':'min',
    'acta-aviso':'La traducción es automática y puede equivocarse: ante una duda, manda el original. Esta acta se armó en este equipo; nada de la reunión se guardó en un servidor.',
    'borrada':'Reunión borrada de este equipo.',
    'traducir-a':'Traducir a', 'sin-traducir-op':'— sin traducir', 'desmarcado':'☆ Desmarcado: «{t}»',
    'solo-ayuda':'¿Vas solo? Habla y verás la traducción en pantalla; también puedes compartir tu pantalla y grabarte sin esperar a nadie.',
    'm-grabar':'Grabar', 'm-detener':'Detener', 'grabando':'● Grabando {t}', 'otro-graba':'está grabando',
    'grabar-aviso':'Estás grabando. {n} ve el aviso «está grabando».', 'grabar-no':'Este navegador no puede grabar.',
    'grabado':'Tu grabación está lista ({d}).', 'bajar-video':'Descargar el video', 'srt-tr':'Subtítulos traducidos (.srt)', 'srt-or':'Subtítulos originales (.srt)',
    'grabado-ayuda':'El video ya trae los subtítulos. Los .srt sirven para YouTube y los editores de video. Nada de esto se sube a ningún lado.',
    'tab-letra':'Letra', 'letra-tam':'Tamaño de los subtítulos', 'letra-fondo':'Fondo de los subtítulos',
    'tam-n':'Normal', 'tam-g':'Grande', 'tam-xg':'Enorme', 'fondo-oscuro':'Oscuro', 'fondo-vidrio':'Vidrio', 'fondo-sin':'Sin fondo',
    'letra-ayuda':'Así salen los subtítulos en pantalla y en lo que grabes.'
  },
  en:{
    'titulo':'Video call with translation', 'lema':'Each person speaks their own language and reads what the other says, translated. For two people.',
    'tus-datos':'About you', 'tu-nombre':'Your name', 'hablas':'You speak', 'sala':'The room', 'crear':'Create a room',
    'o-codigo':'Did someone give you a code?', 'unirme':'Join',
    'privacidad':'To turn your voice into text, Chrome sends the audio to Google. Video goes directly between the two devices. Captions pass through the {marca} server and are not stored. The translation always appears next to the original.',
    'comparte':'Share this code or the link with the other person:', 'copiar':'Copy the link', 'compartir':'Share',
    'esperando':'Waiting for someone to join…', 'tocando':'Asking to join…', 'tocando-2':'The person who created the room has to let you in.',
    'cancelar':'Cancel', 'sin-video':'Waiting for the other person\'s video…', 'sin-video-2':'The other person\'s camera is off.',
    'm-mic':'Mic', 'm-cam':'Camera', 'm-voz':'Voice', 'm-texto':'Transcript', 'm-colgar':'Hang up', 'enviar':'Send',
    'escribir':'Type here if you cannot speak', 'entendido':'OK',
    'motor-pc':'On this computer, Chrome\'s built-in translator does the translation. The first time you use a language, Chrome may ask for a click to download it.',
    'motor-cel':'There is no translator on this device: it only exists in Chrome on a computer. You will see what the other person says in their language. If they are on a computer with Chrome, their device sends you the translation. Translating on phones needs a server function that does not exist yet.',
    'motor-cel-corto':'No translator on this device. If the other person is on a computer with Chrome, their device sends you the translation.',
    'sin-rec':'This browser cannot turn voice into text: use Chrome or Edge. You can still type.',
    'invitado':'You were invited to a room. Check your name and language, then press «Join».',
    'codigo-mal':'That code is incomplete: it has 10 letters and numbers.', 'falta-nombre':'Type your name.',
    'conectando':'Connecting…', 'sin-conexion':'Could not reach the room server. Check your internet and try again.',
    'canal-no':'The server did not allow the room to open. Please tell {marca}.', 'reconectando':'Connection to the room was lost. Reconnecting…',
    'pide':'{n} ({i}) wants to join', 'dejar':'Let in', 'no':'No',
    'rechazado':'You were not let into the room.', 'llena':'The room already has two people.',
    'nadie':'No answer yet. Check the code or wait for the room creator to join.',
    'entro':'{n} joined the call.', 'salio':'{n} left the call.', 'esperando-otro':'Waiting for the other person',
    'video-falla':'Video cannot connect on this network (it happens with some mobile data). Captions keep arriving.',
    'video-corte':'Video dropped for a moment…',
    'sin-camara':'No camera or microphone, or permission was denied. You can still read and type.',
    'mic-permiso':'The browser did not allow the microphone for speech to text.',
    'voz-otra-ventana':'Another window of this browser is using speech to text (Chrome allows only one at a time).', 'voz-aqui':'Use it here',
    'voz-red-lenta':'Chrome\'s speech service is not responding well; it keeps retrying. Meanwhile, you can type below.',
    'voz-sin-internet':'No internet: speech to text comes back on its own when the connection returns. Meanwhile, you can type.',
    'voz-sin-servicio':'This browser cannot reach the speech service (happens in Opera, Chromium and others, or if the network blocks it). Open this page in Google Chrome or Microsoft Edge; you can type here.',
    'reintentar':'Retry', 'voz-mic-ocupado':'Another program is using the microphone: close it to get speech to text back.',
    'voz-idioma':'This browser does not recognize speech in your language. You can type.',
    'copiado':'Link copied.', 'tu':'You', 'sin-traducir':'Not translated: neither device has a translator.',
    'no-tradujo':'This sentence could not be translated.',
    'motor-chrome':'⚡ Chrome translator', 'motor-bajando':'Downloading Chrome\'s translator: {p} %', 'motor-preparando':'Getting Chrome\'s translator ready…',
    'motor-toca':'👆 Tap here to turn on the translator', 'motor-otro':'{n}\'s device translates', 'motor-no':'No translator on this device',
    'mismo':'You both speak the same language', 'copiar-todo':'Copy the conversation', 'cerrar':'Close', 'copiada':'Conversation copied.',
    'colgado':'You left the call.', 'sala-chip':'Room {c}',
    'toca-video':'Tap here to see the video.', 'se-corto':'Lost the connection with {n}.', 'volver-pedir':'Asking to join again…',
    'm-pantalla':'Screen', 'm-marcar':'Mark', 'm-reunion':'Meeting', 'tab-dicho':'Transcript', 'tab-resumen':'Summary',
    'notas-ayuda':'Saved automatically, only on this device, and included in the minutes.', 'm-notas':'Notes', 'notas-ph':'Type your meeting notes here…',
    'n-ultimo':'+ Last thing said', 'n-hora':'⏱ Time', 'notas-guardadas':'Saved', 'notas-recuperadas':'I recovered your notes from the call that closed suddenly.',
    'notas-no-guardadas':'Could not save on this device', 'nada-dicho':'Nothing has been said yet.', 'notas-otra-ventana':'Notes from a window that closed · {f}',
    'resumen-ayuda':'The summary uses the transcript, your notes and what you marked with ⭐. Check it before sending it.',
    'hacer-resumen':'Make the summary', 'descargar-acta':'Download the minutes', 'imprimir':'Print or save as PDF', 'borrar':'Delete',
    'ultima':'Your last meeting', 'ultima-dato':'{f} · {d} min · with {p}. It stays only on this device until you delete it.',
    'voz-si':'🔊 Voice: on', 'voz-no':'🔇 Voice: off', 'marcado':'⭐ Marked: «{t}»', 'nada-marcar':'Nothing has been said yet.',
    'pantalla-on':'You are sharing your screen. Tap «Screen» again to stop.', 'pantalla-otro':'is sharing their screen',
    'pantalla-sin-cam':'To share your screen, the video has to be connected first (and you must have joined with your camera).',
    'pantalla-no':'Could not share the screen.',
    'res-chrome':'Summary made by Chrome on this computer (check it)', 'res-preparando':'Getting Chrome\'s summary ready… The first time it may take a while to download.',
    'res-sin-chrome':'Chrome\'s summary is not available on this device (only in recent Chrome on a computer). Here is what you marked and the sentences with commitments or dates.',
    'res-falla':'Chrome could not make the summary. Here is what you marked and the sentences with commitments or dates.',
    'res-marcados':'⭐ What you marked', 'res-acuerdos':'Agreements and to-dos (sentences with commitments or dates: check them)',
    'res-nada':'Nothing has been said yet.', 'res-ninguno':'(none)', 'acta-titulo':'MEETING MINUTES', 'acta-fecha':'Date',
    'acta-part':'Participants', 'acta-sala':'Room', 'acta-dicho':'TRANSCRIPT', 'acta-notas':'NOTES', 'acta-resumen':'SUMMARY', 'min':'min',
    'acta-aviso':'The translation is automatic and can be wrong: if in doubt, the original rules. These minutes were made on this device; nothing from the meeting was stored on a server.',
    'borrada':'Meeting deleted from this device.',
    'traducir-a':'Translate to', 'sin-traducir-op':'— no translation', 'desmarcado':'☆ Unmarked: «{t}»',
    'solo-ayuda':'On your own? Speak and you will see the translation on screen; you can also share your screen and record yourself without waiting for anyone.',
    'm-grabar':'Record', 'm-detener':'Stop', 'grabando':'● Recording {t}', 'otro-graba':'is recording',
    'grabar-aviso':'You are recording. {n} sees the notice «is recording».', 'grabar-no':'This browser cannot record.',
    'grabado':'Your recording is ready ({d}).', 'bajar-video':'Download the video', 'srt-tr':'Translated subtitles (.srt)', 'srt-or':'Original subtitles (.srt)',
    'grabado-ayuda':'The video already has the subtitles. The .srt files are for YouTube and video editors. Nothing is uploaded anywhere.',
    'tab-letra':'Text', 'letra-tam':'Subtitle size', 'letra-fondo':'Subtitle background',
    'tam-n':'Normal', 'tam-g':'Large', 'tam-xg':'Huge', 'fondo-oscuro':'Dark', 'fondo-vidrio':'Glass', 'fondo-sin':'No background',
    'letra-ayuda':'This is how subtitles look on screen and in your recordings.'
  }
};
function hay(k){ return typeof k === 'string' && Object.prototype.hasOwnProperty.call(IDIOMAS, k); }
function uiLang(){ return S.yo.idioma === 'es' ? 'es' : 'en'; }
function T(k, d){ var s = (TXT[uiLang()] || TXT.es)[k] || TXT.es[k] || k; s = s.split('{marca}').join(NOMBRE); if(d) for(var x in d) s = s.split('{'+x+'}').join(d[x]); return s; }

/* ── utilidades ── */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function guardar(k, v){ try{ localStorage.setItem('llamada.'+k, v); return true; }catch(e){ return false; } }
function leer(k){ try{ return localStorage.getItem('llamada.'+k); }catch(e){ return null; } }
var ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function azar(n){ return Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(n)), function(b){ return ABC[b % 32]; }).join(''); }
function limpiarCodigo(s){ return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function codigoValido(c){ return c.length === 10 && /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/.test(c); }
function verCodigo(c){ return c.slice(0,4)+'-'+c.slice(4,8)+'-'+c.slice(8); }
var norm = function(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim(); };
var palabras = function(s){ var n = norm(s); return /[一-鿿]/.test(n) ? Array.from(n.replace(/\s/g, '')) : n.split(/\s+/).filter(Boolean); };

/* ── estado ── */
var S = {
  yo:{id:azar(8), nombre:'', idioma:'es'}, otro:null, anfitrion:false, codigo:null, pantalla:'entrada',
  pc:null, dc:null, media:null, iceCola:[], remota:false, mic:true, cam:true, voz:true,
  seq:0, curId:null, lineas:{}, finalizadas:{}, orden:[], pedidos:{}, otroPuede:null, ultimo:0, vida:null,
  rec:null, recQuiere:false, recFallas:0, ttsRecent:[], ttsActivo:false, volOtro:1, tocar:null, tocarDesde:0,
  gente:[], inicio:null, resumen:'', ultima:null, compartiendo:null, otroPantalla:false, mediosP:null,
  practica:'', otroGraba:false, subRec:null, letra:'n', fondo:'oscuro'
};
// las frases del otro se guardan con SU id: si después entra otra persona, sus frases no pisan las de la anterior
function claveOtro(id){ return 'otro-' + (S.otro ? S.otro.id : '') + '-' + id; }
// el canal directo (cifrado, de equipo a equipo) está abierto: los subtítulos ya no dependen del canal de la sala
function dcAbierto(){ return !!(S.dc && S.dc.readyState === 'open'); }
function destino(){
  if(S.otro) return S.otro.idioma !== S.yo.idioma ? S.otro.idioma : null;
  return (hay(S.practica) && S.practica !== S.yo.idioma) ? S.practica : null;
}

/* ════ 1) Traductor integrado de Chrome (del prototipo v2) ════
   Se crea DENTRO de un clic (Chrome lo exige) y, cuando termina de prepararse, se usa solo. La primera traducción tarda
   ~10 s (carga el modelo): se hace aquí con «Hola.» y no con la primera frase. Si el idioma ya está instalado no pide clic;
   si falta bajarlo, queda en «falta» y el siguiente clic en cualquier parte lo activa. */
var TR = {listo:{}, prep:{}, falta:{}, prog:null, ms:null};
function hayTraductor(){ return 'Translator' in self; }
function trStart(de, a){
  if(!hayTraductor() || !de || !a || de === a) return;
  var k = de+'>'+a;
  if(k in TR.listo || TR.prep[k]) return;
  var par = {sourceLanguage:de, targetLanguage:a};
  var crear = function(){
    delete TR.falta[k];
    var p;
    try{
      p = Translator.create({sourceLanguage:de, targetLanguage:a, monitor:function(m){
        try{ m.addEventListener('downloadprogress', function(e){ TR.prog = Math.round(e.loaded * 100); pintarMotor(); }); }catch(e){}
      }});
    }catch(e){ return; }
    TR.prep[k] = Promise.resolve(p).then(function(t){
      TR.prog = 100; pintarMotor();
      return Promise.resolve(t.translate('Hola.')).catch(function(){}).then(function(){ TR.listo[k] = t; TR.prog = null; pintarMotor(); return t; });
    }, function(e){
      if(e && e.name === 'NotAllowedError') TR.falta[k] = 1; else TR.listo[k] = null;
      TR.prog = null; pintarMotor(); return null;
    }).then(function(t){ delete TR.prep[k]; pintarMotor(); return t; });
  };
  if(navigator.userActivation && navigator.userActivation.isActive){ crear(); return; }
  var p0;
  try{ p0 = Translator.availability(par); }catch(e){ return; }
  TR.prep[k] = Promise.resolve(p0).then(function(d){
    delete TR.prep[k];
    if(d === 'available') crear();
    else if(d === 'unavailable') TR.listo[k] = null;
    else TR.falta[k] = 1;
    pintarMotor();
  }, function(){ delete TR.prep[k]; TR.falta[k] = 1; pintarMotor(); });
}
document.addEventListener('click', function(){ Object.keys(TR.falta).forEach(function(k){ var x = k.split('>'); trStart(x[0], x[1]); }); }, true);
function trListo(de, a){ return TR.listo[de+'>'+a] || null; }
function prepararAmbos(){
  if(S.otro){ trStart(S.yo.idioma, S.otro.idioma); trStart(S.otro.idioma, S.yo.idioma); }
  else if(destino()) trStart(S.yo.idioma, destino());
  pintarMotor();
}
var CACHE = new Map();
function traducir(txt, de, a){
  var t = trListo(de, a); if(!t) return Promise.reject(new Error('sin traductor'));
  var k = de+'>'+a+'|'+txt; if(CACHE.has(k)) return CACHE.get(k);
  var t0 = performance.now();
  var p = Promise.resolve(t.translate(txt)).then(function(r){ TR.ms = Math.round(performance.now() - t0); pintarMotor(); return String(r || ''); });
  CACHE.set(k, p); p.catch(function(){ CACHE.delete(k); });
  if(CACHE.size > 300) CACHE.delete(CACHE.keys().next().value);
  return p;
}
// esconde las últimas palabras provisionales: son las que más cambian
function tapar(tr, a, k){
  if(a === 'zh'){ var c = Array.from(tr); return c.length > 6 ? c.slice(0, c.length - k * 2).join('') + '…' : tr; }
  var w = tr.trim().split(/\s+/); return w.length > 4 ? w.slice(0, w.length - k).join(' ') + ' …' : tr;
}
/* bombear (del prototipo): mientras se habla, se vuelve a traducir TODO lo dicho cada ~300 ms; solo cuenta lo último.
   Dos bombas: lo que digo yo (BO) y lo que dice el otro cuando su equipo no puede traducir (BI). */
var BO = {pend:null, ocupada:false}, BI = {pend:null, ocupada:false};
function bombear(B){
  if(B.ocupada || !B.pend) return;
  var p = B.pend; B.pend = null; B.ocupada = true;
  var t0 = performance.now();
  traducir(p.txt, p.de, p.a).then(function(tr){ if(!S.finalizadas[p.clave]) p.listo(tapar(tr, p.a, 2)); }, function(){})
    .then(function(){ B.ocupada = false; setTimeout(function(){ bombear(B); }, Math.max(0, 300 - (performance.now() - t0))); });
}
function pintarMotor(){
  var el = $('chip-motor'); if(!el) return;
  var a = destino(), t;
  if(S.pantalla !== 'sala' || (!S.otro && !a)){ el.hidden = true; return; }
  el.hidden = false;
  if(!a){ el.textContent = T('mismo'); return; }
  var k = S.yo.idioma+'>'+a;
  if(trListo(S.yo.idioma, a)) t = T('motor-chrome');
  else if(TR.prog != null) t = TR.prog < 100 ? T('motor-bajando', {p:TR.prog}) : T('motor-preparando');
  else if(TR.prep[k]) t = T('motor-preparando');
  else if(TR.falta[k] || TR.falta[a+'>'+S.yo.idioma]) t = T('motor-toca');
  else if(S.otro && S.otroPuede) t = T('motor-otro', {n:S.otro.nombre});
  else t = T('motor-no');
  if(TR.ms != null && trListo(S.yo.idioma, a)) t += ' · ' + (TR.ms < 1000 ? TR.ms + ' ms' : (TR.ms / 1000).toFixed(1).replace('.', ',') + ' s');
  el.textContent = t;
}

/* ════ 2) Mesa de entrada: Supabase Realtime, canal de difusión (cliente propio, como «EN VIVO» del portal) ════ */
var RT = {ws:null, ref:0, lat:null, unido:false, cola:[], tema:null, joinRef:null, alUnirse:null, cerrado:true, intentos:0, falla:null, tope:null, latRef:null};
function rtEnviar(topic, event, payload){
  RT.ref++; var r = String(RT.ref);
  try{ RT.ws.send(JSON.stringify({topic:topic, event:event, payload:payload || {}, ref:r})); }catch(e){}
  return r;
}
function rtAbrir(codigo, alUnirse){
  RT.tema = 'realtime:' + CANAL + codigo.toLowerCase(); RT.alUnirse = alUnirse; RT.cerrado = false; RT.intentos = 0; RT.falla = null;
  rtConectar();
}
function rtListo(ok, por){
  if(!RT.alUnirse) return;
  var f = RT.alUnirse; RT.alUnirse = null; clearTimeout(RT.tope);
  if(!ok) rtCerrar();      // sin sala no se sigue reintentando por detrás
  f(ok, por);
}
function rtConectar(){
  var ws;
  try{ ws = new WebSocket(SB.url.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(SB.key) + '&vsn=1.0.0'); }
  catch(e){ rtListo(false, 'socket'); return; }
  RT.ws = ws; RT.unido = false;
  clearTimeout(RT.tope); if(RT.alUnirse) RT.tope = setTimeout(function(){ rtListo(false, 'tiempo'); }, 12000);
  ws.onopen = function(){
    RT.joinRef = rtEnviar(RT.tema, 'phx_join', {config:{broadcast:{self:false, ack:false}, presence:{key:''}, postgres_changes:[], private:false}});
    clearInterval(RT.lat); RT.latRef = null;
    // si el latido anterior no tuvo respuesta, el socket quedó medio abierto (pasa al cambiar de wifi a datos): se reabre
    RT.lat = setInterval(function(){
      if(RT.latRef){ try{ ws.close(); }catch(e){} return; }
      RT.latRef = rtEnviar('phoenix', 'heartbeat', {});
    }, 20000);
  };
  ws.onmessage = function(ev){
    var m; try{ m = JSON.parse(ev.data); }catch(e){ return; }
    if(m.topic === 'phoenix' && m.ref === RT.latRef){ RT.latRef = null; return; }
    if(m.topic !== RT.tema) return;
    if(m.event === 'phx_reply' && m.ref === RT.joinRef){
      if(m.payload && m.payload.status === 'ok'){
        RT.unido = true; RT.intentos = 0; if(S.pantalla === 'sala') estado('');
        var c = RT.cola; RT.cola = []; c.forEach(rtMandarYa); rtListo(true);
      } else {
        RT.falla = (m.payload && m.payload.response && (m.payload.response.reason || m.payload.response.message)) || 'join';
        RT.cerrado = true; try{ ws.close(); }catch(e){} rtListo(false, RT.falla);
      }
      return;
    }
    if(m.event === 'broadcast' && m.payload && m.payload.event === 'm') alMensaje(m.payload.payload || {});
    else if(m.event === 'phx_error' || m.event === 'phx_close'){ try{ ws.close(); }catch(e){} }
  };
  ws.onclose = function(){
    if(RT.ws !== ws) return;            // un socket viejo que termina de cerrarse no toca al nuevo
    RT.unido = false; clearInterval(RT.lat);
    if(RT.cerrado) return;
    if(RT.alUnirse && RT.intentos > 2){ rtListo(false, 'socket'); return; }
    RT.intentos++; if(S.pantalla === 'sala') estado(T('reconectando'), 'mal');
    setTimeout(function(){ if(!RT.cerrado && RT.ws === ws) rtConectar(); }, Math.min(15000, 800 * Math.pow(2, RT.intentos)));
  };
}
function rtCerrar(){ RT.cerrado = true; clearInterval(RT.lat); clearTimeout(RT.tope); RT.alUnirse = null; RT.cola = []; var w = RT.ws; RT.ws = null; RT.unido = false; if(w){ try{ w.close(); }catch(e){} } }
function rtMandarYa(o){ rtEnviar(RT.tema, 'broadcast', {type:'broadcast', event:'m', payload:o}); }
function mandar(o){
  if(RT.cerrado) return;
  o.de = S.yo.id;
  if(!RT.unido){
    if(o.t === 'par' || o.t === 'sigo' || (o.t === 'tra' && o.prov)) return;   // lo provisional no se guarda: llenaría la cola
    RT.cola.push(o); if(RT.cola.length > 60) RT.cola.shift(); return;
  }
  rtMandarYa(o);
}
/* Lo dicho (subtítulos, traducción, «sigo», «chau») va por el canal directo cuando está abierto: viaja cifrado de equipo a
   equipo y nadie más de la sala lo puede leer ni imitar. Si el video no conecta (datos del celular sin TURN), va por la sala. */
function mandarSub(o){
  if(dcAbierto()){ try{ o.de = S.yo.id; S.dc.send(JSON.stringify(o)); return; }catch(e){} }
  mandar(o);
}
// lo provisional se manda como mucho cada 200 ms (el reconocedor avisa casi en cada sílaba)
var PAR = {ult:0, pend:null, t:null};
function mandarParcial(o){
  PAR.pend = o; var falta = 200 - (Date.now() - PAR.ult);
  if(falta <= 0){ PAR.ult = Date.now(); mandarSub(PAR.pend); PAR.pend = null; return; }
  if(!PAR.t) PAR.t = setTimeout(function(){ PAR.t = null; if(PAR.pend && S.otro){ PAR.ult = Date.now(); mandarSub(PAR.pend); PAR.pend = null; } }, falta);
}
function soltarParcial(){ clearTimeout(PAR.t); PAR.t = null; PAR.pend = null; }

/* ════ 3) Lo que llega por el canal ════ */
/* OJO: el canal de la sala lo oye cualquiera que tenga el código, y el «de» lo escribe quien manda. Por eso: el invitado
   acepta un solo «pasa»; la oferta y la respuesta de video solo en el estado que corresponde; y, apenas abre el canal
   directo, lo dicho por el canal de la sala se ignora. Cerrarlo de verdad pide un canal privado con cuenta (SQL, después). */
function alMensaje(m){
  if(!m || typeof m.de !== 'string' || m.de === S.yo.id || S.saliendo) return;
  if(m.para && m.para !== S.yo.id) return;
  // quien creó la sala: los pedidos para entrar (cada pedido vive 10 s si no se repite; como mucho 5 a la vista)
  if(m.t === 'pido' && S.anfitrion){
    if(S.otro && S.otro.id === m.de){   // volvió a pedir (se le cortó): se le contesta otra vez y, si el video no está, se vuelve a ofrecer
      mandar({t:'pasa', para:m.de, nombre:S.yo.nombre, idioma:S.yo.idioma});
      if(!S.pc || (Date.now() - S.pcDesde > 8000 && !/connected|completed/.test(S.pc.iceConnectionState))) ofrecer();
      return;
    }
    if(S.otro){ mandar({t:'no', para:m.de, por:'llena'}); return; }
    if(!hay(m.idioma)) return;
    var nuevo = !S.pedidos[m.de];
    if(nuevo && Object.keys(S.pedidos).length >= 5) return;
    S.pedidos[m.de] = {id:m.de, nombre:String(m.nombre || '?').slice(0, 40), idioma:m.idioma, cuando:Date.now()};
    if(nuevo) pintarPedidos();
    return;
  }
  if(m.t === 'me-voy' && S.anfitrion && S.pedidos[m.de]){ delete S.pedidos[m.de]; pintarPedidos(); return; }
  // quien pidió entrar: la respuesta (un solo «pasa»)
  if(!S.anfitrion && S.pantalla === 'tocando'){
    if(m.t === 'pasa' && hay(m.idioma) && !S.otro){ S.otro = {id:m.de, nombre:String(m.nombre || '?').slice(0, 40), idioma:m.idioma}; pararTocar(); entrarSala(); return; }
    if(m.t === 'no'){ pararTocar(); msgTocando(T(m.por === 'llena' ? 'llena' : 'rechazado'), 'mal'); return; }
    return;
  }
  if(!S.otro || m.de !== S.otro.id) return;
  if(m.t === 'sdp' || m.t === 'ice') S.ultimo = Date.now();
  if(m.t === 'sdp') alSdp(m.d);
  else if(m.t === 'ice') alIce(m.c);
  else if(!S.dcOtro) alDicho(m);   // hasta que llega lo primero del otro por el canal directo (no abre a la vez en los dos lados)
}
// lo dicho por el otro (llega por el canal directo o, si no está abierto, por el de la sala)
function alDicho(m){
  if(!S.otro || !m || S.saliendo) return;
  S.ultimo = Date.now();
  if(m.t === 'par') alParcialOtro(m);
  else if(m.t === 'fin') alFinalOtro(m);
  else if(m.t === 'tra') alTraduccionOtro(m);
  else if(m.t === 'chau') seFue();
  else if(m.t === 'pantalla'){ S.otroPantalla = !!m.on; $('v-otro').classList.toggle('pantalla', S.otroPantalla); pintarChipOtro(); }
  else if(m.t === 'graba'){ S.otroGraba = !!m.on; pintarChipOtro(); }
}

/* ════ 4) Video y audio: RTCPeerConnection nativo ════ */
function pedirMedios(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(null);
  var aud = {echoCancellation:true, noiseSuppression:true, autoGainControl:true};
  return navigator.mediaDevices.getUserMedia({video:{facingMode:'user', width:{ideal:640}, height:{ideal:480}}, audio:aud})
    .catch(function(){ return navigator.mediaDevices.getUserMedia({audio:aud}); })
    .catch(function(){ return null; });
}
function nuevaPC(){
  cerrarPC();
  var pc = new RTCPeerConnection({iceServers:ICE});
  S.pc = pc; S.pcDesde = Date.now(); S.remota = false; S.iceCola = [];
  pc.onicecandidate = function(e){ if(e.candidate && S.otro) mandar({t:'ice', para:S.otro.id, c:e.candidate.toJSON ? e.candidate.toJSON() : e.candidate}); };
  pc.ontrack = function(e){
    var v = $('v-otro'), st = (e.streams && e.streams[0]) || null;
    if(!st){ st = v.srcObject instanceof MediaStream ? v.srcObject : new MediaStream(); st.addTrack(e.track); }
    if(v.srcObject !== st) v.srcObject = st;
    v.volume = S.volOtro; v.classList.toggle('pantalla', !!S.otroPantalla);
    if(e.track.kind === 'video') $('sin-video').hidden = true;
    // si el navegador no deja reproducir solo (iPhone), un toque en la pantalla lo arranca
    var p = v.play && v.play();
    if(p && p.catch) p.catch(function(){ var sv = $('sin-video'); sv.hidden = false; sv.textContent = T('toca-video'); sv.onclick = function(){ v.play().then(function(){ sv.hidden = true; sv.onclick = null; }, function(){}); }; });
  };
  pc.ondatachannel = function(e){ ponerDC(e.channel); };
  pc.oniceconnectionstatechange = function(){
    if(S.pc !== pc) return;
    var s = pc.iceConnectionState;
    if(s === 'failed'){
      estado(T('video-falla'), 'mal');
      // un cambio de red (wifi → datos) mata la conexión: quien creó la sala la vuelve a ofrecer una vez
      if(S.anfitrion && S.otro && !S.reofrecido){ S.reofrecido = true; setTimeout(function(){ if(S.pc === pc && S.otro && pc.iceConnectionState === 'failed') ofrecer(); }, 2000); }
    }
    else if(s === 'disconnected') estado(T('video-corte'));
    else if(s === 'connected' || s === 'completed'){ clearTimeout(S.tVideo); S.reofrecido = false; if(RT.unido) estado(''); }
  };
  clearTimeout(S.tVideo);
  S.tVideo = setTimeout(function(){ if(S.pc === pc && !/connected|completed/.test(pc.iceConnectionState)) estado(T('video-falla'), 'mal'); }, 25000);
  return pc;
}
function ponerDC(dc){
  if(S.dc && S.dc !== dc){ try{ S.dc.close(); }catch(e){} }
  S.dc = dc; S.dcOtro = false;
  // apenas abre, un «sigo» por ahí: así el otro deja de aceptar lo dicho por el canal de la sala en milisegundos
  var saludar = function(){
    if(S.dc !== dc) return;
    try{
      dc.send(JSON.stringify({t:'sigo', de:S.yo.id}));
      if(S.compartiendo) dc.send(JSON.stringify({t:'pantalla', on:true, de:S.yo.id}));   // ya estaba compartiendo antes de que entre
      if(GR.rec) dc.send(JSON.stringify({t:'graba', on:true, de:S.yo.id}));
    }catch(e){}
  };
  dc.onopen = saludar; if(dc.readyState === 'open') saludar();
  dc.onmessage = function(e){ if(S.dc !== dc) return; var m; try{ m = JSON.parse(e.data); }catch(x){ return; } S.dcOtro = true; alDicho(m); };
}
function cerrarPC(){
  clearTimeout(S.tVideo);
  if(S.dc){ try{ S.dc.close(); }catch(e){} } S.dc = null; S.dcOtro = false;
  if(S.pc){ try{ S.pc.close(); }catch(e){} } S.pc = null; S.iceCola = [];
  var v = $('v-otro'); if(v) v.srcObject = null; if($('sin-video')) $('sin-video').hidden = false;
}
function ponerPistas(pc, oferta){
  var pistas = S.media ? S.media.getTracks() : [];
  ['audio', 'video'].forEach(function(k){
    var t = (k === 'video' && S.compartiendo) ? S.compartiendo.getVideoTracks()[0] : pistas.filter(function(x){ return x.kind === k; })[0];
    if(t) pc.addTrack(t, S.media || S.compartiendo); else if(oferta) pc.addTransceiver(k, {direction:'recvonly'});
  });
}
function ofrecer(){   // quien creó la sala
  var pc = nuevaPC(); ponerPistas(pc, true);
  ponerDC(pc.createDataChannel('dicho', {ordered:true}));
  pc.createOffer().then(function(o){ return pc.setLocalDescription(o); })
    .then(function(){ mandar({t:'sdp', para:S.otro.id, d:{type:pc.localDescription.type, sdp:pc.localDescription.sdp}}); })
    .catch(function(){ estado(T('video-falla'), 'mal'); });
}
function alSdp(d){
  if(!d || !d.type) return;
  if(d.type === 'offer'){
    // una oferta nueva solo si todavía no hay video conectado (la primera, o la que vuelve a ofrecer quien creó la sala)
    if(S.anfitrion || (S.pc && /connected|completed/.test(S.pc.iceConnectionState))) return;
    var pc = nuevaPC();
    pc.setRemoteDescription(d).then(function(){ S.remota = true; soltarIce(); return S.mediosP; })
      .then(function(){ if(S.pc !== pc) throw 0; ponerPistas(pc, false); return pc.createAnswer(); })
      .then(function(a){ return pc.setLocalDescription(a); })
      .then(function(){ mandar({t:'sdp', para:S.otro.id, d:{type:pc.localDescription.type, sdp:pc.localDescription.sdp}}); })
      .catch(function(e){ if(e !== 0) estado(T('video-falla'), 'mal'); });
  } else if(d.type === 'answer' && S.pc && S.anfitrion && S.pc.signalingState === 'have-local-offer'){
    S.pc.setRemoteDescription(d).then(function(){ S.remota = true; soltarIce(); }).catch(function(){});
  }
}
function alIce(c){ if(!c) return; if(!S.pc || !S.remota){ S.iceCola.push(c); return; } S.pc.addIceCandidate(c).catch(function(){}); }
function soltarIce(){ var c = S.iceCola; S.iceCola = []; c.forEach(function(x){ S.pc.addIceCandidate(x).catch(function(){}); }); }

/* ════ 5) Lo que digo yo ════ */
function alParcial(txt){
  if(!S.curId) S.curId = ++S.seq;
  var id = S.curId, clave = 'yo-'+id;
  linea(clave, 'yo', {o:txt, prov:true, idioma:S.yo.idioma, nombre:S.yo.nombre});
  var a = destino(), puedo = !!(a && trListo(S.yo.idioma, a));
  if(S.otro) mandarParcial({t:'par', id:id, txt:txt, puedo:puedo});
  if(puedo && palabras(txt).length >= 2){
    BO.pend = {clave:clave, txt:txt, de:S.yo.idioma, a:a, listo:function(v){
      linea(clave, 'yo', {tr:v, a:a, trProv:true}); if(S.otro) mandarSub({t:'tra', id:id, txt:v, a:a, prov:true});
    }};
    bombear(BO);
  }
}
function alFinal(txt, escrito){
  var id = S.curId || ++S.seq, clave = 'yo-'+id; S.curId = null;
  txt = String(txt || '').trim(); if(!txt) return;
  S.finalizadas[clave] = 1; if(BO.pend && BO.pend.clave === clave) BO.pend = null;
  var antes = S.lineas[clave];
  linea(clave, 'yo', {o:txt, prov:false, idioma:S.yo.idioma, nombre:S.yo.nombre, escrito:!!escrito});
  var a = destino(), puedo = !!(a && trListo(S.yo.idioma, a));
  if(S.otro){ soltarParcial(); mandarSub({t:'fin', id:id, txt:txt, puedo:puedo}); }
  if(!a || !puedo) return;
  // mientras llega la versión firme se deja a la vista la provisional
  linea(clave, 'yo', {tr:(antes && antes.tr) || '…', a:a, trProv:true});
  traducir(txt, S.yo.idioma, a).then(function(tr){
    linea(clave, 'yo', {tr:tr, a:a, trProv:false, err:''}); if(S.otro) mandarSub({t:'tra', id:id, txt:tr, a:a, prov:false});
  }, function(){
    linea(clave, 'yo', {tr:'', err:T('no-tradujo')}); if(S.otro) mandarSub({t:'tra', id:id, txt:'', a:a, fallo:true});
  });
}

/* ════ 6) Lo que dice el otro ════ */
function alParcialOtro(m){
  var clave = claveOtro(m.id); if(S.finalizadas[clave]) return;
  S.otroPuede = !!m.puedo; pintarMotor();
  linea(clave, 'otro', {o:String(m.txt || ''), prov:true, idioma:S.otro.idioma, nombre:S.otro.nombre});
  var de = S.otro.idioma, a = S.yo.idioma;
  if(!m.puedo && de !== a && trListo(de, a) && palabras(m.txt).length >= 2){
    BI.pend = {clave:clave, txt:String(m.txt), de:de, a:a, listo:function(v){ linea(clave, 'otro', {tr:v, a:a, trProv:true}); }};
    bombear(BI);
  }
}
function alFinalOtro(m){
  var clave = claveOtro(m.id); S.finalizadas[clave] = 1; if(BI.pend && BI.pend.clave === clave) BI.pend = null;
  S.otroPuede = !!m.puedo; pintarMotor();
  linea(clave, 'otro', {o:String(m.txt || ''), prov:false, idioma:S.otro.idioma, nombre:S.otro.nombre});
  if(!m.puedo) traducirAqui(clave, String(m.txt || ''));
}
function traducirAqui(clave, txt){
  var de = S.otro.idioma, a = S.yo.idioma;
  if(de === a) return;
  if(!trListo(de, a)){ linea(clave, 'otro', {tr:'', sinTr:true}); return; }
  traducir(txt, de, a).then(function(tr){ linea(clave, 'otro', {tr:tr, a:a, trProv:false, sinTr:false}); hablar(tr, a); },
    function(){ linea(clave, 'otro', {tr:'', err:T('no-tradujo')}); });
}
function alTraduccionOtro(m){
  var clave = claveOtro(m.id), L = S.lineas[clave];
  if(m.fallo){ if(L) traducirAqui(clave, L.o); return; }
  if(m.a !== S.yo.idioma) return;
  if(m.prov && L && L.tr && !L.trProv) return;   // una provisional tardía no pisa la firme
  linea(clave, 'otro', {tr:String(m.txt || ''), a:m.a, trProv:!!m.prov, sinTr:false, err:''});
  if(!m.prov) hablar(m.txt, S.yo.idioma);
}

/* ════ 7) En pantalla: subtítulo grande (lo del otro), lo mío abajo y la reunión (lo dicho, notas, resumen, acta) ════ */
function linea(clave, quien, patch){
  var L = S.lineas[clave];
  if(!L){ L = S.lineas[clave] = {clave:clave, quien:quien, o:'', tr:'', prov:true, trProv:false, idioma:'', nombre:'', a:'', t:Date.now()}; S.orden.push(clave); }
  for(var k in patch) L[k] = patch[k];
  if(patch.prov === false && !L.tfin) L.tfin = Date.now();
  if(quien === 'otro' || !S.otro) pintarSub(L); else pintarMio(L);
  S.subRec = {L:L, cuando:Date.now()};
  if(!$('registro').hidden && !$('tab-dicho').hidden) pintarRegistro();
  return L;
}
function trHtml(L){
  if(L.err) return '<span class="etq">!</span>' + esc(L.err);
  if(L.sinTr) return esc(T('sin-traducir'));
  if(!L.tr) return '';
  return '<span class="etq">' + esc((IDIOMAS[L.a] || {}).et || '') + '</span>' + esc(L.tr);
}
var tSub, tMio;
function pintarSub(L){
  var o = $('sub-orig'), t = $('sub-tr'), h = trHtml(L);
  if(h){ o.hidden = !L.o; o.textContent = L.nombre + ': ' + L.o; o.classList.toggle('prov', !!L.prov); t.hidden = false; t.innerHTML = h; t.classList.toggle('prov', !!L.trProv); }
  else { o.hidden = true; t.hidden = !L.o; t.textContent = L.o; t.classList.toggle('prov', !!L.prov); }
  clearTimeout(tSub); tSub = setTimeout(function(){ o.hidden = t.hidden = true; }, 9000);
}
function pintarMio(L){
  var box = $('mio'), h = trHtml(L);
  box.innerHTML = '<b>' + esc(T('tu')) + ':</b> <span' + (L.prov ? ' class="prov"' : '') + '>' + esc(L.o) + '</span>' + (h ? ' <span class="tr' + (L.trProv ? ' prov' : '') + '">→ ' + h + '</span>' : '');
  clearTimeout(tMio); tMio = setTimeout(function(){ box.innerHTML = ''; }, 12000);
}
function hora(t){ try{ return new Date(t).toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'}); }catch(e){ return ''; } }
function pintarRegistro(){
  var box = $('tab-dicho'), h = '';
  S.orden.forEach(function(k){
    var L = S.lineas[k]; if(!L || !L.o) return;
    h += '<div class="ln' + (L.marca ? ' clave' : '') + '"><div class="quien">' + esc(hora(L.t)) + ' · ' + esc(L.nombre) + ' · ' + esc((IDIOMAS[L.idioma] || {}).n || '') + '</div><div class="o">' + esc(L.o) + '</div><div class="t">' + trHtml(L) + '</div>'
      + (L.prov ? '' : '<button class="estrella" type="button" data-k="' + esc(k) + '" aria-pressed="' + (!!L.marca) + '" title="' + esc(T('m-marcar')) + '">' + (L.marca ? '⭐' : '☆') + '</button>') + '</div>';
  });
  box.innerHTML = h || '<p class="res-gris">' + esc(T('res-nada')) + '</p>';
  var r = $('registro'); r.scrollTop = r.scrollHeight;
}
function verTab(n){
  S.tab = n;
  ['dicho', 'resumen', 'letra'].forEach(function(x){ $('tab-' + x).hidden = x !== n; });
  Array.prototype.forEach.call(document.querySelectorAll('.tabs [data-tab]'), function(b){ b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === n)); });
  if(n === 'dicho') pintarRegistro();
}
function pintarVoz(){ $('b-voz').textContent = T(S.voz ? 'voz-si' : 'voz-no'); $('b-voz').setAttribute('aria-pressed', String(S.voz)); }
// ⭐ marca lo último que se dijo (de cualquiera de los dos) como punto clave: sale aparte en el resumen y en el acta
function marcar(){
  for(var i = S.orden.length - 1; i >= 0; i--){
    var L = S.lineas[S.orden[i]];
    if(L && L.o && !L.prov){   // si ya estaba marcada, se desmarca
      L.marca = !L.marca; estado(T(L.marca ? 'marcado' : 'desmarcado', {t:L.o.length > 60 ? L.o.slice(0, 57) + '…' : L.o}));
      if(!$('registro').hidden) pintarRegistro(); return;
    }
  }
  estado(T('nada-marcar'));
}

/* ── el acta: una «foto» de la reunión (para verla, resumirla, descargarla o imprimirla también después de colgar) ── */
function foto(){
  return {
    codigo:S.codigo, inicio:S.inicio || (S.orden.length && S.lineas[S.orden[0]] ? S.lineas[S.orden[0]].t : Date.now()), fin:Date.now(),
    yo:{nombre:S.yo.nombre, idioma:S.yo.idioma}, gente:S.gente.slice(), notas:$('notas').value || '', resumen:S.resumen || '',
    lineas:S.orden.map(function(k){ return S.lineas[k]; }).filter(function(L){ return L && L.o && !L.prov; })
      .map(function(L){ return {t:L.t, nombre:L.nombre, idioma:L.idioma, o:L.o, tr:L.tr || '', a:L.a || '', marca:!!L.marca}; })
  };
}
function enMiIdioma(L, yo){ return (L.idioma === yo || !L.tr || L.a !== yo) ? L.o : L.tr; }
// frases con compromisos o fechas, por palabras (es, en, pt, fr): no entiende nada, solo avisa dónde mirar
var ACUERDO = /(?:^|[^\p{L}\p{N}])(hay que|tenemos que|tienes que|tiene que|tienen que|debemos|debes|vamos a|voy a|quedamos|acordamos|acuerdo|pendiente|ma[nñ]ana|pasado ma[nñ]ana|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|antes del?|hasta el|plazo|fecha|semana que viene|pr[oó]xima semana|we need to|we have to|you need to|you have to|need to|let'?s|we will|we'll|i will|i'll|agreed|deadline|tomorrow|monday|tuesday|wednesday|thursday|friday|next week|due|temos que|precisamos|amanh[aã]|prazo|at[eé] (o|a)|il faut|nous devons|on va|demain|avant le|d[eé]lai)(?![\p{L}\p{N}])|\b\d{1,2}[:h]\d{2}\b|\b\d{1,2}\/\d{1,2}\b/iu;
function acuerdos(f){ return f.lineas.filter(function(L){ return ACUERDO.test(enMiIdioma(L, f.yo.idioma)) || ACUERDO.test(L.o); }); }
function lineaActa(L, yo){ var x = '[' + hora(L.t) + '] ' + L.nombre + ': ' + L.o; if(L.tr && L.idioma !== yo && L.a === yo) x += '\n        → ' + L.tr; return x; }
function actaTexto(f){
  var min = Math.max(1, Math.round((f.fin - f.inicio) / 60000)), fecha = '';
  try{ fecha = new Date(f.inicio).toLocaleDateString('es-PE', {day:'2-digit', month:'2-digit', year:'numeric'}); }catch(e){}
  var gente = [f.yo].concat(f.gente).map(function(p){ return p.nombre + (IDIOMAS[p.idioma] ? ' (' + IDIOMAS[p.idioma].n + ')' : ''); }).join(', ');
  var marc = f.lineas.filter(function(L){ return L.marca; }), acu = acuerdos(f), raya = '──────────────────────────────', out = [];
  out.push(T('acta-titulo') + ' · ' + NOMBRE, raya);
  out.push(T('acta-fecha') + ': ' + fecha + ' · ' + hora(f.inicio) + '–' + hora(f.fin) + ' (' + min + ' ' + T('min') + ')');
  out.push(T('acta-part') + ': ' + gente);
  if(f.codigo) out.push(T('acta-sala') + ': ' + verCodigo(f.codigo));
  out.push('', '⭐ ' + T('res-marcados').replace(/^⭐\s*/, '').toUpperCase(), raya);
  out.push(marc.length ? marc.map(function(L){ return '- ' + lineaActa(L, f.yo.idioma); }).join('\n') : T('res-ninguno'));
  out.push('', T('res-acuerdos').toUpperCase(), raya);
  out.push(acu.length ? acu.map(function(L){ return '- ' + lineaActa(L, f.yo.idioma); }).join('\n') : T('res-ninguno'));
  if(f.resumen){ out.push('', T('acta-resumen'), raya, f.resumen); }
  if(f.notas.trim()){ out.push('', T('acta-notas'), raya, f.notas.trim()); }
  out.push('', T('acta-dicho'), raya);
  out.push(f.lineas.length ? f.lineas.map(function(L){ return lineaActa(L, f.yo.idioma); }).join('\n') : T('res-ninguno'));
  out.push('', raya, T('acta-aviso'));
  return out.join('\n');
}
function nombreActa(f){ var d = new Date(f.inicio), p = function(n){ return String(n).padStart(2, '0'); }; return 'acta-reunion-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + '.txt'; }
function descargarActa(f){
  var b = new Blob(['﻿' + actaTexto(f).replace(/\n/g, '\r\n')], {type:'text/plain;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombreActa(f);
  document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function imprimirActa(f){ $('impresion').textContent = actaTexto(f); window.print(); }

/* ── el resumen: el de Chrome (Summarizer, en la computadora, sin mandar nada a ningún servidor) si está; si no, lo marcado
   y las frases con compromisos o fechas. Se llama dentro del clic: la primera vez Chrome puede pedir bajar su modelo. ── */
function hayResumidor(){ return 'Summarizer' in self; }
function resumenChrome(texto, idioma){
  var op = {type:'key-points', format:'plain-text', length:'long',
    sharedContext:'Transcripción de una reunión por videollamada (de trabajo o familiar). Puntos clave, acuerdos, quién hace qué y fechas.'};
  if(['es', 'en', 'ja'].indexOf(idioma) > -1) op.outputLanguage = idioma;
  return Promise.resolve().then(function(){ return Summarizer.create(op); })
    .catch(function(){ delete op.outputLanguage; return Summarizer.create(op); })
    .then(function(s){
      var t = texto, q = s.inputQuota;
      if(q && isFinite(q) && t.length > q * 3) t = t.slice(-Math.floor(q * 3));   // reuniones largas: lo último (aprox. 3 letras por unidad)
      return Promise.resolve(s.summarize(t)).catch(function(){ return s.summarize(t.slice(-Math.floor(t.length / 2))); });
    });
}
function bloqueBase(f){
  var marc = f.lineas.filter(function(L){ return L.marca; }), acu = acuerdos(f);
  var li = function(arr){ return arr.length ? arr.map(function(L){ return '• ' + esc(L.nombre) + ': ' + esc(enMiIdioma(L, f.yo.idioma)); }).join('\n') : esc(T('res-ninguno')); };
  return '<div class="res-caja"><h3>' + esc(T('res-marcados')) + '</h3>' + li(marc) + '</div><div class="res-caja"><h3>' + esc(T('res-acuerdos')) + '</h3>' + li(acu) + '</div>';
}
function resumir(f, caja, alTerminar){
  if(!f.lineas.length && !f.notas.trim()){ caja.innerHTML = '<p class="res-gris">' + esc(T('res-nada')) + '</p>'; return; }
  var base = bloqueBase(f);
  if(!hayResumidor()){ caja.innerHTML = '<p class="res-gris">' + esc(T('res-sin-chrome')) + '</p>' + base; return; }
  caja.innerHTML = '<p class="res-gris">' + esc(T('res-preparando')) + '</p>' + base;
  var texto = f.lineas.map(function(L){ return L.nombre + ': ' + enMiIdioma(L, f.yo.idioma); }).join('\n') + (f.notas.trim() ? '\n\n' + T('acta-notas') + ':\n' + f.notas.trim() : '');
  resumenChrome(texto, f.yo.idioma).then(function(r){
    f.resumen = String(r || '').trim();
    caja.innerHTML = '<div class="res-caja"><h3>' + esc(T('res-chrome')) + '</h3>' + esc(f.resumen) + '</div>' + base;
    if(alTerminar) alTerminar(f.resumen);
  }, function(){ caja.innerHTML = '<p class="res-gris">' + esc(T('res-falla')) + '</p>' + base; });
}
function copiarTodo(){ copiar(actaTexto(foto()), T('copiada')); }
function copiar(txt, ok){
  var hecho = function(){ estado(ok); setTimeout(function(){ if($('estado').textContent === ok) estado(''); }, 2500); };
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(hecho, function(){ window.prompt('', txt); });
  else window.prompt('', txt);
}
function estado(t, cl){ var e = $('estado'); if(!e) return; e.textContent = t || ''; e.className = cl || ''; }

/* ── compartir la pantalla (solo en computadora): se cambia la pista de la cámara por la de la pantalla, sin renegociar ── */
function puedePantalla(){ return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) && !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent); }
function transVideo(){
  if(!S.pc || !S.pc.getTransceivers) return null;
  return S.pc.getTransceivers().filter(function(t){ return t.receiver && t.receiver.track && t.receiver.track.kind === 'video'; })[0] || null;
}
function compartirPantalla(){
  if(S.compartiendo){ dejarPantalla(); return; }
  var t = S.pc ? transVideo() : null, dir = t ? (t.currentDirection || t.direction || '') : '';
  if(S.otro && S.pc && (!t || dir.indexOf('send') < 0)){ estado(T('pantalla-sin-cam'), 'mal'); return; }
  navigator.mediaDevices.getDisplayMedia({video:true, audio:false}).then(function(st){
    var p = st.getVideoTracks()[0]; if(!p){ st.getTracks().forEach(function(x){ x.stop(); }); return; }
    var listo = function(){
      S.compartiendo = st; p.onended = dejarPantalla; pintarPantallaPropia();
      $('m-pantalla').classList.add('apagado'); if(S.otro) mandarSub({t:'pantalla', on:true}); estado(T('pantalla-on'));
    };
    // sin llamada todavía: se muestra aquí y, cuando alguien entre, se le manda la pantalla en vez de la cámara
    if(S.pc && t) return t.sender.replaceTrack(p).then(listo);
    listo();
  }).catch(function(){ estado(T('pantalla-no'), 'mal'); });
}
function dejarPantalla(){
  var st = S.compartiendo; if(!st) return; S.compartiendo = null;
  st.getTracks().forEach(function(x){ x.onended = null; x.stop(); });
  var cam = S.media && S.media.getVideoTracks()[0], t = transVideo();
  if(t) t.sender.replaceTrack(cam || null).catch(function(){});
  pintarPantallaPropia();
  $('m-pantalla').classList.remove('apagado');
  if(S.otro) mandarSub({t:'pantalla', on:false});
  if($('estado').textContent === T('pantalla-on')) estado('');
}
// dónde se ve mi pantalla: en grande si estoy solo; en el recuadro chico si hay otra persona (lo grande es ella)
function pintarPantallaPropia(){
  var st = S.compartiendo, yo = $('v-yo'), grande = $('v-otro'), cam = !!(S.media && S.media.getVideoTracks().length);
  if(st && S.otro){ yo.srcObject = st; yo.classList.add('pantalla'); yo.hidden = false; return; }
  yo.srcObject = S.media || null; yo.classList.remove('pantalla'); yo.hidden = !cam;
  if(!S.otro){
    grande.srcObject = st || null; grande.classList.toggle('pantalla', !!st); $('sin-video').hidden = !!st;
    if(st){ var q = grande.play && grande.play(); if(q && q.catch) q.catch(function(){}); }
  }
}
function pintarChipOtro(){
  if(!S.otro){ $('chip-otro').textContent = T('esperando-otro'); return; }
  $('chip-otro').textContent = S.otro.nombre + ' · ' + IDIOMAS[S.otro.idioma].n + (S.otroPantalla ? ' · ' + T('pantalla-otro') : '') + (S.otroGraba ? ' · ● ' + T('otro-graba') : '');
}

/* ════ 7c) «Traducir a», la letra de los subtítulos y la grabación ════ */
// «Traducir a»: con otra persona es su idioma (fijo); solo, el que elijas (como el modo práctica del prototipo)
function pintarTraducirA(){
  var sel = $('traducir-a'); if(!sel) return;
  var h = '<option value="">' + esc(T('sin-traducir-op')) + '</option>';
  Object.keys(IDIOMAS).forEach(function(k){ if(k !== S.yo.idioma) h += '<option value="' + k + '">' + esc(IDIOMAS[k].n) + '</option>'; });
  sel.innerHTML = h;
  if(S.otro){ sel.value = S.otro.idioma !== S.yo.idioma ? S.otro.idioma : ''; sel.disabled = true; }
  else {
    if(!hay(S.practica) || S.practica === S.yo.idioma) S.practica = S.yo.idioma === 'es' ? 'en' : 'es';
    sel.value = S.practica; sel.disabled = false;
  }
  pintarMotor();
}
var TAM = {n:{css:'', px:40}, g:{css:'letra-g', px:52}, xg:{css:'letra-xg', px:66}};
function aplicarLetra(){
  if(!TAM[S.letra]) S.letra = 'n';
  if(['oscuro', 'vidrio', 'sin'].indexOf(S.fondo) < 0) S.fondo = 'oscuro';
  var sala = $('sala');
  sala.classList.remove('letra-g', 'letra-xg', 'fondo-vidrio', 'fondo-sin');
  if(TAM[S.letra].css) sala.classList.add(TAM[S.letra].css);
  if(S.fondo !== 'oscuro') sala.classList.add('fondo-' + S.fondo);
  Array.prototype.forEach.call(document.querySelectorAll('[data-letra]'), function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-letra') === S.letra)); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-fondo]'), function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-fondo') === S.fondo)); });
}

/* La grabación: un lienzo de 1280×720 con tu pantalla (o tu cámara), tu cara en una burbuja y los subtítulos — el original
   chico y la traducción grande, con la letra elegida —, más tu micrófono (y, en llamada, la voz del otro, que ve el aviso
   «está grabando»). Se dibuja con un reloj en un Worker para que siga aunque expliques en otra ventana. Al detener: el video
   (MP4 si Chrome lo graba; si no, WebM) y los subtítulos en .srt, traducidos y originales. Nada se sube a ningún lado. */
var GR = {rec:null};
function esCel(){ return /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent); }
function puedeGrabar(){ return !!(window.MediaRecorder && window.HTMLCanvasElement && HTMLCanvasElement.prototype.captureStream && window.Worker) && !esCel(); }
function videoOculto(st){ var v = document.createElement('video'); v.muted = true; v.playsInline = true; v.srcObject = st || null; if(st){ var p = v.play(); if(p && p.catch) p.catch(function(){}); } return v; }
function grabar(){
  if(GR.rec){ pararGrabacion(); return; }
  if(!puedeGrabar()){ estado(T('grabar-no'), 'mal'); return; }
  var c = document.createElement('canvas'); c.width = 1280; c.height = 720;
  var pistas = c.captureStream(30).getVideoTracks(), ac = null;
  try{   // el audio: mi micrófono y, si hay llamada, la voz de la otra persona
    ac = new (window.AudioContext || window.webkitAudioContext)(); var dst = ac.createMediaStreamDestination(), n = 0;
    var mic = S.media && S.media.getAudioTracks()[0], vo = $('v-otro').srcObject, otra = S.otro && vo && vo.getAudioTracks ? vo.getAudioTracks()[0] : null;
    [mic, otra].forEach(function(t){ if(t){ ac.createMediaStreamSource(new MediaStream([t])).connect(dst); n++; } });
    if(n) pistas = pistas.concat(dst.stream.getAudioTracks());
  }catch(e){}
  var tipo = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    .filter(function(x){ try{ return MediaRecorder.isTypeSupported(x); }catch(e){ return false; } })[0] || '';
  var r;
  try{ r = new MediaRecorder(new MediaStream(pistas), tipo ? {mimeType:tipo, videoBitsPerSecond:3000000} : {}); }
  catch(e){ if(ac) try{ ac.close(); }catch(x){} estado(T('grabar-no'), 'mal'); return; }
  GR = {rec:r, partes:[], c:c, g:c.getContext('2d'), ac:ac, tipo:r.mimeType || tipo || 'video/webm', inicio:Date.now(),
        vCam:videoOculto(S.media), vPant:videoOculto(S.compartiendo), vOtro:videoOculto(S.otro ? $('v-otro').srcObject : null)};
  r.ondataavailable = function(e){ if(e.data && e.data.size) GR.partes.push(e.data); };
  r.onstop = terminarGrabacion;
  r.start(1000);
  var w = new Worker(URL.createObjectURL(new Blob(['setInterval(function(){ postMessage(0); }, 33);'], {type:'text/javascript'})));
  w.onmessage = dibujar; GR.w = w;
  GR.reloj = setInterval(pintarGrabando, 1000); pintarGrabando();
  $('m-grabar').classList.add('apagado'); $('m-grabar').querySelector('[data-t]').textContent = T('m-detener');
  $('grabado').hidden = true;
  if(S.otro){ mandarSub({t:'graba', on:true}); estado(T('grabar-aviso', {n:S.otro.nombre})); }
}
function pintarGrabando(){
  if(!GR.rec) return;
  var s = Math.floor((Date.now() - GR.inicio) / 1000), t = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  $('chip-graba').hidden = false; $('chip-graba').textContent = T('grabando', {t:t});
}
// lo que sale en el video: se ajusta sin deformar (contener) o llenando (cubrir)
function poner(g, v, x, y, w, h, cubrir){
  if(!v || !v.videoWidth) return false;
  var r = v.videoWidth / v.videoHeight, rr = w / h, dw = w, dh = h;
  if(cubrir ? r > rr : r < rr){ dw = h * r; } else { dh = w / r; }
  if(cubrir){ g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.drawImage(v, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); g.restore(); }
  else g.drawImage(v, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  return true;
}
function envolver(g, txt, max){
  var out = [], linea = '', cjk = /[　-鿿]/.test(txt), partes = cjk ? Array.from(txt) : txt.split(/\s+/);
  partes.forEach(function(p){ var prueba = linea ? linea + (cjk ? '' : ' ') + p : p; if(g.measureText(prueba).width > max && linea){ out.push(linea); linea = p; } else linea = prueba; });
  if(linea) out.push(linea);
  return out.slice(-3);   // como mucho tres renglones: lo último que se dijo
}
function dibujar(){
  var g = GR.g; if(!g) return;
  var W = 1280, H = 720;
  if(GR.vPant.srcObject !== (S.compartiendo || null)){ GR.vPant.srcObject = S.compartiendo || null; if(S.compartiendo) GR.vPant.play().catch(function(){}); }
  var vo = S.otro ? $('v-otro').srcObject : null;
  if(GR.vOtro.srcObject !== (vo || null)){ GR.vOtro.srcObject = vo || null; if(vo) GR.vOtro.play().catch(function(){}); }
  g.fillStyle = '#06141C'; g.fillRect(0, 0, W, H);
  var cam = S.cam && S.media && S.media.getVideoTracks().length;
  if(S.compartiendo){
    poner(g, GR.vPant, 0, 0, W, H, false);
    if(cam){ g.save(); g.beginPath(); g.arc(W - 130, 130, 105, 0, Math.PI * 2); g.clip(); g.translate(W, 0); g.scale(-1, 1); poner(g, GR.vCam, 25, 25, 210, 210, true); g.restore(); }
  } else if(S.otro && GR.vOtro.videoWidth){
    if(cam){ g.save(); g.translate(W / 2, 0); g.scale(-1, 1); poner(g, GR.vCam, 0, 0, W / 2, H, true); g.restore(); }
    poner(g, GR.vOtro, W / 2, 0, W / 2, H, true);
  } else if(cam){ g.save(); g.translate(W, 0); g.scale(-1, 1); poner(g, GR.vCam, 0, 0, W, H, true); g.restore(); }
  // los subtítulos: lo último dicho, por 9 s
  var sr = S.subRec, L = sr && sr.L;
  if(!L || !L.o || Date.now() - sr.cuando > 9000) return;
  var px = TAM[S.letra].px, chico = Math.round(px * 0.55), f = "'IBM Plex Sans', system-ui, sans-serif";
  g.font = '600 ' + px + 'px ' + f; var lt = L.tr ? envolver(g, L.tr, W - 160) : [];
  g.font = '400 ' + chico + 'px ' + f; var lo = envolver(g, (S.otro ? L.nombre + ': ' : '') + L.o, W - 160);
  if(!L.tr){ g.font = '600 ' + px + 'px ' + f; lt = envolver(g, L.o, W - 160); lo = []; }
  var alto = lo.length * chico * 1.3 + lt.length * px * 1.25 + 34, y0 = H - alto - 26;
  if(S.fondo !== 'sin'){ g.fillStyle = S.fondo === 'vidrio' ? 'rgba(255,255,255,.18)' : 'rgba(6,20,28,.82)'; g.beginPath(); (g.roundRect ? g.roundRect(50, y0, W - 100, alto, 18) : g.rect(50, y0, W - 100, alto)); g.fill(); }
  g.textAlign = 'center'; g.textBaseline = 'top'; g.shadowColor = S.fondo === 'sin' ? 'rgba(0,0,0,.9)' : 'transparent'; g.shadowBlur = S.fondo === 'sin' ? 8 : 0;
  var y = y0 + 16;
  g.font = '400 ' + chico + 'px ' + f; g.fillStyle = '#C9D7E0'; lo.forEach(function(t){ g.fillText(t, W / 2, y); y += chico * 1.3; });
  g.font = '600 ' + px + 'px ' + f; g.fillStyle = L.tr ? '#FFD34D' : '#FFFFFF'; lt.forEach(function(t){ g.fillText(t, W / 2, y); y += px * 1.25; });
  g.shadowBlur = 0; g.textAlign = 'start';
}
function pararGrabacion(){
  if(!GR.rec) return;
  var r = GR.rec; GR.fin = Date.now();
  try{ if(r.state !== 'inactive') r.stop(); else terminarGrabacion(); }catch(e){ terminarGrabacion(); }
  if(GR.w){ GR.w.terminate(); GR.w = null; }
  clearInterval(GR.reloj);
  $('chip-graba').hidden = true; $('m-grabar').classList.remove('apagado'); $('m-grabar').querySelector('[data-t]').textContent = T('m-grabar');
  if(S.otro) mandarSub({t:'graba', on:false});
}
function terminarGrabacion(){
  var g = GR; if(!g.rec || g.listo) return; g.listo = true;
  try{ if(g.ac) g.ac.close(); }catch(e){}
  [g.vCam, g.vPant, g.vOtro].forEach(function(v){ if(v) v.srcObject = null; });
  var blob = new Blob(g.partes, {type:(g.tipo || 'video/webm').split(';')[0]}), ext = /mp4/.test(g.tipo) ? 'mp4' : 'webm';
  var d = new Date(g.inicio), p2 = function(n){ return String(n).padStart(2, '0'); }, base = 'grabacion-' + d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + '-' + p2(d.getHours()) + p2(d.getMinutes());
  var lineas = S.orden.map(function(k){ return S.lineas[k]; }).filter(function(L){ return L && L.o && !L.prov && (L.tfin || L.t) >= g.inicio - 1000 && L.t <= (g.fin || Date.now()); });
  var s = Math.round(((g.fin || Date.now()) - g.inicio) / 1000);
  GR = {rec:null, ultimo:{blob:blob, nombre:base + '.' + ext, base:base, lineas:lineas, inicio:g.inicio, fin:g.fin || Date.now()}};
  $('grabado').hidden = false;
  $('grabado-t').textContent = T('grabado', {d:Math.floor(s / 60) + ':' + p2(s % 60) + ' · ' + ext.toUpperCase() + ' · ' + (blob.size / 1048576).toFixed(1).replace('.', ',') + ' MB'});
}
// los subtítulos en .srt (los que pide YouTube y cualquier editor): cada frase desde que empezó hasta poco después de cerrarse
function srt(lineas, inicio, traducidos){
  var hh = function(ms){ ms = Math.max(0, ms); var h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, x = ms % 1000; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ',' + String(x).padStart(3, '0'); };
  return lineas.map(function(L, i){
    var a = L.t - inicio, sig = lineas[i + 1] ? lineas[i + 1].t - inicio : Infinity;
    var b = Math.min(Math.max(a + 1500, (L.tfin || L.t) - inicio + 2000), sig - 50);
    var txt = (traducidos ? (L.tr || L.o) : L.o);
    return (i + 1) + '\n' + hh(a) + ' --> ' + hh(Math.max(a + 500, b)) + '\n' + txt + '\n';
  }).join('\n');
}
function bajarArchivo(blob, nombre){
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

/* ════ 8) Voz a texto (navegador) ════
   Escucha mientras estás en la sala, solo o acompañado (el audio sale a Google: la entrada lo dice).
   15/11/2026 · lo medido en Google Chrome cuando Marcelo vio «necesita internet» estando conectado:
   · Chrome deja UNA sola voz a texto a la vez en todo el navegador: si otra ventana o pestaña la arranca, a esta se la corta
     («aborted»). Antes, al cortarse, se volvía a arrancar sola y dos ventanas abiertas se peleaban: 194 arranques por minuto
     en cada una y ninguna oía. Ahora la ventana que la usa avisa a las demás de este navegador (BroadcastChannel) y la que
     la pierde NO la vuelve a pedir sola: dice que está en otra ventana y la retoma al volver a esa ventana o con «Usar aquí».
     Un «aborted» suelto sin ese aviso (en Chrome de Android pasa al perder el audio un momento) se vuelve a escuchar; si se
     repite 3 veces en 10 s (una ventana de incógnito, que no recibe el aviso), se deja también.
   · Un corte de red de un momento no es «sin internet»: se reintenta solo, cada vez más despacio (hasta 15 s) y sin rendirse;
     el aviso sale con 3 cortes seguidos y se quita apenas vuelve a oír. Sin conexión de verdad (navigator.onLine), lo dice y
     vuelve sola con el evento «online». Solo en navegadores que NO son Chrome ni Edge (Opera, Chromium, otros), si nunca
     llega al servicio (4 cortes seguidos sin alcanzar a oír), dice que ese navegador no llega y para hasta «Reintentar».
   · Revisión aparte del 15/11 (17 hallazgos confirmados): los avisos de la voz van en su propia línea (#aviso-voz), así
     ningún otro mensaje los borra ni se lleva sus botones; y el estado «sin red» tiene su propia bandera. */
var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if(SR && navigator.brave) SR = null;   // Brave trae el objeto pero no el servicio: siempre da «network»
// ¿el navegador trae su propio servicio de voz? Chrome y Edge sí (y Safari, que no tiene userAgentData); Opera, Chromium y
// otros armados sobre Chromium traen el objeto pero no siempre el servicio
var VOZ_PROPIA = (function(){ try{ var d = navigator.userAgentData; if(!d || !d.brands || !d.brands.length) return true; return d.brands.some(function(b){ return /Google Chrome|Microsoft Edge/i.test(b.brand); }); }catch(e){ return true; } })();
var VOZ = {canal:null, cedida:false, red:0, sinAudio:0, huboAudio:false, cortada:false, sinServicio:false, sinRed:false,
           aviso:'', tReinicio:null, miaAjena:0, abortos:[]};
try{
  VOZ.canal = new BroadcastChannel('llamada-voz');
  VOZ.canal.onmessage = function(e){
    var m = e.data || {}; if(m.t !== 'mia' || m.id === S.yo.id) return;
    VOZ.miaAjena = Date.now();
    if(S.rec && S.recQuiere) cederVoz();
  };
}catch(e){}
function vozPosible(){ return !!(SR && IDIOMAS[S.yo.idioma] && IDIOMAS[S.yo.idioma].voz && S.mic && S.pantalla === 'sala' && !VOZ.sinServicio); }
function anunciarVoz(){ try{ if(VOZ.canal) VOZ.canal.postMessage({t:'mia', id:S.yo.id}); }catch(e){} }
// un aviso de la voz, en su propia línea (con un botón si hace falta); se quita solo cuando la voz vuelve
function avisoVoz(k, boton){
  var e = $('aviso-voz'); if(!e) return;
  VOZ.aviso = k; e.hidden = false; e.textContent = T(k);
  if(!boton) return;
  var b = document.createElement('button'); b.type = 'button'; b.className = 'enlace'; b.id = 'b-voz-aviso'; b.textContent = T(boton);
  b.onclick = function(){ recEmpezar(true); };
  e.appendChild(document.createTextNode(' ')); e.appendChild(b);
}
function quitarAvisoVoz(k){
  if(!VOZ.aviso || (k && (' ' + k + ' ').indexOf(' ' + VOZ.aviso + ' ') < 0)) return;
  VOZ.aviso = ''; var e = $('aviso-voz'); if(e){ e.hidden = true; e.textContent = ''; }
}
// otra ventana (o programa) tomó la voz: esta se la deja, sin pelear
function cederVoz(){
  clearTimeout(VOZ.tReinicio); VOZ.finAjeno = false;
  var r = S.rec; S.rec = null; S.recQuiere = false; VOZ.cedida = true;
  try{ if(r) r.abort(); }catch(e){}
  avisoVoz('voz-otra-ventana', 'voz-aqui');
}
// forzar = la persona lo pidió (foco, «Usar aquí», «Reintentar», prender el micrófono): se intenta aunque estuviera dejada
function recEmpezar(forzar){
  if(forzar) VOZ.sinServicio = false;
  if(!vozPosible()) return;
  if(VOZ.cedida && !forzar) return;   // la tiene otra ventana: solo se retoma a pedido
  if(VOZ.finAjeno && !forzar) return;  // le acaban de cortar la voz: decide el reinicio programado (o el aviso de la otra ventana)
  VOZ.finAjeno = false;
  if(!forzar && navigator.onLine === false && VOZ.sinRed) return;   // sin red: vuelve con «online»
  VOZ.cedida = false; VOZ.sinRed = false;
  if(S.rec && S.rec.lang !== IDIOMAS[S.yo.idioma].voz){ var viejo = S.rec; S.rec = null; try{ viejo.abort(); }catch(e){} }
  if(!S.rec){
    var r = new SR();
    r.lang = IDIOMAS[S.yo.idioma].voz; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onstart = function(){ if(S.rec === r) VOZ.huboAudio = false; };
    r.onaudiostart = function(){ if(S.rec !== r) return; VOZ.huboAudio = true; VOZ.sinAudio = 0; };
    r.onresult = function(e){
      if(S.rec !== r) return;
      var parcial = '';
      for(var i = e.resultIndex; i < e.results.length; i++){
        var res = e.results[i], txt = res[0].transcript;
        if(esEco(txt)) continue;                                  // es la voz de la traducción saliendo por el parlante
        if(S.ttsActivo && palabras(txt).length >= 2) interrumpir();  // la persona habla encima: se calla la voz
        if(res.isFinal) alFinal(txt); else parcial += txt;
      }
      S.recFallas = 0; VOZ.red = 0; VOZ.abortos = []; quitarAvisoVoz();   // oye: todo aviso de la voz sobra
      if(parcial.trim()) alParcial(parcial.trim());
    };
    r.onerror = function(e){
      if(S.rec !== r) return;
      var x = e.error;
      if(x === 'no-speech'){ VOZ.red = 0; quitarAvisoVoz('voz-red-lenta voz-sin-internet'); return; }   // el servicio respondió: hay red
      if(x === 'aborted'){ VOZ.cortada = true; return; }            // nadie de esta página la cortó
      if(x === 'network'){ VOZ.red++; if(!VOZ.huboAudio) VOZ.sinAudio++; return; }
      S.recFallas++;
      if(x === 'not-allowed'){ S.recQuiere = false; avisoVoz('mic-permiso'); }
      else if(x === 'service-not-allowed'){ S.recQuiere = false; VOZ.sinServicio = true; avisoVoz('voz-sin-servicio', 'reintentar'); }
      else if(x === 'language-not-supported'){ S.recQuiere = false; avisoVoz('voz-idioma'); }
      else if(x === 'audio-capture' && S.recFallas >= 3) avisoVoz('voz-mic-ocupado');
    };
    r.onend = function(){
      if(S.rec !== r) return;
      clearTimeout(VOZ.tReinicio);   // un solo reinicio pendiente a la vez (uno viejo se disparaba después de quedarse sin red)
      if(VOZ.cortada){
        VOZ.cortada = false;
        var ahora = Date.now();
        VOZ.abortos = VOZ.abortos.filter(function(t){ return ahora - t < 10000; }); VOZ.abortos.push(ahora);
        // la tomó otra ventana (avisó) o se la quitan una y otra vez: se deja, sin pelear
        if(S.recQuiere && (ahora - VOZ.miaAjena < 4000 || VOZ.abortos.length >= 3)){ cederVoz(); return; }
        // corte ajeno todavía sin dueño claro: solo vale el reinicio de aquí abajo, que el aviso de otra ventana cancela;
        // un arranque «de paso» (la cámara que termina de cargar, volver a la pestaña) le quitaría la voz a la otra ventana
        VOZ.finAjeno = true;
      }
      if(!S.recQuiere || !vozPosible()) return;
      if(VOZ.red){
        if(navigator.onLine === false){ VOZ.sinRed = true; avisoVoz('voz-sin-internet'); return; }   // vuelve con «online»
        if(!VOZ_PROPIA && VOZ.sinAudio >= 4){ S.recQuiere = false; VOZ.sinServicio = true; avisoVoz('voz-sin-servicio', 'reintentar'); return; }
        if(VOZ.red >= 3) avisoVoz('voz-red-lenta', 'reintentar');
      }
      if(S.recFallas >= 8){ S.recQuiere = false; return; }
      // fin normal de una sesión (Chrome la cierra sola cada tanto): se sigue enseguida; con cortes, cada vez más despacio
      var n = Math.max(S.recFallas, VOZ.red), espera = n ? Math.min(15000, 250 * Math.pow(2, n)) : (VOZ.abortos.length ? 500 : 150);
      VOZ.tReinicio = setTimeout(function(){ if(S.rec === r && S.recQuiere && !VOZ.cedida){ VOZ.finAjeno = false; try{ r.start(); anunciarVoz(); }catch(e){} } }, espera);
    };
    S.rec = r;
  }
  S.recQuiere = true; S.recFallas = 0; VOZ.red = 0; VOZ.sinAudio = 0; VOZ.cortada = false;
  clearTimeout(VOZ.tReinicio);
  // «la voz es mía» SOLO si de verdad arrancó una sesión nueva: si ya estaba escuchando, Chrome rechaza el arranque, y
  // avisar igual (pasaba cuando la cámara terminaba de cargar tarde) hacía que la ventana nueva soltara la voz y nadie oyera
  var arranco = false;
  try{ S.rec.start(); arranco = true; }catch(e){}
  if(arranco) anunciarVoz();
  quitarAvisoVoz(forzar ? 'voz-otra-ventana voz-sin-servicio voz-sin-internet voz-red-lenta mic-permiso voz-mic-ocupado' : 'voz-otra-ventana');
}
function recParar(){ clearTimeout(VOZ.tReinicio); S.recQuiere = false; var r = S.rec; S.rec = null; try{ if(r) r.abort(); }catch(e){} }
function vozReiniciar(){ VOZ.finAjeno = false; VOZ.cedida = false; VOZ.sinServicio = false; VOZ.sinRed = false; VOZ.red = 0; VOZ.sinAudio = 0; VOZ.cortada = false; VOZ.abortos = []; quitarAvisoVoz(); }
document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible' && S.mic && S.pantalla === 'sala') recEmpezar(); });
// volver a esta ventana es querer hablar aquí: retoma la voz si la tenía otra ventana
window.addEventListener('focus', function(){ if(VOZ.cedida && S.pantalla === 'sala' && S.mic) recEmpezar(true); });
window.addEventListener('online', function(){ if(VOZ.sinRed){ VOZ.sinRed = false; quitarAvisoVoz('voz-sin-internet'); if(S.pantalla === 'sala') recEmpezar(); } });

/* ── las notas al costado (Marcelo, 15/11: «que se pueda apuntar sin abrir otra pantalla y sin perder la imagen de la
   videollamada»). Se guardan solas en este equipo mientras dura la llamada, con una llave POR VENTANA (dos ventanas no se
   mezclan ni se borran entre sí); si la página se recarga, vuelven; si una ventana se cerró de golpe, sus notas pasan a
   «Tu última reunión» la próxima vez que se abra la página. Al colgar (o al cancelar) pasan a «Tu última reunión». ── */
var NOTAS_ID = (function(){ try{ var x = sessionStorage.getItem('llamada.ventana'); if(!x){ x = azar(8); sessionStorage.setItem('llamada.ventana', x); } return x; }catch(e){ return azar(8); } })();
var NOTAS_LLAVE = 'llamada.notas.' + NOTAS_ID, NOTAS_VIVA = 20000, NOTAS_VIGENCIA = 12 * 3600e3;
function verNotas(si){
  var l = $('lado'), abrir = si === undefined ? l.hidden : !!si;
  l.hidden = !abrir;
  $('m-notas').setAttribute('aria-pressed', String(abrir)); $('m-notas').classList.toggle('activo', abrir);
  if(abrir && !esCel()){ try{ $('notas').focus(); }catch(e){} }   // en el celular no: el teclado taparía el video
}
function guardarNotas(callado){
  var ok = false;
  try{ localStorage.setItem(NOTAS_LLAVE, JSON.stringify({t:$('notas').value, cuando:Date.now()})); ok = true; }catch(e){}
  if(callado) return ok;
  var g = $('notas-guardado'); g.textContent = T(ok ? 'notas-guardadas' : 'notas-no-guardadas');
  clearTimeout(S.tNotas); if(ok) S.tNotas = setTimeout(function(){ g.textContent = ''; }, 1500);
  return ok;
}
// al recargar la página en medio de la llamada: vuelven las notas de ESTA ventana
function recuperarNotas(){
  if($('notas').value) return;
  try{
    var g = JSON.parse(localStorage.getItem(NOTAS_LLAVE) || 'null');
    if(g && typeof g.t === 'string' && g.t.trim() && Date.now() - (g.cuando || 0) < NOTAS_VIGENCIA){
      $('notas').value = g.t; $('notas-aviso').textContent = T('notas-recuperadas'); $('notas-aviso').hidden = false; verNotas(true);
    }
  }catch(e){}
}
// las notas de ventanas que se cerraron de golpe (sin latido hace más de 20 s): pasan a «Tu última reunión», sin perder ninguna
function notasHuerfanas(){
  try{
    var llaves = [], halladas = [];
    for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(k && (k === 'llamada.notas' || k.indexOf('llamada.notas.') === 0) && k !== NOTAS_LLAVE) llaves.push(k); }
    llaves.forEach(function(k){
      var g = null; try{ g = JSON.parse(localStorage.getItem(k) || 'null'); }catch(e){}
      var edad = Date.now() - ((g && g.cuando) || 0);
      if(edad < NOTAS_VIVA) return;                                        // esa ventana sigue abierta: no se toca
      if(g && typeof g.t === 'string' && g.t.trim() && edad < NOTAS_VIGENCIA) halladas.push(g);
      localStorage.removeItem(k);
    });
    if(!halladas.length) return;
    halladas.sort(function(x, y){ return x.cuando - y.cuando; });
    var nueva = halladas[halladas.length - 1];
    if(!S.ultima || (S.ultima.fin || 0) < nueva.cuando){
      S.ultima = {codigo:null, inicio:nueva.cuando, fin:nueva.cuando, yo:{nombre:S.yo.nombre || '', idioma:S.yo.idioma}, gente:[], notas:nueva.t, resumen:'', lineas:[]};
      halladas.pop();
    }
    halladas.forEach(function(g){   // las demás (o todas, si «Tu última reunión» es más nueva) se le agregan con su fecha
      var f = ''; try{ f = new Date(g.cuando).toLocaleString('es-PE', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}); }catch(e){}
      S.ultima.notas = (S.ultima.notas ? S.ultima.notas + '\n\n' : '') + '[' + T('notas-otra-ventana', {f:f}) + ']\n' + g.t;
    });
    guardar('ultima', JSON.stringify(S.ultima));
  }catch(e){}
}
function borrarNotasGuardadas(){ try{ localStorage.removeItem(NOTAS_LLAVE); }catch(e){} }
// «⏱ Hora» y «+ Lo último dicho»: se agregan donde está el cursor, sin borrar lo seleccionado y (en computadora) se pueden deshacer
function ponerEnNotas(txt){
  var n = $('notas'), fin = typeof n.selectionEnd === 'number' ? n.selectionEnd : n.value.length;
  var antes = n.value.slice(0, fin), despues = n.value.slice(fin);
  var pre = antes && !/\n$/.test(antes) ? '\n' : '', post = despues && !/^\n/.test(despues) ? '\n' : '';
  var hecho = false;
  if(!esCel()){ try{ n.focus(); n.setSelectionRange(fin, fin); hecho = document.execCommand('insertText', false, pre + txt + post); }catch(e){} }
  if(!hecho || n.value.slice(0, fin) !== antes) n.value = antes + pre + txt + post + despues;
  var pos = (antes + pre + txt).length; try{ if(!esCel()) n.setSelectionRange(pos, pos); }catch(e){}
  guardarNotas();
}
function ultimoDicho(){ for(var i = S.orden.length - 1; i >= 0; i--){ var L = S.lineas[S.orden[i]]; if(L && L.o && !L.prov) return L; } return null; }
// al terminar (colgar o cancelar): lo dicho y las notas pasan a «Tu última reunión»; el respaldo suelto se borra solo si se guardó
function archivarReunion(f){
  var algo = f.lineas.length || f.notas.trim();
  if(algo){ S.ultima = f; if(guardar('ultima', JSON.stringify(f))) borrarNotasGuardadas(); }
  else borrarNotasGuardadas();
  pintarUltima();
}

/* ════ 9) La voz de la traducción y el anti-eco (del prototipo) ════ */
function hablar(txt, idioma){
  if(!S.voz || !txt || !IDIOMAS[idioma] || !IDIOMAS[idioma].tts || !window.speechSynthesis) return;
  var u = new SpeechSynthesisUtterance(txt);
  var pref = IDIOMAS[idioma].tts;
  var voces = speechSynthesis.getVoices().filter(function(v){ return v.lang.toLowerCase().indexOf(pref) === 0; });
  u.voice = voces.filter(function(v){ return /natural|online|google/i.test(v.name); })[0] || voces[0] || null;
  u.lang = (u.voice && u.voice.lang) || IDIOMAS[idioma].voz; u.rate = 1.05;
  // el micrófono sigue abierto: lo que coincida con esta voz se descarta como eco. Por si la voz nunca avisa que terminó
  // (pasa en Chrome con frases largas y en Android), cada frase tiene un tope: su largo × 80 ms + 3 s.
  var x = {toks:palabras(txt), fin:0}, tope = txt.length * 80 + 3000, hecho = false;
  S.ttsRecent.push(x);
  u.onstart = function(){ S.ttsActivo = true; bajar(true); };
  var listo = function(){
    if(hecho) return; hecho = true;
    if(!x.fin) x.fin = performance.now();
    setTimeout(function(){ if(!speechSynthesis.speaking){ S.ttsActivo = false; bajar(false); } }, 450);
  };
  u.onend = listo; u.onerror = listo;
  setTimeout(function(){ if(!hecho){ listo(); S.ttsActivo = false; bajar(false); } }, tope);
  speechSynthesis.speak(u);
}
// iPhone: la voz necesita un primer toque; se «calienta» con una frase vacía dentro del clic de Crear o Unirme
function calentarVoz(){ try{ if(window.speechSynthesis){ var u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } }catch(e){} }
function esEco(txt){
  var ahora = performance.now();
  S.ttsRecent = S.ttsRecent.filter(function(x){ return !x.fin || ahora - x.fin < 1500; });   // mientras suena y 1,5 s después
  if(!S.ttsRecent.length) return false;
  var inp = palabras(txt); if(!inp.length) return true;
  var junto = inp.join(' ');
  var esZh = function(w){ return /[一-鿿]/.test(w); }, clave = function(arr){ return arr.filter(function(w){ return esZh(w) || w.length >= 3; }); };
  for(var i = 0; i < S.ttsRecent.length; i++){
    var x = S.ttsRecent[i];
    if(x.toks.join(' ').indexOf(junto) > -1) return true;
    var set = {}; clave(x.toks).forEach(function(w){ set[w] = 1; });
    var ci = clave(inp); if(ci.length < 2) continue;
    var hit = 0; ci.forEach(function(w){ if(set[w]) hit++; });
    if(hit / ci.length >= 0.42) return true;
  }
  return false;
}
function interrumpir(){ try{ speechSynthesis.cancel(); }catch(e){} S.ttsActivo = false; S.ttsRecent = S.ttsRecent.map(function(x){ return {toks:x.toks, fin:x.fin || performance.now()}; }); bajar(false); }
function bajar(si){ var v = $('v-otro'); if(v) v.volume = si ? Math.min(S.volOtro, 0.15) : S.volOtro; }

/* ════ 10) Pantallas y botones ════ */
function mostrar(p){
  S.pantalla = p;
  $('entrada').hidden = p !== 'entrada'; $('tocando').hidden = p !== 'tocando'; $('sala').hidden = p !== 'sala';
  document.body.classList.toggle('en-sala', p === 'sala');
  pintarMotor();
}
function aplicarTextos(){
  document.documentElement.lang = uiLang();
  Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function(el){ el.textContent = T(el.getAttribute('data-t')); });
  $('escribir-t').placeholder = T('escribir'); $('notas').placeholder = T('notas-ph');
  document.title = (MARCA.titulo || T('titulo')) + ' · ' + NOMBRE;
  var pc = hayTraductor(), m = $('aviso-motor');
  m.className = 'aviso ' + (pc ? 'ok' : 'ojo'); m.textContent = T(pc ? 'motor-pc' : 'motor-cel');
  if(!SR) m.textContent += ' ' + T('sin-rec');
  if(!$('invitado').hidden) $('invitado').textContent = T('invitado');
  pintarMotor(); pintarPedidos(); pintarVoz(); pintarChipOtro();
}
function msgEntrada(t, cl){ var e = $('msg-entrada'); e.hidden = !t; e.textContent = t || ''; e.className = 'aviso ' + (cl || 'mal'); }
function msgTocando(t, cl){ var e = $('msg-tocando'); e.hidden = !t; e.textContent = t || ''; e.className = 'aviso ' + (cl || 'mal'); }
function leerDatos(){
  S.yo.nombre = $('nombre').value.trim().slice(0, 40); S.yo.idioma = hay($('idioma').value) ? $('idioma').value : 'es';
  guardar('nombre', S.yo.nombre); guardar('idioma', S.yo.idioma);
  if(!S.yo.nombre){ msgEntrada(T('falta-nombre')); $('nombre').focus(); return false; }
  return true;
}
function enlace(){ return location.origin + location.pathname.replace(/[^\/]*$/, '') + 'llamada.html#sala=' + S.codigo + '&habla=' + S.yo.idioma; }

/* Tu cara sale al instante: la pantalla cambia en el mismo clic y la cámara y la sala se conectan por detrás (antes se
   esperaba a la sala para mostrar algo, y con una sala lenta parecía que no pasaba nada). */
function ponerMedios(st){
  S.media = st;
  var v = $('v-yo');
  if(!S.compartiendo){ v.srcObject = st || null; v.hidden = !(st && st.getVideoTracks().length); }
  $('v-previa').srcObject = st || null; $('v-previa').hidden = !(st && st.getVideoTracks().length);
  S.mic = !!(st && st.getAudioTracks().length); S.cam = !!(st && st.getVideoTracks().length);
  pintarMandos();
  if(!st && S.pantalla === 'sala') estado(T('sin-camara'), 'mal');
  if(S.pantalla === 'sala') recEmpezar();
}
function medios(codigo){
  S.mediosP = pedirMedios().then(function(st){
    if(S.codigo !== codigo){ soltarMedios(st); return null; }   // colgó o canceló mientras Chrome pedía la cámara
    ponerMedios(st); return st;
  });
}
function crearSala(){
  msgEntrada('');
  if(!leerDatos()) return;
  calentarVoz();
  var cod = azar(10);
  S.anfitrion = true; S.codigo = cod; S.otro = null; S.pedidos = {};
  if(!hay(S.practica) || S.practica === S.yo.idioma) S.practica = S.yo.idioma === 'es' ? 'en' : 'es';
  if(destino()) trStart(S.yo.idioma, destino());   // dentro del clic: el traductor de «Traducir a» se prepara ya
  medios(cod);
  entrarSala(); estado(T('conectando'));
  rtAbrir(cod, function(ok, por){
    if(S.codigo !== cod) return;
    if(!ok){ limpiarLlamada(); mostrar('entrada'); msgEntrada(T(por === 'socket' || por === 'tiempo' ? 'sin-conexion' : 'canal-no')); return; }
    if($('estado').textContent === T('conectando')) estado('');
  });
}
function unirse(codigo){
  msgEntrada('');
  if(!leerDatos()) return;
  if(!codigoValido(codigo)){ msgEntrada(T('codigo-mal')); return; }
  calentarVoz();
  S.anfitrion = false; S.codigo = codigo; S.otro = null;
  // el enlace trae el idioma de quien invita: el traductor se prepara en este mismo clic
  var habla = HASH.habla; if(hay(habla) && habla !== S.yo.idioma){ trStart(S.yo.idioma, habla); trStart(habla, S.yo.idioma); }
  medios(codigo);
  mostrar('tocando'); msgTocando(T('conectando'), 'ok');
  rtAbrir(codigo, function(ok, por){
    if(S.codigo !== codigo) return;
    if(!ok){ limpiarLlamada(); mostrar('entrada'); msgEntrada(T(por === 'socket' || por === 'tiempo' ? 'sin-conexion' : 'canal-no')); return; }
    msgTocando(''); tocar();
  });
}
function tocar(){
  pararTocar(); S.tocarDesde = Date.now();
  var uno = function(){
    mandar({t:'pido', nombre:S.yo.nombre, idioma:S.yo.idioma});
    if(Date.now() - S.tocarDesde > 15000 && $('msg-tocando').hidden) msgTocando(T('nadie'), 'ojo');
    if(Date.now() - S.tocarDesde > 180000) pararTocar();
  };
  uno(); S.tocar = setInterval(uno, 3000);
}
function pararTocar(){ clearInterval(S.tocar); S.tocar = null; }
function soltarMedios(st){ var m = st || S.media; if(m) m.getTracks().forEach(function(t){ t.stop(); }); if(!st) S.media = null; }
// cada 5 s: «sigo aquí» al otro; si del otro no llega nada en 35 s, se da por ido (el «chau» no siempre sale: pestaña que se
// cae, batería, sin señal). Los pedidos para entrar que no se repiten en 10 s se borran. Y el reloj de la reunión.
function vida(){
  clearInterval(S.vida);
  S.vida = setInterval(function(){
    if(S.otro){ mandarSub({t:'sigo'}); if(Date.now() - S.ultimo > 35000) seFue(true); }
    var borrar = Object.keys(S.pedidos).filter(function(id){ return Date.now() - S.pedidos[id].cuando > 10000; });
    if(borrar.length){ borrar.forEach(function(id){ delete S.pedidos[id]; }); pintarPedidos(); }
    pintarReloj();
    if($('notas').value) guardarNotas(true);
  }, 5000);
}
function pintarReloj(){
  if(!S.codigo) return;
  var t = T('sala-chip', {c:verCodigo(S.codigo)});
  if(S.inicio) t += ' · ' + Math.floor((Date.now() - S.inicio) / 60000) + ' ' + T('min');
  $('chip-sala').textContent = t;
}

function entrarSala(){
  mostrar('sala');
  pintarReloj(); pintarMandos(); pintarVoz();
  var avisos = [];
  if(!hayTraductor()) avisos.push(T('motor-cel-corto'));
  if(!SR) avisos.push(T('sin-rec'));
  $('aviso-sala').hidden = !avisos.length; $('aviso-sala-t').textContent = avisos.join(' ');
  vida(); aplicarLetra(); pintarTraducirA(); recuperarNotas();
  if(S.anfitrion && !S.otro){ $('panel-sala').hidden = false; $('codigo-sala').textContent = verCodigo(S.codigo); pintarChipOtro(); pintarPedidos(); recEmpezar(); }
  else conOtro();
}
function conOtro(){
  $('panel-sala').hidden = true;
  S.ultimo = Date.now(); if(!S.inicio) S.inicio = Date.now();
  if(!S.gente.some(function(p){ return p.nombre === S.otro.nombre && p.idioma === S.otro.idioma; })) S.gente.push({nombre:S.otro.nombre, idioma:S.otro.idioma});
  pintarChipOtro(); pintarReloj();
  var hola = T('entro', {n:S.otro.nombre}); estado(hola);
  setTimeout(function(){ if($('estado').textContent === hola) estado(''); }, 4000);
  pintarTraducirA(); pintarPantallaPropia(); prepararAmbos();
  recEmpezar();
}
function pintarPedidos(){
  var box = $('pedidos'); if(!box) return;
  var ids = Object.keys(S.pedidos);
  box.innerHTML = ids.map(function(id){
    var p = S.pedidos[id];
    return '<div class="pide" data-id="' + esc(id) + '"><b>' + esc(T('pide', {n:p.nombre, i:IDIOMAS[p.idioma].n})) + '</b><span class="acciones"><button class="bt casco" type="button" data-si="' + esc(id) + '">' + esc(T('dejar')) + '</button><button class="bt claro" type="button" data-no="' + esc(id) + '">' + esc(T('no')) + '</button></span></div>';
  }).join('');
  $('esperando').hidden = !!ids.length;
}
function dejarEntrar(id){
  var p = S.pedidos[id]; if(!p || S.otro) return;
  S.otro = {id:p.id, nombre:p.nombre, idioma:p.idioma};
  Object.keys(S.pedidos).forEach(function(x){ if(x !== id) mandar({t:'no', para:x, por:'llena'}); });
  S.pedidos = {}; pintarPedidos();
  mandar({t:'pasa', para:id, nombre:S.yo.nombre, idioma:S.yo.idioma});
  conOtro();          // aquí, dentro del clic, se preparan los dos traductores
  var quien = S.otro.id;
  (S.mediosP || Promise.resolve()).then(function(){ if(S.otro && S.otro.id === quien) ofrecer(); });   // con la cámara ya lista
}
function limpiarDicho(){
  soltarParcial(); BO.pend = null; BI.pend = null; S.curId = null;
  S.lineas = {}; S.orden = []; S.finalizadas = {};
  $('mio').innerHTML = ''; $('sub-orig').hidden = true; $('sub-tr').hidden = true;
  if(!$('registro').hidden) pintarRegistro();
}
function seFue(porTiempo){
  var n = S.otro ? S.otro.nombre : '';
  cerrarPC(); interrumpir(); S.otro = null; S.otroPuede = null; S.otroPantalla = false; S.otroGraba = false; soltarParcial(); BO.pend = null; BI.pend = null;
  $('v-otro').classList.remove('pantalla'); pintarChipOtro(); pintarTraducirA();
  // quien creó la sala sigue con su pantalla, su grabación y su voz a texto; quien había entrado vuelve a pedir permiso
  if(S.anfitrion) pintarPantallaPropia(); else { pararGrabacion(); dejarPantalla(); recParar(); }
  var aviso = T(porTiempo ? 'se-corto' : 'salio', {n:n});
  if(S.anfitrion){ estado(aviso); $('panel-sala').hidden = false; pintarPedidos(); }
  else { mostrar('tocando'); msgTocando(aviso + ' ' + T('volver-pedir'), 'ojo'); tocar(); }
  pintarMotor();
}
// todo apagado: cámara, micrófono, voz a texto, pantalla compartida, conexión y lo dicho en pantalla
function limpiarLlamada(){
  clearInterval(S.vida); pararGrabacion(); rtCerrar(); pararTocar(); recParar(); vozReiniciar(); interrumpir(); dejarPantalla(); cerrarPC(); soltarMedios();
  S.saliendo = false;
  S.otro = null; S.anfitrion = false; S.codigo = null; S.pedidos = {}; S.otroPuede = null; S.otroPantalla = false; S.otroGraba = false; S.mediosP = null; S.subRec = null;
  limpiarDicho(); S.gente = []; S.inicio = null; S.resumen = ''; $('notas').value = ''; $('res-salida').innerHTML = '';
  $('v-yo').srcObject = null; $('v-previa').srcObject = null; $('v-otro').classList.remove('pantalla');
  $('registro').hidden = true; $('panel-sala').hidden = true; verNotas(false); $('notas-aviso').hidden = true;
}
function colgar(){
  S.saliendo = true;   // en los 150 ms que espera el «chau», un «pido» del otro lo volvía a dejar entrar a una sala vacía
  if(S.otro){ mandarSub({t:'chau'}); mandar({t:'chau'}); }
  var f = foto();
  setTimeout(function(){   // que alcance a salir el «chau»
    limpiarLlamada();
    try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){}
    HASH = {}; $('invitado').hidden = true; $('codigo').value = '';
    archivarReunion(f);   // lo dicho y las notas pasan a «Tu última reunión»
    mostrar('entrada'); msgEntrada(T('colgado'), 'ok');
  }, 150);
}
// la última reunión se queda en ESTE equipo (para el resumen o el acta después de colgar) hasta que se borre
function pintarUltima(){
  var f = S.ultima, c = $('ultima'); c.hidden = !f; if(!f) return;
  var min = Math.max(1, Math.round((f.fin - f.inicio) / 60000)), fecha = '';
  try{ fecha = new Date(f.inicio).toLocaleString('es-PE', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}); }catch(e){}
  $('ultima-dato').textContent = T('ultima-dato', {f:fecha, d:min, p:f.gente.map(function(p){ return p.nombre; }).join(', ') || '—'});
  $('ultima-res').innerHTML = f.resumen ? '<div class="res-caja" style="background:var(--fondo)"><h3 style="color:var(--tinta)">' + esc(T('res-chrome')) + '</h3>' + esc(f.resumen) + '</div>' : '';
}
function pintarMandos(){
  $('m-mic').classList.toggle('apagado', !S.mic); $('m-cam').classList.toggle('apagado', !S.cam);
  $('m-mic').setAttribute('aria-pressed', String(S.mic)); $('m-cam').setAttribute('aria-pressed', String(S.cam));
  $('m-pantalla').hidden = !puedePantalla();
  $('m-grabar').hidden = !puedeGrabar();
}

/* ── arranque ── */
var HASH = {};
function leerHash(){
  HASH = {};
  String(location.hash || '').replace(/^#/, '').split('&').forEach(function(p){
    var i = p.indexOf('='); if(i <= 0) return;
    try{ HASH[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1)); }catch(e){}   // un enlace mal copiado no tumba la página
  });
}
function idiomaInicial(){
  var x = leer('idioma'); if(hay(x)) return x;
  try{ x = localStorage.getItem('sstc_idioma'); if(hay(x)) return x; }catch(e){}   // abierta desde la app (mismo origen)
  x = String(navigator.language || 'es').slice(0, 2).toLowerCase(); return hay(x) ? x : 'es';
}
function iniciar(){
  var sel = $('idioma');
  Object.keys(IDIOMAS).forEach(function(k){ var o = document.createElement('option'); o.value = k; o.textContent = IDIOMAS[k].n; sel.appendChild(o); });
  S.yo.idioma = idiomaInicial(); sel.value = S.yo.idioma;
  S.practica = leer('practica') || ''; S.letra = leer('letra') || 'n'; S.fondo = leer('fondo') || 'oscuro';
  $('nombre').value = leer('nombre') || '';
  try{ var u = JSON.parse(leer('ultima') || 'null'); if(u && Array.isArray(u.lineas) && Array.isArray(u.gente) && u.yo) S.ultima = u; }catch(e){}
  notasHuerfanas();
  leerHash();
  var c = limpiarCodigo(HASH.sala);
  if(codigoValido(c)){ $('codigo').value = verCodigo(c); $('invitado').hidden = false; }
  sel.onchange = function(){ S.yo.idioma = sel.value; aplicarTextos(); pintarUltima(); };
  $('b-crear').onclick = crearSala;
  $('f-unir').onsubmit = function(e){ e.preventDefault(); unirse(limpiarCodigo($('codigo').value)); };
  $('b-cancelar').onclick = function(){
    var f = foto();   // si el otro ya se había ido, lo dicho y las notas no se pierden
    pararTocar(); mandar({t:'me-voy'}); S.codigo = null; mostrar('entrada');
    setTimeout(function(){ if(!S.codigo){ limpiarLlamada(); archivarReunion(f); } }, 150);
  };
  $('b-copiar').onclick = function(){ copiar(enlace(), T('copiado')); };
  if(navigator.share){ $('b-compartir').hidden = false; $('b-compartir').onclick = function(){ navigator.share({title:T('titulo'), text:T('titulo') + ' · ' + verCodigo(S.codigo), url:enlace()}).catch(function(){}); }; }
  $('pedidos').onclick = function(e){
    var b = e.target.closest('button'); if(!b) return;
    if(b.getAttribute('data-si')) dejarEntrar(b.getAttribute('data-si'));
    else if(b.getAttribute('data-no')){ var id = b.getAttribute('data-no'); mandar({t:'no', para:id, por:'no'}); delete S.pedidos[id]; pintarPedidos(); }
  };
  $('aviso-sala-ok').onclick = function(){ $('aviso-sala').hidden = true; };
  $('chip-motor').onclick = function(){ prepararAmbos(); };
  $('m-mic').onclick = function(){
    if(!S.media || !S.media.getAudioTracks().length) return;
    S.mic = !S.mic; S.media.getAudioTracks().forEach(function(t){ t.enabled = S.mic; });
    if(S.mic) recEmpezar(true); else recParar(); pintarMandos();
  };
  $('m-cam').onclick = function(){
    if(!S.media || !S.media.getVideoTracks().length) return;
    S.cam = !S.cam; S.media.getVideoTracks().forEach(function(t){ t.enabled = S.cam; }); pintarMandos();
  };
  $('m-pantalla').onclick = compartirPantalla;
  $('m-grabar').onclick = grabar;
  $('g-video').onclick = function(){ var u = GR.ultimo; if(u) bajarArchivo(u.blob, u.nombre); };
  $('g-srt-tr').onclick = function(){ var u = GR.ultimo; if(u) bajarArchivo(new Blob([srt(u.lineas, u.inicio, true)], {type:'text/plain;charset=utf-8'}), u.base + '-traducido.srt'); };
  $('g-srt-or').onclick = function(){ var u = GR.ultimo; if(u) bajarArchivo(new Blob([srt(u.lineas, u.inicio, false)], {type:'text/plain;charset=utf-8'}), u.base + '-original.srt'); };
  $('g-cerrar').onclick = function(){ $('grabado').hidden = true; };
  $('panel-cerrar').onclick = function(){ $('panel-sala').hidden = true; };
  $('traducir-a').onchange = function(){
    S.practica = $('traducir-a').value; guardar('practica', S.practica);
    if(destino()) trStart(S.yo.idioma, destino());   // dentro del cambio: si Chrome tiene que bajar el idioma, puede
    pintarMotor();
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-letra],[data-fondo]'), function(b){
    b.onclick = function(){
      if(b.getAttribute('data-letra')) S.letra = b.getAttribute('data-letra'); else S.fondo = b.getAttribute('data-fondo');
      guardar('letra', S.letra); guardar('fondo', S.fondo); aplicarLetra();
    };
  });
  $('m-marcar').onclick = marcar;
  $('m-reunion').onclick = function(){ var r = $('registro'); r.hidden = !r.hidden; if(!r.hidden) verTab(S.tab || 'dicho'); };
  $('m-notas').onclick = function(){ verNotas(); };
  $('lado-cerrar').onclick = function(){ verNotas(false); try{ $('m-notas').focus(); }catch(e){} };
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape' || S.pantalla !== 'sala') return;
    if(!$('registro').hidden){ $('registro').hidden = true; try{ $('m-reunion').focus(); }catch(x){} }
    else if(!$('lado').hidden){ verNotas(false); try{ $('m-notas').focus(); }catch(x){} }
  });
  $('notas').oninput = function(){ $('notas-aviso').hidden = true; guardarNotas(); };
  $('n-hora').onclick = function(){ ponerEnNotas('[' + hora(Date.now()) + '] '); };
  $('n-ultimo').onclick = function(){
    var L = ultimoDicho(); if(!L){ estado(T('nada-dicho')); return; }
    ponerEnNotas('[' + hora(L.t) + '] ' + L.nombre + ': ' + L.o + (L.tr ? ' → ' + L.tr : ''));
  };
  Array.prototype.forEach.call(document.querySelectorAll('.tabs [data-tab]'), function(b){ b.onclick = function(){ verTab(b.getAttribute('data-tab')); }; });
  $('tab-dicho').onclick = function(e){
    var b = e.target.closest('.estrella'); if(!b) return;
    var L = S.lineas[b.getAttribute('data-k')]; if(L){ L.marca = !L.marca; pintarRegistro(); }
  };
  $('b-voz').onclick = function(){ S.voz = !S.voz; if(!S.voz) interrumpir(); pintarVoz(); };
  $('b-cerrar-reg').onclick = function(){ $('registro').hidden = true; };
  $('b-resumen').onclick = function(){ var f = foto(); resumir(f, $('res-salida'), function(r){ S.resumen = r; }); };
  $('b-acta').onclick = function(){ descargarActa(foto()); };
  $('b-imprimir').onclick = function(){ imprimirActa(foto()); };
  $('b-copiar-todo').onclick = copiarTodo;
  $('u-resumen').onclick = function(){ if(S.ultima) resumir(S.ultima, $('ultima-res'), function(){ guardar('ultima', JSON.stringify(S.ultima)); }); };
  $('u-acta').onclick = function(){ if(S.ultima) descargarActa(S.ultima); };
  $('u-imprimir').onclick = function(){ if(S.ultima) imprimirActa(S.ultima); };
  $('u-borrar').onclick = function(){ S.ultima = null; try{ localStorage.removeItem('llamada.ultima'); }catch(e){} pintarUltima(); msgEntrada(T('borrada'), 'ok'); };
  $('m-colgar').onclick = colgar;
  $('escribir').onsubmit = function(e){ e.preventDefault(); var v = $('escribir-t').value.trim(); if(!v) return; $('escribir-t').value = ''; S.curId = null; alFinal(v, true); };
  window.addEventListener('pagehide', function(){
    if(!S.otro) return;
    if(dcAbierto()){ try{ S.dc.send(JSON.stringify({t:'chau', de:S.yo.id})); }catch(e){} }
    if(RT.unido) rtMandarYa({t:'chau', de:S.yo.id});
  });
  aplicarTextos(); pintarUltima();
  mostrar('entrada');
}

// gancho de prueba (como el del prototipo): __llamada.alFinal("frase") simula una frase dicha
window.__llamada = {S:S, TR:TR, RT:RT, VOZ:VOZ, recEmpezar:recEmpezar, alFinal:alFinal, alParcial:alParcial, esEco:esEco, verCodigo:verCodigo, foto:foto, actaTexto:actaTexto, acuerdos:acuerdos, srt:srt, NOMBRE:NOMBRE, CANAL:CANAL};
Object.defineProperty(window.__llamada, 'GR', {get:function(){ return GR; }});   // GR se reemplaza en cada grabación
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
