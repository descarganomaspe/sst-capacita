/* OBRASST · el portal · LOS PLANES DE ARRIBA EN LA WEB (15/10/2026, lote 12)
   Marcelo: «el de arriba lo tiene todo» … construidos en la web y en la app. Lo del campo va en el celular
   (cadena-planes.js); lo de escritorio, aquí, en tres pantallas del área «Supervisión»:
     · «Mi supervisión» (peldaño 2: la supervisora incluida, y también Mandante y Fiscalización): las empresas que
       supervisa con lo que se les pide en documentos, el programa del equipo, los recorridos, las actas, las
       inspecciones, la productividad por inspector y el informe del mes (con su PDF);
     · «Mi cartera» (peldaño 3, Mandante): el tablero para el directorio, el ranking de contratistas, las retenciones
       por incumplimiento y la auditoría de su supervisora;
     · «Centro de fiscalización» (peldaño 4): la prioridad por riesgo región por región, las órdenes de inspección,
       las medidas, el control de sus inspectores y el expediente probatorio (con su PDF).
   Todo se pide y se escribe por las funciones del servidor (sql/2026-11-17 … 2026-11-24): las tablas no se leen
   directo, y lo que cada uno puede ver o hacer lo decide el servidor (el rango, el peldaño, el mandato).
   Necesita portal/cadena.js (cadMotivo, cadCorto, CAD_RIESGO…): vistaArr lo pide antes. No editar la versión: la
   sella armar.py (ARRIBA_VER). */
