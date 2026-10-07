/* OBRASST · el portal · MI PLAN (06/10/2026)
   Marcelo: «¿Hay un medio por la página web por dónde activen el mes gratis después de iniciar sesión y estés en el
   portal? ¿O vean los planes después de iniciar sesión en el portal? ¿Hay un flujo para ello?» No lo había: el mes
   gratis se activaba solo al crear la empresa, los planes se veían de rebote (desde un candado) y el plan se pagaba
   solo en la app. Eligió: «B por favor» — verlo, activarlo y pagarlo aquí mismo.
   Lo que trae esta sección:
   · el plan de la obra, hasta cuándo vale y cuánto de su tamaño se usa (trabajadores, obras, personas, espacio);
   · «Activar mi mes gratis», con las mismas respuestas que la app (uno por persona y uno por empresa);
   · los planes con su precio, por mes o por año, y «Pagar»: antes se elige boleta o factura (lo mismo que la app:
     sst_comprobante_preparar) y se abre Mercado Pago en otra pestaña, con el precio que pone el servidor;
   · AL VOLVER, EL PLAN SE ACTIVA SOLO: el pago aprobado deja su código en el comprobante que la cuenta pidió
     (sst_mis_comprobantes lo trae), y con él se llama a sst_activar_licencia, la misma función que usa la app al
     escribir el código. Si el plan pagado es MENOR que el vigente, no se activa solo: se pregunta (activarlo pisa
     el plan de hoy; los días se suman al final);
   · «Tengo un código», para el que llegó por correo o se compró a mano;
   · «Mis comprobantes»: las boletas y facturas de la cuenta, con su PDF cuando ya se emitieron.
   NADA NUEVO EN EL SERVIDOR: todo son funciones que la app ya usa. La tarjeta no pasa por aquí: paga en Mercado Pago.
   Quien no registró la empresa mira, pero no paga ni activa (el servidor tampoco lo deja). Fuera del Perú el plan se
   pide por correo, como en la app. Dentro de la app de Android no se ofrece el pago por la web (política de Google
   Play): se manda a «Planes» de la app.
   Lo que hace falta desde el arranque (la sección en el menú, su insignia, el aviso de que el plan vence y los pagos
   que quedaron a medias) vive en index.html: PLANW, planwEstado, planwPagos, planwAlElegir.
   No editar la versión: la sella armar.py (PLAN_VER). */
var PLW = { caja:null, de:'', d:null, per:'m', aviso:null, f:null, guardado:null, reloj:null, revisando:null, activando:false, pintando:0, espiando:false, alDia:'', ultima:0 };
var PLW_PAGO = SB.url + '/functions/v1/pago?ir=';
var PLW_SUNAT = 'https://openruc.com/api/ruc/';
var PLW_CP_MAL = { ruc_malo:'Ese RUC no pasa el dígito verificador de SUNAT: revísalo.', falta_razon_social:'Escribe la razón social de tu empresa.',
  dni_malo:'El DNI son 8 números.', doc_malo:'Revisa el número de tu documento.', doc_tipo_malo:'Revisa el número de tu documento.',
  correo_malo:'Revisa tu correo.', falta_doc_boleta:'Tu compra pasa de S/ 700: SUNAT pide tu DNI en la boleta.',
  falta_nombre_boleta:'Tu compra pasa de S/ 700: SUNAT pide tu nombre en la boleta.', sin_factura:'Por ahora solo se emiten boletas.',
  ya_emitido:'Ese comprobante ya se emitió: ya no se cambia.', no_existe:'Ese comprobante ya no está.', demasiados:'Ya pediste muchos hoy: vuelve a intentarlo mañana.',
  nombre_largo:'El nombre es muy largo.', direccion_larga:'La dirección es muy larga.', sin_sesion:'Tu sesión venció: vuelve a entrar.' };
/* el prefijo del código dice de qué plan es (sst_codigo_de_venta y los que se dan a mano) */
var PLW_PREFIJO = { PRV:1, SST:2, EQS:3, PRU:3, GES:4, OBE:4 };

/* ── ayudantes ── */
function _plwPlan(id){ return INI_PLANES.filter(function(P){ return P.id === id; })[0] || null; }
function _plwOrdenDe(plan){ var o = (typeof DC_ORDEN_PLAN === 'object') ? DC_ORDEN_PLAN[String(plan || 'lite')] : 0; return o || 0; }
function _plwDias(n){ return n === 1 ? '1 día' : n + ' días'; }
function _plwMas(iso, dias){ var t = Date.parse(String(iso).slice(0, 10)); if(isNaN(t)) return ''; return new Date(t + dias * 86400000).toISOString().slice(0, 10); }
function _plwHoyServidor(){ return new Date().toISOString().slice(0, 10); }      /* el «current_date» del servidor (UTC) */
function _plwPer(per){ return per === 'a' ? '1 año' : '1 mes'; }
function _plwCod(v){ return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function _plwRucMalo(ruc){
  if(typeof rucMalo === 'function') return rucMalo(ruc);
  if(!/^\d{11}$/.test(ruc)) return 'El RUC tiene 11 dígitos.';
  if(!/^(10|15|16|17|20)/.test(ruc)) return 'Ese RUC no empieza como un RUC del Perú.';
  var w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2], s = 0; for(var i = 0; i < 10; i++) s += (+ruc.charAt(i)) * w[i];
  var r = 11 - (s % 11); if(r === 10) r = 0; if(r === 11) r = 1;
  return r === +ruc.charAt(10) ? '' : PLW_CP_MAL.ruc_malo;
}
/* los precios de quien paga: en soles en el Perú; afuera, en dólares (PRECIO_USD de pais.js) */
function plwPrecios(){
  var pais = paisDelPagoP(), fuera = pais !== 'pe', U = (fuera && typeof PRECIO_USD === 'object') ? PRECIO_USD : null;
  return INI_PLANES.map(function(P){ var m = P.m, a = P.a; if(U && U[P.id]){ m = U[P.id].m; a = U[P.id].a; } return { P:P, m:m, a:a, usd:!!U, fuera:fuera, U:U }; });
}
/* el enlace de Mercado Pago de un pago: la función «pago» de siempre, con el producto (uno de los de los planes) y
   el comprobante. Se arma cada vez: de lo guardado en el navegador no se usa ninguna dirección. */
function plwEnlace(slug, cp){
  var vale = INI_PLANES.some(function(P){ return P.sm === slug || P.sa === slug; });
  if(!vale) return '';
  return PLW_PAGO + encodeURIComponent(slug) + ((cp && /^[A-Za-z0-9-]{1,64}$/.test(String(cp))) ? '&cp=' + encodeURIComponent(cp) : '');
}
/* la empresa a la que va un pago (la que estaba abierta al empezarlo) */
function _plwEmp(id){ var x = null; (YO.empresas || []).forEach(function(e){ if(String(e.id) === String(id)) x = e; }); return x; }
function _plwEstadoDe(e){
  var p = String((e && e.plan) || 'lite'), hoy = hoyISO(), v = (e && e.vence) ? String(e.vence).slice(0, 10) : '';
  var orden = (v && v < hoy) ? 0 : _plwOrdenDe(p);
  return { orden:orden, vence:v, dias:(v && orden > 0) ? Math.round((Date.parse(v) - Date.parse(hoy)) / 86400000) : null };
}
/* hasta cuándo valdría: como el servidor (sst_activar_licencia), los días se suman a lo que queda */
function plwHasta(e, dias){
  var hoy = _plwHoyServidor(), v = (e && e.vence) ? String(e.vence).slice(0, 10) : '';
  return _plwMas((v && v >= hoy) ? v : hoy, dias);
}
function plwSoyDueno(){ return !!(YO.dueno || YO.rol === 'lider'); }
/* ¿el plan de esta obra lo da la cadena (Central)? Con el plan pagado de la empresa a la vista (el medidor de espacio lo dice) */
function plwPorCadena(){
  if(!planwPorCadena()) return false;
  var e = PLW.d && PLW.d.esp;
  return !(e && e.ok === true && /^(gestion|empresa)$/.test(String(e.plan || '')));
}

/* ══ PINTAR ═══════════════════════════════════════════════════════ */
function plwPintar(caja){
  _plwCss();
  PLW.caja = caja;
  var o = YO.obra, de = String(o.id), turno = ++PLW.pintando;
  if(PLW.de !== de){ PLW.de = de; PLW.d = null; }
  if(PLW.d) plwHTML(); else cargando(caja);
  VISTA.recargar = function(){ plwCargar(); };
  plwCargar(turno);
  plwEspiar();
}
function plwCargar(turno){
  var o = YO.obra; if(!o) return Promise.resolve();
  var de = String(o.id), cache = VISTA.cache && VISTA.cache.sst_trabajador;
  turno = turno || PLW.pintando;
  return Promise.all([
    planwMiTraer(true),
    sbRpc('sst_espacio', { p_emp:o.id, p_forzar:false }).catch(function(){ return null; }),
    sbRpc('sst_mis_comprobantes', {}).catch(function(){ return null; }),
    (Array.isArray(cache) ? Promise.resolve(cache) : traer('sst_trabajador', '&select=id,estatus', 5000)).catch(function(){ return null; }),
    (paisDelPagoP() !== 'pe' && typeof cargarPais === 'function') ? cargarPais().catch(function(){ return false; }) : Promise.resolve(true)
  ]).then(function(r){
    if(!YO.obra || String(YO.obra.id) !== de || turno !== PLW.pintando) return;
    var mi = r[0], comp = r[2];
    PLW.d = { mi:mi, esp:r[1], comp:(comp && comp.ok) ? (comp.lista || []) : null, factura:(comp && comp.ok) ? (comp.factura !== false) : null,
              trab:Array.isArray(r[3]) ? r[3].filter(function(t){ return String(t.estatus || 'activo') !== 'cesado'; }).length : null };
    /* el plan cambió en otro lado (se pagó en la app, venció hoy): se vuelve a leer la lista y se repinta todo.
       Una sola vez por cada respuesta distinta: si el servidor se contradijera, no se queda dando vueltas */
    var firma = de + '|' + String(mi && mi.plan) + '|' + String((mi && mi.vence) || '');
    if(mi && mi.plan && PLW.alDia !== firma && (String(mi.plan) !== String(o.plan || 'lite') || String(mi.vence || '') !== String(o.vence || '').slice(0, 10))){
      PLW.alDia = firma;
      return plwAlDia();
    }
    if(PLW.caja && PLW.caja.isConnected && VISTA.actual === 'plan') plwHTML();
    /* llegó tocando «Activar mi mes gratis» en el aviso de arriba: es este mismo botón, ya tocado (si el servidor
       dice que todavía lo tiene). Vale un momento: si se fue a otra cosa, no se activa después por sorpresa */
    if(PLANW.regalo){
      var hace = Date.now() - PLANW.regalo, rb = $('plw-regalo-bt'); PLANW.regalo = 0;
      if(hace < 20000 && rb && VISTA.actual === 'plan') plwRegalo(rb);
    }
    /* un pago que quedó a medias: se mira ya */
    if(planwPagos().some(function(x){ return x.abrio; })) plwRevisarPago(false).then(function(pago){ if(!pago) plwVigilar(); });
  }, function(cod){ if(PLW.caja && PLW.caja.isConnected && !PLW.d) fallo(PLW.caja, cod); });
}
/* después de un cambio de plan: la lista de obras otra vez (de ahí salen el menú, los candados y esta sección) */
function plwAlDia(){
  PLW.d = null;
  return planwRefrescar().then(null, function(){ if(PLW.caja && PLW.caja.isConnected && VISTA.actual === 'plan') plwCargar(); });
}
function plwRepintar(){ if(PLW.caja && PLW.caja.isConnected && VISTA.actual === 'plan' && PLW.d) plwHTML(); }

