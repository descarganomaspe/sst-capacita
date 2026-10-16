/* ══════════════════════════════════════════════════════════════════
   OBRASST · el portal · EL RESUMEN EJECUTIVO, CON LAS CIFRAS DE LA TORRE
   15/10/2026 (lote 13) · Marcelo: «No me gusta la forma en como se ha
   convertido la web, el resumen, dónde lo has vuelto la torre de control,
   quiero que sea como el de antes, osea el mismo diseño del de antes pero
   con la información de la torre de control, solo ello porque marea eso
   que has creado».
   El lote 12 metió en la web la Torre de la app entera: su cabecera
   oscura, su columna, sus filtros y sus seis páginas, dentro de una
   sección. Mareaba. Ahora la sección vuelve a ser el «Resumen ejecutivo»
   de siempre —las cifras, «Programado para hoy», las barras por mes, las
   tablas, con la letra y las tarjetas de la web—, pero lo que dice sale
   de la Torre: todas las obras, las mismas cuentas y las mismas metas que
   la app. Las cuentas las hace portal/torre-app.js (armar.py lo saca de
   la app, tal cual); aquí solo se pinta, para que nada se cuente dos
   veces de dos maneras. La meta que se cambia aquí es la de la app, y al
   revés (sst_estado «torre» de la empresa).
   ══════════════════════════════════════════════════════════════════ */
var TW = { caja:null, css:false, ultimo:0, hoyT:0 };

/* ── lo que la Torre le pide a la web (en la app son las suyas) ── */
/* la empresa (la madre) aunque esté elegida una de sus obras: las metas de la Torre son de toda la empresa, como en la app */
function _torEmp(){
  var o = (typeof YO!=='undefined' && YO) ? YO.obra : null; if(!o) return null;
  return o.padre_id ? { id:o.padre_id, nombre:o.padre_nombre || o.nombre, codigo:o.codigo, obra:o.id } : { id:o.id, nombre:o.nombre, codigo:o.codigo };
}
function _torConCuenta(){ return !!(typeof TOK!=='undefined' && TOK && TOK.access_token); }
function _torCorreo(){ return (typeof TOK!=='undefined' && TOK && TOK.correo) || ''; }
function _torYo(){ return (typeof YO!=='undefined' && YO && YO.nombre) || _torCorreo(); }
function _torPapel(){ return 'LÍDER SSOMA'; }
function _torPost(tabla, obj){
  return sbFetch(SB.url+'/rest/v1/'+tabla, {method:'POST', body:JSON.stringify(obj)})
    .then(function(r){ return r.ok ? true : Promise.reject(r.status); });
}
/* el PATCH de la web devuelve las filas tocadas: si no tocó ninguna, no se guardó */
function _torPatch(ruta, obj){ return sbPatch(ruta, obj).then(function(f){ return (Array.isArray(f) && f.length) ? true : Promise.reject(0); }); }
function _torAviso(tit, tx){ toast(tit + (tx ? ' · ' + tx : '')); }
/* la Torre de la app no se pinta en la web: su reloj y su «al volver a la pestaña» quedan quietos (el resumen se
   refresca con lo de la web: el vivo, el sondeo y la vuelta a la pestaña llaman a VISTA.recargar) */
function _torActiva(){ return false; }
function _torCasco(entra){}
function _torRailCambiar(){}
function _torAlInicio(){ try{ navegar('equipo'); }catch(_e){} }

