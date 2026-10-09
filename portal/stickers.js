/* OBRASST · los stickers del casco (los diseños, la vista previa y el PDF), para el portal.
   Lo arma armar.py desde stickers-base.js (el mismo de la app). No editar. */
/* ══════════════════════════════════════════════════════════════════
   LOS STICKERS DEL CASCO · lo común de la app y del portal (08/10/2026)

   Marcelo: «tanto en la web como en la app, tener la opción de escoger
   el diseño y así mismo editar qué información saldría en el sticker,
   puede ser diseño redondo, rectángulo el clásico, cuadrado, para
   adaptarse al casco exclusivamente o quizás a una tarjeta tamaño
   carnet, pero tendría que ser un poco pequeña para que calce bien…
   al menos 10 tipos de diseño… sacar en lote todos los stickers, o uno
   por uno» y «que la elaboración del sticker lo pueda previsualizar».

   · Doce diseños (STK_DISENOS), siete colores (STK_COLORES) y lo que va
     impreso (STK_CAMPOS). Los elige la obra (sst_estado «stickers»): lo
     que se elige en la app sale igual en la web, y al revés.
   · Cada sticker se describe UNA vez, en milímetros (stkUno: rectángulos,
     óvalos, trazos, textos —también en curva—, la foto, el logo y el QR
     en cuadritos), y de ahí salen la vista previa (stkSVG) y el PDF
     (stkPDF). La vista previa ES el sticker, no un parecido.
   · Lo que NUNCA se imprime: el documento del trabajador y su contacto
     personal de emergencia (Marcelo, 03/10). El grupo sanguíneo, solo de
     quien lo autorizó: si no, quien llama lo manda vacío y sale «sin dato».
   · El QR va en vectores (nítido en cualquier impresora) y nunca mide
     menos de 26 mm: lo que un celular lee a un palmo, con polvo.
   · El clásico (70 × 45 mm, diez por hoja) es el de siempre, medida por
     medida: el que ya imprimió su hoja no nota el cambio.
   No toca la pantalla ni el servidor: recibe datos, devuelve el dibujo.
   ══════════════════════════════════════════════════════════════════ */
var STK_VERSION = 1;
var STK_DISENOS = [
  { k:'clasico',    n:'Clásico',           f:'rect', w:70, h:45,   rr:3,   gx:12, gy:4.5, uso:'casco',
    d:'El de siempre: el QR a la izquierda; el grupo sanguíneo, su nombre y la emergencia de la obra a la derecha.' },
  { k:'compacto',   n:'Compacto',          f:'rect', w:60, h:37,   rr:2.5, gx:6,  gy:4,   uso:'casco',
    d:'El clásico, más chico: para cascos con poca parte lisa.' },
  { k:'vertical',   n:'Vertical',          f:'rect', w:46, h:74,   rr:3,   gx:5,  gy:4,   uso:'casco',
    d:'De pie: arriba el grupo sanguíneo, al medio el QR y abajo quién es. Para la nuca del casco.' },
  { k:'cuadrado',   n:'Cuadrado',          f:'rect', w:50, h:50,   rr:3,   gx:7,  gy:4,   uso:'casco',
    d:'El QR grande y el grupo sanguíneo en una columna roja al costado.' },
  { k:'cuadrado_g', n:'Cuadrado grande',   f:'rect', w:60, h:60,   rr:3.5, gx:5,  gy:4,   uso:'casco',
    d:'Con lugar para todo: su foto, su cargo, la vigencia y dos números de la obra.' },
  { k:'redondo',    n:'Redondo',           f:'circ', w:54, h:54,           gx:7,  gy:4,   uso:'casco',
    d:'Se adapta a la curva del casco sin arrugarse. El aviso va en el aro.' },
  { k:'redondo_g',  n:'Redondo grande',    f:'circ', w:64, h:64,           gx:4,  gy:4,   uso:'casco',
    d:'El redondo con el QR más grande y los números de la obra.' },
  { k:'ovalo',      n:'Óvalo',             f:'elip', w:80, h:52,           gx:8,  gy:4,   uso:'casco',
    d:'Ancho y sin esquinas: para el costado del casco.' },
  { k:'hexagono',   n:'Hexágono',          f:'hex',  w:64, h:55.4,         gx:4,  gy:4,   uso:'casco',
    d:'Arriba su nombre, al medio el QR y abajo el grupo sanguíneo con la emergencia.' },
  { k:'franja',     n:'Franja',            f:'rect', w:90, h:30,   rr:3,   gx:8,  gy:4,   uso:'casco',
    d:'Larga y baja: para la parte de atrás, sobre el ala del casco.' },
  { k:'fotocheck',  n:'Para el fotocheck', f:'rect', w:80, h:50,   rr:3,   gx:8,  gy:4,   uso:'carne',
    d:'Se pega en el reverso de un carné o fotocheck de 85,6 × 54 mm y deja casi 3 mm de borde.' },
  { k:'mini',       n:'Mínimo',            f:'rect', w:40, h:40,   rr:2.5, gx:6,  gy:4,   uso:'casco',
    d:'Solo el QR, el grupo sanguíneo y su nombre corto: para el casco con menos lugar.' }
];
/* los colores: la banda, lo que va escrito sobre ella, el acento y la tinta de los textos.
   El rojo del grupo sanguíneo no cambia con el color: es el de una emergencia. */
var STK_COLORES = [
  { k:'obrasst', n:'Azul noche',               band:[11,42,58],   bt:[255,255,255], ac:[245,183,0],   tin:[11,42,58] },
  { k:'rojo',    n:'Rojo emergencia',          band:[178,30,30],  bt:[255,255,255], ac:[255,224,130], tin:[122,20,20] },
  { k:'naranja', n:'Naranja alta visibilidad', band:[245,124,0],  bt:[22,22,22],    ac:[22,22,22],    tin:[150,62,0] },
  { k:'verde',   n:'Verde seguridad',          band:[0,110,60],   bt:[255,255,255], ac:[255,214,0],   tin:[0,92,50] },
  { k:'azul',    n:'Azul',                     band:[13,71,161],  bt:[255,255,255], ac:[255,214,0],   tin:[13,71,161] },
  { k:'negro',   n:'Negro y amarillo',         band:[24,24,24],   bt:[255,214,0],   ac:[255,255,255], tin:[24,24,24] },
  { k:'claro',   n:'Ahorra tinta',             band:[255,255,255], bt:[11,42,58],   ac:[11,42,58],    tin:[11,42,58], borde:[11,42,58], claro:true }
];
/* lo que puede ir impreso. «op»: las maneras de mostrarlo (el primero es el de fábrica) */
var STK_CAMPOS = [
  { k:'sangre', n:'Grupo sanguíneo',       d:'Solo de quien lo autorizó por escrito. Si no hay dato, dice «sin dato».' },
  { k:'nombre', n:'Nombre',                op:[['completo','Completo'], ['corto','Corto']], d:'Corto: su primer nombre y su primer apellido.' },
  { k:'cargo',  n:'Cargo' },
  { k:'sos',    n:'Emergencia de la obra', op:[[2,'Dos números'], [1,'Un número']], d:'Los primeros de «¿A quién acudo?»: la ambulancia, el supervisor SST, el brigadista…' },
  { k:'marca',  n:'En la banda',           op:[['obrasst','OBRASST'], ['empresa','La empresa'], ['logo','Su logo']], d:'Lo que va al lado del aviso.' },
  { k:'obra',   n:'La obra' },
  { k:'vence',  n:'Habilitado hasta' },
  { k:'sello',  n:'Capacitación al día',   d:'Solo de quien tiene el sello vigente en su credencial.' },
  { k:'habil',  n:'Habilitaciones',        d:'Altura, izaje, en caliente… las de su credencial.' },
  { k:'foto',   n:'Su foto' },
  { k:'texto',  n:'Un texto propio',       d:'Una línea corta, igual para todos (por ejemplo, «No retirar este sticker»).' }
];
var STK_LEYENDA = 'ESCANÉAME EN UNA EMERGENCIA';
/* nombres cortos de las habilitaciones de la credencial (en el sticker no entran los íconos) */
var STK_HABIL = { al:'Altura', an:'Andamios', iz:'Izaje', ec:'Espacios confinados', tc:'En caliente', el:'Eléctrico', ex:'Explosivos',
                  mq:'Maquinaria', bp:'Brigada · auxilios', bf:'Brigada · incendio', be:'Brigada · evacuación' };

function stkDiseno(k){ for(var i=0;i<STK_DISENOS.length;i++) if(STK_DISENOS[i].k===k) return STK_DISENOS[i]; return STK_DISENOS[0]; }
function stkColor(k){ for(var i=0;i<STK_COLORES.length;i++) if(STK_COLORES[i].k===k) return STK_COLORES[i]; return STK_COLORES[0]; }
function stkCampo(k){ for(var i=0;i<STK_CAMPOS.length;i++) if(STK_CAMPOS[i].k===k) return STK_CAMPOS[i]; return null; }
/* lo de fábrica: el clásico de siempre */
function stkCfgFabrica(){
  return { v:STK_VERSION, dis:'clasico', color:'obrasst', leyenda:STK_LEYENDA, texto:'',
           campos:{ sangre:1, nombre:'completo', cargo:1, sos:2, marca:'obrasst', obra:0, vence:0, sello:0, habil:0, foto:0, texto:0 } };
}
/* lo guardado (o lo que llegue), siempre completo y con valores que existen */
function stkCfg(x){
  var F=stkCfgFabrica(), o={ v:STK_VERSION, campos:{} };
  x=(x && typeof x==='object') ? x : {};
  o.dis=stkDiseno(x.dis).k; o.color=stkColor(x.color).k;
  var ley=String(x.leyenda==null ? F.leyenda : x.leyenda).replace(/\s+/g, ' ').trim().slice(0, 40);
  o.leyenda=ley || F.leyenda;
  o.texto=String(x.texto||'').replace(/\s+/g, ' ').trim().slice(0, 48);
  var c=(x.campos && typeof x.campos==='object') ? x.campos : {};
  STK_CAMPOS.forEach(function(K){
    var v=(c[K.k]===undefined) ? F.campos[K.k] : c[K.k];
    if(K.op){
      var ok=K.op.some(function(p){ return String(p[0])===String(v); });
      o.campos[K.k]=(!v || v==='0') ? 0 : (ok ? (typeof K.op[0][0]==='number' ? +v : String(v)) : F.campos[K.k] || K.op[0][0]);
    } else o.campos[K.k]=v ? 1 : 0;
  });
  if(o.campos.texto && !o.texto) o.campos.texto=0;
  if(x.ts) o.ts=+x.ts || 0;
  return o;
}
function stkIgual(a, b){ try{ var x=stkCfg(a), y=stkCfg(b); delete x.ts; delete y.ts; return JSON.stringify(x)===JSON.stringify(y); }catch(e){ return false; } }

