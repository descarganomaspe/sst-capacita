/* OBRASST · ERP Distribuidor · operación: almacén (productos, lotes FEFO, ingresos, traslados, kardex, escáner, equivalencias,
   certificados), consignaciones, taller y bordados, despachos con guía, la ruta del chofer con su prueba de entrega y compras. (2/11/2026) */
'use strict';
function pedirTexto(titulo, label, alAceptar){
  hoja({ titulo:titulo, html:campo('pt-t', label, inp('pt-t', '', ' maxlength="200"')),
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Aceptar', a:function(api){ if(!val('pt-t')) return api.msg('Escríbelo.'); alAceptar(val('pt-t'), api); } }] });
}

/* ══ ALMACÉN ══ */
PINTAR.almacen = function(sub){
  var alm = ERP.yo.papel !== 'vendedor', subs = [['productos', 'Productos'], ['lotes', 'Stock por lote']];
  if(alm) subs.push(['ingreso', 'Ingreso'], ['movimientos', 'Kardex']);
  if(alm && tieneModulo('multialmacen')) subs.push(['traslado', 'Traslado']);
  subs.push(['escaner', 'Escáner']);
  if(esAdmin()) subs.push(['almacenes', 'Almacenes']);
  if(tieneModulo('equivalencias') && esAdmin()) subs.push(['equivalencias', 'Equivalencias']);
  if(tieneModulo('dossier') && alm) subs.push(['certificados', 'Certificados']);
  sub = subs.some(function(x){ return x[0] === sub; }) ? sub : 'productos';
  $('vista').innerHTML = cabecera('almacen', subs, sub) + '<p class="ayuda" id="cargando">Cargando…</p>';
  ({ productos:almProductos, lotes:almLotes, ingreso:almIngreso, movimientos:almKardex, traslado:almTraslado, escaner:almEscaner, almacenes:almAlmacenes,
     equivalencias:almEquivalencias, certificados:almCertificados })[sub]();
};
function stockTxt(s){ return s ? num(s.disp) + (s.res ? '<span class="sub">' + num(s.res) + ' reservado</span>' : '') + (s.vencido ? '<span class="sub margen-bajo">' + num(s.vencido) + ' vencido (bloqueado)</span>' : '') : '—'; }
function almProductos(){
  rpc('erp_productos', { q:ERP.cache.qProd || '', todos:true, limite:200 }).then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.prodLista = j.lista;
    var puedeEditar = esAdmin() || ERP.yo.papel === 'almacenero';
    $('cargando').outerHTML = '<div class="filtros">' + (puedeEditar ? '<button type="button" class="bt" data-a="prodNuevo">Nuevo producto</button>' : '') +
      '<input id="q-prod" placeholder="Buscar por nombre, SKU, marca o código de barras" value="' + esc(ERP.cache.qProd || '') + '"><span class="ayuda">' + num(j.total) + ' productos</span></div>' +
      tabla([{ t:'Producto', k:function(p){ return '<b>' + esc(p.nombre) + '</b>' + (p.activo === false ? ' ' + pill('inactivo') : '') + '<span class="sub mono">' + esc(p.sku) + '</span><span class="sub">' + esc([p.marca, p.categoria, ({ servicio:'servicio', kit:'kit' })[p.tipo]].filter(Boolean).join(' · ')) + '</span>'; } },
        { t:'Normas', k:function(p){ return esc((p.normas || []).map(function(n){ return n.n + (n.nivel ? ' ' + n.nivel : ''); }).join(' · ')) || '—'; } },
        { t:'Variantes', k:function(p){ return (p.variantes || []).map(function(v){ return '<span class="pill">' + esc(v.talla || v.color || v.sku) + ' · ' + num(v.stock ? v.stock.disp : 0) + '</span>'; }).join(' '); } },
        { t:'Disponible', n:1, k:function(p){ var s = (p.variantes || []).reduce(function(a, v){ var t = v.stock || {}; a.disp += +t.disp || 0; a.res += +t.res || 0; a.vencido += +t.vencido || 0; return a; }, { disp:0, res:0, vencido:0 }); return p.tipo === 'bien' ? stockTxt(s) : '—'; } }]
        .concat(ERP.yo.papel !== 'almacenero' ? [{ t:'Precio', n:1, k:function(p){ return p.precio_base != null ? soles(p.precio_base) : '—'; } }] : []), j.lista, puedeEditar ? { a:'prodAbrir', vacio:'Sin productos', vacioSub:'Crea el primero.' } : { vacio:'Sin productos' });
    $('q-prod').onkeydown = function(e){ if(e.key === 'Enter'){ ERP.cache.qProd = this.value; PINTAR.almacen('productos'); } };
  });
}
ACC.prodNuevo = function(){ formProducto(null); };
ACC.prodAbrir = function(b){ formProducto((ERP.cache.prodLista || []).filter(function(p){ return p.id === b.getAttribute('data-id'); })[0]); };
function formProducto(p){
  var adm = esAdmin(), det = [['', 'Sin detracción']].concat(tieneModulo('facturacion') ? [['037', '037 · Demás servicios gravados (12 %)'], ['027', '027 · Transporte de bienes (4 %)']] : []);
  var vs = p ? p.variantes : [], nv = 0;
  var filaVar = function(v){ var i = nv++; return '<tr data-v="' + i + '"><td>' + inp('pv-sku' + i, v ? v.sku : '', ' maxlength="40" class="mono" style="min-width:130px"') + (v ? '<input type="hidden" id="pv-id' + i + '" value="' + esc(v.id) + '">' : '') + '</td>' +
    '<td>' + inp('pv-t' + i, v ? v.talla : '', ' maxlength="12" style="max-width:80px"') + '</td><td>' + inp('pv-c' + i, v ? v.color : '', ' maxlength="30" style="max-width:110px"') + '</td><td>' + inp('pv-b' + i, v ? v.barras : '', ' maxlength="40" class="mono"') + '</td>' +
    (adm ? '<td>' + inp('pv-p' + i, v ? v.precio : '', ' inputmode="decimal" placeholder="el del producto" style="max-width:110px"') + '</td>' : '') + '</tr>'; };
  hoja({ titulo:p ? p.nombre : 'Nuevo producto', ancha:true, html:'<div class="campos">' + campo('pf-sku', 'SKU (padre)', inp('pf-sku', p ? p.sku : '', ' maxlength="40" class="mono"')) +
      campo('pf-tipo', 'Tipo', sel('pf-tipo', [['bien', 'Producto'], ['kit', 'Kit (lleva componentes)'], ['servicio', 'Servicio']], p ? p.tipo : 'bien', p ? ' disabled' : '')) +
      campo('pf-u', 'Unidad (SUNAT)', sel('pf-u', [['NIU', 'NIU · unidad'], ['PR', 'PR · par'], ['BX', 'BX · caja'], ['PK', 'PK · paquete'], ['MTR', 'MTR · metro'], ['ZZ', 'ZZ · servicio']], p ? p.unidad : 'NIU')) + '</div>' +
      campo('pf-n', 'Nombre', inp('pf-n', p ? p.nombre : '', ' maxlength="160"')) +
      '<div class="campos">' + campo('pf-marca', 'Marca', inp('pf-marca', p ? p.marca : '', ' maxlength="60"')) + campo('pf-mod', 'Modelo', inp('pf-mod', p ? p.modelo : '', ' maxlength="60"')) +
      campo('pf-cat', 'Categoría', inp('pf-cat', p ? p.categoria : '', ' maxlength="60" placeholder="Cabeza, manos, pies…"')) + (adm ? campo('pf-pre', 'Precio base (sin IGV)', inp('pf-pre', p ? p.precio_base : '', ' inputmode="decimal"')) : '') +
      campo('pf-vida', 'Vida útil (días)', inp('pf-vida', p ? p.vida_util_dias : '', ' inputmode="numeric"'), 'Para la reposición predictiva') +
      campo('pf-ro', 'Punto de reorden', inp('pf-ro', p ? p.punto_reorden : '', ' inputmode="decimal"')) + campo('pf-lc', 'Lote de compra', inp('pf-lc', p ? p.lote_compra : '', ' inputmode="decimal"')) +
      campo('pf-det', 'Detracción (servicios)', sel('pf-det', det, p ? p.detraccion || '' : '')) + '</div>' +
      '<label class="chk"><input type="checkbox" id="pf-vence"' + (p && p.maneja_vence ? ' checked' : '') + '> Lleva fecha de vencimiento por lote (FEFO: sale primero lo que vence antes; lo vencido se bloquea)</label>' +
      campo('pf-normas', 'Normas que cumple (una por línea: «norma | nivel»)', '<textarea id="pf-normas" rows="3" class="mono" placeholder="EN 388:2016 | 4X42C&#10;NIOSH | N95&#10;ANSI/ISEA Z89.1 | Tipo I Clase E">' +
        esc((p ? p.normas : []).map(function(n){ return n.n + (n.nivel ? ' | ' + n.nivel : ''); }).join('\n')) + '</textarea>', 'Escribe la norma tal como la certifica el fabricante; el cotizador compara solo dentro de cada norma.') +
      '<h3 style="font-size:14px; margin:6px 0 6px">Variantes (talla / color)</h3><div class="tabla-caja"><table><thead><tr><th>SKU</th><th>Talla</th><th>Color</th><th>Código de barras</th>' + (adm ? '<th>Precio propio</th>' : '') + '</tr></thead><tbody id="pf-vars">' +
      (vs.length ? vs.map(filaVar).join('') : filaVar(null)) + '</tbody></table></div><button type="button" class="bt sec mini" id="pf-masv">+ Variante</button>' +
      (p && p.tipo === 'kit' ? '<div class="aviso neu" style="margin-top:12px">Componentes del kit: ' + esc((p.kit || []).map(function(k){ return k.c + ' × ' + k.sku; }).join(', ') || 'ninguno todavía') + ' <button type="button" class="bt sec mini" data-a="kitEditar" data-id="' + esc(p.variantes[0].id) + '">Cambiar los componentes</button></div>' : ''),
    alAbrir:function(api){ $('pf-masv').onclick = function(){ $('pf-vars').insertAdjacentHTML('beforeend', filaVar(null)); }; },
    botones:[{ t:'Cancelar', c:'sec' }].concat(p ? [{ t:'Etiquetas QR', c:'sec', a:function(){ docs().then(function(D){ D.etiquetasProducto(p); }); } }] : []).concat([{ t:'Guardar', a:function(api){
      var V = [];
      [].forEach.call(document.querySelectorAll('#pf-vars tr'), function(tr){ var i = tr.getAttribute('data-v'); if(!val('pv-sku' + i)) return;
        var o = { sku:val('pv-sku' + i).toUpperCase(), talla:val('pv-t' + i), color:val('pv-c' + i), barras:val('pv-b' + i) }; if($('pv-id' + i)) o.id = $('pv-id' + i).value; if(adm) o.precio = val('pv-p' + i).replace(',', '.'); V.push(o); });
      var x = { sku:val('pf-sku').toUpperCase(), nombre:val('pf-n'), tipo:val('pf-tipo'), unidad:val('pf-u'), marca:val('pf-marca'), modelo:val('pf-mod'), categoria:val('pf-cat'), vida_util_dias:val('pf-vida'),
        punto_reorden:val('pf-ro').replace(',', '.'), lote_compra:val('pf-lc').replace(',', '.'), detraccion:val('pf-det'), maneja_vence:val('pf-vence'), variantes:V,
        normas:val('pf-normas').split('\n').map(function(l){ var q = l.split('|'); return q[0].trim() ? { n:q[0].trim(), nivel:(q[1] || '').trim() } : null; }).filter(Boolean) };
      if(adm) x.precio_base = val('pf-pre').replace(',', '.');
      if(p) x.id = p.id;
      guarda(api, rpc('erp_producto_guardar', x), 'Producto guardado.', function(j){ catVariantes(true); PINTAR.almacen('productos'); if(!p && j.producto.tipo === 'kit') ACC.kitEditar(null, j.producto.variantes[0].id); }); } }]) });
}
ACC.kitEditar = function(b, id){
  id = id || b.getAttribute('data-id');
  catVariantes(true).then(function(){
    hoja({ titulo:'Componentes del kit', html:listaVar('dl-var') + '<div class="tabla-caja"><table><thead><tr><th>Componente</th><th>Cantidad por kit</th></tr></thead><tbody>' +
      [0, 1, 2, 3, 4, 5].map(function(i){ return '<tr><td>' + inp('kc-v' + i, '', ' list="dl-var"') + '</td><td>' + inp('kc-c' + i, '', ' inputmode="decimal" style="max-width:100px"') + '</td></tr>'; }).join('') + '</tbody></table></div>',
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Guardar', a:function(api){ var C = [];
        for(var i = 0; i < 6; i++){ if(!val('kc-v' + i)) continue; var v = varDe(val('kc-v' + i)); if(!v) return api.msg('«' + val('kc-v' + i) + '» no está en la lista.'); C.push({ v:v.id, c:val('kc-c' + i) || '1' }); }
        guarda(api, rpc('erp_kit_guardar', { kit:id, componentes:C }), 'Kit guardado.', function(){ PINTAR.almacen('productos'); }); } }] });
  });
};
function almLotes(){
  var f = ERP.cache.loteFiltro || '';
  Promise.all([rpc('erp_stock', { estado:f, almacen:ERP.cache.loteAlm || '' }), rpc('erp_almacenes')]).then(function(r){
    var j = r[0]; if(!j || !j.ok) return fuera(j);
    var A = (r[1] && r[1].lista) || [], alm = ERP.yo.papel !== 'vendedor';
    ERP.cache.lotes = j.lista;
    $('cargando').outerHTML = '<div class="filtros">' + [['', 'Todo'], ['por_vencer', 'Vence en 30 días'], ['vencido', 'Vencido (bloqueado)']].map(function(x){ return '<button type="button" data-a="loteFiltro" data-id="' + x[0] + '" class="' + (x[0] === f ? 'on' : '') + '">' + esc(x[1]) + '</button>'; }).join('') +
      (A.length > 1 ? sel('lo-alm', [['', 'Todos los almacenes']].concat(A.map(function(a){ return [a.id, a.codigo + ' · ' + a.nombre]; })), ERP.cache.loteAlm || '', ' style="max-width:260px"') : '') +
      (j.lista.length ? '<button type="button" class="bt sec mini" data-a="lotesEtiquetas">Etiquetas QR de estos lotes</button>' : '') + '</div>' +
      tabla([{ t:'Producto', k:function(l){ return esc(l.producto) + '<span class="sub mono">' + esc(l.sku) + '</span>'; } }, { t:'Almacén', k:function(l){ return esc(l.almacen); } },
        { t:'Lote', k:function(l){ return '<span class="mono">' + esc(l.lote) + '</span>'; } }, { t:'Vence', k:function(l){ return l.vence ? fecha(l.vence) : '—'; } },
        { t:'Cantidad', n:1, k:function(l){ return num(l.cant) + (l.res ? '<span class="sub">' + num(l.res) + ' reservado</span>' : ''); } }].concat(esAdmin() ? [{ t:'Costo', n:1, k:function(l){ return l.costo != null ? soles(l.costo) : ''; } }] : [])
        .concat([{ t:'Estado', k:function(l){ return l.estado === 'vencido' ? pill('vencido · bloqueado', 'mal') : l.estado === 'por_vencer' ? pill('por vencer', 'med') : pill('al día', 'ok'); } }])
        .concat(alm ? [{ t:'', k:function(l){ return '<button type="button" class="bt sec mini" data-a="loteAjuste" data-id="' + esc(l.id) + '">Ajustar</button>'; } }] : []), j.lista, { vacio:'Sin stock aquí' }) +
      '<p class="ayuda">Los pedidos reservan primero lo que vence antes (FEFO). Lo vencido no se reserva ni se despacha.</p>';
    if($('lo-alm')) $('lo-alm').onchange = function(){ ERP.cache.loteAlm = this.value; PINTAR.almacen('lotes'); };
  });
}
ACC.loteFiltro = function(b){ ERP.cache.loteFiltro = b.getAttribute('data-id'); PINTAR.almacen('lotes'); };
ACC.lotesEtiquetas = function(){ docs().then(function(D){ D.etiquetasLotes(ERP.cache.lotes || []); }); };
ACC.loteAjuste = function(b){
  var l = (ERP.cache.lotes || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0]; if(!l) return;
  hoja({ titulo:'Ajuste por conteo · ' + l.sku + ' · lote ' + l.lote, html:'<p class="ayuda" style="margin:0 0 10px">Hoy dice ' + num(l.cant) + (l.res ? ' (' + num(l.res) + ' reservado)' : '') + '. Escribe lo que contaste.</p>' +
      campo('aj-n', 'Contado', inp('aj-n', '', ' inputmode="decimal"')) + campo('aj-m', 'Motivo', inp('aj-m', '', ' maxlength="120" placeholder="Conteo físico, merma, rotura…"')),
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Ajustar', a:function(api){ guarda(api, rpc('erp_ajuste', { lote_id:l.id, contado:val('aj-n').replace(',', '.'), motivo:val('aj-m') }), 'Ajustado (queda en el kardex y en el registro).', function(){ PINTAR.almacen('lotes'); }); } }] });
};
function almIngreso(){
  Promise.all([catVariantes(), rpc('erp_almacenes')]).then(function(r){
    var A = ((r[1] && r[1].lista) || []).filter(function(a){ return a.tipo === 'propio' && a.activo; });
    $('cargando').outerHTML = listaVar('dl-var') + '<div class="tarj"><h2>Ingreso a mano</h2><p class="ayuda" style="margin:0 0 10px">Inventario inicial o una devolución. Las compras entran desde Compras › Órdenes (con su costo puesto en almacén).</p><div class="campos">' +
      campo('ig-v', 'Producto', inp('ig-v', '', ' list="dl-var"')) + campo('ig-c', 'Cantidad', inp('ig-c', '', ' inputmode="decimal"')) + campo('ig-l', 'Lote', inp('ig-l', '', ' maxlength="40" class="mono"')) +
      campo('ig-ve', 'Vence', inp('ig-ve', '', ' type="date"')) + (esAdmin() ? campo('ig-co', 'Costo unitario (sin IGV)', inp('ig-co', '', ' inputmode="decimal"')) : '') +
      (A.length > 1 ? campo('ig-a', 'Almacén', sel('ig-a', A.map(function(a){ return [a.id, a.codigo]; }), A[0].id)) : '') + '</div>' +
      campo('ig-n', 'Nota', inp('ig-n', '', ' maxlength="120"')) + '<button type="button" class="bt" data-a="ingresar">Ingresar</button><p class="msg" id="ig-msg"></p></div>';
  });
}
ACC.ingresar = function(b){
  var v = varDe(val('ig-v')), m = $('ig-msg');
  if(!v){ m.className = 'msg mal'; m.textContent = 'Elige el producto de la lista.'; return; }
  b.disabled = true;
  rpc('erp_ingreso', { variante:v.id, cantidad:val('ig-c').replace(',', '.'), lote:val('ig-l'), vence:val('ig-ve'), costo:esAdmin() ? val('ig-co').replace(',', '.') : '', almacen:$('ig-a') ? val('ig-a') : '', nota:val('ig-n') }).then(function(j){
    b.disabled = false; m.className = 'msg ' + (j && j.ok ? 'ok' : 'mal'); m.textContent = j && j.ok ? 'Ingresado.' : mensaje(j);
    if(j && j.ok){ ['ig-v', 'ig-c', 'ig-l', 'ig-ve', 'ig-co', 'ig-n'].forEach(function(i){ if($(i)) $(i).value = ''; }); catVariantes(true); }
  });
};
function almKardex(){
  rpc('erp_movimientos', {}).then(function(j){
    if(!j || !j.ok) return fuera(j);
    $('cargando').outerHTML = tabla([{ t:'Fecha', k:function(x){ return esc(new Date(x.fecha).toLocaleString('es-PE')); } }, { t:'Movimiento', k:function(x){ return esc(x.tipo) + '<span class="sub">' + esc(x.ref || '') + '</span>'; } },
      { t:'Producto', k:function(x){ return '<span class="mono">' + esc(x.sku || '') + '</span><span class="sub">' + esc([x.almacen, x.lote ? 'lote ' + x.lote : ''].filter(Boolean).join(' · ')) + '</span>'; } },
      { t:'Cantidad', n:1, k:function(x){ return '<b class="' + (x.cant < 0 ? 'margen-bajo' : 'margen-alto') + '">' + (x.cant > 0 ? '+' : '') + num(x.cant) + '</b>'; } }].concat(esAdmin() ? [{ t:'Costo', n:1, k:function(x){ return x.costo != null ? soles(x.costo) : ''; } }] : [])
      .concat([{ t:'Nota', k:function(x){ return esc(x.nota || ''); } }]), j.lista, { vacio:'Sin movimientos' });
  });
}
function almTraslado(){
  Promise.all([catVariantes(), rpc('erp_almacenes')]).then(function(r){
    var A = ((r[1] && r[1].lista) || []).filter(function(a){ return a.tipo === 'propio' && a.activo; }), ops = A.map(function(a){ return [a.id, a.codigo + ' · ' + a.nombre]; });
    $('cargando').outerHTML = listaVar('dl-var') + '<div class="tarj"><h2>Traslado entre almacenes</h2><div class="campos">' + campo('tr-de', 'De', sel('tr-de', ops, A[0] && A[0].id)) + campo('tr-a', 'A', sel('tr-a', ops, A[1] && A[1].id)) +
      campo('tr-v', 'Producto', inp('tr-v', '', ' list="dl-var"')) + campo('tr-c', 'Cantidad', inp('tr-c', '', ' inputmode="decimal"')) + '</div><button type="button" class="bt" data-a="trasladar">Trasladar (sale lo que vence primero)</button><p class="msg" id="tr-msg"></p></div>';
  });
}
ACC.trasladar = function(b){
  var v = varDe(val('tr-v')), m = $('tr-msg'); if(!v){ m.className = 'msg mal'; m.textContent = 'Elige el producto.'; return; }
  b.disabled = true;
  rpc('erp_traslado', { de:val('tr-de'), a:val('tr-a'), variante:v.id, cantidad:val('tr-c').replace(',', '.') }).then(function(j){ b.disabled = false; m.className = 'msg ' + (j && j.ok ? 'ok' : 'mal'); m.textContent = j && j.ok ? 'Trasladado (' + j.ref + ').' : mensaje(j); });
};
/* escáner: la cámara (si el navegador trae BarcodeDetector) o el lector USB como teclado */
function almEscaner(){
  $('cargando').outerHTML = '<div class="tarj"><h2>Escáner</h2><p class="ayuda" style="margin:0 0 10px">Escanea el código de barras de un producto o el QR de un lote (OBR-LOT:…). Un lector USB funciona escribiendo aquí.</p>' +
    '<div class="acciones"><input id="es-c" placeholder="Código" autocomplete="off" style="max-width:320px" class="mono"><button type="button" class="bt" data-a="escBuscar">Buscar</button>' +
    ('BarcodeDetector' in window ? '<button type="button" class="bt sec" data-a="escCamara">Usar la cámara</button>' : '') + '</div><video id="es-v" playsinline muted style="width:100%; max-width:420px; border-radius:10px; margin-top:10px" hidden></video><div id="es-r" style="margin-top:12px"></div></div>';
  $('es-c').focus(); $('es-c').onkeydown = function(e){ if(e.key === 'Enter') ACC.escBuscar(); };
}
ACC.escBuscar = function(){
  var c = val('es-c'); if(!c) return;
  rpc('erp_codigo', { codigo:c }).then(function(j){
    if(!j || !j.ok){ $('es-r').innerHTML = '<div class="aviso mal">' + esc(mensaje(j)) + '</div>'; return; }
    var p = j.producto, v = (p.variantes || []).filter(function(x){ return x.id === j.variante; })[0] || {};
    $('es-r').innerHTML = '<div class="aviso ok"><b>' + esc(p.nombre) + '</b> · <span class="mono">' + esc(v.sku || p.sku) + '</span>' + (v.talla ? ' · talla ' + esc(v.talla) : '') +
      (j.tipo === 'lote' ? '<br>Lote <b class="mono">' + esc(j.lote.lote) + '</b>' + (j.lote.vence ? ' · vence ' + fecha(j.lote.vence) : '') + ' · ' + num(j.lote.cant) + ' en este lote' : '') +
      '<br>Disponible: ' + stockTxt(v.stock) + '</div>';
    $('es-c').value = ''; $('es-c').focus();
  });
};
ACC.escCamara = function(){
  var vid = $('es-v'), det;
  try{ det = new window.BarcodeDetector({ formats:['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a'] }); }catch(e){ toast('Tu navegador no lee códigos con la cámara: usa el lector o escribe el código.'); return; }
  navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } }).then(function(st){
    vid.srcObject = st; vid.hidden = false; vid.play();
    var fin = function(){ st.getTracks().forEach(function(t){ t.stop(); }); vid.hidden = true; };
    var vuelta = function(){ if(vid.hidden) return; det.detect(vid).then(function(c){ if(c && c[0]){ $('es-c').value = c[0].rawValue; fin(); ACC.escBuscar(); } else requestAnimationFrame(vuelta); }, function(){ requestAnimationFrame(vuelta); }); };
    vuelta(); setTimeout(fin, 60000);
  }, function(){ toast('No se pudo abrir la cámara (permiso).'); });
};
function almAlmacenes(){
  rpc('erp_almacenes').then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.almacenes = j.lista;
    $('cargando').outerHTML = '<div class="filtros"><button type="button" class="bt" data-a="almNuevo">Nuevo almacén</button><span class="ayuda">' + (j.max != null ? 'Tu plan: ' + j.max + ' sede' + (j.max === 1 ? '' : 's') + ' propia' + (j.max === 1 ? '' : 's') + '.' : 'Tu plan: almacenes sin tope.') + '</span></div>' +
      tabla([{ t:'Código', k:function(a){ return '<span class="mono">' + esc(a.codigo) + '</span>'; } }, { t:'Nombre', k:function(a){ return esc(a.nombre) + '<span class="sub">' + esc([a.direccion, a.ubigeo].filter(Boolean).join(' · ')) + '</span>'; } },
        { t:'Tipo', k:function(a){ return pill({ propio:'propio', consignacion:'consignación (en la obra del cliente)', taller:'taller', transito:'tránsito' }[a.tipo] || a.tipo, a.tipo === 'propio' ? 'ok' : 'az'); } },
        { t:'Lotes con stock', n:1, k:function(a){ return num(a.lotes); } }], j.lista, { a:'almAbrir' });
  });
}
ACC.almNuevo = function(){ formAlmacen(null); };
ACC.almAbrir = function(b){ var a = (ERP.cache.almacenes || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0]; if(a && a.tipo === 'propio') formAlmacen(a); };
function formAlmacen(a){
  hoja({ titulo:a ? 'Almacén ' + a.codigo : 'Nuevo almacén', html:'<div class="campos">' + campo('al-cod', 'Código', inp('al-cod', a ? a.codigo : '', ' maxlength="12" class="mono"' + (a ? ' disabled' : ''))) + campo('al-n', 'Nombre', inp('al-n', a ? a.nombre : '', ' maxlength="80"')) +
      campo('al-ubi', 'Ubigeo', inp('al-ubi', a ? a.ubigeo : '', ' maxlength="6" inputmode="numeric"')) + '</div>' + campo('al-dir', 'Dirección (punto de partida de sus guías)', inp('al-dir', a ? a.direccion : '', ' maxlength="200"')),
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Guardar', a:function(api){ var p = { codigo:val('al-cod').toUpperCase(), nombre:val('al-n'), ubigeo:val('al-ubi'), direccion:val('al-dir') }; if(a) p.id = a.id;
      guarda(api, rpc('erp_almacen_guardar', p), 'Almacén guardado.', function(){ PINTAR.almacen('almacenes'); }); } }] });
}
function almEquivalencias(){
  Promise.all([rpc('erp_equivalencias'), catVariantes()]).then(function(r){
    var j = r[0]; if(!j || !j.ok) return fuera(j);
    $('cargando').outerHTML = listaVar('dl-var') + '<div class="aviso neu">Aquí declaras <b>tú</b> qué producto tuyo atiende un pedido de otra norma o nivel (por ejemplo, «lo que piden como KN95 lo atiendo con mi N95»). OBRASST no inventa equivalencias entre normas distintas: queda dicho que lo declaró tu empresa.</div>' +
      '<div class="tarj"><div class="campos">' + campo('eq-n', 'Norma pedida', sel('eq-n', j.normas, 'NIOSH')) + campo('eq-l', 'Nivel pedido', inp('eq-l', '', ' maxlength="30" placeholder="KN95, 4X42C, Tipo I Clase E…"')) +
      campo('eq-v', 'Lo atiendo con', inp('eq-v', '', ' list="dl-var"')) + campo('eq-nota', 'Nota', inp('eq-nota', '', ' maxlength="200"')) + '</div><button type="button" class="bt" data-a="eqGuardar">Declarar</button></div>' +
      tabla([{ t:'Pedido', k:function(e){ return esc(e.norma + ' ' + (e.nivel || '')); } }, { t:'Lo atiende', k:function(e){ return esc(e.d) + '<span class="sub mono">' + esc(e.sku) + '</span>'; } },
        { t:'Nota', k:function(e){ return esc(e.nota || ''); } }, { t:'', k:function(e){ return '<button type="button" class="bt-link" data-a="eqBorrar" data-id="' + esc(e.id) + '">Quitar</button>'; } }], j.lista, { vacio:'Nada declarado' });
  });
}
ACC.eqGuardar = function(){ var v = varDe(val('eq-v')); if(!v){ toast('Elige el producto.'); return; }
  guarda(null, rpc('erp_equivalencia_guardar', { norma:val('eq-n'), nivel:val('eq-l'), variante:v.id, nota:val('eq-nota') }), 'Declarado.', function(){ PINTAR.almacen('equivalencias'); }); };
