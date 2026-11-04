/* OBRASST · V7 (2/11/2026): la página pública de un aliado, obrasstapp.com/a/CODIGO (o aliado.html?c=CODIGO). La responde el
   servidor (sst_ali_web, abierta a cualquiera) solo si el aliado la publicó y su plan la trae. Lo que hace sale de su rubro
   (erp-srv-catalogo.js: el mismo catálogo de su sistema); pedirle una cotización va por el Marketplace SST de OBRASST. */
'use strict';
(function(){
  var SB = { url:'https://gwjjkknuiumgysezeatz.supabase.co', key:'sb_publishable_7fLOMEbxMHW9ButihszpoQ_gkfNKnnx' };
  var m = document.getElementById('m');
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); };
  var f = function(d){ if(!d) return ''; var p = String(d).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : esc(d); };
  var DEPS = ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
              'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'];
  var clave = function(d){ return String(d).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(); };
  var depN = function(z){ var x = DEPS.filter(function(d){ return clave(d) === z; })[0]; return x || z; };
  /* el rubro del aliado → el del Marketplace (las clínicas de EMO son «salud»; la capacitación va con el consultor) */
  var MKT = { epp:'epp', sctr:'sctr', salud:'emo', medico:'emo', consultor:'consultor', capacitacion:'consultor', residuos:'residuos', maquinaria:'maquinaria',
              izaje:'izaje', laboratorio:'laboratorio', transporte:'transporte', saneamiento:'saneamiento' };
  var RUB = { epp:'EPP y consignación en obra', sctr:'SCTR', emo:'Exámenes médicos ocupacionales (EMO)', consultor:'Consultoría y capacitación SSOMA',
              residuos:'Residuos (EO-RS) y reciclaje', maquinaria:'Maquinaria pesada', izaje:'Izajes, andamios y extintores', laboratorio:'Monitoreos y calibración',
              transporte:'Transporte de personal', saneamiento:'Saneamiento y catering' };
  var cod = ((/^\/a\/([A-Za-z0-9-]{3,20})\/?$/.exec(location.pathname) || [])[1] || (/[?&]c=([A-Za-z0-9-]{3,20})(&|$)/.exec(location.search) || [])[1] || '').toUpperCase();
  function nada(t, p){ m.innerHTML = '<main class="ancho"><div class="tarj"><h1 style="font-size:22px">' + esc(t) + '</h1><p class="gris" style="margin-top:6px">' + esc(p) + '</p>' +
    '<p class="bts" style="margin-top:14px"><a class="bt casco" href="/marketplace.html">Buscar otros proveedores verificados</a></p></div></main>'; }
  if(!cod){ nada('Enlace no válido', 'Revisa la dirección: es obrasstapp.com/a/ y el código del aliado.'); return; }
  /* lo que hace, con el mismo catálogo de su sistema (EPP tiene el suyo) */
  function hace(d){
    var C = window.SRV_CATALOGO || {}, v = (C.verticales || []).filter(function(x){ return x.k === d.vertical; })[0];
    if(!v) return d.rubro === 'epp' ? ['Cotiza y despacha EPP con su ficha técnica y su certificado', 'Guías de remisión y dossier de calidad con QR', 'Consignación de EPP en tu obra, descontada por tus entregas'] : [];
    var certs = v.certificados || {};
    return (v.ordenes || []).map(function(o){ var c = o.certificado && certs[o.certificado]; return o.n + (c ? ' → ' + c.n + ' con QR de verificación' : ''); })
      .concat((v.activos || []).length ? ['Controla ' + String((v.menu || {}).activos || 'sus activos').toLowerCase() + ' con sus documentos y su QR'] : []);
  }
  fetch(SB.url + '/rest/v1/rpc/sst_ali_web', { method:'POST', headers:{ apikey:SB.key, Authorization:'Bearer ' + SB.key, 'Content-Type':'application/json' }, body:JSON.stringify({ p_codigo:cod }) })
    .then(function(r){ return r.json().catch(function(){ return null; }); }).then(function(d){
      if(!d || !d.ok){ nada('Esta página no está publicada', 'El aliado no la tiene publicada en este momento. En OBRASST encuentras a otros proveedores verificados de tu zona.'); return; }
      var rk = MKT[d.rubro] || '', z = d.zonas || [], todo = z.indexOf('*') >= 0, deps = todo ? 'Todo el Perú' : z.map(depN).join(', ');
      var dep = todo ? '' : (z[0] || ''), web = /^https?:\/\/[^\s]+\.[^\s]+$/i.test(d.web || '') ? d.web : '', tel = /^[0-9+() -]{6,30}$/.test(d.telefono || '') ? d.telefono : '';
      var logo = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(d.logo || '') ? d.logo : '', L = hace(d);
      var pedir = '/marketplace.html?r=' + encodeURIComponent(rk) + (dep ? '&d=' + encodeURIComponent(depN(dep)) : '') + '&ali=' + encodeURIComponent(d.codigo);
      document.title = d.nombre + ' · Aliado de OBRASST';
      m.innerHTML = '<section class="portada"><div class="ancho"><div class="cab">' + (logo ? '<img class="logo" src="' + esc(logo) + '" alt="">' : '') +
        '<div><p class="rub">' + esc(RUB[rk] || 'Proveedor') + '</p><h1>' + esc(d.nombre) + '</h1>' +
        (d.verificado ? '<span class="sello"><i aria-hidden="true">✓</i>Verificado por OBRASST: RUC y acuerdo firmado</span>' : '') + '</div></div></div></section>' +
        '<main class="ancho">' +
        (d.vende ? '<div class="tarj"><h2>Lo que ofrece</h2><p class="vende">' + esc(d.vende) + '</p></div>' : '') +
        (L.length ? '<div class="tarj"><h2>Cómo trabaja con OBRASST</h2><ul class="hace">' + L.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
          '<p class="gris chico" style="margin-top:8px">Sus certificados y equipos llevan un QR que cualquiera verifica en obrasstapp.com.</p></div>' : '') +
        '<div class="tarj"><h2>Datos</h2><dl>' + '<dt>Razón social</dt><dd>' + esc(d.razon) + '</dd>' + (d.ruc ? '<dt>RUC</dt><dd>' + esc(d.ruc) + '</dd>' : '') +
          '<dt>Atiende en</dt><dd>' + esc(deps || '—') + '</dd>' + (d.horario ? '<dt>Horario</dt><dd>' + esc(d.horario) + '</dd>' : '') +
          (tel ? '<dt>Teléfono</dt><dd><a href="tel:' + esc(tel.replace(/[^0-9+]/g, '')) + '">' + esc(tel) + '</a></dd>' : '') +
          (web ? '<dt>Web</dt><dd><a href="' + esc(web) + '" target="_blank" rel="noopener nofollow">' + esc(web.replace(/^https?:\/\//i, '')) + '</a></dd>' : '') +
          (d.rnp ? '<dt>RNP</dt><dd>' + esc(d.rnp.numero) + ' · vigente hasta el ' + f(d.rnp.vence) + ' (verificado por OBRASST)</dd>' : '') +
          (d.desde ? '<dt>Aliado desde</dt><dd>' + f(d.desde) + '</dd>' : '') + '</dl></div>' +
        '<div class="tarj"><h2>Pedirle una cotización</h2><p class="gris" style="margin-bottom:12px">El pedido va por OBRASST: queda en tu cuenta y ves cuándo te conectamos.</p>' +
          '<p class="bts"><a class="bt casco" href="' + esc(pedir) + '" id="al-pedir">Pedir cotización</a><a class="bt linea" href="/index.html?aliado=' + encodeURIComponent(d.codigo) + '#crear">Crear la cuenta de mi empresa</a></p></div>' +
        '</main>';
    }, function(){ nada('No se pudo cargar', 'Revisa tu conexión y vuelve a intentarlo.'); });
})();
