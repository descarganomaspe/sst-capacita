/* ═══ EL ARCHIVO DE LA OBRA, EN LA WEB (08/10/2026) ══════════════════════════════════════════════════════
   Marcelo: «Los documentos escaneados, en las carpetas correspondientes, tienen que aparecer en la web también,
   al igual que las fotos (si es que el líder lo autoriza), pero los escaneados mmh también, quizás no quieran.
   En la web, se podrá previsualizar, editar el PDF su nombre, moverlo a una carpeta, etc, hasta tener la opción
   de unir PDF con los que se tiene, entre 1 a 100 PDF si gusta a la vez, tener orden en ello. Colócalo de modo
   profesional y ordenado ese sector.»

   Todo vive donde ya vivía: cada archivo es una fila de sst_doc (su «hoja» es su carpeta) con el archivo en el
   balde de la obra. Nada de esto tiene un lado web aparte:
   · Los ESCANEOS de la app: hoja «asistencia», su tipo dentro de la nota («fecha|clase|firmas[|pdfN|miniatura]»),
     igual que los sube y los mueve la app (subirEscaneo, escMoverA). Aquí salen por tipo, como en la app.
   · Las FOTOS DE OBRA: hoja «fotos». Las guarda la app desde la cámara con sello («Guardar en la obra»).
   · Lo demás: las carpetas de siempre (DC_CARPETAS), los carteles QR propios y lo que no tiene carpeta.
   «Qué se ve en la web» (sst_estado, clave «docs_web»): los escaneos sí (se apagan si el líder quiere), las fotos
   no hasta que el líder lo autorice. Lo cambia solo quien registró la empresa o su colíder (el servidor también lo
   frena: sql/2026-11-01-docs-web.sql). En la app no cambia nada: cada cosa sigue en su carpeta.
   Ver (PDF con pdf.js, fotos tal cual), cambiar el nombre, mover de carpeta, descargar (uno o un ZIP), quitar y
   UNIR EN UN PDF (de 1 a 100, en el orden que se elija, con índice y números de página si se quiere) con pdf-lib
   (pdflib/, licencia MIT): todo en el navegador; el resultado se descarga y, si pesa 25 MB o menos (el tope por
   archivo), se guarda en la carpeta que se elija.

   09/10/2026 · Marcelo: «No veo el tema de la sección de los PDF escaneados desde el celular, ni la opción donde debería
   elegir si salen los escaneados sí/no y las fotos sí/no, y el tema de unir PDF… después de unir el PDF, que se eliminen
   los documentos unidos o descargarlo para la laptop y eliminarlos… también comprimir esa unión para que pese menos, y
   obviamente, la previsualización». Todo estaba, pero escondido: «Unir» salía solo al marcar archivos, los escaneos
   solo si ya había alguno y «Qué se ve en la web» solo para el líder. Ahora:
   · la pestaña «Escaneos y fotos» (Documentos y avisos): este mismo archivo, solo con lo que llega de la app (DC.modo
     'esc'), y desde ahí se suben también los escaneados en la computadora, cada uno en su tipo (arcSubirEscaneos);
   · arriba, siempre, lo que se ve en la web (escaneos sí/no, fotos sí/no): el líder lo cambia ahí mismo, los demás
     ven quién lo decide; y la carpeta «Escaneos de la app» sale aunque esté vacía, diciendo cómo se llena;
   · «⧉ Unir en un PDF», siempre a la vista: sin nada marcado, se eligen ahí mismo («＋ Del archivo de la obra»);
   · el peso del PDF (ARC_PESOS): tal cual, liviano (el de fábrica) o muy liviano. Se achica lo que es imagen —las
     hojas escaneadas y las fotos—, página por página con pdf.js; un PDF con texto (Word, Excel) queda tal cual, y si
     achicarlo no ahorra, también;
   · al terminar se VE antes de nada (la vista previa), y recién ahí: descargarlo, guardarlo en la carpeta, o volver a
     cambiar el orden; y qué hacer con los originales: dejarlos, quitarlos (y liberar su espacio del plan) o bajarlos
     en un ZIP a la computadora y después quitarlos. Quitar ahora borra también el archivo del balde (_arcLiberar),
     no solo su fila: antes el archivo se quedaba y seguía contando en el espacio del plan.
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */

/* los tipos de escaneo de la app (ESC_CLASE_ET): armar.py comprueba que sean los mismos y en el mismo orden */
var ARC_CLASES=[['charla','Charla de 5 min'], ['capacitacion','Capacitación'], ['induccion','Inducción'], ['liderazgo','Reporte de liderazgo'],
  ['inspeccion','Inspección'], ['permiso','Permiso de trabajo'], ['ats','ATS'], ['epp','Entrega de EPP'], ['simulacro','Simulacro'],
  ['reunion','Reunión'], ['acta','Acta'], ['otro','Otro']];
var ARC_CLAVE='docs_web';
var ARC_TOPE_UNIR=100;                    /* Marcelo: «entre 1 a 100 PDF» */
var ARC_TOPE_BYTES=250*1024*1024;         /* lo que se baja para unir, en total: más que eso no lo aguanta un navegador */
var ARC_TOPE_GUARDAR=25*1024*1024;        /* el tope por archivo de la obra (DC_TOPE) */
var PDFLIB_V='1.17.1';
var ARC={ carpeta:'*', buscar:'', orden:'nuevo', sel:[], cfg:{escaneos:true, fotos:false}, cfgDe:null, cfgPide:null, cfgLeida:false,
          vista:[], abierto:null, unir:null, menu:null, _lib:null, ocupado:false, peso:'liviano' };
/* 09/10/2026 · el peso del PDF unido. ppp: los puntos por pulgada a los que se dibuja cada hoja escaneada; q: la calidad
   del JPG; lado: el lado mayor de una foto, en píxeles (una A4 a esos ppp) */
var ARC_PESOS=[
  { k:'tal',     n:'Tal cual',              d:'Cada página como viene. Pesa lo que suman los originales.' },
  { k:'liviano', n:'Liviano (recomendado)', d:'Las hojas escaneadas y las fotos se achican (150 ppp): se leen y se imprimen bien. Los PDF con texto, como los de Word o Excel, quedan tal cual.', ppp:150, q:0.72, lado:1754 },
  { k:'minimo',  n:'Muy liviano',           d:'Para mandarlo por WhatsApp o por correo (110 ppp): en la pantalla se lee bien; impreso, un poco menos nítido.', ppp:110, q:0.6, lado:1290 }
];
function arcPeso(k){ for(var i=0;i<ARC_PESOS.length;i++) if(ARC_PESOS[i].k===k) return ARC_PESOS[i]; return ARC_PESOS[1]; }
/* un PDF que pesa más que esto por página es, casi seguro, de hojas escaneadas o fotos: ese se achica */
var ARC_ESC_POR_PAG=110*1024;

function _arcCss(){
  if($('arc-css')) return;
  var s=document.createElement('style'); s.id='arc-css';
  s.textContent=
    /* la barra de lo elegido se queda arriba al bajar por la lista: la tarjeta no puede recortar (overflow) */
    '#t-docs.tarj{overflow:visible}'+
    '.arc-cab{display:flex; align-items:flex-start; justify-content:space-between; gap:10px 16px; flex-wrap:wrap; padding:14px 18px; border-bottom:1px solid var(--raya)}'+
    '.arc-cab h2{font-size:15px} .arc-cab .sub{font-size:13px; color:var(--gris); margin:2px 0 0; font-variant-numeric:tabular-nums}'+
    '.arc-cab-acc{display:flex; gap:8px; flex-wrap:wrap}'+
    '.arc-oculto{margin:12px 18px 0; display:flex; align-items:center; justify-content:space-between; gap:8px 12px; flex-wrap:wrap}'+
    '.arc-oculto .bt{flex:0 0 auto}'+
    '.arc-cuerpo{display:grid; grid-template-columns:236px minmax(0,1fr); min-height:320px}'+
    '.arc-arbol{border-right:1px solid var(--raya); padding:10px 8px 16px; background:#FBFCFD; max-height:72vh; overflow:auto; border-bottom-left-radius:12px}'+
    '.arc-g{font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--gris); margin:14px 10px 4px}'+
    '.arc-g:first-child{margin-top:4px}'+
    '.arc-c{-webkit-appearance:none; appearance:none; display:flex; align-items:center; gap:8px; width:100%; text-align:left; background:none; border:0;'+
      ' border-radius:7px; padding:6px 10px; cursor:pointer; color:var(--texto); font-size:13.5px; line-height:1.3}'+
    '.arc-c:hover{background:var(--fondo)}'+
    '.arc-c.on{background:var(--azul-f); color:var(--azul); font-weight:500}'+
    '.arc-c span{flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}'+
    '.arc-c small{flex:0 0 auto; font-size:12px; color:var(--gris); font-variant-numeric:tabular-nums}'+
    '.arc-c.on small{color:var(--azul)}'+
    '.arc-c.g-todo{font-weight:600}'+
    '.arc-c.arc-g{margin:14px 0 2px; padding:5px 10px; font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--gris)}'+
    '.arc-c.arc-g.on{color:var(--azul)}'+
    '.arc-c.arc-solo{margin-top:10px}'+
    '.arc-m{display:none; padding:12px 14px 0}'+
    '.arc-m label{font-size:12px; margin:0 0 4px; display:block; color:var(--gris)}'+
    '.arc-m select{width:100%}'+
    '.arc-lista{min-width:0; display:flex; flex-direction:column}'+
    '.arc-barra{display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid var(--raya); flex-wrap:wrap}'+
    '.arc-barra input[type=search]{flex:1 1 220px; min-width:0}'+
    '.arc-barra select{flex:0 0 auto; width:auto}'+
    '.arc-todos{display:inline-flex; align-items:center; gap:6px; font-size:13px; color:var(--gris); margin:0; cursor:pointer; white-space:nowrap}'+
    '.arc-sel{display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:10px 14px; background:var(--tinta); color:#fff; position:sticky; top:0; z-index:3}'+
    '.arc-sel b{font-weight:600; margin-right:auto; font-variant-numeric:tabular-nums}'+
    '.arc-sel .bt.sec{background:transparent; color:#fff; border-color:rgba(255,255,255,.45)}'+
    '.arc-sel .bt.sec:hover{background:rgba(255,255,255,.12)}'+
    '.arc-sel .bt.sec:disabled{opacity:.45; cursor:not-allowed}'+
    '.arc-sel .bt.sec.mal{border-color:#F3B4B8; color:#FFD9DB}'+
    '.arc-ul{list-style:none; margin:0; padding:0}'+
    '.arc-f{display:grid; grid-template-columns:auto 52px minmax(0,1fr) auto; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid var(--raya)}'+
    '.arc-f:last-child{border-bottom:0}'+
    '.arc-f:hover{background:#FAFBFC}'+
    '.arc-f.sel{background:var(--azul-f)}'+
    '.arc-f input[type=checkbox]{width:17px; height:17px; margin:0; accent-color:var(--tinta); cursor:pointer}'+
    '.arc-mini{-webkit-appearance:none; appearance:none; width:52px; height:52px; border-radius:8px; border:1px solid var(--raya); background:var(--fondo);'+
      ' display:grid; place-items:center; overflow:hidden; padding:0; cursor:pointer}'+
    '.arc-mini img{width:100%; height:100%; object-fit:cover; display:block}'+
    '.arc-tipo{font:600 10.5px/1 var(--mono); letter-spacing:.04em; padding:5px 6px; border-radius:5px; color:#fff; background:var(--gris)}'+
    '.arc-tipo.pdf{background:#B42318} .arc-tipo.img{background:#0F766E} .arc-tipo.word{background:#1D4ED8} .arc-tipo.excel{background:#15803D}'+
    '.arc-tipo.ppt{background:#C2410C} .arc-tipo.enlace{background:#475569}'+
    '.arc-nom{min-width:0}'+
    '.arc-tit{-webkit-appearance:none; appearance:none; background:none; border:0; padding:0; margin:0; text-align:left; cursor:pointer; color:var(--tinta);'+
      ' font-weight:500; font-size:14px; line-height:1.35; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block}'+
    '.arc-tit:hover{text-decoration:underline}'+
    '.arc-nom small{display:block; color:var(--gris); font-size:12.5px; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-variant-numeric:tabular-nums}'+
    '.arc-acc{display:flex; align-items:center; gap:6px}'+
    '.arc-mas{-webkit-appearance:none; appearance:none; width:34px; height:32px; border-radius:7px; border:1px solid var(--raya2); background:var(--panel);'+
      ' cursor:pointer; color:var(--tinta); font-size:17px; line-height:1; padding:0}'+
    '.arc-mas:hover{background:var(--fondo)}'+
    '.arc-menu{position:fixed; z-index:60; min-width:210px; background:var(--panel); border:1px solid var(--raya2); border-radius:10px;'+
      ' box-shadow:0 12px 32px -12px rgba(11,42,58,.35); padding:6px}'+
    '.arc-menu button{-webkit-appearance:none; appearance:none; display:block; width:100%; text-align:left; background:none; border:0; border-radius:7px;'+
      ' padding:8px 10px; cursor:pointer; font-size:13.5px; color:var(--texto)}'+
    '.arc-menu button:hover, .arc-menu button:focus-visible{background:var(--fondo)}'+
    '.arc-menu button.mal{color:var(--mal)}'+
    '.arc-menu hr{border:0; border-top:1px solid var(--raya); margin:5px 2px}'+
    '.arc-vacio{padding:40px 18px; text-align:center; color:var(--gris); font-size:14px}'+
    '.arc-vacio b{display:block; color:var(--texto); font-weight:500; margin-bottom:4px}'+
    '.arc-pie{padding:10px 14px; border-top:1px solid var(--raya); font-size:12.5px; color:var(--gris); font-variant-numeric:tabular-nums}'+
    /* la vista de uno */
    '.arc-ver-img{display:grid; place-items:center; background:var(--fondo); border:1px solid var(--raya); border-radius:10px; padding:10px; margin:0 0 12px}'+
    '.arc-ver-img img{max-width:100%; max-height:66vh; object-fit:contain; border-radius:4px; display:block}'+
    '.arc-ver-otro{display:grid; justify-items:center; gap:10px; text-align:center; padding:30px 16px; background:var(--fondo); border:1px solid var(--raya);'+
      ' border-radius:10px; margin:0 0 12px; color:var(--gris); font-size:13.5px}'+
    '.arc-ver-otro .arc-tipo{font-size:14px; padding:9px 11px; border-radius:8px}'+
    '.arc-dl{display:grid; grid-template-columns:max-content minmax(0,1fr); gap:5px 16px; margin:0; font-size:13px}'+
    '.arc-dl dt{color:var(--gris)} .arc-dl dd{margin:0; min-width:0; overflow-wrap:anywhere}'+
    '.arc-nav{display:flex; gap:6px; margin-right:auto}'+
    /* mover */
    '.arc-mv-nota{font-size:12.5px; color:var(--gris); margin:4px 0 0}'+
    /* «qué se ve en la web» */
    '.arc-sw{display:grid; grid-template-columns:auto minmax(0,1fr); gap:4px 12px; align-items:start; padding:12px 14px; border:1px solid var(--raya);'+
      ' border-radius:10px; margin:0 0 10px; cursor:pointer}'+
    '.arc-sw input{width:18px; height:18px; margin:2px 0 0; accent-color:var(--tinta)}'+
    '.arc-sw b{display:block; color:var(--tinta); font-weight:600; font-size:14px}'+
    '.arc-sw small{display:block; color:var(--gris); font-size:12.5px; line-height:1.45; margin-top:2px}'+
    /* unir */
    '.arc-u-orden{display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:0 0 8px; font-size:12.5px; color:var(--gris)}'+
    '.arc-u-lista{list-style:none; margin:0 0 10px; padding:0; border:1px solid var(--raya); border-radius:10px; max-height:46vh; overflow:auto}'+
    '.arc-u-lista li{display:grid; grid-template-columns:28px auto minmax(0,1fr) auto; align-items:center; gap:10px; padding:8px 10px; border-bottom:1px solid var(--raya);'+
      ' background:var(--panel)}'+
    '.arc-u-lista li:last-child{border-bottom:0}'+
    '.arc-u-lista li.arrastra{opacity:.45}'+
    '.arc-u-lista li.sobre{box-shadow:inset 0 2px 0 var(--azul)}'+
    '.arc-u-n{font:600 12px/1 var(--mono); color:var(--gris); text-align:right; font-variant-numeric:tabular-nums}'+
    '.arc-u-lista b{display:block; font-weight:500; font-size:13.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}'+
    '.arc-u-lista small{display:block; font-size:12px; color:var(--gris); overflow:hidden; text-overflow:ellipsis; white-space:nowrap}'+
    '.arc-u-lista li[draggable=true]{cursor:grab}'+
    '.arc-u-b{display:flex; gap:4px}'+
    '.arc-u-b button{-webkit-appearance:none; appearance:none; width:30px; height:28px; border-radius:6px; border:1px solid var(--raya2); background:var(--panel);'+
      ' cursor:pointer; color:var(--tinta); font-size:13px; line-height:1; padding:0}'+
    '.arc-u-b button:hover{background:var(--fondo)} .arc-u-b button:disabled{opacity:.35; cursor:default}'+
    '.arc-u-no{font-size:12.5px; color:var(--gris); margin:0 0 12px}'+
    '.arc-op{display:flex; align-items:flex-start; gap:9px; font-size:13.5px; margin:0 0 8px; cursor:pointer}'+
    '.arc-op input{width:16px; height:16px; margin:2px 0 0; accent-color:var(--tinta)}'+
    '.arc-prog{height:8px; border-radius:99px; background:var(--fondo); border:1px solid var(--raya); overflow:hidden; margin:10px 0 6px}'+
    '.arc-prog i{display:block; height:100%; width:0; background:var(--tinta); transition:width .2s}'+
    '.arc-prog-t{font-size:12.5px; color:var(--gris); font-variant-numeric:tabular-nums; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}'+
    '.arc-res{border:1px solid #BFE3CE; background:var(--ok-f); border-radius:10px; padding:14px; margin:0 0 12px}'+
    '.arc-res b{color:var(--ok); font-size:14.5px; display:block; margin:0 0 4px}'+
    '.arc-res .acc{display:flex; gap:8px; flex-wrap:wrap; margin:10px 0 0}'+
    /* 09/10/2026 · lo que se ve en la web, siempre a la vista */
    '.arc-web{display:flex; align-items:center; gap:6px 8px; flex-wrap:wrap; padding:10px 18px; border-bottom:1px solid var(--raya); font-size:13px; background:#FBFCFD}'+
    '.arc-web-t{color:var(--gris); margin-right:2px}'+
    '.arc-chip{display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:99px; font-size:12.5px; font-weight:500; border:1px solid var(--raya2)}'+
    '.arc-chip.si{background:var(--ok-f); color:var(--ok); border-color:#BFE3CE} .arc-chip.no{background:var(--fondo); color:var(--gris)}'+
    '.arc-web-q{color:var(--gris); font-size:12.5px; margin-left:auto}'+
    '.arc-web .bt{margin-left:auto}'+
    '.arc-cab-acc .bt{white-space:nowrap}'+
    '.arc-c.vacia small{opacity:.6}'+
    '.arc-vacio .acc{display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:12px}'+
    /* elegir del archivo, dentro de «Unir» */
    '.arc-u-el{border:1px solid var(--raya2); border-radius:10px; padding:10px; margin:0 0 12px; background:#FBFCFD}'+
    '.arc-u-el-cab{display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin:0 0 8px}'+
    '.arc-u-el-cab input[type=search]{flex:1 1 200px; min-width:0}'+
    '.arc-u-el ul{list-style:none; margin:0; padding:0; max-height:34vh; overflow:auto; border:1px solid var(--raya); border-radius:8px; background:var(--panel)}'+
    '.arc-u-el li label{display:grid; grid-template-columns:auto auto minmax(0,1fr); align-items:center; gap:9px; padding:7px 10px; border-bottom:1px solid var(--raya); cursor:pointer; margin:0}'+
    '.arc-u-el li:last-child label{border-bottom:0}'+
    '.arc-u-el li input{width:16px; height:16px; margin:0; accent-color:var(--tinta)}'+
    '.arc-u-el b{display:block; font-weight:500; font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}'+
    '.arc-u-el small{display:block; font-size:12px; color:var(--gris); overflow:hidden; text-overflow:ellipsis; white-space:nowrap}'+
    '.arc-u-el p{font-size:12.5px; color:var(--gris); margin:8px 0 0}'+
    /* el peso */
    '.arc-pesos{display:grid; gap:6px; margin:4px 0 12px}'+
    '.arc-pesos label{display:grid; grid-template-columns:auto minmax(0,1fr); gap:3px 9px; align-items:start; padding:9px 11px; border:1px solid var(--raya); border-radius:9px; cursor:pointer; margin:0}'+
    '.arc-pesos label.on{border-color:var(--tinta); box-shadow:inset 0 0 0 1px var(--tinta)}'+
    '.arc-pesos input{width:16px; height:16px; margin:2px 0 0; accent-color:var(--tinta)}'+
    '.arc-pesos b{font-weight:600; font-size:13.5px} .arc-pesos small{display:block; color:var(--gris); font-size:12.5px; line-height:1.45}'+
    /* el resultado: la vista previa y lo que sigue */
    '.arc-res .pdfv{margin:10px 0 0; max-height:52vh; overflow:auto; background:var(--panel)}'+
    '.arc-res .peso{color:var(--texto)}'+
    '.arc-limpia{border:1px solid var(--raya2); border-radius:10px; padding:14px; margin:0 0 12px}'+
    '.arc-limpia h3{font-size:14px; margin:0 0 2px} .arc-limpia > p{font-size:12.5px; color:var(--gris); margin:0 0 10px}'+
    '.arc-limpia .acc{display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:4px}'+
    '.arc-limpia .msg{margin-top:8px}'+
    /* subir escaneos desde la computadora */
    '.arc-se-lista{list-style:none; margin:0 0 12px; padding:0; border:1px solid var(--raya); border-radius:10px; max-height:36vh; overflow:auto}'+
    '.arc-se-lista li{display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:10px; align-items:center; padding:8px 10px; border-bottom:1px solid var(--raya)}'+
    '.arc-se-lista li:last-child{border-bottom:0}'+
    '.arc-se-lista input[type=text]{width:100%; min-width:0}'+
    '.arc-se-lista small{font-size:12px; color:var(--gris); white-space:nowrap}'+
    '@media (max-width:760px){'+
      '.arc-cuerpo{grid-template-columns:minmax(0,1fr)}'+
      '.arc-arbol{display:none}'+
      '.arc-m{display:block}'+
      '.arc-f{grid-template-columns:auto 44px minmax(0,1fr); grid-template-areas:"ck mini nom" "ck mini acc"; gap:4px 10px}'+
      '.arc-f > input{grid-area:ck} .arc-f .arc-mini{grid-area:mini; width:44px; height:44px} .arc-f .arc-nom{grid-area:nom} .arc-f .arc-acc{grid-area:acc}'+
      '.arc-nom small{white-space:normal}'+
      '.arc-u-lista li{grid-template-columns:22px minmax(0,1fr) auto} .arc-u-lista li .arc-tipo{display:none}'+
    '}';
  document.head.appendChild(s);
}

