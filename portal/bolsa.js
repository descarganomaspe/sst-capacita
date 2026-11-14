/* ══ OBRASST · BOLSA DE TRABAJO SST (Orden 30 · 13/11/2026) ═════════════════════════════════════════════
   · Enlace directo con OBRASST para que supervisores y gerencia encuentren candidatos verificados.
   · Cumplimiento estricto Ley N.° 29733 (Protección de Datos Personales): contacto oculto hasta que el candidato
     acepte voluntariamente la invitación a entrevista.
   · Ley N.° 26772 y Ley N.° 27270: aviso de no discriminación y selección basada en mérito y competencias.
   · Constancias de la Academia OBRASST verificadas con QR (/verificar); nunca certificados oficiales inventados.
   · Modo aislado sessionStorage ('bolsa_sandbox_v1') para pruebas locales sin tocar producción. */
var BOLSA_VER = '30';

var BTW = {
  caja: null,
  modo: 'empresa', /* 'empresa' | 'candidato' */
  tabEmp: 'candidatos', /* 'candidatos' | 'vacantes' | 'entrevistas' */
  tabCand: 'vacantes', /* 'vacantes' | 'perfil' | 'invitaciones' */
  filtroCargo: '',
  filtroSector: '',
  invitandoA: null, /* perfil objeto */
  creandoVacante: false
};

function _btEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function _btSbKey(){
  var emp = (window.YO && YO.obra && YO.obra.id) ? String(YO.obra.id) : 'anon';
  var uid = (window.TOK && TOK.uid) ? String(TOK.uid) : 'invitado';
  return 'bolsa_sandbox_v1:' + emp + ':' + uid;
}

function _btDatosDefecto(){
  return {
    vacantes: [
      {
        id: 'vac-1',
        cargo: 'Supervisor SST',
        sector: 'Construcción',
        obra: 'Edificio Norte — Obra Ejemplo',
        experiencia_min: 3,
        modalidad: 'Presencial',
        distrito: 'Lima / San Isidro',
        requisitos: 'Experiencia en edificaciones, trabajo en altura, ATS y PETAR.',
        fecha_inicio: '2026-11-20',
        estado: 'activa'
      },
      {
        id: 'vac-2',
        cargo: 'Prevencionista de Riesgos (PdR)',
        sector: 'Construcción',
        obra: 'Condominio El Sol — Obra Ejemplo',
        experiencia_min: 2,
        modalidad: 'Presencial',
        distrito: 'Lima / Miraflores',
        requisitos: 'Inducciones diarias, inspección de andamios y EPP.',
        fecha_inicio: '2026-11-25',
        estado: 'activa'
      }
    ],
    perfiles: [
      {
        id: 'perf-1',
        nombre_completo: 'Carlos Mendoza Ríos (Ejemplo)',
        cargo_buscado: 'Supervisor SST',
        sectores: ['Construcción', 'Minería'],
        experiencia_anios: 4.5,
        departamento: 'Lima',
        distrito: 'San Borja',
        disponibilidad: 'Inmediata',
        resumen: 'Supervisor SST colegiado con 4.5 años en edificaciones multifamiliares y campamentos. Manejo de IPERC, PETAR y comités paritarios.',
        telefono: '987 654 321',
        correo: 'carlos.mendoza.ejemplo@gmail.com',
        constancias: [
          { titulo: 'Supervisor SST listo para obra', folio: 'ACAD-01-08421', qr: 'https://obrasstapp.com/verificar?c=ACAD-01-08421' }
        ],
        visible: true
      },
      {
        id: 'perf-2',
        nombre_completo: 'Lucía Paredes Soto (Ejemplo)',
        cargo_buscado: 'Prevencionista de Riesgos (PdR)',
        sectores: ['Construcción', 'Industria'],
        experiencia_anios: 3.0,
        departamento: 'Lima',
        distrito: 'Surco',
        disponibilidad: 'Inmediata',
        resumen: 'Prevencionista con sólida experiencia en control de trabajos en caliente, espacios confinados y charlas operativas.',
        telefono: '976 543 210',
        correo: 'lucia.paredes.ejemplo@outlook.com',
        constancias: [
          { titulo: 'Supervisor SST listo para obra', folio: 'ACAD-01-14920', qr: 'https://obrasstapp.com/verificar?c=ACAD-01-14920' }
        ],
        visible: true
      },
      {
        id: 'perf-3',
        nombre_completo: 'Jorge Alarcón Silva (Ejemplo)',
        cargo_buscado: 'Ingeniero de Seguridad',
        sectores: ['Hidrocarburos', 'Minería'],
        experiencia_anios: 6.0,
        departamento: 'Lima',
        distrito: 'Los Olivos',
        disponibilidad: '15 días',
        resumen: 'Ingeniero especialista en auditorías ISO 45001, planes de contingencia y transporte de materiales peligrosos.',
        telefono: '991 223 344',
        correo: 'jorge.alarcon.ejemplo@gmail.com',
        constancias: [
          { titulo: 'Supervisor SST listo para obra', folio: 'ACAD-01-33120', qr: 'https://obrasstapp.com/verificar?c=ACAD-01-33120' }
        ],
        visible: true
      }
    ],
    invitaciones: [],
    postulaciones: []
  };
}

