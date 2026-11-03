/* ══════════════════════════════════════════════════════════════════
   OBRASST OS en el portal (2/11/2026): Para Gerencia, OBRASST Score,
   riesgo SUNAFIL con el grafo de bloqueos del día, Compliance Engine
   (lo que le falta a cada trabajador según su cargo), Contractor Hub,
   Pasaporte SST, Marketplace SST, Plan Estado (cuadro ≤ 8 UIT) y los
   ajustes. Cada parte se ve solo si su interruptor está prendido para
   esta empresa (os_cfg → modulos). Todo sale del servidor
   (sql/2026-11-02-obrasst-os.sql): aquí no se calcula nada que importe.
   ════════════════════════════════════════════════════════════════ */
var OS = { caja:null, tab:'ger', cfg:null, obra:null, cat:null, n:0, cot:null };
var OS_TABS = [['ger', 'Para Gerencia', 'executive_ceo_dashboard'], ['score', 'OBRASST Score', 'obrasst_score'], ['riesgo', 'Riesgo SUNAFIL', 'risk_engine'],
  ['comp', 'Compliance Engine', 'compliance_engine'], ['cont', 'Contratistas', 'contractor_hub'], ['pas', 'Pasaporte SST', 'pasaporte_sst'],
  ['mkt', 'Marketplace SST', 'marketplace_sst'], ['est', 'Plan Estado™', 'plan_estado'], ['prov', 'Proveedores', 'ally_10_verticals_erp'], ['aj', 'Ajustes', null]];
/* 2/11/2026 · los 9 rubros con ERP de servicios: la pestaña «Proveedores» sale cuando al menos uno está encendido */
var OS_SRV = ['sctr', 'consultor', 'residuos', 'emo', 'maquinaria', 'izaje', 'laboratorio', 'transporte', 'saneamiento'];
var OS_RUBROS = [['epp', 'EPP y consignación'], ['sctr', 'SCTR'], ['emo', 'Exámenes médicos (EMO)'], ['consultor', 'Consultoría y capacitación SSOMA'],
  ['residuos', 'Residuos (EO-RS) y reciclaje'], ['maquinaria', 'Maquinaria pesada'], ['izaje', 'Izajes, andamios y extintores'],
  ['laboratorio', 'Monitoreos y calibración'], ['transporte', 'Transporte de personal'], ['saneamiento', 'Saneamiento y catering']];
var OS_DEPS = ['AMAZONAS', 'ANCASH', 'APURIMAC', 'AREQUIPA', 'AYACUCHO', 'CAJAMARCA', 'CALLAO', 'CUSCO', 'HUANCAVELICA', 'HUANUCO', 'ICA', 'JUNIN',
  'LA LIBERTAD', 'LAMBAYEQUE', 'LIMA', 'LORETO', 'MADRE DE DIOS', 'MOQUEGUA', 'PASCO', 'PIURA', 'PUNO', 'SAN MARTIN', 'TACNA', 'TUMBES', 'UCAYALI'];
var OS_MOTIVO = { sin_sesion:'Tu sesión se cerró. Vuelve a entrar.', no_eres_de_la_obra:'No eres parte de esta obra.', modulo_apagado:'Esta parte de OBRASST OS no está activa para tu empresa.',
  solo_gestor:'Eso lo cambia el dueño o el gestor de la obra.', sin_plan_cumple:'El control de contratistas viene con Contractor Hub™ (y con Mandante y Estado).',
  sin_plan_estado:'Esto viene con el Plan Estado™, el plan para las entidades del Estado.',
  falta_consentimiento:'Marca que el trabajador aceptó: sin su consentimiento no se emite.', no_existe:'Eso ya no está.', muy_seguido:'Espera un momento y vuelve a intentarlo.',
  rubros:'Elige al menos un rubro.', departamento:'Elige el departamento.', cargo:'Elige un cargo de la lista.', tamano:'Elige el tamaño.', accion:'No se pudo: recarga la página.' };
/* V7.1 (2/11/2026) · Marcelo: «Plan Estado, ¿no debería salir solo cuando nos contraten?». Sí: la pestaña «Plan Estado™»
   es de quien contrató el Plan Estado™ (las entidades del Estado: el peldaño 4 de la cadena), no de toda empresa. Lo dice
   el servidor en os_cfg (plan_estado_ok); con un servidor de antes, vale el tipo de cuenta del portal ('fis'). */
