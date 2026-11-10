/* ═══ 🧰 UTILITARIOS PDF Y FOTOS · 4/11/2026 · V7.8f ══════════════════════════════════════════════════════════════════════
   Revisión de Gemini (documento 1, §5): «Utilitarios PDF y fotos». Todo se hace en el navegador, sin servidor: lo que se
   elige aquí no se sube a ningún lado (se dice arriba de la sección).
     · Unir PDF y fotos: ya existía en «Documentos» (portal/archivo.js, «⧉ Unir en un PDF»: del archivo de la obra o de la
       computadora, el orden, el peso, la hoja de índice y los números). Aquí se abre ESA: no hay dos maneras de unir.
     · Quitar o sacar páginas: un PDF y sus miniaturas; se marcan (tocándolas, con Mayús de una a otra, o escribiendo
       «2, 5-7») y se quitan, se sacan en otro PDF, cada una en su PDF (un ZIP) o como fotos (JPG); se giran de a 90°.
     · Foliar, sellar y firmar: el folio en una esquina («0001», «Folio 0001» o «1 / 12»; desde el número que se diga y
       desde la primera o desde la última hoja), un sello de texto («COPIA CONTROLADA», «RECIBIDO»… con su fecha) y la
       IMAGEN de una firma con su nombre y su cargo. La imagen de una firma no es una firma digital: se dice así, y la
       imagen no se guarda (al cerrar la página, se va).
     · Panel de fotos: 2, 4, 6, 8 o 12 fotos por hoja A4, cada una con su número y lo que se ve; arriba, el título, la
       obra, la fecha y el logo de la empresa.
     · Etiquetas QR: un QR (un enlace o un texto) en varias copias, o una lista (uno por línea, con lo que va debajo), de
       3, 4, 5 u 8 cm, con su línea de corte; y el QR solo, en PNG.
   Usa pdf-lib (pdflib/, el mismo de archivo.js, con su propio cargador: archivo.js se pide aparte), pdf.js (pdfjsP), el
   jsPDF (cargarEvPDF) y el QR (cargarQRLib). Se pide al abrir la sección (index: cargarUtil / utilIr). */

var UTW={ tab:'', caja:null, obra:null, op:null, pag:null, fol:null, pan:{ fotos:[] }, panSub:null, panDia:'', panT:null,
          firma:null, firmaArch:null, selloDia:'', logoP:null };
var UT_TABS=[['unir', 'Unir PDF y fotos'], ['pag', 'Quitar o sacar páginas'], ['fol', 'Foliar, sellar y firmar'], ['pan', 'Panel de fotos'], ['qr', 'Etiquetas QR']];
var UT_PDFLIB_V='1.17.1';
var UT_TOPE=60*1048576;                 /* el PDF más grande que se abre aquí */
var UT_LS='sstp_util';                  /* lo elegido (no los archivos ni la firma), en esta computadora */
var UT_ESQ=[['si', '↖ Arriba a la izquierda'], ['sd', '↗ Arriba a la derecha'], ['ii', '↙ Abajo a la izquierda'], ['id', '↘ Abajo a la derecha']];
var UT_PAGS=[{ v:'todas', t:'Todas' }, { v:'primera', t:'Solo la primera' }, { v:'ultima', t:'Solo la última' }];
var UT_SELLOS=['COPIA CONTROLADA', 'COPIA NO CONTROLADA', 'RECIBIDO', 'REVISADO', 'APROBADO', 'ANULADO', 'ORIGINAL'];
var UT_COLORES={ azul:[0.12, 0.29, 0.62], rojo:[0.74, 0.13, 0.16], verde:[0.09, 0.45, 0.27], negro:[0.1, 0.13, 0.16] };
/* el panel de fotos: columnas, filas, el lado mayor de cada foto (px), el alto del pie (mm) y su letra (pt) */
var UT_PAN_POR={ 2:{ c:1, f:2, px:1800, cap:15, fs:10 }, 4:{ c:2, f:2, px:1400, cap:14, fs:9 }, 6:{ c:2, f:3, px:1200, cap:13.5, fs:8.5 },
                 8:{ c:2, f:4, px:1000, cap:13, fs:8 }, 12:{ c:3, f:4, px:800, cap:11.5, fs:7 } };
var UT_PAN_MAX=120;
var UT_QR_TAM={ '30':{ n:'3 cm', q:30, fs:7 }, '40':{ n:'4 cm', q:40, fs:8 }, '50':{ n:'5 cm', q:50, fs:8.5 }, '80':{ n:'8 cm', q:80, fs:11 } };
var UT_QR_MAX=300;
var _UT_LIB=null, _UT_ID=0;

/* ── lo que se recuerda en esta computadora ──────────────────────────────────────────────────────────────────────────── */
function _utFolDef(){
  return { folio:{ on:true, fmt:'num', desde:1, orden:'asc', esq:'sd', caja:true },
           sello:{ on:false, l1:'COPIA CONTROLADA', l2:'', fecha:true, color:'azul', esq:'si', pags:'todas' },
           firma:{ on:false, nom:'', cargo:'', w:45, esq:'id', pags:'ultima', fondo:true } };
}
function _utOp(){
  if(UTW.op) return UTW.op;
  var o=leer(UT_LS, null); if(!o || typeof o!=='object') o={};
  var d=_utFolDef(), f=(o.fol && typeof o.fol==='object') ? o.fol : {};
  o.fol={ folio:Object.assign({}, d.folio, f.folio||{}), sello:Object.assign({}, d.sello, f.sello||{}), firma:Object.assign({}, d.firma, f.firma||{}) };
  ['folio', 'sello', 'firma'].forEach(function(k){ if(!UT_ESQ.some(function(e){ return e[0]===o.fol[k].esq; })) o.fol[k].esq=d[k].esq; });
  if(!UT_COLORES[o.fol.sello.color]) o.fol.sello.color='azul';
  /* V7.9b · el panel: fecha y hora de cada foto, su lugar, sus coordenadas (nunca obligatorias) y quién lo elaboró */
  o.pan=Object.assign({ por:4, tit:'PANEL FOTOGRÁFICO', logo:true, verFecha:true, verLugar:true, verGps:false, nom:'', cargo:'' }, (o.pan && typeof o.pan==='object') ? o.pan : {});
  if(!UT_PAN_POR[o.pan.por]) o.pan.por=4;
  o.qr=Object.assign({ modo:'uno', txt:'', pie:'', tit:'', lista:'', tam:'40', copias:0 }, (o.qr && typeof o.qr==='object') ? o.qr : {});
  if(!UT_QR_TAM[o.qr.tam]) o.qr.tam='40';
  UTW.op=o; return o;
}
function _utGuardar(){ guardar(UT_LS, UTW.op||{}); }