function plwHTML(){
  var c = PLW.caja; if(!c || !PLW.d) return;
  var E = planwEstado(), due = plwSoyDueno(), cad = plwPorCadena(), dentro = planwEnAndroid(), L = plwPrecios(), fuera = L[0].fuera;
  var h = '<div class="plw">';
  /* data-sin-pais: lo del cobro (códigos, boleta, factura, RUC, SUNAT) no lo adapta la capa del país de la obra */
  h += '<div id="plw-aviso" data-sin-pais>' + plwAvisoHTML() + '</div>';
  h += '<div id="plw-pago" data-sin-pais>' + plwEsperaHTML() + '</div>';
  h += plwEstadoHTML(E, cad);
  if(due && !cad) h += plwGuardadosHTML();
  if(!cad) h += plwRegaloHTML(E, due);
  if(cad){
    h += '<p class="ayuda plw-quien">Mientras esta obra esté en OBRASST Central no hace falta un plan para ella. El plan de tu empresa —el de tus otras obras— se ve y se paga abriendo una de esas obras, arriba.</p>';
  } else {
    h += plwPlanesHTML(E, L, due, dentro);
  }
  h += '<details class="ini-comp-d plw-comp" id="plw-comp"><summary>Qué trae cada plan, acceso por acceso <span>· ' + INI_VITRINA.length + ' accesos</span></summary>' +
       iniTablaHTML('plw-t', E.plan.orden, fuera && !L[0].usd, L) + '</details>';
  if(due && !cad){
    h += '<div class="plw-dos">' + plwCodigoHTML() + plwExtrasHTML(L) + '</div>';
  }
  h += '<div id="plw-comprobantes">' + plwCompHTML() + '</div>';
  if(!cad) h += plwLetraHTML(L, dentro);
  h += '</div>';
  c.innerHTML = h;
  plwAtar();
}

/* ── el aviso de arriba: lo que acaba de pasar (activado, no se pudo, falta elegir) ── */
function plwAvisoHTML(){
  var a = PLW.aviso; if(!a) return '';
  return '<div class="aviso ' + esc(a.cl || 'ok') + ' plw-av" id="plw-av" role="status">' + a.h +
         (a.bts ? '<div class="acciones">' + a.bts + '</div>' : '') +
         (a.fijo ? '' : '<button type="button" class="plw-av-x" id="plw-av-x" aria-label="Cerrar este aviso">×</button>') + '</div>';
}
function plwAvisar(cl, h, bts, fijo){
  PLW.aviso = { cl:cl, h:h, bts:bts || '', fijo:!!fijo };
  var z = $('plw-aviso');
  if(z && PLW.caja && PLW.caja.isConnected && VISTA.actual === 'plan'){ z.innerHTML = plwAvisoHTML(); plwAtarAviso(); try{ window.scrollTo(0, 0); }catch(e){} }
}
function plwAtarAviso(){
  var x = $('plw-av-x'); if(x) x.onclick = function(){ PLW.aviso = null; var z = $('plw-aviso'); if(z) z.innerHTML = ''; };
  var z = $('plw-aviso'); if(!z) return;
  Array.prototype.forEach.call(z.querySelectorAll('[data-plw]'), function(b){ b.onclick = function(){ plwAccion(b.getAttribute('data-plw'), b); }; });
}

/* ── el respaldo: avisar que pagué ──
   Marcelo (06/10/2026): «podría ser como respaldo un mensaje al WhatsApp o al correo, mencionando: he realizado un pago
   para el plan …, esperando el código, si es que no funciona automáticamente». El mensaje va ya escrito, con lo que hace
   falta para ubicar el pago: el plan, el periodo y el monto, la empresa y su código, la cuenta, cuándo empezó y la
   referencia del comprobante. Lo manda la persona desde SU WhatsApp o su correo: de aquí no sale nada solo.
   p: el pago apuntado (sin él, el último que llegó a abrir Mercado Pago; si no hay, uno general). cod: el código, si ya salió */
function plwRespaldo(p, cod){
  if(!p) p = planwPagos().filter(function(x){ return x.abrio; })[0] || null;
  var o = YO.obra || {}, e = (p && _plwEmp(p.emp)) || o, P = p ? (_plwPlan(p.plan) || { n:p.plan }) : null, L = [];
  L.push('Hola. He realizado un pago para ' + (P ? 'el plan ' + P.n + ' de OBRASST (' + _plwPer(p.per) + ' · ' + _plata(p.monto) + ')' : 'un plan de OBRASST') +
         (cod ? ' y mi plan no se activó con el código que me salió.' : ' y mi plan todavía no se activa. Quedo a la espera del código.'));
  L.push('Empresa: ' + (e.padre_nombre || e.nombre || '—') + (e.codigo ? ' (código ' + e.codigo + ')' : ''));
  if(TOK && TOK.correo) L.push('Cuenta: ' + TOK.correo);
  if(cod) L.push('Código: ' + cod);
  if(p){
    var d = new Date(p.t0 || p.t);
    L.push('Pago iniciado: ' + dos(d.getDate()) + '/' + dos(d.getMonth() + 1) + '/' + d.getFullYear() + ', ' + dos(d.getHours()) + ':' + dos(d.getMinutes()));
    if(p.cp) L.push('Referencia: ' + String(p.cp).slice(0, 8));
  }
  var t = L.join('\n'), wa = (typeof SOPORTE_WA === 'string' && /^\d{8,15}$/.test(SOPORTE_WA)) ? SOPORTE_WA : '';
  return { t:t, wa:wa ? 'https://wa.me/' + wa + '?text=' + encodeURIComponent(t) : '',
           correo:'mailto:' + SOPORTE + '?subject=' + encodeURIComponent('OBRASST · pagué' + (P ? ' el plan ' + P.n : '') + ' y no se activó') + '&body=' + encodeURIComponent(t) };
}
function plwRespaldoBts(p, cod){
  var r = plwRespaldo(p, cod);
  return (r.wa ? '<a class="bt sec chico" data-resp="wa" href="' + esc(r.wa) + '" target="_blank" rel="noopener">Avisar por WhatsApp</a>' : '') +
         '<a class="bt sec chico" data-resp="correo" href="' + esc(r.correo) + '">Avisar por correo</a>';
}

/* ── el pago que se espera ── */
function plwEsperaHTML(){
  var p = planwPagos().filter(function(x){ return x.abierto; })[0]; if(!p) return '';
  var P = _plwPlan(p.plan) || { n:p.plan }, e = _plwEmp(p.emp), otra = e && YO.obra && String(e.id) !== String(YO.obra.id);
  return '<div class="plw-espera" id="plw-espera" role="status">' +
    '<h2><span class="plw-gira" aria-hidden="true"></span><span>Esperando tu pago · ' + esc(P.n) + ' · ' + _plwPer(p.per) + ' · ' + _plata(p.monto) + '</span></h2>' +
    '<p>Paga en la pestaña de Mercado Pago que se abrió. Apenas se apruebe, <b>tu plan se activa aquí solo</b>' + (otra ? ' en ' + esc(e.nombre) : '') +
    ': no hace falta que copies nada. Si pagas en efectivo o por banca puede tardar: cuando se apruebe, vuelve a entrar al portal desde este mismo equipo y se activa.</p>' +
    '<div class="acciones"><button type="button" class="bt chico" data-plw="revisar">Ya pagué: revisar ahora</button>' +
    '<a class="bt sec chico" href="' + esc(plwEnlace(p.slug, p.cp)) + '" target="_blank" rel="noopener">Abrir Mercado Pago otra vez</a>' +
    '<button type="button" class="bt sec chico" data-plw="dejar">No voy a pagar ahora</button></div>' +
    '<p class="plw-chico" id="plw-espera-msg">¿Te salió un código en pantalla o te llegó por correo? También sirve: escríbelo abajo, en «Tengo un código».</p>' +
    '<div class="plw-resp" id="plw-resp"><span><b>¿Ya pagaste y no se activa?</b> Espera unos minutos; si sigue igual, avísanos y lo activamos nosotros. El mensaje ya va escrito con los datos de tu pago.</span>' +
    '<span class="plw-resp-b">' + plwRespaldoBts(p) + '</span></div></div>';
}

/* ── el estado ── */
function plwEstadoHTML(E, cad){
  var d = PLW.d, mi = d.mi || {}, P = E.plan, o = YO.obra || {}, h = '', pill = '', vale = '';
  if(cad){
    pill = '<span class="pill azul">por OBRASST Central</span>';
    vale = 'Esta obra trabaja con <b>todo abierto</b>, como en Gestión SST, porque está en OBRASST Central' + (E.vence ? ' hasta el ' + esc(fechaLarga(E.vence)) : '') +
           '. Central se contrata aparte, con nosotros.';
  } else if(E.orden > 0 && E.dias !== null){
    pill = '<span class="pill ' + (E.dias <= 3 ? 'mal' : (E.dias <= 7 ? 'ojo' : 'ok')) + '">' + (E.dias === 0 ? 'vence hoy' : (E.dias === 1 ? 'vence mañana' : 'te quedan ' + _plwDias(E.dias))) + '</span>';
    vale = 'Vale hasta el <b>' + esc(fechaLarga(E.vence)) + '</b>. Si renuevas antes, los días se suman. Si no, ese día la cuenta vuelve sola a LITE, que es gratis: nada se borra, y lo de tu plan vuelve a abrirse cuando lo retomas.';
  } else if(E.orden > 0){
    pill = '<span class="pill ok">activo</span>';
    vale = 'Tu plan está activo y no tiene fecha de vencimiento anotada.';
  } else if(E.vencio !== null){
    pill = '<span class="pill ojo">tu plan venció</span>';
    vale = 'Tu plan anterior venció el <b>' + esc(fechaLarga(E.vence)) + '</b> y la cuenta volvió a LITE, que es gratis. Lo que registraste no se borró: vuelve a abrirse cuando retomas un plan que lo incluya.';
  } else {
    pill = '<span class="pill gris">gratis</span>';
    vale = 'LITE es gratis para siempre: la app y el portal enteros, con poco volumen y el contenido de muestra.';
  }
  h += '<div class="tarj plw-estado" id="plw-estado" data-plan="' + esc(P.id) + '"><div class="tarj-cuerpo">' +
       '<p class="plw-ceja">El plan de ' + esc(o.padre_nombre || o.nombre || 'tu empresa') + '</p>' +
       '<div class="plw-nombre"><h2>' + esc(P.n) + '</h2>' + pill + '</div>' +
       '<p class="plw-vale">' + vale + '</p>';
  /* cuánto del tamaño del plan se usa */
  var esp = d.esp, cel = [];
  var uso = function(et, usa, tope, tx, sub){
    var pct = (tope > 0) ? Math.min(100, Math.round(100 * usa / tope)) : 0, cl = (tope > 0 && usa > tope) ? ' lleno' : ((tope > 0 && usa >= 0.8 * tope) ? ' casi' : '');
    cel.push('<div class="plw-u' + cl + '"><span class="et">' + et + '</span><span class="v">' + tx + '</span>' +
             (tope > 0 ? '<span class="b" role="img" aria-label="' + pct + ' % usado"><i style="width:' + Math.max(pct, usa > 0 ? 2 : 0) + '%"></i></span>' : '') +
             ((tope > 0 && usa >= tope) ? '<span class="s tope">' + (usa > tope ? 'pasó el tope del plan' : 'al tope del plan') + '</span>' : (sub ? '<span class="s">' + sub + '</span>' : '')) + '</div>');
  };
  if(d.trab !== null) uso('Trabajadores activos', d.trab, P.trab, _miles(d.trab) + ' <small>de ' + _miles(P.trab) + '</small>', 'en esta obra');
  if(mi.tope_obras) uso('Obras', +mi.obras || 1, +mi.tope_obras, (+mi.obras || 1) + ' <small>de ' + (+mi.tope_obras) + '</small>', '');
  if(mi.tope_gestores) uso('Personas en la gestión', +mi.gestores_usados || 1, +mi.tope_gestores, (+mi.gestores_usados || 1) + ' <small>de ' + (+mi.tope_gestores) + '</small>', '');
  if(esp && esp.ok === true){
    var inclGb = (+esp.incluido_gb || 0) + (+esp.extra_gb || 0), usa = +esp.total || 0;
    uso('Espacio', usa, inclGb * ESP_GB, _espTam(usa) + ' <small>de ' + _espGb(inclGb) + '</small>', 'toda la empresa');
  }
  if(cel.length) h += '<div class="plw-uso" id="plw-uso">' + cel.join('') + '</div>';
  return h + '</div></div>';
}