function _osEstadoOk(c){
  if(c && typeof c.plan_estado_ok === 'boolean') return c.plan_estado_ok;
  return typeof cuentaTipo === 'function' && cuentaTipo() === 'fis';
}
function _osMsg(j){ return (j && OS_MOTIVO[j.motivo]) || 'No se pudo. Revisa tu conexión e inténtalo otra vez.'; }
function _osSoles(n){ return 'S/ ' + (Math.round((+n || 0) * 100) / 100).toLocaleString('es-PE', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function _osPct(a, b){ return b ? Math.round(100 * a / b) + ' %' : '—'; }
function _osRpc(fn, p){ return sbRpc(fn, { p:Object.assign({ emp:OS.obra }, p || {}) }); }
function _osCss(){
  if($('os-css')) return;
  var s = document.createElement('style'); s.id = 'os-css';
  s.textContent = '.os-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}.os-tabs button{border:1px solid var(--raya,#d6dde3);background:var(--panel,#fff);color:inherit;border-radius:999px;padding:7px 13px;font:inherit;font-size:13px;cursor:pointer}' +
    '.os-tabs button.on{background:var(--tinta,#0b2a3a);color:#fff;border-color:transparent}.os-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:0 0 14px}' +
    '.os-kpi{border:1px solid var(--raya,#d6dde3);border-radius:12px;padding:12px 14px;background:var(--panel,#fff)}.os-kpi small{display:block;color:var(--gris,#6b7c88);font-size:12px}' +
    '.os-kpi b{display:block;font-size:24px;margin:4px 0 2px;font-variant-numeric:tabular-nums}.os-kpi span{font-size:12px;color:var(--gris,#6b7c88)}.os-ok{color:#1e8e5a}.os-ojo{color:#8a5200}.os-mal{color:#c6323a}' +
    '.os-chip{display:inline-block;border-radius:999px;padding:2px 8px;font-size:12px;margin:2px 4px 2px 0;background:#fbe9ea;color:#8f1d24}.os-chip.ojo{background:#fbf3e4;color:#8a5200}' +
    '.os-nota{font-size:56px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}.os-barra{height:8px;border-radius:4px;background:#e3e8ec;overflow:hidden}.os-barra i{display:block;height:100%;background:#1e8e5a}' +
    '.os-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.os-sub{color:var(--gris,#6b7c88);font-size:13px;margin:4px 0 10px}' +
    '@media print{body *{visibility:hidden}#os-cuadro,#os-cuadro *{visibility:visible}#os-cuadro{position:absolute;left:0;top:0;width:100%}}';
  document.head.appendChild(s);
}
function osVista(caja){
  _osCss(); OS.caja = caja;
  var oid = (YO.obra || {}).id;
  if(OS.obra !== oid){ OS.obra = oid; OS.cfg = null; OS.tab = 'ger'; OS.cot = null; }
  if(window.OS_PIDE) OS.tab = 'mkt';   /* V7 · llegó un RQ del Marketplace SST (index.html: OS_PIDE) */
  if(window.OS_TAB_IR){ OS.tab = window.OS_TAB_IR; window.OS_TAB_IR = null; }   /* V7 · «Pedir» de la barra de abajo del celular */
  caja.innerHTML = '<div class="vacio">Cargando…</div>';
  _osRpc('os_cfg').then(function(c){
    if(!c || !c.ok){ caja.innerHTML = '<div class="aviso">' + esc(_osMsg(c)) + '</div>'; return; }
    OS.cfg = c;
    var T = OS_TABS.filter(function(t){ return (!t[2] || (c.modulos || {})[t[2]]) && (t[0] !== 'prov' || OS_SRV.some(function(v){ return (c.modulos || {})['aliado_' + v]; })) && (t[0] !== 'est' || _osEstadoOk(c)); });
    if(!T.some(function(t){ return t[0] === OS.tab; })) OS.tab = T[0][0];
    caja.innerHTML = '<div class="os-tabs" role="tablist">' + T.map(function(t){ return '<button type="button" role="tab" data-os-tab="' + t[0] + '" class="' + (OS.tab === t[0] ? 'on' : '') + '" aria-selected="' + (OS.tab === t[0]) + '">' + esc(t[1]) + '</button>'; }).join('') +
      '</div><div id="os-cuerpo"></div>';
    caja.onclick = _osClic; caja.onchange = _osCambio;
    osPintar();
  }, function(){ caja.innerHTML = '<div class="aviso">' + esc(_osMsg(null)) + '</div>'; });
}
function osPintar(){
  var c = $('os-cuerpo'); if(!c) return;
  [].forEach.call(document.querySelectorAll('[data-os-tab]'), function(b){ var on = b.getAttribute('data-os-tab') === OS.tab; b.className = on ? 'on' : ''; b.setAttribute('aria-selected', String(on)); });
  c.innerHTML = '<div class="vacio">Cargando…</div>';
  var n = ++OS.n, f = { ger:_osGer, score:_osScore, riesgo:_osRiesgo, comp:_osComp, cont:_osCont, pas:_osPas, mkt:_osMkt, est:_osEst, prov:_osProv, aj:_osAj }[OS.tab];
  f(function(h){ if(n === OS.n && $('os-cuerpo')) $('os-cuerpo').innerHTML = h; });
}
/* 2/11/2026 · V7 · el RQ que llegó del Marketplace SST (marketplace.html): todo marcado, a 1 clic de «Pedir que me conecten» */
function _osMktPide(){
  var P = window.OS_PIDE; if(!P || !$('os-dep')) return;
  window.OS_PIDE = null;
  try{ sessionStorage.removeItem('sstp_mkt_pide'); history.replaceState(null, '', location.pathname + location.hash); }catch(_h){}
  [].forEach.call(document.querySelectorAll('[data-os-rubro]'), function(c){ c.checked = (P.r || []).indexOf(c.getAttribute('data-os-rubro')) >= 0; });
  if(P.d && OS_DEPS.indexOf(P.d) >= 0) $('os-dep').value = P.d;
  if(P.det) $('os-det').value = P.det;
  var m = $('os-mkt-msg'); if(m){ m.className = 'msg'; m.textContent = 'Llegó del Marketplace SST: revisa y toca «Pedir que me conecten».'; }
  var b = document.querySelector('[data-os-acc="mkt-pedir"]'); if(b) b.focus();
}
function _osFuera(j){ return '<div class="aviso">' + esc(_osMsg(j)) + '</div>'; }
function _osKpi(t, v, s, cl){ return '<div class="os-kpi"><small>' + esc(t) + '</small><b class="' + (cl || '') + '">' + v + '</b><span>' + esc(s || '') + '</span></div>'; }
var OS_NIVEL = { alto:['ALTO', 'os-mal'], medio:['MEDIO', 'os-ojo'], bajo:['BAJO', 'os-ok'], sin_datos:['SIN DATOS', ''] };

/* Para Gerencia: los 6 indicadores */
function _osGer(listo){
  _osRpc('os_gerencia').then(function(j){
    if(!j || !j.ok) return listo(_osFuera(j));
    var s = j.score, pc = s && s.percentil, ct = j.contratistas, ri = j.riesgo, nv = OS_NIVEL[(ri || {}).nivel] || ['—', ''];
    listo('<p class="os-sub">Hoy, ' + esc(fechaLarga(j.hoy)) + ' · con lo que tu empresa registra en OBRASST (' + (j.gente || 0) + ' personas activas).</p><div class="os-kpis">' +
      _osKpi('OBRASST Score', s && s.nota != null ? s.nota + ' / 100' : '—', pc ? 'Top ' + pc.top + ' % de ' + pc.n + ' empresas' : 'Sin comparativo todavía', s && s.nota >= 80 ? 'os-ok' : s && s.nota >= 60 ? 'os-ojo' : 'os-mal') +
      _osKpi('Contratistas al día', ct ? ct.ok + ' / ' + ct.tot : '—', ct ? _osPct(ct.ok, ct.tot) + ' habilitadas' : 'Viene con Contractor Hub™', ct && ct.ok === ct.tot ? 'os-ok' : 'os-ojo') +
      _osKpi('EMO vigentes', j.emo ? _osPct(j.emo.ok, j.emo.tot) : '—', j.emo ? j.emo.ok + ' de ' + j.emo.tot + ' personas' : 'No se lleva en OBRASST', j.emo && j.emo.ok === j.emo.tot ? 'os-ok' : 'os-ojo') +
      _osKpi('SCTR vigentes', j.sctr ? _osPct(j.sctr.ok, j.sctr.tot) : '—', j.sctr ? j.sctr.ok + ' de ' + j.sctr.tot + ' personas' : 'No se lleva en OBRASST', j.sctr && j.sctr.ok === j.sctr.tot ? 'os-ok' : 'os-ojo') +
      _osKpi('Incidentes del mes', String(j.incidentes.total), j.incidentes.incap + (j.incidentes.incap === 1 ? ' incapacitante' : ' incapacitantes'), j.incidentes.incap ? 'os-mal' : 'os-ok') +
      _osKpi('Riesgo SUNAFIL', nv[0], ri && ri.soles ? 'Multa posible hoy: ' + _osSoles(ri.soles) : 'Sin multa posible por lo registrado', nv[1]) + '</div>' +
      '<p class="os-sub">Toca cada pestaña para ver el detalle y qué resolver primero.</p>');
  }, function(){ listo(_osFuera(null)); });
}
/* OBRASST Score */
function _osScore(listo){
  _osRpc('os_score').then(function(j){
    if(!j || !j.ok) return listo(_osFuera(j));
    var P = { capacitacion:'Capacitación vigente', emo:'EMO vigente', induccion:'Inducción', ats:'ATS de hoy', charla:'Charla de hoy' }, pc = j.percentil;
    listo('<div class="os-cols"><div class="tarj" style="padding:16px"><small class="os-sub">Tu empresa hoy</small><div class="os-nota">' + (j.nota != null ? j.nota : '—') + '<small style="font-size:20px">/100</small></div>' +
      (pc ? '<p><b>' + (pc.pct >= 80 ? 'Top 20 %: ' : '') + 'mejor que el ' + pc.pct + ' % de ' + (pc.n - 1) + ' empresas</b> ' + esc({ sector_tamano:'de tu sector y tamaño', sector:'de tu sector', todas:'en OBRASST' }[pc.base] || '') + '.</p>'
          : '<p class="os-sub">El comparativo aparece cuando hay al menos 5 empresas para comparar.</p>') + '</div>' +
      '<div class="tarj" style="padding:16px">' + Object.keys(j.partes || {}).map(function(k){ var v = j.partes[k];
        return '<div style="margin:0 0 10px"><div style="display:flex;justify-content:space-between"><span>' + esc(P[k] || k) + '</span><b>' + v + ' %</b></div><div class="os-barra"><i style="width:' + Math.max(0, Math.min(100, v)) + '%"></i></div></div>'; }).join('') +
      '</div></div><p class="os-sub">' + esc(j.como) + '</p>');
  }, function(){ listo(_osFuera(null)); });
}
/* Riesgo SUNAFIL + los bloqueos del día */
function _osRiesgo(listo){
  Promise.all([_osRpc('os_riesgo'), _osRpc('os_grafo')]).then(function(r){
    var j = r[0], g = r[1]; if(!j || !j.ok) return listo(_osFuera(j));
    var nv = OS_NIVEL[j.nivel] || ['—', ''], G = { grave:'Grave', muy_grave:'Muy grave', leve:'Leve' };
    var h = '<div class="tarj" style="padding:16px;margin:0 0 14px"><small class="os-sub">Riesgo de multa</small><div style="font-size:28px;font-weight:700" class="' + nv[1] + '">' + nv[0] +
      (j.soles ? ' · ' + _osSoles(j.soles) : '') + '</div><p class="os-sub">' + (j.uit ? j.uit + ' UIT con la UIT de S/ ' + Number(j.uit_valor).toLocaleString('es-PE') : 'Por lo que registras en OBRASST, hoy no hay multa posible.') + '</p></div>';
    if(g && g.ok && (g.bloqueos || []).length) h += '<div class="aviso" style="border-color:#c6323a"><b>No deberían empezar hoy:</b><ul style="margin:6px 0 0 18px">' + g.bloqueos.map(function(b){
      return '<li><b>' + esc(b.nombre) + '</b> — ' + esc(b.tareas.join(', ')) + ': ' + esc(b.motivos.join(' · ')) + '</li>'; }).join('') + '</ul></div>';
    if((j.partidas || []).length) h += '<div class="tabla-caja"><table><thead><tr><th>Lo que falta</th><th>D.S. 019-2006-TR</th><th>Gravedad</th><th class="num">Personas</th><th class="num">UIT</th><th class="num">Soles</th></tr></thead><tbody>' +
      j.partidas.map(function(p){ return '<tr><td>' + esc(p.t) + '<div class="os-sub" style="margin:2px 0 0">' + esc((p.quien || []).map(function(q){ return q.nombre; }).join(', ')) + '</div></td><td>art. ' + esc(p.art) + '</td><td>' + esc(G[p.grav] || p.grav) +
        '</td><td class="num">' + p.afectados + '</td><td class="num">' + p.uit + '</td><td class="num">' + _osSoles(p.soles) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    h += '<p class="os-sub">' + (j.supuestos || []).map(esc).join(' ') + '</p>' + ((j.no_evaluado || []).length ? '<p class="os-sub"><b>No se evalúa aquí:</b> ' + j.no_evaluado.map(esc).join(' · ') + '</p>' : '') +
      '<p class="os-sub">¿Tu empresa está en el REMYPE como micro o pequeña? Cámbialo en «Ajustes» y el cálculo usa su escala.</p>';
    listo(h);
  }, function(){ listo(_osFuera(null)); });
}
/* Compliance Engine: lo que le falta a cada uno según su cargo */
function _osComp(listo){
  Promise.all([_osRpc('os_brechas'), OS.cat ? Promise.resolve(OS.cat) : sbRpc('os_catalogo', { p:{} })]).then(function(r){
    var j = r[0]; OS.cat = r[1]; if(!j || !j.ok) return listo(_osFuera(j));
    var R = j.resumen || {}, T = R.por_tipo || {}, puede = OS.cfg && OS.cfg.puede, cargos = [];
    ((OS.cat || {}).sectores || []).forEach(function(s){ s.cargos.forEach(function(c){ cargos.push([c.k, s.n + ' · ' + c.n]); }); });
    var h = '<div class="os-kpis">' + _osKpi('Personas', String(R.total || 0), (R.con_brecha || 0) + ' con algo pendiente', R.con_brecha ? 'os-ojo' : 'os-ok') +
      [['emo', 'EMO'], ['sctr', 'SCTR'], ['capacitacion', 'Capacitación'], ['hab', 'Habilitaciones'], ['epp', 'EPP']].map(function(x){ return _osKpi(x[1], String(T[x[0]] || 0), 'pendientes', T[x[0]] ? 'os-mal' : 'os-ok'); }).join('') + '</div>';
    if(R.sin_cargo) h += '<div class="aviso">' + R.sin_cargo + (R.sin_cargo === 1 ? ' persona tiene un puesto' : ' personas tienen un puesto') + ' que no se reconoce: elige su cargo en la tabla y se usa para todos los de ese puesto.</div>';
    h += '<div class="tabla-caja"><table><thead><tr><th>Trabajador</th><th>Cargo</th><th>Le falta</th></tr></thead><tbody>' + (j.gente || []).map(function(w){
      return '<tr><td><b>' + esc(w.nombre) + '</b><div class="os-sub" style="margin:0">' + esc(w.puesto || '') + '</div></td><td>' +
        (puede ? '<select data-os-puesto="' + esc(w.puesto || '') + '" aria-label="Cargo de ' + esc(w.puesto || '') + '"><option value="">' + (w.cargo ? '(sin cambiar)' : 'Elegir cargo…') + '</option>' +
          cargos.map(function(c){ return '<option value="' + esc(c[0]) + '"' + (w.cargo && w.cargo.k === c[0] ? ' selected' : '') + '>' + esc(c[1]) + '</option>'; }).join('') + '</select>'
          : esc(w.cargo ? w.cargo.n : 'Sin cargo')) + '</td><td>' +
        ((w.faltan || []).length ? w.faltan.map(function(f){ return '<span class="os-chip' + (f.tipo === 'epp' ? ' ojo' : '') + '" title="' + esc(f.norma || '') + '">' + esc(f.t.split(' · ')[0]) + '</span>'; }).join('') : '<span class="os-ok">Al día</span>') +
        '</td></tr>'; }).join('') + '</tbody></table></div><p class="os-sub">' + esc(j.como) + '</p>';
    listo(h);
  }, function(){ listo(_osFuera(null)); });
}
/* Contractor Hub */
function _osCont(listo){
  _osRpc('os_contratistas').then(function(j){
    if(!j || !j.ok) return listo(_osFuera(j));
    listo('<div class="os-kpis">' + _osKpi('Contratistas habilitadas', j.habilitadas + ' / ' + j.total, 'nota de ' + j.min + ' o más', j.habilitadas === j.total ? 'os-ok' : 'os-ojo') + '</div>' +
      '<div class="tabla-caja"><table><thead><tr><th>Empresa</th><th class="num">Nota</th><th>Estado</th><th class="num">EMO</th><th class="num">SCTR</th><th class="num">Capacitación</th></tr></thead><tbody>' +
      (j.empresas || []).map(function(e){ var c = e.cap || {}, m = e.emo, s = e.sctr;
        return '<tr><td><b>' + esc(e.nombre) + '</b></td><td class="num">' + (e.nota != null ? e.nota : '—') + '</td><td>' + (e.habilitada ? '<span class="os-ok">Habilitada</span>' : '<span class="os-mal">No habilitada</span>') +
          '</td><td class="num">' + (m ? _osPct((m.ok || 0) + (m.vence || 0), m.tot) : '—') + '</td><td class="num">' + (s ? _osPct(s.ok || 0, s.tot) : '—') + '</td><td class="num">' + _osPct(c.ok || 0, c.tot) + '</td></tr>'; }).join('') +
      '</tbody></table></div><p class="os-sub">' + esc(j.como) + '</p>');
  }, function(){ listo(_osFuera(null)); });
}
/* Pasaporte SST */
function _osPas(listo){
  Promise.all([_osRpc('os_pasaportes'), _osRpc('os_brechas')]).then(function(r){
    var j = r[0], b = r[1]; if(!j || !j.ok) return listo(_osFuera(j));
    var con = {}; (j.lista || []).forEach(function(x){ con[x.trab] = x; });
    var puede = OS.cfg && OS.cfg.puede;
    listo('<p class="os-sub">Un QR por trabajador: quien lo escanea ve sus capacitaciones, la vigencia de su EMO y su SCTR, y sus habilitaciones. Del examen médico solo sale la vigencia. ' +
      'Se emite con el consentimiento del trabajador (Ley 29733) y se puede revocar cuando él lo pida.</p><div class="tabla-caja"><table><thead><tr><th>Trabajador</th><th>Pasaporte</th></tr></thead><tbody>' +
      ((b && b.ok && b.gente) || []).map(function(w){ var p = con[w.id];
        return '<tr><td><b>' + esc(w.nombre) + '</b></td><td>' + (p ? '<a href="' + esc(p.enlace) + '" target="_blank" rel="noopener">Abrir su pasaporte</a> <button type="button" class="bt sec chico" data-os-qr="' + esc(p.enlace) + '">Ver QR</button>' +
          (puede ? ' <button type="button" class="bt sec chico" data-os-revocar="' + esc(w.id) + '">Revocar</button>' : '') :
          (puede ? '<label style="font-size:13px"><input type="checkbox" data-os-cons="' + esc(w.id) + '"> El trabajador aceptó</label> <button type="button" class="bt chico" data-os-emitir="' + esc(w.id) + '">Emitir</button>' : '<span class="os-sub">Sin pasaporte</span>')) +
          '<div id="os-qr-' + esc(w.id) + '"></div></td></tr>'; }).join('') + '</tbody></table></div>');
  }, function(){ listo(_osFuera(null)); });
}
/* Marketplace SST */
function _osMkt(listo){
  _osRpc('os_necesidades').then(function(j){
    if(!j || !j.ok) return listo(_osFuera(j));
    var E = { nueva:'Recibida', conectada:'Conectada', cerrada:'Cerrada' };
    listo('<div class="tarj" style="padding:16px;margin:0 0 14px"><h3 style="margin:0 0 6px">¿Qué necesita resolver tu empresa?</h3><p class="os-sub">Marca los rubros y OBRASST te conecta con los aliados de tu departamento.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px 14px;margin:0 0 10px">' + OS_RUBROS.map(function(r){ return '<label style="font-size:14px"><input type="checkbox" data-os-rubro="' + r[0] + '"> ' + esc(r[1]) + '</label>'; }).join('') + '</div>' +
      '<div class="campo-dos"><div class="campo"><label for="os-dep">Departamento</label><select id="os-dep">' + OS_DEPS.map(function(d){ return '<option' + (d === 'LIMA' ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="os-det">Detalle (opcional)</label><input id="os-det" maxlength="600" placeholder="Por ejemplo: 40 cascos y EMO de ingreso para 12 personas"></div></div>' +
      '<button type="button" class="bt" data-os-acc="mkt-pedir">Pedir que me conecten</button><p class="msg" id="os-mkt-msg"></p></div>' +
      ((j.lista || []).length ? '<div class="tabla-caja"><table><thead><tr><th>Lo que pediste</th><th>Estado</th><th>Aliados</th></tr></thead><tbody>' + j.lista.map(function(n){
        return '<tr><td>' + esc(n.rubros.map(function(r){ var x = OS_RUBROS.filter(function(y){ return y[0] === r; })[0]; return x ? x[1] : r; }).join(', ')) + ' · ' + esc(n.departamento) +
          (n.detalle ? '<div class="os-sub" style="margin:0">' + esc(n.detalle) + '</div>' : '') + '</td><td>' + esc(E[n.estado] || n.estado) + (n.nota ? '<div class="os-sub" style="margin:0">' + esc(n.nota) + '</div>' : '') +
          '</td><td>' + esc((n.aliados || []).map(function(a){ return a.razon; }).join(', ') || '—') + '</td></tr>'; }).join('') + '</tbody></table></div>' : ''));
    _osMktPide();
  }, function(){ listo(_osFuera(null)); });
}
/* Plan Estado: el cuadro comparativo ≤ 8 UIT */
function _osEst(listo){
  _osRpc('os_estado_cotizaciones').then(function(j){
    if(!j || !j.ok) return listo(_osFuera(j));
    var h = '<p class="os-sub">Contrataciones menores (Ley 32069, art. 34.1: hasta 8 UIT, sin procedimiento de selección): pide cotización a los aliados desde tu requerimiento y aquí sale el cuadro comparativo, con el RNP de cada uno y sin comisión.</p>';
    if(!(j.lista || []).length) return listo(h + '<div class="vacio">Todavía no pediste cotizaciones. Se piden desde «Requerimientos» (botón «Pedir cotización»).</div>');
    listo(h + '<div class="tabla-caja"><table><thead><tr><th>Solicitud</th><th class="num">Ítems</th><th class="num">Ofertas</th><th></th></tr></thead><tbody>' + j.lista.map(function(c){
      return '<tr><td>' + esc(c.numero ? 'RQ ' + c.numero : 'Solicitud') + '</td><td class="num">' + c.items + '</td><td class="num">' + c.ofertas + '</td><td><button type="button" class="bt sec chico" data-os-cuadro="' + esc(c.id) + '">Ver cuadro</button></td></tr>'; }).join('') +
      '</tbody></table></div><div id="os-cuadro"></div>');
  }, function(){ listo(_osFuera(null)); });
}
function osCuadro(cot){
  var c = $('os-cuadro'); if(!c) return;
  c.innerHTML = '<div class="vacio">Cargando…</div>';
  _osRpc('os_estado_cuadro', { cot:cot }).then(function(j){
    if(!j || !j.ok){ c.innerHTML = _osFuera(j); return; }
    OS.cuadro = j; osCuadroPinta();
  }, function(){ c.innerHTML = _osFuera(null); });
}
/* V7 (2/11/2026) · «solo con RNP vigente» (marcado de entrada): la entidad compra a quien puede contratar con el Estado */
function osCuadroPinta(){
  var c = $('os-cuadro'), j = OS.cuadro; if(!c || !j) return;
  var solo = OS.soloRnp !== false, todas = j.ofertas || [], ver = solo ? todas.filter(function(o){ return o.rnp && o.rnp_vigente; }) : todas, fuera = todas.length - ver.length;
    c.innerHTML = '<div class="tarj" style="padding:16px;margin-top:14px"><h3 style="margin:0 0 4px">Cuadro comparativo · ' + esc(j.numero ? 'RQ ' + j.numero : 'Solicitud') + '</h3><p class="os-sub">' + esc(j.base) + ' Tope: ' + _osSoles(j.tope) + '. Comisión de OBRASST: 0 %.</p>' +
      '<label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:0 0 10px"><input type="checkbox" id="os-solo-rnp"' + (solo ? ' checked' : '') + '> Solo proveedores con RNP vigente' +
        (solo && fuera ? ' <span class="os-sub" style="margin:0">(' + fuera + (fuera === 1 ? ' oferta sin RNP vigente, oculta' : ' ofertas sin RNP vigente, ocultas') + ')</span>' : '') + '</label>' +
      '<div class="tabla-caja"><table><thead><tr><th>Proveedor</th><th>RUC</th><th>RNP</th><th class="num">Total</th><th class="num">Plazo</th><th>¿Hasta 8 UIT?</th></tr></thead><tbody>' + (ver.length ? '' : '<tr><td colspan="6" class="os-sub">Ninguna oferta' + (solo ? ' con RNP vigente' : '') + ' todavía.</td></tr>') + ver.map(function(o){
        var rn = o.rnp; return '<tr><td>' + esc(o.aliado) + '</td><td>' + esc(o.ruc || '') + '</td><td>' + (rn ? esc(rn.numero) + (rn.verificado ? ' · verificado' : ' · declarado') + (o.rnp_vigente ? '' : ' · <span class="os-mal">vencido</span>') : '<span class="os-ojo">Sin RNP</span>') +
          '</td><td class="num">' + (o.total != null ? _osSoles(o.total) : '—') + '</td><td class="num">' + (o.dias != null ? o.dias + ' días' : '—') + '</td><td>' + (o.total == null ? '—' : o.cabe ? 'Sí' : '<span class="os-mal">No</span>') + '</td></tr>'; }).join('') +
      '</tbody></table></div><button type="button" class="bt sec" data-os-acc="imprimir">Imprimir el cuadro</button></div>';
}
/* Proveedores (2/11/2026 · ERP de servicios de los aliados): lo que le entregan sus proveedores (constancias de SCTR, aptitudes de EMO,
   certificados de inspección y calibración, fichas de equipos, informes), cada uno con su QR de verificación */
function _osF(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
var OS_RES = { apto:'Apto', apto_restr:'Apto con restricciones', no_apto:'No apto', aprobado:'Aprobado', rechazado:'Rechazado', conforme:'Conforme', no_conforme:'No conforme' };
function _osProv(listo){
  _osRpc('os_docs_proveedor').then(function(j){
    if(!j || !j.ok) return listo(_osFuera(j));
    var E = { nuevo:['Por revisar', 'os-ojo'], aceptado:['Aceptado', 'os-ok'], rechazado:['Rechazado', 'os-mal'] }, L = j.lista || [], nuevos = L.filter(function(d){ return d.estado === 'nuevo'; }).length;
    var vert = function(v){ var x = OS_RUBROS.filter(function(r){ return r[0] === v; })[0]; return x ? x[1] : v; };
    var h = '<p class="os-sub">Lo que te entregan tus proveedores aliados de OBRASST: constancias de SCTR, aptitudes de EMO, certificados de inspección y calibración, fichas de equipos e informes. Cada uno se verifica con su QR.</p>' +
      '<div class="os-kpis">' + _osKpi('Por revisar', String(nuevos), 'documentos nuevos', nuevos ? 'os-ojo' : 'os-ok') + _osKpi('Vigentes', String(L.filter(function(d){ return d.vigente; }).length), 'de ' + L.length + ' recibidos') + '</div>';
    if(!L.length) h += '<div class="vacio">Todavía no te llegó ninguno. Cuando un proveedor aliado te entregue un certificado por OBRASST, aparece aquí.</div>';
    else h += '<div class="tabla-caja"><table><thead><tr><th>Documento</th><th>Proveedor</th><th>Vigencia</th><th>Estado</th><th></th></tr></thead><tbody>' + L.map(function(d){
      var r = d.resumen || {}, c = r.contenido || {}, e = E[d.estado] || [d.estado, ''], det = [vert(d.vertical)];
      if(c.trabajador && c.trabajador.nombre) det.push(c.trabajador.nombre + ' ' + (c.trabajador.doc || ''));
      if(r.resultado) det.push(OS_RES[r.resultado] || r.resultado);
      return '<tr><td><b>' + esc(d.titulo) + '</b><div class="os-sub" style="margin:0">' + esc(det.join(' · ')) + '</div></td><td>' + esc(d.aliado) + '</td><td>' +
        (d.anulado ? '<span class="os-mal">Anulado</span>' : d.vigente ? '<span class="os-ok">' + (d.hasta ? 'Hasta ' + _osF(d.hasta) : 'Vigente') + '</span>' : '<span class="os-mal">Venció ' + _osF(d.hasta) + '</span>') + '</td>' +
        '<td><span class="' + e[1] + '">' + esc(e[0]) + '</span>' + (d.motivo ? '<div class="os-sub" style="margin:0">' + esc(d.motivo) + '</div>' : '') + '</td><td style="white-space:nowrap">' +
        (/^https:\/\/obrasstapp\.com\/certificado\.html\?k=[0-9a-f]{32}$/.test(r.enlace || '') ? '<a href="' + esc(r.enlace) + '" target="_blank" rel="noopener">Verificar</a> ' : '') +
        (j.puede && d.estado === 'nuevo' ? '<button type="button" class="bt chico" data-os-doc="' + esc(d.id) + '" data-os-doc-acc="aceptar">Aceptar</button> <button type="button" class="bt sec chico" data-os-doc="' + esc(d.id) + '" data-os-doc-acc="rechazar">Rechazar</button>' : '') +
        (j.puede && !(j.bloqueados || []).some(function(b){ return b.aliado_id === d.aliado_id; }) ? ' <button type="button" class="bt sec chico" data-os-doc="' + esc(d.id) + '" data-os-doc-acc="bloquear" title="Dejar de recibir lo de este proveedor">No recibir más</button>' : '') +
        '</td></tr>'; }).join('') + '</tbody></table></div>';
    if((j.bloqueados || []).length) h += '<div class="tarj" style="padding:14px;margin-top:14px"><h3 style="margin:0 0 6px">Ya no te entregan</h3>' + j.bloqueados.map(function(b){ return '<p style="margin:4px 0">' + esc(b.aliado) +
      (j.puede ? ' <button type="button" class="bt sec chico" data-os-desbloquear="' + esc(b.aliado_id) + '">Volver a recibir</button>' : '') + '</p>'; }).join('') + '</div>';
    if(!j.puede && L.length) h += '<p class="os-sub">Aceptar o rechazar lo hace el dueño o el gestor de la obra.</p>';
    listo(h);
  }, function(){ listo(_osFuera(null)); });
}
function _osDoc(id, acc){
  var pide = acc === 'aceptar' ? Promise.resolve('') : preguntar(acc === 'rechazar' ? 'Rechazar el documento' : 'No recibir más de este proveedor',
    acc === 'rechazar' ? 'Tu proveedor ve que lo rechazaste y el motivo.' : 'Sus documentos ya no te llegan por OBRASST. Lo puedes revertir cuando quieras.',
    { etiqueta:'Motivo', minimo:acc === 'rechazar' ? 3 : 0, corto:'Escribe el motivo.', maximo:300 }, { si:acc === 'rechazar' ? 'Rechazar' : 'No recibir más', mal:true });
  pide.then(function(m){ if(m === null) return;
    _osRpc('os_doc_proveedor_responder', { id:id, accion:acc, motivo:m }).then(function(j){ if(!j || !j.ok) return toast(_osMsg(j));
      toast(acc === 'aceptar' ? 'Aceptado.' : acc === 'rechazar' ? 'Rechazado.' : 'Listo: ya no te llega nada de ese proveedor.'); osPintar(); }); });
}
/* Ajustes */
function _osAj(listo){
  var c = OS.cfg || {}, dis = c.puede ? '' : ' disabled';
  Promise.resolve(OS.cat || sbRpc('os_catalogo', { p:{} })).then(function(cat){
    OS.cat = cat;
    listo('<div class="tarj" style="padding:16px;max-width:640px">' +
      '<div class="campo"><label for="os-tam">Tamaño de la empresa (para la escala de multas)</label><select id="os-tam"' + dis + '>' + [['no_mype', 'No MYPE'], ['pequena', 'Pequeña empresa (REMYPE)'], ['micro', 'Microempresa (REMYPE)']].map(function(t){
        return '<option value="' + t[0] + '"' + (c.tamano === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="os-sec">Sector</label><select id="os-sec"' + dis + '><option value="">Sin elegir</option>' + (((cat || {}).sectores) || []).map(function(s){
        return '<option value="' + esc(s.k) + '"' + (c.sector === s.k ? ' selected' : '') + '>' + esc(s.n) + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="os-sctr">¿Tu actividad está en el Anexo 5 del D.S. 003-98-SA (SCTR obligatorio)?</label><select id="os-sctr"' + dis + '><option value="">Según el sector</option><option value="si"' + (c.sctr === true ? ' selected' : '') +
        '>Sí, para todo el personal</option><option value="no"' + (c.sctr === false ? ' selected' : '') + '>No</option></select></div>' +
      '<label style="display:block;margin:0 0 12px"><input type="checkbox" id="os-red"' + (c.pasaporte_red ? ' checked' : '') + dis + '> Mis registros se pueden ver en el Pasaporte SST de mi gente cuando trabaja en otra empresa (con su consentimiento)</label>' +
      (c.puede ? '<button type="button" class="bt" data-os-acc="aj-guardar">Guardar</button>' : '<p class="os-sub">Esto lo cambia el dueño o el gestor de la obra.</p>') + '<p class="msg" id="os-aj-msg"></p></div>');
  });
}
function _osClic(ev){
  var t = ev.target.closest ? ev.target.closest('[data-os-tab],[data-os-acc],[data-os-emitir],[data-os-revocar],[data-os-qr],[data-os-cuadro],[data-os-doc],[data-os-desbloquear]') : null; if(!t) return;
  if(t.hasAttribute('data-os-tab')){ OS.tab = t.getAttribute('data-os-tab'); osPintar(); return; }
  if(t.hasAttribute('data-os-doc')){ _osDoc(t.getAttribute('data-os-doc'), t.getAttribute('data-os-doc-acc')); return; }
  if(t.hasAttribute('data-os-desbloquear')){ _osRpc('os_doc_proveedor_responder', { accion:'desbloquear', aliado:t.getAttribute('data-os-desbloquear') }).then(function(j){
    if(!j || !j.ok) return toast(_osMsg(j)); toast('Listo: vuelves a recibir sus documentos.'); osPintar(); }); return; }
  if(t.hasAttribute('data-os-cuadro')){ osCuadro(t.getAttribute('data-os-cuadro')); return; }
  if(t.hasAttribute('data-os-qr')){ var u = t.getAttribute('data-os-qr'), id = t.closest('td').querySelector('[id^="os-qr-"]');
    cargarQRLib().then(function(){ var q = qrcode(0, 'M'); q.addData(u); q.make(); id.innerHTML = '<img alt="QR del pasaporte" width="150" height="150" src="' + q.createDataURL(4, 2) + '">'; }, function(){ toast('No se pudo dibujar el QR.'); }); return; }
  if(t.hasAttribute('data-os-emitir')){ var w = t.getAttribute('data-os-emitir'), cb = document.querySelector('[data-os-cons="' + w + '"]');
    _osRpc('os_pasaporte_emitir', { trab:w, consiente:!!(cb && cb.checked) }).then(function(j){ if(!j || !j.ok) return toast(_osMsg(j)); toast('Pasaporte emitido.'); osPintar(); }); return; }
  if(t.hasAttribute('data-os-revocar')){ var r = t.getAttribute('data-os-revocar');
    confirmar('¿Revocar el pasaporte?', 'Su QR deja de mostrar sus datos desde ahora.', { si:'Sí, revocar', mal:true }).then(function(si){ if(!si) return;
      _osRpc('os_pasaporte_revocar', { trab:r }).then(function(j){ if(!j || !j.ok) return toast(_osMsg(j)); toast('Pasaporte revocado.'); osPintar(); }); }); return; }
  var a = t.getAttribute('data-os-acc');
  if(a === 'imprimir') window.print();
  else if(a === 'mkt-pedir'){
    var rs = [].map.call(document.querySelectorAll('[data-os-rubro]:checked'), function(x){ return x.getAttribute('data-os-rubro'); }), m = $('os-mkt-msg');
    t.disabled = true;
    _osRpc('os_necesidad_crear', { rubros:rs, departamento:$('os-dep').value, detalle:$('os-det').value }).then(function(j){
      t.disabled = false;
      if(!j || !j.ok){ m.className = 'msg mal'; m.textContent = _osMsg(j); return; }
      toast('Listo: OBRASST te conecta con ' + (j.aliados_hoy ? 'los ' + j.aliados_hoy + ' aliados de tu zona.' : 'los aliados de tu zona.')); osPintar();
    }, function(){ t.disabled = false; m.className = 'msg mal'; m.textContent = _osMsg(null); });
  }
  else if(a === 'aj-guardar'){
    var s = $('os-sctr').value, m2 = $('os-aj-msg');
    _osRpc('os_cfg_guardar', { tamano:$('os-tam').value, sector:$('os-sec').value, sctr:s === 'si' ? true : s === 'no' ? false : null, pasaporte_red:$('os-red').checked }).then(function(j){
      if(!j || !j.ok){ m2.className = 'msg mal'; m2.textContent = _osMsg(j); return; }
      OS.cfg = j; m2.className = 'msg ok'; m2.textContent = 'Guardado.';
    });
  }
}
function _osCambio(ev){
  var t = ev.target;
  if(t && t.id === 'os-solo-rnp'){ OS.soloRnp = !!t.checked; osCuadroPinta(); return; }
  if(!t || !t.hasAttribute || !t.hasAttribute('data-os-puesto') || !t.value) return;
  _osRpc('os_puesto_cargo_guardar', { puesto:t.getAttribute('data-os-puesto'), cargo:t.value }).then(function(j){
    if(!j || !j.ok) return toast(_osMsg(j)); toast('Cargo guardado para ese puesto.'); osPintar();
  });
}