/* ── la sección ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
function vistaUtil(caja){
  _utCss();
  var oid=(YO.obra||{}).id;
  if(UTW.obra!==oid){ UTW.obra=oid; UTW.panSub=null; UTW.logoP=null; }
  UTW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  var O=_utOp();
  if(!UTW.tab) UTW.tab=UT_TABS.some(function(t){ return t[0]===O.tab; }) ? O.tab : 'unir';
  caja.innerHTML='<div class="seg ut-tabs" id="ut-tabs" role="tablist" aria-label="Qué vas a hacer">'+UT_TABS.map(function(t){
      var on=(t[0]===UTW.tab);
      return '<button type="button" role="tab" data-tab="'+t[0]+'" class="'+(on ? 'on' : '')+'" aria-selected="'+(on ? 'true' : 'false')+'">'+esc(t[1])+'</button>';
    }).join('')+'</div>'+
    '<p class="ut-priv">🔒 Todo se hace en tu computadora: lo que eliges aquí no se sube a ningún lado.</p>'+
    '<div id="ut-cuerpo"></div>';
  $('ut-tabs').onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-tab]') : null; if(!b) return;
    UTW.tab=b.getAttribute('data-tab'); O.tab=UTW.tab; _utGuardar();
    Array.prototype.forEach.call(this.querySelectorAll('button[data-tab]'), function(z){ var on=(z===b); z.classList.toggle('on', on); z.setAttribute('aria-selected', on ? 'true' : 'false'); });
    utPintarTab();
  };
  utPintarTab();
}
function utPintarTab(){
  var c=$('ut-cuerpo'); if(!c) return;
  UTW.panT=null;
  if(UTW.tab==='pag') utPagPintar(c); else if(UTW.tab==='fol') utFolPintar(c); else if(UTW.tab==='pan') utPanPintar(c); else if(UTW.tab==='qr') utQrPintar(c); else utUnirPintar(c);
}

/* ── piezas de todas las pestañas ────────────────────────────────────────────────────────────────────────────────────── */
function _utIntro(html){ return '<p class="ut-intro">'+html+'</p>'; }
function _utMsg(el, t, mal){ if(!el) return; el.className='msg'+(mal ? ' mal' : ''); el.textContent=(typeof txDescarga==='function' ? txDescarga(t||'') : (t||'')); }   /* 10/11/2026 · «listo» si se abrió la vista */
function _utChips(id, ops, actual, nombre){
  return '<div class="chips" id="'+id+'" role="group" aria-label="'+esc(nombre||'')+'">'+ops.map(function(o){
    var on=String(o.v)===String(actual);
    return '<button type="button" class="chip'+(on ? ' on' : '')+'" data-v="'+esc(o.v)+'" aria-pressed="'+(on ? 'true' : 'false')+'">'+esc(o.t)+'</button>';
  }).join('')+'</div>';
}
function _utChipsAl(id, fn){
  var c=$(id); if(!c) return;
  c.onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-v]') : null; if(!b || !c.contains(b)) return;
    Array.prototype.forEach.call(c.querySelectorAll('button[data-v]'), function(x){ var on=(x===b); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    fn(b.getAttribute('data-v'));
  };
}
function _utZona(id, titulo, texto, acepta, varios){
  return '<div class="pi-zona ut-zona" id="'+id+'-z" tabindex="0" role="button" aria-label="'+esc(titulo)+'">'+
    '<b>⬆ '+esc(titulo)+'</b><span>'+esc(texto)+'</span>'+
    '<label class="bt sec chico" for="'+id+'">'+(varios ? 'Elegir archivos' : 'Elegir el archivo')+'</label>'+
    '<input type="file" id="'+id+'"'+(varios ? ' multiple' : '')+' accept="'+esc(acepta)+'" class="pi-oculto"></div>';
}
function _utZonaAl(id, fn){
  var i=$(id), z=$(id+'-z'); if(!i || !z) return;
  i.onchange=function(){ var l=Array.prototype.slice.call(this.files||[]); this.value=''; if(l.length) fn(l); };
  if(typeof _pindZona==='function') _pindZona(z, function(files){ var l=Array.prototype.slice.call(files||[]); if(l.length) fn(l); });
  z.onclick=function(ev){ if(!(ev.target.closest && ev.target.closest('label,input'))) i.click(); };
}
function _utBase(n){ return String(n||'documento').replace(/\.pdf$/i, '').trim() || 'documento'; }
function _utNombre(t, ext){ return (typeof nombreArchivo==='function' ? nombreArchivo(t) : String(t||'archivo'))+ext; }
function _utPeso(b){ return typeof _dcPeso==='function' ? _dcPeso(b) : Math.max(1, Math.round((+b||0)/1024))+' KB'; }
function _utBajar(datos, tipo, nombre){ bajarBlob(datos instanceof Blob ? datos : new Blob([datos], { type:tipo }), nombre); }
/* el texto que entra en las letras estándar del PDF (WinAnsi): las tildes y la ñ sí; lo demás, sin su marca o fuera */
var UT_WIN='€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
function _utWin(s){
  s=String(s==null ? '' : s).replace(/[\r\n\t]+/g, ' ').replace(/[‐-‒−]/g, '-');
  var o='';
  for(var i=0;i<s.length;i++){
    var ch=s.charAt(i), c=s.charCodeAt(i);
    if((c>=32 && c<127) || (c>=160 && c<=255) || UT_WIN.indexOf(ch)>-1){ o+=ch; continue; }
    var d=''; try{ d=ch.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(_e){}
    if(d && d.charCodeAt(0)<127) o+=d;
  }
  return o;
}
function _utUtf8(t){
  try{ var b=new TextEncoder().encode(String(t)), s=''; for(var i=0;i<b.length;i++) s+=String.fromCharCode(b[i]); return s; }catch(_e){ return String(t); }
}
/* «2, 5-7» (o «5 a 7», «9-», «-3», «última») → las páginas, de 0 y en orden; lo que no se entiende, en «malos» */
function utRangos(txt, n){
  var s=String(txt||'').toLowerCase().replace(/\s+(a|al|hasta)\s+/g, '-').replace(/[–—]/g, '-').replace(/\s*-\s*/g, '-');
  var ya={}, out=[], malos=[];
  s.split(/[,;\s]+/).forEach(function(p){
    if(!p) return;
    var m=p.match(/^(\d+)?-(\d+)?$/), a, b;
    if(/^\d+$/.test(p)){ a=+p; b=a; }
    else if(m && (m[1] || m[2])){ a=m[1] ? +m[1] : 1; b=m[2] ? +m[2] : n; }
    else if(/^(última|ultima|ult)$/.test(p)){ a=n; b=n; }
    else { malos.push(p); return; }
    if(a>b){ var t=a; a=b; b=t; }
    if(a<1 || b>n) malos.push(p);
    for(var i=Math.max(1, a);i<=Math.min(n, b);i++) if(!ya[i]){ ya[i]=1; out.push(i-1); }
  });
  out.sort(function(x, y){ return x-y; });
  return { idx:out, malos:malos };
}
/* [1, 4, 5, 6] → «2, 5-7» */
function utRangoTexto(idx){
  var s=[], i=0;
  while(i<idx.length){ var a=idx[i], b=a; while(i+1<idx.length && idx[i+1]===b+1) b=idx[++i]; s.push(a===b ? String(a+1) : (a+1)+'-'+(b+1)); i++; }
  return s.join(', ');
}
function _utErrPdf(e){
  var t=String((e && ((e.name||'')+' '+(e.message||''))) || e || '');
  if(/password|encrypt/i.test(t)) return 'Este PDF tiene contraseña o está protegido. Ábrelo, imprímelo como PDF («Guardar como PDF») y elige ese.';
  if(/sin_red|red\b|import|fetch|load/i.test(t)) return 'No se pudo cargar esta parte. Revisa tu conexión e inténtalo otra vez.';
  return 'No se pudo leer el PDF: puede estar dañado. Ábrelo, imprímelo como PDF («Guardar como PDF») y elige ese.';
}

/* ── las librerías ───────────────────────────────────────────────────────────────────────────────────────────────────── */
function utPdfLib(){
  if(window.PDFLib) return Promise.resolve(window.PDFLib);
  if(_UT_LIB) return _UT_LIB;
  _UT_LIB=_cargarJS('pdflib/pdf-lib.min.js?v='+UT_PDFLIB_V, function(){ return !!window.PDFLib; }).then(function(){ return window.PDFLib; });
  _UT_LIB.catch(function(){ _UT_LIB=null; });
  return _UT_LIB;
}
function _utMeta(doc, nombre){
  try{ doc.setTitle(_utBase(nombre)); doc.setProducer('OBRASST'); doc.setCreator('OBRASST · Utilitarios PDF y fotos'); }catch(_m){}
}
/* un PDF de la computadora: { nombre, peso, b (sus bytes), n (páginas), pdf (pdf.js, para las miniaturas) } o null */
function _utAbrirPdf(f, msgId, conVista){
  var m=$(msgId), malo='';
  if(!f) malo='Elige un PDF.';
  else if(!(/pdf/i.test(f.type||'') || /\.pdf$/i.test(f.name||''))) malo='«'+f.name+'» no es un PDF.';
  else if(!(f.size>0)) malo='«'+f.name+'» está vacío.';
  else if(f.size>UT_TOPE) malo='«'+f.name+'» pesa '+_utPeso(f.size)+': aquí se abren hasta '+Math.round(UT_TOPE/1048576)+' MB.';
  if(malo){ _utMsg(m, malo, true); return Promise.resolve(null); }
  _utMsg(m, 'Abriendo «'+f.name+'»…');
  return f.arrayBuffer().then(function(ab){
    var b=new Uint8Array(ab);
    return pdfjsP().then(function(pdfjs){ return pdfjs.getDocument({ data:b.slice(0), isEvalSupported:false }).promise; }).then(function(doc){
      var S={ nombre:f.name, peso:f.size, b:b, n:doc.numPages||0, pdf:null, src:null, sel:{}, giro:{}, ult:null, ocupado:false };
      if(conVista) S.pdf=doc; else try{ doc.destroy(); }catch(_d){}
      if(!S.n){ _utMsg($(msgId), 'Ese PDF no tiene páginas.', true); return null; }
      return S;
    });
  }).then(null, function(e){ _utMsg($(msgId), _utErrPdf(e), true); return null; });
}
/* el PDF de pdf-lib de ese archivo (uno por archivo: de él se copian las páginas) */
function _utSrc(S){
  if(!S.src){ S.src=utPdfLib().then(function(P){ return P.PDFDocument.load(S.b); }); S.src.catch(function(){ S.src=null; }); }
  return S.src;
}
/* un PDF nuevo con esas páginas (de 0), en ese orden y con sus giros */
function utPdfCon(S, idx){
  return utPdfLib().then(function(P){
    return _utSrc(S).then(function(src){
      return P.PDFDocument.create().then(function(out){
        return out.copyPages(src, idx).then(function(pgs){
          pgs.forEach(function(pg, j){
            var g=S.giro[idx[j]]||0;
            if(g) pg.setRotation(P.degrees((((pg.getRotation().angle||0)+g)%360+360)%360));
            out.addPage(pg);
          });
          _utMeta(out, S.nombre);
          return out.save();
        });
      });
    });
  });
}
/* la vista previa: las primeras hojas del PDF, dibujadas con pdf.js. rotulos: lo que va debajo de cada una */
function _utVer(caja, datos, max, rotulos, total){
  var yo={}; caja._ut=yo; caja.classList.add('viene');
  return pdfjsP().then(function(pdfjs){
    return Promise.resolve(datos instanceof Blob ? datos.arrayBuffer() : datos).then(function(b){ return pdfjs.getDocument({ data:new Uint8Array(b).slice(0), isEvalSupported:false }).promise; });
  }).then(function(doc){
    var n=doc.numPages||0, ver=Math.min(n, max||2), i=0, hechas=[];
    function una(){
      if(caja._ut!==yo || !caja.isConnected) return false;
      if(i>=ver) return true;
      return doc.getPage(++i).then(function(pg){
        var w=Math.max(220, (caja.clientWidth||360)-26), dpr=Math.min(2, window.devicePixelRatio||1), v0=pg.getViewport({ scale:1 }), vp=pg.getViewport({ scale:(w/v0.width)*dpr });
        var cv=document.createElement('canvas'); cv.width=Math.max(1, Math.floor(vp.width)); cv.height=Math.max(1, Math.floor(vp.height));
        var el=document.createElement('figure'); el.className='ut-hoja'; el.appendChild(cv);
        var r=rotulos && rotulos[i-1]; if(r){ var fc=document.createElement('figcaption'); fc.textContent=r; el.appendChild(fc); }
        hechas.push(el);
        return pg.render({ canvasContext:cv.getContext('2d'), canvas:cv, viewport:vp }).promise.then(una);
      });
    }
    return Promise.resolve(una()).then(function(si){
      try{ doc.destroy(); }catch(e){}
      if(!si || caja._ut!==yo) return false;
      caja.innerHTML=''; hechas.forEach(function(el){ caja.appendChild(el); });
      var N=total||n;
      if(N>ver){ var p=document.createElement('p'); p.className='ut-mas'; p.textContent='Aquí se ve'+(ver===1 ? ' la primera hoja' : 'n las primeras '+ver+' hojas')+' de '+N+': el PDF las trae todas.'; caja.appendChild(p); }
      caja.setAttribute('data-hojas', String(N)); caja.classList.remove('viene');
      return true;
    });
  }).then(null, function(){
    if(caja._ut!==yo) return false;
    caja.classList.remove('viene'); caja.removeAttribute('data-hojas');
    caja.innerHTML='<div class="ut-prev-msg"><b>La vista previa no se pudo mostrar aquí</b>El PDF sale igual: descárgalo y ábrelo.</div>';
    return false;
  });
}
function _utPrevMsg(caja, titulo, texto){
  if(!caja) return;
  caja._ut={}; caja.classList.remove('viene'); caja.removeAttribute('data-hojas');
  caja.innerHTML='<div class="ut-prev-msg"><b>'+esc(titulo)+'</b>'+esc(texto||'')+'</div>';
}
/* la vista previa que se vuelve a armar cuando algo cambia (vale la última que se pidió) */
function _utTaller(caja, armar){
  var T={ n:0, t:null };
  T.pide=function(espera){
    if(T.t){ clearTimeout(T.t); T.t=null; }
    var n=++T.n; caja.classList.add('viene');
    T.t=setTimeout(function(){
      T.t=null;
      Promise.resolve().then(armar).then(function(R){
        if(n!==T.n || !caja.isConnected) return;
        if(!R) { caja.classList.remove('viene'); return; }
        if(R.msg){ _utPrevMsg(caja, R.msg, R.sub); return; }
        _utVer(caja, R.datos, R.max||2, R.rotulos, R.total);
      }, function(e){
        if(n!==T.n || !caja.isConnected) return;
        _utPrevMsg(caja, 'No se pudo armar la vista previa', _utErrPdf(e));
      });
    }, espera||0);
  };
  return T;
}
/* un ZIP sin comprimir (los PDF y las fotos ya vienen comprimidos), con los nombres en UTF-8: el mismo de archivo.js */
var _UT_CRC=null;
function _utCrc(u8){
  if(!_UT_CRC){ _UT_CRC=new Uint32Array(256); for(var n=0;n<256;n++){ var c=n; for(var k=0;k<8;k++) c=(c&1) ? (0xEDB88320^(c>>>1)) : (c>>>1); _UT_CRC[n]=c>>>0; } }
  var x=0xFFFFFFFF; for(var i=0;i<u8.length;i++) x=_UT_CRC[(x^u8[i])&0xFF]^(x>>>8);
  return (x^0xFFFFFFFF)>>>0;
}
function _utZip(archivos){
  var enc=new TextEncoder(), partes=[], central=[], off=0, d=new Date();
  var hora=((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xFFFF, dia=(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xFFFF;
  archivos.forEach(function(a){
    var nb=enc.encode(a.n), crc=_utCrc(a.b), L=new DataView(new ArrayBuffer(30)), C=new DataView(new ArrayBuffer(46));
    L.setUint32(0, 0x04034b50, true); L.setUint16(4, 20, true); L.setUint16(6, 0x0800, true); L.setUint16(8, 0, true); L.setUint16(10, hora, true); L.setUint16(12, dia, true);
    L.setUint32(14, crc, true); L.setUint32(18, a.b.length, true); L.setUint32(22, a.b.length, true); L.setUint16(26, nb.length, true); L.setUint16(28, 0, true);
    partes.push(new Uint8Array(L.buffer), nb, a.b);
    C.setUint32(0, 0x02014b50, true); C.setUint16(4, 20, true); C.setUint16(6, 20, true); C.setUint16(8, 0x0800, true); C.setUint16(10, 0, true); C.setUint16(12, hora, true);
    C.setUint16(14, dia, true); C.setUint32(16, crc, true); C.setUint32(20, a.b.length, true); C.setUint32(24, a.b.length, true); C.setUint16(28, nb.length, true);
    C.setUint16(30, 0, true); C.setUint16(32, 0, true); C.setUint16(34, 0, true); C.setUint16(36, 0, true); C.setUint32(38, 0, true); C.setUint32(42, off, true);
    central.push(new Uint8Array(C.buffer), nb);
    off+=30+nb.length+a.b.length;
  });
  var tamC=0; central.forEach(function(x){ tamC+=x.length; });
  var E=new DataView(new ArrayBuffer(22));
  E.setUint32(0, 0x06054b50, true); E.setUint16(8, archivos.length, true); E.setUint16(10, archivos.length, true); E.setUint32(12, tamC, true); E.setUint32(16, off, true);
  return new Blob(partes.concat(central, [new Uint8Array(E.buffer)]), { type:'application/zip' });
}
function _utArchHTML(S, id){
  return '<div class="ut-arch"><span>📄 <b>'+esc(S.nombre)+'</b> · '+S.n+(S.n===1 ? ' página' : ' páginas')+' · '+esc(_utPeso(S.peso))+'</span>'+
    '<span><label class="bt sec chico" for="'+id+'">Elegir otro PDF</label><input type="file" id="'+id+'" accept="application/pdf,.pdf" class="pi-oculto"></span></div>';
}

/* ═══ UNIR PDF Y FOTOS: el de «Documentos» ═══════════════════════════════════════════════════════════════════════════════ */
function utUnirPintar(c){
  c.innerHTML='<div class="ut-unir"><h3>🧩 Unir PDF y fotos en un solo PDF</h3>'+
    '<p>Del archivo de la obra o de tu computadora, en el orden que quieras. Si quieres, con una hoja de índice al inicio y el número de cada página; y eliges cuánto pesa.</p>'+
    '<ul class="ut-tips"><li><b>Para achicar un PDF</b> y mandarlo por WhatsApp o por correo: elige ese PDF solo y el peso «Muy liviano».</li>'+
      '<li><b>Para pasar fotos a PDF</b>: cada foto va en su hoja A4. Si quieres varias fotos por hoja, con lo que se ve en cada una, usa «Panel de fotos».</li></ul>'+
    '<button type="button" class="bt" id="ut-unir-ir">🧩 Abrir «Unir en un PDF»</button>'+
    '<p class="ayuda">Se abre en «Documentos», donde están las carpetas de la obra. Lo unido se descarga; se guarda en una carpeta solo si tú lo eliges ahí.</p></div>';
  $('ut-unir-ir').onclick=utUnirIr;
}
function utUnirIr(){
  navegar('docs');
  var n=0;
  (function mira(){
    if(VISTA.actual!=='docs') return;
    var b=$('arc-unir'); if(b){ b.click(); return; }
    if(++n<100) setTimeout(mira, 150); else toast('Toca «⧉ Unir en un PDF», arriba de la lista.');
  })();
}

/* ═══ QUITAR, SACAR O GIRAR PÁGINAS ══════════════════════════════════════════════════════════════════════════════════ */
function utPagPintar(c){
  var S=UTW.pag;
  if(!S){
    c.innerHTML=_utIntro('Elige un PDF: ves sus páginas y marcas las que quieres <b>quitar</b>, <b>sacar en otro PDF</b>, <b>separar</b> (cada una en su PDF) o <b>bajar como fotos</b>. También las <b>giras</b>, si vinieron echadas o de cabeza.')+
      _utZona('ut-pag-f', 'Arrastra aquí el PDF', 'O elígelo. Hasta '+Math.round(UT_TOPE/1048576)+' MB.', 'application/pdf,.pdf', false)+'<p class="msg" id="ut-pag-msg"></p>';
    _utZonaAl('ut-pag-f', function(l){ utPagAbrir(l[0]); });
    return;
  }
  var t='';
  for(var i=0;i<S.n;i++){
    t+='<div class="ut-pag'+(S.sel[i] ? ' on' : '')+'" data-i="'+i+'"><button type="button" class="ut-pag-b" data-ut-sel="'+i+'" aria-pressed="'+(S.sel[i] ? 'true' : 'false')+'" aria-label="Página '+(i+1)+'">'+
         '<span class="ut-pag-img" id="ut-pi-'+i+'"></span><span class="ut-pag-n">'+(i+1)+'</span></button>'+
         '<button type="button" class="ut-pag-g" data-ut-giro="'+i+'" title="Girar la página '+(i+1)+'" aria-label="Girar la página '+(i+1)+'">↻</button></div>';
  }
  c.innerHTML=_utArchHTML(S, 'ut-pag-otro')+
    '<div class="ut-barra"><label for="ut-pag-r">Marcar las páginas</label><input id="ut-pag-r" placeholder="2, 5-7" autocomplete="off" maxlength="200">'+
      '<button type="button" class="bt sec chico" id="ut-pag-rb">Marcar</button>'+
      '<button type="button" class="bt sec chico" id="ut-pag-tod">Todas</button><button type="button" class="bt sec chico" id="ut-pag-nin">Ninguna</button>'+
      '<button type="button" class="bt sec chico" id="ut-pag-inv">Al revés</button></div>'+
    '<p class="ayuda" id="ut-pag-cuenta"></p>'+
    '<div class="ut-pags" id="ut-pags">'+t+'</div>'+
    '<div class="ut-acc" id="ut-pag-acc">'+
      '<button type="button" class="bt" data-ut-hace="quitar">🗑 Quitar las marcadas</button>'+
      '<button type="button" class="bt sec" data-ut-hace="sacar">📄 Sacarlas en otro PDF</button>'+
      '<button type="button" class="bt sec" data-ut-hace="separar">🗂 Cada una en su PDF</button>'+
      '<button type="button" class="bt sec" data-ut-hace="jpg">🖼 Como fotos (JPG)</button>'+
      '<button type="button" class="bt sec" data-ut-hace="girar">↻ Girarlas</button>'+
      '<button type="button" class="bt sec" data-ut-hace="todo" id="ut-pag-todo" hidden>⬇ Todo, con los giros</button></div>'+
    '<p class="msg" id="ut-pag-msg"></p>';
  var g=$('ut-pags');
  g.onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('[data-ut-sel],[data-ut-giro]') : null; if(!b || S.ocupado) return;
    if(b.hasAttribute('data-ut-giro')){ var j=+b.getAttribute('data-ut-giro'); S.giro[j]=((S.giro[j]||0)+90)%360; _utGiroCss(S, j); _utPagMarcas(S); return; }
    var k=+b.getAttribute('data-ut-sel');
    if(ev.shiftKey && S.ult!=null){ var a=Math.min(S.ult, k), z=Math.max(S.ult, k), v=!S.sel[k]; for(var x=a;x<=z;x++){ if(v) S.sel[x]=1; else delete S.sel[x]; } }
    else if(S.sel[k]) delete S.sel[k]; else S.sel[k]=1;
    S.ult=k; _utPagMarcas(S);
  };
  var r=$('ut-pag-r'), marcar=function(){
    var R=utRangos(r.value, S.n), m=$('ut-pag-msg');
    if(!R.idx.length){ _utMsg(m, String(r.value||'').trim() ? 'No entendí qué páginas: escríbelas así, «2, 5-7». El PDF tiene '+S.n+'.' : 'Escribe qué páginas: «2, 5-7».', true); return; }
    S.sel={}; R.idx.forEach(function(i){ S.sel[i]=1; }); S.ult=null; _utPagMarcas(S);
    _utMsg(m, R.malos.length ? 'Marqué las que se entienden. Esto no: «'+R.malos.join('», «')+'» (el PDF tiene '+S.n+' páginas).' : '', !!R.malos.length);
  };
  $('ut-pag-rb').onclick=marcar;
  r.onkeydown=function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); marcar(); } };
  $('ut-pag-tod').onclick=function(){ for(var i=0;i<S.n;i++) S.sel[i]=1; _utPagMarcas(S); };
  $('ut-pag-nin').onclick=function(){ S.sel={}; _utPagMarcas(S); };
  $('ut-pag-inv').onclick=function(){ for(var i=0;i<S.n;i++){ if(S.sel[i]) delete S.sel[i]; else S.sel[i]=1; } _utPagMarcas(S); };
  $('ut-pag-acc').onclick=function(ev){ var b=ev.target.closest ? ev.target.closest('[data-ut-hace]') : null; if(b && !b.disabled) utPagHacer(b.getAttribute('data-ut-hace')); };
  $('ut-pag-otro').onchange=function(){ var f=this.files && this.files[0]; this.value=''; if(f) utPagAbrir(f); };
  _utPagMarcas(S);
  _utPagMinis(S);
}
function utPagAbrir(f){
  return _utAbrirPdf(f, 'ut-pag-msg', true).then(function(S){
    if(!S) return;
    if(UTW.pag && UTW.pag.pdf) try{ UTW.pag.pdf.destroy(); }catch(_d){}
    UTW.pag=S;
    var c=$('ut-cuerpo'); if(c && UTW.tab==='pag') utPagPintar(c);
  });
}
function _utSelIdx(S){ return Object.keys(S.sel).map(Number).filter(function(i){ return i>=0 && i<S.n; }).sort(function(a, b){ return a-b; }); }
function _utGiros(S){ return Object.keys(S.giro).filter(function(k){ return S.giro[k]; }).length; }
function _utPagMarcas(S){
  var g=$('ut-pags'); if(!g) return;
  var idx=_utSelIdx(S), giros=_utGiros(S);
  Array.prototype.forEach.call(g.querySelectorAll('.ut-pag'), function(el){
    var i=+el.getAttribute('data-i'), on=!!S.sel[i]; el.classList.toggle('on', on);
    var b=el.querySelector('[data-ut-sel]'); if(b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
    var gb=el.querySelector('[data-ut-giro]'); if(gb){ gb.classList.toggle('gira', !!S.giro[i]); gb.title='Girar la página '+(i+1)+(S.giro[i] ? ' (va girada '+S.giro[i]+'°)' : ''); }
  });
  var cu=$('ut-pag-cuenta');
  if(cu) cu.textContent=!idx.length ? 'Toca las páginas para marcarlas (con Mayús, de una a otra), o escribe cuáles.'
    : idx.length===S.n ? 'Marcaste todas ('+S.n+'). Para quitar, deja por lo menos una sin marcar.'
    : idx.length===1 ? 'Marcaste 1: la página '+(idx[0]+1)+'.' : 'Marcaste '+idx.length+': '+utRangoTexto(idx)+'.';
  var acc=$('ut-pag-acc');
  if(acc) Array.prototype.forEach.call(acc.querySelectorAll('[data-ut-hace]'), function(b){
    var q=b.getAttribute('data-ut-hace');
    b.disabled=!!S.ocupado || (q==='todo' ? !giros : !idx.length) || (q==='quitar' && idx.length===S.n);
  });
  var td=$('ut-pag-todo'); if(td) td.hidden=!giros;
}
function _utGiroCss(S, i){
  var box=$('ut-pi-'+i), cv=box && box.querySelector('canvas'); if(cv) cv.style.transform=S.giro[i] ? 'rotate('+S.giro[i]+'deg)' : '';
}
/* las miniaturas, una tras otra (hasta 400: más allá, solo su número) */
function _utPagMinis(S){
  if(!S.pdf) return;
  var yo={}; S.minis=yo;
  var i=0, max=Math.min(S.n, 400), dpr=Math.min(2, window.devicePixelRatio||1);
  function una(){
    if(S.minis!==yo || UTW.pag!==S || i>=max) return null;
    var k=i++, box=$('ut-pi-'+k); if(!box) return null;
    return S.pdf.getPage(k+1).then(function(pg){
      var v0=pg.getViewport({ scale:1 }), vp=pg.getViewport({ scale:Math.min(150/v0.width, 150/v0.height)*dpr });
      var cv=document.createElement('canvas'); cv.width=Math.max(1, Math.floor(vp.width)); cv.height=Math.max(1, Math.floor(vp.height));
      return pg.render({ canvasContext:cv.getContext('2d'), canvas:cv, viewport:vp }).promise.then(function(){
        if(box.isConnected){ box.innerHTML=''; box.appendChild(cv); _utGiroCss(S, k); var t=box.closest ? box.closest('.ut-pag') : null; if(t) t.setAttribute('data-lista', '1'); }
      });
    }).then(una, una);
  }
  una();
}
function _utJpg(S, i){
  return S.pdf.getPage(i+1).then(function(pg){
    var rot=(((pg.rotate||0)+(S.giro[i]||0))%360+360)%360, vp=pg.getViewport({ scale:150/72, rotation:rot });
    var k=Math.min(1, 5000/Math.max(vp.width, vp.height)); if(k<1) vp=pg.getViewport({ scale:150/72*k, rotation:rot });
    var cv=document.createElement('canvas'); cv.width=Math.max(1, Math.floor(vp.width)); cv.height=Math.max(1, Math.floor(vp.height));
    var cx=cv.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0, 0, cv.width, cv.height);
    return pg.render({ canvasContext:cx, canvas:cv, viewport:vp }).promise.then(function(){
      return new Promise(function(res, rej){ cv.toBlob(function(b){ if(b) res(b); else rej('jpg'); }, 'image/jpeg', 0.86); });
    });
  });
}
function utPagHacer(q){
  var S=UTW.pag; if(!S || S.ocupado) return;
  var idx=_utSelIdx(S), m=$('ut-pag-msg'), base=_utBase(S.nombre), r=utRangoTexto(idx), todas=[];
  for(var i=0;i<S.n;i++) todas.push(i);
  if(q==='girar'){
    if(!idx.length) return;
    idx.forEach(function(i){ S.giro[i]=((S.giro[i]||0)+90)%360; _utGiroCss(S, i); });
    _utPagMarcas(S); _utMsg(m, idx.length===1 ? 'Página '+(idx[0]+1)+' girada. Se baja así en lo que hagas después.' : idx.length+' páginas giradas. Se bajan así en lo que hagas después.');
    return;
  }
  if(q!=='todo' && !idx.length) return;
  if(q==='quitar' && idx.length===S.n) return;
  var fin=function(t){ S.ocupado=false; _utPagMarcas(S); _utMsg(m, t); };
  var mal=function(e){ S.ocupado=false; _utPagMarcas(S); _utMsg(m, _utErrPdf(e), true); };
  S.ocupado=true; _utPagMarcas(S); _utMsg(m, 'Armando…');
  if(q==='quitar' || q==='sacar' || q==='todo'){
    var lleva=(q==='sacar') ? idx : (q==='todo') ? todas : todas.filter(function(i){ return !S.sel[i]; });
    var nom=_utNombre(base+(q==='sacar' ? ' (pág. '+r+')' : q==='todo' ? ' (girado)' : ' (sin pág. '+r+')'), '.pdf');
    utPdfCon(S, lleva).then(function(u8){
      _utBajar(u8, 'application/pdf', nom);
      fin('Listo: se descargó «'+nom+'», con '+lleva.length+(lleva.length===1 ? ' página.' : ' páginas.'));
    }, mal);
    return;
  }
  if(q==='separar'){
    if(idx.length===1){
      var n1=_utNombre(base+' (pág. '+(idx[0]+1)+')', '.pdf');
      utPdfCon(S, idx).then(function(u8){ _utBajar(u8, 'application/pdf', n1); fin('Listo: se descargó «'+n1+'».'); }, mal);
      return;
    }
    var ancho=String(S.n).length, sale=[];
    idx.reduce(function(cad, i, k){
      return cad.then(function(){
        _utMsg(m, 'Armando '+(k+1)+' de '+idx.length+'…');
        return utPdfCon(S, [i]).then(function(u8){ var p=String(i+1); while(p.length<ancho) p='0'+p; sale.push({ n:_utNombre(base+' - pág. '+p, '.pdf'), b:u8 }); });
      });
    }, Promise.resolve()).then(function(){
      var nz=_utNombre(base+' (separado en '+sale.length+')', '.zip');
      _utBajar(_utZip(sale), 'application/zip', nz);
      fin('Listo: se descargó «'+nz+'», con '+sale.length+' PDF: uno por página.');
    }, mal);
    return;
  }
  if(q==='jpg'){
    if(idx.length>100){ S.ocupado=false; _utPagMarcas(S); _utMsg(m, 'Como fotos, hasta 100 de una vez: marcaste '+idx.length+'.', true); return; }
    var fotos=[];
    idx.reduce(function(cad, i, k){
      return cad.then(function(){
        _utMsg(m, 'Dibujando '+(k+1)+' de '+idx.length+'…');
        return _utJpg(S, i).then(function(b){ return b.arrayBuffer(); }).then(function(ab){ fotos.push({ i:i, b:new Uint8Array(ab) }); });
      });
    }, Promise.resolve()).then(function(){
      var ancho=String(S.n).length, nomF=function(i){ var p=String(i+1); while(p.length<ancho) p='0'+p; return _utNombre(base+' - pág. '+p, '.jpg'); };
      if(fotos.length===1){ var n2=nomF(fotos[0].i); _utBajar(fotos[0].b, 'image/jpeg', n2); fin('Listo: se descargó «'+n2+'».'); return; }
      var nz=_utNombre(base+' (fotos)', '.zip');
      _utBajar(_utZip(fotos.map(function(x){ return { n:nomF(x.i), b:x.b }; })), 'application/zip', nz);
      fin('Listo: se descargó «'+nz+'», con '+fotos.length+' fotos (JPG).');
    }, mal);
  }
}

