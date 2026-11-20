/* OBRASST · el chat de la obra en la web (16/11/2026)
   Marcelo: «el chat para que chatee también desde la web el supervisor, jefe». Es el mismo chat de la app, en la nube
   (sql/2026-11-15-chat-obra.sql): los mismos grupos (Obra, SST, Producción y los que crea el jefe), los mismos mensajes,
   pendientes, acuerdos y adjuntos, con la cuenta del portal. Lo que cambia es la cara: en la computadora, la lista de
   grupos a la izquierda y el chat a la derecha; Enter manda (Mayús + Enter, otra línea); un archivo se arrastra al chat o
   una captura se pega (Ctrl + V). En una pantalla angosta, uno a la vez, con «‹» para volver.
   Nada del chat se guarda en el navegador (en una computadora compartida no queda nada): vive en la nube y se pide con la
   cuenta. Mientras el chat está abierto se pregunta cada 4 s lo nuevo del grupo y cada 15 s la lista; el número del menú
   lo lleva portal/index.html (CHWB). En el código no va ninguna persona: los nombres los pone el servidor. */
var CHW = { emp:'', cta:'', yo:'', quien:'', gestiona:false, nombre:'', canales:[], misPend:0, pendLista:null, estado:'', ts:0,
            cargando:null, msjs:{}, hasta:{}, viejos:{}, pers:{}, resp:null, soloAcu:false, urls:{}, blobs:{}, tic:null, ticLista:null,
            leido:{}, activo:'', filtro:'grupos', cola:[], enviando:null, irA:null, caja:null, menu:null };
var CHW_IMG_VACIA = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
var CHW_MOTIVO = {
  sin_acceso:'Ya no tienes acceso a este grupo.', no_eres_de_la_obra:'Tu cuenta no está en el chat de esta obra: es de quienes son miembros de la obra (el jefe y sus supervisores) y de los trabajadores con su cuenta.',
  muy_seguido:'Vas muy rápido: espera un momento y vuelve a intentarlo.', muy_largo:'El mensaje es muy largo (hasta 4000 letras).',
  adjunto:'El archivo no subió bien: vuelve a intentarlo.', vacio:'Escribe algo o adjunta un archivo.', solo_supervisores:'Eso lo hacen los supervisores de la obra.',
  no_se_puede:'Ese mensaje no puede ser un pendiente.', fecha_pasada:'Esa fecha ya pasó: elige hoy o una fecha que viene.',
  no_esta_en_el_grupo:'Esa persona no está en este grupo.', ya_no_esta_abierto:'Ese pendiente ya no está abierto.',
  no_es_tuyo:'Eso lo hace quien lo asignó o el jefe de la obra.', falta_sustento:'Escribe cómo lo cumpliste o adjunta una foto.',
  tiene_pendiente:'Tiene un pendiente abierto: anúlalo o cúmplelo primero.', sin_permiso:'Eso lo hace el jefe de la obra o quien maneja los grupos.',
  nombre:'Ponle un nombre al grupo (hasta 60 letras).', muchos:'Ya hay muchos grupos: archiva los que ya no usan.',
  el_grupo_obra_es_de_todos:'En el Grupo Obra están todos: no lleva lista.', solo_el_jefe:'Eso lo hace el jefe de la obra.',
  no_es_miembro:'Esa persona no es miembro de la obra.', los_de_siempre_no:'Los 3 grupos de siempre no se cambian ni se archivan.',
  sin_red:'Sin conexión: revisa tu internet. Lo que escribiste sale solo cuando vuelva.', sin_servidor:'El chat todavía no está activo en el servidor. Avísanos y lo dejamos listo.',
  sin_cuenta:'Tu sesión venció: vuelve a entrar a tu cuenta.', tipo:'Ese tipo de archivo no va por el chat: fotos, PDF, Word o Excel.',
  video:'Los videos no van por el chat porque pesan demasiado. Súbelo a YouTube o a Drive y pega su enlace.',
  'muy-grande':'Pesa más de 20 MB, que es el tope del chat.', sin_obra:'Elige una obra para ver su chat.'
};
function _chwMotivo(err){
  var j = err && err.j;
  if(j && j.motivo && CHW_MOTIVO[j.motivo]) return CHW_MOTIVO[j.motivo];
  if(typeof err === 'string' && CHW_MOTIVO[err]) return CHW_MOTIVO[err];
  if(err === 404) return CHW_MOTIVO.sin_servidor;
  if(err === 401 || err === 403) return CHW_MOTIVO.sin_cuenta;
  if(_chwRed(err)) return CHW_MOTIVO.sin_red;
  return 'No se pudo. Inténtalo otra vez.';
}
/* sin conexión (o el servidor no contestó a tiempo): no es un «no» del servidor */
function _chwRed(err){ return !(err && err.j) && typeof err !== 'number' && typeof err !== 'string'; }
function _chwObra(){ return (typeof YO === 'object' && YO && YO.obra && YO.obra.id) ? YO.obra : null; }
function _chwSesion(){ return !!(typeof TOK === 'object' && TOK && TOK.access_token); }
function _chwE(x){ return esc(x == null ? '' : String(x)); }
function _chwAqui(){ return typeof VISTA === 'object' && VISTA.actual === 'chat' && !!document.getElementById('chw'); }
function _chwRpc(fn, a){ return sbRpc(fn, a || {}).then(function(j){ if(j && j.ok === false) return Promise.reject({ j:j }); return (j && typeof j === 'object' && !Array.isArray(j)) ? j : {}; }); }
/* al cambiar de obra (o de cuenta): de cero, sin lo de la otra */
function _chwPrep(){
  var o = _chwObra(); if(!o){ CHW.emp = ''; return null; }
  var cta = String((TOK && (TOK.uid || TOK.correo)) || '');
  if(CHW.emp === o.id && CHW.cta === cta) return o;
  _chwParar(); _chwUrlsSoltar();
  CHW.emp = o.id; CHW.cta = cta; CHW.yo = ''; CHW.quien = ''; CHW.gestiona = false; CHW.nombre = ''; CHW.canales = []; CHW.misPend = 0;
  CHW.pendLista = null; CHW.estado = ''; CHW.ts = 0; CHW.msjs = {}; CHW.hasta = {}; CHW.viejos = {}; CHW.pers = {}; CHW.resp = null;
  CHW.soloAcu = false; CHW.leido = {}; CHW.activo = ''; CHW.filtro = 'grupos'; CHW.cola = []; CHW.irA = null;
  return o;
}

/* ── las fechas, como en la app ── */
function _chwDos(n){ return (n < 10 ? '0' : '') + n; }
function _chwHora(iso){ var d = new Date(iso); return isNaN(d) ? '' : _chwDos(d.getHours()) + ':' + _chwDos(d.getMinutes()); }
function _chwDiaK(d){ return d.getFullYear() + '-' + _chwDos(d.getMonth() + 1) + '-' + _chwDos(d.getDate()); }
function _chwDiaTx(iso){
  var d = new Date(iso); if(isNaN(d)) return '';
  var k = _chwDiaK(d), hoy = new Date(), ayer = new Date(hoy.getTime() - 864e5);
  if(k === _chwDiaK(hoy)) return 'Hoy';
  if(k === _chwDiaK(ayer)) return 'Ayer';
  return _chwDos(d.getDate()) + '/' + _chwDos(d.getMonth() + 1) + '/' + d.getFullYear();
}
function _chwCuando(iso){ var t = _chwDiaTx(iso); return t === 'Hoy' ? _chwHora(iso) : (t === 'Ayer' ? 'Ayer' : t.slice(0, 5)); }
function _chwMasDias(n){ var d = new Date(); d.setDate(d.getDate() + n); return _chwDiaK(d); }
function _chwVence(v){
  if(!v) return { tx:'Sin plazo', mal:false };
  var hoy = _chwMasDias(0), dm = String(v).slice(8, 10) + '/' + String(v).slice(5, 7);
  if(v < hoy) return { tx:'Venció el ' + dm, mal:true };
  if(v === hoy) return { tx:'Vence hoy', mal:false };
  if(v === _chwMasDias(1)) return { tx:'Vence mañana', mal:false };
  return { tx:'Vence el ' + dm, mal:false };
}
function _chwTam(b){ b = +b || 0; if(!b) return ''; return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (Math.round(b / 104857.6) / 10).toString().replace('.', ',') + ' MB'; }
function _chwPrimer(n){ return String(n || '').trim().split(/\s+/)[0] || ''; }
/* el texto de un mensaje: escapado, con sus enlaces (solo http y https) que se abren aparte */
function _chwTexto(t){
  return _chwE(t).replace(/https?:\/\/(?:(?!&quot;|&#39;|&lt;|&gt;)[^\s<])+/g, function(u){
    var fin = (u.match(/[.,;:!?)\]]+$/) || [''])[0], url = fin ? u.slice(0, u.length - fin.length) : u;
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>' + fin;
  });
}

/* ══ LO QUE SE PIDE AL SERVIDOR ═══════════════════════════════════════════════════════════════════════════════ */
function chwCargarCanales(){
  var o = _chwPrep();
  if(!o){ CHW.estado = 'sin_obra'; return Promise.resolve(null); }
  if(!_chwSesion()){ CHW.estado = 'sin_cuenta'; return Promise.resolve(null); }
  if(CHW.cargando) return CHW.cargando;
  var emp = o.id;
  var p = CHW.cargando = _chwRpc('sst_chat_canales', { p_emp:emp }).then(function(j){
    if(CHW.cargando === p) CHW.cargando = null;
    if(CHW.emp !== emp) return null;
    CHW.yo = j.yo || ''; CHW.quien = j.quien || ''; CHW.gestiona = !!j.gestiona; CHW.nombre = j.nombre || '';
    CHW.canales = Array.isArray(j.canales) ? j.canales : []; CHW.misPend = +j.mis_pend || 0;
    CHW.estado = 'ok'; CHW.ts = Date.now(); _chwContar(); return j;
  }, function(err){
    if(CHW.cargando === p) CHW.cargando = null;
    if(CHW.emp !== emp) return null;
    CHW.ts = Date.now();
    if(err && err.j && err.j.motivo === 'no_eres_de_la_obra'){ CHW.estado = 'fuera'; CHW.canales = []; CHW.misPend = 0; CHW.activo = ''; }
    else if(err === 404) CHW.estado = 'sin_servidor';
    else if(err === 401 || err === 403) CHW.estado = 'sin_cuenta';
    else CHW.estado = CHW.canales.length ? 'viejo' : 'sin_red';
    _chwContar(); return null;
  });
  return p;
}
/* el número del menú (portal/index.html): pendientes para mí, o lo sin leer */
function _chwSinLeer(){ var n = 0; (CHW.canales || []).forEach(function(c){ n += (+c.sin_leer || 0); }); return n; }
function _chwContar(){
  try{ if(typeof chwbPoner === 'function') chwbPoner(CHW.emp, _chwSinLeer(), CHW.misPend || 0, (CHW.estado === 'fuera' || CHW.estado === 'sin_servidor') ? CHW.estado : ''); }catch(_c){}
}
function _chwCanal(id){ for(var i = 0; i < CHW.canales.length; i++) if(CHW.canales[i].id === id) return CHW.canales[i]; return null; }
function _chwMsjs(canal){ if(!CHW.msjs[canal]){ CHW.msjs[canal] = []; CHW.hasta[canal] = null; CHW.viejos[canal] = true; } return CHW.msjs[canal]; }
/* mete lo que llegó (nuevo o cambiado) en su lugar; devuelve cuántos cambiaron */
function _chwMezclar(canal, nuevos){
  var L = _chwMsjs(canal), pos = {}, cambio = 0;
  L.forEach(function(m, i){ pos[m.id] = i; });
  (nuevos || []).forEach(function(m){
    if(!m || !m.id) return;
    if(pos[m.id] != null){ if(L[pos[m.id]].actualizado !== m.actualizado || JSON.stringify(L[pos[m.id]]) !== JSON.stringify(m)){ L[pos[m.id]] = m; cambio++; } }
    else { pos[m.id] = L.length; L.push(m); cambio++; }
  });
  if(cambio) L.sort(function(a, b){ return a.creado < b.creado ? -1 : (a.creado > b.creado ? 1 : 0); });
  return cambio;
}
/* modo: 'inicio' (los últimos 60), 'nuevo' (lo nuevo o cambiado desde la última vez) o 'antes' (los anteriores) */
function chwCargarMsjs(canal, modo){
  _chwMsjs(canal);
  var a = { p_canal:canal, p_desde:null, p_antes:null, p_lim:60 };
  /* 10 s de colchón: un mensaje que se estaba guardando justo al preguntar no se pierde (se juntan por su id) */
  if(modo === 'nuevo' && CHW.hasta[canal]){ var t = Date.parse(CHW.hasta[canal]); if(!isNaN(t)) a.p_desde = new Date(t - 10000).toISOString(); }
  if(modo === 'antes'){ var L = CHW.msjs[canal]; if(L.length) a.p_antes = L[0].creado; }
  return _chwRpc('sst_chat_msjs', a).then(function(j){
    var n = Array.isArray(j.msjs) ? j.msjs : [], cambio = _chwMezclar(canal, n);
    if(modo === 'antes'){ if(n.length < a.p_lim) CHW.viejos[canal] = false; }
    else {
      if(j.hasta && (!CHW.hasta[canal] || j.hasta > CHW.hasta[canal])) CHW.hasta[canal] = j.hasta;
      if(!CHW.hasta[canal]) CHW.hasta[canal] = j.ahora || null;
      if(!a.p_desde && n.length < a.p_lim) CHW.viejos[canal] = false;
    }
    return cambio;
  });
}
function _chwMarcarLeido(){
  var canal = CHW.activo, cn = _chwCanal(canal); if(!canal || !cn) return;
  if(document.visibilityState === 'hidden') return;
  var L = _chwMsjs(canal), ult = '';
  L.forEach(function(m){ if(!m.mio && m.creado > ult) ult = m.creado; });
  if(!ult || (CHW.leido[canal] && CHW.leido[canal] >= ult)){ if(cn.sin_leer){ cn.sin_leer = 0; _chwContar(); _chwPintarLado(); } return; }
  CHW.leido[canal] = ult; cn.sin_leer = 0; _chwContar(); _chwPintarLado();
  _chwRpc('sst_chat_leer', { p_canal:canal }).catch(function(){ CHW.leido[canal] = ''; });
}

