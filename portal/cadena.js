/* OBRASST · el portal · LA CADENA DE SUPERVISIÓN (05/10/2026)
   Marcelo: «No, quiero que lo apliques.» — Central de verdad, y hacia arriba.
   Una sola relación que se repite: «A supervisa a B en esta obra». Con ella salen la principal y sus
   subcontratas, y encima de la principal el cliente, la supervisión y el regulador. Cada empresa en su propio
   espacio de OBRASST; nadie edita lo ajeno; el historial solo crece.
   Este archivo se pide al abrir «Empresas de la obra», «Observaciones» o «Rangos del equipo», o al llegar con
   una invitación (…/?cad=<ficha>). Lo que hace falta desde el arranque (el menú, sus contadores, la ficha de la
   dirección) vive en index.html: CADP, cadTraer, cadVistasEn, cadRail, cadFicha.
   Servidor: sql/2026-10-25-cadena.sql (funciones sst_cad_*). Todo se pide y se escribe por ellas: las tablas no
   se leen directo. Las cifras de cada empresa las calcula el servidor de sus registros.
   No editar la versión: la sella armar.py (CADENA_VER). */
var CAD = { caja:null, cual:'', f:{ lado:'', est:'', enlace:'', riesgo:'' }, obs:{}, reloj:null, enviando:false };
var CAD_RIESGO = { alto:{ t:'Alto', cl:'mal' }, medio:{ t:'Medio', cl:'ojo' }, bajo:{ t:'Bajo', cl:'gris' } };
var CAD_PAPEL = { principal:'Contratista principal', cliente:'Cliente', supervision:'Supervisión', regulador:'Regulador' };
var CAD_RANGO = { supervisor:'Supervisor', jefe:'Jefe', gerente:'Gerente' };
var CAD_QUE = { observa:'Observó', levanta:'Levantó', rechaza:'No la dio por levantada', valida:'Validó y cerró', nota:'Nota', anula:'Anuló' };
var CAD_MOTIVO = {
  sin_sesion:'Tu sesión venció: vuelve a entrar.', no_eres_de_la_obra:'Esta cuenta no es de esta obra.', no_existe:'Eso ya no existe o no es de tu empresa.',
  rango:'Eso lo hace el jefe o el gerente de tu empresa (se ve en «Rangos del equipo»).', nombre:'Escribe el nombre de la empresa (al menos 3 letras).',
  sin_central:'Para invitar empresas, esta obra necesita OBRASST Central activo.', ya_esta:'Esa empresa ya está invitada o ya está en la obra.',
  muy_seguido:'Demasiadas veces seguidas. Espera un minuto y vuelve a intentar.', no_activa:'Ese enlace ya no está activo.',
  solo_lectura:'A esa empresa la ves en modo de solo lectura: no puedes dejarle observaciones.', riesgo:'Elige el riesgo.',
  titulo:'Escribe qué viste (al menos unas palabras).', foto:'La foto no subió bien. Vuelve a elegirla.', ext:'No se pudo guardar. Vuelve a intentar.',
  datos:'Revisa lo escrito.', nota:'Escribe un poco más.', ya_levantada:'Ya estaba levantada: espera la validación.', cerrada:'Esa observación ya está cerrada.',
  no_levantada:'Todavía no la levantan.', muchas:'Esa observación ya tiene demasiadas notas.', fijo:'A la contratista principal no se le cambia lo que ve: es parte de trabajar en su obra.',
  no_es_del_equipo:'Esa persona ya no es del equipo.', rango_raro:'Ese rango no existe.', vencida:'Esa invitación venció: pide que te manden otra.',
  ya_aceptada:'Esa invitación ya fue aceptada por otra cuenta.', anulada:'Esa invitación fue retirada.', es_tu_obra:'Eres del equipo de la obra que invita: nadie se supervisa a sí mismo.',
  no_eres_dueno:'Para enlazar esa obra tienes que ser su dueño.', vuelta:'Esa obra ya está del otro lado de esta misma relación.'
};
function cadMotivo(j, e){
  if(j && j.motivo === 'tope') return 'Ya están ocupados los ' + (j.tope || '') + ' lugares de esta obra. Para sumar más, escríbenos.';
  if(j && j.motivo === 'ruc') return 'Revisa el ' + cadDocN(j.pais) + ': no se reconoce.';
  if(j && j.motivo && CAD_MOTIVO[j.motivo]) return CAD_MOTIVO[j.motivo];
  if(e === 404) return 'El servidor todavía no tiene esta función. Avísanos.';
  return (typeof porQueFallo === 'function' && e !== undefined) ? porQueFallo(e) : 'No se pudo. Inténtalo otra vez.';
}
/* El espacio que se le abre a quien acepta se llama «<su empresa> · <la obra que invita>»: en SU lista de obras eso
   dice de qué obra es. Visto desde la obra que invitó, la cola sobra: es el nombre de mi propia obra. */