/* ══ MEDIR Y PARTIR EL TEXTO (la letra del PDF: helvetica) ══════════ */
var STK_PT = 0.352778;          /* un punto, en milímetros */
var _STK_MED = null;
function stkAncho(t, tam, negrita){
  t=String(t==null ? '' : t); if(!t) return 0;
  try{
    if(typeof jspdf!=='undefined' && jspdf.jsPDF){
      if(!_STK_MED || !_STK_MED.doc) _STK_MED={ doc:new jspdf.jsPDF({ unit:'mm', format:'a4' }) };
      _STK_MED.doc.setFont('helvetica', negrita ? 'bold' : 'normal'); _STK_MED.doc.setFontSize(tam);
      return _STK_MED.doc.getTextWidth(t);
    }
  }catch(_j){}
  try{
    if(!_STK_MED || !_STK_MED.cx) _STK_MED={ cx:document.createElement('canvas').getContext('2d') };
    _STK_MED.cx.font=(negrita ? 'bold ' : '')+'100px Helvetica, Arial, sans-serif';
    return _STK_MED.cx.measureText(t).width/100*tam*STK_PT;
  }catch(_c){}
  return t.length*tam*STK_PT*(negrita ? 0.58 : 0.52);
}
function stkCorta(t, tam, negrita, max){
  t=String(t||'');
  if(!max || stkAncho(t, tam, negrita)<=max) return t;
  while(t.length>1 && stkAncho(t+'…', tam, negrita)>max) t=t.slice(0, -1);
  return t.replace(/[\s,·:]+$/, '')+'…';
}
/* el texto en un ancho: primero se achica la letra hasta «min»; si aún no entra, se corta con «…» */
function stkCabe(t, max, tam, min, negrita){
  t=String(t||''); min=min||tam;
  while(tam>min && stkAncho(t, tam, negrita)>max) tam=Math.round((tam-0.2)*100)/100;
  return { t:stkCorta(t, tam, negrita, max), tam:tam };
}
function stkPartir(t, tam, negrita, max, lineas){
  var pal=String(t||'').split(/\s+/).filter(Boolean), out=[], cur='';
  pal.forEach(function(w){
    var p=cur ? cur+' '+w : w;
    if(cur && stkAncho(p, tam, negrita)>max){ out.push(cur); cur=w; } else cur=p;
  });
  if(cur) out.push(cur);
  lineas=lineas || 2;
  if(out.length>lineas){ var resto=out.slice(lineas-1).join(' '); out=out.slice(0, lineas-1); out.push(stkCorta(resto, tam, negrita, max)); }
  return out.map(function(l){ return stkCorta(l, tam, negrita, max); });
}
/* «Ccori Huanca, Miguel Ángel» → «Miguel Ccori» (el padrón va «Apellidos, Nombres»); «De la Cruz Villanueva, Juan» →
   «Juan De la Cruz»: las partículas (de, la, del…) van con el apellido que les sigue */
var _STK_PART = { de:1, del:1, la:1, las:1, los:1, y:1, san:1, santa:1, da:1, das:1, 'do':1, dos:1, di:1, van:1, von:1, mc:1, mac:1 };
function _stkApellido(w){ var a=[]; for(var j=0;j<w.length;j++){ a.push(w[j]); if(!_STK_PART[w[j].toLowerCase()]) break; } return a.join(' '); }
function stkNombreCorto(n){
  n=String(n||'').replace(/\s+/g, ' ').trim(); if(!n) return '';
  var i=n.indexOf(',');
  if(i>0){ var no=n.slice(i+1).trim().split(' ')[0]; return ((no ? no+' ' : '')+_stkApellido(n.slice(0, i).trim().split(' '))).trim(); }
  var w=n.split(' ');
  return w.length<=2 ? n : (w[0]+' '+_stkApellido(w.slice(1)));
}
function stkFecha(iso){ var m=String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3]+'/'+m[2]+'/'+m[1] : ''; }
/* el grupo sanguíneo como se imprime: el signo menos con raya, que se ve (O– y no O-) */
function stkGrupo(s){ s=String(s||'').trim().toUpperCase().replace(/\s+/g, ''); return s.replace(/-$/, '–'); }

/* ══ EL QR, EN CUADRITOS (con el generador de la app: qrcode) ═════════ */
var _STK_QR = {}, _STK_QR_N = 0;
function stkQR(texto){
  texto=String(texto||'');
  if(_STK_QR[texto]) return _STK_QR[texto];
  var q=qrcode(0, 'M'); q.addData(texto); q.make();
  var n=q.getModuleCount(), filas=[];
  for(var r=0;r<n;r++){
    var tr=[], c=0;
    while(c<n){
      if(q.isDark(r, c)){ var c0=c; while(c<n && q.isDark(r, c)) c++; tr.push([c0, c-c0]); }
      else c++;
    }
    filas.push(tr);
  }
  if(++_STK_QR_N>400){ _STK_QR={}; _STK_QR_N=1; }
  return (_STK_QR[texto]={ n:n, filas:filas });
}
/* el tamaño del cuadrito de un QR de s milímetros (para saber si se va a leer) */
function stkModulo(texto, s){ try{ return s/stkQR(texto).n; }catch(e){ return 0; } }

/* ══ LAS FORMAS ═════════════════════════════════════════════════════ */
/* un arco de elipse en curvas de Bézier (de a 90° como mucho): para el PDF, que no sabe de arcos */
function _stkArco(cx, cy, rx, ry, a0, a1){
  var out=[], n=Math.max(1, Math.ceil(Math.abs(a1-a0)/(Math.PI/2))), da=(a1-a0)/n;
  for(var i=0;i<n;i++){
    var t0=a0+i*da, t1=t0+da, k=4/3*Math.tan((t1-t0)/4);
    var x0=cx+rx*Math.cos(t0), y0=cy+ry*Math.sin(t0), x1=cx+rx*Math.cos(t1), y1=cy+ry*Math.sin(t1);
    out.push(['C', x0-k*rx*Math.sin(t0), y0+k*ry*Math.cos(t0), x1+k*rx*Math.sin(t1), y1-k*ry*Math.cos(t1), x1, y1]);
  }
  return out;
}
/* el hexágono de lados arriba y abajo, dentro de w × h */
function _stkHexPts(x, y, w, h){ var q=w/4; return [[x+q, y], [x+w-q, y], [x+w, y+h/2], [x+w-q, y+h], [x+q, y+h], [x, y+h/2]]; }
/* la forma del sticker de un diseño, en su caja (0,0)-(w,h) → op */
function stkForma(D, p){
  p=p||{};
  if(D.f==='circ' || D.f==='elip') return { t:'e', cx:D.w/2, cy:D.h/2, rx:D.w/2, ry:D.h/2, f:p.f||null, s:p.s||null, sw:p.sw||0, dash:p.dash||null };
  if(D.f==='hex'){ var P=_stkHexPts(0, 0, D.w, D.h), d=[['M', P[0][0], P[0][1]]]; for(var i=1;i<P.length;i++) d.push(['L', P[i][0], P[i][1]]); d.push(['Z']);
    return { t:'p', d:d, f:p.f||null, s:p.s||null, sw:p.sw||0, dash:p.dash||null }; }
  return { t:'r', x:0, y:0, w:D.w, h:D.h, rr:D.rr||0, f:p.f||null, s:p.s||null, sw:p.sw||0, dash:p.dash||null };
}

/* ══ LA CAJA DE HERRAMIENTAS DE UN STICKER ══════════════════════════
   Las ops, en milímetros desde la esquina del sticker:
     r rectángulo {x,y,w,h,rr,f,s,sw,dash} · e elipse {cx,cy,rx,ry,…} · p trazo {d:[['M',x,y],['L',…],['C',…],['Z']],…}
     l línea {x,y,x2,y2,s,sw} · t texto {x,y,tx,tam (pt),b,c,al l|c|r} · tr texto girado {x,y,tx,tam,b,c,rot (° horario),w}
     q QR {x,y,s,tx,c} · i imagen {src,x,y,w,h,rr,circ,modo cubre|cabe,ini} · cb/ce recorte {forma} … fin · g grupo {dx,dy,ops} */
