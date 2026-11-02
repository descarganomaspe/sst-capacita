/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   OBRASST · ERP Distribuidor (2/11/2026) · el núcleo: sesión, 2FA, menú por papel, hojas, tablas, tablero, plan y seguridad.
   Pedido de Marcelo (30/10/2026): el Portal de Aliados pasa a ser un ERP. Los módulos están en erp-ventas.js, erp-operacion.js
   y erp-finanzas.js; los PDF, QR, Excel y la firma en erp-docs.js. Todo lo que decide (papel, plan, inquilino, precios,
   stock) lo decide el servidor; aquí solo se muestra lo que el servidor devuelve para ese papel.
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
var SB = { url:'https://gwjjkknuiumgysezeatz.supabase.co', key:'sb_publishable_7fLOMEbxMHW9ButihszpoQ_gkfNKnnx' };
var APP_FIJA = 'https://descarganomaspe.github.io/sst-capacita/';
var LS_TOK = 'sstp_cuenta', SS_INV = 'sstp_ali_inv', SS_UINV = 'sstp_erp_inv', LEGAL_VER_WEB = '3.0';
var TOK = null;
var ERP = { yo:null, sec:'', sub:'', cache:{}, reloj:null, gen:0, enPintado:false };
var $ = function(id){ return document.getElementById(id); };
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function num(n, d){ var v = Number(n); if(!isFinite(v)) return '—'; return v.toLocaleString('es-PE', { minimumFractionDigits:d || 0, maximumFractionDigits:d == null ? 3 : d }); }
function soles(n){ var v = Number(n); return isFinite(v) ? 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits:2, maximumFractionDigits:2 }) : '—'; }
function fecha(d){ if(!d) return '—'; var s = String(d).slice(0, 10).split('-'); return s.length === 3 ? s[2] + '/' + s[1] + '/' + s[0] : esc(d); }
function hoyLima(){ return new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10); }
function masDias(iso, n){ var p = iso.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]) + n * 864e5).toISOString().slice(0, 10); }
function nuevoIdem(){ try{ return crypto.randomUUID(); }catch(e){ return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); } }
function val(id){ var e = $(id); return e ? (e.type === 'checkbox' ? e.checked : String(e.value == null ? '' : e.value).trim()) : ''; }
function leer(k, d){ try{ var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } }
function guardar(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function toast(t){ var c = $('toast'); c.textContent = t; try{ (window.__avisos = window.__avisos || []).push(t); }catch(_a){} c.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function(){ c.hidden = true; }, 3800); }
function ver(id){ ['v-carga', 'v-entrar', 'v-2fa', 'v-no', 'v-app'].forEach(function(x){ $(x).hidden = (x !== id); }); $('pie').hidden = id === 'v-app'; window.scrollTo(0, 0); }
function puede(sec){ return !!(ERP.yo && ERP.yo.menu && ERP.yo.menu.indexOf(sec) >= 0); }
function esAdmin(){ return !!(ERP.yo && ERP.yo.papel === 'admin'); }
function soloBandeja(y){ return !(y.menu || []).some(function(k){ return k !== 'bandeja' && k !== 'plan'; }); }
/* una acción que pide la 2FA (cambiar de plan, por ejemplo): se activa ahí mismo y se vuelve */
function pide2FA(j){ if(!(j && j.motivo === 'falta_2fa') || !TOK) return false; toast('Para esto, primero activa la verificación en dos pasos.'); pantalla2FA(true); return true; }
function tieneModulo(m){ return !!(ERP.yo && ERP.yo.plan && (ERP.yo.plan.modulos || []).indexOf(m) >= 0); }

/* en obrasstapp.com los enlaces «../…» (términos y privacidad) van a GitHub Pages, como en las otras páginas */
(function(){ if(/\/portal\//.test(location.pathname)) return;
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="../"]'), function(a){ a.setAttribute('href', APP_FIJA + a.getAttribute('href').slice(3)); });
})();

/* ── lo que dice el servidor, en palabras ── */
var MOTIVOS = { sin_cuenta:'Tu sesión se cerró. Vuelve a entrar.', solo_admin:'Eso lo cambia el administrador de tu empresa.', web:'La web tiene que empezar con https://',
  logo:'El logo tiene que ser una imagen PNG, JPG o WEBP liviana.', no_eres_aliado:'Esta cuenta no es de un aliado de OBRASST.', usuario_cortado:'El administrador cortó el acceso de esta cuenta.',
  aliado_pausado:'La ficha de tu empresa está en pausa. Escríbenos a info@obrasstapp.com.', suspendido:'OBRASST suspendió el ERP de tu empresa. Escríbenos a info@obrasstapp.com.',
  erp_apagado:'El ERP está en mantenimiento. Vuelve en unos minutos.', erp_aun_no:'El ERP todavía no abre.', plan_no_incluye:'Tu plan no incluye esta parte. Míralo en «Mi plan».',
  sin_permiso:'Tu papel no tiene permiso para esto.', falta_2fa:'Falta la verificación en dos pasos.', muy_seguido:'Muchas consultas seguidas. Espera un minuto.',
  datos_personales:'Eso traía datos personales de un trabajador (nombres, DNI, firma, salud o sueldo) y no se guardó. El ERP no los recibe.',
  no_existe:'Eso ya no está (o no es de tu empresa).', datos:'Revisa los datos.', falta_idem:'Recarga la página e inténtalo otra vez.', idem_conflicto:'Ese envío ya se hizo con otros datos. Recarga la página.',
  sku:'El SKU va en mayúsculas, sin espacios (letras, números, guion, punto o barra).', sku_usado:'Ese SKU ya existe.', sku_variante:'Revisa el SKU de cada variante.', nombre:'Escribe el nombre.',
  detraccion:'La detracción solo va en servicios, con un código de la lista.', unidad:'La unidad va como en SUNAT (NIU, PR, ZZ…).', barras:'Revisa el código de barras.',
  cantidad:'Revisa la cantidad.', falta_vence:'Ese producto lleva fecha de vencimiento: ponla.', no_es_bien:'Solo los productos (no servicios ni kits) tienen stock.', almacen:'Elige el almacén.',
  variante:'Elige un producto de la lista.', motivo:'Escribe el motivo.', reservado:'No puedes dejar menos de lo que ya está reservado para pedidos.', sin_stock:'No hay stock suficiente.',
  tope_almacenes:'Tu plan tiene una sola sede. Pasa a ERP Full para más almacenes.', codigo_usado:'Ese código ya existe.', ubigeo:'El ubigeo son 6 números (INEI).',
  ruc:'Ese RUC no pasa el dígito verificador de SUNAT.', dni:'El DNI son 8 números.', razon_social:'Escribe la razón social.', correo:'Revisa el correo.', telefono:'Revisa el teléfono.',
  doc_usado:'Ya tienes un cliente con ese documento.', cliente:'Elige un cliente tuyo.', condicion:'Elige la condición de pago.', lineas:'Revisa las líneas.', muchas_lineas:'Máximo 200 líneas.',
  precio:'Revisa el precio.', desc:'Revisa el descuento.', sin_precio:'Ese producto no tiene precio: ponlo en su ficha o en la lista.', desc_max:'Ese descuento pasa tu tope.',
  validez:'La validez va de hoy a 180 días.', cerrada:'Esa ya se cerró.', estado:'No se puede en este estado.', ya_tiene_pedido:'Esa cotización ya tiene su pedido.',
  credito_bloqueado:'El crédito de este cliente está bloqueado.', sin_linea:'Este cliente no tiene línea de crédito: véndele al contado o pide al administrador que le ponga una.',
  linea_excedida:'Ese pedido pasa la línea de crédito del cliente.', cerrado:'Ese pedido ya se cerró.', partida:'Falta el punto de partida (dirección y ubigeo del almacén) en Configuración.',
  llegada:'Falta el punto de llegada (dirección y ubigeo).', vehiculo:'Escribe la placa del vehículo.', conductor:'Faltan los datos del conductor (documento, nombre y licencia).',
  transportista:'Revisa el RUC y la razón social del transportista.', modalidad:'Elige la modalidad de transporte.', chofer:'Ese chofer no es de tu equipo.', fecha_traslado:'La fecha de traslado va de hoy a 30 días.',
  nada_que_despachar:'No hay nada reservado para despachar.', ya_entregada:'Esa guía ya se entregó.', firma_recepcion:'Falta la firma de quien recibe.', recibio:'Escribe quién recibió.',
  gps:'Falta la ubicación (GPS).', foto:'Revisa la foto.', factura_sin_ruc:'La factura va a un RUC. Para un DNI, emite boleta.', boleta_sin_doc:'Una boleta de más de S/ 700 pide el DNI del cliente.',
  separar_detraccion:'Factura por separado el servicio con detracción y los productos.', nada_que_facturar:'No queda nada por facturar en ese pedido.', anulado:'Ese pedido está anulado.',
  guias:'Revisa las guías elegidas.', excede:'La nota pasa el total del comprobante.', monto:'Revisa el monto.', medio:'Elige el medio de pago.', fecha:'Revisa la fecha.',
  proveedor:'Elige un proveedor tuyo.', gastos:'Revisa los gastos de la importación.', moneda:'Revisa la moneda.', tipo:'Revisa el tipo.', no_se_puede:'Ya no se puede.',
  cierre:'El cierre va de mañana a 60 días.', items:'Revisa los productos del acuerdo.', cliente_sin_obrasst:'La consignación es con empresas que usan OBRASST (el cliente tiene que tener su RUC en OBRASST).',
  no_activa:'La consignación no está activa: la empresa tiene que aceptarla.', variantes:'Elige dos productos distintos.', recibido:'Revisa lo recibido.', servicio:'Revisa el costo del servicio.',
  ya_enviada:'Ya se envió.', texto:'Escribe qué se pide.', filas:'Revisa las filas (de 1 a 300).', archivo:'Sube primero el archivo.', producto:'Elige el producto.', lote:'Ese lote no es de ese producto.',
  no_es_factura:'Solo facturas.', no_disponible:'Esa factura ya no está disponible para adelantar.', solo_credito:'Solo facturas a crédito.', vence_pronto:'Vence en menos de 7 días.',
  ya_solicitado:'Esa factura ya se pidió.', papel:'Elige el papel.', tope_usuarios:'Tu plan llegó al tope de usuarios.', invitacion_no_vale:'Ese enlace de invitación ya se usó o no es válido.',
  invitacion_vencida:'Ese enlace de invitación venció (dura 7 días).', ya_eres_de_otro:'Esta cuenta ya está unida a otro aliado.', a_ti_mismo:'No puedes cambiarte a ti mismo.',
  plan:'Elige un plan.', ya_es_tu_plan:'Ya es tu plan.', ya_pagado:'Ese cargo ya está pagado.', sin_empresa:'Primero crea la empresa de tu distribuidora en la app de OBRASST con esta misma cuenta.',
  serie:'Revisa las series (4 letras o números; factura con F, boleta con B, guía con T).', flete:'Revisa los fletes.', rango:'El rango va hasta 400 días.', que:'Elige qué exportar.',
  respuesta:'Revisa tu cotización: precios, plazo y validez.', invitacion:'Revisa el enlace.', ruta:'Revisa la dirección del PSE.', token:'Revisa el token.', muy_grande:'El archivo pasa el tope de tamaño.',
  pdf_activo:'Ese PDF trae código (JavaScript o adjuntos) y no se acepta.', no_se_guardo:'No se pudo guardar el archivo. Inténtalo otra vez.', sin_boveda:'Primero conecta tu PSE en Seguridad › Bóveda.',
  boveda_ilegible:'No se pudo leer el token guardado: vuelve a ponerlo.', sin_mercado_pago:'El pago en línea no está disponible ahora.', mercado_pago:'Mercado Pago no respondió. Inténtalo otra vez.',
  error:'Algo falló en el servidor. Inténtalo otra vez.' };
