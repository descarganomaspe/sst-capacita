/* ══ ASISTENTE DE PLAN · la web (15/10/2026, lote 12) ═════════════════
   Lo común (las preguntas, cómo decide, el WhatsApp y los turnos) es
   asistente-base.js, el MISMO archivo de la app: armar.py lo mete en el
   index del portal. Aquí, lo de la web:
   · el aviso de arriba «¿Qué plan te conviene?» (el de planwAvisoPintar,
     después de «Completa tus datos»), para el dueño: sale si la cuenta
     no respondió (ni aquí ni en la app), se cierra con la × y vuelve UNA
     vez a los 2 días;
   · el cajón con las preguntas (una por vez), el resultado con su porqué,
     el WhatsApp con sus respuestas ya escritas y la reunión de 15 minutos
     por Google Meet (sábado 2–6 pm y domingo 10 am–6 pm, hora de Perú);
   · en «Mi plan», arriba: lo que le salió, «Ver por qué» y «Responder de
     nuevo» (portal/plan.js lo pide con aplwMiPlanHTML).
   Lo carga el portal al abrir una obra (cargarAplW); se sella su versión
   en armar.py (APLW_VER). */
/* callar: en esta sesión ya vio el recuadro en «Mi plan», o ya cerró o usó otro aviso de arriba: la nube no sale (un aviso por vez) */
var APLW = { m:null, uid:'', t:0, trayendo:null, r:{}, R:null, hist:[], vista:'preg', ocupados:null, turno:null, msg:'', yendo:false, callar:false };

function _aplwDueno(){ return !!(YO && (YO.dueno || YO.rol === 'lider')) && !YO.central; }
function _aplwUid(){ return (typeof TOK !== 'undefined' && TOK && TOK.uid) || ''; }
/* lo que dice el servidor de esta cuenta (una vez por sesión, o cuando se pide) */
function aplwMioTraer(forzar){
  var u = _aplwUid(); if(!u) return Promise.resolve(null);
  if(!forzar && APLW.m && APLW.uid === u && Date.now() - APLW.t < 3600000) return Promise.resolve(APLW.m);
  if(APLW.trayendo) return APLW.trayendo;
  APLW.trayendo = sbRpc('sst_asistente_mio', {}).then(function(m){
    APLW.trayendo = null;
    if(m && m.ok){ APLW.m = m; APLW.uid = u; APLW.t = Date.now(); }
    return APLW.m;
  }, function(cod){
    APLW.trayendo = null;
    /* el servidor todavía no tiene el asistente (el SQL sin correr): no se muestra nada */
    if(cod === 404){ APLW.m = { ok:false, falta:true }; APLW.uid = u; APLW.t = Date.now(); }
    return APLW.m;
  });
  return APLW.trayendo;
}
/* al abrir una obra (lo llama el portal): si toca, el aviso de arriba */
function aplwAlElegir(){
  if(!_aplwDueno()) return;
  aplwMioTraer(false).then(function(){
    try{ planwAvisoPintar(); }catch(_p){}
    /* «Mi plan» ya abierto: su recuadro del asistente */
    try{ if(typeof plwRepintar === 'function') plwRepintar(); }catch(_r){}
  });
}
/* lo que planwAvisoPintar muestra arriba (null = nada) */
function aplwAvisoQue(){
  var u = _aplwUid(), m = APLW.m;
  /* en «Mi plan» está su recuadro (aplwMiPlanHTML); y no, una detrás de otro aviso que acaba de cerrar o usar; dentro de la
     app instalada tampoco: allí ya está su nube (asistente-plan.js) */
  if(APLW.callar || (typeof VISTA !== 'undefined' && VISTA.actual === 'plan')) return null;
  if(typeof instEquipo === 'function' && instEquipo() === 'app') return null;
  /* la obra que tiene su plan por OBRASST Central no elige plan (como el aviso del plan: planwAvisoQue) */
  try{ if(typeof planwEstado === 'function' && YO && YO.obra && planwEstado().cadena) return null; }catch(_c){}
  if(!u || APLW.uid !== u || !m || m.ok === false || !_aplwDueno() || !aplNubeToca(m)) return null;
  return { k:'apl', id:'apl-' + u, cl:'apl', dura:2, ir:function(){ aplwAbrir(); }, bt:'Responder',
           alCerrar:aplwNubeCerrar,
           h:'<b>¿Qué plan te conviene?</b> Responde este breve cuestionario y te decimos cuál, y por qué. Es un minuto.' };
}
function aplwNubeCerrar(){
  if(APLW.m){ APLW.m.cerrada_veces = (APLW.m.cerrada_veces || 0) + 1; APLW.m.cerrada_en = new Date().toISOString(); }
  sbRpc('sst_asistente_nube', { p_accion:'cerrar' }).then(null, function(){});
}