function _btLeerDb(){
  try{
    var r = sessionStorage.getItem(_btSbKey());
    if(!r) return _btDatosDefecto();
    var p = JSON.parse(r);
    return (p && typeof p === 'object' && p.perfiles) ? p : _btDatosDefecto();
  }catch(e){ return _btDatosDefecto(); }
}

function _btGuardarDb(db){
  try{ sessionStorage.setItem(_btSbKey(), JSON.stringify(db)); }catch(e){}
}

function _btCss(){
  if(document.getElementById('bt-css')) return;
  var s = document.createElement('style'); s.id = 'bt-css';
  s.textContent = [
    '.bt-wrap{display:grid;gap:14px}',
    '.bt-aviso-disc{padding:10px 14px;border-radius:10px;background:rgba(37,99,168,.09);border:1px solid rgba(37,99,168,.3);font-size:12.5px;line-height:1.45;color:var(--tinta,#0B2A3A)}',
    '.bt-roles{display:flex;gap:6px;align-items:center;background:var(--fondo,#f6f8fa);padding:4px;border-radius:10px;border:1px solid var(--raya,#E3E8EC);width:max-content;max-width:100%}',
    '.bt-role-btn{border:0;background:transparent;padding:6px 14px;border-radius:8px;font-size:13.5px;font-weight:600;color:var(--gris,#6B7C88);cursor:pointer}',
    '.bt-role-btn.on{background:var(--tinta,#0B2A3A);color:#fff}',
    '.bt-tabs{display:flex;gap:8px;border-bottom:1px solid var(--raya,#E3E8EC);overflow-x:auto;padding-bottom:2px}',
    '.bt-tab-btn{border:0;background:transparent;padding:8px 12px;font-size:13.5px;font-weight:600;color:var(--gris,#6B7C88);cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}',
    '.bt-tab-btn.on{color:var(--tinta,#0B2A3A);border-bottom-color:#F5B700}',
    '.bt-cand-card{padding:14px 16px;border-radius:12px;border:1px solid var(--raya,#E3E8EC);background:var(--tarj,#fff);display:grid;gap:8px}',
    '.bt-cand-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}',
    '.bt-calce-badge{font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;background:#E8F5EE;color:#1E8E5A}',
    '.bt-qr-tag{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;color:#2563A8;background:#E9F0FA;padding:2px 8px;border-radius:6px;text-decoration:none}',
    '.bt-contacto-box{padding:8px 12px;border-radius:8px;background:var(--fondo,#f6f8fa);border:1px dashed var(--raya,#E3E8EC);font-size:12.5px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}',
    '.bt-contacto-candado{color:var(--ojo,#B7791F);font-weight:600}',
    '.bt-filtros{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.bt-filtros select{width:auto;padding:6px 10px;font-size:13px;border-radius:8px;border:1px solid var(--raya2,#CBD4DB)}',
    '.bt-modal-fondo{position:fixed;inset:0;background:rgba(11,42,58,.65);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px}',
    '.bt-modal-caja{background:#fff;border-radius:14px;max-width:500px;width:100%;padding:18px 20px;display:grid;gap:12px;box-shadow:0 12px 32px rgba(11,42,58,.25)}',
    '.bt-pill-sec{display:inline-block;padding:2px 7px;font-size:11px;border-radius:4px;background:#F1F4F7;color:#334E68;margin-right:4px}'
  ].join('\n');
  document.head.appendChild(s);
}

function vistaBolsaTrabajo(caja){
  _btCss();
  BTW.caja = caja;
  var ac = $('acciones'); if(ac) ac.innerHTML = '';
  _btPintar();
}