function mensaje(j){ var m = j && j.motivo; return (m && MOTIVOS[m]) || (typeof j === 'number' ? 'El servidor contestó ' + j + '. Inténtalo otra vez.' : 'No se pudo. Revisa tu conexión e inténtalo otra vez.'); }

/* ── la sesión (la misma de obrasstapp.com; si otra pestaña la renovó, se usa esa) ── */
function guardarToken(j){
  if(!j || !j.access_token) return null;
  TOK = { access_token:j.access_token, refresh_token:j.refresh_token || '', expira:Date.now() + ((j.expires_in || 3600) - 60) * 1000,
          correo:(j.user && j.user.email) || (TOK && TOK.correo) || '', uid:(j.user && j.user.id) || (TOK && TOK.uid) || '' };
  try{ var m = j.user && j.user.user_metadata; if(m){ if(m.nombre) TOK.nombre = m.nombre; if(m.cap) TOK.cap = m.cap; } }catch(_m){}
  guardar(LS_TOK, TOK); return TOK;
}
function borrarToken(){ TOK = null; try{ localStorage.removeItem(LS_TOK); }catch(e){} }
function authPost(ruta, cuerpo, conSesion){
  var h = { apikey:SB.key, 'Content-Type':'application/json' };
  if(conSesion && TOK) h.Authorization = 'Bearer ' + TOK.access_token;
  return fetch(SB.url + '/auth/v1/' + ruta, { method:'POST', headers:h, body:JSON.stringify(cuerpo || {}) })
    .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return r.ok ? j : Promise.reject(j); }); });
}
var _REFR = null;
function _tokDeOtra(usado){ var o = leer(LS_TOK, null), uid = TOK && TOK.uid; return (o && o.access_token && o.refresh_token && o.refresh_token !== usado && (!uid || !o.uid || o.uid === uid)) ? o : null; }
function refrescarToken(){
  if(!TOK || !TOK.refresh_token) return Promise.reject('sin_token');
  var otra = _tokDeOtra(TOK.refresh_token);
  if(otra){ TOK = otra; if(!(otra.expira && Date.now() > otra.expira)) return Promise.resolve(TOK); }
  if(_REFR) return _REFR;
  var usado = TOK.refresh_token;
  _REFR = authPost('token?grant_type=refresh_token', { refresh_token:usado }).then(function(j){ _REFR = null; return guardarToken(j); }, function(e){
    _REFR = null; var o = _tokDeOtra(usado); if(o){ TOK = o; return TOK; }
    if(e && typeof e === 'object' && (e.error || e.msg || e.error_code)) borrarToken(); return Promise.reject(e);
  });
  return _REFR;
}
function sbFetch(url, opt, otra){
  opt = opt || {}; opt.headers = Object.assign({ apikey:SB.key, Authorization:'Bearer ' + ((TOK && TOK.access_token) || SB.key) }, opt.tipo ? { 'Content-Type':opt.tipo } : { 'Content-Type':'application/json' });
  if(TOK && TOK.expira && Date.now() > TOK.expira && !otra) return refrescarToken().then(function(){ return sbFetch(url, opt, true); }, function(){ return sbFetch(url, opt, true); });
  return fetch(url, opt).then(function(r){
    if(r.status === 401 && !otra && TOK && TOK.refresh_token) return refrescarToken().then(function(){ return sbFetch(url, opt, true); }, function(){ return r; });
    return r;
  });
}
/* rpc: siempre resuelve con el JSON del servidor ({ok:false, motivo} incluido); 401 → la sesión se cerró.
   rpc('erp_x', p) manda {p}; las del ERP sin argumentos van vacías; rpcCrudo manda los argumentos tal cual (fase 1 y empresa) */
var SIN_ARG = /^(erp_yo|erp_config_ver|erp_usuarios|erp_almacenes|erp_listas|erp_consignaciones|erp_taller|erp_mis_entregas|erp_proveedores|erp_compra_sugerencias|erp_compra_sugerir_oc|erp_grupal|erp_equivalencias|erp_factoring_ops|erp_plan|erp_ssoma_pedir|erp_boveda_permiso)$/;
function rpc(fn, p){ return llamarRpc(fn, SIN_ARG.test(fn) ? {} : { p:p === undefined ? {} : p }); }
function rpcCrudo(fn, args){ return llamarRpc(fn, args || {}); }
/* lo que pide una pantalla al pintarse queda marcado con su «generación»: si mientras tanto se pintó otra, la respuesta se descarta
   (así una lista lenta no pisa la pantalla nueva) */
function llamarRpc(fn, cuerpo){
  var g = ERP.enPintado ? ERP.gen : null;
  return _llamarRpc(fn, cuerpo).then(function(j){ return (g !== null && g !== ERP.gen) ? new Promise(function(){}) : j; });
}
function _llamarRpc(fn, cuerpo){
  return sbFetch(SB.url + '/rest/v1/rpc/' + fn, { method:'POST', body:JSON.stringify(cuerpo) }).then(function(r){
    if(r.status === 401){ sesionVencida(); return { ok:false, motivo:'sin_cuenta' }; }
    return r.json().catch(function(){ return null; }).then(function(j){
      if(!r.ok){ var t = j && (j.message || j.hint || ''); return { ok:false, motivo:/tope_plan_aliado/.test(t) ? 'tope_plan' : (r.status === 404 ? 'error' : 'error'), detalle:t }; }
      return j;
    });
  }, function(){ return { ok:false, motivo:'red' }; });
}
MOTIVOS.tope_plan = 'Tu plan Aliado ya respondió sus 30 solicitudes de este mes. Pasa a Pro en «Mi plan» para responder sin tope.';
MOTIVOS.red = 'No hubo conexión. Inténtalo otra vez.';
/* la función de borde «erp» (archivos, PSE, bóveda, pago) */
function edge(ruta, cuerpo, tipo){
  var opt = { method:'POST', body:cuerpo instanceof Blob ? cuerpo : JSON.stringify(cuerpo || {}) };
  if(cuerpo instanceof Blob) opt.tipo = tipo || cuerpo.type || 'application/octet-stream';
  return sbFetch(SB.url + '/functions/v1/erp' + ruta, opt).then(function(r){ return r.json().catch(function(){ return { ok:false, motivo:'error' }; }); }, function(){ return { ok:false, motivo:'red' }; });
}
function sesionVencida(){ borrarToken(); mostrarEntrada(); entrarMsg('Tu sesión se cerró. Vuelve a entrar.'); }
function authMsg(e){
  var t = ((e && (e.error_code || e.error || '')) + ' ' + (e && (e.msg || e.message || e.error_description || ''))).toLowerCase();
  if(/already|exists|registered/.test(t)) return 'Ese correo ya tiene cuenta. Pasa a «Entrar».';
  if(/not.?confirmed/.test(t)) return 'Te mandamos un correo para confirmar la cuenta: ábrelo y después entra aquí.';
  if(/invalid.?login|invalid_credentials|invalid grant|bad_credential/.test(t)) return 'El correo o la contraseña no coinciden.';
  if(/weak|password/.test(t)) return 'La contraseña necesita 8 caracteres o más, con letras y números.';
  if(/rate|too many|over_/.test(t)) return 'Muchos intentos seguidos. Espera un minuto y vuelve a probar.';
  if(/code|totp|mfa|challenge/.test(t)) return 'Ese código no coincide o venció. Mira el código nuevo en tu app y vuelve a escribirlo.';
  if(/email/.test(t)) return 'Ese correo no parece válido.';
  return 'No se pudo. Revisa tu conexión e inténtalo otra vez.';
}

/* ── invitaciones del enlace: ?i= (la del aliado, fase 1) y ?u= (un usuario del equipo); se guardan y se quitan de la dirección ── */
(function(){
  try{
    var s = location.search || '', m = /[?&]i=([0-9a-f]{32})(&|$)/.exec(s), u = /[?&]u=([0-9a-f]{32})(&|$)/.exec(s);
    if(m) sessionStorage.setItem(SS_INV, m[1]);
    if(u) sessionStorage.setItem(SS_UINV, u[1]);
    if(m || u || /[?&]pago=/.test(s)){ ERP.pagoVuelta = (/[?&]pago=([a-z]+)/.exec(s) || [])[1] || ''; history.replaceState(null, '', location.pathname); }
  }catch(_i){}
})();
function inv(k){ try{ return sessionStorage.getItem(k) || ''; }catch(_i){ return ''; } }
function invUsada(k){ try{ sessionStorage.removeItem(k); }catch(_i){} }

