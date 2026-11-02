/* OBRASST · ERP Distribuidor · ventas: la Bandeja OBRASST (con el cotizador automático), cotizaciones, pedidos, clientes,
   mostrador, listas de precios, licitaciones, reposición predictiva y alternativas por norma. (2/11/2026) */
'use strict';

/* ══ BANDEJA OBRASST ══ */
var BAN = { filtro:'', abierta:null };
PINTAR.bandeja = function(sub){
  if(sub && /^[0-9a-f-]{36}$/.test(sub)) return abrirSolicitud(sub);
  var y = ERP.yo, cupo = y.cupo_mes || {};
  $('vista').innerHTML = cabecera('bandeja') + (cupo.max ? '<div class="aviso ' + (cupo.usadas >= cupo.max ? 'mal' : 'neu') + '">Plan Aliado: respondiste <b>' + num(cupo.usadas) + ' de ' + num(cupo.max) +
    '</b> solicitudes este mes.' + (cupo.usadas >= cupo.max ? ' Pasa a Pro en «Mi plan» para responder sin tope.' : '') + '</div>' : '') + '<p class="ayuda" id="cargando">Cargando las solicitudes…</p>';
  rpcCrudo('sst_ali_bandeja', {}).then(function(j){
    if(!j || !j.ok) return fuera(j);
    var L = j.lista || [], g = function(f){ var k = COT.estadoAliado(f).k; return (k === 'nuevo' || k === 'pendiente' || k === 'vencido') ? 'pend' : k === 'respondido' ? 'resp' : (k === 'ganado' || k === 'recibido') ? 'gan' : 'otros'; };
    var c = { pend:0, resp:0, gan:0, todos:L.length }; L.forEach(function(f){ if(c[g(f)] != null) c[g(f)]++; });
    if(!BAN.filtro || !c[BAN.filtro]) BAN.filtro = c.pend ? 'pend' : 'todos';
    var F = L.filter(function(f){ return BAN.filtro === 'todos' || g(f) === BAN.filtro; });
    $('cargando').outerHTML = '<div class="filtros">' + [['pend', 'Por responder'], ['resp', 'Respondidas'], ['gan', 'Ganadas'], ['todos', 'Todas']].map(function(x){
        return '<button type="button" data-a="banFiltro" data-id="' + x[0] + '" class="' + (BAN.filtro === x[0] ? 'on' : '') + '">' + esc(x[1]) + ' · ' + c[x[0]] + '</button>'; }).join('') + '</div>' +
      tabla([{ t:'Solicitud', k:function(f){ return '<span class="mono">' + esc(f.numero ? 'RQ ' + f.numero : COT.diaDe(f.creado)) + '</span><span class="sub">' + esc(COT.rubroNombre(f.rubro)) + '</span>'; } },
        { t:'Empresa', k:function(f){ return '<b>' + esc(f.empresa || '') + '</b><span class="sub">' + esc([f.obra, COT.lugarTxt(f.lugar)].filter(Boolean).join(' · ')) + '</span>'; } },
        { t:'Líneas', n:1, k:function(f){ return num(f.lineas); } }, { t:'Responder hasta', k:function(f){ return f.hasta ? COT.dma(f.hasta) : '—'; } },
        { t:'Estado', k:function(f){ var E = COT.estadoAliado(f); return pill(E.n, E.c === 'nuevo' ? 'med' : E.c); } }, { t:'Total', n:1, k:function(f){ return f.total != null ? soles(f.total) : ''; } }],
        F, { a:'banAbrir', vacio:L.length ? 'Ninguna aquí' : 'Todavía no te llegó ninguna solicitud', vacioSub:L.length ? 'Prueba con otro filtro.' : 'Cuando una empresa de tu zona pida algo de tu rubro, aparece aquí.' });
  });
};
ACC.banFiltro = function(b){ BAN.filtro = b.getAttribute('data-id'); PINTAR.bandeja(); };
ACC.banAbrir = function(b){ irA('bandeja', b.getAttribute('data-id')); };
function abrirSolicitud(id){
  $('vista').innerHTML = '<div class="acciones" style="margin:0 0 12px"><button type="button" class="bt sec mini" data-ir="bandeja">← Bandeja</button></div><p class="ayuda" id="cargando">Abriendo la solicitud…</p>';
  var conErp = tieneModulo('ventas') && ERP.yo.activo;
  Promise.all([rpcCrudo('sst_ali_pedido', { p_id:id }), conErp ? rpc('erp_bandeja_sugerir', { id:id }) : Promise.resolve(null), conErp ? catVariantes() : Promise.resolve(null),
               conErp ? rpc('erp_cotizaciones', {}) : Promise.resolve(null)]).then(function(r){
    var j = r[0], sg = r[1];
    if(!j || !j.ok) return fuera(j);
    var f = j.pedido, E = COT.estadoAliado(f), items = f.items || [], abierta = f.cot_estado === 'abierta' && ['ganado', 'no_adjudicado'].indexOf(f.estado) < 0;
    var cq = r[3] && r[3].ok ? (r[3].lista || []).filter(function(q){ return q.destino === id; })[0] : null;
    BAN.abierta = { f:f, sg:sg, cq:cq };
    var h = '<div class="tarj"><div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap"><div><h2>Solicitud' + (f.numero ? ' · RQ ' + esc(f.numero) : '') + '</h2>' +
      '<p class="ayuda">' + esc(f.empresa || '') + ' · ' + esc([f.obra, COT.lugarTxt(f.lugar)].filter(Boolean).join(' · ')) + '</p></div>' + pill(E.n, E.c) + '</div>' +
      '<p class="chico" style="margin-top:8px">' + [f.entrega ? 'Entrega en ' + esc(f.entrega) : '', f.para ? 'Se necesita para el ' + esc(COT.dma(f.para)) : '', f.hasta ? 'Responder hasta el ' + esc(COT.dma(f.hasta)) : '', f.por_nombre ? 'Pidió ' + esc(f.por_nombre) : ''].filter(Boolean).join(' · ') + '</p>' +
      (f.nota ? '<p style="margin-top:6px"><b>Nota:</b> ' + esc(f.nota) + '</p>' : '') + '</div>';
    /* lo mismo que mostraba el Portal de Aliados de la fase 1: la orden, el RUC para facturar, la nota de la empresa y si ya recibió */
    if(E.k === 'ganado' || E.k === 'recibido') h += '<div class="aviso ok"><b>Ganaste.</b>' + (f.oc ? ' Orden de compra: <b>' + esc(f.oc) + '</b>.' : '') + (f.ruc ? ' RUC de la empresa: ' + esc(f.ruc) + '.' : '') +
      (f.adj_nota ? '<br>Nota de la empresa: ' + esc(f.adj_nota) : '') +
      (f.recibido ? '<br>' + (f.recibido.k === 'atendido' ? 'Su almacén registró el ingreso de todo' : 'Su almacén registró el ingreso de una parte') + (f.recibido.t ? ' el ' + esc(COT.diaDe(f.recibido.t)) : '') + '.'
                  : '<br>Cuando su almacén registre el ingreso, lo verás aquí como «Recibido en almacén».') +
      (cq && !cq.pedido && conErp ? ' <button type="button" class="bt casco mini" data-a="cotPedido" data-id="' + esc(cq.id) + '">Crear el pedido</button>' : cq && cq.pedido ? ' Pedido creado.' : '') + '</div>';
    else if(E.k === 'no') h += '<div class="aviso neu">La empresa eligió otra oferta. Gracias por cotizar: la próxima vez puede ser la tuya.</div>';
    else if(E.k === 'anulado') h += '<div class="aviso neu">La empresa anuló esta solicitud: ya no se responde.</div>';
    else if(E.k === 'vencido') h += '<div class="aviso ojo">Ya pasó la fecha para responder (' + esc(COT.dma(f.hasta)) + '). Todavía puedes mandar tu cotización mientras la empresa no adjudique.</div>';
    if(abierta && conErp && sg && sg.ok){
      h += '<div class="tarj"><h2>Cotizador automático</h2><p class="ayuda" style="margin:0 0 10px">Para cada línea, lo de tu almacén que la cumple (por norma o por nombre), con lo disponible y tu precio. Cambia lo que quieras; la empresa ve el precio sin IGV, la marca y el plazo.</p>' +
        '<div class="tabla-caja"><table><thead><tr><th>Pide la empresa</th><th>De tu almacén</th><th class="num">Precio (sin IGV)</th><th>Marca o norma</th></tr></thead><tbody>' +
        sg.lineas.map(function(l, i){ var c0 = l.candidatos[0], prev = f.resp && f.resp.l && f.resp.l[i];
          return '<tr><td><b>' + esc(l.pedido.d) + '</b>' + (l.pedido.e ? '<span class="sub">' + esc(l.pedido.e) + '</span>' : '') + '<span class="sub">' + esc(num(l.pedido.c) + ' ' + (l.pedido.u || 'und')) + '</span></td>' +
            '<td>' + sel('bc-v' + i, [['', 'No cotizo esta línea']].concat(l.candidatos.map(function(c){ return [c.v, c.sku + ' · ' + c.d + ' · disp. ' + num(c.disp) + (c.precio != null ? ' · ' + soles(c.precio) : '')]; })), c0 ? c0.v : '', ' data-i="' + i + '" class="bc-sel"') +
            (c0 && c0.disp < Number(l.pedido.c) ? '<span class="sub margen-medio">Disponible menos de lo pedido: puedes cotizar igual (queda en backorder)</span>' : '') + '</td>' +
            '<td class="num">' + inp('bc-p' + i, prev && prev.p != null ? prev.p : (c0 && c0.precio != null ? c0.precio : ''), ' inputmode="decimal" style="max-width:110px"') + '</td>' +
            '<td>' + inp('bc-m' + i, prev && prev.m ? prev.m : (c0 ? [c0.marca].concat((c0.normas || []).map(function(n){ return n.n + (n.nivel ? ' ' + n.nivel : ''); })).filter(Boolean).join(' · ').slice(0, 80) : ''), ' maxlength="80"') + '</td></tr>'; }).join('') +
        '</tbody></table></div><div class="campos">' + campo('bc-dias', 'Entrega en (días)', inp('bc-dias', f.resp ? f.resp.dias : 2, ' inputmode="numeric"')) +
        campo('bc-val', 'Válida hasta', inp('bc-val', f.resp ? f.resp.validez : masDias(hoyLima(), 15), ' type="date"')) +
        campo('bc-cond', 'Condición', sel('bc-cond', [['contado', 'Contado'], ['credito30', 'Crédito 30 días'], ['credito60', 'Crédito 60 días'], ['credito90', 'Crédito 90 días']], 'contado')) +
        campo('bc-pago', 'Forma de pago (texto)', inp('bc-pago', f.resp ? f.resp.pago : '', ' maxlength="60" placeholder="Transferencia, crédito…"')) + '</div>' +
        campo('bc-nota', 'Nota para la empresa (opcional)', inp('bc-nota', f.resp ? f.resp.nota : '', ' maxlength="300"')) +
        '<div class="acciones"><button type="button" class="bt" data-a="banResponder">' + (f.estado === 'respondido' ? 'Actualizar mi cotización' : 'Enviar mi cotización') + '</button>' +
        (f.estado !== 'declinado' ? '<button type="button" class="bt sec" data-a="banDeclinar">No cotizo</button>' : '') + '</div><p class="msg" id="bc-msg"></p></div>';
    } else if(abierta){
      h += '<div class="tarj"><h2>Tu cotización</h2><p class="ayuda" style="margin:0 0 10px">Precio unitario de cada línea, en soles. La empresa la ve en su cuadro comparativo.</p>' + COT.respFormHTML(items, 'r-', f.resp) +
        '<div class="acciones"><button type="button" class="bt" data-a="banResponderSimple">' + (f.estado === 'respondido' ? 'Actualizar mi cotización' : 'Enviar mi cotización') + '</button>' +
        (f.estado !== 'declinado' ? '<button type="button" class="bt sec" data-a="banDeclinar">No cotizo</button>' : '') + '</div><p class="msg" id="bc-msg"></p>' +
        (!tieneModulo('ventas') ? '<p class="ayuda" style="margin-top:10px">Con un plan ERP, esta solicitud se cotiza sola con lo que tienes en tu almacén.</p>' : '') + '</div>';
    } else {
      var rr = f.resp;
      h += '<div class="tarj"><h2>' + (rr ? 'Tu cotización' : 'Lo que pidieron') + '</h2>' + tabla([{ t:'Línea', k:function(it){ return '<b>' + esc(it.d) + '</b>' + (it.e ? '<span class="sub">' + esc(it.e) + '</span>' : ''); } },
        { t:'Cantidad', n:1, k:function(it){ return num(it.c) + ' ' + esc(it.u || 'und'); } }].concat(rr ? [{ t:'Precio', n:1, k:function(it, i){ var l = rr.l && rr.l[i] || {}; return l.p != null ? soles(l.p) : '<span class="gris">No cotizó</span>'; } },
        { t:'Marca', k:function(it, i){ return esc((rr.l && rr.l[i] || {}).m || ''); } }] : []), items) + '</div>';
    }
    $('cargando').outerHTML = h;
    if(abierta && !(conErp && sg && sg.ok)) COT.respVivo('r-', items);
    [].forEach.call(document.querySelectorAll('.bc-sel'), function(s){ s.onchange = function(){ var i = +s.getAttribute('data-i'), c = (sg.lineas[i].candidatos || []).filter(function(x){ return x.v === s.value; })[0];
      if(c){ $('bc-p' + i).value = c.precio != null ? c.precio : ''; $('bc-m' + i).value = [c.marca].concat((c.normas || []).map(function(n){ return n.n + (n.nivel ? ' ' + n.nivel : ''); })).filter(Boolean).join(' · ').slice(0, 80); } else $('bc-p' + i).value = ''; }; });
  });
}
ACC.banResponder = function(b){
  var f = BAN.abierta.f, sg = BAN.abierta.sg, m = $('bc-msg');
  var lineas = sg.lineas.map(function(l, i){ var v = val('bc-v' + i); return { v:v, p:v ? val('bc-p' + i).replace(',', '.') : '', m:val('bc-m' + i) }; });
  if(!lineas.some(function(l){ return l.p !== ''; })){ m.className = 'msg mal'; m.textContent = 'Cotiza al menos una línea.'; return; }
  b.disabled = true; m.className = 'msg'; m.textContent = 'Enviando…';
  rpc('erp_bandeja_responder', { id:f.id, lineas:lineas, dias:val('bc-dias'), validez:val('bc-val'), condicion:val('bc-cond'), pago:val('bc-pago'), nota:val('bc-nota') }).then(function(j){
    b.disabled = false;
    if(!j || !j.ok){ m.className = 'msg mal'; m.textContent = mensaje(j); return; }
    toast('Cotización enviada: ' + soles(j.total) + ' con IGV' + (j.margen != null ? ' · margen ' + num(j.margen, 1) + ' %' : j.margen_nivel ? ' · margen ' + j.margen_nivel : ''));
    contarBandeja(); PINTAR.bandeja(f.id);
  });
};
ACC.banResponderSimple = function(b){
  var f = BAN.abierta.f, items = f.items || [], m = $('bc-msg'), v = COT.validar(COT.respLeer('r-', items), items);
  if(!v.ok){ m.className = 'msg mal'; m.textContent = v.msg; return; }
  b.disabled = true;
  rpcCrudo('sst_ali_responder', { p:{ id:f.id, resp:v.resp } }).then(function(j){
    b.disabled = false;
    if(!j || !j.ok){ m.className = 'msg mal'; m.textContent = mensaje(j); return; }
    toast(j.total != null ? 'Cotización enviada: ' + soles(j.total) + ' con IGV. La empresa ya la ve.' : 'Cotización enviada.'); contarBandeja(); rpc('erp_yo').then(function(y){ if(y && y.ok) ERP.yo = y; }); PINTAR.bandeja(f.id);
  });
};
ACC.banDeclinar = function(){
  var f = BAN.abierta.f;
  hoja({ titulo:'No cotizo esta solicitud', html:campo('bd-nota', '¿Por qué? (opcional, lo ve la empresa)', inp('bd-nota', '', ' maxlength="300" placeholder="Por ejemplo: sin stock de esa talla"')),
    botones:[{ t:'Mejor cotizo', c:'sec' }, { t:'No cotizo', c:'mal', a:function(api){ guarda(api, rpcCrudo('sst_ali_declinar', { p:{ id:f.id, nota:val('bd-nota') } }), 'Marcada: no cotizas.', function(){ PINTAR.bandeja(f.id); }); } }] });
};

