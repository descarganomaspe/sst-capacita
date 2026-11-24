/* ═══════════════════════════════════════════════════════════════════════════
   OBRASST · PORTAL WEB · Parte 4: Panel Fotográfico del Informe (Excel + PDF Ordenado)
   - Tablero visual de 2 columnas por sección (espejo exacto del formato Excel)
   - Acción rápida «Enviar al Panel Fotográfico» desde cualquier foto
   - Alimenta automáticamente Panel_Fotografico_SST_<Mes>_<Anio>.xlsx (ZIP de 8 carpetas)
   - Genera Anexo Fotográfico ordenado en PDF (2 fotos por fila, sin cortes entre páginas)
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var SECCIONES = [
    { key:'capacitacion', titulo:'a. Capacitación', sub:'Reuniones de inicio de jornada, capacitaciones, pausas activas y dinámicas' },
    { key:'control',      titulo:'b. Control Operacional', sub:'Inspecciones, señalización, delimitación y equipos' },
    { key:'emergencia',   titulo:'c. Preparación y Respuesta a Emergencias', sub:'Estaciones de emergencia, extintores, botiquín y simulacros' },
    { key:'epp',          titulo:'d. EPP y EPC', sub:'Uso de EPP por puesto y protecciones colectivas' },
    { key:'bienestar',    titulo:'e. Bienestar, Salud Ocupacional y Difusión', sub:'Periódico mural, boletines, comedor y orden' },
    { key:'ambiente',     titulo:'f. Medio Ambiente', sub:'Batería de residuos NTP 900.058, almacén MATPEL, MSDS, SGA, NFPA y kit antiderrame' }
  ];

  var PF = {
    empId: null,
    periodo: _periodoActual(),
    fotos: [],
    enVuelo: false
  };

  function _periodoActual(){
    try{
      var d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
    }catch(_e){
      return new Date().toISOString().slice(0, 7);
    }
  }

  function _esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function _urlOk(u){
    return /^(https:\/\/|http:\/\/localhost|blob:)/i.test(String(u || '').trim());
  }

  function _empObj(){
    if(typeof empActiva === 'function'){ var e = empActiva(); if(e && e.id) return e; }
    if(typeof EMP_ID !== 'undefined' && EMP_ID) return { id: EMP_ID, nombre: '' };
    try{
      var raw = localStorage.getItem('sst_emp_activa') || localStorage.getItem('LS_EMP');
      if(raw){ var j = JSON.parse(raw); if(j && j.id) return j; }
    }catch(_e){}
    return null;
  }

  function _aviso(msg){
    if(typeof tostada === 'function'){ tostada(msg); return; }
    alert(msg);
  }

  function _inyectarEstilos(){
    if(document.getElementById('pf-web-css')) return;
    var st = document.createElement('style');
    st.id = 'pf-web-css';
    st.textContent =
      '#pf-wrap,#pf-wrap *,#pf-ov,#pf-ov *{box-sizing:border-box;font-family:var(--letra,"Plus Jakarta Sans",sans-serif)!important}' +
      '#pf-wrap{max-width:1180px;margin:0 auto;padding:14px;color:#08222F}' +
      '.pf-top{background:#fff;border:1px solid rgba(11,42,58,.1);border-radius:16px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}' +
      '.pf-btn{border:1px solid rgba(11,42,58,.16);background:#fff;color:#08222F;padding:8px 13px;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}' +
      '.pf-btn.pri{background:linear-gradient(135deg,#FFC933,#F5B700);border-color:#E0A800;color:#08222F}' +
      '.pf-btn.osc{background:#0B2A3A;border-color:#0B2A3A;color:#fff}' +
      '.pf-btn.pel{background:#FEF2F2;border-color:#FECACA;color:#B91C1C;padding:5px 8px;font-size:11.5px}' +
      '.pf-sec{background:#fff;border:1px solid rgba(11,42,58,.1);border-radius:16px;padding:14px 16px;margin-bottom:14px}' +
      '.pf-sec-cab{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #E2E8F0}' +
      '.pf-grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}' +
      '@media(max-width:740px){.pf-grid-2{grid-template-columns:1fr}}' +
      '.pf-card{border:1.5px solid #E2E8F0;border-radius:12px;overflow:hidden;background:#F8FAFC;display:flex;flex-direction:column}' +
      '.pf-img-box{height:210px;background:#E2E8F0;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
      '.pf-img-box img{width:100%;height:100%;object-fit:contain;display:block;background:#F1F5F9}' +
      '.pf-cap{padding:9px 11px;background:#fff;border-top:1px solid #E2E8F0}' +
      '.pf-in{width:100%;padding:8px 10px;border:1px solid #CBD5E1;border-radius:9px;font-size:13px;background:#fff;color:#08222F}' +
      '#pf-ov{position:fixed;inset:0;z-index:9975;background:rgba(8,34,47,.72);display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(4px)}' +
      '#pf-ov[hidden]{display:none!important}' +
      '.pf-modal{background:#fff;width:min(520px,96vw);max-height:88vh;overflow:auto;border-radius:18px;padding:18px 20px;box-shadow:0 22px 54px rgba(0,0,0,.32)}';
    document.head.appendChild(st);
  }

  function agruparPorSeccion(lista){
    var mapa = { capacitacion: [], control: [], emergencia: [], epp: [], bienestar: [], ambiente: [] };
    (lista || []).forEach(function(f){
      if(f && mapa[f.seccion]) mapa[f.seccion].push(f);
    });
    return mapa;
  }

  function cargarFotosMes(empId, periodo){
    var emp = empId ? { id: empId } : _empObj();
    if(!emp || !emp.id) return Promise.resolve([]);
    PF.empId = emp.id;
    PF.periodo = periodo || PF.periodo || _periodoActual();
    if(typeof sbRpc !== 'function') return Promise.resolve([]);
    return sbRpc('sst_inf_foto_listar', { p_emp: PF.empId, p_periodo: PF.periodo }).then(function(r){
      PF.fotos = (r && r.ok && Array.isArray(r.fotos)) ? r.fotos : [];
      return PF.fotos;
    }).catch(function(){ return PF.fotos; });
  }

  /* Helper para que portal/informe.js obtenga las fotos estructuradas por sección */
  function obtenerFotosParaInforme(empId, periodo){
    return cargarFotosMes(empId, periodo).then(function(lista){
      return agruparPorSeccion(lista);
    });
  }

  /* ── GENERADOR DE ANEXO FOTOGRÁFICO ORDENADO PARA INFORME PDF TRADICIONAL (2 POR FILA, SIN CORTES) ── */
  function generarAnexoFotograficoPdfHTML(fotosPorSeccion, meta){
    meta = meta || {};
    var mapa = Array.isArray(fotosPorSeccion) ? agruparPorSeccion(fotosPorSeccion) : (fotosPorSeccion || {});
    var numGlobal = 0;
    var bloques = '';

    SECCIONES.forEach(function(sec){
      var arr = Array.isArray(mapa[sec.key]) ? mapa[sec.key] : [];
      if(!arr.length) return;

      bloques +=
        '<div class="inf-pf-bloque" style="margin-bottom:18px">' +
          '<div style="background:#0B2A3A;color:#fff;padding:7px 12px;border-radius:8px;font-weight:800;font-size:12.5px;margin-bottom:10px;page-break-after:avoid;break-after:avoid">' +
            _esc(sec.titulo) + ' (' + arr.length + ')' +
          '</div>';

      for(var i = 0; i < arr.length; i += 2){
        bloques += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;break-inside:avoid;page-break-inside:avoid">';
        for(var j = 0; j < 2; j++){
          var it = arr[i + j];
          if(!it){
            bloques += '<div></div>';
            continue;
          }
          numGlobal++;
          var metaTxt = [];
          if(it.fecha_foto) metaTxt.push(String(it.fecha_foto).slice(0, 10));
          if(it.frente) metaTxt.push(it.frente);
          bloques +=
            '<div style="border:1px solid #CBD5E1;border-radius:10px;overflow:hidden;background:#fff;break-inside:avoid;page-break-inside:avoid">' +
              '<div style="height:210px;background:#F8FAFC;display:flex;align-items:center;justify-content:center;padding:4px">' +
                (_urlOk(it.url) ? '<img src="' + _esc(it.url) + '" alt="Foto ' + numGlobal + '" style="max-width:100%;max-height:202px;object-fit:contain;display:block">' : '') +
              '</div>' +
              '<div style="padding:7px 10px;border-top:1px solid #E2E8F0;background:#FFFBEB">' +
                '<div style="font-size:11.5px;font-weight:800;color:#08222F">Foto ' + numGlobal + ': ' + _esc(it.titulo || sec.titulo) + '</div>' +
                (metaTxt.length ? '<div style="font-size:10.5px;color:#475569;margin-top:2px">' + _esc(metaTxt.join(' · ')) + '</div>' : '') +
              '</div>' +
            '</div>';
        }
        bloques += '</div>';
      }
      bloques += '</div>';
    });

    if(!bloques){
      return '<div style="padding:14px;border:1px dashed #CBD5E1;border-radius:10px;font-size:12px;color:#64748B">No se asignaron fotografías para este periodo en el Panel Fotográfico.</div>';
    }
    return '<section class="inf-anexo-foto" style="font-family:var(--letra,\'Plus Jakarta Sans\',sans-serif)">' +
      '<h3 style="margin:0 0 12px;font-size:15px;color:#08222F;border-bottom:2px solid #FFC933;padding-bottom:5px">ANEXO FOTOGRÁFICO DE OBRA' + (meta.periodo ? (' — ' + _esc(meta.periodo)) : '') + '</h3>' +
      bloques + '</section>';
  }

  /* ── MODAL RÁPIDO: ENVIAR FOTO AL PANEL FOTOGRÁFICO (3 CAMPOS SIMPLES) ── */
  function abrirEnviarAPanelFoto(opts){
    opts = opts || {};
    _inyectarEstilos();
    var emp = _empObj();
    if(!emp || !emp.id){ _aviso('Selecciona primero una obra activa.'); return; }
    var ov = document.getElementById('pf-ov');
    if(!ov){
      ov = document.createElement('div');
      ov.id = 'pf-ov';
      document.body.appendChild(ov);
    }
    ov.hidden = false;
    var secDef = opts.seccion || 'capacitacion';
    var perDef = opts.periodo || PF.periodo || _periodoActual();
    var fotoEdit = opts.editar || null;

    ov.innerHTML =
      '<div class="pf-modal">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">' +
          '<b style="font-size:16px">' + (fotoEdit ? '✏️ Editar foto del Panel' : '📸 Enviar al Panel Fotográfico del Informe') + '</b>' +
          '<button type="button" class="pf-btn" data-pfm="cerrar">✕</button>' +
        '</div>' +
        (opts.url || (fotoEdit && fotoEdit.url)
          ? '<div style="height:170px;background:#F1F5F9;border-radius:10px;overflow:hidden;margin-bottom:10px;display:flex;align-items:center;justify-content:center">' +
              '<img src="' + _esc(opts.url || fotoEdit.url) + '" style="max-width:100%;max-height:170px;object-fit:contain">' +
            '</div>'
          : '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px">Fotografía (JPG / PNG)</label>' +
            '<input type="file" id="pfm-file" class="pf-in" accept="image/jpeg,image/png,image/webp" style="margin-bottom:10px">') +
        '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px">1. Sección del Panel Fotográfico (Excel y PDF)</label>' +
        '<select id="pfm-sec" class="pf-in" style="margin-bottom:10px">' +
          SECCIONES.map(function(s){
            var sel = (fotoEdit ? fotoEdit.seccion : secDef) === s.key ? ' selected' : '';
            return '<option value="' + s.key + '"' + sel + '>' + _esc(s.titulo) + '</option>';
          }).join('') +
        '</select>' +
        '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px">2. Descripción / Pie de foto</label>' +
        '<input type="text" id="pfm-tit" class="pf-in" style="margin-bottom:10px" maxlength="220" placeholder="Ej: Reunión de inicio de jornada · Frente Torre A" value="' + _esc((fotoEdit && fotoEdit.titulo) || opts.titulo || '') + '">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">' +
          '<div><label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px">3. Periodo (Mes / Año)</label>' +
          '<input type="month" id="pfm-per" class="pf-in" value="' + _esc((fotoEdit && fotoEdit.periodo_mes) || perDef) + '"></div>' +
          '<div><label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px">Frente (opcional)</label>' +
          '<input type="text" id="pfm-fr" class="pf-in" maxlength="80" placeholder="Ej: Torre A" value="' + _esc((fotoEdit && fotoEdit.frente) || opts.frente || '') + '"></div>' +
        '</div>' +
        '<div id="pfm-msg" style="font-size:12.5px;font-weight:700;margin-bottom:8px"></div>' +
        '<div style="display:flex;justify-content:flex-end;gap:8px">' +
          '<button type="button" class="pf-btn" data-pfm="cerrar">Cancelar</button>' +
          '<button type="button" class="pf-btn pri" data-pfm="guardar">💾 Guardar en Panel</button>' +
        '</div>' +
      '</div>';

    ov.onclick = function(ev){
      var b = ev.target.closest('[data-pfm]'); if(!b) return;
      var a = b.getAttribute('data-pfm');
      if(a === 'cerrar'){ ov.hidden = true; return; }
      if(a === 'guardar'){
        if(PF.enVuelo) return;
        var sec = (document.getElementById('pfm-sec') || {}).value || 'capacitacion';
        var tit = String((document.getElementById('pfm-tit') || {}).value || '').trim();
        var per = (document.getElementById('pfm-per') || {}).value || _periodoActual();
        var fr  = String((document.getElementById('pfm-fr') || {}).value || '').trim();
        var msg = document.getElementById('pfm-msg');

        var urlFinal = opts.url || (fotoEdit && fotoEdit.url) || '';
        var inpF = document.getElementById('pfm-file');
        var file = (inpF && inpF.files && inpF.files[0]) || null;

        if(!urlFinal && !file){
          if(msg){ msg.style.color = '#B91C1C'; msg.textContent = 'Selecciona una fotografía primero.'; }
          return;
        }
        PF.enVuelo = true;
        b.disabled = true;
        if(msg){ msg.style.color = '#0B2A3A'; msg.textContent = 'Guardando fotografía en el Panel…'; }

        var subirProm = urlFinal
          ? Promise.resolve(urlFinal)
          : (typeof subirFoto === 'function'
            ? subirFoto('fotos', file)
            : Promise.reject(new Error('Función de subida de fotos no disponible.')));

        subirProm.then(function(u){
          return sbRpc('sst_inf_foto_guardar', {
            p_emp: emp.id,
            p_id: fotoEdit ? fotoEdit.id : null,
            p_periodo: per,
            p_seccion: sec,
            p_titulo: tit || 'Evidencia fotográfica de obra',
            p_url: u,
            p_frente: fr
          });
        }).then(function(r){
          PF.enVuelo = false;
          if(!r || !r.ok){
            b.disabled = false;
            if(msg){ msg.style.color = '#B91C1C'; msg.textContent = 'No se pudo guardar en el panel.'; }
            return;
          }
          ov.hidden = true;
          _aviso('Foto agregada al Panel Fotográfico (' + per + ').');
          if(typeof opts.onGuardado === 'function') opts.onGuardado(r.foto);
        }).catch(function(err){
          PF.enVuelo = false;
          b.disabled = false;
          if(msg){ msg.style.color = '#B91C1C'; msg.textContent = 'Error: ' + (err && err.message ? err.message : err); }
        });
      }
    };
  }

  /* ── TABLERO VISUAL DEL PANEL FOTOGRÁFICO (2 COLUMNAS POR SECCIÓN, ESPEJO DEL EXCEL) ── */
  function pintarTableroPanelFoto(hostId, periodoIni){
    _inyectarEstilos();
    var host = document.getElementById(hostId);
    if(!host) return;
    var emp = _empObj();
    if(!emp || !emp.id){
      host.innerHTML = '<div id="pf-wrap"><div class="pf-top"><b>Selecciona una obra activa para gestionar el Panel Fotográfico.</b></div></div>';
      return;
    }
    if(periodoIni) PF.periodo = periodoIni;

    function dibujar(){
      var mapa = agruparPorSeccion(PF.fotos);
      var h = '<div id="pf-wrap">' +
        '<div class="pf-top">' +
          '<div><b style="font-size:17px">📸 Panel Fotográfico del Informe (' + PF.fotos.length + ' fotos)</b>' +
          '<div style="font-size:12px;color:#64748B">Las fotos aquí organizadas llenan automáticamente el Excel del Informe en 8 carpetas y el Anexo Fotográfico PDF.</div></div>' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
            '<input type="month" id="pf-mes-sel" class="pf-in" style="width:160px" value="' + _esc(PF.periodo) + '">' +
            '<button type="button" class="pf-btn pri" data-pf="subir" data-sec="capacitacion">➕ Agregar foto</button>' +
            '<button type="button" class="pf-btn osc" data-pf="excel">📊 Descargar Excel</button>' +
            '<button type="button" class="pf-btn" data-pf="pdf-prev">🖨️ Imprimir Anexo PDF</button>' +
          '</div>' +
        '</div>';

      SECCIONES.forEach(function(sec){
        var lista = mapa[sec.key] || [];
        h += '<div class="pf-sec">' +
          '<div class="pf-sec-cab">' +
            '<div><b style="font-size:14.5px;color:#0B2A3A">' + _esc(sec.titulo) + ' (' + lista.length + ')</b>' +
            '<div style="font-size:12px;color:#64748B">' + _esc(sec.sub) + '</div></div>' +
            '<button type="button" class="pf-btn" data-pf="subir" data-sec="' + sec.key + '">+ Foto en esta sección</button>' +
          '</div>';

        if(lista.length){
          h += '<div class="pf-grid-2">';
          lista.forEach(function(f, idx){
            h += '<div class="pf-card">' +
              '<div class="pf-img-box"><img src="' + _esc(f.url) + '" alt="Foto ' + (idx + 1) + '"></div>' +
              '<div class="pf-cap">' +
                '<div style="font-size:13px;font-weight:800">Foto ' + (idx + 1) + ': ' + _esc(f.titulo || 'Sin descripción') + '</div>' +
                '<div style="font-size:11.5px;color:#64748B;margin:3px 0 8px">' + _esc((f.fecha_foto || '') + (f.frente ? (' · ' + f.frente) : '')) + '</div>' +
                '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
                  '<button type="button" class="pf-btn" style="padding:5px 9px;font-size:11.5px" data-pf="editar" data-id="' + _esc(f.id) + '">✏️ Editar</button>' +
                  (idx > 0 ? '<button type="button" class="pf-btn" style="padding:5px 8px;font-size:11.5px" data-pf="mover" data-sec="' + sec.key + '" data-i="' + idx + '" data-dir="-1">◀</button>' : '') +
                  (idx < lista.length - 1 ? '<button type="button" class="pf-btn" style="padding:5px 8px;font-size:11.5px" data-pf="mover" data-sec="' + sec.key + '" data-i="' + idx + '" data-dir="1">▶</button>' : '') +
                  '<button type="button" class="pf-btn pel" data-pf="borrar" data-id="' + _esc(f.id) + '">🗑️ Quitar</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          });
          h += '</div>';
        } else {
          h += '<div style="padding:14px;border:1px dashed #CBD5E1;border-radius:10px;text-align:center;font-size:12.5px;color:#64748B">Sin fotografías asignadas en esta sección para ' + _esc(PF.periodo) + '.</div>';
        }
        h += '</div>';
      });

      h += '</div>';
      host.innerHTML = h;

      var ms = document.getElementById('pf-mes-sel');
      if(ms){
        ms.onchange = function(){
          PF.periodo = ms.value || _periodoActual();
          cargarFotosMes(emp.id, PF.periodo).then(dibujar);
        };
      }
    }

    host.onclick = function(ev){
      var b = ev.target.closest('[data-pf]'); if(!b) return;
      var a = b.getAttribute('data-pf');
      if(a === 'subir'){
        abrirEnviarAPanelFoto({
          seccion: b.getAttribute('data-sec') || 'capacitacion',
          periodo: PF.periodo,
          onGuardado: function(){ cargarFotosMes(emp.id, PF.periodo).then(dibujar); }
        });
        return;
      }
      if(a === 'editar'){
        var idE = b.getAttribute('data-id');
        var found = null;
        for(var k = 0; k < PF.fotos.length; k++){ if(String(PF.fotos[k].id) === String(idE)) found = PF.fotos[k]; }
        if(found){
          abrirEnviarAPanelFoto({
            editar: found,
            onGuardado: function(){ cargarFotosMes(emp.id, PF.periodo).then(dibujar); }
          });
        }
        return;
      }
      if(a === 'borrar'){
        if(!confirm('¿Quitar esta fotografía del Panel Fotográfico del mes?')) return;
        sbRpc('sst_inf_foto_eliminar', { p_emp: emp.id, p_id: b.getAttribute('data-id') })
          .then(function(){ cargarFotosMes(emp.id, PF.periodo).then(dibujar); });
        return;
      }
      if(a === 'mover'){
        var secM = b.getAttribute('data-sec');
        var idxM = parseInt(b.getAttribute('data-i'), 10);
        var dir  = parseInt(b.getAttribute('data-dir'), 10);
        var arr = agruparPorSeccion(PF.fotos)[secM] || [];
        var dest = idxM + dir;
        if(dest < 0 || dest >= arr.length) return;
        var tmp = arr[idxM]; arr[idxM] = arr[dest]; arr[dest] = tmp;
        sbRpc('sst_inf_foto_reordenar', { p_emp: emp.id, p_ids: arr.map(function(x){ return x.id; }) })
          .then(function(){ cargarFotosMes(emp.id, PF.periodo).then(dibujar); });
        return;
      }
      if(a === 'excel'){
        if(!window.OBRASST_FORMATOS_INFORME || typeof window.OBRASST_FORMATOS_INFORME.generarPanelFotograficoXlsx !== 'function'){
          _aviso('Cargando módulo de Excel… asegúrate de tener informe-formatos.js enlazado.');
          return;
        }
        _aviso('Generando Excel de Panel Fotográfico con imágenes incrustadas…');
        window.OBRASST_FORMATOS_INFORME.generarPanelFotograficoXlsx({
          empresa: emp,
          fotos: agruparPorSeccion(PF.fotos)
        }).then(function(blob){
          var lk = document.createElement('a');
          var u = URL.createObjectURL(blob);
          lk.href = u;
          lk.download = 'Panel_Fotografico_SST_' + PF.periodo + '.xlsx';
          document.body.appendChild(lk);
          lk.click();
          document.body.removeChild(lk);
          setTimeout(function(){ URL.revokeObjectURL(u); }, 4000);
        }).catch(function(err){ _aviso('Error generando Excel: ' + (err && err.message ? err.message : err)); });
        return;
      }
      if(a === 'pdf-prev'){
        var html = generarAnexoFotograficoPdfHTML(PF.fotos, { periodo: PF.periodo });
        var w = window.open('', '_blank', 'width=960,height=760');
        if(!w){ _aviso('Permite ventanas emergentes para imprimir el Anexo Fotográfico PDF.'); return; }
        w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Anexo Fotográfico ' + _esc(PF.periodo) + '</title>' +
          '<style>@page{size:A4 portrait;margin:14mm}body{font-family:"Plus Jakarta Sans",Arial,sans-serif;margin:0;color:#08222F}</style></head><body>' +
          html + '<script>setTimeout(function(){window.print();},450);<\/script></body></html>');
        w.document.close();
      }
    };

    host.innerHTML = '<div id="pf-wrap"><div class="pf-top">Cargando Panel Fotográfico…</div></div>';
    cargarFotosMes(emp.id, PF.periodo).then(dibujar);
  }

  window.OBRASST_PANEL_FOTO = {
    SECCIONES: SECCIONES,
    cargarFotosMes: cargarFotosMes,
    obtenerFotosParaInforme: obtenerFotosParaInforme,
    abrirEnviarAPanelFoto: abrirEnviarAPanelFoto,
    pintarTablero: pintarTableroPanelFoto,
    generarAnexoFotograficoPdfHTML: generarAnexoFotograficoPdfHTML
  };
  window.abrirEnviarAPanelFoto = abrirEnviarAPanelFoto;
})();
