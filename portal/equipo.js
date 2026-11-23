/* ═══════════════════════════════════════════════════════════════════════════
   OBRASST · PORTAL WEB · Sección Equipo y Supervisores (Sincronizada con App)
   - Mismos RPCs que index.html (sst_invitar + sst_portal_equipo_listar + sst_portal_inv_revocar)
   - Compatible multipaís (RNC Rep. Dominicana 9 dígitos, RUC, RUT, NIT, RFC, DNI, Cédula, CE)
   - Respeta cupos del plan, roles (dueño / colíder / gestor) y modo solo lectura para no dueños
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var EQ = {
    empId: null,
    datos: null,
    enVuelo: false
  };

  function _esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function _norm(s){
    return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function _invBonito(cod){
    var c = _norm(cod);
    return (c.length === 9 && c.slice(0, 3) === 'INV') ? ('INV-' + c.slice(3)) : c;
  }

  function _hoyISO(){
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

  function _appUrl(){
    return 'https://descarganomaspe.github.io/sst-capacita/';
  }

  function _aviso(msg){
    if(typeof tostada === 'function'){ tostada(msg); return; }
    alert(msg);
  }

  function _inyectarEstilos(){
    if(document.getElementById('eqp-css')) return;
    var st = document.createElement('style');
    st.id = 'eqp-css';
    st.textContent =
      '#eqp-wrap,#eqp-wrap *{box-sizing:border-box;font-family:var(--letra,"Plus Jakarta Sans",sans-serif)!important}' +
      '#eqp-wrap{max-width:1120px;margin:0 auto;padding:16px;color:#08222F}' +
      '.eqp-card{background:#fff;border:1px solid rgba(11,42,58,.1);border-radius:16px;padding:18px 20px;margin-bottom:16px;box-shadow:0 4px 14px rgba(11,42,58,.04)}' +
      '.eqp-cab{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}' +
      '.eqp-sq{width:42px;height:42px;border-radius:30%;background:#fff;border:1px solid rgba(11,42,58,.08);box-shadow:inset 0 2px 6px rgba(0,0,0,.04),0 3px 9px rgba(11,42,58,.09);display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
      '.eqp-sq img{width:26px;height:26px;object-fit:contain}' +
      '.eqp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}' +
      '.eqp-lab{display:block;font-size:12px;font-weight:800;color:#334155;margin-bottom:4px}' +
      '.eqp-in{width:100%;padding:9px 11px;border:1px solid #CBD5E1;border-radius:10px;font-size:13.5px;background:#fff;color:#08222F}' +
      '.eqp-btn{border:1px solid #CBD5E1;background:#fff;color:#08222F;padding:9px 15px;border-radius:11px;font-size:13.5px;font-weight:700;cursor:pointer}' +
      '.eqp-btn.pri{background:linear-gradient(135deg,#FFC933,#F5B700);border-color:#E0A800;color:#08222F}' +
      '.eqp-btn.pel{background:#FEF2F2;border-color:#FECACA;color:#B91C1C;padding:6px 10px;font-size:12px}' +
      '.eqp-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border-radius:12px;background:#F8FAFC;border:1px solid #E2E8F0;margin-bottom:8px;flex-wrap:wrap}' +
      '.eqp-badge{display:inline-block;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:800}' +
      '.eqp-cod-box{background:#FFFBEB;border:2px solid #F5B700;border-radius:14px;padding:16px;margin-top:14px;text-align:center}' +
      '[hidden]{display:none!important}';
    document.head.appendChild(st);
  }

  function _textoInvitacion(empNom, papel, correo, codBonito, doc, vence){
    var comoQue = (papel === 'colider') ? 'como segundo líder SSOMA' : 'como supervisor SSOMA';
    return 'Te invito a OBRASST ' + comoQue + ' de ' + (empNom || 'nuestra empresa') + '.' +
      '\n\n1) Entra a ' + _appUrl() + ' o a https://obrasstapp.com' +
      '\n2) Crea tu cuenta con este correo: ' + correo +
      '\n3) En «Tengo un código de invitación» escribe: ' + codBonito +
      '\n   y tu documento: ' + _norm(doc) +
      '\n\nEl código vence el ' + String(vence || '').slice(0, 10) + ' y se usa una sola vez.';
  }

  function abrirEquipoPortal(hostId){
    _inyectarEstilos();
    var host = document.getElementById(hostId || 'eqp-portal-host');
    if(!host){
      var main = document.querySelector('main') || document.body;
      host = document.createElement('div');
      host.id = 'eqp-portal-host';
      main.appendChild(host);
    }
    host.hidden = false;
    EQ.empId = _empId();
    if(!EQ.empId){
      host.innerHTML = '<div id="eqp-wrap"><div class="eqp-card"><b>Selecciona primero una empresa u obra activa.</b></div></div>';
      return;
    }
    host.innerHTML = '<div id="eqp-wrap"><div class="eqp-card"><span>Cargando equipo y supervisores sincronizados…</span></div></div>';

    sbRpc('sst_portal_equipo_listar', { p_emp: EQ.empId }).then(function(res){
      if(!res || !res.ok){
        host.innerHTML = '<div id="eqp-wrap"><div class="eqp-card"><b>No se pudo cargar el equipo (' + _esc((res && res.error) || 'sin acceso') + ').</b></div></div>';
        return;
      }
      EQ.datos = res;
      _pintar(host);
    }).catch(function(err){
      host.innerHTML = '<div id="eqp-wrap"><div class="eqp-card"><b>Error cargando equipo: ' + _esc(err && err.message ? err.message : err) + '</b></div></div>';
    });
  }

  function _pintar(host){
    var d = EQ.datos || {};
    var emp = d.empresa || {};
    var miembros = d.miembros || [];
    var invs = d.invitaciones || [];
    var icGrp = (typeof i3dImg === 'function') ? i3dImg('busts_in_silhouette') : '👥';

    var h = '<div id="eqp-wrap">' +
      '<div class="eqp-card">' +
        '<div class="eqp-cab">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<div class="eqp-sq">' + icGrp + '</div>' +
            '<div><h2 style="margin:0;font-size:18px">Equipo y Supervisores</h2>' +
            '<small style="color:#64748B">Sincronizado con la app móvil · Puestos ocupados: <b>' + (d.usados || 0) + ' / ' + (d.tope_gestores || 1) + '</b> · Plan: <b>' + _esc(String(d.plan || 'lite').toUpperCase()) + '</b></small></div>' +
          '</div>' +
          '<button type="button" class="eqp-btn" data-eq="recargar">🔄 Actualizar</button>' +
        '</div>';

    if(d.es_dueno){
      h +=
        '<div style="border-top:1px solid #E2E8F0;padding-top:14px">' +
          '<b style="font-size:14.5px;display:block;margin-bottom:10px">➕ Invitar nuevo supervisor o segundo líder</b>' +
          '<div class="eqp-grid">' +
            '<div><label class="eqp-lab" for="eqp-correo">Correo exacto de ingreso</label><input type="email" id="eqp-correo" class="eqp-in" placeholder="supervisor@ejemplo.com"></div>' +
            '<div><label class="eqp-lab" for="eqp-doc">Documento de identidad (DNI / Cédula / CE)</label><input type="text" id="eqp-doc" class="eqp-in" placeholder="Sin puntos ni guiones"></div>' +
            '<div><label class="eqp-lab" for="eqp-nom">Nombre y apellidos completos</label><input type="text" id="eqp-nom" class="eqp-in" placeholder="Ej: Carlos Pérez Gómez"></div>' +
            '<div><label class="eqp-lab" for="eqp-papel">Rol en la empresa</label>' +
              '<select id="eqp-papel" class="eqp-in"><option value="gestor">Supervisor SSOMA</option><option value="colider">Segundo líder SSOMA</option></select></div>' +
            '<div><label class="eqp-lab" for="eqp-proy">Proyecto / Frente (opcional)</label><input type="text" id="eqp-proy" class="eqp-in" placeholder="Ej: Frente Torre A"></div>' +
            '<div><label class="eqp-lab" for="eqp-desde">Desde</label><input type="date" id="eqp-desde" class="eqp-in" value="' + _hoyISO() + '"></div>' +
            '<div><label class="eqp-lab" for="eqp-hasta">Hasta (opcional)</label><input type="date" id="eqp-hasta" class="eqp-in"></div>' +
            '<div><label class="eqp-lab" for="eqp-dias">El código vence en</label>' +
              '<select id="eqp-dias" class="eqp-in"><option value="7">7 días</option><option value="15" selected>15 días</option><option value="30">30 días</option></select></div>' +
          '</div>' +
          '<div id="eqp-msg" style="font-size:13px;font-weight:700;margin-top:10px"></div>' +
          '<div style="margin-top:12px"><button type="button" class="eqp-btn pri" data-eq="generar">Generar código de invitación ▸</button></div>' +
          '<div id="eqp-cod-out" hidden></div>' +
        '</div>';
    } else {
      h += '<div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:10px 14px;border-radius:10px;font-size:13px;color:#475569">Solo el dueño o segundo líder de la empresa puede invitar nuevos supervisores.</div>';
    }
    h += '</div>';

    /* Lista de equipo actual */
    h += '<div class="eqp-card"><b style="font-size:15px;display:block;margin-bottom:10px">👥 Tu equipo activo (' + miembros.length + ')</b>';
    if(!miembros.length){
      h += '<p style="color:#64748B;margin:0">Todavía eres el único miembro en esta obra.</p>';
    } else {
      miembros.forEach(function(m){
        var esD = (m.rol === 'dueno');
        h += '<div class="eqp-row">' +
          '<div><b>' + _esc(m.nombre) + (m.es_yo ? ' (tú)' : '') + '</b>' +
          '<div style="font-size:12px;color:#64748B">' +
            (m.correo ? _esc(m.correo) + ' · ' : '') +
            (m.dni ? 'Doc. ' + _esc(m.dni) + ' · ' : '') +
            _esc(m.puesto || (esD ? 'Líder / Dueño' : 'Supervisor SSOMA')) +
          '</div></div>' +
          '<span class="eqp-badge" style="background:' + (esD ? '#FEF3C7;color:#92400E' : '#E0F2FE;color:#075985') + '">' + (esD ? '👑 Líder / Dueño' : '🦺 Supervisor') + '</span>' +
        '</div>';
      });
    }
    h += '</div>';

    /* Invitaciones pendientes */
    if(d.es_dueno){
      h += '<div class="eqp-card"><b style="font-size:15px;display:block;margin-bottom:10px">✉️ Invitaciones pendientes (' + invs.length + ')</b>';
      if(!invs.length){
        h += '<p style="color:#64748B;margin:0">No hay códigos pendientes por canjear.</p>';
      } else {
        invs.forEach(function(inv, i){
          var cb = _invBonito(inv.codigo);
          h += '<div class="eqp-row">' +
            '<div><b>' + _esc(inv.nombre || inv.correo) + '</b> · <span style="font-family:monospace;font-weight:800;color:#0B2A3A">' + _esc(cb) + '</span>' +
            '<div style="font-size:12px;color:#64748B">' + _esc(inv.correo) + ' · Doc. ' + _esc(inv.dni) + ' · Vence: ' + _esc(String(inv.vence || '').slice(0, 10)) + '</div></div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
              '<button type="button" class="eqp-btn" style="padding:6px 10px;font-size:12px" data-eq="copiar-inv" data-i="' + i + '">📋 Copiar</button>' +
              '<button type="button" class="eqp-btn" style="padding:6px 10px;font-size:12px" data-eq="wa-inv" data-i="' + i + '">📲 WhatsApp</button>' +
              '<button type="button" class="eqp-btn pel" data-eq="revocar" data-id="' + _esc(inv.id) + '">Revocar</button>' +
            '</div>' +
          '</div>';
        });
      }
      h += '</div>';
    }
    h += '</div>';
    host.innerHTML = h;

    host.onclick = function(ev){
      var b = ev.target.closest('[data-eq]'); if(!b) return;
      var a = b.getAttribute('data-eq');
      if(a === 'recargar'){ abrirEquipoPortal(host.id); return; }
      if(a === 'copiar-inv' || a === 'wa-inv'){
        var inv = invs[parseInt(b.getAttribute('data-i'), 10)]; if(!inv) return;
        var tx = _textoInvitacion(emp.nombre, inv.papel, inv.correo, _invBonito(inv.codigo), inv.dni, inv.vence);
        if(a === 'wa-inv'){
          window.open('https://wa.me/?text=' + encodeURIComponent(tx), '_blank', 'noopener');
        } else if(navigator.clipboard){
          navigator.clipboard.writeText(tx).then(function(){ _aviso('Instrucciones copiadas al portapapeles.'); });
        }
        return;
      }
      if(a === 'revocar'){
        var invId = b.getAttribute('data-id');
        if(!confirm('¿Revocar este código de invitación? Ya no podrá usarse.')) return;
        sbRpc('sst_portal_inv_revocar', { p_emp: EQ.empId, p_inv: invId }).then(function(r){
          if(r && r.ok){ _aviso('Invitación revocada.'); abrirEquipoPortal(host.id); }
          else _aviso('No se pudo revocar.');
        });
        return;
      }
      if(a === 'generar'){
        if(EQ.enVuelo) return;
        var msg = document.getElementById('eqp-msg');
        var correo = ((document.getElementById('eqp-correo') || {}).value || '').trim().toLowerCase();
        var doc = ((document.getElementById('eqp-doc') || {}).value || '').trim();
        var nom = ((document.getElementById('eqp-nom') || {}).value || '').trim();
        var proy = ((document.getElementById('eqp-proy') || {}).value || '').trim();
        var desde = (document.getElementById('eqp-desde') || {}).value || '';
        var hasta = (document.getElementById('eqp-hasta') || {}).value || '';
        var dias = parseInt((document.getElementById('eqp-dias') || {}).value, 10) || 15;
        var papel = (document.getElementById('eqp-papel') || {}).value === 'colider' ? 'colider' : 'gestor';

        if(correo.indexOf('@') < 1 || correo.lastIndexOf('.') < correo.indexOf('@')){
          msg.style.color = '#B91C1C'; msg.textContent = 'Escribe un correo válido (exacto con el que entrará el supervisor).'; return;
        }
        if(_norm(doc).length < 6){
          msg.style.color = '#B91C1C'; msg.textContent = 'Escribe su documento de identidad (mínimo 6 caracteres, sin puntos ni guiones).'; return;
        }
        if(nom.length < 3){
          msg.style.color = '#B91C1C'; msg.textContent = 'Escribe su nombre y apellido completo.'; return;
        }
        if(hasta && desde && hasta < desde){
          msg.style.color = '#B91C1C'; msg.textContent = 'La fecha de término no puede ser anterior a la fecha de inicio.'; return;
        }

        EQ.enVuelo = true;
        b.disabled = true;
        msg.style.color = '#475569'; msg.textContent = 'Generando código…';

        sbRpc('sst_invitar', {
          p_emp: EQ.empId, p_correo: correo, p_dni: doc, p_nombre: nom,
          p_proyecto: proy || null, p_desde: desde || null, p_hasta: hasta || null,
          p_dias: dias, p_papel: papel
        }).then(function(j){
          EQ.enVuelo = false; b.disabled = false;
          if(!j || !j.ok){
            var q = (j && j.error) || '';
            msg.style.color = '#B91C1C';
            msg.textContent =
              q === 'no_eres_dueno'   ? 'Solo quien activó el plan o un segundo líder puede nombrar supervisores.' :
              q === 'ruc_invalido'    ? 'Tu empresa no tiene un identificador fiscal válido (RUC, RNC, RUT, NIT, etc.). Verifica que el SQL multipaís haya sido aplicado.' :
              q === 'correo_invalido' ? 'Ese correo no se ve bien escrito. Revísalo.' :
              q === 'doc_invalido'    ? 'El documento de identidad es muy corto (mínimo 6 caracteres).' :
              q === 'ya_invitado'     ? 'Ya existe una invitación activa para ese correo. Revócala o reenvíala abajo.' :
              q === 'tope_gestores'   ? 'Tienes ocupados todos tus puestos de gestión (' + (j.tope || 1) + ').' :
              q === 'sin_sesion'      ? 'Vuelve a iniciar sesión.' :
              'No se pudo generar el código.';
            return;
          }
          msg.textContent = '';
          var cb = _invBonito(j.codigo);
          var tx = _textoInvitacion(emp.nombre, j.papel || papel, correo, cb, doc, j.vence);
          var out = document.getElementById('eqp-cod-out');
          if(out){
            out.hidden = false;
            out.innerHTML =
              '<div class="eqp-cod-box">' +
                '<b>Listo. Este es el código para ' + _esc(nom) + ':</b>' +
                '<div style="font-size:30px;font-weight:900;letter-spacing:.12em;margin:10px 0">' + _esc(cb) + '</div>' +
                '<div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap">' +
                  '<button type="button" class="eqp-btn pri" id="eqp-wa-nuevo">📲 Mandar por WhatsApp</button>' +
                  '<button type="button" class="eqp-btn" id="eqp-cp-nuevo">📋 Copiar instrucciones</button>' +
                '</div>' +
              '</div>';
            document.getElementById('eqp-wa-nuevo').onclick = function(){ window.open('https://wa.me/?text=' + encodeURIComponent(tx), '_blank', 'noopener'); };
            document.getElementById('eqp-cp-nuevo').onclick = function(){
              if(navigator.clipboard) navigator.clipboard.writeText(tx).then(function(){ _aviso('Instrucciones copiadas.'); });
            };
          }
          ['eqp-correo', 'eqp-doc', 'eqp-nom', 'eqp-proy'].forEach(function(id){ var el = document.getElementById(id); if(el) el.value = ''; });
          /* Recargar lista de invitaciones en segundo plano sin borrar la caja del código recién generado */
          sbRpc('sst_portal_equipo_listar', { p_emp: EQ.empId }).then(function(res2){ if(res2 && res2.ok) EQ.datos = res2; });
        }).catch(function(err){
          EQ.enVuelo = false; b.disabled = false;
          msg.style.color = '#B91C1C'; msg.textContent = 'Error de red al invitar: ' + (err && err.message ? err.message : err);
        });
      }
    };
  }

  window.OBRASST_EQUIPO_PORTAL = { abrir: abrirEquipoPortal };
  window.abrirEquipoPortal = abrirEquipoPortal;
})();
