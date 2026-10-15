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

/* ══ CÓMO SE USA CADA EQUIPO (14/10/2026, lote 11) ═══════════════════
   Marcelo, con la foto del porta extintor: «se puede colocar tipo un QR y que se escanee para hacerle
   inspección al extintor y también, quizás, saber cómo se usa… replicar para las demás».
   sst_equipo_qr.uso (sql/2026-11-16-equipo-uso.sql): {p:[los pasos de la obra], a:el agente del extintor,
   kg:su capacidad, r:'AAAA-MM' el mes en que vence su recarga}. Sin pasos propios, el extintor y el lavaojos
   traen los de siempre. Lo mismo dice la página del QR (/h/), que lo ve cualquiera, y el cartel del equipo
   (cartelEquipo, en carteles-qr.js). Sin citar normas: cómo se usa y para qué fuegos sirve. */
var EQ_PASOS = {
  'Extintor':[['Hala el seguro', 'Rompe el precinto y saca el pasador.'], ['Apunta a la base del fuego', 'La boquilla, a la base de las llamas, no a las llamas.'],
              ['Aprieta la manija', 'Con firmeza y de forma pareja.'], ['Barre de lado a lado', 'Hasta que se apague.']],
  'Lavaojos':[['Lleva a la persona al lavaojos', 'Sin frotarle los ojos.'], ['Abre el agua', 'Empuja la paleta o la palanca.'],
              ['Ojos abiertos bajo el agua', 'Sostén los párpados abiertos y enjuaga por lo menos 15 minutos.'], ['Busca atención médica', 'Avisa a tu supervisor y lleva la hoja MSDS del producto.']]
};
var EQ_USO_ANTES = { 'Extintor':'Úsalo solo si el fuego es pequeño y tienes la salida a tu espalda. Primero da la alarma y avisa a tu supervisor.' };
var EQ_USO_LUEGO = { 'Extintor':'Si el fuego no se apaga en unos segundos o crece, aléjate y llama a los bomberos. Si lo usaste, aunque sea un poco, avisa: hay que recargarlo.' };
var EQ_AGENTES = [
  {k:'pqs-abc', n:'Polvo químico seco ABC', c:'ABC'}, {k:'pqs-bc', n:'Polvo químico seco BC', c:'BC'},
  {k:'co2', n:'Dióxido de carbono (CO₂)', c:'BC', no:'En un lugar cerrado y chico, sal apenas lo uses: desplaza el aire.'},
  {k:'agua', n:'Agua a presión', c:'A', no:'No lo uses en equipos eléctricos con corriente ni en gasolina, aceite o thinner.'},
  {k:'espuma', n:'Espuma (AFFF)', c:'AB', no:'No lo uses en equipos eléctricos con corriente.'},
  {k:'k', n:'Acetato de potasio', c:'K'}, {k:'d', n:'Polvo para metales', c:'D'}
];
var EQ_CLASES_FUEGO = { A:'Sólidos: madera, papel, tela, plástico', B:'Líquidos y gases inflamables: gasolina, petróleo, pintura, thinner, gas',
                        C:'Equipos eléctricos con corriente', D:'Metales que arden', K:'Aceites y grasas de cocina' };
/* la señal de la NTP que lleva su cartel (los de emergencia) y el color de su franja */
var EQ_SENAL = { 'Extintor':['extintor', '#C8102E'], 'Lavaojos':['lavaojos-de-emergencia', '#1B7F3B'], 'Camilla':['camilla', '#1B7F3B'], 'Botiquín':['primeros-auxilios', '#1B7F3B'] };
function eqAgente(k){ for(var i=0;i<EQ_AGENTES.length;i++) if(EQ_AGENTES[i].k===k) return EQ_AGENTES[i]; return null; }
/* cómo se usa un equipo: sus pasos ([título, detalle]: los de la obra o los de siempre) y, del extintor, de qué es y su recarga */
function eqUsoDe(x){
  var U=(x && x.uso && typeof x.uso==='object' && !Array.isArray(x.uso)) ? x.uso : {}, tp=String((x && x.tipo) || '');
  var propios=Array.isArray(U.p) ? U.p.map(function(s){ return String(s||'').replace(/\s+/g, ' ').trim(); }).filter(function(s){ return s.length>=2; }).slice(0, 10) : [];
  var base=EQ_PASOS[tp] || null;
  return { propios:propios.length>0, pasos:propios.length ? propios.map(function(s){ return [s, '']; }) : (base ? base.map(function(p){ return p.slice(); }) : []),
           antes:EQ_USO_ANTES[tp] || '', luego:EQ_USO_LUEGO[tp] || '', ext:(tp==='Extintor'), agente:eqAgente(U.a),
           kg:/^[0-9]{1,3}([.,][0-9]{1,2})?$/.test(String(U.kg||'')) ? String(U.kg).replace('.', ',') : '', r:/^20\d{2}-(0[1-9]|1[0-2])$/.test(String(U.r||'')) ? String(U.r) : '' };
}
/* el dibujo de su señal (el cuerpo SVG, en su caja de 0 a 100): en la app, del catálogo de la NTP (NTP_SENALES);
   en el portal, EQ_SENAL_SVG, que armar.py pone en portal/equipos.js con solo estas cuatro */
function eqSenalSvg(tipo){
  var S=EQ_SENAL[tipo]; if(!S) return '';
  try{ if(typeof EQ_SENAL_SVG==='object' && EQ_SENAL_SVG && EQ_SENAL_SVG[S[0]]) return EQ_SENAL_SVG[S[0]]; }catch(_a){}
  try{ if(typeof NTP_SENALES!=='undefined') for(var i=0;i<NTP_SENALES.length;i++) if(NTP_SENALES[i].k===S[0]) return NTP_SENALES[i].s; }catch(_b){}
  return '';
}
/* lo que lleva el cartel de un equipo (cartelEquipo, carteles-qr.js), igual en la app y en el portal.
   op: { tx (traducir), obra, empresa, logo, mes ('AAAA-MM', el de hoy) } */
