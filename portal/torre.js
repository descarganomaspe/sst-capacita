/* ══════════════════════════════════════════════════════════════════
   OBRASST · el portal · LA TORRE DE CONTROL (15/10/2026, lote 12)
   Marcelo (15/10): «se tenía el faro o no sé cómo se llamaba, que era
   una plataforma donde veía el líder como tipo dashboard un resumen…
   mejorarlo de acuerdo a lo que se tenga en web… que sea netamente
   unísono, un mismo sentido».
   Era: la app con su Torre de control (todas las obras, seis páginas,
   metas que pone el gerente) y la web con un «Resumen ejecutivo» de UNA
   obra, con otras cuentas. Dos tableros que decían cosas distintas.
   Ahora es UNA Torre: la de la app, tal cual —portal/torre-app.js la
   saca de la app con armar.py—, con sus mismas cifras, sus mismas
   páginas y sus mismas metas (sst_estado «torre»: la meta que el líder
   cambia aquí, la ve igual en la app, y al revés).
   Aquí va solo lo que depende de la web: dónde se pinta y las funciones
   _tor… (la cuenta, guardar, el aviso) que la app tiene para sí.
   ══════════════════════════════════════════════════════════════════ */
var TW = { caja:null, css:false, ultimo:0 };

/* ── lo que la Torre le pide a la web (en la app son las suyas) ── */
/* la empresa (la madre) aunque esté elegida una de sus obras: las metas de la Torre son de toda la empresa, como en la app */
function _torEmp(){
  var o = (typeof YO!=='undefined' && YO) ? YO.obra : null; if(!o) return null;
  return o.padre_id ? { id:o.padre_id, nombre:o.padre_nombre || o.nombre, codigo:o.codigo, obra:o.id } : { id:o.id, nombre:o.nombre, codigo:o.codigo };
}
function _torConCuenta(){ return !!(typeof TOK!=='undefined' && TOK && TOK.access_token); }
function _torCorreo(){ return (typeof TOK!=='undefined' && TOK && TOK.correo) || ''; }
function _torYo(){ return (typeof YO!=='undefined' && YO && YO.nombre) || _torCorreo(); }
function _torPapel(){ return 'LÍDER SSOMA'; }
function _torPost(tabla, obj){
  return sbFetch(SB.url+'/rest/v1/'+tabla, {method:'POST', body:JSON.stringify(obj)})
    .then(function(r){ return r.ok ? true : Promise.reject(r.status); });
}
/* el PATCH de la web devuelve las filas tocadas: si no tocó ninguna, no se guardó */
function _torPatch(ruta, obj){ return sbPatch(ruta, obj).then(function(f){ return (Array.isArray(f) && f.length) ? true : Promise.reject(0); }); }
function _torAviso(tit, tx){ toast(tit + (tx ? ' · ' + tx : '')); }
/* la Torre está a la vista mientras su sección siga pintada */
function _torActiva(){ return !!(TW.caja && document.body.contains(TW.caja) && TW.caja.querySelector('#tc-main')); }
/* la web no cambia de piel: la Torre se pinta dentro de su sección */
function _torCasco(entra){
  var w = document.getElementById('tcw'); if(!w) return;
  if(entra && w.getBoundingClientRect().width < 900) w.classList.add('sinrail');
}
function _torRailCambiar(){ var w = document.getElementById('tcw'); if(w) w.classList.toggle('sinrail'); }
/* «Volver al inicio» (sin proyectos): a «Obras y equipo», donde se crean */
function _torAlInicio(){ try{ navegar('equipo'); }catch(_e){} }

function _twEstilos(){
  if(TW.css || document.getElementById('tw-css')) { TW.css = true; return; }
  var s = document.createElement('style'); s.id = 'tw-css';
  /* el CSS de la Torre de la app, y lo que cambia por estar dentro de una sección de la web: sin la altura de pantalla
     entera, con sus esquinas, y la cabecera y la columna sin pegarse arriba (la web ya tiene la suya) */
  s.textContent = TORRE_APP.css + '\n' +
    '.tcw{border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(11,26,36,.12);margin:0 0 16px}' +
    '.tcw .tc{min-height:0}.tcw .tc-top{position:static}.tcw .tc-rail{position:static;max-height:none}' +
    '.tcw .tc-main{padding:18px 18px 28px}.tcw .tc-cuerpo{min-height:420px}' +
    '@media print{.tcw{box-shadow:none;border-radius:0}.tcw .tc-top,.tcw .tc-rail,.tcw .tc-chips{display:none!important}}';
  document.head.appendChild(s); TW.css = true;
}

/* la sección «Torre de control» del líder: la misma cabecera de la app (sin «Salir»: aquí se sale por el menú) */
function torrewVista(caja){
  _twEstilos();
  TW.caja = caja;
  caja.innerHTML =
    '<div class="tcw" id="tcw"><div class="tc">' +
      '<div class="tc-top">' +
        '<button type="button" class="tc-bt" onclick="tcRail()" title="Mostrar u ocultar la columna" aria-label="Columna">☰</button>' +
        '<span class="tc-marca">◆ OBRASST</span>' +
        '<span class="tc-titp" id="tc-titp">Resumen ejecutivo</span>' +
        '<span class="der">' +
          '<select class="tc-bt" id="tc-mes-sel" onchange="tcPonerMes(this.value)" aria-label="Mes de cierre"></select>' +
          '<button type="button" class="tc-bt" onclick="tcExcel()" title="Descargar en Excel">↓<span class="lb"> Excel</span></button>' +
          '<button type="button" class="tc-bt" onclick="tcPDF()" title="Imprimir o guardar en PDF">⎙<span class="lb"> PDF</span></button>' +
          '<button type="button" class="tc-bt" id="tc-refbt" onclick="tcRefrescar()" title="Volver a pedir los datos">↻<span class="lb"> Actualizar</span></button>' +
          '<span class="tc-fresco" id="tc-fresco"></span>' +
          '<button type="button" class="tc-bt" onclick="tcVer(\'cfg\')" title="Cambiar las metas">⚙<span class="lb"> Qué medir</span></button>' +
          '<span class="tc-yo" id="tc-yo"></span>' +
          '<span class="tc-badge" id="tc-papel">LÍDER SSOMA</span>' +
        '</span>' +
      '</div>' +
      '<div class="tc-cuerpo"><aside class="tc-rail" id="tc-rail"></aside><main class="tc-main" id="tc-main"></main></div>' +
    '</div></div>' +
    '<p class="ayuda" style="margin:-6px 0 16px">Es la misma Torre de la app: las mismas cifras, las mismas páginas y las mismas metas. ' +
      'Lo que cambies en «Qué medir» lo ve igual quien la abra en el celular.</p>' +
    '<div id="tw-hoy"></div>';
  TORRE_APP.entrar();
  /* lo de siempre del inicio: lo que espera tu firma (arriba) y lo programado para hoy en la obra abierta (debajo) */
  try{ if(typeof hoyProgramadoEn === 'function') hoyProgramadoEn($('tw-hoy')); }catch(_hp){}
  try{ if(typeof prqAvisoInicio === 'function') prqAvisoInicio(caja); }catch(_rq){}
  /* lo que llega en vivo de la obra abierta: se vuelve a pedir, sin tapar lo que se ve y no más de una vez cada 30 s */
  VISTA.recargar = function(){
    if(!_torActiva()) return;
    var S = TORRE_APP.estado();
    if(S.cargando || Date.now() - (TW.ultimo || 0) < 30000) return;
    TW.ultimo = Date.now(); TORRE_APP.refrescar();
  };
}