var ARR = { caja:null, cual:'', tab:{ sup:'empresas', cartera:'tablero', fis:'prior' }, mes:'', prog:null, ctl:null, gente:null, gT:0, exp:{ enlace:'', desde:'', hasta:'' }, reten:{ enlace:'', mes:'', val:'' } };
var ARR_TABS = {
  sup:[['empresas', 'Empresas'], ['prog', 'Programa'], ['campo', 'Recorridos'], ['actas', 'Actas'], ['insp', 'Inspecciones'], ['prod', 'Productividad'], ['informe', 'Informe del mes']],
  cartera:[['tablero', 'Tablero'], ['ranking', 'Ranking'], ['reten', 'Retenciones'], ['audit', 'Auditoría de la supervisora']],
  fis:[['prior', 'Prioridad'], ['ordenes', 'Órdenes'], ['medidas', 'Medidas'], ['control', 'Control'], ['expediente', 'Expediente']]
};
var ARR_ACT = { recorrido:'Recorrido', inspeccion:'Inspección', acta:'Acta' };
var ARR_EST = { cumplida:['Cumplida', 'ok'], no_cumplida:['No cumplida', 'mal'], pendiente:['Pendiente', 'gris'], anulada:['Anulada', 'gris'] };
var ARR_MOT = { programada:'Programada', prioridad:'Por prioridad de riesgo', denuncia:'Por denuncia', accidente:'Por accidente', seguimiento:'De seguimiento', otro:'Otro motivo' };
var ARR_VER = { en_obra:['En la obra', 'ok'], lejos:['Lejos de la obra', 'mal'], sin_ubicacion:['Sin ubicación', 'ojo'], sin_punto:['La obra sin su punto', 'gris'] };
var ARR_REQ = { pendiente:['Pendiente', 'ojo'], entregado:['Por revisar', 'azul'], aprobado:['Aprobado', 'ok'], observado:['Observado', 'mal'], anulado:['Anulado', 'gris'], no_entregado:['No entregado', 'mal'] };
var ARR_MOTIVO = {
  sin_plan_sup:'Eso lo tienen Mandante y Fiscalización, y la supervisora que ellos incluyen.', sin_plan_mandante:'Eso es del plan Mandante (o Fiscalización).',
  sin_plan_fiscalizacion:'Eso es del plan Fiscalización.', homologacion:'Los requisitos de ingreso (homologación) son del plan Mandante.',
  mes:'Revisa el mes.', fecha:'Revisa las fechas (hasta 3 meses de una vez).', items:'Revisa lo escrito: cada línea, con unas palabras.', enlace:'Esa empresa ya no está en tu cartera.',
  inspector:'Esa persona ya no es de tu equipo.', motivo:'Elige el motivo.', plazo:'Revisa el plazo: desde hoy y hasta un año.', monto:'Revisa los montos.',
  valorizacion:'Revisa la valorización.', no_entregado:'Todavía no lo entregan.', anulado:'Ese pedido fue anulado.', cerrada:'Eso ya está cerrado.', nota:'Escribe un poco más.',
  foto:'Falta la foto de cómo quedó (o no subió bien).', del_cliente:'El estándar de plazos lo pone tu cliente.', tope:'Ya pediste demasiados documentos a esa empresa.'
};
function arrMotivo(j, e){ return (j && j.motivo && ARR_MOTIVO[j.motivo]) ? ARR_MOTIVO[j.motivo] : cadMotivo(j, e); }
function arrIni(){ return (CADP.ini && CADP.ini.ok && YO.obra && CADP.de === String(YO.obra.id)) ? CADP.ini : null; }
function arrGrado(){ var i = arrIni(); return (i && i.grado) || 0; }
function arrManda(){ var i = arrIni(); return !!i && i.rango !== 'supervisor'; }
function arrDos(n){ return (n < 10 ? '0' : '') + n; }
function arrHoy(){ var d = new Date(); return d.getFullYear() + '-' + arrDos(d.getMonth() + 1) + '-' + arrDos(d.getDate()); }
function arrMesHoy(){ return arrHoy().slice(0, 7); }
function arrMasDias(iso, n){ var p = String(iso).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n); return d.getFullYear() + '-' + arrDos(d.getMonth() + 1) + '-' + arrDos(d.getDate()); }
function arrFecha(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 && p[0] ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
function arrHora(t){ var d = new Date(t); return isNaN(d) ? '' : arrFecha(d.getFullYear() + '-' + arrDos(d.getMonth() + 1) + '-' + arrDos(d.getDate())) + ' ' + arrDos(d.getHours()) + ':' + arrDos(d.getMinutes()); }
var ARR_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
function arrMesTx(m){ var p = String(m || '').split('-'); return p.length === 2 ? ARR_MESES[+p[1] - 1] + ' ' + p[0] : ''; }
function arrMesMas(m, n){ var p = String(m).split('-'), d = new Date(+p[0], +p[1] - 1 + n, 1); return d.getFullYear() + '-' + arrDos(d.getMonth() + 1); }
function arrN(n){ return String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function arrSoles(n){ var v = Math.round((+n || 0) * 100) / 100, e = Math.floor(v), c = Math.round((v - e) * 100); return 'S/ ' + arrN(e) + '.' + arrDos(c); }
function arrPill(t, cl){ return '<span class="pill ' + (cl || 'gris') + '">' + esc(t) + '</span>'; }
function arrVacio(t, s){ return '<div class="vacio"><b>' + esc(t) + '</b>' + (s ? esc(s) : '') + '</div>'; }
function arrBarra(v, malo){ v = Math.max(0, Math.min(100, Math.round(+v || 0))); return '<span class="arr-barra' + (malo ? ' mal' : '') + '" title="' + v + ' de 100"><i style="width:' + v + '%"></i></span><b class="arr-nota">' + v + '</b>'; }
/* las empresas que supervisa esta obra (las del registro propio también): para elegir en los formularios */
function arrEmpresas(soloDirectas){
  var i = arrIni(); if(!i) return [];
  return (i.abajo || []).filter(function(l){ return l.clase === 'supervision' && (l.estado === 'activa' || ((l.estado === 'invitada' || l.estado === 'rechazada') && l.invite_yo)); })
    .map(function(l){ return { id:l.id, n:cadCorto(l.nombre || l.razon || ''), estado:l.estado }; });
}
/* el equipo (con su id): lo trae la productividad del mes; se guarda un minuto */
function arrGente(){
  if(ARR.gente && Date.now() - ARR.gT < 60000) return Promise.resolve(ARR.gente);
  return sbRpc('sst_cad_productividad', { p:{ emp:YO.obra.id } }).then(function(j){
    ARR.gente = (j && j.ok ? (j.lista || []) : []).map(function(g){ return { uid:g.uid, n:g.nombre || 'Sin nombre', rango:g.rango }; }); ARR.gT = Date.now(); return ARR.gente;
  }, function(){ return ARR.gente || []; });
}
function arrSelGente(id, conNadie){
  return arrGente().then(function(G){
    var s = $(id); if(!s) return;
    s.innerHTML = (conNadie ? '<option value="">Cualquiera del equipo</option>' : '<option value="">Elige a quién</option>') +
      G.map(function(g){ return '<option value="' + esc(g.uid) + '">' + esc(g.n) + (g.rango ? ' · ' + esc(CAD_RANGO[g.rango] || g.rango) : '') + '</option>'; }).join('');
  });
}
function arrSelEmpresas(id, op){
  op = op || {};
  var L = arrEmpresas(); var s = $(id); if(!s) return;
  s.innerHTML = (op.todas ? '<option value="">Todas las empresas</option>' : '<option value="">Elige la empresa</option>') +
    L.map(function(l){ return '<option value="' + esc(l.id) + '"' + (op.valor === l.id ? ' selected' : '') + '>' + esc(l.n) + (l.estado !== 'activa' ? ' · registro propio' : '') + '</option>'; }).join('');
}

/* ══ la puerta ═══════════════════════════════════════════════════════════════════════════════ */
function arrPintar(cual, caja){
  _arrCss();
  ARR.caja = caja; ARR.cual = cual;
  var i = arrIni();
  if(!i){ caja.innerHTML = arrVacio('No se pudo cargar', 'Revisa tu conexión y vuelve a abrir esta sección.'); return; }
  var g = arrGrado(), hace = { sup:2, cartera:3, fis:4 }[cual] || 2;
  if(g < hace){
    caja.innerHTML = '<div class="tarj"><div class="tarj-cuerpo arr-falta"><h2>' + esc({ sup:'Mi supervisión', cartera:'Mi cartera', fis:'Centro de fiscalización' }[cual]) + '</h2><p>' +
      esc({ sup:'Lo usa la supervisora que su cliente incluye, y lo traen Mandante y Fiscalización.', cartera:'Empieza en el plan Mandante (y lo trae Fiscalización).',
            fis:'Es del plan Fiscalización: para las entidades del Estado que fiscalizan.' }[cual]) + '</p></div></div>';
    if(typeof _cadAcc === 'function') _cadAcc('');
    return;
  }
  var T = ARR_TABS[cual] || [], t = ARR.tab[cual] || T[0][0];
  var h = '<div class="seg arr-seg" role="tablist" aria-label="Qué ver">' + T.map(function(x){
    return '<button type="button" role="tab" data-arr-tab="' + x[0] + '" aria-selected="' + (x[0] === t) + '" class="' + (x[0] === t ? 'on' : '') + '">' + esc(x[1]) + '</button>'; }).join('') + '</div><div id="arr-cuerpo"></div>';
  caja.innerHTML = h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-arr-tab]'), function(b){ b.onclick = function(){ ARR.tab[cual] = b.getAttribute('data-arr-tab'); arrPintar(cual, caja); }; });
  arrTab(cual, t, $('arr-cuerpo'));
}
function arrTab(cual, t, c){
  if(typeof _cadAcc === 'function') _cadAcc('');
  var F = { empresas:arrEmpresasV, prog:arrProg, campo:arrCampo, actas:arrActas, insp:arrInsp, prod:arrProd, informe:arrInforme,
            tablero:arrTablero, ranking:arrRanking, reten:arrReten, audit:arrAudit,
            prior:arrPrior, ordenes:arrOrdenes, medidas:arrMedidas, control:arrControl, expediente:arrExpediente }[t];
  if(F) F(c);
}
function arrRepintar(){ if(ARR.caja && ARR.caja.isConnected) arrPintar(ARR.cual, ARR.caja); }
/* pedir y pintar, sin pisar si mientras tanto se cambió de pestaña */
function arrPedir(c, fn, args, pinta){
  var cual = ARR.cual, tab = ARR.tab[cual];
  c.innerHTML = '<div class="vacio">Cargando…</div>';
  return sbRpc(fn, args).then(function(j){
    if(!c.isConnected || ARR.cual !== cual || ARR.tab[cual] !== tab) return;
    if(!j || !j.ok){ c.innerHTML = arrVacio('No se pudo cargar', arrMotivo(j)); return; }
    pinta(j);
  }, function(e){ if(c.isConnected) c.innerHTML = arrVacio('No se pudo cargar', arrMotivo(null, e)); });
}
/* el mes que se mira (uno solo para todas las pestañas que lo usan) */
function arrMesSel(id){
  var m = ARR.mes || arrMesHoy();
  return '<div class="arr-mes"><button type="button" class="bt sec chico" data-mes="-1" aria-label="Mes anterior">‹</button><b id="' + id + '">' + esc(arrMesTx(m)) + '</b>' +
         '<button type="button" class="bt sec chico" data-mes="1" aria-label="Mes siguiente"' + (m >= arrMesHoy() ? ' disabled' : '') + '>›</button></div>';
}
function arrMesAtar(c, alCambiar){
  Array.prototype.forEach.call(c.querySelectorAll('[data-mes]'), function(b){ b.onclick = function(){ ARR.mes = arrMesMas(ARR.mes || arrMesHoy(), +b.getAttribute('data-mes')); alCambiar(); }; });
}

/* ══ MI SUPERVISIÓN ══════════════════════════════════════════════════════════════════════════ */
/* las empresas que supervisa: sus cifras, lo que se les pide en documentos y si están homologadas */
function arrEmpresasV(c){
  arrPedir(c, 'sst_cad_cartera', { p_emp:YO.obra.id }, function(j){
    var t = j.tot || {}, L = j.lista || [], g = arrGrado();
    var h = '<div class="rej">' +
      cifra('Empresas que supervisas', String(t.empresas || 0), (t.invitadas ? t.invitadas + ' sin aceptar' : 'todas aceptaron') + (t.rechazaron ? ' · ' + t.rechazaron + ' rechazaron' : ''), t.no_atendieron ? 'ojo' : '') +
      cifra('Personas hoy', arrN(t.gente), 'de las que aceptaron', '') +
      cifra('Observaciones abiertas', String(t.ab || 0), t.ven ? t.ven + (t.ven === 1 ? ' vencida' : ' vencidas') : 'ninguna vencida', t.ven ? 'mal' : '') +
      cifra('Documentos', (t.req_total ? Math.round(100 * (t.req_ok || 0) / t.req_total) + ' %' : '—'), t.req_total ? (t.req_ok || 0) + ' de ' + t.req_total + ' aprobados' + (t.req_por_revisar ? ' · ' + t.req_por_revisar + ' por revisar' : '') : 'nada pedido', t.req_por_revisar ? 'ojo' : '') +
      cifra('Inspecciones del mes', String(t.insp_mes || 0), 'con lista', '') + '</div>';
    if(!L.length){ c.innerHTML = h + arrVacio('Todavía no supervisas a ninguna empresa', 'Desde la app: «Supervisión» → «Supervisar a una empresa».'); return; }
    h += '<div class="tarj"><div class="tarj-cab"><div><h2>Tu cartera</h2><p class="sub">Toca una empresa para ver y pedir sus documentos' + (g >= 3 ? ' (y los requisitos de ingreso: la homologación)' : '') + '</p></div></div>' +
      '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>Empresa</th><th>Estado</th><th class="num">Gente</th><th class="num">Abiertas</th><th class="num">Vencidas</th><th>Documentos</th>' + (g >= 3 ? '<th>Homologada</th>' : '') + '<th class="num">Insp. del mes</th></tr></thead><tbody>' +
      L.map(function(x){
        var o = x.obs || {}, r = x.req || {}, ind = x.ind || {}, est = x.estado === 'activa' ? arrPill('Acepta', 'ok') : (x.estado === 'rechazada' ? arrPill('Rechazó', 'mal') : (x.vencida ? arrPill('No atendió', 'mal') : arrPill('Sin aceptar', 'ojo')));
        return '<tr class="clic" data-arr-emp="' + esc(x.id) + '" tabindex="0"><td><b>' + esc(cadCorto(x.nombre || x.razon || '')) + '</b><small class="arr-sub">' + esc(x.obra || '') + (x.ruc ? ' · ' + esc(cadDocN()) + ' ' + esc(x.ruc) : '') + (x.registro_propio ? ' · registro propio' : '') + '</small></td>' +
          '<td>' + est + '</td><td class="num">' + (x.estado === 'activa' ? arrN(ind.gente) : '—') + '</td><td class="num">' + (o.ab || 0) + '</td><td class="num' + (o.ven ? ' arr-mal' : '') + '">' + (o.ven || 0) + '</td>' +
          '<td>' + (r.total ? (r.ok || 0) + ' / ' + r.total + (r.por_revisar ? ' · <span class="arr-ojo">' + r.por_revisar + ' por revisar</span>' : '') : '<span class="arr-gris">nada pedido</span>') + '</td>' +
          (g >= 3 ? '<td>' + (r.ingreso ? (r.homologada ? arrPill('Sí', 'ok') : arrPill('Falta', 'mal')) : '<span class="arr-gris">sin requisitos</span>') + '</td>' : '') +
          '<td class="num">' + ((x.insp || {}).mes || 0) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    Array.prototype.forEach.call(c.querySelectorAll('[data-arr-emp]'), function(tr){
      tr.onclick = function(){ arrDocs(tr.getAttribute('data-arr-emp')); };
      tr.onkeydown = function(ev){ if(ev.key === 'Enter') arrDocs(tr.getAttribute('data-arr-emp')); };
    });
  });
}
/* lo que se le pide a una empresa en documentos: pedir, revisar lo entregado, anular */
function arrDocs(enlace){
  abrirHoja('Documentos', 'Cargando…', '<div class="vacio">Cargando…</div>', '', { id:'arr-docs-' + enlace, ancha:true });
  sbRpc('sst_cad_reqs', { p:{ enlace:enlace } }).then(function(j){
    if(!HOJA.abierta || HOJA.id !== 'arr-docs-' + enlace) return;
    if(!j || !j.ok){ $('hoja-cuerpo').innerHTML = arrVacio('No se pudo cargar', arrMotivo(j)); return; }
    var L = j.lista || [], s = j.resumen || {}, e = j.enlace || {}, g = arrGrado(), manda = arrManda();
    $('hoja-t').textContent = cadCorto(e.nombre || e.razon || 'Documentos');
    $('hoja-s').textContent = (s.total ? (s.ok || 0) + ' de ' + s.total + ' aprobados' : 'Nada pedido todavía') + (s.ingreso ? ' · ' + (s.homologada ? 'homologada' : 'falta homologar') : '') + ' · ' + arrMesTx(j.mes);
    var h = '';
    if(L.length){
      h += '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>Qué se pide</th><th>Cada</th><th>Estado</th><th>Lo entregado</th><th></th></tr></thead><tbody>' + L.map(function(r){
        var est = r.hoy || r.estado, E = ARR_REQ[est] || [est, 'gris'];
        return '<tr><td><b>' + esc(r.item) + '</b>' + (r.ingreso ? ' ' + arrPill('Ingreso', 'azul') : '') + (r.detalle ? '<small class="arr-sub">' + esc(r.detalle) + '</small>' : '') + (r.nota ? '<small class="arr-sub">«' + esc(r.nota) + '»</small>' : '') + '</td>' +
          '<td>' + (r.cada === 'mes' ? 'Cada mes' : 'Una vez') + '</td><td>' + arrPill(E[0], E[1]) + (r.cada === 'mes' && r.periodo ? '<small class="arr-sub">lo último: ' + esc(arrMesTx(r.periodo)) + '</small>' : '') + '</td>' +
          '<td>' + (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.archivo || 'Ver el archivo') + '</a>' + (r.entregado ? '<small class="arr-sub">' + esc(arrHora(r.entregado)) + '</small>' : '') : '<span class="arr-gris">—</span>') + '</td>' +
          '<td class="arr-acc">' + (est === 'entregado' ? '<button type="button" class="bt chico" data-req-ok="' + esc(r.id) + '">Aprobar</button><button type="button" class="bt sec chico" data-req-mal="' + esc(r.id) + '">Observar</button>' : '') +
          (manda && r.estado !== 'anulado' ? '<button type="button" class="bt sec chico" data-req-anular="' + esc(r.id) + '">Anular</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    } else h += arrVacio('Todavía no le pides documentos', 'Pide lo que exige tu contrato: el SCTR del mes, el plan de seguridad, las constancias…');
    h += '<div class="arr-form" id="arr-pedir"><h3>Pedir documentos</h3><p class="sub">Uno por línea. La empresa los entrega desde su cuenta y tú los revisas aquí.</p>' +
      '<textarea id="arr-req-items" rows="4" maxlength="2000" placeholder="SCTR del mes&#10;Plan de seguridad de la obra&#10;Constancias de inducción"></textarea>' +
      '<div class="arr-fila"><label><input type="radio" name="arr-req-cada" value="una" checked> Una vez</label><label><input type="radio" name="arr-req-cada" value="mes"> Cada mes</label>' +
      (g >= 3 ? '<label title="Sin estos, la empresa no está homologada para trabajar"><input type="checkbox" id="arr-req-ingreso"> Son requisitos de ingreso (homologación)</label>' : '') + '</div>' +
      '<p class="msg mal" id="arr-req-msg"></p><button type="button" class="bt" id="arr-req-pedir">Pedir</button></div>';
    $('hoja-cuerpo').innerHTML = h;
    var hc = $('hoja-cuerpo'), otra = function(){ arrDocs(enlace); if(ARR.cual === 'sup' && ARR.tab.sup === 'empresas') setTimeout(function(){ var c = $('arr-cuerpo'); if(c && !HOJA.abierta) arrEmpresasV(c); }, 0); };
    $('arr-req-pedir').onclick = function(){
      var items = $('arr-req-items').value.split('\n').map(function(x){ return x.replace(/\s+/g, ' ').trim(); }).filter(function(x){ return x.length; });
      var cada = (hc.querySelector('input[name="arr-req-cada"]:checked') || {}).value || 'una', ing = !!($('arr-req-ingreso') && $('arr-req-ingreso').checked);
      if(!items.length || items.some(function(x){ return x.length < 3; })){ $('arr-req-msg').textContent = 'Escribe qué pides: una línea por documento, con unas palabras.'; return; }
      $('arr-req-pedir').disabled = true;
      sbRpc('sst_cad_req_poner', { p:{ enlace:enlace, n:cadYo(), items:items.map(function(x){ return { item:x.slice(0, 140), cada:cada, ingreso:ing }; }) } }).then(function(r){
        $('arr-req-pedir').disabled = false;
        if(!r || !r.ok){ $('arr-req-msg').textContent = arrMotivo(r); return; }
        toast(r.nuevos === 1 ? 'Pedido: 1 documento.' : 'Pedidos: ' + r.nuevos + ' documentos.'); otra();
      }, function(e){ $('arr-req-pedir').disabled = false; $('arr-req-msg').textContent = arrMotivo(null, e); });
    };
    Array.prototype.forEach.call(hc.querySelectorAll('[data-req-ok]'), function(b){ b.onclick = function(){
      b.disabled = true;
      sbRpc('sst_cad_req_revisar', { p:{ id:b.getAttribute('data-req-ok'), ok:true, n:cadYo() } }).then(function(r){ if(!r || !r.ok){ b.disabled = false; toast(arrMotivo(r)); return; } toast('Aprobado.'); otra(); },
        function(e){ b.disabled = false; toast(arrMotivo(null, e)); });
    }; });
    Array.prototype.forEach.call(hc.querySelectorAll('[data-req-mal]'), function(b){ b.onclick = function(){
      preguntar('Observar lo entregado', 'Escribe qué falta o qué está mal: la empresa lo lee y lo vuelve a entregar.', { etiqueta:'Qué falta', minimo:8, corto:'Escribe qué falta (unas palabras).' }, { si:'Observar' }).then(function(v){
        if(!v) return;
        sbRpc('sst_cad_req_revisar', { p:{ id:b.getAttribute('data-req-mal'), ok:false, nota:v, n:cadYo() } }).then(function(r){ if(!r || !r.ok){ toast(arrMotivo(r)); return; } toast('Observado: se le avisa a la empresa.'); otra(); },
          function(e){ toast(arrMotivo(null, e)); });
      });
    }; });
    Array.prototype.forEach.call(hc.querySelectorAll('[data-req-anular]'), function(b){ b.onclick = function(){
      preguntar('Anular el pedido', 'Queda en el historial, con tu motivo.', { etiqueta:'Por qué', minimo:5, corto:'Escribe por qué (unas palabras).' }, { si:'Anular', mal:true }).then(function(v){
        if(!v) return;
        sbRpc('sst_cad_req_poner', { p:{ id:b.getAttribute('data-req-anular'), anular:true, nota:v, n:cadYo() } }).then(function(r){ if(!r || !r.ok){ toast(arrMotivo(r)); return; } toast('Anulado.'); otra(); },
          function(e){ toast(arrMotivo(null, e)); });
      });
    }; });
  }, function(e){ if(HOJA.abierta && HOJA.id === 'arr-docs-' + enlace) $('hoja-cuerpo').innerHTML = arrVacio('No se pudo cargar', arrMotivo(null, e)); });
}

/* el programa del equipo: lo de estas dos semanas (o las que se elijan), cumplido o no según los registros */
function arrProg(c){
  if(!ARR.prog){ var hoy = arrHoy(), d = new Date(), dow = (d.getDay() + 6) % 7; ARR.prog = { desde:arrMasDias(hoy, -dow) }; }
  var desde = ARR.prog.desde, hasta = arrMasDias(desde, 13);
  if(typeof _cadAcc === 'function') _cadAcc(arrManda() ? '<button type="button" class="bt" id="arr-prog-nuevo">＋ Programar</button>' : '');
  if($('arr-prog-nuevo')) $('arr-prog-nuevo').onclick = arrProgNuevo;
  arrPedir(c, 'sst_cad_prog', { p:{ emp:YO.obra.id, desde:desde, hasta:hasta } }, function(j){
    var R = j.resumen || {}, L = j.lista || [], manda = arrManda();
    var h = '<div class="arr-mes"><button type="button" class="bt sec chico" id="arr-prog-a" aria-label="Dos semanas antes">‹</button><b>' + esc(arrFecha(j.desde) + ' al ' + arrFecha(j.hasta)) + '</b>' +
      '<button type="button" class="bt sec chico" id="arr-prog-d" aria-label="Dos semanas después">›</button>' + (desde !== arrMasDias(arrHoy(), -((new Date().getDay() + 6) % 7)) ? '<button type="button" class="bt sec chico" id="arr-prog-h">Hoy</button>' : '') + '</div>' +
      '<div class="rej">' + cifra('Programadas', String(R.programadas || 0), 'en estas dos semanas', '') +
      cifra('Cumplidas', String(R.cumplidas || 0), R.pct != null ? R.pct + ' % de lo que ya pasó' : 'todavía nada pasó', R.pct != null && R.pct < 70 ? 'mal' : (R.pct != null && R.pct < 90 ? 'ojo' : '')) +
      cifra('No cumplidas', String(R.no_cumplidas || 0), 'ya pasó su día sin el registro', R.no_cumplidas ? 'mal' : '') + cifra('Pendientes', String(R.pendientes || 0), 'de hoy en adelante', '') + '</div>';
    if(!L.length) h += arrVacio('Nada programado en estas dos semanas', manda ? 'Programa los recorridos, las inspecciones y las actas de tu equipo: cada uno los ve en su celular.' : 'El programa lo arma tu jefe.');
    else h += '<div class="tarj"><div class="tarj-cab"><div><h2>El programa</h2><p class="sub">Lo cumplido lo dicen los registros: el recorrido, la inspección o el acta de ese día, en esa empresa</p></div></div>' +
      '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>Día</th><th>Qué</th><th>Empresa</th><th>Quién</th><th>Estado</th><th></th></tr></thead><tbody>' + L.map(function(x){
        var E = ARR_EST[x.estado] || [x.estado, 'gris'];
        return '<tr' + (x.estado === 'anulada' ? ' class="arr-anulada"' : '') + '><td>' + esc(arrFecha(x.fecha)) + '</td><td>' + esc(ARR_ACT[x.actividad] || x.actividad) + (x.nota ? '<small class="arr-sub">' + esc(x.nota) + '</small>' : '') + '</td>' +
          '<td>' + esc(cadCorto(x.empresa || '')) + '</td><td>' + (x.inspector_nombre ? esc(x.inspector_nombre) : '<span class="arr-gris">cualquiera del equipo</span>') + '</td>' +
          '<td>' + arrPill(E[0], E[1]) + (x.anulado_nota ? '<small class="arr-sub">' + esc(x.anulado_nota) + '</small>' : '') + '</td>' +
          '<td class="arr-acc">' + (manda && x.estado === 'pendiente' ? '<button type="button" class="bt sec chico" data-prog-anular="' + esc(x.id) + '">Anular</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    $('arr-prog-a').onclick = function(){ ARR.prog.desde = arrMasDias(ARR.prog.desde, -14); arrProg(c); };
    $('arr-prog-d').onclick = function(){ ARR.prog.desde = arrMasDias(ARR.prog.desde, 14); arrProg(c); };
    if($('arr-prog-h')) $('arr-prog-h').onclick = function(){ ARR.prog = null; arrProg(c); };
    Array.prototype.forEach.call(c.querySelectorAll('[data-prog-anular]'), function(b){ b.onclick = function(){
      preguntar('Anular lo programado', 'Queda en el programa como anulado, con tu motivo.', { etiqueta:'Por qué', minimo:5, corto:'Escribe por qué (unas palabras).' }, { si:'Anular', mal:true }).then(function(v){
        if(!v) return;
        sbRpc('sst_cad_prog_poner', { p:{ id:b.getAttribute('data-prog-anular'), anular:true, nota:v } }).then(function(r){ if(!r || !r.ok){ toast(arrMotivo(r)); return; } toast('Anulado.'); arrProg(c); },
          function(e){ toast(arrMotivo(null, e)); });
      });
    }; });
  });
}
function arrProgNuevo(){
  var hoy = arrHoy();
  abrirHoja('Programar', 'Recorridos, inspecciones y actas: cada uno los ve en su celular, en «Mi programa»',
    '<div class="campo"><label for="arr-pn-emp">Empresa</label><select id="arr-pn-emp"></select></div>' +
    '<div class="campo"><label for="arr-pn-act">Qué</label><select id="arr-pn-act"><option value="recorrido">Recorrido</option><option value="inspeccion">Inspección con lista</option><option value="acta">Acta</option></select></div>' +
    '<div class="campo"><label for="arr-pn-ins">Quién</label><select id="arr-pn-ins"><option value="">Cualquiera del equipo</option></select></div>' +
    '<div class="campo"><label for="arr-pn-fecha">Desde el día</label><input type="date" id="arr-pn-fecha" value="' + hoy + '" min="' + arrMasDias(hoy, -7) + '" max="' + arrMasDias(hoy, 120) + '"></div>' +
    '<div class="campo"><label for="arr-pn-rep">Cuántas veces</label><select id="arr-pn-rep"><option value="1">Una vez</option><option value="7:4">Cada semana, 4 semanas</option><option value="7:8">Cada semana, 8 semanas</option>' +
      '<option value="14:4">Cada dos semanas, 4 veces</option><option value="1:5">Todos los días, 5 días seguidos</option></select></div>' +
    '<div class="campo"><label for="arr-pn-nota">Nota (opcional)</label><input id="arr-pn-nota" maxlength="200" placeholder="Frente norte, después del vaciado"></div><p class="msg mal" id="arr-pn-msg"></p>',
    '<button type="button" class="bt sec" id="arr-pn-no">Cancelar</button><button type="button" class="bt" id="arr-pn-si">Programar</button>', { id:'arr-prog-nuevo' });
  arrSelEmpresas('arr-pn-emp'); arrSelGente('arr-pn-ins', true);
  $('arr-pn-no').onclick = cerrarHoja;
  $('arr-pn-si').onclick = function(){
    var emp = $('arr-pn-emp').value, f = $('arr-pn-fecha').value, rp = String($('arr-pn-rep').value).split(':'), cada = +rp[0], veces = +(rp[1] || 1);
    if(!emp){ $('arr-pn-msg').textContent = 'Elige la empresa.'; return; }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(f)){ $('arr-pn-msg').textContent = 'Elige el día.'; return; }
    if(rp.length === 1){ veces = 1; }
    var items = [];
    for(var k = 0; k < veces; k++) items.push({ enlace:emp, fecha:arrMasDias(f, k * cada), actividad:$('arr-pn-act').value, inspector:$('arr-pn-ins').value || null, nota:$('arr-pn-nota').value.trim() || null });
    $('arr-pn-si').disabled = true;
    sbRpc('sst_cad_prog_poner', { p:{ emp:YO.obra.id, items:items } }).then(function(r){
      $('arr-pn-si').disabled = false;
      if(!r || !r.ok){ $('arr-pn-msg').textContent = arrMotivo(r); return; }
      cerrarHoja(); toast(r.nuevos === 1 ? 'Programado.' : 'Programadas: ' + r.nuevos + (r.saltados ? ' (' + r.saltados + ' ya estaban)' : '') + '.');
      ARR.prog = { desde:arrMasDias(f, -((new Date(f + 'T12:00:00').getDay() + 6) % 7)) };
      var c = $('arr-cuerpo'); if(c && ARR.cual === 'sup' && ARR.tab.sup === 'prog') arrProg(c);
    }, function(e){ $('arr-pn-si').disabled = false; $('arr-pn-msg').textContent = arrMotivo(null, e); });
  };
}

/* los recorridos: con la prueba de presencia (a cuántos metros de la obra empezó) */
function arrCampo(c){
  arrPedir(c, 'sst_cad_recorridos', { p:{ emp:YO.obra.id } }, function(j){
    var L = j.lista || [], enObra = L.filter(function(r){ return r.veredicto === 'en_obra'; }), min = enObra.reduce(function(a, r){ return a + (r.min || 0); }, 0);
    var h = '<div class="rej">' + cifra('Recorridos', String(L.length), 'del ' + arrFecha(j.desde) + ' al ' + arrFecha(j.hasta), '') +
      cifra('En la obra', L.length ? Math.round(100 * enObra.length / L.length) + ' %' : '—', enObra.length + ' empezaron a menos del radio de la obra', L.length && enObra.length / L.length < 0.8 ? 'ojo' : '') +
      cifra('Horas en la obra', String(Math.round(min / 6) / 10), 'de los que empezaron en la obra', '') +
      cifra('Lejos de la obra', String(L.filter(function(r){ return r.veredicto === 'lejos'; }).length), 'el celular estaba lejos del punto', L.some(function(r){ return r.veredicto === 'lejos'; }) ? 'mal' : '') + '</div>';
    if(!L.length){ c.innerHTML = h + arrVacio('Sin recorridos en estos 30 días', 'Se empiezan y se terminan en la app: «Empezar un recorrido».'); return; }
    h += '<div class="tarj"><div class="tarj-cab"><div><h2>Los recorridos</h2><p class="sub">El servidor guarda los metros a la obra, nunca dónde estaba nadie</p></div></div>' +
      '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>Empezó</th><th>Empresa</th><th>Quién</th><th class="num">Minutos</th><th>Dónde</th><th>Lo que hizo</th></tr></thead><tbody>' + L.map(function(r){
        var V = ARR_VER[r.veredicto] || [r.veredicto || '—', 'gris'], hz = r.hizo || {};
        return '<tr><td>' + esc(arrHora(r.inicio)) + (r.sin_cerrar ? '<small class="arr-sub arr-mal">sin cerrar</small>' : (r.abierto ? '<small class="arr-sub">en curso</small>' : '')) + '</td><td>' + esc(cadCorto(r.empresa || '')) + '</td>' +
          '<td>' + esc((r.por || {}).n || '') + '</td><td class="num">' + (r.min != null ? r.min : '—') + '</td>' +
          '<td>' + arrPill(V[0], V[1]) + (r.dist_ini != null ? '<small class="arr-sub">' + arrN(r.dist_ini) + ' m del punto</small>' : '') + '</td>' +
          '<td>' + [hz.insp ? hz.insp + (hz.insp === 1 ? ' inspección' : ' inspecciones') : '', hz.actas ? hz.actas + (hz.actas === 1 ? ' acta' : ' actas') : '', hz.obs ? hz.obs + (hz.obs === 1 ? ' observación' : ' observaciones') : ''].filter(Boolean).join(' · ') +
          (r.nota ? '<small class="arr-sub">«' + esc(r.nota) + '»</small>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
  });
}

/* las actas que levantó el equipo: abrir una (lo constatado, las firmas, su código para verificarla) */
function arrActas(c){
  arrPedir(c, 'sst_cad_actas', { p:{ emp:YO.obra.id, lado:'arriba' } }, function(j){
    var L = j.lista || [];
    if(!L.length){ c.innerHTML = arrVacio('Todavía no hay actas', 'Se levantan en la app, en la obra: los hechos con su foto, los requerimientos, las conclusiones y las firmas.'); return; }
    var abiertas = L.filter(function(a){ return a.estado === 'abierta'; }).length;
    var h = '<div class="rej">' + cifra('Actas', String(L.length), 'del equipo', '') + cifra('Falta la firma', String(abiertas), 'del representante', abiertas ? 'ojo' : '') +
      cifra('Se negó a firmar', String(L.filter(function(a){ return a.estado === 'negada'; }).length), 'con testigo', '') + cifra('Leídas por la empresa', String(L.filter(function(a){ return a.acuse; }).length), 'abrirla es su acuse', '') + '</div>' +
      '<div class="tarj"><div class="tabla-caja"><table class="arr-t"><thead><tr><th>Acta</th><th>Fecha</th><th>Empresa</th><th class="num">Hechos</th><th>Estado</th><th>Leída</th></tr></thead><tbody>' + L.map(function(a){
        var est = a.estado === 'firmada' ? arrPill('Firmada', 'ok') : (a.estado === 'negada' ? arrPill('Se negó a firmar', 'ojo') : arrPill('Falta la firma', 'mal'));
        return '<tr class="clic" data-arr-acta="' + esc(a.id) + '" tabindex="0"><td><b>' + esc(a.n) + '</b>' + (a.tipo === 'fiscalizacion' ? '<small class="arr-sub">de fiscalización</small>' : '') + '</td><td>' + esc(arrFecha(a.fecha) + ' ' + (a.hora || '')) + '</td>' +
          '<td>' + esc(cadCorto(a.empresa || '')) + (a.propio ? '<small class="arr-sub">registro propio</small>' : '') + '</td><td class="num">' + (a.nhechos || 0) + '</td><td>' + est + '</td>' +
          '<td>' + (a.acuse ? '<small>' + esc(arrHora(a.acuse.t || a.acuse)) + '</small>' : '<span class="arr-gris">—</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    Array.prototype.forEach.call(c.querySelectorAll('[data-arr-acta]'), function(tr){
      tr.onclick = function(){ arrActaVer(tr.getAttribute('data-arr-acta')); };
      tr.onkeydown = function(ev){ if(ev.key === 'Enter') arrActaVer(tr.getAttribute('data-arr-acta')); };
    });
  });
}
function arrActaVer(id){
  abrirHoja('Acta', 'Cargando…', '<div class="vacio">Cargando…</div>', '', { id:'arr-acta-' + id, ancha:true });
  sbRpc('sst_cad_acta_ver', { p:{ id:id } }).then(function(j){
    if(!HOJA.abierta || HOJA.id !== 'arr-acta-' + id) return;
    if(!j || !j.ok){ $('hoja-cuerpo').innerHTML = arrVacio('No se pudo cargar', arrMotivo(j)); return; }
    var a = j.acta, k = a.contenido || {};
    $('hoja-t').textContent = (a.tipo === 'fiscalizacion' ? 'Acta de fiscalización ' : 'Acta de supervisión ') + a.n;
    $('hoja-s').textContent = (k.emisor || '') + ' → ' + (k.empresa || '') + ' · ' + arrFecha(k.fecha) + ' ' + (k.hora || '') + (k.lugar ? ' · ' + k.lugar : '');
    var h = (a.estado === 'abierta' ? '<div class="aviso ojo">Falta la firma del representante: la puede firmar desde la cuenta de su empresa.</div>' : '') +
      '<h3 class="arr-h3">Hechos constatados</h3><ol class="arr-hechos">' + (k.hechos || []).map(function(x){
        return '<li>' + esc(x.t) + (x.med ? '<small class="arr-sub">Medición: ' + esc(x.med) + '</small>' : '') + (x.foto ? '<a href="' + esc(x.foto) + '" target="_blank" rel="noopener"><img src="' + esc(x.foto) + '" alt="La foto del hecho" loading="lazy"></a>' : '') + '</li>'; }).join('') + '</ol>';
    if((a.obs || []).length) h += '<h3 class="arr-h3">Requerimientos con plazo</h3><ul class="arr-lista">' + a.obs.map(function(o){
      return '<li>' + cadRiesgoHTML(o.riesgo) + ' <b>' + esc(o.n) + '</b> ' + esc(o.titulo) + ' · hasta el ' + esc(arrHora(o.vence)) + '</li>'; }).join('') + '</ul>';
    if((k.medidas || []).length) h += '<h3 class="arr-h3">Medidas</h3><ul class="arr-lista">' + k.medidas.map(function(x){
      return '<li><b>' + (x.tipo === 'paralizacion' ? 'Paralización' : 'Prohibición') + ':</b> ' + esc(x.detalle) + (x.plazo ? ' · hasta el ' + esc(arrFecha(x.plazo)) : '') + '</li>'; }).join('') + '</ul>';
    if(k.conclusiones) h += '<h3 class="arr-h3">Conclusiones</h3><p>' + esc(k.conclusiones) + '</p>';
    h += '<h3 class="arr-h3">Firmas</h3><ul class="arr-lista">' + (a.firmas || []).map(function(f){
      return '<li><b>' + esc({ inspector:'Inspector', representante:'Representante', testigo:'Testigo' }[f.rol] || f.rol) + ':</b> ' + esc(f.n || '') + (f.c ? ' (' + esc(f.c) + ')' : '') +
        (f.negada ? ' · <span class="arr-mal">se negó a firmar</span>' : '') + ' · ' + esc(arrHora(f.t)) + '</li>'; }).join('') + '</ul>';
    if(a.acuse) h += '<p class="sub">Leída por la empresa: ' + esc(a.acuse.n || '') + ' · ' + esc(arrHora(a.acuse.t)) + '</p>';
    var url = 'https://descarganomaspe.github.io/sst-capacita/s/?c=' + encodeURIComponent(a.codigo || '');
    h += '<div class="arr-cod"><small>Código para verificar la impresa</small><b>' + esc(a.codigo || '') + '</b><small>Huella SHA-256: ' + esc(String(a.huella || '').slice(0, 16)) + '…</small>' +
      '<a class="bt sec chico" href="' + esc(url) + '" target="_blank" rel="noopener">Abrir la página para verificarla</a></div>';
    $('hoja-cuerpo').innerHTML = h;
  }, function(e){ if(HOJA.abierta && HOJA.id === 'arr-acta-' + id) $('hoja-cuerpo').innerHTML = arrVacio('No se pudo cargar', arrMotivo(null, e)); });
}

/* las inspecciones con lista del equipo: abrir una (cada punto) */
function arrInsp(c){
  arrPedir(c, 'sst_cad_insps', { p:{ emp:YO.obra.id, lado:'arriba' } }, function(j){
    var L = j.lista || [];
    if(!L.length){ c.innerHTML = arrVacio('Todavía no hay inspecciones', 'Se hacen en la app: «Inspección con lista». Cada «no cumple» marcado para observar se vuelve una observación.'); return; }
    var con = L.filter(function(x){ return x.puntaje != null; }), prom = con.length ? Math.round(con.reduce(function(a, x){ return a + (+x.puntaje || 0); }, 0) / con.length) : null;
    var h = '<div class="rej">' + cifra('Inspecciones', String(L.length), 'las últimas 300', '') + cifra('Cumplimiento promedio', prom != null ? prom + ' %' : '—', 'de los puntos que aplican', prom != null && prom < 70 ? 'mal' : '') +
      cifra('Observaciones que salieron', String(L.reduce(function(a, x){ return a + (x.nobs || 0); }, 0)), 'de los «no cumple»', '') + '</div>' +
      '<div class="tarj"><div class="tabla-caja"><table class="arr-t"><thead><tr><th>Inspección</th><th>Fecha</th><th>Empresa</th><th>Formato</th><th class="num">Cumple</th><th class="num">No cumple</th><th class="num">%</th><th>Quién</th></tr></thead><tbody>' + L.map(function(x){
        return '<tr class="clic" data-arr-insp="' + esc(x.id) + '" tabindex="0"><td><b>' + esc(x.n || '') + '</b></td><td>' + esc(arrFecha(x.fecha)) + '</td><td>' + esc(cadCorto(x.abajo || '')) + (x.propio ? '<small class="arr-sub">registro propio</small>' : '') + '</td>' +
          '<td>' + esc(x.formato || '') + '</td><td class="num">' + (x.cumple || 0) + '</td><td class="num' + (x.nocumple ? ' arr-mal' : '') + '">' + (x.nocumple || 0) + '</td><td class="num">' + (x.puntaje != null ? Math.round(x.puntaje) : '—') + '</td>' +
          '<td>' + esc((x.por || {}).n || '') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    Array.prototype.forEach.call(c.querySelectorAll('[data-arr-insp]'), function(tr){
      tr.onclick = function(){ arrInspVer(tr.getAttribute('data-arr-insp')); };
      tr.onkeydown = function(ev){ if(ev.key === 'Enter') arrInspVer(tr.getAttribute('data-arr-insp')); };
    });
  });
}
function arrInspVer(id){
  abrirHoja('Inspección', 'Cargando…', '<div class="vacio">Cargando…</div>', '', { id:'arr-insp-' + id, ancha:true });
  sbRpc('sst_cad_insp_ver', { p:{ id:id } }).then(function(j){
    if(!HOJA.abierta || HOJA.id !== 'arr-insp-' + id) return;
    if(!j || !j.ok){ $('hoja-cuerpo').innerHTML = arrVacio('No se pudo cargar', arrMotivo(j)); return; }
    var x = j.insp, b = '';
    $('hoja-t').textContent = (x.n || 'Inspección') + ' · ' + (x.formato || '');
    $('hoja-s').textContent = cadCorto(x.abajo || '') + ' · ' + arrFecha(x.fecha) + (x.lugar ? ' · ' + x.lugar : '') + ' · ' + (x.puntaje != null ? Math.round(x.puntaje) + ' % cumple' : '');
    var h = '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>Punto</th><th>Resultado</th></tr></thead><tbody>' + (x.items || []).map(function(it){
      var t = '';
      if(it.b && it.b !== b){ b = it.b; t = '<tr class="arr-bloque"><td colspan="2">' + esc(b) + '</td></tr>'; }
      return t + '<tr><td>' + esc(it.t) + (it.nota ? '<small class="arr-sub">' + esc(it.nota) + '</small>' : '') + '</td><td>' +
        (it.r === 'c' ? arrPill('Cumple', 'ok') : (it.r === 'nc' ? arrPill('No cumple', 'mal') + ((it.obs || it.observar) ? ' <small>→ observación</small>' : '') : arrPill('No aplica', 'gris'))) + '</td></tr>';
    }).join('') + '</tbody></table></div>' + (x.nota ? '<p class="sub">' + esc(x.nota) + '</p>' : '') + '<p class="sub">' + esc((x.por || {}).n || '') + ((x.por || {}).c ? ' (' + esc(x.por.c) + ')' : '') + ' · ' + esc(arrHora(x.creado)) + '</p>';
    $('hoja-cuerpo').innerHTML = h;
  }, function(e){ if(HOJA.abierta && HOJA.id === 'arr-insp-' + id) $('hoja-cuerpo').innerHTML = arrVacio('No se pudo cargar', arrMotivo(null, e)); });
}

/* la productividad por inspector, del mes */
function arrProd(c){
  var m = ARR.mes || arrMesHoy();
  arrPedir(c, 'sst_cad_productividad', { p:{ emp:YO.obra.id, mes:m } }, function(j){
    var L = j.lista || [];
    var h = arrMesSel('arr-prod-mes');
    if(!L.length){ c.innerHTML = h + arrVacio('Nadie del equipo registró algo este mes', ''); arrMesAtar(c, function(){ arrProd(c); }); return; }
    h += '<div class="tarj"><div class="tarj-cab"><div><h2>Qué hizo cada uno</h2><p class="sub">' + (arrManda() ? 'Todo el equipo' : 'Lo tuyo (el jefe y el gerente ven a todos)') + ' · ' + esc(arrMesTx(m)) + '</p></div></div>' +
      '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>Persona</th><th class="num" title="Recorridos (los que empezaron en la obra)">Recorridos</th><th class="num">Horas en la obra</th><th class="num">Inspecciones</th><th class="num">Actas</th>' +
      '<th class="num">Observaciones</th><th class="num" title="Observaciones que validó o verificó">Cierres</th><th>Programa</th></tr></thead><tbody>' + L.map(function(g){
        return '<tr><td><b>' + esc(g.nombre || '') + '</b>' + (g.yo ? ' ' + arrPill('Tú', 'azul') : '') + '<small class="arr-sub">' + esc(CAD_RANGO[g.rango] || g.rango || '') + '</small></td>' +
          '<td class="num">' + (g.recorridos || 0) + (g.recorridos ? ' <small>(' + (g.en_obra || 0) + ' en la obra)</small>' : '') + '</td><td class="num">' + (g.horas_obra || 0) + '</td>' +
          '<td class="num">' + (g.insp || 0) + (g.insp_prom != null ? ' <small>(' + Math.round(g.insp_prom) + ' %)</small>' : '') + '</td><td class="num">' + (g.actas || 0) + '</td><td class="num">' + (g.obs || 0) + '</td><td class="num">' + (g.cierres || 0) + '</td>' +
          '<td>' + (g.programadas ? (g.cumplidas || 0) + ' de ' + g.programadas + (g.prog_pct != null ? ' · ' + arrPill(g.prog_pct + ' %', g.prog_pct >= 90 ? 'ok' : (g.prog_pct >= 70 ? 'ojo' : 'mal')) : '') : '<span class="arr-gris">nada programado</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    arrMesAtar(c, function(){ arrProd(c); });
  });
}

/* el informe del mes: los números de todo lo que supervisa, y su PDF */
function arrInforme(c){
  var m = ARR.mes || arrMesHoy();
  arrPedir(c, 'sst_cad_informe', { p:{ emp:YO.obra.id, mes:m } }, function(j){
    var L = j.lista || [], T = { n:0, alto:0, cerradas:0, a_tiempo:0, vencidas:0, insp:0, gente:0 };
    L.forEach(function(x){ var o = x.obs || {}; T.n += o.n || 0; T.alto += o.alto || 0; T.cerradas += o.cerradas || 0; T.a_tiempo += o.a_tiempo || 0; T.vencidas += o.vencidas || 0; T.insp += (x.insp || {}).n || 0; T.gente += (x.ind || {}).gente || 0; });
    if(typeof _cadAcc === 'function') _cadAcc(L.length ? '<button type="button" class="bt" id="arr-inf-pdf">Descargar el PDF</button>' : '');
    var h = arrMesSel('arr-inf-mes') + '<div class="rej">' + cifra('Observaciones del mes', String(T.n), T.alto + ' de riesgo alto', '') + cifra('Cerradas', String(T.cerradas), T.a_tiempo + ' levantadas a tiempo', '') +
      cifra('Vencidas', String(T.vencidas), 'sin levantarse a tiempo', T.vencidas ? 'mal' : '') + cifra('Inspecciones', String(T.insp), 'con lista', '') + '</div>';
    if(!L.length){ c.innerHTML = h + arrVacio('Nada que informar este mes', ''); arrMesAtar(c, function(){ arrInforme(c); }); return; }
    h += '<div class="tarj"><div class="tarj-cab"><div><h2>Informe de ' + esc(arrMesTx(j.mes)) + '</h2><p class="sub">Se arma solo con lo que registraron tú y las empresas · el PDF lleva lo mismo</p></div></div>' +
      '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>Empresa</th><th class="num">Observaciones</th><th class="num">Alto</th><th class="num">Cerradas</th><th class="num">A tiempo</th><th class="num">Vencidas</th><th class="num">Inspecciones</th><th class="num">% insp.</th><th>Documentos</th></tr></thead><tbody>' +
      L.map(function(x){ var o = x.obs || {}, i = x.insp || {}, r = x.req || {};
        return '<tr><td><b>' + esc(cadCorto(x.nombre || '')) + '</b><small class="arr-sub">' + esc(x.obra || '') + '</small></td><td class="num">' + (o.n || 0) + '</td><td class="num">' + (o.alto || 0) + '</td><td class="num">' + (o.cerradas || 0) + '</td>' +
          '<td class="num">' + (o.a_tiempo || 0) + '</td><td class="num' + (o.vencidas ? ' arr-mal' : '') + '">' + (o.vencidas || 0) + '</td><td class="num">' + (i.n || 0) + '</td><td class="num">' + (i.prom != null ? Math.round(i.prom) : '—') + '</td>' +
          '<td>' + (r.total ? (r.ok || 0) + ' / ' + r.total : '—') + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    arrMesAtar(c, function(){ arrInforme(c); });
    if($('arr-inf-pdf')) $('arr-inf-pdf').onclick = function(){ arrInformePdf(j, T); };
  });
}
function arrPdf(){
  if(window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  return cargarEvPDF().then(function(){ if(window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF; throw new Error('Falta el generador de PDF'); });
}
/* un PDF sencillo: título, filas de texto y tablas */
function arrPdfDoc(J){
  var doc = new J({ unit:'mm', format:'a4' }), W = 210, M = 14, y = 16, ancho = W - 2 * M;
  var D = { doc:doc, y:function(){ return y; } };
  D.linea = function(t, tam, neg, col){ doc.setFont('helvetica', neg ? 'bold' : 'normal'); doc.setFontSize(tam || 9.5); doc.setTextColor(col || '#1B2A33');
    doc.splitTextToSize(String(t == null ? '' : t), ancho).forEach(function(s){ if(y > 282){ doc.addPage(); y = 16; } doc.text(s, M, y); y += (tam || 9.5) * 0.45; }); };
  D.tit = function(t){ y += 3; if(y > 268){ doc.addPage(); y = 16; } doc.setDrawColor('#F5B700'); doc.setLineWidth(0.6); doc.line(M, y, M + 12, y); y += 5; D.linea(t, 11, true, '#0B2A3A'); y += 1; };
  D.tabla = function(cab, filas, anchos){
    var x0 = M, tot = anchos.reduce(function(a, b){ return a + b; }, 0), k = ancho / tot;
    var fila = function(cs, neg){
      var alto = 0, partes = cs.map(function(t, i){ var p = doc.splitTextToSize(String(t == null ? '' : t), anchos[i] * k - 2); alto = Math.max(alto, p.length); return p; });
      var h = alto * 3.9 + 1.6; if(y + h > 284){ doc.addPage(); y = 16; }
      doc.setFont('helvetica', neg ? 'bold' : 'normal'); doc.setFontSize(8.3); doc.setTextColor(neg ? '#0B2A3A' : '#1B2A33');
      var x = x0; partes.forEach(function(p, i){ doc.text(p, x + 1, y + 3.2); x += anchos[i] * k; });
      y += h; doc.setDrawColor('#D5DEE4'); doc.setLineWidth(0.15); doc.line(M, y - 0.6, M + ancho, y - 0.6);
    };
    fila(cab, true); filas.forEach(function(f){ fila(f, false); }); y += 2;
  };
  D.pie = function(t){ var n = doc.getNumberOfPages(); for(var i = 1; i <= n; i++){ doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor('#7D8F9A'); doc.text(t + ' · ' + i + ' / ' + n, M, 292); } };
  return D;
}
function arrBajarPdf(D, nombre){
  var blob = D.doc.output('blob');
  if(typeof bajarBlob === 'function') bajarBlob(blob, nombre);
  else { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
}
function arrInformePdf(j, T){
  var b = $('arr-inf-pdf'); if(b){ b.disabled = true; b.textContent = 'Armando el PDF…'; }
  arrPdf().then(function(J){
    var D = arrPdfDoc(J);
    D.linea('OBRASST', 9, true, '#8A5700');
    D.linea('INFORME DE SUPERVISIÓN · ' + arrMesTx(j.mes).toUpperCase(), 15, true, '#0B2A3A');
    D.linea((j.empresa || (YO.obra || {}).nombre || '') + ' · generado el ' + arrHora(j.ahora || new Date().toISOString()), 9.5);
    D.tit('RESUMEN');
    D.linea(T.n + ' observaciones (' + T.alto + ' de riesgo alto) · ' + T.cerradas + ' cerradas · ' + T.a_tiempo + ' levantadas a tiempo · ' + T.vencidas + ' vencidas · ' + T.insp + ' inspecciones con lista', 9.5);
    D.tit('POR EMPRESA');
    D.tabla(['Empresa', 'Obra', 'Obs.', 'Alto', 'Cerradas', 'A tiempo', 'Vencidas', 'Insp.', '% insp.', 'Documentos'],
      (j.lista || []).map(function(x){ var o = x.obs || {}, i = x.insp || {}, r = x.req || {};
        return [cadCorto(x.nombre || ''), x.obra || '', o.n || 0, o.alto || 0, o.cerradas || 0, o.a_tiempo || 0, o.vencidas || 0, i.n || 0, i.prom != null ? Math.round(i.prom) : '—', r.total ? (r.ok || 0) + ' / ' + r.total : '—']; }),
      [30, 24, 9, 9, 12, 12, 12, 9, 10, 15]);
    D.linea('Las cifras salen de lo que cada empresa y el equipo de supervisión registraron en OBRASST durante el mes. Cada observación, inspección y acta queda sellada con la hora del servidor.', 8, false, '#5E6E79');
    D.pie('OBRASST · Informe de supervisión de ' + arrMesTx(j.mes));
    arrBajarPdf(D, 'OBRASST-informe-' + j.mes + '.pdf');
    if(b){ b.disabled = false; b.textContent = 'Descargar el PDF'; }
  }).catch(function(e){ if(b){ b.disabled = false; b.textContent = 'Descargar el PDF'; } toast('No se pudo armar el PDF: ' + ((e && e.message) || e)); });
}

/* ══ MI CARTERA (Mandante) ════════════════════════════════════════════════════════════════════ */
/* las alertas tempranas, en palabras */
function arrAlertaTx(a){
  var e = '<b>' + esc(cadCorto(a.empresa || '')) + '</b>';
  switch(a.que){
    case 'alto_vencido': return e + ': ' + a.n + (a.n === 1 ? ' observación de riesgo alto vencida hace más de un día' : ' observaciones de riesgo alto vencidas hace más de un día');
    case 'sin_homologar': return e + ' trabaja sin homologar: ' + (a.faltan === 1 ? 'falta 1 requisito de ingreso' : 'faltan ' + (a.faltan || 0) + ' requisitos de ingreso');
    case 'rechazo': return e + ' rechazó el requerimiento' + (a.nota ? ': «' + esc(a.nota) + '»' : '');
    case 'no_atendio': return e + ' no atendió el requerimiento (venció el ' + esc(arrFecha(a.t)) + ')';
    case 'accidentes': return e + ': ' + a.n + (a.n === 1 ? ' accidente este año' : ' accidentes este año');
    case 'supervisora_programa': return e + ' (tu supervisora) cumple el ' + a.pct + ' % de su programa del mes';
    case 'supervisora_valida': return e + ' (tu supervisora) tiene ' + a.n + (a.n === 1 ? ' levantamiento por validar' : ' levantamientos por validar') + ' hace más de 24 horas';
    case 'acceso_sin_orden': return '<b>' + esc(a.n || '') + '</b> miró a ' + e + ' sin una orden de inspección (' + a.veces + (a.veces === 1 ? ' vez' : ' veces') + ')';
    case 'acta_sin_orden': return '<b>' + esc(a.n || '') + '</b> levantó el acta ' + esc(a.acta || '') + ' a ' + e + ' sin una orden de inspección';
    case 'visitas_sin_acta': return '<b>' + esc(a.n || '') + '</b> visitó ' + a.veces + ' veces a ' + e + ' sin levantar un acta ni una inspección';
    case 'recorrido_lejos': return '<b>' + esc(a.n || '') + '</b> empezó un recorrido de ' + e + ' a ' + arrN(a.metros) + ' m de la obra';
    case 'orden_vencida': return 'La orden ' + esc(a.orden || '') + ' de <b>' + esc(a.n || '') + '</b> a ' + e + ' venció el ' + esc(arrFecha(a.t)) + ' sin su acta';
    case 'acta_abierta': return 'El acta ' + esc(a.acta || '') + ' de <b>' + esc(a.n || '') + '</b> a ' + e + ' lleva más de 3 días sin la firma del representante';
  }
  return e + ': ' + esc(a.que || '');
}
function arrAlertas(L){
  if(!L.length) return '<div class="aviso ok arr-sin">Ninguna alerta: nada urgente en tus proyectos.</div>';
  return '<ul class="arr-alertas">' + L.map(function(a){ return '<li class="g' + (a.g || 3) + '"><span class="arr-g" aria-hidden="true">' + (a.g === 1 ? '●' : (a.g === 2 ? '◐' : '○')) + '</span><span>' + arrAlertaTx(a) + '</span></li>'; }).join('') + '</ul>';
}
/* el tablero para el directorio */
function arrTablero(c){
  if(typeof _cadAcc === 'function') _cadAcc('<button type="button" class="bt sec" id="arr-tab-imp">Imprimir</button>');
  if($('arr-tab-imp')) $('arr-tab-imp').onclick = function(){ window.print(); };
  arrPedir(c, 'sst_cad_tablero', { p:{ emp:YO.obra.id } }, function(j){
    var k = j.cifras || {}, A = j.alertas || [];
    var h = '<div class="rej">' + cifra('Proyectos', String(k.proyectos || 0), (k.empresas || 0) + (k.empresas === 1 ? ' empresa' : ' empresas') + ' · ' + (k.supervisoras || 0) + (k.supervisoras === 1 ? ' supervisora' : ' supervisoras'), '') +
      cifra('Personas hoy', arrN(k.gente), 'en todas sus obras', '') +
      cifra('Observaciones abiertas', String(k.ab || 0), k.ven ? k.ven + (k.ven === 1 ? ' vencida' : ' vencidas') : 'ninguna vencida', k.ven ? 'mal' : '') +
      cifra('Levantadas a tiempo', k.lev ? Math.round(100 * (k.a_tiempo || 0) / k.lev) + ' %' : '—', 'últimos 30 días', '') +
      cifra('Homologadas', k.con_ingreso ? (k.homologadas || 0) + ' / ' + k.con_ingreso : '—', 'de las que tienen requisitos de ingreso', k.con_ingreso && (k.homologadas || 0) < k.con_ingreso ? 'ojo' : '') +
      cifra('Accidentes del año', String(k.acc || 0), 'se muestran aparte: no restan', k.acc ? 'mal' : '') + '</div>' +
      '<div class="tarj"><div class="tarj-cab"><div><h2>Alertas tempranas</h2><p class="sub">De la más grave a la más leve · al ' + esc(arrHora(j.ahora || new Date().toISOString())) + '</p></div></div><div class="tarj-cuerpo">' + arrAlertas(A) + '</div></div>';
    c.innerHTML = h;
  });
}
/* el ranking de contratistas, entre todos sus proyectos */
function arrRanking(c){
  arrPedir(c, 'sst_cad_ranking', { p:{ emp:YO.obra.id } }, function(j){
    var L = j.lista || [];
    var h = '<div class="aviso">' + esc(j.como || '') + '</div>';
    if(!L.length){ c.innerHTML = h + arrVacio('Todavía no hay contratistas que comparar', 'Aparecen cuando supervisas a alguien.'); return; }
    h += '<div class="tarj"><div class="tabla-caja"><table class="arr-t arr-rank"><thead><tr><th class="num">#</th><th>Contratista</th><th>Nota</th><th class="num" title="Levantar a tiempo (40 %)">A tiempo</th><th class="num" title="Promedio de sus inspecciones (25 %)">Inspecciones</th>' +
      '<th class="num" title="Sin observaciones de riesgo alto vencidas (20 %)">Sin alto vencido</th><th class="num" title="Lo pedido en documentos, aprobado (15 %)">Documentos</th><th class="num">Abiertas</th><th class="num">Accidentes</th><th>Homologada</th></tr></thead><tbody>' +
      L.map(function(x, k){
        var donde = (x.donde || []).map(function(d){ return d.proyecto + (d.supervisora ? ' (vía ' + d.supervisora + ')' : ''); }).join(' · ');
        return '<tr><td class="num">' + (k + 1) + '</td><td><b>' + esc(cadCorto(x.nombre || '')) + '</b><small class="arr-sub">' + (x.ruc ? esc(cadDocN()) + ' ' + esc(x.ruc) + ' · ' : '') + esc(donde) + '</small></td>' +
          '<td class="arr-nota-c">' + (x.nota != null ? arrBarra(x.nota, x.nota < 60) : '<span class="arr-gris">sin datos</span>') + '</td>' +
          '<td class="num">' + (x.a_tiempo != null ? x.a_tiempo : '—') + '</td><td class="num">' + (x.inspecciones != null ? x.inspecciones : '—') + '</td><td class="num">' + (x.sin_alto_vencido != null ? x.sin_alto_vencido : '—') + '</td>' +
          '<td class="num">' + (x.documentos != null ? x.documentos : '—') + '</td><td class="num">' + (x.ab || 0) + (x.ven ? ' <small class="arr-mal">(' + x.ven + ' venc.)</small>' : '') + '</td>' +
          '<td class="num' + (x.acc ? ' arr-mal' : '') + '">' + (x.acc || 0) + '</td><td>' + (x.homologada == null ? '<span class="arr-gris">—</span>' : (x.homologada ? arrPill('Sí', 'ok') : arrPill('Falta', 'mal'))) + '</td></tr>';
      }).join('') + '</tbody></table></div></div><p class="cad-pie">De las empresas que supervisa tu supervisora solo hay cifras (nadie se salta a nadie): salen con lo que hay.</p>';
    c.innerHTML = h;
  });
}
/* las retenciones: los montos del Mandante y la sugerida de un mes, caso por caso */
function arrReten(c){
  var R = ARR.reten; if(!R.mes) R.mes = arrMesMas(arrMesHoy(), -1);
  arrPedir(c, 'sst_cad_reglas', { p:{ emp:YO.obra.id } }, function(j){
    var r = j.reglas || {}, manda = arrManda(), L = arrEmpresas().filter(function(l){ return l.estado === 'activa'; });
    var campo = function(k, et, suf){ return '<div class="campo"><label for="arr-rg-' + k + '">' + esc(et) + '</label><div class="arr-num"><input id="arr-rg-' + k + '" inputmode="decimal" value="' + (r[k] != null ? esc(r[k]) : '') + '"' + (manda ? '' : ' disabled') + '><span>' + esc(suf) + '</span></div></div>'; };
    var h = '<div class="tarj"><div class="tarj-cab"><div><h2>Tus montos</h2><p class="sub">Lo que dice tu contrato por cada incumplimiento' + (manda ? '' : ' (los pone el jefe o el gerente)') + '</p></div></div><div class="tarj-cuerpo"><div class="arr-reglas">' +
      campo('obs_alto', 'Por observación de riesgo alto vencida', 'S/ c/u') + campo('obs_otro', 'Por otra observación vencida', 'S/ c/u') + campo('doc', 'Por documento del mes que falta', 'S/ c/u') +
      campo('insp_bajo', 'Si el promedio de sus inspecciones baja de…', 'S/') + campo('umbral', '…este umbral', '%') + campo('tope_pct', 'Tope de la retención', '% de la valorización') + '</div>' +
      (manda ? '<p class="msg mal" id="arr-rg-msg"></p><button type="button" class="bt" id="arr-rg-guardar">Guardar los montos</button>' : '') + '</div></div>';
    h += '<div class="tarj"><div class="tarj-cab"><div><h2>La retención de un mes</h2><p class="sub">OBRASST cuenta y muestra cada caso; cuánto retener lo decides tú según tu contrato</p></div></div><div class="tarj-cuerpo">' +
      '<div class="arr-fila arr-fila-c"><div class="campo"><label for="arr-rt-emp">Contratista</label><select id="arr-rt-emp"></select></div>' +
      '<div class="campo"><label for="arr-rt-mes">Mes</label><input type="month" id="arr-rt-mes" value="' + esc(R.mes) + '" max="' + esc(arrMesHoy()) + '"></div>' +
      '<div class="campo"><label for="arr-rt-val">Valorización del mes (opcional)</label><div class="arr-num"><span>S/</span><input id="arr-rt-val" inputmode="decimal" value="' + esc(R.val || '') + '"></div></div>' +
      '<button type="button" class="bt" id="arr-rt-ver">Calcular</button></div><div id="arr-rt-res"></div></div></div>';
    c.innerHTML = h;
    var s = $('arr-rt-emp');
    s.innerHTML = '<option value="">Elige la contratista</option>' + L.map(function(l){ return '<option value="' + esc(l.id) + '"' + (R.enlace === l.id ? ' selected' : '') + '>' + esc(l.n) + '</option>'; }).join('');
    if($('arr-rg-guardar')) $('arr-rg-guardar').onclick = function(){
      var p = { emp:YO.obra.id }, mal = '';
      ['obs_alto', 'obs_otro', 'doc', 'insp_bajo', 'umbral', 'tope_pct'].forEach(function(k){
        var v = String($('arr-rg-' + k).value || '').replace(/[^\d.,]/g, '').replace(',', '.');
        if(v === '') return; var n = +v; if(isNaN(n) || n < 0 || ((k === 'umbral' || k === 'tope_pct') && n > 100)) mal = 'Revisa los montos: números de 0 en adelante (los % hasta 100).'; else p[k] = n; });
      if(mal){ $('arr-rg-msg').textContent = mal; return; }
      $('arr-rg-guardar').disabled = true;
      sbRpc('sst_cad_reglas', { p:p }).then(function(x){ $('arr-rg-guardar').disabled = false; if(!x || !x.ok){ $('arr-rg-msg').textContent = arrMotivo(x); return; } $('arr-rg-msg').textContent = ''; toast('Montos guardados.'); },
        function(e){ $('arr-rg-guardar').disabled = false; $('arr-rg-msg').textContent = arrMotivo(null, e); });
    };
    $('arr-rt-ver').onclick = function(){
      R.enlace = s.value; R.mes = $('arr-rt-mes').value || R.mes; R.val = String($('arr-rt-val').value || '').replace(/[^\d.,]/g, '').replace(',', '.');
      var res = $('arr-rt-res');
      if(!R.enlace){ res.innerHTML = '<p class="msg mal">Elige la contratista.</p>'; return; }
      res.innerHTML = '<div class="vacio">Calculando…</div>';
      sbRpc('sst_cad_retencion', { p:{ enlace:R.enlace, mes:R.mes, valorizacion:R.val === '' ? null : +R.val } }).then(function(x){
        if(!x || !x.ok){ res.innerHTML = '<p class="msg mal">' + esc(arrMotivo(x)) + '</p>'; return; }
        var rg = x.reglas || {}, fila = function(t, L, monto){ return '<tr><td>' + esc(t) + (L && L.length ? '<small class="arr-sub">' + L.map(function(o){ return esc(o.n ? o.n + ' · ' + (o.titulo || '') : (o.item || '')); }).join(' · ') + '</small>' : '') + '</td>' +
          '<td class="num">' + (L ? L.length : '') + '</td><td class="num">' + (monto != null ? esc(arrSoles(monto)) : '—') + '</td></tr>'; };
        var h2 = (x.sin_reglas ? '<div class="aviso ojo">Todavía no pones tus montos: arriba, «Tus montos». Mientras tanto, aquí están los casos.</div>' : '') +
          '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>' + esc(cadCorto(x.empresa || '')) + ' · ' + esc(arrMesTx(x.mes)) + '</th><th class="num">Casos</th><th class="num">Monto</th></tr></thead><tbody>' +
          fila('Observaciones de riesgo alto vencidas', x.obs_alto, (x.obs_alto || []).length * (rg.obs_alto || 0)) +
          fila('Otras observaciones vencidas', x.obs_otro, (x.obs_otro || []).length * (rg.obs_otro || 0)) +
          fila('Documentos que faltaron', x.docs, (x.docs || []).length * (rg.doc || 0)) +
          '<tr><td>Promedio de sus inspecciones: ' + (x.insp_prom != null ? Math.round(x.insp_prom) + ' %' : 'sin inspecciones') + (rg.umbral != null ? ' (umbral ' + rg.umbral + ' %)' : '') + '</td><td class="num">' + (x.insp_bajo ? '1' : '0') + '</td><td class="num">' + esc(arrSoles(x.insp_bajo ? (rg.insp_bajo || 0) : 0)) + '</td></tr>' +
          '<tr class="arr-total"><td>Total por los casos</td><td></td><td class="num">' + esc(arrSoles(x.monto)) + '</td></tr>' +
          (x.tope != null ? '<tr><td>Tope (' + rg.tope_pct + ' % de ' + esc(arrSoles(x.valorizacion)) + ')</td><td></td><td class="num">' + esc(arrSoles(x.tope)) + '</td></tr>' : '') +
          '<tr class="arr-total"><td>Retención sugerida</td><td></td><td class="num">' + esc(arrSoles(x.sugerido)) + '</td></tr></tbody></table></div><p class="cad-pie">' + esc(x.nota || '') + ' No es asesoría legal.</p>';
        res.innerHTML = h2;
      }, function(e){ res.innerHTML = '<p class="msg mal">' + esc(arrMotivo(null, e)) + '</p>'; });
    };
    if(R.enlace) $('arr-rt-ver').onclick();
  });
}
/* la auditoría de su supervisora */
function arrAudit(c){
  var m = ARR.mes || arrMesHoy();
  arrPedir(c, 'sst_cad_auditoria', { p:{ emp:YO.obra.id, mes:m } }, function(j){
    var L = j.lista || [], SEM = { verde:['Verde', 'ok'], ambar:['Ámbar', 'ojo'], rojo:['Rojo', 'mal'], sin_datos:['Sin datos', 'gris'] };
    var h = arrMesSel('arr-aud-mes') + '<div class="aviso">' + esc(j.como || '') + ' Son cifras de su trabajo: nada del detalle de las empresas que ella supervisa.</div>';
    if(!L.length){ c.innerHTML = h + arrVacio('No tienes una supervisora incluida', 'Desde la app: «Supervisar a una empresa» → «Mi supervisora».'); arrMesAtar(c, function(){ arrAudit(c); }); return; }
    h += '<div class="arr-auds">' + L.map(function(s){
      var S = SEM[s.semaforo] || SEM.sin_datos;
      return '<div class="tarj arr-aud"><div class="tarj-cab"><div><h2>' + esc(cadCorto(s.nombre || '')) + '</h2><p class="sub">' + esc(s.proyecto || '') + ' · supervisa a ' + (s.empresas || 0) + (s.empresas === 1 ? ' empresa' : ' empresas') + '</p></div>' + arrPill(S[0], S[1]) + '</div>' +
        '<div class="rej">' + cifra('Su programa', s.prog_pct != null ? s.prog_pct + ' %' : '—', (s.cumplidas || 0) + ' de ' + ((s.cumplidas || 0) + (s.no_cumplidas || 0)) + ' cumplidas · ' + (s.programadas || 0) + ' programadas', s.prog_pct != null && s.prog_pct < 70 ? 'mal' : '') +
        cifra('En la obra', s.en_obra_pct != null ? s.en_obra_pct + ' %' : '—', (s.recorridos || 0) + ' recorridos · ' + (s.horas_obra || 0) + ' h en la obra', s.en_obra_pct != null && s.en_obra_pct < 80 ? 'ojo' : '') +
        cifra('Inspecciones', String(s.insp || 0), s.insp_prom != null ? 'promedio ' + Math.round(s.insp_prom) + ' %' : 'sin inspecciones', '') +
        cifra('Actas', String(s.actas || 0), 'firmadas o abiertas', '') +
        cifra('Observaciones', String(s.obs || 0), s.obs_por_insp != null ? s.obs_por_insp + ' por inspección' : '', '') +
        cifra('Por validar > 24 h', String(s.por_validar_24h || 0), (s.validadas || 0) + ' validadas en el mes', s.por_validar_24h ? 'mal' : '') + '</div></div>';
    }).join('') + '</div>';
    c.innerHTML = h;
    arrMesAtar(c, function(){ arrAudit(c); });
  });
}

/* ══ CENTRO DE FISCALIZACIÓN ═════════════════════════════════════════════════════════════════ */
var ARR_POR = { accidentes:'accidentes', alto_vencido:'riesgo alto vencido', a_tiempo:'no levanta a tiempo', documentos:'documentos', inspecciones:'inspecciones bajas', sin_visita:'sin visita', tamano:'tamaño', medidas:'medida vigente' };
function arrPrior(c){
  var reg = ARR.region || '';
  arrPedir(c, 'sst_cad_prioridad', { p:{ emp:YO.obra.id, region:reg || null } }, function(j){
    var L = j.lista || [], RG = j.regiones || [], manda = arrManda();
    var h = '<div class="aviso">' + esc(j.como || '') + '</div>';
    if(RG.length > 1 || reg) h += '<div class="seg chico arr-regs" role="tablist" aria-label="Región"><button type="button" data-reg=""' + (!reg ? ' class="on"' : '') + '>Todas</button>' +
      RG.map(function(r){ return '<button type="button" data-reg="' + esc(r.region) + '"' + (reg === r.region ? ' class="on"' : '') + '>' + esc(r.region) + ' <b>' + r.empresas + (r.urgentes ? ' · ' + r.urgentes + ' urgentes' : '') + '</b></button>'; }).join('') + '</div>';
    if(!L.length){ c.innerHTML = h + arrVacio('Todavía no fiscalizas a ninguna empresa', 'Desde la app: «Supervisión» → «Supervisar a una empresa».'); arrRegAtar(c); return; }
    h += '<div class="tarj"><div class="tabla-caja"><table class="arr-t"><thead><tr><th>Empresa</th><th>Región</th><th>Índice</th><th>Por qué</th><th class="num">Gente</th><th>Última visita</th><th></th></tr></thead><tbody>' + L.map(function(x){
      var por = Object.keys(x.por || {}).filter(function(k){ return (x.por[k] || 0) > 0; }).sort(function(a, b){ return x.por[b] - x.por[a]; }).map(function(k){ return ARR_POR[k] + ' ' + x.por[k]; });
      return '<tr><td><b>' + esc(cadCorto(x.nombre || '')) + '</b>' + (x.ruc ? '<small class="arr-sub">' + esc(cadDocN()) + ' ' + esc(x.ruc) + '</small>' : '') + '</td><td>' + esc(x.region || '') + '</td>' +
        '<td class="arr-nota-c">' + arrBarra(x.indice, x.indice >= 50) + '</td><td><small>' + esc(por.join(' · ') || 'nada en contra') + '</small></td><td class="num">' + (x.gente != null ? arrN(x.gente) : '—') + '</td>' +
        '<td>' + (x.ultima ? esc(hace(x.ultima)) : '<span class="arr-mal">nunca</span>') + '</td>' +
        '<td class="arr-acc">' + (manda ? '<button type="button" class="bt sec chico" data-ord-a="' + esc(x.enlace) + '">Ordenar inspección</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    arrRegAtar(c);
    Array.prototype.forEach.call(c.querySelectorAll('[data-ord-a]'), function(b){ b.onclick = function(){ arrOrdenNueva(b.getAttribute('data-ord-a'), 'prioridad'); }; });
  });
}
function arrRegAtar(c){ Array.prototype.forEach.call(c.querySelectorAll('[data-reg]'), function(b){ b.onclick = function(){ ARR.region = b.getAttribute('data-reg'); arrPrior(c); }; }); }
/* las órdenes de inspección */
function arrOrdenes(c){
  var est = ARR.ordEst || 'asignada';
  if(typeof _cadAcc === 'function') _cadAcc(arrManda() ? '<button type="button" class="bt" id="arr-ord-nueva">＋ Nueva orden</button>' : '');
  if($('arr-ord-nueva')) $('arr-ord-nueva').onclick = function(){ arrOrdenNueva('', ''); };
  arrPedir(c, 'sst_cad_ordenes', { p:{ emp:YO.obra.id, estado:est || null } }, function(j){
    var L = j.lista || [], manda = arrManda();
    var h = '<div class="seg chico" role="tablist" aria-label="Cuáles">' + [['asignada', 'Abiertas'], ['cerrada', 'Cerradas'], ['anulada', 'Anuladas'], ['', 'Todas']].map(function(x){
      return '<button type="button" data-ord-est="' + x[0] + '" class="' + (x[0] === est ? 'on' : '') + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>';
    if(!L.length) h += arrVacio(est === 'asignada' ? 'No hay órdenes abiertas' : 'Nada por aquí', manda ? 'Una orden asigna una empresa a un inspector, con su motivo y su plazo. La cierra el acta que él levanta con esa orden.' : '');
    else h += '<div class="tarj"><div class="tabla-caja"><table class="arr-t"><thead><tr><th>Orden</th><th>Empresa</th><th>Inspector</th><th>Motivo</th><th>Plazo</th><th>Estado</th><th></th></tr></thead><tbody>' + L.map(function(o){
      var E = o.estado === 'asignada' ? (o.vencida ? arrPill('Vencida', 'mal') : arrPill('Abierta', 'azul')) : (o.estado === 'cerrada' ? arrPill('Cerrada', 'ok') : arrPill('Anulada', 'gris'));
      return '<tr><td><b>' + esc(o.n || '') + '</b><small class="arr-sub">' + esc(arrFecha(o.creado)) + '</small></td><td>' + esc(cadCorto(o.empresa || '')) + '</td><td>' + esc(o.inspector_nombre || '') + (o.mia ? ' ' + arrPill('Tú', 'azul') : '') + '</td>' +
        '<td>' + esc(ARR_MOT[o.motivo] || o.motivo || '') + (o.detalle ? '<small class="arr-sub">' + esc(o.detalle) + '</small>' : '') + '</td><td>' + esc(arrFecha(o.plazo)) + '</td>' +
        '<td>' + E + (o.acta ? '<small class="arr-sub">con el acta ' + esc(o.acta.n) + '</small>' : '') + (o.anulado_nota ? '<small class="arr-sub">«' + esc(o.anulado_nota) + '»</small>' : '') + '</td>' +
        '<td class="arr-acc">' + (manda && o.estado === 'asignada' ? '<button type="button" class="bt sec chico" data-ord-anular="' + esc(o.id) + '">Anular</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    Array.prototype.forEach.call(c.querySelectorAll('[data-ord-est]'), function(b){ b.onclick = function(){ ARR.ordEst = b.getAttribute('data-ord-est'); arrOrdenes(c); }; });
    Array.prototype.forEach.call(c.querySelectorAll('[data-ord-anular]'), function(b){ b.onclick = function(){
      preguntar('Anular la orden', 'Queda anulada, con tu motivo: nada se borra.', { etiqueta:'Por qué', minimo:8, corto:'Escribe por qué (unas palabras).' }, { si:'Anular', mal:true }).then(function(v){
        if(!v) return;
        sbRpc('sst_cad_orden_anular', { p:{ id:b.getAttribute('data-ord-anular'), nota:v } }).then(function(r){ if(!r || !r.ok){ toast(arrMotivo(r)); return; } toast('Orden anulada.'); arrOrdenes(c); },
          function(e){ toast(arrMotivo(null, e)); });
      });
    }; });
  });
}
function arrOrdenNueva(enlace, motivo){
  var hoy = arrHoy();
  abrirHoja('Nueva orden de inspección', 'La cierra el acta que levanta ese inspector con esta orden',
    '<div class="campo"><label for="arr-on-emp">Empresa</label><select id="arr-on-emp"></select></div>' +
    '<div class="campo"><label for="arr-on-ins">Inspector</label><select id="arr-on-ins"><option value="">Elige a quién</option></select></div>' +
    '<div class="campo"><label for="arr-on-mot">Motivo</label><select id="arr-on-mot"><option value="">Elige el motivo</option>' + Object.keys(ARR_MOT).map(function(k){ return '<option value="' + k + '"' + (k === motivo ? ' selected' : '') + '>' + esc(ARR_MOT[k]) + '</option>'; }).join('') + '</select></div>' +
    '<div class="campo"><label for="arr-on-det">Detalle (opcional)</label><input id="arr-on-det" maxlength="400" placeholder="Denuncia por excavación sin entibar"></div>' +
    '<div class="campo"><label for="arr-on-plazo">Plazo</label><input type="date" id="arr-on-plazo" value="' + arrMasDias(hoy, 7) + '" min="' + hoy + '" max="' + arrMasDias(hoy, 365) + '"></div><p class="msg mal" id="arr-on-msg"></p>',
    '<button type="button" class="bt sec" id="arr-on-no">Cancelar</button><button type="button" class="bt" id="arr-on-si">Asignar la orden</button>', { id:'arr-orden-nueva' });
  arrSelEmpresas('arr-on-emp', { valor:enlace }); arrSelGente('arr-on-ins', false);
  $('arr-on-no').onclick = cerrarHoja;
  $('arr-on-si').onclick = function(){
    var p = { enlace:$('arr-on-emp').value, inspector:$('arr-on-ins').value, motivo:$('arr-on-mot').value, detalle:$('arr-on-det').value.trim() || null, plazo:$('arr-on-plazo').value };
    if(!p.enlace){ $('arr-on-msg').textContent = 'Elige la empresa.'; return; }
    if(!p.inspector){ $('arr-on-msg').textContent = 'Elige al inspector.'; return; }
    if(!p.motivo){ $('arr-on-msg').textContent = 'Elige el motivo.'; return; }
    $('arr-on-si').disabled = true;
    sbRpc('sst_cad_orden_nueva', { p:p }).then(function(r){
      $('arr-on-si').disabled = false;
      if(!r || !r.ok){ $('arr-on-msg').textContent = arrMotivo(r); return; }
      cerrarHoja(); toast('Orden ' + ((r.orden || {}).n || '') + ' asignada: le aparece en su celular.');
      ARR.ordEst = 'asignada'; ARR.tab.fis = 'ordenes'; arrRepintar();
    }, function(e){ $('arr-on-si').disabled = false; $('arr-on-msg').textContent = arrMotivo(null, e); });
  };
}
/* las medidas: vigentes hasta que la entidad las levanta, verificado en campo con su foto */
function arrMedidas(c){
  arrPedir(c, 'sst_cad_medidas', { p:{ emp:YO.obra.id, lado:'arriba' } }, function(j){
    var L = j.lista || [], vig = L.filter(function(m){ return m.estado === 'vigente'; });
    var h = '<div class="rej">' + cifra('Vigentes', String(vig.length), vig.length ? 'la empresa las ve en su app' : 'ninguna', vig.length ? 'mal' : '') + cifra('Levantadas', String(L.length - vig.length), 'con su foto', '') + '</div>';
    if(!L.length){ c.innerHTML = h + arrVacio('Todavía no hay medidas', 'La paralización o la prohibición van en el acta de fiscalización, en la app.'); return; }
    h += '<div class="tarj"><div class="tabla-caja"><table class="arr-t"><thead><tr><th>Medida</th><th>Empresa</th><th>Acta</th><th>Plazo</th><th>Estado</th><th></th></tr></thead><tbody>' + L.map(function(m){
      return '<tr><td><b>' + (m.tipo === 'paralizacion' ? 'Paralización' : 'Prohibición') + '</b><small class="arr-sub">' + esc(m.detalle || '') + '</small></td><td>' + esc(cadCorto(m.empresa || '')) + '</td>' +
        '<td>' + (m.acta ? esc(m.acta.n) + '<small class="arr-sub">' + esc(arrFecha(m.acta.fecha)) + '</small>' : '—') + '</td><td>' + (m.plazo ? esc(arrFecha(m.plazo)) : '—') + '</td>' +
        '<td>' + (m.estado === 'vigente' ? arrPill('Vigente', 'mal') : arrPill('Levantada', 'ok') + '<small class="arr-sub">' + esc(m.levantada_nombre || '') + ' · ' + esc(arrHora(m.levantada)) + '</small>' + (m.nota ? '<small class="arr-sub">«' + esc(m.nota) + '»</small>' : '') +
          (m.foto ? '<a class="arr-sub" href="' + esc(m.foto) + '" target="_blank" rel="noopener">Ver la foto</a>' : '')) + '</td>' +
        '<td class="arr-acc">' + (m.estado === 'vigente' ? '<button type="button" class="bt sec chico" data-med-lev="' + esc(m.id) + '">Levantar</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    Array.prototype.forEach.call(c.querySelectorAll('[data-med-lev]'), function(b){ b.onclick = function(){ arrMedidaLevantar(b.getAttribute('data-med-lev'), c); }; });
  });
}
function arrMedidaLevantar(id, c){
  var foto = null;
  abrirHoja('Levantar la medida', 'Verificado en campo: la foto de cómo quedó y qué se hizo',
    cadFotoCampo('arr-ml', 'La foto de cómo quedó') + '<div class="campo"><label for="arr-ml-nota">Qué se verificó</label><textarea id="arr-ml-nota" rows="3" maxlength="600" placeholder="Se entibó todo el tramo y se colocó baranda."></textarea></div><p class="msg mal" id="arr-ml-msg"></p>',
    '<button type="button" class="bt sec" id="arr-ml-no">Cancelar</button><button type="button" class="bt" id="arr-ml-si">Levantar la medida</button>', { id:'arr-med-' + id });
  cadFotoAtar('arr-ml', function(b){ foto = b; });
  $('arr-ml-no').onclick = cerrarHoja;
  $('arr-ml-si').onclick = function(){
    var nota = $('arr-ml-nota').value.trim();
    if(!foto){ $('arr-ml-msg').textContent = 'Falta la foto de cómo quedó.'; return; }
    if(nota.length < 8){ $('arr-ml-msg').textContent = 'Escribe qué se verificó (unas palabras).'; return; }
    $('arr-ml-si').disabled = true; $('arr-ml-msg').textContent = '';
    subirFoto('cadena', foto, 'medida.jpg').then(function(url){ return sbRpc('sst_cad_medida_levantar', { p:{ id:id, nota:nota, foto:url, n:cadYo() } }); }).then(function(r){
      $('arr-ml-si').disabled = false;
      if(!r || !r.ok){ $('arr-ml-msg').textContent = arrMotivo(r); return; }
      cerrarHoja(); toast('Medida levantada: la empresa ya lo ve.'); arrMedidas(c);
    }, function(e){ $('arr-ml-si').disabled = false; $('arr-ml-msg').textContent = arrMotivo(null, e); });
  };
}
/* el control de sus inspectores: qué hizo cada uno, y las alertas */
function arrControl(c){
  if(!ARR.ctl){ var hoy = arrHoy(); ARR.ctl = { desde:arrMasDias(hoy, -29), hasta:hoy }; }
  arrPedir(c, 'sst_cad_control', { p:{ emp:YO.obra.id, desde:ARR.ctl.desde, hasta:ARR.ctl.hasta } }, function(j){
    var G = j.gente || [], A = j.alertas || [];
    var h = '<div class="arr-fila arr-fila-c"><div class="campo"><label for="arr-ct-d">Desde</label><input type="date" id="arr-ct-d" value="' + esc(ARR.ctl.desde) + '"></div>' +
      '<div class="campo"><label for="arr-ct-h">Hasta</label><input type="date" id="arr-ct-h" value="' + esc(ARR.ctl.hasta) + '" max="' + esc(arrHoy()) + '"></div><button type="button" class="bt sec" id="arr-ct-ver">Ver</button></div>' +
      '<div class="tarj"><div class="tarj-cab"><div><h2>Alertas</h2><p class="sub">Nada se borra: cada acción queda con su hora, su lugar y su sello</p></div></div><div class="tarj-cuerpo">' + arrAlertas(A) + '</div></div>';
    if(G.length) h += '<div class="tarj"><div class="tarj-cab"><div><h2>Qué hizo cada uno</h2><p class="sub">Del ' + esc(arrFecha(ARR.ctl.desde)) + ' al ' + esc(arrFecha(ARR.ctl.hasta)) + '</p></div></div>' +
      '<div class="tabla-caja"><table class="arr-t"><thead><tr><th>Persona</th><th class="num">Actas</th><th class="num">Observaciones</th><th class="num">Inspecciones</th><th class="num">Recorridos</th><th class="num" title="Recorridos que empezaron lejos de la obra">Lejos</th>' +
      '<th class="num" title="Veces que miró la ficha, las inspecciones, los documentos o un acta de una empresa">Accesos</th><th class="num">Órdenes</th></tr></thead><tbody>' + G.map(function(g){
        return '<tr><td><b>' + esc(g.nombre || '') + '</b><small class="arr-sub">' + esc(CAD_RANGO[g.rango] || g.rango || '') + '</small></td><td class="num">' + (g.actas || 0) + '</td><td class="num">' + (g.obs || 0) + '</td><td class="num">' + (g.insp || 0) + '</td>' +
          '<td class="num">' + (g.recorridos || 0) + '</td><td class="num' + (g.lejos ? ' arr-mal' : '') + '">' + (g.lejos || 0) + '</td><td class="num">' + (g.accesos || 0) + '</td><td class="num">' + (g.ordenes || 0) + (g.ordenes ? ' <small>(' + (g.ordenes_cerradas || 0) + ' cerradas)</small>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
    c.innerHTML = h;
    $('arr-ct-ver').onclick = function(){ var d = $('arr-ct-d').value, hh = $('arr-ct-h').value; if(!d || !hh) return; ARR.ctl = { desde:d, hasta:hh }; arrControl(c); };
  });
}
/* el expediente probatorio de una empresa: todo, con su sello y si coincide hoy; y su PDF */
function arrExpediente(c){
  var X = ARR.exp, L = arrEmpresas();
  var h = '<div class="tarj"><div class="tarj-cab"><div><h2>Expediente probatorio</h2><p class="sub">Todo lo de una empresa en un periodo: actas con sus firmas, observaciones con su historial, inspecciones, lo pedido, medidas, órdenes, recorridos y quién miró qué. Cada cosa con su sello y si coincide hoy. Queda anotado quién lo sacó.</p></div></div>' +
    '<div class="tarj-cuerpo"><div class="arr-fila arr-fila-c"><div class="campo"><label for="arr-ex-emp">Empresa</label><select id="arr-ex-emp"></select></div>' +
    '<div class="campo"><label for="arr-ex-d">Desde (opcional)</label><input type="date" id="arr-ex-d" value="' + esc(X.desde) + '"></div><div class="campo"><label for="arr-ex-h">Hasta (opcional)</label><input type="date" id="arr-ex-h" value="' + esc(X.hasta) + '"></div>' +
    '<button type="button" class="bt" id="arr-ex-ver"' + (arrManda() ? '' : ' disabled title="Lo saca el jefe o el gerente"') + '>Armar el expediente</button></div>' + (arrManda() ? '' : '<p class="sub">El expediente lo saca el jefe o el gerente.</p>') + '<div id="arr-ex-res"></div></div></div>';
  c.innerHTML = h;
  var s = $('arr-ex-emp');
  s.innerHTML = '<option value="">Elige la empresa</option>' + L.map(function(l){ return '<option value="' + esc(l.id) + '"' + (X.enlace === l.id ? ' selected' : '') + '>' + esc(l.n) + '</option>'; }).join('');
  $('arr-ex-ver').onclick = function(){
    X.enlace = s.value; X.desde = $('arr-ex-d').value; X.hasta = $('arr-ex-h').value;
    var res = $('arr-ex-res'); if(!X.enlace){ res.innerHTML = '<p class="msg mal">Elige la empresa.</p>'; return; }
    res.innerHTML = '<div class="vacio">Armando el expediente…</div>';
    sbRpc('sst_cad_expediente', { p:{ enlace:X.enlace, desde:X.desde || null, hasta:X.hasta || null } }).then(function(j){
      if(!j || !j.ok){ res.innerHTML = '<p class="msg mal">' + esc(arrMotivo(j)) + '</p>'; return; }
      var n = function(k){ return (j[k] || []).length; }, mal = (j.actas || []).filter(function(a){ return a.coincide === false; }).length +
        (j.observaciones || []).filter(function(o){ return o.sello && o.sello.coincide === false; }).length + (j.inspecciones || []).filter(function(i){ return i.sello && i.sello.coincide === false; }).length;
      res.innerHTML = '<div class="' + (mal ? 'aviso mal' : 'aviso ok') + ' arr-exp-ver">' + (mal ? '⚠ ' + mal + (mal === 1 ? ' registro no coincide con su sello: algo cambió después de sellarse.' : ' registros no coinciden con su sello: algo cambió después de sellarse.')
          : 'Todo coincide con su sello: nada cambió desde que se registró.') + '</div>' +
        '<div class="rej">' + cifra('Actas', String(n('actas')), '', '') + cifra('Observaciones', String(n('observaciones')), '', '') + cifra('Inspecciones', String(n('inspecciones')), '', '') +
        cifra('Medidas', String(n('medidas')), '', '') + cifra('Órdenes', String(n('ordenes')), '', '') + cifra('Recorridos', String(n('recorridos')), '', '') + cifra('Accesos', String(n('accesos')), 'quién miró qué', '') + '</div>' +
        '<button type="button" class="bt" id="arr-ex-pdf">Descargar el expediente en PDF</button>';
      $('arr-ex-pdf').onclick = function(){ arrExpedientePdf(j); };
    }, function(e){ res.innerHTML = '<p class="msg mal">' + esc(arrMotivo(null, e)) + '</p>'; });
  };
}
function arrExpedientePdf(j){
  var b = $('arr-ex-pdf'); if(b){ b.disabled = true; b.textContent = 'Armando el PDF…'; }
  arrPdf().then(function(J){
    var D = arrPdfDoc(J), si = function(v){ return v === false ? 'NO COINCIDE' : (v === true ? 'coincide' : '—'); };
    D.linea('OBRASST', 9, true, '#8A5700');
    D.linea('EXPEDIENTE PROBATORIO', 15, true, '#0B2A3A');
    D.linea('Entidad: ' + (j.entidad || '') + '   ·   Empresa: ' + (j.empresa || '') + (j.ruc ? '   ·   ' + cadDocN() + ' ' + j.ruc : ''), 9.5);
    D.linea('Periodo: ' + (j.desde ? arrFecha(j.desde) : 'desde el inicio') + ' al ' + (j.hasta ? arrFecha(j.hasta) : 'hoy') + '   ·   Generado: ' + arrHora(j.generado) + '   ·   Enlace: ' + (j.estado || ''), 9.5);
    if(j.cadena && j.cadena.ultimo) D.linea('Último sello de la cadena de la entidad: n.º ' + j.cadena.ultimo.n + ' · ' + arrHora(j.cadena.ultimo.cuando) + ' · ' + String(j.cadena.ultimo.sello || '').slice(0, 24) + '…', 8.5, false, '#5E6E79');
    D.tit('ACTAS');
    if((j.actas || []).length) D.tabla(['Acta', 'Fecha', 'Tipo', 'Estado', 'Firmas', 'Huella (inicio)', 'Hoy'], j.actas.map(function(a){
      return [a.n, arrFecha(a.fecha) + ' ' + (a.hora || ''), a.tipo === 'fiscalizacion' ? 'Fiscalización' : 'Supervisión', a.estado, (a.firmas || []).map(function(f){ return f.rol + (f.negada ? ' (se negó)' : '') + ': ' + (f.n || ''); }).join('; '),
              String(a.huella || '').slice(0, 16), si(a.coincide)]; }), [14, 18, 16, 13, 50, 22, 14]);
    else D.linea('Ninguna en el periodo.', 9);
    (j.actas || []).forEach(function(a){
      var k = a.contenido || {};
      D.linea(a.n + ' · hechos constatados:', 9, true);
      (k.hechos || []).forEach(function(x, i){ D.linea((i + 1) + '. ' + x.t + (x.med ? ' [Medición: ' + x.med + ']' : '') + (x.foto ? ' [foto: ' + x.foto + ']' : ''), 8.5); });
      if(k.conclusiones) D.linea('Conclusiones: ' + k.conclusiones, 8.5);
    });
    D.tit('OBSERVACIONES');
    if((j.observaciones || []).length) D.tabla(['N.º', 'Riesgo', 'Qué', 'Vence', 'Estado', 'Sello', 'Hoy'], j.observaciones.map(function(o){
      return [o.n || '', o.riesgo || '', o.titulo || '', arrHora(o.vence), o.estado || '', o.sello ? 'n.º ' + o.sello.n + ' · ' + arrHora(o.sello.cuando) : '—', si(o.sello ? o.sello.coincide : null)]; }), [12, 10, 50, 22, 14, 26, 14]);
    else D.linea('Ninguna en el periodo.', 9);
    D.tit('INSPECCIONES');
    if((j.inspecciones || []).length) D.tabla(['N.º', 'Fecha', 'Formato', 'Cumple', 'No cumple', '%', 'Sello', 'Hoy'], j.inspecciones.map(function(i){
      return [i.n || '', arrFecha(i.fecha), i.formato || '', i.cumple || 0, i.nocumple || 0, i.puntaje != null ? Math.round(i.puntaje) : '—', i.sello ? 'n.º ' + i.sello.n : '—', si(i.sello ? i.sello.coincide : null)]; }), [12, 16, 44, 12, 14, 9, 16, 14]);
    else D.linea('Ninguna en el periodo.', 9);
    D.tit('LO PEDIDO EN DOCUMENTOS');
    if((j.pedidos || []).length) D.tabla(['Qué', 'Cada', 'Estado', 'Entregado', 'Revisado'], j.pedidos.map(function(r){
      return [r.item, r.cada === 'mes' ? 'mes' : 'una vez', r.hoy || r.estado, r.entregado ? arrHora(r.entregado) + ' · ' + (r.entregado_nombre || '') : '—', r.revisado ? arrHora(r.revisado) + ' · ' + (r.revisado_nombre || '') : '—']; }), [44, 12, 16, 34, 34]);
    else D.linea('Nada pedido.', 9);
    D.tit('MEDIDAS');
    if((j.medidas || []).length) D.tabla(['Tipo', 'Detalle', 'Acta', 'Estado', 'Levantada'], j.medidas.map(function(m){
      return [m.tipo === 'paralizacion' ? 'Paralización' : 'Prohibición', m.detalle || '', m.acta ? m.acta.n : '', m.estado, m.levantada ? arrHora(m.levantada) + ' · ' + (m.levantada_nombre || '') : '—']; }), [18, 60, 14, 16, 32]);
    else D.linea('Ninguna.', 9);
    D.tit('ÓRDENES DE INSPECCIÓN');
    if((j.ordenes || []).length) D.tabla(['N.º', 'Inspector', 'Motivo', 'Plazo', 'Estado', 'Acta'], j.ordenes.map(function(o){
      return [o.n, o.inspector_nombre || '', ARR_MOT[o.motivo] || o.motivo || '', arrFecha(o.plazo), o.estado, o.acta ? o.acta.n : '—']; }), [14, 34, 30, 16, 16, 14]);
    else D.linea('Ninguna.', 9);
    D.tit('RECORRIDOS');
    if((j.recorridos || []).length) D.tabla(['Empezó', 'Quién', 'Minutos', 'Dónde', 'Metros al punto'], j.recorridos.map(function(r){
      return [arrHora(r.inicio), (r.por || {}).n || '', r.min != null ? r.min : '—', (ARR_VER[r.veredicto] || [r.veredicto || '—'])[0], r.dist_ini != null ? r.dist_ini : '—']; }), [26, 40, 14, 30, 20]);
    else D.linea('Ninguno.', 9);
    D.tit('QUIÉN MIRÓ QUÉ');
    if((j.accesos || []).length) D.tabla(['Cuándo', 'Quién', 'Qué', 'Lado'], j.accesos.map(function(a){ return [arrHora(a.t), a.n || '', a.que || '', a.lado === 'abajo' ? 'la empresa' : 'la entidad']; }), [28, 50, 24, 20]);
    else D.linea('Nadie en el periodo.', 9);
    D.linea('Cada registro queda sellado con la hora del servidor y la huella del sello anterior de la misma empresa: si alguien lo cambiara, aquí diría «NO COINCIDE». Esto ayuda a probar los hechos; no impide que la empresa presente sus pruebas.', 8, false, '#5E6E79');
    D.pie('OBRASST · Expediente probatorio · ' + (j.empresa || ''));
    arrBajarPdf(D, 'OBRASST-expediente-' + String(j.empresa || 'empresa').replace(/[^\wÁÉÍÓÚÑáéíóúñ.-]+/g, '-').slice(0, 40) + '-' + arrHoy() + '.pdf');
    if(b){ b.disabled = false; b.textContent = 'Descargar el expediente en PDF'; }
  }).catch(function(e){ if(b){ b.disabled = false; b.textContent = 'Descargar el expediente en PDF'; } toast('No se pudo armar el PDF: ' + ((e && e.message) || e)); });
}

/* ══ el estilo ═══════════════════════════════════════════════════════════════════════════════ */
function _arrCss(){
  if($('arr-css')) return;
  var s = document.createElement('style'); s.id = 'arr-css';
  s.textContent = '.arr-seg{flex-wrap:wrap;max-width:100%}.arr-sub{display:block;color:var(--gris);font-size:12px;font-weight:400;margin-top:2px}' +
    '.arr-mal{color:var(--mal)}.arr-ojo{color:#9A6700}.arr-gris{color:var(--gris)}.arr-acc{white-space:nowrap;text-align:right}.arr-acc .bt{margin-left:4px}' +
    '.arr-t td{vertical-align:top}.arr-anulada td{opacity:.55}.arr-bloque td{background:var(--fondo);font-weight:600;font-size:12.5px;letter-spacing:.02em}' +
    '.arr-total td{font-weight:700;border-top:2px solid var(--raya)}' +
    '.arr-mes{display:flex;align-items:center;gap:8px;margin:0 0 12px;flex-wrap:wrap}.arr-mes b{min-width:150px;text-align:center;font-size:15px}' +
    '.arr-barra{display:inline-block;vertical-align:middle;width:90px;height:8px;border-radius:99px;background:var(--fondo);overflow:hidden;margin-right:8px}' +
    '.arr-barra i{display:block;height:100%;background:var(--ok);border-radius:99px}.arr-barra.mal i{background:var(--mal)}.arr-nota{font-variant-numeric:tabular-nums}.arr-nota-c{white-space:nowrap}' +
    '.arr-alertas{list-style:none;margin:0;padding:0}.arr-alertas li{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--raya);line-height:1.4}.arr-alertas li:first-child{border-top:0}' +
    '.arr-alertas .arr-g{flex:none;width:16px;text-align:center}.arr-alertas .g1 .arr-g{color:var(--mal)}.arr-alertas .g2 .arr-g{color:#C98A00}.arr-alertas .g3 .arr-g{color:var(--gris)}' +
    '.arr-fila{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:8px 0}.arr-fila label{display:flex;gap:6px;align-items:center;font-size:14px}.arr-fila-c{align-items:flex-end}.arr-fila-c .campo{margin:0;min-width:160px}' +
    '.arr-reglas{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:4px 16px}.arr-num{display:flex;gap:6px;align-items:center}.arr-num input{max-width:140px}.arr-num span{color:var(--gris);font-size:13px}' +
    '.arr-form{margin-top:16px;padding-top:12px;border-top:1px solid var(--raya)}.arr-form textarea{width:100%}' +
    '.arr-h3{font-size:14px;margin:16px 0 6px}.arr-hechos{margin:0;padding-left:20px}.arr-hechos li{margin:6px 0}.arr-hechos img{display:block;max-width:240px;max-height:160px;border-radius:8px;margin-top:6px}' +
    '.arr-lista{margin:0;padding-left:18px}.arr-lista li{margin:4px 0}' +
    '.arr-cod{margin-top:16px;padding:12px;border:1px solid var(--raya);border-radius:12px;display:flex;flex-direction:column;gap:4px;align-items:flex-start}.arr-cod b{font:800 20px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em}' +
    '.arr-cod small{color:var(--gris)}.arr-auds{display:grid;gap:14px}.arr-falta p{color:var(--gris)}.arr-exp-ver{margin:12px 0}' +
    '@media print{.arr-seg,.acciones{display:none!important}}';
  document.head.appendChild(s);
}