function _stkZ(it, cfg, ctx){
  var D=stkDiseno(cfg.dis), K=stkColor(cfg.color), C=cfg.campos, o=[], falta={};
  var Z={ D:D, K:K, C:C, it:it, ctx:ctx, cfg:cfg, ops:o,
    ROJO:[198,40,40], ROJO_CLARO:[253,236,236], GRIS:[85,95,104], GRIS2:[70,70,70], NEGRO:[25,25,25], BLANCO:[255,255,255], VERDE:[0,122,61] };
  function st(p){ p=p||{}; return { f:p.f||null, s:p.s||null, sw:p.sw||0, dash:p.dash||null }; }
  Z.R=function(x, y, w, h, p){ var s=st(p); s.t='r'; s.x=x; s.y=y; s.w=w; s.h=h; s.rr=(p && p.rr)||0; o.push(s); };
  Z.E=function(cx, cy, rx, ry, p){ var s=st(p); s.t='e'; s.cx=cx; s.cy=cy; s.rx=rx; s.ry=ry; o.push(s); };
  Z.P=function(d, p){ var s=st(p); s.t='p'; s.d=d; o.push(s); };
  Z.L=function(x, y, x2, y2, s, sw){ o.push({ t:'l', x:x, y:y, x2:x2, y2:y2, s:s, sw:sw }); };
  Z.T=function(tx, x, y, tam, p){ p=p||{}; tx=String(tx==null ? '' : tx); if(!tx) return; o.push({ t:'t', x:x, y:y, tx:tx, tam:tam, b:!!p.b, c:p.c||Z.NEGRO, al:p.al||'l' }); };
  Z.TR=function(tx, x, y, tam, rot, p){ p=p||{}; tx=String(tx==null ? '' : tx); if(!tx) return; o.push({ t:'tr', x:x, y:y, tx:tx, tam:tam, b:!!p.b, c:p.c||Z.NEGRO, rot:rot, w:stkAncho(tx, tam, !!p.b) }); };
  Z.Q=function(x, y, s, c){ o.push({ t:'q', x:x, y:y, s:s, tx:String(it.url||''), c:c||Z.NEGRO }); };
  Z.I=function(src, x, y, w, h, p){ p=p||{}; o.push({ t:'i', src:String(src||''), x:x, y:y, w:w, h:h, rr:p.rr||0, circ:!!p.circ, modo:p.modo||'cubre', ini:p.ini||'' }); };
  Z.recorte=function(forma){ o.push({ t:'cb', forma:forma }); };
  Z.finRecorte=function(){ o.push({ t:'ce' }); };
  Z.falta=function(k){ if(C[k]) falta[k]=1; };
  Z.faltan=function(){ return STK_CAMPOS.map(function(K){ return K.k; }).filter(function(k){ return falta[k]; }); };
  Z.cap=function(tam){ return tam*STK_PT*0.718; };          /* la altura de una mayúscula */
  Z.des=function(tam){ return tam*STK_PT*0.21; };           /* lo que baja una «p» */
  /* ── lo que se imprime ── */
  Z.nombre=function(){ if(!C.nombre) return ''; var n=String(it.n||'').replace(/\s+/g, ' ').trim(); return C.nombre==='corto' ? stkNombreCorto(n) : n; };
  /* el nombre que entra en un ancho: completo achicando la letra; si así no entra, el corto */
  Z.nombreEn=function(max, tam, min){
    var n=Z.nombre(); if(!n) return null;
    var r=stkCabe(n, max, tam, min, true);
    if(r.t!==n && C.nombre!=='corto'){ var c=stkNombreCorto(n); if(c && c!==n) r=stkCabe(c, max, tam, min, true); }
    return r;
  };
  Z.grupo=function(){ return C.sangre ? stkGrupo(it.s) : null; };            /* null: no va · '': sin dato */
  Z.sos=function(){ return C.sos ? (ctx.sos||[]).filter(function(x){ return x && String(x.tel||'').trim(); }).slice(0, C.sos) : []; };
  Z.extras=function(){
    var l=[];
    if(C.texto && cfg.texto) l.push({ k:'texto', tx:cfg.texto, b:true, c:K.tin });
    if(C.sello && it.sello) l.push({ k:'sello', tx:'CAPACITACIÓN AL DÍA · '+stkFecha(it.sello), b:true, c:Z.VERDE });
    if(C.vence && it.v) l.push({ k:'vence', tx:'HABILITADO HASTA '+stkFecha(it.v), b:true, c:K.tin });
    if(C.habil && it.h && it.h.length){ var hs=it.h.map(function(k){ return STK_HABIL[k]; }).filter(Boolean); if(hs.length) l.push({ k:'habil', tx:hs.join(' · '), b:false, c:Z.GRIS2 }); }
    var ob=String(ctx.obra||it.o||'').trim();
    if(C.obra && ob) l.push({ k:'obra', tx:ob, b:false, c:Z.GRIS });
    return l;
  };
  Z.marca=function(){
    var m=C.marca;
    /* 09/10/2026 · con su proporción (ctx.logoR, ancho/alto del logo ya sin su marco blanco): la caja se ajusta al logo */
    if(m==='logo' && ctx.logo) return { tipo:'logo', src:ctx.logo, r:(+ctx.logoR>0 ? Math.min(Math.max(+ctx.logoR, 0.5), 8) : 0) };
    if(m==='logo' || m==='empresa'){ var e=String(ctx.empresa||ctx.obra||'').trim(); return e ? { tipo:'txt', t:e } : { tipo:'txt', t:'OBRASST' }; }
    if(m==='obrasst') return { tipo:'txt', t:'OBRASST' };
    return { tipo:'' };
  };
  /* ── la banda de arriba: lo de la marca a la izquierda y el aviso a la derecha ── */
  Z.banda=function(x, y, w, h, p){
    p=p||{};
    var claro=!!K.claro;
    if(claro) Z.L(x+(p.rr||0)*0.3, y+h, x+w-(p.rr||0)*0.3, y+h, K.borde, 0.4);
    else if(p.rr){ Z.R(x, y, w, h, { f:K.band, rr:p.rr }); Z.R(x, y+h/2, w, h/2, { f:K.band }); if(p.izqRecta) Z.R(x, y, p.rr+0.5, h, { f:K.band }); }
    else Z.R(x, y, w, h, { f:K.band });
    var pad=p.pad||3, base=p.base||(y+h/2+Z.cap(p.tamL||5.6)/2), ley=cfg.leyenda, mk=p.sinMarca ? { tipo:'' } : Z.marca();
    var izq=x+pad;
    if(mk.tipo==='logo'){
      /* 09/10/2026 · Marcelo: «cuando coloco la opción de logo de la empresa, sale muy pequeño». Dos causas: el logo
         llegaba con su marco blanco de 312 × 312 (el logo de verdad era una franjita en medio) y la caja era chica. Ahora
         llega sin marco (logoSinMarco) y la caja usa casi todo el alto de la banda y hasta el 42 % de su ancho, ajustada
         a la proporción del logo: el aviso de la derecha se achica solo para dejarle sitio. */
      var lh=h-1.5, r=mk.r || 3, lw=Math.min(Math.max(lh*r, lh), w*0.42), lhi=Math.min(lh-0.7, lw/r);
      Z.R(izq-1, y+0.75, lw+2, lh, { f:Z.BLANCO, rr:1, s:claro ? K.borde : null, sw:claro ? 0.25 : 0 });
      Z.I(mk.src, izq-0.2, y+0.75+(lh-lhi)/2, lw+0.4, lhi, { modo:'cabe' });
      izq+=lw+2.6;
    } else if(mk.tipo==='txt'){
      var lmax=Math.min(stkAncho(ley, p.tamL||5.6, true), (w-2*pad)*0.66);
      var mr=stkCabe(mk.t, Math.max(8, w-2*pad-lmax-2.5), p.tamM||6, (p.tamM||6)*0.8, true);
      Z.T(mr.t, izq, base, mr.tam, { b:true, c:K.ac });
      izq+=stkAncho(mr.t, mr.tam, true)+2.5;
    }
    if(mk.tipo){
      var lr=stkCabe(ley, x+w-pad-izq, p.tamL||5.6, (p.tamL||5.6)*0.75, true);
      Z.T(lr.t, x+w-pad, base, lr.tam, { b:true, c:K.bt, al:'r' });
    } else {
      var lc=stkCabe(ley, w-2*pad, p.tamL||5.6, (p.tamL||5.6)*0.75, true);
      Z.T(lc.t, x+w/2, base, lc.tam, { b:true, c:K.bt, al:'c' });
    }
  };
  /* ── el grupo sanguíneo en su caja roja ──
     modo fila: «GRUPO / SANGUÍNEO» a la izquierda y el grupo grande a la derecha (el clásico)
     modo pila: «GRUPO SANGUÍNEO» arriba y el grupo grande abajo, centrados
     modo linea: «GRUPO» chico y el grupo, en una línea (para una pastilla angosta) */
  Z.sangreCaja=function(x, y, w, h, modo, tamV, p){
    p=p||{};
    var g=Z.grupo(); if(g===null) return false;
    var claro=!!K.claro, rr=(p.rr==null) ? 2 : p.rr, tl=p.tamL||4.2;
    var txt=claro ? Z.ROJO : Z.BLANCO;
    if(!g){
      Z.R(x, y, w, h, { s:Z.ROJO, sw:0.3, rr:rr });
      var sd=stkCabe(modo==='linea' || w<26 ? 'SIN DATO' : 'SANGRE: SIN DATO', w-2, p.tamSD||6, 3.6, true);
      Z.T(sd.t, x+w/2, y+h*0.5+Z.cap(sd.tam)/2+(modo==='fila' ? 0.44*h/9.6 : 0), sd.tam, { b:true, c:Z.ROJO, al:'c' });
      return true;
    }
    if(p.forma) Z.P(p.forma, claro ? { s:Z.ROJO, sw:0.35 } : { f:Z.ROJO });
    else Z.R(x, y, w, h, claro ? { s:Z.ROJO, sw:0.35, rr:rr } : { f:Z.ROJO, rr:rr });
    if(modo==='fila'){
      var k=tl/4.2;
      Z.T('GRUPO', x+2.2*k, y+h/2-0.7*k, tl, { b:true, c:txt });
      Z.T('SANGUÍNEO', x+2.2*k, y+h/2+1.7*k, tl, { b:true, c:txt });
      var gv=stkCabe(g, w-2.6-2.2*k-stkAncho('SANGUÍNEO', tl, true)-1.5, tamV, tamV*0.7, true);
      Z.T(gv.t, x+w-2.6, y+h/2+Z.cap(gv.tam)*0.59, gv.tam, { b:true, c:txt, al:'r' });
    } else if(modo==='pila'){
      var lab=stkCabe('GRUPO SANGUÍNEO', w-2, tl, tl*0.8, true), gp=stkCabe(g, w-2, tamV, tamV*0.7, true);
      var alto=Z.cap(lab.tam)+1.1+Z.cap(gp.tam), y1=y+(h-alto)/2+Z.cap(lab.tam);
      Z.T(lab.t, x+w/2, y1, lab.tam, { b:true, c:txt, al:'c' });
      Z.T(gp.t, x+w/2, y1+1.1+Z.cap(gp.tam), gp.tam, { b:true, c:txt, al:'c' });
    } else if(modo==='col'){
      /* columna alta y angosta: «GRUPO», «SANGUÍNEO» arriba y el grupo grande al medio */
      var l1=stkCabe('GRUPO', w-2, tl, tl*0.75, true), l2=stkCabe('SANGUÍNEO', w-2, tl, tl*0.7, true);
      Z.T(l1.t, x+w/2, y+2.4+Z.cap(l1.tam), l1.tam, { b:true, c:txt, al:'c' });
      Z.T(l2.t, x+w/2, y+2.4+Z.cap(l1.tam)+1.2+Z.cap(l2.tam), l2.tam, { b:true, c:txt, al:'c' });
      var gc=stkCabe(g, w-1.6, tamV, tamV*0.6, true);
      Z.T(gc.t, x+w/2, y+h*0.62+Z.cap(gc.tam)/2, gc.tam, { b:true, c:txt, al:'c' });
    } else {
      var lbl=p.etiqueta==null ? 'GRUPO' : p.etiqueta, gl=stkCabe(g, w*0.6, tamV, tamV*0.7, true);
      var wl=lbl ? stkAncho(lbl, tl, true) : 0, wg=stkAncho(gl.t, gl.tam, true), sep=lbl ? 1.1 : 0;
      if(wl+sep+wg>w-1.6){ lbl=''; wl=0; sep=0; }
      var x1=x+(w-(wl+sep+wg))/2, bl=y+h/2+Z.cap(gl.tam)/2;
      if(lbl) Z.T(lbl, x1, bl, tl, { b:true, c:txt });
      Z.T(gl.t, x1+wl+sep, bl, gl.tam, { b:true, c:txt });
    }
    return true;
  };
  /* ── los números de emergencia de la obra, en su recuadro (el del clásico, a la escala de h) ── */
  Z.sosCaja=function(x, y, w, h){
    var S=Z.sos(); if(!S.length) return false;
    var claro=!!K.claro, s=h/10.6;
    Z.R(x, y, w, h, claro ? { s:Z.ROJO, sw:0.25, rr:1.6*s } : { f:Z.ROJO_CLARO, s:Z.ROJO, sw:0.25, rr:1.6*s });
    Z.T('EMERGENCIA EN OBRA', x+1.6, y+2.5*s, Math.max(3.4, 4.3*s), { b:true, c:Z.ROJO });
    if(S.length===1){
      var e1=stkCabe(S[0].t, w-3.2, 4.8*s, 4*s), n1=stkCabe(S[0].tel, w-3.2, 9.4*s, 6*s, true);
      Z.T(e1.t, x+1.6, y+5.2*s, e1.tam, { c:Z.GRIS2 });
      Z.T(n1.t, x+1.6, y+9.2*s, n1.tam, { b:true, c:Z.NEGRO });
    } else {
      S.slice(0, 2).forEach(function(s2, j){
        var ly=y+(5.7+j*3.6)*s, num=stkCabe(s2.tel, w-3.2, 6.9*s, 5.2*s, true), wn=stkAncho(num.t, num.tam, true);
        Z.T(num.t, x+w-1.6, ly, num.tam, { b:true, c:Z.NEGRO, al:'r' });
        var hueco=w-3.2-wn-1;
        if(hueco>5){ var et=stkCabe(s2.t, hueco, 4.9*s, 4*s); Z.T(et.t, x+1.6, ly-0.15*s, et.tam, { c:Z.GRIS2 }); }
      });
    }
    return true;
  };
  /* ── los números en tira: «EMERGENCIA EN OBRA» y uno o dos números lado a lado ── */
  Z.sosTira=function(x, y, w, h){
    var S=Z.sos(); if(!S.length) return false;
    var claro=!!K.claro;
    Z.R(x, y, w, h, claro ? { s:Z.ROJO, sw:0.25, rr:1.4 } : { f:Z.ROJO_CLARO, s:Z.ROJO, sw:0.25, rr:1.4 });
    var tt=Math.min(4, h*0.5);
    Z.T('EMERGENCIA EN OBRA', x+1.5, y+0.9+Z.cap(tt), tt, { b:true, c:Z.ROJO });
    var cw=(w-3)/S.length;
    S.forEach(function(s2, j){
      var cx=x+1.5+j*cw, num=stkCabe(s2.tel, cw-1, Math.min(7, h*0.95), 4.6, true), et=stkCabe(s2.t, cw-1, 3.8, 3.2);
      var base=y+h-1.1;
      var wn=stkAncho(num.t, num.tam, true);
      if(stkAncho(et.t, et.tam)+1+wn<=cw-0.6 && h<7.2){
        Z.T(et.t, cx, base-0.1, et.tam, { c:Z.GRIS2 });
        Z.T(num.t, cx+cw-1, base, num.tam, { b:true, c:Z.NEGRO, al:'r' });
      } else {
        if(h>=7.2) Z.T(et.t, cx, y+0.9+Z.cap(tt)+1+Z.cap(et.tam), et.tam, { c:Z.GRIS2 });
        Z.T(num.t, cx, base, num.tam, { b:true, c:Z.NEGRO });
      }
    });
    return true;
  };
  /* ── los números en una línea suelta: «EMERGENCIA 106 · 999 111 222» ── */
  Z.sosLinea=function(x, base, w, tam, al, p){
    p=p||{};
    var S=Z.sos(); if(!S.length) return false;
    var lab=p.etiqueta==null ? 'EMERGENCIA' : p.etiqueta, nums=S.map(function(s2){ return String(s2.tel).trim(); }).join(' · ');
    var conEt=S.map(function(s2){ return s2.t+' '+String(s2.tel).trim(); }).join(' · ');
    var tl=tam*0.8, wl=lab ? stkAncho(lab, tl, true)+1.2 : 0;
    var txt=(p.conEtiquetas && stkAncho(conEt, tam*0.86, true)<=w-wl) ? conEt : nums;
    var tt=txt===conEt ? tam*0.86 : tam;
    var r=stkCabe(txt, w-wl, tt, tam*0.72, true);
    if(r.t!==txt && S.length>1 && txt===nums){ r=stkCabe(String(S[0].tel).trim(), w-wl, tam, tam*0.72, true); }
    var total=wl+stkAncho(r.t, r.tam, true);
    var x1=(al==='c') ? x+(w-total)/2 : (al==='r' ? x+w-total : x);
    if(lab) Z.T(lab, x1, base, tl, { b:true, c:p.cLab||Z.ROJO });
    Z.T(r.t, x1+wl, base, r.tam, { b:true, c:p.c||Z.NEGRO });
    return true;
  };
  /* ── texto en curva, sobre una elipse (o un círculo): arriba se lee de izquierda a derecha por fuera,
     abajo también, por dentro. rx, ry: la línea de base. Devuelve el tamaño con que entró (0 si nada) ── */
  Z.curva=function(tx, cx, cy, rx, ry, tam, p){
    p=p||{}; tx=String(tx||'').trim(); if(!tx) return 0;
    var b=!!p.b, ls=p.ls||0, abajo=!!p.abajo, arco=p.arco||150;
    /* el largo de la elipse, en una tabla: así cada letra cae a su distancia */
    var N=720, T=[], acc=0, px=null, py=null;
    for(var i=0;i<=N;i++){
      var t=-Math.PI+2*Math.PI*i/N, X=cx+rx*Math.cos(t), Y=cy+ry*Math.sin(t);
      if(px!==null) acc+=Math.sqrt((X-px)*(X-px)+(Y-py)*(Y-py));
      T.push([t, acc]); px=X; py=Y;
    }
    var Lt=acc;
    function sDe(t){ while(t<-Math.PI) t+=2*Math.PI; while(t>Math.PI) t-=2*Math.PI; var f=(t+Math.PI)/(2*Math.PI)*N, i0=Math.floor(f), i1=Math.min(N, i0+1); return T[i0][1]+(T[i1][1]-T[i0][1])*(f-i0); }
    function tDe(s){ while(s<0) s+=Lt; while(s>Lt) s-=Lt; var a=0, z=N; while(z-a>1){ var m=(a+z)>>1; if(T[m][1]<s) a=m; else z=m; } var d=T[z][1]-T[a][1]; return T[a][0]+(T[z][0]-T[a][0])*(d ? (s-T[a][1])/d : 0); }
    var tc=(p.centro!=null ? p.centro : (abajo ? 90 : -90))*Math.PI/180, sc=sDe(tc);
    /* lo que entra en el arco pedido (en grados alrededor del centro) */
    var max=Math.abs(sDe(tc+arco/2*Math.PI/180)-sDe(tc-arco/2*Math.PI/180));
    if(max>Lt/2) max=Lt-max;
    var n=Array.from(tx).length, r=stkCabe(tx, max-ls*Math.max(0, n-1), tam, p.min||tam*0.78, b);
    var chars=Array.from(r.t), ws=chars.map(function(ch){ return stkAncho(ch, r.tam, b); });
    var total=ws.reduce(function(a, w){ return a+w; }, 0)+ls*Math.max(0, chars.length-1);
    var dir=abajo ? -1 : 1, s=sc-dir*total/2;
    chars.forEach(function(ch, j){
      var sm=s+dir*ws[j]/2, t=tDe(sm), X=cx+rx*Math.cos(t), Y=cy+ry*Math.sin(t);
      var dx=-rx*Math.sin(t), dy=ry*Math.cos(t), L=Math.sqrt(dx*dx+dy*dy)||1; dx/=L; dy/=L;
      if(abajo){ dx=-dx; dy=-dy; }
      if(ch!==' ') o.push({ t:'tr', x:X-dx*ws[j]/2, y:Y-dy*ws[j]/2, tx:ch, tam:r.tam, b:b, c:p.c||Z.NEGRO, rot:Math.atan2(dy, dx)*180/Math.PI, w:ws[j] });
      s+=dir*(ws[j]+ls);
    });
    return r.tam;
  };
  /* ── una pila de renglones en una columna: cada uno entra o no entra (y lo que no entra, se anota) ── */
  Z.pila=function(x, y, w, yMax, al){
    var P={ y:y };
    P.linea=function(tx, tam, q){
      q=q||{}; if(!tx) return true;
      var top=P.y+(q.antes||0), base=top+Z.cap(tam);
      if(base+Z.des(tam)>yMax+0.05) return false;
      var r=q.sinAchicar ? { t:stkCorta(tx, tam, q.b, w), tam:tam } : stkCabe(tx, w, tam, q.min||tam*0.82, q.b);
      Z.T(r.t, al==='c' ? x+w/2 : (al==='r' ? x+w : x), base, r.tam, { b:q.b, c:q.c, al:al });
      P.y=base+(q.paso!=null ? q.paso-Z.cap(tam) : tam*STK_PT*0.45+(q.despues||0));
      return true;
    };
    /* un texto que puede ocupar varios renglones */
    P.parrafo=function(tx, tam, lineas, q){
      q=q||{}; if(!tx) return true;
      var L=stkPartir(tx, tam, q.b, w, lineas||2), puso=0;
      for(var i=0;i<L.length;i++){ if(!P.linea(L[i], tam, Object.assign({}, q, { sinAchicar:true, antes:i ? 0 : q.antes }))) break; puso++; }
      return puso>0;
    };
    P.extras=function(tam, q){
      Z.extras().forEach(function(e){ if(!P.parrafo(e.tx, tam, e.k==='habil' ? 2 : 1, Object.assign({ b:e.b, c:e.c }, q||{}))) Z.falta(e.k); });
    };
    return P;
  };
  return Z;
}

