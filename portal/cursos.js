/* ══ ACADEMIA OBRASST — CURSO PRÁCTICO AISLADO (Órdenes 24 y 29 · 13/11/2026; tanda 1 · 14/11/2026) ════════════════
   · Lee ÚNICAMENTE el banco estático «cursos/curso-01.json» (nunca sst_tema_propio, sst_trabajador ni tablas reales).
     Ese JSON se arma con herramientas/herr/academia-armar.js; no se edita a mano.
   · Cada módulo trae «lecciones». La misma lección se recorre de dos formas, a elección del aprendiz:
       Clásico  → láminas y subtítulos que avanzan con un reloj, con preguntas («¿No te quedó claro?»).
       Jugando  → tarjeta por tarjeta, con un reto rápido al final, puntos y racha.
     El contenido, la prueba (70 %) y la constancia son los mismos; lo visto en un modo cuenta en el otro.
   · El avance se guarda en el equipo (localStorage) en «acad_v2:<usuario>»: modo, lecModo, lec, aprob, resp, player,
     repaso, racha, puntos, insignias y final. La práctica de la Obra Ejemplo va aparte, por obra y usuario, en
     «curso_sandbox_v1:<obra>:<usuario>», para que cambiar de obra o de cuenta nunca mezcle datos.
   · Un módulo figura «aprobado» SOLO si se dio la prueba y se alcanzó el puntaje (aprob[id].ok === true).
   · Constancia de participación en PDF aparte (cursoConstanciaPDF): sin verificador en línea ni huella de empresa, sin
     DNI, sin responsable/sello inventado y con el aviso legal obligatorio «NO es un certificado oficial».
   · Abiertos: los módulos con «desbloqueado»; los demás, con el código de acceso al curso completo (tanda 4, 15/11/2026:
     lo vende Marcelo y se activa con la cuenta). Con el curso completo: el examen final (lo califica el servidor) y la
     constancia del curso con folio y QR, que se comprueba en portal/verificar.html. Ver «ACCESO, EXAMEN FINAL…». */
var CUR_DATOS_VER = 't4-1511';   /* 15/11: el curso se llama «Fundamentos de SST en obra» y trae «acceso» (el código de acceso del servidor) */
var CURW = { caja:null, data:null, modId:'m1', lecId:{}, cargo:false, error:'' };
var CURP = null; /* Estado del reproductor (modo Clásico) */
var CURJ = null; /* Estado de las tarjetas (modo Jugando) */
var _CUR_MEM = {}, _CUR_ALM;

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
    '.cur-mod{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;padding:10px 12px;border-radius:12px;border:1px solid var(--raya);background:var(--tarj,#fff);cursor:pointer;font:inherit;color:inherit;min-height:44px}',
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
    /* Lecciones, elección de modo e interruptor (tanda 1) */
    '.cur-lecs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}',
    '.cur-lec{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:6px 12px;border-radius:999px;border:1px solid var(--raya);background:var(--tarj,#fff);font:inherit;font-size:13px;color:inherit;cursor:pointer;text-align:left}',
    '.cur-lec.on{border-color:#0B2A3A;background:#0B2A3A;color:#fff}',
    '.cur-lec.vista .ok{color:#1E8E5A;font-weight:700}.cur-lec.on.vista .ok{color:#F5B700}',
    '.cur-lec-cab{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;justify-content:space-between;margin:6px 0 10px}',
    '.cur-lec-cab h4{margin:0;font-size:16px}.cur-lec-cab p{margin:3px 0 0;font-size:14px;line-height:1.4}',
    '.cur-modo{display:inline-flex;border:1px solid #0B2A3A;border-radius:999px;overflow:hidden;flex:0 0 auto}',
    '.cur-modo button{border:0;background:var(--tarj,#fff);color:#0B2A3A;font:inherit;font-size:14px;font-weight:600;padding:0 16px;min-height:44px;cursor:pointer}',
    '.cur-modo button[aria-pressed="true"]{background:#0B2A3A;color:#fff}',
    '.cur-elige{padding:14px;border-radius:14px;border:2px solid #F5B700;background:rgba(245,183,0,.10);display:grid;gap:8px;margin:8px 0 12px}',
    '.cur-elige p{margin:0;font-size:14px;line-height:1.4}',
    '.cur-elige-ops{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '@media (max-width:520px){.cur-elige-ops{grid-template-columns:1fr}}',
    '.cur-elige-ops button{display:grid;gap:3px;justify-items:start;text-align:left;padding:14px;min-height:96px;border-radius:12px;border:1px solid var(--raya);background:var(--tarj,#fff);font:inherit;color:inherit;cursor:pointer}',
    '.cur-elige-ops button:hover{border-color:#0B2A3A}',
    '.cur-elige-ops .ic{font-size:26px;line-height:1}.cur-elige-ops b{font-size:17px}.cur-elige-ops small{font-size:14px;color:var(--gris,#6B7C88)}',
    /* Modo Jugando: tarjeta por tarjeta */
    '.cur-juego{border:1px solid var(--raya);border-radius:14px;overflow:clip;background:var(--tarj,#fff)}',
    '.cur-j-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:10px 14px;background:#0B2A3A;color:#fff;font-size:14px}',
    '.cur-j-barra{height:6px;background:#14394D}.cur-j-barra i{display:block;height:6px;background:#F5B700;width:0}',
    '.cur-j-carta{padding:16px;display:grid;gap:10px}',
    '.cur-j-carta .eti{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--gris,#6B7C88);font-weight:700}',
    '.cur-j-carta h4{margin:0;font-size:20px;line-height:1.2}',
    '.cur-j-carta .txt{margin:0;font-size:17px;line-height:1.45}',
    '.cur-j-carta .norma{border-left:4px solid #F5B700;background:rgba(245,183,0,.10);border-radius:0 8px 8px 0;padding:8px 12px;font-size:16px;line-height:1.45}',
    '.cur-j-carta ul{margin:0;padding-left:20px;display:grid;gap:6px;font-size:16px;line-height:1.45}',
    '.cur-j-carta mark.cur-m{background-size:100% .3em}',
    '.cur-j-paso{padding:8px 12px;border-radius:10px;background:var(--fondo,#f6f8fa);border:1px solid var(--raya);font-size:16px;line-height:1.45}',
    '.cur-j-paso b{display:block;font-size:13px;color:var(--gris,#6B7C88);margin-bottom:2px}',
    '.cur-j-acc{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 16px}',
    '.cur-j-acc button{min-height:48px;padding:0 18px;border-radius:10px;border:1px solid #0B2A3A;background:var(--tarj,#fff);color:#0B2A3A;font:inherit;font-size:16px;font-weight:700;cursor:pointer}',
    '.cur-j-acc button.pri{background:#F5B700;border-color:#F5B700;color:#0B2A3A;flex:1 1 180px}',
    '.cur-j-acc button:disabled{opacity:.45;cursor:default}',
    /* Reproductor (Orden 29) */
    '.cur-repro{background:#0B2A3A;border-radius:12px;overflow:hidden;color:#F2F7FA;display:grid;gap:0}',
    /* la pantalla guarda la forma 16:9 como mínimo y crece si la lámina es larga (en el celular no se corta) */
    '.cur-pantalla{position:relative;display:grid;background:#06121A;overflow:clip;padding:16px 20px;box-sizing:border-box}',
    '.cur-pantalla::before{content:"";grid-area:1/1;padding-top:50%}',
    '.cur-lam{grid-area:1/1;display:flex;flex-direction:column;gap:8px;z-index:2;min-width:0}',
    '.cur-lam .eti{font-family:ui-monospace,Consolas,monospace;font-size:11px;color:#A9C3D1;letter-spacing:.04em;text-transform:uppercase}',
    '.cur-lam .tit{font-size:17px;font-weight:700;line-height:1.2;color:#fff;margin:0}',
    '.cur-lam .txt{font-size:13.5px;line-height:1.4;color:#E6EFF4;margin:0}',
    '.cur-lam .norma{border-left:3px solid #F5B700;padding-left:10px;font-size:12.5px;line-height:1.45;color:#E6EFF4;background:rgba(245,183,0,.08);border-radius:0 6px 6px 0;padding-block:4px}',
    'mark.cur-m{color:inherit;background-color:transparent;background-image:linear-gradient(#F5B700,#F5B700);background-repeat:no-repeat;background-position:0 94%;background-size:0% .3em;padding:0 .05em}',
    '.cur-subtit{min-height:36px;padding:6px 12px;background:#14394D;color:#fff;font-size:13px;text-align:center;line-height:1.35;border-top:1px solid #1E4E68;display:flex;align-items:center;justify-content:center}',
    '.cur-velo{position:absolute;inset:0;background:rgba(6,18,26,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px;gap:10px;z-index:5}',
    '.cur-velo[hidden],.cur-subtit[hidden]{display:none!important}',
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
    '.cur-chip.ok{background:#E8F5EE;color:#1E8E5A}',
    /* 14/11/2026 (noche) · los botones del velo y «Borrar mi avance» salían con el botón del navegador */
    '.cur-velo .acc .btn{border:0;border-radius:8px;padding:8px 14px;min-height:40px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;background:rgba(255,255,255,.16);color:#fff}',
    '.cur-velo .acc .btn.on{background:#F5B700;color:#0B2A3A}',
    '#cur-borrar{border:1px solid var(--raya2,#CBD4DB);background:var(--panel,#fff);color:var(--tinta,#0B2A3A);border-radius:8px;padding:7px 11px;min-height:36px;font:inherit;font-size:13px;cursor:pointer;margin-left:6px}',
    /* 15/11/2026 · tanda 4: el código de acceso, el examen final y la constancia del curso */
    '#cur-ir-codigo{border:1px solid #0B2A3A;background:var(--panel,#fff);color:#0B2A3A;border-radius:999px;padding:6px 12px;min-height:36px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}',
    '.cur-cod{display:grid;gap:6px;padding:12px;border-radius:10px;border:1px dashed #0B2A3A;background:var(--panel,#fff);margin-top:4px}',
    '.cur-cod p{margin:0;font-size:14px}.cur-cod label{font-size:14px;line-height:1.4}',
    '.cur-cod-fila{display:flex;gap:8px;flex-wrap:wrap}.cur-cod-fila input{flex:1 1 170px;min-height:44px;font-family:ui-monospace,Consolas,monospace;font-size:16px;letter-spacing:.06em;text-transform:uppercase}',
    '.cur-cod .bt,.cur-cf-acc .bt{min-height:44px}',
    '.cur-compra{margin:2px 0 0;font-size:13.5px;line-height:1.45}',
    '.cur-mod-final .n{background:#F5B700;color:#0B2A3A;font-size:14px}.cur-mod-final.cerrado{opacity:.8}',
    '.cur-ex{display:grid;gap:0}.cur-ex fieldset{margin:0 0 8px;min-width:0}.cur-ex legend{padding:0;font-size:15px;line-height:1.4}',
    '.cur-ex .cur-op{font-size:15px;padding:6px 0;min-height:40px;align-items:center}.cur-ex .cur-op input{width:20px;height:20px;margin:0}',
    '.cur-ex-barra{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:10px;background:#0B2A3A;color:#fff;font-size:15px;margin-bottom:8px}',
    '.cur-reloj{font-family:ui-monospace,Consolas,monospace;font-weight:700}.cur-reloj.poco{color:#F5B700}',
    '.cur-ex-fin{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:6px}.cur-ex-fin .bt{min-height:48px;font-size:16px}',
    '.cur-ex-fin .cur-reloj{color:var(--tinta,#0B2A3A)}',
    '.cur-reglas{margin:0;padding-left:20px;display:grid;gap:4px;font-size:14px}',
    '.cur-repasa{display:flex;flex-wrap:wrap;gap:6px}',
    '.cur-felicita{padding:12px 14px;border-radius:12px;background:#E8F5EE;border:1px solid #BFE3CE;color:#14532D;font-size:15px;margin-bottom:10px}',
    '.cur-cf dl{display:grid;grid-template-columns:minmax(110px,max-content) minmax(0,1fr);gap:6px 14px;margin:0;font-size:14px}',
    '.cur-cf dt{color:var(--gris,#6B7C88)}.cur-cf dd{margin:0;overflow-wrap:anywhere}',
    '@media (max-width:420px){.cur-cf dl{grid-template-columns:minmax(0,1fr)}.cur-cf dt{margin-top:4px}}',
    '.cur-folio{font-family:ui-monospace,Consolas,monospace;letter-spacing:.04em}',
    '.cur-cf-acc{display:flex;flex-wrap:wrap;gap:8px}.cur-cf-acc a.bt{display:inline-flex;align-items:center;text-decoration:none}',
    '.cur-res p{font-size:14px}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ══ GUARDADO EN EL EQUIPO (tanda 1): el avance ya no se pierde al cerrar la pestaña ═══════════════════════════ */
