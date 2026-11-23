/* OBRASST · portal · NOMBRAR SUPERVISORES EN LA WEB, IGUAL QUE EN LA APP (23/11/2026)
   Marcelo: «en "Equipo · Quiénes gestionan esta obra" da la opción de agregar a los supervisores, porque no lo veo en la
   web… que esté sincronizado con la app, y si puedes, analiza ello para mejorarlo».
   Lo de antes (22/11) llamaba a dos funciones que el servidor no tiene (sst_portal_equipo_listar, sst_portal_inv_revocar):
   la sección se caía. Ahora usa exactamente lo mismo que la pantalla «Nombrar supervisores» de la app:
     · sst_invitar: el código de un solo uso, amarrado al correo, al documento y al identificador fiscal de la empresa;
     · sst_invitacion: los códigos que hay (esperando, vencidos, ya usados) · revocar = borrar el código sin usar;
     · sst_solicitudes / sst_responder_solicitud: aceptar o rechazar a quien pidió entrar;
     · y, como en la app, la persona entra a la lista de trabajadores como «Prevencionista de riesgos» (por su documento:
       si ya estaba, no se duplica).
   Lo que se nombra en la web aparece en la app al abrir «Nombrar supervisores», y al revés: los dos leen el servidor.
   EQW.pintarEn(caja, {equipo, solicitudes, alCambiar}) arma el bloque; «Obras y equipo» lo usa debajo de su tabla y la
   sección «Equipo y Supervisores» lo usa entero. */