/* ── lo poco que el resumen suma a lo de la web: una barra acostada, la lista de pendientes, el cambio de la semana ── */
function _rsEstilos(){
  if(TW.css || document.getElementById('rs-css')){ TW.css = true; return; }
  var s = document.createElement('style'); s.id = 'rs-css';
  s.textContent =
    '.rs-fil{margin:0 0 16px}' +
    '.rs-fil select{min-width:0;max-width:100%}' +
    '.cifra .pie.rs-d{font-size:12px;font-weight:500}' +
    '.cifra .pie.rs-sube{color:var(--ok)}.cifra .pie.rs-baja{color:var(--mal)}' +
    '.rs-al{padding:4px 18px 8px}' +
    '.rs-al-f{display:grid;grid-template-columns:8px minmax(0,1fr);gap:12px;align-items:start;padding:10px 0;border-bottom:1px solid var(--raya)}' +
    '.rs-al-f:last-child{border-bottom:0}' +
    '.rs-al-f .pt{width:8px;height:8px;border-radius:50%;margin-top:6px;background:var(--ojo)}' +
    '.rs-al-f .pt.mal{background:var(--mal)}' +
    '.rs-al-f b{display:block;font-weight:600;font-size:13.5px;color:var(--texto)}' +
    '.rs-al-f span{display:block;font-size:12.5px;color:var(--gris);margin-top:1px}' +
    '.rs-hb{display:flex;flex-direction:column;gap:12px}' +
    '.rs-hb-f{display:grid;grid-template-columns:minmax(80px,1.2fr) minmax(0,2fr) auto;gap:10px;align-items:center;font-size:13px;color:var(--texto)}' +
    '.rs-hb-f .et{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.rs-hb-f .riel{height:8px;border-radius:4px;background:var(--fondo);box-shadow:inset 0 0 0 1px var(--raya);overflow:hidden}' +
    '.rs-hb-f .riel i{display:block;height:100%;border-radius:4px;background:var(--tinta)}' +
    '.rs-hb-f .riel i.ok{background:var(--ok)}.rs-hb-f .riel i.ojo{background:var(--ojo)}.rs-hb-f .riel i.mal{background:var(--mal)}' +
    '.rs-hb-f .n{font-variant-numeric:tabular-nums;font-weight:600;color:var(--tinta);white-space:nowrap}' +
    '.rs-ap{display:flex;gap:2px;height:16px;border-radius:6px;overflow:hidden;background:var(--fondo)}' +
    '.rs-ap i{display:block;height:100%}' +
    '.rs-ley{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:12px;font-size:13px;color:var(--texto)}' +
    '.rs-ley .pt{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px}' +
    '.rs-ley b{font-variant-numeric:tabular-nums;margin-left:4px;font-weight:600}' +
    '.rs-ley small{color:var(--gris);margin-left:4px}' +
    'td.rs-ok{color:var(--ok)}td.rs-mal{color:var(--mal)}' +
    'tfoot td{font-weight:600;border-top:1px solid var(--raya2);background:#FAFBFC}' +
    '.rs-pie{margin:4px 0 0}' +
    /* ocho cifras: cuatro por fila en la computadora (no cinco y tres); en el celular, dos por fila (no ocho, una debajo de otra) */
    '@media (min-width:1000px){#rs-rej{grid-template-columns:repeat(4,minmax(0,1fr))}}' +
    '@media (max-width:640px){#rs-rej{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#rs-rej .cifra{padding:12px 12px 11px}' +
    '#rs-rej .cifra .v{font-size:23px}#rs-rej .cifra .et,#rs-rej .cifra .pie{font-size:12px}}' +
    '#rs-ult table{min-width:540px}';
  document.head.appendChild(s); TW.css = true;
}

function _rsS(){ return TORRE_APP.estado(); }
function _rsK(){ return TORRE_APP.calc; }
function _rsN(x, d){ return _rsK().num(x, d); }
function _rsPl(n, uno, varios){ return n === 1 ? uno : varios; }
var _RS_MM = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'];

/* una cifra como las de siempre (cifra() de la web), con sus líneas de abajo: la primera dice cómo está; la del cambio
   contra la semana pasada va en verde o en rojo según convenga */
