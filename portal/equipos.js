/* OBRASST · lo común de los equipos y herramientas con QR, para el portal.
   Lo arma armar.py desde equipos-base.js e inspeq-base.js (los mismos de la app). No editar. */
/* ══════════════════════════════════════════════════════════════════
   EQUIPOS Y HERRAMIENTAS CON QR · LO COMÚN (01/10/2026)
   Lo mismo en la app y en el portal (armar.py lo pone en la app y arma
   portal/equipos.js con esto): los tipos con su prefijo, su formato de
   inspección y su etiqueta; las cuatro etiquetas a tamaño real (con sus
   tres diseños y sus dos tamaños, y la vista previa de la hoja A4); los
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
  /* 03/10/2026 · Marcelo: «cada ítem tendría que tener un QR: grúas, escaleras, andamios, herramientas».
     El andamio y las grúas entran con su formato de inspección; la escalera estrena el suyo. */
  {g:'Grúas', e:'sticker', f:'gruas', l:[
    ['Grúa torre','GRT'],['Grúa móvil','GRM'],['Camión grúa','CGR'],['Puente grúa','PGR'],['Otra grúa','GRU']]},
  {g:'Trabajo en altura', e:'placa', f:null, l:[
    ['Arnés','ARN'],['Línea de vida','LDV'],['Escalera','ESC','escaleras-portatiles','sticker'],['Andamio','AND','andamios','sticker']]},
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

/* ══════════════════════════════════════════════════════════════════
   LAS ETIQUETAS: UN SOLO DIBUJO PARA LA PANTALLA Y PARA EL PAPEL (05/10/2026)
   Marcelo: «que sus etiquetas que elija salgan como previsualizadas, cantidad
   en una hoja A4, sus diferentes diseños de cada etiqueta, su previsualización».
   Antes la etiqueta se dibujaba dos veces —una con jsPDF para imprimir y otra
   con cajitas de la pantalla para «verla»— y la vista previa era un parecido.
   Ahora cada etiqueta se describe UNA vez, en milímetros (eqDibujo: rectángulos,
   textos, el QR), y de ahí salen las dos cosas: el SVG que se ve (eqSVG, y la
   hoja A4 entera con eqHojasSVG) y el PDF que se imprime (eqArmarPDF). Lo que
   se ve es lo que sale.
   · Cuatro FORMAS (EQ_ETIQ), las de siempre: bandera, placa, caja y sticker.
   · Tres DISEÑOS de cada una (EQ_DISENOS): clásica; con datos (marca, modelo y
     N.° de serie); con franja («ESCANÉAME ANTES DE USAR»).
   · Dos TAMAÑOS: normal y grande (el grande, para lo que se mira de lejos: una
     grúa, un tablero, un andamio). Con el tamaño cambia cuántas entran en la A4.
   Se guarda en el equipo como texto: «», «datos», «franja», y «:g» si es grande.
   ══════════════════════════════════════════════════════════════════ */
var EQ_DISENOS = [
  {k:'',       n:'Clásica',    d:'El QR, el código y qué es.'},
  {k:'datos',  n:'Con datos',  d:'Además, su marca, su modelo y su N.° de serie.'},
  {k:'franja', n:'Con franja', d:'Con una franja que dice «Escanéame antes de usar».'}
];
/* cuánto crece cada forma en «grande» */
var EQ_GRANDE = { bandera:1.25, placa:1.4, caja:1.5, sticker:2 };
function eqDisenoDe(k){ for(var i=0;i<EQ_DISENOS.length;i++) if(EQ_DISENOS[i].k===String(k||'')) return EQ_DISENOS[i]; return EQ_DISENOS[0]; }
/* el diseño y el tamaño de un equipo; op.dis / op.tam mandan si vienen («para esta impresión») */
function eqDis(x, op){
  var p=String((x && x.diseno) || '').split(':'), d=p[0] || '', g=(p[1]==='g');
  if(op && typeof op.dis==='string' && op.dis!=='*') d=op.dis;
  if(op && (op.tam==='n' || op.tam==='g')) g=(op.tam==='g');
  return { d:eqDisenoDe(d).k, g:g };
}
function eqDisTxt(d, g){ var t=eqDisenoDe(d).k + (g ? ':g' : ''); return t || null; }
/* marca + modelo + serie, en una frase (es lo que siempre se llamó «detalle») */
function eqDetalleDe(marca, modelo, serie){
  var a=[String(marca||'').trim(), String(modelo||'').trim()].filter(Boolean).join(' '), s=String(serie||'').trim();
  return [a, s ? 'Serie '+s : ''].filter(Boolean).join(' · ').slice(0, 200);
}
/* lo que mide una etiqueta y cómo se reparte en la hoja A4 (área útil 190 × 277 mm) */
function eqMedida(et, grande){
  var X=EQ_ETIQ[et] || EQ_ETIQ.placa, s=grande ? (EQ_GRANDE[et] || 1) : 1, w=X.w*s, h=X.h*s;
  var cols=Math.max(1, Math.floor(192/(w+2))), filas=Math.max(1, Math.floor(279/(h+2)));
  var gx=cols>1 ? Math.min(10, (190-cols*w)/(cols-1)) : 0, gy=filas>1 ? Math.min(4, (277-filas*h)/(filas-1)) : 0;
  return { w:w, h:h, s:s, cols:cols, filas:filas, porHoja:cols*filas, gx:gx, gy:gy, x0:(210-(cols*w+(cols-1)*gx))/2, y0:10 };
}
/* el ancho de un texto en mm, con la letra del PDF (helvetica): con jsPDF si ya está, o con el lienzo */
var _EQ_MED=null;
function eqAncho(t, tam, negrita){
  t=String(t||''); if(!t) return 0;
  try{
    if(typeof jspdf!=='undefined' && jspdf.jsPDF){
      if(!_EQ_MED || !_EQ_MED.doc) _EQ_MED={ doc:new jspdf.jsPDF({unit:'mm', format:'a4'}) };
      _EQ_MED.doc.setFont('helvetica', negrita ? 'bold' : 'normal'); _EQ_MED.doc.setFontSize(tam);
      return _EQ_MED.doc.getTextWidth(t);
    }
  }catch(_j){}
  try{
    if(!_EQ_MED || !_EQ_MED.cx) _EQ_MED={ cx:document.createElement('canvas').getContext('2d') };
    _EQ_MED.cx.font=(negrita ? 'bold ' : '')+'100px Helvetica, Arial, sans-serif';
    return _EQ_MED.cx.measureText(t).width/100*tam*0.352778;
  }catch(_c){}
  return t.length*tam*0.352778*(negrita ? 0.58 : 0.52);
}
function _eqCorta(t, tam, negrita, max){
  t=String(t||'');
  if(!max || eqAncho(t, tam, negrita)<=max) return t;
  while(t.length>1 && eqAncho(t+'…', tam, negrita)>max) t=t.slice(0, -1);
  return t.replace(/\s+$/, '')+'…';
}
function _eqParte(t, tam, negrita, max, lineas){
  var pal=String(t||'').split(/\s+/).filter(Boolean), out=[], cur='';
  pal.forEach(function(w){
    var p=cur ? cur+' '+w : w;
    if(cur && eqAncho(p, tam, negrita)>max){ out.push(cur); cur=w; } else cur=p;
  });
  if(cur) out.push(cur);
  if(out.length>lineas){ out=out.slice(0, lineas); out[lineas-1]=_eqCorta(out[lineas-1]+' …', tam, negrita, max); }
  return out.map(function(l){ return _eqCorta(l, tam, negrita, max); });
}
/* LA ETIQUETA, DESCRITA: { et, w, h (mm), ops:[…] }
   op: r rectángulo {x,y,w,h, f relleno, s trazo, sw, raya:[a,b], rr radio} · c círculo {x,y,r, s, sw} ·
       l línea {x,y,x2,y2, s, sw, raya} · t texto {x,y, tx, tam (pt), b, c color, al l|c} · q el QR {x,y,w} */
