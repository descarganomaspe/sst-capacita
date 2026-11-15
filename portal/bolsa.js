/* ══ OBRASST · BOLSA DE TRABAJO SST · el lado de la empresa (tanda 5 · 15/11/2026) ══════════════════════════════════════
   Reemplaza a la maqueta de la Orden 30 (13/11), que trabajaba con datos de ejemplo guardados en el navegador. Ahora todo va
   por el servidor (sql/2026-11-15-bolsa-real.sql), con la obra elegida arriba (YO.obra.id) como la empresa que busca:
     bt_empresa_panel, bt_candidatos, bt_vacante_guardar, bt_vacante_estado, bt_invitar, bt_invitacion_retirar y
     bt_postulacion_estado (el servidor revisa que la cuenta sea de esa obra, o dueña de la empresa de la que cuelga).
   Marcelo (15/11): antes de que el candidato acepte una invitación, la empresa ve solo su cargo, sus años y su distrito (y sus
   sectores, su disponibilidad y si tiene la constancia de la Academia, sin folio). Al aceptar, ESA empresa ve su nombre, su
   celular, su correo, su resumen y el folio de su constancia, que cualquiera comprueba en verificar.html.
   El candidato arma su perfil en la Academia (portal/cursos.js), con su permiso marcado (Ley N.° 29733).
   Ley N.° 26772, modificada por la Ley N.° 27270: la oferta de empleo no puede tener requisitos que discriminen por raza, sexo,
   religión, opinión, origen social, condición económica, estado civil, edad o de cualquier índole. Al publicar, se avisa si el
   texto parece pedir algo así (no se adivina: se le pregunta a quien publica). */

var BTE = { caja:null, emp:'', tab:'cand', gen:0, cargado:false, error:'', panel:null, cands:null,
            filtro:{ cargo:'', sector:'', departamento:'' } };
var BTE_CARGOS = ['Supervisor SST', 'Prevencionista de riesgos', 'Jefe de seguridad', 'Ingeniero de seguridad', 'Coordinador SSOMA', 'Asistente SSOMA', 'Monitor de seguridad'];
var BTE_SECTORES = ['Construcción', 'Minería', 'Hidrocarburos', 'Industria', 'Energía', 'Pesca', 'Agricultura', 'Transporte y logística', 'Oficinas y servicios'];
var BTE_DEPS = ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
  'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'];
var BTE_MOD_VAC = ['Presencial', 'Mixta', 'Remota'];
var BTE_MOD_ENT = ['Virtual', 'Presencial', 'Por teléfono'];

function _bteEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; });
}
function _bteOpts(L, sel, vacio){
  return (vacio ? '<option value="">' + _bteEsc(vacio) + '</option>' : '') +
    L.map(function(v){ return '<option' + (v === sel ? ' selected' : '') + '>' + _bteEsc(v) + '</option>'; }).join('');
}
/* la fecha de hoy en Lima (las entrevistas no pueden ser antes) */
function _bteHoy(){
  try{ return new Date().toLocaleDateString('en-CA', { timeZone:'America/Lima' }); }catch(e){ return (typeof hoyISO === 'function') ? hoyISO() : new Date().toISOString().slice(0, 10); }
}
function _bteFecha(iso){
  if(!iso) return '';
  var s = String(iso).slice(0, 10).split('-');
  return s.length === 3 ? s[2] + '/' + s[1] + '/' + s[0] : String(iso);
}
/* un momento (timestamptz) como fecha de Lima */
function _bteDia(ts){
  if(!ts) return '';
  try{ var d = new Date(ts); if(!isNaN(d)) return d.toLocaleDateString('es-PE', { timeZone:'America/Lima', day:'2-digit', month:'2-digit', year:'numeric' }); }catch(e){}
  return _bteFecha(ts);
}
function _bteNum(n){ var x = Number(n); return isFinite(x) ? (Math.round(x * 10) / 10).toString().replace('.', ',') : '0'; }
function _bteObra(){ try{ return (typeof nombreObraP === 'function' ? nombreObraP() : '') || (YO.obra && YO.obra.nombre) || ''; }catch(e){ return ''; } }