/* ── lo de cada fila ─────────────────────────────────────────────────────────────────────────────────── */
function _arcJefe(){ var r=String((YO.obra||{}).rol||''); return r==='dueno' || r==='colider'; }
function _arcClaseEt(k){ for(var i=0;i<ARC_CLASES.length;i++) if(ARC_CLASES[i][0]===k) return ARC_CLASES[i][1]; return 'Otro'; }
function _arcClaseOk(k){ return ARC_CLASES.some(function(c){ return c[0]===k; }); }
function _arcFechaOk(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||'')); }
/* la nota de un escaneo, como la arma y la lee la app: fecha|clase|firmas[|pdfN|miniatura] */
function arcNotaEsc(f){
  var t=String((f && f.nota)||'').split('|');
  var pdf=/^pdf\d*$/.test(t[3]||'') || /\.pdf($|\?)/i.test(String((f && f.url)||''));
  return { fecha:_arcFechaOk(t[0]) ? t[0] : '', clase:_arcClaseOk(t[1]) ? t[1] : (t[1] ? 'otro' : 'charla'), firmas:parseInt(t[2], 10)||0,
           pdf:pdf, pags:pdf ? (parseInt(String(t[3]||'').slice(3), 10)||0) : 0, mini:(pdf && /^https?:\/\//i.test(t[4]||'')) ? t[4] : '' };
}
function _arcNotaEscTexto(n){
  return (n.fecha||'')+'|'+n.clase+'|'+(n.firmas||0)+(n.pdf ? '|pdf'+(n.pags||'')+'|'+(n.mini||'') : '');
}
/* el tipo de archivo, por su dirección (o, en los escaneos, por su nota) */
function _arcExt(u){ var p=String(u||'').split(/[?#]/)[0]; try{ p=decodeURIComponent(p); }catch(_d){} var m=p.match(/\.([a-z0-9]{2,5})$/i); return m ? m[1].toLowerCase() : ''; }
function _arcNuestro(u){ return /^data:/i.test(u||'') || /\/storage\/v1\/object\/public\//.test(String(u||'')); }
function arcTipo(f){
  var u=String((f && f.url)||'');
  if(!u) return 'nada';
  if(/^data:image\//i.test(u)) return 'img';
  if(/^data:application\/pdf/i.test(u)) return 'pdf';
  if(f.hoja==='asistencia') return arcNotaEsc(f).pdf ? 'pdf' : 'img';
  var e=_arcExt(u);
  if(e==='pdf') return 'pdf';
  if(/^(jpe?g|png|webp|gif|bmp|heic|heif)$/.test(e)) return 'img';
  if(/^(docx?|odt|rtf)$/.test(e)) return 'word';
  if(/^(xlsx?|xlsm|ods|csv)$/.test(e)) return 'excel';
  if(/^(pptx?|odp)$/.test(e)) return 'ppt';
  if(f.hoja==='fotos') return 'img';
  if(/^https?:\/\//i.test(u) && !_arcNuestro(u)) return 'enlace';
  return 'otro';
}
var ARC_TIPO_ET={ pdf:'PDF', img:'Foto', word:'Word', excel:'Excel', ppt:'PowerPoint', enlace:'Enlace', otro:'Archivo', nada:'Sin archivo' };
var ARC_TIPO_SIG={ pdf:'PDF', img:'JPG', word:'DOC', excel:'XLS', ppt:'PPT', enlace:'URL', otro:'ARCH', nada:'—' };
/* de qué carpeta es, cómo se llama, a qué grupo va, qué se puede hacer con él */
/* 09/10/2026 · el día de aquí de lo que trae hora («creado»): lo subido a las 10 p. m. de Lima ya es mañana en UTC, y el
   archivo mostraba mañana (como lo arregló fechaLarga en la lista de antes). Una fecha sola queda igual. */
function _arcDia(s){
  s=String(s||'');
  if(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)){ var t=new Date(s); if(!isNaN(t)) return t.getFullYear()+'-'+dos(t.getMonth()+1)+'-'+dos(t.getDate()); }
  return s.slice(0,10);
}
function arcInfo(f){
  if(f._arc) return f._arc;
  var h=String(f.hoja||''), I={ tipo:arcTipo(f), fecha:_arcDia(f.creado), det:'', mini:'' };
  if(h==='asistencia'){
    var n=arcNotaEsc(f);
    I.k='esc'; I.key='esc:'+n.clase; I.t=_arcClaseEt(n.clase); I.g='Escaneos de la app'; I.esc=n;
    if(n.fecha) I.fecha=n.fecha;
    I.det=(n.firmas ? n.firmas+' firma'+(n.firmas===1?'':'s') : '')+(n.pdf && n.pags ? (n.firmas ? ' · ' : '')+n.pags+' página'+(n.pags===1?'':'s') : '');
    I.mini = n.pdf ? n.mini : (I.tipo==='img' ? f.url : '');
    I.editable=true;
  } else if(h==='fotos'){
    I.k='foto'; I.key='fotos'; I.t='Fotos de obra'; I.g='Fotos de obra'; I.mini=(I.tipo==='img' ? f.url : ''); I.editable=true;
  } else {
    var d=dcCarpetaDe(h);
    if(d.c){
      I.k='doc'; I.key=d.base; I.t=d.c.t; I.g=_dcGrupo(d.c); I.editable=true;
      if(d.base==='ma-informe' || d.base==='simulacro') I.det=d.sub;
      else if(d.base==='certificados' && h!=='certificados') I.det=String(d.t).replace(/^Certificados · /, '');
    } else if(d.propio){ I.k='propio'; I.key=h; I.t=d.t; I.g='Carteles QR propios'; I.editable=true; }
    else { I.k='otro'; I.key='~'+h; I.t=d.t; I.g='Otros'; I.editable=false; }
    if(I.tipo==='img') I.mini=f.url;
  }
  f._arc=I; return I;
}
function arcVisible(f){ var k=arcInfo(f).k; return !((k==='esc' && !ARC.cfg.escaneos) || (k==='foto' && !ARC.cfg.fotos)); }
function arcFila(id){ var x=null; (DC.filas||[]).forEach(function(f){ if(!x && String(f.id)===String(id)) x=f; }); return x; }
function _arcSeUne(f){ var t=arcInfo(f).tipo; return (t==='pdf' || t==='img') && !!f.url; }
function _arcSub(f){
  var I=arcInfo(f), p=[];
  p.push(I.k==='esc' ? 'Escaneo · '+I.t : I.t);
  if(I.det) p.push(I.det);
  if(I.fecha) p.push(fechaLarga(I.fecha));
  p.push(ARC_TIPO_ET[I.tipo]||'Archivo');
  var nt=_arcNotaCorta(f); if(nt) p.push(nt);
  return p.join(' · ');
}
/* la nota de un documento, si es corta y es para leer («Versión 2», el lugar de la foto, «Unión de 5 documentos…») */
function _arcNotaCorta(f){
  if(!f || f.hoja==='asistencia' || !f.nota) return '';
  var t=String(f.nota).replace(/\s+/g, ' ').trim();
  return (t.length<=90 && !/^[\[{]/.test(t) && !/^\d{4}-\d{2}-\d{2}$/.test(t) && t.indexOf('|')<0) ? t : '';
}
function _arcIcono(f, chico){
  var I=arcInfo(f);
  if(I.mini) return '<img src="'+esc(I.mini)+'" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'arc-tipo '+I.tipo+'\',textContent:\''+ARC_TIPO_SIG[I.tipo]+'\'}))">';
  return '<span class="arc-tipo '+I.tipo+'">'+(I.tipo==='enlace' ? '🔗' : ARC_TIPO_SIG[I.tipo])+'</span>';
}

/* ── «qué se ve en la web»: lo decide el líder ───────────────────────────────────────────────────────── */
function arcCfgTraer(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && ARC.cfgDe===oid && ARC.cfgLeida) return Promise.resolve(ARC.cfg);
  if(ARC.cfgPide && ARC.cfgDe===oid) return ARC.cfgPide;
  ARC.cfgDe=oid;
  var p=estadoLeerP(ARC_CLAVE).then(function(fila){
    if(ARC.cfgPide===p) ARC.cfgPide=null;
    if((YO.obra||{}).id!==oid) return ARC.cfg;
    var v=(fila && fila.valor && typeof fila.valor==='object') ? fila.valor : {};
    ARC.cfg={ escaneos:v.escaneos!==false, fotos:v.fotos===true, quien:String(v.quien||fila && fila.quien || ''), cuando:String(v.cuando||fila && fila.actualizado || '') };
    ARC.cfgLeida=true; return ARC.cfg;
  }, function(){ if(ARC.cfgPide===p) ARC.cfgPide=null; ARC.cfgLeida=true; return ARC.cfg; });
  ARC.cfgPide=p; return p;
}
function arcCfgAbrir(){
  if(!_arcJefe()) return;
  var c=ARC.cfg;
  var cuerpo='<p class="ayuda" style="margin:0 0 14px">Lo que el equipo guarda desde la app, ¿se ve también aquí, en la web? Lo decides tú, como líder de la obra.</p>'+
    '<label class="arc-sw" for="arc-cfg-esc"><input type="checkbox" id="arc-cfg-esc"'+(c.escaneos?' checked':'')+'>'+
      '<span><b>Escaneos de la app</b><small>Las hojas firmadas que el equipo escanea —charlas, ATS, inducciones, permisos…—, cada una en su carpeta.</small></span></label>'+
    '<label class="arc-sw" for="arc-cfg-fot"><input type="checkbox" id="arc-cfg-fot"'+(c.fotos?' checked':'')+'>'+
      '<span><b>Fotos de obra</b><small>Las fotos con fecha, hora y ubicación que el equipo guarda en la obra desde la cámara de la app.</small></span></label>'+
    '<p class="ayuda">En la app no cambia nada: cada cosa sigue en su carpeta. Esto decide solo lo que se muestra en la web.'+
      (c.quien ? ' Lo cambió por última vez '+esc(c.quien)+(c.cuando ? ', el '+esc(fechaLarga(c.cuando)) : '')+'.' : '')+'</p>'+
    '<div class="msg" id="arc-cfg-msg"></div>';
  abrirHoja('Qué se ve en la web', 'Archivo de la obra', cuerpo, '<button type="button" class="bt" id="arc-cfg-si">Guardar</button>', {sinFoco:true});
  $('arc-cfg-si').onclick=function(){
    var b=this, m=$('arc-cfg-msg'), v={ escaneos:!!$('arc-cfg-esc').checked, fotos:!!$('arc-cfg-fot').checked,
      quien:String((TOK && TOK.correo)||'').slice(0,80), cuando:new Date().toISOString() };
    b.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
    estadoEscribirP(ARC_CLAVE, v).then(function(){
      ARC.cfg={ escaneos:v.escaneos, fotos:v.fotos, quien:v.quien, cuando:v.cuando }; ARC.cfgLeida=true; ARC.cfgDe=(YO.obra||{}).id;
      cerrarHoja(); toast('Listo: así se ve el archivo de la obra en la web');
      ARC.sel=[]; arcPintar(); try{ _dcPintarCola(); }catch(_c){}
    }, function(e){
      b.disabled=false; m.className='msg mal';
      m.textContent=(e===401 || e===403) ? 'Solo quien registró la empresa o su colíder puede cambiar esto.' : 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.';
    });
  };
}

/* ── las carpetas de la izquierda: solo las que tienen algo, en el orden de la app ───────────────────── */
function _arcOrdenGrupo(I){
  if(I.k==='esc') return 0;
  if(I.k==='foto') return 1;
  if(I.k==='doc'){ var i=0; for(;i<DC_CARPETAS.length;i++) if(_dcGrupo(DC_CARPETAS[i])===I.g) break; return 10+i; }
  return I.k==='propio' ? 900 : 950;
}
function _arcOrdenItem(I){
  if(I.k==='esc'){ for(var i=0;i<ARC_CLASES.length;i++) if('esc:'+ARC_CLASES[i][0]===I.key) return i; return 99; }
  if(I.k==='doc'){ for(var j=0;j<DC_CARPETAS.length;j++) if(DC_CARPETAS[j].h===I.key) return j; return 999; }
  return 0;
}
function _arcArbol(vis){
  var G={}, L=[], existe={};
  vis.forEach(function(f){
    var I=arcInfo(f);
    if(!G[I.g]){ G[I.g]={ g:I.g, o:_arcOrdenGrupo(I), items:[], por:{}, n:0 }; L.push(G[I.g]); existe['g:'+I.g]=1; }
    var g=G[I.g]; g.n++;
    if(!g.por[I.key]){ g.por[I.key]={ key:I.key, t:I.t, n:0, o:_arcOrdenItem(I) }; g.items.push(g.por[I.key]); existe[I.key]=1; }
    g.por[I.key].n++;
  });
  /* 09/10/2026 · «Escaneos de la app» (y «Fotos de obra», si el líder las deja ver) salen aunque todavía no tengan nada:
     así se sabe dónde caen y, al abrirlas, cómo se llenan */
  if(ARC.cfg.escaneos && !G['Escaneos de la app']){ G['Escaneos de la app']={ g:'Escaneos de la app', o:0, items:[], por:{}, n:0, vacia:true }; L.push(G['Escaneos de la app']); existe['g:Escaneos de la app']=1; }
  if(ARC.cfg.fotos && !G['Fotos de obra']){ G['Fotos de obra']={ g:'Fotos de obra', o:1, items:[{ key:'fotos', t:'Fotos de obra', n:0, o:0 }], por:{}, n:0, vacia:true }; L.push(G['Fotos de obra']); existe['fotos']=1; existe['g:Fotos de obra']=1; }
  L.sort(function(a, b){ return a.o-b.o || a.g.localeCompare(b.g, 'es'); });
  L.forEach(function(g){ g.items.sort(function(a, b){ return a.o-b.o || String(a.t).localeCompare(String(b.t), 'es', {sensitivity:'base'}); }); });
  return { grupos:L, existe:existe };
}
/* ¿es de la app (escaneo o foto de obra)? En la pestaña «Escaneos y fotos» (DC.modo 'esc') solo sale eso */
function _arcDeLaApp(f){ var k=arcInfo(f).k; return k==='esc' || k==='foto'; }
function _arcModoEsc(){ return typeof DC!=='undefined' && DC && DC.modo==='esc'; }
/* lo que se ve en la web, siempre a la vista: el líder lo cambia aquí mismo; los demás ven quién lo decide */
function _arcFranjaWeb(){
  var c=ARC.cfg, j=_arcJefe();
  return '<div class="arc-web" id="arc-web"><span class="arc-web-t">En la web se ven:</span>'+
    '<span class="arc-chip '+(c.escaneos ? 'si' : 'no')+'">'+(c.escaneos ? '✓' : '✕')+' Escaneos de la app</span>'+
    '<span class="arc-chip '+(c.fotos ? 'si' : 'no')+'">'+(c.fotos ? '✓' : '✕')+' Fotos de obra</span>'+
    (j ? '<button type="button" class="bt sec chico" id="arc-web-b">Cambiar</button>' : '<span class="arc-web-q">Lo decide el líder de la obra</span>')+'</div>';
}
function _arcDeCarpeta(f){ var I=arcInfo(f); return ARC.carpeta==='*' || I.key===ARC.carpeta || ('g:'+I.g)===ARC.carpeta; }
function _arcCalza(f){
  var q=_dcNorm(ARC.buscar); if(!q) return true;
  var I=arcInfo(f), t=_dcNorm([f.nombre, I.t, I.det, I.g, ARC_TIPO_ET[I.tipo], _arcNotaCorta(f)].join(' '));
  return q.split(' ').every(function(p){ return t.indexOf(p)>-1; });
}
function _arcClaveFecha(f){ return arcInfo(f).fecha+'|'+String(f.creado||''); }
function _arcOrdenar(L){
  var o=ARC.orden, nom=function(a, b){ return String(a.nombre||'').localeCompare(String(b.nombre||''), 'es', {sensitivity:'base', numeric:true}); };
  L.sort(function(a, b){
    if(o==='nombre') return nom(a, b);
    if(o==='carpeta') return arcInfo(a).t.localeCompare(arcInfo(b).t, 'es', {sensitivity:'base'}) || nom(a, b);
    var x=_arcClaveFecha(a), y=_arcClaveFecha(b);
    return o==='viejo' ? (x<y ? -1 : x>y ? 1 : 0) : (x<y ? 1 : x>y ? -1 : 0);
  });
  return L;
}
function _arcNombreCarpeta(k, A){
  if(k==='*') return _arcModoEsc() ? 'Todos los escaneos y fotos' : 'Todo el archivo';
  if(k.indexOf('g:')===0) return k.slice(2);
  var t=k; A.grupos.forEach(function(g){ g.items.forEach(function(it){ if(it.key===k) t=it.t; }); }); return t;
}

/* ── la vista ─────────────────────────────────────────────────────────────────────────────────────────── */
function arcPintar(){
  var t=$('t-docs'); if(!t) return;
  _arcCss();
  /* lo que llega por detrás (otro celular que sube algo) repinta: el menú abierto sigue si su fila sigue, y quien
     escribía en «Buscar» no pierde el cursor */
  if(ARC.menu && !arcFila(ARC.menu.id)) _arcMenuCerrar();
  var ae=document.activeElement, busca=(ae && ae.id==='arc-buscar') ? [ae.selectionStart, ae.selectionEnd] : null;
  var mEsc=_arcModoEsc(), todas=(DC.filas||[]).filter(function(f){ return !mEsc || _arcDeLaApp(f); }), vis=todas.filter(arcVisible), ocE=0, ocF=0;
  todas.forEach(function(f){ if(arcVisible(f)) return; if(arcInfo(f).k==='esc') ocE++; else ocF++; });
  var A=_arcArbol(vis); ARC._A=A;
  if(ARC.carpeta!=='*' && !A.existe[ARC.carpeta]) ARC.carpeta='*';
  var ids={}; vis.forEach(function(f){ ids[String(f.id)]=1; });
  ARC.sel=ARC.sel.filter(function(id){ return ids[id]; });
  var nE=vis.filter(function(f){ return arcInfo(f).k==='esc'; }).length, nF=vis.filter(function(f){ return arcInfo(f).k==='foto'; }).length;
  var sub=vis.length+' '+(vis.length===1 ? 'archivo' : 'archivos')+(nE ? ' · '+nE+' '+(nE===1?'escaneo':'escaneos') : '')+(nF ? ' · '+nF+' '+(nF===1?'foto':'fotos')+' de obra' : '');
  var h='<div class="arc-cab"><div><h2>'+(mEsc ? 'Escaneos y fotos de la app' : 'Archivo de la obra')+'</h2><p class="sub" id="arc-cuantos">'+esc(sub)+'</p></div>'+
        '<div class="arc-cab-acc"><button type="button" class="bt chico" id="arc-unir" title="Une PDF y fotos en un solo PDF, en el orden que elijas">⧉ Unir en un PDF</button>'+
        (_arcJefe() ? '<button type="button" class="bt sec chico" id="arc-cfg">⚙ Qué se ve en la web</button>' : '')+'</div></div>';
  h+=_arcFranjaWeb();
  if(_arcJefe() && (ocE || ocF)){
    var q=[]; if(ocE) q.push(ocE+' '+(ocE===1?'escaneo':'escaneos')); if(ocF) q.push(ocF+' '+(ocF===1?'foto':'fotos')+' de obra');
    var n1=(ocE+ocF===1), fem=!ocE;
    h+='<div class="aviso ojo arc-oculto" id="arc-oculto"><span><b>'+esc(q.join(' y '))+'</b> '+(fem ? (n1?'guardada':'guardadas') : (n1?'guardado':'guardados'))+
       ' desde la app no se '+(n1?'muestra':'muestran')+' en la web: así lo dejaste. En la app '+(n1?'sigue':'siguen')+' en su carpeta.</span>'+
       '<button type="button" class="bt sec chico" id="arc-oculto-b">Cambiar</button></div>';
  }
  /* las carpetas: a la izquierda en la computadora, un menú en el celular */
  var tTodo=mEsc ? 'Todos los escaneos y fotos' : 'Todo el archivo';
  var arbol='<button type="button" class="arc-c g-todo'+(ARC.carpeta==='*'?' on':'')+'" data-k="*"><span>'+tTodo+'</span><small>'+vis.length+'</small></button>';
  var menu='<option value="*">'+tTodo+' ('+vis.length+')</option>';
  A.grupos.forEach(function(g){
    var solo=(g.items.length===1 && g.items[0].t===g.g);
    if(solo){
      var it0=g.items[0];
      arbol+='<button type="button" class="arc-c arc-solo'+(ARC.carpeta===it0.key?' on':'')+'" data-k="'+esc(it0.key)+'"><span>'+esc(it0.t)+'</span><small>'+it0.n+'</small></button>';
      menu+='<option value="'+esc(it0.key)+'"'+(ARC.carpeta===it0.key?' selected':'')+'>'+esc(it0.t)+' ('+it0.n+')</option>';
      return;
    }
    arbol+='<button type="button" class="arc-c arc-g'+(ARC.carpeta==='g:'+g.g?' on':'')+(g.vacia?' vacia':'')+'" data-k="g:'+esc(g.g)+'" title="Todo lo de «'+esc(g.g)+'»"><span>'+esc(g.g)+'</span><small>'+g.n+'</small></button>';
    menu+='<optgroup label="'+esc(g.g)+'"><option value="g:'+esc(g.g)+'"'+(ARC.carpeta==='g:'+g.g?' selected':'')+'>Todo · '+esc(g.g)+' ('+g.n+')</option>';
    g.items.forEach(function(it){
      arbol+='<button type="button" class="arc-c'+(ARC.carpeta===it.key?' on':'')+'" data-k="'+esc(it.key)+'"><span>'+esc(it.t)+'</span><small>'+it.n+'</small></button>';
      menu+='<option value="'+esc(it.key)+'"'+(ARC.carpeta===it.key?' selected':'')+'>'+esc(it.t)+' ('+it.n+')</option>';
    });
    menu+='</optgroup>';
  });
  h+='<div class="arc-cuerpo"><nav class="arc-arbol" id="arc-arbol" aria-label="Carpetas">'+arbol+'</nav>'+
     '<div class="arc-lista"><div class="arc-m"><label for="arc-carpeta-m">Carpeta</label><select id="arc-carpeta-m">'+menu+'</select></div>'+
       '<div class="arc-barra"><label class="arc-todos" for="arc-todos"><input type="checkbox" id="arc-todos"> Todos</label>'+
         '<input type="search" id="arc-buscar" placeholder="Buscar por nombre o carpeta" aria-label="Buscar en el archivo" value="'+esc(ARC.buscar)+'">'+
         '<select id="arc-orden" aria-label="Ordenar">'+[['nuevo','Más nuevos primero'], ['viejo','Más antiguos primero'], ['nombre','Por nombre (A-Z)'], ['carpeta','Por carpeta']].map(function(o){
           return '<option value="'+o[0]+'"'+(ARC.orden===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select></div>'+
       '<div id="arc-sel"></div><div id="arc-filas"></div><div class="arc-pie" id="arc-pie" hidden></div></div></div>';
  t.innerHTML=h;
  if($('arc-cfg')) $('arc-cfg').onclick=arcCfgAbrir;
  if($('arc-oculto-b')) $('arc-oculto-b').onclick=arcCfgAbrir;
  if($('arc-web-b')) $('arc-web-b').onclick=arcCfgAbrir;
  /* «Unir» con lo marcado (PDF y fotos); sin nada marcado, se eligen dentro */
  $('arc-unir').onclick=function(){
    var ids=ARC.sel.filter(function(id){ var f=arcFila(id); return f && _arcSeUne(f); });
    arcUnirAbrir(ids, { elegir:!ids.length });
  };
  Array.prototype.forEach.call(t.querySelectorAll('#arc-arbol [data-k]'), function(b){
    b.onclick=function(){ var k=b.getAttribute('data-k'); ARC.carpeta=k; arcPintar(); try{ $('arc-arbol').querySelector('[data-k="'+k.replace(/"/g, '\\"')+'"]').focus(); }catch(_f){} };
  });
  $('arc-carpeta-m').onchange=function(){ ARC.carpeta=this.value; arcPintar(); };
  var tB=null;
  $('arc-buscar').oninput=function(){ var v=this.value; if(tB) clearTimeout(tB); tB=setTimeout(function(){ ARC.buscar=v; _arcPintarLista(); }, 140); };
  $('arc-orden').onchange=function(){ ARC.orden=this.value; _arcPintarLista(); };
  $('arc-todos').onchange=function(){
    var on=this.checked;
    if(on) ARC.vista.forEach(function(id){ if(ARC.sel.indexOf(id)<0) ARC.sel.push(id); });
    else ARC.sel=ARC.sel.filter(function(id){ return ARC.vista.indexOf(id)<0; });
    _arcPintarLista();
  };
  var F=$('arc-filas');
  F.addEventListener('click', function(ev){
    var b=ev.target.closest ? ev.target.closest('[data-acc]') : null; if(!b) return;
    var li=b.closest('[data-id]'); if(!li) return;
    var id=li.getAttribute('data-id'), acc=b.getAttribute('data-acc');
    if(acc==='ver') arcVer(id); else if(acc==='menu') _arcMenuAbrir(b, id);
  });
  F.addEventListener('change', function(ev){
    var c=ev.target; if(!c || !c.classList || !c.classList.contains('arc-ck')) return;
    var id=c.getAttribute('data-ck'), i=ARC.sel.indexOf(id);
    if(c.checked && i<0) ARC.sel.push(id); if(!c.checked && i>-1) ARC.sel.splice(i, 1);
    var li=c.closest('[data-id]'); if(li) li.classList.toggle('sel', c.checked);
    _arcPintarSel(); _arcPintarTodos();
  });
  _arcPintarLista();
  if(busca){ var bi=$('arc-buscar'); try{ bi.focus(); bi.setSelectionRange(busca[0], busca[1]); }catch(_b){} }
}
function _arcLista(){
  var mEsc=_arcModoEsc(), vis=(DC.filas||[]).filter(function(f){ return !mEsc || _arcDeLaApp(f); }).filter(arcVisible).filter(_arcDeCarpeta), L=vis.filter(_arcCalza);
  return { total:vis.length, filas:_arcOrdenar(L) };
}
function _arcPintarLista(){
  var F=$('arc-filas'); if(!F) return;
  var R=_arcLista(), L=R.filas;
  ARC.vista=L.map(function(f){ return String(f.id); });
  if(!L.length){
    var mEsc=_arcModoEsc(), nada=!(DC.filas||[]).some(function(f){ return (!mEsc || _arcDeLaApp(f)) && arcVisible(f); });
    var enEsc=(ARC.carpeta==='g:Escaneos de la app' || String(ARC.carpeta).indexOf('esc:')===0), enFot=(ARC.carpeta==='fotos' || ARC.carpeta==='g:Fotos de obra');
    var x;
    if(ARC.buscar) x='<b>Nada con «'+esc(ARC.buscar)+'»</b>Prueba con otra palabra, o busca en todo el archivo.';
    else if(mEsc && !ARC.cfg.escaneos && !ARC.cfg.fotos) x='<b>Los escaneos y las fotos de la app no se muestran en la web</b>'+(_arcJefe() ? 'Así lo dejaste. En la app siguen en su carpeta.' : 'Así lo decidió el líder de la obra. En la app siguen en su carpeta.')+
      (_arcJefe() ? '<div class="acc"><button type="button" class="bt chico" data-vacio="cfg">Mostrarlos aquí</button></div>' : '');
    else if(enEsc || (mEsc && nada)) x='<b>Todavía no hay escaneos'+(enEsc && ARC.carpeta!=='g:Escaneos de la app' ? ' de este tipo' : '')+'</b>'+
      'Se hacen en la app: <b>Escanear</b> → la hoja firmada (charla, ATS, permiso, inducción…) se guarda en su tipo y sale aquí sola. '+
      'También puedes subir aquí arriba los que escaneaste en la computadora.';
    else if(enFot) x='<b>Todavía no hay fotos de obra</b>Se toman en la app, con la cámara con sello: fecha, hora y ubicación. Al guardarlas «en la obra», salen aquí.';
    else x=nada ? '<b>Todavía no hay documentos</b>Arrástralos aquí arriba, o súbelos desde la app en su carpeta: salen en los dos lados.' : '<b>Nada en esta carpeta</b>';
    F.innerHTML='<div class="arc-vacio">'+x+'</div>';
    var bv=F.querySelector('[data-vacio="cfg"]'); if(bv) bv.onclick=arcCfgAbrir;
  } else {
    F.innerHTML='<ul class="arc-ul" aria-label="Archivos">'+L.map(function(f){
      var id=String(f.id), s=ARC.sel.indexOf(id)>-1, n=f.nombre||'Documento';
      return '<li class="arc-f'+(s?' sel':'')+'" data-id="'+esc(id)+'">'+
        '<input type="checkbox" class="arc-ck" data-ck="'+esc(id)+'"'+(s?' checked':'')+' aria-label="Elegir «'+esc(n)+'»">'+
        '<button type="button" class="arc-mini" data-acc="ver" tabindex="-1" aria-hidden="true">'+_arcIcono(f)+'</button>'+
        '<div class="arc-nom"><button type="button" class="arc-tit" data-acc="ver" title="'+esc(n)+'">'+esc(n)+'</button><small>'+esc(_arcSub(f))+'</small></div>'+
        '<div class="arc-acc"><button type="button" class="bt sec chico" data-acc="ver">Ver</button>'+
          '<button type="button" class="arc-mas" data-acc="menu" aria-haspopup="menu" aria-label="Más acciones para «'+esc(n)+'»">⋯</button></div></li>';
    }).join('')+'</ul>';
  }
  var pie=$('arc-pie');
  if(pie){ var filtra=(ARC.buscar && R.total!==L.length); pie.hidden=!filtra; pie.textContent=filtra ? 'Se ven '+L.length+' de '+R.total+' en «'+_arcNombreCarpeta(ARC.carpeta, ARC._A||{grupos:[]})+'».' : ''; }
  _arcPintarSel(); _arcPintarTodos();
}
function _arcPintarTodos(){
  var c=$('arc-todos'); if(!c) return;
  var n=ARC.vista.filter(function(id){ return ARC.sel.indexOf(id)>-1; }).length;
  c.checked=(n>0 && n===ARC.vista.length); c.indeterminate=(n>0 && n<ARC.vista.length); c.disabled=!ARC.vista.length;
}
function _arcElegidas(){ return ARC.sel.map(arcFila).filter(Boolean); }
function _arcPintarSel(){
  var c=$('arc-sel'); if(!c) return;
  var L=_arcElegidas();
  if(!L.length){ c.className=''; c.innerHTML=''; return; }
  var ed=L.filter(function(f){ return arcInfo(f).editable; }).length, un=L.filter(_arcSeUne).length, baja=L.filter(function(f){ return !!f.url && arcInfo(f).tipo!=='enlace'; }).length;
  c.className='arc-sel';
  /* debajo de la barra de arriba del portal (que también se queda fija) */
  var barra=document.querySelector('#portal .barra'); c.style.top=(barra ? Math.round(barra.getBoundingClientRect().height) : 0)+'px';
  c.innerHTML='<b>'+L.length+' '+(L.length===1 ? 'elegido' : 'elegidos')+'</b>'+
    '<button type="button" class="bt sec chico" id="arc-s-unir"'+(un?'':' disabled')+' title="'+(un ? 'Une los PDF y las fotos elegidos en un solo PDF' : 'Elige PDF o fotos')+'">Unir en un PDF</button>'+
    '<button type="button" class="bt sec chico" id="arc-s-mover"'+(ed?'':' disabled')+'>Mover a…</button>'+
    '<button type="button" class="bt sec chico" id="arc-s-bajar"'+(baja?'':' disabled')+'>Descargar</button>'+
    '<button type="button" class="bt sec chico mal" id="arc-s-quitar"'+(ed?'':' disabled')+'>Quitar</button>'+
    '<button type="button" class="bt sec chico" id="arc-s-no" aria-label="Quitar la selección">✕</button>';
  $('arc-s-unir').onclick=function(){ arcUnirAbrir(ARC.sel.slice()); };
  $('arc-s-mover').onclick=function(){ arcMover(ARC.sel.slice()); };
  $('arc-s-bajar').onclick=function(){ arcBajar(ARC.sel.slice(), this); };
  $('arc-s-quitar').onclick=function(){ arcQuitar(ARC.sel.slice()); };
  $('arc-s-no').onclick=function(){ ARC.sel=[]; _arcPintarLista(); };
}

/* ── el menú «⋯» de cada fila ─────────────────────────────────────────────────────────────────────────── */
function _arcMenuCerrar(){
  var m=$('arc-menu'); if(m) m.remove();
  if(ARC.menu){ document.removeEventListener('mousedown', ARC.menu.fuera, true); document.removeEventListener('keydown', ARC.menu.tecla, true);
    window.removeEventListener('resize', ARC.menu.cierra); window.removeEventListener('scroll', ARC.menu.cierra, true);
    var b=ARC.menu.boton; ARC.menu=null; return b; }
  return null;
}
function _arcMenuAbrir(boton, id){
  var yaEra=(ARC.menu && ARC.menu.id===id); _arcMenuCerrar(); if(yaEra) return;
  var f=arcFila(id); if(!f) return; var I=arcInfo(f);
  var it=[];
  it.push(['ver', 'Ver']);
  if(I.editable){ it.push(['nombre', 'Cambiar el nombre']); it.push(['mover', 'Mover a otra carpeta']); }
  if(f.url) it.push(I.tipo==='enlace' ? ['abrir', 'Abrir el enlace ↗'] : ['bajar', 'Descargar']);
  if(_arcSeUne(f)) it.push(['unir', 'Unir en un PDF…']);
  if(I.editable){ it.push(['-']); it.push(['quitar', 'Quitar', 'mal']); }
  var m=document.createElement('div'); m.className='arc-menu'; m.id='arc-menu'; m.setAttribute('role', 'menu');
  m.innerHTML=it.map(function(x){ return x[0]==='-' ? '<hr>' : '<button type="button" role="menuitem" data-m="'+x[0]+'"'+(x[2]?' class="'+x[2]+'"':'')+'>'+esc(x[1])+'</button>'; }).join('');
  document.body.appendChild(m);
  var w=m.offsetWidth, hh=m.offsetHeight;
  var ubica=function(r){
    var x=Math.max(8, Math.min(r.right-w, window.innerWidth-w-8)), y=r.bottom+6;
    if(y+hh>window.innerHeight-8) y=Math.max(8, r.top-hh-6);
    m.style.left=x+'px'; m.style.top=y+'px';
  };
  ubica(boton.getBoundingClientRect());
  /* al desplazar la página (el desplazamiento suave también), el menú sigue a su botón; se cierra si el botón sale de
     la pantalla, si ya no está, o si cambia el tamaño de la ventana */
  var cierra=function(ev){
    if(ev && ev.type==='scroll' && boton.isConnected){
      var q=boton.getBoundingClientRect();
      if(q.bottom>0 && q.top<window.innerHeight){ ubica(q); return; }
    }
    _arcMenuCerrar();
  };
  ARC.menu={ id:id, boton:boton, cierra:cierra,
    fuera:function(ev){ if(!m.contains(ev.target) && ev.target!==boton) _arcMenuCerrar(); },
    tecla:function(ev){
      if(ev.key==='Escape'){ ev.preventDefault(); ev.stopPropagation(); var b=_arcMenuCerrar(); try{ if(b) b.focus(); }catch(_e){} return; }
      if(ev.key==='ArrowDown' || ev.key==='ArrowUp'){
        ev.preventDefault(); var bs=[].slice.call(m.querySelectorAll('button')), i=bs.indexOf(document.activeElement);
        i = ev.key==='ArrowDown' ? (i+1)%bs.length : (i<=0 ? bs.length-1 : i-1); bs[i].focus();
      }
    } };
  document.addEventListener('mousedown', ARC.menu.fuera, true); document.addEventListener('keydown', ARC.menu.tecla, true);
  window.addEventListener('resize', cierra); window.addEventListener('scroll', cierra, true);
  m.addEventListener('click', function(ev){
    var b=ev.target.closest ? ev.target.closest('[data-m]') : null; if(!b) return;
    var q=b.getAttribute('data-m'); _arcMenuCerrar();
    if(q==='ver') arcVer(id); else if(q==='nombre') arcRenombrar(id); else if(q==='mover') arcMover([id]);
    else if(q==='bajar') arcBajar([id]); else if(q==='abrir') window.open(f.url, '_blank', 'noopener');
    else if(q==='unir') arcUnirAbrir([id]); else if(q==='quitar') arcQuitar([id]);
  });
  try{ m.querySelector('button').focus(); }catch(_f){}
}

/* ── ver uno: el PDF página por página, la foto entera; ‹ › para pasar al de al lado ──────────────────── */
function arcVer(id){
  var f=arcFila(id); if(!f) return;
  var I=arcInfo(f), u=String(f.url||''), sid=String(f.id), i=ARC.vista.indexOf(sid);
  ARC.abierto=sid;
  var cuerpo='';
  if(I.tipo==='pdf' && u) cuerpo+='<div class="pdfv" id="arc-ver-pdf" aria-label="Vista previa del PDF"></div>';
  else if(I.tipo==='img' && u) cuerpo+='<div class="arc-ver-img"><img src="'+esc(u)+'" alt="'+esc(f.nombre||'Foto')+'"></div>';
  else cuerpo+='<div class="arc-ver-otro"><span class="arc-tipo '+I.tipo+'">'+(I.tipo==='enlace' ? '🔗' : ARC_TIPO_SIG[I.tipo])+'</span><span>'+
    (I.tipo==='enlace' ? 'Es un enlace: se abre en su sitio (Drive, YouTube…).' : (I.tipo==='nada' ? 'Este registro no tiene archivo.' :
     'La vista previa no está disponible para '+(I.tipo==='otro' ? 'este tipo de archivo' : 'un '+ARC_TIPO_ET[I.tipo])+': descárgalo para abrirlo.'))+'</span>'+
    (u ? (I.tipo==='enlace' ? '<a class="bt sec chico" href="'+esc(u)+'" target="_blank" rel="noopener">Abrir el enlace ↗</a>' : '<button type="button" class="bt sec chico" id="arc-ver-bajar2">Descargar</button>') : '')+'</div>';
  var dl=[['Carpeta', (I.g!==I.t ? I.g+' › ' : '')+I.t+(I.det ? ' · '+I.det : '')]];
  if(I.fecha) dl.push([I.k==='esc' ? 'Fecha de la hoja' : 'Fecha', fechaLarga(I.fecha)]);
  dl.push(['Tipo', ARC_TIPO_ET[I.tipo]+(I.k==='esc' && I.esc.pdf && I.esc.pags ? ' de '+I.esc.pags+' página'+(I.esc.pags===1?'':'s') : '')]);
  if(f.creado) dl.push(['Subido', fechaLarga(f.creado)+' · '+hace(f.creado)]);
  if(I.k!=='esc' && f.nota && String(f.nota).length<300 && !/^\s*[\[{]/.test(String(f.nota))) dl.push(['Nota', String(f.nota)]);
  cuerpo+='<dl class="arc-dl">'+dl.map(function(x){ return '<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>'; }).join('')+'</dl>';
  var pie='<div class="arc-nav"><button type="button" class="bt sec chico" id="arc-ver-ant"'+(i>0?'':' disabled')+' aria-label="El anterior">‹</button>'+
          '<button type="button" class="bt sec chico" id="arc-ver-sig"'+(i>-1 && i<ARC.vista.length-1?'':' disabled')+' aria-label="El siguiente">›</button></div>'+
    (I.editable ? '<button type="button" class="bt sec chico" id="arc-ver-nom">Cambiar el nombre</button><button type="button" class="bt sec chico" id="arc-ver-mov">Mover</button>' : '')+
    (u && I.tipo!=='enlace' ? '<button type="button" class="bt sec chico" id="arc-ver-bajar">Descargar</button>' : '')+
    (I.editable ? '<button type="button" class="bt sec chico" id="arc-ver-quitar" style="color:var(--mal)">Quitar</button>' : '');
  abrirHoja(f.nombre||'Documento', _arcSub(f)+(i>-1 ? ' · '+(i+1)+' de '+ARC.vista.length : ''), cuerpo, pie, {clase:'pdf', sinFoco:true});
  var ir=function(d){ var j=ARC.vista.indexOf(sid)+d; if(j>=0 && j<ARC.vista.length) arcVer(ARC.vista[j]); };
  $('arc-ver-ant').onclick=function(){ ir(-1); }; $('arc-ver-sig').onclick=function(){ ir(1); };
  if($('arc-ver-nom')) $('arc-ver-nom').onclick=function(){ arcRenombrar(sid); };
  if($('arc-ver-mov')) $('arc-ver-mov').onclick=function(){ arcMover([sid]); };
  if($('arc-ver-bajar')) $('arc-ver-bajar').onclick=function(){ arcBajar([sid], this); };
  if($('arc-ver-bajar2')) $('arc-ver-bajar2').onclick=function(){ arcBajar([sid], this); };
  if($('arc-ver-quitar')) $('arc-ver-quitar').onclick=function(){ arcQuitar([sid]); };
  if($('arc-ver-pdf')) pdfVistaP($('arc-ver-pdf'), u);
  if(!ARC._tecla){ ARC._tecla=true; document.addEventListener('keydown', _arcVerTecla); }
  setTimeout(function(){ try{ var x=$('hoja-x'); if(x) x.focus(); }catch(_f){} }, 30);
}
function _arcVerTecla(ev){
  if((ev.key!=='ArrowLeft' && ev.key!=='ArrowRight') || !HOJA.abierta || !ARC.abierto || !$('arc-ver-ant') || !$('dialogo-fondo').hidden) return;
  var a=document.activeElement; if(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
  var b=$(ev.key==='ArrowLeft' ? 'arc-ver-ant' : 'arc-ver-sig'); if(b && !b.disabled){ ev.preventDefault(); b.click(); }
}
/* tras cambiar algo: la lista al día y, si estaba abierto, se vuelve a abrir con lo nuevo */
function _arcTrasCambio(reabrir){
  arcPintar();
  if(reabrir && HOJA.abierta && ARC.abierto===String(reabrir) && arcFila(reabrir)) arcVer(reabrir);
}

/* ── cambiar el nombre ────────────────────────────────────────────────────────────────────────────────── */
function arcRenombrar(id){
  var f=arcFila(id); if(!f || !arcInfo(f).editable) return;
  preguntar('Cambiar el nombre', 'Con este nombre lo ve todo el equipo, aquí y en la app.',
    {valor:f.nombre||'', maximo:120, minimo:3, corto:'El nombre necesita al menos 3 letras.', etiqueta:'Nombre'}).then(function(v){
    if(v==null) return;
    v=String(v).replace(/\s+/g, ' ').trim().slice(0, 120);
    if(!v || v===f.nombre) return;
    sbPatch('sst_doc?id=eq.'+_enc(f.id), {nombre:v}).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject('sin_fila');
      f.nombre=v; delete f._arc;
      toast('Nombre cambiado: así sale también en la app');
      _arcTrasCambio(f.id);
    }).catch(function(e){ toast(e==='sin_fila' ? 'No se pudo: esta cuenta no puede cambiarlo, o ya no está.' : 'No se pudo cambiar el nombre. Revisa tu conexión.'); });
  });
}

/* ── mover a otra carpeta (una o varias) ──────────────────────────────────────────────────────────────── */
/* el menú de carpetas de destino: los tipos de escaneo, «Fotos de obra» y las carpetas de siempre (las que el plan
   tiene). Lo que no se ve en la web (según el líder) no se ofrece: lo movido ahí desaparecería de aquí. */
function _arcSelDestino(id, val, op){
  op=op||{};
  var h='<select id="'+id+'" aria-label="Carpeta">'+(op.descargar ? '<option value="">Solo descargarlo (no se guarda en la obra)</option>' : '<option value="">— ¿a qué carpeta? —</option>');
  if(ARC.cfg.escaneos) h+='<optgroup label="Escaneos de la app">'+ARC_CLASES.map(function(c){
    return '<option value="esc:'+c[0]+'"'+(val==='esc:'+c[0]?' selected':'')+'>Escaneos · '+esc(c[1])+'</option>'; }).join('')+'</optgroup>';
  var grupos=[], por={};
  _dcCarpetas().forEach(function(c){ if(op.sinFotos && c.h==='fotos') return; var g=_dcGrupo(c); if(!por[g]){ por[g]=[]; grupos.push(g); } por[g].push(c); });
  h+=grupos.map(function(g){ return '<optgroup label="'+esc(g)+'">'+por[g].map(function(c){
    return '<option value="'+esc(c.h)+'"'+(c.h===val?' selected':'')+'>'+esc(c.t)+'</option>'; }).join('')+'</optgroup>'; }).join('');
  return h+'</select>';
}
/* la nota que lleva un escaneo cuando sale a una carpeta de documentos: legible en la app («Escaneo · Charla de 5 min · 02/10/2026») */
function _arcNotaHumana(f){
  var I=arcInfo(f), p=['Escaneo · '+I.t];
  if(I.esc && I.esc.fecha) p.push(fechaLarga(I.esc.fecha));
  if(I.esc && I.esc.firmas) p.push(I.esc.firmas+' firma'+(I.esc.firmas===1?'':'s'));
  return p.join(' · ');
}
/* qué le cambia a una fila ir a «dest»: {cambio}, {igual} o {salta: por qué no} */
function _arcMoverUna(f, dest, r){
  var I=arcInfo(f), tipo=I.tipo;
  if(dest.indexOf('esc:')===0){
    var k=dest.slice(4);
    if(I.k==='esc'){ if(I.esc.clase===k) return {igual:1}; var n={}; for(var q in I.esc) n[q]=I.esc[q]; n.clase=k; return {cambio:{nota:_arcNotaEscTexto(n)}}; }
    if(tipo!=='pdf' && tipo!=='img') return {salta:'a los escaneos van solo PDF y fotos'};
    var fe=_arcFechaOk(I.fecha) ? I.fecha : _arcDia(f.creado);
    return {cambio:{hoja:'asistencia', nota:_arcNotaEscTexto({fecha:fe, clase:k, firmas:0, pdf:tipo==='pdf', pags:0, mini:''})}};
  }
  if(dest==='fotos'){
    if(I.k==='foto') return {igual:1};
    if(tipo!=='img') return {salta:'a «Fotos de obra» van solo fotos'};
    return {cambio: I.k==='esc' ? {hoja:'fotos', nota:_arcNotaHumana(f)} : {hoja:'fotos'}};
  }
  if(String(f.hoja)===r.h) return {igual:1};
  return {cambio: I.k==='esc' ? {hoja:r.h, nota:_arcNotaHumana(f)} : {hoja:r.h}};
}
/* de a pocos a la vez: el servidor no recibe cien pedidos juntos */
function _arcDeAPocos(L, n, fn){
  var i=0, res=new Array(L.length);
  function uno(){ if(i>=L.length) return Promise.resolve(); var k=i++; return Promise.resolve().then(function(){ return fn(L[k], k); })
    .then(function(v){ res[k]={ok:true, v:v}; }, function(e){ res[k]={ok:false, e:e}; }).then(uno); }
  var w=[]; for(var j=0;j<Math.min(n, L.length);j++) w.push(uno());
  return Promise.all(w).then(function(){ return res; });
}
function arcMover(ids){
  var L=ids.map(arcFila).filter(function(f){ return f && arcInfo(f).editable; });
  if(!L.length){ toast('Eso no se puede mover desde aquí.'); return; }
  var st=_dcEstado(''), uno=(L.length===1);
  var cuerpo=(uno ? '<p class="ayuda" style="margin:0 0 12px">Ahora está en «'+esc(arcInfo(L[0]).t)+'». Se mueve aquí y en la app de todo el equipo.</p>'
                  : '<p class="ayuda" style="margin:0 0 12px">'+L.length+' archivos. Se mueven aquí y en la app de todo el equipo.</p>')+
    '<div class="campo"><label for="arcmv-c">Carpeta</label>'+_arcSelDestino('arcmv-c', '')+'</div>'+
    '<div class="dc-extra campo" id="arcmv-ex" hidden></div>'+
    '<p class="arc-mv-nota">A los escaneos van PDF y fotos; a «Fotos de obra», solo fotos.</p>'+
    '<div class="msg" id="arcmv-msg"></div>';
  abrirHoja(uno ? 'Mover «'+(L[0].nombre||'documento')+'»' : 'Mover '+L.length+' archivos', 'A otra carpeta', cuerpo, '<button type="button" class="bt" id="arcmv-si">Mover</button>', {sinFoco:true});
  var go=function(){ _dcCablear('arcmv', st, function(){ var m=$('arcmv-msg'); if(m){ m.className='msg'; m.textContent=''; } }); };
  if(DC.subc) go(); else dcSubcTraer().then(go, go);
  setTimeout(function(){ try{ $('arcmv-c').focus(); }catch(_f){} }, 30);
  $('arcmv-si').onclick=function(){
    var b=this, m=$('arcmv-msg'), dest=String(st.h||''), r={h:''};
    if(!dest){ m.className='msg mal'; m.textContent='Elige la carpeta.'; return; }
    if(dest.indexOf('esc:')!==0 && dest!=='fotos'){ r=_dcHoja(st); if(r.err){ m.className='msg mal'; m.textContent=r.err; return; } }
    var plan=L.map(function(f){ return {f:f, x:_arcMoverUna(f, dest, r)}; });
    var van=plan.filter(function(p){ return p.x.cambio; }), saltan=plan.filter(function(p){ return p.x.salta; });
    var etq=dest.indexOf('esc:')===0 ? 'Escaneos · '+_arcClaseEt(dest.slice(4)) : (dest==='fotos' ? 'Fotos de obra' : dcCarpetaDe(r.h).t);
    if(!van.length){ m.className='msg mal'; m.textContent=saltan.length ? 'No se movió nada: '+saltan[0].x.salta+'.' : 'Ya '+(uno?'está':'están')+' en «'+etq+'».'; return; }
    b.disabled=true; m.className='msg gris'; m.textContent='Moviendo…';
    var movidos={};
    _arcDeAPocos(van, 4, function(p){
      return sbPatch('sst_doc?id=eq.'+_enc(p.f.id), p.x.cambio).then(function(rows){
        if(Array.isArray(rows) && !rows.length) return Promise.reject('sin_fila');
        for(var k in p.x.cambio) p.f[k]=p.x.cambio[k]; delete p.f._arc;
        movidos[String(p.f.id)]=1;
      });
    }).then(function(res){
      var ok=res.filter(function(x){ return x.ok; }).length, mal=res.length-ok;
      /* lo que se movió deja de estar elegido (ya no está donde se lo eligió) */
      ARC.sel=ARC.sel.filter(function(id){ return !movidos[id]; });
      return (ok && r.nuevo ? dcSubcAgregar([r.nuevo]).catch(function(){ return false; }) : Promise.resolve()).then(function(){
        if(ok) toast(ok===1 ? 'Movido a «'+etq+'»' : ok+' archivos movidos a «'+etq+'»');
        var q=[];
        if(saltan.length) q.push(saltan.length+' no '+(saltan.length===1?'va':'van')+' ahí ('+saltan[0].x.salta+')');
        if(mal) q.push(mal+' no se '+(mal===1?'pudo':'pudieron')+' mover: revisa tu conexión o tu permiso en esta obra');
        if(q.length){ b.disabled=false; b.textContent='Cerrar'; b.onclick=cerrarHoja; m.className='msg mal'; m.textContent=(ok ? 'Se movieron '+ok+'. ' : '')+q.join('. ')+'.'; }
        else cerrarHoja();
        if(ok){ arcPintar(); if(VISTA.recargar) VISTA.recargar(true); }
      });
    });
  };
}

/* ── quitar (uno o varios): de la carpeta, aquí y en la app ───────────────────────────────────────────── */
/* 09/10/2026 · y el archivo, del balde: antes se borraba solo la fila y el archivo se quedaba, contando en el espacio del
   plan sin que nadie lo viera. La ruta dentro del balde sale de su dirección pública; solo se borra lo que está en la
   carpeta de ESTA obra (el servidor también lo frena: sst_arch_borra) y que ninguna otra fila usa (la miniatura de un
   escaneo en PDF va con él). */
function _arcRuta(u){
  var m=String(u||'').match(/\/storage\/v1\/object\/public\/msds\/([^?#]+)/); if(!m) return '';
  var r=m[1]; try{ r=decodeURIComponent(r); }catch(_d){}
  return r;
}
function _arcRutasDe(f){
  var l=[f.url]; if(f.hoja==='asistencia'){ var n=arcNotaEsc(f); if(n.mini) l.push(n.mini); }
  return l.map(_arcRuta).filter(Boolean);
}
function _arcLiberar(filas){
  var oid=String((YO.obra||{}).id||''), ids={}, rutas={};
  if(!oid) return Promise.resolve({ n:0, pedidos:0 });
  filas.forEach(function(f){ ids[String(f.id)]=1; _arcRutasDe(f).forEach(function(r){ if(r.indexOf(oid+'/')===0) rutas[r]=1; }); });
  /* lo que otra fila de la obra sigue usando, no se toca */
  (DC.filas||[]).forEach(function(f){ if(!ids[String(f.id)]) _arcRutasDe(f).forEach(function(r){ delete rutas[r]; }); });
  var L=Object.keys(rutas);
  if(!L.length) return Promise.resolve({ n:0, pedidos:0 });
  var urls=filas.map(function(f){ return String(f.url||''); }).filter(function(u){ return /^https?:\/\//.test(u) && u.indexOf(',')<0 && u.indexOf('"')<0; });
  /* y por las dudas, en el servidor (una fila que esta lista no trae: otra hoja con el mismo archivo) */
  var otra=urls.length ? sbGet('sst_doc?empresa=eq.'+_enc(oid)+'&select=id,url&url=in.('+urls.map(function(u){ return _enc('"'+u+'"'); }).join(',')+')').then(function(rows){
      (Array.isArray(rows) ? rows : []).forEach(function(r){ if(r && !ids[String(r.id)]){ var x=_arcRuta(r.url); if(x) delete rutas[x]; } });
    }, function(){ return null; }) : Promise.resolve();
  return otra.then(function(){
    var Q=Object.keys(rutas); if(!Q.length) return { n:0, pedidos:0 };
    return sbFetch(SB.url+'/storage/v1/object/msds', { method:'DELETE', body:JSON.stringify({ prefixes:Q }) }).then(function(r){
      if(!r.ok) return { n:0, pedidos:Q.length, mal:r.status };
      return r.json().then(function(j){ return { n:Array.isArray(j) ? j.length : 0, pedidos:Q.length }; }, function(){ return { n:Q.length, pedidos:Q.length }; });
    }, function(){ return { n:0, pedidos:Q.length, mal:'red' }; });
  });
}
/* borra las filas (de 40 en 40) y después sus archivos; devuelve { fuera:{id:1}, n, mal, libres } */
function _arcBorrarFilas(L){
  var tandas=[]; for(var i=0;i<L.length;i+=40) tandas.push(L.slice(i, i+40));
  var fuera={};
  return _arcDeAPocos(tandas, 2, function(T){
    return sbDelP('sst_doc?id=in.('+T.map(function(f){ return _enc(f.id); }).join(',')+')').then(function(rows){
      var conId=(Array.isArray(rows) ? rows : []).filter(function(r){ return r && r.id!=null; });
      /* 204 (sin cuerpo): se borró lo pedido; con cuerpo: solo lo que volvió */
      if(!conId.length && Array.isArray(rows) && rows.length===1 && rows[0] && rows[0].id==null) T.forEach(function(f){ fuera[String(f.id)]=1; });
      else conId.forEach(function(r){ fuera[String(r.id)]=1; });
    });
  }).then(function(){
    var idas=L.filter(function(f){ return fuera[String(f.id)]; }), n=idas.length;
    return (n ? _arcLiberar(idas) : Promise.resolve({ n:0, pedidos:0 })).then(function(lib){
      DC.filas=(DC.filas||[]).filter(function(f){ return !fuera[String(f.id)]; });
      ARC.sel=ARC.sel.filter(function(id){ return !fuera[id]; });
      return { fuera:fuera, n:n, mal:L.length-n, libres:lib };
    });
  });
}
function arcQuitar(ids){
  var L=ids.map(arcFila).filter(function(f){ return f && arcInfo(f).editable; });
  if(!L.length){ toast('Eso no se puede quitar desde aquí.'); return; }
  var uno=(L.length===1);
  confirmar(uno ? '¿Quitar «'+(L[0].nombre||'este archivo')+'»?' : '¿Quitar '+L.length+' archivos?',
            (uno ? 'Sale de la carpeta «'+arcInfo(L[0]).t+'», aquí y en la app de todo el equipo, y se libera su espacio.' : 'Salen de sus carpetas, aquí y en la app de todo el equipo, y se libera su espacio.')+' No se puede deshacer.',
            {si:'Sí, quitar', mal:true}).then(function(si){
    if(!si) return;
    _arcBorrarFilas(L).then(function(r){
      if(HOJA.abierta && ARC.abierto && r.fuera[ARC.abierto]) cerrarHoja();
      arcPintar();
      if(r.n) toast(r.n===1 ? 'Quitado de la carpeta' : r.n+' archivos quitados');
      if(r.mal) toast(r.n ? 'Se quitaron '+r.n+'; '+r.mal+' no se pudieron (revisa tu conexión o tu permiso).' : 'No se pudo quitar: esta cuenta no puede, o ya no estaba.');
      if(r.n && VISTA.recargar) VISTA.recargar(true);
    });
  });
}

/* ── descargar: uno tal cual; varios, en un ZIP ───────────────────────────────────────────────────────── */
function _arcDataBlob(u){
  var p=String(u).split(','), tipo=(p[0].match(/data:([^;,]+)/)||[])[1]||'application/octet-stream', b64=/;base64/i.test(p[0]);
  var s=b64 ? atob(p[1]||'') : decodeURIComponent(p[1]||''), a=new Uint8Array(s.length);
  for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i);
  return new Blob([a], {type:tipo});
}
function _arcBlob(f){
  var u=String(f.url||'');
  if(/^data:/i.test(u)){ try{ return Promise.resolve(_arcDataBlob(u)); }catch(e){ return Promise.reject('dato'); } }
  return fetch(u, {credentials:'omit'}).then(function(r){ return r.ok ? r.blob() : Promise.reject(r.status); });
}
/* el nombre de un archivo que se descarga: sin tildes ni signos fuera del ASCII (con esos, algunos navegadores lo
   guardan como «download»); «·» pasa a «-» */
function _arcNombreSano(t){
  return nombreArchivo(t).replace(/\s*·\s*/g, ' - ').replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').replace(/^[\s.-]+|[\s.-]+$/g, '').slice(0, 110) || 'documento';
}
function _arcNombreBajar(f){
  var I=arcInfo(f), u=String(f.url||''), ext=_arcExt(u);
  if(/^data:/i.test(u)){ var mt=(u.match(/^data:([^;,]+)/)||[])[1]||''; ext=mt==='image/png' ? 'png' : (mt==='application/pdf' ? 'pdf' : 'jpg'); }
  if(!ext) ext=(I.tipo==='pdf' ? 'pdf' : (I.tipo==='img' ? 'jpg' : ''));
  var n=_arcNombreSano(f.nombre||'documento');
  if(ext && !new RegExp('\\.'+ext+'$', 'i').test(n)) n+='.'+ext;
  return n;
}
function arcBajar(ids, boton){
  var L=ids.map(arcFila).filter(function(f){ return f && f.url && arcInfo(f).tipo!=='enlace'; });
  if(!L.length){ toast('No hay archivos para descargar (los enlaces se abren en su sitio).'); return; }
  if(L.length===1){
    var f=L[0];
    if(boton) boton.disabled=true;
    _arcBlob(f).then(function(b){ bajarBlob(b, _arcNombreBajar(f)); toast('Descargado: '+_arcNombreBajar(f)); },
      function(){ try{ window.open(f.url, '_blank', 'noopener'); }catch(_w){} toast('No se pudo bajar aquí: se abrió en otra pestaña.'); })
      .then(function(){ if(boton) boton.disabled=false; });
    return;
  }
  if(ARC.ocupado) return; ARC.ocupado=true;
  var antes=boton ? boton.textContent : '';
  var pon=function(t){ if(boton){ boton.disabled=true; boton.textContent=t; } };
  _arcZipDe(L, function(i, n){ pon('Armando el ZIP '+i+'/'+n+'…'); }).then(function(z){
    ARC.ocupado=false; if(boton){ boton.disabled=false; boton.textContent=antes; }
    if(!z.n){ toast('No se pudo bajar ninguno. Revisa tu conexión.'); return; }
    bajarBlob(z.blob, _arcNombreZip());
    toast(z.n+' archivos en un ZIP'+(z.fallos.length ? ' · '+z.fallos.length+' no se pudieron bajar' : ''));
  });
}
function _arcNombreZip(){ return 'Archivo de la obra - '+_arcNombreSano(nombreObraP()||'obra')+' - '+fechaLarga(hoyISO()).replace(/\//g, '-')+'.zip'; }
/* el ZIP de esas filas: { blob, n, ids:{los que entraron}, fallos:[nombres] } */
function _arcZipDe(L, avance){
  var usados={}, archivos=[], fallos=[], ids={}, total=0;
  return L.reduce(function(cad, f, i){
    return cad.then(function(){
      if(avance) avance(i+1, L.length);
      if(total>ARC_TOPE_BYTES){ fallos.push(f.nombre||'documento'); return; }
      return _arcBlob(f).then(function(b){ return b.arrayBuffer(); }).then(function(ab){
        total+=ab.byteLength;
        var n=_arcNombreBajar(f), base=n, k=2;
        while(usados[n.toLowerCase()]){ n=base.replace(/(\.[a-z0-9]{2,5})?$/i, ' ('+(k++)+')$1'); }
        usados[n.toLowerCase()]=1; archivos.push({n:n, b:new Uint8Array(ab)}); ids[String(f.id)]=1;
      }, function(){ fallos.push(f.nombre||'documento'); });
    });
  }, Promise.resolve()).then(function(){
    return { blob:archivos.length ? _arcZip(archivos) : null, n:archivos.length, ids:ids, fallos:fallos };
  });
}
var _ARC_CRC=null;
function _arcCrc(u8){
  if(!_ARC_CRC){ _ARC_CRC=new Uint32Array(256); for(var n=0;n<256;n++){ var c=n; for(var k=0;k<8;k++) c=(c&1) ? (0xEDB88320^(c>>>1)) : (c>>>1); _ARC_CRC[n]=c>>>0; } }
  var x=0xFFFFFFFF; for(var i=0;i<u8.length;i++) x=_ARC_CRC[(x^u8[i])&0xFF]^(x>>>8);
  return (x^0xFFFFFFFF)>>>0;
}
/* un ZIP sin comprimir (los PDF y las fotos ya vienen comprimidos): nombres en UTF-8 */
function _arcZip(archivos){
  var enc=new TextEncoder(), partes=[], central=[], off=0, d=new Date();
  var hora=((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xFFFF, dia=(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xFFFF;
  archivos.forEach(function(a){
    var nb=enc.encode(a.n), crc=_arcCrc(a.b), L=new DataView(new ArrayBuffer(30)), C=new DataView(new ArrayBuffer(46));
    L.setUint32(0, 0x04034b50, true); L.setUint16(4, 20, true); L.setUint16(6, 0x0800, true); L.setUint16(8, 0, true); L.setUint16(10, hora, true); L.setUint16(12, dia, true);
    L.setUint32(14, crc, true); L.setUint32(18, a.b.length, true); L.setUint32(22, a.b.length, true); L.setUint16(26, nb.length, true); L.setUint16(28, 0, true);
    partes.push(new Uint8Array(L.buffer), nb, a.b);
    C.setUint32(0, 0x02014b50, true); C.setUint16(4, 20, true); C.setUint16(6, 20, true); C.setUint16(8, 0x0800, true); C.setUint16(10, 0, true); C.setUint16(12, hora, true);
    C.setUint16(14, dia, true); C.setUint32(16, crc, true); C.setUint32(20, a.b.length, true); C.setUint32(24, a.b.length, true); C.setUint16(28, nb.length, true);
    C.setUint16(30, 0, true); C.setUint16(32, 0, true); C.setUint16(34, 0, true); C.setUint16(36, 0, true); C.setUint32(38, 0, true); C.setUint32(42, off, true);
    central.push(new Uint8Array(C.buffer), nb);
    off+=30+nb.length+a.b.length;
  });
  var tamC=0; central.forEach(function(x){ tamC+=x.length; });
  var E=new DataView(new ArrayBuffer(22));
  E.setUint32(0, 0x06054b50, true); E.setUint16(8, archivos.length, true); E.setUint16(10, archivos.length, true); E.setUint32(12, tamC, true); E.setUint32(16, off, true);
  return new Blob(partes.concat(central, [new Uint8Array(E.buffer)]), {type:'application/zip'});
}

/* ═══ UNIR EN UN PDF ═══════════════════════════════════════════════════════════════════════════════════
   De 1 a 100 (PDF o fotos), de la obra o de la computadora, en el orden que se elija. Los PDF entran con todas sus
   páginas tal cual (pdf-lib copia las páginas, no las vuelve a dibujar); cada foto, en una hoja A4 (de pie o
   echada, según la foto), centrada. Si se pide: una hoja de índice al inicio y el número de cada página. Lo que no
   se pudo leer (un PDF con contraseña, un enlace que no baja) se salta y se dice cuál. */
function cargarPdfLib(){
  if(window.PDFLib) return Promise.resolve(window.PDFLib);
  if(ARC._lib) return ARC._lib;
  ARC._lib=_cargarJS('pdflib/pdf-lib.min.js?v='+PDFLIB_V, function(){ return !!window.PDFLib; }).then(function(){ return window.PDFLib; });
  ARC._lib.catch(function(){ ARC._lib=null; });
  return ARC._lib;
}
function _arcItemDe(f){
  var I=arcInfo(f);
  return { id:String(f.id), n:f.nombre||'Documento', tipo:I.tipo, sub:(I.k==='esc' ? 'Escaneo · ' : '')+I.t+(I.fecha ? ' · '+fechaLarga(I.fecha) : ''), fecha:_arcClaveFecha(f), f:f };
}
function arcUnirAbrir(ids, op){
  op=op||{};
  var filas=(ids||[]).map(arcFila).filter(Boolean), va=filas.filter(_arcSeUne), no=filas.filter(function(f){ return !_arcSeUne(f); });
  var viejo=ARC.unir, pc=(viejo && !viejo.hecho) ? viejo.items.filter(function(x){ return x.file; }) : [];
  /* 09/10/2026 · sin nada elegido ya no se frena: se abre con «Del archivo de la obra» a la vista */
  if(!va.length && !pc.length && !op.elegir){ toast('Para unir, elige PDF o fotos.'); return; }
  var k={}; va.forEach(function(f){ var I=arcInfo(f); k[I.key]=I; });
  var ks=Object.keys(k), uno=(ks.length===1) ? k[ks[0]] : null;
  var dest='';
  if(uno && uno.k==='esc' && ARC.cfg.escaneos) dest=uno.key;
  else if(uno && uno.k==='doc' && _dcCarpetas().some(function(c){ return c.h===uno.key; })) dest=uno.key;
  ARC.unir={ items:va.map(_arcItemDe).concat(pc), no:no, nombre:(uno ? uno.t : 'Documentos unidos')+' · '+fechaLarga(hoyISO()), dest:dest,
             st:_dcEstado(dest.indexOf('esc:')===0 ? '' : dest), indice:false, numerar:false, corriendo:false, cancelar:false, hecho:null, arrastra:-1,
             peso:ARC.peso || 'liviano', elegir:!!(op.elegir || (!va.length && !pc.length)), busca:'', marca:{} };
  if(dest.indexOf('esc:')===0) ARC.unir.st.h=dest;
  abrirHoja('Unir en un PDF', va.length ? 'Con los PDF y las fotos que elegiste' : 'Elige los PDF y las fotos, y el orden', '<div id="arc-u-cuerpo"></div>',
    _arcUnirPieForm(), {sinFoco:true});
  _arcUnirForm();
}
function _arcUnirPieForm(){ return '<button type="button" class="bt sec" id="arc-u-no">Cancelar</button><button type="button" class="bt" id="arc-u-si">Unir</button>'; }
function _arcUnirForm(){
  var U=ARC.unir, c=$('arc-u-cuerpo'); if(!c || !U) return;
  var ex=_dcExtra('arcu', U.st);
  c.innerHTML=
    '<p class="ayuda" style="margin:0 0 10px">Se unen en este orden, de arriba abajo: cámbialo con ↑ ↓ o arrastrándolos. De 1 a '+ARC_TOPE_UNIR+' archivos, PDF o fotos.</p>'+
    '<div class="arc-u-orden"><span>Ordenar:</span><button type="button" class="bt sec chico" data-ord="fecha">Por fecha</button>'+
      '<button type="button" class="bt sec chico" data-ord="nombre">Por nombre</button><button type="button" class="bt sec chico" data-ord="vuelta">Al revés</button></div>'+
    '<ol class="arc-u-lista" id="arc-u-lista" aria-label="El orden en que se unen"></ol>'+
    '<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin:0 0 6px"><button type="button" class="bt sec chico" id="arc-u-del"'+(U.elegir ? ' aria-expanded="true"' : ' aria-expanded="false"')+'>＋ Del archivo de la obra</button>'+
      '<label class="bt sec chico" for="arc-u-pc">＋ De tu computadora</label>'+
      '<input type="file" id="arc-u-pc" multiple accept="application/pdf,.pdf,image/jpeg,image/png,.jpg,.jpeg,.png" class="pi-oculto"><span class="ayuda" id="arc-u-cuenta" style="margin:0"></span></div>'+
    '<div class="arc-u-el" id="arc-u-el"'+(U.elegir ? '' : ' hidden')+'></div>'+
    (U.no.length ? '<p class="arc-u-no">No entran (solo se unen PDF y fotos): '+U.no.map(function(f){ return '«'+esc(f.nombre||'documento')+'» ('+esc(ARC_TIPO_ET[arcInfo(f).tipo])+')'; }).join(', ')+'.</p>' : '')+
    '<div class="campo" style="margin-top:14px"><label for="arc-u-nom">Nombre del PDF</label><input id="arc-u-nom" maxlength="120" value="'+esc(U.nombre)+'"></div>'+
    '<div class="campo"><label for="arcu-c">Guardarlo también en</label>'+_arcSelDestino('arcu-c', U.st.h, {descargar:true, sinFotos:true})+'</div>'+
    '<div class="dc-extra campo" id="arcu-ex"'+(ex ? '' : ' hidden')+'>'+ex+'</div>'+
    '<p class="arc-mv-nota" style="margin:-6px 0 12px">Primero lo ves. Después lo descargas y, si pesa 25 MB o menos, lo guardas en esa carpeta: aquí y en la app.</p>'+
    '<div class="campo" style="margin-bottom:4px"><label>Peso del PDF</label></div>'+
    '<div class="arc-pesos" role="radiogroup" aria-label="Peso del PDF">'+ARC_PESOS.map(function(P){
      return '<label class="'+(U.peso===P.k ? 'on' : '')+'" for="arc-u-p-'+P.k+'"><input type="radio" name="arc-u-peso" id="arc-u-p-'+P.k+'" value="'+P.k+'"'+(U.peso===P.k ? ' checked' : '')+'>'+
        '<span><b>'+esc(P.n)+'</b><small>'+esc(P.d)+'</small></span></label>'; }).join('')+'</div>'+
    '<label class="arc-op" for="arc-u-ind"><input type="checkbox" id="arc-u-ind"'+(U.indice?' checked':'')+'><span>Una hoja de <b>índice</b> al inicio: cada documento con la página donde empieza</span></label>'+
    '<label class="arc-op" for="arc-u-num"><input type="checkbox" id="arc-u-num"'+(U.numerar?' checked':'')+'><span><b>Numerar las páginas</b>, abajo al centro («3 / 47»)</span></label>'+
    '<div id="arc-u-prog" hidden><div class="arc-prog"><i id="arc-u-barra"></i></div><div class="arc-prog-t" id="arc-u-prog-t"></div></div>'+
    '<div class="msg" id="arc-u-msg"></div>';
  $('arc-u-nom').oninput=function(){ U.nombre=this.value; };
  $('arc-u-ind').onchange=function(){ U.indice=this.checked; };
  $('arc-u-num').onchange=function(){ U.numerar=this.checked; };
  Array.prototype.forEach.call(c.querySelectorAll('input[name="arc-u-peso"]'), function(r){ r.onchange=function(){
    if(!r.checked) return; U.peso=r.value; ARC.peso=r.value;
    Array.prototype.forEach.call(c.querySelectorAll('.arc-pesos label'), function(l){ l.classList.toggle('on', l.getAttribute('for')==='arc-u-p-'+r.value); });
  }; });
  $('arc-u-del').onclick=function(){ U.elegir=!U.elegir; this.setAttribute('aria-expanded', U.elegir ? 'true' : 'false'); _arcUnirElegir(); if(U.elegir){ try{ $('arc-u-q').focus(); }catch(_f){} } };
  _arcUnirElegir();
  var go=function(){ _dcCablear('arcu', U.st, function(){ var m=$('arc-u-msg'); if(m && /mal/.test(m.className)){ m.className='msg'; m.textContent=''; } }); };
  if(DC.subc) go(); else dcSubcTraer().then(go, go);
  $('arc-u-pc').onchange=function(){ _arcUnirSumarPC(this.files); this.value=''; };
  Array.prototype.forEach.call(c.querySelectorAll('[data-ord]'), function(b){ b.onclick=function(){
    var o=b.getAttribute('data-ord');
    if(o==='vuelta') U.items.reverse();
    else U.items.sort(function(x, y){ return o==='nombre' ? String(x.n).localeCompare(String(y.n), 'es', {sensitivity:'base', numeric:true}) : (x.fecha<y.fecha ? -1 : x.fecha>y.fecha ? 1 : 0); });
    _arcUnirLista();
  }; });
  $('arc-u-no').onclick=function(){ if(U.corriendo){ U.cancelar=true; this.disabled=true; this.textContent='Cancelando…'; } else cerrarHoja(); };
  $('arc-u-si').onclick=_arcUnirIr;
  _arcUnirLista();
}
function _arcUnirSumarPC(files){
  var U=ARC.unir; if(!U) return;
  var malos=[];
  Array.prototype.forEach.call(files||[], function(f){
    var pdf=/pdf/i.test(f.type||'') || /\.pdf$/i.test(f.name||''), img=/^image\/(jpeg|png)$/i.test(f.type||'') || /\.(jpe?g|png)$/i.test(f.name||'');
    if(!pdf && !img){ malos.push(f.name+' (no es PDF ni foto)'); return; }
    if(!(f.size>0)){ malos.push(f.name+' (está vacío)'); return; }
    U.items.push({ id:'pc-'+Date.now()+'-'+Math.random().toString(36).slice(2, 7), n:String(f.name||'archivo').replace(/\.[a-z0-9]{2,5}$/i, ''), tipo:pdf ? 'pdf' : 'img',
                   sub:'De tu computadora · '+_dcPeso(f.size), fecha:_arcDia(new Date(f.lastModified||Date.now()).toISOString())+'|', file:f });
  });
  _arcUnirLista();
  var m=$('arc-u-msg'); if(m){ m.className=malos.length ? 'msg mal' : 'msg'; m.textContent=malos.length ? 'No entran: '+malos.join(', ')+'.' : ''; }
}
/* 09/10/2026 · «＋ Del archivo de la obra»: los PDF y las fotos que se ven en la web, con buscador; los marcados se suman
   al final de la lista (en el orden en que se marcaron) */
var ARC_ELEGIR_MAX=150;
function _arcUnirElegir(){
  var U=ARC.unir, c=$('arc-u-el'); if(!c || !U) return;
  c.hidden=!U.elegir || !!U.corriendo; if(c.hidden){ c.innerHTML=''; return; }
  var ya={}; U.items.forEach(function(it){ ya[String(it.id)]=1; });
  var q=_dcNorm(U.busca||''), pal=q ? q.split(' ') : [];
  var L=(DC.filas||[]).filter(arcVisible).filter(_arcSeUne).filter(function(f){ return !ya[String(f.id)]; });
  if(_arcModoEsc()) L.sort(function(a, b){ return (_arcDeLaApp(b) ? 1 : 0)-(_arcDeLaApp(a) ? 1 : 0); });
  if(pal.length) L=L.filter(function(f){ var I=arcInfo(f), t=_dcNorm([f.nombre, I.t, I.g, I.det, I.fecha ? fechaLarga(I.fecha) : ''].join(' ')); return pal.every(function(p){ return t.indexOf(p)>-1; }); });
  L=_arcOrdenar(L.slice());
  var n=Object.keys(U.marca).filter(function(id){ return U.marca[id]; }).length, ver=L.slice(0, ARC_ELEGIR_MAX);
  var foco=(document.activeElement && document.activeElement.id==='arc-u-q') ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
  c.innerHTML='<div class="arc-u-el-cab"><input type="search" id="arc-u-q" placeholder="Buscar por nombre, carpeta o fecha" aria-label="Buscar en el archivo" value="'+esc(U.busca||'')+'">'+
      '<button type="button" class="bt chico" id="arc-u-el-si"'+(n ? '' : ' disabled')+'>'+(n ? 'Agregar '+n : 'Agregar')+'</button></div>'+
    (ver.length ? '<ul aria-label="PDF y fotos del archivo">'+ver.map(function(f){
      var id=String(f.id), I=arcInfo(f);
      return '<li><label><input type="checkbox" data-el="'+esc(id)+'"'+(U.marca[id] ? ' checked' : '')+'><span class="arc-tipo '+I.tipo+'">'+ARC_TIPO_SIG[I.tipo]+'</span>'+
        '<span style="min-width:0"><b title="'+esc(f.nombre||'')+'">'+esc(f.nombre||'Documento')+'</b><small>'+esc(_arcSub(f))+'</small></span></label></li>'; }).join('')+'</ul>'
      : '<p>'+(pal.length ? 'Nada con «'+esc(U.busca)+'».' : 'No quedan PDF ni fotos para sumar.')+'</p>')+
    (L.length>ver.length ? '<p>Se ven '+ver.length+' de '+L.length+': escribe para encontrar los demás.</p>' : '');
  var qi=$('arc-u-q'), tq=null;
  qi.oninput=function(){ var v=this.value; if(tq) clearTimeout(tq); tq=setTimeout(function(){ U.busca=v; _arcUnirElegir(); }, 160); };
  if(foco){ try{ qi.focus(); qi.setSelectionRange(foco[0], foco[1]); }catch(_s){} }
  Array.prototype.forEach.call(c.querySelectorAll('[data-el]'), function(k){ k.onchange=function(){
    var id=k.getAttribute('data-el'); if(k.checked) U.marca[id]=Date.now(); else delete U.marca[id];
    var m=Object.keys(U.marca).length, b=$('arc-u-el-si'); if(b){ b.disabled=!m; b.textContent=m ? 'Agregar '+m : 'Agregar'; }
  }; });
  $('arc-u-el-si').onclick=function(){
    var ids=Object.keys(U.marca).sort(function(a, b){ return U.marca[a]-U.marca[b]; });
    ids.map(arcFila).filter(function(f){ return f && _arcSeUne(f); }).forEach(function(f){ U.items.push(_arcItemDe(f)); });
    U.marca={}; _arcUnirLista(); _arcUnirElegir();
    var m=$('arc-u-msg'); if(m && /mal/.test(m.className)){ m.className='msg'; m.textContent=''; }
  };
}
function _arcUnirLista(){
  var U=ARC.unir, ol=$('arc-u-lista'); if(!ol || !U) return;
  var n=U.items.length, quieto=U.corriendo;
  ol.innerHTML=n ? U.items.map(function(it, i){
    return '<li data-i="'+i+'"'+(quieto ? '' : ' draggable="true"')+'><span class="arc-u-n">'+(i+1)+'</span><span class="arc-tipo '+it.tipo+'">'+ARC_TIPO_SIG[it.tipo]+'</span>'+
      '<span style="min-width:0"><b title="'+esc(it.n)+'">'+esc(it.n)+'</b><small>'+esc(it.sub||'')+'</small></span>'+
      '<span class="arc-u-b"><button type="button" data-u="sube" aria-label="Subir «'+esc(it.n)+'»"'+(i && !quieto?'':' disabled')+'>↑</button>'+
        '<button type="button" data-u="baja" aria-label="Bajar «'+esc(it.n)+'»"'+(i<n-1 && !quieto?'':' disabled')+'>↓</button>'+
        '<button type="button" data-u="fuera" aria-label="Sacar «'+esc(it.n)+'»"'+(quieto?' disabled':'')+'>✕</button></span></li>';
  }).join('') : '<li style="display:block; color:var(--gris); font-size:13px">Todavía no hay nada que unir: súmalos con «＋ Del archivo de la obra» o «＋ De tu computadora».</li>';
  var cu=$('arc-u-cuenta'); if(cu) cu.textContent=n+' de '+ARC_TOPE_UNIR+' como máximo';
  var si=$('arc-u-si');
  if(si && !U.corriendo && !U.hecho){
    si.textContent=n ? 'Unir '+(n===1 ? 'en un PDF' : 'los '+n+' en un PDF') : 'Unir'; si.disabled=!n || n>ARC_TOPE_UNIR;
    var m=$('arc-u-msg'); if(m && n>ARC_TOPE_UNIR){ m.className='msg mal'; m.textContent='Son '+n+': el tope para unir es '+ARC_TOPE_UNIR+'. Saca '+(n-ARC_TOPE_UNIR)+'.'; }
  }
  if(quieto) return;
  Array.prototype.forEach.call(ol.querySelectorAll('[data-u]'), function(b){ b.onclick=function(){
    var i=+b.closest('[data-i]').getAttribute('data-i'), q=b.getAttribute('data-u'), L=U.items;
    if(q==='sube' && i>0){ L.splice(i-1, 0, L.splice(i, 1)[0]); _arcUnirLista(); try{ ol.querySelector('[data-i="'+(i-1)+'"] [data-u="sube"]').focus(); }catch(_e){} }
    else if(q==='baja' && i<L.length-1){ L.splice(i+1, 0, L.splice(i, 1)[0]); _arcUnirLista(); try{ ol.querySelector('[data-i="'+(i+1)+'"] [data-u="baja"]').focus(); }catch(_e){} }
    else if(q==='fuera'){ L.splice(i, 1); _arcUnirLista(); _arcUnirElegir(); }
  }; });
  /* arrastrar para ordenar (en la computadora) */
  Array.prototype.forEach.call(ol.querySelectorAll('li[draggable]'), function(li){
    li.addEventListener('dragstart', function(ev){ U.arrastra=+li.getAttribute('data-i'); li.classList.add('arrastra'); try{ ev.dataTransfer.effectAllowed='move'; ev.dataTransfer.setData('text/plain', String(U.arrastra)); }catch(_d){} });
    li.addEventListener('dragend', function(){ li.classList.remove('arrastra'); U.arrastra=-1; Array.prototype.forEach.call(ol.querySelectorAll('.sobre'), function(x){ x.classList.remove('sobre'); }); });
    li.addEventListener('dragover', function(ev){ if(U.arrastra<0) return; ev.preventDefault(); li.classList.add('sobre'); });
    li.addEventListener('dragleave', function(){ li.classList.remove('sobre'); });
    li.addEventListener('drop', function(ev){
      ev.preventDefault(); var a=U.arrastra, b=+li.getAttribute('data-i'); if(a<0 || a===b) return;
      U.items.splice(b, 0, U.items.splice(a, 1)[0]); U.arrastra=-1; _arcUnirLista();
    });
  });
}
function _arcUnirIr(){
  var U=ARC.unir, m=$('arc-u-msg'); if(!U || U.corriendo) return;
  var nom=String(U.nombre||'').replace(/\s+/g, ' ').trim();
  if(nom.length<3){ m.className='msg mal'; m.textContent='Ponle un nombre al PDF.'; $('arc-u-nom').focus(); return; }
  if(!U.items.length){ m.className='msg mal'; m.textContent='No hay nada que unir.'; return; }
  if(U.items.length>ARC_TOPE_UNIR){ m.className='msg mal'; m.textContent='El tope para unir es '+ARC_TOPE_UNIR+'.'; return; }
  var d=String(U.st.h||''), r={h:''};
  if(d && d.indexOf('esc:')!==0){ r=_dcHoja(U.st); if(r.err){ m.className='msg mal'; m.textContent=r.err; return; } }
  U.nombre=nom.slice(0, 120); U.destino={ h:d ? (d.indexOf('esc:')===0 ? 'asistencia' : r.h) : '', clase:d.indexOf('esc:')===0 ? d.slice(4) : '', nuevo:r.nuevo || null,
    t:d ? (d.indexOf('esc:')===0 ? 'Escaneos · '+_arcClaseEt(d.slice(4)) : dcCarpetaDe(r.h).t) : '' };
  U.corriendo=true; U.cancelar=false;
  Array.prototype.forEach.call($('arc-u-cuerpo').querySelectorAll('input, select, .arc-u-orden button, label.bt, #arc-u-del'), function(x){ if(x.tagName==='LABEL') x.style.pointerEvents='none'; else x.disabled=true; });
  _arcUnirLista(); _arcUnirElegir();
  var si=$('arc-u-si'); si.disabled=true; si.textContent='Uniendo…';
  $('arc-u-prog').hidden=false; m.className='msg'; m.textContent='';
  _arcUnirCorrer(function(i, n, t){
    var b=$('arc-u-barra'), tt=$('arc-u-prog-t');
    if(b) b.style.width=Math.round(100*i/Math.max(1, n))+'%';
    if(tt) tt.textContent=t;
  }).then(function(res){
    U.corriendo=false;
    if(!res){ cerrarHoja(); toast('Cancelado: no se armó el PDF'); return; }
    U.hecho=res; _arcUnirListo(res);
  }, function(e){
    U.corriendo=false;
    var t=(e && e.nada) ? 'No se pudo unir ninguno'+(e.fallos && e.fallos.length ? ': '+e.fallos.map(function(x){ return '«'+x.n+'» ('+x.por+')'; }).join(', ') : '.')
         : (e && e.tope) ? 'Entre todos pasan de '+Math.round(ARC_TOPE_BYTES/1048576)+' MB: es demasiado para armarlo en el navegador. Une menos de una vez.'
         : (e==='sin_lib' ? 'No se pudo cargar lo que une los PDF. Revisa tu conexión e inténtalo otra vez.' : 'No se pudo armar el PDF. Inténtalo otra vez.');
    m.className='msg mal'; m.textContent=t; $('arc-u-prog').hidden=true;
    Array.prototype.forEach.call($('arc-u-cuerpo').querySelectorAll('input, select, .arc-u-orden button, label.bt, #arc-u-del'), function(x){ if(x.tagName==='LABEL') x.style.pointerEvents=''; else x.disabled=false; });
    var no=$('arc-u-no'); if(no){ no.disabled=false; no.textContent='Cancelar'; }
    _arcUnirLista(); _arcUnirElegir();
  });
}
function _arcBytesDe(it){
  if(it.file) return it.file.arrayBuffer();
  return _arcBlob(it.f).then(function(b){ return b.arrayBuffer(); });
}
function _arcEsPdf(u8){
  var tope=Math.min(u8.length-5, 1024);
  for(var i=0;i<tope;i++) if(u8[i]===0x25 && u8[i+1]===0x50 && u8[i+2]===0x44 && u8[i+3]===0x46 && u8[i+4]===0x2D) return true;
  return false;
}
/* la foto, derecha (respeta cómo se tomó) y en JPG de hasta 2480 px de lado (una A4 a 300 ppp): pesa poco y se ve bien.
   09/10/2026 · con «Liviano» o «Muy liviano», el lado y la calidad de ese peso */
function _arcFotoJpg(u8, lado, calidad){
  var blob=new Blob([u8]);
  var dib=(typeof createImageBitmap==='function') ? createImageBitmap(blob, {imageOrientation:'from-image'}).catch(function(){ return createImageBitmap(blob); })
    : new Promise(function(res, rej){ var im=new Image(), u=URL.createObjectURL(blob); im.onload=function(){ res(im); setTimeout(function(){ URL.revokeObjectURL(u); }, 1000); }; im.onerror=function(){ rej('foto'); }; im.src=u; });
  return dib.then(function(bm){
    var W=bm.width||bm.naturalWidth, H=bm.height||bm.naturalHeight; if(!W || !H) return Promise.reject('foto');
    var s=Math.min(1, (lado || 2480)/Math.max(W, H)), cv=document.createElement('canvas');
    cv.width=Math.max(1, Math.round(W*s)); cv.height=Math.max(1, Math.round(H*s));
    var x=cv.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(bm, 0, 0, cv.width, cv.height);
    try{ if(bm.close) bm.close(); }catch(_c){}
    return new Promise(function(res, rej){ cv.toBlob(function(b){ cv.width=1; cv.height=1; if(!b){ rej('foto'); return; } b.arrayBuffer().then(function(ab){ res(new Uint8Array(ab)); }, rej); }, 'image/jpeg', calidad || 0.9); });
  }, function(){ return Promise.reject('foto'); });
}
/* 09/10/2026 · ACHICAR UN PDF DE HOJAS ESCANEADAS: cada página se dibuja con pdf.js a los ppp del peso elegido y se guarda
   como JPG. Devuelve { pags:[{ jpg, w, h }], bytes } (w y h en puntos, ya con su giro), o null si no se pudo. Las
   páginas se dibujan una por una y el lienzo se suelta enseguida: un PDF de 60 hojas no llena la memoria. */
var ARC_LIENZO_MAX=2600;
function _arcRasterizar(u8, P, avance){
  if(typeof pdfjsP!=='function') return Promise.resolve(null);
  return pdfjsP().then(function(pdfjs){
    return pdfjs.getDocument({ data:new Uint8Array(u8), isEvalSupported:false }).promise;
  }).then(function(doc){
    var n=doc.numPages||0, out=[], bytes=0;
    var una=function(i){
      if(i>n) return Promise.resolve();
      if(ARC.unir && ARC.unir.cancelar) return Promise.resolve();
      if(avance) avance(i, n);
      return doc.getPage(i).then(function(pg){
        var v1=pg.getViewport({ scale:1 }), s=P.ppp/72, mx=Math.max(v1.width, v1.height)*s;
        if(mx>ARC_LIENZO_MAX) s*=ARC_LIENZO_MAX/mx;
        var vp=pg.getViewport({ scale:s }), cv=document.createElement('canvas');
        cv.width=Math.max(1, Math.round(vp.width)); cv.height=Math.max(1, Math.round(vp.height));
        var x=cv.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0, 0, cv.width, cv.height);
        return pg.render({ canvasContext:x, canvas:cv, viewport:vp }).promise.then(function(){
          return new Promise(function(ok, mal){ cv.toBlob(function(b){ cv.width=1; cv.height=1; b ? ok(b) : mal('jpg'); }, 'image/jpeg', P.q); });
        }).then(function(b){ return b.arrayBuffer(); }).then(function(ab){
          var j=new Uint8Array(ab); bytes+=j.length; out.push({ jpg:j, w:v1.width, h:v1.height });
          try{ pg.cleanup(); }catch(_c){}
          return una(i+1);
        });
      });
    };
    return una(1).then(function(){ try{ doc.destroy(); }catch(_d){} return (out.length===n && n) ? { pags:out, bytes:bytes } : null; },
                        function(){ try{ doc.destroy(); }catch(_d){} return null; });
  }).catch(function(){ return null; });
}
function _arcPorQue(e){
  var t=String((e && e.message) || e || '');
  if(/encrypt/i.test(t)) return 'tiene contraseña';
  if(e==='foto') return 'la foto no se pudo leer';
  if(typeof e==='number') return 'no se pudo bajar';
  if(/fetch|network|Failed/i.test(t)) return 'no se pudo bajar';
  return 'no se pudo leer';
}
var ARC_A4=[595.28, 841.89];
function _arcUnirCorrer(avance){
  var U=ARC.unir;
  return cargarPdfLib().catch(function(){ return Promise.reject('sin_lib'); }).then(function(P){
    return P.PDFDocument.create().then(function(out){
      var hechos=[], fallos=[], total=0, n=U.items.length, PZ=arcPeso(U.peso), achicados=0;
      return U.items.reduce(function(cad, it, i){
        return cad.then(function(){
          if(U.cancelar) return;
          avance(i, n, 'Uniendo '+(i+1)+' de '+n+' · «'+it.n+'»');
          return _arcBytesDe(it).then(function(ab){
            total+=ab.byteLength; if(total>ARC_TOPE_BYTES) return Promise.reject({tope:1});
            var u8=new Uint8Array(ab), ini=out.getPageCount(), pesaba=ab.byteLength;
            if(it.tipo==='pdf' && !_arcEsPdf(u8)) return Promise.reject('no_pdf');
            if(_arcEsPdf(u8)){
              return P.PDFDocument.load(u8, {updateMetadata:false}).then(function(src){
                var np=src.getPageCount();
                /* 09/10/2026 · ¿se achica? Solo si se pidió y si pesa como hojas escaneadas; y solo si de verdad ahorra */
                var achica=(PZ.ppp && np && pesaba/np>ARC_ESC_POR_PAG) ? _arcRasterizar(u8, PZ, function(p, t){ avance(i, n, 'Achicando «'+it.n+'» · hoja '+p+' de '+t); }) : Promise.resolve(null);
                return achica.then(function(R){
                  if(R && R.bytes<pesaba*0.85){
                    return R.pags.reduce(function(c2, pp){
                      return c2.then(function(){ return out.embedJpg(pp.jpg).then(function(img){ var pg=out.addPage([pp.w, pp.h]); pg.drawImage(img, { x:0, y:0, width:pp.w, height:pp.h }); }); });
                    }, Promise.resolve()).then(function(){ achicados++; return R.pags.length; });
                  }
                  return out.copyPages(src, src.getPageIndices()).then(function(ps){ ps.forEach(function(p){ out.addPage(p); }); return ps.length; });
                });
              }).then(function(np){ hechos.push({n:it.n, ini:ini, np:np, id:it.id, bytes:pesaba}); });
            }
            return _arcFotoJpg(u8, PZ.lado, PZ.q).then(function(j){ return out.embedJpg(j); }).then(function(img){
              var ech=img.width>img.height, W=ech ? ARC_A4[1] : ARC_A4[0], H=ech ? ARC_A4[0] : ARC_A4[1], M=24;
              var s=Math.min((W-2*M)/img.width, (H-2*M)/img.height), w=img.width*s, h=img.height*s;
              var pg=out.addPage([W, H]); pg.drawImage(img, {x:(W-w)/2, y:(H-h)/2, width:w, height:h});
              hechos.push({n:it.n, ini:ini, np:1, id:it.id, bytes:pesaba});
            });
          }).catch(function(e){ if(e && e.tope) return Promise.reject(e); fallos.push({n:it.n, por:_arcPorQue(e)}); });
        });
      }, Promise.resolve()).then(function(){
        if(U.cancelar) return null;
        if(!hechos.length) return Promise.reject({nada:1, fallos:fallos});
        avance(n, n, 'Armando el PDF…');
        return (U.indice ? _arcIndice(P, out, hechos) : Promise.resolve(0)).then(function(nInd){
          return (U.numerar ? _arcNumerar(P, out) : Promise.resolve()).then(function(){
            try{ out.setTitle(_arcTxt(U.nombre)); out.setCreator('OBRASST'); out.setProducer('OBRASST · pdf-lib'); out.setCreationDate(new Date()); out.setModificationDate(new Date()); }catch(_m){}
            return out.save({ useObjectStreams:true });
          }).then(function(u8){
            return { blob:new Blob([u8], {type:'application/pdf'}), pags:out.getPageCount(), hechos:hechos, fallos:fallos, indice:nInd, total:total, achicados:achicados, peso:PZ.k };
          });
        });
      });
    });
  });
}
/* el texto que va dentro del PDF: las letras de Helvetica (las del español entran todas) */
function _arcTxt(s){
  s=String(s==null ? '' : s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
  var o='';
  for(var i=0;i<s.length;i++){
    var ch=s.charAt(i), c=s.charCodeAt(i);
    if((c>=32 && c<=126) || (c>=160 && c<=255) || '–—•…€'.indexOf(ch)>-1){ o+=ch; continue; }
    var b=ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if(b.length===1 && b.charCodeAt(0)>=32 && b.charCodeAt(0)<=126) o+=b;
  }
  return o;
}
function _arcCorta(s, f, t, max){
  if(f.widthOfTextAtSize(s, t)<=max) return s;
  while(s.length>1 && f.widthOfTextAtSize(s+'…', t)>max) s=s.slice(0, -1);
  return s.replace(/\s+$/, '')+'…';
}
/* la hoja de índice: cada documento con la página donde empieza (ya contadas las del índice) */
function _arcIndice(P, out, hechos){
  return Promise.all([out.embedFont(P.StandardFonts.Helvetica), out.embedFont(P.StandardFonts.HelveticaBold)]).then(function(F){
    var f=F[0], fb=F[1], W=ARC_A4[0], H=ARC_A4[1], M=56, lh=18, arriba=H-M-84, porPag=Math.max(1, Math.floor((arriba-M)/lh));
    var nP=Math.ceil(hechos.length/porPag), tinta=P.rgb(0.043, 0.165, 0.227), gris=P.rgb(0.42, 0.49, 0.53), clara=P.rgb(0.72, 0.76, 0.79);
    var obra=_arcTxt(nombreObraP()||''), linea2=(obra ? obra+' · ' : '')+fechaLarga(hoyISO())+' · '+hechos.length+' documento'+(hechos.length===1?'':'s');
    for(var p=0;p<nP;p++){
      var pg=out.insertPage(p, [W, H]);
      pg.drawText(p ? 'Índice (sigue)' : 'Índice', {x:M, y:H-M-8, size:20, font:fb, color:tinta});
      pg.drawText(_arcCorta(_arcTxt(ARC.unir.nombre), f, 11.5, W-2*M), {x:M, y:H-M-32, size:11.5, font:f, color:tinta});
      pg.drawText(_arcCorta(_arcTxt(linea2), f, 9.5, W-2*M), {x:M, y:H-M-49, size:9.5, font:f, color:gris});
      pg.drawLine({start:{x:M, y:H-M-62}, end:{x:W-M, y:H-M-62}, thickness:0.6, color:clara});
      var y=arriba;
      for(var i=p*porPag; i<Math.min(hechos.length, (p+1)*porPag); i++){
        var h=hechos[i], num=String(h.ini+1+nP), pre=(i+1)+'.', wn=fb.widthOfTextAtSize(num, 10.5);
        var nom=_arcCorta(_arcTxt(h.n)||'Documento', f, 10.5, W-2*M-30-wn-24), wnom=f.widthOfTextAtSize(nom, 10.5);
        pg.drawText(pre, {x:M, y:y, size:10.5, font:f, color:gris});
        pg.drawText(nom, {x:M+30, y:y, size:10.5, font:f, color:tinta});
        var x0=M+30+wnom+6, x1=W-M-wn-6, wp=f.widthOfTextAtSize('.', 10.5), k=Math.floor((x1-x0)/(wp*1.6));
        for(var d=0; d<k; d++) pg.drawText('.', {x:x0+d*wp*1.6, y:y, size:10.5, font:f, color:clara});
        pg.drawText(num, {x:W-M-wn, y:y, size:10.5, font:fb, color:tinta});
        y-=lh;
      }
    }
    return nP;
  });
}
/* el número de cada página, abajo al centro, derecho aunque la página venga girada */
function _arcNumerar(P, out){
  return out.embedFont(P.StandardFonts.Helvetica).then(function(f){
    var ps=out.getPages(), N=ps.length, col=P.rgb(0.35, 0.4, 0.45);
    ps.forEach(function(pg, i){
      var t=(i+1)+' / '+N, s=8.5, w=f.widthOfTextAtSize(t, s), b=pg.getCropBox(), r=(((pg.getRotation().angle||0)%360)+360)%360, m=14, x, y, giro=0;
      if(r===90){ x=b.x+b.width-m; y=b.y+b.height/2-w/2; giro=90; }
      else if(r===180){ x=b.x+b.width/2+w/2; y=b.y+b.height-m; giro=180; }
      else if(r===270){ x=b.x+m; y=b.y+b.height/2+w/2; giro=270; }
      else { x=b.x+b.width/2-w/2; y=b.y+m-3; }
      pg.drawText(t, {x:x, y:y, size:s, font:f, color:col, rotate:P.degrees(giro)});
    });
  });
}
/* LISTO (09/10/2026): primero se VE. Desde aquí: descargarlo, guardarlo en la carpeta elegida (si pesa 25 MB o menos),
   volver a cambiar el orden o el peso, y decidir qué pasa con los documentos que se unieron (dejarlos, quitarlos y
   liberar su espacio, o bajarlos en un ZIP a la computadora y después quitarlos). Quitar los originales solo se ofrece
   cuando el PDF unido ya está a salvo: descargado o guardado en la obra. */
function _arcUnirListo(res){
  var U=ARC.unir, nombreA=_arcNombreSano(U.nombre)+'.pdf', D=U.destino||{h:''};
  U.bajado=false; U.guardado=''; U.limpio='';
  var porId={}; res.hechos.forEach(function(h){ if(h.id) porId[String(h.id)]=h; });
  /* los originales que se pueden quitar: los que vinieron del archivo de la obra (no de la computadora) y entraron */
  var orig=U.items.filter(function(it){ return !it.file && it.f && porId[String(it.id)] && arcInfo(it.f).editable && arcFila(it.id); }).map(function(it){ return it.f; });
  var pesanOrig=orig.reduce(function(s, f){ var h=porId[String(f.id)]; return s+((h && h.bytes) || 0); }, 0);
  var pie=$('hoja-pie');
  if(pie) pie.innerHTML='<button type="button" class="bt sec" id="arc-u-volver">← Cambiar el orden o el peso</button><button type="button" class="bt" id="arc-u-cerrar">Listo</button>';
  var achico=(res.achicados || (res.peso!=='tal' && res.blob.size<res.total*0.9));
  var h='<div class="arc-res"><b>✓ Listo: «'+esc(U.nombre)+'»</b><span class="peso">'+res.pags+' página'+(res.pags===1?'':'s')+' · <b style="display:inline;color:inherit;font-size:inherit">'+esc(_dcPeso(res.blob.size))+'</b> · '+
      res.hechos.length+' documento'+(res.hechos.length===1?'':'s')+(res.indice ? ' y el índice' : '')+
      (achico ? '. Los originales sumaban '+esc(_dcPeso(res.total))+'.' : '.')+'</span>'+
      '<div class="pdfv" id="arc-u-ver" aria-label="Vista previa del PDF unido"></div>'+
      '<div class="acc"><button type="button" class="bt chico" id="arc-u-bajar">⬇ Descargar el PDF</button>'+
      (D.h ? '<button type="button" class="bt sec chico" id="arc-u-guardar">Guardar en «'+esc(D.t)+'»</button>' : '')+'</div>'+
      '<p class="arc-mv-nota" id="arc-u-estado" style="margin:8px 0 0"></p></div>';
  if(res.fallos.length) h+='<div class="aviso ojo"><b>No entraron '+res.fallos.length+':</b> '+res.fallos.map(function(x){ return '«'+esc(x.n)+'» ('+esc(x.por)+')'; }).join(', ')+'.</div>';
  if(orig.length){
    h+='<div class="arc-limpia" id="arc-u-limpia"><h3>¿Y '+(orig.length===1 ? 'el documento que uniste' : 'los '+orig.length+' documentos que uniste')+'?</h3>'+
      '<p>'+(orig.length===1 ? 'Pesa ' : 'Pesan ')+esc(_dcPeso(pesanOrig))+' del espacio de tu plan, y ya '+(orig.length===1 ? 'está' : 'están')+' dentro del PDF unido.</p>'+
      '<label class="arc-op" for="arc-u-l-dejar"><input type="radio" name="arc-u-l" id="arc-u-l-dejar" value="dejar" checked><span><b>Dejarlos</b> en sus carpetas</span></label>'+
      '<label class="arc-op" for="arc-u-l-quitar"><input type="radio" name="arc-u-l" id="arc-u-l-quitar" value="quitar"><span><b>Quitarlos</b> y liberar su espacio</span></label>'+
      '<label class="arc-op" for="arc-u-l-zip"><input type="radio" name="arc-u-l" id="arc-u-l-zip" value="zip"><span><b>Bajarlos en un ZIP</b> a esta computadora y después quitarlos</span></label>'+
      '<p class="arc-mv-nota">Se quitan aquí y en la app de todo el equipo. No se puede deshacer.</p>'+
      '<div class="acc"><button type="button" class="bt sec chico" id="arc-u-aplicar">Aplicar</button></div><div class="msg" id="arc-u-l-msg"></div></div>';
  }
  $('arc-u-cuerpo').innerHTML=h;
  try{ pdfVistaP($('arc-u-ver'), res.blob, { max:60 }); }catch(_v){ $('arc-u-ver').innerHTML='<div class="pdfv-msg">La vista previa no está disponible aquí: descárgalo para verlo.</div>'; }
  var estado=function(){
    var e=$('arc-u-estado'); if(!e) return;
    var q=[];
    if(U.bajado) q.push('Ya se descargó como «'+nombreA+'».');
    if(U.guardado==='ok') q.push('Quedó también en «'+D.t+'»: ya sale en la app.');
    else if(U.guardado==='grande') q.push('Pesa más de 25 MB (el tope por archivo de la obra): no se puede guardar en «'+D.t+'». Descárgalo, o prueba con «Muy liviano».');
    else if(U.guardado==='yendo') q.push('Guardándolo en «'+D.t+'»…');
    else if(U.guardado) q.push('No se pudo guardar en «'+D.t+'»: '+U.guardado);
    if(!q.length) q.push(D.h ? 'Revísalo arriba. Descárgalo, guárdalo en «'+D.t+'», o las dos cosas.' : 'Revísalo arriba y descárgalo.');
    e.textContent=q.join(' ');
    var g=$('arc-u-guardar'); if(g){ g.disabled=(U.guardado==='ok' || U.guardado==='yendo' || U.guardado==='grande'); if(U.guardado==='ok') g.textContent='✓ Guardado en «'+D.t+'»'; }
    var ap=$('arc-u-aplicar'), lm=$('arc-u-l-msg'), aSalvo=(U.bajado || U.guardado==='ok');
    if(ap && !U.limpio){
      var r=(document.querySelector('input[name="arc-u-l"]:checked')||{}).value||'dejar';
      ap.disabled=(r==='quitar' && !aSalvo);
      if(lm){ lm.className=(r==='quitar' && !aSalvo) ? 'msg gris' : 'msg'; lm.textContent=(r==='quitar' && !aSalvo) ? 'Primero descarga el PDF unido o guárdalo en la obra: si no, al quitarlos te quedarías sin ellos.' : ''; }
    }
  };
  $('arc-u-bajar').onclick=function(){ bajarBlob(res.blob, nombreA); U.bajado=true; estado(); toast('Descargado: '+nombreA); };
  if($('arc-u-guardar')) $('arc-u-guardar').onclick=function(){
    if(res.blob.size>ARC_TOPE_GUARDAR){ U.guardado='grande'; estado(); return; }
    U.guardado='yendo'; estado();
    var file=new File([res.blob], nombreA, {type:'application/pdf'});
    subirArchivoP(D.h==='asistencia' ? 'asistencias' : 'docs', file).then(function(url){
      var nota=D.h==='asistencia' ? hoyISO()+'|'+(D.clase||'otro')+'|0|pdf'+res.pags+'|' : 'Unión de '+res.hechos.length+' documento'+(res.hechos.length===1?'':'s')+' · '+res.pags+' página'+(res.pags===1?'':'s');
      return sbPostP('sst_doc', {empresa:YO.obra.id, hoja:D.h, nombre:U.nombre, url:url, nota:nota}).then(function(rows){
        if(Array.isArray(rows) && !rows.length) return Promise.reject('sin_fila');
        return D.nuevo ? dcSubcAgregar([D.nuevo]).catch(function(){ return false; }) : true;
      });
    }).then(function(){
      U.guardado='ok'; estado(); ARC.sel=[]; toast('PDF unido: quedó en «'+D.t+'»');
      if(VISTA.recargar) VISTA.recargar(true);
    }, function(e){ U.guardado=(e==='sin_fila' || e===401 || e===403) ? 'esta cuenta no puede guardar en esta obra.' : (e==='muy-grande' ? 'pesa más de 25 MB.' : 'revisa tu conexión.'); estado(); });
  };
  Array.prototype.forEach.call(document.querySelectorAll('input[name="arc-u-l"]'), function(r){ r.onchange=estado; });
  if($('arc-u-aplicar')) $('arc-u-aplicar').onclick=function(){
    var b=this, r=(document.querySelector('input[name="arc-u-l"]:checked')||{}).value||'dejar', m=$('arc-u-l-msg');
    if(r==='dejar'){ U.limpio='dejar'; b.disabled=true; m.className='msg'; m.textContent='Se quedan en sus carpetas.'; return; }
    var quitar=function(L){
      m.className='msg gris'; m.textContent='Quitándolos…';
      return _arcBorrarFilas(L).then(function(x){
        U.limpio=r; arcPintar();
        var lib=x.libres || {};
        m.className=x.mal ? 'msg mal' : 'msg ok';
        m.textContent=(x.n ? 'Listo: '+(x.n===1 ? 'se quitó 1 documento' : 'se quitaron '+x.n+' documentos')+(lib.n ? ' y se liberó su espacio.' : '.') : 'No se quitó ninguno.')+
          (x.mal ? ' '+x.mal+' no se '+(x.mal===1 ? 'pudo' : 'pudieron')+' quitar: revisa tu conexión o tu permiso en esta obra.' : '')+
          (lib.pedidos && lib.n<lib.pedidos ? ' Algunos archivos no se pudieron borrar del almacenamiento.' : '');
        Array.prototype.forEach.call(document.querySelectorAll('input[name="arc-u-l"]'), function(x2){ x2.disabled=true; });
        if(x.n && VISTA.recargar) VISTA.recargar(true);
      });
    };
    var L=orig.filter(function(f){ return arcFila(f.id); });
    if(!L.length){ m.className='msg'; m.textContent='Ya no están en la obra.'; return; }
    if(r==='quitar'){
      if(!(U.bajado || U.guardado==='ok')){ estado(); return; }
      confirmar('¿Quitar '+(L.length===1 ? 'el documento unido' : 'los '+L.length+' documentos unidos')+'?', 'Salen de sus carpetas, aquí y en la app de todo el equipo, y se libera su espacio. El PDF unido los tiene a todos. No se puede deshacer.', {si:'Sí, quitarlos', mal:true}).then(function(si){
        if(!si) return; b.disabled=true; quitar(L);
      });
      return;
    }
    /* el ZIP primero; se quitan solo los que entraron en él */
    b.disabled=true; m.className='msg gris'; m.textContent='Armando el ZIP…';
    _arcZipDe(L, function(i, n){ m.textContent='Armando el ZIP '+i+' de '+n+'…'; }).then(function(z){
      if(!z.n){ b.disabled=false; m.className='msg mal'; m.textContent='No se pudo bajar ninguno: no se quitó nada. Revisa tu conexión.'; return; }
      bajarBlob(z.blob, _arcNombreZip());
      var van=L.filter(function(f){ return z.ids[String(f.id)]; });
      m.className='msg'; m.textContent='Se descargó el ZIP con '+z.n+' documento'+(z.n===1?'':'s')+(z.fallos.length ? ' ('+z.fallos.length+' no se pudieron bajar: esos se quedan)' : '')+'.';
      confirmar('¿Ya está el ZIP en tu computadora?', 'Revisa que se haya descargado («'+_arcNombreZip()+'»). Después se quitan de la obra '+(van.length===1 ? 'el documento' : 'los '+van.length+' documentos')+' que van en él, y se libera su espacio.', {si:'Sí, quitarlos', no:'Todavía no', mal:true}).then(function(si){
        if(!si){ b.disabled=false; m.className='msg'; m.textContent='No se quitó nada. Cuando quieras, vuelve a tocar «Aplicar».'; return; }
        quitar(van);
      });
    });
  };
  $('arc-u-volver').onclick=function(){
    if(U.guardado==='yendo') return;
    U.hecho=null; U.corriendo=false; U.cancelar=false;
    var p=$('hoja-pie'); if(p) p.innerHTML=_arcUnirPieForm();
    try{ pdfVistaCerrar(); }catch(_c){}
    _arcUnirForm();
  };
  $('arc-u-cerrar').onclick=function(){
    var fin=function(){ try{ pdfVistaCerrar(); }catch(_c){} cerrarHoja(); ARC.unir=null; ARC.sel=[]; arcPintar(); };
    if(U.bajado || U.guardado==='ok') return fin();
    confirmar('¿Cerrar sin descargar el PDF unido?', 'Todavía no lo descargaste ni lo guardaste en la obra: si cierras, se pierde y hay que volver a unirlo.', {si:'Cerrar igual', no:'Volver', mal:true}).then(function(si){ if(si) fin(); });
  };
  estado();
}

/* ═══ SUBIR ESCANEOS DESDE LA COMPUTADORA (09/10/2026) ═══════════════════════════════════════════════════
   En la pestaña «Escaneos y fotos»: los PDF o las fotos de hojas escaneadas en la computadora (o con otro escáner) van al
   mismo lugar que los de la app: hoja «asistencia», con su tipo y su fecha en la nota (fecha|clase|firmas[|pdfN|]), en la
   carpeta «asistencias» del balde. Salen aquí y en «Escaneos» de la app, en su tipo. */
function arcSubirEscaneos(files){
  var L=[], malos=[];
  Array.prototype.forEach.call(files||[], function(f){
    var pdf=/pdf/i.test(f.type||'') || /\.pdf$/i.test(f.name||''), img=/^image\/(jpeg|png)$/i.test(f.type||'') || /\.(jpe?g|png)$/i.test(f.name||'');
    if(!pdf && !img){ malos.push('«'+f.name+'» (no es PDF ni foto)'); return; }
    if(!(f.size>0)){ malos.push('«'+f.name+'» (está vacío)'); return; }
    if(f.size>ARC_TOPE_GUARDAR){ malos.push('«'+f.name+'» (pasa de 25 MB)'); return; }
    L.push({ f:f, pdf:pdf, n:String(f.name||'Escaneo').replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || 'Escaneo' });
  });
  if(!L.length){ toast(malos.length ? 'No entran: '+malos.join(', ') : 'Elige PDF o fotos.'); return; }
  var cuerpo='<p class="ayuda" style="margin:0 0 12px">Quedan en «Escaneos», en el tipo que elijas: aquí y en la app de todo el equipo.'+
      (ARC.cfg.escaneos ? '' : ' <b>Ojo:</b> hoy los escaneos no se muestran en la web (lo decidió el líder); en la app sí.')+'</p>'+
    '<div class="dos"><div class="campo"><label for="arc-se-clase">Tipo</label><select id="arc-se-clase">'+ARC_CLASES.map(function(c){ return '<option value="'+c[0]+'">'+esc(c[1])+'</option>'; }).join('')+'</select></div>'+
      '<div class="campo"><label for="arc-se-fecha">Fecha de la hoja</label><input type="date" id="arc-se-fecha" value="'+hoyISO()+'" max="'+hoyISO()+'"></div></div>'+
    '<ul class="arc-se-lista" aria-label="Los archivos">'+L.map(function(x, i){
      return '<li><span class="arc-tipo '+(x.pdf ? 'pdf' : 'img')+'">'+(x.pdf ? 'PDF' : 'JPG')+'</span><input type="text" id="arc-se-n-'+i+'" maxlength="120" value="'+esc(x.n)+'" aria-label="Nombre"><small>'+esc(_dcPeso(x.f.size))+'</small></li>'; }).join('')+'</ul>'+
    (malos.length ? '<p class="arc-u-no">No entran: '+malos.map(esc).join(', ')+'.</p>' : '')+
    '<div id="arc-se-prog" hidden><div class="arc-prog"><i id="arc-se-barra"></i></div><div class="arc-prog-t" id="arc-se-t"></div></div><div class="msg" id="arc-se-msg"></div>';
  abrirHoja(L.length===1 ? 'Subir un escaneo' : 'Subir '+L.length+' escaneos', 'Desde tu computadora', cuerpo,
    '<button type="button" class="bt sec" id="arc-se-no">Cancelar</button><button type="button" class="bt" id="arc-se-si">Subir</button>', {sinFoco:true});
  $('arc-se-no').onclick=cerrarHoja;
  $('arc-se-si').onclick=function(){
    var b=this, m=$('arc-se-msg'), clase=$('arc-se-clase').value, fecha=$('arc-se-fecha').value||hoyISO();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha>hoyISO()){ m.className='msg mal'; m.textContent='Revisa la fecha: no puede ser posterior a hoy.'; return; }
    L.forEach(function(x, i){ var v=String(($('arc-se-n-'+i)||{}).value||'').replace(/\s+/g, ' ').trim(); x.n=(v.length>=3 ? v : x.n).slice(0, 120); });
    b.disabled=true; $('arc-se-no').disabled=true; $('arc-se-prog').hidden=false; m.className='msg'; m.textContent='';
    Array.prototype.forEach.call($('hoja-cuerpo').querySelectorAll('input, select'), function(x){ x.disabled=true; });
    var ok=0, mal=[];
    /* las páginas de un PDF (para la nota «pdfN»): con pdf-lib, si carga; si no, sin el número */
    var paginas=function(x){
      if(!x.pdf) return Promise.resolve(0);
      return cargarPdfLib().then(function(P){ return x.f.arrayBuffer().then(function(ab){ return P.PDFDocument.load(new Uint8Array(ab), { ignoreEncryption:true, updateMetadata:false }); }).then(function(d){ return d.getPageCount(); }); }).catch(function(){ return 0; });
    };
    L.reduce(function(cad, x, i){
      return cad.then(function(){
        $('arc-se-barra').style.width=Math.round(100*i/L.length)+'%'; $('arc-se-t').textContent='Subiendo '+(i+1)+' de '+L.length+' · «'+x.n+'»';
        return paginas(x).then(function(np){
          return subirArchivoP('asistencias', x.f).then(function(url){
            var nota=fecha+'|'+clase+'|0'+(x.pdf ? '|pdf'+(np||'')+'|' : '');
            return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'asistencia', nombre:x.n, url:url, nota:nota }).then(function(rows){
              if(Array.isArray(rows) && !rows.length) return Promise.reject('sin_fila'); ok++;
            });
          });
        }).catch(function(e){ mal.push('«'+x.n+'» ('+(e==='muy-grande' ? 'pasa de 25 MB' : (e==='sin_fila' || e===401 || e===403 ? 'esta cuenta no puede subir en esta obra' : 'revisa tu conexión'))+')'); });
      });
    }, Promise.resolve()).then(function(){
      $('arc-se-barra').style.width='100%';
      if(ok){ ARC.carpeta='esc:'+clase; if(VISTA.recargar) VISTA.recargar(true); }
      if(!mal.length){ cerrarHoja(); toast(ok===1 ? 'Subido a «Escaneos · '+_arcClaseEt(clase)+'»' : ok+' escaneos subidos a «'+_arcClaseEt(clase)+'»'); return; }
      $('arc-se-t').textContent=''; m.className='msg mal'; m.textContent=(ok ? 'Se subieron '+ok+'. ' : '')+'No se pudieron: '+mal.join(', ')+'.';
      $('arc-se-no').disabled=false; $('arc-se-no').textContent='Cerrar';
    });
  };
}
