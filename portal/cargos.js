/* OBRASST · lo común del cartel de cargos (brigada, comité y supervisor SST), para el portal.
   Lo arma armar.py desde cargos-base.js (el mismo de la app). No editar. */
/* ══════════════════════════════════════════════════════════════════
   EL CARTEL DE CARGOS · lo común de la app y del portal (05/10/2026)

   Marcelo: «en la página web tener la opción de designar los brigadistas
   de emergencia, y la designación del supervisor SST y/o comité SST y/o
   subcomité SST (al igual que la app con sus fotos, su mismo diseño)
   (con previsualización, con diferentes diseños)».

   Hasta hoy el cartel vivía solo en la app, y en la memoria del celular:
   se elegía a la gente, se armaba la hoja A4 y al salir de la pantalla la
   designación se perdía. Ahora:
   · los carteles (brigada, comité, sub-comité, supervisor, áreas) y sus
     funciones están aquí: uno solo para la app y para el portal;
   · la designación se GUARDA en la obra (sst_estado «cargos»): lo que se
     designa en la computadora lo ve el celular, y al revés;
   · la hoja se describe UNA vez, en milímetros (cgPaginas: rectángulos,
     textos y fotos), y de ahí salen las dos cosas: lo que se ve en la
     pantalla (cgSVG) y lo que se imprime (cgPDF). La vista previa ES la
     hoja, no un parecido;
   · cuatro diseños: el clásico (el de siempre), con cabecera, tarjetas y
     directorio.
   No toca la pantalla ni el servidor: recibe datos, devuelve la hoja.
   ══════════════════════════════════════════════════════════════════ */
var CARTELES = [
  { k:'brigada', n:'Brigada de emergencia', ic:'🚨', col:[214,90,26],
    d:'La que se pega en la caseta y en el punto de reunión.',
    roles:[
      { k:'jefe', n:'Jefe de brigada',            ic:'⭐', col:[245,183,0] },
      { k:'pa',   n:'Primeros auxilios',          ic:'🚑', col:[229,72,77] },
      { k:'fuego',n:'Amago de fuego',             ic:'🧯', col:[214,90,26] },
      { k:'evac', n:'Evacuación',                 ic:'🚪', col:[47,150,191] },
      { k:'rescate',n:'Rescate y búsqueda',       ic:'🦺', col:[143,110,200] }
    ] },
  { k:'comite', n:'Comité de Seguridad y Salud en el Trabajo', ic:'🏛️', col:[47,191,113],
    d:'Paritario: mitad de la empresa, mitad de los trabajadores.',
    roles:[
      { k:'pres', n:'Presidente',                 ic:'⭐', col:[245,183,0] },
      { k:'sec',  n:'Secretario',                 ic:'📝', col:[47,150,191] },
      { k:'tit_e',n:'Titular · empleador',        ic:'🏢', col:[47,191,113] },
      { k:'tit_t',n:'Titular · trabajadores',     ic:'👷', col:[47,191,113] },
      { k:'sup_e',n:'Suplente · empleador',       ic:'🏢', col:[120,150,170] },
      { k:'sup_t',n:'Suplente · trabajadores',    ic:'👷', col:[120,150,170] }
    ] },
  { k:'subcomite', n:'Sub-comité de Seguridad y Salud en el Trabajo', ic:'🏛️', col:[47,150,191],
    d:'El de esta obra, cuando la empresa lleva varias.',
    roles:[
      { k:'pres', n:'Presidente',                 ic:'⭐', col:[245,183,0] },
      { k:'sec',  n:'Secretario',                 ic:'📝', col:[47,150,191] },
      { k:'tit',  n:'Titular',                    ic:'👷', col:[47,191,113] },
      { k:'sup',  n:'Suplente',                   ic:'👤', col:[120,150,170] }
    ] },
  { k:'supervisor', n:'Supervisor de Seguridad y Salud en el Trabajo', ic:'🦺', col:[245,183,0],
    d:'Elegido por los trabajadores. Va cuando no corresponde comité.',
    roles:[
      { k:'tit', n:'Supervisor SST titular',      ic:'🦺', col:[245,183,0] },
      { k:'sup', n:'Supervisor SST suplente',     ic:'👤', col:[120,150,170] }
    ] },
  { k:'area', n:'Responsables de área', ic:'📋', col:[143,110,200],
    d:'Quién responde por cada frente, almacén o taller.',
    roles:[
      { k:'resp', n:'Responsable',                ic:'📋', col:[143,110,200] },
      { k:'apoyo',n:'Apoyo',                      ic:'🤝', col:[120,150,170] }
    ] }
];
function cartelPorK(k){ for(var i=0;i<CARTELES.length;i++) if(CARTELES[i].k===k) return CARTELES[i]; return CARTELES[0]; }
function cartRolPorK(tipo, k){
  var c=cartelPorK(tipo);
  for(var i=0;i<c.roles.length;i++) if(c.roles[i].k===k) return c.roles[i];
  return c.roles[0];
}
/* el nombre corto del cartel, para los botones: «Comité», «Sub-comité», «Supervisor» */
function cartelCorto(C){ return String((C && C.n) || '').split(' de Seguridad')[0]; }

/* ── los diseños de la hoja ── */
var CG_DISENOS = [
  { k:'',        n:'Clásico',      d:'La foto grande, su nombre y su función. El de siempre.' },
  { k:'franja',  n:'Con cabecera', d:'El título en una franja y la función sobre cada foto.' },
  { k:'tarjeta', n:'Tarjetas',     d:'Cada persona en su tarjeta, con su función arriba.' },
  { k:'lista',   n:'Directorio',   d:'En filas, con la foto chica: entra más gente por hoja.' }
];
function cgDisenoDe(k){ for(var i=0;i<CG_DISENOS.length;i++) if(CG_DISENOS[i].k===String(k||'')) return CG_DISENOS[i]; return CG_DISENOS[0]; }