function _curAlm(){
  if(_CUR_ALM !== undefined) return _CUR_ALM;
  try{ var k = '__acad_prueba'; localStorage.setItem(k, '1'); localStorage.removeItem(k); _CUR_ALM = localStorage; }
  catch(e){ _CUR_ALM = null; }
  return _CUR_ALM;
}
function _curGet(k){
  var a = _curAlm();
  if(a){ try{ return a.getItem(k); }catch(e){} }
  return Object.prototype.hasOwnProperty.call(_CUR_MEM, k) ? _CUR_MEM[k] : null;
}
function _curSet(k, v){
  var a = _curAlm();
  if(a){ try{ a.setItem(k, v); return; }catch(e){} }
  _CUR_MEM[k] = v;
}
function _curQuitar(k){
  var a = _curAlm();
  if(a){ try{ a.removeItem(k); }catch(e){} }
  delete _CUR_MEM[k];
}
function _curUid(){ return (window.TOK && TOK.uid) ? String(TOK.uid) : 'invitado'; }
function _curObraId(){ return (window.YO && YO.obra && YO.obra.id) ? String(YO.obra.id) : 'anon'; }
function _curAvKey(){ return 'acad_v2:' + _curUid(); }
function _curSbKey(){ return 'curso_sandbox_v1:' + _curObraId() + ':' + _curUid(); }
function _curObj(x){ return (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}; }

