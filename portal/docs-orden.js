/* ═══════════════════════════════════════════════════════════════════════════
   OBRASST · PORTAL WEB · Corrección de Carga de Documentos (sin esperas de 10 min)
   + Orden Automático por Año › Mes › Tipo de Charla › Frente
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var MESES_NOM = ['01 Enero','02 Febrero','03 Marzo','04 Abril','05 Mayo','06 Junio','07 Julio','08 Agosto','09 Septiembre','10 Octubre','11 Noviembre','12 Diciembre'];

  function _esc(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _urlSegura(u){
    return /^(https:\/\/|http:\/\/localhost|blob:)/i.test(String(u || '').trim());
  }

  /* Clasifica automáticamente Año, Mes, Tipo oficial de charla y Frente sin hacerlo a mano */
  function clasificarDocumentoAuto(doc){
    var nom = String((doc && doc.nombre) || '');
    var hoja = String((doc && doc.hoja) || 'General');
    var nota = String((doc && doc.nota) || '');
    var texto = (nom + ' ' + hoja + ' ' + nota).toLowerCase();

    var mFecha = nom.match(/(20\d{2})[-_\.](\d{2})[-_\.](\d{2})/) || String((doc && doc.creado) || '').match(/(20\d{2})-(\d{2})/);
    var hoy = new Date();
    var anio = mFecha ? mFecha[1] : String(hoy.getFullYear());
    var mesNum = mFecha ? Math.max(1, Math.min(12, parseInt(mFecha[2], 10) || (hoy.getMonth() + 1))) : (hoy.getMonth() + 1);
    var mesLbl = MESES_NOM[mesNum - 1];

    var esCharla = /asistencia|charla|reuni[oó]n|inicio de jornada|difusi[oó]n|sensibiliz|retroaliment|inducci[oó]n|capacitaci|taller|entrenamiento|parada de seguridad|pausa activa|vial/.test(texto);
    var tipo = hoja || 'General';
    if(esCharla){
      if(/hombre nuevo|inducci[oó]n/.test(texto))                  tipo = 'a) Inducción';
      else if(/capacitaci[oó]n/.test(texto))                       tipo = 'b) Capacitaciones específicas';
      else if(/sensibiliz|retroaliment/.test(texto))               tipo = 'c) Sensibilización y Retroalimentación';
      else if(/taller/.test(texto))                                tipo = 'd) Talleres';
      else if(/entrenamiento/.test(texto))                         tipo = 'e) Entrenamiento';
      else if(/parada de seguridad/.test(texto))                   tipo = 'f) Paradas de seguridad';
      else if(/comit[eé]|subcomit/.test(texto))                    tipo = 'g) Reunión SST / Comité Técnico SST';
      else if(/vial|tr[aá]nsito/.test(texto))                      tipo = 'h) Reunión de Seguridad Vial';
      else if(/difusi[oó]n|msds|sga|nfpa|pets|risst/.test(texto))  tipo = 'i) Difusión';
      else if(/pausa activa|din[aá]mica/.test(texto))              tipo = 'Pausas Activas y Dinámicas';
      else                                                         tipo = 'j) Reunión de inicio de jornada';
    }

    var frente = 'Frente General';
    var partes = nom.split(/\s+[-–]\s+/);
    if(partes.length >= 3){
      frente = partes[partes.length - 1].replace(/\.[a-z0-9]{2,5}$/i, '').trim() || 'Frente General';
    } else {
      var mFr = (nom + ' ' + nota).match(/frente[:\s-]+([a-z0-9ÁÉÍÓÚÑ\s]{2,28})/i);
      if(mFr && mFr[1]) frente = mFr[1].trim();
    }

    return { esCharla: esCharla, anio: anio, mes: mesLbl, tipo: tipo, frente: frente };
  }

  /* Carga blindada: caché local al instante + RPC rápido + refresco de token ante 401 + reintento ágil (1.2s / 2.5s) */
  function cargarDocsBlindado(empId, onDatos, onEstado){
    if(!empId){ if(onEstado) onEstado('Selecciona una obra activa.'); return Promise.resolve([]); }
    var cacheKey = 'obrasst_docs_cache_' + empId;
    var huboCache = false;
    try{
      var raw = localStorage.getItem(cacheKey);
      if(raw){
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length){ huboCache = true; if(onDatos) onDatos(parsed, true); }
      }
    }catch(_c){}

    function pedirUnaVez(intento){
      var vencido = false;
      var timer = setTimeout(function(){ vencido = true; }, 10000);
      /* 23/11/2026 · directo a sst_doc (la función sst_docs_listar_rapido no está en el servidor: cada carga pedía en vano) */
      var prom = (typeof sbGet === 'function')
        ? sbGet('sst_doc?empresa=eq.' + encodeURIComponent(empId) + '&select=id,hoja,nombre,url,nota,creado&order=creado.desc&limit=3000')
        : Promise.reject(new Error('Sin cliente Supabase'));

      return Promise.race([
        prom,
        new Promise(function(_, rej){ setTimeout(function(){ rej(new Error('tiempo_agotado')); }, 10500); })
      ]).then(function(lista){
        clearTimeout(timer);
        if(vencido && huboCache) return [];
        lista = Array.isArray(lista) ? lista : [];
        try{ localStorage.setItem(cacheKey, JSON.stringify(lista.slice(0, 3000))); }catch(_s){}
        if(onDatos) onDatos(lista, false);
        return lista;
      }).catch(function(err){
        clearTimeout(timer);
        var msg = String((err && (err.message || err.msg || err)) || '');
        if(intento < 2){
          var prep = (/(401|jwt|expired|token|sin_acceso)/i.test(msg) && typeof refrescarToken === 'function')
            ? refrescarToken().catch(function(){})
            : Promise.resolve();
          return prep.then(function(){
            return new Promise(function(res){ setTimeout(res, intento === 0 ? 1200 : 2500); }).then(function(){
              return pedirUnaVez(intento + 1);
            });
          });
        }
        if(!huboCache && onEstado){
          onEstado('No se pudieron cargar los documentos (' + (msg === 'tiempo_agotado' ? 'servidor lento' : (msg.slice(0, 70) || 'error de red')) + ').');
        }
        return [];
      });
    }

    return pedirUnaVez(0);
  }

  /* Árbol automático: Año › Mes › Tipo de Charla › Frente */
  function renderArbolCharlasHTML(docs){
    var arbol = {};
    var totalCharlas = 0;
    (docs || []).forEach(function(d){
      var cl = clasificarDocumentoAuto(d);
      if(!cl.esCharla) return;
      totalCharlas++;
      if(!arbol[cl.anio]) arbol[cl.anio] = {};
      if(!arbol[cl.anio][cl.mes]) arbol[cl.anio][cl.mes] = {};
      if(!arbol[cl.anio][cl.mes][cl.tipo]) arbol[cl.anio][cl.mes][cl.tipo] = [];
      arbol[cl.anio][cl.mes][cl.tipo].push({ doc: d, frente: cl.frente });
    });

    if(!totalCharlas){
      return '<div style="padding:14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;font-family:var(--letra)!important;font-size:13px;color:#475569;margin-bottom:14px">' +
        'Los registros de charlas (Reunión de inicio de jornada, Difusiones, Sensibilizaciones, Capacitaciones) se ordenarán aquí automáticamente por <b>Año › Mes › Tipo › Frente</b> en cuanto se suban.</div>';
    }

    var h = '<div class="docs-arbol-wrap" style="font-family:var(--letra)!important;margin-bottom:16px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px">' +
        '<b style="font-size:14px;color:#08222F">🗂️ Charlas y Asistencias ordenadas automáticamente (' + totalCharlas + ')</b>' +
        '<small style="color:#64748B">Año › Mes › Tipo de charla › Frente</small>' +
      '</div>';

    Object.keys(arbol).sort().reverse().forEach(function(anio, aIdx){
      h += '<details' + (aIdx === 0 ? ' open' : '') + ' style="background:#fff;border:1px solid rgba(11,42,58,.12);border-radius:12px;padding:10px 14px;margin-bottom:8px">' +
        '<summary style="cursor:pointer;font-weight:800;font-size:14px;color:#0B2A3A">📁 ' + _esc(anio) + '</summary><div style="margin:8px 0 0 14px">';
      Object.keys(arbol[anio]).sort().reverse().forEach(function(mes, mIdx){
        h += '<details' + (aIdx === 0 && mIdx === 0 ? ' open' : '') + ' style="margin-bottom:6px;border-left:2px solid #FFC933;padding-left:10px">' +
          '<summary style="cursor:pointer;font-weight:700;font-size:13.5px;color:#08222F">📂 ' + _esc(mes) + '</summary><div style="margin:6px 0 0 10px">';
        Object.keys(arbol[anio][mes]).sort().forEach(function(tipo){
          var items = arbol[anio][mes][tipo];
          h += '<details style="margin-bottom:5px"><summary style="cursor:pointer;font-size:13px;font-weight:700;color:#0369A1">🏷️ ' + _esc(tipo) + ' (' + items.length + ')</summary><div style="margin:5px 0 6px 14px;display:flex;flex-direction:column;gap:4px">';
          items.forEach(function(it){
            var urlOk = _urlSegura(it.doc.url);
            h += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;font-size:12.5px">' +
              '<span>📄 <b>' + _esc(it.doc.nombre) + '</b> <small style="background:#E0F2FE;color:#0369A1;padding:2px 6px;border-radius:6px;font-weight:700">' + _esc(it.frente) + '</small></span>' +
              (urlOk ? '<a href="' + _esc(it.doc.url) + '" target="_blank" rel="noopener" style="font-weight:700;color:#0B2A3A;text-decoration:none">Abrir ↗</a>' : '') +
            '</div>';
          });
          h += '</div></details>';
        });
        h += '</div></details>';
      });
      h += '</div></details>';
    });
    return h + '</div>';
  }

  window.OBRASST_DOCS_ORDEN = {
    clasificarDocumentoAuto: clasificarDocumentoAuto,
    cargarDocsBlindado: cargarDocsBlindado,
    renderArbolCharlasHTML: renderArbolCharlasHTML
  };
})();
