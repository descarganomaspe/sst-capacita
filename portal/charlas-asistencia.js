/* ═══════════════════════════════════════════════════════════════════════════
   OBRASST · PORTAL WEB · Registros de Asistencia por Frente en Programa de Charlas
   - Nomenclatura estricta: YYYY-MM-DD - [Tipo de documento] - [Frente]
   - Auto-archivo automático en Documentos › Carpeta «Registros de asistencia»
   - Si el usuario sube fotos del formato en papel, las convierte a PDF A4 antes de subir
   - Mapeo visual sincronizado por tema de charla y frente de trabajo
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var CARPETA_ASISTENCIA = 'Registros de asistencia';
  var TIPOS_ACTIVIDAD = [
    'Reunión de inicio de jornada',
    'Inducción Hombre Nuevo',
    'Inducción de proveedor / visitas',
    'Capacitaciones específicas programadas',
    'Capacitaciones específicas no programadas',
    'Sensibilización / Retroalimentación',
    'Talleres',
    'Entrenamiento',
    'Paradas de seguridad',
    'Reunión SST / Comité Técnico SST',
    'Reunión de Seguridad Vial',
    'Difusión',
    'Pausas activas y dinámicas'
  ];

  var CA = {
    frentes: [],
    docs: [],
    enVuelo: false
  };

  function _esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function _hoyLima(){
    try{
      var d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }catch(_e){
      return new Date().toISOString().slice(0, 10);
    }
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

  function _limpiarSegmento(s){
    return String(s || '').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70);
  }

  function _cargarFrentesYRegistros(empId){
    var pFrentes = (typeof sbRpc === 'function')
      ? sbRpc('sst_portal_frentes_listar', { p_emp: empId }).then(function(j){
          return (j && j.ok && Array.isArray(j.frentes)) ? j.frentes : [];
        }).catch(function(){ return []; })
      : Promise.resolve([]);

    var pDocs = (typeof sbGet === 'function')
      ? sbGet('sst_doc?empresa=eq.' + encodeURIComponent(empId) + '&hoja=eq.' + encodeURIComponent(CARPETA_ASISTENCIA) + '&order=nombre.desc&limit=300')
          .catch(function(){ return []; })
      : Promise.resolve([]);

    return Promise.all([pFrentes, pDocs]).then(function(res){
      CA.frentes = res[0] || [];
      CA.docs = Array.isArray(res[1]) ? res[1] : [];
      return CA;
    });
  }

  function _parsearNota(nota){
    var s = String(nota || '');
    var out = { tema: '', frente: '', tipo: '', fecha: '' };
    var m = /\[ASISTENCIA\|([^\]]+)\]/.exec(s);
    if(!m) return out;
    m[1].split('|').forEach(function(par){
      var i = par.indexOf('=');
      if(i > 0) out[par.slice(0, i)] = par.slice(i + 1);
    });
    return out;
  }

  function _nombreUnico(fecha, tipo, frente){
    var base = _limpiarSegmento(fecha) + ' - ' + _limpiarSegmento(tipo) + ' - ' + _limpiarSegmento(frente);
    var existentes = {};
    (CA.docs || []).forEach(function(d){ existentes[String(d.nombre || '').toLowerCase()] = true; });
    if(!existentes[base.toLowerCase()]) return base;
    var n = 2;
    while(existentes[(base + ' (' + n + ')').toLowerCase()] && n < 99) n++;
    return base + ' (' + n + ')';
  }

  function _inyectarEstilos(){
    if(document.getElementById('ca-css')) return;
    var st = document.createElement('style');
    st.id = 'ca-css';
    st.textContent =
      '#ca-modal,#ca-modal *{box-sizing:border-box;font-family:var(--letra,"Plus Jakarta Sans",sans-serif)!important}' +
      '#ca-modal{position:fixed;inset:0;z-index:9940;background:rgba(8,34,47,.68);display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(3px)}' +
      '#ca-modal[hidden],#ca-otro-wrap[hidden]{display:none!important}' +
      '.ca-box{background:#fff;color:#08222F;width:min(540px,96vw);max-height:90vh;overflow:auto;border-radius:18px;padding:18px 20px;box-shadow:0 20px 52px rgba(0,0,0,.28)}' +
      '.ca-lab{display:block;font-size:12px;font-weight:800;color:#334155;margin:10px 0 4px}' +
      '.ca-in{width:100%;padding:9px 11px;border:1px solid #CBD5E1;border-radius:10px;font-size:13.5px;background:#fff;color:#08222F}' +
      '.ca-prev{background:#F0F9FF;border:1px solid #BAE6FD;color:#075985;padding:9px 12px;border-radius:10px;font-size:12.5px;margin-top:10px;word-break:break-word}' +
      '.ca-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}' +
      '.ca-btn{border:1px solid #CBD5E1;background:#fff;color:#08222F;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer}' +
      '.ca-btn.pri{background:linear-gradient(135deg,#FFC933,#F5B700);border-color:#E0A800}' +
      '.ca-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;background:#DCFCE7;color:#166534;font-size:11.5px;font-weight:700;text-decoration:none;margin:2px 4px 2px 0}';
    document.head.appendChild(st);
  }

  function abrirModalAsistenciaCharla(temaNombre, fechaDef, onGuardado){
    var empId = _empId();
    if(!empId){ alert('Selecciona primero una obra activa.'); return; }
    _inyectarEstilos();
    var m = document.getElementById('ca-modal');
    if(!m){
      m = document.createElement('div');
      m.id = 'ca-modal';
      document.body.appendChild(m);
    }
    m.hidden = false;
    m.innerHTML = '<div class="ca-box"><b>Cargando frentes de la obra…</b></div>';

    _cargarFrentesYRegistros(empId).then(function(){
      var fechaIni = fechaDef || _hoyLima();
      var frentesOpts = CA.frentes.map(function(f){ return '<option value="' + _esc(f) + '">' + _esc(f) + '</option>'; }).join('');
      m.innerHTML =
        '<div class="ca-box">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
            '<b style="font-size:16px">📋 Subir Registro de Asistencia</b>' +
            '<button type="button" class="ca-btn" style="padding:5px 10px" data-ca="cerrar">✕</button>' +
          '</div>' +
          (temaNombre ? '<div style="font-size:12.5px;color:#475569;margin-top:4px">Tema: <b>' + _esc(temaNombre) + '</b></div>' : '') +
          '<label class="ca-lab" for="ca-fecha">1. Fecha de realización</label>' +
          '<input type="date" id="ca-fecha" class="ca-in" value="' + _esc(fechaIni) + '">' +
          '<label class="ca-lab" for="ca-tipo">2. Tipo de documento / actividad</label>' +
          '<select id="ca-tipo" class="ca-in">' +
            TIPOS_ACTIVIDAD.map(function(t){ return '<option value="' + _esc(t) + '">' + _esc(t) + '</option>'; }).join('') +
          '</select>' +
          '<label class="ca-lab" for="ca-frente">3. Frente de trabajo</label>' +
          '<select id="ca-frente" class="ca-in">' +
            (frentesOpts || '') +
            '<option value="__OTRO__">— Escribir otro frente —</option>' +
          '</select>' +
          '<div id="ca-otro-wrap"' + (CA.frentes.length ? ' hidden' : '') + '>' +
            '<input type="text" id="ca-frente-otro" class="ca-in" style="margin-top:6px" maxlength="70" placeholder="Ej: Frente Torre A / Excavación Sótano 2">' +
          '</div>' +
          '<label class="ca-lab" for="ca-archivo">4. Archivo de asistencia (PDF o fotos del registro firmado)</label>' +
          '<input type="file" id="ca-archivo" class="ca-in" accept="application/pdf,image/jpeg,image/png,image/webp" multiple>' +
          '<small style="color:#64748B">Si seleccionas 1 o varias fotos, se convierten automáticamente a un solo PDF A4.</small>' +
          '<div class="ca-prev" id="ca-prev"></div>' +
          '<div id="ca-msg" style="font-size:12.5px;margin-top:8px;font-weight:700"></div>' +
          '<div class="ca-btns">' +
            '<button type="button" class="ca-btn" data-ca="cerrar">Cancelar</button>' +
            '<button type="button" class="ca-btn pri" data-ca="guardar">☁️ Archivar en «Registros de asistencia»</button>' +
          '</div>' +
        '</div>';

      function frenteActual(){
        var sel = document.getElementById('ca-frente');
        var v = sel ? sel.value : '__OTRO__';
        if(v === '__OTRO__') return String((document.getElementById('ca-frente-otro') || {}).value || '').trim();
        return v;
      }

      function actualizarVistaPrevia(){
        var f = (document.getElementById('ca-fecha') || {}).value || _hoyLima();
        var t = (document.getElementById('ca-tipo') || {}).value || TIPOS_ACTIVIDAD[0];
        var fr = frenteActual() || 'Sin frente';
        var nom = _nombreUnico(f, t, fr);
        var pv = document.getElementById('ca-prev');
        if(pv) pv.innerHTML = '📁 Carpeta: <b>' + _esc(CARPETA_ASISTENCIA) + '</b><br>📄 Nombre automático: <b>' + _esc(nom) + '.pdf</b>';
      }

      ['ca-fecha', 'ca-tipo', 'ca-frente', 'ca-frente-otro'].forEach(function(id){
        var el = document.getElementById(id);
        if(el) el.addEventListener('change', function(){
          if(id === 'ca-frente'){
            var ow = document.getElementById('ca-otro-wrap');
            if(ow) ow.hidden = (el.value !== '__OTRO__');
          }
          actualizarVistaPrevia();
        });
        if(id === 'ca-frente-otro' && el) el.addEventListener('input', actualizarVistaPrevia);
      });
      actualizarVistaPrevia();

      m.onclick = function(ev){
        var b = ev.target.closest('[data-ca]'); if(!b) return;
        var a = b.getAttribute('data-ca');
        if(a === 'cerrar'){ m.hidden = true; return; }
        if(a === 'guardar'){
          if(CA.enVuelo) return;
          var msg = document.getElementById('ca-msg');
          var fecha = (document.getElementById('ca-fecha') || {}).value || _hoyLima();
          var tipo = (document.getElementById('ca-tipo') || {}).value || TIPOS_ACTIVIDAD[0];
          var frente = frenteActual();
          var inpF = document.getElementById('ca-archivo');
          var files = Array.prototype.slice.call((inpF && inpF.files) || []);
          if(!frente){ if(msg){ msg.style.color='#B91C1C'; msg.textContent='Indica el frente de trabajo.'; } return; }
          if(!files.length){ if(msg){ msg.style.color='#B91C1C'; msg.textContent='Adjunta el PDF o las fotos del registro de asistencia.'; } return; }
          if(typeof subirFoto !== 'function' || typeof sbPost !== 'function'){
            if(msg){ msg.style.color='#B91C1C'; msg.textContent='No hay conexión activa con el módulo de Documentos.'; }
            return;
          }

          CA.enVuelo = true;
          b.disabled = true;
          if(msg){ msg.style.color='#0B2A3A'; msg.textContent='Preparando y subiendo registro de asistencia…'; }

          var nomDoc = _nombreUnico(fecha, tipo, frente);
          var esPdf = (files.length === 1 && /pdf$/i.test(files[0].type || files[0].name));
          var prepArchivo = esPdf
            ? Promise.resolve(new File([files[0]], nomDoc + '.pdf', { type: 'application/pdf' }))
            : (window.OBRASST_PDF_ESTUDIO && typeof window.OBRASST_PDF_ESTUDIO.imagenesAPdfBytes === 'function')
              ? window.OBRASST_PDF_ESTUDIO.imagenesAPdfBytes(files, 'a4v').then(function(bytes){
                  return new File([bytes], nomDoc + '.pdf', { type: 'application/pdf' });
                })
              : Promise.resolve(files[0]);

          prepArchivo.then(function(fileFinal){
            return subirFoto('docs', fileFinal);
          }).then(function(url){
            var nota = '[ASISTENCIA|tema=' + _limpiarSegmento(temaNombre || 'General') +
                       '|frente=' + _limpiarSegmento(frente) +
                       '|tipo=' + _limpiarSegmento(tipo) +
                       '|fecha=' + _limpiarSegmento(fecha) + ']';
            return sbPost('sst_doc', {
              empresa: empId,
              hoja: CARPETA_ASISTENCIA,
              nombre: nomDoc,
              url: url,
              nota: nota
            });
          }).then(function(){
            CA.enVuelo = false;
            m.hidden = true;
            if(typeof tostada === 'function') tostada('Registro archivado: ' + nomDoc);
            if(typeof cargarDocs === 'function') try{ cargarDocs(); }catch(_c){}
            _cargarFrentesYRegistros(empId).then(function(){
              if(typeof onGuardado === 'function') onGuardado(CA.docs);
            });
          }).catch(function(err){
            CA.enVuelo = false;
            b.disabled = false;
            if(msg){ msg.style.color='#B91C1C'; msg.textContent='No se pudo guardar: ' + (err && err.message ? err.message : err); }
          });
        }
      };
    });
  }

  function htmlBadgesAsistenciaPorTema(temaNombre){
    var clave = _limpiarSegmento(temaNombre).toLowerCase();
    var lista = (CA.docs || []).filter(function(d){
      var p = _parsearNota(d.nota);
      return !clave || p.tema.toLowerCase() === clave;
    });
    if(!lista.length) return '';
    return '<div style="margin-top:6px">' + lista.slice(0, 8).map(function(d){
      var p = _parsearNota(d.nota);
      var lbl = (p.frente || d.nombre) + (p.fecha ? ' · ' + p.fecha.slice(5) : '');
      return '<a class="ca-badge" href="' + _esc(d.url || '#') + '" target="_blank" rel="noopener" title="' + _esc(d.nombre) + '">✓ ' + _esc(lbl) + '</a>';
    }).join('') + '</div>';
  }

  function pintarPanelAsistencias(hostId){
    var empId = _empId();
    var host = document.getElementById(hostId);
    if(!empId || !host) return;
    _inyectarEstilos();
    _cargarFrentesYRegistros(empId).then(function(){
      var h = '<div style="background:#fff;border:1px solid rgba(11,42,58,.1);border-radius:14px;padding:14px 16px;margin-bottom:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<div><b style="font-size:15px">📋 Registros de Asistencia por Frente (' + CA.docs.length + ')</b>' +
          '<div style="font-size:12px;color:#64748B">Se archivan solos en Documentos › «Registros de asistencia» ordenados por fecha, tipo y frente.</div></div>' +
          '<button type="button" class="ca-btn pri" id="ca-btn-nuevo-rapido">➕ Subir registro de asistencia</button>' +
        '</div>' +
        (CA.docs.length ? '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">' +
          CA.docs.slice(0, 20).map(function(d){
            return '<a class="ca-badge" href="' + _esc(d.url || '#') + '" target="_blank" rel="noopener">📄 ' + _esc(d.nombre) + '</a>';
          }).join('') + '</div>' : '<p style="font-size:12.5px;color:#64748B;margin:8px 0 0">Todavía no hay registros de asistencia subidos en esta obra.</p>') +
      '</div>';
      host.innerHTML = h;
      var btn = document.getElementById('ca-btn-nuevo-rapido');
      if(btn) btn.onclick = function(){ abrirModalAsistenciaCharla('', null, function(){ pintarPanelAsistencias(hostId); }); };
    });
  }

  window.OBRASST_CHARLAS_ASIST = {
    abrirModal: abrirModalAsistenciaCharla,
    cargar: _cargarFrentesYRegistros,
    badgesTema: htmlBadgesAsistenciaPorTema,
    pintarPanel: pintarPanelAsistencias,
    TIPOS: TIPOS_ACTIVIDAD
  };
  window.abrirModalAsistenciaCharla = abrirModalAsistenciaCharla;
})();