function eqDibujo(x, op){
  op=op||{};
  var tx=op.tx || function(z){ return z; };
  var D=eqDis(x, op), et=EQ_ETIQ[x.etiqueta] ? x.etiqueta : 'placa', M=eqMedida(et, D.g), s=M.s, o=[];
  var AZ='#0B2A3A', GR='#6B7C88', CL='#8FA9B8', AM='#F5B700';
  function R(x0, y0, w, h, p){ p=p||{}; o.push({t:'r', x:x0*s, y:y0*s, w:w*s, h:h*s, f:p.f||null, s:p.s||null, sw:(p.sw||0)*Math.sqrt(s), raya:p.raya||null}); }
  function C(x0, y0, r){ o.push({t:'c', x:x0*s, y:y0*s, r:r*s, s:'#5A646A', sw:0.25*Math.sqrt(s)}); }
  function L(x1, y1, x2, y2){ o.push({t:'l', x:x1*s, y:y1*s, x2:x2*s, y2:y2*s, s:'#96A0A6', sw:0.2, raya:[0.8, 0.8]}); }
  function Q(x0, y0, w){ o.push({t:'q', x:x0*s, y:y0*s, w:w*s}); }
  /* p: {b negrita, c color, al l|c, max ancho en mm (sin escalar)} */
  function T(str, x0, y0, tam, p){
    p=p||{}; str=String(str||''); if(!str) return;
    var ta=tam*s, t2=_eqCorta(str, ta, !!p.b, p.max ? p.max*s : 0);
    o.push({t:'t', x:x0*s, y:y0*s, tx:t2, tam:ta, b:!!p.b, c:p.c||AZ, al:p.al||'c'});
  }
  function TT(str, x0, y0, tam, p, lineas, salto){
    p=p||{};
    _eqParte(str, tam*s, !!p.b, (p.max||20)*s, lineas).forEach(function(l, i){ T(l, x0, y0+i*salto, tam, {b:p.b, c:p.c, al:p.al}); });
  }
  var cod=String(x.codigo||''), tipo=String(tx(x.tipo||'')||''), obrasst='OBRASST';
  var mm=[String(x.marca||'').trim(), String(x.modelo||'').trim()].filter(Boolean).join(' '), ser=String(x.serie||'').trim() ? tx('Serie')+' '+String(x.serie).trim() : '';
  /* el equipo de antes, que solo tiene «detalle»: va entero donde iría la marca */
  if(!mm && !ser && x.detalle) mm=String(x.detalle).trim();
  var datos=[mm, ser].filter(Boolean);
  var W0=EQ_ETIQ[et].w, H0=EQ_ETIQ[et].h;
  if(et==='bandera'){
    [0, 64].forEach(function(dx){
      if(D.d==='franja'){
        R(dx, 0, 28, 4.6, {f:AZ}); T(tx('ESCANÉAME'), dx+14, 3.3, 5.2, {b:1, c:AM, max:25});
        Q(dx+5.6, 5.5, 16.8); T(cod, dx+14, 24.9, 6.8, {b:1, max:26});
      } else if(D.d==='datos'){
        Q(dx+5.5, 1.6, 17); T(cod, dx+14, 21.5, 7.2, {b:1, max:26}); T(mm || tipo, dx+14, 24.6, 4.8, {c:GR, max:26});
      } else {
        Q(dx+4.5, 2.2, 19); T(cod, dx+14, 24.4, 7.5, {b:1, max:26});
      }
    });
    L(28, 0, 28, H0); L(64, 0, 64, H0);
    if(D.d==='datos' && datos.length){
      T(tx('envuelve el cable aquí'), 46, 8.2, 6.2, {c:GR, max:34}); T(cod+' · '+tipo, 46, 12.4, 6, {b:1, c:GR, max:34});
      datos.forEach(function(l, i){ T(l, 46, 16.6+i*3.4, 5.2, {c:GR, max:34}); });
    } else {
      T(tx('envuelve el cable aquí'), 46, 11.5, 6.5, {c:GR, max:34}); T(cod+' · '+tipo, 46, 16, 6, {b:1, c:GR, max:34});
    }
  } else if(et==='placa'){
    C(15, 5, 2.2);
    if(D.d==='franja'){
      Q(4, 9.4, 22); T(cod, 15, 36.6, 9, {b:1, max:27}); T(tipo, 15, 40.9, 6.2, {max:27});
      R(0, 44.4, 30, 7.6, {f:AZ}); T(tx('ESCANÉAME'), 15, 47.7, 5.2, {b:1, c:AM, max:27}); T(tx('ANTES DE USAR'), 15, 50.4, 4.4, {b:1, c:AM, max:27});
    } else if(D.d==='datos'){
      Q(5, 9.2, 20); T(cod, 15, 33.7, 8.6, {b:1, max:27}); T(tipo, 15, 37.5, 6, {max:27});
      datos.forEach(function(l, i){ T(l, 15, 41.5+i*3, 5.2, {c:GR, max:27}); });
      T(obrasst, 15, 49.7, 4.6, {b:1, c:CL});
    } else {
      Q(4, 10, 22); T(cod, 15, 38, 9, {b:1, max:27}); T(tipo, 15, 43, 6.5, {max:27}); T(obrasst, 15, 49, 5, {b:1, c:CL});
    }
  } else if(et==='caja'){
    if(D.d==='franja'){
      R(0, 0, 60, 6.6, {f:AZ}); T(tx('ESCANÉAME: AQUÍ ESTÁ LO QUE TIENE'), 30, 4.3, 5.2, {b:1, c:AM, max:56});
      Q(3, 9, 28); T(cod, 34.5, 16.5, 10, {b:1, al:'l', max:23.5}); TT(tipo, 34.5, 21.5, 7, {al:'l', max:23.5}, 3, 2.84);
      T(obrasst, 34.5, 37, 5, {b:1, c:CL, al:'l'});
    } else if(D.d==='datos'){
      Q(3, 5, 30); T(cod, 36, 10.5, 10, {b:1, al:'l', max:22}); TT(tipo, 36, 15, 7, {al:'l', max:22}, 2, 2.84);
      datos.forEach(function(l, i){ T(l, 36, 22.8+i*3, 5.4, {c:GR, al:'l', max:22}); });
      TT(tx('Escanea para ver lo que tiene'), 36, 31, 5.5, {c:GR, al:'l', max:22}, 2, 2.23);
      T(obrasst, 36, 37.4, 5, {b:1, c:CL, al:'l'});
    } else {
      Q(3, 5, 30); T(cod, 36, 12, 10, {b:1, al:'l', max:22}); TT(tipo, 36, 17, 7, {al:'l', max:22}, 3, 2.84);
      TT(tx('Escanea para ver lo que tiene'), 36, 30, 5.5, {c:GR, al:'l', max:22}, 2, 2.23);
      T(obrasst, 36, 37, 5, {b:1, c:CL, al:'l'});
    }
  } else {
    if(D.d==='franja'){
      R(0, 0, 45, 7.2, {f:AZ}); T(tx('ESCANÉAME ANTES DE USAR'), 22.5, 4.7, 5.4, {b:1, c:AM, max:41});
      Q(7.5, 9.2, 30); T(cod, 22.5, 44.4, 10, {b:1, max:41}); T(tipo, 22.5, 48.6, 6.6, {max:41});
    } else if(D.d==='datos'){
      Q(9.5, 3, 26); T(cod, 22.5, 34.6, 10, {b:1, max:41}); T(tipo, 22.5, 38.8, 6.5, {max:41});
      datos.forEach(function(l, i){ T(l, 22.5, (datos.length===1 ? 43.6 : 42.6)+i*3.2, 5.8, {c:GR, max:41}); });
      T(obrasst, 22.5, 50.6, 4.8, {b:1, c:CL});
    } else {
      Q(6.5, 4, 32); T(cod, 22.5, 42, 10, {b:1, max:41}); T(tipo, 22.5, 47, 7, {max:41}); T(obrasst, 22.5, 50.6, 4.8, {b:1, c:CL});
    }
  }
  /* la línea de corte va al final, encima de la franja */
  o.push({t:'r', x:0, y:0, w:M.w, h:M.h, f:null, s:'#AAB4BA', sw:0.15, raya:[1.2, 1.2]});
  return { et:et, dis:D.d, g:D.g, w:M.w, h:M.h, ops:o };
}