function _rsCifra(et, v, unidad, cl, pies){
  return '<div class="cifra'+(cl?' '+cl:'')+'"><span class="et">'+esc(et)+'</span>'+
    '<span class="v">'+esc(v)+(unidad?'<small>'+esc(unidad)+'</small>':'')+'</span>'+
    (pies||[]).filter(Boolean).map(function(p){
      return (typeof p === 'string') ? '<span class="pie">'+esc(p)+'</span>' : '<span class="pie '+p.cl+'">'+esc(p.t)+'</span>';
    }).join('')+'</div>';
}
/* el cambio contra la semana pasada (como la Torre: «malo» es cuando subir es peor) */
function _rsDelta(ahora, antes, malo, unidad){
  if(!ahora && !antes) return {t:'sin movimiento en dos semanas', cl:'rs-d'};
  var d = ahora - antes;
  if(!d) return {t:'igual que la semana pasada', cl:'rs-d'};
  var bien = malo ? d < 0 : d > 0;
  return {t:(d > 0 ? '▲ ' : '▼ ')+_rsN(Math.abs(d))+(unidad ? ' '+unidad : '')+' vs. semana pasada', cl:'rs-d '+(bien ? 'rs-sube' : 'rs-baja')};
}
function _rsBarrasH(filas){
  return '<div class="rs-hb">'+filas.map(function(f){
    var pct = f.tope ? Math.min(100, Math.round(f.v*100/f.tope)) : 0;
    return '<div class="rs-hb-f"><span class="et" title="'+esc(f.et)+'">'+esc(f.et)+'</span>'+
      '<span class="riel"><i class="'+(f.cl||'')+'" style="width:'+(f.v ? Math.max(pct, 3) : 0)+'%"></i></span>'+
      '<span class="n">'+esc(f.txt)+'</span></div>';
  }).join('')+'</div>';
}
function _rsTarj(t, sub, cuerpo, id){
  return '<div class="tarj"'+(id?' id="'+id+'"':'')+'><div class="tarj-cab"><div><h2>'+esc(t)+'</h2>'+(sub?'<p class="sub">'+esc(sub)+'</p>':'')+'</div></div>'+cuerpo+'</div>';
}
function _rsVacio(b, t){ return '<div class="vacio"><b>'+esc(b)+'</b>'+esc(t)+'</div>'; }
function _rsHora(){
  var S=_rsS(); if(!S.cuando) return '';
  try{ return new Date(S.cuando).toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'}); }catch(e){ return ''; }
}

/* ══ la sección ══ */
function torrewResumen(caja){
  /* 16/10/2026 · si mientras se cargaba la Torre ya se fue a otra sección, no se pinta nada: ni la caja vieja
     ni los botones de arriba, que ya son de la otra sección */
  if(!caja || !document.body.contains(caja)) return;
  _rsEstilos();
  TW.caja = caja; TW.hoyT = 0;
  var ac = $('acciones');
  if(ac){
    ac.innerHTML = '<button type="button" class="bt sec" id="rs-xlsx" title="Las cifras de todas tus obras y los accidentes del año">Descargar Excel</button>'+
                   '<button type="button" class="bt sec" id="rs-metas" title="Con ellas se pintan las cifras en verde, ámbar o rojo, aquí y en la app">Metas</button>';
    $('rs-xlsx').onclick = function(){ if(_rsS().listo) tcExcel(); else toast('Un momento: todavía se están juntando tus obras.'); };
    $('rs-metas').onclick = rsMetas;
  }
  var S = _rsS();
  if(S.listo) rsPintar(true); else caja.innerHTML = '<div class="vacio">Juntando tus obras…</div>';
  /* entrar es pedir lo último: se pide por detrás, sin tapar lo que ya se ve */
  rsCargar(S.listo);
  /* lo que llega en vivo: se vuelve a pedir, no más de una vez cada 30 s; «Programado para hoy», cada 5 minutos */
  VISTA.recargar = function(){
    if(!_rsVivo()) return;
    var S2 = _rsS();
    if(S2.cargando || Date.now() - (TW.ultimo || 0) < 30000) return;
    rsCargar(true);
  };
}
function _rsVivo(){ return !!(TW.caja && document.body.contains(TW.caja)); }
function _rsEspera(){
  return new Promise(function(listo){ (function mira(){ if(!_rsS().cargando) listo(); else setTimeout(mira, 250); })(); });
}
function rsCargar(callado){
  TW.ultimo = Date.now();
  var p = _rsS().cargando ? _rsEspera() : TORRE_APP.cargar(!!callado);
  return p.then(function(){ rsPintar(Date.now() - (TW.hoyT || 0) > 300000); }, function(){ rsPintar(false); });
}

function rsPintar(nuevoHoy){
  var caja = TW.caja; if(!_rsVivo()) return;
  var S = _rsS(), K = _rsK();
  if(!S.listo){
    if(S.cargando) caja.innerHTML = '<div class="vacio">Juntando tus obras…</div>';
    else fallo(caja, 0);
    return;
  }
  if(!S.proy.length){
    caja.innerHTML = _rsVacio('Todavía no hay obras', 'El resumen junta las obras en las que estás con tu cuenta. Se crean en «Obras y equipo».');
    return;
  }
  /* la obra elegida en el filtro ya no está (se quitó): vuelven todas */
  if(S.sel !== '*' && !S.proy.some(function(p){ return p.id === S.sel; })) S.sel = '*';
  var cfg = K.cfg(), ps = K.sel(), mes = S.mes || K.mesISO(), anio = S.anio;
  var I = K.indices(ps), E = K.epp(ps, mes), R = K.reps(ps), P = K.pulso(ps);
  var rachas = K.rachas(ps).filter(function(r){ return r.dias !== null; }).sort(function(a, b){ return a.dias - b.dias; });
  var corta = rachas[0] || null;
  var tocan = 0, hechas = 0;
  ps.forEach(function(p){ tocan += K.inspToca(p); hechas += K.inspHechas(p, mes); });
  var pctC = tocan ? Math.round(hechas*100/tocan) : null;
  var pctP = E.tot ? Math.round(E.P*100/E.tot) : 0;
  var sinCump = (typeof vistaOcultaPais === 'function') && vistaOcultaPais('cump');
  var h = '';

  /* lo que no se pudo leer se dice: un cero por falta de respuesta se ve igual que un cero de verdad */
  var F = K.fallos(), malas = {};
  ps.forEach(function(p){ Object.keys(F[p.id] || {}).forEach(function(k){ (malas[k] = malas[k] || []).push(p.nombre); }); });
  var qm = Object.keys(malas);
  if(qm.length) h += '<div class="aviso ojo" id="rs-fallo"><b>Esto no se pudo leer:</b> '+esc(qm.join(', '))+
    (S.proy.length > 1 ? ' ('+esc(malas[qm[0]].join(', '))+')' : '')+'. No es que no haya: el servidor no contestó, y lo que veas de eso está incompleto. Toca «Actualizar»; si sigue igual, avísanos.</div>';

  /* el filtro de obras y el mes de cierre, como los filtros de las otras secciones */
  var ob = '<option value="*"'+(S.sel === '*' ? ' selected' : '')+'>Todas las obras ('+S.proy.length+')</option>'+
    S.proy.map(function(p){ return '<option value="'+esc(p.id)+'"'+(S.sel === p.id ? ' selected' : '')+'>'+esc(p.nombre)+'</option>'; }).join('');
  var me = '';
  for(var i = 0; i < 18; i++){
    var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    var x = d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);
    me += '<option value="'+x+'"'+(x === mes ? ' selected' : '')+'>Cierre '+esc(K.mesBonito(x))+'</option>';
  }
  var sinSenal = S.fallo && S.fallo > (S.cuando || 0), min = Math.floor((Date.now() - (S.cuando || 0))/60000);
  h += '<div class="pind-filtros rs-fil" id="rs-filtros">'+
       (S.proy.length > 1 ? '<select id="rs-obra" aria-label="Obras">'+ob+'</select>' : '')+
       '<select id="rs-mes" aria-label="Mes de cierre">'+me+'</select>'+
       '<span class="pind-nota" id="rs-fresco">'+(S.cargando ? 'Actualizando…' : (sinSenal ? 'Sin señal · datos de las ' : 'Datos de las ')+esc(_rsHora())+(min >= 2 && !S.cargando ? ' · hace '+min+' min' : ''))+'</span>'+
       '<button type="button" class="bt-link" id="rs-act">Actualizar</button></div>';

  /* ── las cifras: las de la Torre de la app, con sus metas ── */
  var pctOk = P.cap[0] ? Math.round(P.capOk[0]*100/P.cap[0]) : null;
  h += '<div class="rej" id="rs-rej">';
  h += _rsCifra('Reportes abiertos', _rsN(P.abiertos), '', P.viejos ? 'mal' : (P.abiertos ? 'ojo' : 'ok'), [
         (P.viejos ? P.viejos+' con más de '+cfg.diasRep+' días' : (P.abiertos ? 'todos dentro de plazo' : 'nada pendiente'))+' · '+
         P.repN[0]+' '+_rsPl(P.repN[0], 'nuevo', 'nuevos')+' esta semana',
         _rsDelta(P.repN[0], P.repN[1], true, '')]);
  h += _rsCifra('Capacitaciones esta semana', _rsN(P.cap[0]), '', P.cap[0] ? (pctOk >= 80 ? 'ok' : (pctOk >= 60 ? 'ojo' : 'mal')) : '', [
         P.cap[0] ? pctOk+' % aprobaron' : 'nadie rindió esta semana',
         _rsDelta(P.cap[0], P.cap[1], false, '')]);
  h += _rsCifra('Horas hombre esta semana', _rsN(P.hht[0]), '', P.hht[0] ? '' : 'mal', [
         P.hht[0] ? 'reporte semanal al día' : 'sin reporte semanal: sin horas hombre no hay índices',
         _rsDelta(P.hht[0], P.hht[1], false, 'h')]);
  if(cfg.ver.epp) h += _rsCifra('EPP entregado esta semana', _rsN(P.epp[0]), 'und', (E.tot && pctP > cfg.metaPerd) ? 'ojo' : '', [
         E.tot ? pctP+' % por pérdida en el mes' : 'nada registrado este mes',
         _rsDelta(P.epp[0], P.epp[1], false, 'und')]);
  if(cfg.ver.racha) h += _rsCifra('Días sin accidentes', corta ? _rsN(corta.dias) : '—', corta ? 'días' : '',
         corta ? ((corta.origen === 'registro' || corta.dias >= 30) ? 'ok' : 'ojo') : '', [
         corta ? (corta.origen === 'registro' ? (ps.length > 1 ? corta.p.nombre+': sin accidentes desde su primer registro ('+fechaLarga(corta.desde)+')'
                                                               : 'sin accidentes desde el primer registro ('+fechaLarga(corta.desde)+')')
                                              : (ps.length > 1 ? 'la racha más corta: '+corta.p.nombre : 'desde el último accidente'))
               : 'todavía no hay registros en '+anio,
         P.buenas[0] ? P.buenas[0]+' '+_rsPl(P.buenas[0], 'buena práctica', 'buenas prácticas')+' esta semana' : '']);
  if(cfg.ver.cump) h += _rsCifra('Inspecciones del mes', pctC === null ? '—' : String(pctC), pctC === null ? '' : '%',
         pctC === null ? '' : (pctC >= cfg.metaCump ? 'ok' : (pctC >= 80 ? 'ojo' : 'mal')), [
         pctC === null ? 'sin inspecciones obligatorias' : hechas+' de '+tocan+' hechas en '+K.mesBonito(mes),
         pctC === null ? '' : 'al día desde el '+cfg.metaCump+' %']);
  if(cfg.ver.ifr) h += _rsCifra('Índice de frecuencia', I.IF === null ? '—' : _rsN(I.IF, 2), '', I.IF === null ? '' : (I.IF <= cfg.metaIF ? 'ok' : 'mal'), [
         I.IF === null ? 'faltan las horas hombre del año' : (I.IF <= cfg.metaIF ? 'dentro de la meta ('+cfg.metaIF+')' : 'sobre la meta de '+cfg.metaIF),
         I.n+' '+_rsPl(I.n, 'accidente', 'accidentes')+' con incapacidad · '+_rsN(I.hht)+' HHT en '+anio]);
  if(cfg.ver.isv) h += _rsCifra('Índice de severidad', I.IS === null ? '—' : _rsN(I.IS, 1), '', I.IS === null ? '' : (I.IS <= cfg.metaIS ? 'ok' : 'ojo'), [
         _rsN(I.dias)+' '+_rsPl(I.dias, 'día perdido', 'días perdidos')+' en '+anio,
         'IA '+(I.IA === null ? '—' : _rsN(I.IA, I.IA < 1 ? 3 : 2))+' · meta del IS: '+cfg.metaIS]);
  h += '</div>';

  /* ── lo que espera una decisión (en todas las obras) ── */
  var al = K.alertas();
  if(al.length) h += _rsTarj('Necesita tu decisión', 'Lo que está parado esperándote, en '+(S.proy.length > 1 ? 'todas tus obras' : 'tu obra'),
    '<div class="rs-al">'+al.map(function(a){
      return '<div class="rs-al-f"><i class="pt'+(/critico/.test(a.c || '') ? ' mal' : '')+'"></i><div><b>'+esc(a.t)+'</b><span>'+esc(a.d)+'</span></div></div>';
    }).join('')+'</div>', 'rs-al');

  /* ── por mes, en el año del cierre: lo de siempre, de todas las obras ── */
  var hasta = (String(anio) === mes.slice(0, 4)) ? (parseInt(mes.slice(5, 7), 10) || 12) : 12;
  var sC = [], sR = [];
  for(var m = 1; m <= hasta; m++){
    var ym = anio+'-'+('0'+m).slice(-2), nc = 0, nr = 0;
    ps.forEach(function(p){
      var dd = K.d(p.id);
      dd.cons.forEach(function(c){ if(String(c.fecha || '').slice(0, 7) === ym) nc++; });
      dd.rep.forEach(function(r){ if(String(r.fecha || '').slice(0, 7) === ym) nr++; });
    });
    sC.push({t:_RS_MM[m-1], v:nc}); sR.push({t:_RS_MM[m-1], v:nr, cl:'mal'});
  }
  var tR = _rsTarj('Reportes por mes', R.tot ? (R.cerrados+' '+_rsPl(R.cerrados, 'cerrado', 'cerrados')+' · '+Math.max(0, R.abiertos - R.viejos)+' abiertos en plazo · '+
                     R.viejos+' con más de '+cfg.diasRep+' días, en '+anio) : 'Actos y condiciones desde el celular, en '+anio,
    '<div class="tarj-cuerpo">'+(R.tot ? barras(sR) : '<p class="ayuda" style="margin:0">Ningún reporte este año. Cero reportes casi nunca quiere decir que no pasa nada: quiere decir que no se está reportando.</p>')+'</div>');
  h += sinCump ? tR : '<div class="dos">'+
    _rsTarj('Constancias por mes', 'Evaluaciones y talleres cerrados en '+anio, '<div class="tarj-cuerpo">'+barras(sC)+'</div>')+tR+'</div>';

  /* ── el mes de cierre: inspecciones de cada obra y el EPP que salió ── */
  var tI = _rsTarj('Inspecciones del mes, obra por obra', 'Lo hecho contra lo que exige el sector de cada obra, en '+K.mesBonito(mes),
    '<div class="tarj-cuerpo">'+_rsBarrasH(ps.map(function(p){
      var t = K.inspToca(p), x = K.inspHechas(p, mes), pc = t ? Math.round(x*100/t) : 0;
      return {et:p.nombre, v:x, tope:t || 1, txt:x+' de '+t, cl:(!t ? '' : (pc >= cfg.metaCump ? 'ok' : (pc >= 80 ? 'ojo' : 'mal')))};
    }))+'</div>');
  var tE = _rsTarj('Consumo de EPP del mes', 'Lo entregado en '+K.mesBonito(mes)+', por motivo. La pérdida es plata que se va sin proteger a nadie.',
    '<div class="tarj-cuerpo">'+(E.tot ? (function(){
      var partes = [{et:'Nuevo', v:E.N, col:'var(--ok)'}, {et:'Cambio por desgaste', v:E.C, col:'var(--azul)'}, {et:'Pérdida', v:E.P, col:'var(--mal)'}];
      return '<div class="rs-ap" role="img" aria-label="'+esc(partes.map(function(q){ return q.et+' '+q.v; }).join(', '))+'">'+
        partes.map(function(q){ return q.v ? '<i style="width:'+(q.v*100/E.tot).toFixed(2)+'%;background:'+q.col+'"></i>' : ''; }).join('')+'</div>'+
        '<div class="rs-ley">'+partes.map(function(q){ return '<span><i class="pt" style="background:'+q.col+'"></i>'+esc(q.et)+'<b>'+_rsN(q.v)+'</b><small>'+Math.round(q.v*100/E.tot)+' %</small></span>'; }).join('')+'</div>'+
        '<p class="ayuda" style="margin-top:12px">'+_rsN(E.tot)+' unidades en el mes · la pérdida aceptable es hasta el '+cfg.metaPerd+' %.</p>';
    })() : '<p class="ayuda" style="margin:0">No hay entregas de EPP registradas en el kardex este mes.</p>')+'</div>');
  h += '<div class="dos">'+tI+tE+'</div>';

  /* ── obra por obra: la tabla de la Torre ── */
  var T = {x:0, t:0, rep:0, ab:0, cap:0, epp:0, per:0};
  var filas = S.proy.map(function(p){
    var dd = K.d(p.id), t = K.inspToca(p), x = K.inspHechas(p, mes), rep = 0, ab = 0, cap = 0;
    dd.rep.forEach(function(r){ if(String(r.fecha || '').slice(0, 7) === mes){ rep++; if(r.estado !== 'atendido') ab++; } });
    dd.cons.forEach(function(c){ if(String(c.fecha || '').slice(0, 7) === mes) cap++; });
    var epp = K.epp([p], mes).tot, per = dd.trab.filter(function(w){ return (w.estatus || 'activo') === 'activo'; }).length;
    var ra = K.rachas([p])[0];
    T.x += x; T.t += t; T.rep += rep; T.ab += ab; T.cap += cap; T.epp += epp; T.per += per;
    return '<tr><td>'+(S.proy.length > 1 ? '<button type="button" class="bt-link" data-obra="'+esc(p.id)+'" title="Ver solo esta obra">'+esc(p.nombre)+'</button>' : '<b>'+esc(p.nombre)+'</b>')+
      '<span class="sub">'+esc(p.codigo || '')+'</span></td>'+
      '<td class="num '+((t && x >= t) ? 'rs-ok' : (t ? 'rs-mal' : ''))+'">'+x+' de '+t+'</td>'+
      '<td class="num '+(ab ? 'rs-mal' : '')+'">'+rep+(ab ? ' ('+ab+' '+_rsPl(ab, 'abierto', 'abiertos')+')' : '')+'</td>'+
      '<td class="num">'+cap+'</td><td class="num">'+_rsN(epp)+'</td><td class="num">'+per+'</td>'+
      '<td class="num">'+(ra && ra.dias !== null ? ra.dias : '—')+'</td></tr>';
  });
  h += _rsTarj('Obra por obra', 'Lo del mes de '+K.mesBonito(mes)+' en cada obra'+(S.proy.length > 1 ? ' · toca el nombre para ver solo esa' : ''),
    '<div class="tabla-caja"><table><thead><tr><th>Obra</th><th class="num">Inspecciones</th><th class="num">Reportes</th><th class="num">Capacitaciones</th>'+
    '<th class="num">EPP (und)</th><th class="num">Personal</th><th class="num">Días sin accidentes</th></tr></thead><tbody>'+filas.join('')+'</tbody>'+
    (S.proy.length > 1 ? '<tfoot><tr><td>Todas</td><td class="num">'+T.x+' de '+T.t+'</td><td class="num">'+T.rep+(T.ab ? ' ('+T.ab+' '+_rsPl(T.ab, 'abierto', 'abiertos')+')' : '')+'</td>'+
      '<td class="num">'+T.cap+'</td><td class="num">'+_rsN(T.epp)+'</td><td class="num">'+T.per+'</td><td class="num">'+(corta && S.sel === '*' ? corta.dias : '—')+'</td></tr></tfoot>' : '')+
    '</table></div>', 'rs-obras');

  /* ── lo último que pasó, venga de donde venga (de todas las obras) ── */
  var ult = [];
  ps.forEach(function(p){
    var dd = K.d(p.id);
    if(!sinCump) dd.cons.slice(0, 8).forEach(function(c){ ult.push({f:c.fecha, o:p.nombre, t:'Constancia · '+(c.tema || ''), s:c.resultado || ''}); });
    dd.rep.slice(0, 8).forEach(function(r){ ult.push({f:r.fecha, o:p.nombre, t:'Reporte · '+(typeof claseCorta === 'function' ? claseCorta(r.clase) : (r.clase || '')), s:r.estado === 'atendido' ? 'cerrado' : 'abierto'}); });
    dd.kdx.slice(0, 8).forEach(function(k){ ult.push({f:k.fecha, o:p.nombre, t:'EPP · '+(k.epp || ''), s:(parseInt(k.cantidad, 10) || 1)+' und'}); });
    dd.insp.slice(0, 8).forEach(function(x){ ult.push({f:x.fecha, o:p.nombre, t:'Inspección · '+(x.tipo || ''), s:x.inspector || ''}); });
    dd.acc.slice(0, 8).forEach(function(a){ ult.push({f:a.fecha, o:p.nombre, t:'Accidente · '+K.accClase(a.clase).n, s:(parseInt(a.dias, 10) || 0)+' '+_rsPl(parseInt(a.dias, 10) || 0, 'día', 'días')}); });
  });
  ult.sort(function(a, b){ return String(b.f || '').localeCompare(String(a.f || '')); });
  var varias = ps.length > 1;
  h += _rsTarj('Lo último', 'Lo más reciente'+(varias ? ' de tus obras' : ' de la obra')+', venga de donde venga',
    ult.length ? '<div class="tabla-caja"><table><tbody>'+ult.slice(0, 12).map(function(u){
      return '<tr><td style="white-space:nowrap;color:var(--gris)">'+esc(fechaLarga(u.f))+'</td>'+(varias ? '<td>'+esc(u.o)+'</td>' : '')+'<td>'+esc(u.t)+'</td><td>'+esc(u.s)+'</td></tr>';
    }).join('')+'</tbody></table></div>'
    : _rsVacio('Todavía no hay movimiento', 'Cuando la obra empiece a registrar, esto se llena solo.'), 'rs-ult');
  h += '<p class="ayuda rs-pie">Son las cifras de la Torre de control de la app: las mismas cuentas y las mismas metas, en la web y en el celular. '+
       'El detalle de cada tema está en su sección del menú.</p>';

  /* «Programado para hoy» (de la obra abierta arriba) se guarda mientras se repinta: no se vuelve a pedir con cada filtro */
  var hoy = $('hoy-prog');
  if(hoy && hoy.parentNode) hoy.parentNode.removeChild(hoy);
  caja.innerHTML = h;
  if(hoy && !nuevoHoy){
    var rj = $('rs-rej'); caja.insertBefore(hoy, rj ? rj.nextSibling : caja.firstChild);
  } else {
    TW.hoyT = Date.now();
    try{ if(typeof hoyProgramadoEn === 'function') hoyProgramadoEn(caja); }catch(_hp){}
    hoy = $('hoy-prog');
    var sb = hoy && hoy.querySelector('.tarj-cab .sub');
    if(sb && S.proy.length > 1 && YO && YO.obra) sb.textContent += ' · ' + (YO.obra.nombre || '');
  }
  /* lo que espera una decisión va antes que lo programado */
  var alC = $('rs-al'); hoy = $('hoy-prog');
  if(alC && hoy) caja.insertBefore(hoy, alC.nextSibling);
  try{ if(typeof prqAvisoInicio === 'function') prqAvisoInicio(caja); }catch(_rq){}

  var so = $('rs-obra'); if(so) so.onchange = function(){ _rsS().sel = so.value || '*'; rsPintar(false); };
  var sm = $('rs-mes'); if(sm) sm.onchange = function(){ rsMes(sm.value); };
  var ba = $('rs-act'); if(ba) ba.onclick = function(){ if(!_rsS().cargando){ var f = $('rs-fresco'); if(f) f.textContent = 'Actualizando…'; rsCargar(true); } };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-obra]'), function(b){
    b.onclick = function(){ _rsS().sel = b.getAttribute('data-obra'); rsPintar(false); try{ caja.scrollIntoView({block:'start'}); }catch(_s){} };
  });
}
/* otro mes de cierre: es otro año de datos, se vuelve a pedir (como la Torre) */
function rsMes(m){
  var S = _rsS(), K = _rsK();
  if(!m || m === (S.mes || K.mesISO())) return;
  S.mes = m; S.anio = parseInt(m.slice(0, 4), 10); S.listo = false; S.dat = {};
  if(_rsVivo()) TW.caja.innerHTML = '<div class="vacio">Juntando '+esc(K.mesBonito(m))+'…</div>';
  rsCargar(false);
}

