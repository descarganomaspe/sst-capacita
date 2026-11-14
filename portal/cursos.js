/* ══ ACADEMIA OBRASST — CURSOS PRÁCTICOS AISLADOS (Orden 24 & 29 · 13/11/2026) ══════════════════════════════════════
   · Lee ÚNICAMENTE el banco estático «cursos/curso-01.json» (nunca sst_tema_propio, sst_trabajador ni tablas reales).
   · Reproductor interactivo con preguntas («¿No te quedó claro?»): botones contextuales, aviso Koda a los 5 s,
     respuestas de 2 a 3 min con norma en pantalla y OBRASST al costado, y retorno 2 s antes para no perder el hilo.
   · Guarda la práctica y avance únicamente en sessionStorage bajo el prefijo aislado «curso_sandbox_v1:...» por
     empresa/usuario para que cambiar de obra o cuenta nunca mezcle datos y jamás toque empresas reales.
   · Constancia de participación en PDF aparte (cursoConstanciaPDF): sin verificador en línea ni huella de empresa, sin
     DNI, sin responsable/sello inventado y con el aviso legal obligatorio «NO es un certificado oficial».
   · Solo Módulo 1 gratuito desbloqueado; Módulos 2–10 esperan activación validada por servidor tras aprobación. */
var CURSOS_VER = '29';
var CURW = { caja:null, data:null, modId:'m1', pracPaso:{}, regsChecked:{}, resp:{}, nota:null, cargo:false, error:'' };
var CURP = null; /* Estado del reproductor interactivo */