/* ══ LOS DOCE DISEÑOS ═══════════════════════════════════════════════
   Cada uno dibuja con la caja de herramientas (Z) en su propia caja de w × h mm. Lo que el usuario
   prendió y no entra en el diseño se anota (Z.falta): la pantalla lo dice («en este diseño no entra…»). */
var STK_LAY = {};
function _stkIni(n){ var p=String(n||'').replace(/,/g, ' ').split(/\s+/).filter(Boolean); return ((p[0]||'?')[0]+((p.length>1 ? p[p.length-1] : '')[0]||'')).toUpperCase(); }
/* 1 · el clásico: el de siempre, medida por medida */
STK_LAY.clasico=function(Z){
  var K=Z.K, it=Z.it, C=Z.C;
  Z.banda(0, 0, 70, 8, { rr:3, tamM:6, tamL:5.6, base:5.3, pad:3 });
  Z.Q(2.5, 10, 32);
  var rx=37, RW=30.5, S=Z.sos(), sosTop=S.length ? 32.4 : 43.2;
  var yy=Z.sangreCaja(rx, 10, RW, 9.6, 'fila', 16) ? 23.6 : 12.1;
  var n=Z.nombre();
  if(n){
    var L=stkPartir(n, 6.6, true, RW, 99), lin;
    if(L.length>2){ var r2=stkCabe(L.slice(1).join(' '), RW, 6.6, 5.6, true); lin=[{ t:L[0], tam:6.6 }, { t:r2.t, tam:r2.tam }]; }
    else lin=L.map(function(t){ return { t:t, tam:6.6 }; });
    lin.forEach(function(l){ Z.T(l.t, rx, yy, l.tam, { b:true, c:K.tin }); yy+=2.75; });
  }
  if(C.cargo && it.c){
    if(yy+0.1+0.4<=sosTop){ var cr=stkCabe(it.c, RW, 5.4, 4.6); Z.T(cr.t, rx, yy+0.1, cr.tam, { c:Z.GRIS }); yy+=2.6; }
    else Z.falta('cargo');
  }
  Z.pila(rx, yy-Z.cap(4.6)+0.3, RW, sosTop-0.5, 'l').extras(4.6);
  Z.sosCaja(rx, 32.4, RW, 10.6);
  Z.falta('foto');
};
/* 2 · compacto: el clásico en 60 × 37 */
STK_LAY.compacto=function(Z){
  var K=Z.K, it=Z.it;
  Z.banda(0, 0, 60, 6.6, { rr:2.5, tamM:5, tamL:4.7, base:4.45, pad:2.5 });
  Z.Q(2, 8.4, 26.6);
  var rx=31, RW=27, S=Z.sos(), hS=S.length===2 ? 8.6 : 7.2, sosTop=S.length ? 35-hS : 35.4;
  var top=Z.sangreCaja(rx, 8.4, RW, 8.2, 'fila', 13.5, { tamL:3.6, rr:1.8 }) ? 18.1 : 8.4;
  var P=Z.pila(rx, top, RW, sosTop-0.5, 'l'), n=Z.nombre();
  if(n && !P.parrafo(n, 5.8, 2, { b:true, c:K.tin })) Z.falta('nombre');
  if(Z.C.cargo && it.c && !P.linea(it.c, 4.8, { c:Z.GRIS, min:4.2 })) Z.falta('cargo');
  P.extras(4.2);
  if(S.length) Z.sosCaja(rx, sosTop, RW, hS);
  Z.falta('foto');
};
/* 3 · vertical: el grupo arriba, el QR al medio, quién es abajo */
STK_LAY.vertical=function(Z){
  var K=Z.K, it=Z.it, W=46, mk=Z.marca();
  if(K.claro) Z.L(1, 10, W-1, 10, K.borde, 0.4); else { Z.R(0, 0, W, 10, { f:K.band, rr:3 }); Z.R(0, 5, W, 5, { f:K.band }); }
  if(mk.tipo==='logo'){
    /* 09/10/2026 · más grande: hasta 34 × 5,4 mm, ajustada a la proporción del logo */
    var vr=mk.r || 3, vh=5.4, vw=Math.min(Math.max(vh*vr, vh), W-12);
    Z.R(W/2-vw/2-0.8, 0.8, vw+1.6, vh+0.4, { f:Z.BLANCO, rr:0.8 }); Z.I(mk.src, W/2-vw/2, 1, vw, vh, { modo:'cabe' });
  }
  else if(mk.tipo==='txt'){ var m=stkCabe(mk.t, W-6, 4.6, 3.8, true); Z.T(m.t, W/2, 4.3, m.tam, { b:true, c:K.ac, al:'c' }); }
  var ly=stkCabe(Z.cfg.leyenda, W-4, 4.6, 3.4, true);
  Z.T(ly.t, W/2, mk.tipo==='logo' ? 8.75 : (mk.tipo ? 8.3 : 6.4), ly.tam, { b:true, c:K.bt, al:'c' });
  var y=11.5;
  if(Z.sangreCaja(2.5, y, W-5, 10.5, 'fila', 19, { tamL:4.4 })) y+=12;
  Z.Q(6.5, y, 33); y+=33;
  var S=Z.sos(), hS=S.length===2 ? 9.2 : 7.6, sosTop=S.length ? 72-hS : 72.4;
  var P=Z.pila(2.5, y+1.2, W-5, sosTop-0.5, 'c'), n=Z.nombre();
  if(n && !P.parrafo(n, 6.2, 2, { b:true, c:K.tin })) Z.falta('nombre');
  if(Z.C.cargo && it.c && !P.linea(it.c, 5, { c:Z.GRIS, min:4.2 })) Z.falta('cargo');
  P.extras(4.4);
  if(S.length) Z.sosCaja(2.5, sosTop, W-5, hS);
  Z.falta('foto');
};
/* 4 · cuadrado: el QR grande y el grupo en una columna roja */
STK_LAY.cuadrado=function(Z){
  var K=Z.K, it=Z.it, g=Z.grupo();
  Z.banda(0, 0, 50, 7.4, { rr:3, tamM:5.2, tamL:4.6, base:4.9, pad:2.5 });
  Z.Q(g===null ? 9.8 : 2.5, 9.2, 30.4);
  if(g!==null) Z.sangreCaja(35.2, 9.2, 12.3, 30.4, 'col', 15, { tamL:3.4, rr:1.8 });
  var P=Z.pila(2.5, 41, 45, 48.5, 'l');
  var nm=Z.nombreEn(45, 6.4, 5.2);
  if(nm && !P.linea(nm.t, nm.tam, { b:true, c:K.tin, sinAchicar:true })) Z.falta('nombre');
  if(Z.sos().length){
    var base=P.y+Z.cap(5);
    if(base+Z.des(5)<=48.6){ Z.sosLinea(2.5, base, 45, 5, 'l', { conEtiquetas:true }); P.y=base+1; } else Z.falta('sos');
  }
  if(Z.C.cargo && it.c && !P.linea(it.c, 4.6, { c:Z.GRIS, min:4 })) Z.falta('cargo');
  P.extras(4.2);
  Z.falta('foto');
};
/* 5 · cuadrado grande: con lugar para la foto, la vigencia y dos números de la obra */
STK_LAY.cuadrado_g=function(Z){
  var K=Z.K, it=Z.it, C=Z.C;
  Z.banda(0, 0, 60, 8.4, { rr:3.5, tamM:5.8, tamL:5.1, base:5.55, pad:3 });
  Z.Q(2.5, 10.4, 34);
  var cx=39, cw=18.5, y=10.4, sola=!C.foto && !Z.extras().length;
  if(sola) Z.sangreCaja(cx, y, cw, 34, 'col', 22, { tamL:3.8, rr:2 });
  else if(Z.sangreCaja(cx, y, cw, 13.6, 'pila', 20, { tamL:3.4, rr:2 })) y+=15.2;
  if(C.foto){
    var fh=Math.min(44.4-y, 21.3), fw=fh*0.75;
    if(fh>=14){ Z.I(it.foto, cx+(cw-fw)/2, y, fw, fh, { rr:1.4, ini:_stkIni(it.n) }); y+=fh+1.4; } else Z.falta('foto');
  }
  /* lo demás (vigencia, sello, habilitaciones, texto), en la columna; si no entra, abajo */
  var Pc=Z.pila(cx, y, cw, 44.4, 'l'), resto=[];
  Z.extras().forEach(function(e){ if(!Pc.parrafo(e.tx, 4.2, 3, { b:e.b, c:e.c })) resto.push(e); });
  var S=Z.sos(), tira=S.length ? 7.4 : 0, sosTop=58-tira;
  var P=Z.pila(2.5, 45.4, 55, sosTop-0.5, 'l'), n=Z.nombre();
  if(n && !P.parrafo(n, 7, 2, { b:true, c:K.tin })) Z.falta('nombre');
  if(C.cargo && it.c && !P.linea(it.c, 5.2, { c:Z.GRIS, min:4.4 })) Z.falta('cargo');
  resto.forEach(function(e){ if(!P.parrafo(e.tx, 4.4, 1, { b:e.b, c:e.c })) Z.falta(e.k); });
  if(S.length) Z.sosTira(2.5, sosTop, 55, tira);
};
/* 6 y 7 · redondos: el aviso en el aro de arriba, los números de la obra en el de abajo,
   el grupo sanguíneo arriba del QR y su nombre abajo */