/* ── entrar / crear la cuenta ── */
function entrarMsg(t, ok){ var m = $('e-msg'); m.className = 'msg ' + (ok ? 'ok' : 'mal'); m.textContent = t || ''; }
function pestEnt(c){
  $('t-entrar').className = c ? '' : 'on'; $('t-crear').className = c ? 'on' : '';
  $('t-entrar').setAttribute('aria-selected', String(!c)); $('t-crear').setAttribute('aria-selected', String(!!c));
  $('f-entrar').hidden = !!c; $('f-crear').hidden = !c;
}
function mostrarEntrada(){ ver('v-entrar'); $('b-salir').hidden = true; $('b-menu').hidden = true; $('b-nombre').textContent = ''; var hay = !!(inv(SS_INV) || inv(SS_UINV)); $('e-inv').hidden = !hay; pestEnt(hay && !leer(LS_TOK, null)); }
$('t-entrar').onclick = function(){ pestEnt(false); };
$('t-crear').onclick = function(){ pestEnt(true); };
$('f-entrar').onsubmit = function(ev){
  ev.preventDefault();
  var correo = val('e-correo').toLowerCase(), clave = $('e-clave').value || '';
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)){ entrarMsg('Escribe tu correo.'); $('e-correo').focus(); return; }
  if(!clave){ entrarMsg('Escribe tu contraseña.'); $('e-clave').focus(); return; }
  var bt = $('e-bt'); bt.disabled = true; entrarMsg('');
  authPost('token?grant_type=password', { email:correo, password:clave }).then(function(j){ bt.disabled = false; guardarToken(j); $('e-clave').value = ''; arrancar(); },
    function(e){ bt.disabled = false; entrarMsg(authMsg(e)); });
};
$('e-olvido').onclick = function(){
  var correo = val('e-correo').toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)){ entrarMsg('Escribe arriba tu correo y vuelve a tocar «¿Olvidaste tu contraseña?».'); $('e-correo').focus(); return; }
  entrarMsg('Mandando el correo…', true);
  fetch(SB.url + '/auth/v1/recover', { method:'POST', headers:{ apikey:SB.key, 'Content-Type':'application/json' }, body:JSON.stringify({ email:correo, redirect_to:APP_FIJA }) })
    .then(function(r){ entrarMsg(r.ok ? 'Listo: revisa tu correo y crea una contraseña nueva. Después vuelve aquí y entra.' : 'No se pudo mandar el correo ahora. Escríbenos a info@obrasstapp.com.', r.ok); },
          function(){ entrarMsg('No hubo conexión. Inténtalo otra vez.'); });
};
$('f-crear').onsubmit = function(ev){
  ev.preventDefault();
  var m = $('c-msg'), mal = function(t, id){ m.className = 'msg mal'; m.textContent = t; if(id) $(id).focus(); };
  var nombre = val('c-nombre').replace(/\s+/g, ' '), correo = val('c-correo').toLowerCase(), clave = $('c-clave').value || '';
  if(nombre.length < 5 || nombre.split(' ').length < 2) return mal('Escribe tu nombre y apellido.', 'c-nombre');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) return mal('Escribe un correo válido.', 'c-correo');
  if(clave.length < 8 || !(/[0-9]/.test(clave) && /[a-zA-Z]/.test(clave))) return mal('La contraseña necesita 8 caracteres o más, con letras y números.', 'c-clave');
  if(!$('c-legal-1').checked || !$('c-legal-2').checked) return mal('Para crear la cuenta hay que marcar las dos casillas.', $('c-legal-1').checked ? 'c-legal-2' : 'c-legal-1');
  var bt = $('c-bt'); bt.disabled = true; m.className = 'msg'; m.textContent = 'Creando tu cuenta…';
  authPost('signup', { email:correo, password:clave, data:{ nombre:nombre.split(' ')[0], cap:nombre, reg:new Date().toISOString(), reg_por:'erp' } }).then(function(j){
    if(j && j.access_token) return guardarToken(j);
    return authPost('token?grant_type=password', { email:correo, password:clave }).then(guardarToken);
  }).then(function(){
    sbFetch(SB.url + '/rest/v1/sst_consentimiento', { method:'POST', body:JSON.stringify({ version:LEGAL_VER_WEB, aceptado:new Date().toISOString() }) }).catch(function(){});
    bt.disabled = false; $('c-clave').value = ''; m.textContent = ''; arrancar();
  }, function(e){ bt.disabled = false; mal(authMsg(e)); });
};
function salir(){ borrarToken(); ERP.yo = null; ERP.cache = {}; if(ERP.reloj){ clearInterval(ERP.reloj); ERP.reloj = null; } mostrarEntrada(); }
$('b-salir').onclick = salir; $('no-salir').onclick = salir;
$('b-menu').onclick = function(){ $('lado').classList.toggle('abierto'); };

/* ── al abrir: invitaciones, quién soy, 2FA ── */
function arrancar(){
  TOK = TOK || leer(LS_TOK, null);
  if(!TOK || !TOK.access_token){ mostrarEntrada(); return; }
  ver('v-carga');
  var p = Promise.resolve(null), ia = inv(SS_INV), iu = inv(SS_UINV);
  if(ia) p = rpcCrudo('sst_ali_unirse', { p_token:ia }).then(function(j){ if(j && (j.ok || /invitacion|ya_eres/.test(j.motivo || ''))) invUsada(SS_INV); if(j && j.ok) toast('Listo: ya eres parte de OBRASST Aliados.'); else if(j && j.motivo && j.motivo !== 'no_eres_aliado') return j; return null; });
  else if(iu) p = rpc('erp_unirse', { token:iu }).then(function(j){ if(j && (j.ok || /invitacion|ya_eres/.test(j.motivo || ''))) invUsada(SS_UINV); if(j && j.ok) toast('Listo: ya eres parte del equipo.'); else if(j && j.motivo) return j; return null; });
  p.then(function(err){
    return rpc('erp_yo').then(function(y){
      if(!y || !y.ok){ noAliado(err ? mensaje(err) : (y && y.motivo !== 'no_eres_aliado' ? mensaje(y) : null)); return; }
      ERP.yo = y;
      if(y.aliado && y.aliado.rubro && y.aliado.rubro !== 'epp'){ location.replace('portal-aliados.html'); return; }
      if(y.falta_2fa && soloBandeja(y) === false){ pantalla2FA(); return; }
      mostrarApp();
    });
  });
}
function noAliado(t){
  ver('v-no'); $('b-salir').hidden = false; $('b-nombre').textContent = (TOK && (TOK.cap || TOK.correo)) || '';
  $('no-t').textContent = t ? 'No se pudo entrar' : 'Esta cuenta no es de un aliado de OBRASST';
  $('no-p').textContent = t || 'Para entrar aquí abre el enlace de invitación que te mandamos. Si tu empresa ya es aliada, pídele a su administrador un enlace para ti.';
}

/* ── 2FA (TOTP) con la API de Auth de Supabase: factores, desafío y verificación (la sesión pasa a aal2) ── */
function authReq(metodo, ruta, cuerpo){
  return fetch(SB.url + '/auth/v1/' + ruta, { method:metodo, headers:{ apikey:SB.key, Authorization:'Bearer ' + TOK.access_token, 'Content-Type':'application/json' },
    body:cuerpo ? JSON.stringify(cuerpo) : undefined }).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return r.ok ? j : Promise.reject(j); }); });
}
function factores(){ return authReq('GET', 'user').then(function(u){ return (u && u.factors || []).filter(function(f){ return f.factor_type === 'totp'; }); }); }
function pantalla2FA(volver){
  ver('v-2fa'); $('b-salir').hidden = false; $('b-nombre').textContent = (TOK && (TOK.cap || TOK.correo)) || '';
  var d = $('d-2fa'); d.innerHTML = '<p class="ayuda">Revisando tu verificación…</p>';
  var v = $('d-2fa-volver'); if(v){ v.hidden = !volver; v.onclick = function(){ arrancar(); }; }
  factores().then(function(fs){
    var v = fs.filter(function(f){ return f.status === 'verified'; })[0];
    if(v) return pedirCodigo(d, v.id, 'Escribe el código de 6 dígitos que muestra tu app de autenticación.');
    /* sin factor: se crea uno (los que quedaron a medias se borran) */
    Promise.all(fs.map(function(f){ return authReq('DELETE', 'factors/' + f.id).catch(function(){}); })).then(function(){
      return authReq('POST', 'factors', { factor_type:'totp', friendly_name:'ERP OBRASST ' + hoyLima() });
    }).then(function(f){
      d.innerHTML = '<h2 style="font-size:17px; margin:0 0 6px">Activa la verificación</h2><p class="ayuda" style="margin:0 0 12px">1 · Escanea este código con tu app de autenticación. 2 · Escribe el código de 6 dígitos que te muestra.</p>' +
        '<div class="qr-2fa"><img alt="Código QR para tu app de autenticación" src="' + esc(f.totp && f.totp.qr_code) + '"><div style="min-width:0; flex:1"><p class="ayuda">¿No puedes escanear? Escribe esta clave en tu app:</p>' +
        '<p class="mono" style="word-break:break-all; margin:4px 0 12px">' + esc(f.totp && f.totp.secret) + '</p><div id="d-codigo"></div></div></div>';
      pedirCodigo($('d-codigo'), f.id, '');
    }).catch(function(e){ d.innerHTML = '<div class="aviso mal">' + esc(authMsg(e)) + '</div><button type="button" class="bt sec" id="d-otra">Volver a intentar</button>'; $('d-otra').onclick = pantalla2FA; });
  }, function(e){ d.innerHTML = '<div class="aviso mal">' + esc(authMsg(e)) + '</div>'; });
}
function pedirCodigo(caja, factor, texto){
  caja.innerHTML = (texto ? '<p class="ayuda" style="margin:0 0 10px">' + esc(texto) + '</p>' : '') +
    '<form id="f-2fa" novalidate><div class="campo"><label for="c-2fa">Código</label><input id="c-2fa" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}"></div>' +
    '<button class="bt" type="submit" id="b-2fa">Verificar</button><p class="msg" id="m-2fa" role="alert"></p></form>';
  $('c-2fa').focus();
  $('f-2fa').onsubmit = function(ev){
    ev.preventDefault();
    var cod = val('c-2fa').replace(/\D/g, ''), m = $('m-2fa');
    if(cod.length !== 6){ m.className = 'msg mal'; m.textContent = 'Son 6 números.'; return; }
    $('b-2fa').disabled = true;
    authReq('POST', 'factors/' + factor + '/challenge', {}).then(function(ch){
      return authReq('POST', 'factors/' + factor + '/verify', { challenge_id:ch.id, code:cod });
    }).then(function(j){ guardarToken(j); toast('Verificación lista.'); arrancar(); },
      function(e){ $('b-2fa').disabled = false; m.className = 'msg mal'; m.textContent = authMsg(e); });
  };
}