/* ══ VENTAS EXTERNAS ══ */
PINTAR.ventas = function(sub){
  var subs = [['cotizaciones', 'Cotizaciones'], ['pedidos', 'Pedidos'], ['clientes', 'Clientes'], ['mostrador', 'Mostrador']];
  if(esAdmin()) subs.push(['precios', 'Listas de precios']);
  if(tieneModulo('equivalencias')) subs.push(['licitacion', 'Licitación (Excel)'], ['alternativas', 'Alternativas por norma']);
  if(tieneModulo('recompra')) subs.push(['reposicion', 'Reposición']);
  sub = subs.some(function(x){ return x[0] === sub; }) ? sub : 'cotizaciones';
  $('vista').innerHTML = cabecera('ventas', subs, sub) + '<p class="ayuda" id="cargando">Cargando…</p>';
  ({ cotizaciones:venCotizaciones, pedidos:venPedidos, clientes:venClientes, mostrador:venMostrador, precios:venPrecios, licitacion:venLicitacion, alternativas:venAlternativas, reposicion:venReposicion })[sub]();
};
var EST_COT = { borrador:['Borrador', ''], enviada:['Enviada', 'az'], aceptada:['Aceptada', 'ok'], rechazada:['Rechazada', 'mal'], vencida:['Vencida', 'med'], anulada:['Anulada', ''] };
function nivelMargen(q){ return q.margen_pct != null ? '<span class="margen-' + esc(q.margen_nivel) + '">' + num(q.margen_pct, 1) + ' %</span>' : q.margen_nivel ? '<span class="margen-' + esc(q.margen_nivel) + '">' + esc(q.margen_nivel) + '</span>' : '—'; }
function venCotizaciones(){
  rpc('erp_cotizaciones', { q:ERP.cache.qCot || '' }).then(function(j){
    if(!j || !j.ok) return fuera(j);
    $('cargando').outerHTML = '<div class="filtros"><button type="button" class="bt" data-a="cotNueva">Nueva cotización</button><input id="q-cot" placeholder="Buscar por número o cliente" value="' + esc(ERP.cache.qCot || '') + '"></div>' +
      tabla([{ t:'Número', k:function(q){ return '<span class="mono">' + esc(q.numero) + '</span><span class="sub">' + esc({ obrasst:'Bandeja OBRASST', externa:'Externa', pos:'Mostrador', reposicion:'Reposición', licitacion:'Licitación' }[q.origen] || q.origen) + '</span>'; } },
        { t:'Cliente', k:function(q){ return esc(q.cliente_nombre || '—') + '<span class="sub">' + fecha(q.creado) + (q.vendedor ? ' · ' + esc(q.vendedor) : '') + '</span>'; } },
        { t:'Total', n:1, k:function(q){ return soles(q.total); } }, { t:'Margen', n:1, k:nivelMargen },
        { t:'Estado', k:function(q){ var e = EST_COT[q.estado] || [q.estado, '']; return pill(e[0], e[1]) + (q.pedido ? ' ' + pill('con pedido', 'ok') : ''); } }], j.lista, { a:'cotAbrir', vacio:'Sin cotizaciones', vacioSub:'Crea la primera con «Nueva cotización».' });
    var q = $('q-cot'); q.onkeydown = function(e){ if(e.key === 'Enter'){ ERP.cache.qCot = q.value; venCotizaciones2(); } };
  });
}
function venCotizaciones2(){ PINTAR.ventas('cotizaciones'); }
ACC.cotNueva = function(){ editorCotizacion(null); };
ACC.cotAbrir = function(b){ rpc('erp_cotizacion', { id:b.getAttribute('data-id') }).then(function(j){ if(!j || !j.ok){ toast(mensaje(j)); return; } editorCotizacion(j); }); };
function lineaHTML(i, l){
  return '<tr data-l="' + i + '"><td>' + inp('cl-v' + i, l && l.v ? ((varPorId(l.v) || {}).sku || l.sku || '') + ' · ' + ((varPorId(l.v) || {}).n || l.d || '') : '', ' list="dl-var" placeholder="SKU o producto" style="min-width:220px"') + '</td>' +
    '<td>' + inp('cl-c' + i, l ? l.c : '', ' inputmode="decimal" style="max-width:90px"') + '</td><td>' + inp('cl-p' + i, l && l.pm ? l.p : '', ' inputmode="decimal" placeholder="lista" style="max-width:100px"') + '</td>' +
    '<td>' + inp('cl-d' + i, l && l.dm ? l.desc : '', ' inputmode="decimal" placeholder="0" style="max-width:70px"') + '</td><td class="num" id="cl-r' + i + '"></td><td><button type="button" class="x" data-a="cotQuitar" data-id="' + i + '" aria-label="Quitar la línea">×</button></td></tr>';
}
function varPorId(id){ return (ERP.cache.var || []).filter(function(v){ return v.id === id; })[0]; }
var COTE = { n:0, q:null, calc:null };
function editorCotizacion(j){
  Promise.all([catVariantes(), catClientes()]).then(function(){
    var q = j ? j.cotizacion : null, cerrada = q && ['borrador', 'enviada'].indexOf(q.estado) < 0;
    COTE = { n:0, q:q, calc:q };
    var cli = q ? (ERP.cache.cli || []).filter(function(c){ return c.id === q.cliente; })[0] : null;
    hoja({ titulo:q ? 'Cotización ' + q.numero : 'Nueva cotización', ancha:true,
      html:listaVar('dl-var') + listaCli('dl-cli') + '<div class="campos">' + campo('co-cli', 'Cliente', inp('co-cli', cli ? (cli.num_doc || 's/d') + ' · ' + cli.razon_social : '', ' list="dl-cli" placeholder="RUC o razón social"')) +
        campo('co-cond', 'Condición', sel('co-cond', [['contado', 'Contado'], ['credito30', 'Crédito 30 días'], ['credito60', 'Crédito 60 días'], ['credito90', 'Crédito 90 días']], q ? q.condicion : 'contado')) +
        campo('co-val', 'Válida hasta', inp('co-val', q ? q.validez : masDias(hoyLima(), 15), ' type="date"')) + campo('co-dias', 'Entrega en (días)', inp('co-dias', q ? q.dias_entrega : '', ' inputmode="numeric"')) +
        campo('co-dist', 'Distrito de entrega (flete)', inp('co-dist', q ? q.distrito : (cli && cli.distrito) || '', ' placeholder="LIMA/LIMA/SAN ISIDRO"')) + '</div>' +
        '<div class="tabla-caja"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio (sin IGV)</th><th>Desc. %</th><th class="num">Subtotal</th><th></th></tr></thead><tbody id="co-lineas"></tbody></table></div>' +
        '<div class="acciones" style="margin:-4px 0 12px"><button type="button" class="bt sec mini" data-a="cotLinea">+ Línea</button><button type="button" class="bt sec mini" data-a="cotCalcular">Calcular</button></div>' +
        '<div id="co-tot"></div>' + campo('co-nota', 'Nota (sale en la cotización)', '<textarea id="co-nota" rows="2" maxlength="600">' + esc(q ? q.nota || '' : '') + '</textarea>'),
      botones:(cerrada ? [] : [{ t:'Guardar', a:function(api){ guardarCotizacion(api); } }]).concat(q ? [{ t:'PDF', c:'sec', a:function(){ docs().then(function(D){ D.cotizacion(j); }); } },
        { t:'WhatsApp', c:'sec', a:function(){ wa('Hola, le envío la cotización ' + q.numero + ' de ' + ERP.yo.aliado.razon + ' por ' + soles(q.total) + ' (IGV incluido), válida hasta el ' + fecha(q.validez) + '. Le adjunto el PDF.', j.cliente && j.cliente.telefono); } }]
        .concat(q.estado === 'borrador' ? [{ t:'Marcar enviada', c:'sec', a:function(api){ guarda(api, rpc('erp_cotizacion_estado', { id:q.id, estado:'enviada' }), 'Marcada como enviada.', function(){ PINTAR.ventas('cotizaciones'); }); } }] : [])
        .concat(!q.pedido && ['borrador', 'enviada'].indexOf(q.estado) >= 0 ? [{ t:'Crear pedido', c:'casco', a:function(api){ crearPedidoDe(api, q.id); } }] : []) : []),
      alAbrir:function(){ (q ? q.lineas : [null, null]).forEach(function(l){ agregarLinea(l ? { v:l.v, c:l.c, p:l.p, desc:l.desc, pm:l.desc > 0, sku:l.sku, d:l.d } : null); }); if(q) pintarTotales(q); } });
  });
}
function agregarLinea(l){ var tb = $('co-lineas'); tb.insertAdjacentHTML('beforeend', lineaHTML(COTE.n, l)); COTE.n++; }
ACC.cotLinea = function(){ agregarLinea(null); };
ACC.cotQuitar = function(b){ var tr = b.closest('tr'); if(tr) tr.remove(); };
function leerCotizacion(){
  var cli = cliDe(val('co-cli')), L = [], mal = '';
  [].forEach.call(document.querySelectorAll('#co-lineas tr'), function(tr){
    var i = tr.getAttribute('data-l'), t = val('cl-v' + i); if(!t && !val('cl-c' + i)) return;
    var v = varDe(t); if(!v){ mal = 'La línea «' + t + '» no es un producto de tu lista.'; return; }
    var o = { v:v.id, c:val('cl-c' + i).replace(',', '.') };
    if(val('cl-p' + i)) o.p = val('cl-p' + i).replace(',', '.'); else if(val('cl-d' + i)) o.desc = val('cl-d' + i).replace(',', '.');
    L.push(o);
  });
  return { mal:mal || (!cli ? 'Elige un cliente de tu lista (o créalo en Clientes).' : !L.length ? 'Agrega al menos una línea.' : ''),
           p:{ cliente:cli && cli.id, lineas:L, condicion:val('co-cond'), validez:val('co-val'), dias_entrega:val('co-dias'), distrito:val('co-dist'), nota:val('co-nota') } };
}
ACC.cotCalcular = function(b){
  var r = leerCotizacion(), api = { msg:function(t){ $('co-tot').innerHTML = '<div class="aviso mal">' + esc(t) + '</div>'; } };
  if(r.mal) return api.msg(r.mal);
  rpc('erp_cotizar', r.p).then(function(j){ if(!j || !j.ok) return api.msg(mensaje(j) + (j && j.linea ? ' (línea ' + j.linea + ')' : '')); pintarTotales(j); });
};
function pintarTotales(t){
  var filas = document.querySelectorAll('#co-lineas tr');
  (t.lineas || []).forEach(function(l, k){ var tr = filas[k]; if(!tr) return; var i = tr.getAttribute('data-l'), c = $('cl-r' + i);
    if(c) c.innerHTML = soles(l.sub) + '<span class="sub">' + soles(l.p) + ' c/u' + (l.desc ? ' (−' + num(l.desc, 2) + ' %)' : '') + (l.disp != null ? ' · disp. ' + num(l.disp) : '') + '</span>'; });
  $('co-tot').innerHTML = '<div class="aviso neu" style="display:flex; flex-wrap:wrap; gap:6px 18px"><span>Subtotal <b>' + soles(t.subtotal) + '</b></span><span>IGV <b>' + soles(t.igv) + '</b></span><span>Total <b>' + soles(t.total) + '</b></span>' +
    (t.margen_neto != null ? '<span>Flete ' + soles(t.flete) + ' · crédito ' + soles(t.costo_credito) + ' · costo ' + soles(t.costo_total) + '</span><span>Margen neto <b class="margen-' + esc(t.margen_nivel) + '">' + soles(t.margen_neto) + ' (' + num(t.margen_pct, 1) + ' %)</b></span>'
      : '<span>Margen: <b class="margen-' + esc(t.margen_nivel) + '">' + esc(t.margen_nivel || '—') + '</b></span>') + '</div>';
}
function guardarCotizacion(api){
  var r = leerCotizacion(); if(r.mal) return api.msg(r.mal);
  if(COTE.q) r.p.id = COTE.q.id;
  guarda(api, rpc('erp_cotizacion_guardar', r.p), 'Cotización guardada.', function(j){ PINTAR.ventas('cotizaciones'); rpc('erp_cotizacion', { id:j.cotizacion.id }).then(function(x){ if(x && x.ok) editorCotizacion(x); }); });
}
function crearPedidoDe(api, cot){
  hoja({ titulo:'Crear el pedido', html:'<p>Se reserva el stock (lo que vence primero) y lo que falte queda en backorder. Si es a crédito, se revisa la línea del cliente.</p>' +
      campo('pe-dir', 'Dirección de entrega (opcional)', inp('pe-dir', '', ' maxlength="200"')) + campo('pe-ubi', 'Ubigeo de entrega (opcional)', inp('pe-ubi', '', ' maxlength="6" inputmode="numeric"')),
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Crear el pedido', c:'casco', a:function(h2){ var p = { cotizacion:cot, idem:nuevoIdem() }; if(val('pe-dir') || val('pe-ubi')) p.entrega = { direccion:val('pe-dir'), ubigeo:val('pe-ubi') };
      guarda(h2, rpc('erp_pedido_crear', p), null, function(j){ if(api && api.cerrar) api.cerrar(); toast('Pedido ' + j.pedido.numero + (j.pedido.backorder ? ' creado con backorder (falta stock).' : ' creado y reservado.')); irA('ventas', 'pedidos'); }); } }] });
}
ACC.cotPedido = function(b){ crearPedidoDe(null, b.getAttribute('data-id')); };

