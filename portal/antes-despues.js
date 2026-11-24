/* OBRASST · portal/antes-despues.js · 24/11/2026
   El registro de inspección de antes y después en la web: el motor (copiado tal cual de la app, ANTES-DESPUES-MOTOR;
   herr/copias.py lo vigila) y la vista «Antes y Después» de Inspecciones y equipos. */
/* >>> ANTES-DESPUES-MOTOR (24/11/2026) <<<
   ══ EL REGISTRO DE INSPECCIÓN — ANTES Y DESPUÉS, EN HORIZONTAL (PDF Y EXCEL) ═══════════════════════════════════════
   Marcelo (requerimiento «Observaciones del chat → Inspección Antes y Después»): el formato de antes y después era de
   texto; ahora es una hoja apaisada para la evidencia: encabezado (logo, título SST o Medio ambiente, código y revisión,
   empresa, personas, programada o no, área, actividad, objetivo), una tabla de 7 columnas (Antes con su foto y su
   descripción · Tipo · Levantamiento con su foto · Responsable · Fecha de observación · Fecha de levantamiento · Estado)
   y las 3 firmas (Responsable del área, Realizado por, Registrado por).
   Las filas salen de tres lados, ya normalizadas por adFila: el chat de la obra (sst_obs_obra), los reportes de actos y
   condiciones (sst_reporte) y las observaciones de las inspecciones (sst_inspeccion.hallazgos o las del celular).
   Las fotos nunca se deforman (se encajan en su recuadro) y ninguna fila se parte entre dos hojas.
   Este bloque va igual en la app y en la web (portal/antes-despues.js; herr/copias.py lo vigila). */
