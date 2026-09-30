/* OBRASST · lo común de los equipos y herramientas con QR, para el portal.
   Lo arma armar.py desde equipos-base.js (el mismo de la app). No editar. */
/* ══════════════════════════════════════════════════════════════════
   EQUIPOS Y HERRAMIENTAS CON QR · LO COMÚN (01/10/2026)
   Lo mismo en la app y en el portal (armar.py lo pone en la app y arma
   portal/equipos.js con esto): los tipos con su prefijo, su formato de
   inspección y su etiqueta; las cuatro etiquetas a tamaño real; los
   colores de la cinta; el enlace del QR (/h/?t=<ficha>, nunca el código
   de la obra) y el PDF de las etiquetas en hoja A4. Sin nada de la
   pantalla: el PDF necesita jsPDF y qrcode() solo al armarse.
   ══════════════════════════════════════════════════════════════════ */
var BASE_EQ = 'https://descarganomaspe.github.io/sst-capacita/h/';
/* n: el color; c: «la cinta roja» (cinta es femenino: roja, amarilla, blanca…) */
var EQ_COLORES = [
  {k:'rojo', n:'Rojo', c:'cinta roja', h:'#D32F2F'}, {k:'azul', n:'Azul', c:'cinta azul', h:'#1E5BD8'}, {k:'amarillo', n:'Amarillo', c:'cinta amarilla', h:'#F5C400'},
  {k:'verde', n:'Verde', c:'cinta verde', h:'#2E9E48'}, {k:'blanco', n:'Blanco', c:'cinta blanca', h:'#FFFFFF'}, {k:'naranja', n:'Naranja', c:'cinta naranja', h:'#F57C00'},
  {k:'negro', n:'Negro', c:'cinta negra', h:'#222222'}, {k:'morado', n:'Morado', c:'cinta morada', h:'#7B3FB5'}
];
/* cada tipo: [nombre, prefijo del código, formato de inspección (si no, el del grupo), etiqueta (si no, la del grupo)] */
var EQ_TIPOS = [
  {g:'Herramientas eléctricas', e:'bandera', f:'herramientas-manuales', l:[
    ['Amoladora','AMO'],['Taladro','TAL'],['Rotomartillo','ROT'],['Sierra circular','SIE'],['Esmeril','ESM'],
    ['Pulidora','PUL'],['Soldadora','SOL'],['Extensión eléctrica','EXE'],['Otra herramienta eléctrica','HEL']]},
  {g:'Herramientas manuales', e:'placa', f:'herramientas-manuales', l:[
    ['Martillo','MAR'],['Comba','COM'],['Llave','LLA'],['Alicate','ALI'],['Destornillador','DES'],['Cincel','CIN'],
    ['Serrucho','SER'],['Barreta','BAR'],['Pala','PAL'],['Carretilla','CRR'],['Otra herramienta manual','HMA']]},
  {g:'Cajas y maletines', e:'caja', f:'herramientas-manuales', l:[
    ['Caja de herramientas','CAJ'],['Maletín de herramientas','MAL'],['Tablero de herramientas','TAB']]},
  {g:'Izaje', e:'placa', f:'herramientas-y-accesorios-de-izaje', l:[
    ['Eslinga','ESL'],['Estrobo','ETR'],['Grillete','GRI'],['Tecle','TEC']]},
  {g:'Trabajo en altura', e:'placa', f:null, l:[
    ['Arnés','ARN'],['Línea de vida','LDV'],['Escalera','ESC',null,'sticker']]},
  {g:'Emergencia', e:'sticker', f:null, l:[
    ['Extintor','EXT','extintores'],['Botiquín','BOT'],['Lavaojos','LAV'],['Camilla','CAM']]},
  {g:'Equipos', e:'sticker', f:null, l:[
    ['Tablero eléctrico','TEL','tableros-electricos'],['Montacargas','MON','montacargas'],['Compresora','CMP'],
    ['Grupo electrógeno','GEN'],['Mezcladora','MEZ'],['Vibradora','VIB'],['Otro equipo','EQU']]}
];
var EQ_ETIQ = {
  bandera:{n:'Bandera en el cable', ic:'🔌', d:'Envuelve el cable a un palmo del enchufe y se pega sobre sí misma. Queda plana, con el QR a los dos lados.',
           imp:'Bandera para el cable: envuélvela a un palmo del enchufe y pega una mitad sobre la otra.', w:92, h:26, cols:2, filas:9},
  placa:  {n:'Placa con cintillo', ic:'🏷️', d:'Una tarjeta chica con el círculo para el cintillo o la argolla. En el arnés, nunca en las argollas de conexión.',
           imp:'Placa: pégala sobre una tarjeta de PVC o fórrala, perfora el círculo y sujétala con un cintillo.', w:30, h:52, cols:6, filas:5},
  caja:   {n:'QR en la caja o maletín', ic:'🧰', d:'Un solo QR para la caja, con la lista de lo que tiene. Cada herramienta lleva su código escrito y la cinta del mes.',
           imp:'Caja o maletín: pégala en la tapa, por fuera.', w:60, h:40, cols:3, filas:6},
  sticker:{n:'Sticker directo', ic:'🟨', d:'Solo en una cara plana y grande: extintor, escalera, equipos.',
           imp:'Sticker: en una cara plana y limpia (extintor, escalera, equipo).', w:45, h:52, cols:4, filas:5}
};
var EQ_ORDEN_ETIQ = ['bandera', 'placa', 'caja', 'sticker'];