/* ── lo que se pagó y se guardó para después (un plan menor que el vigente): a un toque ── */
function plwGuardadosHTML(){
  var g = _plwGuardados(), L = (PLW.d && PLW.d.comp) || []; if(!g.length) return '';
  return g.map(function(cod){
    var x = L.filter(function(y){ return (y.codigos || []).indexOf(cod) > -1; })[0];
    return '<div class="plw-guardado" data-sin-pais data-cod="' + esc(cod) + '"><span><b>Tienes un plan pagado sin activar</b>' + (x && x.descripcion ? esc(String(x.descripcion).replace(/^OBRASST · /, '')) + ' · ' : '') +
           'código <span class="plw-mono">' + esc(cod) + '</span></span><button type="button" class="bt chico" data-plw="usar" data-cod="' + esc(cod) + '">Activarlo</button></div>';
  }).join('');
}

/* ── el mes gratis ── */
function plwRegaloHTML(E, due){
  var mi = PLW.d.mi; if(E.orden !== 0 || !mi) return '';
  var usada = mi.prueba_usada === true, emp = mi.prueba_empresa === true;
  if(emp) return due ? '<p class="plw-chico plw-regalo-no" id="plw-regalo-no">🎁 Esta empresa ya tuvo su mes gratis: es uno por empresa (con el mismo documento es la misma), aunque cambie quien la lleva. Elige el plan que te sirva y sigues con todo; tus datos no se tocan.</p>' : '';
  if(!due) return '<p class="plw-chico plw-regalo-no" id="plw-regalo-no">🎁 Tu empresa todavía no usó su mes gratis del plan SSOMA: lo activa quien la registró.</p>';
  if(usada) return '<p class="plw-chico plw-regalo-no" id="plw-regalo-no">🎁 Tu mes gratis ya se usó: es uno por persona. Elige el plan que te sirva y sigues con todo; tus datos no se tocan.</p>';
  return '<div class="plw-regalo" id="plw-regalo"><div><b>🎁 Tu primer mes es gratis</b>' +
    '<p>30 días del plan SSOMA completo, sin tarjeta y sin cobro automático. Al terminar, la cuenta vuelve sola a LITE y tus documentos no se borran.</p></div>' +
    '<button type="button" class="bt casco" id="plw-regalo-bt" data-plw="regalo">Activar mi mes gratis</button></div>';
}

/* ── los planes ── */
function plwPlanesHTML(E, L, due, dentro){
  /* sinFecha: un plan activo sin fecha de vencimiento (dado a mano). Un pago o un código le pondría fecha (el servidor
     cuenta los días desde hoy): aquí no se ofrece pagar */
  var per = PLW.per, usd = L[0].usd, fuera = L[0].fuera, sinFecha = E.orden > 0 && E.dias === null, paga = due && !fuera && !dentro && !sinFecha, h = '';
  h += '<div class="plw-cab"><div><h2>' + (sinFecha ? 'Los planes' : (E.orden > 0 ? 'Renueva o cambia de plan' : 'Elige tu plan')) + '</h2>' +
       '<p class="sub">' + (fuera ? 'Fuera del Perú los planes se contratan directo con nosotros, en dólares.' : (sinFecha ? 'Lo que trae cada uno y lo que cuesta.' : 'Se paga con Mercado Pago: un solo pago, sin renovación automática. No guardamos tu tarjeta.')) + '</p></div>' +
       '<div class="seg chico" role="group" aria-label="Periodo" id="plw-per">' +
       '<button type="button" data-per="m" class="' + (per === 'm' ? 'on' : '') + '" aria-pressed="' + (per === 'm') + '">Por mes</button>' +
       '<button type="button" data-per="a" class="' + (per === 'a' ? 'on' : '') + '" aria-pressed="' + (per === 'a') + '">Por año · pagas 10 meses</button></div></div>';
  if(!due) h += '<p class="ayuda plw-quien" id="plw-quien">El plan lo elige y lo paga quien registró la empresa. Aquí ves lo que trae cada uno.</p>';
  else if(dentro) h += '<div class="aviso plw-quien" id="plw-quien">Estás dentro de la app: aquí el plan se elige y se paga en la app, en «Planes». <a href="' + esc(appBase()) + '?ir=p-planes">Ir a «Planes» en la app</a></div>';
  else if(sinFecha && !fuera) h += '<p class="ayuda plw-quien" id="plw-quien">Tu plan no tiene fecha de vencimiento: no hay nada que renovar, y por eso aquí no se ofrece pagar (un pago le pondría fecha). Para pasar a un plan mayor, escríbenos a <a href="mailto:' + SOPORTE + '">' + SOPORTE + '</a> y lo vemos contigo.</p>';
  h += '<div class="plw-planes" id="plw-planes">';
  L.forEach(function(x, i){
    var P = x.P; if(P.orden === 0) return;
    var mio = E.orden > 0 && P.orden === E.orden, sig = !mio && P.orden === E.orden + 1, monto = per === 'a' ? x.a : x.m;
    var suma = INI_VITRINA.filter(function(v){ return v.desde === P.orden; });
    var precio = (x.usd || !fuera)
      ? '<div class="precio">' + _plata(monto, x.usd) + ' <small>' + (per === 'a' ? 'al año' : 'al mes') + '</small></div>' +
        '<div class="anual">' + (per === 'a' ? 'equivale a ' + _plata2(x.a / 12, x.usd) + ' al mes · ahorras ' + _plata(x.m * 12 - x.a, x.usd) : 'o ' + _plata(x.a, x.usd) + ' al año') + '</div>'
      : '<div class="precio plw-sinp">En dólares</div><div class="anual">Te pasamos el precio al pedirlo</div>';
    var bt = '';
    if(paga){
      /* en amarillo, el que más se va a tocar: renovar el plan de hoy; en LITE, el primer plan de pago */
      var cl = mio ? ' casco' : (P.orden < E.orden ? ' sec' : ((sig && E.orden === 0) ? ' casco' : ''));
      bt = (mio ? '<p class="plw-nota-bt">Los días se suman a los que te quedan.</p>' : '') +
           '<button type="button" class="bt' + cl + '" data-plw="pagar" data-plan="' + esc(P.id) + '">' +
           (mio ? 'Renovar' : (P.orden < E.orden ? 'Cambiar' : 'Pagar')) + ' · ' + _plata(monto) + '</button>';
    } else if(due && fuera && !dentro){
      bt = '<button type="button" class="bt' + (mio ? ' sec' : '') + '" data-plw="pedir" data-plan="' + esc(P.id) + '">Pedir este plan</button>';
    }
    h += '<article class="ini-plan' + (mio ? ' mio' : '') + '" data-plan="' + esc(P.id) + '">' +
         (mio ? '<span class="sello">Tu plan</span>' : (sig ? '<span class="sello sig">El siguiente</span>' : '')) +
         '<h3>' + esc(P.n) + '</h3>' + precio +
         '<p class="ini-para">' + esc(P.para) + '</p>' +
         '<ul><li><span><b>' + _miles(P.trab) + '</b> trabajadores</span></li><li><span><b>' + P.obras + '</b> obra' + (P.obras === 1 ? '' : 's') + '</span></li>' +
         '<li><span><b>' + P.gest + '</b> persona' + (P.gest === 1 ? '' : 's') + ' en la gestión</span></li><li><span><b>' + P.gb + ' GB</b> de espacio</span></li></ul>' +
         '<p class="ini-suma-t">Todo lo de <b>' + esc(INI_PLANES[i - 1].n) + '</b>, y además:</p><ul class="ini-suma">' +
         suma.map(function(v){ return '<li title="' + esc(v.d) + '"><span aria-hidden="true">' + v.ic + '</span> ' + esc(v.n) + (v.nuevo ? ' <em class="nuevo">Nuevo</em>' : '') + '</li>'; }).join('') + '</ul>' +
         (bt ? '<div class="plw-bts">' + bt + '</div>' : '') + '</article>';
  });
  return h + '</div>';
}

/* ── tengo un código ── */
function plwCodigoHTML(){
  return '<div class="tarj plw-cod" id="plw-cod-caja" data-sin-pais><div class="tarj-cab"><div><h2>Tengo un código</h2><p class="sub">El que te llegó por correo, el que salió en pantalla al pagar o el que te dimos nosotros</p></div></div>' +
    '<div class="tarj-cuerpo"><label for="plw-cod">Código del plan</label><div class="plw-cod-f"><input id="plw-cod" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24" placeholder="PRV · SST · EQS · GES">' +
    '<button type="button" class="bt" id="plw-cod-bt" data-plw="codigo">Activar</button></div>' +
    '<p class="msg" id="plw-cod-msg" role="status"></p>' +
    '<p class="ayuda">Cada código vale una sola vez y se queda en esta empresa. El de un mes dura 30 días y el de un año, 365; los días se suman a los que te queden.</p>' +
    plwRespaldoLineaHTML() + '</div></div>';
}
/* y siempre a mano: quien pagó (aquí, en la app o como sea) y no tiene su plan, avisa desde aquí */
function plwRespaldoLineaHTML(){
  var r = plwRespaldo();
  return '<p class="ayuda plw-resp-l" id="plw-resp-cod">¿Pagaste y no te llegó el código, o tu plan no se activó? Avísanos por ' +
    (r.wa ? '<a data-resp="wa" href="' + esc(r.wa) + '" target="_blank" rel="noopener">WhatsApp</a> o por ' : '') +
    '<a data-resp="correo" href="' + esc(r.correo) + '">correo</a>: el mensaje ya va escrito.</p>';
}
/* ── lo que se pide suelto ── */
function plwExtrasHTML(L){
  var usd = L[0].usd, U = L[0].U, fuera = L[0].fuera, o = YO.obra || {};
  var obra = usd ? U.obra : INI_EXTRA.obra, puesto = usd ? U.puesto : INI_EXTRA.puesto, conPrecio = usd || !fuera;
  var raiz = o.padre_nombre || o.nombre || 'mi empresa', plan = planWebActual().n;
  var correo = function(cosa, monto){
    var t = 'Hola. Quiero sumar ' + cosa + (monto ? ' (' + monto + ' al mes)' : '') + ' al plan ' + plan + ' de ' + raiz + (o.codigo ? ' (código ' + o.codigo + ')' : '') + '.';
    return 'mailto:' + SOPORTE + '?subject=' + encodeURIComponent('OBRASST · ' + cosa) + '&body=' + encodeURIComponent(t);
  };
  return '<div class="tarj plw-extras" id="plw-extras"><div class="tarj-cab"><div><h2>¿Te falta una obra, una persona o espacio?</h2><p class="sub">Se suma a tu plan, sin cambiarlo</p></div></div>' +
    '<div class="tarj-cuerpo"><ul class="plw-ex">' +
    '<li><span><b>Una obra más</b>' + (conPrecio ? _plata(obra, usd) + ' al mes' : '') + '</span><a class="bt sec chico" href="' + esc(correo('una obra extra', conPrecio ? _plata(obra, usd) : '')) + '">Pedirla</a></li>' +
    '<li><span><b>Una persona más en la gestión</b>' + (conPrecio ? _plata(puesto, usd) + ' al mes' : '') + '</span><a class="bt sec chico" href="' + esc(correo('un puesto extra', conPrecio ? _plata(puesto, usd) : '')) + '">Pedirla</a></li>' +
    '<li><span><b>Más espacio</b>Te escribimos con las opciones</span><a class="bt sec chico" href="' + esc(correo('más espacio', '')) + '">Pedirlo</a></li></ul>' +
    '<p class="ayuda">Se piden por correo: te escribimos con el cobro y, apenas esté pagado, lo sumamos a tu empresa. No cambias de plan ni pierdes nada.</p></div></div>';
}