var AD_FIRMAS = [['resp', 'Responsable del área'], ['realiza', 'Realizado por'], ['registra', 'Registrado por']];
function adTxt(v, n){ return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n || 400); }
function adFechaN(iso){ var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
/* una observación, venga de donde venga: lo que pinta el formato */
function adFila(x){
  x = x || {};
  var ok = function(u){ u = String(u || ''); return /^(https:\/\/|blob:|data:image\/)/i.test(u) ? u : ''; };
  var f = { k:adTxt(x.k, 120) || ('ad' + Math.random().toString(36).slice(2, 9)), src:adTxt(x.src, 10),
    antes:ok(x.antes), antesTx:adTxt(x.antesTx, 600), frente:adTxt(x.frente, 80), ubic:adTxt(x.ubic, 120),
    tipo_h:(x.tipo_h === 'acto' || x.tipo_h === 'condicion') ? x.tipo_h : '', subcat:adTxt(x.subcat, 80),
    disc:x.disc === 'ma' ? 'ma' : 'sst', despues:ok(x.despues), despuesTx:adTxt(x.despuesTx, 600),
    resp:adTxt(x.resp, 90), fObs:/^\d{4}-\d{2}-\d{2}/.test(String(x.fObs || '')) ? String(x.fObs).slice(0, 10) : '',
    fLev:/^\d{4}-\d{2}-\d{2}/.test(String(x.fLev || '')) ? String(x.fLev).slice(0, 10) : '',
    origen:adTxt(x.origen, 80), antesRuta:adTxt(x.antesRuta, 300), despuesRuta:adTxt(x.despuesRuta, 300) };
  f.estado = (f.despues || f.despuesRuta || f.fLev || x.cerrado) ? 'cerrado' : 'abierto';
  return f;
}
function adTipoN(f){ return f.tipo_h === 'acto' ? 'Acto subestándar' : (f.tipo_h === 'condicion' ? 'Condición subestándar' : 'Observación'); }
function adDiscN(f){ return f.disc === 'ma' ? 'Medio ambiente' : 'SST'; }
/* el lugar, como va debajo de la foto del antes */
function adLugar(f){ return [f.frente ? 'Frente: ' + f.frente : '', f.ubic].filter(Boolean).join(' · '); }
function adTitulo(cab, filas){
  var d = cab && cab.disc;
  if(!d){ var hay = {}; (filas || []).forEach(function(f){ hay[f.disc] = 1; }); d = (hay.ma && hay.sst) ? 'mixto' : (hay.ma ? 'ma' : 'sst'); }
  return 'REGISTRO DE INSPECCIÓN — ANTES Y DESPUÉS · ' + (d === 'ma' ? 'MEDIO AMBIENTE' : (d === 'mixto' ? 'SST Y MEDIO AMBIENTE' : 'SST'));
}
function adNombre(cab, ext){
  var o = adTxt(cab && cab.empresa, 40).replace(/[^A-Za-z0-9áéíóúñÁÉÍÓÚÑ]+/g, '-').replace(/^-+|-+$/g, '') || 'obra';
  return 'Inspeccion_Antes_Despues_' + o + '_' + (String(cab && cab.fecha || '').slice(0, 10) || 'hoy') + '.' + ext;
}
/* una foto lista para el PDF y el Excel: JPEG, lado mayor «max», con su ancho y su alto */
function adImg(u, max){
  return new Promise(function(ok){
    if(!u){ ok(null); return; }
    var im = new Image(), listo = false, fin = function(v){ if(!listo){ listo = true; ok(v); } };
    if(!/^(data:|blob:)/i.test(u)) im.crossOrigin = 'anonymous';
    im.onload = function(){
      try{
        var k = Math.min(1, (max || 900) / Math.max(im.naturalWidth || 1, im.naturalHeight || 1)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round((im.naturalWidth || 1) * k)); c.height = Math.max(1, Math.round((im.naturalHeight || 1) * k));
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        fin({ d:c.toDataURL('image/jpeg', 0.8), w:c.width, h:c.height });
      }catch(_e){ fin(null); }
    };
    im.onerror = function(){ fin(null); };
    setTimeout(function(){ fin(null); }, 25000);
    im.src = u;
  });
}
/* las fotos de todas las filas, de a cuatro (f._a = antes, f._d = después; el logo en cab._logo) */
function adFotos(cab, filas, max){
  var tareas = [];
  if(cab && cab.logo && !cab._logo) tareas.push(function(){ return adImg(cab.logo, 400).then(function(m){ cab._logo = m; }); });
  (filas || []).forEach(function(f){
    if(f.antes && f._a === undefined) tareas.push(function(){ return adImg(f.antes, max).then(function(m){ f._a = m; }); });
    if(f.despues && f._d === undefined) tareas.push(function(){ return adImg(f.despues, max).then(function(m){ f._d = m; }); });
  });
  var i = 0;
  function adUno(){ var t = tareas[i++]; return t ? t().then(adUno, adUno) : Promise.resolve(); }
  return Promise.all([adUno(), adUno(), adUno(), adUno()]);
}
/* encajar w×h dentro de W×H sin deformar */
function adEncaje(w, h, W, H){ var k = Math.min(W / Math.max(w, 1), H / Math.max(h, 1)); return { w:w * k, h:h * k }; }

/* ── el PDF apaisado ─────────────────────────────────────────────────────────────────────────────────── */
function adPdf(cab, filas){
  cab = cab || {}; filas = (filas || []).map(function(f){ return f && f.k ? f : adFila(f); });
  var J = (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) || null;
  if(!J) return Promise.reject(new Error('Falta el generador de PDF'));
  return adFotos(cab, filas, 900).then(function(){
    var doc = new J({ unit:'pt', format:'a4', orientation:'landscape' });
    var W = 841.89, H = 595.28, M = 24, AN = W - 2 * M, y = M, PIE = 22;
    var titulo = adTitulo(cab, filas).replace('—', '-'), vacias = filas.length ? 0 : Math.max(0, Math.min(6, cab.vacias || 3));
    var col = [['Antes (foto y descripción)', .25], ['Tipo / clasificación', .105], ['Levantamiento (después)', .25], ['Responsable', .115],
               ['Fecha de observación', .085], ['Fecha de levantamiento', .085], ['Estado', .11]];
    var X = [], acc = M; col.forEach(function(c){ X.push(acc); acc += c[1] * AN; }); X.push(M + AN);
    var cw = function(i){ return X[i + 1] - X[i]; };
    var gris = function(){ doc.setTextColor(100, 116, 139); }, negro = function(){ doc.setTextColor(17, 24, 39); };
    doc.setLineWidth(0.6); doc.setDrawColor(148, 163, 184);
    /* el encabezado formal (primera hoja) */
    function adpCabecera(){
      var hC = 52, wL = 120, wR = 150;
      doc.rect(M, y, AN, hC);
      doc.line(M + wL, y, M + wL, y + hC); doc.line(M + AN - wR, y, M + AN - wR, y + hC);
      if(cab._logo){ var e = adEncaje(cab._logo.w, cab._logo.h, wL - 16, hC - 12); try{ doc.addImage(cab._logo.d, 'JPEG', M + (wL - e.w) / 2, y + (hC - e.h) / 2, e.w, e.h); }catch(_l){} }
      else { doc.setFont('helvetica', 'bold'); doc.setFontSize(9); gris(); doc.text(doc.splitTextToSize(adTxt(cab.empresa, 60) || 'Empresa', wL - 12).slice(0, 3), M + 6, y + 18); }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5); negro();
      doc.text(doc.splitTextToSize(titulo, AN - wL - wR - 16).slice(0, 2), M + wL + (AN - wL - wR) / 2, y + 22, { align:'center' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); gris();
      doc.text(adTxt(cab.obra, 90) || '', M + wL + (AN - wL - wR) / 2, y + 44, { align:'center' });
      var r = [['Código', cab.cod || '—'], ['Revisión', cab.rev || '00'], ['Fecha', adFechaN(cab.fecha) || '—']];
      r.forEach(function(p, i){
        var yy = y + 6 + i * 15.5;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); gris(); doc.text(p[0] + ':', M + AN - wR + 8, yy + 8);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); negro(); doc.text(adTxt(p[1], 30), M + AN - wR + 56, yy + 8);
      });
      y += hC + 6;
      /* los 6 datos, en grilla de 3 × 2 */
      var tipoP = cab.tipoInsp === 'no' ? 'no' : (cab.tipoInsp === 'programada' ? 'si' : '');
      var g = [['Empresa', cab.empresa], ['Cantidad de personas', cab.personas], ['Tipo de inspección', null],
               ['Área inspeccionada', cab.area], ['Actividad inspeccionada', cab.actividad], ['Objetivo de la inspección', cab.objetivo]];
      var gw = AN / 3, gh = 30;
      g.forEach(function(p, i){
        var x = M + (i % 3) * gw, yy = y + Math.floor(i / 3) * gh;
        doc.rect(x, yy, gw, gh);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); gris(); doc.text(p[0].toUpperCase(), x + 6, yy + 9);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.8); negro();
        if(p[1] === null){
          [['si', 'Programada'], ['no', 'No programada']].forEach(function(o, j){
            var bx = x + 6 + j * 92, by = yy + 14;
            doc.rect(bx, by, 9, 9);
            if(tipoP === o[0]){ doc.setLineWidth(1.2); doc.line(bx + 2, by + 2, bx + 7, by + 7); doc.line(bx + 7, by + 2, bx + 2, by + 7); doc.setLineWidth(0.6); }
            doc.text(o[1], bx + 13, by + 8);
          });
        } else doc.text(doc.splitTextToSize(adTxt(p[1], 200) || '', gw - 12).slice(0, 2), x + 6, yy + 19);
      });
      y += 2 * gh + 8;
    }
    function adpCabTabla(){
      var hh = 22;
      doc.setFillColor(11, 42, 58); doc.rect(M, y, AN, hh, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.6); doc.setTextColor(255, 255, 255);
      col.forEach(function(c, i){ var t = doc.splitTextToSize(c[0], cw(i) - 8); doc.text(t, X[i] + cw(i) / 2, y + hh / 2 + 2.8 - (t.length - 1) * 4.4, { align:'center' }); });
      y += hh;
    }
    function adpCabCorta(){
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); negro(); doc.text(titulo, M, y + 10);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); gris(); doc.text(adTxt(cab.empresa, 60) + (cab.area ? ' · ' + adTxt(cab.area, 60) : ''), M + AN, y + 10, { align:'right' });
      y += 18;
    }
    function adpHojaNueva(){ doc.addPage(); y = M; adpCabCorta(); adpCabTabla(); }
    var PH = vacias ? 56 : 118;   /* alto de la foto (la hoja en blanco: 3 filas en una hoja) */
    function adpLineas(t, w){ doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); return t ? doc.splitTextToSize(t, w).slice(0, 5) : []; }
    function adpFoto(img, x, yy, w, h, vacioTx){
      if(img){ var e = adEncaje(img.w, img.h, w, h); try{ doc.addImage(img.d, 'JPEG', x + (w - e.w) / 2, yy + (h - e.h) / 2, e.w, e.h); }catch(_i){} return; }
      doc.setDrawColor(203, 213, 225); doc.setLineDashPattern && doc.setLineDashPattern([3, 2], 0); doc.rect(x + 4, yy + 4, w - 8, h - 8);
      doc.setLineDashPattern && doc.setLineDashPattern([], 0); doc.setDrawColor(148, 163, 184);
      if(vacioTx){ doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(148, 163, 184); doc.text(vacioTx, x + w / 2, yy + h / 2 + 3, { align:'center' }); }
    }
    function adpFila(f, n){
      var tA = f ? [adLugar(f), f.antesTx].filter(Boolean).join('. ') : '', tD = f ? (f.despuesTx || '') : '';
      var lA = adpLineas(tA, cw(0) - 10), lD = adpLineas(tD, cw(2) - 10);
      var hT = f ? Math.max(lA.length, lD.length, 1) * 8.6 : 24, hF = 6 + PH + 4 + hT + 6;
      if(y + hF > H - M - PIE){ adpHojaNueva(); }
      doc.rect(M, y, AN, hF); for(var i = 1; i < col.length; i++) doc.line(X[i], y, X[i], y + hF);
      if(f){
        adpFoto(f._a, X[0] + 4, y + 6, cw(0) - 8, PH, f.antes ? 'Foto no disponible' : 'Sin foto');
        adpFoto(f._d, X[2] + 4, y + 6, cw(2) - 8, PH, f.estado === 'cerrado' ? (f.despues ? 'Foto no disponible' : 'Sin foto') : 'Pendiente de levantamiento');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); negro();
        doc.text(lA, X[0] + 5, y + 6 + PH + 12); doc.text(lD, X[2] + 5, y + 6 + PH + 12);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4); doc.setTextColor(9, 9, 11);
        doc.text(doc.splitTextToSize(adTipoN(f), cw(1) - 8), X[1] + cw(1) / 2, y + 16, { align:'center' });
        var yt = y + 16 + doc.splitTextToSize(adTipoN(f), cw(1) - 8).length * 9 + 4;
        if(f.subcat){ doc.setFont('helvetica', 'normal'); gris(); doc.text(doc.splitTextToSize(f.subcat, cw(1) - 8).slice(0, 2), X[1] + cw(1) / 2, yt, { align:'center' }); yt += 18; }
        var etq = adDiscN(f), ew = doc.getTextWidth(etq) + 10;
        if(f.disc === 'ma') doc.setFillColor(220, 252, 231); else doc.setFillColor(224, 242, 254);
        doc.roundedRect(X[1] + (cw(1) - ew) / 2, yt - 8, ew, 12, 3, 3, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); if(f.disc === 'ma') doc.setTextColor(21, 128, 61); else doc.setTextColor(3, 105, 161);
        doc.text(etq, X[1] + cw(1) / 2, yt + 0.5, { align:'center' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); negro();
        doc.text(doc.splitTextToSize(f.resp || '—', cw(3) - 8).slice(0, 4), X[3] + cw(3) / 2, y + 16, { align:'center' });
        doc.text(adFechaN(f.fObs) || '—', X[4] + cw(4) / 2, y + 16, { align:'center' });
        doc.text(adFechaN(f.fLev) || '—', X[5] + cw(5) / 2, y + 16, { align:'center' });
        var ce = f.estado === 'cerrado', bw = cw(6) - 18;
        if(ce) doc.setFillColor(22, 163, 74); else doc.setFillColor(220, 38, 38);
        doc.roundedRect(X[6] + 9, y + 7, bw, 15, 4, 4, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
        doc.text(ce ? 'CERRADO' : 'ABIERTO', X[6] + cw(6) / 2, y + 17.6, { align:'center' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.6); gris(); doc.text('N.° ' + n, X[6] + cw(6) / 2, y + hF - 6, { align:'center' });
      } else {
        adpFoto(null, X[0] + 4, y + 6, cw(0) - 8, PH, 'Foto del antes'); adpFoto(null, X[2] + 4, y + 6, cw(2) - 8, PH, 'Foto del después');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); gris();
        doc.text('☐ Acto  ☐ Condición'.replace(/☐/g, '[  ]'), X[1] + cw(1) / 2, y + 16, { align:'center' });
        doc.text('[  ] SST  [  ] MA', X[1] + cw(1) / 2, y + 28, { align:'center' });
        doc.text('[  ] Abierto', X[6] + cw(6) / 2, y + 16, { align:'center' }); doc.text('[  ] Cerrado', X[6] + cw(6) / 2, y + 28, { align:'center' });
      }
      y += hF;
    }
    function adpFirmas(){
      var hB = 72, gap = 10, bw = (AN - 2 * gap) / 3;
      if(y + 14 + hB > H - M - PIE){ doc.addPage(); y = M; adpCabCorta(); }
      y += 14;
      AD_FIRMAS.forEach(function(fi, i){
        var x = M + i * (bw + gap), d = (cab.firmas || {})[fi[0]] || {};
        doc.setDrawColor(148, 163, 184); doc.rect(x, y, bw, hB);
        doc.setFillColor(241, 245, 249); doc.rect(x, y, bw, 15, 'F'); doc.rect(x, y, bw, 15);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); negro(); doc.text(fi[1].toUpperCase(), x + bw / 2, y + 10.5, { align:'center' });
        var ls = [['Nombre', d.n], ['Cargo', d.c], ['Firma', null], ['Fecha', adFechaN(d.f) || d.f]];
        ls.forEach(function(l, j){
          var yy = y + 26 + j * 12 + (j === 3 ? 6 : 0);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(7.2); gris(); doc.text(l[0] + ':', x + 6, yy);
          doc.setDrawColor(203, 213, 225); doc.line(x + 40, yy + 1.5, x + bw - 8, yy + 1.5); doc.setDrawColor(148, 163, 184);
          if(l[0] === 'Firma' && d.img){ try{ doc.addImage(d.img, 'PNG', x + 44, yy - 20, 90, 24); }catch(_f){} }
          if(l[1]){ doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); negro(); doc.text(adTxt(l[1], 60), x + 42, yy - 1); }
        });
      });
      y += hB;
    }
    adpCabecera(); adpCabTabla();
    filas.forEach(function(f, i){ adpFila(f, i + 1); });
    for(var v = 0; v < vacias; v++) adpFila(null, v + 1);
    adpFirmas();
    var np = doc.getNumberOfPages();
    for(var p = 1; p <= np; p++){
      doc.setPage(p); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
      doc.text('Generado con OBRASST · ' + adTxt(cab.empresa, 60), M, H - 12);
      doc.text('Hoja ' + p + ' de ' + np, W - M, H - 12, { align:'right' });
    }
    return doc.output('blob');
  });
}