function _btPintar(){
  var caja = BTW.caja;
  if(!caja || !document.body.contains(caja)) return;
  var db = _btLeerDb();

  var h = '<div class="bt-wrap" id="bt-raiz">';
  /* Cabecera y switch de rol (Empresa / Candidato) */
  h += '<div class="tarj"><div class="tarj-cuerpo"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">' +
       '<div><h2>💼 Bolsa de Trabajo SST · OBRASST</h2>' +
       '<p class="sub" style="margin:2px 0 0">Postulantes y candidatos verificados con la Academia OBRASST, sin discriminación y con privacidad de contacto.</p></div>' +
       '<div class="bt-roles">' +
       '<button type="button" class="bt-role-btn' + (BTW.modo === 'empresa' ? ' on' : '') + '" id="bt-b-modo-emp">Modo Empresa</button>' +
       '<button type="button" class="bt-role-btn' + (BTW.modo === 'candidato' ? ' on' : '') + '" id="bt-b-modo-cand">Modo Candidato (PdR / SST)</button>' +
       '</div></div>' +
       '<div class="bt-aviso-disc" style="margin-top:10px" role="note">' +
       '<b>Aviso de no discriminación (Leyes N.° 26772 y 27270):</b> Esta bolsa prohíbe ofertas y filtros de empleo con requisitos de edad, sexo, raza, religión, opinión, estado civil o apariencia. La selección se basa exclusivamente en idoneidad, experiencia y competencias técnicas verificadas.' +
       '</div></div></div>';

  if(BTW.modo === 'empresa'){
    h += _btHtmlEmpresa(db);
  } else {
    h += _btHtmlCandidato(db);
  }

  h += '</div>';

  if(BTW.invitandoA){
    h += _btHtmlModalInvitar(BTW.invitandoA, db);
  }

  caja.innerHTML = h;
  _btEnchufarEventos(db);
}

