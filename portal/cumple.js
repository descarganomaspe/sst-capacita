/* OBRASST · el portal · EL CUMPLIMIENTO DE CADA EMPRESA (28/10/2026)
   Marcelo: «construye funciones» (lo que promete central.html: la matriz de capacitación, el informe consolidado con su
   tendencia y el comparativo entre contratistas) y, para Fiscalización y Mandante, «véndele toda la app»: si la contratista
   cumplió con tener a su gente capacitada, con su EMO, con su ATS, con el PETAR, en la charla de hoy; y el QR del casco
   para ver si el trabajador tiene papeletas, si cumple para trabajo en altura o si su EMO venció.
   Las secciones (las mismas en la cuenta de verdad y en las obras de ejemplo):
     · cum-emp    el cumplimiento de cada empresa, hoy (en la Central: «Comparativo de contratistas»). Al tocar una, sus
                  trabajadores (cum-trab, dentro de la misma sección): el semáforo de cada uno y lo que le falta;
     · cum-qr     verificar a un trabajador por su documento o por el QR de su casco o de su carné, y las verificaciones de hoy;
     · cum-matriz la matriz de capacitación: trabajadores × temas, con el estándar por puesto (lo pone el jefe o el gerente) y Excel;
     · cum-consol el informe consolidado: el mes y los anteriores, la tendencia, cada empresa, el IF y el IG, y su PDF;
     · cum-comp   (Corporativo) cada contratista en todas tus obras, lado a lado.
   Todo sale de las funciones del servidor (sql/2026-10-28-cumplimiento.sql: sst_cad_cumple, sst_cad_cumple_trabs,
   sst_cad_trab_qr, sst_cad_verifs, sst_cad_matriz, sst_cad_matriz_poner, sst_cad_consolidado): las tablas no se leen
   directo y lo que cada uno ve lo decide el servidor. Lo que el servidor no puede calcular llega vacío y aquí dice
   «sin dato»: nada se inventa. El documento del trabajador llega tapado (••••1234) y del examen médico, solo su vigencia.
   En la obra de ejemplo de Central contesta cenCumRpc (central.js); en las de Fiscalización y Mandante, demo-arriba.js.
   No editar la versión: la pone herr/huellas.py (CUMPLE_VER). */
var CUM = { caja:null, cual:'', n:{}, ult:{}, emp:{ via:'', proy:'', q:'', ord:'', asc:true, trab:null, tf:'', tq:'' },
            mat:{ enl:'', pue:'', q:'', solo:false }, consol:{ hasta:'', meses:6 }, comp:null, cam:null };
var CUM_VIA = { propia:'Tu empresa', directa:'Contratista', subcontrata:'Subcontrata', supervisora:'De su supervisora' };
var CUM_VIA_CHIP = { propia:'Tu empresa', directa:'Contratistas', subcontrata:'Subcontratas', supervisora:'De sus supervisoras' };
var CUM_MOTIVO = {
  sin_sesion:'Tu sesión venció: vuelve a entrar.', no_eres_de_la_obra:'Esta cuenta no es de esta obra.',
  sin_plan_cumple:'El cumplimiento por empresa lo traen Central, Corporativo, la supervisora incluida, Mandante y Estado.',
  no_existe:'Eso ya no existe.', enlace:'Esa empresa ya no está entre las que ves.', datos:'Revisa lo escrito.',
  rango:'Eso lo pone el jefe o el gerente de tu equipo.',
  solo_cifras:'Esta empresa comparte contigo solo sus cifras: su gente no se abre. Sus números sí cuentan en el cumplimiento por empresa y en el informe consolidado.',
  muy_seguido:'Demasiadas consultas seguidas; espera unos minutos.'
};
var CUM_MOTIVO_TIT = { solo_cifras:'Comparte solo sus cifras', muy_seguido:'Espera unos minutos' };
var CUM_EST = { ok:['Al día', 'ok'], ojo:['Con pendientes', 'ojo'], mal:['No cumple', 'mal'] };
var CUM_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

