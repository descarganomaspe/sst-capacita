/* ══ PELIGROS DEL SITIO — PROTOTIPO INTERNO MEJORADO (Orden 18 · 12/11/2026) ══════════════════════════════════════
   · Prototipo local interno ampliado en portal/ (cero toque a zonas reservadas de Claude y cero publicación).
   · Mide:
     (a) Altitud estimada por tile AWS Terrarium USGS SRTM ~30 m (redondeada a enteros y rotulada «estimado»).
     (b) Proximidad geométrica a líneas HIDROGRAFIA_100K (IGN) con radar visual concéntrico (500 m, 1 km, 2 km, 3 km).
     (c) Matriz de Peligros del Entorno (IPERC Línea Base sugerido): altitud, hidrografía, sismo E.030 y El Niño 2026-2027.
     (d) Plan de Contingencia del Sitio preliminar: rutas de evacuación a cota alta y puntos de reunión.
     (e) GPS del navegador («Usar mi GPS») y exportación de Ficha Técnica del Sitio en PNG.
   · Mantiene E.030 como «por verificar en Anexo II oficial». Ningún fallo de red crea filas IPERC automáticas. */
var PSITIO_VER = '0';
var PSW = {
  caja: null, coord: '-11.9365, -76.7010', res: null, err: '', cargando: false, borrador: [],
  ejemplos: [
    { k:'lima', nom:'Ejemplo simulado · Costa — Lima Cercado', coord:'-12.0464, -77.0428', ubigeo:'150101', nota:'Costa urbana' },
    { k:'pasco', nom:'Ejemplo simulado · Sierra alta — Cerro de Pasco', coord:'-10.6836, -76.2561', ubigeo:'190101', nota:'Altitud referencial' },
    { k:'chosica', nom:'Ejemplo simulado · Quebrada cercana — Lurigancho-Chosica', coord:'-11.9365, -76.7010', ubigeo:'150118', nota:'Escenario simulado hipotético pendiente de validación en campo' }
  ]
};

function _psCss(){
  if(document.getElementById('ps-css')) return;
  var s = document.createElement('style'); s.id = 'ps-css';
  s.textContent = [
    '.ps-wrap{display:grid;gap:14px;max-width:1020px;margin:0 auto}',
    '.ps-aviso{padding:12px 16px;border-radius:12px;background:rgba(255,243,205,.9);border:1.5px solid #ffeeba;color:#856404;font-size:13px;line-height:1.45}',
    '.ps-aviso b{display:block;font-size:14px;color:#533f03;margin-bottom:3px}',
    '.ps-row{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}',
    '.ps-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}',
    '.ps-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}',
    '.ps-card{padding:14px 16px;border-radius:12px;background:var(--fondo,#f8f9fa);border:1px solid var(--raya,#dee2e6);display:grid;gap:6px}',
    '.ps-card b{font-size:14px}.ps-card .big{font-size:24px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.1}',
    '.ps-card small{font-size:12px;color:var(--gris,#6c757d);line-height:1.4}',
    '.ps-radar-box{position:relative;background:#1a1d20;border-radius:12px;overflow:hidden;min-height:280px;display:flex;align-items:center;justify-content:center}',
    '.ps-radar-box canvas{max-width:100%;height:auto;display:block}',
    '.ps-tabla{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:8px}',
    '.ps-tabla th,.ps-tabla td{padding:8px 10px;border:1px solid var(--raya,#dee2e6);text-align:left}',
    '.ps-tabla th{background:rgba(0,0,0,.03);font-weight:700}',
    '.ps-btn{padding:8px 14px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;border:1px solid transparent;transition:all .15s}',
    '.ps-btn-pri{background:#1971c2;color:#fff}.ps-btn-pri:hover{background:#1864ab}',
    '.ps-btn-sec{background:var(--blanco,#fff);border-color:var(--raya,#ced4da);color:var(--texto,#212529)}',
    '.ps-btn-sec:hover{background:#f1f3f5}'
  ].join('\n');
  document.head.appendChild(s);
}

function psParseCoord(txt){
  var m = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(String(txt || ''));
  if(!m) return null;
  var lat = parseFloat(m[1]), lon = parseFloat(m[2]);
  if(!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat: lat, lon: lon };
}