/* ═══ FOLIAR, SELLAR Y FIRMAR ════════════════════════════════════════════════════════════════════════════════════════ */
/* el folio de la página i (de 0) de N */
function utFolTexto(Fo, i, N){
  var d=Math.max(1, Math.min(999999, parseInt(Fo.desde, 10)||1)), k=(Fo.orden==='desc') ? (N-1-i) : i, num=d+k, ult=d+N-1;
  if(Fo.fmt==='de') return num+' / '+ult;
  var t=String(num), ancho=Math.max(4, String(ult).length); while(t.length<ancho) t='0'+t;
  return Fo.fmt==='folio' ? 'Folio '+t : t;
}
function _utToca(p, i, N){ return p==='primera' ? i===0 : (p==='ultima' ? i===N-1 : true); }
/* lo que se ve de la página (girada o no) → donde se dibuja: u a la derecha y v hacia arriba, desde la esquina de abajo a
   la izquierda de lo que se ve; lo dibujado va girado igual que la página, para que se lea derecho */
function _utMapa(pg){
  var b=pg.getCropBox(), r=(((pg.getRotation().angle||0)%360)+360)%360, eco=(r===90 || r===270);
  return { r:r, VW:eco ? b.height : b.width, VH:eco ? b.width : b.height, xy:function(u, v){
    if(r===90) return { x:b.x+b.width-v, y:b.y+u };
    if(r===180) return { x:b.x+b.width-u, y:b.y+b.height-v };
    if(r===270) return { x:b.x+v, y:b.y+b.height-u };
    return { x:b.x+u, y:b.y+v };
  } };
}
/* el sitio de algo de w×h en esa esquina; lo que ya hay en ella se respeta (se apila hacia adentro) */
function _utEsquina(M, pila, esq, w, h, m){
  var arriba=(esq==='si' || esq==='sd'), izq=(esq==='si' || esq==='ii');
  var u=izq ? m : M.VW-m-w, v=arriba ? M.VH-m-pila[esq]-h : m+pila[esq];
  pila[esq]+=h+6;
  return { u:u, v:v };
}
function _utCaja(P, pg, M, u, v, w, h, o){
  var p=M.xy(u, v), x={ x:p.x, y:p.y, width:w, height:h, rotate:P.degrees(M.r), borderWidth:o.bw||0 };
  if(o.fondo){ x.color=o.fondo; x.opacity=(o.op==null) ? 1 : o.op; }
  if(o.borde){ x.borderColor=o.borde; }
  pg.drawRectangle(x);
}
function _utTexto(P, pg, M, t, u, v, s, f, col){ var p=M.xy(u, v); pg.drawText(t, { x:p.x, y:p.y, size:s, font:f, color:col, rotate:P.degrees(M.r) }); }
function _utDibFolio(P, pg, M, pila, m, Fo, t, fb){
  t=_utWin(t); var s=12, pad=4.5, w=fb.widthOfTextAtSize(t, s)+pad*2, h=s*0.72+pad*2, q=_utEsquina(M, pila, Fo.esq, w, h, m);
  if(Fo.caja) _utCaja(P, pg, M, q.u, q.v, w, h, { fondo:P.rgb(1, 1, 1), op:0.92, borde:P.rgb(0.2, 0.25, 0.3), bw:0.7 });
  _utTexto(P, pg, M, t, q.u+pad, q.v+pad, s, fb, P.rgb(0.08, 0.1, 0.13));
}
function _utDibSello(P, pg, M, pila, m, Se, f, fb){
  var c=UT_COLORES[Se.color]||UT_COLORES.azul, col=P.rgb(c[0], c[1], c[2]), L=[];
  var l1=_utWin(Se.l1).trim().toUpperCase(), l2=_utWin(Se.l2).trim(), fe=Se.fecha ? fechaLarga(UTW.selloDia||hoyISO()) : '';
  if(l1) L.push({ t:l1, s:14, f:fb }); if(l2) L.push({ t:l2, s:9.5, f:f }); if(fe) L.push({ t:fe, s:10.5, f:fb });
  if(!L.length) return;
  var pad=8, gap=3.6, w=0;
  L.forEach(function(x){ x.w=x.f.widthOfTextAtSize(x.t, x.s); if(x.w>w) w=x.w; });
  var W=Math.max(w+pad*2, 96), H=pad*2+1.5+gap*(L.length-1)+L.reduce(function(a, x){ return a+x.s*0.72; }, 0);
  var q=_utEsquina(M, pila, Se.esq, W, H, m);
  _utCaja(P, pg, M, q.u, q.v, W, H, { fondo:P.rgb(1, 1, 1), op:0.86, borde:col, bw:1.6 });
  _utCaja(P, pg, M, q.u+2.6, q.v+2.6, W-5.2, H-5.2, { borde:col, bw:0.55 });
  var y=q.v+H-pad;
  L.forEach(function(x){ y-=x.s*0.72; _utTexto(P, pg, M, x.t, q.u+(W-x.w)/2, y, x.s, x.f, col); y-=gap; });
}
function _utDibFirma(P, pg, M, pila, m, Fi, im, f, fb){
  var W=(+Fi.w||45)*72/25.4, H=W*im.height/im.width;
  if(H>W*0.75){ H=W*0.75; W=H*im.width/im.height; }
  var nom=_utWin(Fi.nom).trim(), car=_utWin(Fi.cargo).trim(), sn=8.5, sc=7.5;
  var wN=nom ? fb.widthOfTextAtSize(nom, sn) : 0, wC=car ? f.widthOfTextAtSize(car, sc) : 0;
  var BW=Math.max(W, wN, wC)+4, txtH=(nom || car) ? 6+(nom ? sn*0.75 : sc*0.75)+((nom && car) ? sc*1.2 : 0) : 0, BH=H+txtH;
  var q=_utEsquina(M, pila, Fi.esq, BW, BH, m), p=M.xy(q.u+(BW-W)/2, q.v+txtH);
  pg.drawImage(im, { x:p.x, y:p.y, width:W, height:H, rotate:P.degrees(M.r) });
  if(!txtH) return;
  var lw=Math.min(BW, Math.max(W*0.9, wN, wC)), lu=q.u+(BW-lw)/2, lv=q.v+txtH-1.5, a=M.xy(lu, lv), b=M.xy(lu+lw, lv);
  pg.drawLine({ start:{ x:a.x, y:a.y }, end:{ x:b.x, y:b.y }, thickness:0.6, color:P.rgb(0.25, 0.3, 0.35) });
  var y=lv-2.5-(nom ? sn*0.75 : sc*0.75);
  if(nom){ _utTexto(P, pg, M, nom, q.u+(BW-wN)/2, y, sn, fb, P.rgb(0.1, 0.13, 0.16)); y-=sc*1.2; }
  if(car) _utTexto(P, pg, M, car, q.u+(BW-wC)/2, y, sc, f, P.rgb(0.3, 0.35, 0.4));
}
/* el folio, el sello y la firma en cada hoja de «doc»; ix: de qué hoja del PDF entero es cada una (la vista previa lleva
   solo la primera y la última) */
