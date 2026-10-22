/* ═══ EL INFORME DEL MES, PARA LA GERENCIA O EL CLIENTE (09/10/2026) ═══════════════════════════════════════════════
   Marcelo: «hay que tener la opción que tendrán los planes Prevencionista, Supervisor SST, SSOMA y Gestión SST, para armar
   su informe para presentar a su gerencia o cliente, y si su cliente usa Central o el otro plan, es de acuerdo a lo que
   pidan ellos: el orden, los archivos y todo ello».
   · Se elige el mes, para quién es y qué va, en qué orden. Los datos salen solos de lo registrado ese mes, y se le suman
     los documentos que se elijan del archivo de la obra (PDF o fotos), en el orden que se quiera.
   · Sale un solo PDF, con portada, el índice y las páginas numeradas; se ve antes de bajarlo, y se puede guardar en el
     archivo de la obra (carpeta «Informes del mes»).
   · Lo que va se guarda como el MODELO de la obra (sst_doc, hoja «informe-modelo»): el mes siguiente sale igual.
   17/10/2026 · lote 17 · EL INFORME DE CADA PLAN: cada parte va desde el plan que trae lo suyo (las inspecciones y el
   consumo de cada EPP, desde Supervisor SST; el uso correcto en campo y el costo, desde SSOMA) y la que el plan no trae se
   ve con su candado; Central y Corporativo traen todo. Las charlas por tipo con sus horas hombre de capacitación, los ATS
   con su cierre y el panel fotográfico (opcional).
   19/10/2026 · lote 18 · Marcelo: «Mejora el sistema de informes, quiero que sea fácil de usar y determinar, tanto para los
   supervisores como los de central y corporativo, que sea más ordenado, entendible, sin complicaciones, ajustado». Y «en el
   informe debe de salir los temas que has tratado durante el mes, con su fecha, cantidad de personas, y duración y sumarlas
   por tipo de charla, luego el total (puede ser en Excel o Word, el supervisor elige también si aparece desglosado o no)»;
   obreros y staff en las horas hombre trabajadas y de capacitación; y «Gestión y corporativo sí, todas las obras».
   · Tres niveles listos —Básico, Intermedio y Completo—: un toque y sale. «Personalizar» queda guardado para quien quiera
     mover una parte o sumar anexos.
   · Los temas del mes: uno por uno (fecha, tema, personas, duración, HHC; el total de cada tipo y el del mes) o solo el
     total por tipo de charla.
   · Tres formatos: el PDF para presentar, el Excel con los datos (una hoja por parte) y el Word de los temas del mes.
   · «Todas mis obras» (desde Gestión SST, y Central / Corporativo): una fila por obra y el total, en cada parte.
   20/10/2026 · lote 23 · Marcelo: «quiero que sea una sección aparte que se llame informe, se abra y se tenga de SST,
   Medio Ambiente y Salud Ocupacional … y esté enlazada con la app». El área «Informe» del portal: el de SST, el de medio
   ambiente y el de salud ocupacional, cada uno en su pestaña (informe · inf-amb · inf-salud) con lo que pide arriba (la
   misma lista de la app, INFB) y dónde se completa; y el registro fotográfico al lado. */
var INFW = { caja:null, mes:'', para:'gerencia', paraN:'', por:'', secc:null, anexos:[], modelo:null, datos:null, datosT:null, n:0, pdf:null, armando:false,
             nivel:'intermedio', temas:'desglose', alcance:'obra', pers:false, tipo:'sst', seccA:null, seccS:null };
var INF_SECC = [
  { k:'portada',      n:'Portada e índice',               d:'La obra, la empresa, el mes, para quién es y lo que trae', fijo:'primero' },
  { k:'resumen',      n:'Resumen del mes',                d:'Personal activo, horas hombre de obreros y staff (trabajadas y de capacitación) del mes y acumuladas en el año, accidentes e incidentes y los índices del año' },
  /* 19/10/2026 · lote 19 · el personal, las horas del año, los programas y los objetivos */
  { k:'personal',     n:'Personal de la obra',            d:'Cuántos hay en obra al cierre del mes, los que ingresaron, los cesados, los trasladados y los de descanso, por empresa; y la relación del personal' },
  { k:'hhanio',       n:'Horas hombre del año',           d:'Mes a mes, las trabajadas y las de capacitación de obreros y staff, con lo acumulado en el año y sus gráficos' },
  { k:'programas',    n:'Avance de los programas del año', d:'El anual de SST y los de capacitación, inspecciones, simulacros, campañas, monitoreo ocupacional y auditorías: lo programado al mes, lo ejecutado y el cumplimiento, con sus gráficos' },
  { k:'objetivos',    n:'Objetivos y metas',              d:'Cada objetivo del año con su meta, su indicador y su avance al cierre del mes' },
  { k:'charlas',      n:'Charlas y capacitaciones',       d:'Por tipo de charla, con sus personas, su duración y sus horas hombre de capacitación; y los temas del mes, uno por uno o solo el total' },
  { k:'capacitacion', n:'Evaluaciones de capacitación',   d:'Las evaluaciones del mes: cuántas, cuántas aprobadas y de qué temas', vit:'constancias' },
  { k:'ats',          n:'ATS del mes',                    d:'Cuántos se hicieron, cuántos se cerraron con la firma de salida y la foto, y los que quedaron sin cierre' },
  { k:'reportes',     n:'Observaciones: actos, condiciones, sugerencias y buenas prácticas', d:'Lo del mes por tipo, de dónde salió (inspecciones, reportes de los trabajadores, el cliente…), por categoría, por empresa y por frente, y cuánto se levantó' },
  { k:'obstabla',     n:'Tabla de observaciones',         d:'Cada acto y cada condición del mes: fecha, empresas, frente, lo que se vio con su foto, origen, tipo, categoría, el plan de acción o el levantamiento con su foto y la fecha de cumplimiento (en hojas horizontales)' },
  { k:'bird',         n:'Pirámide de Bird',               d:'Los accidentes, los incidentes y las observaciones del mes y del año, en la pirámide' },
  { k:'inspecciones', n:'Inspecciones',                   d:'Las del mes por tipo, y lo que encontraron: actos, condiciones, sugerencias y buenas prácticas', vit:'inspec' },
  { k:'epp',          n:'Entrega y consumo de EPP',       d:'Las entregas del mes y lo que más salió; desde Supervisor SST, el consumo de cada EPP (nuevas, por cambio y por pérdida); desde SSOMA, el uso correcto en campo y lo que costó' },
  { k:'sctr',         n:'SCTR',                           d:'Las constancias vigentes y quién está en obra sin cobertura completa' },
  /* 17/10/2026 · lote 16 · el acta del mes va sola a los anexos: las de OBRASST, armadas como en la app; las escaneadas, tal cual */
  { k:'comite',       n:'Comité de SST',                  d:'Las reuniones del mes con su quórum y sus acuerdos, lo pendiente y la próxima reunión; el acta del mes va sola en los anexos', vit:'comite' },
  { k:'fotoreg',      n:'Registro fotográfico',           d:'Las fotos del mes tema por tema —charlas, uso de EPP, sistema de emergencia, bienestar…—, del «Registro fotográfico» de la obra' },
  { k:'riesgo',       n:'Riesgo del mes',                 d:'La probabilidad de un accidente con descanso en los 30 días siguientes, con su rango, y la pirámide de los últimos 12 meses', apagado:true },
  { k:'fotos',        n:'Panel fotográfico de los registros', d:'Las fotos del mes con su leyenda: los reportes (cómo se encontró y cómo quedó), las buenas prácticas y el cierre de los ATS', apagado:true },
  { k:'anexos',       n:'Anexos',                         d:'Los documentos que elijas del archivo de la obra', fijo:'ultimo' }
];
/* 19/10/2026 · lote 18 · los tres niveles: qué partes van (la portada y los anexos, siempre) y cómo salen los temas */
var INF_NIVELES = [
  { k:'basico', n:'Básico', pag:'4 a 7 páginas', pagT:'4 a 8 páginas',
    d:'Lo esencial: las horas hombre de obreros y staff (del mes y del año), el personal, las charlas por tipo, los ATS, las observaciones por tipo y la entrega de EPP.',
    dT:'Una fila por obra y el total: personal, horas hombre de obreros y staff, accidentes e índices, charlas, ATS y observaciones.',
    secc:['resumen', 'personal', 'charlas', 'ats', 'reportes', 'epp'], todas:['resumen', 'hh', 'personal', 'charlas', 'ats', 'reportes'], temas:'total' },
  { k:'intermedio', n:'Intermedio', pag:'10 a 20 páginas', pagT:'8 a 14 páginas',
    d:'Lo de cada mes: además, las horas del año mes a mes, el avance de los programas y de los objetivos, los temas uno por uno, la tabla de observaciones con sus fotos, la pirámide de Bird, las inspecciones, el consumo de EPP, el SCTR, el comité y el registro fotográfico.',
    dT:'Además, por obra: los temas del mes, las inspecciones, el EPP y el comité.',
    secc:['resumen', 'personal', 'hhanio', 'programas', 'objetivos', 'charlas', 'capacitacion', 'ats', 'reportes', 'obstabla', 'bird', 'inspecciones', 'epp', 'sctr', 'comite', 'fotoreg'],
    todas:['resumen', 'hh', 'personal', 'charlas', 'temas', 'ats', 'reportes', 'inspecciones', 'epp', 'comite'], temas:'desglose' },
  { k:'completo', n:'Completo', pag:'20 páginas o más', pagT:'una página más por obra',
    d:'Todo, cada parte en su hoja: además, la relación del personal uno por uno, el riesgo del mes, el panel fotográfico de los registros y los documentos que elijas como anexos.',
    dT:'Todo: además, una página por obra con su resumen.',
    secc:['resumen', 'personal', 'hhanio', 'programas', 'objetivos', 'charlas', 'capacitacion', 'ats', 'reportes', 'obstabla', 'bird', 'inspecciones', 'epp', 'sctr', 'comite', 'fotoreg', 'riesgo', 'fotos'],
    todas:['resumen', 'hh', 'personal', 'charlas', 'temas', 'ats', 'reportes', 'inspecciones', 'epp', 'comite', 'fichas'], temas:'desglose' }
];
var INF_TODAS_N = { resumen:'Resumen de las obras', hh:'Horas hombre de obreros y staff', personal:'El personal de cada obra', charlas:'Charlas y capacitaciones', temas:'Los temas del mes', ats:'ATS del mes',
  reportes:'Observaciones: actos, condiciones, sugerencias y buenas prácticas', inspecciones:'Inspecciones', epp:'Entrega y consumo de EPP', comite:'Comité de SST', fichas:'Cada obra' };
function _infNivelDe(k){ for(var i=0;i<INF_NIVELES.length;i++) if(INF_NIVELES[i].k===k) return INF_NIVELES[i]; return null; }
/* el informe de cada plan: cada parte va desde el plan que trae lo suyo (la llave de la vitrina, `vit`); la que el plan no
   trae se ve con su candado y no entra en el PDF. Central y Corporativo traen todo (planWebTrae). */
function _infBloq(k){
  var s=_infSeccN(k);
  if(!s || !s.vit || typeof planWebTrae!=='function' || planWebTrae(s.vit)) return null;
  var x=(typeof INI_VITRINA==='object') ? INI_VITRINA.filter(function(v){ return v.k===s.vit; })[0] : null;
  var P=(x && typeof planWebPlan==='function') ? planWebPlan(x.desde) : null;
  return { plan:P ? P.n : '' };
}
function _infVa(x){ return !!(x && x.on && !_infBloq(x.k)); }
/* los tipos de asistencia de la app (ASIS_TIPOS, con sus minutos de costumbre) */
var INF_ASIS_TIPOS = { charla:'Charla de inicio de jornada', difusion:'Difusión', capacitacion:'Capacitación', retro:'Retroalimentación', sensibilizacion:'Sensibilización',
  taller:'Taller', entrenamiento:'Entrenamiento', simulacro:'Simulacro de emergencia', reunion:'Reunión semanal', parada:'Parada de seguridad', induccion:'Inducción', otra:'Otro' };
var INF_ASIS_MIN = { charla:10, difusion:15, capacitacion:60, retro:15, sensibilizacion:15, taller:60, entrenamiento:60, simulacro:30, reunion:30, parada:15, induccion:60, otra:30 };
var INF_ATS_EST = [['cerrado', 'Cerrados: firmaron la salida, con la foto'], ['porcerrar', 'Sin cierre: falta la firma de salida o la foto'], ['vigente', 'Liberados, en curso'],
  ['liberado', 'Esperando el V°B° del SSOMA'], ['enviado', 'Esperando al ingeniero'], ['firmado', 'Firmados por la cuadrilla'], ['observado', 'Devueltos con observación'], ['borrador', 'En borrador']];
/* 1: accidente (con lesión: leve, incapacitante, mortal) · 2: incidente (casi accidente, primeros auxilios, daño a la propiedad) */
var INF_ACC = { leve:1, incap:1, mortal:1, casi:2, primeros:2, dano:2 };
function _infAccSub(a){ return (a.inc ? a.inc+(a.inc===1 ? ' incidente' : ' incidentes')+' · ' : '')+a.anio+' en el año'; }
var INF_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
function _infMesN(ym){ return INF_MESES[(+String(ym).slice(5, 7) || 1)-1]+' '+String(ym).slice(0, 4); }
function _infMesMay(ym){ var s=_infMesN(ym); return s.charAt(0).toUpperCase()+s.slice(1); }
function _infMesFin(ym){ var y=+ym.slice(0, 4), m=+ym.slice(5, 7); return ym+'-'+dos(new Date(Date.UTC(y, m, 0)).getUTCDate()); }
function _infMesSig(ym){ var y=+ym.slice(0, 4), m=+ym.slice(5, 7)+1; if(m>12){ m=1; y++; } return y+'-'+dos(m); }
function _infSeccN(k){ for(var i=0;i<INF_SECC.length;i++) if(INF_SECC[i].k===k) return INF_SECC[i]; return null; }
function _infMeses(){ var o=[], d=new Date(); d.setDate(1); for(var i=0;i<12;i++){ o.push(d.getFullYear()+'-'+dos(d.getMonth()+1)); d.setMonth(d.getMonth()-1); } return o; }
function _infNum(n){ n=Math.round(+n||0); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function _infDec2(n, dec){ if(n===null || n===undefined || !isFinite(n)) return '—'; dec=(dec==null) ? 2 : dec; var s=(+n).toFixed(dec).split('.'); return _infNum(+s[0])+(s[1] ? ','+s[1] : ''); }
function _infDec(n){ n=Math.round((+n||0)*10)/10; var e=Math.floor(n), d=Math.round((n-e)*10); return _infNum(e)+(d ? ','+d : ''); }
function _infPct(a, b){ return b ? _infDec(a*100/b)+' %' : '—'; }
function _infMin(m){ return _infNum(m)+' min'; }
function _infFechaC(iso){ var p=String(iso||'').split('-'); return p.length===3 ? p[2]+'/'+p[1]+'/'+p[0] : String(iso||''); }
function _infCss(){
  _infCss23();
  if(document.getElementById('inf-css')) return;
  var s=document.createElement('style'); s.id='inf-css';
  s.textContent=[
    '.inf-intro{margin:0 0 14px;color:var(--gris);font-size:14px;line-height:1.55;max-width:72ch}',
    '.inf-alc{margin:0 0 12px}',
    '.inf-paso{margin:0 0 14px}.inf-paso h3{display:flex;align-items:center;gap:9px;margin:0 0 12px;font-size:15.5px;color:var(--tinta)}',
    '.inf-n{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--tinta);color:#fff;font-size:13px;font-weight:700;flex:0 0 auto}',
    '.inf-campos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 16px}.inf-campos .campo{margin:0 0 10px}',
    '@media (max-width:760px){.inf-campos{grid-template-columns:minmax(0,1fr)}}',
    '.inf-para{display:flex;gap:8px;flex-wrap:wrap}.inf-para button{padding:8px 14px;border-radius:999px;border:1px solid var(--raya);background:none;font:inherit;cursor:pointer;color:var(--tinta)}',
    '.inf-para button.on{background:var(--tinta);border-color:var(--tinta);color:#fff}',
    '.inf-niv{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}@media (max-width:860px){.inf-niv{grid-template-columns:minmax(0,1fr)}}',
    '.inf-niv-op{display:flex;flex-direction:column;align-items:flex-start;gap:5px;text-align:left;padding:14px 15px;border:1.5px solid var(--raya);border-radius:12px;background:var(--panel);cursor:pointer;font:inherit;color:var(--tinta)}',
    '.inf-niv-op b{font-size:16px}.inf-niv-op .pag{font-size:12px;font-weight:600;color:var(--azul,#12506B);background:var(--fondo);border-radius:999px;padding:2px 9px}',
    '.inf-niv-op small{font-size:13px;line-height:1.45;color:var(--gris)}.inf-niv-op.on{border-color:var(--tinta);box-shadow:inset 0 0 0 1px var(--tinta);background:var(--fondo)}',
    '.inf-niv-op .inf-bq{color:var(--tinta);font-weight:600;font-size:12.5px}',
    '.inf-temas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}@media (max-width:760px){.inf-temas{grid-template-columns:minmax(0,1fr)}}',
    '.inf-tem-op{display:flex;flex-direction:column;gap:4px;text-align:left;padding:12px 14px;border:1.5px solid var(--raya);border-radius:12px;background:var(--panel);cursor:pointer;font:inherit;color:var(--tinta)}',
    '.inf-tem-op b{font-size:14.5px}.inf-tem-op small{font-size:12.5px;line-height:1.45;color:var(--gris)}.inf-tem-op.on{border-color:var(--tinta);box-shadow:inset 0 0 0 1px var(--tinta);background:var(--fondo)}',
    '.inf-armar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:4px 0 18px}.inf-armar .bt{font-size:15px;padding:11px 22px}.inf-armar span{color:var(--gris);font-size:13px;flex:1 1 260px}',
    '.inf-pers{border:1px solid var(--raya);border-radius:12px;background:var(--panel);margin:0 0 14px}.inf-pers>summary{cursor:pointer;padding:13px 15px;font-weight:600;color:var(--tinta);list-style:revert}',
    '.inf-pers[open]>summary{border-bottom:1px solid var(--raya)}.inf-pers .inf-pers-c{padding:14px 15px}',
    '.inf-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;align-items:start} @media (max-width:980px){ .inf-grid{grid-template-columns:minmax(0,1fr)} }',
    '.inf-sec{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--raya);border-radius:10px;background:var(--panel);margin:0 0 8px}',
    '.inf-sec.off{opacity:.55} .inf-sec .inf-bq{color:var(--tinta);font-weight:600;margin-top:2px} .inf-sec input{width:auto;margin:0} .inf-sec .tx{flex:1;min-width:0} .inf-sec .tx b{display:block;font-size:14px} .inf-sec .tx small{display:block;color:var(--gris);font-size:12.5px;line-height:1.4}',
    '.inf-sec .mov{display:flex;gap:4px} .inf-sec .mov button{border:1px solid var(--raya);background:none;border-radius:7px;width:30px;height:30px;cursor:pointer;font:inherit;color:var(--tinta)}',
    '.inf-sec .mov button:disabled{opacity:.3;cursor:default} .inf-sec .n{font:600 12px var(--mono);color:var(--gris);width:18px;text-align:right}',
    '.inf-anx{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--raya);font-size:13.5px} .inf-anx:last-child{border-bottom:0}',
    '.inf-anx .tx{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .inf-anx button{border:1px solid var(--raya);background:none;border-radius:7px;min-width:28px;height:28px;cursor:pointer;color:var(--tinta)}',
    '.inf-vista{width:100%;height:68vh;border:1px solid var(--raya);border-radius:10px;background:#fff}',
    '.inf-formatos{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 10px}',
    /* 19/10/2026 · lote 19 · las versiones */
    '.inf-vers{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:14px 0 0;padding-top:12px;border-top:1px solid var(--raya)}',
    '.inf-vers-t{font-size:13px;color:var(--gris);font-weight:600;margin-right:2px}',
    '.inf-ver{padding:6px 13px;border-radius:999px;border:1px solid var(--raya);background:var(--panel);font:inherit;font-size:13px;cursor:pointer;color:var(--tinta)}',
    '.inf-ver.on{background:var(--tinta);color:#fff;border-color:var(--tinta)}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ── las obras de la empresa (la principal y las que cuelgan de ella), para «Todas mis obras» ── */
function _infObras(){
  var r=(typeof obrasRaizP==='function') ? obrasRaizP() : null;
  if(!r) return YO.obra ? [YO.obra] : [];
  return [r].concat((YO.empresas||[]).filter(function(e){ return String(e.padre_id||'')===String(r.id); }));
}
function _infTodasPuede(){
  if(!YO || !YO.obra || _infObras().length<2) return false;
  return !!YO.central || typeof planWebTrae!=='function' || planWebTrae('resumen');
}
function _infObraN(o){
  if(!o) return 'Obra';
  if(!o.padre_id) return String(o.obra_nombre||'').trim() || (typeof nombreObraP==='function' ? nombreObraP(o) : '') || o.nombre || 'Obra principal';
  return (typeof nombreObraP==='function' ? nombreObraP(o) : '') || o.nombre || 'Obra';
}
function _infEmpresaN(){ var r=(typeof obrasRaizP==='function') ? obrasRaizP() : null; return (r && r.nombre) || (typeof empresaDeObraP==='function' ? empresaDeObraP() : '') || ''; }

/* ── el modelo de la obra: el nivel, los temas, lo que va y en qué orden (y para quién es, de costumbre) ── */
function _infModeloAplicar(m){
  var orden=[], visto={}, Nm=(m && m.v>=2) ? _infNivelDe(m.nivel) : null;
  (m && Array.isArray(m.secc) ? m.secc : []).forEach(function(x){ if(x && _infSeccN(x.k) && !visto[x.k]){ visto[x.k]=1; orden.push({ k:x.k, on:x.on!==false }); } });
  /* una parte nueva entra al final: según el nivel del modelo, si tiene uno; si no, prendida (las que vienen «apagadas», el
     riesgo y las fotos, las prende quien las quiera) */
  /* 19/10/2026 · lote 19 · y en su sitio: después de la parte que la precede en el informe (no al final) */
  var idx=function(k){ for(var q=0;q<INF_SECC.length;q++) if(INF_SECC[q].k===k) return q; return 99; };
  INF_SECC.forEach(function(s, si){
    if(visto[s.k]) return;
    var pos=0; for(var j=0;j<orden.length;j++) if(idx(orden[j].k)<si) pos=j+1;
    orden.splice(pos, 0, { k:s.k, on:Nm ? Nm.secc.indexOf(s.k)>-1 : !s.apagado }); visto[s.k]=1;
  });
  orden=orden.filter(function(x){ return x.k!=='portada' && x.k!=='anexos'; });
  INFW.secc=[{ k:'portada', on:true }].concat(orden, [{ k:'anexos', on:true }]);
  if(m && (m.para==='gerencia' || m.para==='cliente')) INFW.para=m.para;
  if(m && typeof m.paraN==='string') INFW.paraN=m.paraN;
  /* 19/10/2026 · lote 18 · el nivel y los temas; un modelo de antes es lo que la obra eligió, tal cual («personalizado») */
  if(m && m.v>=2){ INFW.nivel=_infNivelDe(m.nivel) ? m.nivel : 'propio'; INFW.temas=(m.temas==='total') ? 'total' : 'desglose'; }
  else if(m && Array.isArray(m.secc)){ INFW.nivel='propio'; INFW.temas='desglose'; }
  else _infNivelPoner('intermedio', true);
}
function _infNivelPoner(k, sinPintar){
  var N=_infNivelDe(k); if(!N) return;
  INFW.nivel=k; INFW.temas=N.temas;
  (INFW.secc||[]).forEach(function(x){ var s=_infSeccN(x.k); if(s && !s.fijo) x.on=N.secc.indexOf(x.k)>-1; });
  if(!sinPintar) _infPintar();
}
function infVista(caja){
  _infCss(); INFW.caja=caja;
  /* otra obra: su modelo y sus anexos, no los de la anterior */
  if(INFW.obra!==(YO.obra||{}).id){ INFW.obra=(YO.obra||{}).id; INFW.secc=null; INFW.anexos=[]; INFW.modelo=null; INFW.datos=null; INFW.datosT=null; INFW.paraN=''; INFW.para='gerencia'; INFW.alcance='obra'; INFW.seccA=null; INFW.seccS=null; INF_PIDE.k=''; }
  /* 20/10/2026 · lote 23 · cada informe es su pestaña: la que se abrió dice cuál */
  var tipoV=INF_VISTA_TIPO[VISTA.actual] || 'sst';
  /* lo que pide otra sección al abrir el informe (medio ambiente: «🌱 Informe de medio ambiente» con su mes); si es otro informe, a su pestaña */
  if(window.INFW_PIDE && typeof window.INFW_PIDE==='object'){
    var pide=window.INFW_PIDE; window.INFW_PIDE=null;
    if(/^\d{4}-\d{2}$/.test(String(pide.mes||''))) INFW.mes=pide.mes;
    if(INF_TIPO_VISTA[pide.tipo] && pide.tipo!==tipoV){ window.INFW_PIDE={ mes:pide.mes }; navegar(INF_TIPO_VISTA[pide.tipo]); return; }
  }
  if(INFW.tipo!==tipoV){ INFW.tipo=tipoV; INFW.pdf=null; }
  if(INFW.alcance==='todas' && !_infTodasPuede()) INFW.alcance='obra';
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(!INFW.mes){ var d=new Date(); d.setDate(1); d.setMonth(d.getMonth()-(new Date().getDate()<=10 ? 1 : 0)); INFW.mes=d.getFullYear()+'-'+dos(d.getMonth()+1); }
  if(!INFW.por) INFW.por=String(YO.nombre||'');
  /* los de medio ambiente y salud no tienen modelo guardado: se pintan ya */
  if(INFW.tipo!=='sst'){ _infPintar(); VISTA.recargar=function(){ _infPintar(); }; return; }
  cargando(caja);
  var n=++INFW.n;
  /* 19/10/2026 · lote 19 · Marcelo: «Has diferentes versiones de informes, editable como si fuera check list»: cada fila de
     «informe-modelo» es una versión con su nombre (el de antes es «Modelo de la obra»); se abre la última que se usó */
  sbGet('sst_doc?empresa=eq.'+_enc(YO.obra.id)+'&hoja=eq.informe-modelo&select=id,nombre,nota,creado&order=creado.desc&limit=20').catch(function(){ return []; }).then(function(r){
    if(n!==INFW.n || VISTA.actual!=='informe') return;
    INFW.versiones=(r||[]).map(function(x){ var m=null; try{ m=JSON.parse(x.nota); }catch(e){} return (m && typeof m==='object') ? { id:x.id, nombre:String(m.nombre || 'Modelo de la obra').slice(0, 80), m:m } : null; }).filter(Boolean);
    var ult=null; try{ ult=localStorage.getItem('sstp_inf_ver_'+YO.obra.id); }catch(e){}
    var V=INFW.versiones.filter(function(v){ return v.id===ult; })[0] || INFW.versiones[0] || null;
    INFW.modelo=V ? { id:V.id, m:V.m, nombre:V.nombre } : null;
    if(!INFW.secc) _infModeloAplicar(V ? V.m : null);
    _infPintar();
  });
  VISTA.recargar=function(){ _infPintar(); };
}
function _infPintar(){
  var caja=INFW.caja; if(!caja || !document.body.contains(caja)) return;
  var puedeT=_infTodasPuede(), todas=(INFW.alcance==='todas' && puedeT);
  var ac=$('acciones');
  if(ac){ ac.innerHTML='<button type="button" class="bt" id="inf-armar">Armar el informe ›</button>'; $('inf-armar').onclick=infArmar; }
  if(INFW.tipo==='amb'){ _infPintarAmb(); return; }
  if(INFW.tipo==='sal'){ _infPintarSal(); return; }
  var S=INFW.secc, nOn=S.filter(_infVa).length, h=_infTipoHTML();
  if(puedeT){
    h+='<div class="seg inf-alc" role="radiogroup" aria-label="De qué obras">'+
      '<button type="button" role="radio" aria-checked="'+(!todas)+'" class="'+(todas ? '' : 'on')+'" data-alc="obra">Esta obra</button>'+
      '<button type="button" role="radio" aria-checked="'+todas+'" class="'+(todas ? 'on' : '')+'" data-alc="todas">Todas mis obras · '+_infObras().length+'</button></div>';
  }
  h+='<p class="inf-intro" id="inf-que">'+(todas ? '📑 <b>El informe de todas tus obras.</b> Una fila por obra y el total, en cada parte. ' : '📑 <b>El informe del mes, para tu gerencia o tu cliente.</b> ')+
    'Elige el mes, para quién es y qué tan completo: los datos salen solos de lo registrado. Primero lo ves; después lo bajas en PDF, Excel o Word.</p>';
  /* 1 · el mes y para quién */
  h+='<div class="tarj inf-paso"><div class="tarj-cuerpo"><h3><span class="inf-n">1</span> El mes y para quién</h3><div class="inf-campos">'+
    '<div class="campo"><label for="inf-mes">Mes</label><select id="inf-mes">'+_infMeses().map(function(m){ return '<option value="'+m+'"'+(m===INFW.mes ? ' selected' : '')+'>'+esc(_infMesMay(m))+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label>Para</label><div class="inf-para" role="radiogroup" aria-label="Para quién es">'+
      [['gerencia', 'Mi gerencia'], ['cliente', 'Mi cliente']].map(function(o){ return '<button type="button" role="radio" aria-checked="'+(INFW.para===o[0])+'" class="'+(INFW.para===o[0] ? 'on' : '')+'" data-para="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div></div>'+
    '<div class="campo"><label for="inf-para-n">'+(INFW.para==='cliente' ? 'El cliente' : 'La gerencia o quien lo recibe')+' <span class="tenue">· si quieres</span></label><input id="inf-para-n" maxlength="100" value="'+esc(INFW.paraN)+'" placeholder="'+(INFW.para==='cliente' ? 'El nombre de tu cliente' : 'Gerencia de operaciones')+'"></div>'+
    '<div class="campo"><label for="inf-por">Elaborado por</label><input id="inf-por" maxlength="100" value="'+esc(INFW.por)+'"></div></div></div></div>';
  /* 2 · qué tan completo */
  h+='<div class="tarj inf-paso"><div class="tarj-cuerpo"><h3><span class="inf-n">2</span> Qué tan completo</h3><div class="inf-niv" role="radiogroup" aria-label="Qué tan completo">'+
    INF_NIVELES.map(function(N){
      var on=INFW.nivel===N.k, bq=todas ? [] : N.secc.filter(function(k){ return !!_infBloq(k); }).map(function(k){ return _infSeccN(k).n.toLowerCase(); });
      return '<button type="button" role="radio" aria-checked="'+on+'" class="inf-niv-op'+(on ? ' on' : '')+'" data-niv="'+N.k+'"><b>'+N.n+'</b><span class="pag">'+esc(todas ? N.pagT : N.pag)+'</span>'+
        '<small>'+esc(todas ? N.dT : N.d)+'</small>'+(bq.length ? '<small class="inf-bq">🔒 Tu plan no trae: '+esc(bq.join(', '))+'</small>' : '')+'</button>';
    }).join('')+'</div>'+
    (INFW.nivel==='propio' && !todas ? '<p class="ayuda" id="inf-propio" style="margin:10px 0 0">Ahora va <b>personalizado</b>: lo que marcaste en la lista. Toca un nivel para volver a uno de los tres.</p>' : '')+
    (todas ? '' : _infVersHTML())+'</div></div>';
  /* 3 · los temas del mes */
  h+='<div class="tarj inf-paso"><div class="tarj-cuerpo"><h3><span class="inf-n">3</span> Los temas del mes</h3><div class="inf-temas" role="radiogroup" aria-label="Los temas del mes">'+
    [['desglose', 'Uno por uno', 'Cada charla y capacitación con su fecha, su tema, cuántas personas y cuánto duró; con el total de cada tipo y el total del mes.'],
     ['total', 'Solo el total por tipo', 'Una fila por tipo de charla: cuántas veces, cuántas personas, cuánto duraron y sus horas hombre de capacitación.']].map(function(o){
      var on=INFW.temas===o[0];
      return '<button type="button" role="radio" aria-checked="'+on+'" class="inf-tem-op'+(on ? ' on' : '')+'" data-tem="'+o[0]+'"><b>'+o[1]+'</b><small>'+esc(o[2])+'</small></button>';
    }).join('')+'</div></div></div>';
  h+='<div class="inf-armar"><button type="button" class="bt" id="inf-armar2">Armar el informe ›</button>'+
    '<span>'+(todas ? 'Lee cada obra: tarda un poco más.' : 'Sale en PDF con su portada, índice y páginas numeradas; el Excel y el Word salen de lo mismo.')+'</span>'+
    (todas ? '' : '<button type="button" class="bt sec chico" id="inf-modelo">'+(INFW.modelo ? 'Guardar los cambios de «'+esc(INFW.modelo.nombre || 'Modelo de la obra')+'»' : 'Guardar como modelo de la obra')+'</button>')+'</div>'+
    (todas ? '' : '<p class="msg" id="inf-modelo-msg" role="status"></p>');
  /* personalizar (solo para esta obra): qué partes van, en qué orden, y los anexos */
  if(!todas){
    h+='<details class="inf-pers" id="inf-pers"'+(INFW.pers ? ' open' : '')+'><summary>La lista de lo que va: marca, quita y ordena las partes, y suma anexos · '+nOn+' partes</summary><div class="inf-pers-c"><div class="inf-grid"><div>'+
      '<div id="inf-secc">'+S.map(function(x, i){
        var s=_infSeccN(x.k), fijo=!!s.fijo, bq=_infBloq(x.k), va=x.on && !bq;
        return '<div class="inf-sec'+(va ? '' : ' off')+(bq ? ' bloq' : '')+'" data-i="'+i+'" data-k="'+esc(x.k)+'"><span class="n">'+(i+1)+'</span>'+
          '<input type="checkbox" aria-label="Incluir '+esc(s.n)+'" data-on="'+i+'"'+(va ? ' checked' : '')+((fijo || bq) ? ' disabled' : '')+'>'+
          '<span class="tx"><b>'+esc(s.n)+'</b><small>'+esc(s.d)+'</small>'+(bq ? '<small class="inf-bq">🔒 '+(bq.plan ? 'Se suma con el plan '+esc(bq.plan)+' o uno mayor' : 'No está en tu plan')+'</small>' : '')+'</span>'+
          (fijo ? '' : '<span class="mov"><button type="button" data-sube="'+i+'" aria-label="Subir '+esc(s.n)+'"'+(i<=1 ? ' disabled' : '')+'>↑</button><button type="button" data-baja="'+i+'" aria-label="Bajar '+esc(s.n)+'"'+(i>=S.length-2 ? ' disabled' : '')+'>↓</button></span>')+'</div>';
      }).join('')+'</div></div><div>'+
      '<div class="tarj"><div class="tarj-cab"><div><h2>Anexos</h2><p class="sub">Del archivo de la obra: PDF o fotos, en el orden que elijas</p></div><button type="button" class="bt sec chico" id="inf-anx-mas">＋ Elegir del archivo</button></div><div class="tarj-cuerpo" id="inf-anx">'+
      (INFW.anexos.length ? INFW.anexos.map(function(a, i){
        return '<div class="inf-anx"><span class="n tenue">'+(i+1)+'</span><span class="tx" title="'+esc(a.nombre)+'">'+esc(a.nombre)+'</span>'+
          '<button type="button" data-asube="'+i+'" aria-label="Subir"'+(i ? '' : ' disabled')+'>↑</button><button type="button" data-abaja="'+i+'" aria-label="Bajar"'+(i<INFW.anexos.length-1 ? '' : ' disabled')+'>↓</button>'+
          '<button type="button" data-aquita="'+i+'" aria-label="Quitar '+esc(a.nombre)+'">×</button></div>'; }).join('')
        : '<div class="vacio" id="inf-anx-vacio"><b>Sin anexos</b>Elige del archivo de la obra lo que pide tu gerencia o tu cliente: las asistencias escaneadas, los permisos, las fotos…</div>')+
      '</div></div></div></div></div></details>';
  }
  caja.innerHTML=h;
  $('inf-mes').onchange=function(){ INFW.mes=this.value; INFW.datos=null; INFW.datosT=null; _infPideCargar(); };
  $('inf-para-n').oninput=function(){ INFW.paraN=this.value; };
  $('inf-por').oninput=function(){ INFW.por=this.value; };
  $('inf-armar2').onclick=infArmar;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-para]'), function(b){ b.onclick=function(){ INFW.para=b.getAttribute('data-para'); _infPintar(); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-alc]'), function(b){ b.onclick=function(){ INFW.alcance=b.getAttribute('data-alc'); _infPintar(); }; });
  _infTipoAl(caja);
  Array.prototype.forEach.call(caja.querySelectorAll('[data-niv]'), function(b){ b.onclick=function(){ _infNivelPoner(b.getAttribute('data-niv')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-tem]'), function(b){ b.onclick=function(){ INFW.temas=b.getAttribute('data-tem'); _infPintar(); }; });
  if(todas) return;
  $('inf-modelo').onclick=_infGuardarModelo;
  _infVersAl();
  $('inf-pers').addEventListener('toggle', function(){ INFW.pers=this.open; });
  var sc=$('inf-secc');
  sc.onclick=function(ev){
    var b=ev.target.closest('button'); if(!b) return;
    var i;
    if(b.hasAttribute('data-sube')){ i=+b.getAttribute('data-sube'); if(i>1){ var t=S[i]; S[i]=S[i-1]; S[i-1]=t; _infPintar(); } }
    else if(b.hasAttribute('data-baja')){ i=+b.getAttribute('data-baja'); if(i<S.length-2){ var u=S[i]; S[i]=S[i+1]; S[i+1]=u; _infPintar(); } }
  };
  sc.onchange=function(ev){ var c=ev.target; if(c.hasAttribute('data-on')){ var x=S[+c.getAttribute('data-on')]; if(x && !_infSeccN(x.k).fijo && !_infBloq(x.k)){ x.on=c.checked; INFW.nivel='propio'; _infPintar(); } } };
  $('inf-anx-mas').onclick=_infElegirAnexos;
  $('inf-anx').onclick=function(ev){
    var b=ev.target.closest('button'); if(!b) return;
    var A=INFW.anexos, i;
    if(b.hasAttribute('data-asube')){ i=+b.getAttribute('data-asube'); if(i>0){ var t=A[i]; A[i]=A[i-1]; A[i-1]=t; } }
    else if(b.hasAttribute('data-abaja')){ i=+b.getAttribute('data-abaja'); if(i<A.length-1){ var u=A[i]; A[i]=A[i+1]; A[i+1]=u; } }
    else if(b.hasAttribute('data-aquita')){ A.splice(+b.getAttribute('data-aquita'), 1); }
    _infPintar();
  };
}
function _infModeloNota(nombre){ return { v:2, nombre:String(nombre || 'Modelo de la obra').slice(0, 80), nivel:INFW.nivel, temas:INFW.temas, secc:INFW.secc.map(function(x){ return { k:x.k, on:!!x.on }; }), para:INFW.para, paraN:String(INFW.paraN||'').slice(0, 100) }; }
function _infGuardarModelo(){
  var m=$('inf-modelo-msg'), b=$('inf-modelo'), nombre=(INFW.modelo && INFW.modelo.nombre) || 'Modelo de la obra';
  var nota=JSON.stringify(_infModeloNota(nombre));
  b.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
  var p=INFW.modelo && INFW.modelo.id
    ? sbPatch('sst_doc?id=eq.'+_enc(INFW.modelo.id), { nota:nota }).then(function(){ return [{ id:INFW.modelo.id }]; })
    : sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'informe-modelo', nombre:'Informe del mes · '+nombre, nota:nota });
  p.then(function(rows){
    var id=(rows && rows[0] && rows[0].id) || (INFW.modelo && INFW.modelo.id) || null, mm=JSON.parse(nota);
    INFW.modelo={ id:id, m:mm, nombre:nombre };
    INFW.versiones=(INFW.versiones||[]).filter(function(v){ return v.id!==id; }); INFW.versiones.unshift({ id:id, nombre:nombre, m:mm });
    try{ localStorage.setItem('sstp_inf_ver_'+YO.obra.id, id); }catch(e){}
    b.disabled=false; b.textContent='Guardar los cambios de «'+nombre+'»'; m.className='msg ok'; m.textContent='Guardado: «'+nombre+'» es una versión de esta obra, para ti y tu equipo.';
    var vs=$('inf-vers'); if(vs){ vs.outerHTML=_infVersHTML(); _infVersAl(); }
  }, function(e){ b.disabled=false; m.className='msg mal'; m.textContent=(e===401 || e===403) ? 'Esta cuenta no puede guardar en esta obra.' : 'No se pudo guardar. Revisa tu conexión.'; });
}
/* 19/10/2026 · lote 19 · las versiones del informe: una para el cliente, otra para la gerencia… */
function _infVersHTML(){
  var Vs=INFW.versiones||[], act=INFW.modelo && INFW.modelo.id;
  return '<div class="inf-vers" id="inf-vers"><span class="inf-vers-t">Mis versiones</span>'+
    (Vs.length ? Vs.map(function(v){ var on=(v.id===act); return '<button type="button" class="inf-ver'+(on ? ' on' : '')+'" data-ver="'+esc(v.id)+'" aria-pressed="'+(on ? 'true' : 'false')+'">'+esc(v.nombre)+'</button>'; }).join('') : '<span class="tenue">ninguna guardada</span>')+
    '<button type="button" class="bt sec chico" id="inf-ver-nueva">＋ Guardar como versión nueva</button>'+
    ((act && Vs.length>1) ? '<button type="button" class="bt-link" id="inf-ver-quitar">Quitar «'+esc(INFW.modelo.nombre)+'»</button>' : '')+
    '<p class="ayuda" style="margin:2px 0 0;flex:1 1 100%">Cada versión guarda el nivel, cómo salen los temas, la lista de lo que va y para quién es. La próxima vez se abre la última que usaste.</p></div>';
}
function _infVersAl(){
  Array.prototype.forEach.call(document.querySelectorAll('[data-ver]'), function(b){ b.onclick=function(){ _infVerAplicar(b.getAttribute('data-ver')); }; });
  if($('inf-ver-nueva')) $('inf-ver-nueva').onclick=_infVerNueva;
  if($('inf-ver-quitar')) $('inf-ver-quitar').onclick=_infVerQuitar;
}
function _infVerAplicar(id){
  var v=(INFW.versiones||[]).filter(function(x){ return x.id===id; })[0]; if(!v) return;
  INFW.modelo={ id:v.id, m:v.m, nombre:v.nombre }; INFW.secc=null; _infModeloAplicar(v.m);
  try{ localStorage.setItem('sstp_inf_ver_'+YO.obra.id, v.id); }catch(e){}
  _infPintar();
}
function _infVerNueva(){
  preguntar('Guardar como versión nueva', 'Ponle un nombre: así la eliges el próximo mes. Guarda el nivel, cómo salen los temas, la lista de lo que va y para quién es.',
    { etiqueta:'Nombre de la versión', placeholder:'Para el cliente · completo', minimo:3, corto:'Ponle un nombre (3 letras o más).' }, { si:'Guardar' }).then(function(nom){
    nom=String(nom||'').replace(/\s+/g, ' ').trim().slice(0, 80); if(!nom) return;
    if((INFW.versiones||[]).some(function(v){ return v.nombre.toLowerCase()===nom.toLowerCase(); })){ toast('Ya hay una versión con ese nombre: elígela y guarda sus cambios.'); return; }
    var nota=_infModeloNota(nom);
    sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'informe-modelo', nombre:'Informe del mes · '+nom, nota:JSON.stringify(nota) }).then(function(rows){
      var id=(rows && rows[0] && rows[0].id) || null; if(!id) throw { portal:'No se guardó: esta cuenta no puede guardar en esta obra.' };
      INFW.versiones=(INFW.versiones||[]); INFW.versiones.unshift({ id:id, nombre:nom, m:nota }); INFW.modelo={ id:id, m:nota, nombre:nom };
      try{ localStorage.setItem('sstp_inf_ver_'+YO.obra.id, id); }catch(e){}
      toast('Versión «'+nom+'» guardada.'); _infPintar();
    }).catch(function(e){ toast('No se pudo guardar. '+porQueFallo(e)); });
  });
}
function _infVerQuitar(){
  var v=INFW.modelo; if(!v || !v.id) return;
  confirmar('¿Quitar la versión «'+v.nombre+'»?', 'Los informes que ya bajaste no cambian. Las otras versiones siguen igual.', { si:'Sí, quitarla', mal:true }).then(function(si){
    if(!si) return;
    sbDelP('sst_doc?id=eq.'+_enc(v.id)).then(function(){
      INFW.versiones=(INFW.versiones||[]).filter(function(x){ return x.id!==v.id; });
      var otra=INFW.versiones[0] || null; INFW.modelo=otra ? { id:otra.id, m:otra.m, nombre:otra.nombre } : null;
      if(otra){ INFW.secc=null; _infModeloAplicar(otra.m); }
      toast('Versión quitada.'); _infPintar();
    }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}
/* elegir anexos del archivo de la obra (lo que tiene archivo: PDF o foto) */
function _infElegirAnexos(){
  var h='<div class="campo"><label for="inf-anx-q">Buscar</label><input id="inf-anx-q" type="search" placeholder="Nombre o carpeta"></div><div id="inf-anx-lista" style="max-height:52vh;overflow:auto;border:1px solid var(--raya);border-radius:10px"><div class="vacio">Cargando…</div></div>';
  abrirHoja('Elegir del archivo de la obra', 'PDF o fotos: se suman al final del informe, en el orden que elijas', h,
    '<button type="button" class="bt sec" id="inf-anx-no">Cancelar</button><button type="button" class="bt" id="inf-anx-si">Agregar</button>', {ancha:true, sinFoco:true});
  $('inf-anx-no').onclick=cerrarHoja;
  var ya={}; INFW.anexos.forEach(function(a){ ya[a.id]=1; });
  traer('sst_doc', '&select=id,hoja,nombre,url,creado&url=not.is.null&order=creado.desc', 600).then(function(filas){
    var L=(filas||[]).filter(function(f){ return f && f.url && /\.(pdf|jpe?g|png|webp)(\?|$)/i.test(decodeURIComponent(String(f.url))) && f.hoja!=='informe-modelo'; });
    function pinta(){
      var q=nrm(($('inf-anx-q')||{}).value||''), c=$('inf-anx-lista'); if(!c) return;
      var V=L.filter(function(f){ return !q || nrm(f.nombre+' '+tipoDoc(f.hoja)).indexOf(q)>-1; });
      c.innerHTML=V.length ? V.slice(0, 300).map(function(f){
        return '<label class="inf-anx" style="cursor:pointer"><input type="checkbox" data-id="'+esc(f.id)+'"'+(ya[f.id] ? ' checked disabled' : '')+' style="width:auto;margin:0"> <span class="tx">'+esc(f.nombre||'Documento')+
          ' <span class="tenue">· '+esc(tipoDoc(f.hoja))+' · '+esc(fechaLarga(String(f.creado||'').slice(0, 10)))+'</span></span></label>'; }).join('')
        : '<div class="vacio"><b>'+(L.length ? 'Nada con esa palabra' : 'El archivo de la obra no tiene PDF ni fotos todavía')+'</b>'+(L.length ? '' : 'Sube los documentos en «Documentos» o desde la app.')+'</div>';
    }
    pinta(); $('inf-anx-q').oninput=pinta;
    $('inf-anx-si').onclick=function(){
      Array.prototype.forEach.call(document.querySelectorAll('#inf-anx-lista [data-id]'), function(c){
        if(!c.checked || c.disabled) return;
        var f=L.filter(function(x){ return String(x.id)===c.getAttribute('data-id'); })[0];
        if(f) INFW.anexos.push({ id:f.id, nombre:f.nombre||'Documento', url:f.url, hoja:f.hoja });
      });
      cerrarHoja(); _infPintar();
    };
  }, function(){ var c=$('inf-anx-lista'); if(c) c.innerHTML='<div class="vacio"><b>No se pudo leer el archivo</b>Revisa tu conexión.</div>'; });
}

/* ── los datos del mes, de una obra (la abierta, o cualquiera de la empresa para «Todas mis obras») ── */
function _infTr(O, tabla, extra, lim){ return sbGet(tabla+'?'+(DUENO[tabla]||'empresa')+'=eq.'+_enc(O.id)+(extra||'')+'&limit='+(lim||1000)); }
function _infEst(O, clave){ return sbGet('sst_estado?empresa=eq.'+_enc(O.id)+'&clave=eq.'+_enc(clave)+'&select=valor').then(function(r){ return (r && r[0]) ? r[0].valor : null; }); }
function _infTraer(mes, O, op){
  O=O||YO.obra; op=op||{};
  var tr=function(t, e, l){ return _infTr(O, t, e, l); };
  var P=[
    /* 19/10/2026 · lote 19 · con su empresa, su ingreso y su historia (para el personal del mes), si la base las tiene */
    tr('sst_trabajador', '&select=id,nombre,dni,td,estatus,puesto,contrata,ingreso,historial,estatus_desde,creado&order=nombre.asc', 6000)
      .catch(function(){ return tr('sst_trabajador', '&select=id,nombre,dni,td,estatus,puesto,contrata,ingreso,historial,estatus_desde&order=nombre.asc', 6000); })
      .catch(function(){ return tr('sst_trabajador', '&select=id,nombre,dni,td,estatus,puesto,contrata,ingreso&order=nombre.asc', 6000); })
      .catch(function(){ return tr('sst_trabajador', '&select=id,nombre,dni,td,estatus,puesto&order=nombre.asc', 6000); }),
    tr('sst_constancia', '&select=fecha,resultado,tema&order=fecha.desc', 4000),
    tr('sst_reporte', '&select=id,fecha,creado,cerrado,estado,clase,descripcion,lugar,foto_url,foto_cierre,accion,cerrado_por,anonimo,autor&order=creado.desc', 3000)
      .catch(function(){ return tr('sst_reporte', '&select=id,fecha,creado,cerrado,estado,clase&order=creado.desc', 3000); }),
    /* con «potencial» (los precursores del riesgo del mes) si el servidor ya la tiene; si no, sin ella */
    tr('sst_accidente', '&select=fecha,clase,dias,medidas,potencial&order=fecha.desc', 1000).catch(function(){ return tr('sst_accidente', '&select=fecha,clase,dias,medidas&order=fecha.desc', 1000); }),
    /* 19/10/2026 · lote 18 · con la HHC de obreros y de staff si la base la tiene (y si no, sin ella) */
    tr('sst_hht', '&select=fecha,ob_n,ob_h,st_n,st_h,hhc,hhc_ob,hhc_st,creado&order=fecha.desc,creado.desc', 4000)
      .catch(function(){ return tr('sst_hht', '&select=fecha,ob_n,ob_h,st_n,st_h,hhc&order=fecha.desc', 4000); })
      .catch(function(){ return tr('sst_hht', '&select=fecha,ob_n,ob_h,st_n,st_h&order=fecha.desc', 4000); }),
    tr('sst_kardex', '&select=fecha,epp,cantidad,trabajador,trab_nombre,tipo&order=fecha.desc', 6000).catch(function(){ return tr('sst_kardex', '&select=fecha,epp,cantidad,trabajador,trab_nombre&order=fecha.desc', 6000); }),
    tr('sst_inspeccion', '&select=id,fecha,tipo,observacion,inspector&order=fecha.desc', 3000).catch(function(){ return tr('sst_inspeccion', '&select=fecha,tipo&order=fecha.desc', 3000); }),
    op.ligero ? Promise.resolve(null) : cargarSctr().then(function(){ return tr('sst_doc', '&hoja=eq.sctr&select=id,nombre,url,nota,creado&order=creado.desc', 100); }),
    /* el comité de la obra (el mismo documento de la app) */
    O.codigo ? _infEst(O, 'comite_emp:'+O.codigo).then(function(v){ return (v && typeof v==='object') ? v : null; }) : Promise.resolve(null),
    /* el EPP de la obra (portal/epp.js): el catálogo con sus precios, los ingresos y las verificaciones */
    (typeof cargarEpw==='function' && (typeof planWebTrae!=='function' || planWebTrae('eppobra')) ? cargarEpw().then(function(){ return Promise.all(['epp_cat', 'epp_ing', 'epp_verif'].map(function(k){ return _infEst(O, k); })); }) : Promise.resolve(null)),
    /* las asistencias del mes (con QR), las capacitaciones registradas o escaneadas (ges-act) y los ATS */
    tr('sst_asist', '&inicio=gte.'+_enc(new Date(mes+'-01T00:00:00').toISOString())+'&inicio=lt.'+_enc(new Date(_infMesSig(mes)+'-01T00:00:00').toISOString())+'&select=id,tipo,tema,inicio,minutos,estado&order=inicio.asc', 3000),
    tr('sst_doc', '&hoja=eq.ges-act&select=id,nota&order=creado.desc', 3000),
    tr('sst_doc', '&hoja=eq.ats&creado=gte.'+_enc(new Date(Date.parse(mes+'-01T00:00:00')-20*864e5).toISOString())+'&select=id,nombre,nota,creado&order=creado.desc', 3000),
    /* 19/10/2026 · lote 18 · los puestos que la obra cambió de obrero a staff (o al revés): la nota de «ats-cfg» */
    tr('sst_doc', '&hoja=eq.ats-cfg&select=nota&order=creado.desc', 1).then(function(r){ var n=(r && r[0]) ? nota(r[0].nota) : null; return { cat:(n && n.catPuestos && typeof n.catPuestos==='object' && !Array.isArray(n.catPuestos)) ? n.catPuestos : {}, n:(n && typeof n==='object') ? n : {} }; }),
    /* 19/10/2026 · lote 19 · la ficha de cada observación, el buzón, las buenas prácticas, el registro fotográfico y los programas del año */
    tr('sst_doc', '&hoja=eq.'+OBS_HOJA+'&select=id,hoja,nombre,nota&order=creado.desc', 6000),
    tr('sst_sugerencia', '&creado=gte.'+_enc(new Date(mes+'-01T00:00:00').toISOString())+'&creado=lt.'+_enc(new Date(_infMesSig(mes)+'-01T00:00:00').toISOString())+'&select=id,tema,texto,creado&order=creado.asc', 1000),
    tr('sst_buena', '&fecha=gte.'+mes+'-01&fecha=lte.'+_infMesFin(mes)+'&select=id,fecha,titulo,descripcion,lugar,foto_url&order=fecha.asc', 500),
    tr('sst_doc', '&hoja=eq.'+FOTO_HOJA+'&select=id,hoja,nombre,url,nota,creado&order=creado.asc', 3000),
    (op.prog && typeof progTraer==='function') ? Promise.all([progTraer(true), progHechos(mes.slice(0, 4), true), objTraer(true)]).then(function(x){ return { progs:x[0], H:x[1], objs:x[2] }; }) : Promise.resolve(undefined),
    /* 19/10/2026 · lote 20 · lo de medio ambiente del año (residuos, agua, combustible, documentos) */
    tr('sst_doc', '&hoja=eq.'+AMB_HOJA+'&creado=gte.'+_enc(new Date(mes.slice(0, 4)+'-01-01T00:00:00').toISOString())+'&select=id,hoja,nombre,url,nota,creado&order=creado.asc', 3000),
    /* 20/10/2026 · lote 23 · la salud ocupacional: lo registrado aparte (sal-reg) del año y los EMO de la obra (fechas, tipo y aptitud) */
    op.ligero ? Promise.resolve(null) : tr('sst_doc', '&hoja=eq.'+SAL_HOJA+'&creado=gte.'+_enc(new Date(mes.slice(0, 4)+'-01-01T00:00:00').toISOString())+'&select=id,hoja,nombre,url,nota,creado&order=creado.asc', 2000),
    (op.ligero || (typeof planWebTrae==='function' && !planWebTrae('emo'))) ? Promise.resolve(null)
      : sbRpc('sst_emo_resumen', { p_emp:O.id }).then(function(j){ return (j && j.ok!==false && Array.isArray(j.lista)) ? j.lista : null; })
  ];
  return Promise.all(P.map(function(p){ return Promise.resolve(p).catch(function(){ return null; }); })).then(function(r){
    var trab=r[0]||[], cons=r[1]||[], reps=r[2]||[], accs=r[3]||[], hht=r[4]||[], kar=r[5]||[], insp=r[6]||[], mapa=(r[13] && r[13].cat) || {}, cfgN=(r[13] && r[13].n) || {};
    var anio=mes.slice(0, 4), fin=_infMesFin(mes), hoy=hoyISO(), dia=(fin<hoy) ? fin : hoy;
    var D={ mes:mes, anio:anio, dia:dia, obra:O, obraN:_infObraN(O) };
    var act=trab.filter(function(t){ return (t.estatus||'activo')==='activo'; });
    D.activos=act.length;
    /* obreros y staff: por el puesto de cada uno (catPuesto, como en la app) */
    var porDoc={}, porNom={};
    trab.forEach(function(t){ if(t.dni) porDoc[String(t.dni).toUpperCase()]=t; if(t.nombre) porNom[catNorm(t.nombre)]=t; });
    var catDe=function(doc, nom, puesto){ if(puesto) return catPuesto(puesto, mapa); var t=porDoc[String(doc||'').toUpperCase()] || porNom[catNorm(nom)]; return t ? catPuesto(t.puesto, mapa) : ''; };
    D.cat={ o:0, s:0 }; act.forEach(function(t){ if(catPuesto(t.puesto, mapa)==='staff') D.cat.s++; else D.cat.o++; });
    var cm=cons.filter(function(c){ return mesDe(c.fecha)===mes; });
    D.cap={ n:cm.length, ok:cm.filter(function(c){ var r=String(c.resultado||'').toLowerCase(); return /aprob|apto|ok/.test(r) && !/desaprob|reprob|no apto/.test(r); }).length, temas:_infTop(cm, function(c){ return c.tema||'Sin tema'; }, 1, 8) };
    var rm=reps.filter(function(x){ return mesDe(x.fecha||x.creado)===mes; });
    D.rep={ n:rm.length, cerrados:rm.filter(reporteCerrado).length, actos:rm.filter(function(x){ return x.clase==='acto'; }).length, cond:rm.filter(function(x){ return x.clase==='condicion'; }).length,
            abiertosHoy:reps.filter(function(x){ return !reporteCerrado(x); }).length };
    /* las horas hombre: un día = una fila (si hubiera dos del mismo día, vale la más nueva) */
    var vistoD={}, hh=hht.filter(function(x){ var f=String(x.fecha||'').slice(0, 10); if(!f || vistoD[f]) return false; vistoD[f]=1; return true; });
    D.hh=_infHH(hh, mes);
    /* 19/10/2026 · lote 18 · accidentes (leve, incapacitante, mortal) e incidentes (casi accidente, primeros auxilios, daño), aparte */
    var esAcc=function(a){ return INF_ACC[a.clase]===1; }, esInc=function(a){ return INF_ACC[a.clase]===2; };
    var am=accs.filter(function(a){ return mesDe(a.fecha)===mes; }), aa=accs.filter(function(a){ return anioDe(a.fecha)===anio && String(a.fecha).slice(0, 10)<=fin; });
    var hAnio=0;
    hh.forEach(function(x){ var f=String(x.fecha||''); if(anioDe(f)===anio && f.slice(0, 10)<=fin) hAnio+=(parseFloat(x.ob_n)||0)*(parseFloat(x.ob_h)||0)+(parseFloat(x.st_n)||0)*(parseFloat(x.st_h)||0); });
    var nIF=aa.filter(function(a){ return ACC_CUENTA[a.clase]; }).length, dias=aa.reduce(function(s, a){ return s+(parseInt(a.dias, 10)||0); }, 0);
    D.acc={ mes:am.filter(esAcc).length, inc:am.filter(esInc).length, anio:aa.filter(esAcc).length, incAnio:aa.filter(esInc).length, nIF:nIF, dias:dias, hMes:D.hh.hht, hAnio:hAnio, IF:hAnio ? nIF*1e6/hAnio : null, IS:hAnio ? dias*1e6/hAnio : null };
    /* el riesgo del mes, al cierre del mes (o a hoy, si el mes no terminó): la cuenta de riesgo-base.js */
    D.riesgo=(!op.ligero && typeof riesgoCalcular==='function') ? riesgoCalcular(
      accs.map(function(a){ return { fecha:a.fecha, clase:a.clase, pot:(a.potencial===true || a.potencial===false) ? a.potencial : null, medidas:a.medidas }; }),
      hh.map(function(x){ return { fecha:x.fecha, hht:(parseFloat(x.ob_n)||0)*(parseFloat(x.ob_h)||0)+(parseFloat(x.st_n)||0)*(parseFloat(x.st_h)||0) }; }), dia) : null;
    var km=kar.filter(function(k){ return mesDe(k.fecha)===mes; });
    D.epp={ entregas:km.length, und:km.reduce(function(s, k){ return s+(parseInt(k.cantidad, 10)||1); }, 0), top:_infTop(km, function(k){ return k.epp||'EPP'; }, function(k){ return parseInt(k.cantidad, 10)||1; }, 8) };
    D.epp.cons=_infConsumo(km);
    D.ats=_infAts(r[12], mes);
    D.com=_infComite(r[8], mes, dia);
    if(Array.isArray(r[9]) && typeof EPPB==='object'){
      var _ecat=EPPB.limpio('cat', r[9][0]), _eing=EPPB.limpio('ing', r[9][1]), _ever=EPPB.limpio('verif', r[9][2]);
      D.epp.verif=EPPB.verifMes(_ever, mes, _ecat);
      D.epp.costo=EPPB.costo(_ecat, _eing, kar, mes+'-01', fin);
      D.epp.mon=EPPB.moneda((typeof paisObraP==='function') ? paisObraP(O) : 'pe');
    }
    var im=insp.filter(function(i){ return mesDe(i.fecha)===mes; });
    D.insp={ n:im.length, tipos:_infTop(im, function(i){ return i.tipo||'Inspección'; }, 1, 10) };
    if(Array.isArray(r[7]) && typeof sctrLeer==='function'){
      /* 19/10/2026 · lote 19 · los que estaban en obra al cierre del mes (no los de hoy) */
      var trabDia=trab.filter(function(t){ var ing=String(t.ingreso||'').slice(0, 10); return !(ing && ing>dia) && _infSit(t, dia).e==='activo'; }).map(function(t){ return Object.assign({}, t, { estatus:'activo' }); });
      var regs=sctrOrdenar(r[7].map(sctrLeer)), R=sctrRevisar(trabDia, regs, dia);
      D.sctr={ dia:dia, vig:regs.filter(function(x){ return sctrVigente(x, dia); }), R:R };
    } else D.sctr=null;
    /* 19/10/2026 · lote 19 · el personal del mes, las horas del año, las observaciones, la pirámide, el registro fotográfico y los programas */
    D.per=_infPersonal(trab, mes, dia, mapa, (typeof empresaDeObraP==='function' && O===YO.obra) ? empresaDeObraP() : '');
    /* el personal activo del mes, al cierre del mes (con la historia de cada uno), no el de hoy */
    D.activos=D.per.act; D.cat={ o:D.per.ob, s:D.per.st };
    D.hhA=_infHHAnio(hh, mes);
    D.obs=_infObs(reps, insp, r[14], r[15], r[16], mes, dia, obsCatLista(cfgN.obsCat));
    D.bird=_infBird(accs, reps, insp, r[14], mes, fin);
    D.freg={ L:fotoCatLista(cfgN.fotoCat), del:fotoRegDelMes(fotoRegFilas(r[17]||[]), mes), fallan:0 };
    D.prog=(r[18]===undefined) ? undefined : (r[18] ? _infProgramas(r[18].progs, r[18].H, r[18].objs, mes, fin<hoy) : null);
    /* las charlas: quiénes marcaron en cada sesión con QR (sst_asist_marca), y las registradas o escaneadas */
    var ses=(r[10]||[]).filter(function(s){ var t=new Date(s.inicio); return !isNaN(t) && (t.getFullYear()+'-'+dos(t.getMonth()+1))===mes; });
    D._insp=insp; D.temasAmb=(cfgN.temasAmb && typeof cfgN.temasAmb==='object') ? cfgN.temasAmb : {};
    /* 20/10/2026 · lote 23 · para el informe de salud ocupacional: las actividades, el personal con su historia, los accidentes y los temas */
    D.temasSal=(cfgN.temasSal && typeof cfgN.temasSal==='object' && !Array.isArray(cfgN.temasSal)) ? cfgN.temasSal : {};
    if(!op.ligero){ D._act=r[11] || []; D._trab=trab; D._accs=accs; D._ambRows=r[19]; D._salRows=r[20]; D._emoL=r[21]; }
    return _infMarcas(O, ses).then(function(marcas){ D.ch=_infCharlas(ses, marcas, r[11], mes, catDe); D.amb=_infAmb(D, r[19], D.temasAmb); D.sal=op.ligero ? null : _infSal(D, r[20], r[21]); return D; });
  });
}
/* las horas hombre del mes, de obreros y de staff (los días de antes del lote 18 traen la HHC sin separar) */
function _infHH(filas, mes){
  var o={ dias:0, obN:0, stN:0, obHHT:0, stHHT:0, hht:0, hhc:0, hhcOb:0, hhcSt:0, hhcSin:0, L:[] };
  filas.forEach(function(x){
    if(mesDe(x.fecha)!==mes) return;
    var on=parseFloat(x.ob_n)||0, sn=parseFloat(x.st_n)||0, c=parseFloat(x.hhc)||0;
    o.dias++; o.obN+=on; o.stN+=sn; o.obHHT+=on*(parseFloat(x.ob_h)||0); o.stHHT+=sn*(parseFloat(x.st_h)||0); o.hhc+=c;
    var sep=(x.hhc_ob!=null || x.hhc_st!=null);
    if(sep){ o.hhcOb+=parseFloat(x.hhc_ob)||0; o.hhcSt+=parseFloat(x.hhc_st)||0; } else o.hhcSin+=c;
    o.L.push({ f:String(x.fecha).slice(0, 10), obN:on, obH:parseFloat(x.ob_h)||0, stN:sn, stH:parseFloat(x.st_h)||0, hhc:c, hhcOb:sep ? (parseFloat(x.hhc_ob)||0) : null, hhcSt:sep ? (parseFloat(x.hhc_st)||0) : null });
  });
  o.hht=o.obHHT+o.stHHT; o.L.sort(function(a, b){ return a.f.localeCompare(b.f); });
  /* el personal de un día cualquiera del mes (el promedio de los días registrados) */
  o.obProm=o.dias ? o.obN/o.dias : 0; o.stProm=o.dias ? o.stN/o.dias : 0;
  return o;
}
/* quiénes marcaron en cada sesión (de a 50 sesiones por pedido); null si no se pudo leer */
function _infMarcas(O, ses){
  if(!ses.length) return Promise.resolve({});
  var por={}, tandas=[];
  for(var i=0;i<ses.length;i+=50) tandas.push(ses.slice(i, i+50));
  return Promise.all(tandas.map(function(T){
    return _infTr(O, 'sst_asist_marca', '&sesion=in.('+T.map(function(s){ return _enc('"'+s.id+'"'); }).join(',')+')&estado=eq.ok&select=sesion,doc,nombre', 20000);
  })).then(function(R){ R.forEach(function(L){ (L||[]).forEach(function(m){ (por[m.sesion]=por[m.sesion]||[]).push(m); }); }); return por; }, function(){ return null; });
}
/* las charlas y capacitaciones del mes: cada una (los temas del mes) y por tipo, con sus personas (obreros y staff), su
   duración y su HHC (personas × minutos / 60). El que no está en el personal, y la hoja escaneada sin nombres, como obreros. */
function _infCharlas(ses, marcas, act, mes, catDe){
  var T={}, S=[], orden=Object.keys(INF_ASIS_TIPOS);
  function fila(k, f, tema, n, o, s, min, de, amb){
    k=INF_ASIS_TIPOS[k] ? k : 'otra';
    var t=T[k]||(T[k]={ k:k, n:INF_ASIS_TIPOS[k], veces:0, asis:0, o:0, s:0, pm:0, min:0, qr:0, reg:0 });
    t.veces++; t.asis+=n; t.o+=o; t.s+=s; t.pm+=n*min; t.min+=min; t[de]++;
    S.push({ k:k, tipo:INF_ASIS_TIPOS[k], f:f, tema:String(tema||'').trim() || INF_ASIS_TIPOS[k], n:n, o:o, s:s, min:min, hhc:n*min/60, de:de, amb:(amb===true || amb===false) ? amb : undefined });
  }
  (ses||[]).forEach(function(x){
    var L=marcas ? (marcas[x.id]||[]) : [], o=0, s=0;
    L.forEach(function(m){ if(catDe(m.doc, m.nombre)==='staff') s++; else o++; });
    var min=(+x.minutos>0) ? +x.minutos : (INF_ASIS_MIN[x.tipo]||30), t=new Date(x.inicio);
    fila(x.tipo, t.getFullYear()+'-'+dos(t.getMonth()+1)+'-'+dos(t.getDate()), x.tema, L.length, o, s, min, 'qr');
  });
  (act||[]).forEach(function(r){
    var d=nota(r.nota); if(!d || d.k!=='cap' || String(d.fecha||'').slice(0, 7)!==mes) return;
    var g=Array.isArray(d.gente) ? d.gente : [], n=g.length || Math.max(0, parseInt(d.n, 10)||0), o=0, s=0;
    if(g.length) g.forEach(function(p){ if(catDe(p && p.d, p && p.n, p && p.p)==='staff') s++; else o++; }); else o=n;
    fila(d.tipo||'capacitacion', String(d.fecha).slice(0, 10), d.tema, n, o, s, parseFloat(d.min)||0, 'reg', d.amb);
  });
  var L=Object.keys(T).map(function(k){ var t=T[k]; t.hhc=t.pm/60; return t; })
    .sort(function(a, b){ return (b.hhc-a.hhc) || (b.veces-a.veces) || (orden.indexOf(a.k)-orden.indexOf(b.k)); });
  var rk={}; L.forEach(function(t, i){ rk[t.k]=i; });
  S.sort(function(a, b){ return (rk[a.k]-rk[b.k]) || a.f.localeCompare(b.f) || a.tema.localeCompare(b.tema, 'es'); });
  var tot={ veces:0, asis:0, o:0, s:0, hhc:0, min:0, qr:0, reg:0 };
  L.forEach(function(t){ tot.veces+=t.veces; tot.asis+=t.asis; tot.o+=t.o; tot.s+=t.s; tot.hhc+=t.hhc; tot.min+=t.min; tot.qr+=t.qr; tot.reg+=t.reg; });
  return { L:L, S:S, tot:tot, marcas:marcas!==null };
}
/* los ATS del mes (el último guardado de cada uno), con su estado y las fotos del cierre */
function _infAts(rows, mes){
  var vistos={}, L=[];
  (rows||[]).forEach(function(f){
    var n=nota(f.nota);
    if(!n || n.modo==='modelo' || n.modelo || String(n.fecha||'').slice(0, 7)!==mes) return;
    var k=String(n.id || f.nombre || f.id); if(vistos[k]) return; vistos[k]=1;
    var est=(typeof atsEstadoDe==='function') ? atsEstadoDe(n) : String(n.estado||'borrador');
    var fotos=((n.cierre && Array.isArray(n.cierre.fotos)) ? n.cierre.fotos : []).map(function(x){ return x && x.u; }).filter(function(u){ return /^https:\/\//i.test(String(u||'')); });
    L.push({ f:String(n.fecha).slice(0, 10), t:String(n.trabajo || n.area || 'ATS'), lugar:[n.area, n.ubic].filter(function(x){ return String(x||'').trim(); }).join(' · '), est:est, fotos:fotos });
  });
  var c={}; L.forEach(function(a){ c[a.est]=(c[a.est]||0)+1; });
  L.sort(function(a, b){ return a.f.localeCompare(b.f); });
  return { n:L.length, c:c, cerrados:c.cerrado||0, sinCierre:c.porcerrar||0, L:L };
}
/* el consumo de cada EPP del mes */
function _infConsumo(km){
  var m={};
  km.forEach(function(k){
    var n=String(k.epp||'EPP').trim()||'EPP', x=m[n]||(m[n]={ n:n, ent:0, und:0, N:0, C:0, P:0, t:{} }), c=parseInt(k.cantidad, 10)||1, tp=String(k.tipo||'N').toUpperCase();
    x.ent++; x.und+=c; x[(tp==='C' || tp==='P') ? tp : 'N']+=c;
    var q=k.trabajador || k.trab_nombre; if(q) x.t[q]=1;
  });
  var L=Object.keys(m).map(function(n){ var x=m[n]; x.trab=Object.keys(x.t).length; delete x.t; return x; })
    .sort(function(a, b){ return (b.und-a.und) || a.n.localeCompare(b.n, 'es'); });
  var tot={ N:0, C:0, P:0, und:0 }; L.forEach(function(x){ tot.N+=x.N; tot.C+=x.C; tot.P+=x.P; tot.und+=x.und; });
  return { L:L, tot:tot };
}
/* el panel fotográfico: las fotos del mes, ya chicas para el PDF (lo que no carga, no entra) */
var INF_FOTOS_MAX = 36;
function _infFotosTraer(D){
  var mes=D.mes, c0=_enc(new Date(Date.parse(mes+'-01T00:00:00')-40*864e5).toISOString());
  return Promise.all([
    traer('sst_reporte', '&creado=gte.'+c0+'&select=id,fecha,creado,clase,descripcion,lugar,estado,foto_url,foto_cierre&order=creado.asc', 1500).catch(function(){ return []; }),
    traer('sst_buena', '&fecha=gte.'+mes+'-01&fecha=lte.'+_infMesFin(mes)+'&select=id,fecha,titulo,descripcion,lugar,foto_url&order=fecha.asc', 300).catch(function(){ return []; })
  ]).then(function(r){
    var ok=function(u){ return /^https:\/\//i.test(String(u||'')); }, G=[];
    (r[0]||[]).forEach(function(x){
      if(mesDe(x.fecha||x.creado)!==mes || (!ok(x.foto_url) && !ok(x.foto_cierre))) return;
      var t=(x.clase==='acto' ? 'Acto inseguro' : (x.clase==='condicion' ? 'Condición insegura' : 'Reporte'))+(x.lugar ? ' · '+x.lugar : ''), f=fechaLarga(String(x.fecha||x.creado).slice(0, 10));
      G.push({ L:[ok(x.foto_url) ? { u:x.foto_url, tit:t, sub:f+' · Así se encontró', d:x.descripcion||'', ini:ok(x.foto_cierre) ? 1 : 0 } : null,
                  ok(x.foto_cierre) ? { u:x.foto_cierre, tit:t, sub:f+' · Así quedó', d:x.descripcion||'', fin:ok(x.foto_url) ? 1 : 0 } : null].filter(Boolean) });
    });
    (r[1]||[]).forEach(function(x){ if(ok(x.foto_url)) G.push({ L:[{ u:x.foto_url, tit:'Buena práctica · '+(x.titulo||''), sub:fechaLarga(String(x.fecha).slice(0, 10))+(x.lugar ? ' · '+x.lugar : ''), d:x.descripcion||'' }] }); });
    ((D.ats && D.ats.L)||[]).forEach(function(a){ a.fotos.slice(0, 2).forEach(function(u){ G.push({ L:[{ u:u, tit:'Cierre del ATS · '+a.t, sub:fechaLarga(a.f)+(a.lugar ? ' · '+a.lugar : '')+' · Así quedó el área', d:'' }] }); }); });
    var todas=[];
    G.forEach(function(g){ g.L.forEach(function(x){ todas.push(x); }); });
    var hay=todas.length, usar=todas.slice(0, INF_FOTOS_MAX), i=0;
    function una(){
      var x=usar[i++]; if(!x) return Promise.resolve();
      return _edMini(x.u, 900, 700).then(function(m){ if(m && m.d) x.img=m; return una(); });
    }
    /* de a cuatro a la vez */
    return Promise.all([una(), una(), una(), una()]).then(function(){
      D.fotos={ L:usar.filter(function(x){ return !!x.img; }), hay:hay, fallan:usar.filter(function(x){ return !x.img; }).length };
      return D;
    });
  });
}
/* 17/10/2026 · lote 16 · el comité del mes: sus actas (con el quórum de la app: la mitad más uno de los titulares), los acuerdos,
   lo pendiente y la próxima reunión. doc: el comité entero (para armar sus actas en los anexos) */
var INF_COM_TIPO = { instalacion:'Instalación', ordinaria:'Ordinaria', extraordinaria:'Extraordinaria', eleccion:'Elección' };
function _infComite(doc, mes, dia){
  if(!doc || !Array.isArray(doc.actas)) return null;
  var q=doc.quitadas || {}, actas=doc.actas.filter(function(a){ return a && a.id && !(q[a.id] && +q[a.id]>=(+a.ts||0)); });
  var tit=(doc.miembros||[]).filter(function(m){ return m && !m.sup; }).length, rd=(typeof paisObraP==='function' && paisObraP()==='do'), quo=(tit && !rd) ? Math.floor(tit/2)+1 : 0;
  var delMes=actas.filter(function(a){ return String(a.fecha||'').slice(0, 7)===mes; }).sort(function(x, y){ return String(x.fecha||'').localeCompare(String(y.fecha||'')); });
  var acuMes=[], pend=0, venc=0, prox=null;
  delMes.forEach(function(a){ (a.acuerdos||[]).forEach(function(ac){ acuMes.push({ t:ac.t||'', quien:ac.quien||'', plazo:ac.plazo||'', hecho:!!ac.hecho, n:a.n||'' }); }); });
  actas.forEach(function(a){
    (a.acuerdos||[]).forEach(function(ac){ if(ac.hecho) return; pend++; if(ac.plazo && ac.plazo<dia) venc++; });
    if(a.prox && /^\d{4}-\d{2}-\d{2}$/.test(String(a.prox.f||'')) && a.prox.f>=dia && (!prox || String(a.fecha||'')>String(prox.de||''))) prox={ f:a.prox.f, h:a.prox.h||'', l:a.prox.l||'', de:a.fecha };
  });
  return { doc:doc, actas:delMes, tit:tit, quo:quo, ord:delMes.some(function(a){ return a.tipo!=='extraordinaria' && a.tipo!=='eleccion'; }), acuMes:acuMes, pend:pend, venc:venc, prox:prox };
}
function _infTop(L, clave, peso, n){
  var m={}; L.forEach(function(x){ var k=String(clave(x)).trim()||'—'; m[k]=(m[k]||0)+(typeof peso==='function' ? peso(x) : (peso||1)); });
  return Object.keys(m).map(function(k){ return [k, m[k]]; }).sort(function(a, b){ return b[1]-a[1] || a[0].localeCompare(b[0], 'es'); }).slice(0, n||8);
}

/* ── todas las obras: el mismo informe de cada una (de a tres a la vez), y la suma ── */
function _infTraerTodas(mes, obras){
  var out=[], i=0;
  function sig(){
    var O=obras[i++]; if(!O) return Promise.resolve();
    return _infTraer(mes, O, { ligero:true }).then(function(D){ out.push({ O:O, D:D }); }, function(){ out.push({ O:O, D:null }); }).then(sig);
  }
  return Promise.all([sig(), sig(), sig()]).then(function(){
    out.sort(function(a, b){ return obras.indexOf(a.O)-obras.indexOf(b.O); });
    return { mes:mes, obras:out, tot:_infTotales(out) };
  });
}
function _infTotales(out){
  var t={ activos:0, cat:{ o:0, s:0 }, hh:{ dias:0, obN:0, stN:0, obProm:0, stProm:0, obHHT:0, stHHT:0, hht:0, hhc:0, hhcOb:0, hhcSt:0, hhcSin:0 }, acc:{ mes:0, inc:0, anio:0, nIF:0, dias:0, hAnio:0 },
          ats:{ n:0, cerrados:0, sinCierre:0 }, rep:{ n:0, cerrados:0, abiertosHoy:0 }, insp:{ n:0 }, epp:{ entregas:0, und:0, P:0, costo:0, mon:'' },
          com:{ actas:0, ord:0, pend:0, venc:0 }, ch:{ L:[], tot:{ veces:0, asis:0, o:0, s:0, hhc:0, min:0 } } };
  var T={};
  /* 19/10/2026 · lote 19 · el personal, las observaciones y lo acumulado en el año */
  t.per={ act:0, desc:0, ob:0, st:0, ing:0, ces:0, tras:0 }; t.obs={ acto:0, condicion:0, sug:0, buena:0, n:0, cerr:0 }; t.hhA={ hht:0, hhc:0, obHHT:0, stHHT:0, hhcOb:0, hhcSt:0 };
  out.forEach(function(x){
    var D=x.D; if(!D) return;
    t.activos+=D.activos; t.cat.o+=D.cat.o; t.cat.s+=D.cat.s;
    /* el personal por día de todas: la suma de lo de cada obra (cada una, el promedio de sus días) */
    ['dias', 'obN', 'stN', 'obProm', 'stProm', 'obHHT', 'stHHT', 'hht', 'hhc', 'hhcOb', 'hhcSt', 'hhcSin'].forEach(function(k){ t.hh[k]+=D.hh[k]||0; });
    t.acc.mes+=D.acc.mes; t.acc.inc+=D.acc.inc; t.acc.anio+=D.acc.anio; t.acc.nIF+=D.acc.nIF; t.acc.dias+=D.acc.dias; t.acc.hAnio+=D.acc.hAnio;
    t.ats.n+=D.ats.n; t.ats.cerrados+=D.ats.cerrados; t.ats.sinCierre+=D.ats.sinCierre;
    t.rep.n+=D.rep.n; t.rep.cerrados+=D.rep.cerrados; t.rep.abiertosHoy+=D.rep.abiertosHoy;
    t.insp.n+=D.insp.n;
    if(D.per) ['act', 'desc', 'ob', 'st', 'ing', 'ces', 'tras'].forEach(function(k){ t.per[k]+=D.per[k]||0; });
    if(D.obs){ ['acto', 'condicion', 'sug', 'buena'].forEach(function(k){ t.obs[k]+=D.obs.tot[k]||0; }); t.obs.n+=D.obs.lev.n; t.obs.cerr+=D.obs.lev.cerr; }
    if(D.hhA) ['hht', 'hhc', 'obHHT', 'stHHT', 'hhcOb', 'hhcSt'].forEach(function(k){ t.hhA[k]+=D.hhA.acum[k]||0; });
    t.epp.entregas+=D.epp.entregas; t.epp.und+=D.epp.und; t.epp.P+=(D.epp.cons ? D.epp.cons.tot.P : 0);
    if(D.epp.costo && D.epp.costo.total){ t.epp.costo+=D.epp.costo.total; t.epp.mon=t.epp.mon || D.epp.mon; }
    if(D.com){ t.com.actas+=D.com.actas.length; t.com.ord+=(D.com.ord ? 1 : 0); t.com.pend+=D.com.pend; t.com.venc+=D.com.venc; }
    D.ch.L.forEach(function(c){ var y=T[c.k]||(T[c.k]={ k:c.k, n:c.n, veces:0, asis:0, o:0, s:0, hhc:0, min:0 }); ['veces', 'asis', 'o', 's', 'hhc', 'min'].forEach(function(k){ y[k]+=c[k]; }); });
    ['veces', 'asis', 'o', 's', 'hhc', 'min'].forEach(function(k){ t.ch.tot[k]+=D.ch.tot[k]; });
  });
  t.acc.IF=t.acc.hAnio ? t.acc.nIF*1e6/t.acc.hAnio : null; t.acc.IS=t.acc.hAnio ? t.acc.dias*1e6/t.acc.hAnio : null;
  t.ch.L=Object.keys(T).map(function(k){ return T[k]; }).sort(function(a, b){ return (b.hhc-a.hhc) || (b.veces-a.veces); });
  return t;
}

/* ── armar: los datos, el PDF y lo que se baja ── */
function _infLibPdf(){ if(window.PDFLib) return Promise.resolve(window.PDFLib); return _cargarJS('pdflib/pdf-lib.min.js?v=1.17.1', function(){ return !!window.PDFLib; }).then(function(){ return window.PDFLib; }); }
function infArmar(){
  if(INFW.armando) return;
  if(INFW.tipo==='amb') return _infArmarAmb();
  if(INFW.tipo==='sal') return _infArmarSal();
  var todas=(INFW.alcance==='todas' && _infTodasPuede());
  var va=function(k){ return INFW.secc.some(function(x){ return x.k===k && _infVa(x); }); }, vaProg=!todas && (va('programas') || va('objetivos'));
  INFW.armando=true;
  ['inf-armar', 'inf-armar2'].forEach(function(id){ var b=$(id); if(b){ b.disabled=true; b.textContent='Armando…'; } });
  var fin=function(){ INFW.armando=false; ['inf-armar', 'inf-armar2'].forEach(function(id){ var b=$(id); if(b){ b.disabled=false; b.textContent='Armar el informe ›'; } }); };
  var p=todas
    ? Promise.all([_infTraerTodas(INFW.mes, _infObras()), cargarEvPDF(), _infLibPdf()]).then(function(r){
        INFW.datosT=r[0]; INFW.datos=null;
        var base=_infPdfTodas(r[0]); return _infUnir(base.bytes, base.indice, true);
      })
    : (vaProg ? cargarProgramas().catch(function(){ return null; }) : Promise.resolve(null)).then(function(){
        return Promise.all([_infTraer(INFW.mes, YO.obra, { prog:vaProg }), cargarEvPDF(), _infLibPdf()]);
      }).then(function(r){
        var vaF=va('fotos');
        return vaF ? _infFotosTraer(r[0]).then(function(){ return r; }) : r;
      }).then(function(r){
        /* 19/10/2026 · lote 19 · las fotos de la tabla de observaciones y las del registro fotográfico */
        var D=r[0], esp=[];
        if(va('obstabla')){ var Lo=D.obs.L.filter(function(x){ return x.tipo==='acto' || x.tipo==='condicion'; }); esp.push(_infMinis(Lo, 'foto', 220, 165, 240), _infMinis(Lo, 'fotoD', 220, 165, 240)); }
        if(va('fotoreg')) esp.push(_infFregTraer(D));
        return Promise.all(esp).then(function(){ return r; });
      }).then(function(r){
        INFW.datos=r[0]; INFW.datosT=null;
        var base=_infPdfBase(r[0]); return _infUnir(base.bytes, base.indice, false);
      });
  p.then(function(out){ fin(); INFW.pdf=out; _infVer(out); },
         function(e){ fin(); toast(e==='sin_red' ? 'No se pudo cargar lo que arma el PDF. Revisa tu conexión.' : 'No se pudo armar el informe: '+((e && e.message) || e)); });
}

/* ── el PDF: una hoja A4 con la cabecera de la obra; cifras, tablas (con filas de grupo, de subtotal y de total), barras y notas ── */
function _infDocNuevo(cabTit, cabSub){
  var J=window.jspdf && window.jspdf.jsPDF; if(!J) throw new Error('Falta el generador de PDF');
  var doc=new J({unit:'pt', format:'a4'}), W=595.28, H=841.89, M=42;
  /* 19/10/2026 · lote 19 · una hoja nueva es vertical, aunque la anterior fuera horizontal (la tabla de observaciones) */
  var _addPag=doc.addPage.bind(doc); doc.addPage=function(f, o){ return _addPag(f || 'a4', o || 'portrait'); };
  var C={ TINTA:[11,42,58], ORO:[245,183,0], GRIS:[107,124,136], TEXTO:[34,50,61], RAYA:[218,225,230], FONDO:[244,247,249], BLANCO:[255,255,255], SUAVE:[188,205,214], OK:[30,142,90], MAL:[198,50,58],
            GRUPO:[228,237,242], SUB:[240,244,246], TOT:[222,230,235] };
  var P={ doc:doc, W:W, H:H, M:M, y:0, C:C, cabTit:cabTit, cabSub:cabSub };
  P.L=function(peso, tam, c){ doc.setFont('helvetica', peso||'normal'); doc.setFontSize(tam); if(c) doc.setTextColor(c[0], c[1], c[2]); };
  P.F=function(c){ doc.setFillColor(c[0], c[1], c[2]); };
  P.T=function(s){ return _edPdfTx(txPaisP(String(s==null ? '' : s))); };
  P.cortar=function(s, w){ s=P.T(s); if(doc.getTextWidth(s)<=w) return s; while(s.length>1 && doc.getTextWidth(s+'…')>w) s=s.slice(0, -1); return s+'…'; };
  P.cab=function(titulo){
    P.usada=true;
    P.F(C.TINTA); doc.rect(0, 0, W, 58, 'F'); P.F(C.ORO); doc.rect(0, 58, W, 3, 'F');
    P.L('bold', 12, C.BLANCO); doc.text(P.cortar(String(cabTit).toUpperCase(), W-2*M-170), M, 27);
    P.L('normal', 8.5, C.SUAVE); doc.text(P.cortar(cabSub, W-2*M-170), M, 42);
    P.L('bold', 8, [255,226,150]); doc.text(P.T('INFORME DEL MES'), W-M, 27, {align:'right'});
    /* 19/10/2026 · lote 19 · un título largo («… (continúa)») achica la letra antes de cortarse */
    P.y=96; var tam=17; P.L('bold', tam, C.TINTA); while(tam>12 && doc.getTextWidth(P.T(titulo))>W-2*M){ tam--; P.L('bold', tam, C.TINTA); }
    doc.text(P.cortar(titulo, W-2*M), M, P.y); P.y+=24;
  };
  /* una parte nueva: en su hoja; en el modo corto (el Básico), en la misma hoja si queda sitio */
  P.sec=function(titulo){
    P.secT=titulo;
    if(!P.usada){ P.cab(titulo); return; }
    if(P.compacto && P.y+(P.minSec||260)<=H-60){
      P.y+=4; doc.setDrawColor(C.ORO[0], C.ORO[1], C.ORO[2]); doc.setLineWidth(1.5); doc.line(M, P.y, W-M, P.y); doc.setLineWidth(0.5); P.y+=24;
      var t2=15; P.L('bold', t2, C.TINTA); while(t2>12 && doc.getTextWidth(P.T(titulo))>W-2*M){ t2--; P.L('bold', t2, C.TINTA); }
      doc.text(P.cortar(titulo, W-2*M), M, P.y); P.y+=22; return;
    }
    doc.addPage(); P.cab(titulo);
  };
  P.cifras=function(L4){
    var n=L4.length, g=10, w=(W-2*M-g*(n-1))/n;
    L4.forEach(function(c, i){
      var x=M+i*(w+g); P.F(C.FONDO); doc.setDrawColor(C.RAYA[0], C.RAYA[1], C.RAYA[2]); doc.roundedRect(x, P.y, w, 64, 6, 6, 'FD');
      /* la etiqueta: en una línea si cabe; si no, en dos (un poco más chica) */
      var et=P.T(String(c[0]).toUpperCase()); P.L('normal', 7.5, C.GRIS);
      if(doc.getTextWidth(et)<=w-16) doc.text(et, x+10, P.y+16);
      else {
        P.L('normal', 6.8, C.GRIS);
        var ls=doc.splitTextToSize(et, w-16);
        if(ls.length>2){ var l2=ls.slice(1).join(' '); while(l2.length>1 && doc.getTextWidth(l2+'…')>w-16) l2=l2.slice(0, -1); ls=[ls[0], l2+'…']; }
        doc.text(ls, x+10, P.y+12.5);
      }
      P.L('bold', 20, c[3]==='mal' ? C.MAL : (c[3]==='ok' ? C.OK : C.TINTA)); doc.text(P.T(String(c[1])), x+10, P.y+42);
      /* el pie: si no entra, un poco más chico antes de cortarlo */
      if(c[2]){ P.L('normal', 7.5, C.GRIS); if(doc.getTextWidth(P.T(String(c[2])))>w-16) P.L('normal', 6.5, C.GRIS); doc.text(P.cortar(c[2], w-16), x+10, P.y+56); }
    });
    P.y+=84;
  };
  /* filas: [valores] · { g:'texto' } una fila de grupo · { v:[valores], t:'sub'|'tot' } un subtotal o el total, en negrita */
  P.tabla=function(tit, cols, filas, anchos, op){
    op=op||{}; var num=op.num||{}, cx=[M];
    for(var i=1;i<anchos.length;i++) cx.push(cx[i-1]+anchos[i-1]);
    /* si la tabla entera pasa a la hoja siguiente, lo que continúa es la parte (la tabla empieza con su título) */
    if(P.y+70>H-60){ doc.addPage(); P.cab((P.secT || tit || op.pag || '')+' (continúa)'); }
    if(tit){ P.L('bold', 10.5, C.TINTA); doc.text(P.T(tit), M, P.y); P.y+=10; }
    function cabT(){
      P.F(C.TINTA); doc.rect(M, P.y, W-2*M, 16, 'F'); P.L('bold', 7.5, C.BLANCO);
      cols.forEach(function(c, j){ if(num[j]) doc.text(P.T(c), cx[j]+anchos[j]-6, P.y+11, {align:'right'}); else doc.text(P.T(c), cx[j]+6, P.y+11); });
      P.y+=16;
    }
    cabT();
    if(!filas.length){ P.L('normal', 8.5, C.GRIS); doc.text(P.T(op.vacio || 'Nada registrado este mes.'), M+6, P.y+14); P.y+=26; return; }
    var k=0;
    filas.forEach(function(f){
      if(P.y+18>H-60){ doc.addPage(); P.cab((tit || op.pag || '')+' (continúa)'); cabT(); }
      if(f && !Array.isArray(f) && f.g!=null){
        P.F(C.GRUPO); doc.rect(M, P.y, W-2*M, 17, 'F'); P.L('bold', 8.5, C.TINTA); doc.text(P.cortar(f.g, W-2*M-12), M+6, P.y+12); P.y+=17; k=0; return;
      }
      var v=Array.isArray(f) ? f : f.v, t=Array.isArray(f) ? '' : (f.t||'');
      if(t==='tot'){ P.F(C.TOT); doc.rect(M, P.y, W-2*M, 18, 'F'); } else if(t==='sub'){ P.F(C.SUB); doc.rect(M, P.y, W-2*M, 18, 'F'); } else if(k%2){ P.F([250,251,252]); doc.rect(M, P.y, W-2*M, 18, 'F'); }
      P.L(t ? 'bold' : 'normal', 8.5, C.TEXTO);
      v.forEach(function(val, j){ var s=P.cortar(String(val==null ? '' : val), anchos[j]-12); if(num[j]) doc.text(s, cx[j]+anchos[j]-6, P.y+12.5, {align:'right'}); else doc.text(s, cx[j]+6, P.y+12.5); });
      doc.setDrawColor(C.RAYA[0], C.RAYA[1], C.RAYA[2]); doc.setLineWidth(0.5); doc.line(M, P.y+18, W-M, P.y+18); P.y+=18; k++;
    });
    P.y+=18;
  };
  P.nota=function(t){ if(P.y+20>H-60){ doc.addPage(); P.cab(P.secT ? P.secT+' (continúa)' : ''); } P.L('normal', 8.5, C.GRIS); var l=doc.splitTextToSize(P.T(t), W-2*M); doc.text(l, M, P.y); P.y+=l.length*11+8; };
  /* barras horizontales de una sola serie (el nombre va en cada barra; el valor, al final) */
  P.barras=function(tit, L, fmt){
    if(!L.length) return;
    var mx=Math.max.apply(null, L.map(function(t){ return t.v; }).concat([0.01])), et=150, bw=W-2*M-et-60;
    if(P.y+20+L.length*18>H-60){ doc.addPage(); P.cab((P.secT || tit)+' (continúa)'); }
    P.L('bold', 10.5, C.TINTA); doc.text(P.T(tit), M, P.y); P.y+=14;
    L.forEach(function(t){
      /* la categoría larga: un poco más chica antes de cortarla */
      P.L('normal', 8.5, C.TEXTO); if(doc.getTextWidth(P.T(String(t.n)))>et-10) P.L('normal', 7.3, C.TEXTO); doc.text(P.cortar(t.n, et-10), M, P.y+9);
      P.F(C.FONDO); doc.rect(M+et, P.y, bw, 12, 'F');
      var w=Math.max(t.v>0 ? 2 : 0, bw*t.v/mx); if(w){ P.F(C.TINTA); doc.rect(M+et, P.y, w, 12, 'F'); }
      P.L('bold', 8.5, C.TEXTO); doc.text(P.T(fmt(t.v)), M+et+w+6, P.y+9);
      P.y+=18;
    });
    P.y+=10;
  };
  P.portada=function(titulo, nombre, sub, datos){
    P.F(C.TINTA); doc.rect(0, 0, W, 300, 'F'); P.F(C.ORO); doc.rect(0, 300, W, 5, 'F');
    P.L('bold', 9, [255,226,150]); doc.text(P.T(titulo), M, 92);
    P.L('bold', 30, C.BLANCO); doc.text(P.T(_infMesMay(INFW.mes)), M, 140);
    P.L('bold', 16, C.BLANCO); doc.text(doc.splitTextToSize(P.T(nombre), W-2*M).slice(0, 2), M, 176);
    if(sub){ P.L('normal', 11, C.SUAVE); doc.text(P.cortar(sub, W-2*M), M, 214); }
    P.y=350;
    datos.forEach(function(f){ P.L('normal', 8, C.GRIS); doc.text(P.T(String(f[0]).toUpperCase()), M, P.y); P.L('bold', 11, C.TEXTO); doc.text(P.cortar(f[1], W-2*M), M, P.y+15); P.y+=34; });
    P.y+=6; P.L('bold', 11, C.TINTA); doc.text(P.T('Contenido'), M, P.y); P.y+=8; doc.setDrawColor(C.RAYA[0], C.RAYA[1], C.RAYA[2]); doc.line(M, P.y, W-M, P.y); P.y+=16;
    INFW._yIndice=P.y;     /* el índice se escribe al final, cuando se sabe en qué página empieza cada cosa */
    P.usada=true; P.y=H;   /* la portada es suya: lo que sigue va en otra hoja */
  };
  /* 19/10/2026 · lote 19 · columnas, líneas, el avance, la pirámide, las fotos y las tablas de texto largo */
  _infGraficos(P);
  return P;
}
function _infParaTxt(){ return (INFW.para==='cliente' ? 'Cliente' : 'Gerencia')+(String(INFW.paraN||'').trim() ? ': '+String(INFW.paraN).trim() : ''); }
/* las tablas de las horas hombre y de los temas: las mismas en el informe de una obra y en el de todas */
function _infTablaHH(P, Hh, tit, Ac){
  var W=P.W, M=P.M, d=Hh.dias||0, po=(Hh.obProm!=null) ? Hh.obProm : (d ? Hh.obN/d : 0), ps=(Hh.stProm!=null) ? Hh.stProm : (d ? Hh.stN/d : 0), a=!!Ac;
  /* 19/10/2026 · lote 19 · Marcelo: «HHC y HHT, se vea la parte también de acumulable en el año» */
  P.tabla(tit || 'Horas hombre del mes, obreros y staff', ['', 'Obreros', 'Staff', 'Total del mes'].concat(a ? ['Acumulado del año'] : []), [
    ['Personal por día (promedio)', d ? _infDec(po) : '—', d ? _infDec(ps) : '—', d ? _infDec(po+ps) : '—'].concat(a ? ['—'] : []),
    ['Horas hombre trabajadas (HHT)', _infNum(Hh.obHHT), _infNum(Hh.stHHT), _infNum(Hh.hht)].concat(a ? [_infNum(Ac.hht)] : []),
    ['Horas hombre de capacitación (HHC)', _infDec(Hh.hhcOb), _infDec(Hh.hhcSt), _infDec(Hh.hhc)].concat(a ? [_infDec(Ac.hhc)] : []),
    { v:['Capacitación sobre lo trabajado', _infPct(Hh.hhcOb, Hh.obHHT), _infPct(Hh.hhcSt, Hh.stHHT), _infPct(Hh.hhc, Hh.hht)].concat(a ? [_infPct(Ac.hhc, Ac.hht)] : []), t:'sub' }
  ], a ? [W-2*M-340, 72, 72, 88, 108] : [W-2*M-285, 95, 95, 95], { num:{ 1:1, 2:1, 3:1, 4:1 } });   /* «Horas hombre de capacitación (HHC)» entra entera */
  if(Hh.hhcSin>0.05) P.nota('De las '+_infDec(Hh.hhc)+' HHC, '+_infDec(Hh.hhcSin)+' se registraron sin separar obreros y staff (días anteriores): están en el total.');
  if(!d) P.nota('Sin horas hombre registradas este mes: se registran en el «Reporte semanal» de la app o en «Horas hombre» de la web.');
}
/* los temas: uno por uno (con el total de cada tipo y el del mes) o solo el total por tipo */
function _infFilasTemas(Ch, desglose, conObra){
  var F=[];
  if(desglose){
    Ch.L.forEach(function(t){
      F.push({ g:t.n+' · '+t.veces+(t.veces===1 ? ' vez' : ' veces') });
      Ch.S.filter(function(x){ return x.k===t.k; }).forEach(function(x){ F.push([_infFechaC(x.f), x.tema, _infNum(x.n), _infMin(x.min), _infDec(x.hhc)]); });
      F.push({ v:['', 'Total · '+t.n, _infNum(t.asis), _infMin(t.min), _infDec(t.hhc)], t:'sub' });
    });
  } else Ch.L.forEach(function(t){ F.push([t.n, t.veces, _infNum(t.asis), _infMin(t.min), _infDec(t.hhc)]); });
  if(Ch.L.length) F.push({ v:[desglose ? '' : 'Total del mes', desglose ? 'Total del mes' : Ch.tot.veces, _infNum(Ch.tot.asis), _infMin(Ch.tot.min), _infDec(Ch.tot.hhc)], t:'tot' });
  return F;
}
function _infPdfBase(D, op){
  var obra=nombreObraP()||'Obra', emp=empresaDeObraP()||'', mesN=_infMesN(D.mes), indice=[], basico=(INFW.nivel==='basico'), desglose=(INFW.temas!=='total');
  var P=_infDocNuevo(obra, 'Informe de seguridad y salud en el trabajo · '+mesN), doc=P.doc, W=P.W, H=P.H, M=P.M, C=P.C;
  /* 19/10/2026 · lote 19 · para los documentos separados, cada parte en su hoja (así se corta por partes) */
  INFW._yIndice=0; P.compacto=(INFW.nivel!=='completo') && !(op && op.separado);
  var S=INFW.secc.filter(_infVa);
  S.forEach(function(x){
    if(x.k==='anexos') return;
    var s=_infSeccN(x.k);
    if(x.k==='portada'){
      P.portada('INFORME DE SEGURIDAD Y SALUD EN EL TRABAJO', obra, emp, [['Para', _infParaTxt()], ['Elaborado por', String(INFW.por||'').trim() || '—'], ['Emitido', fechaLarga(hoyISO())], ['Código de la obra', (YO.obra||{}).codigo||'—']]);
      return;
    }
    /* 19/10/2026 · lote 19 · la tabla de observaciones va en hojas horizontales */
    if(x.k==='obstabla'){ var pgO=_infObsTabla(P, D); if(pgO){ indice.push({ t:s.n, p:pgO }); return; } }
    P.sec(s.n); indice.push({ t:s.n, p:doc.getNumberOfPages() });
    if(_infSecc19(P, D, x.k, { basico:basico, completo:INFW.nivel==='completo', desglose:desglose })) return;
    if(x.k==='obstabla'){ P.nota('No hubo actos ni condiciones en el mes.'); return; }
    if(x.k==='resumen'){
      var Hh=D.hh;
      P.cifras([['Personal activo', D.activos, D.cat.o+' obreros · '+D.cat.s+' staff'], ['Horas hombre trabajadas', _infNum(Hh.hht), Hh.dias ? Hh.dias+(Hh.dias===1 ? ' día registrado' : ' días registrados') : 'sin registrar'],
                ['Horas hombre de capacitación', _infDec(Hh.hhc), Hh.hht ? _infPct(Hh.hhc, Hh.hht)+' de lo trabajado' : ''], ['Accidentes del mes', D.acc.mes, _infAccSub(D.acc), D.acc.mes ? 'mal' : 'ok']]);
      _infTablaHH(P, Hh, null, D.hhA && D.hhA.acum);
      P.tabla('Índices del año (hasta fin de mes)', ['Indicador', 'Valor', 'Cómo se calcula'], [
        ['Horas hombre del año', _infNum(D.acc.hAnio), 'suma de las horas registradas'],
        ['Accidentes que cuentan', D.acc.nIF, 'con incapacidad o mortales'],
        ['Días perdidos', D.acc.dias, 'de esos accidentes'],
        ['Índice de frecuencia', _infDec2(D.acc.IF), 'accidentes × 1 000 000 / horas hombre'],
        ['Índice de severidad', _infDec2(D.acc.IS, 1), 'días perdidos × 1 000 000 / horas hombre'],
        ['Incidentes del año', D.acc.incAnio, 'casi accidentes, primeros auxilios y daños']
      ], [150, 90, W-2*M-240]);
      if(!D.acc.hAnio) P.nota('Sin horas hombre registradas en el año, los índices no se pueden calcular.');
    }
    if(x.k==='charlas'){
      var Ch=D.ch, Tt=Ch.tot;
      P.cifras([['Charlas y capacitaciones', Tt.veces, Tt.qr+' con QR · '+Tt.reg+' registradas'], ['Personas', _infNum(Tt.asis), Tt.o+' obreros · '+Tt.s+' staff'],
                ['Duración', _infMin(Tt.min), 'sumando todas'], ['Horas hombre de capacitación', _infDec(Tt.hhc), D.hh.hht ? _infPct(Tt.hhc, D.hh.hht)+' de lo trabajado' : 'HHC del mes']]);
      P.barras('Horas hombre de capacitación, por tipo', Ch.L.slice(0, 10).map(function(t){ return { n:t.n, v:t.hhc }; }), _infDec);
      P.tabla(desglose ? 'Los temas del mes, uno por uno' : 'Los temas del mes, por tipo de charla', desglose ? ['Fecha', 'Tema', 'Personas', 'Duración', 'HHC'] : ['Tipo', 'Veces', 'Personas', 'Duración', 'HHC'],
        _infFilasTemas(Ch, desglose), desglose ? [62, W-2*M-262, 60, 75, 65] : [W-2*M-260, 55, 65, 75, 65], { num:desglose ? { 2:1, 3:1, 4:1 } : { 1:1, 2:1, 3:1, 4:1 }, vacio:'Ninguna charla registrada este mes.' });
      if(!Ch.marcas) P.nota('No se pudo leer quiénes marcaron en las asistencias con QR: esas salen sin personas.');
      if(Math.abs(Tt.hhc-D.hh.hhc)>0.5 && D.hh.hhc>0) P.nota('En el reporte semanal de horas hombre se anotaron '+_infDec(D.hh.hhc)+' HHC este mes (las que van en los indicadores); aquí suman '+_infDec(Tt.hhc)+'.');
      P.nota('Salen de las asistencias con QR de la app y de las capacitaciones registradas en la web o escaneadas con su hoja firmada. HHC = personas × minutos / 60.');
    }
    if(x.k==='capacitacion'){
      P.cifras([['Evaluaciones del mes', D.cap.n, 'constancias'], ['Aprobadas', D.cap.ok, D.cap.n ? Math.round(D.cap.ok*100/D.cap.n)+' %' : '', D.cap.n && D.cap.ok===D.cap.n ? 'ok' : ''], ['Temas', D.cap.temas.length, 'distintos']]);
      P.tabla('Los temas evaluados', ['Tema', 'Evaluaciones'], D.cap.temas.map(function(t){ return [t[0], t[1]]; }), [W-2*M-110, 110], { num:{ 1:1 } });
    }
    if(x.k==='ats'){
      var At=D.ats, otros=At.n-At.cerrados-At.sinCierre;
      P.cifras([['ATS del mes', At.n, ''], ['Cerrados', At.cerrados, At.n ? Math.round(At.cerrados*100/At.n)+' %' : '', At.n && At.cerrados===At.n ? 'ok' : ''],
                ['Sin cierre', At.sinCierre, 'falta la firma de salida o la foto', At.sinCierre ? 'mal' : 'ok'], ['Otros', otros, 'en curso o sin liberar']]);
      P.tabla('Por estado', ['Estado', 'ATS'], INF_ATS_EST.filter(function(e){ return At.c[e[0]]; }).map(function(e){ return [e[1], At.c[e[0]]]; }), [W-2*M-110, 110], { num:{ 1:1 } });
      var sinC=At.L.filter(function(a){ return a.est==='porcerrar'; });
      if(sinC.length && !basico){
        P.tabla('Los que quedaron sin cierre', ['Fecha', 'Trabajo', 'Lugar'], sinC.slice(0, 25).map(function(a){ return [_infFechaC(a.f), a.t, a.lugar||'—']; }), [70, W-2*M-220, 150]);
        if(sinC.length>25) P.nota('…y '+(sinC.length-25)+' más.');
      }
      if(sinC.length && D.mes<'2026-12') P.nota('El cierre del ATS (la firma de salida de la cuadrilla y la foto de cómo quedó el área) se pide en la app desde su versión de octubre de 2026: los de antes figuran sin cierre.');
    }
    if(x.k==='inspecciones'){
      P.cifras([['Inspecciones del mes', D.insp.n, ''], ['Tipos', D.insp.tipos.length, 'distintos']]);
      P.tabla('Por tipo', ['Tipo', 'Del mes'], D.insp.tipos.map(function(t){ return [t[0], t[1]]; }), [W-2*M-110, 110], { num:{ 1:1 } });
      /* 19/10/2026 · lote 19 · lo que encontraron, en actos, condiciones, sugerencias y buenas prácticas */
      var Oi=D.obs && D.obs.insp;
      if(Oi && Oi.n) P.tabla('Lo que encontraron, por tipo', ['', 'Actos', 'Condiciones', 'Sugerencias', 'Buenas prácticas', 'Total'], [['Observaciones de las inspecciones del mes', Oi.acto, Oi.condicion, Oi.sug, Oi.buena, Oi.n]], [W-2*M-300, 46, 64, 64, 80, 46], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1 } });
      else if(D.insp.n) P.nota('Las inspecciones del mes no anotaron observaciones.');
      if(Oi && Oi.n) P.nota('Lo que se encontró en cada inspección se clasifica (acto, condición, sugerencia o buena práctica) con «Clasificar uno por uno», en «Reportes». Sin clasificar, cuenta como condición.');
    }
    if(x.k==='epp'){
      var _ec=[['Entregas del mes', D.epp.entregas, 'con la firma de quien recibe'], ['Unidades', D.epp.und, 'entregadas']], _V=D.epp.verif, _C=D.epp.costo;
      if(_V && _V.n) _ec.push(['Uso correcto', _V.pct+'%', _V.n+(_V.n===1 ? ' verificación en campo' : ' verificaciones en campo'), _V.pct>=90 ? 'ok' : (_V.pct<70 ? 'mal' : '')]);
      if(_C && _C.total) _ec.push(['Costo del EPP entregado', D.epp.mon+' '+_C.total.toFixed(2), D.epp.mon+' '+_C.prom.toFixed(2)+' por trabajador']);
      var _Cs=D.epp.cons, _cons=!basico && !!(_Cs && _Cs.L.length) && (typeof planWebTrae!=='function' || planWebTrae('kardex_export'));
      if(_cons && _Cs.tot.P) _ec.push(['Por pérdida', _Cs.tot.P, Math.round(_Cs.tot.P*100/Math.max(1, _Cs.tot.und))+' % de las unidades', _Cs.tot.P*100/Math.max(1, _Cs.tot.und)>10 ? 'mal' : '']);
      P.cifras(_ec.slice(0, 4));
      if(_cons){
        var _cxE={}; if(_C && _C.porEpp) _C.porEpp.forEach(function(t){ _cxE[t.n]=t.s; });
        var _conC=!!(_C && _C.total);
        P.tabla('El consumo del mes, por EPP', ['EPP', 'Unidades', 'Nuevas', 'Cambio', 'Pérdida', 'Trab.'].concat(_conC ? ['Costo ('+D.epp.mon+')'] : []),
          _Cs.L.map(function(t){ return [t.n, t.und, t.N, t.C, t.P, t.trab].concat(_conC ? [_cxE[t.n]!=null ? _cxE[t.n].toFixed(2) : '—'] : []); }),
          _conC ? [W-2*M-370, 62, 56, 56, 56, 50, 90] : [W-2*M-290, 70, 60, 60, 60, 40], { num:_conC ? { 1:1, 2:1, 3:1, 4:1, 5:1, 6:1 } : { 1:1, 2:1, 3:1, 4:1, 5:1 } });
        P.nota('Nuevas: primera entrega · Cambio: cambio o reposición por desgaste · Pérdida: reposición por pérdida. Trab.: a cuántos trabajadores se les entregó.');
      } else {
        P.tabla('Lo que más salió', ['EPP', 'Unidades'], D.epp.top.slice(0, basico ? 5 : 8).map(function(t){ return [t[0], t[1]]; }), [W-2*M-110, 110], { num:{ 1:1 } });
        if(!basico && typeof planWebTrae==='function' && !planWebTrae('kardex_export')) P.nota('El consumo de cada EPP (lo nuevo, los cambios y las pérdidas) se suma desde el plan Supervisor SST.');
      }
      if(!basico && _V && _V.falta.length) P.tabla('Verificación en campo: lo que faltaba', ['EPP', 'Veces'], _V.falta.slice(0, 8).map(function(t){ return [t.n, t.c]; }), [W-2*M-110, 110], { num:{ 1:1 } });
      if(_C && _C.porEpp.length && !_cons && !basico) P.tabla('Lo que costó, por EPP', ['EPP', 'Unidades', 'Costo ('+D.epp.mon+')'], _C.porEpp.slice(0, 12).map(function(t){ return [t.n, t.c, t.s.toFixed(2)]; }), [W-2*M-220, 110, 110], { num:{ 1:1, 2:1 } });
      if(_C && _C.total && _C.sinPrecio.length && !basico) P.nota('Sin precio (no cuentan en el costo): '+_C.sinPrecio.slice(0, 10).join(', ')+(_C.sinPrecio.length>10 ? '…' : '')+'.');
    }
    if(x.k==='comite'){
      var Cm=D.com;
      if(!Cm){ P.nota('No hay un comité registrado en esta obra, o no se pudo leer.'); return; }
      P.cifras([['Reuniones del mes', Cm.actas.length, Cm.ord ? 'con la ordinaria del mes' : 'sin la ordinaria del mes', Cm.ord ? 'ok' : 'mal'],
                ['Acuerdos del mes', Cm.acuMes.length, Cm.acuMes.filter(function(a){ return a.hecho; }).length+' cumplidos'],
                ['Acuerdos pendientes', Cm.pend, Cm.venc ? Cm.venc+' fuera de plazo' : 'ninguno fuera de plazo', Cm.venc ? 'mal' : '']]);
      P.tabla('Las reuniones del mes', ['N.º', 'Fecha', 'Tipo', 'Asistencia'], Cm.actas.map(function(a){
        var as=(a.asistentes||[]).length;
        return [a.n||'—', fechaLarga(a.fecha)||a.fecha, INF_COM_TIPO[a.tipo]||'Reunión', a.subida ? 'Acta escaneada' : (as+' de '+Cm.tit+(Cm.quo ? (as>=Cm.quo ? ' · con quórum' : ' · sin quórum') : ''))];
      }), [50, 90, 120, W-2*M-260]);
      if(Cm.acuMes.length) P.tablaW('Los acuerdos del mes', ['Acuerdo', 'Responsable', 'Plazo', 'Estado'], Cm.acuMes.map(function(a){ return [a.t, a.quien||'—', a.plazo ? (fechaLarga(a.plazo)||a.plazo) : 'sin plazo', a.hecho ? 'Cumplido' : 'Pendiente']; }), [W-2*M-300, 120, 100, 80]);
      if(Cm.prox) P.nota('Próxima reunión: '+(fechaLarga(Cm.prox.f)||Cm.prox.f)+(Cm.prox.h ? ', a las '+Cm.prox.h : '')+(Cm.prox.l ? ' · '+Cm.prox.l : '')+'.');
      if(Cm.actas.length) P.nota('Las actas del mes van completas en los anexos.');
    }
    if(x.k==='riesgo'){
      var R=D.riesgo;
      if(!R){ P.nota('No se pudo calcular el riesgo del mes.'); return; }
      if(R.listo){
        P.cifras([['Próximos 30 días', riesgoPct(R.p), 'entre '+riesgoPct(R.plo)+' y '+riesgoPct(R.phi)], ['En 3 meses', riesgoPct(R.p3), 'si nada cambia'],
                  ['En un año', riesgoPct(R.p12), 'si nada cambia'], ['Confianza', R.conf, Math.round(R.pesoObra*100)+' % es de la obra']]);
        P.nota('Probabilidad de al menos un accidente con descanso médico en los 30 días siguientes al '+fechaLarga(D.dia)+', con '+riesgoNum(R.H)+' horas hombre esperadas. Sale de lo registrado en los 12 meses anteriores ('+riesgoNum(R.E)+' horas hombre y los eventos de la obra), junto con la referencia del sector.');
      } else P.nota(R.motivo==='sin_horas' ? 'Sin horas hombre registradas en los últimos 12 meses no se puede calcular: se registran en «Horas hombre» (la web) o en el reporte semanal (la app).'
                : (R.motivo==='sin_recientes' ? 'No hubo horas hombre en las 8 semanas anteriores: la probabilidad sale cuando vuelva a haberlas.'
                : 'Todavía falta data: la probabilidad sale con 3 meses de horas hombre (o 20,000). Van '+riesgoNum(R.E)+' horas hombre.'));
      var Cc=R.cuenta;
      P.tabla('La pirámide de los últimos 12 meses', ['Nivel', 'Eventos', 'Bird, por cada lesión grave'], [
        ['Con descanso (incapacitantes y mortales)', Cc.S, '1'], ['Leves y de primeros auxilios', Cc.L+Cc.PA, '10'], ['Daños a la propiedad', Cc.D, '30'], ['Casi accidentes', Cc.C, '600']
      ], [W-2*M-250, 90, 160], { num:{ 1:1, 2:1 } });
      if(R.pot) P.nota(R.pot+(R.pot===1 ? ' evento pudo ser grave o mortal' : ' eventos pudieron ser graves o mortales')+(R.potSin ? '; '+R.potSin+' todavía sin medidas.' : ', y todos tienen sus medidas.'));
      riesgoHacer(R).forEach(function(t){ P.nota('· '+String(t).replace(/<[^>]+>/g, '')); });
      P.nota('Es una probabilidad, no una predicción. No reemplaza el IPERC, las inspecciones ni el ATS.');
    }
    if(x.k==='fotos'){
      var Fo=D.fotos||{ L:[], hay:0, fallan:0 };
      if(!Fo.L.length){ P.nota(Fo.hay ? 'Las fotos del mes no se pudieron cargar.' : 'No hay fotos este mes: salen de los reportes, las buenas prácticas y el cierre de los ATS.'); return; }
      var gx=12, cw=(W-2*M-gx)/2, ih=168, ch=ih+44, col=0;
      Fo.L.forEach(function(f, j){
        /* el antes y el después de un reporte van en la misma fila */
        if(col===1 && f.ini && Fo.L[j+1] && Fo.L[j+1].fin){ col=0; P.y+=ch; }
        if(col===0 && P.y+ch>H-50){ doc.addPage(); P.cab('Panel fotográfico (continúa)'); }
        var x0=M+col*(cw+gx), im=f.img, k=Math.min(cw/im.w, ih/im.h), iw=im.w*k, ihh=im.h*k;
        P.F(C.FONDO); doc.rect(x0, P.y, cw, ih, 'F');
        try{ doc.addImage(im.d, 'JPEG', x0+(cw-iw)/2, P.y+(ih-ihh)/2, iw, ihh); }catch(e){}
        P.L('bold', 8.5, C.TEXTO); doc.text(P.cortar(f.tit, cw-4), x0, P.y+ih+12);
        P.L('normal', 7.5, C.GRIS); doc.text(P.cortar(f.sub, cw-4), x0, P.y+ih+23);
        if(f.d){ P.L('normal', 7.5, C.GRIS); doc.text(P.cortar(f.d, cw-4), x0, P.y+ih+33); }
        col++; if(col===2){ col=0; P.y+=ch; }
      });
      if(col) P.y+=ch;
      if(Fo.hay>Fo.L.length) P.nota('Van '+Fo.L.length+' de '+Fo.hay+' fotos del mes'+(Fo.fallan ? ' ('+Fo.fallan+(Fo.fallan===1 ? ' no se pudo cargar)' : ' no se pudieron cargar)') : '')+'.');
    }
    if(x.k==='sctr'){
      if(!D.sctr){ P.nota('No se pudo leer el SCTR de la obra.'); return; }
      var Rs=D.sctr.R;
      P.cifras([['Cubiertos', Rs.ok.length+' de '+Rs.activos, 'salud y pensión, al '+sctrFechaCorta(D.sctr.dia), Rs.activos && Rs.ok.length===Rs.activos ? 'ok' : ''],
                ['Les falta algo', Rs.falta.length+Rs.sinDoc.length, 'sin SCTR o con una sola cobertura', (Rs.falta.length+Rs.sinDoc.length) ? 'mal' : 'ok'], ['Constancias vigentes', D.sctr.vig.length, '']]);
      P.tabla('Constancias vigentes', ['Cobertura', 'Vigencia', 'Aseguradora · póliza', 'Asegurados'],
        D.sctr.vig.map(function(v){ return [sctrCobN(v.cob), sctrFechaCorta(v.de)+' al '+sctrFechaCorta(v.a), [v.aseg, v.pol].filter(Boolean).join(' · ') || '—', v.conLista ? v.l.length : '—']; }), [96, 140, W-2*M-316, 80]);
      P.tabla('En obra, sin cobertura completa', ['Trabajador', docPersonaP(), 'Qué le falta'],
        Rs.falta.map(function(f){ return [f.t.nombre||'', f.t.dni||'', SCTR_ESTADO_N[f.e]||'']; }).concat(Rs.sinDoc.map(function(t){ return [t.nombre||'', '—', SCTR_ESTADO_N.sin_doc]; })), [W-2*M-230, 100, 130]);
    }
  });
  return { doc:doc, bytes:doc.output('arraybuffer'), indice:indice };
}
/* el informe de todas las obras: cada parte, una fila por obra y el total */
function _infPdfTodas(TD){
  var N=_infNivelDe(INFW.nivel) || INF_NIVELES[1], partes=N.todas.slice(), desglose=(INFW.temas!=='total'), emp=_infEmpresaN() || 'Todas las obras', mesN=_infMesN(TD.mes), indice=[];
  var P=_infDocNuevo(emp, 'Informe de seguridad y salud en el trabajo · todas las obras · '+mesN), doc=P.doc, W=P.W, M=P.M, T=TD.tot, ob=TD.obras.filter(function(x){ return x.D; });
  INFW._yIndice=0; P.compacto=(INFW.nivel!=='completo');
  var wO=W-2*M, nom=function(x){ return _infObraN(x.O); };
  P.portada('INFORME DE SEGURIDAD Y SALUD EN EL TRABAJO · TODAS LAS OBRAS', emp, ob.length+(ob.length===1 ? ' obra' : ' obras')+': '+ob.map(nom).join(' · '),
    [['Para', _infParaTxt()], ['Elaborado por', String(INFW.por||'').trim() || '—'], ['Emitido', fechaLarga(hoyISO())], ['Obras', String(ob.length)]]);
  var tot=function(v){ return { v:v, t:'tot' }; };
  partes.forEach(function(k){
    if(k==='fichas'){
      ob.forEach(function(x){
        P.sec(nom(x)); indice.push({ t:'Obra · '+nom(x), p:doc.getNumberOfPages() });
        var D=x.D;
        P.cifras([['Personal activo', D.activos, D.cat.o+' obreros · '+D.cat.s+' staff'], ['Horas hombre trabajadas', _infNum(D.hh.hht), D.hh.dias+' días'], ['HHC', _infDec(D.hh.hhc), _infPct(D.hh.hhc, D.hh.hht)+' de lo trabajado'],
                  ['Accidentes del mes', D.acc.mes, _infAccSub(D.acc), D.acc.mes ? 'mal' : 'ok']]);
        _infTablaHH(P, D.hh, null, D.hhA && D.hhA.acum);
        P.tabla('Lo del mes', ['', 'Del mes', 'Cómo va'], [
          ['Charlas y capacitaciones', D.ch.tot.veces, _infNum(D.ch.tot.asis)+' personas · '+_infDec(D.ch.tot.hhc)+' HHC'],
          ['ATS', D.ats.n, D.ats.cerrados+' cerrados · '+D.ats.sinCierre+' sin cierre'],
          ['Actos y condiciones', D.obs.tot.acto+D.obs.tot.condicion, _infActCondTx(D.obs.tot.acto, D.obs.tot.condicion)+' · '+(D.obs.lev.pct==null ? 'nada que levantar' : D.obs.lev.pct+' % levantadas')],
          ['Sugerencias y buenas prácticas', D.obs.tot.sug+D.obs.tot.buena, D.obs.tot.sug+' sugerencias · '+D.obs.tot.buena+' buenas prácticas'],
          ['Inspecciones', D.insp.n, D.insp.tipos.length+' tipos'],
          ['EPP entregado (unidades)', D.epp.und, D.epp.entregas+' entregas']
        ], [200, 80, wO-280], { num:{ 1:1 } });
      });
      return;
    }
    P.sec(INF_TODAS_N[k]); indice.push({ t:INF_TODAS_N[k], p:doc.getNumberOfPages() });
    if(k==='resumen'){
      P.cifras([['Obras', ob.length, ''], ['Personal activo', T.activos, T.cat.o+' obreros · '+T.cat.s+' staff'], ['Horas hombre trabajadas', _infNum(T.hh.hht), 'HHC '+_infDec(T.hh.hhc)], ['Accidentes del mes', T.acc.mes, _infAccSub(T.acc), T.acc.mes ? 'mal' : 'ok']]);
      P.tabla('Cada obra en el mes', ['Obra', 'Personal', 'HHT', 'HHC', 'Accid.', 'Incid.', 'IF año', 'IS año'],
        ob.map(function(x){ var D=x.D; return [nom(x), D.activos, _infNum(D.hh.hht), _infDec(D.hh.hhc), D.acc.mes, D.acc.inc, _infDec2(D.acc.IF), _infDec2(D.acc.IS, 1)]; })
          .concat([tot(['Todas', T.activos, _infNum(T.hh.hht), _infDec(T.hh.hhc), T.acc.mes, T.acc.inc, _infDec2(T.acc.IF), _infDec2(T.acc.IS, 1)])]),
        [wO-370, 52, 60, 52, 44, 44, 58, 60], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1 } });
      P.nota('IF: accidentes que cuentan × 1 000 000 / horas hombre del año · IS: días perdidos × 1 000 000 / horas hombre del año. El total suma las horas y los accidentes de todas las obras.');
    }
    if(k==='hh'){
      _infTablaHH(P, T.hh, 'Todas las obras', T.hhA);
      P.tabla('Cada obra', ['Obra', 'HHT obreros', 'HHT staff', 'HHC obreros', 'HHC staff', 'HHC / HHT'],
        ob.map(function(x){ var h=x.D.hh; return [nom(x), _infNum(h.obHHT), _infNum(h.stHHT), _infDec(h.hhcOb), _infDec(h.hhcSt), _infPct(h.hhc, h.hht)]; })
          .concat([tot(['Todas', _infNum(T.hh.obHHT), _infNum(T.hh.stHHT), _infDec(T.hh.hhcOb), _infDec(T.hh.hhcSt), _infPct(T.hh.hhc, T.hh.hht)])]),
        [wO-330, 70, 65, 70, 60, 65], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1 } });
      P.tabla('Lo acumulado en el año, cada obra', ['Obra', 'HHT del año', 'HHC del año', 'HHC / HHT'], ob.map(function(x){ var a=x.D.hhA.acum; return [nom(x), _infNum(a.hht), _infDec(a.hhc), _infPct(a.hhc, a.hht)]; })
        .concat([tot(['Todas', _infNum(T.hhA.hht), _infDec(T.hhA.hhc), _infPct(T.hhA.hhc, T.hhA.hht)])]), [wO-270, 90, 90, 90], { num:{ 1:1, 2:1, 3:1 } });
    }
    /* 19/10/2026 · lote 19 · el personal de cada obra */
    if(k==='personal'){
      P.cifras([['En obra al cierre', T.per.act, T.per.ob+' obreros · '+T.per.st+' staff'], ['De descanso', T.per.desc, ''], ['Ingresaron', T.per.ing, 'en el mes'], ['Cesados y trasladados', T.per.ces+T.per.tras, T.per.ces+' cesados · '+T.per.tras+' trasladados']]);
      P.tabla('Cada obra', ['Obra', 'En obra', 'Obreros', 'Staff', 'Descanso', 'Ingresos', 'Ceses', 'Traslados'], ob.map(function(x){ var p=x.D.per || {}; return [nom(x), p.act||0, p.ob||0, p.st||0, p.desc||0, p.ing||0, p.ces||0, p.tras||0]; })
        .concat([tot(['Todas', T.per.act, T.per.ob, T.per.st, T.per.desc, T.per.ing, T.per.ces, T.per.tras])]), [wO-324, 48, 48, 40, 50, 48, 42, 48], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1 } });
      P.nota('Al cierre del mes, según la ficha y la historia de cada trabajador en su obra. El trasladado de una obra a otra figura en la que dejó.');
    }
    if(k==='charlas'){
      var Ct=T.ch;
      P.cifras([['Charlas y capacitaciones', Ct.tot.veces, 'en todas las obras'], ['Personas', _infNum(Ct.tot.asis), Ct.tot.o+' obreros · '+Ct.tot.s+' staff'], ['Duración', _infMin(Ct.tot.min), ''], ['HHC', _infDec(Ct.tot.hhc), _infPct(Ct.tot.hhc, T.hh.hht)+' de lo trabajado']]);
      P.barras('Horas hombre de capacitación, por tipo', Ct.L.slice(0, 10).map(function(t){ return { n:t.n, v:t.hhc }; }), _infDec);
      P.tabla('Por tipo de charla, en todas las obras', ['Tipo', 'Veces', 'Personas', 'Duración', 'HHC'], Ct.L.map(function(t){ return [t.n, t.veces, _infNum(t.asis), _infMin(t.min), _infDec(t.hhc)]; })
        .concat(Ct.L.length ? [tot(['Total', Ct.tot.veces, _infNum(Ct.tot.asis), _infMin(Ct.tot.min), _infDec(Ct.tot.hhc)])] : []), [wO-260, 55, 65, 75, 65], { num:{ 1:1, 2:1, 3:1, 4:1 } });
      P.tabla('Cada obra', ['Obra', 'Veces', 'Personas', 'Duración', 'HHC'], ob.map(function(x){ var t=x.D.ch.tot; return [nom(x), t.veces, _infNum(t.asis), _infMin(t.min), _infDec(t.hhc)]; })
        .concat([tot(['Todas', Ct.tot.veces, _infNum(Ct.tot.asis), _infMin(Ct.tot.min), _infDec(Ct.tot.hhc)])]), [wO-260, 55, 65, 75, 65], { num:{ 1:1, 2:1, 3:1, 4:1 } });
    }
    if(k==='temas'){
      var F=[];
      ob.forEach(function(x){
        var Ch=x.D.ch; if(!Ch.L.length) return;
        F.push({ g:nom(x)+' · '+Ch.tot.veces+(Ch.tot.veces===1 ? ' charla o capacitación' : ' charlas y capacitaciones')+' · '+_infDec(Ch.tot.hhc)+' HHC' });
        if(desglose) Ch.S.forEach(function(s){ F.push([_infFechaC(s.f), s.tipo, s.tema, _infNum(s.n), _infMin(s.min), _infDec(s.hhc)]); });
        else Ch.L.forEach(function(t){ F.push(['', t.n, t.veces+(t.veces===1 ? ' vez' : ' veces'), _infNum(t.asis), _infMin(t.min), _infDec(t.hhc)]); });
        F.push({ v:['', '', 'Total · '+nom(x), _infNum(Ch.tot.asis), _infMin(Ch.tot.min), _infDec(Ch.tot.hhc)], t:'sub' });
      });
      if(F.length) F.push(tot(['', '', 'Total de todas las obras', _infNum(T.ch.tot.asis), _infMin(T.ch.tot.min), _infDec(T.ch.tot.hhc)]));
      P.tabla(desglose ? 'Los temas del mes, uno por uno' : 'Los temas del mes, por tipo de charla', desglose ? ['Fecha', 'Tipo', 'Tema', 'Personas', 'Duración', 'HHC'] : ['', 'Tipo', 'Veces', 'Personas', 'Duración', 'HHC'], F,
        [58, 124, wO-340, 50, 56, 52], { num:{ 3:1, 4:1, 5:1 }, vacio:'Ninguna charla registrada este mes.', pag:'Los temas del mes' });
    }
    if(k==='ats'){
      P.cifras([['ATS del mes', T.ats.n, 'en todas las obras'], ['Cerrados', T.ats.cerrados, _infPct(T.ats.cerrados, T.ats.n), T.ats.n && T.ats.cerrados===T.ats.n ? 'ok' : ''], ['Sin cierre', T.ats.sinCierre, '', T.ats.sinCierre ? 'mal' : 'ok']]);
      P.tabla('Cada obra', ['Obra', 'ATS', 'Cerrados', 'Sin cierre', '% cerrados'], ob.map(function(x){ var a=x.D.ats; return [nom(x), a.n, a.cerrados, a.sinCierre, _infPct(a.cerrados, a.n)]; })
        .concat([tot(['Todas', T.ats.n, T.ats.cerrados, T.ats.sinCierre, _infPct(T.ats.cerrados, T.ats.n)])]), [wO-280, 60, 70, 75, 75], { num:{ 1:1, 2:1, 3:1, 4:1 } });
    }
    if(k==='reportes'){
      P.cifras([['Actos', T.obs.acto, 'en todas las obras'], ['Condiciones', T.obs.condicion, ''], ['Sugerencias', T.obs.sug, ''], ['Buenas prácticas', T.obs.buena, '']]);
      P.tabla('Cada obra', ['Obra', 'Actos', 'Condiciones', 'Sugerencias', 'Buenas', '% levantado', 'Abiertos hoy'], ob.map(function(x){ var o=x.D.obs; return [nom(x), o.tot.acto, o.tot.condicion, o.tot.sug, o.tot.buena, _infPct(o.lev.cerr, o.lev.n), x.D.rep.abiertosHoy]; })
        .concat([tot(['Todas', T.obs.acto, T.obs.condicion, T.obs.sug, T.obs.buena, _infPct(T.obs.cerr, T.obs.n), T.rep.abiertosHoy])]), [wO-346, 46, 64, 64, 50, 62, 60], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1, 6:1 } });
      P.nota('% levantado: de los actos y las condiciones del mes. Abiertos hoy: los reportes sin cerrar de todos los meses.');
    }
    if(k==='inspecciones'){
      P.tabla('Cada obra', ['Obra', 'Inspecciones', 'Tipos'], ob.map(function(x){ return [nom(x), x.D.insp.n, x.D.insp.tipos.length]; }).concat([tot(['Todas', T.insp.n, ''])]), [wO-170, 90, 80], { num:{ 1:1, 2:1 } });
    }
    if(k==='epp'){
      var conC=!!T.epp.costo;
      P.tabla('Cada obra', ['Obra', 'Entregas', 'Unidades', 'Por pérdida'].concat(conC ? ['Costo ('+T.epp.mon+')'] : []),
        ob.map(function(x){ var e=x.D.epp; return [nom(x), e.entregas, e.und, e.cons ? e.cons.tot.P : 0].concat(conC ? [e.costo && e.costo.total ? e.costo.total.toFixed(2) : '—'] : []); })
          .concat([tot(['Todas', T.epp.entregas, T.epp.und, T.epp.P].concat(conC ? [T.epp.costo.toFixed(2)] : []))]), conC ? [wO-330, 65, 65, 80, 120] : [wO-230, 70, 70, 90], { num:conC ? { 1:1, 2:1, 3:1, 4:1 } : { 1:1, 2:1, 3:1 } });
    }
    if(k==='comite'){
      P.tabla('Cada obra', ['Obra', 'Reuniones', 'Ordinaria', 'Acuerdos pendientes', 'Fuera de plazo'], ob.map(function(x){ var c=x.D.com; return c ? [nom(x), c.actas.length, c.ord ? 'Sí' : 'No', c.pend, c.venc] : [nom(x), '—', '—', '—', '—']; })
        .concat([tot(['Todas', T.com.actas, T.com.ord+' de '+ob.length, T.com.pend, T.com.venc])]), [wO-330, 65, 70, 110, 85], { num:{ 1:1, 3:1, 4:1 } });
    }
  });
  var malas=TD.obras.filter(function(x){ return !x.D; });
  if(malas.length){ P.nota('No se pudieron leer: '+malas.map(nom).join(', ')+'. Revisa tu conexión y vuelve a armarlo.'); }
  return { doc:doc, bytes:doc.output('arraybuffer'), indice:indice };
}

/* ── los anexos, al final; el índice, en la portada; y el número de página en todas ── */
function _infUnir(base, indice, sinAnexos, op){
  var PL=window.PDFLib; op=op||{};
  return PL.PDFDocument.load(base).then(function(out){
    var nBase=out.getPageCount();
    /* 19/10/2026 · lote 20 · el de medio ambiente trae sus propios anexos (los papeles del mes) y no las actas del comité */
    var anex=op.anexos ? op.anexos.slice() : ((!sinAnexos && INFW.secc.some(function(x){ return x.k==='anexos' && x.on; })) ? INFW.anexos.slice() : []), hechos=[], malos=[];
    var cad=Promise.resolve();
    /* 17/10/2026 · lote 16 · las actas del comité del mes, solas y primero: las de OBRASST armadas como en la app; las escaneadas, su archivo */
    var Cm=(!sinAnexos && !op.sinComite && INFW.secc.some(function(x){ return x.k==='comite' && _infVa(x); }) && INFW.datos) ? INFW.datos.com : null;
    function pegar(bytesP, nom){
      cad=cad.then(function(){
        var ini=out.getPageCount()+1;
        return bytesP().then(function(buf){
          var u8=new Uint8Array(buf), esPdf=u8[0]===0x25 && u8[1]===0x50 && u8[2]===0x44 && u8[3]===0x46;
          if(esPdf) return PL.PDFDocument.load(u8, { ignoreEncryption:true }).then(function(src){ return out.copyPages(src, src.getPageIndices()); }).then(function(pags){ pags.forEach(function(p){ out.addPage(p); }); });
          var png=u8[0]===0x89 && u8[1]===0x50, jpg=u8[0]===0xFF && u8[1]===0xD8;
          if(!png && !jpg) throw 'tipo';
          return (png ? out.embedPng(u8) : out.embedJpg(u8)).then(function(img){
            var pg=out.addPage([595.28, 841.89]), m=36, w=595.28-2*m, h=841.89-2*m-24, k=Math.min(w/img.width, h/img.height);
            pg.drawImage(img, { x:(595.28-img.width*k)/2, y:m+24+(h-img.height*k)/2, width:img.width*k, height:img.height*k });
          });
        }).then(function(){ hechos.push({ t:nom, p:ini }); }, function(){ malos.push(nom); });
      });
    }
    var bajar=function(url){ return function(){ return fetch(url).then(function(r){ if(!r.ok) throw r.status; return r.arrayBuffer(); }); }; };
    (Cm ? Cm.actas : []).forEach(function(a){
      pegar(a.subida ? (a.url ? bajar(a.url) : function(){ return Promise.reject('sin_archivo'); })
        : function(){ return cargarMasApp().then(function(){ return masCtx({ com:Cm.doc }); }).then(function(Cx){ var R=MAS_APP.usar(Cx).comiteActaPdf(a.id); if(!R || !R.blob) throw 'sin_acta'; return R.blob.arrayBuffer(); }); },
        'Acta del comité N° '+(a.n||'—')+' ('+(fechaLarga(a.fecha)||a.fecha)+')');
    });
    anex.forEach(function(a){ pegar(bajar(a.url), a.nombre); });
    return cad.then(function(){ return out.embedFont(PL.StandardFonts.Helvetica); }).then(function(fuente){
      var pags=out.getPages(), total=pags.length, gris=PL.rgb(0.42, 0.49, 0.53), tinta=PL.rgb(0.04, 0.16, 0.23);
      var limpio=function(s){ return String(s||'').replace(/[^\x20-\x7E\xA0-\xFF]/g, ''); };
      /* el índice, en la portada (si la hay) */
      if(INFW._yIndice && pags[0]){
        var p0=pags[0], H=p0.getHeight(), y=H-INFW._yIndice, filas=indice.concat(hechos.length ? [{ t:'Anexos', p:hechos[0].p }] : []).concat(hechos.map(function(h){ return { t:'   '+h.t, p:h.p, sub:true }; }));
        for(var q=0; q<filas.length; q++){
          var f=filas[q];
          /* lo que no cabe en la portada se resume en una línea */
          if(y<64 && q<filas.length-1){ p0.drawText(limpio('… y '+(filas.length-q)+' más'), { x:42, y:y, size:9, font:fuente, color:gris }); break; }
          var t=limpio(f.t); if(fuente.widthOfTextAtSize(t, 10)>420){ while(t.length>4 && fuente.widthOfTextAtSize(t+'...', 10)>420) t=t.slice(0, -1); t+='...'; }
          p0.drawText(t, { x:42, y:y, size:f.sub ? 9 : 10.5, font:fuente, color:f.sub ? gris : tinta });
          var n=String(f.p); p0.drawText(n, { x:553-fuente.widthOfTextAtSize(n, 10), y:y, size:10, font:fuente, color:gris });
          y-=f.sub ? 15 : 18;
        }
      }
      var pie=limpio('OBRASST · '+(op.pie || 'Informe')+' de '+_infMesN(INFW.mes)+' · '+(sinAnexos ? (_infEmpresaN() || 'Todas las obras') : (nombreObraP()||'')));
      /* 20/10/2026 · lote 20 · la primera página de cada anexo dice cuál es (como en el índice), para encontrarlo en la carpeta */
      var anxEn={}; hechos.forEach(function(h, j){ anxEn[h.p-1]=limpio('Anexo '+(j+1)+' · '+h.t); });
      pags.forEach(function(p, i){
        var w=p.getWidth(), t=limpio('Página '+(i+1)+' de '+total), tw=fuente.widthOfTextAtSize(t, 8);
        /* en los anexos (traen su propio pie): solo el número, sobre un fondo blanco */
        if(i>=nBase) p.drawRectangle({ x:w-40-tw, y:13, width:tw+8, height:12, color:PL.rgb(1, 1, 1) });
        p.drawText(t, { x:w-36-tw, y:16.5, size:8, font:fuente, color:gris });
        if(anxEn[i]){
          var et=anxEn[i], maxW=w-tw-96;
          if(fuente.widthOfTextAtSize(et, 8)>maxW){ while(et.length>4 && fuente.widthOfTextAtSize(et+'...', 8)>maxW) et=et.slice(0, -1); et+='...'; }
          p.drawRectangle({ x:32, y:13, width:fuente.widthOfTextAtSize(et, 8)+8, height:12, color:PL.rgb(1, 1, 1) });
          p.drawText(et, { x:36, y:16.5, size:8, font:fuente, color:gris });
        }
        if(i && i<nBase) p.drawText(pie.length>90 ? pie.slice(0, 90)+'...' : pie, { x:36, y:16.5, size:8, font:fuente, color:gris });
      });
      return out.save().then(function(bytes){ return { bytes:bytes, paginas:total, anexos:hechos.length, malos:malos }; });
    });
  });
}

/* ── el Excel: una hoja por parte, con lo mismo del PDF (RCAP.xlsx: el que arma el registro de capacitaciones) ── */
function _infXlsEstilos(X){
  var E=new X.Estilos(), C=X.C;
  return { E:E, C:C,
    tit:E.xf({ b:1, sz:15, c:C.petroleo }), sub:E.xf({ sz:10, c:C.gris }),
    cab:E.xf({ b:1, sz:9, c:C.blanco, f:C.petroleo, h:'center', v:'center', wrap:1, borde:true }),
    tx:E.xf({ sz:10, c:C.tinta, borde:true, wrap:1, v:'top' }), txB:E.xf({ b:1, sz:10, c:C.tinta, borde:true, wrap:1 }),
    n:E.xf({ sz:10, c:C.tinta, borde:true, h:'right', fmt:'#,##0' }), d:E.xf({ sz:10, c:C.tinta, borde:true, h:'right', fmt:'#,##0.0' }),
    p:E.xf({ sz:10, c:C.tinta, borde:true, h:'right', fmt:'0.0%' }), f:E.xf({ sz:10, c:C.tinta, borde:true, h:'center', fmt:'dd/mm/yyyy' }),
    g:E.xf({ b:1, sz:10, c:C.petroleo, f:C.cabSes, borde:true }),
    sTx:E.xf({ b:1, sz:10, c:C.petroleo, f:C.fondo, borde:true }), sN:E.xf({ b:1, sz:10, c:C.petroleo, f:C.fondo, borde:true, h:'right', fmt:'#,##0' }), sD:E.xf({ b:1, sz:10, c:C.petroleo, f:C.fondo, borde:true, h:'right', fmt:'#,##0.0' }),
    tTx:E.xf({ b:1, sz:10, c:C.blanco, f:C.azul, borde:true }), tN:E.xf({ b:1, sz:10, c:C.blanco, f:C.azul, borde:true, h:'right', fmt:'#,##0' }), tD:E.xf({ b:1, sz:10, c:C.blanco, f:C.azul, borde:true, h:'right', fmt:'#,##0.0' }),
    tP:E.xf({ b:1, sz:10, c:C.blanco, f:C.azul, borde:true, h:'right', fmt:'0.0%' }), ley:E.xf({ sz:9, c:C.gris, wrap:1, v:'top' }),
    sP:E.xf({ b:1, sz:10, c:C.petroleo, f:C.fondo, borde:true, h:'right', fmt:'0.0%' }), d2:E.xf({ sz:10, c:C.tinta, borde:true, h:'right', fmt:'#,##0.00' }) };
}
/* la cabecera de cada hoja: el título y la obra; devuelve la fila donde sigue */
function _infXlsCab(h, S, titulo, ult, sub){
  h.unir(0, 1, ult, 1, titulo, S.tit); h.altos[1]=26;
  h.unir(0, 2, ult, 2, sub, S.sub); h.altos[2]=16;
  return 4;
}
/* una tabla: cols [[título, ancho, 'tx'|'n'|'d'|'d2'|'p'|'f']]; filas: [valores] · { g } · { v, t:'sub'|'tot', tipos:[…] (si la fila es de otro tipo) } */
function _infXlsTabla(h, S, fr, cols, filas, X){
  cols.forEach(function(c, j){ h.anchos[j]=Math.max(h.anchos[j]||0, c[1]); h.celda(j, fr, c[0], S.cab); });
  h.altos[fr]=30; fr++;
  var est=function(tipo, t){ var k={ tx:'tx', n:'n', d:'d', d2:'d2', p:'p', f:'f' }[tipo] || 'tx';
    if(t==='sub') return k==='tx' || k==='f' ? S.sTx : (k==='p' ? S.sP : (k==='d' || k==='d2' ? S.sD : S.sN));
    if(t==='tot') return k==='tx' || k==='f' ? S.tTx : (k==='d' || k==='d2' ? S.tD : (k==='p' ? S.tP : S.tN));
    return S[k]; };
  filas.forEach(function(f){
    if(f && !Array.isArray(f) && f.g!=null){ h.unir(0, fr, cols.length-1, fr, f.g, S.g); fr++; return; }
    var v=Array.isArray(f) ? f : f.v, t=Array.isArray(f) ? '' : f.t, tps=(!Array.isArray(f) && f.tipos) || null;
    v.forEach(function(val, j){
      var tipo=(tps && tps[j]) || cols[j][2];
      if(tipo==='f' && /^\d{4}-\d{2}-\d{2}$/.test(String(val||''))) h.celda(j, fr, X.serial(val), est('f', t));
      else if((tipo==='n' || tipo==='d' || tipo==='d2' || tipo==='p') && typeof val==='number' && isFinite(val)) h.celda(j, fr, val, est(tipo, t));
      else h.celda(j, fr, val==null ? '' : val, est('tx', t));
    });
    fr++;
  });
  return fr+1;
}
function _infXlsFilasTemas(Ch, desglose, obraN){
  var F=[];
  if(desglose){
    Ch.L.forEach(function(t){
      F.push({ g:(obraN ? obraN+' · ' : '')+t.n+' · '+t.veces+(t.veces===1 ? ' vez' : ' veces') });
      Ch.S.filter(function(x){ return x.k===t.k; }).forEach(function(x){ F.push([x.f, x.tema, x.n, x.o, x.s, x.min, Math.round(x.hhc*100)/100]); });
      F.push({ v:['', 'Total · '+t.n, t.asis, t.o, t.s, t.min, Math.round(t.hhc*100)/100], t:'sub' });
    });
  } else Ch.L.forEach(function(t){ F.push([(obraN ? obraN+' · ' : '')+t.n, t.veces, t.asis, t.o, t.s, t.min, Math.round(t.hhc*100)/100]); });
  return F;
}
function _infExcel(D){
  var X=RCAP.xlsx, S=_infXlsEstilos(X), desglose=(INFW.temas!=='total'), obra=nombreObraP()||'Obra', sub=[empresaDeObraP()||'', obra, _infMesMay(D.mes)].filter(Boolean).join(' · ');
  var H=[];
  /* 1 · el resumen */
  var h=new X.Hoja('Resumen'); h.activa=true; h.pie='Informe del mes'; var fr=_infXlsCab(h, S, 'Informe de seguridad y salud en el trabajo', 2, sub);
  fr=_infXlsTabla(h, S, fr, [['Indicador', 44, 'tx'], ['Valor', 16, 'n'], ['Detalle', 46, 'tx']], [
    ['Personal activo', D.activos, D.cat.o+' obreros · '+D.cat.s+' staff'],
    ['Horas hombre trabajadas (HHT)', Math.round(D.hh.hht), D.hh.dias+' días registrados'],
    ['HHT acumuladas en el año', Math.round(D.hhA.acum.hht), 'hasta '+_infMesN(D.mes)],
    { v:['Horas hombre de capacitación (HHC)', Math.round(D.hh.hhc*10)/10, D.hh.hht ? _infPct(D.hh.hhc, D.hh.hht)+' de lo trabajado' : ''], tipos:['tx', 'd', 'tx'] },
    { v:['HHC acumuladas en el año', Math.round(D.hhA.acum.hhc*10)/10, D.hhA.acum.hht ? _infPct(D.hhA.acum.hhc, D.hhA.acum.hht)+' de lo trabajado en el año' : ''], tipos:['tx', 'd', 'tx'] },
    ['Ingresaron en el mes', D.per ? D.per.ing : 0, D.per ? D.per.ces+' cesados · '+D.per.tras+' trasladados · '+D.per.desc+' de descanso' : ''],
    ['Accidentes del mes', D.acc.mes, D.acc.anio+' en el año'],
    ['Incidentes del mes', D.acc.inc, 'casi accidentes, primeros auxilios y daños · '+D.acc.incAnio+' en el año'],
    { v:['Índice de frecuencia del año', D.acc.IF===null ? '—' : Math.round(D.acc.IF*100)/100, 'accidentes × 1 000 000 / horas hombre'], tipos:['tx', 'd2', 'tx'] },
    { v:['Índice de severidad del año', D.acc.IS===null ? '—' : Math.round(D.acc.IS*10)/10, 'días perdidos × 1 000 000 / horas hombre'], tipos:['tx', 'd', 'tx'] },
    ['Charlas y capacitaciones', D.ch.tot.veces, _infNum(D.ch.tot.asis)+' personas · '+_infDec(D.ch.tot.hhc)+' HHC'],
    ['ATS del mes', D.ats.n, D.ats.cerrados+' cerrados · '+D.ats.sinCierre+' sin cierre'],
    ['Actos y condiciones del mes', D.obs.tot.acto+D.obs.tot.condicion, _infActCondTx(D.obs.tot.acto, D.obs.tot.condicion)+(D.obs.lev.pct==null ? '' : ' · '+D.obs.lev.pct+' % levantadas')],
    ['Sugerencias y buenas prácticas', D.obs.tot.sug+D.obs.tot.buena, D.obs.tot.sug+' sugerencias · '+D.obs.tot.buena+' buenas prácticas'],
    ['Reportes abiertos hoy', D.rep.abiertosHoy, 'de todos los meses'],
    ['Inspecciones', D.insp.n, D.insp.tipos.length+' tipos'],
    ['EPP entregado (unidades)', D.epp.und, D.epp.entregas+' entregas']
  ].concat(D.prog && D.prog.hay ? [{ v:['Programas del año: cumplimiento al mes', D.prog.tot.p ? D.prog.tot.e/D.prog.tot.p : '—', D.prog.tot.e+' de '+D.prog.tot.p+' actividades'], tipos:['tx', 'p', 'tx'] }] : []), X);
  H.push(h);
  /* 2 · las horas hombre */
  h=new X.Hoja('Horas hombre'); h.pie='Informe del mes'; fr=_infXlsCab(h, S, 'Horas hombre del mes, obreros y staff', 8, sub);
  var Hh=D.hh, d=Hh.dias||0;
  fr=_infXlsTabla(h, S, fr, [['', 34, 'tx'], ['Obreros', 12, 'd'], ['Staff', 12, 'd'], ['Total', 12, 'd']], [
    ['Personal por día (promedio)', d ? Hh.obN/d : 0, d ? Hh.stN/d : 0, d ? (Hh.obN+Hh.stN)/d : 0],
    ['Horas hombre trabajadas (HHT)', Hh.obHHT, Hh.stHHT, Hh.hht],
    ['Horas hombre de capacitación (HHC)', Hh.hhcOb, Hh.hhcSt, Hh.hhc],
    { v:['Capacitación sobre lo trabajado', Hh.obHHT ? Hh.hhcOb/Hh.obHHT : '—', Hh.stHHT ? Hh.hhcSt/Hh.stHHT : '—', Hh.hht ? Hh.hhc/Hh.hht : '—'], t:'sub', tipos:['tx', 'p', 'p', 'p'] }
  ], X);
  if(Hh.hhcSin>0.05){ h.unir(0, fr-1, 8, fr-1, 'De las '+_infDec(Hh.hhc)+' HHC, '+_infDec(Hh.hhcSin)+' se registraron sin separar obreros y staff (días anteriores): están en el total.', S.ley); h.altos[fr-1]=28; fr++; }
  fr=_infXlsTabla(h, S, fr, [['Fecha', 14, 'f'], ['Obreros', 12, 'n'], ['Horas c/u', 12, 'd'], ['Staff', 12, 'n'], ['Horas c/u', 12, 'd'], ['HHT', 12, 'd'], ['HHC obreros', 13, 'd'], ['HHC staff', 12, 'd'], ['HHC', 12, 'd']],
    Hh.L.map(function(x){ return [x.f, x.obN, x.obH, x.stN, x.stH, x.obN*x.obH+x.stN*x.stH, x.hhcOb==null ? '' : x.hhcOb, x.hhcSt==null ? '' : x.hhcSt, x.hhc]; })
      .concat(Hh.L.length ? [{ v:['Total', '', '', '', '', Hh.hht, Hh.hhcOb, Hh.hhcSt, Hh.hhc], t:'tot' }] : []), X);
  H.push(h);
  /* 3 · los temas del mes */
  h=new X.Hoja('Temas del mes'); h.pie='Informe del mes'; fr=_infXlsCab(h, S, desglose ? 'Los temas del mes, uno por uno' : 'Los temas del mes, por tipo de charla', 6, sub);
  var Ch=D.ch, Ft=_infXlsFilasTemas(Ch, desglose);
  if(Ch.L.length) Ft.push({ v:[desglose ? '' : 'Total del mes', desglose ? 'Total del mes' : Ch.tot.veces, Ch.tot.asis, Ch.tot.o, Ch.tot.s, Ch.tot.min, Math.round(Ch.tot.hhc*100)/100], t:'tot' });
  fr=_infXlsTabla(h, S, fr, desglose ? [['Fecha', 13, 'f'], ['Tema', 50, 'tx'], ['Personas', 11, 'n'], ['Obreros', 10, 'n'], ['Staff', 10, 'n'], ['Duración (min)', 13, 'n'], ['HHC', 10, 'd']]
                                     : [['Tipo de charla', 40, 'tx'], ['Veces', 10, 'n'], ['Personas', 11, 'n'], ['Obreros', 10, 'n'], ['Staff', 10, 'n'], ['Duración (min)', 13, 'n'], ['HHC', 10, 'd']], Ft, X);
  h.unir(0, fr-1, 6, fr-1, 'HHC = personas × minutos / 60. Salen de las asistencias con QR de la app y de las capacitaciones registradas en la web o escaneadas con su hoja firmada.', S.ley); h.altos[fr-1]=30;
  H.push(h);
  /* 4 · los ATS */
  h=new X.Hoja('ATS'); h.pie='Informe del mes'; fr=_infXlsCab(h, S, 'ATS del mes', 3, sub);
  var estN={}; INF_ATS_EST.forEach(function(e){ estN[e[0]]=e[1]; });
  fr=_infXlsTabla(h, S, fr, [['Fecha', 13, 'f'], ['Trabajo', 44, 'tx'], ['Lugar', 26, 'tx'], ['Estado', 40, 'tx']], D.ats.L.map(function(a){ return [a.f, a.t, a.lugar, estN[a.est] || a.est]; }), X);
  H.push(h);
  /* 5 · el EPP */
  h=new X.Hoja('EPP'); h.pie='Informe del mes'; fr=_infXlsCab(h, S, 'Entrega y consumo de EPP', 6, sub);
  var Cs=D.epp.cons;
  fr=_infXlsTabla(h, S, fr, [['EPP', 36, 'tx'], ['Entregas', 11, 'n'], ['Unidades', 11, 'n'], ['Nuevas', 10, 'n'], ['Cambio', 10, 'n'], ['Pérdida', 10, 'n'], ['Trabajadores', 13, 'n']],
    Cs.L.map(function(t){ return [t.n, t.ent, t.und, t.N, t.C, t.P, t.trab]; }).concat(Cs.L.length ? [{ v:['Total', D.epp.entregas, Cs.tot.und, Cs.tot.N, Cs.tot.C, Cs.tot.P, ''], t:'tot' }] : []), X);
  H.push(h);
  /* 19/10/2026 · lote 19 · el personal, las observaciones, los programas y las horas del año */
  _infExcel19(X, S, H, D, sub);
  return X.libro(H, S.E, 'Informe del mes · '+obra);
}
/* 19/10/2026 · lote 19 · las hojas nuevas del Excel: el personal, la tabla de observaciones, los programas y las horas del año */
function _infExcel19(X, S, H, D, sub){
  var cap=function(s){ s=String(s||''); return s.charAt(0).toUpperCase()+s.slice(1); }, h, fr;
  var Pe=D.per;
  if(Pe){
    h=new X.Hoja('Personal'); h.pie='Informe del mes'; fr=_infXlsCab(h, S, 'El personal de la obra al cierre de '+_infMesN(D.mes), 7, sub);
    fr=_infXlsTabla(h, S, fr, [['Empresa', 36, 'tx'], ['En obra', 10, 'n'], ['Obreros', 10, 'n'], ['Staff', 9, 'n'], ['De descanso', 12, 'n'], ['Ingresos', 10, 'n'], ['Ceses', 9, 'n'], ['Traslados', 10, 'n']],
      Pe.empL.map(function(e){ return [e.n, e.act, e.ob, e.st, e.desc, e.ing, e.ces, e.tras]; }).concat([{ v:['Total', Pe.act, Pe.ob, Pe.st, Pe.desc, Pe.ing, Pe.ces, Pe.tras], t:'tot' }]), X);
    if(Pe.mov.length) fr=_infXlsTabla(h, S, fr, [['Fecha', 13, 'f'], ['Trabajador', 36, 'tx'], ['Empresa', 26, 'tx'], ['Qué pasó', 36, 'tx']], Pe.mov.map(function(m){ return [m.f, m.n, m.emp, INF_MOV_N[m.k]+(m.m ? ' · '+m.m : '')]; }), X);
    fr=_infXlsTabla(h, S, fr, [['Trabajador', 36, 'tx'], [docPersonaP(), 13, 'tx'], ['Puesto', 24, 'tx'], ['Empresa', 26, 'tx'], ['Categoría', 11, 'tx'], ['Al cierre del mes', 16, 'tx'], ['Desde', 12, 'f'], ['Ingreso', 12, 'f']],
      Pe.L.map(function(t){ return [t.n, t.doc, t.puesto, t.emp, t.cat, INF_SIT_N[t.e], t.e!=='activo' ? t.desde : '', t.ing]; }), X);
    H.push(h);
  }
  if(D.obs){
    var tN={ acto:'Acto', condicion:'Condición', sug:'Sugerencia', buena:'Buena práctica' };
    h=new X.Hoja('Observaciones'); h.pie='Informe del mes'; fr=_infXlsCab(h, S, 'Tabla de observaciones · '+_infMesN(D.mes), 13, sub);
    fr=_infXlsTabla(h, S, fr, [['N.º', 6, 'n'], ['Fecha', 12, 'f'], ['Mes', 11, 'tx'], ['Empresa que reporta', 24, 'tx'], ['Empresa observada', 24, 'tx'], ['Frente de obra', 18, 'tx'], ['Descripción de la observación', 46, 'tx'],
      ['Foto', 18, 'tx'], ['Origen', 22, 'tx'], ['Tipo', 14, 'tx'], ['Categoría', 30, 'tx'], ['Plan de acción / levantamiento', 46, 'tx'], ['Foto del levantamiento', 18, 'tx'], ['Fecha de cumplimiento', 20, 'tx']],
      D.obs.L.map(function(x, i){ return [i+1, x.f, cap(INF_MESES[+x.f.slice(5, 7)-1]), x.er, x.eo, x.frente, x.desc+(x.fuente==='insp' ? ' (de la inspección «'+x.insp+'»)' : ''), x.foto, x.origen ? obsOrigenN(x.origen) : '', tN[x.tipo] || x.tipo,
        x.cat+(x.amb ? ' · medio ambiente' : ''), x.plan, x.fotoD, _infObsCumpl(x, D.dia)]; }), X);
    var O=D.obs;
    fr=_infXlsTabla(h, S, fr, [['De dónde salieron', 36, 'tx'], ['Actos', 10, 'n'], ['Condiciones', 12, 'n'], ['Sugerencias', 12, 'n'], ['Buenas prácticas', 14, 'n']],
      O.porOrigen.map(function(o){ return [_infOrigenN(o.k), o.acto, o.condicion, o.sug, o.buena]; }).concat([{ v:['Total', O.tot.acto, O.tot.condicion, O.tot.sug, O.tot.buena], t:'tot' }]), X);
    H.push(h);
  }
  if(D.prog && D.prog.hay){
    h=new X.Hoja('Programas'); h.pie='Informe del mes'; fr=_infXlsCab(h, S, 'Avance de los programas del año, hasta '+_infMesN(D.mes), 12, sub);
    fr=_infXlsTabla(h, S, fr, [['Programa', 40, 'tx'], ['Programadas al mes', 14, 'n'], ['Ejecutadas', 12, 'n'], ['Cumplimiento', 13, 'p'], ['Programadas en el año', 15, 'n'], ['Sin cumplir', 12, 'n']],
      D.prog.L.map(function(R){ return [R.n, R.p, R.e, R.p ? R.e/R.p : '—', R.pAnio, R.atras]; }).concat([{ v:['Todos', D.prog.tot.p, D.prog.tot.e, D.prog.tot.p ? D.prog.tot.e/D.prog.tot.p : '—', '', ''], t:'tot' }]), X);
    fr=_infXlsTabla(h, S, fr, [['Mes a mes (ejecutadas / programadas)', 40, 'tx']].concat(INF_MESES.map(function(m){ return [cap(m.slice(0, 3)), 9, 'tx']; })),
      D.prog.L.map(function(R){ return [R.n].concat(R.meses.map(function(q, i){ return q.p ? (i<=D.prog.mi ? q.e+' / '+q.p : '— / '+q.p) : ''; })); }), X);
    if(D.prog.obj.length) fr=_infXlsTabla(h, S, fr, [['Objetivo', 46, 'tx'], ['Meta', 36, 'tx'], ['Indicador', 36, 'tx'], ['Avance', 12, 'p']],
      D.prog.obj.map(function(o){ return [o.obj, o.meta, o.ind, (o.R && o.R.p) ? o.R.e/o.R.p : (o.R ? '—' : 'a mano')]; }), X);
    H.push(h);
  }
  if(D.hhA){
    var Aa=D.hhA.acum;
    h=new X.Hoja('Horas del año'); h.pie='Informe del mes'; fr=_infXlsCab(h, S, 'Horas hombre del año, mes a mes', 7, sub);
    fr=_infXlsTabla(h, S, fr, [['Mes', 16, 'tx'], ['HHT obreros', 13, 'd'], ['HHT staff', 12, 'd'], ['HHT', 12, 'd'], ['HHC', 11, 'd'], ['HHC / HHT', 11, 'p'], ['HHT acumuladas', 15, 'd'], ['HHC acumuladas', 15, 'd']],
      D.hhA.M.map(function(q){ return [cap(_infMesN(q.m)), q.obHHT, q.stHHT, q.hht, Math.round(q.hhc*100)/100, q.hht ? q.hhc/q.hht : '—', q.acHHT, Math.round(q.acHHC*100)/100]; })
        .concat([{ v:['Total del año', Aa.obHHT, Aa.stHHT, Aa.hht, Math.round(Aa.hhc*100)/100, Aa.hht ? Aa.hhc/Aa.hht : '—', '', ''], t:'tot' }]), X);
    H.push(h);
  }
}
function _infExcelTodas(TD){
  var X=RCAP.xlsx, S=_infXlsEstilos(X), desglose=(INFW.temas!=='total'), emp=_infEmpresaN() || 'Todas las obras', sub=emp+' · todas las obras · '+_infMesMay(TD.mes), ob=TD.obras.filter(function(x){ return x.D; }), T=TD.tot;
  var nom=function(x){ return _infObraN(x.O); }, H=[];
  var h=new X.Hoja('Por obra'); h.activa=true; h.pie='Informe de todas las obras'; var fr=_infXlsCab(h, S, 'Cada obra en el mes', 14, sub);
  var cols=[['Obra', 30, 'tx'], ['Personal', 10, 'n'], ['Obreros', 10, 'n'], ['Staff', 9, 'n'], ['HHT obreros', 12, 'd'], ['HHT staff', 11, 'd'], ['HHT', 11, 'd'], ['HHC obreros', 12, 'd'], ['HHC staff', 11, 'd'], ['HHC', 10, 'd'],
            ['Accidentes', 11, 'n'], ['Charlas', 10, 'n'], ['ATS', 8, 'n'], ['ATS cerrados', 12, 'n'], ['Reportes', 10, 'n']];
  var fila=function(n, D){ return [n, D.activos, D.cat.o, D.cat.s, D.hh.obHHT, D.hh.stHHT, D.hh.hht, D.hh.hhcOb, D.hh.hhcSt, D.hh.hhc, D.acc.mes, D.ch.tot.veces, D.ats.n, D.ats.cerrados, D.rep.n]; };
  fr=_infXlsTabla(h, S, fr, cols, ob.map(function(x){ return fila(nom(x), x.D); }).concat([{ v:['Todas', T.activos, T.cat.o, T.cat.s, T.hh.obHHT, T.hh.stHHT, T.hh.hht, T.hh.hhcOb, T.hh.hhcSt, T.hh.hhc, T.acc.mes, T.ch.tot.veces, T.ats.n, T.ats.cerrados, T.rep.n], t:'tot' }]), X);
  H.push(h);
  h=new X.Hoja('Charlas por tipo'); h.pie='Informe de todas las obras'; fr=_infXlsCab(h, S, 'Charlas y capacitaciones por tipo, en todas las obras', 6, sub);
  fr=_infXlsTabla(h, S, fr, [['Tipo de charla', 40, 'tx'], ['Veces', 10, 'n'], ['Personas', 11, 'n'], ['Obreros', 10, 'n'], ['Staff', 10, 'n'], ['Duración (min)', 13, 'n'], ['HHC', 10, 'd']],
    T.ch.L.map(function(t){ return [t.n, t.veces, t.asis, t.o, t.s, t.min, Math.round(t.hhc*100)/100]; }).concat(T.ch.L.length ? [{ v:['Total', T.ch.tot.veces, T.ch.tot.asis, T.ch.tot.o, T.ch.tot.s, T.ch.tot.min, Math.round(T.ch.tot.hhc*100)/100], t:'tot' }] : []), X);
  H.push(h);
  h=new X.Hoja('Temas del mes'); h.pie='Informe de todas las obras'; fr=_infXlsCab(h, S, desglose ? 'Los temas del mes, uno por uno' : 'Los temas del mes, por tipo de charla', 6, sub);
  var F=[];
  ob.forEach(function(x){ if(!x.D.ch.L.length) return; F=F.concat(_infXlsFilasTemas(x.D.ch, desglose, nom(x)));
    F.push({ v:['', 'Total · '+nom(x), x.D.ch.tot.asis, x.D.ch.tot.o, x.D.ch.tot.s, x.D.ch.tot.min, Math.round(x.D.ch.tot.hhc*100)/100], t:'sub' }); });
  if(F.length) F.push({ v:['', 'Total de todas las obras', T.ch.tot.asis, T.ch.tot.o, T.ch.tot.s, T.ch.tot.min, Math.round(T.ch.tot.hhc*100)/100], t:'tot' });
  fr=_infXlsTabla(h, S, fr, desglose ? [['Fecha', 13, 'f'], ['Tema', 50, 'tx'], ['Personas', 11, 'n'], ['Obreros', 10, 'n'], ['Staff', 10, 'n'], ['Duración (min)', 13, 'n'], ['HHC', 10, 'd']]
                                    : [['Obra · tipo de charla', 46, 'tx'], ['Veces', 10, 'n'], ['Personas', 11, 'n'], ['Obreros', 10, 'n'], ['Staff', 10, 'n'], ['Duración (min)', 13, 'n'], ['HHC', 10, 'd']], F, X);
  H.push(h);
  return X.libro(H, S.E, 'Informe de todas las obras');
}

/* ── el Word de los temas del mes (y las horas hombre): .docx a mano, sin librería (un ZIP sin comprimir) ── */
var _INF_CRC=null;
function _infCrc(u8){
  if(!_INF_CRC){ _INF_CRC=new Uint32Array(256); for(var n=0;n<256;n++){ var c=n; for(var k=0;k<8;k++) c=(c & 1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1); _INF_CRC[n]=c>>>0; } }
  var r=0xFFFFFFFF; for(var i=0;i<u8.length;i++) r=_INF_CRC[(r ^ u8[i]) & 255] ^ (r>>>8);
  return (r ^ 0xFFFFFFFF)>>>0;
}
function _infZip(archivos, tipo){
  var enc=new TextEncoder(), partes=[], central=[], off=0, d=new Date();
  var dt=((d.getHours()<<11) | (d.getMinutes()<<5) | (d.getSeconds()>>1)) & 0xFFFF, df=(((d.getFullYear()-1980)<<9) | ((d.getMonth()+1)<<5) | d.getDate()) & 0xFFFF;
  archivos.forEach(function(a){
    /* 19/10/2026 · lote 19 · también lo binario (las fotos del Word, los PDF del ZIP): a.b */
    var nb=enc.encode(a.n), datos=a.b ? a.b : enc.encode(a.x), crc=_infCrc(datos);
    var lh=new Uint8Array(30+nb.length), v=new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true); v.setUint16(10, dt, true); v.setUint16(12, df, true);
    v.setUint32(14, crc, true); v.setUint32(18, datos.length, true); v.setUint32(22, datos.length, true); v.setUint16(26, nb.length, true); v.setUint16(28, 0, true); lh.set(nb, 30);
    var ch=new Uint8Array(46+nb.length), w=new DataView(ch.buffer);
    w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true); w.setUint16(10, 0, true); w.setUint16(12, dt, true); w.setUint16(14, df, true);
    w.setUint32(16, crc, true); w.setUint32(20, datos.length, true); w.setUint32(24, datos.length, true); w.setUint16(28, nb.length, true); w.setUint32(42, off, true); ch.set(nb, 46);
    partes.push(lh, datos); central.push(ch); off+=lh.length+datos.length;
  });
  var tam=central.reduce(function(s, x){ return s+x.length; }, 0), fin=new Uint8Array(22), f=new DataView(fin.buffer);
  f.setUint32(0, 0x06054b50, true); f.setUint16(8, archivos.length, true); f.setUint16(10, archivos.length, true); f.setUint32(12, tam, true); f.setUint32(16, off, true);
  return new Blob(partes.concat(central, [fin]), { type:tipo });
}
function _infX(s){ return String(s==null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function _infDocx(titulo, sub, bloques){
  /* bloques: { h:'texto' } un título · { p:'texto', gris:1 } un párrafo · { t:{ cols:[[título, ancho en twips, 'izq'|'der']], filas:[...] } } una tabla */
  function run(t, op){ op=op||{}; return '<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>'+(op.b ? '<w:b/>' : '')+'<w:color w:val="'+(op.c||'1B2A33')+'"/><w:sz w:val="'+(op.sz||20)+'"/></w:rPr><w:t xml:space="preserve">'+_infX(t)+'</w:t></w:r>'; }
  function par(t, op){ op=op||{}; return '<w:p><w:pPr><w:spacing w:before="'+(op.antes||0)+'" w:after="'+(op.despues==null ? 120 : op.despues)+'"/>'+(op.der ? '<w:jc w:val="right"/>' : '')+'</w:pPr>'+run(t, op)+'</w:p>'; }
  function celda(t, ancho, op){
    op=op||{};
    return '<w:tc><w:tcPr><w:tcW w:w="'+ancho+'" w:type="dxa"/>'+(op.span ? '<w:gridSpan w:val="'+op.span+'"/>' : '')+(op.fondo ? '<w:shd w:val="clear" w:color="auto" w:fill="'+op.fondo+'"/>' : '')+'<w:vAlign w:val="center"/></w:tcPr>'+
      '<w:p><w:pPr><w:spacing w:before="20" w:after="20"/>'+(op.der ? '<w:jc w:val="right"/>' : '')+'</w:pPr>'+run(t, { b:op.b, c:op.c, sz:op.sz||18 })+'</w:p></w:tc>';
  }
  function tabla(T){
    /* el orden del esquema: tblW, tblBorders, tblLayout, tblCellMar (Word no abre el archivo si va de otro modo) */
    var total=T.cols.reduce(function(s, c){ return s+c[1]; }, 0), x='<w:tbl><w:tblPr><w:tblW w:w="'+total+'" w:type="dxa"/>'+
      '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="CBD4DB"/><w:left w:val="single" w:sz="4" w:color="CBD4DB"/><w:bottom w:val="single" w:sz="4" w:color="CBD4DB"/><w:right w:val="single" w:sz="4" w:color="CBD4DB"/><w:insideH w:val="single" w:sz="4" w:color="CBD4DB"/><w:insideV w:val="single" w:sz="4" w:color="CBD4DB"/></w:tblBorders><w:tblLayout w:type="fixed"/>'+
      '<w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'+T.cols.map(function(c){ return '<w:gridCol w:w="'+c[1]+'"/>'; }).join('')+'</w:tblGrid>';
    x+='<w:tr><w:trPr><w:tblHeader/></w:trPr>'+T.cols.map(function(c){ return celda(c[0], c[1], { b:1, c:'FFFFFF', fondo:'0B2A3A', der:c[2]==='der' }); }).join('')+'</w:tr>';
    T.filas.forEach(function(f){
      if(f && !Array.isArray(f) && f.g!=null){ x+='<w:tr>'+celda(f.g, total, { span:T.cols.length, b:1, c:'0B2A3A', fondo:'DCE7ED' })+'</w:tr>'; return; }
      var v=Array.isArray(f) ? f : f.v, t=Array.isArray(f) ? '' : f.t, fondo=t==='tot' ? '12506B' : (t==='sub' ? 'F3F6F8' : ''), c=t==='tot' ? 'FFFFFF' : '1B2A33';
      x+='<w:tr>'+v.map(function(val, j){ return celda(val, T.cols[j][1], { b:!!t, c:c, fondo:fondo, der:T.cols[j][2]==='der' }); }).join('')+'</w:tr>';
    });
    return x+'</w:tbl>'+par('', { despues:160 });
  }
  var cuerpo=par(titulo, { b:1, sz:32, c:'0B2A3A', despues:60 })+par(sub, { sz:20, c:'5E6E79', despues:240 });
  bloques.forEach(function(b){
    if(b.h) cuerpo+=par(b.h, { b:1, sz:24, c:'0B2A3A', antes:200, despues:100 });
    if(b.p) cuerpo+=par(b.p, { sz:18, c:b.gris ? '5E6E79' : '1B2A33' });
    if(b.t) cuerpo+=tabla(b.t);
  });
  var doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>'+cuerpo+
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1021" w:bottom="1134" w:left="1021" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>';
  var tipos='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'+
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>';
  var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'+
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
  var core='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'+
    '<dc:title>'+_infX(titulo)+'</dc:title><dc:creator>OBRASST</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">'+new Date().toISOString().slice(0, 19)+'Z</dcterms:created></cp:coreProperties>';
  return _infZip([{ n:'[Content_Types].xml', x:tipos }, { n:'_rels/.rels', x:rels }, { n:'docProps/core.xml', x:core }, { n:'word/document.xml', x:doc }], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
function _infColsTemas(desglose, conTipo){
  return desglose ? [['Fecha', 1150, 'izq']].concat(conTipo ? [['Tipo', 1900, 'izq']] : []).concat([['Tema', conTipo ? 3060 : 4960, 'izq'], ['Personas', 1100, 'der'], ['Duración', 1250, 'der'], ['HHC', 1000, 'der']])
                  : [['Tipo de charla', 4810, 'izq'], ['Veces', 900, 'der'], ['Personas', 1100, 'der'], ['Duración', 1250, 'der'], ['HHC', 1000, 'der']];
}
function _infWord(D){
  var desglose=(INFW.temas!=='total'), Hh=D.hh, Ch=D.ch, d=Hh.dias||0;
  var B=[{ h:'Horas hombre del mes' }, { t:{ cols:[['', 4710, 'izq'], ['Obreros', 1500, 'der'], ['Staff', 1500, 'der'], ['Total', 1500, 'der']], filas:[
    ['Personal por día (promedio)', d ? _infDec(Hh.obN/d) : '—', d ? _infDec(Hh.stN/d) : '—', d ? _infDec((Hh.obN+Hh.stN)/d) : '—'],
    ['Horas hombre trabajadas (HHT)', _infNum(Hh.obHHT), _infNum(Hh.stHHT), _infNum(Hh.hht)],
    ['Horas hombre de capacitación (HHC)', _infDec(Hh.hhcOb), _infDec(Hh.hhcSt), _infDec(Hh.hhc)],
    { v:['Capacitación sobre lo trabajado', _infPct(Hh.hhcOb, Hh.obHHT), _infPct(Hh.hhcSt, Hh.stHHT), _infPct(Hh.hhc, Hh.hht)], t:'sub' }] } }];
  B.push({ h:desglose ? 'Los temas del mes, uno por uno' : 'Los temas del mes, por tipo de charla' });
  if(!Ch.L.length) B.push({ p:'Ninguna charla registrada este mes.', gris:1 });
  else B.push({ t:{ cols:_infColsTemas(desglose), filas:_infFilasTemas(Ch, desglose) } });
  B.push({ p:'HHC = personas × minutos / 60. Salen de las asistencias con QR de la app y de las capacitaciones registradas en la web o escaneadas con su hoja firmada.', gris:1 });
  return _infDocx('Temas del mes · '+_infMesMay(D.mes), [empresaDeObraP()||'', nombreObraP()||'', 'Elaborado por '+(String(INFW.por||'').trim() || '—')].filter(Boolean).join(' · '), B);
}
function _infWordTodas(TD){
  var desglose=(INFW.temas!=='total'), T=TD.tot, ob=TD.obras.filter(function(x){ return x.D; }), B=[];
  B.push({ h:'Horas hombre de todas las obras' });
  B.push({ t:{ cols:[['Obra', 3010, 'izq'], ['HHT obreros', 1300, 'der'], ['HHT staff', 1200, 'der'], ['HHC obreros', 1300, 'der'], ['HHC staff', 1200, 'der'], ['HHC / HHT', 1200, 'der']],
    filas:ob.map(function(x){ var h=x.D.hh; return [_infObraN(x.O), _infNum(h.obHHT), _infNum(h.stHHT), _infDec(h.hhcOb), _infDec(h.hhcSt), _infPct(h.hhc, h.hht)]; })
      .concat([{ v:['Todas', _infNum(T.hh.obHHT), _infNum(T.hh.stHHT), _infDec(T.hh.hhcOb), _infDec(T.hh.hhcSt), _infPct(T.hh.hhc, T.hh.hht)], t:'tot' }]) } });
  ob.forEach(function(x){
    B.push({ h:_infObraN(x.O) });
    if(!x.D.ch.L.length) B.push({ p:'Ninguna charla registrada este mes.', gris:1 });
    else B.push({ t:{ cols:_infColsTemas(desglose), filas:_infFilasTemas(x.D.ch, desglose) } });
  });
  B.push({ h:'Todas las obras, por tipo de charla' });
  B.push({ t:{ cols:_infColsTemas(false), filas:T.ch.L.map(function(t){ return [t.n, t.veces, _infNum(t.asis), _infMin(t.min), _infDec(t.hhc)]; })
    .concat(T.ch.L.length ? [{ v:['Total', T.ch.tot.veces, _infNum(T.ch.tot.asis), _infMin(T.ch.tot.min), _infDec(T.ch.tot.hhc)], t:'tot' }] : []) } });
  return _infDocx('Temas del mes · todas las obras · '+_infMesMay(TD.mes), [_infEmpresaN(), 'Elaborado por '+(String(INFW.por||'').trim() || '—')].filter(Boolean).join(' · '), B);
}

/* ═══ 19/10/2026 · LOTE 19 · LO QUE FALTABA EN EL INFORME ═══════════════════════════════════════════════════════════
   Marcelo: «Falta la relación de cuántos trabajadores hay en obra o están cesados, transferidos, etc, si están activos ·
   el avance de acuerdo a su programa de inspección anual · de capacitación anual · de sus objetivos y metas · de su
   programa de monitoreo ocupacional, auditoría, simulacros · las inspecciones se pueden dividir entre actos, condiciones,
   sugerencias, buenas prácticas · HHC y HHT, se vea la parte también de acumulable en el año · una tabla de las
   observaciones de actos/condiciones con fecha, mes, empresa reportante, empresa observada, frente de obra, descripción,
   foto, origen, tipo, categoría, plan de acción/levantamiento, foto, fecha de cumplimiento · la pirámide de Bird · gráfica
   de barras, líneas, y así para también ver el cumplimiento · anexar el registro fotográfico».
   Lo que se cuenta aquí sale de lo mismo que ya registra la obra: el personal con su historia (activo, de descanso,
   cesado; el traslado es el cese «se va a otra obra»), los reportes y lo que se encontró en las inspecciones con su ficha
   (hoja «rep-ficha»), el buzón de sugerencias, las buenas prácticas, los programas y objetivos del año (programas.js) y el
   registro fotográfico (hoja «foto-reg»). */

/* ── el personal ── */
function _infHist(t){
  return (Array.isArray(t && t.historial) ? t.historial : []).filter(function(e){ return e && /^\d{4}-\d{2}-\d{2}$/.test(String(e.f||'')); })
    .sort(function(a, b){ return a.f<b.f ? -1 : (a.f>b.f ? 1 : ((+a.t||0)-(+b.t||0))); });
}
/* cómo estaba un día: { e:'activo'|'descanso'|'cesado'|'traslado', k (el hecho), f (desde cuándo), m (el motivo) } */
function _infSit(t, iso){
  var l=_infHist(t), st;
  if(l.length) st={ e:(l[0].de && l[0].de.e) || 'activo', k:'', f:'', m:'' };
  else {
    /* sin historia: el estatus de hoy, desde su fecha si la tiene (antes de esa fecha estaba activo) */
    st={ e:String(t.estatus||'activo'), k:'', f:String(t.estatus_desde||'').slice(0, 10), m:'' };
    if(st.e!=='activo' && st.f && st.f>iso) st={ e:'activo', k:'', f:'', m:'' };
  }
  l.forEach(function(ev){ if(ev.f<=iso) st={ e:ev.e || 'activo', k:ev.k || '', f:ev.f, m:String(ev.motivo || ev.m || '') }; });
  if(st.e==='cesado' && st.k==='obra') st.e='traslado';
  if(st.e!=='activo' && st.e!=='descanso' && st.e!=='cesado' && st.e!=='traslado') st.e='activo';
  return st;
}
var INF_SIT_N = { activo:'En obra', descanso:'De descanso', cesado:'Cesado', traslado:'Trasladado' };
function _infDiaAntes(iso){ var d=new Date(Date.parse(iso+'T12:00:00')-864e5); return d.getFullYear()+'-'+dos(d.getMonth()+1)+'-'+dos(d.getDate()); }
function _infPersonal(trab, mes, dia, mapa, propia){
  var d0=mes+'-01', antes=_infDiaAntes(d0), P={ act:0, desc:0, ob:0, st:0, ing:0, ces:0, tras:0, descM:0, rein:0, bajasAntes:0, emp:{}, L:[], mov:[] };
  (trab||[]).forEach(function(t){
    if(!t || !t.nombre) return;
    var ing=String(t.ingreso||'').slice(0, 10), cre=String(t.creado||'').slice(0, 10);
    if((ing && ing>dia) || (!ing && cre && cre>dia)) return;             /* todavía no estaba en la obra */
    var s=_infSit(t, dia), s0=_infSit(t, antes), evs=_infHist(t).filter(function(e){ return e.f>=d0 && e.f<=dia; });
    var ingM=!!(ing && ing>=d0 && ing<=dia), sinHist=!_infHist(t).length;
    /* sin historia, el cese con fecha en el mes cuenta como un hecho del mes */
    if(sinHist && (s.e==='cesado' || s.e==='descanso') && s.f>=d0 && s.f<=dia) evs=[{ f:s.f, k:s.e==='cesado' ? 'cese' : 'descanso', e:s.e }];
    var enObra=(s.e==='activo' || s.e==='descanso');
    if(!enObra && !evs.length && !ingM){ P.bajasAntes++; return; }      /* ya se había ido antes del mes */
    var cat=catPuesto(t.puesto, mapa), emp=String(t.contrata||'').replace(/\s+/g, ' ').trim() || propia || 'Personal propio';
    var E=P.emp[emp] || (P.emp[emp]={ n:emp, act:0, desc:0, ob:0, st:0, ing:0, ces:0, tras:0 });
    if(s.e==='activo'){ P.act++; E.act++; if(cat==='staff'){ P.st++; E.st++; } else { P.ob++; E.ob++; } }
    else if(s.e==='descanso'){ P.desc++; E.desc++; }
    if(ingM){ P.ing++; E.ing++; P.mov.push({ f:ing, n:t.nombre, k:'ing', emp:emp, puesto:t.puesto||'' }); }
    evs.forEach(function(ev){
      var k=ev.k==='obra' ? 'tras' : (ev.k==='cese' ? 'ces' : (ev.k==='descanso' ? 'desc' : (ev.k==='activo' ? 'rein' : '')));
      if(!k) return;
      if(k==='tras'){ P.tras++; E.tras++; } else if(k==='ces'){ P.ces++; E.ces++; } else if(k==='desc') P.descM++; else P.rein++;
      P.mov.push({ f:ev.f, n:t.nombre, k:k, emp:emp, puesto:t.puesto||'', m:String(ev.motivo || ev.m || '') });
    });
    P.L.push({ n:t.nombre, doc:t.dni||'', td:t.td||'', puesto:t.puesto||'', emp:emp, cat:cat==='staff' ? 'Staff' : 'Obrero', e:s.e, desde:s.f || ing || '', ing:ing });
  });
  var ord={ activo:0, descanso:1, traslado:2, cesado:3 };
  P.L.sort(function(a, b){ return (ord[a.e]-ord[b.e]) || a.emp.localeCompare(b.emp, 'es') || a.n.localeCompare(b.n, 'es', { sensitivity:'base' }); });
  P.mov.sort(function(a, b){ return a.f.localeCompare(b.f) || a.n.localeCompare(b.n, 'es'); });
  P.empL=Object.keys(P.emp).map(function(k){ return P.emp[k]; }).sort(function(a, b){ return (b.act+b.desc)-(a.act+a.desc) || a.n.localeCompare(b.n, 'es'); });
  return P;
}
var INF_MOV_N = { ing:'Ingresó', ces:'Cesó', tras:'Se trasladó a otra obra', desc:'Pasó a descanso', rein:'Volvió a estar activo' };

/* ── las horas hombre del año, mes a mes, con lo acumulado ── */
function _infHHAnio(hh, mes){
  var anio=mes.slice(0, 4), mi=+mes.slice(5, 7), M=[], A={ obHHT:0, stHHT:0, hht:0, hhc:0, hhcOb:0, hhcSt:0 };
  for(var i=1;i<=mi;i++) M.push({ m:anio+'-'+dos(i), obHHT:0, stHHT:0, hht:0, hhc:0, hhcOb:0, hhcSt:0, dias:0 });
  (hh||[]).forEach(function(x){
    var f=String(x.fecha||''); if(f.slice(0, 4)!==anio) return;
    var m=+f.slice(5, 7); if(!m || m>mi) return;
    var q=M[m-1], ob=(parseFloat(x.ob_n)||0)*(parseFloat(x.ob_h)||0), st=(parseFloat(x.st_n)||0)*(parseFloat(x.st_h)||0), c=parseFloat(x.hhc)||0;
    q.obHHT+=ob; q.stHHT+=st; q.hht+=ob+st; q.hhc+=c; q.dias++;
    if(x.hhc_ob!=null || x.hhc_st!=null){ q.hhcOb+=parseFloat(x.hhc_ob)||0; q.hhcSt+=parseFloat(x.hhc_st)||0; }
  });
  M.forEach(function(q){ ['obHHT', 'stHHT', 'hht', 'hhc', 'hhcOb', 'hhcSt'].forEach(function(k){ A[k]+=q[k]; }); q.acHHT=A.hht; q.acHHC=A.hhc; });
  return { M:M, acum:A };
}

/* ── las observaciones del mes: los reportes y lo que se encontró en las inspecciones, con su ficha ── */
function _infObsItems(reps, insp, M, L, mes){
  var it=[];
  (reps||[]).forEach(function(r){
    if(mesDe(r.fecha || r.creado)!==mes) return;
    var x=M[String(r.id)], f=(x && x.d) || {}, tipo=f.tipo || (r.clase==='acto' ? 'acto' : 'condicion'), cerr=reporteCerrado(r);
    it.push({ k:String(r.id), fuente:'rep', f:String(r.fecha || r.creado).slice(0, 10), tipo:tipo, cat:f.cat || '', amb:!!(f.amb || (f.cat && obsCatAmb(L, tipo, f.cat))), sal:obsEsSal(f, L, tipo),
      origen:f.origen || obsOrigenSupuesto(r), er:f.er || '', eo:f.eo || '', frente:f.frente || '', lugar:r.lugar || '', desc:r.descripcion || '', foto:r.foto_url || '', fotoD:r.foto_cierre || '',
      plan:cerr ? (r.accion || '') : (f.plan || ''), resp:f.resp || '', plazo:f.plazo || '', cerr:cerr, lev:!cerr && r.estado==='levantado', fc:cerr ? String(r.cerrado || '').slice(0, 10) : '', clas:obsClasificada(x ? f : null) });
  });
  (insp||[]).forEach(function(i){
    if(mesDe(i.fecha)!==mes) return;
    obsDeInspP(i).forEach(function(o){
      var x=M[o.k], f=(x && x.d) || {}, tipo=f.tipo || 'condicion';
      it.push({ k:o.k, fuente:'insp', f:String(i.fecha).slice(0, 10), tipo:tipo, cat:f.cat || '', amb:!!(f.amb || (f.cat && obsCatAmb(L, tipo, f.cat))), sal:obsEsSal(f, L, tipo), origen:f.origen || 'insp',
        er:f.er || '', eo:f.eo || '', frente:f.frente || '', lugar:'', desc:o.t, foto:'', fotoD:'', plan:f.plan || '', resp:f.resp || '', plazo:f.plazo || '', cerr:o.lev, lev:false, fc:'', insp:i.tipo || 'Inspección', clas:obsClasificada(x ? f : null) });
    });
  });
  return it.sort(function(a, b){ return a.f.localeCompare(b.f); });
}
function _infObs(reps, insp, fichas, sug, bue, mes, dia, L, propia){
  var M=obsFichasMapa(fichas||[]), it=_infObsItems(reps, insp, M, L, mes), d0=mes+'-01';
  var sm=(sug||[]).filter(function(s){ var f=String(s.creado||'').slice(0, 10); return f>=d0 && f<=dia; }), bm=(bue||[]).filter(function(b){ return mesDe(b.fecha)===mes; });
  var O={ L:it, tot:{ acto:0, condicion:0, sug:sm.length, buena:bm.length }, buzon:sm.length, buenas:bm.length, sugL:sm, bueL:bm, amb:0, sinClas:0 };
  var org={}, cat={ acto:{}, condicion:{} }, emp={}, fre={}, lev={ n:0, cerr:0, lev:0, ab:0, venc:0 }, insT={ acto:0, condicion:0, sug:0, buena:0, n:0 };
  it.forEach(function(x){
    O.tot[x.tipo]=(O.tot[x.tipo]||0)+1;
    if(x.amb) O.amb++;
    var o=org[x.origen || '—'] || (org[x.origen || '—']={ k:x.origen || '—', acto:0, condicion:0, sug:0, buena:0 }); o[x.tipo]++;
    if(x.fuente==='insp'){ insT[x.tipo]++; insT.n++; }
    if(x.tipo!=='acto' && x.tipo!=='condicion') return;
    if(!x.clas) O.sinClas++;
    var c=x.cat || 'Sin clasificar'; cat[x.tipo][c]=(cat[x.tipo][c]||0)+1;
    var e=x.eo || 'Sin empresa observada', E=emp[e] || (emp[e]={ n:e, acto:0, condicion:0, cerr:0 }); E[x.tipo]++; if(x.cerr) E.cerr++;
    var fr=x.frente || 'Sin frente', F=fre[fr] || (fre[fr]={ n:fr, n2:0, cerr:0 }); F.n2++; if(x.cerr) F.cerr++;
    lev.n++; if(x.cerr) lev.cerr++; else { lev.ab++; if(x.lev) lev.lev++; if(x.plazo && x.plazo<dia) lev.venc++; }
  });
  if(sm.length){ org.buzon={ k:'buzon', acto:0, condicion:0, sug:sm.length, buena:0 }; }
  if(bm.length){ org.buenas={ k:'buenas', acto:0, condicion:0, sug:0, buena:bm.length }; }
  var ordO=OBS_ORIGEN.map(function(x){ return x[0]; }).concat(['buzon', 'buenas', '—']);
  O.porOrigen=Object.keys(org).map(function(k){ return org[k]; }).sort(function(a, b){ return ordO.indexOf(a.k)-ordO.indexOf(b.k); });
  O.porCat={ acto:Object.keys(cat.acto).map(function(k){ return [k, cat.acto[k]]; }).sort(function(a, b){ return b[1]-a[1] || a[0].localeCompare(b[0], 'es'); }),
             condicion:Object.keys(cat.condicion).map(function(k){ return [k, cat.condicion[k]]; }).sort(function(a, b){ return b[1]-a[1] || a[0].localeCompare(b[0], 'es'); }) };
  O.porEmp=Object.keys(emp).map(function(k){ return emp[k]; }).sort(function(a, b){ return (b.acto+b.condicion)-(a.acto+a.condicion) || a.n.localeCompare(b.n, 'es'); });
  O.porFrente=Object.keys(fre).map(function(k){ return fre[k]; }).sort(function(a, b){ return b.n2-a.n2 || a.n.localeCompare(b.n, 'es'); });
  lev.pct=lev.n ? Math.round(lev.cerr*100/lev.n) : null;
  O.lev=lev; O.insp=insT;
  return O;
}
var INF_ORIG_N = { buzon:'Buzón de sugerencias (la app y el QR)', buenas:'Buenas prácticas registradas', '—':'Sin decir de dónde salió' };
function _infOrigenN(k){ return INF_ORIG_N[k] || obsOrigenN(k) || k; }
/* la pirámide: los eventos (del mes y del año, hasta fin de mes) y las observaciones */
function _infBird(accs, reps, insp, fichas, mes, fin){
  var anio=mes.slice(0, 4), nivel={ mortal:0, incap:0, leve:1, primeros:1, dano:2, casi:3 }, B={ mes:[0, 0, 0, 0, 0], anio:[0, 0, 0, 0, 0] };
  (accs||[]).forEach(function(a){
    var n=nivel[a.clase]; if(n===undefined) return;
    var f=String(a.fecha||'').slice(0, 10); if(f.slice(0, 4)!==anio || f>fin) return;
    B.anio[n]++; if(f.slice(0, 7)===mes) B.mes[n]++;
  });
  /* la base: los actos y las condiciones subestándares (reportes y lo de las inspecciones con su ficha) */
  var M=obsFichasMapa(fichas||[]);
  (reps||[]).forEach(function(r){
    var f=String(r.fecha || r.creado || '').slice(0, 10), x=M[String(r.id)], t=(x && x.d && x.d.tipo) || (r.clase==='acto' ? 'acto' : 'condicion');
    if(f.slice(0, 4)!==anio || f>fin || (t!=='acto' && t!=='condicion')) return;
    B.anio[4]++; if(f.slice(0, 7)===mes) B.mes[4]++;
  });
  (insp||[]).forEach(function(i){
    var f=String(i.fecha||'').slice(0, 10); if(f.slice(0, 4)!==anio || f>fin) return;
    obsDeInspP(i).forEach(function(o){ var x=M[o.k], t=(x && x.d && x.d.tipo) || 'condicion'; if(t!=='acto' && t!=='condicion') return; B.anio[4]++; if(f.slice(0, 7)===mes) B.mes[4]++; });
  });
  return B;
}
var INF_BIRD = [
  { n:'Lesión con incapacidad o mortal', bird:'1' }, { n:'Lesión leve y primeros auxilios', bird:'10' }, { n:'Daño a la propiedad', bird:'30' },
  { n:'Casi accidente (sin lesión ni daño)', bird:'600' }, { n:'Actos y condiciones subestándares', bird:'' }
];

/* ── los programas del año al cierre del mes (programas.js): lo programado hasta ese mes, lo ejecutado y el cumplimiento ── */
function _infProgUno(d, H, progs, mi, cerrado){
  var T=progTipo(d.tipo), R={ k:d.tipo, n:T.n, items:0, p:0, e:0, pct:null, pAnio:0, atras:0, extra:0, meses:[], delMes:[] };
  for(var i=0;i<12;i++) R.meses.push({ p:0, e:0 });
  (d.items||[]).forEach(function(it){
    if(!it.ref && !gesTxt(it.n)) return;
    R.items++;
    var F=progFila(it, d.tipo, H, it.ref ? progs : null, d.anio);
    F.forEach(function(c, m){
      if(c.p){
        R.pAnio++; R.meses[m].p++;
        if(m<=mi){ R.p++; if(c.e){ R.e++; R.meses[m].e++; } else if(m<mi || cerrado) R.atras++; }
      } else if(c.e && m<=mi) R.extra++;
    });
    var cm=F[mi];
    if(cm && cm.p) R.delMes.push({ n:it.ref ? progTipo(it.ref).n : gesTxt(it.n), e:!!cm.e, resp:gesTxt(it.resp || ''), parte:cm.parte || '' });
  });
  if(R.p) R.pct=Math.round(R.e*100/R.p);
  return R;
}
function _infProgramas(progs, H, objs, mes, cerrado){
  var anio=mes.slice(0, 4), mi=+mes.slice(5, 7)-1, out={ L:[], tot:{ p:0, e:0, pct:null }, obj:[], hay:false, mi:mi }, Rsp=null;
  PROG_TIPOS.forEach(function(T){
    var f=progDe(progs, T.k, anio); if(!f) return;
    var R=_infProgUno(f.d, H, progs, mi, cerrado); out.L.push(R);
    /* el anual de SST con sus filas «de otro programa» repite lo de los demás: en la suma entran solo sus actividades propias */
    if(T.k!=='sst'){ out.tot.p+=R.p; out.tot.e+=R.e; }
    else { Rsp=_infProgUno(Object.assign({}, f.d, { items:(f.d.items||[]).filter(function(x){ return !x.ref; }) }), H, progs, mi, cerrado); out.tot.p+=Rsp.p; out.tot.e+=Rsp.e; }
  });
  out.hay=!!out.L.length;
  if(out.tot.p) out.tot.pct=Math.round(out.tot.e*100/out.tot.p);
  /* lo acumulado mes a mes de todos (para la línea): lo programado en el año, y lo ejecutado hasta el mes del informe */
  out.acP=[]; out.acE=[]; var ap=0, ae=0;
  for(var m=0;m<12;m++){
    out.L.forEach(function(R){ if(R.k==='sst') return; ap+=R.meses[m].p; if(m<=mi) ae+=R.meses[m].e; });
    if(Rsp){ ap+=Rsp.meses[m].p; if(m<=mi) ae+=Rsp.meses[m].e; }
    out.acP.push(ap); out.acE.push(m<=mi ? ae : null);
  }
  var o=objDe(objs, anio);
  if(o) (o.d.items||[]).forEach(function(it){
    if(!gesTxt(it.obj)) return;
    var f=String(it.fuente||''), sst=progDe(progs, 'sst', anio), R=null;
    if(f==='sst' && sst) R=_infProgUno(sst.d, H, progs, mi, cerrado);
    else if(f.indexOf('linea:')===0 && sst) R=_infProgUno(Object.assign({}, sst.d, { items:(sst.d.items||[]).filter(function(x){ return !x.ref && gesTxt(x.n) && String(x.g||'')===f.slice(6); }) }), H, progs, mi, cerrado);
    else if(/^(cap|insp|sim|camp|mon|aud)$/.test(f)){ var po=progDe(progs, f, anio); R=po ? _infProgUno(po.d, H, progs, mi, cerrado) : null; }
    out.obj.push({ obj:gesTxt(it.obj), meta:gesTxt(it.meta), ind:gesTxt(it.ind), resp:gesTxt(it.resp), plazo:gesTxt(it.plazo), fuente:f, R:R });
  });
  out.objAprob=o ? (o.d.aprob || '') : '';
  return out;
}
/* las fotos de un mes, chicas para el PDF y el Word (de a cuatro a la vez; lo que no carga, no entra) */
function _infMinis(L, campo, w, h, max){
  var usar=L.slice(0, max || 200), i=0;
  function una(){
    var x=usar[i++]; if(!x) return Promise.resolve();
    var u=x[campo]; if(!/^https:\/\//i.test(String(u||''))) return una();
    return _edMini(u, w, h).then(function(m){ if(m && m.d) x[campo+'Img']=m; return una(); });
  }
  return Promise.all([una(), una(), una(), una()]);
}
/* las fotos del registro fotográfico del mes: por tema, hasta 4 en el Intermedio y 12 en el Completo (80 en total) */
function _infFregTraer(D){
  var Fr=D.freg; if(!Fr || !Fr.del.length) return Promise.resolve();
  var tope=(INFW.nivel==='intermedio' || INFW.nivel==='basico') ? 4 : 12, cu={}, L=[];
  Fr.del.forEach(function(x){ cu[x.d.cat]=(cu[x.d.cat]||0)+1; if(cu[x.d.cat]<=tope && L.length<80) L.push({ u:x.url, x:x }); });
  return _infMinis(L, 'u', 900, 700, 80).then(function(){
    L.forEach(function(q){ if(q.uImg) q.x.img=q.uImg; });
    Fr.fallan=L.filter(function(q){ return !q.uImg; }).length;
  });
}

/* ── los gráficos del PDF (lote 19): columnas por mes, líneas, el avance de cada programa, la pirámide y las fotos ──
   Un solo eje en cada gráfico (nunca dos escalas), los colores por lo que significan y el texto en la tinta del informe. */
var INF_COL = { tinta:[11,42,58], azul2:[102,151,170], gris:[150,165,175], ok:[30,142,90], ambar:[214,141,0], mal:[198,50,58], verde2:[30,142,90] };
function _infEscala(mx, tope){
  if(tope){ var q=tope/4; return { tope:tope, marcas:[0, q, 2*q, 3*q, tope] }; }
  if(!(mx>0)) return { tope:1, marcas:[0, 1] };
  var bruto=mx/4, p10=Math.pow(10, Math.floor(Math.log(bruto)/Math.LN10)), paso=[1, 2, 2.5, 5, 10].map(function(k){ return k*p10; }).filter(function(v){ return v>=bruto-1e-9; })[0];
  var t=Math.ceil(mx/paso-1e-9)*paso, m=[];
  for(var v=0; v<=t+paso*1e-6; v+=paso) m.push(Math.round(v*1e6)/1e6);
  return { tope:t, marcas:m };
}
function _infGraficos(P){
  var doc=P.doc, C=P.C, M=P.M;
  var W=function(){ return P.W; }, H=function(){ return P.H; };
  var cabe=function(alto, tit){ if(P.y+alto>H()-56){ doc.addPage(); P.cab((P.secT || tit || '')+' (continúa)'); } };
  P.ley=function(S){
    var x=M+38;
    S.forEach(function(se){
      if(se.linea){ doc.setDrawColor(se.c[0], se.c[1], se.c[2]); doc.setLineWidth(1.6); if(se.dash) doc.setLineDashPattern([3, 2], 0); doc.line(x, P.y-2.5, x+14, P.y-2.5); doc.setLineDashPattern([], 0); doc.setLineWidth(0.5); x+=18; }
      else { P.F(se.c); doc.rect(x, P.y-6.5, 8, 8, 'F'); x+=12; }
      P.L('normal', 7.5, C.TEXTO); var t=P.T(se.n); doc.text(t, x, P.y); x+=doc.getTextWidth(t)+16;
    });
    P.y+=10;
  };
  function ejes(x0, w, y0, alto, esc, fmt){
    doc.setLineWidth(0.4);
    esc.marcas.forEach(function(v){
      var yy=y0-alto*v/esc.tope;
      doc.setDrawColor(C.RAYA[0], C.RAYA[1], C.RAYA[2]); doc.line(x0, yy, x0+w, yy);
      P.L('normal', 6.5, C.GRIS); doc.text(P.T(fmt(v)), x0-5, yy+2.2, {align:'right'});
    });
    doc.setDrawColor(C.SUAVE[0], C.SUAVE[1], C.SUAVE[2]); doc.line(x0, y0, x0+w, y0); doc.setLineWidth(0.5);
  }
  /* columnas por mes: S = [{ n, v:[…], c }] · op: { apilar, valores, alto, max } */
  P.columnas=function(tit, X, S, fmt, op){
    op=op||{}; var alto=op.alto||130;
    cabe(14+alto+26+(S.length>1 ? 14 : 0), tit);
    P.L('bold', 10.5, C.TINTA); doc.text(P.T(tit), M, P.y); P.y+=16;
    var x0=M+38, w=W()-2*M-38, y0=P.y+alto, gw=w/Math.max(1, X.length);
    var tot=X.map(function(_, i){ return op.apilar ? S.reduce(function(s, se){ return s+(+se.v[i]||0); }, 0) : Math.max.apply(null, S.map(function(se){ return +se.v[i]||0; }).concat([0])); });
    var esc=_infEscala(Math.max.apply(null, tot.concat([0])), op.max);
    ejes(x0, w, y0, alto, esc, fmt);
    X.forEach(function(lab, i){
      var cx=x0+i*gw;
      if(op.apilar){
        var bw=Math.min(26, gw*0.58), base=y0;
        S.forEach(function(se){ var v=+se.v[i]||0; if(v<=0) return; var hh=alto*v/esc.tope; P.F(se.c); doc.rect(cx+(gw-bw)/2, base-hh, bw, hh, 'F'); base-=hh; });
      } else {
        var bw2=Math.min(14, gw*0.7/S.length), gx=cx+(gw-bw2*S.length)/2;
        S.forEach(function(se, j){ var v=+se.v[i]||0; if(v<=0) return; var hh=alto*v/esc.tope; P.F(se.c); doc.rect(gx+j*bw2, y0-hh, bw2-1, hh, 'F'); });
      }
      if(op.valores && tot[i]>0){ P.L('bold', 6.3, C.TEXTO); doc.text(P.T(fmt(tot[i])), cx+gw/2, y0-alto*tot[i]/esc.tope-3, {align:'center'}); }
      P.L('normal', 7, C.GRIS); doc.text(P.T(lab), cx+gw/2, y0+10, {align:'center'});
    });
    P.y=y0+24;
    if(S.length>1) P.ley(S);
    P.y+=6;
  };
  /* líneas: S = [{ n, v:[… o null], c, dash }] · op: { max, valores, alto } */
  P.lineas=function(tit, X, S, fmt, op){
    op=op||{}; var alto=op.alto||130;
    cabe(14+alto+26+14, tit);
    P.L('bold', 10.5, C.TINTA); doc.text(P.T(tit), M, P.y); P.y+=16;
    var x0=M+38, w=W()-2*M-38, y0=P.y+alto, gw=w/Math.max(1, X.length), vals=[];
    S.forEach(function(se){ se.v.forEach(function(v){ if(v!=null && isFinite(v)) vals.push(+v); }); });
    var esc=_infEscala(Math.max.apply(null, vals.concat([0])), op.max);
    ejes(x0, w, y0, alto, esc, fmt);
    X.forEach(function(lab, i){ P.L('normal', 7, C.GRIS); doc.text(P.T(lab), x0+i*gw+gw/2, y0+10, {align:'center'}); });
    var pto=function(i, v){ return [x0+i*gw+gw/2, y0-alto*Math.min(v, esc.tope)/esc.tope]; };
    S.forEach(function(se){
      doc.setDrawColor(se.c[0], se.c[1], se.c[2]); doc.setLineWidth(1.6); if(se.dash) doc.setLineDashPattern([4, 3], 0);
      var prev=null, ult=null;
      se.v.forEach(function(v, i){ if(v==null || !isFinite(v)){ prev=null; return; } var p=pto(i, +v); if(prev) doc.line(prev[0], prev[1], p[0], p[1]); prev=p; ult={ p:p, v:+v }; });
      doc.setLineDashPattern([], 0); doc.setLineWidth(0.5);
      se.v.forEach(function(v, i){ if(v==null || !isFinite(v)) return; var p=pto(i, +v); P.F(C.BLANCO); doc.circle(p[0], p[1], 2.4, 'F'); P.F(se.c); doc.circle(p[0], p[1], 1.7, 'F'); });
      if(op.valores && ult){ P.L('bold', 7, C.TEXTO); doc.text(P.T(fmt(ult.v)), ult.p[0], ult.p[1]-5, {align:'center'}); }
    });
    P.y=y0+24; P.ley(S.map(function(se){ return { n:se.n, c:se.c, linea:true, dash:se.dash }; })); P.y+=6;
  };
  /* el avance: L = [{ n, pct (0 a 100, o null), sub }] · verde desde 90 %, ámbar desde 60 %, rojo debajo */
  P.avance=function(tit, L){
    if(!L.length) return;
    var et=176, der=118, bw=W()-2*M-et-der;
    cabe(18+Math.min(L.length, 6)*22, tit);
    P.L('bold', 10.5, C.TINTA); doc.text(P.T(tit), M, P.y); P.y+=14;
    L.forEach(function(t){
      if(P.y+22>H()-56){ doc.addPage(); P.cab((P.secT || tit)+' (continúa)'); }
      /* la categoría larga: un poco más chica antes de cortarla */
      P.L('normal', 8.5, C.TEXTO); if(doc.getTextWidth(P.T(String(t.n)))>et-10) P.L('normal', 7.3, C.TEXTO); doc.text(P.cortar(t.n, et-10), M, P.y+9);
      P.F(C.FONDO); doc.rect(M+et, P.y, bw, 12, 'F');
      if(t.pct!=null){ var c=t.pct>=90 ? INF_COL.ok : (t.pct>=60 ? INF_COL.ambar : INF_COL.mal), ww=Math.max(t.pct>0 ? 2 : 0, bw*Math.min(100, t.pct)/100); if(ww){ P.F(c); doc.rect(M+et, P.y, ww, 12, 'F'); } }
      P.L('bold', 8.5, C.TEXTO); doc.text(P.T(t.pct==null ? '—' : t.pct+' %'), M+et+bw+8, P.y+9);
      if(t.sub){ P.L('normal', 7.2, C.GRIS); doc.text(P.cortar(t.sub, der-46), M+et+bw+42, P.y+9); }
      P.y+=22;
    });
    P.y+=6;
  };
  /* la pirámide de Bird: B = { mes:[5], anio:[5] } (de la punta a la base) */
  P.piramide=function(B){
    var n=INF_BIRD.length, lh=40, alto=n*lh, ancho=262, x0=M, cx=x0+ancho/2;
    cabe(alto+40, 'Pirámide de Bird');
    var y=P.y+4, colores=[[176,40,48], [212,92,70], [232,146,86], [240,196,140], [205,219,226]];
    for(var i=0;i<n;i++){
      var wt=18+(ancho-18)*i/n, wb=18+(ancho-18)*(i+1)/n, yt=y+i*lh, hh=lh-3;
      P.F(colores[i]); doc.lines([[wt, 0], [(wb-wt)/2, hh], [-wb, 0], [(wb-wt)/2, -hh]], cx-wt/2, yt, [1, 1], 'F', true);
      P.L('bold', 13, i<2 ? C.BLANCO : C.TINTA); doc.text(P.T(String(B.mes[i])), cx, yt+hh/2+4.5, {align:'center'});
      var lx=x0+ancho+22, ym=yt+hh/2;
      doc.setDrawColor(C.RAYA[0], C.RAYA[1], C.RAYA[2]); doc.setLineWidth(0.5); doc.line(cx+(wt+wb)/4+6, ym, lx-6, ym);
      P.L('bold', 9.2, C.TINTA); doc.text(P.T(INF_BIRD[i].n), lx, ym-2);
      P.L('normal', 7.6, C.GRIS); doc.text(P.T('Del mes: '+B.mes[i]+' · en el año: '+B.anio[i]+(INF_BIRD[i].bird ? ' · Bird: '+INF_BIRD[i].bird : '')), lx, ym+9);
    }
    P.y=y+alto+14;
  };
  /* un subtítulo dentro de una parte */
  P.subtitulo=function(t){ if(P.y+40>H()-56){ doc.addPage(); P.cab((P.secT || t)+' (continúa)'); } P.L('bold', 11, C.TINTA); doc.text(P.cortar(t, W()-2*M), M, P.y); P.y+=14; };
  /* fotos de a dos por fila, con su leyenda: L = [{ img:{d,w,h}, tit, sub, d }] */
  P.grilla=function(L, op){
    op=op||{}; var gx=12, cw=(W()-2*M-gx)/2, ih=op.alto||150, ch=ih+38, col=0;
    L.forEach(function(f){
      if(col===0 && P.y+ch>H()-50){ doc.addPage(); P.cab((P.secT || '')+' (continúa)'); }
      var x0=M+col*(cw+gx), im=f.img, k=Math.min(cw/im.w, ih/im.h), iw=im.w*k, ihh=im.h*k;
      P.F(C.FONDO); doc.rect(x0, P.y, cw, ih, 'F');
      try{ doc.addImage(im.d, 'JPEG', x0+(cw-iw)/2, P.y+(ih-ihh)/2, iw, ihh); }catch(e){}
      P.L('bold', 8.5, C.TEXTO); doc.text(P.cortar(f.tit, cw-4), x0, P.y+ih+12);
      if(f.sub){ P.L('normal', 7.5, C.GRIS); doc.text(P.cortar(f.sub, cw-4), x0, P.y+ih+23); }
      col++; if(col===2){ col=0; P.y+=ch; }
    });
    if(col) P.y+=ch;
    P.y+=4;
  };
  /* una tabla con el texto en varias líneas (los objetivos, los movimientos): filas de alto variable, hasta 5 líneas por celda */
  P.tablaW=function(tit, cols, filas, anchos, op){
    op=op||{}; var num=op.num||{}, cx=[M], fs=op.tam||8, lh=fs*1.22;
    for(var i=1;i<anchos.length;i++) cx.push(cx[i-1]+anchos[i-1]);
    if(P.y+70>H()-60){ doc.addPage(); P.cab((P.secT || tit || '')+' (continúa)'); }
    if(tit){ P.L('bold', 10.5, C.TINTA); doc.text(P.T(tit), M, P.y); P.y+=10; }
    function cabT(){ P.F(C.TINTA); doc.rect(M, P.y, W()-2*M, 16, 'F'); P.L('bold', 7.5, C.BLANCO); cols.forEach(function(c, j){ if(num[j]) doc.text(P.T(c), cx[j]+anchos[j]-6, P.y+11, {align:'right'}); else doc.text(P.T(c), cx[j]+6, P.y+11); }); P.y+=16; }
    cabT();
    if(!filas.length){ P.L('normal', 8.5, C.GRIS); doc.text(P.T(op.vacio || 'Nada registrado este mes.'), M+6, P.y+14); P.y+=26; return; }
    filas.forEach(function(f, k){
      if(f && !Array.isArray(f) && f.g!=null){
        if(P.y+34>H()-60){ doc.addPage(); P.cab((P.secT || tit || '')+' (continúa)'); cabT(); }
        P.F(C.GRUPO); doc.rect(M, P.y, W()-2*M, 17, 'F'); P.L('bold', 8.5, C.TINTA); doc.text(P.cortar(f.g, W()-2*M-12), M+6, P.y+12); P.y+=17; return;
      }
      var v=Array.isArray(f) ? f : f.v, t=Array.isArray(f) ? '' : (f.t||'');
      P.L(t ? 'bold' : 'normal', fs, C.TEXTO);
      var ls=v.map(function(val, j){ var l=doc.splitTextToSize(P.T(String(val==null ? '' : val)), anchos[j]-12); if(l.length>5){ l=l.slice(0, 5); l[4]=String(l[4]).replace(/.{0,2}$/, '')+'…'; } return l; });
      var alto=Math.max.apply(null, ls.map(function(l){ return l.length; }))*lh+8;
      if(P.y+alto>H()-60){ doc.addPage(); P.cab((P.secT || tit || '')+' (continúa)'); cabT(); P.L(t ? 'bold' : 'normal', fs, C.TEXTO); }
      if(t==='tot'){ P.F(C.TOT); doc.rect(M, P.y, W()-2*M, alto, 'F'); } else if(k%2){ P.F([250,251,252]); doc.rect(M, P.y, W()-2*M, alto, 'F'); }
      P.L(t ? 'bold' : 'normal', fs, C.TEXTO);
      ls.forEach(function(l, j){ if(num[j]) doc.text(l, cx[j]+anchos[j]-6, P.y+fs+3, {align:'right'}); else doc.text(l, cx[j]+6, P.y+fs+3); });
      doc.setDrawColor(C.RAYA[0], C.RAYA[1], C.RAYA[2]); doc.setLineWidth(0.5); doc.line(M, P.y+alto, W()-M, P.y+alto); P.y+=alto;
    });
    P.y+=16;
  };
}

/* ── la tabla de observaciones: hojas horizontales, una fila por acto o condición, con sus dos fotos ──
   devuelve la página donde empieza (o null si el mes no tiene ninguna) */
var INF_OBS_COLS = [['N.º', 18], ['Fecha', 40], ['Mes', 38], ['Empresa que reporta', 60], ['Empresa observada', 60], ['Frente de obra', 48], ['Descripción de la observación', 101],
  ['Foto', 52], ['Origen', 52], ['Tipo', 42], ['Categoría', 66], ['Plan de acción / levantamiento', 101], ['Foto', 52], ['Fecha de cumplimiento', 56]];
function _infObsCumpl(x, dia){
  if(x.cerr) return x.fc ? _infFechaC(x.fc) : 'Levantada';
  if(x.lev) return 'Levantada, falta validarla';
  if(x.plazo) return 'Plazo: '+_infFechaC(x.plazo)+(x.plazo<dia ? ' (vencido)' : '');
  return 'Abierta';
}
function _infObsTabla(P, D){
  var L=((D.obs && D.obs.L) || []).filter(function(x){ return x.tipo==='acto' || x.tipo==='condicion'; });
  if(!L.length) return null;
  var doc=P.doc, C=P.C, Wl=841.89, Hl=595.28, m=28, fs=6.6, lh=fs*1.2, cx=[m], anchos=INF_OBS_COLS.map(function(c){ return c[1]; }), y=0, inicio=0;
  for(var i=1;i<anchos.length;i++) cx.push(cx[i-1]+anchos[i-1]);
  function cab(cont){
    doc.addPage('a4', 'landscape');
    if(!inicio) inicio=doc.getNumberOfPages();
    P.F(C.TINTA); doc.rect(0, 0, Wl, 44, 'F'); P.F(C.ORO); doc.rect(0, 44, Wl, 2.5, 'F');
    P.L('bold', 11, C.BLANCO); doc.text(P.cortar(String(P.cabTit||'').toUpperCase(), Wl-2*m-200), m, 20);
    P.L('normal', 8, C.SUAVE); doc.text(P.cortar(P.cabSub||'', Wl-2*m-200), m, 33);
    P.L('bold', 8, [255,226,150]); doc.text(P.T('INFORME DEL MES'), Wl-m, 20, {align:'right'});
    P.L('bold', 14, C.TINTA); doc.text(P.T('Tabla de observaciones'+(cont ? ' (continúa)' : '')), m, 70);
    y=80;
    P.F(C.TINTA); doc.rect(m, y, Wl-2*m, 26, 'F'); P.L('bold', 6.4, C.BLANCO);
    INF_OBS_COLS.forEach(function(c, j){ var l=doc.splitTextToSize(P.T(c[0]), anchos[j]-6); doc.text(l.slice(0, 3), cx[j]+3, y+9); });
    y+=26;
  }
  cab(false);
  L.forEach(function(x, k){
    var mes=INF_MESES[+x.f.slice(5, 7)-1] || '', origen=x.origen ? obsOrigenN(x.origen) : '—';
    var plan=x.plan ? x.plan+((!x.cerr && x.resp) ? ' · Responsable: '+x.resp : '') : (x.cerr ? 'Levantado' : '—');
    var desc=x.desc+(x.fuente==='insp' ? ' (de la inspección «'+x.insp+'»)' : (x.lugar && x.lugar!==x.frente ? ' · '+x.lugar : ''));
    var V=[String(k+1), _infFechaC(x.f), mes.charAt(0).toUpperCase()+mes.slice(1), x.er || '—', x.eo || '—', x.frente || '—', desc, null, origen, x.tipo==='acto' ? 'Acto' : 'Condición',
           (x.cat || 'Sin clasificar')+(x.amb ? ' · medio ambiente' : ''), plan, null, _infObsCumpl(x, D.dia)];
    P.L('normal', fs, C.TEXTO);
    var ls=V.map(function(v, j){ if(v===null) return []; var l=doc.splitTextToSize(P.T(v), anchos[j]-6); if(l.length>7){ l=l.slice(0, 7); l[6]=String(l[6]).replace(/.{0,2}$/, '')+'…'; } return l; });
    var conFoto=!!(x.fotoImg || x.fotoDImg), alto=Math.max(Math.max.apply(null, ls.map(function(l){ return l.length; }))*lh+7, conFoto ? 44 : 16);
    /* la última fila se lleva consigo la nota del pie: así no queda una hoja con la cabecera sola */
    if(y+alto+(k===L.length-1 ? 30 : 0)>Hl-30) cab(true);
    if(k%2){ P.F([248,250,251]); doc.rect(m, y, Wl-2*m, alto, 'F'); }
    P.L('normal', fs, C.TEXTO);
    ls.forEach(function(l, j){
      if(!l.length) return;
      if(j===13 && /vencido/.test(V[13])) doc.setTextColor(C.MAL[0], C.MAL[1], C.MAL[2]); else if(j===13 && x.cerr) doc.setTextColor(C.OK[0], C.OK[1], C.OK[2]);
      doc.text(l, cx[j]+3, y+fs+2.5);
      doc.setTextColor(C.TEXTO[0], C.TEXTO[1], C.TEXTO[2]);
    });
    [[7, x.fotoImg], [12, x.fotoDImg]].forEach(function(q){
      var im=q[1], j=q[0]; if(!im) { if(j===7 || j===12){ P.L('normal', 6, C.GRIS); doc.text('—', cx[j]+3, y+fs+2.5); } return; }
      var bw=anchos[j]-6, bh=38, kk=Math.min(bw/im.w, bh/im.h), iw=im.w*kk, ih=im.h*kk;
      try{ doc.addImage(im.d, 'JPEG', cx[j]+3+(bw-iw)/2, y+3+(bh-ih)/2, iw, ih); }catch(e){}
    });
    doc.setDrawColor(C.RAYA[0], C.RAYA[1], C.RAYA[2]); doc.setLineWidth(0.4); doc.line(m, y+alto, Wl-m, y+alto);
    y+=alto;
  });
  var sinFoto=L.filter(function(x){ return (x.foto && !x.fotoImg) || (x.fotoD && !x.fotoDImg); }).length;
  P.L('normal', 7, C.GRIS);
  var notas=[L.length+(L.length===1 ? ' observación' : ' observaciones')+' del mes: '+L.filter(function(x){ return x.cerr; }).length+' levantadas.'];
  if(D.obs.sinClas) notas.push(D.obs.sinClas+' sin clasificar: la categoría, el origen, las empresas y el frente se ponen en «Reportes» (la web) o en el reporte (la app).');
  if(sinFoto) notas.push(sinFoto+(sinFoto===1 ? ' foto no se pudo cargar.' : ' fotos no se pudieron cargar.'));
  if(y+24>Hl-30) cab(true);
  doc.text(doc.splitTextToSize(P.T(notas.join(' ')), Wl-2*m), m, y+12);
  /* lo que sigue va en una hoja vertical */
  P.usada=true; P.y=P.H;
  return inicio;
}

/* ── las partes nuevas del informe de una obra (devuelve true si la parte es suya) ── */
function _infSecc19(P, D, k, cx){
  var doc=P.doc, C=P.C, W=P.W, M=P.M, mesN=_infMesN(D.mes), cap=function(s){ s=String(s||''); return s.charAt(0).toUpperCase()+s.slice(1); };
  var tot=function(v){ return { v:v, t:'tot' }; }, cerrado=(D.dia===_infMesFin(D.mes) && D.dia<hoyISO());
  if(k==='personal'){
    var Pe=D.per;
    if(!Pe){ P.nota('No se pudo leer el personal de la obra.'); return true; }
    P.cifras([['En obra al cierre', Pe.act, Pe.ob+' obreros · '+Pe.st+' staff'], ['De descanso', Pe.desc, 'vacaciones, descanso médico'],
              ['Ingresaron en el mes', Pe.ing, Pe.rein ? Pe.rein+' volvieron a estar activos' : ''], ['Cesados y trasladados', Pe.ces+Pe.tras, Pe.ces+' cesados · '+Pe.tras+' trasladados']]);
    P.tabla('Por empresa', ['Empresa', 'En obra', 'Obreros', 'Staff', 'Descanso', 'Ingresos', 'Ceses', 'Traslados'],
      Pe.empL.map(function(e){ return [e.n, e.act, e.ob, e.st, e.desc, e.ing, e.ces, e.tras]; }).concat(Pe.empL.length>1 ? [tot(['Total', Pe.act, Pe.ob, Pe.st, Pe.desc, Pe.ing, Pe.ces, Pe.tras])] : []),
      [W-2*M-324, 48, 48, 40, 50, 48, 42, 48], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1 }, vacio:'Sin personal registrado en la obra.' });
    if(Pe.mov.length) P.tablaW('Los movimientos del mes', ['Fecha', 'Trabajador', 'Empresa', 'Qué pasó'], Pe.mov.map(function(x){ return [_infFechaC(x.f), x.n, x.emp, INF_MOV_N[x.k]+(x.m ? ' · '+x.m : '')]; }), [62, W-2*M-312, 120, 130]);
    else P.nota('Sin ingresos, ceses ni traslados en el mes.');
    /* con renglones que crecen: el puesto y la empresa largos se leen enteros (antes salían cortados con «…») */
    if(cx.completo) P.tablaW('La relación del personal', ['N.º', 'Trabajador', docPersonaP(), 'Puesto', 'Empresa', 'Categoría', 'Al cierre del mes'],
      Pe.L.map(function(t, i){ return [i+1, t.n, t.doc, t.puesto, t.emp, t.cat, INF_SIT_N[t.e]+(t.e!=='activo' && t.desde ? ' · '+_infFechaC(t.desde) : '')]; }), [24, 112, 54, 92, W-2*M-401, 44, 75], { num:{ 0:1 } });
    else if(Pe.L.length) P.nota('La relación del personal, uno por uno, va en el nivel Completo y en el Excel.');
    P.nota('El estado de cada uno sale de su ficha y de su historia en la obra (el ingreso, el cese, el traslado a otra obra, el descanso), al '+fechaLarga(D.dia)+'.');
    return true;
  }
  if(k==='hhanio'){
    var Aa=D.hhA, X=Aa.M.map(function(q){ return cap(INF_MESES[+q.m.slice(5, 7)-1].slice(0, 3)); });
    P.cifras([['HHT del año', _infNum(Aa.acum.hht), 'hasta '+mesN], ['HHC del año', _infDec(Aa.acum.hhc), Aa.acum.hht ? _infPct(Aa.acum.hhc, Aa.acum.hht)+' de lo trabajado' : ''],
              ['HHT del mes', _infNum(D.hh.hht), D.hh.dias+(D.hh.dias===1 ? ' día' : ' días')], ['Promedio por mes', _infNum(Aa.acum.hht/Math.max(1, Aa.M.filter(function(q){ return q.hht>0; }).length)), 'horas hombre trabajadas']]);
    P.columnas('Horas hombre trabajadas, mes a mes', X, [{ n:'Obreros', v:Aa.M.map(function(q){ return q.obHHT; }), c:INF_COL.tinta }, { n:'Staff', v:Aa.M.map(function(q){ return q.stHHT; }), c:INF_COL.azul2 }], _infNum, { apilar:true, valores:true });
    P.lineas('Horas hombre de capacitación, acumuladas en el año', X, [{ n:'HHC acumuladas', v:Aa.M.map(function(q){ return q.acHHC; }), c:INF_COL.ok }], _infDec, { valores:true, alto:110 });
    P.tabla('Mes a mes, con lo acumulado', ['Mes', 'HHT obreros', 'HHT staff', 'HHT', 'HHC', 'HHC / HHT', 'HHT acumuladas', 'HHC acumuladas'],
      Aa.M.map(function(q){ return [cap(_infMesN(q.m)), _infNum(q.obHHT), _infNum(q.stHHT), _infNum(q.hht), _infDec(q.hhc), _infPct(q.hhc, q.hht), _infNum(q.acHHT), _infDec(q.acHHC)]; })
        .concat([tot(['Total del año', _infNum(Aa.acum.obHHT), _infNum(Aa.acum.stHHT), _infNum(Aa.acum.hht), _infDec(Aa.acum.hhc), _infPct(Aa.acum.hhc, Aa.acum.hht), '', ''])]),
      [W-2*M-431, 60, 52, 58, 46, 54, 82, 79], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1 } });
    if(!Aa.acum.hht) P.nota('Sin horas hombre registradas en el año: se registran en el «Reporte semanal» de la app o en «Horas hombre» de la web (también los meses anteriores).');
    return true;
  }
  if(k==='programas'){
    var Pg=D.prog;
    if(!Pg || !Pg.hay){ P.nota(Pg===null ? 'No se pudieron leer los programas del año.' : 'La obra todavía no tiene sus programas del año en OBRASST. Se arman en «Programas del año» (la web): el anual de SST y los de capacitación, inspecciones, simulacros, campañas, monitoreo ocupacional y auditorías. Lo ejecutado se cuenta solo.'); return true; }
    var atras=Pg.L.reduce(function(s, R){ return s+(R.k==='sst' ? 0 : R.atras); }, 0), dm=Pg.L.reduce(function(s, R){ return s+R.delMes.length; }, 0);
    P.cifras([['Cumplimiento al mes', Pg.tot.pct==null ? '—' : Pg.tot.pct+' %', Pg.tot.e+' de '+Pg.tot.p+' actividades', Pg.tot.pct==null ? '' : (Pg.tot.pct>=90 ? 'ok' : (Pg.tot.pct<60 ? 'mal' : ''))],
              ['Programas', Pg.L.length, 'armados para '+D.anio], ['Sin cumplir', atras, cerrado ? 'de los meses cerrados' : 'de los meses anteriores', atras ? 'mal' : 'ok'], ['Del mes', dm, 'programadas en '+mesN]]);
    P.avance('Cumplimiento de cada programa, hasta '+mesN, Pg.L.map(function(R){ return { n:R.n, pct:R.pct, sub:R.p ? R.e+' de '+R.p : 'nada programado aún' }; }));
    P.lineas('Todos los programas: lo programado y lo ejecutado, acumulado en el año', INF_MESES.map(function(n){ return cap(n.slice(0, 3)); }),
      [{ n:'Programado', v:Pg.acP, c:INF_COL.gris, dash:true }, { n:'Ejecutado', v:Pg.acE, c:INF_COL.tinta }], _infNum, { valores:true });
    P.tabla('Cada programa', ['Programa', 'Programadas al mes', 'Ejecutadas', 'Cumplimiento', 'En el año', 'Sin cumplir'],
      Pg.L.map(function(R){ return [R.n, R.p, R.e, R.pct==null ? '—' : R.pct+' %', R.pAnio, R.atras]; }), [W-2*M-312, 74, 60, 64, 54, 60], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1 } });
    var F=[];
    Pg.L.forEach(function(R){ if(!R.delMes.length) return; F.push({ g:R.n }); R.delMes.forEach(function(a){ F.push([a.n, a.resp || '—', a.e ? 'Cumplida' : (cerrado ? 'No se cumplió' : 'Pendiente')]); }); });
    P.tablaW('Lo programado para '+mesN, ['Actividad', 'Responsable', 'Estado'], F.filter(function(f){ return Array.isArray(f); }).length ? F : [], [W-2*M-220, 130, 90], { vacio:'Nada programado para este mes.' });
    P.nota('Lo ejecutado se cuenta solo con lo que la obra registra en OBRASST —capacitaciones, inspecciones, simulacros, campañas, monitoreos y auditorías— y con lo marcado a mano en cada programa. Del anual de SST se suman sus actividades propias: sus filas de los otros programas no se cuentan dos veces.');
    return true;
  }
  if(k==='objetivos'){
    var Pq=D.prog;
    if(!Pq){ P.nota('No se pudieron leer los objetivos del año.'); return true; }
    if(!Pq.obj.length){ P.nota('La obra todavía no tiene sus objetivos y metas del año: se arman en «Objetivos y metas» (la web), sacados de los programas del año.'); return true; }
    var conR=Pq.obj.filter(function(o){ return o.R; });
    if(conR.length) P.avance('El avance de cada objetivo, hasta '+mesN, conR.map(function(o){ return { n:o.obj, pct:o.R.pct, sub:o.R.p ? o.R.e+' de '+o.R.p : 'aún nada' }; }));
    P.tablaW('Los objetivos y metas de '+D.anio, ['Objetivo', 'Meta', 'Indicador', 'Avance'], Pq.obj.map(function(o){ return [o.obj, o.meta || '—', o.ind || '—', o.R ? (o.R.pct==null ? 'Aún nada programado' : o.R.pct+' %') : 'Se mide a mano']; }), [176, 140, 131, 64], { tam:7.6 });
    if(Pq.objAprob) P.nota('Aprobados el '+fechaLarga(Pq.objAprob)+'.');
    return true;
  }
  if(k==='reportes'){
    var O=D.obs, Lv=O.lev;
    P.cifras([['Actos', O.tot.acto, 'subestándares'], ['Condiciones', O.tot.condicion, 'subestándares'], ['Sugerencias', O.tot.sug, O.buzon ? O.buzon+' del buzón' : ''], ['Buenas prácticas', O.tot.buena, '']]);
    P.tabla('De dónde salieron', ['Origen', 'Actos', 'Condiciones', 'Sugerencias', 'Buenas prácticas', 'Total'],
      O.porOrigen.map(function(o){ return [_infOrigenN(o.k), o.acto, o.condicion, o.sug, o.buena, o.acto+o.condicion+o.sug+o.buena]; })
        .concat(O.porOrigen.length ? [tot(['Total', O.tot.acto, O.tot.condicion, O.tot.sug, O.tot.buena, O.tot.acto+O.tot.condicion+O.tot.sug+O.tot.buena])] : []),
      [W-2*M-300, 46, 64, 64, 80, 46], { num:{ 1:1, 2:1, 3:1, 4:1, 5:1 }, vacio:'Nada observado este mes.' });
    P.cifras([['Levantadas', Lv.cerr+' de '+Lv.n, Lv.pct==null ? 'actos y condiciones' : Lv.pct+' % de los actos y condiciones', Lv.n && Lv.cerr===Lv.n ? 'ok' : ''],
              ['Sin levantar', Lv.ab, Lv.lev ? Lv.lev+' esperan la validación' : '', Lv.ab ? 'mal' : 'ok'], ['Fuera de plazo', Lv.venc, 'con el plazo vencido', Lv.venc ? 'mal' : 'ok'],
              ['Reportes abiertos hoy', D.rep.abiertosHoy, 'de todos los meses', D.rep.abiertosHoy ? 'mal' : 'ok']]);
    if(!cx.basico){
      P.barras('Actos, por categoría', O.porCat.acto.slice(0, 8).map(function(c){ return { n:c[0], v:c[1] }; }), _infNum);
      P.barras('Condiciones, por categoría', O.porCat.condicion.slice(0, 8).map(function(c){ return { n:c[0], v:c[1] }; }), _infNum);
      if(O.porEmp.length) P.tabla('Por empresa observada', ['Empresa', 'Actos', 'Condiciones', 'Levantadas', '% levantado'], O.porEmp.map(function(e){ return [e.n, e.acto, e.condicion, e.cerr, _infPct(e.cerr, e.acto+e.condicion)]; }), [W-2*M-262, 50, 70, 64, 78], { num:{ 1:1, 2:1, 3:1, 4:1 } });
      if(O.porFrente.length) P.tabla('Por frente de obra', ['Frente', 'Actos y condiciones', 'Levantadas', '% levantado'], O.porFrente.slice(0, 12).map(function(f){ return [f.n, f.n2, f.cerr, _infPct(f.cerr, f.n2)]; }), [W-2*M-250, 100, 70, 80], { num:{ 1:1, 2:1, 3:1 } });
    }
    if(O.sinClas) P.nota(O.sinClas+(O.sinClas===1 ? ' observación del mes está sin clasificar' : ' observaciones del mes están sin clasificar')+': su categoría, de dónde salió, las empresas y el frente se ponen en «Reportes» de la web («Clasificar uno por uno») o en el reporte, en la app.');
    if(O.amb) P.nota(O.amb+(O.amb===1 ? ' es de medio ambiente.' : ' son de medio ambiente.'));
    return true;
  }
  if(k==='bird'){
    P.piramide(D.bird);
    P.nota('La pirámide de Bird (1969): por cada lesión grave hubo, en promedio, 10 lesiones leves, 30 daños a la propiedad y 600 incidentes sin lesión ni daño. La base son los actos y las condiciones subestándares observados: controlarlos es lo que previene lo de arriba.');
    P.nota('Del mes y del año hasta el '+fechaLarga(_infMesFin(D.mes))+'. Los eventos salen de «Accidentabilidad»; las observaciones, de los reportes y de lo que se encontró en las inspecciones.');
    return true;
  }
  if(k==='fotoreg'){
    var Fr=D.freg;
    if(!Fr || !Fr.del.length){ P.nota('No hay fotos en el registro fotográfico de '+mesN+': se suben en «Registro fotográfico» (la web) o desde la cámara de la app, tema por tema.'); return true; }
    var puestas=0, temas=Fr.L.slice();
    Fr.del.forEach(function(x){ if(!temas.some(function(c){ return c.k===x.d.cat; })){ temas.push(fotoCatDe(Fr.L, x.d.cat)); } });
    var vistos={};
    temas.forEach(function(c){
      if(vistos[c.k]) return; vistos[c.k]=1;
      var fs=Fr.del.filter(function(x){ return x.d.cat===c.k && x.img; }); if(!fs.length) return;
      P.subtitulo(c.n+' · '+fs.length+(fs.length===1 ? ' foto' : ' fotos'));
      P.grilla(fs.map(function(x){ return { img:x.img, tit:x.d.desc || c.n, sub:_infFechaC(x.d.fecha)+(x.d.frente ? ' · '+x.d.frente : '')+(x.d.emp ? ' · '+x.d.emp : '') }; }));
      puestas+=fs.length;
    });
    if(Fr.del.length>puestas) P.nota('Van '+puestas+' de las '+Fr.del.length+' fotos del registro del mes'+(Fr.fallan ? ' ('+Fr.fallan+(Fr.fallan===1 ? ' no se pudo cargar)' : ' no se pudieron cargar)') : '')+'.');
    return true;
  }
  return false;
}

/* ═══ 19/10/2026 · lote 19 · TODO EN UN WORD, O CADA PARTE EN SU ARCHIVO ═══════════════════════════════════════════
   Marcelo: «Tener la opción de generar el informe con documentos separados, o todo en un solo Word con la información».
   · Todo en un Word: las mismas partes del PDF, en el mismo orden, con sus tablas y sus fotos (la tabla de observaciones va
     en hojas horizontales, como en el PDF). Se arma a mano, sin librería: un .docx es un ZIP con XML.
   · Documentos separados: un ZIP con un PDF por parte (cada una en su hoja, numerada aparte), los anexos tal cual, el Excel
     y el Word de los temas del mes. */
function _infDocx2(titulo, sub, bloques){
  /* bloques: { h, nivel } un título · { p, gris } un párrafo · { t:{ cols:[[título, ancho, 'izq'|'der']], filas } } una tabla
     (una celda puede ser { img:{ u8, w, h }, ancho }) · { img:{ u8, w, h }, ancho } una foto · { salto:'h'|'v' } hojas horizontales o verticales */
  var imgs=[], did=0;
  function run(t, op){ op=op||{}; return '<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>'+(op.b ? '<w:b/>' : '')+'<w:color w:val="'+(op.c||'1B2A33')+'"/><w:sz w:val="'+(op.sz||20)+'"/></w:rPr><w:t xml:space="preserve">'+_infX(t)+'</w:t></w:r>'; }
  function par(t, op){ op=op||{}; return '<w:p><w:pPr>'+(op.keep ? '<w:keepNext/>' : '')+'<w:spacing w:before="'+(op.antes||0)+'" w:after="'+(op.despues==null ? 120 : op.despues)+'"/>'+(op.der ? '<w:jc w:val="right"/>' : (op.centro ? '<w:jc w:val="center"/>' : ''))+'</w:pPr>'+run(t, op)+'</w:p>'; }
  function dibujo(im, anchoTw){
    var n=imgs.length+1, rid='rIdImg'+n, k=Math.min(1, anchoTw/(im.w*15)), cx=Math.round(im.w*15*k*635), cy=Math.round(im.h*15*k*635); did++;
    imgs.push({ n:'media/imagen'+n+'.jpeg', b:im.u8, rid:rid });
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+cx+'" cy="'+cy+'"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="'+did+'" name="Imagen '+did+'"/>'+
      '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>'+
      '<pic:nvPicPr><pic:cNvPr id="'+did+'" name="imagen'+n+'.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="'+rid+'"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'+
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  }
  function celda(v, ancho, op){
    op=op||{};
    var x='<w:tc><w:tcPr><w:tcW w:w="'+ancho+'" w:type="dxa"/>'+(op.span ? '<w:gridSpan w:val="'+op.span+'"/>' : '')+(op.fondo ? '<w:shd w:val="clear" w:color="auto" w:fill="'+op.fondo+'"/>' : '')+'<w:vAlign w:val="'+(op.arriba ? 'top' : 'center')+'"/></w:tcPr>';
    if(v && typeof v==='object' && v.img) return x+'<w:p><w:pPr><w:spacing w:before="20" w:after="20"/><w:jc w:val="center"/></w:pPr>'+dibujo(v.img, Math.max(200, ancho-160))+'</w:p></w:tc>';
    return x+'<w:p><w:pPr><w:spacing w:before="20" w:after="20"/>'+(op.der ? '<w:jc w:val="right"/>' : '')+'</w:pPr>'+run(v==null ? '' : v, { b:op.b, c:op.c, sz:op.sz||18 })+'</w:p></w:tc>';
  }
  function tabla(T){
    /* el orden del esquema: tblW, tblBorders, tblLayout, tblCellMar */
    var total=T.cols.reduce(function(s, c){ return s+c[1]; }, 0), sz=T.sz||18, x='<w:tbl><w:tblPr><w:tblW w:w="'+total+'" w:type="dxa"/>'+
      '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="CBD4DB"/><w:left w:val="single" w:sz="4" w:color="CBD4DB"/><w:bottom w:val="single" w:sz="4" w:color="CBD4DB"/><w:right w:val="single" w:sz="4" w:color="CBD4DB"/><w:insideH w:val="single" w:sz="4" w:color="CBD4DB"/><w:insideV w:val="single" w:sz="4" w:color="CBD4DB"/></w:tblBorders><w:tblLayout w:type="fixed"/>'+
      '<w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'+T.cols.map(function(c){ return '<w:gridCol w:w="'+c[1]+'"/>'; }).join('')+'</w:tblGrid>';
    if(!T.sinCab) x+='<w:tr><w:trPr><w:tblHeader/></w:trPr>'+T.cols.map(function(c){ return celda(c[0], c[1], { b:1, c:'FFFFFF', fondo:'0B2A3A', der:c[2]==='der', sz:sz }); }).join('')+'</w:tr>';
    if(!T.filas.length) x+='<w:tr>'+celda(T.vacio || 'Nada registrado este mes.', total, { span:T.cols.length, c:'5E6E79', sz:sz })+'</w:tr>';
    T.filas.forEach(function(f){
      if(f && !Array.isArray(f) && f.g!=null){ x+='<w:tr>'+celda(f.g, total, { span:T.cols.length, b:1, c:'0B2A3A', fondo:'DCE7ED', sz:sz })+'</w:tr>'; return; }
      var v=Array.isArray(f) ? f : f.v, t=Array.isArray(f) ? '' : f.t, fondo=t==='tot' ? '12506B' : (t==='sub' ? 'F3F6F8' : ''), c=t==='tot' ? 'FFFFFF' : '1B2A33';
      x+='<w:tr><w:trPr><w:cantSplit/></w:trPr>'+v.map(function(val, j){ return celda(val, T.cols[j][1], { b:!!t, c:c, fondo:fondo, der:T.cols[j][2]==='der', sz:sz, arriba:!!T.arriba }); }).join('')+'</w:tr>';
    });
    return x+'</w:tbl>'+par('', { despues:140 });
  }
  var V='<w:pgSz w:w="11906" w:h="16838"/>', Hz='<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>', mar='<w:pgMar w:top="1134" w:right="1021" w:bottom="1134" w:left="1021" w:header="567" w:footer="567" w:gutter="0"/>', ori='v';
  var cuerpo=par(titulo, { b:1, sz:34, c:'0B2A3A', despues:60 })+par(sub, { sz:20, c:'5E6E79', despues:240 });
  bloques.forEach(function(b){
    if(b.salto && b.salto!==ori){ cuerpo+='<w:p><w:pPr><w:sectPr>'+(ori==='h' ? Hz : V)+mar+'</w:sectPr></w:pPr></w:p>'; ori=b.salto; return; }
    if(b.h) cuerpo+=par(b.h, b.nivel===2 ? { b:1, sz:22, c:'0B2A3A', antes:120, despues:80, keep:1 } : { b:1, sz:28, c:'0B2A3A', antes:280, despues:120, keep:1 });
    if(b.p) cuerpo+=par(b.p, { sz:18, c:b.gris ? '5E6E79' : '1B2A33' });
    if(b.t) cuerpo+=tabla(b.t);
    if(b.img) cuerpo+='<w:p><w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>'+dibujo(b.img, b.ancho || 4500)+'</w:p>';
  });
  var doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '+
    'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>'+cuerpo+
    '<w:sectPr>'+(ori==='h' ? Hz : V)+mar+'</w:sectPr></w:body></w:document>';
  var tipos='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/>'+
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>';
  var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'+
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
  var drels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    imgs.map(function(i){ return '<Relationship Id="'+i.rid+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="'+i.n+'"/>'; }).join('')+'</Relationships>';
  var core='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'+
    '<dc:title>'+_infX(titulo)+'</dc:title><dc:creator>OBRASST</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">'+new Date().toISOString().slice(0, 19)+'Z</dcterms:created></cp:coreProperties>';
  return _infZip([{ n:'[Content_Types].xml', x:tipos }, { n:'_rels/.rels', x:rels }, { n:'docProps/core.xml', x:core }, { n:'word/document.xml', x:doc }, { n:'word/_rels/document.xml.rels', x:drels }]
    .concat(imgs.map(function(i){ return { n:'word/'+i.n, b:i.b }; })), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
/* las partes del informe, en bloques del Word (las mismas del PDF, en su orden) */
function _infWordTodo(D){
  var S=INFW.secc.filter(_infVa), B=[], desglose=(INFW.temas!=='total'), completo=(INFW.nivel==='completo'), mesN=_infMesN(D.mes), cap=function(s){ s=String(s||''); return s.charAt(0).toUpperCase()+s.slice(1); };
  var ANCHO=9864, tot=function(v){ return { v:v, t:'tot' }; };
  var cifras=function(L){ B.push({ t:{ sinCab:true, cols:[['', 3300, 'izq'], ['', 1500, 'der'], ['', 5064, 'izq']], filas:L.map(function(c){ return [c[0], String(c[1]), c[2]||'']; }) } }); };
  B.push({ p:'Para: '+_infParaTxt()+' · Elaborado por: '+(String(INFW.por||'').trim() || '—')+' · Emitido el '+fechaLarga(hoyISO())+' · Código de la obra: '+((YO.obra||{}).codigo||'—'), gris:1 });
  B.push({ p:'Contenido: '+S.filter(function(x){ return x.k!=='portada' && x.k!=='anexos'; }).map(function(x){ return _infSeccN(x.k).n; }).join(' · ')+'.', gris:1 });
  S.forEach(function(x){
    var k=x.k, s=_infSeccN(k); if(k==='portada') return;
    if(k==='obstabla'){
      var Lo=((D.obs && D.obs.L) || []).filter(function(o){ return o.tipo==='acto' || o.tipo==='condicion'; });
      B.push({ salto:'h' }, { h:s.n });
      var cols=[['N.º', 420, 'der'], ['Fecha', 950, 'izq'], ['Mes', 950, 'izq'], ['Empresa que reporta', 1250, 'izq'], ['Empresa observada', 1250, 'izq'], ['Frente', 950, 'izq'], ['Descripción de la observación', 2000, 'izq'],
                ['Foto', 1150, 'izq'], ['Origen', 1050, 'izq'], ['Tipo', 850, 'izq'], ['Categoría', 1250, 'izq'], ['Plan de acción / levantamiento', 1876, 'izq'], ['Foto', 1150, 'izq'], ['Cumplimiento', 1700, 'izq']];
      B.push({ t:{ cols:cols, sz:15, arriba:true, vacio:'No hubo actos ni condiciones en el mes.', filas:Lo.map(function(o, i){
        var plan=o.plan ? o.plan+((!o.cerr && o.resp) ? ' · Responsable: '+o.resp : '') : (o.cerr ? 'Levantado' : '—');
        return [String(i+1), _infFechaC(o.f), cap(INF_MESES[+o.f.slice(5, 7)-1]), o.er || '—', o.eo || '—', o.frente || '—', o.desc+(o.fuente==='insp' ? ' (de la inspección «'+o.insp+'»)' : ''),
                o.fotoImg ? { img:o.fotoImg } : '—', o.origen ? obsOrigenN(o.origen) : '—', o.tipo==='acto' ? 'Acto' : 'Condición', (o.cat || 'Sin clasificar')+(o.amb ? ' · medio ambiente' : ''), plan, o.fotoDImg ? { img:o.fotoDImg } : '—', _infObsCumpl(o, D.dia)]; }) } });
      B.push({ salto:'v' });
      return;
    }
    B.push({ h:s.n });
    if(k==='anexos'){ B.push({ p:(INFW.anexos.length ? 'Van en el PDF: '+INFW.anexos.map(function(a){ return a.nombre; }).join(' · ')+'.' : 'Sin anexos.')+(D.com && D.com.actas && D.com.actas.length ? ' Las actas del comité del mes también van en el PDF.' : ''), gris:1 }); return; }
    if(k==='resumen'){
      cifras([['Personal activo', D.activos, D.cat.o+' obreros · '+D.cat.s+' staff'], ['Horas hombre trabajadas', _infNum(D.hh.hht), D.hh.dias+' días registrados'], ['Horas hombre de capacitación', _infDec(D.hh.hhc), D.hh.hht ? _infPct(D.hh.hhc, D.hh.hht)+' de lo trabajado' : ''], ['Accidentes del mes', D.acc.mes, _infAccSub(D.acc)]]);
      var Hh=D.hh, A=D.hhA ? D.hhA.acum : null, d=Hh.dias||0;
      B.push({ h:'Horas hombre del mes, obreros y staff', nivel:2 }, { t:{ cols:[['', 3664, 'izq'], ['Obreros', 1400, 'der'], ['Staff', 1400, 'der'], ['Total del mes', 1600, 'der'], ['Acumulado del año', 1800, 'der']], filas:[
        ['Personal por día (promedio)', d ? _infDec(Hh.obN/d) : '—', d ? _infDec(Hh.stN/d) : '—', d ? _infDec((Hh.obN+Hh.stN)/d) : '—', '—'],
        ['Horas hombre trabajadas (HHT)', _infNum(Hh.obHHT), _infNum(Hh.stHHT), _infNum(Hh.hht), A ? _infNum(A.hht) : '—'],
        ['Horas hombre de capacitación (HHC)', _infDec(Hh.hhcOb), _infDec(Hh.hhcSt), _infDec(Hh.hhc), A ? _infDec(A.hhc) : '—'],
        { v:['Capacitación sobre lo trabajado', _infPct(Hh.hhcOb, Hh.obHHT), _infPct(Hh.hhcSt, Hh.stHHT), _infPct(Hh.hhc, Hh.hht), A ? _infPct(A.hhc, A.hht) : '—'], t:'sub' }] } });
      B.push({ h:'Índices del año (hasta fin de mes)', nivel:2 }, { t:{ cols:[['Indicador', 3000, 'izq'], ['Valor', 1600, 'der'], ['Cómo se calcula', 5264, 'izq']], filas:[
        ['Horas hombre del año', _infNum(D.acc.hAnio), 'suma de las horas registradas'], ['Accidentes que cuentan', D.acc.nIF, 'con incapacidad o mortales'], ['Días perdidos', D.acc.dias, 'de esos accidentes'],
        ['Índice de frecuencia', _infDec2(D.acc.IF), 'accidentes × 1 000 000 / horas hombre'], ['Índice de severidad', _infDec2(D.acc.IS, 1), 'días perdidos × 1 000 000 / horas hombre'], ['Incidentes del año', D.acc.incAnio, 'casi accidentes, primeros auxilios y daños']] } });
      return;
    }
    if(k==='personal'){
      var Pe=D.per; if(!Pe){ B.push({ p:'No se pudo leer el personal de la obra.', gris:1 }); return; }
      cifras([['En obra al cierre', Pe.act, Pe.ob+' obreros · '+Pe.st+' staff'], ['De descanso', Pe.desc, ''], ['Ingresaron en el mes', Pe.ing, ''], ['Cesados y trasladados', Pe.ces+Pe.tras, Pe.ces+' cesados · '+Pe.tras+' trasladados']]);
      B.push({ h:'Por empresa', nivel:2 }, { t:{ cols:[['Empresa', 2864, 'izq'], ['En obra', 1000, 'der'], ['Obreros', 1000, 'der'], ['Staff', 900, 'der'], ['Descanso', 1000, 'der'], ['Ingresos', 1000, 'der'], ['Ceses', 1000, 'der'], ['Traslados', 1100, 'der']],
        filas:Pe.empL.map(function(e){ return [e.n, e.act, e.ob, e.st, e.desc, e.ing, e.ces, e.tras]; }).concat(Pe.empL.length>1 ? [tot(['Total', Pe.act, Pe.ob, Pe.st, Pe.desc, Pe.ing, Pe.ces, Pe.tras])] : []) } });
      if(Pe.mov.length) B.push({ h:'Los movimientos del mes', nivel:2 }, { t:{ cols:[['Fecha', 1300, 'izq'], ['Trabajador', 3364, 'izq'], ['Empresa', 2500, 'izq'], ['Qué pasó', 2700, 'izq']], filas:Pe.mov.map(function(m){ return [_infFechaC(m.f), m.n, m.emp, INF_MOV_N[m.k]+(m.m ? ' · '+m.m : '')]; }) } });
      if(completo) B.push({ h:'La relación del personal', nivel:2 }, { t:{ cols:[['N.º', 500, 'der'], ['Trabajador', 2600, 'izq'], [docPersonaP(), 1200, 'izq'], ['Puesto', 1700, 'izq'], ['Empresa', 1800, 'izq'], ['Categoría', 900, 'izq'], ['Al cierre del mes', 1164, 'izq']],
        filas:Pe.L.map(function(t, i){ return [i+1, t.n, t.doc, t.puesto, t.emp, t.cat, INF_SIT_N[t.e]+(t.e!=='activo' && t.desde ? ' · '+_infFechaC(t.desde) : '')]; }) } });
      return;
    }
    if(k==='hhanio'){
      var Aa=D.hhA;
      B.push({ t:{ cols:[['Mes', 1864, 'izq'], ['HHT obreros', 1100, 'der'], ['HHT staff', 1000, 'der'], ['HHT', 1000, 'der'], ['HHC', 900, 'der'], ['HHC / HHT', 1000, 'der'], ['HHT acumuladas', 1500, 'der'], ['HHC acumuladas', 1500, 'der']],
        filas:Aa.M.map(function(q){ return [cap(_infMesN(q.m)), _infNum(q.obHHT), _infNum(q.stHHT), _infNum(q.hht), _infDec(q.hhc), _infPct(q.hhc, q.hht), _infNum(q.acHHT), _infDec(q.acHHC)]; })
          .concat([tot(['Total del año', _infNum(Aa.acum.obHHT), _infNum(Aa.acum.stHHT), _infNum(Aa.acum.hht), _infDec(Aa.acum.hhc), _infPct(Aa.acum.hhc, Aa.acum.hht), '', ''])]) } });
      return;
    }
    if(k==='programas'){
      var Pg=D.prog;
      if(!Pg || !Pg.hay){ B.push({ p:Pg===null ? 'No se pudieron leer los programas del año.' : 'La obra todavía no tiene sus programas del año en OBRASST: se arman en «Programas del año» (la web).', gris:1 }); return; }
      B.push({ p:'Cumplimiento de todos los programas hasta '+mesN+': '+(Pg.tot.pct==null ? '—' : Pg.tot.pct+' %')+' ('+Pg.tot.e+' de '+Pg.tot.p+' actividades).' });
      B.push({ t:{ cols:[['Programa', 3664, 'izq'], ['Programadas al mes', 1400, 'der'], ['Ejecutadas', 1200, 'der'], ['Cumplimiento', 1300, 'der'], ['En el año', 1100, 'der'], ['Sin cumplir', 1200, 'der']],
        filas:Pg.L.map(function(R){ return [R.n, R.p, R.e, R.pct==null ? '—' : R.pct+' %', R.pAnio, R.atras]; }) } });
      var F=[], cerrado=(D.dia===_infMesFin(D.mes) && D.dia<hoyISO());
      Pg.L.forEach(function(R){ if(!R.delMes.length) return; F.push({ g:R.n }); R.delMes.forEach(function(a){ F.push([a.n, a.resp || '—', a.e ? 'Cumplida' : (cerrado ? 'No se cumplió' : 'Pendiente')]); }); });
      B.push({ h:'Lo programado para '+mesN, nivel:2 }, { t:{ cols:[['Actividad', 5664, 'izq'], ['Responsable', 2400, 'izq'], ['Estado', 1800, 'izq']], filas:F, vacio:'Nada programado para este mes.' } });
      return;
    }
    if(k==='objetivos'){
      var Pq=D.prog;
      if(!Pq || !Pq.obj.length){ B.push({ p:!Pq ? 'No se pudieron leer los objetivos del año.' : 'La obra todavía no tiene sus objetivos y metas del año: se arman en «Objetivos y metas» (la web).', gris:1 }); return; }
      B.push({ t:{ cols:[['Objetivo', 3300, 'izq'], ['Meta', 2500, 'izq'], ['Indicador', 2564, 'izq'], ['Avance', 1500, 'der']], arriba:true, filas:Pq.obj.map(function(o){ return [o.obj, o.meta || '—', o.ind || '—', o.R ? (o.R.pct==null ? 'Aún nada' : o.R.pct+' %') : 'Se mide a mano']; }) } });
      return;
    }
    if(k==='charlas'){
      var Ch=D.ch;
      cifras([['Charlas y capacitaciones', Ch.tot.veces, Ch.tot.qr+' con QR · '+Ch.tot.reg+' registradas'], ['Personas', _infNum(Ch.tot.asis), Ch.tot.o+' obreros · '+Ch.tot.s+' staff'], ['Duración', _infMin(Ch.tot.min), ''], ['Horas hombre de capacitación', _infDec(Ch.tot.hhc), '']]);
      B.push({ h:desglose ? 'Los temas del mes, uno por uno' : 'Los temas del mes, por tipo de charla', nivel:2 });
      if(!Ch.L.length) B.push({ p:'Ninguna charla registrada este mes.', gris:1 }); else B.push({ t:{ cols:_infColsTemas(desglose), filas:_infFilasTemas(Ch, desglose) } });
      return;
    }
    if(k==='capacitacion'){
      cifras([['Evaluaciones del mes', D.cap.n, 'constancias'], ['Aprobadas', D.cap.ok, D.cap.n ? Math.round(D.cap.ok*100/D.cap.n)+' %' : '']]);
      B.push({ t:{ cols:[['Tema', 7864, 'izq'], ['Evaluaciones', 2000, 'der']], filas:D.cap.temas.map(function(t){ return [t[0], t[1]]; }) } });
      return;
    }
    if(k==='ats'){
      var At=D.ats;
      cifras([['ATS del mes', At.n, ''], ['Cerrados', At.cerrados, At.n ? Math.round(At.cerrados*100/At.n)+' %' : ''], ['Sin cierre', At.sinCierre, 'falta la firma de salida o la foto']]);
      B.push({ t:{ cols:[['Estado', 7864, 'izq'], ['ATS', 2000, 'der']], filas:INF_ATS_EST.filter(function(e){ return At.c[e[0]]; }).map(function(e){ return [e[1], At.c[e[0]]]; }) } });
      var sinC=At.L.filter(function(a){ return a.est==='porcerrar'; });
      if(sinC.length) B.push({ h:'Los que quedaron sin cierre', nivel:2 }, { t:{ cols:[['Fecha', 1400, 'izq'], ['Trabajo', 5464, 'izq'], ['Lugar', 3000, 'izq']], filas:sinC.map(function(a){ return [_infFechaC(a.f), a.t, a.lugar || '—']; }) } });
      return;
    }
    if(k==='reportes'){
      var O=D.obs;
      cifras([['Actos', O.tot.acto, 'subestándares'], ['Condiciones', O.tot.condicion, 'subestándares'], ['Sugerencias', O.tot.sug, O.buzon ? O.buzon+' del buzón' : ''], ['Buenas prácticas', O.tot.buena, ''],
              ['Levantadas', O.lev.cerr+' de '+O.lev.n, O.lev.pct==null ? '' : O.lev.pct+' %'], ['Fuera de plazo', O.lev.venc, '']]);
      B.push({ h:'De dónde salieron', nivel:2 }, { t:{ cols:[['Origen', 3864, 'izq'], ['Actos', 1000, 'der'], ['Condiciones', 1300, 'der'], ['Sugerencias', 1300, 'der'], ['Buenas prácticas', 1400, 'der'], ['Total', 1000, 'der']],
        filas:O.porOrigen.map(function(o){ return [_infOrigenN(o.k), o.acto, o.condicion, o.sug, o.buena, o.acto+o.condicion+o.sug+o.buena]; }).concat([tot(['Total', O.tot.acto, O.tot.condicion, O.tot.sug, O.tot.buena, O.tot.acto+O.tot.condicion+O.tot.sug+O.tot.buena])]) } });
      var Fc=[]; [['acto', 'Actos'], ['condicion', 'Condiciones']].forEach(function(q){ if(O.porCat[q[0]].length){ Fc.push({ g:q[1] }); O.porCat[q[0]].forEach(function(c){ Fc.push([c[0], c[1]]); }); } });
      if(Fc.length) B.push({ h:'Por categoría', nivel:2 }, { t:{ cols:[['Categoría', 7864, 'izq'], ['Observaciones', 2000, 'der']], filas:Fc } });
      if(O.porEmp.length) B.push({ h:'Por empresa observada', nivel:2 }, { t:{ cols:[['Empresa', 4364, 'izq'], ['Actos', 1100, 'der'], ['Condiciones', 1400, 'der'], ['Levantadas', 1400, 'der'], ['% levantado', 1600, 'der']],
        filas:O.porEmp.map(function(e){ return [e.n, e.acto, e.condicion, e.cerr, _infPct(e.cerr, e.acto+e.condicion)]; }) } });
      return;
    }
    if(k==='bird'){
      var Bd=D.bird;
      B.push({ t:{ cols:[['Nivel de la pirámide', 5064, 'izq'], ['Del mes', 1500, 'der'], ['En el año', 1500, 'der'], ['Bird', 1800, 'der']], filas:INF_BIRD.map(function(n, i){ return [n.n, Bd.mes[i], Bd.anio[i], n.bird || '—']; }) } });
      B.push({ p:'La pirámide de Bird (1969): por cada lesión grave hubo, en promedio, 10 lesiones leves, 30 daños a la propiedad y 600 incidentes sin lesión ni daño. La base son los actos y las condiciones subestándares observados.', gris:1 });
      return;
    }
    if(k==='inspecciones'){
      B.push({ t:{ cols:[['Tipo', 7864, 'izq'], ['Del mes', 2000, 'der']], filas:D.insp.tipos.map(function(t){ return [t[0], t[1]]; }) } });
      var Oi=D.obs && D.obs.insp;
      if(Oi && Oi.n) B.push({ h:'Lo que encontraron, por tipo', nivel:2 }, { t:{ cols:[['Actos', 1900, 'der'], ['Condiciones', 2000, 'der'], ['Sugerencias', 2000, 'der'], ['Buenas prácticas', 2064, 'der'], ['Total', 1900, 'der']], filas:[[Oi.acto, Oi.condicion, Oi.sug, Oi.buena, Oi.n]] } });
      return;
    }
    if(k==='epp'){
      var Cs=D.epp.cons;
      cifras([['Entregas del mes', D.epp.entregas, 'con la firma de quien recibe'], ['Unidades', D.epp.und, 'entregadas']]);
      if(Cs && Cs.L.length) B.push({ t:{ cols:[['EPP', 3864, 'izq'], ['Unidades', 1200, 'der'], ['Nuevas', 1200, 'der'], ['Cambio', 1200, 'der'], ['Pérdida', 1200, 'der'], ['Trabajadores', 1200, 'der']], filas:Cs.L.map(function(t){ return [t.n, t.und, t.N, t.C, t.P, t.trab]; }) } });
      return;
    }
    if(k==='sctr'){
      if(!D.sctr){ B.push({ p:'No se pudo leer el SCTR de la obra.', gris:1 }); return; }
      var Rs=D.sctr.R;
      cifras([['Cubiertos', Rs.ok.length+' de '+Rs.activos, 'salud y pensión'], ['Les falta algo', Rs.falta.length+Rs.sinDoc.length, 'sin SCTR o con una sola cobertura'], ['Constancias vigentes', D.sctr.vig.length, '']]);
      if(Rs.falta.length+Rs.sinDoc.length) B.push({ t:{ cols:[['Trabajador', 4864, 'izq'], [docPersonaP(), 2000, 'izq'], ['Qué le falta', 3000, 'izq']],
        filas:Rs.falta.map(function(f){ return [f.t.nombre||'', f.t.dni||'', SCTR_ESTADO_N[f.e]||'']; }).concat(Rs.sinDoc.map(function(t){ return [t.nombre||'', '—', SCTR_ESTADO_N.sin_doc]; })) } });
      return;
    }
    if(k==='comite'){
      var Cm=D.com;
      if(!Cm){ B.push({ p:'No hay un comité registrado en esta obra, o no se pudo leer.', gris:1 }); return; }
      B.push({ t:{ cols:[['N.º', 900, 'izq'], ['Fecha', 2000, 'izq'], ['Tipo', 2400, 'izq'], ['Asistencia', 4564, 'izq']], filas:Cm.actas.map(function(a){ var as=(a.asistentes||[]).length; return [a.n||'—', fechaLarga(a.fecha)||a.fecha, INF_COM_TIPO[a.tipo]||'Reunión', a.subida ? 'Acta escaneada' : as+' de '+Cm.tit]; }), vacio:'Sin reuniones este mes.' } });
      if(Cm.acuMes.length) B.push({ h:'Los acuerdos del mes', nivel:2 }, { t:{ cols:[['Acuerdo', 4864, 'izq'], ['Responsable', 2000, 'izq'], ['Plazo', 1500, 'izq'], ['Estado', 1500, 'izq']], filas:Cm.acuMes.map(function(a){ return [a.t, a.quien||'—', a.plazo ? (fechaLarga(a.plazo)||a.plazo) : 'sin plazo', a.hecho ? 'Cumplido' : 'Pendiente']; }) } });
      return;
    }
    if(k==='riesgo'){
      var R=D.riesgo;
      if(!R || !R.listo){ B.push({ p:'El riesgo del mes no se pudo calcular con lo registrado.', gris:1 }); return; }
      B.push({ p:'Probabilidad de al menos un accidente con descanso médico en los 30 días siguientes al '+fechaLarga(D.dia)+': '+riesgoPct(R.p)+' (entre '+riesgoPct(R.plo)+' y '+riesgoPct(R.phi)+'). En 3 meses: '+riesgoPct(R.p3)+'; en un año: '+riesgoPct(R.p12)+', si nada cambia.' });
      return;
    }
    if(k==='fotoreg' || k==='fotos'){
      var G=[];
      if(k==='fotoreg' && D.freg) D.freg.L.concat(D.freg.del.filter(function(f){ return !D.freg.L.some(function(c){ return c.k===f.d.cat; }); }).map(function(f){ return fotoCatDe(D.freg.L, f.d.cat); })).forEach(function(c){
        if(G.some(function(g){ return g.k===c.k; })) return;
        var fs=D.freg.del.filter(function(f){ return f.d.cat===c.k && f.img && f.img.u8; }); if(fs.length) G.push({ k:c.k, n:c.n, L:fs.map(function(f){ return { img:f.img, t:f.d.desc || c.n, s:_infFechaC(f.d.fecha)+(f.d.frente ? ' · '+f.d.frente : '') }; }) });
      });
      if(k==='fotos' && D.fotos) G.push({ k:'p', n:'', L:D.fotos.L.filter(function(f){ return f.img && f.img.u8; }).map(function(f){ return { img:f.img, t:f.tit, s:f.sub }; }) });
      if(!G.length){ B.push({ p:'Sin fotos este mes.', gris:1 }); return; }
      G.forEach(function(g){
        if(g.n) B.push({ h:g.n, nivel:2 });
        var F2=[];
        for(var i=0;i<g.L.length;i+=2){ var a=g.L[i], b=g.L[i+1]; F2.push([{ img:a.img }, b ? { img:b.img } : '']); F2.push([a.t+' · '+a.s, b ? b.t+' · '+b.s : '']); }
        B.push({ t:{ cols:[['', 4932, 'izq'], ['', 4932, 'izq']], filas:F2 } });
      });
      return;
    }
  });
  return _infDocx2('Informe de seguridad y salud en el trabajo · '+_infMesMay(D.mes), [empresaDeObraP()||'', nombreObraP()||''].filter(Boolean).join(' · '), B);
}
/* documentos separados: cada parte en su PDF (cada una en su hoja), los anexos tal cual, el Excel y el Word de los temas, en un ZIP */
function _infSeparados(D){
  var PL=window.PDFLib;
  var base=_infPdfBase(D, { separado:true }), out=[], cad=Promise.resolve();
  var nom=function(s){ return String(s).replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80); };
  return PL.PDFDocument.load(base.bytes).then(function(todo){
    var n=todo.getPageCount(), cortes=[{ t:'Portada e índice', p:1 }].concat(base.indice);
    cortes.forEach(function(c, i){
      var desde=c.p, hasta=(i+1<cortes.length ? cortes[i+1].p : n+1)-1; if(hasta<desde) return;
      cad=cad.then(function(){
        return PL.PDFDocument.create().then(function(d){
          var idx=[]; for(var q=desde-1;q<hasta;q++) idx.push(q);
          return d.copyPages(todo, idx).then(function(pags){ pags.forEach(function(p){ d.addPage(p); }); return d.save(); });
        }).then(function(b){ out.push({ n:dos(out.length)+' '+nom(c.t)+'.pdf', b:new Uint8Array(b) }); });
      });
    });
    /* los anexos: las actas del comité y los archivos elegidos, tal cual */
    var Cm=INFW.secc.some(function(x){ return x.k==='comite' && _infVa(x); }) ? D.com : null, an=0;
    var bajar=function(url){ return fetch(url).then(function(r){ if(!r.ok) throw r.status; return r.arrayBuffer(); }); };
    (Cm ? Cm.actas : []).forEach(function(a){
      cad=cad.then(function(){
        var p=a.subida ? (a.url ? bajar(a.url) : Promise.reject('sin_archivo')) : cargarMasApp().then(function(){ return masCtx({ com:Cm.doc }); }).then(function(Cx){ var R=MAS_APP.usar(Cx).comiteActaPdf(a.id); if(!R || !R.blob) throw 'sin_acta'; return R.blob.arrayBuffer(); });
        return p.then(function(b){ an++; out.push({ n:'Anexo '+dos(an)+' '+nom('Acta del comité N° '+(a.n||'—'))+'.pdf', b:new Uint8Array(b) }); }, function(){});
      });
    });
    if(INFW.secc.some(function(x){ return x.k==='anexos' && x.on; })) INFW.anexos.forEach(function(a){
      cad=cad.then(function(){ return bajar(a.url).then(function(b){ var u8=new Uint8Array(b), ext=(u8[0]===0x25 && u8[1]===0x50) ? 'pdf' : ((u8[0]===0x89) ? 'png' : 'jpg'); an++; out.push({ n:'Anexo '+dos(an)+' '+nom(a.nombre).replace(/\.(pdf|jpe?g|png|webp)$/i, '')+'.'+ext, b:u8 }); }, function(){}); });
    });
    return cad.then(function(){
      var lee=function(bl){ return bl.arrayBuffer().then(function(b){ return new Uint8Array(b); }); };
      return Promise.all([lee(_infExcel(D)), lee(_infWord(D))]).then(function(x){
        out.push({ n:'Datos del informe.xlsx', b:x[0] }, { n:'Temas del mes.docx', b:x[1] });
        return _infZip(out, 'application/zip');
      });
    });
  });
}

/* ═══ 19/10/2026 · LOTE 20 · EL INFORME DE MEDIO AMBIENTE DEL MES ═══════════════════════════════════════════════════════
   Aparte del de SST: los residuos (con su certificado o su boleta; lo vendido, con su comprobante), el agua en m³, el
   combustible con sus boletas de carga, las charlas de temas ambientales con su HHC, la HHT del mes, las inspecciones y
   las observaciones de medio ambiente, y los certificados y constancias. Los papeles del mes van solos en los anexos. */
var INF_SECC_AMB = [
  { k:'portada',   n:'Portada e índice',                d:'La obra, la empresa, el mes, para quién es y lo que trae', fijo:'primero' },
  { k:'aresumen',  n:'Resumen ambiental del mes',       d:'Los residuos, el agua, el combustible y las charlas ambientales del mes y del año, con la HHT y los indicadores por cada 1 000 HHT' },
  { k:'aresiduos', n:'Residuos',                        d:'Lo que salió de la obra por tipo —generales, papel y cartón, concreto, metal…—, qué se hizo (disposición, reciclaje o venta) y sus papeles' },
  { k:'aagua',     n:'Agua',                            d:'Los m³ del mes y de cada mes del año, con sus recibos o lecturas' },
  { k:'acomb',     n:'Combustible',                     d:'Las cargas del mes por tipo y por equipo, con sus boletas, y los galones de cada mes del año' },
  { k:'acharlas',  n:'Charlas y capacitaciones ambientales', d:'Los temas de medio ambiente del mes, con sus personas, su duración y su HHC' },
  { k:'ainsp',     n:'Inspecciones de medio ambiente',  d:'Las del mes y lo que encontraron' },
  { k:'aobs',      n:'Observaciones de medio ambiente', d:'Los actos y las condiciones ambientales del mes, con su levantamiento' },
  { k:'adocs',     n:'Certificados y constancias',      d:'Los documentos ambientales del mes' },
  { k:'afotos',    n:'Registro fotográfico ambiental',  d:'Las fotos del mes de los temas de medio ambiente: segregación y acopio de residuos, control de polvo, kit antiderrames…' },
  { k:'aanexos',   n:'Anexos: los papeles del mes',     d:'Los certificados, las boletas, los comprobantes y los recibos registrados en el mes, tal cual', fijo:'ultimo' }
];
function _infSeccAmbN(k){ for(var i=0;i<INF_SECC_AMB.length;i++) if(INF_SECC_AMB[i].k===k) return INF_SECC_AMB[i]; return null; }
var INF_INSP_AMB = /(ambient|residu|derrame|aceite|combustib|vertim|acopio|reciclaj|segregaci|emision|ruido ambiental|agua|eco)/;
/* lo ambiental del mes, de lo que ya trajo _infTraer */
function _infAmb(D, filas, mapa){
  var mes=D.mes, anio=D.anio, mi=+mes.slice(5, 7), L=ambFilas(filas||[]), del=ambDelMes(L, mes);
  var A={ L:del, R:ambResumen(del), meses:[] };
  for(var m=1;m<=mi;m++){ var mm=anio+'-'+dos(m), q=ambResumen(ambDelMes(L, mm)), kg=0; Object.keys(q.res).forEach(function(k){ kg+=q.res[k].kg; }); A.meses.push({ m:mm, agua:q.agua, gal:q.combGal, kg:kg }); }
  A.anio={ agua:0, gal:0, kg:0 }; A.meses.forEach(function(q){ A.anio.agua+=q.agua; A.anio.gal+=q.gal; A.anio.kg+=q.kg; });
  var kgM=0, m3M=0; Object.keys(A.R.res).forEach(function(k){ kgM+=A.R.res[k].kg; m3M+=A.R.res[k].m3; }); A.kg=kgM; A.m3=m3M;
  /* las charlas de temas ambientales (lo marcado al registrarla manda; si no, el tema) */
  A.ch=(D.ch.S||[]).filter(function(x){ return x.amb===true || (x.amb!==false && ambTemaEs(x.tema, mapa)); });
  A.chTot={ veces:A.ch.length, asis:0, min:0, hhc:0 }; A.ch.forEach(function(x){ A.chTot.asis+=x.n; A.chTot.min+=x.min; A.chTot.hhc+=x.hhc; });
  /* las inspecciones de medio ambiente: por su tipo, o porque lo que encontraron es ambiental */
  var obsAmb=((D.obs && D.obs.L) || []).filter(function(x){ return x.amb; });
  A.insp=(D._insp||[]).filter(function(i){ return mesDe(i.fecha)===mes && (INF_INSP_AMB.test(ambTemaClave(i.tipo)) || obsAmb.some(function(o){ return o.fuente==='insp' && o.k.indexOf('i:'+i.id+':')===0; })); })
    .map(function(i){ return { f:String(i.fecha).slice(0, 10), tipo:i.tipo || 'Inspección', insp:i.inspector || '', n:obsDeInspP(i).length }; });
  A.obs=obsAmb;
  A.docs=del.filter(function(x){ return x.d.k==='doc'; });
  /* los papeles del mes, para los anexos */
  A.papeles=[]; del.forEach(function(x){ x.d.ev.forEach(function(e){ A.papeles.push({ nombre:(AMB_EV_N[e.t] || 'Papel')+' · '+_ambLineaW(x.d)+' ('+_infFechaC(x.d.fecha)+')', url:e.u }); }); });
  return A;
}
function _ambLineaW(d){
  if(d.k==='res') return ambNombre(AMB_RES_TIPOS, d.tipo)+(d.cant!=null ? ' '+_infDec2(d.cant, d.cant%1 ? 2 : 0)+' '+ambNombre(AMB_UNID, d.und) : '');
  if(d.k==='agua') return 'Agua '+(d.m3!=null ? _infDec2(d.m3, d.m3%1 ? 2 : 0)+' m³' : '');
  if(d.k==='comb') return ambNombre(AMB_COMB, d.tipo)+(d.cant!=null ? ' '+_infDec2(d.cant, d.cant%1 ? 2 : 0)+' '+d.und : '')+(d.equipo ? ' · '+d.equipo : '');
  return ambNombre(AMB_DOC_TIPOS, d.tipo)+(d.nombre ? ' · '+d.nombre : '');
}
function _ambPapeles(d, t){ return d.ev.some(function(e){ return e.t===t; }); }
function _ambPdf(D){
  var A=D.amb, obra=nombreObraP()||'Obra', emp=empresaDeObraP()||'', mesN=_infMesN(D.mes), indice=[], n2=function(n){ return _infDec2(n, (n%1) ? 2 : 0); };
  var P=_infDocNuevo(obra, 'Informe de medio ambiente · '+mesN), doc=P.doc, W=P.W, M=P.M, cap=function(s){ s=String(s||''); return s.charAt(0).toUpperCase()+s.slice(1); };
  INFW._yIndice=0; P.compacto=true;
  var X=A.meses.map(function(q){ return cap(INF_MESES[+q.m.slice(5, 7)-1].slice(0, 3)); }), por1000=function(v){ return D.hh.hht ? _infDec2(v*1000/D.hh.hht, 2) : '—'; };
  (INFW.seccA||[]).filter(function(x){ return x.on; }).forEach(function(x){
    var s=_infSeccAmbN(x.k); if(!s || x.k==='aanexos') return;
    if(x.k==='portada'){
      P.portada('INFORME DE MEDIO AMBIENTE', obra, emp, [['Para', _infParaTxt()], ['Elaborado por', String(INFW.por||'').trim() || '—'], ['Emitido', fechaLarga(hoyISO())], ['Código de la obra', (YO.obra||{}).codigo||'—']]);
      return;
    }
    P.sec(s.n); indice.push({ t:s.n, p:doc.getNumberOfPages() });
    if(x.k==='aresumen'){
      P.cifras([['Residuos del mes', n2(A.kg)+' kg', A.m3 ? n2(A.m3)+' m³ · '+A.R.resN+' salidas' : A.R.resN+(A.R.resN===1 ? ' salida' : ' salidas')], ['Agua', n2(A.R.agua)+' m³', 'en el mes'],
                ['Combustible', n2(A.R.combGal)+' gal', A.R.combN+(A.R.combN===1 ? ' carga' : ' cargas')], ['HHC ambientales', _infDec(A.chTot.hhc), A.chTot.veces+(A.chTot.veces===1 ? ' charla' : ' charlas')]]);
      P.cifras([['HHT del mes', _infNum(D.hh.hht), D.hh.dias+' días'], ['HHT del año', _infNum(D.hhA.acum.hht), 'hasta '+mesN], ['Observaciones ambientales', A.obs.length, A.obs.filter(function(o){ return o.cerr; }).length+' levantadas'], ['Papeles que faltan', A.R.sinDoc, 'registros sin su documento', A.R.sinDoc ? 'mal' : 'ok']]);
      P.tabla('Los indicadores del mes y del año', ['Indicador', 'Del mes', 'En el año', 'Por cada 1 000 HHT del mes'], [
        ['Residuos (kg)', n2(A.kg), n2(A.anio.kg), por1000(A.kg)], ['Agua (m³)', n2(A.R.agua), n2(A.anio.agua), por1000(A.R.agua)], ['Combustible (gal)', n2(A.R.combGal), n2(A.anio.gal), por1000(A.R.combGal)],
        ['Horas hombre de capacitación ambiental', _infDec(A.chTot.hhc), '—', '—']], [W-2*M-300, 90, 90, 120], { num:{ 1:1, 2:1, 3:1 } });
      P.nota('Los residuos en m³ o en unidades no se suman a los kg: van aparte en «Residuos». Las cantidades salen de lo registrado en «Medio ambiente» (la app o la web).');
      return;
    }
    if(x.k==='aresiduos'){
      var Rr=A.R.res, tipos=AMB_RES_TIPOS.filter(function(t){ return Rr[t[0]]; });
      if(!tipos.length){ P.nota('No se registraron residuos en el mes: se registran en «Medio ambiente», con su certificado o su boleta.'); return; }
      P.barras('Lo que salió, por tipo (kg)', tipos.filter(function(t){ return Rr[t[0]].kg>0; }).map(function(t){ return { n:t[1], v:Rr[t[0]].kg }; }), function(v){ return n2(v)+' kg'; });
      P.tabla('Por tipo', ['Residuo', 'kg', 'm³', 'Unidades', 'Salidas', 'Vendido'], tipos.map(function(t){ var q=Rr[t[0]]; return [t[1], n2(q.kg), q.m3 ? n2(q.m3) : '—', q.und ? n2(q.und) : '—', q.n, q.venta ? q.venta+(q.venta===1 ? ' vez' : ' veces') : '—']; }),
        [W-2*M-300, 60, 50, 60, 50, 80], { num:{ 1:1, 2:1, 3:1, 4:1 } });
      P.tablaW('Cada salida, con sus papeles', ['Fecha', 'Residuo', 'Cantidad', 'Qué se hizo', 'Empresa', 'Papeles'], A.L.filter(function(r){ return r.d.k==='res'; }).map(function(r){ var d=r.d;
        var pp=[_ambPapeles(d, 'cert') ? 'certificado' : '', _ambPapeles(d, 'boleta') ? 'boleta' : '', d.dest==='venta' ? (_ambPapeles(d, 'pago') ? 'comprobante' : 'falta el comprobante') : ''].filter(Boolean);
        return [_infFechaC(d.fecha), ambNombre(AMB_RES_TIPOS, d.tipo), d.cant!=null ? n2(d.cant)+' '+ambNombre(AMB_UNID, d.und) : '—', ambNombre(AMB_RES_DEST, d.dest)+(d.dest==='venta' && d.monto ? ' · S/ '+_infDec2(d.monto, 2) : ''), d.emp || '—', pp.length ? pp.join(', ') : 'sin papeles']; }),
        [58, 96, 64, 96, W-2*M-424, 110], { tam:7.6 });
      if(A.R.venta) P.nota('Vendido en el mes: '+A.R.venta+(A.R.venta===1 ? ' vez' : ' veces')+(A.R.monto ? ', por S/ '+_infDec2(A.R.monto, 2) : '')+'. Cada venta va con su certificado y su comprobante de pago (en los anexos).');
      return;
    }
    if(x.k==='aagua'){
      P.columnas('Agua consumida, mes a mes (m³)', X, [{ n:'Agua', v:A.meses.map(function(q){ return q.agua; }), c:INF_COL.azul2 }], function(v){ return n2(v); }, { valores:true, alto:110 });
      P.tabla('Los registros del mes', ['Fecha', 'm³', 'De dónde', 'Recibo o lectura'], A.L.filter(function(r){ return r.d.k==='agua'; }).map(function(r){ var d=r.d; return [_infFechaC(d.fecha), d.m3!=null ? n2(d.m3) : '—', ambNombre(AMB_AGUA, d.fuente), _ambPapeles(d, 'recibo') || d.ev.length ? 'en los anexos' : 'sin papel']; }),
        [70, 70, W-2*M-290, 150], { num:{ 1:1 }, vacio:'No se registró agua en el mes.' });
      P.nota('En el año: '+n2(A.anio.agua)+' m³'+(D.hh.hht ? ' · en el mes, '+por1000(A.R.agua)+' m³ por cada 1 000 horas hombre trabajadas.' : '.'));
      return;
    }
    if(x.k==='acomb'){
      P.columnas('Combustible, mes a mes (galones)', X, [{ n:'Galones', v:A.meses.map(function(q){ return q.gal; }), c:INF_COL.tinta }], function(v){ return n2(v); }, { valores:true, alto:110 });
      var porT=AMB_COMB.filter(function(t){ return A.R.comb[t[0]]; });
      if(porT.length) P.tabla('Por tipo', ['Combustible', 'Galones'], porT.map(function(t){ return [t[1], n2(A.R.comb[t[0]])]; }).concat([{ v:['Total', n2(A.R.combGal)], t:'tot' }]), [W-2*M-120, 120], { num:{ 1:1 } });
      var eq={}; A.L.forEach(function(r){ if(r.d.k!=='comb') return; var k=r.d.equipo || 'Sin decir el equipo'; eq[k]=(eq[k]||0)+(r.d.cant||0)/(r.d.und==='L' ? AMB_GAL : 1); });
      var eqL=Object.keys(eq).map(function(k){ return { n:k, v:eq[k] }; }).sort(function(a, b){ return b.v-a.v; });
      if(eqL.length) P.barras('Por equipo o vehículo (galones)', eqL.slice(0, 10), function(v){ return n2(Math.round(v*100)/100)+' gal'; });
      P.tabla('Cada carga', ['Fecha', 'Combustible', 'Cantidad', 'Equipo o vehículo', 'Boleta'], A.L.filter(function(r){ return r.d.k==='comb'; }).map(function(r){ var d=r.d; return [_infFechaC(d.fecha), ambNombre(AMB_COMB, d.tipo), d.cant!=null ? n2(d.cant)+' '+d.und : '—', d.equipo || '—', d.ev.length ? 'en los anexos' : 'sin boleta']; }),
        [62, 80, 70, W-2*M-302, 90], { vacio:'No se registraron cargas en el mes.' });
      return;
    }
    if(x.k==='acharlas'){
      if(!A.ch.length){ P.nota('Ninguna charla de tema ambiental en el mes. El tema de cada charla se marca al registrarla (en la app: «El tema es de… Medio ambiente») o en «Medio ambiente» de la web.'); return; }
      P.cifras([['Charlas y capacitaciones', A.chTot.veces, 'de medio ambiente'], ['Personas', _infNum(A.chTot.asis), ''], ['Duración', _infMin(A.chTot.min), ''], ['HHC ambientales', _infDec(A.chTot.hhc), D.hh.hht ? _infPct(A.chTot.hhc, D.hh.hht)+' de lo trabajado' : '']]);
      P.tabla('Los temas del mes', ['Fecha', 'Tipo', 'Tema', 'Personas', 'Duración', 'HHC'], A.ch.map(function(c){ return [_infFechaC(c.f), c.tipo, c.tema, _infNum(c.n), _infMin(c.min), _infDec(c.hhc)]; })
        .concat([{ v:['', '', 'Total del mes', _infNum(A.chTot.asis), _infMin(A.chTot.min), _infDec(A.chTot.hhc)], t:'tot' }]), [58, 128, W-2*M-340, 50, 56, 48], { num:{ 3:1, 4:1, 5:1 } });
      return;
    }
    if(x.k==='ainsp'){
      P.tabla('Las inspecciones del mes', ['Fecha', 'Inspección', 'Quién', 'Lo que encontró'], A.insp.map(function(i){ return [_infFechaC(i.f), i.tipo, i.insp || '—', i.n ? i.n+(i.n===1 ? ' observación' : ' observaciones') : 'conforme']; }),
        [62, W-2*M-302, 130, 110], { vacio:'Ninguna inspección de medio ambiente en el mes.' });
      return;
    }
    if(x.k==='aobs'){
      if(!A.obs.length){ P.nota('Ninguna observación de medio ambiente en el mes. Una observación es ambiental si su categoría lo es (la lista de la obra) o si se marcó así al clasificarla.'); return; }
      P.cifras([['Observaciones ambientales', A.obs.length, _infActCondTx(A.obs.filter(function(o){ return o.tipo==='acto'; }).length, A.obs.filter(function(o){ return o.tipo==='condicion'; }).length)],
                ['Levantadas', A.obs.filter(function(o){ return o.cerr; }).length, ''], ['Sin levantar', A.obs.filter(function(o){ return !o.cerr; }).length, '', A.obs.some(function(o){ return !o.cerr; }) ? 'mal' : 'ok']]);
      P.tablaW('Cada observación', ['Fecha', 'Tipo', 'Categoría', 'Lo que se vio', 'Empresa observada', 'Levantamiento'], A.obs.map(function(o){ return [_infFechaC(o.f), o.tipo==='acto' ? 'Acto' : (o.tipo==='condicion' ? 'Condición' : obsTipoN(o.tipo)), o.cat || '—', o.desc, o.eo || '—', _infObsCumpl(o, D.dia)]; }),
        [56, 50, 96, W-2*M-376, 86, 88], { tam:7.6 });
      return;
    }
    if(x.k==='adocs'){
      P.tablaW('Los documentos del mes', ['Fecha', 'Qué es', 'Documento', 'Quién lo emite', 'Archivo'], A.docs.map(function(r){ var d=r.d; return [_infFechaC(d.fecha), ambNombre(AMB_DOC_TIPOS, d.tipo), d.nombre || '—', d.emp || '—', d.ev.length ? 'en los anexos' : 'sin archivo']; }),
        [58, 90, W-2*M-338, 110, 80], { vacio:'Ningún certificado ni constancia registrado en el mes.' });
      return;
    }
    /* 20/10/2026 · lote 23 · las fotos de los temas de medio ambiente */
    if(x.k==='afotos'){ _infSecc19(P, D._fregAmb || _infFotosDe(D, 'amb'), 'fotoreg', {}); return; }
  });
  return { doc:doc, bytes:doc.output('arraybuffer'), indice:indice };
}
function _ambExcel(D){
  var X=RCAP.xlsx, S=_infXlsEstilos(X), A=D.amb, obra=nombreObraP()||'Obra', sub=[empresaDeObraP()||'', obra, _infMesMay(D.mes)].filter(Boolean).join(' · '), H=[], h, fr;
  var tx=function(d){ return d.ev.map(function(e){ return AMB_EV_N[e.t]; }).join(', '); };
  h=new X.Hoja('Resumen'); h.activa=true; h.pie='Informe de medio ambiente'; fr=_infXlsCab(h, S, 'Informe de medio ambiente', 3, sub);
  fr=_infXlsTabla(h, S, fr, [['Indicador', 40, 'tx'], ['Del mes', 14, 'd2'], ['En el año', 14, 'd2']], [['Residuos (kg)', A.kg, A.anio.kg], ['Agua (m³)', A.R.agua, A.anio.agua], ['Combustible (gal)', A.R.combGal, A.anio.gal],
    ['Horas hombre de capacitación ambiental', Math.round(A.chTot.hhc*100)/100, ''], ['Horas hombre trabajadas', D.hh.hht, D.hhA.acum.hht]], X);
  H.push(h);
  h=new X.Hoja('Registros'); h.pie='Informe de medio ambiente'; fr=_infXlsCab(h, S, 'Lo registrado en el mes', 8, sub);
  fr=_infXlsTabla(h, S, fr, [['Fecha', 12, 'f'], ['Qué', 14, 'tx'], ['Tipo', 22, 'tx'], ['Cantidad', 12, 'd2'], ['Unidad', 10, 'tx'], ['Qué se hizo / de dónde / equipo', 30, 'tx'], ['Empresa', 26, 'tx'], ['Monto (S/)', 12, 'd2'], ['Papeles', 34, 'tx']],
    A.L.map(function(r){ var d=r.d, q={ res:'Residuo', agua:'Agua', comb:'Combustible', doc:'Documento' }[d.k];
      if(d.k==='res') return [d.fecha, q, ambNombre(AMB_RES_TIPOS, d.tipo), d.cant==null ? '' : d.cant, ambNombre(AMB_UNID, d.und), ambNombre(AMB_RES_DEST, d.dest), d.emp, d.monto==null ? '' : d.monto, tx(d)];
      if(d.k==='agua') return [d.fecha, q, '', d.m3==null ? '' : d.m3, 'm³', ambNombre(AMB_AGUA, d.fuente), '', '', tx(d)];
      if(d.k==='comb') return [d.fecha, q, ambNombre(AMB_COMB, d.tipo), d.cant==null ? '' : d.cant, d.und, d.equipo, d.emp, '', tx(d)];
      return [d.fecha, q, ambNombre(AMB_DOC_TIPOS, d.tipo), '', '', d.nombre, d.emp, '', tx(d)]; }), X);
  H.push(h);
  h=new X.Hoja('Charlas ambientales'); h.pie='Informe de medio ambiente'; fr=_infXlsCab(h, S, 'Las charlas y capacitaciones de medio ambiente', 5, sub);
  fr=_infXlsTabla(h, S, fr, [['Fecha', 12, 'f'], ['Tipo', 28, 'tx'], ['Tema', 46, 'tx'], ['Personas', 10, 'n'], ['Duración (min)', 14, 'n'], ['HHC', 10, 'd']], A.ch.map(function(c){ return [c.f, c.tipo, c.tema, c.n, c.min, Math.round(c.hhc*100)/100]; })
    .concat(A.ch.length ? [{ v:['', '', 'Total', A.chTot.asis, A.chTot.min, Math.round(A.chTot.hhc*100)/100], t:'tot' }] : []), X);
  H.push(h);
  h=new X.Hoja('Mes a mes'); h.pie='Informe de medio ambiente'; fr=_infXlsCab(h, S, 'Residuos, agua y combustible, mes a mes', 3, sub);
  fr=_infXlsTabla(h, S, fr, [['Mes', 18, 'tx'], ['Residuos (kg)', 14, 'd2'], ['Agua (m³)', 12, 'd2'], ['Combustible (gal)', 16, 'd2']], A.meses.map(function(q){ var s=_infMesN(q.m); return [s.charAt(0).toUpperCase()+s.slice(1), q.kg, q.agua, q.gal]; }), X);
  H.push(h);
  return X.libro(H, S.E, 'Informe de medio ambiente · '+obra);
}

/* 20/10/2026 · lote 23 · arriba de cada informe, lo que pide y dónde se completa (antes iba aquí el selector SST / medio
   ambiente: ahora cada informe es su pestaña, y la que el plan no trae sale con su candado) */
function _infTipoHTML(){ return _infPideHTML(); }
function _infTipoAl(caja){ _infPideCargar(); }
function _infPintarAmb(){
  var caja=INFW.caja; if(!caja || !document.body.contains(caja)) return;
  if(!INFW.seccA) INFW.seccA=INF_SECC_AMB.map(function(s){ return { k:s.k, on:true }; });
  var ac=$('acciones'); if(ac){ ac.innerHTML='<button type="button" class="bt" id="inf-armar">Armar el informe ›</button>'; $('inf-armar').onclick=infArmar; }
  var h=_infTipoHTML()+'<p class="inf-intro" id="inf-que">🌱 <b>El informe de medio ambiente del mes.</b> Sale de lo registrado en «Medio ambiente» (la app o la web), de las charlas de temas ambientales, de las inspecciones y de las observaciones de medio ambiente. Los certificados, las boletas, los comprobantes y los recibos del mes van solos en los anexos.</p>';
  h+='<div class="tarj inf-paso"><div class="tarj-cuerpo"><h3><span class="inf-n">1</span> El mes y para quién</h3><div class="inf-campos">'+
    '<div class="campo"><label for="inf-mes">Mes</label><select id="inf-mes">'+_infMeses().map(function(m){ return '<option value="'+m+'"'+(m===INFW.mes ? ' selected' : '')+'>'+esc(_infMesMay(m))+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label>Para</label><div class="inf-para" role="radiogroup" aria-label="Para quién es">'+
      [['gerencia', 'Mi gerencia'], ['cliente', 'Mi cliente']].map(function(o){ return '<button type="button" role="radio" aria-checked="'+(INFW.para===o[0])+'" class="'+(INFW.para===o[0] ? 'on' : '')+'" data-para="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div></div>'+
    '<div class="campo"><label for="inf-para-n">'+(INFW.para==='cliente' ? 'El cliente' : 'La gerencia o quien lo recibe')+' <span class="tenue">· si quieres</span></label><input id="inf-para-n" maxlength="100" value="'+esc(INFW.paraN)+'"></div>'+
    '<div class="campo"><label for="inf-por">Elaborado por</label><input id="inf-por" maxlength="100" value="'+esc(INFW.por)+'"></div></div></div></div>';
  h+='<div class="tarj inf-paso"><div class="tarj-cuerpo"><h3><span class="inf-n">2</span> Lo que va</h3><div id="inf-secc-a">'+INFW.seccA.map(function(x, i){
      var s=_infSeccAmbN(x.k), fijo=!!s.fijo;
      return '<label class="inf-sec'+(x.on ? '' : ' off')+'" data-k="'+esc(x.k)+'"><span class="n">'+(i+1)+'</span><input type="checkbox" data-ona="'+i+'"'+(x.on ? ' checked' : '')+(fijo && x.k==='portada' ? ' disabled' : '')+'> <span class="tx"><b>'+esc(s.n)+'</b><small>'+esc(s.d)+'</small></span></label>';
    }).join('')+'</div></div></div>';
  h+='<div class="inf-armar"><button type="button" class="bt" id="inf-armar2">Armar el informe ›</button><span>Sale en PDF con su portada, su índice y las páginas numeradas, y con el Excel de lo registrado.</span>'+
    '<button type="button" class="bt sec chico" onclick="navegar(\'ambiente\')">Ir a «Medio ambiente»</button></div>';
  caja.innerHTML=h;
  $('inf-mes').onchange=function(){ INFW.mes=this.value; INFW.datos=null; _infPideCargar(); };
  $('inf-para-n').oninput=function(){ INFW.paraN=this.value; };
  $('inf-por').oninput=function(){ INFW.por=this.value; };
  $('inf-armar2').onclick=infArmar;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-para]'), function(b){ b.onclick=function(){ INFW.para=b.getAttribute('data-para'); _infPintar(); }; });
  _infTipoAl(caja);
  $('inf-secc-a').onchange=function(ev){ var c=ev.target; if(c.hasAttribute('data-ona')){ INFW.seccA[+c.getAttribute('data-ona')].on=c.checked; _infPintarAmb(); } };
}
function _infArmarAmb(){
  if(INFW.armando) return;
  INFW.armando=true;
  ['inf-armar', 'inf-armar2'].forEach(function(id){ var b=$(id); if(b){ b.disabled=true; b.textContent='Armando…'; } });
  var fin=function(){ INFW.armando=false; ['inf-armar', 'inf-armar2'].forEach(function(id){ var b=$(id); if(b){ b.disabled=false; b.textContent='Armar el informe ›'; } }); };
  var vaF=INFW.seccA.some(function(x){ return x.k==='afotos' && x.on; });
  Promise.all([_infTraer(INFW.mes, YO.obra, {}), cargarEvPDF(), _infLibPdf()]).then(function(r){
    /* 20/10/2026 · lote 23 · el registro fotográfico ambiental: las fotos de sus temas */
    var Dz=vaF ? _infFotosDe(r[0], 'amb') : null;
    return (Dz ? _infFregTraer(Dz) : Promise.resolve()).then(function(){ r[0]._fregAmb=Dz; return r; });
  }).then(function(r){
    INFW.datos=r[0]; INFW.datosT=null;
    var base=_ambPdf(r[0]), conAnx=INFW.seccA.some(function(x){ return x.k==='aanexos' && x.on; });
    return _infUnir(base.bytes, base.indice, false, { anexos:conAnx ? r[0].amb.papeles : [], sinComite:true, pie:'Informe de medio ambiente' });
  }).then(function(out){ fin(); INFW.pdf=out; _infVer(out); },
    function(e){ fin(); toast('No se pudo armar el informe: '+((e && e.message) || e)); });
}
/* ── verlo antes de bajarlo o guardarlo: el PDF, el Excel y el Word ── */
function _infVer(R){
  try{ if(INFW._url) URL.revokeObjectURL(INFW._url); }catch(e){}
  var todas=!!INFW.datosT, amb=(INFW.tipo==='amb'), sal=(INFW.tipo==='sal'), otro=(amb || sal), blob=new Blob([R.bytes], { type:'application/pdf' }); INFW._url=URL.createObjectURL(blob); INFW._blob=blob;
  var base=nombreArchivo((amb ? 'Informe de medio ambiente - ' : (sal ? 'Informe de salud ocupacional - ' : 'Informe SST - '))+_infMesN(INFW.mes)+' - '+(todas ? (_infEmpresaN() || 'todas las obras')+' - todas las obras' : (nombreObraP()||'obra')));
  var N=_infNivelDe(INFW.nivel);
  var h='<p style="margin:0 0 10px" id="inf-listo">'+(amb ? 'Medio ambiente · ' : (sal ? 'Salud ocupacional · ' : (N ? 'Nivel '+N.n.toLowerCase()+' · ' : 'Personalizado · ')))+R.paginas+' páginas'+(R.anexos ? ' · '+R.anexos+' anexo'+(R.anexos===1 ? '' : 's') : '')+' · '+
    (blob.size>1048576 ? (blob.size/1048576).toFixed(1)+' MB' : Math.max(1, Math.round(blob.size/1024))+' KB')+'</p>'+
    (R.malos.length ? '<div class="aviso ojo" id="inf-malos">No se pudieron sumar: '+esc(R.malos.join(', '))+'. Solo entran PDF y fotos (JPG o PNG).</div>' : '')+
    '<div class="inf-formatos"><button type="button" class="bt sec chico" id="inf-xls">📊 Excel con los datos</button>'+(otro ? '' : '<button type="button" class="bt sec chico" id="inf-doc">📝 Word de los temas del mes</button>')+
      (todas || otro ? '' : '<button type="button" class="bt sec chico" id="inf-word-todo">📄 Todo en un Word</button><button type="button" class="bt sec chico" id="inf-zip">🗂️ Cada parte en su archivo (ZIP)</button>')+'</div>'+
    '<iframe class="inf-vista" id="inf-vista" title="El informe" src="'+esc(INFW._url)+'"></iframe><p class="msg" id="inf-msg" role="status"></p>';
  abrirHoja('El informe de '+_infMesN(INFW.mes), todas ? (_infEmpresaN() || 'Todas las obras') : (nombreObraP()||''), h,
    '<button type="button" class="bt sec" id="inf-volver">‹ Volver a cambiar</button>'+(todas ? '' : '<button type="button" class="bt sec" id="inf-guardar">Guardar en el archivo de la obra</button>')+'<button type="button" class="bt" id="inf-bajar">Descargar el PDF</button>', {ancha:true});
  $('inf-volver').onclick=cerrarHoja;
  $('inf-bajar').onclick=function(){ bajarBlob(blob, base+'.pdf'); };
  $('inf-xls').onclick=function(){ try{ bajarBlob(amb ? _ambExcel(INFW.datos) : (sal ? _salExcel(INFW.datos) : (todas ? _infExcelTodas(INFW.datosT) : _infExcel(INFW.datos))), base+'.xlsx'); }catch(e){ var m=$('inf-msg'); m.className='msg mal'; m.textContent='No se pudo armar el Excel: '+((e && e.message) || e); } };
  if($('inf-doc')) $('inf-doc').onclick=function(){ try{ bajarBlob(todas ? _infWordTodas(INFW.datosT) : _infWord(INFW.datos), nombreArchivo('Temas del mes - '+_infMesN(INFW.mes)+' - '+(todas ? 'todas las obras' : (nombreObraP()||'obra')))+'.docx'); }catch(e){ var m=$('inf-msg'); m.className='msg mal'; m.textContent='No se pudo armar el Word: '+((e && e.message) || e); } };
  if(todas) return;
  /* 19/10/2026 · lote 19 · todo en un Word, o cada parte en su archivo */
  if($('inf-word-todo')) $('inf-word-todo').onclick=function(){ var m=$('inf-msg'); try{ bajarBlob(_infWordTodo(INFW.datos), base+'.docx'); m.className='msg ok'; m.textContent='Listo: el Word trae todas las partes, con sus tablas y sus fotos.'; }catch(e){ m.className='msg mal'; m.textContent='No se pudo armar el Word: '+((e && e.message) || e); } };
  if($('inf-zip')) $('inf-zip').onclick=function(){
    var m=$('inf-msg'), b=this; b.disabled=true; m.className='msg gris'; m.textContent='Armando cada parte en su archivo…';
    _infSeparados(INFW.datos).then(function(z){ b.disabled=false; bajarBlob(z, base+' - por partes.zip'); m.className='msg ok'; m.textContent='Listo: un PDF por parte, los anexos, el Excel y el Word de los temas, en un ZIP.'; },
      function(e){ b.disabled=false; m.className='msg mal'; m.textContent='No se pudo armar: '+((e && e.message) || e); });
  };
  $('inf-guardar').onclick=function(){
    var m=$('inf-msg'), b=this, nom=base+'.pdf';
    if(blob.size>25*1024*1024){ m.className='msg mal'; m.textContent='Pesa más de 25 MB (el tope por archivo de la obra): descárgalo, o quita algún anexo pesado.'; return; }
    b.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
    var f; try{ f=new File([blob], nom, { type:'application/pdf' }); }catch(e){ f=blob; f.name=nom; }
    subirArchivoP('docs', f).then(function(url){
      return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'informe-mes', nombre:(amb ? 'Informe de medio ambiente · ' : (sal ? 'Informe de salud ocupacional · ' : 'Informe SST · '))+_infMesN(INFW.mes), url:url, nota:INFW.mes });
    }).then(function(){ m.className='msg ok'; m.textContent='Guardado en «Documentos», carpeta «Informes del mes».'; }, function(e){ b.disabled=false; m.className='msg mal'; m.textContent=(e===401 || e===403) ? 'Esta cuenta no puede guardar en esta obra.' : 'No se pudo guardar. Revisa tu conexión.'; });
  };
}

/* >>> INFB-INI (lote 23 · se edita aquí; su copia va en portal/informe.js, herr/copias.py la revisa) <<< */
/* ═════════════════════════════════════════════════════════════════
   LO QUE PIDE CADA INFORME DEL MES (20/10/2026 · lote 23)
   Marcelo: «quiero que sea una sección aparte que se llame informe, se
   abra y se tenga de SST, Medio Ambiente y Salud Ocupacional … y esté
   enlazada con la app, pero en la app también tienen que haber esa
   relación de información».
   Una sola lista para los dos lados: la app («Informe del mes») y la web
   (la sección «Informe») dicen lo mismo de cada parte —✓ lista, ! falta,
   – nada que pedir, 🔒 desde otro plan, ↗ en la web— y dónde se carga lo
   que falta, en la app y en la web. Cada lado cuenta lo suyo en el mismo
   resumen S (infbPartes no lee la base):
     S.hh { n, faltan[] } · S.per · S.ch { n, qr } · S.ev · S.ats { n, sin }
     S.rep { n, abiertos, sinFicha } · S.insp · S.epp · S.acc · S.sctr { vig }
     S.com { n } | null · S.foto { cu{}, L[] } (los temas, con amb y sal)
     S.amb { res, resSin, agua, comb, combSin, docs, ch, insp, obs, obsAb }
     S.sal { emo { n, vig, por, venc, sin, mes } | null, desc { n, dias },
             acc { les, pa }, ch, camp, act, pers, mon, fuera, pend, insp,
             obs, obsAb }
   Los textos van en pedazos: los números aparte (no se traducen) y las
   palabras en su frase, para que la app los alcance con su diccionario.
   ═════════════════════════════════════════════════════════════════ */
var INFB_TIPOS = [
  { k:'sst', n:'SST', ic:'🦺', t:'Informe de SST', desde:3 },   /* 22/10/2026 · hoja 2: el informe del mes, desde SSOMA */
  { k:'amb', n:'Medio ambiente', ic:'🌱', t:'Informe de medio ambiente', desde:3 },
  { k:'sal', n:'Salud ocupacional', ic:'🩺', t:'Informe de salud ocupacional', desde:3 }
];
/* los temas del registro fotográfico que el informe pide sí o sí */
var INFB_FOTO_BASE = { sst:['charlas', 'epp', 'emergencia', 'bienestar'], amb:['ambiente'], sal:['salud'] };
var INFB_SEP = { d:'·' };
function infbTipo(k){ for(var i = 0; i < INFB_TIPOS.length; i++) if(INFB_TIPOS[i].k === k) return INFB_TIPOS[i]; return INFB_TIPOS[0]; }
function infbN(n, uno, varios){ return [n, n === 1 ? uno : varios]; }
/* «3 días sin registrar: 12, 13, 19» */
function infbDiasTx(L){
  var d = L.map(function(f){ return String(+String(f).slice(8, 10)); });
  return [d.length, d.length === 1 ? 'día sin registrar:' : 'días sin registrar:', { d:d.slice(0, 5).join(', ') + (d.length > 5 ? ' +' + (d.length - 5) : '') }];
}
/* los temas de fotos de cada informe: el de SST lleva todos; los otros, los suyos */
function infbFotoTemas(tipo, L){
  return (L || []).filter(function(c){ return tipo === 'sst' || (tipo === 'amb' ? !!c.amb : !!c.sal); });
}
function infbFotoParte(tipo, S, k){
  var F = S.foto || { cu:{}, L:[] }, T = infbFotoTemas(tipo, F.L), base = INFB_FOTO_BASE[tipo] || [], n = 0;
  T.forEach(function(c){ n += F.cu[c.k] || 0; });
  var faltan = base.filter(function(q){ return !F.cu[q] && T.some(function(c){ return c.k === q; }); });
  if(!T.length) return { k:k, ic:'📸', n:'Registro fotográfico', est:'nada', tx:['La obra no tiene temas de fotos para este informe'], app:{ bt:'' }, web:{ bt:'Ver los temas', v:'fotoreg' } };
  return { k:k, ic:'📸', n:'Registro fotográfico', est:(faltan.length || !n) ? 'falta' : 'ok', fotos:tipo,
    tx:(n ? infbN(n, 'foto', 'fotos') : ['Ninguna foto']).concat(faltan.length ? [INFB_SEP, 'faltan:', { d:faltan.map(function(q){ return (T.filter(function(c){ return c.k === q; })[0] || {}).n || q; }).join(', ') }] : []),
    app:{ bt:'' }, web:{ bt:'Ver las fotos', v:'fotoreg' } };
}
/* las partes de un informe, con su estado y dónde se completa (app y web) */
function infbPartes(tipo, S, P){
  var L = [];
  if(tipo === 'sst'){
    L.push({ k:'hh', ic:'⏱️', n:'Horas hombre', est:(S.hh.n && !S.hh.faltan.length) ? 'ok' : 'falta',
      tx:!S.hh.n ? ['Ningún día registrado'] : (S.hh.faltan.length ? infbDiasTx(S.hh.faltan) : infbN(S.hh.n, 'día registrado', 'días registrados')),
      app:{ bt:'Registrar', ir:'p-semanal' }, web:{ bt:'Registrar', v:'hh' } });
    L.push({ k:'per', ic:'👷', n:'Personal', est:S.per ? 'ok' : 'falta', tx:S.per ? infbN(S.per, 'activo', 'activos') : ['Registra a tu personal'],
      app:{ bt:'Abrir', ir:'p-trabajadores' }, web:{ bt:'Abrir', v:'personal' } });
    var nch = S.ch.n;
    L.push({ k:'ch', ic:'🗣️', n:'Charlas y capacitaciones', est:nch ? 'ok' : 'falta',
      tx:nch ? infbN(nch, 'registrada', 'registradas').concat(S.ch.qr ? [INFB_SEP, S.ch.qr, 'con QR'] : []) : ['Ninguna este mes'],
      app:{ bt:'Tomar asistencia', ir:'p-asis-nueva' }, web:{ bt:'Registrar', v:'caphechas' } });
    L.push({ k:'ev', ic:'📝', n:'Evaluaciones', est:S.ev ? 'ok' : 'nada', tx:S.ev ? infbN(S.ev, 'evaluación', 'evaluaciones') : ['Ninguna este mes'],
      app:{ bt:'Evaluar', ir:'p-temas' }, web:{ bt:'Abrir', v:'constancias' } });
    L.push({ k:'ats', ic:'📋', n:'ATS', est:(S.ats.n && !S.ats.sin) ? 'ok' : 'falta',
      tx:!S.ats.n ? ['Ninguno este mes'] : (S.ats.sin ? [S.ats.sin, 'sin cierre (firma de salida y foto)'] : infbN(S.ats.n, 'cerrado', 'cerrados')),
      app:{ bt:S.ats.sin ? 'Cerrar' : 'Abrir', ir:'p-ats' }, web:{ bt:'Abrir', v:'ats' } });
    var R = S.rep, tr = !R.n ? ['Ninguna este mes'] : infbN(R.n, 'reportada', 'reportadas');
    if(R.abiertos) tr = tr.concat([INFB_SEP, R.abiertos, 'por levantar']);
    if(R.sinFicha) tr = tr.concat([INFB_SEP, R.sinFicha, 'sin clasificar']);
    L.push({ k:'rep', ic:'🚨', n:'Observaciones de seguridad', est:(R.n && !R.abiertos && !R.sinFicha) ? 'ok' : 'falta', tx:tr,
      app:{ bt:R.sinFicha ? 'Clasificar' : (R.abiertos ? 'Levantar' : 'Abrir'), ir:'p-reporte' }, web:{ bt:R.sinFicha ? 'Clasificar' : 'Abrir', v:'reportes' } });
    L.push({ k:'insp', ic:'✅', n:'Inspecciones', desde:2, est:S.insp ? 'ok' : 'falta', tx:S.insp ? infbN(S.insp, 'inspección', 'inspecciones') : ['Ninguna este mes'],
      app:{ bt:'Inspeccionar', ir:'p-inspec' }, web:{ bt:'Abrir', v:'insp' } });
    L.push({ k:'epp', ic:'🦺', n:'Entregas de EPP', est:S.epp ? 'ok' : 'falta', tx:S.epp ? infbN(S.epp, 'entrega', 'entregas') : ['Ninguna este mes'],
      app:{ bt:'Entregar', ir:'p-kardex' }, web:{ bt:'Abrir', v:'kardex' } });
    L.push({ k:'acc', ic:'🚑', n:'Accidentes e incidentes', est:'nada', tx:S.acc ? infbN(S.acc, 'registrado', 'registrados') : ['Ninguno registrado'],
      app:{ bt:'Abrir', ir:'p-accidentes' }, web:{ bt:'Abrir', v:'acc' } });
    L.push({ k:'sctr', ic:'🛡️', n:'SCTR', est:(S.sctr && S.sctr.vig) ? 'ok' : 'falta', tx:(S.sctr && S.sctr.vig) ? ['Constancia vigente'] : ['Falta la constancia del mes'],
      app:{ bt:'Subir', ir:'p-sctr' }, web:{ bt:'Subir', v:'sctr' } });
    if(S.com) L.push({ k:'com', ic:'🏛️', n:'Comité de SST', est:S.com.n ? 'ok' : 'falta', tx:S.com.n ? infbN(S.com.n, 'reunión', 'reuniones') : ['Sin reunión este mes'],
      app:{ bt:'Abrir', ir:'p-comite' }, web:{ bt:'Abrir', v:'comite' } });
    L.push(infbFotoParte('sst', S, 'foto'));
    L.push({ k:'prog', ic:'📆', n:'Programas y objetivos', est:'web', tx:['Se arman en la web; lo hecho se cuenta solo'],
      app:{ bt:'En la web', fn:'infmProgramasWeb' }, web:{ bt:'Abrir', v:'programas' } });
  }
  if(tipo === 'amb'){
    var A = S.amb || {};
    L.push({ k:'ares', ic:'♻️', n:'Residuos', est:(A.res && !A.resSin) ? 'ok' : 'falta',
      tx:A.res ? infbN(A.res, 'salida', 'salidas').concat(A.resSin ? [INFB_SEP, A.resSin, 'sin su papel'] : []) : ['Ninguna salida este mes'],
      app:{ bt:'Registrar', fn:'abrirAmbiente', arg:'res' }, web:{ bt:'Registrar', v:'ambiente' } });
    L.push({ k:'aagua', ic:'💧', n:'Agua', est:A.agua ? 'ok' : 'falta', tx:A.agua ? infbN(A.agua, 'registro', 'registros') : ['Falta el recibo o la lectura del medidor'],
      app:{ bt:'Registrar', fn:'abrirAmbiente', arg:'agua' }, web:{ bt:'Registrar', v:'ambiente' } });
    L.push({ k:'acomb', ic:'⛽', n:'Combustible', est:A.comb ? (A.combSin ? 'falta' : 'ok') : 'nada',
      tx:A.comb ? infbN(A.comb, 'carga', 'cargas').concat(A.combSin ? [INFB_SEP, A.combSin, 'sin su boleta'] : []) : ['Ninguna carga este mes'],
      app:{ bt:'Registrar', fn:'abrirAmbiente', arg:'comb' }, web:{ bt:'Registrar', v:'ambiente' } });
    L.push({ k:'ach', ic:'🗣️', n:'Charlas ambientales', est:A.ch ? 'ok' : 'falta', tx:A.ch ? infbN(A.ch, 'charla', 'charlas') : ['Ninguna este mes'],
      app:{ bt:'Tomar asistencia', ir:'p-asis-nueva', arg:'amb' }, web:{ bt:'Registrar', v:'caphechas' } });
    L.push({ k:'ainsp', ic:'✅', n:'Inspecciones de medio ambiente', desde:2, est:A.insp ? 'ok' : 'nada', tx:A.insp ? infbN(A.insp, 'inspección', 'inspecciones') : ['Ninguna este mes'],
      app:{ bt:'Inspeccionar', ir:'p-inspec' }, web:{ bt:'Abrir', v:'insp' } });
    L.push({ k:'aobs', ic:'🚨', n:'Observaciones de medio ambiente', est:A.obs ? (A.obsAb ? 'falta' : 'ok') : 'nada',
      tx:A.obs ? infbN(A.obs, 'observación', 'observaciones').concat(A.obsAb ? [INFB_SEP, A.obsAb, 'por levantar'] : []) : ['Ninguna este mes'],
      app:{ bt:A.obsAb ? 'Levantar' : 'Abrir', ir:'p-reporte' }, web:{ bt:'Abrir', v:'reportes' } });
    L.push({ k:'adocs', ic:'📄', n:'Certificados y constancias', est:A.docs ? 'ok' : 'nada', tx:A.docs ? infbN(A.docs, 'documento', 'documentos') : ['Ninguno este mes'],
      app:{ bt:'Subir', fn:'abrirAmbiente', arg:'doc' }, web:{ bt:'Subir', v:'ambiente' } });
    L.push(infbFotoParte('amb', S, 'afoto'));
  }
  if(tipo === 'sal'){
    var Q = S.sal || {}, E = Q.emo, sep = INFB_SEP;
    var emoTx = !E ? ['Los EMO de la obra no se pudieron ver'] : (!E.n ? ['Registra a tu personal'] :
      infbN(E.vig, 'vigente', 'vigentes').concat(E.por ? [sep, E.por, 'por vencer'] : [], E.venc ? [sep, E.venc, E.venc === 1 ? 'vencido' : 'vencidos'] : [], E.sin ? [sep, E.sin, 'sin examen'] : [], E.mes ? [sep, E.mes, 'este mes'] : []));
    L.push({ k:'semo', ic:'🩺', n:'Exámenes médicos (EMO)', est:!E ? 'nada' : ((!E.n || E.venc || E.sin) ? 'falta' : 'ok'), tx:emoTx,
      app:{ bt:'Abrir', ir:'p-emo' }, web:{ bt:'Abrir', v:'emo' } });
    var Dd = Q.desc || { n:0, dias:0 };
    L.push({ k:'sdesc', ic:'🛌', n:'Descanso médico', est:'nada', tx:Dd.n ? infbN(Dd.n, 'trabajador', 'trabajadores').concat([sep, Dd.dias, Dd.dias === 1 ? 'día' : 'días']) : ['Nadie con descanso médico este mes'],
      app:{ bt:'Marcar', ir:'p-trabajadores' }, web:{ bt:'', v:'', app:'En la app: la ficha del trabajador › Cambiar su situación › De descanso' } });
    var Ac = Q.acc || { les:0, pa:0 };
    L.push({ k:'sacc', ic:'🚑', n:'Atenciones por accidente', est:'nada',
      tx:(Ac.les || Ac.pa) ? infbN(Ac.les, 'con lesión', 'con lesión').concat([sep], infbN(Ac.pa, 'de primeros auxilios', 'de primeros auxilios')) : ['Ninguna este mes'],
      app:{ bt:'Abrir', ir:'p-accidentes' }, web:{ bt:'Abrir', v:'acc' } });
    L.push({ k:'sch', ic:'🗣️', n:'Charlas de salud', est:Q.ch ? 'ok' : 'falta', tx:Q.ch ? infbN(Q.ch, 'charla', 'charlas') : ['Ninguna este mes'],
      app:{ bt:'Tomar asistencia', ir:'p-asis-nueva', arg:'sal' }, web:{ bt:'Registrar', v:'caphechas' } });
    var nca = (Q.camp || 0) + (Q.act || 0);
    L.push({ k:'scamp', ic:'📣', n:'Campañas y actividades de salud', est:nca ? 'ok' : 'falta',
      tx:nca ? [].concat(Q.camp ? infbN(Q.camp, 'campaña', 'campañas') : [], (Q.camp && Q.act) ? [sep] : [], Q.act ? infbN(Q.act, 'actividad', 'actividades') : [], Q.pers ? [sep, Q.pers, 'personas'] : []) : ['Ninguna este mes'],
      app:{ bt:'Registrar', fn:'abrirSalud', arg:'act' }, web:{ bt:'Registrar', v:'inf-salud', fn:'salwForm', arg:'act' } });
    L.push({ k:'smon', ic:'🔬', n:'Monitoreo ocupacional', desde:3, est:Q.mon ? ((Q.fuera || Q.pend) ? 'falta' : 'ok') : 'nada',
      tx:Q.mon ? infbN(Q.mon, 'monitoreo', 'monitoreos').concat(Q.fuera ? [sep, Q.fuera, Q.fuera === 1 ? 'supera el límite' : 'superan el límite'] : [], Q.pend ? [sep, Q.pend, 'sin su resultado'] : []) : ['Ninguno este mes: va según su programa'],
      app:{ bt:'Registrar', fn:'abrirSalud', arg:'mon' }, web:{ bt:'Registrar', v:'inf-salud', fn:'salwForm', arg:'mon' } });
    L.push({ k:'sinsp', ic:'✅', n:'Inspecciones de salud e higiene', desde:2, est:Q.insp ? 'ok' : 'nada', tx:Q.insp ? infbN(Q.insp, 'inspección', 'inspecciones') : ['Ninguna este mes'],
      app:{ bt:'Inspeccionar', ir:'p-inspec' }, web:{ bt:'Abrir', v:'insp' } });
    L.push({ k:'sobs', ic:'🚨', n:'Observaciones de salud e higiene', est:Q.obs ? (Q.obsAb ? 'falta' : 'ok') : 'nada',
      tx:Q.obs ? infbN(Q.obs, 'observación', 'observaciones').concat(Q.obsAb ? [sep, Q.obsAb, 'por levantar'] : []) : ['Ninguna este mes'],
      app:{ bt:Q.obsAb ? 'Levantar' : 'Abrir', ir:'p-reporte' }, web:{ bt:'Abrir', v:'reportes' } });
    L.push(infbFotoParte('sal', S, 'sfoto'));
    L.push({ k:'sprog', ic:'📆', n:'Programa de monitoreo', est:'web', tx:['Se arma en la web; lo hecho se cuenta solo'],
      app:{ bt:'En la web', fn:'infmProgramasWeb' }, web:{ bt:'Abrir', v:'programas' } });
  }
  /* lo que el plan no trae: con su candado y desde qué plan (cada lado sabe cómo se llaman sus planes: infbPlanNombre) */
  L.forEach(function(x){ if(x.desde && x.desde > P){ x.est = 'cand'; x.tx = ['Desde el plan ' + (typeof infbPlanNombre === 'function' ? infbPlanNombre(x.desde) : '')]; x.cand = x.desde; } });
  return L;
}
function infbCuenta(L){
  var ok = 0, tot = 0;
  L.forEach(function(x){ if(x.est === 'ok' || x.est === 'falta'){ tot++; if(x.est === 'ok') ok++; } });
  return { ok:ok, tot:tot };
}
var INFB_SIMB = { ok:'✓', falta:'!', nada:'–', cand:'🔒', web:'↗' };
/* lo que el informe arma solo, sin que nadie lo cargue */
var INFB_SOLO = {
  sst:'el resumen, las horas del año, la pirámide de Bird, la tabla de observaciones y el panel con las fotos de tus reportes y buenas prácticas',
  amb:'los indicadores por cada 1 000 horas hombre, el agua y el combustible mes a mes, y los papeles del mes en los anexos',
  sal:'el resumen, los índices de accidentes, las horas de capacitación en salud y los informes de monitoreo en los anexos'
};
/* las inspecciones de medio ambiente, por su tipo (las mismas que cuenta el informe de la web) */
var INFB_INSP_AMB = /(ambient|residu|derrame|aceite|combustib|vertim|acopio|reciclaj|segregaci|emision|ruido ambiental|agua|eco)/;
/* <<< INFB-FIN >>> */

/* ═══ 20/10/2026 · LOTE 23 · LA SECCIÓN «INFORME»: SST, MEDIO AMBIENTE Y SALUD OCUPACIONAL ═══════════════════════════════
   Marcelo: «el informe del mes en la web, mejóralo, quiero que sea una sección aparte que se llame informe, se abra y se
   tenga de SST, Medio Ambiente y Salud Ocupacional, en el cual se pueda realizar el informe y esté enlazada con la app».
   · Tres pestañas (informe · inf-amb · inf-salud) y la del registro fotográfico, en el área «Informe» del portal.
   · Arriba de cada una, lo que pide el informe: la misma lista de la app (INFB), con su estado y dónde se completa aquí.
   · El informe de salud ocupacional: los EMO (fechas y aptitud, sin diagnósticos), el descanso médico (días, sin nombres),
     las atenciones por accidente, las charlas y campañas de salud, las actividades, el monitoreo con sus informes, las
     inspecciones y las observaciones de salud e higiene y sus fotos. Lo que faltaba se registra aquí o en la app
     («Salud ocupacional»: la misma hoja «sal-reg»). */
var INF_VISTA_TIPO = { 'informe':'sst', 'inf-amb':'amb', 'inf-salud':'sal' };
var INF_TIPO_VISTA = { sst:'informe', amb:'inf-amb', sal:'inf-salud' };
/* el nombre del plan, para el candado de las partes (INFB) */
function infbPlanNombre(o){ var P=(typeof planWebPlan==='function') ? planWebPlan(o) : null; return P ? P.n : ''; }
function _infPlanOrden(){ return (YO && YO.central) ? 9 : ((typeof _dcOrdenPlan==='function') ? _dcOrdenPlan() : 9); }
/* de lunes a sábado, hasta ayer (o el mes entero, si ya pasó): los mismos días que pide la app */
function _infDiasLab(ym){
  var hoy=hoyISO(), out=[], y=+ym.slice(0, 4), m=+ym.slice(5, 7), n=new Date(y, m, 0).getDate();
  for(var d=1; d<=n; d++){ var f=ym+'-'+dos(d); if(f>=hoy) break; if(new Date(y, m-1, d).getDay()!==0) out.push(f); }
  return out;
}
/* lo del mes en el resumen S de INFB: lo mismo que cuenta la app, leído de lo que trae el informe */
function _infS(D){
  var dias={}; ((D.hh && D.hh.L) || []).forEach(function(x){ dias[x.f]=1; });
  var obsRep=((D.obs && D.obs.L) || []).filter(function(x){ return x.fuente==='rep'; });
  var A=D.amb || { L:[], R:{}, ch:[], insp:[], obs:[] }, AR=A.R || {}, resSin=0, combSin=0;
  (A.L || []).forEach(function(x){ var d=x.d; if(d.k==='comb' && !d.ev.length) combSin++; if(d.k==='res' && (!d.ev.some(function(e){ return e.t==='cert' || e.t==='boleta'; }) || (d.dest==='venta' && !d.ev.some(function(e){ return e.t==='pago'; })))) resSin++; });
  var Q=D.sal || null, E=Q && Q.emo;
  return {
    hh:{ n:Object.keys(dias).length, faltan:_infDiasLab(D.mes).filter(function(f){ return !dias[f]; }) }, per:D.per ? D.per.act : D.activos,
    ch:{ n:(D.ch && D.ch.tot) ? D.ch.tot.veces : 0, qr:(D.ch && D.ch.tot) ? D.ch.tot.qr : 0 }, ev:(D.cap || {}).n || 0, ats:{ n:D.ats.n, sin:D.ats.sinCierre },
    rep:{ n:D.rep.n, abiertos:D.rep.n-D.rep.cerrados, sinFicha:obsRep.filter(function(x){ return !x.clas; }).length },
    insp:D.insp.n, epp:D.epp.entregas, acc:D.acc.mes+D.acc.inc, sctr:{ vig:!!(D.sctr && D.sctr.vig && D.sctr.vig.length) },
    com:(D.com && D.com.doc && (D.com.doc.miembros || []).length) ? { n:D.com.actas.length } : null,
    foto:{ cu:fotoCatCuenta((D.freg && D.freg.del) || []), L:(D.freg && D.freg.L) || [] },
    amb:{ res:AR.resN || 0, resSin:resSin, agua:AR.aguaN || 0, comb:AR.combN || 0, combSin:combSin, docs:AR.docs || 0, ch:(A.ch || []).length, insp:(A.insp || []).length,
          obs:(A.obs || []).length, obsAb:(A.obs || []).filter(function(o){ return !o.cerr; }).length },
    sal:Q ? { emo:E ? { n:E.n, vig:E.vig, por:E.por, venc:E.venc, sin:E.sin, mes:E.mes } : null, desc:Q.desc, acc:{ les:Q.acc.leve+Q.acc.incap+Q.acc.mortal, pa:Q.acc.pa },
              ch:Q.ch.length, camp:Q.camp.length, act:Q.R.act, pers:Q.R.pers, mon:Q.R.mon, fuera:Q.R.fuera, pend:Q.R.pend, insp:Q.insp.length,
              obs:Q.obs.length, obsAb:Q.obs.filter(function(o){ return !o.cerr; }).length } : null
  };
}
/* ── lo que pide el informe, arriba de cada pestaña ── */
var INF_PIDE = { k:'', D:null, n:0, t:0 };
function _infPideCargando(){ return '<div class="tarj-cuerpo"><p class="tenue" style="margin:0">Revisando lo de '+esc(_infMesN(INFW.mes))+'…</p></div>'; }
function _infPideHTML(){
  if(INFW.tipo==='sst' && INFW.alcance==='todas' && _infTodasPuede()) return '';
  /* en los de medio ambiente y salud, debajo: de qué es cada tema de las charlas del mes */
  return '<div class="tarj inf-pide" id="inf-pide">'+_infPideCargando()+'</div>'+(INFW.tipo!=='sst' ? '<div class="tarj inf-paso" id="inf-temas" hidden></div>' : '');
}
/* lo del mes se vuelve a leer al volver a la pestaña después de un rato (o con ↻): lo registrado en otra sección ya cuenta */
function _infPideCargar(fresco){
  var c=$('inf-pide'); if(!c) return;
  var k=(YO.obra || {}).id+':'+INFW.mes;
  if(!fresco && INF_PIDE.k===k && INF_PIDE.D && Date.now()-INF_PIDE.t<120000){ _infPidePintar(); return; }
  var n=++INF_PIDE.n;
  c.innerHTML=_infPideCargando();
  _infTraer(INFW.mes, YO.obra, {}).then(function(D){ if(n!==INF_PIDE.n) return; INF_PIDE.k=k; INF_PIDE.D=D; INF_PIDE.t=Date.now(); _infPidePintar(); },
    function(){ if(n!==INF_PIDE.n) return; var c2=$('inf-pide'); if(c2) c2.innerHTML='<div class="tarj-cuerpo"><p class="msg mal" style="margin:0">No se pudo revisar lo del mes. Revisa tu conexión y vuelve a abrir la pestaña.</p></div>'; });
}
function _infTx(L){ return (L || []).filter(function(p){ return p!=='' && p!==null && p!==undefined; }).map(function(p){ return (typeof p==='object') ? String(p.d) : String(p); }).join(' '); }
function _infPidePintar(){
  var caja=$('inf-pide'); if(!caja || !INF_PIDE.D) return;
  /* el SCTR es del Perú: en una obra de otro país no se pide */
  var T=infbTipo(INFW.tipo), L=infbPartes(T.k, _infS(INF_PIDE.D), _infPlanOrden()).filter(function(x){ return !(x.k==='sctr' && typeof vistaOcultaPais==='function' && vistaOcultaPais('sctr')); }), K=infbCuenta(L);
  var h='<div class="tarj-cuerpo"><div class="inf-pide-cab"><b>'+K.ok+' de '+K.tot+' listos</b><span class="tenue"> · lo de '+esc(_infMesN(INFW.mes))+': lo mismo que ves en la app, en «Informe del mes»</span>'+
    '<button type="button" class="bt sec chico" id="inf-pide-re" title="Volver a revisar">↻</button></div>'+
    '<span class="inf-pide-barra" aria-hidden="true"><i style="width:'+Math.round(100*K.ok/Math.max(1, K.tot))+'%"></i></span><div class="inf-pide-l">';
  L.forEach(function(x){
    var w=x.web || {}, bt=(x.est==='cand' || !w.bt) ? '' : '<button type="button" class="bt sec chico" data-pide="'+esc(x.k)+'">'+esc(w.bt)+'</button>';
    h+='<div class="inf-pide-f" data-k="'+esc(x.k)+'" data-est="'+x.est+'"><span class="inf-est '+x.est+'" aria-hidden="true">'+INFB_SIMB[x.est]+'</span>'+
      '<span class="tx"><b>'+esc(x.n)+'</b><small>'+esc(_infTx(x.tx))+'</small>'+(w.app ? '<small class="tenue">'+esc(w.app)+'</small>' : '')+'</span>'+bt+'</div>';
  });
  h+='</div><p class="inf-pide-solo">⚙️ <b>Sale solo:</b> '+esc(INFB_SOLO[T.k])+'.</p></div>';
  caja.innerHTML=h;
  caja.onclick=function(ev){
    if(ev.target.closest('#inf-pide-re')){ _infPideCargar(true); return; }
    var b=ev.target.closest('[data-pide]'); if(!b) return;
    var x=L.filter(function(y){ return y.k===b.getAttribute('data-pide'); })[0]; if(x) _infPideIr(x);
  };
  _infTemasPintar(); _salwListaPintar();
}
/* ── de qué es cada tema de las charlas del mes: seguridad, salud ocupacional o medio ambiente (vale para la obra, también
   en la app: la nota de «ats-cfg» lleva temasAmb y temasSal; de entrada lo dicen sus palabras) ── */
function _infTemaDe(tema, D){ return salTemaDe(tema, D.temasAmb, D.temasSal); }
function _infTemasPintar(){
  var c=$('inf-temas'), D=INF_PIDE.D; if(!c || !D) return;
  var T={}, L=[];
  /* sin tema escrito, la charla lleva el nombre de su tipo: esa no se clasifica */
  ((D.ch && D.ch.S) || []).forEach(function(x){ var k=ambTemaClave(x.tema); if(!k || x.tema===x.tipo) return; if(!T[k]){ T[k]={ k:k, tema:x.tema, veces:0 }; L.push(T[k]); } T[k].veces++; });
  if(!L.length){ c.hidden=true; c.innerHTML=''; return; }
  L.sort(function(a, b){ return a.tema.localeCompare(b.tema, 'es'); });
  var ops=[['sst', 'Seguridad'], ['sal', '🩺 Salud ocupacional'], ['amb', '🌱 Medio ambiente']];
  c.hidden=false;
  c.innerHTML='<div class="tarj-cuerpo"><h3>🗣️ Los temas de las charlas de '+esc(_infMesN(INFW.mes))+'</h3><p class="ayuda" style="margin:-4px 0 6px">'+
    (INFW.tipo==='sal' ? 'Los de salud ocupacional salen en este informe' : 'Los de medio ambiente salen en este informe')+' con sus horas hombre de capacitación. De entrada lo dicen sus palabras; si no es así, cámbialo aquí: vale para la obra, también en la app.</p>'+
    L.map(function(t){ var de=_infTemaDe(t.tema, D);
      return '<div class="inf-tema"><span><b>'+esc(t.tema)+'</b> <small class="tenue">· '+t.veces+(t.veces===1 ? ' vez' : ' veces')+'</small></span><div class="chips" role="radiogroup" aria-label="De qué es «'+esc(t.tema)+'»">'+
        ops.map(function(o){ var on=(o[0]===de); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+on+'" data-tema="'+esc(t.k)+'" data-de="'+o[0]+'">'+esc(o[1])+'</button>'; }).join('')+'</div></div>'; }).join('')+
    '<div class="msg" id="inf-temas-msg" role="status"></div></div>';
  c.onclick=function(ev){
    var b=ev.target.closest('[data-tema]'); if(!b || b.classList.contains('on') || c.getAttribute('data-guardando')) return;
    var k=b.getAttribute('data-tema'), de=b.getAttribute('data-de'), t=L.filter(function(q){ return q.k===k; })[0]; if(!t) return;
    var m=$('inf-temas-msg'); m.className='msg gris'; m.textContent='Guardando…'; c.setAttribute('data-guardando', '1');
    _infTemaPonerP(t.tema, de).then(function(n){
      c.removeAttribute('data-guardando');
      D.temasAmb=n.temasAmb || {}; D.temasSal=n.temasSal || {};
      /* lo del mes, otra vez con los temas nuevos (sin volver a leerlo todo) */
      D.amb=_infAmb(D, D._ambRows, D.temasAmb); D.sal=_infSal(D, D._salRows, D._emoL);
      toast('«'+t.tema+'» es de '+(de==='sal' ? 'salud ocupacional' : (de==='amb' ? 'medio ambiente' : 'seguridad'))+'.');
      _infPidePintar();
    }, function(e){ c.removeAttribute('data-guardando'); m.className='msg mal'; m.textContent='No se pudo guardar. '+porQueFallo(e); });
  };
}
/* lo decidido a mano queda para la obra (solo si no es lo que dirían sus palabras), como en la app; el de salud, si no es de medio ambiente */
function _infTemaPonerP(tema, de){
  var k=ambTemaClave(tema); if(!k) return Promise.reject('sin_tema');
  return traer('sst_doc', '&select=id,nombre,nota&hoja=eq.ats-cfg&order=creado.desc', 1).then(function(rows){
    var f=(rows||[])[0], n=(f && nota(f.nota)) || {};
    if(!n || typeof n!=='object' || Array.isArray(n)) n={};
    var pon=function(clave, auto, quiere){
      var m=(n[clave] && typeof n[clave]==='object' && !Array.isArray(n[clave])) ? JSON.parse(JSON.stringify(n[clave])) : {};
      if(quiere===auto) delete m[k]; else m[k]=quiere;
      n[clave]=m;
    };
    pon('temasAmb', ambTemaAuto(tema) ? 1 : 0, de==='amb' ? 1 : 0);
    if(de!=='amb') pon('temasSal', salTemaAuto(tema) ? 1 : 0, de==='sal' ? 1 : 0);
    var p=f ? sbPatch('sst_doc?id=eq.'+encodeURIComponent(f.id), { nota:JSON.stringify(n) }) : sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'ats-cfg', nombre:'digital', nota:JSON.stringify(n) });
    return p.then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject({ portal:'Esta cuenta no puede cambiarlo en esta obra.' }); return n; });
  });
}
function _infPideIr(x){
  var w=x.web || {};
  if(w.fn && typeof window[w.fn]==='function'){ window[w.fn](w.arg); return; }
  if(!w.v) return;
  var alt={ personal:'personas', personas:'personal', kardex:'epp', epp:'kardex', constancias:'cump', cump:'constancias' }, ids=vistasDe().map(function(v){ return v.id; });
  var v=ids.indexOf(w.v)>-1 ? w.v : (ids.indexOf(alt[w.v])>-1 ? alt[w.v] : '');
  if(!v){ toast('Eso se registra en la app.'); return; }
  navegar(v);
}
function _infCss23(){
  if(document.getElementById('inf-css23')) return;
  var s=document.createElement('style'); s.id='inf-css23';
  s.textContent=[
    '.inf-pide{margin:0 0 14px}.inf-pide-cab{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.inf-pide-cab b{font-size:15.5px;color:var(--tinta)}.inf-pide-cab .tenue{flex:1;font-size:13px}',
    '.inf-pide-barra{display:block;height:6px;border-radius:999px;background:var(--fondo);overflow:hidden;margin:8px 0 6px}.inf-pide-barra i{display:block;height:100%;background:var(--ok,#1e8e5a);border-radius:999px}',
    '.inf-pide-l{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 18px}@media (max-width:900px){.inf-pide-l{grid-template-columns:minmax(0,1fr)}}',
    '.inf-pide-f{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--raya)}.inf-pide-f .tx{flex:1;min-width:0}.inf-pide-f .tx b{display:block;font-size:13.5px;color:var(--tinta)}',
    '.inf-pide-f .tx small{display:block;font-size:12.5px;color:var(--gris);line-height:1.35}.inf-pide-f[data-est="falta"] .tx small:first-of-type{color:var(--tinta)}',
    '.inf-est{flex:0 0 24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;line-height:1}',
    '.inf-est.ok{background:var(--ok,#1e8e5a);color:#fff}.inf-est.falta{background:#f5b700;color:#0b2a3a}.inf-est.nada,.inf-est.web{background:var(--fondo);color:var(--gris)}.inf-est.cand{border:1.5px dashed var(--raya);font-size:11px}',
    '.inf-pide-solo{margin:10px 0 0;font-size:13px;color:var(--gris)}.inf-pide-solo b{color:var(--tinta)}',
    '.sal-reg{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}',
    '.inf-tema{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--raya);font-size:13.5px}.inf-tema span{flex:1;min-width:0}',
    '@media (max-width:640px){.inf-tema{flex-wrap:wrap;gap:6px 10px}.inf-tema span{flex:1 1 100%}}',
    '.sal-ev-l{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}',
    '.sal-q{display:grid;grid-template-columns:minmax(0,1fr) 210px auto;gap:8px;align-items:center;border:1px solid var(--raya);border-radius:9px;padding:8px 10px;margin:0 0 6px;background:var(--panel)}',
    '.sal-q .n{overflow-wrap:anywhere;font-size:13.5px}.sal-q select{margin:0}@media (max-width:640px){.sal-q{grid-template-columns:minmax(0,1fr)}}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ── la salud ocupacional del mes, de lo que ya trajo _infTraer, lo registrado aparte (sal-reg) y los EMO ── */
function _infSal(D, rows, emo){
  var mes=D.mes, anio=D.anio, dia=D.dia, mi=+mes.slice(5, 7), fin=_infMesFin(mes);
  var L=salFilas(rows || []), del=salDelMes(L, mes), Q={ L:del, R:salResumen(del) };
  /* las charlas de salud ocupacional (lo de medio ambiente se mira primero) */
  Q.ch=((D.ch && D.ch.S) || []).filter(function(x){ return x.amb!==true && (x.amb===false ? salTemaEs(x.tema, D.temasSal) : salTemaDe(x.tema, D.temasAmb, D.temasSal)==='sal'); });
  Q.chTot={ veces:Q.ch.length, asis:0, min:0, hhc:0 }; Q.ch.forEach(function(x){ Q.chTot.asis+=x.n; Q.chTot.min+=x.min; Q.chTot.hhc+=x.hhc; });
  /* las campañas de salud que tocan el mes (las de la app y las propias) */
  Q.camp=[];
  (D._act || []).forEach(function(r){
    var d=nota(r.nota); if(!d || d.k!=='camp' || d.estado==='anulada') return;
    var a=String(d.desde || '').slice(0, 10), b=String(d.hasta || d.desde || '').slice(0, 10);
    if(!a || a>fin || b<mes+'-01' || !salCampEs(d)) return;
    Q.camp.push({ nombre:String(d.nombre || 'Campaña'), desde:a, hasta:b, estado:d.estado==='hecha' ? 'Hecha' : 'Programada' });
  });
  /* el descanso médico: el mes y cada mes del año (sin nombres) */
  Q.desc=salDescansos(D._trab || [], mes, dia); Q.descMeses=[]; Q.descAnio=0;
  for(var m=1; m<=mi; m++){ var mm=anio+'-'+dos(m), fm=(m===mi) ? dia : _infMesFin(mm), q=salDescansos(D._trab || [], mm, fm); Q.descMeses.push({ m:mm, n:q.n, dias:q.dias }); Q.descAnio+=q.dias; }
  /* los accidentes y los primeros auxilios: del mes y del año */
  var am=(D._accs || []).filter(function(a){ return mesDe(a.fecha)===mes; }), aa=(D._accs || []).filter(function(a){ return anioDe(a.fecha)===anio && String(a.fecha).slice(0, 10)<=fin; });
  var cu=function(L, k){ return L.filter(function(a){ return a.clase===k; }).length; };
  Q.acc={ pa:cu(am, 'primeros'), leve:cu(am, 'leve'), incap:cu(am, 'incap'), mortal:cu(am, 'mortal'), paA:cu(aa, 'primeros'), leveA:cu(aa, 'leve'), incapA:cu(aa, 'incap'), mortalA:cu(aa, 'mortal'),
          dias:am.reduce(function(s, a){ return s+(parseInt(a.dias, 10) || 0); }, 0), IF:D.acc.IF, IS:D.acc.IS };
  /* las inspecciones de salud e higiene: por su tipo, o porque lo que encontraron es de salud */
  Q.obs=((D.obs && D.obs.L) || []).filter(function(x){ return x.sal; });
  Q.insp=(D._insp || []).filter(function(i){ return mesDe(i.fecha)===mes && (SAL_INSP.test(ambTemaClave(i.tipo)) || Q.obs.some(function(o){ return o.fuente==='insp' && o.k.indexOf('i:'+i.id+':')===0; })); })
    .map(function(i){ return { f:String(i.fecha).slice(0, 10), tipo:i.tipo || 'Inspección', insp:i.inspector || '', n:obsDeInspP(i).length }; });
  Q.emo=emo ? salEmo(emo, mes, dia) : null;
  /* los papeles del mes, para los anexos */
  Q.papeles=[]; del.forEach(function(x){ x.d.ev.forEach(function(e){ Q.papeles.push({ nombre:(SAL_EV_N[e.t] || 'Archivo')+' · '+_salLineaW(x.d)+' ('+_infFechaC(x.d.fecha)+')', url:e.u }); }); });
  return Q;
}
function _salLineaW(d){
  if(d.k==='mon') return salNombre(SAL_AGENTES, d.agente)+(d.lugar ? ' · '+d.lugar : '')+' · '+salNombre(SAL_RES, d.res);
  return salNombre(SAL_ACT_TIPOS, d.tipo)+(d.tema ? ' · '+d.tema : '')+(d.n ? ' · '+d.n+(d.n===1 ? ' persona' : ' personas') : '');
}
/* los nombres de los EMO (emo.js se pide al abrir «Salud (EMO)»: aquí, los suyos) */
var SALW_EMO_TIPOS = [['pre', 'Preocupacional'], ['periodico', 'Periódico'], ['retiro', 'De retiro'], ['reingreso', 'Por reingreso'], ['otro', 'Otro']];
var SALW_EMO_APT = [['apto', 'Apto'], ['apto_restr', 'Apto con restricciones'], ['no_apto', 'No apto'], ['observado', 'Observado'], ['sin', 'Sin aptitud anotada']];
var SALW_EMO_EST = { vencido:'Vencido', por_vencer:'Por vencer', sin:'Sin examen', vigente:'Vigente', sin_proximo:'Sin próximo' };
/* el registro fotográfico de un informe: solo sus temas */
function _infFotosDe(D, tipo){
  var L=infbFotoTemas(tipo, (D.freg && D.freg.L) || []), ks={}; L.forEach(function(c){ ks[c.k]=1; });
  return Object.assign({}, D, { freg:{ L:L, del:((D.freg && D.freg.del) || []).filter(function(x){ return ks[x.d.cat]; }), fallan:0 } });
}

/* «1 acto · 2 condiciones»: en singular cuando es uno (los informes decían «1 condiciones») */
function _infActCondTx(a, c){ return a+(a===1 ? ' acto' : ' actos')+' · '+c+(c===1 ? ' condición' : ' condiciones'); }
/* ═══ EL INFORME DE SALUD OCUPACIONAL ═══ */
var INF_SECC_SAL = [
  { k:'portada',  n:'Portada e índice',                       d:'La obra, la empresa, el mes, para quién es y lo que trae', fijo:'primero' },
  { k:'sresumen', n:'Resumen de salud ocupacional del mes',   d:'El personal, los EMO al día, el descanso médico, las atenciones por accidente, las horas de capacitación en salud y el monitoreo' },
  { k:'semo',     n:'Exámenes médicos ocupacionales (EMO)',   d:'Vigentes, por vencer, vencidos y sin examen; los exámenes del mes por tipo y por aptitud, y su entrega. Sin diagnósticos' },
  { k:'sdesc',    n:'Descanso médico',                        d:'Cuántos trabajadores y cuántos días, en el mes y mes a mes en el año. Sin nombres ni diagnósticos' },
  { k:'sacc',     n:'Atenciones por accidente',               d:'Los primeros auxilios y los accidentes leves, incapacitantes y mortales, con sus días de descanso y los índices del año' },
  { k:'scharlas', n:'Charlas y capacitaciones de salud',      d:'Los temas de salud ocupacional del mes, con sus personas, su duración y su HHC' },
  { k:'scamp',    n:'Campañas y actividades de salud',        d:'Las campañas de salud del mes y las actividades (pausas activas, vacunación, despistaje…) con sus personas' },
  { k:'smon',     n:'Monitoreo ocupacional',                  d:'Cada monitoreo del mes: el agente, dónde, el resultado y quién lo hizo; sus informes van en los anexos' },
  { k:'sinsp',    n:'Inspecciones de salud e higiene',        d:'Botiquín, comedor, servicios higiénicos, agua para beber, ergonomía…: las del mes y lo que encontraron' },
  { k:'sobs',     n:'Observaciones de salud e higiene',       d:'Los actos y las condiciones de salud del mes, con su levantamiento' },
  { k:'sfotos',   n:'Registro fotográfico de salud',          d:'Las fotos del mes de los temas de salud: salud ocupacional, servicios de bienestar…' },
  { k:'sanexos',  n:'Anexos: los informes del mes',           d:'Los informes de monitoreo y las evidencias de las actividades de salud registradas en el mes, tal cual', fijo:'ultimo' }
];
function _infSeccSalN(k){ for(var i=0;i<INF_SECC_SAL.length;i++) if(INF_SECC_SAL[i].k===k) return INF_SECC_SAL[i]; return null; }
var SAL_CONF = 'Sin diagnósticos ni datos médicos de nadie: el informe cuenta exámenes, aptitudes, días y personas. Los resultados de los exámenes son confidenciales y se le informan al trabajador personalmente.';
function _salPdf(D){
  var Q=D.sal, E=Q.emo, obra=nombreObraP()||'Obra', emp=empresaDeObraP()||'', mesN=_infMesN(D.mes), indice=[], n2=function(n){ return _infDec2(n, (n%1) ? 2 : 0); };
  var P=_infDocNuevo(obra, 'Informe de salud ocupacional · '+mesN), doc=P.doc, W=P.W, M=P.M, cap=function(s){ s=String(s||''); return s.charAt(0).toUpperCase()+s.slice(1); };
  INFW._yIndice=0; P.compacto=true;
  var X=Q.descMeses.map(function(q){ return cap(INF_MESES[+q.m.slice(5, 7)-1].slice(0, 3)); }), les=Q.acc.leve+Q.acc.incap+Q.acc.mortal, lesA=Q.acc.leveA+Q.acc.incapA+Q.acc.mortalA;
  (INFW.seccS||[]).filter(function(x){ return x.on; }).forEach(function(x){
    var s=_infSeccSalN(x.k); if(!s || x.k==='sanexos') return;
    if(x.k==='portada'){
      P.portada('INFORME DE SALUD OCUPACIONAL', obra, emp, [['Para', _infParaTxt()], ['Elaborado por', String(INFW.por||'').trim() || '—'], ['Emitido', fechaLarga(hoyISO())], ['Código de la obra', (YO.obra||{}).codigo||'—']]);
      return;
    }
    P.sec(s.n); indice.push({ t:s.n, p:doc.getNumberOfPages() });
    if(x.k==='sresumen'){
      P.cifras([['Personal en obra', D.activos, D.cat ? D.cat.o+' obreros · '+D.cat.s+' staff' : ''], ['HHT del mes', _infNum(D.hh.hht), D.hh.dias+(D.hh.dias===1 ? ' día' : ' días')],
                ['EMO al día', E ? E.vig+' de '+E.n : '—', E ? (E.venc+(E.venc===1 ? ' vencido' : ' vencidos')+' · '+E.sin+' sin examen') : 'sin acceso a los EMO', E ? ((E.venc || E.sin) ? 'mal' : 'ok') : ''],
                ['Descanso médico', Q.desc.dias+(Q.desc.dias===1 ? ' día' : ' días'), Q.desc.n+(Q.desc.n===1 ? ' trabajador' : ' trabajadores')]]);
      P.cifras([['Atenciones por accidente', les+Q.acc.pa, les+' con lesión · '+Q.acc.pa+' de primeros auxilios', les ? 'mal' : ''], ['HHC de salud', _infDec(Q.chTot.hhc), Q.chTot.veces+(Q.chTot.veces===1 ? ' charla' : ' charlas')],
                ['Campañas y actividades', Q.camp.length+Q.R.act, Q.R.pers ? _infNum(Q.R.pers)+' personas' : ''], ['Monitoreos', Q.R.mon, Q.R.fuera ? Q.R.fuera+(Q.R.fuera===1 ? ' supera el límite' : ' superan el límite') : (Q.R.mon ? 'dentro del límite' : 'ninguno en el mes'), Q.R.fuera ? 'mal' : (Q.R.mon ? 'ok' : '')]]);
      P.tabla('Los indicadores del mes y del año', ['Indicador', 'Del mes', 'En el año'], [
        ['Días de descanso médico', Q.desc.dias, Q.descAnio], ['Accidentes con lesión', les, lesA], ['Atenciones de primeros auxilios', Q.acc.pa, Q.acc.paA],
        ['Índice de frecuencia (accidentes con descanso por millón de HHT)', '—', Q.acc.IF==null ? '—' : _infDec2(Q.acc.IF, 2)], ['Índice de gravedad (días perdidos por millón de HHT)', '—', Q.acc.IS==null ? '—' : _infDec2(Q.acc.IS, 2)],
        ['Horas hombre de capacitación en salud', _infDec(Q.chTot.hhc), '—']], [W-2*M-180, 90, 90], { num:{ 1:1, 2:1 } });
      P.nota(SAL_CONF);
      return;
    }
    if(x.k==='semo'){
      if(!E){ P.nota('No se pudieron leer los EMO de la obra: vienen con el plan SSOMA y los ve el equipo de la obra (fechas y aptitud). Se registran en «Salud (EMO)».'); return; }
      P.cifras([['Vigentes', E.vig, 'de '+E.n+' activos', E.vig ? 'ok' : ''], ['Por vencer', E.por, 'en 30 días o menos', E.por ? 'ojo' : ''], ['Vencidos', E.venc, E.venc ? 'hay que programarlos' : 'ninguno', E.venc ? 'mal' : 'ok'], ['Sin examen', E.sin, E.sin ? 'sin ninguno registrado' : 'todos tienen uno', E.sin ? 'ojo' : 'ok']]);
      P.tabla('Los exámenes del mes, por tipo', ['Tipo de examen', 'Exámenes'], SALW_EMO_TIPOS.filter(function(t){ return E.tipos[t[0]]; }).map(function(t){ return [t[1], E.tipos[t[0]]]; })
        .concat(E.mes ? [{ v:['Total del mes', E.mes], t:'tot' }] : []), [W-2*M-100, 100], { num:{ 1:1 }, vacio:'Ningún examen registrado en el mes.' });
      P.tabla('Su aptitud', ['Aptitud', 'Exámenes'], SALW_EMO_APT.filter(function(a){ return E.apt[a[0]]; }).map(function(a){ return [a[1], E.apt[a[0]]]; }), [W-2*M-100, 100], { num:{ 1:1 }, vacio:'Ningún examen registrado en el mes.' });
      if(E.mes) P.nota('Entregados al trabajador: '+E.entregados+' de '+E.mes+' · con su firma de recibido en la app: '+E.recibidos+'.');
      var orden={ vencido:0, sin:1, por_vencer:2 };
      if(E.L.length) P.tablaW('Por vencer, vencidos y sin examen', ['Trabajador', 'Estado', 'Último examen', 'Próximo'], E.L.slice().sort(function(a, b){ return (orden[a.est]-orden[b.est]) || a.nombre.localeCompare(b.nombre, 'es'); })
        .map(function(x){ return [x.nombre || '—', SALW_EMO_EST[x.est] || x.est, x.fecha ? _infFechaC(x.fecha) : '—', x.proximo ? _infFechaC(x.proximo) : '—']; }), [W-2*M-300, 100, 100, 100], { tam:7.8 });
      P.nota('Las fechas y la aptitud son lo que ve el equipo de la obra. El informe médico de cada uno lo ven solo salud y el trabajador.');
      return;
    }
    if(x.k==='sdesc'){
      P.cifras([['Trabajadores con descanso médico', Q.desc.n, 'en el mes'], ['Días de descanso médico', Q.desc.dias, 'en el mes', Q.desc.dias ? 'ojo' : ''], ['En el año', Q.descAnio, 'días hasta '+mesN], ['Por accidente', Q.acc.dias, 'días de descanso de los accidentes del mes', Q.acc.dias ? 'mal' : '']]);
      P.columnas('Días de descanso médico, mes a mes', X, [{ n:'Días', v:Q.descMeses.map(function(q){ return q.dias; }), c:INF_COL.azul2 }], function(v){ return n2(v); }, { valores:true, alto:110 });
      P.nota('Sale de la situación «De descanso» (por descanso médico) de cada trabajador, que se marca en la app desde su ficha, en «Cambiar su situación». Sin nombres ni diagnósticos.');
      return;
    }
    if(x.k==='sacc'){
      P.tabla('Del mes y del año', ['Evento', 'Del mes', 'En el año'], [['Primeros auxilios (se atendió en obra y siguió trabajando)', Q.acc.pa, Q.acc.paA], ['Accidente leve', Q.acc.leve, Q.acc.leveA],
        ['Accidente incapacitante (con descanso médico)', Q.acc.incap, Q.acc.incapA], ['Accidente mortal', Q.acc.mortal, Q.acc.mortalA], { v:['Total', les+Q.acc.pa, lesA+Q.acc.paA], t:'tot' }], [W-2*M-180, 90, 90], { num:{ 1:1, 2:1 } });
      P.cifras([['Días de descanso por accidente', Q.acc.dias, 'de los accidentes del mes', Q.acc.dias ? 'mal' : 'ok'], ['Índice de frecuencia', Q.acc.IF==null ? '—' : _infDec2(Q.acc.IF, 2), 'del año'], ['Índice de gravedad', Q.acc.IS==null ? '—' : _infDec2(Q.acc.IS, 2), 'del año'], ['HHT del año', _infNum(D.acc.hAnio), 'hasta '+mesN]]);
      P.nota('Salen de «Accidentes e incidentes» (la app o la web), con los días de descanso médico de cada accidente.');
      return;
    }
    if(x.k==='scharlas'){
      if(!Q.ch.length){ P.nota('Ninguna charla de salud ocupacional en el mes. El tema de cada charla se marca al registrarla (en la app: «El tema es de… Salud ocupacional»); de entrada lo dicen sus palabras.'); return; }
      P.cifras([['Charlas y capacitaciones', Q.chTot.veces, 'de salud ocupacional'], ['Personas', _infNum(Q.chTot.asis), ''], ['Duración', _infMin(Q.chTot.min), ''], ['HHC de salud', _infDec(Q.chTot.hhc), D.hh.hht ? _infPct(Q.chTot.hhc, D.hh.hht)+' de lo trabajado' : '']]);
      P.tabla('Los temas del mes', ['Fecha', 'Tipo', 'Tema', 'Personas', 'Duración', 'HHC'], Q.ch.map(function(c){ return [_infFechaC(c.f), c.tipo, c.tema, _infNum(c.n), _infMin(c.min), _infDec(c.hhc)]; })
        .concat([{ v:['', '', 'Total del mes', _infNum(Q.chTot.asis), _infMin(Q.chTot.min), _infDec(Q.chTot.hhc)], t:'tot' }]), [58, 128, W-2*M-340, 50, 56, 48], { num:{ 3:1, 4:1, 5:1 } });
      return;
    }
    if(x.k==='scamp'){
      P.tabla('Las campañas de salud', ['Campaña', 'Desde', 'Hasta', 'Estado'], Q.camp.map(function(c){ return [c.nombre, _infFechaC(c.desde), _infFechaC(c.hasta), c.estado]; }), [W-2*M-260, 80, 80, 100], { vacio:'Ninguna campaña de salud en el mes.' });
      var act=Q.L.filter(function(r){ return r.d.k==='act'; });
      P.tabla('Las actividades de salud', ['Fecha', 'Actividad', 'Tema', 'Personas', 'Quién la dictó'], act.map(function(r){ var d=r.d; return [_infFechaC(d.fecha), salNombre(SAL_ACT_TIPOS, d.tipo), d.tema || '—', _infNum(d.n), d.emp || '—']; })
        .concat(act.length ? [{ v:['', '', 'Total', _infNum(Q.R.pers), ''], t:'tot' }] : []), [58, 120, W-2*M-348, 56, 114], { num:{ 3:1 }, vacio:'Ninguna actividad de salud registrada en el mes.' });
      return;
    }
    if(x.k==='smon'){
      var mon=Q.L.filter(function(r){ return r.d.k==='mon'; });
      if(!mon.length){ P.nota('Ningún monitoreo ocupacional en el mes: van según su programa (ver «Programas del año»). Se registran en «Salud ocupacional» de la app o en esta pestaña, con su informe.'); return; }
      P.tablaW('Los monitoreos del mes', ['Fecha', 'Agente', 'Dónde o puesto', 'Resultado', 'Quién lo hizo', 'Informe'], mon.map(function(r){ var d=r.d; return [_infFechaC(d.fecha), salNombre(SAL_AGENTES, d.agente), d.lugar || '—', salNombre(SAL_RES, d.res), d.emp || '—', d.ev.some(function(e){ return e.t==='inf'; }) ? 'en los anexos' : 'falta']; }),
        [56, 92, W-2*M-422, 92, 102, 80], { tam:7.6 });
      if(Q.R.fuera) P.nota('Lo que supera el límite necesita su plan de acción —controles de ingeniería, administrativos y de EPP— y volver a medir.');
      return;
    }
    if(x.k==='sinsp'){
      P.tabla('Las inspecciones del mes', ['Fecha', 'Inspección', 'Quién', 'Lo que encontró'], Q.insp.map(function(i){ return [_infFechaC(i.f), i.tipo, i.insp || '—', i.n ? i.n+(i.n===1 ? ' observación' : ' observaciones') : 'conforme']; }),
        [62, W-2*M-302, 130, 110], { vacio:'Ninguna inspección de salud e higiene en el mes.' });
      return;
    }
    if(x.k==='sobs'){
      if(!Q.obs.length){ P.nota('Ninguna observación de salud e higiene en el mes. Una observación es de salud si su categoría lo es (la lista de la obra) o si se marcó así al clasificarla.'); return; }
      P.cifras([['Observaciones de salud', Q.obs.length, _infActCondTx(Q.obs.filter(function(o){ return o.tipo==='acto'; }).length, Q.obs.filter(function(o){ return o.tipo==='condicion'; }).length)],
                ['Levantadas', Q.obs.filter(function(o){ return o.cerr; }).length, ''], ['Sin levantar', Q.obs.filter(function(o){ return !o.cerr; }).length, '', Q.obs.some(function(o){ return !o.cerr; }) ? 'mal' : 'ok']]);
      P.tablaW('Cada observación', ['Fecha', 'Tipo', 'Categoría', 'Lo que se vio', 'Empresa observada', 'Levantamiento'], Q.obs.map(function(o){ return [_infFechaC(o.f), o.tipo==='acto' ? 'Acto' : (o.tipo==='condicion' ? 'Condición' : obsTipoN(o.tipo)), o.cat || '—', o.desc, o.eo || '—', o.cerr ? 'Levantada' + (o.fc ? ' el '+_infFechaC(o.fc) : '') : (o.plan || 'Pendiente')]; }),
        [56, 50, 96, W-2*M-376, 86, 88], { tam:7.6 });
      return;
    }
    if(x.k==='sfotos'){ _infSecc19(P, D._fregSal || _infFotosDe(D, 'sal'), 'fotoreg', {}); return; }
  });
  return { doc:doc, bytes:doc.output('arraybuffer'), indice:indice };
}
function _salExcel(D){
  var X=RCAP.xlsx, S=_infXlsEstilos(X), Q=D.sal, E=Q.emo, obra=nombreObraP()||'Obra', sub=[empresaDeObraP()||'', obra, _infMesMay(D.mes)].filter(Boolean).join(' · '), H=[], h, fr;
  h=new X.Hoja('Resumen'); h.activa=true; h.pie='Informe de salud ocupacional'; fr=_infXlsCab(h, S, 'Informe de salud ocupacional', 3, sub);
  fr=_infXlsTabla(h, S, fr, [['Indicador', 44, 'tx'], ['Del mes', 14, 'n'], ['En el año', 14, 'n']], [
    ['Personal en obra al cierre', D.activos, ''], ['Horas hombre trabajadas', D.hh.hht, D.hhA ? D.hhA.acum.hht : ''], ['EMO vigentes', E ? E.vig : '', ''], ['EMO vencidos', E ? E.venc : '', ''], ['Sin examen', E ? E.sin : '', ''], ['Exámenes del mes', E ? E.mes : '', ''],
    ['Trabajadores con descanso médico', Q.desc.n, ''], ['Días de descanso médico', Q.desc.dias, Q.descAnio], ['Accidentes con lesión', Q.acc.leve+Q.acc.incap+Q.acc.mortal, Q.acc.leveA+Q.acc.incapA+Q.acc.mortalA],
    ['Primeros auxilios', Q.acc.pa, Q.acc.paA], ['Charlas de salud', Q.chTot.veces, ''], ['Horas hombre de capacitación en salud', Math.round(Q.chTot.hhc*100)/100, ''], ['Campañas de salud', Q.camp.length, ''],
    ['Actividades de salud', Q.R.act, ''], ['Personas en las actividades', Q.R.pers, ''], ['Monitoreos', Q.R.mon, ''], ['Monitoreos que superan el límite', Q.R.fuera, '']], X);
  H.push(h);
  if(E){
    h=new X.Hoja('EMO'); h.pie='Informe de salud ocupacional'; fr=_infXlsCab(h, S, 'Los exámenes médicos ocupacionales (sin diagnósticos)', 3, sub);
    fr=_infXlsTabla(h, S, fr, [['Trabajador', 40, 'tx'], ['Estado', 16, 'tx'], ['Último examen', 14, 'f'], ['Próximo', 14, 'f']], E.L.map(function(x){ return [x.nombre, SALW_EMO_EST[x.est] || x.est, x.fecha, x.proximo]; }), X);
    H.push(h);
  }
  h=new X.Hoja('Charlas de salud'); h.pie='Informe de salud ocupacional'; fr=_infXlsCab(h, S, 'Las charlas y capacitaciones de salud ocupacional', 5, sub);
  fr=_infXlsTabla(h, S, fr, [['Fecha', 12, 'f'], ['Tipo', 28, 'tx'], ['Tema', 46, 'tx'], ['Personas', 10, 'n'], ['Duración (min)', 14, 'n'], ['HHC', 10, 'd']], Q.ch.map(function(c){ return [c.f, c.tipo, c.tema, c.n, c.min, Math.round(c.hhc*100)/100]; })
    .concat(Q.ch.length ? [{ v:['', '', 'Total', Q.chTot.asis, Q.chTot.min, Math.round(Q.chTot.hhc*100)/100], t:'tot' }] : []), X);
  H.push(h);
  h=new X.Hoja('Registros'); h.pie='Informe de salud ocupacional'; fr=_infXlsCab(h, S, 'El monitoreo y las actividades de salud del mes', 6, sub);
  fr=_infXlsTabla(h, S, fr, [['Fecha', 12, 'f'], ['Qué', 14, 'tx'], ['Agente o actividad', 26, 'tx'], ['Dónde, puesto o tema', 34, 'tx'], ['Resultado o personas', 18, 'tx'], ['Quién lo hizo', 26, 'tx'], ['Archivos', 30, 'tx']],
    Q.L.map(function(r){ var d=r.d, ev=d.ev.map(function(e){ return SAL_EV_N[e.t]; }).join(', ');
      return d.k==='mon' ? [d.fecha, 'Monitoreo', salNombre(SAL_AGENTES, d.agente), d.lugar, salNombre(SAL_RES, d.res), d.emp, ev] : [d.fecha, 'Actividad', salNombre(SAL_ACT_TIPOS, d.tipo), d.tema, String(d.n || ''), d.emp, ev]; }), X);
  H.push(h);
  h=new X.Hoja('Mes a mes'); h.pie='Informe de salud ocupacional'; fr=_infXlsCab(h, S, 'El descanso médico, mes a mes', 3, sub);
  fr=_infXlsTabla(h, S, fr, [['Mes', 18, 'tx'], ['Trabajadores', 14, 'n'], ['Días', 12, 'n']], Q.descMeses.map(function(q){ var s=_infMesN(q.m); return [s.charAt(0).toUpperCase()+s.slice(1), q.n, q.dias]; }), X);
  H.push(h);
  return X.libro(H, S.E, 'Informe de salud ocupacional · '+obra);
}
function _infPintarSal(){
  var caja=INFW.caja; if(!caja || !document.body.contains(caja)) return;
  if(!INFW.seccS) INFW.seccS=INF_SECC_SAL.map(function(s){ return { k:s.k, on:true }; });
  var ac=$('acciones'); if(ac){ ac.innerHTML='<button type="button" class="bt" id="inf-armar">Armar el informe ›</button>'; $('inf-armar').onclick=infArmar; }
  var h=_infTipoHTML()+'<p class="inf-intro" id="inf-que">🩺 <b>El informe de salud ocupacional del mes.</b> Sale de los EMO, del descanso médico de cada trabajador, de los accidentes y los primeros auxilios, de las charlas y campañas de salud, de las inspecciones y observaciones de salud e higiene, y de lo registrado aparte: el monitoreo ocupacional y las actividades de salud. Sin diagnósticos.</p>';
  h+='<div class="sal-reg"><button type="button" class="bt sec chico" id="salw-mon">🔬 ＋ Registrar un monitoreo</button><button type="button" class="bt sec chico" id="salw-act">💪 ＋ Registrar una actividad de salud</button></div>'+
    '<div class="tarj inf-paso" id="salw-lista" hidden></div>';
  h+='<div class="tarj inf-paso"><div class="tarj-cuerpo"><h3><span class="inf-n">1</span> El mes y para quién</h3><div class="inf-campos">'+
    '<div class="campo"><label for="inf-mes">Mes</label><select id="inf-mes">'+_infMeses().map(function(m){ return '<option value="'+m+'"'+(m===INFW.mes ? ' selected' : '')+'>'+esc(_infMesMay(m))+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label>Para</label><div class="inf-para" role="radiogroup" aria-label="Para quién es">'+
      [['gerencia', 'Mi gerencia'], ['cliente', 'Mi cliente']].map(function(o){ return '<button type="button" role="radio" aria-checked="'+(INFW.para===o[0])+'" class="'+(INFW.para===o[0] ? 'on' : '')+'" data-para="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div></div>'+
    '<div class="campo"><label for="inf-para-n">'+(INFW.para==='cliente' ? 'El cliente' : 'La gerencia o quien lo recibe')+' <span class="tenue">· si quieres</span></label><input id="inf-para-n" maxlength="100" value="'+esc(INFW.paraN)+'"></div>'+
    '<div class="campo"><label for="inf-por">Elaborado por</label><input id="inf-por" maxlength="100" value="'+esc(INFW.por)+'"></div></div></div></div>';
  h+='<div class="tarj inf-paso"><div class="tarj-cuerpo"><h3><span class="inf-n">2</span> Lo que va</h3><div id="inf-secc-s">'+INFW.seccS.map(function(x, i){
      var s=_infSeccSalN(x.k), fijo=!!s.fijo;
      return '<label class="inf-sec'+(x.on ? '' : ' off')+'" data-k="'+esc(x.k)+'"><span class="n">'+(i+1)+'</span><input type="checkbox" data-ons="'+i+'"'+(x.on ? ' checked' : '')+(fijo && x.k==='portada' ? ' disabled' : '')+'> <span class="tx"><b>'+esc(s.n)+'</b><small>'+esc(s.d)+'</small></span></label>';
    }).join('')+'</div></div></div>';
  h+='<div class="inf-armar"><button type="button" class="bt" id="inf-armar2">Armar el informe ›</button><span>Sale en PDF con su portada, su índice y las páginas numeradas, y con el Excel de lo registrado.</span></div>';
  caja.innerHTML=h;
  $('inf-mes').onchange=function(){ INFW.mes=this.value; INFW.datos=null; _infPintarSal(); };
  $('inf-para-n').oninput=function(){ INFW.paraN=this.value; };
  $('inf-por').oninput=function(){ INFW.por=this.value; };
  $('inf-armar2').onclick=infArmar;
  $('salw-mon').onclick=function(){ salwForm('mon'); };
  $('salw-act').onclick=function(){ salwForm('act'); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-para]'), function(b){ b.onclick=function(){ INFW.para=b.getAttribute('data-para'); _infPintar(); }; });
  _infTipoAl(caja);
  $('inf-secc-s').onchange=function(ev){ var c=ev.target; if(c.hasAttribute('data-ons')){ INFW.seccS[+c.getAttribute('data-ons')].on=c.checked; _infPintarSal(); } };
}
function _infArmarSal(){
  if(INFW.armando) return;
  INFW.armando=true;
  ['inf-armar', 'inf-armar2'].forEach(function(id){ var b=$(id); if(b){ b.disabled=true; b.textContent='Armando…'; } });
  var fin=function(){ INFW.armando=false; ['inf-armar', 'inf-armar2'].forEach(function(id){ var b=$(id); if(b){ b.disabled=false; b.textContent='Armar el informe ›'; } }); };
  var va=function(k){ return (INFW.seccS||[]).some(function(x){ return x.k===k && x.on; }); };
  Promise.all([_infTraer(INFW.mes, YO.obra, {}), cargarEvPDF(), _infLibPdf()]).then(function(r){
    var D=r[0], Dz=va('sfotos') ? _infFotosDe(D, 'sal') : null;
    return (Dz ? _infFregTraer(Dz) : Promise.resolve()).then(function(){ D._fregSal=Dz; return D; });
  }).then(function(D){
    INFW.datos=D; INFW.datosT=null;
    var base=_salPdf(D);
    return _infUnir(base.bytes, base.indice, false, { anexos:va('sanexos') ? D.sal.papeles : [], sinComite:true, pie:'Informe de salud ocupacional' });
  }).then(function(out){ fin(); INFW.pdf=out; _infVer(out); },
    function(e){ fin(); toast('No se pudo armar el informe: '+((e && e.message) || e)); });
}

/* ── registrar en la web: un monitoreo o una actividad de salud (la misma hoja «sal-reg» que la app) ── */
var SALW = { ed:null, ev:[], guardando:false };
/* lo registrado aparte en el mes, con su «Corregir» (lo de la app también sale aquí) */
function _salwListaPintar(){
  var c=$('salw-lista'), D=INF_PIDE.D; if(!c || !D || !D.sal) return;
  var L=D.sal.L || [];
  if(!L.length){ c.hidden=true; c.innerHTML=''; return; }
  c.hidden=false;
  c.innerHTML='<div class="tarj-cuerpo"><h3>🔬 Lo registrado aparte en '+esc(_infMesN(INFW.mes))+' <small class="tenue">· '+L.length+'</small></h3>'+L.map(function(x, i){ var d=x.d, n=d.ev.length;
    return '<div class="inf-tema"><span><b>'+(d.k==='mon' ? 'Monitoreo' : 'Actividad')+' · '+esc(_salLineaW(d))+'</b> <small class="tenue">· '+esc(_infFechaC(d.fecha))+' · '+(n ? n+(n===1 ? ' archivo' : ' archivos') : 'sin archivos')+'</small></span>'+
      '<button type="button" class="bt sec chico" data-salw="'+i+'">Corregir</button></div>'; }).join('')+'</div>';
  c.onclick=function(ev){ var b=ev.target.closest('[data-salw]'); if(!b) return; var x=L[+b.getAttribute('data-salw')]; if(x) salwForm(x.d.k, x); };
}
function _salChipsW(id, L, sel){ return '<div class="chips" id="'+id+'" role="radiogroup">'+L.map(function(x){ var on=(x[0]===sel); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-v="'+esc(x[0])+'">'+esc(x[1])+'</button>'; }).join('')+'</div>'; }
function _salChipsWAl(id){ var c=$(id); if(!c) return; c.onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; Array.prototype.forEach.call(c.querySelectorAll('.chip'), function(x){ var on=(x===b); x.className='chip'+(on ? ' on' : ''); x.setAttribute('aria-checked', on ? 'true' : 'false'); }); }; }
function _salChipsWV(id, def){ var b=document.querySelector('#'+id+' .chip.on'); return b ? b.getAttribute('data-v') : (def||''); }
function salwForm(k, fila){
  var d=(fila && fila.d) || {}, hoy=hoyISO(), mes=INFW.mes || hoy.slice(0, 7);
  k=(k==='act') ? 'act' : 'mon';
  SALW.ed={ k:k, fila:fila || null }; SALW.ev=(d.ev||[]).map(function(e){ return { u:e.u, n:e.n, t:e.t }; }); SALW.guardando=false;
  var h='';
  if(k==='mon') h+='<div class="campo"><label>Qué se midió</label>'+_salChipsW('salw-agente', SAL_AGENTES, d.agente || 'ruido')+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="salw-lugar">Dónde o en qué puesto</label><input id="salw-lugar" maxlength="120" value="'+esc(d.lugar||'')+'" placeholder="Zona de corte de fierro, operador de la mezcladora"></div>'+
    '<div class="campo"><label for="salw-emp">Quién lo hizo <span class="tenue">· el laboratorio o la empresa</span></label><input id="salw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div></div>'+
    '<div class="campo"><label>Resultado</label>'+_salChipsW('salw-res', SAL_RES, d.res || 'ok')+'</div>';
  else h+='<div class="campo"><label>Qué fue</label>'+_salChipsW('salw-tipo', SAL_ACT_TIPOS, d.tipo || 'pausas')+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="salw-tema">Tema <span class="tenue">· si quieres</span></label><input id="salw-tema" maxlength="160" value="'+esc(d.tema||'')+'" placeholder="Pausas activas de la mañana"></div>'+
    '<div class="campo"><label for="salw-n">Cuántas personas</label><input id="salw-n" inputmode="numeric" maxlength="5" value="'+esc(d.n||'')+'"></div>'+
    '<div class="campo"><label for="salw-emp">Quién la dictó <span class="tenue">· si quieres</span></label><input id="salw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div></div>';
  h+='<div class="fila-c"><div class="campo"><label for="salw-fecha">Fecha</label><input type="date" id="salw-fecha" max="'+hoy+'" value="'+esc(d.fecha || (mes===hoy.slice(0, 7) ? hoy : _infMesFin(mes)))+'"></div>'+
    '<div class="campo"><label for="salw-obs">Nota <span class="tenue">· si quieres</span></label><input id="salw-obs" maxlength="300" value="'+esc(d.obs||'')+'"></div></div>'+
    '<div class="seccion"><h3>'+(k==='mon' ? 'El informe' : 'La evidencia')+'</h3><div id="salw-ev"></div></div><p class="ayuda">'+(k==='mon' ? 'Solo el resultado y su informe: nada de datos médicos de nadie.' : 'Va al informe de salud ocupacional con sus personas.')+'</p><div class="msg" id="salw-msg" role="status"></div>';
  abrirHoja(fila ? 'Corregir el registro' : (k==='mon' ? 'Registrar un monitoreo ocupacional' : 'Registrar una actividad de salud'), mesLargo(mes), h,
    '<button type="button" class="bt sec" id="salw-no">Cancelar</button><button type="button" class="bt ok" id="salw-ok">Guardar</button>', { ancha:true });
  ['salw-agente', 'salw-res', 'salw-tipo'].forEach(_salChipsWAl);
  _salEvPintaW();
  $('salw-no').onclick=cerrarHoja;
  $('salw-ok').onclick=_salGuardarW;
}
function _salEvPintaW(){
  var c=$('salw-ev'); if(!c) return;
  var tipos=SALW.ed.k==='mon' ? [['inf', 'Informe o certificado'], ['foto', 'Foto']] : [['foto', 'Foto'], ['lista', 'Lista de asistencia']];
  c.innerHTML=(SALW.ev.length ? '<div class="sal-ev-l">'+SALW.ev.map(function(e, i){ return '<span class="pill gris">📎 '+esc(SAL_EV_N[e.t] || '')+' · '+esc(e.f ? e.f.name : e.n)+' <button type="button" class="bt-link" data-quita="'+i+'">quitar</button></span>'; }).join('')+'</div>' : '')+
    '<div class="sal-q"><span class="n">Adjuntar <b>foto o PDF</b> (hasta 20 MB)</span><select id="salw-evt" aria-label="Qué archivo es">'+tipos.map(function(t){ return '<option value="'+t[0]+'">'+esc(t[1])+'</option>'; }).join('')+'</select>'+
    '<label class="bt sec chico" for="salw-evf">＋ Elegir el archivo</label><input type="file" id="salw-evf" accept="application/pdf,image/*" hidden></div>';
  $('salw-evf').onchange=function(){
    var f=this.files && this.files[0]; this.value=''; if(!f) return;
    if(!/pdf|image\//i.test(f.type||'') && !/\.(pdf|jpe?g|png|webp)$/i.test(f.name||'')){ toast('Solo PDF o fotos.'); return; }
    if(f.size>20*1024*1024){ toast('Pesa más de 20 MB.'); return; }
    SALW.ev.push({ f:f, t:$('salw-evt').value }); _salEvPintaW();
  };
  Array.prototype.forEach.call(c.querySelectorAll('[data-quita]'), function(b){ b.onclick=function(){ SALW.ev.splice(+b.getAttribute('data-quita'), 1); _salEvPintaW(); }; });
}
function _salGuardarW(){
  if(SALW.guardando) return;
  var k=SALW.ed.k, fila=SALW.ed.fila, m=$('salw-msg'), v=function(id){ var e=$(id); return e ? String(e.value||'').trim() : ''; };
  var mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco) try{ $(foco).focus(); }catch(e){} };
  var fe=v('salw-fecha'); if(!/^\d{4}-\d{2}-\d{2}$/.test(fe) || fe>hoyISO()) return mal('Revisa la fecha: hasta hoy.', 'salw-fecha');
  var d={ k:k, fecha:fe, agente:_salChipsWV('salw-agente', 'otro'), res:_salChipsWV('salw-res', 'pend'), tipo:_salChipsWV('salw-tipo', 'otra'), lugar:v('salw-lugar'), emp:v('salw-emp'), tema:v('salw-tema'), n:v('salw-n'), obs:v('salw-obs'),
          por:(fila && fila.d.por) || YO.nombre || (typeof quienSoy==='function' ? quienSoy() : '') || '', t:Date.now() };
  if(k==='mon' && d.lugar.length<3) return mal('Escribe dónde o en qué puesto se midió.', 'salw-lugar');
  if(k==='act' && !(parseInt(d.n, 10)>0)) return mal('Escribe cuántas personas fueron (solo el número).', 'salw-n');
  var b=$('salw-ok'); SALW.guardando=true; b.disabled=true; m.className='msg gris'; m.textContent='Subiendo los archivos…';
  var out=[], i=0, cola=SALW.ev.slice();
  function sube(){
    var x=cola[i++]; if(!x) return Promise.resolve();
    if(x.u){ out.push({ u:x.u, n:x.n, t:x.t }); return sube(); }
    var f=x.f, p=/^image\//i.test(f.type||'') ? achicarFoto(f, 1800, 0.85).then(function(bl){ return subirFoto('salud', bl, f.name || 'foto.jpg'); }) : subirArchivoP('salud', f);
    return p.then(function(u){ out.push({ u:u, n:String(f.name||'archivo').slice(0, 120), t:x.t }); return sube(); });
  }
  sube().then(function(){
    d.ev=out; var L=salLimpio(d); m.textContent='Guardando…';
    var fila2={ nombre:_salLineaW(L).slice(0, 180), url:(out[0] && out[0].u) || null, nota:JSON.stringify(L) };
    if(fila) return sbPatch('sst_doc?id=eq.'+encodeURIComponent(fila.id), fila2);
    fila2.empresa=YO.obra.id; fila2.hoja=SAL_HOJA;
    return sbPostP('sst_doc', fila2);
  }).then(function(rows){
    SALW.guardando=false;
    if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'No se guardó: esta cuenta no puede registrar en esta obra.' });
    toast('Guardado: va al informe de salud ocupacional.'); cerrarHoja(); INF_PIDE.k='';
    if(VISTA.actual==='inf-salud') _infPintar();
  }).catch(function(e){ SALW.guardando=false; b.disabled=false; mal(e==='muy-grande' ? 'El archivo pesa más de 25 MB.' : 'No se pudo guardar. '+porQueFallo(e)); });
}
