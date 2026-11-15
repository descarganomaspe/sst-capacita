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
var CUR_DATOS_VER = 'voz-1511';   /* 15/11: las lecciones traen la voz de Koda («audio») y sus tiempos (antes 't5-1511') */   /* 15/11: el curso se llama «Fundamentos de SST en obra» y trae «acceso» (el código de acceso del servidor) */
var CURW = { caja:null, data:null, modId:'m1', lecId:{}, cargo:false, error:'', curso:'', datos:{} };
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
    '.cur-head .cur-ver-mods{display:none}',
    '@media (max-width:900px){.cur-grid{grid-template-columns:1fr}.cur-grid>.cur-col-det{order:1}.cur-grid>.cur-col-mods{order:2}.cur-head .cur-ver-mods{display:inline-flex}}',
    '.cur-head-der{display:inline-flex;flex-wrap:wrap;gap:6px;align-items:center}',
    '.cur-normas>summary{cursor:pointer;list-style:none;display:flex;gap:6px;align-items:center;min-height:32px}',
    '.cur-normas>summary::-webkit-details-marker{display:none}',
    '.cur-normas>summary::after{content:"▾";margin-left:auto;color:var(--gris,#6B7C88)}',
    '.cur-normas[open]>summary::after{content:"▴"}',
    '@media (max-width:520px){.cur-cursos button{flex:1 1 140px;font-size:13.5px;line-height:1.25;padding:8px 10px}.cur-aviso{font-size:12.5px}}',
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
    '.cur-profe{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#06121A;opacity:0;transition:opacity .35s ease;z-index:3;pointer-events:none}',
    '.cur-profe.on{opacity:1}.cur-profe[hidden]{display:none!important}',
    '.cur-j-voz{float:right;margin:-2px -2px 8px 10px;border:0;border-radius:999px;background:#0B2A3A;color:#fff;font:inherit;font-size:13px;font-weight:700;padding:8px 14px;min-height:40px;cursor:pointer}',
    '.cur-j-voz[aria-pressed=true]{background:#F5B700;color:#0B2A3A}',
    '@media (prefers-reduced-motion: reduce){.cur-profe{transition:none}}',
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
    '.cur-res p{font-size:14px}',
    /* 15/11/2026 · tanda 5: la Bolsa de trabajo SST, lado del candidato (clases cub-: no chocan con las bt- de portal/bolsa.js) */
    '.cur-mod-bolsa .n{background:#1E8E5A;font-size:14px}',
    '.cub-form{display:grid;gap:10px}',
    '.cub-campo{display:grid;gap:4px;min-width:0;margin:0}.cub-campo>label,.cub-campo>legend{font-size:14px;font-weight:600}',
    '.cub-campo input:not([type=checkbox]),.cub-campo select,.cub-campo textarea{min-height:44px;font-size:16px;width:100%;box-sizing:border-box}',
    '.cub-campo textarea{font-family:inherit;line-height:1.4}',
    '.cub-form .cur-chk input{width:20px;height:20px;min-height:0;flex:0 0 auto;margin:1px 0 0}',
    '.cub-fila{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}',
    '.cub-secs{border:1px solid var(--raya);border-radius:10px;padding:8px 12px 10px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px 10px}',
    '.cub-secs legend{padding:0 4px}.cub-secs .cur-chk{min-height:36px;align-items:center;font-size:14px}.cub-secs .cur-chk input{margin:0}',
    '.cub-form .cur-chk{color:var(--tinta,#0B2A3A);font-weight:500}',
    '.cub-permiso{padding:12px;border-radius:10px;border:2px solid #0B2A3A;background:var(--panel,#fff);display:grid;gap:8px}',
    '.cub-permiso p{margin:0;font-size:14px;line-height:1.45}.cub-permiso .cur-chk{font-size:14px;line-height:1.45}',
    '.cub-acc{display:flex;flex-wrap:wrap;gap:8px}.cub-acc .bt,.cub-ir .bt,.cub-vac .bt{min-height:44px}',
    '.cub-cab{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:baseline;justify-content:space-between}',
    '.cub-dl{display:grid;grid-template-columns:minmax(110px,max-content) minmax(0,1fr);gap:6px 14px;margin:0;font-size:14px}',
    '.cub-dl dt{color:var(--gris,#6B7C88)}.cub-dl dd{margin:0;overflow-wrap:anywhere}',
    '@media (max-width:420px){.cub-dl{grid-template-columns:minmax(0,1fr)}.cub-dl dt{margin-top:4px}}',
    '.cub-datos{margin:0;font-size:14px;line-height:1.45}',
    '.cub-req{margin:0;font-size:13.5px;line-height:1.45;color:var(--gris,#6B7C88);white-space:pre-line}',
    '.cub-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #0B2A3A;border-radius:12px;overflow:hidden;margin:10px 0}',
    '.cub-tabs button{border:0;border-left:1px solid #0B2A3A;background:var(--tarj,#fff);color:#0B2A3A;font:inherit;font-size:14px;font-weight:600;padding:6px 8px;min-height:44px;cursor:pointer;line-height:1.2}',
    '.cub-tabs button:first-child{border-left:0}.cub-tabs button[aria-pressed="true"]{background:#0B2A3A;color:#fff}',
    '.cub-cuerpo{display:grid;gap:10px}',
    '.cub-posts{margin:6px 0 0;padding-left:18px;font-size:14px;display:grid;gap:4px}',
    '.cub-borrar-ok{padding:10px 12px;border-radius:10px;border:1px solid #E7B3B6;background:rgba(180,35,24,.06);display:grid;gap:8px}',
    '.cub-borrar-ok p{margin:0;font-size:14px}.cub-borrar-ok .bt.mal{background:var(--panel,#fff);color:var(--mal,#B42318);border-color:#E7B3B6;min-height:44px}',
    '.cub-ir{display:grid;gap:4px;margin-top:6px;padding-top:8px;border-top:1px dashed var(--raya)}',
    /* 15/11/2026 · los dos cursos, el modo Jugando completo (tanda 2) y lo fácil (tanda 3) */
    '.cur-cursos{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}',
    '.cur-cursos button{flex:1 1 200px;min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid var(--raya2,#CBD4DB);background:var(--panel,#fff);color:var(--tinta,#0B2A3A);font:inherit;font-size:15px;font-weight:600;cursor:pointer;text-align:center}',
    '.cur-cursos button[aria-pressed="true"]{background:#0B2A3A;border-color:#0B2A3A;color:#fff}',
    '.cur-nivel{padding:10px 12px;border-radius:12px;background:#0B2A3A;color:#fff;display:grid;gap:6px;margin:0 0 12px;font-size:14px}',
    '.cur-nivel>div:first-child{display:flex;flex-wrap:wrap;gap:4px 10px;justify-content:space-between;align-items:baseline}',
    '.cur-nivel small{color:#A9C3D1;font-size:12.5px}',
    '.cur-nivel-barra{height:6px;border-radius:99px;background:#14394D;overflow:hidden}.cur-nivel-barra i{display:block;height:6px;background:#F5B700}',
    '.cur-insignias{display:flex;flex-wrap:wrap;gap:4px}.cur-insig{font-size:12px;padding:2px 8px;border-radius:99px;background:rgba(245,183,0,.18);color:#FFE7A3}',
    '.cur-mod-repaso .n{background:#2563A8;font-size:14px}.cur-mod-repaso{border-color:#2563A8}',
    '.cur-mod-bolsa .n{background:#1E8E5A}',
    '.cur-retos-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}',
    '.cur-retos-tabs button{min-height:40px;padding:6px 12px;border-radius:99px;border:1px solid var(--raya2,#CBD4DB);background:var(--panel,#fff);color:var(--tinta,#0B2A3A);font:inherit;font-size:14px;font-weight:600;cursor:pointer}',
    '.cur-retos-tabs button[aria-pressed="true"]{background:#F5B700;border-color:#F5B700;color:#0B2A3A}',
    '.cur-reto{display:grid;gap:10px;padding:14px;border-radius:14px;border:2px solid #F5B700;background:rgba(245,183,0,.06)}',
    '.cur-reto-eti{display:block;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--gris,#6B7C88);font-weight:700;margin-bottom:3px}',
    '.cur-reto-sit{margin:0;font-size:17px;line-height:1.45;font-weight:600}',
    '.cur-reto-ops{display:grid;gap:8px}',
    '.cur-reto-op{min-height:48px;padding:10px 14px;border-radius:12px;border:1px solid var(--raya2,#CBD4DB);background:var(--panel,#fff);color:var(--tinta,#0B2A3A);font:inherit;font-size:16px;text-align:left;cursor:pointer;line-height:1.35}',
    '.cur-reto-op:hover:not(:disabled){border-color:#0B2A3A}.cur-reto-op:disabled{cursor:default;opacity:.75}',
    '.cur-reto-op.bien{border-color:#1E8E5A;background:#E8F5EE;opacity:1}.cur-reto-op.mal{border-color:#C0392B;background:#FDECEA;opacity:1}',
    '.cur-reto-res{padding:10px 12px;border-radius:10px;font-size:16px;line-height:1.45}.cur-reto-res.ok{background:#E8F5EE;border:1px solid #BFE3CE;color:#14532D}.cur-reto-res.mal{background:#FDECEA;border:1px solid #F3B9B2;color:#7A1F14}',
    '.cur-esc-lienzo{border-radius:12px;overflow:hidden;border:1px solid var(--raya);cursor:crosshair;line-height:0;background:#eaf5fb}',
    '.cur-esc-lienzo svg{display:block;width:100%;height:auto;max-width:100%}',
    '.cur-esc-cuenta{margin:0;font-size:15px;font-weight:600}',
    '.cur-esc-lista{margin:0;padding-left:22px;display:grid;gap:4px;font-size:15px;line-height:1.4}',
    '.cur-invita{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14px}',
    '.cur-rep .cur-reto-sit{font-size:17px}',
    '#cur-a-jugar{border:1px solid #0B2A3A;background:var(--panel,#fff);color:#0B2A3A;border-radius:999px;padding:6px 12px;min-height:40px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}',
    /* letra grande en el celular: lo que se lee, de 16 px; los botones, de 44 px */
    '@media (max-width:520px){.cur-j-voz{min-height:44px}.cur-lam .txt{font-size:16px}.cur-lam .tit{font-size:19px}.cur-subtit{font-size:15px}.cur-ctrls button{min-height:44px}' +
      '.cur-op{font-size:16px;min-height:44px;align-items:center}.cur-preg>b{font-size:16px}.cur-mod .tx b{font-size:15px}.cur-lec{font-size:15px}' +
      '.cur-box p,.cur-sec p{font-size:16px}.cur-chk{font-size:16px;min-height:44px;align-items:center}#cur-borrar{min-height:44px}#cur-ir-codigo{min-height:44px}}'
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
  return { v:2, modo:null, lecModo:{}, lec:{}, aprob:{}, resp:{}, player:{}, repaso:{}, retos:{}, racha:{ ult:'', dias:0 }, puntos:0, insignias:[], final:null };
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
  ['lecModo', 'lec', 'aprob', 'resp', 'player', 'repaso', 'retos'].forEach(function(k){ av[k] = _curObj(p[k]); });
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

/* 15/11/2026 · el curso elegido (hay dos) y, con poca señal, lo último que bajó: queda en la caja «acad-temario» del
   navegador (no en localStorage, que la app necesita para lo suyo). Si en 8 s no llega, abre con lo guardado. */
