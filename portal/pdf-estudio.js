/* ═══════════════════════════════════════════════════════════════════════════
   OBRASST · PORTAL WEB · Estudio PDF Integrado en Documentos
   Capacidades:
   - Soporte fluido para PDFs de 100+ hojas con renderizado progresivo por lotes
   - Selección: Todas / Ninguna / Invertir / Por números y rangos (ej. 1, 3, 5-12)
   - Dividir 1x1 (.zip) o unir marcadas (.pdf)
   - Insertar otro PDF antes o después de la página N exacta
   - Extraer hojas SIN modificar el original o MODIFICANDO el original (con Deshacer)
   - Edición interna de página: Texto, Imagen/Firma/Sello, Tapar/Blanquear, Resaltado, Rotar, Duplicar, Reordenar
   - Copiar hoja como imagen al portapapeles o aplanar hoja como imagen dentro del PDF
   - Convertir PDF -> Imágenes (PNG/JPG) e Imágenes -> PDF A4
   - Guardar directo en Documentos de Obra (sst_doc) con validación de seguridad y reintentos
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var MAX_PDF_BYTES = 50 * 1024 * 1024;  /* 50 MB */
  var MAX_IMG_BYTES = 15 * 1024 * 1024;  /* 15 MB */
  /* 23/11/2026 · las librerías son las del propio sitio (portal/pdflib, portal/pdfjs y zip-mini.js): nada de un CDN de
     afuera, y la política de seguridad (netlify.toml) queda cerrada a 'self' */

  var ST = {
    abierto: false,
    cargando: false,
    nombre: 'documento.pdf',
    hojaDestino: 'General',
    fuentes: [],        /* [{ id, bytes:Uint8Array, pdfjsDoc, nombre }] */
    paginas: [],        /* [{ uid, fuenteIdx, pageIdx, rot, sel, ops:[], aplanadaDataUrl:null }] */
    historial: [],      /* snapshots para Deshacer */
    editIdx: -1,        /* índice en ST.paginas del editor interno de página */
    herr: 'texto',      /* 'texto' | 'tapar' | 'resaltar' | 'imagen' */
    imgPendiente: null, /* { dataUrl, mime, w, h } */
    colaRender: [],
    renderActivo: false,
    imgsBuilder: [],    /* [{ id, file, dataUrl, nombre }] para Imágenes -> PDF */
    enVuelo: false
  };

  var _uidSeq = 1;
  function _uid(){ return 'pg' + (_uidSeq++) + '_' + Date.now().toString(36); }

  function _esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function _urlSegura(u){
    var s = String(u || '').trim();
    return /^(https:\/\/|http:\/\/localhost|blob:|data:image\/(png|jpeg|jpg|webp);base64,)/i.test(s);
  }

  function _esPdfMagico(u8){
    return !!(u8 && u8.length >= 5 && u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46 && u8[4] === 0x2D);
  }

  function _aviso(msg, tipo){
    if(typeof tostada === 'function'){ tostada(msg); return; }
    var el = document.getElementById('pdfe-estado');
    if(el){
      el.textContent = msg;
      el.style.color = tipo === 'mal' ? '#B91C1C' : (tipo === 'ok' ? '#15803D' : '#0B2A3A');
    } else if(tipo === 'mal'){
      alert(msg);
    }
  }

  function _empActiva(){
    if(typeof empActiva === 'function'){ var e = empActiva(); if(e && e.id) return e; }
    if(typeof EMP_ID !== 'undefined' && EMP_ID) return { id: EMP_ID, nombre: '' };
    try{
      var raw = localStorage.getItem('sst_emp_activa') || localStorage.getItem('LS_EMP');
      if(raw){ var j = JSON.parse(raw); if(j && j.id) return j; }
    }catch(_e){}
    return null;
  }

  function _fetchRetry(url, opts, intentos){
    intentos = intentos || 3;
    return fetch(url, opts || {}).then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    }).catch(function(err){
      if(intentos <= 1) throw err;
      return new Promise(function(res){ setTimeout(res, 700 * (4 - intentos)); })
        .then(function(){ return _fetchRetry(url, opts, intentos - 1); });
    });
  }

  function _cargarScript(src, checkFn){
    if(checkFn()) return Promise.resolve();
    return new Promise(function(res, rej){
      var ex = document.querySelector('script[data-pdfe-src="' + src + '"]');
      if(ex){
        var t0 = Date.now();
        var iv = setInterval(function(){
          if(checkFn()){ clearInterval(iv); res(); }
          else if(Date.now() - t0 > 15000){ clearInterval(iv); rej(new Error('Tiempo agotado cargando librería PDF.')); }
        }, 120);
        return;
      }
      var sc = document.createElement('script');
      sc.src = src;
      sc.async = true;
      sc.setAttribute('data-pdfe-src', src);
      sc.onload = function(){ if(checkFn()) res(); else rej(new Error('Librería no disponible tras carga.')); };
      sc.onerror = function(){ rej(new Error('No se pudo cargar librería PDF (revisa conexión o CSP en netlify.toml).')); };
      document.head.appendChild(sc);
    });
  }

  function _asegurarLibs(){
    var lib = (typeof window.cargarPdfLib === 'function') ? window.cargarPdfLib()
            : _cargarScript('pdflib/pdf-lib.min.js?v=1.17.1', function(){ return !!window.PDFLib; });
    return lib.then(function(){
      if(typeof window.pdfjsP !== 'function') return Promise.reject(new Error('El visor de PDF no está disponible.'));
      return window.pdfjsP();
    }).then(function(m){
      window.pdfjsLib = m;
      if(typeof window.JSZip !== 'function') return Promise.reject(new Error('Falta zip-mini.js.'));
    });
  }


  function _guardarSnapshot(){
    var snap = ST.paginas.map(function(p){
      return {
        uid: p.uid, fuenteIdx: p.fuenteIdx, pageIdx: p.pageIdx, rot: p.rot,
        sel: p.sel, aplanadaDataUrl: p.aplanadaDataUrl,
        ops: JSON.parse(JSON.stringify(p.ops || []))
      };
    });
    ST.historial.push(snap);
    if(ST.historial.length > 12) ST.historial.shift();
  }

  function _deshacer(){
    if(!ST.historial.length){ _aviso('No hay cambios por deshacer.', 'info'); return; }
    ST.paginas = ST.historial.pop();
    _pintarGrid();
    _aviso('Último cambio revertido.', 'ok');
  }

  function _leerArchivoBytes(file){
    return new Promise(function(res, rej){
      var fr = new FileReader();
      fr.onload = function(){ res(new Uint8Array(fr.result)); };
      fr.onerror = function(){ rej(new Error('No se pudo leer el archivo seleccionado.')); };
      fr.readAsArrayBuffer(file);
    });
  }

  function _leerArchivoDataUrl(file){
    return new Promise(function(res, rej){
      var fr = new FileReader();
      fr.onload = function(){ res(String(fr.result || '')); };
      fr.onerror = function(){ rej(new Error('No se pudo leer la imagen.')); };
      fr.readAsDataURL(file);
    });
  }

  function _inyectarEstilos(){
    if(document.getElementById('pdfe-css')) return;
    var st = document.createElement('style');
    st.id = 'pdfe-css';
    st.textContent =
      '#pdfe-modal,#pdfe-modal *{box-sizing:border-box;font-family:var(--letra,"Plus Jakarta Sans",sans-serif)!important}' +
      '#pdfe-modal{position:fixed;inset:0;z-index:9950;background:rgba(8,34,47,.72);display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(4px)}' +
      '#pdfe-modal[hidden],#pdfe-ed-ov[hidden],#pdfe-img-ov[hidden]{display:none!important}' +
      '.pdfe-caja{background:#F8FAFC;color:#08222F;width:min(1320px,98vw);height:min(92vh,940px);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.35);border:1px solid rgba(11,42,58,.15)}' +
      '.pdfe-cab{background:#fff;padding:12px 18px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}' +
      '.pdfe-tit{display:flex;align-items:center;gap:10px}' +
      '.pdfe-sq{width:40px;height:40px;border-radius:30%;background:#fff;border:1px solid rgba(11,42,58,.08);box-shadow:inset 0 2px 6px rgba(0,0,0,.04),0 3px 9px rgba(11,42,58,.09);display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
      '.pdfe-sq img{width:24px;height:24px;object-fit:contain}' +
      '.pdfe-bar{background:#fff;padding:10px 18px;border-bottom:1px solid #E2E8F0;display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
      '.pdfe-grp{display:flex;align-items:center;gap:6px;padding-right:10px;border-right:1px solid #E2E8F0;flex-wrap:wrap}' +
      '.pdfe-grp:last-child{border-right:none}' +
      '.pdfe-btn{border:1px solid rgba(11,42,58,.16);background:#fff;color:#08222F;padding:7px 11px;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}' +
      '.pdfe-btn:hover{background:#F1F5F9}' +
      '.pdfe-btn.pri{background:linear-gradient(135deg,#FFC933,#F5B700);border-color:#E0A800;color:#08222F}' +
      '.pdfe-btn.osc{background:#0B2A3A;border-color:#0B2A3A;color:#fff}' +
      '.pdfe-btn.pel{background:#FEF2F2;border-color:#FECACA;color:#B91C1C}' +
      '.pdfe-btn:disabled{opacity:.5;cursor:not-allowed}' +
      '.pdfe-in{padding:6px 10px;border:1px solid #CBD5E1;border-radius:9px;font-size:12.5px;background:#fff;color:#08222F}' +
      '.pdfe-body{flex:1;overflow:auto;padding:16px}' +
      '.pdfe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:14px}' +
      '.pdfe-card{background:#fff;border:2px solid #E2E8F0;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:6px;position:relative;transition:border-color .12s,box-shadow .12s}' +
      '.pdfe-card.sel{border-color:#F5B700;background:#FFFBEB;box-shadow:0 4px 14px rgba(245,183,0,.22)}' +
      '.pdfe-thumb-wrap{background:#E2E8F0;border-radius:9px;min-height:190px;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;position:relative}' +
      '.pdfe-thumb-wrap canvas,.pdfe-thumb-wrap img{max-width:100%;max-height:215px;display:block;object-fit:contain}' +
      '.pdfe-badge-num{position:absolute;top:6px;left:6px;background:rgba(11,42,58,.86);color:#fff;font-size:11px;font-weight:800;padding:2px 7px;border-radius:999px}' +
      '.pdfe-badge-ed{position:absolute;top:6px;right:6px;background:#FFC933;color:#08222F;font-size:10.5px;font-weight:800;padding:2px 6px;border-radius:999px}' +
      '.pdfe-card-ops{display:flex;flex-wrap:wrap;gap:4px;justify-content:space-between}' +
      '.pdfe-mini{border:1px solid #CBD5E1;background:#fff;color:#08222F;border-radius:7px;padding:4px 6px;font-size:11px;font-weight:700;cursor:pointer;flex:1;min-width:28px;text-align:center}' +
      '.pdfe-mini:hover{background:#F1F5F9}' +
      '.pdfe-foot{background:#fff;border-top:1px solid #E2E8F0;padding:10px 18px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:12.5px}' +
      '#pdfe-ed-ov,#pdfe-img-ov{position:fixed;inset:0;z-index:9980;background:rgba(8,34,47,.82);display:flex;align-items:center;justify-content:center;padding:14px}' +
      '.pdfe-ed-box{background:#fff;width:min(1080px,96vw);height:min(90vh,860px);border-radius:16px;display:flex;flex-direction:column;overflow:hidden}' +
      '.pdfe-ed-main{flex:1;display:grid;grid-template-columns:1fr 290px;overflow:hidden}' +
      '@media(max-width:860px){.pdfe-ed-main{grid-template-columns:1fr}}' +
      '.pdfe-ed-stage{background:#CBD5E1;overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:18px}' +
      '.pdfe-canvas-wrap{position:relative;display:inline-block;box-shadow:0 8px 28px rgba(0,0,0,.25);background:#fff;cursor:crosshair}' +
      '.pdfe-ed-side{border-left:1px solid #E2E8F0;padding:14px;overflow:auto;display:flex;flex-direction:column;gap:10px;background:#F8FAFC}';
    document.head.appendChild(st);
  }

  function _crearModalDOM(){
    var ex = document.getElementById('pdfe-modal');
    if(ex) return ex;
    var dv = document.createElement('div');
    dv.id = 'pdfe-modal';
    dv.hidden = true;
    var icPdf = (typeof i3dImg === 'function') ? i3dImg('page_facing_up') : '📄';
    dv.innerHTML =
      '<div class="pdfe-caja">' +
        '<div class="pdfe-cab">' +
          '<div class="pdfe-tit">' +
            '<div class="pdfe-sq">' + icPdf + '</div>' +
            '<div><b id="pdfe-tit-nom" style="font-size:15.5px">Estudio PDF · Documentos de Obra</b>' +
            '<div id="pdfe-sub" style="font-size:12px;color:#64748B">Divide, inserta, extrae, edita o convierte PDFs e imágenes sin salir de Documentos.</div></div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button type="button" class="pdfe-btn" data-pe="abrir-local">📂 Cargar PDF</button>' +
            '<button type="button" class="pdfe-btn" data-pe="abrir-imgs">🖼️ Imágenes → PDF</button>' +
            '<button type="button" class="pdfe-btn" data-pe="deshacer">↩ Deshacer</button>' +
            '<button type="button" class="pdfe-btn osc" data-pe="guardar-doc">☁️ Guardar en Documentos</button>' +
            '<button type="button" class="pdfe-btn pel" data-pe="cerrar">✕ Cerrar</button>' +
          '</div>' +
        '</div>' +
        '<div class="pdfe-bar">' +
          '<div class="pdfe-grp">' +
            '<button type="button" class="pdfe-btn" data-pe="sel-todas">✓ Todas</button>' +
            '<button type="button" class="pdfe-btn" data-pe="sel-ninguna">☐ Ninguna</button>' +
            '<button type="button" class="pdfe-btn" data-pe="sel-invertir">⇄ Invertir</button>' +
            '<input type="text" id="pdfe-rangos" class="pdfe-in" style="width:155px" placeholder="Ej: 1, 3, 5-12">' +
            '<button type="button" class="pdfe-btn" data-pe="sel-rango">Marcar #</button>' +
          '</div>' +
          '<div class="pdfe-grp">' +
            '<button type="button" class="pdfe-btn pri" data-pe="dividir-zip">✂️ Dividir 1x1 (ZIP)</button>' +
            '<button type="button" class="pdfe-btn" data-pe="extraer-sin">📤 Extraer sin modificar</button>' +
            '<button type="button" class="pdfe-btn" data-pe="extraer-mod">✂️ Extraer y quitar del PDF</button>' +
            '<button type="button" class="pdfe-btn" data-pe="descargar-todo">⬇️ Descargar PDF actual</button>' +
          '</div>' +
          '<div class="pdfe-grp">' +
            '<span style="font-size:12px;font-weight:700">Insertar PDF</span>' +
            '<select id="pdfe-ins-donde" class="pdfe-in"><option value="despues">Después de pág.</option><option value="antes">Antes de pág.</option></select>' +
            '<input type="number" id="pdfe-ins-pag" class="pdfe-in" style="width:68px" min="1" value="1">' +
            '<button type="button" class="pdfe-btn" data-pe="insertar-pdf">➕ Añadir PDF</button>' +
          '</div>' +
          '<div class="pdfe-grp">' +
            '<button type="button" class="pdfe-btn" data-pe="pdf-a-imgs">🖼️ PDF → Imágenes</button>' +
            '<button type="button" class="pdfe-btn pel" data-pe="borrar-sel">🗑️ Quitar marcadas</button>' +
          '</div>' +
        '</div>' +
        '<div class="pdfe-body" id="pdfe-body"></div>' +
        '<div class="pdfe-foot">' +
          '<span id="pdfe-estado" style="font-weight:700">Listo. Carga un PDF o abre uno desde Documentos.</span>' +
          '<span id="pdfe-conteo" style="color:#475569">0 páginas · 0 marcadas</span>' +
        '</div>' +
        '<input type="file" id="pdfe-file-base" accept="application/pdf" hidden>' +
        '<input type="file" id="pdfe-file-ins" accept="application/pdf" hidden>' +
      '</div>' +
      '<div id="pdfe-ed-ov" hidden></div>' +
      '<div id="pdfe-img-ov" hidden></div>';

    document.body.appendChild(dv);
    _enlazarEventosModal(dv);
    return dv;
  }

  function _parsearRangos(txt, maxPag){
    var res = {};
    String(txt || '').split(',').forEach(function(part){
      var p = part.trim();
      if(!p) return;
      var m = /^(\d+)\s*-\s*(\d+)$/.exec(p);
      if(m){
        var a = Math.max(1, parseInt(m[1], 10)), b = Math.min(maxPag, parseInt(m[2], 10));
        if(a > b){ var tmp = a; a = b; b = tmp; }
        for(var k = a; k <= b; k++) res[k - 1] = true;
      } else if(/^\d+$/.test(p)){
        var n = parseInt(p, 10);
        if(n >= 1 && n <= maxPag) res[n - 1] = true;
      }
    });
    return res;
  }

  function _cargarPdfBytes(bytes, nombre, insertarEnPos){
    if(!_esPdfMagico(bytes)){
      _aviso('El archivo no es un PDF válido (encabezado %PDF- ausente).', 'mal');
      return Promise.resolve();
    }
    if(bytes.length > MAX_PDF_BYTES){
      _aviso('El PDF supera el límite de 50 MB permitido por seguridad.', 'mal');
      return Promise.resolve();
    }
    _aviso('Cargando y leyendo páginas del PDF…', 'info');
    return _asegurarLibs().then(function(){
      /* Copia defensiva porque pdfjs puede transferir el buffer al worker */
      var copiaParaPdfJs = new Uint8Array(bytes.length);
      copiaParaPdfJs.set(bytes);
      return window.pdfjsLib.getDocument({ data: copiaParaPdfJs }).promise.then(function(pdfDoc){
        var fIdx = ST.fuentes.length;
        ST.fuentes.push({ id: fIdx, bytes: bytes, pdfjsDoc: pdfDoc, nombre: nombre || 'documento.pdf' });
        var nuevas = [];
        for(var i = 0; i < pdfDoc.numPages; i++){
          nuevas.push({ uid: _uid(), fuenteIdx: fIdx, pageIdx: i, rot: 0, sel: false, ops: [], aplanadaDataUrl: null });
        }
        if(typeof insertarEnPos === 'number'){
          _guardarSnapshot();
          var pos = Math.max(0, Math.min(ST.paginas.length, insertarEnPos));
          Array.prototype.splice.apply(ST.paginas, [pos, 0].concat(nuevas));
          _aviso('Se insertaron ' + nuevas.length + ' páginas en la posición ' + (pos + 1) + '.', 'ok');
        } else {
          ST.nombre = nombre || 'documento.pdf';
          ST.paginas = nuevas;
          ST.historial = [];
          _aviso('PDF listo: ' + nuevas.length + ' páginas cargadas.', 'ok');
        }
        var tn = document.getElementById('pdfe-tit-nom');
        if(tn) tn.textContent = 'Estudio PDF · ' + ST.nombre;
        _pintarGrid();
      });
    }).catch(function(err){
      _aviso('No se pudo abrir el PDF: ' + (err && err.message ? err.message : err), 'mal');
    });
  }

  function _actualizarConteo(){
    var tot = ST.paginas.length;
    var mar = ST.paginas.filter(function(p){ return p.sel; }).length;
    var el = document.getElementById('pdfe-conteo');
    if(el) el.textContent = tot + ' páginas · ' + mar + ' marcadas';
    var inp = document.getElementById('pdfe-ins-pag');
    if(inp){ inp.max = Math.max(1, tot); if(parseInt(inp.value, 10) > tot) inp.value = Math.max(1, tot); }
  }

  function _pintarGrid(){
    var body = document.getElementById('pdfe-body');
    if(!body) return;
    _actualizarConteo();
    ST.colaRender = [];
    if(!ST.paginas.length){
      body.innerHTML =
        '<div style="text-align:center;padding:60px 20px;color:#475569">' +
          '<b style="font-size:16px;color:#08222F">Aún no hay un PDF cargado</b>' +
          '<p style="margin:8px 0 18px">Toca <b>«Cargar PDF»</b> para trabajar un documento (incluso de 100+ hojas) o <b>«Imágenes → PDF»</b> para armar uno desde fotos.</p>' +
        '</div>';
      return;
    }
    var h = '<div class="pdfe-grid">';
    ST.paginas.forEach(function(pg, i){
      var nOps = (pg.ops || []).length + (pg.aplanadaDataUrl ? 1 : 0);
      h += '<div class="pdfe-card' + (pg.sel ? ' sel' : '') + '" data-idx="' + i + '">' +
        '<div class="pdfe-thumb-wrap" data-pe="toggle-sel" data-idx="' + i + '">' +
          '<span class="pdfe-badge-num">Pág. ' + (i + 1) + '</span>' +
          (nOps ? '<span class="pdfe-badge-ed">✏️ ' + nOps + '</span>' : '') +
          (pg.aplanadaDataUrl
            ? '<img src="' + pg.aplanadaDataUrl + '" alt="Pág. ' + (i + 1) + '">'
            : '<canvas id="pdfe-cv-' + pg.uid + '" width="160" height="210"></canvas>') +
        '</div>' +
        '<div class="pdfe-card-ops">' +
          '<button type="button" class="pdfe-mini" data-pe="editar-pag" data-idx="' + i + '" title="Editar texto, firma, tapar">✏️ Editar</button>' +
          '<button type="button" class="pdfe-mini" data-pe="copiar-img" data-idx="' + i + '" title="Copiar hoja como imagen">📋 Img</button>' +
          '<button type="button" class="pdfe-mini" data-pe="rotar" data-idx="' + i + '" title="Rotar 90°">↻</button>' +
          '<button type="button" class="pdfe-mini" data-pe="duplicar" data-idx="' + i + '" title="Duplicar hoja">⧉</button>' +
          '<button type="button" class="pdfe-mini" data-pe="mover-izq" data-idx="' + i + '" title="Mover atrás">◀</button>' +
          '<button type="button" class="pdfe-mini" data-pe="mover-der" data-idx="' + i + '" title="Mover adelante">▶</button>' +
          '<button type="button" class="pdfe-mini" data-pe="borrar-uno" data-idx="' + i + '" title="Eliminar hoja" style="color:#B91C1C">✕</button>' +
        '</div>' +
      '</div>';
    });
    h += '</div>';
    body.innerHTML = h;

    ST.paginas.forEach(function(pg){
      if(!pg.aplanadaDataUrl) ST.colaRender.push(pg);
    });
    _procesarColaRender();
  }

  function _procesarColaRender(){
    if(ST.renderActivo || !ST.colaRender.length) return;
    ST.renderActivo = true;
    var pg = ST.colaRender.shift();
    var cv = document.getElementById('pdfe-cv-' + pg.uid);
    var src = ST.fuentes[pg.fuenteIdx];
    if(!cv || !src || !src.pdfjsDoc){
      ST.renderActivo = false;
      setTimeout(_procesarColaRender, 10);
      return;
    }
    src.pdfjsDoc.getPage(pg.pageIdx + 1).then(function(page){
      var vp0 = page.getViewport({ scale: 1, rotation: (page.rotate + pg.rot) % 360 });
      var esc = Math.min(200 / vp0.width, 260 / vp0.height);
      var vp = page.getViewport({ scale: esc, rotation: (page.rotate + pg.rot) % 360 });
      cv.width = Math.max(1, Math.floor(vp.width));
      cv.height = Math.max(1, Math.floor(vp.height));
      var ctx = cv.getContext('2d');
      return page.render({ canvasContext: ctx, viewport: vp }).promise;
    }).catch(function(){}).then(function(){
      ST.renderActivo = false;
      if(ST.colaRender.length) setTimeout(_procesarColaRender, 12);
    });
  }

  function _renderizarPaginaAltaRes(pg, escala){
    escala = escala || 2;
    if(pg.aplanadaDataUrl) return Promise.resolve(pg.aplanadaDataUrl);
    var src = ST.fuentes[pg.fuenteIdx];
    return src.pdfjsDoc.getPage(pg.pageIdx + 1).then(function(page){
      var vp = page.getViewport({ scale: escala, rotation: (page.rotate + pg.rot) % 360 });
      var cv = document.createElement('canvas');
      cv.width = Math.floor(vp.width);
      cv.height = Math.floor(vp.height);
      var ctx = cv.getContext('2d');
      return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function(){
        return cv.toDataURL('image/png');
      });
    });
  }

  function _hexARgb(hex){
    var h = String(hex || '#08222F').replace('#', '');
    if(h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16) || 0;
    return window.PDFLib.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  }

  function _compilarPdfDeLista(listaPaginas){
    var PDFLib = window.PDFLib;
    var outDoc = null;
    var cargados = {};

    function cargarFuentePdfLib(fIdx){
      if(cargados[fIdx]) return Promise.resolve(cargados[fIdx]);
      return PDFLib.PDFDocument.load(ST.fuentes[fIdx].bytes, { ignoreEncryption: true }).then(function(doc){
        cargados[fIdx] = doc;
        return doc;
      });
    }

    return PDFLib.PDFDocument.create().then(function(doc){
      outDoc = doc;
      return outDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    }).then(function(fontBold){
      var seq = Promise.resolve();
      listaPaginas.forEach(function(pg){
        seq = seq.then(function(){
          if(pg.aplanadaDataUrl){
            return fetch(pg.aplanadaDataUrl).then(function(r){ return r.arrayBuffer(); }).then(function(ab){
              return outDoc.embedPng(ab);
            }).then(function(img){
              var p = outDoc.addPage([img.width, img.height]);
              p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
              return p;
            });
          }
          return cargarFuentePdfLib(pg.fuenteIdx).then(function(srcDoc){
            return outDoc.copyPages(srcDoc, [pg.pageIdx]).then(function(copied){
              var p = copied[0];
              if(pg.rot){
                var cur = p.getRotation().angle || 0;
                p.setRotation(PDFLib.degrees((cur + pg.rot) % 360));
              }
              outDoc.addPage(p);
              return p;
            });
          });
        }).then(function(pdfPage){
          var ops = pg.ops || [];
          var sz = pdfPage.getSize();
          var opSeq = Promise.resolve();
          ops.forEach(function(op){
            opSeq = opSeq.then(function(){
              var x = (op.xPct / 100) * sz.width;
              var yTop = (op.yPct / 100) * sz.height;
              if(op.tipo === 'texto'){
                var fSize = Math.max(8, Math.min(72, Number(op.size) || 14));
                pdfPage.drawText(String(op.texto || ''), {
                  x: x, y: Math.max(4, sz.height - yTop - fSize),
                  size: fSize, font: fontBold, color: _hexARgb(op.color || '#08222F')
                });
              } else if(op.tipo === 'tapar' || op.tipo === 'resaltar'){
                var w = ((op.wPct || 25) / 100) * sz.width;
                var h = ((op.hPct || 6) / 100) * sz.height;
                pdfPage.drawRectangle({
                  x: x, y: Math.max(0, sz.height - yTop - h), width: w, height: h,
                  color: _hexARgb(op.tipo === 'tapar' ? '#FFFFFF' : '#FFC933'),
                  opacity: op.tipo === 'tapar' ? 1 : 0.38
                });
              } else if(op.tipo === 'imagen' && op.dataUrl){
                return fetch(op.dataUrl).then(function(r){ return r.arrayBuffer(); }).then(function(ab){
                  return /png/i.test(op.mime || op.dataUrl) ? outDoc.embedPng(ab) : outDoc.embedJpg(ab);
                }).then(function(img){
                  var iw = ((op.wPct || 25) / 100) * sz.width;
                  var ih = iw * (img.height / Math.max(1, img.width));
                  pdfPage.drawImage(img, { x: x, y: Math.max(0, sz.height - yTop - ih), width: iw, height: ih });
                });
              }
            });
          });
          return opSeq;
        });
      });
      return seq.then(function(){ return outDoc.save(); });
    });
  }

  function _descargarBlob(blob, nombre){
    var a = document.createElement('a');
    var u = URL.createObjectURL(blob);
    a.href = u;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(u); }, 4000);
  }

  function _nombreBase(){
    return String(ST.nombre || 'documento').replace(/\.pdf$/i, '').replace(/[^\w\-áéíóúÁÉÍÓÚñÑ ]+/g, '').trim() || 'documento';
  }

  function _paginasMarcadas(){
    return ST.paginas.filter(function(p){ return p.sel; });
  }

  function _dividirUnoPorUnoZip(){
    var sel = _paginasMarcadas();
    if(!sel.length){ _aviso('Marca al menos una hoja (o toca «Todas») para dividir.', 'mal'); return; }
    if(ST.enVuelo) return;
    ST.enVuelo = true;
    _aviso('Dividiendo ' + sel.length + ' hojas en archivos PDF individuales…', 'info');
    var zip = new window.JSZip();
    var base = _nombreBase();
    var seq = Promise.resolve();
    sel.forEach(function(pg, k){
      seq = seq.then(function(){
        var numStr = String(ST.paginas.indexOf(pg) + 1);
        while(numStr.length < 3) numStr = '0' + numStr;
        return _compilarPdfDeLista([pg]).then(function(bytes){
          zip.file(base + '_pag_' + numStr + '.pdf', bytes);
        });
      });
    });
    seq.then(function(){
      return zip.generateAsync({ type: 'blob' });
    }).then(function(blob){
      _descargarBlob(blob, base + '_dividido_' + sel.length + '_hojas.zip');
      _aviso('ZIP descargado con ' + sel.length + ' archivos PDF separados.', 'ok');
    }).catch(function(err){
      _aviso('Error al dividir PDF: ' + (err && err.message ? err.message : err), 'mal');
    }).then(function(){ ST.enVuelo = false; });
  }

  function _extraerHojas(modificarOriginal){
    var sel = _paginasMarcadas();
    if(!sel.length){ _aviso('Marca las hojas que deseas extraer.', 'mal'); return; }
    if(modificarOriginal && sel.length >= ST.paginas.length){
      _aviso('No puedes quitar todas las hojas del original; usa «Extraer sin modificar».', 'mal');
      return;
    }
    if(ST.enVuelo) return;
    ST.enVuelo = true;
    _aviso('Generando PDF con ' + sel.length + ' hojas extraídas…', 'info');
    _compilarPdfDeLista(sel).then(function(bytes){
      _descargarBlob(new Blob([bytes], { type: 'application/pdf' }), _nombreBase() + '_extraido_' + sel.length + 'p.pdf');
      if(modificarOriginal){
        _guardarSnapshot();
        ST.paginas = ST.paginas.filter(function(p){ return !p.sel; });
        _pintarGrid();
        _aviso('Hojas extraídas y quitadas del documento actual (puedes usar Deshacer).', 'ok');
      } else {
        _aviso('Hojas extraídas sin modificar el documento original.', 'ok');
      }
    }).catch(function(err){
      _aviso('No se pudo extraer: ' + (err && err.message ? err.message : err), 'mal');
    }).then(function(){ ST.enVuelo = false; });
  }

  function _exportarPdfAImagenes(){
    var sel = _paginasMarcadas();
    if(!sel.length) sel = ST.paginas.slice();
    if(!sel.length){ _aviso('No hay páginas cargadas.', 'mal'); return; }
    if(ST.enVuelo) return;
    ST.enVuelo = true;
    _aviso('Convirtiendo ' + sel.length + ' páginas a imágenes PNG…', 'info');
    var base = _nombreBase();
    if(sel.length === 1){
      _renderizarPaginaAltaRes(sel[0], 2).then(function(du){
        return fetch(du).then(function(r){ return r.blob(); });
      }).then(function(blob){
        _descargarBlob(blob, base + '_pag_' + (ST.paginas.indexOf(sel[0]) + 1) + '.png');
        _aviso('Imagen PNG descargada.', 'ok');
      }).catch(function(err){
        _aviso('Error al convertir a imagen: ' + err, 'mal');
      }).then(function(){ ST.enVuelo = false; });
      return;
    }
    var zip = new window.JSZip();
    var seq = Promise.resolve();
    sel.forEach(function(pg){
      seq = seq.then(function(){
        var numStr = String(ST.paginas.indexOf(pg) + 1);
        while(numStr.length < 3) numStr = '0' + numStr;
        return _renderizarPaginaAltaRes(pg, 1.8).then(function(du){
          zip.file(base + '_pag_' + numStr + '.png', du.split(',')[1], { base64: true });
        });
      });
    });
    seq.then(function(){ return zip.generateAsync({ type: 'blob' }); }).then(function(blob){
      _descargarBlob(blob, base + '_imagenes_' + sel.length + '.zip');
      _aviso('ZIP con ' + sel.length + ' imágenes PNG descargado.', 'ok');
    }).catch(function(err){
      _aviso('Error convirtiendo a imágenes: ' + err, 'mal');
    }).then(function(){ ST.enVuelo = false; });
  }

  function _copiarHojaComoImagen(idx){
    var pg = ST.paginas[idx];
    if(!pg) return;
    _aviso('Renderizando hoja ' + (idx + 1) + ' como imagen…', 'info');
    _renderizarPaginaAltaRes(pg, 2).then(function(du){
      return fetch(du).then(function(r){ return r.blob(); }).then(function(blob){
        if(navigator.clipboard && window.ClipboardItem){
          return navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]).then(function(){
            _aviso('Hoja ' + (idx + 1) + ' copiada al portapapeles como imagen PNG.', 'ok');
          });
        }
        _descargarBlob(blob, _nombreBase() + '_pag_' + (idx + 1) + '.png');
        _aviso('Imagen de la hoja ' + (idx + 1) + ' descargada.', 'ok');
      });
    }).catch(function(){
      _aviso('El navegador bloqueó el portapapeles; usa «PDF → Imágenes» para descargarla.', 'mal');
    });
  }

  function _abrirEditorPagina(idx){
    var pg = ST.paginas[idx];
    if(!pg) return;
    ST.editIdx = idx;
    var ov = document.getElementById('pdfe-ed-ov');
    if(!ov) return;
    ov.hidden = false;
    ov.innerHTML =
      '<div class="pdfe-ed-box">' +
        '<div class="pdfe-cab">' +
          '<b>✏️ Editando Página ' + (idx + 1) + '</b>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button type="button" class="pdfe-btn" data-ed="aplanar-img">🖼️ Convertir esta hoja en imagen dentro del PDF</button>' +
            '<button type="button" class="pdfe-btn pri" data-ed="cerrar-ed">✓ Listo</button>' +
          '</div>' +
        '</div>' +
        '<div class="pdfe-ed-main">' +
          '<div class="pdfe-ed-stage"><div class="pdfe-canvas-wrap" id="pdfe-ed-wrap"><canvas id="pdfe-ed-cv"></canvas></div></div>' +
          '<div class="pdfe-ed-side">' +
            '<b style="font-size:13px">Herramienta (haz clic sobre la hoja para colocar)</b>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
              '<button type="button" class="pdfe-btn' + (ST.herr === 'texto' ? ' pri' : '') + '" data-ed="h-texto">🔤 Texto</button>' +
              '<button type="button" class="pdfe-btn' + (ST.herr === 'tapar' ? ' pri' : '') + '" data-ed="h-tapar">⬜ Tapar</button>' +
              '<button type="button" class="pdfe-btn' + (ST.herr === 'resaltar' ? ' pri' : '') + '" data-ed="h-resaltar">🖍️ Resaltar</button>' +
              '<button type="button" class="pdfe-btn' + (ST.herr === 'imagen' ? ' pri' : '') + '" data-ed="h-imagen">🖼️ Firma / Img</button>' +
            '</div>' +
            '<div id="pdfe-ed-ctrl"></div>' +
            '<b style="font-size:12.5px;margin-top:6px">Elementos añadidos en esta hoja</b>' +
            '<div id="pdfe-ed-ops"></div>' +
            '<input type="file" id="pdfe-ed-imgfile" accept="image/png,image/jpeg" hidden>' +
          '</div>' +
        '</div>' +
      '</div>';

    _pintarControlesEditor();
    _dibujarEditorCanvas();
    ov.onclick = function(ev){
      var b = ev.target.closest('[data-ed]');
      if(!b) return;
      var a = b.getAttribute('data-ed');
      if(a === 'cerrar-ed'){ ov.hidden = true; _pintarGrid(); return; }
      if(a === 'h-texto'){ ST.herr = 'texto'; _abrirEditorPagina(ST.editIdx); return; }
      if(a === 'h-tapar'){ ST.herr = 'tapar'; _abrirEditorPagina(ST.editIdx); return; }
      if(a === 'h-resaltar'){ ST.herr = 'resaltar'; _abrirEditorPagina(ST.editIdx); return; }
      if(a === 'h-imagen'){ ST.herr = 'imagen'; _abrirEditorPagina(ST.editIdx); return; }
      if(a === 'subir-firma'){ var fi = document.getElementById('pdfe-ed-imgfile'); if(fi) fi.click(); return; }
      if(a === 'quitar-op'){
        var oi = parseInt(b.getAttribute('data-oi'), 10);
        _guardarSnapshot();
        ST.paginas[ST.editIdx].ops.splice(oi, 1);
        _dibujarEditorCanvas();
        _pintarListaOpsEditor();
        return;
      }
      if(a === 'aplanar-img'){
        _renderizarPaginaAltaRes(ST.paginas[ST.editIdx], 2).then(function(du){
          _guardarSnapshot();
          ST.paginas[ST.editIdx].aplanadaDataUrl = du;
          _dibujarEditorCanvas();
          _aviso('Hoja convertida como imagen dentro del PDF.', 'ok');
        });
      }
    };
    var fi2 = document.getElementById('pdfe-ed-imgfile');
    if(fi2){
      fi2.onchange = function(){
        var f = fi2.files && fi2.files[0]; if(!f) return;
        if(f.size > MAX_IMG_BYTES){ _aviso('La imagen supera 15 MB.', 'mal'); return; }
        _leerArchivoDataUrl(f).then(function(du){
          ST.imgPendiente = { dataUrl: du, mime: f.type || 'image/png' };
          _aviso('Imagen lista. Ahora haz clic sobre la hoja donde quieres pegarla.', 'ok');
        });
      };
    }
    var wrap = document.getElementById('pdfe-ed-wrap');
    if(wrap){
      wrap.onclick = function(ev){
        var cv = document.getElementById('pdfe-ed-cv');
        if(!cv) return;
        var rect = cv.getBoundingClientRect();
        var xPct = Math.max(0, Math.min(96, ((ev.clientX - rect.left) / rect.width) * 100));
        var yPct = Math.max(0, Math.min(96, ((ev.clientY - rect.top) / rect.height) * 100));
        var curPg = ST.paginas[ST.editIdx];
        if(!curPg) return;
        if(ST.herr === 'texto'){
          var tx = String((document.getElementById('pdfe-tx-val') || {}).value || '').trim();
          if(!tx){ _aviso('Escribe primero el texto en el panel derecho.', 'mal'); return; }
          var sz = parseInt((document.getElementById('pdfe-tx-sz') || {}).value, 10) || 14;
          var col = (document.getElementById('pdfe-tx-col') || {}).value || '#08222F';
          _guardarSnapshot();
          curPg.ops.push({ tipo: 'texto', texto: tx, size: sz, color: col, xPct: xPct, yPct: yPct });
        } else if(ST.herr === 'tapar' || ST.herr === 'resaltar'){
          var wp = parseInt((document.getElementById('pdfe-bx-w') || {}).value, 10) || 26;
          var hp = parseInt((document.getElementById('pdfe-bx-h') || {}).value, 10) || 5;
          _guardarSnapshot();
          curPg.ops.push({ tipo: ST.herr, wPct: wp, hPct: hp, xPct: xPct, yPct: yPct });
        } else if(ST.herr === 'imagen'){
          if(!ST.imgPendiente){ _aviso('Primero elige una imagen o firma PNG/JPG en el panel derecho.', 'mal'); return; }
          var iw = parseInt((document.getElementById('pdfe-im-w') || {}).value, 10) || 24;
          _guardarSnapshot();
          curPg.ops.push({ tipo: 'imagen', dataUrl: ST.imgPendiente.dataUrl, mime: ST.imgPendiente.mime, wPct: iw, xPct: xPct, yPct: yPct });
        }
        _dibujarEditorCanvas();
        _pintarListaOpsEditor();
      };
    }
  }

  function _pintarControlesEditor(){
    var c = document.getElementById('pdfe-ed-ctrl'); if(!c) return;
    if(ST.herr === 'texto'){
      c.innerHTML =
        '<label style="font-size:12px;font-weight:700">Texto a insertar</label>' +
        '<input type="text" id="pdfe-tx-val" class="pdfe-in" style="width:100%" placeholder="Ej: APROBADO SSOMA">' +
        '<div style="display:flex;gap:6px;margin-top:6px">' +
          '<input type="number" id="pdfe-tx-sz" class="pdfe-in" style="width:76px" value="14" min="8" max="60" title="Tamaño">' +
          '<input type="color" id="pdfe-tx-col" class="pdfe-in" style="width:52px;padding:2px" value="#08222F">' +
        '</div>';
    } else if(ST.herr === 'tapar' || ST.herr === 'resaltar'){
      c.innerHTML =
        '<div style="display:flex;gap:6px">' +
          '<div><label style="font-size:11px;font-weight:700">Ancho %</label><input type="number" id="pdfe-bx-w" class="pdfe-in" style="width:100%" value="26" min="4" max="100"></div>' +
          '<div><label style="font-size:11px;font-weight:700">Alto %</label><input type="number" id="pdfe-bx-h" class="pdfe-in" style="width:100%" value="5" min="2" max="100"></div>' +
        '</div>';
    } else {
      c.innerHTML =
        '<button type="button" class="pdfe-btn osc" style="width:100%" data-ed="subir-firma">📎 Elegir imagen / firma PNG</button>' +
        '<label style="font-size:11px;font-weight:700;display:block;margin-top:6px">Ancho en hoja (%)</label>' +
        '<input type="number" id="pdfe-im-w" class="pdfe-in" style="width:100%" value="24" min="5" max="95">';
    }
    _pintarListaOpsEditor();
  }

  function _pintarListaOpsEditor(){
    var box = document.getElementById('pdfe-ed-ops'); if(!box) return;
    var ops = (ST.paginas[ST.editIdx] && ST.paginas[ST.editIdx].ops) || [];
    if(!ops.length){ box.innerHTML = '<small style="color:#64748B">Ningún elemento agregado todavía.</small>'; return; }
    box.innerHTML = ops.map(function(o, i){
      var lbl = o.tipo === 'texto' ? ('🔤 ' + o.texto.slice(0, 22)) : (o.tipo === 'tapar' ? '⬜ Blanqueo' : (o.tipo === 'resaltar' ? '🖍️ Resaltado' : '🖼️ Imagen/Firma'));
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:#fff;border:1px solid #E2E8F0;border-radius:8px;margin-bottom:5px;font-size:12px">' +
        '<span>' + _esc(lbl) + '</span>' +
        '<button type="button" class="pdfe-mini" style="flex:0;color:#B91C1C" data-ed="quitar-op" data-oi="' + i + '">✕</button>' +
      '</div>';
    }).join('');
  }

  function _dibujarEditorCanvas(){
    var pg = ST.paginas[ST.editIdx];
    var cv = document.getElementById('pdfe-ed-cv');
    if(!pg || !cv) return;
    _renderizarPaginaAltaRes(pg, 1.4).then(function(du){
      var img = new Image();
      img.onload = function(){
        cv.width = img.width; cv.height = img.height;
        var ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);
        (pg.ops || []).forEach(function(op){
          var x = (op.xPct / 100) * cv.width;
          var y = (op.yPct / 100) * cv.height;
          if(op.tipo === 'texto'){
            ctx.fillStyle = op.color || '#08222F';
            ctx.font = 'bold ' + Math.round((op.size || 14) * 1.4) + 'px sans-serif';
            ctx.fillText(op.texto || '', x, y + Math.round((op.size || 14) * 1.4));
          } else if(op.tipo === 'tapar'){
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y, (op.wPct / 100) * cv.width, (op.hPct / 100) * cv.height);
            ctx.strokeStyle = '#94A3B8'; ctx.strokeRect(x, y, (op.wPct / 100) * cv.width, (op.hPct / 100) * cv.height);
          } else if(op.tipo === 'resaltar'){
            ctx.fillStyle = 'rgba(255, 201, 51, 0.38)';
            ctx.fillRect(x, y, (op.wPct / 100) * cv.width, (op.hPct / 100) * cv.height);
          } else if(op.tipo === 'imagen' && op.dataUrl){
            var im2 = new Image();
            im2.onload = function(){
              var iw = (op.wPct / 100) * cv.width;
              var ih = iw * (im2.height / Math.max(1, im2.width));
              ctx.drawImage(im2, x, y, iw, ih);
            };
            im2.src = op.dataUrl;
          }
        });
      };
      img.src = du;
    });
  }

  function _abrirModalImagenesAPdf(){
    var ov = document.getElementById('pdfe-img-ov');
    if(!ov) return;
    ST.imgsBuilder = [];
    ov.hidden = false;
    function pintar(){
      ov.innerHTML =
        '<div class="pdfe-ed-box" style="max-width:740px;height:auto;max-height:86vh">' +
          '<div class="pdfe-cab"><b>🖼️ Convertir Imágenes a PDF</b><button type="button" class="pdfe-btn pel" data-ib="cerrar">✕ Cerrar</button></div>' +
          '<div style="padding:16px;overflow:auto">' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
              '<button type="button" class="pdfe-btn osc" data-ib="agregar">➕ Seleccionar fotos (JPG/PNG)</button>' +
              '<select id="pdfe-ib-ori" class="pdfe-in"><option value="a4v">A4 Vertical</option><option value="a4h">A4 Horizontal</option><option value="auto">Ajustar a cada imagen</option></select>' +
              '<input type="text" id="pdfe-ib-nom" class="pdfe-in" style="flex:1;min-width:170px" placeholder="Nombre del PDF" value="imagenes_obra.pdf">' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px">' +
              (ST.imgsBuilder.length ? ST.imgsBuilder.map(function(it, i){
                return '<div style="border:1px solid #CBD5E1;border-radius:10px;padding:6px;background:#F8FAFC;text-align:center">' +
                  '<img src="' + it.dataUrl + '" style="width:100%;height:110px;object-fit:cover;border-radius:6px">' +
                  '<div style="font-size:11px;margin:4px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (i + 1) + '. ' + _esc(it.nombre) + '</div>' +
                  '<button type="button" class="pdfe-mini" style="color:#B91C1C" data-ib="quitar" data-i="' + i + '">Quitar</button>' +
                '</div>';
              }).join('') : '<p style="color:#64748B;grid-column:1/-1">Selecciona una o varias fotografías para generar el PDF.</p>') +
            '</div>' +
            '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">' +
              '<button type="button" class="pdfe-btn" data-ib="crear-abrir">Abrir en Estudio PDF</button>' +
              '<button type="button" class="pdfe-btn pri" data-ib="crear-descargar">⬇️ Generar y Descargar PDF</button>' +
            '</div>' +
            '<input type="file" id="pdfe-ib-files" accept="image/png,image/jpeg,image/webp" multiple hidden>' +
          '</div>' +
        '</div>';
      var fi = document.getElementById('pdfe-ib-files');
      if(fi){
        fi.onchange = function(){
          var files = Array.prototype.slice.call(fi.files || []);
          var seq = Promise.resolve();
          files.forEach(function(f){
            if(f.size > MAX_IMG_BYTES) return;
            seq = seq.then(function(){
              return _leerArchivoDataUrl(f).then(function(du){
                ST.imgsBuilder.push({ id: _uid(), file: f, dataUrl: du, nombre: f.name });
              });
            });
          });
          seq.then(pintar);
        };
      }
    }
    pintar();
    ov.onclick = function(ev){
      var b = ev.target.closest('[data-ib]'); if(!b) return;
      var a = b.getAttribute('data-ib');
      if(a === 'cerrar'){ ov.hidden = true; return; }
      if(a === 'agregar'){ var fi = document.getElementById('pdfe-ib-files'); if(fi) fi.click(); return; }
      if(a === 'quitar'){ ST.imgsBuilder.splice(parseInt(b.getAttribute('data-i'), 10), 1); pintar(); return; }
      if(a === 'crear-abrir' || a === 'crear-descargar'){
        if(!ST.imgsBuilder.length){ _aviso('Agrega al menos una imagen.', 'mal'); return; }
        var ori = (document.getElementById('pdfe-ib-ori') || {}).value || 'a4v';
        var nom = ((document.getElementById('pdfe-ib-nom') || {}).value || 'imagenes_obra.pdf').trim();
        if(!/\.pdf$/i.test(nom)) nom += '.pdf';
        _construirPdfDesdeImagenes(ST.imgsBuilder.map(function(x){ return x.file; }), ori).then(function(bytes){
          ov.hidden = true;
          if(a === 'crear-descargar'){
            _descargarBlob(new Blob([bytes], { type: 'application/pdf' }), nom);
            _aviso('PDF generado desde ' + ST.imgsBuilder.length + ' imágenes.', 'ok');
          } else {
            _cargarPdfBytes(bytes, nom);
          }
        }).catch(function(err){ _aviso('Error creando PDF: ' + err, 'mal'); });
      }
    };
  }

  function _construirPdfDesdeImagenes(files, ori){
    ori = ori || 'a4v';
    return _asegurarLibs().then(function(){
      return window.PDFLib.PDFDocument.create().then(function(doc){
        var seq = Promise.resolve();
        files.forEach(function(f){
          seq = seq.then(function(){
            return _leerArchivoDataUrl(f).then(function(du){
              return new Promise(function(res, rej){
                var im = new Image();
                im.onload = function(){
                  var cv = document.createElement('canvas');
                  cv.width = im.naturalWidth; cv.height = im.naturalHeight;
                  cv.getContext('2d').drawImage(im, 0, 0);
                  var jpgUrl = cv.toDataURL('image/jpeg', 0.88);
                  fetch(jpgUrl).then(function(r){ return r.arrayBuffer(); }).then(function(ab){
                    return doc.embedJpg(ab);
                  }).then(function(eImg){
                    var pw = 595.28, ph = 841.89;
                    if(ori === 'a4h'){ pw = 841.89; ph = 595.28; }
                    else if(ori === 'auto'){ pw = eImg.width; ph = eImg.height; }
                    var pg = doc.addPage([pw, ph]);
                    var m = ori === 'auto' ? 0 : 24;
                    var sc = Math.min((pw - m * 2) / eImg.width, (ph - m * 2) / eImg.height);
                    var dw = eImg.width * sc, dh = eImg.height * sc;
                    pg.drawImage(eImg, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
                    res();
                  }, rej);
                };
                im.onerror = rej;
                im.src = du;
              });
            });
          });
        });
        return seq.then(function(){ return doc.save(); });
      });
    });
  }

  function _guardarEnDocumentosObra(){
    if(!ST.paginas.length){ _aviso('No hay páginas para guardar.', 'mal'); return; }
    var emp = _empActiva();
    if(!emp || !emp.id){ _aviso('Selecciona primero una obra activa.', 'mal'); return; }
    if(typeof subirFoto !== 'function' || typeof sbPost !== 'function'){
      _aviso('Conexión de Documentos no disponible en esta pantalla. Descarga el PDF y súbelo manualmente.', 'mal');
      return;
    }
    var nom = prompt('Nombre con el que se guardará en Documentos:', _nombreBase());
    if(!nom) return;
    var hoja = prompt('Carpeta destino en Documentos:', ST.hojaDestino || 'General') || 'General';
    if(ST.enVuelo) return;
    ST.enVuelo = true;
    _aviso('Compilando y subiendo PDF a Documentos de Obra…', 'info');
    _compilarPdfDeLista(ST.paginas).then(function(bytes){
      var f = new File([bytes], nom.replace(/\.pdf$/i, '') + '.pdf', { type: 'application/pdf' });
      return subirFoto('docs', f).then(function(url){
        return sbPost('sst_doc', { empresa: emp.id, hoja: hoja.trim(), nombre: nom.trim(), url: url, nota: 'Editado en Estudio PDF (' + ST.paginas.length + ' págs.)' });
      });
    }).then(function(){
      _aviso('Guardado en la carpeta «' + hoja + '» de Documentos.', 'ok');
      if(typeof cargarDocs === 'function') try{ cargarDocs(); }catch(_c){}
    }).catch(function(err){
      _aviso('No se pudo guardar en Documentos: ' + (err && err.message ? err.message : err), 'mal');
    }).then(function(){ ST.enVuelo = false; });
  }

  function _enlazarEventosModal(dv){
    var fb = dv.querySelector('#pdfe-file-base');
    var fi = dv.querySelector('#pdfe-file-ins');
    if(fb){
      fb.onchange = function(){
        var f = fb.files && fb.files[0]; fb.value = ''; if(!f) return;
        _leerArchivoBytes(f).then(function(b){ _cargarPdfBytes(b, f.name); });
      };
    }
    if(fi){
      fi.onchange = function(){
        var f = fi.files && fi.files[0]; fi.value = ''; if(!f) return;
        var num = Math.max(1, parseInt((document.getElementById('pdfe-ins-pag') || {}).value, 10) || 1);
        var donde = (document.getElementById('pdfe-ins-donde') || {}).value || 'despues';
        var pos = (donde === 'antes') ? (num - 1) : num;
        _leerArchivoBytes(f).then(function(b){ _cargarPdfBytes(b, f.name, pos); });
      };
    }

    dv.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-pe]');
      if(!b) return;
      var a = b.getAttribute('data-pe');
      var idx = parseInt(b.getAttribute('data-idx'), 10);

      if(a === 'cerrar'){ dv.hidden = true; ST.abierto = false; return; }
      if(a === 'abrir-local'){ if(fb) fb.click(); return; }
      if(a === 'insertar-pdf'){ if(fi) fi.click(); return; }
      if(a === 'abrir-imgs'){ _abrirModalImagenesAPdf(); return; }
      if(a === 'deshacer'){ _deshacer(); return; }
      if(a === 'sel-todas'){ ST.paginas.forEach(function(p){ p.sel = true; }); _pintarGrid(); return; }
      if(a === 'sel-ninguna'){ ST.paginas.forEach(function(p){ p.sel = false; }); _pintarGrid(); return; }
      if(a === 'sel-invertir'){ ST.paginas.forEach(function(p){ p.sel = !p.sel; }); _pintarGrid(); return; }
      if(a === 'sel-rango'){
        var mapa = _parsearRangos((document.getElementById('pdfe-rangos') || {}).value, ST.paginas.length);
        ST.paginas.forEach(function(p, i){ p.sel = !!mapa[i]; });
        _pintarGrid(); return;
      }
      if(a === 'toggle-sel' && !isNaN(idx) && ST.paginas[idx]){
        ST.paginas[idx].sel = !ST.paginas[idx].sel;
        var card = b.closest('.pdfe-card');
        if(card) card.classList.toggle('sel', ST.paginas[idx].sel);
        _actualizarConteo(); return;
      }
      if(a === 'dividir-zip'){ _dividirUnoPorUnoZip(); return; }
      if(a === 'extraer-sin'){ _extraerHojas(false); return; }
      if(a === 'extraer-mod'){ _extraerHojas(true); return; }
      if(a === 'pdf-a-imgs'){ _exportarPdfAImagenes(); return; }
      if(a === 'guardar-doc'){ _guardarEnDocumentosObra(); return; }
      if(a === 'descargar-todo'){
        if(!ST.paginas.length){ _aviso('No hay páginas cargadas.', 'mal'); return; }
        _aviso('Compilando PDF completo…', 'info');
        _compilarPdfDeLista(ST.paginas).then(function(bytes){
          _descargarBlob(new Blob([bytes], { type: 'application/pdf' }), _nombreBase() + '_editado.pdf');
          _aviso('PDF completo descargado.', 'ok');
        }).catch(function(err){ _aviso('Error compilando: ' + err, 'mal'); });
        return;
      }
      if(a === 'borrar-sel'){
        var sel = _paginasMarcadas();
        if(!sel.length){ _aviso('Marca las hojas que quieres quitar.', 'mal'); return; }
        _guardarSnapshot();
        ST.paginas = ST.paginas.filter(function(p){ return !p.sel; });
        _pintarGrid(); _aviso('Hojas marcadas quitadas.', 'ok'); return;
      }
      if(a === 'rotar' && ST.paginas[idx]){
        _guardarSnapshot(); ST.paginas[idx].rot = (ST.paginas[idx].rot + 90) % 360; _pintarGrid(); return;
      }
      if(a === 'duplicar' && ST.paginas[idx]){
        _guardarSnapshot();
        var cp = JSON.parse(JSON.stringify(ST.paginas[idx])); cp.uid = _uid(); cp.sel = false;
        ST.paginas.splice(idx + 1, 0, cp); _pintarGrid(); return;
      }
      if(a === 'mover-izq' && idx > 0){
        _guardarSnapshot();
        var t1 = ST.paginas[idx]; ST.paginas[idx] = ST.paginas[idx - 1]; ST.paginas[idx - 1] = t1; _pintarGrid(); return;
      }
      if(a === 'mover-der' && idx < ST.paginas.length - 1){
        _guardarSnapshot();
        var t2 = ST.paginas[idx]; ST.paginas[idx] = ST.paginas[idx + 1]; ST.paginas[idx + 1] = t2; _pintarGrid(); return;
      }
      if(a === 'borrar-uno' && ST.paginas[idx]){
        _guardarSnapshot(); ST.paginas.splice(idx, 1); _pintarGrid(); return;
      }
      if(a === 'editar-pag' && ST.paginas[idx]){ _abrirEditorPagina(idx); return; }
      if(a === 'copiar-img' && ST.paginas[idx]){ _copiarHojaComoImagen(idx); return; }
    });
  }

  function abrirEstudioPdf(opts){
    opts = opts || {};
    _inyectarEstilos();
    var dv = _crearModalDOM();
    dv.hidden = false;
    ST.abierto = true;
    ST.hojaDestino = opts.hoja || 'General';
    if(opts.url){
      if(!_urlSegura(opts.url)){ _aviso('URL de documento bloqueada por seguridad.', 'mal'); return; }
      ST.fuentes = []; ST.paginas = []; _pintarGrid();
      _aviso('Descargando documento para abrir en Estudio PDF…', 'info');
      _fetchRetry(opts.url, {}, 3).then(function(r){ return r.arrayBuffer(); }).then(function(ab){
        return _cargarPdfBytes(new Uint8Array(ab), opts.nombre || 'documento.pdf');
      }).catch(function(err){
        _aviso('No se pudo descargar el PDF del servidor: ' + (err && err.message ? err.message : err), 'mal');
      });
    } else if(opts.file){
      _leerArchivoBytes(opts.file).then(function(b){ _cargarPdfBytes(b, opts.file.name); });
    } else {
      _pintarGrid();
    }
  }

  window.OBRASST_PDF_ESTUDIO = {
    abrir: abrirEstudioPdf,
    imagenesAPdfBytes: _construirPdfDesdeImagenes
  };
  window.abrirEstudioPdf = abrirEstudioPdf;
})();