/* pedidos */
var EST_PED = { confirmada:['Confirmado', 'az'], parcial:['Despacho parcial', 'med'], despachada:['Despachado', 'ok'], anulada:['Anulado', ''] };
function venPedidos(){
  rpc('erp_pedidos', {}).then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.pedidos = j.lista;
    $('cargando').outerHTML = tabla([{ t:'Pedido', k:function(o){ return '<span class="mono">' + esc(o.numero) + '</span><span class="sub">' + fecha(o.creado) + '</span>'; } },
      { t:'Cliente', k:function(o){ return esc(o.cliente_nombre); } }, { t:'Total', n:1, k:function(o){ return o.total != null ? soles(o.total) : ''; } },
      { t:'Estado', k:function(o){ var e = EST_PED[o.estado] || [o.estado, '']; return pill(e[0], e[1]) + (o.backorder ? ' ' + pill('backorder', 'mal') : '') + (o.facturado ? ' ' + pill('facturado', 'ok') : ''); } }],
      j.lista, { a:'pedAbrir', vacio:'Sin pedidos', vacioSub:'Se crean desde una cotización.' });
  });
}
ACC.pedAbrir = function(b){
  var o = (ERP.cache.pedidos || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0]; if(!o) return;
  var abierto = o.estado === 'confirmada' || o.estado === 'parcial';
  hoja({ titulo:'Pedido ' + o.numero, ancha:true, html:'<p class="ayuda" style="margin:0 0 10px">' + esc(o.cliente_nombre) + ' · ' + esc({ contado:'Contado', credito30:'Crédito 30 días', credito60:'Crédito 60 días', credito90:'Crédito 90 días' }[o.condicion] || o.condicion) + '</p>' +
    tabla([{ t:'Producto', k:function(l){ return esc(l.d) + '<span class="sub mono">' + esc(l.sku) + '</span>'; } }, { t:'Pedido', n:1, k:function(l){ return num(l.c); } },
      { t:'Reservado', n:1, k:function(l){ return num((l.res || []).reduce(function(s, r){ return s + (r.comp ? 0 : Number(r.c)); }, 0)) + (l.tipo === 'kit' ? ' <span class="sub">kit</span>' : ''); } },
      { t:'Despachado', n:1, k:function(l){ return num(l.desp || 0); } }, { t:'Pendiente', n:1, k:function(l){ return l.pend > 0 ? '<b class="margen-bajo">' + num(l.pend) + '</b>' : '0'; } },
      { t:'Facturado', n:1, k:function(l){ return num(l.fact || 0); } }].concat(o.total != null ? [{ t:'Precio', n:1, k:function(l){ return soles(l.p); } }] : []), o.lineas),
    botones:[].concat(abierto && (esAdmin() || ERP.yo.papel === 'almacenero') ? [{ t:'Reservar lo pendiente', c:'sec', a:function(api){ guarda(api, rpc('erp_pedido_reservar', { id:o.id }), 'Reservado lo que había.', function(){ PINTAR.ventas('pedidos'); }); } },
        { t:'Emitir guía', a:function(api){ api.cerrar(); irA('despachos', 'pedidos'); } }] : [])
      .concat(puede('facturacion') && !o.facturado && o.estado !== 'anulada' ? [{ t:'Facturar', c:'casco', a:function(api){ api.cerrar(); ACC.facturarPedido(null, o); } }] : [])
      .concat(abierto && ERP.yo.papel !== 'almacenero' ? [{ t:'Anular', c:'mal', a:function(api){ pedirTexto('Anular el pedido ' + o.numero, 'Motivo', function(m, h2){ guarda(h2, rpc('erp_pedido_anular', { id:o.id, motivo:m }), 'Pedido anulado (lo reservado se liberó).', function(){ api.cerrar(); PINTAR.ventas('pedidos'); }); }); } }] : []) });
};