function _stkRedondo(Z, a, q, tamC, pill){
  var K=Z.K, it=Z.it, C=Z.C, R=Z.D.w/2, ri=R-a, claro=!!K.claro;
  if(claro){ Z.E(R, R, R-0.3, R-0.3, { s:K.borde, sw:0.5 }); Z.E(R, R, ri, ri, { s:K.borde, sw:0.35 }); }
  else { Z.E(R, R, R, R, { f:K.band }); Z.E(R, R, ri, ri, { f:Z.BLANCO }); }
  var tc=tamC, tcol=claro ? K.tin : K.bt;
  Z.curva(Z.cfg.leyenda, R, R, ri+(a-Z.cap(tc))/2, ri+(a-Z.cap(tc))/2, tc, { b:true, c:tcol, arco:150 });
  var S=Z.sos(), rb=ri+(a+Z.cap(tc))/2, enAro='';
  if(S.length){
    var largo='EMERGENCIA: '+S.map(function(s){ return s.t+' '+String(s.tel).trim(); }).join(' · '), corto='EMERGENCIA: '+S.map(function(s){ return String(s.tel).trim(); }).join(' · ');
    var maxA=2*Math.PI*rb*150/360;
    enAro=(stkAncho(largo, tc*0.82, true)<=maxA) ? largo : corto;
    Z.curva(enAro, R, R, rb, rb, tc, { b:true, c:tcol, abajo:true, arco:150, min:tc*0.7 });
  }
  /* el QR, un poco abajo del centro: arriba va la pastilla del grupo */
  var qy=R-q/2+pill.dy;
  Z.Q(R-q/2, qy, q);
  if(Z.grupo()!==null){
    var ph=pill.h, py=qy-1-ph, pw=pill.w;
    Z.sangreCaja(R-pw/2, py, pw, ph, 'linea', pill.tam, { tamL:pill.tl, rr:ph/2 });
  }
  /* abajo del QR: lo que entra en la cuerda de cada renglón */
  var y=qy+q+0.9, nombre=Z.nombre(), puso=false;
  function ancho(base){ var dy=Math.abs(base+0.4-R); return dy>=ri ? 0 : 2*(Math.sqrt(ri*ri-dy*dy)-0.9); }
  function renglon(tx, tam, q2){
    var base=y+Z.cap(tam), w=ancho(base);
    if(w<8 || base+Z.des(tam)>R+ri-0.8) return false;
    var r=(q2 && q2.nombre) ? Z.nombreEn(w, tam, tam*0.8) : stkCabe(tx, w, tam, tam*0.8, q2 && q2.b);
    if(!r) return false;
    Z.T(r.t, R, base, r.tam, { b:q2 && q2.b, c:(q2 && q2.c)||K.tin, al:'c' });
    y=base+tam*STK_PT*0.42; return true;
  }
  if(nombre){
    if(!S.length && C.nombre){
      /* sin números de la obra, el nombre va en el aro de abajo */
      Z.curva(nombre, R, R, rb, rb, tc, { b:true, c:tcol, abajo:true, arco:150, min:tc*0.7 }); puso=true;
    } else puso=renglon(nombre, pill.tamN, { b:true, nombre:true });
    if(!puso) Z.falta('nombre');
  }
  if(C.cargo && it.c && !renglon(it.c, pill.tamN*0.78, { c:Z.GRIS })) Z.falta('cargo');
  Z.extras().forEach(function(e){ if(!renglon(e.tx, pill.tamN*0.72, { b:e.b, c:e.c })) Z.falta(e.k); });
  if(C.marca==='logo' || C.marca==='empresa') Z.falta('marca');
  Z.falta('foto');
}
STK_LAY.redondo=function(Z){ _stkRedondo(Z, 5.8, 26, 5, { w:16, h:5.6, dy:1.2, tam:9.5, tl:3.2, tamN:5.4 }); };
STK_LAY.redondo_g=function(Z){ _stkRedondo(Z, 6.4, 30, 5.6, { w:19, h:6.2, dy:-0.8, tam:11.5, tl:3.6, tamN:6.2 }); };
/* 8 · óvalo: el aviso y los números en el aro; el QR a la izquierda y quién es a la derecha */
STK_LAY.ovalo=function(Z){
  var K=Z.K, it=Z.it, C=Z.C, cx=40, cy=26, a=4.2, rx=40-a, ry=26-a, claro=!!K.claro, tc=4.8, tcol=claro ? K.tin : K.bt;
  if(claro){ Z.E(cx, cy, 39.7, 25.7, { s:K.borde, sw:0.5 }); Z.E(cx, cy, rx, ry, { s:K.borde, sw:0.35 }); }
  else { Z.E(cx, cy, 40, 26, { f:K.band }); Z.E(cx, cy, rx, ry, { f:Z.BLANCO }); }
  var off=(a-Z.cap(tc))/2;
  Z.curva(Z.cfg.leyenda, cx, cy, rx+off, ry+off, tc, { b:true, c:tcol, arco:120 });
  var S=Z.sos();
  if(S.length){
    var rb=(a+Z.cap(tc))/2, largo='EMERGENCIA: '+S.map(function(s){ return s.t+' '+String(s.tel).trim(); }).join(' · '),
        corto='EMERGENCIA: '+S.map(function(s){ return String(s.tel).trim(); }).join(' · ');
    Z.curva(stkAncho(largo, tc*0.82, true)<=62 ? largo : corto, cx, cy, rx+rb, ry+rb, tc, { b:true, c:tcol, abajo:true, arco:120, min:tc*0.7 });
  }
  Z.Q(14, 13, 26);
  var x=42.5, y=14.5;
  if(Z.sangreCaja(x, y, 23, 7.4, 'fila', 13, { tamL:3.4, rr:1.8 })) y+=9;
  /* el ancho de cada renglón: hasta el borde de adentro del óvalo */
  function hasta(base){ var dy=(base-cy)/ry; return dy*dy>=1 ? x : cx+rx*Math.sqrt(1-dy*dy)-1.6; }
  function renglon(tx, tam, q2){
    var base=y+Z.cap(tam), w=hasta(base+0.5)-x;
    if(w<10 || base+Z.des(tam)>cy+ry*0.82) return false;
    var r=stkCabe(tx, w, tam, tam*0.82, q2.b);
    Z.T(r.t, x, base, r.tam, { b:q2.b, c:q2.c }); y=base+tam*STK_PT*0.45; return true;
  }
  var n=Z.nombre();
  if(n){ var L=stkPartir(n, 6.2, true, hasta(y+3)-x, 2), ok=false; L.forEach(function(l){ ok=renglon(l, 6.2, { b:true, c:K.tin }) || ok; }); if(!ok) Z.falta('nombre'); }
  if(C.cargo && it.c && !renglon(it.c, 4.9, { c:Z.GRIS })) Z.falta('cargo');
  Z.extras().forEach(function(e){ if(!renglon(e.tx, 4.3, { b:e.b, c:e.c })) Z.falta(e.k); });
  if(C.marca==='logo' || C.marca==='empresa') Z.falta('marca');
  Z.falta('foto');
};
/* 9 · hexágono: su nombre en la banda de arriba, el QR al medio y abajo el grupo con la emergencia */
STK_LAY.hexagono=function(Z){
  var K=Z.K, it=Z.it, C=Z.C, W=64, H=55.4, q=W/4, m=q/(H/2), claro=!!K.claro;
  function xi(y){ return (y<=H/2) ? q-y*m : q-(H-y)*m; }
  var yb=10.6, n=Z.nombre(), ley=Z.cfg.leyenda;
  Z.P([['M', q, 0], ['L', W-q, 0], ['L', W-xi(yb), yb], ['L', xi(yb), yb], ['Z']], claro ? { s:K.borde, sw:0.4 } : { f:K.band });
  var tcol=claro ? K.tin : K.bt;
  if(n){
    var L=stkPartir(n, 6.2, true, 38, 2);
    if(L.length===1) Z.T(L[0], W/2, 6.9, 6.2, { b:true, c:tcol, al:'c' });
    else { Z.T(L[0], W/2, 4.9, 5.8, { b:true, c:tcol, al:'c' }); Z.T(stkCorta(L[1], 5.8, true, 40), W/2, 8.2, 5.8, { b:true, c:tcol, al:'c' }); }
    var lr=stkCabe(ley, 40, 4.2, 3.4, true);
    Z.T(lr.t, W/2, 13.5, lr.tam, { b:true, c:K.tin, al:'c' });
  } else {
    var lb=stkCabe(ley, 40, 5.2, 3.8, true);
    Z.T(lb.t, W/2, 6.9, lb.tam, { b:true, c:tcol, al:'c' });
  }
  Z.Q(18, 15.2, 28);
  var g=Z.grupo(), S=Z.sos(), y0=45.2;
  if(g!==null || S.length){
    var fondo=[['M', xi(y0), y0], ['L', W-xi(y0), y0], ['L', W-q, H], ['L', q, H], ['Z']];
    var txt=claro ? Z.ROJO : Z.BLANCO;
    if(claro) Z.P(fondo, { s:Z.ROJO, sw:0.4 }); else Z.P(fondo, { f:Z.ROJO });
    var dos=(g!==null && S.length), xg=dos ? 23.5 : W/2, xs=dos ? 42.5 : W/2;
    if(g!==null){
      if(g){ Z.T('GRUPO SANGUÍNEO', xg, 48.4, 3.3, { b:true, c:txt, al:'c' }); Z.T(stkCabe(g, 16, 13, 9, true).t, xg, 53.6, 13, { b:true, c:txt, al:'c' }); }
      else { Z.T('GRUPO SANGUÍNEO', xg, 48.4, 3.3, { b:true, c:txt, al:'c' }); Z.T('SIN DATO', xg, 52.6, 6, { b:true, c:txt, al:'c' }); }
    }
    if(S.length){
      Z.T('EMERGENCIA', xs, 48.4, 3.3, { b:true, c:txt, al:'c' });
      var wmax=dos ? 18 : 34;
      if(S.length===1) Z.T(stkCabe(String(S[0].tel).trim(), wmax, 6.4, 4.6, true).t, xs, 52.3, 6.4, { b:true, c:txt, al:'c' });
      else S.forEach(function(s, j){ var r=stkCabe(String(s.tel).trim(), wmax, 5.2, 4, true); Z.T(r.t, xs, 51.4+j*2.6, r.tam, { b:true, c:txt, al:'c' }); });
    }
  }
  if(C.cargo && it.c) Z.falta('cargo');
  Z.extras().forEach(function(e){ Z.falta(e.k); });
  if(C.marca==='logo' || C.marca==='empresa') Z.falta('marca');
  Z.falta('foto');
};
/* 10 · franja: larga y baja, para la parte de atrás del casco */
STK_LAY.franja=function(Z){
  var K=Z.K, it=Z.it, x=30.6;
  Z.Q(2.2, 2, 26);
  if(Z.sangreCaja(x, 2, 13.4, 26, 'col', 15.5, { tamL:3.4, rr:1.8 })) x+=15.6;
  var bw=90-x;
  Z.banda(x, 0, bw, 6.6, { rr:3, tamM:4.6, tamL:4.4, base:4.45, pad:2.4, izqRecta:true });
  var S=Z.sos(), hS=S.length ? 7.6 : 0, sosTop=28.2-hS;
  var P=Z.pila(x+0.4, 8.3, bw-2.8, sosTop-0.5, 'l'), n=Z.nombre();
  if(n && !P.parrafo(n, 7, 2, { b:true, c:K.tin })) Z.falta('nombre');
  if(Z.C.cargo && it.c && !P.linea(it.c, 5, { c:Z.GRIS, min:4.2 })) Z.falta('cargo');
  P.extras(4.4);
  if(S.length) Z.sosTira(x+0.4, sosTop, bw-2.8, hS);
  Z.falta('foto');
};
/* 11 · para el fotocheck: 80 × 50, se pega en el reverso de un carné de 85,6 × 54 mm */
STK_LAY.fotocheck=function(Z){
  var K=Z.K, it=Z.it, C=Z.C;
  Z.banda(0, 0, 80, 8, { rr:3, tamM:6, tamL:5.4, base:5.3, pad:3 });
  Z.Q(2.5, 10.4, 33);
  var rx=38.5, RW=39, y=10.4, S=Z.sos(), hS=S.length===2 ? 10.2 : (S.length ? 8.2 : 0), sosTop=S.length ? 47.6-hS : 48;
  var ex=Z.extras(), ob=null;
  ex=ex.filter(function(e){ if(e.k==='obra'){ ob=e; return false; } return true; });
  if(ob){ var orr=stkCabe(ob.tx, 33, 4.4, 3.6); Z.T(orr.t, 19, 46.6, orr.tam, { c:Z.GRIS, al:'c' }); }
  var fw=12.4, fh=16.5, conFoto=!!C.foto, sx=conFoto ? rx+fw+1.6 : rx, sw=conFoto ? RW-fw-1.6 : RW;
  if(conFoto) Z.I(it.foto, rx, y, fw, fh, { rr:1.2, ini:_stkIni(it.n) });
  var top=conFoto ? (Z.sangreCaja(sx, y, sw, 9.6, 'fila', 14.5, { tamL:3.8 }) ? y+11 : y)
                  : (Z.sangreCaja(sx, y, sw, 11.4, 'fila', 20, { tamL:4.8 }) ? y+13 : y);
  var n=Z.nombre(), P;
  if(conFoto){
    /* al lado de la foto entra el nombre; lo demás, debajo de la foto, a todo lo ancho */
    var Pa=Z.pila(sx, top, sw, y+fh, 'l');
    var quedo=n ? Pa.parrafo(n, 6.2, 2, { b:true, c:K.tin }) : true;
    P=Z.pila(rx, Math.max(Pa.y, y+fh+1.2), RW, sosTop-0.5, 'l');
    if(n && !quedo && !P.parrafo(n, 6.6, 2, { b:true, c:K.tin })) Z.falta('nombre');
  } else {
    P=Z.pila(rx, top, RW, sosTop-0.5, 'l');
    if(n && !P.parrafo(n, 8, 2, { b:true, c:K.tin })) Z.falta('nombre');
  }
  if(C.cargo && it.c && !P.linea(it.c, conFoto ? 5.6 : 6.2, { c:Z.GRIS, min:4.6 })) Z.falta('cargo');
  ex.forEach(function(e){ if(!P.parrafo(e.tx, conFoto ? 4.6 : 5, e.k==='habil' ? 2 : 1, { b:e.b, c:e.c })) Z.falta(e.k); });
  if(S.length) Z.sosCaja(rx, sosTop, RW, hS);
};
/* 12 · mínimo: el QR, el grupo sanguíneo y su nombre corto; el aviso va de costado */
STK_LAY.mini=function(Z){
  var K=Z.K, C=Z.C;
  Z.Q(6, 1.8, 28);
  var ly=stkCabe(Z.cfg.leyenda, 27.5, 3.8, 2.8, true);
  Z.TR(ly.t, 3.95, 15.8+stkAncho(ly.t, ly.tam, true)/2, ly.tam, -90, { b:true, c:K.tin });
  var mk=Z.marca();
  if(mk.tipo==='txt'){ var mr=stkCabe(mk.t, 27.5, 4, 3, true); Z.TR(mr.t, 36.05, 15.8-stkAncho(mr.t, mr.tam, true)/2, mr.tam, 90, { b:true, c:K.tin }); }
  else if(mk.tipo==='logo') Z.falta('marca');
  var nm=Z.nombreEn(36, 5.4, 4.4);
  if(nm) Z.T(nm.t, 20, 32.9, nm.tam, { b:true, c:K.tin, al:'c' });
  Z.sangreCaja(2, 34.3, 36, 4.4, 'linea', 8.5, { tamL:3.2, rr:1.2, etiqueta:'GRUPO SANGUÍNEO' });
  if(C.cargo && Z.it.c) Z.falta('cargo');
  if(Z.sos().length) Z.falta('sos');
  Z.extras().forEach(function(e){ Z.falta(e.k); });
  Z.falta('foto');
};