/* ── en la pantalla: el SVG (1 mm = 10 unidades, para que la letra chica no se deforme) ── */
function _eqEsc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function _eqQRdato(x, celda){ try{ return eqQR(x).createDataURL(celda||2, 0); }catch(_q){ return ''; } }
function _eqSVGops(D, x, ox, oy){
  var K=10, h='', img=null;
  D.ops.forEach(function(p){
    if(p.t==='r') h+='<rect x="'+((ox+p.x)*K).toFixed(1)+'" y="'+((oy+p.y)*K).toFixed(1)+'" width="'+(p.w*K).toFixed(1)+'" height="'+(p.h*K).toFixed(1)+'" fill="'+(p.f||'none')+'"'+
      (p.s ? ' stroke="'+p.s+'" stroke-width="'+(p.sw*K).toFixed(1)+'"'+(p.raya ? ' stroke-dasharray="'+p.raya[0]*K+' '+p.raya[1]*K+'"' : '') : '')+'/>';
    else if(p.t==='c') h+='<circle cx="'+((ox+p.x)*K).toFixed(1)+'" cy="'+((oy+p.y)*K).toFixed(1)+'" r="'+(p.r*K).toFixed(1)+'" fill="none" stroke="'+p.s+'" stroke-width="'+(p.sw*K).toFixed(1)+'"/>';
    else if(p.t==='l') h+='<line x1="'+((ox+p.x)*K).toFixed(1)+'" y1="'+((oy+p.y)*K).toFixed(1)+'" x2="'+((ox+p.x2)*K).toFixed(1)+'" y2="'+((oy+p.y2)*K).toFixed(1)+'" stroke="'+p.s+'" stroke-width="'+(p.sw*K).toFixed(1)+'" stroke-dasharray="'+p.raya[0]*K+' '+p.raya[1]*K+'"/>';
    else if(p.t==='q'){ if(img===null) img=_eqQRdato(x, 2); if(img) h+='<image href="'+img+'" x="'+((ox+p.x)*K).toFixed(1)+'" y="'+((oy+p.y)*K).toFixed(1)+'" width="'+(p.w*K).toFixed(1)+'" height="'+(p.w*K).toFixed(1)+'" preserveAspectRatio="none" style="image-rendering:pixelated"/>'; }
    else if(p.t==='t'){
      var an=eqAncho(p.tx, p.tam, p.b);
      h+='<text x="'+((ox+p.x)*K).toFixed(1)+'" y="'+((oy+p.y)*K).toFixed(1)+'" font-size="'+(p.tam*0.352778*K).toFixed(2)+'"'+(p.b ? ' font-weight="700"' : '')+' fill="'+p.c+'"'+
         (p.al==='l' ? '' : ' text-anchor="middle"')+(an>0 ? ' textLength="'+(an*K).toFixed(1)+'" lengthAdjust="spacingAndGlyphs"' : '')+'>'+_eqEsc(p.tx)+'</text>';
    }
  });
  return h;
}
/* una etiqueta sola, sobre blanco (op: {tx, dis, tam}) */
function eqSVG(x, op){
  var D=eqDibujo(x, op);
  return '<svg xmlns="http://www.w3.org/2000/svg" class="eq-svg" viewBox="-5 -5 '+(D.w*10+10)+' '+(D.h*10+10)+'" role="img" aria-label="'+_eqEsc((EQ_ETIQ[D.et]||{}).n||'')+'" '+
         ((op && op.px) ? 'width="'+Math.round((D.w+1)*op.px)+'" height="'+Math.round((D.h+1)*op.px)+'" ' : '')+
         'style="font-family:Helvetica,Arial,sans-serif'+((op && op.px) ? ';max-width:100%;height:auto' : '')+'" data-et="'+D.et+'" data-dis="'+D.dis+'" data-g="'+(D.g?1:0)+'" data-w="'+D.w+'" data-h="'+D.h+'">'+
         '<rect x="0" y="0" width="'+D.w*10+'" height="'+D.h*10+'" fill="#fff"/>'+_eqSVGops(D, x, 0, 0)+'</svg>';
}
/* cómo se reparten en hojas: una tanda por forma y tamaño (los diseños de una misma medida comparten hoja).
   Devuelve [{et, g, M, titulo, pie, items:[…]}], una por HOJA. */