ACC.eqBorrar = function(b){ guarda(null, rpc('erp_equivalencia_guardar', { id:b.getAttribute('data-id'), borrar:true }), 'Quitado.', function(){ PINTAR.almacen('equivalencias'); }); };
/* certificados de calidad: el archivo sube por la función de borde (tipo real por sus bytes, tope 10 MB, sin código activo) */
function almCertificados(){
  Promise.all([rpc('erp_certificados', {}), catVariantes()]).then(function(r){
    var j = r[0]; if(!j || !j.ok) return fuera(j);
    var prods = (ERP.cache.prod || []).map(function(p){ return [p.id, p.sku + ' · ' + p.nombre]; });
    $('cargando').outerHTML = '<div class="tarj"><h2>Subir un certificado</h2><div class="campos">' + campo('ce-p', 'Producto', sel('ce-p', prods, prods[0] && prods[0][0])) +
      campo('ce-t', 'Tipo', sel('ce-t', [['certificado', 'Certificado de conformidad'], ['ficha_tecnica', 'Ficha técnica'], ['ensayo', 'Informe de ensayo'], ['declaracion', 'Declaración del fabricante']], 'certificado')) +
      campo('ce-n', 'Norma', inp('ce-n', '', ' maxlength="60"')) + campo('ce-e', 'Emisor', inp('ce-e', '', ' maxlength="120"')) + campo('ce-num', 'N.°', inp('ce-num', '', ' maxlength="60"')) +
      campo('ce-v', 'Vence', inp('ce-v', '', ' type="date"')) + '</div>' + campo('ce-a', 'Archivo (PDF o imagen, hasta 10 MB)', '<input type="file" id="ce-a" accept="application/pdf,image/png,image/jpeg,image/webp">') +
      '<button type="button" class="bt" data-a="certSubir">Subir</button><p class="msg" id="ce-msg"></p></div>' +
      tabla([{ t:'Producto', k:function(c){ return esc(c.producto_nombre) + (c.lote ? '<span class="sub">lote ' + esc(c.lote) + '</span>' : ''); } }, { t:'Documento', k:function(c){ return esc({ certificado:'Certificado', ficha_tecnica:'Ficha técnica', ensayo:'Ensayo', declaracion:'Declaración' }[c.tipo] || c.tipo) + '<span class="sub">' + esc([c.norma, c.emisor, c.numero].filter(Boolean).join(' · ')) + '</span>'; } },
        { t:'Vigencia', k:function(c){ return c.vence ? (c.vigente ? pill('hasta ' + fecha(c.vence), 'ok') : pill('venció ' + fecha(c.vence), 'mal')) : pill('sin vencimiento'); } },
        { t:'', k:function(c){ return '<button type="button" class="bt-link" data-a="verArchivo" data-id="' + esc(c.archivo) + '">Ver</button>'; } }], j.lista, { vacio:'Sin certificados', vacioSub:'Van en el dossier de calidad de cada guía.' });
  });
}
ACC.certSubir = function(b){
  var f = $('ce-a').files && $('ce-a').files[0], m = $('ce-msg');
  if(!f){ m.className = 'msg mal'; m.textContent = 'Elige el archivo.'; return; }
  if(f.size > 10 * 1024 * 1024){ m.className = 'msg mal'; m.textContent = 'Pasa los 10 MB.'; return; }
  b.disabled = true; m.className = 'msg'; m.textContent = 'Subiendo…';
  edge('/subir?uso=cert', f).then(function(s){
    if(!s || !s.ok){ b.disabled = false; m.className = 'msg mal'; m.textContent = mensaje(s); return null; }
    return rpc('erp_certificado_registrar', { producto:val('ce-p'), tipo:val('ce-t'), norma:val('ce-n'), emisor:val('ce-e'), numero:val('ce-num'), vence:val('ce-v'), archivo:s.ruta, sha256:s.sha256, tam:s.tam });
  }).then(function(j){ if(!j) return; b.disabled = false; m.className = 'msg ' + (j.ok ? 'ok' : 'mal'); m.textContent = j.ok ? 'Certificado guardado.' : mensaje(j); if(j.ok) PINTAR.almacen('certificados'); });
};
ACC.verArchivo = function(b){ edge('/ver', { ruta:b.getAttribute('data-id') }).then(function(j){ if(j && j.ok) window.open(j.url, '_blank', 'noopener'); else toast(mensaje(j)); }); };