/* ══ UN STICKER ═════════════════════════════════════════════════════
   it:  { n nombre, c cargo, s grupo sanguíneo ('' si no hay o no lo autorizó), v habilitado hasta (aaaa-mm-dd),
          sello (aaaa-mm-dd, solo si su sello está vigente), h habilitaciones ['al',…], o obra, url (lo que lleva el QR),
          foto (dirección o dataURL de su foto) }
   ctx: { sos:[{t, tel}] los números de emergencia de la obra, empresa, obra, logo }
   →    { ops, forma, w, h, faltan:['cargo',…], dis } */
function stkUno(it, cfg, ctx){
  cfg=stkCfg(cfg); ctx=ctx||{}; it=it||{};
  var Z=_stkZ(it, cfg, ctx), L=STK_LAY[Z.D.k] || STK_LAY.clasico;
  L(Z);
  return { ops:Z.ops, forma:stkForma(Z.D), w:Z.D.w, h:Z.D.h, faltan:Z.faltan(), dis:Z.D.k };
}
/* lo que no entra en el diseño con estos campos (para decirlo antes de imprimir): la unión de todos */
function stkFaltan(items, cfg, ctx){
  var m={};
  (items && items.length ? items : [{ n:'Apellido Apellido, Nombre', c:'Cargo', s:'O+', url:'x' }]).slice(0, 60).forEach(function(it){
    stkUno(it, cfg, ctx).faltan.forEach(function(k){ m[k]=1; });
  });
  return STK_CAMPOS.map(function(K){ return K.k; }).filter(function(k){ return m[k]; });
}