function _btHtmlEmpresa(db){
  var h = '<div class="tarj"><div class="tarj-cuerpo">' +
          '<div class="bt-tabs">' +
          '<button type="button" id="bt-tab-cands" class="bt-tab-btn' + (BTW.tabEmp === 'candidatos' ? ' on' : '') + '" data-bt-etab="candidatos">👥 Candidatos que calzan (' + db.perfiles.filter(function(p){ return p.visible; }).length + ')</button>' +
          '<button type="button" id="bt-tab-vacs-emp" class="bt-tab-btn' + (BTW.tabEmp === 'vacantes' ? ' on' : '') + '" data-bt-etab="vacantes">📋 Mis vacantes activas (' + db.vacantes.filter(function(v){ return v.estado === 'activa'; }).length + ')</button>' +
          '<button type="button" id="bt-tab-entrs" class="bt-tab-btn' + (BTW.tabEmp === 'entrevistas' ? ' on' : '') + '" data-bt-etab="entrevistas">🗓 Entrevistas e invitaciones (' + db.invitaciones.length + ')</button>' +
          '</div>';

  if(BTW.tabEmp === 'candidatos'){
    h += '<div style="margin-top:14px;display:grid;gap:12px" id="bt-cands-lista">' +
         '<div class="bt-filtros">' +
         '<label for="bt-filtro-cargo" style="margin:0;font-size:13px">Cargo:</label>' +
         '<select id="bt-filtro-cargo"><option value="">Todos los cargos</option>' +
         '<option value="Supervisor SST"' + (BTW.filtroCargo === 'Supervisor SST' ? ' selected' : '') + '>Supervisor SST</option>' +
         '<option value="Prevencionista de Riesgos (PdR)"' + (BTW.filtroCargo === 'Prevencionista de Riesgos (PdR)' ? ' selected' : '') + '>Prevencionista (PdR)</option>' +
         '<option value="Ingeniero de Seguridad"' + (BTW.filtroCargo === 'Ingeniero de Seguridad' ? ' selected' : '') + '>Ingeniero de Seguridad</option></select>' +
         '<label for="bt-filtro-sec" style="margin:0 0 0 8px;font-size:13px">Sector:</label>' +
         '<select id="bt-filtro-sec"><option value="">Todos los sectores</option>' +
         '<option value="Construcción"' + (BTW.filtroSector === 'Construcción' ? ' selected' : '') + '>Construcción</option>' +
         '<option value="Minería"' + (BTW.filtroSector === 'Minería' ? ' selected' : '') + '>Minería</option>' +
         '<option value="Hidrocarburos"' + (BTW.filtroSector === 'Hidrocarburos' ? ' selected' : '') + '>Hidrocarburos</option></select>' +
         '</div>';

    var lista = db.perfiles.filter(function(p){
      if(!p.visible) return false;
      if(BTW.filtroCargo && p.cargo_buscado !== BTW.filtroCargo) return false;
      if(BTW.filtroSector && p.sectores.indexOf(BTW.filtroSector) === -1) return false;
      return true;
    });

    if(!lista.length){
      h += '<p class="msg" style="margin-top:8px">No se encontraron candidatos visibles con los filtros seleccionados.</p>';
    } else {
      lista.forEach(function(cand){
        var invAceptada = db.invitaciones.some(function(i){
          return i.perfil_id === cand.id && i.estado === 'aceptada';
        });
        var invEnviada = db.invitaciones.some(function(i){
          return i.perfil_id === cand.id && i.estado === 'enviada';
        });

        h += '<div class="bt-cand-card" data-bt-perf-card="' + _btEsc(cand.id) + '">' +
             '<div class="bt-cand-head"><div>' +
             '<h3 style="font-size:16px;margin:0">' + _btEsc(cand.nombre_completo) + '</h3>' +
             '<div style="font-size:13px;color:var(--gris);margin-top:2px">' +
             '<b>' + _btEsc(cand.cargo_buscado) + '</b> · ' + _btEsc(cand.experiencia_anios) + ' años de exp. · ' + _btEsc(cand.distrito) + ' (' + _btEsc(cand.departamento) + ') · Disp: ' + _btEsc(cand.disponibilidad) +
             '</div></div>' +
             '<span class="bt-calce-badge">Calce 95% Obra</span></div>' +
             '<div style="font-size:13px">' + cand.sectores.map(function(s){ return '<span class="bt-pill-sec">' + _btEsc(s) + '</span>'; }).join('') + '</div>' +
             '<p style="margin:2px 0 0;font-size:13px;line-height:1.4">' + _btEsc(cand.resumen) + '</p>';

        if(cand.constancias && cand.constancias.length){
          h += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
               '<small style="font-weight:600;color:var(--gris)">Academia OBRASST:</small>' +
               cand.constancias.map(function(c){
                 return '<a class="bt-qr-tag" href="' + _btEsc(c.qr) + '" target="_blank" rel="noopener">📜 ' + _btEsc(c.titulo) + ' (QR ' + _btEsc(c.folio) + ') ✓</a>';
               }).join('') + '</div>';
        }

        /* Privacidad de datos personales (Ley 29733) */
        h += '<div class="bt-contacto-box">';
        if(invAceptada){
          h += '<span style="color:#1E8E5A;font-weight:700">✓ Entrevista aceptada:</span> ' +
               '<span>📞 <b>' + _btEsc(cand.telefono) + '</b></span> · ' +
               '<span>✉️ <b>' + _btEsc(cand.correo) + '</b></span>';
        } else {
          h += '<span class="bt-contacto-candado">🔒 Contacto protegido (Ley 29733):</span> ' +
               '<span style="color:var(--gris)">Teléfono y correo ocultos hasta aceptar entrevista formal.</span>';
        }
        h += '</div>';

        /* Acciones */
        h += '<div style="display:flex;gap:8px;align-items:center;margin-top:4px">' +
             (invAceptada ? '<span class="pill ok">Entrevista confirmada en agenda</span>' :
              (invEnviada ? '<button type="button" class="bt sec chico" disabled>⏳ Invitación enviada</button>' :
               '<button type="button" class="bt chico" data-bt-invitar="' + _btEsc(cand.id) + '">✉️ Proponer entrevista</button>')) +
             '</div></div>';
      });
    }
    h += '</div>';
  } else if(BTW.tabEmp === 'vacantes'){
    h += '<div style="margin-top:14px;display:grid;gap:10px" id="bt-vacs-lista">' +
         '<div style="display:flex;justify-content:space-between;align-items:center">' +
         '<b>Vacantes publicadas de la empresa</b>' +
         '<button type="button" class="bt chico" id="bt-b-crear-vac">+ Nueva vacante</button></div>';

    if(BTW.creandoVacante){
      h += '<form id="bt-form-vacante" style="padding:14px;border:1px solid var(--azul);border-radius:12px;background:var(--fondo);display:grid;gap:10px">' +
           '<b>Publicar nueva vacante de SST</b>' +
           '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
           '<div><label for="bt-v-cargo">Cargo solicitado</label><input id="bt-v-cargo" required placeholder="Ej: Supervisor SST"></div>' +
           '<div><label for="bt-v-sec">Sector de la obra</label><select id="bt-v-sec"><option>Construcción</option><option>Minería</option><option>Hidrocarburos</option><option>Industria</option></select></div>' +
           '<div><label for="bt-v-exp">Años de experiencia mínima</label><input id="bt-v-exp" type="number" min="0" step="0.5" value="2"></div>' +
           '<div><label for="bt-v-mod">Modalidad</label><select id="bt-v-mod"><option>Presencial</option><option>Régimen / Campamento</option><option>Híbrido</option></select></div>' +
           '</div>' +
           '<div><label for="bt-v-req">Requisitos técnicos objetivos (sin discriminación de edad/sexo)</label>' +
           '<textarea id="bt-v-req" rows="2" style="width:100%" placeholder="Ej: Colegiado, experiencia en excavaciones y altura."></textarea></div>' +
           '<div style="display:flex;gap:8px">' +
           '<button type="submit" class="bt chico">Publicar vacante</button>' +
           '<button type="button" class="bt sec chico" id="bt-b-canc-vac">Cancelar</button></div></form>';
    }

    db.vacantes.forEach(function(v){
      h += '<div class="tarj" style="border:1px solid var(--raya);padding:12px 14px;border-radius:10px">' +
           '<div style="display:flex;justify-content:space-between;align-items:center">' +
           '<div><b style="font-size:15px">' + _btEsc(v.cargo) + '</b> <span class="pill ' + (v.estado === 'activa' ? 'ok' : 'gris') + '">' + _btEsc(v.estado) + '</span>' +
           '<div style="font-size:12.5px;color:var(--gris)">' + _btEsc(v.sector) + ' · Min ' + _btEsc(v.experiencia_min) + ' años · ' + _btEsc(v.modalidad) + ' · ' + _btEsc(v.distrito) + '</div></div>' +
           '<div style="display:flex;gap:6px">' +
           (v.estado === 'activa' ? '<button type="button" class="bt sec chico" data-bt-pausar="' + _btEsc(v.id) + '">Pausar</button>' :
            '<button type="button" class="bt sec chico" data-bt-activar="' + _btEsc(v.id) + '">Reactivar</button>') +
           '</div></div></div>';
    });
    h += '</div>';
  } else if(BTW.tabEmp === 'entrevistas'){
    h += '<div style="margin-top:14px;display:grid;gap:10px">' +
         '<b>Seguimiento de entrevistas coordinadas</b>';
    if(!db.invitaciones.length){
      h += '<p class="msg" style="margin-top:6px">Aún no has propuesto entrevistas. Entra a la pestaña «Candidatos» y pulsa «Proponer entrevista».</p>';
    } else {
      db.invitaciones.forEach(function(inv){
        var cand = db.perfiles.find(function(p){ return p.id === inv.perfil_id; }) || {};
        h += '<div class="tarj" style="padding:12px 14px;border:1px solid var(--raya);border-radius:10px;display:grid;gap:6px">' +
             '<div style="display:flex;justify-content:space-between;align-items:center">' +
             '<b>' + _btEsc(cand.nombre_completo || 'Candidato') + '</b>' +
             '<span class="pill ' + (inv.estado === 'aceptada' ? 'ok' : (inv.estado === 'rechazada' ? 'mal' : 'ojo')) + '">' + _btEsc(inv.estado.toUpperCase()) + '</span></div>' +
             '<div style="font-size:13px;color:var(--gris)">Fecha: ' + _btEsc(inv.fecha_propuesta) + ' a las ' + _btEsc(inv.hora_propuesta) + ' (' + _btEsc(inv.modalidad_entrevista) + ': ' + _btEsc(inv.lugar_o_enlace) + ')</div>' +
             (inv.estado === 'aceptada' ?
              '<div style="font-size:13px;color:#1E8E5A"><b>Contacto confirmado:</b> 📞 ' + _btEsc(cand.telefono) + ' · ✉️ ' + _btEsc(cand.correo) + '</div>' :
              '<div style="font-size:12px;color:var(--gris)">🔒 Contacto oculto hasta aceptación.</div>') +
             '</div>';
      });
    }
    h += '</div>';
  }

  h += '</div></div>';
  return h;
}