/* ══ CONSIGNACIONES (VMI) ══ */
PINTAR.consignaciones = function(){
  $('vista').innerHTML = cabecera('consignaciones') + '<div class="aviso neu">Tu stock queda en la obra del cliente. Cada vez que su almacén entrega un EPP del acuerdo a un trabajador (en su kardex de OBRASST), se descuenta de aquí. Lo único que cruza: un código cifrado de la entrega, el SKU, la talla, el lote, la cantidad y la hora. <b>Nunca</b> el nombre, el DNI ni la firma del trabajador. La empresa puede cortar el acceso cuando quiera.</div><p class="ayuda" id="cargando">Cargando…</p>';
  rpc('erp_consignaciones').then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.consig = j.lista;
    $('cargando').outerHTML = (esAdmin() ? '<div class="filtros"><button type="button" class="bt" data-a="conNueva">Proponer a un cliente</button></div>' : '') +
      tabla([{ t:'Cliente', k:function(x){ return '<b>' + esc(x.cliente_nombre || '—') + '</b><span class="sub">' + (x.respondida_en ? 'respondió el ' + fecha(x.respondida_en) : 'propuesta el ' + fecha(x.creado)) + '</span>'; } },
        { t:'Estado', k:function(x){ return pill({ propuesta:'Espera que la empresa acepte', activa:'Activa', revocada:'Cortada por la empresa', cerrada:'Cerrada' }[x.estado] || x.estado, x.estado === 'activa' ? 'ok' : x.estado === 'revocada' ? 'mal' : 'med') + (x.motivo ? '<span class="sub">' + esc(x.motivo) + '</span>' : ''); } },
        { t:'En la obra', k:function(x){ return (x.items || []).map(function(i){ return esc(i.sku) + ': <b>' + num(i.stock) + '</b>'; }).join('<br>'); } },
        { t:'Por liquidar', n:1, k:function(x){ return num(x.por_liquidar) + (x.faltantes ? '<span class="sub margen-bajo">' + num(x.faltantes) + ' sin stock</span>' : ''); } }], j.lista, { a:'conAbrir', vacio:'Sin consignaciones' });
  });
};
ACC.conNueva = function(){
  Promise.all([catVariantes(), catClientes()]).then(function(){
    var C = (ERP.cache.cli || []).filter(function(c){ return c.obrasst; });
    if(!C.length){ toast('Ningún cliente tuyo usa OBRASST todavía (se reconoce por su RUC).'); return; }
    hoja({ titulo:'Proponer una consignación', ancha:true, html:listaVar('dl-var') + campo('cn-c', 'Cliente (usa OBRASST)', sel('cn-c', C.map(function(c){ return [c.id, c.razon_social]; }), C[0].id)) +
        '<p class="ayuda" style="margin:0 0 8px">Cada producto con el nombre que la empresa usa en su kardex (así se reconocen sus entregas) y tu precio sin IGV.</p><div class="tabla-caja"><table><thead><tr><th>Tu producto</th><th>Cómo lo llama la empresa</th><th>Precio (sin IGV)</th></tr></thead><tbody>' +
        [0, 1, 2, 3, 4].map(function(i){ return '<tr><td>' + inp('cn-v' + i, '', ' list="dl-var"') + '</td><td>' + inp('cn-e' + i, '', ' maxlength="80" placeholder="Respirador N95"') + '</td><td>' + inp('cn-p' + i, '', ' inputmode="decimal" style="max-width:110px"') + '</td></tr>'; }).join('') + '</tbody></table></div>',
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Proponer', a:function(api){ var I = [];
        for(var i = 0; i < 5; i++){ if(!val('cn-v' + i)) continue; var v = varDe(val('cn-v' + i)); if(!v) return api.msg('«' + val('cn-v' + i) + '» no está en tu lista.'); I.push({ v:v.id, epp:val('cn-e' + i), p:val('cn-p' + i).replace(',', '.') }); }
        guarda(api, rpc('erp_consignacion_proponer', { cliente:val('cn-c'), items:I }), 'Propuesta enviada: la empresa la ve en su OBRASST.', function(){ PINTAR.consignaciones(); }); } }] });
  });
};
ACC.conAbrir = function(b){
  var x = (ERP.cache.consig || []).filter(function(c){ return c.id === b.getAttribute('data-id'); })[0]; if(!x) return;
  Promise.all([rpc('erp_vmi_eventos', { consignacion:x.id }), rpc('erp_vmi_preliquidar', { consignacion:x.id })]).then(function(r){
    var ev = r[0] || {}, pl = r[1] || {};
    hoja({ titulo:'Consignación · ' + (x.cliente_nombre || ''), ancha:true, html:'<h3 style="font-size:14px; margin:0 0 6px">Preliquidación (lo consumido y no facturado)</h3>' +
        tabla([{ t:'SKU', k:function(l){ return '<span class="mono">' + esc(l.sku) + '</span>' + (l.talla ? '<span class="sub">talla ' + esc(l.talla) + '</span>' : ''); } }, { t:'Cantidad', n:1, k:function(l){ return num(l.c); } },
          { t:'Precio', n:1, k:function(l){ return soles(l.p); } }, { t:'Total sin IGV', n:1, k:function(l){ return soles(l.c * l.p); } }, { t:'', k:function(l){ return l.faltantes ? pill(l.faltantes + ' sin stock', 'mal') : ''; } }], pl.lineas || [], { vacio:'Nada por liquidar' }) +
        '<h3 style="font-size:14px; margin:6px 0 6px">Entregas recibidas de la obra</h3>' + tabla([{ t:'Hora', k:function(e){ return esc(new Date(e.ts).toLocaleString('es-PE')); } }, { t:'Código', k:function(e){ return '<span class="mono chico">' + esc(e.hash) + '…</span>'; } },
          { t:'SKU', k:function(e){ return esc(e.sku) + (e.talla ? ' · ' + esc(e.talla) : ''); } }, { t:'Lote', k:function(e){ return esc(e.lote || '—'); } }, { t:'Cantidad', n:1, k:function(e){ return num(e.cantidad); } },
          { t:'', k:function(e){ return e.liquidado ? pill('liquidado', 'ok') : e.faltante ? pill('sin stock', 'mal') : ''; } }], ev.lista || [], { vacio:'Sin entregas todavía' }),
      botones:[{ t:'Cerrar', c:'sec' }].concat(x.estado === 'activa' && ERP.yo.papel !== 'vendedor' ? [{ t:'Llevar stock (guía)', a:function(api){ api.cerrar(); formEnvioConsignacion(x); } }] : [])
        .concat((pl.lineas || []).length && puede('facturacion') ? [{ t:'Facturar lo consumido', c:'casco', a:function(api){ guarda(api, rpc('erp_vmi_facturar', { consignacion:x.id, idem:nuevoIdem() }), null, function(j){ toast('Factura ' + j.factura.codigo + ' emitida.'); PINTAR.consignaciones(); }); } }] : []) });
  });
};
function camposTransporte(pre){
  return '<div class="campos">' + campo(pre + 'mod', 'Transporte', sel(pre + 'mod', [['02', 'Privado (vehículo propio)'], ['01', 'Público (transportista)']], '02')) +
    campo(pre + 'veh', 'Placa', inp(pre + 'veh', leer('erp_ult_placa', ''), ' maxlength="10" class="mono"')) + campo(pre + 'cdoc', 'DNI del conductor', inp(pre + 'cdoc', '', ' maxlength="12" inputmode="numeric"')) +
    campo(pre + 'cnom', 'Nombre del conductor', inp(pre + 'cnom', '', ' maxlength="120"')) + campo(pre + 'clic', 'Licencia', inp(pre + 'clic', '', ' maxlength="12" class="mono"')) +
    campo(pre + 'truc', 'RUC del transportista', inp(pre + 'truc', '', ' maxlength="11" inputmode="numeric"')) + campo(pre + 'traz', 'Transportista', inp(pre + 'traz', '', ' maxlength="160"')) + '</div>' +
    '<p class="ayuda">Privado: placa y conductor. Público: RUC y razón social del transportista. Los datos del conductor van solo en la guía (como pide SUNAT).</p>';
}
function leerTransporte(pre){
  var mod = val(pre + 'mod'); if(val(pre + 'veh')) guardar('erp_ult_placa', val(pre + 'veh').toUpperCase());
  return mod === '02' ? { modalidad:'02', vehiculo:val(pre + 'veh').toUpperCase(), conductor:{ tipo_doc:'1', num_doc:val(pre + 'cdoc'), nombre:val(pre + 'cnom'), licencia:val(pre + 'clic').toUpperCase() } }
                      : { modalidad:'01', transportista:{ ruc:val(pre + 'truc'), razon:val(pre + 'traz') } };
}
function formEnvioConsignacion(x){
  hoja({ titulo:'Llevar stock a la obra', ancha:true, html:'<div class="tabla-caja"><table><thead><tr><th>Producto</th><th>Cantidad</th></tr></thead><tbody>' + (x.items || []).map(function(i, k){
      return '<tr><td>' + esc(i.sku) + '<span class="sub">' + esc(i.epp_txt || i.epp) + '</span></td><td>' + inp('ce-c' + k, '', ' inputmode="decimal" style="max-width:100px" data-v="' + esc(i.v) + '" class="ce-c"') + '</td></tr>'; }).join('') + '</tbody></table></div>' + camposTransporte('cg-'),
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Emitir la guía', a:function(api){ var L = [];
      [].forEach.call(document.querySelectorAll('.ce-c'), function(i){ if(String(i.value).trim()) L.push({ v:i.getAttribute('data-v'), c:String(i.value).trim().replace(',', '.') }); });
      guarda(api, rpc('erp_consignacion_enviar', Object.assign({ consignacion:x.id, lineas:L, idem:nuevoIdem() }, leerTransporte('cg-'))), null, function(j){ toast('Guía ' + j.guia.codigo + ' emitida.'); PINTAR.consignaciones(); }); } }] });
}