/* ── el armazón: menú por papel (lo dice el servidor), secciones y subsecciones en la dirección (#/ventas/clientes) ── */
var SECCIONES = {
  tablero:{ t:'Tablero', h:'Rentabilidad: ventas, margen, cobranzas y alertas' }, bandeja:{ t:'Bandeja OBRASST', h:'Solicitudes de las empresas y el cotizador automático' },
  ventas:{ t:'Ventas externas', h:'Cotizaciones, pedidos, clientes, mostrador, precios y licitaciones' }, almacen:{ t:'Almacén', h:'Productos, lotes FEFO, ingresos, traslados y kardex' },
  consignaciones:{ t:'Consignaciones', h:'Tu stock en la obra del cliente, descontado por sus entregas' }, taller:{ t:'Taller y bordados', h:'Órdenes de transformación con su costo' },
  despachos:{ t:'Despachos y guías', h:'Guías de remisión, ruta y dossier de calidad' }, entregas:{ t:'Mis entregas', h:'Tu ruta y la prueba de entrega' },
  facturacion:{ t:'Facturación y cobranzas', h:'Comprobantes, cuentas por cobrar, estados de cuenta y adelanto de cobro' },
  compras:{ t:'Compras', h:'Reorden, órdenes de compra, importaciones y compra grupal' }, plan:{ t:'Mi plan', h:'Tu plan, tu billetera de comisiones y tu ficha' },
  seguridad:{ t:'Seguridad', h:'Registro, equipo, 2FA, bóveda del PSE y configuración' } };