/* clientes (con la búsqueda del RUC en el padrón, el mismo servicio de la app) */
function venClientes(){
  catClientes(true).then(function(L){
    $('cargando').outerHTML = '<div class="filtros"><button type="button" class="bt" data-a="cliNuevo">Nuevo cliente</button></div>' +
      tabla([{ t:'Cliente', k:function(c){ return '<b>' + esc(c.razon_social) + '</b>' + (c.obrasst ? ' ' + pill('usa OBRASST', 'az') : '') + '<span class="sub mono">' + esc(({ '6':'RUC ', '1':'DNI ', '4':'CE ', '7':'Pas. ', '0':'' })[c.tipo_doc] + (c.num_doc || 's/d')) + '</span>'; } },
        { t:'Crédito', k:function(c){ return c.linea_credito ? soles(c.linea_credito) + ' · ' + c.dias_credito + ' días' : 'Contado'; } },
        { t:'Saldo', n:1, k:function(c){ return soles(c.saldo) + (c.vencido ? '<span class="sub margen-bajo">' + soles(c.vencido) + ' vencido</span>' : ''); } },
        { t:'Estado', k:function(c){ return c.bloqueado ? pill('bloqueado', 'mal') + '<span class="sub">' + esc(c.motivo_bloqueo || '') + '</span>' : pill('al día', 'ok'); } }], L, { a:'cliAbrir', vacio:'Sin clientes', vacioSub:'Crea el primero con «Nuevo cliente».' });
  });
}
ACC.cliNuevo = function(){ formCliente(null); };
ACC.cliAbrir = function(b){ formCliente((ERP.cache.cli || []).filter(function(c){ return c.id === b.getAttribute('data-id'); })[0]); };
function formCliente(c){
  var adm = esAdmin();
  hoja({ titulo:c ? c.razon_social : 'Nuevo cliente', html:'<div class="campos">' + campo('cf-td', 'Documento', sel('cf-td', [['6', 'RUC'], ['1', 'DNI'], ['4', 'Carné de extranjería'], ['7', 'Pasaporte'], ['0', 'Sin documento']], c ? c.tipo_doc : '6')) +
      campo('cf-nd', 'Número', '<div class="acciones" style="flex-wrap:nowrap">' + inp('cf-nd', c ? c.num_doc : '', ' maxlength="15" inputmode="numeric"') + '<button type="button" class="bt sec mini" data-a="cliSunat">SUNAT</button></div>') + '</div>' +
      campo('cf-rs', 'Razón social o nombre', inp('cf-rs', c ? c.razon_social : '', ' maxlength="160"')) + campo('cf-dir', 'Dirección', inp('cf-dir', c ? c.direccion : '', ' maxlength="200"')) +
      '<div class="campos">' + campo('cf-ubi', 'Ubigeo', inp('cf-ubi', c ? c.ubigeo : '', ' maxlength="6" inputmode="numeric"')) + campo('cf-dist', 'Distrito (para el flete)', inp('cf-dist', c ? c.distrito : '', ' placeholder="LIMA/LIMA/SAN ISIDRO"')) +
      campo('cf-correo', 'Correo de la empresa', inp('cf-correo', c ? c.correo : '', ' type="email" maxlength="160"')) + campo('cf-tel', 'Teléfono de la empresa', inp('cf-tel', c ? c.telefono : '', ' maxlength="20" inputmode="tel"')) + '</div>' +
      (adm ? '<div class="campos">' + campo('cf-linea', 'Línea de crédito (S/)', inp('cf-linea', c ? c.linea_credito : 0, ' inputmode="decimal"')) + campo('cf-dc', 'Días de crédito', sel('cf-dc', [['0', 'Contado'], ['30', '30'], ['60', '60'], ['90', '90']], c ? c.dias_credito : 0)) + '</div>' +
        '<label class="chk"><input type="checkbox" id="cf-ret"' + (c && c.agente_retencion ? ' checked' : '') + '> Es agente de retención del IGV (retiene 3 % en operaciones de más de S/ 700)</label>' +
        (c ? '<label class="chk"><input type="checkbox" id="cf-bloq"' + (c.bloqueado ? ' checked' : '') + '> Crédito bloqueado</label>' : '') : '') +
      '<p class="ayuda">Solo datos de la empresa cliente (su contacto corporativo). Nada de datos de sus trabajadores.</p>',
    botones:[{ t:'Cancelar', c:'sec' }].concat(c ? [{ t:'Estado de cuenta', c:'sec', a:function(api){ api.cerrar(); ERP.cache.ecCliente = c.id; irA('facturacion', 'estado'); } }] : []).concat([{ t:'Guardar', a:function(api){
      var p = { tipo_doc:val('cf-td'), num_doc:val('cf-nd'), razon_social:val('cf-rs'), direccion:val('cf-dir'), ubigeo:val('cf-ubi'), distrito:val('cf-dist'), correo:val('cf-correo'), telefono:val('cf-tel') };
      if(c) p.id = c.id;
      if(adm){ p.linea_credito = val('cf-linea'); p.dias_credito = val('cf-dc'); p.agente_retencion = val('cf-ret'); if(c){ p.bloqueado = val('cf-bloq'); } }
      guarda(api, rpc('erp_cliente_guardar', p), 'Cliente guardado.', function(){ ERP.cache.cli = null; if(ERP.sec === 'ventas' && ERP.sub === 'clientes') PINTAR.ventas('clientes'); }); } }]) });
}
ACC.cliSunat = function(b){
  var ruc = val('cf-nd').replace(/\D/g, '');
  if(!/^(10|15|16|17|20)[0-9]{9}$/.test(ruc)){ toast('Escribe un RUC de 11 dígitos.'); return; }
  b.disabled = true;
  fetch('https://openruc.com/api/ruc/' + encodeURIComponent(ruc)).then(function(r){ return r.ok ? r.json() : {}; }).then(function(j){
    b.disabled = false;
    var rs = String((j && (j.razon_social || j.razonSocial || j.nombre)) || '').trim();
    if(!rs){ toast('Ese RUC no figura en el padrón: revísalo o escribe los datos.'); return; }
    $('cf-rs').value = rs; var d = String(j.direccion || j.domicilio || '').trim(); if(d && d !== '-') $('cf-dir').value = d;
    if(j.ubigeo && /^[0-9]{6}$/.test(j.ubigeo)) $('cf-ubi').value = j.ubigeo;
    toast(String(j.estado || '').toUpperCase() && String(j.estado).toUpperCase() !== 'ACTIVO' ? 'Ojo: en SUNAT no figura como activo.' : 'Traído de SUNAT. Revísalo.');
  }, function(){ b.disabled = false; toast('No hubo conexión con el padrón.'); });
};