/* ── lo escrito sale en orden, una sola vez (su «cid»); sin conexión, se vuelve a intentar solo ── */
function _chwCid(){ return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function _chwFlush(){
  if(CHW.enviando) return CHW.enviando;
  var L = CHW.cola.filter(function(x){ return x.st !== 'mal'; });
  if(!L.length || !_chwSesion()) return Promise.resolve(0);
  var hechos = 0, emp = CHW.emp;
  var p = CHW.enviando = L.reduce(function(cad, x){
    return cad.then(function(seguir){
      if(!seguir || CHW.emp !== emp) return false;
      return _chwRpc('sst_chat_enviar', { p_canal:x.canal, p_texto:x.texto, p_adjunto:null, p_responde_a:x.resp || null, p_cid:x.cid }).then(function(j){
        hechos++; CHW.cola = CHW.cola.filter(function(y){ return y.cid !== x.cid; });
        if(j.msj) _chwMezclar(x.canal, [j.msj]);
        return true;
      }, function(err){
        if(_chwRed(err) || err === 401){ x.st = 'espera'; return false; }   /* sin conexión: en la próxima vuelta */
        x.st = 'mal'; x.porque = _chwMotivo(err); return true;
      });
    });
  }, Promise.resolve(true)).then(function(){ CHW.enviando = null; return hechos; }, function(){ CHW.enviando = null; return hechos; });
  return p;
}

/* ── los adjuntos: al balde privado «chat» (<obra>/<grupo>/<archivo>), y se abren con la cuenta ── */
var CHW_TIPOS = { 'image/jpeg':1, 'image/png':1, 'image/webp':1, 'image/heic':1, 'application/pdf':1, 'application/msword':1,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':1, 'application/vnd.ms-excel':1,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':1 };
var CHW_EXT = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', heic:'image/heic', heif:'image/heic', pdf:'application/pdf',
  doc:'application/msword', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xls:'application/vnd.ms-excel',
  xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
function _chwTipo(f){
  var t = String((f && f.type) || '').toLowerCase();
  if(t === 'image/jpg') t = 'image/jpeg'; if(t === 'image/heif') t = 'image/heic';
  if(CHW_TIPOS[t]) return t;
  var x = (String((f && f.name) || '').match(/\.([a-z0-9]{2,5})$/i) || [])[1];
  return CHW_EXT[String(x || '').toLowerCase()] || '';
}
function _chwEsVideo(f){ return /^video\//i.test(String((f && f.type) || '')) || /\.(mp4|mov|avi|mkv|webm|3gp|m4v|wmv)$/i.test(String((f && f.name) || '')); }
function _chwNomSeguro(n){
  var s = String(n || 'archivo'); try{ s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(_n){}
  s = s.replace(/[^A-Za-z0-9.\-_]+/g, '_').replace(/_+/g, '_').replace(/^[_.]+|_+$/g, '');
  return (s || 'archivo').slice(-90);
}
/* la foto, liviana: 1600 px se ven bien y pesan unos 300 KB */
function _chwAchicar(f){
  return new Promise(function(ok){
    var t = String((f && f.type) || '').toLowerCase();
    if(!f || !/^image\/(jpeg|jpg|png|webp)$/.test(t) || (f.size || 0) < 350 * 1024){ ok(f); return; }
    var url = null, img = new Image();
    try{ url = URL.createObjectURL(f); }catch(_u){ ok(f); return; }
    img.onload = function(){
      try{
        var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, 1600 / Math.max(w, h, 1));
        var cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
        var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        cv.toBlob(function(b){ ok((b && b.size < (f.size || 0)) ? b : f); }, 'image/jpeg', 0.82);
      }catch(_c){ ok(f); }
    };
    img.onerror = function(){ try{ URL.revokeObjectURL(url); }catch(_r){} ok(f); };
    img.src = url;
  });
}
function _chwRutaUrl(ruta){ return String(ruta).split('/').map(encodeURIComponent).join('/'); }
function _chwSubir(canal, f, nombre){
  var o = _chwObra(); if(!o) return Promise.reject('sin_obra');
  if(_chwEsVideo(f)) return Promise.reject('video');
  var tipo = _chwTipo(f); if(!tipo) return Promise.reject('tipo');
  var nom = String(nombre || (f && f.name) || 'archivo').trim() || 'archivo';
  return (/^image\/(jpeg|png|webp)$/.test(tipo) ? _chwAchicar(f) : Promise.resolve(f)).then(function(b){
    if((b.size || 0) > 20 * 1048576) return Promise.reject('muy-grande');
    var base = _chwNomSeguro(nom);
    if(b !== f && /^image\//.test(tipo)){ tipo = 'image/jpeg'; base = base.replace(/\.[A-Za-z0-9]+$/, '') + '.jpg'; if(!/\.[a-z0-9]{2,5}$/i.test(nom)) nom += '.jpg'; }
    var ruta = o.id + '/' + canal + '/' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '-' + base;
    var ac = null; try{ ac = new AbortController(); setTimeout(function(){ try{ ac.abort(); }catch(_a){} }, 180000); }catch(_c){}
    return sbFetch(SB.url + '/storage/v1/object/chat/' + _chwRutaUrl(ruta), { method:'POST', body:b, signal:ac ? ac.signal : undefined,
                   extra:{ 'Content-Type':tipo, 'x-upsert':'false' } }).then(function(r){
      if(!r.ok) return Promise.reject(r.status);
      try{ CHW.blobs[ruta] = b; CHW.urls[ruta] = URL.createObjectURL(b); }catch(_o){}
      return { ruta:ruta, nombre:nom.slice(0, 120), tipo:tipo, tam:b.size || 0 };
    });
  });
}
function _chwBlob(ruta){
  if(CHW.blobs[ruta]) return Promise.resolve(CHW.blobs[ruta]);
  return sbFetch(SB.url + '/storage/v1/object/authenticated/chat/' + _chwRutaUrl(ruta), { method:'GET' }).then(function(r){
    return r.ok ? r.blob() : Promise.reject(r.status);
  }).then(function(b){ CHW.blobs[ruta] = b; return b; });
}
function _chwUrl(ruta){
  if(CHW.urls[ruta]) return Promise.resolve(CHW.urls[ruta]);
  return _chwBlob(ruta).then(function(b){ var u = URL.createObjectURL(b); CHW.urls[ruta] = u; return u; });
}
function _chwUrlsSoltar(){ Object.keys(CHW.urls || {}).forEach(function(k){ try{ URL.revokeObjectURL(CHW.urls[k]); }catch(_r){} }); CHW.urls = {}; CHW.blobs = {}; }
function _chwCargarImgs(raiz){
  Array.prototype.forEach.call((raiz || document).querySelectorAll('img[data-ruta]:not([data-ok])'), function(img){
    var r = img.getAttribute('data-ruta');
    _chwUrl(r).then(function(u){ img.src = u; img.setAttribute('data-ok', '1'); }, function(){ img.classList.add('mal'); img.alt = 'No se pudo abrir la foto'; });
  });
}
/* abrir una foto o un archivo del chat: se ve primero (la vista del portal, con su «Descargar») */
function _chwAbrirArchivo(ruta, nombre){
  toast('Abriendo «' + nombre + '»…');
  _chwBlob(ruta).then(function(b){ bajarBlob(b, nombre || 'archivo'); }, function(err){ toast('No se pudo abrir: ' + _chwMotivo(err)); });
}

/* ══ LA PANTALLA ═══════════════════════════════════════════════════════════════════════════════════════════════ */
var CHW_TAG = { obra:['OBRA', 'az'], sst:['SST', 'ok'], prod:['PRODUCCIÓN', 'oj'], grupo:['GRUPO', 'gr'] };
var CHW_SUB = { obra:'Toda la obra: supervisores y trabajadores', sst:'Supervisores de SST de la obra', prod:'SST y Producción coordinan la obra' };
var CHW_QUIEN = { jefe:'Jefe de obra', miembro:'Supervisor', trab:'Trabajador' };
function chwVista(caja){
  _chwCss();
  CHW.caja = caja;
  _chwPrep();
  var ac = $('acciones'); if(ac) ac.innerHTML = '';
  caja.innerHTML = '<div class="chw' + (CHW.activo ? ' con-chat' : '') + '" id="chw" data-sin-sector data-sin-pais>' +
    '<aside class="chw-lado" id="chw-lado" aria-label="Los grupos del chat"></aside>' +
    '<section class="chw-conv" id="chw-conv" aria-label="La conversación"></section></div>';
  var w = $('chw');
  w.addEventListener('click', _chwClic);
  w.addEventListener('keydown', _chwTecla);
  _chwSoltarAtar(w);
  _chwPintarLado(); _chwPintarConv();
  _chwMedir();
  VISTA.recargar = function(){ if(!_chwAqui()) return; chwCargarCanales().then(function(){ if(_chwAqui()){ _chwPintarLado(); if(CHW.activo && !_chwCanal(CHW.activo) && CHW.estado === 'ok'){ CHW.activo = ''; _chwPintarConv(); } } }); };
  if(!_chwObra() || !_chwSesion()) return;
  _chwFlush();
  chwCargarCanales().then(function(){
    if(!_chwAqui()) return;
    if(CHW.filtro === 'pend') _chwCargarPend().then(function(){ if(_chwAqui()) _chwPintarLado(); });
    _chwPintarLado();
    if(CHW.activo){ if(_chwCanal(CHW.activo)) _chwAbrir(CHW.activo); else if(CHW.estado === 'ok'){ CHW.activo = ''; _chwPintarConv(); } }
    else _chwPintarConv();
  });
  _chwListaAgendar();
}
/* el alto: lo que queda de la ventana debajo de la cabecera (la barra para escribir siempre a la vista) */
function _chwMedir(){
  var w = $('chw'); if(!w) return;
  var top = w.getBoundingClientRect().top + (window.scrollY || 0), h = Math.round(window.innerHeight - top - 18);
  w.style.height = Math.max(window.innerWidth <= 900 ? 420 : 480, h) + 'px';
}
window.addEventListener('resize', function(){ if(_chwAqui()) _chwMedir(); });
function _chwEstadoHTML(){
  if(!_chwObra()) return '<div class="chw-aviso">' + _chwE(CHW_MOTIVO.sin_obra) + '</div>';
  if(!_chwSesion() || CHW.estado === 'sin_cuenta') return '<div class="chw-aviso mal">' + _chwE(CHW_MOTIVO.sin_cuenta) + '</div>';
  if(CHW.estado === 'fuera') return '<div class="chw-aviso mal">' + _chwE(CHW_MOTIVO.no_eres_de_la_obra) + '</div>';
  if(CHW.estado === 'sin_servidor') return '<div class="chw-aviso mal">' + _chwE(CHW_MOTIVO.sin_servidor) + '</div>';
  if(CHW.estado === 'sin_red') return '<div class="chw-aviso">Sin conexión: el chat se carga cuando vuelva.</div>';
  return '';
}
function _chwPintarLado(){
  var c = $('chw-lado'); if(!c) return;
  var o = _chwObra(), nP = CHW.misPend || 0, est = _chwEstadoHTML(), it0 = $('chw-items'), sc = it0 ? it0.scrollTop : 0;
  var h = '<div class="chw-lado-cab"><div class="chw-lado-tit"><b>Chat de la obra</b><small>' + _chwE(o ? (typeof nombreObraP === 'function' ? nombreObraP(o) : o.nombre) : '') + '</small></div>' +
    (CHW.gestiona && CHW.estado !== 'fuera' ? '<button type="button" class="chw-bt-ic" data-acc="nuevo" title="Crear un grupo" aria-label="Crear un grupo">＋</button>' : '') + '</div>';
  if(est && !(CHW.estado === 'viejo' || (CHW.estado === 'sin_red' && CHW.canales.length))){ c.innerHTML = h + est; return; }
  h += '<div class="chw-tabs" role="tablist" aria-label="Qué ver">' +
    '<button type="button" role="tab" class="chw-tab' + (CHW.filtro !== 'pend' ? ' on' : '') + '" aria-selected="' + (CHW.filtro !== 'pend') + '" data-filtro="grupos">Grupos <span class="chw-n">' + CHW.canales.length + '</span></button>' +
    '<button type="button" role="tab" class="chw-tab' + (CHW.filtro === 'pend' ? ' on' : '') + '" aria-selected="' + (CHW.filtro === 'pend') + '" data-filtro="pend">📌 Mis pendientes <span class="chw-n' + (nP ? ' si' : '') + '">' + nP + '</span></button></div>';
  if(CHW.estado === 'viejo') h += '<div class="chw-aviso suave">Sin conexión: ves lo último que llegó.</div>';
  h += '<div class="chw-items" id="chw-items">';
  if(CHW.filtro === 'pend') h += _chwPendListaHTML();
  else {
    CHW.canales.forEach(function(cn){
      var tg = CHW_TAG[cn.tipo] || CHW_TAG.grupo, u = cn.ultimo, snip = '';
      if(u){
        var quien = u.mio ? 'Tú: ' : (_chwPrimer(u.autor_nombre) ? _chwPrimer(u.autor_nombre) + ': ' : '');
        var cuerpo = u.texto ? u.texto : (u.adjunto ? '📎 ' + u.adjunto : (u.tipo === 'msj' ? '🚫 Mensaje eliminado' : ''));
        snip = (u.tipo === 'sustento' ? '✅ ' : '') + quien + cuerpo;
      } else snip = cn.descripcion || 'Todavía sin mensajes';
      var on = cn.id === CHW.activo;
      h += '<button type="button" class="chw-item' + (on ? ' on' : '') + '" data-canal="' + _chwE(cn.id) + '"' + (on ? ' aria-current="true"' : '') + '>' +
        '<span class="chw-av" aria-hidden="true">' + _chwE(cn.icono || '💬') + '</span>' +
        '<span class="chw-it">' +
          '<span class="chw-it-1"><b class="chw-it-nom">' + _chwE(cn.nombre) + '</b>' + (u ? '<span class="chw-it-hora' + (cn.sin_leer ? ' nl' : '') + '">' + _chwE(_chwCuando(u.creado)) + '</span>' : '') + '</span>' +
          '<span class="chw-it-2"><span class="chw-it-snip">' + _chwE(snip) + '</span>' +
            (cn.mis_pend ? '<span class="chw-pill pen" title="Pendientes para ti">📌 ' + cn.mis_pend + '</span>' : '') +
            (cn.sin_leer ? '<span class="chw-pill nl" title="Sin leer">' + (cn.sin_leer > 99 ? '99+' : cn.sin_leer) + '</span>' : '') +
            '<span class="chw-tag ' + tg[1] + '">' + tg[0] + '</span></span>' +
        '</span></button>';
    });
    if(!CHW.canales.length) h += '<div class="chw-aviso suave">' + (CHW.estado ? 'Todavía no hay grupos.' : 'Cargando los grupos…') + '</div>';
  }
  h += '</div>';
  if(CHW.quien === 'jefe' && CHW.filtro !== 'pend') h += '<button type="button" class="chw-link" data-acc="gestores">👥 Quién más puede crear y manejar grupos</button>';
  c.innerHTML = h;
  var it1 = $('chw-items'); if(it1 && sc) it1.scrollTop = sc;
}
function _chwPendListaHTML(){
  var L = CHW.pendLista;
  if(!L) return '<div class="chw-aviso suave">Cargando tus pendientes…</div>';
  if(!L.length) return '<div class="chw-vacio"><b>No tienes pendientes del chat.</b><span>Cuando alguien te asigne uno, sale aquí y en el número del menú.</span></div>';
  return L.map(function(p){
    var v = _chwVence(p.vence), av = _chwAvance(Object.assign({ estado:'abierto' }, p)), tram = !!(av && av.tram);
    return '<div class="chw-pend' + (v.mal ? ' mal' : '') + '"><div class="chw-pend-cab"><span>' + _chwE(p.canal_nombre) + '</span><span class="chw-pend-v">' + _chwE(v.tx) + '</span></div>' +
      '<div class="chw-pend-tx">' + _chwE(p.texto || '(foto o archivo)') + '</div><div class="chw-pend-de">Te lo asignó: ' + _chwE(p.de) + '</div>' +
      (av ? _chwBarraHTML(p, av) : '') + _chwSigueHTML(Object.assign({ estado:'abierto' }, p), av) +
      '<div class="chw-pend-bts">' + (tram ? '' : '<button type="button" class="bt chico" data-acc="cumplir" data-p="' + _chwE(p.id) + '" data-m="' + _chwE(p.msj) + '" data-c="' + _chwE(p.canal) + '">✓ Cumplir</button>') +
      '<button type="button" class="bt sec chico" data-acc="verchat" data-m="' + _chwE(p.msj) + '" data-c="' + _chwE(p.canal) + '">Ver en el chat</button></div></div>';
  }).join('');
}
function _chwCargarPend(){
  var o = _chwPrep(); if(!o || !_chwSesion()) return Promise.resolve(null);
  return _chwRpc('sst_chat_mis_pend', { p_emp:o.id }).then(function(j){
    CHW.pendLista = Array.isArray(j.pendientes) ? j.pendientes : []; CHW.misPend = CHW.pendLista.length; _chwContar(); return CHW.pendLista;
  }, function(){ if(!CHW.pendLista) CHW.pendLista = []; return null; });
}

/* ── la conversación ── */
function _chwAcuerdos(canal){ var n = 0; _chwMsjs(canal).forEach(function(m){ if(m.acuerdo && !m.borrado) n++; }); return n; }
function _chwCabHTML(cn){
  var nA = _chwAcuerdos(cn.id);
  return '<div class="chw-cab" id="chw-cab"><button type="button" class="chw-atras" data-acc="volver" aria-label="Volver a los grupos">‹</button>' +
    '<span class="chw-av" aria-hidden="true">' + _chwE(cn.icono || '💬') + '</span>' +
    '<div class="chw-cab-tx"><b>' + _chwE(cn.nombre) + '</b><small>' + _chwE(cn.tipo === 'grupo' ? (cn.descripcion || 'Grupo de la obra') : (CHW_SUB[cn.tipo] || '')) + '</small></div>' +
    '<div class="chw-cab-der">' + (nA ? '<button type="button" class="chw-chip' + (CHW.soloAcu ? ' on' : '') + '" data-acc="acuerdos" aria-pressed="' + CHW.soloAcu + '" title="Ver solo los acuerdos de obra">🤝 ' + nA + (nA === 1 ? ' acuerdo' : ' acuerdos') + '</button>' : '') +
      '<button type="button" class="chw-bt-ic" data-acc="info" title="Quiénes están y ajustes del grupo" aria-label="Quiénes están y ajustes del grupo">👥</button></div></div>';
}
function _chwPintarConv(){
  var c = $('chw-conv'), w = $('chw'); if(!c) return;
  var cn = CHW.activo ? _chwCanal(CHW.activo) : null;
  if(w) w.classList.toggle('con-chat', !!cn);
  if(!cn){
    c.innerHTML = '<div class="chw-nada"><div class="chw-nada-ic" aria-hidden="true">💬</div><b>Elige un grupo</b>' +
      '<p>Aquí ves sus mensajes y escribes desde la computadora: lo que mandas llega a la app de cada uno.</p>' +
      '<ul><li><b>Enter</b> manda el mensaje; <b>Mayús + Enter</b>, otra línea.</li><li>Arrastra un archivo al chat, o pega una captura con <b>Ctrl + V</b>, para mandarla.</li>' +
      '<li>Toca un mensaje para responderlo, volverlo pendiente de alguien o marcarlo como acuerdo de obra.</li></ul></div>';
    return;
  }
  c.innerHTML = _chwCabHTML(cn) +
    '<div class="chw-feed" id="chw-feed" aria-live="polite"></div>' +
    '<button type="button" class="chw-abajo" id="chw-abajo" data-acc="abajo" hidden>↓ Nuevos</button>' +
    '<div class="chw-resp" id="chw-resp" hidden></div>' +
    '<div class="chw-barra"><button type="button" class="chw-clip" data-acc="adjuntar" title="Adjuntar una foto o un archivo (también puedes arrastrarlo o pegarlo)" aria-label="Adjuntar una foto o un archivo">📎</button>' +
      '<textarea id="chw-txt" rows="1" maxlength="4000" placeholder="Escribe un mensaje" aria-label="Mensaje"></textarea>' +
      '<button type="button" class="chw-enviar" data-acc="enviar" title="Enviar (Enter)" aria-label="Enviar">➤</button></div>' +
    '<input type="file" id="chw-archivo" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" hidden>' +
    '<div class="chw-soltar" id="chw-soltar" hidden><span>Suéltalo aquí para mandarlo a «' + _chwE(cn.nombre) + '»</span></div>';
  var t = $('chw-txt');
  t.addEventListener('input', function(){ _chwAlto(t); });
  t.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing){ ev.preventDefault(); chwEnviar(); } });
  t.addEventListener('paste', function(ev){
    var it = ev.clipboardData && ev.clipboardData.files; if(!it || !it.length) return;
    var f = it[0]; if(!f) return;
    ev.preventDefault();
    if(!f.name || f.name === 'image.png') try{ f = new File([f], 'captura-' + _chwDiaK(new Date()) + '.png', { type:f.type || 'image/png' }); }catch(_n){}
    _chwAdjuntoListo(f);
  });
  $('chw-archivo').addEventListener('change', function(){ var f = this.files && this.files[0]; this.value = ''; if(f) _chwAdjuntoListo(f); });
  var feed = $('chw-feed');
  feed.addEventListener('scroll', function(){ if(_chwCerca(feed)){ var b = $('chw-abajo'); if(b) b.hidden = true; } });
  _chwPintarResp();
  _chwPintarFeed(true);
}
function _chwAbrir(canalId){
  var cn = _chwCanal(canalId); if(!cn) return;
  if(CHW.activo !== canalId){ CHW.resp = null; CHW.soloAcu = false; }
  CHW.activo = canalId;
  _chwPintarLado(); _chwPintarConv();
  var canal = cn.id;
  chwCargarMsjs(canal, CHW.hasta[canal] ? 'nuevo' : 'inicio').then(function(cambio){
    if(!_chwAqui() || CHW.activo !== canal) return;
    if(cambio || CHW.irA) _chwPintarFeed(true);
    _chwMarcarLeido();
  }, function(err){
    if(!_chwAqui() || CHW.activo !== canal) return;
    if(err && err.j && err.j.motivo === 'sin_acceso'){ toast(CHW_MOTIVO.sin_acceso); CHW.activo = ''; chwCargarCanales().then(function(){ if(_chwAqui()){ _chwPintarLado(); _chwPintarConv(); } }); return; }
    if(!_chwMsjs(canal).length){ var f = $('chw-feed'); if(f) f.innerHTML = '<div class="chw-vacio-feed">' + _chwE(_chwMotivo(err)) + '</div>'; }
  });
  _chwFlush().then(function(n){ if(n && CHW.activo === canal && _chwAqui()) _chwPintarFeed(true); });
  _chwTicAgendar(4000);
  try{ var t = $('chw-txt'); if(t && window.matchMedia && matchMedia('(pointer:fine)').matches) t.focus({ preventScroll:true }); }catch(_f){}
}
function _chwCerca(f){ return (f.scrollHeight - f.scrollTop - f.clientHeight) < 140; }
function _chwAlto(t){ try{ t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 160) + 'px'; }catch(_a){} }
function _chwColaHTML(x){
  var mal = x.st === 'mal';
  return '<div class="chw-m mio cola' + (mal ? ' fallo' : '') + '" data-cid="' + _chwE(x.cid) + '">' +
    (x.respNom ? '<div class="chw-m-cita"><b>' + _chwE(x.respNom) + '</b><span>' + _chwE(x.respTx || '') + '</span></div>' : '') +
    '<div class="chw-m-tx">' + _chwTexto(x.texto) + '</div>' +
    (mal ? '<div class="chw-m-falla">⚠️ ' + _chwE(x.porque || 'No salió') + ' <button type="button" data-acc="reintentar" data-cid="' + _chwE(x.cid) + '">Intentar otra vez</button> <button type="button" data-acc="quitar" data-cid="' + _chwE(x.cid) + '">Quitarlo</button></div>' : '') +
    '<div class="chw-m-pie"><span class="chw-m-hora">' + (mal ? '' : (x.st === 'espera' ? 'Sin conexión: sale cuando vuelva' : 'Enviando…')) + '</span><span class="chw-m-check espera" aria-hidden="true">' + (mal ? '⚠️' : '🕓') + '</span></div></div>';
}
function _chwAdjHTML(a){
  if(!a || !a.ruta) return '';
  if(/^image\/(jpeg|png|webp)$/.test(a.tipo || '')){
    var u = CHW.urls[a.ruta];
    return '<button type="button" class="chw-m-foto" data-acc="doc" data-ruta="' + _chwE(a.ruta) + '" data-nombre="' + _chwE(a.nombre || 'foto.jpg') + '" title="Ver la foto">' +
      '<img data-ruta="' + _chwE(a.ruta) + '" alt="' + _chwE(a.nombre || 'Foto') + '" src="' + (u || CHW_IMG_VACIA) + '"' + (u ? ' data-ok="1"' : '') + '></button>';
  }
  var ic = /pdf/.test(a.tipo || '') ? '📕' : (/sheet|excel/.test(a.tipo || '') ? '📗' : (/word/.test(a.tipo || '') ? '📘' : (/^image\//.test(a.tipo || '') ? '🖼️' : '📄')));
  return '<button type="button" class="chw-m-doc" data-acc="doc" data-ruta="' + _chwE(a.ruta) + '" data-nombre="' + _chwE(a.nombre || 'archivo') + '">' +
    '<span class="chw-doc-ic" aria-hidden="true">' + ic + '</span><span class="chw-doc-tx"><b>' + _chwE(a.nombre || 'Archivo') + '</b>' +
    '<small>' + _chwE(_chwTam(a.tam)) + (a.carpeta ? ' · Guardado en «' + _chwE(a.carpeta) + '»' : '') + '</small></span></button>';
}
/* ── 17/11/2026 · Claude · TANDA 2 · el avance del pendiente, igual que en la app: una barra delgada con su % y, al tocarla,
   los pasos con quién y cuándo. Lo calcula el servidor (pendiente.avance, sql/2026-11-17-chat-tramites*.sql); si todavía no
   lo manda, sale con lo que hay: 0 % abierto, 100 % cumplido. Los pasos del trámite (entregar con firma, levantar con la
   foto del después, el V°B° de SST…) se hacen en la app del celular; aquí se ven. ── */
var CHW_SIG = { aprobar:'Aprobar el pedido', entregar:'Entregar con firma y foto', req:'Armar el requerimiento', autorizar:'Autorizar (Seguridad)',
  visar:'Firmar', cotizar:'Pedir cotización a aliados', adjudicar:'Elegir aliado', recibir:'Anotar lo que llegó',
  levantar:'Levantar con foto del después', vb_obs:'Dar V°B° de SST',
  herr_entregar:'Entregar con PIN del trabajador', herr_devolver:'Registrar devolución a almacén' };
function _chwAvance(p){
  if(!p) return null;
  var a = p.avance;
  if(a && !a.error && typeof a.pct === 'number' && Array.isArray(a.pasos)) return a;
  var c = p.estado === 'cumplido';
  if(p.modo === 'prestamo_herr'){
    var mt = (p && p.meta) || {}, prestado = mt.estado_sub === 'prestado' || c;
    var pasosH = [
      { k:'herr_solicitud', t:'Solicitud de herramienta', hecho:true, quien:p.asignado_por_nombre || '', cuando:p.creado || '' },
      { k:'herr_cargo', t:'Entregada con PIN', hecho:prestado, quien:mt.cargo_nombre || '', cuando:mt.cargo_en || '', det:mt.cargo_dni ? ('Doc. ' + mt.cargo_dni) : '' },
      { k:'herr_devolucion', t:'Devuelta a almacén', hecho:c, quien:p.cumplido_por_nombre || '', cuando:p.cumplido_en || '', det:mt.despues_texto || '' }
    ];
    return { pct:c ? 100 : (prestado ? 66 : 33), n:3, hechos:pasosH.filter(function(x){ return x.hecho; }).length, tram:true, local:!a,
             sig:c ? null : (prestado ? { k:'herr_devolver' } : { k:'herr_entregar' }), pasos:pasosH, rama:'prestamo_herr', fin:c ? 'devuelto' : null };
  }
  return { pct:c ? 100 : 0, n:1, hechos:c ? 1 : 0, tram:false, local:true,
           pasos:[{ k:'cumplido', t:'Cumplido', hecho:c, quien:p.cumplido_por_nombre || '', cuando:p.cumplido_en || '' }] };
}
function _chwPasosHTML(av){
  var sig = false, h = '';
  if(av.aviso === 'req_rechazado') h += '<p class="chw-avz-aviso">El requerimiento se rechazó: elige otro camino.</p>';
  if(av.aviso === 'req_anulado') h += '<p class="chw-avz-aviso">El requerimiento se anuló: elige otro camino.</p>';
  return h + '<ol class="chw-avz-pasos">' + (av.pasos || []).map(function(s){
    var est = s.hecho ? 'ok' : (s.omitido ? 'omi' : (!sig && !av.fin ? 'sig' : 'falta'));
    if(est === 'sig') sig = true;
    var x = '<li class="' + est + '"><span class="chw-avz-ic" aria-hidden="true">' + { ok:'✓', omi:'—', sig:'➜', falta:'○' }[est] + '</span><span class="chw-avz-tx"><b>' +
      _chwE(/^v_/.test(s.k || '') ? 'Firma · ' + (s.t || '') : (s.t || '')) + '</b>';
    if(s.det) x += '<small>' + _chwE(s.det) + '</small>';
    if(s.hecho && (s.quien || s.cuando)) x += '<small>' + _chwE([s.quien || '', s.cuando ? _chwDiaTx(s.cuando) + ' ' + _chwHora(s.cuando) : ''].filter(Boolean).join(' · ')) + '</small>';
    else if(est === 'sig') x += '<small>Es lo que sigue</small>';
    else if(est === 'omi') x += '<small>No se hizo</small>';
    return x + '</span></li>';
  }).join('') + '</ol>';
}
function _chwBarraHTML(p, av){
  var pct = Math.max(0, Math.min(100, Math.round(+av.pct || 0))), ab = !!(CHW.avAbierto && CHW.avAbierto[p.id]);
  return '<div class="chw-avz' + ((av.fin === 'rechazado' || av.fin === 'anulado') ? ' mal' : '') + '" data-avz="' + _chwE(p.id) + '">' +
    '<button type="button" class="chw-avz-bar" data-acc="avance" data-p="' + _chwE(p.id) + '" aria-expanded="' + ab + '" aria-label="Ver los pasos" title="Ver los pasos">' +
    '<span class="chw-avz-riel" aria-hidden="true"><i style="width:' + pct + '%"></i></span><span class="chw-avz-pct">' + pct + '%</span></button>' +
    (ab ? _chwPasosHTML(av) : '') + '</div>';
}
/* el pendiente que ES un trámite: su paso se hace en la app (aquí no se «cumple» suelto: se saltaría la firma o el V°B°) */
function _chwSigueHTML(p, av){
  if(!av || !av.tram || !av.sig || (p.estado && p.estado !== 'abierto')) return '';
  var t = CHW_SIG[av.sig.k]; if(!t) return '';
  var donde = (av.sig.k === 'cotizar' || av.sig.k === 'adjudicar') ? 'en «Requerimientos» de esta web' : 'en la app del celular';
  return '<div class="chw-avz-sigue">Sigue: <b>' + _chwE(t + (av.sig.k === 'visar' && av.sig.t ? ' · ' + av.sig.t : '')) + '</b> (' + donde + ')</div>';
}
function _chwEsTram(p){ var av = _chwAvance(p); return !!(av && av.tram); }
function _chwPenHTML(m){
  var p = m.pendiente; if(!p) return '';
  var av = _chwAvance(p), avTx = av ? _chwBarraHTML(p, av) : '';
  if(p.estado === 'cumplido'){
    return '<div class="chw-pen cumplido"><div class="chw-pen-tag"><span>✅ PENDIENTE CUMPLIDO</span>' +
      (p.cumplido_en ? '<span>' + _chwE(_chwDiaTx(p.cumplido_en) + ' ' + _chwHora(p.cumplido_en)) + '</span>' : '') + '</div>' +
      '<div class="chw-pen-det">Era para: <b>' + _chwE(p.para_mi ? 'ti' : p.asignado_nombre) + '</b></div>' +
      (p.sustento_msj ? '<button type="button" class="chw-pen-ver" data-acc="ver" data-id="' + _chwE(p.sustento_msj) + '">Ver el sustento ↓</button>' : '') + avTx + '</div>';
  }
  var v = _chwVence(p.vence), puede = (p.para_mi || CHW.quien === 'jefe') && !(av && av.tram);
  var herrBox = '';
  if(p.modo === 'prestamo_herr' && p.meta && p.meta.estado_sub === 'prestado'){
    herrBox = '<div class="chw-pen-det">🧰 En préstamo a: <b>' + _chwE(p.meta.cargo_nombre || '') + '</b>' + (p.meta.cargo_dni ? ' (Doc. ' + _chwE(p.meta.cargo_dni) + ')' : '') + '</div>';
  }
  return '<div class="chw-pen abierto' + (v.mal ? ' vencido' : '') + '"><div class="chw-pen-tag"><span>📌 PENDIENTE</span><span>' + _chwE(v.tx) + '</span></div>' +
    '<div class="chw-pen-det">Para: <b>' + _chwE(p.para_mi ? 'ti' : p.asignado_nombre) + '</b></div>' + herrBox +
    (puede ? '<button type="button" class="chw-pen-bt" data-acc="cumplir" data-p="' + _chwE(p.id) + '" data-m="' + _chwE(m.id) + '">✓ Cumplir con foto o texto</button>' : '') +
    _chwSigueHTML(p, av) + avTx + '</div>';
}
function _chwMsjHTML(m){
  var cl = 'chw-m ' + (m.mio ? 'mio' : 'otro') + (m.tipo === 'sustento' ? ' sust' : '') + (m.borrado ? ' borrado' : '') + (m.acuerdo ? ' acu' : '') + (m.pendiente && m.pendiente.estado === 'abierto' ? ' pen' : '');
  var h = '<div class="' + cl + '" data-m="' + _chwE(m.id) + '" id="chw-m-' + _chwE(m.id) + '" tabindex="0">';
  if(!m.mio) h += '<div class="chw-m-autor">' + _chwE(m.autor_nombre || 'Miembro de la obra') + '</div>';
  if(m.borrado) h += '<div class="chw-m-tx chw-m-elim">🚫 Mensaje eliminado</div>';
  else {
    if(m.acuerdo) h += '<div class="chw-m-marca acu">🤝 Acuerdo de obra</div>';
    if(m.tipo === 'sustento') h += '<div class="chw-m-marca sust">✅ Sustento del pendiente</div>';
    if(m.responde) h += '<button type="button" class="chw-m-cita" data-acc="ver" data-id="' + _chwE(m.responde.id) + '"><b>' + _chwE(m.responde.autor_nombre || '') + '</b>' +
      '<span>' + _chwE(m.responde.texto || (m.responde.adjunto ? '📎 ' + m.responde.adjunto : '')) + '</span></button>';
    if(m.adjunto) h += _chwAdjHTML(m.adjunto);
    if(m.texto) h += '<div class="chw-m-tx">' + _chwTexto(m.texto) + '</div>';
    if(m.pendiente) h += _chwPenHTML(m);
  }
  return h + '<div class="chw-m-pie"><span class="chw-m-hora">' + _chwHora(m.creado) + '</span>' + (m.mio ? '<span class="chw-m-check" title="Enviado">✓</span>' : '') + '</div>' +
    (m.borrado ? '' : '<button type="button" class="chw-m-mas" data-acc="menu" data-id="' + _chwE(m.id) + '" aria-label="Opciones del mensaje" title="Opciones">⋯</button>') + '</div>';
}
function _chwPintarFeed(abajo){
  var f = $('chw-feed'); if(!f) return;
  var canal = CHW.activo, L = _chwMsjs(canal), cerca = _chwCerca(f), alto = f.scrollHeight, arriba = f.scrollTop;
  var cola = CHW.cola.filter(function(x){ return x.canal === canal; }), enServidor = {};
  L.forEach(function(m){ if(m.cid) enServidor[m.cid] = 1; });
  var ver = CHW.soloAcu ? L.filter(function(m){ return m.acuerdo && !m.borrado; }) : L;
  var h = '';
  if(CHW.soloAcu) h += '<div class="chw-filtro">Solo los acuerdos de obra · <button type="button" data-acc="acuerdos">Ver todo</button></div>';
  else if(L.length && CHW.viejos[canal] !== false) h += '<button type="button" class="chw-antes" data-acc="antes">Ver mensajes anteriores</button>';
  if(!ver.length && !cola.length) h += '<div class="chw-vacio-feed">' + (CHW.soloAcu ? 'No hay acuerdos marcados.' : 'Todavía no hay mensajes. Escribe el primero.') + '</div>';
  var dia = '';
  ver.forEach(function(m){
    var d = new Date(m.creado), k = isNaN(d) ? '' : _chwDiaK(d);
    if(k && k !== dia){ dia = k; h += '<div class="chw-dia"><span>' + _chwE(_chwDiaTx(m.creado)) + '</span></div>'; }
    h += _chwMsjHTML(m);
  });
  if(!CHW.soloAcu) cola.forEach(function(x){ if(!enServidor[x.cid]) h += _chwColaHTML(x); });
  f.innerHTML = h;
  _chwCargarImgs(f);
  var cab = $('chw-cab'), cn = _chwCanal(canal);
  if(cab && cn){ var tmp = document.createElement('div'); tmp.innerHTML = _chwCabHTML(cn); cab.parentNode.replaceChild(tmp.firstChild, cab); }
  if(CHW.irA){ var id = CHW.irA; CHW.irA = null; setTimeout(function(){ _chwIrA(id); }, 60); return; }
  if(abajo || cerca) f.scrollTop = f.scrollHeight;
  else { f.scrollTop = arriba; var b = $('chw-abajo'); if(b && f.scrollHeight > alto) b.hidden = false; }
}
function _chwIrA(id){
  var el = $('chw-m-' + id);
  if(!el){ toast('Ese mensaje es más antiguo: toca «Ver mensajes anteriores».'); return; }
  try{ el.scrollIntoView({ block:'center', behavior:'smooth' }); }catch(_s){ el.scrollIntoView(); }
  el.classList.add('brilla'); setTimeout(function(){ el.classList.remove('brilla'); }, 1600);
}
function _chwPintarResp(){
  var b = $('chw-resp'); if(!b) return;
  var r = CHW.resp;
  if(!r){ b.hidden = true; b.innerHTML = ''; return; }
  b.hidden = false;
  b.innerHTML = '<div class="chw-resp-tx"><b>Respondiendo a ' + _chwE(r.mio ? 'ti' : r.autor_nombre) + '</b><span>' + _chwE(r.texto || (r.adjunto ? '📎 ' + (r.adjunto.nombre || 'archivo') : '')) + '</span></div>' +
    '<button type="button" class="chw-resp-x" data-acc="sinresp" aria-label="No responder">✕</button>';
}
function _chwMsj(id){ var L = _chwMsjs(CHW.activo); for(var i = 0; i < L.length; i++) if(L[i].id === id) return L[i]; return null; }

/* ── los clics de toda la pantalla ── */
function _chwClic(ev){
  var b = ev.target.closest('[data-filtro],[data-canal],[data-acc]');
  if(ev.target.closest('a[href]')) return;   /* un enlace del mensaje se abre aparte, sin más */
  if(b && b.hasAttribute('data-filtro')){
    CHW.filtro = b.getAttribute('data-filtro'); _chwPintarLado();
    if(CHW.filtro === 'pend') _chwCargarPend().then(function(){ if(_chwAqui()) _chwPintarLado(); });
    return;
  }
  if(b && b.hasAttribute('data-canal')){ _chwAbrir(b.getAttribute('data-canal')); return; }
  if(b){
    var acc = b.getAttribute('data-acc');
    if(acc === 'nuevo') _chwGrupoNuevo();
    else if(acc === 'gestores') _chwGestores();
    else if(acc === 'cumplir'){ var cnl = b.getAttribute('data-c') || CHW.activo; _chwCumplir(cnl, b.getAttribute('data-m'), b.getAttribute('data-p')); }
    else if(acc === 'avance'){ var ap = b.getAttribute('data-p'); CHW.avAbierto = CHW.avAbierto || {}; CHW.avAbierto[ap] = !CHW.avAbierto[ap];
      if(b.closest('#chw-feed')) _chwPintarFeed(false); else _chwPintarLado(); }
    else if(acc === 'verchat'){ CHW.irA = b.getAttribute('data-m'); CHW.filtro = 'grupos'; _chwAbrir(b.getAttribute('data-c')); }
    else if(acc === 'volver'){ CHW.activo = ''; _chwParar(); _chwListaAgendar(); _chwPintarLado(); _chwPintarConv(); }
    else if(acc === 'enviar') chwEnviar();
    else if(acc === 'adjuntar'){ var i = $('chw-archivo'); if(i) i.click(); }
    else if(acc === 'info') _chwInfo(CHW.activo);
    else if(acc === 'acuerdos'){ CHW.soloAcu = !CHW.soloAcu; _chwPintarFeed(!CHW.soloAcu); }
    else if(acc === 'antes'){
      b.disabled = true; b.textContent = 'Cargando…'; var f = $('chw-feed'), alto = f ? f.scrollHeight : 0;
      chwCargarMsjs(CHW.activo, 'antes').then(function(){ _chwPintarFeed(false); if(f) f.scrollTop = f.scrollHeight - alto; },
        function(err){ b.disabled = false; b.textContent = 'Ver mensajes anteriores'; toast(_chwMotivo(err)); });
    }
    else if(acc === 'abajo'){ var fd = $('chw-feed'); if(fd) fd.scrollTop = fd.scrollHeight; b.hidden = true; }
    else if(acc === 'sinresp'){ CHW.resp = null; _chwPintarResp(); }
    else if(acc === 'ver') _chwIrA(b.getAttribute('data-id'));
    else if(acc === 'doc') _chwAbrirArchivo(b.getAttribute('data-ruta'), b.getAttribute('data-nombre'));
    else if(acc === 'menu'){ var r = b.getBoundingClientRect(); _chwMenu(b.getAttribute('data-id'), r.right, r.bottom); }
    else if(acc === 'reintentar'){ var cid = b.getAttribute('data-cid'); CHW.cola.forEach(function(y){ if(y.cid === cid){ delete y.st; delete y.porque; } }); _chwPintarFeed(true); _chwFlush().then(function(){ if(_chwAqui()) _chwPintarFeed(true); }); }
    else if(acc === 'quitar'){ var cq = b.getAttribute('data-cid'); CHW.cola = CHW.cola.filter(function(y){ return y.cid !== cq; }); _chwPintarFeed(false); }
    return;
  }
  /* tocar un mensaje (no un botón suyo): sus opciones */
  if(ev.target.closest('.chw-avz')) return;   /* los pasos del avance se leen: no abren el menú */
  var m = ev.target.closest('.chw-m[data-m]');
  if(m &&!(window.getSelection && String(window.getSelection()).length)) _chwMenu(m.getAttribute('data-m'), ev.clientX, ev.clientY);
}
function _chwTecla(ev){
  if(ev.key === 'Escape' && CHW.menu){ _chwMenuCerrar(); return; }
  var m = ev.target.closest && ev.target.closest('.chw-m[data-m]');
  if(m && ev.target === m && (ev.key === 'Enter' || ev.key === ' ')){ ev.preventDefault(); var r = m.getBoundingClientRect(); _chwMenu(m.getAttribute('data-m'), r.left + 40, r.bottom); }
}
/* arrastrar un archivo al chat abierto */
function _chwSoltarAtar(w){
  var n = 0;
  function hay(ev){ try{ return ev.dataTransfer && Array.prototype.indexOf.call(ev.dataTransfer.types || [], 'Files') > -1; }catch(_e){ return false; } }
  w.addEventListener('dragenter', function(ev){ if(!hay(ev) || !CHW.activo) return; ev.preventDefault(); n++; var s = $('chw-soltar'); if(s) s.hidden = false; });
  w.addEventListener('dragover', function(ev){ if(!hay(ev) || !CHW.activo) return; ev.preventDefault(); try{ ev.dataTransfer.dropEffect = 'copy'; }catch(_d){} });
  w.addEventListener('dragleave', function(ev){ if(!hay(ev)) return; n = Math.max(0, n - 1); if(!n){ var s = $('chw-soltar'); if(s) s.hidden = true; } });
  w.addEventListener('drop', function(ev){
    if(!hay(ev)) return; ev.preventDefault(); n = 0; var s = $('chw-soltar'); if(s) s.hidden = true;
    if(!CHW.activo){ toast('Primero elige el grupo al que lo mandas.'); return; }
    var f = ev.dataTransfer.files && ev.dataTransfer.files[0]; if(f) _chwAdjuntoListo(f);
  });
}

/* ── mandar ── */
function chwEnviar(){
  var inp = $('chw-txt'), canal = CHW.activo; if(!inp || !canal) return;
  var t = String(inp.value || '').replace(/\s+$/, '');
  if(!t.replace(/\s+/g, '')) return;
  if(t.length > 4000){ toast(CHW_MOTIVO.muy_largo); return; }
  var r = CHW.resp, x = { cid:_chwCid(), canal:canal, texto:t, resp:r ? r.id : null, respNom:r ? (r.mio ? 'Tú' : r.autor_nombre) : '', respTx:r ? String(r.texto || '').slice(0, 90) : '', ts:Date.now() };
  CHW.cola.push(x);
  inp.value = ''; _chwAlto(inp); CHW.resp = null; _chwPintarResp();
  _chwPintarFeed(true);
  /* si ya estaba saliendo otro, este sale apenas termine (no espera la vuelta de 4 s) */
  _chwFlush().then(function(){ return CHW.cola.some(function(y){ return y.canal === canal && !y.st; }) ? _chwFlush() : 0; })
    .then(function(){ if(CHW.activo === canal && _chwAqui()){ _chwPintarFeed(true); _chwRefrescarUltimo(canal); } });
}
/* lo último del grupo en la lista, sin esperar la vuelta de 15 s */
function _chwRefrescarUltimo(canal){
  var cn = _chwCanal(canal), L = _chwMsjs(canal), u = L[L.length - 1]; if(!cn || !u) return;
  cn.ultimo = { autor_nombre:u.autor_nombre, mio:u.mio, creado:u.creado, tipo:u.tipo, texto:String(u.texto || '').slice(0, 90), adjunto:u.adjunto ? u.adjunto.nombre : null };
  _chwPintarLado();
}
/* lo elegido se ve antes de mandarlo, con su texto */
function _chwAdjuntoListo(f){
  var canal = CHW.activo, cn = _chwCanal(canal); if(!canal || !f || !cn) return;
  if(_chwEsVideo(f)){ toast(CHW_MOTIVO.video); return; }
  var t = _chwTipo(f); if(!t){ toast(CHW_MOTIVO.tipo); return; }
  if((f.size || 0) > 20 * 1048576 && !/^image\//.test(t)){ toast(CHW_MOTIVO['muy-grande']); return; }
  var esFoto = /^image\/(jpeg|png|webp)$/.test(t), prev = '';
  try{ if(esFoto) prev = URL.createObjectURL(f); }catch(_u){}
  var cuerpo = (esFoto ? (prev ? '<img class="chw-prev" src="' + prev + '" alt="La foto que vas a mandar">' : '') :
      '<div class="chw-prev-doc"><span aria-hidden="true">📄</span><span><b>' + _chwE(f.name || 'archivo') + '</b><small>' + _chwE(_chwTam(f.size)) + '</small></span></div>') +
    '<div class="campo"><label for="chw-env-tx">Texto <span class="tenue">(si quieres)</span></label><textarea id="chw-env-tx" rows="2" maxlength="4000" placeholder="' + (esFoto ? 'Qué se ve y dónde es' : 'Para qué es') + '"></textarea></div>' +
    '<div class="msg" id="chw-env-msg" role="status"></div>';
  abrirHoja(esFoto ? '📸 Mandar la foto' : '📄 Mandar el archivo', 'A «' + cn.nombre + '»', cuerpo,
    '<button type="button" class="bt sec" id="chw-env-no">Cancelar</button><button type="button" class="bt" id="chw-env-si">Enviar ➤</button>', { sinFoco:true });
  var soltar = function(){ try{ if(prev) URL.revokeObjectURL(prev); }catch(_r){} };
  $('chw-env-no').onclick = function(){ soltar(); cerrarHoja(); };
  try{ $('chw-env-tx').focus(); }catch(_f){}
  $('chw-env-tx').addEventListener('keydown', function(ev){ if(ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing){ ev.preventDefault(); $('chw-env-si').click(); } });
  $('chw-env-si').onclick = function(){
    var b = this, tx = String(($('chw-env-tx') || {}).value || '').trim(), m = $('chw-env-msg');
    b.disabled = true; m.className = 'msg gris'; m.textContent = esFoto ? 'Mandando la foto…' : 'Subiendo el archivo…';
    var r = CHW.resp, cid = _chwCid();
    _chwSubir(canal, f).then(function(adj){
      return _chwRpc('sst_chat_enviar', { p_canal:canal, p_texto:tx || '', p_adjunto:adj, p_responde_a:r ? r.id : null, p_cid:cid });
    }).then(function(j){
      soltar(); cerrarHoja();
      if(j.msj) _chwMezclar(canal, [j.msj]);
      CHW.resp = null; _chwPintarResp();
      if(CHW.activo === canal && _chwAqui()){ _chwPintarFeed(true); _chwRefrescarUltimo(canal); }
    }, function(err){ b.disabled = false; m.className = 'msg mal'; m.textContent = _chwMotivo(err); });
  };
}

/* ── tocar un mensaje: sus opciones, al lado ── */
function _chwMenuCerrar(){
  var p = CHW.menu; CHW.menu = null;
  if(p && p.parentNode) p.parentNode.removeChild(p);
  document.removeEventListener('mousedown', _chwMenuFuera, true);
  window.removeEventListener('resize', _chwMenuCerrar);
  var f = $('chw-feed'); if(f) f.removeEventListener('scroll', _chwMenuCerrar);
}
function _chwMenuFuera(ev){ if(CHW.menu && !CHW.menu.contains(ev.target)) _chwMenuCerrar(); }
function _chwMenu(msjId, x, y){
  _chwMenuCerrar();
  var m = _chwMsj(msjId); if(!m) return;
  var canalId = CHW.activo, sup = CHW.quien === 'jefe' || CHW.quien === 'miembro', pen = m.pendiente && m.pendiente.estado === 'abierto' ? m.pendiente : null;
  var o = '';
  if(!m.borrado) o += '<button type="button" role="menuitem" data-op="resp">↩️ Responder</button>';
  if(m.texto && !m.borrado) o += '<button type="button" role="menuitem" data-op="copiar">📋 Copiar el texto</button>';
  if(pen && (pen.para_mi || CHW.quien === 'jefe') && !_chwEsTram(pen)) o +='<button type="button" role="menuitem" data-op="cumplir">✓ Cumplir el pendiente (foto o texto)</button>';
  if(sup && !m.borrado && m.tipo === 'msj') o += '<button type="button" role="menuitem" data-op="pend">📌 ' + (pen ? 'Cambiar a quién o el plazo' : 'Volverlo pendiente y asignarlo') + '</button>';
  if(sup && pen) o += '<button type="button" role="menuitem" data-op="anular">✕ Anular el pendiente</button>';
  if(sup && !m.borrado) o += '<button type="button" role="menuitem" data-op="acuerdo">🤝 ' + (m.acuerdo ? 'Quitar de los acuerdos' : 'Marcar como acuerdo de obra') + '</button>';
  if(!m.borrado && (m.mio || CHW.quien === 'jefe') && !pen) o += '<button type="button" role="menuitem" class="peligro" data-op="borrar">🗑️ Eliminar para todos</button>';
  if(!o) return;
  var p = document.createElement('div'); p.className = 'chw-menu'; p.id = 'chw-menu'; p.setAttribute('role', 'menu');
  p.setAttribute('aria-label', 'Opciones del mensaje'); p.setAttribute('data-sin-sector', ''); p.setAttribute('data-sin-pais', '');
  p.innerHTML = '<div class="chw-menu-de">' + _chwE(m.mio ? 'Tú' : m.autor_nombre) + ' · ' + _chwE(_chwDiaTx(m.creado) + ' ' + _chwHora(m.creado)) + '</div>' + o;
  document.body.appendChild(p); CHW.menu = p;
  var W = window.innerWidth, H = window.innerHeight, r = p.getBoundingClientRect();
  var left = Math.max(8, Math.min((x || 0), W - r.width - 8)), top = (y || 0) + 4;
  if(top + r.height > H - 8) top = Math.max(8, (y || 0) - r.height - 4);
  p.style.left = left + 'px'; p.style.top = top + 'px';
  setTimeout(function(){ document.addEventListener('mousedown', _chwMenuFuera, true); }, 0);
  window.addEventListener('resize', _chwMenuCerrar);
  var f = $('chw-feed'); if(f) f.addEventListener('scroll', _chwMenuCerrar);
  try{ p.querySelector('button').focus(); }catch(_f){}
  p.addEventListener('keydown', function(ev){
    var bs = Array.prototype.slice.call(p.querySelectorAll('button')), i = bs.indexOf(document.activeElement);
    if(ev.key === 'ArrowDown'){ ev.preventDefault(); bs[(i + 1) % bs.length].focus(); }
    else if(ev.key === 'ArrowUp'){ ev.preventDefault(); bs[(i - 1 + bs.length) % bs.length].focus(); }
    else if(ev.key === 'Escape'){ ev.preventDefault(); _chwMenuCerrar(); var el = $('chw-m-' + m.id); if(el) try{ el.focus(); }catch(_e){} }
  });
  p.addEventListener('click', function(ev){
    var b = ev.target.closest('[data-op]'); if(!b) return;
    var op = b.getAttribute('data-op'); _chwMenuCerrar();
    if(op === 'resp'){ CHW.resp = m; _chwPintarResp(); var i = $('chw-txt'); if(i) try{ i.focus(); }catch(_f){} }
    else if(op === 'copiar') _chwCopiar(m.texto);
    else if(op === 'cumplir') _chwCumplir(canalId, m.id, pen.id);
    else if(op === 'pend') _chwPendiente(canalId, m.id);
    else if(op === 'anular') _chwAccion('sst_chat_pend_anular', { p_pend:pen.id }, 'Pendiente anulado');
    else if(op === 'acuerdo') _chwAccion('sst_chat_acuerdo', { p_msj:m.id, p_si:!m.acuerdo }, m.acuerdo ? 'Quitado de los acuerdos' : 'Marcado como acuerdo de obra');
    else if(op === 'borrar'){
      confirmar('¿Eliminar este mensaje?', 'Se borra para todos en el grupo. Queda «Mensaje eliminado».', { si:'Sí, eliminar', mal:true }).then(function(si){
        if(si) _chwAccion('sst_chat_borrar', { p_msj:m.id }, 'Mensaje eliminado');
      });
    }
  });
}
/* lo que devuelve el mensaje cambiado (anular, acuerdo, borrar): se mete y se repinta */
function _chwAccion(fn, a, ok){
  var canal = CHW.activo;
  return _chwRpc(fn, a).then(function(j){
    if(j.msj) _chwMezclar(canal, [j.msj]);
    if(CHW.activo === canal && _chwAqui()) _chwPintarFeed(false);
    if(ok) toast(ok);
    chwCargarCanales().then(function(){ if(_chwAqui()) _chwPintarLado(); });
    return j;
  }, function(err){ toast('No se pudo: ' + _chwMotivo(err)); });
}
function _chwCopiar(txt){
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(String(txt || '')).then(function(){ toast('Texto copiado'); }, function(){ toast('No se pudo copiar: selecciona el texto y usa Ctrl + C.'); }); return; }
  }catch(_e){}
  toast('No se pudo copiar: selecciona el texto y usa Ctrl + C.');
}

/* ── pendiente: a quién y para cuándo ── */
function _chwPersonas(canal, forzar){
  var c = CHW.pers[canal];
  if(c && !forzar && Date.now() - c.ts < 60000) return Promise.resolve(c);
  return _chwRpc('sst_chat_personas', { p_canal:canal }).then(function(j){
    CHW.pers[canal] = { ts:Date.now(), lista:Array.isArray(j.personas) ? j.personas : [], admin:!!j.admin }; return CHW.pers[canal];
  });
}
function _chwIniciales(n){ return String(n || '?').trim().split(/\s+/).slice(0, 2).map(function(w){ return w.charAt(0); }).join('').toUpperCase(); }
function _chwPendiente(canalId, msjId){
  var m = _chwMsj(msjId); if(!m) return;
  var cuerpo = '<div class="chw-hoja-cita">' + _chwE((m.texto || (m.adjunto ? '📎 ' + m.adjunto.nombre : '')).slice(0, 200)) + '</div>' +
    '<div class="campo"><label for="chw-pen-bus">¿Para quién?</label><input type="search" id="chw-pen-bus" placeholder="Busca por nombre" autocomplete="off"></div>' +
    '<div class="chw-gente" id="chw-pen-gente" role="radiogroup" aria-label="Para quién"><p class="ayuda">Cargando a la gente del grupo…</p></div>' +
    '<div class="campo"><label>¿Para cuándo?</label><div class="chw-chips" id="chw-pen-cuando" role="radiogroup" aria-label="Plazo">' +
      '<button type="button" class="chw-chip on" data-v="' + _chwMasDias(0) + '" role="radio" aria-checked="true">Hoy</button>' +
      '<button type="button" class="chw-chip" data-v="' + _chwMasDias(1) + '" role="radio" aria-checked="false">Mañana</button>' +
      '<button type="button" class="chw-chip" data-v="' + _chwMasDias(3) + '" role="radio" aria-checked="false">En 3 días</button>' +
      '<button type="button" class="chw-chip" data-v="" role="radio" aria-checked="false">Sin plazo</button></div></div>' +
    '<div class="campo"><label for="chw-pen-fecha">u otra fecha</label><input type="date" id="chw-pen-fecha" min="' + _chwMasDias(0) + '"></div>' +
    '<div class="msg" id="chw-pen-msg" role="status"></div>';
  abrirHoja('📌 Volverlo pendiente', 'Elige a alguien del grupo y el plazo: le llega a su app y a su número del menú.', cuerpo,
    '<button type="button" class="bt sec" id="chw-pen-no">Cancelar</button><button type="button" class="bt" id="chw-pen-si">Asignar</button>', { clase:'chw-hoja' });
  var elegido = m.pendiente ? m.pendiente.asignado : '', cuando = _chwMasDias(0), gente = [];
  function pintar(){
    var q = String(($('chw-pen-bus') || {}).value || '').toLowerCase().trim(), box = $('chw-pen-gente'); if(!box) return;
    var L = gente.filter(function(x){ return !q || String(x.nombre || '').toLowerCase().indexOf(q) > -1; });
    box.innerHTML = L.length ? L.slice(0, 80).map(function(x){
      return '<button type="button" class="chw-persona' + (x.uid === elegido ? ' on' : '') + '" role="radio" aria-checked="' + (x.uid === elegido) + '" data-uid="' + _chwE(x.uid) + '">' +
        '<span class="chw-ini" aria-hidden="true">' + _chwE(_chwIniciales(x.nombre)) + '</span>' +
        '<span class="chw-pers-tx"><b>' + _chwE(x.nombre) + (x.yo ? ' (tú)' : '') + '</b><small>' + _chwE(CHW_QUIEN[x.quien] || '') + '</small></span></button>';
    }).join('') : '<p class="ayuda">Nadie con ese nombre en este grupo.</p>';
  }
  _chwPersonas(canalId).then(function(c){ gente = c.lista; pintar(); }, function(err){ var box = $('chw-pen-gente'); if(box) box.innerHTML = '<p class="msg mal">' + _chwE(_chwMotivo(err)) + '</p>'; });
  $('chw-pen-bus').addEventListener('input', pintar);
  $('chw-pen-gente').addEventListener('click', function(ev){ var per = ev.target.closest('[data-uid]'); if(per){ elegido = per.getAttribute('data-uid'); pintar(); } });
  $('chw-pen-cuando').addEventListener('click', function(ev){
    var ch = ev.target.closest('.chw-chip'); if(!ch) return;
    cuando = ch.getAttribute('data-v');
    Array.prototype.forEach.call($('chw-pen-cuando').querySelectorAll('.chw-chip'), function(x){ x.classList.toggle('on', x === ch); x.setAttribute('aria-checked', String(x === ch)); });
    var fe = $('chw-pen-fecha'); if(fe) fe.value = '';
  });
  $('chw-pen-no').onclick = cerrarHoja;
  $('chw-pen-si').onclick = function(){
    var b = this, msg = $('chw-pen-msg'), fe2 = $('chw-pen-fecha'), vence = (fe2 && fe2.value) ? fe2.value : cuando;
    if(!elegido){ msg.className = 'msg mal'; msg.textContent = 'Elige a quién se lo asignas.'; return; }
    if(vence && vence < _chwMasDias(0)){ msg.className = 'msg mal'; msg.textContent = CHW_MOTIVO.fecha_pasada; return; }
    b.disabled = true; msg.className = 'msg gris'; msg.textContent = 'Asignando…';
    _chwRpc('sst_chat_pend_crear', { p_msj:m.id, p_asignado:elegido, p_vence:vence || null }).then(function(j){
      if(j.msj) _chwMezclar(canalId, [j.msj]);
      cerrarHoja(); if(CHW.activo === canalId && _chwAqui()) _chwPintarFeed(false);
      var quien = ''; gente.forEach(function(x){ if(x.uid === elegido) quien = x.yo ? 'ti' : x.nombre; });
      toast('Pendiente para ' + (quien || 'esa persona'));
      chwCargarCanales().then(function(){ if(_chwAqui()) _chwPintarLado(); });
    }, function(err){ b.disabled = false; msg.className = 'msg mal'; msg.textContent = _chwMotivo(err); });
  };
}

/* ── cumplir un pendiente: texto y/o foto como sustento ── */
function _chwCumplir(canalId, msjId, pendId){
  var m = null; if(canalId === CHW.activo) m = _chwMsj(msjId);
  if(!pendId && m && m.pendiente) pendId = m.pendiente.id;
  if(!pendId) return;
  var foto = null, prev = '';
  var cuerpo = (m ? '<div class="chw-hoja-cita pen">' + _chwE((m.texto || (m.adjunto ? '📎 ' + m.adjunto.nombre : '')).slice(0, 220)) + '</div>' : '') +
    '<div class="campo"><label for="chw-cum-tx">¿Cómo lo cumpliste?</label><textarea id="chw-cum-tx" rows="3" maxlength="4000" placeholder="Ej.: se señalizó con conos y vigía en la Puerta 2"></textarea></div>' +
    '<div class="campo"><label>Foto de sustento <span class="tenue">(si quieres)</span></label><div class="chw-cum-foto">' +
      '<label class="bt sec chico" for="chw-cum-arch">🖼️ Elegir una foto</label><input type="file" id="chw-cum-arch" accept="image/*" hidden>' +
      '<span class="ayuda">o pégala aquí con Ctrl + V</span></div><div id="chw-cum-prev" class="chw-cum-prev" hidden></div></div>' +
    '<div class="msg gris" id="chw-cum-msg" role="status">Basta con el texto, con la foto o con los dos.</div>';
  abrirHoja('✅ Cumplir el pendiente', 'Queda en el grupo como respuesta, con su sustento.', cuerpo,
    '<button type="button" class="bt sec" id="chw-cum-no">Cancelar</button><button type="button" class="bt" id="chw-cum-si">✓ Marcar cumplido</button>', { clase:'chw-hoja' });
  function tomar(f){
    if(!f) return;
    if(!/^image\//.test(_chwTipo(f))){ var ms = $('chw-cum-msg'); if(ms){ ms.className = 'msg mal'; ms.textContent = 'Elige una foto (JPG o PNG).'; } return; }
    foto = f; try{ if(prev) URL.revokeObjectURL(prev); prev = URL.createObjectURL(f); }catch(_u){ prev = ''; }
    var pv = $('chw-cum-prev');
    if(pv){ pv.hidden = false; pv.innerHTML = (prev ? '<img src="' + prev + '" alt="La foto de sustento">' : '') + '<span>✓ Foto lista</span><button type="button" class="bt sec chico" id="chw-cum-sin">Quitar</button>';
      $('chw-cum-sin').onclick = function(){ foto = null; pv.hidden = true; pv.innerHTML = ''; }; }
  }
  $('chw-cum-arch').addEventListener('change', function(){ var f = this.files && this.files[0]; this.value = ''; tomar(f); });
  $('hoja-cuerpo').addEventListener('paste', function(ev){ var it = ev.clipboardData && ev.clipboardData.files; if(it && it.length && /^image\//.test(it[0].type || '')){ ev.preventDefault(); tomar(it[0]); } });
  $('chw-cum-no').onclick = function(){ try{ if(prev) URL.revokeObjectURL(prev); }catch(_r){} cerrarHoja(); };
  $('chw-cum-si').onclick = function(){
    var b = this, tx = String(($('chw-cum-tx') || {}).value || '').trim(), msg = $('chw-cum-msg');
    if(!tx && !foto){ msg.className = 'msg mal'; msg.textContent = CHW_MOTIVO.falta_sustento; return; }
    b.disabled = true; msg.className = 'msg gris'; msg.textContent = foto ? 'Subiendo la foto…' : 'Guardando…';
    (foto ? _chwSubir(canalId, foto, 'sustento.jpg') : Promise.resolve(null)).then(function(adj){
      return _chwRpc('sst_chat_pend_cumplir', { p_pend:pendId, p_texto:tx || null, p_adjunto:adj, p_cid:_chwCid() });
    }).then(function(j){
      var L = []; if(j.msj) L.push(j.msj); if(j.sustento) L.push(j.sustento);
      if(L.length) _chwMezclar(canalId, L);
      try{ if(prev) URL.revokeObjectURL(prev); }catch(_r){}
      cerrarHoja();
      if(CHW.activo === canalId && _chwAqui()) _chwPintarFeed(true);
      toast('Pendiente cumplido, con su sustento');
      CHW.pendLista = (CHW.pendLista || []).filter(function(x){ return x.id !== pendId; });
      chwCargarCanales().then(function(){ if(_chwAqui()) _chwPintarLado(); });
    }, function(err){ b.disabled = false; msg.className = 'msg mal'; msg.textContent = _chwMotivo(err); });
  };
}

/* ══ LOS GRUPOS: crear, quiénes están, la lista, renombrar, archivar y quién los maneja ═══════════════════════════ */
var CHW_ICONOS = ['💬', '🚧', '🧱', '⚡', '🔧', '🚨', '📋', '👷', '🏗️', '🦺'];
function _chwIconosHTML(sel){
  return '<div class="chw-chips" id="chw-ic" role="radiogroup" aria-label="Ícono">' + CHW_ICONOS.map(function(i){
    return '<button type="button" class="chw-chip ic' + (i === sel ? ' on' : '') + '" data-ic="' + i + '" role="radio" aria-checked="' + (i === sel) + '">' + i + '</button>';
  }).join('') + '</div>';
}
function _chwIconosAtar(al){
  var b = $('chw-ic'); if(!b) return;
  b.addEventListener('click', function(ev){
    var ic = ev.target.closest('[data-ic]'); if(!ic) return;
    Array.prototype.forEach.call(b.querySelectorAll('[data-ic]'), function(x){ x.classList.toggle('on', x === ic); x.setAttribute('aria-checked', String(x === ic)); });
    al(ic.getAttribute('data-ic'));
  });
}
function _chwGenteMarcar(lista, marcados, sinYo){
  return lista.filter(function(x){ return x.quien !== 'trab' && !(sinYo && x.yo); }).map(function(x){
    return '<label class="chw-check"><input type="checkbox" value="' + _chwE(x.uid) + '"' + (marcados[x.uid] ? ' checked' : '') + '>' +
      '<span><b>' + _chwE(x.nombre) + (x.yo ? ' (tú)' : '') + '</b><small>' + _chwE(CHW_QUIEN[x.quien] || '') + '</small></span></label>';
  }).join('') || '<p class="ayuda">No hay más supervisores en la obra todavía.</p>';
}
function _chwCanalObra(){ for(var i = 0; i < CHW.canales.length; i++) if(CHW.canales[i].tipo === 'obra') return CHW.canales[i]; return null; }
function _chwGrupoNuevo(){
  var o = _chwObra(), co = _chwCanalObra(); if(!o || !co) return;
  var icono = '🚧';
  abrirHoja('➕ Crear un grupo', 'Para un frente, una subcontrata o un tema: lo ven solo los que marques (y el jefe de la obra).',
    '<div class="campo"><label for="chw-gn-nom">Nombre</label><input type="text" id="chw-gn-nom" maxlength="60" placeholder="Ej.: Frente Torre B, Subcontrata eléctrica"></div>' +
    '<div class="campo"><label>Ícono</label>' + _chwIconosHTML(icono) + '</div>' +
    '<div class="campo"><label for="chw-gn-desc">Para qué es <span class="tenue">(si quieres)</span></label><input type="text" id="chw-gn-desc" maxlength="200" placeholder="Ej.: encofrado y vaciado de la Torre B"></div>' +
    '<div class="campo"><label>Quiénes van <span class="tenue">(supervisores de la obra)</span></label><div class="chw-gente lista" id="chw-gn-gente"><p class="ayuda">Cargando…</p></div></div>' +
    '<p class="ayuda">Los trabajadores están en el Grupo Obra. El jefe de la obra ve todos los grupos.</p><div class="msg" id="chw-gn-msg" role="status"></div>',
    '<button type="button" class="bt sec" id="chw-gn-no">Cancelar</button><button type="button" class="bt" id="chw-gn-si">Crear el grupo</button>', { clase:'chw-hoja' });
  _chwIconosAtar(function(i){ icono = i; });
  _chwPersonas(co.id).then(function(c){ var b = $('chw-gn-gente'); if(b) b.innerHTML = _chwGenteMarcar(c.lista, {}, true); },
    function(err){ var b = $('chw-gn-gente'); if(b) b.innerHTML = '<p class="msg mal">' + _chwE(_chwMotivo(err)) + '</p>'; });
  $('chw-gn-no').onclick = cerrarHoja;
  $('chw-gn-si').onclick = function(){
    var b = this, nom = String(($('chw-gn-nom') || {}).value || '').trim(), desc = String(($('chw-gn-desc') || {}).value || '').trim(), msg = $('chw-gn-msg');
    if(!nom){ msg.className = 'msg mal'; msg.textContent = CHW_MOTIVO.nombre; return; }
    var ids = Array.prototype.map.call(document.querySelectorAll('#chw-gn-gente input:checked'), function(x){ return x.value; });
    b.disabled = true; msg.className = 'msg gris'; msg.textContent = 'Creando…';
    _chwRpc('sst_chat_canal_crear', { p_emp:o.id, p_nombre:nom, p_icono:icono, p_descripcion:desc || null, p_miembros:ids }).then(function(j){
      cerrarHoja(); toast('Grupo «' + nom + '» creado');
      chwCargarCanales().then(function(){ if(!_chwAqui()) return; CHW.filtro = 'grupos'; if(j.canal && _chwCanal(j.canal)) _chwAbrir(j.canal); else _chwPintarLado(); });
    }, function(err){ b.disabled = false; msg.className = 'msg mal'; msg.textContent = _chwMotivo(err); });
  };
}
function _chwInfo(canalId){
  var cn = _chwCanal(canalId); if(!cn) return;
  var esGrupo = cn.tipo === 'grupo', esObra = cn.tipo === 'obra', icono = cn.icono || '💬', orig = {}, admin = false;
  abrirHoja((cn.icono || '💬') + ' ' + cn.nombre, esGrupo ? (cn.descripcion || 'Grupo de la obra') : (CHW_SUB[cn.tipo] || ''),
    '<div id="chw-info"><p class="ayuda">Cargando a la gente del grupo…</p></div><div class="msg" id="chw-info-msg" role="status"></div>',
    '<span id="chw-info-pie"><button type="button" class="bt sec" id="chw-info-x">Cerrar</button></span>', { clase:'chw-hoja' });
  $('chw-info-x').onclick = cerrarHoja;
  function lectura(L){ return '<div class="chw-gente">' + L.map(function(x){ return '<div class="chw-persona fija"><span class="chw-ini" aria-hidden="true">' + _chwE(_chwIniciales(x.nombre)) + '</span><span class="chw-pers-tx"><b>' + _chwE(x.nombre) + (x.yo ? ' (tú)' : '') + '</b><small>' + _chwE(CHW_QUIEN[x.quien] || '') + '</small></span></div>'; }).join('') + '</div>'; }
  _chwPersonas(canalId, true).then(function(c){
    admin = c.admin;
    var L = c.lista, cuerpo = $('chw-info'); if(!cuerpo) return;
    var conLista = L.some(function(x){ return x.en_lista; });
    L.forEach(function(x){ if(x.en_lista) orig[x.uid] = 1; });
    var h = '';
    if(admin && esGrupo){
      h += '<div class="campo"><label for="chw-ci-nom">Nombre</label><input type="text" id="chw-ci-nom" maxlength="60" value="' + _chwE(cn.nombre) + '"></div>' +
        '<div class="campo"><label>Ícono</label>' + _chwIconosHTML(icono) + '</div>' +
        '<div class="campo"><label for="chw-ci-desc">Para qué es</label><input type="text" id="chw-ci-desc" maxlength="200" value="' + _chwE(cn.descripcion || '') + '"></div>';
    }
    if(esObra){
      var nT = L.filter(function(x){ return x.quien === 'trab'; }).length;
      h += '<p class="ayuda">Aquí está toda la obra: <b>' + (L.length - nT) + '</b> ' + ((L.length - nT) === 1 ? 'supervisor' : 'supervisores') + ' y <b>' + nT + '</b> ' + (nT === 1 ? 'trabajador' : 'trabajadores') + ' con su cuenta. El trabajador entra con su cuenta cuando su ficha está verificada.</p>' + lectura(L);
    } else if(admin){
      if(!esGrupo) h += '<p class="ayuda">' + (conLista ? 'Este grupo tiene lista: lo ven solo los marcados (y el jefe de la obra).' : 'Sin lista, lo ven todos los supervisores de la obra. Si marcas a algunos, lo verán solo ellos (y el jefe de la obra).') + '</p>';
      h += '<div class="campo"><label>Quiénes están</label><div class="chw-gente lista" id="chw-ci-gente">' + _chwGenteMarcar(L, orig, esGrupo) + '</div></div>';
    } else h += lectura(L);
    cuerpo.innerHTML = h;
    _chwIconosAtar(function(i){ icono = i; });
    var pie = $('chw-info-pie');
    if(pie && admin && !esObra){
      pie.innerHTML = (esGrupo ? '<button type="button" class="bt sec peligro" id="chw-ci-arch">Archivar</button>' : '') + '<button type="button" class="bt sec" id="chw-ci-x">Cerrar</button><button type="button" class="bt" id="chw-ci-si">Guardar</button>';
      $('chw-ci-x').onclick = cerrarHoja;
      if($('chw-ci-arch')) $('chw-ci-arch').onclick = function(){
        confirmar('¿Archivar «' + cn.nombre + '»?', 'Nadie lo verá más en la lista. Lo escrito queda guardado.', { si:'Sí, archivar', mal:true }).then(function(si){
          if(!si) return;
          _chwRpc('sst_chat_canal_archivar', { p_canal:canalId }).then(function(){
            cerrarHoja(); toast('Grupo archivado'); CHW.activo = '';
            chwCargarCanales().then(function(){ if(_chwAqui()){ _chwPintarLado(); _chwPintarConv(); } });
          }, function(err){ toast('No se pudo: ' + _chwMotivo(err)); });
        });
      };
      $('chw-ci-si').onclick = function(){
        var b = this, msg = $('chw-info-msg'), agregar = [], quitar = [];
        Array.prototype.forEach.call(document.querySelectorAll('#chw-ci-gente input[type=checkbox]'), function(x){ if(x.checked && !orig[x.value]) agregar.push(x.value); if(!x.checked && orig[x.value]) quitar.push(x.value); });
        b.disabled = true; msg.className = 'msg gris'; msg.textContent = 'Guardando…';
        var pasos = Promise.resolve();
        if(esGrupo){
          var nom = String(($('chw-ci-nom') || {}).value || '').trim(), desc = String(($('chw-ci-desc') || {}).value || '').trim();
          if(!nom){ b.disabled = false; msg.className = 'msg mal'; msg.textContent = CHW_MOTIVO.nombre; return; }
          if(nom !== cn.nombre || desc !== (cn.descripcion || '') || icono !== (cn.icono || '💬'))
            pasos = pasos.then(function(){ return _chwRpc('sst_chat_canal_editar', { p_canal:canalId, p_nombre:nom, p_icono:icono, p_descripcion:desc || null }); });
        }
        if(agregar.length || quitar.length) pasos = pasos.then(function(){ return _chwRpc('sst_chat_lista', { p_canal:canalId, p_agregar:agregar, p_quitar:quitar, p_admins:null }); });
        pasos.then(function(){
          cerrarHoja(); delete CHW.pers[canalId]; toast('Guardado');
          chwCargarCanales().then(function(){ if(!_chwAqui()) return; if(!_chwCanal(canalId)) CHW.activo = ''; _chwPintarLado(); _chwPintarConv(); });
        }, function(err){ b.disabled = false; msg.className = 'msg mal'; msg.textContent = _chwMotivo(err); });
      };
    }
  }, function(err){ var cu = $('chw-info'); if(cu) cu.innerHTML = '<p class="msg mal">' + _chwE(_chwMotivo(err)) + '</p>'; });
}
/* el jefe: a quién más le deja crear y manejar grupos */
function _chwGestores(){
  var o = _chwObra(), co = _chwCanalObra(); if(!o || !co) return;
  abrirHoja('👥 Quién maneja los grupos', 'Además de ti, pueden crear grupos y armar sus listas:',
    '<div class="chw-gente lista" id="chw-cg-gente"><p class="ayuda">Cargando…</p></div><div class="msg" id="chw-cg-msg" role="status"></div>',
    '<button type="button" class="bt" id="chw-cg-ok">Listo</button>', { clase:'chw-hoja' });
  $('chw-cg-ok').onclick = cerrarHoja;
  _chwPersonas(co.id, true).then(function(c){
    var b = $('chw-cg-gente'); if(!b) return;
    var M = c.lista.filter(function(x){ return x.quien === 'miembro'; });
    b.innerHTML = M.length ? M.map(function(x){ return '<label class="chw-check"><input type="checkbox" value="' + _chwE(x.uid) + '"' + (x.gestor ? ' checked' : '') + '><span><b>' + _chwE(x.nombre) + '</b><small>Supervisor</small></span></label>'; }).join('')
      : '<p class="ayuda">Todavía no hay otros supervisores en la obra.</p>';
  }, function(err){ var b = $('chw-cg-gente'); if(b) b.innerHTML = '<p class="msg mal">' + _chwE(_chwMotivo(err)) + '</p>'; });
  $('chw-cg-gente').addEventListener('change', function(ev){
    var x = ev.target; if(!x || x.type !== 'checkbox') return;
    var msg = $('chw-cg-msg'); x.disabled = true;
    _chwRpc('sst_chat_gestor_dar', { p_emp:o.id, p_usuario:x.value, p_si:x.checked }).then(function(){ x.disabled = false; msg.className = 'msg ok'; msg.textContent = 'Guardado.'; delete CHW.pers[co.id]; },
      function(err){ x.disabled = false; x.checked = !x.checked; msg.className = 'msg mal'; msg.textContent = _chwMotivo(err); });
  });
}

/* ══ LAS VUELTAS: lo nuevo del grupo cada 4 s y la lista cada 15 s, solo con el chat a la vista ═══════════════════ */
function _chwParar(){ clearTimeout(CHW.tic); clearTimeout(CHW.ticLista); CHW.tic = null; CHW.ticLista = null; }
function _chwTicAgendar(ms){ clearTimeout(CHW.tic); CHW.tic = setTimeout(_chwTic, ms); }
function _chwTic(){
  CHW.tic = null;
  var canal = CHW.activo;
  if(!canal || !_chwAqui()) return;
  if(document.visibilityState === 'hidden'){ _chwTicAgendar(15000); return; }
  _chwFlush().then(function(n){ return chwCargarMsjs(canal, 'nuevo').then(function(c){ return c + (n || 0); }); }).then(function(cambio){
    if(cambio && CHW.activo === canal && _chwAqui()){ _chwPintarFeed(false); _chwMarcarLeido(); }
  }, function(err){
    /* lo sacaron del grupo (o lo archivaron) mientras lo tenía abierto */
    if(err && err.j && err.j.motivo === 'sin_acceso' && CHW.activo === canal && _chwAqui()){
      toast(CHW_MOTIVO.sin_acceso); CHW.activo = ''; chwCargarCanales().then(function(){ if(_chwAqui()){ _chwPintarLado(); _chwPintarConv(); } });
    }
  }).then(function(){ if(CHW.activo === canal && _chwAqui()) _chwTicAgendar(4000); });
}
function _chwListaAgendar(){
  clearTimeout(CHW.ticLista);
  CHW.ticLista = setTimeout(function(){
    if(!_chwAqui()) return;
    if(document.visibilityState !== 'hidden'){
      _chwFlush();
      chwCargarCanales().then(function(j){
        if(!j || !_chwAqui()) return;
        if(CHW.activo && !_chwCanal(CHW.activo)){ CHW.activo = ''; _chwPintarConv(); }   /* el grupo ya no está (archivado o lo sacaron) */
        if(CHW.filtro === 'pend') return _chwCargarPend().then(function(){ if(_chwAqui()) _chwPintarLado(); });
        _chwPintarLado();
      });
    }
    _chwListaAgendar();
  }, 15000);
}
(function(){
  try{
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible' && _chwAqui() && CHW.activo) _chwTicAgendar(300); });
    window.addEventListener('online', function(){ if(_chwAqui()) _chwFlush().then(function(n){ if(n && CHW.activo) _chwPintarFeed(true); }); });
  }catch(_g){}
})();

/* ── su CSS ── */
function _chwCss(){
  if($('chw-css')) return;
  var s = document.createElement('style'); s.id = 'chw-css';
  s.textContent =
  '.chw{display:grid;grid-template-columns:minmax(260px,340px) minmax(0,1fr);height:calc(100vh - 230px);min-height:520px;background:var(--panel);border:1px solid var(--raya);border-radius:12px;overflow:hidden;box-shadow:var(--sombra);position:relative}' +
  '.chw-lado{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--raya);background:var(--panel)}' +
  '.chw-lado-cab{display:flex;align-items:center;gap:10px;padding:14px 14px 10px}' +
  '.chw-lado-tit{flex:1;min-width:0}.chw-lado-tit b{display:block;color:var(--tinta);font-size:15px}.chw-lado-tit small{display:block;color:var(--gris);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.chw-bt-ic{width:34px;height:34px;flex:none;border-radius:50%;border:1px solid var(--raya);background:var(--panel);color:var(--tinta);font-size:17px;cursor:pointer;display:grid;place-items:center}' +
  '.chw-bt-ic:hover{background:var(--fondo)}' +
  '.chw-tabs{display:flex;gap:6px;padding:0 12px 10px}' +
  '.chw-tab{flex:1;border:1px solid var(--raya);background:var(--panel);color:var(--texto);border-radius:999px;padding:7px 10px;font-size:13px;cursor:pointer;white-space:nowrap}' +
  '.chw-tab.on{background:var(--tinta);border-color:var(--tinta);color:#fff}' +
  '.chw-n{font-variant-numeric:tabular-nums;opacity:.75}.chw-n.si{opacity:1;font-weight:600}' +
  '.chw-items{flex:1;min-height:0;overflow:auto;border-top:1px solid var(--raya)}' +
  '.chw-item{display:flex;gap:10px;width:100%;text-align:left;padding:10px 14px;border:0;border-bottom:1px solid var(--raya);background:none;cursor:pointer;color:inherit;font:inherit}' +
  '.chw-item:hover{background:var(--fondo)}.chw-item.on{background:var(--azul-f)}' +
  '.chw-av{width:40px;height:40px;flex:none;border-radius:50%;background:var(--fondo);border:1px solid var(--raya);display:grid;place-items:center;font-size:19px}' +
  '.chw-it{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}' +
  '.chw-it-1,.chw-it-2{display:flex;align-items:center;gap:6px;min-width:0}' +
  '.chw-it-nom{flex:1;min-width:0;color:var(--tinta);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.chw-it-hora{font-size:12px;color:var(--gris);flex:none;font-variant-numeric:tabular-nums}.chw-it-hora.nl{color:var(--ok);font-weight:600}' +
  '.chw-it-snip{flex:1;min-width:0;font-size:13px;color:var(--gris);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.chw-tag{font-size:10px;font-weight:600;letter-spacing:.04em;border-radius:4px;padding:1px 6px;flex:none}' +
  '.chw-tag.az{background:var(--azul-f);color:var(--azul)}.chw-tag.ok{background:var(--ok-f);color:var(--ok)}.chw-tag.oj{background:var(--ojo-f);color:var(--ojo)}.chw-tag.gr{background:var(--fondo);color:var(--gris)}' +
  '.chw-pill{flex:none;font-size:11.5px;font-weight:600;border-radius:999px;padding:1px 7px;font-variant-numeric:tabular-nums}' +
  '.chw-pill.nl{background:var(--ok);color:#fff}.chw-pill.pen{background:var(--ojo-f);color:var(--ojo)}' +
  '.chw-link{border:0;background:none;color:var(--azul);text-align:left;padding:10px 14px;cursor:pointer;font-size:13px;border-top:1px solid var(--raya)}' +
  '.chw-aviso{margin:12px;padding:12px 14px;border-radius:10px;background:var(--fondo);color:var(--texto);font-size:13.5px}.chw-aviso.mal{background:var(--mal-f);color:var(--mal)}.chw-aviso.suave{background:none;color:var(--gris);padding:8px 2px}' +
  '.chw-vacio{display:flex;flex-direction:column;gap:4px;padding:28px 18px;color:var(--gris);text-align:center}.chw-vacio b{color:var(--tinta)}' +
  '.chw-pend{margin:10px 12px;padding:10px 12px;border:1px solid var(--raya);border-left:3px solid var(--ojo);border-radius:8px;background:var(--panel)}.chw-pend.mal{border-left-color:var(--mal)}' +
  '.chw-pend-cab{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--gris)}.chw-pend.mal .chw-pend-v{color:var(--mal);font-weight:600}' +
  '.chw-pend-tx{margin:4px 0;color:var(--tinta);white-space:pre-wrap;word-break:break-word}.chw-pend-de{font-size:12px;color:var(--gris)}' +
  '.chw-pend-bts{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}' +
  '.chw-conv{display:flex;flex-direction:column;min-height:0;min-width:0;background:#EEF2F5;position:relative}' +
  '.chw-cab{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--panel);border-bottom:1px solid var(--raya)}' +
  '.chw-cab-tx{flex:1;min-width:0}.chw-cab-tx b{display:block;color:var(--tinta);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chw-cab-tx small{display:block;color:var(--gris);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.chw-cab-der{display:flex;align-items:center;gap:8px;flex:none}' +
  '.chw-atras{display:none;border:0;background:none;font-size:26px;line-height:1;color:var(--tinta);cursor:pointer;padding:0 6px 0 0}' +
  '.chw-chip{border:1px solid var(--raya);background:var(--panel);color:var(--texto);border-radius:999px;padding:5px 11px;font-size:12.5px;cursor:pointer}.chw-chip.on{background:var(--tinta);border-color:var(--tinta);color:#fff}' +
  '.chw-chip.ic{font-size:18px;padding:4px 9px}' +
  '.chw-chips{display:flex;flex-wrap:wrap;gap:6px}' +
  '.chw-feed{flex:1;min-height:0;overflow:auto;padding:14px 18px 8px;display:flex;flex-direction:column;gap:6px}' +
  '.chw-dia{text-align:center;margin:8px 0 2px}.chw-dia span{display:inline-block;font-size:12px;color:var(--gris);background:var(--panel);border:1px solid var(--raya);border-radius:999px;padding:2px 10px}' +
  '.chw-antes{align-self:center;border:1px solid var(--raya);background:var(--panel);color:var(--azul);border-radius:999px;padding:5px 12px;font-size:12.5px;cursor:pointer}' +
  '.chw-filtro{align-self:center;font-size:12.5px;color:var(--gris)}.chw-filtro button{border:0;background:none;color:var(--azul);cursor:pointer;padding:0;font-size:12.5px}' +
  '.chw-vacio-feed{margin:auto;color:var(--gris);text-align:center;padding:30px}' +
  '.chw-m{position:relative;max-width:min(560px,78%);background:var(--panel);border:1px solid var(--raya);border-radius:10px;padding:7px 10px 5px;align-self:flex-start;cursor:pointer;box-shadow:0 1px 1px rgba(11,42,58,.04)}' +
  '.chw-m.mio{align-self:flex-end;background:#E3F3EA;border-color:#CBE6D7}' +
  '.chw-m:focus-visible{outline:2px solid var(--azul);outline-offset:1px}' +
  '.chw-m.brilla{box-shadow:0 0 0 3px rgba(245,183,0,.55)}' +
  '.chw-m.borrado{cursor:default;opacity:.8}.chw-m.cola{cursor:default}.chw-m.cola.fallo{border-color:var(--mal)}' +
  '.chw-m.acu{border-left:3px solid var(--azul)}.chw-m.pen{border-left:3px solid var(--ojo)}.chw-m.sust{border-left:3px solid var(--ok)}' +
  '.chw-m-autor{font-size:12.5px;font-weight:600;color:var(--azul);margin-bottom:2px}' +
  '.chw-m-tx{white-space:pre-wrap;word-break:break-word;color:var(--texto)}.chw-m-tx a{color:var(--azul);word-break:break-all}' +
  '.chw-m-elim{color:var(--gris);font-style:italic}' +
  '.chw-m-marca{font-size:11.5px;font-weight:600;margin-bottom:3px}.chw-m-marca.acu{color:var(--azul)}.chw-m-marca.sust{color:var(--ok)}' +
  '.chw-m-cita{display:block;width:100%;text-align:left;border:0;border-left:3px solid var(--azul);background:rgba(11,42,58,.05);border-radius:6px;padding:4px 8px;margin:2px 0 4px;cursor:pointer;font:inherit;color:inherit}' +
  '.chw-m-cita b{display:block;font-size:12px;color:var(--azul)}.chw-m-cita span{display:block;font-size:12.5px;color:var(--gris);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.chw-m-foto{display:block;border:0;padding:0;margin:2px 0 4px;background:none;cursor:zoom-in;border-radius:8px;overflow:hidden}' +
  '.chw-m-foto img{display:block;max-width:min(340px,100%);max-height:300px;min-width:120px;min-height:80px;object-fit:cover;background:var(--fondo)}' +
  '.chw-m-foto img.mal{min-height:40px}' +
  '.chw-m-doc{display:flex;align-items:center;gap:10px;border:1px solid var(--raya);background:rgba(255,255,255,.7);border-radius:8px;padding:8px 10px;margin:2px 0 4px;cursor:pointer;text-align:left;font:inherit;color:inherit;max-width:100%}' +
  '.chw-doc-ic{font-size:22px}.chw-doc-tx{min-width:0}.chw-doc-tx b{display:block;color:var(--tinta);word-break:break-word}.chw-doc-tx small{display:block;color:var(--gris);font-size:12px}' +
  '.chw-m-pie{display:flex;justify-content:flex-end;align-items:center;gap:4px;margin-top:2px}' +
  '.chw-m-hora{font-size:11px;color:var(--gris);font-variant-numeric:tabular-nums}.chw-m-check{font-size:11px;color:var(--ok)}.chw-m-check.espera{color:var(--gris)}' +
  '.chw-m-falla{font-size:12.5px;color:var(--mal);margin-top:4px}.chw-m-falla button{border:0;background:none;color:var(--azul);cursor:pointer;padding:0 0 0 6px;font-size:12.5px;text-decoration:underline}' +
  '.chw-m-mas{position:absolute;top:4px;right:4px;width:26px;height:22px;border:1px solid var(--raya);border-radius:6px;background:var(--panel);color:var(--gris);cursor:pointer;opacity:0;transition:opacity .12s;font-size:14px;line-height:1}' +
  '.chw-m:hover .chw-m-mas,.chw-m:focus-within .chw-m-mas,.chw-m:focus .chw-m-mas{opacity:1}' +
  '@media (hover:none){.chw-m-mas{opacity:1}}' +
  '.chw-pen{margin:6px 0 2px;border-radius:8px;padding:7px 9px;font-size:12.5px}' +
  '.chw-pen.abierto{background:var(--ojo-f);color:#7A4F0E}.chw-pen.vencido{background:var(--mal-f);color:var(--mal)}.chw-pen.cumplido{background:var(--ok-f);color:var(--ok)}' +
  '.chw-pen-tag{display:flex;justify-content:space-between;gap:8px;font-weight:700;font-size:11.5px;letter-spacing:.03em}' +
  '.chw-pen-det{margin-top:2px}.chw-pen-det b{color:inherit}' +
  /* 17/11/2026 · la barra de avance del pendiente (igual que en la app) */
  '.chw-avz{margin-top:6px}.chw-avz-bar{display:flex;align-items:center;gap:8px;width:100%;background:none;border:0;padding:4px 0 2px;margin:0;cursor:pointer;color:inherit;font:inherit}' +
  '.chw-avz-riel{flex:1;height:3px;border-radius:3px;background:rgba(100,116,139,.28);overflow:hidden;display:block}' +
  '.chw-avz-riel i{display:block;height:100%;background:#16A34A;border-radius:3px;transition:width .4s ease}.chw-avz.mal .chw-avz-riel i{background:#DC2626}' +
  '.chw-avz-pct{font-size:11px;font-weight:700;min-width:34px;text-align:right;font-variant-numeric:tabular-nums}' +
  '.chw-avz-pasos{list-style:none;margin:4px 0 2px;padding:0;display:flex;flex-direction:column;gap:5px;font-size:12px;text-align:left}' +
  '.chw-avz-pasos li{display:flex;gap:7px;align-items:flex-start}.chw-avz-ic{width:16px;flex:none;text-align:center;font-weight:700}' +
  '.chw-avz-pasos li.ok .chw-avz-ic{color:#16A34A}.chw-avz-pasos li.sig .chw-avz-ic{color:#D97706}.chw-avz-pasos li.falta,.chw-avz-pasos li.omi{opacity:.62}' +
  '.chw-avz-tx{display:flex;flex-direction:column;gap:1px;min-width:0}.chw-avz-tx small{font-size:11px;opacity:.78}' +
  '.chw-avz-aviso{font-size:12px;margin:4px 0;color:#B45309}.chw-avz-sigue{font-size:12px;margin-top:6px}' +
  '.chw-pen-bt,.chw-pen-ver{margin-top:6px;border:1px solid currentColor;background:var(--panel);color:inherit;border-radius:6px;padding:4px 9px;cursor:pointer;font-size:12.5px;font-weight:600}' +
  '.chw-abajo{position:absolute;right:22px;bottom:86px;border:1px solid var(--raya);background:var(--panel);color:var(--azul);border-radius:999px;padding:6px 12px;cursor:pointer;box-shadow:var(--sombra);z-index:2}' +
  '.chw-resp{display:flex;align-items:center;gap:10px;margin:0 12px;padding:6px 10px;background:var(--panel);border:1px solid var(--raya);border-left:3px solid var(--azul);border-radius:8px 8px 0 0}' +
  '.chw-resp-tx{flex:1;min-width:0}.chw-resp-tx b{display:block;font-size:12px;color:var(--azul)}.chw-resp-tx span{display:block;font-size:12.5px;color:var(--gris);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.chw-resp-x{border:0;background:none;font-size:16px;color:var(--gris);cursor:pointer}' +
  '.chw-barra{display:flex;align-items:flex-end;gap:8px;padding:10px 12px 12px;background:var(--panel);border-top:1px solid var(--raya)}' +
  '.chw-barra textarea{flex:1;min-width:0;resize:none;border:1px solid var(--raya2);border-radius:10px;padding:9px 12px;font:inherit;line-height:1.4;min-height:42px;height:42px;max-height:160px;background:var(--panel);color:var(--texto)}' +
  '.chw-clip{width:40px;height:40px;flex:none;border:1px solid var(--raya);border-radius:50%;background:var(--panel);font-size:18px;cursor:pointer}' +
  '.chw-enviar{width:40px;height:40px;flex:none;border:0;border-radius:50%;background:var(--tinta);color:#fff;font-size:17px;cursor:pointer}' +
  '.chw-enviar:hover{filter:brightness(1.15)}' +
  '.chw-soltar{position:absolute;inset:0;background:rgba(11,42,58,.08);border:2px dashed var(--azul);border-radius:0 12px 12px 0;display:grid;place-items:center;z-index:3;pointer-events:none}' +
  '.chw-soltar span{background:var(--panel);color:var(--tinta);padding:10px 16px;border-radius:10px;box-shadow:var(--sombra);font-weight:600}' +
  '.chw-nada{margin:auto;max-width:440px;padding:30px 24px;text-align:center;color:var(--gris)}.chw-nada-ic{font-size:40px;margin-bottom:6px}' +
  '.chw-nada b{display:block;color:var(--tinta);font-size:16px;margin-bottom:4px}.chw-nada ul{text-align:left;margin:14px 0 0;padding-left:18px;line-height:1.7;font-size:13.5px}' +
  '.chw-menu{position:fixed;z-index:60;min-width:240px;max-width:320px;background:var(--panel);border:1px solid var(--raya);border-radius:10px;box-shadow:0 10px 30px -10px rgba(11,42,58,.35);padding:6px;display:flex;flex-direction:column}' +
  '.chw-menu-de{font-size:12px;color:var(--gris);padding:4px 8px 6px;border-bottom:1px solid var(--raya);margin-bottom:4px}' +
  '.chw-menu button{border:0;background:none;text-align:left;padding:8px 10px;border-radius:6px;cursor:pointer;font:inherit;color:var(--texto)}' +
  '.chw-menu button:hover,.chw-menu button:focus-visible{background:var(--fondo)}.chw-menu button.peligro{color:var(--mal)}' +
  '.chw-hoja-cita{background:var(--fondo);border-left:3px solid var(--azul);border-radius:6px;padding:8px 10px;margin-bottom:12px;white-space:pre-wrap;word-break:break-word}.chw-hoja-cita.pen{border-left-color:var(--ojo)}' +
  '.chw-gente{display:flex;flex-direction:column;gap:4px;max-height:300px;overflow:auto;margin-bottom:12px}' +
  '.chw-persona{display:flex;align-items:center;gap:10px;border:1px solid var(--raya);border-radius:8px;background:var(--panel);padding:7px 10px;cursor:pointer;text-align:left;font:inherit;color:inherit}' +
  '.chw-persona.on{border-color:var(--tinta);background:var(--azul-f)}.chw-persona.fija{cursor:default}' +
  '.chw-ini{width:32px;height:32px;flex:none;border-radius:50%;background:var(--tinta);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:600}' +
  '.chw-pers-tx b{display:block;color:var(--tinta)}.chw-pers-tx small{display:block;color:var(--gris);font-size:12px}' +
  '.chw-check{display:flex;align-items:center;gap:10px;padding:6px 4px;cursor:pointer}.chw-check b{display:block;color:var(--tinta)}.chw-check small{display:block;color:var(--gris);font-size:12px}' +
  '.chw-prev{display:block;max-width:100%;max-height:320px;border-radius:8px;margin:0 auto 12px}' +
  '.chw-prev-doc{display:flex;align-items:center;gap:12px;border:1px solid var(--raya);border-radius:8px;padding:12px;margin-bottom:12px;font-size:24px}.chw-prev-doc b{display:block;font-size:14px;color:var(--tinta);word-break:break-word}.chw-prev-doc small{display:block;font-size:12px;color:var(--gris)}' +
  '.chw-cum-foto{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
  '.chw-cum-prev{display:flex;align-items:center;gap:10px;margin-top:8px}.chw-cum-prev img{width:90px;height:68px;object-fit:cover;border-radius:6px}' +
  '.bt.peligro{color:var(--mal);border-color:var(--mal)}' +
  '@media (max-width:900px){' +
    '.chw{grid-template-columns:1fr;height:calc(100vh - 190px);min-height:460px}' +
    '.chw .chw-conv{display:none}.chw.con-chat .chw-conv{display:flex}.chw.con-chat .chw-lado{display:none}' +
    '.chw-atras{display:block}.chw-m{max-width:88%}.chw-soltar{border-radius:12px}' +
  '}';
  document.head.appendChild(s);
}