function _curCargarJson(){
  var id = _curCursoSel(), def = _curCursoDef(id);
  if(CURW.datos[id]){ CURW.data = CURW.datos[id]; return Promise.resolve(CURW.data); }
  var url = def.archivo + '?v=' + encodeURIComponent(CUR_DATOS_VER || '1');
  var usar = function(j){ CURW.datos[id] = j; if(_curCursoSel() === id) CURW.data = j; return j; };
  var guardado = function(){
    try{
      if(!window.caches) return Promise.reject(new Error('sin_caja'));
      return caches.open('acad-temario').then(function(c){ return c.match(def.archivo, { ignoreSearch:true }); })
        .then(function(r){ if(!r) throw new Error('sin_copia'); return r.json(); });
    }catch(e){ return Promise.reject(e); }
  };
  var red = fetch(url, { cache:'no-cache' }).then(function(r){
    if(!r.ok) throw new Error('HTTP ' + r.status);
    try{ if(window.caches){ var c2 = r.clone(); caches.open('acad-temario').then(function(c){ return c.put(def.archivo, c2); }).catch(function(){}); } }catch(e){}
    return r.json();
  });
  var tope = new Promise(function(ok, mal){ setTimeout(function(){ guardado().then(ok, function(){ red.then(ok, mal); }); }, 8000); });
  return Promise.race([red.catch(function(e){ return guardado().catch(function(){ throw e; }); }), tope]).then(usar);
}

function _curEsAislado(){
  return !!(CURW.data && CURW.data.id && CURW.data.ejemplo_sandbox);
}

function _curAncho(){ try{ return window.innerWidth || document.documentElement.clientWidth || 1024; }catch(e){ return 1024; } }
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
  ((CURW.data && CURW.data.modulos) || []).forEach(function(m){
    var L = _curLecs(m);
    if(L.some(function(l){ return l.id === lecId; }) && L.every(function(l){ return _curVista(av, l.id); })) _curContar('termina', m.id);
  });
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
  _curVozSync(); _curProfe();
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
    /* si alguien movió el segundo por su cuenta (un salto), la voz va ahí; si no, manda la voz */
    if(typeof CURP._tAnt === 'number' && Math.abs(CURP.t - CURP._tAnt) > 0.5 && CURVOZ && _curVozActiva()){ try{ CURVOZ.currentTime = CURP.t; }catch(e){} }
    var vt = _curVozTiempo();   /* con voz: el segundo de la voz; esperando que cargue: no avanza; sin voz: el reloj */
    if(vt !== false) CURP.t = Math.min(CURP.lec.dur, (vt !== null && Math.abs(vt - CURP.t) < 1.5) ? vt : (vt !== null ? CURP.t : CURP.t + 0.1 * CURP.vel));
    CURP._tAnt = CURP.t;
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
  CURP.voz = !!interactivo.audio && _curVozPref();
  _curVozBoton();
  var vozBtn = document.getElementById('cur-b-voz');
  if(vozBtn){
    vozBtn.onclick = function(){
      if(CURP.vozFalla){ CURP.vozFalla = false; _curVozSoltar(); CURP.voz = true; }
      else CURP.voz = !CURP.voz;
      _curVozGuardar(CURP.voz);
      _curVozBoton(); _curVozSync();
    };
  }

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
  _curVozParar(); _curProfeParar();
  if(_curTickTimer){ clearInterval(_curTickTimer); _curTickTimer = null; }
  document.removeEventListener('keydown', _curKeyHandler);
  if(CURP){ _curGuardarPlayerState(); CURP = null; }
}

function _curPlayerHtml(inter){
  var h = '<div class="cur-repro" id="cur-repro-box">' +
       '<div class="cur-pantalla" id="cur-pantalla-marco">' +
       '<div id="cur-lam" class="cur-lam"></div>' +
       '<video id="cur-profe" class="cur-profe" muted playsinline preload="none" aria-hidden="true" hidden></video>' +
       '<div id="cur-velo" class="cur-velo" hidden></div>' +
       '</div>' +
       '<div id="cur-subtit" class="cur-subtit"></div>' +
       '<div class="cur-ctrls">' +
       '<button type="button" id="cur-b-play" aria-label="Reproducir">▶</button>' +
       (inter.audio ? '<button type="button" id="cur-b-voz" class="on" aria-pressed="true" aria-label="Voz de Koda" title="Voz de Koda">🔊 Voz</button>' : '') +
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

/* ══ LA VOZ DE KODA Y EL PROFESOR (15/11/2026) ═══════════════════════════════════════════════════════════════════
   Cada lección trae «audio»: la voz de Koda grabada en Google AI Studio (academia/voz), con cada subtítulo y cada
   lámina en el segundo en que Koda los dice. En Clásico la voz manda el reloj; si no hay señal para la voz, la lección
   sigue con el reloj y los subtítulos, como antes, y el botón queda en «🔇 Sin señal» (tocarlo lo intenta de nuevo).
   En Jugando cada tarjeta tiene «🔊 Escuchar» (su tramo de voz); si se usó, las siguientes suenan solas.
   El profesor (clips de Google Flow, sin sonido; «profe» en el JSON del curso) aparece en la pantalla al empezar la
   primera lección de cada módulo, al empezar las demás y al cerrar la última. Con «ahorro de datos» o con
   «reducir movimiento» no aparece. Nada de esto se guarda en el servidor. */
var CURVOZ = null;            /* la voz que suena (una sola a la vez) */
var _curVozEspera = 0;      /* ticks esperando que la voz cargue */
var _curJVozTimer = null;
function _curBase(){ var d = _curCursoDef(CURW.curso || _curCursoSel()); return String((d && d.archivo) || 'cursos/x.json').replace(/[^\/]*$/, ''); }
function _curVozPref(){ try { return localStorage.getItem('acad_voz') !== '0'; } catch(e){ return true; } }
function _curVozGuardar(on){ try { localStorage.setItem('acad_voz', on ? '1' : '0'); } catch(e){} }
function _curVozJPref(){ try { return localStorage.getItem('acad_vozj') === '1'; } catch(e){ return false; } }
function _curVozJGuardar(on){ try { localStorage.setItem('acad_vozj', on ? '1' : '0'); } catch(e){} }
function _curAhorro(){
  try{ if(navigator.connection && navigator.connection.saveData) return true; }catch(e){}
  try{ if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true; }catch(e){}
  return false;
}
function _curVozAudio(I){
  var src = _curBase() + I.audio;
  if(CURVOZ && CURVOZ._acad === src) return CURVOZ;
  _curVozSoltar();
  var a = new Audio();
  a._acad = src; a.preload = 'auto';
  a.addEventListener('error', function(){ if(CURVOZ === a) _curVozCaida(); });
  a.src = src;
  CURVOZ = a;
  return a;
}
function _curVozSoltar(){
  if(CURVOZ){ try{ CURVOZ.pause(); CURVOZ.removeAttribute('src'); CURVOZ.load(); }catch(e){} CURVOZ = null; }
  _curVozEspera = 0;
}
function _curVozParar(){
  if(CURVOZ){ try{ CURVOZ.pause(); }catch(e){} }
  if(_curJVozTimer){ clearInterval(_curJVozTimer); _curJVozTimer = null; }
  if(CURJ) CURJ.vozFin = null;
}
function _curVozActiva(){ return !!(CURP && CURP.lec && CURP.lec.audio && CURP.voz && !CURP.vozFalla); }
function _curVozCaida(){
  var aviso = false;
  if(CURP && CURP.lec && CURP.lec.audio && CURP.voz && !CURP.vozFalla){ CURP.vozFalla = true; aviso = true; }
  if(CURJ && CURJ.lec && CURJ.lec.audio && !CURJ.vozFalla){ CURJ.vozFalla = true; aviso = true; }
  _curVozParar(); _curVozEspera = 0;
  _curVozBoton(); _curJVozBoton();
  if(aviso && typeof toast === 'function') toast('Sin señal para la voz: la lección sigue con subtítulos.');
}
function _curVozBoton(){
  var b = document.getElementById('cur-b-voz'); if(!b || !CURP) return;
  var on = CURP.voz && !CURP.vozFalla;
  b.className = on ? 'on' : '';
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
  b.textContent = CURP.vozFalla ? '🔇 Sin señal' : (on ? '🔊 Voz' : '🔈 Voz');
  b.title = CURP.vozFalla ? 'Sin señal para la voz: tócalo para intentar de nuevo' : (on ? 'Apagar la voz de Koda' : 'Prender la voz de Koda');
}
/* null: sin voz (manda el reloj) · false: la voz está cargando (no avanzar) · número: el segundo de la voz */
function _curVozTiempo(){
  if(!_curVozActiva() || !CURVOZ) return null;
  if(CURVOZ.ended) return CURP.lec.dur;
  if(CURVOZ.paused || CURVOZ.readyState < 3){
    if(++_curVozEspera > 120) _curVozCaida();   /* 12 s sin poder sonar: sigue sin voz */
    return false;
  }
  _curVozEspera = 0;
  return CURVOZ.currentTime;
}
function _curVozSync(){
  if(!CURP) return;
  if(!_curVozActiva()){ if(CURVOZ && !CURVOZ.paused && !CURJ) CURVOZ.pause(); return; }
  var debe = CURP.modo === 'leccion' && CURP.jugando && CURP.t < CURP.lec.dur - 0.05;
  if(!debe){ if(CURVOZ && !CURVOZ.paused) CURVOZ.pause(); return; }
  var a = _curVozAudio(CURP.lec);
  if(Math.abs((a.currentTime || 0) - CURP.t) > 0.35){ try{ a.currentTime = CURP.t; }catch(e){} }
  if(a.playbackRate !== (CURP.vel || 1)) a.playbackRate = CURP.vel || 1;
  if(a.paused){
    var pr = null; try{ pr = a.play(); }catch(e){}
    if(pr && pr.catch) pr.catch(function(err){
      if(!CURP || CURVOZ !== a) return;
      var n = err && err.name;
      if(n === 'NotAllowedError'){ CURP.jugando = false; _curGuardarPlayerState(); _curPintarPlayer(); }
      else if(n !== 'AbortError') _curVozCaida();
    });
  }
}
/* el profesor: cada clip viene en WebM (Chrome, Edge, Android, Firefox) y en MP4 (Safari); se usa el que el equipo lee */
var _curProfeFmt = null;
function _curProfeSrc(x){
  if(!x) return '';
  if(typeof x === 'string') return x;
  if(_curProfeFmt === null){
    _curProfeFmt = 'mp4';
    try{ var v = document.createElement('video'); if(v.canPlayType && v.canPlayType('video/webm; codecs="vp9"')) _curProfeFmt = 'webm'; }catch(e){}
  }
  return x[_curProfeFmt] || x.mp4 || x.webm || '';
}
/* el profesor: qué clip va ahora (o ninguno) */
function _curProfeClip(){
  var P = CURW.data && CURW.data.profe;
  if(!P || !CURP || !CURP.lec || _curAhorro()) return null;
  var m = _curMod(CURW.modId), lecs = (m && m.lecciones) || [], idx = -1;
  for(var i = 0; i < lecs.length; i++) if(lecs[i].interactivo && lecs[i].interactivo.id === CURP.lec.id) idx = i;
  if(idx < 0) return null;
  var C = CURP.lec.cues || [], dur = CURP.lec.dur;
  if(idx === lecs.length - 1 && P.cierre && C.length){
    var ini = Math.max(C[C.length - 1][0], dur - 7);
    if(CURP.t >= ini - 0.001) return { src:_curProfeSrc(P.cierre), ini:ini, fin:dur };
  }
  var src = _curProfeSrc(idx === 0 ? P.apertura : P.transicion), fin0 = C.length ? Math.min(C[0][1], 6.5) : 5;
  if(src && CURP.t < fin0) return { src:src, ini:0, fin:fin0 };
  return null;
}
function _curProfeVideo(src){
  var v = document.getElementById('cur-profe'); if(!v) return null;
  var u = _curBase() + src;
  if(v._acad !== u){ v._acad = u; v.preload = 'auto'; v.src = u; try{ v.load(); }catch(e){} }
  return v;
}
function _curProfe(){
  var v = document.getElementById('cur-profe'); if(!v) return;
  var c = (CURP && CURP.modo === 'leccion') ? _curProfeClip() : null;
  if(!c){
    if(!v.hidden){ v.classList.remove('on'); try{ v.pause(); }catch(e){} v.hidden = true; }
    /* el cierre se pide un poco antes, para que llegue a tiempo */
    var P = CURW.data && CURW.data.profe;
    if(P && P.cierre && CURP && CURP.lec && CURP.t > CURP.lec.dur - 25 && !_curAhorro()){
      var m = _curMod(CURW.modId), L = (m && m.lecciones) || [];
      if(L.length && L[L.length - 1].interactivo && L[L.length - 1].interactivo.id === CURP.lec.id) _curProfeVideo(_curProfeSrc(P.cierre));
    }
    return;
  }
  v = _curProfeVideo(c.src);
  if(!v || v.readyState < 2) return;
  var dentro = Math.max(0, CURP.t - c.ini), largo = v.duration || 6;
  if(Math.abs(v.currentTime - dentro) > 0.6){ try{ v.currentTime = Math.min(dentro, Math.max(0, largo - 0.1)); }catch(e){} }
  if(CURP.jugando){ if(v.paused){ var pr = null; try{ pr = v.play(); }catch(e){} if(pr && pr.catch) pr.catch(function(){}); } }
  else if(!v.paused){ try{ v.pause(); }catch(e){} }
  v.hidden = false; v.classList.add('on');
}
function _curProfeParar(){
  var v = document.getElementById('cur-profe');
  if(v){ try{ v.pause(); }catch(e){} v.classList.remove('on'); v.hidden = true; }
}
/* Jugando: el tramo de voz de la tarjeta */
function _curJVozBoton(){
  var b = document.getElementById('cur-j-voz'); if(!b || !CURJ) return;
  var suena = !!(CURVOZ && !CURVOZ.paused && CURJ.vozFin != null);
  b.textContent = CURJ.vozFalla ? '🔇 Sin señal' : (suena ? '⏸ Pausar' : '🔊 Escuchar');
  b.setAttribute('aria-pressed', suena ? 'true' : 'false');
}
function _curJVozTocar(){
  if(!CURJ || CURJ.fase !== 'cartas') return;
  var I = CURJ.lec, L = I.laminas || [];
  if(!I.audio || !L[CURJ.i]) return;
  var ini = L[CURJ.i].desde, fin = L[CURJ.i + 1] ? L[CURJ.i + 1].desde : I.dur;
  var a = _curVozAudio(I);
  CURJ.vozFalla = false; CURJ.vozFin = fin;
  try{ a.currentTime = ini; }catch(e){}
  a.playbackRate = 1;
  var pr = null; try{ pr = a.play(); }catch(e){}
  if(pr && pr.catch) pr.catch(function(err){
    var n = err && err.name;
    if(n !== 'AbortError' && n !== 'NotAllowedError') _curVozCaida();
    if(CURJ){ CURJ.vozFin = null; _curJVozBoton(); }
  });
  if(_curJVozTimer) clearInterval(_curJVozTimer);
  _curJVozTimer = setInterval(function(){
    if(!CURJ || !CURVOZ || CURJ.vozFin == null){ clearInterval(_curJVozTimer); _curJVozTimer = null; _curJVozBoton(); return; }
    if(CURVOZ.ended || (!CURVOZ.paused && CURVOZ.currentTime >= CURJ.vozFin - 0.04)){
      try{ CURVOZ.pause(); }catch(e){}
      CURJ.vozFin = null; clearInterval(_curJVozTimer); _curJVozTimer = null; _curJVozBoton();
    }
  }, 60);
  _curJVozBoton();
}
/* si la pantalla se va (otra pestaña, la app sale de la Academia), todo se pausa */
function _curPausarTodo(){
  if(CURP && CURP.jugando){ CURP.jugando = false; _curGuardarPlayerState(); _curPintarPlayer(); }
  _curVozParar(); _curProfeParar(); _curJVozBoton();
}
try{
  document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') _curPausarTodo(); });
  window.addEventListener('message', function(ev){
    if(!ev || ev.origin !== location.origin) return;
    var d = ev.data; if(d && d.acad === 'pausa') _curPausarTodo();
  });
  window.addEventListener('pagehide', function(){ _curPausarTodo(); });
}catch(e){}

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
    h += '<div class="cur-j-carta" id="cur-j-carta">' +
         (I.audio ? '<button type="button" class="cur-j-voz" id="cur-j-voz" aria-pressed="false">🔊 Escuchar</button>' : '') +
         '<span class="eti">' + _curEsc(x.eti) + '</span><h4>' + _curEsc(x.tit) + '</h4>' +
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
  _curVozParar();
  box.innerHTML = h;

  var on = function(id, fn){ var e = document.getElementById(id); if(e) e.onclick = fn; };
  on('cur-j-voz', function(){
    if(CURVOZ && !CURVOZ.paused && CURJ.vozFin != null){ _curVozParar(); _curVozJGuardar(false); _curJVozBoton(); }
    else { _curVozJGuardar(true); _curJVozTocar(); }
  });
  if(CURJ.fase === 'cartas' && I.audio && _curVozJPref() && !CURJ.vozFalla) _curJVozTocar();
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
  _curVozParar(); _curProfeParar();
  if(_curTickTimer){ clearInterval(_curTickTimer); _curTickTimer = null; }
  document.removeEventListener('keydown', _curKeyHandler);
  CURP = null; CURJ = null;
  av.modo = modo;
  if(lec && !soloPreferencia) av.lecModo[lec.id] = modo;
  _curGuardarAv(av);
  _curPintar();
}