/* mostrador (venta inmediata: boleta o factura, sale del stock y queda cobrada) */
function venMostrador(){
  Promise.all([catVariantes(), catClientes()]).then(function(){
    $('cargando').outerHTML = listaVar('dl-var') + listaCli('dl-cli') + '<div class="tarj"><h2>Venta de mostrador</h2><div class="campos">' +
      campo('po-cli', 'Cliente (vacío = clientes varios)', inp('po-cli', '', ' list="dl-cli"')) + campo('po-tipo', 'Comprobante', sel('po-tipo', [['03', 'Boleta'], ['01', 'Factura']], '03')) +
      campo('po-medio', 'Medio de pago', sel('po-medio', [['efectivo', 'Efectivo'], ['yape', 'Yape'], ['plin', 'Plin'], ['tarjeta', 'Tarjeta'], ['transferencia', 'Transferencia']], 'efectivo')) + '</div>' +
      '<div class="tabla-caja"><table><thead><tr><th>Producto</th><th>Cantidad</th></tr></thead><tbody>' + [0, 1, 2, 3].map(function(i){ return '<tr><td>' + inp('po-v' + i, '', ' list="dl-var" placeholder="SKU, código de barras o producto"') + '</td><td>' + inp('po-c' + i, '', ' inputmode="decimal" style="max-width:100px"') + '</td></tr>'; }).join('') +
      '</tbody></table></div><button type="button" class="bt casco" data-a="posCobrar">Cobrar y emitir</button><p class="msg" id="po-msg"></p><div id="po-res"></div></div>';
  });
}
ACC.posCobrar = function(b){
  var L = [], m = $('po-msg'), mal = '';
  [0, 1, 2, 3].forEach(function(i){ var t = val('po-v' + i); if(!t) return; var v = varDe(t); if(!v){ mal = '«' + t + '» no está en tu lista.'; return; } L.push({ v:v.id, c:val('po-c' + i) || '1' }); });
  if(mal || !L.length){ m.className = 'msg mal'; m.textContent = mal || 'Agrega un producto.'; return; }
  var cli = val('po-cli') ? cliDe(val('po-cli')) : null;
  if(val('po-cli') && !cli){ m.className = 'msg mal'; m.textContent = 'Ese cliente no está en tu lista.'; return; }
  b.disabled = true; m.className = 'msg'; m.textContent = 'Emitiendo…';
  rpc('erp_pos_vender', { cliente:cli ? cli.id : '', lineas:L, tipo:val('po-tipo'), medio:val('po-medio'), idem:nuevoIdem() }).then(function(j){
    b.disabled = false;
    if(!j || !j.ok){ m.className = 'msg mal'; m.textContent = mensaje(j) + (j && j.sku ? ' (' + j.sku + ')' : ''); return; }
    m.className = 'msg ok'; m.textContent = j.factura.codigo + ' emitida y cobrada: ' + soles(j.factura.total) + '.';
    $('po-res').innerHTML = '<button type="button" class="bt sec mini" data-a="verComprobante" data-id="' + esc(j.factura.id) + '">Ver o imprimir el comprobante</button>';
    catVariantes(true);
  });
};