/* ══ LO GUARDADO ══════════════════════════════════════════════════
   { v:1, ts, c:{ brigada:{ asig:{idTrabajador:claveDeLaFunción}, titulo, vig, dis, ts }, comite:{…}, … } }
   Un trabajador, una función por cartel. El id es el de «Mi personal»
   (el «ext» de su fila en la nube): el mismo en el celular y en la web. */
function cgVacio(){ return { v:1, ts:0, c:{} }; }
function cgLimpio(x){
  var o=cgVacio();
  if(!x || typeof x!=='object' || !x.c || typeof x.c!=='object') return o;
  o.ts=+x.ts||0;
  CARTELES.forEach(function(C){
    var e=x.c[C.k]; if(!e || typeof e!=='object') return;
    var asig={}, n=0;
    if(e.asig && typeof e.asig==='object') for(var id in e.asig){
      if(!Object.prototype.hasOwnProperty.call(e.asig, id) || n>=300) continue;
      var rk=String(e.asig[id]||'');
      if(!rk || !C.roles.some(function(r){ return r.k===rk; })) continue;
      asig[String(id).slice(0,80)]=rk; n++;
    }
    o.c[C.k]={ asig:asig, titulo:String(e.titulo||'').slice(0,70), vig:String(e.vig||'').slice(0,40), dis:cgDisenoDe(e.dis).k, ts:+e.ts||0 };
    if(e.p) o.c[C.k].p=1;      /* pendiente de subir (solo vive en el equipo que lo cambió) */
  });
  return o;
}
function cgCartel(G, tipo){
  var k=cartelPorK(tipo).k;
  if(!G.c[k]) G.c[k]={ asig:{}, titulo:'', vig:'', dis:'', ts:0 };
  return G.c[k];
}
/* dos copias (la de este equipo y la de la nube): de cada cartel queda la más nueva, entera */
function cgFusion(mio, ajeno){
  var a=cgLimpio(mio), b=cgLimpio(ajeno), o=cgVacio();
  CARTELES.forEach(function(C){
    var x=a.c[C.k], y=b.c[C.k];
    if(x && y) o.c[C.k]=((+y.ts||0) > (+x.ts||0)) ? y : x;
    else if(x || y) o.c[C.k]=x || y;
  });
  o.ts=Math.max(a.ts, b.ts);
  return o;
}
/* LO MÍO Y LO DE LA NUBE, AL GUARDAR. «El más nuevo» no alcanza: la hora la pone cada equipo, y si el
   reloj de otro va adelantado, lo que acabo de cambiar yo parecería «más viejo» y se perdería en silencio.
   Regla: el cartel que tengo PENDIENTE de subir (p) manda, y sale con una hora posterior a la de la nube
   —así manda también en los demás equipos—; de los que no toqué, queda el más nuevo.
   Devuelve { G (sin marcas, listo para subir), pend:[los carteles que eran míos] }. */
function cgJuntar(mio, nube){
  var a=cgLimpio(mio), b=cgLimpio(nube), o=cgVacio(), pend=[];
  var sinP=function(e, ts){ return { asig:e.asig, titulo:e.titulo, vig:e.vig, dis:e.dis, ts:ts }; };
  CARTELES.forEach(function(C){
    var x=a.c[C.k], y=b.c[C.k];
    if(x && x.p){ o.c[C.k]=sinP(x, Math.max(+x.ts||0, ((y && +y.ts)||0)+1)); pend.push(C.k); }
    else if(x && y) o.c[C.k]=((+y.ts||0) > (+x.ts||0)) ? sinP(y, +y.ts||0) : sinP(x, +x.ts||0);
    else if(x || y) o.c[C.k]=sinP(x || y, +(x || y).ts||0);
    if(o.c[C.k]) o.ts=Math.max(o.ts, o.c[C.k].ts);
  });
  return { G:o, pend:pend };
}
/* ¿dicen lo mismo? (para no volver a subir lo que ya está) */
function cgIgual(a, b){
  var x=cgLimpio(a), y=cgLimpio(b), ok=true;
  CARTELES.forEach(function(C){
    var p=x.c[C.k], q=y.c[C.k];
    var vp=!p || (!cgCuantos(p.asig) && !p.titulo && !p.vig && !p.dis), vq=!q || (!cgCuantos(q.asig) && !q.titulo && !q.vig && !q.dis);
    if(vp && vq) return;
    if(vp !== vq){ ok=false; return; }
    if(p.titulo!==q.titulo || p.vig!==q.vig || p.dis!==q.dis || cgCuantos(p.asig)!==cgCuantos(q.asig)){ ok=false; return; }
    for(var id in p.asig) if(p.asig[id]!==q.asig[id]){ ok=false; return; }
  });
  return ok;
}
function cgCuantos(asig){ var n=0; for(var k in (asig||{})) if(asig[k]) n++; return n; }
function cgIniciales(n){
  return String(n||'?').trim().split(/\s+/).slice(0,2).map(function(w){ return w.charAt(0); }).join('').toUpperCase() || '?';
}
/* la gente de un cartel, por función y en el orden de las funciones (el jefe de brigada arriba, los
   suplentes al final: es el orden en que se lee un cartel de verdad):
   [{ rol, gente:[{id, nombre, puesto, foto}] }]. Dentro de cada función, por nombre. */