/* ══ las metas: las de la Torre (sst_estado «torre» de la empresa), las mismas en la app ══ */
function rsMetas(){
  var K = _rsK(), g = K.cfg();
  function campo(id, et, val, paso, nota){
    return '<div class="campo"><label for="'+id+'">'+esc(et)+'</label>'+
      '<input id="'+id+'" type="number" inputmode="decimal" step="'+paso+'" value="'+esc(String(val))+'" style="max-width:160px">'+
      (nota ? '<p class="ayuda">'+esc(nota)+'</p>' : '')+'</div>';
  }
  var VER = [['ifr','Índice de frecuencia'], ['isv','Índice de severidad'], ['racha','Días sin accidentes'],
             ['cump','Inspecciones del mes'], ['epp','EPP entregado']];
  var cuerpo = '<p class="ayuda" style="margin:0 0 16px">Son las metas de la Torre de control de la app: se guardan para toda la empresa, y tus supervisores las ven igual en su celular.</p>'+
    campo('rsm-if', 'Meta del índice de frecuencia (IF)', g.metaIF, '0.1', 'Accidentes incapacitantes por millón de horas hombre. En construcción se suele trabajar con 3.')+
    campo('rsm-is', 'Meta del índice de severidad (IS)', g.metaIS, '1', 'Días perdidos por millón de horas hombre.')+
    campo('rsm-cump', 'Inspecciones al día desde (%)', g.metaCump, '1', 'Debajo de este porcentaje, las inspecciones del mes salen en rojo.')+
    campo('rsm-perd', 'Pérdida de EPP aceptable (%)', g.metaPerd, '1', 'Sobre este porcentaje, la pérdida deja de ser normal y se marca.')+
    campo('rsm-dias', 'Un reporte se atrasa después de (días)', g.diasRep, '1', 'Decide qué sale en «Necesita tu decisión».')+
    '<p class="reg-t" style="margin-top:20px">Qué cifras quieres arriba</p>'+
    VER.map(function(v){ return '<label class="check"><input type="checkbox" id="rsv-'+v[0]+'"'+(g.ver[v[0]] ? ' checked' : '')+'><span>'+esc(v[1])+'</span></label>'; }).join('');
  abrirHoja('Metas', 'Con ellas se pintan las cifras en verde, ámbar o rojo', cuerpo,
    '<button type="button" class="bt sec" id="rsm-def">Volver a lo de fábrica</button><button type="button" class="bt" id="rsm-ok">Guardar</button>');
  $('rsm-def').onclick = function(){
    var d = K.cfgDef();
    $('rsm-if').value = d.metaIF; $('rsm-is').value = d.metaIS; $('rsm-cump').value = d.metaCump; $('rsm-perd').value = d.metaPerd; $('rsm-dias').value = d.diasRep;
    VER.forEach(function(v){ $('rsv-'+v[0]).checked = !!d.ver[v[0]]; });
    toast('Quedan las de fábrica: toca «Guardar» para que valgan.');
  };
  $('rsm-ok').onclick = function(){
    var b = $('rsm-ok'); b.disabled = true; b.textContent = 'Guardando…';
    g.metaIF = parseFloat($('rsm-if').value) || 3;
    g.metaIS = parseFloat($('rsm-is').value) || 50;
    g.metaCump = parseInt($('rsm-cump').value, 10) || 95;
    g.metaPerd = parseInt($('rsm-perd').value, 10) || 10;
    g.diasRep = parseInt($('rsm-dias').value, 10) || 7;
    VER.forEach(function(v){ g.ver[v[0]] = $('rsv-'+v[0]).checked ? 1 : 0; });
    K.cfgGuardar().then(function(ok){
      toast(ok ? 'Metas guardadas para toda la empresa' : 'Se aplicaron aquí, pero no se pudieron guardar (¿sin internet?)');
      cerrarHoja(); rsPintar(false);
    });
  };
}
