/* ═══════════════════════════════════════════════════════════════════════════
   OBRASST · PORTAL WEB · Parte 3: Mover Carpetas Completas y Varios Archivos entre Sectores
   - Selección múltiple de archivos con barra fija de acción
   - Mover carpeta completa (con subcarpetas y documentos) hacia otro sector o carpeta
   - Selector Universal de Destino con todos los sectores visibles, buscador y «+ Nueva subcarpeta»
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var MS = {
    empId: null,
    sectores: [],
    carpetas: [],
    selDocs: {},     /* { docId: { id, nombre, hoja } } */
    enVuelo: false
  };

  function _esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function _empId(){
    if(typeof empActiva === 'function'){ var e = empActiva(); if(e && e.id) return e.id; }
    if(typeof EMP_ID !== 'undefined' && EMP_ID) return EMP_ID;
    try{
      var raw = localStorage.getItem('sst_emp_activa') || localStorage.getItem('LS_EMP');
      if(raw){ var j = JSON.parse(raw); if(j && j.id) return j.id; }
    }catch(_e){}
    return null;
  }

  function _aviso(msg){
    if(typeof tostada === 'function'){ tostada(msg); return; }
    alert(msg);
  }

  function _ico(nom){
    if(typeof i3dImg === 'function') return i3dImg(nom || 'file_folder');
    return '📁';
  }

  function _inyectarEstilos(){
    if(document.getElementById('ms-sec-css')) return;
    var st = document.createElement('style');
    st.id = 'ms-sec-css';
    st.textContent =
      '#ms-bar,#ms-bar *,#ms-ov,#ms-ov *{box-sizing:border-box;font-family:var(--letra,"Plus Jakarta Sans",sans-serif)!important}' +
      '#ms-bar{position:sticky;bottom:14px;z-index:9900;margin:12px auto 0;max-width:760px;background:#0B2A3A;color:#fff;padding:11px 16px;border-radius:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;box-shadow:0 12px 32px rgba(8,34,47,.32)}' +
      '#ms-bar[hidden],#ms-ov[hidden]{display:none!important}' +
      '.ms-btn{border:1px solid rgba(11,42,58,.18);background:#fff;color:#08222F;padding:8px 13px;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}' +
      '.ms-btn.pri{background:linear-gradient(135deg,#FFC933,#F5B700);border-color:#E0A800;color:#08222F}' +
      '.ms-btn.sec-osc{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.22);color:#fff}' +
      '#ms-ov{position:fixed;inset:0;z-index:9970;background:rgba(8,34,47,.74);display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(4px)}' +
      '.ms-modal{background:#fff;color:#08222F;width:min(600px,96vw);max-height:88vh;display:flex;flex-direction:column;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35)}' +
      '.ms-cab{padding:15px 18px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;gap:10px}' +
      '.ms-body{padding:14px 18px;overflow:auto;flex:1}' +
      '.ms-foot{padding:12px 18px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}' +
      '.ms-in{width:100%;padding:9px 12px;border:1.5px solid #CBD5E1;border-radius:10px;font-size:13.5px;background:#F8FAFC;color:#08222F;margin-bottom:10px}' +
      '.ms-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px}' +
      '.ms-chip{border:1px solid #CBD5E1;background:#fff;color:#334155;padding:6px 11px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}' +
      '.ms-chip.on{background:#0B2A3A;border-color:#0B2A3A;color:#fff}' +
      '.ms-crumbs{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px;font-size:12px;color:#475569}' +
      '.ms-crumb{border:none;background:#F1F5F9;color:#08222F;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer}' +
      '.ms-crumb.on{background:linear-gradient(135deg,#FFC933,#F5B700)}' +
      '.ms-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid #E2E8F0;background:#F8FAFC;margin-bottom:7px}' +
      '.ms-item.bloq{opacity:.48;pointer-events:none}' +
      '.ms-sq{width:30px;height:30px;border-radius:30%;background:#fff;border:1px solid rgba(11,42,58,.08);box-shadow:inset 0 2px 5px rgba(0,0,0,.04),0 2px 6px rgba(11,42,58,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
      '.ms-sq img{width:19px;height:19px;object-fit:contain}' +
      '.ms-tag-sec{display:inline-block;padding:2px 7px;border-radius:6px;background:#E0F2FE;color:#0369A1;font-size:10.5px;font-weight:800;margin-left:6px}';
    document.head.appendChild(st);
  }

  function _cargarArbol(empId){
    empId = empId || _empId();
    MS.empId = empId;
    if(!empId || typeof sbRpc !== 'function') return Promise.resolve();
    return sbRpc('sst_carpetas_sectores_listar', { p_emp: empId }).then(function(r){
      if(r && r.ok){
        MS.sectores = Array.isArray(r.sectores) ? r.sectores : [];
        MS.carpetas = Array.isArray(r.carpetas) ? r.carpetas : [];
      }
    }).catch(function(){});
  }

  function _porId(id){
    if(!id) return null;
    for(var i = 0; i < MS.carpetas.length; i++){
      if(String(MS.carpetas[i].id) === String(id)) return MS.carpetas[i];
    }
    return null;
  }

  function _descendientesMap(carpId){
    var map = {};
    if(!carpId) return map;
    map[String(carpId)] = true;
    var cambio = true;
    while(cambio){
      cambio = false;
      for(var i = 0; i < MS.carpetas.length; i++){
        var c = MS.carpetas[i];
        if(c.padre_id && map[String(c.padre_id)] && !map[String(c.id)]){
          map[String(c.id)] = true;
          cambio = true;
        }
      }
    }
    return map;
  }

  function _migas(id){
    var out = [], cur = _porId(id), g = 0;
    while(cur && g < 12){
      out.unshift(cur);
      cur = cur.padre_id ? _porId(cur.padre_id) : null;
      g++;
    }
    return out;
  }

  /* ── 1 · SELECCIÓN MÚLTIPLE DE ARCHIVOS + BARRA FIJA DE ACCIÓN ── */
  function _cantidadSel(){
    return Object.keys(MS.selDocs).length;
  }

  function _actualizarBarra(onRecargar){
    _inyectarEstilos();
    var bar = document.getElementById('ms-bar');
    if(!bar){
      bar = document.createElement('div');
      bar.id = 'ms-bar';
      document.body.appendChild(bar);
    }
    var n = _cantidadSel();
    if(n === 0){ bar.hidden = true; return; }
    bar.hidden = false;
    bar.innerHTML =
      '<div style="font-size:13.5px;font-weight:800">✓ ' + n + (n === 1 ? ' archivo seleccionado' : ' archivos seleccionados') + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="ms-btn pri" data-msb="mover">📂 Mover a…</button>' +
        '<button type="button" class="ms-btn sec-osc" data-msb="cancelar">✕ Cancelar</button>' +
      '</div>';
    bar.onclick = function(ev){
      var b = ev.target.closest('[data-msb]'); if(!b) return;
      var a = b.getAttribute('data-msb');
      if(a === 'cancelar'){ limpiarSeleccion(); return; }
      if(a === 'mover'){
        var lista = Object.keys(MS.selDocs).map(function(k){ return MS.selDocs[k]; });
        abrirMoverLote(lista, function(){
          limpiarSeleccion();
          if(typeof onRecargar === 'function') onRecargar();
        });
      }
    };
  }

  function alternarArchivo(docId, nombre, hoja, marcado, onRecargar){
    var k = String(docId);
    if(marcado) MS.selDocs[k] = { id: k, nombre: nombre || 'Documento', hoja: hoja || '' };
    else delete MS.selDocs[k];
    _actualizarBarra(onRecargar);
  }

  function seleccionarTodosVisibles(docsArray, onRecargar){
    (docsArray || []).forEach(function(d){
      if(d && d.id != null) MS.selDocs[String(d.id)] = { id: String(d.id), nombre: d.nombre || 'Documento', hoja: d.hoja || '' };
    });
    var checks = document.querySelectorAll('input[data-ms-doc-chk]');
    Array.prototype.forEach.call(checks, function(cb){ cb.checked = true; });
    _actualizarBarra(onRecargar);
  }

  function limpiarSeleccion(){
    MS.selDocs = {};
    var checks = document.querySelectorAll('input[data-ms-doc-chk]');
    Array.prototype.forEach.call(checks, function(cb){ cb.checked = false; });
    var bar = document.getElementById('ms-bar');
    if(bar) bar.hidden = true;
  }

  /* ── 2 · SELECTOR UNIVERSAL DE DESTINO (TODOS LOS SECTORES + BUSCADOR + NUEVA SUBCARPETA) ── */
  function _abrirModalDestino(opts){
    _inyectarEstilos();
    var empId = _empId();
    if(!empId){ _aviso('Selecciona primero una obra activa.'); return; }
    var ov = document.getElementById('ms-ov');
    if(!ov){
      ov = document.createElement('div');
      ov.id = 'ms-ov';
      document.body.appendChild(ov);
    }
    ov.hidden = false;

    var modo = opts.modo; /* 'lote' | 'carpeta' */
    var sectorSel = 'TODOS';
    var curPadreId = null;
    var busqueda = '';
    var bloqMap = {};

    function pintar(){
      if(modo === 'carpeta' && opts.carpeta){
        bloqMap = _descendientesMap(opts.carpeta.id);
      } else {
        bloqMap = {};
      }
      var curObj = _porId(curPadreId);
      var migas = _migas(curPadreId);
      var q = String(busqueda || '').toLowerCase().trim();

      var visibles = MS.carpetas.filter(function(c){
        if(q){
          var okQ = String(c.nombre || '').toLowerCase().indexOf(q) >= 0 ||
                    String(c.ruta || '').toLowerCase().indexOf(q) >= 0 ||
                    String(c.sector || '').toLowerCase().indexOf(q) >= 0;
          if(!okQ) return false;
          return sectorSel === 'TODOS' || c.sector === sectorSel;
        }
        if(curPadreId){
          return String(c.padre_id || '') === String(curPadreId);
        }
        if(c.padre_id) return false;
        return sectorSel === 'TODOS' || c.sector === sectorSel;
      });

      var titulo = modo === 'carpeta'
        ? ('📂 Mover carpeta completa: «' + _esc(opts.carpeta.nombre) + '»')
        : ('📂 Mover ' + opts.docs.length + (opts.docs.length === 1 ? ' archivo' : ' archivos'));

      var chipsHtml = '<button type="button" class="ms-chip' + (sectorSel === 'TODOS' ? ' on' : '') + '" data-msm="sec" data-s="TODOS">Todos los sectores</button>' +
        MS.sectores.map(function(s){
          return '<button type="button" class="ms-chip' + (sectorSel === s ? ' on' : '') + '" data-msm="sec" data-s="' + _esc(s) + '">' + _esc(s) + '</button>';
        }).join('');

      var h =
        '<div class="ms-modal">' +
          '<div class="ms-cab">' +
            '<b style="font-size:15.5px">' + titulo + '</b>' +
            '<button type="button" class="ms-btn" data-msm="cerrar">✕</button>' +
          '</div>' +
          '<div class="ms-body">' +
            '<input type="search" id="ms-bus-in" class="ms-in" placeholder="🔍 Buscar carpeta en cualquier sector (ej. Medio Ambiente, Informe, Noviembre)…" value="' + _esc(busqueda) + '">' +
            '<div class="ms-chips">' + chipsHtml + '</div>' +
            '<div class="ms-crumbs">' +
              '<button type="button" class="ms-crumb' + (!curPadreId ? ' on' : '') + '" data-msm="ir" data-id="">🏠 Raíz' + (sectorSel !== 'TODOS' ? (' · ' + _esc(sectorSel)) : '') + '</button>' +
              migas.map(function(m, idx){
                return '<span>›</span><button type="button" class="ms-crumb' + (idx === migas.length - 1 ? ' on' : '') + '" data-msm="ir" data-id="' + _esc(m.id) + '">' + _esc(m.nombre) + '</button>';
              }).join('') +
            '</div>';

      if(visibles.length){
        visibles.forEach(function(c){
          var esBloq = !!bloqMap[String(c.id)];
          h += '<div class="ms-item' + (esBloq ? ' bloq' : '') + '">' +
            '<div style="display:flex;align-items:center;gap:10px;flex:1;cursor:pointer" data-msm="ir" data-id="' + _esc(c.id) + '">' +
              '<span class="ms-sq">' + _ico(c.icono) + '</span>' +
              '<div><b style="font-size:13.5px">' + _esc(c.nombre) + '</b><span class="ms-tag-sec">' + _esc(c.sector) + '</span>' +
              '<div style="font-size:11.5px;color:#64748B">' + _esc(c.ruta) + ' (' + (c.total_docs || 0) + ' archivos)</div></div>' +
            '</div>' +
            (esBloq
              ? '<small style="color:#B91C1C;font-weight:700">Origen</small>'
              : '<button type="button" class="ms-btn pri" data-msm="elegir" data-id="' + _esc(c.id) + '">Mover aquí</button>') +
          '</div>';
        });
      } else {
        h += '<p style="font-size:13px;color:#64748B;padding:16px 4px">No hay subcarpetas en esta vista. Puedes guardar aquí o crear una subcarpeta nueva abajo.</p>';
      }

      var puedeMoverRaizSector = (modo === 'carpeta' && !curObj && sectorSel !== 'TODOS');
      h += '</div>' +
          '<div class="ms-foot">' +
            '<button type="button" class="ms-btn" data-msm="nueva">+ Nueva subcarpeta aquí</button>' +
            (curObj && !bloqMap[String(curObj.id)]
              ? '<button type="button" class="ms-btn pri" data-msm="elegir" data-id="' + _esc(curObj.id) + '">✓ Mover a «' + _esc(curObj.nombre) + '»</button>'
              : (puedeMoverRaizSector
                ? '<button type="button" class="ms-btn pri" data-msm="elegir-raiz-sec">✓ Mover a raíz del sector «' + _esc(sectorSel) + '»</button>'
                : '<small style="color:#64748B">Elige un sector o carpeta destino</small>')) +
          '</div>' +
        '</div>';

      ov.innerHTML = h;
      var bi = document.getElementById('ms-bus-in');
      if(bi){
        bi.oninput = function(){
          busqueda = bi.value;
          pintar();
          var bi2 = document.getElementById('ms-bus-in');
          if(bi2){ bi2.focus(); try{ bi2.setSelectionRange(bi2.value.length, bi2.value.length); }catch(_s){} }
        };
      }
    }

    function ejecutarMovimiento(destCarpId, destSector){
      if(MS.enVuelo) return;
      MS.enVuelo = true;
      var prom;
      if(modo === 'carpeta'){
        prom = sbRpc('sst_carpeta_mover', {
          p_emp: empId,
          p_carpeta_id: opts.carpeta.id,
          p_nuevo_padre_id: destCarpId || null,
          p_nuevo_sector: destSector || null
        });
      } else {
        var ids = opts.docs.map(function(d){ return String(d.id); });
        var destObj = _porId(destCarpId);
        prom = sbRpc('sst_docs_mover_lote', {
          p_emp: empId,
          p_doc_ids: ids,
          p_carpeta_id: destCarpId || null,
          p_sector: destObj ? destObj.sector : (destSector || 'SST'),
          p_nueva_hoja: destObj ? destObj.ruta : 'General'
        });
      }

      prom.then(function(r){
        MS.enVuelo = false;
        if(!r || !r.ok){
          var mot = (r && r.motivo) || 'error';
          _aviso(mot === 'ciclo_carpeta'
            ? 'No puedes mover una carpeta dentro de sí misma ni dentro de sus subcarpetas.'
            : (mot === 'ya_existe_destino' ? 'Ya existe una carpeta con ese mismo nombre en el destino.' : 'No se pudo completar el movimiento.'));
          return;
        }
        ov.hidden = true;
        _aviso(modo === 'carpeta'
          ? ('Carpeta movida a «' + r.ruta + '» (' + (r.docs_actualizados || 0) + ' archivos sincronizados).')
          : ((r.movidos || 0) + ' archivos movidos a «' + r.hoja + '».'));
        _cargarArbol(empId);
        if(typeof cargarDocs === 'function') try{ cargarDocs(); }catch(_c){}
        if(typeof opts.onListo === 'function') opts.onListo(r);
      }).catch(function(err){
        MS.enVuelo = false;
        _aviso('Error de red al mover: ' + (err && err.message ? err.message : err));
      });
    }

    ov.onclick = function(ev){
      var b = ev.target.closest('[data-msm]'); if(!b) return;
      var a = b.getAttribute('data-msm');
      if(a === 'cerrar'){ ov.hidden = true; return; }
      if(a === 'sec'){ sectorSel = b.getAttribute('data-s') || 'TODOS'; curPadreId = null; pintar(); return; }
      if(a === 'ir'){ curPadreId = b.getAttribute('data-id') || null; busqueda = ''; pintar(); return; }
      if(a === 'nueva'){
        var curO = _porId(curPadreId);
        var secCrear = curO ? curO.sector : (sectorSel === 'TODOS' ? 'SST' : sectorSel);
        var nom = prompt(curO ? ('Nueva subcarpeta dentro de «' + curO.ruta + '»: ') : ('Nueva carpeta en sector «' + secCrear + '»: '));
        if(!nom || !nom.trim()) return;
        sbRpc('sst_carpeta_crear_sector', {
          p_emp: empId, p_nombre: nom.trim(), p_padre_id: curPadreId || null, p_sector: secCrear
        }).then(function(r){
          if(r && r.ok && r.carpeta){
            _aviso('Carpeta creada: ' + r.carpeta.ruta);
            _cargarArbol(empId).then(function(){ curPadreId = r.carpeta.id; busqueda = ''; pintar(); });
          } else {
            _aviso('No se pudo crear la carpeta.');
          }
        });
        return;
      }
      if(a === 'elegir'){
        var cid = b.getAttribute('data-id');
        var dest = _porId(cid);
        if(!dest) return;
        ejecutarMovimiento(dest.id, dest.sector);
        return;
      }
      if(a === 'elegir-raiz-sec'){
        ejecutarMovimiento(null, sectorSel);
      }
    };

    ov.innerHTML = '<div class="ms-modal"><div class="ms-body">Cargando sectores y carpetas…</div></div>';
    _cargarArbol(empId).then(pintar);
  }

  function abrirMoverLote(docsArray, onListo){
    if(!docsArray || !docsArray.length){ _aviso('Selecciona al menos un archivo.'); return; }
    _abrirModalDestino({ modo: 'lote', docs: docsArray, onListo: onListo });
  }

  function abrirMoverCarpeta(carpetaObj, onListo){
    if(!carpetaObj || !carpetaObj.id){ _aviso('Carpeta no válida.'); return; }
    _abrirModalDestino({ modo: 'carpeta', carpeta: carpetaObj, onListo: onListo });
  }

  window.OBRASST_MOVER_SECTORES = {
    cargarArbol: _cargarArbol,
    alternarArchivo: alternarArchivo,
    seleccionarTodosVisibles: seleccionarTodosVisibles,
    limpiarSeleccion: limpiarSeleccion,
    abrirMoverLote: abrirMoverLote,
    abrirMoverCarpeta: abrirMoverCarpeta
  };
})();