function eqMesNombre(iso){ var M=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre'];
  var p=String(iso||'').split('-'); return M[(parseInt(p[1],10)||1)-1]||''; }
/* «cinta roja» para un color guardado (o «cinta <lo que sea>» si es otro) */
function eqCinta(k){ var c=eqColor(k); return c ? c.c : (k ? 'cinta '+String(k).toLowerCase() : ''); }
function eqColor(k){ for(var i=0;i<EQ_COLORES.length;i++) if(EQ_COLORES[i].k===String(k||'').toLowerCase()) return EQ_COLORES[i]; return null; }
function eqFecha(f){ var p=String(f||'').split('-'); return p.length===3 ? p[2]+'/'+p[1]+'/'+p[0] : ''; }
function eqEnlace(x){ return BASE_EQ + '?t=' + encodeURIComponent(x.token); }
function eqTipoDe(nombre){
  var n=String(nombre||'').toLowerCase();
  for(var g=0; g<EQ_TIPOS.length; g++) for(var i=0; i<EQ_TIPOS[g].l.length; i++){
    var t=EQ_TIPOS[g].l[i];
    if(t[0].toLowerCase()===n) return {n:t[0], p:t[1], f:(t[2]!==undefined ? t[2] : EQ_TIPOS[g].f), e:(t[3] || EQ_TIPOS[g].e), g:EQ_TIPOS[g].g};
  }
  return null;
}
function eqQR(x){ var qr=qrcode(0,'M'); qr.addData(eqEnlace(x)); qr.make(); return qr; }
function _eqRGB(h){ h=String(h||'#0B2A3A').replace('#',''); return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0]; }
function _eqColorTx(doc, h){ var c=_eqRGB(h); doc.setTextColor(c[0], c[1], c[2]); }
function _eqTexto(doc, txt, x, y, ancho, tam, negrita, color){
  doc.setFont('helvetica', negrita ? 'bold' : 'normal'); doc.setFontSize(tam); _eqColorTx(doc, color||'#0B2A3A');
  var t=String(txt||'');
  while(t.length>1 && doc.getTextWidth(t)>ancho) t=t.slice(0,-2)+'…';
  doc.text(t, x, y, {align:'center'});
}
function _eqCorte(doc, x, y, w, h){
  doc.setDrawColor(170,180,186); doc.setLineWidth(0.15);
  if(doc.setLineDashPattern) doc.setLineDashPattern([1.2, 1.2], 0);
  doc.rect(x, y, w, h);
  if(doc.setLineDashPattern) doc.setLineDashPattern([], 0);
}
function _eqUna(doc, x, eje, ey, tx){
  tx=tx||function(z){ return z; };
  var et=x.etiqueta||'placa', X=EQ_ETIQ[et], img=eqQR(x).createDataURL(8, 0);
  _eqCorte(doc, eje, ey, X.w, X.h);
  if(et==='bandera'){
    [0, 64].forEach(function(dx){
      doc.addImage(img, 'PNG', eje+dx+4.5, ey+2.2, 19, 19);
      _eqTexto(doc, x.codigo, eje+dx+14, ey+24.4, 26, 7.5, true);
    });
    doc.setDrawColor(150,160,166); doc.setLineWidth(0.2);
    if(doc.setLineDashPattern) doc.setLineDashPattern([0.8, 0.8], 0);
    doc.line(eje+28, ey, eje+28, ey+X.h); doc.line(eje+64, ey, eje+64, ey+X.h);
    if(doc.setLineDashPattern) doc.setLineDashPattern([], 0);
    _eqTexto(doc, tx('envuelve el cable aquí'), eje+46, ey+11.5, 34, 6.5, false, '#6B7C88');
    _eqTexto(doc, x.codigo+' · '+tx(x.tipo), eje+46, ey+16, 34, 6, true, '#6B7C88');
    return;
  }
  if(et==='placa'){
    doc.setDrawColor(90,100,106); doc.setLineWidth(0.25); doc.circle(eje+15, ey+5, 2.2);
    doc.addImage(img, 'PNG', eje+4, ey+10, 22, 22);
    _eqTexto(doc, x.codigo, eje+15, ey+38, 27, 9, true);
    _eqTexto(doc, tx(x.tipo), eje+15, ey+43, 27, 6.5, false);
    _eqTexto(doc, 'OBRASST', eje+15, ey+49, 27, 5, true, '#8FA9B8');
    return;
  }
  if(et==='caja'){
    doc.addImage(img, 'PNG', eje+3, ey+5, 30, 30);
    doc.setFont('helvetica','bold'); doc.setFontSize(10); _eqColorTx(doc, '#0B2A3A');
    var cx=eje+36, cw=22;
    var t=String(x.codigo); while(t.length>1 && doc.getTextWidth(t)>cw) t=t.slice(0,-2)+'…';
    doc.text(t, cx, ey+12);
    doc.setFont('helvetica','normal'); doc.setFontSize(7);
    var lin=doc.splitTextToSize(String(tx(x.tipo)||''), cw).slice(0,3); doc.text(lin, cx, ey+17);
    doc.setFontSize(5.5); _eqColorTx(doc, '#6B7C88');
    doc.text(doc.splitTextToSize(tx('Escanea para ver lo que tiene'), cw).slice(0,2), cx, ey+30);
    doc.setFont('helvetica','bold'); doc.setFontSize(5); _eqColorTx(doc, '#8FA9B8'); doc.text('OBRASST', cx, ey+37);
    return;
  }
  doc.addImage(img, 'PNG', eje+6.5, ey+4, 32, 32);
  _eqTexto(doc, x.codigo, eje+22.5, ey+42, 41, 10, true);
  _eqTexto(doc, tx(x.tipo), eje+22.5, ey+47, 41, 7, false);
  _eqTexto(doc, 'OBRASST', eje+22.5, ey+50.6, 41, 4.8, true, '#8FA9B8');
}