/* ── mis comprobantes ── */
function plwCompHTML(){
  var L = (PLW.d && PLW.d.comp) || []; if(!L.length) return '';
  var due = plwSoyDueno();
  return '<div class="tarj plw-comp-t" id="plw-comp-caja" data-sin-pais><div class="tarj-cab"><div><h2>Mis comprobantes</h2><p class="sub">Las boletas y facturas de lo que pagaste con esta cuenta · cuando se emiten, aquí queda su PDF</p></div></div>' +
    '<div class="tabla-caja"><table><thead><tr><th>Comprobante</th><th>Qué se pagó</th><th>Fecha</th><th class="num">Monto</th><th>Estado</th><th></th></tr></thead><tbody>' +
    L.slice(0, 30).map(function(x){
      var em = x.estado === 'emitido', tipo = x.tipo === 'factura' ? 'Factura' : 'Boleta', cod = (x.codigos || [])[0];
      var est = em ? '<span class="pill ok">Emitido</span>' : (x.estado === 'anulado' ? '<span class="pill gris">Anulado</span>' : '<span class="pill ojo">Por emitir</span>');
      var acc = (em && x.pdf ? '<button type="button" class="bt sec chico" data-plw="pdf" data-id="' + esc(x.id) + '">Descargar</button>' : '') +
                (/^(pendiente|rechazado)$/.test(x.estado) ? '<button type="button" class="bt sec chico" data-plw="cambiar" data-id="' + esc(x.id) + '">Cambiar datos</button>' : '') +
                (cod && due && x.estado !== 'anulado' && _plwGuardados().indexOf(cod) > -1 ? '<button type="button" class="bt chico" data-plw="usar" data-cod="' + esc(cod) + '">Activar este código</button>' : '');
      return '<tr data-id="' + esc(x.id) + '"><td><b>' + tipo + '</b>' + (em && x.serie ? ' <span class="plw-mono">' + esc(x.serie + '-' + x.numero) + '</span>' : '') + '</td>' +
        '<td>' + esc(x.descripcion || '') + (cod ? '<span class="sub">Código <span class="plw-mono">' + esc(cod) + '</span></span>' : '') + '</td>' +
        '<td>' + esc(fechaLarga(String(em ? (x.emitido_en || x.creado) : x.creado))) + '</td>' +
        '<td class="num">' + (x.monto != null ? esc((x.moneda === 'USD' ? 'US$ ' : 'S/ ') + _plata2(+x.monto || 0).replace(/^S\/ /, '')) : '—') + '</td>' +
        '<td>' + est + '</td><td class="fila-acc">' + acc + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';
}

/* ── la letra chica: lo mismo que dice la página de inicio ── */
function plwLetraHTML(L, dentro){
  var usd = L[0].usd, U = L[0].U, fuera = L[0].fuera;
  if(fuera) return '<div class="ini-letra plw-letra" data-sin-pais><p><b>Fuera del Perú</b> los planes se pagan en dólares, directo con nosotros: los pides aquí o desde la app, y te llega un código para activarlos. El año cuesta diez meses.</p>' +
    '<p><b>Dentro de la app, por Google Play,</b> es una suscripción que se renueva sola hasta que la canceles, en la moneda de tu celular.</p></div>';
  return '<div class="ini-letra plw-letra" data-sin-pais><p><b>Pagando por la web</b> (Mercado Pago) es un solo pago por el mes o el año que eliges: no se renueva solo y no guardamos tu tarjeta. El año cuesta diez meses. Precios en soles. Antes de pagar eliges boleta o factura.</p>' +
    '<p><b>Dentro de la app, por Google Play,</b> es una suscripción que se renueva sola hasta que la canceles, y cuesta un poco más por la comisión de la tienda. Si pagaste ahí, se cancela en Google Play.</p></div>';
}

/* ══ ATAR ═════════════════════════════════════════════════════════ */
function plwAtar(){
  var c = PLW.caja; if(!c) return;
  Array.prototype.forEach.call(c.querySelectorAll('[data-plw]'), function(b){ b.onclick = function(){ plwAccion(b.getAttribute('data-plw'), b); }; });
  Array.prototype.forEach.call(c.querySelectorAll('#plw-per button'), function(b){ b.onclick = function(){ PLW.per = b.getAttribute('data-per') === 'a' ? 'a' : 'm'; plwRepintar(); }; });
  var x = $('plw-av-x'); if(x) x.onclick = function(){ PLW.aviso = null; var z = $('plw-aviso'); if(z) z.innerHTML = ''; };
  var i = $('plw-cod'); if(i) i.onkeydown = function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); plwCodigo(); } };
}
function plwAccion(que, b){
  if(que === 'regalo') return plwRegalo(b);
  if(que === 'pagar') return plwPagar(b.getAttribute('data-plan'));
  if(que === 'pedir') return plwPedir(b.getAttribute('data-plan'));
  if(que === 'codigo') return plwCodigo();
  if(que === 'revisar') return plwRevisarPago(true);
  if(que === 'dejar') return plwDejar();
  if(que === 'pdf') return plwPdf(b.getAttribute('data-id'), b);
  if(que === 'cambiar') return plwCambiar(b.getAttribute('data-id'));
  if(que === 'usar') return plwUsar(b.getAttribute('data-cod'));
  if(que === 'activar-ya') return plwActivarGuardado(true);
  if(que === 'activar-luego') return plwActivarGuardado(false);
  if(que === 'reintentar') return plwRevisarPago(true);
}

/* ══ EL MES GRATIS ════════════════════════════════════════════════ */
function plwRegalo(b){
  var o = YO.obra; if(!o || PLW.activando) return;
  PLW.activando = true; if(b){ b.disabled = true; b.textContent = 'Activando…'; }
  sbRpc('sst_prueba_gratis', { p_emp:o.id }).then(function(pr){
    PLW.activando = false;
    if(pr && pr.ok){
      plwAvisar('ok', '<b>Listo, tu mes gratis está activo.</b> Tienes el plan SSOMA completo por ' + (+pr.dias || 30) + ' días' +
        (pr.vence ? ', hasta el ' + esc(fechaLarga(String(pr.vence).slice(0, 10))) : '') + '. No pagas nada ahora y no hay cobro automático.');
      toast('Tu mes gratis está activo');
      return plwAlDia();
    }
    var q = (pr && pr.motivo) || '';
    plwAvisar(q === 'ya_tiene_plan' ? 'ok' : 'ojo',
      q === 'ya_la_usaste' ? '<b>Tu mes gratis ya se usó.</b> Es uno por persona y tu cuenta ya lo usó con otra empresa. Para seguir con todo, elige el plan que te sirva: tus datos no se tocan.' :
      q === 'ya_usada' ? '<b>Esta empresa ya tuvo su mes gratis.</b> Es uno por empresa, aunque cambie quien la lleva, y con el mismo documento cuenta como la misma. Para seguir con todo, elige el plan que te sirva: tus datos no se tocan.' :
      q === 'ya_tiene_plan' ? '<b>Ya tienes un plan activo:</b> no hace falta la prueba.' :
      q === 'no_eres_dueno' ? '<b>No se pudo activar.</b> Solo quien registró la empresa puede activarlo.' :
      q === 'sin_sesion' ? '<b>Tu sesión venció.</b> Vuelve a entrar y tócalo otra vez.' :
      '<b>No se pudo activar tu mes gratis.</b> Escríbenos a <a href="mailto:' + SOPORTE + '">' + SOPORTE + '</a> con el código de tu obra y lo activamos a mano.');
    /* lo que el servidor dijo se recuerda: el botón no vuelve a salir */
    PLANW.mi = null; PLANW.t = 0; plwCargar();
  }, function(){
    PLW.activando = false; if(b){ b.disabled = false; b.textContent = 'Activar mi mes gratis'; }
    plwAvisar('mal', '<b>No hubo respuesta del servidor.</b> Revisa tu internet y vuelve a tocarlo en un momento.');
  });
}