/* ══ LOS DOS CURSOS (15/11/2026 · 2.º curso) ═══════════════════════════════════════════════════════════════════════
   La Academia tiene dos cursos, cada uno con su archivo, su código de acceso, su examen final y su constancia:
   «Fundamentos de SST en obra» (curso-01, Inducción + 8 módulos) y «Supervisor SST listo para obra» (curso-02, 10
   módulos prácticos). Los ids de módulos y lecciones no se repiten entre cursos («sv…» en el 2.º), así el avance de los
   dos convive en el mismo guardado. El elegido queda en el equipo («acad_curso_sel»); ?curso=02 en la dirección lo abre. */
var CUR_CURSOS = [
  { id:'curso-01', archivo:'cursos/curso-01.json', titulo:'Fundamentos de SST en obra', corto:'Fundamentos de SST en obra' },
  { id:'curso-02', archivo:'cursos/curso-02.json', titulo:'Supervisor SST listo para obra', corto:'Supervisor SST listo para obra' }
];
function _curCursoDef(id){ for(var i = 0; i < CUR_CURSOS.length; i++) if(CUR_CURSOS[i].id === id) return CUR_CURSOS[i]; return CUR_CURSOS[0]; }
function _curCursoSel(){
  if(CURW.curso) return CURW.curso;
  var q = ''; try{ q = (/[?&]curso=(?:curso-)?0?(\d)/.exec(location.search) || [])[1] || ''; }catch(e){}
  var id = q ? 'curso-0' + q : (_curGet('acad_curso_sel') || 'curso-01');
  CURW.curso = _curCursoDef(id).id;
  return CURW.curso;
}
function _curCambiarCurso(id){
  if(id === _curCursoSel()) return;
  if(CURX && CURX.preguntas){ toast('Termina tu examen final antes de cambiar de curso.'); return; }
  _curDesmontarPlayer(); CURJ = null; CURR = null; CURRP = null;
  CURW.curso = _curCursoDef(id).id; _curSet('acad_curso_sel', CURW.curso);
  CURW.data = CURW.datos[CURW.curso] || null; CURW.modId = ''; CURW.lecId = {};
  if(CURW.caja) vistaAcademia(CURW.caja);
}
function _curCursosHtml(){
  var sel = _curCursoSel();
  return '<div class="cur-cursos" role="group" aria-label="Cursos de la Academia">' + CUR_CURSOS.map(function(c){
    return '<button type="button" data-cur-curso="' + c.id + '" aria-pressed="' + (c.id === sel) + '">' + _curEsc(c.corto) + '</button>';
  }).join('') + '</div>';
}

/* ══ MODO JUGANDO COMPLETO (tanda 2 · 15/11/2026) ═════════════════════════════════════════════════════════════════
   Además de las tarjetas, el reto rápido, los puntos y la racha (tanda 1), cada módulo trae sus retos en el modo
   Jugando: decisiones con consecuencias, «Encuentra el peligro» (escenas dibujadas para la Academia, con zonas) y una
   misión en la Obra Ejemplo. La insignia del módulo se gana al aprobar su prueba; los niveles salen de los puntos.
   Nada de esto cambia la prueba, el examen final ni la constancia (que no dice en qué modo se estudió). */