/* ══ LA HOJA A4 ═════════════════════════════════════════════════════
   Arriba la franja con la obra; la grilla de stickers con su línea de corte; abajo, cómo pegarlo.
   La nota se mide ANTES de dibujar (lo del 05/10/2026): termina a 13,5 mm del borde y la grilla
   queda por lo menos 3 mm arriba de ella. */
function stkNota(D, haySos){
  var carne=D.uso==='carne';
  return (carne
      ? 'Córtalo por la línea y pégalo en el reverso del fotocheck o del carné (85,6 × 54 mm), centrado: le queda un borde de casi 3 mm. Si el carné se plastifica, pégalo antes. '
      : 'Córtalo por la línea y pégalo atrás o al costado del casco, sobre una parte lisa y limpia, sin tapar la etiqueta del fabricante. '+
        'Para que dure, cúbrelo con cinta transparente. Si el fabricante del casco no permite pegarle nada, pégalo en el chaleco. ')+
    (haySos ? 'Los números impresos son los de emergencia de la obra. ' : '')+
    'El QR se lee con la cámara de cualquier celular: abre OBRASST con su grupo sanguíneo, su contacto de emergencia y si está habilitado. '+
    'Si el celular tiene la app, funciona aunque no haya señal.';
}
function _stkMedidas(D, cfg, ctx){
  var W=210, H=297, y0=25, haySos=!!(cfg.campos.sos && (ctx.sos||[]).some(function(x){ return x && String(x.tel||'').trim(); }));
  var nota=stkNota(D, haySos), tam=7.5, lin, mm, pie;
  function medir(){ lin=stkPartir(nota, tam, false, W-24, 99); mm=tam*STK_PT; pie=(H-13.5)-(lin.length-1)*mm*1.15; }
  medir();
  var cols=Math.max(1, Math.floor((W-16+D.gx)/(D.w+D.gx)));
  var filas=Math.max(1, Math.floor((pie-mm*0.8-3-y0+D.gy)/(D.h+D.gy)));
  var fondo=y0+filas*D.h+(filas-1)*D.gy;
  while(pie-mm*0.8<fondo+3 && tam>5.5){ tam-=0.25; medir(); }
  return { W:W, H:H, y0:y0, cols:cols, filas:filas, por:cols*filas, x0:(W-(cols*D.w+(cols-1)*D.gx))/2, nota:lin, notaTam:tam, notaY:pie };
}
function stkPorHoja(cfg, ctx){ cfg=stkCfg(cfg); return _stkMedidas(stkDiseno(cfg.dis), cfg, ctx||{}).por; }
/* items → [{ ops, n, de }] (una por hoja). ctx.titulo: lo que dice la franja (la obra) */
function stkHojas(items, cfg, ctx){
  cfg=stkCfg(cfg); ctx=ctx||{}; items=items||[];
  var D=stkDiseno(cfg.dis), M=_stkMedidas(D, cfg, ctx), hojas=[], o=null, N=items.length, de=Math.max(1, Math.ceil(N/M.por));
  var TINTA=[11,42,58], ORO=[245,183,0], BLANCO=[255,255,255];
  function cabecera(n){
    o=[]; hojas.push({ ops:o, n:n, de:de });
    o.push({ t:'r', x:0, y:0, w:M.W, h:20, f:TINTA, rr:0 });
    o.push({ t:'t', x:12, y:9, tx:'OBRASST · STICKERS PARA EL '+(D.uso==='carne' ? 'FOTOCHECK' : 'CASCO'), tam:8.5, b:true, c:ORO, al:'l' });
    var med=D.n+' · '+(D.f==='circ' ? D.w+' mm' : (String(D.w).replace('.', ',')+' × '+String(D.h).replace('.', ',')+' mm'))+(de>1 ? ' · hoja '+n+' de '+de : '');
    o.push({ t:'t', x:M.W-12, y:9, tx:med, tam:7, b:false, c:[200,215,225], al:'r' });
    o.push({ t:'t', x:12, y:15.5, tx:stkCorta(String(ctx.titulo||'')+(N>1 ? '   ·   '+N+' trabajadores' : ''), 12, true, M.W-24), tam:12, b:true, c:BLANCO, al:'l' });
  }
  function pie(){ M.nota.forEach(function(l, i){ o.push({ t:'t', x:12, y:M.notaY+i*M.notaTam*STK_PT*1.15, tx:l, tam:M.notaTam, b:false, c:[110,110,110], al:'l' }); }); }
  cabecera(1);
  items.forEach(function(it, i){
    var k=i%M.por;
    if(i && !k){ pie(); cabecera(hojas.length+1); }
    var col=k%M.cols, fil=Math.floor(k/M.cols), x=M.x0+col*(D.w+D.gx), y=M.y0+fil*(D.h+D.gy);
    var u=stkUno(it, cfg, ctx), corte=JSON.parse(JSON.stringify(u.forma));
    corte.f=null; corte.s=[150,150,150]; corte.sw=0.2; corte.dash=[1.2, 1.2];
    o.push({ t:'g', dx:x, dy:y, ops:[corte].concat(u.ops) });
  });
  pie();
  return hojas;
}