/* el PDF: una hoja (o más) por forma de etiqueta, a tamaño real, con la
   línea de corte, el nombre de la obra arriba y cómo pegarla abajo */
function eqArmarPDF(sel, obra, tx){
  tx=tx||function(z){ return z; };
  var doc=new jspdf.jsPDF({unit:'mm', format:'a4'}), primera=true;
  EQ_ORDEN_ETIQ.forEach(function(k){
    var l=(sel||[]).filter(function(x){ return (x.etiqueta||'placa')===k; }); if(!l.length) return;
    var X=EQ_ETIQ[k], porHoja=X.cols*X.filas;
    var gx=(190 - X.cols*X.w)/Math.max(1, X.cols-1), gy=Math.min(4, (277 - X.filas*X.h)/Math.max(1, X.filas-1));
    for(var i=0;i<l.length;i++){
      if(i%porHoja===0){
        if(!primera) doc.addPage(); primera=false;
        doc.setFont('helvetica','bold'); doc.setFontSize(7.5); _eqColorTx(doc, '#0B2A3A');
        doc.text(tx(X.n)+(obra ? ' · '+obra : ''), 10, 6.5);
        doc.setFont('helvetica','normal'); doc.setFontSize(6.5); _eqColorTx(doc, '#6B7C88');
        doc.text(doc.splitTextToSize(tx(X.imp)+' '+tx('Imprime al 100 % (tamaño real), en papel adhesivo vinil, y fórrala con cinta transparente.'), 190), 10, 291.5);
      }
      var j=i%porHoja, col=j%X.cols, fil=Math.floor(j/X.cols);
      _eqUna(doc, l[i], 10+col*(X.w+gx), 10+fil*(X.h+gy), tx);
    }
  });
  return doc;
}
function eqNombrePDF(obra){
  var o=String(obra||'obra'); try{ o=o.normalize('NFD').replace(/[\u0300-\u036f]/g,''); }catch(_n){}
  return 'etiquetas-qr-'+(o.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'obra')+'.pdf';
}
/* el siguiente código libre de un tipo: AMO-001, AMO-002… */
function eqSiguienteCodigoDe(lista, prefijo){
  var max=0, re=new RegExp('^'+prefijo+'-(\\d+)$','i');
  (lista||[]).forEach(function(x){ var m=String(x.codigo||'').match(re); if(m) max=Math.max(max, parseInt(m[1],10)||0); });
  return prefijo+'-'+('00'+(max+1)).slice(-3);
}
/* la ficha del QR (10 caracteres al azar) y el id de la fila */
function eqNuevaFicha(){
  var tk=''; for(var i=0;i<10;i++) tk+=(Math.random()*16|0).toString(16);
  try{ if(window.crypto && crypto.getRandomValues){ var a=new Uint8Array(5); crypto.getRandomValues(a); tk=Array.prototype.map.call(a, function(b){ return ('0'+b.toString(16)).slice(-2); }).join(''); } }catch(_r){}
  return tk;
}
function eqNuevoId(){
  var id=''; try{ id=(window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ''; }catch(_c){}
  return id || 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, function(){ return (Math.random()*16|0).toString(16); });
}