function psTileDeCoord(lat, lon, z){
  z = z || 12;
  var n = Math.pow(2, z), xfloat = ((lon + 180) / 360) * n;
  var rad = lat * Math.PI / 180;
  var yfloat = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
  var xt = Math.floor(xfloat), yt = Math.floor(yfloat);
  var px = Math.min(255, Math.max(0, Math.floor((xfloat - xt) * 256)));
  var py = Math.min(255, Math.max(0, Math.floor((yfloat - yt) * 256)));
  return { z:z, x:xt, y:yt, px:px, py:py, url:'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + z + '/' + xt + '/' + yt + '.png' };
}

function psTerrariumMetros(r, g, b){
  return Math.round((r * 256 + g + b / 256) - 32768);
}

function _psHaversine(lat1, lon1, lat2, lon2){
  var R = 6371000, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function _psDistLinea(lat, lon, paths){
  var min = Infinity, bestPt = null;
  (paths || []).forEach(function(path){
    for(var i = 0; i < path.length; i++){
      var d = _psHaversine(lat, lon, path[i][1], path[i][0]);
      if(d < min){ min = d; bestPt = { lat: path[i][1], lon: path[i][0] }; }
    }
  });
  return { dist: min, pt: bestPt };
}

function _psConsultarAltitud(lat, lon){
  var tl = psTileDeCoord(lat, lon, 12);
  return fetch(tl.url).then(function(r){
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.blob();
  }).then(function(blob){
    return new Promise(function(ok, mal){
      var im = new Image(), u = URL.createObjectURL(blob);
      im.onload = function(){
        try{
          var cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
          var ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0, 256, 256);
          var px = ctx.getImageData(tl.px, tl.py, 1, 1).data;
          URL.revokeObjectURL(u);
          ok({ ok:true, m:psTerrariumMetros(px[0], px[1], px[2]), tile:tl.z + '/' + tl.x + '/' + tl.y + ' px(' + tl.px + ',' + tl.py + ')' });
        }catch(e){ URL.revokeObjectURL(u); mal(e); }
      };
      im.onerror = function(){ URL.revokeObjectURL(u); mal(new Error('tile_img')); };
      im.src = u;
    });
  }).catch(function(){
    return { ok:false, m:null, tile:tl.z + '/' + tl.x + '/' + tl.y };
  });
}

function _psConsultarHidro(lat, lon){
  var d = 0.03; /* filtro interno ~3 km */
  var geom = encodeURIComponent((lon - d).toFixed(5) + ',' + (lat - d).toFixed(5) + ',' + (lon + d).toFixed(5) + ',' + (lat + d).toFixed(5));
  var url = 'https://www.idep.gob.pe/geoportal/rest/services/SERVICIOS_IGN/HIDROGRAFIA_100K/FeatureServer/0/query?where=1%3D1&geometry=' + geom +
            '&geometryType=esriGeometryEnvelope&inSR=4326&outSR=4326&outFields=NOMBRE,NOM_TIPO,ESTADO&returnGeometry=true&f=json';
  return fetch(url).then(function(r){
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function(j){
    var L = (j && Array.isArray(j.features)) ? j.features : [];
    var trazos = [];
    L.forEach(function(ft){
      var a = ft.attributes || {}, calc = _psDistLinea(lat, lon, ft.geometry && ft.geometry.paths);
      if(isFinite(calc.dist) && calc.dist <= 3000){
        trazos.push({
          nom: a.NOMBRE || a.NOM_TIPO || 'Corriente cartografiada',
          tipo: a.NOM_TIPO || '',
          est: a.ESTADO || '',
          dist: Math.round(calc.dist),
          pt: calc.pt
        });
      }
    });
    trazos.sort(function(a, b){ return a.dist - b.dist; });
    return { ok:true, trazos:trazos };
  }).catch(function(){
    return { ok:false, trazos:[] };
  });
}

function psAnalizarSitio(coordTxt){
  var pt = psParseCoord(coordTxt);
  if(!pt){
    PSW.err = 'Ingresa latitud y longitud válidas (ej. -11.9365, -76.7010).';
    PSW.res = null;
    _psPintar();
    return Promise.resolve(null);
  }
  PSW.err = ''; PSW.coord = pt.lat + ', ' + pt.lon; PSW.cargando = true; PSW.borrador = [];
  _psPintar();
  return Promise.all([_psConsultarAltitud(pt.lat, pt.lon), _psConsultarHidro(pt.lat, pt.lon)]).then(function(r){
    PSW.cargando = false;
    PSW.res = {
      lat: pt.lat, lon: pt.lon, fecha: (typeof hoyISO === 'function' ? hoyISO() : new Date().toISOString().slice(0, 10)),
      alt: r[0], hidro: r[1], e030: 'por verificar en Anexo II oficial'
    };
    _psPintar();
    return PSW.res;
  });
}

/* ════ RADAR SPATIAL CANVAS ════ */
function psDibujarRadar(canvas, res){
  if(!canvas || !res) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width = 460, H = canvas.height = 300;
  ctx.fillStyle = '#161a1e';
  ctx.fillRect(0, 0, W, H);

  var cx = W / 2, cy = H / 2;
  var maxM = 3000;
  var radioMax = Math.min(W, H) / 2 - 25;

  /* Anillos concéntricos */
  var anillos = [500, 1000, 2000, 3000];
  ctx.lineWidth = 1;
  anillos.forEach(function(m){
    var r = (m / maxM) * radioMax;
    ctx.strokeStyle = m === 500 ? 'rgba(255, 107, 107, 0.4)' : 'rgba(255, 255, 255, 0.12)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#868e96'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(m >= 1000 ? (m / 1000) + ' km' : m + ' m', cx + r + 3, cy - 3);
  });
  ctx.setLineDash([]);

  /* Ejes N-S E-O */
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - radioMax); ctx.lineTo(cx, cy + radioMax);
  ctx.moveTo(cx - radioMax, cy); ctx.lineTo(cx + radioMax, cy);
  ctx.stroke();

  /* Puntos hidrográficos IGN */
  if(res.hidro && res.hidro.ok && res.hidro.trazos.length){
    res.hidro.trazos.forEach(function(tr, idx){
      var d = tr.dist;
      if(d > maxM) return;
      var rPix = (d / maxM) * radioMax;
      /* Estimación de ángulo relativa basada en diferencia lon/lat si hay punto, sino angular uniforme */
      var ang = (idx * 0.8) + (tr.nom.length % 5);
      if(tr.pt){
        ang = Math.atan2(tr.pt.lat - res.lat, tr.pt.lon - res.lon);
      }
      var px = cx + Math.cos(ang) * rPix;
      var py = cy - Math.sin(ang) * rPix;

      /* Trazo hacia el punto */
      ctx.strokeStyle = d < 500 ? 'rgba(255, 107, 107, 0.6)' : 'rgba(77, 171, 247, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

      /* Punto de corriente */
      ctx.fillStyle = d < 500 ? '#ff6b6b' : '#339af0';
      ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();

      /* Etiqueta */
      ctx.fillStyle = '#e9ecef'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(tr.nom + ' (~' + tr.dist + ' m)', px, py - 7);
    });
  }

  /* Centro: Obra / Frente GPS */
  ctx.fillStyle = '#ffd43b';
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#ffe066'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('📍 Obra / Frente GPS', cx, cy + 18);
}

/* ════ GENERACIÓN DE BORRADOR IPERC AMPLIADO ════ */
function psGenerarBorrador(){
  var R = PSW.res; if(!R || (!R.alt.ok && !R.hidro.ok)) return [];
  var out = [];
  if(R.alt.ok){
    out.push({
      origen: 'peligros-sitio-etapa1', estado: 'sugerido_por_confirmar', confirmado: false,
      peligro: 'Condición geográfica / altitud estimada (~' + R.alt.m + ' m s. n. m.)',
      riesgo: (R.alt.m > 2500 ? 'Exposición a hipoxia hipobárica, frío extremo y fatiga acelerada' : 'Exposición a radiación UV y clima local'),
      consecuencia: 'Mal agudo de montaña, hipotermia, quemaduras solares',
      controles: 'Aclimatación progresiva, bloqueador solar FPS 30+, ropa térmica y pausas según D.S. 024-2016-EM',
      observacion: (R.alt.m > 2500 ? 'Altitud estimada > 2 500 m: supuesto minero a verificar en D.S. 024-2016-EM Anexo 16-A y evaluación de profesional/médico ocupacional.' : 'Altitud estimada (' + R.alt.m + ' m, Terrarium ~30 m): validar condiciones climáticas locales.'),
      norma_estado: 'por verificar'
    });
  }
  if(R.hidro.ok && R.hidro.trazos.length){
    var top = R.hidro.trazos[0];
    out.push({
      origen: 'peligros-sitio-etapa1', estado: 'sugerido_por_confirmar', confirmado: false,
      peligro: 'Proximidad geométrica a línea cartografiada (' + top.nom + ' ~' + top.dist + ' m)',
      riesgo: 'Posible escorrentía superficial o crecida estacional en caso de precipitaciones extraordinarias',
      consecuencia: 'Afectación a frentes de trabajo, atrapamiento de maquinaria, erosión de talud',
      controles: 'Vigilancia de cuenca alta, campamentos y acopios fuera de faja marginal, plan de contingencia específico',
      observacion: 'Filtro interno IGN HIDROGRAFIA_100K: no confirma cauce ni predice inundación/huaico; requiere inspección en campo.',
      norma_estado: 'por verificar'
    });
  }
  /* Peligros generales del entorno */
  out.push({
    origen: 'peligros-sitio-etapa1', estado: 'sugerido_por_confirmar', confirmado: false,
    peligro: 'Sismicidad de la zona (Norma Técnica E.030)',
    riesgo: 'Movimiento telúrico severo durante la jornada laboral',
    consecuencia: 'Colapso de estructuras provisionales, caída de materiales, pánico',
    controles: 'Puntos de encuentro señalizados, anclaje de andamios, simulacros periódicos (E.030 por verificar distrito)',
    observacion: 'Zona sísmica referencial; validar categorización en Anexo II oficial de la Norma E.030.',
    norma_estado: 'por verificar'
  });
  out.push({
    origen: 'peligros-sitio-etapa1', estado: 'sugerido_por_confirmar', confirmado: false,
    peligro: 'Precipitaciones extraordinarias / Escenario El Niño 2026-2027',
    riesgo: 'Lluvias intensas imprevistas, anegamiento de excavaciones y zanjas',
    consecuencia: 'Derrumbe de taludes no entibados, electrocución por líneas húmedas',
    controles: 'Drenaje perimetral, entibado de zanjas > 1.5 m (G.050), desconexión de tableros a la intemperie',
    observacion: 'Alerta preventiva según R.M. 790-2026/MINSA y avisos estacionales ENFEN/SENAMHI.',
    norma_estado: 'por verificar'
  });

  PSW.borrador = out;
  _psPintar();
  return out;
}

function psUsarGPS(){
  if(!navigator.geolocation){
    if(typeof toast === 'function') toast('Tu navegador no soporta geolocalización.');
    return;
  }
  if(typeof toast === 'function') toast('Obteniendo ubicación GPS de tu equipo...');
  navigator.geolocation.getCurrentPosition(function(pos){
    var c = pos.coords.latitude.toFixed(5) + ', ' + pos.coords.longitude.toFixed(5);
    PSW.coord = c;
    psAnalizarSitio(c);
  }, function(err){
    if(typeof toast === 'function') toast('No se pudo obtener el GPS: ' + err.message);
  }, { enableHighAccuracy:true, timeout:8000 });
}

function psDescargarFicha(){
  var cv = document.getElementById('ps-radar-canvas');
  if(!cv) return;
  try {
    var a = document.createElement('a');
    a.download = 'informe-terreno-sitio-' + (PSW.coord.replace(/[^0-9.-]/g, '_')) + '.png';
    a.href = cv.toDataURL('image/png');
    a.click();
    if(typeof toast === 'function') toast('Ficha gráfica del terreno descargada.');
  } catch(e) {
    if(typeof toast === 'function') toast('No se pudo descargar la ficha.');
  }
}

function vistaPeligrosSitio(caja){
  _psCss(); PSW.caja = caja;
  var ac = $('acciones'); if(ac) ac.innerHTML = '';
  _psPintar();
}

function _psPintar(){
  var caja = PSW.caja; if(!caja || !document.body.contains(caja)) return;
  var R = PSW.res;
  var h = '<div class="ps-wrap" id="ps-raiz">';
  h += '<div class="tarj"><div class="tarj-cuerpo"><h2>🗺️ Peligros del sitio y Contingencia <span class="pill ojo">Prototipo ampliado</span></h2>' +
       '<p class="sub" style="margin:2px 0 8px">Georreferencia, radar de proximidad hidrográfica, matriz de peligros del entorno y plan de contingencia preliminar.</p>' +
       '<div class="ps-aviso" role="note"><b>⚠️ Aviso obligatorio:</b> Ficha orientativa del software con fuentes públicas — <b>no constituye estudio geotécnico, hidrológico ni consultoría</b>; el supervisor debe validar y confirmar cada peligro en campo.</div>' +
       '<div class="ps-row" style="margin-top:12px"><div style="flex:1 1 260px"><label for="ps-coord">Coordenadas del proyecto (latitud, longitud)</label>' +
       '<input id="ps-coord" value="' + esc(PSW.coord) + '" placeholder="-11.9365, -76.7010"></div>' +
       '<button type="button" class="ps-btn ps-btn-pri" id="ps-go"' + (PSW.cargando ? ' disabled' : '') + '>' + (PSW.cargando ? 'Consultando…' : 'Consultar sitio') + '</button>' +
       '<button type="button" class="ps-btn ps-btn-sec" onclick="psUsarGPS()">📍 Usar mi GPS aquí</button></div>' +
       '<div class="ps-chips">' + PSW.ejemplos.map(function(e){
         return '<button type="button" class="bt sec chico" data-ps-ej="' + esc(e.coord) + '">' + esc(e.nom) + '</button>';
       }).join('') + '</div>' +
       (PSW.err ? '<p class="msg mal">' + esc(PSW.err) + '</p>' : '') + '</div></div>';

  if(R){
    var canDraft = R.alt.ok || R.hidro.ok;
    h += '<div class="tarj"><div class="tarj-cuerpo"><h3>Análisis de Terreno para ' + esc(R.lat + ', ' + R.lon) + ' <small class="tenue">(' + esc(R.fecha) + ')</small></h3>' +
         '<div class="ps-cards" id="ps-res">' +
         '<div class="ps-card"><b>⛰️ Altitud estimada</b><div class="big">' + (R.alt.ok ? '~' + R.alt.m + ' m (estimado)' : 'No disponible') + '</div>' +
         '<small>Fuente: AWS Terrarium USGS SRTM (resolución nominal ~30 m, tile ' + esc(R.alt.tile) + ').' +
         (R.alt.ok && R.alt.m > 2500 ? '<br><b>> 2 500 m:</b> supuesto minero por verificar en D.S. 024-2016-EM Anexo 16-A; validar con procedimiento.' : '') + '</small></div>' +
         '<div class="ps-card"><b>🌊 Proximidad hidrográfica IGN</b><div class="big">' +
         (!R.hidro.ok ? 'No disponible' : (R.hidro.trazos.length ? R.hidro.trazos.length + ' trazos en 3 km' : '0 trazos en filtro 3 km')) + '</div>' +
         '<small>Filtros internos de búsqueda: ventana 3 km y marca &lt;500 m (no son umbrales legales ni prueban estar en cauce o quebrada seca).' +
         (R.hidro.ok && R.hidro.trazos.length ? '<br>Más cercano: <b>' + esc(R.hidro.trazos[0].nom) + ' (~' + R.hidro.trazos[0].dist + ' m)</b>' + (R.hidro.trazos[0].dist < 500 ? ' <span class="pill ojo">&lt; 500 m filtro visual</span>' : '') : '') +
         '</small></div>' +
         '<div class="ps-card"><b>🏗️ Zona sísmica E.030 y clima</b><div class="big" style="font-size:16px">' + esc(R.e030) + '</div>' +
         '<small>Sin interpolar ni inventar zona sísmica. Ley 30102 y D.S. 003-2026-SA quedan pendientes de cotejo oficial antes de automatizar filas.</small></div>' +
         '</div>' +

         '<!-- RADAR VISUAL CONCENTRICO -->\n' +
         '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">' +
         '  <div class="ps-card" style="padding:10px">' +
         '    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px">' +
         '      <strong style="font-size:13px">Radar de proximidad hidrográfica (IGN 1:100 000)</strong>' +
         '      <button class="ps-btn ps-btn-sec" style="padding:3px 8px;font-size:11px" onclick="psDescargarFicha()">Descargar gráfico</button>' +
         '    </div>' +
         '    <div class="ps-radar-box">' +
         '      <canvas id="ps-radar-canvas" width="460" height="300"></canvas>' +
         '    </div>' +
         '  </div>' +
         '  <div class="ps-card">' +
         '    <strong style="font-size:13px">🚨 Plan de contingencia preliminar del sitio</strong>' +
         '    <ul style="margin:6px 0;padding-left:18px;font-size:12.5px;line-height:1.45">' +
         '      <li><strong>Ruta de evacuación:</strong> Hacia cota superior (+20 m sobre nivel de cauce cartografiado) en caso de alerta de flujo de lodo o crecida.</li>' +
         '      <li><strong>Vigilancia cuenca alta:</strong> Monitoreo de avisos SENAMHI/ENFEN en época de lluvias intensas (El Niño 2026-2027).</li>' +
         '      <li><strong>Punto de encuentro:</strong> Ubicado fuera de la faja marginal y libre de cables eléctricos aéreos.</li>' +
         '      <li><strong>Parada segura:</strong> Detención de excavaciones profundas ante lluvia sostenida > 20 min (Norma G.050).</li>' +
         '    </ul>' +
         '  </div>' +
         '</div>' +

         '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
         '<button type="button" class="ps-btn ps-btn-pri" id="ps-draft-bt"' + (canDraft ? '' : ' disabled') + '>Generar Matriz de Peligros del Entorno (IPERC)</button>' +
         (!canDraft ? '<span class="tenue">Sin fuentes disponibles: no se generan filas sugeridas.</span>' : '') + '</div>' +

         (PSW.borrador.length ? '<div style="margin-top:14px" id="ps-borr-box">' +
           '<h4>📋 Matriz de Peligros del Entorno (Sugerida · Requiere confirmación de supervisor):</h4>' +
           '<div style="overflow-x:auto"><table class="ps-tabla">' +
           '<thead><tr><th>Peligro identificado</th><th>Riesgo asociado</th><th>Consecuencia</th><th>Controles sugeridos</th><th>Confirmar</th></tr></thead><tbody>' +
           PSW.borrador.map(function(b, idx){
             return '<tr>' +
               '<td><b>' + esc(b.peligro) + '</b></td>' +
               '<td>' + esc(b.riesgo || '-') + '</td>' +
               '<td>' + esc(b.consecuencia || '-') + '</td>' +
               '<td>' + esc(b.controles || b.observacion) + '</td>' +
               '<td style="text-align:center"><input type="checkbox" id="ps-chk-' + idx + '"' + (b.confirmado ? ' checked' : '') + ' onchange="PSW.borrador[' + idx + '].confirmado=this.checked"></td>' +
             '</tr>';
           }).join('') + '</tbody></table></div></div>' : '') +
         '</div></div>';
  }
  h += '</div>';
  caja.innerHTML = h;

  $('ps-go').onclick = function(){ PSW.coord = $('ps-coord').value; psAnalizarSitio(PSW.coord); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ps-ej]'), function(b){
    b.onclick = function(){ PSW.coord = b.getAttribute('data-ps-ej'); psAnalizarSitio(PSW.coord); };
  });
  var db = $('ps-draft-bt'); if(db) db.onclick = psGenerarBorrador;

  /* Dibujar radar si hay resultado */
  var cv = document.getElementById('ps-radar-canvas');
  if(cv && R) psDibujarRadar(cv, R);
}

/* Para Node.js y pruebas automatizadas */
if(typeof module !== 'undefined' && module.exports){
  module.exports = {
    psParseCoord: psParseCoord,
    psTileDeCoord: psTileDeCoord,
    psTerrariumMetros: psTerrariumMetros,
    _psHaversine: _psHaversine,
    _psDistLinea: _psDistLinea,
    psAnalizarSitio: psAnalizarSitio,
    psGenerarBorrador: psGenerarBorrador,
    psDibujarRadar: psDibujarRadar,
    PSW: PSW
  };
}