/* listas de precios (escalas por volumen) y precios por cliente */
function venPrecios(){
  Promise.all([rpc('erp_listas'), catVariantes(), catClientes()]).then(function(r){
    var j = r[0]; if(!j || !j.ok) return fuera(j);
    ERP.cache.listas = j.lista;
    $('cargando').outerHTML = '<div class="filtros"><button type="button" class="bt" data-a="listaNueva">Nueva lista</button><button type="button" class="bt sec" data-a="precioCliente">Precio especial para un cliente</button></div>' +
      tabla([{ t:'Lista', k:function(l){ return '<b>' + esc(l.nombre) + '</b>' + (l.por_defecto ? ' ' + pill('general', 'ok') : ''); } },
        { t:'Escalas por volumen', k:function(l){ return (l.escalas || []).map(function(e){ return 'desde ' + num(e.desde) + ': −' + num(e.desc) + ' %'; }).join(' · ') || '—'; } },
        { t:'Precios propios', n:1, k:function(l){ return num(Object.keys(l.precios || {}).length); } }], j.lista, { a:'listaAbrir', vacio:'Sin listas', vacioSub:'Sin lista, cada producto sale a su precio base.' }) +
      '<p class="ayuda">Orden del precio: el especial del cliente → su lista → la lista general → el de la variante → el del producto. El vendedor descuenta hasta ' + num((j.desc_max || {}).vendedor) + ' %.</p>';
  });
}
ACC.listaNueva = function(){ formLista(null); };
ACC.listaAbrir = function(b){ formLista((ERP.cache.listas || []).filter(function(l){ return l.id === b.getAttribute('data-id'); })[0]); };
function formLista(l){
  var V = ERP.cache.var || [];
  hoja({ titulo:l ? l.nombre : 'Nueva lista de precios', ancha:true, html:'<div class="campos">' + campo('li-n', 'Nombre', inp('li-n', l ? l.nombre : '', ' maxlength="60"')) + '</div>' +
      '<label class="chk"><input type="checkbox" id="li-def"' + (l && l.por_defecto ? ' checked' : '') + '> Es la lista general (la que se usa si el cliente no tiene otra)</label>' +
      campo('li-esc', 'Escalas por volumen (una por línea: «desde cantidad = % de descuento»)', '<textarea id="li-esc" rows="3" class="mono">' + esc(((l && l.escalas) || []).map(function(e){ return e.desde + ' = ' + e.desc; }).join('\n')) + '</textarea>') +
      '<div class="tabla-caja" style="max-height:340px; overflow:auto"><table><thead><tr><th>Producto</th><th class="num">Base</th><th>Precio en esta lista (sin IGV)</th></tr></thead><tbody>' +
      V.filter(function(v){ return v.tipo !== 'kit' || true; }).map(function(v){ return '<tr><td>' + esc(v.n) + '<span class="sub mono">' + esc(v.sku) + '</span></td><td class="num">' + (v.precio != null ? soles(v.precio) : '—') + '</td><td>' +
        inp('lp-' + v.id, l && l.precios && l.precios[v.id] != null ? l.precios[v.id] : '', ' inputmode="decimal" style="max-width:120px" data-v="' + v.id + '" class="lp"') + '</td></tr>'; }).join('') + '</tbody></table></div>',
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Guardar la lista', a:function(api){
      var esc_ = [], pre = {};
      val('li-esc').split('\n').forEach(function(x){ var p = x.split('='); if(p.length === 2 && p[0].trim()) esc_.push({ desde:p[0].trim(), desc:p[1].trim().replace(',', '.') }); });
      [].forEach.call(document.querySelectorAll('.lp'), function(i){ if(String(i.value).trim() !== '') pre[i.getAttribute('data-v')] = String(i.value).trim().replace(',', '.'); });
      var p = { nombre:val('li-n'), por_defecto:val('li-def'), escalas:esc_, precios:pre }; if(l) p.id = l.id;
      guarda(api, rpc('erp_lista_guardar', p), 'Lista guardada.', function(){ PINTAR.ventas('precios'); }); } }] });
}
ACC.precioCliente = function(){
  hoja({ titulo:'Precio especial para un cliente', html:listaVar('dl-var') + listaCli('dl-cli') + campo('pc-cli', 'Cliente', inp('pc-cli', '', ' list="dl-cli"')) + campo('pc-v', 'Producto', inp('pc-v', '', ' list="dl-var"')) +
      campo('pc-p', 'Precio (sin IGV; vacío = quitar el especial)', inp('pc-p', '', ' inputmode="decimal"')),
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Guardar', a:function(api){ var c = cliDe(val('pc-cli')), v = varDe(val('pc-v'));
      if(!c || !v) return api.msg('Elige el cliente y el producto de la lista.');
      guarda(api, rpc('erp_precio_cliente_guardar', { cliente:c.id, variante:v.id, precio:val('pc-p').replace(',', '.') }), 'Precio guardado.'); } }] });
};