/* ══ EN LA PANTALLA: el SVG, con el MISMO dibujo ════════════════════ */
var _STK_UID=0;
function _stkEsc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function _stkRGB(c){ return 'rgb('+c[0]+','+c[1]+','+c[2]+')'; }
function _stkSVGd(d, n){
  return d.map(function(c){
    if(c[0]==='Z') return 'Z';
    var r=c[0]; for(var i=1;i<c.length;i++) r+=(i>1 ? ' ' : '')+n(c[i]);
    return r;
  }).join('');
}
function _stkSVGforma(p, n){
  if(p.t==='e') return '<ellipse cx="'+n(p.cx)+'" cy="'+n(p.cy)+'" rx="'+n(p.rx)+'" ry="'+n(p.ry)+'"';
  if(p.t==='p') return '<path d="'+_stkSVGd(p.d, n)+'"';
  return '<rect x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'"'+(p.rr ? ' rx="'+n(p.rr)+'"' : '');
}
function _stkSVGops(ops, n, u, defs){
  var h='', abiertos=0;
  (ops||[]).forEach(function(p, i){
    var id=u+'-'+i;
    if(p.t==='g'){ h+='<g transform="translate('+n(p.dx)+' '+n(p.dy)+')">'+_stkSVGops(p.ops, n, id, defs)+'</g>'; return; }
    if(p.t==='r' || p.t==='e' || p.t==='p'){
      h+=_stkSVGforma(p, n)+' fill="'+(p.f ? _stkRGB(p.f) : 'none')+'"'+(p.s ? ' stroke="'+_stkRGB(p.s)+'" stroke-width="'+n(p.sw)+'"'+(p.dash ? ' stroke-dasharray="'+p.dash.map(n).join(' ')+'"' : '') : '')+'/>';
    } else if(p.t==='l'){
      h+='<line x1="'+n(p.x)+'" y1="'+n(p.y)+'" x2="'+n(p.x2)+'" y2="'+n(p.y2)+'" stroke="'+_stkRGB(p.s)+'" stroke-width="'+n(p.sw)+'"/>';
    } else if(p.t==='t' || p.t==='tr'){
      var an=p.t==='tr' ? p.w : stkAncho(p.tx, p.tam, p.b);
      h+='<text x="'+n(p.x)+'" y="'+n(p.y)+'" font-size="'+n(p.tam*STK_PT)+'"'+(p.b ? ' font-weight="700"' : '')+' fill="'+_stkRGB(p.c)+'"'+
         (p.al==='c' ? ' text-anchor="middle"' : (p.al==='r' ? ' text-anchor="end"' : ''))+
         (p.t==='tr' && p.rot ? ' transform="rotate('+(+p.rot).toFixed(2)+' '+n(p.x)+' '+n(p.y)+')"' : '')+
         (an>0 ? ' textLength="'+n(an)+'" lengthAdjust="spacingAndGlyphs"' : '')+'>'+_stkEsc(p.tx)+'</text>';
    } else if(p.t==='q'){
      var Q=null; try{ Q=stkQR(p.tx); }catch(e){ Q=null; }
      if(!Q){ h+='<rect x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.s)+'" height="'+n(p.s)+'" fill="rgb(238,241,244)"/>'; return; }
      var m=p.s/Q.n, d='';
      Q.filas.forEach(function(tr, r){ tr.forEach(function(c){ d+='M'+n(p.x+c[0]*m)+' '+n(p.y+r*m)+'h'+n(c[1]*m)+'v'+n(m)+'h-'+n(c[1]*m)+'z'; }); });
      h+='<path d="'+d+'" fill="'+_stkRGB(p.c)+'" shape-rendering="crispEdges"/>';
    } else if(p.t==='i'){
      var clip=p.circ ? '<ellipse cx="'+n(p.x+p.w/2)+'" cy="'+n(p.y+p.h/2)+'" rx="'+n(p.w/2)+'" ry="'+n(p.h/2)+'"/>'
                      : '<rect x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'" rx="'+n(p.rr)+'"/>';
      if(p.modo!=='cabe') h+='<rect x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'" rx="'+n(p.circ ? p.w/2 : p.rr)+'" fill="rgb(232,236,240)"/>';
      if(p.src){
        defs.push('<clipPath id="'+id+'">'+clip+'</clipPath>');
        h+='<image href="'+_stkEsc(p.src)+'" x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'" preserveAspectRatio="xMidYMid '+(p.modo==='cabe' ? 'meet' : 'slice')+'" clip-path="url(#'+id+')"/>';
      } else if(p.modo!=='cabe'){
        var ti=Math.min(40, p.w*1.5), alto=ti*STK_PT*0.716;
        h+='<text x="'+n(p.x+p.w/2)+'" y="'+n(p.y+p.h/2+alto/2)+'" font-size="'+n(ti*STK_PT)+'" font-weight="700" fill="rgb(160,170,182)" text-anchor="middle">'+_stkEsc(p.ini||'')+'</text>';
      }
    } else if(p.t==='cb'){
      defs.push('<clipPath id="'+id+'">'+_stkSVGforma(p.forma, n)+'/></clipPath>');
      h+='<g clip-path="url(#'+id+')">'; abiertos++;
    } else if(p.t==='ce' && abiertos){ h+='</g>'; abiertos--; }
  });
  while(abiertos--) h+='</g>';
  return h;
}
/* ops de w × h mm → SVG. op: { fondo (blanco detrás), forma (el borde del sticker, para la vista de uno), rotulo, clase } */
function stkSVG(ops, w, h, op){
  op=op||{};
  var K=10, u='stk'+(++_STK_UID), defs=[], n=function(v){ return (Math.round(v*K*10)/10).toString(); };
  var base='';
  if(op.fondo) base+='<rect x="0" y="0" width="'+n(w)+'" height="'+n(h)+'" fill="#fff"/>';
  if(op.forma){ var f=JSON.parse(JSON.stringify(op.forma)); f.f=[255,255,255]; f.s=null; base+=_stkSVGops([f], n, u+'b', defs); }
  var cuerpo=_stkSVGops(ops, n, u, defs);
  if(op.forma){ var g=JSON.parse(JSON.stringify(op.forma)); g.f=null; g.s=[176,186,196]; g.sw=0.25; cuerpo+=_stkSVGops([g], n, u+'o', defs); }
  return '<svg xmlns="http://www.w3.org/2000/svg" class="'+_stkEsc(op.clase||'stk-svg')+'" viewBox="0 0 '+n(w)+' '+n(h)+'" role="img" aria-label="'+_stkEsc(op.rotulo || 'Sticker')+'"'+
         ' style="font-family:Helvetica,Arial,sans-serif">'+(defs.length ? '<defs>'+defs.join('')+'</defs>' : '')+base+cuerpo+'</svg>';
}
/* la vista de un sticker solo (con su borde) y la de una hoja */
function stkVistaUno(it, cfg, ctx, rotulo){ var u=stkUno(it, cfg, ctx); return { svg:stkSVG(u.ops, u.w, u.h, { forma:u.forma, rotulo:rotulo || 'Vista previa del sticker', clase:'stk-svg stk-uno' }), faltan:u.faltan, w:u.w, h:u.h }; }
function stkVistaHoja(hoja, rotulo){ return stkSVG(hoja.ops, 210, 297, { fondo:true, rotulo:rotulo || ('Hoja '+hoja.n+' de '+hoja.de), clase:'stk-svg stk-hoja' }); }

/* ══ EN EL PAPEL: el PDF, con el MISMO dibujo ═══════════════════════
   imgs: { src: { du (dataURL), r (ancho/alto) } } (stkImagenes). La foto que no está sale con sus iniciales. */
function _stkPDFforma(doc, p, dx, dy, estilo){
  if(p.t==='e') doc.ellipse(dx+p.cx, dy+p.cy, p.rx, p.ry, estilo);
  else if(p.t==='p'){
    doc.path(p.d.map(function(c){
      if(c[0]==='M') return { op:'m', c:[dx+c[1], dy+c[2]] };
      if(c[0]==='L') return { op:'l', c:[dx+c[1], dy+c[2]] };
      if(c[0]==='C') return { op:'c', c:[dx+c[1], dy+c[2], dx+c[3], dy+c[4], dx+c[5], dy+c[6]] };
      return { op:'h', c:[] };
    }));
    if(estilo==='F') doc.fill(); else if(estilo==='S') doc.stroke(); else if(estilo==='FD') doc.fillStroke();
  }
  else if(p.rr) doc.roundedRect(dx+p.x, dy+p.y, p.w, p.h, p.rr, p.rr, estilo);
  else doc.rect(dx+p.x, dy+p.y, p.w, p.h, estilo);
}
function _stkPDFops(doc, ops, dx, dy, imgs){
  (ops||[]).forEach(function(p){
    if(p.t==='g'){ _stkPDFops(doc, p.ops, dx+p.dx, dy+p.dy, imgs); return; }
    if(p.t==='r' || p.t==='e' || p.t==='p'){
      if(!p.f && !p.s) return;
      if(p.f) doc.setFillColor(p.f[0], p.f[1], p.f[2]);
      if(p.s){ doc.setDrawColor(p.s[0], p.s[1], p.s[2]); doc.setLineWidth(p.sw); if(p.dash) doc.setLineDashPattern(p.dash, 0); }
      _stkPDFforma(doc, p, dx, dy, (p.f && p.s) ? 'FD' : (p.f ? 'F' : 'S'));
      if(p.s && p.dash) doc.setLineDashPattern([], 0);
    } else if(p.t==='l'){
      doc.setDrawColor(p.s[0], p.s[1], p.s[2]); doc.setLineWidth(p.sw); doc.line(dx+p.x, dy+p.y, dx+p.x2, dy+p.y2);
    } else if(p.t==='t' || p.t==='tr'){
      doc.setFont('helvetica', p.b ? 'bold' : 'normal'); doc.setFontSize(p.tam); doc.setTextColor(p.c[0], p.c[1], p.c[2]);
      if(p.t==='tr' && p.rot) doc.text(p.tx, dx+p.x, dy+p.y, { angle:-p.rot });
      else doc.text(p.tx, dx+p.x, dy+p.y, p.al==='c' ? { align:'center' } : (p.al==='r' ? { align:'right' } : undefined));
    } else if(p.t==='q'){
      var Q=stkQR(p.tx), m=p.s/Q.n;
      doc.setFillColor(p.c[0], p.c[1], p.c[2]);
      Q.filas.forEach(function(tr, r){ tr.forEach(function(c){ doc.rect(dx+p.x+c[0]*m, dy+p.y+r*m, c[1]*m, m+0.02, null); }); });
      doc.fill();
    } else if(p.t==='i'){
      var I=p.src && imgs ? imgs[p.src] : null, x=dx+p.x, y=dy+p.y, puesta=false;
      if(p.modo!=='cabe'){ doc.setFillColor(232, 236, 240); if(p.circ) doc.ellipse(x+p.w/2, y+p.h/2, p.w/2, p.h/2, 'F'); else doc.roundedRect(x, y, p.w, p.h, p.rr||0.01, p.rr||0.01, 'F'); }
      if(I && I.du){
        try{
          var r=I.r||1, iw, ih;
          if(p.modo==='cabe'){ iw=p.w; ih=p.w/r; if(ih>p.h){ ih=p.h; iw=p.h*r; } }
          else { iw=p.w; ih=p.w/r; if(ih<p.h){ ih=p.h; iw=p.h*r; } }
          var fmt=/^data:image\/png/i.test(I.du) ? 'PNG' : 'JPEG';
          if(p.modo==='cabe') doc.addImage(I.du, fmt, x+(p.w-iw)/2, y+(p.h-ih)/2, iw, ih, undefined, 'FAST');
          else {
            doc.saveGraphicsState();
            if(p.circ) doc.ellipse(x+p.w/2, y+p.h/2, p.w/2, p.h/2, null); else doc.roundedRect(x, y, p.w, p.h, p.rr||0.01, p.rr||0.01, null);
            doc.clip(); doc.discardPath();
            doc.addImage(I.du, fmt, x+(p.w-iw)/2, y+(p.h-ih)/2, iw, ih, undefined, 'FAST');
            doc.restoreGraphicsState();
          }
          puesta=true;
        }catch(e){ try{ doc.restoreGraphicsState(); }catch(_r){} }
      }
      if(!puesta && p.modo!=='cabe' && p.ini){
        var ti=Math.min(40, p.w*1.5), alto=ti*STK_PT*0.716;
        doc.setTextColor(160, 170, 182); doc.setFont('helvetica', 'bold'); doc.setFontSize(ti);
        doc.text(p.ini, x+p.w/2, y+p.h/2+alto/2, { align:'center' });
      }
    } else if(p.t==='cb'){
      doc.saveGraphicsState(); _stkPDFforma(doc, p.forma, dx, dy, null); doc.clip(); doc.discardPath();
    } else if(p.t==='ce'){ doc.restoreGraphicsState(); }
  });
}
function stkPDF(hojas, imgs){
  var doc=new jspdf.jsPDF({ unit:'mm', format:'a4', compress:true });
  (hojas||[]).forEach(function(h, i){ if(i) doc.addPage(); _stkPDFops(doc, h.ops, 0, 0, imgs||{}); });
  return doc;
}

/* ══ LAS IMÁGENES PARA EL PDF (el logo y las fotos): dataURL y su proporción ══ */
var _STK_IMG={};
function stkImagen(src){
  src=String(src||'');
  if(!src) return Promise.resolve(null);
  if(_STK_IMG[src]!==undefined) return Promise.resolve(_STK_IMG[src]);
  return new Promise(function(ok){
    var listo=function(v){ _STK_IMG[src]=v || null; ok(v || null); };
    try{
      var im=new Image();
      if(!/^data:/i.test(src)) im.crossOrigin='anonymous';
      im.onload=function(){
        try{
          var w=im.naturalWidth, h=im.naturalHeight; if(!w || !h){ listo(null); return; }
          var esc=Math.min(1, 700/Math.max(w, h)), png=/^data:image\/png/i.test(src) || /\.png(\?|#|$)/i.test(src);
          if(esc===1 && /^data:image\/(png|jpe?g)/i.test(src)){ listo({ du:src, r:w/h }); return; }
          var c=document.createElement('canvas'); c.width=Math.max(1, Math.round(w*esc)); c.height=Math.max(1, Math.round(h*esc));
          var g=c.getContext('2d'); if(!png){ g.fillStyle='#fff'; g.fillRect(0, 0, c.width, c.height); }
          g.drawImage(im, 0, 0, c.width, c.height);
          listo({ du:png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.88), r:w/h });
        }catch(e){ listo(null); }
      };
      im.onerror=function(){ listo(null); };
      im.src=src;
    }catch(e2){ listo(null); }
  });
}
/* las imágenes que usan estas hojas → Promise<{ src: {du, r} }> */
function stkImagenes(hojas){
  var srcs={};
  (function junta(ops){ (ops||[]).forEach(function(p){ if(p.t==='g') junta(p.ops); else if(p.t==='i' && p.src) srcs[p.src]=1; }); })([].concat.apply([], (hojas||[]).map(function(h){ return h.ops; })));
  var l=Object.keys(srcs);
  return Promise.all(l.map(stkImagen)).then(function(r){ var m={}; l.forEach(function(s, i){ if(r[i]) m[s]=r[i]; }); return m; });
}
/* todo de una vez → Promise<{ doc, hojas, nombre }> */
function stkArmarPDF(items, cfg, ctx){
  var hojas=stkHojas(items, cfg, ctx);
  return stkImagenes(hojas).then(function(imgs){ return { doc:stkPDF(hojas, imgs), hojas:hojas, nombre:stkNombreArchivo(items, ctx) }; });
}
function stkNombreArchivo(items, ctx){
  var t=(items && items.length===1) ? ('Sticker casco - '+(items[0].n || 'trabajador')) : ('Stickers casco - '+((ctx && ctx.titulo) || 'obra'));
  return String(t).replace(/[\\\/:*?"<>|\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70)+'.pdf';
}
/* «Clásico · 70 × 45 mm · 10 por hoja» */
function stkResumen(cfg, ctx){
  cfg=stkCfg(cfg); var D=stkDiseno(cfg.dis);
  return D.n+' · '+(D.f==='circ' ? String(D.w)+' mm de diámetro' : String(D.w).replace('.', ',')+' × '+String(D.h).replace('.', ',')+' mm')+' · '+stkPorHoja(cfg, ctx)+' por hoja';
}