function eqHojas(sel, obra, op){
  op=op||{};
  var tx=op.tx || function(z){ return z; }, hojas=[];
  EQ_ORDEN_ETIQ.forEach(function(k){
    [false, true].forEach(function(g){
      var l=(sel||[]).filter(function(x){ return (EQ_ETIQ[x.etiqueta] ? x.etiqueta : 'placa')===k && eqDis(x, op).g===g; }); if(!l.length) return;
      var X=EQ_ETIQ[k], M=eqMedida(k, g);
      for(var i=0;i<l.length;i+=M.porHoja){
        hojas.push({ et:k, g:g, M:M, titulo:tx(X.n)+(g ? ' · '+tx('grande') : '')+(obra ? ' · '+obra : ''),
                     pie:tx(X.imp)+' '+tx('Imprime al 100 % (tamaño real), en papel adhesivo vinil, y fórrala con cinta transparente.'), items:l.slice(i, i+M.porHoja) });
      }
    });
  });
  return hojas;
}
function _eqSitio(M, j){ var col=j%M.cols, fil=Math.floor(j/M.cols); return { x:M.x0+col*(M.w+M.gx), y:M.y0+fil*(M.h+M.gy) }; }
/* las hojas A4, para verlas antes de imprimir: un SVG por hoja (hasta «max», a partir de la hoja «desde») */
function eqHojasSVG(sel, obra, op){
  op=op||{};
  var H=eqHojas(sel, obra, op), max=op.max || 3, d=Math.max(0, Math.min(parseInt(op.desde, 10) || 0, Math.max(0, H.length-1)));
  return { total:H.length, hojas:H, desde:d, svg:H.slice(d, d+max).map(function(hj){
    var h='<svg xmlns="http://www.w3.org/2000/svg" class="eq-hoja" viewBox="0 0 2100 2970" role="img" aria-label="'+_eqEsc(hj.titulo)+'" style="font-family:Helvetica,Arial,sans-serif" '+
          'data-et="'+hj.et+'" data-g="'+(hj.g?1:0)+'" data-n="'+hj.items.length+'" data-por="'+hj.M.porHoja+'">'+
          '<rect x="0" y="0" width="2100" height="2970" fill="#fff"/>'+
          '<text x="100" y="65" font-size="26.5" font-weight="700" fill="#0B2A3A">'+_eqEsc(_eqCorta(hj.titulo, 7.5, true, 190))+'</text>';
    hj.items.forEach(function(x, j){ var p=_eqSitio(hj.M, j); h+=_eqSVGops(eqDibujo(x, op), x, p.x, p.y); });
    _eqParte(hj.pie, 6.5, false, 190, 2).forEach(function(l, i){ h+='<text x="100" y="'+(2915+i*26)+'" font-size="22.9" fill="#6B7C88">'+_eqEsc(l)+'</text>'; });
    return h+'</svg>';
  }) };
}

/* ── en el papel: el PDF, con el MISMO dibujo ── */
function _eqRGB(h){ h=String(h||'#0B2A3A').replace('#',''); return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0]; }
function _eqColorTx(doc, h){ var c=_eqRGB(h); doc.setTextColor(c[0], c[1], c[2]); }
function _eqPDFops(doc, D, x, ox, oy){
  var img=null;
  D.ops.forEach(function(p){
    var c;
    if(p.t==='r'){
      if(p.f){ c=_eqRGB(p.f); doc.setFillColor(c[0], c[1], c[2]); doc.rect(ox+p.x, oy+p.y, p.w, p.h, 'F'); }
      if(p.s){
        c=_eqRGB(p.s); doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(p.sw);
        if(p.raya && doc.setLineDashPattern) doc.setLineDashPattern(p.raya, 0);
        doc.rect(ox+p.x, oy+p.y, p.w, p.h);
        if(p.raya && doc.setLineDashPattern) doc.setLineDashPattern([], 0);
      }
    } else if(p.t==='c'){
      c=_eqRGB(p.s); doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(p.sw); doc.circle(ox+p.x, oy+p.y, p.r);
    } else if(p.t==='l'){
      c=_eqRGB(p.s); doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(p.sw);
      if(doc.setLineDashPattern) doc.setLineDashPattern(p.raya, 0);
      doc.line(ox+p.x, oy+p.y, ox+p.x2, oy+p.y2);
      if(doc.setLineDashPattern) doc.setLineDashPattern([], 0);
    } else if(p.t==='q'){
      if(img===null) img=_eqQRdato(x, 8);
      if(img) doc.addImage(img, 'PNG', ox+p.x, oy+p.y, p.w, p.w);
    } else if(p.t==='t'){
      doc.setFont('helvetica', p.b ? 'bold' : 'normal'); doc.setFontSize(p.tam); _eqColorTx(doc, p.c);
      doc.text(p.tx, ox+p.x, oy+p.y, p.al==='l' ? undefined : {align:'center'});
    }
  });
}
/* el PDF: una hoja (o más) por forma y tamaño, a tamaño real, con la línea de corte, el nombre de la
   obra arriba y cómo pegarla abajo. op: {dis, tam} = «para esta impresión» (si no, lo de cada equipo) */