/* licitación desde Excel: se lee en el navegador, el servidor busca lo que cumple cada fila */
function venLicitacion(){
  $('cargando').outerHTML = '<div class="tarj"><h2>Licitación desde Excel</h2><p class="ayuda" style="margin:0 0 10px">Sube el Excel (.xlsx) o CSV de la licitación. Se lee en tu navegador; al servidor van solo la descripción y la cantidad de cada fila. Si una fila trae una norma (N95, EN 388 4X42C, Z89.1 tipo I clase E), se buscan los productos que la cumplen.</p>' +
    '<input type="file" id="lic-arch" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"><div id="lic-res" style="margin-top:12px"></div></div>';
  $('lic-arch').onchange = function(){
    var f = this.files && this.files[0]; if(!f) return;
    $('lic-res').innerHTML = '<p class="ayuda">Leyendo…</p>';
    docs().then(function(D){ return D.leerTabla(f); }).then(function(filas){
      if(!filas || filas.length < 2){ $('lic-res').innerHTML = '<div class="aviso mal">No se encontraron filas.</div>'; return; }
      var cab = filas[0].map(function(x){ return String(x || ''); }), ops = cab.map(function(c, i){ return [String(i), (c || 'Columna ' + (i + 1)).slice(0, 40)]; });
      var adiv = function(re){ var i = cab.findIndex(function(c){ return re.test(c.toLowerCase()); }); return String(i < 0 ? 0 : i); };
      ERP.cache.licFilas = filas;
      $('lic-res').innerHTML = '<div class="campos">' + campo('lic-cd', 'Columna de la descripción', sel('lic-cd', ops, adiv(/descrip|producto|item|bien/))) + campo('lic-cc', 'Columna de la cantidad', sel('lic-cc', ops, adiv(/cant/))) +
        campo('lic-cu', 'Columna de la unidad (opcional)', sel('lic-cu', [['', '—']].concat(ops), adiv(/unid|u\.m|medida/))) + '</div><button type="button" class="bt" data-a="licBuscar">Buscar lo que cumple (' + (filas.length - 1) + ' filas)</button>';
    }, function(){ $('lic-res').innerHTML = '<div class="aviso mal">No se pudo leer ese archivo. Guárdalo como .xlsx o .csv.</div>'; });
  };
}
ACC.licBuscar = function(b){
  var F = ERP.cache.licFilas.slice(1, 301), cd = +val('lic-cd'), cc = +val('lic-cc'), cu = val('lic-cu');
  var filas = F.map(function(r){ return { d:String(r[cd] || '').trim(), c:String(r[cc] || '').replace(',', '.'), u:cu === '' ? '' : String(r[+cu] || '') }; }).filter(function(r){ return r.d; });
  b.disabled = true;
  rpc('erp_licitacion', { filas:filas }).then(function(j){
    b.disabled = false;
    if(!j || !j.ok){ toast(mensaje(j)); return; }
    ERP.cache.lic = j.filas;
    $('lic-res').insertAdjacentHTML('beforeend', '<div style="margin-top:14px">' + tabla([{ t:'Fila', k:function(f){ return '<b>' + esc(f.d) + '</b>' + (f.normas.length ? '<span class="sub">Norma leída: ' + esc(f.normas.map(function(n){ return n.n + ' ' + (n.nivel || ''); }).join(', ')) + '</span>' : ''); } },
      { t:'Cantidad', n:1, k:function(f){ return num(f.c) + ' ' + esc(f.u || ''); } },
      { t:'De tu almacén', k:function(f, i){ return f.candidatos.length ? sel('lic-v' + i, [['', 'No cotizo']].concat(f.candidatos.map(function(c){ return [c.v, c.sku + ' · disp. ' + num(c.disp) + (c.precio != null ? ' · ' + soles(c.precio) : '')]; })), f.candidatos[0].v) : '<span class="gris">Nada que cumpla</span>'; } }], j.filas) +
      '<button type="button" class="bt casco" data-a="licCotizar">Crear la cotización con lo elegido</button></div>');
  });
};
ACC.licCotizar = function(){
  catClientes().then(function(){
    hoja({ titulo:'Cotización de la licitación', html:listaCli('dl-cli') + campo('lc-cli', 'Cliente', inp('lc-cli', '', ' list="dl-cli"')),
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Crear', a:function(api){ var c = cliDe(val('lc-cli')); if(!c) return api.msg('Elige el cliente.');
        var L = (ERP.cache.lic || []).map(function(f, i){ var v = $('lic-v' + i) ? $('lic-v' + i).value : ''; return v ? { v:v, c:f.c, d:f.d } : null; }).filter(Boolean);
        if(!L.length) return api.msg('No elegiste ningún producto.');
        guarda(api, rpc('erp_cotizacion_guardar', { cliente:c.id, origen:'licitacion', lineas:L, validez:masDias(hoyLima(), 15) }), 'Cotización creada.', function(){ irA('ventas', 'cotizaciones'); }); } }] });
  });
};