/* ══ TALLER Y BORDADOS ══ */
PINTAR.taller = function(){
  $('vista').innerHTML = cabecera('taller') + '<p class="ayuda" id="cargando">Cargando…</p>';
  Promise.all([rpc('erp_taller'), catVariantes()]).then(function(r){
    var j = r[0]; if(!j || !j.ok) return fuera(j);
    ERP.cache.ots = j.lista;
    $('cargando').outerHTML = listaVar('dl-var') + '<div class="tarj"><h2>Mandar al taller</h2><div class="campos">' + campo('ot-b', 'Sale (producto base)', inp('ot-b', '', ' list="dl-var"')) +
      campo('ot-r', 'Vuelve como (producto resultado)', inp('ot-r', '', ' list="dl-var"')) + campo('ot-c', 'Cantidad', inp('ot-c', '', ' inputmode="decimal"')) + campo('ot-t', 'Taller', inp('ot-t', '', ' maxlength="120"')) +
      (esAdmin() ? campo('ot-s', 'Servicio por unidad (sin IGV)', inp('ot-s', '', ' inputmode="decimal"')) : '') + '</div>' + campo('ot-d', 'Detalle (bordado, logo, posición)', inp('ot-d', '', ' maxlength="300"')) +
      '<button type="button" class="bt" data-a="otEnviar">Mandar (sale lo que vence primero)</button><p class="msg" id="ot-msg"></p></div>' +
      tabla([{ t:'Orden', k:function(o){ return '<span class="mono">' + esc(o.numero) + '</span><span class="sub">' + fecha(o.creado) + ' · ' + esc(o.taller) + '</span>'; } },
        { t:'Base → resultado', k:function(o){ return '<span class="mono">' + esc(o.base) + '</span> → <span class="mono">' + esc(o.resultado) + '</span>' + (o.detalle ? '<span class="sub">' + esc(o.detalle) + '</span>' : ''); } },
        { t:'Cantidad', n:1, k:function(o){ return num(o.cantidad) + (o.recibido != null ? '<span class="sub">vuelven ' + num(o.recibido) + ' · merma ' + num(o.merma) + '</span>' : ''); } }]
        .concat(esAdmin() ? [{ t:'Costo resultado', n:1, k:function(o){ return o.costo_unit_resultado != null ? soles(o.costo_unit_resultado) + ' c/u' : '—'; } }] : [])
        .concat([{ t:'', k:function(o){ return o.estado === 'enviada' ? '<button type="button" class="bt sec mini" data-a="otRecibir" data-id="' + esc(o.id) + '">Recibir</button>' : pill('recibida', 'ok'); } }]), j.lista, { vacio:'Sin órdenes de taller' }) +
      '<p class="ayuda">Al recibir, el costo del resultado = (lo que salió al costo promedio + el servicio de lo recibido) ÷ lo recibido. La merma se absorbe.</p>';
  });
};
ACC.otEnviar = function(b){
  var bv = varDe(val('ot-b')), rv = varDe(val('ot-r')), m = $('ot-msg');
  if(!bv || !rv){ m.className = 'msg mal'; m.textContent = 'Elige los dos productos de la lista.'; return; }
  b.disabled = true;
  rpc('erp_taller_enviar', { base:bv.id, resultado:rv.id, cantidad:val('ot-c').replace(',', '.'), taller:val('ot-t'), servicio_unit:$('ot-s') ? val('ot-s').replace(',', '.') : '', detalle:val('ot-d') }).then(function(j){
    b.disabled = false; if(!j || !j.ok){ m.className = 'msg mal'; m.textContent = mensaje(j); return; } toast('Orden ' + j.orden + ' creada.'); PINTAR.taller(); });
};
ACC.otRecibir = function(b){
  var o = (ERP.cache.ots || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0];
  hoja({ titulo:'Recibir ' + o.numero, html:'<p class="ayuda" style="margin:0 0 10px">Salieron ' + num(o.cantidad) + '.</p><div class="campos">' + campo('or-r', 'Volvieron buenos', inp('or-r', o.cantidad, ' inputmode="decimal"')) +
      campo('or-l', 'Lote del resultado', inp('or-l', o.numero, ' maxlength="40" class="mono"')) + (esAdmin() ? campo('or-s', 'Servicio por unidad (si cambió)', inp('or-s', o.servicio_unit, ' inputmode="decimal"')) : '') + '</div>',
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Recibir', a:function(api){ guarda(api, rpc('erp_taller_recibir', { id:o.id, recibido:val('or-r').replace(',', '.'), lote:val('or-l'), servicio_unit:$('or-s') ? val('or-s').replace(',', '.') : '' }), null,
      function(j){ toast('Recibido · merma ' + num(j.merma) + (j.costo_unit != null ? ' · costo ' + soles(j.costo_unit) + ' c/u' : '')); PINTAR.taller(); }); } }] });
};