var PINTAR = {};   /* cada módulo pone aquí su función: PINTAR.ventas = function(sub){…} */
function mostrarApp(){
  ver('v-app');
  var y = ERP.yo;
  $('b-salir').hidden = false; $('b-menu').hidden = false; $('b-nombre').textContent = (y.yo && y.yo.nombre) || (TOK && TOK.correo) || '';
  $('b-prueba').hidden = !(y.pse && y.pse.modo === 'prueba' && tieneModulo('facturacion'));
  $('l-razon').textContent = y.aliado.razon;
  $('l-plan').textContent = 'Plan ' + y.plan.n + (y.plan.fundador ? ' · fundador' : '') + ' · ' + ({ admin:'Administrador', vendedor:'Vendedor', almacenero:'Almacenero', chofer:'Chofer' })[y.papel];
  $('menu').innerHTML = y.menu.map(function(k){ return '<button type="button" data-sec="' + k + '"><span>' + esc(SECCIONES[k].t) + '</span><span class="n" id="n-' + k + '" hidden></span></button>'; }).join('');
  $('menu').onclick = function(ev){ var b = ev.target.closest('[data-sec]'); if(b){ $('lado').classList.remove('abierto'); irA(b.getAttribute('data-sec')); } };
  if(y.apagado){
    $('vista').innerHTML = '<div class="aviso ojo"><b>El ERP está en mantenimiento.</b> Mientras tanto están tu Bandeja y Mi plan.</div>';
  } else if(!y.activo && !soloBandeja(y)){
    $('vista').innerHTML = '<div class="aviso ojo"><b>El ERP abre el ' + esc(String(y.activar_en || '').slice(0, 10).split('-').reverse().join('/')) + '.</b> Mientras tanto están tu Bandeja y Mi plan.</div>';
  }
  try{ if(sessionStorage.getItem('sstp_erp_unido')){ sessionStorage.removeItem('sstp_erp_unido'); toast('Listo: ya eres parte de OBRASST Aliados.'); } }catch(_u){}
  if(ERP.pagoVuelta){ toast(ERP.pagoVuelta === 'ok' ? 'Pago recibido: tu plan se activa en cuanto Mercado Pago lo confirme.' : 'El pago no se completó.'); ERP.pagoVuelta = ''; }
  if(!ERP.envuelto){ ERP.envuelto = true;
    /* repintar desde una acción solo si la persona sigue en esa pantalla (si ya se fue a otra, no se la pisa) */
    Object.keys(PINTAR).forEach(function(k){ var f = PINTAR[k]; PINTAR[k] = function(sub){
      if(!ERP.desdeNav){ var h = /^#\/([a-z]+)(?:\/([a-z_0-9-]+))?/.exec(location.hash || '') || []; if(k !== ERP.sec || (sub && h[2] && h[2] !== sub)) return; }
      ERP.gen++; ERP.enPintado = true; try{ return f(sub); } finally{ ERP.enPintado = false; } }; }); }
  window.onhashchange = desdeHash;
  desdeHash();
  if(ERP.reloj) clearInterval(ERP.reloj);
  ERP.reloj = setInterval(function(){ if(!document.hidden) contarBandeja(); }, 90000);
  contarBandeja();
}
function desdeHash(){
  var m = /^#\/([a-z]+)(?:\/([a-z_0-9-]+))?/.exec(location.hash || ''), y = ERP.yo;
  var sec = m && puede(m[1]) ? m[1] : (y.menu[0] || 'plan');
  pintarSec(sec, m && m[2] || '');
}
function irA(sec, sub){ var h = '#/' + sec + (sub ? '/' + sub : ''); if(location.hash !== h) location.hash = h; else pintarSec(sec, sub || ''); }
function pintarSec(sec, sub){
  ERP.sec = sec; ERP.sub = sub;
  [].forEach.call(document.querySelectorAll('#menu [data-sec]'), function(b){ b.className = b.getAttribute('data-sec') === sec ? 'on' : ''; });
  ERP.titulo = SECCIONES[sec].t + ' · ERP OBRASST'; ponerTitulo();
  var f = PINTAR[sec];
  if(f){ ERP.desdeNav = true; try{ f(sub); } finally{ ERP.desdeNav = false; } return; }
  $('vista').innerHTML = '<p class="ayuda">Cargando…</p>'; setTimeout(function(){ if(PINTAR[sec]) pintarSec(sec, sub); }, 400);
}
function ponerTitulo(){ document.title = (ERP.nuevas ? '(' + ERP.nuevas + ') ' : '') + (ERP.titulo || 'ERP OBRASST'); }
function contarBandeja(){
  if(!puede('bandeja')) return;
  rpcCrudo('sst_ali_bandeja', {}).then(function(j){
    if(!j || !j.ok) return;
    var n = (j.lista || []).filter(function(f){ return COT.estadoAliado(f).k === 'nuevo'; }).length, b = $('n-bandeja');
    if(b){ b.hidden = !n; b.textContent = n || ''; }
    ERP.nuevas = n; ponerTitulo();
    ERP.cache.bandeja = j.lista;
  });
}
/* cabecera de sección con pestañas */
function cabecera(sec, subs, sub){
  var s = SECCIONES[sec];
  return '<div class="cab"><div><h1>' + esc(s.t) + '</h1><p>' + esc(s.h) + '</p></div></div>' + (subs && subs.length > 1 ? '<nav class="pestanas" aria-label="' + esc(s.t) + '">' +
    subs.map(function(x){ return '<button type="button" data-ir="' + sec + '/' + x[0] + '" class="' + (x[0] === sub ? 'on' : '') + '">' + esc(x[1]) + '</button>'; }).join('') + '</nav>' : '');
}
document.addEventListener('click', function(ev){
  var b = ev.target.closest('[data-ir]');
  if(b){ var p = b.getAttribute('data-ir').split('/'); irA(p[0], p[1]); return; }
  var a = ev.target.closest('[data-a]');
  if(a && ACC[a.getAttribute('data-a')]){ ev.preventDefault(); ACC[a.getAttribute('data-a')](a, ev); }
});
var ACC = {};   /* acciones por data-a */

/* ── tablas, hojas (ventanas) y formularios ── */
function tabla(cols, filas, op){
  op = op || {};
  if(!filas || !filas.length) return '<div class="vacio"><b>' + esc(op.vacio || 'Nada todavía') + '</b>' + esc(op.vacioSub || '') + '</div>';
  return '<div class="tabla-caja"><table><thead><tr>' + cols.map(function(c){ return '<th' + (c.n ? ' class="num"' : '') + '>' + esc(c.t) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    filas.map(function(f, i){ return '<tr' + (op.a ? ' class="clic" data-a="' + op.a + '" data-id="' + esc(op.id ? op.id(f) : f.id) + '" data-i="' + i + '"' : '') + '>' +
      cols.map(function(c){ var v = c.k(f, i); return '<td' + (c.n ? ' class="num"' : '') + '>' + (v == null ? '' : v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
}
function pill(t, c){ return '<span class="pill ' + (c || '') + '">' + esc(t) + '</span>'; }
var _hojaN = 0;
function hoja(o){
  var id = 'h' + (++_hojaN), velo = document.createElement('div');
  velo.className = 'velo'; velo.id = id;
  velo.innerHTML = '<div class="hoja' + (o.ancha ? ' ancha' : '') + '" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t"><div class="h-cab"><h2 id="' + id + '-t">' + esc(o.titulo) + '</h2>' +
    '<button type="button" class="x" aria-label="Cerrar">×</button></div><div class="h-cuerpo">' + (o.html || '') + '<p class="msg" id="' + id + '-msg" role="alert"></p></div>' +
    (o.botones && o.botones.length ? '<div class="h-pie">' + o.botones.map(function(b, i){ return '<button type="button" class="bt ' + (b.c || '') + '" data-hb="' + i + '">' + esc(b.t) + '</button>'; }).join('') + '</div>' : '') + '</div>';
  $('hojas').appendChild(velo);
  var api = { el:velo, cerrar:function(){ velo.remove(); document.removeEventListener('keydown', tecla); }, msg:function(t, ok){ var m = $(id + '-msg'); m.className = 'msg ' + (ok ? 'ok' : 'mal'); m.textContent = t || ''; },
              ocupado:function(s){ [].forEach.call(velo.querySelectorAll('[data-hb]'), function(b){ b.disabled = !!s; }); } };
  function tecla(e){ if(e.key === 'Escape') api.cerrar(); }
  document.addEventListener('keydown', tecla);
  velo.querySelector('.x').onclick = api.cerrar;
  velo.addEventListener('click', function(e){ if(e.target === velo) api.cerrar(); var b = e.target.closest('[data-hb]'); if(b){ var f = o.botones[+b.getAttribute('data-hb')].a; if(f) f(api); else api.cerrar(); } });
  if(o.alAbrir) o.alAbrir(api);
  var pri = velo.querySelector('input:not([type=hidden]):not([disabled]), select, textarea'); if(pri){ try{ pri.focus(); }catch(e){} }
  return api;
}
/* hace la llamada, avisa y repinta: guarda(api, rpc('…', p), 'Guardado.', function(j){…}) */
function guarda(api, prom, okTxt, luego){
  if(api) api.ocupado(true);
  return prom.then(function(j){
    if(api) api.ocupado(false);
    if(!j || j.ok === false){ if(pide2FA(j)){ if(api) api.cerrar(); return null; } var t = mensaje(j) + (j && j.claves ? ' (' + j.claves.join(', ') + ')' : '') + (j && j.linea ? ' · línea ' + j.linea : '') + (j && j.max != null && j.motivo === 'desc_max' ? ' · tope ' + j.max + ' %' : '');
      if(api) api.msg(t); else toast(t); return null; }
    if(api) api.cerrar();
    if(okTxt) toast(okTxt);
    if(luego) luego(j);
    return j;
  });
}
function campo(id, label, html, ayuda){ return '<div class="campo"><label for="' + id + '">' + esc(label) + '</label>' + html + (ayuda ? '<p class="ayuda">' + esc(ayuda) + '</p>' : '') + '</div>'; }
function inp(id, v, extra){ return '<input id="' + id + '" value="' + esc(v == null ? '' : v) + '"' + (extra || '') + '>'; }
function sel(id, ops, v, extra){ return '<select id="' + id + '"' + (extra || '') + '>' + ops.map(function(o){ var k = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o;
  return '<option value="' + esc(k) + '"' + (String(k) === String(v == null ? '' : v) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>'; }
function cargando(t){ $('vista').innerHTML += '<p class="ayuda" id="cargando">' + esc(t || 'Cargando…') + '</p>'; }

/* ── catálogos compartidos (variantes y clientes para buscar con la lista del navegador) ── */
function catVariantes(forzar){
  if(ERP.cache.var && !forzar) return Promise.resolve(ERP.cache.var);
  return rpc('erp_productos', { limite:200, todos:false }).then(function(j){
    var L = [];
    ((j && j.lista) || []).forEach(function(p){ (p.variantes || []).forEach(function(v){ if(v.activo !== false) L.push({ id:v.id, sku:v.sku, n:p.nombre + (v.talla ? ' · ' + v.talla : '') + (v.color ? ' · ' + v.color : ''),
      tipo:p.tipo, u:p.unidad, precio:v.precio != null ? v.precio : p.precio_base, costo:v.costo, stock:v.stock, prod:p.id }); }); });
    ERP.cache.var = L; ERP.cache.prod = (j && j.lista) || []; return L;
  });
}
function catClientes(forzar){
  if(ERP.cache.cli && !forzar) return Promise.resolve(ERP.cache.cli);
  return rpc('erp_clientes', {}).then(function(j){ ERP.cache.cli = (j && j.lista) || []; return ERP.cache.cli; });
}
function listaVar(id){ return '<datalist id="' + id + '">' + (ERP.cache.var || []).map(function(v){ return '<option value="' + esc(v.sku + ' · ' + v.n) + '">'; }).join('') + '</datalist>'; }
function listaCli(id){ return '<datalist id="' + id + '">' + (ERP.cache.cli || []).map(function(c){ return '<option value="' + esc((c.num_doc || 's/d') + ' · ' + c.razon_social) + '">'; }).join('') + '</datalist>'; }
function varDe(txt){ var sku = String(txt || '').split(' · ')[0].trim().toUpperCase(); return (ERP.cache.var || []).filter(function(v){ return v.sku === sku; })[0] || null; }
function cliDe(txt){ var t = String(txt || '').trim(); return (ERP.cache.cli || []).filter(function(c){ return ((c.num_doc || 's/d') + ' · ' + c.razon_social) === t || c.num_doc === t; })[0] || null; }
function cargarJs(src){ return new Promise(function(ok, mal){ if(document.querySelector('script[data-src="' + src + '"]')) return ok(); var s = document.createElement('script'); s.src = src; s.setAttribute('data-src', src); s.onload = ok; s.onerror = mal; document.body.appendChild(s); }); }
function docs(){ return cargarJs('erp-docs.js?v=erp1').then(function(){ return window.ERPDOC; }); }
function wa(texto, tel){ var t = String(tel || '').replace(/\D/g, ''); if(t.length === 9) t = '51' + t; window.open('https://wa.me/' + (t.length >= 11 ? t : '') + '?text=' + encodeURIComponent(texto), '_blank', 'noopener'); }

/* ══ TABLERO DE RENTABILIDAD ══ */
PINTAR.tablero = function(sub){
  var per = sub || 'mes', h = hoyLima(), d = per === 'anterior' ? masDias(h.slice(0, 8) + '01', -1).slice(0, 8) + '01' : per === '90' ? masDias(h, -90) : h.slice(0, 8) + '01';
  var hasta = per === 'anterior' ? masDias(h.slice(0, 8) + '01', -1) : h;
  $('vista').innerHTML = cabecera('tablero', [['mes', 'Este mes'], ['anterior', 'Mes pasado'], ['90', 'Últimos 90 días']], per) + '<p class="ayuda" id="cargando">Calculando…</p>';
  rpc('erp_tablero', { desde:d, hasta:hasta }).then(function(t){
    if(!t || !t.ok){ $('cargando').outerHTML = '<div class="aviso mal">' + esc(mensaje(t)) + '</div>'; return; }
    var adm = t.papel === 'admin', a = t.alertas || {}, max = Math.max.apply(null, (t.por_mes || []).map(function(m){ return Math.abs(m.ventas) || 0; }).concat([1]));
    var html = '<div class="grilla"><div class="kpi"><small>Ventas (sin IGV)</small><b>' + soles(t.ventas) + '</b><span>' + num(t.comprobantes) + ' comprobantes</span></div>' +
      (adm ? '<div class="kpi"><small>Margen bruto</small><b>' + soles(t.margen) + '</b><span>' + (t.margen_pct != null ? num(t.margen_pct, 1) + ' % de las ventas' : '—') + '</span></div>' : '') +
      '<div class="kpi"><small>Por cobrar</small><b>' + soles(t.cobranzas && t.cobranzas.saldo) + '</b><span>' + soles(t.cobranzas && t.cobranzas.vencido) + ' vencido</span></div>' +
      (adm ? '<div class="kpi"><small>Valor del stock (PPP)</small><b>' + soles(t.stock_valor) + '</b><span>al costo promedio</span></div>' : '') + '</div>';
    html += '<div class="dos"><div class="tarj"><h2>Últimos 6 meses</h2><div class="barras">' + (t.por_mes || []).map(function(m){
      return '<div title="' + esc(m.mes + ': ' + soles(m.ventas) + (adm ? ' · margen ' + soles(m.margen) : '')) + '"><i style="height:' + Math.max(2, Math.round(Math.abs(m.ventas) / max * 120)) + 'px"></i>' +
        (adm ? '<i class="m" style="height:' + Math.max(2, Math.round(Math.max(m.margen || 0, 0) / max * 120)) + 'px; margin-top:-' + Math.max(2, Math.round(Math.max(m.margen || 0, 0) / max * 120)) + 'px; width:40%"></i>' : '') +
        '<small>' + esc(m.mes.slice(5) + '/' + m.mes.slice(2, 4)) + '</small></div>'; }).join('') + '</div><p class="ayuda" style="margin-top:6px">Ventas sin IGV' + (adm ? ' · en amarillo, el margen' : '') + '.</p></div>';
    html += '<div class="tarj"><h2>Alertas</h2>' + [
      ['bandeja', 'solicitudes de empresas por responder', 'bandeja', a.bandeja], ['por_entregar', 'guías por entregar', 'despachos', a.por_entregar],
      ['backorders', 'pedidos con backorder', 'ventas/pedidos', a.backorders], ['recompra', 'clientes para reponer (vida útil)', 'ventas/reposicion', a.recompra],
      ['vencidos', 'lotes vencidos (bloqueados)', 'almacen/lotes', a.vencidos], ['por_vencer', 'lotes que vencen en 30 días', 'almacen/lotes', a.por_vencer],
      ['reorden', 'productos bajo su punto de reorden', 'compras/sugerencias', a.reorden], ['criticas', 'alertas críticas de seguridad (7 días)', 'seguridad/registro', a.criticas]
    ].filter(function(x){ return x[3] != null; }).map(function(x){ return '<p style="display:flex; justify-content:space-between; gap:10px; padding:5px 0; border-bottom:1px solid #EEF2F5">' +
      '<span>' + (x[3] ? '<b>' + num(x[3]) + '</b> ' : '0 ') + esc(x[1]) + '</span>' + (x[3] && puede(x[2].split('/')[0]) ? '<button type="button" class="bt-link" data-ir="' + x[2] + '">Ver</button>' : '') + '</p>'; }).join('') + '</div></div>';
    html += '<div class="dos"><div><h2 style="font-size:15px; margin:0 0 8px">Productos que más venden</h2>' + tabla([{ t:'Producto', k:function(x){ return esc(x.d) + '<span class="sub mono">' + esc(x.sku) + '</span>'; } },
      { t:'Cantidad', n:1, k:function(x){ return num(x.cantidad); } }, { t:'Ventas', n:1, k:function(x){ return soles(x.ventas); } }].concat(adm ? [{ t:'Margen', n:1, k:function(x){ return soles(x.margen); } }] : []), t.top_productos, { vacio:'Sin ventas en el periodo' }) + '</div>' +
      '<div><h2 style="font-size:15px; margin:0 0 8px">Clientes</h2>' + tabla([{ t:'Cliente', k:function(x){ return esc(x.cliente); } }, { t:'Ventas', n:1, k:function(x){ return soles(x.ventas); } }].concat(adm ? [{ t:'Margen', n:1, k:function(x){ return soles(x.margen); } }] : []), t.top_clientes, { vacio:'Sin ventas en el periodo' }) + '</div></div>';
    if(adm && t.por_vendedor && t.por_vendedor.length) html += '<h2 style="font-size:15px; margin:4px 0 8px">Por vendedor</h2>' + tabla([{ t:'Vendedor', k:function(x){ return esc(x.vendedor || '—'); } },
      { t:'Ventas', n:1, k:function(x){ return soles(x.ventas); } }, { t:'Margen', n:1, k:function(x){ return soles(x.margen); } }], t.por_vendedor);
    $('cargando').outerHTML = html;
  });
};

/* ══ MI PLAN: plan, pagos, billetera de comisiones, programa, ficha y cuenta SSOMA ══ */
/* los planes de OBRASST de las empresas que trajo (como los nombra el Portal de Aliados) */
var PLAN_EMP = { lite:'LITE', prevencionista:'Prevencionista de Riesgo', supervisor:'Supervisor SST', ssoma:'SSOMA', gestion:'Gestión SST', central:'Central', corporativo:'Corporativo' };
PINTAR.plan = function(sub){
  sub = sub || 'plan';
  $('vista').innerHTML = cabecera('plan', [['plan', 'Plan y pagos'], ['billetera', 'Billetera y programa'], ['ficha', 'Mi ficha']], sub) + '<p class="ayuda" id="cargando">Cargando…</p>';
  if(sub === 'ficha') return pintarFicha();
  Promise.all([rpc('erp_plan'), sub === 'billetera' ? rpcCrudo('sst_ali_programa', {}) : Promise.resolve(null)]).then(function(r){
    var p = r[0], pr = r[1];
    if(!p || !p.ok){ $('cargando').outerHTML = '<div class="aviso mal">' + esc(mensaje(p)) + '</div>'; return; }
    var h = '';
    if(sub === 'plan'){
      var orden = ['aliado', 'pro', 'erp_basico', 'erp_full'], pend = (p.cargos || []).filter(function(c){ return c.estado === 'por_pagar'; })[0];
      if(pend) h += '<div class="aviso ojo"><b>Cargo por pagar:</b> ' + esc(p.planes[pend.plan] ? p.planes[pend.plan].n : pend.plan) + ' · ' + esc(pend.periodo) + ' · ' + soles(pend.monto) +
        ' <button type="button" class="bt casco mini" data-a="pagarCargo" data-id="' + esc(pend.id) + '">Pagar con Mercado Pago</button></div>';
      if(p.gratis_hasta && p.gratis_hasta >= hoyLima()) h += '<div class="aviso ok">Tus meses gratis (Aliado y Pro) van hasta el <b>' + fecha(p.gratis_hasta) + '</b>.</div>';
      h += '<div class="grilla">' + orden.map(function(k){ var x = p.planes[k]; if(!x) return ''; var es = k === p.plan;
        return '<div class="kpi" style="' + (es ? 'border-color:var(--casco); box-shadow:0 0 0 2px var(--casco-f)' : '') + '"><small>' + esc(x.n) + (es ? ' · tu plan' : '') + '</small><b>' + soles(x.precio_final) + '<span style="font-size:13px; font-weight:500"> /mes</span></b>' +
          (x.precio_final !== x.precio ? '<span>antes ' + soles(x.precio) + ' (fundador −30 %)</span>' : '<span>' + (x.meses_gratis ? x.meses_gratis + ' meses gratis' : 'sin meses gratis') + '</span>') +
          '<p class="ayuda" style="margin:8px 0">' + esc(textoPlan(k, x)) + '</p>' + (es ? '' : '<button type="button" class="bt ' + (orden.indexOf(k) > orden.indexOf(p.plan) ? '' : 'sec') + ' mini" data-a="elegirPlan" data-id="' + k + '">' +
          (orden.indexOf(k) > orden.indexOf(p.plan) ? 'Subir a ' : 'Pasar a ') + esc(x.n) + '</button>') + '</div>'; }).join('') + '</div>';
      h += '<p class="ayuda">Lo que tienes en tu billetera de comisiones se descuenta solo del cargo de cada mes.</p>';
      if(p.plan === 'erp_full') h += '<div class="tarj" style="margin-top:14px"><h2>Tu cuenta SSOMA interna</h2><p class="ayuda" style="margin:0 0 10px">El ERP Full incluye OBRASST para la seguridad y salud de tu propio equipo. Crea la empresa de tu distribuidora en la app con esta misma cuenta y pídenos activarla.</p>' +
        (ERP.yo.ssoma ? '<div class="aviso ok">Pedida para <b>' + esc(ERP.yo.ssoma.nombre) + '</b> el ' + fecha(ERP.yo.ssoma.pedido) + '. OBRASST la activa y te avisa.</div>' : '<button type="button" class="bt sec" data-a="pedirSsoma">Pedir la activación</button>') + '</div>';
      h += '<h2 style="font-size:15px; margin:16px 0 8px">Cargos</h2>' + tabla([{ t:'Periodo', k:function(c){ return esc(c.periodo); } }, { t:'Plan', k:function(c){ return esc(p.planes[c.plan] ? p.planes[c.plan].n : c.plan); } },
        { t:'Precio', n:1, k:function(c){ return soles(c.precio); } }, { t:'Fundador', n:1, k:function(c){ return c.desc_fundador ? '−' + soles(c.desc_fundador) : '—'; } },
        { t:'Billetera', n:1, k:function(c){ return c.desc_billetera ? '−' + soles(c.desc_billetera) : '—'; } }, { t:'A pagar', n:1, k:function(c){ return '<b>' + soles(c.monto) + '</b>'; } },
        { t:'Estado', k:function(c){ return pill({ por_pagar:'Por pagar', pagado:'Pagado', cubierto:'Cubierto por la billetera', anulado:'Anulado' }[c.estado] || c.estado, c.estado === 'por_pagar' ? 'med' : 'ok'); } }], p.cargos, { vacio:'Sin cargos todavía' });
    } else {
      h += '<div class="grilla"><div class="kpi"><small>Tu billetera</small><b>' + soles(p.billetera) + '</b><span>se descuenta sola de tu plan</span></div>' +
        '<div class="kpi"><small>Tu código</small><b class="mono" style="font-size:18px">' + esc(p.codigo) + '</b><span>' + esc(num(p.comision)) + ' % durante ' + esc(p.comision_meses) + ' meses</span></div></div>';
      h += '<div class="tarj"><h2>Tu enlace para traer empresas</h2><p class="ayuda" style="margin:0 0 8px">Cada empresa que crea su cuenta con tu código te da el ' + esc(num(p.comision)) + ' % de lo que paga durante sus primeros ' + esc(p.comision_meses) + ' meses.</p>' +
        '<div class="acciones"><input readonly value="' + esc(p.enlace) + '" id="pl-enlace" style="max-width:420px" class="mono"><button type="button" class="bt sec mini" data-a="copiar" data-id="pl-enlace">Copiar</button></div></div>';
      if(pr && pr.ok) h += '<h2 style="font-size:15px; margin:0 0 8px">Empresas que llegaron con tu código</h2>' + tabla([{ t:'Empresa', k:function(e){ return esc(e.nombre); } }, { t:'Plan', k:function(e){ return esc(PLAN_EMP[e.plan] || String(e.plan || '—').replace(/^\w/, function(c){ return c.toUpperCase(); })); } },
        { t:'Desde', k:function(e){ return fecha(e.desde); } }], pr.empresas, { vacio:'Todavía ninguna', vacioSub:'Comparte tu enlace con las empresas que atiendes.' });
      h += '<h2 style="font-size:15px; margin:4px 0 8px">Movimientos de la billetera</h2>' + tabla([{ t:'Fecha', k:function(m){ return fecha(m.creado); } },
        { t:'Detalle', k:function(m){ return esc(m.tipo === 'comision' ? 'Comisión ' + num(m.pct) + ' % · ' + (m.empresa || '') + ' pagó ' + soles(m.monto_pago) : m.tipo === 'aplicada' ? 'Descontado del cargo de ' + (m.periodo || '') : 'Ajuste'); } },
        { t:'Monto', n:1, k:function(m){ return '<b class="' + (m.monto < 0 ? 'margen-bajo' : 'margen-alto') + '">' + soles(m.monto) + '</b>'; } }], p.movimientos, { vacio:'Sin movimientos' });
    }
    $('cargando').outerHTML = h;
  });
};
function textoPlan(k, x){
  return ({ aliado:'Bandeja de solicitudes: 1 departamento, hasta 30 al mes, 1 usuario.', pro:'Todos los departamentos, sin tope, prioridad, estadísticas, 3 usuarios.',
            erp_basico:'Almacén (1 sede), ventas externas, comprobantes y guías, cobranzas, compras, 5 usuarios.',
            erp_full:'Multialmacén, importaciones, consignación, taller, recompra, equivalencias, dossier, adelanto de cobro, usuarios sin tope y cuenta SSOMA.' })[k] || '';
}
ACC.elegirPlan = function(b){
  var k = b.getAttribute('data-id');
  hoja({ titulo:'Cambiar de plan', html:'<p>¿Pasar al plan <b>' + esc(k.replace('erp_', 'ERP ').replace('basico', 'Básico').replace('full', 'Full')) + '</b>?</p><p class="ayuda" style="margin-top:6px">Si es un plan de pago, se crea el cargo del mes (con tu descuento de fundador y tu billetera). Se activa al pagarlo.</p>',
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Sí, cambiar', a:function(api){ guarda(api, rpc('erp_plan_elegir', { plan:k }), null, function(j){ toast(j.activo ? 'Listo: tu plan cambió.' : 'Se creó el cargo: págalo para activar el plan.');
      rpc('erp_yo').then(function(y){ if(y && y.ok){ ERP.yo = y; mostrarApp(); irA('plan', 'plan'); } }); }); } }] });
};
ACC.pagarCargo = function(b){ b.disabled = true; edge('/pagar', { cargo:b.getAttribute('data-id') }).then(function(j){ b.disabled = false; if(j && j.ok && j.url) location.href = j.url; else toast(mensaje(j)); }); };
ACC.pedirSsoma = function(b){ b.disabled = true; rpc('erp_ssoma_pedir').then(function(j){ b.disabled = false; if(!j || !j.ok){ toast(mensaje(j)); return; } toast('Pedido: OBRASST la activa y te avisa.'); rpc('erp_yo').then(function(y){ if(y && y.ok){ ERP.yo = y; PINTAR.plan('plan'); } }); }); };
ACC.copiar = function(b){ var e = $(b.getAttribute('data-id')); try{ navigator.clipboard.writeText(e.value).then(function(){ toast('Copiado.'); }, function(){ e.select(); document.execCommand('copy'); toast('Copiado.'); }); }catch(x){ e.select(); document.execCommand('copy'); toast('Copiado.'); } };
function pintarFicha(){
  rpcCrudo('sst_ali_yo', {}).then(function(j){
    if(!j || !j.ok){ $('cargando').outerHTML = '<div class="aviso mal">' + esc(mensaje(j)) + '</div>'; return; }
    var a = j.aliado || {}, f = a.ficha || {}, adm = j.papel === 'admin';
    $('cargando').outerHTML = '<div class="tarj"><h2>Lo que ven las empresas de ti</h2><p class="ayuda" style="margin:0 0 12px">Razón social, RUC, rubro y zonas los pone OBRASST al firmar el acuerdo. Lo demás lo cambias tú' + (adm ? '' : ' (el administrador)') + '.</p>' +
      '<dl style="display:grid; grid-template-columns:auto 1fr; gap:6px 14px; margin:0 0 14px"><dt class="gris">Razón social</dt><dd style="margin:0">' + esc(a.razon) + '</dd><dt class="gris">RUC</dt><dd style="margin:0">' + esc(a.ruc || '—') + '</dd>' +
      '<dt class="gris">Zonas</dt><dd style="margin:0">' + esc(COT.zonasTxt(a.zonas || [])) + '</dd></dl>' +
      '<div class="campos">' + campo('fi-vende', 'Qué vendes', inp('fi-vende', f.vende, ' maxlength="200"' + (adm ? '' : ' disabled'))) + campo('fi-horario', 'Horario', inp('fi-horario', f.horario, ' maxlength="80"' + (adm ? '' : ' disabled'))) +
      campo('fi-web', 'Web', inp('fi-web', f.web, ' maxlength="120" placeholder="https://"' + (adm ? '' : ' disabled'))) + campo('fi-tel', 'Teléfono de la empresa', inp('fi-tel', f.telefono, ' maxlength="20" inputmode="tel"' + (adm ? '' : ' disabled'))) + '</div>' +
      (adm ? '<button type="button" class="bt" data-a="guardarFicha">Guardar mi ficha</button>' : '') + '<p class="msg" id="fi-msg"></p></div>' +
      '<div class="tarj" id="fi-rnp"><h2>Tu RNP, para las compras del Estado</h2><p class="ayuda">Cargando…</p></div>';
    pintarRnp(adm);
  });
}
/* 2/11/2026 · OBRASST OS · Plan Estado: el RNP lo declara el aliado y OBRASST lo verifica; sale en el cuadro de las compras ≤ 8 UIT */
function pintarRnp(adm){
  rpcCrudo('sst_ali_rnp', { p:{} }).then(function(j){
    var c = $('fi-rnp'); if(!c) return;
    if(!j || !j.ok){ c.querySelector('.ayuda').textContent = 'Todavía no se puede ver aquí.'; return; }
    var r = j.rnp || {};
    c.innerHTML = '<h2>Tu RNP, para las compras del Estado</h2><p class="ayuda" style="margin:0 0 10px">Las entidades ven tu RNP en el cuadro comparativo de sus compras de hasta 8 UIT. Lo declaras tú y OBRASST lo revisa en el registro público.</p>' +
      (r.numero ? '<p style="margin:0 0 10px"><b>' + (r.verificado ? 'Verificado por OBRASST' : 'Declarado · por verificar') + '</b></p>' : '') +
      '<div class="campos">' + campo('fi-rnp-n', 'Número de tu constancia del RNP', inp('fi-rnp-n', r.numero, ' maxlength="20" autocomplete="off"' + (adm ? '' : ' disabled'))) +
      campo('fi-rnp-v', 'Vale hasta', inp('fi-rnp-v', r.vence, ' type="date"' + (adm ? '' : ' disabled'))) + '</div>' +
      (adm ? '<button type="button" class="bt sec" data-a="guardarRnp">Guardar mi RNP</button>' : '') + '<p class="msg" id="fi-rnp-m"></p>';
  });
}
ACC.guardarRnp = function(b){
  b.disabled = true;
  rpcCrudo('sst_ali_rnp_guardar', { p:{ numero:val('fi-rnp-n'), vence:val('fi-rnp-v') } }).then(function(j){
    b.disabled = false; var m = $('fi-rnp-m');
    if(!j || !j.ok){ m.className = 'msg mal'; m.textContent = ({ rnp:'Revisa el número: solo letras, números y guiones.', vence:'Pon la fecha hasta la que vale.' })[j && j.motivo] || mensaje(j); return; }
    pintarRnp(true); toast(j.rnp ? 'Guardado: OBRASST lo revisa y lo marca verificado.' : 'Quitado.');
  });
};
ACC.guardarFicha = function(b){
  b.disabled = true;
  rpcCrudo('sst_ali_ficha_guardar', { p:{ vende:val('fi-vende'), horario:val('fi-horario'), web:val('fi-web'), telefono:val('fi-tel') } }).then(function(j){
    b.disabled = false; var m = $('fi-msg'); m.className = 'msg ' + (j && j.ok ? 'ok' : 'mal'); m.textContent = j && j.ok ? 'Guardado.' : mensaje(j);
  });
};

/* ══ SEGURIDAD: registro, equipo, 2FA, bóveda del PSE, configuración y exportar ══ */
PINTAR.seguridad = function(sub){
  sub = sub || 'registro';
  $('vista').innerHTML = cabecera('seguridad', [['registro', 'Registro'], ['equipo', 'Equipo'], ['dosfa', 'Mi 2FA'], ['boveda', 'Bóveda SUNAT'], ['config', 'Configuración'], ['exportar', 'Exportar']], sub) +
    '<p class="ayuda" id="cargando">Cargando…</p>';
  ({ registro:segRegistro, equipo:segEquipo, dosfa:segDosfa, boveda:segBoveda, config:segConfig, exportar:segExportar })[sub]();
};
function fuera(j){ if(pide2FA(j)) return; var c = $('cargando'); if(c) c.outerHTML = '<div class="aviso mal">' + esc(mensaje(j)) + '</div>'; }
function segRegistro(){
  var f = ERP.cache.regFiltro || '';
  rpc('erp_auditoria', { severidad:f }).then(function(j){
    if(!j || !j.ok) return fuera(j);
    var r = j.resumen || {};
    $('cargando').outerHTML = '<div class="grilla"><div class="kpi"><small>Críticas (7 días)</small><b class="' + (r.criticas_7d ? 'margen-bajo' : '') + '">' + num(r.criticas_7d) + '</b><span>datos personales bloqueados, suspensiones</span></div>' +
      '<div class="kpi"><small>Avisos (7 días)</small><b>' + num(r.avisos_7d) + '</b><span>ajustes, anulaciones, topes, exportaciones</span></div></div>' +
      '<div class="filtros">' + [['', 'Todo'], ['critica', 'Críticas'], ['aviso', 'Avisos'], ['info', 'Info']].map(function(x){ return '<button type="button" data-a="filtroReg" data-id="' + x[0] + '" class="' + (x[0] === f ? 'on' : '') + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>' +
      tabla([{ t:'Hora', k:function(x){ return esc(new Date(x.t).toLocaleString('es-PE')); } }, { t:'Quién', k:function(x){ return esc(x.quien || '—') + '<span class="sub">' + esc(x.rol || '') + '</span>'; } },
        { t:'Acción', k:function(x){ return pill(x.accion, x.severidad === 'critica' ? 'mal' : x.severidad === 'aviso' ? 'med' : '') + '<span class="sub">' + esc([x.entidad, x.id].filter(Boolean).join(' · ')) + '</span>'; } },
        { t:'Detalle', k:function(x){ return '<span class="chico mono">' + esc(JSON.stringify(x.despues || {}).slice(0, 160)) + '</span>'; } },
        { t:'IP · navegador', k:function(x){ return esc(x.ip || '—') + '<span class="sub">' + esc(x.navegador || '') + '</span>'; } }], j.lista, { vacio:'Sin registros' }) +
      '<p class="ayuda">El registro solo se agrega: nadie (ni OBRASST) lo cambia ni lo borra.</p>';
  });
}
ACC.filtroReg = function(b){ ERP.cache.regFiltro = b.getAttribute('data-id'); PINTAR.seguridad('registro'); };
function segEquipo(){
  rpc('erp_usuarios').then(function(j){
    if(!j || !j.ok) return fuera(j);
    $('cargando').outerHTML = '<div class="acciones" style="margin:0 0 12px"><button type="button" class="bt" data-a="invitar">Invitar a alguien</button><span class="ayuda">' + (j.max ? 'Tu plan: hasta ' + j.max + ' usuarios.' : 'Tu plan: usuarios sin tope.') + '</span></div>' +
      tabla([{ t:'Nombre', k:function(u){ return esc(u.nombre || '—') + (u.yo ? ' ' + pill('tú', 'az') : '') + '<span class="sub">' + esc(u.correo || '') + '</span>'; } },
        { t:'Papel', k:function(u){ return u.yo ? esc(u.papel) : sel('pa-' + u.uid, [['admin', 'Administrador'], ['vendedor', 'Vendedor'], ['almacenero', 'Almacenero'], ['chofer', 'Chofer']], u.papel, ' data-uid="' + esc(u.uid) + '" class="cambia-papel"'); } },
        { t:'Acceso', k:function(u){ return u.yo ? pill('activo', 'ok') : '<button type="button" class="bt mini ' + (u.activo ? 'mal' : 'sec') + '" data-a="cortar" data-id="' + esc(u.uid) + '" data-v="' + (u.activo ? '0' : '1') + '">' + (u.activo ? 'Cortar acceso' : 'Devolver acceso') + '</button>'; } }], j.lista) +
      (j.invitaciones.length ? '<p class="ayuda">Invitaciones abiertas: ' + j.invitaciones.map(function(i){ return esc(i.papel) + ' (…' + esc(i.token4) + ', vence ' + fecha(i.vence) + ')'; }).join(', ') + '</p>' : '');
    [].forEach.call(document.querySelectorAll('.cambia-papel'), function(s){ s.onchange = function(){ rpc('erp_usuario_cambiar', { uid:s.getAttribute('data-uid'), papel:s.value }).then(function(r){ toast(r && r.ok ? 'Papel cambiado.' : mensaje(r)); }); }; });
  });
}
ACC.invitar = function(){
  hoja({ titulo:'Invitar a alguien de tu equipo', html:campo('in-papel', 'Papel', sel('in-papel', [['vendedor', 'Vendedor: cotiza y vende a su cartera, sin costos'], ['almacenero', 'Almacenero: stock y despachos, sin precios'],
    ['chofer', 'Chofer: solo sus entregas'], ['admin', 'Administrador: todo (con 2FA)']], 'vendedor')) + '<div id="in-res"></div>',
    botones:[{ t:'Cerrar', c:'sec' }, { t:'Crear el enlace', a:function(api){ api.ocupado(true); rpc('erp_usuario_invitar', { papel:val('in-papel') }).then(function(j){ api.ocupado(false);
      if(!j || !j.ok){ api.msg(mensaje(j)); return; }
      $('in-res').innerHTML = '<div class="aviso ok">Mándale este enlace (vale 7 días y una sola vez):</div><div class="acciones"><input readonly id="in-enlace" class="mono" value="' + esc(j.enlace) + '"><button type="button" class="bt sec mini" data-a="copiar" data-id="in-enlace">Copiar</button></div>'; }); } }] });
};
ACC.cortar = function(b){
  var act = b.getAttribute('data-v') === '1';
  guarda(null, rpc('erp_usuario_cambiar', { uid:b.getAttribute('data-id'), activo:act }), act ? 'Acceso devuelto.' : 'Acceso cortado: ya no entra.', function(){ PINTAR.seguridad('equipo'); });
};
function segDosfa(){
  factores().then(function(fs){
    var v = fs.filter(function(f){ return f.status === 'verified'; });
    $('cargando').outerHTML = '<div class="tarj"><h2>Verificación en dos pasos</h2>' + (v.length ? '<div class="aviso ok">Activa en esta cuenta (' + esc(v[0].friendly_name || 'TOTP') + '). Tu sesión: ' + esc(ERP.yo.aal === 'aal2' ? 'verificada' : 'sin verificar') + '.</div>' +
      (ERP.yo.papel === 'admin' ? '<p class="ayuda">Como administrador, el ERP te la pide siempre.</p>' : '<button type="button" class="bt mal" data-a="quitar2fa" data-id="' + esc(v[0].id) + '">Quitarla</button>') :
      '<p class="ayuda" style="margin:0 0 10px">Recomendada para todos; obligatoria para el administrador.</p><button type="button" class="bt" data-a="activar2fa">Activarla</button>') + '</div>';
  }, function(e){ $('cargando').outerHTML = '<div class="aviso mal">' + esc(authMsg(e)) + '</div>'; });
}
ACC.activar2fa = function(){ pantalla2FA(); };
ACC.quitar2fa = function(b){ authReq('DELETE', 'factors/' + b.getAttribute('data-id')).then(function(){ toast('Verificación quitada.'); PINTAR.seguridad('dosfa'); }, function(e){ toast(authMsg(e)); }); };
function segBoveda(){
  var p = ERP.yo.pse || {};
  $('cargando').outerHTML = '<div class="tarj"><h2>Tu PSE (para emitir comprobantes y guías con valor)</h2>' +
    '<div class="aviso ' + (p.boveda ? 'ok' : 'ojo') + '">' + (p.boveda ? 'Conectado: <b>' + esc(p.proveedor) + '</b> en modo <b>' + esc(p.modo) + '</b>.' :
      '<b>Hoy todo sale en PRUEBA</b> (simulador de OBRASST, sin valor tributario). Para emitir de verdad necesitas una cuenta en un PSE (proveedor de servicios electrónicos) y poner aquí su ruta y su token.') + '</div>' +
    '<p class="ayuda" style="margin:0 0 12px">OBRASST <b>nunca</b> guarda tu Clave SOL. El token del PSE se cifra (AES-256-GCM) en el servidor apenas llega y solo se descifra en memoria para enviar cada documento.</p>' +
    (ERP.yo.papel === 'admin' ? '<div class="campos">' + campo('bo-prov', 'Proveedor', sel('bo-prov', [['nubefact', 'Nubefact']], 'nubefact')) + campo('bo-modo', 'Modo', sel('bo-modo', [['prueba', 'Prueba (cuenta demo del PSE)'], ['produccion', 'Producción']], p.modo === 'produccion' ? 'produccion' : 'prueba')) + '</div>' +
      campo('bo-ruta', 'Ruta que te da el PSE', inp('bo-ruta', '', ' placeholder="https://api.nubefact.com/api/v1/…" maxlength="200" autocomplete="off"')) +
      campo('bo-tok', 'Token', '<input id="bo-tok" type="password" maxlength="400" autocomplete="off">', 'Se envía cifrado por HTTPS y no vuelve a mostrarse.') +
      '<button type="button" class="bt" data-a="guardarBoveda">Guardar en la bóveda</button><p class="msg" id="bo-msg"></p>' : '<p class="ayuda">Solo el administrador conecta el PSE.</p>') + '</div>';
}
ACC.guardarBoveda = function(b){
  var m = $('bo-msg'); b.disabled = true; m.className = 'msg'; m.textContent = 'Cifrando y guardando…';
  edge('/boveda', { proveedor:val('bo-prov'), ruta:val('bo-ruta'), token:$('bo-tok').value, modo:val('bo-modo') }).then(function(j){
    b.disabled = false; $('bo-tok').value = '';
    if(!j || !j.ok){ m.className = 'msg mal'; m.textContent = mensaje(j); return; }
    m.className = 'msg ok'; m.textContent = 'Guardado y cifrado.'; rpc('erp_yo').then(function(y){ if(y && y.ok){ ERP.yo = y; $('b-prueba').hidden = !(y.pse && y.pse.modo === 'prueba'); } });
  });
};
function segConfig(){
  rpc('erp_config_ver').then(function(j){
    if(!j || !j.ok) return fuera(j);
    var c = j.config, s = c.series || {};
    $('cargando').outerHTML = '<div class="tarj"><h2>Series de tus comprobantes y guías</h2><div class="campos">' + [['01', 'Factura'], ['03', 'Boleta'], ['07F', 'Nota de crédito (factura)'], ['07B', 'Nota de crédito (boleta)'],
        ['08F', 'Nota de débito (factura)'], ['08B', 'Nota de débito (boleta)'], ['09', 'Guía de remisión remitente'], ['31', 'Guía transportista']].map(function(x){ return campo('se-' + x[0], x[1], inp('se-' + x[0], s[x[0]], ' maxlength="4" class="mono"')); }).join('') + '</div></div>' +
      '<div class="tarj"><h2>Punto de partida de las guías</h2><div class="campos">' + campo('cf-pubi', 'Ubigeo (INEI, 6 números)', inp('cf-pubi', c.partida && c.partida.ubigeo, ' maxlength="6" inputmode="numeric"')) + '</div>' +
      campo('cf-pdir', 'Dirección', inp('cf-pdir', c.partida && c.partida.direccion, ' maxlength="200"')) + '</div>' +
      '<div class="tarj"><h2>Reglas de venta</h2><div class="campos">' + campo('cf-desc', 'Descuento máximo del vendedor (%)', inp('cf-desc', c.desc_max && c.desc_max.vendedor, ' inputmode="decimal"')) +
      campo('cf-cred', 'Costo del dinero (% mensual)', inp('cf-cred', c.costo_credito, ' inputmode="decimal"'), 'Para el margen neto de las ventas a crédito.') +
      campo('cf-bloq', 'Bloquear crédito con deuda vencida de más de (días)', inp('cf-bloq', c.dias_bloqueo, ' inputmode="numeric"')) + '</div>' +
      campo('cf-fletes', 'Flete por distrito (uno por línea: DEPARTAMENTO/PROVINCIA/DISTRITO = monto sin IGV)', '<textarea id="cf-fletes" rows="4" class="mono">' + esc(Object.keys(c.fletes || {}).map(function(k){ return k + ' = ' + c.fletes[k]; }).join('\n')) + '</textarea>') + '</div>' +
      '<button type="button" class="bt" data-a="guardarConfig">Guardar la configuración</button><p class="msg" id="cf-msg"></p>';
  });
}
ACC.guardarConfig = function(b){
  var series = {}, fletes = {};
  ['01', '03', '07F', '07B', '08F', '08B', '09', '31'].forEach(function(k){ var v = val('se-' + k).toUpperCase(); if(v) series[k] = v; });
  val('cf-fletes').split('\n').forEach(function(l){ var p = l.split('='); if(p.length === 2 && p[0].trim()) fletes[p[0].trim().toUpperCase()] = p[1].trim().replace(',', '.'); });
  var p = { series:series, fletes:fletes, desc_max:{ vendedor:val('cf-desc') }, costo_credito:val('cf-cred'), dias_bloqueo:val('cf-bloq') };
  if(val('cf-pubi') || val('cf-pdir')) p.partida = { ubigeo:val('cf-pubi'), direccion:val('cf-pdir') };
  b.disabled = true;
  rpc('erp_config_guardar', p).then(function(j){ b.disabled = false; var m = $('cf-msg'); m.className = 'msg ' + (j && j.ok ? 'ok' : 'mal'); m.textContent = j && j.ok ? 'Guardado.' : mensaje(j); });
};
function segExportar(){
  $('cargando').outerHTML = '<div class="tarj"><h2>Exportar a Excel</h2><p class="ayuda" style="margin:0 0 12px">Solo el administrador exporta, y cada exportación queda en el registro. Los textos que empiezan con = + − @ se guardan como texto (sin fórmulas).</p>' +
    '<div class="acciones"><button type="button" class="bt sec" data-a="exportar" data-id="stock">Stock por lote</button><button type="button" class="bt sec" data-a="exportar" data-id="ventas">Ventas (31 días)</button><button type="button" class="bt sec" data-a="exportar" data-id="cxc">Cuentas por cobrar</button></div></div>';
}
ACC.exportar = function(b){
  var q = b.getAttribute('data-id'); b.disabled = true;
  rpc('erp_exportar', { que:q }).then(function(j){
    b.disabled = false;
    if(!j || !j.ok){ toast(mensaje(j)); return; }
    docs().then(function(D){ D.xlsx('OBRASST-' + q + '-' + hoyLima() + '.xlsx', q, j.cabecera, j.filas); });
  });
};

arrancar();