/* ── el cajón ── */
function aplwAbrir(){
  APLW.r = {}; APLW.R = null; APLW.hist = []; APLW.vista = 'preg'; APLW.msg = ''; APLW.turno = null;
  _aplwCajon();
}
function aplwVerResultado(){
  var m = APLW.m;
  if(!m || !m.respondido){ aplwAbrir(); return; }
  APLW.r = Object.assign({}, m.respuestas || {}); delete APLW.r.v;
  APLW.R = aplDecidir(APLW.r); APLW.hist = []; APLW.vista = 'res'; APLW.msg = '';
  _aplwCajon();
}
function _aplwCajon(){
  _aplwCss();
  if(!(typeof HOJA !== 'undefined' && HOJA.abierta && HOJA.id === 'apl')) abrirHoja('¿Qué plan te conviene?', 'Unas preguntas y te decimos cuál, y por qué', '<div id="aplw"></div>', '', { id:'apl', clase:'aplw-hoja' });
  aplwPintar();
}
function aplwPintar(){
  var c = $('aplw'); if(!c) return;
  var v = APLW.vista, h = '';
  if(v === 'preg') h = _aplwPregHTML();
  else if(v === 'res') h = _aplwResHTML();
  else if(v === 'turnos') h = _aplwTurnosHTML();
  else if(v === 'form') h = _aplwFormHTML();
  else if(v === 'listo') h = _aplwListoHTML();
  c.innerHTML = h;
  _aplwAtar(c);
  if(v === 'form') _aplwFormPreparar();
  try{ var hc = $('hoja-cuerpo'); if(hc) hc.scrollTop = 0; }catch(_s){}
}
/* los botones: data-apl="acción" y data-v */
function _aplwAtar(c){
  Array.prototype.forEach.call(c.querySelectorAll('[data-apl]'), function(b){
    b.onclick = function(){
      var a = b.getAttribute('data-apl'), v = b.getAttribute('data-v') || '';
      if(a === 'resp') aplwResponder(b.getAttribute('data-k'), v);
      else if(a === 'atras') aplwAtras();
      else if(a === 'salir') cerrarHoja();
      else if(a === 'planes'){ cerrarHoja(); navegar('plan'); }
      else if(a === 'turnos') aplwTurnosAbrir();
      else if(a === 'wa') aplwWhatsApp();
      else if(a === 'turno'){ APLW.turno = v; APLW.vista = 'form'; APLW.msg = ''; aplwPintar(); }
      else if(a === 'pedir') aplwPedir();
      else if(a === 'res'){ APLW.vista = 'res'; aplwPintar(); }
      else if(a === 'cal') aplwCalendario();
      else if(a === 'cancelar') aplwCancelar(+v);
      else if(a === 'otra') aplwAbrir();
    };
  });
}
function _aplwPregHTML(){
  var k = aplSiguiente(APLW.r);
  if(!k){ APLW.vista = 'res'; return _aplwResHTML(); }
  var P = APL_PREG[k], av = Math.round(aplAvance(APLW.r) * 100);
  var h = '<div class="aplw-barra" aria-hidden="true"><i style="width:' + Math.max(6, av) + '%"></i></div>' +
          '<h3 class="aplw-t">' + esc(P.t) + '</h3>' + (P.ayuda ? '<p class="sub">' + esc(P.ayuda) + '</p>' : '') +
          '<div class="aplw-ops' + (P.op.length > 3 && !P.op[0][2] ? ' dos' : '') + '">';
  P.op.forEach(function(o){
    h += '<button type="button" class="aplw-op" data-apl="resp" data-k="' + k + '" data-v="' + esc(o[0]) + '"><b>' + esc(o[1]) + '</b>' + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</button>';
  });
  h += '</div><div class="aplw-pie">' + (APLW.hist.length ? '<button type="button" class="bt sec chico" data-apl="atras">‹ Atrás</button>' : '<span></span>') +
       '<button type="button" class="bt sec chico" data-apl="salir">Ahora no</button></div>';
  return h;
}
function aplwResponder(k, v){
  if(!APL_PREG[k]) return;
  APLW.hist.push(k); APLW.r[k] = v;
  if(!aplSiguiente(APLW.r)){
    APLW.R = aplDecidir(APLW.r); APLW.vista = 'res';
    var g = aplParaGuardar(APLW.r, APLW.R);
    if(APLW.m && APLW.m.ok !== false){ APLW.m.respondido = true; APLW.m.respuestas = g.resp; APLW.m.plan = g.plan; }
    sbRpc('sst_asistente_guardar', { p_resp:g.resp, p_plan:g.plan, p_porque:g.porque, p_origen:'web' }).then(function(m){
      if(m && m.ok){ APLW.m = m; APLW.uid = _aplwUid(); APLW.t = Date.now(); }
      try{ planwAvisoPintar(); }catch(_p){}
      try{ if(typeof plwRepintar === 'function') plwRepintar(); }catch(_r){}
    }, function(){ toast('No se pudo guardar tu respuesta: revisa tu conexión.'); });
  }
  aplwPintar();
}
function aplwAtras(){
  var k = APLW.hist.pop(); if(k) delete APLW.r[k];
  var vale = {}; APLW.hist.forEach(function(x){ vale[x] = 1; });
  Object.keys(APLW.r).forEach(function(x){ if(!vale[x]) delete APLW.r[x]; });
  APLW.vista = 'preg'; APLW.R = null; aplwPintar();
}
function _aplwPrecioHTML(R){
  if(!R || R.tipo !== 'plan' || !R.plan || R.plan === 'lite') return '';
  /* afuera del Perú el precio se ve en «Mi plan», en su moneda */
  try{ if(typeof paisDelPagoP === 'function' && paisDelPagoP() !== 'pe') return ''; }catch(_p){}
  var P = aplPlan(R.plan); if(!P || !P.m) return '';
  var mil = function(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
  return '<p class="aplw-precio" data-sin-pais><b>S/ ' + mil(P.m) + '</b> al mes' + (P.a ? ' · o <b>S/ ' + mil(P.a) + '</b> al año (pagas 10 meses)' : '') + '</p>';
}
function _aplwResHTML(){
  var R = APLW.R || aplDecidir(APLW.r), m = APLW.m || {};
  var h = '<div class="aplw-res"><span class="aplw-k">Lo que te conviene</span><h3 class="aplw-n">' + esc(R.nombre) + '</h3>' + _aplwPrecioHTML(R) + '<ul>';
  (R.porque || []).forEach(function(x){ h += '<li>' + esc(x) + '</li>'; });
  h += '</ul>' + (R.nota ? '<p class="sub">' + esc(R.nota) + '</p>' : '') + '</div>';
  var re = m.reunion;
  if(re && re.inicio){
    h += '<div class="aviso aplw-tuya"><b>Tu reunión:</b> ' + esc(aplCuando(re.inicio)) + '<br><small>Te escribimos por WhatsApp con el enlace de Google Meet.</small>' +
         '<div class="aplw-bts2"><button type="button" class="bt sec chico" data-apl="turnos">Cambiar el turno</button>' +
         '<button type="button" class="bt sec chico" data-apl="cancelar" data-v="' + (+re.id) + '">Cancelarla</button></div></div>';
  }
  h += '<div class="aplw-bts">';
  var paga = R.tipo === 'plan' && R.plan !== 'lite';
  if(paga) h += '<button type="button" class="bt" data-apl="planes">Ver los planes</button>';
  if(!(re && re.inicio)) h += '<button type="button" class="bt' + (paga ? ' sec' : '') + '" data-apl="turnos">📅 Reunión de 15 minutos por Google Meet</button>';
  h += '<button type="button" class="bt sec" data-apl="wa">💬 Escríbenos por WhatsApp</button></div>' +
       '<p class="sub aplw-otra">¿Algo cambió? <button type="button" class="aplw-link" data-apl="otra">Responder de nuevo</button></p>';
  return h;
}
function aplwWhatsApp(){
  var u = aplEnlaceWA(APLW.r, APLW.R || aplDecidir(APLW.r));
  try{ window.open(u, '_blank', 'noopener'); }catch(_e){}
  sbRpc('sst_asistente_nube', { p_accion:'wa' }).then(null, function(){});
}
function aplwTurnosAbrir(){
  APLW.vista = 'turnos'; APLW.ocupados = null; aplwPintar();
  sbRpc('sst_reunion_turnos', {}).then(function(o){
    APLW.ocupados = (o && o.ok) ? (o.ocupados || []) : [];
    if(APLW.vista === 'turnos') aplwPintar();
  }, function(){ APLW.ocupados = false; if(APLW.vista === 'turnos') aplwPintar(); });
}
function _aplwTurnosHTML(){
  var h = '<h3 class="aplw-t">Elige tu turno</h3><p class="sub">15 minutos por Google Meet, en hora de Perú: los sábados de 2 a 6 pm y los domingos de 10 am a 6 pm.</p>';
  if(APLW.msg) h += '<div class="aviso mal aplw-msg">' + esc(APLW.msg) + '</div>';
  if(APLW.ocupados === null) return h + '<p class="sub">Buscando los turnos libres…</p>';
  if(APLW.ocupados === false) return h + '<div class="aviso">No hay conexión. Inténtalo de nuevo o escríbenos por WhatsApp.</div>' +
    '<div class="aplw-bts"><button type="button" class="bt" data-apl="turnos">Intentar de nuevo</button><button type="button" class="bt sec" data-apl="wa">💬 Escríbenos por WhatsApp</button></div>';
  var oc = {}; (APLW.ocupados || []).forEach(function(x){ oc[String(x).slice(0, 16)] = 1; });
  var T = aplTurnos(Date.now()), dias = [], por = {};
  T.forEach(function(t){ if(!por[t.dia]){ por[t.dia] = []; dias.push(t.dia); } por[t.dia].push(t); });
  dias.forEach(function(d){
    h += '<div class="aplw-dia"><b class="aplw-dia-n">' + esc(aplDiaLargo(d)) + '</b><div class="aplw-horas">';
    por[d].forEach(function(t){
      var o = !!oc[t.ini.slice(0, 16)];
      h += '<button type="button" class="aplw-hora' + (o ? ' ocupado' : '') + '"' + (o ? ' disabled title="Ocupado"' : ' data-apl="turno" data-v="' + t.ini + '"') + '>' + esc(t.hora) + '</button>';
    });
    h += '</div></div>';
  });
  return h + '<div class="aplw-bts"><button type="button" class="bt sec" data-apl="res">‹ Volver</button></div>';
}
function _aplwFormHTML(){
  return '<h3 class="aplw-t">Tu reunión</h3><p class="aplw-cuando">' + esc(aplCuando(APLW.turno)) + '</p><p class="sub">Te escribimos por WhatsApp con el enlace de Google Meet.</p>' +
    (APLW.msg ? '<div class="aviso mal aplw-msg">' + esc(APLW.msg) + '</div>' : '') +
    '<label class="campo"><span>Tu nombre</span><input id="aplw-nom" maxlength="80" autocomplete="name"></label>' +
    '<label class="campo"><span>Tu WhatsApp</span></label><div class="aplw-cel"><select id="aplw-cel-pais" aria-label="País del celular"></select><input id="aplw-cel" inputmode="tel" autocomplete="tel" maxlength="20" aria-label="Tu WhatsApp"></div>' +
    '<label class="campo"><span>¿Qué te gustaría saber? (opcional)</span><textarea id="aplw-nota" rows="2" maxlength="300"></textarea></label>' +
    '<div class="aplw-bts"><button type="button" class="bt" id="aplw-pedir" data-apl="pedir">Pedir la reunión</button><button type="button" class="bt sec" data-apl="turnos">‹ Otro turno</button></div>';
}
function _aplwFormPreparar(){
  var md = (typeof TOK !== 'undefined' && TOK && TOK.md) || {};
  var nom = ''; try{ nom = regNombreCompleto(md.nombres || '', md.apellidos || '') || md.nombre || (TOK && TOK.nombre) || ''; }catch(_n){}
  var pais = md.cel_pais || (typeof _celPaisWeb === 'function' ? _celPaisWeb() : 'pe');
  var s = $('aplw-cel-pais'), i = $('aplw-cel');
  if(s){ s.innerHTML = celOpciones(pais); s.onchange = function(){ if(i) i.placeholder = celPais(s.value).ej; }; }
  if(i){ i.placeholder = celPais(pais).ej; if(md.cel) i.value = celNacional(md.cel, pais); }
  if($('aplw-nom') && !$('aplw-nom').value) $('aplw-nom').value = nom;
}
function aplwPedir(){
  if(APLW.yendo) return;
  var nom = String(($('aplw-nom') || {}).value || '').replace(/\s+/g, ' ').trim(), cel0 = ($('aplw-cel') || {}).value || '';
  var v = celValidar(($('aplw-cel-pais') || {}).value || 'pe', cel0), nota = String(($('aplw-nota') || {}).value || '').trim().slice(0, 300);
  var repinta = function(msg){ APLW.msg = msg; aplwPintar(); if($('aplw-nom')) $('aplw-nom').value = nom; if($('aplw-cel')) $('aplw-cel').value = cel0; if($('aplw-nota')) $('aplw-nota').value = nota; };
  if(nom.length < 3){ repinta('Escribe tu nombre.'); return; }
  if(!v.ok){ repinta(v.msg); return; }
  APLW.yendo = true; var b = $('aplw-pedir'); if(b){ b.disabled = true; b.textContent = 'Pidiendo…'; }
  sbRpc('sst_reunion_pedir', { p_inicio:APLW.turno, p_nombre:nom, p_whatsapp:v.e164, p_nota:nota, p_origen:'web' }).then(function(r){
    APLW.yendo = false;
    if(r && r.ok){
      if(APLW.m) APLW.m.reunion = { id:r.id, inicio:APLW.turno, estado:'nueva' };
      APLW.vista = 'listo'; APLW.msg = ''; aplwPintar(); return;
    }
    var e = r && r.error;
    if(e === 'ocupado'){ aplwTurnosAbrir(); APLW.msg = 'Ese turno se acaba de ocupar. Elige otro.'; return; }
    repinta(e === 'turno' ? 'Ese turno ya no está disponible. Elige otro.' : (e === 'muchos' ? 'Ya pediste varias veces hoy. Escríbenos por WhatsApp.' :
            (e === 'whatsapp' ? 'Revisa tu número de WhatsApp.' : (e === 'nombre' ? 'Escribe tu nombre.' : 'No se pudo pedir la reunión. Inténtalo de nuevo.'))));
  }, function(){ APLW.yendo = false; repinta('No hay conexión: inténtalo de nuevo.'); });
}
function _aplwListoHTML(){
  return '<div class="aplw-res aplw-ok"><span class="aplw-k">✓ Reunión pedida</span><h3 class="aplw-n">' + esc(aplCuando(APLW.turno)) + '</h3>' +
    '<p class="sub">Te escribimos por WhatsApp con el enlace de Google Meet. Si no puedes, cambia el turno desde aquí.</p></div>' +
    '<div class="aplw-bts"><button type="button" class="bt" data-apl="cal">📅 Agregar a mi Google Calendar</button><button type="button" class="bt sec" data-apl="res">Ver mi resultado</button>' +
    '<button type="button" class="bt sec" data-apl="salir">Listo</button></div>';
}
function aplwCalendario(){
  try{ window.open(aplEnlaceCalendario(APLW.turno, APLW.R || aplDecidir(APLW.r)), '_blank', 'noopener'); }catch(_e){}
}
function aplwCancelar(id){
  confirmar('¿Cancelar la reunión?', 'El turno queda libre para otra persona. Puedes pedir otro cuando quieras.', { si:'Cancelar la reunión', no:'Volver' }).then(function(si){
    if(!si) return;
    sbRpc('sst_reunion_cancelar', { p_id:id }).then(function(r){
      if(r && r.ok){ if(APLW.m) APLW.m.reunion = null; APLW.vista = 'res'; _aplwCajon(); }
      else toast('Esa reunión ya pasó o ya estaba cancelada.');
    }, function(){ toast('No hay conexión: inténtalo de nuevo.'); });
  });
}

/* ── en «Mi plan», arriba (portal/plan.js) ── */
function aplwMiPlanHTML(){
  var m = APLW.m;
  if(!_aplwDueno() || !m || m.ok === false || APLW.uid !== _aplwUid()) return '';
  APLW.callar = true;
  if(!m.respondido){
    return '<div class="aplw-mi" id="aplw-mi"><span class="aplw-mi-ic" aria-hidden="true">🧭</span><div><b>¿No sabes qué plan te conviene?</b>' +
           '<p class="sub">Responde unas preguntas y te decimos cuál, y por qué.</p><div class="aplw-bts2"><button type="button" class="bt sec chico" data-aplmi="abrir">Responder</button></div></div></div>';
  }
  var r = Object.assign({}, m.respuestas || {}); delete r.v;
  var R = aplDecidir(r);
  return '<div class="aplw-mi" id="aplw-mi"><span class="aplw-mi-ic" aria-hidden="true">🧭</span><div><b>Según lo que respondiste, te conviene ' + esc(R.nombre) + '</b>' +
         '<p class="sub">' + esc((R.porque || [])[0] || '') + '</p><div class="aplw-bts2"><button type="button" class="bt sec chico" data-aplmi="ver">Ver por qué</button>' +
         '<button type="button" class="bt sec chico" data-aplmi="abrir">Responder de nuevo</button></div></div></div>';
}
function aplwMiPlanAtar(caja){
  _aplwCss();
  Array.prototype.forEach.call((caja || document).querySelectorAll('[data-aplmi]'), function(b){
    b.onclick = function(){ if(b.getAttribute('data-aplmi') === 'ver') aplwVerResultado(); else aplwAbrir(); };
  });
}

function _aplwCss(){
  if($('aplw-css')) return;
  var s = document.createElement('style'); s.id = 'aplw-css';
  s.textContent =
    '.plan-av.apl{background:#FFF8E1;border-color:#F0D58A}' +
    '.aplw-barra{height:6px;border-radius:99px;background:var(--raya);overflow:hidden;margin:2px 0 16px}.aplw-barra i{display:block;height:100%;background:var(--casco);border-radius:99px}' +
    '.aplw-t{font-size:19px;margin:0 0 6px;line-height:1.3}.aplw-ops{display:grid;gap:8px;margin:14px 0}.aplw-ops.dos{grid-template-columns:1fr 1fr}' +
    '.aplw-op{display:block;width:100%;text-align:left;padding:12px 14px;border:1px solid var(--raya2);border-radius:10px;background:var(--panel);color:var(--texto);font:inherit;cursor:pointer}' +
    '.aplw-op:hover,.aplw-op:focus-visible{border-color:var(--tinta)}.aplw-op b{display:block;font-weight:600}.aplw-op small{display:block;color:var(--gris);font-size:12.5px;margin-top:2px}' +
    '.aplw-pie{display:flex;justify-content:space-between;gap:8px}' +
    '.aplw-res{padding:14px 16px;border:1px solid #F0D58A;border-left:4px solid var(--casco);border-radius:10px;background:#FFFCF2;margin:0 0 14px}' +
    '.aplw-k{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ojo);font-weight:600}.aplw-n{font-size:22px;margin:4px 0 6px}' +
    '.aplw-res ul{margin:6px 0 2px;padding-left:20px}.aplw-res li{margin:4px 0}.aplw-precio{margin:0 0 6px;color:var(--gris)}.aplw-precio b{color:var(--tinta)}' +
    '.aplw-ok{border-color:#BFE3CF;border-left-color:var(--ok);background:var(--ok-f)}.aplw-ok .aplw-k{color:var(--ok)}' +
    '.aplw-bts{display:grid;gap:8px;margin:12px 0}.aplw-bts .bt{width:100%}.aplw-bts2{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}' +
    '.aplw-otra{text-align:center}.aplw-link{background:none;border:0;color:var(--azul);text-decoration:underline;font:inherit;cursor:pointer;padding:0}' +
    '.aplw-tuya{margin:0 0 12px}.aplw-cuando{font-weight:600;font-size:16px;margin:2px 0 6px}' +
    '.aplw-dia{margin:12px 0 4px}.aplw-dia-n{display:inline-block}.aplw-dia-n::first-letter{text-transform:uppercase}' +
    '.aplw-horas{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:6px;margin-top:6px}' +
    '.aplw-hora{padding:8px 4px;border:1px solid var(--raya2);border-radius:8px;background:var(--panel);font:inherit;font-size:13px;cursor:pointer;color:var(--texto)}' +
    '.aplw-hora:hover{border-color:var(--tinta)}.aplw-hora.ocupado{opacity:.4;text-decoration:line-through;cursor:default}' +
    '.aplw-cel{display:flex;gap:8px;margin-bottom:10px}.aplw-cel select{flex:0 0 40%}.aplw-cel input{flex:1;min-width:0}.aplw-msg{margin:8px 0}' +
    '.aplw-mi{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border:1px solid #F0D58A;border-radius:12px;background:#FFFCF2;margin:0 0 16px}' +
    '.aplw-mi-ic{font-size:22px;line-height:1}.aplw-mi .sub{margin:3px 0 0}';
  document.head.appendChild(s);
}