(function(){
  'use strict';
  var PUESTO_SUP = 'Prevencionista de riesgos';
  var EQW = { inv:[], sol:[], eq:[], abierto:false, enVuelo:false };
  function e(s){ return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function N(s){ return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function bonito(c){ c = N(c); return (c.length === 9 && c.slice(0, 3) === 'INV') ? 'INV-' + c.slice(3) : c; }
  function hoy(){ return (typeof hoyISO === 'function') ? hoyISO() : new Date().toISOString().slice(0, 10); }
  function fl(d){ d = String(d || '').slice(0, 10); return (typeof fechaLarga === 'function' && d) ? (fechaLarga(d) || d) : d; }
  function obra(){ return (typeof YO !== 'undefined' && YO && YO.obra) ? YO.obra : null; }
  /* quién puede nombrar: lo decide el servidor (el dueño o el segundo líder); aquí solo se muestra a ellos */
  function puede(){ var o = obra(); return !!(o && (YO.dueno === true || o.rol === 'dueno' || o.rol === 'colider' || o.papel === 'colider' || o.colider === true)); }
  function nomEmp(){ var o = obra(); return (o && (String(o.obra_nombre || '').trim() || o.nombre)) || 'nuestra empresa'; }
  function texto(papel, correo, cod, doc, vence){
    return 'Te invito a OBRASST ' + (papel === 'colider' ? 'como segundo líder SSOMA' : 'como supervisor SSOMA') + ' de ' + nomEmp() + '.' +
      '\n\n1) Entra a https://obrasstapp.com (o abre la app OBRASST)' +
      '\n2) Crea tu cuenta con este correo: ' + correo +
      '\n3) En «Tengo un código de invitación» escribe: ' + bonito(cod) +
      '\n   y tu documento: ' + N(doc) +
      '\n\nEl código vence el ' + fl(vence) + ' y entra una sola vez.';
  }
  function compartir(t){
    if(navigator.share){ navigator.share({ text:t }).catch(function(){}); return; }
    window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener');
  }
  function copiar(t){
    var ok = function(){ if(typeof toast === 'function') toast('Copiado: ya lo puedes pegar en su WhatsApp o en un correo.'); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function(){ prompt('Copia el texto:', t); });
    else prompt('Copia el texto:', t);
  }
  /* como en la app (fichaDeSupervisor): a la lista de trabajadores, por su documento, sin duplicar */
  function ficha(nombre, doc){
    var o = obra(), dni = N(doc); if(!o || dni.length < 6 || String(nombre || '').trim().length < 3) return Promise.resolve(null);
    return sbGet('sst_trabajador?duenio=eq.' + encodeURIComponent(o.id) + '&dni=eq.' + encodeURIComponent(dni) + '&select=id,puesto&limit=1').then(function(r){
      if(r && r.length) return { ya:true };
      var fila = { duenio:o.id, ext:'t' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), nombre:String(nombre).trim(), dni:dni, puesto:PUESTO_SUP, estatus:'activo' };
      return sbPostP('sst_trabajador', fila).then(function(){ return { nuevo:true }; });
    }).catch(function(){ return null; });
  }
  function traer(op){
    var o = obra(); if(!o) return Promise.resolve();
    return Promise.all([
      puede() ? sbGet('sst_invitacion?empresa_id=eq.' + encodeURIComponent(o.id) + '&select=id,codigo,correo,dni,nombre,papel,proyecto,desde,hasta,vence,creada,usada_en&order=creada.desc&limit=60').catch(function(){ return null; }) : Promise.resolve([]),
      op.solicitudes ? sbRpc('sst_solicitudes', { p_emp:o.id }).catch(function(){ return null; }) : Promise.resolve([]),
      op.equipo ? sbRpc('sst_equipo', { p_emp:o.id }).catch(function(){ return null; }) : Promise.resolve([])
    ]).then(function(r){
      EQW.inv = Array.isArray(r[0]) ? r[0] : []; EQW.invMal = !Array.isArray(r[0]);
      EQW.sol = Array.isArray(r[1]) ? r[1] : [];
      EQW.eq = Array.isArray(r[2]) ? r[2] : [];
    });
  }
  function htmlForm(){
    return '<div class="eqw-form" id="eqw-form"' + (EQW.abierto ? '' : ' hidden') + '>' +
      '<div class="eqw-grid">' +
        '<label>Correo con el que va a entrar<input id="eqw-correo" type="email" autocomplete="off" placeholder="supervisor@empresa.com"></label>' +
        '<label>Su documento<input id="eqw-doc" autocomplete="off" placeholder="DNI o carné de extranjería" style="text-transform:uppercase"></label>' +
        '<label>Nombre y apellido<input id="eqw-nom" autocomplete="off" placeholder="Nombre Apellido"></label>' +
        '<label>¿Qué va a ser?<select id="eqw-papel"><option value="gestor">🦺 Supervisor de una obra</option><option value="colider">🎖️ Segundo líder (ve todas las obras y nombra)</option></select></label>' +
        '<label>Obra o frente que se le encarga <small>(opcional)</small><input id="eqw-proy" autocomplete="off" placeholder="Obra, etapa o frente"></label>' +
        '<label>Desde <small>(opcional)</small><input id="eqw-desde" type="date" value="' + e(hoy()) + '"></label>' +
        '<label>Hasta <small>(opcional)</small><input id="eqw-hasta" type="date"></label>' +
        '<label>El código vence en<select id="eqw-dias"><option value="7">7 días</option><option value="15" selected>15 días</option><option value="30">30 días</option></select></label>' +
      '</div>' +
      '<p class="ayuda" style="margin:8px 0">El correo tiene que ser el mismo de su cuenta, letra por letra. Con su nombre y documento entra también a tu lista de trabajadores como «' + PUESTO_SUP + '» (si ya estaba, no se repite).</p>' +
      '<div class="eqw-acc"><button type="button" class="bt" id="eqw-generar">Generar el código</button><button type="button" class="bt sec" id="eqw-cancelar">Cancelar</button></div>' +
      '<p class="msg" id="eqw-msg" role="status"></p><div id="eqw-hecho"></div></div>';
  }
  function htmlInv(){
    if(!puede()) return '';
    if(EQW.invMal) return '<p class="ayuda">No se pudieron leer los códigos de invitación. Revisa tu conexión.</p>';
    var L = EQW.inv.filter(function(i){ return !i.usada_en; });
    if(!L.length) return '';
    return '<div class="eqw-inv"><b>Códigos de invitación sin usar (' + L.length + ')</b>' + L.map(function(i){
      var k = EQW.inv.indexOf(i), venc = String(i.vence || '') < hoy();
      return '<div class="eqw-fila"><div><b>' + e(i.nombre || i.correo) + '</b> ' + (venc ? '<span class="pill gris">⌛ venció</span>' : '<span class="pill ojo">⏳ esperando</span>') +
        '<small>' + (i.papel === 'colider' ? '🎖️ Segundo líder' : '🦺 Supervisor') + ' · ' + e(i.correo || '') + (i.proyecto ? ' · ' + e(i.proyecto) : '') +
        ' · código <b class="mono">' + e(bonito(i.codigo)) + '</b> · ' + (venc ? 'venció el ' : 'vence el ') + e(fl(i.vence)) + '</small></div>' +
        '<div class="eqw-acc">' + (venc ? '' : '<button type="button" class="bt sec chico" data-eqw="pasar" data-k="' + k + '">📲 Pasarlo</button><button type="button" class="bt sec chico" data-eqw="copiar" data-k="' + k + '">📋 Copiar</button>') +
        '<button type="button" class="bt sec chico" data-eqw="revocar" data-k="' + k + '">Revocar</button></div></div>';
    }).join('') + '</div>';
  }
  function htmlSol(){
    if(!EQW.sol.length) return '<div class="vacio"><b>Ninguna pendiente</b>Quien pida entrar con el código de la obra aparece aquí y en la app.</div>';
    return '<div class="eqw-sol">' + EQW.sol.map(function(s, i){
      return '<div class="eqw-fila"><div><b>' + e(s.nombre || s.correo || '—') + '</b>' + (s.cargo ? ' · ' + e(s.cargo) : '') + '<small>' + e(s.correo || '') + (s.mensaje ? ' · «' + e(s.mensaje) + '»' : '') + '</small></div>' +
        (puede() ? '<div class="eqw-acc"><button type="button" class="bt chico" data-eqw="aceptar" data-k="' + i + '">Aceptar</button><button type="button" class="bt sec chico" data-eqw="rechazar" data-k="' + i + '">Rechazar</button></div>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function htmlEquipo(){
    if(!EQW.eq.length) return '<div class="vacio"><b>Solo tú</b>Nombra a tu primer supervisor con el botón de arriba.</div>';
    return '<div class="tabla-caja"><table><thead><tr><th>Correo</th><th>Papel</th><th>Estado</th></tr></thead><tbody>' + EQW.eq.map(function(m){
      return '<tr><td>' + e(m.correo || '') + (m.soy_yo ? ' <span class="pill azul">tú</span>' : '') + '</td><td>' + (m.rol === 'dueno' ? 'Líder' : (m.rol === 'colider' ? 'Segundo líder' : 'Supervisor')) + '</td>' +
        '<td>' + (m.estado === 'activo' ? '<span class="pill ok">activo</span>' : '<span class="pill gris">' + e(m.estado || '') + '</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function estilos(){
    if(document.getElementById('eqw-css')) return;
    var st = document.createElement('style'); st.id = 'eqw-css';
    st.textContent = '.eqw-top{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0 0}' +
      '.eqw-form{margin:12px 0 0;padding:14px;border:1px solid var(--borde,#E2E8F0);border-radius:12px;background:var(--fondo2,#F8FAFC)}' +
      '.eqw-form[hidden]{display:none!important}' +
      '.eqw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px 12px}' +
      '.eqw-grid label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;font-weight:600}' +
      '.eqw-grid input,.eqw-grid select{font:inherit;font-weight:400;font-size:14px;padding:8px 10px;border:1px solid var(--borde,#CBD5E1);border-radius:9px;background:#fff;color:inherit}' +
      '.eqw-acc{display:flex;gap:6px;flex-wrap:wrap;align-items:center}' +
      '.eqw-inv,.eqw-sol{display:flex;flex-direction:column;gap:8px;margin:14px 0 0}' +
      '.eqw-fila{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--borde,#E2E8F0);border-radius:10px}' +
      '.eqw-fila small{display:block;color:var(--gris,#64748B);margin-top:2px}' +
      '.eqw-cod{margin:12px 0 0;padding:14px;border:2px solid #F5B700;border-radius:12px;background:#FFFBEB;text-align:center}' +
      '.eqw-cod .n{font-size:28px;font-weight:800;letter-spacing:.1em;margin:8px 0}' +
      '.mono{font-family:ui-monospace,Menlo,Consolas,monospace}';
    document.head.appendChild(st);
  }
  /* caja: donde va · op: { equipo:bool (la tabla), solicitudes:host de las solicitudes (elemento) o true, alCambiar:fn } */
  function pintarEn(caja, op){
    op = op || {}; if(!caja) return Promise.resolve();
    estilos();
    caja.innerHTML = '<p class="ayuda">Cargando el equipo…</p>';
    return traer({ equipo:!!op.equipo, solicitudes:!!op.solicitudes }).then(function(){ pinta(caja, op); });
  }
  function pinta(caja, op){
    var h = '';
    if(op.equipo) h += htmlEquipo();
    if(puede()) h += '<div class="eqw-top"><button type="button" class="bt" id="eqw-abrir">＋ Nombrar supervisor</button><span class="ayuda">Entra con su propia cuenta; lo que registre se junta con lo tuyo. Igual que en la app.</span></div>' + htmlForm();
    else h += '<p class="ayuda" style="margin:12px 0 0">Los supervisores los nombra el líder de la obra (o su segundo líder), aquí o en la app.</p>';
    h += htmlInv();
    caja.innerHTML = h;
    var solHost = (op.solicitudes && op.solicitudes.nodeType === 1) ? op.solicitudes : null;
    if(solHost) solHost.innerHTML = htmlSol();
    else if(op.solicitudes){ var d = document.createElement('div'); d.innerHTML = '<h3 style="margin:18px 0 0">Solicitudes de acceso</h3>' + htmlSol(); caja.appendChild(d); }
    var clic = function(ev){
      var b = ev.target.closest ? ev.target.closest('[data-eqw]') : null; if(!b) return;
      var k = +b.getAttribute('data-k'), a = b.getAttribute('data-eqw');
      if(a === 'pasar' || a === 'copiar'){ var i = EQW.inv[k]; if(!i) return; var t = texto(i.papel, i.correo, i.codigo, i.dni, i.vence); if(a === 'pasar') compartir(t); else copiar(t); return; }
      if(a === 'revocar'){
        var iv = EQW.inv[k]; if(!iv) return;
        confirmar('¿Revocar la invitación?', 'El código ' + bonito(iv.codigo) + ' deja de servir y el puesto de gestión queda libre.', { si:'Sí, revocar', mal:true }).then(function(si){
          if(!si) return;
          sbDelP('sst_invitacion?id=eq.' + encodeURIComponent(iv.id)).then(function(){ toast('Invitación revocada.'); pintarEn(caja, op); if(op.alCambiar) op.alCambiar(); },
            function(){ toast('No se pudo revocar: revisa tu conexión.'); });
        });
        return;
      }
      if(a === 'aceptar' || a === 'rechazar'){
        var s = EQW.sol[k]; if(!s) return;
        var va = function(){
          b.disabled = true;
          sbRpc('sst_responder_solicitud', { p_id:s.id, p_aceptar:a === 'aceptar' }).then(function(j){
            if(!j || !j.ok){ b.disabled = false; toast(j && j.motivo === 'tope_gestores' ? 'Ya tienes ocupados tus ' + (j.tope || 1) + ' puestos de gestión. Revoca un código sin usar o suma un puesto.' : 'No se pudo. Inténtalo otra vez.'); return; }
            toast(a === 'aceptar' ? (s.nombre || s.correo) + ' ya es parte del equipo.' : 'Solicitud rechazada.');
            pintarEn(caja, op); if(op.alCambiar) op.alCambiar();
          }, function(){ b.disabled = false; toast('No se pudo: revisa tu conexión.'); });
        };
        if(a === 'rechazar') confirmar('¿Rechazar a ' + (s.nombre || s.correo) + '?', 'No va a poder ver la información de la obra.', { si:'Sí, rechazar', mal:true }).then(function(si){ if(si) va(); });
        else va();
      }
    };
    caja.onclick = clic; if(solHost) solHost.onclick = clic;
    var ab = document.getElementById('eqw-abrir');
    if(ab) ab.onclick = function(){ EQW.abierto = true; var f = document.getElementById('eqw-form'); if(f){ f.hidden = false; var c = document.getElementById('eqw-correo'); if(c) c.focus(); } };
    var ca = document.getElementById('eqw-cancelar');
    if(ca) ca.onclick = function(){ EQW.abierto = false; var f = document.getElementById('eqw-form'); if(f) f.hidden = true; };
    var gn = document.getElementById('eqw-generar');
    if(gn) gn.onclick = function(){ generar(gn, caja, op); };
  }
  function generar(b, caja, op){
    if(EQW.enVuelo) return;
    var v = function(id){ return String((document.getElementById(id) || {}).value || '').trim(); }, m = document.getElementById('eqw-msg');
    var correo = v('eqw-correo').toLowerCase(), doc = v('eqw-doc'), nom = v('eqw-nom'), proy = v('eqw-proy'), desde = v('eqw-desde'), hasta = v('eqw-hasta');
    var dias = parseInt(v('eqw-dias'), 10) || 15, papel = v('eqw-papel') === 'colider' ? 'colider' : 'gestor';
    var mal = function(t){ m.className = 'msg mal'; m.textContent = t; };
    if(correo.indexOf('@') < 1 || correo.lastIndexOf('.') < correo.indexOf('@')) return mal('Escribe el correo con el que esa persona va a entrar. Tiene que ser el mismo, letra por letra.');
    if(N(doc).length < 6) return mal('Falta su documento de identidad (mínimo 6 caracteres, sin puntos ni guiones).');
    if(nom.length < 3) return mal('Escribe su nombre y apellido. Con eso entra también a tu lista de trabajadores.');
    if(hasta && desde && hasta < desde) return mal('La fecha de término no puede ser antes que la de inicio.');
    EQW.enVuelo = true; b.disabled = true; m.className = 'msg gris'; m.textContent = 'Generando el código…';
    sbRpc('sst_invitar', { p_emp:obra().id, p_correo:correo, p_dni:doc, p_nombre:nom, p_proyecto:proy || null, p_desde:desde || null, p_hasta:hasta || null, p_dias:dias, p_papel:papel }).then(function(j){
      EQW.enVuelo = false; b.disabled = false;
      if(!j || !j.ok){
        var q = (j && j.error) || '';
        return mal(q === 'no_eres_dueno' ? 'Solo quien activó el plan (o su segundo líder) puede nombrar supervisores.' :
          q === 'ruc_invalido' ? 'La empresa no tiene un identificador fiscal válido (RUC, RNC, RUT, NIT…) y el código va amarrado a él. Revísalo en «Datos y logo».' :
          q === 'correo_invalido' ? 'Ese correo no se ve bien escrito. Revísalo.' :
          q === 'doc_invalido' ? 'El documento de identidad es muy corto (mínimo 6 caracteres).' :
          q === 'ya_invitado' ? 'Ese correo ya tiene un código sin usar: está abajo. Pásaselo otra vez o revócalo y haz uno nuevo.' :
          q === 'tope_gestores' ? 'Tienes ocupados tus ' + ((j && j.tope) || 1) + ' puestos de gestión. Revoca un código sin usar o suma un puesto en «Mi plan».' :
          q === 'sin_sesion' ? 'Vuelve a entrar a tu cuenta.' : 'No se pudo generar el código.');
      }
      m.className = 'msg'; m.textContent = '';
      var t = texto(j.papel || papel, correo, j.codigo, doc, j.vence);
      return ficha(nom, doc).then(function(F){
        EQW.abierto = true;
        return traer({ equipo:!!op.equipo, solicitudes:!!op.solicitudes }).then(function(){
          pinta(caja, op);
          var hc = document.getElementById('eqw-hecho'), f = document.getElementById('eqw-form'); if(f) f.hidden = false;
          if(hc) hc.innerHTML = '<div class="eqw-cod"><b>Listo. Este es su código:</b><div class="n mono">' + e(bonito(j.codigo)) + '</div>' +
            '<p class="ayuda" style="margin:0 0 10px">Para ' + e(correo) + ', con documento ' + e(N(doc)) + ', ' + ((j.papel || papel) === 'colider' ? 'como segundo líder' : 'como supervisor') + '. Vence el ' + e(fl(j.vence)) + '. También aparece en la app.</p>' +
            '<div class="eqw-acc" style="justify-content:center"><button type="button" class="bt" id="eqw-pasar">📲 Mandárselo</button><button type="button" class="bt sec" id="eqw-copiar">📋 Copiar las instrucciones</button></div>' +
            (F && F.nuevo ? '<p class="ayuda" style="margin:10px 0 0">Además entró a tu lista de trabajadores como ' + PUESTO_SUP + '. Si su puesto es otro, cámbialo en su ficha.</p>' :
              (F && F.ya ? '<p class="ayuda" style="margin:10px 0 0">Ya estaba en tu lista de trabajadores con ese documento: no se repitió.</p>' : '')) + '</div>';
          var p1 = document.getElementById('eqw-pasar'), p2 = document.getElementById('eqw-copiar');
          if(p1) p1.onclick = function(){ compartir(t); }; if(p2) p2.onclick = function(){ copiar(t); };
          if(op.alCambiar) op.alCambiar();
        });
      });
    }, function(){ EQW.enVuelo = false; b.disabled = false; mal('No se pudo: revisa tu conexión.'); });
  }
  /* la sección «Equipo y Supervisores» (Personal): todo junto */
  function abrirEquipoPortal(hostId){
    var host = document.getElementById(hostId || 'eqp-portal-host'); if(!host) return;
    host.innerHTML = '<div class="tarj"><div class="tarj-cab"><div><h2>Equipo y supervisores</h2><p class="sub">Quiénes gestionan esta obra · lo mismo que «Nombrar supervisores» en la app</p></div></div><div class="tarj-cu" id="eqw-cuerpo" style="padding:14px 18px"></div></div>';
    pintarEn(document.getElementById('eqw-cuerpo'), { equipo:true, solicitudes:true });
  }
  window.EQW = { pintarEn:pintarEn, _st:EQW };
  window.abrirEquipoPortal = abrirEquipoPortal;
})();