/* El día de hoy en Lima (la obra vive en Lima, no en la hora del equipo) */
function _curHoy(){
  if(typeof hoyISO === 'function') return hoyISO();
  try{ return new Intl.DateTimeFormat('en-CA', { timeZone:'America/Lima' }).format(new Date()); }
  catch(e){ return new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10); }
}
function _curDiaMas(iso, n){
  var d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function _curAvVacio(){
  return { v:2, modo:null, lecModo:{}, lec:{}, aprob:{}, resp:{}, player:{}, repaso:{}, racha:{ ult:'', dias:0 }, puntos:0, insignias:[], final:null };
}

/* Lo que quedó del guardado viejo (sessionStorage «curso_sandbox_v1:…» con aprob, resp y player dentro) */
function _curViejo(){
  try{
    var r = sessionStorage.getItem(_curSbKey());
    var p = r ? JSON.parse(r) : null;
    return (p && typeof p === 'object') ? p : null;
  }catch(e){ return null; }
}

function _curLeerAv(){
  var av = _curAvVacio(), r = _curGet(_curAvKey()), p = null, migrado = false;
  if(r){ try{ p = JSON.parse(r); }catch(e){ p = null; } }
  if(!p || typeof p !== 'object'){
    var v = _curViejo();
    if(v && (v.aprob || v.resp || v.player)){ p = { aprob:v.aprob, resp:v.resp, player:v.player }; migrado = true; }
  }
  if(!p || typeof p !== 'object') return av;
  av.modo = (p.modo === 'clasico' || p.modo === 'jugando') ? p.modo : null;
  ['lecModo', 'lec', 'aprob', 'resp', 'player', 'repaso'].forEach(function(k){ av[k] = _curObj(p[k]); });
  /* «aprobado» solo vale si salió de la prueba: se descartan las marcas sin puntaje (la falla del «aprobado 100 %») */
  Object.keys(av.aprob).forEach(function(k){
    var a = av.aprob[k];
    if(!a || typeof a.ok !== 'boolean' || typeof a.tot !== 'number'){ delete av.aprob[k]; if(av.resp[k]) delete av.resp[k]; }
  });
  var ra = _curObj(p.racha);
  av.racha = { ult:(typeof ra.ult === 'string' ? ra.ult : ''), dias:(+ra.dias || 0) };
  av.puntos = +p.puntos || 0;
  av.insignias = Array.isArray(p.insignias) ? p.insignias.slice() : [];
  av.final = (p.final && typeof p.final === 'object') ? p.final : null;
  if(migrado) _curGuardarAv(av);
  return av;
}
function _curGuardarAv(av){ _curSet(_curAvKey(), JSON.stringify(av)); }

/* La práctica de la Obra Ejemplo: por obra y por usuario */
function _curLeerSb(){
  var r = _curGet(_curSbKey()), p = null;
  if(r){ try{ p = JSON.parse(r); }catch(e){ p = null; } }
  if(!p || typeof p !== 'object'){
    /* lo marcado antes de la tanda 1 (en sessionStorage) pasa una sola vez al guardado del equipo */
    p = _curObj(_curViejo());
    if(Object.keys(_curObj(p.prac)).length || Object.keys(_curObj(p.regs)).length) _curGuardarSb(p);
  }
  p = _curObj(p);
  return { prac:_curObj(p.prac), regs:_curObj(p.regs) };
}
function _curGuardarSb(st){ _curSet(_curSbKey(), JSON.stringify({ prac:_curObj(st.prac), regs:_curObj(st.regs) })); }

/* Borra las marcas de práctica de la Obra Ejemplo (no toca el avance de aprendizaje) */
function cursoLimpiarSandbox(){
  [function(){ return sessionStorage; }, function(){ return localStorage; }].forEach(function(f){
    try{
      var a = f();
      for(var i = a.length - 1; i >= 0; i--){
        var k = a.key(i);
        if(k && k.indexOf('curso_sandbox_v1:') === 0) a.removeItem(k);
      }
    }catch(e){}
  });
  Object.keys(_CUR_MEM).forEach(function(k){ if(k.indexOf('curso_sandbox_v1:') === 0) delete _CUR_MEM[k]; });
}

/* Borra el avance de ESTE usuario en ESTE equipo (lo pide el propio aprendiz) */
function cursoBorrarAvance(){
  _curDesmontarPlayer(); CURJ = null;
  _curQuitar(_curAvKey()); _curQuitar(_curSbKey());
  try{ sessionStorage.removeItem(_curSbKey()); }catch(e){}
  CURW.lecId = {};
}

function _curTocarRacha(av){
  var h = _curHoy();
  if(av.racha.ult === h) return;
  av.racha.dias = (av.racha.ult === _curDiaMas(h, -1)) ? (av.racha.dias || 0) + 1 : 1;
  av.racha.ult = h;
}

function _curCargarJson(){
  if(CURW.data) return Promise.resolve(CURW.data);
  var url = 'cursos/curso-01.json?v=' + encodeURIComponent(CUR_DATOS_VER || '1');
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
function _curNomMod(m){ return (m && m.n) ? 'Módulo ' + m.n : 'Inducción'; }

/* Las lecciones de un módulo. Si no trae «lecciones», vale su «interactivo» suelto (como antes de la tanda 1). */
function _curLecs(m){
  if(!m) return [];
  if(m.lecciones && m.lecciones.length) return m.lecciones;
  if(m.interactivo) return [{ id:m.interactivo.id, titulo:m.interactivo.titulo, min:Math.max(1, Math.round((m.interactivo.dur || 60) / 60)), idea:'', interactivo:m.interactivo }];
  return [];
}
function _curVista(av, lecId){ return !!(av.lec[lecId] && av.lec[lecId].visto); }
function _curLecActual(m, av){
  var L = _curLecs(m), i;
  if(!L.length) return null;
  for(i = 0; i < L.length; i++) if(L[i].id === CURW.lecId[m.id]) return L[i];
  for(i = 0; i < L.length; i++) if(!_curVista(av, L[i].id)) return L[i];
  return L[0];
}
function _curModoDe(lec, av){ return av.lecModo[lec.id] || av.modo || 'clasico'; }
function _curAprobado(av, modId){ var a = av.aprob[modId]; return !!(a && a.ok === true); }

/* Qué sigue al terminar una lección: la siguiente lección o la práctica */
function _curSigue(m, lec){
  var L = _curLecs(m);
  for(var i = 0; i < L.length; i++) if(L[i].id === lec.id && L[i + 1]) return { tipo:'lec', lec:L[i + 1], n:i + 2 };
  return { tipo:'prac' };
}
function _curBotonSigue(m, lecId){
  var lec = null, L = _curLecs(m);
  for(var i = 0; i < L.length; i++) if(L[i].id === lecId) lec = L[i];
  var s = lec ? _curSigue(m, lec) : { tipo:'prac' };
  return s.tipo === 'lec'
    ? { id:'cur-b-sigl', txt:'Sigue: Lección ' + s.n + ' · ' + s.lec.titulo, lec:s.lec.id }
    : { id:'cur-b-prac', txt:'Sigue: la práctica', lec:null };
}
function _curIrSigue(m, b){
  if(b.lec){
    CURW.lecId[m.id] = b.lec; _curPintar();
    var c = document.getElementById('cur-lec-cab'); if(c && c.scrollIntoView) c.scrollIntoView({ behavior:'smooth', block:'start' });
  } else {
    var el = document.getElementById('cur-prac-sec'); if(el && el.scrollIntoView) el.scrollIntoView({ behavior:'smooth', block:'start' });
  }
}

/* La lección quedó vista (en cualquiera de los dos modos): se anota una sola vez */
function _curMarcarVista(lecId, modo){
  var av = _curLeerAv();
  if(_curVista(av, lecId)) return false;
  av.lec[lecId] = { visto:true, fecha:_curHoy(), modo:modo };
  av.puntos += 10;
  _curTocarRacha(av);
  _curGuardarAv(av);
  _curPintarLista(); _curPintarLecs();
  return true;
}

/* ══ LÁMINAS (salen del JSON: «laminas» con desde, eti, tit, txt y norma) ═════════════════════════════════════ */
function _curLaminaEn(inter, t){
  var L = inter.laminas || [], k = -1;
  for(var i = 0; i < L.length; i++){ if(t >= L[i].desde - 0.001) k = i; else break; }
  return k;
}
function _curMarcas(s){
  return _curEsc(s).replace(/\[\[(.+?)\]\]/g, '<mark class="cur-m">$1</mark>');
}
function _curLaminaHtml(x){
  var h = '<span class="eti">' + _curEsc(x.eti) + '</span><h4 class="tit">' + _curEsc(x.tit) + '</h4>';
  if(x.txt) h += '<p class="txt">' + _curMarcas(x.txt) + '</p>';
  if(x.norma) h += '<div class="norma">' + _curMarcas(x.norma) + '</div>';
  return h;
}

/* ══ MODO CLÁSICO: REPRODUCTOR CON PREGUNTAS (Orden 29) ══════════════════════════════════════ */
function _curCalcularCorte(t, pausas){
  var target = t + 5.0;
  if(!pausas || !pausas.length) return target;
  for(var i = 0; i < pausas.length; i++){
    if(pausas[i] >= target && pausas[i] <= target + 2.0) return pausas[i];
  }
  return target;
}

function _curPlayerState(interactivo){
  var av = _curLeerAv(), ps = (av.player && av.player[interactivo.id]) || {};
  return {
    lec: interactivo,
    t: (typeof ps.t === 'number') ? Math.min(ps.t, interactivo.dur) : 0,
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
  var av = _curLeerAv(), ant = _curObj(av.player[CURP.lec.id]);
  ant.t = CURP.t; ant.vel = CURP.vel; ant.cc = CURP.cc;
  ant.cola = CURP.cola; ant.respondidas = CURP.respondidas; ant.vistaMax = CURP.vistaMax;
  av.player[CURP.lec.id] = ant;
  _curGuardarAv(av);
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
  if(cb){ cb.className = CURP.cc ? 'btn chico on' : 'btn chico sec'; cb.setAttribute('aria-pressed', CURP.cc ? 'true' : 'false'); }

  if(CURP.modo === 'leccion'){
    if(velo){ velo.hidden = true; velo.style.background = ''; }
    if(lam){
      var t = CURP.t, LM = CURP.lec.laminas || [], k = _curLaminaEn(CURP.lec, t);
      if(lam.getAttribute('data-k') !== 'l' + k){
        lam.innerHTML = (k > -1) ? _curLaminaHtml(LM[k])
          : '<span class="eti">' + _curEsc(CURP.lec.modulo || '') + '</span><h4 class="tit">' + _curEsc(CURP.lec.titulo || '') + '</h4>';
        lam.setAttribute('data-k', 'l' + k);
      }
      /* Subrayado que avanza mientras dura la lámina */
      var ms = lam.querySelectorAll('mark.cur-m');
      if(ms.length && k > -1){
        var ini = LM[k].desde, fin = LM[k + 1] ? LM[k + 1].desde : CURP.lec.dur;
        var p = Math.max(0, Math.min(1, ((t - ini) / Math.max(1, fin - ini) - 0.2) / 0.7));
        for(var j = 0; j < ms.length; j++){
          var x = Math.max(0, Math.min(1, p * ms.length - j));
          ms[j].style.backgroundSize = (x * 100).toFixed(1) + '% .3em';
        }
      }
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
      /* Terminar la lección la deja «vista». NO aprueba el módulo: eso solo lo hace la prueba. */
      _curMarcarVista(CURP.lec.id, 'clasico');
      var mAct = _curMod(CURW.modId), bs2 = _curBotonSigue(mAct, CURP.lec.id);
      velo.hidden = false;
      velo.innerHTML = '<span class="grande">Lección vista ✓</span>' +
        '<div class="acc"><button type="button" class="btn chico sec" id="cur-b-rev">Ver de nuevo</button>' +
        '<button type="button" class="btn chico on" id="' + bs2.id + '">' + _curEsc(bs2.txt) + '</button></div>';
      var rb = document.getElementById('cur-b-rev'); if(rb) rb.onclick = function(){ CURP.t = 0; CURP.jugando = true; _curPintarPlayer(); _curPintarPregs(); };
      var pb2 = document.getElementById(bs2.id); if(pb2) pb2.onclick = function(){ _curIrSigue(mAct, bs2); };
    }
  } else if(CURP.modo === 'aviso'){
    if(sub){ sub.hidden = !CURP.cc; sub.textContent = ''; }
    if(velo){
      velo.hidden = false;
      velo.style.background = '';
      var qAviso = _curObtenerPreg(CURP.cola[0]);
      velo.innerHTML = '<small style="color:#A9C3D1;letter-spacing:.05em">TU PREGUNTA</small>' +
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
        lam.setAttribute('data-k', 'r');
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
                       '<button type="button" class="btn chico sec" id="cur-b-otravez">Volver a ver la respuesta</button>' +
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

function _curPlayerHtml(inter){
  var h = '<div class="cur-repro" id="cur-repro-box">' +
       '<div class="cur-pantalla" id="cur-pantalla-marco">' +
       '<div id="cur-lam" class="cur-lam"></div>' +
       '<div id="cur-velo" class="cur-velo" hidden></div>' +
       '</div>' +
       '<div id="cur-subtit" class="cur-subtit"></div>' +
       '<div class="cur-ctrls">' +
       '<button type="button" id="cur-b-play" aria-label="Reproducir">▶</button>' +
       '<span class="tiempo" id="cur-tiempo">0:00 / ' + _curMmss(inter.dur) + '</span>' +
       '<input type="range" id="cur-seek" min="0" max="' + _curEsc(inter.dur) + '" step="0.1" value="0" aria-label="Línea de tiempo">' +
       '<button type="button" id="cur-b-cc" class="on" aria-pressed="true" aria-label="Subtítulos">CC</button>' +
       '<select id="cur-vel" aria-label="Velocidad de reproducción">' +
       '<option value="0.75">0.75×</option>' +
       '<option value="1" selected>1×</option>' +
       '<option value="1.25">1.25×</option>' +
       '<option value="1.5">1.5×</option>' +
       '</select>' +
       '</div>' +
       '</div>';
  if(inter.preguntas && inter.preguntas.length){
    h += '<div class="cur-pregs-bloque">' +
         '<div class="cur-pregs-head"><b>¿No te quedó claro?</b><small>Toca una pregunta: la lección sigue y a los 5 s te la responde en pantalla</small></div>' +
         '<div id="cur-pregs-lista" class="cur-pregs-lista"></div>' +
         '</div>';
  }
  return h;
}

/* ══ MODO JUGANDO: la misma lección, tarjeta por tarjeta, con un reto rápido al final ═════════════════════════ */
function _curFrasesDe(inter, k){
  var L = inter.laminas || [], ini = L[k] ? L[k].desde : 0, fin = L[k + 1] ? L[k + 1].desde : inter.dur + 1;
  return (inter.cues || []).filter(function(c){ return c[0] >= ini - 0.001 && c[0] < fin - 0.001; }).map(function(c){ return c[2]; });
}

function _curMontarJuego(inter){
  var av = _curLeerAv(), ps = _curObj(av.player[inter.id]), n = (inter.laminas || []).length;
  CURJ = { lec:inter, i:Math.max(0, Math.min(Math.max(0, n - 1), +ps.carta || 0)), fase:(n ? 'cartas' : 'fin'), q:0, ver:false, gano:false };
  if(!n) CURJ.gano = _curMarcarVista(inter.id, 'jugando');
  _curPintarJuego();
}

function _curGuardarCarta(){
  if(!CURJ) return;
  var av = _curLeerAv(), ant = _curObj(av.player[CURJ.lec.id]);
  ant.carta = CURJ.i;
  av.player[CURJ.lec.id] = ant;
  _curGuardarAv(av);
}

function _curPintarJuego(){
  var box = document.getElementById('cur-juego');
  if(!box || !CURJ) return;
  var I = CURJ.lec, L = I.laminas || [], Q = I.preguntas || [], av = _curLeerAv();
  var total = L.length + Q.length, hecho = CURJ.fase === 'cartas' ? CURJ.i : (CURJ.fase === 'reto' ? L.length + CURJ.q : total);
  var h = '<div class="cur-j-top"><span id="cur-j-donde">' +
          (CURJ.fase === 'cartas' ? 'Tarjeta ' + (CURJ.i + 1) + ' de ' + L.length :
           CURJ.fase === 'reto' ? 'Reto rápido · pregunta ' + (CURJ.q + 1) + ' de ' + Q.length : 'Lección completa') +
          '</span><span id="cur-j-puntos">⭐ ' + av.puntos + ' puntos · 🔥 ' + (av.racha.dias || 0) + (av.racha.dias === 1 ? ' día seguido' : ' días seguidos') + '</span></div>' +
          '<div class="cur-j-barra"><i style="width:' + (total ? Math.round(hecho * 100 / total) : 100) + '%"></i></div>';

  if(CURJ.fase === 'cartas'){
    var x = L[CURJ.i], fr = _curFrasesDe(I, CURJ.i);
    h += '<div class="cur-j-carta" id="cur-j-carta"><span class="eti">' + _curEsc(x.eti) + '</span><h4>' + _curEsc(x.tit) + '</h4>' +
         (x.txt ? '<p class="txt">' + _curMarcas(x.txt) + '</p>' : '') +
         (x.norma ? '<div class="norma">' + _curMarcas(x.norma) + '</div>' : '') +
         (fr.length ? '<ul>' + fr.map(function(f){ return '<li>' + _curEsc(f) + '</li>'; }).join('') + '</ul>' : '') + '</div>' +
         '<div class="cur-j-acc"><button type="button" id="cur-j-atras"' + (CURJ.i === 0 ? ' disabled' : '') + '>← Atrás</button>' +
         '<button type="button" class="pri" id="cur-j-sig">' + (CURJ.i < L.length - 1 ? 'Siguiente →' : (Q.length ? 'Ir al reto rápido →' : 'Terminar la lección ✓')) + '</button></div>';
  } else if(CURJ.fase === 'reto'){
    var q = Q[CURJ.q];
    h += '<div class="cur-j-carta" id="cur-j-carta"><span class="eti">¿Lo sabes?</span><h4>' + _curEsc(q.texto) + '</h4>';
    if(CURJ.ver){
      h += (q.pasos || []).filter(function(p){ return p.t !== 'cierre' && p.txt; }).map(function(p){
        return '<div class="cur-j-paso"><b>' + _curEsc(p.tit) + '</b>' + _curEsc(p.txt) + '</div>';
      }).join('');
    } else {
      h += '<p class="txt">Piénsalo un momento y luego mira la respuesta.</p>';
    }
    h += '</div><div class="cur-j-acc">' +
         (CURJ.ver ? '<button type="button" id="cur-j-no">La repaso</button><button type="button" class="pri" id="cur-j-si">La sabía ✓</button>'
                   : '<button type="button" class="pri" id="cur-j-ver">Ver la respuesta</button>') + '</div>';
  } else {
    var mAct = _curMod(CURW.modId), b = _curBotonSigue(mAct, I.id);
    h += '<div class="cur-j-carta" id="cur-j-carta"><span class="eti">' + _curEsc(I.titulo || '') + '</span><h4>¡Lección completa! ✓</h4>' +
         '<p class="txt">' + (CURJ.gano ? 'Ganaste 10 puntos. ' : '') + 'Esta lección ya cuenta como vista, también en el modo Clásico.</p></div>' +
         '<div class="cur-j-acc"><button type="button" id="cur-j-rep">Repetir</button>' +
         '<button type="button" class="pri" id="' + b.id + '">' + _curEsc(b.txt) + '</button></div>';
  }
  box.innerHTML = h;

  var on = function(id, fn){ var e = document.getElementById(id); if(e) e.onclick = fn; };
  on('cur-j-atras', function(){ if(CURJ.i > 0){ CURJ.i--; _curGuardarCarta(); _curPintarJuego(); } });
  on('cur-j-sig', function(){
    if(CURJ.i < L.length - 1){ CURJ.i++; _curGuardarCarta(); }
    else if(Q.length){ CURJ.fase = 'reto'; CURJ.q = 0; CURJ.ver = false; }
    else { CURJ.fase = 'fin'; CURJ.gano = _curMarcarVista(I.id, 'jugando'); }
    _curPintarJuego();
  });
  on('cur-j-ver', function(){ CURJ.ver = true; _curPintarJuego(); });
  var responder = function(sabia){
    var q2 = Q[CURJ.q], a = _curLeerAv(), r = _curObj(a.repaso[q2.id]), nueva = !r.veces;
    var caja = sabia ? Math.min(3, (+r.caja || 1) + 1) : 1;
    a.repaso[q2.id] = { caja:caja, prox:_curDiaMas(_curHoy(), [1, 3, 7][caja - 1]), veces:(+r.veces || 0) + 1 };
    if(nueva) a.puntos += 2;
    _curGuardarAv(a);
    if(CURJ.q < Q.length - 1){ CURJ.q++; CURJ.ver = false; }
    else { CURJ.fase = 'fin'; CURJ.gano = _curMarcarVista(I.id, 'jugando'); }
    _curPintarJuego();
  };
  on('cur-j-si', function(){ responder(true); });
  on('cur-j-no', function(){ responder(false); });
  on('cur-j-rep', function(){ CURJ.i = 0; CURJ.fase = L.length ? 'cartas' : 'fin'; CURJ.q = 0; CURJ.ver = false; CURJ.gano = false; _curGuardarCarta(); _curPintarJuego(); });
  if(CURJ.fase === 'fin'){
    var mA = _curMod(CURW.modId), bb = _curBotonSigue(mA, I.id);
    on(bb.id, function(){ _curIrSigue(mA, bb); });
  }
}

/* Cambiar de modo no pierde el lugar: el segundo del reproductor y la tarjeta se traducen entre sí */
function _curCambiarModo(lec, modo, soloPreferencia){
  var av = _curLeerAv(), I = lec && lec.interactivo, ant;
  if(I){
    ant = _curObj(av.player[I.id]);
    if(CURP && CURP.lec === I){
      ant.t = CURP.t; ant.vel = CURP.vel; ant.cc = CURP.cc; ant.cola = CURP.cola; ant.respondidas = CURP.respondidas; ant.vistaMax = CURP.vistaMax;
      /* una lección ya terminada vuelve a empezar por la primera tarjeta */
      ant.carta = (CURP.t >= I.dur - 0.01) ? 0 : Math.max(0, _curLaminaEn(I, CURP.t));
    } else if(CURJ && CURJ.lec === I && CURJ.fase === 'cartas' && (I.laminas || [])[CURJ.i]){
      ant.carta = CURJ.i; ant.t = I.laminas[CURJ.i].desde;
    }
    av.player[I.id] = ant;
  }
  /* se suelta el reproductor SIN volver a guardar encima */
  if(_curTickTimer){ clearInterval(_curTickTimer); _curTickTimer = null; }
  document.removeEventListener('keydown', _curKeyHandler);
  CURP = null; CURJ = null;
  av.modo = modo;
  if(lec && !soloPreferencia) av.lecModo[lec.id] = modo;
  _curGuardarAv(av);
  _curPintar();
}

/* ══ ACCESO, EXAMEN FINAL Y CONSTANCIA CON FOLIO (tanda 4 · 14-15/11/2026) ═════════════════════════════════════
   · El curso completo se abre con un código de acceso (lo vende Marcelo por Yape o transferencia y lo crea en la Consola,
     «Academia»). Se activa con la cuenta de OBRASST (acad_canjear): vale en cualquier equipo donde se entre con ella.
     Lo que dice el servidor (acad_mi_estado) queda en el equipo («acad_estado:<usuario>») para abrir sin señal.
   · El examen final lo arma y lo califica el servidor (acad_examen_iniciar / acad_examen_entregar): preguntas de las
     pruebas de los módulos, con las opciones mezcladas, el tiempo, el mínimo y los intentos por día del curso. Lo
     marcado a medio examen queda en el equipo («acad_examen:<usuario>») por si se cierra la página. Con el mínimo sale
     la constancia con folio; su PDF lleva un QR a portal/verificar.html?f=<folio> (acad_constancia_ver, abierta).
   · La constancia dice las lecciones y los minutos que este equipo marcó como vistos: nada inventado. */
var CURA = { listo:false, cuenta:false, acceso:{}, constancias:[], examen:{} };
var CURX = null;   /* el examen final: { intento, preguntas, resp, nombre, fin (ms del equipo), timer, res, avisoFalta } */
var ACAD_VERIF_URL = 'https://descarganomaspe.github.io/sst-capacita/portal/verificar.html';
var ACAD_NOMBRE_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀÈÌÒÙàèìòùÇç'. -]+$/;

function _curCurso(){ return (CURW.data && CURW.data.acceso) || 'curso-01'; }
function _curHaySesion(){ return !!(window.TOK && TOK.uid) && typeof sbRpc === 'function'; }
function _curEstKey(){ return 'acad_estado:' + _curUid(); }
function _curExKey(){ return 'acad_examen:' + _curUid(); }
function _curCompleto(){ return !!CURA.acceso[_curCurso()]; }
function _curAbierto(m){ return !!(m && (m.desbloqueado || _curCompleto())); }
function _curConstancia(){
  var k = _curCurso(), L = CURA.constancias || [];
  for(var i = 0; i < L.length; i++) if(L[i] && L[i].curso === k && !L[i].anulada) return L[i];
  return null;
}
function _curPonerEstado(r){
  CURA.cuenta = !!(r && r.cuenta);
  CURA.acceso = {};
  ((r && r.acceso) || []).forEach(function(c){ CURA.acceso[c] = true; });
  CURA.constancias = (r && Array.isArray(r.constancias)) ? r.constancias : [];
  CURA.examen = _curObj(r && r.examen);
}
function _curGuardarEstado(){
  _curSet(_curEstKey(), JSON.stringify({ cuenta:CURA.cuenta, acceso:Object.keys(CURA.acceso), constancias:CURA.constancias, examen:CURA.examen, t:Date.now() }));
}
/* Lo que dice el servidor; sin señal, lo último que dijo en este equipo. Sin sesión: solo lo abierto del temario. */
function _curCargarEstado(){
  CURA = { listo:false, cuenta:false, acceso:{}, constancias:[], examen:{} };
  if(!_curHaySesion()){ CURA.listo = true; return Promise.resolve(CURA); }
  var g = null; try{ g = JSON.parse(_curGet(_curEstKey()) || 'null'); }catch(e){ g = null; }
  if(g && typeof g === 'object') _curPonerEstado(g);
  return Promise.resolve().then(function(){ return sbRpc('acad_mi_estado', {}); }).then(function(r){
    if(r && r.ok){ _curPonerEstado(r); _curGuardarEstado(); }
    CURA.listo = true; return CURA;
  }, function(){ CURA.listo = true; return CURA; });
}
function _curHuellaEstado(){
  return JSON.stringify([Object.keys(CURA.acceso).sort(), (CURA.constancias || []).map(function(c){ return c.folio + (c.anulada ? '-' : ''); })]);
}
function _curFechaLima(iso){
  try{ return new Intl.DateTimeFormat('es-PE', { timeZone:'America/Lima', day:'2-digit', month:'2-digit', year:'numeric' }).format(new Date(iso)); }
  catch(e){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(iso || ''); }
}

/* ── el código de acceso ── */
function _curCodigoHtml(){
  if(_curHaySesion()){
    return '<div class="cur-cod" id="cur-cod"><label for="cur-cod-in"><b>¿Ya tienes tu código de acceso?</b> Escríbelo y el curso completo queda abierto en tu cuenta.</label>' +
      '<div class="cur-cod-fila"><input id="cur-cod-in" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24" placeholder="ACA-XXXX-XXXX">' +
      '<button type="button" class="bt" id="cur-cod-bt">Activar</button></div>' +
      '<div class="msg" id="cur-cod-msg" role="status" hidden></div></div>';
  }
  return '<div class="cur-cod" id="cur-cod"><b>¿Ya tienes tu código de acceso?</b>' +
    '<p>Se activa con tu cuenta de OBRASST: así el curso queda abierto en cualquier equipo donde entres.</p>' +
    (typeof window.acadIrCuenta === 'function' ? '<button type="button" class="bt" id="cur-cod-cuenta">Entrar o crear mi cuenta</button>' : '') +
    '<div class="msg" id="cur-cod-msg" role="status" hidden></div></div>';
}
function _curCompraHtml(){
  var D = CURW.data || {};
  return '<p class="cur-compra">¿Todavía no lo tienes? El curso completo cuesta <b>S/ ' + _curEsc(D.precio_lanzamiento_pen) + '</b> al lanzamiento (luego S/ ' +
    _curEsc(D.precio_regular_pen) + '). Escríbenos a <a href="mailto:info@obrasstapp.com?subject=Academia%20OBRASST%20%C2%B7%20curso%20completo">info@obrasstapp.com</a>: ' +
    'te respondemos con cómo pagar y, con el pago confirmado, te mandamos tu código.</p>';
}
function _curMsgCod(t, clase){
  var m = document.getElementById('cur-cod-msg'); if(!m) return;
  m.hidden = !t; m.className = 'msg ' + (clase || ''); m.textContent = t || '';
}
function _curEnlazarCodigo(){
  var b = document.getElementById('cur-cod-bt'), i = document.getElementById('cur-cod-in'), cu = document.getElementById('cur-cod-cuenta');
  if(cu) cu.onclick = function(){
    try{ var t = window.acadIrCuenta(); if(t) _curMsgCod(t, 'gris'); }catch(e){}
  };
  if(!b || !i) return;
  var ir = function(){
    var v = String(i.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if(!v){ _curMsgCod('Escribe el código tal como te llegó.', 'mal'); i.focus(); return; }
    if(!/^ACA[A-Z0-9]{8}$/.test(v)){ _curMsgCod('El código empieza con ACA y lleva 8 letras y números más (por ejemplo ACA-7K2M-Q9XW). Revísalo.', 'mal'); i.focus(); return; }
    b.disabled = true; _curMsgCod('Activando…', 'gris');
    sbRpc('acad_canjear', { p_codigo:v }).then(function(r){
      b.disabled = false;
      if(r && r.ok){
        toast(r.ya_tenias ? 'Tu cuenta ya tenía el curso completo: el código no se gastó.' : 'Listo: el curso completo quedó abierto en tu cuenta.');
        CURA.acceso[r.curso || _curCurso()] = true; _curGuardarEstado();
        _curCargarEstado().then(function(){ _curPintar(); });
        return;
      }
      var mot = r && r.motivo;
      _curMsgCod(mot === 'usado' ? 'Ese código ya se activó en otra cuenta. Si es tuyo, escríbenos a info@obrasstapp.com.' :
                 mot === 'muchos_intentos' ? 'Demasiados intentos seguidos. Espera una hora y vuelve a probar.' :
                 mot === 'sin_cuenta' ? 'Entra a tu cuenta de OBRASST para activar el código.' :
                 'Ese código no existe. Revísalo letra por letra: no lleva O ni 0, ni I ni 1.', 'mal');
    }, function(){ b.disabled = false; _curMsgCod('No se pudo activar ahora (¿sin señal?). Inténtalo otra vez.', 'mal'); });
  };
  b.onclick = ir;
  i.onkeydown = function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); ir(); } };
}

/* ── el examen final ── */
function _curFaltan(){
  var av = _curLeerAv();
  return ((CURW.data && CURW.data.modulos) || []).filter(function(x){ return (x.quiz || []).length && !_curAprobado(av, x.id); });
}
function _curExCfg(){
  var e = _curObj(CURA.examen[_curCurso()]), D = CURW.data || {};
  return { preguntas:+e.preguntas || +D.preguntas_finales_propuestas || 20, minimo:+e.minimo || +D.aprobacion_pct_propuesta || 70,
           minutos:+e.minutos || 60, max:+e.max || 3, usados:+e.usados || 0, proximo:e.proximo || null, abierto:e.abierto || null };
}
function _curEstadoFinalTxt(){
  var c = _curConstancia();
  if(c) return '<span class="pill ok">aprobado ' + _curEsc(c.nota) + '%</span> · constancia lista';
  if(!_curCompleto()) return '<span class="pill gris">🔒 Con el curso completo</span>';
  var f = _curFaltan().length;
  if(f) return 'Primero aprueba los módulos (te ' + (f === 1 ? 'falta 1' : 'faltan ' + f) + ')';
  return _curExCfg().preguntas + ' preguntas · constancia con QR';
}
function _curNombreOk(n){ return n.length >= 5 && n.length <= 90 && n.indexOf(' ') > 0 && ACAD_NOMBRE_RE.test(n); }
function _curLimpioNombre(n){ return String(n || '').replace(/\s+/g, ' ').trim(); }
function _curExGuardar(){
  if(!CURX || !CURX.intento) return;
  _curSet(_curExKey(), JSON.stringify({ intento:CURX.intento, resp:CURX.resp, nombre:CURX.nombre }));
}
function _curExSoltar(){
  if(CURX && CURX.timer){ clearInterval(CURX.timer); CURX.timer = null; }
}
function _curExReloj(){
  if(!CURX || !CURX.preguntas) return;
  var queda = Math.max(0, Math.round((CURX.fin - Date.now()) / 1000));
  var txt = '⏱ Quedan ' + _curMmss(queda);
  ['cur-ex-reloj', 'cur-ex-reloj2'].forEach(function(id){ var e = document.getElementById(id); if(e){ e.textContent = txt; e.classList.toggle('poco', queda <= 300); } });
  if(queda <= 0 && !CURX.enviando){ _curExEntregar(true); }
}
function _curExContar(){
  if(!CURX || !CURX.preguntas) return 0;
  var n = 0; for(var i = 0; i < CURX.preguntas.length; i++) if(typeof CURX.resp[i] === 'number') n++;
  var e = document.getElementById('cur-ex-cuenta'); if(e) e.textContent = n + ' de ' + CURX.preguntas.length + ' respondidas';
  return n;
}
function _curExEmpezar(nombre){
  var m = document.getElementById('cur-ex-msg'), b = document.getElementById('cur-ex-empezar');
  if(b) b.disabled = true;
  if(m){ m.className = 'msg gris'; m.textContent = 'Preparando tu examen…'; m.hidden = false; }
  sbRpc('acad_examen_iniciar', { p_curso:_curCurso() }).then(function(r){
    if(b) b.disabled = false;
    if(r && r.ok){
      var g = null; try{ g = JSON.parse(_curGet(_curExKey()) || 'null'); }catch(e){ g = null; }
      var resp = (g && g.intento === r.intento && Array.isArray(g.resp)) ? g.resp : [];
      var nom = nombre || (g && g.intento === r.intento && g.nombre) || '';
      var desfase = r.ahora ? (Date.now() - Date.parse(r.ahora)) : 0;
      _curExSoltar();
      CURX = { intento:r.intento, preguntas:r.preguntas || [], resp:resp, nombre:nom, fin:Date.parse(r.vence) + desfase, minimo:r.minimo };
      _curExGuardar();
      _curPintar();
      return;
    }
    var mot = r && r.motivo, t;
    if(mot === 'ya_aprobaste'){ _curCargarEstado().then(function(){ _curPintar(); }); return; }
    t = mot === 'intentos' ? 'Ya diste los ' + _curEsc(r.max) + ' exámenes de las últimas 24 horas. Podrás volver a intentarlo ' + (r.proximo ? 'desde el ' + _curFechaHoraLima(r.proximo) : 'mañana') + '.' :
        mot === 'sin_acceso' ? 'El examen final se abre con el curso completo (activa tu código).' :
        mot === 'sin_cuenta' ? 'Entra a tu cuenta de OBRASST para dar el examen.' :
        'No se pudo preparar el examen. Inténtalo de nuevo en un momento.';
    if(m){ m.className = 'msg mal'; m.textContent = t; m.hidden = false; }
  }, function(){
    if(b) b.disabled = false;
    if(m){ m.className = 'msg mal'; m.textContent = 'El examen final necesita señal para empezar y para entregarse. Revisa tu conexión.'; m.hidden = false; }
  });
}
function _curFechaHoraLima(iso){
  try{ return new Intl.DateTimeFormat('es-PE', { timeZone:'America/Lima', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false }).format(new Date(iso)); }
  catch(e){ return String(iso || ''); }
}
function _curExEntregar(porTiempo){
  if(!CURX || !CURX.preguntas || CURX.enviando) return;
  var falta = CURX.preguntas.length - _curExContar(), m = document.getElementById('cur-ex-msg2');
  if(!CURX.nombre){
    var n2 = _curLimpioNombre((document.getElementById('cur-ex-nombre2') || {}).value);
    if(!_curNombreOk(n2)){
      if(m){ m.className = 'msg mal'; m.hidden = false; m.textContent = 'Escribe arriba tu nombre y apellido, solo con letras (como irá en la constancia).'; }
      var ni = document.getElementById('cur-ex-nombre2'); if(ni && !porTiempo) try{ ni.focus(); }catch(e){}
      if(!porTiempo) return;
    } else { CURX.nombre = n2; _curExGuardar(); }
  }
  if(falta > 0 && !porTiempo && !CURX.avisoFalta){
    CURX.avisoFalta = true;
    if(m){ m.className = 'msg ojo'; m.hidden = false;
      m.textContent = 'Te ' + (falta === 1 ? 'falta 1 pregunta' : 'faltan ' + falta + ' preguntas') + ' por responder (cuentan como mal). Si ya terminaste, toca otra vez «Entregar».'; }
    var bt = document.getElementById('cur-ex-entregar'); if(bt) bt.textContent = 'Entregar igual';
    return;
  }
  CURX.enviando = true;
  var bt2 = document.getElementById('cur-ex-entregar'); if(bt2){ bt2.disabled = true; bt2.textContent = 'Entregando…'; }
  var av = _curLeerAv(), lecs = Object.keys(av.lec).filter(function(k){ return av.lec[k] && av.lec[k].visto; });
  var resp = CURX.preguntas.map(function(_, i){ return typeof CURX.resp[i] === 'number' ? CURX.resp[i] : null; });
  sbRpc('acad_examen_entregar', { p_intento:CURX.intento, p_resp:resp, p_nombre:CURX.nombre, p_lecciones:lecs }).then(function(r){
    CURX.enviando = false;
    if(r && r.ok){
      _curExSoltar(); _curQuitar(_curExKey());
      if(r.aprobado && r.constancia){
        CURA.constancias = [r.constancia].concat(CURA.constancias || []); _curGuardarEstado();
        CURX = { res:r, recien:true };
        var a2 = _curLeerAv(); a2.final = { ok:true, folio:r.folio, pct:r.pct, fecha:_curHoy() }; a2.puntos += 50; _curTocarRacha(a2); _curGuardarAv(a2);
      } else CURX = { res:r };
      _curCargarEstado().then(function(){ _curPintar(); });
      _curPintar();
      return;
    }
    var mot = r && r.motivo;
    if(bt2){ bt2.disabled = false; bt2.textContent = 'Entregar'; }
    if(m){ m.className = 'msg mal'; m.hidden = false;
      m.textContent = mot === 'nombre' ? 'Revisa tu nombre: nombre y apellido, solo letras.' :
                      mot === 'no_existe' ? 'Este examen ya no es de esta cuenta. Vuelve a abrir la Academia.' :
                      'No se pudo entregar. Tus respuestas siguen aquí: vuelve a tocar «Entregar».'; }
  }, function(){
    CURX.enviando = false;
    if(bt2){ bt2.disabled = false; bt2.textContent = 'Entregar'; }
    if(m){ m.className = 'msg mal'; m.hidden = false; m.textContent = 'Sin señal: no se pudo entregar. Tus respuestas siguen guardadas aquí; con señal, toca «Entregar» (tienes 3 minutos de gracia al acabar el tiempo).'; }
  });
}
function _curConstanciaHtml(c, recien, r){
  var D = CURW.data || {};
  var h = '';
  if(recien) h += '<div class="cur-felicita" role="status">🎉 <b>¡Aprobaste el examen final!</b> ' + _curEsc(c.bien) + ' de ' + _curEsc(c.tot) + ' (' + _curEsc(c.nota) + ' %).</div>';
  h += '<div class="cur-box cur-cf" id="cur-cf"><b>📜 Tu constancia</b><dl>' +
       '<dt>Nombre</dt><dd>' + _curEsc(c.nombre) + '</dd>' +
       '<dt>Curso</dt><dd>' + _curEsc(c.curso_titulo || D.titulo) + '</dd>' +
       '<dt>Examen final</dt><dd>' + _curEsc(c.nota) + ' % (' + _curEsc(c.bien) + ' de ' + _curEsc(c.tot) + ')</dd>' +
       '<dt>Lecciones vistas</dt><dd>' + _curEsc(c.lecciones) + ' de ' + _curEsc(c.lecciones_tot) + ' (' + _curEsc(c.minutos) + ' min)</dd>' +
       '<dt>Emitida</dt><dd>' + _curEsc(_curFechaLima(c.emitida)) + '</dd>' +
       '<dt>Folio</dt><dd><b class="cur-folio">' + _curEsc(c.folio) + '</b></dd></dl>' +
       '<div class="cur-cf-acc"><button type="button" class="bt" id="cur-cf-pdf">Descargar constancia (PDF con QR)</button>' +
       '<a class="bt sec" href="' + _curEsc(ACAD_VERIF_URL + '?f=' + encodeURIComponent(c.folio)) + '" target="_blank" rel="noopener">Comprobarla en línea</a></div>' +
       '<div class="msg" id="cur-cf-msg" role="status" hidden></div>' +
       '<small class="tenue">El QR del PDF abre la página de verificación de OBRASST: ahí cualquiera comprueba el folio, el nombre y la nota. ' +
       'Si el nombre salió mal, escríbenos a info@obrasstapp.com.</small></div>';
  return h;
}
function _curFinalHtml(){
  var D = CURW.data || {}, c = _curConstancia(), cfg = _curExCfg(), h = '';
  h += '<div class="cur-head"><div><h3>🏁 Examen final y constancia</h3><p class="sub" style="margin:2px 0 0">' + cfg.preguntas +
       ' preguntas de las pruebas de los módulos, en ' + cfg.minutos + ' minutos; se aprueba con ' + cfg.minimo +
       ' %. La nota la pone el servidor y la constancia sale con un folio que cualquiera comprueba con su QR.</p></div></div>';
  if(c){
    h += _curConstanciaHtml(c, CURX && CURX.recien);
  } else if(CURX && CURX.preguntas){
    h += '<div class="cur-ex-barra"><span id="cur-ex-reloj" class="cur-reloj"></span><span id="cur-ex-cuenta"></span></div>' +
         (CURX.nombre ? '<p class="tenue" style="margin:0 0 8px">Para la constancia: <b>' + _curEsc(CURX.nombre) + '</b>. Lo que marcas se guarda en este equipo mientras das el examen.</p>'
           /* lo empezó en otro equipo (o se borró lo guardado): el nombre se pide aquí */
           : '<div style="margin:0 0 10px"><label for="cur-ex-nombre2">Tu nombre completo, tal como irá en la constancia</label>' +
             '<input id="cur-ex-nombre2" maxlength="90" autocomplete="name" placeholder="Nombres y apellidos"></div>') +
         '<form id="cur-ex" class="cur-ex">';
    CURX.preguntas.forEach(function(p, i){
      h += '<fieldset class="cur-preg"><legend><b>' + (i + 1) + '. ' + _curEsc(p.q) + '</b></legend><div class="cur-ops">' +
           (p.ops || []).map(function(op, oi){
             return '<label class="cur-op"><input type="radio" name="ex' + i + '" value="' + oi + '"' + (CURX.resp[i] === oi ? ' checked' : '') + '> <span>' + _curEsc(op) + '</span></label>';
           }).join('') + '</div></fieldset>';
    });
    h += '<div class="cur-ex-fin"><button type="submit" class="bt" id="cur-ex-entregar">Entregar</button><span id="cur-ex-reloj2" class="cur-reloj"></span></div>' +
         '<div class="msg" id="cur-ex-msg2" role="status" hidden></div></form>';
  } else if(CURX && CURX.res){
    var r = CURX.res, pm = _curObj(r.por_modulo), flojos = [];
    ((D.modulos) || []).forEach(function(x){ var v = pm[x.id]; if(v && v.tot && v.bien < v.tot) flojos.push({ m:x, v:v }); });
    h += '<div class="cur-box cur-res"><b>' + (r.motivo === 'vencido' ? '⏱ Se acabó el tiempo' : 'Esta vez no alcanzó') + '</b>' +
         '<p style="margin:0">Sacaste <b>' + _curEsc(r.bien) + ' de ' + _curEsc(r.tot) + ' (' + _curEsc(r.pct) + ' %)</b>. Para aprobar necesitas ' + _curEsc(r.minimo || cfg.minimo) + ' %.</p>' +
         (flojos.length ? '<p style="margin:0">Repasa lo que más falló:</p><div class="cur-repasa">' + flojos.map(function(f){
            return '<button type="button" class="cur-lec" data-cur-ir="' + _curEsc(f.m.id) + '">' + _curEsc(_curNomMod(f.m)) + ' · ' + _curEsc(f.m.titulo) + ' · ' + f.v.bien + ' de ' + f.v.tot + '</button>';
          }).join('') + '</div>' : '') +
         '<p class="tenue" style="margin:0">Exámenes en las últimas 24 horas: ' + cfg.usados + ' de ' + cfg.max + '.</p>' +
         '<div><button type="button" class="bt" id="cur-ex-otra">Volver al examen final</button></div></div>';
  } else if(!_curCompleto()){
    h += '<div class="cur-box"><b>El examen final se abre con el curso completo</b>' +
         '<p style="margin:0;font-size:14px">Con tu código de acceso se abren los 9 módulos, el examen final y la constancia con QR.</p>' +
         _curCodigoHtml() + _curCompraHtml() + '</div>';
  } else if(!_curHaySesion()){
    h += '<div class="cur-box"><b>Entra a tu cuenta para dar el examen</b><p style="margin:0;font-size:14px">El examen final y la constancia van con tu cuenta de OBRASST.</p>' + _curCodigoHtml() + '</div>';
  } else {
    var falta = _curFaltan();
    if(falta.length){
      h += '<div class="cur-box"><b>Antes del examen final, aprueba la prueba de cada módulo</b>' +
           '<p style="margin:0;font-size:14px">Te ' + (falta.length === 1 ? 'falta 1' : 'faltan ' + falta.length) + ':</p><div class="cur-repasa">' + falta.map(function(x){
             return '<button type="button" class="cur-lec" data-cur-ir="' + _curEsc(x.id) + '">' + _curEsc(_curNomMod(x)) + ' · ' + _curEsc(x.titulo) + '</button>';
           }).join('') + '</div></div>';
    } else {
      var g = null; try{ g = JSON.parse(_curGet(_curExKey()) || 'null'); }catch(e){ g = null; }
      var abierto = cfg.abierto && cfg.abierto.intento;
      h += '<div class="cur-box"><b>Todo listo para tu examen final</b><ul class="cur-reglas">' +
           '<li>' + cfg.preguntas + ' preguntas, con las opciones mezcladas. Tienes ' + cfg.minutos + ' minutos; al acabar el tiempo se entrega solo.</li>' +
           '<li>Se aprueba con ' + cfg.minimo + ' %. Puedes empezar ' + cfg.max + ' exámenes cada 24 horas (llevas ' + cfg.usados + ').</li>' +
           '<li>Necesitas señal para empezar y para entregar. Lo que marcas se guarda en este equipo.</li></ul>';
      if(abierto){
        h += '<p style="margin:0">Tienes un examen empezado: sigue donde lo dejaste (el tiempo corre desde que empezó).</p>' +
             '<div><button type="button" class="bt" id="cur-ex-seguir">Seguir con mi examen</button></div>';
      } else {
        h += '<label for="cur-ex-nombre">Tu nombre completo, tal como irá en la constancia</label>' +
             '<input id="cur-ex-nombre" maxlength="90" autocomplete="name" value="' + _curEsc((g && g.nombre) || '') + '" placeholder="Nombres y apellidos">' +
             '<small class="tenue">Revísalo bien: después no se cambia (si sale mal, hay que escribirnos).</small>' +
             '<div><button type="button" class="bt" id="cur-ex-empezar">Empezar el examen final</button></div>';
      }
      h += '<div class="msg" id="cur-ex-msg" role="status" hidden></div></div>';
    }
  }
  h += '<div class="cur-aviso" style="margin-top:12px" role="note"><b>Aviso:</b> ' + _curEsc(D.aviso_legal) + '</div>';
  return h;
}
function _curFinalEnlazar(){
  _curEnlazarCodigo();
  Array.prototype.forEach.call(document.querySelectorAll('[data-cur-ir]'), function(b){
    b.onclick = function(){ CURX = null; CURW.modId = b.getAttribute('data-cur-ir'); _curPintar(); };
  });
  var em = document.getElementById('cur-ex-empezar');
  if(em) em.onclick = function(){
    var i = document.getElementById('cur-ex-nombre'), n = _curLimpioNombre(i && i.value), m = document.getElementById('cur-ex-msg');
    if(!_curNombreOk(n)){
      if(m){ m.className = 'msg mal'; m.hidden = false; m.textContent = 'Escribe tu nombre y apellido, solo con letras (como irá en la constancia).'; }
      if(i) i.focus(); return;
    }
    _curExEmpezar(n);
  };
  var sg = document.getElementById('cur-ex-seguir'); if(sg) sg.onclick = function(){ _curExEmpezar(''); };
  var ot = document.getElementById('cur-ex-otra'); if(ot) ot.onclick = function(){ CURX = null; _curPintar(); };
  var f = document.getElementById('cur-ex');
  if(f && CURX && CURX.preguntas){
    Array.prototype.forEach.call(f.querySelectorAll('input[type=radio]'), function(x){
      x.onchange = function(){
        var k = +x.name.slice(2); CURX.resp[k] = +x.value; CURX.avisoFalta = false;
        var bt = document.getElementById('cur-ex-entregar'); if(bt && !CURX.enviando) bt.textContent = 'Entregar';
        _curExGuardar(); _curExContar();
      };
    });
    f.onsubmit = function(ev){ ev.preventDefault(); _curExEntregar(false); };
    _curExContar(); _curExReloj();
    if(!CURX.timer) CURX.timer = setInterval(function(){ if(!document.getElementById('cur-ex')){ _curExSoltar(); return; } _curExReloj(); }, 1000);
  }
  var pdf = document.getElementById('cur-cf-pdf');
  if(pdf) pdf.onclick = function(){
    var c = _curConstancia(), m = document.getElementById('cur-cf-msg'); if(!c) return;
    pdf.disabled = true; pdf.textContent = 'Armando el PDF…';
    cursoConstanciaFinalPDF(c).then(function(res){
      pdf.disabled = false; pdf.textContent = 'Descargar constancia (PDF con QR)';
      if(typeof bajarBlob === 'function') bajarBlob(res.blob, 'Constancia-Academia-OBRASST-' + c.folio + '.pdf');
      if(m){ m.className = 'msg ok'; m.hidden = false; m.textContent = 'Constancia lista (' + c.folio + '). No es un certificado oficial.'; }
    }, function(){
      pdf.disabled = false; pdf.textContent = 'Descargar constancia (PDF con QR)';
      if(m){ m.className = 'msg mal'; m.hidden = false; m.textContent = 'No se pudo armar el PDF ahora (la primera vez necesita señal). Inténtalo otra vez.'; }
    });
  };
}

/* ── el PDF de la constancia, con su QR (el mismo generador de QR de la app: qrcode-generator, MIT) ── */
function _curQRLib(){
  if(typeof window.qrcode === 'function') return Promise.resolve(window.qrcode);
  if(typeof cargarQRLib === 'function') return cargarQRLib();
  return Promise.reject('sin_qr');
}
function cursoConstanciaFinalPDF(c){
  return Promise.all([cargarEvPDF(), _curQRLib()]).then(function(x){
    var J = window.jspdf && window.jspdf.jsPDF; if(!J) throw new Error('sin_jspdf');
    var QR = (typeof x[1] === 'function') ? x[1] : window.qrcode;
    var url = ACAD_VERIF_URL + '?f=' + encodeURIComponent(c.folio);
    var doc = new J({ orientation:'landscape', unit:'mm', format:'a4' });
    var izq = 24, der = 297 - 24, lado = 44, xq = der - lado, cx = (izq + xq - 10) / 2, ancho = xq - 10 - izq;
    doc.setFillColor(11, 42, 58); doc.rect(0, 0, 297, 28, 'F');
    doc.setFillColor(245, 183, 0); doc.rect(0, 28, 297, 3, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text('ACADEMIA OBRASST · CONSTANCIA DE PARTICIPACIÓN AUTÓNOMA', 148.5, 17, { align:'center' });
    doc.setTextColor(20, 32, 42); doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.text('Se deja constancia de que', cx, 50, { align:'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
    var nom = doc.splitTextToSize(String(c.nombre || '').slice(0, 90), ancho);
    doc.text(nom, cx, 64, { align:'center' });
    var y = 64 + (nom.length - 1) * 9;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.text('participó en la Academia OBRASST en el curso', cx, y + 12, { align:'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    var cur = doc.splitTextToSize(String(c.curso_titulo || ''), ancho);
    doc.text(cur, cx, y + 23, { align:'center' }); y += 23 + (cur.length - 1) * 7;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.text('y aprobó su examen final con ' + c.nota + ' % (' + c.bien + ' de ' + c.tot + ' preguntas, calificado por el servidor de OBRASST).', cx, y + 12, { align:'center', maxWidth:ancho });
    doc.text('Lecciones vistas en la Academia: ' + c.lecciones + ' de ' + c.lecciones_tot + ' (' + c.minutos + ' minutos de contenido).', cx, y + 20, { align:'center', maxWidth:ancho });
    doc.text('Emitida el ' + _curFechaLima(c.emitida) + '   ·   Folio: ' + c.folio, cx, y + 30, { align:'center' });
    /* el QR: cuadritos de verdad (se imprime nítido) */
    var q = QR(0, 'M'); q.addData(url); q.make();
    var n = q.getModuleCount(), s = lado / n, yq = 46;
    doc.setFillColor(11, 42, 58);
    for(var r = 0; r < n; r++) for(var k = 0; k < n; k++) if(q.isDark(r, k)) doc.rect(xq + k * s, yq + r * s, s + 0.02, s + 0.02, 'F');
    doc.setFontSize(9); doc.setTextColor(60, 70, 80);
    doc.text(['Escanéalo para comprobar', 'esta constancia en línea.', 'O entra a la página de', 'verificación de OBRASST', 'y escribe el folio.'], xq + lado / 2, yq + lado + 6, { align:'center' });
    doc.setDrawColor(210, 216, 222); doc.roundedRect(24, 150, 249, 36, 3, 3);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(140, 45, 25);
    doc.text('AVISO LEGAL OBLIGATORIO', 148.5, 160, { align:'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60, 70, 80);
    doc.text('Este documento deja constancia de la participación autónoma en el curso y de la nota de su examen final en la Academia OBRASST.', 148.5, 168, { align:'center' });
    doc.text('NO es un certificado oficial, NO habilita legalmente para ejercer ni reemplaza las capacitaciones del empleador (Ley N.° 29783).', 148.5, 175, { align:'center' });
    doc.setFontSize(8.5); doc.setTextColor(120, 130, 140);
    doc.text(url, 148.5, 194, { align:'center' });
    return { blob:doc.output('blob'), url:url };
  });
}

/* ══ VISTA PRINCIPAL DE LA ACADEMIA ══════════════════════════════════════════════════════════ */
function vistaAcademia(caja){
  _curCss();
  CURW.caja = caja;
  _curExSoltar(); CURX = null;
  var ac = $('acciones'); if(ac) ac.innerHTML = '';
  cargando(caja);
  /* 15/11/2026 · lo que dice el servidor de esta cuenta (curso completo, constancia); si tarda, se pinta con lo guardado */
  var est = _curCargarEstado(), pintado = false, huella = '';
  var espera = new Promise(function(res){ setTimeout(res, 2500); });
  Promise.all([_curCargarJson(), Promise.race([est, espera])]).then(function(){
    if(CURW.caja !== caja || VISTA.actual !== 'academia') return;
    _curPintar(); pintado = true; huella = _curHuellaEstado();
  }).catch(function(){
    if(CURW.caja !== caja) return;
    caja.innerHTML = '<div class="tarj"><div class="tarj-cuerpo"><p class="msg mal">No se pudo cargar el catálogo de cursos.</p></div></div>';
  });
  est.then(function(){
    if(pintado && CURW.caja === caja && document.body.contains(caja) && _curHuellaEstado() !== huella && !(CURX && CURX.preguntas)) _curPintar();
  });
}

function _curAbiertosTxt(D){
  if(_curCompleto()) return 'Curso completo activado';
  var a = (D.modulos || []).filter(function(x){ return x.desbloqueado; }).map(function(x){ return x.n ? 'módulo ' + x.n : 'Inducción'; });
  if(!a.length) return '';
  var t = a.length > 1 ? a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1] : a[0];
  return t.charAt(0).toUpperCase() + t.slice(1) + (a.length > 1 ? ' abiertos' : ' abierto');
}

/* La lista de módulos (columna izquierda): se repinta sola cuando cambia el avance */
function _curPintarLista(){
  var box = document.getElementById('cur-lista'), D = CURW.data;
  if(!box || !D) return;
  var av = _curLeerAv(), h = '';
  D.modulos.forEach(function(x){
    var on = x.id === CURW.modId, L = _curLecs(x), vistas = L.filter(function(l){ return _curVista(av, l.id); }).length;
    var a = av.aprob[x.id], estadoPill;
    if(_curAprobado(av, x.id)) estadoPill = '<span class="pill ok">aprobado ' + _curEsc(a.pct) + '%</span>';
    else if(!_curAbierto(x)) estadoPill = '<span class="pill gris">🔒 Requiere acceso</span>';
    else if(a) estadoPill = '<span class="pill ojo">prueba ' + _curEsc(a.pct) + '% · falta aprobar</span>';
    else estadoPill = '<span class="pill ok">Abierto</span>' + (vistas ? ' · ' + vistas + ' de ' + L.length + ' lecciones' : '');
    h += '<button type="button" class="cur-mod' + (on ? ' on' : '') + (_curAbierto(x) ? '' : ' bloq') + '" data-cur-m="' + _curEsc(x.id) + '">' +
         '<span class="n">' + (x.n ? x.n : '★') + '</span><span class="tx"><b>' + _curEsc(x.titulo) + '</b><small>' + (L.length ? L.length + (L.length === 1 ? ' lección · ' : ' lecciones · ') : '') + _curEsc(x.duracion_min) + ' min · ' + estadoPill + '</small></span></button>';
  });
  /* 15/11/2026 · al final de la lista: el examen final y la constancia (tanda 4) */
  /* (no lleva data-cur-m: no es un módulo; las pruebas cuentan los módulos con ese atributo) */
  h += '<button type="button" class="cur-mod cur-mod-final' + (CURW.modId === 'final' ? ' on' : '') + (_curCompleto() ? '' : ' cerrado') + '" id="cur-fin-bt" data-cur-fin="1">' +
       '<span class="n">🏁</span><span class="tx"><b>Examen final y constancia</b><small>' + _curEstadoFinalTxt() + '</small></span></button>';
  box.innerHTML = h;
  Array.prototype.forEach.call(box.querySelectorAll('[data-cur-m]'), function(b){
    b.onclick = function(){
      CURW.modId = b.getAttribute('data-cur-m');
      if(!(CURX && CURX.preguntas)) CURX = null;
      _curPintar();
    };
  });
  var fb = document.getElementById('cur-fin-bt');
  if(fb) fb.onclick = function(){ CURW.modId = 'final'; _curPintar(); };
}

/* Las lecciones del módulo abierto */
function _curPintarLecs(){
  var box = document.getElementById('cur-lecs'), m = _curMod(CURW.modId);
  if(!box || !m) return;
  var av = _curLeerAv(), act = _curLecActual(m, av);
  box.innerHTML = _curLecs(m).map(function(l, i){
    var v = _curVista(av, l.id);
    return '<button type="button" class="cur-lec' + (act && act.id === l.id ? ' on' : '') + (v ? ' vista' : '') + '" data-cur-l="' + _curEsc(l.id) + '" aria-pressed="' + (act && act.id === l.id) + '">' +
           '<span>' + (i + 1) + ' · ' + _curEsc(l.titulo) + ' · ' + _curEsc(l.min) + ' min</span>' + (v ? '<span class="ok">✓ vista</span>' : '') + '</button>';
  }).join('');
  Array.prototype.forEach.call(box.querySelectorAll('[data-cur-l]'), function(b){
    b.onclick = function(){ CURW.lecId[m.id] = b.getAttribute('data-cur-l'); _curPintar(); };
  });
}

function _curPintar(){
  var caja = CURW.caja, D = CURW.data;
  if(!caja || !D || !document.body.contains(caja)) return;
  _curDesmontarPlayer(); CURJ = null;
  var esFinal = CURW.modId === 'final';
  var av = _curLeerAv(), sb = _curLeerSb(), m = _curMod(esFinal ? null : CURW.modId), EJ = D.ejemplo_sandbox || {};
  var lecs = _curLecs(m), lec = (!esFinal && _curAbierto(m)) ? _curLecActual(m, av) : null, modo = lec ? _curModoDe(lec, av) : 'clasico';
  if(lec) CURW.lecId[m.id] = lec.id;
  var abiertos = _curAbiertosTxt(D), completo = _curCompleto();
  var bloq1 = completo ? null : (D.modulos || []).filter(function(x){ return !_curAbierto(x); })[0];
  var h = '<div class="cur-wrap" id="cur-raiz">';
  h += '<div class="tarj"><div class="tarj-cuerpo"><div class="cur-head"><div><h2>🎓 ' + _curEsc(D.marca) + ' · ' + _curEsc(D.titulo) + '</h2>' +
       '<p class="sub" style="margin:2px 0 0">' + _curEsc(D.subtitulo) + '</p></div>' +
       '<div class="cur-precios">' + (abiertos ? '<span class="pill ok">' + _curEsc(abiertos) + '</span>' : '') +
       (completo ? '' : '<span class="pill azul">Lanzamiento S/ ' + _curEsc(D.precio_lanzamiento_pen) + ' · Luego S/ ' + _curEsc(D.precio_regular_pen) + '</span>') +
       (bloq1 ? '<button type="button" class="btn chico sec" id="cur-ir-codigo">🔑 Activar mi código</button>' : '') + '</div></div>' +
       '<div class="cur-aviso" style="margin-top:10px" role="note"><b>Aviso importante:</b> ' + _curEsc(D.aviso_legal) + '</div></div></div>';

  h += '<div class="cur-grid">';
  /* Columna izquierda: los módulos */
  h += '<div class="tarj"><div class="tarj-cuerpo"><h3>Módulos del curso (' + D.modulos.length + ')</h3><div class="cur-lista" id="cur-lista"></div></div></div>';

  /* Columna derecha: detalle del módulo (o el examen final) */
  h += '<div class="tarj"><div class="tarj-cuerpo" id="cur-det">';
  if(esFinal){
    h += _curFinalHtml();
  } else {
  h += '<div class="cur-head"><div><h3>' + _curEsc(_curNomMod(m)) + ' · ' + _curEsc(m.titulo) + '</h3><p class="sub" style="margin:2px 0 0">' + _curEsc(m.resumen) + '</p></div>' +
       (_curAbierto(m) ? '<span class="pill ok">Módulo abierto</span>' : '<span class="pill gris">🔒 Se abre con el curso completo</span>') + '</div>';

  /* Normas citadas */
  if(m.normas && m.normas.length){
    h += '<div class="cur-sec"><b>Normativa verificada del módulo</b><ul>' + m.normas.map(function(nr){
      return '<li><b>' + _curEsc(nr.norma) + '</b> (' + _curEsc(nr.articulo) + ')' +
             (nr.url ? ' — <a href="' + _curEsc(nr.url) + '" target="_blank" rel="noopener">fuente oficial</a>' : '') + '</li>';
    }).join('') + '</ul></div>';
  }

  if(!_curAbierto(m)){
    /* 15/11/2026 · el código de acceso (tanda 4): Marcelo lo vende y el alumno lo activa aquí, con su cuenta */
    h += '<div class="cur-sec"><div class="cur-box"><b>Acceso al curso completo</b>' +
         '<p style="margin:0;font-size:13.5px">Por ahora están abiertos: <b>' + _curEsc(abiertos || 'ninguno') + '</b>. Con el curso completo se abren los ' + (D.modulos || []).length +
         ' módulos, el examen final y la constancia con QR que cualquiera puede comprobar.</p>' +
         (lecs.length ? '<b>Lo que trae este módulo</b><ul style="margin:0;padding-left:18px;font-size:13.5px">' + lecs.map(function(l, i){
            return '<li>Lección ' + (i + 1) + ' · ' + _curEsc(l.titulo) + ' (' + _curEsc(l.min) + ' min)</li>';
          }).join('') + '<li>Práctica en la Obra Ejemplo y prueba de ' + ((m.quiz || []).length || D.preguntas_modulo_propuestas || 5) + ' preguntas</li></ul>' : '') +
         _curCodigoHtml() + _curCompraHtml() + '</div></div>';
  } else {
    /* Lecciones: la misma lección en modo Clásico o Jugando */
    if(lec){
      var I = lec.interactivo;
      h += '<div class="cur-sec" id="cur-lec-sec"><h4 style="margin:0">📚 Lecciones (' + lecs.length + ')</h4><div class="cur-lecs" id="cur-lecs"></div>';
      if(!av.modo){
        h += '<div class="cur-elige" id="cur-elige"><b style="font-size:17px">¿Cómo quieres aprender?</b>' +
             '<p>Es el mismo contenido, la misma prueba y la misma constancia. Puedes cambiar cuando quieras, en cada lección.</p>' +
             '<div class="cur-elige-ops">' +
             '<button type="button" data-cur-elige="clasico"><span class="ic">📖</span><b>Clásico</b><small>Leo, veo y respondo</small></button>' +
             '<button type="button" data-cur-elige="jugando"><span class="ic">🎯</span><b>Jugando</b><small>Tarjeta por tarjeta, con retos y puntos</small></button>' +
             '</div></div>';
      }
      h += '<div class="cur-lec-cab" id="cur-lec-cab"><div style="flex:1 1 240px;min-width:0"><h4>' + _curEsc(lec.titulo) + '</h4>' +
           (lec.idea ? '<p id="cur-idea"><b>La idea:</b> ' + _curEsc(lec.idea) + '</p>' : '') + '</div>' +
           '<div class="cur-modo" id="cur-modo" role="group" aria-label="Cómo quieres recorrer esta lección">' +
           '<button type="button" data-cur-modo="clasico" aria-pressed="' + (modo === 'clasico') + '">📖 Clásico</button>' +
           '<button type="button" data-cur-modo="jugando" aria-pressed="' + (modo === 'jugando') + '">🎯 Jugando</button></div></div>';
      h += (modo === 'jugando') ? '<div class="cur-juego" id="cur-juego"></div>' : _curPlayerHtml(I);
      h += '</div>';
    } else {
      h += '<div class="cur-sec"><div class="cur-box"><b>Lecciones de ' + _curEsc(_curNomMod(m)) + '</b>' +
           '<p style="margin:0;font-size:13px;color:var(--gris)">Este módulo todavía no tiene lecciones cargadas.</p></div></div>';
    }

    /* Práctica en la Obra Ejemplo (aislada: no toca datos reales) */
    var P = m.practica || {}, pasos = P.pasos || [], marc = _curObj(sb.prac[m.id]);
    h += '<div class="cur-sec" id="cur-prac-sec"><h4>🧪 Práctica guiada aislada · ' + _curEsc(EJ.obra || 'Obra Ejemplo') + '</h4>' +
         /* 14/11/2026 (noche) · la Obra Ejemplo no existe en la app: se dice dónde se hacen los pasos (revisión de la tanda 1) */
         '<p class="sub" style="margin:0 0 8px">La Obra Ejemplo es inventada. Haz los pasos en OBRASST, en una obra de prueba con datos inventados (nunca en tu obra de verdad), o recórrelos con los datos de esta página. Aquí solo marcas lo que terminaste: nada de esto toca datos reales.</p>' +
         '<div class="cur-box">' + (P.titulo ? '<b>' + _curEsc(P.titulo) + '</b>' : '') +
         '<span style="font-size:13px"><b>Personal Ejemplo (' + _curEsc(EJ.empresa || 'Constructora Ejemplo S.A.C. (Ejemplo)') + ')</b></span>' +
         '<ul style="margin:0;padding-left:18px;font-size:13px">' + (EJ.trabajadores || []).map(function(t){
           return '<li>' + _curEsc(t.nombre) + ' · ' + _curEsc(t.puesto) + ' · ' + _curEsc(t.frente) + ' — ' +
             (t.induccion ? '<span class="pill ok">Inducción al día</span>' : '<span class="pill ojo">Falta inducción</span>') + '</li>';
         }).join('') + '</ul>';
    if(pasos.length){
      h += '<b>Marca cada paso cuando lo termines</b>' + pasos.map(function(ps, idx){
        return '<label class="cur-chk"><input type="checkbox" data-cur-pp="' + idx + '"' + (marc[idx] ? ' checked' : '') + '> <span>' + _curEsc(ps) + '</span></label>';
      }).join('') +
      '<small class="tenue">Pasos hechos: <b id="cur-pp-count">' + pasos.filter(function(_, idx){ return !!marc[idx]; }).length + '</b> de ' + pasos.length + '</small>';
    }
    if(P.lista === 'registros_art33' || (!pasos.length && (EJ.registros_art33 || []).length)){
      h += '<b>Checklist de práctica: 8 registros obligatorios (D.S. N.° 005-2012-TR, art. 33)</b>' +
           (EJ.registros_art33 || []).map(function(rg, idx){
             var chk = !!(sb.regs && sb.regs['r' + idx]);
             return '<label class="cur-chk"><input type="checkbox" data-cur-reg="' + idx + '"' + (chk ? ' checked' : '') + '> <span>' + _curEsc(rg) + '</span></label>';
           }).join('') +
           '<small class="tenue">Registros marcados: <b id="cur-sb-count">' + Object.keys(sb.regs || {}).filter(function(k){ return sb.regs[k]; }).length + '</b> de ' + (EJ.registros_art33 || []).length + '</small>';
    }
    h += '</div></div>';

    /* Prueba del módulo: la única que aprueba */
    if(m.quiz && m.quiz.length){
      var yaAprob = av.aprob[m.id] || null, rGuard = (av.resp && av.resp[m.id]) || {};
      h += '<div class="cur-sec"><h4>📝 Prueba · ' + _curEsc(_curNomMod(m)) + ' (' + m.quiz.length + ' preguntas · se aprueba con ' + _curEsc(D.aprobacion_pct_propuesta) + '%)</h4>' +
           '<form id="cur-quiz">';
      m.quiz.forEach(function(q, qi){
        h += '<div class="cur-preg"><b>' + (qi + 1) + '. ' + _curEsc(q.q) + '</b><div class="cur-ops">' +
             q.ops.map(function(op, oi){
               var ch = (yaAprob && String(rGuard[qi]) === String(oi)) ? ' checked' : '';
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
             '<div class="msg" id="cur-pdf-msg" role="status"></div>' +
             '<small class="tenue">La constancia del curso completo, con un QR que cualquiera comprueba en línea, sale al aprobar el examen final.</small></div></div>';
      }
    }
  }
  }
  h += '<div class="cur-sec"><small class="tenue">' + (_curHaySesion() ? 'Tus lecciones y pruebas se guardan en este equipo; el curso completo y tu constancia, en tu cuenta. ' : 'Tu avance se guarda solo en este equipo. ') + '</small>' +
       '<button type="button" class="btn chico sec" id="cur-borrar">Borrar mi avance de este equipo</button></div>';
  h += '</div></div></div></div>';
  caja.innerHTML = h;

  _curPintarLista();
  _curPintarLecs();
  if(esFinal) _curFinalEnlazar(); else _curEnlazarCodigo();
  var irc = document.getElementById('cur-ir-codigo');
  if(irc && bloq1) irc.onclick = function(){
    CURX = null; CURW.modId = bloq1.id; _curPintar();
    var cc = document.getElementById('cur-cod');
    if(cc){ if(cc.scrollIntoView) cc.scrollIntoView({ behavior:'smooth', block:'center' }); var ci = document.getElementById('cur-cod-in'); if(ci) try{ ci.focus({ preventScroll:true }); }catch(e){} }
  };

  Array.prototype.forEach.call(caja.querySelectorAll('[data-cur-elige]'), function(b){
    b.onclick = function(){ _curCambiarModo(lec, b.getAttribute('data-cur-elige'), true); };
  });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-cur-modo]'), function(b){
    b.onclick = function(){
      var nuevo = b.getAttribute('data-cur-modo');
      if(nuevo === modo && av.modo) return;
      _curCambiarModo(lec, nuevo, false);
    };
  });

  if(lec){
    if(modo === 'jugando') _curMontarJuego(lec.interactivo);
    else _curMontarPlayer(lec.interactivo);
  }

  Array.prototype.forEach.call(caja.querySelectorAll('[data-cur-pp]'), function(c){
    c.onchange = function(){
      var s2 = _curLeerSb(), mm = _curObj(s2.prac[m.id]);
      mm[c.getAttribute('data-cur-pp')] = c.checked; s2.prac[m.id] = mm; _curGuardarSb(s2);
      var cnt = $('cur-pp-count'); if(cnt) cnt.textContent = Object.keys(mm).filter(function(k){ return mm[k]; }).length;
    };
  });
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
    var a2 = _curLeerAv(), antes = _curAprobado(a2, m.id);
    a2.resp[m.id] = resp;
    a2.aprob[m.id] = { ok:ok, bien:bien, tot:m.quiz.length, pct:pct, fecha:_curHoy() };
    if(ok && !antes){ a2.puntos += 20; _curTocarRacha(a2); }
    _curGuardarAv(a2);
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

  var bo = $('cur-borrar');
  if(bo) bo.onclick = function(){
    if(!window.confirm('¿Borrar tu avance de la Academia en este equipo? Se pierden las lecciones vistas, las pruebas y los puntos.')) return;
    cursoBorrarAvance();
    _curPintar();
  };
}

/* La constancia es la misma en los dos modos: no dice cómo se estudió */
function cursoConstanciaPDF(alumno, tituloCurso, mod){
  return cargarEvPDF().then(function(){
    var J = window.jspdf && window.jspdf.jsPDF; if(!J) throw new Error('sin_jspdf');
    var doc = new J({ orientation:'landscape', unit:'mm', format:'a4' });
    var folio = 'ACAD-' + String((mod && mod.n) || (mod ? 0 : 1)).padStart(2, '0') + '-' + Math.abs((alumno.length * 131 + Date.now()) % 100000).toString().padStart(5, '0');
    var fecha = _curHoy();
    doc.setFillColor(11, 42, 58); doc.rect(0, 0, 297, 28, 'F');
    doc.setFillColor(245, 183, 0); doc.rect(0, 28, 297, 3, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text('ACADEMIA OBRASST · CONSTANCIA DE PARTICIPACIÓN AUTÓNOMA', 148.5, 17, { align:'center' });
    doc.setTextColor(20, 32, 42); doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.text('Se deja constancia de participación práctica en el módulo piloto del curso:', 148.5, 52, { align:'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.text(String(alumno).slice(0, 80), 148.5, 72, { align:'center' });
    doc.setFontSize(15); doc.text(String(tituloCurso || 'Supervisor SST listo para obra'), 148.5, 92, { align:'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    if(mod && mod.titulo) doc.text(_curNomMod(mod) + ': ' + mod.titulo + ' (práctica en Obra Ejemplo aislada)', 148.5, 104, { align:'center' });
    doc.text('Fecha de emisión: ' + fecha + '   ·   Folio de práctica local: ' + folio, 148.5, 122, { align:'center' });
    doc.setDrawColor(210, 216, 222); doc.roundedRect(24, 142, 249, 36, 3, 3);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(140, 45, 25);
    doc.text('AVISO LEGAL OBLIGATORIO', 148.5, 152, { align:'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60, 70, 80);
    doc.text('Este documento deja constancia únicamente de la participación autónoma en la práctica Obra Ejemplo de Academia OBRASST.', 148.5, 160, { align:'center' });
    doc.text('NO es un certificado oficial, NO habilita legalmente para ejercer ni reemplaza capacitaciones del empleador (Ley N.° 29783).', 148.5, 167, { align:'center' });
    return { blob:doc.output('blob'), folio:folio, fecha:fecha };
  });
}