function eqCartelDatosDe(x, op){
  op=op||{};
  var tr=op.tx || function(z){ return z; }, u=eqUsoDe(x), S=EQ_SENAL[x.tipo] || null, A=u.agente;
  var det=u.ext ? [A ? tr(A.n) : '', u.kg ? u.kg+' kg' : ''].filter(Boolean).join(' · ') : String(x.detalle || '');
  return { codigo:x.codigo, tipo:tr(x.tipo), detalle:det, enlace:eqEnlace(x), color:S ? S[1] : '#0B2A3A', picto:eqSenalSvg(x.tipo),
           pasos:u.pasos.map(function(p){ return u.propios ? p : [tr(p[0]), tr(p[1])]; }), propios:u.propios,
           antes:u.antes ? tr(u.antes) : '', luego:u.luego ? tr(u.luego) : '',
           clases:A ? A.c.split('').map(function(c){ return [c, tr(EQ_CLASES_FUEGO[c])]; }) : [], nousar:(A && A.no) ? tr(A.no) : '',
           recarga:eqRecargaTxt(u.r), vencida:eqRecargaVencida(u.r, op.mes || ''), obra:op.obra || '', empresa:op.empresa || '', logo:op.logo || null, tx:tr };
}
/* «03/2027», y si ya venció (contra el mes de hoy, «2027-04») */
function eqRecargaTxt(r){ return r ? r.slice(5, 7)+'/'+r.slice(0, 4) : ''; }
function eqRecargaVencida(r, mes){ return !!(r && mes && r < mes); }
/* lo que se guarda: null si no hay nada; si no, solo lo que tiene. Devuelve {uso} o {error} */
function eqUsoLimpio(f){
  f=f||{};
  var lineas=String(f.p||'').split(/\n/).map(function(s){ return s.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
  if(lineas.length>10) return {error:'Hasta 10 pasos: junta o quita alguno.'};
  if(lineas.some(function(s){ return s.length>200; })) return {error:'Cada paso, de hasta 200 letras.'};
  if(lineas.some(function(s){ return s.length<2; })) return {error:'Cada paso, de al menos dos letras.'};
  var kg=String(f.kg||'').trim().replace(/\s*kg$/i, ''), r=String(f.r||'').trim(), a=String(f.a||'').trim(), u={};
  if(kg && !/^[0-9]{1,3}([.,][0-9]{1,2})?$/.test(kg)) return {error:'La capacidad, en kilos: 6, 4,5…'};
  if(r && !/^20\d{2}-(0[1-9]|1[0-2])$/.test(r)) return {error:'El mes de la recarga no se ve bien: por ejemplo, 2027-03.'};
  if(a && !eqAgente(a)) a='';
  if(lineas.length) u.p=lineas;
  if(a) u.a=a;
  if(kg) u.kg=kg;
  if(r) u.r=r;
  return {uso:Object.keys(u).length ? u : null};
}

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

/* ══ 15/10/2026 · lote 12 · LAS INSPECCIONES QUE LE TOCAN A CADA EQUIPO, Y «LA HICE EN PAPEL» ══════════
   Marcelo: «ese QR que estará en los extintores u otras herramientas o equipos, que se haga inspección diaria,
   mensual o anual, que el supervisor elija cuál aplica para cada una. Y darle la opción, si es que aún hacen sus
   inspecciones en papel, de colocar "ya hice mi inspección en papel", y subir el PDF o archivo para que aparezca en
   el QR… mejórala» (app y web; sql/2026-11-18-equipo-frecuencias.sql).
   Sin elegir (null), como siempre: la diaria antes de usarlo (si su tipo la tiene) y la revisión del mes con la
   cinta. Lo de aquí es lo común de la app y de la web: las seis, hasta cuándo vale cada una y si está al día, con
   las mismas cuentas del servidor (_sst_equipo_frec_estado). */
var EQ_FRECS = [
  {k:'diaria', n:'Diaria', d:'Antes de usarlo, con su QR'},
  {k:'semanal', n:'Semanal', d:'Una vez por semana'},
  {k:'mensual', n:'Mensual', d:'La revisión del mes, con la cinta del color'},
  {k:'trimestral', n:'Trimestral', d:'Cada tres meses'},
  {k:'semestral', n:'Semestral', d:'Cada seis meses'},
  {k:'anual', n:'Anual', d:'Una vez al año: la certificación o el mantenimiento'}
];
/* cómo se nombra en una frase: «la anual», «la del mes» */
var EQ_FREC_LA = { diaria:'la diaria', semanal:'la semanal', mensual:'la del mes', trimestral:'la trimestral', semestral:'la semestral', anual:'la anual' };
function eqFrecDe(k){ for(var i=0;i<EQ_FRECS.length;i++) if(EQ_FRECS[i].k===k) return EQ_FRECS[i]; return null; }
/* las que eligió la obra para este equipo, en su orden; null = sin elegir (las de siempre) */
function eqFrecsDe(x){
  var f=x && x.frecuencias;
  if(!Array.isArray(f) || !f.length) return null;
  var l=EQ_FRECS.map(function(F){ return F.k; }).filter(function(k){ return f.indexOf(k)>-1; });
  return l.length ? l : null;
}
/* ¿le toca la del mes? (sin elegir, sí: como siempre) */
function eqTieneMensual(x){ var F=eqFrecsDe(x); return !F || F.indexOf('mensual')>-1; }
/* las fechas, como las cuenta el servidor (Postgres suma meses sin pasarse del último día del mes) */
function _eqFd(iso){ var p=String(iso||'').slice(0, 10).split('-'); return p.length===3 ? new Date(+p[0], +p[1]-1, +p[2]) : null; }
function _eqFiso(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function _eqMasMeses(d, n){ var y=d.getFullYear(), m=d.getMonth()+n, ult=new Date(y, m+1, 0).getDate(); return new Date(y, m, Math.min(d.getDate(), ult)); }
function _eqMasDias(d, n){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()+n); }
var _EQ_FREC_MESES = { trimestral:3, semestral:6, anual:12 };
/* hasta cuándo vale la que se hizo el día f */
function eqFrecHasta(q, f){
  var d=_eqFd(f); if(!d) return '';
  if(q==='diaria') return _eqFiso(d);
  if(q==='semanal') return _eqFiso(_eqMasDias(d, 6));
  if(q==='mensual') return _eqFiso(new Date(d.getFullYear(), d.getMonth()+1, 0));
  return _eqFiso(_eqMasDias(_eqMasMeses(d, _EQ_FREC_MESES[q] || 12), -1));
}
/* ¿la que se hizo el día f sigue valiendo hoy? */
function eqFrecAlDia(q, f, hoy){
  f=String(f||'').slice(0, 10); hoy=String(hoy||'').slice(0, 10);
  var H=_eqFd(hoy); if(!f || !H) return false;
  if(q==='diaria') return f===hoy;
  if(q==='semanal') return f>=_eqFiso(_eqMasDias(H, -6));
  if(q==='mensual') return f.slice(0, 7)===hoy.slice(0, 7);
  return f>_eqFiso(_eqMasMeses(H, -(_EQ_FREC_MESES[q] || 12)));
}
/* cómo va cada una, como lo dice el servidor ({q, f, r, papel, u, a, hasta, al_dia}): la última de las anotadas
   (sst_equipo_revs: {frec, fecha, resultado, papel, url, archivo, creado}) o, la diaria y la del mes, la de su
   camino de siempre (ultDia: la última inspección diaria de la app; ultMes: la revisión del mes del equipo) */
function eqFrecEstado(frecs, revs, ultMes, ultDia, hoy){
  return (frecs||[]).map(function(q){
    var c=(revs||[]).filter(function(r){ return r && r.frec===q && r.fecha; }).map(function(r){
      return {f:String(r.fecha).slice(0, 10), r:r.resultado||null, papel:!!r.papel, u:r.url||null, a:r.archivo||null, cr:String(r.creado||'')}; });
    if(q==='diaria' && ultDia) c.push({f:String(ultDia).slice(0, 10), r:null, papel:false, cr:''});
    if(q==='mensual' && ultMes) c.push({f:String(ultMes).slice(0, 10), r:null, papel:false, cr:''});
    c.sort(function(a, b){
      if(a.f!==b.f) return a.f<b.f ? 1 : -1;
      if(a.papel!==b.papel) return a.papel ? -1 : 1;
      return b.cr.localeCompare(a.cr);
    });
    var u=c[0], o={q:q, al_dia:false};
    if(u){ o.f=u.f; if(u.r) o.r=u.r; o.papel=u.papel; if(u.u) o.u=u.u; if(u.a) o.a=u.a; o.hasta=eqFrecHasta(q, u.f); o.al_dia=eqFrecAlDia(q, u.f, hoy); }
    return o;
  });
}
/* para la lista: 'ok' (todas al día), 'obs' (la última de alguna, con observación) o 'toca' (alguna sin hacer o
   vencida). La diaria no cuenta si tiene otras: esa la dice su QR antes de usarlo. */
function eqFrecClase(est){
  var l=(est||[]).filter(function(e){ return e.q!=='diaria'; });
  if(!l.length) l=est||[];
  if(!l.length) return null;
  if(l.some(function(e){ return e.r==='observado'; })) return 'obs';
  return l.every(function(e){ return e.al_dia; }) ? 'ok' : 'toca';
}
/* las que no están al día (sin la diaria, si tiene otras), para decir «Le toca: la anual y la trimestral» */
function eqFrecFaltan(est){
  var l=(est||[]).filter(function(e){ return e.q!=='diaria'; });
  if(!l.length) l=est||[];
  return l.filter(function(e){ return !e.al_dia; }).map(function(e){ return e.q; });
}
/* el archivo de papel que se sube: PDF o foto, del tamaño que acepta el almacén */
var EQ_PAPEL_TIPOS = 'application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif';
function eqPapelNoVa(f){
  if(!f) return 'Elige el archivo: el PDF o la foto de la hoja.';
  var t=String(f.type||'').toLowerCase(), n=String(f.name||'').toLowerCase();
  if(!(t==='application/pdf' || /^image\//.test(t) || /\.(pdf|jpe?g|png|webp|heic|heif)$/.test(n))) return 'Ese archivo no va: sube el PDF o una foto de la hoja.';
  if((f.size||0) > 25*1024*1024) return 'Ese archivo pesa más de 25 MB: sácale una foto a la hoja, o pásalo a un PDF más liviano.';
  return '';
}
/* el nombre con que se guarda en el almacén (sin espacios ni tildes), y la ficha para que no se anote dos veces */
function eqPapelNombre(n){
  var s=String(n||'inspeccion').normalize ? String(n||'inspeccion').normalize('NFD').replace(/[̀-ͯ]/g, '') : String(n||'inspeccion');
  s=s.replace(/[^A-Za-z0-9.\-_]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return (s || 'inspeccion').slice(-80);
}
function eqPapelExt(){ var t=''; for(var i=0;i<16;i++) t+='abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.random()*36|0); return 'p'+t; }
/* la foto de la hoja, más liviana (2200 px se leen bien y pesan menos de 1 MB); el PDF, tal cual. Si el navegador no
   la puede abrir (HEIC en la computadora), va como vino. */
function eqPapelAchicar(f){
  return new Promise(function(ok){
    var t=String((f && f.type) || '').toLowerCase();
    if(!f || !/^image\/(jpeg|png|webp)$/.test(t) || (f.size||0) <= 1200*1024 || typeof document==='undefined'){ ok(f); return; }
    var url=null, img=new Image();
    try{ url=URL.createObjectURL(f); }catch(_u){ ok(f); return; }
    img.onload=function(){
      try{
        var w=img.naturalWidth, h=img.naturalHeight, k=Math.min(1, 2200/Math.max(w, h, 1));
        var cv=document.createElement('canvas'); cv.width=Math.max(1, Math.round(w*k)); cv.height=Math.max(1, Math.round(h*k));
        var g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        cv.toBlob(function(b){ ok((b && b.size < (f.size||0)) ? b : f); }, 'image/jpeg', 0.85);
      }catch(_c){ ok(f); }
    };
    img.onerror=function(){ try{ URL.revokeObjectURL(url); }catch(_r){} ok(f); };
    img.src=url;
  });
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
/* las cuatro señales de la NTP de los carteles de equipos (de senales-ntp.js, tal cual) */
var EQ_SENAL_SVG = {"extintor": "<g transform=\"scale(1.04)\"><path fill=\"#D9261C\" fill-rule=\"evenodd\" d=\"M5.6 5.6L90.6 5.6L90.6 90.6L5.6 90.6\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M65.8 9C62.5 9.5 59.1 10.4 55.7 11.5L49.7 14.6C48.8 15.1 48.4 15.7 48.2 16.4L46.2 16.4L46.2 14.9L42.7 14.9L42.7 16.1C22.5 19.6 17.8 29.5 23.3 43.6C27.3 53 30.6 61.8 32.6 69.7L31.5 69.7L31.5 73.2L32.4 73.2L32.4 74.9L31.2 74.9L31.2 78.9L36.7 78.9L36.7 83.6C36.7 85.6 38.5 87.2 40.8 87.2L51 87.2L61.1 87.2C63.4 87.2 65.3 85.6 65.3 83.6L65.3 29.1C65.3 26.2 59.1 24.1 56.5 23.2C54.9 22.6 54.5 20.8 54.5 18.5L53.5 18.5C53.5 18.1 53.6 17.7 53.8 17.3C54.8 17.2 55.2 17.2 56.2 17.5C56.4 17.8 56.8 17.9 57.2 18C58.1 18.1 58.7 17.8 59.5 17.7C60.7 17.6 60.9 18.1 61.9 18.2C63 18.3 63.5 17.8 64.5 17.9C65.5 18 66 18.7 66.8 18.8C67.7 18.9 68 18.3 68.9 18.5C69.5 18.7 70 19 70.7 18.6C67.6 16.3 61.9 15.5 55.1 15.2C55.3 14.4 56 13.6 56.8 13.1C59.3 11.9 62 10.9 65.4 9.9C67.1 10 67.2 9 65.8 9M42.7 18.1L42.7 19.1L46.2 19.1L46.2 17.7L48.3 17.7C48.3 17.9 48.4 18.2 48.5 18.5L47.5 18.5C47.5 20.8 47.1 22.6 45.5 23.2C42.9 24.1 36.7 26.2 36.7 29.1L36.7 74.9L34.7 74.9L34.7 73.2L35.6 73.2L35.6 69.7L34.4 69.7C34.4 62 29.8 54.6 25.7 42.8C20.9 31 24.4 21.9 42.7 18.1\"/><path fill=\"#D9261C\" d=\"M51.1 13.9H51.1V14.8H51.1ZM51.1 13.9C52 13.9 53 14.3 53.6 15L53 15.6C52.5 15.1 51.8 14.8 51.1 14.8L51.1 13.9M53.6 15C54.3 15.7 54.7 16.6 54.7 17.6L53.8 17.6C53.8 16.8 53.5 16.1 53 15.6L53.6 15M54.7 17.6L54.7 17.6L53.8 17.6L53.8 17.6L54.7 17.6L54.7 17.6L53.8 17.6L53.8 17.6L54.7 17.6C54.7 18.6 54.3 19.4 53.6 20.1L53 19.5C53.5 19 53.8 18.3 53.8 17.6L54.7 17.6M53.6 20.1C53 20.8 52 21.2 51.1 21.2L51.1 20.3C51.8 20.3 52.5 20 53 19.5L53.6 20.1M51.1 20.3H51.1V21.2H51.1ZM51.1 20.3H51.1V21.2H51.1ZM51.1 21.2C50.1 21.2 49.2 20.8 48.5 20.1L49.1 19.5C49.6 20 50.3 20.3 51.1 20.3L51.1 21.2M48.5 20.1C47.9 19.4 47.5 18.6 47.5 17.6L48.3 17.6C48.3 18.3 48.6 19 49.1 19.5L48.5 20.1M47.5 17.6L47.5 17.6L48.3 17.6L48.3 17.6L47.5 17.6L47.5 17.6L48.3 17.6L48.3 17.6L47.5 17.6C47.5 16.6 47.9 15.7 48.5 15L49.1 15.6C48.6 16.1 48.3 16.8 48.3 17.6L47.5 17.6M48.5 15C49.2 14.3 50.1 13.9 51.1 13.9L51.1 14.8C50.3 14.8 49.6 15.1 49.1 15.6L48.5 15M51.1 13.9L51.1 13.9L51.1 14.8L51.1 14.8\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M51.1 14.4C52.8 14.4 54.2 15.8 54.2 17.6C54.2 19.3 52.8 20.7 51.1 20.7C49.3 20.7 47.9 19.3 47.9 17.6C47.9 15.8 49.3 14.4 51.1 14.4\"/><path fill=\"#D9261C\" fill-rule=\"evenodd\" d=\"M51.1 15C52.5 15 53.6 16.1 53.6 17.6C53.6 18.8 52.8 19.8 51.7 20L51.1 15.8L50.5 20C49.4 19.8 48.5 18.8 48.5 17.6C48.5 16.1 49.7 15 51.1 15\"/><path fill=\"none\" stroke=\"#1F1A17\" stroke-width=\"1\" stroke-linejoin=\"round\" d=\"M2.7 2.7H93.4V93.4H2.7Z\"/></g>", "lavaojos-de-emergencia": "<g transform=\"scale(1.04)\"><path fill=\"#009645\" fill-rule=\"evenodd\" d=\"M5.6 5.6L90.6 5.6L90.6 90.6L5.6 90.6\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M28.8 74.8L38.1 74.8L42.3 74.8L51.6 74.8C52.6 74.8 52.8 75.4 52.5 76.9C51.8 79.9 48.6 81.8 45.4 81.8L43.5 81.8L43.5 88.7L36.9 88.7L36.9 81.8L35.1 81.8C31.8 81.8 28.6 79.9 28 76.9C27.7 75.4 27.8 74.8 28.8 74.8\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M28.7 70.2C29.2 70.2 29.7 70.7 29.7 71.2C29.7 71.8 29.2 72.2 28.7 72.2C28.1 72.2 27.7 71.8 27.7 71.2C27.7 70.7 28.1 70.2 28.7 70.2M32.5 70.2C33.1 70.2 33.5 70.7 33.5 71.2C33.5 71.8 33.1 72.2 32.5 72.2C32 72.2 31.6 71.8 31.6 71.2C31.6 70.7 32 70.2 32.5 70.2M36.4 70.2C37 70.2 37.4 70.7 37.4 71.2C37.4 71.8 37 72.2 36.4 72.2C35.9 72.2 35.4 71.8 35.4 71.2C35.4 70.7 35.9 70.2 36.4 70.2M40.3 70.2C40.8 70.2 41.3 70.7 41.3 71.2C41.3 71.8 40.8 72.2 40.3 72.2C39.8 72.2 39.3 71.8 39.3 71.2C39.3 70.7 39.8 70.2 40.3 70.2M44.2 70.2C44.7 70.2 45.2 70.7 45.2 71.2C45.2 71.8 44.7 72.2 44.2 72.2C43.6 72.2 43.2 71.8 43.2 71.2C43.2 70.7 43.6 70.2 44.2 70.2M48 70.2C48.6 70.2 49 70.7 49 71.2C49 71.8 48.6 72.2 48 72.2C47.5 72.2 47 71.8 47 71.2C47 70.7 47.5 70.2 48 70.2M51.9 70.2C52.5 70.2 52.9 70.7 52.9 71.2C52.9 71.8 52.5 72.2 51.9 72.2C51.4 72.2 50.9 71.8 50.9 71.2C50.9 70.7 51.4 70.2 51.9 70.2M28.4 66.7C29 66.7 29.4 67.1 29.4 67.7C29.4 68.2 29 68.6 28.4 68.6C27.9 68.6 27.4 68.2 27.4 67.7C27.4 67.1 27.9 66.7 28.4 66.7M32.5 66.7C33.1 66.7 33.5 67.1 33.5 67.7C33.5 68.2 33.1 68.6 32.5 68.6C32 68.6 31.6 68.2 31.6 67.7C31.6 67.1 32 66.7 32.5 66.7M36.4 66.7C37 66.7 37.4 67.1 37.4 67.7C37.4 68.2 37 68.6 36.4 68.6C35.9 68.6 35.4 68.2 35.4 67.7C35.4 67.1 35.9 66.7 36.4 66.7M40.3 66.7C40.8 66.7 41.3 67.1 41.3 67.7C41.3 68.2 40.8 68.6 40.3 68.6C39.8 68.6 39.3 68.2 39.3 67.7C39.3 67.1 39.8 66.7 40.3 66.7M44.2 66.7C44.7 66.7 45.2 67.1 45.2 67.7C45.2 68.2 44.7 68.6 44.2 68.6C43.6 68.6 43.2 68.2 43.2 67.7C43.2 67.1 43.6 66.7 44.2 66.7M48 66.7C48.6 66.7 49 67.1 49 67.7C49 68.2 48.6 68.6 48 68.6C47.5 68.6 47 68.2 47 67.7C47 67.1 47.5 66.7 48 66.7M52.1 66.7C52.6 66.7 53.1 67.1 53.1 67.7C53.1 68.2 52.6 68.6 52.1 68.6C51.5 68.6 51.1 68.2 51.1 67.7C51.1 67.1 51.5 66.7 52.1 66.7M27.9 63.1C28.5 63.1 28.9 63.5 28.9 64C28.9 64.6 28.5 65 27.9 65C27.4 65 26.9 64.6 26.9 64C26.9 63.5 27.4 63.1 27.9 63.1M32.3 63.1C32.8 63.1 33.3 63.5 33.3 64C33.3 64.6 32.8 65 32.3 65C31.7 65 31.3 64.6 31.3 64C31.3 63.5 31.7 63.1 32.3 63.1M36.4 63.1C37 63.1 37.4 63.5 37.4 64C37.4 64.6 37 65 36.4 65C35.9 65 35.4 64.6 35.4 64C35.4 63.5 35.9 63.1 36.4 63.1M40.3 63.1C40.8 63.1 41.3 63.5 41.3 64C41.3 64.6 40.8 65 40.3 65C39.8 65 39.3 64.6 39.3 64C39.3 63.5 39.8 63.1 40.3 63.1M44.2 63.1C44.7 63.1 45.2 63.5 45.2 64C45.2 64.6 44.7 65 44.2 65C43.6 65 43.2 64.6 43.2 64C43.2 63.5 43.6 63.1 44.2 63.1M48.3 63.1C48.9 63.1 49.3 63.5 49.3 64C49.3 64.6 48.9 65 48.3 65C47.8 65 47.3 64.6 47.3 64C47.3 63.5 47.8 63.1 48.3 63.1M52.5 63.1C53.1 63.1 53.5 63.5 53.5 64C53.5 64.6 53.1 65 52.5 65C52 65 51.5 64.6 51.5 64C51.5 63.5 52 63.1 52.5 63.1M27.3 59.5C27.9 59.5 28.3 59.9 28.3 60.5C28.3 61 27.9 61.5 27.3 61.5C26.8 61.5 26.3 61 26.3 60.5C26.3 59.9 26.8 59.5 27.3 59.5M31.8 59.5C32.4 59.5 32.8 59.9 32.8 60.5C32.8 61 32.4 61.5 31.8 61.5C31.3 61.5 30.8 61 30.8 60.5C30.8 59.9 31.3 59.5 31.8 59.5M36.4 59.5C37 59.5 37.4 59.9 37.4 60.5C37.4 61 37 61.5 36.4 61.5C35.9 61.5 35.4 61 35.4 60.5C35.4 59.9 35.9 59.5 36.4 59.5M40.3 59.5C40.8 59.5 41.3 59.9 41.3 60.5C41.3 61 40.8 61.5 40.3 61.5C39.8 61.5 39.3 61 39.3 60.5C39.3 59.9 39.8 59.5 40.3 59.5M44.2 59.5C44.7 59.5 45.2 59.9 45.2 60.5C45.2 61 44.7 61.5 44.2 61.5C43.6 61.5 43.2 61 43.2 60.5C43.2 59.9 43.6 59.5 44.2 59.5M48.6 59.5C49.1 59.5 49.6 59.9 49.6 60.5C49.6 61 49.1 61.5 48.6 61.5C48 61.5 47.6 61 47.6 60.5C47.6 59.9 48 59.5 48.6 59.5M53.2 59.5C53.8 59.5 54.2 59.9 54.2 60.5C54.2 61 53.8 61.5 53.2 61.5C52.7 61.5 52.2 61 52.2 60.5C52.2 59.9 52.7 59.5 53.2 59.5M26.4 55.9C27 55.9 27.4 56.3 27.4 56.9C27.4 57.4 27 57.9 26.4 57.9C25.9 57.9 25.4 57.4 25.4 56.9C25.4 56.3 25.9 55.9 26.4 55.9M31.4 55.9C32 55.9 32.4 56.3 32.4 56.9C32.4 57.4 32 57.9 31.4 57.9C30.9 57.9 30.4 57.4 30.4 56.9C30.4 56.3 30.9 55.9 31.4 55.9M36.4 55.9C37 55.9 37.4 56.3 37.4 56.9C37.4 57.4 37 57.9 36.4 57.9C35.9 57.9 35.4 57.4 35.4 56.9C35.4 56.3 35.9 55.9 36.4 55.9M40.3 55.9C40.8 55.9 41.3 56.3 41.3 56.9C41.3 57.4 40.8 57.9 40.3 57.9C39.8 57.9 39.3 57.4 39.3 56.9C39.3 56.3 39.8 55.9 40.3 55.9M44.2 55.9C44.7 55.9 45.2 56.3 45.2 56.9C45.2 57.4 44.7 57.9 44.2 57.9C43.6 57.9 43.2 57.4 43.2 56.9C43.2 56.3 43.6 55.9 44.2 55.9M49 55.9C49.5 55.9 50 56.3 50 56.9C50 57.4 49.5 57.9 49 57.9C48.4 57.9 48 57.4 48 56.9C48 56.3 48.4 55.9 49 55.9M54 55.9C54.5 55.9 55 56.3 55 56.9C55 57.4 54.5 57.9 54 57.9C53.5 57.9 53 57.4 53 56.9C53 56.3 53.5 55.9 54 55.9M25.4 52.3C25.9 52.3 26.4 52.7 26.4 53.3C26.4 53.8 25.9 54.3 25.4 54.3C24.9 54.3 24.4 53.8 24.4 53.3C24.4 52.7 24.9 52.3 25.4 52.3M30.9 52.3C31.4 52.3 31.9 52.7 31.9 53.3C31.9 53.8 31.4 54.3 30.9 54.3C30.4 54.3 29.9 53.8 29.9 53.3C29.9 52.7 30.4 52.3 30.9 52.3M36.4 52.3C37 52.3 37.4 52.7 37.4 53.3C37.4 53.8 37 54.3 36.4 54.3C35.9 54.3 35.4 53.8 35.4 53.3C35.4 52.7 35.9 52.3 36.4 52.3M40.3 52.3C40.8 52.3 41.3 52.7 41.3 53.3C41.3 53.8 40.8 54.3 40.3 54.3C39.8 54.3 39.3 53.8 39.3 53.3C39.3 52.7 39.8 52.3 40.3 52.3M44.2 52.3C44.7 52.3 45.2 52.7 45.2 53.3C45.2 53.8 44.7 54.3 44.2 54.3C43.6 54.3 43.2 53.8 43.2 53.3C43.2 52.7 43.6 52.3 44.2 52.3M49.6 52.3C50.1 52.3 50.6 52.7 50.6 53.3C50.6 53.8 50.1 54.3 49.6 54.3C49 54.3 48.6 53.8 48.6 53.3C48.6 52.7 49 52.3 49.6 52.3M55.1 52.3C55.6 52.3 56.1 52.7 56.1 53.3C56.1 53.8 55.6 54.3 55.1 54.3C54.5 54.3 54.1 53.8 54.1 53.3C54.1 52.7 54.5 52.3 55.1 52.3M24.2 48.7C24.7 48.7 25.2 49.1 25.2 49.7C25.2 50.2 24.7 50.7 24.2 50.7C23.6 50.7 23.2 50.2 23.2 49.7C23.2 49.1 23.6 48.7 24.2 48.7M30.4 48.7C30.9 48.7 31.3 49.1 31.3 49.7C31.3 50.2 30.9 50.7 30.4 50.7C29.8 50.7 29.4 50.2 29.4 49.7C29.4 49.1 29.8 48.7 30.4 48.7M36.4 48.7C37 48.7 37.4 49.1 37.4 49.7C37.4 50.2 37 50.7 36.4 50.7C35.9 50.7 35.4 50.2 35.4 49.7C35.4 49.1 35.9 48.7 36.4 48.7M40.3 48.7C40.8 48.7 41.3 49.1 41.3 49.7C41.3 50.2 40.8 50.7 40.3 50.7C39.8 50.7 39.3 50.2 39.3 49.7C39.3 49.1 39.8 48.7 40.3 48.7M44.2 48.7C44.7 48.7 45.2 49.1 45.2 49.7C45.2 50.2 44.7 50.7 44.2 50.7C43.6 50.7 43.2 50.2 43.2 49.7C43.2 49.1 43.6 48.7 44.2 48.7M50.2 48.7C50.8 48.7 51.2 49.1 51.2 49.7C51.2 50.2 50.8 50.7 50.2 50.7C49.6 50.7 49.2 50.2 49.2 49.7C49.2 49.1 49.6 48.7 50.2 48.7M56.4 48.7C56.9 48.7 57.4 49.1 57.4 49.7C57.4 50.2 56.9 50.7 56.4 50.7C55.8 50.7 55.4 50.2 55.4 49.7C55.4 49.1 55.8 48.7 56.4 48.7M22.7 45.1C23.2 45.1 23.7 45.5 23.7 46.1C23.7 46.6 23.2 47.1 22.7 47.1C22.1 47.1 21.7 46.6 21.7 46.1C21.7 45.5 22.1 45.1 22.7 45.1M29.5 45.1C30.1 45.1 30.5 45.5 30.5 46.1C30.5 46.6 30.1 47.1 29.5 47.1C29 47.1 28.5 46.6 28.5 46.1C28.5 45.5 29 45.1 29.5 45.1M36.4 45.1C37 45.1 37.4 45.5 37.4 46.1C37.4 46.6 37 47.1 36.4 47.1C35.9 47.1 35.4 46.6 35.4 46.1C35.4 45.5 35.9 45.1 36.4 45.1M40.3 45.1C40.8 45.1 41.3 45.5 41.3 46.1C41.3 46.6 40.8 47.1 40.3 47.1C39.8 47.1 39.3 46.6 39.3 46.1C39.3 45.5 39.8 45.1 40.3 45.1M44.2 45.1C44.7 45.1 45.2 45.5 45.2 46.1C45.2 46.6 44.7 47.1 44.2 47.1C43.6 47.1 43.2 46.6 43.2 46.1C43.2 45.5 43.6 45.1 44.2 45.1M51 45.1C51.5 45.1 51.9 45.5 51.9 46.1C51.9 46.6 51.5 47.1 51 47.1C50.4 47.1 50 46.6 50 46.1C50 45.5 50.4 45.1 51 45.1M57.8 45.1C58.4 45.1 58.8 45.5 58.8 46.1C58.8 46.6 58.4 47.1 57.8 47.1C57.3 47.1 56.8 46.6 56.8 46.1C56.8 45.5 57.3 45.1 57.8 45.1M28.7 41.5C29.2 41.5 29.7 41.9 29.7 42.5C29.7 43 29.2 43.5 28.7 43.5C28.1 43.5 27.7 43 27.7 42.5C27.7 41.9 28.1 41.5 28.7 41.5M21 41.5C21.5 41.5 22 41.9 22 42.5C22 43 21.5 43.5 21 43.5C20.4 43.5 20 43 20 42.5C20 41.9 20.4 41.5 21 41.5M36.4 41.5C37 41.5 37.4 41.9 37.4 42.5C37.4 43 37 43.5 36.4 43.5C35.9 43.5 35.4 43 35.4 42.5C35.4 41.9 35.9 41.5 36.4 41.5M40.3 41.5C40.8 41.5 41.3 41.9 41.3 42.5C41.3 43 40.8 43.5 40.3 43.5C39.8 43.5 39.3 43 39.3 42.5C39.3 41.9 39.8 41.5 40.3 41.5M44.2 41.5C44.7 41.5 45.2 41.9 45.2 42.5C45.2 43 44.7 43.5 44.2 43.5C43.6 43.5 43.2 43 43.2 42.5C43.2 41.9 43.6 41.5 44.2 41.5M59.5 41.5C60.1 41.5 60.5 41.9 60.5 42.5C60.5 43 60.1 43.5 59.5 43.5C59 43.5 58.6 43 58.6 42.5C58.6 41.9 59 41.5 59.5 41.5M51.7 41.5C52.3 41.5 52.7 41.9 52.7 42.5C52.7 43 52.3 43.5 51.7 43.5C51.2 43.5 50.7 43 50.7 42.5C50.7 41.9 51.2 41.5 51.7 41.5M27.7 37.9C28.2 37.9 28.7 38.3 28.7 38.9C28.7 39.4 28.2 39.9 27.7 39.9C27.1 39.9 26.7 39.4 26.7 38.9C26.7 38.3 27.1 37.9 27.7 37.9M19 37.9C19.5 37.9 20 38.3 20 38.9C20 39.4 19.5 39.9 19 39.9C18.4 39.9 18 39.4 18 38.9C18 38.3 18.4 37.9 19 37.9M61.5 37.9C62 37.9 62.5 38.3 62.5 38.9C62.5 39.4 62 39.9 61.5 39.9C61 39.9 60.5 39.4 60.5 38.9C60.5 38.3 61 37.9 61.5 37.9M52.8 37.9C53.4 37.9 53.8 38.3 53.8 38.9C53.8 39.4 53.4 39.9 52.8 39.9C52.3 39.9 51.8 39.4 51.8 38.9C51.8 38.3 52.3 37.9 52.8 37.9M16.8 34.3C17.3 34.3 17.8 34.7 17.8 35.3C17.8 35.8 17.3 36.3 16.8 36.3C16.2 36.3 15.8 35.8 15.8 35.3C15.8 34.7 16.2 34.3 16.8 34.3M63.7 34.3C64.3 34.3 64.7 34.7 64.7 35.3C64.7 35.8 64.3 36.3 63.7 36.3C63.2 36.3 62.8 35.8 62.8 35.3C62.8 34.7 63.2 34.3 63.7 34.3M14.2 30.7C14.7 30.7 15.2 31.1 15.2 31.7C15.2 32.2 14.7 32.7 14.2 32.7C13.6 32.7 13.2 32.2 13.2 31.7C13.2 31.1 13.6 30.7 14.2 30.7M66.3 30.7C66.8 30.7 67.3 31.1 67.3 31.7C67.3 32.2 66.8 32.7 66.3 32.7C65.7 32.7 65.3 32.2 65.3 31.7C65.3 31.1 65.7 30.7 66.3 30.7\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M69.3 15.8L74.9 15.8L74.9 10L80.5 10L80.5 15.8L86.2 15.8L86.2 21.6L80.5 21.6L80.5 27.3L74.9 27.3L74.9 21.6L69.3 21.6\"/><path fill=\"#FFFFFF\" d=\"M40.2 19.9H40.2V22.7H40.2ZM40.2 19.9C46.4 19.9 52.1 21.1 56.2 22.7L55.1 25.4C51.3 23.9 46 22.7 40.2 22.7L40.2 19.9M56.2 22.7C60.7 24.5 63.5 26.9 63.5 28.8L60.6 28.8C60.6 28.1 58.5 26.7 55.1 25.4L56.2 22.7M63.5 28.8L63.5 28.8L60.6 28.8L60.6 28.8L63.5 28.8L63.5 28.9L60.6 28.9L60.6 28.8L63.5 28.8M63.5 28.9L63.5 28.9L60.6 28.9L60.6 28.9L63.5 28.9C63.5 30.8 60.7 33.4 56.2 35.2L55.1 32.6C58.5 31.1 60.6 29.7 60.6 28.9L63.5 28.9M56.2 35.2C52.1 36.9 46.4 38.3 40.2 38.3L40.2 35.4C46 35.4 51.3 34.2 55.1 32.6L56.2 35.2M40.2 35.4H40.2V38.3H40.2ZM40.2 35.4H40.2V38.3H40.2ZM40.2 38.3C34 38.3 28.4 36.9 24.2 35.2L25.4 32.6C29.2 34.2 34.4 35.4 40.2 35.4L40.2 38.3M24.2 35.2C19.7 33.4 16.9 30.8 16.9 28.9L19.8 28.9C19.8 29.7 21.9 31.1 25.4 32.6L24.2 35.2M16.9 28.9L16.9 28.9L19.8 28.9L19.8 28.9L16.9 28.9L16.9 28.8L19.8 28.8L19.8 28.9L16.9 28.9M16.9 28.8L16.9 28.8L19.8 28.8L19.8 28.8L16.9 28.8C16.9 26.9 19.8 24.5 24.3 22.7L25.3 25.4C21.9 26.7 19.8 28.1 19.8 28.8L16.9 28.8M24.3 22.7C28.4 21.1 34 19.9 40.2 19.9L40.2 22.7C34.4 22.7 29.1 23.9 25.3 25.4L24.3 22.7M40.2 19.9L40.2 19.9L40.2 22.7L40.2 22.7\"/><path fill=\"#FFFFFF\" d=\"M40.2 20H40.2V22.9H40.2ZM40.2 20C42.3 20 44.1 20.8 45.5 22.2L43.5 24.2C42.6 23.4 41.5 22.9 40.2 22.9L40.2 20M45.5 22.2C46.8 23.5 47.7 25.4 47.7 27.4L44.8 27.4C44.8 26.2 44.3 25 43.5 24.2L45.5 22.2M47.7 27.4L47.7 27.4L44.8 27.4L44.8 27.4L47.7 27.4L47.7 27.4L44.8 27.4L44.8 27.4L47.7 27.4C47.7 29.5 46.8 31.4 45.5 32.7L43.5 30.7C44.3 29.8 44.8 28.7 44.8 27.4L47.7 27.4M45.5 32.7C44.1 34 42.3 34.9 40.2 34.9L40.2 32C41.5 32 42.6 31.5 43.5 30.7L45.5 32.7M40.2 32H40.2V34.9H40.2ZM40.2 32H40.2V34.9H40.2ZM40.2 34.9C38.2 34.9 36.3 34 35 32.7L37 30.7C37.8 31.5 39 32 40.2 32L40.2 34.9M35 32.7C33.6 31.4 32.8 29.5 32.8 27.4L35.6 27.4C35.6 28.7 36.2 29.8 37 30.7L35 32.7M32.8 27.4L32.8 27.4L35.6 27.4L35.6 27.4L32.8 27.4L32.8 27.4L35.6 27.4L35.6 27.4L32.8 27.4C32.8 25.4 33.6 23.5 35 22.2L37 24.2C36.2 25 35.6 26.2 35.6 27.4L32.8 27.4M35 22.2C36.3 20.8 38.2 20 40.2 20L40.2 22.9C39 22.9 37.8 23.4 37 24.2L35 22.2M40.2 20L40.2 20L40.2 22.9L40.2 22.9\"/><path fill=\"none\" stroke=\"#1F1A17\" stroke-width=\"1\" stroke-linejoin=\"round\" d=\"M2.7 2.7H93.4V93.4H2.7Z\"/></g>", "camilla": "<g transform=\"scale(1.04)\"><path fill=\"#009645\" fill-rule=\"evenodd\" d=\"M5.6 5.6L90.6 5.6L90.6 90.6L5.6 90.6\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M57 24.3L66.4 24.3L66.4 14.6L75.9 14.6L75.9 24.3L85.3 24.3L85.3 34L75.9 34L75.9 43.6L66.4 43.6L66.4 34L57 34\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M80.9 54.9L80.9 77.5L85.3 77.5L85.3 79.3L10.8 79.3L10.8 77.5L15.2 77.5L15.2 54.9L10.8 54.9L10.8 53.1L85.3 53.1L85.3 54.9\"/><path fill=\"#009645\" fill-rule=\"evenodd\" d=\"M51.4 56.1C52.9 56.1 53.6 56.8 53.6 58C53.6 59.3 52.9 60 51.4 60L36.1 60L36.1 60.9L72.9 60.9C74.5 60.9 75.2 61.7 75.2 63.2C75.2 64.8 74.5 65.6 72.9 65.6L51.1 65.6L51.1 66.8L72.9 66.8C74.5 66.8 75.2 67.6 75.2 69.2C75.2 70.7 74.5 71.5 72.9 71.5L36.1 71.5L36.1 72.4L51.4 72.4C52.9 72.4 53.6 73.1 53.6 74.3C53.6 75.6 52.9 76.3 51.4 76.3L33.8 76.3C31 76.3 29.6 74.5 29.6 71L29.6 61.3C29.6 57.9 31 56.1 33.8 56.1L51.4 56.1M20 66.2C20 63.7 22 61.7 24.5 61.7C26.9 61.7 29 63.7 29 66.2C29 68.7 26.9 70.7 24.5 70.7C22 70.7 20 68.7 20 66.2\"/><path fill=\"none\" stroke=\"#1F1A17\" stroke-width=\"1\" stroke-linejoin=\"round\" d=\"M2.7 2.7H93.4V93.4H2.7Z\"/></g>", "primeros-auxilios": "<g transform=\"scale(1.04)\"><path fill=\"#009645\" fill-rule=\"evenodd\" d=\"M5.6 5.6L90.6 5.6L90.6 90.6L5.6 90.6\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M37.4 37.4L16 37.4L16 58.8L37.4 58.8L37.4 80.2L58.8 80.2L58.8 58.8L80.2 58.8L80.2 37.4L58.8 37.4L58.8 16L37.4 16\"/><path fill=\"none\" stroke=\"#1F1A17\" stroke-width=\"1\" stroke-linejoin=\"round\" d=\"M2.7 2.7H93.4V93.4H2.7Z\"/></g>"};