/* alternativas por norma (lo que cumple lo mismo, con su stock y la diferencia de margen) */
function venAlternativas(){
  catVariantes().then(function(){
    $('cargando').outerHTML = listaVar('dl-var') + '<div class="tarj"><h2>¿Qué más cumple?</h2><p class="ayuda" style="margin:0 0 10px">Escribe lo que piden («respirador N95», «guante EN 388 4X42C», «casco Z89.1 tipo I clase E») o elige un producto agotado. Las reglas salen de cada norma: un P100 cubre un N95; en EN 388 cada cifra debe ser igual o mayor; en Z89.1 el tipo II cubre al I y la clase E a la G. No se inventan equivalencias entre normas distintas: esas las declaras tú en Almacén › Equivalencias.</p>' +
      '<div class="campos">' + campo('al-t', 'Lo que piden', inp('al-t', '', ' maxlength="200"')) + campo('al-v', 'o un producto', inp('al-v', '', ' list="dl-var"')) + campo('al-c', 'Cantidad', inp('al-c', '1', ' inputmode="decimal"')) + '</div>' +
      '<button type="button" class="bt" data-a="altBuscar">Buscar</button><div id="al-res" style="margin-top:12px"></div></div>';
  });
};
ACC.altBuscar = function(b){
  var v = val('al-v') ? varDe(val('al-v')) : null;
  b.disabled = true;
  rpc('erp_equivalentes', { texto:val('al-t'), variante:v ? v.id : '', cantidad:val('al-c') }).then(function(j){
    b.disabled = false;
    if(!j || !j.ok){ $('al-res').innerHTML = '<div class="aviso mal">' + esc(mensaje(j)) + '</div>'; return; }
    $('al-res').innerHTML = (j.normas_leidas.length ? '<p class="ayuda">Norma leída: ' + esc(j.normas_leidas.map(function(n){ return n.n + ' ' + (n.nivel || ''); }).join(', ')) + '</p>' : '') +
      tabla([{ t:'Producto', k:function(a){ return esc(a.d) + '<span class="sub mono">' + esc(a.sku) + '</span><span class="sub">' + esc((a.normas || []).map(function(n){ return n.n + ' ' + (n.nivel || ''); }).join(' · ')) + '</span>'; } },
        { t:'Disponible', n:1, k:function(a){ return num(a.disp); } }, { t:'Precio', n:1, k:function(a){ return a.precio != null ? soles(a.precio) : '—'; } },
        { t:'Margen vs. el pedido', k:function(a){ return a.dif_margen != null ? '<span class="' + (a.dif_margen >= 0 ? 'margen-alto' : 'margen-bajo') + '">' + (a.dif_margen >= 0 ? '+' : '') + soles(a.dif_margen) + ' c/u</span>' :
          a.margen_vs ? '<span class="' + (a.margen_vs === 'menos' ? 'margen-bajo' : 'margen-alto') + '">' + esc({ mas:'más margen', menos:'menos margen', igual:'igual' }[a.margen_vs]) + '</span>' : '—'; } }], j.alternativas, { vacio:'Nada en tu almacén cumple eso' });
  });
};

/* reposición predictiva: lo entregado con vida útil, 7 días antes de que se acabe */
function venReposicion(){
  rpc('erp_recompra', {}).then(function(j){
    if(!j || !j.ok) return fuera(j);
    $('cargando').outerHTML = '<p class="ayuda" style="margin:0 0 10px">Cada entrega de un producto con vida útil (en su ficha) programa un aviso 7 días antes de que se cumpla. «Enviar proforma» arma la cotización con el precio de hoy y el texto para WhatsApp o correo.</p>' +
      tabla([{ t:'Cliente', k:function(a){ return '<b>' + esc(a.cliente_nombre) + '</b>'; } }, { t:'Producto', k:function(a){ return esc(a.d) + '<span class="sub">' + num(a.cantidad) + ' entregados el ' + fecha(a.entregado) + '</span>'; } },
        { t:'Fin de vida útil', k:function(a){ return fecha(a.fin_vida) + '<span class="sub ' + (a.dias <= 7 ? 'margen-bajo' : '') + '">' + (a.dias >= 0 ? 'en ' + a.dias + ' días' : 'hace ' + (-a.dias) + ' días') + '</span>'; } },
        { t:'', k:function(a){ return a.estado === 'avisar' ? '<button type="button" class="bt casco mini" data-a="repProforma" data-id="' + esc(a.id) + '">Enviar proforma</button> <button type="button" class="bt-link" data-a="repDescartar" data-id="' + esc(a.id) + '">Descartar</button>' : pill('programada', ''); } }],
        j.lista, { vacio:'Nada por reponer todavía', vacioSub:'Pon la vida útil en la ficha de tus productos.' });
  });
}
ACC.repProforma = function(b){
  b.disabled = true;
  rpc('erp_recompra_proforma', { id:b.getAttribute('data-id') }).then(function(j){
    b.disabled = false;
    if(!j || !j.ok){ toast(mensaje(j)); return; }
    hoja({ titulo:'Proforma ' + j.cotizacion.numero, html:'<p class="ayuda" style="margin:0 0 8px">El texto para mandar:</p><textarea id="rp-t" rows="5">' + esc(j.texto) + '</textarea>',
      botones:[{ t:'Cerrar', c:'sec' }, { t:'PDF', c:'sec', a:function(){ rpc('erp_cotizacion', { id:j.cotizacion.id }).then(function(x){ if(x && x.ok) docs().then(function(D){ D.cotizacion(x); }); }); } },
        { t:'Correo', c:'sec', a:function(){ location.href = 'mailto:' + encodeURIComponent(j.correo || '') + '?subject=' + encodeURIComponent('Proforma ' + j.cotizacion.numero) + '&body=' + encodeURIComponent(val('rp-t')); } },
        { t:'WhatsApp', a:function(){ wa(val('rp-t'), j.telefono); } }] });
    venReposicionOtraVez();
  });
};
function venReposicionOtraVez(){ if(ERP.sec === 'ventas') PINTAR.ventas('reposicion'); }
ACC.repDescartar = function(b){ guarda(null, rpc('erp_recompra_descartar', { id:b.getAttribute('data-id') }), 'Descartado.', venReposicionOtraVez); };
