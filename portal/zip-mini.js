/* 23/11/2026 · Un ZIP mínimo, propio, con la forma de JSZip que usan el Estudio PDF (pdf-estudio.js) y los formatos
   Excel del informe (informe-formatos.js): new JSZip(), .file(nombre, datos, {base64}), .generateAsync({type:'blob',
   mimeType}). Sin compresión (STORE): los PDF, PNG y JPG ya vienen comprimidos y Excel abre igual un .xlsx guardado así.
   Así ninguna librería se baja de un CDN de afuera y la política de seguridad del sitio queda cerrada a 'self'. */
(function(){
  'use strict';
  if(typeof window.JSZip === 'function') return;
  var TABLA = null;
  function crc32(u8){
    if(!TABLA){ TABLA = new Uint32Array(256); for(var n = 0; n < 256; n++){ var c = n; for(var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); TABLA[n] = c >>> 0; } }
    var x = 0xFFFFFFFF; for(var i = 0; i < u8.length; i++) x = TABLA[(x ^ u8[i]) & 0xFF] ^ (x >>> 8);
    return (x ^ 0xFFFFFFFF) >>> 0;
  }
  function aBytes(d, op){
    if(d instanceof Uint8Array) return d;
    if(d instanceof ArrayBuffer) return new Uint8Array(d);
    if(ArrayBuffer.isView(d)) return new Uint8Array(d.buffer, d.byteOffset, d.byteLength);
    var s = String(d == null ? '' : d);
    if(op && op.base64){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
    return new TextEncoder().encode(s);
  }
  function fechaDos(){
    var d = new Date();
    return { t:((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF,
             f:(((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF };
  }
  function JSZip(){ if(!(this instanceof JSZip)) return new JSZip(); this._e = []; }
  JSZip.prototype.file = function(nombre, datos, op){
    var n = String(nombre).replace(/^\/+/, '');
    this._e = this._e.filter(function(e){ return e.n !== n; });
    this._e.push({ n:n, d:aBytes(datos, op) });
    return this;
  };
  JSZip.prototype.generateAsync = function(op){
    var self = this;
    return new Promise(function(res, rej){
      try{
        var enc = new TextEncoder(), dt = fechaDos(), trozos = [], central = [], off = 0;
        self._e.forEach(function(e){
          var nb = enc.encode(e.n), crc = crc32(e.d), tam = e.d.length;
          var lh = new Uint8Array(30 + nb.length), v = new DataView(lh.buffer);
          v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
          v.setUint16(10, dt.t, true); v.setUint16(12, dt.f, true); v.setUint32(14, crc, true); v.setUint32(18, tam, true); v.setUint32(22, tam, true);
          v.setUint16(26, nb.length, true); v.setUint16(28, 0, true); lh.set(nb, 30);
          trozos.push(lh, e.d);
          var ch = new Uint8Array(46 + nb.length), cv = new DataView(ch.buffer);
          cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true);
          cv.setUint16(12, dt.t, true); cv.setUint16(14, dt.f, true); cv.setUint32(16, crc, true); cv.setUint32(20, tam, true); cv.setUint32(24, tam, true);
          cv.setUint16(28, nb.length, true); cv.setUint32(42, off, true); ch.set(nb, 46);
          central.push(ch);
          off += lh.length + tam;
        });
        var tamC = 0; central.forEach(function(c){ trozos.push(c); tamC += c.length; });
        var fin = new Uint8Array(22), fv = new DataView(fin.buffer);
        fv.setUint32(0, 0x06054b50, true); fv.setUint16(8, self._e.length, true); fv.setUint16(10, self._e.length, true);
        fv.setUint32(12, tamC, true); fv.setUint32(16, off, true);
        trozos.push(fin);
        var blob = new Blob(trozos, { type:(op && op.mimeType) || 'application/zip' });
        if(op && (op.type === 'uint8array' || op.type === 'arraybuffer')){
          blob.arrayBuffer().then(function(ab){ res(op.type === 'arraybuffer' ? ab : new Uint8Array(ab)); }, rej);
        } else res(blob);
      }catch(e){ rej(e); }
    });
  };
  window.JSZip = JSZip;
})();