var CUR_NIVELES = [[0, 'Recién llegado'], [100, 'Ojo atento'], [250, 'Mano firme'], [450, 'Ejemplo en el frente'], [700, 'Referente de obra']];
var CURR = null;   /* el reto abierto: { modId, tipo:'dec'|'esc'|'mis', i, eleg, hallados:[], rendido, msg } */
function _curNivel(p){
  var n = 0; for(var i = 0; i < CUR_NIVELES.length; i++) if(p >= CUR_NIVELES[i][0]) n = i;
  return { n:n + 1, nombre:CUR_NIVELES[n][1], desde:CUR_NIVELES[n][0], hasta:CUR_NIVELES[n + 1] ? CUR_NIVELES[n + 1][0] : null };
}
function _curNivelHtml(av){
  var D = CURW.data || {}, N = _curNivel(av.puntos), mods = (D.modulos || []).filter(function(m){ return m.ludico && m.ludico.insignia; });
  var tengo = mods.filter(function(m){ return av.insignias.indexOf(m.id) > -1; });
  var pct = N.hasta ? Math.round((av.puntos - N.desde) * 100 / (N.hasta - N.desde)) : 100;
  return '<div class="cur-nivel" id="cur-nivel"><div><b>Nivel ' + N.n + ' · ' + _curEsc(N.nombre) + '</b><span>⭐ ' + av.puntos + ' puntos · 🔥 ' + (av.racha.dias || 0) +
    (av.racha.dias === 1 ? ' día' : ' días') + (mods.length ? ' · 🏅 ' + tengo.length + ' de ' + mods.length : '') + '</span></div>' +
    '<div class="cur-nivel-barra" aria-hidden="true"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>' +
    (N.hasta ? '<small>' + (N.hasta - av.puntos) + ' puntos para el nivel ' + (N.n + 1) + '</small>' : '<small>Llegaste al último nivel</small>') +
    (tengo.length ? '<div class="cur-insignias">' + tengo.map(function(m){ return '<span class="cur-insig">🏅 ' + _curEsc(m.ludico.insignia) + '</span>'; }).join('') + '</div>' : '') + '</div>';
}
function _curRetoClave(modId, tipo, i){ return modId + ':' + tipo + (tipo === 'dec' ? i : ''); }
function _curRetoHecho(av, modId, tipo, i){ return !!(av.retos[_curRetoClave(modId, tipo, i)]); }
function _curRetosLista(m){
  var J = (m && m.ludico) || {}, L = [];
  (J.decisiones || []).forEach(function(d, i){ L.push({ tipo:'dec', i:i, nombre:'Decide ' + (i + 1) }); });
  if(J.escena) L.push({ tipo:'esc', i:0, nombre:'Encuentra el peligro' });
  if(J.mision) L.push({ tipo:'mis', i:0, nombre:'Misión' });
  return L;
}
function _curRetosHtml(m, av){
  var L = _curRetosLista(m);
  if(!L.length) return '';
  if(!CURR || CURR.modId !== m.id){
    var primero = L.filter(function(x){ return !_curRetoHecho(av, m.id, x.tipo, x.i); })[0] || L[0];
    CURR = { modId:m.id, tipo:primero.tipo, i:primero.i, eleg:null, hallados:[], rendido:false, msg:'' };
  }
  var hechos = L.filter(function(x){ return _curRetoHecho(av, m.id, x.tipo, x.i); }).length;
  var h = '<div class="cur-sec" id="cur-retos-sec"><h4 style="margin:0 0 6px">🎯 Retos del módulo <small class="tenue">(' + hechos + ' de ' + L.length + ' hechos)</small></h4>' +
          '<div class="cur-retos-tabs" role="group" aria-label="Retos del módulo">' + L.map(function(x){
            var on = CURR.tipo === x.tipo && CURR.i === x.i;
            return '<button type="button" data-cur-reto="' + x.tipo + ':' + x.i + '" aria-pressed="' + on + '">' + (_curRetoHecho(av, m.id, x.tipo, x.i) ? '✓ ' : '') + _curEsc(x.nombre) + '</button>';
          }).join('') + '</div><div class="cur-reto" id="cur-reto">' + _curRetoCuerpo(m, av) + '</div></div>';
  return h;
}
function _curOpcionesHtml(ops, eleg){
  return '<div class="cur-reto-ops">' + ops.map(function(o, j){
    var cls = eleg === null ? '' : (j === eleg ? (o.ok ? ' bien' : ' mal') : (o.ok && eleg !== null && ops[eleg].ok ? '' : ''));
    return '<button type="button" class="cur-reto-op' + cls + '" data-cur-op="' + j + '"' + (eleg !== null ? ' disabled' : '') + '>' + _curEsc(o.txt) + '</button>';
  }).join('') + '</div>';
}
function _curRetoCuerpo(m, av){
  var J = m.ludico || {}, h = '';
  if(CURR.tipo === 'dec' || CURR.tipo === 'mis'){
    var R = CURR.tipo === 'dec' ? J.decisiones[CURR.i] : J.mision, ops = R.ops || [];
    h += '<p class="cur-reto-sit">' + (CURR.tipo === 'mis' ? '<span class="cur-reto-eti">Misión en la Obra Ejemplo</span>' : '<span class="cur-reto-eti">¿Qué haces?</span>') + _curEsc(CURR.tipo === 'dec' ? R.sit : R.obj) + '</p>';
    h += _curOpcionesHtml(ops, CURR.eleg);
    if(CURR.eleg !== null){
      var o = ops[CURR.eleg];
      h += '<div class="cur-reto-res ' + (o.ok ? 'ok' : 'mal') + '" role="status" id="cur-reto-res">' + (o.ok ? '<b>✅ Bien.</b> ' : '<b>⚠️ Esto puede pasar:</b> ') + _curEsc(o.pasa) + '</div>' +
           '<div class="cur-j-acc" style="padding:0">' + (o.ok ? '' : '<button type="button" id="cur-reto-otra">Intentar otra vez</button>') +
           '<button type="button" class="pri" id="cur-reto-sig">' + (_curRetoSiguiente(m) ? 'Siguiente reto →' : 'Listo ✓') + '</button></div>';
    }
  } else if(CURR.tipo === 'esc'){
    var E = J.escena, Z = E.zonas || [], fin = CURR.rendido || CURR.hallados.length === Z.length;
    var marcas = Z.map(function(z, k){
      var x = (z.x * 800).toFixed(1), y = (z.y * 480).toFixed(1), r = (z.r * 800).toFixed(1), vis = CURR.hallados.indexOf(k) > -1 || CURR.rendido;
      return '<circle class="cur-z" data-z="' + k + '" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="transparent" pointer-events="all"/>' +
        (vis ? '<g pointer-events="none"><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + (CURR.hallados.indexOf(k) > -1 ? '#1E8E5A' : '#d97706') + '" stroke-width="5"/>' +
          '<circle cx="' + x + '" cy="' + (y - r + 4) + '" r="15" fill="' + (CURR.hallados.indexOf(k) > -1 ? '#1E8E5A' : '#d97706') + '"/>' +
          '<text x="' + x + '" y="' + (y - r + 9.5) + '" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#fff">' + (k + 1) + '</text></g>' : '');
    }).join('');
    h += '<p class="cur-reto-sit"><span class="cur-reto-eti">Encuentra el peligro</span>' + _curEsc(E.titulo) + ': toca cada peligro que veas. Hay ' + Z.length + '.</p>' +
         '<div class="cur-esc-lienzo" id="cur-esc-lienzo">' + String(E.svg || '').replace('</svg>', marcas + '</svg>') + '</div>' +
         '<p class="cur-esc-cuenta" role="status" id="cur-esc-msg">' + (CURR.msg ? _curEsc(CURR.msg) + ' · ' : '') + 'Encontraste ' + CURR.hallados.length + ' de ' + Z.length + '.</p>';
    var lista = Z.map(function(z, k){ return { k:k, z:z }; }).filter(function(x){ return CURR.hallados.indexOf(x.k) > -1 || CURR.rendido; });
    if(lista.length) h += '<ol class="cur-esc-lista">' + lista.map(function(x){ return '<li value="' + (x.k + 1) + '">' + _curEsc(x.z.txt) + '</li>'; }).join('') + '</ol>';
    h += '<div class="cur-j-acc" style="padding:0">' + (fin ? '' : '<button type="button" id="cur-esc-ver">No los encuentro: muéstrame</button>') +
         (fin ? '<button type="button" class="pri" id="cur-reto-sig">' + (_curRetoSiguiente(m) ? 'Siguiente reto →' : 'Listo ✓') + '</button>' : '') + '</div>';
  }
  return h;
}
function _curRetoSiguiente(m){
  var L = _curRetosLista(m), av = _curLeerAv(), k = -1;
  for(var i = 0; i < L.length; i++) if(L[i].tipo === CURR.tipo && L[i].i === CURR.i) k = i;
  for(var j = 1; j <= L.length; j++){ var x = L[(k + j) % L.length]; if(!_curRetoHecho(av, m.id, x.tipo, x.i) && !(x.tipo === CURR.tipo && x.i === CURR.i)) return x; }
  return null;
}
function _curRetoGanar(m, puntos, tipo, i){
  var av = _curLeerAv(), k = _curRetoClave(m.id, tipo, i);
  if(av.retos[k]) return false;
  av.retos[k] = { fecha:_curHoy() }; av.puntos += puntos; _curTocarRacha(av); _curGuardarAv(av);
  return true;
}
function _curRetoPintar(){
  var m = _curMod(CURW.modId), box = document.getElementById('cur-retos-sec');
  if(!box || !m) return;
  var av = _curLeerAv(), tmp = document.createElement('div');
  tmp.innerHTML = _curRetosHtml(m, av);
  box.parentNode.replaceChild(tmp.firstChild, box);
  _curRetosEnlazar(m);
  var nv = document.getElementById('cur-nivel'); if(nv){ var t2 = document.createElement('div'); t2.innerHTML = _curNivelHtml(_curLeerAv()); nv.parentNode.replaceChild(t2.firstChild, nv); }
}
function _curRetosEnlazar(m){
  var sec = document.getElementById('cur-retos-sec'); if(!sec) return;
  Array.prototype.forEach.call(sec.querySelectorAll('[data-cur-reto]'), function(b){
    b.onclick = function(){ var p = b.getAttribute('data-cur-reto').split(':'); CURR = { modId:m.id, tipo:p[0], i:+p[1], eleg:null, hallados:[], rendido:false, msg:'' }; _curRetoPintar(); };
  });
  Array.prototype.forEach.call(sec.querySelectorAll('[data-cur-op]'), function(b){
    b.onclick = function(){
      var J = m.ludico, R = CURR.tipo === 'dec' ? J.decisiones[CURR.i] : J.mision, j = +b.getAttribute('data-cur-op');
      CURR.eleg = j;
      if(R.ops[j].ok && _curRetoGanar(m, 5, CURR.tipo, CURR.i)) toast('+5 puntos');
      _curRetoPintar();
      var res = document.getElementById('cur-reto-res'); if(res && res.scrollIntoView) res.scrollIntoView({ block:'nearest' });
    };
  });
  var otra = document.getElementById('cur-reto-otra'); if(otra) otra.onclick = function(){ CURR.eleg = null; _curRetoPintar(); };
  var sig = document.getElementById('cur-reto-sig');
  if(sig) sig.onclick = function(){
    var x = _curRetoSiguiente(m);
    if(x){ CURR = { modId:m.id, tipo:x.tipo, i:x.i, eleg:null, hallados:[], rendido:false, msg:'' }; _curRetoPintar(); }
    else { toast('Retos del módulo completos ✓'); var p = document.getElementById('cur-prac-sec'); if(p && p.scrollIntoView) p.scrollIntoView({ behavior:'smooth', block:'start' }); }
  };
  var lz = document.getElementById('cur-esc-lienzo');
  if(lz) lz.onclick = function(ev){
    if(CURR.rendido) return;
    var t = ev.target && ev.target.closest ? ev.target.closest('[data-z]') : null, Z = m.ludico.escena.zonas;
    if(t){
      var k = +t.getAttribute('data-z');
      if(CURR.hallados.indexOf(k) < 0){ CURR.hallados.push(k); CURR.msg = '¡Bien visto!'; }
      else CURR.msg = 'Ese ya lo encontraste';
      if(CURR.hallados.length === Z.length && _curRetoGanar(m, 10, 'esc', 0)) toast('¡Encontraste todos! +10 puntos');
    } else CURR.msg = 'Ahí no hay un peligro; mira otra vez';
    _curRetoPintar();
  };
  var ver = document.getElementById('cur-esc-ver');
  if(ver) ver.onclick = function(){ CURR.rendido = true; CURR.msg = 'Estos eran'; _curRetoPintar(); };
}

/* ══ FÁCIL Y CON POCA SEÑAL (tanda 3 · 15/11/2026) ════════════════════════════════════════════════════════════════
   · «Repaso de hoy»: lo que se falla en la prueba de un módulo (y lo que en el reto rápido se marca «La repaso») vuelve
     al día siguiente; si sale bien, a los 3 días y después a los 7 (caja 1, 2 y 3). Todo en el equipo (av.repaso).
   · El temario queda guardado en el equipo («acad_json:…»): si no hay señal, la Academia abre con lo último que bajó.
   · Contadores SIN nombres (acad_contar): cuántos abren, terminan y aprueban cada módulo, quiénes vuelven al día
     siguiente y a los 7 días, qué modo eligen y qué pregunta se falla más. Cada equipo cuenta una sola vez cada cosa;
     no se manda ningún dato de la persona ni de su cuenta. */