/* ══ PAGAR ════════════════════════════════════════════════════════ */
function plwPagar(planId){
  var x = plwPrecios().filter(function(y){ return y.P.id === planId; })[0]; if(!x || !plwSoyDueno()) return;
  var per = PLW.per, o = YO.obra, E = planwEstado();
  PLW.f = { modo:'pagar', plan:x.P.id, per:per, slug:(per === 'a' ? x.P.sa : x.P.sm), monto:(per === 'a' ? x.a : x.m), dias:(per === 'a' ? 365 : 30),
            emp:o.id, empN:o.nombre, tipo:'boleta', listo:null, cp:null, id:null, v:{}, sinCp:false };
  if(!PLW.f.slug){ plwAvisar('mal', '<b>Ese plan todavía no se puede pagar aquí.</b> Escríbenos a ' + SOPORTE + '.'); return; }
  plwFormHoja(x.P, E);
}
/* lo que cambia al pagar ese plan, dicho antes */
function plwCambioHTML(P, E, dias){
  var o = YO.obra, hasta = plwHasta(o, dias), A = E.plan;
  if(!(E.orden > 0 && E.dias !== null)) return '<p class="plw-res-n">Apenas se apruebe el pago, tu plan se activa solo. Valdrá hasta el <b>' + esc(fechaLarga(hasta)) + '</b>.</p>';
  if(P.orden === E.orden) return '<p class="plw-res-n">Apenas se apruebe el pago se suma a tu plan: te quedan ' + _plwDias(E.dias) + ' y valdrá hasta el <b>' + esc(fechaLarga(hasta)) + '</b>.</p>';
  if(P.orden > E.orden) return '<p class="plw-res-n">Apenas se apruebe el pago, tu obra pasa a <b>' + esc(P.n) + '</b>. Los ' + _plwDias(E.dias) + ' que te quedan de ' + esc(A.n) + ' se suman: valdrá hasta el <b>' + esc(fechaLarga(hasta)) + '</b>.</p>';
  var pierde = INI_VITRINA.filter(function(v){ return v.desde > P.orden && v.desde <= E.orden; }).map(function(v){ return v.n; });
  return '<div class="aviso ojo plw-res-baja" id="plw-baja"><b>Ojo: ' + esc(P.n) + ' es un plan menor que el que tienes hoy.</b> Estás en ' + esc(A.n) + ' hasta el ' + esc(fechaLarga(E.vence)) +
    '. Al activar ' + esc(P.n) + ', tu obra pasa a ese plan en ese momento y tus ' + _plwDias(E.dias) + ' se suman al final (valdría hasta el ' + esc(fechaLarga(hasta)) + ').' +
    (pierde.length ? ' Dejarías de tener: ' + esc(pierde.join(' · ')) + '. Lo registrado no se borra.' : '') +
    ' <b>Después de pagar eliges</b> si lo activas en el momento o lo guardas para cuando termine tu plan de hoy.</div>';
}
function plwFormHoja(P, E){
  var f = PLW.f, edita = f.modo === 'editar';
  var tit = edita ? 'Cambiar los datos del comprobante' : ((E.orden > 0 && P.orden === E.orden) ? 'Renovar ' : (E.orden > 0 && P.orden < E.orden ? 'Cambiar a ' : 'Pagar ')) + P.n;
  var sub = edita ? (f.desc || '') : _plwPer(f.per) + ' · ' + _plata(f.monto);
  abrirHoja(tit, sub, '<div id="plw-f" data-sin-pais></div>', '<button type="button" class="bt sec" id="plw-f-no">Cancelar</button><button type="button" class="bt" id="plw-f-si">' + (edita ? 'Guardar' : 'Seguir al pago') + '</button>', { clase:'hoja-plw', sinFoco:true, sinPais:true });
  f.cambio = edita ? '' : plwCambioHTML(P, E, f.dias);
  f.P = P;
  plwFormPintar();
  $('plw-f-no').onclick = cerrarHoja;
  $('plw-f-si').onclick = function(){ if(PLW.f && PLW.f.modo === 'editar') plwFormGuardar(); else plwFormSeguir(); };
  /* ¿hay factura? (en el Nuevo RUS, no): se pregunta una vez */
  if(PLW.d && PLW.d.factura === null){
    sbRpc('sst_comprobante_opciones', {}).then(function(j){ if(j && j.ok && PLW.d){ PLW.d.factura = j.factura !== false; if(PLW.f && !PLW.f.listo && $('plw-f')){ _plwFormLeer(); plwFormPintar(); } } }, function(){});
  }
}
function _plwFormLeer(){
  var f = PLW.f; if(!f) return;
  ['ruc', 'nom', 'dir', 'dni', 'cor'].forEach(function(k){ var e = $('plw-f-' + k); if(e) f.v[k] = e.value; });
}
function plwFormPintar(){
  var c = $('plw-f'), f = PLW.f; if(!c || !f) return;
  var hayF = !(PLW.d && PLW.d.factura === false), fac = f.tipo === 'factura' && hayF, grande = (+f.monto || 0) > 700, v = f.v || {};
  if(!hayF && f.tipo === 'factura') f.tipo = 'boleta';
  var h = '';
  if(f.modo === 'pagar'){
    h += '<div class="plw-res" id="plw-res"><div class="plw-res-f"><span><b>' + esc(f.P.n) + '</b> · ' + _plwPer(f.per) + (f.empN ? '<small>' + esc(f.empN) + '</small>' : '') + '</span><span class="plw-res-m">' + _plata(f.monto) + '</span></div>' + f.cambio + '</div>';
  }
  if(f.listo){
    h += '<div class="plw-listo" id="plw-listo"><p><b>' + (f.sinCp ? 'Listo para pagar.' : 'Tu comprobante quedó anotado.') + '</b> Se abre Mercado Pago en otra pestaña: ahí pagas con tarjeta, Yape o los medios que te muestre. Cuando el pago se apruebe, vuelve a esta pestaña.</p>' +
         '<a class="bt casco plw-ir" id="plw-ir" href="' + esc(f.listo) + '" target="_blank" rel="noopener">Pagar ' + _plata(f.monto) + ' en Mercado Pago ↗</a>' +
         '<p class="ayuda">El monto lo pone nuestro servidor y la tarjeta la ve solo Mercado Pago: nosotros no la guardamos.</p></div>';
    c.innerHTML = h;
    var si = $('plw-f-si'), no = $('plw-f-no'); if(si) si.hidden = true; if(no) no.textContent = 'Cerrar';
    var ir = $('plw-ir'); if(ir){ ir.onclick = function(){ plwAbrioPago(); }; ir.onauxclick = function(){ plwAbrioPago(); }; try{ ir.focus(); }catch(e){} }
    return;
  }
  h += '<h3 class="plw-f-t">Tu comprobante</h3><p class="ayuda plw-f-a">SUNAT pide un comprobante por cada compra. Elige cuál necesitas: te llega a tu correo cuando se emite.</p>' +
       '<div class="seg plw-seg" role="radiogroup" aria-label="Comprobante">' +
       '<button type="button" role="radio" aria-checked="' + (!fac) + '" class="' + (fac ? '' : 'on') + '" data-tipo="boleta">Boleta</button>' +
       (hayF ? '<button type="button" role="radio" aria-checked="' + fac + '" class="' + (fac ? 'on' : '') + '" data-tipo="factura">Factura</button>' : '') + '</div>';
  if(fac){
    h += '<div class="campo"><label for="plw-f-ruc">RUC de tu empresa</label><div class="plw-busca"><input id="plw-f-ruc" inputmode="numeric" maxlength="11" autocomplete="off" value="' + esc(v.ruc || '') + '">' +
         '<button type="button" class="bt sec" id="plw-f-buscar">Buscar en SUNAT</button></div><p class="msg" id="plw-f-sunat" role="status"></p></div>' +
         '<div class="campo"><label for="plw-f-nom">Razón social</label><input id="plw-f-nom" maxlength="150" autocomplete="organization" value="' + esc(v.nom || '') + '"></div>' +
         '<div class="campo"><label for="plw-f-dir">Dirección fiscal (opcional)</label><input id="plw-f-dir" maxlength="200" autocomplete="street-address" value="' + esc(v.dir || '') + '"></div>';
  } else {
    h += (grande ? '<p class="plw-f-nota">Tu compra pasa de S/ 700: SUNAT pide tu DNI y tu nombre en la boleta.</p>' : '') +
         '<div class="campo"><label for="plw-f-dni">' + (grande ? 'Tu DNI' : 'Tu DNI (opcional)') + '</label><input id="plw-f-dni" inputmode="numeric" maxlength="8" autocomplete="off" value="' + esc(v.dni || '') + '"></div>' +
         '<div class="campo"><label for="plw-f-nom">' + (grande ? 'Tu nombre, como figura en tu DNI' : 'Tu nombre (opcional)') + '</label><input id="plw-f-nom" maxlength="150" autocomplete="name" value="' + esc(v.nom || '') + '"></div>';
  }
  h += '<div class="campo"><label for="plw-f-cor">Correo donde te llega</label><input id="plw-f-cor" type="email" inputmode="email" maxlength="120" autocomplete="email" value="' + esc(v.cor != null ? v.cor : ((TOK && TOK.correo) || '')) + '"></div>' +
       '<p class="msg mal" id="plw-f-msg" role="alert"></p>';
  c.innerHTML = h;
  Array.prototype.forEach.call(c.querySelectorAll('.plw-seg button'), function(b){ b.onclick = function(){ _plwFormLeer(); PLW.f.tipo = b.getAttribute('data-tipo'); plwFormPintar(); }; });
  var bb = $('plw-f-buscar'); if(bb) bb.onclick = plwBuscarRuc;
}
/* lo que escribió, revisado aquí antes de salir a la red */
function _plwFormDatos(){
  var f = PLW.f, m = $('plw-f-msg'); _plwFormLeer();
  var v = f.v, fac = f.tipo === 'factura', grande = (+f.monto || 0) > 700;
  var cor = String(v.cor != null ? v.cor : '').trim(), nom = String(v.nom || '').replace(/\s+/g, ' ').trim();
  var mal = function(t, id){ m.textContent = t; try{ $(id).focus(); }catch(e){} return null; };
  if(cor && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(cor)) return mal(PLW_CP_MAL.correo_malo, 'plw-f-cor');
  if(fac){
    var ruc = String(v.ruc || '').replace(/\D/g, ''), rm = _plwRucMalo(ruc);
    if(rm) return mal(rm, 'plw-f-ruc');
    if(nom.length < 2) return mal(PLW_CP_MAL.falta_razon_social, 'plw-f-nom');
    return { tipo:'factura', doc_tipo:'6', doc_numero:ruc, nombre:nom, direccion:String(v.dir || '').trim() || null, correo:cor || null };
  }
  var dni = String(v.dni || '').replace(/\D/g, '');
  if(dni && dni.length !== 8) return mal(PLW_CP_MAL.dni_malo, 'plw-f-dni');
  if(grande && !dni) return mal(PLW_CP_MAL.falta_doc_boleta, 'plw-f-dni');
  if(grande && !nom) return mal(PLW_CP_MAL.falta_nombre_boleta, 'plw-f-nom');
  return { tipo:'boleta', doc_tipo:dni ? '1' : null, doc_numero:dni || null, nombre:nom || null, correo:cor || null };
}
function plwFormSeguir(){
  var f = PLW.f, m = $('plw-f-msg'), b = $('plw-f-si'); if(!f || !m) return;
  m.textContent = '';
  var d = _plwFormDatos(); if(!d) return;
  b.disabled = true; b.textContent = 'Anotando tu comprobante…';
  sbRpc('sst_comprobante_preparar', { p_producto:f.slug, p_datos:d, p_monto:f.monto || null, p_emp:f.emp || null }).then(function(j){
    b.disabled = false; b.textContent = 'Seguir al pago';
    if(!PLW.f || PLW.f !== f) return;
    if(j && j.ok && j.id){ f.cp = j.id; f.listo = plwEnlace(f.slug, j.id); plwApuntar(f, false); plwFormPintar(); return; }
    m.textContent = PLW_CP_MAL[(j && j.motivo) || ''] || 'No se pudo anotar tu comprobante. Revisa tu conexión e inténtalo otra vez.';
  }, function(cod){
    b.disabled = false; b.textContent = 'Seguir al pago';
    if(!PLW.f || PLW.f !== f) return;
    /* el comprobante nunca frena el pago: sin él, se paga igual y llega su boleta (como en la app) */
    if(cod === 404){ f.cp = null; f.sinCp = true; f.listo = plwEnlace(f.slug, null); plwApuntar(f, false); plwFormPintar(); return; }
    m.textContent = (cod === 401 || cod === 403) ? PLW_CP_MAL.sin_sesion : 'No hubo conexión para anotar tu comprobante. Inténtalo otra vez.';
  });
}
/* el pago que empieza queda apuntado en este navegador: con eso, al volver, se sabe qué mirar */
function plwApuntar(f, abierto){
  var cp = f.cp || null, antes = planwPagos();
  var deAqui = function(x){ return x.slug === f.slug && String(x.emp) === String(f.emp); };
  /* el mismo pago, vuelto a apuntar: el servidor da el mismo comprobante mientras ese producto siga sin pagarse */
  var mismo = function(x){ return !x.pagado && deAqui(x) && (x.cp || null) === cp; };
  var viejo = antes.filter(mismo)[0] || null;
  /* se quedan los demás; de este producto para esta empresa, solo los que llegaron a abrir Mercado Pago o ya se pagaron */
  var l = antes.filter(function(x){ return !mismo(x) && (!deAqui(x) || x.abrio || x.pagado); });
  /* abierto: se está esperando (el cartel); abrio: alguna vez se abrió Mercado Pago (solo esos se miran después).
     Si ya se había abierto, sigue contando: la pestaña del pago puede seguir ahí. t0: desde cuándo se espera */
  l.unshift({ cp:cp, slug:f.slug, plan:f.plan, per:f.per, monto:f.monto, emp:f.emp, empN:f.empN || '', t:Date.now(),
              t0:(viejo && viejo.abrio && (viejo.t0 || viejo.t)) || Date.now(),
              abierto:!!abierto || !!(viejo && viejo.abierto), abrio:!!abierto || !!(viejo && viejo.abrio) });
  planwPagosGuardar(l.slice(0, 6));
}
function plwAbrioPago(){
  var f = PLW.f; if(!f || !f.listo) return;
  plwApuntar(f, true);
  setTimeout(function(){
    try{ cerrarHoja(); }catch(e){}
    PLW.aviso = null;
    try{ pintarRail(); }catch(e){}
    /* de un salto, sin animación: quien vuelve de la pestaña del pago la encuentra ya arriba, con el cartel a la vista */
    if(VISTA.actual === 'plan'){ plwRepintar(); try{ window.scrollTo({ top:0, left:0, behavior:'instant' }); }catch(e){ try{ window.scrollTo(0, 0); }catch(e2){} } }
    plwVigilar();
  }, 350);
}
function plwDejar(){
  var l = planwPagos().map(function(x){ x.abierto = false; return x; });
  planwPagosGuardar(l); clearTimeout(PLW.reloj);
  var z = $('plw-pago'); if(z) z.innerHTML = '';
  try{ pintarRail(); }catch(e){}
  toast('Listo. Si igual pagas, tu plan se activa al volver a entrar.');
}
/* buscar el RUC en el padrón (el mismo servicio que usa la app) */
function plwBuscarRuc(){
  var m = $('plw-f-sunat'), b = $('plw-f-buscar'), ruc = String(($('plw-f-ruc') || {}).value || '').replace(/\D/g, ''), mal = _plwRucMalo(ruc);
  m.className = 'msg mal';
  if(mal){ m.textContent = mal; return; }
  b.disabled = true; m.className = 'msg gris'; m.textContent = 'Preguntando a SUNAT…';
  fetch(PLW_SUNAT + encodeURIComponent(ruc)).then(function(r){ return r.ok ? r.json() : (r.status === 404 ? {} : Promise.reject(r.status)); }).then(function(j){
    b.disabled = false; if(!$('plw-f-nom')) return;
    var razon = String((j && (j.razon_social || j.razonSocial || j.nombre)) || '').trim();
    if(!razon){ m.className = 'msg mal'; m.textContent = 'Ese RUC no figura en el padrón de SUNAT. Revísalo o escribe los datos.'; return; }
    $('plw-f-nom').value = razon;
    var dir = String(j.direccion || j.domicilio || '').trim(); if(dir && dir !== '-') $('plw-f-dir').value = dir;
    var est = String(j.estado || '').toUpperCase();
    if(est && est !== 'ACTIVO'){ m.className = 'msg mal'; m.textContent = 'Ojo: en SUNAT ese RUC no figura como activo. Revísalo.'; }
    else { m.className = 'msg ok'; m.textContent = '✓ Traído de SUNAT. Revísalo.'; }
  }, function(){ b.disabled = false; m.className = 'msg mal'; m.textContent = 'No se pudo consultar a SUNAT. Escribe los datos.'; });
}