/* ══ DESPACHOS Y GUÍAS ══ */
PINTAR.despachos = function(sub){
  var subs = [['guias', 'Guías'], ['pedidos', 'Por despachar']];
  sub = sub === 'pedidos' ? 'pedidos' : 'guias';
  $('vista').innerHTML = cabecera('despachos', ERP.yo.papel === 'vendedor' ? [['guias', 'Guías']] : subs, sub) + '<p class="ayuda" id="cargando">Cargando…</p>';
  if(sub === 'pedidos') return despPedidos();
  rpc('erp_guias', {}).then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.guias = j.lista;
    $('cargando').outerHTML = tabla([{ t:'Guía', k:function(g){ return '<span class="mono">' + esc(g.codigo) + '</span><span class="sub">' + fecha(g.fecha_traslado) + (g.pedido_numero ? ' · ' + esc(g.pedido_numero) : g.motivo === '13' ? ' · consignación' : '') + '</span>'; } },
      { t:'Cliente', k:function(g){ return esc(g.cliente_nombre || '—') + (g.obrasst ? ' ' + pill('OBRASST', 'az') : ''); } },
      { t:'Estado', k:function(g){ return pill({ emitida:'Emitida', en_ruta:'En ruta', entregada:'Entregada', observada:'Entregada con observación', anulada:'Anulada' }[g.estado] || g.estado, g.estado === 'entregada' ? 'ok' : g.estado === 'anulada' ? '' : g.estado === 'observada' ? 'med' : 'az') +
        (g.ingreso ? '<span class="sub">' + esc({ en_camino:'La empresa la verá al llegar', pendiente:'Esperando que la empresa acepte el ingreso', aceptado:'Ingreso aceptado por la empresa' }[g.ingreso.estado] || '') + '</span>' : ''); } },
      { t:'SUNAT', k:function(g){ return sunatTxt(g.sunat); } }, { t:'Chofer', k:function(g){ return esc(g.chofer || '—'); } }], j.lista, { a:'guiaAbrir', vacio:'Sin guías', vacioSub:'Se emiten desde «Por despachar».' });
  });
};
function sunatTxt(s){ s = s || {}; return s.modo === 'prueba' && s.estado === 'aceptada_prueba' ? pill('PRUEBA · sin valor tributario', 'med') : s.estado === 'por_enviar' ? pill('por enviar al PSE', 'az') : s.estado === 'aceptada' ? pill('aceptada', 'ok') : s.estado === 'rechazada' ? pill('rechazada', 'mal') : pill(s.estado || '—'); }
function despPedidos(){
  rpc('erp_pedidos', { estado:'abiertos' }).then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.pedidos = j.lista;
    $('cargando').outerHTML = tabla([{ t:'Pedido', k:function(o){ return '<span class="mono">' + esc(o.numero) + '</span><span class="sub">' + fecha(o.creado) + '</span>'; } }, { t:'Cliente', k:function(o){ return esc(o.cliente_nombre); } },
      { t:'Listo para salir', k:function(o){ return (o.lineas || []).map(function(l){ var r = (l.res || []).reduce(function(s, x){ return s + (x.comp ? 0 : Number(x.c)); }, 0); return esc(l.sku) + ': ' + num(r) + (l.pend > 0 ? ' <span class="margen-bajo">(falta ' + num(l.pend) + ')</span>' : ''); }).join('<br>'); } },
      { t:'', k:function(o){ return '<button type="button" class="bt mini" data-a="guiaNueva" data-id="' + esc(o.id) + '">Emitir guía</button>'; } }], j.lista, { vacio:'Nada por despachar' });
  });
}
ACC.guiaNueva = function(b){
  var o = (ERP.cache.pedidos || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0]; if(!o) return;
  rpc('erp_usuarios').then(function(u){
    var chof = ((u && u.lista) || []).filter(function(x){ return x.activo && (x.papel === 'chofer' || x.papel === 'almacenero'); });
    hoja({ titulo:'Guía de remisión · ' + o.numero, ancha:true, html:'<p class="ayuda" style="margin:0 0 8px">Sale lo reservado (lo que vence primero), con su lote. Cambia la cantidad para un despacho parcial.</p>' +
        '<div class="tabla-caja"><table><thead><tr><th>Producto</th><th class="num">Reservado</th><th>Sale ahora</th></tr></thead><tbody>' + (o.lineas || []).map(function(l, i){ var r = l.tipo === 'kit' ? null : (l.res || []).reduce(function(s, x){ return s + Number(x.c); }, 0);
          return '<tr><td>' + esc(l.d) + '<span class="sub mono">' + esc(l.sku) + '</span></td><td class="num">' + (r == null ? 'kit' : num(r)) + '</td><td>' + inp('gl-' + i, r == null ? '' : r, ' inputmode="decimal" style="max-width:100px" data-i="' + i + '" class="gl"') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<div class="campos">' + campo('gu-f', 'Fecha de traslado', inp('gu-f', hoyLima(), ' type="date"')) + campo('gu-peso', 'Peso bruto (kg)', inp('gu-peso', '', ' inputmode="decimal"')) + campo('gu-bul', 'Bultos', inp('gu-bul', '', ' inputmode="numeric"')) +
        campo('gu-ch', 'Chofer (ve la entrega en su celular)', sel('gu-ch', [['', '—']].concat(chof.map(function(c){ return [c.uid, c.nombre + ' (' + c.papel + ')']; })), '')) + '</div>' +
        '<div class="campos">' + campo('gu-ubi', 'Ubigeo de llegada', inp('gu-ubi', o.entrega && o.entrega.ubigeo || '', ' maxlength="6" inputmode="numeric" placeholder="la del cliente"')) + '</div>' +
        campo('gu-dir', 'Dirección de llegada', inp('gu-dir', o.entrega && o.entrega.direccion || '', ' maxlength="200" placeholder="la del cliente"')) + camposTransporte('gt-'),
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Emitir la guía', a:function(api){
        var L = []; [].forEach.call(document.querySelectorAll('.gl'), function(x){ if(String(x.value).trim() !== '') L.push({ i:+x.getAttribute('data-i'), c:String(x.value).trim().replace(',', '.') }); });
        var p = Object.assign({ pedido:o.id, fecha_traslado:val('gu-f'), peso_kg:val('gu-peso').replace(',', '.'), bultos:val('gu-bul'), chofer:val('gu-ch'), idem:nuevoIdem() }, leerTransporte('gt-'));
        if(L.length) p.lineas = L;
        if(val('gu-ubi') || val('gu-dir')) p.llegada = { ubigeo:val('gu-ubi'), direccion:val('gu-dir') };
        guarda(api, rpc('erp_guia_emitir', p), null, function(j){ toast('Guía ' + j.guia.codigo + ' emitida.'); irA('despachos', 'guias'); }); } }] });
  });
};
ACC.guiaAbrir = function(b){
  rpc('erp_guia', { id:b.getAttribute('data-id') }).then(function(j){
    if(!j || !j.ok){ toast(mensaje(j)); return; }
    var g = j.guia, puedeOp = ERP.yo.papel === 'admin' || ERP.yo.papel === 'almacenero';
    hoja({ titulo:'Guía ' + g.codigo, ancha:true, html:'<p class="ayuda" style="margin:0 0 10px">' + esc(g.cliente_nombre || '') + ' · ' + fecha(g.fecha_traslado) + ' · ' + esc(g.llegada && g.llegada.direccion || '') + '</p>' +
        tabla([{ t:'Producto', k:function(l){ return esc(l.d) + '<span class="sub mono">' + esc(l.sku) + '</span>'; } }, { t:'Lote', k:function(l){ return esc(l.lote || '—') + (l.vence ? '<span class="sub">vence ' + fecha(l.vence) + '</span>' : ''); } },
          { t:'Cantidad', n:1, k:function(l){ return num(l.c) + ' ' + esc(l.u || ''); } }], g.lineas) +
        (g.pod ? '<div class="aviso ok">Entregada el ' + esc(new Date(g.pod.t).toLocaleString('es-PE')) + ' · recibió ' + esc(g.pod.recibio) + ' · GPS ' + num(g.pod.lat, 5) + ', ' + num(g.pod.lng, 5) +
          (g.pod.observacion ? '<br>Observación: ' + esc(g.pod.observacion) : '') + '<br><button type="button" class="bt-link" data-a="verArchivo" data-id="' + esc(g.pod.firma_recepcion) + '">Ver la firma</button>' +
          (g.pod.foto ? ' · <button type="button" class="bt-link" data-a="verArchivo" data-id="' + esc(g.pod.foto) + '">Ver la foto</button>' : '') + '</div>' : '') + '<p>' + sunatTxt(g.sunat) + '</p>',
      botones:[{ t:'Cerrar', c:'sec' }, { t:'PDF de la guía', c:'sec', a:function(){ docs().then(function(D){ D.guia(j); }); } }]
        .concat(tieneModulo('dossier') ? [{ t:'Dossier de calidad', c:'sec', a:function(){ rpc('erp_dossier', { guia:g.id }).then(function(d){ if(!d || !d.ok) return toast(mensaje(d)); docs().then(function(D){ D.dossier(d, g); }); }); } }] : [])
        .concat(g.sunat && (g.sunat.estado === 'por_enviar' || g.sunat.estado === 'rechazada') && puedeOp ? [{ t:'Enviar al PSE', a:function(api){ api.ocupado(true); edge('/emitir', { tipo:'guia', id:g.id }).then(function(r){ api.ocupado(false); if(r && r.ok){ api.cerrar(); toast('Aceptada.'); PINTAR.despachos('guias'); } else api.msg(r && r.sunat ? r.sunat.descripcion : mensaje(r)); }); } }] : [])
        .concat((g.estado === 'emitida' || g.estado === 'en_ruta') && puedeOp ? [{ t:'Anular', c:'mal', a:function(api){ pedirTexto('Anular la guía', 'Motivo', function(m, h2){ guarda(h2, rpc('erp_guia_anular', { id:g.id, motivo:m }), 'Guía anulada: lo que salió volvió a su lote.', function(){ api.cerrar(); PINTAR.despachos('guias'); }); }); } }] : []) });
  });
};