var CURRP = null;  /* el repaso abierto: { cola:[ids], i, eleg, ver, bien, mal } */
function _curPregsCurso(){
  var D = CURW.data || {}, M = {};
  (D.modulos || []).forEach(function(m){
    _curLecs(m).forEach(function(l){ ((l.interactivo && l.interactivo.preguntas) || []).forEach(function(q){ M[q.id] = { tipo:'video', m:m, q:q }; }); });
    (m.quiz || []).forEach(function(q, i){ M[m.id + ':q' + i] = { tipo:'quiz', m:m, q:q, i:i }; });
  });
  return M;
}
function _curRepasoHoy(av){
  var M = _curPregsCurso(), hoy = _curHoy();
  return Object.keys(av.repaso || {}).filter(function(k){ var r = av.repaso[k]; return M[k] && r && r.prox && r.prox <= hoy; }).sort();
}
function _curRepasoProximo(av){
  var M = _curPregsCurso(), hoy = _curHoy(), L = Object.keys(av.repaso || {}).filter(function(k){ return M[k] && av.repaso[k].prox > hoy; }).map(function(k){ return av.repaso[k].prox; }).sort();
  return L[0] || '';
}
/* sabía → sube de caja (1, 3 y 7 días); no sabía → caja 1, mañana */
function _curRepasoAnotar(a, id, sabia){
  var r = _curObj(a.repaso[id]), caja = sabia ? Math.min(3, (+r.caja || 0) + 1) : 1;
  a.repaso[id] = { caja:caja, prox:_curDiaMas(_curHoy(), [1, 3, 7][caja - 1]), veces:(+r.veces || 0) + 1 };
}
function _curRepasoHtml(){
  var av = _curLeerAv(), M = _curPregsCurso(), h = '<div class="cur-head"><div><h3>🔁 Repaso de hoy</h3><p class="sub" style="margin:2px 0 0">Lo que fallaste vuelve al día siguiente; si sale bien, a los 3 días y luego a los 7. Así se queda.</p></div></div>';
  if(!CURRP){ CURRP = { cola:_curRepasoHoy(av), i:0, eleg:null, ver:false, bien:0, mal:0 }; }
  if(CURRP.i >= CURRP.cola.length){
    var prox = _curRepasoProximo(_curLeerAv()), sig = _curSigueCurso();
    return h + '<div class="cur-box" id="cur-rep-fin"><b>✅ Listo por hoy</b><p style="margin:0">' + (CURRP.cola.length ? 'Repasaste ' + CURRP.cola.length + (CURRP.cola.length === 1 ? ' pregunta' : ' preguntas') + ': ' + CURRP.bien + ' bien. ' : 'Hoy no te toca repasar nada. ') +
      (prox ? 'Tu próximo repaso es el ' + _curEsc(_curFechaLima(prox + 'T12:00:00Z')) + '.' : '') + '</p>' +
      (sig ? '<div><button type="button" class="bt" id="cur-rep-sigue">' + _curEsc(sig.txt) + '</button></div>' : '') + '</div>';
  }
  var id = CURRP.cola[CURRP.i], X = M[id];
  h += '<div class="cur-box cur-rep" id="cur-rep"><span class="cur-reto-eti">' + (CURRP.i + 1) + ' de ' + CURRP.cola.length + ' · ' + _curEsc(_curNomMod(X.m)) + ' · ' + _curEsc(X.m.titulo) + '</span>';
  if(X.tipo === 'quiz'){
    h += '<p class="cur-reto-sit">' + _curEsc(X.q.q) + '</p><div class="cur-reto-ops">' + X.q.ops.map(function(o, j){
      var cls = CURRP.eleg === null ? '' : (j === X.q.ok ? ' bien' : (j === CURRP.eleg ? ' mal' : ''));
      return '<button type="button" class="cur-reto-op' + cls + '" data-cur-rop="' + j + '"' + (CURRP.eleg !== null ? ' disabled' : '') + '>' + _curEsc(o) + '</button>';
    }).join('') + '</div>';
    if(CURRP.eleg !== null) h += '<div class="cur-reto-res ' + (CURRP.eleg === X.q.ok ? 'ok' : 'mal') + '" role="status">' + (CURRP.eleg === X.q.ok ? '<b>✅ Bien.</b> ' : '<b>Era otra.</b> ') + _curEsc(X.q.sustento || '') + '</div>' +
      '<div class="cur-j-acc" style="padding:0"><button type="button" class="pri" id="cur-rep-sig">Siguiente →</button></div>';
  } else {
    h += '<p class="cur-reto-sit">' + _curEsc(X.q.texto) + '</p>';
    if(CURRP.ver){
      h += (X.q.pasos || []).filter(function(p){ return p.t !== 'cierre' && p.txt; }).map(function(p){ return '<div class="cur-j-paso"><b>' + _curEsc(p.tit) + '</b>' + _curEsc(p.txt) + '</div>'; }).join('') +
           '<div class="cur-j-acc" style="padding:0"><button type="button" id="cur-rep-no">La repaso</button><button type="button" class="pri" id="cur-rep-si">La sabía ✓</button></div>';
    } else h += '<p class="tenue" style="margin:0">Piénsala un momento y luego mira la respuesta.</p><div class="cur-j-acc" style="padding:0"><button type="button" class="pri" id="cur-rep-ver">Ver la respuesta</button></div>';
  }
  return h + '</div>';
}
function _curRepasoEnlazar(){
  var M = _curPregsCurso(), on = function(id, fn){ var e = document.getElementById(id); if(e) e.onclick = fn; };
  var sigue = function(sabia){
    var a = _curLeerAv(); _curRepasoAnotar(a, CURRP.cola[CURRP.i], sabia);
    if(sabia) CURRP.bien++; else CURRP.mal++;
    if(CURRP.i === CURRP.cola.length - 1){ a.puntos += 5; _curTocarRacha(a); }
    _curGuardarAv(a);
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-cur-rop]'), function(b){
    b.onclick = function(){ var X = M[CURRP.cola[CURRP.i]]; CURRP.eleg = +b.getAttribute('data-cur-rop'); sigue(CURRP.eleg === X.q.ok); _curPintar(); };
  });
  on('cur-rep-sig', function(){ CURRP.i++; CURRP.eleg = null; CURRP.ver = false; _curPintar(); });
  on('cur-rep-ver', function(){ CURRP.ver = true; _curPintar(); });
  on('cur-rep-si', function(){ sigue(true); CURRP.i++; CURRP.ver = false; _curPintar(); });
  on('cur-rep-no', function(){ sigue(false); CURRP.i++; CURRP.ver = false; _curPintar(); });
  on('cur-rep-sigue', function(){ var s = _curSigueCurso(); if(s){ CURRP = null; CURW.modId = s.modId; if(s.lec) CURW.lecId[s.modId] = s.lec; _curPintar(); } });
}
/* qué sigue en el curso: la primera lección sin ver de un módulo abierto; si no, la primera prueba sin aprobar */
function _curSigueCurso(){
  var D = CURW.data || {}, av = _curLeerAv(), mods = (D.modulos || []).filter(function(m){ return _curAbierto(m); });
  for(var i = 0; i < mods.length; i++){
    var L = _curLecs(mods[i]);
    for(var j = 0; j < L.length; j++) if(!_curVista(av, L[j].id)) return { modId:mods[i].id, lec:L[j].id, txt:'Sigue: ' + _curNomMod(mods[i]) + ' · Lección ' + (j + 1) + ' · ' + L[j].titulo };
  }
  for(var k = 0; k < mods.length; k++) if(!_curAprobado(av, mods[k].id) && (mods[k].quiz || []).length) return { modId:mods[k].id, lec:null, txt:'Sigue: la prueba de ' + _curNomMod(mods[k]) };
  return null;
}

/* ── los contadores sin nombres ── */
var CUR_CONT = { t:null, mandando:false };
function _curColaLeer(){ try{ var c = JSON.parse(_curGet('acad_cont_cola') || '[]'); return Array.isArray(c) ? c : []; }catch(e){ return []; } }
function _curColaGuardar(c){ _curSet('acad_cont_cola', JSON.stringify(c.slice(-200))); }
/* lo ya contado en este equipo va aparte del avance («acad_cont:<usuario>»): borrar el avance no lo vuelve a contar */
function _curContLeer(){ try{ var o = JSON.parse(_curGet('acad_cont:' + _curUid()) || '{}'); return _curObj(o); }catch(e){ return {}; } }
function _curContGuardar(o){ _curSet('acad_cont:' + _curUid(), JSON.stringify(o)); }
function _curContar(ev, clave){
  try{
    var cc = _curContLeer(), k = _curCurso() + '|' + ev + '|' + (clave || '');
    if(cc[k]) return;
    cc[k] = _curHoy(); _curContGuardar(cc);
    var c = _curColaLeer(); c.push({ c:_curCurso(), e:ev, k:String(clave || '') }); _curColaGuardar(c);
    clearTimeout(CUR_CONT.t); CUR_CONT.t = setTimeout(_curContarMandar, 3000);
  }catch(e){}
}
function _curContarMandar(){
  var c = _curColaLeer();
  if(!c.length || CUR_CONT.mandando || typeof sbRpc !== 'function') return;
  var lote = c.slice(0, 30); CUR_CONT.mandando = true;
  sbRpc('acad_contar', { p_eventos:lote }).then(function(r){
    CUR_CONT.mandando = false;
    if(r && r.ok){ var resto = _curColaLeer().slice(lote.length); _curColaGuardar(resto); if(resto.length){ clearTimeout(CUR_CONT.t); CUR_CONT.t = setTimeout(_curContarMandar, 3000); } }
  }, function(){ CUR_CONT.mandando = false; });
}
/* volver: al día siguiente del primero y a los 7 días o más (una vez cada uno por equipo) */
function _curContarVuelta(){
  var cc = _curContLeer(), hoy = _curHoy(), k = 'primer:' + _curCurso();
  if(!cc[k]){ cc[k] = hoy; _curContGuardar(cc); return; }
  if(hoy === _curDiaMas(cc[k], 1)) _curContar('vuelve1', '');
  if(hoy >= _curDiaMas(cc[k], 7)) _curContar('vuelve7', '');
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
function _curExKey(){ return 'acad_examen:' + _curUid() + (_curCurso() === 'curso-01' ? '' : ':' + _curCurso()); }
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
        _curContar('final', _curCurso());
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
       'Si el nombre salió mal, escríbenos a info@obrasstapp.com.</small>' +
       '<div class="cub-ir"><button type="button" class="bt sec" id="cur-cf-bolsa">💼 Ponla en la Bolsa de trabajo</button>' +
       '<small class="tenue">Las empresas que buscan personal en OBRASST ven que la tienes; el folio, solo la empresa cuya invitación aceptes.</small></div></div>';
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
  var cb = document.getElementById('cur-cf-bolsa');
  if(cb) cb.onclick = function(){ CURW.modId = 'bolsa'; CURB.tab = CURB.perfil ? 'per' : ''; CURB.editar = false; _curPintar(); };
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

/* ══ BOLSA DE TRABAJO SST: EL LADO DEL CANDIDATO (tanda 5 · 15/11/2026) ═════════════════════════════════════════
   El que aprende en la Academia arma aquí su perfil para las empresas que usan OBRASST (el lado de la empresa está en
   portal/bolsa.js). Todo por el servidor (sql/2026-11-15-bolsa-real.sql): bt_mi_perfil, bt_perfil_guardar (pide el
   permiso marcado por la persona, Ley N.° 29733), bt_perfil_visible, bt_perfil_borrar, bt_vacantes_abiertas,
   bt_postular y bt_invitacion_responder. Marcelo (15/11): antes de aceptar una invitación, la empresa ve solo cargo,
   años y distrito (y sectores, disponibilidad y si tiene constancia, sin folio); al aceptar, esa empresa ve su nombre y
   su contacto. */
var CURB = null;
function _curBolsaReset(){
  var g = (CURB && CURB.gen) || 0;
  CURB = { gen:g + 1, cargado:false, cargando:false, pedida:false, error:'', perfil:null, constancias:[], postulaciones:[], invitaciones:[], vacantes:[], tab:'', editar:false, borrar:false };
}
_curBolsaReset();
var BT_TEXTO = 'bolsa-1511';
var BT_CARGOS = ['Supervisor SST', 'Prevencionista de riesgos', 'Jefe de seguridad', 'Ingeniero de seguridad', 'Coordinador SSOMA', 'Asistente SSOMA', 'Monitor de seguridad'];
var BT_SECTORES = ['Construcción', 'Minería', 'Hidrocarburos', 'Industria', 'Energía', 'Pesca', 'Agricultura', 'Transporte y logística', 'Oficinas y servicios'];
var BT_DEPS = ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
  'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'];