function _btHtmlCandidato(db){
  var cand = db.perfiles[0]; /* Simula perfil de Carlos Mendoza */
  var h = '<div class="tarj"><div class="tarj-cuerpo">' +
          '<div class="bt-tabs">' +
          '<button type="button" id="bt-tab-vacs" class="bt-tab-btn' + (BTW.tabCand === 'vacantes' ? ' on' : '') + '" data-bt-ctab="vacantes">🔍 Vacantes para mí (' + db.vacantes.length + ')</button>' +
          '<button type="button" id="bt-tab-invs" class="bt-tab-btn' + (BTW.tabCand === 'invitaciones' ? ' on' : '') + '" data-bt-ctab="invitaciones">📬 Mis invitaciones a entrevista (' + db.invitaciones.filter(function(i){ return i.perfil_id === cand.id; }).length + ')</button>' +
          '<button type="button" id="bt-tab-perf" class="bt-tab-btn' + (BTW.tabCand === 'perfil' ? ' on' : '') + '" data-bt-ctab="perfil">👤 Mi perfil profesional</button>' +
          '</div>';

  if(BTW.tabCand === 'vacantes'){
    h += '<div style="margin-top:14px;display:grid;gap:10px">';
    db.vacantes.forEach(function(v){
      var yaPostulo = db.postulaciones.some(function(po){ return po.vacante_id === v.id && po.perfil_id === cand.id; });
      h += '<div class="tarj" style="border:1px solid var(--raya);padding:14px;border-radius:10px;display:grid;gap:6px">' +
           '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
           '<div><h3 style="font-size:16px;margin:0">' + _btEsc(v.cargo) + '</h3>' +
           '<div style="font-size:13px;color:var(--gris)">' + _btEsc(v.obra) + ' · ' + _btEsc(v.sector) + ' · ' + _btEsc(v.modalidad) + '</div></div>' +
           '<span class="pill azul">Inicio ' + _btEsc(v.fecha_inicio) + '</span></div>' +
           '<p style="margin:2px 0;font-size:13px">' + _btEsc(v.requisitos) + '</p>' +
           '<div style="margin-top:4px">' +
           (yaPostulo ? '<span class="pill ok">✓ Ya postulaste a esta vacante</span>' :
            '<button type="button" class="bt chico" data-bt-postular="' + _btEsc(v.id) + '">Postular ahora</button>') +
           '</div></div>';
    });
    h += '</div>';
  } else if(BTW.tabCand === 'invitaciones'){
    h += '<div style="margin-top:14px;display:grid;gap:10px">';
    var misInvs = db.invitaciones.filter(function(i){ return i.perfil_id === cand.id; });
    if(!misInvs.length){
      h += '<p class="msg">No tienes invitaciones a entrevista pendientes en este momento.</p>';
    } else {
      misInvs.forEach(function(inv){
        h += '<div class="tarj" style="border:1px solid var(--raya);padding:14px;border-radius:10px;display:grid;gap:8px">' +
             '<div style="display:flex;justify-content:space-between;align-items:center">' +
             '<b>Constructora Ejemplo S.A.C. te ha invitado a una entrevista</b>' +
             '<span class="pill ' + (inv.estado === 'aceptada' ? 'ok' : (inv.estado === 'rechazada' ? 'mal' : 'ojo')) + '">' + _btEsc(inv.estado.toUpperCase()) + '</span></div>' +
             '<div style="font-size:13.5px"><b>Fecha propuesta:</b> ' + _btEsc(inv.fecha_propuesta) + ' a las ' + _btEsc(inv.hora_propuesta) + '</div>' +
             '<div style="font-size:13px;color:var(--gris)"><b>Modalidad:</b> ' + _btEsc(inv.modalidad_entrevista) + ' (' + _btEsc(inv.lugar_o_enlace) + ')</div>' +
             (inv.mensaje ? '<p style="margin:0;font-size:13px;font-style:italic">«' + _btEsc(inv.mensaje) + '»</p>' : '') +
             (inv.estado === 'enviada' ?
              '<div style="display:flex;gap:8px;margin-top:4px">' +
              '<button type="button" class="bt chico" data-bt-resp-inv="' + _btEsc(inv.id) + '" data-val="aceptada">✓ Aceptar entrevista</button>' +
              '<button type="button" class="bt sec chico" data-bt-resp-inv="' + _btEsc(inv.id) + '" data-val="rechazada">✕ No, gracias</button>' +
              '</div>' :
              (inv.estado === 'aceptada' ?
               '<div class="msg ok" style="margin:0">✓ Aceptaste la entrevista. Tus datos de contacto fueron compartidos con el reclutador para coordinar detalles.</div>' :
               '<div class="msg" style="margin:0">Declinaste esta invitación. Tu contacto permaneció en reserva.</div>')) +
             '</div>';
      });
    }
    h += '</div>';
  } else if(BTW.tabCand === 'perfil'){
    h += '<div style="margin-top:14px;display:grid;gap:12px">' +
         '<div class="cur-box" style="display:flex;justify-content:space-between;align-items:center">' +
         '<div><b>Visibilidad de mi perfil en la bolsa</b>' +
         '<div style="font-size:12.5px;color:var(--gris)">Si lo ocultas, las empresas no podrán encontrarte en las búsquedas.</div></div>' +
         '<label style="display:flex;align-items:center;gap:6px;margin:0;font-size:14px;font-weight:700">' +
         '<input type="checkbox" id="bt-chk-vis" style="width:auto"' + (cand.visible ? ' checked' : '') + '> ' +
         '<span id="bt-txt-vis">' + (cand.visible ? 'Visible' : 'Oculto') + '</span></label></div>' +

         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
         '<div><label>Nombre completo</label><input readonly value="' + _btEsc(cand.nombre_completo) + '"></div>' +
         '<div><label>Cargo buscado</label><input readonly value="' + _btEsc(cand.cargo_buscado) + '"></div>' +
         '<div><label>Años de experiencia</label><input readonly value="' + _btEsc(cand.experiencia_anios) + ' años"></div>' +
         '<div><label>Ubicación</label><input readonly value="' + _btEsc(cand.distrito) + ' (' + _btEsc(cand.departamento) + ')"></div>' +
         '<div><label>Teléfono (solo visible tras aceptar entrevista)</label><input readonly value="' + _btEsc(cand.telefono) + '"></div>' +
         '<div><label>Correo (solo visible tras aceptar entrevista)</label><input readonly value="' + _btEsc(cand.correo) + '"></div>' +
         '</div>' +

         '<div><label>Constancias Academia OBRASST verificadas</label>' +
         cand.constancias.map(function(c){
           return '<div style="margin-top:4px"><a class="bt-qr-tag" href="' + _btEsc(c.qr) + '" target="_blank" rel="noopener">📜 ' + _btEsc(c.titulo) + ' · Folio ' + _btEsc(c.folio) + ' (QR verificado) ✓</a></div>';
         }).join('') + '</div>' +
         '</div>';
  }

  h += '</div></div>';
  return h;
}

