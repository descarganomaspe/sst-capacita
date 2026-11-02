/* OBRASST · aliados.html · V7 (2/11/2026): los 10 sistemas (uno por rubro, con su estado según el interruptor de OBRASST OS) y el
   ejemplo en un celular con las 4 pestañas de abajo del ERP (Bandeja · Campo o Despachos · Caja · Mi QR y web). Todo lo que se ve
   en el celular es un EJEMPLO INVENTADO y lo dice; los nombres del menú de cada rubro salen de su catálogo (erp-srv-catalogo.js). */
'use strict';
window.OS_SB = window.OS_SB || { url:'https://gwjjkknuiumgysezeatz.supabase.co', key:'sb_publishable_7fLOMEbxMHW9ButihszpoQ_gkfNKnnx' };
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); };
  var C = window.SRV_CATALOGO || { verticales:[] }, V = {};
  (C.verticales || []).forEach(function(v){ V[v.k] = v; });
  var IC = {
    bandeja:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h4.5l1.5 3h4l1.5-3H20"/><path d="M6 5h12l2 8v6H4v-6z"/></svg>',
    campo:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3.5h6v3H9z"/><path d="m9 13 2 2 4-4"/></svg>',
    despacho:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    caja:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5h.01M17.5 14.5h.01"/></svg>',
    web:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 19h2M19 14h1"/></svg>' };
  var EMP = ['Constructora Ejemplo S.A.C.', 'Minera Ejemplo S.A.', 'Industrial Ejemplo S.A.C.'];
  var CAJA_SRV = [['Valorizado este mes', 'S/ 24,000.00'], ['Facturado (con IGV)', 'S/ 28,320.00'], ['Por cobrar', 'S/ 9,440.00'], ['Billetera de comisiones', 'S/ 44.85']];
  /* los 10, en el orden del Marketplace SST. pide: lo que llega a la bandeja; reg: lo que se llena en campo (o el despacho, en EPP) */
  var R = [
    { k:'epp', n:'EPP y consignación en obra', f:'aliado_epp', hace:'Almacén con lotes, ventas, compras, guías de remisión, dossier de calidad con QR y consignación en la obra del cliente (VMI).',
      pide:['Cotización · 40 cascos y 60 pares de guantes', 'Reposición en consignación · 3 ítems bajo el mínimo', 'Pedido grupal · 120 respiradores'],
      reg:{ t:'Guía de remisión EG01-000123', l:[['Lleva', '40 cascos · 60 pares de guantes'], ['Dossier de calidad', 'Ficha técnica y certificado, con QR'], ['Estado', 'Recibido en almacén']] },
      caja:[['Facturado este mes', 'S/ 18,400.00'], ['Por cobrar', 'S/ 6,200.00'], ['En consignación (VMI)', '128 unidades'], ['Billetera de comisiones', 'S/ 44.85']] },
    { k:'sctr', n:'SCTR', reg:{ t:'Declaración de noviembre', l:[['Altas / bajas', '12 / 3'], ['Asegurados', '86'], ['Sale', 'Constancia del periodo con QR']] } },
    { k:'emo', n:'Exámenes médicos (EMO)', reg:{ t:'Atención de EMO', l:[['Protocolo', 'Ingreso · trabajo en altura'], ['Atendidos hoy', '18'], ['Sale', 'Solo la aptitud y su vigencia, nunca diagnósticos']] } },
    { k:'consultor', n:'Consultoría y capacitación SSOMA', reg:{ t:'Capacitación: trabajo en altura (8 h)', l:[['Participantes', '24 · nota mínima 14'], ['Aprobados', '22'], ['Sale', 'Certificado de cada uno, con su vigencia y QR']] } },
    { k:'residuos', n:'Residuos (EO-RS) y reciclaje', reg:{ t:'Recojo en obra', l:[['Peligrosos', '320 kg · con manifiesto'], ['No peligrosos', '1.2 t'], ['Sale', 'Constancia de disposición con QR']] } },
    { k:'maquinaria', n:'Maquinaria pesada', reg:{ t:'Excavadora EX-01', l:[['Pre-uso', '18 de 18 conformes: habilitada'], ['Parte diario', '9.5 h trabajadas · 0.5 h stand-by'], ['Sale', 'Ficha del equipo con QR']] } },
    { k:'izaje', n:'Izajes, andamios y extintores', reg:{ t:'Inspección de eslinga sintética de 2 t', l:[['Ramales y ángulo', '2 ramales · 60°'], ['Carga segura', '3.46 t'], ['Sale', 'Certificado con firma y QR']] } },
    { k:'laboratorio', n:'Monitoreos y calibración', reg:{ t:'Monitoreo de ruido', l:[['Puntos', '6'], ['Dosis más alta', '112 %: sobre el criterio'], ['Sale', 'Informe con firma y QR']] } },
    { k:'transporte', n:'Transporte de personal', reg:{ t:'Viaje en camioneta 4x4', l:[['Inspección del vehículo', 'Conforme'], ['Conductor', 'Descanso mínimo y alcohol cero: conforme'], ['Sale', 'Conformidad del viaje con QR']] } },
    { k:'saneamiento', n:'Saneamiento y catering', reg:{ t:'Desinfección de reservorio de 10 m³', l:[['Cloro', 'Litros calculados para 50 ppm'], ['Cebaderas', '12 revisadas'], ['Sale', 'Certificado con firma y QR']] } }];
  R.forEach(function(r){
    var v = V[r.k]; if(!v) return;
    r.f = v.flag; r.campo = v.campo; r.menu = v.menu || {};
    var o = v.ordenes || [], ac = v.activos || [];
    r.hace = r.hace || ((r.menu.activos || 'Activos') + ' con su QR y sus documentos, ' + String(r.menu.ordenes || 'órdenes').toLowerCase() + ', lo que se llena en campo y ' + String(r.menu.certificados || 'certificados').toLowerCase() + ' con verificación pública.');
    r.pide = r.pide || (o.length ? [0, 1, 2].map(function(i){ var x = o[i % o.length], a = ac[i % (ac.length || 1)]; return x.n + (a ? ' · ' + a.n : ''); }) : []);
  });
  /* ── los 10 sistemas, con su estado (el interruptor de cada rubro en OBRASST OS) ── */
  var S = $('sis-rubros');
  if(S) S.innerHTML = R.map(function(r){ return '<div class="si" data-os-rubro-flag="' + esc(r.f || '') + '"><h3>' + esc(r.n) + '</h3><p>' + esc(r.hace) + '</p><span class="disp luego">Se activa con OBRASST</span></div>'; }).join('');
  document.addEventListener('os-flags', function(){
    [].forEach.call(document.querySelectorAll('.si[data-os-rubro-flag]'), function(el){
      var on = el.getAttribute('data-activo') === 'si', d = el.querySelector('.disp');
      d.className = 'disp' + (on ? '' : ' luego'); d.textContent = on ? 'Disponible' : 'Se activa con OBRASST';
    });
  });
  /* ── el ejemplo en el celular ── */
  var B = $('demo-rub'), T = $('demo-tabs'), Q = $('demo-cuerpo'); if(!B || !T || !Q) return;
  var est = { rubro:'maquinaria', tab:'bandeja' };
  function rub(){ return R.filter(function(r){ return r.k === est.rubro; })[0] || R[0]; }
  function tabs(){
    var r = rub(), srv = r.k !== 'epp';
    var L = [['bandeja', 'Bandeja', 'bandeja'], ['accion', srv ? 'Campo' : 'Despachos', srv ? 'campo' : 'despacho'], ['caja', 'Caja', 'caja'], ['web', 'Mi QR y web', 'web']];
    T.innerHTML = L.map(function(x){ var on = x[0] === est.tab; return '<button type="button" role="tab" data-t="' + x[0] + '" aria-selected="' + on + '">' + IC[x[2]] + '<span>' + esc(x[1]) + '</span></button>'; }).join('');
  }
  function pinta(){
    var r = rub(), h = '<span class="ej">Ejemplo</span>';
    $('demo-sub').textContent = 'ERP · ' + r.n;
    if(est.tab === 'bandeja'){
      h += '<h4>Bandeja</h4><div class="cel-k"><div><small>Respondidas</small><b>9 de 10</b></div><div><small>Ganadas este mes</small><b>4</b></div></div>' +
        r.pide.map(function(p, i){ return '<div class="cel-t"><span class="est' + (i === 0 ? ' n' : '') + '">' + (i === 0 ? 'Nueva' : i === 1 ? 'Respondida' : 'Ganaste') + '</span><b>' + esc(EMP[i]) + '</b><small>' + esc(p) + '</small></div>'; }).join('');
    } else if(est.tab === 'accion'){
      h += '<h4>' + esc(r.k === 'epp' ? 'Despachos' : 'Campo' + (r.campo ? ' · ' + r.campo : '')) + '</h4><div class="cel-t"><b>' + esc(r.reg.t) + '</b>' +
        r.reg.l.map(function(x){ return '<small><b style="display:inline">' + esc(x[0]) + ':</b> ' + esc(x[1]) + '</small>'; }).join('') + '</div>' +
        '<small style="color:var(--gris)">' + esc(r.k === 'epp' ? 'Desde el celular: la ruta, la guía y la prueba de entrega.' : 'En la obra, desde el celular: con fotos, sin ubicación salvo que la marques; el cálculo sale en vivo.') + '</small>';
    } else if(est.tab === 'caja'){
      h += '<h4>Caja</h4><div class="cel-k">' + (r.caja || CAJA_SRV).map(function(x){ return '<div><small>' + esc(x[0]) + '</small><b>' + esc(x[1]) + '</b></div>'; }).join('') + '</div>' +
        '<small style="color:var(--gris)">Comprobantes, cobranzas y tu billetera de comisiones, que se descuenta sola de tu plan.</small>';
    } else {
      h += '<h4>Mi QR y web</h4><div class="cel-t"><span class="est">Publicada</span><b>Tu página</b><small>obrasstapp.com/a/ALI-EJEMPLO</small></div>' +
        '<div class="cel-qr">Aquí sale el QR de tu página</div><small style="color:var(--gris)">Lo pones en tu local, tus guías y tus cotizaciones. Y desde aquí instalas la app en tu celular.</small>';
    }
    Q.innerHTML = h; tabs();
  }
  var CORTO = { epp:'EPP', sctr:'SCTR', emo:'EMO', consultor:'Consultoría', residuos:'Residuos', maquinaria:'Maquinaria', izaje:'Izaje', laboratorio:'Laboratorio', transporte:'Transporte', saneamiento:'Saneamiento' };
  B.innerHTML = R.map(function(r){ return '<button type="button" data-r="' + r.k + '" aria-pressed="' + (r.k === est.rubro) + '">' + esc(CORTO[r.k] || r.n) + '</button>'; }).join('');
  B.addEventListener('click', function(ev){ var b = ev.target.closest('[data-r]'); if(!b) return; est.rubro = b.getAttribute('data-r');
    [].forEach.call(B.querySelectorAll('[data-r]'), function(x){ x.setAttribute('aria-pressed', String(x === b)); }); pinta(); });
  T.addEventListener('click', function(ev){ var b = ev.target.closest('[data-t]'); if(!b) return; est.tab = b.getAttribute('data-t'); pinta(); });
  pinta();
})();