var BT_DISP = ['Inmediata', 'En 15 días', 'En 30 días', 'Solo por proyecto'];

function _curBolsaCargar(){
  if(!_curHaySesion() || CURB.cargando) return;
  CURB.cargando = true; CURB.error = '';
  var gen = CURB.gen;
  Promise.all([sbRpc('bt_mi_perfil', {}), sbRpc('bt_vacantes_abiertas', {})]).then(function(x){
    if(gen !== CURB.gen) return;   /* cambió la cuenta o se volvió a abrir la Academia */
    CURB.cargando = false; CURB.cargado = true;
    var a = x[0] || {}, b = x[1] || {};
    if(!a.ok){ CURB.error = 'No se pudo abrir tu perfil ahora.'; }
    CURB.perfil = a.perfil || null; CURB.constancias = a.constancias || []; CURB.postulaciones = a.postulaciones || []; CURB.invitaciones = a.invitaciones || [];
    CURB.vacantes = b.vacantes || [];
    if(!CURB.tab) CURB.tab = CURB.invitaciones.some(function(i){ return i.estado === 'enviada'; }) ? 'inv' : 'vac';
    if(CURW.modId === 'bolsa') _curPintar(); else _curPintarLista();
  }, function(){
    if(gen !== CURB.gen) return;
    CURB.cargando = false; CURB.cargado = true; CURB.error = 'La Bolsa necesita señal. Revisa tu conexión y vuelve a intentarlo.';
    if(CURW.modId === 'bolsa') _curPintar();
  });
}
function _curBolsaPendientes(){ return (CURB.invitaciones || []).filter(function(i){ return i.estado === 'enviada'; }).length; }
function _curBolsaItemTxt(){
  if(!_curHaySesion() || !CURB.cargado || CURB.error) return 'Tu perfil para empresas que usan OBRASST';
  var n = _curBolsaPendientes();
  if(n) return '<span class="pill ok">' + n + (n === 1 ? ' invitación' : ' invitaciones') + ' por responder</span>';
  return CURB.perfil ? (CURB.perfil.visible ? 'Tu perfil está a la vista' : 'Tu perfil está oculto') : 'Arma tu perfil para las empresas';
}
function _curOpts(L, sel){ return L.map(function(v){ return '<option' + (v === sel ? ' selected' : '') + '>' + _curEsc(v) + '</option>'; }).join(''); }
function _curBolsaForm(){
  var p = CURB.perfil || {}, c = (CURB.constancias || [])[0], nuevo = !CURB.perfil;
  var correo = p.correo || ((window.TOK && TOK.correo) ? TOK.correo : '');
  var h = '<form id="cub-form" class="cub-form">' +
    '<div class="cub-campo"><label for="cub-nombre">Nombre y apellidos</label><input id="cub-nombre" maxlength="90" autocomplete="name" value="' + _curEsc(p.nombre || (c && c.nombre) || '') + '">' +
      '<small class="tenue">Las empresas lo ven solo si aceptas su invitación.</small></div>' +
    '<div class="cub-campo"><label for="cub-cargo">Cargo que buscas</label><input id="cub-cargo" list="cub-cargos" maxlength="80" value="' + _curEsc(p.cargo || '') + '" placeholder="Supervisor SST">' +
      '<datalist id="cub-cargos">' + BT_CARGOS.map(function(x){ return '<option value="' + _curEsc(x) + '">'; }).join('') + '</datalist></div>' +
    '<div class="cub-campo"><label for="cub-anios">Años de experiencia en SST</label><input id="cub-anios" type="number" min="0" max="60" step="0.5" inputmode="decimal" value="' + _curEsc(p.anios != null ? p.anios : '') + '"></div>' +
    '<fieldset class="cub-campo cub-secs"><legend>Sectores donde trabajaste</legend>' + BT_SECTORES.map(function(sx, i){
      return '<label class="cur-chk"><input type="checkbox" data-cub-sec="' + i + '"' + ((p.sectores || []).indexOf(sx) > -1 ? ' checked' : '') + '> <span>' + _curEsc(sx) + '</span></label>';
    }).join('') + '</fieldset>' +
    '<div class="cub-fila"><div class="cub-campo"><label for="cub-dep">Departamento</label><select id="cub-dep">' + _curOpts(BT_DEPS, p.departamento || 'Lima') + '</select></div>' +
      '<div class="cub-campo"><label for="cub-dis">Distrito</label><input id="cub-dis" maxlength="60" value="' + _curEsc(p.distrito || '') + '"></div></div>' +
    '<div class="cub-campo"><label for="cub-disp">Disponibilidad</label><select id="cub-disp">' + _curOpts(BT_DISP, p.disponibilidad || 'Inmediata') + '</select></div>' +
    '<div class="cub-campo"><label for="cub-res">Resumen de tu experiencia</label><textarea id="cub-res" maxlength="600" rows="4" placeholder="Obras donde trabajaste, lo que manejas (IPERC, PETAR, comité…)">' + _curEsc(p.resumen || '') + '</textarea>' +
      '<small class="tenue">Sin tu teléfono ni tu correo: esos van abajo y se muestran solo a la empresa cuya invitación aceptes.</small></div>' +
    '<div class="cub-fila"><div class="cub-campo"><label for="cub-tel">Celular</label><input id="cub-tel" maxlength="30" inputmode="tel" autocomplete="tel" value="' + _curEsc(p.telefono || '') + '"></div>' +
      '<div class="cub-campo"><label for="cub-cor">Correo</label><input id="cub-cor" maxlength="120" inputmode="email" autocomplete="email" value="' + _curEsc(correo) + '"></div></div>' +
    '<label class="cur-chk"><input type="checkbox" id="cub-vis"' + (p.visible === false ? '' : ' checked') + '> <span>Que las empresas puedan encontrar mi perfil</span></label>';
  if(nuevo){
    h += '<div class="cub-permiso"><b>Antes de crear tu perfil</b>' +
      '<p>Las empresas que buscan personal en OBRASST ven de ti, antes de que aceptes una invitación, solo: cargo, años de experiencia, departamento y distrito, ' +
      'sectores, disponibilidad y si tienes la constancia de la Academia (sin su folio). Tu nombre, tu celular, tu correo, tu resumen y el folio de tu ' +
      'constancia los ve solo la empresa cuya invitación aceptes. Puedes cambiar tus datos, ocultar tu perfil o borrarlo cuando quieras.</p>' +
      '<label class="cur-chk"><input type="checkbox" id="cub-acepto"> <span>Autorizo a OBRASST a guardar estos datos y a mostrarlos a las empresas como dice arriba ' +
      '(Ley N.° 29733, de Protección de Datos Personales). <a href="privacidad-academia.html" target="_blank" rel="noopener">Cómo cuidamos tus datos</a></span></label></div>';
  }
  h += '<div class="cub-acc"><button type="submit" class="bt" id="cub-guardar">' + (nuevo ? 'Crear mi perfil' : 'Guardar los cambios') + '</button>' +
       (nuevo ? '' : '<button type="button" class="bt sec" id="cub-cancelar">Cancelar</button>') + '</div>' +
       '<div class="msg" id="cub-msg" role="status" hidden></div></form>';
  return h;
}
function _curBolsaPerfilHtml(){
  var p = CURB.perfil, c = CURB.constancias || [];
  if(CURB.editar) return _curBolsaForm();
  var h = '<div class="cur-box"><div class="cub-cab"><b>' + _curEsc(p.nombre) + '</b>' + (p.visible ? '<span class="pill ok">A la vista de las empresas</span>' : '<span class="pill gris">Oculto</span>') + '</div>' +
    '<dl class="cub-dl"><dt>Cargo</dt><dd>' + _curEsc(p.cargo) + '</dd><dt>Experiencia</dt><dd>' + _curEsc(p.anios) + ' años</dd>' +
    '<dt>Dónde</dt><dd>' + _curEsc([p.distrito, p.departamento].filter(Boolean).join(', ')) + '</dd>' +
    '<dt>Sectores</dt><dd>' + _curEsc((p.sectores || []).join(', ') || '—') + '</dd><dt>Disponibilidad</dt><dd>' + _curEsc(p.disponibilidad) + '</dd>' +
    '<dt>Contacto</dt><dd>' + _curEsc([p.telefono, p.correo].filter(Boolean).join(' · ')) + ' <small class="tenue">(solo para la empresa cuya invitación aceptes)</small></dd>' +
    '<dt>Constancia</dt><dd>' + (c.length ? c.map(function(x){ return _curEsc(x.curso) + ' (' + _curEsc(x.nota) + ' %)'; }).join(', ') : '<span class="tenue">Todavía ninguna: aparece sola al aprobar el examen final</span>') + '</dd></dl>' +
    '<div class="cub-acc"><button type="button" class="bt" id="cub-editar">Cambiar mis datos</button>' +
    '<button type="button" class="bt sec" id="cub-vis-bt">' + (p.visible ? 'Ocultar mi perfil' : 'Mostrar mi perfil') + '</button>' +
    '<button type="button" class="bt sec" id="cub-borrar">Borrar mi perfil</button></div>' +
    (CURB.borrar ? '<div class="cub-borrar-ok" role="alert"><p>Se borran tu perfil, tus postulaciones y tus invitaciones (tu constancia de la Academia sigue). No se puede deshacer.</p>' +
       '<button type="button" class="bt mal" id="cub-borrar-si">Sí, borrar mi perfil</button> <button type="button" class="bt sec" id="cub-borrar-no">No</button></div>' : '') +
    '<div class="msg" id="cub-msg" role="status" hidden></div>' +
    '<small class="tenue">Permiso dado el ' + _curEsc(_curFechaLima(p.acepto_en)) + '.</small></div>';
  return h;
}
function _curBolsaVacantesHtml(){
  var L = CURB.vacantes || [];
  if(!L.length) return '<div class="cur-box"><b>Todavía no hay vacantes abiertas</b><p class="tenue" style="margin:0">Cuando una empresa publique una, aparece aquí. Con tu perfil a la vista, también te pueden invitar directo.</p></div>';
  return L.map(function(v){
    return '<div class="cur-box cub-vac"><div class="cub-cab"><b>' + _curEsc(v.cargo) + '</b><span class="tenue">' + _curEsc(v.empresa) + '</span></div>' +
      '<p class="cub-datos">' + _curEsc([v.sector, (+v.anios_min ? 'desde ' + v.anios_min + ' años' : ''), [v.distrito, v.departamento].filter(Boolean).join(', '), v.modalidad,
        v.inicio ? 'inicio ' + _curFechaLima(v.inicio + 'T12:00:00Z') : ''].filter(Boolean).join(' · ')) + '</p>' +
      (v.requisitos ? '<p class="cub-req">' + _curEsc(v.requisitos) + '</p>' : '') +
      (v.postule ? '<span class="pill ok">Ya postulaste</span>' :
        (CURB.perfil ? '<button type="button" class="bt" data-cub-post="' + _curEsc(v.id) + '">Postular</button>' : '<span class="tenue">Para postular, primero arma tu perfil.</span>')) + '</div>';
  }).join('');
}
function _curBolsaInvHtml(){
  var L = CURB.invitaciones || [];
  if(!L.length) return '<div class="cur-box"><b>Todavía no tienes invitaciones</b><p class="tenue" style="margin:0">Cuando una empresa te invite a una entrevista, aparece aquí y decides si le das tu nombre y tu contacto.</p></div>';
  return L.map(function(i){
    var est = i.estado === 'aceptada' ? '<span class="pill ok">Aceptaste</span>' : i.estado === 'rechazada' ? '<span class="pill gris">No aceptaste</span>' : '<span class="pill ojo">Por responder</span>';
    return '<div class="cur-box cub-inv"><div class="cub-cab"><b>' + _curEsc(i.empresa) + '</b>' + est + '</div>' +
      '<p class="cub-datos">Entrevista para <b>' + _curEsc(i.cargo) + '</b> · ' + _curEsc(_curFechaLima(i.fecha + 'T12:00:00Z')) + ', ' + _curEsc(i.hora) + ' · ' + _curEsc(i.modalidad) + '</p>' +
      '<p class="cub-datos">Dónde: ' + _curEsc(i.lugar) + '</p>' + (i.mensaje ? '<p class="cub-req">«' + _curEsc(i.mensaje) + '»</p>' : '') +
      (i.estado === 'enviada' ? '<p class="tenue" style="margin:0">Si aceptas, esta empresa ve tu nombre, tu celular, tu correo, tu resumen y el folio de tu constancia. Las demás, no.</p>' +
        '<div class="cub-acc"><button type="button" class="bt" data-cub-si="' + _curEsc(i.id) + '">Aceptar la entrevista</button>' +
        '<button type="button" class="bt sec" data-cub-no="' + _curEsc(i.id) + '">No, gracias</button></div>' :
        i.estado === 'aceptada' ? '<p class="tenue" style="margin:0">La empresa ya ve tu nombre y tu contacto para coordinar.</p>' : '') + '</div>';
  }).join('');
}
function _curBolsaHtml(){
  var h = '<div class="cur-head"><div><h3>💼 Bolsa de trabajo SST</h3><p class="sub" style="margin:2px 0 0">Las empresas que usan OBRASST pueden publicar vacantes aquí e invitarte a entrevistas. ' +
          'Antes de que aceptes una invitación, solo ven tu cargo, tus años y tu distrito (y tus sectores y tu disponibilidad); tu nombre y tu contacto, solo la empresa cuya invitación aceptes.</p></div></div>';
  if(!_curHaySesion()){
    return h + '<div class="cur-box"><b>La Bolsa va con tu cuenta de OBRASST</b><p style="margin:0;font-size:14px">Así tu perfil y tus invitaciones te esperan en cualquier equipo donde entres.</p>' +
      (typeof window.acadIrCuenta === 'function' ? '<div><button type="button" class="bt" id="cur-cod-cuenta">Entrar o crear mi cuenta</button></div>' : '') +
      '<div class="msg" id="cur-cod-msg" role="status" hidden></div></div>';
  }
  if(!CURB.cargado){ _curBolsaCargar(); return h + '<div class="vacio">Cargando…</div>'; }
  if(CURB.error) return h + '<div class="cur-box"><p class="msg mal" style="margin:0">' + _curEsc(CURB.error) + '</p><div><button type="button" class="bt" id="cub-otra">Intentar otra vez</button></div></div>';
  if(!CURB.perfil) return h + '<div class="cur-box"><b>Arma tu perfil</b>' + _curBolsaForm() + '</div>';
  var n = _curBolsaPendientes();
  h += '<div class="cub-tabs" role="group" aria-label="Bolsa de trabajo">' +
       '<button type="button" data-cub-tab="inv" aria-pressed="' + (CURB.tab === 'inv') + '">Invitaciones' + (n ? ' (' + n + ')' : '') + '</button>' +
       '<button type="button" data-cub-tab="vac" aria-pressed="' + (CURB.tab === 'vac') + '">Vacantes (' + (CURB.vacantes || []).length + ')</button>' +
       '<button type="button" data-cub-tab="per" aria-pressed="' + (CURB.tab === 'per') + '">Mi perfil</button></div>';
  h += '<div class="cub-cuerpo">' + (CURB.tab === 'per' ? _curBolsaPerfilHtml() : CURB.tab === 'inv' ? _curBolsaInvHtml() : _curBolsaVacantesHtml()) + '</div>';
  if((CURB.postulaciones || []).length && CURB.tab === 'vac'){
    h += '<div class="cur-sec"><b>Tus postulaciones</b><ul class="cub-posts">' + CURB.postulaciones.map(function(s){
      return '<li>' + _curEsc(s.cargo) + ' · ' + _curEsc(s.empresa) + ' · ' + (s.vacante_estado === 'activa' ? (s.estado === 'nueva' ? 'enviada' : 'la empresa ya la vio') : 'vacante cerrada') + '</li>';
    }).join('') + '</ul></div>';
  }
  return h;
}
function _curBolsaMsg(t, clase){ var m = document.getElementById('cub-msg'); if(!m) return; m.hidden = !t; m.className = 'msg ' + (clase || ''); m.textContent = t || ''; }
function _curBolsaRecargar(tab){ CURB.cargado = false; if(tab) CURB.tab = tab; _curBolsaCargar(); }
function _curBolsaEnlazar(){
  var on = function(id, fn){ var e = document.getElementById(id); if(e) e.onclick = fn; };
  on('cub-otra', function(){ CURB.cargado = false; _curPintar(); });
  _curEnlazarCodigo();
  Array.prototype.forEach.call(document.querySelectorAll('[data-cub-tab]'), function(b){
    b.onclick = function(){ CURB.tab = b.getAttribute('data-cub-tab'); CURB.editar = false; CURB.borrar = false; _curPintar(); };
  });
  on('cub-editar', function(){ CURB.editar = true; _curPintar(); });
  on('cub-cancelar', function(){ CURB.editar = false; _curPintar(); });
  on('cub-borrar', function(){ CURB.borrar = true; _curPintar(); });
  on('cub-borrar-no', function(){ CURB.borrar = false; _curPintar(); });
  on('cub-borrar-si', function(){
    sbRpc('bt_perfil_borrar', {}).then(function(r){
      if(r && r.ok){ toast('Tu perfil se borró.'); CURB.borrar = false; CURB.perfil = null; _curBolsaRecargar('vac'); }
      else _curBolsaMsg('No se pudo borrar. Inténtalo otra vez.', 'mal');
    }, function(){ _curBolsaMsg('Sin señal: no se borró. Inténtalo otra vez.', 'mal'); });
  });
  on('cub-vis-bt', function(){
    var nuevo = !(CURB.perfil && CURB.perfil.visible);
    sbRpc('bt_perfil_visible', { p_visible:nuevo }).then(function(r){
      if(r && r.ok){ toast(nuevo ? 'Tu perfil está a la vista de las empresas.' : 'Tu perfil quedó oculto: las empresas ya no lo ven.'); _curBolsaRecargar('per'); }
      else _curBolsaMsg('No se pudo cambiar. Inténtalo otra vez.', 'mal');
    }, function(){ _curBolsaMsg('Sin señal: no se cambió.', 'mal'); });
  });
  var f = document.getElementById('cub-form');
  if(f) f.onsubmit = function(ev){
    ev.preventDefault();
    var v = function(id){ var e = document.getElementById(id); return e ? String(e.value || '').replace(/\s+/g, ' ').trim() : ''; };
    var sec = []; Array.prototype.forEach.call(f.querySelectorAll('[data-cub-sec]'), function(c){ if(c.checked) sec.push(BT_SECTORES[+c.getAttribute('data-cub-sec')]); });
    var nuevo = !CURB.perfil, ac = document.getElementById('cub-acepto');
    var p = { nombre:v('cub-nombre'), cargo:v('cub-cargo'), anios:v('cub-anios'), sectores:sec, departamento:v('cub-dep'), distrito:v('cub-dis'),
              disponibilidad:v('cub-disp'), resumen:(document.getElementById('cub-res') || {}).value || '', telefono:v('cub-tel'), correo:v('cub-cor'),
              visible:!!(document.getElementById('cub-vis') || {}).checked, acepto:!!(ac && ac.checked), texto:BT_TEXTO };
    if(!_curNombreOk(p.nombre)){ _curBolsaMsg('Escribe tu nombre y apellido, solo con letras.', 'mal'); return; }
    if(p.cargo.length < 3){ _curBolsaMsg('Escribe el cargo que buscas.', 'mal'); return; }
    if(!p.telefono && !p.correo){ _curBolsaMsg('Deja tu celular o tu correo: es como la empresa te contacta si aceptas.', 'mal'); return; }
    if(nuevo && !p.acepto){ _curBolsaMsg('Para crear tu perfil, marca la autorización (está justo arriba).', 'mal'); if(ac) ac.focus(); return; }
    var b = document.getElementById('cub-guardar'); if(b) b.disabled = true;
    sbRpc('bt_perfil_guardar', { p:p }).then(function(r){
      if(b) b.disabled = false;
      if(r && r.ok){ toast(r.nuevo ? 'Listo: tu perfil está creado.' : 'Cambios guardados.'); CURB.editar = false; _curBolsaRecargar(r.nuevo ? 'vac' : 'per'); return; }
      var mo = r && r.motivo;
      _curBolsaMsg(mo === 'permiso' ? 'Marca la autorización para crear tu perfil.' : mo === 'nombre' ? 'Escribe tu nombre y apellido.' :
                   mo === 'correo' ? 'Revisa tu correo: parece mal escrito.' : mo === 'contacto' ? 'Deja tu celular o tu correo.' :
                   mo === 'cargo' ? 'Escribe el cargo que buscas.' : 'No se pudo guardar. Inténtalo otra vez.', 'mal');
    }, function(){ if(b) b.disabled = false; _curBolsaMsg('Sin señal: no se guardó. Tus datos siguen aquí; inténtalo otra vez.', 'mal'); });
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-cub-post]'), function(b){
    b.onclick = function(){
      b.disabled = true;
      sbRpc('bt_postular', { p_vacante:b.getAttribute('data-cub-post'), p_mensaje:'' }).then(function(r){
        if(r && r.ok){ toast('Postulaste. La empresa ve tu cargo, tus años y tu distrito; si te invita, decides si le das tu contacto.'); _curBolsaRecargar('vac'); }
        else { b.disabled = false; toast(r && r.motivo === 'cerrada' ? 'Esa vacante ya se cerró.' : r && r.motivo === 'muchos_intentos' ? 'Ya postulaste a muchas hoy: sigue mañana.' : 'No se pudo postular.'); }
      }, function(){ b.disabled = false; toast('Sin señal: no se envió.'); });
    };
  });
  var resp = function(id, si){
    sbRpc('bt_invitacion_responder', { p_id:id, p_acepta:si }).then(function(r){
      if(r && r.ok){ toast(si ? 'Aceptaste: la empresa ya ve tu nombre y tu contacto para coordinar.' : 'Listo: no aceptaste esa invitación.'); _curBolsaRecargar('inv'); }
      else toast('Esa invitación ya no está para responder.');
    }, function(){ toast('Sin señal: no se envió tu respuesta.'); });
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-cub-si]'), function(b){ b.onclick = function(){ resp(b.getAttribute('data-cub-si'), true); }; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-cub-no]'), function(b){ b.onclick = function(){ resp(b.getAttribute('data-cub-no'), false); }; });
}