/* fuera del Perú: se pide por correo, como en la app */
function plwPedir(planId){
  var P = _plwPlan(planId), o = YO.obra || {}; if(!P) return;
  var pn = paisInfoP(paisDelPagoP()).n, per = PLW.per === 'a' ? 'por un año' : 'por un mes';
  var t = 'Hola. Quiero el plan ' + P.n + ' de OBRASST ' + per + ' para ' + (o.padre_nombre || o.nombre || 'mi empresa') + (o.codigo ? ' (código ' + o.codigo + ')' : '') + ', en ' + pn + '.';
  dialogo({ titulo:'Pedir el plan ' + P.n, texto:'En ' + pn + ' el plan se contrata directo con nosotros, en dólares. Te escribimos con el cobro y, cuando esté pagado, te llega un código que activas aquí mismo, en «Tengo un código».', si:'Escribir el correo', no:'Ahora no' })
    .then(function(v){ if(v !== true) return; var u = 'mailto:' + SOPORTE + '?subject=' + encodeURIComponent('Plan ' + P.n + ' · ' + pn) + '&body=' + encodeURIComponent(t); try{ window.open(u, '_blank'); }catch(e){ location.href = u; } });
}

/* ══ EL PAGO, AL VOLVER ═══════════════════════════════════════════ */
/* ¿ya se pagó alguno de los que se empezaron aquí? El comprobante que se pidió sale en «mis comprobantes» recién
   cuando el pago se aprueba, y trae el código de la venta. manual: lo pidió la persona («Ya pagué») */
function plwRevisarPago(manual){
  var pend = planwPagos().filter(function(x){ return x.abrio; });
  if(!pend.length || !TOK) return Promise.resolve(false);
  if(PLW.revisando) return PLW.revisando;
  PLW.ultima = Date.now();
  var msg = $('plw-espera-msg');
  if(manual && msg){ msg.className = 'plw-chico'; msg.textContent = 'Revisando…'; }
  PLW.revisando = sbRpc('sst_mis_comprobantes', {}).then(function(j){
    PLW.revisando = null;
    if(!j || !j.ok) return false;
    var L = j.lista || [];
    if(PLW.d){ PLW.d.comp = L; PLW.d.factura = j.factura !== false; }
    for(var i = 0; i < pend.length; i++){
      var p = pend[i], fila = null;
      if(p.cp) fila = L.filter(function(x){ return String(x.id) === String(p.cp); })[0];
      else fila = L.filter(function(x){ return x.origen === 'web' && x.plan === p.plan && +x.dias === (p.per === 'a' ? 365 : 30) && (x.codigos || []).length && Date.parse(x.creado) > (p.t0 || p.t) - 120000; })[0];
      if(fila){ plwPagado(p, fila); return true; }
    }
    if(manual){
      var m2 = $('plw-espera-msg');
      if(m2){ m2.className = 'plw-chico plw-ojo'; m2.textContent = 'Todavía no vemos tu pago. Si ya pagaste, espera un minuto y vuelve a tocar; si te salió un código en pantalla, escríbelo abajo, en «Tengo un código». Y si sigue sin activarse, avísanos con los botones de aquí abajo.'; }
    }
    return false;
  }, function(){
    PLW.revisando = null;
    if(manual){ var m3 = $('plw-espera-msg'); if(m3){ m3.className = 'plw-chico plw-ojo'; m3.textContent = 'No hubo conexión. Inténtalo otra vez en un momento.'; } }
    return false;
  });
  return PLW.revisando;
}
function _plwQuitarPago(p){
  /* con él se van los que llevan su mismo comprobante: son el mismo pago (el servidor reusa el comprobante de un producto sin pagar) */
  planwPagosGuardar(planwPagos().filter(function(x){ return !((x.t === p.t && x.slug === p.slug) || (p.cp && x.cp === p.cp)); }));
  if(!planwPagos().length) clearTimeout(PLW.reloj);
  /* la insignia del menú deja de decir «pago…» (también cuando el pago llegó y el plan no se activó) */
  try{ pintarRail(); }catch(e){}
}
function plwPagado(p, fila){
  var cod = (fila.codigos || [])[0], P = _plwPlan(p.plan) || { n:p.plan, orden:_plwOrdenDe(p.plan) }, e = _plwEmp(p.emp);
  /* los otros apuntes con este mismo comprobante son este mismo pago: se van (no se activa dos veces) */
  if(p.cp) planwPagosGuardar(planwPagos().filter(function(x){ return !(x.cp === p.cp && !(x.t === p.t && x.slug === p.slug)); }));
  if(!cod){
    _plwQuitarPago(p);
    plwAvisar('ojo', '<b>Recibimos tu pago de ' + esc(P.n) + ', pero el código no salió solo.</b> No tienes que pagar otra vez: avísanos por WhatsApp o por correo y lo activamos a mano. El mensaje ya va escrito con los datos de tu pago.', plwRespaldoBts(p));
    plwRepintar(); return;
  }
  if(!e){
    _plwQuitarPago(p);
    plwAvisar('ojo', '<b>Recibimos tu pago de ' + esc(P.n) + '.</b> Tu cuenta ya no está en la obra para la que se pagó' + (p.empN ? ' (' + esc(p.empN) + ')' : '') + ': tu código es <span class="plw-mono">' + esc(cod) + '</span>. Actívalo en la obra que quieras, abajo, en «Tengo un código».');
    plwRepintar(); return;
  }
  var E = _plwEstadoDe(e);
  /* un plan menor que el de hoy no se activa solo: pisa el plan vigente. Se pregunta (y el pago sigue apuntado
     hasta que se elija: si se recarga la página, la pregunta vuelve) */
  var sinFecha = E.orden > 0 && E.dias === null;      /* un plan sin fecha: activar cualquier código se la pone */
  if(sinFecha || (E.orden > 0 && E.dias !== null && P.orden < E.orden)){
    if(PLW.guardado && PLW.guardado.cod === cod && PLW.aviso && PLW.aviso.fijo) return;      /* ya se está preguntando */
    PLW.guardado = { cod:cod, emp:e.id, plan:p.plan, per:p.per, pago:p };
    clearTimeout(PLW.reloj);
    /* ya no se «espera»: se pagó. Sale del cartel de espera y de la insignia del menú */
    planwPagosGuardar(planwPagos().map(function(x){ if(x.t === p.t && x.slug === p.slug){ x.abierto = false; x.pagado = true; } return x; }));
    try{ pintarRail(); }catch(_r){}
    var A = planWebPlan(E.orden) || { n:'tu plan' };
    plwAvisar('ok', '<b>Pago recibido: ' + esc(P.n) + ' · ' + _plwPer(p.per) + '.</b> Tu código es <span class="plw-mono">' + esc(cod) + '</span>. Hoy ' + esc(e.nombre) + ' está en ' + esc(A.n) +
      (sinFecha ? ', sin fecha de vencimiento: si lo activas ahora, pasa a ' + esc(P.n) + ' y empieza a tener fecha (los días de lo que pagaste, contados desde hoy).'
                : ' hasta el ' + esc(fechaLarga(E.vence)) + ': si lo activas ahora, pasa a ' + esc(P.n) + ' en este momento y tus ' + _plwDias(E.dias) + ' se suman al final.'),
      '<button type="button" class="bt chico" data-plw="activar-ya">Activarlo ahora</button><button type="button" class="bt sec chico" data-plw="activar-luego">Guardarlo para después</button>', true);
    plwRepintar();
    if(VISTA.actual !== 'plan') toast('Recibimos tu pago: elige cuándo activarlo, en «Mi plan»');
    return;
  }
  /* si no llegó a activarse y el pago sigue apuntado (sin red, u otra activación en curso), se sigue mirando: se reintenta solo */
  plwActivar(cod, e.id, { pago:p, P:P, emp:e }).then(function(ok){ if(!ok) plwVigilar(); });
}
function plwActivarGuardado(ya){
  var g = PLW.guardado; if(!g) return;
  if(!ya){
    PLW.guardado = null;
    if(g.pago) _plwQuitarPago(g.pago);
    _plwGuardar(g.cod, true);
    plwAvisar('ok', '<b>Guardado.</b> Tu código <span class="plw-mono">' + esc(g.cod) + '</span> queda en «Mis comprobantes», aquí abajo: cuando termine tu plan de hoy, toca «Activar este código».');
    plwRepintar();
    return;
  }
  var e = _plwEmp(g.emp); if(!e) return;
  PLW.guardado = null;
  plwActivar(g.cod, g.emp, { pago:g.pago, P:_plwPlan(g.plan), emp:e });
}
/* activar un código en una empresa: la misma función que usa la app */
function plwActivar(cod, emp, op){
  op = op || {};
  if(PLW.activando){
    if(op.msg){ op.msg.className = 'msg gris'; op.msg.textContent = 'Ya se está activando un plan: espera un momento y vuelve a tocarlo.'; }
    return Promise.resolve(false);
  }
  PLW.activando = true;
  return sbRpc('sst_activar_licencia', { p_codigo:cod, p_emp:emp }).then(function(j){
    PLW.activando = false;
    var e = op.emp || _plwEmp(emp) || {}, otra = YO.obra && String(emp) !== String(YO.obra.id);
    if((j && j.ok) || (j && j.motivo === 'codigo_ya_usado')) _plwGuardar(_plwCod(cod), false);
    if(j && j.ok){
      if(op.pago) _plwQuitarPago(op.pago);
      var P = planWebPlan(_plwOrdenDe(j.plan)) || op.P || { n:j.plan };
      plwAvisar('ok', '<b>Listo: el plan ' + esc(P.n) + ' está activo' + (otra && e.nombre ? ' en ' + esc(e.nombre) : '') + '.</b>' +
        (j.vence ? ' Vale hasta el ' + esc(fechaLarga(String(j.vence).slice(0, 10))) + '.' : '') +
        (j.prueba ? ' Es tu mes gratis: al terminar, la cuenta vuelve a LITE y nada se borra.' : '') +
        ' Lo que este plan abre ya está disponible, aquí y en la app.' + (op.pago ? ' Tu comprobante te llega a tu correo cuando se emite.' : ''));
      toast('Tu plan ' + P.n + ' ya está activo');
      if(op.msg) op.msg.textContent = '';
      return plwAlDia().then(function(){ return true; });
    }
    var q = (j && j.motivo) || '';
    /* el mismo pago visto dos veces (otra pestaña llegó antes): ya está activado */
    if(q === 'codigo_ya_usado' && j.tuyo && op.pago){
      _plwQuitarPago(op.pago);
      plwAvisar('ok', '<b>Tu pago ya estaba activado en esta empresa' + (j.usado ? ' (el ' + esc(fechaLarga(String(j.usado).slice(0, 10))) + ')' : '') + '.</b> No hay nada más que hacer.');
      return plwAlDia().then(function(){ return true; });
    }
    var t = q === 'codigo_no_existe' ? 'Ese código no es válido. Revísalo tal como te llegó.'
      : (q === 'codigo_ya_usado' && j.tuyo) ? 'Ese código ya se activó en esta empresa' + (j.usado ? ' el ' + fechaLarga(String(j.usado).slice(0, 10)) : '') + '. Cada código vale una sola vez: para renovar hace falta uno nuevo.'
      : q === 'codigo_ya_usado' ? 'Ese código ya lo usó otra empresa. Cada código abre una sola.'
      : q === 'no_eres_dueno' ? 'Solo quien registró la empresa puede activar el plan.'
      : q === 'sin_sesion' ? 'Tu sesión venció: vuelve a entrar.'
      : 'No se pudo activar.';
    if(op.pago){
      _plwQuitarPago(op.pago);
      plwAvisar('ojo', '<b>Recibimos tu pago, pero el plan no se activó solo.</b> ' + esc(t) + ' Tu código es <span class="plw-mono">' + esc(cod) + '</span>: ' +
        (q === 'no_eres_dueno' ? 'pásaselo a quien registró la empresa.' : 'si no logras activarlo abajo, en «Tengo un código», avísanos por WhatsApp o por correo.'),
        q === 'no_eres_dueno' ? '' : plwRespaldoBts(op.pago, cod));
      plwRepintar();
    } else if(op.msg){ op.msg.className = 'msg mal'; op.msg.textContent = t; }
    else plwAvisar('ojo', '<b>' + esc(t) + '</b>');
    return false;
  }, function(){
    PLW.activando = false;
    if(op.pago){
      plwAvisar('mal', '<b>Recibimos tu pago, pero no hubo conexión para activar tu plan.</b> No se pierde: toca «Reintentar».', '<button type="button" class="bt chico" data-plw="reintentar">Reintentar</button>', true);
    } else if(op.msg){ op.msg.className = 'msg mal'; op.msg.textContent = 'No hubo conexión. Inténtalo otra vez.'; }
    return false;
  });
}
/* mientras haya un pago abierto: se mira cada pocos segundos (5 min) y después más espaciado (hasta 30 min).
   Pasado eso, al volver a la pestaña, al entrar al portal y con el botón. */