function _btHtmlModalInvitar(cand, db){
  var hoy = new Date().toISOString().slice(0, 10);
  return '<div class="bt-modal-fondo" id="bt-modal-invitar">' +
         '<div class="bt-modal-caja">' +
         '<div style="display:flex;justify-content:space-between;align-items:center">' +
         '<h3 style="margin:0">Proponer entrevista</h3>' +
         '<button type="button" class="bt sec chico" id="bt-b-cerrar-modal">✕</button></div>' +
         '<p style="margin:0;font-size:13px">Invitando a <b>' + _btEsc(cand.nombre_completo) + '</b> (' + _btEsc(cand.cargo_buscado) + '). Sus datos de contacto se revelarán únicamente si acepta la invitación.</p>' +
         '<form id="bt-form-inv" style="display:grid;gap:10px">' +
         '<div><label for="bt-i-vac">Vacante asociada</label>' +
         '<select id="bt-i-vac">' + db.vacantes.map(function(v){ return '<option value="' + _btEsc(v.id) + '">' + _btEsc(v.cargo) + ' (' + _btEsc(v.obra) + ')</option>'; }).join('') + '</select></div>' +
         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
         '<div><label for="bt-i-fecha">Fecha propuesta</label><input type="date" id="bt-i-fecha" required value="' + hoy + '"></div>' +
         '<div><label for="bt-i-hora">Hora</label><input type="time" id="bt-i-hora" required value="10:00"></div>' +
         '</div>' +
         '<div><label for="bt-i-mod">Modalidad</label><select id="bt-i-mod"><option>Virtual (Google Meet / Zoom)</option><option>Presencial en Obra</option></select></div>' +
         '<div><label for="bt-i-lugar">Enlace de videollamada o dirección</label><input id="bt-i-lugar" required placeholder="Ej: meet.google.com/abc-defg-hij o Av. Principal 123"></div>' +
         '<div><label for="bt-i-msg">Mensaje breve para el candidato</label><textarea id="bt-i-msg" rows="2" placeholder="Nos gustó tu perfil verificado en la Academia..."></textarea></div>' +
         '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">' +
         '<button type="button" class="bt sec chico" id="bt-b-canc-inv">Cancelar</button>' +
         '<button type="submit" class="bt chico">Enviar invitación</button></div></form>' +
         '</div></div>';
}