function cadCorto(n){
  n = String(n == null ? '' : n); var cola = ' · ' + String((YO.obra || {}).nombre || '');
  return (cola.length > 3 && n.length > cola.length && n.slice(-cola.length) === cola) ? n.slice(0, -cola.length) : n;
}
function cadIni(){ return (CADP.ini && CADP.ini.ok && YO.obra && CADP.de === String(YO.obra.id)) ? CADP.ini : null; }
function cadDocN(p){ try{ return (typeof OBRA_PAIS_DOC !== 'undefined' && OBRA_PAIS_DOC[p || paisObraP()]) || 'RUC'; }catch(e){ return 'RUC'; } }
function cadYo(){ return String((typeof YO !== 'undefined' && YO.nombre) || (TOK && (TOK.cap || TOK.nombre)) || (typeof quienSoy === 'function' ? quienSoy() : '') || '').slice(0, 80); }
function cadCargo(){ var i = cadIni(); return i ? (CAD_RANGO[i.rango] || '') : ''; }
function _cadN(n){ return String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function _cadPct(a, b){ return b ? Math.round(a / b * 100) + ' %' : '—'; }
function _cadHace(ms){
  ms = Math.abs(ms); var m = Math.round(ms / 60000);
  if(m < 60) return Math.max(1, m) + ' min';
  var h = Math.round(m / 60); if(h < 48) return h + ' h';
  return Math.round(h / 24) + ' días';
}
function _cadPlazo(h){ h = +h || 0; return h < 48 ? h + ' horas' : (Math.round(h / 24 * 10) / 10) + ' días'; }
function _cadHora(t){ var d = new Date(t); return isNaN(d) ? '' : (fechaLarga(d.toISOString()) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)); }
function _cadFechaD(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
function _cadAcc(html){ var ac = $('acciones'); if(ac) ac.innerHTML = html || ''; }
function _cadExt(){ var s = 'p'; for(var i = 0; i < 19; i++) s += 'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36)); return s; }
var CAD_PREFIJO = { pe:'51', cl:'56', co:'57', ar:'54', 'do':'1', uy:'598', py:'595', mx:'52', us:'1', ca:'1' };
function _cadWA(cel, txt){
  var d = String(cel || '').trim(), n = d.replace(/\D/g, '');
  if(n && d.charAt(0) !== '+'){ var p = '51'; try{ p = CAD_PREFIJO[paisObraP()] || '51'; }catch(e){} if(n.indexOf(p) !== 0 || n.length <= 9) n = p + n; }
  return 'https://wa.me/' + n + '?text=' + encodeURIComponent(txt);
}
/* el enlace de una invitación: el portal, con su ficha */
function cadEnlaceDe(token){
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  return (local ? location.origin + location.pathname : 'https://obrasstapp.com/') + '?cad=' + token;
}
function cadRiesgoHTML(r){ var R = CAD_RIESGO[r] || CAD_RIESGO.bajo; return '<span class="cad-riesgo ' + esc(r) + '">' + R.t + '</span>'; }
function cadEstadoHTML(o){
  if(o.estado === 'cerrada') return '<span class="pill ok">Cerrada</span>';
  if(o.estado === 'anulada') return '<span class="pill gris">Anulada</span>';
  if(o.estado === 'levantada') return '<span class="pill azul">Levantada · por validar</span>';
  var falta = new Date(o.vence).getTime() - Date.now();
  if(falta < 0) return '<span class="pill mal">Vencida hace ' + _cadHace(falta) + '</span>';
  return '<span class="pill ' + (falta < 6 * 3600000 ? 'ojo' : 'gris') + '">Vence en ' + _cadHace(falta) + '</span>';
}
function cadEstadoT(o){
  if(o.estado === 'abierta') return (new Date(o.vence).getTime() < Date.now()) ? 'Vencida' : 'Abierta';
  return { cerrada:'Cerrada', anulada:'Anulada', levantada:'Levantada · por validar' }[o.estado] || o.estado;
}
/* a quién se parece cada enlace, dicho en una palabra */
function cadClaseAbajo(l){ return l.clase === 'subcontrata' ? 'Subcontrata' : 'Obra que supervisas'; }
function cadClaseArriba(l){ return l.clase === 'subcontrata' ? 'Contratista principal' : (CAD_PAPEL[l.papel] || 'Supervisión'); }
function _cadBarra(a, b){
  var x = b ? a / b : 0;
  return '<span class="cad-nw"><span class="cad-barra"><i style="width:' + Math.round(x * 100) + '%"' + (b && x < 0.85 ? ' class="ojo"' : '') + '></i></span><span class="cad-pct">' + _cadPct(a, b) + '</span></span>';
}

/* ══ la puerta: qué sección, con la portada al día ══════════════════════════════════════ */
function cadPintar(cual, caja){
  _cadCss();
  CAD.caja = caja; CAD.cual = cual;
  CAD.obs = {};       /* al abrir la sección, las listas se piden de nuevo: lo que hizo la otra empresa ya está */
  var pinta = function(){
    if(!caja.isConnected) return;
    var i = cadIni();
    if(!i){ caja.innerHTML = '<div class="vacio"><b>No se pudo cargar</b>Revisa tu conexión y vuelve a abrir esta sección.</div>'; return; }
    if(cual === 'obs') cadVistaObs(caja); else if(cual === 'equipo') cadVistaEquipo(caja); else cadVistaInicio(caja);
  };
  /* lo guardado se pinta ya; y se pide lo nuevo */
  if(cadIni()) pinta();
  cadTraer(true).then(function(){ if(CAD.caja === caja && CAD.cual === cual && !_cadOcupado()) pinta(); });
  clearInterval(CAD.reloj);
  CAD.reloj = setInterval(function(){
    if(!/^cad(-|$)/.test(VISTA.actual || '') || !CAD.caja || !CAD.caja.isConnected){ clearInterval(CAD.reloj); return; }
    if(document.hidden || _cadOcupado()) return;
    CAD.obs = {};
    cadTraer(true).then(function(){ if(!_cadOcupado() && CAD.caja && CAD.caja.isConnected) cadRepintar(); });
  }, 60000);
}
/* con un cajón o un diálogo abierto, o con algo escrito en un buscador, no se repinta debajo */
function _cadOcupado(){
  if(typeof HOJA !== 'undefined' && HOJA.abierta) return true;
  var d = $('dialogo-fondo'); if(d && !d.hidden) return true;
  var a = document.activeElement; return !!(a && CAD.caja && CAD.caja.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
}
function cadRepintar(){
  if(!CAD.caja || !CAD.caja.isConnected) return;
  if(CAD.cual === 'obs') cadVistaObs(CAD.caja); else if(CAD.cual === 'equipo') cadVistaEquipo(CAD.caja); else cadVistaInicio(CAD.caja);
}
/* después de escribir algo: la portada y las listas, de nuevo */
function cadAlDia(){ CAD.obs = {}; return cadTraer(true).then(function(){ cadRepintar(); }); }

/* ══ EMPRESAS DE LA OBRA ═══════════════════════════════════════════════════════════════ */
function cadVistaInicio(caja){
  var i = cadIni(); if(!i) return;
  var abajo = (i.abajo || []).filter(function(l){ return l.estado === 'activa'; }), arriba = (i.arriba || []).filter(function(l){ return l.estado === 'activa'; });
  var invAb = (i.abajo || []).filter(function(l){ return l.estado === 'invitada'; }), invAr = (i.arriba || []).filter(function(l){ return l.estado === 'invitada'; });
  var c = i.cuenta || {}, puedo = i.puedo || {}, cen = i.central || {};
  var observa = abajo.some(function(l){ return l.modo === 'observa'; });
  _cadAcc((observa ? '<button type="button" class="bt" id="cad-b-obs">＋ Nueva observación</button>' : '') +
    ((puedo.invitar_sub || puedo.invitar_arriba) ? '<button type="button" class="bt' + (observa ? ' sec' : '') + '" id="cad-b-inv">Invitar a una empresa</button>' : '') +
    '<button type="button" class="bt sec" id="cad-b-pegar">Tengo una invitación</button>');
  var h = '';
  if(!cadHay()){
    h += '<div class="tarj"><div class="tarj-cuerpo cad-que">' +
      '<h2>Las empresas de tu obra, en un solo tablero</h2>' +
      '<p>En una obra trabajan varias empresas: la contratista principal, sus subcontratas, y encima el cliente y la supervisión. Aquí se enlazan. ' +
      'Cada una lleva su propio OBRASST; la que supervisa ve las cifras del día de la otra, le deja observaciones con foto y plazo, y valida cuando las levanta. Lo que vence sube solo al jefe y al gerente.</p>' +
      '<div class="cad-que-2"><div><b>¿Te invitaron a una obra?</b><span>Abre el enlace que te mandaron, o pégalo aquí. Tu empresa recibe su espacio para esa obra.</span>' +
      '<button type="button" class="bt" id="cad-q-pegar">Tengo una invitación</button></div>' +
      '<div><b>¿Eres la contratista principal?</b><span>Con OBRASST Central invitas a tus subcontratas por su ' + esc(cadDocN()) + ' (entran gratis) y a quien te supervisa. Se activa por obra.</span>' +
      '<a class="bt sec" href="central.html" target="_blank" rel="noopener">Ver OBRASST Central</a></div></div></div></div>';
    caja.innerHTML = h;
    $('cad-q-pegar').onclick = cadPegarInvitacion; $('cad-b-pegar').onclick = cadPegarInvitacion;
    return;
  }
  /* lo que subió a mi rango */
  if(c.subio) h += '<button type="button" class="cad-subio" id="cad-subio"><span class="cad-subio-n">' + c.subio + '</span><span><b>' +
    (c.subio === 1 ? 'Subió a ti una observación vencida' : 'Subieron a ti ' + c.subio + ' observaciones vencidas') + '</b><small>' +
    (i.rango === 'gerente' ? 'Llevan más de un día vencidas sin levantarse.' : 'Vencieron sin levantarse.') + '</small></span><span class="cad-subio-ir">Ver ›</span></button>';
  /* las cifras */
  var tot = { gente:0, cap:0, ab:0, ven:0, lev:0, at:0 };
  abajo.forEach(function(l){ var x = l.ind || {}, o = l.obs || {}; tot.gente += x.gente || 0; tot.cap += x.cap || 0; tot.ab += o.ab || 0; tot.ven += o.ven || 0; tot.lev += o.lev || 0; tot.at += o.a_tiempo || 0; });
  h += '<div class="rej cad-cifras">';
  if(abajo.length) h += cifra(abajo.length === 1 ? 'Empresa que supervisas' : 'Empresas que supervisas', String(abajo.length), _cadN(tot.gente) + (tot.gente === 1 ? ' persona hoy' : ' personas hoy'), '') +
    cifra('Capacitación vigente', _cadPct(tot.cap, tot.gente), tot.gente ? _cadN(tot.gente - tot.cap) + ' sin capacitación en 12 meses' : 'sin personal registrado', (tot.gente && tot.cap / tot.gente < 0.85) ? 'ojo' : (tot.gente ? 'ok' : '')) +
    cifra('Observaciones abiertas', String(tot.ab), tot.ven ? tot.ven + (tot.ven === 1 ? ' vencida' : ' vencidas') : 'ninguna vencida', tot.ven ? 'mal' : '') +
    cifra('Por validar', String(c.por_validar || 0), c.por_validar ? 'ya las levantaron: falta tu visto bueno' : 'nada esperando', c.por_validar ? 'ojo' : '') +
    cifra('Levantadas a tiempo', _cadPct(tot.at, tot.lev), 'últimos 30 días', '');
  if(arriba.length) h += cifra('Por levantar', String(c.por_levantar || 0), c.vencidas_mias ? c.vencidas_mias + (c.vencidas_mias === 1 ? ' vencida' : ' vencidas') : (c.por_levantar ? 'en plazo' : 'nada pendiente'), c.vencidas_mias ? 'mal' : (c.por_levantar ? 'ojo' : 'ok'));
  h += '</div>';
  /* a quién superviso */
  if(abajo.length || invAb.length || cen.activo){
    h += '<div class="tarj"><div class="tarj-cab"><div><h2>Empresas que supervisas</h2><p class="sub">Las cifras salen de lo que cada empresa registra en su OBRASST · toca una para ver su ficha</p></div>' +
      (cen.activo && cen.tope ? '<span class="pill ' + ((cen.usadas || 0) >= cen.tope ? 'ojo' : 'gris') + '">' + (cen.usadas || 0) + ' de ' + cen.tope + ' subcontratas</span>' : '') + '</div>';
    if(abajo.length){
      h += '<div class="tabla-caja"><table class="cad-emps"><thead><tr><th>Empresa</th><th class="num" title="Personal activo en su padrón">Gente</th><th title="Con una capacitación aprobada en los últimos 12 meses">Capacitación</th>' +
        '<th class="num" title="Con V°B° de seguridad / hechos hoy">ATS hoy</th><th class="num" title="Reportes de acto o condición sin cerrar">Reportes</th><th class="num" title="Tus observaciones sin levantar">Abiertas</th>' +
        '<th class="num" title="Pasaron su plazo sin levantarse">Vencidas</th><th title="Lo último que registró en su OBRASST">Actividad</th></tr></thead><tbody>';
      abajo.forEach(function(l){
        var x = l.ind || {}, o = l.obs || {};
        h += '<tr class="clic" data-enl="' + esc(l.id) + '" tabindex="0"><td><b class="cad-emp-n">' + esc(cadCorto(l.nombre)) + '</b><small class="cad-emp-r">' + esc(cadClaseAbajo(l)) +
          (l.modo === 'lectura' ? ' · solo lectura' : '') + (l.ruc ? ' · ' + esc(cadDocN()) + ' ' + esc(l.ruc) : '') + '</small></td>' +
          '<td class="num">' + _cadN(x.gente) + '</td><td>' + (x.gente ? _cadBarra(x.cap || 0, x.gente) : '<span class="cad-gris">—</span>') + '</td>' +
          '<td class="num' + ((x.ats || 0) > (x.ats_ok || 0) ? ' cad-ojo' : '') + '" title="Con V°B° de seguridad / hechos hoy">' + (x.ats ? (x.ats_ok || 0) + '/' + x.ats : '—') + '</td>' +
          '<td class="num">' + (x.rep_ab || 0) + '</td><td class="num">' + (o.ab || 0) + '</td><td class="num' + (o.ven ? ' cad-mal' : '') + '">' + (o.ven || 0) + '</td>' +
          '<td>' + (x.ult ? esc(hace(x.ult)) : '<span class="cad-gris">sin registros</span>') + '</td></tr>';
      });
      h += '</tbody></table></div>';
    } else h += '<div class="vacio"><b>Todavía no supervisas a ninguna empresa</b>' + (puedo.invitar_sub ? 'Invita a tu primera subcontrata: entra gratis, con su ' + esc(cadDocN()) + '.' : 'Cuando una empresa acepte la invitación, aparece aquí.') + '</div>';
    if(invAb.length) h += '<div class="tarj-cuerpo cad-invs"><h3 class="cad-h3">Invitaciones por aceptar</h3>' + invAb.map(cadInvHTML).join('') + '</div>';
    h += '</div>';
  }
  /* quién me supervisa */
  if(arriba.length || invAr.length || puedo.invitar_arriba){
    h += '<div class="tarj"><div class="tarj-cab"><div><h2>Quién te supervisa</h2><p class="sub">Ven tus cifras del día; si lo permite el enlace, te dejan observaciones. No ven nada de tus otras obras</p></div></div>';
    if(arriba.length){
      h += '<ul class="cad-arriba">' + arriba.map(function(l){
        var o = l.obs || {};
        return '<li data-enl="' + esc(l.id) + '"><div class="cad-ar-1"><b>' + esc(cadCorto(l.nombre)) + '</b><span class="pill azul">' + esc(cadClaseArriba(l)) + '</span></div>' +
          '<div class="cad-ar-2"><span>' + (l.modo === 'observa' ? 'Te deja observaciones' : 'Solo mira') + '</span><span>' + (l.ve === 'detalle' ? 'Ve tus cifras, tu personal y tus ATS' : 'Ve solo tus cifras') + '</span>' +
          '<span' + (o.ven ? ' class="cad-mal"' : '') + '>' + (o.ab || 0) + (o.ab === 1 ? ' observación abierta' : ' observaciones abiertas') + (o.ven ? ' · ' + o.ven + (o.ven === 1 ? ' vencida' : ' vencidas') : '') + '</span></div>' +
          '<div class="cad-ar-3">' + ((o.ab || o.val) ? '<button type="button" class="bt chico" data-ar-obs="' + esc(l.id) + '">Ver sus observaciones</button>' : '') +
          (l.clase === 'supervision' && i.rango !== 'supervisor' ? '<button type="button" class="bt sec chico" data-ar-cambiar="' + esc(l.id) + '">Cambiar lo que ve</button>' : '') +
          (i.rango !== 'supervisor' ? '<button type="button" class="bt sec chico" data-ar-fin="' + esc(l.id) + '">Terminar</button>' : '') + '</div></li>';
      }).join('') + '</ul>';
    } else h += '<div class="vacio"><b>Nadie te supervisa todavía en esta obra</b>' + (puedo.invitar_arriba ? 'Puedes invitar a tu cliente o a la supervisión: ven tus cifras sin pedirte reportes.' : '') + '</div>';
    if(invAr.length) h += '<div class="tarj-cuerpo cad-invs"><h3 class="cad-h3">Invitaciones por aceptar</h3>' + invAr.map(cadInvHTML).join('') + '</div>';
    h += '</div>';
  }
  /* Central */
  if(cen.activo){
    var pz = cen.plazos || {};
    h += '<p class="cad-pie">OBRASST Central activo' + (cen.hasta ? ' hasta el ' + esc(_cadFechaD(cen.hasta)) : '') + ' · plazos de esta obra: riesgo alto ' + _cadPlazo(pz.alto || 24) + ', medio ' + _cadPlazo(pz.medio || 72) +
      ', bajo ' + _cadPlazo(pz.bajo || 168) + ' · tu rango: ' + esc(CAD_RANGO[i.rango] || '') + '</p>';
  } else h += '<p class="cad-pie">Tu rango en esta empresa: ' + esc(CAD_RANGO[i.rango] || '') + '</p>';
  caja.innerHTML = h;
  var q = function(sel, fn){ Array.prototype.forEach.call(caja.querySelectorAll(sel), fn); };
  q('tr[data-enl]', function(tr){ tr.onclick = function(){ cadVerEmpresa(tr.getAttribute('data-enl')); }; tr.onkeydown = function(ev){ if(ev.key === 'Enter') cadVerEmpresa(tr.getAttribute('data-enl')); }; });
  q('[data-ar-obs]', function(b){ b.onclick = function(){ CAD.f = { lado:'abajo', est:'', enlace:b.getAttribute('data-ar-obs'), riesgo:'' }; navegar('cad-obs'); }; });
  q('[data-ar-cambiar]', function(b){ b.onclick = function(){ cadCambiar(b.getAttribute('data-ar-cambiar')); }; });
  q('[data-ar-fin]', function(b){ b.onclick = function(){ cadTerminar(b.getAttribute('data-ar-fin'), 'abajo'); }; });
  q('[data-inv-copiar]', function(b){ b.onclick = function(){ cadCopiar(cadEnlaceDe(b.getAttribute('data-inv-copiar')), 'Enlace copiado.'); }; });
  q('[data-inv-otra]', function(b){ b.onclick = function(){ cadReinvitar(b.getAttribute('data-inv-otra'), false); }; });
  q('[data-inv-quitar]', function(b){ b.onclick = function(){ cadReinvitar(b.getAttribute('data-inv-quitar'), true); }; });
  if($('cad-subio')) $('cad-subio').onclick = function(){ CAD.f = { lado:'arriba', est:'subio', enlace:'', riesgo:'' }; navegar('cad-obs'); };
  if($('cad-b-obs')) $('cad-b-obs').onclick = function(){ cadNuevaObs(); };
  if($('cad-b-inv')) $('cad-b-inv').onclick = function(){ cadInvitar(); };
  $('cad-b-pegar').onclick = cadPegarInvitacion;
}
/* una invitación que todavía no aceptan: su enlace, WhatsApp, otra ficha o retirarla */
function cadInvHTML(l){
  var i = cadIni() || {}, obra = (YO.obra || {}).nombre || '', manda = i.rango !== 'supervisor';
  var txt = l.token ? cadTextoInv(l, obra) : '';
  return '<div class="cad-inv-f' + (l.vencida ? ' vencida' : '') + '"><div><b>' + esc(l.razon || l.nombre) + '</b><small>' +
    esc(l.clase === 'subcontrata' ? 'Subcontrata' : (CAD_PAPEL[l.papel] || 'Supervisión')) + (l.ruc ? ' · ' + esc(cadDocN()) + ' ' + esc(l.ruc) : '') + (l.contacto ? ' · ' + esc(l.contacto) : '') +
    ' · ' + (l.vencida ? 'venció el ' : 'vence el ') + esc(_cadFechaD(l.vence)) + '</small></div><div class="acciones">' +
    (l.token && !l.vencida ? '<button type="button" class="bt sec chico" data-inv-copiar="' + esc(l.token) + '">Copiar enlace</button>' +
      (l.cel ? '<a class="bt sec chico" target="_blank" rel="noopener" href="' + esc(_cadWA(l.cel, txt)) + '">WhatsApp</a>' : '') : '') +
    (manda && l.invite_yo ? '<button type="button" class="bt sec chico" data-inv-otra="' + esc(l.id) + '">' + (l.vencida ? 'Invitar otra vez' : 'Enlace nuevo') + '</button>' +
      '<button type="button" class="bt mal chico" data-inv-quitar="' + esc(l.id) + '">Retirar</button>' : '') + '</div></div>';
}
function cadTextoInv(l, obra){
  var como = l.clase === 'subcontrata' ? 'como subcontrata de ' : (l.papel === 'regulador' ? 'para fiscalizar ' : 'para supervisar ');
  return 'Hola' + (l.contacto ? ' ' + String(l.contacto).split(' ')[0] : '') + ': te invito a OBRASST ' + como + '«' + obra + '». Abre este enlace, entra con tu cuenta o crea una (es gratis) y acepta la invitación: ' +
    cadEnlaceDe(l.token) + ' — vence el ' + _cadFechaD(l.vence) + '.';
}
function cadCopiar(t, dicho){
  var ok = function(){ toast(dicho || 'Copiado.'); };
  try{ navigator.clipboard.writeText(t).then(ok, function(){ _cadCopiarViejo(t); ok(); }); }catch(e){ _cadCopiarViejo(t); ok(); }
}
function _cadCopiarViejo(t){
  try{ var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }catch(e){}
}

/* ── invitar ── */
function cadInvitar(){
  var i = cadIni(); if(!i) return;
  var p = i.puedo || {}, cen = i.central || {}, doc = cadDocN(), obra = (YO.obra || {}).nombre || '';
  var clase = p.invitar_sub ? 'subcontrata' : 'supervision', quedan = cen.tope ? Math.max(0, cen.tope - (cen.usadas || 0)) : null;
  var h = '';
  if(p.invitar_sub && p.invitar_arriba) h += '<div class="cad-ops" role="radiogroup" aria-label="A quién invitas">' +
    '<label class="cad-op"><input type="radio" name="cad-i-clase" value="subcontrata" checked><b>Una subcontrata</b><small>Trabaja para ti en esta obra. Ves su tablero y le dejas observaciones.</small></label>' +
    '<label class="cad-op"><input type="radio" name="cad-i-clase" value="supervision"><b>Quien te supervisa</b><small>Tu cliente, la supervisión o el regulador. Ve tus cifras sin pedirte reportes.</small></label></div>';
  h += '<div id="cad-i-sub"' + (clase === 'subcontrata' ? '' : ' hidden') + '>' +
    '<p class="ayuda cad-ay">Entra gratis: lo cubre el Central de esta obra. Su empresa recibe su propio espacio para <b>' + esc(obra) + '</b>, con todas las herramientas de OBRASST mientras dure. ' +
    'Tú ves sus cifras del día, su personal y sus ATS.' + (quedan !== null ? ' Te ' + (quedan === 1 ? 'queda 1 lugar' : 'quedan ' + quedan + ' lugares') + ' de ' + cen.tope + '.' : '') + '</p></div>' +
    '<div id="cad-i-sup"' + (clase === 'supervision' ? '' : ' hidden') + '>' +
    '<div class="campo"><label for="cad-i-papel">Quién es</label><select id="cad-i-papel"><option value="cliente">El cliente (el dueño de la obra)</option><option value="supervision">La supervisión de la obra</option><option value="regulador">Una entidad que regula o fiscaliza</option></select></div>' +
    '<div class="campo"><label>Qué puede hacer</label><div class="cad-ops"><label class="cad-op"><input type="radio" name="cad-i-modo" value="lectura" checked><b>Solo mirar</b><small>Ve tu tablero. No escribe nada.</small></label>' +
    '<label class="cad-op"><input type="radio" name="cad-i-modo" value="observa"><b>Mirar y observar</b><small>Además te deja observaciones con plazo, y valida cuando las levantas.</small></label></div></div>' +
    '<div class="campo"><label>Qué ve de tu empresa</label><div class="cad-ops"><label class="cad-op"><input type="radio" name="cad-i-ve" value="cifras" checked><b>Solo cifras</b><small>Gente, capacitación, ATS del día, observaciones. Y cómo supervisas a tus subcontratas, en números.</small></label>' +
    '<label class="cad-op"><input type="radio" name="cad-i-ve" value="detalle"><b>Cifras y detalle</b><small>Además, la lista de tu personal con su capacitación y tus ATS de las dos últimas semanas.</small></label></div></div>' +
    '<p class="ayuda cad-ay">Nunca ve el detalle de tus subcontratas: de ellas ve solo los números. Puedes cambiar esto o terminar el enlace cuando quieras.</p></div>' +
    '<div class="campo"><label for="cad-i-ruc"><span id="cad-i-ruc-l">' + esc(doc) + ' de la empresa</span></label><input id="cad-i-ruc" inputmode="numeric" maxlength="20" autocomplete="off"></div>' +
    '<div class="campo"><label for="cad-i-nombre">Razón social o nombre</label><input id="cad-i-nombre" maxlength="140" autocomplete="off"></div>' +
    '<div class="cad-dos"><div class="campo"><label for="cad-i-contacto">A quién le llega (su nombre)</label><input id="cad-i-contacto" maxlength="80" autocomplete="off"></div>' +
    '<div class="campo"><label for="cad-i-cel">Su celular (para mandárselo por WhatsApp)</label><input id="cad-i-cel" inputmode="tel" maxlength="20" autocomplete="off"></div></div>' +
    '<div class="msg mal" id="cad-i-msg" role="alert"></div>';
  abrirHoja('Invitar a una empresa', 'A ' + obra, h, '<button type="button" class="bt sec" id="cad-i-no">Cancelar</button><button type="button" class="bt" id="cad-i-ok">Crear la invitación</button>');
  var pone = function(){
    var r = document.querySelector('input[name="cad-i-clase"]:checked'); if(r) clase = r.value;
    $('cad-i-sub').hidden = clase !== 'subcontrata'; $('cad-i-sup').hidden = clase !== 'supervision';
    $('cad-i-ruc-l').textContent = doc + ' de la empresa' + (clase === 'supervision' ? ' (opcional: con él, podrá sumar a su equipo)' : '');
  };
  Array.prototype.forEach.call(document.querySelectorAll('input[name="cad-i-clase"]'), function(r){ r.onchange = pone; });
  pone();
  $('cad-i-no').onclick = cerrarHoja;
  $('cad-i-ok').onclick = function(){
    var m = $('cad-i-msg'), bt = $('cad-i-ok'); m.textContent = '';
    var d = { emp:YO.obra.id, clase:clase, ruc:String($('cad-i-ruc').value || '').trim(), nombre:String($('cad-i-nombre').value || '').trim(),
              contacto:String($('cad-i-contacto').value || '').trim(), cel:String($('cad-i-cel').value || '').trim() };
    if(clase === 'supervision'){
      d.papel = $('cad-i-papel').value; d.modo = (document.querySelector('input[name="cad-i-modo"]:checked') || {}).value || 'lectura';
      d.ve = (document.querySelector('input[name="cad-i-ve"]:checked') || {}).value || 'cifras';
    } else if(!d.ruc.replace(/[^0-9A-Za-z]/g, '')){ m.textContent = 'Escribe el ' + doc + ' de la subcontrata.'; $('cad-i-ruc').focus(); return; }
    if(d.nombre.length < 3){ m.textContent = 'Escribe la razón social o el nombre de la empresa.'; $('cad-i-nombre').focus(); return; }
    bt.disabled = true; bt.textContent = 'Creando…';
    sbRpc('sst_cad_invitar', { p:d }).then(function(j){
      if(!j || !j.ok){ bt.disabled = false; bt.textContent = 'Crear la invitación'; m.textContent = cadMotivo(j); return; }
      cadInvitacionLista(j.enlace); cadAlDia();
    }, function(e){ bt.disabled = false; bt.textContent = 'Crear la invitación'; m.textContent = cadMotivo(null, e); });
  };
}
/* la invitación recién creada: el enlace a la vista, para copiarlo o mandarlo */
function cadInvitacionLista(l){
  var obra = (YO.obra || {}).nombre || '', url = cadEnlaceDe(l.token), txt = cadTextoInv(l, obra);
  var h = '<div class="aviso ok"><b>Invitación creada para ' + esc(l.razon || l.nombre) + '.</b> Mándale este enlace: al abrirlo entra con su cuenta (o crea una, gratis) y acepta. Vence el ' + esc(_cadFechaD(l.vence)) + '.</div>' +
    '<div class="campo"><label for="cad-l-url">El enlace de la invitación</label><input id="cad-l-url" readonly value="' + esc(url) + '"></div>' +
    '<p class="ayuda">El enlace es la llave: quien lo tenga puede aceptar. Mándalo solo a la persona de esa empresa. Si se pierde, desde «Empresas de la obra» sacas uno nuevo y el anterior deja de servir.</p>';
  abrirHoja('Invitación lista', l.razon || l.nombre, h,
    '<button type="button" class="bt sec" id="cad-l-cerrar">Cerrar</button><button type="button" class="bt sec" id="cad-l-copiar">Copiar enlace</button>' +
    (l.cel ? '<a class="bt" id="cad-l-wa" target="_blank" rel="noopener" href="' + esc(_cadWA(l.cel, txt)) + '">Enviar por WhatsApp</a>' : '<button type="button" class="bt" id="cad-l-texto">Copiar el mensaje</button>'));
  $('cad-l-cerrar').onclick = cerrarHoja;
  $('cad-l-copiar').onclick = function(){ cadCopiar(url, 'Enlace copiado.'); };
  if($('cad-l-texto')) $('cad-l-texto').onclick = function(){ cadCopiar(txt, 'Mensaje copiado: pégalo en WhatsApp o en un correo.'); };
  $('cad-l-url').onfocus = function(){ this.select(); };
}
function cadReinvitar(id, quitar){
  var pide = quitar ? confirmar('¿Retirar la invitación?', 'El enlace que mandaste deja de servir. Puedes invitarla otra vez después.', { si:'Retirar', mal:true })
                    : confirmar('¿Sacar un enlace nuevo?', 'El enlace anterior deja de servir y este vale por 14 días.', { si:'Sacar enlace nuevo' });
  pide.then(function(si){
    if(!si) return;
    sbRpc('sst_cad_reinvitar', { p:{ enlace:id, quitar:!!quitar } }).then(function(j){
      if(!j || !j.ok){ toast(cadMotivo(j)); return; }
      if(quitar){ toast('Invitación retirada.'); cadAlDia(); } else { cadInvitacionLista(j.enlace); cadAlDia(); }
    }, function(e){ toast(cadMotivo(null, e)); });
  });
}
/* qué ve y si observa quien me supervisa: lo decido yo, el supervisado */
function cadCambiar(id){
  var i = cadIni(), l = ((i && i.arriba) || []).filter(function(x){ return x.id === id; })[0]; if(!l) return;
  var op = function(nombre, val, act, t, s){ return '<label class="cad-op"><input type="radio" name="' + nombre + '" value="' + val + '"' + (act === val ? ' checked' : '') + '><b>' + t + '</b><small>' + s + '</small></label>'; };
  var h = '<div class="campo"><label>Qué puede hacer</label><div class="cad-ops">' + op('cad-c-modo', 'lectura', l.modo, 'Solo mirar', 'Ve tu tablero. No escribe nada.') +
    op('cad-c-modo', 'observa', l.modo, 'Mirar y observar', 'Te deja observaciones con plazo y valida cuando las levantas.') + '</div></div>' +
    '<div class="campo"><label>Qué ve de tu empresa</label><div class="cad-ops">' + op('cad-c-ve', 'cifras', l.ve, 'Solo cifras', 'Tus números del día y cómo supervisas a tus subcontratas.') +
    op('cad-c-ve', 'detalle', l.ve, 'Cifras y detalle', 'Además, tu personal con su capacitación y tus ATS.') + '</div></div>' +
    '<p class="ayuda">El cambio queda anotado, con tu cuenta y la hora. Lo que ya observó no se borra.</p><div class="msg mal" id="cad-c-msg" role="alert"></div>';
  abrirHoja('Lo que ve ' + cadCorto(l.nombre), cadClaseArriba(l), h, '<button type="button" class="bt sec" id="cad-c-no">Cancelar</button><button type="button" class="bt" id="cad-c-ok">Guardar</button>');
  $('cad-c-no').onclick = cerrarHoja;
  $('cad-c-ok').onclick = function(){
    var bt = $('cad-c-ok'); bt.disabled = true;
    sbRpc('sst_cad_cambiar', { p:{ enlace:id, modo:(document.querySelector('input[name="cad-c-modo"]:checked') || {}).value, ve:(document.querySelector('input[name="cad-c-ve"]:checked') || {}).value } }).then(function(j){
      if(!j || !j.ok){ bt.disabled = false; $('cad-c-msg').textContent = cadMotivo(j); return; }
      cerrarHoja(); toast(j.igual ? 'Sin cambios.' : 'Guardado. ' + cadCorto(l.nombre) + ' lo ve desde ahora.'); cadAlDia();
    }, function(e){ bt.disabled = false; $('cad-c-msg').textContent = cadMotivo(null, e); });
  };
}
/* lado: de qué lado estoy yo en ese enlace ('arriba': superviso · 'abajo': me supervisan) */
function cadTerminar(id, lado){
  var i = cadIni(), l = ((i && (lado === 'arriba' ? i.abajo : i.arriba)) || []).filter(function(x){ return x.id === id; })[0]; if(!l) return;
  preguntar('Terminar el enlace con ' + cadCorto(l.nombre), (lado === 'arriba'
      ? 'Dejas de ver su tablero y de observarle.' + (l.clase === 'subcontrata' ? ' Su espacio vuelve a su plan de siempre.' : '')
      : 'Deja de ver tus cifras y de observarte.' + (l.clase === 'subcontrata' ? ' Tu espacio de esta obra vuelve a su plan de siempre.' : '')) +
      ' Las observaciones y su historia quedan guardadas para las dos empresas.',
    { etiqueta:'Motivo', placeholder:'Ej.: terminó su partida en la obra.', minimo:5, corto:'Escribe el motivo (unas palabras).', maximo:300 }, { si:'Terminar el enlace', mal:true })
  .then(function(v){
    if(!v) return;
    sbRpc('sst_cad_terminar', { p:{ enlace:id, nota:v } }).then(function(j){
      if(!j || !j.ok){ toast(cadMotivo(j)); return; }
      cerrarHoja(); toast('Enlace terminado. La historia queda guardada.');
      /* el plan de la obra pudo cambiar: la lista de obras, de nuevo */
      CAD.obs = {};
      cargarEmpresas().then(function(){ elegirObra(YO.obra.id); }, function(){ cadAlDia(); });
    }, function(e){ toast(cadMotivo(null, e)); });
  });
}

/* ── la ficha de una empresa que superviso ── */
function cadVerEmpresa(id){
  var i = cadIni(), l0 = ((i && i.abajo) || []).filter(function(x){ return x.id === id; })[0]; if(!l0) return;
  abrirHoja(cadCorto(l0.nombre), cadClaseAbajo(l0), '<div class="vacio">Cargando…</div>', '', { ancha:true, id:id });
  sbRpc('sst_cad_empresa', { p:{ enlace:id } }).then(function(j){
    if(!HOJA.abierta || HOJA.id !== id) return;
    if(!j || !j.ok){ $('hoja-cuerpo').innerHTML = '<div class="aviso mal">' + esc(cadMotivo(j)) + '</div>'; return; }
    var l = j.enlace, x = j.ind || {}, o = j.obs || {}, s = j.sup, h = '';
    h += '<div class="rej cad-cifras cad-4">' +
      cifra('Gente hoy', _cadN(x.gente), 'personal activo en su padrón', '') +
      cifra('Capacitación vigente', _cadPct(x.cap, x.gente), x.gente ? _cadN((x.gente || 0) - (x.cap || 0)) + ' sin capacitación en 12 meses' : 'sin personal', (x.gente && x.cap / x.gente < 0.85) ? 'ojo' : (x.gente ? 'ok' : '')) +
      cifra('ATS de hoy', x.ats ? (x.ats_ok || 0) + ' de ' + x.ats : '0', x.ats ? ((x.ats_ok || 0) < x.ats ? (x.ats - (x.ats_ok || 0)) + ' sin V°B° de seguridad' : 'todos con V°B° de seguridad') : 'ninguno registrado hoy', x.ats ? ((x.ats_ok || 0) < x.ats ? 'ojo' : 'ok') : '') +
      cifra('Reportes abiertos', String(x.rep_ab || 0), (x.rep_mes || 0) + ' reportados este mes', '') +
      cifra('EPP entregado', _cadN(x.epp_mes), 'este mes', '') + cifra('Inspecciones', String(x.insp_mes || 0), 'este mes', '') +
      cifra('Accidentes con descanso', String(x.acc_anio || 0), 'este año', x.acc_anio ? 'mal' : 'ok') +
      cifra('Última actividad', x.ult ? hace(x.ult) : '—', x.ult ? _cadHora(x.ult) : 'todavía sin registros', '', '') + '</div>';
    h += '<dl class="datos cad-datos">' + (l.ruc ? '<dt>' + esc(cadDocN()) + '</dt><dd>' + esc(l.ruc) + '</dd>' : '') +
      (l.contacto || l.cel ? '<dt>Contacto</dt><dd>' + esc(l.contacto || '') + (l.cel ? ' · <a href="tel:' + esc(String(l.cel).replace(/[^0-9+]/g, '')) + '">' + esc(l.cel) + '</a>' : '') + '</dd>' : '') +
      '<dt>En tu tablero</dt><dd>' + (l.aceptado ? 'desde el ' + esc(fechaLarga(l.aceptado)) : '') + (l.acepto ? ' · aceptó ' + esc(l.acepto) : '') + '</dd>' +
      '<dt>Lo que ves</dt><dd>' + (l.ve === 'detalle' ? 'Cifras, personal y ATS' : 'Solo cifras') + ' · ' + (l.modo === 'observa' ? 'le puedes observar' : 'solo lectura') + '</dd></dl>';
    h += '<h3 class="cad-h3">Tus observaciones a esta empresa</h3><div class="cad-res">' +
      '<span><b>' + (o.ab || 0) + '</b> ' + (o.ab === 1 ? 'abierta' : 'abiertas') + '</span><span' + (o.ven ? ' class="cad-mal"' : '') + '><b>' + (o.ven || 0) + '</b> ' + (o.ven === 1 ? 'vencida' : 'vencidas') + '</span><span><b>' + (o.val || 0) + '</b> por validar</span>' +
      '<span><b>' + _cadPct(o.a_tiempo, o.lev) + '</b> levantadas a tiempo (30 días)</span><span><b>' + (o.total || 0) + '</b> en total</span></div>' +
      ((o.alto || o.medio || o.bajo) ? '<p class="cad-nota">Abiertas por riesgo: ' + (o.alto || 0) + ' alto · ' + (o.medio || 0) + ' medio · ' + (o.bajo || 0) + ' bajo.</p>' : '');
    if(s){
      h += '<h3 class="cad-h3">Cómo supervisa a las suyas</h3><p class="cad-nota">' + s.abajo + (s.abajo === 1 ? ' empresa' : ' empresas') + ' con ' + _cadN(s.gente) + (s.gente === 1 ? ' persona' : ' personas') + ' · ' +
        s.ab + (s.ab === 1 ? ' observación abierta, ' : ' observaciones abiertas, ') + s.ven + (s.ven === 1 ? ' vencida' : ' vencidas') + (s.n3 ? ' (' + s.n3 + ' de más de dos días)' : '') + ' · ' + s.val + ' por validar' + (s.val24 ? ' (' + s.val24 + ' llevan más de un día esperando su validación)' : '') +
        ' · ' + s.mes + (s.mes === 1 ? ' puesta' : ' puestas') + ' en 30 días' + (s.lev ? ', ' + _cadPct(s.a_tiempo, s.lev) + ' levantadas a tiempo' : '') + (s.ultima ? ' · la última, ' + hace(s.ultima) : '') + '.</p>' +
        '<div class="tabla-caja"><table class="cad-sup"><thead><tr><th>Empresa</th><th class="num">Gente</th><th class="num">Abiertas</th><th class="num">Vencidas</th><th class="num">Por validar</th></tr></thead><tbody>' +
        (s.empresas || []).map(function(e){ var q = e.obs || {}; return '<tr><td>' + esc(cadCorto(e.nombre)) + '</td><td class="num">' + _cadN(e.gente) + '</td><td class="num">' + (q.ab || 0) + '</td><td class="num' + (q.ven ? ' cad-mal' : '') + '">' + (q.ven || 0) + '</td><td class="num">' + (q.val || 0) + '</td></tr>'; }).join('') +
        '</tbody></table></div><p class="cad-nota">De esas empresas ves los números, no el detalle: el detalle es de quien las supervisa.</p>';
    }
    if(j.personal){
      h += '<h3 class="cad-h3">Su personal (' + j.personal.length + ')</h3><div class="tarj cad-tarj-in" id="cad-e-pers"></div>';
    }
    if(j.ats){
      h += '<h3 class="cad-h3">Sus ATS de las dos últimas semanas (' + j.ats.length + ')</h3>' + (j.ats.length ? '<ul class="cad-plana">' + j.ats.slice(0, 40).map(function(a){
        return '<li><span>' + esc(a.n || 'ATS') + '<small>' + esc(_cadFechaD(a.f)) + (a.h ? ' · ' + esc(a.h) : '') + ' · ' + (a.g || 0) + (a.g === 1 ? ' persona' : ' personas') + '</small></span>' +
          '<b class="pill ' + (a.ok ? 'ok' : 'ojo') + '">' + (a.ok ? 'Con V°B° de seguridad' : 'Sin V°B° de seguridad') + '</b></li>'; }).join('') + '</ul>' : '<p class="cad-nada">Ninguno en estos días.</p>');
    }
    if(l.ve !== 'detalle') h += '<p class="cad-nota">Este enlace te da las cifras. La lista de su personal y sus ATS se ven cuando esa empresa te da «cifras y detalle».</p>';
    $('hoja-cuerpo').innerHTML = h;
    var manda = (cadIni() || {}).rango !== 'supervisor';
    var pie = (l.modo === 'observa' ? '<button type="button" class="bt" id="cad-e-obs">＋ Observar</button>' : '') + '<button type="button" class="bt sec" id="cad-e-lista">Ver sus observaciones</button>' +
      (l.cel ? '<a class="bt sec" target="_blank" rel="noopener" href="' + esc(_cadWA(l.cel, 'Hola' + (l.contacto ? ' ' + String(l.contacto).split(' ')[0] : '') + ', te escribo por ' + ((YO.obra || {}).nombre || 'la obra') + '.')) + '">WhatsApp</a>' : '') +
      (manda ? '<button type="button" class="bt mal" id="cad-e-fin">Terminar el enlace</button>' : '');
    var cp = $('hoja-pie');
    if(!cp){ $('hoja').insertAdjacentHTML('beforeend', '<div class="hoja-pie" id="hoja-pie"></div>'); cp = $('hoja-pie'); }
    cp.innerHTML = pie;
    if(j.personal) tabla($('cad-e-pers'), [
      { k:'n', t:'Trabajador' }, { k:'d', t:'Documento', v:function(t){ return (t.td && t.td !== 'DNI' ? t.td + ' ' : '') + (t.d || ''); } }, { k:'p', t:'Puesto' }, { k:'a', t:'Área' },
      { k:'cap', t:'Última capacitación', v:function(t){ return t.cap || ''; }, h:function(t){ return t.cap ? esc(_cadFechaD(t.cap)) + (t.caps > 1 ? ' <small class="cad-gris">· ' + t.caps + ' en 12 meses</small>' : '') : '<span class="pill ojo">Sin capacitación vigente</span>'; } },
      { k:'ind', t:'Inducción', v:function(t){ return t.ind ? 'sí' : 'no'; }, h:function(t){ return t.ind ? '<span class="pill ok">Hecha</span>' : '<span class="cad-gris">—</span>'; } }
    ], j.personal, { orden:'n', unidad:'personas', archivo:'personal-' + String(cadCorto(l.nombre)).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), vacio:'Sin personal registrado', vacioSub:'Cuando esa empresa cargue su personal en OBRASST, aparece aquí.' });
    if($('cad-e-obs')) $('cad-e-obs').onclick = function(){ cadNuevaObs(id); };
    $('cad-e-lista').onclick = function(){ cerrarHoja(); CAD.f = { lado:'arriba', est:'todas', enlace:id, riesgo:'' }; navegar('cad-obs'); };
    if($('cad-e-fin')) $('cad-e-fin').onclick = function(){ cadTerminar(id, 'arriba'); };
  }, function(e){ if(HOJA.abierta && HOJA.id === id) $('hoja-cuerpo').innerHTML = '<div class="aviso mal">' + esc(cadMotivo(null, e)) + '</div>'; });
}

/* ══ OBSERVACIONES ═════════════════════════════════════════════════════════════════════ */
var CAD_F_ARRIBA = [['abiertas', 'Abiertas'], ['vencidas', 'Vencidas'], ['validar', 'Por validar'], ['subio', 'Subió a ti'], ['cerradas', 'Cerradas'], ['todas', 'Todas']];
var CAD_F_ABAJO = [['abiertas', 'Por levantar'], ['vencidas', 'Vencidas'], ['validar', 'Esperan validación'], ['cerradas', 'Cerradas'], ['todas', 'Todas']];
function _cadPasa(o, f, min){
  if(f === 'abiertas') return o.estado === 'abierta';
  if(f === 'vencidas') return o.nivel >= 1;
  if(f === 'validar') return o.estado === 'levantada';
  if(f === 'subio') return o.nivel >= min;
  if(f === 'cerradas') return o.estado === 'cerrada' || o.estado === 'anulada';
  return true;
}
function cadTraerObs(lado){
  var k = lado + '|' + YO.obra.id, c = CAD.obs[k];
  if(c && Date.now() - c.t < 20000) return Promise.resolve(c.l);
  return sbRpc('sst_cad_obs', { p:{ emp:YO.obra.id, lado:lado } }).then(function(j){
    if(!j || !j.ok) return Promise.reject(j);
    CAD.obs[k] = { t:Date.now(), l:j.lista || [] }; return CAD.obs[k].l;
  });
}
function cadVistaObs(caja){
  var i = cadIni(); if(!i) return;
  var hayAb = (i.abajo || []).some(function(l){ return l.estado === 'activa'; }), hayAr = (i.arriba || []).some(function(l){ return l.estado === 'activa'; }), c = i.cuenta || {};
  var observa = (i.abajo || []).some(function(l){ return l.estado === 'activa' && l.modo === 'observa'; });
  /* de qué lado se entra: el que se pidió; si no, donde hay algo esperándome */
  if(CAD.f.lado !== 'arriba' && CAD.f.lado !== 'abajo') CAD.f.lado = (hayAr && (c.por_levantar || !hayAb)) ? 'abajo' : 'arriba';
  if(CAD.f.lado === 'arriba' && !hayAb && hayAr) CAD.f.lado = 'abajo';
  if(CAD.f.lado === 'abajo' && !hayAr && hayAb) CAD.f.lado = 'arriba';
  var lado = CAD.f.lado, min = i.rango === 'gerente' ? 2 : (i.rango === 'jefe' ? 1 : 99);
  var filtros = (lado === 'arriba' ? CAD_F_ARRIBA : CAD_F_ABAJO).filter(function(x){ return x[0] !== 'subio' || min !== 99; });
  if(!filtros.some(function(x){ return x[0] === CAD.f.est; })) CAD.f.est = 'abiertas';
  _cadAcc(observa ? '<button type="button" class="bt" id="cad-o-nueva">＋ Nueva observación</button>' : '');
  if($('cad-o-nueva')) $('cad-o-nueva').onclick = function(){ cadNuevaObs(lado === 'arriba' ? CAD.f.enlace : ''); };
  if(!hayAb && !hayAr){
    caja.innerHTML = '<div class="vacio"><b>Todavía no hay observaciones</b>Aparecen cuando tu empresa esté enlazada con otra en esta obra. Mira «Empresas de la obra».</div>';
    return;
  }
  var pinta = function(todas){
    if(CAD.caja !== caja || CAD.cual !== 'obs') return;
    var enl = (lado === 'arriba' ? i.abajo : i.arriba) || [], fe = CAD.f.enlace, fr = CAD.f.riesgo;
    if(fe && !enl.some(function(l){ return l.id === fe; })) fe = CAD.f.enlace = '';
    var base = todas.filter(function(o){ return (!fe || o.enlace === fe) && (!fr || o.riesgo === fr); });
    var h = '';
    if(hayAb && hayAr) h += '<div class="cad-lados" role="tablist"><button type="button" role="tab" aria-selected="' + (lado === 'arriba') + '" class="' + (lado === 'arriba' ? 'on' : '') + '" data-lado="arriba">Las que puso mi empresa' +
      (c.por_validar ? ' <b>' + c.por_validar + ' por validar</b>' : '') + '</button><button type="button" role="tab" aria-selected="' + (lado === 'abajo') + '" class="' + (lado === 'abajo' ? 'on' : '') + '" data-lado="abajo">Las que me pusieron' +
      (c.por_levantar ? ' <b>' + c.por_levantar + ' por levantar</b>' : '') + '</button></div>';
    h += '<div class="cad-filtros"><div class="cad-chips" role="radiogroup" aria-label="Estado">' + filtros.map(function(x){
        var n = base.filter(function(o){ return _cadPasa(o, x[0], min); }).length;
        return '<button type="button" role="radio" aria-checked="' + (CAD.f.est === x[0]) + '" class="cad-chip' + (CAD.f.est === x[0] ? ' on' : '') + '" data-f="' + x[0] + '">' + x[1] + ' <b>' + n + '</b></button>'; }).join('') + '</div>';
    if(enl.filter(function(l){ return l.estado === 'activa'; }).length > 1 || fe) h += '<select id="cad-o-emp" aria-label="Empresa"><option value="">Todas las empresas</option>' + enl.filter(function(l){ return l.estado === 'activa'; }).map(function(l){
        return '<option value="' + esc(l.id) + '"' + (fe === l.id ? ' selected' : '') + '>' + esc(cadCorto(l.nombre)) + '</option>'; }).join('') + '</select>';
    h += '<select id="cad-o-ries" aria-label="Riesgo"><option value="">Todo riesgo</option>' + ['alto', 'medio', 'bajo'].map(function(k){
        return '<option value="' + k + '"' + (fr === k ? ' selected' : '') + '>Riesgo ' + CAD_RIESGO[k].t.toLowerCase() + '</option>'; }).join('') + '</select></div>';
    h += '<div class="tarj" id="cad-o-t"></div>';
    caja.innerHTML = h;
    var lista = base.filter(function(o){ return _cadPasa(o, CAD.f.est, min); });
    tabla($('cad-o-t'), [
      { k:'num', t:'N°', num:false, v:function(o){ return o.n; }, h:function(o){ return '<span class="mono">' + esc(o.n) + '</span>'; } },
      { k:'emp', t:lado === 'arriba' ? 'Empresa' : 'La puso', v:function(o){ return cadCorto(lado === 'arriba' ? o.abajo : o.arriba); } },
      { k:'titulo', t:'Observación', v:function(o){ return o.titulo + (o.lugar ? ' · ' + o.lugar : ''); }, h:function(o){ return '<b class="cad-ot">' + esc(o.titulo) + '</b>' + (o.lugar ? '<small class="cad-ol">' + esc(o.lugar) + '</small>' : ''); } },
      { k:'riesgo', t:'Riesgo', v:function(o){ return (CAD_RIESGO[o.riesgo] || {}).t || o.riesgo; }, h:function(o){ return cadRiesgoHTML(o.riesgo); } },
      { k:'estado', t:'Estado', v:function(o){ return cadEstadoT(o); }, h:function(o){ return cadEstadoHTML(o); } },
      { k:'por', t:'Observó', v:function(o){ return (o.por && o.por.n) || ''; } },
      { k:'creado', t:'Cuándo', v:function(o){ return o.creado; }, h:function(o){ return esc(fechaLarga(o.creado)) + '<small class="cad-ol">' + esc(hace(o.creado)) + '</small>'; }, csv:function(o){ return _cadHora(o.creado); } },
      { k:'vence', t:'Vence', soloCsv:true, v:function(o){ return _cadHora(o.vence); } },
      { k:'ult', t:'Último paso', soloCsv:true, v:function(o){ return o.ult ? (CAD_QUE[o.ult.que] || o.ult.que) + ' · ' + (o.ult.n || '') + (o.ult.nota ? ' · ' + o.ult.nota : '') : ''; } }
    ], lista, { orden:'creado', asc:false, unidad:'observaciones', archivo:'observaciones', vacio:'Nada con estos filtros',
      vacioSub:(CAD.f.est === 'abiertas' && lado === 'abajo') ? 'No tienes observaciones por levantar.' : 'Cambia el estado, la empresa o el riesgo.', alClic:function(o){ cadVerObs(o.id); } });
    Array.prototype.forEach.call(caja.querySelectorAll('.cad-chip'), function(b){ b.onclick = function(){ CAD.f.est = b.getAttribute('data-f'); pinta(todas); }; });
    Array.prototype.forEach.call(caja.querySelectorAll('[data-lado]'), function(b){ b.onclick = function(){ CAD.f.lado = b.getAttribute('data-lado'); CAD.f.enlace = ''; CAD.f.est = ''; cadVistaObs(caja); }; });
    if($('cad-o-emp')) $('cad-o-emp').onchange = function(){ CAD.f.enlace = this.value; pinta(todas); };
    $('cad-o-ries').onchange = function(){ CAD.f.riesgo = this.value; pinta(todas); };
  };
  if(!CAD.obs[lado + '|' + YO.obra.id]) cargando(caja);
  cadTraerObs(lado).then(pinta, function(j){ if(CAD.caja === caja) caja.innerHTML = '<div class="vacio"><b>No se pudo cargar</b>' + esc(cadMotivo(j && j.motivo ? j : null, (j && j.motivo) ? undefined : j)) + '</div>'; });
}

/* una observación, con su historia y lo que toca hacer */
function cadVerObs(id){
  abrirHoja('Observación', '', '<div class="vacio">Cargando…</div>', '', { id:id });
  sbRpc('sst_cad_obs_ver', { p:{ id:id } }).then(function(j){
    if(!HOJA.abierta || HOJA.id !== id) return;
    if(!j || !j.ok){ $('hoja-cuerpo').innerHTML = '<div class="aviso mal">' + esc(cadMotivo(j)) + '</div>'; return; }
    cadObsPintar(j);
  }, function(e){ if(HOJA.abierta && HOJA.id === id) $('hoja-cuerpo').innerHTML = '<div class="aviso mal">' + esc(cadMotivo(null, e)) + '</div>'; });
}
function cadObsPintar(j){
  var o = j.obs, lado = j.lado, i = cadIni() || {}, ct = j.contacto || {}, pasos = o.pasos || [];
  o.abajo = cadCorto(o.abajo); o.arriba = cadCorto(o.arriba);
  var horas = Math.round((new Date(o.vence).getTime() - new Date(o.creado).getTime()) / 3600000);
  $('hoja-t').textContent = o.n + ' · ' + o.titulo;
  var sub = $('hoja-s'); if(!sub){ $('hoja-t').insertAdjacentHTML('afterend', '<p class="sub" id="hoja-s"></p>'); sub = $('hoja-s'); }
  sub.textContent = (lado === 'arriba' ? o.abajo : 'La puso ' + o.arriba) + (o.lugar ? ' · ' + o.lugar : '');
  var h = '<div class="cad-ob-top">' + cadRiesgoHTML(o.riesgo) + cadEstadoHTML(o) + (o.nivel >= 1 ? '<span class="pill ojo">Subió ' + (o.nivel >= 2 ? 'al jefe y al gerente' : 'al jefe') + '</span>' : '') + '</div>';
  h += '<div class="cad-fotos"><figure>' + (o.foto ? '<a href="' + esc(o.foto) + '" target="_blank" rel="noopener"><img src="' + esc(o.foto) + '" alt="La foto de lo observado" loading="lazy"></a>' : '<span class="cad-sinfoto">Se observó sin foto</span>') +
    '<figcaption>Lo observado · ' + esc(fechaLarga(o.creado)) + '</figcaption></figure><figure>' +
    (o.foto_lev ? '<a href="' + esc(o.foto_lev) + '" target="_blank" rel="noopener"><img src="' + esc(o.foto_lev) + '" alt="La foto del levantamiento" loading="lazy"></a>' : '<span class="cad-sinfoto">' + (o.levantado ? 'Se levantó sin foto' : 'Todavía sin levantar') + '</span>') +
    '<figcaption>El levantamiento' + (o.levantado ? ' · ' + esc(fechaLarga(o.levantado)) : '') + '</figcaption></figure></div>';
  h += '<dl class="datos"><dt>' + (o.cond === false ? 'Acto' : 'Condición') + '</dt><dd>' + esc(o.titulo) + '</dd>' + (o.lugar ? '<dt>Lugar</dt><dd>' + esc(o.lugar) + '</dd>' : '') +
    '<dt>Empresa</dt><dd>' + esc(o.abajo) + '</dd><dt>La observó</dt><dd>' + esc((o.por && o.por.n) || '') + ((o.por && o.por.c) ? ' · ' + esc(o.por.c) : '') + ' · ' + esc(o.arriba) + '</dd>' +
    '<dt>Plazo</dt><dd>Riesgo ' + ((CAD_RIESGO[o.riesgo] || {}).t || '').toLowerCase() + ' · ' + _cadPlazo(horas) + ' · vence el ' + esc(_cadHora(o.vence)) + '</dd>' +
    (o.validado ? '<dt>Cerrada</dt><dd>' + esc(_cadHora(o.validado)) + '</dd>' : '') + '</dl>';
  h += '<h3 class="cad-h3">Su historia</h3><ol class="cad-hist">' + pasos.map(function(p){
      return '<li class="' + esc(p.que) + '"><b>' + (CAD_QUE[p.que] || esc(p.que)) + '</b> · ' + esc(p.n || '') + (p.c ? ' <span class="cad-gris">(' + esc(p.c) + ')</span>' : '') +
        '<small>' + esc(_cadHora(p.t)) + ' · ' + esc(p.lado === 'arriba' ? o.arriba : o.abajo) + '</small>' + (p.nota ? '<p>' + esc(p.nota) + '</p>' : '') +
        ((p.foto && p.que === 'nota') ? '<a class="cad-hist-f" href="' + esc(p.foto) + '" target="_blank" rel="noopener">Ver la foto</a>' : '') + '</li>'; }).join('') +
    ((o.estado === 'abierta' && o.nivel >= 1) ? '<li class="sube"><b>Subió ' + (o.nivel >= 2 ? 'al jefe y al gerente' : 'al jefe') + '</b><small>Venció el ' + esc(_cadHora(o.vence)) + ' sin levantarse</small></li>' : '') + '</ol>';
  h += '<p class="cad-nota">La historia no se cambia ni se borra: cada paso queda con quién y cuándo.</p><div id="cad-ob-form"></div>';
  $('hoja-cuerpo').innerHTML = h;
  var manda = i.rango !== 'supervisor', vivo = j.enlace_estado === 'activa', pie = '';
  /* de izquierda a derecha: lo de siempre (la nota), lo de al lado (WhatsApp, anular) y, al final, lo que toca hacer */
  if(lado === 'arriba'){
    if(o.estado === 'abierta' && ct.cel) pie += '<a class="bt sec" target="_blank" rel="noopener" href="' + esc(_cadWA(ct.cel, 'Hola' + (ct.n ? ' ' + String(ct.n).split(' ')[0] : '') + ': la observación ' + o.n + ' («' + o.titulo + '»' + (o.lugar ? ', ' + o.lugar : '') + ') ' +
      (o.nivel >= 1 ? 'ya venció' : 'vence el ' + _cadHora(o.vence)) + '. ¿Me confirmas cuándo la levantas?')) + '">WhatsApp</a>';
    if((o.estado === 'abierta' || o.estado === 'levantada') && (manda || (o.mia && Date.now() - new Date(o.creado).getTime() < 30 * 60000))) pie += '<button type="button" class="bt sec" id="cad-ob-anular">Anular</button>';
    if(o.estado === 'levantada') pie += '<button type="button" class="bt mal" id="cad-ob-rech">No está levantada</button><button type="button" class="bt ok" id="cad-ob-val">Validar y cerrar</button>';
  } else if(o.estado === 'abierta') pie += '<button type="button" class="bt" id="cad-ob-lev">Levantar con foto</button>';
  if(o.estado !== 'anulada') pie = '<button type="button" class="bt sec" id="cad-ob-nota">＋ Nota</button>' + pie;
  var cp = $('hoja-pie');
  if(!cp){ $('hoja').insertAdjacentHTML('beforeend', '<div class="hoja-pie" id="hoja-pie"></div>'); cp = $('hoja-pie'); }
  cp.innerHTML = pie; cp.hidden = !pie;
  var hecho = function(r, dicho){ if(!r || !r.ok){ toast(cadMotivo(r)); if(r && r.obs) cadObsPintar({ ok:true, obs:r.obs, lado:lado, contacto:ct, modo:j.modo, enlace_estado:j.enlace_estado }); return; }
    toast(dicho); cadObsPintar({ ok:true, obs:r.obs, lado:lado, contacto:ct, modo:j.modo, enlace_estado:j.enlace_estado }); CAD.obs = {}; cadTraer(true).then(cadRepintarDebajo); };
  if($('cad-ob-val')) $('cad-ob-val').onclick = function(){
    var b = this; b.disabled = true;
    sbRpc('sst_cad_validar', { p:{ id:o.id, ok:true, n:cadYo(), c:cadCargo() } }).then(function(r){ hecho(r, o.n + ' validada y cerrada.'); }, function(e){ b.disabled = false; toast(cadMotivo(null, e)); });
  };
  if($('cad-ob-rech')) $('cad-ob-rech').onclick = function(){
    preguntar('No está levantada', 'Dile a ' + o.abajo + ' qué falta. Vuelve a su lista con el mismo plazo.',
      { etiqueta:'Qué falta', placeholder:'Ej.: falta el rodapié en el tramo del eje C.', minimo:8, corto:'Escribe qué falta (al menos unas palabras).', maximo:600 }, { si:'Devolver', mal:true })
    .then(function(v){ if(!v) return; sbRpc('sst_cad_validar', { p:{ id:o.id, ok:false, nota:v, n:cadYo(), c:cadCargo() } }).then(function(r){ hecho(r, o.n + ' devuelta a ' + o.abajo + '.'); }, function(e){ toast(cadMotivo(null, e)); }); });
  };
  if($('cad-ob-anular')) $('cad-ob-anular').onclick = function(){
    preguntar('Anular ' + o.n, 'No se borra: queda anulada, con el motivo, a la vista de las dos empresas.',
      { etiqueta:'Por qué se anula', placeholder:'Ej.: se puso por error a otra empresa.', minimo:8, corto:'Escribe el motivo (al menos unas palabras).', maximo:300 }, { si:'Anular', mal:true })
    .then(function(v){ if(!v) return; sbRpc('sst_cad_anular', { p:{ id:o.id, nota:v, n:cadYo(), c:cadCargo() } }).then(function(r){ hecho(r, o.n + ' anulada.'); }, function(e){ toast(cadMotivo(null, e)); }); });
  };
  if($('cad-ob-nota')) $('cad-ob-nota').onclick = function(){ cadFormPaso(o, 'nota', hecho); };
  if($('cad-ob-lev')) $('cad-ob-lev').onclick = function(){ cadFormPaso(o, 'levanta', hecho); };
  if(!vivo && cp) cp.insertAdjacentHTML('afterbegin', '<span class="cad-gris cad-pie-n">El enlace con esa empresa ya terminó: queda la historia.</span>');
}
function cadRepintarDebajo(){ if(CAD.caja && CAD.caja.isConnected && /^cad(-|$)/.test(VISTA.actual || '')) cadRepintar(); }
/* levantar (la foto del después y qué se hizo) o dejar una nota */
function cadFormPaso(o, que, hecho){
  var caja = $('cad-ob-form'); if(!caja) return;
  var lev = que === 'levanta', foto = null;
  caja.innerHTML = '<div class="cad-form"><h3 class="cad-h3">' + (lev ? 'Levantar' : 'Agregar una nota') + '</h3>' +
    '<div class="campo"><label for="cad-p-nota">' + (lev ? 'Qué se hizo' : 'La nota') + '</label><textarea id="cad-p-nota" maxlength="600" placeholder="' + (lev ? 'Ej.: se colocó la baranda y el rodapié en todo el borde.' : 'Ej.: mañana a primera hora llega el material.') + '"></textarea></div>' +
    cadFotoCampo('cad-p', lev ? 'La foto del después' : 'Una foto (opcional)') + '<div class="msg mal" id="cad-p-msg" role="alert"></div></div>';
  var pie = $('hoja-pie');
  pie.hidden = false;
  pie.innerHTML = '<button type="button" class="bt sec" id="cad-p-no">Cancelar</button><button type="button" class="bt" id="cad-p-ok">' + (lev ? 'Enviar el levantamiento' : 'Guardar la nota') + '</button>';
  cadFotoAtar('cad-p', function(b){ foto = b; });
  try{ caja.scrollIntoView({ block:'start', behavior:'smooth' }); }catch(e){}
  setTimeout(function(){ try{ $('cad-p-nota').focus(); }catch(e){} }, 60);
  $('cad-p-no').onclick = function(){ cadVerObs(o.id); };
  $('cad-p-ok').onclick = function(){
    var nota = String($('cad-p-nota').value || '').trim(), m = $('cad-p-msg'), bt = $('cad-p-ok'); m.textContent = '';
    if(nota.length < (lev ? 5 : 2)){ m.textContent = lev ? 'Escribe qué se hizo (unas palabras).' : 'Escribe la nota.'; $('cad-p-nota').focus(); return; }
    var sigue = (lev && !foto) ? confirmar('¿Levantar sin foto?', 'La foto del después es la prueba de que se hizo. Sin ella, es probable que te la devuelvan.', { si:'Enviar sin foto', no:'Poner la foto' }) : Promise.resolve(true);
    sigue.then(function(si){
      if(!si) return;
      bt.disabled = true; bt.textContent = foto ? 'Subiendo la foto…' : 'Guardando…';
      (foto ? subirFoto('cadena', foto, lev ? 'levantamiento.jpg' : 'nota.jpg') : Promise.resolve(null)).then(function(url){
        return sbRpc(lev ? 'sst_cad_levantar' : 'sst_cad_nota', { p:{ id:o.id, nota:nota, foto:url, n:cadYo(), c:cadCargo() } });
      }).then(function(r){
        if(r && !r.ok && !r.obs){ bt.disabled = false; bt.textContent = lev ? 'Enviar el levantamiento' : 'Guardar la nota'; m.textContent = cadMotivo(r); return; }
        hecho(r, lev ? 'Levantada. Le llega a ' + o.arriba + ' para que la valide.' : 'Nota guardada.');
      }, function(e){ bt.disabled = false; bt.textContent = lev ? 'Enviar el levantamiento' : 'Guardar la nota'; m.textContent = (typeof e === 'string' && /foto/.test(e)) ? 'Esa foto no se pudo leer. Elige otra.' : 'No se pudo guardar. ' + cadMotivo(null, e); });
    });
  };
}
/* el campo de la foto: se achica en el navegador antes de subir */
function cadFotoCampo(pre, etiqueta){
  return '<div class="campo"><label for="' + pre + '-foto">' + esc(etiqueta) + '</label><div class="cad-foto"><img id="' + pre + '-ver" alt="" hidden>' +
    '<div><input type="file" id="' + pre + '-foto" accept="image/*"><small>Del celular o de la computadora. Se achica sola antes de subir.</small></div></div></div>';
}
function cadFotoAtar(pre, alTener){
  var inp = $(pre + '-foto'), ver = $(pre + '-ver'); if(!inp) return;
  inp.onchange = function(){
    var f = inp.files && inp.files[0]; if(!f){ alTener(null); ver.hidden = true; return; }
    achicarFoto(f, 1600, 0.8).then(function(b){ alTener(b); try{ ver.src = URL.createObjectURL(b); ver.hidden = false; }catch(e){} },
      function(){ alTener(null); ver.hidden = true; inp.value = ''; toast('Esa foto no se pudo leer. Elige otra.'); });
  };
}
/* una observación nueva */
function cadNuevaObs(enlaceId){
  var i = cadIni(); if(!i) return;
  var emps = (i.abajo || []).filter(function(l){ return l.estado === 'activa' && l.modo === 'observa'; });
  if(!emps.length){ toast('No tienes empresas a las que puedas observar.'); return; }
  var pz = (i.central && i.central.plazos) || { alto:24, medio:72, bajo:168 }, foto = null, ext = _cadExt();
  var h = '<div class="campo"><label for="cad-n-emp">Empresa</label><select id="cad-n-emp">' + emps.map(function(l){
      return '<option value="' + esc(l.id) + '"' + (l.id === enlaceId ? ' selected' : '') + '>' + esc(cadCorto(l.nombre)) + '</option>'; }).join('') + '</select></div>' +
    '<div class="campo"><label for="cad-n-titulo">Qué viste</label><input id="cad-n-titulo" maxlength="200" placeholder="Ej.: borde de losa sin baranda" autocomplete="off"></div>' +
    '<div class="campo"><label>Qué es</label><div class="cad-ops cad-ops-2"><label class="cad-op"><input type="radio" name="cad-n-cond" value="1" checked><b>Una condición</b><small>Algo del lugar, del equipo o del material.</small></label>' +
    '<label class="cad-op"><input type="radio" name="cad-n-cond" value="0"><b>Un acto</b><small>Algo que alguien hizo o dejó de hacer.</small></label></div></div>' +
    '<div class="campo"><label for="cad-n-lugar">Dónde</label><input id="cad-n-lugar" maxlength="120" placeholder="Ej.: torre B · piso 5 · eje C-4" autocomplete="off"></div>' +
    '<div class="campo"><label>Riesgo y plazo para levantarla</label><div class="cad-ries-ops" role="radiogroup">' + ['alto', 'medio', 'bajo'].map(function(k){
      return '<label class="cad-ries-op ' + k + '"><input type="radio" name="cad-n-r" value="' + k + '"' + (k === 'medio' ? ' checked' : '') + '><b>' + CAD_RIESGO[k].t + '</b><small>' + _cadPlazo(pz[k]) + '</small></label>'; }).join('') + '</div></div>' +
    cadFotoCampo('cad-n', 'La foto') +
    '<div class="campo"><label for="cad-n-nota">Algo más (opcional)</label><textarea id="cad-n-nota" maxlength="600" placeholder="Lo que haga falta para entenderla o para levantarla."></textarea></div>' +
    '<p class="cad-nota">Le aparece a esa empresa en «Por levantar», en la app y aquí. Si vence sin levantarse, sube sola al jefe y, un día después, al gerente.</p><div class="msg mal" id="cad-n-msg" role="alert"></div>';
  abrirHoja('Nueva observación', 'La registra ' + cadYo() + (cadCargo() ? ' · ' + cadCargo() : ''), h,
    '<button type="button" class="bt sec" id="cad-n-no">Cancelar</button><button type="button" class="bt" id="cad-n-ok">Guardar la observación</button>');
  cadFotoAtar('cad-n', function(b){ foto = b; });
  $('cad-n-no').onclick = cerrarHoja;
  $('cad-n-ok').onclick = function(){
    var m = $('cad-n-msg'), bt = $('cad-n-ok'); m.textContent = '';
    var d = { enlace:$('cad-n-emp').value, titulo:String($('cad-n-titulo').value || '').trim(), lugar:String($('cad-n-lugar').value || '').trim(), nota:String($('cad-n-nota').value || '').trim(),
              riesgo:(document.querySelector('input[name="cad-n-r"]:checked') || {}).value || 'medio', cond:((document.querySelector('input[name="cad-n-cond"]:checked') || {}).value !== '0'),
              ext:ext, n:cadYo(), c:cadCargo() };
    if(d.titulo.length < 4){ m.textContent = 'Escribe qué viste (al menos unas palabras).'; $('cad-n-titulo').focus(); return; }
    var sigue = foto ? Promise.resolve(true) : confirmar('¿Guardarla sin foto?', 'Con la foto, la otra empresa ve exactamente qué hay que corregir.', { si:'Guardar sin foto', no:'Poner la foto' });
    sigue.then(function(si){
      if(!si) return;
      bt.disabled = true; bt.textContent = foto ? 'Subiendo la foto…' : 'Guardando…';
      (foto ? subirFoto('cadena', foto, 'observacion.jpg') : Promise.resolve(null)).then(function(url){ d.foto = url; return sbRpc('sst_cad_observar', { p:d }); }).then(function(r){
        if(!r || !r.ok){ bt.disabled = false; bt.textContent = 'Guardar la observación'; m.textContent = cadMotivo(r); return; }
        cerrarHoja(); toast(r.obs.n + ' guardada. Le llega a ' + cadCorto(r.obs.abajo) + '.');
        CAD.obs = {}; CAD.f = { lado:'arriba', est:'abiertas', enlace:'', riesgo:'' };
        cadTraer(true).then(function(){ if(VISTA.actual === 'cad-obs') cadRepintar(); else navegar('cad-obs'); });
      }, function(e){ bt.disabled = false; bt.textContent = 'Guardar la observación'; m.textContent = 'No se pudo guardar. ' + cadMotivo(null, e) + ' Lo escrito sigue aquí: vuelve a intentar.'; });
    });
  };
}

/* ══ RANGOS DEL EQUIPO ═════════════════════════════════════════════════════════════════ */
function cadVistaEquipo(caja){
  _cadAcc('');
  var pinta = function(j){
    if(CAD.caja !== caja || CAD.cual !== 'equipo') return;
    if(!j || !j.ok){ caja.innerHTML = '<div class="vacio"><b>No se pudo cargar</b>' + esc(cadMotivo(j)) + '</div>'; return; }
    var h = '<div class="aviso"><b>Qué hace cada rango.</b> El <b>supervisor</b> observa, valida y levanta. Al <b>jefe</b> le sube lo que venció sin levantarse. Al <b>gerente</b>, lo que lleva más de un día vencido. ' +
      'Invitar empresas, anular una observación, cambiar lo que ve quien te supervisa y terminar un enlace: jefe o gerente. Sin rango puesto, el dueño de la obra es gerente y los demás son supervisores.</div>' +
      '<div class="tarj"><div class="tarj-cab"><div><h2>El equipo de ' + esc((YO.obra || {}).nombre || 'la obra') + '</h2><p class="sub">' + (j.puedo ? 'Elige el rango de cada persona' : 'Los rangos los pone el dueño de la obra o un gerente') + '</p></div></div>' +
      '<div class="tabla-caja"><table class="cad-eq"><thead><tr><th>Persona</th><th>En la obra</th><th>Rango</th></tr></thead><tbody>' + (j.equipo || []).map(function(m){
        return '<tr><td><b>' + esc(m.nombre || m.correo) + '</b>' + (m.yo ? ' <span class="pill azul">Tú</span>' : '') + (m.nombre ? '<small class="cad-ol">' + esc(m.correo) + '</small>' : '') + '</td>' +
          '<td>' + (m.rol === 'dueno' ? 'Dueño' : 'Supervisor de la obra') + '</td><td>' + (j.puedo
            ? '<select data-rango="' + esc(m.correo) + '" aria-label="Rango de ' + esc(m.nombre || m.correo) + '"><option value=""' + (m.puesto ? '' : ' selected') + '>' + (m.rol === 'dueno' ? 'Gerente' : 'Supervisor') + ' (el de siempre)</option>' +
              ['supervisor', 'jefe', 'gerente'].map(function(k){ return '<option value="' + k + '"' + (m.puesto && m.rango === k ? ' selected' : '') + '>' + CAD_RANGO[k] + '</option>'; }).join('') + '</select>'
            : '<span class="pill ' + (m.rango === 'supervisor' ? 'gris' : 'azul') + '">' + esc(CAD_RANGO[m.rango] || m.rango) + '</span>') + '</td></tr>'; }).join('') +
      '</tbody></table></div></div><p class="cad-pie">El equipo se arma en «Obras y equipo» (o en la app, «Nombrar supervisores»). Aquí solo se pone el rango de quien ya está.</p>';
    caja.innerHTML = h;
    Array.prototype.forEach.call(caja.querySelectorAll('select[data-rango]'), function(s){ s.onchange = function(){
      s.disabled = true;
      sbRpc('sst_cad_rango', { p:{ emp:YO.obra.id, correo:s.getAttribute('data-rango'), rango:s.value } }).then(function(r){
        s.disabled = false;
        if(!r || !r.ok){ toast(cadMotivo(r)); cadVistaEquipo(caja); return; }
        toast('Rango guardado: ' + (CAD_RANGO[r.rango] || r.rango) + '.'); cadTraer(true);
      }, function(e){ s.disabled = false; toast(cadMotivo(null, e)); cadVistaEquipo(caja); });
    }; });
  };
  cargando(caja);
  sbRpc('sst_cad_equipo', { p_emp:YO.obra.id }).then(pinta, function(e){ if(CAD.caja === caja) caja.innerHTML = '<div class="vacio"><b>No se pudo cargar</b>' + esc(cadMotivo(null, e)) + '</div>'; });
}

/* ══ LA INVITACIÓN: pegarla, verla, aceptarla ══════════════════════════════════════════ */
function cadFichaDe(texto){ var m = /([a-f0-9]{32})/.exec(String(texto || '').toLowerCase()); return m ? m[1] : null; }
function cadPegarInvitacion(){
  var h = '<p class="ayuda" style="margin-top:0">Pega aquí el enlace que te mandaron (el que termina en una fila larga de letras y números).</p>' +
    '<div class="campo"><label for="cad-g-url">El enlace de la invitación</label><input id="cad-g-url" autocomplete="off" placeholder="https://obrasstapp.com/?cad=…"></div><div class="msg mal" id="cad-g-msg" role="alert"></div>';
  abrirHoja('Tengo una invitación', 'De otra empresa, para una obra', h, '<button type="button" class="bt sec" id="cad-g-no">Cancelar</button><button type="button" class="bt" id="cad-g-ok">Ver la invitación</button>');
  $('cad-g-no').onclick = cerrarHoja;
  var va = function(){ var t = cadFichaDe($('cad-g-url').value); if(!t){ $('cad-g-msg').textContent = 'Ahí no está la invitación. Copia el enlace completo, tal como te llegó.'; return; } cadAceptarHoja(t); };
  $('cad-g-ok').onclick = va; $('cad-g-url').onkeydown = function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); va(); } };
  setTimeout(function(){ try{ $('cad-g-url').focus(); }catch(e){} }, 60);
}
/* qué significa aceptar, dicho antes de aceptar */
function cadInvitacionHTML(j){
  var sub = j.clase === 'subcontrata', h = '';
  h += '<div class="cad-acepta"><p class="cad-acepta-de">' + esc(j.obra || 'Una obra') + (j.madre ? ' <small>· ' + esc(j.madre) + '</small>' : '') + '</p>' +
    '<h2>' + (sub ? 'Te invita a trabajar en su obra como subcontrata' : (j.papel === 'regulador' ? 'Te invita a fiscalizar su obra' : 'Te invita a supervisar su obra' + (j.papel === 'cliente' ? ' como su cliente' : ''))) + '</h2>' +
    '<p class="cad-acepta-para">Invitación para <b>' + esc(j.para || '') + '</b>' + (j.ruc ? ' · ' + esc(cadDocN()) + ' ' + esc(j.ruc) : '') + (j.vence ? ' · vence el ' + esc(_cadFechaD(j.vence)) : '') + '</p><ul class="cad-acepta-l">';
  if(sub) h += '<li><b>Tu empresa recibe su propio espacio para esta obra</b>, con todas las herramientas de OBRASST mientras dure, sin costo: lo cubre la contratista principal.</li>' +
    '<li><b>' + esc(j.obra || 'La principal') + ' ve de este espacio</b> tus cifras del día (gente, capacitación, ATS), la lista de tu personal y tus ATS. Te deja observaciones con foto y plazo, y tú las levantas con foto.</li>' +
    '<li><b>No ve nada de tus otras obras</b> ni de la cuenta que tu empresa ya tenga en OBRASST. Puedes terminar el enlace cuando salgas de la obra.</li>';
  else h += '<li><b>Ves su tablero</b>: ' + (j.ve === 'detalle' ? 'sus cifras del día, su personal con su capacitación y sus ATS' : 'sus cifras del día (gente, capacitación, ATS, observaciones)') + ', y cómo supervisa a sus subcontratas, en números.</li>' +
    '<li>' + (j.modo === 'observa' ? '<b>Le dejas observaciones</b> con foto, riesgo y plazo; ella las levanta con foto y tú validas. Lo que vence sube solo.' : '<b>Solo lectura</b>: miras, no escribes. Si después te dan permiso de observar, aparece el botón.') + '</li>' +
    '<li><b>Es sin costo para ti.</b> Tu equipo puede entrar a tu espacio (hasta 6 personas).</li>';
  return h + '</ul></div>';
}
function cadInvitacionMal(j){
  if(!j || !j.ok) return 'Esta invitación no existe. Revisa que el enlace esté completo, o pide que te lo manden otra vez.';
  if(j.estado === 'vencida') return 'Esta invitación venció. Pídele a ' + (j.obra || 'quien te invitó') + ' que te mande otra.';
  if(j.estado === 'activa') return 'Esta invitación ya fue aceptada. Si fuiste tú, tu espacio de esa obra está en la lista de obras, arriba.';
  if(j.estado !== 'invitada') return 'Esta invitación fue retirada. Pídele a ' + (j.obra || 'quien te invitó') + ' que te mande otra.';
  if(j.soy_de_quien_invita) return 'Eres del equipo de la obra que invita. Esta invitación es para la otra empresa: mándale el enlace a ella.';
  return '';
}
/* el formulario para aceptar: espacio nuevo, o una obra mía que ya llevo */
function cadAceptarForm(j){
  var mias = j.mias || [], sub = j.clase === 'subcontrata';
  var h = '';
  if(mias.length) h += '<div class="campo"><label>Dónde lo vas a llevar</label><div class="cad-ops cad-ops-2"><label class="cad-op"><input type="radio" name="cad-a-donde" value="" checked><b>En un espacio nuevo para esta obra</b><small>Lo más ordenado: lo de esta obra queda aparte.</small></label>' +
    '<label class="cad-op"><input type="radio" name="cad-a-donde" value="mia"><b>En una obra que ya llevo en OBRASST</b><small>Si ya registras ahí a la gente de esta obra.</small></label></div></div>' +
    '<div class="campo" id="cad-a-mia-c" hidden><label for="cad-a-mia">Cuál</label><select id="cad-a-mia">' + mias.map(function(e){ return '<option value="' + esc(e.id) + '">' + esc(e.nombre) + (e.codigo ? ' · ' + esc(e.codigo) : '') + '</option>'; }).join('') + '</select>' +
    '<small class="ayuda">' + (sub ? 'La principal verá las cifras, el personal y los ATS de esa obra.' : 'Desde esa obra verás el tablero de quien te invita.') + '</small></div>';
  if(!sub && !j.ruc) h += '<div class="campo"><label for="cad-a-ruc">' + esc(cadDocN()) + ' de tu empresa (opcional)</label><input id="cad-a-ruc" inputmode="numeric" maxlength="20" autocomplete="off"><small class="ayuda">Con él podrás sumar a tu equipo a este espacio.</small></div>';
  return h + '<div class="msg mal" id="cad-a-msg" role="alert"></div>';
}
function cadAceptarAtar(){
  Array.prototype.forEach.call(document.querySelectorAll('input[name="cad-a-donde"]'), function(r){ r.onchange = function(){ var c = $('cad-a-mia-c'); if(c) c.hidden = ((document.querySelector('input[name="cad-a-donde"]:checked') || {}).value !== 'mia'); }; });
}
function cadAceptarEnviar(token, bt, alListo){
  var m = $('cad-a-msg'); if(m) m.textContent = '';
  var d = { token:token };
  if(((document.querySelector('input[name="cad-a-donde"]:checked') || {}).value) === 'mia' && $('cad-a-mia')) d.emp = $('cad-a-mia').value;
  if($('cad-a-ruc') && String($('cad-a-ruc').value || '').trim()) d.ruc = String($('cad-a-ruc').value).trim();
  var t0 = bt.textContent; bt.disabled = true; bt.textContent = 'Aceptando…';
  sbRpc('sst_cad_aceptar', { p:d }).then(function(r){
    if(!r || !r.ok){ bt.disabled = false; bt.textContent = t0; if(m) m.textContent = cadMotivo(r); return; }
    cadFichaPoner(null); CADP.alta = false;
    alListo(r);
  }, function(e){ bt.disabled = false; bt.textContent = t0; if(m) m.textContent = cadMotivo(null, e); });
}
/* ya dentro del portal: la invitación, en el cajón */
function cadAceptarHoja(token){
  _cadCss();
  abrirHoja('Invitación', '', '<div class="vacio">Abriendo la invitación…</div>', '', { id:'cad-inv-' + token });
  sbRpc('sst_cad_invitacion', { p_token:token }).then(function(j){
    if(!HOJA.abierta || HOJA.id !== 'cad-inv-' + token) return;
    var mal = cadInvitacionMal(j), cp = $('hoja-pie');
    if(!cp){ $('hoja').insertAdjacentHTML('beforeend', '<div class="hoja-pie" id="hoja-pie"></div>'); cp = $('hoja-pie'); }
    if(mal){ cadFichaPoner(null); $('hoja-cuerpo').innerHTML = (j && j.ok ? cadInvitacionHTML(j) : '') + '<div class="aviso ojo">' + esc(mal) + '</div>'; cp.innerHTML = '<button type="button" class="bt" id="cad-a-cerrar">Cerrar</button>'; $('cad-a-cerrar').onclick = cerrarHoja; return; }
    $('hoja-cuerpo').innerHTML = cadInvitacionHTML(j) + cadAceptarForm(j);
    cp.innerHTML = '<button type="button" class="bt sec" id="cad-a-luego">Ahora no</button><button type="button" class="bt" id="cad-a-ok">Aceptar la invitación</button>';
    cadAceptarAtar();
    $('cad-a-luego').onclick = function(){ cadFichaPoner(null); cerrarHoja(); };
    $('cad-a-ok').onclick = function(){ cadAceptarEnviar(token, this, function(r){ cerrarHoja(); cadYaAcepte(r); }); };
  }, function(e){ if(HOJA.abierta) $('hoja-cuerpo').innerHTML = '<div class="aviso mal">' + esc(cadMotivo(null, e)) + '</div>'; });
}
/* la cuenta todavía sin obra (el invitado que acaba de crearla): la invitación ocupa la pantalla */
function cadAceptarEnAlta(caja, token){
  _cadCss();
  var fuera = function(){ cadFichaPoner(null); CADP.alta = false; mostrarAlta(false); };
  if(!token){ fuera(); return; }
  sbRpc('sst_cad_invitacion', { p_token:token }).then(function(j){
    var mal = cadInvitacionMal(j);
    if(mal){ caja.innerHTML = '<h1>Tu invitación</h1>' + (j && j.ok ? cadInvitacionHTML(j) : '') + '<div class="aviso ojo">' + esc(mal) + '</div><div class="acciones"><button type="button" class="bt" id="cad-a-fuera">Crear mi propia obra</button></div>'; $('cad-a-fuera').onclick = fuera; return; }
    caja.innerHTML = '<h1>Tu cuenta ya está. Acepta tu invitación.</h1>' + cadInvitacionHTML(j) + cadAceptarForm(j) +
      '<div class="acciones cad-a-bts"><button type="button" class="bt" id="cad-a-ok">Aceptar la invitación</button><button type="button" class="bt sec" id="cad-a-fuera">No es para mí: crear mi propia obra</button></div>';
    cadAceptarAtar();
    $('cad-a-fuera').onclick = fuera;
    $('cad-a-ok').onclick = function(){ cadAceptarEnviar(token, this, function(r){ cadYaAcepte(r); }); };
  }, function(){ caja.innerHTML = '<h1>Tu invitación</h1><div class="aviso mal">No se pudo abrir la invitación. Revisa tu conexión.</div><div class="acciones"><button type="button" class="bt" id="cad-a-otra">Reintentar</button><button type="button" class="bt sec" id="cad-a-fuera">Crear mi propia obra</button></div>';
    $('cad-a-otra').onclick = function(){ cadAceptarEnAlta(caja, token); }; $('cad-a-fuera').onclick = fuera; });
}
/* aceptada: la lista de obras de nuevo, y adentro del espacio de esa obra */
function cadYaAcepte(r){
  var emp = r.empresa || {};
  cargarEmpresas().then(function(){
    guardar('sstp_obra', emp.id);
    CADP.irA = 'cad';       /* al llegar la portada de la cadena de ese espacio, se abre «Empresas de la obra» */
    if($('portal').className !== 'on') mostrarPortal(); else elegirObra(emp.id);
    toast(r.ya ? 'Esa invitación ya la habías aceptado: este es tu espacio.' : 'Invitación aceptada. Este es tu espacio de la obra.');
  }, function(){ toast('Aceptada. Vuelve a cargar la página para ver tu espacio.'); });
}