/* ══ MIS ENTREGAS (el chofer, en su celular): salir a ruta y la prueba de entrega con firma, foto y GPS ══ */
PINTAR.entregas = function(){
  $('vista').innerHTML = cabecera('entregas') + '<p class="ayuda" id="cargando">Cargando tu ruta…</p>';
  rpc('erp_mis_entregas').then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.ruta = j.lista;
    $('cargando').outerHTML = j.lista.length ? j.lista.map(function(g){
      return '<div class="tarj"><div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap"><div><h2>' + esc(g.cliente_nombre || '') + '</h2><p class="ayuda">' + esc(g.llegada && g.llegada.direccion || '') + '</p></div>' +
        pill({ emitida:'Por salir', en_ruta:'En ruta', entregada:'Entregada', observada:'Con observación' }[g.estado] || g.estado, g.estado === 'en_ruta' ? 'med' : g.estado === 'emitida' ? 'az' : 'ok') + '</div>' +
        '<p class="chico" style="margin:8px 0">Guía <span class="mono">' + esc(g.codigo) + '</span> · ' + (g.lineas || []).map(function(l){ return num(l.c) + ' ' + esc(l.sku); }).join(' · ') + '</p>' +
        '<div class="acciones">' + (g.estado === 'emitida' ? '<button type="button" class="bt sec" data-a="salirRuta" data-id="' + esc(g.id) + '">Salir a ruta</button>' : '') +
        (g.estado === 'emitida' || g.estado === 'en_ruta' ? '<button type="button" class="bt casco" data-a="pod" data-id="' + esc(g.id) + '">Registrar la entrega</button>' : '') +
        (g.llegada && g.llegada.direccion ? '<a class="bt sec" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(g.llegada.direccion) + '">Cómo llegar</a>' : '') + '</div></div>';
    }).join('') : '<div class="vacio"><b>No tienes entregas</b>Cuando el almacén te asigne una guía, aparece aquí.</div>';
  });
};
ACC.salirRuta = function(b){ guarda(null, rpc('erp_entrega_salir', { id:b.getAttribute('data-id') }), 'En ruta.', PINTAR.entregas); };
ACC.pod = function(b){
  var id = b.getAttribute('data-id'), gps = null;
  hoja({ titulo:'Prueba de entrega', html:campo('pd-r', 'Quién recibe (nombre y cargo en la obra)', inp('pd-r', '', ' maxlength="120"')) +
      '<p style="font-size:13px; font-weight:500; margin:0 0 4px">Firma de quien recibe</p><canvas class="firma" id="pd-f" width="600" height="220"></canvas><button type="button" class="bt-link" id="pd-borrar">Borrar la firma</button>' +
      campo('pd-foto', 'Foto de lo entregado (opcional)', '<input type="file" id="pd-foto" accept="image/*" capture="environment">') +
      campo('pd-obs', 'Observación (opcional: faltó algo, llegó dañado…)', inp('pd-obs', '', ' maxlength="300"')) + '<p class="ayuda" id="pd-gps">Tomando tu ubicación…</p>',
    alAbrir:function(){ docs().then(function(D){ D.firmaPad($('pd-f'), $('pd-borrar')); });
      if(navigator.geolocation) navigator.geolocation.getCurrentPosition(function(p){ gps = p.coords; $('pd-gps').textContent = 'Ubicación tomada (±' + Math.round(p.coords.accuracy) + ' m).'; },
        function(){ $('pd-gps').textContent = 'No se pudo tomar la ubicación: activa el GPS y vuelve a abrir.'; }, { enableHighAccuracy:true, timeout:20000, maximumAge:60000 });
      else $('pd-gps').textContent = 'Este celular no da ubicación.'; },
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Confirmar la entrega', c:'casco', a:function(api){
      if(!val('pd-r')) return api.msg('Escribe quién recibe.');
      if(!gps) return api.msg('Falta la ubicación (GPS).');
      var cv = $('pd-f'); if(!cv.dataset.firmado) return api.msg('Falta la firma.');
      api.ocupado(true); api.msg('Subiendo…', true);
      new Promise(function(ok){ cv.toBlob(ok, 'image/png'); }).then(function(bl){ return edge('/subir?uso=pod', bl, 'image/png'); }).then(function(f){
        if(!f || !f.ok) throw f;
        var foto = $('pd-foto').files && $('pd-foto').files[0];
        return (foto ? docs().then(function(D){ return D.achicarFoto(foto); }).then(function(bl){ return edge('/subir?uso=pod', bl, 'image/jpeg'); }) : Promise.resolve(null)).then(function(fo){
          if(fo && !fo.ok) throw fo;
          return rpc('erp_pod_registrar', { id:id, recibio:val('pd-r'), firma_recepcion:f.ruta, foto:fo ? fo.ruta : '', lat:gps.latitude, lng:gps.longitude, precision:gps.accuracy, observacion:val('pd-obs') });
        });
      }).then(function(j){ api.ocupado(false); if(!j || !j.ok) return api.msg(mensaje(j)); api.cerrar(); toast('Entrega registrada.'); PINTAR.entregas(); },
        function(e){ api.ocupado(false); api.msg(mensaje(e)); });
    } }] });
};