function plwVigilar(){
  clearTimeout(PLW.reloj);
  var pend = planwPagos().filter(function(x){ return x.abierto; });
  if(!pend.length || !TOK) return;
  var edad = Date.now() - pend[0].t, cada = edad < 5 * 60000 ? 5000 : (edad < 30 * 60000 ? 15000 : 0);
  if(!cada) return;
  PLW.reloj = setTimeout(function(){
    if(document.hidden){ plwVigilar(); return; }
    plwRevisarPago(false).then(function(pago){ if(!pago) plwVigilar(); }, function(){ plwVigilar(); });
  }, cada);
}
function plwEspiar(){
  if(PLW.espiando) return; PLW.espiando = true;
  /* al volver a la pestaña: solo mientras se espera un pago, y no más de una vez cada pocos segundos */
  var mira = function(){
    if(document.hidden || !TOK || !YO.obra || !planwPagos().some(function(x){ return x.abierto || x.pagado; })) return;
    if(Date.now() - (PLW.ultima || 0) < 4000) return;
    plwRevisarPago(false).then(function(pago){ if(!pago) plwVigilar(); });
  };
  document.addEventListener('visibilitychange', mira);
  window.addEventListener('focus', mira);
}

/* ══ TENGO UN CÓDIGO ══════════════════════════════════════════════ */
function plwUsar(cod){
  var i = $('plw-cod'); if(!i) return;
  i.value = cod || ''; try{ i.scrollIntoView({ block:'center' }); i.focus(); }catch(e){}
  plwCodigo();
}
function plwCodigo(){
  var i = $('plw-cod'), m = $('plw-cod-msg'), b = $('plw-cod-bt'); if(!i || !m) return;
  var v = _plwCod(i.value), o = YO.obra;
  m.className = 'msg mal';
  if(!v){ m.textContent = 'Escribe el código.'; i.focus(); return; }
  if(/^INV[A-Z0-9]{6}$/.test(v)){ m.textContent = 'Ese es un código de invitación a un equipo, no el de un plan.'; return; }
  if(v.length === 6){ m.textContent = 'Ese parece el código de una obra, no el de un plan. El del plan empieza con PRV, SST, EQS o GES.'; return; }
  if(v.length < 8){ m.textContent = 'Ese código está incompleto. Revísalo tal como te llegó.'; return; }
  var E = planwEstado(), ord = PLW_PREFIJO[v.slice(0, 3)] || 0, P = ord ? planWebPlan(ord) : null;
  var sigue = function(){
    b.disabled = true; m.className = 'msg gris'; m.textContent = 'Verificando el código…';
    plwActivar(v, o.id, { msg:m }).then(function(){ var b2 = $('plw-cod-bt'); if(b2) b2.disabled = false; });
  };
  /* el plan de hoy no tiene fecha: el código se la pone (y lo cambia por el suyo). Se pregunta antes */
  if(E.orden > 0 && E.dias === null){
    dialogo({ titulo:'Tu plan de hoy no tiene fecha', texto:'Hoy estás en ' + E.plan.n + ', sin fecha de vencimiento. Si activas este código, tu obra pasa al plan del código' + (P ? ' (' + P.n + ')' : '') +
      ' y empieza a tener fecha: valdrá los días del código, contados desde hoy. Si no es lo que quieres, no lo actives y escríbenos.', si:'Activarlo igual', no:'No activarlo' })
      .then(function(r){ if(r === true) sigue(); else { m.className = 'msg gris'; m.textContent = 'No se activó. El código sigue sirviendo.'; } });
    return;
  }
  /* un código de un plan menor que el de hoy pisa el plan vigente: se pregunta antes */
  if(P && E.orden > 0 && E.dias !== null && ord < E.orden){
    dialogo({ titulo:'Ese código es de un plan menor', texto:'El código es del plan ' + P.n + ' y hoy estás en ' + E.plan.n + ' hasta el ' + fechaLarga(E.vence) + '. Si lo activas ahora, tu obra pasa a ' + P.n +
      ' en este momento y tus ' + _plwDias(E.dias) + ' se suman al final. Si prefieres aprovechar ' + E.plan.n + ' hasta el último día, actívalo cuando venza.', si:'Activarlo ahora', no:'Esperar' })
      .then(function(r){ if(r === true) sigue(); else { m.className = 'msg gris'; m.textContent = 'No se activó. El código sigue sirviendo.'; } });
    return;
  }
  sigue();
}

/* los códigos que se pagaron y se guardaron para después (el plan menor que el vigente), en este navegador */
var LS_PLW_GUARDADOS = 'sstp_cod_guardados';
function _plwGuardados(){ var l = leer(LS_PLW_GUARDADOS, []), uid = (TOK && TOK.uid) || ''; return Array.isArray(l) ? l.filter(function(x){ return x && x.uid === uid; }).map(function(x){ return x.cod; }) : []; }
function _plwGuardar(cod, si){
  var l = leer(LS_PLW_GUARDADOS, []), uid = (TOK && TOK.uid) || ''; if(!Array.isArray(l)) l = [];
  l = l.filter(function(x){ return x && !(x.uid === uid && x.cod === cod); });
  if(si) l.unshift({ cod:cod, uid:uid, t:Date.now() });
  guardar(LS_PLW_GUARDADOS, l.slice(0, 20));
}

