/* OBRASST · ERP Distribuidor · los documentos: PDF (cotización, guía, comprobante, estado de cuenta, dossier de calidad, etiquetas
   con QR), Excel (escribir y leer, sin librerías), la firma en pantalla y la foto achicada (sin metadatos de ubicación). (2/11/2026)
   El PDF usa el jsPDF del portal (evaluaciones-pdf.js) y el QR, qr.js. En PRUEBA, cada comprobante y guía lo dice en grande. */
'use strict';
window.ERPDOC = (function(){
  var TINTA = [11, 42, 58], GRIS = [98, 115, 127], CASCO = [245, 183, 0];
  function libs(){ return Promise.all([cargarJs('evaluaciones-pdf.js'), cargarJs('qr.js')]).then(function(){ if(!(window.jspdf && window.jspdf.jsPDF)) throw new Error('pdf'); return window.jspdf.jsPDF; }); }
  /* lo que la letra del PDF no tiene, se cambia por su parecido */
  function tx(s){ return String(s == null ? '' : s).replace(/[‘’]/g, "'").replace(/[“”«»]/g, '"').replace(/[≥]/g, '>=').replace(/[≤]/g, '<=').replace(/[−–]/g, '-')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF—…•]/g, '').trim(); }
  function sol(n){ return 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
  function nn(n){ return Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits:3 }); }
  function dmy(d){ if(!d) return ''; var p = String(d).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(d); }
  /* un QR dibujado en el PDF (cuadritos), sin imágenes */
  function qrPdf(doc, texto, x, y, lado){
    var q = qrcode(0, 'M'); q.addData(texto); q.make();
    var n = q.getModuleCount(), m = lado / n; doc.setFillColor(0, 0, 0);
    for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(q.isDark(r, c)) doc.rect(x + c * m, y + r * m, m + 0.01, m + 0.01, 'F');
  }
  function marcaPrueba(doc, W, H){
    doc.saveGraphicsState && doc.saveGraphicsState();
    try{ doc.setGState(new doc.GState({ opacity:0.12 })); }catch(e){}
    doc.setTextColor(200, 30, 40); doc.setFont('helvetica', 'bold'); doc.setFontSize(54);
    doc.text('PRUEBA - SIN VALOR TRIBUTARIO', W / 2, H / 2, { align:'center', angle:35 });
    doc.restoreGraphicsState && doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);
  }
  /* la cabecera: el distribuidor a la izquierda, el recuadro del documento a la derecha */
  function cabecera(doc, W, al, titulo, codigo, extra){
    var M = 36;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor.apply(doc, TINTA); doc.text(tx(al.razon), M, 52, { maxWidth:300 });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, GRIS);
    var f = al.ficha || {}, y = 66;
    [al.ruc ? 'RUC ' + al.ruc : '', f.web, f.telefono ? 'Tel. ' + f.telefono : ''].filter(Boolean).forEach(function(l){ doc.text(tx(l), M, y); y += 11; });
    doc.setDrawColor.apply(doc, TINTA); doc.setLineWidth(1); doc.roundedRect(W - M - 200, 36, 200, 62, 4, 4);
    doc.setTextColor.apply(doc, TINTA); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(tx(titulo), W - M - 100, 56, { align:'center' });
    doc.setFontSize(13); doc.text(tx(codigo), W - M - 100, 74, { align:'center' });
    if(extra){ doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(tx(extra), W - M - 100, 89, { align:'center' }); }
    doc.setFillColor.apply(doc, CASCO); doc.rect(M, 104, W - 2 * M, 2.5, 'F');
    doc.setTextColor(0, 0, 0);
    return 120;
  }
  function bloque(doc, x, y, pares, ancho){
    doc.setFontSize(9);
    pares.forEach(function(p){ if(!p[1]) return; doc.setFont('helvetica', 'bold'); doc.text(tx(p[0]), x, y); doc.setFont('helvetica', 'normal');
      var l = doc.splitTextToSize(tx(p[1]), ancho - 90); doc.text(l, x + 90, y); y += 12 * l.length; });
    return y;
  }
  /* una tabla simple que pasa de página */
  function tablaPdf(doc, y, cols, filas, W, H){
    var M = 36, x0 = M, ancho = W - 2 * M;
    var pinta = function(){ doc.setFillColor(242, 245, 247); doc.rect(x0, y - 10, ancho, 15, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor.apply(doc, GRIS);
      var x = x0; cols.forEach(function(c){ doc.text(tx(c.t).toUpperCase(), c.n ? x + c.w - 4 : x + 4, y, { align:c.n ? 'right' : 'left' }); x += c.w; }); doc.setTextColor(0, 0, 0); y += 14; };
    pinta();
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    filas.forEach(function(f){
      var alto = 12, celdas = cols.map(function(c){ var t = doc.splitTextToSize(tx(c.k(f)), c.w - 8); alto = Math.max(alto, t.length * 11 + 2); return t; });
      if(y + alto > H - 70){ doc.addPage(); y = 50; pinta(); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); }
      var x = x0; cols.forEach(function(c, i){ doc.text(celdas[i], c.n ? x + c.w - 4 : x + 4, y, { align:c.n ? 'right' : 'left' }); x += c.w; });
      doc.setDrawColor(230, 234, 238); doc.line(x0, y + alto - 9, x0 + ancho, y + alto - 9); y += alto;
    });
    return y + 6;
  }
  function pie(doc, W, H, texto){
    var n = doc.getNumberOfPages();
    for(var i = 1; i <= n; i++){ doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor.apply(doc, GRIS); doc.text(tx(texto), 36, H - 28, { maxWidth:W - 140 }); doc.text(i + ' / ' + n, W - 36, H - 28, { align:'right' }); }
    doc.setTextColor(0, 0, 0);
  }
  function guardarPdf(doc, nombre){ doc.save(nombre.replace(/[^A-Za-z0-9._-]+/g, '-')); }

  /* ── cotización ── */
  function cotizacion(j){
    return libs().then(function(J){
      var q = j.cotizacion, c = j.cliente || {}, doc = new J({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89;
      var y = cabecera(doc, W, j.aliado, 'COTIZACIÓN', q.numero, 'Fecha: ' + dmy(q.creado));
      y = bloque(doc, 36, y, [['Cliente', c.razon_social || q.cliente_nombre], ['Documento', (c.tipo_doc === '6' ? 'RUC ' : c.tipo_doc === '1' ? 'DNI ' : '') + (c.num_doc || '')], ['Dirección', c.direccion],
        ['Condición', { contado:'Contado', credito30:'Crédito a 30 días', credito60:'Crédito a 60 días', credito90:'Crédito a 90 días' }[q.condicion]], ['Entrega', q.dias_entrega != null ? q.dias_entrega + ' días' : ''],
        ['Válida hasta', dmy(q.validez)]], 520) + 8;
      y = tablaPdf(doc, y, [{ t:'Código', w:80, k:function(l){ return l.sku; } }, { t:'Descripción', w:215, k:function(l){ return l.d + (l.marca ? ' · ' + l.marca : ''); } }, { t:'Cant.', w:50, n:1, k:function(l){ return nn(l.c); } },
        { t:'U.', w:30, k:function(l){ return l.u; } }, { t:'Valor unit.', w:70, n:1, k:function(l){ return sol(l.p); } }, { t:'Subtotal', w:78, n:1, k:function(l){ return sol(l.sub); } }], q.lineas, W, H);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      [['Subtotal', q.subtotal], ['IGV (18 %)', q.igv], ['Total', q.total]].forEach(function(t, i){ doc.setFont('helvetica', i === 2 ? 'bold' : 'normal'); doc.text(tx(t[0]), W - 180, y); doc.text(sol(t[1]), W - 36, y, { align:'right' }); y += 14; });
      if(q.nota){ y += 6; doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(doc.splitTextToSize(tx('Nota: ' + q.nota), W - 72), 36, y); }
      pie(doc, W, H, j.aliado.razon + ' · Cotización ' + q.numero + ' · precios en soles; el IGV va aparte en cada línea.');
      guardarPdf(doc, 'Cotizacion-' + q.numero + '.pdf');
    });
  }

  /* ── guía de remisión (representación; en prueba, sin valor) ── */
  function guia(j){
    return libs().then(function(J){
      var g = j.guia, doc = new J({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89, prueba = g.sunat && g.sunat.modo === 'prueba';
      var y = cabecera(doc, W, j.aliado, 'GUÍA DE REMISIÓN ELECTRÓNICA REMITENTE', g.codigo, prueba ? 'PRUEBA - sin valor tributario' : '');
      y = bloque(doc, 36, y, [['Destinatario', g.cliente_nombre], ['Documento', g.cliente_doc], ['Motivo', { '01':'Venta', '13':'Otros' + (g.sunat && g.sunat.motivo_texto ? ' (' + g.sunat.motivo_texto + ')' : '') }[g.motivo] || g.motivo],
        ['Fecha de traslado', dmy(g.fecha_traslado)], ['Partida', g.partida && (g.partida.direccion + ' · ' + g.partida.ubigeo)], ['Llegada', g.llegada && (g.llegada.direccion + ' · ' + g.llegada.ubigeo)],
        ['Transporte', g.modalidad === '01' ? 'Público: ' + (g.transportista ? g.transportista.razon + ' (RUC ' + g.transportista.ruc + ')' : '') : 'Privado · placa ' + (g.vehiculo || '')],
        ['Conductor', g.conductor ? g.conductor.nombre + ' · DNI ' + g.conductor.num_doc + ' · lic. ' + g.conductor.licencia : ''], ['Peso bruto', g.peso_kg ? nn(g.peso_kg) + ' kg' : ''], ['Bultos', g.bultos]], 420) + 8;
      if(g.dossier){ qrPdf(doc, 'https://obrasstapp.com/erp-dossier.html?k=' + g.dossier, W - 36 - 92, 124, 92); doc.setFontSize(7.5); doc.text('Dossier de calidad', W - 36 - 46, 226, { align:'center' }); y = Math.max(y, 236); }
      y = tablaPdf(doc, y, [{ t:'Código', w:90, k:function(l){ return l.sku; } }, { t:'Descripción', w:250, k:function(l){ return l.d; } }, { t:'Lote', w:80, k:function(l){ return l.lote + (l.vence ? ' · v. ' + dmy(l.vence) : ''); } },
        { t:'Cant.', w:60, n:1, k:function(l){ return nn(l.c); } }, { t:'U.', w:43, k:function(l){ return l.u; } }], g.lineas, W, H);
      if(g.pod){ doc.setFontSize(9); doc.text(tx('Entregado el ' + new Date(g.pod.t).toLocaleString('es-PE') + ' · recibió ' + g.pod.recibio), 36, y + 6); }
      if(prueba) for(var i = 1; i <= doc.getNumberOfPages(); i++){ doc.setPage(i); marcaPrueba(doc, W, H); }
      pie(doc, W, H, prueba ? 'Documento de PRUEBA generado por el simulador de OBRASST: no tiene valor tributario. La guía válida la emite el PSE conectado.' : (g.sunat && g.sunat.hash ? 'Hash: ' + g.sunat.hash : ''));
      guardarPdf(doc, 'Guia-' + g.codigo + '.pdf');
    });
  }

  /* ── comprobante (factura, boleta, notas) ── */
  function comprobante(j){
    return libs().then(function(J){
      var f = j.factura, c = j.cliente || {}, doc = new J({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89, prueba = f.sunat && f.sunat.modo === 'prueba';
      var tit = { '01':'FACTURA ELECTRÓNICA', '03':'BOLETA DE VENTA ELECTRÓNICA', '07':'NOTA DE CRÉDITO ELECTRÓNICA', '08':'NOTA DE DÉBITO ELECTRÓNICA' }[f.tipo];
      var y = cabecera(doc, W, j.aliado, tit, f.codigo, prueba ? 'PRUEBA - sin valor tributario' : '');
      y = bloque(doc, 36, y, [['Cliente', c.razon_social], ['Documento', (c.tipo_doc === '6' ? 'RUC ' : c.tipo_doc === '1' ? 'DNI ' : '') + (c.num_doc || '')], ['Dirección', c.direccion], ['Fecha de emisión', dmy(f.fecha)],
        ['Forma de pago', f.forma_pago === 'credito' ? 'Crédito · 1 cuota de ' + sol(f.neto_cobrar) + ' al ' + dmy(f.vence) : 'Contado'], ['Moneda', 'Soles'],
        ['Documento que modifica', f.referencia_codigo], ['Motivo', f.motivo_nota]], 520) + 8;
      y = tablaPdf(doc, y, [{ t:'Código', w:80, k:function(l){ return l.sku || ''; } }, { t:'Descripción', w:225, k:function(l){ return l.d; } }, { t:'Cant.', w:50, n:1, k:function(l){ return nn(l.c); } },
        { t:'U.', w:28, k:function(l){ return l.u; } }, { t:'Valor unit.', w:70, n:1, k:function(l){ return sol(l.p); } }, { t:'Valor venta', w:70, n:1, k:function(l){ return sol(l.sub); } }], f.lineas, W, H);
      var tot = [['Op. gravada', f.gravada], ['IGV (18 %)', f.igv], ['Importe total', f.total]];
      if(f.detraccion) tot.push(['Detracción ' + f.detraccion.cod + ' (' + f.detraccion.pct + ' %)', f.detraccion.monto]);
      if(f.retencion) tot.push(['Retención IGV (' + f.retencion.pct + ' %)', f.retencion.monto]);
      if(f.detraccion || f.retencion) tot.push(['Neto por cobrar', f.neto_cobrar]);
      doc.setFontSize(10);
      tot.forEach(function(t, i){ doc.setFont('helvetica', i === 2 || t[0] === 'Neto por cobrar' ? 'bold' : 'normal'); doc.text(tx(t[0]), W - 230, y); doc.text(sol(t[1]), W - 36, y, { align:'right' }); y += 14; });
      if(f.detraccion){ doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.text(tx('Operación sujeta al Sistema de Pago de Obligaciones Tributarias (SPOT): el adquirente deposita la detracción en la cuenta del proveedor en el Banco de la Nación.'), 36, y + 4, { maxWidth:W - 72 }); y += 24; }
      /* el QR del comprobante (en prueba, con la marca) */
      var cad = [j.aliado.ruc, f.tipo, f.serie, f.numero, Number(f.igv).toFixed(2), Number(f.total).toFixed(2), f.fecha, c.tipo_doc, c.num_doc || '', f.sunat && f.sunat.hash || ''].join('|');
      qrPdf(doc, prueba ? 'PRUEBA|' + cad : cad, 36, y + 4, 80);
      if(prueba) for(var i = 1; i <= doc.getNumberOfPages(); i++){ doc.setPage(i); marcaPrueba(doc, W, H); }
      pie(doc, W, H, prueba ? 'Documento de PRUEBA generado por el simulador de OBRASST: no tiene valor tributario. El comprobante válido lo emite el PSE conectado.' : 'Representación impresa del comprobante electrónico. Hash: ' + (f.sunat && f.sunat.hash || ''));
      guardarPdf(doc, tit.split(' ')[0] + '-' + f.codigo + '.pdf');
    });
  }

  /* ── estado de cuenta ── */
  function estadoCuenta(j){
    return libs().then(function(J){
      var c = j.cliente, doc = new J({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89;
      var y = cabecera(doc, W, { razon:j.aliado.razon, ruc:j.aliado.ruc }, 'ESTADO DE CUENTA', dmy(j.al));
      y = bloque(doc, 36, y, [['Cliente', c.razon_social], ['Documento', c.num_doc], ['Saldo', sol(c.saldo)], ['Vencido', sol(c.vencido)]], 520) + 8;
      y = tablaPdf(doc, y, [{ t:'Comprobante', w:110, k:function(d){ return d.codigo; } }, { t:'Fecha', w:70, k:function(d){ return dmy(d.fecha); } }, { t:'Vence', w:70, k:function(d){ return dmy(d.vence); } },
        { t:'Total', w:90, n:1, k:function(d){ return sol(d.total); } }, { t:'Saldo', w:90, n:1, k:function(d){ return d.saldo != null ? sol(d.saldo) : '-'; } }, { t:'Estado', w:93, k:function(d){ return d.estado; } }], j.documentos, W, H);
      pie(doc, W, H, j.aliado.razon + ' · Estado de cuenta al ' + dmy(j.al));
      guardarPdf(doc, 'Estado-de-cuenta-' + (c.num_doc || 'cliente') + '.pdf');
    });
  }

  /* ── dossier de calidad: la guía, sus lotes y sus certificados, con el QR a la página pública ── */
  function dossier(d, g){
    return libs().then(function(J){
      var doc = new J({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89, url = 'https://obrasstapp.com/erp-dossier.html?k=' + d.token;
      var y = cabecera(doc, W, { razon:d.distribuidor.razon, ruc:d.distribuidor.ruc }, 'DOSSIER DE CALIDAD', d.guia, 'Traslado: ' + dmy(d.fecha));
      qrPdf(doc, url, W - 36 - 100, y, 100);
      doc.setFontSize(9); doc.text(doc.splitTextToSize(tx('Escanea el QR para ver y descargar los certificados de cada producto y lote de esta guía (enlaces seguros que vencen a los 10 minutos; el QR no vence mientras la guía exista).'), 330), 36, y + 10);
      y = bloque(doc, 36, y + 50, [['Cliente', d.cliente]], 330) + 66;
      y = tablaPdf(doc, y, [{ t:'Código', w:90, k:function(l){ return l.sku; } }, { t:'Producto', w:250, k:function(l){ return l.d; } }, { t:'Lote', w:110, k:function(l){ return (l.lote || '') + (l.vence ? ' · v. ' + dmy(l.vence) : ''); } },
        { t:'Cant.', w:73, n:1, k:function(l){ return nn(l.c); } }], d.lineas, W, H);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('Certificados', 36, y + 4); y += 16;
      y = tablaPdf(doc, y, [{ t:'Producto', w:150, k:function(c){ return c.producto + (c.lote ? ' · lote ' + c.lote : ''); } }, { t:'Documento', w:110, k:function(c){ return { certificado:'Certificado', ficha_tecnica:'Ficha técnica', ensayo:'Informe de ensayo', declaracion:'Declaración' }[c.tipo] || c.tipo; } },
        { t:'Norma', w:100, k:function(c){ return c.norma || ''; } }, { t:'Emisor · N.°', w:113, k:function(c){ return [c.emisor, c.numero].filter(Boolean).join(' · '); } }, { t:'Vence', w:50, k:function(c){ return dmy(c.vence); } }],
        d.certificados.length ? d.certificados : [{ producto:'(sin certificados cargados)', tipo:'' }], W, H);
      pie(doc, W, H, 'Dossier generado por OBRASST para la guía ' + d.guia + '. Sin datos de personas.');
      guardarPdf(doc, 'Dossier-' + d.guia + '.pdf');
    });
  }

  /* ── etiquetas con QR (A4, 3 × 8): lotes (OBR-LOT:<id>) o productos (su SKU) ── */
  function etiquetas(items, nombre){
    return libs().then(function(J){
      var doc = new J({ unit:'mm', format:'a4' }), cw = 70, ch = 37, k = 0;
      items.forEach(function(it){
        if(k && k % 24 === 0) doc.addPage();
        var c = k % 3, r = Math.floor((k % 24) / 3), x = c * cw, y = 0.5 + r * ch;
        doc.setDrawColor(220, 220, 220); doc.rect(x + 1, y + 1, cw - 2, ch - 2);
        qrPdf(doc, it.qr, x + 3, y + 4, 29);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.text(doc.splitTextToSize(tx(it.t1), cw - 38).slice(0, 2), x + 35, y + 9);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.text(doc.splitTextToSize(tx(it.t2), cw - 38).slice(0, 4), x + 35, y + 18);
        k++;
      });
      guardarPdf(doc, nombre);
    });
  }
  function etiquetasLotes(L){ return etiquetas(L.map(function(l){ return { qr:l.qr, t1:l.sku, t2:l.producto + ' · lote ' + l.lote + (l.vence ? ' · vence ' + dmy(l.vence) : '') }; }), 'Etiquetas-lotes.pdf'); }
  function etiquetasProducto(p){ return etiquetas((p.variantes || []).map(function(v){ return { qr:v.barras || v.sku, t1:v.sku, t2:p.nombre + (v.talla ? ' · talla ' + v.talla : '') + (v.color ? ' · ' + v.color : '') }; }), 'Etiquetas-' + p.sku + '.pdf'); }

  /* ── ZIP (sin comprimir) para el .xlsx ── */
  var CRC = (function(){ var t = new Uint32Array(256); for(var n = 0; n < 256; n++){ var c = n; for(var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8){ var c = 0xFFFFFFFF; for(var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(archivos){
    var te = new TextEncoder(), partes = [], central = [], off = 0;
    archivos.forEach(function(a){
      var nom = te.encode(a.n), dat = typeof a.d === 'string' ? te.encode(a.d) : a.d, crc = crc32(dat);
      var h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 0, true); h.setUint32(14, crc, true); h.setUint32(18, dat.length, true); h.setUint32(22, dat.length, true); h.setUint16(26, nom.length, true);
      partes.push(new Uint8Array(h.buffer), nom, dat);
      var c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint32(16, crc, true); c.setUint32(20, dat.length, true); c.setUint32(24, dat.length, true); c.setUint16(28, nom.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), nom); off += 30 + nom.length + dat.length;
    });
    var tam = central.reduce(function(s, x){ return s + x.length; }, 0), fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, archivos.length, true); fin.setUint16(10, archivos.length, true); fin.setUint32(12, tam, true); fin.setUint32(16, off, true);
    return new Blob(partes.concat(central, [new Uint8Array(fin.buffer)]), { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function xmlEsc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); }
  function col(i){ var s = ''; i++; while(i){ var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  /* el servidor ya limpió los textos que empiezan con = + - @; aquí, por si acaso, todo texto va como texto (inlineStr) */
  function xlsx(nombre, hoja, cab, filas){
    var celda = function(v, r, c){ var ref = col(c) + r;
      if(typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '"><v>' + v + '</v></c>';
      var s = String(v == null ? '' : v); if(/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(s) + '</t></is></c>'; };
    var filasXml = [cab].concat(filas).map(function(f, r){ return '<row r="' + (r + 1) + '">' + f.map(function(v, c){ return celda(v, r + 1, c); }).join('') + '</row>'; }).join('');
    var b = zip([
      { n:'[Content_Types].xml', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
      { n:'_rels/.rels', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { n:'xl/workbook.xml', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' + xmlEsc(String(hoja).slice(0, 30)) + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { n:'xl/_rels/workbook.xml.rels', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>' },
      { n:'xl/worksheets/sheet1.xml', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + filasXml + '</sheetData></worksheet>' }]);
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* ── leer un .xlsx (la primera hoja) o un .csv en el navegador ── */
  function inflar(u8){ var ds = new DecompressionStream('deflate-raw'); return new Response(new Blob([u8]).stream().pipeThrough(ds)).arrayBuffer().then(function(b){ return new Uint8Array(b); }); }
  function unzip(buf){
    var u8 = new Uint8Array(buf), dv = new DataView(buf), e = -1;
    for(var i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--){ if(dv.getUint32(i, true) === 0x06054b50){ e = i; break; } }
    if(e < 0) return Promise.reject('zip');
    var n = dv.getUint16(e + 10, true), p = dv.getUint32(e + 16, true), td = new TextDecoder(), out = {}, prom = [];
    for(var k = 0; k < n; k++){
      var met = dv.getUint16(p + 10, true), tc = dv.getUint32(p + 20, true), ln = dv.getUint16(p + 28, true), lx = dv.getUint16(p + 30, true), lc = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
      var nom = td.decode(u8.subarray(p + 46, p + 46 + ln)), ini = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), dat = u8.subarray(ini, ini + tc);
      if(/^xl\/(sharedStrings\.xml|worksheets\/sheet1\.xml)$/.test(nom)) prom.push((met === 8 ? inflar(dat) : Promise.resolve(dat)).then((function(nm){ return function(d){ out[nm] = td.decode(d); }; })(nom)));
      p += 46 + ln + lx + lc;
    }
    return Promise.all(prom).then(function(){ return out; });
  }
  function leerXlsx(buf){
    return unzip(buf).then(function(f){
      var dp = new DOMParser(), ss = [], filas = [];
      if(f['xl/sharedStrings.xml']) [].forEach.call(dp.parseFromString(f['xl/sharedStrings.xml'], 'application/xml').getElementsByTagName('si'), function(si){ ss.push([].map.call(si.getElementsByTagName('t'), function(t){ return t.textContent; }).join('')); });
      [].forEach.call(dp.parseFromString(f['xl/worksheets/sheet1.xml'] || '<x/>', 'application/xml').getElementsByTagName('row'), function(r){
        var fila = [];
        [].forEach.call(r.getElementsByTagName('c'), function(c){ var ref = c.getAttribute('r') || '', ci = 0, m = /^[A-Z]+/.exec(ref);
          if(m) for(var i = 0; i < m[0].length; i++) ci = ci * 26 + m[0].charCodeAt(i) - 64; ci--;
          var t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0], is = c.getElementsByTagName('t')[0];
          fila[ci < 0 ? fila.length : ci] = t === 's' ? ss[+(v && v.textContent)] : t === 'inlineStr' ? (is && is.textContent) : v ? v.textContent : ''; });
        filas.push(Array.from(fila, function(x){ return x == null ? '' : x; }));
      });
      return filas;
    });
  }
  function leerCsv(txt){
    var sep = (txt.split('\n')[0].match(/;/g) || []).length > (txt.split('\n')[0].match(/,/g) || []).length ? ';' : ',', filas = [], f = [], c = '', q = false;
    for(var i = 0; i < txt.length; i++){ var ch = txt[i];
      if(q){ if(ch === '"' && txt[i + 1] === '"'){ c += '"'; i++; } else if(ch === '"') q = false; else c += ch; }
      else if(ch === '"') q = true; else if(ch === sep){ f.push(c); c = ''; } else if(ch === '\n'){ f.push(c.replace(/\r$/, '')); filas.push(f); f = []; c = ''; } else c += ch; }
    if(c || f.length){ f.push(c); filas.push(f); }
    return filas.filter(function(r){ return r.some(function(x){ return String(x).trim(); }); });
  }
  function leerTabla(file){
    if(file.size > 5 * 1024 * 1024) return Promise.reject('grande');
    return file.arrayBuffer().then(function(b){ var u = new Uint8Array(b); return u[0] === 0x50 && u[1] === 0x4B ? leerXlsx(b) : leerCsv(new TextDecoder().decode(b)); });
  }

  /* ── la firma en pantalla (dedo o mouse) ── */
  function firmaPad(cv, borrar){
    var ctx = cv.getContext('2d'), dib = false, ult = null, rect = function(){ return cv.getBoundingClientRect(); };
    ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B2A3A';
    var pos = function(e){ var r = rect(); return { x:(e.clientX - r.left) * cv.width / r.width, y:(e.clientY - r.top) * cv.height / r.height }; };
    cv.addEventListener('pointerdown', function(e){ dib = true; ult = pos(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function(e){ if(!dib) return; var p = pos(e); ctx.beginPath(); ctx.moveTo(ult.x, ult.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ult = p; cv.dataset.firmado = '1'; });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(t){ cv.addEventListener(t, function(){ dib = false; }); });
    if(borrar) borrar.onclick = function(){ ctx.clearRect(0, 0, cv.width, cv.height); delete cv.dataset.firmado; };
  }
  /* la foto, achicada a 1600 px y en JPEG: el canvas no copia los metadatos (ni la ubicación del celular) */
  function achicarFoto(file){
    return new Promise(function(ok, mal){
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function(){ var k = Math.min(1, 1600 / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(u); cv.toBlob(function(b){ b ? ok(b) : mal('foto'); }, 'image/jpeg', 0.82); };
      img.onerror = function(){ URL.revokeObjectURL(u); mal('foto'); };
      img.src = u;
    });
  }
  /* ── ERP de servicios (2/11/2026): el certificado con su QR de verificación y su huella, la valorización y las etiquetas QR
     de los activos. Lo que dice cada certificado lo arma erp-servicios.js desde el contenido que firmó el servidor:
     E = { pares:[[etiqueta, texto]], tablas:[{ titulo, cols:[{ t, k, n }], filas }], nota } ── */
  function paresPdf(doc, x, y, P, ancho, lw, H){
    doc.setFontSize(9);
    P.forEach(function(p){
      if(p[1] == null || p[1] === '') return;
      var l1 = doc.splitTextToSize(tx(p[0]), lw - 8), l2 = doc.splitTextToSize(tx(p[1]), ancho - lw);
      if(y + 12 * Math.max(l1.length, l2.length) > H - 80){ doc.addPage(); y = 50; }
      doc.setFont('helvetica', 'bold'); doc.text(l1, x, y); doc.setFont('helvetica', 'normal'); doc.text(l2, x + lw, y);
      y += 12 * Math.max(l1.length, l2.length) + 3;
    });
    return y;
  }
  function certificado(x, E){
    return libs().then(function(J){
      var doc = new J({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89, c = x.contenido || {}, em = c.emisor || {}, titulo = c.titulo || x.tipo_n || 'Certificado';
      var y = cabecera(doc, W, { razon:em.razon || '', ruc:em.ruc }, String(titulo.split(' ')[0]).toUpperCase(), x.numero, 'Emitido el ' + dmy(String(x.creado || x.desde || '').slice(0, 10)));
      doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor.apply(doc, TINTA); doc.text(doc.splitTextToSize(tx(titulo), 380), 36, y + 6); doc.setTextColor(0, 0, 0);
      qrPdf(doc, x.enlace, W - 36 - 100, y - 4, 100);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor.apply(doc, GRIS);
      doc.text(doc.splitTextToSize(tx('Escanéalo para ver en obrasstapp.com si está vigente, vencido o anulado.'), 100), W - 36 - 100, y + 106); doc.setTextColor(0, 0, 0);
      y = paresPdf(doc, 36, y + 30, E.pares || [], 380, 150, H) + 18;
      (E.tablas || []).forEach(function(t){
        if(!t.filas || !t.filas.length) return;
        if(y > H - 140){ doc.addPage(); y = 50; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(tx(t.titulo), 36, y); y += 16;
        var w = (W - 72) / t.cols.length;
        y = tablaPdf(doc, y, t.cols.map(function(k){ return { t:k.t, w:w, n:k.n, k:k.k }; }), t.filas, W, H) + 8;
      });
      if(E.nota){ if(y > H - 120){ doc.addPage(); y = 50; } doc.setFontSize(8.5); doc.setTextColor.apply(doc, GRIS); var ln = doc.splitTextToSize(tx(E.nota), W - 72); doc.text(ln, 36, y); y += ln.length * 11 + 8; doc.setTextColor(0, 0, 0); }
      if(x.profesional && x.profesional.nombre){
        if(y > H - 130){ doc.addPage(); y = 50; }
        y = Math.max(y + 40, H - 150);
        doc.setDrawColor(120, 130, 140); doc.line(36, y, 236, y);
        doc.setFontSize(9); doc.text(tx(x.profesional.nombre), 36, y + 13); doc.setTextColor.apply(doc, GRIS); doc.text(tx(x.profesional.colegiatura || ''), 36, y + 25); doc.text('Firma y sello', 36, y + 37); doc.setTextColor(0, 0, 0);
      }
      pie(doc, W, H, x.numero + ' · huella SHA-256 ' + x.huella + ' · si el contenido cambia, la huella ya no coincide con la que muestra el QR.');
      guardarPdf(doc, x.numero + '.pdf');
    });
  }
  function valorizacion(v, al){
    return libs().then(function(J){
      var doc = new J({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89;
      var y = cabecera(doc, W, al, 'VALORIZACIÓN', v.numero, 'Del ' + dmy(v.desde) + ' al ' + dmy(v.hasta));
      y = bloque(doc, 36, y, [['Cliente', v.cliente_n], ['Órdenes', String(v.ordenes || '')]], 400) + 8;
      y = tablaPdf(doc, y, [{ t:'Descripción', w:263, k:function(l){ return l.d; } }, { t:'Unid.', w:40, k:function(l){ return l.u; } }, { t:'Cant.', w:60, n:1, k:function(l){ return nn(l.c); } },
        { t:'P. unit.', w:80, n:1, k:function(l){ return sol(l.p); } }, { t:'Subtotal', w:80, n:1, k:function(l){ return sol(l.sub); } }], v.lineas || [], W, H);
      if(y > H - 120){ doc.addPage(); y = 50; }
      doc.setFontSize(10);
      [['Subtotal (sin IGV)', sol(v.subtotal)]].concat(Number(v.a_favor_cliente) ? [['A favor del cliente', '- ' + sol(v.a_favor_cliente)], ['Neto', sol(v.neto)]] : []).forEach(function(r){
        doc.setFont('helvetica', 'bold'); doc.text(tx(r[0]), W - 36 - 180, y); doc.setFont('helvetica', 'normal'); doc.text(tx(r[1]), W - 36, y, { align:'right' }); y += 15; });
      doc.setFontSize(8.5); doc.setTextColor.apply(doc, GRIS);
      doc.text(doc.splitTextToSize(tx('Montos sin IGV: la factura lo suma.' + (Number(v.a_favor_cliente) ? ' Lo que va a favor del cliente (lo que se le compró) se liquida aparte: no se factura.' : '')), W - 72), 36, y + 8);
      doc.setTextColor(0, 0, 0);
      pie(doc, W, H, 'Valorización ' + v.numero + ' generada en OBRASST. No es un comprobante de pago.');
      guardarPdf(doc, 'Valorizacion-' + v.numero + '.pdf');
    });
  }
  function etiquetasActivos(L){ return etiquetas(L.map(function(a){ return { qr:a.qr, t1:a.codigo, t2:[a.tipo_n, a.nombre].filter(Boolean).join(' · ') + ' · Escanéalo para ver si está habilitado' }; }), 'Etiquetas-QR.pdf'); }
  return { cotizacion:cotizacion, guia:guia, comprobante:comprobante, estadoCuenta:estadoCuenta, dossier:dossier, etiquetasLotes:etiquetasLotes, etiquetasProducto:etiquetasProducto,
           certificado:certificado, valorizacion:valorizacion, etiquetasActivos:etiquetasActivos,
           xlsx:xlsx, leerTabla:leerTabla, firmaPad:firmaPad, achicarFoto:achicarFoto, _zip:zip, _leerXlsx:leerXlsx, _leerCsv:leerCsv, _tx:tx };
})();