function cgGrupos(tipo, asig, porId){
  var C=cartelPorK(tipo), out=[];
  C.roles.forEach(function(r){
    var g=[];
    for(var id in (asig||{})) if(asig[id]===r.k && porId && porId[id]) g.push(porId[id]);
    g.sort(function(a, b){ return String(a.nombre||'').localeCompare(String(b.nombre||''), 'es'); });
    if(g.length) out.push({ rol:r, gente:g });
  });
  return out;
}
function cgHoyTxt(){ var h=new Date(), dd=function(v){ return (v<10?'0':'')+v; }; return dd(h.getDate())+'/'+dd(h.getMonth()+1)+'/'+h.getFullYear(); }
function cgNombreArchivo(titulo){
  var n=String(titulo||'').trim();
  try{ n=n.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(e){}
  n=n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return 'cartel-'+(n || 'cargos')+'.pdf';
}

/* ══ MEDIR Y PARTIR EL TEXTO (la letra del PDF: helvetica) ══════════ */
var _CG_MED=null;
function cgAncho(t, tam, negrita){
  t=String(t||''); if(!t) return 0;
  try{
    if(typeof jspdf!=='undefined' && jspdf.jsPDF){
      if(!_CG_MED || !_CG_MED.doc) _CG_MED={ doc:new jspdf.jsPDF({unit:'mm', format:'a4'}) };
      _CG_MED.doc.setFont('helvetica', negrita ? 'bold' : 'normal'); _CG_MED.doc.setFontSize(tam);
      return _CG_MED.doc.getTextWidth(t);
    }
  }catch(_j){}
  try{
    if(!_CG_MED || !_CG_MED.cx) _CG_MED={ cx:document.createElement('canvas').getContext('2d') };
    _CG_MED.cx.font=(negrita ? 'bold ' : '')+'100px Helvetica, Arial, sans-serif';
    return _CG_MED.cx.measureText(t).width/100*tam*0.352778;
  }catch(_c){}
  return t.length*tam*0.352778*(negrita ? 0.58 : 0.52);
}
function cgCorta(t, tam, negrita, max){
  t=String(t||'');
  if(!max || cgAncho(t, tam, negrita)<=max) return t;
  while(t.length>1 && cgAncho(t+'…', tam, negrita)>max) t=t.slice(0, -1);
  return t.replace(/[\s,·]+$/, '')+'…';
}
function cgPartir(t, tam, negrita, max, lineas){
  var pal=String(t||'').split(/\s+/).filter(Boolean), out=[], cur='';
  pal.forEach(function(w){
    var p=cur ? cur+' '+w : w;
    if(cur && cgAncho(p, tam, negrita)>max){ out.push(cur); cur=w; } else cur=p;
  });
  if(cur) out.push(cur);
  lineas=lineas || 2;
  if(out.length>lineas){ var resto=out.slice(lineas-1).join(' '); out=out.slice(0, lineas-1); out.push(cgCorta(resto, tam, negrita, max)); }
  return out.map(function(l){ return cgCorta(l, tam, negrita, max); });
}
/* colores: mezclar, y qué tinta va encima de un color (blanca sobre los oscuros, oscura sobre los claros) */
function _cgMezcla(c, con, p){ return [Math.round(c[0]+(con[0]-c[0])*p), Math.round(c[1]+(con[1]-c[1])*p), Math.round(c[2]+(con[2]-c[2])*p)]; }
function _cgLuz(c){ return (0.2126*c[0]+0.7152*c[1]+0.0722*c[2])/255; }
function _cgSobre(c){ return _cgLuz(c)>0.58 ? [20,24,30] : [255,255,255]; }
/* el color de una función, para escribir con él sobre blanco (un amarillo no se lee: se oscurece) */
function _cgTinta(c){ var l=_cgLuz(c); return l>0.62 ? _cgMezcla(c, [60,40,0], 0.42) : (l>0.5 ? _cgMezcla(c, [0,0,0], 0.22) : c); }

/* ══ LA HOJA, DESCRITA ══════════════════════════════════════════════
   d:  { tipo, titulo, obra, vigencia, emitido, grupos:[{rol, gente:[{id, nombre, puesto, foto}]}] }
   op: { dis } (si no viene, d.dis)
   →   [{ ops:[…] }], una por hoja A4 de pie (210 × 297 mm). Cada op, en milímetros:
       r rectángulo {x,y,w,h, f relleno, s trazo, sw, rr radio} · l línea {x,y,x2,y2,s,sw} ·
       t texto de una línea {x,y,tx,tam (pt),b,c,al l|c|r} · f foto {x,y,w,h,rr,src,ini,sinBorde} */
function cgPaginas(d, op){
  op=op||{}; d=d||{};
  var dis=cgDisenoDe(op.dis!=null ? op.dis : d.dis).k;
  var C=cartelPorK(d.tipo), W=210, H=297, M=14, util=W-2*M, tope=H-16, hueco=6;
  var TINTA=[11,42,58], NEGRO=[20,24,30], GRIS=[90,98,108], GRIS2=[120,130,140], BLANCO=[255,255,255];
  var pags=[], o=null, titulo=String(d.titulo || C.n), grupos=(d.grupos||[]).filter(function(g){ return g && g.rol && g.gente && g.gente.length; });
  function hoja(){ o=[]; pags.push({ ops:o }); }
  function R(x, y, w, h, p){ p=p||{}; o.push({ t:'r', x:x, y:y, w:w, h:h, f:p.f||null, s:p.s||null, sw:p.sw||0, rr:p.rr||0 }); }
  function L(x, y, x2, y2, s, sw){ o.push({ t:'l', x:x, y:y, x2:x2, y2:y2, s:s, sw:sw }); }
  function T(tx, x, y, tam, p){ p=p||{}; tx=String(tx==null ? '' : tx); if(!tx) return; o.push({ t:'t', x:x, y:y, tx:tx, tam:tam, b:!!p.b, c:p.c||NEGRO, al:p.al||'c' }); }
  function F(per, x, y, w, h, rr, sinBorde){ o.push({ t:'f', x:x, y:y, w:w, h:h, rr:rr||0, src:String(per.foto||''), ini:cgIniciales(per.nombre), sinBorde:!!sinBorde }); }

  /* el título se MIDE, no se adivina: hasta dos líneas a su tamaño; si no entra, se achica */
  function tituloLineas(){
    var tit=titulo.toUpperCase(), tam=21, lin;
    while(tam>12){ lin=cgPartir(tit, tam, true, util, 9); if(lin.length<=2) break; tam-=1.5; }
    return { tam:tam, lin:cgPartir(tit, tam, true, util, 3) };
  }
  function cabClasica(conRaya){
    R(0, 0, W, 4, { f:C.col });
    var y=18, t=tituloLineas();
    t.lin.forEach(function(l){ T(l, W/2, y, t.tam, { b:1 }); y+=t.tam*0.40; });
    if(conRaya){ R(W/2-16, y-2.6, 32, 1.2, { f:C.col, rr:0.6 }); y+=3.4; }
    y+=2.5;
    if(d.obra){ T(cgCorta(d.obra, 10.5, false, util), W/2, y, 10.5, { c:GRIS }); y+=5.4; }
    if(d.vigencia){ T(cgCorta(d.vigencia, 9.4, false, util), W/2, y, 9.4, { c:GRIS }); y+=5.4; }
    return y+4;
  }
  function otraHoja(){ hoja(); R(0, 0, W, 4, { f:C.col }); return 16; }
  /* la franja de una función: su nombre y cuántos son */
  function banda(r, m, yy, sigue){
    var tin=_cgSobre(r.col);
    R(M, yy, util, 6.6, { f:r.col, rr:1.6 });
    T(String(r.n).toUpperCase()+(sigue ? ' (CONTINÚA)' : ''), M+3.5, yy+4.6, 8.8, { b:1, c:tin, al:'l' });
    T(m+(m===1 ? ' persona' : ' personas'), W-M-3.5, yy+4.5, 7.4, { b:1, c:tin, al:'r' });
  }
  /* LA FOTO: 3:4 SIEMPRE, y con un tamaño mínimo útil. Una cara de 20 mm no se reconoce a dos metros, que es
     la distancia a la que se lee un cartel pegado en la caseta: de 26 mm no baja. Entre ese mínimo y el tope
     (46 mm; una sola persona sí ocupa media hoja) se elige sola: la más grande con la que la hoja sale en
     MENOS páginas. Un cartel de dos hojas sirve; uno de tres pudiendo ser de dos, no. */
  /* 09/10/2026 · Marcelo: «solo salen en un espacio pequeño sin aprovechar todo la hoja A4… tiene que ser automático: si es
     uno, se aprovecha toda la hoja; si son dos, uno abajo del otro…; si son tres, se ve la forma que se llene la hoja».
     La foto tenía un tope de 46 mm (88 con una sola persona): con dos o tres personas el cartel quedaba arriba y el resto
     de la hoja, en blanco. Ahora el tope es la hoja misma: se prueba cada número de columnas y cada ancho, se descarta lo
     que no entra en la hoja, y gana lo que sale en menos hojas con la foto más grande. Con la foto crecen el nombre y la
     función (escala(): igual que antes hasta 46 mm, y hasta casi el doble con una foto grande). */
  var MINIMO=26, TOPE_FOTO=170;
  function anchoMax(cols, n){ return Math.min((util-hueco*(cols-1))/cols, TOPE_FOTO); }
  function escala(cw){ return cw<=46 ? 1 : Math.min(1.9, cw/46); }
  /* lo más bajo que se dibujó en una hoja (sin el pie, que se pone después): si pasa del tope, el candidato no entra */
  function _fondo(ops){
    var m=0;
    (ops||[]).forEach(function(q){
      var b=(q.t==='r' || q.t==='f') ? q.y+q.h : (q.t==='l' ? Math.max(q.y, q.y2) : (q.t==='t' ? q.y+(q.tam||8)*0.12 : q.y));
      if(b>m) m=b;
    });
    return m;
  }
  /* se dibuja de mentira con cada candidato {cols, cw}, se cuenta en cuántas hojas sale (y si algo se sale de la hoja),
     y se dibuja de verdad el mejor */
  function elMejor(dibuja, cands){
    var mejor=null, mejorMal=null;
    cands.forEach(function(k){
      var p0=pags, o0=o; pags=[]; o=null;
      dibuja(k.cols, k.cw);
      var np=pags.length, sale=pags.some(function(pg){ return _fondo(pg.ops)>tope+0.6; }); pags=p0; o=o0;
      var gana=function(m){ return !m || np<m.np || (np===m.np && (k.cw>m.cw+0.01 || (Math.abs(k.cw-m.cw)<=0.01 && k.cols>m.cols))); };
      if(sale){ if(gana(mejorMal)) mejorMal={ np:np, cols:k.cols, cw:k.cw }; return; }
      if(gana(mejor)) mejor={ np:np, cols:k.cols, cw:k.cw };
    });
    mejor=mejor || mejorMal;
    dibuja(mejor.cols, mejor.cw);
  }
  function anchos(cols, n){ var l=[], a=anchoMax(cols, n); if(a<MINIMO) return l; for(var w=a; w>MINIMO+0.5; w-=2) l.push({ cols:cols, cw:w }); l.push({ cols:cols, cw:Math.min(a, MINIMO) }); return l; }
  /* por grupos (el clásico): de una columna hasta las que pide el grupo más grande (sin pasar de cinco). 09/10/2026 · antes
     solo las del grupo más grande: cuatro personas iban siempre en una fila de cuatro fotos chicas; ahora también se
     prueba dos por fila (dos filas de fotos grandes), y gana la que llena mejor la hoja */
  function candPorGrupo(n, maxG){
    var l=[];
    for(var c=1; c<=Math.max(1, Math.min(maxG, 5)); c++) l=l.concat(anchos(c, n));
    return l.length ? l : [{ cols:1, cw:anchoMax(1, n) }];
  }
  /* todos seguidos (con cabecera, tarjetas): de una a cinco columnas */
  function candSeguido(n){
    var l=[];
    for(var c=1; c<=Math.min(n, 5); c++) l=l.concat(anchos(c, n));
    return l.length ? l : [{ cols:1, cw:anchoMax(1, n) }];
  }
  function todos(){ var l=[]; grupos.forEach(function(g){ g.gente.forEach(function(p){ l.push({ p:p, rol:g.rol }); }); }); return l; }
  function tamNombre(cols, cw){ return (cols>=4 ? 7.4 : (cols===3 ? 8.6 : (cols===2 ? 10 : 12.5)))*escala(cw||0); }
  function tamRol(cols, cw){ return (cols>=4 ? 6.4 : (cols===3 ? 7.2 : (cols===2 ? 8 : 9.6)))*escala(cw||0); }
  function tamPuesto(cols, cw){ return (cols===3 ? 6.4 : 7.4)*escala(cw||0); }
  function nombreYPuesto(x, cx, ty, cw, cols){
    var fn=tamNombre(cols, cw);
    cgPartir(String(x.nombre||'').trim(), fn, true, cw, 2).forEach(function(l){ T(l, cx, ty, fn, { b:1 }); ty+=fn*0.40; });
    return ty;
  }

  /* ── 1 · el clásico: el de la app de siempre ── */
  function clasico(cols, cw){
    hoja();
    var y=cabClasica(false), y0=y, unSolo=grupos.length===1;
    var foth=cw*4/3, altoCab=unSolo ? 0 : 9.6, ke=escala(cw);
    var ch=foth+(cols>=4 ? 12 : (cols===3 ? 15.5 : (cols===2 ? 17.5 : 20)))*ke, yy=y, altoTodo=0;
    /* con poco contenido, el bloque se baja un poco para no quedar pegado al título */
    grupos.forEach(function(g){ var f=Math.ceil(g.gente.length/cols); altoTodo+=altoCab+f*ch+hueco*(f-1)+hueco; });
    altoTodo-=hueco;
    if(altoTodo<(tope-y)) yy=y+(tope-y-altoTodo)*(grupos.length<=2 ? 0.30 : 0.06);
    grupos.forEach(function(g){
      var r=g.rol, gente=g.gente, m=gente.length, filas=Math.ceil(m/cols), altoG=altoCab+filas*ch+hueco*(filas-1);
      /* el grupo que entra entero en una hoja no se parte: pasa a la siguiente */
      if(yy+altoG>tope && yy>y0+1 && (altoG<=tope-16 || yy+altoCab+ch>tope)){ yy=otraHoja(); y0=yy; }
      if(!unSolo){ banda(r, m, yy); yy+=altoCab; }
      for(var f=0; f<filas; f++){
        if(f>0 && yy+ch>tope+0.5){ yy=otraHoja(); y0=yy; if(!unSolo){ banda(r, m, yy, true); yy+=altoCab; } }
        var enFila=Math.min(cols, m-f*cols), x0=(W-(enFila*cw+hueco*(enFila-1)))/2;
        for(var c2=0; c2<enFila; c2++){
          var x=gente[f*cols+c2], px=x0+c2*(cw+hueco);
          F(x, px, yy, cw, foth, 3);
          var ty=nombreYPuesto(x, px+cw/2, yy+foth+5.2*ke, cw, cols), fc=tamRol(cols, cw);
          ty+=0.8*ke;
          cgPartir(r.n, fc, true, cw, 2).forEach(function(l){ T(l, px+cw/2, ty, fc, { b:1, c:_cgTinta(r.col) }); ty+=fc*0.40; });
          if(x.puesto && cols<=3){ var fp=tamPuesto(cols, cw); T(cgCorta(x.puesto, fp, false, cw), px+cw/2, ty+0.6*ke, fp, { c:GRIS2 }); }
        }
        yy+=ch+hueco;
      }
    });
  }

  /* ── 2 · con cabecera: el título en una franja, y la función sobre cada foto ── */
  function franja(cols, cw){
    hoja();
    var t=tituloLineas(), hB=12+t.lin.length*t.tam*0.40+(d.obra ? 5.4 : 0)+(d.vigencia ? 5.2 : 0)+2.5, y=14.5;
    R(0, 0, W, hB, { f:TINTA }); R(0, hB, W, 2.2, { f:C.col });
    t.lin.forEach(function(l){ T(l, W/2, y, t.tam, { b:1, c:BLANCO }); y+=t.tam*0.40; });
    y+=2;
    if(d.obra){ T(cgCorta(d.obra, 10.5, false, util), W/2, y, 10.5, { c:[203,220,230] }); y+=5.4; }
    if(d.vigencia){ T(cgCorta(d.vigencia, 9.4, false, util), W/2, y, 9.4, { c:[203,220,230] }); }
    var y0=hB+2.2+9, l=todos(), n=l.length, foth=cw*4/3, ke=escala(cw);
    var ch=foth+(cols>=4 ? 10 : (cols===3 ? 12.5 : (cols===2 ? 14.5 : 17)))*ke, filas=Math.ceil(n/cols), altoTodo=filas*ch+hueco*(filas-1), yy=y0;
    var rh=(cols>=4 ? 5.4 : (cols===3 ? 6 : (cols===2 ? 6.8 : 8.4)))*ke, fr=(cols>=4 ? 6.2 : (cols===3 ? 7 : (cols===2 ? 8 : 10)))*ke;
    if(altoTodo<(tope-y0)) yy=y0+(tope-y0-altoTodo)*0.10;
    for(var f=0; f<filas; f++){
      if(f>0 && yy+ch>tope+0.5){
        hoja(); R(0, 0, W, 9.4, { f:TINTA }); R(0, 9.4, W, 1.6, { f:C.col });
        T(cgCorta(titulo.toUpperCase(), 9, true, util), W/2, 6.3, 9, { b:1, c:BLANCO }); yy=19;
      }
      var enFila=Math.min(cols, n-f*cols), x0=(W-(enFila*cw+hueco*(enFila-1)))/2;
      for(var c2=0; c2<enFila; c2++){
        var it=l[f*cols+c2], px=x0+c2*(cw+hueco), r=it.rol;
        F(it.p, px, yy, cw, foth, 3, true);
        /* la cinta de su función, sobre el pie de la foto (con las esquinas de abajo redondas, como la foto) */
        R(px, yy+foth-rh, cw, rh, { f:r.col, rr:3 }); R(px, yy+foth-rh, cw, rh-3, { f:r.col });
        T(cgCorta(r.n, fr, true, cw-3), px+cw/2, yy+foth-rh/2+fr*0.125, fr, { b:1, c:_cgSobre(r.col) });
        R(px, yy, cw, foth, { s:[206,214,222], sw:0.3, rr:3 });
        var ty=nombreYPuesto(it.p, px+cw/2, yy+foth+5*ke, cw, cols);
        if(it.p.puesto && cols<=3){ var fp=tamPuesto(cols, cw); T(cgCorta(it.p.puesto, fp, false, cw), px+cw/2, ty+0.9*ke, fp, { c:GRIS2 }); }
      }
      yy+=ch+hueco;
    }
  }

  /* ── 3 · tarjetas: cada persona en la suya, con su función arriba ── */
  function tarjetas(cols, cw){
    hoja();
    var y=cabClasica(true), y0=y, l=todos(), n=l.length;
    var ke=escala(cw), pad=(cols>=4 ? 1.8 : 2.4)*ke, sH=(cols>=4 ? 5.6 : (cols===3 ? 6.2 : (cols===2 ? 7 : 8.6)))*ke, fr=(cols>=4 ? 6.2 : (cols===3 ? 7 : (cols===2 ? 8 : 10)))*ke;
    var fw=cw-2*pad, foth=fw*4/3, ch=sH+pad+foth+(cols>=4 ? 9.6 : (cols===3 ? 12.4 : (cols===2 ? 14.4 : 17)))*ke, h5=5;
    var filas=Math.ceil(n/cols), altoTodo=filas*ch+h5*(filas-1), yy=y;
    if(altoTodo<(tope-y)) yy=y+(tope-y-altoTodo)*0.12;
    for(var f=0; f<filas; f++){
      if(f>0 && yy+ch>tope+0.5){ yy=otraHoja(); y0=yy; }
      var enFila=Math.min(cols, n-f*cols), x0=(W-(enFila*cw+hueco*(enFila-1)))/2;
      for(var c2=0; c2<enFila; c2++){
        var it=l[f*cols+c2], px=x0+c2*(cw+hueco), r=it.rol;
        R(px, yy, cw, ch, { f:BLANCO, rr:3 });
        /* la tira de arriba, con las esquinas de arriba redondas como la tarjeta */
        R(px, yy, cw, 6, { f:r.col, rr:3 }); R(px, yy+3, cw, sH-3, { f:r.col });
        T(cgCorta(r.n, fr, true, cw-3), px+cw/2, yy+sH/2+fr*0.125, fr, { b:1, c:_cgSobre(r.col) });
        F(it.p, px+pad, yy+sH+pad, fw, foth, 2);
        var ty=nombreYPuesto(it.p, px+cw/2, yy+sH+pad+foth+4.6*ke, fw, cols);
        if(it.p.puesto && cols<=3){ var fp=tamPuesto(cols, cw); T(cgCorta(it.p.puesto, fp, false, fw), px+cw/2, ty+0.9*ke, fp, { c:GRIS2 }); }
        R(px, yy, cw, ch, { s:r.col, sw:0.45, rr:3 });
      }
      yy+=ch+h5;
    }
  }

  /* ── 4 · directorio: en filas, a dos columnas, con la foto chica ── */
  function lista(){
    hoja();
    var y=cabClasica(false), yy=y, unSolo=grupos.length===1, sep=8, colW=(util-sep)/2, fw=15, fh=20, rowH=24.5;
    grupos.forEach(function(g){
      var r=g.rol, gente=g.gente, m=gente.length, filas=Math.ceil(m/2);
      if(!unSolo){
        if(yy+9.6+rowH>tope) yy=otraHoja();
        banda(r, m, yy); yy+=10.2;
      }
      for(var f=0; f<filas; f++){
        if(yy+rowH>tope+0.5){ yy=otraHoja(); if(!unSolo){ banda(r, m, yy, true); yy+=10.2; } }
        for(var c2=0; c2<2; c2++){
          var x=gente[f*2+c2]; if(!x) continue;
          var px=M+c2*(colW+sep), tx=px+fw+4.2, an=colW-fw-4.2, ty=yy+5.4;
          F(x, px, yy, fw, fh, 2);
          cgPartir(String(x.nombre||'').trim(), 10.4, true, an, 2).forEach(function(ln){ T(ln, tx, ty, 10.4, { b:1, al:'l' }); ty+=4.3; });
          T(cgCorta(r.n, 8.4, true, an), tx, ty+0.3, 8.4, { b:1, c:_cgTinta(r.col), al:'l' }); ty+=4;
          if(x.puesto) T(cgCorta(x.puesto, 8, false, an), tx, ty+0.3, 8, { c:GRIS2, al:'l' });
          L(px, yy+fh+2.2, px+colW, yy+fh+2.2, [224,230,235], 0.2);
        }
        yy+=rowH;
      }
      yy+=2.5;
    });
  }

  var nTodos=0, maxG=0;
  grupos.forEach(function(g){ nTodos+=g.gente.length; maxG=Math.max(maxG, g.gente.length); });
  if(!grupos.length){ hoja(); cabClasica(false); }
  else if(dis==='franja') elMejor(franja, candSeguido(nTodos));
  else if(dis==='tarjeta') elMejor(tarjetas, candSeguido(nTodos));
  else if(dis==='lista') lista();
  else elMejor(clasico, candPorGrupo(nTodos, maxG));
  /* el pie, en todas las hojas */
  var np=pags.length, emitido=d.emitido || cgHoyTxt();
  pags.forEach(function(pg, i){
    pg.ops.push({ t:'t', x:W/2, y:H-10, tx:'Emitido el '+emitido+'  ·  OBRASST'+(np>1 ? ('  ·  hoja '+(i+1)+' de '+np) : ''), tam:7.6, b:false, c:[150,158,166], al:'c' });
    pg.n=i+1; pg.de=np; pg.dis=dis; pg.tipo=C.k;
  });
  return pags;
}

/* ══ EN LA PANTALLA: el SVG de una hoja (1 mm = 10 unidades) ════════
   op: { sinFotos (las miniaturas de los diseños: con las iniciales, sin cargar las fotos) } */
var _CG_UID=0;
function _cgEsc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function _cgRGB(c){ return 'rgb('+c[0]+','+c[1]+','+c[2]+')'; }
function cgSVG(pag, op){
  op=op||{};
  var K=10, u='cg'+(++_CG_UID), h='', defs='';
  var n=function(v){ return (v*K).toFixed(1); };
  ((pag && pag.ops) || []).forEach(function(p, i){
    if(p.t==='r'){
      h+='<rect x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'"'+(p.rr ? ' rx="'+n(p.rr)+'"' : '')+' fill="'+(p.f ? _cgRGB(p.f) : 'none')+'"'+
         (p.s ? ' stroke="'+_cgRGB(p.s)+'" stroke-width="'+n(p.sw)+'"' : '')+'/>';
    } else if(p.t==='l'){
      h+='<line x1="'+n(p.x)+'" y1="'+n(p.y)+'" x2="'+n(p.x2)+'" y2="'+n(p.y2)+'" stroke="'+_cgRGB(p.s)+'" stroke-width="'+n(p.sw)+'"/>';
    } else if(p.t==='t'){
      var an=cgAncho(p.tx, p.tam, p.b);
      h+='<text x="'+n(p.x)+'" y="'+n(p.y)+'" font-size="'+(p.tam*0.352778*K).toFixed(2)+'"'+(p.b ? ' font-weight="700"' : '')+' fill="'+_cgRGB(p.c)+'"'+
         (p.al==='c' ? ' text-anchor="middle"' : (p.al==='r' ? ' text-anchor="end"' : ''))+(an>0 ? ' textLength="'+n(an)+'" lengthAdjust="spacingAndGlyphs"' : '')+'>'+_cgEsc(p.tx)+'</text>';
    } else if(p.t==='f'){
      h+='<rect x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'" rx="'+n(p.rr)+'" fill="rgb(238,241,244)"/>';
      if(p.src && !op.sinFotos){
        defs+='<clipPath id="'+u+'-'+i+'"><rect x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'" rx="'+n(p.rr)+'"/></clipPath>';
        h+='<image href="'+_cgEsc(p.src)+'" x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#'+u+'-'+i+')"/>';
      } else {
        var ti=Math.min(46, p.w*0.82), alto=ti*0.352778*0.716;
        h+='<text x="'+n(p.x+p.w/2)+'" y="'+n(p.y+p.h/2+alto/2)+'" font-size="'+(ti*0.352778*K).toFixed(2)+'" font-weight="700" fill="rgb(168,178,190)" text-anchor="middle">'+_cgEsc(p.ini)+'</text>';
      }
      if(!p.sinBorde) h+='<rect x="'+n(p.x)+'" y="'+n(p.y)+'" width="'+n(p.w)+'" height="'+n(p.h)+'" rx="'+n(p.rr)+'" fill="none" stroke="rgb(206,214,222)" stroke-width="3"/>';
    }
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" class="cg-hoja" viewBox="0 0 2100 2970" role="img" aria-label="'+_cgEsc(op.rotulo || 'Hoja del cartel')+'" style="font-family:Helvetica,Arial,sans-serif"'+
         ' data-dis="'+_cgEsc((pag && pag.dis) || '')+'" data-tipo="'+_cgEsc((pag && pag.tipo) || '')+'" data-n="'+((pag && pag.n) || 1)+'" data-de="'+((pag && pag.de) || 1)+'">'+
         '<rect x="0" y="0" width="2100" height="2970" fill="#fff"/>'+(defs ? '<defs>'+defs+'</defs>' : '')+h+'</svg>';
}

/* ══ EN EL PAPEL: el PDF, con el MISMO dibujo ═══════════════════════
   fotos: { src: dataURL ya recortada a 3:4 } (cgFotosPDF). La que no esté sale con sus iniciales. */
function cgPDF(pags, fotos){
  var doc=new jspdf.jsPDF({ unit:'mm', format:'a4' });
  (pags||[]).forEach(function(pg, np){
    if(np) doc.addPage();
    (pg.ops||[]).forEach(function(p){
      if(p.t==='r'){
        if(p.f) doc.setFillColor(p.f[0], p.f[1], p.f[2]);
        if(p.s){ doc.setDrawColor(p.s[0], p.s[1], p.s[2]); doc.setLineWidth(p.sw); }
        var est=(p.f && p.s) ? 'FD' : (p.f ? 'F' : 'S');
        if(p.rr) doc.roundedRect(p.x, p.y, p.w, p.h, p.rr, p.rr, est); else doc.rect(p.x, p.y, p.w, p.h, est);
      } else if(p.t==='l'){
        doc.setDrawColor(p.s[0], p.s[1], p.s[2]); doc.setLineWidth(p.sw); doc.line(p.x, p.y, p.x2, p.y2);
      } else if(p.t==='t'){
        doc.setFont('helvetica', p.b ? 'bold' : 'normal'); doc.setFontSize(p.tam); doc.setTextColor(p.c[0], p.c[1], p.c[2]);
        doc.text(p.tx, p.x, p.y, p.al==='c' ? { align:'center' } : (p.al==='r' ? { align:'right' } : undefined));
      } else if(p.t==='f'){
        doc.setFillColor(238, 241, 244); doc.roundedRect(p.x, p.y, p.w, p.h, p.rr, p.rr, 'F');
        var du=(p.src && fotos) ? fotos[p.src] : null, puesta=false;
        if(du){
          try{
            /* la foto, recortada a las esquinas redondas de su marco */
            doc.saveGraphicsState();
            doc.roundedRect(p.x, p.y, p.w, p.h, p.rr, p.rr, null); doc.clip(); doc.discardPath();
            doc.addImage(du, /^data:image\/png/i.test(du) ? 'PNG' : 'JPEG', p.x, p.y, p.w, p.h, undefined, 'FAST');
            doc.restoreGraphicsState(); puesta=true;
          }catch(e){ try{ doc.restoreGraphicsState(); }catch(_r){} }
        }
        if(!puesta){
          var ti=Math.min(46, p.w*0.82), alto=ti*0.352778*0.716;
          doc.setTextColor(168, 178, 190); doc.setFont('helvetica', 'bold'); doc.setFontSize(ti);
          doc.text(p.ini, p.x+p.w/2, p.y+p.h/2+alto/2, { align:'center' });
        }
        if(!p.sinBorde){ doc.setDrawColor(206, 214, 222); doc.setLineWidth(0.3); doc.roundedRect(p.x, p.y, p.w, p.h, p.rr, p.rr, 'S'); }
      }
    });
  });
  return doc;
}
/* una foto, lista para el PDF: 3:4, recortada al centro (lo mismo que hace la vista previa). La que ya
   es un JPEG de 3:4 —así las guarda la app— entra tal cual. */
var _CG_FOTOS={};
function cgFotoPDF(src){
  if(!src) return Promise.resolve(null);
  if(_CG_FOTOS[src]!==undefined) return Promise.resolve(_CG_FOTOS[src]);
  return new Promise(function(ok){
    var listo=function(v){ _CG_FOTOS[src]=v || null; ok(v || null); };
    try{
      var im=new Image();
      if(!/^data:/i.test(src)) im.crossOrigin='anonymous';
      im.onload=function(){
        try{
          var w=im.naturalWidth, h=im.naturalHeight, R0=3/4;
          if(!w || !h){ listo(null); return; }
          if(/^data:image\/jpe?g/i.test(src) && Math.abs(w/h-R0)<0.012){ listo(src); return; }
          var sw=w, sh=h; if(w/h>R0) sw=h*R0; else sh=w/R0;
          var cw=Math.min(600, Math.round(sw)), ch=Math.round(cw/R0);
          var c=document.createElement('canvas'); c.width=cw; c.height=ch;
          var g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0, 0, cw, ch);
          g.drawImage(im, (w-sw)/2, (h-sh)/2, sw, sh, 0, 0, cw, ch);
          listo(c.toDataURL('image/jpeg', 0.86));
        }catch(e){ listo(null); }
      };
      im.onerror=function(){ listo(null); };
      im.src=src;
    }catch(e2){ listo(null); }
  });
}
/* las fotos de todos los de la hoja → { src: dataURL } */
function cgFotosPDF(d){
  var srcs={};
  ((d && d.grupos) || []).forEach(function(g){ (g.gente||[]).forEach(function(p){ if(p && p.foto) srcs[p.foto]=1; }); });
  var l=Object.keys(srcs);
  return Promise.all(l.map(cgFotoPDF)).then(function(r){ var m={}; l.forEach(function(s, i){ if(r[i]) m[s]=r[i]; }); return m; });
}
