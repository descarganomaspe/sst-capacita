/* OBRASST · el portal · LA GESTIÓN, TAMBIÉN POR LA WEB (07/10/2026)
   Marcelo: «Si alguien quiere agregar su gestión ya en la web, se tiene que dar la posibilidad… capacitaciones ya
   realizadas, no solo programar… al igual que inspecciones mensuales, simulacros, campañas, reportes… escribir 100
   trabajadores tomaría tiempo: que suban una relación… horas hombre trabajadas y capacitadas igual que en la app,
   con los mismos parámetros (también las pasadas)… los índices de accidentabilidad que tiene la empresa… casi todo
   lo de la app también por la web».
   Esta parte se pide recién cuando hace falta (cargarGestion, en index.html). Tres reglas:
   1. LO MISMO QUE LA APP. Lo que la app guarda en el servidor se escribe en su misma tabla y con su misma forma: el
      trabajador en sst_trabajador, el día en sst_hht, el evento en sst_accidente, la inspección en sst_inspeccion,
      el reporte en sst_reporte. El celular lo baja al sincronizar. Lo que en la app vive solo en el celular (el
      simulacro, la campaña) y la capacitación dada en papel van a sst_doc, hoja «ges-act» (ver la sección 4).
   2. «YA SE HIZO» NO ES «PROGRAMAR». Lo realizado lleva su fecha (de hoy para atrás) y su evidencia; lo que viene
      se sigue programando donde siempre. Las dos puertas dicen cuál es cuál.
   3. NADA INVENTADO. Los índices salen de lo registrado, con la misma cuenta de la app; lo que la obra trae de
      antes se carga como lo que es (horas, eventos, días perdidos), no como un número suelto.
   No editar la versión: la sella armar.py (GESTION_VER). */

/* ══ 0 · LO COMÚN ═══════════════════════════════════════════════════════════ */
var GES = { per:null };
function _gesCss(){
  if($('ges-css')) return;
  var st=document.createElement('style'); st.id='ges-css';
  st.textContent=[
    /* la zona donde se suelta el archivo */
    '.ges-zona{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:2px dashed var(--raya2);border-radius:12px;background:#FAFBFC;padding:26px 18px;text-align:center;cursor:pointer;transition:border-color .12s,background .12s}',
    '.ges-zona:hover,.ges-zona.sobre{border-color:var(--azul);background:var(--azul-f)}',
    '.ges-zona b{font-size:15px;color:var(--tinta);font-weight:600}.ges-zona span{font-size:13px;color:var(--gris)}.ges-zona .ges-ic{font-size:26px;line-height:1}',
    '.ges-zona input{display:none}',
    '.ges-o{display:flex;align-items:center;gap:12px;margin:16px 0 12px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--gris2)}',
    '.ges-o:before,.ges-o:after{content:"";flex:1;height:1px;background:var(--raya)}',
    /* qué columna es cada dato */
    '.ges-map{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px 12px;margin:0 0 6px}',
    '.ges-map .campo{margin:0}.ges-map select{width:100%}.ges-map label b{color:var(--mal);font-weight:600}',
    '.ges-map .campo.vacia select{color:var(--gris2)}',
    /* la vista previa */
    '.ges-cuenta{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 10px}',
    '.ges-prev{border:1px solid var(--raya);border-radius:10px;overflow:auto;max-height:340px;background:var(--panel)}',
    '.ges-prev table{width:100%;border-collapse:collapse;font-size:13px}',
    '.ges-prev th{position:sticky;top:0;background:#FAFBFC;text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--gris);font-weight:600;padding:8px 10px;border-bottom:1px solid var(--raya);white-space:nowrap;z-index:1}',
    '.ges-prev td{padding:7px 10px;border-bottom:1px solid var(--raya);vertical-align:top}.ges-prev tr:last-child td{border-bottom:0}',
    '.ges-prev td.n{color:var(--gris2);font-variant-numeric:tabular-nums;width:1%;white-space:nowrap}',
    '.ges-prev tr.no td{color:var(--gris)}.ges-prev tr.no td b{font-weight:500;color:var(--gris)}',
    '.ges-prev small{display:block;color:var(--gris);font-size:12px;line-height:1.4}',
    '.ges-prev .pill{margin-right:4px}',
    '.ges-op{display:grid;gap:8px;margin:14px 0 0}',
    '.ges-radio{display:flex;flex-wrap:wrap;gap:6px}',
    '.ges-avance{height:8px;border-radius:4px;background:var(--fondo);overflow:hidden;margin:10px 0 6px}.ges-avance i{display:block;height:100%;background:var(--ok);border-radius:4px;transition:width .2s}',
    '.ges-lista-chica{margin:8px 0 0;padding:0 0 0 18px;font-size:13px;line-height:1.6;color:var(--texto)}.ges-lista-chica li small{color:var(--gris)}',
    '@media (max-width:640px){.ges-map{grid-template-columns:1fr 1fr}.ges-zona{padding:20px 12px}}'
  ].join('\n');
  document.head.appendChild(st);
}
function gesTxt(v){ return String(v==null ? '' : v).replace(/\s+/g, ' ').trim(); }
function gesPlural(n, uno, varios){ return n+' '+(n===1 ? uno : varios); }

/* ── leer un Excel (.xlsx) sin librerías: es un ZIP con hojas en XML ────────────────────────
   El navegador ya sabe descomprimir (DecompressionStream); aquí se leen el índice del ZIP, los textos
   compartidos, los estilos (para saber qué celda es una fecha) y la hoja. */
function _gesU16(b, o){ return b[o] | (b[o+1]<<8); }
function _gesU32(b, o){ return (b[o] | (b[o+1]<<8) | (b[o+2]<<16) | (b[o+3]<<24)) >>> 0; }
function gesZip(buf){
  var b=new Uint8Array(buf), fin=-1;
  for(var i=b.length-22; i>=0 && i>=b.length-22-65535; i--){ if(_gesU32(b, i)===0x06054b50){ fin=i; break; } }
  if(fin<0) throw 'no_es_excel';
  var n=_gesU16(b, fin+10), off=_gesU32(b, fin+16), ents={}, dec=new TextDecoder('utf-8');
  for(var k=0; k<n; k++){
    if(off+46>b.length || _gesU32(b, off)!==0x02014b50) break;
    var ln=_gesU16(b, off+28), le=_gesU16(b, off+30), lc=_gesU16(b, off+32);
    ents[dec.decode(b.subarray(off+46, off+46+ln))]={ met:_gesU16(b, off+10), tc:_gesU32(b, off+20), lo:_gesU32(b, off+42) };
    off+=46+ln+le+lc;
  }
  return {
    nombres:Object.keys(ents),
    tiene:function(nom){ return !!ents[nom]; },
    leer:function(nom){
      var e=ents[nom]; if(!e) return Promise.resolve(null);
      if(_gesU32(b, e.lo)!==0x04034b50) return Promise.reject('no_es_excel');
      var ini=e.lo+30+_gesU16(b, e.lo+26)+_gesU16(b, e.lo+28), datos=b.subarray(ini, ini+e.tc);
      if(e.met===0) return Promise.resolve(dec.decode(datos));
      if(e.met!==8) return Promise.reject('no_es_excel');
      if(typeof DecompressionStream==='undefined') return Promise.reject('sin_descompresor');
      return new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()
        .then(function(a){ return dec.decode(a); }, function(){ return Promise.reject('no_es_excel'); });
    }
  };
}
function _gesXml(t){ return new DOMParser().parseFromString(String(t||'').replace(/^\uFEFF/, ''), 'application/xml'); }
/* las etiquetas por su nombre, lleven o no prefijo (hay programas que escriben <x:row>) */
function _gesEls(n, nombre){ return n.getElementsByTagNameNS('*', nombre); }
function _gesCol(ref){ var n=0, m=/^([A-Z]+)/.exec(String(ref||'').toUpperCase()); if(!m) return -1; for(var i=0;i<m[1].length;i++) n=n*26+(m[1].charCodeAt(i)-64); return n-1; }
function _gesEsFechaFmt(id, propios){
  id=+id||0;
  if((id>=14 && id<=22) || (id>=27 && id<=36) || (id>=45 && id<=47) || (id>=50 && id<=58)) return true;
  var c=propios[id]; if(!c) return false;
  c=String(c).replace(/"[^"]*"/g, '').replace(/\[[^\]]*\]/g, '').replace(/\\./g, '');
  return /[dmyhs]/i.test(c) && !/general/i.test(c);
}
function gesSerialAFecha(v, d1904){
  var n=parseFloat(v); if(!isFinite(n) || n<1 || n>80000) return '';
  var ms=Math.round((Math.floor(n)+(d1904 ? 1462 : 0)-25569)*86400000);
  try{ return new Date(ms).toISOString().slice(0,10); }catch(e){ return ''; }
}
function _gesNumTxt(v){
  v=String(v==null ? '' : v).trim(); if(!v) return '';
  if(/e/i.test(v) || /\.\d{10,}$/.test(v)){ var n=Number(v); if(isFinite(n)){ var r=Math.round(n*1e6)/1e6; v=(Math.abs(r)<1e21) ? String(r) : v; } }
  return v.replace(/^(-?\d+)\.0+$/, '$1');
}
/* → {hojas:[{n, filas:[[texto…]…]}]} (las hojas ocultas y las vacías no cuentan) */
function gesLeerXlsx(buf){
  var Z;
  try{ Z=gesZip(buf); }catch(e){ return Promise.reject(e); }
  if(!Z.tiene('xl/workbook.xml')) return Promise.reject('no_es_excel');
  return Promise.all([Z.leer('xl/workbook.xml'), Z.leer('xl/_rels/workbook.xml.rels'), Z.leer('xl/sharedStrings.xml'), Z.leer('xl/styles.xml')]).then(function(r){
    var wb=_gesXml(r[0]), rels={}, textos=[], fmts=[], propios={};
    var d1904=false; var pr=_gesEls(wb, 'workbookPr')[0]; if(pr && /^(1|true)$/i.test(pr.getAttribute('date1904')||'')) d1904=true;
    if(r[1]) Array.prototype.forEach.call(_gesEls(_gesXml(r[1]), 'Relationship'), function(x){ rels[x.getAttribute('Id')]=x.getAttribute('Target'); });
    if(r[2]) Array.prototype.forEach.call(_gesEls(_gesXml(r[2]), 'si'), function(si){
      var t=''; Array.prototype.forEach.call(_gesEls(si, 't'), function(x){ if(x.parentNode && x.parentNode.localName==='rPh') return; t+=x.textContent; });
      textos.push(t);
    });
    if(r[3]){
      var st=_gesXml(r[3]);
      Array.prototype.forEach.call(_gesEls(st, 'numFmt'), function(x){ propios[+x.getAttribute('numFmtId')]=x.getAttribute('formatCode')||''; });
      var cx=_gesEls(st, 'cellXfs')[0];
      if(cx) Array.prototype.forEach.call(_gesEls(cx, 'xf'), function(x){ fmts.push(_gesEsFechaFmt(x.getAttribute('numFmtId'), propios)); });
    }
    var hojas=[];
    Array.prototype.forEach.call(_gesEls(wb, 'sheet'), function(s){
      if(/hidden/i.test(s.getAttribute('state')||'')) return;
      var rid=s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      var tg=String(rels[rid]||''); if(!tg) return;
      tg=tg.replace(/^\/+/, ''); if(tg.indexOf('xl/')!==0) tg='xl/'+tg.replace(/^\.\//, '');
      hojas.push({ n:s.getAttribute('name')||'Hoja', ruta:tg });
    });
    return hojas.reduce(function(cad, h){
      return cad.then(function(){
        return Z.leer(h.ruta).then(function(x){
          h.filas=[]; if(!x) return;
          var doc=_gesXml(x);
          Array.prototype.forEach.call(_gesEls(doc, 'row'), function(row){
            var f=[], sig=0, hay=false;
            Array.prototype.forEach.call(_gesEls(row, 'c'), function(c){
              var k=_gesCol(c.getAttribute('r')); if(k<0) k=sig; sig=k+1;
              var t=c.getAttribute('t')||'n', v=_gesEls(c, 'v')[0], val='';
              if(t==='inlineStr'){ Array.prototype.forEach.call(_gesEls(c, 't'), function(y){ val+=y.textContent; }); }
              else if(v){
                var crudo=v.textContent;
                if(t==='s') val=textos[+crudo]||'';
                else if(t==='b') val=(crudo==='1') ? 'Sí' : 'No';
                else if(t==='e') val='';
                else if(t==='str' || t==='d') val=crudo;
                else val=(fmts[+c.getAttribute('s')||0] ? (gesSerialAFecha(crudo, d1904) || _gesNumTxt(crudo)) : _gesNumTxt(crudo));
              }
              val=String(val).replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
              if(val){ hay=true; f[k]=val; }
            });
            if(hay){ for(var i=0;i<f.length;i++) if(f[i]===undefined) f[i]=''; f.r=parseInt(row.getAttribute('r'), 10) || (h.filas.length ? h.filas[h.filas.length-1].r+1 : 1); h.filas.push(f); }
          });
        });
      });
    }, Promise.resolve()).then(function(){
      return { hojas:hojas.filter(function(h){ return h.filas && h.filas.length; }).map(function(h){ return { n:h.n, filas:h.filas }; }) };
    });
  });
}
/* ── un texto con columnas: el CSV de Excel (; o ,), o lo copiado de una hoja (tabuladores) ── */
function gesLeerTexto(t, pegado){
  t=String(t||'').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  var muestra=t.split('\n').slice(0, 12).join('\n'), mejor='\t', max=0;
  /* en lo pegado la coma no separa columnas: los nombres la traen («Quispe Rojas, Ana») */
  (pegado ? ['\t', ';', '|'] : ['\t', ';', ',', '|']).forEach(function(s){
    var n=0, dentro=false;
    for(var i=0;i<muestra.length;i++){ var ch=muestra.charAt(i); if(ch==='"') dentro=!dentro; else if(ch===s && !dentro) n++; }
    if(n>max){ max=n; mejor=s; }
  });
  var filas=[], f=[], c='', q=false, i=0, L=t.length, linea=1;
  function celda(){ f.push(c.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim()); c=''; }
  function fila(){ celda(); if(f.some(function(x){ return x!==''; })){ f.r=linea; filas.push(f); } f=[]; linea++; }
  for(; i<L; i++){
    var ch=t.charAt(i);
    if(q){
      if(ch==='"'){ if(t.charAt(i+1)==='"'){ c+='"'; i++; } else q=false; }
      else c+=(ch==='\n' ? ' ' : ch);
    } else if(ch==='"' && c===''){ q=true; }
    else if(ch===mejor){ celda(); }
    else if(ch==='\n'){ fila(); }
    else c+=ch;
  }
  if(c!=='' || f.length) fila();
  return filas;
}
/* los bytes de un archivo de texto: UTF-8 si lo es; si no, el «ANSI» de Excel en Windows */
function gesDecodificar(buf){
  var b=new Uint8Array(buf);
  if(b.length>=2 && b[0]===0xFF && b[1]===0xFE) return new TextDecoder('utf-16le').decode(b);
  try{ return new TextDecoder('utf-8', {fatal:true}).decode(b); }catch(e){}
  try{ return new TextDecoder('windows-1252').decode(b); }catch(e2){ return new TextDecoder('utf-8').decode(b); }
}
function gesLeerArchivo(file){
  return new Promise(function(res, rej){
    if(!file) return rej('sin_archivo');
    if((file.size||0) > 12*1024*1024) return rej('muy_grande');
    var fr=new FileReader();
    fr.onerror=function(){ rej('no_se_leyo'); };
    fr.onload=function(){
      var buf=fr.result, b=new Uint8Array(buf), nom=String(file.name||'').toLowerCase();
      if(b.length>=4 && b[0]===0x50 && b[1]===0x4B){ gesLeerXlsx(buf).then(res, rej); return; }
      if(b.length>=4 && b[0]===0xD0 && b[1]===0xCF && b[2]===0x11 && b[3]===0xE0) return rej('xls_viejo');
      if(/\.(xlsx|xlsm|xls|ods)$/.test(nom)) return rej(/\.xls$/.test(nom) ? 'xls_viejo' : 'no_es_excel');
      if(b.length>=5 && b[0]===0x25 && b[1]===0x50 && b[2]===0x44 && b[3]===0x46) return rej('es_pdf');
      var filas=gesLeerTexto(gesDecodificar(buf));
      res({ hojas:filas.length ? [{ n:'', filas:filas }] : [] });
    };
    fr.readAsArrayBuffer(file);
  });
}
var GES_NO_LEYO = {
  xls_viejo:'Ese archivo es de Excel antiguo (.xls). Ábrelo y guárdalo como «Libro de Excel (.xlsx)», o copia las filas y pégalas aquí abajo.',
  no_es_excel:'No se pudo abrir ese archivo. Tiene que ser un Excel (.xlsx) o un .csv; también puedes copiar las filas y pegarlas aquí abajo.',
  sin_descompresor:'Este navegador no puede abrir el Excel directamente. Guarda la hoja como CSV, o copia las filas y pégalas aquí abajo.',
  es_pdf:'Eso es un PDF: de un PDF no se puede sacar la lista. Usa el Excel, o copia las filas y pégalas aquí abajo.',
  muy_grande:'Ese archivo pesa más de 12 MB. Deja solo la hoja con la lista y vuelve a intentarlo.',
  no_se_leyo:'No se pudo leer el archivo. Inténtalo otra vez.', sin_archivo:'No llegó ningún archivo.'
};
function gesNoLeyo(e){ return GES_NO_LEYO[e] || GES_NO_LEYO.no_es_excel; }
/* una fecha escrita como sea: 2026-03-05 · 05/03/2026 · 5-3-26 · 5 mar 2026 → 2026-03-05 (día primero, como aquí) */
var GES_MES = { ene:1, feb:2, mar:3, abr:4, may:5, jun:6, jul:7, ago:8, set:9, sep:9, oct:10, nov:11, dic:12, jan:1, apr:4, aug:8, dec:12 };
function gesFecha(v){
  v=String(v==null ? '' : v).trim(); if(!v) return '';
  var m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v), y, mo, d;
  if(m){ y=+m[1]; mo=+m[2]; d=+m[3]; }
  else if((m=/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/.exec(v))){ d=+m[1]; mo=+m[2]; y=+m[3]; if(y<100) y+=(y<70 ? 2000 : 1900); }
  else if((m=/^(\d{1,2})[\s\/.\-]+(?:de\s+)?([a-záéíóú]{3,})\.?[\s\/.\-]+(?:de\s+)?(\d{2,4})$/i.exec(v))){
    d=+m[1]; mo=GES_MES[nrm(m[2]).slice(0,3)]||0; y=+m[3]; if(y<100) y+=(y<70 ? 2000 : 1900);
  }
  else if(/^\d{5}(\.\d+)?$/.test(v)) return gesSerialAFecha(v, false);
  else return '';
  if(!(y>=1930 && y<=2100) || !(mo>=1 && mo<=12) || !(d>=1 && d<=31)) return '';
  var t=new Date(Date.UTC(y, mo-1, d)); if(t.getUTCMonth()!==mo-1) return '';
  return y+'-'+dos(mo)+'-'+dos(d);
}
/* ¿qué columna del archivo es cada dato? Por el título de la columna: gana el sinónimo más largo que calce entero */
function gesMapear(cab, campos){
  var H=(cab||[]).map(function(x){ return nrm(x); }), cand=[];
  campos.forEach(function(c){
    (c.sin||[]).forEach(function(s){
      var sn=nrm(s); if(!sn) return;
      H.forEach(function(h, i){
        if(!h) return;
        var p=0;
        if(h===sn) p=1000+sn.length;
        else if((' '+h+' ').indexOf(' '+sn+' ')>-1) p=100+sn.length-(h.length-sn.length)*0.01;
        if(p) cand.push({ k:c.k, i:i, p:p });
      });
    });
  });
  cand.sort(function(a, b){ return b.p-a.p; });
  var m={}, usada={};
  cand.forEach(function(x){ if(m[x.k]===undefined && !usada[x.i]){ m[x.k]=x.i; usada[x.i]=1; } });
  return m;
}
/* la fila de los títulos: la primera (de las 12 de arriba) donde dos o más celdas son títulos conocidos; o donde una
   sola celda es, tal cual, el título de un dato «llave» (una lista de una sola columna que dice «Nombre» arriba) */
function gesFilaTitulos(filas, campos, llaves){
  var mejor=-1, max=1;
  for(var i=0; i<Math.min(12, filas.length); i++){
    var n=Object.keys(gesMapear(filas[i], campos)).length;
    if(n>max){ max=n; mejor=i; }
  }
  if(mejor<0 && llaves && filas.length){
    var H=(filas[0]||[]).map(function(x){ return nrm(x); });
    var hay=campos.some(function(c){ return llaves.indexOf(c.k)>-1 && (c.sin||[]).some(function(s){ return H.indexOf(nrm(s))>-1; }); });
    if(hay && !H.some(function(x){ return /^\d{6,}$/.test(x.replace(/\s/g, '')); })) mejor=0;
  }
  return mejor;
}
function gesLetra(i){ var s=''; i++; while(i>0){ var m=(i-1)%26; s=String.fromCharCode(65+m)+s; i=Math.floor((i-1)/26); } return s; }
/* subir de a tandas, una tras otra; cada tanda con su escalera (si la base no tiene una columna nueva, sin ella) */
function gesSubirTandas(tabla, filas, escalera, alAvanzar, tam){
  tam=tam||40;
  var hechas=[], sinCols={}, i=0;
  function quitar(f, ks){ var c={}; for(var k in f) if(ks.indexOf(k)<0) c[k]=f[k]; return c; }
  function tanda(){
    if(i>=filas.length) return Promise.resolve({ filas:hechas, sinCols:Object.keys(sinCols) });
    var lote=filas.slice(i, i+tam);
    function prueba(n){
      var ks=escalera[n]||[];
      return sbPostP(tabla, ks.length ? lote.map(function(f){ return quitar(f, ks); }) : lote).then(function(rows){
        ks.forEach(function(k){ sinCols[k]=1; }); return rows;
      }, function(cod){
        if(cod===400 && n+1<escalera.length) return prueba(n+1);
        throw cod;
      });
    }
    return prueba(0).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'Esta cuenta no puede escribir en esta obra.', hechas:hechas });
      hechas=hechas.concat(Array.isArray(rows) ? rows : lote); i+=tam;
      if(alAvanzar) try{ alAvanzar(Math.min(i, filas.length), filas.length); }catch(e){}
      return tanda();
    }, function(e){ if(e && typeof e==='object'){ e.hechas=hechas; throw e; } throw { cod:e, hechas:hechas }; });
  }
  return tanda();
}

/* ══ 1 · PERSONAL: SUBIR LA LISTA ════════════════════════════════════════════════════════════
   Marcelo: «escribir 100 trabajadores para que estén en el sistema tomaría tiempo: tener la opción de que suban
   una relación». Entra el Excel de la obra tal como está (o lo copiado de él): se reconoce qué columna es cada
   dato, se muestra cómo va a quedar ANTES de guardar nada —quién es nuevo, quién ya estaba, a quién le falta
   algo— y se crean las mismas fichas que crea la app (sst_trabajador, con su «ext»). El tope de trabajadores del
   plan vale igual. El grupo sanguíneo no entra por lista: es un dato de salud y pide la autorización de cada uno. */
var GES_PER_CAMPOS = [
  { k:'nombre',   t:'Apellidos y nombres', req:1, sin:['apellidos y nombres', 'nombres y apellidos', 'apellidos nombres', 'nombre completo', 'nombre y apellido', 'apellido y nombre', 'nombre', 'trabajador', 'colaborador', 'personal', 'empleado', 'participante'] },
  { k:'ap1',      t:'Apellido paterno', sin:['apellido paterno', 'ap paterno', 'paterno', 'primer apellido', 'apellidos', 'apellido'] },
  { k:'ap2',      t:'Apellido materno', sin:['apellido materno', 'ap materno', 'materno', 'segundo apellido'] },
  { k:'nom',      t:'Nombres', sin:['nombres', 'nombre s', 'primer nombre', 'prenombres'] },
  { k:'dni',      t:'Documento (número)', sin:['numero de documento', 'nro de documento', 'n de documento', 'nro documento', 'num documento', 'numero documento', 'documento de identidad', 'doc identidad', 'documento', 'dni', 'cedula', 'ci', 'run', 'rut', 'curp', 'cuil', 'carnet de extranjeria', 'pasaporte', 'identificacion', 'nro doc', 'n doc', 'doc'] },
  { k:'td',       t:'Tipo de documento', sin:['tipo de documento', 'tipo documento', 'tipo doc', 'tipo de doc', 't doc'] },
  { k:'puesto',   t:'Puesto', sin:['puesto de trabajo', 'puesto', 'cargo', 'ocupacion', 'categoria', 'especialidad', 'oficio', 'funcion'] },
  { k:'area',     t:'Área o frente', sin:['area o frente', 'area de trabajo', 'area', 'frente', 'cuadrilla', 'seccion', 'departamento', 'gerencia'] },
  { k:'ubicacion',t:'Ubicación (sede o lugar)', sin:['ubicacion', 'sede', 'lugar de trabajo', 'lugar', 'local', 'campamento'] },
  { k:'contrata', t:'Empresa (si es de una contrata)', sin:['empresa contratista', 'razon social', 'contratista', 'subcontratista', 'subcontrata', 'contrata', 'empresa', 'empleador'] },
  { k:'ingreso',  t:'Fecha de ingreso', sin:['fecha de ingreso a obra', 'fecha de ingreso', 'fecha ingreso', 'f ingreso', 'ingreso', 'fecha de inicio', 'fecha inicio', 'inicio'] },
  { k:'emergencia', t:'Teléfono de emergencia', sin:['telefono de emergencia', 'telefono emergencia', 'celular de emergencia', 'tel emergencia', 'numero de emergencia', 'emergencia'] },
  { k:'emer_quien', t:'Contacto de emergencia', sin:['contacto de emergencia', 'contacto emergencia', 'familiar de contacto', 'persona de contacto', 'contacto', 'familiar'] }
];
var GES_PER_LLAVES = ['nombre', 'ap1', 'nom', 'dni'];
function gesPersonalSubir(){
  _gesCss();
  GES.per={ paso:'archivo', hojas:[], hoja:0, tit:-1, map:{}, filas:[], ind:'', sinDoc:false, ver:'todos', nombre:'', padron:null };
  /* a quién ya tiene la obra (con los cesados): contra eso se sabe quién es nuevo y cuánto cupo queda. Se pide aquí,
     porque a esta hoja también se llega desde «Cargar mi gestión», sin pasar por «Personal» */
  var P0=GES.per;
  traerTodo('sst_trabajador', '&select=id,nombre,dni,td,estatus&order=nombre.asc', 6000).then(function(l){
    if(GES.per!==P0) return; P0.padron=l||[]; if($('gp-res')){ _gpCalcular(); _gpPintarRes(); }
  }, function(){ if(GES.per===P0 && !P0.padron && Array.isArray(VISTA.cache.sst_trabajador)){ P0.padron=VISTA.cache.sst_trabajador; if($('gp-res')){ _gpCalcular(); _gpPintarRes(); } } });
  _gpPintarArchivo();
}
function _gpPintarArchivo(aviso){
  var P=GES.per, per=docPersonaP();
  var h=(aviso ? '<div class="aviso mal" id="gp-aviso" role="alert">'+esc(aviso)+'</div>' : '')+
    '<p style="margin:0 0 14px">Sube la relación de tu personal tal como la tienes: cada persona en una fila. Antes de guardar nada vas a ver cómo queda.</p>'+
    '<label class="ges-zona" id="gp-zona" tabindex="0"><span class="ges-ic" aria-hidden="true">⬆</span><b>Suelta aquí tu Excel o tócalo para elegirlo</b>'+
      '<span>Excel (.xlsx) o .csv · una fila por persona</span><input type="file" id="gp-file" accept=".xlsx,.xlsm,.csv,.txt,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"></label>'+
    '<div class="ges-o">o</div>'+
    '<div class="campo"><label for="gp-pega">Copia las filas de tu Excel y pégalas aquí</label>'+
      '<textarea id="gp-pega" rows="5" spellcheck="false" placeholder="Apellidos y nombres&#9;'+esc(per)+'&#9;Puesto&#10;Quispe Rojas, Ana&#9;…&#9;Operaria"></textarea></div>'+
    '<div class="acciones"><button type="button" class="bt sec" id="gp-leer">Leer lo pegado</button></div>'+
    '<div class="msg" id="gp-msg" role="status"></div>'+
    '<div class="seccion"><h3>Para que salga a la primera</h3><p class="ayuda" style="margin:0">Sirve el título que ya tenga cada columna («Apellidos y nombres», «'+esc(per)+'», «Cargo», «Área», «Fecha de ingreso»…). Si quieres empezar de cero, '+
      '<button type="button" class="bt-link" id="gp-plantilla">descarga la plantilla</button> y llénala.</p></div>';
  abrirHoja('Subir la lista de trabajadores', 'De tu Excel a OBRASST, sin escribirlos uno por uno', h, '<button type="button" class="bt sec" id="gp-no">Cancelar</button>', {ancha:true, sinFoco:true});
  $('gp-no').onclick=cerrarHoja;
  var z=$('gp-zona'), fi=$('gp-file'), m=$('gp-msg');
  function leyo(x, nombre){
    if(!x || !x.hojas || !x.hojas.length){ _gpPintarArchivo('Ese archivo no trae ninguna fila con datos.'); return; }
    P.hojas=x.hojas; P.nombre=nombre||''; P.hoja=_gpMejorHoja(x.hojas); _gpPrepararHoja(); _gpPintarRevisar();
  }
  function archivo(f){
    if(!f) return;
    m.className='msg gris'; m.textContent='Leyendo «'+f.name+'»…';
    gesLeerArchivo(f).then(function(x){ leyo(x, f.name); }, function(e){ _gpPintarArchivo(gesNoLeyo(e)); });
  }
  fi.onchange=function(){ archivo(fi.files && fi.files[0]); };
  ['dragenter', 'dragover'].forEach(function(ev){ z.addEventListener(ev, function(e){ e.preventDefault(); z.classList.add('sobre'); }); });
  ['dragleave', 'dragend'].forEach(function(ev){ z.addEventListener(ev, function(){ z.classList.remove('sobre'); }); });
  z.addEventListener('drop', function(e){ e.preventDefault(); z.classList.remove('sobre'); archivo(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });
  z.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); fi.click(); } });
  $('gp-leer').onclick=function(){
    var t=$('gp-pega').value;
    if(!gesTxt(t)){ m.className='msg mal'; m.textContent='Pega primero las filas copiadas de tu Excel.'; $('gp-pega').focus(); return; }
    var filas=gesLeerTexto(t, true);
    leyo({ hojas:filas.length ? [{ n:'', filas:filas }] : [] }, '');
  };
  $('gp-plantilla').onclick=function(){ _gpPlantilla(this); };
}
/* 09/10/2026 · desde otra parte (el SCTR, portal/sctr.js): la lista ya leída va directo a «cómo queda», con las mismas
   reglas que un Excel subido aquí (quién es nuevo, quién ya estaba, el tope del plan) */
function gesPersonalDesdeFilas(filas, nombre){
  gesPersonalSubir();
  (filas||[]).forEach(function(f, i){ if(f && f.r===undefined) f.r=i+1; });
  var P=GES.per; P.hojas=[{ n:nombre||'', filas:filas||[] }]; P.nombre=nombre||''; P.hoja=0;
  _gpPrepararHoja(); _gpPintarRevisar();
}
/* de varias hojas, la que más se parece a una lista de personas */
function _gpMejorHoja(hojas){
  var mejor=0, max=-1;
  hojas.forEach(function(h, i){
    var t=gesFilaTitulos(h.filas, GES_PER_CAMPOS, GES_PER_LLAVES), p=(t>-1 ? Object.keys(gesMapear(h.filas[t], GES_PER_CAMPOS)).length*1000 : 0)+Math.min(h.filas.length, 900);
    if(p>max){ max=p; mejor=i; }
  });
  return mejor;
}
function _gpPrepararHoja(){
  var P=GES.per, H=P.hojas[P.hoja]||{ filas:[] };
  P.tit=gesFilaTitulos(H.filas, GES_PER_CAMPOS, GES_PER_LLAVES);
  P.ncol=H.filas.reduce(function(n, f){ return Math.max(n, f.length); }, 0);
  if(P.tit>-1){
    P.map=gesMapear(H.filas[P.tit], GES_PER_CAMPOS);
    /* «Apellidos» + «Nombres» en dos columnas: la de «nombre» solo, si quedó puesta en la de los nombres de pila, sobra */
    if(P.map.ap1!==undefined && P.map.nom===undefined && P.map.nombre!==undefined && nrm(H.filas[P.tit][P.map.nombre])!=='apellidos y nombres'){ P.map.nom=P.map.nombre; delete P.map.nombre; }
    if(P.map.nombre!==undefined && (P.map.ap1!==undefined || P.map.nom!==undefined)){
      var tn=nrm(H.filas[P.tit][P.map.nombre]);
      if(tn==='nombre' || tn==='nombres'){ if(P.map.nom===undefined) P.map.nom=P.map.nombre; delete P.map.nombre; }
      else { delete P.map.ap1; delete P.map.ap2; delete P.map.nom; }
    }
  } else P.map=_gpAdivinar(H.filas, P.ncol);
}
/* sin títulos: por lo que hay adentro (el documento son números; el nombre, dos o más palabras) */
function _gpAdivinar(filas, ncol){
  var m={}, n=Math.min(filas.length, 40), mejorN=-1, pN=0, mejorD=-1, pD=0;
  for(var c=0; c<ncol; c++){
    var nom=0, doc=0;
    for(var i=0; i<n; i++){
      var v=String(filas[i][c]||'');
      if(/^[\d.\-\s]{6,14}[\dkK]?$/.test(v) && v.replace(/\D/g, '').length>=6) doc++;
      else if(/^[^\d@]{6,}$/.test(v) && v.split(/[\s,]+/).filter(Boolean).length>=2) nom++;
    }
    if(nom>pN){ pN=nom; mejorN=c; }
    if(doc>pD){ pD=doc; mejorD=c; }
  }
  if(mejorN>-1 && pN>=n*0.5) m.nombre=mejorN;
  if(mejorD>-1 && pD>=n*0.5) m.dni=mejorD;
  return m;
}
/* el tipo de documento escrito como sea → uno de los del país de la obra */
function _gpTipo(txt, tipos){
  var t=nrm(txt).replace(/\s+/g, ''); if(!t) return '';
  for(var i=0;i<tipos.length;i++){ if(nrm(tipos[i][0]).replace(/\s+/g, '')===t || nrm(tipos[i][1]).replace(/\s+/g, '')===t) return tipos[i][0]; }
  if(/^(ce|cex|carne(t)?deextranjeria|carne(t)?extranjeria)$/.test(t)) return tipos.some(function(x){ return x[0]==='CE'; }) ? 'CE' : '';
  if(/^(pas|pasaporte|passport)$/.test(t)) return tipos.some(function(x){ return x[0]==='Pasaporte'; }) ? 'Pasaporte' : '';
  if(/^(ci|cedula|cedula deidentidad|ceduladeidentidad|cc|ceduladeciudadania)$/.test(t)){ var c=tipos.filter(function(x){ return /c[eé]dula|^CC$/i.test(x[0]); })[0]; return c ? c[0] : ''; }
  return '';
}
/* las filas del archivo → personas, cada una con su estado: nueva · ya está · repetida · por revisar · sin nombre */
function _gpCalcular(){
  var P=GES.per, H=P.hojas[P.hoja]||{ filas:[] }, M=P.map, pais=paisObraP();
  var tipos=[]; try{ tipos=(docPais(pais).tipos||[]).slice(); }catch(e){ tipos=[['DNI', 'DNI']]; }
  var tdDef=tipos[0][0], hoy=hoyISO();
  var porDoc={}, porNom={};
  (P.padron||VISTA.cache.sst_trabajador||[]).forEach(function(t){
    var d=String(t.dni||'').trim(); if(d) porDoc[(t.td||tdDef)+'|'+d.toUpperCase()]=t;
    var n=nrm(t.nombre).split(' ').filter(Boolean).sort().join(' '); if(n) porNom[n]=t;
  });
  var vistos={}, vistosN={}, out=[];
  var v=function(f, k){ return (M[k]===undefined || M[k]<0) ? '' : gesTxt(f[M[k]]); };
  H.filas.forEach(function(f, i){
    if(i<=P.tit) return;
    var o={ fila:f.r||(i+1), est:'nueva', notas:[] };
    var nombre=v(f, 'nombre');
    if(!nombre){
      var ap=[v(f, 'ap1'), v(f, 'ap2')].filter(Boolean).join(' '), no=v(f, 'nom');
      nombre=(ap && no) ? ap+', '+no : (ap || no);
    }
    o.nombre=nombre.replace(/\s+,/g, ',').slice(0, 120);
    var crudo=v(f, 'dni'), td=_gpTipo(v(f, 'td'), tipos) || tdDef;
    var dni=crudo ? ((typeof docPersonaNorm==='function') ? docPersonaNorm(td, crudo) : crudo.replace(/\s/g, '')) : '';
    /* Excel se come los ceros de adelante de un DNI: 01234567 llega como 1234567 */
    if(td==='DNI' && pais==='pe' && /^\d{6,7}$/.test(dni) && /^\d+$/.test(crudo.replace(/[\s.]/g, ''))){ dni=('00000000'+dni).slice(-8); o.notas.push('se completó con ceros adelante'); }
    var docMal=!!dni && ((td==='DNI' && pais==='pe') ? !/^\d{8}$/.test(dni) : dni.length<5);
    o.td=td; o.dni=dni.slice(0, 20); o.docMal=docMal; o.docCrudo=crudo;
    o.puesto=v(f, 'puesto').slice(0, 80); o.area=v(f, 'area').slice(0, 80); o.ubicacion=v(f, 'ubicacion').slice(0, 80);
    o.contrata=v(f, 'contrata').slice(0, 120); o.emergencia=v(f, 'emergencia').slice(0, 40); o.emer_quien=v(f, 'emer_quien').slice(0, 60);
    var ing=v(f, 'ingreso'), fi=ing ? gesFecha(ing) : '';
    if(ing && (!fi || fi>hoy || fi<'1960-01-01')){ o.notas.push('la fecha de ingreso «'+ing+'» no se entiende: entra sin fecha'); fi=''; }
    o.ingreso=fi;
    /* una fila que es un subtítulo o un total (sin nombre de persona) no es nadie */
    if(o.nombre.length<3 || !/[a-záéíóúñ]/i.test(o.nombre)){ o.est=(dni.length>=6 && !docMal) ? 'sin_nombre' : 'vacia'; out.push(o); return; }
    var kn=nrm(o.nombre).split(' ').filter(Boolean).sort().join(' '), kd=(dni && !docMal) ? td+'|'+dni.toUpperCase() : '';
    var ya=(kd && porDoc[kd]) || null, yaN=porNom[kn];
    /* el mismo nombre: es la misma persona si aquí no viene documento, o si la ficha de allá no lo tiene */
    if(!ya && yaN && (!dni || docMal || !String(yaN.dni||'').trim())) ya=yaN;
    if(ya){ o.est='ya'; o.ya=ya; }
    else if((kd && vistos[kd]) || (!kd && vistosN[kn])){ o.est='repetida'; }
    else if(docMal){ o.est='revisar'; }
    if(o.est==='nueva' || o.est==='revisar'){ if(kd) vistos[kd]=1; vistosN[kn]=1; }
    out.push(o);
  });
  P.filas=out.filter(function(o){ return o.est!=='vacia'; });
  return P.filas;
}
function _gpCupo(){
  var tope=topeTrabP(), activos=((GES.per && GES.per.padron)||VISTA.cache.sst_trabajador||[]).filter(function(t){ return String(t.estatus||'activo')!=='cesado'; }).length;
  return { tope:tope, activos:activos, libres:(tope===Infinity ? Infinity : Math.max(0, tope-activos)) };
}
var GP_EST = { nueva:['ok', 'Nueva'], ya:['gris', 'Ya está'], repetida:['gris', 'Repetida en la lista'], revisar:['ojo', 'Documento por revisar'], sin_nombre:['mal', 'Sin nombre'] };
function _gpEntran(){
  var P=GES.per;
  return P.filas.filter(function(o){ return o.est==='nueva' || (o.est==='revisar' && P.sinDoc); });
}
function _gpPintarRevisar(){
  var P=GES.per, H=P.hojas[P.hoja]||{ filas:[] };
  var tits=(P.tit>-1) ? H.filas[P.tit] : [];
  _gpCalcular();
  var op='<option value="-1">— no está en mi lista —</option>';
  for(var c=0; c<P.ncol; c++){
    var ej=''; for(var i=P.tit+1; i<H.filas.length && !ej; i++) ej=gesTxt(H.filas[i][c]);
    op+='<option value="'+c+'">'+esc(gesLetra(c)+' · '+(gesTxt(tits[c]) || (ej ? 'ej.: '+ej.slice(0, 28) : 'vacía')))+'</option>';
  }
  var conApe=(P.map.ap1!==undefined || P.map.ap2!==undefined || P.map.nom!==undefined);
  var campos=GES_PER_CAMPOS.filter(function(c){ return conApe ? c.k!=='nombre' : (c.k!=='ap1' && c.k!=='ap2' && c.k!=='nom'); });
  var h='';
  if(P.hojas.length>1) h+='<div class="campo"><label for="gp-hoja">Tu archivo tiene '+P.hojas.length+' hojas. ¿En cuál está la lista?</label><select id="gp-hoja">'+
    P.hojas.map(function(x, i){ return '<option value="'+i+'"'+(i===P.hoja?' selected':'')+'>'+esc((x.n||'Hoja '+(i+1))+' · '+gesPlural(x.filas.length, 'fila', 'filas'))+'</option>'; }).join('')+'</select></div>';
  h+='<div class="seccion" style="margin-top:0"><h3>Qué columna es cada dato</h3>'+
     '<p class="ayuda" style="margin:0 0 10px">'+(P.tit>-1 ? 'Se reconocieron por su título (fila '+(H.filas[P.tit].r||(P.tit+1))+' de tu lista). Cambia la que no esté bien.' : 'Tu lista no trae títulos: revisa que cada dato apunte a su columna.')+'</p>'+
     '<div class="ges-map" id="gp-map">'+campos.map(function(c){
       var val=(P.map[c.k]===undefined ? -1 : P.map[c.k]);
       return '<div class="campo'+(val<0?' vacia':'')+'"><label for="gp-m-'+c.k+'">'+esc(c.k==='dni' ? 'Documento ('+docPersonaP()+' u otro)' : c.t)+(c.req || (conApe && (c.k==='ap1' || c.k==='nom')) ? ' <b>*</b>' : '')+'</label><select id="gp-m-'+c.k+'" data-k="'+c.k+'">'+op.replace('value="'+val+'"', 'value="'+val+'" selected')+'</select></div>';
     }).join('')+'</div>'+
     '<p class="ayuda"><button type="button" class="bt-link" id="gp-ape">'+(conApe ? 'El nombre completo viene en una sola columna' : 'Los apellidos y los nombres vienen en columnas separadas')+'</button></p></div>'+
     '<div id="gp-res"></div>';
  abrirHoja('Subir la lista de trabajadores', (P.nombre ? '«'+P.nombre+'» · ' : '')+'revisa cómo queda antes de guardar', h,
    '<button type="button" class="bt sec" id="gp-otro">Elegir otro archivo</button><button type="button" class="bt" id="gp-ok">Subir</button>', {ancha:true, sinFoco:true});
  if($('gp-hoja')) $('gp-hoja').onchange=function(){ P.hoja=+this.value; _gpPrepararHoja(); _gpPintarRevisar(); };
  Array.prototype.forEach.call(document.querySelectorAll('#gp-map select'), function(s){
    s.onchange=function(){
      var k=s.getAttribute('data-k'), val=+s.value;
      if(val<0) delete P.map[k];
      else { Object.keys(P.map).forEach(function(o){ if(o!==k && P.map[o]===val) delete P.map[o]; }); P.map[k]=val; }
      _gpPintarRevisar();
    };
  });
  $('gp-ape').onclick=function(){
    if(conApe){ if(P.map.nombre===undefined && P.map.ap1!==undefined) P.map.nombre=P.map.ap1; delete P.map.ap1; delete P.map.ap2; delete P.map.nom; }
    else { if(P.map.nombre!==undefined){ P.map.ap1=P.map.nombre; delete P.map.nombre; } else P.map.ap1=-1; }
    _gpPintarRevisar();
  };
  $('gp-otro').onclick=function(){ GES.per.paso='archivo'; _gpPintarArchivo(); };
  $('gp-ok').onclick=_gpSubir;
  _gpPintarRes();
}
function _gpPintarRes(){
  var P=GES.per, c=$('gp-res'); if(!c) return;
  var L=P.filas, n={ nueva:0, ya:0, repetida:0, revisar:0, sin_nombre:0 };
  L.forEach(function(o){ n[o.est]=(n[o.est]||0)+1; });
  var entran=_gpEntran(), cupo=_gpCupo(), pasa=(cupo.libres!==Infinity && entran.length>cupo.libres);
  var hayNombre=(P.map.nombre!==undefined && P.map.nombre>=0) || (P.map.ap1!==undefined && P.map.ap1>=0) || (P.map.nom!==undefined && P.map.nom>=0);
  var bt=$('gp-ok');
  if(!P.padron && !Array.isArray(VISTA.cache.sst_trabajador)){
    c.innerHTML='<div class="vacio" id="gp-espera">Revisando a quién ya tienes en tu personal…</div>';
    if(bt){ bt.disabled=true; bt.textContent='Subir'; } return;
  }
  if(!hayNombre){
    c.innerHTML='<div class="aviso ojo"><b>Falta decir en qué columna está el nombre.</b> Elígela arriba, en «Apellidos y nombres».</div>';
    if(bt){ bt.disabled=true; bt.textContent='Subir'; } return;
  }
  var chips=[['todos', 'Todas', L.length], ['nueva', 'Nuevas', n.nueva], ['ya', 'Ya estaban', n.ya+n.repetida], ['revisar', 'Por revisar', n.revisar+n.sin_nombre]];
  var ver=P.ver, lista=L.filter(function(o){ return ver==='todos' || (ver==='nueva' && o.est==='nueva') || (ver==='ya' && (o.est==='ya' || o.est==='repetida')) || (ver==='revisar' && (o.est==='revisar' || o.est==='sin_nombre')); });
  var h='<div class="seccion"><h3>Así queda</h3>';
  if(!L.length) h+='<div class="aviso ojo">No se encontró ninguna persona en esa hoja. Revisa las columnas de arriba'+(P.hojas.length>1 ? ' o elige otra hoja' : '')+'.</div>';
  else {
    h+='<div class="ges-cuenta chips" id="gp-chips">'+chips.filter(function(x, i){ return i===0 || x[2]; }).map(function(x){
        return '<button type="button" class="chip'+(ver===x[0]?' on':'')+'" data-v="'+x[0]+'" aria-pressed="'+(ver===x[0]?'true':'false')+'">'+esc(x[1])+' <i>'+x[2]+'</i></button>'; }).join('')+'</div>';
    h+='<div class="ges-prev"><table><thead><tr><th>Fila</th><th>Estado</th><th>Apellidos y nombres</th><th>Documento</th><th>Puesto</th><th>Área</th><th>Otros datos</th></tr></thead><tbody>'+
      lista.slice(0, 300).map(function(o){
        var E=GP_EST[o.est]||GP_EST.nueva, entra=(o.est==='nueva' || (o.est==='revisar' && P.sinDoc));
        var otros=[o.ubicacion ? '📍 '+o.ubicacion : '', o.contrata, o.ingreso ? 'ingresó el '+fechaLarga(o.ingreso) : '', o.emergencia ? 'emergencia: '+o.emergencia+(o.emer_quien ? ' ('+o.emer_quien+')' : '') : ''].filter(Boolean).join(' · ');
        var det=o.est==='ya' ? 'Ya está en tu personal'+(o.ya && String(o.ya.estatus||'')==='cesado' ? ', como cesado' : '')+': no se toca.' :
                o.est==='repetida' ? 'Está más arriba en esta misma lista.' :
                o.est==='revisar' ? (o.td==='DNI' && paisObraP()==='pe' ? 'El DNI son 8 números' : 'El número del documento es muy corto')+(P.sinDoc ? ': entra sin documento.' : ': no entra.') :
                o.est==='sin_nombre' ? 'No tiene nombre: no entra.' : '';
        return '<tr class="'+(entra?'':'no')+'"><td class="n">'+o.fila+'</td><td><span class="pill '+E[0]+'">'+esc(E[1])+'</span>'+(det ? '<small>'+esc(det)+'</small>' : '')+'</td>'+
          '<td><b>'+esc(o.nombre||'—')+'</b></td><td>'+(o.dni ? '<span class="mono" data-sin-pais>'+esc(o.td+' '+o.dni)+'</span>' : '<span class="tenue">sin documento</span>')+
          (o.notas.length ? '<small>'+esc(o.notas.join(' · '))+'</small>' : '')+'</td><td>'+esc(o.puesto)+'</td><td>'+esc(o.area)+'</td><td>'+esc(otros)+'</td></tr>';
      }).join('')+'</tbody></table></div>'+(lista.length>300 ? '<p class="ayuda">Se muestran las primeras 300 de '+lista.length+'.</p>' : '');
  }
  h+='</div>';
  if(n.revisar) h+='<label class="chk" style="margin-top:12px"><input type="checkbox" id="gp-sindoc"'+(P.sinDoc?' checked':'')+'> <span>Subir también '+(n.revisar===1 ? 'a la persona' : 'a las '+n.revisar+' personas')+' con el documento por revisar <small class="tenue">· '+(n.revisar===1?'entra':'entran')+' sin documento y lo completas después en su ficha</small></span></label>';
  if(entran.length) h+='<div class="seccion"><h3>¿Esta gente es nueva en la obra?</h3><div class="ges-radio chips" id="gp-ind" role="radiogroup">'+
    [['', 'Hay de los dos'], ['antes', 'No: ya trabajaban aquí'], ['nuevo', 'Sí: son nuevos']].map(function(x){
      return '<button type="button" role="radio" class="chip'+(P.ind===x[0]?' on':'')+'" aria-checked="'+(P.ind===x[0]?'true':'false')+'" data-v="'+x[0]+'">'+esc(x[1])+'</button>'; }).join('')+'</div>'+
    '<p class="ayuda" id="gp-ind-t">'+esc(_gpIndTxt())+'</p></div>';
  if(pasa) h+='<div class="aviso ojo" id="gp-tope"><b>Pasa el tope de tu plan.</b> Tu obra tiene '+cupo.activos+' trabajadores activos y el plan '+esc(ESP_PLAN[(YO.obra||{}).plan]||'actual')+' llega a '+cupo.tope+': de '+
    (entran.length===1 ? 'la persona nueva' : 'las '+entran.length+' nuevas')+' '+(cupo.libres ? 'solo caben '+cupo.libres : 'no cabe ninguna')+'. '+
    '<div class="acciones">'+(cupo.libres ? '<button type="button" class="bt sec chico" id="gp-caben">Subir '+(cupo.libres===1 ? 'solo la primera' : 'solo las primeras '+cupo.libres)+'</button>' : '')+
    '<button type="button" class="bt sec chico" id="gp-plan">'+(planwPuedePagar() ? 'Ver los planes' : 'Ver mi plan')+'</button></div></div>';
  h+='<div class="msg" id="gp-msg" role="status"></div>';
  c.innerHTML=h;
  if(bt){ bt.disabled=!entran.length || pasa; bt.textContent=entran.length ? 'Subir '+gesPlural(entran.length, 'trabajador', 'trabajadores') : 'Nada nuevo que subir'; }
  if($('gp-chips')) $('gp-chips').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; P.ver=b.getAttribute('data-v'); _gpPintarRes(); };
  if($('gp-sindoc')) $('gp-sindoc').onchange=function(){ P.sinDoc=this.checked; _gpPintarRes(); };
  if($('gp-ind')) $('gp-ind').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; P.ind=b.getAttribute('data-v'); _gpPintarRes(); };
  if($('gp-caben')) $('gp-caben').onclick=function(){ _gpSubir(cupo.libres); };
  if($('gp-plan')) $('gp-plan').onclick=function(){ cerrarHoja(); navegar('plan'); };
}
function _gpIndTxt(){
  var i=GES.per.ind;
  if(i==='antes') return 'Quedan como personal de antes: no se les pide la inducción en la app.';
  if(i==='nuevo') return 'Quedan como nuevos: cuando entren a la app les sale su inducción, tema por tema.';
  return 'No se marca nada: lo decides en la ficha de cada uno, como cuando lo agregas a mano.';
}
function _gpSubir(cuantos){
  var P=GES.per, entran=_gpEntran(), cupo=_gpCupo();
  if(typeof cuantos==='number') entran=entran.slice(0, cuantos);
  else if(cupo.libres!==Infinity && entran.length>cupo.libres) return;
  if(!entran.length) return;
  var base=Date.now().toString(36);
  var filas=entran.map(function(o, i){
    var f={ duenio:YO.obra.id, ext:'t'+base+i.toString(36)+Math.random().toString(36).slice(2, 5), nombre:o.nombre, dni:(o.est==='revisar' ? null : (o.dni||null)),
            puesto:o.puesto||null, area:o.area||null, estatus:'activo', emergencia:o.emergencia||null, emer_quien:o.emer_quien||null, almacenero:false, contrata:o.contrata||null };
    if(f.dni && o.td) f.td=o.td;
    if(o.ingreso) f.ingreso=o.ingreso;
    if(o.ubicacion) f.ubicacion=o.ubicacion;
    if(P.ind==='antes') f.ind_previa=true; else if(P.ind==='nuevo') f.ind_previa=false;
    return f;
  });
  var bt=$('gp-ok'), m=$('gp-msg'), otro=$('gp-otro');
  if(bt) bt.disabled=true; if(otro) otro.disabled=true;
  Array.prototype.forEach.call(document.querySelectorAll('#gp-map select, #gp-res button, #gp-res input, #gp-hoja'), function(x){ x.disabled=true; });
  if(m){ m.className='msg gris'; m.innerHTML='Subiendo… <span id="gp-av-t">0 de '+filas.length+'</span><div class="ges-avance"><i id="gp-av" style="width:0"></i></div>'; }
  /* de la columna más nueva a la más vieja: si la base no la tiene (400), la tanda va sin ella */
  var esc4=[[], ['ind_previa'], ['ind_previa', 'ubicacion'], ['ind_previa', 'ubicacion', 'ingreso'], ['ind_previa', 'ubicacion', 'ingreso', 'td', 'emergencia', 'emer_quien', 'almacenero', 'contrata']];
  gesSubirTandas('sst_trabajador', filas, esc4, function(n, de){ var a=$('gp-av'), t=$('gp-av-t'); if(a) a.style.width=Math.round(n/de*100)+'%'; if(t) t.textContent=n+' de '+de; })
    .then(function(r){ _gpListo(r.filas.length, filas.length, r.sinCols, null); },
          function(e){ _gpListo((e && e.hechas ? e.hechas.length : 0), filas.length, [], e); });
}
function _gpListo(n, de, sinCols, err){
  var P=GES.per, L=P.filas, fuera=L.filter(function(o){ return o.est==='revisar' && !P.sinDoc; }), sinN=L.filter(function(o){ return o.est==='sin_nombre'; }),
      ya=L.filter(function(o){ return o.est==='ya' || o.est==='repetida'; }), sinDoc=P.sinDoc ? L.filter(function(o){ return o.est==='revisar'; }) : [];
  var h='';
  if(n) h+='<div class="aviso ok" id="gp-hecho"><b>'+(n===1 ? 'Se agregó 1 trabajador.' : 'Se agregaron '+n+' trabajadores.')+'</b> Ya están en «Personal», y la app de la obra los recibe al sincronizar. El QR para el casco de cada uno sale desde su ficha en el celular.</div>';
  if(err) h+='<div class="aviso mal" id="gp-fallo"><b>'+(n ? 'Faltaron '+(de-n)+' por subir.' : 'No se pudo subir la lista.')+'</b> '+esc(porQueFallo(err && err.cod!==undefined ? err.cod : err))+(n ? ' Vuelve a subir el mismo archivo: los que ya entraron se reconocen y no se repiten.' : '')+'</div>';
  if(sinCols && sinCols.length) h+='<div class="aviso ojo">Entraron con lo esencial: falta un paso en el servidor para guardar '+esc(sinCols.map(function(k){ return {ind_previa:'si son nuevos', ubicacion:'la ubicación', ingreso:'la fecha de ingreso', td:'el tipo de documento', emergencia:'el contacto de emergencia', contrata:'la empresa'}[k]||''; }).filter(Boolean).join(', '))+'.</div>';
  function lista(tit, l, f){ return l.length ? '<div class="seccion"><h3>'+esc(tit)+' · '+l.length+'</h3><ul class="ges-lista-chica">'+l.slice(0, 40).map(function(o){ return '<li>'+esc(o.nombre||'Fila '+o.fila+' de tu lista')+' <small>'+esc(f(o))+'</small></li>'; }).join('')+(l.length>40 ? '<li><small>y '+(l.length-40)+' más</small></li>' : '')+'</ul></div>' : ''; }
  h+=lista('Entraron sin documento: complétalo en su ficha', sinDoc, function(o){ return '· en tu lista decía «'+o.docCrudo+'»'; });
  h+=lista('No entraron: documento por revisar', fuera, function(o){ return '· fila '+o.fila+' · «'+o.docCrudo+'»'; });
  h+=lista('No entraron: sin nombre', sinN, function(o){ return (o.dni ? '· '+o.td+' '+o.dni : ''); });
  h+=lista('Ya estaban o venían repetidos (no se tocaron)', ya, function(o){ return o.dni ? '· '+o.td+' '+o.dni : ''; });
  abrirHoja('Subir la lista de trabajadores', n ? 'Listo' : 'No se subió', h, (err ? '<button type="button" class="bt sec" id="gp-otra">Volver a intentarlo</button>' : '')+'<button type="button" class="bt" id="gp-fin">Ver mi personal</button>', {ancha:true, sinFoco:true});
  $('gp-fin').onclick=function(){ cerrarHoja(); };
  if($('gp-otra')) $('gp-otra').onclick=function(){ GES.per.paso='archivo'; _gpPintarArchivo(); };
  if(n){ toast(n===1 ? '1 trabajador agregado' : n+' trabajadores agregados'); if(typeof GESG==='object') GESG.lista=null; if(typeof VISTA.recargar==='function') VISTA.recargar(true); }
}
/* la plantilla: un Excel con los títulos y dos filas de ejemplo (personas inventadas) */
function _gpPlantilla(bt){
  if(bt) bt.disabled=true;
  cargarEvPDF().then(function(){
    var X=RCAP.xlsx, E=new X.Estilos(), C=X.C, per=docPersonaP();
    var sCab=E.xf({ b:1, sz:10, c:C.blanco, f:C.petroleo, h:'left', borde:true }), sTx=E.xf({ sz:10, c:C.tinta, borde:true }), sAy=E.xf({ sz:9, c:C.gris });
    var hoja=new X.Hoja('Personal'); hoja.activa=true; hoja.pie='Lista de personal';
    var cols=['Apellidos y nombres', 'Tipo de documento', 'Documento', 'Puesto', 'Área', 'Ubicación', 'Empresa', 'Fecha de ingreso', 'Teléfono de emergencia', 'Contacto de emergencia'];
    var tipos=[]; try{ tipos=docPais(paisObraP()).tipos||[]; }catch(e){}
    var ph=''; try{ ph=docPais(paisObraP()).perPh||''; }catch(e2){}
    cols.forEach(function(c, i){ hoja.celda(i, 1, c, sCab); });
    [34, 16, 16, 22, 18, 18, 24, 16, 20, 24].forEach(function(w, i){ hoja.anchos[i]=w; });
    hoja.congelar={ c:0, r:1 };
    /* la guía va en su propia hoja: en «Personal» solo los títulos, para que nada de la guía entre como persona */
    var guia=new X.Hoja('Cómo llenarla'); guia.pie='Lista de personal';
    var sT=E.xf({ b:1, sz:13, c:C.petroleo }), sB=E.xf({ b:1, sz:10, c:C.tinta, borde:true }), sW=E.xf({ sz:10, c:C.tinta, borde:true, wrap:1 });
    guia.celda(0, 1, 'Cómo llenar la hoja «Personal»', sT); guia.altos[1]=22;
    guia.celda(0, 2, 'Una persona por fila, desde la fila 2. Solo el nombre es obligatorio; lo que no tengas, déjalo vacío.', sAy);
    var G=[['Apellidos y nombres', 'Obligatorio. Como figura en su documento.', 'Quispe Rojas, Ana María'],
           ['Tipo de documento', 'Si lo dejas vacío, se toma '+per+'.'+(tipos.length>1 ? ' Los que hay: '+tipos.map(function(t){ return t[0]; }).join(', ')+'.' : ''), per],
           ['Documento', 'El número, sin puntos ni espacios.', ph],
           ['Puesto', 'Su puesto de trabajo.', 'Operaria'],
           ['Área', 'El área o el frente donde trabaja.', 'Estructuras'],
           ['Ubicación', 'La sede o el lugar, si tu obra tiene varios.', 'Torre A'],
           ['Empresa', 'Solo si es de una contrata. Vacío si es de tu empresa.', 'Servicios Ejemplo S.A.C.'],
           ['Fecha de ingreso', 'Día/mes/año.', '03/02/2026'],
           ['Teléfono de emergencia', 'A qué número llamar si le pasa algo.', ''],
           ['Contacto de emergencia', 'De quién es ese número.', '']];
    guia.celda(0, 4, 'Columna', sCab); guia.celda(1, 4, 'Qué va', sCab); guia.celda(2, 4, 'Ejemplo', sCab);
    G.forEach(function(g, i){ guia.celda(0, 5+i, g[0], sB); guia.celda(1, 5+i, g[1], sW); guia.celda(2, 5+i, g[2], sW); });
    guia.anchos[0]=26; guia.anchos[1]=62; guia.anchos[2]=28;
    bajarBlob(X.libro([hoja, guia], E, 'Lista de personal'), 'OBRASST - lista de personal.xlsx');
    if(bt) bt.disabled=false;
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar la plantilla. Revisa tu conexión.'); });
}

/* ══ 2 · HORAS HOMBRE (HHT y HHC) ═════════════════════════════════════════════════════════════
   Marcelo: «agregar la opción de colocar horas hombre trabajadas y capacitadas en la web, igual que en la app,
   con los mismos parámetros (considerando que se puedan colocar las pasadas también)».
   Los parámetros son los del «Reporte semanal» de la app, día por día: cuántos obreros y cuántos empleados hubo,
   su hora de entrada y de salida y el refrigerio que se descuenta (de ahí salen las horas por persona), y la
   capacitación del día (asistentes × minutos). Se guarda donde guarda la app —sst_hht, un día = una fila— y con
   su misma cuenta: HHT = obreros × horas + empleados × horas. La app baja estos días al sincronizar.
   Para lo de antes de usar OBRASST: «Llenar varios días» (el mismo horario, de tal día a tal día) o el total
   del mes repartido en sus días de trabajo. El índice de accidentabilidad los cuenta igual que a los demás. */
var HHW = { ym:'', filas:null, por:{}, nivel:0, obra:null, n:0, caja:null, activos:null, alAbrir:null };
var HH_SELS = ['id,fecha,ob_n,ob_h,st_n,st_h,hhc,creado,lugar,ob_entrada,ob_salida,st_entrada,st_salida', 'id,fecha,ob_n,ob_h,st_n,st_h,hhc,creado'];
var HH_EXTRAS = ['lugar', 'ob_entrada', 'ob_salida', 'st_entrada', 'st_salida'];
var HH_DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function gesNum(x, dec){ var n=Number(x)||0, k=Math.pow(10, dec==null ? 2 : dec); return (Math.round(n*k)/k).toLocaleString('es-PE', {maximumFractionDigits:(dec==null ? 2 : dec)}); }
function gesRed(x, dec){ var k=Math.pow(10, dec==null ? 2 : dec); return Math.round((Number(x)||0)*k)/k; }
function _hhMin(h){ var t=String(h||'').split(':'); if(t.length<2) return null; var a=parseInt(t[0], 10), b=parseInt(t[1], 10); return (isNaN(a) || isNaN(b)) ? null : a*60+b; }
/* las horas de jornada por persona, como horasDeJornada de la app: la salida menor que la entrada es el turno de
   noche (cruza la medianoche) y el refrigerio se descuenta a la vista */
function hhHoras(entrada, salida, refri){
  var e=_hhMin(entrada), x=_hhMin(salida); if(e===null || x===null) return null;
  var d=x-e; if(d<0) d+=24*60;
  d-=(parseInt(refri, 10)||0); if(d<0) d=0;
  return Math.round(d/60*100)/100;
}
function hhDe(r){
  var ob=(parseFloat(r.ob_n)||0)*(parseFloat(r.ob_h)||0), st=(parseFloat(r.st_n)||0)*(parseFloat(r.st_h)||0);
  return { ob:ob, st:st, hht:ob+st, hhc:parseFloat(r.hhc)||0 };
}
function hhSumar(filas){
  var o={ ob:0, st:0, hht:0, hhc:0, dias:0, obN:0, stN:0 };
  (filas||[]).forEach(function(r){ var x=hhDe(r); o.ob+=x.ob; o.st+=x.st; o.hht+=x.hht; o.hhc+=x.hhc; o.dias++; o.obN+=parseFloat(r.ob_n)||0; o.stN+=parseFloat(r.st_n)||0; });
  return o;
}
function _hhTraer(){
  function prueba(i){
    return traerTodo('sst_hht', '&select='+HH_SELS[i]+'&order=fecha.desc,creado.desc', 8000).then(function(r){ HHW.nivel=i; return r||[]; }, function(c){
      if(c===400 && i+1<HH_SELS.length) return prueba(i+1);
      throw c;
    });
  }
  return prueba(HHW.nivel||0).then(function(rows){
    /* un día = una fila: si hubiera dos del mismo día, vale la más nueva */
    var por={}, lista=[];
    rows.forEach(function(r){ var f=String(r.fecha||'').slice(0,10); if(!/^\d{4}-\d{2}-\d{2}$/.test(f) || por[f]) return; r.fecha=f; por[f]=r; lista.push(r); });
    HHW.filas=lista; HHW.por=por; return lista;
  });
}
function _hhMesFilas(ym){ return (HHW.filas||[]).filter(function(r){ return r.fecha.slice(0,7)===ym; }); }
function _hhCss(){
  if($('hh-css')) return;
  var st=document.createElement('style'); st.id='hh-css';
  st.textContent=[
    '.hh-cal .cal-d{min-height:86px;gap:2px}.hh-cal .cal-d.fut{cursor:default;background:#FAFBFC;color:var(--gris2)}.hh-cal .cal-d.fut:hover{background:#FAFBFC}',
    '.hh-cal .cal-d.dom .cal-n{color:var(--gris2)}',
    '.hh-v{font-size:15px;font-weight:600;color:var(--tinta);font-variant-numeric:tabular-nums;line-height:1.2}.hh-v small{font-size:11px;font-weight:500;color:var(--gris);margin-left:3px}',
    '.hh-s{font-size:11.5px;color:var(--gris);line-height:1.35;font-variant-numeric:tabular-nums}',
    '.hh-c{font-size:11.5px;color:var(--azul);font-variant-numeric:tabular-nums}',
    '.hh-falta{font-size:11.5px;color:var(--gris2)}',
    '.hh-bloque{border:1px solid var(--raya);border-radius:12px;padding:14px 14px 4px;margin:0 0 14px;background:var(--panel)}',
    '.hh-bloque h3{font-size:14px;margin:0 0 10px;display:flex;align-items:center;gap:8px}',
    /* tres por fila: la hora, en el Perú, se escribe «07:00 a. m.» y en cuatro columnas no entraba */
    '.hh-fila{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 10px;align-items:end}.hh-fila .campo input{width:100%;min-width:0}',
    '.hh-res{font-size:13px;color:var(--gris);margin:-4px 0 12px;min-height:20px;line-height:1.5}.hh-res b{color:var(--tinta);font-variant-numeric:tabular-nums}',
    '.hh-rap{display:flex;flex-wrap:wrap;gap:6px;margin:-6px 0 12px}.hh-rap .chip{padding:4px 9px;font-size:12px}',
    '.hh-total{position:sticky;bottom:-24px;margin:6px -22px -24px;padding:12px 22px;background:var(--azul-f);border-top:1px solid #CFDDF0;font-size:14px}.hh-total b{color:var(--tinta);font-variant-numeric:tabular-nums}',
    '.hh-dias{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 4px}',
    '.hh-anio td.num,.hh-anio th.num{text-align:right;font-variant-numeric:tabular-nums}.hh-anio tr.sel td{background:var(--azul-f)}.hh-anio tr.tot td{font-weight:600;color:var(--tinta);border-top:2px solid var(--raya2)}.hh-anio tr.vac td{color:var(--gris2)}',
    '.hh-anio tbody tr{cursor:pointer}.hh-anio tbody tr.tot{cursor:default}',
    '@media (max-width:640px){.hh-fila{grid-template-columns:1fr 1fr}.hh-cal .cal-d{min-height:0}.hh-total{margin:6px -16px -20px;padding:12px 16px}#hh-cifras{grid-template-columns:1fr 1fr;gap:10px}#hh-cifras .cifra .v{font-size:21px}#hh-cifras .cifra{padding:12px 13px}}'
  ].join('\n');
  document.head.appendChild(st);
}
function gesVistaHH(caja){
  _gesCss(); _hhCss();
  var oid=(YO.obra||{}).id;
  if(HHW.obra!==oid){ HHW.obra=oid; HHW.filas=null; HHW.por={}; HHW.ym=''; HHW.activos=null; }
  /* cuántos activos hay hoy en la obra, para el atajo «Todos los activos» (como en la app) */
  if(HHW.activos===null) traerTodo('sst_trabajador', '&select=id,estatus', 5000).then(function(l){ if(HHW.obra===oid) HHW.activos=(l||[]).filter(function(t){ return String(t.estatus||'activo')==='activo'; }).length; }, function(){});
  if(!HHW.ym) HHW.ym=hoyISO().slice(0,7);
  HHW.caja=caja;
  var ac=$('acciones');
  if(ac){
    ac.innerHTML='<button type="button" class="bt sec" id="hh-varios">Llenar varios días</button><button type="button" class="bt" id="hh-nuevo">＋ Registrar un día</button>';
    $('hh-varios').onclick=function(){ hhAbrirVarios(); };
    $('hh-nuevo').onclick=function(){ hhAbrirDia(hoyISO().slice(0,7)===HHW.ym ? hoyISO() : ''); };
  }
  if(!HHW.filas) cargando(caja);
  function pinta(silencio){
    var n=++HHW.n;
    _hhTraer().then(function(){ if(n!==HHW.n || VISTA.actual!=='hh') return; hhPintar(); if(HHW.alAbrir){ var fn=HHW.alAbrir; HHW.alAbrir=null; try{ fn(); }catch(e){} } },
                    function(cod){ if(n!==HHW.n || VISTA.actual!=='hh') return; if(!silencio || !HHW.filas) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function hhPintar(){
  var caja=HHW.caja; if(!caja || !document.body.contains(caja)) return;
  var ym=HHW.ym, a=+ym.slice(0,4), m=+ym.slice(5,7)-1, hoy=hoyISO();
  var del=_hhMesFilas(ym), S=hhSumar(del);
  var prim=new Date(a, m, 1), off=(prim.getDay()+6)%7, ndias=new Date(a, m+1, 0).getDate();
  var h='<div class="ch-barra"><div class="ch-mes">'+
    '<button type="button" class="bt sec chico" id="hh-ant" aria-label="Mes anterior">‹</button>'+
    '<h2 id="hh-tit">'+esc(DC_MESES[m]+' '+a)+'</h2>'+
    '<button type="button" class="bt sec chico" id="hh-sig" aria-label="Mes siguiente"'+(ym>=hoy.slice(0,7) ? ' disabled' : '')+'>›</button>'+
    (ym!==hoy.slice(0,7) ? '<button type="button" class="bt sec chico" id="hh-hoy">Este mes</button>' : '')+
    '</div><div class="ch-herr"><button type="button" class="bt sec chico" id="hh-excel">Exportar a Excel</button></div></div>';
  h+='<div class="rej" id="hh-cifras">'+
    cifra('Horas hombre trabajadas', gesNum(S.hht, 0), S.dias ? gesPlural(S.dias, 'día registrado', 'días registrados')+' en '+DC_MESES[m].toLowerCase() : 'ningún día registrado en '+DC_MESES[m].toLowerCase(), '', 'HHT')+
    cifra('Obreros', gesNum(S.ob, 0), S.dias ? 'en promedio '+gesNum(S.obN/S.dias, 1)+' por día' : '', '', 'HHT')+
    cifra('Empleados', gesNum(S.st, 0), S.dias ? 'en promedio '+gesNum(S.stN/S.dias, 1)+' por día' : '', '', 'HHT')+
    cifra('Horas hombre de capacitación', gesNum(S.hhc, 1), S.hht ? gesNum(S.hhc/S.hht*100, 2)+' % de las horas trabajadas' : '', '', 'HHC')+'</div>';
  h+='<div class="cal hh-cal" id="hh-cal">'+CH_SEMANA.map(function(d){ return '<div class="cal-sem" aria-hidden="true">'+d+'</div>'; }).join('');
  for(var i=0;i<off;i++) h+='<div class="cal-d otro" aria-hidden="true"></div>';
  for(var d=1; d<=ndias; d++){
    var iso=ym+'-'+dos(d), r=HHW.por[iso], dow=new Date(a, m, d).getDay(), fut=iso>hoy;
    var x=r ? hhDe(r) : null;
    h+='<button type="button" class="cal-d'+(iso===hoy?' hoy':'')+(fut?' fut':'')+(dow===0?' dom':'')+(r?'':' vacio')+'" data-iso="'+iso+'"'+(fut?' disabled':'')+
       ' aria-label="'+esc(HH_DIAS[dow]+' '+d+(x ? ', '+gesNum(x.hht, 0)+' horas hombre' : (fut ? '' : ', sin registrar')))+'">'+
       '<span class="cal-cab"><span class="cal-n">'+d+'</span><span class="cal-sd">'+esc(HH_DIAS[dow])+'</span></span>'+
       (x ? '<span class="hh-v">'+gesNum(x.hht, 0)+'<small>HHT</small></span>'+
            '<span class="hh-s">'+[(+r.ob_n ? gesNum(r.ob_n, 0)+' obr.' : ''), (+r.st_n ? gesNum(r.st_n, 0)+' empl.' : '')].filter(Boolean).join(' · ')+'</span>'+
            (x.hhc ? '<span class="hh-c">'+gesNum(x.hhc, 1)+' HHC</span>' : '')
          : (fut ? '' : '<span class="hh-falta">'+(dow===0 ? '' : 'sin registrar')+'</span>'))+'</button>';
  }
  h+='</div>';
  /* el año, mes a mes */
  var filasA='', TA={ ob:0, st:0, hht:0, hhc:0, dias:0 };
  for(var k=0;k<12;k++){
    var ymk=a+'-'+dos(k+1), Sk=hhSumar(_hhMesFilas(ymk));
    TA.ob+=Sk.ob; TA.st+=Sk.st; TA.hht+=Sk.hht; TA.hhc+=Sk.hhc; TA.dias+=Sk.dias;
    filasA+='<tr data-ym="'+ymk+'" class="'+(ymk===ym?'sel':'')+(Sk.dias?'':' vac')+'"><td>'+esc(DC_MESES[k])+'</td><td class="num">'+(Sk.dias||'—')+'</td><td class="num">'+(Sk.dias ? gesNum(Sk.ob, 0) : '—')+'</td><td class="num">'+(Sk.dias ? gesNum(Sk.st, 0) : '—')+'</td>'+
      '<td class="num"><b>'+(Sk.dias ? gesNum(Sk.hht, 0) : '—')+'</b></td><td class="num">'+(Sk.dias ? gesNum(Sk.hhc, 1) : '—')+'</td></tr>';
  }
  h+='<div class="tarj" style="margin-top:18px"><div class="tarj-cab"><div><h2>'+a+', mes a mes</h2><p class="sub">Las horas hombre de cada mes son las que usa «Accidentabilidad» para los índices</p></div>'+
     '<div class="acciones"><button type="button" class="bt sec chico" id="hh-anio-ant">‹ '+(a-1)+'</button>'+(a<+hoy.slice(0,4) ? '<button type="button" class="bt sec chico" id="hh-anio-sig">'+(a+1)+' ›</button>' : '')+'</div></div>'+
     '<div class="tabla-caja"><table class="hh-anio"><thead><tr><th>Mes</th><th class="num">Días</th><th class="num">HHT obreros</th><th class="num">HHT empleados</th><th class="num">HHT</th><th class="num">HHC</th></tr></thead><tbody>'+filasA+
     '<tr class="tot"><td>Total '+a+'</td><td class="num">'+TA.dias+'</td><td class="num">'+gesNum(TA.ob, 0)+'</td><td class="num">'+gesNum(TA.st, 0)+'</td><td class="num">'+gesNum(TA.hht, 0)+'</td><td class="num">'+gesNum(TA.hhc, 1)+'</td></tr></tbody></table></div></div>';
  if(!(HHW.filas||[]).length) h+='<div class="aviso" id="hh-vacio"><b>Todavía no hay horas hombre registradas.</b> Toca un día del calendario para registrarlo. Si vienes con meses anteriores, «Llenar varios días» los carga de una vez.</div>';
  caja.innerHTML=h;
  function ir(ym2){ HHW.ym=ym2; hhPintar(); }
  $('hh-ant').onclick=function(){ ir(_mesMas(ym, -1)); };
  $('hh-sig').onclick=function(){ if(ym<hoy.slice(0,7)) ir(_mesMas(ym, 1)); };
  if($('hh-hoy')) $('hh-hoy').onclick=function(){ ir(hoy.slice(0,7)); };
  $('hh-anio-ant').onclick=function(){ ir((a-1)+'-'+ym.slice(5,7)); };
  if($('hh-anio-sig')) $('hh-anio-sig').onclick=function(){ var y2=(a+1)+'-'+ym.slice(5,7); ir(y2>hoy.slice(0,7) ? hoy.slice(0,7) : y2); };
  $('hh-cal').onclick=function(ev){ var b=ev.target.closest('.cal-d[data-iso]'); if(b && !b.disabled) hhAbrirDia(b.getAttribute('data-iso')); };
  Array.prototype.forEach.call(caja.querySelectorAll('.hh-anio tbody tr[data-ym]'), function(tr){ tr.onclick=function(){ var y=tr.getAttribute('data-ym'); if(y<=hoy.slice(0,7)) ir(y); }; });
  $('hh-excel').onclick=function(){ hhExcel(this); };
}
/* ── un día ───────────────────────────────────────────────────────────────────────────────── */
var HHD = { iso:'', fila:null };
function _hhUlt(){ var u=leer('sstp_hh_ult_'+(YO.obra||{}).id, null); return (u && typeof u==='object') ? u : {}; }
function _hhBloque(k, tit, ic){
  return '<div class="hh-bloque" data-k="'+k+'"><h3><span aria-hidden="true">'+ic+'</span> '+esc(tit)+'</h3>'+
    '<div class="hh-fila"><div class="campo"><label for="hhd-'+k+'-n">¿Cuántos?</label><input id="hhd-'+k+'-n" type="number" inputmode="numeric" min="0" max="9999" step="1"></div>'+
    '<div class="campo"><label for="hhd-'+k+'-e">Entrada</label><input id="hhd-'+k+'-e" type="time"></div>'+
    '<div class="campo"><label for="hhd-'+k+'-s">Salida</label><input id="hhd-'+k+'-s" type="time"></div></div>'+
    '<div class="hh-fila"><div class="campo"><label for="hhd-'+k+'-r">Refrigerio (min)</label><input id="hhd-'+k+'-r" type="number" inputmode="numeric" min="0" max="240" step="5"></div>'+
    '<div class="campo"><label for="hhd-'+k+'-h">Horas por persona</label><input id="hhd-'+k+'-h" type="number" inputmode="decimal" min="0" max="24" step="0.01"></div></div>'+
    '<div class="hh-rap chips" data-rap="'+k+'"></div>'+
    '<p class="hh-res" id="hhd-'+k+'-res"></p></div>';
}
function hhAbrirDia(iso){
  var hoy=hoyISO();
  if(!iso || iso>hoy) iso=(HHW.ym===hoy.slice(0,7)) ? hoy : _ultimoDia(HHW.ym);
  if(iso>hoy) iso=hoy;
  HHD.iso=iso;
  var h='<div class="campo"><label for="hhd-fecha">Día</label><input type="date" id="hhd-fecha" value="'+iso+'" max="'+hoy+'"></div>'+
    '<div id="hhd-ya"></div>'+
    _hhBloque('ob', 'Obreros', '👷')+_hhBloque('st', 'Empleados', '👔')+
    '<div class="hh-bloque"><h3><span aria-hidden="true">🎓</span> Capacitación de ese día</h3>'+
      '<div class="hh-fila"><div class="campo"><label for="hhd-cn">Asistentes</label><input id="hhd-cn" type="number" inputmode="numeric" min="0" max="9999" step="1"></div>'+
      '<div class="campo"><label for="hhd-cm">Minutos</label><input id="hhd-cm" type="number" inputmode="numeric" min="0" max="1440" step="5"></div>'+
      '<div class="campo"><label for="hhd-hhc">Horas hombre de capacitación</label><input id="hhd-hhc" type="number" inputmode="decimal" min="0" step="0.01"></div></div>'+
      '<div class="hh-rap chips" data-rap="cm"></div><div id="hhd-asis"></div>'+
      '<p class="hh-res" id="hhd-c-res"></p></div>'+
    '<div class="campo" id="hhd-lugar-c"><label for="hhd-lugar">Lugar <span class="tenue">· opcional</span></label><input id="hhd-lugar" maxlength="80" placeholder="Torre B · Frente 2"></div>'+
    '<div class="msg" id="hhd-msg" role="status"></div><div class="hh-total" id="hhd-total"></div>';
  abrirHoja('Horas hombre del día', 'Los mismos datos del «Reporte semanal» de la app', h,
    '<button type="button" class="bt mal" id="hhd-quitar" hidden>Quitar este día</button><button type="button" class="bt" id="hhd-ok">Guardar el día</button>', {sinFoco:true});
  $('hhd-fecha').onchange=function(){ var v=this.value; if(!v || v>hoy){ this.value=HHD.iso; return; } HHD.iso=v; _hhdLlenar(); };
  ['ob', 'st'].forEach(function(k){
    ['e', 's', 'r'].forEach(function(c){ $('hhd-'+k+'-'+c).oninput=function(){ _hhdDeHorario(k); }; });
    $('hhd-'+k+'-n').oninput=_hhdCalc; $('hhd-'+k+'-h').oninput=function(){ $('hhd-'+k+'-h').setAttribute('data-mano', '1'); _hhdCalc(); };
  });
  $('hhd-cn').oninput=_hhdDeCharla; $('hhd-cm').oninput=_hhdDeCharla; $('hhd-hhc').oninput=_hhdCalc; $('hhd-lugar').oninput=_hhdCalc;
  $('hoja-cuerpo').addEventListener('click', function(ev){
    var b=ev.target.closest('[data-pon]'); if(!b) return;
    var id=b.getAttribute('data-pon'), e=$(id); if(!e) return;
    e.value=b.getAttribute('data-v'); e.dispatchEvent(new Event('input', {bubbles:true}));
  });
  $('hhd-ok').onclick=_hhdGuardar;
  $('hhd-quitar').onclick=_hhdQuitar;
  _hhdLlenar();
}
function _hhdLlenar(){
  var iso=HHD.iso, r=HHW.por[iso]||null, u=_hhUlt(); HHD.fila=r;
  var d=new Date(iso+'T00:00:00');
  $('hoja-t').textContent=HH_DIAS[d.getDay()].charAt(0).toUpperCase()+HH_DIAS[d.getDay()].slice(1)+' '+d.getDate()+' de '+DC_MESES[d.getMonth()].toLowerCase()+' de '+d.getFullYear();
  function pon(id, v){ var e=$(id); if(e){ e.value=(v==null ? '' : String(v)); e.removeAttribute('data-mano'); } }
  ['ob', 'st'].forEach(function(k){
    var n=r ? (+r[k+'_n']||0) : '', hh=r ? (+r[k+'_h']||0) : null, ent=r && r[k+'_entrada'], sal=r && r[k+'_salida'];
    pon('hhd-'+k+'-n', r ? (n||'') : '');
    if(r && !(ent && sal)){
      /* el día vino sin su horario (así lo guarda el servidor de hoy): quedan las horas por persona, tal cual */
      pon('hhd-'+k+'-e', ''); pon('hhd-'+k+'-s', ''); pon('hhd-'+k+'-r', ''); pon('hhd-'+k+'-h', hh||''); if(hh) $('hhd-'+k+'-h').setAttribute('data-mano', '1');
    } else {
      var e0=ent || u[k+'E'] || (k==='ob' ? '07:00' : '08:00'), s0=sal || u[k+'S'] || '17:00';
      var r0=(u[k+'R']!=null ? u[k+'R'] : 60);
      /* si trae el horario y las horas guardadas no son las de ese horario con el refrigerio de siempre, el refrigerio sale de la cuenta */
      if(r && ent && sal && hh){ var bruto=hhHoras(ent, sal, 0); if(bruto!==null && bruto>=hh) r0=Math.round((bruto-hh)*60); }
      pon('hhd-'+k+'-e', e0); pon('hhd-'+k+'-s', s0); pon('hhd-'+k+'-r', r0);
      pon('hhd-'+k+'-h', r ? (hh||'') : (hhHoras(e0, s0, r0)||''));
    }
  });
  pon('hhd-cn', ''); pon('hhd-cm', ''); pon('hhd-hhc', r && +r.hhc ? gesRed(r.hhc) : '');
  pon('hhd-lugar', r ? (r.lugar||'') : '');
  $('hhd-lugar-c').hidden=(HHW.nivel>0);
  $('hhd-quitar').hidden=!r;
  $('hhd-ok').textContent=r ? 'Guardar los cambios' : 'Guardar el día';
  $('hhd-ya').innerHTML=r ? '<div class="aviso">Este día ya está registrado con <b>'+gesNum(hhDe(r).hht, 0)+' HHT</b>. Lo que cambies lo reemplaza, aquí y en la app.</div>' : '';
  var m=$('hhd-msg'); m.className='msg'; m.textContent='';
  _hhdRapidos(); _hhdCalc(); _hhdAsistencia(iso, !r);
}
function _hhdRapidos(){
  var act=HHW.activos||0;
  function chips(id, vals, suf){ return vals.map(function(v){ return '<button type="button" class="chip" data-pon="'+id+'" data-v="'+v+'">'+v+suf+'</button>'; }).join(''); }
  ['ob', 'st'].forEach(function(k){
    var c=document.querySelector('.hh-rap[data-rap="'+k+'"]'); if(!c) return;
    c.innerHTML=(k==='ob' && act ? '<button type="button" class="chip" data-pon="hhd-ob-n" data-v="'+act+'">Todos los activos ('+act+')</button>' : '')+
      '<span class="tenue" style="font-size:12px;align-self:center;margin:0 2px 0 6px">Refrigerio:</span>'+chips('hhd-'+k+'-r', [0, 30, 45, 60], ' min');
  });
  var cm=document.querySelector('.hh-rap[data-rap="cm"]'); if(cm) cm.innerHTML=chips('hhd-cm', [5, 10, 15, 30, 60], ' min');
}
function _hhdDeHorario(k){
  var hh=hhHoras($('hhd-'+k+'-e').value, $('hhd-'+k+'-s').value, $('hhd-'+k+'-r').value);
  if(hh!==null){ $('hhd-'+k+'-h').value=hh; $('hhd-'+k+'-h').removeAttribute('data-mano'); }
  _hhdCalc();
}
function _hhdDeCharla(){
  var n=parseInt($('hhd-cn').value, 10)||0, mi=parseInt($('hhd-cm').value, 10)||0;
  if(n && mi) $('hhd-hhc').value=gesRed(n*mi/60);
  _hhdCalc();
}
function _hhdLeer(){
  function ent(id){ var n=parseInt(($(id)||{}).value, 10); return (isNaN(n) || n<0) ? 0 : n; }
  function dec(id){ var n=parseFloat(String(($(id)||{}).value||'').replace(',', '.')); return (isNaN(n) || n<0) ? 0 : n; }
  var o={ obN:ent('hhd-ob-n'), obH:dec('hhd-ob-h'), stN:ent('hhd-st-n'), stH:dec('hhd-st-h'), hhc:gesRed(dec('hhd-hhc')), lugar:gesTxt(($('hhd-lugar')||{}).value).slice(0, 80) };
  o.hht=o.obN*o.obH+o.stN*o.stH;
  return o;
}
function _hhdCalc(){
  var R=_hhdLeer();
  [['ob', 'obreros', R.obN, R.obH], ['st', 'empleados', R.stN, R.stH]].forEach(function(x){
    var k=x[0], e=$('hhd-'+k+'-res'); if(!e) return;
    var mano=$('hhd-'+k+'-h').getAttribute('data-mano')==='1', en=$('hhd-'+k+'-e').value, sa=$('hhd-'+k+'-s').value, re=parseInt($('hhd-'+k+'-r').value, 10)||0;
    if(!x[2]) e.textContent=(k==='ob') ? 'Pon cuántos obreros hubo y sale la cuenta.' : 'Si ese día no hubo empleados, déjalo vacío.';
    else if(!x[3]) e.textContent='Revisa la entrada y la salida: con esas horas la jornada sale en cero.';
    else e.innerHTML='<b>'+x[2]+' × '+gesNum(x[3])+' h = '+gesNum(x[2]*x[3])+' horas hombre</b>'+
      ((!mano && en && sa) ? ' · de '+esc(en)+' a '+esc(sa)+(re ? ', menos '+re+' min de refrigerio' : ', sin refrigerio descontado') : ' · horas por persona puestas a mano');
  });
  var c=$('hhd-c-res');
  if(c) c.innerHTML=R.hhc ? '<b>'+gesNum(R.hhc)+' HHC</b>'+(R.hht ? ' · '+gesNum(R.hhc/R.hht*100)+' % de las horas trabajadas de ese día' : '') : 'Si hubo charla o capacitación: cuántos asistieron y cuántos minutos duró.';
  var t=$('hhd-total');
  if(t) t.innerHTML=R.hht ? 'Ese día: <b>'+gesNum(R.hht)+' HHT</b>'+(R.hhc ? ' · <b>'+gesNum(R.hhc)+' HHC</b>' : '')+(R.lugar ? ' · 📍 '+esc(R.lugar) : '') : 'Cuando pongas cuánta gente hubo y sus horas, aquí sale el total del día.';
  return R;
}
/* la HHC de ese día según los registros de asistencia de la obra (la misma función que usa la app) */
function _hhdAsistencia(iso, llenar){
  var c=$('hhd-asis'); if(!c) return; c.innerHTML='';
  var d0=new Date(iso+'T00:00:00'), d1=new Date(d0.getTime()+86400000);
  /* dos fuentes: la asistencia con QR de la app (el servidor hace la cuenta) y las capacitaciones registradas a mano
     en el portal (sección 4). Cada una dice lo suyo; si hay de las dos, también la suma */
  var pA=sbRpc('sst_asist_hhc', {p:{empresa:YO.obra.id, desde:d0.toISOString(), hasta:d1.toISOString()}}).then(function(r){ return (r && r.ok && r.temas && +r.hhc) ? r : null; }, function(){ return null; });
  var pW=(typeof gesCapHHCDe==='function') ? gesCapHHCDe(iso).then(function(w){ return (w && w.n && w.hhc>0) ? w : null; }, function(){ return null; }) : Promise.resolve(null);
  Promise.all([pA, pW]).then(function(x){
    var r=x[0], w=x[1];
    if(HHD.iso!==iso || !$('hhd-asis') || (!r && !w)) return;
    var hA=r ? gesRed(r.hhc) : 0, hW=w ? gesRed(w.hhc) : 0, suma=gesRed(hA+hW), hoy=gesRed(parseFloat($('hhd-hhc').value)||0);
    if(llenar && !hoy){ $('hhd-hhc').value=suma; hoy=suma; _hhdCalc(); }
    var bt=function(v){ return hoy===v ? '' : ' <button type="button" class="bt sec chico" data-pon="hhd-hhc" data-v="'+v+'">Usar ese número</button>'; };
    var h='';
    if(r) h+='<div class="aviso" style="margin:0 0 10px">De los registros de asistencia de ese día: <b>'+gesPlural(+r.temas, 'tema', 'temas')+'</b> · <b>'+gesPlural(+r.personas||0, 'asistencia', 'asistencias')+'</b> · <b>'+gesNum(hA)+' HHC</b>'+(w ? '' : bt(hA))+'</div>';
    if(w) h+='<div class="aviso" style="margin:0 0 10px" id="hhd-asis-web">De las capacitaciones registradas en el portal ese día: <b>'+gesPlural(w.n, 'capacitación', 'capacitaciones')+'</b> · <b>'+gesPlural(w.asis, 'asistencia', 'asistencias')+'</b> · <b>'+gesNum(hW)+' HHC</b>'+(r ? '' : bt(hW))+'</div>';
    if(r && w) h+='<div class="aviso" style="margin:0 0 10px" id="hhd-asis-suma">Las dos juntas: <b>'+gesNum(suma)+' HHC</b>'+bt(suma)+'</div>';
    $('hhd-asis').innerHTML=h;
  });
}
function _hhFila(iso, R, conExtras){
  var f={ duenio:YO.obra.id, fecha:iso, ob_n:R.obN, ob_h:gesRed(R.obH, 6), st_n:R.stN, st_h:gesRed(R.stH, 6), hhc:gesRed(R.hhc) };
  if(conExtras){
    f.lugar=R.lugar||null;
    f.ob_entrada=R.obE||null; f.ob_salida=R.obS||null; f.st_entrada=R.stE||null; f.st_salida=R.stS||null;
  }
  return f;
}
/* guardar un día: si ya tiene fila, se corrige esa; si no, se crea. Antes se vuelve a mirar el servidor (otro pudo
   registrarlo hace un minuto desde el celular) */
function _hhGuardarDia(iso, R){
  return sbGet('sst_hht?'+filtroObra('sst_hht')+'&fecha=eq.'+iso+'&select=id&order=creado.desc&limit=5').then(function(rows){
    var ya=(rows||[])[0];
    function intento(conExtras){
      var f=_hhFila(iso, R, conExtras);
      if(ya){ var p={}; for(var k in f) if(k!=='duenio' && k!=='fecha') p[k]=f[k]; return sbPatch('sst_hht?id=eq.'+encodeURIComponent(ya.id), p); }
      return sbPostP('sst_hht', f);
    }
    return intento(HHW.nivel===0).catch(function(c){ if(c===400 && HHW.nivel===0){ HHW.nivel=1; return intento(false); } throw c; })
      .then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject({portal:'Esta cuenta no puede escribir en esta obra.'}); return r; });
  });
}
function _hhdGuardar(){
  var m=$('hhd-msg'), bt=$('hhd-ok'), iso=HHD.iso, R=_hhdLeer(), hoy=hoyISO();
  function mal(t, foco){ m.className='msg mal'; m.textContent=t; if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} }
  if(!iso || iso>hoy) return mal('Elige un día de hoy para atrás.', 'hhd-fecha');
  if(!R.obN && !R.stN) return mal('Pon al menos cuánta gente hubo ese día.', 'hhd-ob-n');
  if(R.obN && !R.obH) return mal('Faltan las horas de los obreros: revisa la entrada y la salida.', 'hhd-ob-e');
  if(R.stN && !R.stH) return mal('Faltan las horas de los empleados: revisa la entrada y la salida.', 'hhd-st-e');
  if(R.obH>24 || R.stH>24) return mal('Las horas por persona no pueden pasar de 24.', R.obH>24 ? 'hhd-ob-h' : 'hhd-st-h');
  ['ob', 'st'].forEach(function(k){
    var mano=$('hhd-'+k+'-h').getAttribute('data-mano')==='1';
    /* sin gente de ese grupo ese día, no hay horas ni horario que guardar */
    if(!R[k+'N']){ R[k+'H']=0; R[k+'E']=''; R[k+'S']=''; return; }
    R[k+'E']=mano ? '' : $('hhd-'+k+'-e').value; R[k+'S']=mano ? '' : $('hhd-'+k+'-s').value;
  });
  /* el horario y el refrigerio de la última vez: en obra se repiten casi siempre */
  var u=_hhUlt();
  ['ob', 'st'].forEach(function(k){ if(R[k+'N'] && R[k+'E'] && R[k+'S']){ u[k+'E']=R[k+'E']; u[k+'S']=R[k+'S']; u[k+'R']=parseInt($('hhd-'+k+'-r').value, 10)||0; } });
  guardar('sstp_hh_ult_'+YO.obra.id, u);
  bt.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
  _hhGuardarDia(iso, R).then(function(){
    toast('Día guardado: '+gesNum(R.hht)+' HHT'+(R.hhc ? ' y '+gesNum(R.hhc)+' HHC' : '')+'. La app lo recibe al sincronizar.');
    cerrarHoja(); HHW.ym=iso.slice(0,7);
    if(typeof VISTA.recargar==='function') VISTA.recargar(true);
  }, function(e){ bt.disabled=false; mal('No se pudo guardar. '+porQueFallo(e)); });
}
function _hhdQuitar(){
  var r=HHD.fila; if(!r) return;
  confirmar('¿Quitar las horas de este día?', 'Se borra el registro del '+fechaLarga(r.fecha)+' ('+gesNum(hhDe(r).hht, 0)+' HHT), aquí y en la app. Los índices del mes se recalculan sin ese día.', {si:'Sí, quitarlo', mal:true}).then(function(si){
    if(!si) return;
    sbDelP('sst_hht?id=eq.'+encodeURIComponent(r.id)).then(function(rows){
      if(Array.isArray(rows) && !rows.length){ toast('No se pudo quitar: esta cuenta no puede borrar en esta obra.'); return; }
      toast('Día quitado.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}
/* ── varios días de una vez ───────────────────────────────────────────────────────────────── */
var HHV = { modo:'horario', dias:[1, 2, 3, 4, 5, 6], pisar:false };
function hhAbrirVarios(){
  var hoy=hoyISO(), ym=HHW.ym||hoy.slice(0,7), u=_hhUlt();
  var desde=ym+'-01', hasta=(ym===hoy.slice(0,7)) ? hoy : _ultimoDia(ym);
  HHV.modo='horario'; HHV.pisar=false;
  function bloque(k, tit, ic, e0, s0, r0){
    return '<div class="hh-bloque"><h3><span aria-hidden="true">'+ic+'</span> '+esc(tit)+'</h3>'+
      '<div class="hh-fila hhv-horario"><div class="campo"><label for="hhv-'+k+'-n">¿Cuántos cada día?</label><input id="hhv-'+k+'-n" type="number" inputmode="numeric" min="0" max="9999" step="1"></div>'+
      '<div class="campo"><label for="hhv-'+k+'-e">Entrada</label><input id="hhv-'+k+'-e" type="time" value="'+esc(e0)+'"></div>'+
      '<div class="campo"><label for="hhv-'+k+'-s">Salida</label><input id="hhv-'+k+'-s" type="time" value="'+esc(s0)+'"></div>'+
      '<div class="campo"><label for="hhv-'+k+'-r">Refrigerio (min)</label><input id="hhv-'+k+'-r" type="number" inputmode="numeric" min="0" max="240" step="5" value="'+esc(r0)+'"></div></div>'+
      '<div class="hh-fila hhv-total" hidden><div class="campo"><label for="hhv-'+k+'-np">¿Cuántos en promedio?</label><input id="hhv-'+k+'-np" type="number" inputmode="numeric" min="0" max="9999" step="1"></div>'+
      '<div class="campo"><label for="hhv-'+k+'-t">HHT del periodo</label><input id="hhv-'+k+'-t" type="number" inputmode="decimal" min="0" step="0.01"></div></div></div>';
  }
  var h='<p style="margin:0 0 14px">Para cargar de una vez los días que se trabajaron igual, o los meses de antes de usar OBRASST. Cada día queda como si lo hubieras registrado uno por uno.</p>'+
    '<div class="chips" id="hhv-modo" role="radiogroup" style="margin:0 0 14px">'+
      '<button type="button" role="radio" class="chip on" aria-checked="true" data-v="horario">Con el mismo horario cada día</button>'+
      '<button type="button" role="radio" class="chip" aria-checked="false" data-v="total">Tengo el total de horas del periodo</button></div>'+
    '<div class="fila-c"><div class="campo"><label for="hhv-desde">Desde el</label><input type="date" id="hhv-desde" value="'+desde+'" max="'+hoy+'"></div>'+
    '<div class="campo"><label for="hhv-hasta">Hasta el</label><input type="date" id="hhv-hasta" value="'+hasta+'" max="'+hoy+'"></div></div>'+
    '<div class="campo"><label>Qué días se trabajó</label><div class="hh-dias chips" id="hhv-dias">'+[1, 2, 3, 4, 5, 6, 0].map(function(d){
      var on=HHV.dias.indexOf(d)>-1; return '<button type="button" class="chip'+(on?' on':'')+'" aria-pressed="'+(on?'true':'false')+'" data-d="'+d+'">'+esc(HH_DIAS[d].charAt(0).toUpperCase()+HH_DIAS[d].slice(1, 3))+'</button>'; }).join('')+'</div></div>'+
    bloque('ob', 'Obreros', '👷', u.obE||'07:00', u.obS||'17:00', (u.obR!=null ? u.obR : 60))+
    bloque('st', 'Empleados', '👔', u.stE||'08:00', u.stS||'17:00', (u.stR!=null ? u.stR : 60))+
    '<div class="hh-bloque hhv-total" hidden><h3><span aria-hidden="true">🎓</span> Capacitación</h3><div class="hh-fila"><div class="campo"><label for="hhv-hhc">HHC del periodo</label><input id="hhv-hhc" type="number" inputmode="decimal" min="0" step="0.01"></div></div></div>'+
    '<div class="chips" id="hhv-pisar" role="radiogroup" style="margin:0 0 6px">'+
      '<button type="button" role="radio" class="chip on" aria-checked="true" data-v="0">No tocar los días que ya tienen registro</button>'+
      '<button type="button" role="radio" class="chip" aria-checked="false" data-v="1">Reemplazarlos</button></div>'+
    '<div class="msg" id="hhv-msg" role="status"></div><div class="hh-total" id="hhv-res"></div>';
  abrirHoja('Llenar varios días', 'Las horas hombre de un periodo, de una vez', h, '<button type="button" class="bt" id="hhv-ok">Guardar</button>', {sinFoco:true});
  $('hhv-modo').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; HHV.modo=b.getAttribute('data-v');
    Array.prototype.forEach.call(this.children, function(c){ var on=c===b; c.className='chip'+(on?' on':''); c.setAttribute('aria-checked', on?'true':'false'); });
    Array.prototype.forEach.call(document.querySelectorAll('#hoja .hhv-horario'), function(x){ x.hidden=(HHV.modo!=='horario'); });
    Array.prototype.forEach.call(document.querySelectorAll('#hoja .hhv-total'), function(x){ x.hidden=(HHV.modo!=='total'); });
    _hhvCalc(); };
  $('hhv-pisar').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; HHV.pisar=(b.getAttribute('data-v')==='1');
    Array.prototype.forEach.call(this.children, function(c){ var on=c===b; c.className='chip'+(on?' on':''); c.setAttribute('aria-checked', on?'true':'false'); }); _hhvCalc(); };
  $('hhv-dias').onclick=function(ev){ var b=ev.target.closest('[data-d]'); if(!b) return; var d=+b.getAttribute('data-d'), i=HHV.dias.indexOf(d);
    if(i>-1) HHV.dias.splice(i, 1); else HHV.dias.push(d);
    b.className='chip'+(i>-1?'':' on'); b.setAttribute('aria-pressed', i>-1?'false':'true'); _hhvCalc(); };
  Array.prototype.forEach.call(document.querySelectorAll('#hoja-cuerpo input'), function(x){ x.addEventListener('input', _hhvCalc); x.addEventListener('change', _hhvCalc); });
  $('hhv-ok').onclick=_hhvGuardar;
  _hhvCalc();
}
/* los días que entran y lo que lleva cada uno */
function _hhvPlan(){
  function ent(id){ var n=parseInt(($(id)||{}).value, 10); return (isNaN(n) || n<0) ? 0 : n; }
  function dec(id){ var n=parseFloat(String(($(id)||{}).value||'').replace(',', '.')); return (isNaN(n) || n<0) ? 0 : n; }
  var hoy=hoyISO(), d=$('hhv-desde').value, h=$('hhv-hasta').value, P={ error:'', foco:'', dias:[], saltados:0, pisados:0 };
  if(!d || !h){ P.error='Elige desde qué día y hasta qué día.'; P.foco=d ? 'hhv-hasta' : 'hhv-desde'; return P; }
  if(h<d){ var x=d; d=h; h=x; }
  if(h>hoy) h=hoy;
  if(d>hoy){ P.error='El periodo tiene que ser de hoy para atrás.'; P.foco='hhv-desde'; return P; }
  if((Date.parse(h)-Date.parse(d))/86400000>370){ P.error='Como mucho un año por vez.'; P.foco='hhv-desde'; return P; }
  if(!HHV.dias.length){ P.error='Marca al menos un día de la semana.'; return P; }
  var todos=[];
  for(var t=Date.parse(d+'T00:00:00Z'); t<=Date.parse(h+'T00:00:00Z'); t+=86400000){
    var iso=new Date(t).toISOString().slice(0,10), dow=new Date(t).getUTCDay();
    if(HHV.dias.indexOf(dow)<0) continue;
    todos.push(iso);
  }
  P.desde=d; P.hasta=h; P.todos=todos.length;
  var entran=todos.filter(function(iso){ if(HHW.por[iso]){ if(HHV.pisar){ P.pisados++; return true; } P.saltados++; return false; } return true; });
  if(!todos.length){ P.error='En ese periodo no cae ninguno de los días marcados.'; return P; }
  var n=entran.length;
  if(HHV.modo==='horario'){
    var obN=ent('hhv-ob-n'), stN=ent('hhv-st-n');
    var obH=hhHoras($('hhv-ob-e').value, $('hhv-ob-s').value, $('hhv-ob-r').value), stH=hhHoras($('hhv-st-e').value, $('hhv-st-s').value, $('hhv-st-r').value);
    if(!obN && !stN){ P.error='Pon cuántos obreros o cuántos empleados hubo cada día.'; P.foco='hhv-ob-n'; return P; }
    if(obN && !obH){ P.error='Revisa la entrada y la salida de los obreros.'; P.foco='hhv-ob-e'; return P; }
    if(stN && !stH){ P.error='Revisa la entrada y la salida de los empleados.'; P.foco='hhv-st-e'; return P; }
    P.dias=entran.map(function(iso){ return { iso:iso, R:{ obN:obN, obH:obN ? obH : 0, stN:stN, stH:stN ? stH : 0, hhc:(HHW.por[iso] ? (+HHW.por[iso].hhc||0) : 0), lugar:'',
      obE:obN ? $('hhv-ob-e').value : '', obS:obN ? $('hhv-ob-s').value : '', stE:stN ? $('hhv-st-e').value : '', stS:stN ? $('hhv-st-s').value : '' } }; });
    P.ob=obN*(obH||0)*n; P.st=stN*(stH||0)*n; P.hhc=0;
  } else {
    var obP=ent('hhv-ob-np'), obT=dec('hhv-ob-t'), stP=ent('hhv-st-np'), stT=dec('hhv-st-t'), hhcT=dec('hhv-hhc');
    if(!obT && !stT){ P.error='Pon las horas hombre del periodo, de los obreros o de los empleados.'; P.foco='hhv-ob-t'; return P; }
    if(obT && !obP){ P.error='Falta cuántos obreros hubo en promedio: con eso se reparten las horas.'; P.foco='hhv-ob-np'; return P; }
    if(stT && !stP){ P.error='Falta cuántos empleados hubo en promedio.'; P.foco='hhv-st-np'; return P; }
    if(n && ((obT && obT/(obP*n)>24) || (stT && stT/(stP*n)>24))){ P.error='Con ese total salen más de 24 horas por persona al día: revisa el total, el promedio de gente o el periodo.'; P.foco='hhv-ob-t'; return P; }
    /* se reparte parejo y el último día lleva la diferencia del redondeo: la suma es exactamente el total */
    var obH2=(obT && n) ? gesRed(obT/(obP*n), 4) : 0, stH2=(stT && n) ? gesRed(stT/(stP*n), 4) : 0, hc=(hhcT && n) ? gesRed(hhcT/n) : 0;
    P.dias=entran.map(function(iso, i){
      var ult=(i===n-1);
      return { iso:iso, R:{ obN:obT ? obP : 0, obH:obT ? (ult ? gesRed((obT-obH2*obP*(n-1))/obP, 6) : obH2) : 0, stN:stT ? stP : 0, stH:stT ? (ult ? gesRed((stT-stH2*stP*(n-1))/stP, 6) : stH2) : 0,
        hhc:hhcT ? (ult ? gesRed(hhcT-hc*(n-1)) : hc) : (HHW.por[iso] ? (+HHW.por[iso].hhc||0) : 0), lugar:'', obE:'', obS:'', stE:'', stS:'' } };
    });
    P.ob=obT; P.st=stT; P.hhc=hhcT;
  }
  if(!n){ P.error='Todos los días de ese periodo ya tienen registro. Si quieres cambiarlos, marca «Reemplazarlos».'; return P; }
  return P;
}
function _hhvCalc(){
  var P=_hhvPlan(), r=$('hhv-res'), m=$('hhv-msg'), bt=$('hhv-ok'); if(!r) return P;
  if(m){ m.className='msg'; m.textContent=''; }
  if(P.error){ r.textContent=P.error; if(bt){ bt.disabled=true; bt.textContent='Guardar'; } return P; }
  var n=P.dias.length;
  r.innerHTML='<b>'+gesPlural(n, 'día', 'días')+'</b> del '+esc(fechaLarga(P.desde))+' al '+esc(fechaLarga(P.hasta))+' · <b>'+gesNum(P.ob+P.st, 0)+' HHT</b>'+
    (P.ob && P.st ? ' ('+gesNum(P.ob, 0)+' de obreros y '+gesNum(P.st, 0)+' de empleados)' : '')+(P.hhc ? ' · <b>'+gesNum(P.hhc, 1)+' HHC</b>' : '')+
    (P.saltados ? '<br>'+gesPlural(P.saltados, 'día ya tiene', 'días ya tienen')+' registro y no se '+(P.saltados===1 ? 'toca' : 'tocan')+'.' : '')+
    (P.pisados ? '<br><span style="color:var(--ojo)">'+gesPlural(P.pisados, 'día ya registrado se reemplaza', 'días ya registrados se reemplazan')+'.</span>' : '');
  if(bt){ bt.disabled=false; bt.textContent='Guardar '+gesPlural(n, 'día', 'días'); }
  return P;
}
function _hhvGuardar(){
  var P=_hhvPlan(), m=$('hhv-msg'), bt=$('hhv-ok');
  if(P.error){ m.className='msg mal'; m.textContent=P.error; if(P.foco && $(P.foco)) try{ $(P.foco).focus(); }catch(e){} return; }
  var nuevos=P.dias.filter(function(x){ return !HHW.por[x.iso]; }), viejos=P.dias.filter(function(x){ return !!HHW.por[x.iso]; });
  function seguir(){
    bt.disabled=true; Array.prototype.forEach.call(document.querySelectorAll('#hoja-cuerpo input, #hoja-cuerpo button'), function(x){ x.disabled=true; });
    m.className='msg gris'; m.innerHTML='Guardando… <span id="hhv-av-t">0 de '+P.dias.length+'</span><div class="ges-avance"><i id="hhv-av" style="width:0"></i></div>';
    var hechos=0;
    function avance(k){ hechos+=k; var a=$('hhv-av'), t=$('hhv-av-t'); if(a) a.style.width=Math.round(hechos/P.dias.length*100)+'%'; if(t) t.textContent=hechos+' de '+P.dias.length; }
    var filas=nuevos.map(function(x){ return _hhFila(x.iso, x.R, true); }), antes=0;
    gesSubirTandas('sst_hht', filas, [HHW.nivel===0 ? [] : HH_EXTRAS, HH_EXTRAS], function(n2){ avance(n2-antes); antes=n2; }, 50).then(function(r){
      if(r.sinCols.length) HHW.nivel=1;
      /* los que ya estaban: uno por uno, sobre su fila */
      return viejos.reduce(function(cad, x){ return cad.then(function(){ return _hhGuardarDia(x.iso, x.R).then(function(){ avance(1); }); }); }, Promise.resolve());
    }).then(function(){
      if(HHV.modo==='horario'){ var u=_hhUlt(); ['ob', 'st'].forEach(function(k){ if(parseInt($('hhv-'+k+'-n').value, 10)>0){ u[k+'E']=$('hhv-'+k+'-e').value; u[k+'S']=$('hhv-'+k+'-s').value; u[k+'R']=parseInt($('hhv-'+k+'-r').value, 10)||0; } }); guardar('sstp_hh_ult_'+YO.obra.id, u); }
      toast(gesPlural(P.dias.length, 'día guardado', 'días guardados')+': '+gesNum(P.ob+P.st, 0)+' HHT. La app los recibe al sincronizar.');
      HHW.ym=P.hasta.slice(0,7); cerrarHoja();
      if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    }).catch(function(e){
      m.className='msg mal'; m.textContent=(hechos ? 'Se guardaron '+hechos+' de '+P.dias.length+' días y el resto no. ' : 'No se pudo guardar. ')+porQueFallo(e && e.cod!==undefined ? e.cod : e)+(hechos ? ' Vuelve a intentarlo: los que ya entraron no se repiten.' : '');
      Array.prototype.forEach.call(document.querySelectorAll('#hoja-cuerpo input, #hoja-cuerpo button'), function(x){ x.disabled=false; }); bt.disabled=false;
      if(hechos && typeof VISTA.recargar==='function') VISTA.recargar(true);
    });
  }
  if(viejos.length) confirmar('¿Reemplazar '+gesPlural(viejos.length, 'día ya registrado', 'días ya registrados')+'?', 'Lo que tenían esos días se cambia por lo de este llenado, aquí y en la app. La capacitación (HHC) que ya tuvieran se conserva'+(HHV.modo==='total' && P.hhc ? ' salvo que pusiste un total nuevo.' : '.'), {si:'Sí, reemplazar', mal:true}).then(function(si){ if(si) seguir(); });
  else seguir();
}
/* ── el Excel: el mes día por día y el año mes a mes ───────────────────────────────────────── */
function hhExcel(bt){
  if(bt) bt.disabled=true;
  cargarEvPDF().then(function(){
    var X=RCAP.xlsx, E=new X.Estilos(), C=X.C, ym=HHW.ym, a=+ym.slice(0,4), m=+ym.slice(5,7)-1, nd=new Date(a, m+1, 0).getDate(), obra=String(nombreObraP()||'');
    var sTit=E.xf({ b:1, sz:14, c:C.petroleo }), sSub=E.xf({ sz:10, c:C.gris }), sCab=E.xf({ b:1, sz:9, c:C.blanco, f:C.petroleo, h:'center', v:'center', wrap:1, borde:true }), sCabI=E.xf({ b:1, sz:9, c:C.blanco, f:C.petroleo, h:'left', borde:true });
    var sTx=E.xf({ sz:10, c:C.tinta, borde:true }), sN0=E.xf({ sz:10, c:C.tinta, h:'right', borde:true, fmt:'#,##0' }), sN2=E.xf({ sz:10, c:C.tinta, h:'right', borde:true, fmt:'#,##0.00' });
    var sT0=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, h:'right', borde:true, fmt:'#,##0' }), sT2=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, h:'right', borde:true, fmt:'#,##0.00' }), sTt=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, borde:true });
    var sVac=E.xf({ sz:10, c:C.grisc, borde:true }), sFe=E.xf({ sz:10, c:C.tinta, h:'center', borde:true, fmt:'dd/mm/yyyy' });
    var h=new X.Hoja(DC_MESES[m]+' '+a); h.activa=true; h.pie='Horas hombre';
    h.unir(0, 1, 9, 1, 'Horas hombre trabajadas y de capacitación · '+DC_MESES[m].toLowerCase()+' de '+a, sTit); h.altos[1]=22;
    h.unir(0, 2, 9, 2, obra+' · HHT = obreros × horas + empleados × horas · HHC = asistentes × minutos ÷ 60', sSub);
    ['Fecha', 'Día', 'Obreros', 'Horas c/u', 'HHT obreros', 'Empleados', 'Horas c/u', 'HHT empleados', 'HHT del día', 'HHC'].forEach(function(t, i){ h.celda(i, 4, t, i<2 ? sCabI : sCab); });
    [12, 12, 10, 10, 13, 11, 10, 14, 13, 10].forEach(function(w, i){ h.anchos[i]=w; }); h.altos[4]=28;
    var f=5, SM=hhSumar(_hhMesFilas(ym));
    for(var d=1; d<=nd; d++){
      var iso=ym+'-'+dos(d), r=HHW.por[iso], dow=new Date(a, m, d).getDay();
      h.celda(0, f, X.serial(iso), sFe); h.celda(1, f, HH_DIAS[dow], r ? sTx : sVac);
      if(r){
        var x=hhDe(r);   /* la fórmula y, con ella, su valor ya calculado (hay visores que no recalculan) */
        h.celda(2, f, +r.ob_n||0, sN0); h.celda(3, f, +r.ob_h||0, sN2); h.celda(4, f, gesRed(x.ob, 4), sN2, 'C'+f+'*D'+f);
        h.celda(5, f, +r.st_n||0, sN0); h.celda(6, f, +r.st_h||0, sN2); h.celda(7, f, gesRed(x.st, 4), sN2, 'F'+f+'*G'+f);
        h.celda(8, f, gesRed(x.hht, 4), sN2, 'E'+f+'+H'+f); h.celda(9, f, +r.hhc||0, sN2);
      } else for(var c=2;c<10;c++) h.celda(c, f, '', sVac);
      f++;
    }
    h.celda(0, f, 'Total', sTt); h.celda(1, f, '', sTt); h.celda(2, f, '', sTt); h.celda(3, f, '', sTt);
    h.celda(4, f, gesRed(SM.ob, 4), sT2, 'SUM(E5:E'+(f-1)+')'); h.celda(5, f, '', sTt); h.celda(6, f, '', sTt); h.celda(7, f, gesRed(SM.st, 4), sT2, 'SUM(H5:H'+(f-1)+')');
    h.celda(8, f, gesRed(SM.hht, 4), sT2, 'SUM(I5:I'+(f-1)+')'); h.celda(9, f, gesRed(SM.hhc, 4), sT2, 'SUM(J5:J'+(f-1)+')');
    h.congelar={ c:0, r:4 };
    var g=new X.Hoja('Año '+a); g.pie='Horas hombre';
    g.unir(0, 1, 5, 1, 'Horas hombre · '+a+', mes a mes', sTit); g.altos[1]=22; g.unir(0, 2, 5, 2, obra, sSub);
    ['Mes', 'Días registrados', 'HHT obreros', 'HHT empleados', 'HHT', 'HHC'].forEach(function(t, i){ g.celda(i, 4, t, i<1 ? sCabI : sCab); });
    [16, 12, 14, 14, 14, 12].forEach(function(w, i){ g.anchos[i]=w; }); g.altos[4]=28;
    var TA={ dias:0, ob:0, st:0, hhc:0 };
    for(var k=0;k<12;k++){
      var S=hhSumar(_hhMesFilas(a+'-'+dos(k+1))), fr=5+k;
      TA.dias+=S.dias; TA.ob+=gesRed(S.ob); TA.st+=gesRed(S.st); TA.hhc+=gesRed(S.hhc);
      g.celda(0, fr, DC_MESES[k], sTx); g.celda(1, fr, S.dias, sN0); g.celda(2, fr, gesRed(S.ob), sN2); g.celda(3, fr, gesRed(S.st), sN2); g.celda(4, fr, gesRed(gesRed(S.ob)+gesRed(S.st)), sN2, 'C'+fr+'+D'+fr); g.celda(5, fr, gesRed(S.hhc), sN2);
    }
    g.celda(0, 17, 'Total '+a, sTt); g.celda(1, 17, TA.dias, sT0, 'SUM(B5:B16)'); g.celda(2, 17, gesRed(TA.ob), sT2, 'SUM(C5:C16)'); g.celda(3, 17, gesRed(TA.st), sT2, 'SUM(D5:D16)');
    g.celda(4, 17, gesRed(TA.ob+TA.st), sT2, 'SUM(E5:E16)'); g.celda(5, 17, gesRed(TA.hhc), sT2, 'SUM(F5:F16)');
    bajarBlob(X.libro([h, g], E, 'Horas hombre'), nombreArchivo('Horas hombre - '+obra+' - '+ym)+'.xlsx');
    if(bt) bt.disabled=false;
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar el Excel. Revisa tu conexión.'); });
}

/* ══ 3 · ACCIDENTABILIDAD: REGISTRAR EVENTOS, LA ESTADÍSTICA DEL AÑO Y LOS ÍNDICES ═══════════
   Marcelo: «agregar la opción de colocar los índices de accidentabilidad que tiene la empresa».
   Los índices no se escriben: salen de lo registrado, con la cuenta de la app —
     IF = (incapacitantes + mortales) × 1 000 000 ÷ HHT · IS = días perdidos × 1 000 000 ÷ HHT · IA = IF × IS ÷ 1000.
   Lo que faltaba en la web era poder CARGAR lo que los arma:
   · «Registrar un evento», con los mismos campos y las mismas reglas del registro de la app (sst_accidente): la
     app lo baja al sincronizar, y lo que la app registra se abre y se completa aquí;
   · la estadística del año, mes a mes, con los índices del mes y los acumulados, y su Excel;
   · «Cargar meses anteriores»: la estadística que la empresa ya traía (horas hombre y cuántos eventos de cada
     clase, mes por mes), para que el año no empiece en cero el día que se empezó a usar OBRASST. Las horas se
     reparten en los días de trabajo del mes (como «Llenar varios días») y cada evento queda como un registro
     «sin detalle», que después se puede abrir y completar. */
/* las clases, las partes del cuerpo y los agentes: los de la app, letra por letra (armar.py se para si cambian) */
var GES_ACC_CLASES = [
  { k:'casi',     n:'Casi accidente',          ic:'⚠️', cuenta:false, dias:false, d:'Por poco pasa algo. No hubo lesión ni daño, pero pudo haberlo.' },
  { k:'primeros', n:'Primeros auxilios',       ic:'🩹', cuenta:false, dias:false, d:'Se atendió en obra y siguió trabajando el mismo día.' },
  { k:'leve',     n:'Accidente leve',          ic:'🚑', cuenta:false, dias:true,  d:'Necesitó atención médica y volvió sin descanso, o con descanso del mismo día.' },
  { k:'incap',    n:'Accidente incapacitante', ic:'🏥', cuenta:true,  dias:true,  d:'Con descanso médico. Es el que arma el índice de frecuencia.' },
  { k:'mortal',   n:'Accidente mortal',        ic:'⚫', cuenta:true,  dias:true,  d:'Aviso al MTPE dentro de 24 horas. Descanso de 6000 días por norma.' }
];
var GES_ACC_PARTES = ['—','Cabeza','Ojos','Cara','Cuello','Hombro','Brazo','Codo','Antebrazo','Muñeca','Mano','Dedos de la mano','Tórax','Abdomen','Espalda','Columna','Cadera','Pierna','Rodilla','Tobillo','Pie','Dedos del pie','Varias partes','Órganos internos'];
var GES_ACC_AGENTES = ['—','Caída a distinto nivel','Caída al mismo nivel','Caída de objetos','Golpe contra objeto','Atrapamiento','Corte o punzada','Contacto eléctrico','Quemadura','Sobreesfuerzo','Proyección de partículas','Sustancia química','Ruido','Vehículo o maquinaria','Herramienta manual','Derrumbe o desprendimiento','Explosión o incendio','Animal o insecto','Otro'];
function gesAccClase(k){ for(var i=0;i<GES_ACC_CLASES.length;i++) if(GES_ACC_CLASES[i].k===k) return GES_ACC_CLASES[i]; return null; }
var ACCW = { anio:'', accs:[], hht:[], n:0, caja:null, obra:null, gente:null };
var ACC_SIN_DETALLE = 'cargado sin el detalle del evento';
function _accCss(){
  if($('accw-css')) return;
  var st=document.createElement('style'); st.id='accw-css';
  st.textContent=[
    '.acc-anio{display:flex;align-items:center;gap:8px;margin:0 0 14px;flex-wrap:wrap}.acc-anio h2{font-size:18px;min-width:3.2em;text-align:center}',
    '.acc-otros{font-size:13px;color:var(--gris);margin-left:6px}.acc-otros .bt-link{margin-left:8px}',
    '.acc-est{font-size:13px}.acc-est th,.acc-est td{padding:9px 6px}.acc-est th{font-size:11px;letter-spacing:.03em}.acc-est th:first-child,.acc-est td:first-child{padding-left:14px}.acc-est th:last-child,.acc-est td:last-child{padding-right:14px}',
    '.acc-est td.num,.acc-est th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}.acc-est th{white-space:nowrap;cursor:default}.acc-est th:hover{color:var(--gris)}',
    '.acc-est thead tr.g th{text-align:center;padding-bottom:5px;border-bottom:0}.acc-est thead tr.g th[rowspan]{vertical-align:bottom;padding-bottom:9px;border-bottom:1px solid var(--raya)}.acc-est thead tr.g th[rowspan].izq{text-align:left}.acc-est thead tr.g th[rowspan].num{text-align:right}',
    '.acc-est thead tr.s th{padding-top:0}.acc-est tbody tr.con{cursor:pointer}',
    '.acc-est td:first-child{position:sticky;left:0;background:var(--panel)}.acc-est thead th:first-child{position:sticky;left:0;z-index:1}.acc-est tbody tr:hover td:first-child{background:#FAFBFC}',
    '.acc-est tr.tot td{font-weight:600;color:var(--tinta);border-top:2px solid var(--raya2)}.acc-est tr.vac td{color:var(--gris2)}.acc-est tr.fut td{color:var(--gris2)}',
    '.acc-est td.ind{color:var(--tinta);font-weight:500}.acc-est td.mal{color:var(--mal);font-weight:600}.acc-est td.falta{color:var(--ojo);font-size:12.5px;white-space:normal;min-width:120px}',
    '.acc-est th.sep,.acc-est td.sep{border-left:1px solid var(--raya)}',
    '.acc-clases{display:grid;gap:8px;margin:0 0 14px}',
    '.acc-cl{display:flex;gap:10px;align-items:flex-start;text-align:left;border:1px solid var(--raya2);border-radius:10px;background:var(--panel);padding:10px 12px;cursor:pointer;font:inherit;color:var(--texto)}',
    '.acc-cl:hover{background:var(--fondo)}.acc-cl.on{border-color:var(--tinta);box-shadow:inset 0 0 0 1px var(--tinta);background:#F4F8FB}',
    '.acc-cl .ic{font-size:18px;line-height:1.3;flex:0 0 auto}.acc-cl b{display:block;color:var(--tinta);font-weight:600;font-size:14px}.acc-cl small{display:block;color:var(--gris);font-size:12.5px;line-height:1.45}',
    '.acc-foto{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.acc-foto img{width:96px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--raya)}',
    '.acc-hist{border:1px solid var(--raya);border-radius:10px;overflow:auto;background:var(--panel)}',
    '.acc-hist table{border-collapse:collapse;width:100%;font-size:13px}.acc-hist th{background:#FAFBFC;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--gris);font-weight:600;padding:8px 6px;border-bottom:1px solid var(--raya);text-align:center;white-space:nowrap}',
    '.acc-hist th:first-child,.acc-hist td:first-child{text-align:left;padding-left:12px;white-space:nowrap}.acc-hist td{padding:5px 4px;border-bottom:1px solid var(--raya);text-align:center}',
    '.acc-hist tr:last-child td{border-bottom:0}.acc-hist input{width:100%;min-width:56px;padding:7px 6px;text-align:right;font-variant-numeric:tabular-nums}.acc-hist td.hht input{min-width:84px}',
    '.acc-hist td.ya{color:var(--gris);font-variant-numeric:tabular-nums;text-align:right;padding-right:10px;white-space:nowrap}.acc-hist td.ya small{display:block;font-size:11px;color:var(--gris2)}',
    '.acc-hist th.g{border-left:1px solid var(--raya)}.acc-hist td.g{border-left:1px solid var(--raya)}',
    '.acc-pc-h{display:none}.acc-pc-f{display:grid;grid-template-columns:minmax(0,9.2em) minmax(0,1fr) 2.2em;gap:10px;align-items:center;padding:5px 0;font-size:13px}',
    '.acc-pc-f span{display:block;height:10px;border-radius:5px;background:var(--fondo);overflow:hidden}.acc-pc-f i{display:block;height:100%;min-width:2px;border-radius:5px;background:var(--tinta)}.acc-pc-f.mal i{background:var(--mal)}',
    '.acc-pc-f b{text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--tinta)}.acc-pc-f small{font-size:13px;color:var(--texto)}',
    '@media (max-width:640px){',
    '.acc-pc-v{display:none}.acc-pc-h{display:block}',
    '.acc-hist{border:0;background:none;overflow:visible;border-radius:0}.acc-hist table,.acc-hist tbody{display:block}.acc-hist thead{display:none}',
    '.acc-hist tbody tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 8px;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:10px 12px 12px;margin:0 0 10px}',
    '.acc-hist td,.acc-hist td:first-child{display:flex;flex-direction:column;justify-content:flex-end;border:0;padding:0;text-align:left}.acc-hist td.g{border-left:0}',
    '.acc-hist td:first-child{grid-column:1/-1;font-weight:600;color:var(--tinta);font-size:14px}.acc-hist td.hht{grid-column:span 2}',
    '.acc-hist td[data-t]::before{content:attr(data-t);display:block;font-size:11.5px;line-height:1.25;color:var(--gris);margin:0 0 3px}',
    '.acc-hist td.ya{grid-column:1/-1;text-align:left;padding:0;display:block}.acc-hist td.ya small{display:inline;margin-left:6px}.acc-hist input,.acc-hist td.hht input{min-width:0}',
    '}'
  ].join('\n');
  document.head.appendChild(st);
}
function gesVistaAcc(caja){
  _gesCss(); _accCss();
  var oid=(YO.obra||{}).id;
  if(ACCW.obra!==oid){ ACCW.obra=oid; ACCW.anio=''; ACCW.gente=null; ACCW.firma=''; ACCW.estAnio=''; }
  if(!ACCW.anio) ACCW.anio=ANIO;
  ACCW.caja=caja;
  var ac=$('acciones');
  if(ac){
    ac.innerHTML='<button type="button" class="bt sec" id="acc-hist">Cargar meses anteriores</button><button type="button" class="bt" id="acc-nuevo">＋ Registrar un evento</button>';
    $('acc-hist').onclick=function(){ accHistorico(); };
    $('acc-nuevo').onclick=function(){ accForm(null); };
  }
  cargando(caja);
  function pinta(silencio){
    var n=++ACCW.n;
    Promise.all([
      traer('sst_accidente', '&order=fecha.desc', 2000),
      traerTodo('sst_hht', '&select=fecha,ob_n,ob_h,st_n,st_h&order=fecha.desc', 8000)
    ]).then(function(r){
      if(n!==ACCW.n || VISTA.actual!=='acc') return;
      var firma=''; try{ firma=JSON.stringify(r); }catch(e){}
      if(silencio && firma && firma===ACCW.firma && $('t-acc') && document.body.contains(caja)) return;
      ACCW.firma=firma; ACCW.accs=r[0]||[]; ACCW.hht=r[1]||[]; accPintar();
      if(ACCW.alAbrir){ var fn=ACCW.alAbrir; ACCW.alAbrir=null; try{ fn(); }catch(e){} }
    }).catch(function(cod){ if(n!==ACCW.n || VISTA.actual!=='acc') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
/* un mes: sus horas, sus eventos por clase, sus días perdidos y sus índices */
function accIndices(nCuenta, dias, hht){
  var IF=hht ? nCuenta*1e6/hht : null, IS=hht ? dias*1e6/hht : null;
  return { IF:IF, IS:IS, IA:(IF===null ? null : IF*IS/1000) };
}
function accMeses(accs, hht, anio){
  var M=[], i;
  for(i=0;i<12;i++) M.push({ ym:anio+'-'+dos(i+1), hht:0, casi:0, primeros:0, leve:0, incap:0, mortal:0, otros:0, dias:0, n:0, ev:0 });
  (hht||[]).forEach(function(x){ var f=String(x.fecha||''); if(f.slice(0,4)!==String(anio)) return; var m=M[+f.slice(5,7)-1]; if(m) m.hht+=(parseFloat(x.ob_n)||0)*(parseFloat(x.ob_h)||0)+(parseFloat(x.st_n)||0)*(parseFloat(x.st_h)||0); });
  (accs||[]).forEach(function(a){
    var f=String(a.fecha||''); if(f.slice(0,4)!==String(anio)) return; var m=M[+f.slice(5,7)-1]; if(!m) return;
    m.ev++; if(m[a.clase]!==undefined && gesAccClase(a.clase)) m[a.clase]++; else m.otros++;
    m.dias+=parseInt(a.dias, 10)||0; if(ACC_CUENTA[a.clase]) m.n++;
  });
  var T={ ym:'', hht:0, casi:0, primeros:0, leve:0, incap:0, mortal:0, otros:0, dias:0, n:0, ev:0 };
  M.forEach(function(m){
    ['hht', 'casi', 'primeros', 'leve', 'incap', 'mortal', 'otros', 'dias', 'n', 'ev'].forEach(function(k){ T[k]+=m[k]; });
    var I=accIndices(m.n, m.dias, m.hht); m.IF=I.IF; m.IS=I.IS; m.IA=I.IA;
    var A=accIndices(T.n, T.dias, T.hht); m.aIF=A.IF; m.aIS=A.IS; m.aIA=A.IA; m.aHht=T.hht;
  });
  var IT=accIndices(T.n, T.dias, T.hht); T.IF=IT.IF; T.IS=IT.IS; T.IA=IT.IA;
  return { meses:M, total:T };
}
function _accInd(v, dec){ return v===null ? '—' : v.toFixed(dec==null ? 2 : dec); }
function accPintar(){
  var caja=ACCW.caja; if(!caja || !document.body.contains(caja)) return;
  var accs=ACCW.accs, hht=ACCW.hht, A=String(ACCW.anio), esHoy=(A===ANIO);
  var anio=accs.filter(function(a){ return anioDe(a.fecha)===A; });
  var E=accMeses(accs, hht, A), T=E.total, H=T.hht;
  var ultimo=null; anio.forEach(function(a){ if(ACC_CUENTA[a.clase] || a.clase==='leve'){ if(!ultimo || a.fecha>ultimo) ultimo=a.fecha; } });
  var racha=ultimo ? Math.max(0, Math.floor((new Date(HOY)-new Date(ultimo))/86400000)) : null;
  var anios={}; anios[ANIO]=1; accs.forEach(function(a){ var y=anioDe(a.fecha); if(/^\d{4}$/.test(y)) anios[y]=1; }); hht.forEach(function(x){ var y=anioDe(x.fecha); if(/^\d{4}$/.test(y)) anios[y]=1; });
  var h='<div class="acc-anio"><button type="button" class="bt sec chico" id="acc-ant" aria-label="Año anterior">‹</button><h2 id="acc-tit">'+esc(A)+'</h2>'+
    '<button type="button" class="bt sec chico" id="acc-sig" aria-label="Año siguiente"'+(esHoy ? ' disabled' : '')+'>›</button>'+
    (esHoy ? '' : '<button type="button" class="bt sec chico" id="acc-hoy">Este año</button>')+
    (function(){ var o=Object.keys(anios).filter(function(y){ return y!==A && y!==ANIO && y<=ANIO; }).sort().reverse().slice(0, 6);
      return o.length ? '<span class="acc-otros" id="acc-otros">También hay registros de'+o.map(function(y){ return ' <button type="button" class="bt-link" data-anio="'+esc(y)+'">'+esc(y)+'</button>'; }).join('')+'</span>' : ''; })()+'</div>';
  h+='<div class="rej">'+
    cifra('Horas hombre '+A, Math.round(H).toLocaleString('es-PE'), 'de lo registrado en «Horas hombre»', '')+
    cifra('Índice de frecuencia', T.IF===null ? '—' : T.IF.toFixed(2), 'incapacitantes × 10⁶ / HHT', T.IF===null ? '' : (T.IF>3 ? 'mal' : 'ok'))+
    cifra('Índice de severidad', T.IS===null ? '—' : T.IS.toFixed(1), 'días perdidos × 10⁶ / HHT', T.IS===null ? '' : (T.IS>50 ? 'mal' : 'ok'))+
    cifra('Índice de accidentabilidad', T.IA===null ? '—' : T.IA.toFixed(2), 'IF × IS / 1000', '')+
    (esHoy ? cifra('Días sin accidente con lesión', racha===null ? '—' : racha, ultimo ? 'desde el '+fechaLarga(ultimo) : 'ninguno registrado este año', racha===null ? 'ok' : '') : '')+
    '</div>';
  if(!H && anio.length) h+='<div class="aviso ojo" id="acc-sin-hht"><b>Faltan las horas hombre de '+esc(A)+'.</b> Sin ellas los índices no salen: son el divisor de los tres. '+
    '<span class="acciones" style="display:inline-flex;margin:0 0 0 6px"><button type="button" class="bt sec chico" id="acc-ir-hh">Cargarlas en «Horas hombre»</button></span></div>';
  var porClase=Object.keys(ACC_NOMBRE).map(function(k){ return { t:ACC_NOMBRE[k], v:anio.filter(function(a){ return a.clase===k; }).length, cl:ACC_CUENTA[k] ? 'mal' : '' }; });
  var maxPC=Math.max.apply(null, porClase.map(function(x){ return x.v; }).concat([1]));
  h+='<div class="tarj" id="acc-clase"><div class="tarj-cab"><div><h2>Por clase · '+esc(A)+'</h2><p class="sub">Solo incapacitantes y mortales entran al índice de frecuencia</p></div></div><div class="tarj-cuerpo">'+
     '<div class="acc-pc-v">'+barras(porClase)+'</div>'+
     '<div class="acc-pc-h">'+porClase.map(function(x){ return '<div class="acc-pc-f'+(x.cl ? ' '+x.cl : '')+'"><small>'+esc(x.t)+'</small><span>'+(x.v ? '<i style="width:'+Math.max(3, Math.round(x.v/maxPC*100))+'%"></i>' : '')+'</span><b>'+x.v+'</b></div>'; }).join('')+'</div>'+
     '</div></div>';
  /* la estadística del año, mes a mes */
  var mesHoy=esHoy ? +MES.slice(5,7) : 12, filas='';
  E.meses.forEach(function(m, i){
    var fut=(i+1>mesHoy), vac=!m.hht && !m.ev, faltaH=(!m.hht && m.ev>0);
    function n(v){ return v ? v : (vac || fut ? '—' : '0'); }
    filas+='<tr data-ym="'+m.ym+'" class="'+(fut ? 'fut' : (vac ? 'vac' : ''))+(m.ev ? ' con' : '')+'"'+(m.ev ? ' title="Ver '+(m.ev===1 ? 'el evento' : 'los '+m.ev+' eventos')+' de '+esc(DC_MESES[i].toLowerCase())+'"' : '')+'><td>'+esc(DC_MESES[i])+'</td>'+
      '<td class="num">'+(m.hht ? gesNum(m.hht, 0) : (faltaH ? '<span class="pill ojo">faltan</span>' : '—'))+'</td>'+
      '<td class="num sep">'+n(m.casi)+'</td><td class="num">'+n(m.primeros)+'</td><td class="num">'+n(m.leve)+'</td><td class="num'+(m.incap ? ' mal' : '')+'">'+n(m.incap)+'</td><td class="num'+(m.mortal ? ' mal' : '')+'">'+n(m.mortal)+'</td>'+
      '<td class="num">'+n(m.dias)+'</td>'+
      '<td class="num sep ind">'+_accInd(m.IF)+'</td><td class="num ind">'+_accInd(m.IS, 1)+'</td><td class="num ind">'+_accInd(m.IA)+'</td>'+
      '<td class="num sep">'+(fut ? '—' : _accInd(m.aIF))+'</td><td class="num">'+(fut ? '—' : _accInd(m.aIS, 1))+'</td><td class="num">'+(fut ? '—' : _accInd(m.aIA))+'</td></tr>';
  });
  h+='<div class="tarj" id="acc-mes"><div class="tarj-cab"><div><h2>'+esc(A)+', mes a mes</h2><p class="sub">Los índices de cada mes y los acumulados del año · IF e IS por millón de horas hombre</p></div>'+
     '<div class="acciones"><button type="button" class="bt sec chico" id="acc-excel">Exportar a Excel</button></div></div>'+
     '<div class="tabla-caja"><table class="acc-est"><thead>'+
     '<tr class="g"><th rowspan="2" class="izq" scope="col">Mes</th><th rowspan="2" class="num" scope="col" title="Horas hombre trabajadas">HHT</th><th colspan="5" class="sep" scope="colgroup">Eventos</th><th rowspan="2" class="num" scope="col" title="Días perdidos (descanso médico)">Días perd.</th>'+
     '<th colspan="3" class="sep" scope="colgroup">Índices del mes</th><th colspan="3" class="sep" scope="colgroup">Acumulado del año</th></tr>'+
     '<tr class="s"><th class="num sep" scope="col" title="Casi accidentes">Casi acc.</th><th class="num" scope="col" title="Primeros auxilios">P. aux.</th><th class="num" scope="col">Leves</th><th class="num" scope="col" title="Incapacitantes">Incap.</th><th class="num" scope="col" title="Mortales">Mort.</th>'+
     '<th class="num sep" scope="col" title="Índice de frecuencia del mes">IF</th><th class="num" scope="col" title="Índice de severidad del mes">IS</th><th class="num" scope="col" title="Índice de accidentabilidad del mes">IA</th>'+
     '<th class="num sep" scope="col" title="Índice de frecuencia acumulado del año">IF</th><th class="num" scope="col" title="Índice de severidad acumulado del año">IS</th><th class="num" scope="col" title="Índice de accidentabilidad acumulado del año">IA</th></tr></thead><tbody>'+filas+
     '<tr class="tot"><td>'+esc(A)+'</td><td class="num">'+gesNum(T.hht, 0)+'</td><td class="num sep">'+T.casi+'</td><td class="num">'+T.primeros+'</td><td class="num">'+T.leve+'</td><td class="num">'+T.incap+'</td><td class="num">'+T.mortal+'</td><td class="num">'+T.dias+'</td>'+
     '<td class="num sep">'+_accInd(T.IF)+'</td><td class="num">'+_accInd(T.IS, 1)+'</td><td class="num">'+_accInd(T.IA)+'</td><td class="num sep" colspan="3"></td></tr></tbody></table></div></div>';
  /* el aviso del accidente del país de la obra (ACC_AVISO de la app): a quién, en cuánto tiempo, y cuáles no lo tienen marcado */
  var cols=COL.accidentes, av=paisListo() ? accAviso() : null;
  if(av){
    var pend=anio.filter(function(a){ return av.clases[a.clase] && !a.mtpe; }).length;
    h+='<div class="aviso'+(pend?' ojo':'')+' acc-aviso"><b>Aviso del accidente · '+esc(paisInfoP().n)+'.</b> '+esc(_sinMarca(av.sub))+
       (pend ? ' <b>'+pend+(pend===1?' evento de '+A+' todavía no tiene':' eventos de '+A+' todavía no tienen')+' el aviso marcado</b> (se marca al abrir el evento, aquí o en la app).' : '')+'</div>';
    cols=COL.accidentes.concat([{k:'mtpe', t:av.col,
      h:function(f){ return !av.clases[f.clase] ? '<span class="gris-t">No aplica</span>' : (f.mtpe ? '<span class="pill ok">Sí</span>' : '<span class="pill ojo">Pendiente</span>'); },
      v:function(f){ return !av.clases[f.clase] ? 'No aplica' : (f.mtpe ? 'Sí' : 'Pendiente'); }}]);
  }
  h+='<div class="tarj" id="t-acc"></div>';
  var estAntes=($('t-acc') && ACCW.estAnio===A) ? $('t-acc')._est : null;
  caja.innerHTML=h;
  if(estAntes) $('t-acc')._est=estAntes;
  ACCW.estAnio=A;
  /* la lista es la del año que se mira (lo que llegó sin fecha no se esconde: sale con el año en curso) */
  var lista=accs.filter(function(a){ var y=anioDe(a.fecha); return y===A || (esHoy && !/^\d{4}$/.test(y)); });
  tabla($('t-acc'), cols, lista, {orden:'fecha', asc:false, unidad:'eventos', vacio:'Ningún evento registrado en '+A, vacioSub:'Regístralo aquí o desde la app: es el mismo registro. Si no hubo ninguno, el registro igual tiene que existir.', archivo:'accidentes-'+A,
    alClic:function(f){ accForm(f); }});
  function ir(y){ ACCW.anio=String(y); accPintar(); }
  $('acc-ant').onclick=function(){ ir(+A-1); };
  $('acc-sig').onclick=function(){ if(!esHoy) ir(+A+1); };
  if($('acc-hoy')) $('acc-hoy').onclick=function(){ ir(ANIO); };
  if($('acc-otros')) $('acc-otros').onclick=function(ev){ var b=ev.target.closest('[data-anio]'); if(b) ir(b.getAttribute('data-anio')); };
  if($('acc-ir-hh')) $('acc-ir-hh').onclick=function(){ HHW.ym=(esHoy ? MES : A+'-01'); navegar('hh'); };
  $('acc-excel').onclick=function(){ accExcel(this); };
  Array.prototype.forEach.call(caja.querySelectorAll('.acc-est tbody tr.con'), function(tr){
    tr.onclick=function(){ var q=$('t-acc-q'); if(!q) return; var ym=tr.getAttribute('data-ym'); q.value=ym; q.dispatchEvent(new Event('input')); try{ $('t-acc').scrollIntoView({block:'start', behavior:'smooth'}); }catch(e){} };
  });
}
/* ── el evento: registrarlo, abrirlo, completarlo, quitarlo ─────────────────────────────────── */
var ACCF = { f:null, clase:'casi', mtpe:false, foto:null, fotoUrl:'' };
function _accGente(){
  if(ACCW.gente) return Promise.resolve(ACCW.gente);
  return traerTodo('sst_trabajador', '&select=id,nombre,dni,td,puesto,estatus&order=nombre.asc', 5000).then(function(l){ ACCW.gente=(l||[]).filter(function(t){ return String(t.estatus||'activo')!=='cesado'; }); return ACCW.gente; }, function(){ return []; });
}
function accForm(f){
  _gesCss(); _accCss();
  var nuevo=!f, hoy=hoyISO(), d=new Date();
  ACCF.f=f||null; ACCF.clase=(f && gesAccClase(f.clase)) ? f.clase : 'casi'; ACCF.mtpe=!!(f && f.mtpe); ACCF.foto=null; ACCF.fotoUrl=(f && f.foto_url) || '';
  var tipos=[]; try{ tipos=(docPais(paisObraP()).tipos||[]).slice(); }catch(e){ tipos=[['DNI', 'DNI']]; }
  if(f && f.t_tipodoc && !tipos.some(function(t){ return t[0]===f.t_tipodoc; })) tipos.unshift([f.t_tipodoc, f.t_tipodoc]);
  var v=function(k){ return f ? (f[k]==null ? '' : String(f[k])) : ''; };
  var rara=(f && !gesAccClase(f.clase)) ? '<div class="aviso ojo">Este evento vino con una clase que ya no se usa («'+esc(f.clase)+'»). Elige la que le corresponde y guarda.</div>' : '';
  var h=rara+
    '<div class="campo"><label id="accf-cl-t">¿Qué pasó?</label><div class="acc-clases" id="accf-clases" role="radiogroup" aria-labelledby="accf-cl-t"></div></div>'+
    '<div class="fila-c"><div class="campo"><label for="accf-fecha">Fecha del evento</label><input type="date" id="accf-fecha" max="'+hoy+'" value="'+esc(f ? String(f.fecha||'').slice(0,10) : hoy)+'"></div>'+
    '<div class="campo"><label for="accf-hora">Hora</label><input type="time" id="accf-hora" value="'+esc(f ? (f.hora||'') : dos(d.getHours())+':'+dos(d.getMinutes()))+'"></div></div>'+
    '<div class="seccion"><h3>A quién le pasó</h3>'+
    '<div class="campo"><label for="accf-nombre">Trabajador</label><input id="accf-nombre" maxlength="120" list="accf-gente" autocomplete="off" placeholder="Escribe su nombre o elígelo de tu personal" value="'+esc(v('t_nombre'))+'"><datalist id="accf-gente" data-sin-pais></datalist></div>'+
    '<div class="fila-c"><div class="campo"><label for="accf-td">Documento</label><select id="accf-td" data-sin-pais>'+tipos.map(function(t){ return '<option value="'+esc(t[0])+'"'+((v('t_tipodoc')||tipos[0][0])===t[0] ? ' selected' : '')+'>'+esc(t[1])+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label for="accf-doc">Número</label><input id="accf-doc" maxlength="20" autocomplete="off" value="'+esc(v('t_doc'))+'"></div>'+
    '<div class="campo"><label for="accf-puesto">Puesto</label><input id="accf-puesto" maxlength="80" value="'+esc(v('t_puesto'))+'"></div></div></div>'+
    '<div class="seccion"><h3>El evento</h3>'+
    '<div class="campo"><label for="accf-lugar">Lugar</label><input id="accf-lugar" maxlength="120" placeholder="Torre B, piso 3" value="'+esc(v('lugar'))+'"></div>'+
    '<div class="campo"><label for="accf-desc">Qué pasó</label><textarea id="accf-desc" rows="4" maxlength="1500" placeholder="Cuenta qué pasó, aunque sea en dos líneas: es lo que se lee en la investigación.">'+esc(v('descripcion'))+'</textarea></div>'+
    '<div class="fila-c"><div class="campo"><label for="accf-parte">Parte del cuerpo</label><select id="accf-parte">'+GES_ACC_PARTES.map(function(x){ return '<option'+((v('parte')||'—')===x ? ' selected' : '')+'>'+esc(x)+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label for="accf-agente">Agente</label><select id="accf-agente">'+GES_ACC_AGENTES.map(function(x){ return '<option'+((v('agente')||'—')===x ? ' selected' : '')+'>'+esc(x)+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo" id="accf-dias-c"><label for="accf-dias">Días de descanso médico</label><input type="number" id="accf-dias" inputmode="numeric" min="0" max="6000" step="1" value="'+esc(f ? (parseInt(f.dias, 10)||0) : 0)+'"></div></div>'+
    '<label class="chk" id="accf-mtpe-c" hidden><input type="checkbox" id="accf-mtpe"> <span><span id="accf-mtpe-et"></span> <small class="tenue" id="accf-mtpe-sub"></small></span></label></div>'+
    '<div class="seccion"><h3>La investigación</h3>'+
    '<div class="campo"><label for="accf-causas">Causas</label><textarea id="accf-causas" rows="2" maxlength="1500">'+esc(v('causas'))+'</textarea></div>'+
    '<div class="campo"><label for="accf-medidas">Medidas correctivas</label><textarea id="accf-medidas" rows="2" maxlength="1500">'+esc(v('medidas'))+'</textarea></div>'+
    '<div class="fila-c"><div class="campo"><label for="accf-resp">Responsable</label><input id="accf-resp" maxlength="80" value="'+esc(v('responsable'))+'"></div>'+
    '<div class="campo"><label for="accf-plazo">Plazo</label><input type="date" id="accf-plazo" value="'+esc(String(v('plazo')).slice(0,10))+'"></div></div>'+
    '<div class="campo"><label for="accf-foto">Foto del lugar <span class="tenue">· opcional</span></label><div class="acc-foto" id="accf-foto-c"></div></div></div>'+
    '<div class="msg" id="accf-msg" role="status"></div>';
  abrirHoja(nuevo ? 'Registrar un evento' : (gesAccClase(f.clase) ? gesAccClase(f.clase).n : 'Evento')+' · '+fechaLarga(f.fecha), nuevo ? 'El mismo registro de «Accidentes e incidentes» de la app' : 'Lo que guardes aquí lo ve la app',
    h, (nuevo ? '' : '<button type="button" class="bt mal" id="accf-quitar">Quitar</button>')+'<button type="button" class="bt" id="accf-ok">'+(nuevo ? 'Guardar el evento' : 'Guardar los cambios')+'</button>',
    nuevo ? {sinFoco:true} : {sinFoco:true, id:f.id, tabla:'sst_accidente', alCambio:function(tipo){ if(tipo==='DELETE') hojaAvisar('Este evento se quitó desde la app.'); else if(!ACCF.guardando) hojaAvisar('Alguien acaba de cambiar este evento desde la app.'); }});
  $('accf-clases').onclick=function(ev){ var b=ev.target.closest('[data-k]'); if(!b) return; ACCF.clase=b.getAttribute('data-k'); _accfClases(true); };
  $('accf-mtpe').onchange=function(){ ACCF.mtpe=this.checked; };
  $('accf-ok').onclick=_accfGuardar;
  if($('accf-quitar')) $('accf-quitar').onclick=_accfQuitar;
  _accGente().then(function(g){
    var dl=$('accf-gente'); if(!dl) return;
    dl.innerHTML=g.map(function(t){ return '<option value="'+esc(t.nombre)+'">'+esc([t.dni ? (t.td||docPersonaP())+' '+t.dni : '', t.puesto].filter(Boolean).join(' · '))+'</option>'; }).join('');
  });
  /* al elegir a alguien del personal: su documento y su puesto, como en la app */
  $('accf-nombre').addEventListener('change', function(){
    var n=nrm(this.value), t=(ACCW.gente||[]).filter(function(x){ return nrm(x.nombre)===n; })[0]; if(!t) return;
    $('accf-doc').value=t.dni||''; $('accf-puesto').value=t.puesto||'';
    var s=$('accf-td'); if(t.td && [].some.call(s.options, function(o){ return o.value===t.td; })) s.value=t.td; else if(s.options.length) s.value=s.options[0].value;
  });
  _accfClases(false); _accfFoto();
}
function _accfClases(cambio){
  var c=$('accf-clases'); if(!c) return;
  c.innerHTML=GES_ACC_CLASES.map(function(x){ var on=(x.k===ACCF.clase);
    return '<button type="button" role="radio" class="acc-cl'+(on?' on':'')+'" aria-checked="'+(on?'true':'false')+'" data-k="'+x.k+'"><span class="ic" aria-hidden="true">'+x.ic+'</span><span><b>'+esc(x.n)+'</b><small>'+esc(x.d)+'</small></span></button>'; }).join('');
  var C=gesAccClase(ACCF.clase)||GES_ACC_CLASES[0], av=paisListo() ? accAviso() : null;
  $('accf-dias-c').hidden=!C.dias;
  if(cambio && ACCF.clase==='mortal' && (parseInt($('accf-dias').value, 10)||0)===0) $('accf-dias').value='6000';
  var m=$('accf-mtpe-c');
  if(av && av.clases[ACCF.clase]){ m.hidden=false; $('accf-mtpe').checked=ACCF.mtpe; $('accf-mtpe-et').textContent=av.et; $('accf-mtpe-sub').textContent='· '+_sinMarca(av.sub); }
  else m.hidden=true;
}
function _accfFoto(){
  var c=$('accf-foto-c'); if(!c) return;
  var src=ACCF.foto ? ACCF.foto.vista : (/^https?:\/\//i.test(ACCF.fotoUrl) ? ACCF.fotoUrl : '');
  c.innerHTML=(src ? '<a href="'+esc(src)+'" target="_blank" rel="noopener"><img src="'+esc(src)+'" alt="Foto del lugar"></a><button type="button" class="bt sec chico" id="accf-foto-x">Quitar la foto</button>' : '')+
    '<input type="file" id="accf-foto" accept="image/*"'+(src ? ' hidden' : '')+'>';
  $('accf-foto').onchange=function(){
    var fl=this.files && this.files[0]; if(!fl) return;
    if(!/^image\//.test(fl.type||'')){ toast('Tiene que ser una foto (JPG o PNG).'); this.value=''; return; }
    _gesFotoChica(fl, 1280, 0.82).then(function(x){ ACCF.foto=x; _accfFoto(); }, function(){ toast('No se pudo leer esa foto.'); });
  };
  if($('accf-foto-x')) $('accf-foto-x').onclick=function(){ ACCF.foto=null; ACCF.fotoUrl=''; _accfFoto(); };
}
/* una foto, achicada antes de subir (como hace la app: lado mayor y calidad) → {blob, vista} */
function _gesFotoChica(file, lado, calidad){
  return new Promise(function(res, rej){
    var url=URL.createObjectURL(file), im=new Image();
    im.onload=function(){
      try{
        var k=Math.min(1, lado/Math.max(im.naturalWidth, im.naturalHeight)), w=Math.max(1, Math.round(im.naturalWidth*k)), hh=Math.max(1, Math.round(im.naturalHeight*k));
        var cv=document.createElement('canvas'); cv.width=w; cv.height=hh; var g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0, 0, w, hh); g.drawImage(im, 0, 0, w, hh);
        cv.toBlob(function(b){ URL.revokeObjectURL(url); if(!b) return rej('sin_foto'); res({ blob:b, vista:URL.createObjectURL(b) }); }, 'image/jpeg', calidad||0.82);
      }catch(e){ URL.revokeObjectURL(url); rej(e); }
    };
    im.onerror=function(){ URL.revokeObjectURL(url); rej('sin_foto'); };
    im.src=url;
  });
}
function _accfGuardar(){
  var m=$('accf-msg'), bt=$('accf-ok'), f=ACCF.f, hoy=hoyISO();
  var mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} };
  var v=function(id){ return gesTxt(($(id)||{}).value); };
  var fe=$('accf-fecha').value, nom=v('accf-nombre'), desc=String($('accf-desc').value||'').trim(), C=gesAccClase(ACCF.clase);
  /* las reglas de la app, una por una */
  if(!fe) return mal('Falta la fecha del evento.', 'accf-fecha');
  if(fe>hoy) return mal('Esa fecha todavía no llega. Revísala.', 'accf-fecha');
  if(ACCF.clase!=='casi' && nom.length<3) return mal('Falta el nombre del trabajador.', 'accf-nombre');
  if(desc.length<15) return mal('Cuenta qué pasó, aunque sea en dos líneas. Es lo que se lee en la investigación.', 'accf-desc');
  var dias=C.dias ? (parseInt($('accf-dias').value, 10)||0) : 0;
  if(dias<0 || dias>6000) return mal('Revisa los días de descanso.', 'accf-dias');
  if(ACCF.clase==='incap' && dias<1) return mal('Un accidente incapacitante lleva al menos 1 día de descanso. Si no hubo descanso, es un accidente leve.', 'accf-dias');
  var av=paisListo() ? accAviso() : null;
  var p={ fecha:fe, hora:$('accf-hora').value||null, clase:ACCF.clase, t_nombre:nom, t_tipodoc:$('accf-td').value||null,
          t_doc:(typeof docPersonaNorm==='function' ? docPersonaNorm($('accf-td').value, v('accf-doc')) : v('accf-doc')), t_puesto:v('accf-puesto'),
          lugar:v('accf-lugar'), descripcion:desc.slice(0, 1500), parte:$('accf-parte').value, agente:$('accf-agente').value, dias:dias,
          causas:String($('accf-causas').value||'').trim(), medidas:String($('accf-medidas').value||'').trim(), responsable:v('accf-resp'), plazo:$('accf-plazo').value||null,
          mtpe:!!(av && av.clases[ACCF.clase] && ACCF.mtpe) };
  bt.disabled=true; m.className='msg gris'; m.textContent=ACCF.foto ? 'Subiendo la foto…' : 'Guardando…';
  ACCF.guardando=true;
  var foto=ACCF.foto ? subirFoto('accidentes', ACCF.foto.blob, 'accidente.jpg') : Promise.resolve(ACCF.fotoUrl||null);
  foto.then(function(url){
    p.foto_url=url||null; m.textContent='Guardando…';
    if(f) return sbPatch('sst_accidente?id=eq.'+encodeURIComponent(f.id), p);
    p.empresa=YO.obra.id; p.ext='x'+Date.now().toString(36)+Math.random().toString(36).slice(2, 5);
    return sbPostP('sst_accidente', p);
  }).then(function(rows){
    ACCF.guardando=false;
    if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:f ? 'No se guardó: el evento ya no está o esta cuenta no puede editarlo.' : 'No se guardó: esta cuenta no puede registrar en esta obra.'});
    var falta=(av && av.clases[p.clase] && !p.mtpe) ? String(av.nota||'') : '';
    toast((f ? 'Guardado. La app lo ve al sincronizar.' : 'Evento registrado. La app lo recibe al sincronizar.')+falta);
    cerrarHoja(); ACCW.anio=fe.slice(0,4);
    if(typeof VISTA.recargar==='function') VISTA.recargar(true);
  }).catch(function(e){ ACCF.guardando=false; bt.disabled=false; mal('No se pudo guardar. '+porQueFallo(e)); });
}
function _accfQuitar(){
  var f=ACCF.f; if(!f) return;
  var C=gesAccClase(f.clase);
  confirmar('¿Quitar este evento del registro?', (C ? C.n : 'El evento')+' del '+fechaLarga(f.fecha)+(f.t_nombre ? ' · '+f.t_nombre : '')+'. Se borra aquí y en la app, y los índices se recalculan sin él. El registro de accidentes es obligatorio: quítalo solo si se cargó por error.', {si:'Sí, quitarlo', mal:true}).then(function(si){
    if(!si) return;
    ACCF.guardando=true;
    sbDelP('sst_accidente?id=eq.'+encodeURIComponent(f.id)).then(function(rows){
      ACCF.guardando=false;
      if(Array.isArray(rows) && !rows.length){ toast('No se pudo quitar: esta cuenta no puede borrar en esta obra.'); return; }
      toast('Evento quitado.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    }, function(e){ ACCF.guardando=false; toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}
/* ── cargar la estadística de meses anteriores ──────────────────────────────────────────────── */
var ACCH = { anio:'', E:null };
var ACCH_COLS = [['casi', 'Casi acc.', 'Casi accidentes'], ['primeros', 'P. aux.', 'Primeros auxilios'], ['leve', 'Leves', 'Leves'], ['incap', 'Incap.', 'Incapacitantes'], ['mortal', 'Mortales', 'Mortales']];
function accHistorico(anio){
  _gesCss(); _accCss(); _hhCss();
  ACCH.anio=String(anio || ACCW.anio || ANIO);
  var A=ACCH.anio, esHoy=(A===ANIO), hasta=esHoy ? +MES.slice(5,7) : 12, E=accMeses(ACCW.accs, ACCW.hht, A); ACCH.E=E;
  var filas='';
  for(var i=0;i<hasta;i++){
    var m=E.meses[i], ym=m.ym;
    filas+='<tr data-ym="'+ym+'"><td>'+esc(DC_MESES[i])+'</td>'+
      (m.hht ? '<td class="ya" colspan="2">'+gesNum(m.hht, 0)+' HHT<small>ya registradas</small></td>'
             : '<td data-t="Trabajadores"><input type="number" inputmode="numeric" min="0" max="9999" step="1" data-c="trab" aria-label="Trabajadores en promedio, '+esc(DC_MESES[i])+'"></td><td class="hht" data-t="Horas hombre del mes"><input type="number" inputmode="decimal" min="0" step="0.01" data-c="hht" aria-label="Horas hombre, '+esc(DC_MESES[i])+'"></td>')+
      (m.ev ? '<td class="ya g" colspan="6">'+gesPlural(m.ev, 'evento ya registrado', 'eventos ya registrados')+(m.dias ? ' · '+gesPlural(m.dias, 'día perdido', 'días perdidos') : '')+'</td>'
            : ACCH_COLS.map(function(c, k){ return '<td'+(k===0 ? ' class="g"' : '')+' data-t="'+esc(c[2])+'"><input type="number" inputmode="numeric" min="0" max="999" step="1" data-c="'+c[0]+'" aria-label="'+esc(c[2]+', '+DC_MESES[i])+'"></td>'; }).join('')+
              '<td data-t="Días perdidos"><input type="number" inputmode="numeric" min="0" max="99999" step="1" data-c="dias" aria-label="Días perdidos, '+esc(DC_MESES[i])+'"></td>')+'</tr>';
  }
  var h='<p style="margin:0 0 12px">La estadística que tu empresa ya llevaba, mes por mes: con eso los índices del año salen completos, no desde el día en que empezaste a usar OBRASST.</p>'+
    '<div class="acc-anio"><button type="button" class="bt sec chico" id="acch-ant" aria-label="Año anterior">‹</button><h2 id="acch-tit">'+esc(A)+'</h2><button type="button" class="bt sec chico" id="acch-sig" aria-label="Año siguiente"'+(esHoy ? ' disabled' : '')+'>›</button></div>'+
    '<div class="acc-hist"><table><thead><tr><th>Mes</th><th title="Cuántos trabajadores hubo en promedio ese mes">Trabaj. (prom.)</th><th>Horas hombre</th>'+ACCH_COLS.map(function(c, k){ return '<th'+(k===0 ? ' class="g"' : '')+' title="'+esc(c[2])+'">'+esc(c[1])+'</th>'; }).join('')+'<th title="Días perdidos (descanso médico)">Días perd.</th></tr></thead><tbody>'+filas+'</tbody></table></div>'+
    '<p class="ayuda">Llena solo lo que tengas; lo que dejes vacío no se toca. Los meses que ya tienen horas o eventos registrados no se pisan desde aquí: se corrigen en «Horas hombre» o abriendo el evento.</p>'+
    '<div class="campo" style="margin-top:12px"><label>Las horas de cada mes se reparten en sus días de trabajo</label><div class="hh-dias chips" id="acch-dias">'+[1, 2, 3, 4, 5, 6, 0].map(function(d){
      var on=HHV.dias.indexOf(d)>-1; return '<button type="button" class="chip'+(on?' on':'')+'" aria-pressed="'+(on?'true':'false')+'" data-d="'+d+'">'+esc(HH_DIAS[d].charAt(0).toUpperCase()+HH_DIAS[d].slice(1, 3))+'</button>'; }).join('')+'</div></div>'+
    '<div class="aviso" style="margin:12px 0 0">Cada accidente se guarda como un evento <b>sin detalle</b>, con la fecha del último día de su mes. Después puedes abrir cada uno y completarlo (a quién, qué pasó, las causas).</div>'+
    '<div class="msg" id="acch-msg" role="status"></div><div class="hh-total" id="acch-res"></div>';
  abrirHoja('Cargar meses anteriores', 'La estadística de '+A+', como la tienes en tu Excel', h, '<button type="button" class="bt" id="acch-ok">Guardar</button>', {ancha:true, sinFoco:true});
  $('acch-ant').onclick=function(){ accHistorico(+A-1); };
  $('acch-sig').onclick=function(){ if(!esHoy) accHistorico(+A+1); };
  $('acch-dias').onclick=function(ev){ var b=ev.target.closest('[data-d]'); if(!b) return; var d=+b.getAttribute('data-d'), i=HHV.dias.indexOf(d);
    if(i>-1) HHV.dias.splice(i, 1); else HHV.dias.push(d);
    b.className='chip'+(i>-1?'':' on'); b.setAttribute('aria-pressed', i>-1?'false':'true'); _acchCalc(); };
  Array.prototype.forEach.call(document.querySelectorAll('.acc-hist input'), function(x){ x.addEventListener('input', _acchCalc); });
  $('acch-ok').onclick=_acchGuardar;
  _acchCalc();
}
/* lo escrito → las filas de horas hombre y los eventos que se van a crear */
function _acchPlan(){
  var A=ACCH.anio, hoy=hoyISO(), P={ error:'', foco:null, hh:[], ev:[], meses:0, hht:0, nEv:0, dias:0 };
  var trs=document.querySelectorAll('.acc-hist tbody tr[data-ym]');
  for(var t=0; t<trs.length; t++){
    var tr=trs[t], ym=tr.getAttribute('data-ym'), mes=DC_MESES[+ym.slice(5,7)-1].toLowerCase(), toco=false;
    var val=function(c){ var e=tr.querySelector('input[data-c="'+c+'"]'); if(!e) return null; var n=parseFloat(String(e.value||'').replace(',', '.')); return (isNaN(n) || n<0) ? 0 : n; };
    var el=function(c){ return tr.querySelector('input[data-c="'+c+'"]'); };
    var hht=val('hht'), trab=val('trab');
    if(hht!==null && (hht || trab)){
      if(!hht){ P.error='En '+mes+' pusiste cuántos trabajadores pero no las horas hombre.'; P.foco=el('hht'); return P; }
      trab=Math.round(trab||0);
      if(!trab){ P.error='En '+mes+' falta cuántos trabajadores hubo en promedio: con eso se reparten las horas.'; P.foco=el('trab'); return P; }
      if(!HHV.dias.length){ P.error='Marca al menos un día de la semana.'; return P; }
      var dias=[], a=+ym.slice(0,4), mo=+ym.slice(5,7)-1, nd=new Date(a, mo+1, 0).getDate();
      for(var d=1; d<=nd; d++){ var iso=ym+'-'+dos(d); if(iso>hoy) break; if(HHV.dias.indexOf(new Date(a, mo, d).getDay())>-1) dias.push(iso); }
      if(!dias.length){ P.error='En '+mes+' no cae ninguno de los días de trabajo marcados.'; return P; }
      if(hht/(trab*dias.length)>24){ P.error='En '+mes+' salen más de 24 horas por persona al día: revisa las horas o el promedio de trabajadores.'; P.foco=el('hht'); return P; }
      var hDia=gesRed(hht/(trab*dias.length), 4);
      dias.forEach(function(iso, i){ P.hh.push({ duenio:YO.obra.id, fecha:iso, ob_n:trab, ob_h:(i===dias.length-1 ? gesRed((hht-hDia*trab*(dias.length-1))/trab, 6) : hDia), st_n:0, st_h:0, hhc:0 }); });
      P.hht+=hht; toco=true;
    }
    if(el('casi')){
      var cu={}, tot=0; ACCH_COLS.forEach(function(c){ cu[c[0]]=Math.round(val(c[0])||0); tot+=cu[c[0]]; });
      var dp=Math.round(val('dias')||0);
      if(dp && !(cu.incap || cu.mortal || cu.leve)){ P.error='En '+mes+' hay días perdidos pero ningún accidente al que correspondan.'; P.foco=el('incap'); return P; }
      if(cu.incap && dp<cu.incap && !cu.mortal){ P.error='En '+mes+': cada accidente incapacitante lleva al menos 1 día perdido ('+cu.incap+' → al menos '+cu.incap+').'; P.foco=el('dias'); return P; }
      if(tot){
        var fin=_ultimoDia(ym); if(fin>hoy) fin=hoy;
        /* los días perdidos van a los incapacitantes (parejo, el resto al primero); sin incapacitantes, a los mortales; si no, a los leves */
        var quien=cu.incap ? 'incap' : (cu.mortal ? 'mortal' : 'leve'), nq=cu[quien]||0, base=nq ? Math.floor(dp/nq) : 0, resto=nq ? dp-base*nq : 0;
        ACCH_COLS.forEach(function(c){
          for(var i=0;i<cu[c[0]];i++){
            var di=(c[0]===quien) ? base+(i===0 ? resto : 0) : 0;
            P.ev.push({ empresa:YO.obra.id, ext:'xh'+ym.replace('-', '')+c[0].slice(0, 2)+i.toString(36)+Math.random().toString(36).slice(2, 6), fecha:fin, hora:null, clase:c[0], t_nombre:'', t_tipodoc:null, t_doc:'', t_puesto:'',
              lugar:'', descripcion:'Registro de la estadística de '+mes+' de '+A+', '+ACC_SIN_DETALLE+'.', parte:'—', agente:'—', dias:di, causas:'', medidas:'', responsable:'', plazo:null, mtpe:false });
          }
        });
        P.nEv+=tot; P.dias+=dp; toco=true;
      }
    }
    if(toco) P.meses++;
  }
  if(!P.meses) P.error='Escribe las horas hombre o los eventos de al menos un mes.';
  return P;
}
function _acchCalc(){
  var P=_acchPlan(), r=$('acch-res'), bt=$('acch-ok'), m=$('acch-msg'); if(!r) return P;
  if(m){ m.className='msg'; m.textContent=''; }
  if(P.error){ r.textContent=P.error; if(bt){ bt.disabled=true; bt.textContent='Guardar'; } return P; }
  r.innerHTML='<b>'+gesPlural(P.meses, 'mes', 'meses')+'</b>'+(P.hht ? ' · <b>'+gesNum(P.hht, 0)+' HHT</b> en '+gesPlural(P.hh.length, 'día', 'días') : '')+
    (P.nEv ? ' · <b>'+gesPlural(P.nEv, 'evento', 'eventos')+'</b>'+(P.dias ? ' con '+gesPlural(P.dias, 'día perdido', 'días perdidos') : '') : '');
  if(bt){ bt.disabled=false; bt.textContent='Guardar '+gesPlural(P.meses, 'mes', 'meses'); }
  return P;
}
function _acchGuardar(){
  var P=_acchPlan(), m=$('acch-msg'), bt=$('acch-ok');
  if(P.error){ m.className='msg mal'; m.textContent=P.error; if(P.foco) try{ P.foco.focus(); }catch(e){} return; }
  var ctrls=Array.prototype.filter.call(document.querySelectorAll('#hoja-cuerpo input, #hoja-cuerpo button'), function(x){ return !x.disabled; });
  bt.disabled=true; ctrls.forEach(function(x){ x.disabled=true; });
  var total=P.hh.length+P.ev.length, hechos=0;
  m.className='msg gris'; m.innerHTML='Guardando… <span id="acch-av-t">0 de '+total+'</span><div class="ges-avance"><i id="acch-av" style="width:0"></i></div>';
  function avance(n){ var a=$('acch-av'), t=$('acch-av-t'); if(a) a.style.width=Math.round(n/total*100)+'%'; if(t) t.textContent=n+' de '+total; }
  gesSubirTandas('sst_hht', P.hh, [[]], function(n){ hechos=n; avance(n); }, 50).then(function(){
    var base=P.hh.length;
    return gesSubirTandas('sst_accidente', P.ev, [[]], function(n){ hechos=base+n; avance(base+n); }, 50);
  }).then(function(){
    toast(gesPlural(P.meses, 'mes cargado', 'meses cargados')+'. La app lo recibe al sincronizar.');
    cerrarHoja(); ACCW.anio=ACCH.anio;
    if(typeof VISTA.recargar==='function') VISTA.recargar(true);
  }).catch(function(e){
    m.className='msg mal'; m.textContent=(hechos ? 'Se guardó una parte ('+hechos+' de '+total+') y el resto no. ' : 'No se pudo guardar. ')+porQueFallo(e && e.cod!==undefined ? e.cod : e)+(hechos ? ' Cierra y vuelve a abrir: lo que ya entró aparece como registrado y no se repite.' : '');
    ctrls.forEach(function(x){ x.disabled=false; }); bt.disabled=false;
    if(hechos && typeof VISTA.recargar==='function') VISTA.recargar(true);
  });
}
/* ── el Excel de la estadística ─────────────────────────────────────────────────────────────── */
function accExcel(bt){
  if(bt) bt.disabled=true;
  cargarEvPDF().then(function(){
    var X=RCAP.xlsx, E=new X.Estilos(), C=X.C, A=String(ACCW.anio), S=accMeses(ACCW.accs, ACCW.hht, A), obra=String(nombreObraP()||''), esHoy=(A===ANIO), mesHoy=esHoy ? +MES.slice(5,7) : 12;
    var sTit=E.xf({ b:1, sz:14, c:C.petroleo }), sSub=E.xf({ sz:10, c:C.gris }), sCab=E.xf({ b:1, sz:9, c:C.blanco, f:C.petroleo, h:'center', v:'center', wrap:1, borde:true }), sCabI=E.xf({ b:1, sz:9, c:C.blanco, f:C.petroleo, h:'left', v:'center', borde:true });
    var sTx=E.xf({ sz:10, c:C.tinta, borde:true }), sTxW=E.xf({ sz:10, c:C.tinta, borde:true, wrap:1 }), sN0=E.xf({ sz:10, c:C.tinta, h:'right', borde:true, fmt:'#,##0' }), sN2=E.xf({ sz:10, c:C.tinta, h:'right', borde:true, fmt:'#,##0.00' });
    var sT0=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, h:'right', borde:true, fmt:'#,##0' }), sT2=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, h:'right', borde:true, fmt:'#,##0.00' }), sTt=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, borde:true });
    var sVac=E.xf({ sz:10, c:C.grisc, h:'right', borde:true }), sFe=E.xf({ sz:10, c:C.tinta, h:'center', borde:true, fmt:'dd/mm/yyyy' });
    var h=new X.Hoja('Estadística '+A); h.activa=true; h.pie='Estadística de accidentabilidad';
    h.unir(0, 1, 13, 1, 'Estadística de accidentabilidad · '+A, sTit); h.altos[1]=22;
    h.unir(0, 2, 13, 2, obra+' · IF = (incapacitantes + mortales) × 1 000 000 ÷ HHT · IS = días perdidos × 1 000 000 ÷ HHT · IA = IF × IS ÷ 1000', sSub);
    ['Mes', 'Horas hombre', 'Casi accidentes', 'Primeros auxilios', 'Leves', 'Incapacitantes', 'Mortales', 'Días perdidos', 'IF', 'IS', 'IA', 'IF acumulado', 'IS acumulado', 'IA acumulado'].forEach(function(t, i){ h.celda(i, 4, t, i<1 ? sCabI : sCab); });
    [14, 14, 11, 11, 9, 13, 10, 10, 10, 10, 10, 12, 12, 12].forEach(function(w, i){ h.anchos[i]=w; }); h.altos[4]=30;
    S.meses.forEach(function(m, i){
      var f=5+i, fut=(i+1>mesHoy);
      h.celda(0, f, DC_MESES[i], sTx); h.celda(1, f, gesRed(m.hht), sN2);
      [m.casi, m.primeros, m.leve, m.incap, m.mortal, m.dias].forEach(function(v, k){ h.celda(2+k, f, v, sN0); });
      /* los índices, como fórmula (y con su valor): quien corrija una cifra en el Excel ve moverse el índice */
      if(m.hht){ h.celda(8, f, gesRed(m.IF, 4), sN2, '(F'+f+'+G'+f+')*1000000/B'+f); h.celda(9, f, gesRed(m.IS, 4), sN2, 'H'+f+'*1000000/B'+f); h.celda(10, f, gesRed(m.IA, 4), sN2, 'I'+f+'*J'+f+'/1000'); }
      else { h.celda(8, f, '', sVac); h.celda(9, f, '', sVac); h.celda(10, f, '', sVac); }
      if(m.aHht && !fut){ h.celda(11, f, gesRed(m.aIF, 4), sN2, '(SUM(F$5:F'+f+')+SUM(G$5:G'+f+'))*1000000/SUM(B$5:B'+f+')'); h.celda(12, f, gesRed(m.aIS, 4), sN2, 'SUM(H$5:H'+f+')*1000000/SUM(B$5:B'+f+')'); h.celda(13, f, gesRed(m.aIA, 4), sN2, 'L'+f+'*M'+f+'/1000'); }
      else { h.celda(11, f, '', sVac); h.celda(12, f, '', sVac); h.celda(13, f, '', sVac); }
    });
    var T=S.total;
    h.celda(0, 17, 'Total '+A, sTt); h.celda(1, 17, gesRed(T.hht), sT2, 'SUM(B5:B16)');
    [T.casi, T.primeros, T.leve, T.incap, T.mortal, T.dias].forEach(function(v, k){ var L='CDEFGH'.charAt(k); h.celda(2+k, 17, v, sT0, 'SUM('+L+'5:'+L+'16)'); });
    if(T.hht){ h.celda(8, 17, gesRed(T.IF, 4), sT2, '(F17+G17)*1000000/B17'); h.celda(9, 17, gesRed(T.IS, 4), sT2, 'H17*1000000/B17'); h.celda(10, 17, gesRed(T.IA, 4), sT2, 'I17*J17/1000'); }
    else { h.celda(8, 17, '', sTt); h.celda(9, 17, '', sTt); h.celda(10, 17, '', sTt); }
    h.celda(11, 17, '', sTt); h.celda(12, 17, '', sTt); h.celda(13, 17, '', sTt);
    h.congelar={ c:1, r:4 };
    var g=new X.Hoja('Eventos '+A); g.pie='Estadística de accidentabilidad';
    var cols=['Fecha', 'Hora', 'Clase', 'Trabajador', 'Documento', 'Puesto', 'Lugar', 'Qué pasó', 'Parte del cuerpo', 'Agente', 'Días perdidos', 'Causas', 'Medidas correctivas', 'Responsable', 'Plazo'];
    cols.forEach(function(c, i){ g.celda(i, 1, c, sCabI); });
    [12, 8, 22, 30, 16, 18, 22, 50, 16, 22, 10, 36, 36, 20, 12].forEach(function(w, i){ g.anchos[i]=w; });
    var fr=2;
    ACCW.accs.filter(function(a){ return anioDe(a.fecha)===A; }).slice().sort(function(a, b){ return String(a.fecha+(a.hora||'')).localeCompare(String(b.fecha+(b.hora||''))); }).forEach(function(a){
      var se=X.serial(String(a.fecha||'').slice(0,10)), sp=a.plazo ? X.serial(String(a.plazo).slice(0,10)) : null;
      g.celda(0, fr, se, sFe); g.celda(1, fr, a.hora||'', sTx); g.celda(2, fr, ACC_NOMBRE[a.clase]||a.clase||'', sTx); g.celda(3, fr, a.t_nombre||'', sTx);
      g.celda(4, fr, [a.t_tipodoc, a.t_doc].filter(Boolean).join(' '), sTx); g.celda(5, fr, a.t_puesto||'', sTx); g.celda(6, fr, a.lugar||'', sTx); g.celda(7, fr, a.descripcion||'', sTxW);
      g.celda(8, fr, a.parte && a.parte!=='—' ? a.parte : '', sTx); g.celda(9, fr, a.agente && a.agente!=='—' ? a.agente : '', sTx); g.celda(10, fr, parseInt(a.dias, 10)||0, sN0);
      g.celda(11, fr, a.causas||'', sTxW); g.celda(12, fr, a.medidas||'', sTxW); g.celda(13, fr, a.responsable||'', sTx); if(sp) g.celda(14, fr, sp, sFe); else g.celda(14, fr, '', sTx);
      fr++;
    });
    g.congelar={ c:0, r:1 }; if(fr>2) g.filtro='A1:O'+(fr-1);
    bajarBlob(X.libro([h, g], E, 'Estadística de accidentabilidad'), nombreArchivo('Accidentabilidad - '+obra+' - '+A)+'.xlsx');
    if(bt) bt.disabled=false;
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar el Excel. Revisa tu conexión.'); });
}

/* ══ 4 · «YA SE HIZO»: LO QUE SE HIZO Y NO PASÓ POR LA APP ════════════════════════════════════
   Marcelo: «Si alguien quiere agregar su gestión ya en la web, se tiene que dar la posibilidad: capacitaciones ya
   realizadas anteriores, no en modo programar, sino realizadas, sin que el usuario se confunda; al igual que
   inspecciones mensuales, simulacros, campañas, reportes».
   Dónde queda cada cosa:
   · la inspección y el reporte, en SU tabla (sst_inspeccion, sst_reporte), con la misma fila que sube la app: el
     celular los baja con los demás;
   · la capacitación, el simulacro y la campaña, en sst_doc, hoja «ges-act» (una fila por actividad, todo en «nota»,
     SIN «url»: así ninguna lista de documentos de la app la muestra como un archivo). ¿Por qué la capacitación no va
     a sst_constancia? Porque una constancia de OBRASST dice «rindió la evaluación en su propio equipo», y de una
     capacitación dada en papel eso sería falso. Aquí se guarda lo que fue: el tema, el día, quiénes asistieron y la
     lista firmada. El portal la cuenta en la matriz, en el registro de seguimiento y en lo programado
     (gesCapComoCons, en index.html); la app la leerá en su lote.
   «Programar» sigue donde estaba: aquí todo lleva fecha de hoy para atrás. */
var GES_HOJA = 'ges-act';
var GESA = { obra:null, filas:null, t:0 };
function _yaCss(){
  if($('ya-css')) return;
  var st=document.createElement('style'); st.id='ya-css';
  st.textContent=[
    /* elegir gente */
    '.ges-el{border:1px solid var(--raya);border-radius:10px;background:var(--panel);overflow:hidden}',
    '.ges-el-barra{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--raya);background:#FAFBFC}',
    '.ges-el-barra input[type=search]{flex:1 1 180px;min-width:0;padding:8px 11px;font-size:13.5px}.ges-el-barra select{flex:0 1 190px;min-width:0;padding:8px 9px;font-size:13.5px}',
    '.ges-el-lista{max-height:292px;overflow:auto}',
    '.ges-el-f{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--raya);cursor:pointer;font-size:13.5px}.ges-el-f:last-child{border-bottom:0}',
    '.ges-el-f:hover{background:#FAFBFC}.ges-el-f.on{background:#F4F8FB}',
    '.ges-el-f input[type=checkbox]{width:17px;height:17px;flex:0 0 auto;margin:0;padding:0}',
    '.ges-el-n{flex:1;min-width:0}.ges-el-n b{display:block;font-weight:500;color:var(--tinta);overflow-wrap:anywhere}.ges-el-n small{display:block;color:var(--gris);font-size:12px;line-height:1.35}',
    '.ges-el-f input.ges-el-nota{width:74px;flex:0 0 auto;padding:6px 8px;text-align:right;font-variant-numeric:tabular-nums}',
    '.ges-el-vacio{padding:18px 12px;text-align:center;color:var(--gris);font-size:13.5px}',
    '.ges-el-pie{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;padding:10px 12px;border-top:1px solid var(--raya);background:#FAFBFC;font-size:13px}',
    '.ges-el-pie b{color:var(--tinta);font-weight:600}',
    '.ges-el-mas{padding:12px;border-top:1px solid var(--raya);background:#FAFBFC}.ges-el-mas textarea{min-height:92px}.ges-el-mas .fila-c{align-items:end}.ges-el-mas .campo{margin:0 0 8px}',
    /* la evidencia */
    '.ges-ev-l{list-style:none;margin:0 0 8px;padding:0;display:grid;gap:6px}',
    '.ges-ev-l li{display:flex;align-items:center;gap:10px;border:1px solid var(--raya);border-radius:8px;padding:7px 10px;font-size:13.5px;background:var(--panel)}',
    '.ges-ev-l li a,.ges-ev-l li span{flex:1;min-width:0;overflow-wrap:anywhere}.ges-ev-l li small{color:var(--gris)}',
    /* renglones que se agregan (hallazgos, actividades) */
    '.ges-ren{display:grid;gap:6px;margin:0 0 8px}.ges-ren-f{display:flex;gap:8px;align-items:center}.ges-ren-f input[type=text],.ges-ren-f input:not([type]){flex:1;min-width:0}',
    '.ges-ren-f select{flex:0 0 auto;width:auto;max-width:44%}.ges-ren-f .chk{margin:0;white-space:nowrap}',
    /* las tarjetas de «Cargar mi gestión» */
    '.ges-hub{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px}',
    '.ges-hub-t{display:flex;flex-direction:column;gap:8px;border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:16px 16px 14px}',
    '.ges-hub-t h3{margin:0;font-size:15px;color:var(--tinta);font-weight:600;display:flex;gap:9px;align-items:center}.ges-hub-t h3 span{font-size:18px;line-height:1}',
    '.ges-hub-t p{margin:0;font-size:13px;color:var(--gris);line-height:1.5;flex:1}',
    '.ges-hub-t .ges-hub-n{font-size:13px;color:var(--texto);font-variant-numeric:tabular-nums}.ges-hub-t .ges-hub-n b{color:var(--tinta);font-weight:600}',
    '.ges-hub-t .acciones{margin:2px 0 0;justify-content:flex-start;flex-wrap:wrap}',
    '.ges-hub-t.cand{background:#FAFBFC}.ges-hub-t.cand h3{color:var(--gris)}',
    '.ya-estado{display:inline-flex;gap:6px;margin:0 0 14px}',
    '.ya-al{align-items:end}',
    '.ya-tiempo{font-variant-numeric:tabular-nums;font-weight:600}',
    '@media (max-width:640px){.ges-el-lista{max-height:240px}.ges-el-barra select{flex:1 1 100%}.ges-ren-f{flex-wrap:wrap}.ges-ren-f select{max-width:none;flex:1 1 100%}}'
  ].join('\n');
  document.head.appendChild(st);
}
/* ── lo guardado: una fila de sst_doc por actividad ─────────────────────────────────────────── */
function gesActTraer(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && GESA.obra===oid && GESA.filas && Date.now()-GESA.t<3000) return Promise.resolve(GESA.filas);
  return traer('sst_doc', '&select=id,hoja,nombre,nota,creado&hoja=eq.'+GES_HOJA+'&order=creado.desc', 2000).then(function(rows){
    var l=[];
    (rows||[]).forEach(function(r){ if(!r || r.hoja!==GES_HOJA) return; var d=nota(r.nota); if(d && typeof d==='object' && d.k) l.push({ id:r.id, creado:r.creado, d:d }); });
    GESA.obra=oid; GESA.filas=l; GESA.t=Date.now();
    return l;
  });
}
function gesActDe(filas, k){ return (filas||[]).filter(function(f){ return f.d.k===k; }); }
function gesActGuardar(id, d, nombre){
  var fila={ nombre:gesTxt(nombre).slice(0, 180), nota:JSON.stringify(d) };
  GESA.filas=null;
  if(id) return sbPatch('sst_doc?id=eq.'+encodeURIComponent(id), fila).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: el registro ya no está o esta cuenta no puede cambiarlo.'});
    return rows;
  });
  fila.empresa=YO.obra.id; fila.hoja=GES_HOJA;
  return sbPostP('sst_doc', fila).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede registrar en esta obra.'});
    return rows;
  });
}
function gesActQuitar(id){
  GESA.filas=null;
  return sbDelP('sst_doc?id=eq.'+encodeURIComponent(id)).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se pudo quitar: esta cuenta no puede borrar en esta obra.'});
    return true;
  });
}
function gesQuien(){ try{ return gesTxt(YO.nombre || quienSoy()).slice(0, 80); }catch(e){ return ''; } }
/* la fecha de hoy para atrás: «ya se hizo» no admite mañana */
function gesFechaPasada(v){ return /^\d{4}-\d{2}-\d{2}$/.test(String(v||'')) && v<=hoyISO() && v>='2000-01-01'; }
/* mm:ss ↔ segundos (los tiempos de un simulacro) */
function gesReloj(seg){ if(seg==null || seg==='' || isNaN(seg)) return ''; seg=Math.max(0, Math.round(+seg)); var m=Math.floor(seg/60), s=seg%60; return (m<10 ? '0' : '')+m+':'+(s<10 ? '0' : '')+s; }
function gesSegundos(t){
  t=gesTxt(t); if(!t) return null;
  var m=t.match(/^(\d{1,3})\s*[:.,'’m]\s*(\d{1,2})\s*("|s|seg)?$/i);
  if(m) return (+m[2]<60) ? (+m[1])*60+(+m[2]) : NaN;
  if(/^\d{1,3}$/.test(t)) return (+t)*60;          /* «4» son 4 minutos */
  return NaN;
}
/* ── el personal de la obra, para elegir (se guarda un minuto) ──────────────────────────────── */
var GESG = { obra:null, lista:null, t:0, pide:null };
function gesGente(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && GESG.obra===oid && GESG.lista && Date.now()-GESG.t<60000) return Promise.resolve(GESG.lista);
  if(GESG.obra===oid && GESG.pide) return GESG.pide;
  GESG.obra=oid;
  GESG.pide=traerTodo('sst_trabajador', '&select=id,nombre,dni,td,puesto,area,estatus&order=nombre.asc', 5000).then(function(l){
    GESG.lista=(l||[]).filter(function(t){ return t && t.nombre && String(t.estatus||'activo')!=='cesado'; });
    /* el orden se pone aquí (el del servidor separa las tildes y las mayúsculas): el de un directorio en español */
    GESG.lista.sort(function(x, y){ return String(x.nombre).localeCompare(String(y.nombre), 'es', {sensitivity:'base'}); });
    GESG.t=Date.now(); GESG.pide=null; return GESG.lista;
  }, function(){ GESG.pide=null; return GESG.lista||[]; });
  return GESG.pide;
}
/* ── elegir gente: del personal (con buscador y filtro), pegando una lista, o alguien de fuera ──
   op: { id, gente:[fichas], sel:[{n,d,td,p,a,id,nota}], conNota, sobre, alCambiar }  →  { elegidos(), ponNota(si, sobre), n() } */
function gesElegir(caja, op){
  _yaCss();
  var E={ id:op.id||'gel', gente:(op.gente||[]).slice(), extra:[], sel:{}, q:'', f:'', conNota:!!op.conNota, sobre:op.sobre||20, alCambiar:op.alCambiar||function(){}, abierto:'' };
  var porId={}, porDoc={};
  E.gente.forEach(function(t){ t._k='f:'+t.id; porId[String(t.id)]=t; if(t.dni) porDoc[String(t.dni).toUpperCase()]=t; });
  function kExtra(n, d){ return 'x:'+nrm(n)+'|'+String(d||'').toUpperCase(); }
  function sumarExtra(n, d, td, p){
    n=gesTxt(n).slice(0, 120); if(n.length<3) return null;
    var k=kExtra(n, d), ya=E.extra.filter(function(x){ return x._k===k; })[0];
    if(!ya){ ya={ _k:k, nombre:n, dni:gesTxt(d).slice(0, 20), td:td||'', puesto:gesTxt(p).slice(0, 80), area:'', extra:true }; E.extra.push(ya); }
    return ya;
  }
  /* lo que ya venía elegido (al abrir un registro guardado) */
  (op.sel||[]).forEach(function(g){
    if(!g || !g.n) return;
    var t=(g.id!=null && porId[String(g.id)]) || (g.d && porDoc[String(g.d).toUpperCase()]) || null;
    if(!t) t=sumarExtra(g.n, g.d, g.td, g.p);
    if(t) E.sel[t._k]={ nota:(g.nota==null ? '' : g.nota) };
  });
  function todos(){ return E.extra.concat(E.gente); }
  function visibles(){
    var q=nrm(E.q), f=E.f;
    return todos().filter(function(t){
      if(f){ var v=f.slice(2); if(f.charAt(0)==='p' ? nrm(t.puesto)!==v : nrm(t.area)!==v) return false; }
      return !q || (nrm(t.nombre)+' '+String(t.dni||'').toLowerCase()+' '+nrm(t.puesto)).indexOf(q)>-1;
    });
  }
  function nSel(){ return Object.keys(E.sel).length; }
  function filtros(){
    var P={}, A={};
    E.gente.forEach(function(t){ var p=gesTxt(t.puesto), a=gesTxt(t.area); if(p){ var kp=nrm(p); P[kp]=P[kp]||{t:p, n:0}; P[kp].n++; } if(a){ var ka=nrm(a); A[ka]=A[ka]||{t:a, n:0}; A[ka].n++; } });
    function ops(O, pre){ return Object.keys(O).sort(function(x, y){ return O[x].t.localeCompare(O[y].t, 'es'); }).map(function(k){ return '<option value="'+pre+esc(k)+'"'+(E.f===pre+k ? ' selected' : '')+'>'+esc(O[k].t)+' ('+O[k].n+')</option>'; }).join(''); }
    var p=ops(P, 'p:'), a=ops(A, 'a:');
    return '<option value="">Todos los puestos y áreas</option>'+(p ? '<optgroup label="Puesto">'+p+'</optgroup>' : '')+(a ? '<optgroup label="Área">'+a+'</optgroup>' : '');
  }
  function filaHTML(t){
    var on=!!E.sel[t._k], doc=t.dni ? (t.td||docPersonaP())+' '+t.dni : '';
    return '<label class="ges-el-f'+(on ? ' on' : '')+'"><input type="checkbox" data-k="'+esc(t._k)+'"'+(on ? ' checked' : '')+'>'+
      '<span class="ges-el-n"><b>'+esc(t.nombre)+'</b><small data-sin-pais>'+esc([doc, t.puesto, t.area].filter(Boolean).join(' · ')||'sin más datos')+(t.extra ? ' · no está en tu personal' : '')+'</small></span>'+
      ((E.conNota && on) ? '<input type="number" class="ges-el-nota" inputmode="decimal" min="0" max="'+E.sobre+'" step="0.5" data-nk="'+esc(t._k)+'" value="'+esc(E.sel[t._k].nota)+'" placeholder="nota" aria-label="Nota de '+esc(t.nombre)+'">' : '')+'</label>';
  }
  function pintaLista(){
    var l=$(E.id+'-l'); if(!l) return;
    var v=visibles();
    l.innerHTML=v.length ? v.slice(0, 1500).map(filaHTML).join('')
      : '<div class="ges-el-vacio">'+(todos().length ? 'Nadie calza con esa búsqueda.' : 'Tu obra todavía no tiene personal cargado. Súbelo en «Personal» o agrega aquí a quien asistió.')+'</div>';
    var bt=$(E.id+'-todos'); if(bt){ bt.textContent='Marcar los '+v.length+' que se ven'; bt.disabled=!v.length; }
    pintaPie();
  }
  function pintaPie(){
    var n=nSel(), c=$(E.id+'-n'); if(c) c.textContent=(n===1 ? '1 persona elegida' : n+' personas elegidas');
    var x=$(E.id+'-nada'); if(x) x.hidden=!n;
  }
  function cambio(){ pintaPie(); try{ E.alCambiar(nSel()); }catch(e){} }
  caja.innerHTML='<div class="ges-el" id="'+E.id+'">'+
    '<div class="ges-el-barra"><input type="search" id="'+E.id+'-q" placeholder="Buscar por nombre, documento o puesto…" aria-label="Buscar en el personal">'+
      '<select id="'+E.id+'-f" aria-label="Filtrar por puesto o área" data-sin-pais>'+filtros()+'</select>'+
      '<button type="button" class="bt sec chico" id="'+E.id+'-todos">Marcar los que se ven</button></div>'+
    '<div class="ges-el-lista" id="'+E.id+'-l" role="group" aria-label="Personal de la obra"></div>'+
    '<div class="ges-el-pie"><b id="'+E.id+'-n"></b><button type="button" class="bt-link" id="'+E.id+'-nada" hidden>Quitar todos</button>'+
      '<button type="button" class="bt-link" id="'+E.id+'-pega">Pegar una lista</button><button type="button" class="bt-link" id="'+E.id+'-otro">＋ Alguien que no está en tu personal</button></div>'+
    '<div class="ges-el-mas" id="'+E.id+'-mas" hidden></div></div>';
  var L=$(E.id+'-l');
  L.addEventListener('change', function(ev){
    var c=ev.target;
    if(c.getAttribute('data-k')){
      var k=c.getAttribute('data-k');
      if(c.checked) E.sel[k]=E.sel[k]||{ nota:'' }; else delete E.sel[k];
      var lab=c.closest('.ges-el-f');
      if(E.conNota){ var t=todos().filter(function(x){ return x._k===k; })[0]; if(t && lab){ var tmp=document.createElement('div'); tmp.innerHTML=filaHTML(t); lab.replaceWith(tmp.firstChild); } }
      else if(lab) lab.classList.toggle('on', c.checked);
      cambio();
    }
  });
  L.addEventListener('input', function(ev){ var k=ev.target.getAttribute('data-nk'); if(k && E.sel[k]){ E.sel[k].nota=ev.target.value; try{ E.alCambiar(nSel()); }catch(e){} } });
  $(E.id+'-q').oninput=function(){ E.q=this.value; pintaLista(); };
  $(E.id+'-f').onchange=function(){ E.f=this.value; pintaLista(); };
  $(E.id+'-todos').onclick=function(){ visibles().forEach(function(t){ E.sel[t._k]=E.sel[t._k]||{ nota:'' }; }); pintaLista(); cambio(); };
  $(E.id+'-nada').onclick=function(){ E.sel={}; pintaLista(); cambio(); };
  function mas(cual){
    var m=$(E.id+'-mas'); if(!m) return;
    if(E.abierto===cual || !cual){ E.abierto=''; m.hidden=true; m.innerHTML=''; return; }
    E.abierto=cual; m.hidden=false;
    if(cual==='pega'){
      m.innerHTML='<div class="campo"><label for="'+E.id+'-ta">Pega los documentos o los nombres, uno por línea</label><textarea id="'+E.id+'-ta" rows="4" placeholder="70123456&#10;44556677&#10;Flores Ticona, Rosa"></textarea></div>'+
        '<div class="acciones" style="justify-content:flex-start;margin:0"><button type="button" class="bt chico" id="'+E.id+'-ta-ok">Marcar a los de la lista</button></div><div class="msg" id="'+E.id+'-ta-msg" role="status"></div>';
      $(E.id+'-ta-ok').onclick=pegar;
      try{ $(E.id+'-ta').focus(); }catch(e){}
    } else {
      var tipos=[]; try{ tipos=docPais(paisObraP()).tipos||[]; }catch(e2){}
      m.innerHTML='<div class="fila-c ya-al"><div class="campo"><label for="'+E.id+'-xn">Apellidos y nombres</label><input id="'+E.id+'-xn" maxlength="120" autocomplete="off"></div>'+
        '<div class="campo"><label for="'+E.id+'-xd">Documento <span class="tenue">· opcional</span></label><input id="'+E.id+'-xd" maxlength="20" autocomplete="off"></div>'+
        '<div class="campo"><label for="'+E.id+'-xp">Puesto o empresa <span class="tenue">· opcional</span></label><input id="'+E.id+'-xp" maxlength="80"></div></div>'+
        '<div class="acciones" style="justify-content:flex-start;margin:0"><button type="button" class="bt chico" id="'+E.id+'-x-ok">Agregarlo a la lista</button></div><div class="msg" id="'+E.id+'-x-msg" role="status"></div>';
      $(E.id+'-x-ok').onclick=function(){
        var n=gesTxt($(E.id+'-xn').value), d=gesTxt($(E.id+'-xd').value), msg=$(E.id+'-x-msg');
        if(n.length<3){ msg.className='msg mal'; msg.textContent='Escribe su nombre.'; $(E.id+'-xn').focus(); return; }
        var td=(tipos[0]||[])[0]||'';
        try{ if(d && typeof docPersonaNorm==='function') d=docPersonaNorm(td, d); }catch(e3){}
        var ya=d && porDoc[String(d).toUpperCase()];
        var t=ya || sumarExtra(n, d, td, $(E.id+'-xp').value);
        E.sel[t._k]=E.sel[t._k]||{ nota:'' };
        msg.className='msg ok'; msg.textContent=ya ? 'Ya estaba en tu personal con ese documento: quedó marcado.' : 'Agregado: '+n+'.';
        $(E.id+'-xn').value=''; $(E.id+'-xd').value=''; $(E.id+'-xp').value=''; E.q=''; $(E.id+'-q').value='';
        pintaLista(); cambio(); try{ $(E.id+'-xn').focus(); }catch(e4){}
      };
      try{ $(E.id+'-xn').focus(); }catch(e5){}
    }
  }
  /* cada línea pegada: por su documento, o por su nombre (todas sus palabras) */
  function pegar(){
    var lineas=String($(E.id+'-ta').value||'').split(/\r?\n/).map(gesTxt).filter(Boolean), msg=$(E.id+'-ta-msg');
    if(!lineas.length){ msg.className='msg mal'; msg.textContent='Pega al menos una línea.'; return; }
    var si=0, no=[], T=todos();
    lineas.slice(0, 3000).forEach(function(l){
      var doc=(l.match(/[0-9][0-9.\-]{5,}[0-9A-Za-z]?/)||[''])[0].replace(/[.\-]/g, '').toUpperCase(), t=null;
      if(doc) t=porDoc[doc] || porDoc[doc.replace(/^0+/, '')] || null;
      if(!t){
        var pal=nrm(l.replace(/[0-9.\-]{6,}/g, ' ')).split(' ').filter(function(w){ return w.length>1; });
        if(pal.length>=2){ var c=T.filter(function(x){ var n=' '+nrm(x.nombre)+' '; return pal.every(function(w){ return n.indexOf(' '+w+' ')>-1; }); }); if(c.length===1) t=c[0]; }
      }
      if(t){ E.sel[t._k]=E.sel[t._k]||{ nota:'' }; si++; } else no.push(l);
    });
    E.noHallados=no;
    msg.className='msg '+(no.length ? 'gris' : 'ok');
    msg.innerHTML='<b>'+(si===1 ? '1 persona marcada' : si+' personas marcadas')+'.</b>'+(no.length ? ' '+(no.length===1 ? 'Una línea no calza' : no.length+' líneas no calzan')+' con nadie de tu personal: «'+esc(no.slice(0, 3).join('», «'))+(no.length>3 ? '»…' : '»')+
      ' <button type="button" class="bt-link" id="'+E.id+'-ta-ext">Agregarl'+(no.length===1 ? 'a' : 'as')+' como gente de fuera</button>' : '');
    var bx=$(E.id+'-ta-ext'); if(bx) bx.onclick=function(){
      (E.noHallados||[]).forEach(function(l){
        var doc=(l.match(/[0-9][0-9.\-]{5,}[0-9A-Za-z]?/)||[''])[0], n=gesTxt(l.replace(doc, ' ').replace(/[;,\t|]+$/g, ' '));
        var t=sumarExtra(n.length>=3 ? n : l, doc.replace(/[.\-]/g, ''), '', ''); if(t) E.sel[t._k]=E.sel[t._k]||{ nota:'' };
      });
      E.noHallados=[]; msg.className='msg ok'; msg.textContent='Agregadas como gente de fuera de tu personal.'; pintaLista(); cambio();
    };
    pintaLista(); cambio();
  }
  $(E.id+'-pega').onclick=function(){ mas('pega'); };
  $(E.id+'-otro').onclick=function(){ mas('otro'); };
  pintaLista();
  return {
    n:nSel,
    ponNota:function(si, sobre){ E.conNota=!!si; if(sobre) E.sobre=sobre; pintaLista(); },
    elegidos:function(){
      return todos().filter(function(t){ return E.sel[t._k]; }).map(function(t){
        var o={ n:gesTxt(t.nombre), d:String(t.dni||''), td:t.td||(t.dni ? docPersonaP() : ''), p:gesTxt(t.puesto), a:gesTxt(t.area) };
        if(!t.extra) o.id=t.id;
        var nt=String(E.sel[t._k].nota==null ? '' : E.sel[t._k].nota).replace(',', '.').trim();
        if(E.conNota && nt!=='' && !isNaN(parseFloat(nt))) o.nota=parseFloat(nt);
        return o;
      });
    }
  };
}
/* ── la evidencia: la lista firmada, el informe, las fotos (se suben al guardar) ─────────────
   op: { id, lista:[{u,n}], max, texto, ayuda }  →  { subir() → Promise<[{u,n}]>, n() } */
function gesEvidencia(caja, op){
  _yaCss();
  var V={ id:op.id||'gev', ya:(op.lista||[]).filter(function(x){ return x && /^https?:\/\//i.test(String(x.u||'')); }).map(function(x){ return { u:x.u, n:x.n||'archivo' }; }), nuevos:[], max:op.max||4 };
  function pinta(){
    var h='<ul class="ges-ev-l" id="'+V.id+'-l">'+
      V.ya.map(function(x, i){ return '<li><a href="'+esc(x.u)+'" target="_blank" rel="noopener">📎 '+esc(x.n)+'</a><button type="button" class="bt-link" data-ya="'+i+'">Quitar</button></li>'; }).join('')+
      V.nuevos.map(function(f, i){ return '<li><span>📎 '+esc(f.name)+' <small>· '+Math.max(1, Math.round(f.size/1024))+' KB · se sube al guardar</small></span><button type="button" class="bt-link" data-nu="'+i+'">Quitar</button></li>'; }).join('')+'</ul>';
    var hay=V.ya.length+V.nuevos.length;
    h+=(hay<V.max ? '<label class="bt sec chico" for="'+V.id+'-f">＋ '+esc(hay ? 'Adjuntar otro archivo' : (op.texto||'Adjuntar un archivo'))+'</label><input type="file" id="'+V.id+'-f" accept="application/pdf,image/*" multiple hidden>' : '')+
      '<p class="ayuda">'+esc(op.ayuda||'PDF o foto, hasta '+V.max+' archivos de 20 MB.')+'</p><div class="msg" id="'+V.id+'-msg" role="status"></div>';
    caja.innerHTML=h;
    var fi=$(V.id+'-f');
    if(fi) fi.onchange=function(){
      var m='';
      Array.prototype.forEach.call(this.files||[], function(f){
        if(V.ya.length+V.nuevos.length>=V.max){ m='Solo entran '+V.max+' archivos.'; return; }
        if(!/pdf|image\//i.test(f.type||'') && !/\.(pdf|jpe?g|png|webp)$/i.test(f.name||'')){ m='«'+f.name+'» no es PDF ni foto.'; return; }
        if(f.size>20*1024*1024){ m='«'+f.name+'» pesa más de 20 MB.'; return; }
        V.nuevos.push(f);
      });
      pinta(); if(m){ var x=$(V.id+'-msg'); x.className='msg mal'; x.textContent=m; }
    };
    Array.prototype.forEach.call(caja.querySelectorAll('[data-ya]'), function(b){ b.onclick=function(){ V.ya.splice(+b.getAttribute('data-ya'), 1); pinta(); }; });
    Array.prototype.forEach.call(caja.querySelectorAll('[data-nu]'), function(b){ b.onclick=function(){ V.nuevos.splice(+b.getAttribute('data-nu'), 1); pinta(); }; });
  }
  pinta();
  function sube(f){
    /* la foto grande se achica (como en la app); el PDF sube tal cual */
    if(/^image\//i.test(f.type||'') && f.size>900*1024)
      return _gesFotoChica(f, 2000, 0.85).then(function(x){ return subirFoto('gestion', x.blob, String(f.name||'foto').replace(/\.[a-z0-9]{2,5}$/i, '')+'.jpg'); }, function(){ return subirArchivoP('gestion', f); });
    return subirArchivoP('gestion', f);
  }
  return {
    n:function(){ return V.ya.length+V.nuevos.length; },
    subir:function(){
      var out=V.ya.slice(), cola=V.nuevos.slice(), i=0;
      function sig(){
        if(i>=cola.length){ V.ya=out.slice(); V.nuevos=[]; return Promise.resolve(out); }
        var f=cola[i++];
        return sube(f).then(function(u){ out.push({ u:u, n:String(f.name||'archivo').slice(0, 120) }); return sig(); });
      }
      return sig();
    }
  };
}
/* ── renglones que se agregan y se quitan (las observaciones de una inspección, lo que se encontró en un simulacro) ──
   op: { id, lista:[{t, e}], estados:[[k, nombre]] (opcional), ph, max }  →  { leer() } */
function gesRenglones(caja, op){
  _yaCss();
  var R={ id:op.id||'gre', l:(op.lista||[]).map(function(x){ return { t:String(x.t||''), e:x.e||'' }; }), max:op.max||30 };
  if(!R.l.length) R.l.push({ t:'', e:(op.estados ? op.estados[0][0] : '') });
  function leer(){ Array.prototype.forEach.call(caja.querySelectorAll('.ges-ren-f'), function(f, i){ if(!R.l[i]) return; R.l[i].t=f.querySelector('input').value; var s=f.querySelector('select'); if(s) R.l[i].e=s.value; }); }
  function pinta(foco){
    caja.innerHTML='<div class="ges-ren" id="'+R.id+'">'+R.l.map(function(x, i){
      return '<div class="ges-ren-f"><input type="text" maxlength="300" value="'+esc(x.t)+'" placeholder="'+esc(op.ph||'')+'" aria-label="'+esc((op.que||'Renglón')+' '+(i+1))+'">'+
        (op.estados ? '<select aria-label="Estado">'+op.estados.map(function(e){ return '<option value="'+esc(e[0])+'"'+(x.e===e[0] ? ' selected' : '')+'>'+esc(e[1])+'</option>'; }).join('')+'</select>' : '')+
        '<button type="button" class="bt-link" data-q="'+i+'" aria-label="Quitar este renglón">Quitar</button></div>'; }).join('')+'</div>'+
      (R.l.length<R.max ? '<button type="button" class="bt sec chico" id="'+R.id+'-mas">＋ '+esc(op.mas||'Agregar otro')+'</button>' : '');
    var b=$(R.id+'-mas'); if(b) b.onclick=function(){ leer(); R.l.push({ t:'', e:(op.estados ? op.estados[0][0] : '') }); pinta(true); };
    Array.prototype.forEach.call(caja.querySelectorAll('[data-q]'), function(q){ q.onclick=function(){ leer(); R.l.splice(+q.getAttribute('data-q'), 1); if(!R.l.length) R.l.push({ t:'', e:(op.estados ? op.estados[0][0] : '') }); pinta(); }; });
    if(foco){ var ins=caja.querySelectorAll('.ges-ren-f input'); try{ ins[ins.length-1].focus(); }catch(e){} }
  }
  pinta();
  return { leer:function(){ leer(); return R.l.map(function(x){ return { t:gesTxt(x.t).slice(0, 300), e:x.e }; }).filter(function(x){ return x.t; }); } };
}
/* el catálogo de la app (tipos de registro, formatos de inspección, simulacros, campañas): llega con catalogo.js */
function gesCat(){ return cargarCatalogo().then(function(c){ return c||{}; }, function(){ return {}; }); }

/* ── 4.1 · CAPACITACIONES REALIZADAS ──────────────────────────────────────────────────────────
   Una fila por capacitación (o charla, inducción, entrenamiento…) que ya se dio: el tema, el día, cuánto duró, quién
   la dio, quiénes asistieron —con su nota si hubo evaluación— y la lista firmada.
     { v:1, k:'cap', tipo, fecha, hora, min, tema, dicta, cargo, lugar, obs, sobre, minimo,
       gente:[{n, d, td, p, a, id, nota}], ev:[{u, n}], por, cuando }
   Las que son capacitación de verdad (GES_CAP_MATRIZ, en index.html: capacitación, inducción, entrenamiento, taller)
   cuentan en la matriz; las charlas y reuniones quedan como registro de asistencia. */
var GES_CAP_TIPOS_BASE = [['capacitacion', 'Capacitación'], ['charla', 'Charla de inicio de jornada'], ['induccion', 'Inducción'], ['entrenamiento', 'Entrenamiento'], ['taller', 'Taller'], ['otra', 'Otro']];
var CAPW = { filas:[], n:0, caja:null, cat:null, firma:'' };
function capTipos(){ var c=(CAPW.cat && Array.isArray(CAPW.cat.asisTipos) && CAPW.cat.asisTipos.length) ? CAPW.cat.asisTipos : GES_CAP_TIPOS_BASE; return c.filter(function(t){ return t[0]!=='simulacro'; }); }
function capTipoN(k){ var t=capTipos().filter(function(x){ return x[0]===k; })[0]; return t ? t[1] : (k||'Capacitación'); }
function capMinDe(k){ return ((CAPW.cat && CAPW.cat.asisMin)||{})[k] || 60; }
function capEnMatriz(k){ return !!(typeof GES_CAP_MATRIZ==='object' && GES_CAP_MATRIZ[k]); }
function capHHC(d){ return ((Array.isArray(d.gente) ? d.gente.length : 0)*(parseFloat(d.min)||0))/60; }
/* de quienes tienen nota: cuántos aprobaron y cuántos no */
function capNotas(d){
  var o={ con:0, ap:0, de:0 };
  if(!d.sobre) return o;
  (d.gente||[]).forEach(function(g){ if(g.nota==null || g.nota==='') return; o.con++; if(+g.nota>=(+d.minimo||0)) o.ap++; else o.de++; });
  return o;
}
function gesVistaCap(caja){
  _gesCss(); _yaCss(); _hhCss();
  CAPW.caja=caja;
  var ac=$('acciones');
  if(ac){
    ac.innerHTML='<button type="button" class="bt sec" id="cap-excel">Exportar a Excel</button><button type="button" class="bt sec" id="cap-subir">⬆ Subir desde un Excel</button><button type="button" class="bt" id="cap-nueva">＋ Registrar una capacitación</button>';
    $('cap-nueva').onclick=function(){ capForm(null); };
    $('cap-subir').onclick=function(){ capSubir(); };
    $('cap-excel').onclick=function(){ capExcel(this); };
  }
  cargando(caja);
  function pinta(silencio){
    var n=++CAPW.n;
    Promise.all([gesActTraer(true), gesCat()]).then(function(r){
      if(n!==CAPW.n || VISTA.actual!=='caphechas') return;
      var firma=''; try{ firma=JSON.stringify(r[0]); }catch(e){}
      if(silencio && firma && firma===CAPW.firma && $('t-cap') && document.body.contains(caja)) return;
      CAPW.firma=firma; CAPW.cat=r[1]; CAPW.filas=gesActDe(r[0], 'cap'); capPintar();
    }).catch(function(cod){ if(n!==CAPW.n || VISTA.actual!=='caphechas') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function capPintar(){
  var caja=CAPW.caja; if(!caja || !document.body.contains(caja)) return;
  var F=CAPW.filas, A=ANIO, del=F.filter(function(f){ return anioDe(f.d.fecha)===A; });
  var asis=0, hhc=0, temas={};
  del.forEach(function(f){ asis+=(f.d.gente||[]).length; hhc+=capHHC(f.d); temas[nrm(f.d.tema)]=1; });
  var hay=function(id){ return vistasDe().some(function(v){ return v.id===id; }); };
  var idCons=hay('cump') ? 'cump' : (hay('constancias') ? 'constancias' : '');
  var h='<div class="aviso" id="cap-que"><b>Aquí va lo que ya se dio y no pasó por la app</b>: lo de antes de OBRASST, o lo que se dictó en papel. '+
    'Lo que tu gente rinde en su celular entra solo'+(idCons ? ' y está en <button type="button" class="bt-link" data-ir="'+idCons+'">Constancias</button>' : '')+'. '+
    (hay('prog') ? 'Lo que todavía no se da se programa en <button type="button" class="bt-link" data-ir="prog">Programar capacitación</button>.' : '')+'</div>';
  h+='<div class="rej">'+
    cifra('Registradas en '+A, del.length, F.length===del.length ? 'capacitaciones, charlas y entrenamientos' : F.length+' en total', '')+
    cifra('Asistencias', asis, 'personas que asistieron, sumadas', '')+
    cifra('Horas hombre de capacitación', gesNum(hhc, 1), 'asistentes × duración · '+A, '')+
    cifra('Temas distintos', Object.keys(temas).length, 'en '+A, '')+'</div>';
  if(hhc>0 && hay('hh')) h+='<p class="ayuda" style="margin:-4px 0 14px">Estas horas de capacitación no se suman solas a «Horas hombre»: al registrar allí el día, se te proponen. '+
    '<button type="button" class="bt-link" data-ir="hh">Ir a Horas hombre</button></p>';
  h+='<div class="tarj" id="t-cap"></div>';
  var est=$('t-cap') ? $('t-cap')._est : null;
  caja.innerHTML=h;
  if(est) $('t-cap')._est=est;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ir]'), function(b){ b.onclick=function(){ navegar(b.getAttribute('data-ir')); }; });
  var filas=F.map(function(f){ var d=f.d; return { id:f.id, fecha:d.fecha||'', tema:d.tema||'', tipo:capTipoN(d.tipo), dicta:d.dicta||'', n:(d.gente||[]).length, min:parseFloat(d.min)||0, hhc:capHHC(d), ev:(d.ev||[]), _f:f }; });
  var cols=[
    {k:'fecha', t:'Fecha', h:function(x){ return esc(fechaLarga(x.fecha)); }},
    {k:'tema', t:'Qué se dio', h:function(x){ return '<b>'+esc(x.tema)+'</b><span class="sub">'+esc([x.tipo, x.dicta].filter(Boolean).join(' · '))+'</span>'; }, v:function(x){ return x.tema+' '+x.tipo+' '+x.dicta; }, csv:function(x){ return x.tema; }},
    {k:'tipo', t:'Tipo', soloCsv:true},
    {k:'dicta', t:'Quién la dio', soloCsv:true},
    {k:'n', t:'Asistentes', num:true, h:function(x){ var N=capNotas(x._f.d); return esc(x.n)+(N.con ? '<span class="sub">'+N.ap+(N.ap===1 ? ' aprobó' : ' aprobaron')+(N.de ? ' · '+N.de+' no' : '')+'</span>' : ''); }},
    {k:'min', t:'Duración', num:true, h:function(x){ return x.min ? esc(x.min)+' min' : '—'; }},
    {k:'hhc', t:'HHC', num:true, h:function(x){ return esc(gesNum(x.hhc, 1)); }, v:function(x){ return gesRed(x.hhc, 2); }},
    {k:'ev', t:'Lista firmada', h:function(x){ return x.ev.length ? x.ev.map(function(e, i){ return '<a href="'+esc(e.u)+'" target="_blank" rel="noopener" title="'+esc(e.n||'')+'">'+(x.ev.length>1 ? 'ver '+(i+1) : 'ver')+'</a>'; }).join(' · ') : '<span class="tenue">sin adjuntar</span>'; },
      v:function(x){ return x.ev.map(function(e){ return e.u; }).join(' '); }},
    {k:'_acc', t:'', acc:true, h:function(){ return '<button type="button" class="bt sec chico" data-acc="cambiar">Abrir</button> <button type="button" class="bt mal chico" data-acc="quitar">Quitar</button>'; }}
  ];
  tabla($('t-cap'), cols, filas, {orden:'fecha', asc:false, unidad:'registradas', archivo:'capacitaciones-realizadas',
    vacio:'Ninguna capacitación registrada a mano todavía', vacioSub:'Toca «＋ Registrar una capacitación» para cargar una que ya se dio, o «⬆ Subir desde un Excel» si llevas tu control en una hoja de cálculo.',
    alClic:function(x){ capForm(x._f); },
    accion:function(acc, x){ if(acc==='quitar') capQuitar(x._f); else capForm(x._f); }});
}
function capQuitar(f){
  var d=f.d, n=(d.gente||[]).length;
  confirmar('¿Quitar esta capacitación del registro?', '«'+d.tema+'» del '+fechaLarga(d.fecha)+' · '+gesPlural(n, 'asistente', 'asistentes')+'. '+(capEnMatriz(d.tipo) ? 'Deja de contar en la matriz y en el registro de seguimiento. ' : '')+'La lista firmada que subiste no se borra del almacenamiento.', {si:'Sí, quitarla', mal:true}).then(function(si){
    if(!si) return;
    gesActQuitar(f.id).then(function(){ toast('Capacitación quitada.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true); },
                            function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}
/* ── el formulario ── */
var CAPF = { f:null, el:null, ev:null, plan:null, guardando:false };
function capForm(f, pre){
  _gesCss(); _yaCss(); _hhCss();
  var d=(f && f.d) || pre || {}, nuevo=!f, hoy=hoyISO();
  CAPF.f=f||null; CAPF.el=null; CAPF.ev=null; CAPF.guardando=false;
  abrirHoja(nuevo ? 'Registrar una capacitación realizada' : (d.tema||'Capacitación'), nuevo ? 'Una que ya se dio: queda con su día, sus asistentes y su lista firmada' : capTipoN(d.tipo)+' · '+fechaLarga(d.fecha),
    '<div class="vacio" id="capf-carga">Trayendo el personal de la obra…</div>',
    (nuevo ? '' : '<button type="button" class="bt mal" id="capf-quitar">Quitar</button>')+'<button type="button" class="bt" id="capf-ok" disabled>'+(nuevo ? 'Guardar la capacitación' : 'Guardar los cambios')+'</button>',
    {ancha:true, sinFoco:true});
  if($('capf-quitar')) $('capf-quitar').onclick=function(){ capQuitar(f); };
  var pPlan=traer('sst_doc', '&select=id,hoja,nota&hoja=eq.temas&order=creado.desc', 300).then(function(rows){ return planDeFilas(rows); }, function(){ return null; });
  Promise.all([gesGente(), gesCat(), pPlan, gesActTraer().catch(function(){ return []; })]).then(function(r){
    if(!$('capf-carga')) return;                       /* se cerró mientras cargaba */
    CAPW.cat=r[1]; CAPF.plan=r[2];
    var tipos=capTipos(), tipo=(d.tipo && tipos.some(function(t){ return t[0]===d.tipo; })) ? d.tipo : 'capacitacion';
    /* los temas para elegir: los del plan de la obra, los del catálogo de la app y los que ya se registraron aquí */
    var vistos={}, temas=[];
    function tema(t){ t=gesTxt(t); var k=nrm(t); if(!k || vistos[k]) return; vistos[k]=1; temas.push(t); }
    if(CAPF.plan) planExigeTodo(CAPF.plan).forEach(tema);
    gesActDe(r[3], 'cap').forEach(function(x){ tema(x.d.tema); });
    ((r[1]||{}).temas||[]).forEach(function(t){ tema(t[1]); });
    var conNota=!!d.sobre;
    var h='<div class="fila-c ya-al">'+
      '<div class="campo"><label for="capf-tipo">Qué fue</label><select id="capf-tipo">'+tipos.map(function(t){ return '<option value="'+esc(t[0])+'"'+(t[0]===tipo ? ' selected' : '')+'>'+esc(t[1])+'</option>'; }).join('')+'</select></div>'+
      '<div class="campo"><label for="capf-fecha">Día en que se dio</label><input type="date" id="capf-fecha" max="'+hoy+'" value="'+esc(String(d.fecha||'').slice(0, 10))+'"></div>'+
      '<div class="campo"><label for="capf-hora">Hora de inicio <span class="tenue">· opcional</span></label><input type="time" id="capf-hora" value="'+esc(d.hora||'')+'"></div>'+
      '<div class="campo"><label for="capf-min">Duración (minutos)</label><input type="number" id="capf-min" inputmode="numeric" min="1" max="1440" step="1" value="'+esc(d.min || capMinDe(tipo))+'"></div></div>'+
      '<div class="campo"><label for="capf-tema">Tema</label><input id="capf-tema" list="capf-temas" maxlength="160" autocomplete="off" placeholder="Escríbelo o elígelo de la lista" value="'+esc(d.tema||'')+'">'+
        '<datalist id="capf-temas">'+temas.slice(0, 400).map(function(t){ return '<option value="'+esc(t)+'"></option>'; }).join('')+'</datalist><p class="ayuda" id="capf-tema-ay"></p></div>'+
      '<div class="fila-c ya-al">'+
      '<div class="campo"><label for="capf-dicta">Quién la dio</label><input id="capf-dicta" maxlength="120" autocomplete="off" value="'+esc(d.dicta||'')+'"></div>'+
      '<div class="campo"><label for="capf-cargo">Su cargo o empresa <span class="tenue">· opcional</span></label><input id="capf-cargo" maxlength="80" value="'+esc(d.cargo||'')+'"></div>'+
      '<div class="campo"><label for="capf-lugar">Lugar <span class="tenue">· opcional</span></label><input id="capf-lugar" maxlength="120" value="'+esc(d.lugar||'')+'"></div></div>'+
      '<div class="seccion"><h3>Quiénes asistieron</h3><div id="capf-gente"></div>'+
      '<label class="chk" style="margin:12px 0 0"><input type="checkbox" id="capf-connota"'+(conNota ? ' checked' : '')+'> <span>Hubo evaluación con nota <small class="tenue">· se anota la de cada uno, al lado de su nombre</small></span></label>'+
      '<div class="fila-c ya-al" id="capf-nota-c" style="margin-top:10px"'+(conNota ? '' : ' hidden')+'><div class="campo"><label for="capf-sobre">Nota máxima</label><input type="number" id="capf-sobre" inputmode="numeric" min="1" max="1000" step="1" value="'+esc(d.sobre||20)+'"></div>'+
        '<div class="campo"><label for="capf-minimo">Mínima para aprobar</label><input type="number" id="capf-minimo" inputmode="decimal" min="0" step="0.5" value="'+esc(d.minimo!=null && d.sobre ? d.minimo : 14)+'"></div></div></div>'+
      '<div class="seccion"><h3>La lista firmada</h3><div id="capf-ev"></div></div>'+
      '<div class="campo" style="margin-top:16px"><label for="capf-obs">Observaciones <span class="tenue">· opcional</span></label><textarea id="capf-obs" rows="2" maxlength="600">'+esc(d.obs||'')+'</textarea></div>'+
      '<div class="msg" id="capf-msg" role="status"></div><div class="hh-total" id="capf-res"></div>';
    $('hoja-cuerpo').innerHTML=h;
    CAPF.el=gesElegir($('capf-gente'), { id:'capf-el', gente:r[0], sel:d.gente||[], conNota:conNota, sobre:d.sobre||20, alCambiar:_capfCalc });
    CAPF.ev=gesEvidencia($('capf-ev'), { id:'capf-evi', lista:d.ev||[], max:4, texto:'Adjuntar la lista firmada (PDF o foto)', ayuda:'La hoja de asistencia con las firmas, escaneada o en foto. Hasta 4 archivos de 20 MB.' });
    $('capf-tipo').onchange=function(){ if(nuevo && !$('capf-min')._tocado) $('capf-min').value=capMinDe(this.value); _capfTema(); _capfCalc(); };
    $('capf-min').oninput=function(){ this._tocado=true; _capfCalc(); };
    $('capf-tema').oninput=_capfTema;
    $('capf-connota').onchange=function(){ $('capf-nota-c').hidden=!this.checked; CAPF.el.ponNota(this.checked, parseFloat($('capf-sobre').value)||20); };
    $('capf-sobre').onchange=function(){ if($('capf-connota').checked) CAPF.el.ponNota(true, parseFloat(this.value)||20); };
    $('capf-ok').disabled=false; $('capf-ok').onclick=_capfGuardar;
    _capfTema(); _capfCalc();
  }, function(e){ var c=$('capf-carga'); if(c) c.innerHTML='<b>No se pudo abrir</b>'+esc(porQueFallo(e)); });
}
function _capfTema(){
  var a=$('capf-tema-ay'); if(!a) return;
  var k=nrm($('capf-tema').value), tipo=$('capf-tipo').value, plan=CAPF.plan;
  if(!capEnMatriz(tipo)){ a.textContent='Queda como registro de asistencia: las charlas, difusiones y reuniones no entran a la matriz de capacitación.'; return; }
  if(!k){ a.textContent=plan ? 'Si es uno de los temas del plan de capacitación de la obra, elígelo de la lista: así cuenta en la matriz.' : 'Cuenta en la matriz de capacitación de quienes asistieron.'; return; }
  var enPlan=plan && planExigeTodo(plan).some(function(t){ return nrm(t)===k; });
  a.textContent=enPlan ? '✓ Es un tema del plan de capacitación de la obra: cuenta en la matriz de quienes asistieron.'
    : (plan ? 'No está entre los temas del plan de la obra: saldrá en la matriz como un tema adicional. Si es uno del plan, elígelo de la lista para que cuente como ese.' : 'Cuenta en la matriz de capacitación de quienes asistieron.');
}
function _capfCalc(){
  var r=$('capf-res'); if(!r || !CAPF.el) return;
  var n=CAPF.el.n(), min=parseInt($('capf-min').value, 10)||0;
  r.innerHTML=n ? '<b>'+gesPlural(n, 'asistente', 'asistentes')+'</b>'+(min ? ' × '+min+' min = <b>'+gesNum(n*min/60, 1)+' HHC</b>' : '') : 'Marca a quienes asistieron.';
}
function _capfGuardar(){
  if(CAPF.guardando) return;
  var m=$('capf-msg'), bt=$('capf-ok'), f=CAPF.f;
  var mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} };
  var fe=$('capf-fecha').value, tema=gesTxt($('capf-tema').value), min=parseInt($('capf-min').value, 10), tipo=$('capf-tipo').value;
  if(!fe) return mal('Falta el día en que se dio.', 'capf-fecha');
  if(!gesFechaPasada(fe)) return mal('Ese día todavía no llega: aquí va lo que ya se dio. Si es para más adelante, se programa en «Programar capacitación».', 'capf-fecha');
  if(tema.length<3) return mal('Falta el tema.', 'capf-tema');
  if(!(min>=1 && min<=1440)) return mal('¿Cuánto duró? Ponlo en minutos (de 1 a 1440).', 'capf-min');
  var conNota=$('capf-connota').checked, sobre=null, minimo=null;
  if(conNota){
    sobre=parseFloat($('capf-sobre').value); minimo=parseFloat(String($('capf-minimo').value).replace(',', '.'));
    if(!(sobre>0)) return mal('Falta la nota máxima.', 'capf-sobre');
    if(!(minimo>=0 && minimo<=sobre)) return mal('La nota mínima para aprobar tiene que estar entre 0 y '+sobre+'.', 'capf-minimo');
    CAPF.el.ponNota(true, sobre);
  }
  var gente=CAPF.el.elegidos();
  if(!gente.length) return mal('Marca a quienes asistieron (al menos una persona).');
  if(gente.length>2000) return mal('Son más de 2000 asistentes en un solo registro: pártelo en dos.');
  if(conNota){
    var fuera=gente.filter(function(g){ return g.nota!=null && (g.nota<0 || g.nota>sobre); })[0];
    if(fuera) return mal('La nota de '+fuera.n+' ('+fuera.nota+') no está entre 0 y '+sobre+'.');
    if(!gente.some(function(g){ return g.nota!=null; })) return mal('Marcaste que hubo evaluación: anota la nota de al menos una persona (al lado de su nombre), o desmarca la casilla.');
  } else gente.forEach(function(g){ delete g.nota; });
  var d={ v:1, k:'cap', tipo:tipo, fecha:fe, hora:$('capf-hora').value||'', min:min, tema:tema.slice(0, 160), dicta:gesTxt($('capf-dicta').value).slice(0, 120), cargo:gesTxt($('capf-cargo').value).slice(0, 80),
          lugar:gesTxt($('capf-lugar').value).slice(0, 120), obs:String($('capf-obs').value||'').trim().slice(0, 600), sobre:conNota ? sobre : null, minimo:conNota ? minimo : null, gente:gente, ev:[],
          por:(f && f.d.por) || gesQuien(), cuando:(f && f.d.cuando) || new Date().toISOString() };
  if(f) d.cambio=new Date().toISOString();
  /* ¿ya está registrada? (el mismo tema, el mismo día): se pregunta antes de contarla dos veces */
  var otra=(CAPW.filas||[]).filter(function(x){ return (!f || x.id!==f.id) && x.d.fecha===fe && nrm(x.d.tema)===nrm(tema) && x.d.tipo===tipo; })[0];
  var sigue=otra ? confirmar('Ya hay una registrada con ese tema ese día', '«'+otra.d.tema+'» del '+fechaLarga(fe)+' ya está, con '+gesPlural((otra.d.gente||[]).length, 'asistente', 'asistentes')+'. Si es otro grupo u otro turno, guárdala; si es la misma, mejor abre esa y corrígela.', {si:'Guardar esta también'}) : Promise.resolve(true);
  sigue.then(function(si){
    if(!si) return;
    CAPF.guardando=true; bt.disabled=true; m.className='msg gris'; m.textContent=CAPF.ev.n() ? 'Subiendo la lista firmada…' : 'Guardando…';
    return CAPF.ev.subir().then(function(ev){
      d.ev=ev; m.textContent='Guardando…';
      return gesActGuardar(f ? f.id : null, d, capTipoN(tipo)+' realizada · '+d.tema+' · '+fe);
    }).then(function(){
      CAPF.guardando=false;
      toast((f ? 'Guardado: ' : 'Capacitación registrada: ')+gesPlural(gente.length, 'asistente', 'asistentes')+' · '+gesNum(capHHC(d), 1)+' HHC.');
      cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    });
  }).catch(function(e){
    CAPF.guardando=false; bt.disabled=false;
    mal(e==='muy-grande' ? 'Un archivo pesa más de 25 MB: comprímelo o súbelo en partes.' : 'No se pudo guardar. '+porQueFallo(e));
  });
}
/* ── el Excel: una hoja con las capacitaciones y otra con cada asistente ── */
function capExcel(bt){
  var F=(CAPW.filas||[]).slice().sort(function(a, b){ return String(a.d.fecha).localeCompare(String(b.d.fecha)); });
  if(!F.length){ toast('Todavía no hay capacitaciones registradas para exportar.'); return; }
  if(bt) bt.disabled=true;
  cargarEvPDF().then(function(){
    var X=RCAP.xlsx, E=new X.Estilos(), C=X.C, obra=String(nombreObraP()||'');
    var sTit=E.xf({ b:1, sz:14, c:C.petroleo }), sSub=E.xf({ sz:10, c:C.gris }), sCab=E.xf({ b:1, sz:9, c:C.blanco, f:C.petroleo, h:'left', v:'center', wrap:1, borde:true });
    var sTx=E.xf({ sz:10, c:C.tinta, borde:true }), sTxW=E.xf({ sz:10, c:C.tinta, borde:true, wrap:1 }), sN0=E.xf({ sz:10, c:C.tinta, h:'right', borde:true, fmt:'#,##0' }), sN1=E.xf({ sz:10, c:C.tinta, h:'right', borde:true, fmt:'#,##0.0' }),
        sFe=E.xf({ sz:10, c:C.tinta, h:'center', borde:true, fmt:'dd/mm/yyyy' });
    var h=new X.Hoja('Capacitaciones'); h.activa=true; h.pie='Capacitaciones realizadas';
    h.unir(0, 1, 11, 1, 'Capacitaciones realizadas · '+obra, sTit); h.altos[1]=22;
    h.unir(0, 2, 11, 2, 'Las registradas a mano en el portal (lo dictado fuera de la app). HHC = asistentes × duración ÷ 60.', sSub);
    ['Fecha', 'Tipo', 'Tema', 'Quién la dio', 'Cargo o empresa', 'Lugar', 'Duración (min)', 'Asistentes', 'HHC', 'Aprobaron', 'Lista firmada', 'Observaciones'].forEach(function(t, i){ h.celda(i, 4, t, sCab); });
    [12, 22, 40, 26, 22, 20, 12, 11, 10, 11, 40, 40].forEach(function(w, i){ h.anchos[i]=w; }); h.altos[4]=28;
    var g=new X.Hoja('Asistentes'); g.pie='Capacitaciones realizadas';
    ['Fecha', 'Tipo', 'Tema', 'Trabajador', 'Documento', 'Puesto', 'Área', 'Resultado', 'Nota', 'Sobre', 'Horas'].forEach(function(t, i){ g.celda(i, 1, t, sCab); });
    [12, 22, 40, 34, 18, 22, 18, 14, 8, 8, 8].forEach(function(w, i){ g.anchos[i]=w; });
    var fr=5, gr=2;
    F.forEach(function(f){
      var d=f.d, N=capNotas(d), se=X.serial(String(d.fecha||'').slice(0, 10)), n=(d.gente||[]).length;
      h.celda(0, fr, se, sFe); h.celda(1, fr, capTipoN(d.tipo), sTx); h.celda(2, fr, d.tema||'', sTxW); h.celda(3, fr, d.dicta||'', sTx); h.celda(4, fr, d.cargo||'', sTx); h.celda(5, fr, d.lugar||'', sTx);
      h.celda(6, fr, parseFloat(d.min)||0, sN0); h.celda(7, fr, n, sN0); h.celda(8, fr, gesRed(capHHC(d), 2), sN1, 'G'+fr+'*H'+fr+'/60');
      if(N.con) h.celda(9, fr, N.ap, sN0); else h.celda(9, fr, '', sTx);
      h.celda(10, fr, (d.ev||[]).map(function(e){ return e.u; }).join('  '), sTx); h.celda(11, fr, d.obs||'', sTxW);
      fr++;
      (d.gente||[]).forEach(function(p){
        var con=(d.sobre && p.nota!=null && p.nota!=='');
        g.celda(0, gr, se, sFe); g.celda(1, gr, capTipoN(d.tipo), sTx); g.celda(2, gr, d.tema||'', sTx); g.celda(3, gr, p.n||'', sTx); g.celda(4, gr, [p.td, p.d].filter(Boolean).join(' '), sTx);
        g.celda(5, gr, p.p||'', sTx); g.celda(6, gr, p.a||'', sTx); g.celda(7, gr, con ? (+p.nota>=(+d.minimo||0) ? 'Aprobó' : 'Desaprobó') : 'Participó', sTx);
        if(con){ g.celda(8, gr, +p.nota, sN1); g.celda(9, gr, +d.sobre, sN0); } else { g.celda(8, gr, '', sTx); g.celda(9, gr, '', sTx); }
        g.celda(10, gr, gesRed((parseFloat(d.min)||0)/60, 2), sN1);
        gr++;
      });
    });
    h.celda(0, fr, 'Total', E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, borde:true }));
    for(var i=1; i<12; i++) h.celda(i, fr, '', E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, borde:true }));
    var sT=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, h:'right', borde:true, fmt:'#,##0.0' }), sT0=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, h:'right', borde:true, fmt:'#,##0' });
    h.celda(7, fr, F.reduce(function(s, f){ return s+(f.d.gente||[]).length; }, 0), sT0, 'SUM(H5:H'+(fr-1)+')');
    h.celda(8, fr, gesRed(F.reduce(function(s, f){ return s+capHHC(f.d); }, 0), 2), sT, 'SUM(I5:I'+(fr-1)+')');
    h.congelar={ c:0, r:4 }; h.filtro='A4:L'+(fr-1);
    g.congelar={ c:0, r:1 }; if(gr>2) g.filtro='A1:K'+(gr-1);
    bajarBlob(X.libro([h, g], E, 'Capacitaciones realizadas'), nombreArchivo('Capacitaciones realizadas - '+obra)+'.xlsx');
    if(bt) bt.disabled=false;
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar el Excel. Revisa tu conexión.'); });
}
/* las HHC de las capacitaciones registradas aquí en un día (para proponerlas en «Horas hombre») */
function gesCapHHCDe(iso){
  return gesActTraer().then(function(l){
    var o={ n:0, asis:0, hhc:0 };
    gesActDe(l, 'cap').forEach(function(f){ if(String(f.d.fecha||'').slice(0, 10)!==iso) return; o.n++; o.asis+=(f.d.gente||[]).length; o.hhc+=capHHC(f.d); });
    return o;
  }, function(){ return { n:0, asis:0, hhc:0 }; });
}

/* ── 4.1 bis · SUBIR LAS CAPACITACIONES DESDE UN EXCEL ────────────────────────────────────────
   El control que ya llevaba la obra entra de una vez. Se entienden dos formas de hoja:
   · LISTA: una fila por persona y capacitación (documento o nombre · tema · fecha; y si están: nota, duración u
     horas, expositor, tipo);
   · MATRIZ: una fila por persona y una columna por tema, con la fecha en la celda.
   De ahí salen las capacitaciones (un tema en un día = una capacitación, con sus asistentes). Antes de guardar se ve
   cuántas son, cuántas ya estaban y qué filas no se entendieron. Lo que ya estaba registrado no se repite. */
var GES_CAP_CAMPOS = [
  { k:'nombre', t:'Apellidos y nombres', sin:['apellidos y nombres', 'nombres y apellidos', 'apellidos nombres', 'nombre completo', 'nombre y apellido', 'apellido y nombre', 'nombre', 'trabajador', 'colaborador', 'participante', 'asistente', 'personal', 'empleado'] },
  { k:'dni',    t:'Documento', sin:['numero de documento', 'nro de documento', 'n de documento', 'nro documento', 'documento de identidad', 'doc identidad', 'documento', 'dni', 'cedula', 'ci', 'run', 'rut', 'curp', 'cuil', 'identificacion', 'nro doc', 'n doc', 'doc'] },
  { k:'puesto', t:'Puesto', sin:['puesto de trabajo', 'puesto', 'cargo', 'ocupacion', 'categoria'] },
  { k:'tema',   t:'Tema', sin:['tema de la capacitacion', 'tema de capacitacion', 'nombre de la capacitacion', 'nombre del curso', 'tema tratado', 'temas tratados', 'capacitacion', 'tema', 'curso', 'charla', 'titulo', 'asunto', 'actividad'] },
  { k:'fecha',  t:'Fecha', sin:['fecha de la capacitacion', 'fecha de capacitacion', 'fecha de realizacion', 'fecha de ejecucion', 'fecha del curso', 'fecha', 'dia'] },
  { k:'nota',   t:'Nota', sin:['nota final', 'nota obtenida', 'nota', 'calificacion', 'puntaje', 'resultado'] },
  { k:'min',    t:'Duración (minutos)', sin:['duracion en minutos', 'duracion minutos', 'duracion min', 'minutos', 'duracion'] },
  { k:'horas',  t:'Horas', sin:['horas lectivas', 'horas de capacitacion', 'numero de horas', 'n de horas', 'nro de horas', 'horas', 'hh'] },
  { k:'dicta',  t:'Expositor', sin:['expositor', 'capacitador', 'instructor', 'ponente', 'facilitador', 'dictado por', 'responsable'] },
  { k:'tipo',   t:'Tipo', sin:['tipo de actividad', 'tipo de capacitacion', 'tipo de registro', 'tipo'] }
];
var CAPS = null;
function capSubir(){
  _gesCss(); _yaCss();
  CAPS={ hojas:[], hoja:0, nombre:'', modo:'', tit:-1, map:{}, cols:[], quita:{}, tipo:'capacitacion', min:null, ses:[], prob:[], gente:null, n:{} };
  var S=CAPS;
  gesGente(true).then(function(l){ if(CAPS!==S) return; S.gente=l||[]; if($('cs-res')) _csPintarRevisar(); });
  _csPintarArchivo();
}
function _csPintarArchivo(aviso){
  var per=docPersonaP();
  var h=(aviso ? '<div class="aviso mal" id="cs-aviso" role="alert">'+esc(aviso)+'</div>' : '')+
    '<p style="margin:0 0 14px">Sube el control de capacitaciones que ya llevas. Sirve de dos formas: una fila por persona y capacitación (con su tema y su fecha), o tu matriz (las personas en filas, los temas en columnas y la fecha en cada celda). Antes de guardar vas a ver cómo queda.</p>'+
    '<label class="ges-zona" id="cs-zona" tabindex="0"><span class="ges-ic" aria-hidden="true">⬆</span><b>Suelta aquí tu Excel o tócalo para elegirlo</b>'+
      '<span>Excel (.xlsx) o .csv</span><input type="file" id="cs-file" accept=".xlsx,.xlsm,.csv,.txt,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"></label>'+
    '<div class="ges-o">o</div>'+
    '<div class="campo"><label for="cs-pega">Copia las filas de tu Excel (con sus títulos) y pégalas aquí</label>'+
      '<textarea id="cs-pega" rows="5" spellcheck="false" placeholder="'+esc(per)+'&#9;Apellidos y nombres&#9;Tema&#9;Fecha&#10;…&#9;Quispe Rojas, Ana&#9;Trabajos en altura&#9;12/03/2026"></textarea></div>'+
    '<div class="acciones"><button type="button" class="bt sec" id="cs-leer">Leer lo pegado</button></div>'+
    '<div class="msg" id="cs-msg" role="status"></div>'+
    '<div class="seccion"><h3>Para que salga a la primera</h3><p class="ayuda" style="margin:0">Cada columna con su título arriba («'+esc(per)+'», «Apellidos y nombres», «Tema», «Fecha»…). Si prefieres empezar de cero, '+
      '<button type="button" class="bt-link" id="cs-plantilla">descarga la plantilla</button> y llénala.</p></div>';
  abrirHoja('Subir capacitaciones desde un Excel', 'Las que ya se dieron, de tu hoja de control a OBRASST', h, '<button type="button" class="bt sec" id="cs-no">Cancelar</button>', {ancha:true, sinFoco:true});
  $('cs-no').onclick=cerrarHoja;
  var z=$('cs-zona'), fi=$('cs-file'), m=$('cs-msg');
  function leyo(x, nombre){
    if(!x || !x.hojas || !x.hojas.length){ _csPintarArchivo('Ese archivo no trae ninguna fila con datos.'); return; }
    CAPS.hojas=x.hojas; CAPS.nombre=nombre||''; CAPS.hoja=_csMejorHoja(x.hojas); CAPS.quita={}; _csPreparar(); _csPintarRevisar();
  }
  function archivo(f){ if(!f) return; m.className='msg gris'; m.textContent='Leyendo «'+f.name+'»…'; gesLeerArchivo(f).then(function(x){ leyo(x, f.name); }, function(e){ _csPintarArchivo(gesNoLeyo(e)); }); }
  fi.onchange=function(){ archivo(fi.files && fi.files[0]); };
  ['dragenter', 'dragover'].forEach(function(ev){ z.addEventListener(ev, function(e){ e.preventDefault(); z.classList.add('sobre'); }); });
  ['dragleave', 'dragend'].forEach(function(ev){ z.addEventListener(ev, function(){ z.classList.remove('sobre'); }); });
  z.addEventListener('drop', function(e){ e.preventDefault(); z.classList.remove('sobre'); archivo(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });
  z.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); fi.click(); } });
  $('cs-leer').onclick=function(){
    var t=$('cs-pega').value;
    if(!gesTxt(t)){ m.className='msg mal'; m.textContent='Pega primero las filas copiadas de tu Excel.'; $('cs-pega').focus(); return; }
    var filas=gesLeerTexto(t, true);
    leyo({ hojas:filas.length ? [{ n:'', filas:filas }] : [] }, '');
  };
  $('cs-plantilla').onclick=function(){ _csPlantilla(this); };
}
/* ¿cuántas de las celdas con algo, de esa columna, son una fecha? */
function _csFechasEn(filas, desde, c){
  var con=0, fe=0;
  for(var i=desde; i<filas.length && con<400; i++){ var v=gesTxt(filas[i][c]); if(!v) continue; con++; if(gesFecha(v)) fe++; }
  return { con:con, fe:fe };
}
/* la forma de una hoja: 'lista' (tiene tema y fecha), 'matriz' (personas y columnas de fechas) o '' */
function _csForma(filas){
  var tit=gesFilaTitulos(filas, GES_CAP_CAMPOS, ['nombre', 'dni']);
  if(tit<0) return { modo:'', tit:-1, map:{}, cols:[] };
  var map=gesMapear(filas[tit], GES_CAP_CAMPOS);
  if(map.nombre===undefined && map.dni===undefined) return { modo:'', tit:tit, map:map, cols:[] };
  /* la columna «Fecha» de una lista tiene fechas; si no, no es esa */
  if(map.tema!==undefined && map.fecha!==undefined && _csFechasEn(filas, tit+1, map.fecha).fe>0) return { modo:'lista', tit:tit, map:map, cols:[] };
  /* matriz: las columnas que no son datos de la persona y traen fechas */
  var deP=gesMapear(filas[tit], GES_PER_CAMPOS), usadas={};
  Object.keys(deP).forEach(function(k){ usadas[deP[k]]=1; });
  ['nombre', 'dni', 'puesto'].forEach(function(k){ if(map[k]!==undefined) usadas[map[k]]=1; });
  var ncol=filas.reduce(function(n, f){ return Math.max(n, f.length); }, 0), cols=[];
  for(var c=0; c<ncol; c++){
    if(usadas[c]) continue;
    var t=gesTxt(filas[tit][c]); if(t.length<3 || /^(n|nro|no|num|item|#|n°|nº|edad|sexo|telefono|celular|correo|email|observaciones?|firma|total|%|avance|cumplimiento)$/i.test(nrm(t).replace(/\s/g, ''))) continue;
    if(/nacimiento|cese|vencimiento|vence|caducidad/.test(nrm(t))) continue;
    var q=_csFechasEn(filas, tit+1, c);
    if(q.fe>=1 && q.fe>=q.con*0.5) cols.push({ c:c, t:t.slice(0, 160), n:q.fe });
  }
  return { modo:cols.length ? 'matriz' : '', tit:tit, map:map, cols:cols };
}
function _csMejorHoja(hojas){
  var mejor=0, max=-1;
  hojas.forEach(function(h, i){ var f=_csForma(h.filas), p=(f.modo==='lista' ? 3000 : (f.modo==='matriz' ? 2000+f.cols.length : 0))+Math.min(h.filas.length, 900); if(p>max){ max=p; mejor=i; } });
  return mejor;
}
function _csPreparar(){
  var S=CAPS, H=S.hojas[S.hoja]||{ filas:[] }, f=_csForma(H.filas);
  S.modo=f.modo; S.tit=f.tit; S.map=f.map; S.cols=f.cols;
}
/* el tipo escrito como sea → uno de los de la app */
function _csTipo(txt, def){
  var t=nrm(txt); if(!t) return def;
  if(/induc/.test(t)) return 'induccion';
  if(/entren|adiestr/.test(t)) return 'entrenamiento';
  if(/taller/.test(t)) return 'taller';
  if(/charla|5 min|cinco min/.test(t)) return 'charla';
  if(/difusi/.test(t)) return 'difusion';
  if(/sensibil/.test(t)) return 'sensibilizacion';
  if(/retro/.test(t)) return 'retro';
  if(/reuni/.test(t)) return 'reunion';
  if(/parada/.test(t)) return 'parada';
  if(/capacit|curso/.test(t)) return 'capacitacion';
  return def;
}
/* la hoja → las capacitaciones (S.ses) y lo que no se entendió (S.prob) */
function _csCalcular(){
  var S=CAPS, H=S.hojas[S.hoja]||{ filas:[] }, M=S.map, hoy=hoyISO(), pais=paisObraP();
  var tdDef='DNI'; try{ tdDef=(docPais(pais).tipos||[['DNI']])[0][0]; }catch(e){}
  var porDoc={}, porNom={};
  (S.gente||[]).forEach(function(t){ var d=String(t.dni||'').trim().toUpperCase(); if(d) porDoc[d]=t; var n=nrm(t.nombre).split(' ').filter(Boolean).sort().join(' '); if(n && !porNom[n]) porNom[n]=t; });
  var ya={}; (CAPW.filas||[]).forEach(function(f){ ya[f.d.fecha+'|'+nrm(f.d.tema)+'|'+f.d.tipo]=1; });
  var ses={}, orden=[], prob=[], n={ filas:0, asis:0, fuera:0, deCasa:0 };
  var v=function(f, k){ return (M[k]===undefined || M[k]<0) ? '' : gesTxt(f[M[k]]); };
  function persona(f, fila){
    var nombre=v(f, 'nombre').replace(/\s+,/g, ',').slice(0, 120), crudo=v(f, 'dni');
    var dni=crudo ? ((typeof docPersonaNorm==='function') ? docPersonaNorm(tdDef, crudo) : crudo.replace(/\s/g, '')) : '';
    if(tdDef==='DNI' && pais==='pe' && /^\d{6,7}$/.test(dni)) dni=('00000000'+dni).slice(-8);
    var t=(dni && porDoc[dni.toUpperCase()]) || null;
    if(!t && nombre){ var kn=nrm(nombre).split(' ').filter(Boolean).sort().join(' '); t=porNom[kn]||null; }
    if(t) return { k:'f:'+t.id, o:{ n:gesTxt(t.nombre), d:String(t.dni||''), td:t.td||(t.dni ? tdDef : ''), p:gesTxt(t.puesto), a:gesTxt(t.area), id:t.id }, casa:true };
    if(nombre.length<3 || !/[a-záéíóúñ]/i.test(nombre)){ if(dni.length>=6) prob.push('Fila '+fila+': el documento '+dni+' no está en tu personal y la fila no trae el nombre.'); return null; }
    return { k:'x:'+nrm(nombre)+'|'+dni, o:{ n:nombre, d:dni.slice(0, 20), td:dni ? tdDef : '', p:v(f, 'puesto').slice(0, 80), a:'' }, casa:false };
  }
  function suma(P, tema, feCruda, fila, extra){
    tema=gesTxt(tema).slice(0, 160);
    var fe=gesFecha(feCruda);
    if(tema.length<3){ prob.push('Fila '+fila+': sin tema.'); return; }
    if(!fe){ prob.push('Fila '+fila+': «'+tema.slice(0, 40)+'» sin fecha que se entienda'+(gesTxt(feCruda) ? ' («'+gesTxt(feCruda).slice(0, 20)+'»)' : '')+'.'); return; }
    if(fe>hoy){ prob.push('Fila '+fila+': «'+tema.slice(0, 40)+'» tiene una fecha que todavía no llega ('+fechaLarga(fe)+'): eso se programa, no se registra.'); return; }
    if(fe<'2000-01-01'){ prob.push('Fila '+fila+': la fecha '+fechaLarga(fe)+' es demasiado antigua.'); return; }
    var tipo=_csTipo(extra.tipo, S.tipo), k=fe+'|'+nrm(tema)+'|'+tipo, s=ses[k];
    if(!s){ s=ses[k]={ k:k, fecha:fe, tema:tema, tipo:tipo, min:0, dicta:'', gente:{}, lista:[], ya:!!ya[k], notas:false, max:0 }; orden.push(k); }
    if(!s.min && extra.min) s.min=extra.min;
    if(!s.dicta && extra.dicta) s.dicta=extra.dicta;
    if(s.gente[P.k]) return;                                   /* la misma persona dos veces en la misma capacitación */
    var o={}; for(var q in P.o) o[q]=P.o[q];
    if(extra.nota!=null){ o.nota=extra.nota; s.notas=true; if(extra.nota>s.max) s.max=extra.nota; }
    else if(extra.desap) o.r='d';
    s.gente[P.k]=1; s.lista.push(o);
    n.asis++; if(P.casa) n.deCasa++; else n.fuera++;
  }
  H.filas.forEach(function(f, i){
    if(i<=S.tit) return;
    var fila=f.r||(i+1);
    if(S.modo==='lista' && !v(f, 'tema') && !v(f, 'fecha')) return;
    var P=persona(f, fila);
    if(!P){ return; }
    n.filas++;
    if(S.modo==='lista'){
      var nt=v(f, 'nota'), num=parseFloat(String(nt).replace(',', '.')), mins=parseFloat(String(v(f, 'min')).replace(',', '.')), hs=parseFloat(String(v(f, 'horas')).replace(',', '.'));
      suma(P, v(f, 'tema'), v(f, 'fecha'), fila, { nota:(nt!=='' && !isNaN(num) && num>=0 && num<=1000 && /^[\d.,\s]+$/.test(nt)) ? num : null, desap:/desaprob|no aprob|reprob/.test(nrm(nt)),
        min:(mins>0 && mins<=1440) ? Math.round(mins) : ((hs>0 && hs<=24) ? Math.round(hs*60) : 0), dicta:v(f, 'dicta').slice(0, 120), tipo:v(f, 'tipo') });
    } else {
      S.cols.forEach(function(c){ if(S.quita[c.c]) return; var cel=gesTxt(f[c.c]); if(!cel) return;
        if(!gesFecha(cel)){ if(!/^(x|si|sí|ok|✓|✔|n\/a|na|no|-|—|pendiente|falta)$/i.test(cel)) prob.push('Fila '+fila+': en «'+c.t.slice(0, 40)+'» dice «'+cel.slice(0, 20)+'», que no es una fecha.'); else if(/^(x|si|sí|ok|✓|✔)$/i.test(cel)) prob.push('Fila '+fila+': en «'+c.t.slice(0, 40)+'» está marcado pero sin fecha: no se puede registrar sin saber el día.'); return; }
        suma(P, c.t, cel, fila, { nota:null, min:0, dicta:'', tipo:'' });
      });
    }
  });
  S.ses=orden.map(function(k){ var s=ses[k];
    return { fecha:s.fecha, tema:s.tema, tipo:s.tipo, min:s.min||S.min||capMinDe(s.tipo), dicta:s.dicta, gente:s.lista, ya:s.ya, sobre:s.notas ? (s.max>20 ? 100 : 20) : null, minimo:s.notas ? (s.max>20 ? 70 : 14) : null }; })
    .sort(function(a, b){ return String(b.fecha).localeCompare(String(a.fecha)) || a.tema.localeCompare(b.tema, 'es'); });
  S.prob=prob; S.n=n;
  return S.ses;
}
function _csPintarRevisar(){
  var S=CAPS, H=S.hojas[S.hoja]||{ filas:[] };
  var h='';
  if(S.hojas.length>1) h+='<div class="campo"><label for="cs-hoja">Tu archivo tiene '+S.hojas.length+' hojas. ¿En cuál está el control?</label><select id="cs-hoja">'+
    S.hojas.map(function(x, i){ return '<option value="'+i+'"'+(i===S.hoja ? ' selected' : '')+'>'+esc((x.n||'Hoja '+(i+1))+' · '+gesPlural(x.filas.length, 'fila', 'filas'))+'</option>'; }).join('')+'</select></div>';
  if(!S.modo){
    h+='<div class="aviso ojo" id="cs-noforma"><b>No reconocí la forma de esta hoja.</b> Tiene que traer, con su título arriba, quién (el documento o el nombre) y, por cada capacitación, su <b>tema</b> y su <b>fecha</b>; o ser una matriz con las personas en filas, los temas en columnas y la fecha en cada celda. '+
      '<button type="button" class="bt-link" id="cs-plantilla2">Descarga la plantilla</button> para ver cómo.</div><div id="cs-res"></div>';
  } else {
    h+='<div class="aviso" id="cs-forma">'+(S.modo==='lista'
      ? '<b>La leí como una lista</b>: cada fila, una persona en una capacitación (columnas «'+esc(gesTxt(H.filas[S.tit][S.map.tema]))+'» y «'+esc(gesTxt(H.filas[S.tit][S.map.fecha]))+'»).'
      : '<b>La leí como una matriz</b>: cada fila es una persona y cada columna con fechas, un tema. Desmarca las columnas que no sean capacitaciones.')+'</div>';
    if(S.modo==='matriz') h+='<div class="campo"><label>Los temas (las columnas con fechas)</label><div class="chips" id="cs-cols">'+S.cols.map(function(c){ var on=!S.quita[c.c];
      return '<button type="button" class="chip'+(on ? ' on' : '')+'" aria-pressed="'+(on ? 'true' : 'false')+'" data-c="'+c.c+'">'+esc(c.t.slice(0, 48))+' <i>'+c.n+'</i></button>'; }).join('')+'</div></div>';
    var conMin=(S.modo==='lista' && (S.map.min!==undefined || S.map.horas!==undefined)), conTipo=(S.modo==='lista' && S.map.tipo!==undefined);
    h+='<div class="fila-c ya-al">'+
      '<div class="campo"><label for="cs-tipo">'+(conTipo ? 'Si la fila no dice qué fue, es una' : 'Todas son')+'</label><select id="cs-tipo">'+capTipos().map(function(t){ return '<option value="'+esc(t[0])+'"'+(t[0]===S.tipo ? ' selected' : '')+'>'+esc(t[1])+'</option>'; }).join('')+'</select></div>'+
      '<div class="campo"><label for="cs-min">'+(conMin ? 'Si la fila no dice cuánto duró (minutos)' : 'Cada una duró (minutos)')+'</label><input type="number" id="cs-min" inputmode="numeric" min="1" max="1440" step="1" value="'+esc(S.min||'')+'" placeholder="'+esc(capMinDe(S.tipo))+' · lo usual de su tipo"></div></div>'+
      '<div id="cs-res"></div>';
  }
  abrirHoja('Subir capacitaciones desde un Excel', (S.nombre ? '«'+S.nombre+'» · ' : '')+'revisa cómo queda antes de guardar', h,
    '<button type="button" class="bt sec" id="cs-otro">Elegir otro archivo</button><button type="button" class="bt" id="cs-ok" disabled>Registrar</button>', {ancha:true, sinFoco:true});
  if($('cs-hoja')) $('cs-hoja').onchange=function(){ S.hoja=+this.value; S.quita={}; _csPreparar(); _csPintarRevisar(); };
  if($('cs-plantilla2')) $('cs-plantilla2').onclick=function(){ _csPlantilla(this); };
  if($('cs-cols')) $('cs-cols').onclick=function(ev){ var b=ev.target.closest('[data-c]'); if(!b) return; var c=+b.getAttribute('data-c'); if(S.quita[c]) delete S.quita[c]; else S.quita[c]=1; _csPintarRevisar(); };
  if($('cs-tipo')) $('cs-tipo').onchange=function(){ S.tipo=this.value; $('cs-min').placeholder=capMinDe(S.tipo)+' · lo usual de su tipo'; _csPintarRes(); };
  if($('cs-min')) $('cs-min').oninput=function(){ var x=parseInt(this.value, 10); S.min=(x>=1 && x<=1440) ? x : null; _csPintarRes(); };
  $('cs-otro').onclick=function(){ _csPintarArchivo(); };
  $('cs-ok').onclick=_csSubir;
  _csPintarRes();
}
function _csPintarRes(){
  var S=CAPS, c=$('cs-res'), bt=$('cs-ok'); if(!c) return;
  if(!S.modo){ c.innerHTML=''; if(bt){ bt.disabled=true; bt.textContent='Registrar'; } return; }
  if(!S.gente){ c.innerHTML='<div class="vacio">Revisando tu personal…</div>'; if(bt) bt.disabled=true; return; }
  _csCalcular();
  var nuevas=S.ses.filter(function(s){ return !s.ya; }), yaE=S.ses.length-nuevas.length, asis=nuevas.reduce(function(t, s){ return t+s.gente.length; }, 0);
  var h='<div class="seccion"><h3>Así queda</h3>';
  if(!S.ses.length) h+='<div class="aviso ojo">No salió ninguna capacitación de esta hoja. '+(S.prob.length ? 'Mira abajo qué no se entendió.' : 'Revisa que tenga filas con su tema y su fecha.')+'</div>';
  else {
    h+='<div class="ges-cuenta chips" id="cs-chips"><span class="pill ok">'+gesPlural(nuevas.length, 'capacitación nueva', 'capacitaciones nuevas')+'</span><span class="pill azul">'+gesPlural(asis, 'asistencia', 'asistencias')+'</span>'+
      (yaE ? '<span class="pill gris">'+gesPlural(yaE, 'ya estaba registrada', 'ya estaban registradas')+'</span>' : '')+
      (S.n.fuera ? '<span class="pill ojo">'+gesPlural(S.n.fuera, 'asistencia de alguien que no está en tu personal', 'asistencias de gente que no está en tu personal')+'</span>' : '')+
      (S.prob.length ? '<span class="pill mal">'+gesPlural(S.prob.length, 'dato sin entender', 'datos sin entender')+'</span>' : '')+'</div>';
    h+='<div class="ges-prev"><table><thead><tr><th>Fecha</th><th>Tema</th><th>Qué fue</th><th>Asistentes</th><th>Duración</th><th>Estado</th></tr></thead><tbody>'+
      S.ses.slice(0, 300).map(function(s){
        var conN=s.gente.filter(function(g){ return g.nota!=null; }).length;
        return '<tr class="'+(s.ya ? 'no' : '')+'"><td class="n">'+esc(fechaLarga(s.fecha))+'</td><td><b>'+esc(s.tema)+'</b>'+(s.dicta ? '<small>'+esc(s.dicta)+'</small>' : '')+'</td><td>'+esc(capTipoN(s.tipo))+'</td>'+
          '<td>'+s.gente.length+(conN ? '<small>'+conN+' con nota (sobre '+s.sobre+')</small>' : '')+'</td><td>'+esc(s.min)+' min</td>'+
          '<td><span class="pill '+(s.ya ? 'gris' : 'ok')+'">'+(s.ya ? 'Ya estaba' : 'Nueva')+'</span>'+(s.ya ? '<small>No se toca: si cambió, ábrela y corrígela.</small>' : '')+'</td></tr>'; }).join('')+
      '</tbody></table></div>'+(S.ses.length>300 ? '<p class="ayuda">Se muestran las primeras 300 de '+S.ses.length+'.</p>' : '');
    if(S.n.fuera) h+='<p class="ayuda">Quien no está en tu personal entra igual, con el nombre que trae la hoja. Si primero subes tu lista en «Personal», cada asistencia queda unida a su ficha.</p>';
  }
  h+='</div>';
  if(S.prob.length) h+='<div class="seccion"><h3>Lo que no se entendió · '+S.prob.length+'</h3><ul class="ges-lista-chica" id="cs-prob">'+S.prob.slice(0, 40).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('')+'</ul>'+
    (S.prob.length>40 ? '<p class="ayuda">…y '+(S.prob.length-40)+' más. Corrige esas celdas en tu Excel y vuelve a subirlo: lo que ya entró no se repite.</p>' : '<p class="ayuda">Eso no entra. Puedes corregirlo en tu Excel y volver a subirlo después: lo que ya entró no se repite.</p>')+'</div>';
  h+='<div class="msg" id="cs-msg2" role="status"></div>';
  c.innerHTML=h;
  if(bt){ bt.disabled=!nuevas.length; bt.textContent=nuevas.length ? 'Registrar '+gesPlural(nuevas.length, 'capacitación', 'capacitaciones') : 'Nada nuevo que registrar'; }
}
function _csSubir(){
  var S=CAPS, nuevas=S.ses.filter(function(s){ return !s.ya; }); if(!nuevas.length) return;
  var quien=gesQuien(), ahora=new Date().toISOString();
  var filas=nuevas.map(function(s){
    var d={ v:1, k:'cap', tipo:s.tipo, fecha:s.fecha, hora:'', min:s.min, tema:s.tema, dicta:s.dicta||'', cargo:'', lugar:'', obs:'', sobre:s.sobre, minimo:s.minimo, gente:s.gente, ev:[], por:quien, cuando:ahora, origen:'excel' };
    return { empresa:YO.obra.id, hoja:GES_HOJA, nombre:(capTipoN(s.tipo)+' realizada · '+s.tema+' · '+s.fecha).slice(0, 180), nota:JSON.stringify(d) };
  });
  var bt=$('cs-ok'), m=$('cs-msg2'), asis=nuevas.reduce(function(t, s){ return t+s.gente.length; }, 0);
  bt.disabled=true; $('cs-otro').disabled=true;
  Array.prototype.forEach.call(document.querySelectorAll('#hoja-cuerpo select, #hoja-cuerpo input, #hoja-cuerpo button'), function(x){ x.disabled=true; });
  m.className='msg gris'; m.innerHTML='Registrando… <span id="cs-av-t">0 de '+filas.length+'</span><div class="ges-avance"><i id="cs-av" style="width:0"></i></div>';
  GESA.filas=null;
  gesSubirTandas('sst_doc', filas, [[]], function(n, de){ var a=$('cs-av'), t=$('cs-av-t'); if(a) a.style.width=Math.round(n/de*100)+'%'; if(t) t.textContent=n+' de '+de; }, 15)
    .then(function(r){ _csListo(r.filas.length, filas.length, asis, null); }, function(e){ _csListo((e && e.hechas ? e.hechas.length : 0), filas.length, asis, e); });
}
function _csListo(n, de, asis, err){
  var S=CAPS, h='';
  if(n) h+='<div class="aviso ok" id="cs-hecho"><b>'+(n===1 ? 'Se registró 1 capacitación' : 'Se registraron '+n+' capacitaciones')+(err ? '' : ', con '+gesPlural(asis, 'asistencia', 'asistencias'))+'.</b> Ya cuentan en la matriz y en el registro de seguimiento. A cada una le puedes adjuntar después su lista firmada: ábrela desde la tabla.</div>';
  if(err) h+='<div class="aviso mal" id="cs-fallo"><b>'+(n ? 'Faltaron '+(de-n)+' por registrar.' : 'No se pudo registrar.')+'</b> '+esc(porQueFallo(err && err.cod!==undefined ? err.cod : err))+(n ? ' Vuelve a subir el mismo archivo: lo que ya entró no se repite.' : '')+'</div>';
  if(S.prob.length) h+='<div class="seccion"><h3>Quedó fuera · '+S.prob.length+'</h3><ul class="ges-lista-chica">'+S.prob.slice(0, 30).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('')+'</ul></div>';
  abrirHoja('Subir capacitaciones desde un Excel', n ? 'Listo' : 'No se registró', h, (err ? '<button type="button" class="bt sec" id="cs-otra">Volver a intentarlo</button>' : '')+'<button type="button" class="bt" id="cs-fin">Ver las capacitaciones</button>', {ancha:true, sinFoco:true});
  $('cs-fin').onclick=function(){ cerrarHoja(); if(VISTA.actual!=='caphechas' && vistasDe().some(function(v){ return v.id==='caphechas'; })) navegar('caphechas'); };
  if($('cs-otra')) $('cs-otra').onclick=function(){ _csPintarArchivo(); };
  if(n){ toast(n===1 ? '1 capacitación registrada' : n+' capacitaciones registradas'); if(typeof VISTA.recargar==='function') VISTA.recargar(true); }
}
/* la plantilla: un Excel con los títulos (la guía, en su propia hoja) */
function _csPlantilla(bt){
  if(bt) bt.disabled=true;
  cargarEvPDF().then(function(){
    var X=RCAP.xlsx, E=new X.Estilos(), C=X.C, per=docPersonaP();
    var sCab=E.xf({ b:1, sz:10, c:C.blanco, f:C.petroleo, h:'left', borde:true }), sAy=E.xf({ sz:10, c:C.tinta, wrap:1 }), sTit=E.xf({ b:1, sz:13, c:C.petroleo });
    var hoja=new X.Hoja('Capacitaciones'); hoja.activa=true; hoja.pie='Capacitaciones realizadas';
    [per, 'Apellidos y nombres', 'Tema', 'Fecha', 'Nota', 'Duración (minutos)', 'Expositor', 'Tipo'].forEach(function(c, i){ hoja.celda(i, 1, c, sCab); });
    [16, 34, 38, 14, 10, 20, 26, 20].forEach(function(w, i){ hoja.anchos[i]=w; });
    hoja.congelar={ c:0, r:1 };
    var g=new X.Hoja('Cómo llenarla'); g.pie='Capacitaciones realizadas';
    g.celda(0, 1, 'Cómo llenar la hoja «Capacitaciones»', sTit); g.anchos[0]=110;
    ['Una fila por cada persona en cada capacitación: si a una charla fueron 30, son 30 filas con el mismo tema y la misma fecha.',
     per+' o «Apellidos y nombres»: basta uno de los dos. Con el documento, cada asistencia queda unida a la ficha de la persona en «Personal».',
     'Tema: escríbelo igual que en tu plan de capacitación, para que cuente en la matriz.',
     'Fecha: el día en que se dio (día/mes/año). No valen fechas que todavía no llegan: eso se programa.',
     'Nota (opcional): si hubo evaluación. De 0 a 20; si alguna pasa de 20 se toma como nota sobre 100.',
     'Duración (opcional): en minutos. Si la dejas vacía, al subir eliges cuánto duró cada una.',
     'Expositor y Tipo (opcionales). Tipo: Capacitación, Charla, Inducción, Entrenamiento, Taller…',
     'También puedes subir tu matriz tal cual: las personas en filas, los temas en columnas y la fecha en cada celda.'].forEach(function(t, i){ g.celda(0, 3+i, t, sAy); g.altos[3+i]=30; });
    bajarBlob(X.libro([hoja, g], E, 'Capacitaciones realizadas'), 'OBRASST - capacitaciones realizadas.xlsx');
    if(bt) bt.disabled=false;
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar la plantilla. Revisa tu conexión.'); });
}

/* ── 4.2 · INSPECCIONES: REGISTRAR UNA YA HECHA ───────────────────────────────────────────────
   La que se hizo en papel (la mensual, la planeada del programa…). Va a sst_inspeccion con la misma fila que sube la
   app: el formato en «tipo», el resumen en «observacion» (las mismas líneas de _resumenInspec), el resultado
   «conforme» u «observado», y «ext» (empieza con «w»: nació en la web). El celular la baja con las del equipo y la
   muestra como lo que es: un resumen. «items» va vacío: el checklist punto por punto se queda en el papel, que se
   adjunta (foto o PDF) en «foto_url». Las que subió un celular se ven aquí pero no se corrigen: su original está en
   el teléfono que la levantó. */
var INSF = { f:null, ren:null, ev:null, guardando:false };
var GES_FREQ = { diaria:'diaria', semanal:'semanal', mensual:'mensual', trimestral:'trimestral', semestral:'semestral', anual:'anual', porEvento:'por evento' };
function _inspLimpio(t, n){ return gesTxt(String(t||'').replace(/\s*\|\s*/g, ' / ')).slice(0, n||300); }
/* el resumen (las líneas de la app) → sus partes */
function gesInspPartes(obs){
  var P={ area:'', ubica:'', planeada:'', cargo:'', concl:'', obs:[], otras:[], web:false };
  String(obs||'').split(/\r?\n/).forEach(function(l){
    l=l.trim(); if(!l) return;
    var m=/^(\d+)\s+observaci[oó]n\(es\):\s*(.*)$/i.exec(l);
    if(m){ m[2].split(' | ').forEach(function(x){ x=x.trim(); if(!x) return; var e=/\s*\[(levantada|abierta)\]\s*$/i.exec(x); P.obs.push({ t:x.replace(/\s*\[(levantada|abierta)\]\s*$/i, ''), e:(e && e[1].toLowerCase()==='levantada') ? 'lev' : 'ab' }); }); return; }
    if(/^sin observaciones\.?$/i.test(l)) return;
    if(/^registrada en el portal/i.test(l)){ P.web=true; return; }
    var k=/^([^:]{2,32}):\s*(.*)$/.exec(l);
    if(!k){ P.otras.push(l); return; }
    var c=nrm(k[1]), v=k[2];
    if(c==='area') P.area=v; else if(c==='ubicacion') P.ubica=v; else if(c==='tipo') P.planeada=/no planeada/i.test(v) ? 'no' : 'si';
    else if(c==='cargo del inspector') P.cargo=v; else if(c==='conclusiones') P.concl=v; else P.otras.push(l);
  });
  return P;
}
function gesInspEsWeb(f){ return !!f && /^w/.test(String(f.ext||'')); }
/* los formatos de la app: primero los del sector de la obra */
function _inspFormatos(cat){
  var I=(cat && cat.insp) || {}, sec=((typeof OBRA_INFO==='object' && OBRA_INFO[(YO.obra||{}).id]) || {}).sector || (YO.obra||{}).sector || 'construccion', out=[], v={};
  Object.keys(I).sort(function(a, b){ return (a===sec ? -1 : 0)-(b===sec ? -1 : 0); }).forEach(function(s){ (I[s].i||[]).forEach(function(t){ var k=nrm(t[1]); if(v[k]) return; v[k]=1; out.push({ k:t[0], n:t[1], f:t[2], s:I[s].n }); }); });
  return out;
}
function gesInspForm(f){
  _gesCss(); _yaCss();
  var nuevo=!f, hoy=hoyISO();
  /* 07/10/2026 · el renglón que deja la inspección mensual de equipos (ext «wm<mes>-…») se abre con su hoja */
  var _wm=f ? /^wm(\d{4})(\d{2})-/.exec(String(f.ext||'')) : null;
  if(_wm && typeof menIr==='function') return menIr('menAbrir', _wm[1]+'-'+_wm[2], 'hoja');
  if(f && !gesInspEsWeb(f)) return gesInspVer(f);
  INSF.f=f||null; INSF.guardando=false;
  var P=f ? gesInspPartes(f.observacion) : { area:'', ubica:'', planeada:'si', cargo:'', concl:'', obs:[] };
  abrirHoja(nuevo ? 'Registrar una inspección' : (f.tipo||'Inspección'), nuevo ? 'Una que ya se hizo en papel: queda con su fecha, su resultado y lo que se encontró' : 'Registrada en el portal · '+fechaLarga(f.fecha),
    '<div class="vacio" id="insf-carga">Cargando los formatos…</div>',
    (nuevo ? '' : '<button type="button" class="bt mal" id="insf-quitar">Quitar</button>')+'<button type="button" class="bt" id="insf-ok" disabled>'+(nuevo ? 'Guardar la inspección' : 'Guardar los cambios')+'</button>', {sinFoco:true});
  if($('insf-quitar')) $('insf-quitar').onclick=function(){ gesInspQuitar(f); };
  gesCat().then(function(cat){
    if(!$('insf-carga')) return;
    var F=_inspFormatos(cat); INSF.formatos=F;
    var h='<div class="campo"><label for="insf-tipo">Qué se inspeccionó (el formato)</label><input id="insf-tipo" list="insf-tipos" maxlength="120" autocomplete="off" placeholder="Extintores, orden y limpieza, andamios…" value="'+esc(f ? f.tipo||'' : '')+'">'+
        '<datalist id="insf-tipos">'+F.map(function(t){ return '<option value="'+esc(t.n)+'">'+esc(t.s+(GES_FREQ[t.f] ? ' · '+GES_FREQ[t.f] : ''))+'</option>'; }).join('')+'</datalist><p class="ayuda" id="insf-tipo-ay"></p></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="insf-fecha">Día en que se hizo</label><input type="date" id="insf-fecha" max="'+hoy+'" value="'+esc(f ? String(f.fecha||'').slice(0, 10) : hoy)+'"></div>'+
        '<div class="campo"><label id="insf-pl-t">¿Estaba en el programa?</label><div class="chips" id="insf-pl" role="radiogroup" aria-labelledby="insf-pl-t">'+
          [['si', 'Planeada'], ['no', 'No planeada']].map(function(x){ var on=((P.planeada||'si')===x[0]); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div></div></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="insf-area">Área o frente</label><input id="insf-area" maxlength="100" value="'+esc(P.area)+'"></div>'+
        '<div class="campo"><label for="insf-ubica">Ubicación exacta <span class="tenue">· opcional</span></label><input id="insf-ubica" maxlength="100" value="'+esc(P.ubica)+'"></div></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="insf-insp">Quién la hizo</label><input id="insf-insp" maxlength="100" autocomplete="off" value="'+esc(f ? f.inspector||'' : '')+'"></div>'+
        '<div class="campo"><label for="insf-cargo">Su cargo <span class="tenue">· opcional</span></label><input id="insf-cargo" maxlength="80" value="'+esc(P.cargo)+'"></div></div>'+
      '<div class="seccion"><h3>Lo que se encontró</h3><p class="ayuda" style="margin:0 0 8px">Una observación por renglón. Si todo estuvo conforme, déjalo vacío.</p><div id="insf-obs"></div></div>'+
      '<div class="campo" style="margin-top:14px"><label for="insf-concl">Conclusiones <span class="tenue">· opcional</span></label><textarea id="insf-concl" rows="2" maxlength="500">'+esc(P.concl)+'</textarea></div>'+
      '<div class="seccion"><h3>El formato lleno</h3><div id="insf-ev"></div></div>'+
      '<div class="msg" id="insf-msg" role="status"></div>';
    $('hoja-cuerpo').innerHTML=h;
    INSF.ren=gesRenglones($('insf-obs'), { id:'insf-ren', lista:P.obs, estados:[['ab', 'Sin levantar'], ['lev', 'Ya levantada']], ph:'Extintor del piso 2 con la presión baja', mas:'Agregar otra observación', que:'Observación', max:30 });
    INSF.ev=gesEvidencia($('insf-ev'), { id:'insf-evi', lista:(f && f.foto_url) ? [{ u:f.foto_url, n:'el formato adjunto' }] : [], max:1, texto:'Adjuntar el formato lleno (foto o PDF)', ayuda:'La hoja de inspección tal como se llenó. Un archivo de hasta 20 MB.' });
    $('insf-pl').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; Array.prototype.forEach.call(this.querySelectorAll('.chip'), function(c){ var on=(c===b); c.className='chip'+(on ? ' on' : ''); c.setAttribute('aria-checked', on ? 'true' : 'false'); }); };
    $('insf-tipo').oninput=_insfTipo; _insfTipo();
    $('insf-ok').disabled=false; $('insf-ok').onclick=_insfGuardar;
  });
}
function _insfTipo(){
  var a=$('insf-tipo-ay'); if(!a) return;
  var k=nrm($('insf-tipo').value), t=(INSF.formatos||[]).filter(function(x){ return nrm(x.n)===k; })[0];
  a.textContent=t ? '✓ Es un formato de la app ('+t.s+')'+(GES_FREQ[t.f] ? ': allí se hace con frecuencia '+GES_FREQ[t.f] : '')+'. Queda junto a las que se llenan en el celular.' : (k ? 'No es uno de los formatos de la app: queda con el nombre que le pongas.' : 'Elige un formato de la app o escribe el nombre del tuyo.');
}
function _insfGuardar(){
  if(INSF.guardando) return;
  var m=$('insf-msg'), bt=$('insf-ok'), f=INSF.f;
  var mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} };
  var tipo=gesTxt($('insf-tipo').value).slice(0, 120), fe=$('insf-fecha').value, insp=gesTxt($('insf-insp').value).slice(0, 100);
  if(tipo.length<3) return mal('Falta qué se inspeccionó.', 'insf-tipo');
  if(!fe) return mal('Falta el día en que se hizo.', 'insf-fecha');
  if(!gesFechaPasada(fe)) return mal('Ese día todavía no llega: aquí va la inspección que ya se hizo.', 'insf-fecha');
  if(insp.length<3) return mal('Falta quién la hizo.', 'insf-insp');
  var obs=INSF.ren.leer(), pl=(document.querySelector('#insf-pl .chip.on')||{ getAttribute:function(){ return 'si'; } }).getAttribute('data-v');
  var L=[], area=_inspLimpio($('insf-area').value, 100), ubica=_inspLimpio($('insf-ubica').value, 100), cargo=_inspLimpio($('insf-cargo').value, 80), concl=_inspLimpio($('insf-concl').value, 500);
  if(area) L.push('Area: '+area);
  if(ubica) L.push('Ubicacion: '+ubica);
  L.push('Tipo: '+(pl==='no' ? 'No planeada' : 'Planeada'));
  if(cargo) L.push('Cargo del inspector: '+cargo);
  L.push(obs.length ? obs.length+' observacion(es): '+obs.map(function(o){ return _inspLimpio(o.t, 300)+' ['+(o.e==='lev' ? 'levantada' : 'abierta')+']'; }).join(' | ') : 'Sin observaciones.');
  if(concl) L.push('Conclusiones: '+concl);
  L.push('Registrada en el portal por '+(gesQuien()||'la oficina')+' (se hizo en papel).');
  var fila={ tipo:tipo, items:null, observacion:L.join('\n'), inspector:insp, resultado:obs.length ? 'observado' : 'conforme', fecha:fe };
  INSF.guardando=true; bt.disabled=true; m.className='msg gris'; m.textContent=INSF.ev.n() ? 'Subiendo el formato…' : 'Guardando…';
  INSF.ev.subir().then(function(ev){
    fila.foto_url=(ev[0] && ev[0].u) || null; m.textContent='Guardando…';
    if(f) return sbPatch('sst_inspeccion?id=eq.'+encodeURIComponent(f.id), fila);
    fila.empresa=YO.obra.id; fila.ext='w'+Date.now().toString(36)+Math.random().toString(36).slice(2, 6);
    return sbPostP('sst_inspeccion', fila).catch(function(c){
      if(c!==400) throw c;                                   /* una base sin la columna «ext»: sin ella */
      var f2={}; for(var k in fila) if(k!=='ext') f2[k]=fila[k];
      return sbPostP('sst_inspeccion', f2);
    });
  }).then(function(rows){
    INSF.guardando=false;
    if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:f ? 'No se guardó: la inspección ya no está o esta cuenta no puede cambiarla.' : 'No se guardó: esta cuenta no puede registrar en esta obra.'});
    var ab=obs.filter(function(o){ return o.e!=='lev'; }).length;
    toast((f ? 'Guardado' : 'Inspección registrada')+(obs.length ? ' con '+gesPlural(obs.length, 'observación', 'observaciones')+(ab ? ' ('+ab+' sin levantar)' : ', todas levantadas') : ': todo conforme')+'. La app la recibe al sincronizar.');
    cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
  }).catch(function(e){ INSF.guardando=false; bt.disabled=false; mal(e==='muy-grande' ? 'El archivo pesa más de 25 MB: comprímelo.' : 'No se pudo guardar. '+porQueFallo(e)); });
}
function gesInspQuitar(f){
  confirmar('¿Quitar esta inspección del registro?', '«'+(f.tipo||'Inspección')+'» del '+fechaLarga(f.fecha)+(f.inspector ? ' · '+f.inspector : '')+'. Se borra aquí y deja de bajar a la app.', {si:'Sí, quitarla', mal:true}).then(function(si){
    if(!si) return;
    sbDelP('sst_inspeccion?id=eq.'+encodeURIComponent(f.id)).then(function(rows){
      if(Array.isArray(rows) && !rows.length){ toast('No se pudo quitar: esta cuenta no puede borrar en esta obra.'); return; }
      toast('Inspección quitada.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}
/* la que subió un celular: se lee, no se corrige */
function gesInspVer(f){
  var P=gesInspPartes(f.observacion), R=String(f.resultado||'');
  var h='<dl class="datos"><dt>Fecha</dt><dd>'+esc(fechaLarga(f.fecha))+'</dd><dt>Quién la hizo</dt><dd>'+esc(f.inspector||'—')+'</dd>'+
    (R ? '<dt>Resultado</dt><dd><span class="pill '+(/no conform|nc|observ/i.test(R) ? 'ojo' : 'ok')+'">'+esc(R)+'</span></dd>' : '')+
    (P.area ? '<dt>Área</dt><dd>'+esc(P.area)+'</dd>' : '')+(P.ubica ? '<dt>Ubicación</dt><dd>'+esc(P.ubica)+'</dd>' : '')+
    (P.planeada ? '<dt>Tipo</dt><dd>'+(P.planeada==='no' ? 'No planeada' : 'Planeada')+'</dd>' : '')+'</dl>'+
    (P.obs.length ? '<div class="seccion"><h3>Observaciones · '+P.obs.length+'</h3><ul class="ges-lista-chica">'+P.obs.map(function(o){ return '<li>'+esc(o.t)+'</li>'; }).join('')+'</ul></div>' : '')+
    (P.otras.length ? '<div class="seccion"><h3>Lo demás del resumen</h3><p style="margin:0;white-space:pre-line;font-size:13.5px">'+esc(P.otras.join('\n'))+'</p></div>' : '')+
    (P.concl ? '<div class="seccion"><h3>Conclusiones</h3><p style="margin:0">'+esc(P.concl)+'</p></div>' : '')+
    (f.foto_url ? '<div class="seccion"><h3>Adjunto</h3><p style="margin:0"><a href="'+esc(f.foto_url)+'" target="_blank" rel="noopener">Abrir la foto o el archivo</a></p></div>' : '')+
    '<div class="aviso" style="margin:18px 0 0">Esta inspección se llenó en un celular. Aquí está su resumen; el formato completo, con cada punto, las fotos y las firmas, sale en PDF del teléfono que la levantó.</div>';
  abrirHoja(f.tipo||'Inspección', 'Llenada en la app · '+fechaLarga(f.fecha), h, '<button type="button" class="bt" id="insv-ok">Cerrar</button>', {sinFoco:true});
  $('insv-ok').onclick=cerrarHoja;
}

/* ── 4.3 · REPORTES: REGISTRAR UNO QUE YA SE TENÍA ────────────────────────────────────────────
   El acto o la condición que se anotó en papel o en otro sistema. Entra a sst_reporte con la fila de la app
   (subirReporte); si ya se levantó, se cierra en el mismo acto con lo que se hizo, la fecha y quién (como el cierre
   del portal: estado «atendido»). */
var REPF = { foto:null, foto2:null, clase:'condicion', guardando:false };
function gesRepForm(){
  _gesCss(); _yaCss(); _accCss();
  var hoy=hoyISO();
  REPF.foto=null; REPF.foto2=null; REPF.clase='condicion'; REPF.guardando=false;
  var h='<div class="campo"><label id="repf-cl-t">Qué se reportó</label><div class="chips" id="repf-clase" role="radiogroup" aria-labelledby="repf-cl-t">'+
      [['condicion', 'Condición subestándar'], ['acto', 'Acto subestándar']].map(function(x){ var on=(x[0]===REPF.clase); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div></div>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="repf-fecha">Día del reporte</label><input type="date" id="repf-fecha" max="'+hoy+'" value="'+hoy+'"></div>'+
      '<div class="campo"><label for="repf-lugar">Lugar</label><input id="repf-lugar" maxlength="120" placeholder="Torre B, piso 3"></div></div>'+
    '<div class="campo"><label for="repf-desc">Qué se vio</label><textarea id="repf-desc" rows="3" maxlength="1000" placeholder="Baranda suelta en el borde de la losa del piso 3."></textarea></div>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="repf-act">Actividad <span class="tenue">· opcional</span></label><input id="repf-act" maxlength="100" placeholder="Encofrado, vaciado, izaje…"></div>'+
      '<div class="campo"><label for="repf-autor">Quién lo reportó</label><input id="repf-autor" maxlength="100" list="repf-gente" autocomplete="off"><datalist id="repf-gente" data-sin-pais></datalist></div></div>'+
    '<label class="chk"><input type="checkbox" id="repf-anon"> <span>Fue anónimo <small class="tenue">· no se guarda el nombre</small></span></label>'+
    '<div class="campo"><label for="repf-foto">Foto <span class="tenue">· opcional</span></label><div class="acc-foto" id="repf-foto-c"></div></div>'+
    '<div class="seccion"><h3>¿Ya se levantó?</h3><label class="chk"><input type="checkbox" id="repf-lev"> <span>Sí, ya está levantado <small class="tenue">· queda cerrado, con lo que se hizo</small></span></label>'+
      '<div id="repf-lev-c" hidden><div class="campo"><label for="repf-accion">Qué se hizo</label><textarea id="repf-accion" rows="2" maxlength="600" placeholder="Se fijó la baranda con abrazaderas y se verificó todo el borde."></textarea></div>'+
        '<div class="fila-c ya-al"><div class="campo"><label for="repf-cerrado">Día en que se levantó</label><input type="date" id="repf-cerrado" max="'+hoy+'" value="'+hoy+'"></div>'+
          '<div class="campo"><label for="repf-por">Quién lo levantó</label><input id="repf-por" maxlength="100" value="'+esc(gesQuien())+'"></div></div>'+
        '<div class="campo"><label for="repf-foto2">Foto de cómo quedó <span class="tenue">· opcional</span></label><div class="acc-foto" id="repf-foto2-c"></div></div></div></div>'+
    '<div class="msg" id="repf-msg" role="status"></div>';
  abrirHoja('Registrar un reporte', 'Un acto o una condición que ya tenías anotado: entra al mismo registro de la app', h, '<button type="button" class="bt" id="repf-ok">Guardar el reporte</button>', {sinFoco:true});
  $('repf-clase').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; REPF.clase=b.getAttribute('data-v'); Array.prototype.forEach.call(this.querySelectorAll('.chip'), function(c){ var on=(c===b); c.className='chip'+(on ? ' on' : ''); c.setAttribute('aria-checked', on ? 'true' : 'false'); }); };
  $('repf-anon').onchange=function(){ $('repf-autor').disabled=this.checked; if(this.checked) $('repf-autor').value=''; };
  $('repf-lev').onchange=function(){ $('repf-lev-c').hidden=!this.checked; };
  gesGente().then(function(g){ var dl=$('repf-gente'); if(dl) dl.innerHTML=g.slice(0, 1500).map(function(t){ return '<option value="'+esc(t.nombre)+'">'+esc(t.puesto||'')+'</option>'; }).join(''); });
  function foto(id, cual){
    var c=$(id+'-c'); if(!c) return;
    var x=REPF[cual];
    c.innerHTML=(x ? '<img src="'+esc(x.vista)+'" alt="La foto elegida"><button type="button" class="bt sec chico" id="'+id+'-x">Quitar la foto</button>' : '')+'<input type="file" id="'+id+'" accept="image/*"'+(x ? ' hidden' : '')+'>';
    $(id).onchange=function(){
      var fl=this.files && this.files[0]; if(!fl) return;
      if(!/^image\//.test(fl.type||'')){ toast('Tiene que ser una foto (JPG o PNG).'); this.value=''; return; }
      _gesFotoChica(fl, 1280, 0.82).then(function(r){ REPF[cual]=r; foto(id, cual); }, function(){ toast('No se pudo leer esa foto.'); });
    };
    if($(id+'-x')) $(id+'-x').onclick=function(){ REPF[cual]=null; foto(id, cual); };
  }
  foto('repf-foto', 'foto'); foto('repf-foto2', 'foto2');
  $('repf-ok').onclick=_repfGuardar;
}
function _repfGuardar(){
  if(REPF.guardando) return;
  var m=$('repf-msg'), bt=$('repf-ok'), hoy=hoyISO();
  var mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} };
  var fe=$('repf-fecha').value, desc=String($('repf-desc').value||'').trim(), anon=$('repf-anon').checked, autor=gesTxt($('repf-autor').value).slice(0, 100), lev=$('repf-lev').checked;
  if(!fe) return mal('Falta el día del reporte.', 'repf-fecha');
  if(!gesFechaPasada(fe)) return mal('Ese día todavía no llega.', 'repf-fecha');
  if(desc.length<10) return mal('Cuenta qué se vio, aunque sea en una línea.', 'repf-desc');
  if(!anon && autor.length<3) return mal('Falta quién lo reportó (o marca que fue anónimo).', 'repf-autor');
  var accion='', cerrado='', por='';
  if(lev){
    accion=String($('repf-accion').value||'').trim(); cerrado=$('repf-cerrado').value; por=gesTxt($('repf-por').value).slice(0, 100);
    if(accion.length<5) return mal('Escribe qué se hizo para levantarlo, aunque sea en una línea. Es lo que se audita.', 'repf-accion');
    if(!cerrado || cerrado>hoy) return mal('Revisa el día en que se levantó.', 'repf-cerrado');
    if(cerrado<fe) return mal('No pudo levantarse antes de reportarse: revisa las dos fechas.', 'repf-cerrado');
    if(por.length<2) return mal('Falta quién lo levantó.', 'repf-por');
  }
  var fila={ empresa:YO.obra.id, clase:REPF.clase, descripcion:desc.slice(0, 1000), lugar:gesTxt($('repf-lugar').value).slice(0, 120), actividad:gesTxt($('repf-act').value).slice(0, 100)||null,
             foto_url:null, anonimo:anon, autor:anon ? '' : autor, fecha:fe };
  REPF.guardando=true; bt.disabled=true; m.className='msg gris'; m.textContent=(REPF.foto || REPF.foto2) ? 'Subiendo las fotos…' : 'Guardando…';
  var p1=REPF.foto ? subirFoto('reportes', REPF.foto.blob, 'reporte.jpg') : Promise.resolve(null);
  var p2=(lev && REPF.foto2) ? subirFoto('reportes', REPF.foto2.blob, 'cierre.jpg') : Promise.resolve(null);
  Promise.all([p1, p2]).then(function(u){
    fila.foto_url=u[0]||null; m.textContent='Guardando…';
    /* como la app: si la base todavía no tiene «actividad» (400), el reporte entra sin ella */
    return sbPostP('sst_reporte', fila).catch(function(c){ if(c!==400) throw c; var f2={}; for(var k in fila) if(k!=='actividad') f2[k]=fila[k]; return sbPostP('sst_reporte', f2); })
      .then(function(rows){
        if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede registrar en esta obra.'});
        var id=rows && rows[0] && rows[0].id;
        if(!lev) return { cerrado:false };
        if(!id) return { cerrado:false, sinCierre:true };
        var d={ estado:'atendido', accion:accion.slice(0, 600), cerrado:cerrado, cerrado_por:por };
        if(u[1]) d.foto_cierre=u[1];
        return sbPatch('sst_reporte?id=eq.'+encodeURIComponent(id), d).then(function(r2){ return { cerrado:!!(r2 && r2.length), sinCierre:!(r2 && r2.length) }; }, function(){ return { cerrado:false, sinCierre:true }; });
      });
  }).then(function(r){
    REPF.guardando=false;
    toast(r.sinCierre ? 'El reporte se guardó, pero no se pudo dejar cerrado: ciérralo desde la tabla.' : (r.cerrado ? 'Reporte registrado y cerrado.' : 'Reporte registrado: queda abierto hasta que se levante.'));
    cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
  }).catch(function(e){ REPF.guardando=false; bt.disabled=false; mal('No se pudo guardar. '+porQueFallo(e)); });
}

/* ── 4.4 · SIMULACROS ─────────────────────────────────────────────────────────────────────────
   Los que vienen (programados) y los que ya se hicieron, con sus tiempos, cuántos participaron y lo que se encontró.
   La forma es la del simulacro de la app (tipo, fecha, hora, lugar, punto, lider, escenario, meta, presentes,
   evacuados, faltan, hallazgos, notas), más el tiempo logrado en segundos («seg») en vez de los toques del cronómetro:
     { v:1, k:'sim', estado:'hecho'|'programado', tipo, fecha, hora, lugar, punto, lider, escenario, meta, seg,
       presentes, evacuados, faltan, hallazgos:[{t}], notas, ev:[{u,n}], nac, por, cuando }
   El cronómetro para correrlo en el momento sigue en la app. 09/10/2026 · lo que se programa o se corre en el celular llega
   aquí solo, a esta misma hoja (gestion-sincro.js, con «app»: el id del celular), y lo de aquí baja al celular. */
var GES_SIM_BASE = [['sismo', '🌎', 'Sismo', 180, ''], ['incendio', '🔥', 'Incendio / amago', 240, ''], ['medica', '🩹', 'Emergencia médica', 300, ''], ['otro', '🧯', 'Otro', 300, '']];
var SIMW = { filas:[], n:0, caja:null, cat:null, firma:'' };
function simTipos(){ var c=(SIMW.cat && Array.isArray(SIMW.cat.simTipos) && SIMW.cat.simTipos.length) ? SIMW.cat.simTipos.slice() : GES_SIM_BASE.slice(); if(!c.some(function(t){ return t[0]==='otro'; })) c.push(['otro', '🧯', 'Otro', 300, '']); return c; }
function simTipo(k){ var l=simTipos(); return l.filter(function(t){ return t[0]===k; })[0] || l[l.length-1]; }
/* programado y con el día pasado: atrasado; con el día de hoy: es hoy */
function simEstado(d){
  if(d.estado==='hecho') return { k:'hecho', t:'realizado', cl:'ok' };
  var f=String(d.fecha||'').slice(0, 10), hoy=hoyISO();
  if(f<hoy) return { k:'atrasado', t:'atrasado', cl:'mal' };
  if(f===hoy) return { k:'hoy', t:'es hoy', cl:'ojo' };
  return { k:'prog', t:'programado', cl:'azul' };
}
function gesVistaSim(caja){
  _gesCss(); _yaCss();
  SIMW.caja=caja;
  var ac=$('acciones');
  if(ac){
    ac.innerHTML='<button type="button" class="bt sec" id="sim-prog">Programar un simulacro</button><button type="button" class="bt" id="sim-nuevo">＋ Registrar uno ya realizado</button>';
    $('sim-prog').onclick=function(){ simForm(null, { estado:'programado' }); };
    $('sim-nuevo').onclick=function(){ simForm(null, { estado:'hecho' }); };
  }
  cargando(caja);
  function pinta(silencio){
    var n=++SIMW.n;
    Promise.all([gesActTraer(true), gesCat()]).then(function(r){
      if(n!==SIMW.n || VISTA.actual!=='simulacros') return;
      var firma=''; try{ firma=JSON.stringify(r[0])+hoyISO(); }catch(e){}
      if(silencio && firma && firma===SIMW.firma && $('t-sim') && document.body.contains(caja)) return;
      SIMW.firma=firma; SIMW.cat=r[1]; SIMW.filas=gesActDe(r[0], 'sim'); simPintar();
    }).catch(function(cod){ if(n!==SIMW.n || VISTA.actual!=='simulacros') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function simPintar(){
  var caja=SIMW.caja; if(!caja || !document.body.contains(caja)) return;
  var F=SIMW.filas, A=ANIO, hoy=hoyISO();
  var hechos=F.filter(function(f){ return f.d.estado==='hecho' && anioDe(f.d.fecha)===A; }).sort(function(a, b){ return String(b.d.fecha).localeCompare(String(a.d.fecha)); });
  var prog=F.filter(function(f){ return f.d.estado!=='hecho'; }), atras=prog.filter(function(f){ return String(f.d.fecha)<hoy; }).length;
  var ult=hechos.filter(function(f){ return f.d.seg!=null && f.d.seg!==''; })[0], gente=hechos.reduce(function(s, f){ return s+(parseInt(f.d.evacuados, 10) || parseInt(f.d.presentes, 10) || 0); }, 0);
  var h='<div class="aviso" id="sim-que"><b>Aquí se programan los simulacros del año y se registran los que ya se hicieron</b>, con sus tiempos, cuántos participaron y lo que se encontró. '+
    'El cronómetro para correrlo en el momento está en la app: lo que se programa o se corre allí llega aquí solo, y lo que registras aquí se ve en la app.</div>';
  h+='<div class="rej">'+
    cifra('Realizados en '+A, hechos.length, hechos.length ? 'el último, el '+fechaLarga(hechos[0].d.fecha) : 'ninguno todavía', hechos.length ? 'ok' : '')+
    cifra('Programados', prog.length, atras ? gesPlural(atras, 'ya pasó su día', 'ya pasaron su día') : (prog.length ? 'por hacer' : 'ninguno por venir'), atras ? 'mal' : '')+
    cifra('Último tiempo de evacuación', ult ? gesReloj(ult.d.seg) : '—', ult ? (ult.d.meta ? 'el objetivo era '+gesReloj(ult.d.meta) : simTipo(ult.d.tipo)[2]) : 'sin tiempos registrados', ult && ult.d.meta ? (+ult.d.seg<=+ult.d.meta ? 'ok' : 'mal') : '')+
    cifra('Personas que participaron', gente, 'en los de '+A, '')+'</div>';
  /* el calendario nacional (INDECI), solo en el Perú y solo lo que viene */
  var nac=[];
  if(paisObraP()==='pe'){
    var ya={}; F.forEach(function(f){ if(f.d.nac) ya[f.d.nac]=1; });
    nac=(((SIMW.cat||{}).simulacros||{})[A]||[]).filter(function(x){ return x.iso>=hoy && !ya[x.iso]; });
  }
  if(nac.length) h+='<div class="tarj" id="sim-nac"><div class="tarj-cab"><div><h2>Simulacros nacionales que vienen</h2><p class="sub">Los convoca INDECI. Tócalo para dejarlo programado.</p></div></div><div class="tarj-cuerpo"><div class="chips">'+
    nac.map(function(x){ return '<button type="button" class="chip" data-nac="'+esc(x.iso)+'">🚨 '+esc(x.n)+' <i>'+esc(fechaLarga(x.iso))+(x.hora ? ' · '+esc(x.hora) : '')+'</i></button>'; }).join('')+'</div></div></div>';
  h+='<div class="tarj" id="t-sim"></div>';
  var est=$('t-sim') ? $('t-sim')._est : null;
  caja.innerHTML=h;
  if(est) $('t-sim')._est=est;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-nac]'), function(b){ b.onclick=function(){
    var iso=b.getAttribute('data-nac'), x=nac.filter(function(y){ return y.iso===iso; })[0]; if(!x) return;
    simForm(null, { estado:'programado', tipo:'multi', fecha:x.iso, hora:x.hora||'10:00', escenario:x.n, nac:x.iso });
  }; });
  var filas=F.map(function(f){ var d=f.d, t=simTipo(d.tipo), E=simEstado(d); return { id:f.id, fecha:d.fecha||'', tipo:t[2], ic:t[1], esc:d.escenario||'', lugar:d.lugar||'', est:E, seg:(d.seg==null || d.seg==='') ? null : +d.seg, meta:+d.meta||0,
    gente:(d.evacuados!=null && d.evacuados!=='') ? +d.evacuados : ((d.presentes!=null && d.presentes!=='') ? +d.presentes : null), hall:(d.hallazgos||[]).length, ev:d.ev||[], _f:f }; });
  var cols=[
    {k:'fecha', t:'Día', h:function(x){ return esc(fechaLarga(x.fecha))+(x._f.d.hora ? '<span class="sub">'+esc(x._f.d.hora)+'</span>' : ''); }},
    {k:'tipo', t:'Simulacro', h:function(x){ return '<b><span aria-hidden="true">'+x.ic+'</span> '+esc(x.tipo)+'</b><span class="sub">'+esc([x.esc, x.lugar].filter(Boolean).join(' · '))+'</span>'; }, v:function(x){ return x.tipo+' '+x.esc+' '+x.lugar; }, csv:function(x){ return x.tipo; }},
    {k:'esc', t:'Escenario', soloCsv:true}, {k:'lugar', t:'Dónde', soloCsv:true},
    {k:'_est', t:'Estado', h:function(x){ return '<span class="pill '+x.est.cl+'">'+esc(x.est.t)+'</span>'; }, v:function(x){ return x.est.t; }},
    {k:'seg', t:'Tiempo', num:true, h:function(x){ return x.seg===null ? '—' : '<span class="ya-tiempo" style="color:var(--'+(x.meta ? (x.seg<=x.meta ? 'ok' : 'mal') : 'tinta')+')">'+gesReloj(x.seg)+'</span>'+(x.meta ? '<span class="sub">objetivo '+gesReloj(x.meta)+'</span>' : ''); },
      v:function(x){ return x.seg===null ? '' : x.seg; }, csv:function(x){ return x.seg===null ? '' : gesReloj(x.seg); }},
    {k:'gente', t:'Participaron', num:true, h:function(x){ return x.gente===null ? '—' : esc(x.gente); }, v:function(x){ return x.gente===null ? '' : x.gente; }},
    {k:'hall', t:'Hallazgos', num:true, h:function(x){ return x.est.k==='hecho' ? esc(x.hall) : '—'; }},
    {k:'ev', t:'Informe', h:function(x){ return x.ev.length ? x.ev.map(function(e, i){ return '<a href="'+esc(e.u)+'" target="_blank" rel="noopener" title="'+esc(e.n||'')+'">'+(x.ev.length>1 ? 'ver '+(i+1) : 'ver')+'</a>'; }).join(' · ') : ''; }, v:function(x){ return x.ev.map(function(e){ return e.u; }).join(' '); }},
    {k:'_acc', t:'', acc:true, h:function(x){ return (x.est.k==='hecho' ? '' : '<button type="button" class="bt chico" data-acc="hecho">Ya se hizo</button> ')+'<button type="button" class="bt sec chico" data-acc="abrir">Abrir</button> <button type="button" class="bt mal chico" data-acc="quitar">Quitar</button>'; }}
  ];
  tabla($('t-sim'), cols, filas, {orden:'fecha', asc:false, unidad:'simulacros', archivo:'simulacros', vacio:'Ningún simulacro todavía', vacioSub:'Programa el que viene o registra uno que ya se hizo.',
    alClic:function(x){ simForm(x._f); },
    accion:function(acc, x){ if(acc==='quitar') simQuitar(x._f); else if(acc==='hecho') simForm(x._f, { estado:'hecho' }); else simForm(x._f); }});
}
function simQuitar(f){
  var d=f.d;
  confirmar('¿Quitar este simulacro?', simTipo(d.tipo)[2]+' del '+fechaLarga(d.fecha)+(d.estado==='hecho' ? '. Ya se hizo: se pierde su registro (los archivos subidos no se borran).' : '. Estaba programado.'), {si:'Sí, quitarlo', mal:true}).then(function(si){
    if(!si) return;
    gesActQuitar(f.id).then(function(){ toast('Simulacro quitado.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true); }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}
var SIMF = { f:null, estado:'hecho', tipo:'sismo', ren:null, ev:null, nac:'', guardando:false };
/* pre: lo que viene puesto (el estado, o el simulacro nacional); con f, pre.estado cambia un programado a «ya se hizo» */
function simForm(f, pre){
  _gesCss(); _yaCss();
  var d=Object.assign({}, (f && f.d) || {}, pre || {}), nuevo=!f, hoy=hoyISO();
  SIMF.f=f||null; SIMF.guardando=false; SIMF.estado=(d.estado==='programado') ? 'programado' : 'hecho';
  SIMF.tipo=d.tipo || 'sismo'; SIMF.nac=d.nac||'';
  var t=simTipo(SIMF.tipo), pasa=(f && f.d.estado!=='hecho' && SIMF.estado==='hecho');
  /* el que ya quedó como realizado no vuelve a «se va a hacer» (se perdería lo anotado): sin el interruptor */
  var h='<div class="seg ya-estado" id="simf-estado" role="tablist" aria-label="¿Ya se hizo?"'+((f && f.d.estado==='hecho') ? ' hidden' : '')+'>'+
      [['hecho', 'Ya se hizo'], ['programado', 'Se va a hacer']].map(function(x){ var on=(x[0]===SIMF.estado); return '<button type="button" role="tab" aria-selected="'+(on ? 'true' : 'false')+'" class="'+(on ? 'on' : '')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div>'+
    '<div class="campo"><label id="simf-t-t">De qué</label><div class="chips" id="simf-tipo" role="radiogroup" aria-labelledby="simf-t-t">'+simTipos().map(function(x){ var on=(x[0]===t[0]);
      return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-v="'+esc(x[0])+'"><span aria-hidden="true">'+x[1]+'</span> '+esc(x[2])+'</button>'; }).join('')+'</div></div>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="simf-fecha" id="simf-fecha-t">Día</label><input type="date" id="simf-fecha" value="'+esc(String(d.fecha||(SIMF.estado==='hecho' ? hoy : '')).slice(0, 10))+'"></div>'+
      '<div class="campo"><label for="simf-hora">Hora</label><input type="time" id="simf-hora" value="'+esc(d.hora||'')+'"></div>'+
      '<div class="campo"><label for="simf-meta">Objetivo <span class="tenue">· min:seg</span></label><input id="simf-meta" inputmode="numeric" maxlength="7" placeholder="03:00" value="'+esc(gesReloj(d.meta!=null && d.meta!=='' ? d.meta : t[3]))+'"></div></div>'+
    '<div class="campo"><label for="simf-esc">Escenario <span class="tenue">· lo que se dijo que pasó</span></label><textarea id="simf-esc" rows="2" maxlength="300" placeholder="'+esc(t[4]||'')+'">'+esc(d.escenario||'')+'</textarea></div>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="simf-lugar">Dónde empieza</label><input id="simf-lugar" maxlength="120" placeholder="Sótano 2, torre A…" value="'+esc(d.lugar||'')+'"></div>'+
      '<div class="campo"><label for="simf-punto">Punto de reunión</label><input id="simf-punto" maxlength="120" value="'+esc(d.punto||'')+'"></div>'+
      '<div class="campo"><label for="simf-lider">Quién lo dirige</label><input id="simf-lider" maxlength="100" value="'+esc(d.lider||'')+'"></div></div>'+
    '<div id="simf-hecho"'+(SIMF.estado==='hecho' ? '' : ' hidden')+'>'+
      '<div class="seccion"><h3>Cómo salió</h3><div class="fila-c ya-al">'+
        '<div class="campo"><label for="simf-seg">Evacuación <span class="tenue">· min:seg</span></label><input id="simf-seg" inputmode="numeric" maxlength="7" placeholder="02:45" value="'+esc(gesReloj(d.seg))+'"></div>'+
        '<div class="campo"><label for="simf-pres">Personas en la obra</label><input type="number" id="simf-pres" inputmode="numeric" min="0" max="99999" step="1" value="'+esc(d.presentes!=null ? d.presentes : '')+'"></div>'+
        '<div class="campo"><label for="simf-evac">Evacuaron o participaron</label><input type="number" id="simf-evac" inputmode="numeric" min="0" max="99999" step="1" value="'+esc(d.evacuados!=null ? d.evacuados : '')+'"></div></div>'+
        '<div class="campo"><label for="simf-faltan">Quiénes faltaron o no salieron <span class="tenue">· opcional</span></label><input id="simf-faltan" maxlength="300" value="'+esc(d.faltan||'')+'"></div></div>'+
      '<div class="seccion"><h3>Lo que se encontró</h3><p class="ayuda" style="margin:0 0 8px">Una cosa por renglón: lo que falló o lo que hay que mejorar.</p><div id="simf-hall"></div></div>'+
      '<div class="campo" style="margin-top:14px"><label for="simf-notas">Conclusiones <span class="tenue">· opcional</span></label><textarea id="simf-notas" rows="2" maxlength="800">'+esc(d.notas||'')+'</textarea></div>'+
      '<div class="seccion"><h3>El informe y las fotos</h3><div id="simf-ev"></div></div></div>'+
    '<div class="msg" id="simf-msg" role="status"></div>';
  abrirHoja(nuevo ? (SIMF.estado==='hecho' ? 'Registrar un simulacro realizado' : 'Programar un simulacro') : (pasa ? 'Ya se hizo: ' : '')+t[2], nuevo ? (SIMF.estado==='hecho' ? 'Uno que ya se hizo: queda con sus tiempos y lo que se encontró' : 'Queda en la lista del año, con su día') : fechaLarga(d.fecha),
    h, (nuevo ? '' : '<button type="button" class="bt mal" id="simf-quitar">Quitar</button>')+'<button type="button" class="bt" id="simf-ok">Guardar</button>', {sinFoco:true});
  if($('simf-quitar')) $('simf-quitar').onclick=function(){ simQuitar(f); };
  SIMF.ren=gesRenglones($('simf-hall'), { id:'simf-ren', lista:(d.hallazgos||[]).map(function(x){ return { t:(typeof x==='string' ? x : x.t) }; }), ph:'La alarma no se oyó en el sótano', mas:'Agregar otro', que:'Hallazgo', max:30 });
  SIMF.ev=gesEvidencia($('simf-ev'), { id:'simf-evi', lista:d.ev||[], max:4, texto:'Adjuntar el informe o una foto', ayuda:'El informe del simulacro, la lista de participantes o fotos. Hasta 4 archivos de 20 MB.' });
  function estado(){
    var he=(SIMF.estado==='hecho'), hoy2=hoyISO();
    $('simf-hecho').hidden=!he;
    $('simf-fecha-t').textContent=he ? 'Día en que se hizo' : 'Día en que se hará';
    if(he){ $('simf-fecha').max=hoy2; $('simf-fecha').removeAttribute('min'); } else { $('simf-fecha').min=hoy2; $('simf-fecha').removeAttribute('max'); }
    $('simf-ok').textContent=he ? (nuevo || pasa ? 'Guardar el simulacro' : 'Guardar los cambios') : (nuevo ? 'Programarlo' : 'Guardar los cambios');
    Array.prototype.forEach.call($('simf-estado').querySelectorAll('button'), function(b){ var on=(b.getAttribute('data-v')===SIMF.estado); b.className=on ? 'on' : ''; b.setAttribute('aria-selected', on ? 'true' : 'false'); });
  }
  $('simf-estado').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; SIMF.estado=b.getAttribute('data-v'); estado(); };
  $('simf-tipo').onclick=function(ev){
    var b=ev.target.closest('[data-v]'); if(!b) return;
    var antes=simTipo(SIMF.tipo); SIMF.tipo=b.getAttribute('data-v'); var x=simTipo(SIMF.tipo);
    Array.prototype.forEach.call(this.querySelectorAll('.chip'), function(c){ var on=(c===b); c.className='chip'+(on ? ' on' : ''); c.setAttribute('aria-checked', on ? 'true' : 'false'); });
    /* el objetivo cambia con el tipo solo si nadie lo tocó */
    if(gesSegundos($('simf-meta').value)===antes[3] || !gesTxt($('simf-meta').value)) $('simf-meta').value=gesReloj(x[3]);
    $('simf-esc').placeholder=x[4]||'';
  };
  $('simf-ok').onclick=_simfGuardar;
  estado();
}
function _simfGuardar(){
  if(SIMF.guardando) return;
  var m=$('simf-msg'), bt=$('simf-ok'), f=SIMF.f, hoy=hoyISO(), he=(SIMF.estado==='hecho');
  var mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} };
  var fe=$('simf-fecha').value, t=simTipo(SIMF.tipo);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fe)) return mal(he ? 'Falta el día en que se hizo.' : '¿Qué día se hará?', 'simf-fecha');
  if(he && fe>hoy) return mal('Ese día todavía no llega. Si es para más adelante, toca «Se va a hacer».', 'simf-fecha');
  if(!he && fe<hoy) return mal('Ese día ya pasó. Si ya se hizo, toca «Ya se hizo» y regístralo con sus tiempos.', 'simf-fecha');
  var meta=gesSegundos($('simf-meta').value);
  if(meta!==null && (isNaN(meta) || meta<10 || meta>7200)) return mal('El tiempo objetivo va en minutos y segundos: por ejemplo 03:00.', 'simf-meta');
  var d={ v:1, k:'sim', estado:SIMF.estado, tipo:t[0], fecha:fe, hora:$('simf-hora').value||'', lugar:gesTxt($('simf-lugar').value).slice(0, 120), punto:gesTxt($('simf-punto').value).slice(0, 120), lider:gesTxt($('simf-lider').value).slice(0, 100),
          escenario:gesTxt($('simf-esc').value).slice(0, 300) || (t[4]||''), meta:meta, por:(f && f.d.por) || gesQuien(), cuando:(f && f.d.cuando) || new Date().toISOString() };
  if(SIMF.nac) d.nac=SIMF.nac;
  if(he){
    var seg=gesSegundos($('simf-seg').value), pres=$('simf-pres').value===''? null : parseInt($('simf-pres').value, 10), evac=$('simf-evac').value==='' ? null : parseInt($('simf-evac').value, 10);
    if(seg!==null && (isNaN(seg) || seg<1 || seg>14400)) return mal('El tiempo de evacuación va en minutos y segundos: por ejemplo 02:45.', 'simf-seg');
    if(pres!==null && !(pres>=0)) return mal('Revisa cuántas personas había en la obra.', 'simf-pres');
    if(evac!==null && !(evac>=0)) return mal('Revisa cuántos evacuaron.', 'simf-evac');
    if(pres!==null && evac!==null && evac>pres) return mal('No pueden haber evacuado más personas ('+evac+') de las que había en la obra ('+pres+').', 'simf-evac');
    if(seg===null && evac===null && pres===null) return mal('Pon al menos el tiempo de evacuación o cuántos participaron: es lo que deja constancia de que se hizo.', 'simf-seg');
    d.seg=seg; d.presentes=pres; d.evacuados=evac; d.faltan=gesTxt($('simf-faltan').value).slice(0, 300);
    d.hallazgos=SIMF.ren.leer().map(function(x){ return { t:x.t }; }); d.notas=String($('simf-notas').value||'').trim().slice(0, 800);
  }
  SIMF.guardando=true; bt.disabled=true; m.className='msg gris'; m.textContent=(he && SIMF.ev.n()) ? 'Subiendo los archivos…' : 'Guardando…';
  (he ? SIMF.ev.subir() : Promise.resolve((f && f.d.ev) || [])).then(function(ev){
    d.ev=ev; m.textContent='Guardando…';
    return gesActGuardar(f ? f.id : null, d, 'Simulacro · '+t[2]+' · '+fe);
  }).then(function(){
    SIMF.guardando=false;
    toast(he ? 'Simulacro registrado'+(d.seg!=null ? ': evacuación en '+gesReloj(d.seg)+(d.meta ? (d.seg<=d.meta ? ', dentro del objetivo.' : ', sobre el objetivo de '+gesReloj(d.meta)+'.') : '.') : '.') : 'Simulacro programado para el '+fechaLarga(fe)+'.');
    cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
  }).catch(function(e){ SIMF.guardando=false; bt.disabled=false; mal(e==='muy-grande' ? 'Un archivo pesa más de 25 MB: comprímelo.' : 'No se pudo guardar. '+porQueFallo(e)); });
}

/* ── 4.5 · CAMPAÑAS ───────────────────────────────────────────────────────────────────────────
   Las campañas de seguridad de la obra: las que vienen y las ya realizadas. Las diez de la app (con su lema, lo que
   buscan y el título de cada día) están para elegir; o una propia.
     { v:1, k:'camp', estado:'hecha'|'programada', kcat, nombre, lema, objetivo, desde, hasta, resp,
       dias:[{t, e:'si'|'no'}], participantes, resultado, ev:[{u,n}], por, cuando } */
var CAMW = { filas:[], n:0, caja:null, cat:null, firma:'' };
function campCat(){ return (CAMW.cat && Array.isArray(CAMW.cat.campanas)) ? CAMW.cat.campanas : []; }
function campEstado(d){
  if(d.estado==='hecha') return { k:'hecha', t:'realizada', cl:'ok' };
  var hoy=hoyISO(), a=String(d.desde||''), b=String(d.hasta||d.desde||'');
  if(b<hoy) return { k:'atrasada', t:'ya pasó su fecha', cl:'mal' };
  if(a<=hoy) return { k:'curso', t:'en curso', cl:'ojo' };
  return { k:'prog', t:'programada', cl:'azul' };
}
function gesVistaCamp(caja){
  _gesCss(); _yaCss();
  CAMW.caja=caja;
  var ac=$('acciones');
  if(ac){
    ac.innerHTML='<button type="button" class="bt sec" id="cam-prog">Programar una campaña</button><button type="button" class="bt" id="cam-nueva">＋ Registrar una ya realizada</button>';
    $('cam-prog').onclick=function(){ campForm(null, { estado:'programada' }); };
    $('cam-nueva').onclick=function(){ campForm(null, { estado:'hecha' }); };
  }
  cargando(caja);
  function pinta(silencio){
    var n=++CAMW.n;
    Promise.all([gesActTraer(true), gesCat()]).then(function(r){
      if(n!==CAMW.n || VISTA.actual!=='campanas') return;
      var firma=''; try{ firma=JSON.stringify(r[0])+hoyISO(); }catch(e){}
      if(silencio && firma && firma===CAMW.firma && $('t-cam') && document.body.contains(caja)) return;
      CAMW.firma=firma; CAMW.cat=r[1]; CAMW.filas=gesActDe(r[0], 'camp'); campPintar();
    }).catch(function(cod){ if(n!==CAMW.n || VISTA.actual!=='campanas') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function campPintar(){
  var caja=CAMW.caja; if(!caja || !document.body.contains(caja)) return;
  var F=CAMW.filas, A=ANIO;
  var hechas=F.filter(function(f){ return f.d.estado==='hecha' && anioDe(f.d.desde)===A; }), prog=F.filter(function(f){ return f.d.estado!=='hecha'; });
  var atras=prog.filter(function(f){ return campEstado(f.d).k==='atrasada'; }).length, curso=prog.filter(function(f){ return campEstado(f.d).k==='curso'; }).length;
  var gente=hechas.reduce(function(s, f){ return s+(parseInt(f.d.participantes, 10)||0); }, 0);
  var h='<div class="aviso" id="cam-que"><b>Aquí se programan las campañas del año y se registran las que ya se hicieron</b>, con lo que se hizo cada día, cuántos participaron y su evidencia. '+
    'Las campañas armadas día por día (con su dinámica y sus materiales) están en la app, en «Campañas»: lo que se marca allí llega aquí solo, y lo que registras aquí se ve en la app.</div>';
  h+='<div class="rej">'+
    cifra('Realizadas en '+A, hechas.length, hechas.length ? 'campañas con su registro' : 'ninguna todavía', hechas.length ? 'ok' : '')+
    cifra('Programadas', prog.length, atras ? gesPlural(atras, 'ya pasó su fecha', 'ya pasaron su fecha') : (curso ? gesPlural(curso, 'en curso', 'en curso') : (prog.length ? 'por hacer' : 'ninguna por venir')), atras ? 'mal' : '')+
    cifra('Personas que participaron', gente, 'en las de '+A, '')+'</div>';
  h+='<div class="tarj" id="t-cam"></div>';
  var est=$('t-cam') ? $('t-cam')._est : null;
  caja.innerHTML=h;
  if(est) $('t-cam')._est=est;
  var filas=F.map(function(f){ var d=f.d, E=campEstado(d), dias=d.dias||[]; return { id:f.id, desde:d.desde||'', hasta:d.hasta||d.desde||'', nombre:d.nombre||'', lema:d.lema||'', resp:d.resp||'', est:E,
    hechos:dias.filter(function(x){ return x.e!=='no'; }).length, nd:dias.length, gente:(d.participantes!=null && d.participantes!=='') ? +d.participantes : null, ev:d.ev||[], _f:f }; });
  var cols=[
    {k:'desde', t:'Fechas', h:function(x){ return esc(fechaLarga(x.desde))+(x.hasta && x.hasta!==x.desde ? '<span class="sub">al '+esc(fechaLarga(x.hasta))+'</span>' : ''); }},
    {k:'hasta', t:'Hasta', soloCsv:true},
    {k:'nombre', t:'Campaña', h:function(x){ return '<b>'+esc(x.nombre)+'</b>'+(x.lema ? '<span class="sub">«'+esc(x.lema)+'»</span>' : ''); }, v:function(x){ return x.nombre+' '+x.lema; }, csv:function(x){ return x.nombre; }},
    {k:'resp', t:'Responsable'},
    {k:'_est', t:'Estado', h:function(x){ return '<span class="pill '+x.est.cl+'">'+esc(x.est.t)+'</span>'; }, v:function(x){ return x.est.t; }},
    {k:'hechos', t:'Actividades', num:true, h:function(x){ return x.nd ? (x.est.k==='hecha' ? x.hechos+' de '+x.nd : esc(x.nd)) : '—'; }},
    {k:'gente', t:'Participaron', num:true, h:function(x){ return x.gente===null ? '—' : esc(x.gente); }, v:function(x){ return x.gente===null ? '' : x.gente; }},
    {k:'ev', t:'Evidencia', h:function(x){ return x.ev.length ? x.ev.map(function(e, i){ return '<a href="'+esc(e.u)+'" target="_blank" rel="noopener" title="'+esc(e.n||'')+'">'+(x.ev.length>1 ? 'ver '+(i+1) : 'ver')+'</a>'; }).join(' · ') : ''; }, v:function(x){ return x.ev.map(function(e){ return e.u; }).join(' '); }},
    {k:'_acc', t:'', acc:true, h:function(x){ return (x.est.k==='hecha' ? '' : '<button type="button" class="bt chico" data-acc="hecha">Ya se hizo</button> ')+'<button type="button" class="bt sec chico" data-acc="abrir">Abrir</button> <button type="button" class="bt mal chico" data-acc="quitar">Quitar</button>'; }}
  ];
  tabla($('t-cam'), cols, filas, {orden:'desde', asc:false, unidad:'campañas', archivo:'campanas', vacio:'Ninguna campaña todavía', vacioSub:'Programa la que viene o registra una que ya se hizo.',
    alClic:function(x){ campForm(x._f); },
    accion:function(acc, x){ if(acc==='quitar') campQuitar(x._f); else if(acc==='hecha') campForm(x._f, { estado:'hecha' }); else campForm(x._f); }});
}
function campQuitar(f){
  var d=f.d;
  confirmar('¿Quitar esta campaña?', '«'+(d.nombre||'Campaña')+'» del '+fechaLarga(d.desde)+(d.estado==='hecha' ? '. Ya se hizo: se pierde su registro (los archivos subidos no se borran).' : '. Estaba programada.'), {si:'Sí, quitarla', mal:true}).then(function(si){
    if(!si) return;
    gesActQuitar(f.id).then(function(){ toast('Campaña quitada.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true); }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}
var CAMF = { f:null, estado:'hecha', ren:null, ev:null, guardando:false };
function campForm(f, pre){
  _gesCss(); _yaCss();
  var d=Object.assign({}, (f && f.d) || {}, pre || {}), nuevo=!f, hoy=hoyISO(), C=campCat();
  CAMF.f=f||null; CAMF.guardando=false; CAMF.estado=(d.estado==='programada') ? 'programada' : 'hecha';
  var pasa=(f && f.d.estado!=='hecha' && CAMF.estado==='hecha');
  var kcat=d.kcat || (nuevo ? '' : '_otra');
  var h='<div class="seg ya-estado" id="camf-estado" role="tablist" aria-label="¿Ya se hizo?"'+((f && f.d.estado==='hecha') ? ' hidden' : '')+'>'+
      [['hecha', 'Ya se hizo'], ['programada', 'Se va a hacer']].map(function(x){ var on=(x[0]===CAMF.estado); return '<button type="button" role="tab" aria-selected="'+(on ? 'true' : 'false')+'" class="'+(on ? 'on' : '')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div>'+
    '<div class="campo"><label for="camf-cat">Qué campaña</label><select id="camf-cat"><option value=""'+(kcat==='' ? ' selected' : '')+'>— elige una —</option>'+
      C.map(function(x){ return '<option value="'+esc(x[0])+'"'+(x[0]===kcat ? ' selected' : '')+'>'+esc(x[1]+' '+x[2])+'</option>'; }).join('')+
      '<option value="_otra"'+(kcat==='_otra' ? ' selected' : '')+'>Otra: la escribo yo</option></select></div>'+
    '<div id="camf-cuerpo"'+(kcat ? '' : ' hidden')+'>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="camf-nombre">Nombre de la campaña</label><input id="camf-nombre" maxlength="120" value="'+esc(d.nombre||'')+'"></div>'+
      '<div class="campo"><label for="camf-lema">Lema <span class="tenue">· opcional</span></label><input id="camf-lema" maxlength="140" value="'+esc(d.lema||'')+'"></div></div>'+
    '<div class="campo"><label for="camf-obj">Lo que se busca</label><textarea id="camf-obj" rows="2" maxlength="400">'+esc(d.objetivo||'')+'</textarea></div>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="camf-desde">Empieza</label><input type="date" id="camf-desde" value="'+esc(String(d.desde||'').slice(0, 10))+'"></div>'+
      '<div class="campo"><label for="camf-hasta">Termina</label><input type="date" id="camf-hasta" value="'+esc(String(d.hasta||'').slice(0, 10))+'"></div>'+
      '<div class="campo"><label for="camf-resp">Responsable</label><input id="camf-resp" maxlength="100" value="'+esc(d.resp||'')+'"></div></div>'+
    '<div class="seccion"><h3 id="camf-dias-t">Las actividades</h3><p class="ayuda" style="margin:0 0 8px" id="camf-dias-ay"></p><div id="camf-dias"></div></div>'+
    '<div id="camf-hecha"'+(CAMF.estado==='hecha' ? '' : ' hidden')+'>'+
      '<div class="fila-c ya-al" style="margin-top:14px"><div class="campo"><label for="camf-part">Personas que participaron</label><input type="number" id="camf-part" inputmode="numeric" min="0" max="99999" step="1" value="'+esc(d.participantes!=null ? d.participantes : '')+'"></div></div>'+
      '<div class="campo"><label for="camf-res">Resultado <span class="tenue">· lo que se logró, con números si los hay</span></label><textarea id="camf-res" rows="3" maxlength="800">'+esc(d.resultado||'')+'</textarea></div>'+
      '<div class="seccion"><h3>La evidencia</h3><div id="camf-ev"></div></div></div>'+
    '</div><div class="msg" id="camf-msg" role="status"></div>';
  abrirHoja(nuevo ? (CAMF.estado==='hecha' ? 'Registrar una campaña realizada' : 'Programar una campaña') : (pasa ? 'Ya se hizo: ' : '')+(d.nombre||'Campaña'), nuevo ? (CAMF.estado==='hecha' ? 'Una que ya se hizo: queda con sus fechas, lo que se hizo y su evidencia' : 'Queda en la lista del año, con sus fechas') : fechaLarga(d.desde),
    h, (nuevo ? '' : '<button type="button" class="bt mal" id="camf-quitar">Quitar</button>')+'<button type="button" class="bt" id="camf-ok">Guardar</button>', {sinFoco:true});
  if($('camf-quitar')) $('camf-quitar').onclick=function(){ campQuitar(f); };
  function dias(lista){
    CAMF.ren=gesRenglones($('camf-dias'), { id:'camf-ren', lista:lista, estados:(CAMF.estado==='hecha' ? [['si', 'Se hizo'], ['no', 'No se hizo']] : null), ph:'Charla de arranque con toda la obra', mas:'Agregar otra actividad', que:'Actividad', max:15 });
  }
  CAMF.ev=gesEvidencia($('camf-ev'), { id:'camf-evi', lista:d.ev||[], max:4, texto:'Adjuntar fotos o el informe', ayuda:'Fotos de las actividades, el afiche o el informe de cierre. Hasta 4 archivos de 20 MB.' });
  function estado(cambio){
    var he=(CAMF.estado==='hecha'), hoy2=hoyISO();
    $('camf-hecha').hidden=!he;
    $('camf-dias-t').textContent=he ? 'Lo que se hizo' : 'Las actividades';
    $('camf-dias-ay').textContent=he ? 'Una actividad por renglón; marca la que al final no se hizo.' : 'Una actividad por renglón: lo que toca cada día.';
    if(he){ $('camf-desde').max=hoy2; $('camf-hasta').max=hoy2; } else { $('camf-desde').removeAttribute('max'); $('camf-hasta').removeAttribute('max'); }
    $('camf-ok').textContent=he ? (nuevo || pasa ? 'Guardar la campaña' : 'Guardar los cambios') : (nuevo ? 'Programarla' : 'Guardar los cambios');
    Array.prototype.forEach.call($('camf-estado').querySelectorAll('button'), function(b){ var on=(b.getAttribute('data-v')===CAMF.estado); b.className=on ? 'on' : ''; b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if(cambio) dias(CAMF.ren ? CAMF.ren.leer() : []);
  }
  $('camf-estado').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b || b.getAttribute('data-v')===CAMF.estado) return; CAMF.estado=b.getAttribute('data-v'); estado(true); };
  $('camf-cat').onchange=function(){
    var k=this.value, x=C.filter(function(y){ return y[0]===k; })[0];
    $('camf-cuerpo').hidden=!k;
    if(x){ $('camf-nombre').value=x[2]; $('camf-lema').value=x[3]||''; $('camf-obj').value=x[4]||''; dias((x[5]||[]).map(function(t){ return { t:t, e:'si' }; })); }
    else if(k==='_otra'){ try{ $('camf-nombre').focus(); }catch(e){} }
  };
  /* al poner el inicio, el fin se propone a los cinco días (una semana de obra) */
  $('camf-desde').onchange=function(){ var a=this.value, b=$('camf-hasta'); if(/^\d{4}-\d{2}-\d{2}$/.test(a) && !b.value){ var p=a.split('-'), dd=new Date(+p[0], +p[1]-1, +p[2]+4), iso=dd.getFullYear()+'-'+dos(dd.getMonth()+1)+'-'+dos(dd.getDate()); b.value=(CAMF.estado==='hecha' && iso>hoyISO()) ? hoyISO() : iso; } };
  $('camf-ok').onclick=_camfGuardar;
  dias((d.dias||[]).map(function(x){ return { t:x.t, e:x.e||'si' }; }));
  estado(false);
}
function _camfGuardar(){
  if(CAMF.guardando) return;
  var m=$('camf-msg'), bt=$('camf-ok'), f=CAMF.f, hoy=hoyISO(), he=(CAMF.estado==='hecha');
  var mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} };
  var kcat=$('camf-cat').value, nombre=gesTxt($('camf-nombre').value).slice(0, 120), a=$('camf-desde').value, b=$('camf-hasta').value;
  if(!kcat) return mal('Elige qué campaña es (o «Otra» para escribirla).', 'camf-cat');
  if(nombre.length<3) return mal('Falta el nombre de la campaña.', 'camf-nombre');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(a)) return mal(he ? 'Falta el día en que empezó.' : '¿Qué día empieza?', 'camf-desde');
  if(!b) b=a;
  if(b<a) return mal('Termina antes de empezar: revisa las dos fechas.', 'camf-hasta');
  if(he && b>hoy) return mal('Todavía no termina. Si sigue en curso, déjala en «Se va a hacer» y márcala como hecha al cerrar.', 'camf-hasta');
  if(!he && b<hoy) return mal('Esas fechas ya pasaron. Si ya se hizo, toca «Ya se hizo» y regístrala.', 'camf-hasta');
  var dias=CAMF.ren.leer().map(function(x){ return he ? { t:x.t, e:(x.e==='no' ? 'no' : 'si') } : { t:x.t }; });
  if(he && !dias.length) return mal('Anota al menos una actividad de las que se hicieron.');
  var d={ v:1, k:'camp', estado:CAMF.estado, kcat:(kcat==='_otra' ? '' : kcat), nombre:nombre, lema:gesTxt($('camf-lema').value).slice(0, 140), objetivo:String($('camf-obj').value||'').trim().slice(0, 400),
          desde:a, hasta:b, resp:gesTxt($('camf-resp').value).slice(0, 100), dias:dias, por:(f && f.d.por) || gesQuien(), cuando:(f && f.d.cuando) || new Date().toISOString() };
  if(he){
    var part=$('camf-part').value==='' ? null : parseInt($('camf-part').value, 10);
    if(part!==null && !(part>=0)) return mal('Revisa cuántos participaron.', 'camf-part');
    d.participantes=part; d.resultado=String($('camf-res').value||'').trim().slice(0, 800);
  }
  CAMF.guardando=true; bt.disabled=true; m.className='msg gris'; m.textContent=(he && CAMF.ev.n()) ? 'Subiendo los archivos…' : 'Guardando…';
  (he ? CAMF.ev.subir() : Promise.resolve((f && f.d.ev) || [])).then(function(ev){
    d.ev=ev; m.textContent='Guardando…';
    return gesActGuardar(f ? f.id : null, d, 'Campaña · '+nombre+' · '+a);
  }).then(function(){
    CAMF.guardando=false;
    toast(he ? 'Campaña registrada.' : 'Campaña programada del '+fechaLarga(a)+' al '+fechaLarga(b)+'.');
    cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
  }).catch(function(e){ CAMF.guardando=false; bt.disabled=false; mal(e==='muy-grande' ? 'Un archivo pesa más de 25 MB: comprímelo.' : 'No se pudo guardar. '+porQueFallo(e)); });
}

/* ── 4.6 · «CARGAR MI GESTIÓN»: LA ENTRADA ────────────────────────────────────────────────────
   Una sola pantalla para el que llega con su gestión ya andando: qué se puede cargar, cuánto hay cargado de cada
   cosa y la puerta directa a cada una. No guarda nada por su cuenta: cada tarjeta abre lo de su sección. */
var CARW = { n:0 };
function gesVistaCargar(caja){
  _gesCss(); _yaCss();
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  var hay=function(id){ return vistasDe().some(function(v){ return v.id===id; }); };
  var idPer=hay('personas') ? 'personas' : (hay('personal') ? 'personal' : '');
  function ir(id, luego){ navegar(id); if(luego) try{ luego(); }catch(e){} }
  function pinta(silencio){
    var n=++CARW.n, nada=function(){ return null; };
    Promise.all([
      traerTodo('sst_trabajador', '&select=id,estatus&order=nombre.asc', 6000).catch(nada),
      traerTodo('sst_hht', '&select=fecha&order=fecha.desc', 8000).catch(nada),
      traer('sst_accidente', '&select=id,fecha&order=fecha.desc', 2000).catch(nada),
      gesActTraer(true).catch(nada),
      traer('sst_inspeccion', '&select=id,fecha&order=fecha.desc', 2000).catch(nada),
      traer('sst_reporte', '&select=id&order=creado.desc', 2000).catch(nada),
      /* 07/10/2026 · la entrega de EPP y los datos de la empresa también se cargan aquí (portal/mas.js) */
      traerTodo('sst_kardex', '&select=ext&order=fecha.desc,ext.desc', 30000).catch(nada),
      traer('sst_doc', '&select=id,nota&hoja=eq.empleador&order=creado.desc', 1).catch(nada)
    ]).then(function(r){
      if(n!==CARW.n || VISTA.actual!=='cargar') return;
      var trab=r[0], hht=r[1], acc=r[2], act=r[3]||[], insp=r[4], rep=r[5];
      var activos=trab ? trab.filter(function(t){ return String(t.estatus||'activo')!=='cesado'; }).length : null;
      var dias={}; (hht||[]).forEach(function(x){ dias[String(x.fecha).slice(0, 10)]=1; });
      var caps=gesActDe(act, 'cap'), sims=gesActDe(act, 'sim'), cams=gesActDe(act, 'camp');
      var T=[];
      function tarj(o){ if(!o.id || !hay(o.id)) return; T.push(o); }
      function nb(n, uno, varios){ return '<b>'+n+'</b> '+(n===1 ? uno : varios); }
      var kar=r[6], idKar=hay('kardex') ? 'kardex' : (hay('epp') ? 'epp' : ''), emp=null;
      try{ emp=(r[7] && r[7][0]) ? nota(r[7][0].nota) : null; }catch(_e){ emp=null; }
      tarj({ id:'empresa', ic:'🏢', t:'Datos y logo de la empresa', d:'La razón social, los códigos de tus formatos y el logo: salen en la cabecera de cada registro. Conviene dejarlo listo antes que nada.',
        n:r[7]===null ? '' : ((emp && emp.razon) ? '<b>'+esc(String(emp.razon).slice(0, 60))+'</b>'+((emp.logo) ? ' · con logo' : ' · sin logo todavía') : 'Todavía sin cargar'),
        bts:[['car-emp', (emp && emp.razon) ? 'Revisar los datos' : 'Cargar mis datos', function(){ ir('empresa'); }]] });
      tarj({ id:idPer, ic:'👷', t:'Tu personal', d:'Sube la relación de tu Excel (o pégala): cada fila, una ficha. Lo demás se une a cada persona por su documento, así que conviene empezar por aquí.',
        n:activos===null ? '' : (activos ? '<b>'+activos+'</b> '+(activos===1 ? 'trabajador activo' : 'trabajadores activos') : 'Todavía nadie cargado'),
        bts:[['car-per', '⬆ Subir mi lista', function(){ ir(idPer, function(){ gesPersonalSubir(); }); }], ['car-per-ver', 'Ver el personal', function(){ ir(idPer); }, true]] });
      tarj({ id:idKar, ic:'⛑', t:'Entrega de EPP (kardex)', d:'El kardex que ya llevabas, desde tu Excel: una fila por EPP entregado, con su fecha y a quién. Y las entregas de hoy, con la firma en la pantalla o en papel.',
        n:kar===null ? '' : (kar.length ? '<b>'+kar.length+'</b> '+(kar.length===1 ? 'entrega en el kardex' : 'entregas en el kardex') : 'Ninguna entrega todavía'),
        bts:[['car-kar', '⬆ Subir mi kardex', function(){ ir(idKar, function(){ masIr('masEppSubir'); }); }], ['car-kar-una', '＋ Registrar una entrega', function(){ ir(idKar, function(){ masIr('masEppNueva'); }); }, true]] });
      tarj({ id:'hh', ic:'⏱', t:'Horas hombre', d:'Las trabajadas y las de capacitación de los meses anteriores: un rango de días con su horario, o el total del mes repartido.',
        n:hht===null ? '' : (Object.keys(dias).length ? '<b>'+Object.keys(dias).length+'</b> '+(Object.keys(dias).length===1 ? 'día registrado' : 'días registrados') : 'Ningún día registrado'),
        bts:[['car-hh', 'Llenar meses anteriores', function(){ HHW.alAbrir=function(){ hhAbrirVarios(); }; ir('hh'); }], ['car-hh-ver', 'Ver las horas', function(){ ir('hh'); }, true]] });
      tarj({ id:'acc', ic:'⚠', t:'Accidentabilidad', d:'La estadística que ya llevabas, mes por mes (horas hombre, eventos y días perdidos): con eso los índices del año salen completos.',
        n:acc===null ? '' : (acc.length ? '<b>'+acc.length+'</b> '+(acc.length===1 ? 'evento registrado' : 'eventos registrados') : 'Ningún evento registrado'),
        bts:[['car-acc', 'Cargar meses anteriores', function(){ ACCW.alAbrir=function(){ accHistorico(); }; ir('acc'); }], ['car-acc-ev', 'Registrar un evento', function(){ ACCW.alAbrir=function(){ accForm(null); }; ir('acc'); }, true]] });
      tarj({ id:'caphechas', ic:'🎓', t:'Capacitaciones realizadas', d:'Las que ya se dieron: el tema, el día, quiénes asistieron y la lista firmada. Una por una, o todo tu control de una vez desde el Excel.',
        n:caps.length ? '<b>'+caps.length+'</b> '+(caps.length===1 ? 'registrada' : 'registradas') : 'Ninguna registrada a mano',
        bts:[['car-cap', '＋ Registrar una', function(){ ir('caphechas', function(){ capForm(null); }); }], ['car-cap-xls', '⬆ Subir desde un Excel', function(){ ir('caphechas', function(){ capSubir(); }); }, true]] });
      tarj({ id:'insp', ic:'🔎', t:'Inspecciones', d:'Las que se hicieron en papel —la mensual, las del programa—: el formato, el día, quién la hizo y lo que encontró, con la hoja adjunta.',
        n:insp===null ? '' : (insp.length ? '<b>'+insp.length+'</b> '+(insp.length===1 ? 'inspección en el registro' : 'inspecciones en el registro') : 'Ninguna en el registro'),
        bts:[['car-insp', '＋ Registrar una', function(){ ir('insp', function(){ gesInspForm(null); }); }], ['car-insp-ver', 'Ver las inspecciones', function(){ ir('insp'); }, true]] });
      tarj({ id:'simulacros', ic:'🧯', t:'Simulacros', d:'Los que ya se hicieron, con sus tiempos, cuántos participaron y lo que se encontró; y los que vienen, programados.',
        n:sims.length ? nb(sims.filter(function(f){ return f.d.estado==='hecho'; }).length, 'realizado', 'realizados')+' · '+nb(sims.filter(function(f){ return f.d.estado!=='hecho'; }).length, 'programado', 'programados') : 'Ninguno todavía',
        bts:[['car-sim', '＋ Registrar uno', function(){ ir('simulacros', function(){ simForm(null, { estado:'hecho' }); }); }], ['car-sim-ver', 'Ver los simulacros', function(){ ir('simulacros'); }, true]] });
      tarj({ id:'campanas', ic:'🎯', t:'Campañas', d:'Las campañas de seguridad ya hechas, con lo que se hizo cada día, cuántos participaron y su evidencia; y las que vienen.',
        n:cams.length ? nb(cams.filter(function(f){ return f.d.estado==='hecha'; }).length, 'realizada', 'realizadas')+' · '+nb(cams.filter(function(f){ return f.d.estado!=='hecha'; }).length, 'programada', 'programadas') : 'Ninguna todavía',
        bts:[['car-cam', '＋ Registrar una', function(){ ir('campanas', function(){ campForm(null, { estado:'hecha' }); }); }], ['car-cam-ver', 'Ver las campañas', function(){ ir('campanas'); }, true]] });
      tarj({ id:'reportes', ic:'🚨', t:'Reportes de actos y condiciones', d:'Los que ya tenías anotados en papel o en otra hoja: qué se vio, dónde, quién lo reportó y, si ya se levantó, qué se hizo.',
        n:rep===null ? '' : (rep.length ? '<b>'+rep.length+'</b> '+(rep.length===1 ? 'reporte en el registro' : 'reportes en el registro') : 'Ninguno en el registro'),
        bts:[['car-rep', '＋ Registrar uno', function(){ ir('reportes', function(){ gesRepForm(); }); }], ['car-rep-ver', 'Ver los reportes', function(){ ir('reportes'); }, true]] });
      tarj({ id:'docs', ic:'☰', t:'Documentos', d:'El reglamento interno, las políticas, los procedimientos, la matriz IPERC, los planes: arrástralos y cada uno va a su carpeta (y a su cartel QR).',
        n:'', bts:[['car-docs', 'Ir a Documentos', function(){ ir('docs'); }]] });
      var h='<div class="aviso" id="car-que"><b>Lo que ya llevabas antes de OBRASST entra aquí, para no empezar en cero.</b> Cada cosa va al mismo registro que usa la app: no se carga dos veces. '+
        'Y nada de esto es «programar»: es lo que ya pasó, con su fecha. Lo que viene se programa en su sección.</div><div class="ges-hub" id="car-hub">'+
        T.map(function(o){
          var falta=(typeof planWebFalta==='function') ? planWebFalta(o.id) : null, P=falta ? planWebPlan(falta.desde) : null;
          return '<section class="ges-hub-t'+(falta ? ' cand' : '')+'" data-id="'+esc(o.id)+'"><h3><span aria-hidden="true">'+o.ic+'</span>'+esc(o.t)+'</h3><p>'+esc(o.d)+'</p>'+
            (falta ? '<div class="ges-hub-n">🔒 No está en tu plan'+(P ? ': se abre con el plan <b>'+esc(P.n)+'</b>' : '')+'</div><div class="acciones"><button type="button" class="bt sec chico" data-ver="'+esc(o.id)+'">Ver qué trae</button></div>'
                   : (o.n ? '<div class="ges-hub-n">'+o.n+'</div>' : '')+'<div class="acciones">'+o.bts.map(function(b){ return '<button type="button" class="bt chico'+(b[3] ? ' sec' : '')+'" id="'+b[0]+'">'+esc(b[1])+'</button>'; }).join('')+'</div>')+'</section>';
        }).join('')+'</div>';
      caja.innerHTML=h;
      T.forEach(function(o){ o.bts.forEach(function(b){ var e=$(b[0]); if(e) e.onclick=b[2]; }); });
      Array.prototype.forEach.call(caja.querySelectorAll('[data-ver]'), function(b){ b.onclick=function(){ navegar(b.getAttribute('data-ver')); }; });
    }).catch(function(cod){ if(n!==CARW.n || VISTA.actual!=='cargar') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
