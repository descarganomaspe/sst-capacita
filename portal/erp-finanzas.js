/* OBRASST · ERP Distribuidor · facturación y cobranzas: comprobantes (factura, boleta, notas), cuentas por cobrar con su
   antigüedad, estado de cuenta y el adelanto de cobro (factoring, en simulación hasta que haya contrato). (2/11/2026) */
'use strict';
PINTAR.facturacion = function(sub){
  var subs = [['comprobantes', 'Comprobantes'], ['cobranzas', 'Por cobrar'], ['estado', 'Estado de cuenta']];
  if(tieneModulo('factoring') && esAdmin()) subs.push(['adelanto', 'Adelantar cobro']);
  sub = subs.some(function(x){ return x[0] === sub; }) ? sub : 'comprobantes';
  $('vista').innerHTML = cabecera('facturacion', subs, sub) + (ERP.yo.pse && ERP.yo.pse.modo === 'prueba' ? '<div class="aviso ojo"><b>En prueba:</b> los comprobantes salen del simulador de OBRASST, <b>sin valor tributario</b>. Para emitir de verdad, conecta tu PSE en Seguridad › Bóveda SUNAT.</div>' : '') +
    '<p class="ayuda" id="cargando">Cargando…</p>';
  ({ comprobantes:facComprobantes, cobranzas:facCobranzas, estado:facEstado, adelanto:facAdelanto })[sub]();
};
var TIPO_CPE = { '01':'Factura', '03':'Boleta', '07':'Nota de crédito', '08':'Nota de débito' };
function facComprobantes(){
  rpc('erp_facturas', {}).then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.cpes = j.lista;
    /* los rubros de servicios facturan sus valorizaciones (erp-servicios.js), no pedidos */
    $('cargando').outerHTML = '<div class="filtros">' + (esSrv() ? (puede('srv_valorizar') ? '<button type="button" class="bt" data-ir="srv_valorizar">Facturar una valorización</button>' : '') :
      '<button type="button" class="bt" data-a="facDePedido">Facturar un pedido</button>') + '</div>' +
      tabla([{ t:'Comprobante', k:function(f){ return '<span class="mono">' + esc(f.codigo) + '</span><span class="sub">' + esc(TIPO_CPE[f.tipo]) + ' · ' + fecha(f.fecha) + (f.referencia_codigo ? ' · sobre ' + esc(f.referencia_codigo) : '') + '</span>'; } },
        { t:'Cliente', k:function(f){ return esc(f.cliente_nombre); } }, { t:'Total', n:1, k:function(f){ return soles(f.total) + (f.detraccion ? '<span class="sub">detracción ' + soles(f.detraccion.monto) + '</span>' : '') + (f.retencion ? '<span class="sub">retención ' + soles(f.retencion.monto) + '</span>' : ''); } },
        { t:'Saldo', n:1, k:function(f){ return f.saldo != null ? soles(f.saldo) : '—'; } }, { t:'SUNAT', k:function(f){ return sunatTxt(f.sunat); } }], j.lista, { a:'verComprobante', vacio:'Sin comprobantes' });
  });
}
ACC.facDePedido = function(){
  rpc('erp_pedidos', {}).then(function(j){
    var P = ((j && j.lista) || []).filter(function(o){ return !o.facturado && o.estado !== 'anulada'; });
    if(!P.length){ toast('No hay pedidos por facturar.'); return; }
    hoja({ titulo:'Facturar un pedido', html:campo('fp-p', 'Pedido', sel('fp-p', P.map(function(o){ return [o.id, o.numero + ' · ' + o.cliente_nombre + ' · ' + soles(o.total)]; }), P[0].id)),
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Siguiente', a:function(api){ var o = P.filter(function(x){ return x.id === val('fp-p'); })[0]; api.cerrar(); ACC.facturarPedido(null, o); } }] });
  });
};
ACC.facturarPedido = function(b, o){
  Promise.all([rpc('erp_guias', {}), catClientes()]).then(function(r){
    var G = ((r[0] && r[0].lista) || []).filter(function(g){ return g.pedido === o.id && g.estado !== 'anulada'; });
    var cli = (ERP.cache.cli || []).filter(function(c){ return c.id === o.cliente; })[0] || {};
    hoja({ titulo:'Comprobante del pedido ' + o.numero, html:'<p class="ayuda" style="margin:0 0 10px">' + esc(o.cliente_nombre) + ' · ' + esc(({ '6':'RUC ', '1':'DNI ' })[cli.tipo_doc] || '') + esc(cli.num_doc || '') + '</p>' +
        campo('fe-t', 'Comprobante', sel('fe-t', [['01', 'Factura'], ['03', 'Boleta']], cli.tipo_doc === '6' ? '01' : '03')) +
        (G.length ? '<p style="font-size:13px; font-weight:500; margin:0 0 6px">¿De qué guías? (vacío = todo lo despachado y no facturado)</p>' + G.map(function(g){ return '<label class="chk"><input type="checkbox" class="fe-g" value="' + esc(g.id) + '"> ' + esc(g.codigo) + ' · ' + fecha(g.fecha_traslado) + '</label>'; }).join('') :
          '<p class="ayuda">Todavía no salió nada: se factura todo el pedido (venta anticipada).</p>') +
        '<p class="ayuda" style="margin-top:8px">El servidor calcula el IGV, la detracción (servicios) y la retención (si el cliente es agente de retención y pasa S/ 700), y deja la cuenta por cobrar.</p>',
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Emitir', c:'casco', a:function(api){ var gs = [].map.call(document.querySelectorAll('.fe-g:checked'), function(x){ return x.value; });
        guarda(api, rpc('erp_factura_emitir', { pedido:o.id, tipo:val('fe-t'), guias:gs, idem:nuevoIdem() }), null, function(j){ toast(TIPO_CPE[j.factura.tipo] + ' ' + j.factura.codigo + ' emitida.'); irA('facturacion', 'comprobantes'); }); } }] });
  });
};
ACC.verComprobante = function(b){
  rpc('erp_factura', { id:b.getAttribute('data-id') }).then(function(j){
    if(!j || !j.ok){ toast(mensaje(j)); return; }
    var f = j.factura, esCpe = f.tipo === '01' || f.tipo === '03';
    hoja({ titulo:TIPO_CPE[f.tipo] + ' ' + f.codigo, ancha:true, html:'<p class="ayuda" style="margin:0 0 10px">' + esc(f.cliente_nombre) + ' · ' + fecha(f.fecha) + (f.vence && f.forma_pago === 'credito' ? ' · vence ' + fecha(f.vence) : ' · contado') + '</p>' +
        tabla([{ t:'Descripción', k:function(l){ return esc(l.d) + (l.sku ? '<span class="sub mono">' + esc(l.sku) + '</span>' : ''); } }, { t:'Cantidad', n:1, k:function(l){ return num(l.c) + ' ' + esc(l.u || ''); } },
          { t:'Valor unit.', n:1, k:function(l){ return soles(l.p); } }, { t:'Subtotal', n:1, k:function(l){ return soles(l.sub); } }], f.lineas) +
        '<div class="aviso neu" style="display:flex; flex-wrap:wrap; gap:6px 18px"><span>Gravada <b>' + soles(f.gravada) + '</b></span><span>IGV <b>' + soles(f.igv) + '</b></span><span>Total <b>' + soles(f.total) + '</b></span>' +
          (f.detraccion ? '<span>Detracción ' + esc(f.detraccion.cod) + ' (' + num(f.detraccion.pct) + ' %): <b>' + soles(f.detraccion.monto) + '</b> (el cliente la deposita en tu cuenta del Banco de la Nación)</span>' : '') +
          (f.retencion ? '<span>Retención IGV (' + num(f.retencion.pct) + ' %): <b>' + soles(f.retencion.monto) + '</b></span>' : '') + '<span>Neto por cobrar <b>' + soles(f.neto_cobrar) + '</b></span></div><p>' + sunatTxt(f.sunat) + '</p>',
      botones:[{ t:'Cerrar', c:'sec' }, { t:'PDF', c:'sec', a:function(){ docs().then(function(D){ D.comprobante(j); }); } }]
        .concat(f.sunat && (f.sunat.estado === 'por_enviar' || f.sunat.estado === 'rechazada') ? [{ t:'Enviar al PSE', a:function(api){ api.ocupado(true); edge('/emitir', { tipo:'comprobante', id:f.id }).then(function(r){ api.ocupado(false); if(r && r.ok){ api.cerrar(); toast('Aceptado por SUNAT.'); } else api.msg(r && r.sunat ? r.sunat.descripcion : mensaje(r)); }); } }] : [])
        .concat(esCpe && f.estado === 'emitida' ? [{ t:'Nota de crédito', c:'sec', a:function(api){ api.cerrar(); formNota(f, '07'); } }, { t:'Nota de débito', c:'sec', a:function(api){ api.cerrar(); formNota(f, '08'); } }] : []) });
  });
};
function formNota(f, tipo){
  var NC = [['01', '01 · Anulación de la operación'], ['06', '06 · Devolución total'], ['07', '07 · Devolución por ítem'], ['04', '04 · Descuento global'], ['05', '05 · Descuento por ítem'], ['09', '09 · Disminución en el valor']];
  var ND = [['01', '01 · Intereses por mora'], ['02', '02 · Aumento en el valor'], ['03', '03 · Penalidades / otros conceptos']];
  hoja({ titulo:(tipo === '07' ? 'Nota de crédito' : 'Nota de débito') + ' sobre ' + f.codigo, ancha:true, html:campo('nt-m', 'Motivo', sel('nt-m', tipo === '07' ? NC : ND, tipo === '07' ? '07' : '01')) +
      campo('nt-d', 'Detalle del motivo', inp('nt-d', '', ' maxlength="150"')) +
      (tipo === '07' ? '<div class="tabla-caja"><table><thead><tr><th>Línea</th><th class="num">Facturado</th><th>Cantidad a devolver o descontar</th></tr></thead><tbody>' + f.lineas.map(function(l, i){
        return '<tr><td>' + esc(l.d) + '</td><td class="num">' + num(l.c) + '</td><td>' + inp('nt-c' + i, '', ' inputmode="decimal" style="max-width:110px"') + '</td></tr>'; }).join('') + '</tbody></table></div>' :
        campo('nt-mo', 'Monto (con IGV)', inp('nt-mo', '', ' inputmode="decimal"'))),
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Emitir la nota', c:'casco', a:function(api){
      var p = { referencia:f.id, tipo:tipo, motivo:val('nt-m') + ' ' + (val('nt-d') || $('nt-m').selectedOptions[0].text.slice(5)), idem:nuevoIdem() };
      if(tipo === '07'){ p.lineas = []; f.lineas.forEach(function(l, i){ var c = val('nt-c' + i); if(c) p.lineas.push({ i:i, c:c.replace(',', '.') }); }); } else p.monto = val('nt-mo').replace(',', '.');
      guarda(api, rpc('erp_nota_emitir', p), null, function(j){ toast('Nota ' + j.factura.codigo + ' emitida.'); PINTAR.facturacion('comprobantes'); }); } }] });
}
function facCobranzas(){
  rpc('erp_cxc', {}).then(function(j){
    if(!j || !j.ok) return fuera(j);
    ERP.cache.cxc = j.lista;
    var t = j.tramos || {};
    $('cargando').outerHTML = '<div class="grilla">' + [['al_dia', 'Al día'], ['1_30', 'Vencido 1–30 días'], ['31_60', '31–60 días'], ['61_90', '61–90 días'], ['mas_90', 'Más de 90 días']].map(function(x){
        return '<div class="kpi"><small>' + esc(x[1]) + '</small><b class="' + (x[0] === 'al_dia' ? '' : x[0] === '1_30' ? 'margen-medio' : 'margen-bajo') + '">' + soles(t[x[0]] || 0) + '</b></div>'; }).join('') + '</div>' +
      tabla([{ t:'Comprobante', k:function(r){ return '<span class="mono">' + esc(r.codigo) + '</span>' + (r.factoring ? ' ' + pill('adelanto', 'az') : ''); } }, { t:'Cliente', k:function(r){ return esc(r.cliente_nombre); } },
        { t:'Saldo', n:1, k:function(r){ return '<b>' + soles(r.saldo) + '</b><span class="sub">de ' + soles(r.monto) + '</span>'; } },
        { t:'Vence', k:function(r){ return fecha(r.vence) + (r.dias_vencido ? '<span class="sub margen-bajo">' + r.dias_vencido + ' días vencido</span>' : ''); } },
        { t:'', k:function(r){ return '<button type="button" class="bt sec mini" data-a="cobrar" data-id="' + esc(r.id) + '">Registrar pago</button>'; } }], j.lista, { vacio:'Nada por cobrar' });
  });
}
ACC.cobrar = function(b){
  var r = (ERP.cache.cxc || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0];
  hoja({ titulo:'Pago de ' + r.codigo, html:'<p class="ayuda" style="margin:0 0 10px">' + esc(r.cliente_nombre) + ' · saldo ' + soles(r.saldo) + '</p><div class="campos">' + campo('cb-m', 'Monto', inp('cb-m', r.saldo, ' inputmode="decimal"')) +
      campo('cb-me', 'Medio', sel('cb-me', [['transferencia', 'Transferencia'], ['deposito', 'Depósito'], ['efectivo', 'Efectivo'], ['yape', 'Yape'], ['plin', 'Plin'], ['tarjeta', 'Tarjeta'], ['cheque', 'Cheque'], ['detraccion', 'Detracción (Banco de la Nación)'], ['retencion', 'Retención (comprobante del cliente)']], 'transferencia')) +
      campo('cb-f', 'Fecha', inp('cb-f', hoyLima(), ' type="date"')) + campo('cb-r', 'N.° de operación', inp('cb-r', '', ' maxlength="60"')) + '</div>',
    botones:[{ t:'Cancelar', c:'sec' }, { t:'Registrar', a:function(api){ guarda(api, rpc('erp_cobro_registrar', { cxc:r.id, monto:val('cb-m').replace(',', '.'), medio:val('cb-me'), fecha:val('cb-f'), ref:val('cb-r') }), 'Pago registrado.', function(){ PINTAR.facturacion('cobranzas'); }); } }] });
};
function facEstado(){
  catClientes().then(function(C){
    var id = ERP.cache.ecCliente || (C[0] && C[0].id) || '';
    $('cargando').outerHTML = '<div class="filtros">' + sel('ec-c', C.map(function(c){ return [c.id, c.razon_social]; }), id, ' style="max-width:360px"') + '</div><div id="ec-r"></div>';
    $('ec-c').onchange = function(){ ERP.cache.ecCliente = this.value; pintarEstado(this.value); };
    if(id) pintarEstado(id);
  });
}
function pintarEstado(id){
  $('ec-r').innerHTML = '<p class="ayuda">Cargando…</p>';
  rpc('erp_estado_cuenta', { cliente:id }).then(function(j){
    if(!j || !j.ok){ $('ec-r').innerHTML = '<div class="aviso mal">' + esc(mensaje(j)) + '</div>'; return; }
    ERP.cache.ec = j;
    var c = j.cliente;
    $('ec-r').innerHTML = '<div class="grilla"><div class="kpi"><small>Saldo</small><b>' + soles(c.saldo) + '</b><span>' + soles(c.vencido) + ' vencido</span></div><div class="kpi"><small>Línea</small><b>' + soles(c.linea_credito) + '</b><span>' + (c.bloqueado ? 'bloqueado: ' + esc(c.motivo_bloqueo || '') : c.dias_credito + ' días') + '</span></div></div>' +
      tabla([{ t:'Comprobante', k:function(d){ return '<span class="mono">' + esc(d.codigo) + '</span><span class="sub">' + esc(TIPO_CPE[d.tipo]) + '</span>'; } }, { t:'Fecha', k:function(d){ return fecha(d.fecha); } },
        { t:'Vence', k:function(d){ return fecha(d.vence); } }, { t:'Total', n:1, k:function(d){ return soles(d.total); } }, { t:'Saldo', n:1, k:function(d){ return d.saldo != null ? soles(d.saldo) : '—'; } },
        { t:'Estado', k:function(d){ return esc(d.estado); } }], j.documentos, { vacio:'Sin comprobantes en el último año' }) +
      '<div class="acciones"><button type="button" class="bt sec" data-a="ecPdf">PDF</button><button type="button" class="bt sec" data-a="ecWa">WhatsApp</button></div>';
  });
}
ACC.ecPdf = function(){ docs().then(function(D){ D.estadoCuenta(ERP.cache.ec); }); };
ACC.ecWa = function(){
  var j = ERP.cache.ec, c = j.cliente, ven = j.documentos.filter(function(d){ return d.saldo > 0; });
  wa('Hola, le escribe ' + ERP.yo.aliado.razon + '. Su saldo al ' + fecha(j.al) + ' es ' + soles(c.saldo) + (c.vencido ? ' (' + soles(c.vencido) + ' vencido)' : '') + ':\n' +
    ven.map(function(d){ return '• ' + d.codigo + ' · vence ' + fecha(d.vence) + ' · ' + soles(d.saldo); }).join('\n') + '\nLe adjunto el estado de cuenta. Gracias.', c.telefono);
};
function facAdelanto(){
  Promise.all([rpc('erp_cxc', {}), rpc('erp_factoring_ops')]).then(function(r){
    var C = ((r[0] && r[0].lista) || []).filter(function(x){ return x.tipo === '01' && !x.factoring && x.estado === 'pendiente'; }), O = (r[1] && r[1].lista) || [];
    $('cargando').outerHTML = '<div class="aviso ojo"><b>Simulación.</b> OBRASST todavía no tiene contrato con una entidad de factoring: los montos son de ejemplo y no se cede ninguna factura. Cuando haya contrato, este mismo botón la enviará a evaluación.</div>' +
      tabla([{ t:'Factura', k:function(x){ return '<span class="mono">' + esc(x.codigo) + '</span>'; } }, { t:'Cliente', k:function(x){ return esc(x.cliente_nombre); } }, { t:'Saldo', n:1, k:function(x){ return soles(x.saldo); } },
        { t:'Vence', k:function(x){ return fecha(x.vence); } }, { t:'', k:function(x){ return '<button type="button" class="bt sec mini" data-a="factSim" data-id="' + esc(x.factura) + '">Adelantar cobro hoy</button>'; } }], C, { vacio:'Sin facturas a crédito pendientes' }) +
      '<h2 style="font-size:15px; margin:6px 0 8px">Simulaciones registradas</h2>' + tabla([{ t:'Factura', k:function(o){ return '<span class="mono">' + esc(o.factura) + '</span><span class="sub">' + fecha(o.creado) + '</span>'; } },
        { t:'Monto', n:1, k:function(o){ return soles(o.monto); } }, { t:'Adelanto', n:1, k:function(o){ return soles(o.adelanto); } }, { t:'Costo', n:1, k:function(o){ return soles(o.costo_financiero); } },
        { t:'Comisión OBRASST', n:1, k:function(o){ return soles(o.comision_obrasst); } }, { t:'Te llega', n:1, k:function(o){ return '<b>' + soles(o.neto) + '</b>'; } }], O, { vacio:'Ninguna' });
  });
}
ACC.factSim = function(b){
  var f = b.getAttribute('data-id');
  rpc('erp_factoring_simular', { factura:f }).then(function(s){
    if(!s || !s.ok){ toast(mensaje(s)); return; }
    hoja({ titulo:'Adelantar cobro (simulación)', html:'<div class="aviso ojo">' + esc(s.aviso) + '</div><div class="grilla">' +
        '<div class="kpi"><small>Factura</small><b>' + soles(s.monto) + '</b><span>vence en ' + s.dias + ' días</span></div><div class="kpi"><small>Adelanto (' + num(s.parametros.adelanto_pct) + ' %)</small><b>' + soles(s.adelanto) + '</b></div>' +
        '<div class="kpi"><small>Costo (' + num(s.parametros.tasa_mensual) + ' % mensual)</small><b>' + soles(s.costo_financiero) + '</b></div><div class="kpi"><small>Comisión OBRASST</small><b>' + soles(s.comision_obrasst) + '</b></div>' +
        '<div class="kpi"><small>Te llegaría hoy</small><b class="margen-alto">' + soles(s.neto) + '</b></div></div>',
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Registrar la simulación', a:function(api){ guarda(api, rpc('erp_factoring_solicitar', { factura:f, idem:nuevoIdem() }), 'Simulación registrada.', function(){ PINTAR.facturacion('adelanto'); }); } }] });
  });
};