function eqArmarPDF(sel, obra, tx, op){
  op=Object.assign({}, op||{}); if(tx) op.tx=tx;
  var doc=new jspdf.jsPDF({unit:'mm', format:'a4'});
  eqHojas(sel, obra, op).forEach(function(hj, n){
    if(n) doc.addPage();
    doc.setFont('helvetica','bold'); doc.setFontSize(7.5); _eqColorTx(doc, '#0B2A3A');
    doc.text(_eqCorta(hj.titulo, 7.5, true, 190), 10, 6.5);
    doc.setFont('helvetica','normal'); doc.setFontSize(6.5); _eqColorTx(doc, '#6B7C88');
    doc.text(_eqParte(hj.pie, 6.5, false, 190, 2), 10, 291.5);
    hj.items.forEach(function(x, j){ var p=_eqSitio(hj.M, j); _eqPDFops(doc, eqDibujo(x, op), x, p.x, p.y); });
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
;
/* ══════════════════════════════════════════════════════════════════
   LA INSPECCIÓN DIARIA DE CADA EQUIPO · LO COMÚN (03/10/2026)
   Lo mismo en la app y en el portal (armar.py lo pone en la app y lo
   suma a portal/equipos.js): cómo se llama cada resultado, qué firmas
   faltan, el PDF de una inspección (con sus fotos y sus tres firmas) y
   el Excel del mes (qué equipo se inspeccionó cada día).
   Sin nada de la pantalla: el PDF necesita jsPDF y el Excel RCAP.xlsx,
   y los dos se piden recién al armarse. Las firmas van al PDF como
   trazo (líneas), no como imagen.
   ══════════════════════════════════════════════════════════════════ */
var IQB = (function(){
  'use strict';
  var RES = {
    conforme:  { n:'Conforme', c:'ok',  ic:'✅', rgb:[18,122,71] },
    observado: { n:'Con observación', c:'med', ic:'⚠️', rgb:[178,116,10] },
    no_apto:   { n:'No apto', c:'mal', ic:'⛔', rgb:[183,47,43] }
  };
  var ROL = { op:'Inspeccionó', prod:'Producción', sst:'SST' };
  function res(r){ return RES[(r && r.resultado) || r] || RES.conforme; }
  /* las firmas que faltan: ['prod', 'sst'] */
  function faltan(r){
    var f = [];
    if(!r) return f;
    if(!(r.prod || r.pn)) f.push('prod');
    if(!(r.sst || r.sn)) f.push('sst');
    return f;
  }
  function completa(r){ return !faltan(r).length; }
  function faltanTxt(r){
    var f = faltan(r);
    if(!f.length) return 'Con sus tres firmas';
    return f.length === 2 ? 'Faltan las firmas de Producción y de SST' : 'Falta la firma de ' + (f[0] === 'prod' ? 'Producción' : 'SST');
  }
  function dma(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
  function horaDe(iso){
    try{ var d = new Date(iso); if(isNaN(d)) return ''; return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }catch(_e){ return ''; }
  }
  /* cuántos C, NC y NA */
  function cuenta(r){
    var o = { C:0, NC:0, NA:0, n:0 };
    ((r && r.puntos) || []).forEach(function(p){ if(o[p.e] !== undefined) o[p.e]++; o.n++; });
    return o;
  }
  /* ¿se inspecciona todos los días? Los de formato diario (grúas, escaleras, andamios, montacargas)
     y los que tienen checklist propio. Los demás siguen con su revisión del mes. */
  var DIARIOS = { gruas:1, 'escaleras-portatiles':1, andamios:1, montacargas:1 };
  function esDiario(x){
    if(!x) return false;
    if(Array.isArray(x.checklist) && x.checklist.length) return true;
    var T = null; try{ T = (typeof eqTipoDe === 'function') ? eqTipoDe(x.tipo) : null; }catch(_t){ T = null; }
    return !!(T && T.f && DIARIOS[T.f]);
  }
  /* el checklist propio de un equipo, como se guarda: null (usa el de su tipo) o de 1 a 80 puntos limpios */
  function limpiarChecklist(l){
    var o = (Array.isArray(l) ? l : String(l || '').split(/\n/)).map(function(s){ return String(s || '').replace(/\s+/g, ' ').trim().slice(0, 300); })
              .filter(function(s){ return s.length >= 2; }).slice(0, 80);
    return o.length ? o : null;
  }
  /* todas las fotos de una inspección: las del que inspeccionó y las de SST */
  function fotosDe(r){
    var l = [];
    ((r && r.fotos) || []).forEach(function(u){ if(u) l.push({ u:u, de:'op' }); });
    (((r && r.sst) || {}).fotos || []).forEach(function(u){ if(u) l.push({ u:u, de:'sst' }); });
    return l;
  }

  /* ── las fotos, a datos (para el PDF): { url: {du, w, h} } ───────── */
  function cargarFotos(urls, lado){
    lado = lado || 1000;
    var out = {};
    return Promise.all((urls || []).map(function(u){
      if(!u || out[u]) return null;
      return new Promise(function(ok){
        var hecho = false, fin = function(v){ if(hecho) return; hecho = true; if(v) out[u] = v; ok(); };
        setTimeout(function(){ fin(null); }, 15000);
        var pinta = function(src, libre){
          var im = new Image();
          if(!/^data:/.test(src) && !/^blob:/.test(src)) im.crossOrigin = 'anonymous';
          im.onload = function(){
            try{
              var k = Math.min(1, lado / Math.max(im.naturalWidth || 1, im.naturalHeight || 1));
              var w = Math.max(1, Math.round((im.naturalWidth || 1) * k)), h = Math.max(1, Math.round((im.naturalHeight || 1) * k));
              var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
              var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h);
              fin({ du:cv.toDataURL('image/jpeg', 0.8), w:w, h:h });
            }catch(_e){ fin(null); }
            if(libre){ try{ URL.revokeObjectURL(src); }catch(_r){} }
          };
          im.onerror = function(){ fin(null); };
          im.src = src;
        };
        if(/^data:/.test(u)){ pinta(u, false); return; }
        fetch(u).then(function(r){ return r.ok ? r.blob() : Promise.reject(r.status); })
          .then(function(b){ pinta(URL.createObjectURL(b), true); }, function(){ pinta(u, false); });
      });
    })).then(function(){ return out; });
  }

  /* una firma en el PDF: el trazo como línea de verdad (nítida al imprimir, y no pesa como una foto) */
  function firmaPDF(doc, tr, x, y, w, h){
    if(!tr || !tr.p || !tr.p.length) return;
    var th = tr.h || 380, k = Math.min(w / 1000, h / th), ox = x + (w - 1000 * k) / 2, oy = y + (h - th * k) / 2;
    doc.setDrawColor(16, 24, 32); doc.setLineWidth(0.9);
    try{ doc.setLineCap('round'); doc.setLineJoin('round'); }catch(_c){}
    tr.p.forEach(function(s){
      for(var i = 2; i + 1 < s.length; i += 2) doc.line(ox + s[i - 2] * k, oy + s[i - 1] * k, ox + s[i] * k, oy + s[i + 1] * k);
    });
    try{ doc.setLineCap('butt'); doc.setLineJoin('miter'); }catch(_d){}
  }

  /* ── el PDF de una inspección ───────────────────────────────────────
     r: la fila entera · C: {obra, eq:{codigo,tipo,detalle}, fotos:{url:{du,w,h}}, sello:[…], tx(texto), base} */
  function pdf(r, C){
    C = C || {};
    var tx = C.tx || function(z){ return z; };
    var doc = new jspdf.jsPDF({ unit:'pt', format:'a4' });
    var W = 595.28, H = 841.89, M = 38, y = 0, eq = C.eq || {};
    var R = res(r), cu = cuenta(r);
    function pie(){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(140, 146, 152);
      /* la fecha de la obra, no la de Greenwich: de 7 pm a medianoche (hora de Lima) toISOString ya dice «mañana» */
      var hoyD = new Date(), hoyL = hoyD.getFullYear() + '-' + ('0' + (hoyD.getMonth() + 1)).slice(-2) + '-' + ('0' + hoyD.getDate()).slice(-2);
      doc.text(tx('Generado con OBRASST el') + ' ' + dma(hoyL) + ' · ' +
               tx('La app deja constancia de quién dijo ser, a qué hora firmó y desde dónde.'), M, H - 22);
    }
    function salto(alto){ if(y + alto > H - 50){ pie(); doc.addPage(); y = 50; return true; } return false; }
    /* cabecera */
    doc.setFillColor(11, 42, 58); doc.rect(0, 0, W, 92, 'F');
    doc.setTextColor(245, 183, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('OBRASST · ' + tx('INSPECCIÓN DIARIA DE EQUIPO'), M, 30);
    if(C.sello && C.sello.length){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(190, 205, 215);
      doc.text(C.sello.join('   ·   '), W - M, 30, { align:'right' });
    }
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text(doc.splitTextToSize(String(tx(r.formato_n || 'Inspección del equipo')), W - 2 * M)[0], M, 57);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(200, 215, 225);
    doc.text([C.obra || '', dma(r.fecha) + (r.hora ? ' ' + r.hora : ''), C.base || ''].filter(Boolean).join('   ·   ').slice(0, 130), M, 75);
    y = 116;
    /* el equipo y el resultado */
    doc.setDrawColor(215, 222, 228); doc.setLineWidth(0.8); doc.roundedRect(M, y - 14, W - 2 * M, 62, 6, 6, 'S');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(11, 42, 58);
    doc.text(String(eq.codigo || ''), M + 12, y + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(50, 60, 68);
    doc.text(doc.splitTextToSize([tx(eq.tipo || ''), eq.detalle || ''].filter(Boolean).join(' · '), W - 2 * M - 190)[0] || '', M + 12, y + 25);
    doc.setFontSize(8.5); doc.setTextColor(110, 120, 128);
    doc.text(cu.C + ' C   ·   ' + cu.NC + ' NC   ·   ' + cu.NA + ' NA', M + 12, y + 39);
    doc.setFillColor(R.rgb[0], R.rgb[1], R.rgb[2]); doc.roundedRect(W - M - 168, y - 4, 156, 26, 5, 5, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
    doc.text(String(tx(r.resultado === 'no_apto' ? 'NO APTO · FUERA DE SERVICIO' : (r.resultado === 'observado' ? 'CON OBSERVACIÓN' : 'CONFORME'))), W - M - 90, y + 13, { align:'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110, 120, 128);
    doc.text(String(tx(completa(r) ? 'Con sus tres firmas' : faltanTxt(r))), W - M - 90, y + 36, { align:'center' });
    y += 70;
    /* el checklist */
    var bloque = null, n = 0;
    (r.puntos || []).forEach(function(p){
      if((p.b || '') !== bloque){
        bloque = p.b || '';
        if(bloque){
          salto(30); y += 8;
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(11, 42, 58);
          doc.text(String(tx(bloque)).toUpperCase(), M, y); y += 12;
        }
      }
      n++;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      var t = doc.splitTextToSize(n + '. ' + tx(p.t), W - 2 * M - 46);
      var ob = p.o ? doc.splitTextToSize(String(p.o), W - 2 * M - 60) : [];
      salto(t.length * 11 + ob.length * 10 + 9);
      doc.setTextColor(40, 46, 52); doc.text(t, M, y + 8);
      if(p.e === 'C') doc.setTextColor(18, 122, 71); else if(p.e === 'NC') doc.setTextColor(183, 47, 43); else doc.setTextColor(140, 146, 152);
      doc.setFont('helvetica', 'bold'); doc.text(String(p.e || ''), W - M, y + 8, { align:'right' });
      y += t.length * 11;
      if(ob.length){
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(183, 47, 43);
        doc.text(ob, M + 12, y + 8); y += ob.length * 10;
      }
      y += 5; doc.setDrawColor(232, 236, 240); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 3;
    });
    if(r.nota){
      var nt = doc.splitTextToSize(String(r.nota), W - 2 * M);
      salto(nt.length * 11 + 26); y += 10;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(11, 42, 58); doc.text(String(tx('NOTA')), M, y); y += 12;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40, 46, 52); doc.text(nt, M, y); y += nt.length * 11;
    }
    /* las fotos: de dos en dos */
    var F = fotosDe(r).filter(function(f){ return C.fotos && C.fotos[f.u]; });
    var total = fotosDe(r).length;
    if(total){
      salto(46); y += 14;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(11, 42, 58);
      doc.text(String(tx('REGISTRO FOTOGRÁFICO')) + ' · ' + total, M, y); y += 10;
      if(F.length < total){
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140, 146, 152);
        doc.text(String(tx('Algunas fotos no se pudieron traer al armar este PDF: están en la app.')), M, y + 8); y += 14;
      }
      var cw = (W - 2 * M - 12) / 2, ch = cw * 0.75;
      F.forEach(function(f, i){
        var col = i % 2;
        if(col === 0){ if(salto(ch + 26)){ /* página nueva */ } }
        var im = C.fotos[f.u], k = Math.min(cw / im.w, ch / im.h), w = im.w * k, h = im.h * k;
        var x = M + col * (cw + 12);
        doc.setFillColor(244, 246, 248); doc.rect(x, y, cw, ch, 'F');
        try{ doc.addImage(im.du, 'JPEG', x + (cw - w) / 2, y + (ch - h) / 2, w, h); }catch(_e){}
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(110, 120, 128);
        doc.text(String(tx('Foto') + ' ' + (i + 1) + ' · ' + tx(f.de === 'sst' ? 'de SST' : 'de quien inspeccionó')), x, y + ch + 10);
        if(col === 1 || i === F.length - 1) y += ch + 20;
      });
    }
    /* las tres firmas */
    salto(158); y += 16;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(11, 42, 58); doc.text(String(tx('FIRMAS')), M, y); y += 8;
    var fw = (W - 2 * M - 20) / 3, fh = 116;
    var cajas = [
      { t:'Inspeccionó', n:r.op_nombre, c:r.op_cargo, f:r.op_firma, cuando:(dma(r.fecha) + (r.hora ? ' ' + r.hora : '')), como:(r.origen === 'gestor' ? 'cuenta' : 'trab') },
      { t:'Producción', n:(r.prod || {}).n, c:(r.prod || {}).c, f:(r.prod || {}).f, cuando:(r.prod && r.prod.t ? dma(r.prod.t) + ' ' + horaDe(r.prod.t) : ''), como:(r.prod || {}).como },
      { t:'Seguridad (SST)', n:(r.sst || {}).n, c:(r.sst || {}).c, f:(r.sst || {}).f, cuando:(r.sst && r.sst.t ? dma(r.sst.t) + ' ' + horaDe(r.sst.t) : ''), como:(r.sst || {}).como }
    ];
    cajas.forEach(function(k, i){
      var x = M + i * (fw + 10);
      doc.setDrawColor(200, 208, 214); doc.setLineWidth(0.7); doc.roundedRect(x, y, fw, fh, 5, 5, 'S');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(110, 120, 128);
      doc.text(String(tx(k.t)).toUpperCase(), x + 8, y + 13);
      if(k.f && k.f.p){
        try{ firmaPDF(doc, k.f, x + 14, y + 19, fw - 28, 45); }catch(_f){}
        doc.setDrawColor(170, 178, 184); doc.setLineWidth(0.5); doc.line(x + 10, y + 68, x + fw - 10, y + 68);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(30, 36, 42);
        doc.text(doc.splitTextToSize(String(k.n || ''), fw - 16)[0] || '', x + fw / 2, y + 79, { align:'center' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(90, 100, 108);
        doc.text(doc.splitTextToSize(String(k.c || ''), fw - 16)[0] || '', x + fw / 2, y + 89, { align:'center' });
        doc.setFontSize(6.8); doc.setTextColor(140, 146, 152);
        doc.text(String(k.cuando || ''), x + fw / 2, y + 99, { align:'center' });
        var como = k.como === 'cuenta' ? 'con su cuenta' : (k.como === 'aqui' ? 'en el celular de quien inspeccionó' : '');
        if(como) doc.text(String(tx(como)), x + fw / 2, y + 108, { align:'center' });
      } else {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(183, 47, 43);
        doc.text(String(tx('FALTA FIRMAR')), x + fw / 2, y + 64, { align:'center' });
      }
    });
    y += fh + 10;
    pie();
    return doc;
  }
  function nombrePDF(r, eq){
    var t = 'Inspeccion ' + ((eq && eq.codigo) || 'equipo') + ' ' + String((r && r.fecha) || '').slice(0, 10);
    try{ t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(_n){}
    return t.replace(/[^A-Za-z0-9 ._-]+/g, '-').replace(/\s+/g, ' ').trim() + '.pdf';
  }

  /* ── el Excel del mes: cada equipo en una fila, cada día en una columna ──
     D: {obra, mes:'2026-10', equipos:[{id, codigo, tipo, detalle, diaria}], insp:[{equipo, fecha, resultado, prod|pn, sst|sn, op_nombre, hora}], hoy} */
  function xlsxMes(D){
    var X = RCAP.xlsx, Cc = X.C, E = new X.Estilos(), Hoja = X.Hoja;
    var mes = String(D.mes || '').slice(0, 7), an = parseInt(mes.slice(0, 4), 10), mm = parseInt(mes.slice(5, 7), 10);
    var dias = new Date(an, mm, 0).getDate();
    var MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'][mm - 1] || '';
    var sTit = E.xf({ b:true, sz:14, c:Cc.petroleo }), sSub = E.xf({ sz:10, c:Cc.gris });
    var sCab = E.xf({ b:true, sz:9, c:Cc.blanco, f:Cc.petroleo, h:'center', borde:true, wrap:true });
    var sCabI = E.xf({ b:true, sz:9, c:Cc.blanco, f:Cc.petroleo, h:'left', borde:true });
    var sTx = E.xf({ sz:9, c:Cc.tinta, borde:true }), sNum = E.xf({ sz:9, c:Cc.tinta, h:'center', borde:true });
    var sOk = E.xf({ b:true, sz:9, c:Cc.okT, f:Cc.okF, h:'center', borde:true });
    var sOjo = E.xf({ b:true, sz:9, c:Cc.ojoT, f:Cc.ojoF, h:'center', borde:true });
    var sMal = E.xf({ b:true, sz:9, c:Cc.malT, f:Cc.malF, h:'center', borde:true });
    var sVac = E.xf({ sz:9, c:Cc.grisc, h:'center', borde:true }), sFin = E.xf({ sz:9, c:Cc.grisc, f:Cc.fondo, h:'center', borde:true });
    var sPct = E.xf({ b:true, sz:9, c:Cc.tinta, h:'center', borde:true, fmt:'0%' });
    var h = new Hoja('Inspección diaria'); h.activa = true; h.pie = 'Inspección diaria de equipos';
    h.unir(0, 1, 8, 1, 'Inspección diaria de equipos · ' + MES + ' de ' + an, sTit); h.altos[1] = 22;
    h.unir(0, 2, 3 + dias, 2, String(D.obra || '') + ' · C: conforme · O: con observación · X: no apto (fuera de servicio) · un punto al lado: le falta una firma', sSub);
    var f0 = 4;
    h.celda(0, f0, 'Código', sCabI); h.celda(1, f0, 'Equipo', sCabI);
    for(var d = 1; d <= dias; d++){
      var dow = new Date(an, mm - 1, d).getDay();
      h.celda(1 + d, f0, d + '\n' + 'DLMMJVS'.charAt(dow), sCab); h.anchos[1 + d] = 4.2;
    }
    h.celda(2 + dias, f0, 'Días con inspección', sCab); h.celda(3 + dias, f0, 'Completas (3 firmas)', sCab);
    h.anchos[0] = 12; h.anchos[1] = 30; h.anchos[2 + dias] = 12; h.anchos[3 + dias] = 12; h.altos[f0] = 30;
    var por = {};
    (D.insp || []).forEach(function(i){
      if(String(i.fecha || '').slice(0, 7) !== mes) return;
      var k = i.equipo + '|' + parseInt(String(i.fecha).slice(8, 10), 10);
      /* si hubo varias ese día, manda la peor; y «completa» si alguna lo está */
      var peso = { conforme:1, observado:2, no_apto:3 }, a = por[k];
      if(!a) por[k] = { r:i.resultado, ok:completa(i) };
      else { if((peso[i.resultado] || 0) > (peso[a.r] || 0)) a.r = i.resultado; if(completa(i)) a.ok = true; }
    });
    var fila = f0 + 1;
    (D.equipos || []).forEach(function(e){
      var n = 0, comp = 0;
      h.celda(0, fila, e.codigo || '', sTx); h.celda(1, fila, [e.tipo, e.detalle].filter(Boolean).join(' · '), sTx);
      for(var d2 = 1; d2 <= dias; d2++){
        var x = por[e.id + '|' + d2], dow2 = new Date(an, mm - 1, d2).getDay();
        if(x){
          n++; if(x.ok) comp++;
          h.celda(1 + d2, fila, (x.r === 'conforme' ? 'C' : (x.r === 'observado' ? 'O' : 'X')) + (x.ok ? '' : '·'),
                  x.r === 'conforme' ? sOk : (x.r === 'observado' ? sOjo : sMal));
        } else h.celda(1 + d2, fila, '', dow2 === 0 ? sFin : sVac);
      }
      h.celda(2 + dias, fila, n, sNum); h.celda(3 + dias, fila, n ? comp / n : '', n ? sPct : sNum);
      fila++;
    });
    if(!(D.equipos || []).length) h.unir(0, fila, 8, fila, 'Sin equipos registrados.', sSub);
    h.congelar = { c:2, r:f0 };
    /* la segunda hoja: una fila por inspección */
    var g = new Hoja('Detalle'); g.pie = 'Inspección diaria de equipos';
    var cols = ['Fecha', 'Hora', 'Código', 'Equipo', 'Resultado', 'Inspeccionó', 'Cargo', 'Fotos', 'Producción', 'SST'];
    cols.forEach(function(c, i){ g.celda(i, 1, c, sCabI); });
    [11, 7, 12, 28, 18, 28, 20, 7, 26, 26].forEach(function(w, i){ g.anchos[i] = w; });
    var codDe = {}; (D.equipos || []).forEach(function(e){ codDe[e.id] = e; });
    var fr = 2;
    (D.insp || []).filter(function(i){ return String(i.fecha || '').slice(0, 7) === mes; })
      .sort(function(a, b){ return String(a.fecha + (a.hora || '')).localeCompare(String(b.fecha + (b.hora || ''))); })
      .forEach(function(i){
        var e = codDe[i.equipo] || {};
        [dma(i.fecha), i.hora || '', e.codigo || '', [e.tipo, e.detalle].filter(Boolean).join(' · '), res(i).n, i.op_nombre || '', i.op_cargo || '',
         (i.fotos || []).length, (i.prod || {}).n || i.pn || 'Falta', (i.sst || {}).n || i.sn || 'Falta']
          .forEach(function(v, k){ g.celda(k, fr, v, k === 7 ? sNum : (k === 4 ? (i.resultado === 'conforme' ? sOk : (i.resultado === 'observado' ? sOjo : sMal)) : sTx)); });
        fr++;
      });
    g.congelar = { c:0, r:1 }; if(fr > 2) g.filtro = 'A1:J' + (fr - 1);
    return X.libro([h, g], E, 'Inspección diaria de equipos');
  }
  function nombreXlsx(obra, mes){
    var t = 'Inspeccion diaria de equipos - ' + String(obra || 'obra') + ' - ' + String(mes || '');
    try{ t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(_n){}
    return t.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120) + '.xlsx';
  }

  return { RES:RES, ROL:ROL, DIARIOS:DIARIOS, esDiario:esDiario, limpiarChecklist:limpiarChecklist,
           res:res, faltan:faltan, completa:completa, faltanTxt:faltanTxt, cuenta:cuenta, fotosDe:fotosDe,
           cargarFotos:cargarFotos, pdf:pdf, nombrePDF:nombrePDF, xlsxMes:xlsxMes, nombreXlsx:nombreXlsx, dma:dma, horaDe:horaDe };
})();