/* ══ MIS COMPROBANTES ═════════════════════════════════════════════ */
function plwCambiar(id){
  var x = ((PLW.d && PLW.d.comp) || []).filter(function(y){ return String(y.id) === String(id); })[0]; if(!x) return;
  PLW.f = { modo:'editar', id:x.id, monto:x.monto, tipo:x.tipo || 'boleta', desc:(x.descripcion || '') + (x.monto != null ? ' · S/ ' + _plata2(+x.monto).replace(/^S\/ /, '') : ''), listo:null,
            v:{ ruc:x.doc_tipo === '6' ? (x.doc_numero || '') : '', dni:x.doc_tipo === '1' ? (x.doc_numero || '') : '', nom:x.nombre || '', dir:x.direccion || '', cor:x.correo || '' } };
  plwFormHoja({ n:'', orden:0 }, planwEstado());
}
function plwFormGuardar(){
  var f = PLW.f, m = $('plw-f-msg'), b = $('plw-f-si'); if(!f || !m) return;
  m.textContent = '';
  var d = _plwFormDatos(); if(!d) return;
  b.disabled = true; b.textContent = 'Guardando…';
  sbRpc('sst_comprobante_mio', { p_id:f.id, p_datos:d }).then(function(j){
    b.disabled = false; b.textContent = 'Guardar';
    if(j && j.ok){ cerrarHoja(); toast('Listo: tu comprobante se emite con estos datos'); plwCargar(); return; }
    m.textContent = PLW_CP_MAL[(j && j.motivo) || ''] || 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.';
  }, function(){ b.disabled = false; b.textContent = 'Guardar'; m.textContent = 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'; });
}
function plwPdf(id, b){
  var x = ((PLW.d && PLW.d.comp) || []).filter(function(y){ return String(y.id) === String(id); })[0]; if(!x || !x.pdf_path) return;
  if(b) b.disabled = true;
  sbFetch(SB.url + '/storage/v1/object/authenticated/comprobantes/' + x.pdf_path, { method:'GET' }).then(function(r){ return r.ok ? r.blob() : Promise.reject(r.status); }).then(function(bl){
    if(b) b.disabled = false;
    bajarBlob(bl, (x.serie ? x.serie + '-' + x.numero : 'comprobante') + '.pdf');
  }, function(){ if(b) b.disabled = false; toast('No se pudo bajar. Revisa tu conexión e inténtalo otra vez.'); });
}

/* ══ LOS ESTILOS ══════════════════════════════════════════════════ */
function _plwCss(){
  if($('plw-css')) return;
  var st = document.createElement('style'); st.id = 'plw-css';
  st.textContent = [
    '.plw{max-width:1180px}',
    '.plw-mono{font-family:var(--mono);letter-spacing:.04em;white-space:nowrap}.plw-chico{font-size:13px;line-height:1.55;color:var(--gris);margin:0}.plw-ojo{color:var(--ojo)}',
    /* el aviso de lo que acaba de pasar */
    '.plw-av{position:relative;padding-right:40px;font-size:14px}.plw-av b{color:var(--tinta)}.plw-av.mal b{color:var(--mal)}',
    '.plw-av-x{position:absolute;top:6px;right:8px;width:28px;height:28px;border:0;background:transparent;color:var(--gris);font-size:20px;line-height:1;cursor:pointer;border-radius:6px}.plw-av-x:hover{background:rgba(11,42,58,.07);color:var(--tinta)}',
    /* el pago que se espera */
    '.plw-espera{display:grid;gap:10px;border:1px solid #CFDDF0;background:var(--azul-f);border-radius:12px;padding:16px 18px;margin:0 0 18px}',
    '.plw-espera h2{font-size:16px;display:flex;align-items:flex-start;gap:10px;line-height:1.35}.plw-espera h2 .plw-gira{margin-top:3px}.plw-espera p{margin:0;font-size:14px;line-height:1.55;max-width:90ch}.plw-espera p b{color:var(--tinta)}',
    '.plw-gira{flex:0 0 auto;width:16px;height:16px;border-radius:50%;border:2px solid #9DB9DA;border-top-color:var(--azul);animation:plw-gira 1s linear infinite}',
    '@keyframes plw-gira{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.plw-gira{animation:none}}',
    /* el respaldo: avisar por WhatsApp o por correo */
    '.plw-resp{display:flex;align-items:center;justify-content:space-between;gap:8px 16px;flex-wrap:wrap;border-top:1px dashed #BCD0EA;padding-top:11px;margin-top:2px;font-size:13px;line-height:1.5;color:var(--texto)}',
    '.plw-resp>span:first-child{flex:1 1 320px;min-width:0;max-width:78ch}.plw-resp b{color:var(--tinta);font-weight:600}.plw-resp-b{display:flex;gap:6px;flex-wrap:wrap;flex:0 0 auto}',
    '.plw-resp-l{margin-top:8px}.plw-resp-l a{font-weight:500}',
    '@media (max-width:520px){.plw-resp-b{flex:1 1 100%}.plw-resp-b .bt{flex:1 1 0;text-align:center}}',
    /* el estado */
    '.plw-estado .tarj-cuerpo{display:grid;gap:12px;padding:20px 22px}',
    '.plw-ceja{margin:0;font-size:11.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--gris)}',
    '.plw-nombre{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.plw-nombre h2{font-size:27px;letter-spacing:-.02em;line-height:1.15}.plw-nombre .pill{font-size:12.5px;padding:4px 11px}',
    '.plw-vale{margin:0;font-size:14.5px;line-height:1.6;color:var(--texto);max-width:86ch}.plw-vale b{color:var(--tinta);font-weight:600}',
    '.plw-uso{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:4px}',
    '.plw-u{display:grid;gap:3px;align-content:start;border:1px solid var(--raya);border-radius:10px;padding:11px 13px 12px;background:var(--fondo);min-width:0}',
    '.plw-u .et{font-size:12px;color:var(--gris);font-weight:500}.plw-u .v{font-size:19px;font-weight:600;color:var(--tinta);font-variant-numeric:tabular-nums;line-height:1.2}.plw-u .v small{font-size:12.5px;font-weight:400;color:var(--gris)}',
    '.plw-u .b{display:block;height:5px;border-radius:3px;background:#fff;border:1px solid var(--raya);overflow:hidden;margin-top:4px}.plw-u .b i{display:block;height:100%;background:var(--tinta);border-radius:3px}',
    '.plw-u.casi .b i{background:var(--ojo)}.plw-u.lleno .b i{background:var(--mal)}.plw-u.lleno .v{color:var(--mal)}.plw-u .s{font-size:11.5px;color:var(--gris2)}.plw-u .s.tope{color:var(--ojo);font-weight:500}.plw-u.lleno .s.tope{color:var(--mal)}',
    '@media (max-width:760px){.plw-uso{grid-template-columns:repeat(2,minmax(0,1fr))}.plw-nombre h2{font-size:23px}.plw-estado .tarj-cuerpo{padding:16px}}',
    /* el mes gratis */
    '.plw-regalo{display:flex;gap:14px 20px;align-items:center;flex-wrap:wrap;border:1px solid #EBD27A;background:#FFFBEA;border-radius:12px;padding:16px 20px;margin:0 0 18px}',
    '.plw-regalo>div{flex:1 1 320px;min-width:0}.plw-regalo b{display:block;color:var(--tinta);font-size:16.5px;font-weight:600}.plw-regalo p{margin:3px 0 0;font-size:13.5px;line-height:1.55;color:var(--texto);max-width:76ch}',
    '.plw-regalo .bt{flex:0 0 auto;padding:12px 20px}.plw-regalo-no{margin:-4px 0 18px}',
    '.plw-guardado{display:flex;align-items:center;justify-content:space-between;gap:10px 16px;flex-wrap:wrap;border:1px solid #CFDDF0;background:var(--azul-f);border-radius:10px;padding:11px 14px 11px 16px;margin:0 0 18px;font-size:13.5px}',
    '.plw-guardado b{display:block;color:var(--tinta);font-weight:600;font-size:14px}',
    /* los planes */
    '.plw-cab{display:flex;align-items:flex-end;justify-content:space-between;gap:12px 20px;flex-wrap:wrap;margin:26px 0 22px}.plw-cab h2{font-size:19px}.plw-cab .sub{margin:3px 0 0;font-size:13.5px;color:var(--gris)}',
    '.plw-quien{margin:-10px 0 22px;max-width:90ch}.plw-quien.aviso{margin:-8px 0 22px}p.plw-quien{font-size:13.5px}',
    '.plw-planes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:stretch;margin:0 0 18px}',
    '@media (max-width:1180px){.plw-planes{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:22px}}@media (max-width:640px){.plw-planes{grid-template-columns:minmax(0,1fr)}}',
    '.plw-planes .ini-plan.mio{border-color:var(--tinta);box-shadow:0 0 0 1px var(--tinta),var(--sombra)}.plw-planes .ini-plan .sello.sig{background:var(--azul-f);color:var(--azul)}',
    '.plw-planes .ini-plan h3{min-height:0}.plw-planes .ini-para{min-height:0}.plw-planes .ini-plan ul.ini-suma{margin-bottom:16px}',
    '.plw-bts{margin-top:auto;display:grid;gap:6px}.plw-bts .bt{width:100%;margin:0;padding:11px 12px}.plw-nota-bt{margin:0;font-size:12px;color:var(--gris);text-align:center}',
    '.plw-sinp{font-size:20px!important}',
    '.plw-comp{margin:0 0 18px}',
    /* código y extras */
    '.plw-dos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:start}@media (max-width:1000px){.plw-dos{grid-template-columns:minmax(0,1fr);gap:0}}',
    '.plw-cod-f{display:flex;gap:8px;align-items:stretch}.plw-cod-f input{flex:1 1 auto;min-width:0;max-width:300px;font-family:var(--mono);letter-spacing:.08em;text-transform:uppercase}.plw-cod-f input::placeholder{letter-spacing:.02em;text-transform:none;font-family:var(--f)}',
    '.plw-ex{list-style:none;margin:0 0 4px;padding:0;display:grid;gap:0}.plw-ex li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--raya)}.plw-ex li:first-child{padding-top:0}',
    '.plw-ex li span{font-size:13px;color:var(--gris);min-width:0}.plw-ex li b{display:block;color:var(--tinta);font-weight:600;font-size:14px}',
    '.plw-comp-t td .sub{display:block;font-size:12.5px;color:var(--gris);margin-top:1px}.plw-comp-t td.fila-acc{white-space:nowrap;text-align:right}.plw-comp-t td.fila-acc .bt+.bt{margin-left:6px}',
    '.plw-letra{margin:6px 0 0}@media (max-width:760px){.plw-letra{grid-template-columns:minmax(0,1fr)}}',
    /* el cajón del pago */
    '.plw-res{border:1px solid var(--raya);border-radius:10px;background:var(--fondo);padding:13px 15px;margin:0 0 18px;display:grid;gap:8px}',
    '.plw-res-f{display:flex;align-items:baseline;justify-content:space-between;gap:12px}.plw-res-f b{color:var(--tinta);font-weight:600}.plw-res-f small{display:block;font-size:12.5px;color:var(--gris);margin-top:1px}',
    '.plw-res-m{font-size:20px;font-weight:600;color:var(--tinta);font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.plw-res-n{margin:0;font-size:13.5px;line-height:1.55;color:var(--texto)}.plw-res-n b{color:var(--tinta);font-weight:600}.plw-res-baja{margin:0;font-size:13.5px}',
    '.plw-f-t{margin:0 0 2px;font-size:15px}.plw-f-a{margin:0 0 12px}.plw-seg{display:flex;margin:0 0 16px}.plw-seg button{flex:1 1 0}',
    '.plw-busca{display:flex;gap:8px}.plw-busca input{flex:1 1 auto;min-width:0}.plw-busca .bt{flex:0 0 auto}',
    '.plw-f-nota{margin:0 0 12px;padding:9px 12px;border-radius:8px;background:var(--ojo-f);color:#6B4A12;font-size:13.5px;line-height:1.5}',
    '.plw-listo{display:grid;gap:12px}.plw-listo p{margin:0;font-size:14px;line-height:1.6}.plw-listo p b{color:var(--tinta)}.plw-ir{width:100%;padding:14px 16px;font-size:15px}',
    '@media (max-width:520px){.plw-busca{flex-wrap:wrap}.plw-busca .bt{flex:1 1 100%}.plw-cod-f{flex-wrap:wrap}.plw-cod-f input{max-width:none;flex:1 1 100%}.plw-cod-f .bt{flex:1 1 100%}.plw-regalo .bt{flex:1 1 100%}}'
  ].join('\n');
  document.head.appendChild(st);
}