/* ══ COMPRAS: reorden, órdenes (locales e importación con costo puesto en almacén), proveedores y compra grupal ══ */
PINTAR.compras = function(sub){
  var adm = esAdmin(), subs = adm ? [['sugerencias', 'Reorden'], ['ordenes', 'Órdenes'], ['proveedores', 'Proveedores']] : [['ordenes', 'Por recibir']];
  if(adm && tieneModulo('grupal')) subs.push(['grupal', 'Compra grupal']);
  sub = subs.some(function(x){ return x[0] === sub; }) ? sub : subs[0][0];
  $('vista').innerHTML = cabecera('compras', subs, sub) + '<p class="ayuda" id="cargando">Cargando…</p>';
  ({ sugerencias:comSugerencias, ordenes:comOrdenes, proveedores:comProveedores, grupal:comGrupal })[sub]();
};
function comSugerencias(){
  rpc('erp_compra_sugerencias').then(function(j){
    if(!j || !j.ok) return fuera(j);
    $('cargando').outerHTML = '<div class="filtros">' + (j.lista.length ? '<button type="button" class="bt" data-a="ocSugerir">Crear los borradores de OC (uno por proveedor)</button>' : '') + '</div>' +
      tabla([{ t:'Producto', k:function(s){ return esc(s.nombre) + '<span class="sub mono">' + esc(s.sku) + '</span>'; } }, { t:'Disponible', n:1, k:function(s){ return num(s.disponible); } },
        { t:'Ya viene', n:1, k:function(s){ return num(s.en_camino); } }, { t:'Punto de reorden', n:1, k:function(s){ return num(s.punto_reorden); } }, { t:'Sugerido', n:1, k:function(s){ return '<b>' + num(Math.ceil(s.sugerido)) + '</b>'; } }],
        j.lista, { vacio:'Nada bajo su punto de reorden', vacioSub:'Pon el punto de reorden y el lote de compra en la ficha de cada producto.' });
  });
}
ACC.ocSugerir = function(b){ b.disabled = true; guarda(null, rpc('erp_compra_sugerir_oc'), null, function(j){ toast(j.creadas + ' borrador(es) de OC creados.'); irA('compras', 'ordenes'); }).then(function(){ b.disabled = false; }); };
function comOrdenes(){
  rpc('erp_ocs', { estado:esAdmin() ? '' : 'abiertas' }).then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.ocs = j.lista;
    $('cargando').outerHTML = (esAdmin() ? '<div class="filtros"><button type="button" class="bt" data-a="ocNueva">Nueva orden de compra</button></div>' : '') +
      tabla([{ t:'Orden', k:function(o){ return '<span class="mono">' + esc(o.numero) + '</span>' + (o.sugerida ? ' ' + pill('sugerida', 'az') : '') + '<span class="sub">' + fecha(o.creado) + ' · ' + esc(o.proveedor || '—') + '</span>'; } },
        { t:'Tipo', k:function(o){ return esc(o.tipo === 'importacion' ? 'Importación' : 'Local') + (o.moneda && o.moneda !== 'PEN' ? '<span class="sub">' + esc(o.moneda) + ' · TC ' + num(o.tc, 4) + '</span>' : ''); } },
        { t:'Líneas', k:function(o){ return (o.lineas || []).map(function(l){ return esc(l.sku) + ': ' + num(l.rec || 0) + '/' + num(l.c); }).join('<br>'); } }]
        .concat(esAdmin() ? [{ t:'Total', n:1, k:function(o){ return o.total != null ? num(o.total, 2) + ' ' + esc(o.moneda) : ''; } }] : [])
        .concat([{ t:'Estado', k:function(o){ return pill({ borrador:'Borrador', emitida:'Emitida', parcial:'Recibida en parte', recibida:'Recibida', anulada:'Anulada' }[o.estado] || o.estado, o.estado === 'recibida' ? 'ok' : o.estado === 'parcial' ? 'med' : ''); } }]), j.lista, { a:'ocAbrir', vacio:'Sin órdenes' });
  });
}
ACC.ocNueva = function(){ formOC(null); };
ACC.ocAbrir = function(b){
  var o = (ERP.cache.ocs || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0]; if(!o) return;
  if(o.estado === 'emitida' || o.estado === 'parcial') return formRecibir(o);
  if(o.estado === 'borrador' && esAdmin()) return formOC(o);
};
function formOC(o){
  Promise.all([catVariantes(), rpc('erp_proveedores')]).then(function(r){
    var P = (r[1] && r[1].lista) || [];
    if(!P.length){ toast('Primero crea un proveedor.'); irA('compras', 'proveedores'); return; }
    var imp = tieneModulo('importacion');
    hoja({ titulo:o ? 'Orden ' + o.numero : 'Nueva orden de compra', ancha:true, html:listaVar('dl-var') + '<div class="campos">' + campo('oc-p', 'Proveedor', sel('oc-p', P.map(function(p){ return [p.id, p.razon_social]; }), o ? (P.filter(function(p){ return p.razon_social === o.proveedor; })[0] || {}).id : P[0].id)) +
        campo('oc-t', 'Tipo', sel('oc-t', [['local', 'Local']].concat(imp ? [['importacion', 'Importación']] : []), o ? o.tipo : 'local')) + campo('oc-m', 'Moneda', sel('oc-m', [['PEN', 'Soles'], ['USD', 'Dólares'], ['EUR', 'Euros'], ['CNY', 'Yuanes']], o ? o.moneda : 'PEN')) +
        campo('oc-tc', 'Tipo de cambio', inp('oc-tc', o ? o.tc : 1, ' inputmode="decimal"')) + '</div><div class="tabla-caja"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Costo unitario (en su moneda)</th></tr></thead><tbody>' +
        [0, 1, 2, 3, 4, 5, 6, 7].map(function(i){ var l = o && o.lineas[i]; return '<tr><td>' + inp('ol-v' + i, l ? l.sku + ' · ' + l.d : '', ' list="dl-var"') + '</td><td>' + inp('ol-c' + i, l ? l.c : '', ' inputmode="decimal" style="max-width:100px"') + '</td><td>' + inp('ol-co' + i, l ? l.costo : '', ' inputmode="decimal" style="max-width:120px"') + '</td></tr>'; }).join('') +
        '</tbody></table></div>' + (imp ? campo('oc-g', 'Gastos de importación en soles (uno por línea: «flete = 380», «seguro», «ad_valorem», «agente», «almacen», «transporte», «otros»)', '<textarea id="oc-g" rows="3" class="mono">' +
          esc((o && o.gastos || []).map(function(g){ return g.concepto + ' = ' + g.monto; }).join('\n')) + '</textarea>', 'Se reparten entre las líneas según su valor: así sale el costo puesto en almacén.') : ''),
      botones:[{ t:'Cancelar', c:'sec' }].concat(o ? [{ t:'Anular', c:'mal', a:function(api){ guarda(api, rpc('erp_oc_anular', { id:o.id }), 'Anulada.', function(){ PINTAR.compras('ordenes'); }); } }] : [])
        .concat([{ t:'Guardar borrador', c:'sec', a:function(api){ guardarOC(api, o, 'borrador'); } }, { t:'Emitir', a:function(api){ guardarOC(api, o, 'emitida'); } }]) });
  });
}
function guardarOC(api, o, estado){
  var L = [], G = [];
  for(var i = 0; i < 8; i++){ if(!val('ol-v' + i)) continue; var v = varDe(val('ol-v' + i)); if(!v) return api.msg('«' + val('ol-v' + i) + '» no está en tu lista.'); L.push({ v:v.id, c:val('ol-c' + i).replace(',', '.'), costo:val('ol-co' + i).replace(',', '.') }); }
  if($('oc-g')) val('oc-g').split('\n').forEach(function(x){ var p = x.split('='); if(p.length === 2 && p[0].trim()) G.push({ concepto:p[0].trim().toLowerCase().replace(/ /g, '_'), monto:p[1].trim().replace(',', '.') }); });
  var p = { proveedor:val('oc-p'), tipo:val('oc-t'), moneda:val('oc-m'), tc:val('oc-tc').replace(',', '.'), lineas:L, gastos:G, estado:estado }; if(o) p.id = o.id;
  guarda(api, rpc('erp_oc_guardar', p), estado === 'emitida' ? 'Orden emitida.' : 'Borrador guardado.', function(){ PINTAR.compras('ordenes'); });
}
function formRecibir(o){
  hoja({ titulo:'Recibir ' + o.numero, ancha:true, html:'<div class="tabla-caja"><table><thead><tr><th>Producto</th><th class="num">Falta</th><th>Llega ahora</th><th>Lote</th><th>Vence</th></tr></thead><tbody>' + (o.lineas || []).map(function(l, i){
      var f = Number(l.c) - Number(l.rec || 0); return '<tr><td>' + esc(l.d) + '<span class="sub mono">' + esc(l.sku) + '</span></td><td class="num">' + num(f) + '</td><td>' + inp('rc-c' + i, f > 0 ? f : '', ' inputmode="decimal" style="max-width:100px"' + (f > 0 ? '' : ' disabled')) + '</td>' +
        '<td>' + inp('rc-l' + i, '', ' maxlength="40" class="mono" style="max-width:120px"') + '</td><td>' + inp('rc-v' + i, '', ' type="date"' + (l.maneja_vence ? '' : ' disabled')) + '</td></tr>'; }).join('') + '</tbody></table></div>',
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Recibir', a:function(api){ var L = [];
      (o.lineas || []).forEach(function(l, i){ var c = val('rc-c' + i); if(c && Number(c.replace(',', '.')) > 0) L.push({ i:i, c:c.replace(',', '.'), lote:val('rc-l' + i), vence:val('rc-v' + i) }); });
      guarda(api, rpc('erp_oc_recibir', { id:o.id, lineas:L }), 'Recibido: entró al almacén con su costo puesto.', function(){ catVariantes(true); PINTAR.compras('ordenes'); toast('Revisa en Despachos si hay pedidos con backorder para reservar.'); }); } }] });
}
function comProveedores(){
  rpc('erp_proveedores').then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.provs = j.lista;
    $('cargando').outerHTML = '<div class="filtros"><button type="button" class="bt" data-a="provNuevo">Nuevo proveedor</button></div>' + tabla([{ t:'Proveedor', k:function(p){ return '<b>' + esc(p.razon_social) + '</b><span class="sub mono">' + esc((p.pais || '') + ' · ' + (p.ruc || '')) + '</span>'; } },
      { t:'Entrega', k:function(p){ return p.dias_entrega != null ? num(p.dias_entrega) + ' días' : '—'; } }, { t:'Correo', k:function(p){ return esc(p.correo || ''); } }], j.lista, { a:'provAbrir', vacio:'Sin proveedores' });
  });
}
ACC.provNuevo = function(){ formProveedor(null); };
ACC.provAbrir = function(b){ formProveedor((ERP.cache.provs || []).filter(function(p){ return p.id === b.getAttribute('data-id'); })[0]); };
function formProveedor(p){
  hoja({ titulo:p ? p.razon_social : 'Nuevo proveedor', html:campo('pv-rs', 'Razón social', inp('pv-rs', p ? p.razon_social : '', ' maxlength="160"')) + '<div class="campos">' +
      campo('pv-pais', 'País (código de 2 letras)', inp('pv-pais', p ? p.pais : 'PE', ' maxlength="2"')) + campo('pv-ruc', 'RUC o identificación fiscal', inp('pv-ruc', p ? p.ruc : '', ' maxlength="20"')) +
      campo('pv-dias', 'Días de entrega', inp('pv-dias', p ? p.dias_entrega : '', ' inputmode="numeric"')) + '</div>' + campo('pv-co', 'Correo de la empresa', inp('pv-co', p ? p.correo : '', ' type="email" maxlength="160"')),
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Guardar', a:function(api){ var x = { razon_social:val('pv-rs'), pais:val('pv-pais').toUpperCase(), ruc:val('pv-ruc'), dias_entrega:val('pv-dias'), correo:val('pv-co') }; if(p) x.id = p.id;
      guarda(api, rpc('erp_proveedor_guardar', x), 'Proveedor guardado.', function(){ PINTAR.compras('proveedores'); }); } }] });
}
function comGrupal(){
  rpc('erp_grupal').then(function(j){
    if(!j || !j.ok) return fuera(j);
    $('cargando').outerHTML = '<div class="aviso neu">Varios aliados juntan su pedido para comprar por volumen. Es anónima: se ve el total y cuántos se sumaron, nunca quiénes.</div>' +
      '<div class="filtros"><button type="button" class="bt" data-a="grupalNueva">Proponer una compra grupal</button></div>' +
      tabla([{ t:'Producto', k:function(g){ return '<b>' + esc(g.descripcion) + '</b>' + (g.mia ? ' ' + pill('la propusiste', 'az') : '') + '<span class="sub">' + esc(g.norma || '') + '</span>'; } },
        { t:'Avance', k:function(g){ return num(g.total) + ' / ' + num(g.meta) + ' ' + esc(g.unidad) + '<span class="sub">' + num(g.participantes) + ' aliado' + (g.participantes === 1 ? '' : 's') + ' · cierra el ' + fecha(g.cierre) + '</span>'; } },
        { t:'Lo tuyo', n:1, k:function(g){ return g.mi_cantidad != null ? num(g.mi_cantidad) : '—'; } },
        { t:'', k:function(g){ return g.estado === 'abierta' ? '<button type="button" class="bt sec mini" data-a="grupalSumarme" data-id="' + esc(g.id) + '">' + (g.mi_cantidad != null ? 'Cambiar' : 'Sumarme') + '</button>' : pill('cerrada'); } }], j.lista, { vacio:'Ninguna abierta' });
  });
}
ACC.grupalNueva = function(){
  hoja({ titulo:'Proponer una compra grupal', html:campo('gp-d', 'Qué se compra', inp('gp-d', '', ' maxlength="160"')) + '<div class="campos">' + campo('gp-n', 'Norma', inp('gp-n', '', ' maxlength="60"')) +
      campo('gp-m', 'Meta (cantidad total)', inp('gp-m', '', ' inputmode="decimal"')) + campo('gp-c', 'Tu cantidad', inp('gp-c', '', ' inputmode="decimal"')) + campo('gp-f', 'Cierra el', inp('gp-f', masDias(hoyLima(), 14), ' type="date"')) + '</div>',
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Proponer', a:function(api){ guarda(api, rpc('erp_grupal_crear', { descripcion:val('gp-d'), norma:val('gp-n'), meta:val('gp-m'), cantidad:val('gp-c'), cierre:val('gp-f') }), 'Propuesta publicada.', function(){ PINTAR.compras('grupal'); }); } }] });
};
ACC.grupalSumarme = function(b){ pedirTexto('Sumarme a la compra grupal', 'Mi cantidad (0 = salir)', function(c, api){ guarda(api, rpc('erp_grupal_sumarme', { id:b.getAttribute('data-id'), cantidad:c.replace(',', '.') }), 'Listo.', function(){ PINTAR.compras('grupal'); }); }); };