function _btEnchufarEventos(db){
  var be = document.getElementById('bt-b-modo-emp');
  if(be) be.onclick = function(){ BTW.modo = 'empresa'; _btPintar(); };
  var bc = document.getElementById('bt-b-modo-cand');
  if(bc) bc.onclick = function(){ BTW.modo = 'candidato'; _btPintar(); };

  Array.prototype.forEach.call(document.querySelectorAll('[data-bt-etab]'), function(b){
    b.onclick = function(){ BTW.tabEmp = b.getAttribute('data-bt-etab'); _btPintar(); };
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-bt-ctab]'), function(b){
    b.onclick = function(){ BTW.tabCand = b.getAttribute('data-bt-ctab'); _btPintar(); };
  });

  var fc = document.getElementById('bt-filtro-cargo');
  if(fc) fc.onchange = function(){ BTW.filtroCargo = fc.value; _btPintar(); };
  var fs = document.getElementById('bt-filtro-sec');
  if(fs) fs.onchange = function(){ BTW.filtroSector = fs.value; _btPintar(); };

  Array.prototype.forEach.call(document.querySelectorAll('[data-bt-invitar]'), function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-bt-invitar');
      var cand = db.perfiles.find(function(p){ return p.id === id; });
      if(cand){ BTW.invitandoA = cand; _btPintar(); }
    };
  });

  var cm = document.getElementById('bt-b-cerrar-modal');
  if(cm) cm.onclick = function(){ BTW.invitandoA = null; _btPintar(); };
  var cmi = document.getElementById('bt-b-canc-inv');
  if(cmi) cmi.onclick = function(){ BTW.invitandoA = null; _btPintar(); };

  var fi = document.getElementById('bt-form-inv');
  if(fi) fi.onsubmit = function(ev){
    ev.preventDefault();
    var nuevaInv = {
      id: 'inv-' + Date.now(),
      vacante_id: document.getElementById('bt-i-vac').value,
      perfil_id: BTW.invitandoA.id,
      fecha_propuesta: document.getElementById('bt-i-fecha').value,
      hora_propuesta: document.getElementById('bt-i-hora').value,
      modalidad_entrevista: document.getElementById('bt-i-mod').value,
      lugar_o_enlace: document.getElementById('bt-i-lugar').value,
      mensaje: document.getElementById('bt-i-msg').value,
      estado: 'enviada',
      creado_en: new Date().toISOString()
    };
    db.invitaciones.push(nuevaInv);
    _btGuardarDb(db);
    BTW.invitandoA = null;
    toast('Invitación enviada con éxito. Esperando respuesta del candidato.');
    _btPintar();
  };

  /* Responder invitación (candidato) */
  Array.prototype.forEach.call(document.querySelectorAll('[data-bt-resp-inv]'), function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-bt-resp-inv'), val = b.getAttribute('data-val');
      var inv = db.invitaciones.find(function(i){ return i.id === id; });
      if(inv){
        inv.estado = val;
        inv.respondida_en = new Date().toISOString();
        _btGuardarDb(db);
        toast(val === 'aceptada' ? 'Entrevista aceptada. Tus datos de contacto fueron compartidos.' : 'Invitación rechazada.');
        _btPintar();
      }
    };
  });

  /* Postular a vacante (candidato) */
  Array.prototype.forEach.call(document.querySelectorAll('[data-bt-postular]'), function(b){
    b.onclick = function(){
      var vid = b.getAttribute('data-bt-postular');
      db.postulaciones.push({
        id: 'pos-' + Date.now(),
        vacante_id: vid,
        perfil_id: db.perfiles[0].id,
        estado: 'nueva'
      });
      _btGuardarDb(db);
      toast('Postulación enviada a la empresa.');
      _btPintar();
    };
  });

  /* Visibilidad de perfil */
  var chkVis = document.getElementById('bt-chk-vis');
  if(chkVis) chkVis.onchange = function(){
    db.perfiles[0].visible = chkVis.checked;
    _btGuardarDb(db);
    var txt = document.getElementById('bt-txt-vis');
    if(txt) txt.textContent = chkVis.checked ? 'Visible' : 'Oculto';
    toast(chkVis.checked ? 'Tu perfil es visible en búsquedas de empresas.' : 'Tu perfil está oculto en la bolsa.');
  };

  /* Crear vacante */
  var bv = document.getElementById('bt-b-crear-vac');
  if(bv) bv.onclick = function(){ BTW.creandoVacante = true; _btPintar(); };
  var cbv = document.getElementById('bt-b-canc-vac');
  if(cbv) cbv.onclick = function(){ BTW.creandoVacante = false; _btPintar(); };
  var fv = document.getElementById('bt-form-vacante');
  if(fv) fv.onsubmit = function(ev){
    ev.preventDefault();
    var nVac = {
      id: 'vac-' + Date.now(),
      cargo: document.getElementById('bt-v-cargo').value,
      sector: document.getElementById('bt-v-sec').value,
      obra: (window.YO && YO.obra && YO.obra.nombre) || 'Obra Principal',
      experiencia_min: +document.getElementById('bt-v-exp').value || 1,
      modalidad: document.getElementById('bt-v-mod').value,
      distrito: 'Lima',
      requisitos: document.getElementById('bt-v-req').value,
      fecha_inicio: new Date().toISOString().slice(0, 10),
      estado: 'activa'
    };
    db.vacantes.push(nVac);
    _btGuardarDb(db);
    BTW.creandoVacante = false;
    toast('Vacante publicada con éxito.');
    _btPintar();
  };

  /* Pausar / Activar vacante */
  Array.prototype.forEach.call(document.querySelectorAll('[data-bt-pausar]'), function(b){
    b.onclick = function(){
      var v = db.vacantes.find(function(x){ return x.id === b.getAttribute('data-bt-pausar'); });
      if(v){ v.estado = 'pausada'; _btGuardarDb(db); _btPintar(); }
    };
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-bt-activar]'), function(b){
    b.onclick = function(){
      var v = db.vacantes.find(function(x){ return x.id === b.getAttribute('data-bt-activar'); });
      if(v){ v.estado = 'activa'; _btGuardarDb(db); _btPintar(); }
    };
  });
}
