/* OBRASST · la página pública del QR de una guía: el dossier de calidad (lotes y certificados), sin datos de personas. (2/11/2026) */
'use strict';
(function(){
  var m = document.getElementById('m'), k = (/[?&]k=([0-9a-f]{32})(&|$)/.exec(location.search) || [])[1];
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); };
  var f = function(d){ if(!d) return '—'; var p = String(d).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : esc(d); };
  if(!k){ m.innerHTML = '<h1>Enlace no válido</h1><p class="gris">Escanea otra vez el QR de la guía.</p>'; return; }
  fetch('https://gwjjkknuiumgysezeatz.supabase.co/functions/v1/erp/dossier?k=' + k).then(function(r){ return r.json(); }).then(function(d){
    if(!d || !d.ok){ m.innerHTML = '<h1>No encontramos este dossier</h1><p class="gris">La guía pudo anularse. Consulta a tu proveedor.</p>'; return; }
    var hoy = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
    m.innerHTML = '<h1>Dossier de calidad · guía ' + esc(d.guia) + '</h1><p class="gris">' + esc(d.distribuidor && d.distribuidor.razon) + (d.distribuidor && d.distribuidor.ruc ? ' · RUC ' + esc(d.distribuidor.ruc) : '') + ' · traslado del ' + f(d.fecha) + (d.cliente ? ' · para ' + esc(d.cliente) : '') + '</p>' +
      (d.modo === 'prueba' ? '<p class="aviso">Esta guía se emitió en <b>modo de prueba</b> (sin valor tributario).</p>' : '') +
      '<div class="tarj"><h2>Lo que llegó</h2><div class="tabla"><table><thead><tr><th>Código</th><th>Producto</th><th>Lote</th><th>Vence</th><th class="num">Cant.</th></tr></thead><tbody>' +
      (d.lineas || []).map(function(l){ return '<tr><td class="mono">' + esc(l.sku) + '</td><td>' + esc(l.d) + '</td><td class="mono">' + esc(l.lote || '—') + '</td><td>' + f(l.vence) + '</td><td class="num">' + esc(l.c) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="tarj"><h2>Certificados</h2>' + ((d.certificados || []).length ? '<div class="tabla"><table><thead><tr><th>Producto</th><th>Documento</th><th>Norma</th><th>Vigencia</th><th></th></tr></thead><tbody>' +
      d.certificados.map(function(c){ return '<tr><td>' + esc(c.producto) + (c.lote ? '<br><span class="gris">lote ' + esc(c.lote) + '</span>' : '') + '</td><td>' + esc({ certificado:'Certificado', ficha_tecnica:'Ficha técnica', ensayo:'Informe de ensayo', declaracion:'Declaración del fabricante' }[c.tipo] || c.tipo) +
        (c.emisor || c.numero ? '<br><span class="gris">' + esc([c.emisor, c.numero].filter(Boolean).join(' · ')) + '</span>' : '') + '</td><td>' + esc(c.norma || '—') + '</td><td>' +
        (c.vence ? '<span class="pill ' + (c.vence >= hoy ? 'ok' : 'mal') + '">' + (c.vence >= hoy ? 'hasta ' : 'venció ') + f(c.vence) + '</span>' : '—') + '</td><td>' + (/^https:\/\//.test(c.url || '') ? '<a class="bt" href="' + esc(c.url) + '" target="_blank" rel="noopener">Ver</a>' : '') + '</td></tr>'; }).join('') +
      '</tbody></table></div><p class="gris" style="margin-top:8px">Los enlaces vencen a los 10 minutos: si uno ya no abre, recarga esta página.</p>' : '<p class="gris">El proveedor todavía no cargó certificados para estos productos.</p>') + '</div>';
  }, function(){ m.innerHTML = '<h1>Sin conexión</h1><p class="gris">Revisa tu internet y vuelve a escanear.</p>'; });
})();
