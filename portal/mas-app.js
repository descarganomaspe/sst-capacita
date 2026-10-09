/* OBRASST · lo que «más por la web» (portal/mas.js) toma de la app: la papeleta de la amonestación, la firma y el
   carné de la credencial, las reglas, las actas y el libro del comité, y el ranking y el diploma del trabajador del
   mes. Son las funciones de la app, tal cual. Lo arma armar.py. No editar. */
var MAS_APP = (function(){
  /* lo que en la app sale del celular, aquí lo pone quien llama: MAS_APP.usar({ emp:{razon,logo,ruc,dom,proyecto,
     formatoCod,formatoRev,formatoFecha,codKardex}, logo:{du,r}, obra, codigo, sector, fmt:{amonestacion:{cod,rev,fecha}},
     base (la dirección de la app), doc (el documento del país), docs:{documento:tipo}, trabs:[{nombre,dni,puesto}],
     n (trabajadores activos), com (el comité guardado), cfg (los puntos del trabajador del mes), libre (plan de pago),
     sup (quien firma), tumbas (credenciales anuladas), rd (obra en República Dominicana), tx (la capa del país),
     creds (las credenciales de la obra, para la brigada); para «¿A quién acudo?», trabs lleva además fotoUrl y su id es el «ext» de la ficha }) */
  var _C = {}, _SALE = null;
  var LS = { sec:'__sec' }, LS_SUP = '__sup', LS_CRED = '__cred', MIS_EMP = [];
  function leer(k, d){ if(k === LS_SUP) return { nombre:_C.sup || '' }; if(k === LS_CRED) return Array.isArray(_C.creds) ? _C.creds : []; return d; }
  function empleador(){ return _C.emp || {}; }
  function empActiva(){ return { id:_C.id || '', nombre:_C.obra || '', codigo:_C.codigo || '', sector:_C.sector || '' }; }
  function nombreDeLaObra(){ return _C.obra || ''; }
  function trabsLocal(){ return _C.trabs || []; }
  function formatoDe(k){ var it = (_C.fmt && _C.fmt[k]) || {}, emp = empleador(), viejo = (k === 'kardex') ? (emp.codKardex || emp.formatoCod) : emp.formatoCod;
    return { cod:it.cod || viejo || '', rev:it.rev || emp.formatoRev || '00', fecha:it.fecha || emp.formatoFecha || '' }; }
  /* el logo en un PDF: dentro de su caja, centrado y sin deformarlo, ya sin su marco blanco (logoSinMarco, de la app) */
  function pdfLogo(doc, x, y, w, h, al){
    var emp = empleador(); if(!emp.logo) return false;
    var L = logoSinMarcoYa(emp.logo) || { du:emp.logo, r:1 }, r = L.r || 1, lw = w, lh = w / r;
    if(lh > h){ lh = h; lw = h * r; }
    var dx = (al === 'izq') ? 0 : (al === 'der' ? (w - lw) : (w - lw)/2);
    try{ doc.addImage(L.du, x + dx, y + (h - lh)/2, lw, lh, undefined, 'FAST'); return true; }catch(e){ return false; }
  }
  /* el sello del supervisor vive en su celular: en la web no hay */
  function selloDatos(){ return null; }
  function libre(){ return !!_C.libre; }
  function esRD(){ return !!_C.rd; }
  function comiteLocal(){ var c = _C.com; if(!c || typeof c !== 'object') c = _C.com = {}; if(!Array.isArray(c.miembros)) c.miembros = []; if(!Array.isArray(c.actas)) c.actas = []; return c; }
  function comiteCuantos(){ return +_C.n || 0; }
  /* «¿la empresa lleva más de una obra?»: lo contestado; sin contestar, lo que diga quien llama (cuántas obras administra) */
  function comiteVariasObras(){ var c = comiteLocal(); return (c.variasObras != null) ? !!c.variasObras : !!_C.varias; }
  function tdmCfg(){ var c = _C.cfg; return (c && Array.isArray(c.lista) && c.lista.length) ? { lista:c.lista, propios:Array.isArray(c.propios) ? c.propios : [], t:c.t || 0 } : { lista:TDM_DE_FABRICA.slice(), propios:[], t:0 }; }
  function credTumbas(){ return _C.tumbas || {}; }
  function baseURL(){ return _C.base || ''; }
  /* el tipo de documento: el de la ficha si se conoce; si no, el del país de la obra */
  function etDoc(num){ var n = String(num || '').trim().toUpperCase(); return (n && _C.docs && _C.docs[n]) || _C.doc || 'DNI'; }
  function _nombreSano(t){ return String(t || 'documento').replace(/[\\\/:*?"<>|\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70) || 'documento'; }
  function entregarPDF(doc, nombre){ _SALE = { blob:doc.output('blob'), nombre:nombre, hojas:doc.getNumberOfPages() }; }
  function aviso(){}
  /* el jsPDF de la app, con los textos pasados por la capa del país cuando la obra está afuera (como en la app) */
  var jspdf = { jsPDF: function(o){
    var d = new window.jspdf.jsPDF(o);
    if(typeof _C.tx === 'function'){
      var t0 = d.text, s0 = d.splitTextToSize, T = function(v){ return (typeof v === 'string') ? _C.tx(v) : (Array.isArray(v) ? v.map(function(x){ return (typeof x === 'string') ? _C.tx(x) : x; }) : v); };
      d.text = function(){ var x = [].slice.call(arguments); x[0] = T(x[0]); return t0.apply(this, x); };
      d.splitTextToSize = function(){ var x = [].slice.call(arguments); x[0] = T(x[0]); return s0.apply(this, x); };
    }
    return d;
  } };
/* ── de la app · lo común ── */
var MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
           'setiembre','octubre','noviembre','diciembre'];
var MESES_ES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
              'setiembre','octubre','noviembre','diciembre'];
var MESES_3=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SET','OCT','NOV','DIC'];
function dosD(n){ return (n<10?'0':'')+n; }
function _norml(t){
  return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function _selNorm(s){
  s = String(s||'').toLowerCase();
  try{ s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }catch(e){}
  return s;
}
function _norm(s){return (s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function _normNom(s){
  return String(s||'').normalize? String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
         .toUpperCase().replace(/[^A-Z0-9]/g,'')
       : _norm(s);
}
function _docLlave(v){ return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,''); }
function mesISO(){ var d=new Date(); return d.getFullYear()+'-'+dosD(d.getMonth()+1); }
function mesBonito(iso){
  var p=String(iso||mesISO()).split('-');
  return (MESES[(parseInt(p[1],10)||1)-1]||'')+' '+p[0];
}
function _ddmm(iso){
  if(!iso) return '';
  var p=String(iso).split('-');
  return p.length===3 ? (p[2]+'/'+p[1]+'/'+p[0].slice(2)) : iso;
}
function _pdfSello(doc, cx, yTop, o, w, chico){
  /* «que el sello sea negro y sin recuadro»: solo las lineas, en tinta
     negra, con el nombre en mayusculas. La colegiatura sale si la puso. */
  if(!o) return 0;
  w = w || (chico ? 118 : 176);
  var lh = chico ? 7.5 : 9.5;
  var lineas=[[String(o.nombre||'').toUpperCase(), chico?7.4:9, 'bold']];
  if(o.cargo)   lineas.push([o.cargo, chico?6.2:7.5, 'normal']);
  if(o.cip)     lineas.push([o.cip, chico?5.8:7, 'normal']);
  if(o.empresa && !chico) lineas.push([o.empresa, 6.4, 'normal']);
  var h = 4 + lineas.length*lh;
  doc.setTextColor(20,20,20);
  var yy=yTop+4+lh*0.7;
  lineas.forEach(function(l){
    doc.setFont('helvetica', l[2]); doc.setFontSize(l[1]);
    var tx=String(l[0]); while(doc.getTextWidth(tx)>w-6 && tx.length>4) tx=tx.slice(0,-2);
    doc.text(tx, cx, yy, {align:'center'}); yy+=lh;
  });
  return h;
}
function b64u(s){ return btoa(unescape(encodeURIComponent(s)))
  .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function deb64u(s){ s=(s||'').replace(/-/g,'+').replace(/_/g,'/');
  while(s.length%4) s+='='; return decodeURIComponent(escape(atob(s))); }
function baseURL(){
  var u=location.origin+location.pathname;
  if(u.indexOf('http')!==0) u='https://descarganomaspe.github.io/sst-capacita/';
  return u.replace(/index\.html$/,'');
}
var _LOGO_REC = {};
function _logoLlave(du){ du = String(du||''); return du.length + ':' + du.slice(-48); }
function logoSinMarcoYa(du){ var r = du ? _LOGO_REC[_logoLlave(du)] : null; return (r && r.listo) ? r.listo : null; }
function logoSinMarco(du){
  if(!du) return Promise.resolve(null);
  var k = _logoLlave(du);
  if(_LOGO_REC[k]) return _LOGO_REC[k].p;
  var o = { listo:null, p:null };
  o.p = new Promise(function(ok){
    var im = new Image();
    im.onload = function(){
      var w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, r = { du:du, r:(w/h)||1 };
      try{
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var g = c.getContext('2d'); g.drawImage(im, 0, 0);
        var d = g.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1;
        for(var y = 0; y < h; y++) for(var x = 0; x < w; x++){
          var i = (y*w + x)*4;
          if(d[i+3] < 24) continue;                                   /* transparente */
          if(d[i] > 234 && d[i+1] > 234 && d[i+2] > 234) continue;    /* blanco (y el ruido del JPEG) */
          if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y;
        }
        if(x1 >= 0){
          /* un respiro chiquito, parejo por los cuatro lados: el del lado corto */
          var m = Math.round(Math.min(x1 - x0, y1 - y0) * 0.04) + 1;
          x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
          var cw = x1 - x0 + 1, ch = y1 - y0 + 1;
          if(cw < w*0.97 || ch < h*0.97){
            var png = /^data:image\/png/i.test(du);
            var c2 = document.createElement('canvas'); c2.width = cw; c2.height = ch;
            var g2 = c2.getContext('2d');
            if(!png){ g2.fillStyle = '#fff'; g2.fillRect(0, 0, cw, ch); }
            g2.drawImage(c, x0, y0, cw, ch, 0, 0, cw, ch);
            r = { du: png ? c2.toDataURL('image/png') : c2.toDataURL('image/jpeg', 0.94), r: cw/ch };
          }
        }
      }catch(e){}
      o.listo = r; ok(r);
    };
    im.onerror = function(){ o.listo = null; ok(null); };
    im.src = du;
  });
  _LOGO_REC[k] = o;
  return o.p;
}
/* ── de la app · la amonestación ── */
var AMON_FIRMAS=[['trabajador','Trabajador'],['jefe','Jefe inmediato'],
                 ['produccion','Jefe de producción'],['ssoma','SSOMA']];
function _pdfDeAmon(a){
  var emp=empleador();
  var doc=new jspdf.jsPDF({unit:'pt', format:'a4'});
  var W=595.28, H=841.89, M=36, y=0;
  var recorto=false;

  /* ── cabecera con el logo y el codigo del formato ── */
  doc.setDrawColor(120,120,120); doc.setLineWidth(.8);
  doc.rect(M, 34, W-2*M, 56);
  doc.line(M+118, 34, M+118, 90);
  doc.line(W-M-118, 34, W-M-118, 90);
  if(emp.logo){
    if(!pdfLogo(doc, M+8, 42, 102, 40)) _rotulo();
  } else { _rotulo(); }
  function _rotulo(){
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(110,110,110);
    var li=doc.splitTextToSize(String(emp.razon||'EMPRESA'), 104).slice(0,3);
    var y0=62-(li.length-1)*5;
    li.forEach(function(t,i){ doc.text(t, M+59, y0+i*10, {align:'center'}); });
  }
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(20,20,20);
  doc.text('PAPELETA DE NOTIFICACIÓN', W/2, 58, {align:'center'});
  doc.setFontSize(9);
  doc.text('DE MEDIDA DISCIPLINARIA', W/2, 73, {align:'center'});
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(90,90,90);
  var _f=formatoDe('amonestacion');
  doc.text('Código: '+(_f.cod||'SSOMA-PC-FO-053'), W-M-110, 50);
  doc.text('Versión: '+(_f.rev||'00'),             W-M-110, 63);
  doc.text('Fecha: '+(_f.fecha? _ddmm(String(_f.fecha).slice(0,10)) : _ddmm(hoyISO())), W-M-110, 76);
  y=100;

  function bloque(pares, alto){
    alto=alto||30;
    var x=M, ancho=(W-2*M), acum=0;
    doc.setDrawColor(150,150,150); doc.setLineWidth(.6);
    doc.rect(x, y, ancho, alto);
    pares.forEach(function(par, i){
      var w=ancho*par[2];
      if(i>0) doc.line(x+acum, y, x+acum, y+alto);
      doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(120,120,120);
      doc.text(String(par[0]).toUpperCase(), x+acum+5, y+10);
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(25,25,25);
      var v=doc.splitTextToSize(String(par[1]==null||par[1]===''?'—':par[1]), w-10);
      doc.text(v[0]||'—', x+acum+5, y+23);
      acum+=w;
    });
    y+=alto;
  }
  function titulo(t){
    doc.setFillColor(11,42,58); doc.rect(M, y, W-2*M, 16, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(255,255,255);
    doc.text(String(t).toUpperCase(), M+6, y+11);
    y+=16;
  }

  bloque([['Empresa', emp.razon||'', .52],['RUC', emp.ruc||'', .20],['Fecha', fechaLarga(a.fecha)||a.fecha||'', .28]]);
  bloque([['Obra / proyecto', emp.proyecto || nombreDeLaObra() || emp.dom || '', 1]]);
  y+=8;
  titulo('Datos del trabajador');
  bloque([['Apellidos y nombres', a.tNombre||'', .54],['DNI', a.tDni||'', .18],['Cargo', a.tPuesto||'', .28]]);
  y+=8;
  titulo('Quien impone la medida');
  bloque([['Apellidos y nombres', a.qNombre||'', .54],['DNI', a.qDni||'', .18],['Cargo', a.qPuesto||'', .28]]);
  y+=8;

  /* ── la medida, marcada ── */
  titulo('Medida disciplinaria');
  var MED=['Amonestación verbal','Amonestación escrita','Suspensión 1 día',
           'Suspensión 2 días','Suspensión 5 días','Retiro de obra'];
  var ancho=W-2*M, colW=ancho/3, filaAlto=18;
  doc.setDrawColor(150,150,150); doc.setLineWidth(.6);
  doc.rect(M, y, ancho, filaAlto*2);
  doc.line(M+colW, y, M+colW, y+filaAlto*2);
  doc.line(M+colW*2, y, M+colW*2, y+filaAlto*2);
  doc.line(M, y+filaAlto, M+ancho, y+filaAlto);
  MED.forEach(function(et, i){
    var cx=M+(i%3)*colW+7, cy=y+Math.floor(i/3)*filaAlto+12;
    var marcado=(String(a.medida||'')===et);
    doc.setDrawColor(60,60,60); doc.setLineWidth(.8);
    doc.rect(cx, cy-8, 9, 9);
    if(marcado){
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(20,20,20);
      doc.text('X', cx+2, cy-.5);
    }
    doc.setFont('helvetica', marcado?'bold':'normal'); doc.setFontSize(8); doc.setTextColor(30,30,30);
    doc.text(et, cx+14, cy);
  });
  y+=filaAlto*2+10;

  /* ── el motivo: lo unico elastico de toda la hoja ── */
  titulo('Motivo de la sanción');
  /* Lo que queda libre hasta donde arrancan las firmas. Todo lo de
     abajo tiene alto fijo, asi que este numero es exacto y no una
     estimacion: por eso se puede prometer UNA hoja. */
  var ALTO_FIRMAS=176, ALTO_COMPROMISO=54;
  var libre = (H-M-ALTO_FIRMAS-ALTO_COMPROMISO) - y - 10;
  var texto = String(a.desc||'').trim() || '—';
  var tam=9, lineas, alturaLinea;
  for(;;){
    doc.setFont('helvetica','normal'); doc.setFontSize(tam);
    alturaLinea = tam*1.28;
    lineas = doc.splitTextToSize(texto, ancho-14);
    if(lineas.length*alturaLinea+16 <= libre || tam<=6.2) break;
    tam -= .4;
  }
  var caben = Math.max(1, Math.floor((libre-16)/alturaLinea));
  if(lineas.length>caben){
    recorto=true;
    lineas = lineas.slice(0, caben);
    lineas[caben-1] = String(lineas[caben-1]).slice(0, Math.max(0, String(lineas[caben-1]).length-3))+'…';
  }
  var altoCaja=Math.max(60, lineas.length*alturaLinea+16);
  doc.setDrawColor(150,150,150); doc.setLineWidth(.6);
  doc.rect(M, y, ancho, altoCaja);
  doc.setTextColor(25,25,25);
  lineas.forEach(function(t,i){ doc.text(t, M+7, y+14+i*alturaLinea); });
  y+=altoCaja+8;

  /* ── el compromiso, siempre al mismo alto ── */
  y = H-M-ALTO_FIRMAS-ALTO_COMPROMISO;
  doc.setFont('helvetica','normal'); doc.setFontSize(7.2); doc.setTextColor(70,70,70);
  var comp=doc.splitTextToSize(
    'Declaro haber sido notificado de la medida disciplinaria descrita, conforme al Reglamento Interno de '+
    'Seguridad y Salud en el Trabajo de '+(emp.razon||'la empresa')+' y al D.S. N° 005-2012-TR. Me comprometo '+
    'a cumplir las disposiciones de seguridad y salud en el trabajo en el ejercicio de mis funciones.', ancho-14).slice(0,4);
  doc.rect(M, y, ancho, ALTO_COMPROMISO-8);
  comp.forEach(function(t,i){ doc.text(t, M+7, y+13+i*9.5); });
  y += ALTO_COMPROMISO;

  /* ── las cuatro firmas, en dos filas de dos ── */
  titulo('Firmas');
  var fw=ancho/2, fh=(ALTO_FIRMAS-16)/2;
  AMON_FIRMAS.forEach(function(f, i){
    var fx=M+(i%2)*fw, fy=y+Math.floor(i/2)*fh;
    doc.setDrawColor(150,150,150); doc.setLineWidth(.6);
    doc.rect(fx, fy, fw, fh);
    var dat=(a.firmas||{})[f[0]];
    if(dat){
      try{ doc.addImage(dat, 'PNG', fx+10, fy+6, fw-20, fh-26, undefined, 'FAST'); }catch(e){}
    }
    doc.setDrawColor(90,90,90); doc.setLineWidth(.5);
    doc.line(fx+14, fy+fh-16, fx+fw-14, fy+fh-16);
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(90,90,90);
    doc.text(f[1].toUpperCase(), fx+fw/2, fy+fh-6, {align:'center'});
    if(f[0]==='ssoma'){ var selloP=selloDatos(); if(selloP) _pdfSello(doc, fx+fw-60, fy+4, selloP, 104, true); }
    if(!dat){
      doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(150,150,150);
      doc.text('(pendiente de firma)', fx+fw/2, fy+fh-24, {align:'center'});
    }
  });

  /* Si jsPDF hubiera abierto una segunda hoja, algo se nos escapo: se
     borra y se deja constancia, antes que entregar dos hojas. */
  try{ while(doc.getNumberOfPages()>1) doc.deletePage(doc.getNumberOfPages()); }catch(_e){}
  return {blob:doc.output('blob'), recorto:recorto, paginas:1};
}
/* ── de la app · la credencial ── */
function _hhBruto(s){
  s=String(s||'');
  var h1=5381,h2=52711;
  for(var i=0;i<s.length;i++){ var c=s.charCodeAt(i);
    h1=(Math.imul(h1,33)^c)>>>0; h2=(Math.imul(h2,31)+c)>>>0; }
  return h1.toString(16)+'-'+h2.toString(16);
}
function credFirma(payload){ return _hhBruto(payload+'|OBRASST-2026').slice(0,10).toUpperCase(); }
function credCodUnico(datos){
  var tb={}; try{ tb=credTumbas(); }catch(_t){}
  var payload=b64u(JSON.stringify(datos)), cod='OBRASST-CRED:'+payload+'.'+credFirma(payload);
  var r=(+datos.r||0), n=0;
  while(tb[cod] && n<50){ n++; r++; datos.r=r; payload=b64u(JSON.stringify(datos)); cod='OBRASST-CRED:'+payload+'.'+credFirma(payload); }
  return cod;
}
var HABIL = [
  {k:'al', n:'Trabajo en altura',        ic:'🧗', bri:false},
  {k:'an', n:'Armado de andamios',       ic:'🏗️', bri:false},
  {k:'iz', n:'Izaje y maniobras',        ic:'🪝', bri:false},
  {k:'ec', n:'Espacios confinados',      ic:'🕳️', bri:false},
  {k:'tc', n:'Trabajos en caliente',     ic:'🔥', bri:false},
  {k:'el', n:'Riesgo eléctrico',         ic:'⚡', bri:false},
  {k:'ex', n:'Manejo de explosivos',     ic:'💥', bri:false},
  {k:'mq', n:'Operador de maquinaria',   ic:'🚜', bri:false},
  {k:'bp', n:'Brigadista · primeros auxilios', ic:'🚑', bri:true},
  {k:'bf', n:'Brigadista · lucha contra incendio', ic:'🧯', bri:true},
  {k:'be', n:'Brigadista · evacuación y rescate',  ic:'🚨', bri:true}
];
function habilDe(k){ for(var i=0;i<HABIL.length;i++) if(HABIL[i].k===k) return HABIL[i]; return null; }
function esBrigadista(hs){ return (hs||[]).some(function(k){ var h=habilDe(k); return h && h.bri; }); }
function credDatos(cod){
  try{
    var c=String(cod||'');
    /* los dos QR de la app tienen la misma forma: PREFIJO:carga.firma */
    var i=c.indexOf(':'); if(i<0) return null;
    var payload=c.slice(i+1).split('.')[0];
    return JSON.parse(decodeURIComponent(escape(atob(payload.replace(/-/g,'+').replace(/_/g,'/')))));
  }catch(e){ return null; }
}
function esQRdeTrabajador(cod){ return String(cod||'').indexOf('OBRASST-TRAB:')===0; }
function enlaceCred(cod){
  var c=String(cod||'');
  if(c.indexOf('OBRASST-CRED:')===0) c=c.slice('OBRASST-CRED:'.length);
  if(c.indexOf('OBRASST-TRAB:')===0) return baseURL()+'#trab='+c.slice('OBRASST-TRAB:'.length);
  return baseURL()+'#cred='+c;
}
function credQR(cod){
  var qr=qrcode(0,'M'); qr.addData(enlaceCred(cod)); qr.make();
  return qr.createDataURL(6,8);
}
function _pcCorto(iso){ var f = String(iso || ''); return /^\d{4}-\d{2}-\d{2}$/.test(f) ? f.slice(2,4)+f.slice(5,7)+f.slice(8,10) : ''; }
function _pcLargo(k){ var s = String(k || ''); return /^\d{6}$/.test(s) ? ('20'+s.slice(0,2)+'-'+s.slice(2,4)+'-'+s.slice(4,6)) : ''; }
function pcSelloQR(k){
  var f = _pcLargo(k); if(!f) return null;
  return { f:f, vig:(f >= hoyISO()) };
}
function credPDF(cod, _sos, _sinPreguntar){
  var d=credDatos(cod);
  if(!d){ aviso('No se pudo','Esa credencial no se puede leer.','\u26a0\ufe0f'); return; }
  if(!_sos){
    if(typeof conEmergsDeLaObra==='function'){ conEmergsDeLaObra(function(a){ credPDF(cod, a||[], _sinPreguntar); }); return; }
    _sos=[];
  }
  var TODOS=_sos, SOS=TODOS.slice(0,2);
  if(!TODOS.length && !_sinPreguntar && typeof hayCuenta==='function' && hayCuenta() && typeof abrirEmergs==='function'){
    confirmar('Tu obra todavía no tiene su número de emergencia',
      'El carné lleva impreso a quién llamar si pasa algo en la obra: la ambulancia, el supervisor SST, producción o el brigadista. '+
      'Cárgalo una vez y sale en todos los carnés y en los stickers del casco.',
      function(){ try{ abrirEmergs(); }catch(_a){} },
      {si:'Cargarlo ahora', no:'Sacarlo sin el número', icono:'📞',
       alNo:function(){ credPDF(cod, [], true); }});
    return;
  }
  var esTrab=esQRdeTrabajador(cod);
  var img=credQR(cod);
  var doc=new jspdf.jsPDF({unit:'pt', format:'a4'});
  var W=595.28, H=841.89, M=44;
  var vigente = !d.v || d.v>=hoyISO();

  /* cabecera */
  doc.setFillColor(11,42,58); doc.rect(0,0,W,86,'F');
  doc.setTextColor(245,183,0); doc.setFont('helvetica','bold'); doc.setFontSize(9);
  doc.text(esTrab ? 'OBRASST \u00b7 QR DE IDENTIFICACI\u00d3N' : 'OBRASST \u00b7 CREDENCIAL DE TRABAJADOR', M, 32);
  doc.setTextColor(255,255,255); doc.setFontSize(16);
  doc.text(doc.splitTextToSize(d.n||'\u2014', W-2*M)[0], M, 58);
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(200,215,225);
  doc.text((d.o||'')+(d.d?'   \u00b7   '+etDoc(d.d)+' '+d.d:''), M, 75);

  /* ── la tarjeta, en tamaño real de carne (85.6 x 54 mm) ── */
  var CW=242.6, CH=153.1, cx=(W-CW)/2, cy=126;
  /* un texto que no pasa del ancho: se achica y, si aun así no entra, se corta */
  function cabe(t, ancho, tam, min){
    t=String(t||'');
    doc.setFontSize(tam);
    while(tam>min && doc.getTextWidth(t)>ancho){ tam-=0.2; doc.setFontSize(tam); }
    if(doc.getTextWidth(t)>ancho){
      while(t.length>1 && doc.getTextWidth(t+'…')>ancho) t=t.slice(0,-1);
      t=t.replace(/\s+$/,'')+'…';
    }
    return t;
  }
  /* la franja de la emergencia, abajo: se pinta ANTES del borde, que es la línea de corte */
  var BH=17, bY=cy+CH-BH;
  if(SOS.length){
    doc.setFillColor(253,236,236);
    doc.roundedRect(cx, bY, CW, BH, 8, 8, 'F'); doc.rect(cx, bY, CW, BH-8, 'F');
    doc.setDrawColor(198,40,40); doc.setLineWidth(0.6); doc.line(cx, bY, cx+CW, bY);
  }
  doc.setDrawColor(190,196,202); doc.setLineWidth(0.7);
  doc.roundedRect(cx, cy, CW, CH, 8, 8, 'S');
  doc.setFillColor(11,42,58); doc.roundedRect(cx, cy, CW, 26, 8, 8, 'F');
  doc.rect(cx, cy+16, CW, 10, 'F');
  doc.setTextColor(245,183,0); doc.setFont('helvetica','bold'); doc.setFontSize(7);
  /* nada de rombos ni emojis: jsPDF con helvetica solo tiene WinAnsi y
     cualquier glifo de fuera sale como basura («%/E OBRASST»). */
  doc.text(esTrab ? 'OBRASST \u00b7 TRABAJADOR' : 'OBRASST', cx+9, cy+16);
  doc.setTextColor(255,255,255); doc.setFontSize(6.5);
  doc.text(doc.splitTextToSize((d.o||'').toUpperCase(), CW-92)[0], cx+62, cy+16);
  try{ doc.addImage(img,'GIF', cx+CW-78, cy+36, 66, 66); }catch(e){}
  doc.setTextColor(20,20,20); doc.setFont('helvetica','bold'); doc.setFontSize(10.5);
  doc.splitTextToSize(d.n||'\u2014', CW-96).slice(0,2).forEach(function(l,i){
    doc.text(l, cx+9, cy+50+i*13);
  });
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(90,90,90);
  doc.text(doc.splitTextToSize(d.c||'\u2014', CW-96)[0], cx+9, cy+80);
  if(d.d) doc.text(etDoc(d.d)+' '+d.d, cx+9, cy+92);
  doc.setFont('helvetica','bold'); doc.setFontSize(7);
  if(vigente){ doc.setTextColor(12,120,12); doc.text('HABILITADO HASTA '+(fechaLarga(d.v)||'\u2014'), cx+9, cy+103.5); }
  else { doc.setTextColor(190,40,40); doc.text('VENCIDA EL '+(fechaLarga(d.v)||''), cx+9, cy+103.5); }
  /* el sello «Capacitación al día», debajo, más chico */
  var _ks=(typeof pcSelloQR==='function') ? pcSelloQR(d.k) : null;
  if(_ks){
    doc.setFont('helvetica','bold'); doc.setFontSize(6.3);
    if(_ks.vig){ doc.setTextColor(12,120,12); doc.text('CAPACITACI\u00d3N AL D\u00cdA HASTA '+(fechaLarga(_ks.f)||''), cx+9, cy+112); }
    else { doc.setTextColor(168,98,0); doc.text('CAPACITACI\u00d3N VENCIDA EL '+(fechaLarga(_ks.f)||''), cx+9, cy+112); }
  }
  /* el grupo sanguineo va en la tarjeta, grande y en rojo: es lo unico
     de este carne que alguien va a leer con prisa de verdad */
  if(d.s){
    doc.setFillColor(208,59,59);
    doc.roundedRect(cx+CW-78, cy+104, 30, 15, 3, 3, 'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text(String(d.s), cx+CW-63, cy+114.5, {align:'center'});
  }
  var hs=(d.h||[]).map(function(k){ var x=habilDe(k); return x? x.n : null; })
                  .filter(function(x){ return !!x; });
  if(hs.length){
    doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(70,70,70);
    doc.splitTextToSize(hs.join('  \u00b7  '), CW-18).slice(0,2).forEach(function(l,i){
      doc.text(l, cx+9, cy+125.2+i*7);
    });
  }
  /* la franja «EMERGENCIA EN OBRA»: el rótulo a la izquierda y, al lado, a quién se llama y su número
     (los dos primeros de «¿A quién acudo?» ▸ Números de emergencia, igual que el sticker del casco) */
  if(SOS.length){
    doc.setFont('helvetica','bold'); doc.setFontSize(5.6); doc.setTextColor(198,40,40);
    doc.text('EMERGENCIA', cx+9, bY+7.3); doc.text('EN OBRA', cx+9, bY+13.3);
    var sx=cx+9+doc.getTextWidth('EMERGENCIA')+10, sAn=cx+CW-9-sx, sCol=SOS.length===1 ? sAn : (sAn-8)/2;
    SOS.forEach(function(s2, j){
      var x2=sx+j*(sCol+8);
      doc.setFont('helvetica','normal'); doc.setTextColor(70,70,70);
      doc.text(cabe(s2.t, sCol, 5.6, 4.4), x2, bY+6.9);
      doc.setFont('helvetica','bold'); doc.setTextColor(25,25,25);
      doc.text(cabe(s2.tel, sCol, 9.5, 6), x2, bY+14.9);
    });
  }
  doc.setDrawColor(215,215,215); doc.setLineWidth(0.5);
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(150,150,150);
  doc.text('recortar por el borde \u00b7 tama\u00f1o real de carn\u00e9 (85.6 \u00d7 54 mm)', W/2, cy+CH+14, {align:'center'});

  /* ── los datos, escritos, para no depender del escaneo ── */
  var y=cy+CH+44;
  doc.setDrawColor(225,225,225); doc.line(M,y,W-M,y); y+=20;
  function dato(et, val){
    doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(135,135,135);
    doc.text(et, M, y);
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(30,30,30);
    doc.splitTextToSize(String(val||'\u2014'), W-2*M-150).slice(0,2).forEach(function(l,i){
      doc.text(l, M+150, y+i*13);
    });
    y+=26;
  }
  dato('TRABAJADOR', d.n);
  dato('DOCUMENTO', d.d||'no registrado');
  dato('PUESTO', d.c);
  dato('EMPRESA', d.o);
  dato('HABILITADO HASTA', (fechaLarga(d.v)||'sin fecha')+(vigente?'':'   (VENCIDA)'));
  if(_ks) dato('CAPACITACI\u00d3N', (_ks.vig?'Al d\u00eda hasta el ':'Vencida el ')+(fechaLarga(_ks.f)||''));
  if(d.s) dato('GRUPO SANGU\u00cdNEO', d.s);
  /* a quién llama cualquiera si pasa algo en la obra: TODOS los números, en el orden en que hay que
     llamar. Cada uno entero en su renglón o al lado del anterior: un número no se parte en dos. */
  if(TODOS.length){
    doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(135,135,135);
    doc.text('EMERGENCIA EN LA OBRA', M, y);
    var eX0=M+150, eAn=W-2*M-150, eSep='   \u00b7   ', ex=eX0;
    TODOS.forEach(function(s3){
      doc.setFontSize(11);
      doc.setFont('helvetica','normal'); var et3=String(s3.t)+'  ', wE=doc.getTextWidth(et3), wS=doc.getTextWidth(eSep);
      doc.setFont('helvetica','bold');   var wN=doc.getTextWidth(String(s3.tel));
      if(ex>eX0 && ex+wS+wE+wN > eX0+eAn){ ex=eX0; y+=14; }
      if(ex>eX0){ doc.setFont('helvetica','normal'); doc.setTextColor(170,170,170); doc.text(eSep, ex, y); ex+=wS; }
      doc.setFont('helvetica','normal'); doc.setTextColor(95,95,95); doc.text(et3, ex, y); ex+=wE;
      doc.setFont('helvetica','bold'); doc.setTextColor(30,30,30); doc.text(String(s3.tel), ex, y); ex+=wN;
    });
    y+=26;
  }
  if(d.e || d.q) dato('CONTACTO PERSONAL', 'Sale al escanear el QR; no va impreso.');
  if(hs.length) dato('HABILITACIONES', hs.join(', '));

  /* ── como se verifica ── */
  y+=6; doc.setDrawColor(225,225,225); doc.line(M,y,W-M,y); y+=20;
  doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(135,135,135);
  doc.text('C\u00d3MO SE VERIFICA EN LA PUERTA', M, y); y+=15;
  doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(45,45,45);
  var nota='Escanea el QR con la c\u00e1mara del celular: abre OBRASST y muestra esta misma credencial. '+
    'La app comprueba la firma del c\u00f3digo dentro del aparato, sin internet, y avisa si el carn\u00e9 fue '+
    'alterado o si ya venci\u00f3. Los datos viajan dentro del propio c\u00f3digo: no se consultan a ning\u00fan '+
    'servidor y no quedan registrados en ninguna p\u00e1gina de terceros.';
  var ls=doc.splitTextToSize(nota, W-2*M); doc.text(ls, M, y); y+=ls.length*12+10;
  doc.setFontSize(8.5); doc.setTextColor(120,120,120);
  var nota2 = esTrab
    ? 'Estos datos los registr\u00f3 el propio trabajador. Dicen qui\u00e9n es y en qu\u00e9 obra est\u00e1, pero NO son una '+
      'habilitaci\u00f3n de la empresa: para altura, andamios, izaje o espacios confinados hay que pedir la credencial.'
    : 'Esta credencial acredita lo que la empresa habilit\u00f3. No reemplaza el examen m\u00e9dico ocupacional, '+
      'el permiso de trabajo de alto riesgo ni la capacitaci\u00f3n espec\u00edfica de la tarea.';
  var ls2=doc.splitTextToSize(nota2, W-2*M); doc.text(ls2, M, y);

  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(150,150,150);
  doc.text('Generado con OBRASST el '+fechaLarga(hoyISO()), M, H-26);
  entregarPDF(doc, _nombreSano('Credencial - '+(d.n||'trabajador'))+'.pdf');
}
var EMERG_MAX = 8, EMERG_EN_STICKER = 2;
function _emergTel(t){
  t = String(t||'').trim();
  var mas = t.charAt(0)==='+' ? '+' : '';
  return mas + t.replace(/[^0-9*#]/g, '');
}
function _emergsLimpios(a){
  return (Array.isArray(a) ? a : []).map(function(x){
    x = x || {};
    return { t:String(x.t||'').trim().slice(0, 28), tel:String(x.tel||'').trim().slice(0, 22) };
  }).filter(function(x){ return x.t && _emergTel(x.tel).replace(/[^0-9]/g,'').length >= 3; }).slice(0, EMERG_MAX);
}
function emergsLocal(){
  var d = (typeof comiteLocal==='function') ? comiteLocal() : {};
  var a = _emergsLimpios(d.emergs);
  /* el número suelto de antes (nunca tuvo dónde cargarse, pero por si acaso) */
  if(!a.length && d.emerg) a = _emergsLimpios([{t:'Emergencia de la obra', tel:d.emerg}]);
  return a;
}
var CRED_TUMBA_DIAS = 190;
function _tumbasVivas(t){
  var out={}, corte=Date.now() - CRED_TUMBA_DIAS*24*3600*1000, k;
  for(k in t) if(Object.prototype.hasOwnProperty.call(t,k)){
    var ts=+t[k]||0; if(ts>corte) out[k]=ts;
  }
  return out;
}
/* ── de la app · ¿a quién acudo? ── */
var EMERG_DE_QUIEN = ['Ambulancia', 'Supervisor SST', 'Producción', 'Brigadista', 'Tópico / enfermería',
                      'Residente de obra', 'Vigilancia', 'Bomberos', 'Clínica u hospital'];
var CARGOS_SUGERIDOS = [
  'Supervisor SSOMA', 'Capataz', 'Residente de obra',
  'Ingeniero de producción', 'Jefe de guardia', 'Prevencionista de riesgos',
  'Jefe de mina', 'Maestro de obra'
];
var _QUI_CARGO = { presidente:'Presidente', secretario:'Secretario', miembro:'Integrante' };
function credHabil(x){
  if(x && x.h && x.h.length) return x.h;
  var d = x && x.cod ? credDatos(x.cod) : null;
  return (d && d.h) || [];
}
function brigadaDeLaObra(){
  var lista=leer(LS_CRED,[]), hoy=hoyISO(), out=[];
  lista.forEach(function(x){
    var hs=credHabil(x); if(!esBrigadista(hs)) return;
    var d=x.cod?credDatos(x.cod):null;
    out.push({n:x.n||(d&&d.n)||'', c:x.c||(d&&d.c)||'', tel:x.tel||'',
              v:x.v||(d&&d.v)||'', vig: !x.v || x.v>=hoy,
              /* 26/09 · para encontrar su foto en «Mi personal» (no se publica) */
              d:x.d||(d&&d.d)||'', trab:x.trab||null,
              roles:hs.filter(function(k){ var h=habilDe(k); return h&&h.bri; })});
  });
  return out;
}
function _quiBuscador(){
  var a = (typeof trabsLocal==='function') ? (trabsLocal()||[]) : [];
  var norm = (typeof _normNom==='function') ? _normNom : function(x){ return String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,''); };
  return function(o){
    o = o || {};
    var t = null, d0 = String(o.dni||'').trim(), n0 = o.n ? norm(o.n) : '';
    if(o.trab) t = a.filter(function(x){ return x && x.id===o.trab; })[0] || null;
    if(!t && d0) t = a.filter(function(x){ return x && String(x.dni||'').trim()===d0; })[0] || null;
    if(!t && n0) t = a.filter(function(x){ return x && norm(x.nombre)===n0; })[0] || null;
    return t;
  };
}
function _quiUrl(t){ var u = t && t.fotoUrl; return (u && /^https:\/\//.test(u)) ? u : ''; }
function quienesPaquete(){
  var buscar = _quiBuscador();
  var d = (typeof comiteLocal==='function') ? comiteLocal() : {miembros:[]};
  var n = (typeof comiteCuantos==='function') ? comiteCuantos() : 0;
  var toca = (typeof comiteLoQueToca==='function') ? comiteLoQueToca(n) : {tipo:'supervisor', nombre:'Supervisor de SST'};
  var e = (typeof empActiva==='function') ? empActiva() : null;

  var org = (d.miembros||[]).map(function(m){
    var o = { n: m.nombre||'', p: m.puesto||'',
             lado: (m.lado==='empleador') ? 'e' : 't',
             sup: m.sup?1:0,
             cargo: m.cargo||'miembro' };   /* sin DNI: al trabajador no le sirve y no es suyo */
    var f = _quiUrl(buscar({dni:m.dni, n:m.nombre})); if(f) o.f = f;
    return o;
  }).filter(function(m){ return m.n; });

  var brig = ((typeof brigadaDeLaObra==='function') ? brigadaDeLaObra() : [])
    .filter(function(p){ return p.vig; })          /* credencial vencida no se publica como brigadista */
    .map(function(p){ var o = { n:p.n, c:p.c||'', tel:p.tel||'', roles:p.roles||[] };
      var f = _quiUrl(buscar({trab:p.trab, dni:p.d, n:p.n})); if(f) o.f = f;
      return o; });

  /* ── la línea de mando ──────────────────────────────────────────
     El trabajador sabe quién es su capataz porque lo tiene al lado.
     No siempre sabe quién es el residente, ni el de producción, ni el
     de SSOMA — y son justo a los que hay que subir cuando el capataz
     es el problema. Viaja con nombre, cargo y teléfono si lo cargaron;
     sin DNI, como todo lo demás de esta hoja. */
  var mando = (d.mando || []).filter(function(m){ return m && m.n; })
    .map(function(m){ var o = { cargo:m.cargo||'', n:m.n, tel:m.tel||'' };
      var f = _quiUrl(buscar({n:m.n})); if(f) o.f = f;
      return o; });

  var emergs = emergsLocal().map(function(x){ return { t:x.t, tel:x.tel }; });

  return { v:2,                      /* 2: con la foto de cada uno (f) */
    tipo: toca.tipo,                 /* comite | subcomite | supervisor */
    mando: mando,
    titulo: toca.nombre || 'Comité de SST',
    ley: toca.ley || '',
    obra: e ? (e.nombre||'') : '',
    /* 03/10/2026 · el mandato se guarda en el comité como «desde» y «hasta»; acá se buscaba
       un «periodo» que nadie escribía, y por eso el trabajador nunca lo veía */
    periodo: d.periodo || ((d.desde || d.hasta) ? { desde:d.desde||'', hasta:d.hasta||'' } : null),
    org: org,
    brig: brig,
    punto: d.punto || '',            /* punto de reunión, si lo cargaron */
    /* 03/10/2026 · los números de emergencia DE LA OBRA (ambulancia, supervisor
       SST, producción, brigadista…). «emerg» es el primero, para la app de antes */
    emerg: (emergs[0] && emergs[0].tel) || d.emerg || '',
    emergs: emergs,
    al: hoyISO() };
}
/* ── de la app · el comité ── */
var COMITE_MIN = 20;
var COMITE_LADOS = [
  ['empleador',  'Del empleador',     'Los designa la empresa'],
  ['trabajador', 'De los trabajadores','Los eligen los trabajadores en votación (Ley 29783, art. 31)']
];
var COMITE_TIPOS = {
  instalacion:   'Constitución e instalación',
  ordinaria:     'Reunión ordinaria',
  extraordinaria:'Reunión extraordinaria'
};
function comiteSello(c, bloque){
  var ahora=Date.now(), antes=+c.ts||0;
  if(c.tsP==null) c.tsP=antes;
  if(c.tsQ==null) c.tsQ=antes;
  if(bloque==='padron') c.tsP=ahora;
  else if(bloque==='quien') c.tsQ=ahora;
  c.ts=ahora;
  return c;
}
function comiteFusion(mio, ajeno){
  if(!ajeno || typeof ajeno!=='object') return mio;
  var nuevo = ((+ajeno.ts||0) > (+mio.ts||0)) ? ajeno : mio;
  var otro = (nuevo === ajeno) ? mio : ajeno;
  /* 07/10/2026 · cada parte se decide con SU reloj (ver comiteSello): el
     padrón, con «tsP»; lo de «¿A quién acudo?», con «tsQ». El documento que
     todavía no los trae se mide con su «ts» de siempre. */
  var reloj = function(d, k){ return (d[k]!=null) ? (+d[k]||0) : (+d.ts||0); };
  var pad = (reloj(ajeno,'tsP') > reloj(mio,'tsP')) ? ajeno : mio, padOtro = (pad === ajeno) ? mio : ajeno;
  var qui = (reloj(ajeno,'tsQ') > reloj(mio,'tsQ')) ? ajeno : mio, quiOtro = (qui === ajeno) ? mio : ajeno;
  var out = {
    tipo: pad.tipo, desde: pad.desde, hasta: pad.hasta,
    eleccion: pad.eleccion, instalacion: pad.instalacion, libro: pad.libro,
    miembros: Array.isArray(pad.miembros) ? pad.miembros : [],
    actas: [], ts: Math.max(+mio.ts||0, +ajeno.ts||0),
    tsP: reloj(pad,'tsP'), tsQ: reloj(qui,'tsQ')
  };
  /* 02/10/2026 · las dos preguntas («¿varias obras?», «¿varias empresas?»)
     también viajan. La fusión no las copiaba: se contestaba «Sí, varias
     obras», la pantalla decía «Sub-comité», y al volver a entrar —que es
     cuando se baja lo de la nube— las respuestas se perdían y la obra
     volvía a «Comité». Gana la del más nuevo; si ese no la trae, la del otro. */
  ['variasObras', 'variasEmpresas'].forEach(function(k){
    var v = (pad[k]!=null) ? pad[k] : padOtro[k];
    if(v!=null) out[k] = !!v;
  });
  /* 03/10/2026 · LA LÍNEA DE MANDO SE BORRABA SOLA. «¿A quién acudo?»
     guarda dentro del comité de la obra la línea de mando, el punto de
     reunión y —desde hoy— los números de emergencia. La fusión tampoco
     los copiaba: bastaba abrir «Comité» (que baja lo de la nube) para que
     lo cargado en «¿A quién acudo?» desapareciera del celular y de la
     nube, y al volver a publicar le desapareciera también a la gente.
     Misma regla: gana el del más nuevo; si ese no lo trae, el del otro. */
  ['mando', 'punto', 'emerg', 'emergs', 'periodo'].forEach(function(k){
    var v = (qui[k]!=null) ? qui[k] : quiOtro[k];
    if(v!=null) out[k] = v;
  });
  /* 07/10/2026 · EL ACTA QUITADA VOLVÍA. Las actas se unen por id, así
     que la que se quitaba en un equipo seguía viva en el otro —o en la
     nube— y regresaba en la siguiente bajada. La que se quita deja su
     marca (quitadas: { id: cuándo }) y la fusión ya no la trae de vuelta,
     salvo que alguien la haya vuelto a guardar después de quitada. */
  var qt={}, hayQ=false;
  [mio.quitadas, ajeno.quitadas].forEach(function(q){
    if(!q || typeof q!=='object') return;
    for(var kq in q) if(Object.prototype.hasOwnProperty.call(q,kq) && (+q[kq]>0)){ qt[kq]=Math.max(+qt[kq]||0, +q[kq]); hayQ=true; }
  });
  if(hayQ) out.quitadas=qt;
  var por={};
  (mio.actas||[]).forEach(function(a){ if(a && a.id) por[a.id]=a; });
  (ajeno.actas||[]).forEach(function(a){
    if(!a || !a.id) return;
    var y=por[a.id];
    if(!y || (+a.ts||0) > (+y.ts||0)) por[a.id]=a;
  });
  for(var k in por) if(Object.prototype.hasOwnProperty.call(por,k)){
    if(qt[k] && qt[k] >= (+por[k].ts||0)) continue;
    out.actas.push(por[k]);
  }
  out.actas.sort(function(x,y){ return String(y.fecha||'').localeCompare(String(x.fecha||'')); });
  /* y lo que el documento traiga que esta función todavía no conozca
     viaja igual (dos veces ya se perdió algo por no estar en la lista):
     el del más nuevo; si ese no lo trae, el del otro */
  [nuevo, otro].forEach(function(d){
    for(var kx in d) if(Object.prototype.hasOwnProperty.call(d,kx) && !(kx in out) && d[kx]!=null) out[kx]=d[kx];
  });
  return out;
}
function _subcomiteMiembros(n){
  if(n<=100)  return 4;
  if(n<=300)  return 6;
  if(n<=500)  return 8;
  if(n<=1000) return 10;
  return 12;
}
function comiteLoQueToca(n, opc){
  n = +n || 0;
  /* República Dominicana: Comité Mixto con 15 o más, Coordinador con menos (pais-do.js) */
  if(typeof esRD==='function' && esRD()) return comiteLoQueTocaRD(n);
  opc = opc || {};
  var varias = (opc.variasObras!=null) ? !!opc.variasObras : comiteVariasObras();

  /* ── la empresa lleva UNA sola obra: la obra ES la empresa ── */
  if(!varias){
    if(n < COMITE_MIN)
      return { tipo:'supervisor', ambito:'empresa', min:1,
               nombre:'Supervisor de SST',
               ley:'Ley 29783, art. 30',
               dice:'Con '+(n||'menos de 20')+' trabajador'+(n===1?'':'es')+' no te toca comité: '+
                    'los trabajadores eligen a un Supervisor de SST.',
               mandato:'obra' };
    var min = (n > 100) ? Math.min(12, 6 + 2*(Math.floor((n-1)/100) - 1)) : 4;
    return { tipo:'comite', ambito:'empresa', min:min,
             nombre:'Comité de SST',
             ley:'Ley 29783, art. 29 · D.S. 005-2012-TR, art. 43',
             dice:'Con '+n+' trabajadores te toca un Comité paritario de por lo menos '+min+' integrantes: '+
                  (min/2)+' del empleador y '+(min/2)+' de los trabajadores.',
             mandato:'anios' };
  }

  /* ── la empresa lleva VARIAS obras: esta obra es un centro de trabajo ── */
  if(n < COMITE_MIN){
    return { tipo:'supervisor', ambito:'obra', min:1,
             nombre:'Supervisor de SST de la obra',
             ley:'D.S. 011-2019-TR, arts. 22.1.b y 23 · D.S. 005-2012-TR, art. 44',
             dice:'Esta obra tiene '+n+' trabajador'+(n===1?'':'es')+' de tu empresa, o sea menos de 20: '+
                  'le toca un Supervisor de SST elegido por los propios trabajadores de la obra, '+
                  'por votación directa y secreta el primer día de labores. '+
                  'El Comité de SST de la empresa coordina y apoya su trabajo.',
             mandato:'obra',
             ojo:'Si la obra pasa de 20 trabajadores, ahí mismo arranca la elección del Subcomité. '+
                 'El Supervisor sigue en el cargo hasta que el Subcomité se instale, y puede ser candidato.' };
  }
  var mSub=_subcomiteMiembros(n);
  return { tipo:'subcomite', ambito:'obra', min:mSub,
           nombre:'Sub-comité de SST de la obra',
           ley:'D.S. 011-2019-TR, arts. 22.1.a y 27.1 · D.S. 005-2012-TR, art. 44',
           dice:'Esta obra tiene '+n+' trabajadores de tu empresa. Como la empresa lleva más de una obra, '+
                'acá no va el Comité —ese es de la empresa— sino un <b>Sub-comité de SST</b> de '+mSub+
                ' miembros titulares, bipartito y paritario: '+(mSub/2)+' del empleador y '+(mSub/2)+' de los trabajadores.',
           mandato:'obra',
           ojo:'Sesiona como mínimo una vez al mes. Puede invitar a técnicos especialistas, que participan con voz pero sin voto. '+
               'Su mandato dura lo que dura la obra.' };
}
function comiteLoQueTocaRD(n){
  n = +n || 0;
  if(n < 15) return { tipo:'supervisor', ambito:'empresa', min:1, nombre:'Coordinador de SST',
    ley:'Manual-Guía del Comité Mixto · Ministerio de Trabajo, 2024',
    dice:'Con '+(n||'menos de 15')+' trabajador'+(n===1?'':'es')+' no te toca Comité Mixto: la empresa tiene un Coordinador de SST, con funciones parecidas a las del comité.',
    mandato:'obra' };
  return { tipo:'comite', ambito:'empresa', min:2, nombre:'Comité Mixto de SST',
    ley:'Decreto 522-06, art. 4.2 · Manual-Guía del Comité Mixto · Ministerio de Trabajo, 2024',
    dice:'Con '+n+' trabajadores te toca un Comité Mixto: tantos representantes del empleador como de los trabajadores. '+
         'Preside el empleador y el secretario es de los trabajadores. Se reúne por lo menos una vez al mes y sus actas van a la Dirección General de Higiene y Seguridad Industrial.',
    mandato:'obra',
    ojo:'Cuántos integrantes lleva lo deciden las dimensiones del lugar de trabajo: el Manual-Guía no da una tabla.' };
}
function comiteTitulares(lado){
  return comiteLocal().miembros.filter(function(m){ return m.lado===lado && !m.sup; });
}
function comiteSuplentes(lado){
  return comiteLocal().miembros.filter(function(m){ return m.lado===lado && m.sup; });
}
function comiteFaltas(){
  if(typeof esRD==='function' && esRD()) return comiteFaltasRD();
  var c=comiteLocal(), n=comiteCuantos(), toca=comiteLoQueToca(n), f=[];
  if(toca.tipo==='supervisor'){
    if(!c.miembros.length) f.push('Falta '+(toca.ambito==='obra'?'elegir al Supervisor de SST de la obra, por votación de sus trabajadores':'nombrar al Supervisor de SST')+'.');
    if(!c.eleccion) f.push('Falta la fecha de la elección.');
    if(!c.hasta) f.push('Falta hasta cuándo dura su mandato.');
    return f;
  }
  var e=comiteTitulares('empleador').length, t=comiteTitulares('trabajador').length;
  if(e+t < toca.min) f.push('Faltan integrantes: tienes '+(e+t)+' y el '+(toca.tipo==='subcomite'?'sub-comité':'comité')+' de esta obra pide '+toca.min+'.');
  if(e!==t) f.push('El '+(toca.tipo==='subcomite'?'sub-comité':'comité')+' no es paritario: '+e+' del empleador y '+t+' de los trabajadores. Tienen que ser iguales.');
  if(e+t > 12) f.push(toca.tipo==='subcomite'
    ? 'Son más de 12 integrantes, y el sub-comité llega hasta 12 (D.S. 011-2019-TR, art. 27.1).'
    : 'Son más de 12 integrantes, y el máximo de ley es 12 (D.S. 005-2012-TR, art. 43).');
  if(!c.miembros.some(function(m){ return m.cargo==='presidente'; })) f.push('Falta elegir al Presidente (D.S. 005-2012-TR, art. 56).');
  if(!c.miembros.some(function(m){ return m.cargo==='secretario'; })) f.push('Falta designar al Secretario (D.S. 005-2012-TR, art. 58).');
  if(!c.eleccion) f.push('Falta la fecha de la elección de los representantes de los trabajadores.');
  if(!c.instalacion) f.push('Falta la fecha del acta de constitución e instalación.');
  if(!c.desde || !c.hasta) f.push('Falta el período del mandato.');
  else if(toca.mandato!=='obra'){
    /* Ojo: esta regla es del comité DE EMPRESA. El subcomité y el
       supervisor de una obra duran lo que dura la obra (D.S. 011-2019-TR,
       art. 28.1), así que reclamarles «no llega a 1 año» en una obra de
       ocho meses era un error de la app, no del que la usa. */
    var anios=(new Date(c.hasta) - new Date(c.desde))/31557600000;
    if(anios > 2.02) f.push('El mandato pasa de 2 años, y el máximo de ley es 2 (D.S. 005-2012-TR, art. 62).');
    if(anios < 0.98) f.push('El mandato no llega a 1 año, y el mínimo de ley es 1 (D.S. 005-2012-TR, art. 62).');
  }
  return f;
}
function comiteFaltasRD(){
  var c = comiteLocal(), toca = comiteLoQueTocaRD(comiteCuantos()), f = [];
  if(toca.tipo === 'supervisor'){
    if(!c.miembros.length) f.push('Falta nombrar al Coordinador de SST.');
    return f;
  }
  var e = comiteTitulares('empleador').length, t = comiteTitulares('trabajador').length;
  if(!e || !t) f.push('Faltan integrantes: el comité lleva representantes del empleador y de los trabajadores.');
  else if(e !== t) f.push('El comité no es paritario: '+e+' del empleador y '+t+' de los trabajadores. Tienen que ser iguales.');
  var pres = c.miembros.filter(function(m){ return m.cargo === 'presidente'; })[0];
  var sec  = c.miembros.filter(function(m){ return m.cargo === 'secretario'; })[0];
  if(!pres) f.push('Falta el Presidente: lo pone el empleador.');
  else if(pres.lado !== 'empleador') f.push('El Presidente tiene que ser un representante del empleador.');
  if(!sec) f.push('Falta el Secretario: es un representante de los trabajadores.');
  else if(sec.lado !== 'trabajador') f.push('El Secretario tiene que ser un representante de los trabajadores.');
  if(!c.eleccion) f.push('Falta la fecha de la elección de los representantes de los trabajadores.');
  if(!c.instalacion) f.push('Falta la fecha en que el comité quedó instalado.');
  return f;
}
function comiteDiasDeMandato(){
  var c=comiteLocal();
  if(!c.hasta) return null;
  return Math.round((new Date(String(c.hasta).slice(0,10)) - new Date(hoyISO()))/86400000);
}
function comiteQuorum(){
  /* el Manual-Guía dominicano no fija quórum: la app no lo inventa */
  if(typeof esRD==='function' && esRD()) return 0;
  var tot=comiteLocal().miembros.filter(function(m){ return !m.sup; }).length;
  return tot ? Math.floor(tot/2)+1 : 0;
}
function comiteHuboQuorum(a){
  var q=comiteQuorum();
  return q>0 && ((a.asistentes||[]).length >= q);
}
function comiteActasDe(anio){
  return comiteLocal().actas.filter(function(a){ return String(a.fecha||'').slice(0,4)===String(anio); })
    .sort(function(x,y){ return String(x.fecha||'').localeCompare(String(y.fecha||'')); });
}
function comiteMesesDelAnio(anio){
  var act=comiteActasDe(anio), hoy=hoyISO(), ymHoy=hoy.slice(0,7), out=[];
  for(var m=1;m<=12;m++){
    var ym=anio+'-'+dosD(m);
    var ord=act.filter(function(a){ return String(a.fecha).slice(0,7)===ym && a.tipo!=='extraordinaria'; })[0]||null;
    var estado = ord ? 'hecha' : (ym < ymHoy ? 'perdida' : (ym===ymHoy ? 'toca' : 'futura'));
    out.push({ mes:m, ym:ym, acta:ord, estado:estado,
               extra: act.filter(function(a){ return String(a.fecha).slice(0,7)===ym && a.tipo==='extraordinaria'; }) });
  }
  return out;
}
function comiteAcuerdosPendientes(){
  var hoy=hoyISO(), out=[];
  comiteLocal().actas.forEach(function(a){
    (a.acuerdos||[]).forEach(function(ac, i){
      if(ac.hecho) return;
      out.push({ acta:a.id, n:a.n, fechaActa:a.fecha, i:i, t:ac.t, quien:ac.quien,
                 plazo:ac.plazo, vencido: !!(ac.plazo && ac.plazo < hoy) });
    });
  });
  return out.sort(function(x,y){ return String(x.plazo||'9999').localeCompare(String(y.plazo||'9999')); });
}
function comiteNumeroSiguiente(anio){
  var n=0;
  comiteActasDe(anio).forEach(function(a){ var v=parseInt(String(a.n||'').replace(/\D/g,''),10); if(v>n) n=v; });
  return dosD3(n+1);
}
function dosD3(n){ n=String(n); while(n.length<3) n='0'+n; return n; }
function actaComitePorId(id){
  var a=comiteLocal().actas;
  for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i];
  return null;
}
function comiteRolCod(doc, nombre){
  var d = (typeof comiteLocal==='function') ? comiteLocal() : null;
  if(!d || !d.miembros || !d.miembros.length) return null;     /* este equipo no lo sabe */
  var nd = _docLlave(doc), nn = _normNom(nombre||'');
  var m = d.miembros.filter(function(x){
    var xd = _docLlave(x.dni);
    return (nd && xd) ? (xd === nd) : (!!nn && _normNom(x.nombre||'') === nn);
  })[0];
  if(!m) return '';                                            /* no es del comité */
  var toca = comiteLoQueToca(comiteCuantos());
  var rd = (typeof esRD==='function' && esRD());
  var t = (toca.tipo==='comite') ? (rd ? 'x' : 'c') : (toca.tipo==='subcomite' ? 's' : (rd ? 'o' : 'v'));
  if(t==='v' || t==='o') return t;
  return t + (m.lado==='empleador' ? 'e' : 't') +
         (m.cargo==='presidente' ? 'p' : (m.cargo==='secretario' ? 's' : (m.sup ? 'u' : '')));
}
function comiteRolTexto(cod){
  cod = String(cod||'');
  var t = cod.charAt(0);
  if(t==='v') return ['Supervisor de SST', 'Elegido por los trabajadores'];
  if(t==='o') return ['Coordinador de SST', 'Sí'];
  var et = {c:'Comité de SST', s:'Sub-comité de SST', x:'Comité Mixto de SST'}[t];
  if(!et) return null;
  var r = cod.charAt(2);
  var rango = (r==='p') ? 'Presidente' : ((r==='s') ? 'Secretario' : ((r==='u') ? 'Suplente' : 'Titular'));
  return [et, rango + ' · ' + (cod.charAt(1)==='e' ? 'por la empresa' : 'por los trabajadores')];
}
function _comHoja(doc, W, M, titulo, sub){
  doc.setFillColor(11,42,58); doc.rect(0,0,W,74,'F');
  doc.setTextColor(245,183,0); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  doc.text('OBRASST · COMITÉ DE SEGURIDAD Y SALUD EN EL TRABAJO', M, 28);
  doc.setTextColor(255,255,255); doc.setFontSize(15);
  doc.text(doc.splitTextToSize(titulo, W-2*M)[0], M, 50);
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(200,215,225);
  doc.text(doc.splitTextToSize(sub||'', W-2*M)[0], M, 65);
}
function _comPie(doc, W, H, M){
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(150,150,150);
  doc.text('Ley 29783 · D.S. 005-2012-TR · generado con OBRASST el '+(fechaLarga(hoyISO())||hoyISO()), M, H-24);
}
function comiteActaPDF(id){
  var a=actaComitePorId(id); if(!a){ return; }
  var d=comiteLocal(), e=null;
  try{ e=empActiva(); }catch(_e){}
  var doc=new jspdf.jsPDF({unit:'pt', format:'a4'});
  var W=595.28, H=841.89, M=46, y=0;
  var nom={}; d.miembros.forEach(function(m){ nom[m.id]=m; });

  _comHoja(doc, W, M, 'ACTA N° '+(a.n||'—')+' · '+(COMITE_TIPOS[a.tipo]||'Reunión').toUpperCase(),
           (e&&e.nombre? e.nombre+'   ·   ' : '')+(fechaLarga(a.fecha)||a.fecha)+
           (a.hora?'   ·   '+a.hora:'')+(a.lugar?'   ·   '+a.lugar:''));
  y=104;
  function salto(alto){
    if(y+alto < H-60) return;
    _comPie(doc,W,H,M); doc.addPage();
    _comHoja(doc, W, M, 'ACTA N° '+(a.n||'—')+' (continúa)', e&&e.nombre? e.nombre : '');
    y=104;
  }
  function titulo(t){
    salto(34);
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(11,42,58);
    doc.text(t.toUpperCase(), M, y); y+=7;
    doc.setDrawColor(225,225,225); doc.setLineWidth(0.7); doc.line(M,y,W-M,y); y+=15;
  }
  function parrafo(t){
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(35,35,35);
    doc.splitTextToSize(String(t||'—'), W-2*M).forEach(function(l){ salto(14); doc.text(l, M, y); y+=13; });
    y+=6;
  }
  /* quórum: el dato que decide si la reunión valió */
  var tit=d.miembros.filter(function(m){ return !m.sup; }).length;
  var asis=(a.asistentes||[]).length, q=comiteQuorum();
  if((typeof esRD==='function' && esRD())){
    titulo('Asistencia');
    parrafo('Asistieron '+asis+' de '+tit+' integrantes titulares.');
  } else {
  titulo('Quórum');
  parrafo('Asistieron '+asis+' de '+tit+' integrantes titulares. El quórum mínimo es de '+q+
          ' (la mitad más uno, D.S. 005-2012-TR art. 69). '+
          (comiteHuboQuorum(a) ? 'La sesión se realizó con quórum.'
                               : 'La sesión se realizó SIN quórum; corresponde citar a nueva reunión dentro de los ocho días siguientes.'));
  }
  if(a.agenda){ titulo('Agenda'); parrafo(a.agenda); }
  if(a.desarrollo){ titulo('Desarrollo'); parrafo(a.desarrollo); }

  if((a.acuerdos||[]).length){
    titulo('Acuerdos');
    a.acuerdos.forEach(function(ac,i){
      salto(40);
      doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(20,20,20);
      doc.splitTextToSize((i+1)+'. '+String(ac.t||''), W-2*M-120).forEach(function(l){ doc.text(l, M, y); y+=13; });
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(110,110,110);
      doc.text('Responsable: '+(ac.quien||'—')+'     Plazo: '+(ac.plazo? (fechaLarga(ac.plazo)||ac.plazo) : 'sin plazo')+
               '     Estado: '+(ac.hecho?'CUMPLIDO':'PENDIENTE'), M, y);
      y+=20;
    });
  }

  /* firmas: dos columnas, línea y nombre */
  titulo('Firmas de los asistentes');
  var col=0, x0=M, ancho=(W-2*M-24)/2;
  (a.asistentes||[]).forEach(function(idm){
    var m=nom[idm]; if(!m) return;
    salto(64);
    var x = x0 + col*(ancho+24);
    doc.setDrawColor(150,150,150); doc.setLineWidth(0.7);
    doc.line(x, y+34, x+ancho, y+34);
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(30,30,30);
    doc.splitTextToSize(m.nombre||'', ancho).slice(0,1).forEach(function(l){ doc.text(l, x, y+46); });
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(120,120,120);
    doc.text((m.cargo==='presidente'?'Presidente':(m.cargo==='secretario'?'Secretario':'Miembro'))+
             ' · '+(m.lado==='empleador'?'Del empleador':'De los trabajadores')+(m.dni?' · '+etDoc(m.dni)+' '+m.dni:''), x, y+57);
    col++;
    if(col===2){ col=0; y+=78; }
  });
  if(col===1) y+=78;
  _comPie(doc,W,H,M);
  entregarPDF(doc, 'acta-comite-'+(a.n||'sn')+'-'+String(a.fecha||'').slice(0,10)+'.pdf');
}
function comiteLibroPDF(anio0){
  var d=comiteLocal(), anio=/^\d{4}$/.test(String(anio0||'')) ? String(anio0) : hoyISO().slice(0,4), actas=comiteActasDe(anio);
  var e=null; try{ e=empActiva(); }catch(_e){}
  var doc=new jspdf.jsPDF({unit:'pt', format:'a4'});
  var W=595.28, H=841.89, M=46, y=0;
  _comHoja(doc, W, M, 'LIBRO DE ACTAS '+anio, (e&&e.nombre? e.nombre+'   ·   ' : '')+
           'Comité de Seguridad y Salud en el Trabajo'+(d.libro? '   ·   Libro N° '+d.libro : ''));
  y=104;
  function salto(alto){
    if(y+alto < H-60) return;
    _comPie(doc,W,H,M); doc.addPage();
    _comHoja(doc, W, M, 'LIBRO DE ACTAS '+anio+' (continúa)', e&&e.nombre? e.nombre : '');
    y=104;
  }
  function titulo(t){
    salto(34);
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(11,42,58);
    doc.text(t.toUpperCase(), M, y); y+=7;
    doc.setDrawColor(225,225,225); doc.setLineWidth(0.7); doc.line(M,y,W-M,y); y+=15;
  }
  function linea(et, val){
    salto(16);
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(130,130,130);
    doc.text(et, M, y);
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(30,30,30);
    doc.splitTextToSize(String(val||'—'), W-2*M-140).slice(0,3).forEach(function(l,i){ doc.text(l, M+140, y+i*12); });
    y+=18;
  }
  /* 1 · quiénes son */
  titulo('El Comité');
  linea('Elección', d.eleccion? (fechaLarga(d.eleccion)||d.eleccion) : '—');
  linea('Instalación', d.instalacion? (fechaLarga(d.instalacion)||d.instalacion) : '—');
  linea('Mandato', (d.desde? (fechaLarga(d.desde)||d.desde):'—')+'  a  '+(d.hasta? (fechaLarga(d.hasta)||d.hasta):'—'));
  linea('Integrantes', d.miembros.filter(function(m){return !m.sup;}).length+' titulares · '+
                       d.miembros.filter(function(m){return m.sup;}).length+' suplentes');
  y+=6;
  COMITE_LADOS.forEach(function(L){
    titulo(L[1]);
    d.miembros.filter(function(m){ return m.lado===L[0]; }).forEach(function(m){
      salto(15);
      doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(30,30,30);
      doc.text('· '+(m.nombre||'')+(m.dni?'  ·  '+etDoc(m.dni)+' '+m.dni:'')+(m.puesto?'  ·  '+m.puesto:'')+
               (m.cargo==='presidente'?'  ·  PRESIDENTE':(m.cargo==='secretario'?'  ·  SECRETARIO':''))+
               (m.sup?'  (suplente)':''), M, y);
      y+=14;
    });
    y+=6;
  });
  /* 2 · el cumplimiento del año, que es lo que se fiscaliza */
  titulo('Reuniones de '+anio);
  var meses=comiteMesesDelAnio(anio), hechas=0;
  meses.forEach(function(m){ if(m.estado==='hecha') hechas++; });
  parrafoLibro('Se realizaron '+hechas+' de las 12 reuniones ordinarias que exige el D.S. 005-2012-TR art. 68'+
               (hechas<12? ('. Meses sin acta ordinaria: '+meses.filter(function(m){return m.estado==='perdida';})
                    .map(function(m){ return MESES_ES[m.mes-1]; }).join(', ')||'—') : '.'));
  function parrafoLibro(t){
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(35,35,35);
    doc.splitTextToSize(String(t||''), W-2*M).forEach(function(l){ salto(14); doc.text(l, M, y); y+=13; });
    y+=8;
  }
  /* 3 · acta por acta */
  actas.slice().sort(function(x,y2){ return String(x.fecha||'').localeCompare(String(y2.fecha||'')); }).forEach(function(a){
    titulo('Acta N° '+(a.n||'—')+' · '+(COMITE_TIPOS[a.tipo]||'Reunión'));
    linea('Fecha', (fechaLarga(a.fecha)||a.fecha)+(a.hora?'  ·  '+a.hora:'')+(a.lugar?'  ·  '+a.lugar:''));
    linea('Asistencia', (a.asistentes||[]).length+' de '+d.miembros.filter(function(m){return !m.sup;}).length+
                        ((typeof esRD==='function' && esRD()) ? '' : '  ·  '+(comiteHuboQuorum(a)?'con quórum':'SIN quórum')));
    if(a.agenda) parrafoLibro('Agenda: '+a.agenda);
    if(a.desarrollo) parrafoLibro(a.desarrollo);
    (a.acuerdos||[]).forEach(function(ac,i){
      salto(30);
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(20,20,20);
      doc.splitTextToSize('Acuerdo '+(i+1)+': '+String(ac.t||''), W-2*M).forEach(function(l){ salto(13); doc.text(l, M, y); y+=12; });
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(110,110,110);
      doc.text('Responsable: '+(ac.quien||'—')+'   Plazo: '+(ac.plazo||'sin plazo')+'   '+(ac.hecho?'CUMPLIDO':'PENDIENTE'), M, y);
      y+=18;
    });
    y+=6;
  });
  if(!actas.length) parrafoLibro('No hay actas registradas en '+anio+'.');
  _comPie(doc,W,H,M);
  entregarPDF(doc, 'libro-de-actas-comite-'+anio+'.pdf');
}
/* ── de la app · el trabajador del mes ── */
function ptNombreATS(){
  var sec=(empActiva()||{}).sector || leer(LS.sec,'') || 'construccion';
  if(sec==='mineria')       return 'Participó en el IPERC continuo o la charla de 5 minutos';
  if(sec==='hidrocarburos') return 'Participó en el ATS / permiso de trabajo o la charla de 5 minutos';
  if(sec==='industria')     return 'Participó en el ATS / análisis de la tarea o la charla de 5 minutos';
  return 'Participó en el ATS o la charla de 5 minutos';
}
function ptCortoATS(){
  var sec=(empActiva()||{}).sector || leer(LS.sec,'') || 'construccion';
  if(sec==='mineria') return 'IPERC / charla';
  return 'ATS / charla';
}
var TDM_CATALOGO = [
  {k:'epp',      c:'EPP',                t:'Usó el EPP completo y en buen estado'},
  {k:'ats',      get c(){ return ptCortoATS(); }, get t(){ return ptNombreATS(); }},
  {k:'orden',    c:'Orden y limpieza',   t:'Orden y limpieza en su área'},
  {k:'senal',    c:'Señales y permisos', t:'Respetó la señalización, bloqueos y permisos'},
  {k:'herr',     c:'Herramientas',       t:'Revisó sus herramientas y equipos antes de usarlos'},
  {k:'proc',     c:'Procedimiento',      t:'Siguió el procedimiento seguro de su tarea'},
  {k:'cuida',    c:'Cuidó a otros',      t:'Cuidó a un compañero: le avisó o paró un trabajo inseguro', mas:true},
  {k:'reporto',  c:'Reportó',            t:'Reportó un acto o una condición insegura', mas:true},
  /* sugeridos, fuera de los ocho de fábrica */
  {k:'residuos', c:'Residuos',           t:'Separó sus residuos en el cilindro de su color'},
  {k:'puntual',  c:'Puntual',            t:'Llegó a la hora y estuvo desde el inicio de la charla'},
  {k:'celular',  c:'Sin celular',        t:'No usó el celular en la zona de trabajo'},
  {k:'area',     c:'En su área',         t:'Trabajó solo en su área y en la tarea que le asignaron'},
  {k:'pausa',    c:'Pausa activa',       t:'Hizo la pausa activa'},
  {k:'altura',   c:'Arnés al 100 %',     t:'En altura: arnés puesto y enganchado todo el tiempo'}
];
var TDM_DE_FABRICA = ['epp','ats','orden','senal','herr','proc','cuida','reporto'];
var TDM_LITE = ['epp','ats','orden','senal'];
var TDM_TOPE = 12, TDM_MINIMO = 3;
function tdmPunto(k){
  var i;
  for(i=0;i<TDM_CATALOGO.length;i++) if(TDM_CATALOGO[i].k===k) return TDM_CATALOGO[i];
  var p=(tdmCfg().propios)||[];
  for(i=0;i<p.length;i++) if(p[i] && p[i].k===k) return p[i];
  return null;
}
function _ptEsMas(k){ var p=tdmPunto(k); return !!(p && p.mas); }
function ptCriterios(){
  if(!libre()) return TDM_LITE.map(tdmPunto);
  var a=tdmCfg().lista.map(tdmPunto).filter(Boolean);
  return a.length>=TDM_MINIMO ? a : TDM_DE_FABRICA.map(tdmPunto);
}
function _ptLlave(dni, nombre){
  var d=String(dni||'').toUpperCase().replace(/[^0-9A-Z]/g,'');
  return d ? ('d'+d) : ('n'+_norml(nombre||''));
}
function _ptNotaDe(vals, lista){
  var apl=0, bien=0;
  (lista||ptCriterios()).forEach(function(c){ var v=vals[c.k]; if(v!==-1 && v!==undefined && v!==null){ apl++; if(v===1) bien++; } });
  return {apl:apl, bien:bien, prom: apl ? bien/apl : 0};
}
function _ptPalabras(s){
  return _selNorm(s).replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(function(x){ return x.length>1; });
}
function _ptMismaPersona(a, b){
  var x=_ptPalabras(a), y=_ptPalabras(b);
  if(x.length<2 || y.length<2) return false;
  var chico = x.length<=y.length ? x : y, grande = (chico===x) ? y : x;
  for(var i=0;i<chico.length;i++) if(grande.indexOf(chico[i])<0) return false;
  return true;
}
var PT_MINIMO_DIAS = 3;
function tdmResumir(a){
  if(!a || !a.length) return [];
  var por={};
  a.forEach(function(p){
    var nom=(p.trabajador||'').trim(); if(!nom) return;
    var llave=_ptLlave(p.dni, nom);
    var w=por[llave] || (por[llave]={nombre:nom, dni:p.dni||'', d:{}});
    var c=p.criterios||{}; if(typeof c==='string'){ try{ c=JSON.parse(c); }catch(_e){ c={}; } }
    var tt=+c._t||0, f=String(p.fecha||'').slice(0,10), pr=parseFloat(p.promedio)||0;
    var ya=w.d[f];
    if(!ya || tt>ya.t) w.d[f]={t:tt, prom:pr, n:1, crit:c};
    else if(tt===ya.t){ ya.prom=(ya.prom*ya.n+pr)/(ya.n+1); ya.n++; }
  });
  var lista=[];
  Object.keys(por).forEach(function(k){
    var w=por[k], dias=Object.keys(w.d), suma=0, ini=0, crit={}, critN={};
    dias.forEach(function(f){
      var x=w.d[f]; suma+=x.prom;
      Object.keys(x.crit||{}).forEach(function(q){
        if(q.charAt(0)==='_') return;
        var v=x.crit[q]; if(v===-1 || v===null || v===undefined) return;
        critN[q]=(critN[q]||0)+1;
        if(v===1){ crit[q]=(crit[q]||0)+1; if(_ptEsMas(q)) ini++; }
      });
    });
    lista.push({nombre:w.nombre, dni:w.dni, dias:dias.length, prom:dias.length ? suma/dias.length : 0, ini:ini, crit:crit, critN:critN});
  });
  lista.sort(function(x,y){
    var a1=Math.round(x.prom*1000), b1=Math.round(y.prom*1000);
    if(b1!==a1) return b1-a1;
    if(y.ini!==x.ini) return y.ini-x.ini;
    return y.dias-x.dias;
  });
  return lista;
}
function tdmMeses(){
  var out=[], d=new Date(hoyISO()+'T00:00:00');
  for(var i=0;i<12;i++){
    var x=new Date(d.getFullYear(), d.getMonth()-i, 1);
    out.push(x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2));
  }
  return out;
}
function tdmUltimoDia(m){
  var y=parseInt(m.slice(0,4),10), mm=parseInt(m.slice(5,7),10);
  var u=new Date(y, mm, 0).getDate();
  return m+'-'+('0'+u).slice(-2);
}
function tdmCerrado(m){ return hoyISO() >= tdmUltimoDia(m); }
function _tdmPrimerNombre(n){
  n=String(n||'').trim();
  if(n.indexOf(',')>-1) return (n.split(',')[1]||'').trim().split(/\s+/)[0] || n.split(' ')[0];
  return n.split(/\s+/)[0];
}
function _pdfDiplomaTdm(g, mes, puesto, oficial){
  var emp=empleador(), e=empActiva()||{};
  var doc=new jspdf.jsPDF({unit:'pt', format:'a4', orientation:'landscape'});
  var W=841.89, H=595.28;
  var AZUL=[11,42,58], ORO=[245,183,0], GRIS=[95,95,95];
  /* fondo y marco */
  doc.setFillColor(252,251,247); doc.rect(0,0,W,H,'F');
  doc.setDrawColor(ORO[0],ORO[1],ORO[2]); doc.setLineWidth(6); doc.rect(22,22,W-44,H-44);
  doc.setDrawColor(AZUL[0],AZUL[1],AZUL[2]); doc.setLineWidth(1.2); doc.rect(34,34,W-68,H-68);
  /* banda superior */
  doc.setFillColor(AZUL[0],AZUL[1],AZUL[2]); doc.rect(34,34,W-68,74,'F');
  var xTxt=60;
  if(emp.logo){
    try{
      /* el logo en un cuadro blanco para que se vea sobre el azul, sea del color que sea */
      doc.setFillColor(255,255,255); doc.roundedRect(48,42,120,58,6,6,'F');
      pdfLogo(doc, 56, 47, 104, 48);
      xTxt=186;
    }catch(_e){}
  }
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(15);
  doc.text(String(emp.razon || e.nombre || 'La empresa').toUpperCase(), xTxt, 64);
  doc.setFont('helvetica','normal'); doc.setFontSize(9.5);
  doc.text((e.nombre && emp.razon && e.nombre!==emp.razon) ? ('Obra: '+e.nombre) : 'Seguridad y Salud en el Trabajo', xTxt, 82);
  doc.setFontSize(9); doc.text('RECONOCIMIENTO', W-60, 64, {align:'right'});
  doc.text(mesBonito(mes).toUpperCase(), W-60, 82, {align:'right'});

  /* titulo */
  var y=188;
  doc.setTextColor(AZUL[0],AZUL[1],AZUL[2]); doc.setFont('helvetica','bold'); doc.setFontSize(34);
  doc.text(puesto===0 ? 'TRABAJADOR DEL MES' : 'RECONOCIMIENTO A LA SEGURIDAD', W/2, y, {align:'center'});
  doc.setDrawColor(ORO[0],ORO[1],ORO[2]); doc.setLineWidth(2.5); doc.line(W/2-120, y+14, W/2+120, y+14);
  doc.setFont('helvetica','normal'); doc.setFontSize(13); doc.setTextColor(GRIS[0],GRIS[1],GRIS[2]);
  doc.text(puesto===0 ? 'Se otorga el presente reconocimiento a' : ('Puesto '+(puesto+1)+' del mes · se reconoce a'), W/2, y+46, {align:'center'});
  /* nombre */
  doc.setFont('helvetica','bold'); doc.setTextColor(AZUL[0],AZUL[1],AZUL[2]);
  var nom=String(g.nombre||'').toUpperCase(), tam=30;
  while(tam>16 && doc.getTextWidth(nom)*(tam/doc.getFontSize())>W-160) tam-=2;
  doc.setFontSize(tam); doc.text(nom, W/2, y+92, {align:'center'});
  doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(GRIS[0],GRIS[1],GRIS[2]);
  var sub=[]; if(g.dni) sub.push(etDoc(g.dni)+' '+g.dni);
  var t=null; try{ t=(trabsLocal()||[]).filter(function(x){ return g.dni && String(x.dni||'').replace(/\D/g,'')===String(g.dni).replace(/\D/g,''); })[0]; }catch(_t){}
  if(t && t.puesto) sub.push(t.puesto);
  if(sub.length) doc.text(sub.join(' · '), W/2, y+112, {align:'center'});
  /* por que */
  doc.setFontSize(12.5); doc.setTextColor(60,60,60);
  var porque='por trabajar seguro durante '+mesBonito(mes)+': '+Math.round(g.prom*100)+' % de cumplimiento en '+
             g.dias+' día'+(g.dias===1?'':'s')+' evaluado'+(g.dias===1?'':'s')+' de seguridad y salud en el trabajo'+
             (g.ini ? (', y '+g.ini+(g.ini===1?' iniciativa':' iniciativas')+' de prevención (reportó un peligro o cuidó a un compañero).') : '.');
  doc.text(doc.splitTextToSize(porque, W-220), W/2, y+142, {align:'center'});
  /* los criterios, cortos */
  doc.setFontSize(9.5); doc.setTextColor(GRIS[0],GRIS[1],GRIS[2]);
  var crit=ptCriterios().map(function(c){ return c.c||c.t; }).join('  ·  ');
  doc.text(doc.splitTextToSize('Puntos evaluados: '+crit, W-200), W/2, y+180, {align:'center'});

  /* firmas */
  var yf=H-118;
  doc.setDrawColor(AZUL[0],AZUL[1],AZUL[2]); doc.setLineWidth(.9);
  doc.line(120, yf, 340, yf); doc.line(W-340, yf, W-120, yf);
  doc.setFontSize(9.5); doc.setTextColor(AZUL[0],AZUL[1],AZUL[2]); doc.setFont('helvetica','bold');
  doc.text('Supervisor / Responsable SSOMA', 230, yf+14, {align:'center'});
  doc.text('Residente / Gerencia', W-230, yf+14, {align:'center'});
  doc.setFont('helvetica','normal'); doc.setTextColor(GRIS[0],GRIS[1],GRIS[2]); doc.setFontSize(8.5);
  var sup=(leer(LS_SUP,{})||{}).nombre||'';
  var selloD=selloDatos();
  if(selloD) _pdfSello(doc, 230, yf+22, selloD, 220, false);
  else if(sup) doc.text(sup, 230, yf+27, {align:'center'});
  /* pie */
  doc.setFontSize(7.5); doc.setTextColor(140,140,140);
  doc.text('Emitido el '+(fechaLarga(hoyISO())||hoyISO())+' · Reconocimiento interno de la empresa, no es una certificación. Generado con OBRASST.', W/2, H-52, {align:'center'});
  if(!oficial){
    doc.setTextColor(200,60,60); doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text('AVANCE · el mes aún no cierra', W/2, H-40, {align:'center'});
  }
  return doc.output('blob');
}
  function _sale(f){ _SALE = null; f(); var r = _SALE; _SALE = null; return r; }
  return {
    usar: function(C){ _C = C || {}; return this; },
    /* el logo sin su marco blanco (una vez por logo): se pide antes de armar un PDF → Promise<{du, r}> */
    logoSinMarco: logoSinMarco,
    /* la amonestación: a = { fecha, tNombre, tDni, tPuesto, qNombre, qDni, qPuesto, desc, medida, firmas } → { blob, recorto } */
    AMON_FIRMAS: AMON_FIRMAS, amonPdf: function(a){ return _pdfDeAmon(a); },
    /* la credencial */
    HABIL: HABIL, habilDe: habilDe, esBrigadista: esBrigadista, credCodUnico: credCodUnico, credDatos: credDatos, credFirma: credFirma, enlaceCred: enlaceCred, credQR: credQR, pcSelloQR: pcSelloQR,
    comiteRolCod: comiteRolCod, comiteRolTexto: comiteRolTexto,
    credPdf: function(cod, sos){ return _sale(function(){ credPDF(cod, sos || [], true); }); },
    /* los números de emergencia de la obra (van en el carné) y las credenciales anuladas que siguen valiendo como tales */
    emergsLocal: emergsLocal, tumbasVivas: _tumbasVivas,
    /* el sello «Capacitación al día»: la fecha en seis cifras, como va en el QR */
    pcCorto: _pcCorto, normNom: _normNom,
    /* «¿A quién acudo?»: los números de emergencia, la línea de mando, la brigada (de las credenciales) y lo que se publica */
    EMERG_MAX: EMERG_MAX, EMERG_EN_STICKER: EMERG_EN_STICKER, EMERG_DE_QUIEN: EMERG_DE_QUIEN, CARGOS_SUGERIDOS: CARGOS_SUGERIDOS, QUI_CARGO: _QUI_CARGO,
    emergTel: _emergTel, emergsLimpios: _emergsLimpios, brigadaDeLaObra: brigadaDeLaObra, quienesPaquete: quienesPaquete,
    /* el comité */
    COMITE_MIN: COMITE_MIN, COMITE_LADOS: COMITE_LADOS, COMITE_TIPOS: COMITE_TIPOS, MESES_3: MESES_3, MESES_ES: MESES_ES,
    comiteSello: comiteSello, comiteFusion: comiteFusion, comiteLoQueToca: comiteLoQueToca, comiteTitulares: comiteTitulares, comiteSuplentes: comiteSuplentes, comiteFaltas: comiteFaltas, comiteDiasDeMandato: comiteDiasDeMandato,
    comiteQuorum: comiteQuorum, comiteHuboQuorum: comiteHuboQuorum, comiteActasDe: comiteActasDe, comiteMesesDelAnio: comiteMesesDelAnio, comiteAcuerdosPendientes: comiteAcuerdosPendientes,
    comiteNumeroSiguiente: comiteNumeroSiguiente, actaComitePorId: actaComitePorId,
    comiteActaPdf: function(id){ return _sale(function(){ comiteActaPDF(id); }); },
    comiteLibroPdf: function(anio){ return _sale(function(){ comiteLibroPDF(anio); }); },
    /* el trabajador del mes */
    TDM_CATALOGO: TDM_CATALOGO, TDM_DE_FABRICA: TDM_DE_FABRICA, TDM_LITE: TDM_LITE, TDM_TOPE: TDM_TOPE, TDM_MINIMO: TDM_MINIMO, PT_MINIMO_DIAS: PT_MINIMO_DIAS,
    tdmPunto: tdmPunto, ptCriterios: ptCriterios, ptLlave: _ptLlave, ptNotaDe: _ptNotaDe, ptMismaPersona: _ptMismaPersona, tdmResumir: tdmResumir, tdmMeses: tdmMeses, tdmUltimoDia: tdmUltimoDia, tdmCerrado: tdmCerrado,
    tdmPrimerNombre: _tdmPrimerNombre, mesBonito: mesBonito,
    tdmDiploma: function(g, mes, puesto, oficial){ return _pdfDiplomaTdm(g, mes, puesto, oficial); }
  };
})();