function utSellar(P, doc, F, N, ix, firma){
  var conFirma=!!(F.firma.on && firma && firma.d);
  return Promise.all([doc.embedFont(P.StandardFonts.Helvetica), doc.embedFont(P.StandardFonts.HelveticaBold), conFirma ? doc.embedPng(firma.d) : null]).then(function(r){
    var f=r[0], fb=r[1], im=r[2];
    doc.getPages().forEach(function(pg, k){
      var i=ix ? ix[k] : k, M=_utMapa(pg), pila={ si:0, sd:0, ii:0, id:0 }, m=Math.max(14, Math.min(28, Math.min(M.VW, M.VH)*0.04));
      if(F.folio.on) _utDibFolio(P, pg, M, pila, m, F.folio, utFolTexto(F.folio, i, N), fb);
      if(F.sello.on && _utToca(F.sello.pags, i, N)) _utDibSello(P, pg, M, pila, m, F.sello, f, fb);
      if(im && _utToca(F.firma.pags, i, N)) _utDibFirma(P, pg, M, pila, m, F.firma, im, f, fb);
    });
  });
}
function utFolArmar(S, prev){
  var F=_utOp().fol;
  return utPdfLib().then(function(P){
    var ix=prev ? (S.n>1 ? [0, S.n-1] : [0]) : null;
    var docP=ix ? _utSrc(S).then(function(src){ return P.PDFDocument.create().then(function(out){ return out.copyPages(src, ix).then(function(pgs){ pgs.forEach(function(pg){ out.addPage(pg); }); return out; }); }); })
                : P.PDFDocument.load(S.b);
    return docP.then(function(doc){ return utSellar(P, doc, F, S.n, ix, UTW.firma).then(function(){ _utMeta(doc, S.nombre); return doc.save(); }); });
  });
}
function _utFolNombre(S, F){
  var q=[]; if(F.folio.on) q.push('foliado'); if(F.sello.on) q.push('sellado'); if(F.firma.on && UTW.firma) q.push('con firma');
  var t=q.length>1 ? q.slice(0, -1).join(', ')+' y '+q[q.length-1] : (q[0]||'');
  return _utNombre(_utBase(S.nombre)+(t ? ' ('+t+')' : ''), '.pdf');
}
function utFolPintar(c){
  var S=UTW.fol;
  if(!S){
    c.innerHTML=_utIntro('Al PDF le pones el <b>número de folio</b> en una esquina, como en un expediente; un <b>sello</b> de texto —«COPIA CONTROLADA», «RECIBIDO»…— con su fecha; y la <b>imagen de una firma</b>, con el nombre y el cargo.')+
      _utZona('ut-fol-f', 'Arrastra aquí el PDF', 'O elígelo. Hasta '+Math.round(UT_TOPE/1048576)+' MB.', 'application/pdf,.pdf', false)+'<p class="msg" id="ut-fol-msg"></p>';
    _utZonaAl('ut-fol-f', function(l){ _utAbrirPdf(l[0], 'ut-fol-msg', false).then(function(S2){ if(S2){ UTW.fol=S2; if(UTW.tab==='fol') utFolPintar(c); } }); });
    return;
  }
  var F=_utOp().fol, esq=UT_ESQ.map(function(e){ return { v:e[0], t:e[1] }; });
  if(!UTW.selloDia) UTW.selloDia=hoyISO();
  c.innerHTML=_utArchHTML(S, 'ut-fol-otro')+
    '<div class="ut-ed"><div class="ut-form">'+
      '<div class="ut-sec"><label class="check ut-on"><input type="checkbox" id="ut-fo-on"'+(F.folio.on ? ' checked' : '')+'> <span><b>🔢 Foliar</b>: el número de cada hoja, en una esquina</span></label>'+
        '<div class="ut-sub" id="ut-fo-sub"'+(F.folio.on ? '' : ' hidden')+'>'+
          '<div class="campo"><label>Cómo se escribe</label>'+_utChips('ut-fo-fmt', [{ v:'num', t:'0001' }, { v:'folio', t:'Folio 0001' }, { v:'de', t:'1 / 12' }], F.folio.fmt, 'Cómo se escribe el folio')+'</div>'+
          '<div class="campo"><label for="ut-fo-desde">Empieza en</label><input id="ut-fo-desde" type="number" min="1" max="999999" step="1" value="'+(Math.max(1, parseInt(F.folio.desde, 10)||1))+'" style="max-width:140px"></div>'+
          '<div class="campo"><label>Se folia desde</label>'+_utChips('ut-fo-orden', [{ v:'asc', t:'La primera hoja' }, { v:'desc', t:'La última hoja' }], F.folio.orden, 'Desde qué hoja se folia')+
            '<p class="ayuda">Hay quien folia desde la última hoja: elige el orden que te pidan.</p></div>'+
          '<div class="campo"><label>Dónde</label>'+_utChips('ut-fo-esq', esq, F.folio.esq, 'En qué esquina va el folio')+'</div>'+
          '<label class="check"><input type="checkbox" id="ut-fo-caja"'+(F.folio.caja ? ' checked' : '')+'> <span>En un recuadro blanco: se lee sobre cualquier fondo</span></label>'+
        '</div></div>'+
      '<div class="ut-sec"><label class="check ut-on"><input type="checkbox" id="ut-se-on"'+(F.sello.on ? ' checked' : '')+'> <span><b>🔖 Sello</b>: un texto en un recuadro, con su fecha</span></label>'+
        '<div class="ut-sub" id="ut-se-sub"'+(F.sello.on ? '' : ' hidden')+'>'+
          '<div class="campo"><label for="ut-se-l1">Lo que dice</label><input id="ut-se-l1" maxlength="40" value="'+esc(F.sello.l1)+'">'+
            '<div class="chips ut-sug" id="ut-se-sug" role="group" aria-label="Sellos de siempre">'+UT_SELLOS.map(function(s){ return '<button type="button" class="chip" data-v="'+esc(s)+'">'+esc(s)+'</button>'; }).join('')+'</div></div>'+
          '<div class="campo"><label for="ut-se-l2">Debajo <small>· opcional: la empresa, el área, quién lo recibe</small></label><input id="ut-se-l2" maxlength="60" value="'+esc(F.sello.l2)+'"></div>'+
          '<div class="campo"><label class="check" style="margin:0"><input type="checkbox" id="ut-se-fe"'+(F.sello.fecha ? ' checked' : '')+'> <span>Con la fecha</span></label>'+
            '<input type="date" id="ut-se-dia" value="'+esc(UTW.selloDia)+'" aria-label="La fecha del sello" style="margin-top:8px"'+(F.sello.fecha ? '' : ' disabled')+'></div>'+
          '<div class="campo"><label>Color</label>'+_utChips('ut-se-col', [{ v:'azul', t:'Azul' }, { v:'rojo', t:'Rojo' }, { v:'verde', t:'Verde' }, { v:'negro', t:'Negro' }], F.sello.color, 'Color del sello')+'</div>'+
          '<div class="campo"><label>Dónde</label>'+_utChips('ut-se-esq', esq, F.sello.esq, 'En qué esquina va el sello')+'</div>'+
          '<div class="campo"><label>En qué hojas</label>'+_utChips('ut-se-pags', UT_PAGS, F.sello.pags, 'En qué hojas va el sello')+'</div>'+
        '</div></div>'+
      '<div class="ut-sec"><label class="check ut-on"><input type="checkbox" id="ut-fi-on"'+(F.firma.on ? ' checked' : '')+'> <span><b>✍️ Firma</b>: la imagen de una firma, con el nombre y el cargo</span></label>'+
        '<div class="ut-sub" id="ut-fi-sub"'+(F.firma.on ? '' : ' hidden')+'>'+
          '<div class="ut-firma" id="ut-fi-img">'+_utFirmaVista()+'</div>'+
          '<div class="ut-fila"><label class="bt sec chico" for="ut-fi-f" id="ut-fi-fl">'+(UTW.firma ? 'Cambiar la imagen' : 'Elegir la imagen (foto o PNG)')+'</label>'+
            '<input type="file" id="ut-fi-f" accept="image/png,image/jpeg,.png,.jpg,.jpeg" class="pi-oculto">'+
            '<label class="check" style="margin:0"><input type="checkbox" id="ut-fi-fondo"'+(F.firma.fondo ? ' checked' : '')+'> <span>Quitar el fondo blanco</span></label></div>'+
          '<p class="ayuda">Firma con lapicero azul o negro en una hoja blanca, tómale una foto de cerca y elígela: se recorta sola. La imagen no se guarda: al cerrar la página, se va.</p>'+
          '<div class="campo-dos" style="margin-top:12px"><div class="campo"><label for="ut-fi-nom">Nombre <small>· opcional</small></label><input id="ut-fi-nom" maxlength="60" value="'+esc(F.firma.nom)+'"></div>'+
            '<div class="campo"><label for="ut-fi-car">Cargo <small>· opcional</small></label><input id="ut-fi-car" maxlength="60" value="'+esc(F.firma.cargo)+'"></div></div>'+
          '<div class="campo"><label>Tamaño</label>'+_utChips('ut-fi-w', [{ v:'35', t:'Chica · 3,5 cm' }, { v:'45', t:'Mediana · 4,5 cm' }, { v:'60', t:'Grande · 6 cm' }], String(F.firma.w), 'Tamaño de la firma')+'</div>'+
          '<div class="campo"><label>Dónde</label>'+_utChips('ut-fi-esq', esq, F.firma.esq, 'En qué esquina va la firma')+'</div>'+
          '<div class="campo"><label>En qué hojas</label>'+_utChips('ut-fi-pags', [UT_PAGS[2], UT_PAGS[0], UT_PAGS[1]], F.firma.pags, 'En qué hojas va la firma')+'</div>'+
          '<p class="ut-aviso" id="ut-fi-aviso">⚠️ Es la <b>imagen</b> de una firma, como la que pegas en un Word: <b>no es una firma digital</b> ni la reemplaza.</p>'+
        '</div></div>'+
      '<div class="ut-acc" style="margin-top:16px"><button type="button" class="bt" id="ut-fol-bajar">⬇ Descargar el PDF</button></div><p class="msg" id="ut-fol-msg"></p>'+
    '</div><div class="ut-prev" id="ut-fol-prev" aria-label="Vista previa: la primera y la última página"></div></div>';
  var T=_utTaller($('ut-fol-prev'), function(){
    if(!F.folio.on && !F.sello.on && !(F.firma.on && UTW.firma)) return { msg:'Nada que poner todavía', sub:'Marca el folio, el sello o la firma: aquí ves cómo queda la primera y la última página.' };
    return utFolArmar(S, true).then(function(u8){ return { datos:u8, max:2, rotulos:S.n>1 ? ['Página 1', 'Página '+S.n+' (la última)'] : ['Página 1'] }; });
  });
  var pide=function(ms){ _utGuardar(); T.pide(ms); };
  [['ut-fo-on', 'ut-fo-sub', F.folio], ['ut-se-on', 'ut-se-sub', F.sello], ['ut-fi-on', 'ut-fi-sub', F.firma]].forEach(function(x){
    var e=$(x[0]); e.onchange=function(){ x[2].on=e.checked; var s=$(x[1]); if(s) s.hidden=!e.checked; pide(); };
  });
  _utChipsAl('ut-fo-fmt', function(v){ F.folio.fmt=(v==='folio' || v==='de') ? v : 'num'; pide(); });
  _utChipsAl('ut-fo-orden', function(v){ F.folio.orden=(v==='desc') ? 'desc' : 'asc'; pide(); });
  _utChipsAl('ut-fo-esq', function(v){ F.folio.esq=v; pide(); });
  var de=$('ut-fo-desde'); de.oninput=function(){ var v=parseInt(de.value, 10); F.folio.desde=(v>=1 && v<=999999) ? v : 1; pide(450); };
  $('ut-fo-caja').onchange=function(){ F.folio.caja=this.checked; pide(); };
  var l1=$('ut-se-l1'); l1.oninput=function(){ F.sello.l1=l1.value.slice(0, 40); pide(450); };
  $('ut-se-sug').onclick=function(ev){ var b=ev.target.closest ? ev.target.closest('[data-v]') : null; if(!b) return; l1.value=b.getAttribute('data-v'); F.sello.l1=l1.value; pide(); };
  $('ut-se-l2').oninput=function(){ F.sello.l2=this.value.slice(0, 60); pide(450); };
  $('ut-se-fe').onchange=function(){ F.sello.fecha=this.checked; $('ut-se-dia').disabled=!this.checked; pide(); };
  $('ut-se-dia').onchange=function(){ UTW.selloDia=this.value || hoyISO(); pide(); };
  _utChipsAl('ut-se-col', function(v){ F.sello.color=UT_COLORES[v] ? v : 'azul'; pide(); });
  _utChipsAl('ut-se-esq', function(v){ F.sello.esq=v; pide(); });
  _utChipsAl('ut-se-pags', function(v){ F.sello.pags=v; pide(); });
  $('ut-fi-f').onchange=function(){ var f=this.files && this.files[0]; this.value=''; if(f) _utFirmaElegir(f, pide); };
  $('ut-fi-fondo').onchange=function(){ F.firma.fondo=this.checked; if(UTW.firmaArch) _utFirmaElegir(UTW.firmaArch, pide); else pide(); };
  $('ut-fi-nom').oninput=function(){ F.firma.nom=this.value.slice(0, 60); pide(450); };
  $('ut-fi-car').oninput=function(){ F.firma.cargo=this.value.slice(0, 60); pide(450); };
  _utChipsAl('ut-fi-w', function(v){ F.firma.w=(+v===35 || +v===60) ? +v : 45; pide(); });
  _utChipsAl('ut-fi-esq', function(v){ F.firma.esq=v; pide(); });
  _utChipsAl('ut-fi-pags', function(v){ F.firma.pags=v; pide(); });
  $('ut-fol-bajar').onclick=function(){ utFolBajar(S, this); };
  $('ut-fol-otro').onchange=function(){ var f=this.files && this.files[0]; this.value=''; if(f) _utAbrirPdf(f, 'ut-fol-msg', false).then(function(S2){ if(S2){ UTW.fol=S2; if(UTW.tab==='fol') utFolPintar(c); } }); };
  T.pide();
}
function _utFirmaVista(){ return UTW.firma ? '<img alt="La firma que se pone" src="'+esc(UTW.firma.d)+'">' : '<span>Todavía sin imagen</span>'; }
function _utFirmaElegir(f, pide){
  var m=$('ut-fol-msg');
  utFirmaLeer(f, !!_utOp().fol.firma.fondo).then(function(R){
    UTW.firma=R; UTW.firmaArch=f;
    var v=$('ut-fi-img'); if(v) v.innerHTML=_utFirmaVista();
    var l=$('ut-fi-fl'); if(l) l.textContent='Cambiar la imagen';
    _utMsg(m, '');
    pide();
  }, function(e){
    _utMsg(m, e==='tipo' ? 'La firma va en una foto (JPG) o en un PNG.' : e==='peso' ? 'Esa imagen pesa más de 15 MB.' : e==='vacia' ? 'En esa imagen no se ve ninguna firma: tómale la foto más de cerca, con buena luz.' : 'No se pudo leer esa imagen.', true);
  });
}
/* la imagen de la firma: sin el fondo blanco (si se pide) y recortada a lo que tiene tinta. { d:PNG, w, h } */
function utFirmaLeer(file, fondo){
  return new Promise(function(res, rej){
    if(!file || !(/^image\/(png|jpeg)$/i.test(file.type||'') || /\.(png|jpe?g)$/i.test(file.name||''))) return rej('tipo');
    if(file.size>15*1048576) return rej('peso');
    var u=URL.createObjectURL(file), im=new Image();
    im.onload=function(){ try{ res(_utFirmaProcesar(im, fondo)); }catch(e){ rej(e==='vacia' ? 'vacia' : 'foto'); } URL.revokeObjectURL(u); };
    im.onerror=function(){ URL.revokeObjectURL(u); rej('foto'); };
    im.src=u;
  });
}
function _utFirmaProcesar(im, fondo){
  var w=im.naturalWidth||1, h=im.naturalHeight||1, k=Math.min(1, 1400/Math.max(w, h)), W=Math.max(1, Math.round(w*k)), H=Math.max(1, Math.round(h*k));
  var cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  var cx=cv.getContext('2d'); cx.drawImage(im, 0, 0, W, H);
  var d=cx.getImageData(0, 0, W, H), p=d.data, x0=W, y0=H, x1=-1, y1=-1;
  for(var y=0;y<H;y++) for(var x=0;x<W;x++){
    var i=(y*W+x)*4, a=p[i+3];
    if(fondo){ var l=0.299*p[i]+0.587*p[i+1]+0.114*p[i+2]; if(l>=200) a=0; else if(l>140) a=Math.round(a*(200-l)/60); p[i+3]=a; }
    if(a>24){ if(x<x0) x0=x; if(x>x1) x1=x; if(y<y0) y0=y; if(y>y1) y1=y; }
  }
  if(x1<0) throw 'vacia';
  cx.putImageData(d, 0, 0);
  var pad=6; x0=Math.max(0, x0-pad); y0=Math.max(0, y0-pad); x1=Math.min(W-1, x1+pad); y1=Math.min(H-1, y1+pad);
  var o=document.createElement('canvas'); o.width=x1-x0+1; o.height=y1-y0+1;
  o.getContext('2d').drawImage(cv, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
  return { d:o.toDataURL('image/png'), w:o.width, h:o.height };
}
function utFolBajar(S, b){
  var F=_utOp().fol, m=$('ut-fol-msg');
  if(!F.folio.on && !F.sello.on && !F.firma.on){ _utMsg(m, 'Marca lo que le pones: el folio, un sello o una firma.', true); return; }
  if(F.firma.on && !UTW.firma){ _utMsg(m, 'Falta la imagen de la firma: elígela, o desmarca «Firma».', true); return; }
  if(F.sello.on && !_utWin(F.sello.l1).trim() && !_utWin(F.sello.l2).trim() && !F.sello.fecha){ _utMsg(m, 'El sello está vacío: escribe lo que dice.', true); return; }
  b.disabled=true; _utMsg(m, 'Armando el PDF ('+S.n+(S.n===1 ? ' página' : ' páginas')+')…');
  utFolArmar(S, false).then(function(u8){
    var nom=_utFolNombre(S, F); _utBajar(u8, 'application/pdf', nom); b.disabled=false;
    _utMsg(m, 'Listo: se descargó «'+nom+'».');
  }, function(e){ b.disabled=false; _utMsg(m, _utErrPdf(e), true); });
}

/* ═══ PANEL DE FOTOS ═════════════════════════════════════════════════════════════════════════════════════════════════ */
function utPanPintar(c){
  var Pn=_utOp().pan, L=UTW.pan.fotos;
  if(UTW.panSub===null) UTW.panSub=String(nombreObraP()||'');
  if(!UTW.panDia) UTW.panDia=hoyISO();
  var hay=!!L.length;
  c.innerHTML=_utIntro('Las fotos de una actividad, una inspección o un trabajo, en hojas A4: <b>2, 4, 6, 8 o 12 por hoja</b>, cada una con su número y lo que se ve. Arriba van el título, la obra, la fecha y el logo de tu empresa. '+
      '<span class="ut-gris">Para el informe del mes, sube las fotos en «Registro fotográfico»: el informe las anexa solo.</span>')+
    (hay ? '' : _utZona('ut-pan-f', 'Arrastra aquí las fotos', 'O elígelas: JPG o PNG, hasta '+UT_PAN_MAX+'.', 'image/jpeg,image/png,.jpg,.jpeg,.png', true))+
    '<div class="ut-ed" id="ut-pa-ed"'+(hay ? '' : ' hidden')+'><div class="ut-form">'+
      '<div class="campo"><label for="ut-pa-tit">Título</label><input id="ut-pa-tit" maxlength="80" value="'+esc(Pn.tit)+'"></div>'+
      '<div class="campo"><label for="ut-pa-sub">Debajo del título <small>· la obra, el área, la actividad</small></label><input id="ut-pa-sub" maxlength="90" value="'+esc(UTW.panSub)+'"></div>'+
      '<div class="campo"><label for="ut-pa-dia">Fecha</label><input type="date" id="ut-pa-dia" value="'+esc(UTW.panDia)+'"></div>'+
      '<div class="campo"><label>Fotos por hoja</label>'+_utChips('ut-pa-por', [2, 4, 6, 8, 12].map(function(n){ return { v:String(n), t:String(n) }; }), String(Pn.por), 'Cuántas fotos por hoja')+'</div>'+
      '<label class="check" id="ut-pa-logo-l" hidden><input type="checkbox" id="ut-pa-logo"'+(Pn.logo ? ' checked' : '')+'> <span>Con el logo de tu empresa</span></label>'+
      /* V7.9b · lo que lleva cada foto y quién lo elaboró (respuesta de Gemini, doc. 3) */
      '<p class="ut-lbl">Cada foto lleva</p>'+
      '<label class="check" style="margin-top:4px"><input type="checkbox" id="ut-pa-vfe"'+(Pn.verFecha ? ' checked' : '')+'> <span>Su fecha y hora: la de la foto, si la trae; si no (las de WhatsApp no la traen), la del panel</span></label>'+
      '<label class="check" style="margin-top:6px"><input type="checkbox" id="ut-pa-vlu"'+(Pn.verLugar ? ' checked' : '')+'> <span>Su lugar: el frente, el área o el piso</span></label>'+
      '<label class="check" style="margin-top:6px"><input type="checkbox" id="ut-pa-vgp"'+(Pn.verGps ? ' checked' : '')+'> <span>Sus coordenadas, si la foto las trae o si las escribes (no es obligatorio)</span></label>'+
      '<div class="campo-dos" style="margin-top:12px"><div class="campo"><label for="ut-pa-nom">Lo elaboró <small>· opcional</small></label><input id="ut-pa-nom" maxlength="60" value="'+esc(Pn.nom)+'" placeholder="Nombre"></div>'+
        '<div class="campo"><label for="ut-pa-car">Cargo <small>· opcional</small></label><input id="ut-pa-car" maxlength="60" value="'+esc(Pn.cargo)+'" placeholder="Supervisor de SST"></div></div>'+
      '<div class="ut-acc" style="margin-top:14px"><button type="button" class="bt" id="ut-pa-bajar">⬇ Descargar el panel (PDF)</button>'+
        '<label class="bt sec" for="ut-pa-mas">＋ Agregar fotos</label><input type="file" id="ut-pa-mas" multiple accept="image/jpeg,image/png,.jpg,.jpeg,.png" class="pi-oculto"></div>'+
      '<p class="ayuda" id="ut-pa-est"></p>'+
    '</div><div class="ut-prev" id="ut-pa-prev" aria-label="Vista previa del panel"></div></div>'+
    '<p class="msg" id="ut-pan-msg"></p>'+
    '<div id="ut-pa-l"'+(hay ? '' : ' hidden')+'><h3 class="ut-h">Las fotos, en este orden <span><button type="button" class="bt-link" id="ut-pa-nom">ordenar por nombre</button> · <button type="button" class="bt-link" id="ut-pa-vaciar">quitar todas</button></span></h3>'+
      '<ol class="ut-fotos" id="ut-fotos"></ol></div>';
  if(!hay){ _utZonaAl('ut-pan-f', utPanSumar); return; }
  var T=_utTaller($('ut-pa-prev'), function(){
    return cargarEvPDF().then(function(){ return utPanPDF(2); }).then(function(R){
      var e=$('ut-pa-est'); if(e) e.textContent=R.n+(R.n===1 ? ' foto' : ' fotos')+' en '+R.hojas+(R.hojas===1 ? ' hoja A4.' : ' hojas A4.');
      return { datos:R.doc.output('blob'), max:2, total:R.hojas };
    });
  });
  UTW.panT=T;
  var pide=function(ms){ _utGuardar(); T.pide(ms); };
  $('ut-pa-tit').oninput=function(){ Pn.tit=this.value.slice(0, 80); pide(500); };
  $('ut-pa-sub').oninput=function(){ UTW.panSub=this.value.slice(0, 90); pide(500); };
  $('ut-pa-dia').onchange=function(){ UTW.panDia=this.value||''; pide(); };
  _utChipsAl('ut-pa-por', function(v){ Pn.por=UT_PAN_POR[v] ? +v : 4; pide(); });
  $('ut-pa-logo').onchange=function(){ Pn.logo=this.checked; pide(); };
  [['ut-pa-vfe', 'verFecha'], ['ut-pa-vlu', 'verLugar'], ['ut-pa-vgp', 'verGps']].forEach(function(x){ $(x[0]).onchange=function(){ Pn[x[1]]=this.checked; _utPanLista(); pide(); }; });
  $('ut-pa-nom').oninput=function(){ Pn.nom=this.value.slice(0, 60); pide(500); };
  $('ut-pa-car').oninput=function(){ Pn.cargo=this.value.slice(0, 60); pide(500); };
  _utLogoP().then(function(lg){ var l=$('ut-pa-logo-l'); if(l) l.hidden=!lg; });
  $('ut-pa-mas').onchange=function(){ var l=Array.prototype.slice.call(this.files||[]); this.value=''; if(l.length) utPanSumar(l); };
  $('ut-pa-bajar').onclick=function(){ utPanBajar(this); };
  $('ut-pa-nom').onclick=function(){ L.sort(function(a, b){ return String(a.n).localeCompare(String(b.n), 'es', { sensitivity:'base', numeric:true }); }); _utPanLista(); pide(); };
  $('ut-pa-vaciar').onclick=function(){ L.forEach(function(F){ try{ URL.revokeObjectURL(F.url); }catch(_r){} }); UTW.pan.fotos=[]; utPanPintar(c); };
  var ol=$('ut-fotos');
  ol.oninput=function(ev){
    var x=ev.target, q=x && x.getAttribute('data-ut-c'), F=q ? _utFotoDe(x.getAttribute('data-id')) : null; if(!F) return;
    if(q==='nota') F.nota=x.value.slice(0, 140); else if(q==='lugar') F.lugar=x.value.slice(0, 60);
    else if(q==='fecha') F.fecha=x.value; else if(q==='gps') F.gps=x.value.slice(0, 40);
    T.pide(600);
  };
  ol.onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('[data-ut-f]') : null; if(!b || b.disabled) return;
    var id=b.getAttribute('data-id'), i=L.map(function(F){ return F.id; }).indexOf(id), q=b.getAttribute('data-ut-f'); if(i<0) return;
    if(q==='quita'){ try{ URL.revokeObjectURL(L[i].url); }catch(_r){} L.splice(i, 1); if(!L.length){ utPanPintar(c); return; } }
    else if(q==='sube' && i>0){ var a=L[i-1]; L[i-1]=L[i]; L[i]=a; }
    else if(q==='baja' && i<L.length-1){ var z=L[i+1]; L[i+1]=L[i]; L[i]=z; }
    _utPanLista();
    var nb=ol.querySelector('[data-ut-f="'+q+'"][data-id="'+id+'"]'); if(nb && !nb.disabled) try{ nb.focus(); }catch(_f){}
    T.pide(250);
  };
  _utPanLista();
  T.pide();
}
function _utFotoDe(id){ var L=UTW.pan.fotos; for(var i=0;i<L.length;i++) if(L[i].id===id) return L[i]; return null; }
function _utPanLista(){
  var ol=$('ut-fotos'); if(!ol) return;
  var L=UTW.pan.fotos, Pn=_utOp().pan;
  ol.innerHTML=L.map(function(F, i){
    var de=F.exif || {}, origen=de.fecha ? 'de la foto' : '';
    return '<li class="ut-foto" data-id="'+esc(F.id)+'"><img src="'+esc(F.url)+'" alt="" loading="lazy">'+
      '<div class="ut-foto-c"><b>Foto '+(i+1)+(de.fecha ? ' <span class="ut-exif">📷 con su fecha'+(de.lat!==undefined ? ' y su ubicación' : '')+'</span>' : '')+'</b>'+
        '<input data-ut-c="nota" data-id="'+esc(F.id)+'" maxlength="140" value="'+esc(F.nota)+'" placeholder="Qué se ve: la actividad, lo que se corrigió" aria-label="Lo que se ve en la foto '+(i+1)+'">'+
        ((Pn.verLugar || Pn.verFecha || Pn.verGps) ? '<div class="ut-foto-x">'+
          (Pn.verLugar ? '<input data-ut-c="lugar" data-id="'+esc(F.id)+'" maxlength="60" value="'+esc(F.lugar||'')+'" placeholder="Lugar: frente, área, piso" aria-label="El lugar de la foto '+(i+1)+'">' : '')+
          (Pn.verFecha ? '<input type="datetime-local" data-ut-c="fecha" data-id="'+esc(F.id)+'" value="'+esc(F.fecha||'')+'" aria-label="La fecha y hora de la foto '+(i+1)+(origen ? ' ('+origen+')' : ': si la dejas vacía, va la del panel')+'" title="'+(origen ? 'La fecha y la hora que trae la foto' : 'Sin fecha en la foto: si la dejas vacía, va la del panel')+'">' : '')+
          (Pn.verGps ? '<input data-ut-c="gps" data-id="'+esc(F.id)+'" maxlength="40" value="'+esc(F.gps||'')+'" placeholder="-12.04640, -77.04280" aria-label="Las coordenadas de la foto '+(i+1)+'">' : '')+
        '</div>' : '')+'</div>'+
      '<div class="ut-foto-b"><button type="button" class="bt sec chico" data-ut-f="sube" data-id="'+esc(F.id)+'" aria-label="Subir la foto '+(i+1)+'"'+(i===0 ? ' disabled' : '')+'>↑</button>'+
        '<button type="button" class="bt sec chico" data-ut-f="baja" data-id="'+esc(F.id)+'" aria-label="Bajar la foto '+(i+1)+'"'+(i===L.length-1 ? ' disabled' : '')+'>↓</button>'+
        '<button type="button" class="bt sec chico" data-ut-f="quita" data-id="'+esc(F.id)+'" aria-label="Quitar la foto '+(i+1)+'">✕</button></div></li>';
  }).join('');
}
function _utFotoProbar(f){
  var ex=(/jpe?g/i.test(f.type||'') || /\.jpe?g$/i.test(f.name||'')) ? f.slice(0, 262144).arrayBuffer().then(utExif, function(){ return {}; }) : Promise.resolve({});
  return ex.then(function(E){
    return new Promise(function(res){
      var u=URL.createObjectURL(f), im=new Image();
      im.onload=function(){ res({ id:'f'+(++_UT_ID), n:f.name, url:u, w:im.naturalWidth, h:im.naturalHeight, nota:'', lugar:'', j:{}, exif:E,
                                   fecha:E.fecha || '', gps:(E.lat!==undefined ? E.lat.toFixed(5)+', '+E.lon.toFixed(5) : '') }); };
      im.onerror=function(){ try{ URL.revokeObjectURL(u); }catch(_r){} res(null); };
      im.src=u;
    });
  });
}
/* V7.9b · la fecha (DateTimeOriginal) y el GPS de un JPG (EXIF); {} si no los trae (WhatsApp los borra) */
function utExif(ab){
  try{
    var v=new DataView(ab), n=v.byteLength, o=2;
    if(n<4 || v.getUint16(0)!==0xFFD8) return {};
    while(o+4<=n){
      if(v.getUint8(o)!==0xFF) return {};
      var m=v.getUint8(o+1), L=v.getUint16(o+2);
      if(m===0xE1 && L>8 && o+10<=n && v.getUint32(o+4)===0x45786966) return _utTiff(v, o+10, Math.min(n, o+2+L));
      if(m===0xDA || L<2) return {};
      o+=2+L;
    }
  }catch(_e){}
  return {};
}
function _utTiff(v, t0, fin){
  var le=(v.getUint16(t0)===0x4949), g16=function(q){ return v.getUint16(q, le); }, g32=function(q){ return v.getUint32(q, le); };
  if(g16(t0+2)!==42) return {};
  var ifd=function(off){ var q=t0+off, out={}; if(!(off>0) || q+2>fin) return out; var c=Math.min(g16(q), 200); for(var i=0;i<c;i++){ var e=q+2+i*12; if(e+12>fin) break; out[g16(e)]={ t:g16(e+2), c:g32(e+4), v:e+8 }; } return out; };
  var val=function(E){
    if(!E) return null;
    var tam={ 1:1, 2:1, 3:2, 4:4, 5:8, 7:1, 9:4, 10:8 }[E.t] || 1, tot=tam*E.c, q=(tot>4) ? t0+g32(E.v) : E.v, i;
    if(E.c>4096 || q+tot>fin) return null;
    if(E.t===2){ var s2=''; for(i=0;i<E.c;i++){ var ch=v.getUint8(q+i); if(!ch) break; s2+=String.fromCharCode(ch); } return s2; }
    if(E.t===5){ var a=[]; for(i=0;i<E.c;i++){ var nu=g32(q+i*8), de=g32(q+i*8+4); a.push(de ? nu/de : 0); } return a; }
    if(E.t===3) return g16(q);
    if(E.t===4) return g32(q);
    return null;
  };
  var I0=ifd(g32(t0+4)), r={}, fe=null;
  if(I0[0x8769]){ var EX=ifd(val(I0[0x8769])); fe=val(EX[0x9003]) || val(EX[0x9004]); }
  if(!fe) fe=val(I0[0x0132]);
  var m=/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/.exec(fe || '');
  if(m && m[1]!=='0000' && +m[2]>=1 && +m[2]<=12) r.fecha=m[1]+'-'+m[2]+'-'+m[3]+'T'+m[4]+':'+m[5];
  if(I0[0x8825]){
    var G=ifd(val(I0[0x8825])), la=val(G[2]), lo=val(G[4]), laR=val(G[1]) || '', loR=val(G[3]) || '';
    if(la && lo && la.length===3 && lo.length===3){
      var dla=la[0]+la[1]/60+la[2]/3600, dlo=lo[0]+lo[1]/60+lo[2]/3600;
      if(/S/i.test(laR)) dla=-dla; if(/W/i.test(loR)) dlo=-dlo;
      if(isFinite(dla) && isFinite(dlo) && Math.abs(dla)<=90 && Math.abs(dlo)<=180 && (dla || dlo)){ r.lat=Math.round(dla*1e5)/1e5; r.lon=Math.round(dlo*1e5)/1e5; }
    }
  }
  return r;
}
function utPanSumar(files){
  var L=UTW.pan.fotos, malos=[], nuevos=[];
  Array.prototype.forEach.call(files||[], function(f){
    if(!(/^image\//i.test(f.type||'') || /\.(jpe?g|png)$/i.test(f.name||''))){ malos.push('«'+f.name+'» no es una foto'); return; }
    if(f.size>30*1048576){ malos.push('«'+f.name+'» pesa más de 30 MB'); return; }
    if(L.length+nuevos.length>=UT_PAN_MAX){ malos.push('«'+f.name+'» (ya son '+UT_PAN_MAX+')'); return; }
    nuevos.push(f);
  });
  return Promise.all(nuevos.map(_utFotoProbar)).then(function(r){
    var conF=0, conG=0, ok=0;
    r.forEach(function(x, i){ if(x){ L.push(x); ok++; if(x.exif && x.exif.fecha) conF++; if(x.exif && x.exif.lat!==undefined) conG++; } else malos.push('«'+nuevos[i].name+'» no se puede leer (si es HEIC, del iPhone, pásala a JPG)'); });
    var c=$('ut-cuerpo'); if(c && UTW.tab==='pan') utPanPintar(c);
    var dice=ok ? (conF===ok ? (ok===1 ? 'La foto trae su fecha y hora.' : 'Las '+ok+' traen su fecha y hora.') : conF ? conF+' de '+ok+' traen su fecha y hora; las demás llevan la del panel.' : (ok===1 ? 'La foto no trae su fecha (pasa con las de WhatsApp): lleva la del panel.' : 'No traen su fecha (pasa con las de WhatsApp): llevan la del panel.'))+
                 (conG ? ' '+(conG===1 ? 'Una trae' : conG+' traen')+' sus coordenadas.' : '') : '';
    _utMsg($('ut-pan-msg'), malos.length ? 'No entran: '+malos.join(', ')+'.'+(dice ? ' '+dice : '') : dice, !!malos.length);
  });
}
/* la foto achicada (el lado mayor, en px) y en JPG, una vez por tamaño */
function _utFotoJpg(F, px){
  F.j=F.j||{};
  if(F.j[px]) return F.j[px];
  F.j[px]=new Promise(function(res, rej){
    var im=new Image();
    im.onload=function(){
      var w=im.naturalWidth||1, h=im.naturalHeight||1, k=Math.min(1, px/Math.max(w, h)), cv=document.createElement('canvas');
      cv.width=Math.max(1, Math.round(w*k)); cv.height=Math.max(1, Math.round(h*k));
      var cx=cv.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(im, 0, 0, cv.width, cv.height);
      res({ d:cv.toDataURL('image/jpeg', 0.8), w:cv.width, h:cv.height });
    };
    im.onerror=function(){ rej('foto'); };
    im.src=F.url;
  });
  F.j[px].catch(function(){ F.j[px]=null; });
  return F.j[px];
}
/* el logo de la empresa (sst_doc «empleador»), en PNG; null si no tiene */
function _utLogoP(){
  if(UTW.logoP) return UTW.logoP;
  UTW.logoP=Promise.resolve(typeof empleadorP==='function' ? empleadorP() : {}).then(null, function(){ return {}; }).then(function(e){
    var src=e && e.logo; if(!src) return null;
    return new Promise(function(res){
      var im=new Image();
      im.onload=function(){
        var w=im.naturalWidth||300, h=im.naturalHeight||150, k=Math.min(1, 600/Math.max(w, h)), cv=document.createElement('canvas');
        cv.width=Math.max(1, Math.round(w*k)); cv.height=Math.max(1, Math.round(h*k));
        try{ cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); res({ d:cv.toDataURL('image/png'), w:cv.width, h:cv.height }); }catch(_t){ res(null); }
      };
      im.onerror=function(){ res(null); };
      im.src=src;
    });
  });
  return UTW.logoP;
}
/* el panel en PDF (A4, en mm). hojasMax: solo las primeras (la vista previa) */
function utPanPDF(hojasMax){
  var J=window.jspdf && window.jspdf.jsPDF; if(!J) return Promise.reject('sin_red');
  var Pn=_utOp().pan, L=UT_PAN_POR[Pn.por]||UT_PAN_POR[4], fotos=UTW.pan.fotos, porH=L.c*L.f, hojas=Math.max(1, Math.ceil(fotos.length/porH));
  var ver=hojasMax ? Math.min(hojas, hojasMax) : hojas, lista=fotos.slice(0, ver*porH);
  return Promise.all([Pn.logo ? _utLogoP() : null, Promise.all(lista.map(function(F){ return _utFotoJpg(F, L.px).then(null, function(){ return null; }); }))]).then(function(r){
    var logo=r[0], img=r[1], doc=new J({ unit:'mm', format:'a4', orientation:'portrait' });
    var x0=12, y0=31, W=186, H=253, g=5, cw=(W-g*(L.c-1))/L.c, ch=(H-g*(L.f-1))/L.f;
    for(var h=0;h<ver;h++){
      if(h) doc.addPage();
      _utPanCab(doc, Pn, logo, h+1, hojas);
      for(var j=0;j<porH;j++){
        var k=h*porH+j; if(k>=lista.length) break;
        _utPanCelda(doc, L, x0+(j%L.c)*(cw+g), y0+Math.floor(j/L.c)*(ch+g), cw, ch, k+1, lista[k], img[k]);
      }
    }
    try{ doc.setProperties({ title:_utWin(Pn.tit||'Panel de fotos'), creator:'OBRASST · Utilitarios PDF y fotos' }); }catch(_p){}
    return { doc:doc, n:fotos.length, hojas:hojas };
  });
}
function _utPanCab(doc, Pn, logo, h, N){
  var x=12;
  if(logo){ var lw=Math.min(38, 13*logo.w/logo.h), lh=lw*logo.h/logo.w; doc.addImage(logo.d, 'PNG', 12, 9+(13-lh)/2, lw, lh); x=12+lw+5; }
  var t=_utWin(Pn.tit||'').trim() || 'PANEL FOTOGRÁFICO';
  doc.setTextColor(11, 42, 58); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text(doc.splitTextToSize(t, 198-x)[0], x, 15.5);
  var sub=[_utWin(UTW.panSub||'').trim(), UTW.panDia ? fechaLarga(UTW.panDia) : ''].filter(Boolean).join(' · ');
  /* V7.9b · quién lo elaboró, a la derecha */
  var quien=[_utWin(Pn.nom||'').trim(), _utWin(Pn.cargo||'').trim()].filter(Boolean).join(' · '), anQ=0;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  if(quien){ quien='Elaboró: '+quien; anQ=Math.min(doc.getTextWidth(quien), (198-x)*0.55); doc.setTextColor(90, 105, 115); doc.text(_utCorta(doc, quien, anQ), 198, 21.5, { align:'right' }); }
  if(sub){ doc.setTextColor(90, 105, 115); doc.text(_utCorta(doc, sub, 198-x-(anQ ? anQ+6 : 0)), x, 21.5); }
  doc.setDrawColor(203, 212, 219); doc.setLineWidth(0.3); doc.line(12, 26, 198, 26);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(120, 132, 140);
  doc.text('Generado con OBRASST el '+fechaLarga(hoyISO()), 12, 290);
  doc.text('Hoja '+h+' de '+N, 198, 290, { align:'right' });
}
function _utPanCelda(doc, L, x, y, w, h, num, F, I){
  doc.setDrawColor(214, 221, 226); doc.setLineWidth(0.25); doc.roundedRect(x, y, w, h, 1.6, 1.6, 'S');
  var p=2, bw=w-2*p, bh=h-_utPanCap(L)-2*p;
  if(I){ var k=Math.min(bw/I.w, bh/I.h), iw=I.w*k, ih=I.h*k; doc.addImage(I.d, 'JPEG', x+p+(bw-iw)/2, y+p+(bh-ih)/2, iw, ih); }
  else { doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(150, 150, 150); doc.text('No se pudo leer esta foto', x+w/2, y+h/2, { align:'center' }); }
  var lh=L.fs*0.3528*1.25, cap=_utPanCap(L), cy=y+h-cap+1.5+lh*0.8, Pn=_utOp().pan;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(L.fs); doc.setTextColor(11, 42, 58);
  /* V7.9b · «Foto 3 · 28/10/2026 09:14» (la de la foto o la del panel) */
  var fe=Pn.verFecha ? utPanFecha(F) : '';
  doc.text(_utCorta(doc, 'Foto '+num+(fe ? ' · '+fe : ''), w-2*p), x+p, cy);
  var dond=_utPanDonde(F, Pn), nota=_utWin(F.nota||'').trim(), libres=Math.max(1, Math.floor((cap-1.5-lh)/lh)) - (dond ? 1 : 0);
  if(nota && libres>0){
    doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 50, 61);
    var ls=doc.splitTextToSize(nota, w-2*p);
    if(ls.length>libres){ ls=ls.slice(0, libres); ls[libres-1]=ls[libres-1].replace(/\s*\S*$/, '')+'...'; }
    ls.forEach(function(l, i){ doc.text(l, x+p, cy+lh*(i+1)); });
  }
  if(dond){ doc.setFont('helvetica', 'normal'); doc.setFontSize(Math.max(6, L.fs-1)); doc.setTextColor(95, 108, 118); doc.text(_utCorta(doc, dond, w-2*p), x+p, y+h-1.6); }
}
/* el alto del pie de cada foto: un renglón más si va el lugar o las coordenadas */
function _utPanCap(L){ var Pn=_utOp().pan; return L.cap+((Pn.verLugar || Pn.verGps) ? L.fs*0.3528*1.25 : 0); }
/* la fecha y hora de la foto (dd/mm/aaaa hh:mm), o la del panel si no la trae */
function utPanFecha(F){
  var m=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(String(F.fecha||''));
  if(m) return m[3]+'/'+m[2]+'/'+m[1]+(m[4] ? ' '+m[4]+':'+m[5] : '');
  return UTW.panDia ? fechaLarga(UTW.panDia) : '';
}
/* «Frente 2 · -12.04640, -77.04280» */
function _utPanDonde(F, Pn){
  var a=[];
  if(Pn.verLugar && String(F.lugar||'').trim()) a.push(_utWin(F.lugar).trim());
  if(Pn.verGps){ var g=String(F.gps||'').replace(/[^0-9.,\-\s]/g, '').replace(/\s+/g, ' ').trim(); if(/\d/.test(g)) a.push(g); }
  return a.join(' · ');
}
function utPanBajar(b){
  var m=$('ut-pan-msg'); if(!UTW.pan.fotos.length) return;
  b.disabled=true; _utMsg(m, 'Armando el panel ('+UTW.pan.fotos.length+' fotos)…');
  cargarEvPDF().then(function(){ return utPanPDF(0); }).then(function(R){
    var nom=_utNombre((_utWin(_utOp().pan.tit||'').trim() || 'Panel de fotos')+(UTW.panDia ? ' '+fechaLarga(UTW.panDia).replace(/\//g, '-') : ''), '.pdf');
    _utBajar(R.doc.output('blob'), 'application/pdf', nom); b.disabled=false;
    _utMsg(m, 'Listo: se descargó «'+nom+'», '+R.hojas+(R.hojas===1 ? ' hoja.' : ' hojas.'));
  }, function(e){ b.disabled=false; _utMsg(m, _utErrPdf(e), true); });
}

/* ═══ ETIQUETAS QR ═══════════════════════════════════════════════════════════════════════════════════════════════════ */
/* lo que va en las etiquetas: [{ t:lo que abre el QR, pie:lo que va debajo, l:su línea }] */
function utQrItems(Q){
  var out=[], vacias=0;
  if(Q.modo==='lista'){
    String(Q.lista||'').split(/\r?\n/).forEach(function(l, i){
      l=l.trim(); if(!l) return;
      if(out.length>=UT_QR_MAX) return;
      var p=l.indexOf('|'), t=(p>-1 ? l.slice(0, p) : l).trim(), pie=(p>-1 ? l.slice(p+1) : ((l.length<=40 && !/^https?:\/\//i.test(l)) ? l : '')).trim();
      if(!t){ vacias++; return; }
      out.push({ t:t, pie:pie, l:i+1 });
    });
  }else{
    var t=String(Q.txt||'').trim();
    if(t){ var n=Math.max(1, Math.min(500, parseInt(Q.copias, 10) || utQrGeo(Q, !!String(Q.pie||'').trim()).por)); for(var k=0;k<n;k++) out.push({ t:t, pie:String(Q.pie||'').trim(), l:1 }); }
  }
  return { items:out, vacias:vacias };
}
function utQrGeo(Q, conPie){
  var T=UT_QR_TAM[Q.tam]||UT_QR_TAM['40'], lh=T.fs*0.3528, pad=4, titH=_utWin(Q.tit||'').trim() ? lh*1.3+2 : 0, pieH=conPie ? lh*1.25*2+2 : 0;
  var w=T.q+pad*2, h=T.q+pad*2+titH+pieH, g=4, c=Math.max(1, Math.floor((190+g)/(w+g))), f=Math.max(1, Math.floor((277+g)/(h+g)));
  return { T:T, lh:lh, pad:pad, titH:titH, pieH:pieH, w:w, h:h, g:g, c:c, f:f, por:c*f, gx:(210-c*w-(c-1)*g)/2, gy:(297-f*h-(f-1)*g)/2 };
}
function _utQrHacer(t){ var q=qrcode(0, 'M'); q.addData(_utUtf8(t)); q.make(); return q; }
function _utQrDib(doc, qr, x, y, lado){
  var n=qr.getModuleCount(), t=lado/(n+4);
  doc.setFillColor(255, 255, 255); doc.rect(x, y, lado, lado, 'F'); doc.setFillColor(0, 0, 0);
  for(var r=0;r<n;r++){ var c=0; while(c<n){ if(!qr.isDark(r, c)){ c++; continue; } var c0=c; while(c<n && qr.isDark(r, c)) c++; doc.rect(x+(c0+2)*t, y+(r+2)*t, (c-c0)*t+0.02, t+0.02, 'F'); } }
}
function _utCorta(doc, t, ancho){ if(doc.getTextWidth(t)<=ancho) return t; while(t.length>1 && doc.getTextWidth(t+'...')>ancho) t=t.slice(0, -1); return t+'...'; }
function utQrPDF(Q){
  var J=window.jspdf && window.jspdf.jsPDF; if(!J || typeof qrcode!=='function') return null;
  var R=utQrItems(Q), cache={}, ok=[], largos=[];
  R.items.forEach(function(x){
    var q=cache[x.t];
    if(q===undefined){ try{ q=_utQrHacer(x.t); }catch(_e){ q=null; } cache[x.t]=q; }
    if(q) ok.push({ x:x, q:q }); else if(largos.indexOf(x.l)<0) largos.push(x.l);
  });
  if(!ok.length) return { vacio:true, largos:largos, vacias:R.vacias };
  var G=utQrGeo(Q, ok.some(function(o){ return !!o.x.pie; })), doc=new J({ unit:'mm', format:'a4', orientation:'portrait' }), tit=_utWin(Q.tit||'').trim();
  ok.forEach(function(o, i){
    if(i && i%G.por===0) doc.addPage();
    var j=i%G.por, x=G.gx+(j%G.c)*(G.w+G.g), y=G.gy+Math.floor(j/G.c)*(G.h+G.g), yy=y+G.pad;
    doc.setDrawColor(170, 180, 188); doc.setLineWidth(0.2); doc.setLineDashPattern([1.2, 1.2], 0); doc.roundedRect(x, y, G.w, G.h, 2, 2, 'S'); doc.setLineDashPattern([], 0);
    if(tit){ doc.setFont('helvetica', 'bold'); doc.setFontSize(G.T.fs); doc.setTextColor(11, 42, 58); doc.text(_utCorta(doc, tit, G.w-4), x+G.w/2, yy+G.lh, { align:'center' }); yy+=G.titH; }
    _utQrDib(doc, o.q, x+G.pad, yy, G.T.q); yy+=G.T.q;
    var pie=_utWin(o.x.pie||'').trim();
    if(pie){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(G.T.fs); doc.setTextColor(30, 40, 48);
      var ls=doc.splitTextToSize(pie, G.w-4); if(ls.length>2){ ls=ls.slice(0, 2); ls[1]=_utCorta(doc, ls[1], G.w-8); }
      ls.forEach(function(l, k){ doc.text(l, x+G.w/2, yy+1.5+G.lh*(1+k*1.25), { align:'center' }); });
    }
  });
  try{ doc.setProperties({ title:'Etiquetas QR', creator:'OBRASST · Utilitarios PDF y fotos' }); }catch(_p){}
  return { doc:doc, n:ok.length, hojas:Math.ceil(ok.length/G.por), por:G.por, largos:largos, vacias:R.vacias };
}
/* el QR solo, en PNG (con lo que va debajo, si hay) */
function utQrPng(Q){
  var t=String(Q.txt||'').trim(); if(!t) return Promise.reject('vacio');
  var q; try{ q=_utQrHacer(t); }catch(_e){ return Promise.reject('largo'); }
  var n=q.getModuleCount(), mz=4, px=Math.max(6, Math.floor(1024/(n+mz*2))), lado=px*(n+mz*2), pie=String(Q.pie||'').trim(), pieH=pie ? Math.round(lado*0.14) : 0;
  var cv=document.createElement('canvas'); cv.width=lado; cv.height=lado+pieH;
  var cx=cv.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.fillStyle='#000';
  for(var r=0;r<n;r++) for(var c=0;c<n;c++) if(q.isDark(r, c)) cx.fillRect((c+mz)*px, (r+mz)*px, px, px);
  if(pie){
    var fs=Math.round(pieH*0.46); cx.fillStyle='#0B2A3A'; cx.textAlign='center'; cx.textBaseline='middle';
    do{ cx.font='600 '+fs+'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'; fs-=2; }while(fs>10 && cx.measureText(pie).width>lado*0.92);
    cx.fillText(pie, lado/2, lado+pieH*0.32, lado*0.94);
  }
  return new Promise(function(res, rej){ cv.toBlob(function(b){ if(b) res(b); else rej('png'); }, 'image/png'); });
}
function _utQrAviso(Q, R){
  var a=[];
  var mira=Q.modo==='lista' ? String(Q.lista||'').split(/\r?\n/).map(function(l){ var p=l.indexOf('|'); return (p>-1 ? l.slice(0, p) : l).trim(); }) : [String(Q.txt||'').trim()];
  if(mira.some(function(t){ return /^(www\.|[a-z0-9-]+\.(com|pe|org|net|io|app)(\.[a-z]{2})?(\/|$))/i.test(t); })) a.push('¿Es un enlace? Ponle https:// adelante, para que el celular lo abra.');
  if(R && R.largos && R.largos.length) a.push(Q.modo==='lista' ? 'Muy largo para un QR (no va): la línea '+R.largos.join(', ')+'.' : 'Es muy largo para un QR: usa un enlace más corto.');
  if(Q.modo==='lista' && String(Q.lista||'').split(/\r?\n/).filter(function(l){ return l.trim(); }).length>UT_QR_MAX) a.push('Van las primeras '+UT_QR_MAX+' líneas.');
  return a.join(' ');
}
function utQrPintar(c){
  var Q=_utOp().qr, uno=(Q.modo!=='lista');
  c.innerHTML=_utIntro('Un <b>QR</b> para imprimir: un enlace (una carpeta compartida, un formulario, un video) o un texto (el código de un equipo). Sale en etiquetas con su línea de corte, del tamaño que elijas; o una <b>lista</b>: una etiqueta por línea. Y el QR solo, en PNG.')+
    '<div class="ut-ed"><div class="ut-form">'+
      '<div class="campo"><label>Qué vas a imprimir</label>'+_utChips('ut-qr-modo', [{ v:'uno', t:'Un QR, varias copias' }, { v:'lista', t:'Una lista: un QR por línea' }], uno ? 'uno' : 'lista', 'Un QR o una lista')+'</div>'+
      (uno ?
        '<div class="campo"><label for="ut-qr-txt">Lo que abre el QR <small>· un enlace o un texto</small></label><textarea id="ut-qr-txt" rows="3" maxlength="1200" placeholder="https://…">'+esc(Q.txt)+'</textarea></div>'+
        '<div class="campo"><label for="ut-qr-pie">Lo que va debajo <small>· opcional</small></label><input id="ut-qr-pie" maxlength="60" value="'+esc(Q.pie)+'" placeholder="Escanea: el plan de emergencia"></div>'+
        '<div class="campo"><label for="ut-qr-n">Cuántas copias</label><input id="ut-qr-n" type="number" min="1" max="500" step="1" value="'+(parseInt(Q.copias, 10) || '')+'" style="max-width:140px"><p class="ayuda" id="ut-qr-n-a"></p></div>'
      : '<div class="campo"><label for="ut-qr-lista">Una por línea: lo que abre el QR, «|» y lo que va debajo</label>'+
        '<textarea id="ut-qr-lista" rows="9" maxlength="30000" placeholder="EQ-001 | Taladro percutor&#10;EQ-002 | Amoladora&#10;https://… | Plan de emergencia">'+esc(Q.lista)+'</textarea>'+
        '<p class="ayuda">Sin «|», debajo va lo mismo que el QR, si es corto. Hasta '+UT_QR_MAX+' líneas.</p></div>')+
      '<div class="campo"><label for="ut-qr-tit">Arriba, en todas <small>· opcional: «ESCANÉAME», tu empresa</small></label><input id="ut-qr-tit" maxlength="30" value="'+esc(Q.tit)+'"></div>'+
      '<div class="campo"><label>Tamaño del QR</label>'+_utChips('ut-qr-tam', Object.keys(UT_QR_TAM).map(function(k){ return { v:k, t:UT_QR_TAM[k].n }; }), Q.tam, 'Tamaño del QR')+'</div>'+
      '<div class="ut-acc"><button type="button" class="bt" id="ut-qr-pdf">⬇ Descargar las etiquetas (PDF)</button>'+(uno ? '<button type="button" class="bt sec" id="ut-qr-png">⬇ El QR solo (PNG)</button>' : '')+'</div>'+
      '<p class="ayuda" id="ut-qr-est"></p><p class="msg" id="ut-qr-msg"></p>'+
      '<p class="ayuda">Antes de imprimir muchas, escanea el de la vista previa con tu celular. Imprime al 100 %, sin «ajustar a la página».</p>'+
    '</div><div class="ut-prev" id="ut-qr-prev" aria-label="Vista previa de las etiquetas"></div></div>';
  var T=_utTaller($('ut-qr-prev'), function(){
    return Promise.all([cargarEvPDF(), cargarQRLib()]).then(function(){
      var R=utQrPDF(Q), est=$('ut-qr-est'), m=$('ut-qr-msg'), av=_utQrAviso(Q, R);
      _utMsg(m, av, !!(R && R.largos && R.largos.length));
      var na=$('ut-qr-n-a'); if(na){ var G=utQrGeo(Q, !!String(Q.pie||'').trim()); na.textContent='Vacío: una hoja A4 llena ('+G.por+' de '+G.T.n+').'; }
      if(!R || R.vacio){ if(est) est.textContent=''; return { msg:uno ? 'Escribe lo que abre el QR' : 'Escribe la lista', sub:uno ? 'Un enlace (https://…) o un texto.' : 'Una etiqueta por línea.' }; }
      if(est) est.textContent=R.n+(R.n===1 ? ' etiqueta' : ' etiquetas')+' en '+R.hojas+(R.hojas===1 ? ' hoja A4' : ' hojas A4')+' ('+R.por+' por hoja).';
      return { datos:R.doc.output('blob'), max:1, total:R.hojas };
    });
  });
  var pide=function(ms){ _utGuardar(); T.pide(ms); };
  _utChipsAl('ut-qr-modo', function(v){ Q.modo=(v==='lista') ? 'lista' : 'uno'; _utGuardar(); utQrPintar(c); });
  _utChipsAl('ut-qr-tam', function(v){ Q.tam=UT_QR_TAM[v] ? v : '40'; pide(); });
  $('ut-qr-tit').oninput=function(){ Q.tit=this.value.slice(0, 30); pide(450); };
  if(uno){
    $('ut-qr-txt').oninput=function(){ Q.txt=this.value.slice(0, 1200); pide(450); };
    $('ut-qr-pie').oninput=function(){ Q.pie=this.value.slice(0, 60); pide(450); };
    $('ut-qr-n').oninput=function(){ var v=parseInt(this.value, 10); Q.copias=(v>=1 && v<=500) ? v : 0; pide(450); };
    $('ut-qr-png').onclick=function(){
      var m=$('ut-qr-msg');
      cargarQRLib().then(function(){ return utQrPng(Q); }).then(function(b){
        var nom=_utNombre('QR '+(String(Q.pie||'').trim() || String(Q.txt||'').trim().replace(/^https?:\/\//i, '')).slice(0, 60), '.png');
        _utBajar(b, 'image/png', nom); _utMsg(m, 'Listo: se descargó «'+nom+'».');
      }, function(e){ _utMsg(m, e==='vacio' ? 'Escribe lo que abre el QR.' : e==='largo' ? 'Es muy largo para un QR: usa un enlace más corto.' : 'No se pudo armar el QR.', true); });
    };
  }else{
    $('ut-qr-lista').oninput=function(){ Q.lista=this.value.slice(0, 30000); pide(600); };
  }
  $('ut-qr-pdf').onclick=function(){
    var b=this, m=$('ut-qr-msg'); b.disabled=true;
    Promise.all([cargarEvPDF(), cargarQRLib()]).then(function(){
      var R=utQrPDF(Q); b.disabled=false;
      if(!R || R.vacio){ _utMsg(m, uno ? 'Escribe lo que abre el QR.' : 'Escribe la lista: una etiqueta por línea.', true); return; }
      var nom=_utNombre('Etiquetas QR '+fechaLarga(hoyISO()).replace(/\//g, '-'), '.pdf');
      _utBajar(R.doc.output('blob'), 'application/pdf', nom);
      _utMsg(m, 'Listo: se descargó «'+nom+'»: '+R.n+(R.n===1 ? ' etiqueta.' : ' etiquetas.')+' Imprímelas al 100 % y córtalas por la línea punteada.');
    }, function(e){ b.disabled=false; _utMsg(m, _utErrPdf(e), true); });
  };
  T.pide();
}

/* ── el aspecto ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
function _utCss(){
  if($('ut-css')) return;
  var st=document.createElement('style'); st.id='ut-css';
  st.textContent=[
    '.ut-tabs{display:flex;flex-wrap:wrap;max-width:100%;margin-bottom:8px}',
    '.ut-priv{margin:0 0 14px;font-size:12.5px;color:var(--gris)}',
    '.ut-intro{margin:0 0 14px;max-width:80ch;line-height:1.55}',
    '.ut-gris{color:var(--gris)}',
    '#ut-cuerpo label.bt{margin:0}',
    '.ut-zona{cursor:pointer}',
    '.ut-ed{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,400px);gap:18px;align-items:start}',
    '@media (max-width:900px){.ut-ed{grid-template-columns:1fr}}',
    '.ut-form{background:var(--panel);border:1px solid var(--raya);border-radius:12px;padding:16px;min-width:0}',
    '.ut-sec{border-top:1px solid var(--raya);padding:14px 0 0;margin:14px 0 0}',
    '.ut-sec:first-child{border-top:0;padding-top:0;margin-top:0}',
    '.ut-on{margin:0;font-size:14px;color:var(--texto)}',
    '.ut-sub{padding:12px 0 0 28px}',
    '@media (max-width:520px){.ut-sub{padding-left:0}}',
    '.ut-sug{margin-top:8px}.ut-sug .chip{font-size:12px;padding:5px 9px}',
    '.ut-fila{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin:10px 0 0}',
    '.ut-firma{display:grid;place-items:center;min-height:84px;max-width:320px;border:1px dashed var(--raya2);border-radius:10px;padding:8px;',
      'background:repeating-conic-gradient(#F1F4F6 0% 25%,#fff 0% 50%) 50%/16px 16px}',
    '.ut-firma img{max-width:100%;max-height:110px}',
    '.ut-firma span{font-size:12.5px;color:var(--gris)}',
    '.ut-aviso{font-size:12.5px;line-height:1.5;background:var(--ojo-f);border:1px solid #EAD7B0;border-radius:8px;padding:8px 10px;margin:4px 0 0}',
    '.ut-prev{position:sticky;top:12px;display:grid;gap:12px;min-height:220px;background:var(--fondo);border:1px solid var(--raya);border-radius:12px;padding:12px;transition:opacity .15s}',
    '.ut-prev.viene{opacity:.55}',
    '.ut-hoja{margin:0;background:#fff;box-shadow:0 1px 3px rgba(11,42,58,.2)}',
    '.ut-hoja canvas{display:block;width:100%;height:auto}',
    '.ut-hoja figcaption{font-size:11.5px;color:var(--gris);padding:5px 8px;background:var(--fondo);text-align:center}',
    '.ut-mas{font-size:12px;color:var(--gris);margin:0;text-align:center}',
    '.ut-prev-msg{display:grid;gap:4px;align-content:center;min-height:190px;text-align:center;font-size:12.5px;color:var(--gris);padding:12px}',
    '.ut-prev-msg b{font-size:14px;color:var(--tinta)}',
    '.ut-arch{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;background:var(--panel);border:1px solid var(--raya);border-radius:10px;padding:10px 12px;margin:0 0 12px;overflow-wrap:anywhere}',
    '.ut-barra{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 4px}',
    '.ut-barra label{margin:0}',
    '.ut-barra input{width:170px;padding:7px 10px;font-size:14px}',
    '.ut-pags{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px;margin:12px 0 14px}',
    '.ut-pag{position:relative}',
    '.ut-pag-b{display:grid;gap:5px;width:100%;padding:6px;border:2px solid var(--raya);border-radius:10px;background:var(--panel);cursor:pointer;font:inherit;color:inherit}',
    '.ut-pag-b:focus-visible{outline:2px solid var(--azul);outline-offset:2px}',
    '.ut-pag.on .ut-pag-b{border-color:var(--azul);background:var(--azul-f)}',
    '.ut-pag-img{display:grid;place-items:center;aspect-ratio:1/1;overflow:hidden;background:var(--fondo);border-radius:6px}',
    '.ut-pag-img canvas{max-width:92%;max-height:92%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s}',
    '.ut-pag-n{font-size:12.5px;font-variant-numeric:tabular-nums}',
    '.ut-pag.on .ut-pag-n::before{content:"✓ ";color:var(--azul);font-weight:700}',
    '.ut-pag-g{position:absolute;top:11px;right:11px;width:30px;height:30px;border-radius:50%;border:1px solid var(--raya2);background:var(--panel);cursor:pointer;font-size:15px;line-height:1;color:var(--tinta)}',
    '.ut-pag-g:hover{background:var(--fondo)}',
    '.ut-pag-g.gira{background:var(--ojo-f);border-color:var(--ojo)}',
    '.ut-acc{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 4px}',
    '.ut-unir{max-width:72ch;background:var(--panel);border:1px solid var(--raya);border-radius:12px;padding:18px 20px}',
    '.ut-unir h3{margin:0 0 8px;font-size:16px;color:var(--tinta)}',
    '.ut-unir p{margin:0 0 10px;line-height:1.55}',
    '.ut-tips{margin:0 0 16px;padding-left:20px;line-height:1.55}',
    '.ut-tips li{margin:0 0 6px}',
    '.ut-h{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;font-size:14.5px;margin:20px 0 8px;color:var(--tinta)}',
    '.ut-h span{font-size:12.5px;font-weight:400;color:var(--gris)}',
    '.ut-fotos{list-style:none;margin:0;padding:0;display:grid;gap:8px}',
    '.ut-foto{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:12px;align-items:center;background:var(--panel);border:1px solid var(--raya);border-radius:10px;padding:8px}',
    '.ut-foto img{width:76px;height:57px;object-fit:cover;border-radius:6px;background:var(--fondo)}',
    '.ut-foto-c b{display:block;font-size:12.5px;margin:0 0 4px;color:var(--tinta)}',
    '.ut-foto-c input{padding:7px 10px;font-size:14px}',
    '.ut-foto-b{display:flex;gap:4px}',
    '.ut-foto-x{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
    '.ut-foto-x input{flex:1 1 150px;min-width:0;padding:6px 9px;font-size:13px}',
    '.ut-exif{font-weight:400;font-size:11.5px;color:var(--ok);margin-left:6px}',
    '.ut-lbl{font-size:12.5px;font-weight:500;color:var(--gris);margin:14px 0 0}',
    '.ut-foto-b .bt{width:32px;padding:7px 0}',
    '@media (max-width:560px){.ut-foto{grid-template-columns:60px minmax(0,1fr)}.ut-foto img{width:60px;height:45px}.ut-foto-b{grid-column:1/-1;justify-content:flex-end}}',
    '#ut-cuerpo textarea{width:100%;font-family:inherit}'
  ].join('\n');
  document.head.appendChild(st);
}
