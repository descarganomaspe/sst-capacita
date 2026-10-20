/* OBRASST · lo que «lo de campo, también en la web» (portal/campo.js) toma de la app: las cuentas del tareo (las horas
   de cada uno, el refrigerio, el que se fue sin marcar, cómo se juntan dos celulares). Son las funciones de la app, tal
   cual. Lo arma armar.py. No editar. */
var CAMPO_APP = (function(){
  var _C = {};
  function tarCfg(){ return TAR_CFG_DEF; }
  var jspdf = { jsPDF: function(o){ return new window.jspdf.jsPDF(o); } };   /* el de la web (cargarEvPDF), el mismo jsPDF de la app; se busca al usarlo */
/* ── de la app · el tareo ── */
var TAR_CFG_DEF = { refri:60, refriDesde:6, jor:8, maxDia:12, maxSem:60 };
function _tarDoc(d){ return String(d || '').toUpperCase().replace(/[^0-9A-Z]/g, ''); }
function _tarNorm(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
function _tarK(doc, id, n){ var d = _tarDoc(doc); return d ? 'd:' + d : (id ? 'i:' + id : 'n:' + _tarNorm(n)); }
function _tarHora(ms){ if(!ms) return ''; var d = new Date(ms); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
function _tarH(x){ return (Math.round(x * 10) / 10).toFixed(1); }
function _tarUnir(a, b){
  var out = { p:{} };
  [a, b].forEach(function(x){
    if(!x || !x.p || typeof x.p !== 'object') return;
    Object.keys(x.p).forEach(function(k){
      var y = x.p[k]; if(!y || typeof y !== 'object') return;
      var z = out.p[k] || (out.p[k] = { n:'', d:'', m:[], x:[] });
      if(!z.n && y.n) z.n = String(y.n).slice(0, 80); if(!z.d && y.d) z.d = String(y.d).slice(0, 20);
      (Array.isArray(y.m) ? y.m : []).forEach(function(q){
        if(!Array.isArray(q) || !(+q[0]) || (q[1] !== 'e' && q[1] !== 's')) return;
        if(!z.m.some(function(w){ return w[0] === +q[0] && w[1] === q[1]; })) z.m.push([+q[0], q[1], String(q[2] || '').slice(0, 10)]);
      });
      (Array.isArray(y.x) ? y.x : []).forEach(function(t){ t = +t; if(t && z.x.indexOf(t) < 0) z.x.push(t); });
    });
  });
  Object.keys(out.p).forEach(function(k){ out.p[k].m.sort(function(p, q){ return p[0] - q[0]; }); });
  return out;
}
function _tarFirma(x){ var n = 0; Object.keys((x && x.p) || {}).forEach(function(k){ var z = x.p[k]; n += ((z.m || []).length * 7) + ((z.x || []).length * 13); }); return n; }
function _tarMarcas(z){ var x = z.x || []; return (z.m || []).filter(function(q){ return x.indexOf(q[0]) < 0; }); }
function _tarPares(ms){
  var pares = [], ab = null;
  ms.forEach(function(q){ if(q[1] === 'e'){ if(ab === null) ab = q[0]; } else if(ab !== null){ pares.push([ab, q[0]]); ab = null; } });
  return { pares:pares, ab:ab };
}
function tarHorasDe(z, cfg, ahora){
  cfg = cfg || tarCfg(); ahora = ahora || Date.now();
  var ms = _tarMarcas(z), pp = _tarPares(ms), min = 0, adentro = false, sinSalida = false;
  pp.pares.forEach(function(p){ min += Math.max(0, p[1] - p[0]) / 60000; });
  if(pp.ab !== null){
    if(ahora - pp.ab < 16 * 3600000){ adentro = true; min += Math.max(0, ahora - pp.ab) / 60000; }
    else sinSalida = true;
  }
  var h = min / 60;
  /* el que se fue sin marcar: la jornada de la obra (o lo que ya sumaba, si era más), sin descontar el refrigerio */
  if(sinSalida) h = Math.max(h, cfg.jor);
  else if(h >= cfg.refriDesde && cfg.refri > 0) h -= cfg.refri / 60;
  var e = null, s = null;
  ms.forEach(function(q){ if(q[1] === 'e' && e === null) e = q[0]; if(q[1] === 's') s = q[0]; });
  return { h:Math.max(0, Math.round(h * 100) / 100), adentro:adentro, sinSalida:sinSalida, e:e, s:s, ab:pp.ab, marcas:ms.length,
           mano:ms.some(function(q){ return q[2] === 'mano'; }) };
}
/* ── de la app · el parte del día ── */
var ATS_EST = {
  borrador:  { et:'En borrador',        c:'#8A9099', ic:'✏️' },
  firmado:   { et:'Firmado por la cuadrilla', c:'#00599E', ic:'✍️' },
  enviado:   { et:'Esperando al ingeniero',   c:'#00599E', ic:'📤' },
  liberado:  { et:'Esperando V°B° del SSOMA', c:'#FCDB00', ic:'⏳' },
  vigente:   { et:'Liberado · se puede trabajar', c:'#009645', ic:'✅' },
  observado: { et:'Devuelto con observación',  c:'#D9261C', ic:'↩️' },
  /* 17/10/2026 · lote 14 · el cierre */
  porcerrar: { et:'Falta el cierre · firma de salida y foto', c:'#D9261C', ic:'🔚' },
  cerrado:   { et:'Cerrado · firmaron la salida', c:'#0B6E4F', ic:'🔒' }
};
function _parT(s){ return (typeof trad === 'function') ? (trad(s) || s) : s; }
function _parH(x){ return (Math.round(x * 10) / 10).toFixed(1); }
function _parFecha(dia){ try{ var s = new Date(dia + 'T12:00:00').toLocaleDateString((document.documentElement.lang || 'es').slice(0, 2), { weekday:'short', day:'numeric', month:'short' }); return s.charAt(0).toUpperCase() + s.slice(1); }catch(_e){ return dia; } }
function _parFechaLarga(dia){ try{ return new Date(dia + 'T12:00:00').toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long', year:'numeric' }); }catch(_e){ return dia; } }
function parteTextoDe(D, o){
  var L = [];
  L.push('📋 ' + _parT('Parte del día') + ' · ' + o + ' · ' + _parFecha(D.dia));
  L.push('');
  L.push('👷 ' + _parT('Quién trabajó') + ': ' + D.gente.n + (D.gente.tareo ? ' · ' + _parH(D.gente.hh) + ' ' + _parT('horas hombre') : '') + (D.visitas ? ' · ' + _parT('visitas') + ': ' + D.visitas : ''));
  L.push('📋 ' + _parT('ATS') + ': ' + D.ats.length + (D.ats.length ? ' (' + D.ats.filter(function(a){ return a.ok; }).length + ' ' + _parT('liberados') + ')' : ''));
  D.ats.forEach(function(a){ var E = (typeof ATS_EST === 'object' && ATS_EST[a.est]) || { et:a.est }; L.push('   · ' + a.t + ' — ' + a.firmas + '/' + a.n + ' ' + _parT('firmas') + ' · ' + _parT(E.et)); });
  if(D.noApto) L.push('   ⚠️ ' + _parT('No aptos para trabajar') + ': ' + D.noApto);
  L.push('🗣️ ' + _parT('Charlas y capacitaciones') + ': ' + D.charlas.length);
  D.charlas.forEach(function(s){ L.push('   · ' + _parT(s.tipo) + (s.tema ? ': ' + s.tema : '') + ' — ' + s.n + ' ' + _parT('asistentes') + (s.de ? ' (' + s.de + ' ' + _parT('en la obra según el tareo') + ')' : '')); });
  if(D.reportes){ L.push('🚨 ' + _parT('Reportes de actos y condiciones') + ': ' + D.reportes.length + ' (' + D.reportes.filter(function(r){ return r.abierto; }).length + ' ' + _parT('abiertos') + ')');
    D.reportes.slice(0, 8).forEach(function(r){ L.push('   · ' + _parT(r.clase) + ': ' + r.desc); }); }
  L.push('🚑 ' + _parT('Incidentes y accidentes') + ': ' + (D.acc.length || _parT('ninguno')));
  D.acc.forEach(function(x){ L.push('   · ' + _parT(x.clase) + ': ' + x.desc); });
  if(D.epp.n) L.push('🦺 ' + _parT('EPP entregado') + ': ' + D.epp.n);
  if(D.notas && D.notas.hoy){ L.push(''); L.push('📝 ' + _parT('Notas del día') + ': ' + D.notas.hoy); }
  if(D.notas && D.notas.manana) L.push('➡️ ' + _parT('Para mañana') + ': ' + D.notas.manana);
  if(D.pend.length){ L.push(''); L.push('⏳ ' + _parT('Pendientes') + ':'); D.pend.forEach(function(p){ L.push('   · ' + _parT(p.t) + ': ' + p.n); }); }
  L.push(''); L.push('OBRASST');
  return L.join('\n');
}
function parteDoc(D, obra, sup){
  var doc = new jspdf.jsPDF({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89, M = 40, y = 0;
  function cab(){
    doc.setFillColor(11, 42, 58); doc.rect(0, 0, W, 70, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.text('PARTE DEL DÍA', M, 32);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.text(obra + '  ·  ' + _parFechaLarga(D.dia), M, 52, { maxWidth:W - 2 * M });
    y = 92; doc.setTextColor(30, 30, 30);
  }
  function lugar(n){ if(y + n > H - 50){ pie(); doc.addPage(); cab(); } }
  function pie(){ doc.setFontSize(8.5); doc.setTextColor(120, 120, 120); doc.text('OBRASST · Parte del día armado con lo registrado en la app' + (sup ? ' · ' + sup : ''), M, H - 24); doc.setTextColor(30, 30, 30); }
  function titulo(t){ lugar(40); y += 8; doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5); doc.setTextColor(11, 42, 58); doc.text(t, M, y); y += 6;
    doc.setDrawColor(210, 214, 218); doc.line(M, y, W - M, y); y += 15; doc.setTextColor(30, 30, 30); }
  function linea(t, op){ op = op || {}; doc.setFont('helvetica', op.b ? 'bold' : 'normal'); doc.setFontSize(op.fs || 10.5);
    var l = doc.splitTextToSize(String(t), W - 2 * M - (op.x || 0)); lugar(l.length * 13); doc.text(l, M + (op.x || 0), y); y += l.length * 13 + (op.gap || 2); }
  cab();
  /* las cuatro cifras */
  var cif = [['Personas', D.gente.n], ['ATS', D.ats.length], ['Reportes', D.reportes ? D.reportes.length : '-'], ['Incidentes', D.acc.length]], cw = (W - 2 * M - 30) / 4;
  cif.forEach(function(x, i){ var xx = M + i * (cw + 10); doc.setDrawColor(210, 214, 218); doc.setFillColor(246, 248, 250); doc.roundedRect(xx, y, cw, 54, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(i === 3 && D.acc.length ? 196 : 11, i === 3 && D.acc.length ? 22 : 42, i === 3 && D.acc.length ? 42 : 58);
    doc.text(String(x[1]), xx + cw / 2, y + 27, { align:'center' }); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 90); doc.text(x[0], xx + cw / 2, y + 43, { align:'center' }); });
  y += 70; doc.setTextColor(30, 30, 30);
  titulo('Quién trabajó');
  if(D.gente.tareo) linea(D.gente.n + ' marcaron en la puerta · ' + _parH(D.gente.hh) + ' horas hombre' + (D.gente.adentro ? ' · ' + D.gente.adentro + ' siguen adentro' : ''));
  else linea(D.gente.n ? D.gente.n + ' registrados ese día (ATS, charlas, EPP y visitas).' : 'Nadie registrado ese día.');
  if(D.gente.nombres.length) linea(D.gente.nombres.join(' · '), { fs:9 });
  if(D.visitas) linea(D.visitas + ' visitas.');
  titulo('ATS');
  if(!D.ats.length) linea('Ningún ATS ese día.');
  D.ats.forEach(function(a){ var E = (typeof ATS_EST === 'object' && ATS_EST[a.est]) || { et:a.est }; linea(a.t + (a.lugar ? ' (' + a.lugar + ')' : '') + ' — ' + a.firmas + '/' + a.n + ' firmas · ' + E.et); });
  if(D.noApto) linea(D.noApto + (D.noApto === 1 ? ' dijo que no estaba apto para trabajar (revisado antes del V°B°).' : ' dijeron que no estaban aptos para trabajar (revisado antes del V°B°).'), { b:true });
  titulo('Charlas y capacitaciones');
  if(!D.charlas.length) linea('Ninguna charla registrada ese día.');
  D.charlas.forEach(function(s){ linea(s.tipo + (s.tema ? ': ' + s.tema : '') + ' — ' + s.n + ' asistentes' + (s.de ? ' (' + s.de + ' en la obra según el tareo)' : '')); });
  titulo('Reportes de actos y condiciones');
  if(!D.reportes) linea('No se pudieron traer de la nube.');
  else if(!D.reportes.length) linea('Ningún reporte ese día.');
  else D.reportes.forEach(function(r){ linea(r.clase + ': ' + r.desc + (r.lugar ? ' · ' + r.lugar : '') + (r.abierto ? ' (abierto)' : ' (atendido)')); });
  titulo('Incidentes y accidentes');
  if(!D.acc.length) linea('Sin incidentes ni accidentes ese día.');
  D.acc.forEach(function(x){ linea(x.clase + (x.hora ? ' · ' + x.hora : '') + ': ' + x.desc); });
  if(D.epp.n){ titulo('EPP entregado'); linea(D.epp.n + (D.epp.n === 1 ? ' entrega a ' : ' entregas a ') + D.epp.personas + (D.epp.personas === 1 ? ' persona.' : ' personas.')); }
  if(D.notas && (D.notas.hoy || D.notas.manana)){ titulo('Notas del día'); if(D.notas.hoy) linea(D.notas.hoy); if(D.notas.manana) linea('Para mañana: ' + D.notas.manana, { b:true }); if(D.notas.quien) linea('Escritas por ' + D.notas.quien + '.', { fs:9 }); }
  if(D.dia === hoyISO()){ titulo('Pendientes'); if(!D.pend.length) linea('Nada pendiente.'); D.pend.forEach(function(p){ linea(p.t + ': ' + p.n); }); }
  pie();
  return doc;
}
/* ── de la app · los primeros auxilios ── */
var PA_CASOS = [
  { k:'caida', ic:'🤕', t:'Caída o golpe fuerte', p:[
      ['⚠️', 'Mira que no haya peligro para ti: carga, borde o tránsito.'],
      ['📞', 'Llama a la emergencia de la obra y al brigadista.'],
      ['🛑', 'No lo muevas si cayó de altura o se golpeó la cabeza, el cuello o la espalda. Solo si hay fuego o derrumbe.'],
      ['🗣️', 'Háblale. Que no se levante. Pregúntale qué le duele.'],
      ['🩹', 'Si sangra, presiona la herida con una tela limpia.'],
      ['🧥', 'Abrígalo y quédate a su lado hasta que llegue la ayuda.'] ],
    no:['No lo sientes ni le des de beber.', 'No le quites el casco si se golpeó la cabeza, salvo que no pueda respirar.'],
    papel:['No lo muevas si cayó de altura o se golpeó la cabeza.', 'Llama a la emergencia y al brigadista.', 'Si sangra, presiona con una tela limpia.'] },
  { k:'corte', ic:'🩸', t:'Corte o sangrado', p:[
      ['🧤', 'Ponte guantes: están en el botiquín.'],
      ['✋', 'Presiona fuerte la herida con gasa o tela limpia, sin soltar.'],
      ['➕', 'Si se empapa, pon otra encima. No quites la primera.'],
      ['⬆️', 'Si es en un brazo o una pierna y no está roto, levántalo.'],
      ['📞', 'Si sangra mucho o no para: emergencia de la obra.'] ],
    no:['No saques lo que esté clavado: presiona alrededor.', 'No pongas tierra, café ni pasta dental.'],
    papel:['Guantes y presión fuerte con gasa, sin soltar.', 'Si se empapa, otra encima.', 'Si no para: emergencia de la obra.'] },
  { k:'quemadura', ic:'🔥', t:'Quemadura', p:[
      ['🚫', 'Aléjalo de lo que lo quemó.'],
      ['🚿', 'Echa agua fría del caño sobre la quemadura por 20 minutos.'],
      ['💍', 'Quítale anillos, reloj o ropa que no esté pegada, antes de que se hinche.'],
      ['🩹', 'Cúbrela con gasa limpia o plástico de cocina, sin apretar.'],
      ['📞', 'Si es grande, en la cara, las manos o con ampollas: emergencia de la obra.'] ],
    extra:'Si es por un químico: lávalo con mucha agua por 20 minutos y mira su hoja MSDS.',
    no:['No pongas hielo, pasta dental, aceite ni mantequilla.', 'No revientes las ampollas.'],
    papel:['Agua fría del caño por 20 minutos.', 'Cubre con gasa limpia, sin apretar.', 'Sin hielo, pasta dental ni aceite.'] },
  { k:'electrica', ic:'⚡', t:'Descarga eléctrica', p:[
      ['🛑', 'No lo toques mientras siga en contacto con la corriente.'],
      ['🔌', 'Corta la energía en el tablero. Si no puedes, sepáralo con algo seco de madera o plástico.'],
      ['📞', 'Llama a la emergencia de la obra: toda descarga la ve un médico, aunque se vea bien.'],
      ['❤️', 'Si no responde y no respira normal: empieza la RCP si sabes, y pide el desfibrilador (DEA) si hay.'],
      ['🚿', 'Enfría las quemaduras con agua y cúbrelas.'] ],
    no:['No uses nada de metal ni mojado para separarlo.', 'No lo dejes solo.'],
    papel:['No lo toques: corta la energía primero.', 'Emergencia de la obra, aunque se vea bien.', 'Si no respira normal: RCP si sabes.'] },
  { k:'desmayo', ic:'😵', t:'Desmayo', p:[
      ['🛏️', 'Acuéstalo boca arriba.'],
      ['🦵', 'Levántale las piernas un poco, si no se golpeó.'],
      ['👔', 'Aflójale la ropa del cuello y el cinturón.'],
      ['↪️', 'Si respira pero no despierta: ponlo de costado y llama a la emergencia.'],
      ['❤️', 'Si no respira normal: emergencia de la obra y RCP si sabes.'] ],
    no:['No le des comida ni bebida hasta que esté bien despierto.', 'No le eches agua en la cara.'],
    papel:['Acostado, con las piernas un poco arriba.', 'Si no despierta: de costado y emergencia.', 'Si no respira normal: RCP si sabes.'] },
  { k:'calor', ic:'🥵', t:'Golpe de calor', p:[
      ['🌳', 'Llévalo a la sombra o a un lugar fresco.'],
      ['🦺', 'Quítale el EPP y la ropa de más.'],
      ['💧', 'Enfríalo: agua fresca en la piel, abanícalo, paños húmedos en el cuello y las axilas.'],
      ['🥤', 'Si está despierto y puede tragar: agua a sorbos.'],
      ['📞', 'Si está confundido, vomita o se desmaya: emergencia de la obra.'] ],
    no:['No le des alcohol ni bebidas energizantes.', 'No lo dejes solo.'],
    papel:['A la sombra, sin EPP ni ropa de más.', 'Agua fresca en la piel y abanícalo.', 'Si está confundido: emergencia de la obra.'] }
];
var PA_PIE = 'Guía básica de primeros auxilios. No reemplaza la capacitación ni la atención médica.';
function _paTx(v, n){ return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n); }
function _paFotoOk(u){ u = String(u || ''); return /^https:\/\/[a-z0-9.-]+\/storage\/v1\/object\/public\/msds\//i.test(u) ? u.slice(0, 400) : ''; }
function _paPasos(l, n, m){ return (Array.isArray(l) ? l : []).map(function(s){ return Array.isArray(s) ? [_paTx(s[0], 8) || '•', _paTx(s[1], m)] : null; }).filter(function(s){ return s && s[1]; }).slice(0, n); }
function _paLista(l, n, m){ return (Array.isArray(l) ? l : []).map(function(t){ return _paTx(t, m); }).filter(Boolean).slice(0, n); }
function _paCasoLimpio(c){
  if(!c || typeof c !== 'object') return null;
  return { ic:_paTx(c.ic, 8), t:_paTx(c.t, 60), p:_paPasos(c.p, 10, 220), no:_paLista(c.no, 6, 160), papel:_paLista(c.papel, 3, 90), extra:_paTx(c.extra, 220),
           foto:_paFotoOk(c.foto), quien:_paTx(c.quien, 80), cuando:+c.cuando || 0 };
}
function paAuxLimpio(v){
  if(!v || typeof v !== 'object') return null;
  var o = { v:1, casos:{}, ocultos:[], propios:[], notas:{}, quien:_paTx(v.quien, 80), cuando:+v.cuando || 0 };
  if(v.casos && typeof v.casos === 'object') Object.keys(v.casos).forEach(function(k){ if(/^[a-z]{2,12}$/.test(k)){ var c = _paCasoLimpio(v.casos[k]); if(c) o.casos[k] = c; } });
  o.ocultos = _paLista(v.ocultos, 12, 12).filter(function(k){ return /^[a-z]{2,12}$/.test(k); });
  (Array.isArray(v.propios) ? v.propios : []).slice(0, 8).forEach(function(c){ var x = _paCasoLimpio(c); if(x && x.t && x.p.length && /^p[0-9a-z]{3,12}$/.test(String(c.k || ''))){ x.k = String(c.k); o.propios.push(x); } });
  var n = v.notas && typeof v.notas === 'object' ? v.notas : {};
  ['botiquin', 'camilla', 'centro', 'centroDir', 'centroTel', 'libre'].forEach(function(k){ var t = _paTx(n[k], k === 'libre' ? 400 : 120); if(t) o.notas[k] = t; });
  return o;
}
function paCasosDe(o, base){
  var L = [];
  (base || PA_CASOS).forEach(function(x){
    if(o && o.ocultos && o.ocultos.indexOf(x.k) > -1) return;
    var c = o && o.casos && o.casos[x.k];
    if(c) L.push({ k:x.k, ic:c.ic || x.ic, t:c.t || x.t, p:c.p.length ? c.p : x.p, no:c.no.length ? c.no : (x.no || []), papel:c.papel.length ? c.papel : (x.papel || []),
                   extra:c.extra || x.extra || '', foto:c.foto || '', obra:true, quien:c.quien, cuando:c.cuando });
    else L.push({ k:x.k, ic:x.ic, t:x.t, p:x.p, no:x.no || [], papel:x.papel || [], extra:x.extra || '', foto:'' });
  });
  ((o && o.propios) || []).forEach(function(c){
    L.push({ k:c.k, ic:c.ic || '⛑️', t:c.t, p:c.p, no:c.no, papel:c.papel.length ? c.papel : c.p.slice(0, 3).map(function(s){ return s[1]; }), extra:c.extra, foto:c.foto, propio:true, quien:c.quien, cuando:c.cuando });
  });
  return L;
}
function paNotasLineas(o){
  var n = (o && o.notas) || {}, L = [];
  if(n.botiquin) L.push(['🧰', 'Botiquín', n.botiquin]);
  if(n.camilla) L.push(['🛏️', 'Camilla', n.camilla]);
  if(n.centro || n.centroDir || n.centroTel) L.push(['🏥', 'Centro de salud más cercano', [n.centro, n.centroDir, n.centroTel].filter(Boolean).join(' · ')]);
  if(n.libre) L.push(['📝', 'Nota de la obra', n.libre]);
  return L;
}
/* ── de la app · la caída libre ── */
var CL_DEF = { donde:'general', tipo:'linea', h:'', cu:'3', mod:'2', hasta:'piso', ha:'2', l:'1.8', dd:'1.2', ddr:'1.4', hd:'1.5', hs:'0.3', m:'1', mas:false };
var CL_FF_MAX = 1.8;
var CL_BARANDA = 1;
var CL_TOPE = { h:[0.5, 300], cu:[1, 40], mod:[0.5, 3], ha:[-3, 12], l:[0.3, 4], dd:[0, 2.5], ddr:[0, 2.5], hd:[0.8, 2], hs:[0, 0.8], m:[0, 3] };
var CL_DATOS = ['donde', 'tipo', 'h', 'cu', 'mod', 'hasta', 'ha', 'l', 'dd', 'ddr', 'hd', 'hs', 'm'];
function _caNorm(c){
  c.tipo = c.tipo === 'retractil' ? 'retractil' : 'linea';
  c.donde = c.donde === 'andamio' ? 'andamio' : 'general';
  c.hasta = c.hasta === 'plat' ? 'plat' : 'piso';
  return c;
}
function _caNum(s){ s = String(s == null ? '' : s).trim().replace(',', '.'); if(!/^-?\d*\.?\d+$/.test(s)) return NaN; return parseFloat(s); }
function _caM(x){ return (Math.round(x * 10) / 10).toFixed(1) + ' m'; }
function clDatos(c){
  c = c || _caCargar();
  var v = { tipo:c.tipo === 'retractil' ? 'retractil' : 'linea', donde:c.donde === 'andamio' ? 'andamio' : 'general' }, mal = '';
  var ks = ['h', 'ha', 'l', 'dd', 'ddr', 'hd', 'hs', 'm'];
  if(v.donde === 'andamio'){
    v.hasta = c.hasta === 'plat' ? 'plat' : 'piso';
    v.cu = _caNum(c.cu); v.mod = _caNum(c.mod);
    if(isNaN(v.cu) || v.cu !== Math.round(v.cu) || v.cu < CL_TOPE.cu[0] || v.cu > CL_TOPE.cu[1]) mal = 'cu';
    else if(isNaN(v.mod) || v.mod < CL_TOPE.mod[0] || v.mod > CL_TOPE.mod[1]) mal = 'mod';
    v.alto = Math.round(v.cu * v.mod * 100) / 100;
    v.h = v.hasta === 'plat' ? v.mod : v.alto;
    ks = ks.slice(1);
  }
  ks.forEach(function(k){
    var x = _caNum(c[k]); v[k] = x;
    if(!mal && (isNaN(x) || x < CL_TOPE[k][0] || x > CL_TOPE[k][1])) mal = k;
  });
  v.mal = mal;
  return v;
}
function clCalcular(v){
  var r = { hs:v.hs, m:v.m, bajo:false };
  if(v.tipo === 'linea'){ r.ff = Math.max(0, v.l + v.hd - v.ha); r.dd = v.dd; }
  else { r.ff = 0; r.dd = v.ddr; r.bajo = v.ha < v.hd; }
  r.cae = r.ff + r.dd + r.hs;
  r.nec = r.cae + r.m;
  r.sobra = v.h - r.nec;
  r.ffLarga = v.tipo === 'linea' && r.ff > CL_FF_MAX + 1e-9;
  r.golpea = v.h < r.cae - 1e-9;
  r.estado = (r.golpea || r.ffLarga || r.bajo) ? 'rojo' : (r.sobra < -1e-9 ? 'ambar' : 'verde');
  return r;
}
function clAnclajeAltura(c, donde){
  var hd = _caNum(c.hd), mo = _caNum(c.mod); if(isNaN(hd)) hd = 1.5; if(isNaN(mo)) mo = 2;
  var x = { arriba:Math.round((hd + 0.5) * 10) / 10, espalda:hd, pies:0, cuerpo:mo, baranda:CL_BARANDA, plataforma:0 }[donde];
  return x === undefined ? null : String(x);
}
var CL_MAL = { h:'Pon la altura del piso donde trabaja al de abajo (de 0.5 a 300 m).', ha:'Pon la altura del anclaje sobre sus pies (de −3 a 12 m).',
               l:'Pon el largo de la línea (de 0.3 a 4 m).', dd:'Pon lo que se estira el absorbedor (hasta 2.5 m).', ddr:'Pon lo que recorre el retráctil hasta frenar (hasta 2.5 m).',
               hd:'Pon la altura del anillo D (de 0.8 a 2 m).', hs:'Pon lo que se estira el arnés (hasta 0.8 m).', m:'Pon el margen de seguridad (hasta 3 m).',
               cu:'Pon los cuerpos del andamio hasta su plataforma (de 1 a 40).', mod:'Pon el alto de cada cuerpo (de 0.5 a 3 m).' };
function clQueHacer(v, r){
  if(r.estado === 'verde') return [];
  var lin = v.tipo === 'linea', q = [];
  if(lin && v.donde === 'andamio' && (r.ffLarga || v.ha < v.hd + 0.5)) q.push('En el andamio, ancla a un cuerpo más arriba, no a la baranda ni a la plataforma.');
  else if(lin && (r.ffLarga || v.ha < v.hd + 0.5)) q.push('Ancla más arriba: con el anclaje por encima de la cabeza, la caída libre baja.');
  if(lin && v.l > 1.2) q.push('Usa una línea más corta, si el trabajo lo deja.');
  if(lin) q.push('Usa un retráctil anclado arriba de la cabeza: frena en menos espacio.');
  if(v.donde === 'andamio' && v.hasta === 'plat') q.push('Que no pueda caer por dentro: la plataforma completa, sin huecos.');
  q.push('O que no pueda caer: una línea de restricción que no lo deje llegar al borde, o una plataforma con baranda.');
  q.push('Si no alcanza el espacio, así no se trabaja.');
  return q;
}
function _caVeredicto(r){
  if(r.bajo) return ['⛔ Retráctil anclado muy abajo', 'La mayoría de los retráctiles se anclan arriba de la cabeza. Si lo anclas más abajo, usa uno hecho para eso (para borde) y sigue su ficha.'];
  if(r.ffLarga) return ['⛔ Caída libre muy larga', 'Pasa de 1.8 m: la línea con absorbedor común no está hecha para eso. Ancla más arriba, por encima del anillo D.'];
  if(r.golpea) return ['⛔ Golpearía el piso', 'El espacio de abajo no alcanza para que el equipo lo detenga.'];
  if(r.estado === 'ambar') return ['⚠️ Muy justo', 'No llegaría al piso, pero queda sin el margen de seguridad.'];
  return ['✅ Alcanza el espacio', 'El equipo lo detiene antes del piso y queda el margen de seguridad.'];
}
function _caFila(cl, et, val){ return '<div class="cdl-f"><span><i class="cdl-sq ' + cl + '" aria-hidden="true"></i><span>' + et + '</span></span><b data-sin-trad>' + val + '</b></div>'; }
function _caDibujo(v, r){
  var arriba = Math.max(v.ha, v.hd + 0.35, 0.5) + 0.3, abajo = Math.max(v.h, r.nec) + 0.4, rango = arriba + abajo;
  var H = 300, s = H / rango, W = 320;
  var Y = function(m){ return Math.round((arriba - m) * s * 10) / 10; };   /* m: metros sobre sus pies (abajo, en negativo) */
  var g = '<svg class="cdl-svg" viewBox="0 0 ' + W + ' ' + (H + 8) + '" role="img" aria-label="Dibujo de la caída" data-sin-trad>';
  /* la regla, cada metro desde sus pies */
  var paso = rango > 24 ? 5 : (rango > 12 ? 2 : 1);
  for(var m = 0; m <= abajo; m += paso){
    g += '<line x1="34" x2="40" y1="' + Y(-m) + '" y2="' + Y(-m) + '" stroke="currentColor" stroke-opacity=".5"/>' +
         '<text x="30" y="' + (Y(-m) + 3.5) + '" font-size="10" text-anchor="end" fill="currentColor" fill-opacity=".7">' + (m ? '−' + m : '0') + '</text>';
  }
  g += '<line x1="40" x2="40" y1="' + Y(arriba) + '" y2="' + Y(-abajo) + '" stroke="currentColor" stroke-opacity=".35"/>';
  /* el piso de abajo */
  g += '<rect x="44" y="' + Y(-v.h) + '" width="' + (W - 48) + '" height="' + Math.max(4, Math.min(14, (abajo - v.h) * s)) + '" fill="#8B5E3C" fill-opacity=".55"/>' +
       '<line x1="44" x2="' + (W - 4) + '" y1="' + Y(-v.h) + '" y2="' + Y(-v.h) + '" stroke="#C08A5B" stroke-width="2"/>';
  /* 14/10/2026 · en un andamio: sus cuerpos debajo de la plataforma (hasta donde se ve), la baranda y los parantes */
  if(v.donde === 'andamio' && v.mod > 0){
    var fondo = Math.min(v.alto, abajo), tope = Math.max(CL_BARANDA, v.ha > 0 ? v.ha : 0);
    g += '<g stroke="currentColor" stroke-opacity=".38" stroke-width="2" fill="none">' +
         '<line x1="50" x2="50" y1="' + Y(tope) + '" y2="' + Y(-fondo) + '"/><line x1="156" x2="156" y1="' + Y(tope) + '" y2="' + Y(-fondo) + '"/>' +
         '<line x1="50" x2="156" y1="' + Y(CL_BARANDA) + '" y2="' + Y(CL_BARANDA) + '"/>';
    for(var q = v.mod; q <= fondo + 1e-9; q += v.mod)
      g += '<line x1="50" x2="156" y1="' + Y(-q) + '" y2="' + Y(-q) + '"/><line x1="50" x2="156" y1="' + Y(-q + v.mod) + '" y2="' + Y(-q) + '" stroke-opacity=".5"/>';
    g += '</g>';
  }
  /* donde trabaja: la plataforma con su borde */
  g += '<rect x="44" y="' + Y(0) + '" width="118" height="7" rx="1.5" fill="currentColor" fill-opacity=".55"/>';
  /* la persona parada (anillo D en la espalda) */
  var px = 112, cab = v.hd + 0.28;
  g += '<circle cx="' + px + '" cy="' + Y(cab) + '" r="' + Math.max(4, 0.13 * s) + '" fill="none" stroke="currentColor" stroke-width="2"/>' +
       '<line x1="' + px + '" x2="' + px + '" y1="' + Y(cab - 0.13) + '" y2="' + Y(0.85) + '" stroke="currentColor" stroke-width="2.4"/>' +
       '<line x1="' + px + '" x2="' + (px - 7) + '" y1="' + Y(0.85) + '" y2="' + Y(0) + '" stroke="currentColor" stroke-width="2.2"/>' +
       '<line x1="' + px + '" x2="' + (px + 7) + '" y1="' + Y(0.85) + '" y2="' + Y(0) + '" stroke="currentColor" stroke-width="2.2"/>' +
       '<line x1="' + (px - 9) + '" x2="' + (px + 9) + '" y1="' + Y(v.hd - 0.25) + '" y2="' + Y(v.hd - 0.25) + '" stroke="currentColor" stroke-width="2"/>' +
       '<circle cx="' + (px + 3) + '" cy="' + Y(v.hd) + '" r="3.2" fill="#F5A524"/>';
  /* el anclaje y la línea */
  var ax = 140;
  g += '<path d="M' + (ax - 7) + ' ' + (Y(v.ha) - 6) + 'h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
       '<circle cx="' + ax + '" cy="' + Y(v.ha) + '" r="4.5" fill="none" stroke="#F5A524" stroke-width="2.4"/>' +
       '<path d="M' + ax + ' ' + Y(v.ha) + ' Q ' + ((ax + px) / 2 + 10) + ' ' + Math.max(Y(v.ha), Y(v.hd)) + ' ' + (px + 3) + ' ' + Y(v.hd) + '" fill="none" stroke="#F5A524" stroke-width="1.8" stroke-dasharray="' + (v.tipo === 'linea' ? '0' : '4 3') + '"/>';
  /* lo que baja, por partes, desde sus pies */
  var bx = 196, bw = 34, y0 = 0;
  [['ff', r.ff, '#E5484D'], ['dd', r.dd, '#F5A524'], ['hs', r.hs, '#F5D90A']].forEach(function(p){
    if(p[1] <= 0) return;
    g += '<rect x="' + bx + '" y="' + Y(-y0) + '" width="' + bw + '" height="' + Math.max(1, p[1] * s) + '" fill="' + p[2] + '"/>';
    y0 += p[1];
  });
  if(r.m > 0) g += '<rect x="' + bx + '" y="' + Y(-y0) + '" width="' + bw + '" height="' + Math.max(1, r.m * s) + '" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-dasharray="4 3"/>';
  /* hasta dónde bajan sus pies, y lo que hay */
  var col = r.estado === 'verde' ? '#30A46C' : (r.estado === 'ambar' ? '#F5A524' : '#E5484D');
  g += '<line x1="' + (bx - 6) + '" x2="' + (bx + bw + 6) + '" y1="' + Y(-r.cae) + '" y2="' + Y(-r.cae) + '" stroke="' + col + '" stroke-width="2.4"/>' +
       '<text x="' + (bx - 9) + '" y="' + (Y(-r.cae) + 4) + '" font-size="12" font-weight="700" text-anchor="end" fill="' + col + '">' + _caM(r.cae) + '</text>';
  g += '<line x1="' + (W - 30) + '" x2="' + (W - 30) + '" y1="' + Y(0) + '" y2="' + Y(-v.h) + '" stroke="currentColor" stroke-opacity=".6" marker-end="url(#cdl-fl)" marker-start="url(#cdl-fl)"/>' +
       '<text x="' + (W - 34) + '" y="' + ((Y(0) + Y(-v.h)) / 2) + '" font-size="12" text-anchor="end" fill="currentColor">' + _caM(v.h) + '</text>' +
       '<defs><marker id="cdl-fl" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="currentColor" fill-opacity=".6"/></marker></defs>';
  return g + '</svg>';
}
function _caT(s){ return (typeof trad === 'function') ? (trad(s) || s) : s; }
function clTextoDe(c, nombre){
  var v = clDatos(c); if(v.mal) return '';
  var r = clCalcular(v), lin = v.tipo === 'linea', ver = _caVeredicto(r);
  return [_caT('Caída libre') + ' · OBRASST' + (nombre ? ' · ' + nombre : ''),
          _caT(ver[0])]
    .concat(v.donde === 'andamio' ? [_caT('En un andamio') + ': ' + v.cu + ' × ' + _caM(v.mod) + ' · ' + _caT('Altura de la plataforma') + ': ' + _caM(v.alto)] : [])
    .concat([_caT(lin ? 'Línea con absorbedor' : 'Retráctil') + (lin ? ' · ' + _caM(v.l) : ''),
          _caT('Altura del anclaje sobre sus pies') + ': ' + _caM(v.ha),
          _caT('Caída libre') + ': ' + _caM(r.ff),
          _caT(lin ? 'Lo que se estira el absorbedor' : 'Lo que recorre el retráctil hasta frenar') + ': ' + _caM(r.dd),
          _caT('Lo que se estira el arnés') + ': ' + _caM(r.hs),
          _caT('Margen de seguridad') + ': ' + _caM(r.m),
          _caT('Necesita libre debajo de sus pies') + ': ' + _caM(r.nec),
          _caT('Hay libre debajo') + ': ' + _caM(v.h),
          _caT('Usa los datos de la etiqueta y la ficha de tu equipo: esta cuenta es una guía y manda lo que diga el fabricante.')]).join('\n');
}
var HOJA_CAIDA = 'caida';
function _cdlTx(s, n){ return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n); }
function cdlLimpio(row){
  if(!row || typeof row !== 'object') return null;
  var v = row.nota; if(typeof v === 'string'){ try{ v = JSON.parse(v); }catch(_p){ v = null; } }
  if(!v || typeof v !== 'object' || !v.d || typeof v.d !== 'object') return null;
  var d = {}; CL_DATOS.forEach(function(k){ var x = v.d[k]; d[k] = (x === undefined || x === null) ? CL_DEF[k] : String(x).slice(0, 12); });
  _caNorm(d);
  if(clDatos(d).mal) return null;
  return { id:_cdlTx(row.id, 60), nombre:_cdlTx(row.nombre, 80) || 'Espacio de caída', d:d, lugar:_cdlTx(v.lugar, 120), nota:_cdlTx(v.nota, 400),
           quien:_cdlTx(v.quien, 80), cuando:+v.cuando || 0, creado:_cdlTx(row.creado, 40) };
}
function cdlNota(c, lugar, nota, quien){
  var d = {}; CL_DATOS.forEach(function(k){ d[k] = String(c[k] == null ? '' : c[k]).slice(0, 12); });
  return JSON.stringify({ v:1, d:_caNorm(d), lugar:_cdlTx(lugar, 120), nota:_cdlTx(nota, 400), quien:_cdlTx(quien, 80), cuando:Date.now() });
}
/* ── de la app · el legajo ── */
var EMO_TIPOS = [['pre', 'Preocupacional'], ['periodico', 'Periódico'], ['retiro', 'De retiro'], ['reingreso', 'Por reingreso'], ['otro', 'Otro']];
var EMO_APTITUD = [['apto', 'Apto', 'ok'], ['apto_restr', 'Apto con restricciones', 'ojo'], ['no_apto', 'No apto', 'mal'], ['observado', 'Observado', 'gris']];
var EMO_ESTADO = { vigente:['Vigente', 'ok'], por_vencer:['Por vencer', 'ojo'], vencido:['Vencido', 'mal'], sin:['Sin examen', 'gris'], sin_proximo:['Sin próximo', 'gris'] };
function _emoDe(lista, k, i){ for(var j = 0; j < lista.length; j++) if(lista[j][0] === k) return lista[j][i]; return ''; }
function emoTipoN(k){ return _emoDe(EMO_TIPOS, k, 1) || 'Examen'; }
function emoAptN(k){ return _emoDe(EMO_APTITUD, k, 1) || '—'; }
function emoEstN(k){ return (EMO_ESTADO[k] || EMO_ESTADO.sin)[0]; }
function emoEstado(proximo, hoy){
  if(!proximo) return 'sin_proximo';
  var a = Date.parse(String(proximo).slice(0, 10) + 'T00:00:00Z'), b = Date.parse(String(hoy).slice(0, 10) + 'T00:00:00Z');
  if(isNaN(a) || isNaN(b)) return 'sin_proximo';
  var d = Math.round((a - b) / 86400000);
  return d < 0 ? 'vencido' : (d <= 30 ? 'por_vencer' : 'vigente');
}
var LEG_SECS = [
  { k:'ind', n:'Inducción' }, { k:'difu', n:'Documentos difundidos y firmados' }, { k:'caps', n:'Capacitaciones y evaluaciones' },
  { k:'hab', n:'Habilitaciones' }, { k:'epp', n:'EPP entregado' }, { k:'emo', n:'Examen médico ocupacional (aptitud)' }, { k:'sctr', n:'SCTR' },
  { k:'amon', n:'Amonestaciones' }, { k:'acc', n:'Incidentes y accidentes' }, { k:'ats', n:'ATS firmados' }, { k:'tar', n:'Tareo de los últimos 30 días' }
];
function legCfgLimpio(v){
  var o = { v:1, secs:{}, trab:true, quien:'', cuando:0 };
  if(!v || typeof v !== 'object') return o;
  var s = (v.secs && typeof v.secs === 'object') ? v.secs : {};
  LEG_SECS.forEach(function(x){ if(s[x.k] === false) o.secs[x.k] = false; });
  o.trab = v.trab !== false;
  o.quien = String(v.quien || '').slice(0, 80); o.cuando = +v.cuando || 0;
  return o;
}
function legSecOn(cfg, k){ return !(cfg && cfg.secs && cfg.secs[k] === false); }
var LEG_ACC = { casi:'Casi accidente', dano:'Daño a la propiedad', primeros:'Primeros auxilios', leve:'Accidente leve', incap:'Accidente incapacitante', mortal:'Accidente mortal' };
function _legDoc(d){ return String(d || '').toUpperCase().replace(/[^0-9A-Z]/g, ''); }
function _legF(iso){ var s = String(iso || '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : (s || '—'); }
function legDeServidor(j){
  if(!j || typeof j !== 'object' || !j.t) return null;
  var t = j.t, D = { t:{ id:t.id, nombre:t.nombre || '', dni:t.dni || '', td:t.td || 'DNI', puesto:t.puesto || '', area:t.area || '', ingreso:t.ingreso || '', estatus:t.estatus || 'activo' }, cuenta:true, srv:true };
  var est = String(t.estatus || 'activo'); D.sit = est.charAt(0).toUpperCase() + est.slice(1);
  var L = function(x){ return Array.isArray(x) ? x.map(function(r){ return { f:String(r.f || '').slice(0, 10), t:String(r.t || '—'), d:String(r.d || '') }; }) : undefined; };
  if(j.ind){ var hz = +j.ind.hechas || 0, tt = +j.ind.total || 0;
    D.ind = { est:tt ? (hz >= tt ? 'Inducción completa: ' + tt + ' de ' + tt + ' difusiones firmadas' : 'Inducción en curso: ' + hz + ' de ' + tt + ' difusiones firmadas') : '', filas:L(j.ind.filas) || [] }; }
  D.difu = L(j.difu); D.caps = L(j.caps); D.epp = L(j.epp); D.amon = L(j.amon);
  if(Array.isArray(j.acc)) D.acc = j.acc.map(function(x){ var di = +x.dias; return { f:String(x.f || '').slice(0, 10), t:LEG_ACC[x.clase] || String(x.clase || '—'), d:String(x.d || '') + (di ? (di === 1 ? ' · 1 día perdido' : ' · ' + di + ' días perdidos') : '') }; });
  if(j.emo && typeof j.emo === 'object'){
    D.emo = j.emo.f ? { tipo:(typeof emoTipoN === 'function' ? emoTipoN(j.emo.tipo) : String(j.emo.tipo || '')), f:String(j.emo.f).slice(0, 10), prox:j.emo.prox ? String(j.emo.prox).slice(0, 10) : '',
                        apt:(typeof emoAptN === 'function' ? emoAptN(j.emo.apt) : String(j.emo.apt || '')),
                        est:(typeof emoEstN === 'function' && typeof emoEstado === 'function') ? emoEstN(emoEstado(j.emo.prox, j.hoy || '')) : '' } : { f:'' };
  }
  if(j.ats && typeof j.ats === 'object') D.ats = { n:+j.ats.n || 0, ult:j.ats.ult ? String(j.ats.ult).slice(0, 10) : '' };
  if(j.tar && typeof j.tar === 'object'){
    var cfgT = (typeof tarCfg === 'function') ? tarCfg() : null, dias = 0, hs = 0;
    Object.keys(j.tar).forEach(function(f){ var z = j.tar[f]; if(!z || !Array.isArray(z.m) || !cfgT || typeof tarHorasDe !== 'function') return; var hh = tarHorasDe({ m:z.m, x:z.x || [] }, cfgT); if(hh.marcas){ dias++; hs += hh.h; } });
    D.tar = dias ? { dias:dias, h:Math.round(hs * 10) / 10 } : null;
  }
  return D;
}
function legPdfDe(D, meta){
  meta = meta || {};
  var t = D.t, obra = meta.obra || '', emp = meta.emp || '', sup = meta.sup || '', cfg = meta.cfg || null, hoyL = meta.hoy || hoyISO();
  var on = function(k){ return legSecOn(cfg, k) && D[k] !== undefined; }, num = 1;
  var doc = new jspdf.jsPDF({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89, M = 44, y = 0, secs = [];
  function cabeza(){ doc.setFillColor(11, 42, 58); doc.rect(0, 0, W, 34, 'F'); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('LEGAJO SST', M, 21); doc.setFont('helvetica', 'normal'); doc.text(String(t.nombre || ''), W - M, 21, { align:'right' }); doc.setTextColor(30, 30, 30); y = 62; }
  function nueva(){ doc.addPage(); cabeza(); }
  function lugar(n){ if(y + n > H - 56) nueva(); }
  function titulo(n, tx){ lugar(60); y += 6; secs.push({ n:n, t:tx, p:doc.getNumberOfPages() }); doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(11, 42, 58);
    doc.text(n + '. ' + tx, M, y); y += 7; doc.setDrawColor(200, 206, 212); doc.line(M, y, W - M, y); y += 16; doc.setTextColor(30, 30, 30); }
  function nota(tx){ doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(100, 100, 100); var l = doc.splitTextToSize(tx, W - 2 * M); lugar(l.length * 13); doc.text(l, M, y); y += l.length * 13 + 6; doc.setTextColor(30, 30, 30); }
  function texto(tx, b){ doc.setFont('helvetica', b ? 'bold' : 'normal'); doc.setFontSize(10.5); var l = doc.splitTextToSize(tx, W - 2 * M); lugar(l.length * 13.5); doc.text(l, M, y); y += l.length * 13.5 + 4; }
  /* una tabla de dos o tres columnas: fecha · qué · detalle */
  function tabla(filas, conFecha){
    var cF = conFecha ? 66 : 0, cT = (W - 2 * M - cF) * 0.48, cD = W - 2 * M - cF - cT;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(90, 90, 90); lugar(18);
    if(conFecha) doc.text('Fecha', M, y); doc.text('Registro', M + cF, y); doc.text('Detalle', M + cF + cT + 8, y); y += 5; doc.setDrawColor(225, 228, 232); doc.line(M, y, W - M, y); y += 12; doc.setTextColor(30, 30, 30);
    filas.forEach(function(f, i){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      var lt = doc.splitTextToSize(String(f.t || ''), cT - 4), ld = doc.splitTextToSize(String(f.d || ''), cD - 8), n = Math.max(lt.length, ld.length, 1);
      lugar(n * 12 + 6);
      if(conFecha) doc.text(_legF(f.f), M, y);
      doc.text(lt, M + cF, y); doc.setTextColor(80, 80, 80); doc.text(ld, M + cF + cT + 8, y); doc.setTextColor(30, 30, 30);
      y += n * 12 + 4; if(i < filas.length - 1){ doc.setDrawColor(240, 242, 244); doc.line(M, y - 7, W - M, y - 7); }
    });
    y += 6;
  }
  function seccion(n, tx, lista, conFecha, vacio){
    titulo(n, tx);
    if(lista === null) nota(D.cuenta ? 'No se pudo consultar: sin señal. Vuelve a sacar el legajo con internet.' : 'No se pudo consultar: entra a tu cuenta para traer lo que registró la obra.');
    else if(!lista.length) nota(vacio);
    else tabla(lista.slice().sort(function(a, b){ return String(b.f || '').localeCompare(String(a.f || '')); }), conFecha);
  }
  /* 1 · la carátula */
  doc.setFillColor(11, 42, 58); doc.rect(0, 0, W, 230, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(30); doc.text('LEGAJO SST', M, 110);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(14); doc.text('Seguridad y salud en el trabajo · registro del trabajador', M, 138);
  doc.setFontSize(11); doc.text([obra, emp && emp !== obra ? emp : ''].filter(Boolean).join('  ·  '), M, 190, { maxWidth:W - 2 * M });
  doc.setTextColor(30, 30, 30); y = 290;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.text(doc.splitTextToSize(String(t.nombre || ''), W - 2 * M), M, y); y += 36;
  [[(typeof docCortoDe === 'function' ? docCortoDe(t) : 'DNI'), t.dni || '—'], ['Puesto', t.puesto || '—'], ['Área', t.area || '—'], ['Ingreso', t.ingreso ? _legF(t.ingreso) : '—'], ['Situación', D.sit || '—']].forEach(function(r){
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(110, 110, 110); doc.text(String(r[0]), M, y);
    doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(String(r[1]), M + 110, y); y += 24;
  });
  y += 20; doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(110, 110, 110);
  doc.text('Emitido el ' + _legF(hoyL) + (sup ? ' por ' + sup : '') + '.', M, y); y += 15;
  doc.text(doc.splitTextToSize('Armado con OBRASST con lo registrado en la obra. Sin datos de salud fuera de la aptitud del examen médico, sin grupo sanguíneo ni contactos personales.', W - 2 * M), M, y);
  /* 2 · el índice (se llena al final, cuando se sabe la página de cada sección) */
  nueva(); var pagIndice = doc.getNumberOfPages();
  /* 3 · las secciones */
  nueva();
  titulo(num++, 'Datos del trabajador');
  texto((typeof docCortoDe === 'function' ? docCortoDe(t) : (t.td || 'DNI')) + ': ' + (t.dni || '—') + ' · Puesto: ' + (t.puesto || '—') + (t.area ? ' · Área: ' + t.area : ''));
  texto('Ingreso: ' + (t.ingreso ? _legF(t.ingreso) : 'no registrado') + ' · Situación: ' + (D.sit || '—') + (t.ubicacion ? ' · Ubicación: ' + t.ubicacion : ''));
  if(D.tar && legSecOn(cfg, 'tar')) texto('Tareo de los últimos 30 días: ' + D.tar.dias + (D.tar.dias === 1 ? ' día · ' : ' días · ') + D.tar.h + ' horas.');
  if(on('ind')){ titulo(num++, 'Inducción');
    if(D.ind === null) nota(D.cuenta ? 'No se pudo consultar: sin señal. Vuelve a sacar el legajo con internet.' : 'No se pudo consultar: entra a tu cuenta para traer lo que registró la obra.');
    else { if(D.ind.est) texto(D.ind.est, true); if(D.ind.filas.length) tabla(D.ind.filas, true); else if(!D.ind.est) nota('Sin inducción registrada en la app.'); } }
  if(on('difu')) seccion(num++, 'Documentos difundidos y firmados', D.difu, true, 'No leyó ni firmó documentos desde su celular.');
  if(on('caps')) seccion(num++, 'Capacitaciones y evaluaciones', D.caps, true, 'No hay constancias a su nombre todavía.');
  if(on('hab')){ titulo(num++, 'Habilitaciones');
    if(!D.hab || !D.hab.length) nota('Sin habilitaciones registradas.'); else tabla(D.hab, false); }
  if(on('epp')) seccion(num++, 'EPP entregado', D.epp, true, 'Sin entregas de EPP registradas.');
  if(on('emo')){ titulo(num++, 'Examen médico ocupacional (aptitud)');
    if(D.emo === 'plan') nota('El examen médico se lleva con el plan que lo trae: aquí no se consulta.');
    else if(D.emo === null) nota(D.cuenta ? 'No se pudo consultar: sin señal.' : 'No se pudo consultar: entra a tu cuenta.');
    else if(!D.emo.f) nota('Sin examen registrado.');
    else { texto(D.emo.tipo + ' · ' + _legF(D.emo.f) + (D.emo.apt ? ' · ' + D.emo.apt : ''), true); texto('Próximo: ' + (D.emo.prox ? _legF(D.emo.prox) : 'sin fecha') + (D.emo.est ? ' · ' + D.emo.est : '')); } }
  if(on('sctr')){ titulo(num++, 'SCTR');
  if(D.sctr === null) nota(D.cuenta ? 'No se pudo consultar el SCTR: sin señal.' : 'No se pudo consultar el SCTR: entra a tu cuenta.');
  else { texto('Hoy: ' + D.sctr.est, true); if(D.sctr.r) texto([D.sctr.r.aseg, D.sctr.r.pol ? 'póliza ' + D.sctr.r.pol : '', (D.sctr.r.de && D.sctr.r.a) ? 'vigente del ' + _legF(D.sctr.r.de) + ' al ' + _legF(D.sctr.r.a) : ''].filter(Boolean).join(' · ')); } }
  if(on('amon')) seccion(num++, 'Amonestaciones', D.amon, true, 'Ninguna.');
  if(on('acc')) seccion(num++, 'Incidentes y accidentes', D.acc, true, 'No estuvo en ningún incidente ni accidente registrado.');
  if(on('ats')){ titulo(num++, 'ATS firmados');
    texto(D.ats.n ? D.ats.n + (D.ats.n === 1 ? ' ATS firmado' : ' ATS firmados') + (D.ats.ult ? ' · el último, el ' + _legF(D.ats.ult) : '') + '.' : (D.srv ? 'Sin ATS firmados registrados en la obra.' : 'Sin ATS firmados en este celular.')); }
  /* el índice, en su hoja */
  doc.setPage(pagIndice); y = 62;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(11, 42, 58); doc.text('Índice', M, y); y += 28; doc.setTextColor(30, 30, 30);
  secs.forEach(function(s){ doc.setFont('helvetica', 'normal'); doc.setFontSize(11.5); doc.text(s.n + '.  ' + s.t, M, y);
    doc.setTextColor(150, 150, 150); var wT = doc.getTextWidth(s.n + '.  ' + s.t), xP = W - M - 30; var pts = ''; while(doc.getTextWidth(pts + ' .') < xP - M - wT - 12) pts += ' .'; doc.text(pts, M + wT + 4, y);
    doc.setTextColor(30, 30, 30); doc.text(String(s.p), W - M, y, { align:'right' }); y += 22; });
  /* «Página X de N» en todas */
  var N = doc.getNumberOfPages();
  for(var i = 1; i <= N; i++){ doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(120, 120, 120);
    doc.text('Legajo SST · ' + String(t.nombre || '') + ' · Página ' + i + ' de ' + N, W / 2, H - 24, { align:'center' }); }
  return doc;
}
/* ── de la app · la alarma de simulacro ── */
var ALR_MSG = { sismo:'Protégete donde estás hasta que pare. Después, evacúa con calma al punto de reunión.',
                incendio:'Evacúa con calma por la ruta sin humo al punto de reunión.',
                derrame:'Aléjate del derrame y evacúa con calma al punto de reunión.' };
var ALR_MSG_GEN = 'Evacúa con calma por la ruta señalizada al punto de reunión.';
function alrMsgDe(tipo){ return ALR_MSG[tipo] || ALR_MSG_GEN; }
  return {
    usar: function(C){ _C = C || {}; return this; },
    /* el tareo: las horas de una persona en un día (z = { n, d, m:[[ms, 'e'|'s', de]], x:[ms anuladas] }) y cómo se juntan dos registros */
    TAR_CFG_DEF: TAR_CFG_DEF, tarDoc: _tarDoc, tarK: _tarK, tarHora: _tarHora, tarUnir: _tarUnir, tarFirma: _tarFirma, tarMarcas: _tarMarcas, tarPares: _tarPares, tarHorasDe: tarHorasDe,
    /* el parte del día: D con la forma de parteDatos de la app → el texto (WhatsApp, correo) y el PDF (jsPDF) */
    ATS_EST: ATS_EST, parteTextoDe: parteTextoDe, parteDoc: function(D, obra, sup){ return parteDoc(D, obra || '', sup || ''); },
    /* los primeros auxilios: los seis casos de la app, el paquete de la obra (sst_doc hoja «auxilios») limpio y cómo se juntan */
    PA_CASOS: PA_CASOS, PA_PIE: PA_PIE, paAuxLimpio: paAuxLimpio, paCasosDe: paCasosDe, paNotasLineas: paNotasLineas,
    /* la caída libre: los datos (c: como los guarda la app, en texto), la cuenta, qué hacer, el dibujo y el texto; una cuenta de la obra (sst_doc hoja «caida») */
    CL_DEF: CL_DEF, CL_TOPE: CL_TOPE, CL_MAL: CL_MAL, CL_DATOS: CL_DATOS, CL_BARANDA: CL_BARANDA, HOJA_CAIDA: HOJA_CAIDA, clDatos: clDatos, clCalcular: clCalcular, clAnclajeAltura: clAnclajeAltura,
    clQueHacer: clQueHacer, clVeredicto: _caVeredicto, clFila: _caFila, clDibujo: _caDibujo, clTextoDe: clTextoDe, clM: _caM, clNum: _caNum, cdlLimpio: cdlLimpio, cdlNota: cdlNota,
    /* el legajo: sus secciones y su configuración (sst_estado «legajo_cfg»), lo del servidor (sst_legajo_de) con la forma de la app, y su PDF */
    LEG_SECS: LEG_SECS, legCfgLimpio: legCfgLimpio, legSecOn: legSecOn, legDeServidor: legDeServidor, legPdfDe: legPdfDe,
    /* la alarma de simulacro: el «qué hacer» de cada tipo, el de la app */
    alrMsgDe: alrMsgDe
  };
})();