function _bteCss(){
  if(document.getElementById('bte-css')) return;
  var s = document.createElement('style'); s.id = 'bte-css';
  s.textContent = [
    '.bte-wrap{display:grid;gap:14px}',
    '.bte-ley{padding:10px 14px;border-radius:10px;background:rgba(37,99,168,.08);border:1px solid rgba(37,99,168,.28);font-size:13px;line-height:1.45;margin-top:10px}',
    '.bte-tabs{display:flex;gap:4px;border-bottom:1px solid var(--raya,#E3E8EC);overflow-x:auto;margin:0 0 12px}',
    '.bte-tabs button{border:0;background:transparent;padding:10px 12px;min-height:44px;font:inherit;font-size:14px;font-weight:600;color:var(--gris,#6B7C88);cursor:pointer;border-bottom:3px solid transparent;white-space:nowrap}',
    '.bte-tabs button[aria-pressed="true"]{color:var(--tinta,#0B2A3A);border-bottom-color:#F5B700}',
    '.bte-lista{display:grid;gap:10px}',
    '.bte-card{padding:12px 14px;border-radius:12px;border:1px solid var(--raya,#E3E8EC);background:var(--tarj,#fff);display:grid;gap:7px}',
    '.bte-card.apagada,.bte-lista>.apagada{opacity:.72}',
    '.bte-cab{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:baseline;justify-content:space-between}',
    '.bte-cab b{font-size:15px}',
    '.bte-datos{margin:0;font-size:13.5px;line-height:1.45}',
    '.bte-req{margin:0;font-size:13px;line-height:1.45;color:var(--gris,#6B7C88);white-space:pre-line}',
    '.bte-chips{display:flex;flex-wrap:wrap;gap:4px}',
    '.bte-chip{display:inline-block;padding:2px 8px;font-size:12px;border-radius:6px;background:var(--fondo,#F1F4F7);border:1px solid var(--raya,#E3E8EC)}',
    '.bte-cons{margin:0;font-size:13px}',
    '.bte-contacto{padding:8px 12px;border-radius:8px;background:var(--fondo,#f6f8fa);border:1px dashed var(--raya2,#CBD4DB);font-size:13.5px;line-height:1.45;display:grid;gap:3px}',
    '.bte-contacto.abierto{border-style:solid;border-color:#BFE3CE;background:rgba(30,142,90,.07)}',
    '.bte-acc{display:flex;flex-wrap:wrap;gap:8px}.bte-acc .bt{min-height:40px}',
    '.bte-filtros{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;align-items:end;margin-bottom:10px}',
    '.bte-filtros label{font-size:12.5px;color:var(--gris,#6B7C88);display:grid;gap:3px}',
    '.bte-filtros input,.bte-filtros select{min-height:40px}',
    '.bte-nota{padding:10px 12px;border-radius:10px;background:var(--ojo-f,#FFF6E0);border:1px solid #EBD7AE;font-size:13.5px}',
    '.bte-f{display:grid;gap:10px}.bte-f .campo{display:grid;gap:4px}.bte-f label{font-size:13.5px;font-weight:600}',
    '.bte-f input,.bte-f select,.bte-f textarea{min-height:42px;font-size:15px;width:100%;box-sizing:border-box}',
    '.bte-fila{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}',
    '.bte-aviso{padding:10px 12px;border-radius:10px;border:1px solid #E7B3B6;background:rgba(180,35,24,.06);font-size:13.5px;line-height:1.45}',
    '.bte-pie{font-size:12.5px;color:var(--gris,#6B7C88);line-height:1.45;margin:12px 0 0}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ══ entrada (portal/index.html → btIr('vistaBolsaTrabajo', caja)) ══ */
function vistaBolsaTrabajo(caja){
  _bteCss();
  BTE.caja = caja;
  var ac = $('acciones'); if(ac) ac.innerHTML = '';
  var emp = (window.YO && YO.obra && YO.obra.id) ? String(YO.obra.id) : '';
  if(emp !== BTE.emp){ BTE.emp = emp; BTE.tab = 'cand'; BTE.filtro = { cargo:'', sector:'', departamento:'' }; }
  BTE.cargado = false; BTE.error = ''; BTE.panel = null; BTE.cands = null;
  if(!emp){ _btePintar(); return; }
  cargando(caja);
  _bteCargar();
}
function _bteCargar(){
  var gen = ++BTE.gen, emp = BTE.emp;
  return Promise.all([sbRpc('bt_empresa_panel', { p_emp:emp }), sbRpc('bt_candidatos', { p_emp:emp, p:BTE.filtro })]).then(function(x){
    if(gen !== BTE.gen || emp !== BTE.emp) return;
    var a = x[0] || {}, b = x[1] || {};
    BTE.cargado = true;
    if(!a.ok){ BTE.error = a.motivo === 'sin_permiso' ? 'sin_permiso' : 'error'; }
    else { BTE.error = ''; BTE.panel = a; BTE.cands = b.ok ? (b.candidatos || []) : []; }
    _btePintar();
  }, function(){
    if(gen !== BTE.gen) return;
    BTE.cargado = true; BTE.error = 'red'; _btePintar();
  });
}
function _bteVivas(){ return ((BTE.panel && BTE.panel.vacantes) || []).filter(function(v){ return v.estado === 'activa'; }); }

function _btePintar(){
  var caja = BTE.caja;
  if(!caja || !document.body.contains(caja)) return;
  /* el título y lo que es la Bolsa ya los pone el portal arriba (la cabecera de la vista) */
  var h = '<div class="bte-wrap" id="bte-raiz"><div class="tarj"><div class="tarj-cuerpo">' +
    '<p style="margin:0;font-size:14px;line-height:1.45">Alumnos de la Academia OBRASST que buscan trabajo como supervisores, prevencionistas o jefes de seguridad. ' +
    'Antes de que acepten tu invitación a entrevista, ves su cargo, sus años y su distrito.</p>' +
    (BTE.emp ? '<p class="tenue" style="margin:6px 0 0;font-size:13px">Publicas e invitas como: <b>' + _bteEsc(_bteObra()) + '</b></p>' : '') +
    '<div class="bte-ley" role="note" id="bte-ley"><b>Sin discriminación (Ley N.° 26772, modificada por la Ley N.° 27270):</b> una oferta de empleo no puede pedir ' +
    'requisitos que discriminen por raza, sexo, religión, opinión, origen social, condición económica, estado civil, edad o de cualquier índole. ' +
    'Pide lo que el puesto necesita: experiencia, cursos, disponibilidad.</div></div></div>';
  h += '<div class="tarj"><div class="tarj-cuerpo" id="bte-cuerpo">';
  if(!BTE.emp){
    h += '<div class="vacio"><b>Elige una obra arriba</b>La Bolsa trabaja con la obra o la empresa que tengas elegida.</div>';
  } else if(!BTE.cargado){
    h += '<div class="vacio">Cargando…</div>';
  } else if(BTE.error === 'sin_permiso'){
    h += '<div class="vacio"><b>Tu cuenta no está en esta obra</b>Pide a quien la administra que te agregue a su equipo, o elige otra obra arriba.</div>';
  } else if(BTE.error){
    h += '<div class="vacio"><b>No se pudo abrir la Bolsa</b>Revisa tu conexión e inténtalo otra vez.<div style="margin-top:10px"><button type="button" class="bt" id="bte-otra">Intentar otra vez</button></div></div>';
  } else {
    var P = BTE.panel || {}, vivas = _bteVivas();
    var nPost = (P.postulaciones || []).filter(function(s){ return s.estado === 'nueva'; }).length;
    var nEnt = (P.invitaciones || []).filter(function(i){ return i.estado === 'enviada' || i.estado === 'aceptada'; }).length;
    var tabs = [['cand', 'Candidatos'], ['vac', 'Mis vacantes' + (vivas.length ? ' (' + vivas.length + ')' : '')],
                ['post', 'Postulaciones' + (nPost ? ' (' + nPost + (nPost === 1 ? ' nueva)' : ' nuevas)') : '')], ['ent', 'Entrevistas' + (nEnt ? ' (' + nEnt + ')' : '')]];
    h += '<div class="bte-tabs" role="group" aria-label="Bolsa de trabajo">' + tabs.map(function(t){
      return '<button type="button" id="bte-tab-' + t[0] + '" data-bte-tab="' + t[0] + '" aria-pressed="' + (BTE.tab === t[0]) + '">' + _bteEsc(t[1]) + '</button>';
    }).join('') + '</div>';
    h += BTE.tab === 'vac' ? _bteVacHtml() : BTE.tab === 'post' ? _btePostHtml() : BTE.tab === 'ent' ? _bteEntHtml() : _bteCandHtml();
    h += '<p class="bte-pie">Los datos de cada candidato son para este proceso de selección: no los compartas ni los uses para otra cosa ' +
         '(Ley N.° 29733, de Protección de Datos Personales). El candidato puede ocultar o borrar su perfil cuando quiera.</p>';
  }
  h += '</div></div></div>';
  caja.innerHTML = h;
  _bteEnlazar();
}

/* ── la ficha de un candidato, como la deja ver el servidor ── */
function _bteFicha(f, acciones, cabExtra){
  f = f || {};
  var cons = f.constancias || [];
  var h = '<div class="bte-card" data-bte-pid="' + _bteEsc(f.pid) + '"><div class="bte-cab"><b>' + _bteEsc(f.cargo) + '</b>' + (cabExtra || '') + '</div>' +
    '<p class="bte-datos">' + _bteEsc(_bteNum(f.anios)) + ' años de experiencia · ' + _bteEsc([f.distrito, f.departamento].filter(Boolean).join(', ')) +
    (f.disponibilidad ? ' · Disponibilidad: ' + _bteEsc(f.disponibilidad) : '') + '</p>' +
    ((f.sectores || []).length ? '<div class="bte-chips">' + f.sectores.map(function(s){ return '<span class="bte-chip">' + _bteEsc(s) + '</span>'; }).join('') + '</div>' : '');
  if(cons.length){
    h += '<p class="bte-cons">📜 Constancia de la Academia OBRASST: ' + cons.map(function(c){
      return _bteEsc(c.curso) + (c.folio ? ' · folio <a href="./verificar.html?f=' + encodeURIComponent(c.folio) + '" target="_blank" rel="noopener">' + _bteEsc(c.folio) + '</a>' +
        (c.nota != null ? ' (' + _bteEsc(c.nota) + ' %)' : '') : '');
    }).join('; ') + '</p>';
  }
  if(f.acepto){
    h += '<div class="bte-contacto abierto"><b>' + _bteEsc(f.nombre) + '</b>' +
      (f.telefono ? '<span>📞 <a href="tel:' + _bteEsc(String(f.telefono).replace(/[^\d+]/g, '')) + '">' + _bteEsc(f.telefono) + '</a></span>' : '') +
      (f.correo ? '<span>✉️ <a href="mailto:' + _bteEsc(f.correo) + '">' + _bteEsc(f.correo) + '</a></span>' : '') +
      (f.resumen ? '<span class="bte-req">' + _bteEsc(f.resumen) + '</span>' : '') + '</div>';
  } else {
    h += '<div class="bte-contacto">🔒 Nombre y contacto: los ves cuando acepte tu invitación a entrevista.</div>';
  }
  return h + (acciones ? '<div class="bte-acc">' + acciones + '</div>' : '') + '</div>';
}
function _bteBotonInvitar(pid, vac){
  if(!_bteVivas().length) return '';
  return '<button type="button" class="bt" data-bte-inv="' + _bteEsc(pid) + '"' + (vac ? ' data-bte-vac="' + _bteEsc(vac) + '"' : '') + '>Invitar a entrevista</button>';
}

/* ── pestaña Candidatos ── */
function _bteCandHtml(){
  var F = BTE.filtro, L = BTE.cands || [];
  var h = '<form class="bte-filtros" id="bte-filtros">' +
    '<label>Cargo<input id="bte-f-cargo" list="bte-cargos" maxlength="60" value="' + _bteEsc(F.cargo) + '" placeholder="Supervisor SST"></label>' +
    '<datalist id="bte-cargos">' + BTE_CARGOS.map(function(x){ return '<option value="' + _bteEsc(x) + '">'; }).join('') + '</datalist>' +
    '<label>Sector<select id="bte-f-sector">' + _bteOpts(BTE_SECTORES, F.sector, 'Todos') + '</select></label>' +
    '<label>Departamento<select id="bte-f-dep">' + _bteOpts(BTE_DEPS, F.departamento, 'Todos') + '</select></label>' +
    '<button type="submit" class="bt" id="bte-buscar">Buscar</button></form>';
  if(!_bteVivas().length) h += '<p class="bte-nota" id="bte-sin-vac">Para invitar a alguien, primero publica una vacante en «Mis vacantes».</p>';
  if(!L.length){
    return h + '<div class="vacio"><b>Todavía no hay candidatos a la vista' + (F.cargo || F.sector || F.departamento ? ' con esos filtros' : '') + '</b>' +
      'La Bolsa se llena con los alumnos de la Academia OBRASST que deciden mostrar su perfil.</div>';
  }
  return h + '<div class="bte-lista" id="bte-cands">' + L.map(function(f){
    return _bteFicha(f, _bteBotonInvitar(f.pid), f.acepto ? '<span class="pill ok">Aceptó una entrevista contigo</span>' : '');
  }).join('') + '</div>';
}

/* ── pestaña Mis vacantes ── */
function _bteEstadoPill(e){
  return e === 'activa' ? '<span class="pill ok">Activa</span>' : e === 'pausada' ? '<span class="pill ojo">Pausada</span>' : '<span class="pill gris">Cerrada</span>';
}
function _bteVacHtml(){
  var L = (BTE.panel && BTE.panel.vacantes) || [];
  var h = '<div class="bte-acc" style="margin-bottom:10px"><button type="button" class="bt" id="bte-vac-nueva">Publicar una vacante</button></div>';
  if(!L.length) return h + '<div class="vacio"><b>Todavía no publicaste vacantes</b>Publica una y la ven los alumnos de la Academia que buscan trabajo; ' +
                           'también puedes invitar directo desde «Candidatos».</div>';
  return h + '<div class="bte-lista" id="bte-vacs">' + L.map(function(v){
    var acc = '<button type="button" class="bt sec" data-bte-vac-edit="' + _bteEsc(v.id) + '">Editar</button>';
    if(v.estado === 'activa') acc += '<button type="button" class="bt sec" data-bte-vac-est="pausada" data-id="' + _bteEsc(v.id) + '">Pausar</button>';
    if(v.estado === 'pausada') acc += '<button type="button" class="bt sec" data-bte-vac-est="activa" data-id="' + _bteEsc(v.id) + '">Reactivar</button>';
    if(v.estado !== 'cerrada') acc += '<button type="button" class="bt sec" data-bte-vac-est="cerrada" data-id="' + _bteEsc(v.id) + '">Cerrar</button>';
    else acc += '<button type="button" class="bt sec" data-bte-vac-est="activa" data-id="' + _bteEsc(v.id) + '">Reabrir</button>';
    return '<div class="bte-card' + (v.estado === 'activa' ? '' : ' apagada') + '"><div class="bte-cab"><b>' + _bteEsc(v.cargo) + '</b>' + _bteEstadoPill(v.estado) + '</div>' +
      '<p class="bte-datos">' + _bteEsc([v.sector, (+v.anios_min ? 'desde ' + _bteNum(v.anios_min) + ' años' : ''), [v.distrito, v.departamento].filter(Boolean).join(', '),
        v.modalidad, v.inicio ? 'inicio ' + _bteFecha(v.inicio) : ''].filter(Boolean).join(' · ')) + '</p>' +
      (v.requisitos ? '<p class="bte-req">' + _bteEsc(v.requisitos) + '</p>' : '') +
      '<p class="tenue" style="margin:0;font-size:13px">' + (+v.postulaciones || 0) + ((+v.postulaciones === 1) ? ' postulación' : ' postulaciones') + ' · ' +
        (+v.invitaciones || 0) + ((+v.invitaciones === 1) ? ' invitación' : ' invitaciones') + ' · publicada el ' + _bteEsc(_bteDia(v.creado)) + '</p>' +
      '<div class="bte-acc">' + acc + '</div></div>';
  }).join('') + '</div>';
}

/* ── pestaña Postulaciones ── */
function _btePostHtml(){
  var orden = { nueva:0, vista:1, descartada:2 };
  var L = ((BTE.panel && BTE.panel.postulaciones) || []).slice().sort(function(a, b){ return (orden[a.estado] || 0) - (orden[b.estado] || 0); });
  if(!L.length) return '<div class="vacio"><b>Todavía no hay postulaciones</b>Cuando alguien postule a una de tus vacantes, aparece aquí.</div>';
  return '<div class="bte-lista" id="bte-posts">' + L.map(function(s){
    var pid = s.ficha && s.ficha.pid, acc = '';
    var viva = _bteVivas().some(function(v){ return v.id === s.vacante; });
    if(s.estado !== 'descartada'){
      if(viva) acc += _bteBotonInvitar(pid, s.vacante);
      acc += '<button type="button" class="bt sec" data-bte-post-est="descartada" data-pid="' + _bteEsc(pid) + '" data-vac="' + _bteEsc(s.vacante) + '">Descartar</button>';
    } else {
      acc += '<button type="button" class="bt sec" data-bte-post-est="vista" data-pid="' + _bteEsc(pid) + '" data-vac="' + _bteEsc(s.vacante) + '">Volver a considerar</button>';
    }
    var pill = s.estado === 'nueva' ? '<span class="pill azul">Nueva</span>' : s.estado === 'descartada' ? '<span class="pill gris">Descartada</span>' : '<span class="pill gris">Vista</span>';
    return '<div' + (s.estado === 'descartada' ? ' class="apagada"' : '') + '><p class="tenue" style="margin:0 0 4px;font-size:13px">Postuló a <b>' + _bteEsc(s.cargo_vacante) + '</b> el ' +
      _bteEsc(_bteDia(s.creado)) + '</p>' + _bteFicha(s.ficha, acc, pill) + '</div>';
  }).join('') + '</div>';
}

/* ── pestaña Entrevistas ── */
function _bteEntHtml(){
  var orden = { aceptada:0, enviada:1, rechazada:2, retirada:3 };
  var L = ((BTE.panel && BTE.panel.invitaciones) || []).slice().sort(function(a, b){ return (orden[a.estado] || 0) - (orden[b.estado] || 0); });
  if(!L.length) return '<div class="vacio"><b>Todavía no invitaste a nadie</b>Invita desde «Candidatos» o desde «Postulaciones».</div>';
  return '<div class="bte-lista" id="bte-ents">' + L.map(function(i){
    var pill = i.estado === 'aceptada' ? '<span class="pill ok">Aceptó</span>' : i.estado === 'enviada' ? '<span class="pill ojo">Esperando respuesta</span>' :
               i.estado === 'rechazada' ? '<span class="pill gris">No aceptó</span>' : '<span class="pill gris">Retirada</span>';
    var acc = i.estado === 'enviada' ? '<button type="button" class="bt sec" data-bte-retirar="' + _bteEsc(i.id) + '">Retirar la invitación</button>' : '';
    return '<div' + ((i.estado === 'rechazada' || i.estado === 'retirada') ? ' class="apagada"' : '') + '><p class="tenue" style="margin:0 0 4px;font-size:13px">Entrevista para <b>' +
      _bteEsc(i.cargo_vacante) + '</b> · ' + _bteEsc(_bteFecha(i.fecha)) + ', ' + _bteEsc(i.hora) + ' · ' + _bteEsc(i.modalidad) + ' · ' + _bteEsc(i.lugar) + '</p>' +
      _bteFicha(i.ficha, acc, pill) + '</div>';
  }).join('') + '</div>';
}

/* ══ formularios (en el cajón del portal) ══ */
/* lo que una oferta de empleo no puede pedir (Ley N.° 26772): se avisa, no se adivina */
var BTE_DISCRIM = [
  [/(^|[^a-záéíóúñü])edad([^a-záéíóúñü]|$)/, 'edad'],
  [/(^|[^a-záéíóúñü])(menor|mayor)(es)? de \d{2} ?años(?! de experiencia)/, 'un límite de edad'],
  [/(^|[^a-záéíóúñü])entre \d{2} y \d{2} años(?! de experiencia)/, 'un rango de edad'],
  [/(^|[^a-záéíóúñü])sexo([^a-záéíóúñü]|$)/, 'sexo'],
  [/(^|[^a-záéíóúñü])(var[oó]n|varones|masculino|femenino|s[oó]lo hombres|s[oó]lo mujeres)([^a-záéíóúñü]|$)/, 'sexo'],
  [/(^|[^a-záéíóúñü])estado civil([^a-záéíóúñü]|$)/, 'estado civil'],
  [/(^|[^a-záéíóúñü])(solter[oa]s?|casad[oa]s?)([^a-záéíóúñü]|$)/, 'estado civil'],
  [/(^|[^a-záéíóúñü])buena presencia([^a-záéíóúñü]|$)/, '«buena presencia»'],
  [/(^|[^a-záéíóúñü])(religi[oó]n|cat[oó]lic[oa]s?|evang[eé]lic[oa]s?)([^a-záéíóúñü]|$)/, 'religión'],
  [/(^|[^a-záéíóúñü])(raza|tez)([^a-záéíóúñü]|$)/, 'raza'],
  [/(^|[^a-záéíóúñü])(origen social|condici[oó]n econ[oó]mica)([^a-záéíóúñü]|$)/, 'origen social o condición económica']
];
function _bteDiscrim(t){
  var s = ' ' + String(t || '').toLowerCase() + ' ', v = [];
  BTE_DISCRIM.forEach(function(r){ if(r[0].test(s) && v.indexOf(r[1]) < 0) v.push(r[1]); });
  return v;
}
function _bteHoja(titulo, sub, cuerpo, pie){
  if(typeof abrirHoja === 'function'){ abrirHoja(titulo, sub, cuerpo, pie, { sinFoco:false }); return; }
  var d = document.getElementById('bte-cuerpo'); if(d) d.innerHTML = '<h3>' + _bteEsc(titulo) + '</h3>' + cuerpo + '<div class="bte-acc">' + pie + '</div>';
}
function _bteCerrarHoja(){ if(typeof cerrarHoja === 'function') cerrarHoja(); else _btePintar(); }
function _bteMsg(id, t, clase){ var m = document.getElementById(id); if(!m) return; m.hidden = !t; m.className = 'msg ' + (clase || ''); m.textContent = t || ''; }

function _bteVacForm(id){
  var v = null;
  ((BTE.panel && BTE.panel.vacantes) || []).forEach(function(x){ if(x.id === id) v = x; });
  v = v || { cargo:'', sector:'', anios_min:0, departamento:'Lima', distrito:'', modalidad:'Presencial', requisitos:'', inicio:'' };
  var cuerpo = '<form class="bte-f" id="bte-vf">' +
    '<div class="campo"><label for="bte-v-cargo">Cargo</label><input id="bte-v-cargo" list="bte-cargos-v" maxlength="80" value="' + _bteEsc(v.cargo) + '" placeholder="Supervisor SST"></div>' +
    '<datalist id="bte-cargos-v">' + BTE_CARGOS.map(function(x){ return '<option value="' + _bteEsc(x) + '">'; }).join('') + '</datalist>' +
    '<div class="bte-fila"><div class="campo"><label for="bte-v-sector">Sector</label><select id="bte-v-sector">' + _bteOpts(BTE_SECTORES, v.sector || 'Construcción') + '</select></div>' +
    '<div class="campo"><label for="bte-v-anios">Años de experiencia (mínimo)</label><input id="bte-v-anios" type="number" min="0" max="40" step="0.5" inputmode="decimal" value="' + _bteEsc(+v.anios_min || 0) + '"></div></div>' +
    '<div class="bte-fila"><div class="campo"><label for="bte-v-dep">Departamento</label><select id="bte-v-dep">' + _bteOpts(BTE_DEPS, v.departamento || 'Lima') + '</select></div>' +
    '<div class="campo"><label for="bte-v-dis">Distrito</label><input id="bte-v-dis" maxlength="60" value="' + _bteEsc(v.distrito) + '"></div></div>' +
    '<div class="bte-fila"><div class="campo"><label for="bte-v-mod">Modalidad</label><select id="bte-v-mod">' + _bteOpts(BTE_MOD_VAC, v.modalidad || 'Presencial') + '</select></div>' +
    '<div class="campo"><label for="bte-v-ini">Inicio</label><input id="bte-v-ini" type="date" value="' + _bteEsc(v.inicio ? String(v.inicio).slice(0, 10) : '') + '"></div></div>' +
    '<div class="campo"><label for="bte-v-req">Requisitos y lo que hará</label><textarea id="bte-v-req" maxlength="800" rows="5" placeholder="Experiencia en edificaciones, trabajos en altura, PETAR…">' + _bteEsc(v.requisitos) + '</textarea></div>' +
    '<div class="bte-aviso" id="bte-v-aviso" role="alert" hidden></div>' +
    '<p class="tenue" style="margin:0;font-size:12.5px">La ven los alumnos de la Academia OBRASST con cuenta: el cargo, el sector, los años, el lugar, la modalidad, el inicio, los requisitos y el nombre de tu empresa y de la obra.</p>' +
    '<div class="msg" id="bte-v-msg" role="status" hidden></div></form>';
  var pie = '<button type="button" class="bt" id="bte-v-ok">' + (id ? 'Guardar los cambios' : 'Publicar') + '</button> <button type="button" class="bt sec" id="bte-v-no">Cancelar</button>';
  _bteHoja(id ? 'Editar la vacante' : 'Publicar una vacante', _bteObra(), cuerpo, pie);
  var avisado = false, ok = document.getElementById('bte-v-ok');
  var reset = function(){ if(avisado){ avisado = false; ok.textContent = id ? 'Guardar los cambios' : 'Publicar'; var a = document.getElementById('bte-v-aviso'); if(a) a.hidden = true; } };
  ['bte-v-cargo', 'bte-v-req'].forEach(function(k){ var e = document.getElementById(k); if(e) e.addEventListener('input', reset); });
  document.getElementById('bte-v-no').onclick = _bteCerrarHoja;
  ok.onclick = function(){
    var g = function(k){ var e = document.getElementById(k); return e ? String(e.value || '').trim() : ''; };
    var p = { id:id || '', cargo:g('bte-v-cargo'), sector:g('bte-v-sector'), anios_min:g('bte-v-anios'), departamento:g('bte-v-dep'), distrito:g('bte-v-dis'),
              modalidad:g('bte-v-mod'), inicio:g('bte-v-ini'), requisitos:(document.getElementById('bte-v-req') || {}).value || '' };
    if(p.cargo.length < 3){ _bteMsg('bte-v-msg', 'Escribe el cargo.', 'mal'); return; }
    var malas = _bteDiscrim(p.cargo + ' \n ' + p.requisitos);
    if(malas.length && !avisado){
      avisado = true;
      var a = document.getElementById('bte-v-aviso');
      a.innerHTML = '<b>Revisa antes de publicar:</b> el texto parece pedir ' + _bteEsc(malas.join(', ')) + '. Una oferta de empleo no puede tener requisitos que discriminen ' +
        '(Ley N.° 26772, modificada por la Ley N.° 27270). Quítalo; o, si no es un requisito, toca «' + (id ? 'Guardar igual' : 'Publicar igual') + '».';
      a.hidden = false; ok.textContent = id ? 'Guardar igual' : 'Publicar igual';
      return;
    }
    ok.disabled = true;
    sbRpc('bt_vacante_guardar', { p_emp:BTE.emp, p:p }).then(function(r){
      ok.disabled = false;
      if(r && r.ok){ _bteCerrarHoja(); toast(id ? 'Cambios guardados.' : 'Vacante publicada: ya la ven los alumnos de la Academia.'); BTE.tab = 'vac'; _bteCargar(); return; }
      _bteMsg('bte-v-msg', r && r.motivo === 'muchos_intentos' ? 'Publicaste muchas vacantes hoy: sigue mañana.' : r && r.motivo === 'sin_permiso' ? 'Tu cuenta no puede publicar en esta obra.' : 'No se pudo guardar. Inténtalo otra vez.', 'mal');
    }, function(){ ok.disabled = false; _bteMsg('bte-v-msg', 'Sin conexión: no se guardó. Inténtalo otra vez.', 'mal'); });
  };
}

function _bteInvForm(pid, vacId){
  var vivas = _bteVivas();
  if(!vivas.length){ toast('Primero publica una vacante.'); return; }
  var ficha = null;
  (BTE.cands || []).concat(((BTE.panel && BTE.panel.postulaciones) || []).map(function(s){ return s.ficha; })).forEach(function(f){ if(f && f.pid === pid && !ficha) ficha = f; });
  var cuerpo = '<form class="bte-f" id="bte-if">' +
    (ficha ? '<p style="margin:0;font-size:14px"><b>' + _bteEsc(ficha.cargo) + '</b> · ' + _bteEsc(_bteNum(ficha.anios)) + ' años · ' + _bteEsc([ficha.distrito, ficha.departamento].filter(Boolean).join(', ')) + '</p>' : '') +
    '<div class="campo"><label for="bte-i-vac">Vacante</label><select id="bte-i-vac">' + vivas.map(function(v){
      return '<option value="' + _bteEsc(v.id) + '"' + (v.id === vacId ? ' selected' : '') + '>' + _bteEsc(v.cargo + (v.distrito ? ' · ' + v.distrito : '')) + '</option>';
    }).join('') + '</select></div>' +
    '<div class="bte-fila"><div class="campo"><label for="bte-i-fecha">Fecha</label><input id="bte-i-fecha" type="date" min="' + _bteHoy() + '"></div>' +
    '<div class="campo"><label for="bte-i-hora">Hora</label><input id="bte-i-hora" type="time"></div></div>' +
    '<div class="campo"><label for="bte-i-mod">Modalidad</label><select id="bte-i-mod">' + _bteOpts(BTE_MOD_ENT, 'Virtual') + '</select></div>' +
    '<div class="campo"><label for="bte-i-lugar">Dónde</label><input id="bte-i-lugar" maxlength="200" placeholder="El enlace de la reunión, la dirección o el número desde el que llamarás"></div>' +
    '<div class="campo"><label for="bte-i-msg">Mensaje (opcional)</label><textarea id="bte-i-msg" maxlength="400" rows="3"></textarea></div>' +
    '<p class="tenue" style="margin:0;font-size:12.5px">El candidato ve el nombre de tu empresa y de la obra, el cargo, la fecha, la hora, la modalidad, el lugar y tu mensaje. ' +
    'Si acepta, ves su nombre, su celular, su correo, su resumen y el folio de su constancia.</p>' +
    '<div class="msg" id="bte-i-m" role="status" hidden></div></form>';
  var pie = '<button type="button" class="bt" id="bte-i-ok">Enviar invitación</button> <button type="button" class="bt sec" id="bte-i-no">Cancelar</button>';
  _bteHoja('Invitar a entrevista', _bteObra(), cuerpo, pie);
  document.getElementById('bte-i-no').onclick = _bteCerrarHoja;
  var ok = document.getElementById('bte-i-ok');
  ok.onclick = function(){
    var g = function(k){ var e = document.getElementById(k); return e ? String(e.value || '').trim() : ''; };
    var p = { fecha:g('bte-i-fecha'), hora:g('bte-i-hora'), modalidad:g('bte-i-mod'), lugar:g('bte-i-lugar'), mensaje:(document.getElementById('bte-i-msg') || {}).value || '' };
    if(!/^\d{4}-\d{2}-\d{2}$/.test(p.fecha) || p.fecha < _bteHoy()){ _bteMsg('bte-i-m', 'Elige la fecha de la entrevista (desde hoy).', 'mal'); return; }
    if(!/^([01]?\d|2[0-3]):[0-5]\d$/.test(p.hora)){ _bteMsg('bte-i-m', 'Elige la hora de la entrevista.', 'mal'); return; }
    if(p.lugar.length < 3){ _bteMsg('bte-i-m', 'Escribe dónde será: el enlace, la dirección o el número.', 'mal'); return; }
    ok.disabled = true;
    sbRpc('bt_invitar', { p_emp:BTE.emp, p_vacante:g('bte-i-vac'), p_pid:pid, p:p }).then(function(r){
      ok.disabled = false;
      if(r && r.ok){ _bteCerrarHoja(); toast('Invitación enviada. Cuando acepte, ves su nombre y su contacto en «Entrevistas».'); BTE.tab = 'ent'; _bteCargar(); return; }
      var mo = r && r.motivo;
      _bteMsg('bte-i-m', mo === 'ya_invitado' ? 'Ya tiene una invitación tuya para esta vacante, esperando respuesta.' :
                         mo === 'candidato' ? 'Este candidato ocultó o borró su perfil.' : mo === 'vacante' ? 'Esa vacante ya no está activa.' :
                         mo === 'fecha' ? 'La fecha tiene que ser de hoy en adelante.' : mo === 'hora' ? 'Revisa la hora.' : mo === 'lugar' ? 'Escribe dónde será.' :
                         mo === 'muchos_intentos' ? 'Enviaste muchas invitaciones hoy: sigue mañana.' : 'No se pudo enviar. Inténtalo otra vez.', 'mal');
    }, function(){ ok.disabled = false; _bteMsg('bte-i-m', 'Sin conexión: no se envió. Inténtalo otra vez.', 'mal'); });
  };
}

function _bteEnlazar(){
  var caja = BTE.caja; if(!caja) return;
  var on = function(id, fn){ var e = document.getElementById(id); if(e) e.onclick = fn; };
  on('bte-otra', function(){ vistaBolsaTrabajo(caja); });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-bte-tab]'), function(b){
    b.onclick = function(){ BTE.tab = b.getAttribute('data-bte-tab'); _btePintar(); };
  });
  var ff = document.getElementById('bte-filtros');
  if(ff) ff.onsubmit = function(ev){
    ev.preventDefault();
    BTE.filtro = { cargo:String(($('bte-f-cargo') || {}).value || '').trim(), sector:($('bte-f-sector') || {}).value || '', departamento:($('bte-f-dep') || {}).value || '' };
    var b = document.getElementById('bte-buscar'); if(b){ b.disabled = true; b.textContent = 'Buscando…'; }
    _bteCargar();
  };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-bte-inv]'), function(b){
    b.onclick = function(){ _bteInvForm(b.getAttribute('data-bte-inv'), b.getAttribute('data-bte-vac') || ''); };
  });
  on('bte-vac-nueva', function(){ _bteVacForm(''); });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-bte-vac-edit]'), function(b){
    b.onclick = function(){ _bteVacForm(b.getAttribute('data-bte-vac-edit')); };
  });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-bte-vac-est]'), function(b){
    b.onclick = function(){
      var est = b.getAttribute('data-bte-vac-est'), id = b.getAttribute('data-id');
      var ir = function(){
        b.disabled = true;
        sbRpc('bt_vacante_estado', { p_emp:BTE.emp, p_id:id, p_estado:est }).then(function(r){
          if(r && r.ok){ toast(est === 'pausada' ? 'Vacante pausada: los alumnos ya no la ven.' : est === 'cerrada' ? 'Vacante cerrada.' : 'Vacante activa otra vez.'); _bteCargar(); }
          else { b.disabled = false; toast('No se pudo cambiar. Inténtalo otra vez.'); }
        }, function(){ b.disabled = false; toast('Sin conexión: no se cambió.'); });
      };
      if(est === 'cerrada' && typeof confirmar === 'function'){
        confirmar('¿Cerrar esta vacante?', 'Los alumnos ya no la ven ni pueden postular. Las postulaciones y entrevistas que tiene se quedan; puedes reabrirla después.', { si:'Cerrar la vacante' })
          .then(function(si){ if(si) ir(); });
      } else ir();
    };
  });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-bte-post-est]'), function(b){
    b.onclick = function(){
      b.disabled = true;
      var est = b.getAttribute('data-bte-post-est');
      sbRpc('bt_postulacion_estado', { p_emp:BTE.emp, p_vacante:b.getAttribute('data-vac'), p_pid:b.getAttribute('data-pid'), p_estado:est }).then(function(r){
        if(r && r.ok){ toast(est === 'descartada' ? 'Postulación descartada (el candidato solo ve que ya la viste).' : 'Listo: la postulación vuelve a la lista.'); _bteCargar(); }
        else { b.disabled = false; toast('No se pudo cambiar. Inténtalo otra vez.'); }
      }, function(){ b.disabled = false; toast('Sin conexión: no se cambió.'); });
    };
  });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-bte-retirar]'), function(b){
    b.onclick = function(){
      var ir = function(){
        b.disabled = true;
        sbRpc('bt_invitacion_retirar', { p_emp:BTE.emp, p_id:b.getAttribute('data-bte-retirar') }).then(function(r){
          if(r && r.ok){ toast('Invitación retirada: ya no le aparece al candidato.'); _bteCargar(); }
          else { b.disabled = false; toast('Ya respondió o ya no está para retirar.'); _bteCargar(); }
        }, function(){ b.disabled = false; toast('Sin conexión: no se retiró.'); });
      };
      if(typeof confirmar === 'function') confirmar('¿Retirar la invitación?', 'Ya no le aparece al candidato.', { si:'Retirar' }).then(function(si){ if(si) ir(); });
      else ir();
    };
  });
}