/* ── el Excel apaisado (un libro hecho a mano: hoja, estilos y fotos encajadas, sin librerías) ─────────── */
function adB64aU8(b64){ var s = atob(b64), u = new Uint8Array(s.length); for(var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
function adXmlEsc(v){ return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function adCol(i){ var s = ''; i++; while(i > 0){ var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - m) / 26); } return s; }
var AD_CRC = null;
function adCrc32(u){
  if(!AD_CRC){ AD_CRC = []; for(var n = 0; n < 256; n++){ var c = n; for(var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); AD_CRC[n] = c >>> 0; } }
  var r = 0xFFFFFFFF; for(var i = 0; i < u.length; i++) r = AD_CRC[(r ^ u[i]) & 0xFF] ^ (r >>> 8);
  return (r ^ 0xFFFFFFFF) >>> 0;
}
/* un ZIP sin comprimir (lo que pide un .xlsx): [{n:'ruta', d:Uint8Array}] → Blob */
function adZip(L, tipo){
  var enc = new TextEncoder(), partes = [], centro = [], off = 0;
  var u16 = function(v){ return [v & 255, (v >>> 8) & 255]; }, u32 = function(v){ return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; };
  L.forEach(function(e){
    var nom = enc.encode(e.n), d = e.d, crc = adCrc32(d);
    var cab = [].concat([0x50, 0x4B, 3, 4], u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(d.length), u32(d.length), u16(nom.length), u16(0));
    partes.push(new Uint8Array(cab), nom, d);
    centro.push(new Uint8Array([].concat([0x50, 0x4B, 1, 2], u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(d.length), u32(d.length),
                                         u16(nom.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nom);
    off += cab.length + nom.length + d.length;
  });
  var tc = centro.reduce(function(a, x){ return a + x.length; }, 0);
  var fin = new Uint8Array([].concat([0x50, 0x4B, 5, 6], u16(0), u16(0), u16(L.length), u16(L.length), u32(tc), u32(off), u16(0)));
  return new Blob(partes.concat(centro, [fin]), { type:tipo || 'application/zip' });
}
function adXlsx(cab, filas){
  cab = cab || {}; filas = (filas || []).map(function(f){ return f && f.k ? f : adFila(f); });
  return adFotos(cab, filas, 700).then(function(){
    var enc = new TextEncoder(), titulo = adTitulo(cab, filas);
    var anchos = [32, 22, 32, 20, 13, 14, 16], FOTO_PT = 150;
    var filasXml = [], merges = [], imgs = [], altos = {};
    var celda = function(r, c, v, s){ var ref = adCol(c) + r; return v === '' || v == null ? '<c r="' + ref + '" s="' + s + '"/>' : '<c r="' + ref + '" s="' + s + '" t="inlineStr"><is><t xml:space="preserve">' + adXmlEsc(v) + '</t></is></c>'; };
    var fila = function(r, cs, alto){ filasXml.push('<row r="' + r + '"' + (alto ? ' ht="' + alto + '" customHeight="1"' : '') + '>' + cs.join('') + '</row>'); };
    var une = function(r1, c1, r2, c2){ merges.push(adCol(c1) + r1 + ':' + adCol(c2) + r2); };
    var todo = function(r, v, s, alto){ var cs = [celda(r, 0, v, s)]; for(var c = 1; c < 7; c++) cs.push(celda(r, c, '', s)); fila(r, cs, alto); une(r, 0, r, 6); };
    var r = 1;
    todo(r++, titulo, 1, 30);
    todo(r++, [adTxt(cab.obra, 90), 'Código: ' + (cab.cod || '—'), 'Revisión: ' + (cab.rev || '00'), 'Fecha: ' + (adFechaN(cab.fecha) || '—')].filter(Boolean).join('   ·   '), 9, 18);
    var tipoP = cab.tipoInsp === 'no' ? '☐ Programada\n☒ No programada' : (cab.tipoInsp === 'programada' ? '☒ Programada\n☐ No programada' : '☐ Programada\n☐ No programada');
    fila(r, [celda(r, 0, 'Empresa', 2), celda(r, 1, cab.empresa || '', 3), celda(r, 2, '', 3), celda(r, 3, 'Cantidad de personas', 2), celda(r, 4, cab.personas || '', 3),
             celda(r, 5, 'Tipo de inspección', 2), celda(r, 6, tipoP, 3)], 34); une(r, 1, r, 2); r++;
    fila(r, [celda(r, 0, 'Área inspeccionada', 2), celda(r, 1, cab.area || '', 3), celda(r, 2, '', 3), celda(r, 3, 'Actividad inspeccionada', 2), celda(r, 4, cab.actividad || '', 3),
             celda(r, 5, '', 3), celda(r, 6, '', 3)], 30); une(r, 1, r, 2); une(r, 4, r, 6); r++;
    fila(r, [celda(r, 0, 'Objetivo de la inspección', 2), celda(r, 1, cab.objetivo || '', 3)].concat([2, 3, 4, 5, 6].map(function(c){ return celda(r, c, '', 3); })), 30); une(r, 1, r, 6); r++;
    r++;
    var cabT = ['Antes (foto y descripción)', 'Tipo / clasificación', 'Levantamiento (después)', 'Responsable', 'Fecha de observación', 'Fecha de levantamiento', 'Estado'];
    fila(r, cabT.map(function(t, c){ return celda(r, c, t, 4); }), 32); var filaCab = r; r++;
    var lista = filas.length ? filas : [null, null, null];
    lista.forEach(function(f, i){
      var r1 = r, r2 = r + 1;
      var tA = f ? [adLugar(f), f.antesTx].filter(Boolean).join('. ') : '', tD = f ? (f.despuesTx || '') : '';
      var tipo = f ? adTipoN(f) + (f.subcat ? '\n' + f.subcat : '') + '\n' + adDiscN(f) : '[ ] Acto  [ ] Condición\n[ ] SST  [ ] MA';
      var est = f ? (f.estado === 'cerrado' ? 'CERRADO' : 'ABIERTO') : '';
      fila(r1, [celda(r1, 0, '', 10), celda(r1, 1, tipo, 6), celda(r1, 2, f && !f._d && f.estado !== 'cerrado' ? 'Pendiente de levantamiento' : '', f && !f._d ? 11 : 10),
                celda(r1, 3, f ? (f.resp || '—') : '', 6), celda(r1, 4, f ? (adFechaN(f.fObs) || '—') : '', 6), celda(r1, 5, f ? (adFechaN(f.fLev) || '—') : '', 6),
                celda(r1, 6, est, f ? (f.estado === 'cerrado' ? 7 : 8) : 6)], FOTO_PT);
      var lin = Math.max(String(tA).length / 42, String(tD).length / 42, 1);
      fila(r2, [celda(r2, 0, tA, 5), celda(r2, 1, '', 6), celda(r2, 2, tD, 5), celda(r2, 3, '', 6), celda(r2, 4, '', 6), celda(r2, 5, '', 6), celda(r2, 6, '', f ? (f.estado === 'cerrado' ? 7 : 8) : 6)],
           Math.min(90, Math.max(24, Math.ceil(lin) * 12 + 6)));
      [1, 3, 4, 5, 6].forEach(function(c){ une(r1, c, r2, c); });
      if(f){ if(f._a) imgs.push({ m:f._a, c:0, r:r1 }); if(f._d) imgs.push({ m:f._d, c:2, r:r1 }); }
      r += 2;
    });
    r++;
    /* las 3 firmas: A-B, C-D, E-G */
    var bloques = [[0, 1], [2, 3], [4, 6]];
    var lineasF = [['', 12], ['Nombre', 3], ['Cargo', 3], ['Firma', 3], ['Fecha', 3]];
    lineasF.forEach(function(lf, j){
      var cs = [];
      bloques.forEach(function(b, bi){
        var d = (cab.firmas || {})[AD_FIRMAS[bi][0]] || {};
        var v = j === 0 ? AD_FIRMAS[bi][1].toUpperCase() : (lf[0] + ': ' + (j === 1 ? (d.n || '') : (j === 2 ? (d.c || '') : (j === 4 ? (adFechaN(d.f) || d.f || '') : ''))));
        for(var c = b[0]; c <= b[1]; c++) cs.push(celda(r, c, c === b[0] ? v : '', lf[1]));
        une(r, b[0], r, b[1]);
      });
      fila(r, cs, j === 3 ? 42 : 20); r++;
    });
    /* las fotos, encajadas y centradas en su celda */
    var anclas = [], rels = [], medios = [];
    imgs.forEach(function(im, i){
      var n = i + 1, wpx = Math.round(anchos[im.c] * 7 + 5), hpx = Math.round(FOTO_PT * 96 / 72);
      var e = adEncaje(im.m.w, im.m.h, (wpx - 16) * 0.94, (hpx - 12) * 0.94), cx = Math.round(e.w * 9525), cy = Math.round(e.h * 9525);
      medios.push({ n:'xl/media/foto' + n + '.jpeg', d:adB64aU8(im.m.d.split(',')[1]) });
      rels.push('<Relationship Id="rId' + n + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/foto' + n + '.jpeg"/>');
      anclas.push('<xdr:oneCellAnchor><xdr:from><xdr:col>' + im.c + '</xdr:col><xdr:colOff>' + Math.round((wpx - e.w) / 2 * 9525) + '</xdr:colOff><xdr:row>' + (im.r - 1) +
        '</xdr:row><xdr:rowOff>' + Math.round((hpx - e.h) / 2 * 9525) + '</xdr:rowOff></xdr:from><xdr:ext cx="' + cx + '" cy="' + cy + '"/>' +
        '<xdr:pic><xdr:nvPicPr><xdr:cNvPr id="' + n + '" name="Foto ' + n + '"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>' +
        '<xdr:blipFill><a:blip r:embed="rId' + n + '"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>' +
        '<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>');
    });
    var hoja = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="15"/><cols>' + anchos.map(function(w, i){ return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join('') + '</cols>' +
      '<sheetData>' + filasXml.join('') + '</sheetData>' +
      (merges.length ? '<mergeCells count="' + merges.length + '">' + merges.map(function(m){ return '<mergeCell ref="' + m + '"/>'; }).join('') + '</mergeCells>' : '') +
      '<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/>' +
      '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>' +
      '<headerFooter><oddFooter>&amp;LOBRASST&amp;RHoja &amp;P de &amp;N</oddFooter></headerFooter>' +
      '<rowBreaks count="0" manualBreakCount="0"/>' +
      (anclas.length ? '<drawing r:id="rIdD"/>' : '') + '</worksheet>';
    hoja = hoja.replace('<rowBreaks count="0" manualBreakCount="0"/>', '');
    var estilos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<fonts count="8"><font><sz val="10"/><name val="Calibri"/></font><font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="9"/><color rgb="FF475569"/><name val="Calibri"/></font><font><sz val="10"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="9"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><sz val="9"/><name val="Calibri"/></font>' +
      '<font><sz val="9"/><color rgb="FF64748B"/><name val="Calibri"/></font><font><i/><sz val="9"/><color rgb="FF94A3B8"/><name val="Calibri"/></font></fonts>' +
      '<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FF0B2A3A"/><bgColor indexed="64"/></patternFill></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FF16A34A"/><bgColor indexed="64"/></patternFill></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFDC2626"/><bgColor indexed="64"/></patternFill></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>' +
      '<border><left style="thin"><color rgb="FF94A3B8"/></left><right style="thin"><color rgb="FF94A3B8"/></right><top style="thin"><color rgb="FF94A3B8"/></top><bottom style="thin"><color rgb="FF94A3B8"/></bottom><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="13">' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
      '<xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
      '<xf numFmtId="0" fontId="6" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>' +
      '<xf numFmtId="0" fontId="7" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
      '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
    var tipos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      '<Default Extension="jpeg" ContentType="image/jpeg"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      (anclas.length ? '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' : '') + '</Types>';
    var P = [
      { n:'[Content_Types].xml', d:tipos },
      { n:'_rels/.rels', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { n:'xl/workbook.xml', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Antes y Después" sheetId="1" r:id="rId1"/></sheets>' +
        '<definedNames><definedName name="_xlnm.Print_Titles" localSheetId="0">\'Antes y Después\'!$' + filaCab + ':$' + filaCab + '</definedName></definedNames></workbook>' },
      { n:'xl/_rels/workbook.xml.rels', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { n:'xl/styles.xml', d:estilos },
      { n:'xl/worksheets/sheet1.xml', d:hoja }
    ];
    if(anclas.length){
      P.push({ n:'xl/worksheets/_rels/sheet1.xml.rels', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdD" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>' });
      P.push({ n:'xl/drawings/drawing1.xml', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' + anclas.join('') + '</xdr:wsDr>' });
      P.push({ n:'xl/drawings/_rels/drawing1.xml.rels', d:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rels.join('') + '</Relationships>' });
    }
    var L = P.map(function(x){ return { n:x.n, d:enc.encode(x.d) }; }).concat(medios);
    return adZip(L, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
}
/* de dónde salen: el chat de la obra (sst_obs_obra; las fotos son rutas del balde «chat», cada lado las baja con su sesión) */
function adDeChat(o){
  o = o || {};
  return adFila({ k:'chat-' + o.id, src:'chat', origen:'Chat · ' + adTxt(o.grupo || 'Grupo', 40), antesRuta:o.antes, despuesRuta:o.despues,
    antesTx:o.texto, despuesTx:o.despues_tx, frente:o.frente, ubic:o.ubic, tipo_h:o.tipo_h, subcat:o.subcat, disc:o.disc,
    resp:o.resp, fObs:o.fecha, fLev:o.lev, cerrado:o.estado === 'cumplido' || !!o.lev });
}
/* los reportes de actos y condiciones (sst_reporte) */
function adDeReporte(r){
  r = r || {}; var lv = (r.lev && typeof r.lev === 'object') ? r.lev : {};
  return adFila({ k:'rep-' + r.id, src:'rep', origen:'Reporte de ' + (r.clase === 'acto' ? 'acto' : 'condición'), antes:r.foto_url, despues:r.foto_cierre || lv.foto_url,
    antesTx:[r.descripcion, r.actividad ? 'Actividad: ' + r.actividad : ''].filter(Boolean).join('. '), despuesTx:r.accion || lv.accion,
    ubic:r.lugar, tipo_h:r.clase, disc:/ambient|residuo|derrame|matpel/i.test(String(r.descripcion || '') + ' ' + String(r.actividad || '')) ? 'ma' : 'sst',
    resp:r.cerrado_por || lv.autor, fObs:r.fecha || String(r.creado || '').slice(0, 10), fLev:r.cerrado, cerrado:r.estado === 'atendido' });
}
/* las observaciones de una inspección (sst_inspeccion.hallazgos, o la inspección guardada en el celular) */
function adDeInspeccion(g){
  g = g || {}; var H = Array.isArray(g.hallazgos) ? g.hallazgos : [], nom = adTxt(g.nombre || g.tipo || 'Inspección', 80);
  var ma = /ambient|residuo|derrame|matpel|qu[ií]mic/i.test(nom + ' ' + String(g.k || ''));
  return H.map(function(h, i){
    h = h || {};
    return adFila({ k:'insp-' + (g.ext || g.id || '') + '-' + i, src:'insp', origen:nom, antes:h.fotoAntes, despues:h.fotoDespues,
      antesTx:[h.t, h.obs && h.obs !== h.t ? h.obs : ''].filter(Boolean).join('. '), despuesTx:h.levTexto, frente:h.area || g.area, ubic:h.ubica || g.ubica,
      tipo_h:h.tipo_h || (/\bacto\b/i.test(String(h.t || '')) ? 'acto' : 'condicion'), disc:h.disc || (ma ? 'ma' : 'sst'),
      resp:h.responsable, fObs:g.fecha, fLev:h.estado === 'cerrado' ? (h.fechaEjec || '') : '', cerrado:h.estado === 'cerrado' });
  });
}
/* los filtros del panel: periodo, disciplina, tipo, estado, frente y responsable */
function adFiltrar(L, F){
  F = F || {}; var q = function(v){ return String(v || '').toLowerCase().trim(); };
  return (L || []).filter(function(f){
    if(F.desde && f.fObs && f.fObs < F.desde) return false;
    if(F.hasta && f.fObs && f.fObs > F.hasta) return false;
    if(F.disc && F.disc !== 'todas' && f.disc !== F.disc) return false;
    if(F.tipo && F.tipo !== 'todos' && f.tipo_h !== F.tipo) return false;
    if(F.estado && F.estado !== 'todos' && f.estado !== F.estado) return false;
    if(F.src && F.src !== 'todas' && f.src !== F.src) return false;
    if(F.frente && q(f.frente + ' ' + f.ubic).indexOf(q(F.frente)) < 0) return false;
    if(F.resp && q(f.resp).indexOf(q(F.resp)) < 0) return false;
    return true;
  });
}
/* el periodo elegido, en fechas (hoy, esta semana de lunes a hoy, este mes, o un rango) */
function adPeriodo(k, hoy, d, h){
  var t = String(hoy || '').slice(0, 10), D = new Date(t + 'T12:00:00');
  if(k === 'hoy') return { desde:t, hasta:t };
  if(k === 'semana'){ var w = (D.getDay() + 6) % 7, L = new Date(D.getTime() - w * 864e5); return { desde:L.toISOString().slice(0, 10), hasta:t }; }
  if(k === 'mes') return { desde:t.slice(0, 8) + '01', hasta:t };
  if(k === 'rango') return { desde:/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '', hasta:/^\d{4}-\d{2}-\d{2}$/.test(h || '') ? h : '' };
  return { desde:'', hasta:'' };
}
/* >>> ANTES-DESPUES-MOTOR-FIN <<< */
/* >>> ANTES-DESPUES-WEB (24/11/2026) <<<
   ══ «ANTES Y DESPUÉS» EN LA WEB (Inspecciones y equipos) ════════════════════════════════════════════════════════════
   Lo mismo que en la app: las observaciones del chat de la obra (sst_obs_obra), los reportes de actos y condiciones y
   las observaciones de las inspecciones (sst_inspeccion.hallazgos), con sus filtros y sus casillas, al registro apaisado
   en PDF o en Excel. Las fotos del chat se bajan con la sesión (balde «chat»); nada se copia. */
var ADW = { L:null, cargando:false, aviso:'', sel:{}, cab:null, abierto:true, obra:'',
  F:{ per:'mes', d:'', h:'', disc:'todas', tipo:'todos', estado:'todos', src:'todas', frente:'', resp:'' } };
var LS_ADW_CAB = 'sstp_ad_cab';
function _adwUrl(ruta){
  ADW.urls = ADW.urls || {};
  if(ADW.urls[ruta]) return Promise.resolve(ADW.urls[ruta]);
  return sbFetch(SB.url + '/storage/v1/object/authenticated/chat/' + String(ruta).split('/').map(encodeURIComponent).join('/'), { method:'GET' })
    .then(function(r){ return r.ok ? r.blob() : Promise.reject(r.status); }).then(function(b){ var u = URL.createObjectURL(b); ADW.urls[ruta] = u; return u; });
}
function _adwLs(){ try{ return JSON.parse(localStorage.getItem(LS_ADW_CAB) || '{}') || {}; }catch(_e){ return {}; } }
function _adwCabGuardar(){
  var id = (YO.obra || {}).id, c = ADW.cab; if(!id || !c) return;
  var t = _adwLs(); t[id] = { empresa:c.empresa, personas:c.personas, tipoInsp:c.tipoInsp, area:c.area, actividad:c.actividad, objetivo:c.objetivo, cod:c.cod, rev:c.rev, firmas:c.firmas };
  try{ localStorage.setItem(LS_ADW_CAB, JSON.stringify(t)); }catch(_g){}
}
function _adwCab(){
  var id = (YO.obra || {}).id, c = _adwLs()[id] || {};
  ADW.cab = { empresa:c.empresa || '', obra:nombreObraP() || '', personas:c.personas || '', tipoInsp:c.tipoInsp || 'programada', area:c.area || '',
    actividad:c.actividad || '', objetivo:c.objetivo || '', cod:c.cod || '', rev:c.rev || '00', logo:'',
    firmas:c.firmas || { resp:{ n:'', c:'' }, realiza:{ n:YO.nombre || '', c:'' }, registra:{ n:YO.nombre || '', c:'' } } };
  if(typeof empleadorP === 'function') empleadorP().then(function(e){ if(!e || !ADW.cab) return; if(!ADW.cab.empresa && e.razon){ ADW.cab.empresa = e.razon; var x = $('adw-c-empresa'); if(x && !x.value) x.value = e.razon; } if(e.logo) ADW.cab.logo = e.logo; }, function(){});
  return ADW.cab;
}
function _adwCss(){
  if(document.getElementById('adw-css')) return;
  var st = document.createElement('style'); st.id = 'adw-css';
  st.textContent = '.adw,.adw *{font-family:var(--letra) !important}.adw-fil{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;align-items:end;margin:0 0 12px}' +
    '.adw-fil label{display:block;font-size:12px;font-weight:600;margin:0 0 4px;color:var(--gris)}.adw-fil select,.adw-fil input{width:100%;margin:0}' +
    '.adw-per{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.adw-per button{padding:7px 13px;border-radius:999px;border:1px solid var(--raya);background:var(--panel);font:inherit;font-size:13px;font-weight:600;cursor:pointer}' +
    '.adw-per button.on{background:var(--acento-suave,#fdf3d6);border-color:var(--acento,#c99a2e)}' +
    '.adw-barra{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 0;background:var(--fondo)}.adw-barra b{flex:1;min-width:200px}' +
    '.adw-l{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}' +
    '.adw .adw-it{display:grid;grid-template-columns:24px 1fr;gap:10px;padding:10px;border:1px solid var(--raya);border-radius:12px;background:var(--panel);cursor:pointer;margin:0;color:var(--texto,inherit);font-size:14px;font-weight:400;letter-spacing:0}' +
    '.adw .adw-it.on{border-color:var(--acento,#c99a2e);box-shadow:0 0 0 2px var(--acento-suave,#fdf3d6)}.adw-it input{width:18px;height:18px;margin:2px 0 0}' +
    '.adw-ft2{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 8px}.adw-ft{position:relative;aspect-ratio:4/3;border-radius:8px;overflow:hidden;background:var(--fondo);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gris);text-align:center;padding:4px}' +
    '.adw-ft img{width:100%;height:100%;object-fit:contain;display:block}.adw-ft span{position:absolute;left:5px;top:5px;background:#000a;color:#fff;font-size:10.5px;font-weight:700;padding:2px 6px;border-radius:6px}' +
    '.adw-tags{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 6px}.adw-tag{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--fondo)}' +
    '.adw-tag.sst{background:#e0f2fe;color:#0369a1}.adw-tag.ma{background:#dcfce7;color:#15803d}.adw-tag.ab{background:#fee2e2;color:#b91c1c}.adw-tag.ce{background:#dcfce7;color:#15803d}' +
    '.adw-tx{font-size:13.5px;margin:0 0 4px;overflow-wrap:anywhere}.adw-meta{font-size:12px;color:var(--gris)}' +
    '.adw-cab{margin:16px 0;border:1px solid var(--raya);border-radius:12px;padding:12px 14px;background:var(--panel)}.adw-cab summary{font-weight:700;cursor:pointer}' +
    '.adw-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px}.adw-g label{display:block;font-size:12px;font-weight:600;margin:0 0 4px;color:var(--gris)}.adw-g input,.adw-g select{width:100%;margin:0}' +
    '.adw-fir{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px}.adw-fir > div{border:1px dashed var(--raya);border-radius:10px;padding:8px 10px;display:grid;gap:6px}' +
    '.adw-acc{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0}.adw-rng[hidden],.adw-it[hidden]{display:none !important}';
  document.head.appendChild(st);
}
function vistaAntesDespues(caja){
  _adwCss();
  if(ADW.obra !== (YO.obra || {}).id){ ADW.obra = (YO.obra || {}).id; ADW.L = null; ADW.sel = {}; ADW.cab = null; }
  ADW.caja = caja;
  if(!ADW.L && !ADW.cargando) adwCargar(); else adwPintar();
}
function adwCargar(){
  var id = (YO.obra || {}).id; if(!id) return;
  ADW.cargando = true; ADW.aviso = ''; adwPintar();
  var desde = new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10);
  var pChat = sbRpc('sst_obs_obra', { p_emp:id, p_desde:desde, p_hasta:hoyISO() }).then(function(j){
    if(j && j.ok === false){ if(j.motivo === 'solo_supervisores') ADW.aviso = 'Las observaciones del chat las ven los supervisores de la obra.'; return []; }
    return ((j && j.obs) || []).map(adDeChat);
  }, function(e){ if(e === 404) ADW.aviso = 'Las observaciones del chat aparecen cuando se active la actualización del servidor.'; return []; });
  var pRep = traer('sst_reporte', '&select=id,clase,descripcion,lugar,foto_url,foto_cierre,accion,cerrado,cerrado_por,estado,fecha,creado,actividad,lev&order=creado.desc', 500)
    .then(function(r){ return (r || []).map(adDeReporte); }, function(){ return []; });
  var pIns = sbGet('sst_inspeccion?empresa=eq.' + encodeURIComponent(id) + '&hallazgos=not.is.null&select=id,ext,tipo,fecha,hallazgos&order=fecha.desc&limit=300')
    .then(function(r){ var L = []; (r || []).forEach(function(g){ L = L.concat(adDeInspeccion({ id:g.id, ext:g.ext, nombre:g.tipo, fecha:g.fecha, hallazgos:g.hallazgos })); }); return L; },
          function(){ return []; });
  Promise.all([pChat, pRep, pIns]).then(function(r){
    ADW.L = r[0].concat(r[1], r[2]).sort(function(a, b){ return String(b.fObs).localeCompare(String(a.fObs)); });
    ADW.cargando = false; adwPintar(); _adwFotosChat(ADW.L.filter(function(f){ return f.src === 'chat'; }).slice(0, 120));
  });
}
function _adwFotosChat(L){
  var tareas = [];
  L.forEach(function(f){
    if(f.antesRuta && !f.antes) tareas.push(function(){ return _adwUrl(f.antesRuta).then(function(u){ f.antes = u; _adwPoner(f.k, 'a', u); }, function(){}); });
    if(f.despuesRuta && !f.despues) tareas.push(function(){ return _adwUrl(f.despuesRuta).then(function(u){ f.despues = u; _adwPoner(f.k, 'd', u); }, function(){}); });
  });
  var i = 0; function adUnoW(){ var t = tareas[i++]; return t ? t().then(adUnoW, adUnoW) : Promise.resolve(); }
  return Promise.all([adUnoW(), adUnoW(), adUnoW(), adUnoW()]);
}
function _adwPoner(k, l, u){
  var c = ADW.caja && ADW.caja.querySelector('.adw-ft[data-k="' + (window.CSS && CSS.escape ? CSS.escape(k) : k) + '"][data-l="' + l + '"]');
  if(c && u) c.innerHTML = '<span>' + (l === 'a' ? 'Antes' : 'Después') + '</span><img src="' + esc(u) + '" alt="" loading="lazy">';
}
function adwVisibles(){
  var F = ADW.F, p = adPeriodo(F.per, hoyISO(), F.d, F.h);
  return adFiltrar(ADW.L || [], { desde:p.desde, hasta:p.hasta, disc:F.disc, tipo:F.tipo, estado:F.estado, src:F.src, frente:F.frente, resp:F.resp });
}
function _adwCuenta(){ var V = adwVisibles(), n = Object.keys(ADW.sel).filter(function(k){ return ADW.sel[k]; }).length; return V.length + ' observacion' + (V.length === 1 ? '' : 'es') + ' · ' + n + ' marcada' + (n === 1 ? '' : 's'); }
function adwPintar(){
  var caja = ADW.caja; if(!caja) return;
  var F = ADW.F, cab = ADW.cab || _adwCab(), fi = cab.firmas || {};
  var sel = function(k, et, ops){ return '<div><label for="adw-' + k + '">' + et + '</label><select id="adw-' + k + '" data-fs="' + k + '">' +
    ops.map(function(o){ return '<option value="' + o[0] + '"' + (F[k] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>'; };
  var V = ADW.L ? adwVisibles() : [];
  var h = '<div class="adw"><div class="tarj"><div class="tarj-cuerpo"><h3 style="margin:0 0 4px">Observaciones de obra · Antes y Después</h3>' +
    '<p class="ayuda" style="margin:0 0 12px">Las del chat de la obra, los reportes de actos y condiciones y las de las inspecciones. Filtra, marca las que van y saca el registro horizontal en PDF o en Excel.</p>' +
    '<div class="adw-per" role="group" aria-label="Periodo">' + [['hoy', 'Hoy'], ['semana', 'Esta semana'], ['mes', 'Este mes'], ['rango', 'Rango personalizado'], ['todo', 'Todo']].map(function(o){
      return '<button type="button" data-per="' + o[0] + '" class="' + (F.per === o[0] ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>' +
    '<div class="adw-fil">' +
      '<div class="adw-rng"' + (F.per === 'rango' ? '' : ' hidden') + '><label for="adw-d">Desde</label><input type="date" id="adw-d" data-fi="d" value="' + esc(F.d) + '"></div>' +
      '<div class="adw-rng"' + (F.per === 'rango' ? '' : ' hidden') + '><label for="adw-h">Hasta</label><input type="date" id="adw-h" data-fi="h" value="' + esc(F.h) + '"></div>' +
      sel('disc', 'Disciplina', [['todas', 'Todas'], ['sst', 'Seguridad (SST)'], ['ma', 'Medio ambiente (MA)']]) +
      sel('tipo', 'Tipo', [['todos', 'Todos'], ['acto', 'Acto subestándar'], ['condicion', 'Condición subestándar']]) +
      sel('estado', 'Estado', [['todos', 'Todos'], ['abierto', 'Abierto'], ['cerrado', 'Cerrado']]) +
      sel('src', 'De dónde', [['todas', 'Todas'], ['chat', 'Chat de la obra'], ['rep', 'Reportes'], ['insp', 'Inspecciones']]) +
      '<div><label for="adw-fr">Frente o ubicación</label><input id="adw-fr" data-fi="frente" value="' + esc(F.frente) + '" placeholder="Torre A"></div>' +
      '<div><label for="adw-re">Responsable</label><input id="adw-re" data-fi="resp" value="' + esc(F.resp) + '" placeholder="Nombre o subcontratista"></div></div>' +
    (ADW.aviso ? '<p class="ayuda" style="color:#b45309">' + esc(ADW.aviso) + '</p>' : '') +
    '<div class="adw-barra"><b id="adw-cuenta">' + (ADW.cargando ? 'Buscando…' : _adwCuenta()) + '</b>' +
      '<button type="button" class="bt sec chico" data-op="marcar">Marcar visibles</button><button type="button" class="bt sec chico" data-op="limpiar">Limpiar</button>' +
      '<button type="button" class="bt chico" data-op="pdf">Generar PDF</button><button type="button" class="bt sec chico" data-op="xlsx">Generar Excel</button></div>';
  if(ADW.cargando && !ADW.L) h += '<div class="vacio carga">Cargando…</div>';
  else if(!V.length) h += '<div class="vacio"><b>Sin observaciones con esos filtros</b>Prueba con «Todo». Las del chat salen cuando una observación se asigna desde un mensaje con foto.</div>';
  else h += '<div class="adw-l">' + V.slice(0, 400).map(function(f){
    var on = !!ADW.sel[f.k], ft = function(u, l, ruta){ return '<div class="adw-ft" data-k="' + esc(f.k) + '" data-l="' + l + '">' +
      (u ? '<span>' + (l === 'a' ? 'Antes' : 'Después') + '</span><img src="' + esc(u) + '" alt="" loading="lazy">' : (ruta ? 'Cargando la foto…' : (l === 'd' ? (f.estado === 'cerrado' ? 'Sin foto' : 'Pendiente de levantamiento') : 'Sin foto'))) + '</div>'; };
    return '<label class="adw-it' + (on ? ' on' : '') + '"><input type="checkbox" data-ck="' + esc(f.k) + '"' + (on ? ' checked' : '') + ' aria-label="Va al registro">' +
      '<div><div class="adw-ft2">' + ft(f.antes, 'a', f.antesRuta) + ft(f.despues, 'd', f.despuesRuta) + '</div>' +
      '<div class="adw-tags"><span class="adw-tag">' + esc(adTipoN(f)) + '</span><span class="adw-tag ' + f.disc + '">' + adDiscN(f) + '</span><span class="adw-tag ' + (f.estado === 'cerrado' ? 'ce">CERRADO' : 'ab">ABIERTO') + '</span></div>' +
      '<p class="adw-tx">' + esc(f.antesTx || '(sin descripción)') + '</p><div class="adw-meta">' + esc([adLugar(f), f.resp ? 'Resp.: ' + f.resp : '', adFechaN(f.fObs), f.origen].filter(Boolean).join(' · ')) + '</div></div></label>';
  }).join('') + '</div>';
  var inp = function(k, et, ph, t){ return '<div><label for="adw-c-' + k + '">' + et + '</label><input id="adw-c-' + k + '" data-cab="' + k + '"' + (t ? ' type="' + t + '"' : '') + ' value="' + esc(cab[k] || '') + '" placeholder="' + esc(ph || '') + '"></div>'; };
  h += '<details class="adw-cab"' + (ADW.abierto ? ' open' : '') + ' id="adw-cab"><summary>Encabezado y firmas del registro</summary><div class="adw-g">' +
    inp('empresa', 'Empresa', 'Razón social') + inp('personas', 'Cantidad de personas', 'En el área', 'number') +
    '<div><label for="adw-c-tipoInsp">Tipo de inspección</label><select id="adw-c-tipoInsp" data-cab="tipoInsp"><option value="programada"' + (cab.tipoInsp === 'no' ? '' : ' selected') + '>Programada</option><option value="no"' + (cab.tipoInsp === 'no' ? ' selected' : '') + '>No programada</option></select></div>' +
    inp('area', 'Área inspeccionada', 'Frente o ubicación') + inp('actividad', 'Actividad inspeccionada', 'Qué se hacía') + inp('objetivo', 'Objetivo de la inspección', 'Qué se buscaba verificar') +
    inp('cod', 'Código del formato', 'SST-FOR-012') + inp('rev', 'Revisión', '00') + '</div>' +
    '<div class="adw-fir">' + AD_FIRMAS.map(function(x){ var d = fi[x[0]] || {};
      return '<div><b>' + x[1] + '</b><label for="adw-f-' + x[0] + '-n">Nombre</label><input id="adw-f-' + x[0] + '-n" data-fir="' + x[0] + '.n" value="' + esc(d.n || '') + '">' +
        '<label for="adw-f-' + x[0] + '-c">Cargo</label><input id="adw-f-' + x[0] + '-c" data-fir="' + x[0] + '.c" value="' + esc(d.c || '') + '"></div>'; }).join('') + '</div></details>' +
    '<div class="adw-acc"><button type="button" class="bt" data-op="pdf">Generar inspección Antes y Después (PDF)</button><button type="button" class="bt sec" data-op="xlsx">Generar en Excel</button>' +
    '<span class="msg" id="adw-msg" role="status"></span></div><p class="ayuda">Sin nada marcado sale la hoja en blanco, para llenarla a mano.</p></div></div></div>';
  caja.innerHTML = h;
  if(!caja.getAttribute('data-adw')){ caja.setAttribute('data-adw', '1'); _adwCablear(caja); }
}
function _adwCablear(caja){
  caja.addEventListener('click', function(ev){
    if(!ADW.caja || ADW.caja !== caja) return;
    var p = ev.target.closest('[data-per]'); if(p){ ADW.F.per = p.getAttribute('data-per'); adwPintar(); return; }
    var b = ev.target.closest('[data-op]'); if(!b) return;
    var op = b.getAttribute('data-op');
    if(op === 'marcar'){ adwVisibles().forEach(function(f){ ADW.sel[f.k] = true; }); adwPintar(); }
    else if(op === 'limpiar'){ ADW.sel = {}; adwPintar(); }
    else if(op === 'pdf' || op === 'xlsx') adwGenerar(op, b);
  });
  caja.addEventListener('change', function(ev){
    var x = ev.target;
    if(x.hasAttribute('data-ck')){ ADW.sel[x.getAttribute('data-ck')] = x.checked; var it = x.closest('.adw-it'); if(it) it.classList.toggle('on', x.checked); var c = $('adw-cuenta'); if(c) c.textContent = _adwCuenta(); return; }
    if(x.hasAttribute('data-fs')){ ADW.F[x.getAttribute('data-fs')] = x.value; adwPintar(); return; }
    if(x.hasAttribute('data-fi')){ ADW.F[x.getAttribute('data-fi')] = x.value; adwPintar(); return; }
    _adwLeer(x);
  });
  caja.addEventListener('input', function(ev){ _adwLeer(ev.target); });
  caja.addEventListener('toggle', function(ev){ if(ev.target && ev.target.id === 'adw-cab') ADW.abierto = ev.target.open; }, true);
}
function _adwLeer(x){
  var cab = ADW.cab; if(!cab) return;
  if(x.hasAttribute('data-cab')) cab[x.getAttribute('data-cab')] = String(x.value || '').slice(0, 200);
  else if(x.hasAttribute('data-fir')){ var k = x.getAttribute('data-fir').split('.'); cab.firmas = cab.firmas || {}; cab.firmas[k[0]] = cab.firmas[k[0]] || {}; cab.firmas[k[0]][k[1]] = String(x.value || '').slice(0, 90); }
  else return;
  _adwCabGuardar();
}
function adwGenerar(tipo, b){
  var m = $('adw-msg'), cab = ADW.cab || _adwCab(), L = (ADW.L || []).filter(function(f){ return ADW.sel[f.k]; });
  if(m){ m.className = 'msg gris'; m.textContent = L.length ? 'Armando con ' + L.length + ' observacion' + (L.length === 1 ? '' : 'es') + '…' : 'Armando la hoja en blanco…'; }
  if(b) b.disabled = true;
  (tipo === 'pdf' && typeof cargarEvPDF === 'function' ? cargarEvPDF() : Promise.resolve()).then(function(){ return _adwFotosChat(L); }).then(function(){
    var c2 = Object.assign({}, cab, { fecha:hoyISO() });
    return tipo === 'pdf' ? adPdf(c2, L) : adXlsx(c2, L);
  }).then(function(blob){
    if(b) b.disabled = false; bajarBlob(blob, adNombre(cab, tipo));
    if(m){ m.className = 'msg ok'; m.textContent = 'Listo.'; }
  }, function(e){ if(b) b.disabled = false; if(m){ m.className = 'msg mal'; m.textContent = 'No se pudo armar: ' + ((e && e.message) || e || 'revisa tu conexión') + '.'; } });
}
/* >>> ANTES-DESPUES-WEB-FIN <<< */