/* ══ VISTA PRINCIPAL DE LA ACADEMIA ══════════════════════════════════════════════════════════ */
function vistaAcademia(caja){
  _curCss();
  CURW.caja = caja;
  _curExSoltar(); CURX = null; CURR = null; CURRP = null;
  _curBolsaReset();
  var ac = $('acciones'); if(ac) ac.innerHTML = '';
  cargando(caja);
  /* 15/11/2026 · lo que dice el servidor de esta cuenta (curso completo, constancia); si tarda, se pinta con lo guardado */
  var est = _curCargarEstado(), pintado = false, huella = '';
  var espera = new Promise(function(res){ setTimeout(res, 2500); });
  Promise.all([_curCargarJson(), Promise.race([est, espera])]).then(function(){
    if(CURW.caja !== caja || VISTA.actual !== 'academia') return;
    var D = CURW.data || {}, mods = D.modulos || [];
    if(!(CURW.modId && (['final', 'bolsa', 'repaso'].indexOf(CURW.modId) > -1 || mods.some(function(x){ return x.id === CURW.modId; })))) CURW.modId = (mods[0] || {}).id || '';
    _curPintar(); pintado = true; huella = _curHuellaEstado();
    /* 15/11 · tanda 3: los contadores sin nombres (volver al día siguiente, a los 7 días) y lo que quedó por mandar */
    _curContarVuelta(); _curContarMandar();
  }).catch(function(){
    if(CURW.caja !== caja) return;
    caja.innerHTML = '<div class="tarj"><div class="tarj-cuerpo">' + _curCursosHtml() + '<p class="msg mal">No se pudo cargar este curso. Revisa tu conexión e inténtalo otra vez.</p>' +
      '<button type="button" class="bt" id="cur-otra-vez">Intentar otra vez</button></div></div>';
    Array.prototype.forEach.call(caja.querySelectorAll('[data-cur-curso]'), function(b){ b.onclick = function(){ _curCambiarCurso(b.getAttribute('data-cur-curso')); }; });
    var ov = document.getElementById('cur-otra-vez'); if(ov) ov.onclick = function(){ vistaAcademia(caja); };
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
  /* 15/11 · tanda 3: el repaso de hoy, arriba de todo */
  var due = _curRepasoHoy(av);
  if(due.length) h += '<button type="button" class="cur-mod cur-mod-repaso' + (CURW.modId === 'repaso' ? ' on' : '') + '" id="cur-rep-bt">' +
    '<span class="n">🔁</span><span class="tx"><b>Repaso de hoy</b><small>' + due.length + (due.length === 1 ? ' pregunta' : ' preguntas') + ' que conviene repasar</small></span></button>';
  var nvc = document.getElementById('cur-nivel-caja'); if(nvc) nvc.innerHTML = av.modo === 'jugando' ? _curNivelHtml(av) : '';
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
  /* 15/11/2026 · la Bolsa de trabajo SST (tanda 5): el perfil del alumno para las empresas que usan OBRASST */
  h += '<button type="button" class="cur-mod cur-mod-bolsa' + (CURW.modId === 'bolsa' ? ' on' : '') + '" id="cur-bolsa-bt" data-cur-bolsa="1">' +
       '<span class="n">💼</span><span class="tx"><b>Bolsa de trabajo SST</b><small>' + _curBolsaItemTxt() + '</small></span></button>';
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
  var bb = document.getElementById('cur-bolsa-bt');
  if(bb) bb.onclick = function(){ CURW.modId = 'bolsa'; CURB.editar = false; CURB.borrar = false; _curPintar(); };
  var rb = document.getElementById('cur-rep-bt');
  if(rb) rb.onclick = function(){ CURW.modId = 'repaso'; CURRP = null; _curPintar(); };
  /* con cuenta, se mira una vez si hay invitaciones por responder (para avisarlo en la lista) */
  if(_curHaySesion() && !CURB.cargado && !CURB.cargando && !CURB.pedida){
    CURB.pedida = true;
    setTimeout(function(){ if(!CURB.cargado && document.getElementById('cur-lista')) _curBolsaCargar(); }, 1500);
  }
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
  var esFinal = CURW.modId === 'final', esBolsa = CURW.modId === 'bolsa', esRepaso = CURW.modId === 'repaso', esModulo = !esFinal && !esBolsa && !esRepaso;
  var av = _curLeerAv(), sb = _curLeerSb(), m = _curMod(esModulo ? CURW.modId : null), EJ = D.ejemplo_sandbox || {};
  var lecs = _curLecs(m), lec = (esModulo && _curAbierto(m)) ? _curLecActual(m, av) : null, modo = lec ? _curModoDe(lec, av) : 'clasico';
  var jugando = (lec ? modo : (av.modo || 'clasico')) === 'jugando';
  if(lec) CURW.lecId[m.id] = lec.id;
  var abiertos = _curAbiertosTxt(D), completo = _curCompleto();
  var bloq1 = completo ? null : (D.modulos || []).filter(function(x){ return !_curAbierto(x); })[0];
  var h = '<div class="cur-wrap" id="cur-raiz">';
  h += '<div class="tarj"><div class="tarj-cuerpo">' + _curCursosHtml() + '<div class="cur-head"><div><h2>🎓 ' + _curEsc(D.marca) + ' · ' + _curEsc(D.titulo) + '</h2>' +
       '<p class="sub" style="margin:2px 0 0">' + _curEsc(D.subtitulo) + '</p></div>' +
       '<div class="cur-precios">' + (abiertos ? '<span class="pill ok">' + _curEsc(abiertos) + '</span>' : '') +
       (completo ? '' : '<span class="pill azul">Lanzamiento S/ ' + _curEsc(D.precio_lanzamiento_pen) + ' · Luego S/ ' + _curEsc(D.precio_regular_pen) + '</span>') +
       (bloq1 ? '<button type="button" class="btn chico sec" id="cur-ir-codigo">🔑 Activar mi código</button>' : '') + '</div></div>' +
       '<div class="cur-aviso" style="margin-top:10px" role="note"><b>Aviso importante:</b> ' + _curEsc(D.aviso_legal) + '</div></div></div>';

  h += '<div class="cur-grid">';
  /* Columna izquierda: los módulos */
  h += '<div class="tarj cur-col-mods" id="cur-col-mods"><div class="tarj-cuerpo"><div id="cur-nivel-caja"></div><h3>Módulos del curso (' + D.modulos.length + ')</h3><div class="cur-lista" id="cur-lista"></div></div></div>';

  /* Columna derecha: detalle del módulo (o el examen final) */
  h += '<div class="tarj cur-col-det"><div class="tarj-cuerpo" id="cur-det">';
  if(esRepaso){
    h += _curRepasoHtml();
  } else if(esBolsa){
    h += _curBolsaHtml();
  } else if(esFinal){
    h += _curFinalHtml();
  } else {
  h += '<div class="cur-head"><div><h3>' + _curEsc(_curNomMod(m)) + ' · ' + _curEsc(m.titulo) + '</h3><p class="sub" style="margin:2px 0 0">' + _curEsc(m.resumen) + '</p></div>' +
       '<span class="cur-head-der">' + (_curAbierto(m) ? '<span class="pill ok">Módulo abierto</span>' : '<span class="pill gris">🔒 Se abre con el curso completo</span>') +
       '<button type="button" class="btn chico sec cur-ver-mods" id="cur-ver-mods">☰ Los módulos</button></span></div>';

  /* Normas citadas */
  if(m.normas && m.normas.length){
    h += '<details class="cur-sec cur-normas"' + (_curAncho() > 900 ? ' open' : '') + '><summary><b>Normativa verificada del módulo</b> <span class="tenue">(' + m.normas.length + ')</span></summary><ul>' + m.normas.map(function(nr){
      return '<li><b>' + _curEsc(nr.norma) + '</b> (' + _curEsc(nr.articulo) + ')' +
             (nr.url ? ' — <a href="' + _curEsc(nr.url) + '" target="_blank" rel="noopener">fuente oficial</a>' : '') + '</li>';
    }).join('') + '</ul></details>';
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

    /* 15/11 · tanda 2: los retos del módulo (modo Jugando); en Clásico, la invitación a probarlos */
    if(_curRetosLista(m).length){
      if(jugando) h += _curRetosHtml(m, av);
      else h += '<div class="cur-sec cur-invita" id="cur-retos-inv"><span>🎯 En el modo Jugando este módulo trae retos: ' +
                _curEsc(_curRetosLista(m).map(function(x){ return x.tipo === 'dec' ? 'decisiones' : x.tipo === 'esc' ? 'encuentra el peligro' : 'una misión'; })
                  .filter(function(x, i, L){ return L.indexOf(x) === i; }).join(', ')) + '.</span> <button type="button" class="btn chico sec" id="cur-a-jugar">Probar el modo Jugando</button></div>';
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
  if(esModulo || esFinal) h += '<div class="cur-sec"><small class="tenue">' + (_curHaySesion() ? 'Tus lecciones y pruebas se guardan en este equipo; el curso completo y tu constancia, en tu cuenta. ' : 'Tu avance se guarda solo en este equipo. ') + '</small>' +
       '<button type="button" class="btn chico sec" id="cur-borrar">Borrar mi avance de este equipo</button></div>';
  h += '</div></div></div></div>';
  caja.innerHTML = h;

  _curPintarLista();
  _curPintarLecs();
  if(esRepaso) _curRepasoEnlazar(); else if(esBolsa) _curBolsaEnlazar(); else if(esFinal) _curFinalEnlazar(); else _curEnlazarCodigo();
  if(esModulo && jugando && m) _curRetosEnlazar(m);
  if(esModulo && m && _curAbierto(m)) _curContar('abre', m.id);
  Array.prototype.forEach.call(caja.querySelectorAll('[data-cur-curso]'), function(b){ b.onclick = function(){ _curCambiarCurso(b.getAttribute('data-cur-curso')); }; });
  var vm = document.getElementById('cur-ver-mods');
  if(vm) vm.onclick = function(){ var l = document.getElementById('cur-col-mods'); if(l && l.scrollIntoView) l.scrollIntoView({ behavior:'smooth', block:'start' }); };
  var aj = document.getElementById('cur-a-jugar');
  if(aj) aj.onclick = function(){ _curCambiarModo(lec, 'jugando', !lec); var r = document.getElementById('cur-retos-sec'); if(r && r.scrollIntoView) r.scrollIntoView({ behavior:'smooth', block:'start' }); };
  var irc = document.getElementById('cur-ir-codigo');
  if(irc && bloq1) irc.onclick = function(){
    CURX = null; CURW.modId = bloq1.id; _curPintar();
    var cc = document.getElementById('cur-cod');
    if(cc){ if(cc.scrollIntoView) cc.scrollIntoView({ behavior:'smooth', block:'center' }); var ci = document.getElementById('cur-cod-in'); if(ci) try{ ci.focus({ preventScroll:true }); }catch(e){} }
  };

  Array.prototype.forEach.call(caja.querySelectorAll('[data-cur-elige]'), function(b){
    b.onclick = function(){ _curContar('modo', b.getAttribute('data-cur-elige')); _curCambiarModo(lec, b.getAttribute('data-cur-elige'), true); };
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
    var a2 = _curLeerAv(), antes = _curAprobado(a2, m.id), primera = !a2.aprob[m.id];
    a2.resp[m.id] = resp;
    a2.aprob[m.id] = { ok:ok, bien:bien, tot:m.quiz.length, pct:pct, fecha:_curHoy() };
    if(ok && !antes){ a2.puntos += 20; _curTocarRacha(a2); }
    /* 15/11 · tanda 3: lo fallado vuelve en «Repaso de hoy»; lo que estaba en repaso y salió bien, sube de caja */
    m.quiz.forEach(function(q, i){ var k = m.id + ':q' + i; if(resp[i] !== q.ok) _curRepasoAnotar(a2, k, false); else if(a2.repaso[k]) _curRepasoAnotar(a2, k, true); });
    /* 15/11 · tanda 2: la insignia del módulo, al aprobar su prueba */
    var gana = ok && !antes && m.ludico && m.ludico.insignia && a2.insignias.indexOf(m.id) < 0;
    if(gana) a2.insignias.push(m.id);
    _curGuardarAv(a2);
    if(primera){ _curContar('prueba', m.id); if(ok) _curContar('aprueba1', m.id); m.quiz.forEach(function(q, i){ if(resp[i] !== q.ok) _curContar('falla', m.id + ':q' + i); }); }
    if(gana) toast('🏅 Ganaste la insignia «' + m.ludico.insignia + '»');
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