function _curEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function _curMmss(seg){
  seg = Math.max(0, Math.round(seg || 0));
  var m = Math.floor(seg / 60), s = seg % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function _curCss(){
  if(document.getElementById('cur-css')) return;
  var s = document.createElement('style'); s.id = 'cur-css';
  s.textContent = [
    '.cur-wrap{display:grid;gap:14px}',
    '.cur-aviso{padding:11px 14px;border-radius:12px;background:rgba(245,183,0,.14);border:1px solid rgba(245,183,0,.5);font-size:13px;line-height:1.45}',
    '.cur-head{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}',
    '.cur-precios{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13px}',
    '.cur-grid{display:grid;grid-template-columns:minmax(260px,340px) minmax(0,1fr);gap:14px;align-items:start}',
    '@media (max-width:900px){.cur-grid{grid-template-columns:1fr}}',
    '.cur-lista{display:grid;gap:7px}',
    '.cur-mod{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;padding:10px 12px;border-radius:12px;border:1px solid var(--raya);background:var(--tarj,#fff);cursor:pointer;font:inherit;color:inherit}',
    '.cur-mod.on{border-color:var(--azul,#0B2A3A);box-shadow:inset 3px 0 0 #F5B700;background:var(--fondo,#f7f9fb)}',
    '.cur-mod.bloq{opacity:.75}',
    '.cur-mod .n{flex:0 0 26px;height:26px;border-radius:999px;background:#0B2A3A;color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center}',
    '.cur-mod .tx{flex:1;min-width:0}.cur-mod .tx b{display:block;font-size:13.5px}.cur-mod .tx small{display:block;font-size:12px;color:var(--gris)}',
    '.cur-sec{margin-top:12px;padding-top:12px;border-top:1px solid var(--raya)}',
    '.cur-box{padding:12px 14px;border-radius:12px;background:var(--fondo,#f6f8fa);border:1px solid var(--raya);display:grid;gap:8px}',
    '.cur-chk{display:flex;gap:8px;align-items:flex-start;font-size:13px;cursor:pointer}.cur-chk input{width:auto;margin:2px 0 0}',
    '.cur-preg{padding:10px 12px;border-radius:10px;border:1px solid var(--raya);display:grid;gap:6px;margin-bottom:8px}',
    '.cur-ops{display:grid;gap:5px}',
    '.cur-op{display:flex;gap:8px;align-items:flex-start;font-size:13px;cursor:pointer}.cur-op input{width:auto;margin:3px 0 0}',
    '.cur-const{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}',
    /* Reproductor interactivo (Orden 29) */
    '.cur-repro{background:#0B2A3A;border-radius:12px;overflow:hidden;color:#F2F7FA;display:grid;gap:0}',
    '.cur-pantalla{position:relative;aspect-ratio:16/9;background:#06121A;overflow:hidden;padding:16px 20px;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box}',
    '.cur-lam{display:flex;flex-direction:column;gap:8px;z-index:2}',
    '.cur-lam .eti{font-family:ui-monospace,Consolas,monospace;font-size:11px;color:#A9C3D1;letter-spacing:.04em;text-transform:uppercase}',
    '.cur-lam .tit{font-size:17px;font-weight:700;line-height:1.2;color:#fff;margin:0}',
    '.cur-lam .txt{font-size:13.5px;line-height:1.4;color:#E6EFF4}',
    '.cur-lam .norma{border-left:3px solid #F5B700;padding-left:10px;font-size:12.5px;line-height:1.45;color:#E6EFF4;background:rgba(245,183,0,.08);border-radius:0 6px 6px 0;padding-block:4px}',
    'mark.cur-m{color:inherit;background-color:transparent;background-image:linear-gradient(#F5B700,#F5B700);background-repeat:no-repeat;background-position:0 94%;background-size:0% .3em;padding:0 .05em}',
    '.cur-subtit{min-height:36px;padding:6px 12px;background:#14394D;color:#fff;font-size:13px;text-align:center;line-height:1.35;border-top:1px solid #1E4E68;display:flex;align-items:center;justify-content:center}',
    '.cur-velo{position:absolute;inset:0;background:rgba(6,18,26,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px;gap:10px;z-index:5}',
    '.cur-velo .grande{font-size:18px;font-weight:700;line-height:1.2;color:#fff}',
    '.cur-velo .acc{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:6px}',
    '.cur-ctrls{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#0B2A3A;flex-wrap:wrap;border-top:1px solid #1E4E68}',
    '.cur-ctrls button{border:0;background:rgba(255,255,255,.14);color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px;font-weight:600;min-height:36px}',
    '.cur-ctrls button.on{background:#F5B700;color:#0B2A3A}',
    '.cur-ctrls button:hover{background:rgba(255,255,255,.24)}',
    '.cur-ctrls .tiempo{font-family:ui-monospace,Consolas,monospace;font-size:12px;color:#A9C3D1;min-width:70px;white-space:nowrap}',
    '.cur-ctrls input[type=range]{flex:1 1 140px;margin:0;accent-color:#F5B700;cursor:pointer}',
    '.cur-ctrls select{background:#14394D;color:#fff;border:1px solid #1E4E68;border-radius:8px;padding:4px 8px;font-size:12px;cursor:pointer}',
    '.cur-pregs-bloque{padding:12px 14px;background:var(--tarj,#fff);border:1px solid var(--raya);border-radius:12px;margin-top:10px;display:grid;gap:8px}',
    '.cur-pregs-head{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px}',
    '.cur-pregs-head b{font-size:14px;color:var(--tinta,#0B2A3A)}',
    '.cur-pregs-head small{font-size:12px;color:var(--gris,#6B7C88)}',
    '.cur-pregs-lista{display:grid;gap:6px}',
    '.cur-preg-btn{display:flex;width:100%;align-items:center;justify-content:space-between;text-align:left;gap:8px;padding:10px 12px;border:1px solid var(--raya);border-radius:10px;background:var(--fondo,#f6f8fa);font:inherit;color:inherit;cursor:pointer;min-height:44px}',
    '.cur-preg-btn:hover{border-color:#F5B700}',
    '.cur-preg-btn[aria-pressed="true"]{background:rgba(245,183,0,.12);border-color:#F5B700}',
    '.cur-chip{display:inline-flex;align-items:center;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap}',
    '.cur-chip.casco{background:#F5B700;color:#0B2A3A}',
    '.cur-chip.ok{background:#E8F5EE;color:#1E8E5A}'
  ].join('\n');
  document.head.appendChild(s);
}

function _curSbKey(){
  var emp = (window.YO && YO.obra && YO.obra.id) ? String(YO.obra.id) : 'anon';
  var uid = (window.TOK && TOK.uid) ? String(TOK.uid) : 'invitado';
  return 'curso_sandbox_v1:' + emp + ':' + uid;
}

function _curLeerSb(){
  try{
    var r = sessionStorage.getItem(_curSbKey());
    if(!r) return { prac:{}, regs:{}, aprob:{}, resp:{}, player:{} };
    var p = JSON.parse(r);
    return (p && typeof p === 'object') ? {
      prac: p.prac || {},
      regs: p.regs || {},
      aprob: p.aprob || {},
      resp: p.resp || {},
      player: p.player || {}
    } : { prac:{}, regs:{}, aprob:{}, resp:{}, player:{} };
  }catch(e){ return { prac:{}, regs:{}, aprob:{}, resp:{}, player:{} }; }
}

function _curGuardarSb(st){
  try{ sessionStorage.setItem(_curSbKey(), JSON.stringify(st)); }catch(e){}
}

function cursoLimpiarSandbox(){
  try{
    for(var i = sessionStorage.length - 1; i >= 0; i--){
      var k = sessionStorage.key(i);
      if(k && k.indexOf('curso_sandbox_v1:') === 0) sessionStorage.removeItem(k);
    }
  }catch(e){}
}

function _curCargarJson(){
  if(CURW.data) return Promise.resolve(CURW.data);
  var url = 'cursos/curso-01.json?v=' + encodeURIComponent(CURSOS_VER || '1');
  return fetch(url, { cache:'no-cache' }).then(function(r){
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function(j){ CURW.data = j; return j; });
}

function _curEsAislado(){
  return !!(CURW.data && CURW.data.id && CURW.data.ejemplo_sandbox);
}

function _curMod(id){
  var L = (CURW.data && CURW.data.modulos) || [];
  for(var i = 0; i < L.length; i++) if(L[i].id === id) return L[i];
  return L[0] || null;
}

/* ══ REPRODUCTOR INTERACTIVO CON PREGUNTAS (Orden 29) ══════════════════════════════════════ */
function _curCalcularCorte(t, pausas){
  var target = t + 5.0;
  if(!pausas || !pausas.length) return target;
  for(var i = 0; i < pausas.length; i++){
    if(pausas[i] >= target && pausas[i] <= target + 2.0) return pausas[i];
  }
  return target;
}

function _curPlayerState(interactivo){
  var sb = _curLeerSb(), ps = (sb.player && sb.player[interactivo.id]) || {};
  return {
    lec: interactivo,
    t: (typeof ps.t === 'number') ? ps.t : 0,
    vel: ps.vel || 1.0,
    cc: ps.cc !== false,
    jugando: false,
    modo: 'leccion', /* 'leccion' | 'aviso' | 'respuesta' | 'fin' */
    cola: Array.isArray(ps.cola) ? ps.cola.slice() : [],
    respondidas: Array.isArray(ps.respondidas) ? ps.respondidas.slice() : [],
    actual: null,
    corte: null,
    resumeAt: 0,
    paso: 0,
    pasoT: 0,
    avisoT: 0,
    vistaMax: (typeof ps.vistaMax === 'number') ? ps.vistaMax : 0
  };
}

function _curGuardarPlayerState(){
  if(!CURP || !CURP.lec) return;
  var sb = _curLeerSb();
  sb.player = sb.player || {};
  sb.player[CURP.lec.id] = {
    t: CURP.t,
    vel: CURP.vel,
    cc: CURP.cc,
    cola: CURP.cola,
    respondidas: CURP.respondidas,
    vistaMax: CURP.vistaMax
  };
  _curGuardarSb(sb);
}

function _curPintarPlayer(){
  if(!CURP) return;
  var lam = document.getElementById('cur-lam');
  var velo = document.getElementById('cur-velo');
  var sub = document.getElementById('cur-subtit');
  var tm = document.getElementById('cur-tiempo');
  var sk = document.getElementById('cur-seek');
  var pb = document.getElementById('cur-b-play');
  var cb = document.getElementById('cur-b-cc');

  if(tm) tm.textContent = _curMmss(CURP.t) + ' / ' + _curMmss(CURP.lec.dur);
  if(sk && document.activeElement !== sk){
    sk.value = CURP.t;
    sk.max = CURP.lec.dur;
  }
  if(pb){
    pb.textContent = (CURP.modo === 'leccion' && CURP.jugando) ? '❚❚' : '▶';
    pb.setAttribute('aria-label', CURP.jugando ? 'Pausar' : 'Reproducir');
    pb.disabled = (CURP.modo !== 'leccion');
  }
  if(cb) cb.className = CURP.cc ? 'btn chico on' : 'btn chico sec';

  if(CURP.modo === 'leccion'){
    if(velo) velo.hidden = true;
    if(lam){
      var t = CURP.t, h = '';
      if(t < 11){
        h = '<span class="eti">Ley 29783 · Quién cuida la SST</span>' +
            '<h4 class="tit">¿Comité o Supervisor de SST?</h4>' +
            '<p class="txt">Depende de <b>cuántos trabajadores</b> tiene el empleador a su cargo en la obra.</p>';
      } else if(t < 29.5){
        h = '<span class="eti">Ley 29783 · Art. 29 · Texto verificado</span>' +
            '<h4 class="tit">Comité de Seguridad y Salud</h4>' +
            '<div class="norma">«Los empleadores con <mark class="cur-m" id="cur-m1">veinte o más trabajadores a su cargo</mark> constituyen un comité de seguridad y salud en el trabajo […] conformado <mark class="cur-m" id="cur-m2">en forma paritaria</mark>.»</div>';
      } else if(t < 42){
        h = '<span class="eti">Ley 29783 · Art. 30 · Texto verificado</span>' +
            '<h4 class="tit">Supervisor de SST</h4>' +
            '<div class="norma">«En los centros de trabajo con <mark class="cur-m" id="cur-m3">menos de veinte trabajadores</mark> son <mark class="cur-m" id="cur-m4">los mismos trabajadores quienes nombran al supervisor</mark>.»</div>';
      } else if(t < 48.5){
        h = '<span class="eti">Ley 29783 · Art. 31 · Texto verificado</span>' +
            '<h4 class="tit">La Elección Democrática</h4>' +
            '<div class="norma">«<mark class="cur-m" id="cur-m5">Son los trabajadores quienes eligen a sus representantes</mark> ante el comité o sus supervisores.»</div>';
      } else {
        h = '<span class="eti">En OBRASST lo haces aquí</span>' +
            '<h4 class="tit">Elección y Actas en la Obra Ejemplo</h4>' +
            '<p class="txt">Convocatoria, candidatos, votación desde el celular y acta de escrutinio lista para firmar.</p>';
      }
      lam.innerHTML = h;

      /* Subrayado animado */
      var m1 = document.getElementById('cur-m1'), m2 = document.getElementById('cur-m2');
      if(m1){ var x1 = Math.max(0, Math.min(1, (t - 16.5) / 6)); m1.style.backgroundSize = (x1 * 100).toFixed(1) + '% .3em'; }
      if(m2){ var x2 = Math.max(0, Math.min(1, (t - 23.0) / 6)); m2.style.backgroundSize = (x2 * 100).toFixed(1) + '% .3em'; }
    }
    if(sub){
      sub.hidden = !CURP.cc;
      var cue = null, cues = CURP.lec.cues || [];
      for(var i = 0; i < cues.length; i++){
        if(CURP.t >= cues[i][0] && CURP.t < cues[i][1]){ cue = cues[i]; break; }
      }
      sub.textContent = cue ? cue[2] : (CURP.t >= CURP.lec.dur ? 'Lección terminada ✓' : '');
    }
    if(CURP.t >= CURP.lec.dur && velo){
      velo.hidden = false;
      velo.innerHTML = '<span class="grande">Lección vista ✓</span>' +
        '<div class="acc"><button type="button" class="btn chico sec" id="cur-b-rev">Ver de nuevo</button>' +
        '<button type="button" class="btn chico on" id="cur-b-prac">Ir a la práctica</button></div>';
      var rb = document.getElementById('cur-b-rev'); if(rb) rb.onclick = function(){ CURP.t = 0; CURP.jugando = true; _curPintarPlayer(); _curPintarPregs(); };
      var pb2 = document.getElementById('cur-b-prac'); if(pb2) pb2.onclick = function(){
        var sb = _curLeerSb(); sb.aprob[CURW.modId] = sb.aprob[CURW.modId] || { pct:100 }; _curGuardarSb(sb);
        var el = document.getElementById('cur-eval-bt'); if(el) el.scrollIntoView({ behavior:'smooth' });
      };
    }
  } else if(CURP.modo === 'aviso'){
    if(sub){ sub.hidden = !CURP.cc; sub.textContent = ''; }
    if(velo){
      velo.hidden = false;
      var qAviso = _curObtenerPreg(CURP.cola[0]);
      velo.innerHTML = '<small style="color:#A9C3D1;letter-spacing:.05em">VOZ DE KODA</small>' +
                       '<span class="grande">Tienes una pregunta</span>' +
                       '<p style="margin:0;font-size:14px;max-width:320px">' + _curEsc(qAviso ? qAviso.texto : '') + '</p>';
    }
  } else if(CURP.modo === 'respuesta'){
    if(sub){ sub.hidden = !CURP.cc; sub.textContent = ''; }
    var qResp = _curObtenerPreg(CURP.actual);
    if(lam && qResp){
      var paso = qResp.pasos && qResp.pasos[CURP.paso];
      if(paso){
        var hR = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
                 '<span class="eti">Respuesta · ' + _curEsc(qResp.texto) + '</span>' +
                 '<span style="font-size:11px;color:#A9C3D1">Paso ' + (CURP.paso + 1) + ' de ' + qResp.pasos.length + '</span></div>' +
                 '<h4 class="tit">' + _curEsc(paso.tit) + '</h4>';
        if(paso.t === 'norma'){
          hR += '<div class="norma">' + _curEsc(paso.txt) + '</div>';
        } else {
          hR += '<p class="txt">' + _curEsc(paso.txt) + '</p>';
        }
        lam.innerHTML = hR;
      }
    }
    if(velo){
      velo.hidden = false;
      velo.style.background = 'transparent';
      velo.innerHTML = '<div style="position:absolute;right:14px;bottom:14px">' +
                       '<button type="button" class="btn chico sec" id="cur-b-saltar">Saltar</button></div>';
      var bs = document.getElementById('cur-b-saltar');
      if(bs) bs.onclick = function(){ _curSaltarRespuesta(); };
    }
  } else if(CURP.modo === 'fin'){
    if(sub){ sub.hidden = !CURP.cc; sub.textContent = ''; }
    if(velo){
      velo.hidden = false;
      velo.style.background = 'rgba(6,18,26,.92)';
      var qFin = _curObtenerPreg(CURP.actual);
      var mas = CURP.cola.filter(function(x){ return x !== CURP.actual; }).length;
      velo.innerHTML = '<small style="color:#A9C3D1;letter-spacing:.05em">RESPUESTA COMPLETADA</small>' +
                       '<span class="grande">' + _curEsc(qFin ? qFin.texto : '') + '</span>' +
                       '<div class="acc">' +
                       '<button type="button" class="btn chico sec" id="cur-b-otravez">Volver a escuchar la respuesta</button>' +
                       '<button type="button" class="btn chico on" id="cur-b-seguir">Seguir con el tema</button>' +
                       (mas ? '<button type="button" class="btn chico sec" id="cur-b-sig">Siguiente pregunta (' + mas + ' más)</button>' : '') +
                       '</div>';
      var bo = document.getElementById('cur-b-otravez'); if(bo) bo.onclick = function(){ _curIniciarRespuesta(CURP.actual); };
      var bsg = document.getElementById('cur-b-seguir'); if(bsg) bsg.onclick = function(){ _curSeguirTema(); };
      var bsi = document.getElementById('cur-b-sig'); if(bsi) bsi.onclick = function(){ _curSiguientePregunta(); };
    }
  }
}

function _curObtenerPreg(id){
  if(!CURP || !CURP.lec || !CURP.lec.preguntas) return null;
  for(var i = 0; i < CURP.lec.preguntas.length; i++){
    if(CURP.lec.preguntas[i].id === id) return CURP.lec.preguntas[i];
  }
  return null;
}

function _curPintarPregs(){
  var box = document.getElementById('cur-pregs-lista');
  if(!box || !CURP || !CURP.lec || !CURP.lec.preguntas) return;
  var pregs = CURP.lec.preguntas.filter(function(q){
    return CURP.t >= q.desde - 0.001 && CURP.t <= q.hasta + 0.001;
  });
  box.innerHTML = pregs.map(function(q){
    var enCola = CURP.cola.indexOf(q.id) > -1;
    var resp = CURP.respondidas.indexOf(q.id) > -1;
    var badge = enCola ? '<span class="cur-chip casco">✓ En cola</span>' :
                (resp ? '<span class="cur-chip ok">✓ Respondida</span>' : '');
    return '<button type="button" class="cur-preg-btn" data-cur-q="' + _curEsc(q.id) + '" aria-pressed="' + enCola + '"' + (enCola ? ' disabled' : '') + '>' +
           '<span>' + _curEsc(q.texto) + '</span>' + badge + '</button>';
  }).join('');

  Array.prototype.forEach.call(box.querySelectorAll('[data-cur-q]'), function(b){
    b.onclick = function(){ _curEncolar(b.getAttribute('data-cur-q')); };
  });
}

function _curEncolar(qId){
  if(!CURP) return;
  if(CURP.cola.indexOf(qId) === -1) CURP.cola.push(qId);
  CURP.corte = _curCalcularCorte(CURP.t, CURP.lec.pausas);
  _curGuardarPlayerState();
  _curPintarPregs();
  _curPintarPlayer();
}

function _curIniciarRespuesta(qId){
  if(!CURP) return;
  CURP.modo = 'respuesta';
  CURP.actual = qId;
  CURP.paso = 0;
  CURP.pasoT = 0;
  _curPintarPlayer();
}

function _curSaltarRespuesta(){
  if(!CURP) return;
  var q = _curObtenerPreg(CURP.actual);
  CURP.modo = 'fin';
  CURP.paso = q ? (q.pasos.length - 1) : 0;
  _curPintarPlayer();
}

function _curSeguirTema(){
  if(!CURP) return;
  if(CURP.actual){
    CURP.cola = CURP.cola.filter(function(x){ return x !== CURP.actual; });
    if(CURP.respondidas.indexOf(CURP.actual) === -1) CURP.respondidas.push(CURP.actual);
  }
  CURP.actual = null;
  CURP.modo = 'leccion';
  CURP.t = CURP.resumeAt;
  CURP.corte = null;
  CURP.jugando = true;
  _curGuardarPlayerState();
  _curPintarPregs();
  _curPintarPlayer();
}

function _curSiguientePregunta(){
  if(!CURP) return;
  if(CURP.actual){
    CURP.cola = CURP.cola.filter(function(x){ return x !== CURP.actual; });
    if(CURP.respondidas.indexOf(CURP.actual) === -1) CURP.respondidas.push(CURP.actual);
  }
  if(CURP.cola.length > 0){
    _curIniciarRespuesta(CURP.cola[0]);
  } else {
    _curSeguirTema();
  }
  _curPintarPregs();
}

var _curTickTimer = null;
function _curTick(){
  if(!CURP) return;
  if(CURP.modo === 'leccion' && CURP.jugando){
    CURP.t = Math.min(CURP.lec.dur, CURP.t + 0.1 * CURP.vel);
    CURP.vistaMax = Math.max(CURP.vistaMax, CURP.t);
    if(CURP.corte != null && CURP.t >= CURP.corte - 0.001){
      CURP.jugando = false;
      CURP.modo = 'aviso';
      CURP.avisoT = 0;
      CURP.resumeAt = Math.max(0, CURP.corte - 2);
      CURP.corte = null;
    } else if(CURP.t >= CURP.lec.dur){
      CURP.jugando = false;
      _curGuardarPlayerState();
    }
    _curPintarPlayer();
    _curPintarPregs();
  } else if(CURP.modo === 'aviso'){
    CURP.avisoT += 0.1;
    if(CURP.avisoT >= 1.5){
      _curIniciarRespuesta(CURP.cola[0]);
    } else {
      _curPintarPlayer();
    }
  } else if(CURP.modo === 'respuesta'){
    CURP.pasoT += 0.1 * CURP.vel;
    if(CURP.pasoT >= 3.6){
      CURP.pasoT = 0;
      CURP.paso++;
      var q = _curObtenerPreg(CURP.actual);
      if(q && CURP.paso >= q.pasos.length){
        CURP.paso = q.pasos.length - 1;
        CURP.modo = 'fin';
      }
      _curPintarPlayer();
    }
  }
}

function _curKeyHandler(ev){
  if(ev.key === 'Escape' && CURP && (CURP.modo === 'respuesta' || CURP.modo === 'fin')){
    _curSeguirTema();
  }
}

function _curMontarPlayer(interactivo){
  _curDesmontarPlayer();
  CURP = _curPlayerState(interactivo);

  var playBtn = document.getElementById('cur-b-play');
  if(playBtn){
    playBtn.onclick = function(){
      if(CURP.modo !== 'leccion') return;
      if(CURP.t >= CURP.lec.dur) CURP.t = 0;
      CURP.jugando = !CURP.jugando;
      _curGuardarPlayerState();
      _curPintarPlayer();
    };
  }
  var seek = document.getElementById('cur-seek');
  if(seek){
    seek.oninput = function(ev){
      if(CURP.modo !== 'leccion') return;
      CURP.t = +ev.target.value;
      if(CURP.corte != null && CURP.corte < CURP.t){
        CURP.corte = null;
      }
      _curPintarPlayer();
      _curPintarPregs();
    };
  }
  var velSelect = document.getElementById('cur-vel');
  if(velSelect){
    velSelect.value = String(CURP.vel);
    velSelect.onchange = function(ev){
      CURP.vel = +ev.target.value;
      _curGuardarPlayerState();
    };
  }
  var ccBtn = document.getElementById('cur-b-cc');
  if(ccBtn){
    ccBtn.onclick = function(){
      CURP.cc = !CURP.cc;
      _curGuardarPlayerState();
      _curPintarPlayer();
    };
  }

  document.addEventListener('keydown', _curKeyHandler);
  _curTickTimer = setInterval(_curTick, 100);

  _curPintarPlayer();
  _curPintarPregs();
}

function _curDesmontarPlayer(){
  if(_curTickTimer){ clearInterval(_curTickTimer); _curTickTimer = null; }
  document.removeEventListener('keydown', _curKeyHandler);
  if(CURP){ _curGuardarPlayerState(); CURP = null; }
}

/* ══ VISTA PRINCIPAL DE LA ACADEMIA ══════════════════════════════════════════════════════════ */
function vistaAcademia(caja){
  _curCss();
  CURW.caja = caja;
  var ac = $('acciones'); if(ac) ac.innerHTML = '';
  cargando(caja);
  _curCargarJson().then(function(){
    if(CURW.caja !== caja || VISTA.actual !== 'academia') return;
    _curPintar();
  }).catch(function(){
    if(CURW.caja !== caja) return;
    caja.innerHTML = '<div class="tarj"><div class="tarj-cuerpo"><p class="msg mal">No se pudo cargar el catálogo de cursos.</p></div></div>';
  });
}

function _curPintar(){
  var caja = CURW.caja, D = CURW.data;
  if(!caja || !D || !document.body.contains(caja)) return;
  var sb = _curLeerSb(), m = _curMod(CURW.modId), EJ = D.ejemplo_sandbox || {};
  var h = '<div class="cur-wrap" id="cur-raiz">';
  h += '<div class="tarj"><div class="tarj-cuerpo"><div class="cur-head"><div><h2>🎓 ' + _curEsc(D.marca) + ' · ' + _curEsc(D.titulo) + '</h2>' +
       '<p class="sub" style="margin:2px 0 0">' + _curEsc(D.subtitulo) + '</p></div>' +
       '<div class="cur-precios"><span class="pill ok">Módulo 1 gratis</span><span class="pill azul">Lanzamiento S/ ' + _curEsc(D.precio_lanzamiento_pen) + ' · Luego S/ ' + _curEsc(D.precio_regular_pen) + '</span></div></div>' +
       '<div class="cur-aviso" style="margin-top:10px" role="note"><b>Aviso importante:</b> ' + _curEsc(D.aviso_legal) + '</div></div></div>';

  h += '<div class="cur-grid">';
  /* Columna izquierda: 10 módulos */
  h += '<div class="tarj"><div class="tarj-cuerpo"><h3>Módulos del curso (' + D.modulos.length + ')</h3><div class="cur-lista">';
  D.modulos.forEach(function(x){
    var on = x.id === m.id, ok = !!(sb.aprob && sb.aprob[x.id]);
    var estadoPill = ok ? '<span class="pill ok">aprobado ' + _curEsc(sb.aprob[x.id].pct) + '%</span>' :
                     (x.desbloqueado ? '<span class="pill ok">Gratis · abierto</span>' : '<span class="pill gris">🔒 Requiere acceso</span>');
    h += '<button type="button" class="cur-mod' + (on ? ' on' : '') + (x.desbloqueado ? '' : ' bloq') + '" data-cur-m="' + _curEsc(x.id) + '">' +
         '<span class="n">' + x.n + '</span><span class="tx"><b>' + _curEsc(x.titulo) + '</b><small>' + _curEsc(x.duracion_min) + ' min · ' + estadoPill + '</small></span></button>';
  });
  h += '</div></div></div>';

  /* Columna derecha: detalle del módulo */
  h += '<div class="tarj"><div class="tarj-cuerpo" id="cur-det">';
  h += '<div class="cur-head"><div><h3>Módulo ' + m.n + ' · ' + _curEsc(m.titulo) + '</h3><p class="sub" style="margin:2px 0 0">' + _curEsc(m.resumen) + '</p></div>' +
       (m.desbloqueado ? '<span class="pill ok">Piloto gratuito activo</span>' : '<span class="pill gris">🔒 Módulo bloqueado hasta activación del curso</span>') + '</div>';

  /* Normas citadas */
  if(m.normas && m.normas.length){
    h += '<div class="cur-sec"><b>Normativa verificada del módulo</b><ul>' + m.normas.map(function(nr){
      return '<li><b>' + _curEsc(nr.norma) + '</b> (' + _curEsc(nr.articulo) + ') — <a href="' + _curEsc(nr.url) + '" target="_blank" rel="noopener">fuente oficial</a></li>';
    }).join('') + '</ul></div>';
  }

  if(!m.desbloqueado){
    _curDesmontarPlayer();
    h += '<div class="cur-sec"><div class="cur-box"><b>Acceso al curso completo (Módulos 2 al 10)</b>' +
         '<p style="margin:0;font-size:13.5px">Por ahora solo el <b>Módulo 1</b> está abierto de forma gratuita mientras se completa la grabación y se habilita la activación verificada por servidor (<b>S/ ' + _curEsc(D.precio_lanzamiento_pen) + '</b> lanzamiento · luego <b>S/ ' + _curEsc(D.precio_regular_pen) + '</b>).</p></div></div>';
  } else {
    /* Bloque video interactivo con preguntas */
    if(m.interactivo){
      h += '<div class="cur-sec"><h4>🎬 Video interactivo con preguntas (Voz Koda + Obra Ejemplo)</h4>' +
           '<div class="cur-repro" id="cur-repro-box">' +
           '<div class="cur-pantalla" id="cur-pantalla-marco">' +
           '<div id="cur-lam" class="cur-lam"></div>' +
           '<div id="cur-velo" class="cur-velo" hidden></div>' +
           '</div>' +
           '<div id="cur-subtit" class="cur-subtit"></div>' +
           '<div class="cur-ctrls">' +
           '<button type="button" id="cur-b-play" aria-label="Reproducir">▶</button>' +
           '<span class="tiempo" id="cur-tiempo">0:00 / 1:00</span>' +
           '<input type="range" id="cur-seek" min="0" max="60" step="0.1" value="0" aria-label="Línea de tiempo">' +
           '<button type="button" id="cur-b-cc" class="on" aria-pressed="true">CC</button>' +
           '<select id="cur-vel" aria-label="Velocidad de reproducción">' +
           '<option value="0.75">0.75×</option>' +
           '<option value="1" selected>1×</option>' +
           '<option value="1.25">1.25×</option>' +
           '<option value="1.5">1.5×</option>' +
           '</select>' +
           '</div>' +
           '</div>' +
           '<div class="cur-pregs-bloque">' +
           '<div class="cur-pregs-head"><b>¿No te quedó claro?</b><small>Toca una pregunta: el video sigue y a los 5 s Koda te la responde</small></div>' +
           '<div id="cur-pregs-lista" class="cur-pregs-lista"></div>' +
           '</div></div>';
    } else {
      _curDesmontarPlayer();
      h += '<div class="cur-sec"><div class="cur-box"><b>🎬 Video del Módulo ' + m.n + '</b>' +
           '<p style="margin:0;font-size:13px;color:var(--gris)">Entorno de demostración listo sin almacenamiento pago ni tablas reales.</p></div></div>';
    }

    /* Sandbox aislado Obra Ejemplo */
    h += '<div class="cur-sec"><h4>🧪 Práctica guiada aislada · ' + _curEsc(EJ.obra || 'Obra Ejemplo') + '</h4>' +
         '<p class="sub" style="margin:0 0 8px">Sandbox cliente aislado (<code>curso_sandbox_v1</code>): cero lecturas o escrituras a empresas reales.</p>' +
         '<div class="cur-box"><b>Personal Ejemplo (' + _curEsc(EJ.empresa || 'Constructora Ejemplo S.A.C. (Ejemplo)') + ')</b>' +
         '<ul style="margin:0;padding-left:18px;font-size:13px">' + (EJ.trabajadores || []).map(function(t){
           return '<li>' + _curEsc(t.nombre) + ' · ' + _curEsc(t.puesto) + ' · ' + _curEsc(t.frente) + ' — ' +
             (t.induccion ? '<span class="pill ok">Inducción al día</span>' : '<span class="pill ojo">Falta inducción</span>') + '</li>';
         }).join('') + '</ul>' +
         '<b>Checklist de práctica: 8 registros obligatorios (D.S. N.° 005-2012-TR, art. 33)</b>' +
         (EJ.registros_art33 || []).map(function(rg, idx){
           var chk = !!(sb.regs && sb.regs['r' + idx]);
           return '<label class="cur-chk"><input type="checkbox" data-cur-reg="' + idx + '"' + (chk ? ' checked' : '') + '> <span>' + _curEsc(rg) + '</span></label>';
         }).join('') +
         '<small class="tenue">Marcados en sandbox aislado: <b id="cur-sb-count">' + Object.keys(sb.regs || {}).filter(function(k){ return sb.regs[k]; }).length + '</b> de ' + (EJ.registros_art33 || []).length + '</small>' +
         '</div></div>';

    /* Evaluación 5 preguntas */
    if(m.quiz && m.quiz.length){
      var yaAprob = sb.aprob && sb.aprob[m.id], rGuard = (sb.resp && sb.resp[m.id]) || {};
      h += '<div class="cur-sec"><h4>📝 Prueba del Módulo ' + m.n + ' (' + m.quiz.length + ' preguntas · parámetro propuesto: ' + _curEsc(D.aprobacion_pct_propuesta) + '%)</h4>' +
           '<form id="cur-quiz">';
      m.quiz.forEach(function(q, qi){
        h += '<div class="cur-preg"><b>' + (qi + 1) + '. ' + _curEsc(q.q) + '</b><div class="cur-ops">' +
             q.ops.map(function(op, oi){
               var ch = String(rGuard[qi]) === String(oi) ? ' checked' : '';
               return '<label class="cur-op"><input type="radio" name="cq' + qi + '" value="' + oi + '"' + ch + '> <span>' + _curEsc(op) + '</span></label>';
             }).join('') + '</div>' +
             (yaAprob && rGuard[qi] !== undefined ? '<small class="tenue">' + _curEsc(q.sustento) + '</small>' : '') + '</div>';
      });
      h += '<button type="submit" class="bt" id="cur-eval-bt">Calificar módulo</button> ' +
           '<span id="cur-quiz-msg" role="status" style="margin-left:8px;font-size:13px">' +
           (yaAprob ? (yaAprob.ok ? '✅ Aprobado (' + yaAprob.bien + '/' + yaAprob.tot + ' · ' + yaAprob.pct + '%)' : '⚠️ Puntaje ' + yaAprob.pct + '% — vuelve a intentar') : '') +
           '</span></form></div>';

      /* Emisión de Constancia PDF aparte (sin verificador online ni DNI/empresa) */
      if(yaAprob && yaAprob.ok){
        h += '<div class="cur-sec"><div class="cur-box"><b>📜 Constancia de participación (PDF autónomo)</b>' +
             '<p style="margin:0;font-size:12.5px">Se genera solo con el nombre que escribas aquí, folio de práctica y el aviso obligatorio de que no es un certificado oficial (sin DNI, sin empresa ni verificador en línea).</p>' +
             '<div class="cur-const"><div style="flex:1 1 220px"><label for="cur-alumno">Nombre completo para la constancia</label>' +
             '<input id="cur-alumno" maxlength="90" placeholder="Tu nombre y apellido (solo para este PDF)"></div>' +
             '<button type="button" class="bt" id="cur-pdf-bt">Descargar constancia PDF</button></div>' +
             '<div class="msg" id="cur-pdf-msg" role="status"></div></div></div>';
      }
    }
  }
  h += '</div></div></div></div>';
  caja.innerHTML = h;

  Array.prototype.forEach.call(caja.querySelectorAll('[data-cur-m]'), function(b){
    b.onclick = function(){
      CURW.modId = b.getAttribute('data-cur-m');
      _curPintar();
    };
  });

  if(m.desbloqueado && m.interactivo){
    _curMontarPlayer(m.interactivo);
  }

  Array.prototype.forEach.call(caja.querySelectorAll('[data-cur-reg]'), function(c){
    c.onchange = function(){
      var s2 = _curLeerSb(); s2.regs['r' + c.getAttribute('data-cur-reg')] = c.checked; _curGuardarSb(s2);
      var cnt = $('cur-sb-count'); if(cnt) cnt.textContent = Object.keys(s2.regs).filter(function(k){ return s2.regs[k]; }).length;
    };
  });

  var qf = $('cur-quiz');
  if(qf) qf.onsubmit = function(ev){
    ev.preventDefault();
    var bien = 0, resp = {};
    for(var i = 0; i < m.quiz.length; i++){
      var sel = qf.querySelector('input[name="cq' + i + '"]:checked');
      if(!sel){ toast('Responde las ' + m.quiz.length + ' preguntas antes de calificar.'); return; }
      resp[i] = +sel.value;
      if(resp[i] === m.quiz[i].ok) bien++;
    }
    var pct = Math.round((bien * 100) / m.quiz.length), ok = pct >= (D.aprobacion_pct_propuesta || 70);
    var s2 = _curLeerSb(); s2.resp[m.id] = resp; s2.aprob[m.id] = { ok:ok, bien:bien, tot:m.quiz.length, pct:pct, fecha:(typeof hoyISO === 'function' ? hoyISO() : new Date().toISOString().slice(0, 10)) };
    _curGuardarSb(s2);
    _curPintar();
  };

  var pb = $('cur-pdf-bt');
  if(pb) pb.onclick = function(){
    var al = String(($('cur-alumno') || {}).value || '').replace(/\s+/g, ' ').trim();
    var pm = $('cur-pdf-msg');
    if(!al){ if(pm){ pm.className = 'msg mal'; pm.textContent = 'Escribe el nombre que irá en la constancia.'; } return; }
    pb.disabled = true; pb.textContent = 'Armando PDF…';
    cursoConstanciaPDF(al, D.titulo, m).then(function(res){
      pb.disabled = false; pb.textContent = 'Descargar constancia PDF';
      if(typeof bajarBlob === 'function') bajarBlob(res.blob, 'Constancia-participacion-' + m.id + '.pdf');
      if(pm){ pm.className = 'msg ok'; pm.textContent = 'Constancia descargada (' + res.folio + ') — no es certificado oficial.'; }
    }, function(){
      pb.disabled = false; pb.textContent = 'Descargar constancia PDF';
      if(pm){ pm.className = 'msg mal'; pm.textContent = 'No se pudo armar el PDF en este momento.'; }
    });
  };
}

function cursoConstanciaPDF(alumno, tituloCurso, mod){
  return cargarEvPDF().then(function(){
    var J = window.jspdf && window.jspdf.jsPDF; if(!J) throw new Error('sin_jspdf');
    var doc = new J({ orientation:'landscape', unit:'mm', format:'a4' });
    var folio = 'ACAD-' + String((mod && mod.n) || 1).padStart(2, '0') + '-' + Math.abs((alumno.length * 131 + Date.now()) % 100000).toString().padStart(5, '0');
    var fecha = (typeof hoyISO === 'function' ? hoyISO() : new Date().toISOString().slice(0, 10));
    doc.setFillColor(11, 42, 58); doc.rect(0, 0, 297, 28, 'F');
    doc.setFillColor(245, 183, 0); doc.rect(0, 28, 297, 3, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text('ACADEMIA OBRASST · CONSTANCIA DE PARTICIPACIÓN AUTÓNOMA', 148.5, 17, { align:'center' });
    doc.setTextColor(20, 32, 42); doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.text('Se deja constancia de participación práctica en el módulo piloto del curso:', 148.5, 52, { align:'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.text(String(alumno).slice(0, 80), 148.5, 72, { align:'center' });
    doc.setFontSize(15); doc.text(String(tituloCurso || 'Supervisor SST listo para obra'), 148.5, 92, { align:'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    if(mod && mod.titulo) doc.text('Módulo ' + mod.n + ': ' + mod.titulo + ' (práctica en Obra Ejemplo aislada)', 148.5, 104, { align:'center' });
    doc.text('Fecha de emisión: ' + fecha + '   ·   Folio de práctica local: ' + folio, 148.5, 122, { align:'center' });
    doc.setDrawColor(210, 216, 222); doc.roundedRect(24, 142, 249, 36, 3, 3);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(140, 45, 25);
    doc.text('AVISO LEGAL OBLIGATORIO', 148.5, 152, { align:'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60, 70, 80);
    doc.text('Esta constancia acredita únicamente participación autónoma en el simulador Obra Ejemplo de Academia OBRASST.', 148.5, 160, { align:'center' });
    doc.text('NO es un certificado oficial, NO habilita legalmente para ejercer ni reemplaza capacitaciones del empleador (Ley N.° 29783).', 148.5, 167, { align:'center' });
    return { blob:doc.output('blob'), folio:folio, fecha:fecha };
  });
}