/* ══ el estilo ═════════════════════════════════════════════════════════════════════════ */
function _cadCss(){
  if($('cad-css')) return;
  var st = document.createElement('style'); st.id = 'cad-css';
  st.textContent = [
    '.cad-nw{white-space:nowrap}.cad-gris{color:var(--gris)}td.cad-ojo,.cad-ojo{color:var(--ojo);font-weight:600}td.cad-mal,.cad-mal{color:var(--mal);font-weight:600}',
    '.rej.cad-cifras{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.rej.cad-cifras.cad-4{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:16px}',
    '.cad-cifras.cad-4 .cifra .v{font-size:22px}',
    '@media (max-width:760px){.rej.cad-cifras.cad-4{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    /* qué es, para quien todavía no tiene nada */
    '.cad-que h2{font-size:19px;margin:0 0 8px}.cad-que p{color:var(--texto);line-height:1.6;max-width:80ch;margin:0 0 18px}',
    '.cad-que-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.cad-que-2>div{display:grid;gap:8px;align-content:start;justify-items:start;border:1px solid var(--raya);border-radius:10px;padding:14px 16px;background:var(--fondo)}',
    '.cad-que-2 b{color:var(--tinta)}.cad-que-2 span{color:var(--gris);font-size:13.5px;line-height:1.5}',
    '@media (max-width:760px){.cad-que-2{grid-template-columns:minmax(0,1fr)}}',
    /* subió a ti */
    '.cad-subio{display:flex;align-items:center;gap:14px;width:100%;text-align:left;cursor:pointer;margin:0 0 18px;padding:12px 16px;border-radius:12px;border:1px solid #F0C9CC;background:var(--mal-f);color:var(--texto);font:inherit}',
    '.cad-subio:hover{border-color:var(--mal)}.cad-subio b{display:block;color:var(--mal);font-weight:600}.cad-subio small{display:block;font-size:13px;margin-top:1px}',
    '.cad-subio-n{flex:0 0 auto;width:36px;height:36px;border-radius:50%;background:var(--mal);color:#fff;display:grid;place-items:center;font-weight:600;font-variant-numeric:tabular-nums}',
    '.cad-subio-ir{margin-left:auto;color:var(--mal);font-weight:600;white-space:nowrap}',
    /* la tabla de empresas */
    'table.cad-emps td:first-child{min-width:200px}.cad-ay{margin:0 0 14px}table.cad-emps td{vertical-align:middle}table.cad-emps td.num,table.cad-sup td.num{white-space:nowrap}.cad-emp-n{color:var(--tinta);font-weight:600}.cad-emp-r{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}',
    'table.cad-emps tr.clic{cursor:pointer}table.cad-emps tr.clic:hover td{background:var(--fondo)}table.cad-emps tr.clic:focus-visible{outline:2px solid var(--azul);outline-offset:-2px}',
    '.cad-barra{display:inline-block;vertical-align:middle;width:84px;height:6px;border-radius:3px;background:var(--fondo);overflow:hidden;box-shadow:inset 0 0 0 1px var(--raya)}',
    '.cad-barra i{display:block;height:100%;background:var(--tinta);border-radius:3px}.cad-barra i.ojo{background:var(--ojo)}.cad-pct{font-variant-numeric:tabular-nums;font-size:13px;margin-left:6px}',
    /* las invitaciones */
    '.cad-invs{border-top:1px solid var(--raya)}.cad-h3{margin:20px 0 10px;font-size:14px;color:var(--tinta)}.cad-invs .cad-h3{margin-top:0}',
    '.cad-inv-f{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid var(--raya)}.cad-inv-f:last-child{border-bottom:0;padding-bottom:0}',
    '.cad-inv-f b{color:var(--tinta);font-weight:600}.cad-inv-f small{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}.cad-inv-f.vencida small{color:var(--ojo)}',
    /* quién me supervisa */
    '.cad-arriba{list-style:none;margin:0;padding:0}.cad-arriba li{display:grid;gap:6px;padding:14px 18px;border-bottom:1px solid var(--raya)}.cad-arriba li:last-child{border-bottom:0}',
    '.cad-ar-1{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.cad-ar-1 b{color:var(--tinta);font-weight:600;font-size:15px}',
    '.cad-ar-2{display:flex;gap:6px 18px;flex-wrap:wrap;color:var(--gris);font-size:13px}.cad-ar-3{display:flex;gap:8px;flex-wrap:wrap;margin-top:2px}',
    '.cad-pie{color:var(--gris);font-size:12.5px;line-height:1.6;margin:0 0 18px}',
    /* opciones */
    '.cad-ops{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 14px}.campo .cad-ops{margin:0}',
    '.cad-op{display:grid;gap:2px;padding:10px 12px;border:1px solid var(--raya2);border-radius:9px;cursor:pointer;position:relative;font-size:13.5px}',
    '.cad-op input{position:absolute;opacity:0}.cad-op b{color:var(--tinta);font-weight:600}.cad-op small{color:var(--gris);font-size:12.5px;line-height:1.45}',
    '.cad-op:has(input:checked){background:var(--azul-f);border-color:var(--azul)}.cad-op:focus-within{outline:2px solid var(--azul);outline-offset:2px}',
    '.cad-dos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 12px}',
    '@media (max-width:560px){.cad-ops,.cad-dos{grid-template-columns:minmax(0,1fr)}}',
    /* la ficha */
    '.cad-datos{margin:0 0 6px}.cad-res{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:13.5px;color:var(--gris)}.cad-res b{color:var(--tinta);font-variant-numeric:tabular-nums;font-size:15px}.cad-res .cad-mal b{color:var(--mal)}',
    '.cad-nota{color:var(--gris);font-size:13px;line-height:1.6;max-width:80ch;margin:8px 0 0}.cad-nada{color:var(--gris);margin:4px 0;font-size:13.5px}',
    '.cad-tarj-in{margin:0}.cad-plana{list-style:none;margin:0;padding:0}.cad-plana li{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--raya);font-size:13.5px}',
    '.cad-plana li:last-child{border-bottom:0}.cad-plana small{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}',
    /* filtros */
    '.cad-lados{display:inline-flex;gap:4px;padding:3px;border:1px solid var(--raya);border-radius:10px;background:var(--panel);margin:0 0 14px;flex-wrap:wrap}',
    '.cad-lados button{border:0;background:none;cursor:pointer;padding:8px 14px;border-radius:7px;font:inherit;font-size:13.5px;color:var(--texto)}.cad-lados button b{font-weight:600;color:var(--mal);margin-left:6px;font-size:12.5px}',
    '.cad-lados button.on{background:var(--tinta);color:#fff}.cad-lados button.on b{color:#FFD9DC}',
    '.cad-filtros{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 16px}.cad-filtros select{width:auto;min-width:170px}',
    '.cad-chips{display:inline-flex;flex-wrap:wrap;gap:4px;padding:3px;border:1px solid var(--raya);border-radius:10px;background:var(--panel)}',
    '.cad-chip{border:0;background:none;cursor:pointer;padding:6px 11px;border-radius:7px;font:inherit;font-size:13px;color:var(--texto)}',
    '.cad-chip b{font-weight:600;color:var(--gris);font-variant-numeric:tabular-nums;margin-left:3px}.cad-chip:hover{background:var(--fondo)}.cad-chip.on{background:var(--tinta);color:#fff}.cad-chip.on b{color:#CFE0EA}',
    '.cad-ot{display:block;font-weight:500;color:var(--tinta)}.cad-ol{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}',
    /* el riesgo */
    '.cad-riesgo{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.03em;padding:3px 8px;border-radius:5px;white-space:nowrap}',
    '.cad-riesgo.alto{background:var(--mal);color:#fff}.cad-riesgo.medio{background:var(--ojo-f);color:var(--ojo);box-shadow:inset 0 0 0 1px #EED9A8}.cad-riesgo.bajo{background:var(--fondo);color:var(--gris);box-shadow:inset 0 0 0 1px var(--raya)}',
    /* una observación */
    '.cad-ob-top{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}',
    '.cad-fotos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 16px}.cad-fotos figure{margin:0}',
    '.cad-fotos img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:var(--fondo)}.cad-fotos figcaption{font-size:12.5px;color:var(--gris);margin-top:5px}',
    '.cad-sinfoto{display:grid;place-items:center;aspect-ratio:4/3;border:1.5px dashed var(--raya2);border-radius:10px;color:var(--gris);font-size:13px;text-align:center;padding:10px}',
    '.cad-hist{list-style:none;margin:0;padding:0 0 0 18px;border-left:2px solid var(--raya);display:grid;gap:12px}',
    '.cad-hist li{position:relative;font-size:13.5px}.cad-hist li::before{content:"";position:absolute;left:-25px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--tinta);box-shadow:0 0 0 3px var(--panel)}',
    '.cad-hist li.levanta::before{background:var(--azul)}.cad-hist li.rechaza::before,.cad-hist li.anula::before{background:var(--mal)}.cad-hist li.valida::before{background:var(--ok)}.cad-hist li.sube::before{background:var(--ojo)}.cad-hist li.nota::before{background:var(--gris2)}',
    '.cad-hist b{color:var(--tinta);font-weight:600}.cad-hist small{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}.cad-hist p{margin:4px 0 0;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}',
    '.cad-hist-f{font-size:12.5px}.cad-form{margin-top:10px;border-top:1px solid var(--raya)}.cad-pie-n{font-size:12.5px;margin-right:auto;align-self:center}',
    '.cad-foto{display:flex;gap:12px;align-items:center}.cad-foto img{width:96px;aspect-ratio:4/3;object-fit:cover;border-radius:8px;flex:0 0 auto;background:var(--fondo)}.cad-foto small{display:block;color:var(--gris);font-size:12.5px;margin-top:4px}',
    '.cad-ries-ops{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
    '.cad-ries-op{display:grid;gap:1px;padding:9px 11px;border:1px solid var(--raya2);border-radius:9px;cursor:pointer;position:relative;border-top-width:4px;font-size:13.5px}',
    '.cad-ries-op.alto{border-top-color:var(--mal)}.cad-ries-op.medio{border-top-color:var(--ojo)}.cad-ries-op.bajo{border-top-color:var(--gris2)}',
    '.cad-ries-op input{position:absolute;opacity:0}.cad-ries-op b{color:var(--tinta)}.cad-ries-op small{color:var(--gris);font-size:12px}',
    '.cad-ries-op:has(input:checked){background:var(--azul-f);border-color:var(--azul)}.cad-ries-op:focus-within{outline:2px solid var(--azul);outline-offset:2px}',
    /* el equipo */
    'table.cad-eq select{width:auto;min-width:210px}table.cad-eq td{vertical-align:middle}',
    /* aceptar */
    '.cad-acepta{margin:0 0 16px}.cad-acepta-de{margin:0 0 2px;color:var(--azul);font-weight:600;font-size:14px}.cad-acepta-de small{color:var(--gris);font-weight:400}',
    '.cad-acepta h2{font-size:19px;line-height:1.3;margin:0 0 6px;color:var(--tinta)}.cad-acepta-para{margin:0 0 12px;color:var(--gris);font-size:13.5px}',
    '.cad-acepta-l{margin:0;padding:0 0 0 18px;display:grid;gap:8px;font-size:14px;line-height:1.55;color:var(--texto)}.cad-acepta-l b{color:var(--tinta)}',
    '.alta-main .cad-acepta{max-width:70ch}.alta-main .campo{max-width:70ch}.cad-a-bts{margin-top:8px}'
  ].join('\n');
  document.head.appendChild(st);
}