/* ── lo de siempre ── */
function cumRpc(fn, p){
  /* la obra de ejemplo de Central contesta aquí mismo (central.js); las de arriba, en sbFetch (demo-arriba.js) */
  if(YO && YO.central && typeof cenCumRpc === 'function') return new Promise(function(res){ setTimeout(function(){ try{ res(cenCumRpc(fn, p || {})); }catch(e){ res({ ok:false, motivo:'demo' }); } }, 40); });
  return sbRpc(fn, { p:p || {} });
}
function cumTipo(){
  if(YO && YO.central) return (typeof CEN !== 'undefined' && CEN.rol === 'corp') ? 'corp' : 'cen';
  try{ return (typeof cuentaTipo === 'function') ? cuentaTipo() : ''; }catch(e){ return ''; }
}
function cumEsCentral(){ var t = cumTipo(); return t === 'cen' || t === 'corp'; }
/* ¿manda? (jefe o gerente): el servidor lo vuelve a mirar */
function cumManda(){
  if(YO && YO.central) return typeof CEN !== 'undefined' && /^(jefe|gerente|corp)$/.test(CEN.rol);
  var i = (typeof CADP !== 'undefined' && CADP.ini && CADP.ini.ok) ? CADP.ini : null;
  return !!i && !!i.rango && i.rango !== 'supervisor';
}
function cumMotivo(j, e){
  if(j && j.motivo && CUM_MOTIVO[j.motivo]) return CUM_MOTIVO[j.motivo];
  if(e === 404) return 'El servidor todavía no tiene esta parte. Avísanos.';
  return (typeof porQueFallo === 'function' && e !== undefined && e !== null) ? porQueFallo(e) : 'No se pudo. Revisa tu conexión e inténtalo otra vez.';
}
function cumVacio(t, s){ return '<div class="tarj"><div class="vacio"><b>' + esc(t) + '</b>' + (s ? esc(s) : '') + '</div></div>'; }
function _cumAcc(h){ var a = $('acciones'); if(a) a.innerHTML = h || ''; }
function _cumTitulo(n, s){
  var m = $('main'); if(!m) return;
  var h = m.querySelector('.cab h1'), p = m.querySelector('.cab .sub');
  var v = (typeof vistasDe === 'function' ? vistasDe() : []).filter(function(x){ return x.id === VISTA.actual; })[0] || {};
  if(h) h.textContent = n || v.n || '';
  if(p) p.textContent = (s != null) ? s : (v.s || '');
}
/* pedir y pintar sin pisar: si mientras tanto se fue a otra sección (o pidió otra cosa), no se pinta */
function cumPedir(k, c, fn, p, pinta){
  var n = CUM.n[k] = (CUM.n[k] || 0) + 1, v = VISTA.actual;
  if(c) c.innerHTML = '<div class="vacio">Cargando…</div>';
  return cumRpc(fn, p).then(function(j){
    if(CUM.n[k] !== n || VISTA.actual !== v || (c && !c.isConnected)) return;
    if(!j || !j.ok){ if(c) c.innerHTML = cumVacio((j && CUM_MOTIVO_TIT[j.motivo]) || 'No se pudo cargar', cumMotivo(j)); return; }
    pinta(j);
  }, function(e){ if(CUM.n[k] === n && c && c.isConnected) c.innerHTML = cumVacio('No se pudo cargar', cumMotivo(null, e)); });
}
function _cumN(n){ return String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
/* «1 abierta», «3 abiertas» */
function _cumPl(n, uno, varios){ return _cumN(n) + ' ' + (Math.round(+n || 0) === 1 ? uno : varios); }
function _cumDos(n){ return (n < 10 ? '0' : '') + n; }
function _cumF(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 && p[0] ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
function _cumHora(t){ var d = new Date(t); return isNaN(d) ? '' : _cumDos(d.getHours()) + ':' + _cumDos(d.getMinutes()); }
function _cumMesTx(m, corto){ var p = String(m || '').split('-'); if(p.length !== 2) return ''; var t = CUM_MESES[+p[1] - 1] || ''; return corto ? t.slice(0, 3) + ' ' + p[0].slice(2) : t + ' ' + p[0]; }
function _cumMesHoy(){ var d = new Date(); return d.getFullYear() + '-' + _cumDos(d.getMonth() + 1); }
function _cumMesMas(m, n){ var p = String(m).split('-'), d = new Date(+p[0], +p[1] - 1 + n, 1); return d.getFullYear() + '-' + _cumDos(d.getMonth() + 1); }
function _cumNom(n){ n = String(n == null ? '' : n); return (typeof cadCorto === 'function') ? cadCorto(n) : n; }
function _cumNorm(s){ return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
/* el porcentaje de {ok, tot}; null si no hay de dónde */
function _cumP(o){ return (o && +o.tot > 0) ? Math.round(100 * (+o.ok || 0) / (+o.tot)) : null; }
function _cumCl(v, bien, regular){ if(v == null) return 'gris'; return v >= (bien || 90) ? 'ok' : (v >= (regular || 75) ? 'ojo' : 'mal'); }
function _cumPill(t, cl){ return '<span class="pill ' + (cl || 'gris') + '">' + esc(t) + '</span>'; }
function _cumSin(){ return '<span class="cum-gris">sin dato</span>'; }
/* el documento del trabajador, siempre tapado (••••1234): el servidor ya lo manda así; si alguna vez llegara entero, aquí se tapa */
function _cumDoc(d){
  var s = String(d == null ? '' : d).trim(); if(!s) return '';
  if(/^[•*]{2,}/.test(s)) return s;
  var a = s.replace(/[^0-9A-Za-z]/g, '');
  return '••••' + (a.length > 4 ? a.slice(-4) : '');
}
/* una celda con su porcentaje y, debajo, de dónde sale */
function _cumCelda(v, sub, cl){
  if(v == null) return _cumSin();
  return '<span class="cum-pc ' + (cl || _cumCl(v)) + '"><b>' + v + ' %</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>';
}
function _cumBarra(v){
  if(v == null) return '<span class="cum-gris">sin datos</span>';
  v = Math.max(0, Math.min(100, Math.round(+v)));
  return '<span class="cum-nw"><span class="cum-barra ' + _cumCl(v, 80, 60) + '" title="' + v + ' de 100"><i style="width:' + v + '%"></i></span><b class="cum-nota">' + v + '</b></span>';
}
function _cumEnlKey(x){ return x.enlace ? String(x.enlace) : 'propia'; }
function _cumViaTx(x){
  /* en la Central, la principal es quien mira: «Subcontrata», sin «de …» */
  if(x.via === 'subcontrata') return 'Subcontrata' + (x.padre && !cumEsCentral() ? ' de ' + _cumNom(x.padre) : '');
  if(x.via === 'supervisora') return 'Contratista' + (x.padre ? ' · la supervisa ' + _cumNom(x.padre) : '');
  return CUM_VIA[x.via] || '';
}
/* lo que se cuenta de un grupo de empresas (para las cifras de arriba) */
function _cumSuma(L){
  var s = { n:L.length, gente:0, cap:{ ok:0, tot:0 }, emo:{ ok:0, tot:0, ven:0, sin:0 }, ind:{ ok:0, tot:0 }, ats:{ hoy:0, ok:0, firmaron:0 }, charla:{ hoy:0, asist:0 },
            petar:{ hoy:0 }, amon:0, ab:0, ven:0, lev:0, a_tiempo:0, bajas:0, hayEmo:false, hayInd:false, hayPetar:false };
  L.forEach(function(x){
    s.gente += +x.gente || 0;
    if(x.cap){ s.cap.ok += +x.cap.ok || 0; s.cap.tot += +x.cap.tot || 0; }
    if(x.emo){ s.hayEmo = true; s.emo.ok += +x.emo.ok || 0; s.emo.tot += +x.emo.tot || 0; s.emo.ven += +x.emo.ven || 0; s.emo.sin += +x.emo.sin || 0; }
    if(x.ind){ s.hayInd = true; s.ind.ok += +x.ind.ok || 0; s.ind.tot += +x.ind.tot || 0; }
    if(x.ats){ s.ats.hoy += +x.ats.hoy || 0; s.ats.ok += +x.ats.ok || 0; s.ats.firmaron += +x.ats.firmaron || 0; }
    if(x.charla){ s.charla.hoy += +x.charla.hoy || 0; s.charla.asist += +x.charla.asist || 0; }
    if(x.petar){ s.hayPetar = true; s.petar.hoy += +x.petar.hoy || 0; }
    if(x.amon) s.amon += +x.amon.d30 || 0;
    if(x.obs){ s.ab += +x.obs.ab || 0; s.ven += +x.obs.ven || 0; s.lev += +x.obs.lev || 0; s.a_tiempo += +x.obs.a_tiempo || 0; }
    if(x.nota != null && x.nota < 60) s.bajas++;
  });
  return s;
}

/* ══ LA PUERTA ════════════════════════════════════════════════════════════════════════════════════════════════════ */
function cumPintar(cual, caja){
  _cumCss();
  CUM.caja = caja; CUM.cual = cual;
  if(cual !== 'emp') CUM.emp.trab = null;
  var F = { emp:cumEmp, qr:cumQr, matriz:cumMatriz, consol:cumConsol, comp:cumComp }[cual];
  if(!F){ caja.innerHTML = cumVacio('No se encontró esta sección', ''); return; }
  F(caja);
}
/* el «atrás» del navegador, desde los trabajadores de una empresa, vuelve a la lista de empresas */
window.addEventListener('popstate', function(ev){
  if(VISTA.actual === 'cum-emp' && CUM.emp.trab && !(ev.state && ev.state.cumTrab) && CUM.caja && CUM.caja.isConnected){ CUM.emp.trab = null; cumEmp(CUM.caja); }
});

/* ══ CUMPLIMIENTO POR EMPRESA (en la Central: el comparativo de contratistas) ══════════════════════════════════════ */
function cumEmp(caja){
  if(CUM.emp.trab){ cumTrab(caja, CUM.emp.trab); return; }
  _cumTitulo();
  _cumAcc('<button type="button" class="bt sec" id="cum-e-qr">Verificar a un trabajador</button><button type="button" class="bt sec" id="cum-e-xls" disabled>Excel</button>');
  $('cum-e-qr').onclick = function(){ navegar('cum-qr'); };
  cumPedir('emp', caja, 'sst_cad_cumple', { emp:YO.obra.id }, function(j){ CUM.ult.emp = j; cumEmpPintar(caja, j); });
}
var CUM_EMP_COLS = [
  ['nombre', 'Empresa'], ['nota', 'Nota'], ['gente', 'Gente'], ['cap', 'Capacitación vigente'], ['emo', 'EMO vigente'], ['ind', 'Inducción'],
  ['ats', 'ATS de hoy'], ['charla', 'Charla de hoy'], ['petar', 'PETAR de hoy'], ['amon', 'Papeletas 30 días'], ['obs', 'Observa\u00ADciones'], ['a_tiempo', 'A tiempo']
];
function _cumEmpVal(x, k){
  switch(k){
    case 'nombre': return _cumNom(x.nombre).toLowerCase();
    case 'nota': return x.nota == null ? -1 : x.nota;
    case 'gente': return +x.gente || 0;
    case 'cap': return _cumP(x.cap); case 'emo': return _cumP(x.emo); case 'ind': return _cumP(x.ind);
    case 'ats': return x.ats && x.gente ? Math.round(100 * (x.ats.firmaron || 0) / x.gente) : null;
    case 'charla': return x.charla && x.gente ? Math.round(100 * (x.charla.asist || 0) / x.gente) : null;
    case 'petar': return x.petar ? +x.petar.hoy || 0 : null;
    case 'amon': return x.amon ? +x.amon.d30 || 0 : null;
    case 'obs': return x.obs ? (+x.obs.ven || 0) * 1000 + (+x.obs.ab || 0) : null;
    case 'a_tiempo': return x.obs && x.obs.lev ? Math.round(100 * (x.obs.a_tiempo || 0) / x.obs.lev) : null;
  }
  return null;
}
function _cumEmpFiltradas(j){
  var f = CUM.emp, q = _cumNorm(f.q);
  var L = (j.empresas || []).filter(function(x){
    if(f.via && x.via !== f.via) return false;
    if(f.proy && String(x.proyecto || '') !== f.proy) return false;
    if(q && _cumNorm(x.nombre + ' ' + (x.ruc || '') + ' ' + (x.padre || '') + ' ' + (x.proyecto || '')).indexOf(q) < 0) return false;
    return true;
  });
  if(f.ord){
    var k = f.ord, as = f.asc ? 1 : -1;
    L = L.slice().sort(function(a, b){
      var x = _cumEmpVal(a, k), y = _cumEmpVal(b, k);
      if(x == null && y == null) return 0; if(x == null) return 1; if(y == null) return -1;
      if(typeof x === 'string') return as * x.localeCompare(y);
      return as * (x - y);
    });
  }
  return L;
}
function cumEmpPintar(caja, j){
  var E = j.empresas || [], cen = cumEsCentral(), f = CUM.emp;
  var bt = $('cum-e-xls'); if(bt){ bt.disabled = !E.length; bt.onclick = function(){ cumEmpXls(j); }; }
  if(!E.length){
    caja.innerHTML = cumVacio(cen ? 'Todavía no hay subcontratas en tu obra' : 'Todavía no hay empresas que mirar',
      cen ? 'Cuando invites a tus subcontratas y acepten, aquí sale lo que cumple cada una, de sus propios registros.'
          : 'Cuando una contratista acepte tu requerimiento, aquí sale lo que cumple hoy (y lo de sus subcontratas), de sus propios registros.');
    return;
  }
  /* los filtros: el proyecto, por dónde llega y el buscador */
  var proys = E.map(function(x){ return String(x.proyecto || ''); }).filter(function(p, i, l){ return p && l.indexOf(p) === i; }).sort();
  var vias = ['directa', 'subcontrata', 'supervisora', 'propia'].filter(function(v){ return E.some(function(x){ return x.via === v; }); });
  if(f.proy && proys.indexOf(f.proy) < 0) f.proy = '';
  if(f.via && vias.indexOf(f.via) < 0) f.via = '';
  var L = _cumEmpFiltradas(j), S = _cumSuma(L), habil = j.dia_habil !== false;
  var pAts = S.gente ? Math.round(100 * S.ats.firmaron / S.gente) : null, pCh = S.gente ? Math.round(100 * S.charla.asist / S.gente) : null;
  var pCap = _cumP(S.cap), pEmo = S.hayEmo ? _cumP(S.emo) : null;
  var h = '<div class="rej cum-cifras">' +
    cifra(cen ? 'Empresas de la obra' : 'Empresas', String(S.n), S.bajas ? S.bajas + (S.bajas === 1 ? ' con nota baja' : ' con nota baja') : 'ninguna con nota baja', S.bajas ? 'ojo' : '') +
    cifra('Gente hoy', _cumN(S.gente), 'activos en sus registros', '') +
    cifra('Capacitación vigente', pCap == null ? '—' : pCap + ' %', S.cap.tot ? _cumN(S.cap.tot - S.cap.ok) + ' sin capacitación vigente' : 'sin dato', pCap == null ? '' : _cumCl(pCap)) +
    cifra('EMO vigente', pEmo == null ? '—' : pEmo + ' %', S.hayEmo ? _cumPl(S.emo.ven, 'vencido', 'vencidos') + ' · ' + _cumN(S.emo.sin) + ' sin EMO' : 'sin dato', pEmo == null ? '' : _cumCl(pEmo)) +
    cifra('ATS de hoy', pAts == null ? '—' : pAts + ' %', habil ? _cumN(S.ats.firmaron) + ' firmaron · ' + _cumN(S.ats.hoy) + ' ATS' : 'hoy es domingo: no cuenta', habil && pAts != null ? _cumCl(pAts) : '') +
    cifra('Charla de hoy', pCh == null ? '—' : pCh + ' %', habil ? _cumN(S.charla.asist) + ' asistieron' : 'hoy es domingo: no cuenta', habil && pCh != null ? _cumCl(pCh) : '') +
    cifra('Papeletas', String(S.amon), 'en los últimos 30 días', S.amon ? 'ojo' : '') +
    cifra('Observaciones vencidas', String(S.ven), _cumPl(S.ab, 'abierta', 'abiertas'), S.ven ? 'mal' : '') + '</div>';
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>' + esc(cen ? 'Cada empresa de tu obra, hoy' : 'Cada empresa, hoy') + '</h2><p class="sub">' +
    esc('Lo que más preocupa, primero · sale de los registros de cada empresa en OBRASST · toca una para ver a su gente') + '</p></div></div>' +
    '<div class="cum-filtros"><input type="search" id="cum-e-q" placeholder="Buscar empresa o RUC…" aria-label="Buscar empresa" value="' + esc(f.q) + '">' +
    (proys.length > 1 ? '<select id="cum-e-proy" aria-label="Proyecto"><option value="">Todos los proyectos</option>' + proys.map(function(p){ return '<option' + (p === f.proy ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('') + '</select>' : '') +
    (vias.length > 1 ? '<span class="cum-chips" role="group" aria-label="Qué empresas">' + [['', 'Todas']].concat(vias.map(function(v){ return [v, CUM_VIA_CHIP[v]]; })).map(function(c){
      return '<button type="button" class="cum-chip' + (c[0] === f.via ? ' on' : '') + '" data-cum-via="' + c[0] + '">' + esc(c[1]) + '</button>'; }).join('') + '</span>' : '') +
    '<span class="cum-cuenta">' + (L.length !== E.length ? L.length + ' de ' + E.length + ' empresas' : _cumPl(E.length, 'empresa', 'empresas')) + '</span></div>';
  if(!L.length) h += '<div class="vacio"><b>Ninguna empresa con ese filtro</b>Cambia el filtro o borra lo que buscas.</div>';
  else {
    h += '<div class="tabla-caja"><table class="cum-t cum-emps cum-fija"><thead><tr>' + CUM_EMP_COLS.map(function(c){
      var on = f.ord === c[0];
      return '<th' + (c[0] === 'nombre' ? '' : ' class="num"') + ' data-cum-ord="' + c[0] + '" aria-sort="' + (on ? (f.asc ? 'ascending' : 'descending') : 'none') + '"><button type="button" class="cum-th">' + esc(c[1]) + (on ? (f.asc ? ' ↑' : ' ↓') : '') + '</button></th>';
    }).join('') + '<th aria-label="Ver su gente"></th></tr></thead><tbody>' + L.map(function(x){
      var pa = _cumEmpVal(x, 'ats'), pc = _cumEmpVal(x, 'charla'), at = _cumEmpVal(x, 'a_tiempo'), o = x.obs, abreF = x.detalle !== false;
      /* la que comparte solo cifras (sst_enlace.ve): su fila cuenta, pero su gente no se abre */
      return '<tr' + (abreF ? ' class="clic" tabindex="0" data-cum-abre="1"' : ' class="cum-e-solo"') + ' data-cum-enl="' + esc(_cumEnlKey(x)) + '"><td><b class="cum-en">' + esc(_cumNom(x.nombre)) + '</b><small class="cum-sub">' + esc([proys.length > 1 ? x.proyecto : '', _cumViaTx(x), x.ruc ? 'RUC ' + x.ruc : ''].filter(Boolean).join(' · ')) + '</small>' +
        (abreF ? '' : '<span class="cum-solo">Comparte solo cifras</span>') + '</td>' +
        '<td class="num">' + _cumBarra(x.nota) + '</td><td class="num">' + _cumN(x.gente) + '</td>' +
        '<td class="num">' + _cumCelda(_cumP(x.cap), x.cap ? x.cap.ok + '/' + x.cap.tot : '') + '</td>' +
        '<td class="num">' + (x.emo ? _cumCelda(_cumP(x.emo), (x.emo.ven ? x.emo.ven + ' venc.' : '') + (x.emo.sin ? (x.emo.ven ? ' · ' : '') + x.emo.sin + ' sin EMO' : '') || (x.emo.ok + '/' + x.emo.tot)) : _cumSin()) + '</td>' +
        '<td class="num">' + (x.ind ? _cumCelda(_cumP(x.ind), x.ind.ok + '/' + x.ind.tot) : _cumSin()) + '</td>' +
        '<td class="num">' + (x.ats ? _cumCelda(pa, x.ats.hoy + ' ATS', habil ? _cumCl(pa) : 'gris') : _cumSin()) + '</td>' +
        '<td class="num">' + (x.charla ? _cumCelda(pc, x.charla.asist + ' asist.', habil ? _cumCl(pc) : 'gris') : _cumSin()) + '</td>' +
        '<td class="num">' + (x.petar ? '<b>' + (x.petar.hoy || 0) + '</b>' + (x.petar.hoy ? '<small class="cum-sub">' + _cumPl(x.petar.ok, 'autorizado', 'autorizados') + '</small>' : '') : _cumSin()) + '</td>' +
        '<td class="num' + (x.amon && x.amon.d30 ? (x.amon.d30 >= 3 ? ' cum-mal' : ' cum-ojo') : '') + '">' + (x.amon ? '<b>' + (x.amon.d30 || 0) + '</b>' : _cumSin()) + '</td>' +
        '<td class="num">' + (o ? '<b>' + (o.ab || 0) + '</b> ' + ((o.ab || 0) === 1 ? 'abierta' : 'abiertas') + (o.ven ? '<small class="cum-sub cum-mal">' + o.ven + (o.ven === 1 ? ' vencida' : ' vencidas') + '</small>' : '') : '<span class="cum-gris">—</span>') + '</td>' +
        '<td class="num">' + (at == null ? '<span class="cum-gris">—</span>' : _cumCelda(at, (o.a_tiempo || 0) + '/' + o.lev, _cumCl(at, 85, 70))) + '</td>' +
        (abreF ? '<td class="cum-ir" aria-hidden="true">›</td>' : '<td class="cum-ir" title="Comparte contigo solo sus cifras: su gente no se abre"></td>') + '</tr>';
    }).join('') + '</tbody></table></div>';
  }
  h += '</div><p class="cum-pie">' + esc(j.como || 'La nota de 0 a 100 sale de lo que cada empresa registra en OBRASST; lo que no tiene datos no cuenta.') + (habil ? '' : ' Hoy es domingo: el ATS y la charla no cuentan en la nota.') + '</p>';
  caja.innerHTML = h;
  var q = $('cum-e-q');
  if(q) q.oninput = function(){ var pos = q.selectionStart; f.q = q.value; cumEmpPintar(caja, j); var q2 = $('cum-e-q'); if(q2){ q2.focus(); try{ q2.setSelectionRange(pos, pos); }catch(e){} } };
  if($('cum-e-proy')) $('cum-e-proy').onchange = function(){ f.proy = this.value; cumEmpPintar(caja, j); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-cum-via]'), function(b){ b.onclick = function(){ f.via = b.getAttribute('data-cum-via'); cumEmpPintar(caja, j); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-cum-ord]'), function(th){ th.onclick = function(){ var k = th.getAttribute('data-cum-ord'); if(f.ord === k) f.asc = !f.asc; else { f.ord = k; f.asc = k === 'nombre'; } cumEmpPintar(caja, j); }; });
  var abre = function(tr){ cumAbrirTrab(tr.getAttribute('data-cum-enl')); };
  Array.prototype.forEach.call(caja.querySelectorAll('tr[data-cum-abre]'), function(tr){
    tr.onclick = function(){ abre(tr); };
    tr.onkeydown = function(ev){ if(ev.key === 'Enter' && ev.target === tr) abre(tr); };
  });
}
function cumAbrirTrab(enl){
  CUM.emp.trab = enl; CUM.emp.tf = ''; CUM.emp.tq = '';
  try{ history.pushState({ v:'cum-emp', cumTrab:enl }, '', '#cum-emp'); }catch(e){}
  if(CUM.caja && CUM.caja.isConnected) cumTrab(CUM.caja, enl);
  try{ window.scrollTo({ top:0, left:0, behavior:'instant' }); }catch(_s){ try{ window.scrollTo(0, 0); }catch(_s2){} }
}
function cumCerrarTrab(){
  if(!CUM.emp.trab) return;
  CUM.emp.trab = null;
  try{ if(history.state && history.state.cumTrab) history.back(); }catch(e){}
  if(CUM.caja && CUM.caja.isConnected) cumEmp(CUM.caja);
}

/* ── los trabajadores de una empresa ── */
function cumTrab(caja, enl){
  var e = ((CUM.ult.emp || {}).empresas || []).filter(function(x){ return _cumEnlKey(x) === String(enl); })[0];
  _cumTitulo(e ? _cumNom(e.nombre) : 'Trabajadores de la empresa', 'Cada trabajador con su semáforo: lo que le falta hoy, de los registros de su empresa');
  _cumAcc('<button type="button" class="bt sec" id="cum-t-volver">← Todas las empresas</button><button type="button" class="bt sec" id="cum-t-xls" disabled>Excel</button>');
  $('cum-t-volver').onclick = cumCerrarTrab;
  cumPedir('trab', caja, 'sst_cad_cumple_trabs', { emp:YO.obra.id, enlace:enl }, function(j){ CUM.ult.trab = j; cumTrabPintar(caja, j); });
}
function _cumTrabTx(t){
  return _cumNorm([t.nombre, _cumDoc(t.doc), t.puesto, (t.faltan || []).join(' ')].join(' '));
}
function cumTrabPintar(caja, j){
  var T = j.trabajadores || [], f = CUM.emp, emp = j.empresa || {}, q = _cumNorm(f.tq);
  var bt = $('cum-t-xls'); if(bt){ bt.disabled = !T.length; bt.onclick = function(){ cumTrabXls(j); }; }
  _cumTitulo(_cumNom(emp.nombre || 'La empresa'), [emp.proyecto, emp.via ? _cumViaTx(emp) : '', emp.ruc ? 'RUC ' + emp.ruc : ''].filter(Boolean).join(' · ') || 'Cada trabajador con su semáforo');
  var c = { ok:0, ojo:0, mal:0 }, emoMal = 0, sinAts = 0, pap = 0, hayEmo = false;
  T.forEach(function(t){ c[t.estado] = (c[t.estado] || 0) + 1; if(t.emo){ hayEmo = true; if(t.emo.e === 'ven' || t.emo.e === 'sin') emoMal++; } if(t.ats && t.ats.hoy === false) sinAts++; if(t.amon) pap += +t.amon.d30 || 0; });
  var L = T.filter(function(t){ return (!f.tf || t.estado === f.tf) && (!q || _cumTrabTx(t).indexOf(q) > -1); });
  var h = '<div class="rej cum-cifras">' + cifra('Trabajadores', _cumN(T.length), 'activos', '') +
    cifra('Al día', _cumN(c.ok), T.length ? Math.round(100 * c.ok / T.length) + ' % de su gente' : '', c.ok === T.length && T.length ? 'ok' : '') +
    cifra('Con pendientes', _cumN(c.ojo), 'capacitación, inducción, por vencer o papeletas', c.ojo ? 'ojo' : '') +
    cifra('No cumple', _cumN(c.mal), 'EMO o SCTR vencido, o le falta algo para el alto riesgo de hoy', c.mal ? 'mal' : '') +
    cifra('EMO vencido o sin EMO', hayEmo ? _cumN(emoMal) : '—', hayEmo ? 'no deberían entrar a trabajar' : 'sin dato', emoMal ? 'mal' : '') +
    cifra('Sin ATS hoy', _cumN(sinAts), j.dia_habil === false ? 'hoy es domingo' : 'no firmaron un ATS de hoy', sinAts && j.dia_habil !== false ? 'ojo' : '') +
    cifra('Papeletas', _cumN(pap), 'en los últimos 30 días', pap ? 'ojo' : '') +
    cifra('PETAR de hoy', _cumN(T.filter(function(t){ return t.petar && t.petar.hoy; }).length), 'en un trabajo de alto riesgo', '') + '</div>';
  h += '<div class="tarj"><div class="cum-filtros"><input type="search" id="cum-t-q" placeholder="Buscar por nombre, documento o puesto…" aria-label="Buscar trabajador" value="' + esc(f.tq) + '">' +
    '<span class="cum-chips" role="group" aria-label="Qué trabajadores">' + [['', 'Todos', T.length], ['mal', 'No cumple', c.mal], ['ojo', 'Con pendientes', c.ojo], ['ok', 'Al día', c.ok]].map(function(x){
      return '<button type="button" class="cum-chip' + (x[0] === f.tf ? ' on' : '') + '" data-cum-tf="' + x[0] + '">' + esc(x[1]) + ' <b>' + (x[2] || 0) + '</b></button>'; }).join('') + '</span>' +
    '<span class="cum-cuenta">' + (L.length !== T.length ? L.length + ' de ' + T.length + ' trabajadores' : _cumPl(T.length, 'trabajador', 'trabajadores')) + '</span></div>';
  if(!T.length) h += '<div class="vacio"><b>Esta empresa no tiene trabajadores activos registrados</b>Cuando registre a su gente en OBRASST, aquí sale cada uno con su semáforo.</div>';
  else if(!L.length) h += '<div class="vacio"><b>Nadie con ese filtro</b>Cambia el filtro o borra lo que buscas.</div>';
  else {
    var MAX = 600;
    h += '<div class="tabla-caja"><table class="cum-t cum-trabs cum-fija"><thead><tr><th>Trabajador</th><th>Estado</th><th>Capacitación</th><th>Induc&shy;ción</th><th>EMO</th><th>SCTR</th><th class="num">ATS hoy</th><th class="num">Charla hoy</th><th>PETAR hoy</th><th class="num">Pape&shy;letas</th><th>Alto riesgo</th></tr></thead><tbody>' +
      L.slice(0, MAX).map(cumTrabFila).join('') + '</tbody></table></div>' +
      (L.length > MAX ? '<p class="cum-pie">Se ven los primeros ' + MAX + ' de ' + _cumN(L.length) + ': usa el buscador o los filtros, o baja el Excel con todos.</p>' : '');
  }
  h += '</div><p class="cum-pie">El documento va tapado y del examen médico solo se ve su vigencia: lo demás es de la salud de cada uno. Las papeletas, solo cuántas y cuándo.</p>';
  caja.innerHTML = h;
  var qi = $('cum-t-q');
  if(qi) qi.oninput = function(){ var pos = qi.selectionStart; f.tq = qi.value; cumTrabPintar(caja, j); var q2 = $('cum-t-q'); if(q2){ q2.focus(); try{ q2.setSelectionRange(pos, pos); }catch(e){} } };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-cum-tf]'), function(b){ b.onclick = function(){ f.tf = b.getAttribute('data-cum-tf'); cumTrabPintar(caja, j); }; });
}
var CUM_CAP_E = { ok:['Vigente', 'ok'], vence:['Por vencer', 'ojo'], falta:['Sin vigente', 'mal'] };
var CUM_EMO_E = { ok:['Vigente', 'ok'], vence:['Por vencer', 'ojo'], ven:['Vencido', 'mal'], sin:['Sin EMO', 'mal'] };
var CUM_SCTR_E = { ok:['Vigente', 'ok'], ven:['Vencido', 'mal'], sin:['Sin SCTR', 'mal'] };
function _cumSi(v, sub){ return v ? '<span class="cum-si" title="Sí">✓</span>' + (sub ? '<small class="cum-sub">' + esc(sub) + '</small>' : '') : '<span class="cum-no" title="No">✕</span>'; }
function cumTrabFila(t){
  var E = CUM_EST[t.estado] || ['—', 'gris'], cap = t.cap || null, emo = t.emo, sc = t.sctr;
  var capT = cap ? [cap.n ? _cumPl(cap.n, 'tema vigente', 'temas vigentes') : '', (cap.temas || []).join(', ')].filter(Boolean).join(': ') : '';
  var capH = cap ? '<span title="' + esc(capT) + '">' + _cumPill((CUM_CAP_E[cap.e] || ['—'])[0], (CUM_CAP_E[cap.e] || [0, 'gris'])[1]) + '</span>' + (cap.ult ? '<small class="cum-sub">la última, ' + _cumF(cap.ult) + '</small>' : '') : _cumSin();
  var emoH = emo ? _cumPill((CUM_EMO_E[emo.e] || ['—'])[0], (CUM_EMO_E[emo.e] || [0, 'gris'])[1]) + (emo.hasta ? '<small class="cum-sub">' + (emo.e === 'ven' ? 'venció el ' : 'hasta el ') + _cumF(emo.hasta) + '</small>' : '') : _cumSin();
  var scH = sc ? _cumPill((CUM_SCTR_E[sc.e] || ['—'])[0], (CUM_SCTR_E[sc.e] || [0, 'gris'])[1]) + (sc.hasta ? '<small class="cum-sub">' + (sc.e === 'ven' ? 'venció el ' : 'hasta el ') + _cumF(sc.hasta) + '</small>' : '') : _cumSin();
  var alto = (t.alto || []).map(function(a){ return '<span class="cum-alto ' + (a.e === 'ok' ? 'ok' : 'mal') + (a.hoy ? ' hoy' : '') + '" title="' + esc((a.e === 'ok' ? 'Cumple' : 'Le falta: ' + (a.falta || []).join(', ')) + (a.hoy ? ' · está en un PETAR de hoy' : '')) + '">' + esc(a.n) + (a.e === 'ok' ? ' ✓' : ' ✕') + '</span>' +
    (a.e !== 'ok' && (a.falta || []).length ? '<small class="cum-sub cum-mal">Falta: ' + esc(a.falta.join(', ')) + '</small>' : ''); }).join('');
  return '<tr class="cum-f-' + esc(t.estado || 'ok') + '"><td><b class="cum-en">' + esc(t.nombre || '') + '</b><small class="cum-sub">' + esc([_cumDoc(t.doc), t.puesto].filter(Boolean).join(' · ')) + '</small></td>' +
    '<td>' + _cumPill(E[0], E[1]) + ((t.faltan || []).length ? '<small class="cum-sub">' + esc(t.faltan.join(' · ')) + '</small>' : '') + '</td>' +
    '<td>' + capH + '</td><td>' + (t.ind ? (t.ind.e === 'ok' ? _cumPill('Hecha', 'ok') : _cumPill('Falta', 'ojo')) : _cumSin()) + '</td>' +
    '<td>' + emoH + '</td><td>' + scH + '</td>' +
    '<td class="num">' + (t.ats ? _cumSi(!!t.ats.hoy) : _cumSin()) + '</td>' +
    '<td class="num">' + (t.charla ? _cumSi(!!t.charla.hoy, t.charla.hoy && t.charla.hora ? t.charla.hora : '') : _cumSin()) + '</td>' +
    '<td>' + (t.petar ? (t.petar.hoy ? '<b>' + esc(t.petar.tipo || 'Sí') + '</b>' + (t.petar.aut === false ? '<small class="cum-sub cum-mal">sin autorizar</small>' : '') : '<span class="cum-gris">—</span>') : _cumSin()) + '</td>' +
    '<td class="num' + (t.amon && t.amon.d30 ? ' cum-ojo' : '') + '">' + (t.amon ? '<b>' + (t.amon.d30 || 0) + '</b>' + (t.amon.d30 && t.amon.ult ? '<small class="cum-sub">la última ' + _cumF(t.amon.ult) + '</small>' : '') : _cumSin()) + '</td>' +
    '<td>' + (alto || '<span class="cum-gris">—</span>') + '</td></tr>';
}

/* ══ VERIFICAR A UN TRABAJADOR (el QR del casco o del carné) ══════════════════════════════════════════════════════ */
/* lo que trae el QR de OBRASST: «…#cred=carga.firma» o «…#trab=carga.firma» (la carga es JSON en base64url) */
function _cumCarga(b){
  try{ var s = String(b).replace(/-/g, '+').replace(/_/g, '/'); while(s.length % 4) s += '='; return JSON.parse(decodeURIComponent(escape(atob(s)))); }catch(e){ return null; }
}
function cumDocDe(txt){
  var t = String(txt || '').trim(); if(!t) return null;
  var m = /[#?&](cred|trab)=([A-Za-z0-9_\-]+)\.([A-Za-z0-9_\-]+)/.exec(t) || /^OBRASST-(CRED|TRAB):([A-Za-z0-9_\-]+)\.([A-Za-z0-9_\-]+)/i.exec(t);
  if(m){ var d = _cumCarga(m[2]); if(d && d.d) return { doc:String(d.d).toUpperCase().replace(/[^0-9A-Z]/g, ''), nombre:String(d.n || ''), qr:true }; return { error:'qr' }; }
  if(/^https?:\/\//i.test(t) || t.length > 40) return { error:'qr' };
  var doc = t.toUpperCase().replace(/[^0-9A-Z]/g, '');
  if(doc.length < 6 || doc.length > 15) return { error:'doc' };
  return { doc:doc, nombre:'' };
}
function cumQr(caja){
  _cumTitulo(); _cumAcc('');
  var cam = ('BarcodeDetector' in window) && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
  var ej = (YO && YO.demo) || (YO && YO.central && typeof CEN !== 'undefined' && CEN.demo);
  caja.innerHTML = '<div class="tarj"><div class="tarj-cuerpo cum-qr-f"><div class="campo"><label for="cum-q-in">Documento del trabajador o el enlace de su QR</label>' +
    '<input id="cum-q-in" autocomplete="off" spellcheck="false" placeholder="DNI o carné de extranjería, o pega el enlace del QR del casco"></div>' +
    '<div class="cum-qr-bt"><button type="button" class="bt" id="cum-q-ver">Verificar</button>' + (cam ? '<button type="button" class="bt sec" id="cum-q-cam">Escanear con la cámara</button>' : '') + '</div>' +
    '<p class="ayuda">El QR del casco y el del carné llevan el documento del trabajador: escanéalo con la cámara de tu celular y pega aquí el enlace que abre, o escribe el documento. Sale lo de hoy, de los registros de su empresa, y queda constancia de que lo verificaste.</p>' +
    (ej ? '<p class="cum-ej" id="cum-q-ej"></p>' : '') + '<div id="cum-q-cam-c"></div></div></div>' +
    '<div id="cum-q-res"></div>' +
    '<div class="tarj"><div class="tarj-cab"><div><h2>Las verificaciones de hoy</h2><p class="sub">Las de todo tu equipo: a quién se verificó, a qué hora y cómo estaba</p></div></div><div id="cum-q-hoy"><div class="vacio">Cargando…</div></div></div>';
  var inp = $('cum-q-in');
  var ir = function(){ cumVerificar(inp.value); };
  $('cum-q-ver').onclick = ir;
  inp.onkeydown = function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); ir(); } };
  if($('cum-q-cam')) $('cum-q-cam').onclick = cumCamara;
  if(ej) cumEjemplos();
  cumVerifsPintar();
  setTimeout(function(){ try{ inp.focus(); }catch(e){} }, 60);
}
/* en la obra de ejemplo: tres trabajadores inventados para probar (uno al día, uno con pendientes, uno que no cumple). Los da
   el ejemplo mismo (dmaCumEjemplos o cenCumEjemplos): la cuenta de verdad nunca manda un documento entero */
function cumEjemplos(){
  var c = $('cum-q-ej'); if(!c) return;
  var L = [];
  try{
    if(YO && YO.central && typeof cenCumEjemplos === 'function') L = cenCumEjemplos();
    else if(YO && YO.demo && typeof dmaCumEjemplos === 'function') L = dmaCumEjemplos();
  }catch(e){ L = []; }
  if(!L.length){ c.remove(); return; }
  c.innerHTML = '<span>Obra de ejemplo · prueba con:</span>' + L.map(function(t){ return '<button type="button" class="cum-chip" data-cum-ej="' + esc(t.doc) + '">' + esc(t.solo ? String(t.nombre) : String(t.nombre).split(',')[0]) + ' <small>' + esc(t.solo ? 'comparte solo cifras' : (CUM_EST[t.estado] || [''])[0]) + '</small></button>'; }).join('');
  Array.prototype.forEach.call(c.querySelectorAll('[data-cum-ej]'), function(b){ b.onclick = function(){ var i = $('cum-q-in'); if(i) i.value = b.getAttribute('data-cum-ej'); cumVerificar(b.getAttribute('data-cum-ej')); }; });
}
function cumVerificar(txt){
  var r = $('cum-q-res'); if(!r) return;
  var q = cumDocDe(txt);
  if(!q){ r.innerHTML = '<div class="msg mal" role="alert">Escribe el documento del trabajador o pega el enlace de su QR.</div>'; return; }
  if(q.error === 'qr'){ r.innerHTML = '<div class="msg mal" role="alert">Ese enlace no es un QR de OBRASST: pega el que abre al escanear el casco o el carné.</div>'; return; }
  if(q.error === 'doc'){ r.innerHTML = '<div class="msg mal" role="alert">Revisa el documento: van de 6 a 15 letras o números.</div>'; return; }
  var bt = $('cum-q-ver'); if(bt) bt.disabled = true;
  cumPedir('qr', r, 'sst_cad_trab_qr', { emp:YO.obra.id, doc:q.doc, nombre:q.nombre || null }, function(j){
    r.innerHTML = cumQrHTML(j, q);
    /* la de solo cifras: a su fila en «Por empresa» (buscada por su RUC) */
    var vc = r.querySelector('[data-cum-cifras]');
    if(vc) vc.onclick = function(){ CUM.emp.trab = null; CUM.emp.via = ''; CUM.emp.proy = ''; CUM.emp.q = vc.getAttribute('data-cum-cifras'); navegar('cum-emp'); };
    cumVerifsPintar();
    try{ r.scrollIntoView({ behavior:'smooth', block:'nearest' }); }catch(e){}
  }).then(function(){ var b2 = $('cum-q-ver'); if(b2) b2.disabled = false; });
}
var CUM_QV = { ok:['✓', 'Al día', 'Tiene lo que pide su trabajo de hoy, según los registros de su empresa.'],
               ojo:['!', 'Con pendientes', 'Puede trabajar, pero tiene algo por regularizar.'],
               mal:['✕', 'No cumple', 'Le falta algo que pide su trabajo de hoy: no debería empezar hasta regularizarlo.'] };
function cumQrHTML(j, q){
  if(!j.encontrado) return '<div class="tarj cum-qv gris"><div class="cum-qv-b"><span class="cum-qv-i" aria-hidden="true">?</span><div><b>No está entre las empresas que ves</b>' +
    '<small>' + esc((q.qr ? 'El documento del QR' : 'Ese documento') + ' no figura activo en ninguna empresa de tu obra' + (cumEsCentral() ? '' : ' ni de sus subcontratas') + '. Revisa el documento, o pide a su empresa que lo registre en OBRASST.') + '</small></div></div></div>';
  var t = j.t || {}, E = CUM_QV[j.estado] || CUM_QV.ojo;
  if(j.solo_cifras) return '<div class="tarj cum-qv gris"><div class="cum-qv-b" role="status"><span class="cum-qv-i" aria-hidden="true">i</span><div><b>Comparte solo cifras</b>' +
    '<small>' + esc('Es de ' + (_cumNom(t.empresa || '') || 'una empresa que ves') + ', que comparte solo cifras: su estado se ve en su empresa.') + '</small></div></div>' +
    '<div class="tarj-cuerpo"><div class="cum-qv-quien"><span>' + esc([_cumNom(t.empresa || ''), t.ruc ? 'RUC ' + t.ruc : '', t.proyecto, t.via ? _cumViaTx(t) : ''].filter(Boolean).join(' · ')) + '</span></div>' +
    '<p class="cum-qv-mira">De esta empresa ves sus números en «Por empresa», no lo de cada persona.</p>' +
    '<button type="button" class="bt sec chico" data-cum-cifras="' + esc(t.ruc || t.empresa || '') + '">Ver sus cifras ›</button></div></div>';
  var h = '<div class="tarj cum-qv ' + esc(j.estado || 'ojo') + '"><div class="cum-qv-b" role="status"><span class="cum-qv-i" aria-hidden="true">' + E[0] + '</span><div><b>' + esc(E[1]) + '</b><small>' + esc(E[2]) + '</small></div></div>' +
    '<div class="tarj-cuerpo"><div class="cum-qv-quien"><b>' + esc(t.nombre || '') + '</b><span>' + esc([_cumDoc(t.doc), t.puesto].filter(Boolean).join(' · ')) + '</span><span>' + esc([_cumNom(t.empresa || ''), t.ruc ? 'RUC ' + t.ruc : '', t.proyecto].filter(Boolean).join(' · ')) + '</span></div>' +
    '<p class="cum-qv-mira">Mira que sea la persona: el nombre y el puesto tienen que coincidir con quien tienes al frente.</p>' +
    '<ul class="cum-qv-l">' + (j.lista || []).map(function(x){
      var cl = x.e === 'ok' ? 'ok' : (x.e === 'mal' ? 'mal' : (x.e === 'ojo' ? 'ojo' : 'gris'));
      return '<li class="' + cl + '"><span class="cum-qv-li" aria-hidden="true">' + ({ ok:'✓', mal:'✕', ojo:'!', gris:'–' })[cl] + '</span><span>' + esc(x.tx || '') + '</span></li>';
    }).join('') + '</ul><p class="cum-pie">Verificado a las ' + esc(_cumHora(Date.now())) + ' · queda en «Las verificaciones de hoy». Sale de los registros de su empresa en OBRASST.</p></div></div>';
  return h;
}
function cumVerifsPintar(){
  var c = $('cum-q-hoy'); if(!c) return;
  cumPedir('verifs', c, 'sst_cad_verifs', { emp:YO.obra.id }, function(j){
    var L = j.lista || [];
    if(!L.length){ c.innerHTML = '<div class="vacio"><b>Nadie verificado hoy</b>Al verificar a un trabajador queda aquí, con la hora y cómo estaba.</div>'; return; }
    c.innerHTML = '<div class="tabla-caja"><table class="cum-t"><thead><tr><th>Hora</th><th>Trabajador</th><th>Empresa</th><th>Estado</th><th>Lo verificó</th></tr></thead><tbody>' + L.map(function(x){
      var E = CUM_EST[x.estado] || ['—', 'gris'];
      return '<tr><td class="cum-nw">' + esc(_cumHora(x.cuando)) + '</td><td>' + esc(x.nombre || '') + '</td><td>' + esc(_cumNom(x.empresa || '')) + '</td><td>' + _cumPill(E[0], E[1]) + '</td><td>' + esc(x.quien_nombre || '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  });
}
/* la cámara (si el navegador sabe leer QR): lee el enlace del casco y lo verifica */
function cumCamara(){
  var c = $('cum-q-cam-c'); if(!c) return;
  if(CUM.cam){ cumCamaraCerrar(); return; }
  var det; try{ det = new window.BarcodeDetector({ formats:['qr_code'] }); }catch(e){ toast('Este navegador no lee QR: pega el enlace o escribe el documento.'); return; }
  c.innerHTML = '<div class="cum-cam"><video id="cum-cam-v" playsinline muted></video><button type="button" class="bt sec chico" id="cum-cam-x">Cerrar la cámara</button></div>';
  $('cum-cam-x').onclick = cumCamaraCerrar;
  navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' }, audio:false }).then(function(st){
    var v = $('cum-cam-v'); if(!v){ st.getTracks().forEach(function(t){ t.stop(); }); return; }
    CUM.cam = { st:st, vivo:true }; v.srcObject = st; try{ v.play(); }catch(e){}
    var mira = function(){
      if(!CUM.cam || !CUM.cam.vivo || !v.isConnected){ cumCamaraCerrar(); return; }
      det.detect(v).then(function(L){
        var x = (L || []).filter(function(b){ return b && b.rawValue; })[0];
        if(x){ var i = $('cum-q-in'); if(i) i.value = x.rawValue; cumCamaraCerrar(); cumVerificar(x.rawValue); return; }
        setTimeout(mira, 350);
      }, function(){ setTimeout(mira, 600); });
    };
    mira();
  }, function(){ c.innerHTML = '<div class="msg mal" role="alert">No se pudo abrir la cámara: dale permiso al navegador, o pega el enlace.</div>'; CUM.cam = null; });
}
function cumCamaraCerrar(){
  if(CUM.cam && CUM.cam.st){ try{ CUM.cam.st.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} }
  CUM.cam = null; var c = $('cum-q-cam-c'); if(c) c.innerHTML = '';
}

/* ══ LA MATRIZ DE CAPACITACIÓN ════════════════════════════════════════════════════════════════════════════════════ */
var CUM_MZ = { ok:['✓', 'Al día'], vence:['◷', 'Por vencer'], falta:['✕', 'Falta'], na:['·', 'No lo pide su puesto'] };
function cumMatriz(caja){
  _cumTitulo();
  _cumAcc('<button type="button" class="bt sec" id="cum-m-est">El estándar por puesto</button><button type="button" class="bt sec" id="cum-m-xls" disabled>Excel</button>');
  $('cum-m-est').disabled = true;
  cumPedir('mat', caja, 'sst_cad_matriz', { emp:YO.obra.id }, function(j){ CUM.ult.mat = j; cumMatrizPintar(caja, j); });
}
function _cumMatFiltradas(j){
  var f = CUM.mat, q = _cumNorm(f.q);
  return (j.filas || []).filter(function(x){
    if(f.enl && String(x.enlace || 'propia') !== f.enl) return false;
    if(f.pue && String(x.puesto || '') !== f.pue) return false;
    if(f.solo && !Object.keys(x.c || {}).some(function(k){ return (x.c[k] || {}).e === 'falta'; })) return false;
    if(q && _cumNorm(x.nombre + ' ' + _cumDoc(x.doc) + ' ' + (x.puesto || '') + ' ' + (x.empresa || '')).indexOf(q) < 0) return false;
    return true;
  });
}
function cumMatrizPintar(caja, j){
  var f = CUM.mat, T = j.temas || [], F = j.filas || [], est = j.estandar || {};
  var bx = $('cum-m-xls'); if(bx){ bx.disabled = !F.length; bx.onclick = function(){ cumMatrizXls(j); }; }
  var be = $('cum-m-est'); if(be){ be.disabled = false; be.onclick = function(){ cumEstandar(j); }; }
  var emps = [], pues = [];
  F.forEach(function(x){ var k = String(x.enlace || 'propia'); if(!emps.some(function(e){ return e[0] === k; })) emps.push([k, _cumNom(x.empresa || '')]); if(x.puesto && pues.indexOf(x.puesto) < 0) pues.push(x.puesto); });
  pues.sort();
  if(f.enl && !emps.some(function(e){ return e[0] === f.enl; })) f.enl = '';
  if(f.pue && pues.indexOf(f.pue) < 0) f.pue = '';
  var L = _cumMatFiltradas(j), R = { ok:0, vence:0, falta:0 };
  L.forEach(function(x){ T.forEach(function(t){ var e = ((x.c || {})[t] || {}).e; if(R[e] != null) R[e]++; }); });
  var tot = R.ok + R.vence + R.falta, conFalta = L.filter(function(x){ return T.some(function(t){ return ((x.c || {})[t] || {}).e === 'falta'; }); }).length;
  var h = (!est.propio ? '<div class="aviso">Todavía no hay un estándar por puesto: las columnas son la inducción y los temas más dados en estos 12 meses, y cada uno se le pide a todos. ' +
      (cumManda() ? 'Ponlo en «El estándar por puesto»: qué capacitación pide cada puesto.' : 'Lo pone el jefe o el gerente de tu equipo, en «El estándar por puesto».') + '</div>' : '') +
    '<div class="rej cum-cifras">' + cifra('Trabajadores', _cumN(L.length), L.length !== F.length ? 'de ' + _cumN(F.length) + ' con el filtro' : 'en la matriz', '') +
    cifra('Al día', tot ? Math.round(100 * R.ok / tot) + ' %' : '—', _cumN(R.ok) + ' de ' + _cumN(tot) + ' capacitaciones que se piden', tot ? _cumCl(Math.round(100 * R.ok / tot)) : '') +
    cifra('Por vencer', _cumN(R.vence), 'en los próximos 30 días', R.vence ? 'ojo' : '') +
    cifra('Faltan', _cumN(R.falta), _cumN(conFalta) + (conFalta === 1 ? ' trabajador con algo que le falta' : ' trabajadores con algo que les falta'), R.falta ? 'mal' : '') + '</div>';
  h += '<div class="tarj"><div class="cum-filtros"><input type="search" id="cum-m-q" placeholder="Buscar trabajador…" aria-label="Buscar trabajador" value="' + esc(f.q) + '">' +
    (emps.length > 1 ? '<select id="cum-m-emp" aria-label="Empresa"><option value="">Todas las empresas</option>' + emps.map(function(e){ return '<option value="' + esc(e[0]) + '"' + (e[0] === f.enl ? ' selected' : '') + '>' + esc(e[1]) + '</option>'; }).join('') + '</select>' : '') +
    (pues.length > 1 ? '<select id="cum-m-pue" aria-label="Puesto"><option value="">Todos los puestos</option>' + pues.map(function(p){ return '<option' + (p === f.pue ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('') + '</select>' : '') +
    '<label class="cum-check"><input type="checkbox" id="cum-m-solo"' + (f.solo ? ' checked' : '') + '> Solo los que tienen algo que falta</label>' +
    '<span class="cum-ley" aria-label="Qué dice cada casilla">' + ['ok', 'vence', 'falta', 'na'].map(function(k){ return '<span><i class="cum-mz ' + k + '">' + CUM_MZ[k][0] + '</i>' + esc(CUM_MZ[k][1]) + '</span>'; }).join('') + '</span></div>';
  if(!F.length || !T.length) h += '<div class="vacio"><b>Todavía no hay a quién poner en la matriz</b>Cuando las empresas registren a su gente y sus capacitaciones en OBRASST, aquí sale cada uno, tema por tema.</div>';
  else if(!L.length) h += '<div class="vacio"><b>Nadie con ese filtro</b>Cambia el filtro o borra lo que buscas.</div>';
  else {
    var MAX = 500, V = L.slice(0, MAX);
    var porTema = T.map(function(t){ var a = 0, n = 0; L.forEach(function(x){ var e = ((x.c || {})[t] || {}).e; if(e === 'ok' || e === 'vence'){ a++; n++; } else if(e === 'falta') n++; }); return n ? Math.round(100 * a / n) : null; });
    h += '<div class="tabla-caja cum-mz-caja"><table class="cum-t cum-matriz"><thead><tr><th class="cum-mz-q">Trabajador</th>' + T.map(function(t){ return '<th class="cum-mz-t"><span>' + esc(t) + '</span></th>'; }).join('') + '</tr></thead><tbody>' +
      V.map(function(x){
        return '<tr><td class="cum-mz-q"><b class="cum-en">' + esc(x.nombre || '') + '</b><small class="cum-sub">' + esc([_cumNom(x.empresa || ''), x.puesto].filter(Boolean).join(' · ')) + '</small></td>' + T.map(function(t){
          var c = (x.c || {})[t] || { e:'na' }, k = CUM_MZ[c.e] ? c.e : 'na';
          return '<td class="cum-mz ' + k + '" title="' + esc(t + ': ' + CUM_MZ[k][1] + (c.f ? ' · ' + _cumF(c.f) : '')) + '">' + CUM_MZ[k][0] + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody><tfoot><tr><td class="cum-mz-q"><b>Al día</b><small class="cum-sub">de los que lo piden</small></td>' + porTema.map(function(v){ return '<td class="cum-mz-pc ' + _cumCl(v) + '">' + (v == null ? '—' : v + ' %') + '</td>'; }).join('') + '</tr></tfoot></table></div>' +
      (L.length > MAX ? '<p class="cum-pie">Se ven los primeros ' + MAX + ' de ' + _cumN(L.length) + ': filtra por empresa o por puesto, o baja el Excel' + (j.tope ? '' : ' con todos') + '.</p>' : '');
  }
  if(j.tope) h += '<p class="cum-pie cum-ojo">Se muestran las primeras 3,000 personas de las empresas que ves (también en el Excel).</p>';
  var sinD = (j.sin_detalle || []).filter(Boolean);
  if(sinD.length){ var sinTx = sinD.map(_cumNom).join(', '); h += '<p class="cum-pie">No salen aquí porque comparten contigo solo sus cifras: ' + esc(sinTx) + (/[.!?]$/.test(sinTx) ? '' : '.') + '</p>'; }
  h += '</div><p class="cum-pie">Al día: una capacitación aprobada del tema en los últimos ' + (est.vigencia || 12) + ' meses. Sale de las constancias que cada empresa registra en OBRASST (y la inducción, de su inducción en la app).</p>';
  caja.innerHTML = h;
  var qi = $('cum-m-q');
  if(qi) qi.oninput = function(){ var pos = qi.selectionStart; f.q = qi.value; cumMatrizPintar(caja, j); var q2 = $('cum-m-q'); if(q2){ q2.focus(); try{ q2.setSelectionRange(pos, pos); }catch(e){} } };
  if($('cum-m-emp')) $('cum-m-emp').onchange = function(){ f.enl = this.value; cumMatrizPintar(caja, j); };
  if($('cum-m-pue')) $('cum-m-pue').onchange = function(){ f.pue = this.value; cumMatrizPintar(caja, j); };
  if($('cum-m-solo')) $('cum-m-solo').onchange = function(){ f.solo = this.checked; cumMatrizPintar(caja, j); };
}
/* el estándar: lo que se pide a todos y lo que pide cada puesto (el jefe o el gerente lo cambian) */
function cumEstandar(j){
  var est = j.estandar || {}, manda = cumManda(), P = est.puestos || {}, F = j.filas || [];
  var pues = {}; F.forEach(function(x){ if(x.puesto){ var k = _cumNorm(x.puesto); if(!pues[k]) pues[k] = x.puesto; } });
  Object.keys(P).forEach(function(k){ if(!pues[k]) pues[k] = k.charAt(0).toUpperCase() + k.slice(1); });
  var keys = Object.keys(pues).sort(function(a, b){ return pues[a].localeCompare(pues[b]); });
  var comun = (est.propio ? (est.comun || []) : ['Inducción']).join('\n');
  var sug = (j.temas || []).join(', ');
  var h = (manda ? '' : '<div class="aviso">Lo cambia el jefe o el gerente de tu equipo. Tú lo ves.</div>') +
    '<div class="campo"><label for="cum-s-comun">Lo que se pide a todos (un tema por línea)</label><textarea id="cum-s-comun" rows="3"' + (manda ? '' : ' disabled') + '>' + esc(comun) + '</textarea></div>' +
    '<div class="campo"><label for="cum-s-vig">Cuánto dura una capacitación</label><select id="cum-s-vig"' + (manda ? '' : ' disabled') + '>' + [6, 12, 24, 36].map(function(m){ return '<option value="' + m + '"' + (+(est.vigencia || 12) === m ? ' selected' : '') + '>' + m + ' meses</option>'; }).join('') + '</select></div>' +
    '<h3 class="cum-h3">Lo que pide cada puesto <small>(además de lo de todos; separa los temas con comas)</small></h3>' +
    '<div class="cum-est" id="cum-s-pues">' + (keys.length ? keys.map(function(k, i){
      return '<div class="cum-est-f"><label for="cum-s-p' + i + '">' + esc(pues[k]) + '</label><input id="cum-s-p' + i + '" data-cum-pk="' + esc(k) + '" autocomplete="off" value="' + esc((P[k] || []).join(', ')) + '" placeholder="Solo lo de todos"' + (manda ? '' : ' disabled') + '></div>';
    }).join('') : '<p class="cum-gris">Todavía no hay puestos: salen de la gente que registran las empresas.</p>') + '</div>' +
    (manda ? '<div class="cum-est-f cum-est-nuevo"><input id="cum-s-np" maxlength="80" autocomplete="off" placeholder="Otro puesto"><input id="cum-s-nt" autocomplete="off" placeholder="Sus temas, separados con comas"></div>' : '') +
    (sug ? '<p class="ayuda">Temas que ya se dan en la obra: ' + esc(sug) + '.</p>' : '') + '<div class="msg mal" id="cum-s-msg" role="alert"></div>';
  abrirHoja('El estándar por puesto', 'Qué capacitación pide cada puesto: con eso se arma la matriz', h,
    '<button type="button" class="bt sec" id="cum-s-no">' + (manda ? 'Cancelar' : 'Cerrar') + '</button>' + (manda ? '<button type="button" class="bt" id="cum-s-si">Guardar el estándar</button>' : ''), { id:'cum-estandar', ancha:true });
  $('cum-s-no').onclick = cerrarHoja;
  if(!manda) return;
  var lista = function(s, sep){ return String(s || '').split(sep).map(function(x){ return x.replace(/\s+/g, ' ').trim(); }).filter(function(x, i, l){ return x && l.indexOf(x) === i; }); };
  $('cum-s-si').onclick = function(){
    var m = $('cum-s-msg'); m.textContent = '';
    var p = {}, mal = '';
    Array.prototype.forEach.call(document.querySelectorAll('[data-cum-pk]'), function(inp){ var L = lista(inp.value, ','); if(L.length) p[inp.getAttribute('data-cum-pk')] = L; });
    var np = String(($('cum-s-np') || {}).value || '').trim(), nt = lista(($('cum-s-nt') || {}).value, ',');
    if(np && nt.length) p[_cumNorm(np)] = nt; else if(np && !nt.length) mal = 'Escribe los temas del puesto nuevo, separados con comas.';
    var com = lista($('cum-s-comun').value, '\n');
    Object.keys(p).forEach(function(k){ p[k].forEach(function(t){ if(t.length < 3 || t.length > 80) mal = 'Cada tema, de 3 a 80 letras: revisa «' + t + '».'; }); if(p[k].length > 20) mal = 'Hasta 20 temas por puesto.'; });
    com.forEach(function(t){ if(t.length < 3 || t.length > 80) mal = 'Cada tema, de 3 a 80 letras: revisa «' + t + '».'; });
    if(Object.keys(p).length > 60) mal = 'Hasta 60 puestos.';
    if(mal){ m.textContent = mal; return; }
    var bt = this; bt.disabled = true; bt.textContent = 'Guardando…';
    cumRpc('sst_cad_matriz_poner', { emp:YO.obra.id, puestos:p, comun:com, vigencia:+$('cum-s-vig').value || 12 }).then(function(r){
      if(!r || !r.ok){ bt.disabled = false; bt.textContent = 'Guardar el estándar'; m.textContent = cumMotivo(r); return; }
      cerrarHoja(); toast('Estándar guardado: la matriz ya lo usa.');
      if(VISTA.actual === 'cum-matriz' && CUM.caja && CUM.caja.isConnected) cumMatriz(CUM.caja);
    }, function(e){ bt.disabled = false; bt.textContent = 'Guardar el estándar'; m.textContent = cumMotivo(null, e); });
  };
}

/* ══ EL INFORME CONSOLIDADO ═══════════════════════════════════════════════════════════════════════════════════════ */
function cumConsol(caja){
  _cumTitulo();
  var c = CUM.consol; if(!c.hasta || c.hasta > _cumMesHoy()) c.hasta = _cumMesHoy();
  _cumAcc('<button type="button" class="bt sec" id="cum-c-pdf" disabled>PDF</button>');
  caja.innerHTML = '<div class="cum-c-cab"><div class="cum-mes"><button type="button" class="bt sec chico" id="cum-c-ant" aria-label="Mes anterior">‹</button><b id="cum-c-mes">' + esc(_cumMesTx(c.hasta)) + '</b>' +
    '<button type="button" class="bt sec chico" id="cum-c-sig" aria-label="Mes siguiente"' + (c.hasta >= _cumMesHoy() ? ' disabled' : '') + '>›</button></div>' +
    '<span class="cum-chips" role="group" aria-label="Cuántos meses">' + [3, 6, 12].map(function(n){ return '<button type="button" class="cum-chip' + (n === c.meses ? ' on' : '') + '" data-cum-meses="' + n + '">' + n + ' meses</button>'; }).join('') + '</span></div><div id="cum-c-cuerpo"></div>';
  $('cum-c-ant').onclick = function(){ c.hasta = _cumMesMas(c.hasta, -1); cumConsol(caja); };
  $('cum-c-sig').onclick = function(){ c.hasta = _cumMesMas(c.hasta, 1); cumConsol(caja); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-cum-meses]'), function(b){ b.onclick = function(){ c.meses = +b.getAttribute('data-cum-meses'); cumConsol(caja); }; });
  var cu = $('cum-c-cuerpo');
  cumPedir('consol', cu, 'sst_cad_consolidado', { emp:YO.obra.id, meses:c.meses, hasta:c.hasta }, function(j){ CUM.ult.consol = j; cumConsolPintar(cu, j); });
}
function _cumIF(n, hht){ return (hht && +hht > 0) ? Math.round(+n * 1000000 / +hht * 100) / 100 : null; }
function _cumDec(v){ return v == null ? '—' : (Math.round(v * 100) / 100).toFixed(2); }
function cumConsolPintar(c, j){
  var M = j.meses || [], tot = j.total || [], ult = tot[tot.length - 1] || {}, ant = tot.length > 1 ? tot[tot.length - 2] : null, m = M[M.length - 1] || CUM.consol.hasta;
  var bp = $('cum-c-pdf'); if(bp){ bp.disabled = !M.length; bp.onclick = function(){ cumConsolPdf(j); }; }
  if(!M.length){ c.innerHTML = cumVacio('Todavía no hay meses que consolidar', 'Cuando las empresas registren su gestión en OBRASST, aquí sale el mes y los anteriores.'); return; }
  var enCurso = m === _cumMesHoy();
  var dif = function(k){ if(enCurso && k !== 'gente') return 'en lo que va del mes'; if(!ant || ult[k] == null || ant[k] == null) return ''; var d = (+ult[k]) - (+ant[k]); return d === 0 ? 'igual que el mes anterior' : (d > 0 ? '+' : '−') + _cumN(Math.abs(d)) + ' que el mes anterior'; };
  var leves = function(n){ n = +n || 0; return n === 1 ? '1 leve' : _cumN(n) + ' leves'; };
  var IF = ult['if'] != null ? +ult['if'] : _cumIF(ult.acc, ult.hht), IG = ult.ig != null ? +ult.ig : _cumIF(ult.dias, ult.hht);
  var pAt = ult.lev ? Math.round(100 * (ult.a_tiempo || 0) / ult.lev) : null;
  var h = '<div class="rej cum-cifras">' +
    cifra('Gente', _cumN(ult.gente), dif('gente'), '') +
    cifra('Horas hombre', ult.hht == null ? '—' : _cumN(ult.hht), ult.hht == null ? 'sin dato' : (enCurso ? 'en lo que va del mes' : 'trabajadas en ' + _cumMesTx(m)), '') +
    cifra('Accidentes incapacitantes', _cumN(ult.acc), leves(ult.acc_leve) + ' · ' + _cumN(ult.dias) + (+ult.dias === 1 ? ' día perdido' : ' días perdidos'), ult.acc ? 'mal' : 'ok') +
    cifra('Índice de frecuencia', _cumDec(IF), 'índice de gravedad ' + _cumDec(IG), IF ? 'mal' : '') +
    cifra('Capacitaciones', _cumN(ult.cap), _cumPl(ult.charlas, 'charla', 'charlas') + (enCurso ? ' en lo que va del mes' : ''), '') +
    cifra('ATS', _cumN(ult.ats), dif('ats'), '') +
    cifra('Observaciones', _cumN(ult.obs), pAt == null ? 'ninguna levantada todavía' : pAt + ' % levantadas a tiempo', pAt != null ? _cumCl(pAt, 85, 70) : '') +
    cifra('Inspecciones', _cumN(ult.insp), _cumPl(ult.epp, 'EPP entregado', 'EPP entregados'), '') + '</div>';
  var serie = function(k){ return tot.map(function(x){ return x[k] == null ? null : +x[k]; }); };
  var ifs = tot.map(function(x){ return x['if'] != null ? +x['if'] : _cumIF(x.acc, x.hht); });
  var cw = c.clientWidth || 0, gW = !cw ? 520 : Math.round(Math.max(280, Math.min(560, (window.innerWidth > 1000 ? (cw - 18) / 2 : cw) - 38)));
  h += '<div class="cum-dos">' +
    cumGraf('Observaciones y levantamiento', 'Nuevas en el mes, levantadas y levantadas a tiempo', M, [{ n:'Nuevas', v:serie('obs'), cl:'s1' }, { n:'Levantadas', v:serie('lev'), cl:'s2' }, { n:'A tiempo', v:serie('a_tiempo'), cl:'s3' }], 'barras', gW) +
    cumGraf('Índice de frecuencia', 'Accidentes incapacitantes por cada millón de horas hombre', M, [{ n:'IF', v:ifs, cl:'s4', dec:true }], 'linea', gW) +
    cumGraf('Capacitaciones y charlas', 'Las del mes, de todas las empresas', M, [{ n:'Capacitaciones', v:serie('cap'), cl:'s1' }, { n:'Charlas', v:serie('charlas'), cl:'s2' }], 'barras', gW) +
    cumGraf('Horas hombre', 'Trabajadas en el mes, todas las empresas', M, [{ n:'Horas hombre', v:serie('hht'), cl:'s5' }], 'barras', gW) + '</div>';
  /* cada empresa, el último mes */
  var E = (j.empresas || []).map(function(e){ var s = (e.serie || []).filter(function(x){ return x.m === m; })[0] || {}; return { e:e, s:s }; });
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>Cada empresa en ' + esc(_cumMesTx(m)) + '</h2><p class="sub">Lo que registró cada una en OBRASST ese mes · IF e IG por cada millón de horas hombre</p></div></div>' +
    '<div class="tabla-caja"><table class="cum-t cum-consol cum-fija"><thead><tr><th>Empresa</th><th class="num">Gente</th><th class="num">Horas hombre</th><th class="num">Acci&shy;dentes</th><th class="num">Días perdidos</th><th class="num">IF</th>' +
    '<th class="num">Capaci&shy;taciones</th><th class="num">ATS</th><th class="num">Charlas</th><th class="num">Observa&shy;ciones</th><th class="num">A tiempo</th><th class="num">Inspec&shy;ciones</th><th class="num">EPP</th><th class="num">Pape&shy;letas</th></tr></thead><tbody>' +
    E.map(function(x){
      var s = x.s, at = s.lev ? Math.round(100 * (s.a_tiempo || 0) / s.lev) : null, ifx = _cumIF(s.acc, s.hht);
      return '<tr><td><b class="cum-en">' + esc(_cumNom(x.e.nombre)) + '</b><small class="cum-sub">' + esc([x.e.proyecto, _cumViaTx(x.e)].filter(Boolean).join(' · ')) + '</small></td>' +
        '<td class="num">' + _cumN(s.gente) + '</td><td class="num">' + (s.hht == null ? '<span class="cum-gris">—</span>' : _cumN(s.hht)) + '</td>' +
        '<td class="num' + (s.acc ? ' cum-mal' : '') + '">' + _cumN(s.acc) + (s.acc_leve ? '<small class="cum-sub">' + (s.acc_leve === 1 ? '1 leve' : s.acc_leve + ' leves') + '</small>' : '') + '</td><td class="num">' + _cumN(s.dias) + '</td><td class="num">' + _cumDec(ifx) + '</td>' +
        '<td class="num">' + _cumN(s.cap) + '</td><td class="num">' + _cumN(s.ats) + '</td><td class="num">' + _cumN(s.charlas) + '</td><td class="num">' + _cumN(s.obs) + '</td>' +
        '<td class="num">' + (at == null ? '<span class="cum-gris">—</span>' : _cumCelda(at, '', _cumCl(at, 85, 70))) + '</td><td class="num">' + _cumN(s.insp) + '</td><td class="num">' + _cumN(s.epp) + '</td><td class="num">' + _cumN(s.amon) + '</td></tr>';
    }).join('') +
    '<tr class="cum-total"><td><b>Total</b></td><td class="num">' + _cumN(ult.gente) + '</td><td class="num">' + (ult.hht == null ? '—' : _cumN(ult.hht)) + '</td><td class="num">' + _cumN(ult.acc) + '</td><td class="num">' + _cumN(ult.dias) + '</td><td class="num">' + _cumDec(IF) + '</td>' +
    '<td class="num">' + _cumN(ult.cap) + '</td><td class="num">' + _cumN(ult.ats) + '</td><td class="num">' + _cumN(ult.charlas) + '</td><td class="num">' + _cumN(ult.obs) + '</td><td class="num">' + (pAt == null ? '—' : pAt + ' %') + '</td><td class="num">' + _cumN(ult.insp) + '</td><td class="num">' + _cumN(ult.epp) + '</td><td class="num">' + _cumN(ult.amon) + '</td></tr>' +
    '</tbody></table></div></div><p class="cum-pie">Sale solo de lo que cada empresa registra en OBRASST: nadie arma nada aparte. Las horas hombre, de su tareo o de su registro de horas; sin ese dato, el IF y el IG quedan en blanco.</p>';
  c.innerHTML = h;
}
/* un gráfico de tendencia, a mano (SVG): barras agrupadas o una línea; una sola escala, con su valor encima */
function cumGraf(tit, sub, M, S, tipo, ancho){
  var W = ancho || 520, H = 210, x0 = 50, y0 = 16, x1 = W - 10, y1 = H - 34, n = M.length;
  var max = 0; S.forEach(function(s){ s.v.forEach(function(v){ if(v != null && v > max) max = v; }); });
  var hayDato = S.some(function(s){ return s.v.some(function(v){ return v != null; }); });
  var esc2 = function(v){ return y1 - (max ? (v / max) * (y1 - y0) : 0); };
  var paso = (x1 - x0) / Math.max(1, n), svg = '';
  /* la línea de base y tres guías */
  for(var g = 0; g <= 3; g++){ var gy = y1 - g * (y1 - y0) / 3; svg += '<line class="cum-g-guia" x1="' + x0 + '" y1="' + gy.toFixed(1) + '" x2="' + x1 + '" y2="' + gy.toFixed(1) + '"/>';
    if(max && g) svg += '<text class="cum-g-eje" x="' + (x0 - 6) + '" y="' + (gy + 3.5).toFixed(1) + '" text-anchor="end">' + esc(_cumCorto(max * g / 3, S[0].dec)) + '</text>'; }
  /* los meses: si no caben todos, uno sí y uno no (el último siempre) */
  var cada = Math.max(1, Math.ceil(36 / Math.max(1, paso)));
  M.forEach(function(m, i){ if((n - 1 - i) % cada) return; svg += '<text class="cum-g-mes" x="' + (x0 + paso * (i + 0.5)).toFixed(1) + '" y="' + (H - 14) + '" text-anchor="middle">' + esc(_cumMesTx(m, true)) + '</text>'; });
  if(tipo === 'linea'){
    S.forEach(function(s){
      var pts = []; s.v.forEach(function(v, i){ if(v != null) pts.push([x0 + paso * (i + 0.5), esc2(v), v]); });
      if(pts.length > 1) svg += '<polyline class="cum-g-l ' + s.cl + '" points="' + pts.map(function(p){ return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '"/>';
      /* si los valores no caben, solo el más alto y el último */
      var apretado = pts.some(function(p){ return _cumCorto(p[2], s.dec).length * 6 > paso - 4; }), mx = Math.max.apply(null, pts.map(function(p){ return p[2]; }).concat([0]));
      pts.forEach(function(p, q){ svg += '<circle class="cum-g-p ' + s.cl + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4"/>' +
        (!apretado || q === pts.length - 1 || (p[2] === mx && mx > 0) ? '<text class="cum-g-v" x="' + p[0].toFixed(1) + '" y="' + (p[1] - 9).toFixed(1) + '" text-anchor="middle">' + esc(_cumCorto(p[2], s.dec)) + '</text>' : ''); });
    });
  } else {
    var gw = paso * 0.74, bw = gw / S.length;
    M.forEach(function(m, i){
      S.forEach(function(s, k){
        var v = s.v[i]; if(v == null) return;
        var bx = x0 + paso * i + (paso - gw) / 2 + k * bw, by = esc2(v), bh = Math.max(v ? 1.5 : 0, y1 - by);
        svg += '<rect class="cum-g-b ' + s.cl + '" x="' + (bx + 1).toFixed(1) + '" y="' + (y1 - bh).toFixed(1) + '" width="' + Math.max(2, bw - 2).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2"><title>' + esc(s.n + ' · ' + _cumMesTx(m) + ': ' + _cumCorto(v, s.dec)) + '</title></rect>';
        var et = _cumCorto(v, s.dec);
        if((S.length <= 2 || n <= 6) && et.length * 6 <= (S.length === 1 ? paso - 4 : bw + 6)) svg += '<text class="cum-g-v" x="' + (bx + bw / 2).toFixed(1) + '" y="' + (y1 - bh - 4).toFixed(1) + '" text-anchor="middle">' + esc(et) + '</text>';
      });
    });
  }
  return '<div class="tarj cum-graf"><div class="tarj-cab"><div><h2>' + esc(tit) + '</h2><p class="sub">' + esc(sub) + '</p></div>' +
    (S.length > 1 ? '<div class="cum-g-ley">' + S.map(function(s){ return '<span><i class="' + s.cl + '"></i>' + esc(s.n) + '</span>'; }).join('') + '</div>' : '') + '</div>' +
    '<div class="tarj-cuerpo">' + (hayDato ? '<svg class="cum-g" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(tit + ': ' + S.map(function(s){ return s.n + ' ' + s.v.map(function(v){ return v == null ? 'sin dato' : _cumCorto(v, s.dec); }).join(', '); }).join('; ')) + '">' + svg + '</svg>'
      : '<p class="cum-gris">Sin datos en estos meses.</p>') + '</div></div>';
}
function _cumCorto(v, dec){
  if(v == null) return '—';
  if(dec) return (Math.round(v * 100) / 100).toFixed(2);
  if(v >= 1000000) return (Math.round(v / 100000) / 10) + ' M';
  if(v >= 10000) return Math.round(v / 1000) + ' mil';
  return _cumN(v);
}

/* ══ CORPORATIVO: CADA CONTRATISTA EN TODAS TUS OBRAS ═════════════════════════════════════════════════════════════ */
function cumComp(caja){
  _cumTitulo(); _cumAcc('<button type="button" class="bt sec" id="cum-k-xls" disabled>Excel</button>');
  var obras = (YO && YO.central && typeof CEN_OBRAS !== 'undefined') ? CEN_OBRAS.map(function(o){ return { id:o.id, nombre:o.nombre }; })
    : (YO.empresas || []).map(function(o){ return { id:o.id, nombre:(typeof nombreObraP === 'function' ? nombreObraP(o) : '') || o.nombre || '' }; });
  if(!obras.length){ caja.innerHTML = cumVacio('Todavía no hay obras', ''); return; }
  caja.innerHTML = '<div class="vacio">Juntando tus ' + obras.length + (obras.length === 1 ? ' obra' : ' obras') + '…</div>';
  var n = CUM.n.comp = (CUM.n.comp || 0) + 1, v = VISTA.actual;
  Promise.all(obras.map(function(o){ return cumRpc('sst_cad_cumple', { emp:o.id }).then(function(j){ return j && j.ok ? j : null; }, function(){ return null; }); })).then(function(R){
    if(CUM.n.comp !== n || VISTA.actual !== v || !caja.isConnected) return;
    var K = { obras:obras, R:R }; CUM.comp = K; cumCompPintar(caja, K);
  });
}
function _cumCompArmar(K){
  var por = {}, obras = K.obras;
  K.R.forEach(function(j, oi){
    if(!j) return;
    (j.empresas || []).forEach(function(x){
      if(x.via === 'propia') return;
      var k = x.ruc ? 'r:' + x.ruc : 'n:' + _cumNorm(x.nombre);
      var c = por[k] || (por[k] = { nombre:_cumNom(x.nombre), ruc:x.ruc || '', obras:{}, gente:0, capOk:0, capTot:0, emoOk:0, emoTot:0, ven:0, lev:0, aT:0, notaG:0, notaN:0 });
      c.obras[oi] = x; c.gente += +x.gente || 0;
      if(x.cap){ c.capOk += +x.cap.ok || 0; c.capTot += +x.cap.tot || 0; }
      if(x.emo){ c.emoOk += +x.emo.ok || 0; c.emoTot += +x.emo.tot || 0; }
      if(x.obs){ c.ven += +x.obs.ven || 0; c.lev += +x.obs.lev || 0; c.aT += +x.obs.a_tiempo || 0; }
      if(x.nota != null){ var w = Math.max(1, +x.gente || 0); c.notaG += x.nota * w; c.notaN += w; }
    });
  });
  return Object.keys(por).map(function(k){
    var c = por[k];
    c.nota = c.notaN ? Math.round(c.notaG / c.notaN) : null; c.n = Object.keys(c.obras).length;
    c.cap = c.capTot ? Math.round(100 * c.capOk / c.capTot) : null; c.emo = c.emoTot ? Math.round(100 * c.emoOk / c.emoTot) : null;
    c.at = c.lev ? Math.round(100 * c.aT / c.lev) : null;
    return c;
  }).sort(function(a, b){ return (a.nota == null ? 999 : a.nota) - (b.nota == null ? 999 : b.nota) || b.gente - a.gente; });
}
function cumCompPintar(caja, K){
  var C = _cumCompArmar(K), O = K.obras;
  var bx = $('cum-k-xls'); if(bx){ bx.disabled = !C.length; bx.onclick = function(){ cumCompXls(K, C); }; }
  var corto = function(n){ return String(n || '').replace(/^(Centro Comercial|Residencial|Nave Industrial|Pabellón Universitario|Obra) /, ''); };
  /* las obras, lado a lado */
  var h = '<div class="tarj"><div class="tarj-cab"><div><h2>Tus obras, lado a lado</h2><p class="sub">Lo que cumplen hoy las empresas de cada obra, de sus propios registros</p></div></div><div class="tabla-caja"><table class="cum-t cum-obras cum-fija"><thead><tr><th>Obra</th><th class="num">Empresas</th><th class="num">Gente</th><th class="num">Nota</th><th class="num">Capacitación vigente</th><th class="num">EMO vigente</th><th class="num">ATS de hoy</th><th class="num">Charla de hoy</th><th class="num">Obs. vencidas</th></tr></thead><tbody>' +
    O.map(function(o, i){
      var j = K.R[i]; if(!j) return '<tr><td><b class="cum-en">' + esc(o.nombre) + '</b><small class="cum-sub">No se pudo traer: sin Central o sin conexión</small></td><td colspan="8" class="cum-gris">—</td></tr>';
      var E = (j.empresas || []), S = _cumSuma(E), nG = 0, nN = 0;
      E.forEach(function(x){ if(x.nota != null){ var w = Math.max(1, +x.gente || 0); nG += x.nota * w; nN += w; } });
      var pa = S.gente ? Math.round(100 * S.ats.firmaron / S.gente) : null, pc = S.gente ? Math.round(100 * S.charla.asist / S.gente) : null;
      return '<tr><td><b class="cum-en">' + esc(o.nombre) + '</b></td><td class="num">' + E.length + '</td><td class="num">' + _cumN(S.gente) + '</td><td class="num">' + _cumBarra(nN ? Math.round(nG / nN) : null) + '</td>' +
        '<td class="num">' + _cumCelda(_cumP(S.cap), '') + '</td><td class="num">' + (S.hayEmo ? _cumCelda(_cumP(S.emo), '') : _cumSin()) + '</td><td class="num">' + _cumCelda(pa, '') + '</td><td class="num">' + _cumCelda(pc, '') + '</td>' +
        '<td class="num' + (S.ven ? ' cum-mal' : '') + '">' + S.ven + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>Cada contratista en todas tus obras</h2><p class="sub">Junta por su RUC lo que cumple en cada obra (la nota, ponderada por su gente) · lo que más preocupa, primero</p></div></div>';
  if(!C.length) h += '<div class="vacio"><b>Todavía no hay subcontratas en tus obras</b>Cuando acepten en cada obra, aquí sale cada una, lado a lado.</div>';
  else h += '<div class="tabla-caja"><table class="cum-t cum-comp cum-fija"><thead><tr><th>Contratista</th><th class="num">Obras</th><th class="num">Gente</th><th class="num">Nota</th>' + O.map(function(o){ return '<th class="num cum-comp-o" title="' + esc(o.nombre) + '">' + esc(corto(o.nombre)) + '</th>'; }).join('') +
    '<th class="num">Capacitación vigente</th><th class="num">EMO vigente</th><th class="num">Levantadas a tiempo</th><th class="num">Obs. vencidas</th></tr></thead><tbody>' + C.map(function(c){
      return '<tr><td><b class="cum-en">' + esc(c.nombre) + '</b>' + (c.ruc ? '<small class="cum-sub">RUC ' + esc(c.ruc) + '</small>' : '') + '</td><td class="num">' + c.n + '</td><td class="num">' + _cumN(c.gente) + '</td><td class="num">' + _cumBarra(c.nota) + '</td>' +
        O.map(function(o, i){ var x = c.obras[i]; return '<td class="num">' + (x ? (x.nota == null ? '<span class="cum-gris">sin nota</span>' : '<span class="cum-pc ' + _cumCl(x.nota, 80, 60) + '"><b>' + x.nota + '</b><small>' + _cumN(x.gente) + ' pers.</small></span>') : '<span class="cum-gris">—</span>') + '</td>'; }).join('') +
        '<td class="num">' + _cumCelda(c.cap, '') + '</td><td class="num">' + (c.emo == null ? _cumSin() : _cumCelda(c.emo, '')) + '</td><td class="num">' + (c.at == null ? '<span class="cum-gris">—</span>' : _cumCelda(c.at, '', _cumCl(c.at, 85, 70))) + '</td>' +
        '<td class="num' + (c.ven ? ' cum-mal' : '') + '">' + c.ven + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  h += '</div><p class="cum-pie">Te sirve para decidir a quién llamas en la próxima obra y qué le pides en el contrato. Sale solo de lo que cada una registra en OBRASST: nadie llena una evaluación aparte.</p>';
  caja.innerHTML = h;
}

/* ══ LOS EXCEL (RCAP.xlsx, el de los registros) ═══════════════════════════════════════════════════════════════════ */
function _cumConXls(fn){
  var listo = (typeof cargarEvPDF === 'function') ? cargarEvPDF() : Promise.resolve(true);
  toast('Armando el Excel…');
  return listo.then(function(){ fn(); }).catch(function(e){ try{ console.warn('cumple xls', e); }catch(_w){} toast('No se pudo armar el archivo. Recarga la página e inténtalo otra vez.'); });
}
/* hojas: [{n, tit, sub, cols:[{t, w, al}], filas:[[valor | {v, st:'ok'|'ojo'|'mal'|'gris', num}]], fijas}] */
function _cumXls(hojas, titulo){
  var X = RCAP.xlsx, E = new X.Estilos(), K = X.C, az = '17344D';
  var S = { tit:E.xf({ b:1, sz:14, c:az }), sub:E.xf({ sz:10, c:K.gris }), cab:E.xf({ b:1, sz:9, c:K.blanco, f:az, borde:true, h:'center', v:'center', wrap:1 }),
            tx:E.xf({ sz:9, c:K.tinta, borde:true, wrap:1, v:'top' }), n:E.xf({ sz:9, c:K.tinta, borde:true, h:'right', v:'top' }), c:E.xf({ sz:9, c:K.tinta, borde:true, h:'center', v:'top' }),
            b:E.xf({ b:1, sz:9, c:K.tinta, borde:true, wrap:1, v:'top' }) };
  var ST = { ok:E.xf({ b:1, sz:9, c:'1E6B3A', f:'DCEFE0', borde:true, h:'center', v:'center' }), ojo:E.xf({ b:1, sz:9, c:'7A5300', f:'FFF0C2', borde:true, h:'center', v:'center' }),
             mal:E.xf({ b:1, sz:9, c:'9B1C1C', f:'F8D3D3', borde:true, h:'center', v:'center' }), gris:E.xf({ sz:9, c:'6B7780', f:'F0F2F4', borde:true, h:'center', v:'center' }) };
  var HS = hojas.map(function(H, k){
    var h = new X.Hoja(String(H.n).slice(0, 31)); h.activa = !k; h.pie = titulo;
    H.cols.forEach(function(c, i){ h.anchos[i] = c.w || 14; });
    var ult = H.cols.length - 1;
    h.unir(0, 1, ult, 1, H.tit, S.tit); h.altos[1] = 24;
    if(H.sub) h.unir(0, 2, ult, 2, H.sub, S.sub);
    var fr = 4;
    H.cols.forEach(function(c, i){ h.celda(i, fr, c.t, S.cab); }); h.altos[fr] = 32;
    h.congelar = { c:H.fijas == null ? 1 : H.fijas, r:fr }; h.titulos = "'" + String(H.n).slice(0, 31) + "'!$" + fr + ':$' + fr;
    H.filas.forEach(function(F, i){
      var r = fr + 1 + i;
      F.forEach(function(x, c){
        var o = (x && typeof x === 'object') ? x : { v:x }, col = H.cols[c] || {};
        var st = o.st ? (ST[o.st] || S.c) : (o.b ? S.b : (o.num || col.num ? S.n : (col.al === 'center' ? S.c : S.tx)));
        h.celda(c, r, (o.v == null || o.v === '') ? '' : o.v, st);
      });
    });
    return h;
  });
  return X.libro(HS, E, titulo, []);
}
function _cumArchivo(t){ return (typeof nombreArchivo === 'function') ? nombreArchivo(t) : String(t).replace(/[^\w .-]+/g, '-'); }
function _cumObraN(){ return (typeof nombreObraP === 'function' ? nombreObraP() : '') || (YO.obra || {}).nombre || 'obra'; }
function cumEmpXls(j){
  _cumConXls(function(){
    var L = _cumEmpFiltradas(j);
    var cols = [{ t:'Empresa', w:34 }, { t:'RUC', w:13, al:'center' }, { t:'Proyecto', w:24 }, { t:'Cómo llega', w:22 }, { t:'Comparte', w:14, al:'center' }, { t:'Nota (0 a 100)', w:10, num:true }, { t:'Gente', w:9, num:true },
      { t:'Capacitación vigente (%)', w:12, num:true }, { t:'EMO vigente (%)', w:11, num:true }, { t:'EMO vencidos', w:10, num:true }, { t:'Sin EMO', w:9, num:true }, { t:'Inducción (%)', w:11, num:true },
      { t:'ATS de hoy', w:9, num:true }, { t:'Firmaron un ATS hoy', w:12, num:true }, { t:'Asistieron a la charla de hoy', w:13, num:true }, { t:'PETAR de hoy', w:9, num:true },
      { t:'Papeletas (30 días)', w:11, num:true }, { t:'Observaciones abiertas', w:12, num:true }, { t:'Vencidas', w:9, num:true }, { t:'Levantadas a tiempo (%)', w:12, num:true }];
    var filas = L.map(function(x){
      var at = _cumEmpVal(x, 'a_tiempo');
      return [{ v:_cumNom(x.nombre), b:1 }, x.ruc || '', x.proyecto || '', _cumViaTx(x), x.detalle === false ? { v:'Solo cifras', st:'gris' } : 'Cifras y su gente', x.nota == null ? { v:'sin datos', st:'gris' } : { v:x.nota, st:_cumCl(x.nota, 80, 60) }, +x.gente || 0,
        _cumP(x.cap) == null ? '' : _cumP(x.cap), x.emo ? _cumP(x.emo) : 'sin dato', x.emo ? x.emo.ven || 0 : '', x.emo ? x.emo.sin || 0 : '', x.ind ? _cumP(x.ind) : 'sin dato',
        x.ats ? x.ats.hoy || 0 : '', x.ats ? x.ats.firmaron || 0 : '', x.charla ? x.charla.asist || 0 : '', x.petar ? x.petar.hoy || 0 : 'sin dato',
        x.amon ? x.amon.d30 || 0 : '', x.obs ? x.obs.ab || 0 : '', x.obs ? x.obs.ven || 0 : '', at == null ? '' : at];
    });
    var tit = (cumEsCentral() ? 'Comparativo de contratistas' : 'Cumplimiento por empresa') + ' · ' + _cumObraN();
    bajarBlob(_cumXls([{ n:'Empresas', tit:tit, sub:'Hoy, ' + _cumF((j.hoy || '')) + ' ' + (j.hora || '') + ' · sale de los registros de cada empresa en OBRASST · ' + (j.como || ''), cols:cols, filas:filas }], tit),
      _cumArchivo(tit + ' ' + (j.hoy || '')) + '.xlsx');
  });
}
function cumTrabXls(j){
  _cumConXls(function(){
    var e = j.empresa || {}, T = j.trabajadores || [];
    var cols = [{ t:'Trabajador', w:30 }, { t:'Documento', w:12, al:'center' }, { t:'Puesto', w:18 }, { t:'Estado', w:13, al:'center' }, { t:'Lo que le falta', w:34 }, { t:'Capacitación', w:12, al:'center' },
      { t:'Última capacitación', w:12, al:'center' }, { t:'Inducción', w:10, al:'center' }, { t:'EMO', w:11, al:'center' }, { t:'EMO hasta', w:12, al:'center' }, { t:'SCTR', w:10, al:'center' }, { t:'SCTR hasta', w:12, al:'center' },
      { t:'ATS de hoy', w:9, al:'center' }, { t:'Charla de hoy', w:10, al:'center' }, { t:'PETAR de hoy', w:16 }, { t:'Papeletas (30 días)', w:10, num:true }, { t:'Alto riesgo', w:30 }];
    var si = function(v){ return v == null ? 'sin dato' : (v ? { v:'Sí', st:'ok' } : { v:'No', st:'mal' }); };
    var filas = T.map(function(t){
      var E = CUM_EST[t.estado] || ['—', 'gris'], cap = t.cap, emo = t.emo, sc = t.sctr;
      return [{ v:t.nombre, b:1 }, _cumDoc(t.doc), t.puesto || '', { v:E[0], st:E[1] }, (t.faltan || []).join(' · '),
        cap ? { v:(CUM_CAP_E[cap.e] || ['—'])[0], st:(CUM_CAP_E[cap.e] || [0, 'gris'])[1] } : 'sin dato', cap && cap.ult ? _cumF(cap.ult) : '',
        t.ind ? (t.ind.e === 'ok' ? { v:'Hecha', st:'ok' } : { v:'Falta', st:'ojo' }) : 'sin dato',
        emo ? { v:(CUM_EMO_E[emo.e] || ['—'])[0], st:(CUM_EMO_E[emo.e] || [0, 'gris'])[1] } : 'sin dato', emo && emo.hasta ? _cumF(emo.hasta) : '',
        sc ? { v:(CUM_SCTR_E[sc.e] || ['—'])[0], st:(CUM_SCTR_E[sc.e] || [0, 'gris'])[1] } : 'sin dato', sc && sc.hasta ? _cumF(sc.hasta) : '',
        si(t.ats ? !!t.ats.hoy : null), si(t.charla ? !!t.charla.hoy : null), t.petar ? (t.petar.hoy ? (t.petar.tipo || 'Sí') + (t.petar.aut === false ? ' (sin autorizar)' : '') : 'No') : 'sin dato',
        t.amon ? t.amon.d30 || 0 : '', (t.alto || []).map(function(a){ return a.n + (a.e === 'ok' ? ': cumple' : ': falta ' + (a.falta || []).join(', ')) + (a.hoy ? ' (PETAR de hoy)' : ''); }).join(' · ')];
    });
    var tit = 'Trabajadores de ' + _cumNom(e.nombre || 'la empresa');
    bajarBlob(_cumXls([{ n:'Trabajadores', tit:tit, sub:[e.proyecto, e.ruc ? 'RUC ' + e.ruc : '', 'hoy ' + _cumF(j.hoy || '')].filter(Boolean).join(' · ') + ' · el documento va tapado y del EMO solo su vigencia', cols:cols, filas:filas }], tit),
      _cumArchivo(tit + ' ' + (j.hoy || '')) + '.xlsx');
  });
}
function cumMatrizXls(j){
  _cumConXls(function(){
    var T = j.temas || [], L = _cumMatFiltradas(j), est = j.estandar || {};
    var cols = [{ t:'Trabajador', w:30 }, { t:'Documento', w:12, al:'center' }, { t:'Empresa', w:26 }, { t:'Puesto', w:18 }].concat(T.map(function(t){ return { t:t, w:13, al:'center' }; }));
    var filas = L.map(function(x){ return [{ v:x.nombre, b:1 }, _cumDoc(x.doc), _cumNom(x.empresa || ''), x.puesto || ''].concat(T.map(function(t){
      var c = (x.c || {})[t] || { e:'na' };
      return c.e === 'ok' ? { v:'Al día' + (c.f ? ' · ' + _cumF(c.f) : ''), st:'ok' } : (c.e === 'vence' ? { v:'Vence' + (c.f ? ' · ' + _cumF(c.f) : ''), st:'ojo' } : (c.e === 'falta' ? { v:'Falta', st:'mal' } : { v:'No aplica', st:'gris' }));
    })); });
    var eCols = [{ t:'Puesto', w:28 }, { t:'Lo que pide (además de lo de todos)', w:80 }];
    var eFilas = [[{ v:'Todos', b:1 }, (est.comun || []).join(', ')]].concat(Object.keys(est.puestos || {}).sort().map(function(k){ return [k, (est.puestos[k] || []).join(', ')]; }));
    var tit = 'Matriz de capacitación · ' + _cumObraN();
    var sinD = (j.sin_detalle || []).filter(Boolean);
    bajarBlob(_cumXls([{ n:'Matriz', tit:tit, sub:'Al día: aprobada en los últimos ' + (est.vigencia || 12) + ' meses · vence: en los próximos 30 días · sale de las constancias de cada empresa en OBRASST' +
                         (j.tope ? ' · las primeras 3,000 personas' : '') + (sinD.length ? ' · no salen (comparten solo sus cifras): ' + sinD.map(_cumNom).join(', ') : ''), cols:cols, filas:filas, fijas:1 },
                       { n:'Estándar', tit:'El estándar por puesto', sub:est.propio ? 'El que puso tu equipo' : 'Sin estándar propio: la inducción y los temas más dados, para todos', cols:eCols, filas:eFilas, fijas:0 }], tit),
      _cumArchivo(tit) + '.xlsx');
  });
}
function cumCompXls(K, C){
  _cumConXls(function(){
    var O = K.obras;
    var cols = [{ t:'Contratista', w:34 }, { t:'RUC', w:13, al:'center' }, { t:'Obras', w:8, num:true }, { t:'Gente', w:9, num:true }, { t:'Nota (0 a 100)', w:10, num:true }]
      .concat(O.map(function(o){ return { t:'Nota en ' + o.nombre, w:14, num:true }; }), [{ t:'Capacitación vigente (%)', w:12, num:true }, { t:'EMO vigente (%)', w:11, num:true }, { t:'Levantadas a tiempo (%)', w:12, num:true }, { t:'Obs. vencidas', w:10, num:true }]);
    var filas = C.map(function(c){ return [{ v:c.nombre, b:1 }, c.ruc, c.n, c.gente, c.nota == null ? { v:'sin datos', st:'gris' } : { v:c.nota, st:_cumCl(c.nota, 80, 60) }]
      .concat(O.map(function(o, i){ var x = c.obras[i]; return x ? (x.nota == null ? 'sin nota' : { v:x.nota, st:_cumCl(x.nota, 80, 60) }) : '—'; }), [c.cap == null ? '' : c.cap, c.emo == null ? 'sin dato' : c.emo, c.at == null ? '' : c.at, c.ven]); });
    var tit = 'Comparativo de contratistas de todas tus obras';
    bajarBlob(_cumXls([{ n:'Contratistas', tit:tit, sub:'Hoy · junta por su RUC lo de cada obra; la nota, ponderada por su gente', cols:cols, filas:filas }], tit), _cumArchivo(tit) + '.xlsx');
  });
}

/* ══ EL PDF DEL INFORME CONSOLIDADO (jsPDF) ═══════════════════════════════════════════════════════════════════════ */
function _cumLogo(){
  var de = (typeof empleadorP === 'function' && !(YO && YO.demo) && !(YO && YO.central)) ? empleadorP() : Promise.resolve(null);
  return Promise.resolve(de).catch(function(){ return null; }).then(function(emp){
    var du = emp && emp.logo; if(!du || !/^data:image\/(png|jpe?g)/i.test(String(du))) return null;
    return new Promise(function(res){
      var im = new Image(); im.onload = function(){ res({ du:du, fmt:/png/i.test(du.slice(0, 20)) ? 'PNG' : 'JPEG', r:(im.naturalWidth || 1) / (im.naturalHeight || 1), razon:emp.razon || '' }); };
      im.onerror = function(){ res(null); }; im.src = du;
    });
  });
}
function cumConsolPdf(j){
  var bt = $('cum-c-pdf'); if(bt) bt.disabled = true;
  toast('Armando el PDF…');
  var listo = (typeof cargarEvPDF === 'function') ? cargarEvPDF() : Promise.resolve(true);
  Promise.all([listo, _cumLogo()]).then(function(r){
    var doc = _cumConsolDoc(j, r[1]);
    bajarBlob(doc.output('blob'), _cumArchivo('Informe consolidado ' + _cumObraN() + ' ' + ((j.meses || [])[(j.meses || []).length - 1] || '')) + '.pdf');
  }).catch(function(e){ try{ console.warn('cumple pdf', e); }catch(_w){} toast('No se pudo armar el PDF. Recarga la página e inténtalo otra vez.'); })
    .then(function(){ var b2 = $('cum-c-pdf'); if(b2) b2.disabled = false; });
}
function _cumTxP(s){ return String(s == null ? '' : s).replace(/…/g, '...').replace(/[‘´]/g, '’').replace(/[→➔›]/g, '>').replace(/•/g, '*').replace(/[^\u0000-ÿ–—’“”€\n]/g, ''); }
function _cumConsolDoc(j, logo){
  var J = window.jspdf.jsPDF, doc = new J({ unit:'mm', format:'a4', orientation:'landscape', compress:true });
  var W = 297, H = 210, M = 12, AZ = [11, 42, 58], GR = [94, 110, 121], RY = [205, 213, 220], TI = [27, 42, 51];
  var COL = { s1:[35, 89, 154], s2:[152, 167, 177], s3:[30, 107, 69], s4:[168, 32, 26], s5:[11, 42, 58] };
  var Mm = j.meses || [], tot = j.total || [], ult = tot[tot.length - 1] || {}, m = Mm[Mm.length - 1] || '';
  var ahora = new Date(), gen = _cumDos(ahora.getDate()) + '/' + _cumDos(ahora.getMonth() + 1) + '/' + ahora.getFullYear() + ' ' + _cumDos(ahora.getHours()) + ':' + _cumDos(ahora.getMinutes());
  var f = function(sz, b, c){ doc.setFont('helvetica', b ? 'bold' : 'normal'); doc.setFontSize(sz); doc.setTextColor.apply(doc, c || TI); };
  /* la empresa que lo emite (su razón social, la de su logo) */
  var quien = String((logo && logo.razon) || (typeof empresaDeObraP === 'function' ? empresaDeObraP() : '') || '').trim();
  var cab = function(){
    var x = M;
    if(logo){ var lh = 14, lw = Math.min(40, lh * logo.r); if(lw === 40) lh = 40 / logo.r; try{ doc.addImage(logo.du, logo.fmt, M, 9, lw, lh, 'logo', 'FAST'); x = M + lw + 6; }catch(e){} }
    f(15, true, AZ); doc.text('Informe consolidado de SST', x, 15);
    f(9, false, GR); doc.text(_cumTxP([quien !== _cumObraN() ? quien : '', _cumObraN(), Mm.length > 1 ? _cumMesTx(Mm[0]) + ' a ' + _cumMesTx(m) : _cumMesTx(m)].filter(Boolean).join(' · ')), x, 21);
    f(8, false, GR); doc.text('Generado el ' + gen, W - M, 15, { align:'right' });
    doc.setDrawColor.apply(doc, RY); doc.setLineWidth(0.3); doc.line(M, 26, W - M, 26);
  };
  cab();
  /* las cifras del último mes */
  var IF = ult['if'] != null ? +ult['if'] : _cumIF(ult.acc, ult.hht), IG = ult.ig != null ? +ult.ig : _cumIF(ult.dias, ult.hht), pAt = ult.lev ? Math.round(100 * (ult.a_tiempo || 0) / ult.lev) : null;
  var K = [['Gente', _cumN(ult.gente), ''], ['Horas hombre', ult.hht == null ? '—' : _cumN(ult.hht), ult.hht == null ? 'sin dato' : ''], ['Accidentes incap.', _cumN(ult.acc), +ult.acc_leve === 1 ? '1 leve' : _cumN(ult.acc_leve) + ' leves'], ['IF', _cumDec(IF), 'IG ' + _cumDec(IG)],
           ['Capacitaciones', _cumN(ult.cap), _cumPl(ult.charlas, 'charla', 'charlas')], ['ATS', _cumN(ult.ats), ''], ['Observaciones', _cumN(ult.obs), pAt == null ? '' : pAt + ' % a tiempo'], ['Inspecciones', _cumN(ult.insp), _cumN(ult.epp) + ' EPP']];
  f(8, true, GR); doc.text(_cumTxP(('En ' + _cumMesTx(m)).toUpperCase()), M, 33);
  var bw = (W - 2 * M - 7 * 4) / 8;
  K.forEach(function(k, i){
    var x = M + i * (bw + 4), y = 36;
    doc.setDrawColor.apply(doc, RY); doc.setFillColor(243, 246, 248); doc.roundedRect(x, y, bw, 21, 2, 2, 'FD');
    f(7, false, GR); doc.text(_cumTxP(k[0]), x + 3, y + 5.5);
    f(13, true, TI); doc.text(_cumTxP(k[1]), x + 3, y + 13);
    if(k[2]){ f(7, false, GR); doc.text(_cumTxP(k[2]), x + 3, y + 18); }
  });
  /* los cuatro gráficos */
  var ifs = tot.map(function(x){ return x['if'] != null ? +x['if'] : _cumIF(x.acc, x.hht); });
  var ser = function(k){ return tot.map(function(x){ return x[k] == null ? null : +x[k]; }); };
  var G = [['Observaciones y levantamiento', [['Nuevas', ser('obs'), 's1'], ['Levantadas', ser('lev'), 's2'], ['A tiempo', ser('a_tiempo'), 's3']], 'b'],
           ['Índice de frecuencia (IF)', [['IF', ifs, 's4', true]], 'l'], ['Capacitaciones y charlas', [['Capacitaciones', ser('cap'), 's1'], ['Charlas', ser('charlas'), 's2']], 'b'],
           ['Horas hombre', [['Horas hombre', ser('hht'), 's5']], 'b']];
  var gw = (W - 2 * M - 8) / 2, gh = 60;
  G.forEach(function(g, i){
    var gx = M + (i % 2) * (gw + 8), gy = 64 + Math.floor(i / 2) * (gh + 8);
    doc.setDrawColor.apply(doc, RY); doc.setLineWidth(0.25); doc.roundedRect(gx, gy, gw, gh, 2, 2, 'S');
    f(9, true, AZ); doc.text(_cumTxP(g[0]), gx + 4, gy + 6.5);
    var lx = gx + gw - 4; g[1].slice().reverse().forEach(function(s){ f(7, false, GR); var tw = doc.getTextWidth(_cumTxP(s[0])); doc.text(_cumTxP(s[0]), lx, gy + 6.5, { align:'right' }); doc.setFillColor.apply(doc, COL[s[2]]); doc.rect(lx - tw - 4, gy + 4, 2.8, 2.8, 'F'); lx -= tw + 9; });
    var x0 = gx + 12, x1 = gx + gw - 5, y0 = gy + 12, y1 = gy + gh - 9, n = Mm.length, paso = (x1 - x0) / Math.max(1, n), max = 0;
    g[1].forEach(function(s){ s[1].forEach(function(v){ if(v != null && v > max) max = v; }); });
    doc.setDrawColor.apply(doc, RY); doc.setLineWidth(0.2); doc.line(x0, y1, x1, y1);
    Mm.forEach(function(mm, k){ f(6.5, false, GR); doc.text(_cumTxP(_cumMesTx(mm, true)), x0 + paso * (k + 0.5), y1 + 4.5, { align:'center' }); });
    var Y = function(v){ return y1 - (max ? v / max * (y1 - y0) : 0); };
    if(g[2] === 'l'){
      g[1].forEach(function(s){
        var pts = []; s[1].forEach(function(v, k){ if(v != null) pts.push([x0 + paso * (k + 0.5), Y(v), v]); });
        doc.setDrawColor.apply(doc, COL[s[2]]); doc.setLineWidth(0.6);
        for(var q = 1; q < pts.length; q++) doc.line(pts[q - 1][0], pts[q - 1][1], pts[q][0], pts[q][1]);
        pts.forEach(function(p){ doc.setFillColor.apply(doc, COL[s[2]]); doc.circle(p[0], p[1], 0.9, 'F'); f(6.5, false, TI); doc.text(_cumCorto(p[2], true), p[0], p[1] - 2.2, { align:'center' }); });
      });
    } else {
      var gww = paso * 0.74, bww = gww / g[1].length;
      Mm.forEach(function(mm, k){ g[1].forEach(function(s, si){
        var v = s[1][k]; if(v == null) return;
        var bx = x0 + paso * k + (paso - gww) / 2 + si * bww, by = Y(v);
        doc.setFillColor.apply(doc, COL[s[2]]); if(y1 - by > 0.1) doc.rect(bx + 0.3, by, Math.max(0.8, bww - 0.6), y1 - by, 'F');
        if(g[1].length <= 2 || n <= 6){ f(6, false, TI); doc.text(_cumTxP(_cumCorto(v, s[3])), bx + bww / 2, by - 1.2, { align:'center' }); }
      }); });
    }
  });
  /* la tabla de cada empresa (en la hoja siguiente) */
  doc.addPage('a4', 'landscape'); cab();
  f(10, true, AZ); doc.text(_cumTxP('Cada empresa en ' + _cumMesTx(m)), M, 34);
  var C = [['Empresa', 70, 'l'], ['Gente', 14, 'r'], ['Horas hombre', 22, 'r'], ['Acc.', 12, 'r'], ['Días perd.', 15, 'r'], ['IF', 14, 'r'], ['Capac.', 15, 'r'], ['ATS', 15, 'r'], ['Charlas', 15, 'r'],
           ['Obs.', 13, 'r'], ['A tiempo', 16, 'r'], ['Insp.', 13, 'r'], ['EPP', 14, 'r'], ['Papel.', 15, 'r']];
  var tw = C.reduce(function(s, c){ return s + c[1]; }, 0), k2 = (W - 2 * M) / tw, xs = [], xx = M;
  C.forEach(function(c){ xs.push(xx); xx += c[1] * k2; });
  var y = 38, filaH = 7.2;
  var cabT = function(){ doc.setFillColor.apply(doc, AZ); doc.rect(M, y, W - 2 * M, 7.5, 'F'); f(7.5, true, [255, 255, 255]); C.forEach(function(c, i){ var cx = c[2] === 'r' ? xs[i] + c[1] * k2 - 1.5 : xs[i] + 1.5; doc.text(_cumTxP(c[0]), cx, y + 5, { align:c[2] === 'r' ? 'right' : 'left' }); }); y += 7.5; };
  cabT();
  var filas = (j.empresas || []).map(function(e){ var s = (e.serie || []).filter(function(x){ return x.m === m; })[0] || {}; var at = s.lev ? Math.round(100 * (s.a_tiempo || 0) / s.lev) + ' %' : '—';
    return [_cumNom(e.nombre), _cumN(s.gente), s.hht == null ? '—' : _cumN(s.hht), _cumN(s.acc), _cumN(s.dias), _cumDec(_cumIF(s.acc, s.hht)), _cumN(s.cap), _cumN(s.ats), _cumN(s.charlas), _cumN(s.obs), at, _cumN(s.insp), _cumN(s.epp), _cumN(s.amon)]; });
  filas.push(['Total', _cumN(ult.gente), ult.hht == null ? '—' : _cumN(ult.hht), _cumN(ult.acc), _cumN(ult.dias), _cumDec(IF), _cumN(ult.cap), _cumN(ult.ats), _cumN(ult.charlas), _cumN(ult.obs), pAt == null ? '—' : pAt + ' %', _cumN(ult.insp), _cumN(ult.epp), _cumN(ult.amon)]);
  filas.forEach(function(F, i){
    if(y + filaH > H - 16){ doc.addPage('a4', 'landscape'); cab(); y = 32; cabT(); }
    var tot2 = i === filas.length - 1;
    if(tot2){ doc.setFillColor(232, 238, 242); doc.rect(M, y, W - 2 * M, filaH, 'F'); } else if(i % 2){ doc.setFillColor(248, 250, 251); doc.rect(M, y, W - 2 * M, filaH, 'F'); }
    F.forEach(function(v, c){
      f(7.5, tot2 || c === 0, TI);
      var t = _cumTxP(v); if(c === 0){ while(doc.getTextWidth(t) > C[0][1] * k2 - 3 && t.length > 6) t = t.slice(0, -2); if(t !== _cumTxP(v)) t += '...'; }
      doc.text(t, C[c][2] === 'r' ? xs[c] + C[c][1] * k2 - 1.5 : xs[c] + 1.5, y + 4.8, { align:C[c][2] === 'r' ? 'right' : 'left' });
    });
    doc.setDrawColor.apply(doc, RY); doc.setLineWidth(0.15); doc.line(M, y + filaH, W - M, y + filaH);
    y += filaH;
  });
  y += 6; f(7.5, false, GR);
  doc.text(doc.splitTextToSize(_cumTxP('IF: accidentes incapacitantes por cada millón de horas hombre; IG: días perdidos por cada millón de horas hombre. Sale solo de lo que cada empresa registra en OBRASST: nadie arma nada aparte. Las horas hombre, de su tareo o de su registro de horas.'), W - 2 * M), M, Math.min(y, H - 20));
  /* el pie, en cada hoja */
  var np = doc.getNumberOfPages();
  for(var p = 1; p <= np; p++){ doc.setPage(p); doc.setDrawColor.apply(doc, RY); doc.setLineWidth(0.2); doc.line(M, H - 10, W - M, H - 10); f(7, false, GR); doc.text('OBRASST · Informe consolidado de SST', M, H - 6); doc.text('Página ' + p + ' de ' + np, W - M, H - 6, { align:'right' }); }
  return doc;
}

/* ══ CÓMO SE VE ═══════════════════════════════════════════════════════════════════════════════════════════════════ */
function _cumCss(){
  if($('cum-css')) return;
  var s = document.createElement('style'); s.id = 'cum-css';
  s.textContent = [
    '.rej.cum-cifras{grid-template-columns:repeat(4,minmax(0,1fr))}@media (max-width:1000px){.rej.cum-cifras{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '.cum-filtros{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--raya)}',
    '.cum-filtros input[type=search]{flex:1 1 220px;min-width:0;max-width:340px}.cum-filtros select{width:auto;min-width:160px;max-width:100%}',
    '.cum-cuenta{margin-left:auto;color:var(--gris);font-size:13px;white-space:nowrap}',
    '.cum-chips{display:inline-flex;flex-wrap:wrap;gap:4px;padding:3px;border:1px solid var(--raya);border-radius:10px;background:var(--panel)}',
    '.cum-chip{-webkit-appearance:none;appearance:none;border:0;background:none;cursor:pointer;padding:6px 11px;border-radius:7px;font:inherit;font-size:13px;color:var(--texto)}',
    '.cum-chip b,.cum-chip small{font-weight:600;color:var(--gris);font-variant-numeric:tabular-nums;margin-left:3px}.cum-chip small{font-weight:400}',
    '.cum-chip:hover{background:var(--fondo)}.cum-chip.on{background:var(--tinta);color:#fff}.cum-chip.on b,.cum-chip.on small{color:#CFE0EA}',
    '.cum-chip:focus-visible,.cum-th:focus-visible{outline:2px solid var(--azul);outline-offset:2px}',
    '.cum-check{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;cursor:pointer;margin:0}.cum-check input{width:auto;margin:0}',
    'table.cum-t td{vertical-align:top}table.cum-t th.num,table.cum-t td.num{text-align:right}',
    '.cum-th{-webkit-appearance:none;appearance:none;border:0;background:none;padding:0;font:inherit;font-weight:inherit;color:inherit;cursor:pointer;text-align:inherit;letter-spacing:inherit;text-transform:inherit}',
    'table.cum-emps tbody tr.clic,table.cum-emps tbody tr.clic td{cursor:pointer}.cum-solo{display:inline-block;margin-top:4px;font-size:11.5px;font-weight:500;color:var(--gris);background:var(--fondo);border:1px solid var(--raya);border-radius:999px;padding:1px 8px}table.cum-emps td:first-child{min-width:165px;max-width:230px}table.cum-trabs td:first-child{min-width:170px;max-width:220px}',
    'table.cum-trabs th,table.cum-trabs td{padding-left:6px;padding-right:6px}table.cum-trabs td:nth-child(2){min-width:110px;max-width:170px}table.cum-trabs td:last-child{min-width:122px;max-width:190px}',
    'table.cum-trabs .cum-alto{font-size:11.5px;padding:2px 7px}',
    /* si no cabe (una pantalla angosta), la tabla se corre adentro de su caja y el nombre queda fijo a la izquierda */
    'table.cum-fija th:first-child,table.cum-fija td:first-child{position:sticky;left:0;z-index:1}table.cum-fija td:first-child{background:var(--panel)}table.cum-fija th:first-child{background:#FAFBFC}table.cum-fija tbody tr:hover td:first-child{background:#FAFBFC}',
    'table.cum-emps th,table.cum-consol th{font-size:11px;letter-spacing:.02em}table.cum-consol th,table.cum-consol td{padding-left:7px;padding-right:7px}',
    'table.cum-t th{white-space:normal;line-height:1.25;vertical-align:bottom}table.cum-emps th.num{min-width:56px}table.cum-trabs th{min-width:44px}',
    'table.cum-t th,table.cum-t td{padding-left:8px;padding-right:8px}table.cum-t th:first-child,table.cum-t td:first-child{padding-left:14px}table.cum-t th:last-child,table.cum-t td:last-child{padding-right:14px}',
    '.cum-en{color:var(--tinta);font-weight:600}.cum-sub{display:block;color:var(--gris);font-size:12px;font-weight:400;margin-top:2px;line-height:1.35}',
    '.cum-gris{color:var(--gris);font-size:12.5px}.cum-nw{white-space:nowrap}.cum-ir{color:var(--gris);font-size:18px;vertical-align:middle!important}',
    '.cum-mal{color:var(--mal)}td.cum-mal b,td.cum-ojo b{color:inherit}.cum-ojo{color:var(--ojo)}',
    '.cum-pc{display:inline-block;text-align:right}.cum-pc b{font-variant-numeric:tabular-nums;white-space:nowrap}.cum-pc small{display:block;color:var(--gris);font-size:11.5px;font-weight:400;line-height:1.3}',
    '.cum-pc.ok b{color:var(--ok)}.cum-pc.ojo b{color:var(--ojo)}.cum-pc.mal b{color:var(--mal)}.cum-pc.gris b{color:var(--gris)}',
    '.cum-barra{display:inline-block;vertical-align:middle;width:48px;height:7px;border-radius:99px;background:var(--fondo);overflow:hidden;margin-right:7px;box-shadow:inset 0 0 0 1px var(--raya)}',
    '.cum-barra i{display:block;height:100%;border-radius:99px;background:var(--ok)}.cum-barra.ojo i{background:var(--ojo)}.cum-barra.mal i{background:var(--mal)}',
    '.cum-nota{font-variant-numeric:tabular-nums;color:var(--tinta)}',
    '.cum-si{color:var(--ok);font-weight:700}.cum-no{color:var(--mal);font-weight:700}',
    '.cum-alto{display:inline-block;font-size:12px;font-weight:600;padding:2px 8px;border-radius:999px;margin:0 4px 3px 0;white-space:nowrap}',
    '.cum-alto.ok{background:var(--ok-f);color:var(--ok)}.cum-alto.mal{background:var(--mal-f);color:var(--mal)}.cum-alto.hoy{box-shadow:inset 0 0 0 1.5px currentColor}',
    'tr.cum-f-mal td:first-child{box-shadow:inset 3px 0 0 var(--mal)}tr.cum-f-ojo td:first-child{box-shadow:inset 3px 0 0 var(--ojo)}',
    '.cum-pie{color:var(--gris);font-size:12.5px;line-height:1.55;max-width:90ch;margin:6px 2px 18px}',
    '.cum-h3{font-size:14px;margin:18px 0 8px}.cum-h3 small{font-weight:400;color:var(--gris);font-size:12.5px}',
    /* el QR */
    '.cum-qr-f .campo{margin:0 0 10px;max-width:560px}.cum-qr-bt{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 10px}.cum-qr-f .ayuda{max-width:80ch}',
    '.cum-ej{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:13px;color:var(--gris);margin:8px 0 0}.cum-ej .cum-chip{border:1px dashed var(--raya2)}',
    '.cum-cam{display:grid;gap:8px;max-width:420px;margin-top:10px}.cum-cam video{width:100%;border-radius:12px;background:#000;aspect-ratio:4/3;object-fit:cover}.cum-cam .bt{justify-self:start}',
    '.cum-qv{overflow:hidden}.cum-qv-b{display:flex;align-items:center;gap:14px;padding:16px 18px;color:#fff;background:var(--gris)}',
    '.cum-qv.ok .cum-qv-b{background:var(--ok)}.cum-qv.ojo .cum-qv-b{background:#9A6700}.cum-qv.mal .cum-qv-b{background:var(--mal)}',
    '.cum-qv-b b{display:block;font-size:19px;font-weight:700;line-height:1.2}.cum-qv-b small{display:block;font-size:13.5px;opacity:.95;margin-top:2px}',
    '.cum-qv-i{flex:none;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.2);display:grid;place-items:center;font-size:22px;font-weight:800}',
    '.cum-qv-quien{display:grid;gap:2px}.cum-qv-quien b{font-size:17px;color:var(--tinta)}.cum-qv-quien span{color:var(--gris);font-size:13.5px}',
    '.cum-qv-mira{font-size:12.5px;color:var(--gris);margin:8px 0 12px}',
    '.cum-qv-l{list-style:none;margin:0;padding:0;display:grid;gap:2px}.cum-qv-l li{display:flex;gap:10px;align-items:flex-start;padding:8px 2px;border-top:1px solid var(--raya);font-size:14px;line-height:1.4}',
    '.cum-qv-l li:first-child{border-top:0}.cum-qv-li{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:800;color:#fff;background:var(--gris2)}',
    '.cum-qv-l li.ok .cum-qv-li{background:var(--ok)}.cum-qv-l li.ojo .cum-qv-li{background:var(--ojo)}.cum-qv-l li.mal .cum-qv-li{background:var(--mal)}.cum-qv-l li.mal{color:var(--mal);font-weight:600}',
    /* la matriz */
    '.cum-mz-caja{max-height:68vh}table.cum-matriz{border-collapse:separate;border-spacing:0}table.cum-matriz th,table.cum-matriz td{padding:6px 8px}',
    'table.cum-matriz thead th{position:sticky;top:0;z-index:2;background:var(--panel)}table.cum-matriz .cum-mz-q{position:sticky;left:0;z-index:1;background:var(--panel);min-width:200px;max-width:260px}',
    '@media (max-width:640px){table.cum-matriz .cum-mz-q{min-width:150px;max-width:170px}}table.cum-matriz thead .cum-mz-q{z-index:3}table.cum-matriz tfoot td{position:sticky;bottom:0;background:var(--fondo);font-weight:600;border-top:2px solid var(--raya)}',
    '.cum-mz-t{min-width:70px;max-width:100px;vertical-align:bottom;white-space:normal;line-height:1.25;font-size:12px;text-transform:none;letter-spacing:0;color:var(--texto)}',
    'td.cum-mz,i.cum-mz{text-align:center;font-weight:700;font-style:normal;font-size:13px}td.cum-mz.ok,i.cum-mz.ok{color:var(--ok);background:var(--ok-f)}td.cum-mz.vence,i.cum-mz.vence{color:var(--ojo);background:var(--ojo-f)}',
    'td.cum-mz.falta,i.cum-mz.falta{color:var(--mal);background:var(--mal-f)}td.cum-mz.na,i.cum-mz.na{color:var(--gris2);background:transparent}',
    'td.cum-mz-pc{text-align:center;font-size:12.5px;font-variant-numeric:tabular-nums}td.cum-mz-pc.ok{color:var(--ok)}td.cum-mz-pc.ojo{color:var(--ojo)}td.cum-mz-pc.mal{color:var(--mal)}',
    '.cum-ley{display:inline-flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--gris)}.cum-ley span{display:inline-flex;align-items:center;gap:5px}.cum-ley i.cum-mz{display:inline-grid;place-items:center;width:20px;height:18px;border-radius:4px;font-size:11px}',
    '.cum-est{display:grid;gap:8px}.cum-est-f{display:grid;grid-template-columns:minmax(120px,220px) minmax(0,1fr);gap:10px;align-items:center}.cum-est-f label{margin:0;font-size:13.5px}',
    '.cum-est-nuevo{margin-top:10px;padding-top:10px;border-top:1px dashed var(--raya2)}@media (max-width:640px){.cum-est-f{grid-template-columns:minmax(0,1fr)}}',
    /* el consolidado */
    '.cum-c-cab{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:0 0 14px}.cum-mes{display:flex;align-items:center;gap:8px}.cum-mes b{min-width:150px;text-align:center;font-size:15px}',
    '.cum-dos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 18px}@media (max-width:1000px){.cum-dos{grid-template-columns:minmax(0,1fr)}}',
    '.cum-graf .tarj-cuerpo{padding-top:4px}.cum-g{display:block;width:100%;height:auto;max-width:100%}',
    '.cum-g-guia{stroke:var(--raya);stroke-width:1}.cum-g-mes,.cum-g-eje{fill:var(--gris);font-size:11px;font-family:inherit}.cum-g-v{fill:var(--texto);font-size:10.5px;font-family:inherit;font-variant-numeric:tabular-nums}',
    '.cum-g-b.s1,.cum-g-ley i.s1{fill:var(--azul);background:var(--azul)}.cum-g-b.s2,.cum-g-ley i.s2{fill:var(--gris2);background:var(--gris2)}.cum-g-b.s3,.cum-g-ley i.s3{fill:var(--ok);background:var(--ok)}',
    '.cum-g-b.s5,.cum-g-ley i.s5{fill:var(--tinta);background:var(--tinta)}.cum-g-l{fill:none;stroke-width:2.5;stroke-linejoin:round}.cum-g-l.s4{stroke:var(--mal)}.cum-g-p.s4{fill:var(--mal);stroke:var(--panel);stroke-width:2}',
    '.cum-g-ley{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--gris)}.cum-g-ley span{display:inline-flex;align-items:center;gap:5px}.cum-g-ley i{width:10px;height:10px;border-radius:2px;display:inline-block}',
    'table.cum-consol td:first-child{min-width:180px}.tarj>.cum-pie{margin:10px 16px 14px}',
    'table.cum-consol th{white-space:normal;line-height:1.3;vertical-align:bottom}.cum-total td{font-weight:700;border-top:2px solid var(--raya);background:var(--fondo)}',
    'table.cum-comp th.cum-comp-o{max-width:110px;white-space:normal;line-height:1.25}table.cum-comp td:first-child,table.cum-obras td:first-child{min-width:150px}',
    '@media print{.cum-filtros,.acciones,.cum-c-cab .cum-chips{display:none!important}.cum-mz-caja{max-height:none}}'
  ].join('\n');
  document.head.appendChild(s);
}
