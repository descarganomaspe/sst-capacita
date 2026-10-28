/* OBRASST · portal/auditoria.js — la Carpeta de auditoría y el ciclo de auditoría (27/10/2026)
   Marcelo (27/10): «en los planes, desde SSOMA, una sección de auditoría según las normas ISO de medio ambiente, seguridad y
   salud ocupacional, que se rellene automáticamente, ordenada por carpetas… plan Gestión completo, SSOMA hasta cierto punto».
   Se pide al abrir el área «Auditoría» (index: cargarAuditoria / audIr). Usa el jsPDF, el Excel y el ZIP de
   evaluaciones-pdf.js (cargarEvPDF) solo al exportar.

   QUÉ ES
   OBRASST no audita ni certifica: ordena la evidencia que la obra ya registra (en la app y en la web) contra lo que pide
   cada norma y dice, requisito por requisito, qué hay (✓), qué hay pero está viejo o incompleto (⚠), qué falta (✗) y qué no
   registra OBRASST (○: la evidencia se sube aquí). Todo se exporta en un ZIP ordenado por carpetas, con su índice en PDF y
   en Excel y los registros armados con lo de la obra.
   · SSOMA: la carpeta (vista «aud»).
   · Gestión SST: además, el ciclo (vistas «aud-int», «aud-acc» y «aud-rev»): la auditoría interna por cláusula, los
     hallazgos con su acción correctiva y la revisión por la dirección.

   LAS NORMAS (solo lo verificado en la fuente; es mejor un casillero vacío que una norma inventada)
   · D.S. 005-2012-TR (Reglamento de la Ley 29783), en gob.pe (onpsctr.gob.pe), consultado el 27/10/2026: art. 32 (la
     documentación del sistema, a–f), art. 33 (los registros obligatorios, a–h; su información mínima, por R.M.), art. 35
     (se conservan: enfermedades ocupacionales 20 años; accidentes de trabajo e incidentes peligrosos 10; los demás 5,
     desde el suceso), art. 89 (la vigilancia del sistema, a–g), art. 90 (la revisión del sistema, por lo menos una vez al
     año), art. 91 (sus conclusiones se registran y se comunican) y su 4.ª disposición complementaria transitoria (las
     auditorías del art. 43 de la Ley, obligatorias desde el 01/01/2013).
   · Ley 29783: art. 43 (auditorías periódicas por auditores independientes, con participación de los trabajadores) y
     art. 57 (la evaluación de riesgos se actualiza una vez al año como mínimo o cuando cambian las condiciones de trabajo;
     citado en la R.D. 055-2025-DG-INMP/MINSA, gob.pe).
   · MTPE, «Auditoría del SGSST» (gob.pe, oct. 2024): cada 2 años con actividades de alto riesgo (Anexo 5 del
     D.S. 009-97-SA, las del SCTR) y cada 3 sin ellas; con 10 trabajadores o menos y sin alto riesgo, solo cuando lo ordena
     la Inspección. El auditor, del registro del D.S. 014-2013-TR.
   · ISO 45001:2018 e ISO 14001:2015: los números y los títulos de las cláusulas 4 a 10, del índice de la vista previa
     oficial en español (webstore.ansi.org: preview_ISO+45001-2018[S] y preview_ISO+14001-2015[S]). El texto de cada
     requisito NO va (la norma es de pago): aquí va solo qué evidencia de la obra le corresponde.

   LO QUE GUARDA (sst_doc de la obra; ninguna de estas hojas sale en «Documentos»: DC_NO_DOCS)
   · «aud-evid»: la evidencia que se sube a un requisito. url = el archivo; nota = { v:1, k:'<llave del requisito>' }.
   · «aud-int», «aud-acc», «aud-rev» (Gestión): la auditoría interna, los hallazgos y la revisión por la dirección (abajo). */
var AUD_EVID='aud-evid', AUD_INT='aud-int', AUD_ACC='aud-acc', AUD_REV='aud-rev';
var AUDW={ obra:null, D:null, t:0, per:'12', sec:'ley', caja:null, n:0, msg:'', msgCl:'', C:null, R:null, cargando:null };
var AUD_EST={
  ok:   { ic:'✓', n:'Hay', cl:'ok', pdf:'HAY' },
  ojo:  { ic:'⚠', n:'Revisar', cl:'ojo', pdf:'REVISAR' },
  falta:{ ic:'✗', n:'Falta', cl:'mal', pdf:'FALTA' },
  subir:{ ic:'○', n:'Súbelo', cl:'gris', pdf:'SUBIR' },
  info: { ic:'ℹ', n:'Sin eventos', cl:'azul', pdf:'SIN EVENTOS' }
};
var AUD_ORDEN_EST=['falta', 'ojo', 'subir', 'info', 'ok'];
/* las secciones de la carpeta: la ley y las dos ISO */
var AUD_SECC=[
  { k:'ley', n:'Ley 29783 y su reglamento', corto:'Ley 29783' },
  { k:'i45', n:'ISO 45001:2018', corto:'ISO 45001' },
  { k:'i14', n:'ISO 14001:2015', corto:'ISO 14001' }
];
/* ── LO QUE PIDE LA LEY (D.S. 005-2012-TR y Ley 29783), con los títulos de la norma ──────────────────────────────── */
var AUD_LEY=[
  { g:'Documentos del sistema de gestión', cita:'D.S. 005-2012-TR, art. 32', zip:'01 Documentos del sistema (art 32)', s:[
    { k:'ley:32a', cl:'a)', t:'La política y objetivos en materia de seguridad y salud en el trabajo', ev:'polobj', z:'a Politica y objetivos' },
    { k:'ley:32b', cl:'b)', t:'El Reglamento Interno de Seguridad y Salud en el Trabajo', ev:'risst', z:'b RISST' },
    { k:'ley:32c', cl:'c)', t:'La identificación de peligros, evaluación de riesgos y sus medidas de control', ev:'iperc', z:'c IPERC' },
    { k:'ley:32d', cl:'d)', t:'El mapa de riesgo', ev:'mapa', z:'d Mapa de riesgo' },
    { k:'ley:32e', cl:'e)', t:'La planificación de la actividad preventiva', ev:'planif', z:'e Planificacion de la actividad preventiva' },
    { k:'ley:32f', cl:'f)', t:'El Programa Anual de Seguridad y Salud en el Trabajo', ev:'prog', z:'f Programa anual de SST' } ] },
  { g:'Registros obligatorios', cita:'D.S. 005-2012-TR, art. 33', zip:'02 Registros obligatorios (art 33)',
    pie:'Se conservan (art. 35): el de enfermedades ocupacionales, 20 años; los de accidentes de trabajo e incidentes peligrosos, 10 años; los demás, 5 años, desde el suceso. Descarga la carpeta y guárdala: esos plazos son de la empresa.', s:[
    { k:'ley:33a', cl:'a)', t:'Registro de accidentes de trabajo, enfermedades ocupacionales, incidentes peligrosos y otros incidentes', sub:'con la investigación y las medidas correctivas', ev:'acc', z:'a Accidentes e incidentes' },
    { k:'ley:33b', cl:'b)', t:'Registro de exámenes médicos ocupacionales', ev:'emo', z:'b Examenes medicos ocupacionales' },
    { k:'ley:33c', cl:'c)', t:'Registro del monitoreo de agentes físicos, químicos, biológicos, psicosociales y factores de riesgo disergonómicos', ev:'mon', z:'c Monitoreo de agentes' },
    { k:'ley:33d', cl:'d)', t:'Registro de inspecciones internas de seguridad y salud en el trabajo', ev:'insp', z:'d Inspecciones internas' },
    { k:'ley:33e', cl:'e)', t:'Registro de estadísticas de seguridad y salud', ev:'est', z:'e Estadisticas' },
    { k:'ley:33f', cl:'f)', t:'Registro de equipos de seguridad o emergencia', ev:'equ', z:'f Equipos de seguridad o emergencia' },
    { k:'ley:33g', cl:'g)', t:'Registro de inducción, capacitación, entrenamiento y simulacros de emergencia', ev:'cap', z:'g Induccion capacitacion y simulacros' },
    { k:'ley:33h', cl:'h)', t:'Registro de auditorías', ev:'aud', z:'h Auditorias' } ] },
  { g:'Evaluación del sistema', cita:'Ley 29783 y D.S. 005-2012-TR', zip:'03 Evaluacion del sistema', s:[
    { k:'ley:r90', cl:'art. 90', t:'La revisión del sistema de gestión, por lo menos una vez al año', ev:'rev', cita:'D.S. 005-2012-TR, art. 90', z:'Revision anual del sistema' },
    { k:'ley:l43', cl:'art. 43', t:'Las auditorías periódicas del sistema de gestión, por auditores independientes', ev:'audext', cita:'Ley 29783, art. 43', z:'Auditoria independiente' } ] }
];
/* ── ISO 45001:2018: los números y los títulos de su índice; la evidencia, la de la obra ──────────────────────────── */
var AUD_I45=[
  { g:'4 Contexto de la organización', s:[
    { cl:'4.1', t:'Comprensión de la organización y de su contexto', ev:'subir', pista:'El análisis del contexto de la empresa y de la obra: lo interno y lo externo que afecta a su seguridad.' },
    { cl:'4.2', t:'Comprensión de las necesidades y expectativas de los trabajadores y de otras partes interesadas', ev:'subir', pista:'La matriz de partes interesadas: los trabajadores, el cliente, la supervisión, los contratistas, la comunidad y las autoridades.' },
    { cl:'4.3', t:'Determinación del alcance del sistema de gestión de la SST', ev:'subir', pista:'El documento que dice qué abarca el sistema: la empresa, la obra, sus frentes y sus actividades.' },
    { cl:'4.4', t:'Sistema de gestión de la SST', ev:'subir', pista:'El manual o la descripción del sistema y cómo se relacionan sus procesos.' } ] },
  { g:'5 Liderazgo y participación de los trabajadores', s:[
    { cl:'5.1', t:'Liderazgo y compromiso', ev:'lider' },
    { cl:'5.2', t:'Política de la SST', ev:'politica' },
    { cl:'5.3', t:'Roles, responsabilidades y autoridades en la organización', ev:'roles' },
    { cl:'5.4', t:'Consulta y participación de los trabajadores', ev:'particip' } ] },
  { g:'6 Planificación', s:[
    { cl:'6.1.1', p:'6.1 Acciones para abordar riesgos y oportunidades', t:'Generalidades', ev:'subir', pista:'Cómo la empresa determina sus riesgos y oportunidades y los planifica (el procedimiento o la matriz).' },
    { cl:'6.1.2', p:'6.1 Acciones para abordar riesgos y oportunidades', t:'Identificación de peligros y evaluación de los riesgos y oportunidades', ev:'iperc' },
    { cl:'6.1.3', p:'6.1 Acciones para abordar riesgos y oportunidades', t:'Determinación de los requisitos legales y otros requisitos', ev:'legal' },
    { cl:'6.1.4', p:'6.1 Acciones para abordar riesgos y oportunidades', t:'Planificación de acciones', ev:'planif' },
    { cl:'6.2.1', p:'6.2 Objetivos de la SST y planificación para lograrlos', t:'Objetivos de la SST', ev:'objetivos' },
    { cl:'6.2.2', p:'6.2 Objetivos de la SST y planificación para lograrlos', t:'Planificación para lograr los objetivos de la SST', ev:'prog' } ] },
  { g:'7 Apoyo', s:[
    { cl:'7.1', t:'Recursos', ev:'recursos' },
    { cl:'7.2', t:'Competencia', ev:'competencia' },
    { cl:'7.3', t:'Toma de conciencia', ev:'conciencia' },
    { cl:'7.4', t:'Comunicación', ev:'comunic' },
    { cl:'7.5', t:'Información documentada', ev:'docinfo' } ] },
  { g:'8 Operación', s:[
    { cl:'8.1.1', p:'8.1 Planificación y control operacional', t:'Generalidades', ev:'operac' },
    { cl:'8.1.2', p:'8.1 Planificación y control operacional', t:'Eliminar peligros y reducir riesgos para la SST', ev:'controles' },
    { cl:'8.1.3', p:'8.1 Planificación y control operacional', t:'Gestión del cambio', ev:'subir', pista:'El registro de los cambios (en procesos, equipos, personal o normas) con su evaluación de riesgos antes de hacerlos.' },
    { cl:'8.1.4', p:'8.1 Planificación y control operacional', t:'Compras', ev:'compras' },
    { cl:'8.2', t:'Preparación y respuesta ante emergencias', ev:'emerg' } ] },
  { g:'9 Evaluación del desempeño', s:[
    { cl:'9.1.1', p:'9.1 Seguimiento, medición, análisis y evaluación del desempeño', t:'Generalidades', ev:'seguim' },
    { cl:'9.1.2', p:'9.1 Seguimiento, medición, análisis y evaluación del desempeño', t:'Evaluación del cumplimiento', ev:'subir', pista:'La evaluación del cumplimiento de los requisitos legales: la matriz legal con su estado y su fecha.' },
    { cl:'9.2.1', p:'9.2 Auditoría interna', t:'Generalidades', ev:'audint' },
    { cl:'9.2.2', p:'9.2 Auditoría interna', t:'Programa de auditoría interna', ev:'audprog' },
    { cl:'9.3', t:'Revisión por la dirección', ev:'rev' } ] },
  { g:'10 Mejora', s:[
    { cl:'10.1', t:'Generalidades', ev:'subir', pista:'Cómo la empresa determina sus oportunidades de mejora (el procedimiento).' },
    { cl:'10.2', t:'Incidentes, no conformidades y acciones correctivas', ev:'nc' },
    { cl:'10.3', t:'Mejora continua', ev:'mejora' } ] }
];
/* ── ISO 14001:2015 ──────────────────────────────────────────────────────────────────────────────────────────────── */
var AUD_I14=[
  { g:'4 Contexto de la organización', s:[
    { cl:'4.1', t:'Comprensión de la organización y de su contexto', ev:'subir', pista:'El análisis del contexto ambiental de la empresa y de la obra.' },
    { cl:'4.2', t:'Comprensión de las necesidades y expectativas de las partes interesadas', ev:'subir', pista:'Las partes interesadas en lo ambiental: el cliente, la comunidad, la autoridad ambiental, los vecinos.' },
    { cl:'4.3', t:'Determinación del alcance del sistema de gestión ambiental', ev:'subir', pista:'El documento que dice qué abarca el sistema de gestión ambiental.' },
    { cl:'4.4', t:'Sistema de gestión ambiental', ev:'subir', pista:'El manual o la descripción del sistema de gestión ambiental.' } ] },
  { g:'5 Liderazgo', s:[
    { cl:'5.1', t:'Liderazgo y compromiso', ev:'lider14' },
    { cl:'5.2', t:'Política ambiental', ev:'pol14' },
    { cl:'5.3', t:'Roles, responsabilidades y autoridades en la organización', ev:'roles' } ] },
  { g:'6 Planificación', s:[
    { cl:'6.1.1', p:'6.1 Acciones para abordar riesgos y oportunidades', t:'Generalidades', ev:'subir', pista:'Cómo la empresa determina sus riesgos y oportunidades ambientales.' },
    { cl:'6.1.2', p:'6.1 Acciones para abordar riesgos y oportunidades', t:'Aspectos ambientales', ev:'aspectos' },
    { cl:'6.1.3', p:'6.1 Acciones para abordar riesgos y oportunidades', t:'Requisitos legales y otros requisitos', ev:'legal14' },
    { cl:'6.1.4', p:'6.1 Acciones para abordar riesgos y oportunidades', t:'Planificación de acciones', ev:'pma' },
    { cl:'6.2.1', p:'6.2 Objetivos ambientales y planificación para lograrlos', t:'Objetivos ambientales', ev:'obj14' },
    { cl:'6.2.2', p:'6.2 Objetivos ambientales y planificación para lograrlos', t:'Planificación de acciones para lograr los objetivos ambientales', ev:'pma' } ] },
  { g:'7 Apoyo', s:[
    { cl:'7.1', t:'Recursos', ev:'recursos' },
    { cl:'7.2', t:'Competencia', ev:'competencia' },
    { cl:'7.3', t:'Toma de conciencia', ev:'conc14' },
    { cl:'7.4', t:'Comunicación', ev:'comunic' },
    { cl:'7.5', t:'Información documentada', ev:'docs14' } ] },
  { g:'8 Operación', s:[
    { cl:'8.1', t:'Planificación y control operacional', ev:'operac14' },
    { cl:'8.2', t:'Preparación y respuesta ante emergencias', ev:'emerg' } ] },
  { g:'9 Evaluación del desempeño', s:[
    { cl:'9.1.1', p:'9.1 Seguimiento, medición, análisis y evaluación', t:'Generalidades', ev:'seg14' },
    { cl:'9.1.2', p:'9.1 Seguimiento, medición, análisis y evaluación', t:'Evaluación del cumplimiento', ev:'subir', pista:'La evaluación del cumplimiento de los requisitos legales ambientales (la matriz legal con su estado).' },
    { cl:'9.2.1', p:'9.2 Auditoría interna', t:'Generalidades', ev:'audint14' },
    { cl:'9.2.2', p:'9.2 Auditoría interna', t:'Programa de auditoría interna', ev:'audprog' },
    { cl:'9.3', t:'Revisión por la dirección', ev:'rev' } ] },
  { g:'10 Mejora', s:[
    { cl:'10.1', t:'Generalidades', ev:'subir', pista:'Cómo la empresa determina sus oportunidades de mejora ambiental.' },
    { cl:'10.2', t:'No conformidad y acción correctiva', ev:'nc14' },
    { cl:'10.3', t:'Mejora continua', ev:'mejora14' } ] }
];
/* cada requisito con su llave ('i45:6.1.2'), su norma y su carpeta del ZIP */
(function(){
  AUD_LEY.forEach(function(G){ G.s.forEach(function(r){ r.norma='ley'; r.g=G.g; r.gz=G.zip; }); });
  [['i45', AUD_I45, '04 ISO 45001'], ['i14', AUD_I14, '05 ISO 14001']].forEach(function(x){
    x[1].forEach(function(G){ G.zip=x[2]+'/'+_audAscii(G.g); G.s.forEach(function(r){ r.k=x[0]+':'+r.cl; r.norma=x[0]; r.g=G.g; r.gz=G.zip; r.z=r.cl+' '+_audAscii(r.t).slice(0, 60); }); });
  });
})();
function _audCatalogo(k){ return k==='i45' ? AUD_I45 : (k==='i14' ? AUD_I14 : AUD_LEY); }
function _audTodos(){ var L=[]; AUD_SECC.forEach(function(S){ _audCatalogo(S.k).forEach(function(G){ G.s.forEach(function(r){ L.push(r); }); }); }); return L; }
function _audReq(k){ var L=_audTodos(); for(var i=0;i<L.length;i++) if(L[i].k===k) return L[i]; return null; }
function _audAscii(s){ return String(s==null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim(); }

function _audCss(){
  if(document.getElementById('aud-css')) return;
  var st=document.createElement('style'); st.id='aud-css';
  st.textContent=[
    '.aud-res-g{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin:12px 0 0}',
    '@media (max-width:760px){ .aud-res-g{grid-template-columns:minmax(0,1fr)} }',
    '.aud-res-c{display:flex; flex-direction:column; gap:6px; border:1px solid var(--raya); border-radius:10px; padding:10px 12px; background:var(--panel); cursor:pointer; text-align:left; font:inherit; color:inherit; min-width:0}',
    '.aud-res-c:hover{border-color:var(--raya2)} .aud-res-c.on{border-color:var(--azul); box-shadow:inset 0 0 0 1px var(--azul)}',
    '.aud-res-c b{display:block; font-size:13.5px}',
    '.aud-res-n{display:flex; flex-wrap:wrap; gap:6px}',
    '.aud-cuenta{font-size:12px; font-weight:600; border-radius:999px; padding:2px 9px; font-variant-numeric:tabular-nums}',
    '.aud-cuenta.ok{background:var(--ok-f); color:var(--ok)} .aud-cuenta.ojo{background:var(--ojo-f); color:var(--ojo)} .aud-cuenta.mal{background:var(--mal-f); color:var(--mal)} .aud-cuenta.gris{background:var(--fondo); color:var(--gris)} .aud-cuenta.azul{background:var(--azul-f); color:var(--azul)}',
    '.aud-g{margin:18px 0 0}',
    '.aud-g h3{font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--gris); margin:0 0 4px}',
    '.aud-g .aud-cita{font-size:12px; color:var(--gris); margin:0 0 8px}',
    '.aud-p{font-size:12.5px; color:var(--gris); font-weight:600; margin:10px 0 4px}',
    '.aud-r{display:grid; grid-template-columns:96px minmax(0,1fr) auto; gap:12px; align-items:start; border:1px solid var(--raya); border-radius:10px; padding:10px 12px; margin:0 0 8px; background:var(--panel)}',
    '@media (max-width:760px){ .aud-r{grid-template-columns:minmax(0,1fr)} }',
    '.aud-st{font-size:12px; font-weight:700; border-radius:7px; padding:4px 8px; text-align:center; white-space:nowrap}',
    '.aud-st.ok{background:var(--ok-f); color:var(--ok)} .aud-st.ojo{background:var(--ojo-f); color:var(--ojo)} .aud-st.mal{background:var(--mal-f); color:var(--mal)} .aud-st.gris{background:var(--fondo); color:var(--gris)} .aud-st.azul{background:var(--azul-f); color:var(--azul)}',
    '.aud-tx{min-width:0; display:flex; flex-direction:column; gap:3px; font-size:13.5px}',
    '.aud-tx b{font-weight:600; color:var(--tinta)} .aud-tx .aud-cl{color:var(--gris); font-weight:600; margin-right:4px; font-variant-numeric:tabular-nums}',
    '.aud-tx small{color:var(--gris); font-size:12.5px; line-height:1.45}',
    '.aud-tx details{margin:2px 0 0} .aud-tx summary{cursor:pointer; font-size:12.5px; color:var(--azul)}',
    '.aud-det{list-style:none; margin:6px 0 0; padding:0; display:grid; gap:3px}',
    '.aud-det li{font-size:12.5px; display:flex; gap:8px; align-items:baseline; min-width:0}',
    '.aud-det li .f{color:var(--gris); font-variant-numeric:tabular-nums; flex:none; min-width:74px}',
    '.aud-det li .t{min-width:0; overflow-wrap:anywhere} .aud-det li.mal .t{color:var(--mal)}',
    '.aud-det li button{font-size:12px}',
    '.aud-bt{display:flex; flex-wrap:wrap; gap:6px; justify-content:flex-end}',
    '@media (max-width:760px){ .aud-bt{justify-content:flex-start} }',
    '.aud-subir{position:relative; overflow:hidden} .aud-subir input{position:absolute; inset:0; opacity:0; cursor:pointer}',
    '.aud-nota{font-size:12.5px; color:var(--gris); border-left:3px solid var(--raya2); padding:2px 0 2px 9px; margin:4px 0 0}',
    '.aud-pie{font-size:12.5px; color:var(--gris); margin:4px 0 0}',
    '.aud-prog{display:block; height:6px; border-radius:99px; background:var(--fondo); overflow:hidden} .aud-prog i{display:block; height:100%; background:var(--ok)}',
    '#aud-per{width:auto; max-width:300px; min-width:0}'
  ].join('\n');
  document.head.appendChild(st);
}

/* ══ LO DE LA OBRA: DE LA NUBE, UNA VEZ (20 s de memoria) ═════════════════════════════════════════════════════════
   Se trae lo de los últimos años (desde el 1 de enero de hace tres años) y cada periodo se corta aquí. */
var AUD_HOJAS_NOTA=['ges-act', 'ges-prog', 'ges-objetivos', 'sal-reg', 'amb-reg', 'quienes', 'iperc', 'frentes', AUD_EVID, AUD_INT, AUD_ACC, AUD_REV];
function _audDesdeDatos(){ return (+hoyISO().slice(0, 4)-3)+'-01-01'; }
function audTraer(fresco){
  var O=YO.obra||{}, oid=O.id;
  if(!fresco && AUDW.obra===oid && AUDW.D && Date.now()-AUDW.t<20000) return Promise.resolve(AUDW.D);
  if(!fresco && AUDW.cargando && AUDW.cargandoDe===oid) return AUDW.cargando;
  var nada=function(){ return null; }, d0=_audDesdeDatos(), t0=_enc(new Date(d0+'T00:00:00').toISOString());
  /* con lo que el servidor tenga: si una columna no existe (un SQL viejo), un 400, y se pide con menos */
  var pide=function(tabla, sels, extra, tope){
    var i=0;
    function prueba(){ return traerTodo(tabla, '&select='+sels[i]+(extra||''), tope).catch(function(c){ if(c===400 && i+1<sels.length){ i++; return prueba(); } throw c; }); }
    return prueba().catch(nada);
  };
  var P=[
    pide('sst_trabajador', ['id,nombre,puesto,area,estatus,ingreso', 'id,nombre,puesto,estatus'], '&order=nombre.asc', 6000),
    pide('sst_accidente', ['id,fecha,hora,clase,t_nombre,t_puesto,lugar,dias,causas,medidas,responsable,plazo', 'id,fecha,clase,dias,medidas'], '&fecha=gte.'+d0+'&order=fecha.desc', 4000),
    pide('sst_reporte', ['id,fecha,creado,cerrado,estado,clase', 'id,fecha,creado,estado,clase'], '&creado=gte.'+t0+'&order=creado.desc', 10000),
    pide('sst_inspeccion', ['id,fecha,tipo,inspector', 'id,fecha,tipo'], '&fecha=gte.'+d0+'&order=fecha.desc', 8000),
    pide('sst_hht', ['fecha,ob_n,ob_h,st_n,st_h,creado', 'fecha,ob_n,ob_h,st_n,st_h'], '&fecha=gte.'+d0+'&order=fecha.desc', 8000),
    pide('sst_constancia', ['fecha,tema,resultado'], '&fecha=gte.'+d0+'&order=fecha.desc', 20000),
    pide('sst_asist', ['id,tipo,tema,inicio,minutos,estado'], '&inicio=gte.'+t0+'&order=inicio.desc', 8000),
    pide('sst_kardex', ['fecha,epp,cantidad'], '&fecha=gte.'+d0+'&order=fecha.desc', 20000),
    traerTodo('sst_doc', '&url=not.is.null&select=id,hoja,nombre,url,creado&order=creado.desc', 8000).catch(nada),
    traerTodo('sst_doc', '&hoja=in.('+AUD_HOJAS_NOTA.join(',')+')&select=id,hoja,nombre,url,nota,creado&order=creado.desc', 6000).catch(nada),
    (O.codigo ? estadoLeerP('comite_emp:'+O.codigo).then(function(f){ return (f && f.valor) || null; }).catch(nada) : Promise.resolve(null)),
    ((typeof planWebTrae!=='function' || planWebTrae('emo')) ? sbRpc('sst_emo_resumen', { p_emp:oid }).then(function(j){ return (j && j.ok!==false && Array.isArray(j.lista)) ? j.lista : null; }).catch(nada) : Promise.resolve(null)),
    pide('sst_ind_reg', ['trabajador,cuando'], '&cuando=gte.'+t0+'&order=cuando.desc', 20000),
    traer('sst_boletin', '&select=id,titulo,desde,creado&order=creado.desc', 400).catch(nada),
    pide('sst_difusion', ['id,fecha'], '&fecha=gte.'+d0+'&order=fecha.desc', 8000),
    pide('sst_equipo_qr', ['id,codigo,tipo,estado'], '&order=codigo.asc', 5000),
    pide('sst_equipo_insp', ['id,fecha,resultado'], '&fecha=gte.'+d0+'&order=fecha.desc', 20000),
    traer('sst_buena', '&select=id,fecha,titulo&order=fecha.desc', 2000).catch(nada),
    traer('sst_sugerencia', '&select=id,creado&order=creado.desc', 3000).catch(nada),
    traer('sst_requerimiento', '&select=id,creado,estado&order=creado.desc', 2000).catch(nada),
    traer('sst_msds', '&select=id,producto,ficha_url&order=producto.asc', 3000).catch(nada),
    traerTodo('sst_doc', '&hoja=in.(ats,petar)&creado=gte.'+t0+'&select=id,hoja,creado&order=creado.desc', 20000).catch(nada)
  ];
  var pr=Promise.all(P).then(function(r){
    var D={ obra:oid, trab:r[0]||[], acc:r[1]||[], rep:r[2]||[], insp:r[3]||[], hht:r[4]||[], cons:r[5]||[], asis:r[6]||[], kar:r[7]||[],
            docs:r[8]||[], notas:r[9]||[], com:r[10], emo:r[11], ind:r[12]||[], bol:r[13]||[], dif:r[14]||[], eq:r[15]||[], eqi:r[16]||[],
            buena:r[17]||[], sug:r[18]||[], req:r[19]||[], msds:r[20]||[], atsPetar:r[21]||[], desdeDatos:d0, sinEmo:r[11]===null };
    if((YO.obra||{}).id===oid){ AUDW.obra=oid; AUDW.D=D; AUDW.t=Date.now(); AUDW.C=null; }
    AUDW.cargando=null;
    return D;
  }, function(e){ AUDW.cargando=null; throw e; });
  AUDW.cargando=pr; AUDW.cargandoDe=oid;
  return pr;
}

/* ── el periodo ── */
function _audFinMes(mm){ var y=+mm.slice(0, 4), m=+mm.slice(5, 7); return mm+'-'+dos(new Date(y, m, 0).getDate()); }
function _audIso(d){ return d.getFullYear()+'-'+dos(d.getMonth()+1)+'-'+dos(d.getDate()); }
function _audUltAuditoria(C){ var L=(C && C.audHechas) || []; return L.length ? L[0].fecha : ''; }
function audPeriodo(k, ult){
  var hoy=hoyISO(), a=+hoy.slice(0, 4);
  if(k==='anio') return { k:k, desde:a+'-01-01', hasta:hoy, n:'Este año ('+a+')' };
  if(k==='pasado') return { k:k, desde:(a-1)+'-01-01', hasta:(a-1)+'-12-31', n:'El año pasado ('+(a-1)+')' };
  if(k==='aud' && ult && ult<hoy){ var d0=_audDesdeDatos(), de=ult<d0 ? d0 : ult; return { k:k, desde:de, hasta:hoy, n:'Desde la última auditoría ('+_audF(ult)+')', corto:ult<d0 }; }
  var d=new Date(hoy+'T12:00:00'); d.setFullYear(d.getFullYear()-1); d.setDate(d.getDate()+1);
  return { k:'12', desde:_audIso(d), hasta:hoy, n:'Los últimos 12 meses' };
}
function _audF(iso){ return iso ? fechaLarga(String(iso).slice(0, 10)) : ''; }
function _audN(n, uno, varios){ return n+' '+(n===1 ? uno : varios); }
function _audY(L){ L=(L||[]).filter(Boolean); return L.length<2 ? (L[0]||'') : L.slice(0, -1).join(', ')+' y '+L[L.length-1]; }
function _audNum(n){ return Math.round(n||0).toLocaleString('es-PE'); }
function _audDec(n, d){ if(n==null || !isFinite(n)) return '—'; d=(d==null) ? 2 : d; return Number(n).toLocaleString('es-PE', { minimumFractionDigits:d, maximumFractionDigits:d }); }
var AUD_MESES=['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
function _audMesN(mm){ return (AUD_MESES[+String(mm).slice(5, 7)-1]||'')+' '+String(mm).slice(0, 4); }
function _audMesesTx(L){ return L.length>4 ? _audN(L.length, 'mes', 'meses')+' ('+L.slice(0, 3).map(_audMesN).join(', ')+'…)' : L.map(_audMesN).join(', '); }
function _audDias(a, b){ return Math.round((Date.parse(String(b).slice(0, 10)+'T12:00:00')-Date.parse(String(a).slice(0, 10)+'T12:00:00'))/864e5); }
function _audNota(r){ var d=nota(r && r.nota); return (d && typeof d==='object' && !Array.isArray(d)) ? d : null; }
var AUD_PROG_N={ sst:'Programa anual de SST', cap:'Programa de capacitación', insp:'Programa de inspecciones', sim:'Programa de simulacros', camp:'Programa de campañas', mon:'Programa de monitoreo ocupacional', aud:'Programa de auditorías' };
var AUD_AUD_TIPO={ interna:'interna', cliente:'del cliente', certificacion:'de certificación', otra:'otra' };
var AUD_LES={ leve:1, incap:1, mortal:1 };
var AUD_APT={ apto:'Apto', apto_restr:'Apto con restricciones', no_apto:'No apto', observado:'Observado' };
var AUD_EMO_EST={ vencido:'Vencido', por_vencer:'Por vencer', sin:'Sin examen', vigente:'Vigente', sin_proximo:'Sin próximo' };

/* ══ EL CONTEXTO: LO DE LA OBRA, CORTADO AL PERIODO ═══════════════════════════════════════════════════════════════ */
function audContexto(D, per){
  var hoy=hoyISO(), en=function(f){ f=String(f||'').slice(0, 10); return !!f && f>=per.desde && f<=per.hasta; };
  var C={ D:D, per:per, hoy:hoy, en:en, anios:{} };
  for(var y=+per.desde.slice(0, 4); y<=+per.hasta.slice(0, 4); y++) C.anios[String(y)]=1;
  /* los meses del periodo y los ya cerrados (completos dentro del periodo y terminados antes de hoy) */
  C.meses=[]; (function(){ var y=+per.desde.slice(0, 4), m=+per.desde.slice(5, 7), yh=+per.hasta.slice(0, 4), mh=+per.hasta.slice(5, 7), t=0;
    while((y<yh || (y===yh && m<=mh)) && t++<60){ C.meses.push(y+'-'+dos(m)); m++; if(m>12){ m=1; y++; } } })();
  C.cerr=C.meses.filter(function(mm){ return mm+'-01'>=per.desde && _audFinMes(mm)<=per.hasta && _audFinMes(mm)<hoy; });
  /* los documentos de las carpetas, por su carpeta (la de la app: dcCarpetaDe), los más nuevos primero */
  C.docs={}; C.nDocs=0; C.nDocsPer=0;
  (D.docs||[]).forEach(function(r){
    if(!r || !r.url || (typeof DC_NO_DOCS==='object' && DC_NO_DOCS[r.hoja]) || r.hoja===AUD_EVID) return;
    var b=(typeof dcCarpetaDe==='function') ? (dcCarpetaDe(r.hoja).base || r.hoja) : r.hoja;
    (C.docs[b]=C.docs[b]||[]).push(r);
    if(typeof dcEsDoc!=='function' || dcEsDoc(r.hoja)){ C.nDocs++; if(en(r.creado)) C.nDocsPer++; }
  });
  /* lo que va en «nota»: lo hecho a mano en la web, los programas, la salud, el ambiente, los frentes y lo de esta sección */
  C.act={ cap:[], sim:[], camp:[], mon:[], aud:[] }; C.progs=[]; C.objs=[]; C.ipercPap=[]; C.quienes=[]; C.evid={}; C.int=[]; C.hall=[]; C.revs=[];
  var salR=[], ambR=[], freR=[];
  (D.notas||[]).forEach(function(r){
    if(!r) return;
    var h=r.hoja, d;
    if(h==='ges-act'){ d=_audNota(r); if(d && C.act[d.k]) C.act[d.k].push({ id:r.id, creado:r.creado, d:d }); }
    else if(h==='ges-prog'){ d=_audNota(r); if(d && d.k==='prog') C.progs.push({ id:r.id, d:d }); }
    else if(h==='ges-objetivos'){ d=_audNota(r); if(d && d.k==='obj') C.objs.push({ id:r.id, d:d }); }
    else if(h==='sal-reg') salR.push(r);
    else if(h==='amb-reg') ambR.push(r);
    else if(h==='quienes') C.quienes.push(r);
    else if(h==='frentes') freR.push(r);
    else if(h==='iperc'){ if(!r.url && /^\s*\{/.test(String(r.nota||''))) C.ipercPap.push(r); }
    else if(h===AUD_EVID){ d=_audNota(r); if(d && d.k && r.url) (C.evid[d.k]=C.evid[d.k]||[]).push(r); }
    else if(h===AUD_INT){ d=_audNota(r); if(d) C.int.push({ id:r.id, creado:r.creado, d:d }); }
    else if(h===AUD_ACC){ d=_audNota(r); if(d) C.hall.push({ id:r.id, creado:r.creado, d:d }); }
    else if(h===AUD_REV){ d=_audNota(r); if(d) C.revs.push({ id:r.id, creado:r.creado, d:d }); }
  });
  C.sal=(typeof salFilas==='function') ? salFilas(salR).filter(function(x){ return en(x.d.fecha); }) : [];
  C.amb=(typeof ambFilas==='function') ? ambFilas(ambR).filter(function(x){ return en(x.d.fecha); }) : [];
  C.frentes=freR.map(function(r){ var d=_audNota(r) || {}; return { id:d.id || r.id, n:String(d.n || r.nombre || '').trim(), antes:Array.isArray(d.antes) ? d.antes : [] }; }).filter(function(f){ return f.n; });
  C.progsPer=C.progs.filter(function(x){ return C.anios[String(x.d.anio)]; });
  C.objsPer=C.objs.filter(function(x){ return C.anios[String(x.d.anio)]; }).sort(function(a, b){ return String(b.d.anio).localeCompare(String(a.d.anio)); });
  C.objAnio=C.objsPer.length ? { anio:C.objsPer[0].d.anio, n:(C.objsPer[0].d.items||[]).length } : null;
  /* los eventos: accidentes, reportes, inspecciones */
  C.acc=(D.acc||[]).filter(function(a){ return en(a.fecha); });
  C.rep=(D.rep||[]).filter(function(x){ return en(x.fecha||x.creado); });
  C.repCerr=C.rep.filter(reporteCerrado).length;
  C.insp=(D.insp||[]).filter(function(i){ return en(i.fecha); });
  C.inspMes={}; C.insp.forEach(function(i){ var m=String(i.fecha).slice(0, 7); C.inspMes[m]=(C.inspMes[m]||0)+1; });
  C.eqi=(D.eqi||[]).filter(function(i){ return en(i.fecha); });
  /* las horas hombre: un día, una fila (la más nueva); y los índices del periodo, con la cuenta del informe del mes */
  var visto={}; C.hhtMes={}; C.HHT=0;
  (D.hht||[]).forEach(function(x){ var f=String(x.fecha||'').slice(0, 10); if(!f || visto[f] || !en(f)) return; visto[f]=1;
    var h=(parseFloat(x.ob_n)||0)*(parseFloat(x.ob_h)||0)+(parseFloat(x.st_n)||0)*(parseFloat(x.st_h)||0), m=f.slice(0, 7);
    C.hhtMes[m]=(C.hhtMes[m]||0)+h; C.HHT+=h; });
  C.accMes={}; C.nIF=0; C.diasPerd=0;
  C.acc.forEach(function(a){ var m=String(a.fecha).slice(0, 7), dd=parseInt(a.dias, 10)||0, q=C.accMes[m]=C.accMes[m]||{ n:0, d:0 };
    if(ACC_CUENTA[a.clase]){ q.n++; C.nIF++; } q.d+=dd; C.diasPerd+=dd; });
  C.IF=C.HHT ? C.nIF*1e6/C.HHT : null; C.IS=C.HHT ? C.diasPerd*1e6/C.HHT : null;
  /* la capacitación: las constancias (una capacitación es un tema en un día, no cada persona), las hechas a mano, las charlas */
  var vc={}; C.capL=[];
  (D.cons||[]).forEach(function(c){ if(!c || !en(c.fecha)) return; var f=String(c.fecha).slice(0, 10), t=temaLimpio(c.tema)||'Capacitación', q=t.toLowerCase()+'|'+f;
    if(vc[q]){ vc[q].n++; return; } vc[q]={ f:f, t:t, n:1, de:'app' }; C.capL.push(vc[q]); });
  C.act.cap.forEach(function(x){ if(en(x.d.fecha)) C.capL.push({ f:String(x.d.fecha).slice(0, 10), t:x.d.tema||'Capacitación', n:(x.d.gente||[]).length, de:'web', ev:x.d.ev||[] }); });
  C.capL.sort(function(a, b){ return b.f.localeCompare(a.f); });
  C.nCons=(D.cons||[]).filter(function(c){ return c && en(c.fecha); }).length;
  C.asis=(D.asis||[]).filter(function(s){ return en(_audLocal(s.inicio)); });
  C.charlas=C.asis.filter(function(s){ return !/induc/i.test(String(s.tipo||'')); });
  var vi={}; (D.ind||[]).forEach(function(x){ if(x && en(_audLocal(x.cuando)) && x.trabajador) vi[x.trabajador]=1; });
  C.nInd=Object.keys(vi).length+C.asis.filter(function(s){ return /induc/i.test(String(s.tipo||'')); }).length;
  C.simL=C.act.sim.filter(function(x){ return x.d.estado==='hecho' && en(x.d.fecha); }).map(function(x){ return { f:String(x.d.fecha).slice(0, 10), t:(x.d.escenario || x.d.tipo || 'Simulacro'), d:x.d }; });
  C.simDocs=[]; Object.keys(C.docs).forEach(function(b){ if(b==='simulacro') C.docs[b].forEach(function(r){ if(en(r.creado)) C.simDocs.push(r); }); });
  C.campL=C.act.camp.filter(function(x){ var a=String(x.d.desde||'').slice(0, 10), b=String(x.d.hasta||x.d.desde||'').slice(0, 10); return a && a<=per.hasta && b>=per.desde && x.d.estado!=='anulada'; });
  C.monL=C.act.mon.filter(function(x){ return x.d.estado==='hecho' && en(x.d.fecha); });
  C.monSal=C.sal.filter(function(x){ return x.d.k==='mon'; });
  /* las auditorías: las registradas en «Programas del año» y las internas de esta sección (cerradas), las más nuevas primero */
  C.audHechas=[];
  C.act.aud.forEach(function(x){ if(x.d.estado==='hecho' && x.d.fecha) C.audHechas.push({ f:String(x.d.fecha).slice(0, 10), fecha:String(x.d.fecha).slice(0, 10), t:x.d.nombre||'Auditoría', tipo:x.d.tipo||'otra', emp:x.d.emp||'', nc:x.d.nc, obsn:x.d.obsn, om:x.d.om, ev:x.d.ev||[], de:'ges', id:x.id, int:x.d.int||'' }); });
  C.int.forEach(function(x){ if(x.d.estado==='cerrada' && x.d.fecha && !C.audHechas.some(function(a){ return a.int===x.id; })) C.audHechas.push({ f:String(x.d.fecha).slice(0, 10), fecha:String(x.d.fecha).slice(0, 10), t:x.d.nombre||'Auditoría interna', tipo:'interna', emp:(x.d.lider||{}).n||'', de:'int', id:x.id }); });
  C.audHechas.sort(function(a, b){ return b.fecha.localeCompare(a.fecha); });
  C.revL=C.revs.filter(function(x){ return x.d.fecha && x.d.estado!=='borrador'; }).sort(function(a, b){ return String(b.d.fecha).localeCompare(String(a.d.fecha)); });
  /* los hallazgos: abiertos, vencidos y cerrados */
  C.hall.forEach(function(x){ var d=x.d; x.cerrado=(d.estado==='cerrada'); x.vencido=!x.cerrado && !!d.plazo && String(d.plazo).slice(0, 10)<hoy; });
  /* el comité: sus actas del periodo (sin las quitadas) y cuántos son */
  C.com=null;
  if(D.com && typeof D.com==='object'){
    var q=D.com.quitadas||{}, act=(D.com.actas||[]).filter(function(a){ return a && a.id && !(q[a.id] && +q[a.id]>=(+a.ts||0)); });
    C.com={ miembros:(D.com.miembros||[]).filter(function(m){ return m && !m.sup; }).length, actas:act.filter(function(a){ return en(a.fecha); }), todas:act.length };
  }
  C.emo=D.sinEmo ? null : D.emo;
  C.kar=(D.kar||[]).filter(function(k){ return en(k.fecha); });
  C.bol=(D.bol||[]).filter(function(b){ return en(b.desde||b.creado); });
  C.dif=(D.dif||[]).filter(function(x){ return en(x.fecha); });
  C.buena=(D.buena||[]).filter(function(x){ return en(x.fecha); });
  C.sug=(D.sug||[]).filter(function(x){ return en(x.creado); });
  C.req=(D.req||[]).filter(function(x){ return en(x.creado); });
  C.ats=(D.atsPetar||[]).filter(function(x){ return x.hoja==='ats' && en(x.creado); }).length;
  C.petar=(D.atsPetar||[]).filter(function(x){ return x.hoja==='petar' && en(x.creado); }).length;
  C.activos=(D.trab||[]).filter(function(t){ return (t.estatus||'activo')==='activo'; }).length;
  return C;
}
/* una marca de tiempo (de la nube, en UTC) en el día de Lima */
function _audLocal(ts){
  if(!ts) return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(String(ts))) return String(ts);
  var t=new Date(ts); return isNaN(t) ? String(ts).slice(0, 10) : _audIso(t);
}

/* ══ LA EVIDENCIA DE CADA REQUISITO ═══════════════════════════════════════════════════════════════════════════════
   Cada función mira el contexto y contesta { st, lin (lo que hay, en una línea), det (lo que hay, uno por uno: { t, f, u
   (el archivo) | ir (la sección) , mal }), ir (las secciones donde se registra, la primera que exista), nota }. */
function _audDocs(C, bases, soloPer){
  var out=[];
  bases.forEach(function(b){ (C.docs[b]||[]).forEach(function(r){ if(!soloPer || C.en(r.creado)) out.push(r); }); });
  return out.sort(function(a, b){ return String(b.creado||'').localeCompare(String(a.creado||'')); });
}
function _audDocsDe(C, prueba, soloPer){ var b=Object.keys(C.docs).filter(prueba); return _audDocs(C, b, soloPer); }
function _audIt(r){ return { t:r.nombre||'Documento', f:String(r.creado||'').slice(0, 10), u:r.url }; }
function _audRes(st, lin, det, ir, extra){ var o={ st:st, lin:lin||'', det:det||[], ir:ir||[] }; if(extra) for(var k in extra) o[k]=extra[k]; return o; }
function _audMeses(a, b){ return Math.floor(_audDias(a, b)/30.44); }
var AUD_EV={
  subir:function(C, r){ return _audRes('subir', r.pista || 'OBRASST no lo registra: adjunta aquí tu evidencia.', []); },
  /* ── la ley: los documentos del sistema (art. 32) ── */
  polobj:function(C){
    var p=_audDocs(C, ['politicas']), o=_audDocs(C, ['objetivos']), ob=C.objAnio;
    var det=p.slice(0, 4).map(_audIt).concat(o.slice(0, 3).map(_audIt));
    if(ob) det.push({ t:'Objetivos y metas '+ob.anio+' en OBRASST ('+_audN(ob.n, 'objetivo', 'objetivos')+')', ir:'objetivos' });
    var hayO=!!(o.length || ob);
    if(p.length && hayO) return _audRes('ok', 'La política (subida el '+_audF(p[0].creado)+') y los objetivos'+(ob ? ' de '+ob.anio : ''), det, ['docs']);
    if(p.length) return _audRes('ojo', 'Está la política; faltan los objetivos del periodo', det, ['objetivos', 'docs']);
    if(hayO) return _audRes('ojo', 'Están los objetivos; falta la política', det, ['docs']);
    return _audRes('falta', 'Ni la política ni los objetivos están en la obra', [], ['docs', 'objetivos']);
  },
  politica:function(C){
    var p=_audDocs(C, ['politicas']);
    return p.length ? _audRes('ok', _audN(p.length, 'documento', 'documentos')+' · el último, subido el '+_audF(p[0].creado), p.slice(0, 5).map(_audIt), ['docs'])
                    : _audRes('falta', 'La política no está en las carpetas de la obra', [], ['docs']);
  },
  risst:function(C){
    var p=_audDocs(C, ['risst']);
    return p.length ? _audRes('ok', 'El RISST, subido el '+_audF(p[0].creado), p.slice(0, 4).map(_audIt), ['docs'])
                    : _audRes('falta', 'El RISST no está en las carpetas de la obra', [], ['docs']);
  },
  iperc:function(C){
    var d=_audDocs(C, ['iperc']), pap=C.ipercPap.slice().sort(function(a, b){ return String(b.creado||'').localeCompare(String(a.creado||'')); });
    var det=d.slice(0, 4).map(_audIt).concat(pap.slice(0, 3).map(function(x){ return { t:'IPERC armado en OBRASST'+(x.nombre ? ' · '+x.nombre : ''), f:String(x.creado||'').slice(0, 10), ir:'ats' }; }));
    if(C.ats) det.push({ t:_audN(C.ats, 'ATS', 'ATS')+' en el periodo: el análisis de cada tarea', ir:'ats' });
    var ult=[d[0] && d[0].creado, pap[0] && pap[0].creado].filter(Boolean).map(function(x){ return String(x).slice(0, 10); }).sort().pop();
    if(!ult) return _audRes('falta', 'La matriz IPERC no está en la obra', det, ['ats', 'docs']);
    if(_audDias(ult, C.hoy)>366) return _audRes('ojo', 'La última es del '+_audF(ult)+': la evaluación de riesgos se actualiza una vez al año como mínimo, o cuando cambian las condiciones de trabajo (Ley 29783, art. 57)', det, ['ats', 'docs']);
    return _audRes('ok', 'La última es del '+_audF(ult)+(C.ats ? ' · '+_audN(C.ats, 'ATS', 'ATS')+' en el periodo' : ''), det, ['ats', 'docs']);
  },
  mapa:function(C){
    var p=_audDocs(C, ['mapa-riesgos']);
    return p.length ? _audRes('ok', _audN(p.length, 'mapa', 'mapas')+' · el último, subido el '+_audF(p[0].creado), p.slice(0, 6).map(_audIt), ['docs', 'frentes'])
                    : _audRes('falta', 'El mapa de riesgos no está en las carpetas de la obra', [], ['docs', 'frentes']);
  },
  planif:function(C){
    var P=C.progsPer, d=_audDocs(C, ['prog-anual', 'prog-capacitacion', 'prog-inspeccion']);
    var det=P.slice(0, 8).map(function(x){ return { t:(AUD_PROG_N[x.d.tipo]||'Programa')+' '+x.d.anio+' · '+_audN((x.d.items||[]).length, 'actividad', 'actividades'), ir:'programas' }; }).concat(d.slice(0, 4).map(_audIt));
    if(P.length || d.length) return _audRes('ok', (P.length ? _audN(P.length, 'programa', 'programas')+' del periodo en OBRASST' : '')+(P.length && d.length ? ' · ' : '')+(d.length ? _audN(d.length, 'documento', 'documentos') : ''), det, ['programas']);
    return C.progs.length ? _audRes('ojo', 'Hay programas de otros años, ninguno de este periodo', [], ['programas']) : _audRes('falta', 'Ningún programa del año en la obra', [], ['programas']);
  },
  prog:function(C){
    var P=C.progs.filter(function(x){ return x.d.tipo==='sst'; }), del=P.filter(function(x){ return C.anios[String(x.d.anio)]; }), d=_audDocs(C, ['prog-anual']);
    var det=del.map(function(x){ return { t:'Programa anual de SST '+x.d.anio+' en OBRASST · '+_audN((x.d.items||[]).length, 'actividad', 'actividades')+((x.d.firmas||[]).some(function(f){ return f && f.nombre; }) ? ' · con sus firmantes' : ''), ir:'programas' }; }).concat(d.slice(0, 4).map(_audIt));
    if(del.length || d.some(function(r){ return C.anios[String(r.creado||'').slice(0, 4)]; })) return _audRes('ok', del.length ? 'El programa anual de SST '+del.map(function(x){ return x.d.anio; }).join(' y ')+' en OBRASST' : 'El programa anual (subido el '+_audF(d[0].creado)+')', det, ['programas']);
    if(P.length || d.length) return _audRes('ojo', 'Hay un programa anual, pero de otro año', det, ['programas']);
    return _audRes('falta', 'El programa anual de SST no está en la obra', [], ['programas']);
  },
  objetivos:function(C){
    var o=_audDocs(C, ['objetivos']), ob=C.objAnio, det=o.slice(0, 3).map(_audIt);
    if(ob) det.unshift({ t:'Objetivos y metas '+ob.anio+' en OBRASST ('+_audN(ob.n, 'objetivo', 'objetivos')+')', ir:'objetivos' });
    if(ob) return _audRes('ok', 'Los objetivos y metas de '+ob.anio+' ('+_audN(ob.n, 'objetivo', 'objetivos')+'), con su avance sacado de los programas', det, ['objetivos']);
    if(o.length) return _audRes('ok', 'Los objetivos (subidos el '+_audF(o[0].creado)+')', det, ['objetivos', 'docs']);
    return C.objs.length ? _audRes('ojo', 'Hay objetivos, pero de otro año', [], ['objetivos']) : _audRes('falta', 'Los objetivos de SST no están en la obra', [], ['objetivos']);
  },
  /* ── la ley: los registros obligatorios (art. 33) ── */
  acc:function(C){
    var L=C.acc, les=L.filter(function(a){ return AUD_LES[a.clase]; }).length, inc=L.length-les, sin=L.filter(function(a){ return !String(a.medidas||'').trim(); });
    var nota='Las enfermedades ocupacionales no tienen un registro aparte en OBRASST: si hubo alguna, adjunta aquí su registro.';
    var det=L.slice(0, 40).map(function(a){ var m=!String(a.medidas||'').trim();
      return { t:(ACC_NOMBRE[a.clase]||a.clase||'Evento')+(a.lugar ? ' · '+a.lugar : '')+(a.dias ? ' · '+_audN(parseInt(a.dias, 10)||0, 'día', 'días')+' de descanso' : '')+(m ? ' · sin medidas correctivas' : ''), f:String(a.fecha||'').slice(0, 10), mal:m }; });
    if(!L.length) return _audRes('info', 'Sin accidentes ni incidentes registrados en el periodo', [], ['acc'], { nota:nota });
    var lin=_audN(les, 'accidente', 'accidentes')+' y '+_audN(inc, 'incidente', 'incidentes');
    if(sin.length) return _audRes('ojo', lin+' · '+_audN(sin.length, 'sin medidas correctivas', 'sin medidas correctivas')+': su investigación va en el registro', det, ['acc'], { nota:nota });
    return _audRes('ok', lin+', cada uno con sus medidas correctivas', det, ['acc'], { nota:nota });
  },
  emo:function(C){
    if(C.emo===null) return _audR_emoNo();
    var R=(typeof salEmo==='function') ? salEmo(C.emo, C.hoy.slice(0, 7), C.hoy) : { n:0, vig:0, por:0, venc:0, sin:0, L:[] };
    var det=(R.L||[]).slice(0, 25).map(function(x){ return { t:(x.nombre||'Trabajador')+' · '+(AUD_EMO_EST[x.est]||x.est)+(x.proximo ? ' · el próximo, '+_audF(x.proximo) : ''), mal:x.est==='vencido' || x.est==='sin' }; });
    var nota='Solo la vigencia y la aptitud: el detalle médico no va a la carpeta.';
    if(!R.n) return _audRes('falta', 'Ningún EMO registrado en la obra', [], ['emo'], { nota:nota });
    var lin=_audN(R.vig, 'vigente', 'vigentes')+(R.por ? ' · '+R.por+' por vencer' : '')+(R.venc ? ' · '+_audN(R.venc, 'vencido', 'vencidos') : '')+(R.sin ? ' · '+R.sin+' sin examen' : '');
    return _audRes((R.venc || R.sin) ? 'ojo' : 'ok', lin, det, ['emo'], { nota:nota });
  },
  mon:function(C){
    var d=_audDocs(C, ['so-monitoreo'], true), fuera=C.monL.filter(function(x){ return x.d.res==='fuera'; }).length+C.monSal.filter(function(x){ return x.d.res==='fuera'; }).length;
    var det=C.monL.map(function(x){ var ev=(x.d.ev||[])[0]; return { t:(x.d.nombre||'Monitoreo')+(x.d.emp ? ' · '+x.d.emp : '')+(x.d.res==='fuera' ? ' · algo fuera de los límites' : (x.d.res==='ok' ? ' · dentro de los límites' : '')), f:String(x.d.fecha).slice(0, 10), u:ev ? ev.u : '', mal:x.d.res==='fuera' }; })
      .concat(C.monSal.map(function(x){ var ev=(x.d.ev||[])[0]; return { t:(typeof salNombre==='function' && typeof SAL_AGENTES!=='undefined' ? salNombre(SAL_AGENTES, x.d.agente) : x.d.agente)+(x.d.lugar ? ' · '+x.d.lugar : '')+(x.d.res==='fuera' ? ' · supera el límite' : ''), f:x.d.fecha, u:ev ? ev.u : '', mal:x.d.res==='fuera' }; }))
      .concat(d.slice(0, 6).map(_audIt));
    var n=C.monL.length+C.monSal.length+d.length;
    if(!n) return _audRes('falta', 'Ningún monitoreo de agentes registrado en el periodo', [], ['programas', 'inf-salud']);
    var lin=_audN(n, 'monitoreo o informe', 'monitoreos e informes');
    return fuera ? _audRes('ojo', lin+' · '+_audN(fuera, 'con algo fuera de los límites', 'con algo fuera de los límites')+': sus medidas de control van en el registro', det, ['programas', 'inf-salud'])
                 : _audRes('ok', lin, det, ['programas', 'inf-salud']);
  },
  insp:function(C){
    var sin=C.cerr.filter(function(m){ return !C.inspMes[m]; });
    var det=C.insp.slice(0, 30).map(function(i){ return { t:(i.tipo||'Inspección')+(i.inspector ? ' · '+i.inspector : ''), f:String(i.fecha).slice(0, 10) }; });
    var extra=C.eqi.length ? ' · '+_audN(C.eqi.length, 'inspección diaria de equipos', 'inspecciones diarias de equipos') : '';
    if(!C.insp.length) return _audRes(C.eqi.length ? 'ojo' : 'falta', 'Ninguna inspección interna registrada en el periodo'+extra, det, ['insp']);
    if(sin.length) return _audRes('ojo', _audN(C.insp.length, 'inspección', 'inspecciones')+extra+' · sin inspecciones en '+_audMesesTx(sin), det, ['insp']);
    return _audRes('ok', _audN(C.insp.length, 'inspección', 'inspecciones')+(C.cerr.length ? ', todos los meses' : '')+extra, det, ['insp']);
  },
  est:function(C){
    var sin=C.cerr.filter(function(m){ return !C.hhtMes[m]; });
    var det=C.meses.map(function(m){ var h=C.hhtMes[m]||0, a=C.accMes[m]||{ n:0, d:0 }, cerrado=C.cerr.indexOf(m)>-1;
      return { t:_audMesN(m)+': '+_audNum(h)+' HHT · '+_audN(a.n, 'accidente con descanso', 'accidentes con descanso')+' · '+_audN(a.d, 'día perdido', 'días perdidos'), mal:cerrado && !h }; });
    var lin='Índice de frecuencia '+_audDec(C.IF, 2)+' · de severidad '+_audDec(C.IS, 1)+' en el periodo ('+_audNum(C.HHT)+' horas hombre)';
    var nota='Índice de frecuencia = accidentes con descanso × 1 000 000 / horas hombre trabajadas · de severidad = días perdidos × 1 000 000 / horas hombre (la cuenta del informe del mes).';
    if(!C.HHT) return _audRes('falta', 'Sin horas hombre registradas en el periodo: sin ellas no hay índices', det, ['hh', 'acc'], { nota:nota });
    if(sin.length) return _audRes('ojo', lin+' · faltan las horas hombre de '+_audMesesTx(sin), det, ['hh', 'acc'], { nota:nota });
    return _audRes('ok', lin, det, ['hh', 'acc'], { nota:nota });
  },
  equ:function(C){
    var und=C.kar.reduce(function(s, k){ return s+(parseInt(k.cantidad, 10)||1); }, 0), est=_audDocs(C, ['estacion-emergencia']), ext=_audDocs(C, ['cert-extintores']);
    var porE={}; C.kar.forEach(function(k){ var e=String(k.epp||'EPP'); porE[e]=(porE[e]||0)+(parseInt(k.cantidad, 10)||1); });
    var det=Object.keys(porE).sort(function(a, b){ return porE[b]-porE[a]; }).slice(0, 10).map(function(e){ return { t:e+' · '+_audN(porE[e], 'unidad entregada', 'unidades entregadas'), ir:'kardex' }; })
      .concat(est.slice(0, 3).map(_audIt)).concat(ext.slice(0, 3).map(_audIt));
    if((C.D.eq||[]).length) det.push({ t:_audN(C.D.eq.length, 'equipo con su QR', 'equipos con su QR')+' en la obra', ir:'equipos' });
    var partes=[]; if(C.kar.length) partes.push(_audN(C.kar.length, 'entrega de EPP', 'entregas de EPP')+' ('+_audNum(und)+' unidades)');
    if(est.length) partes.push('la estación de emergencia'); if(ext.length) partes.push('el certificado de extintores ('+_audF(ext[0].creado)+')');
    if((C.D.eq||[]).length) partes.push(_audN(C.D.eq.length, 'equipo con QR', 'equipos con QR'));
    if(!partes.length) return _audRes('falta', 'Ni entregas de EPP ni equipos de emergencia registrados', [], ['kardex', 'epp', 'docs']);
    return _audRes((C.kar.length && (est.length || ext.length)) ? 'ok' : 'ojo', partes.join(' · ')+((C.kar.length && !(est.length || ext.length)) ? ' · faltan la estación de emergencia o el certificado de extintores' : (!C.kar.length ? ' · sin entregas de EPP en el periodo' : '')), det, ['kardex', 'epp', 'docs']);
  },
  cap:function(C){
    var sims=C.simL.length+C.simDocs.length, f=[];
    if(!C.nInd) f.push('inducción'); if(!C.capL.length) f.push('capacitación'); if(!sims) f.push('simulacro');
    var det=C.capL.slice(0, 20).map(function(x){ return { t:'Capacitación · '+x.t+(x.n ? ' · '+_audN(x.n, 'persona', 'personas') : ''), f:x.f }; })
      .concat(C.simL.map(function(x){ return { t:'Simulacro · '+x.t, f:x.f }; })).concat(C.simDocs.slice(0, 6).map(_audIt));
    var lin=_audN(C.nInd, 'inducción', 'inducciones')+' · '+_audN(C.capL.length, 'capacitación', 'capacitaciones')+' · '+_audN(C.charlas.length, 'charla', 'charlas')+' · '+_audN(sims, 'simulacro', 'simulacros');
    if(f.length===3 && !C.charlas.length) return _audRes('falta', 'Nada registrado en el periodo', [], ['caphechas', 'induccion', 'simulacros']);
    return _audRes(f.length ? 'ojo' : 'ok', lin+(f.length ? ' · falta: '+f.join(', ') : ''), det, ['caphechas', 'induccion', 'simulacros']);
  },
  aud:function(C){
    var L=C.audHechas, pr=C.progs.filter(function(x){ return x.d.tipo==='aud' && C.anios[String(x.d.anio)]; });
    var det=L.slice(0, 10).map(function(a){ var ev=(a.ev||[])[0]; return { t:a.t+' ('+(AUD_AUD_TIPO[a.tipo]||a.tipo)+')'+(a.emp ? ' · '+a.emp : '')+(a.nc!=null || a.obsn!=null ? ' · '+(a.nc||0)+' NC, '+(a.obsn||0)+' obs.' : ''), f:a.fecha, u:ev ? ev.u : '', ir:a.de==='int' ? 'aud-int' : 'programas' }; });
    var nota='Según el MTPE: con actividades de alto riesgo (las del Anexo 5 del D.S. 009-97-SA, las del SCTR), una auditoría cada 2 años; sin ellas, cada 3. Con 10 trabajadores o menos y sin alto riesgo, solo cuando lo ordena la Inspección.';
    if(!L.length) return _audRes(pr.length ? 'ojo' : 'falta', pr.length ? 'Programadas en el programa de auditorías, ninguna registrada como realizada' : 'Ninguna auditoría registrada', [], ['programas', 'aud-int'], { nota:nota });
    var m=_audMeses(L[0].fecha, C.hoy), lin='La última: '+_audF(L[0].fecha)+' ('+L[0].t+') · '+_audN(L.length, 'auditoría registrada', 'auditorías registradas');
    if(m<=24) return _audRes('ok', lin, det, ['programas', 'aud-int'], { nota:nota });
    return _audRes(m<=36 ? 'ojo' : 'falta', lin+' · fue hace '+m+' meses', det, ['programas', 'aud-int'], { nota:nota });
  },
  /* ── la ley: la evaluación del sistema ── */
  rev:function(C){
    var L=C.revL, det=L.slice(0, 5).map(function(x){ return { t:'Revisión por la dirección'+(x.d.desde && x.d.hasta ? ' del '+_audF(x.d.desde)+' al '+_audF(x.d.hasta) : ''), f:String(x.d.fecha).slice(0, 10), ir:'aud-rev' }; });
    var gest=!(typeof planWebFalta==='function' && planWebFalta('aud-rev'));
    if(!L.length) return _audRes('falta', gest ? 'Ninguna revisión por la dirección registrada: se hace en «Revisión por la dirección»' : 'Ninguna revisión por la dirección: adjunta aquí su acta (con Gestión SST se hace en OBRASST)', [], ['aud-rev']);
    var d=_audDias(L[0].d.fecha, C.hoy);
    if(d<=366) return _audRes('ok', 'La última: '+_audF(L[0].d.fecha), det, ['aud-rev']);
    return _audRes('ojo', 'La última fue el '+_audF(L[0].d.fecha)+': la revisión es por lo menos una vez al año (D.S. 005-2012-TR, art. 90)', det, ['aud-rev']);
  },
  audext:function(C){
    var L=C.audHechas.filter(function(a){ return a.tipo!=='interna'; });
    var det=L.slice(0, 6).map(function(a){ var ev=(a.ev||[])[0]; return { t:a.t+' ('+(AUD_AUD_TIPO[a.tipo]||a.tipo)+')'+(a.emp ? ' · '+a.emp : ''), f:a.fecha, u:ev ? ev.u : '', ir:'programas' }; });
    var nota='El auditor, del Registro de Auditores autorizados del MTPE (D.S. 014-2013-TR). La auditoría interna de OBRASST no la reemplaza.';
    if(!L.length) return _audRes('falta', 'Ninguna auditoría externa registrada (se registra en «Programas del año» ▸ Auditorías)', [], ['programas'], { nota:nota });
    var m=_audMeses(L[0].fecha, C.hoy), lin='La última: '+_audF(L[0].fecha)+(L[0].emp ? ' · '+L[0].emp : '');
    return _audRes(m<=24 ? 'ok' : (m<=36 ? 'ojo' : 'falta'), lin+(m>24 ? ' · fue hace '+m+' meses' : ''), det, ['programas'], { nota:nota });
  },
  /* ── ISO 45001 ── */
  lider:function(C){
    var p=_audDocs(C, ['politicas']), pr=C.progs.filter(function(x){ return x.d.tipo==='sst' && C.anios[String(x.d.anio)]; }), rv=C.revL[0];
    var det=p.slice(0, 2).map(_audIt).concat(pr.map(function(x){ return { t:'Programa anual de SST '+x.d.anio, ir:'programas' }; }));
    if(rv) det.push({ t:'Revisión por la dirección', f:String(rv.d.fecha).slice(0, 10), ir:'aud-rev' });
    var partes=[]; if(p.length) partes.push('la política'); if(pr.length) partes.push('el programa anual'); if(rv && _audDias(rv.d.fecha, C.hoy)<=366) partes.push('la revisión por la dirección');
    if(!partes.length) return _audRes('falta', 'Ni la política, ni el programa anual, ni una revisión por la dirección', [], ['docs', 'programas']);
    return _audRes(p.length && pr.length ? 'ok' : 'ojo', 'Están '+_audY(partes), det, ['docs', 'programas', 'aud-rev']);
  },
  roles:function(C){
    var o=_audDocs(C, ['organigrama']), b=_audDocs(C, ['brigadistas']), mi=C.com ? C.com.miembros : 0;
    var det=o.slice(0, 3).map(_audIt).concat(b.slice(0, 2).map(_audIt));
    if(mi) det.push({ t:'Comité de SST · '+_audN(mi, 'miembro', 'miembros'), ir:'comite' });
    if(o.length) return _audRes('ok', 'El organigrama (subido el '+_audF(o[0].creado)+')'+(mi ? ' · el comité con '+_audN(mi, 'miembro', 'miembros') : ''), det, ['docs', 'cargos']);
    if(mi || b.length) return _audRes('ojo', 'Están el comité o la brigada; falta el organigrama con las responsabilidades', det, ['docs', 'cargos']);
    return _audRes('falta', 'Ni el organigrama ni las designaciones', [], ['docs', 'cargos']);
  },
  particip:function(C){
    var c=C.com, det=[];
    if(c) (c.actas||[]).slice(0, 12).forEach(function(a){ det.push({ t:'Acta del comité'+(a.n ? ' N° '+a.n : '')+(a.tipo && a.tipo!=='ordinaria' ? ' ('+a.tipo+')' : ''), f:String(a.fecha||'').slice(0, 10), ir:'comite' }); });
    if(C.sug.length) det.push({ t:_audN(C.sug.length, 'sugerencia del buzón', 'sugerencias del buzón'), ir:'reportes' });
    if(C.rep.length) det.push({ t:_audN(C.rep.length, 'reporte de actos y condiciones', 'reportes de actos y condiciones'), ir:'reportes' });
    if(!c || !c.miembros) return _audRes(C.rep.length || C.sug.length ? 'ojo' : 'falta', 'El comité (o el supervisor) de SST no está registrado en OBRASST'+(C.rep.length ? ' · '+_audN(C.rep.length, 'reporte', 'reportes')+' de la gente' : ''), det, ['comite']);
    if(!c.actas.length) return _audRes('ojo', 'El comité con '+_audN(c.miembros, 'miembro', 'miembros')+', sin actas en el periodo', det, ['comite']);
    return _audRes('ok', 'El comité con '+_audN(c.miembros, 'miembro', 'miembros')+' · '+_audN(c.actas.length, 'acta', 'actas')+' en el periodo'+(C.sug.length ? ' · '+_audN(C.sug.length, 'sugerencia', 'sugerencias') : ''), det, ['comite']);
  },
  legal:function(){ return _audRes('subir', 'Tu matriz de requisitos legales y otros requisitos (los del cliente, por ejemplo). La biblioteca de normas de OBRASST te ayuda a armarla.', [], ['normas']); },
  legal14:function(){ return _audRes('subir', 'Tu matriz de requisitos legales ambientales y otros requisitos. La biblioteca de normas de OBRASST te ayuda a armarla.', [], ['normas']); },
  recursos:function(C){
    var pr=C.progs.filter(function(x){ return x.d.tipo==='sst' && C.anios[String(x.d.anio)] && (String(x.d.pres||'').trim() || String(x.d.rec||'').trim()); });
    if(pr.length) return _audRes('ok', 'El presupuesto y los recursos del programa anual de SST '+pr[0].d.anio, [{ t:[String(pr[0].d.pres||'').trim() ? 'Presupuesto: '+String(pr[0].d.pres).trim() : '', String(pr[0].d.rec||'').trim() ? 'Recursos: '+String(pr[0].d.rec).trim() : ''].filter(Boolean).join(' · '), ir:'programas' }], ['programas']);
    return _audRes('subir', 'El presupuesto de SST y los recursos asignados (personas, equipos, horas). Se pueden escribir en el programa anual de SST.', [], ['programas']);
  },
  competencia:function(C){
    var ce=_audDocsDe(C, function(b){ return /^cert-|^certificados/.test(b); });
    var det=C.capL.slice(0, 12).map(function(x){ return { t:x.t+(x.n ? ' · '+_audN(x.n, 'persona', 'personas') : ''), f:x.f }; }).concat(ce.slice(0, 8).map(_audIt));
    if(!C.capL.length && !ce.length) return _audRes('falta', 'Ni capacitaciones ni certificados en el periodo', [], ['caphechas', 'cump', 'matriz', 'docs']);
    return _audRes(C.capL.length ? 'ok' : 'ojo', _audN(C.capL.length, 'capacitación', 'capacitaciones')+(C.nCons ? ' · '+_audN(C.nCons, 'evaluación rendida', 'evaluaciones rendidas') : '')+(ce.length ? ' · '+_audN(ce.length, 'certificado', 'certificados') : ''), det, ['caphechas', 'cump', 'matriz', 'docs']);
  },
  conciencia:function(C){
    var det=C.charlas.slice(0, 12).map(function(s){ return { t:'Charla · '+(s.tema||'—')+(s.minutos ? ' · '+s.minutos+' min' : ''), f:_audLocal(s.inicio) }; })
      .concat(C.campL.slice(0, 6).map(function(x){ return { t:'Campaña · '+(x.d.nombre||'—'), f:String(x.d.desde||'').slice(0, 10) }; }));
    var partes=[]; if(C.nInd) partes.push(_audN(C.nInd, 'inducción', 'inducciones')); if(C.charlas.length) partes.push(_audN(C.charlas.length, 'charla', 'charlas'));
    if(C.campL.length) partes.push(_audN(C.campL.length, 'campaña', 'campañas')); if(C.dif.length) partes.push(_audN(C.dif.length, 'lectura de documento confirmada', 'lecturas de documentos confirmadas'));
    if(!partes.length) return _audRes('falta', 'Ni inducciones, ni charlas, ni campañas en el periodo', [], ['charlas', 'induccion', 'campanas']);
    return _audRes(C.nInd && C.charlas.length ? 'ok' : 'ojo', partes.join(' · ')+(!C.nInd ? ' · sin inducciones' : (!C.charlas.length ? ' · sin charlas' : '')), det, ['charlas', 'induccion', 'campanas']);
  },
  comunic:function(C){
    var partes=[], det=C.bol.slice(0, 6).map(function(b){ return { t:'Boletín · '+(b.titulo||'—'), f:String(b.desde||b.creado||'').slice(0, 10), ir:'boletines' }; });
    if(C.bol.length) partes.push(_audN(C.bol.length, 'boletín', 'boletines'));
    if(C.dif.length) partes.push(_audN(C.dif.length, 'difusión leída y firmada', 'difusiones leídas y firmadas'));
    if(C.quienes.length) { partes.push('«¿A quién acudo?» publicado'); det.push({ t:'«¿A quién acudo?» publicado para la gente', f:String(C.quienes[0].creado||'').slice(0, 10), ir:'quien' }); }
    if(!partes.length) return _audRes('falta', 'Ni boletines, ni difusiones, ni lo publicado para la gente', [], ['boletines', 'quien']);
    return _audRes(partes.length>1 ? 'ok' : 'ojo', partes.join(' · '), det, ['boletines', 'quien', 'qr']);
  },
  docinfo:function(C){
    if(!C.nDocs) return _audRes('falta', 'Las carpetas de documentos de la obra están vacías', [], ['docs']);
    return _audRes('ok', _audN(C.nDocs, 'documento', 'documentos')+' en las carpetas de la obra · '+C.nDocsPer+' subidos en el periodo, cada uno con su fecha', [], ['docs']);
  },
  operac:function(C){
    var pets=_audDocs(C, ['pets']), det=pets.slice(0, 6).map(_audIt);
    if(C.ats) det.push({ t:_audN(C.ats, 'ATS', 'ATS')+' en el periodo', ir:'ats' }); if(C.petar) det.push({ t:_audN(C.petar, 'PETAR', 'PETAR')+' en el periodo' });
    if((C.D.msds||[]).length) det.push({ t:_audN(C.D.msds.length, 'producto químico con su hoja MSDS', 'productos químicos con su hoja MSDS'), ir:'quimicos' });
    var partes=[]; if(pets.length) partes.push(_audN(pets.length, 'PETS', 'PETS')); if(C.ats) partes.push(_audN(C.ats, 'ATS', 'ATS')); if(C.petar) partes.push(_audN(C.petar, 'PETAR', 'PETAR')); if(C.kar.length) partes.push(_audN(C.kar.length, 'entrega de EPP', 'entregas de EPP'));
    if(!partes.length) return _audRes('falta', 'Ni procedimientos, ni ATS, ni permisos de trabajo en el periodo', [], ['ats', 'docs']);
    return _audRes(pets.length && C.ats ? 'ok' : 'ojo', partes.join(' · ')+(!pets.length ? ' · faltan los PETS' : (!C.ats ? ' · sin ATS en el periodo' : '')), det, ['ats', 'docs']);
  },
  controles:function(C){
    var n=C.rep.length, c=C.repCerr, pct=n ? Math.round(c*100/n) : null;
    if(!n) return _audRes('ojo', 'Ningún reporte de actos o condiciones en el periodo: casi nunca quiere decir que no hubo nada que reportar', [], ['reportes']);
    return _audRes(pct>=80 ? 'ok' : 'ojo', _audN(n, 'acto o condición reportado', 'actos y condiciones reportados')+' · '+pct+' % corregidos y cerrados', [{ t:c+' cerrados · '+(n-c)+' abiertos', ir:'reportes' }], ['reportes', 'insp']);
  },
  compras:function(C){
    if(C.req.length) return _audRes('ok', _audN(C.req.length, 'requerimiento de EPP y materiales', 'requerimientos de EPP y materiales')+' en el periodo, con sus firmas', [], ['reqs']);
    return _audRes('subir', 'Cómo se eligen y se controlan los proveedores y los contratistas en SST (sus requisitos, sus evaluaciones).', [], ['reqs', 'cad']);
  },
  emerg:function(C){
    var pl=_audDocs(C, ['plan-emergencia']), me=_audDocs(C, ['mapa-evacuacion']), br=_audDocs(C, ['brigadistas']), co=_audDocs(C, ['contactos-emergencia']);
    var sims=C.simL.length+C.simDocs.length, det=pl.slice(0, 4).map(_audIt).concat(me.slice(0, 3).map(_audIt)).concat(br.slice(0, 2).map(_audIt)).concat(co.slice(0, 2).map(_audIt)).concat(C.simL.map(function(x){ return { t:'Simulacro · '+x.t, f:x.f, ir:'simulacros' }; }));
    var sinPlan=C.frentes.filter(function(f){ var n=f.n.toLowerCase(); return !pl.some(function(r){ var t=String(r.nombre||'').toLowerCase(); return t.indexOf(n+' ·')===0 || f.antes.some(function(a){ return t.indexOf(String(a).toLowerCase()+' ·')===0; }); }); });
    var partes=[]; if(pl.length) partes.push('el plan de respuesta'); if(me.length) partes.push('el mapa de evacuación'); if(br.length) partes.push('la brigada'); if(sims) partes.push(_audN(sims, 'simulacro', 'simulacros')+' en el periodo');
    if(!partes.length) return _audRes('falta', 'Ni el plan de respuesta ante emergencias, ni simulacros', [], ['docs', 'simulacros', 'frentes']);
    var ok=pl.length && sims && !sinPlan.length;
    return _audRes(ok ? 'ok' : 'ojo', 'Están '+_audY(partes)+(!pl.length ? ' · falta el plan de respuesta' : '')+(!sims ? ' · ningún simulacro en el periodo' : '')+(sinPlan.length ? ' · sin su propio plan: '+sinPlan.map(function(f){ return f.n; }).join(', ') : ''), det, ['docs', 'simulacros', 'frentes']);
  },
  seguim:function(C){
    var inf=_audDocs(C, ['informe-mes'], true), sin=C.cerr.filter(function(m){ return !C.hhtMes[m]; }), det=inf.slice(0, 12).map(_audIt);
    var partes=[]; if(C.HHT) partes.push('las horas hombre y los índices'); if(inf.length) partes.push(_audN(inf.length, 'informe del mes', 'informes del mes'));
    if(C.monL.length || C.monSal.length) partes.push('los monitoreos'); if(C.insp.length) partes.push(_audN(C.insp.length, 'inspección', 'inspecciones'));
    if(!partes.length) return _audRes('falta', 'Ni indicadores, ni informes, ni inspecciones en el periodo', [], ['informe', 'hh']);
    return _audRes(C.HHT && !sin.length && inf.length ? 'ok' : 'ojo', 'Están '+_audY(partes)+(!inf.length ? ' · ningún informe del mes guardado' : '')+(sin.length && C.HHT ? ' · faltan horas hombre de '+_audMesesTx(sin) : ''), det, ['informe', 'hh', 'acc']);
  },
  audint:function(C, r){
    var L=C.audHechas.filter(function(a){ return a.tipo==='interna' && C.en(a.fecha); });
    if(r && r.norma==='i14') L=L.filter(function(a){ var x=a.de==='int' ? (C.int.filter(function(i){ return i.id===a.id; })[0]||{ d:{} }).d : null; return !x || (x.normas||[]).indexOf('i14')>-1; });
    var det=L.map(function(a){ return { t:a.t+(a.emp ? ' · '+a.emp : ''), f:a.fecha, ir:a.de==='int' ? 'aud-int' : 'programas' }; });
    if(L.length) return _audRes('ok', _audN(L.length, 'auditoría interna', 'auditorías internas')+' en el periodo · la última, '+_audF(L[0].fecha), det, ['aud-int', 'programas']);
    return _audRes('falta', 'Ninguna auditoría interna en el periodo', [], ['aud-int', 'programas']);
  },
  audint14:function(C, r){ return AUD_EV.audint(C, r); },
  audprog:function(C){
    var P=C.progs.filter(function(x){ return x.d.tipo==='aud'; }), del=P.filter(function(x){ return C.anios[String(x.d.anio)]; });
    var det=del.map(function(x){ return { t:'Programa de auditorías '+x.d.anio+' · '+_audN((x.d.items||[]).length, 'auditoría', 'auditorías'), ir:'programas' }; });
    if(del.length) return _audRes('ok', 'El programa de auditorías '+del.map(function(x){ return x.d.anio; }).join(' y '), det, ['programas']);
    return P.length ? _audRes('ojo', 'Hay un programa de auditorías, pero de otro año', [], ['programas']) : _audRes('falta', 'Ningún programa de auditorías', [], ['programas']);
  },
  nc:function(C, r){
    var H=C.hall.filter(function(x){ var k=String(x.d.cl||''); return !r || r.norma!=='i14' ? k.indexOf('i14:')!==0 : k.indexOf('i14:')===0; });
    var ab=H.filter(function(x){ return !x.cerrado; }), ve=H.filter(function(x){ return x.vencido; }), sinM=C.acc.filter(function(a){ return !String(a.medidas||'').trim(); });
    var det=H.slice(0, 15).map(function(x){ return { t:(AUD_HALL_T[x.d.tipo]||'Hallazgo')+' · '+(x.d.desc||'—')+(x.cerrado ? ' · cerrado' : (x.vencido ? ' · vencido' : ' · abierto')), f:String(x.d.fecha||x.creado||'').slice(0, 10), mal:x.vencido, ir:'aud-acc' }; });
    var n=H.length+C.acc.length+C.rep.length;
    if(!n) return _audRes('info', 'Sin incidentes, ni reportes, ni hallazgos registrados en el periodo', [], ['aud-acc', 'acc', 'reportes']);
    var lin=_audN(H.length, 'hallazgo', 'hallazgos')+' ('+ab.length+' abiertos'+(ve.length ? ', '+ve.length+' vencidos' : '')+') · '+_audN(C.acc.length, 'evento', 'eventos')+(sinM.length ? ' ('+sinM.length+' sin medidas)' : '')+' · '+(C.rep.length ? Math.round(C.repCerr*100/C.rep.length)+' % de los reportes cerrados' : 'sin reportes');
    return _audRes(ve.length || sinM.length ? 'ojo' : 'ok', lin, det, ['aud-acc', 'acc', 'reportes']);
  },
  nc14:function(C, r){
    var H=C.hall.filter(function(x){ return String(x.d.cl||'').indexOf('i14:')===0; }), ab=H.filter(function(x){ return !x.cerrado; }), ve=H.filter(function(x){ return x.vencido; });
    var det=H.slice(0, 15).map(function(x){ return { t:(AUD_HALL_T[x.d.tipo]||'Hallazgo')+' · '+(x.d.desc||'—')+(x.cerrado ? ' · cerrado' : (x.vencido ? ' · vencido' : ' · abierto')), f:String(x.d.fecha||x.creado||'').slice(0, 10), mal:x.vencido, ir:'aud-acc' }; });
    if(!H.length) return _audRes('info', 'Sin no conformidades ambientales registradas', [], ['aud-acc']);
    return _audRes(ve.length ? 'ojo' : 'ok', _audN(H.length, 'no conformidad u observación', 'no conformidades y observaciones')+' · '+ab.length+' abiertas'+(ve.length ? ' · '+ve.length+' vencidas' : ''), det, ['aud-acc']);
  },
  mejora:function(C){
    var cer=C.hall.filter(function(x){ return x.cerrado && String(x.d.cl||'').indexOf('i14:')!==0; }), ef=cer.filter(function(x){ return x.d.eficacia && x.d.eficacia.ok; });
    var det=C.buena.slice(0, 10).map(function(b){ return { t:'Buena práctica · '+(b.titulo||'—'), f:String(b.fecha||'').slice(0, 10), ir:'buenas' }; });
    var partes=[]; if(C.buena.length) partes.push(_audN(C.buena.length, 'buena práctica', 'buenas prácticas')); if(cer.length) partes.push(_audN(cer.length, 'hallazgo cerrado', 'hallazgos cerrados')+(ef.length ? ' ('+ef.length+' con su eficacia verificada)' : ''));
    if(!partes.length) return _audRes('subir', 'Las mejoras del sistema: buenas prácticas, acciones cerradas con su eficacia, cambios que salieron de la revisión por la dirección.', [], ['buenas', 'aud-acc']);
    return _audRes('ok', partes.join(' · '), det, ['buenas', 'aud-acc']);
  },
  mejora14:function(C){
    var cer=C.hall.filter(function(x){ return x.cerrado && String(x.d.cl||'').indexOf('i14:')===0; });
    if(cer.length) return _audRes('ok', _audN(cer.length, 'acción ambiental cerrada', 'acciones ambientales cerradas'), [], ['aud-acc']);
    return _audRes('subir', 'Las mejoras ambientales: reducción de residuos, de agua o de combustible, acciones cerradas con su eficacia.', [], ['ambiente', 'aud-acc']);
  },
  /* ── ISO 14001 ── */
  lider14:function(C){
    var p=_audDocs(C, ['politicas']), pm=_audDocs(C, ['pma']), det=p.slice(0, 2).map(_audIt).concat(pm.slice(0, 2).map(_audIt));
    if(p.length && pm.length) return _audRes('ok', 'La política y el plan de manejo ambiental', det, ['docs']);
    if(p.length || pm.length) return _audRes('ojo', p.length ? 'Está la política; falta el plan de manejo ambiental' : 'Está el plan de manejo ambiental; falta la política', det, ['docs']);
    return _audRes('falta', 'Ni la política ni el plan de manejo ambiental', [], ['docs']);
  },
  pol14:function(C){
    var p=_audDocs(C, ['politicas']);
    return p.length ? _audRes('ok', 'La política (subida el '+_audF(p[0].creado)+'): si es la política integrada, es la misma', p.slice(0, 4).map(_audIt), ['docs'])
                    : _audRes('falta', 'La política no está en las carpetas de la obra', [], ['docs']);
  },
  aspectos:function(C){
    var p=_audDocs(C, ['ieaia']);
    return p.length ? _audRes('ok', 'La matriz de aspectos e impactos ambientales (subida el '+_audF(p[0].creado)+')', p.slice(0, 4).map(_audIt), ['docs'])
                    : _audRes('falta', 'La matriz IEAIA no está en las carpetas de la obra', [], ['docs']);
  },
  pma:function(C){
    var p=_audDocs(C, ['pma']);
    return p.length ? _audRes('ok', 'El plan de manejo ambiental (subido el '+_audF(p[0].creado)+')', p.slice(0, 4).map(_audIt), ['docs'])
                    : _audRes('falta', 'El plan de manejo ambiental no está en las carpetas de la obra', [], ['docs']);
  },
  obj14:function(C){ var R=AUD_EV.objetivos(C); if(R.st==='ok') R.lin+=' · que incluyan los ambientales'; return R; },
  conc14:function(C){
    var re=/ambient|residu|reciclaj|segregaci|derrame|agua|energ|polvo|ruido|flora|fauna|cambio clim/i, L=C.charlas.filter(function(s){ return re.test(String(s.tema||'')); });
    var det=L.slice(0, 12).map(function(s){ return { t:'Charla · '+(s.tema||'—'), f:_audLocal(s.inicio) }; });
    if(L.length) return _audRes('ok', _audN(L.length, 'charla de tema ambiental', 'charlas de tema ambiental')+' en el periodo', det, ['charlas', 'ambiente']);
    return _audRes(C.charlas.length ? 'ojo' : 'falta', C.charlas.length ? 'Hay charlas, ninguna de tema ambiental (por su tema)' : 'Ninguna charla en el periodo', [], ['charlas', 'ambiente']);
  },
  docs14:function(C){
    var p=_audDocs(C, ['pma', 'rrss', 'ma-informe', 'ieaia']);
    return p.length ? _audRes('ok', _audN(p.length, 'documento ambiental', 'documentos ambientales')+' en las carpetas de la obra', p.slice(0, 8).map(_audIt), ['docs'])
                    : _audRes('falta', 'La carpeta de medio ambiente está vacía', [], ['docs']);
  },
  operac14:function(C){
    var res=C.amb.filter(function(x){ return x.d.k==='res'; }), ag=C.amb.filter(function(x){ return x.d.k==='agua'; }), co=C.amb.filter(function(x){ return x.d.k==='comb'; }), rr=_audDocs(C, ['rrss']);
    var det=rr.slice(0, 3).map(_audIt), partes=[];
    if(res.length) partes.push(_audN(res.length, 'salida de residuos', 'salidas de residuos')); if(ag.length) partes.push(_audN(ag.length, 'registro de agua', 'registros de agua')); if(co.length) partes.push(_audN(co.length, 'carga de combustible', 'cargas de combustible')); if(rr.length) partes.push('la EO-RS');
    if(!partes.length) return _audRes('falta', 'Ni residuos, ni agua, ni combustible registrados en el periodo', [], ['ambiente']);
    return _audRes(res.length ? 'ok' : 'ojo', partes.join(' · ')+(!res.length ? ' · ninguna salida de residuos' : ''), det, ['ambiente']);
  },
  seg14:function(C){
    var inf=_audDocs(C, ['ma-informe'], true), det=inf.slice(0, 12).map(_audIt);
    if(inf.length) return _audRes('ok', _audN(inf.length, 'informe de medio ambiente', 'informes de medio ambiente')+' en el periodo'+(C.amb.length ? ' · '+_audN(C.amb.length, 'registro', 'registros') : ''), det, ['inf-amb', 'ambiente']);
    return _audRes(C.amb.length ? 'ojo' : 'falta', C.amb.length ? _audN(C.amb.length, 'registro ambiental', 'registros ambientales')+', ningún informe de medio ambiente guardado' : 'Ni registros ni informes ambientales en el periodo', [], ['inf-amb', 'ambiente']);
  }
};
function _audR_emoNo(){ return _audRes('subir', 'No se pudo leer el EMO de la obra (tu cuenta no lo ve o el plan no lo trae): adjunta aquí tu registro de exámenes.', [], ['emo']); }
var AUD_HALL_T={ nc:'No conformidad', obs:'Observación', om:'Oportunidad de mejora' };
/* un requisito con su evidencia, y lo que se subió a mano: con eso, lo que faltaba (✗ u ○) pasa a «hay» */
function audEvaluar(C, r){
  var f=AUD_EV[r.ev] || AUD_EV.subir, R;
  try{ R=f(C, r); }catch(e){ R=_audRes('ojo', 'No se pudo revisar esto ('+String((e && e.message) || e).slice(0, 80)+').', []); }
  var ev=(C.evid[r.k]||[]).slice().sort(function(a, b){ return String(b.creado||'').localeCompare(String(a.creado||'')); });
  R.ev=ev.map(function(x){ return { id:x.id, t:x.nombre||'Archivo', f:String(x.creado||'').slice(0, 10), u:x.url }; });
  R.st0=R.st;
  if(ev.length && (R.st==='subir' || R.st==='falta' || R.st==='info')){ R.st='ok'; R.lin=(R.st0==='info' ? R.lin+' · ' : '')+'Con tu evidencia: '+_audN(ev.length, 'archivo', 'archivos')+' (el último, del '+_audF(ev[0].creado)+')'; }
  else if(ev.length) R.lin+=' · '+_audN(ev.length, 'archivo tuyo', 'archivos tuyos');
  return R;
}
function audEvaluarTodo(C){
  var R={};
  _audTodos().forEach(function(r){ R[r.k]=audEvaluar(C, r); });
  return R;
}
function audCuentas(R, k){
  var c={ ok:0, ojo:0, falta:0, subir:0, info:0, n:0 };
  _audCatalogo(k).forEach(function(G){ G.s.forEach(function(r){ var x=R[r.k]; if(!x) return; c[x.st]++; c.n++; }); });
  return c;
}

/* ══ LA VISTA «CARPETA DE AUDITORÍA» ══════════════════════════════════════════════════════════════════════════════ */
function vistaAud(caja){
  _audCss();
  AUDW.caja=caja; AUDW.msg=''; AUDW.msgCl='';
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  function pinta(fresco){
    var n=++AUDW.n;
    audTraer(fresco).then(function(){
      if(n!==AUDW.n || VISTA.actual!=='aud') return;
      _audPintar();
    }, function(cod){ if(n===AUDW.n && VISTA.actual==='aud') fallo(caja, cod); });
  }
  /* la carpeta lee mucho: si la nube avisa de un cambio (o el sondeo de cada 20 s), se vuelve a leer a lo más cada minuto */
  VISTA.recargar=function(){ if(AUDW.D && Date.now()-AUDW.t<60000) return; pinta(true); };
  pinta(false);
}
/* el periodo elegido, su contexto y la evidencia de cada requisito */
function audCalcular(){
  var D=AUDW.D; if(!D) return null;
  var C0=audContexto(D, audPeriodo('12')), ult=_audUltAuditoria(C0), per=audPeriodo(AUDW.per, ult);
  if(AUDW.per==='aud' && per.k!=='aud') AUDW.per='12';
  var C=(per.k==='12') ? C0 : audContexto(D, per);
  AUDW.C=C; AUDW.R=audEvaluarTodo(C); AUDW.ult=ult;
  return C;
}
function _audIrV(L){
  var V=(typeof vistasDe==='function') ? vistasDe() : [];
  for(var i=0;i<(L||[]).length;i++) for(var j=0;j<V.length;j++) if(V[j].id===L[i]) return V[j];
  return null;
}
function _audChips(c){
  return ['ok', 'ojo', 'falta', 'subir', 'info'].filter(function(k){ return c[k]; }).map(function(k){ var E=AUD_EST[k]; return '<span class="aud-cuenta '+E.cl+'" title="'+esc(E.n)+'">'+E.ic+' '+c[k]+'</span>'; }).join('');
}
function _audPintar(){
  var caja=AUDW.caja; if(!caja || !document.body.contains(caja)) return;
  var C=audCalcular(); if(!C) return;
  var R=AUDW.R, per=C.per, ac=$('acciones'), obra=nombreObraP()||'la obra';
  var abiertos={}; Array.prototype.forEach.call(caja.querySelectorAll('.aud-r details[open]'), function(d){ var r=d.closest('.aud-r'); if(r) abiertos[r.getAttribute('data-k')]=1; });
  if(ac){
    var ops=[['12', 'Los últimos 12 meses'], ['anio', 'Este año'], ['pasado', 'El año pasado']].concat(AUDW.ult ? [['aud', 'Desde la última auditoría ('+_audF(AUDW.ult)+')']] : []);
    ac.innerHTML='<select id="aud-per" aria-label="Periodo de la carpeta">'+ops.map(function(o){ return '<option value="'+o[0]+'"'+(o[0]===AUDW.per ? ' selected' : '')+'>'+esc(o[1])+'</option>'; }).join('')+'</select>'+
      '<button type="button" class="bt" id="aud-zip">📦 Descargar la carpeta</button><button type="button" class="bt sec" id="aud-pdf">📄 Índice en PDF</button>';
    $('aud-per').onchange=function(){ AUDW.per=this.value; _audPintar(); };
    $('aud-zip').onclick=function(){ audExportar('zip', this); };
    $('aud-pdf').onclick=function(){ audExportar('pdf', this); };
  }
  var h='<div class="tarj"><div class="tarj-cab"><div><h2>🗂️ La carpeta de '+esc(obra)+'</h2><p class="sub">'+esc(per.n)+' · del '+esc(_audF(per.desde))+' al '+esc(_audF(per.hasta))+
    ' · se arma sola con lo que la obra registra en OBRASST, en la app y en la web</p></div></div><div class="tarj-cuerpo">'+
    '<div class="aud-res-g" role="tablist" aria-label="Normas">'+AUD_SECC.map(function(S){
      var c=audCuentas(R, S.k), pct=c.n ? Math.round((c.ok+c.info)*100/c.n) : 0;
      return '<button type="button" role="tab" class="aud-res-c'+(AUDW.sec===S.k ? ' on' : '')+'" aria-selected="'+(AUDW.sec===S.k ? 'true' : 'false')+'" data-aud-sec="'+S.k+'"><b>'+esc(S.n)+'</b>'+
        '<span class="aud-res-n">'+_audChips(c)+'</span><span class="aud-prog" aria-hidden="true"><i style="width:'+pct+'%"></i></span></button>';
    }).join('')+'</div>'+
    '<p class="ayuda" style="margin:12px 0 0">OBRASST ordena la evidencia que tu obra ya registra; no audita ni certifica. ✓ hay · ⚠ hay, pero está viejo o incompleto · ✗ falta · ○ OBRASST no lo registra: se adjunta aquí. '+
    'La auditoría del art. 43 de la Ley 29783 la hace un auditor independiente.</p>'+
    (per.corto ? '<p class="ayuda">La última auditoría es de antes del '+esc(_audF(AUDW.D.desdeDatos))+': la carpeta empieza ahí.</p>' : '')+
    '</div></div>'+_audSeccionHTML(AUDW.sec, R)+
    '<div class="msg '+esc(AUDW.msgCl)+'" id="aud-msg" role="status">'+esc(AUDW.msg)+'</div>';
  caja.innerHTML=h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-aud-sec]'), function(b){ b.onclick=function(){ AUDW.sec=b.getAttribute('data-aud-sec'); _audPintar(); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('.aud-r'), function(r){ if(abiertos[r.getAttribute('data-k')]){ var d=r.querySelector('details'); if(d) d.open=true; } });
  _audEnchufar(caja);
}
function _audEnchufar(caja){
  Array.prototype.forEach.call(caja.querySelectorAll('[data-aud-ir]'), function(b){ b.onclick=function(){ navegar(b.getAttribute('data-aud-ir')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('input[data-aud-sube]'), function(x){ x.onchange=function(){ audSubir(x, x.getAttribute('data-aud-sube')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-aud-quita]'), function(b){ b.onclick=function(){ audQuitarEvid(b.getAttribute('data-aud-quita')); }; });
}
function _audSeccionHTML(k, R){
  var h='<div class="tarj" id="aud-sec" data-sec="'+esc(k)+'"><div class="tarj-cuerpo">';
  _audCatalogo(k).forEach(function(G){
    h+='<div class="aud-g"><h3>'+esc(G.g)+'</h3>'+(G.cita ? '<p class="aud-cita">'+esc(G.cita)+'</p>' : '');
    var p='';
    G.s.forEach(function(r){
      if(r.p && r.p!==p) h+='<p class="aud-p">'+esc(r.p)+'</p>';
      p=r.p||'';
      h+=_audFilaHTML(r, R[r.k]);
    });
    if(G.pie) h+='<p class="aud-pie">'+esc(G.pie)+'</p>';
    h+='</div>';
  });
  return h+'</div></div>';
}
function _audFilaHTML(r, x){
  var E=AUD_EST[x.st]||AUD_EST.subir, v=_audIrV(x.ir), n=x.det.length+x.ev.length;
  return '<div class="aud-r" data-k="'+esc(r.k)+'" data-st="'+esc(x.st)+'">'+
    '<span class="aud-st '+E.cl+'">'+E.ic+' '+esc(E.n)+'</span>'+
    '<div class="aud-tx"><b><span class="aud-cl">'+esc(r.cl)+'</span>'+esc(r.t)+'</b>'+(r.sub ? '<small>'+esc(r.sub)+'</small>' : '')+
      '<small class="aud-lin">'+esc(x.lin)+'</small>'+(x.nota ? '<p class="aud-nota">'+esc(x.nota)+'</p>' : '')+
      (n ? '<details><summary>Ver lo que hay ('+n+')</summary><ul class="aud-det">'+x.det.map(function(d){ return _audDetLi(d, false); }).join('')+x.ev.map(function(d){ return _audDetLi(d, true); }).join('')+'</ul></details>' : '')+
    '</div>'+
    '<div class="aud-bt">'+(v ? '<button type="button" class="bt sec chico" data-aud-ir="'+esc(v.id)+'">'+esc('Ir a «'+((typeof PESTANAS==='object' && PESTANAS[v.id]) || v.n)+'»')+'</button>' : '')+
      '<label class="bt sec chico aud-subir">＋ Adjuntar<input type="file" data-aud-sube="'+esc(r.k)+'" accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx" multiple aria-label="'+esc('Adjuntar evidencia a '+r.cl+' '+r.t)+'"></label></div>'+
  '</div>';
}
function _audDetLi(d, propio){
  var t=d.u ? '<a href="'+esc(d.u)+'" target="_blank" rel="noopener">'+esc(d.t)+'</a>'
            : ((d.ir && _audIrV([d.ir])) ? '<button type="button" class="bt-link" data-aud-ir="'+esc(d.ir)+'">'+esc(d.t)+'</button>' : esc(d.t));
  return '<li'+(d.mal ? ' class="mal"' : '')+'><span class="f">'+(d.f ? esc(_audF(d.f)) : '')+'</span><span class="t">'+(propio ? '📎 ' : '')+t+'</span>'+
    (propio ? '<button type="button" class="bt-link" data-aud-quita="'+esc(d.id)+'">Quitar</button>' : '')+'</li>';
}
function _audMsg(t, cl){ AUDW.msg=t||''; AUDW.msgCl=cl||''; var m=$('aud-msg'); if(m){ m.className='msg '+(cl||''); m.textContent=t||''; } }
/* después de subir o quitar: se vuelve a traer y se pinta donde estaba (sin saltar arriba) */
function _audRecargar(){
  var y=window.scrollY||0, n=++AUDW.n;
  return audTraer(true).then(function(){ if(n!==AUDW.n || VISTA.actual!=='aud') return; _audPintar(); try{ window.scrollTo(0, y); }catch(e){} }, function(e){ _audMsg('No se pudo volver a leer la carpeta. '+porQueFallo(e), 'mal'); });
}
/* la evidencia que se sube a un requisito: al balde de la obra, y una fila «aud-evid» con la llave del requisito */
function audSubir(inp, k){
  var files=Array.prototype.slice.call(inp.files||[]); inp.value='';
  if(!files.length) return Promise.resolve(false);
  var r=_audReq(k); if(!r) return Promise.resolve(false);
  var grande=files.filter(function(f){ return (f.size||0)>20*1024*1024; })[0];
  if(grande){ _audMsg('«'+grande.name+'» pesa más de 20 MB: comprímelo.', 'mal'); return Promise.resolve(false); }
  var i=0, hechos=0;
  _audMsg('Subiendo '+_audN(files.length, 'archivo', 'archivos')+' a «'+r.cl+' '+r.t+'»…', 'gris');
  function sig(){
    if(i>=files.length) return Promise.resolve();
    var f=files[i++];
    return subirArchivoP('auditoria', f).then(function(url){
      return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:AUD_EVID, nombre:String(f.name||'archivo').replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[_]+/g, ' ').trim().slice(0, 160) || 'Archivo', url:url, nota:JSON.stringify({ v:1, k:k }) });
    }).then(function(){ hechos++; return sig(); });
  }
  return sig().then(function(){
    _audMsg('', ''); toast(hechos===1 ? 'Evidencia guardada en «'+r.cl+' '+r.t+'».' : hechos+' archivos guardados en «'+r.cl+' '+r.t+'».');
    return _audRecargar().then(function(){ return true; });
  }, function(e){
    _audMsg(e==='muy-grande' ? 'Un archivo pesa demasiado: comprímelo.' : 'No se pudo subir. '+porQueFallo(e), 'mal');
    if(hechos) _audRecargar();
    return false;
  });
}
function audQuitarEvid(id){
  return confirmar('¿Quitar este archivo de la carpeta?', 'Deja de contar como evidencia de este requisito. Se puede volver a adjuntar.', { si:'Sí, quitarlo', mal:true }).then(function(si){
    if(!si) return false;
    return sbDelP('sst_doc?id=eq.'+encodeURIComponent(id)).then(function(){ toast('Quitado de la carpeta.'); return _audRecargar(); }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}

/* ══ EXPORTAR: EL ÍNDICE EN PDF, EL ÍNDICE EN EXCEL, LOS REGISTROS Y EL ZIP POR CARPETAS ══════════════════════════ */
function _audNombreBase(C){ return _audAscii('Carpeta de auditoria - '+(nombreObraP()||'obra')+' - '+C.per.desde+' a '+C.per.hasta).slice(0, 110); }
function audExportar(modo, b){
  var C=AUDW.C, R=AUDW.R; if(!C || !R) return Promise.resolve(false);
  if(b){ if(b.disabled) return Promise.resolve(false); b.disabled=true; }
  var listo=function(){ if(b) b.disabled=false; };
  return cargarEvPDF().then(function(){
    if(modo==='pdf'){
      var blob=_audPdf(C, R, null), nom=_audNombreBase(C)+' - indice.pdf';
      bajarBlob(blob, nom); toast('Índice descargado: '+nom); listo(); return true;
    }
    listo(); return audZipHoja(C, R);
  }, function(){ listo(); toast('No se pudo preparar la descarga. Revisa tu conexión e inténtalo otra vez.'); return false; });
}
/* qué va en el ZIP: cada archivo una sola vez, en la carpeta del primer requisito que lo usa (los demás la nombran) */
var AUD_ZIP_TOPE=300;
function audPlanZip(C, R){
  var raiz=_audNombreBase(C), vistos={}, archivos=[], usados={};
  _audTodos().forEach(function(r){
    var x=R[r.k]; if(!x) return;
    var carpeta=raiz+'/'+r.gz+'/'+_audAscii(r.z||r.cl).slice(0, 70);
    x.zipCarpeta=carpeta.slice(raiz.length+1); x.zipRef=[];
    x.det.filter(function(d){ return d.u; }).slice(0, 40).concat(x.ev).forEach(function(d){
      if(!d.u) return;
      if(vistos[d.u]){ if(x.zipRef.indexOf(vistos[d.u])<0) x.zipRef.push(vistos[d.u]); return; }
      var base=_audAscii((d.f ? d.f+' ' : '')+(d.t||'archivo')).slice(0, 90) || 'archivo', p=carpeta+'/'+base, q=p, i=2;
      while(usados[q]){ q=p+' ('+(i++)+')'; }
      usados[q]=1; vistos[d.u]=x.zipCarpeta; archivos.push({ u:d.u, p:q, k:r.k, f:d.f||'' });
    });
  });
  /* si son demasiados, los más nuevos */
  var fuera=0;
  if(archivos.length>AUD_ZIP_TOPE){ archivos.sort(function(a, b){ return String(b.f).localeCompare(String(a.f)); }); fuera=archivos.length-AUD_ZIP_TOPE; archivos=archivos.slice(0, AUD_ZIP_TOPE); }
  return { raiz:raiz, archivos:archivos, fuera:fuera };
}
function audZipHoja(C, R){
  var plan=audPlanZip(C, R), n=plan.archivos.length;
  var h='<p style="margin:0 0 10px">La carpeta de <b>'+esc(nombreObraP()||'la obra')+'</b>, del '+esc(_audF(C.per.desde))+' al '+esc(_audF(C.per.hasta))+', en un ZIP con una carpeta por requisito:</p>'+
    '<ul style="margin:0 0 10px 18px; padding:0; font-size:13.5px; line-height:1.6"><li>el índice en PDF y en Excel (qué hay, qué falta y dónde está cada cosa),</li>'+
    '<li>los 8 registros del art. 33 armados en Excel con lo de la obra,</li>'+
    '<li>'+(n ? _audN(n, 'archivo de la obra', 'archivos de la obra')+' (los documentos y la evidencia que adjuntaste)' : 'ningún archivo de la obra todavía')+'.</li></ul>'+
    (plan.fuera ? '<p class="ayuda">Son más de '+AUD_ZIP_TOPE+' archivos: van los '+AUD_ZIP_TOPE+' más nuevos (el índice dice cuáles quedaron fuera).</p>' : '')+
    '<p class="ayuda">Los archivos se bajan uno por uno: con muchos, toma unos minutos. No cierres esta ventana.</p><div class="msg" id="audz-msg" role="status"></div>';
  abrirHoja('Descargar la carpeta', 'Ordenada por carpetas, para el auditor', h,
    '<button type="button" class="bt sec" id="audz-no">Cancelar</button>'+(n ? '<button type="button" class="bt sec" id="audz-sin">Solo el índice y los registros</button>' : '')+'<button type="button" class="bt" id="audz-si">'+(n ? 'Con los archivos ('+n+')' : 'Descargar')+'</button>', {});
  var corre=false;
  $('audz-no').onclick=function(){ if(!corre) cerrarHoja(); };
  var vamos=function(con){
    if(corre) return; corre=true;
    ['audz-si', 'audz-sin'].forEach(function(id){ var x=$(id); if(x) x.disabled=true; });
    audArmarZip(C, R, plan, con, function(t){ var m=$('audz-msg'); if(m){ m.className='msg gris'; m.textContent=t; } }).then(function(z){
      bajarBlob(z.blob, plan.raiz+'.zip'); cerrarHoja();
      toast('Carpeta descargada'+(z.fallaron ? ' ('+_audN(z.fallaron, 'archivo no se pudo bajar', 'archivos no se pudieron bajar')+': están en el índice)' : '')+'.');
    }, function(e){ corre=false; ['audz-si', 'audz-sin'].forEach(function(id){ var x=$(id); if(x) x.disabled=false; });
      var m=$('audz-msg'); if(m){ m.className='msg mal'; m.textContent='No se pudo armar la carpeta. '+porQueFallo(e); } });
  };
  $('audz-si').onclick=function(){ vamos(n>0); };
  if($('audz-sin')) $('audz-sin').onclick=function(){ vamos(false); };
  return Promise.resolve(true);
}
function _audExt(u, u8){
  var m=/\.([a-z0-9]{2,5})(?:$|[?#])/i.exec(decodeURIComponent(String(u||'').split('/').pop()||''));
  if(m && /^(pdf|jpe?g|png|webp|gif|docx?|xlsx?|pptx?|txt|csv|zip|heic)$/i.test(m[1])) return m[1].toLowerCase();
  if(u8 && u8.length>4){ if(u8[0]===0x25 && u8[1]===0x50) return 'pdf'; if(u8[0]===0x89 && u8[1]===0x50) return 'png'; if(u8[0]===0xFF && u8[1]===0xD8) return 'jpg'; if(u8[0]===0x50 && u8[1]===0x4B) return 'zip'; }
  return 'bin';
}
function audArmarZip(C, R, plan, conArchivos, aviso){
  var out=[], mal=[], i=0, L=conArchivos ? plan.archivos : [];
  var lee=function(bl){ return bl.arrayBuffer().then(function(b){ return new Uint8Array(b); }); };
  function sig(){
    if(i>=L.length) return Promise.resolve();
    var a=L[i++]; if(aviso) aviso('Bajando '+i+' de '+L.length+'…');
    return fetch(a.u).then(function(r){ if(!r.ok) throw r.status; return r.arrayBuffer(); }).then(function(b){
      var u8=new Uint8Array(b); out.push({ n:a.p+'.'+_audExt(a.u, u8), b:u8 });
    }, function(){ mal.push(a); }).then(sig);
  }
  return sig().then(function(){
    if(aviso) aviso('Armando el índice y los registros…');
    var regs=audRegistros(C, R);
    return Promise.all([lee(_audPdf(C, R, plan, mal)), lee(audXlsIndice(C, R, plan, mal))].concat(regs.map(function(x){ return lee(x.blob); }))).then(function(B){
      out.unshift({ n:plan.raiz+'/00 Indice de la carpeta.pdf', b:B[0] }, { n:plan.raiz+'/00 Indice de la carpeta.xlsx', b:B[1] });
      regs.forEach(function(x, j){ var r=_audReq(x.k), xx=R[x.k]; out.push({ n:plan.raiz+'/'+(xx ? xx.zipCarpeta : (r.gz+'/'+r.z))+'/'+x.nombre+'.xlsx', b:B[2+j] }); });
      if(mal.length) out.push({ n:plan.raiz+'/No se pudieron bajar.txt', x:'Estos archivos no se pudieron bajar (ábrelos desde OBRASST):\r\n\r\n'+mal.map(function(a){ return a.p.slice(plan.raiz.length+1)+'\r\n  '+a.u; }).join('\r\n')+'\r\n' });
      var z=RCAP._zip(out);
      return { blob:new Blob([z], { type:'application/zip' }), fallaron:mal.length };
    });
  });
}
/* ── el índice en PDF (A4 vertical) ── */
var AUD_PDF_COL={ ok:[30, 107, 69], ojo:[138, 87, 0], falta:[168, 32, 26], subir:[94, 110, 121], info:[35, 89, 154] };
var AUD_PDF_FON={ ok:[227, 244, 234], ojo:[255, 241, 214], falta:[251, 227, 228], subir:[238, 241, 244], info:[230, 239, 250] };
function _audPdf(C, R, plan, mal){
  var J=window.jspdf.jsPDF, doc=new J({ unit:'mm', format:'a4' }), W=210, M=14, y=0, ancho=W-2*M, X0=M+27;
  var T=function(s){ return String(s==null ? '' : s).replace(/[✓⚠✗○ℹ]\s?/g, '').replace(/[^\u0000-ÿ–—’“”•€]/g, '').replace(/\s+/g, ' ').trim(); };
  var emp=empresaDeObraP(), obra=nombreObraP()||'Obra', ahora=new Date();
  var nueva=function(){ doc.addPage(); y=18; };
  var sitio=function(h){ if(y+h>281) nueva(); };
  doc.setFillColor(11, 42, 58); doc.rect(0, 0, W, 26, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(T('CARPETA DE AUDITORÍA'), M, 12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.text(T([emp, obra].filter(Boolean).join(' · ')), M, 19);
  doc.text(T('Del '+_audF(C.per.desde)+' al '+_audF(C.per.hasta)), W-M, 19, { align:'right' });
  y=34; doc.setTextColor(89, 100, 111); doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize(T('Emitido el '+_audF(_audIso(ahora))+' a las '+dos(ahora.getHours())+':'+dos(ahora.getMinutes())+(YO && YO.nombre ? ' por '+YO.nombre : '')+'. OBRASST ordena la evidencia que la obra registra; no audita ni certifica. HAY: hay evidencia · REVISAR: hay, pero está vieja o incompleta · FALTA: no está · SUBIR: OBRASST no lo registra y no se adjuntó.'), ancho), M, y);
  y+=13;
  /* el resumen */
  doc.setDrawColor(203, 212, 219); doc.setLineWidth(0.2);
  var cab=['Norma', 'Hay', 'Revisar', 'Falta', 'Subir', 'Sin eventos'], xs=[M, M+70, M+90, M+112, M+132, M+152];
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(11, 42, 58); cab.forEach(function(c, j){ doc.text(T(c), xs[j], y); }); y+=2; doc.line(M, y, W-M, y); y+=4.5;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 25, 31);
  AUD_SECC.forEach(function(S){ var c=audCuentas(R, S.k); [S.n, c.ok, c.ojo, c.falta, c.subir, c.info].forEach(function(v, j){ doc.text(T(String(v)), xs[j], y); }); y+=5.2; });
  y+=4;
  AUD_SECC.forEach(function(S){
    sitio(20); y+=2;
    doc.setFillColor(11, 42, 58); doc.rect(M, y-4.6, ancho, 7, 'F'); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.text(T(S.n), M+2, y); y+=8;
    _audCatalogo(S.k).forEach(function(G){
      sitio(14);
      doc.setTextColor(11, 42, 58); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text(T(G.g+(G.cita ? ' · '+G.cita : '')), M, y); y+=1.8; doc.line(M, y, W-M, y); y+=4.4;
      var p='';
      G.s.forEach(function(r){
        var x=R[r.k]; if(!x) return;
        if(r.p && r.p!==p){ sitio(10); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(89, 100, 111); doc.text(T(r.p), X0, y); y+=4.6; }
        p=r.p||'';
        doc.setFontSize(9.2); doc.setFont('helvetica', 'bold');
        var tit=doc.splitTextToSize(T(r.cl+' '+r.t), ancho-27);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6);
        var lin=doc.splitTextToSize(T(x.lin), ancho-27);
        var donde=[];
        if(plan){
          var tiene=plan.archivos.some(function(a){ return a.k===r.k; }) || (AUD_REG_DE[r.k] ? true : false);
          if(tiene) donde.push('En la carpeta: '+x.zipCarpeta);
          if(x.zipRef && x.zipRef.length) donde.push('Sus archivos están en: '+x.zipRef.join(' · '));
        }
        var dl=donde.length ? doc.splitTextToSize(T(donde.join('. ')), ancho-27) : [];
        var hh=tit.length*4.3+lin.length*3.9+dl.length*3.9+3;
        sitio(hh);
        doc.setFillColor.apply(doc, AUD_PDF_FON[x.st]); doc.roundedRect(M, y-3.7, 24, 5.4, 1.2, 1.2, 'F');
        doc.setTextColor.apply(doc, AUD_PDF_COL[x.st]); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.2); doc.text(AUD_EST[x.st].pdf, M+12, y-0.2, { align:'center' });
        doc.setTextColor(20, 25, 31); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2); doc.text(tit, X0, y); y+=tit.length*4.3;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); doc.setTextColor(70, 80, 90); doc.text(lin, X0, y); y+=lin.length*3.9;
        if(dl.length){ doc.setTextColor(35, 89, 154); doc.text(dl, X0, y); y+=dl.length*3.9; }
        y+=2.6;
      });
      if(G.pie){ var pl=doc.splitTextToSize(T(G.pie), ancho); sitio(pl.length*3.9+3); doc.setFont('helvetica', 'italic'); doc.setFontSize(8.2); doc.setTextColor(89, 100, 111); doc.text(pl, M, y); y+=pl.length*3.9+3; }
      y+=2;
    });
  });
  if(mal && mal.length){
    sitio(14); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(168, 32, 26); doc.text(T('Archivos que no se pudieron bajar ('+mal.length+')'), M, y); y+=5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); doc.setTextColor(70, 80, 90);
    mal.slice(0, 40).forEach(function(a){ var l=doc.splitTextToSize(T(a.p.slice(plan.raiz.length+1)), ancho); sitio(l.length*3.8+1); doc.text(l, M, y); y+=l.length*3.8+1; });
  }
  if(plan && plan.fuera){ sitio(10); doc.setFont('helvetica', 'italic'); doc.setFontSize(8.2); doc.setTextColor(138, 87, 0); doc.text(doc.splitTextToSize(T('Quedaron fuera del ZIP '+_audN(plan.fuera, 'archivo', 'archivos')+' (los más antiguos): se abren desde OBRASST.'), ancho), M, y); y+=8; }
  var n=doc.getNumberOfPages();
  for(var i=1;i<=n;i++){
    doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); doc.setTextColor(120, 130, 140);
    doc.text(T('Carpeta de auditoría · '+obra+' · del '+_audF(C.per.desde)+' al '+_audF(C.per.hasta)), M, 290); doc.text(i+' / '+n, W-M, 290, { align:'right' });
  }
  return doc.output('blob');
}
/* ── el índice en Excel ── */
function _audXlsS(X){
  var E=new X.Estilos(), K=X.C;
  return { E:E, tit:E.xf({ b:1, sz:15, c:K.petroleo }), sub:E.xf({ sz:10, c:K.gris }), cab:E.xf({ b:1, sz:9, c:K.blanco, f:K.petroleo, h:'center', v:'center', wrap:1, borde:true }),
    tx:E.xf({ sz:10, c:K.tinta, borde:true, wrap:1, v:'top' }), n:E.xf({ sz:10, c:K.tinta, borde:true, h:'right', v:'top', fmt:'#,##0' }), d2:E.xf({ sz:10, c:K.tinta, borde:true, h:'right', v:'top', fmt:'#,##0.00' }),
    f:E.xf({ sz:10, c:K.tinta, borde:true, h:'center', v:'top', fmt:'dd/mm/yyyy' }), g:E.xf({ b:1, sz:10, c:K.petroleo, f:K.cabSes, borde:true }),
    tot:E.xf({ b:1, sz:10, c:K.blanco, f:K.azul, borde:true }), totN:E.xf({ b:1, sz:10, c:K.blanco, f:K.azul, borde:true, h:'right', fmt:'#,##0' }), totD:E.xf({ b:1, sz:10, c:K.blanco, f:K.azul, borde:true, h:'right', fmt:'#,##0.00' }),
    ok:E.xf({ b:1, sz:10, c:K.okT, f:K.okF, borde:true, h:'center', v:'top' }), ojo:E.xf({ b:1, sz:10, c:K.ojoT, f:K.ojoF, borde:true, h:'center', v:'top' }),
    falta:E.xf({ b:1, sz:10, c:K.malT, f:K.malF, borde:true, h:'center', v:'top' }), subir:E.xf({ b:1, sz:10, c:K.naT, f:K.naF, borde:true, h:'center', v:'top' }),
    info:E.xf({ b:1, sz:10, c:K.progT, f:K.progF, borde:true, h:'center', v:'top' }), ley:E.xf({ sz:9, c:K.gris, wrap:1, v:'top' }) };
}
function audXlsIndice(C, R, plan){
  var X=RCAP.xlsx, S=_audXlsS(X), h=new X.Hoja('Índice'), cols=[['Norma', 14], ['Requisito', 58], ['Estado', 13], ['Lo que hay', 70], ['Dónde está en la carpeta', 46], ['Archivos', 10]];
  h.activa=true; h.pie='Carpeta de auditoría';
  h.unir(0, 1, 5, 1, 'Carpeta de auditoría · '+(nombreObraP()||'Obra'), S.tit); h.altos[1]=26;
  h.unir(0, 2, 5, 2, [empresaDeObraP(), 'del '+_audF(C.per.desde)+' al '+_audF(C.per.hasta), 'OBRASST ordena la evidencia que la obra registra; no audita ni certifica'].filter(Boolean).join(' · '), S.sub); h.altos[2]=16;
  var fr=4; cols.forEach(function(c, j){ h.anchos[j]=c[1]; h.celda(j, fr, c[0], S.cab); }); h.altos[fr]=24; h.congelar={ c:0, r:fr }; fr++;
  AUD_SECC.forEach(function(Sx){
    _audCatalogo(Sx.k).forEach(function(G){
      h.unir(0, fr, 5, fr, Sx.corto+' · '+G.g+(G.cita ? ' · '+G.cita : ''), S.g); fr++;
      G.s.forEach(function(r){
        var x=R[r.k]; if(!x) return;
        var nArch=(plan ? plan.archivos.filter(function(a){ return a.k===r.k; }).length : x.det.filter(function(d){ return d.u; }).length+x.ev.length);
        var donde=plan ? [(nArch || AUD_REG_DE[r.k]) ? x.zipCarpeta : '', (x.zipRef||[]).length ? 'Sus archivos: '+x.zipRef.join(' · ') : ''].filter(Boolean).join(' · ') : '';
        h.celda(0, fr, Sx.corto, S.tx); h.celda(1, fr, (r.p ? r.p+' · ' : '')+r.cl+' '+r.t, S.tx); h.celda(2, fr, AUD_EST[x.st].n, S[x.st]);
        h.celda(3, fr, x.lin+(x.nota ? ' — '+x.nota : ''), S.tx); h.celda(4, fr, donde, S.tx); h.celda(5, fr, nArch, S.n);
        fr++;
      });
    });
  });
  return X.libro([h], S.E, 'Carpeta de auditoría');
}
/* ── los registros del art. 33, armados con lo de la obra (uno por carpeta) ── */
var AUD_REG_DE={ 'ley:33a':1, 'ley:33b':1, 'ley:33c':1, 'ley:33d':1, 'ley:33e':1, 'ley:33f':1, 'ley:33g':1, 'ley:33h':1 };
function _audLibro(titulo, cols, filas, extra, C){
  var X=RCAP.xlsx, S=_audXlsS(X), h=new X.Hoja(titulo.slice(0, 31)), ult=cols.length-1;
  h.activa=true; h.pie=titulo;
  h.unir(0, 1, ult, 1, titulo, S.tit); h.altos[1]=26;
  h.unir(0, 2, ult, 2, [empresaDeObraP(), nombreObraP(), 'del '+_audF(C.per.desde)+' al '+_audF(C.per.hasta)].filter(Boolean).join(' · '), S.sub); h.altos[2]=16;
  var fr=4; cols.forEach(function(c, j){ h.anchos[j]=c[1]; h.celda(j, fr, c[0], S.cab); }); h.altos[fr]=30; h.congelar={ c:0, r:fr }; fr++;
  if(!filas.length){ h.unir(0, fr, ult, fr, 'Sin registros en el periodo.', S.tx); fr++; }
  filas.forEach(function(f){
    var tot=!Array.isArray(f), v=tot ? f.v : f;
    v.forEach(function(val, j){
      var t=cols[j][2];
      if(t==='f' && /^\d{4}-\d{2}-\d{2}$/.test(String(val||''))) h.celda(j, fr, X.serial(val), S.f);
      else if((t==='n' || t==='d2') && typeof val==='number' && isFinite(val)) h.celda(j, fr, val, tot ? (t==='n' ? S.totN : S.totD) : S[t]);
      else h.celda(j, fr, val==null ? '' : val, tot ? S.tot : S.tx);
    });
    fr++;
  });
  if(extra){ fr++; h.unir(0, fr, ult, fr, extra, S.ley); h.altos[fr]=42; }
  return X.libro([h], S.E, titulo);
}
function audRegistros(C, R){
  var out=[], o=function(k, nombre, cols, filas, extra){ out.push({ k:k, nombre:nombre, blob:_audLibro(nombre, cols, filas, extra, C) }); };
  o('ley:33a', 'Registro de accidentes e incidentes', [['Fecha', 12, 'f'], ['Hora', 8, 'tx'], ['Clase', 22, 'tx'], ['Trabajador', 28, 'tx'], ['Puesto', 18, 'tx'], ['Lugar', 22, 'tx'], ['Días de descanso', 10, 'n'], ['Causas', 34, 'tx'], ['Medidas correctivas', 34, 'tx'], ['Responsable', 18, 'tx'], ['Plazo', 12, 'f']],
    C.acc.slice().sort(function(a, b){ return String(a.fecha).localeCompare(String(b.fecha)); }).map(function(a){ return [String(a.fecha||'').slice(0, 10), a.hora||'', ACC_NOMBRE[a.clase]||a.clase||'', a.t_nombre||'', a.t_puesto||'', a.lugar||'', parseInt(a.dias, 10)||0, a.causas||'', a.medidas||'', a.responsable||'', String(a.plazo||'').slice(0, 10)]; }),
    'El de OBRASST: «Accidentes e incidentes» (app y web). Las enfermedades ocupacionales no tienen un registro aparte: si hubo alguna, va en esta carpeta.');
  var emo=(C.emo||[]).slice().sort(function(a, b){ return String(a.nombre||'').localeCompare(String(b.nombre||''), 'es'); });
  o('ley:33b', 'Registro de examenes medicos ocupacionales', [['Trabajador', 32, 'tx'], ['Tipo', 16, 'tx'], ['Fecha', 12, 'f'], ['Próximo', 12, 'f'], ['Estado', 14, 'tx'], ['Aptitud', 22, 'tx']],
    emo.map(function(x){ return [x.nombre||'', x.tipo||'', String(x.fecha||'').slice(0, 10), String(x.proximo||'').slice(0, 10), AUD_EMO_EST[x.estado]||x.estado||'', AUD_APT[x.aptitud]||x.aptitud||'']; }),
    'Solo la vigencia y la aptitud: el detalle médico no va en esta carpeta.');
  o('ley:33c', 'Registro del monitoreo de agentes', [['Fecha', 12, 'f'], ['Qué se monitoreó', 36, 'tx'], ['Quién lo hizo', 26, 'tx'], ['Áreas o lugar', 24, 'tx'], ['Resultado', 22, 'tx'], ['Informe', 40, 'tx']],
    C.monL.map(function(x){ return [String(x.d.fecha).slice(0, 10), x.d.nombre||'', x.d.emp||'', x.d.areas||'', x.d.res==='fuera' ? 'Algo fuera de los límites' : (x.d.res==='ok' ? 'Dentro de los límites' : ''), ((x.d.ev||[])[0]||{}).u||'']; })
      .concat(C.monSal.map(function(x){ return [x.d.fecha, (typeof salNombre==='function' && typeof SAL_AGENTES!=='undefined') ? salNombre(SAL_AGENTES, x.d.agente) : x.d.agente, x.d.emp||'', x.d.lugar||'', (typeof SAL_RES!=='undefined' && typeof salNombre==='function') ? salNombre(SAL_RES, x.d.res) : x.d.res, ((x.d.ev||[])[0]||{}).u||'']; }))
      .sort(function(a, b){ return String(a[0]).localeCompare(String(b[0])); }));
  o('ley:33d', 'Registro de inspecciones internas', [['Fecha', 12, 'f'], ['Tipo de inspección', 40, 'tx'], ['Inspector', 30, 'tx']],
    C.insp.slice().sort(function(a, b){ return String(a.fecha).localeCompare(String(b.fecha)); }).map(function(i){ return [String(i.fecha).slice(0, 10), i.tipo||'Inspección', i.inspector||'']; }),
    C.eqi.length ? 'Además, '+_audN(C.eqi.length, 'inspección diaria de equipos', 'inspecciones diarias de equipos')+' con su QR en el periodo («Inspección diaria»).' : '');
  var tot={ h:0, n:0, d:0 }, est=C.meses.map(function(m){ var h=C.hhtMes[m]||0, a=C.accMes[m]||{ n:0, d:0 }; tot.h+=h; tot.n+=a.n; tot.d+=a.d;
    return [_audMesN(m), Math.round(h), a.n, a.d, h ? Math.round(a.n*1e6/h*100)/100 : '—', h ? Math.round(a.d*1e6/h*100)/100 : '—']; });
  if(est.length) est.push({ v:['Periodo', Math.round(tot.h), tot.n, tot.d, tot.h ? Math.round(tot.n*1e6/tot.h*100)/100 : '—', tot.h ? Math.round(tot.d*1e6/tot.h*100)/100 : '—'] });
  o('ley:33e', 'Registro de estadisticas de seguridad y salud', [['Mes', 20, 'tx'], ['Horas hombre trabajadas', 16, 'n'], ['Accidentes con descanso', 14, 'n'], ['Días perdidos', 12, 'n'], ['Índice de frecuencia', 14, 'd2'], ['Índice de severidad', 14, 'd2']], est,
    'Índice de frecuencia = accidentes con descanso × 1 000 000 / horas hombre trabajadas. Índice de severidad = días perdidos × 1 000 000 / horas hombre trabajadas.');
  var porE={}; C.kar.forEach(function(k){ var e=String(k.epp||'EPP'), q=porE[e]=porE[e]||{ n:0, u:0 }; q.n++; q.u+=(parseInt(k.cantidad, 10)||1); });
  o('ley:33f', 'Registro de equipos de seguridad o emergencia', [['Qué', 38, 'tx'], ['Detalle', 34, 'tx'], ['Entregas', 10, 'n'], ['Unidades', 10, 'n']],
    Object.keys(porE).sort(function(a, b){ return porE[b].u-porE[a].u; }).map(function(e){ return ['EPP entregado · '+e, 'kardex de la obra', porE[e].n, porE[e].u]; })
      .concat((C.D.eq||[]).map(function(q){ return ['Equipo con QR · '+(q.codigo||''), [q.tipo, q.estado].filter(Boolean).join(' · '), '', '']; })),
    'Las entregas de EPP con su firma están en el kardex de OBRASST; la estación de emergencia y los certificados de extintores, en sus carpetas.');
  var g=C.capL.map(function(x){ return [x.f, 'Capacitación', x.t, x.n ? _audN(x.n, 'persona', 'personas') : '']; })
    .concat(C.charlas.map(function(s){ return [_audLocal(s.inicio), 'Charla', s.tema||'', s.minutos ? s.minutos+' min' : '']; }))
    .concat(C.simL.map(function(x){ return [x.f, 'Simulacro', x.t, [x.d.presentes ? x.d.presentes+' presentes' : '', x.d.seg ? Math.round(x.d.seg/60*10)/10+' min' : ''].filter(Boolean).join(' · ')]; }))
    .sort(function(a, b){ return String(a[0]).localeCompare(String(b[0])); });
  o('ley:33g', 'Registro de induccion capacitacion entrenamiento y simulacros', [['Fecha', 12, 'f'], ['Qué', 16, 'tx'], ['Tema', 48, 'tx'], ['Detalle', 28, 'tx']], g,
    C.nInd ? 'Además, '+_audN(C.nInd, 'inducción', 'inducciones')+' en el periodo (la constancia de cada una está en «Inducción»).' : '');
  o('ley:33h', 'Registro de auditorias', [['Fecha', 12, 'f'], ['Auditoría', 38, 'tx'], ['Tipo', 16, 'tx'], ['Auditor', 26, 'tx'], ['No conformidades', 12, 'n'], ['Observaciones', 12, 'n'], ['Oport. de mejora', 12, 'n'], ['Informe', 40, 'tx']],
    C.audHechas.filter(function(a){ return C.en(a.fecha); }).sort(function(a, b){ return a.fecha.localeCompare(b.fecha); }).map(function(a){ return [a.fecha, a.t, AUD_AUD_TIPO[a.tipo]||a.tipo||'', a.emp||'', a.nc==null ? '' : +a.nc, a.obsn==null ? '' : +a.obsn, a.om==null ? '' : +a.om, ((a.ev||[])[0]||{}).u||'']; }));
  return out;
}

/* ══ EL CICLO DE AUDITORÍA (GESTIÓN SST) ═══════════════════════════════════════════════════════════════════════════
   Lo que guarda (sst_doc, la obra; todo en «nota», sin «url»):
   · «aud-int», una fila por auditoría interna:
       { v:1, nombre, fecha, fin, lider:{ n, cargo }, equipo, auditados, alcance, normas:['ley'|'i45'|'i14'], estado:'borrador'|'cerrada',
         items:{ <llave del requisito>:{ r:'c'|'nc'|'obs'|'om'|'na', ev, h (el hallazgo que salió) } }, conclusion, dir:{ n, cargo },
         ges (la fila «ges-act» k:'aud' que la cuenta en el programa de auditorías), por, t }
   · «aud-acc», una fila por hallazgo:
       { v:1, tipo:'nc'|'obs'|'om', origen:'int'|'ext'|'rev'|'insp'|'otro', de, deN, cl (llave del requisito), fecha, desc, causa, accion,
         resp, plazo, estado:'abierta'|'cerrada', cierre:{ fecha, nota, ev:[{ u, n }], quien }, eficacia:{ ok:true|false|null, fecha, nota }, por, t }
   · «aud-rev», una fila por revisión por la dirección:
       { v:1, fecha, desde, hasta, estado:'borrador'|'cerrada', part, preside:{ n, cargo }, pts:{ a…g }, decis:[{ t, resp, plazo, h }],
         com:{ resp, comite, trab, sind } (la fecha en que se comunicó), por, t }
   La auditoría interna es la de la empresa (ISO 45001 e ISO 14001, cláusula 9.2): la hace su equipo. No reemplaza a la del
   art. 43 de la Ley 29783 (auditor independiente del registro del MTPE). */
var AUD_RES=[['c', 'Conforme', 'ok'], ['nc', 'No conformidad', 'mal'], ['obs', 'Observación', 'ojo'], ['om', 'Oportunidad de mejora', 'azul'], ['na', 'No aplica', 'gris']];
var AUD_RES_CORTO={ c:'C', nc:'NC', obs:'Obs.', om:'OM', na:'N.A.' };
var AUD_ORIGEN=[['int', 'Auditoría interna'], ['ext', 'Auditoría externa o del cliente'], ['rev', 'Revisión por la dirección'], ['insp', 'Inspección'], ['otro', 'Otro']];
var AUD_ART89=[
  ['a', 'Si la estrategia global del sistema de gestión alcanzó los objetivos previstos'],
  ['b', 'Si el sistema satisface las necesidades de la organización y de sus partes interesadas'],
  ['c', 'Si hace falta cambiar el sistema, incluidos la política y los objetivos'],
  ['d', 'Las medidas para corregir las deficiencias, incluidas la estructura directiva y la medición de resultados'],
  ['e', 'Los antecedentes para priorizar la planificación y la mejora continua'],
  ['f', 'El avance en los objetivos y en las medidas correctivas'],
  ['g', 'La eficacia del seguimiento, con base en las vigilancias anteriores']
];
var AUD_COM=[['resp', 'A los responsables de cada aspecto'], ['comite', 'Al Comité o al Supervisor de SST'], ['trab', 'A los trabajadores'], ['sind', 'A la organización sindical (si la hay)']];
function _audTx(v, n){ return String(v==null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n||200); }
function _audArea(v, n){ return String(v==null ? '' : v).replace(/\r/g, '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, n||2000); }
function _audQuien(){ try{ return _audTx((YO && YO.nombre) || quienSoy(), 80); }catch(e){ return ''; } }
function _audFecha(v){ return /^\d{4}-\d{2}-\d{2}$/.test(String(v||'')) ? String(v) : ''; }
function _audVal(id){ var e=$(id); return e ? e.value : ''; }
/* guardar o quitar una fila del ciclo (con lo que contesta el servidor: si no guardó nada, se dice) */
function audGuardarFila(hoja, id, nombre, d){
  var fila={ nombre:_audTx(nombre, 180), nota:JSON.stringify(d) };
  if(id) return sbPatch('sst_doc?id=eq.'+encodeURIComponent(id), fila).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'No se guardó: el registro ya no está o esta cuenta no puede cambiarlo.' });
    return (rows && rows[0]) || { id:id };
  });
  fila.empresa=YO.obra.id; fila.hoja=hoja;
  return sbPostP('sst_doc', fila).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'No se guardó: esta cuenta no puede registrar en esta obra.' });
    return (rows && rows[0]) || {};
  });
}
function audQuitarFila(id){
  return sbDelP('sst_doc?id=eq.'+encodeURIComponent(id)).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'No se pudo quitar: esta cuenta no puede borrar en esta obra.' });
    return true;
  });
}
/* lo de «nota» de la obra, otra vez (después de guardar): sin volver a traer todo lo demás */
function _audRefrescarNotas(){
  var oid=(YO.obra||{}).id;
  if(!AUDW.D || AUDW.D.obra!==oid) return audTraer(true);
  return traerTodo('sst_doc', '&hoja=in.('+AUD_HOJAS_NOTA.join(',')+')&select=id,hoja,nombre,url,nota,creado&order=creado.desc', 6000).then(function(r){
    if(AUDW.D && AUDW.D.obra===oid){ AUDW.D.notas=r||[]; AUDW.t=Date.now(); AUDW.C=null; }
    return AUDW.D;
  });
}
/* el contexto para una fecha: los 12 meses que terminan ese día */
function _audCtxAl(fecha){
  var f=_audFecha(fecha) || hoyISO(), d=new Date(f+'T12:00:00'); d.setFullYear(d.getFullYear()-1); d.setDate(d.getDate()+1);
  return audContexto(AUDW.D, { k:'x', desde:_audIso(d), hasta:f, n:'' });
}
function _audChipsRes(nombre, sel){
  return '<div class="aud-res-chips" role="radiogroup" aria-label="Resultado">'+AUD_RES.map(function(x){ var on=(x[0]===sel);
    return '<button type="button" role="radio" class="aud-rc '+x[2]+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-rc="'+esc(nombre)+'" data-v="'+x[0]+'" title="'+esc(x[1])+'">'+esc(AUD_RES_CORTO[x[0]])+'</button>'; }).join('')+'</div>';
}
function _audCssCiclo(){
  if(document.getElementById('aud-css2')) return;
  var st=document.createElement('style'); st.id='aud-css2';
  st.textContent=[
    '.aud-res-chips{display:flex; gap:4px; flex-wrap:wrap}',
    '.aud-rc{font:inherit; font-size:12px; font-weight:600; border:1px solid var(--raya2); background:var(--panel); color:var(--gris); border-radius:7px; padding:4px 8px; cursor:pointer; min-width:40px}',
    '.aud-rc.on.ok{background:var(--ok-f); color:var(--ok); border-color:var(--ok)} .aud-rc.on.mal{background:var(--mal-f); color:var(--mal); border-color:var(--mal)}',
    '.aud-rc.on.ojo{background:var(--ojo-f); color:var(--ojo); border-color:var(--ojo)} .aud-rc.on.azul{background:var(--azul-f); color:var(--azul); border-color:var(--azul)} .aud-rc.on.gris{background:var(--fondo); color:var(--tinta); border-color:var(--raya2)}',
    '.aud-ck{display:grid; grid-template-columns:minmax(0,1.3fr) minmax(0,1fr); gap:8px 14px; border-top:1px solid var(--raya); padding:10px 0}',
    '.aud-ck:first-of-type{border-top:0}',
    '@media (max-width:860px){ .aud-ck{grid-template-columns:minmax(0,1fr)} }',
    '.aud-ck b{font-weight:600; font-size:13.5px} .aud-ck .aud-cl{color:var(--gris); margin-right:4px}',
    '.aud-ck small{display:block; color:var(--gris); font-size:12.5px; margin-top:3px}',
    '.aud-ck .aud-st{display:inline-block; margin-right:6px; padding:1px 6px; font-size:11px}',
    '.aud-ck input[type=text]{width:100%; margin-top:6px}',
    '.aud-form{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 16px}',
    '@media (max-width:760px){ .aud-form{grid-template-columns:minmax(0,1fr)} }',
    '.aud-form .ancho{grid-column:1/-1}',
    '.aud-form .campo{margin:0}',
    '.aud-form .lbl{display:block; font-size:12.5px; font-weight:500; color:var(--gris); margin:0 0 6px; letter-spacing:.01em}',
    '.aud-normas{display:flex; flex-wrap:wrap; gap:8px 18px}',
    '.aud-cont{display:flex; flex-wrap:wrap; gap:6px; margin:8px 0 0}',
    '.aud-datos{display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:8px}',
    '.aud-dato{border:1px solid var(--raya); border-radius:9px; padding:8px 10px; background:var(--panel); font-size:12.5px; color:var(--gris)}',
    '.aud-dato b{display:block; font-size:17px; color:var(--tinta); font-variant-numeric:tabular-nums; font-weight:600}',
    '.aud-dec{display:grid; grid-template-columns:minmax(0,2fr) minmax(0,1fr) 150px auto; gap:8px; align-items:end; margin:0 0 8px}',
    '@media (max-width:760px){ .aud-dec{grid-template-columns:minmax(0,1fr)} }',
    '.aud-dec .campo{margin:0}',
    '.aud-tabla td .sub{display:block; color:var(--gris); font-size:12px}',
    '.aud-filtros{display:flex; flex-wrap:wrap; gap:6px; margin:0 0 12px}'
  ].join('\n');
  document.head.appendChild(st);
}

/* ── «AUDITORÍA INTERNA» ── */
var AUDI={ ed:null, caja:null, n:0, R:null, C:null };
function vistaAudInt(caja){
  _audCss(); _audCssCiclo();
  AUDI.caja=caja; AUDI.ed=null;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  var n=++AUDI.n;
  audTraer(false).then(function(){ if(n!==AUDI.n || VISTA.actual!=='aud-int') return; _audIntLista(); }, function(c){ if(n===AUDI.n && VISTA.actual==='aud-int') fallo(caja, c); });
  VISTA.recargar=function(){ if(AUDI.ed || Date.now()-AUDW.t<30000) return; var m=++AUDI.n; _audRefrescarNotas().then(function(){ if(m===AUDI.n && VISTA.actual==='aud-int' && !AUDI.ed) _audIntLista(); }, function(){}); };
}
function _audInts(){
  var L=[]; (AUDW.D && AUDW.D.notas || []).forEach(function(r){ if(r && r.hoja===AUD_INT){ var d=_audNota(r); if(d) L.push({ id:r.id, creado:r.creado, d:d }); } });
  return L.sort(function(a, b){ return String(b.d.fecha||'').localeCompare(String(a.d.fecha||'')) || String(b.creado||'').localeCompare(String(a.creado||'')); });
}
function _audCuentaRes(d){ var c={ c:0, nc:0, obs:0, om:0, na:0, n:0 }; Object.keys(d.items||{}).forEach(function(k){ var r=(d.items[k]||{}).r; if(c[r]!=null){ c[r]++; c.n++; } }); return c; }
function _audIntLista(){
  var caja=AUDI.caja; if(!caja || !document.body.contains(caja)) return;
  var ac=$('acciones'), L=_audInts();
  if(ac){ ac.innerHTML='<button type="button" class="bt" id="audi-nueva">＋ Nueva auditoría interna</button>'; $('audi-nueva').onclick=function(){ audIntAbrir(null); }; }
  var h='<div class="tarj"><div class="tarj-cuerpo"><p class="ayuda" style="margin:0">La auditoría interna la hace tu equipo, requisito por requisito: la lista de verificación trae a la vista lo que la carpeta de la obra ya tiene de cada uno. '+
    'Al cerrarla, sus no conformidades, observaciones y oportunidades de mejora pasan a «Hallazgos y acciones», y cuenta sola en el programa de auditorías. No reemplaza a la auditoría del art. 43 de la Ley 29783, que hace un auditor independiente registrado en el MTPE.</p></div></div>';
  if(!L.length) h+='<div class="vacio"><b>Todavía no hay auditorías internas</b>Empieza una con «＋ Nueva auditoría interna»: eliges las normas y la lista de verificación sale sola.</div>';
  else h+='<div class="tarj"><div class="tabla-caja"><table class="aud-tabla"><thead><tr><th>Fecha</th><th>Auditoría</th><th>Normas</th><th>Resultado</th><th>Estado</th><th></th></tr></thead><tbody>'+
    L.map(function(x){ var d=x.d, c=_audCuentaRes(d);
      return '<tr><td>'+esc(_audF(d.fecha))+'</td><td><b>'+esc(d.nombre||'Auditoría interna')+'</b><span class="sub">'+esc([(d.lider||{}).n ? 'Auditor líder: '+d.lider.n : '', d.alcance].filter(Boolean).join(' · '))+'</span></td>'+
        '<td>'+esc((d.normas||[]).map(function(k){ return (AUD_SECC.filter(function(S){ return S.k===k; })[0]||{ corto:k }).corto; }).join(' · '))+'</td>'+
        '<td>'+c.c+' C · '+c.nc+' NC · '+c.obs+' Obs. · '+c.om+' OM</td>'+
        '<td><span class="pill '+(d.estado==='cerrada' ? 'ok' : 'azul')+'">'+(d.estado==='cerrada' ? 'cerrada' : 'en curso')+'</span></td>'+
        '<td><button type="button" class="bt sec chico" data-audi="'+esc(x.id)+'">Abrir</button></td></tr>'; }).join('')+'</tbody></table></div></div>';
  caja.innerHTML=h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-audi]'), function(b){ b.onclick=function(){ audIntAbrir(b.getAttribute('data-audi')); }; });
}
function audIntAbrir(id){
  var x=id ? _audInts().filter(function(y){ return y.id===id; })[0] : null;
  if(id && !x){ toast('Esa auditoría ya no está.'); _audIntLista(); return; }
  var d=x ? JSON.parse(JSON.stringify(x.d)) : { v:1, nombre:'Auditoría interna del sistema de gestión de SST', fecha:hoyISO(), fin:'', lider:{ n:_audQuien(), cargo:'' }, equipo:'', auditados:'', alcance:'', normas:['ley', 'i45'], estado:'borrador', items:{}, conclusion:'', dir:{ n:'', cargo:'' } };
  AUDI.ed={ id:x ? x.id : null, d:d };
  _audIntPintar();
}
function _audIntPintar(){
  var caja=AUDI.caja, E=AUDI.ed; if(!caja || !E) return;
  var d=E.d, cerrada=(d.estado==='cerrada'), C=AUDI.C=_audCtxAl(d.fecha), R=AUDI.R=audEvaluarTodo(C), dis=cerrada ? ' disabled' : '';
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  var sug=['Auditoría interna del sistema de gestión de SST'];
  C.progs.forEach(function(p){ if(p.d.tipo==='aud') (p.d.items||[]).forEach(function(it){ var n=_audTx(it.n, 160); if(n && sug.indexOf(n)<0) sug.push(n); }); });
  var h='<button type="button" class="bt sec" style="margin:0 0 12px" id="audi-volver">‹ Las auditorías internas</button>'+
    '<div class="tarj"><div class="tarj-cab"><div><h2>📋 '+esc(d.nombre||'Auditoría interna')+'</h2><p class="sub">'+(cerrada ? 'Cerrada · solo lectura (se puede reabrir)' : 'En curso: se guarda con «Guardar»')+'</p></div></div><div class="tarj-cuerpo"><div class="aud-form">'+
    '<div class="campo ancho"><label for="audi-n">La auditoría <span class="tenue">· con el nombre de su actividad en el programa de auditorías, para que cuente sola</span></label><input id="audi-n" list="audi-dl" maxlength="160" value="'+esc(d.nombre||'')+'"'+dis+'><datalist id="audi-dl">'+sug.map(function(n){ return '<option value="'+esc(n)+'">'; }).join('')+'</datalist></div>'+
    '<div class="campo"><label for="audi-f">Fecha de inicio</label><input type="date" id="audi-f" value="'+esc(d.fecha||'')+'" max="'+hoyISO()+'"'+dis+'></div>'+
    '<div class="campo"><label for="audi-fin">Fecha de fin <span class="tenue">· opcional</span></label><input type="date" id="audi-fin" value="'+esc(d.fin||'')+'"'+dis+'></div>'+
    '<div class="campo"><label for="audi-ln">Auditor líder</label><input id="audi-ln" maxlength="80" value="'+esc((d.lider||{}).n||'')+'"'+dis+'></div>'+
    '<div class="campo"><label for="audi-lc">Su cargo</label><input id="audi-lc" maxlength="80" value="'+esc((d.lider||{}).cargo||'')+'"'+dis+'></div>'+
    '<div class="campo"><label for="audi-eq">Equipo auditor <span class="tenue">· opcional</span></label><input id="audi-eq" maxlength="200" value="'+esc(d.equipo||'')+'"'+dis+'></div>'+
    '<div class="campo"><label for="audi-au">Áreas o personas auditadas</label><input id="audi-au" maxlength="200" value="'+esc(d.auditados||'')+'"'+dis+'></div>'+
    '<div class="campo ancho"><label for="audi-al">Alcance</label><textarea id="audi-al" rows="2" maxlength="600"'+dis+'>'+esc(d.alcance||'')+'</textarea></div>'+
    '<div class="campo ancho"><span class="lbl">Contra qué normas</span><div class="aud-normas">'+AUD_SECC.map(function(S){ return '<label class="chk"><input type="checkbox" data-audi-norma="'+S.k+'"'+((d.normas||[]).indexOf(S.k)>-1 ? ' checked' : '')+dis+'> <span>'+esc(S.n)+'</span></label>'; }).join('')+'</div></div>'+
    '</div></div></div>';
  /* la lista de verificación */
  var c=_audCuentaRes(d);
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Lista de verificación</h2><p class="sub">'+c.n+' de '+_audIntReqs(d).length+' requisitos con resultado · '+c.c+' C · '+c.nc+' NC · '+c.obs+' Obs. · '+c.om+' OM · '+c.na+' N.A. — '+
    'C conforme · NC no conformidad · Obs. observación · OM oportunidad de mejora · N.A. no aplica. Al lado de cada requisito, lo que dice la carpeta de la obra (los 12 meses hasta la fecha de inicio).</p></div>'+
    (cerrada ? '' : '<div class="acciones"><button type="button" class="bt sec chico" id="audi-sug">Sugerir con la carpeta</button></div>')+'</div><div class="tarj-cuerpo" id="audi-lista">';
  (d.normas||[]).forEach(function(k){
    var S=AUD_SECC.filter(function(x){ return x.k===k; })[0]; if(!S) return;
    h+='<div class="aud-g"><h3>'+esc(S.n)+'</h3>';
    _audCatalogo(k).forEach(function(G){
      h+='<p class="aud-p">'+esc(G.g)+'</p>';
      G.s.forEach(function(r){
        var it=(d.items||{})[r.k]||{}, x=R[r.k], E=AUD_EST[x.st];
        h+='<div class="aud-ck" data-k="'+esc(r.k)+'"><div><b><span class="aud-cl">'+esc(r.cl)+'</span>'+esc(r.t)+'</b><small><span class="aud-st '+E.cl+'">'+E.ic+' '+esc(E.n)+'</span>'+esc(x.lin)+'</small></div>'+
          '<div>'+(cerrada ? '<b>'+esc(it.r ? AUD_RES.filter(function(q){ return q[0]===it.r; })[0][1] : '—')+'</b>' : _audChipsRes(r.k, it.r||''))+
          '<input type="text" data-audi-ev="'+esc(r.k)+'" maxlength="400" placeholder="Evidencia revisada o el hallazgo" value="'+esc(it.ev||'')+'" aria-label="'+esc('Evidencia de '+r.cl+' '+r.t)+'"'+dis+'></div></div>';
      });
    });
    h+='</div>';
  });
  h+='</div></div>';
  h+='<div class="tarj"><div class="tarj-cuerpo"><div class="aud-form">'+
    '<div class="campo ancho"><label for="audi-con">Conclusión de la auditoría</label><textarea id="audi-con" rows="3" maxlength="2000"'+dis+'>'+esc(d.conclusion||'')+'</textarea></div>'+
    '<div class="campo"><label for="audi-dn">Representante de la dirección <span class="tenue">· firma el informe</span></label><input id="audi-dn" maxlength="80" value="'+esc((d.dir||{}).n||'')+'"'+dis+'></div>'+
    '<div class="campo"><label for="audi-dc">Su cargo</label><input id="audi-dc" maxlength="80" value="'+esc((d.dir||{}).cargo||'')+'"'+dis+'></div>'+
    '</div><div class="msg" id="audi-msg" role="status"></div><div class="acciones" style="margin-top:12px">'+
    (cerrada ? '<button type="button" class="bt sec" id="audi-reabrir">Reabrir</button>' : (E.id ? '<button type="button" class="bt mal" id="audi-quitar">Quitar</button>' : '')+'<button type="button" class="bt sec" id="audi-guardar">Guardar</button><button type="button" class="bt ok" id="audi-cerrar">Cerrar la auditoría</button>')+
    '<button type="button" class="bt sec" id="audi-pdf">📄 Informe en PDF</button></div></div></div>';
  caja.innerHTML=h;
  $('audi-volver').onclick=function(){ AUDI.ed=null; _audIntLista(); };
  if(!cerrada){
    Array.prototype.forEach.call(caja.querySelectorAll('[data-rc]'), function(b){ b.onclick=function(){
      var k=b.getAttribute('data-rc'), v=b.getAttribute('data-v'), it=(AUDI.ed.d.items[k]=AUDI.ed.d.items[k]||{});
      it.r=(it.r===v) ? '' : v;
      Array.prototype.forEach.call(b.parentNode.querySelectorAll('.aud-rc'), function(q){ var on=(q.getAttribute('data-v')===it.r); q.className='aud-rc '+(AUD_RES.filter(function(z){ return z[0]===q.getAttribute('data-v'); })[0][2])+(on ? ' on' : ''); q.setAttribute('aria-checked', on ? 'true' : 'false'); });
    }; });
    Array.prototype.forEach.call(caja.querySelectorAll('[data-audi-norma]'), function(x){ x.onchange=function(){ _audIntLeer(); _audIntPintar(); }; });
    $('audi-f').onchange=function(){ _audIntLeer(); _audIntPintar(); };
    $('audi-sug').onclick=_audIntSugerir;
    $('audi-guardar').onclick=function(){ audIntGuardar(false); };
    $('audi-cerrar').onclick=function(){ audIntGuardar(true); };
    if($('audi-quitar')) $('audi-quitar').onclick=_audIntQuitar;
  } else $('audi-reabrir').onclick=_audIntReabrir;
  $('audi-pdf').onclick=function(){ var b=this; _audIntLeer(); b.disabled=true; cargarEvPDF().then(function(){ var bl=audIntPdf(AUDI.ed.d), nom=_audAscii('Auditoria interna - '+(nombreObraP()||'obra')+' - '+(AUDI.ed.d.fecha||'')).slice(0, 110)+'.pdf'; bajarBlob(bl, nom); toast('Informe descargado: '+nom); b.disabled=false; }, function(){ b.disabled=false; toast('No se pudo armar el PDF. Revisa tu conexión e inténtalo otra vez.'); }); };
}
function _audIntReqs(d){ var L=[]; (d.normas||[]).forEach(function(k){ _audCatalogo(k).forEach(function(G){ G.s.forEach(function(r){ L.push(r); }); }); }); return L; }
/* lo escrito en la pantalla, al borrador */
function _audIntLeer(){
  var E=AUDI.ed; if(!E || E.d.estado==='cerrada') return;
  var d=E.d;
  if($('audi-n')){ d.nombre=_audTx(_audVal('audi-n'), 160); d.fecha=_audFecha(_audVal('audi-f')); d.fin=_audFecha(_audVal('audi-fin'));
    d.lider={ n:_audTx(_audVal('audi-ln'), 80), cargo:_audTx(_audVal('audi-lc'), 80) }; d.equipo=_audTx(_audVal('audi-eq'), 200); d.auditados=_audTx(_audVal('audi-au'), 200); d.alcance=_audArea(_audVal('audi-al'), 600);
    d.normas=AUD_SECC.map(function(S){ return S.k; }).filter(function(k){ var x=document.querySelector('[data-audi-norma="'+k+'"]'); return x && x.checked; }); }
  Array.prototype.forEach.call(document.querySelectorAll('[data-audi-ev]'), function(x){ var k=x.getAttribute('data-audi-ev'), v=_audTx(x.value, 400); if(v || d.items[k]){ (d.items[k]=d.items[k]||{}).ev=v; } });
  if($('audi-con')){ d.conclusion=_audArea(_audVal('audi-con'), 2000); d.dir={ n:_audTx(_audVal('audi-dn'), 80), cargo:_audTx(_audVal('audi-dc'), 80) }; }
  Object.keys(d.items).forEach(function(k){ var it=d.items[k]; if(!it || (!it.r && !it.ev && !it.h)) delete d.items[k]; });
}
/* sugerir con la carpeta: solo donde no hay resultado; la auditoría la decide el equipo */
function _audIntSugerir(){
  _audIntLeer();
  var d=AUDI.ed.d, R=AUDI.R, n=0, m={ ok:'c', info:'c', ojo:'obs', falta:'nc' };
  _audIntReqs(d).forEach(function(r){
    var it=d.items[r.k]||{}, x=R[r.k]; if(it.r || !x || !m[x.st]) return;
    it.r=m[x.st]; if(!it.ev) it.ev=x.lin.slice(0, 400); d.items[r.k]=it; n++;
  });
  _audIntPintar();
  toast(n ? 'Se sugirió en '+_audN(n, 'requisito', 'requisitos')+': revísalos uno por uno; la auditoría la decide tu equipo.' : 'No hay requisitos vacíos que la carpeta pueda sugerir.');
}
function _audIntMsg(t, cl){ var m=$('audi-msg'); if(m){ m.className='msg '+(cl||''); m.textContent=t||''; } }
function audIntGuardar(cerrar){
  _audIntLeer();
  var E=AUDI.ed, d=E.d;
  if(!d.nombre || d.nombre.length<3) return _audIntMsg('Escribe qué auditoría es.', 'mal');
  if(!d.fecha) return _audIntMsg('Falta la fecha de inicio.', 'mal');
  if(d.fin && d.fin<d.fecha) return _audIntMsg('La fecha de fin va después del inicio.', 'mal');
  if(!d.normas.length) return _audIntMsg('Elige contra qué normas se audita.', 'mal');
  if(!cerrar) return _audIntEscribir(false);
  if(!(d.lider||{}).n) return _audIntMsg('Falta el auditor líder.', 'mal');
  var c=_audCuentaRes(d), pend=_audIntReqs(d).filter(function(r){ return !(d.items[r.k]||{}).r; }).length;
  if(!c.n) return _audIntMsg('Ningún requisito tiene resultado todavía.', 'mal');
  var nh=_audIntReqs(d).filter(function(r){ var it=d.items[r.k]||{}; return (it.r==='nc' || it.r==='obs' || it.r==='om') && !it.h; }).length;
  confirmar('¿Cerrar la auditoría?', (pend ? _audN(pend, 'requisito queda', 'requisitos quedan')+' sin resultado. ' : '')+(nh ? 'Se crean '+_audN(nh, 'hallazgo', 'hallazgos')+' en «Hallazgos y acciones», cada uno para su acción correctiva. ' : '')+'La auditoría cuenta en el programa de auditorías.', { si:'Sí, cerrarla' }).then(function(si){ if(si) _audIntEscribir(true); });
}
function _audIntEscribir(cerrar){
  var E=AUDI.ed, d=E.d, b1=$('audi-guardar'), b2=$('audi-cerrar');
  [b1, b2].forEach(function(b){ if(b) b.disabled=true; });
  d.por=_audQuien(); d.t=Date.now();
  _audIntMsg(cerrar ? 'Cerrando…' : 'Guardando…', 'gris');
  var paso=audGuardarFila(AUD_INT, E.id, 'Auditoría interna · '+d.fecha, d).then(function(row){ if(!E.id && row && row.id) E.id=row.id; return row; });
  if(cerrar) paso=paso.then(function(){ return _audIntCerrar(E); });
  paso.then(function(){
    toast(cerrar ? 'Auditoría cerrada: sus hallazgos están en «Hallazgos y acciones».' : 'Auditoría guardada.');
    return _audRefrescarNotas();
  }).then(function(){ if(VISTA.actual==='aud-int' && AUDI.ed===E) _audIntPintar(); }, function(e){
    [b1, b2].forEach(function(b){ if(b) b.disabled=false; }); _audIntMsg('No se pudo guardar. '+porQueFallo(e), 'mal');
  });
}
/* al cerrar: cada NC, observación u oportunidad de mejora sin hallazgo es un hallazgo; y la fila del programa de auditorías */
function _audIntCerrar(E){
  var d=E.d, L=_audIntReqs(d).filter(function(r){ var it=d.items[r.k]||{}; return (it.r==='nc' || it.r==='obs' || it.r==='om') && !it.h; }), i=0;
  function sig(){
    if(i>=L.length) return Promise.resolve();
    var r=L[i++], it=d.items[r.k];
    var h={ v:1, tipo:it.r, origen:'int', de:E.id, deN:d.nombre+' · '+_audF(d.fecha), cl:r.k, fecha:d.fin||d.fecha, desc:it.ev || (r.cl+' '+r.t+': '+(it.r==='nc' ? 'no conformidad' : (it.r==='obs' ? 'observación' : 'oportunidad de mejora'))), causa:'', accion:'', resp:'', plazo:'', estado:'abierta', por:_audQuien(), t:Date.now() };
    return audGuardarFila(AUD_ACC, null, (AUD_HALL_T[it.r]||'Hallazgo')+' · '+r.cl, h).then(function(row){ it.h=(row && row.id) || 'x'; return sig(); });
  }
  return sig().then(function(){
    var c=_audCuentaRes(d), g={ v:1, k:'aud', estado:'hecho', nombre:d.nombre, fecha:d.fecha, tipo:'interna', emp:(d.lider||{}).n||'', alcance:_audTx(d.alcance, 160), nc:c.nc, obsn:c.obs, om:c.om, obs:_audTx(d.conclusion, 600), ev:[], int:E.id, por:_audQuien(), t:Date.now() };
    return audGuardarFila('ges-act', d.ges||null, 'Auditoría realizada · '+d.nombre+' · '+d.fecha, g).then(function(row){ if(!d.ges && row && row.id) d.ges=row.id; });
  }).then(function(){
    d.estado='cerrada'; d.t=Date.now();
    return audGuardarFila(AUD_INT, E.id, 'Auditoría interna · '+d.fecha, d);
  });
}
function _audIntReabrir(){
  confirmar('¿Reabrir la auditoría?', 'Vuelve a quedar en curso para corregirla. Los hallazgos que ya salieron se quedan en «Hallazgos y acciones»; al cerrarla otra vez, solo se crean los nuevos.', { si:'Sí, reabrirla' }).then(function(si){
    if(!si) return;
    var E=AUDI.ed; E.d.estado='borrador'; E.d.t=Date.now();
    audGuardarFila(AUD_INT, E.id, 'Auditoría interna · '+E.d.fecha, E.d).then(function(){ return _audRefrescarNotas(); }).then(function(){ _audIntPintar(); }, function(e){ toast('No se pudo reabrir. '+porQueFallo(e)); });
  });
}
function _audIntQuitar(){
  var E=AUDI.ed;
  confirmar('¿Quitar esta auditoría interna?', 'Se borra con su lista de verificación. Los hallazgos que ya salieron de ella se quedan.', { si:'Sí, quitarla', mal:true }).then(function(si){
    if(!si) return;
    audQuitarFila(E.id).then(function(){ toast('Auditoría quitada.'); AUDI.ed=null; return _audRefrescarNotas(); }).then(function(){ _audIntLista(); }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}

/* ── el informe de la auditoría interna, en PDF ── */
function _audPdfBase(titulo, sub){
  var J=window.jspdf.jsPDF, doc=new J({ unit:'mm', format:'a4' }), W=210, M=14;
  var T=function(s){ return String(s==null ? '' : s).replace(/[✓⚠✗○ℹ]\s?/g, '').replace(/[^\u0000-ÿ–—’“”•€\n]/g, '').replace(/[ \t]+/g, ' ').trim(); };
  doc.setFillColor(11, 42, 58); doc.rect(0, 0, W, 24, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text(T(titulo), M, 11);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.text(T([empresaDeObraP(), nombreObraP()].filter(Boolean).join(' · ')), M, 18);
  if(sub) doc.text(T(sub), W-M, 18, { align:'right' });
  var P={ doc:doc, W:W, M:M, y:32, ancho:W-2*M, T:T };
  P.sitio=function(h){ if(P.y+h>281){ doc.addPage(); P.y=18; } };
  P.tit=function(t){ P.sitio(12); P.y+=2; doc.setTextColor(11, 42, 58); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(T(t).toUpperCase(), M, P.y); P.y+=1.8; doc.setDrawColor(11, 42, 58); doc.setLineWidth(0.4); doc.line(M, P.y, W-M, P.y); P.y+=5; };
  P.par=function(t, op){ op=op||{}; doc.setFont('helvetica', op.b ? 'bold' : (op.i ? 'italic' : 'normal')); doc.setFontSize(op.s || 9.5); doc.setTextColor.apply(doc, op.c || [20, 25, 31]);
    var L=doc.splitTextToSize(T(t), op.w || P.ancho), lh=(op.s || 9.5)*0.45; L.forEach(function(l){ P.sitio(lh+1); doc.text(l, op.x || M, P.y); P.y+=lh; }); P.y+=(op.tras==null ? 1.5 : op.tras); };
  P.dato=function(et, v){ if(!v) return; doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2); doc.setTextColor(89, 100, 111); P.sitio(5); doc.text(T(et), M, P.y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 25, 31); var L=doc.splitTextToSize(T(v), P.ancho-48); doc.text(L, M+48, P.y); P.y+=Math.max(1, L.length)*4.3+0.8; };
  P.firmas=function(L){ P.sitio(34); P.y+=16; var w=(P.ancho-12)/L.length; L.forEach(function(f, i){ var x=M+i*(w+12); doc.setDrawColor(120, 130, 140); doc.setLineWidth(0.3); doc.line(x, P.y, x+w, P.y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(20, 25, 31); doc.text(T(f.n || ' '), x, P.y+4.5); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.3); doc.setTextColor(89, 100, 111); doc.text(T([f.rol, f.cargo].filter(Boolean).join(' · ')), x, P.y+8.5); }); P.y+=14; };
  P.fin=function(pie){ var n=doc.getNumberOfPages(); for(var i=1;i<=n;i++){ doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); doc.setTextColor(120, 130, 140); doc.text(T(pie), M, 290); doc.text(i+' / '+n, W-M, 290, { align:'right' }); } return doc.output('blob'); };
  return P;
}
function audIntPdf(d){
  var P=_audPdfBase('INFORME DE AUDITORÍA INTERNA', _audF(d.fecha)+(d.fin && d.fin!==d.fecha ? ' al '+_audF(d.fin) : '')), doc=P.doc, T=P.T, c=_audCuentaRes(d), R=AUDI.R || audEvaluarTodo(_audCtxAl(d.fecha));
  P.dato('Auditoría', d.nombre); P.dato('Auditor líder', [(d.lider||{}).n, (d.lider||{}).cargo].filter(Boolean).join(' · ')); P.dato('Equipo auditor', d.equipo);
  P.dato('Auditados', d.auditados); P.dato('Alcance', d.alcance); P.dato('Criterios', (d.normas||[]).map(function(k){ return (AUD_SECC.filter(function(S){ return S.k===k; })[0]||{ n:k }).n; }).join(' · '));
  P.dato('Estado', d.estado==='cerrada' ? 'Cerrada' : 'En curso (borrador)');
  P.tit('Resumen');
  P.par(c.c+' conformes · '+c.nc+' no conformidades · '+c.obs+' observaciones · '+c.om+' oportunidades de mejora · '+c.na+' no aplica · '+_audIntReqs(d).filter(function(r){ return !(d.items[r.k]||{}).r; }).length+' sin resultado');
  (d.normas||[]).forEach(function(k){
    var S=AUD_SECC.filter(function(x){ return x.k===k; })[0]; if(!S) return;
    P.tit('Lista de verificación · '+S.n);
    _audCatalogo(k).forEach(function(G){
      P.sitio(10); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.8); doc.setTextColor(89, 100, 111); doc.text(T(G.g), P.M, P.y); P.y+=4.6;
      G.s.forEach(function(r){
        var it=(d.items||{})[r.k]||{}, res=it.r ? AUD_RES.filter(function(q){ return q[0]===it.r; })[0] : null, x=R[r.k];
        doc.setFontSize(8.8); doc.setFont('helvetica', 'normal');
        var tit=doc.splitTextToSize(T(r.cl+' '+r.t), P.ancho-30), ev=it.ev ? doc.splitTextToSize(T(it.ev), P.ancho-30) : [];
        P.sitio(tit.length*4+ev.length*3.8+3);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.6);
        var col=res ? ({ c:[30, 107, 69], nc:[168, 32, 26], obs:[138, 87, 0], om:[35, 89, 154], na:[94, 110, 121] })[res[0]] : [150, 160, 170];
        doc.setTextColor.apply(doc, col); doc.text(T(res ? AUD_RES_CORTO[res[0]] : '—'), P.M, P.y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.8); doc.setTextColor(20, 25, 31); doc.text(tit, P.M+18, P.y); P.y+=tit.length*4;
        if(ev.length){ doc.setTextColor(70, 80, 90); doc.setFontSize(8.4); doc.text(ev, P.M+18, P.y); P.y+=ev.length*3.8; }
        else if(x && !res){ doc.setTextColor(120, 130, 140); doc.setFontSize(8); var lx=doc.splitTextToSize(T('La carpeta: '+x.lin), P.ancho-30); doc.text(lx, P.M+18, P.y); P.y+=lx.length*3.6; }
        P.y+=1.6;
      });
    });
  });
  var H=_audIntReqs(d).filter(function(r){ var it=d.items[r.k]||{}; return it.r==='nc' || it.r==='obs' || it.r==='om'; });
  if(H.length){ P.tit('Hallazgos ('+H.length+')'); H.forEach(function(r, i){ var it=d.items[r.k]; P.par((i+1)+'. '+AUD_HALL_T[it.r]+' · '+r.cl+' '+r.t+(it.ev ? ': '+it.ev : ''), { s:9 }); }); }
  P.tit('Conclusión'); P.par(d.conclusion || '—');
  P.firmas([{ n:(d.lider||{}).n, rol:'Auditor líder', cargo:(d.lider||{}).cargo }, { n:(d.dir||{}).n, rol:'Representante de la dirección', cargo:(d.dir||{}).cargo }]);
  P.par('La auditoría interna la realiza la empresa (ISO 45001 e ISO 14001, cláusula 9.2). No reemplaza a la auditoría del art. 43 de la Ley 29783, a cargo de un auditor independiente registrado en el MTPE.', { s:8, i:true, c:[89, 100, 111] });
  return P.fin('Informe de auditoría interna · '+(nombreObraP()||'Obra')+' · '+_audF(d.fecha));
}

/* ── «HALLAZGOS Y ACCIONES» ── */
var AUDA={ caja:null, n:0, filtro:'abiertos', ev:null, f:null };
function vistaAudAcc(caja){
  _audCss(); _audCssCiclo();
  AUDA.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  var n=++AUDA.n;
  audTraer(false).then(function(){ if(n!==AUDA.n || VISTA.actual!=='aud-acc') return; _audAccLista(); }, function(c){ if(n===AUDA.n && VISTA.actual==='aud-acc') fallo(caja, c); });
  VISTA.recargar=function(){ if(Date.now()-AUDW.t<30000) return; var m=++AUDA.n; _audRefrescarNotas().then(function(){ if(m===AUDA.n && VISTA.actual==='aud-acc') _audAccLista(); }, function(){}); };
}
function _audHalls(){
  var hoy=hoyISO(), L=[];
  (AUDW.D && AUDW.D.notas || []).forEach(function(r){ if(r && r.hoja===AUD_ACC){ var d=_audNota(r); if(d){ var x={ id:r.id, creado:r.creado, d:d }; x.cerrado=(d.estado==='cerrada'); x.vencido=!x.cerrado && !!d.plazo && String(d.plazo).slice(0, 10)<hoy; L.push(x); } } });
  return L.sort(function(a, b){ return (a.cerrado-b.cerrado) || (b.vencido-a.vencido) || String(a.d.plazo||'9999').localeCompare(String(b.d.plazo||'9999')) || String(b.d.fecha||'').localeCompare(String(a.d.fecha||'')); });
}
function _audReqN(k){ var r=k ? _audReq(k) : null; if(!r) return ''; var S=AUD_SECC.filter(function(x){ return x.k===r.norma; })[0]; return (S ? S.corto+' ' : '')+r.cl+' '+r.t; }
function _audAccLista(){
  var caja=AUDA.caja; if(!caja || !document.body.contains(caja)) return;
  var ac=$('acciones'), L=_audHalls();
  if(ac){ ac.innerHTML='<button type="button" class="bt" id="auda-nuevo">＋ Registrar un hallazgo</button><button type="button" class="bt sec" id="auda-xls">📊 Plan de acción en Excel</button>';
    $('auda-nuevo').onclick=function(){ audAccForm(null); };
    $('auda-xls').onclick=function(){ var b=this; b.disabled=true; cargarEvPDF().then(function(){ var nom=_audAscii('Plan de accion - '+(nombreObraP()||'obra')+' - '+hoyISO())+'.xlsx'; bajarBlob(audAccXls(_audHalls()), nom); toast('Descargado: '+nom); b.disabled=false; }, function(){ b.disabled=false; toast('No se pudo armar el Excel. Revisa tu conexión e inténtalo otra vez.'); }); };
  }
  var cu={ abiertos:L.filter(function(x){ return !x.cerrado; }).length, vencidos:L.filter(function(x){ return x.vencido; }).length, cerrados:L.filter(function(x){ return x.cerrado; }).length, todos:L.length };
  var F=L.filter(function(x){ return AUDA.filtro==='todos' || (AUDA.filtro==='abiertos' && !x.cerrado) || (AUDA.filtro==='vencidos' && x.vencido) || (AUDA.filtro==='cerrados' && x.cerrado); });
  var h='<div class="aud-filtros" role="radiogroup" aria-label="Qué hallazgos ver">'+[['abiertos', 'Abiertos'], ['vencidos', 'Vencidos'], ['cerrados', 'Cerrados'], ['todos', 'Todos']].map(function(o){ var on=(o[0]===AUDA.filtro);
    return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-auda-f="'+o[0]+'">'+esc(o[1])+' ('+cu[o[0]]+')</button>'; }).join('')+'</div>';
  if(!L.length) h+='<div class="vacio"><b>Todavía no hay hallazgos</b>Salen solos al cerrar una auditoría interna, y aquí se registran los de una auditoría externa o del cliente, de la revisión por la dirección o de una inspección: cada uno con su acción correctiva, su responsable, su plazo y su cierre con evidencia.</div>';
  else if(!F.length) h+='<div class="vacio"><b>Nada en este filtro</b></div>';
  else h+='<div class="tarj"><div class="tabla-caja"><table class="aud-tabla"><thead><tr><th>Tipo</th><th>Hallazgo</th><th>Acción correctiva</th><th>Responsable</th><th>Plazo</th><th>Estado</th><th></th></tr></thead><tbody>'+
    F.map(function(x){ var d=x.d;
      return '<tr><td><span class="pill '+(d.tipo==='nc' ? 'mal' : (d.tipo==='obs' ? 'ojo' : 'azul'))+'">'+esc(AUD_HALL_T[d.tipo]||'Hallazgo')+'</span></td>'+
        '<td><b>'+esc(d.desc||'—')+'</b><span class="sub">'+esc([_audReqN(d.cl), (AUD_ORIGEN.filter(function(o){ return o[0]===d.origen; })[0]||['', ''])[1]+(d.deN ? ' · '+d.deN : ''), d.fecha ? _audF(d.fecha) : ''].filter(Boolean).join(' · '))+'</span></td>'+
        '<td>'+(d.accion ? esc(d.accion) : '<span class="tenue">Falta definirla</span>')+'</td><td>'+(d.resp ? esc(d.resp) : '<span class="tenue">—</span>')+'</td>'+
        '<td>'+(d.plazo ? esc(_audF(d.plazo)) : '<span class="tenue">—</span>')+'</td>'+
        '<td><span class="pill '+(x.cerrado ? 'ok' : (x.vencido ? 'mal' : 'azul'))+'">'+(x.cerrado ? 'cerrado' : (x.vencido ? 'vencido' : 'abierto'))+'</span>'+(x.cerrado && d.eficacia && d.eficacia.ok!=null ? '<span class="sub">'+(d.eficacia.ok ? 'eficaz' : 'no eficaz')+'</span>' : '')+'</td>'+
        '<td><button type="button" class="bt sec chico" data-auda="'+esc(x.id)+'">Abrir</button></td></tr>'; }).join('')+'</tbody></table></div></div>';
  caja.innerHTML=h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-auda-f]'), function(b){ b.onclick=function(){ AUDA.filtro=b.getAttribute('data-auda-f'); _audAccLista(); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-auda]'), function(b){ b.onclick=function(){ audAccForm(b.getAttribute('data-auda')); }; });
}
/* el formulario de un hallazgo (en el cajón): lo encontrado, la acción, y el cierre con su evidencia */
function audAccForm(id){
  var x=id ? _audHalls().filter(function(y){ return y.id===id; })[0] : null;
  if(id && !x){ toast('Ese hallazgo ya no está.'); return; }
  var d=x ? JSON.parse(JSON.stringify(x.d)) : { v:1, tipo:'nc', origen:'ext', de:'', deN:'', cl:'', fecha:hoyISO(), desc:'', causa:'', accion:'', resp:'', plazo:'', estado:'abierta' };
  AUDA.f={ id:x ? x.id : null, d:d };
  var cer=(d.estado==='cerrada'), ci=d.cierre||{}, ef=d.eficacia||{};
  var reqs='<option value="">— sin requisito —</option>'+AUD_SECC.map(function(S){ return '<optgroup label="'+esc(S.n)+'">'+_audCatalogo(S.k).map(function(G){ return G.s.map(function(r){ return '<option value="'+esc(r.k)+'"'+(r.k===d.cl ? ' selected' : '')+'>'+esc(r.cl+' '+r.t)+'</option>'; }).join(''); }).join('')+'</optgroup>'; }).join('');
  var h='<div class="aud-form">'+
    '<div class="campo ancho"><span class="lbl">Tipo</span><div class="chips" id="auda-tipo" role="radiogroup">'+[['nc', 'No conformidad'], ['obs', 'Observación'], ['om', 'Oportunidad de mejora']].map(function(o){ var on=(o[0]===d.tipo); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-v="'+o[0]+'">'+esc(o[1])+'</button>'; }).join('')+'</div></div>'+
    '<div class="campo"><label for="auda-or">De dónde salió</label><select id="auda-or">'+AUD_ORIGEN.map(function(o){ return '<option value="'+o[0]+'"'+(o[0]===d.origen ? ' selected' : '')+'>'+esc(o[1])+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label for="auda-den">Cuál <span class="tenue">· la auditoría, la revisión o la inspección</span></label><input id="auda-den" maxlength="160" value="'+esc(d.deN||'')+'"></div>'+
    '<div class="campo"><label for="auda-f">Fecha en que se encontró</label><input type="date" id="auda-f" value="'+esc(d.fecha||'')+'" max="'+hoyISO()+'"></div>'+
    '<div class="campo"><label for="auda-cl">Requisito</label><select id="auda-cl">'+reqs+'</select></div>'+
    '<div class="campo ancho"><label for="auda-desc">Qué se encontró</label><textarea id="auda-desc" rows="2" maxlength="800">'+esc(d.desc||'')+'</textarea></div>'+
    '<div class="campo ancho"><label for="auda-causa">La causa <span class="tenue">· por qué pasó</span></label><textarea id="auda-causa" rows="2" maxlength="800">'+esc(d.causa||'')+'</textarea></div>'+
    '<div class="campo ancho"><label for="auda-acc">La acción correctiva</label><textarea id="auda-acc" rows="2" maxlength="800">'+esc(d.accion||'')+'</textarea></div>'+
    '<div class="campo"><label for="auda-resp">Responsable</label><input id="auda-resp" maxlength="80" value="'+esc(d.resp||'')+'"></div>'+
    '<div class="campo"><label for="auda-plazo">Plazo</label><input type="date" id="auda-plazo" value="'+esc(String(d.plazo||'').slice(0, 10))+'"></div>'+
    '</div><div class="seccion"><h3>El cierre</h3><div class="aud-form">'+
    '<div class="campo"><label for="auda-fc">Fecha de cierre</label><input type="date" id="auda-fc" value="'+esc(ci.fecha||'')+'" max="'+hoyISO()+'"></div>'+
    '<div class="campo"><label for="auda-efi">¿Fue eficaz?</label><select id="auda-efi"><option value="">Por verificar</option><option value="si"'+(ef.ok===true ? ' selected' : '')+'>Sí: no volvió a pasar</option><option value="no"'+(ef.ok===false ? ' selected' : '')+'>No: hay que volver a actuar</option></select></div>'+
    '<div class="campo ancho"><label for="auda-cn">Qué se hizo</label><textarea id="auda-cn" rows="2" maxlength="800">'+esc(ci.nota||'')+'</textarea></div>'+
    '<div class="campo ancho"><span class="lbl">La evidencia del cierre <span class="tenue">· PDF o foto</span></span><div id="auda-ev"></div></div>'+
    '</div></div><div class="msg" id="auda-msg" role="status"></div>';
  abrirHoja(x ? (AUD_HALL_T[d.tipo]||'Hallazgo')+(cer ? ' · cerrado' : '') : 'Registrar un hallazgo', 'Lo encontrado, su acción correctiva y su cierre con evidencia', h,
    (x ? '<button type="button" class="bt mal" id="auda-quitar">Quitar</button>' : '')+'<button type="button" class="bt sec" id="auda-guardar">Guardar</button>'+(cer ? '' : '<button type="button" class="bt ok" id="auda-cerrar">Cerrar el hallazgo</button>'), { sinFoco:true, ancha:true });
  var ch=$('auda-tipo'); ch.onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; Array.prototype.forEach.call(ch.querySelectorAll('.chip'), function(q){ var on=(q===b); q.className='chip'+(on ? ' on' : ''); q.setAttribute('aria-checked', on ? 'true' : 'false'); }); AUDA.f.d.tipo=b.getAttribute('data-v'); };
  AUDA.ev=_audEvid($('auda-ev'), ci.ev||[]);
  $('auda-guardar').onclick=function(){ audAccGuardar(false); };
  if($('auda-cerrar')) $('auda-cerrar').onclick=function(){ audAccGuardar(true); };
  if($('auda-quitar')) $('auda-quitar').onclick=function(){
    confirmar('¿Quitar este hallazgo?', 'Se borra con su acción y su cierre.', { si:'Sí, quitarlo', mal:true }).then(function(si){
      if(!si) return;
      audQuitarFila(AUDA.f.id).then(function(){ cerrarHoja(); toast('Hallazgo quitado.'); return _audRefrescarNotas(); }).then(function(){ if(VISTA.actual==='aud-acc') _audAccLista(); }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
    });
  };
}
/* los archivos de un cierre (como la evidencia de «Ya se hizo»): se suben al guardar */
function _audEvid(caja, lista){
  var V={ ya:(lista||[]).filter(function(x){ return x && /^https?:\/\//i.test(String(x.u||'')); }).map(function(x){ return { u:x.u, n:x.n||'archivo' }; }), nuevos:[], max:3 };
  function pinta(){
    var hay=V.ya.length+V.nuevos.length;
    caja.innerHTML='<ul class="aud-det" style="margin:0 0 8px">'+V.ya.map(function(x, i){ return '<li><span class="t">📎 <a href="'+esc(x.u)+'" target="_blank" rel="noopener">'+esc(x.n)+'</a></span><button type="button" class="bt-link" data-ya="'+i+'">Quitar</button></li>'; }).join('')+
      V.nuevos.map(function(f, i){ return '<li><span class="t">📎 '+esc(f.name)+' <span class="tenue">· se sube al guardar</span></span><button type="button" class="bt-link" data-nu="'+i+'">Quitar</button></li>'; }).join('')+'</ul>'+
      (hay<V.max ? '<label class="bt sec chico aud-subir">＋ Adjuntar<input type="file" id="auda-file" accept="application/pdf,image/*" multiple></label>' : '');
    var fi=caja.querySelector('input[type=file]');
    if(fi) fi.onchange=function(){ Array.prototype.forEach.call(this.files||[], function(f){ if(V.ya.length+V.nuevos.length<V.max && (f.size||0)<=20*1024*1024) V.nuevos.push(f); }); pinta(); };
    Array.prototype.forEach.call(caja.querySelectorAll('[data-ya]'), function(b){ b.onclick=function(){ V.ya.splice(+b.getAttribute('data-ya'), 1); pinta(); }; });
    Array.prototype.forEach.call(caja.querySelectorAll('[data-nu]'), function(b){ b.onclick=function(){ V.nuevos.splice(+b.getAttribute('data-nu'), 1); pinta(); }; });
  }
  pinta();
  return { n:function(){ return V.ya.length+V.nuevos.length; }, subir:function(){
    var out=V.ya.slice(), cola=V.nuevos.slice(), i=0;
    function sig(){ if(i>=cola.length){ V.ya=out.slice(); V.nuevos=[]; return Promise.resolve(out); } var f=cola[i++]; return subirArchivoP('auditoria', f).then(function(u){ out.push({ u:u, n:String(f.name||'archivo').slice(0, 120) }); return sig(); }); }
    return sig(); } };
}
function audAccGuardar(cerrar){
  var F=AUDA.f, d=F.d, m=$('auda-msg'), mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco) try{ $(foco).focus(); }catch(e){} };
  d.origen=_audVal('auda-or'); d.deN=_audTx(_audVal('auda-den'), 160); d.fecha=_audFecha(_audVal('auda-f')); d.cl=_audVal('auda-cl');
  d.desc=_audArea(_audVal('auda-desc'), 800); d.causa=_audArea(_audVal('auda-causa'), 800); d.accion=_audArea(_audVal('auda-acc'), 800);
  d.resp=_audTx(_audVal('auda-resp'), 80); d.plazo=_audFecha(_audVal('auda-plazo'));
  var fc=_audFecha(_audVal('auda-fc')), efi=_audVal('auda-efi'), cn=_audArea(_audVal('auda-cn'), 800);
  if(d.desc.length<5) return mal('Escribe qué se encontró.', 'auda-desc');
  if(!d.fecha) return mal('Falta la fecha en que se encontró.', 'auda-f');
  if(cerrar){
    if(d.tipo==='nc' && d.accion.length<5) return mal('Una no conformidad se cierra con su acción correctiva.', 'auda-acc');
    if(!cn && !AUDA.ev.n()) return mal('Para cerrarlo: escribe qué se hizo o adjunta la evidencia.', 'auda-cn');
  }
  var b1=$('auda-guardar'), b2=$('auda-cerrar'); [b1, b2].forEach(function(b){ if(b) b.disabled=true; });
  m.className='msg gris'; m.textContent=AUDA.ev.n() ? 'Subiendo la evidencia…' : 'Guardando…';
  AUDA.ev.subir().then(function(ev){
    d.cierre={ fecha:fc || (cerrar ? hoyISO() : ''), nota:cn, ev:ev, quien:(d.cierre && d.cierre.quien) || (cerrar ? _audQuien() : '') };
    d.eficacia={ ok:efi==='si' ? true : (efi==='no' ? false : null), fecha:(efi ? hoyISO() : ''), nota:'' };
    if(cerrar) d.estado='cerrada';
    d.por=d.por || _audQuien(); d.t=Date.now();
    return audGuardarFila(AUD_ACC, F.id, (AUD_HALL_T[d.tipo]||'Hallazgo')+' · '+(d.cl ? _audReq(d.cl).cl : d.fecha), d);
  }).then(function(){ cerrarHoja(); toast(cerrar ? 'Hallazgo cerrado.' : 'Hallazgo guardado.'); return _audRefrescarNotas(); }).then(function(){ if(VISTA.actual==='aud-acc') _audAccLista(); }, function(e){
    [b1, b2].forEach(function(b){ if(b) b.disabled=false; }); m.className='msg mal'; m.textContent='No se pudo guardar. '+porQueFallo(e);
  });
}
function audAccXls(L){
  var X=RCAP.xlsx, S=_audXlsS(X), h=new X.Hoja('Plan de acción'), cols=[['Tipo', 16], ['Qué se encontró', 46], ['Requisito', 34], ['De dónde salió', 26], ['Fecha', 12], ['Causa', 34], ['Acción correctiva', 40], ['Responsable', 20], ['Plazo', 12], ['Estado', 12], ['Cierre', 12], ['¿Eficaz?', 12]];
  h.activa=true; h.pie='Plan de acción';
  h.unir(0, 1, cols.length-1, 1, 'Plan de acción · hallazgos y acciones correctivas', S.tit); h.altos[1]=26;
  h.unir(0, 2, cols.length-1, 2, [empresaDeObraP(), nombreObraP(), 'al '+_audF(hoyISO())].filter(Boolean).join(' · '), S.sub);
  var fr=4; cols.forEach(function(c, j){ h.anchos[j]=c[1]; h.celda(j, fr, c[0], S.cab); }); h.altos[fr]=24; h.congelar={ c:0, r:fr }; fr++;
  if(!L.length){ h.unir(0, fr, cols.length-1, fr, 'Sin hallazgos registrados.', S.tx); fr++; }
  L.forEach(function(x){ var d=x.d, v=[AUD_HALL_T[d.tipo]||'', d.desc||'', _audReqN(d.cl), [(AUD_ORIGEN.filter(function(o){ return o[0]===d.origen; })[0]||['', ''])[1], d.deN].filter(Boolean).join(' · '), d.fecha||'', d.causa||'', d.accion||'', d.resp||'', d.plazo||'',
      x.cerrado ? 'Cerrado' : (x.vencido ? 'Vencido' : 'Abierto'), (d.cierre||{}).fecha||'', d.eficacia && d.eficacia.ok!=null ? (d.eficacia.ok ? 'Sí' : 'No') : ''];
    v.forEach(function(val, j){ if((j===4 || j===8 || j===10) && /^\d{4}-\d{2}-\d{2}$/.test(String(val))) h.celda(j, fr, X.serial(val), S.f); else h.celda(j, fr, val, S.tx); }); fr++; });
  return X.libro([h], S.E, 'Plan de acción');
}

/* ── «REVISIÓN POR LA DIRECCIÓN» (D.S. 005-2012-TR, arts. 89 a 91) ── */
var AUDR={ caja:null, n:0, ed:null };
function vistaAudRev(caja){
  _audCss(); _audCssCiclo();
  AUDR.caja=caja; AUDR.ed=null;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  var n=++AUDR.n;
  audTraer(false).then(function(){ if(n!==AUDR.n || VISTA.actual!=='aud-rev') return; _audRevLista(); }, function(c){ if(n===AUDR.n && VISTA.actual==='aud-rev') fallo(caja, c); });
  VISTA.recargar=function(){ if(AUDR.ed || Date.now()-AUDW.t<30000) return; var m=++AUDR.n; _audRefrescarNotas().then(function(){ if(m===AUDR.n && VISTA.actual==='aud-rev' && !AUDR.ed) _audRevLista(); }, function(){}); };
}
function _audRevs(){
  var L=[]; (AUDW.D && AUDW.D.notas || []).forEach(function(r){ if(r && r.hoja===AUD_REV){ var d=_audNota(r); if(d) L.push({ id:r.id, creado:r.creado, d:d }); } });
  return L.sort(function(a, b){ return String(b.d.fecha||'').localeCompare(String(a.d.fecha||'')); });
}
function _audRevLista(){
  var caja=AUDR.caja; if(!caja || !document.body.contains(caja)) return;
  var ac=$('acciones'), L=_audRevs(), ult=L.filter(function(x){ return x.d.estado==='cerrada'; })[0];
  if(ac){ ac.innerHTML='<button type="button" class="bt" id="audr-nueva">＋ Nueva revisión</button>'; $('audr-nueva').onclick=function(){ audRevAbrir(null); }; }
  var dias=ult ? _audDias(ult.d.fecha, hoyISO()) : null;
  var h='<div class="tarj"><div class="tarj-cuerpo"><p style="margin:0">La revisión del sistema de gestión se hace <b>por lo menos una vez al año</b> (D.S. 005-2012-TR, art. 90); sus conclusiones se registran y se comunican a los responsables, al Comité o Supervisor de SST, a los trabajadores y a la organización sindical (art. 91).</p>'+
    '<p class="ayuda" style="margin:8px 0 0">'+(ult ? 'La última cerrada: '+esc(_audF(ult.d.fecha))+(dias>366 ? ' · ya pasó más de un año: toca la siguiente.' : ' · la siguiente, antes del '+esc(_audF(_audIso(new Date(Date.parse(ult.d.fecha+'T12:00:00')+365*864e5))))+'.') : 'Todavía no hay una revisión cerrada.')+'</p></div></div>';
  if(!L.length) h+='<div class="vacio"><b>Todavía no hay revisiones</b>Empieza una con «＋ Nueva revisión»: los datos del periodo salen solos de lo que la obra registra; la dirección escribe sus conclusiones y sus decisiones.</div>';
  else h+='<div class="tarj"><div class="tabla-caja"><table class="aud-tabla"><thead><tr><th>Fecha</th><th>Periodo revisado</th><th>Decisiones</th><th>Estado</th><th></th></tr></thead><tbody>'+
    L.map(function(x){ var d=x.d; return '<tr><td>'+esc(_audF(d.fecha))+'</td><td>'+esc(_audF(d.desde)+' al '+_audF(d.hasta))+'</td><td>'+_audN((d.decis||[]).length, 'decisión', 'decisiones')+'</td>'+
      '<td><span class="pill '+(d.estado==='cerrada' ? 'ok' : 'azul')+'">'+(d.estado==='cerrada' ? 'cerrada' : 'en curso')+'</span></td><td><button type="button" class="bt sec chico" data-audr="'+esc(x.id)+'">Abrir</button></td></tr>'; }).join('')+'</tbody></table></div></div>';
  caja.innerHTML=h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-audr]'), function(b){ b.onclick=function(){ audRevAbrir(b.getAttribute('data-audr')); }; });
}
function audRevAbrir(id){
  var x=id ? _audRevs().filter(function(y){ return y.id===id; })[0] : null;
  if(id && !x){ toast('Esa revisión ya no está.'); _audRevLista(); return; }
  var hoy=hoyISO(), p=audPeriodo('12');
  var d=x ? JSON.parse(JSON.stringify(x.d)) : { v:1, fecha:hoy, desde:p.desde, hasta:p.hasta, estado:'borrador', part:'', preside:{ n:'', cargo:'' }, pts:{}, decis:[], com:{} };
  AUDR.ed={ id:x ? x.id : null, d:d };
  _audRevPintar();
}
/* los datos del periodo revisado, de lo que la obra registra (la misma cuenta de la carpeta) */
function _audRevDatos(d){
  var per={ k:'x', desde:_audFecha(d.desde) || audPeriodo('12').desde, hasta:_audFecha(d.hasta) || hoyISO(), n:'' }, C=audContexto(AUDW.D, per), R=audEvaluarTodo(C);
  var H=C.hall, ab=H.filter(function(x){ return !x.cerrado; }).length, ve=H.filter(function(x){ return x.vencido; }).length;
  var les=C.acc.filter(function(a){ return AUD_LES[a.clase]; }).length, prog=C.progs.filter(function(x){ return x.d.tipo==='sst' && C.anios[String(x.d.anio)]; }).length;
  var cuentas=AUD_SECC.map(function(S){ var c=audCuentas(R, S.k); return { n:S.corto, c:c }; });
  var revAnt=C.revs.filter(function(x){ return x.d.estado==='cerrada' && String(x.d.fecha)<per.desde; }).sort(function(a, b){ return String(b.d.fecha).localeCompare(String(a.d.fecha)); })[0];
  return { C:C, R:R, L:[
    ['Accidentes', les, _audN(C.acc.length-les, 'incidente', 'incidentes')],
    ['Índice de frecuencia', _audDec(C.IF, 2), _audNum(C.HHT)+' horas hombre'],
    ['Índice de severidad', _audDec(C.IS, 1), _audN(C.diasPerd, 'día perdido', 'días perdidos')],
    ['Actos y condiciones', C.rep.length, C.rep.length ? Math.round(C.repCerr*100/C.rep.length)+' % cerrados' : 'ninguno reportado'],
    ['Inspecciones', C.insp.length, C.eqi.length ? _audN(C.eqi.length, 'diaria de equipos', 'diarias de equipos') : ''],
    ['Capacitaciones', C.capL.length, _audN(C.charlas.length, 'charla', 'charlas')+' · '+_audN(C.nInd, 'inducción', 'inducciones')],
    ['Simulacros', C.simL.length+C.simDocs.length, ''],
    ['Auditorías', C.audHechas.filter(function(a){ return C.en(a.fecha); }).length, C.audHechas[0] ? 'la última, '+_audF(C.audHechas[0].fecha) : 'ninguna registrada'],
    ['Hallazgos abiertos', ab, ve ? ve+' vencidos' : 'ninguno vencido'],
    ['Programa anual de SST', prog ? 'Sí' : 'No', C.objAnio ? 'objetivos '+C.objAnio.anio+': '+C.objAnio.n : 'sin objetivos del periodo']
  ], cuentas:cuentas, revAnt:revAnt };
}
function _audRevPintar(){
  var caja=AUDR.caja, E=AUDR.ed; if(!caja || !E) return;
  var d=E.d, cerrada=(d.estado==='cerrada'), dis=cerrada ? ' disabled' : '', X=_audRevDatos(d);
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  var h='<button type="button" class="bt sec" style="margin:0 0 12px" id="audr-volver">‹ Las revisiones</button>'+
    '<div class="tarj"><div class="tarj-cab"><div><h2>🧭 Revisión por la dirección</h2><p class="sub">'+(cerrada ? 'Cerrada · solo lectura (se puede reabrir)' : 'En curso: se guarda con «Guardar»')+'</p></div></div><div class="tarj-cuerpo"><div class="aud-form">'+
    '<div class="campo"><label for="audr-f">Fecha de la revisión</label><input type="date" id="audr-f" value="'+esc(d.fecha||'')+'" max="'+hoyISO()+'"'+dis+'></div><div></div>'+
    '<div class="campo"><label for="audr-de">Periodo revisado: desde</label><input type="date" id="audr-de" value="'+esc(d.desde||'')+'"'+dis+'></div>'+
    '<div class="campo"><label for="audr-ha">hasta</label><input type="date" id="audr-ha" value="'+esc(d.hasta||'')+'"'+dis+'></div>'+
    '<div class="campo"><label for="audr-pn">Preside <span class="tenue">· firma el acta</span></label><input id="audr-pn" maxlength="80" value="'+esc((d.preside||{}).n||'')+'"'+dis+'></div>'+
    '<div class="campo"><label for="audr-pc">Su cargo</label><input id="audr-pc" maxlength="80" value="'+esc((d.preside||{}).cargo||'')+'"'+dis+'></div>'+
    '<div class="campo ancho"><label for="audr-part">Participantes <span class="tenue">· uno por línea: nombre y cargo</span></label><textarea id="audr-part" rows="3" maxlength="1200"'+dis+'>'+esc(d.part||'')+'</textarea></div>'+
    '</div></div></div>';
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Los datos del periodo</h2><p class="sub">Salen solos de lo que la obra registra en OBRASST, del '+esc(_audF(X.C.per.desde))+' al '+esc(_audF(X.C.per.hasta))+'</p></div></div><div class="tarj-cuerpo"><div class="aud-datos">'+
    X.L.map(function(q){ return '<div class="aud-dato">'+esc(q[0])+'<b>'+esc(String(q[1]))+'</b>'+esc(q[2]||'')+'</div>'; }).join('')+'</div>'+
    '<p class="ayuda" style="margin:10px 0 0">La carpeta de auditoría del periodo: '+X.cuentas.map(function(q){ return esc(q.n)+' — ✓ '+q.c.ok+' · ⚠ '+q.c.ojo+' · ✗ '+q.c.falta+' · ○ '+q.c.subir; }).join(' | ')+'</p>'+
    (X.revAnt ? '<p class="ayuda">La revisión anterior: '+esc(_audF(X.revAnt.d.fecha))+' · '+_audN((X.revAnt.d.decis||[]).length, 'decisión', 'decisiones')+'.</p>' : '')+'</div></div>';
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Lo que se evalúa</h2><p class="sub">D.S. 005-2012-TR, art. 89 (la vigilancia del sistema), en resumen: la conclusión de la dirección en cada punto</p></div></div><div class="tarj-cuerpo"><div class="aud-form">'+
    AUD_ART89.map(function(q){ return '<div class="campo ancho"><label for="audr-q'+q[0]+'">'+esc(q[0]+') '+q[1])+'</label><textarea id="audr-q'+q[0]+'" rows="2" maxlength="1200"'+dis+'>'+esc((d.pts||{})[q[0]]||'')+'</textarea></div>'; }).join('')+'</div></div></div>';
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Decisiones y acciones</h2><p class="sub">Al cerrar la revisión, cada una con responsable pasa a «Hallazgos y acciones» para su seguimiento</p></div>'+(cerrada ? '' : '<div class="acciones"><button type="button" class="bt sec chico" id="audr-dmas">＋ Otra decisión</button></div>')+'</div><div class="tarj-cuerpo" id="audr-decis">'+_audRevDecisHTML(d, cerrada)+'</div></div>';
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>A quién se le comunicó</h2><p class="sub">D.S. 005-2012-TR, art. 91: la fecha en que se comunicaron las conclusiones</p></div></div><div class="tarj-cuerpo"><div class="aud-form">'+
    AUD_COM.map(function(q){ return '<div class="campo"><label for="audr-c'+q[0]+'">'+esc(q[1])+'</label><input type="date" id="audr-c'+q[0]+'" value="'+esc((d.com||{})[q[0]]||'')+'"'+dis+'></div>'; }).join('')+'</div>'+
    '<div class="msg" id="audr-msg" role="status"></div><div class="acciones" style="margin-top:12px">'+
    (cerrada ? '<button type="button" class="bt sec" id="audr-reabrir">Reabrir</button>' : (E.id ? '<button type="button" class="bt mal" id="audr-quitar">Quitar</button>' : '')+'<button type="button" class="bt sec" id="audr-guardar">Guardar</button><button type="button" class="bt ok" id="audr-cerrar">Cerrar la revisión</button>')+
    '<button type="button" class="bt sec" id="audr-pdf">📄 Acta en PDF</button></div></div></div>';
  caja.innerHTML=h;
  $('audr-volver').onclick=function(){ AUDR.ed=null; _audRevLista(); };
  if(!cerrada){
    ['audr-de', 'audr-ha'].forEach(function(id){ $(id).onchange=function(){ _audRevLeer(); _audRevPintar(); }; });
    $('audr-dmas').onclick=function(){ _audRevLeer(); if((AUDR.ed.d.decis||[]).length<20){ AUDR.ed.d.decis.push({ t:'', resp:'', plazo:'' }); } _audRevPintar(); };
    Array.prototype.forEach.call(caja.querySelectorAll('[data-audr-dq]'), function(b){ b.onclick=function(){ _audRevLeer(); AUDR.ed.d.decis.splice(+b.getAttribute('data-audr-dq'), 1); _audRevPintar(); }; });
    $('audr-guardar').onclick=function(){ audRevGuardar(false); };
    $('audr-cerrar').onclick=function(){ audRevGuardar(true); };
    if($('audr-quitar')) $('audr-quitar').onclick=function(){
      confirmar('¿Quitar esta revisión?', 'Se borra el acta. Las acciones que ya salieron de ella se quedan en «Hallazgos y acciones».', { si:'Sí, quitarla', mal:true }).then(function(si){
        if(!si) return;
        audQuitarFila(AUDR.ed.id).then(function(){ toast('Revisión quitada.'); AUDR.ed=null; return _audRefrescarNotas(); }).then(function(){ _audRevLista(); }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
      });
    };
  } else $('audr-reabrir').onclick=function(){
    confirmar('¿Reabrir la revisión?', 'Vuelve a quedar en curso para corregirla. Las acciones que ya salieron se quedan; al cerrarla otra vez, solo se crean las nuevas.', { si:'Sí, reabrirla' }).then(function(si){
      if(!si) return; var E2=AUDR.ed; E2.d.estado='borrador'; E2.d.t=Date.now();
      audGuardarFila(AUD_REV, E2.id, 'Revisión por la dirección · '+E2.d.fecha, E2.d).then(function(){ return _audRefrescarNotas(); }).then(function(){ _audRevPintar(); }, function(e){ toast('No se pudo reabrir. '+porQueFallo(e)); });
    });
  };
  $('audr-pdf').onclick=function(){ var b=this; _audRevLeer(); b.disabled=true; cargarEvPDF().then(function(){ var nom=_audAscii('Revision por la direccion - '+(nombreObraP()||'obra')+' - '+(AUDR.ed.d.fecha||'')).slice(0, 110)+'.pdf'; bajarBlob(audRevPdf(AUDR.ed.d), nom); toast('Acta descargada: '+nom); b.disabled=false; }, function(){ b.disabled=false; toast('No se pudo armar el PDF. Revisa tu conexión e inténtalo otra vez.'); }); };
}
function _audRevDecisHTML(d, cerrada){
  var L=d.decis||[];
  if(!L.length) return '<p class="ayuda" style="margin:0">'+(cerrada ? 'Sin decisiones.' : 'Las decisiones de mejora, de cambios o de recursos: agrega cada una con «＋ Otra decisión».')+'</p>';
  return L.map(function(x, i){ var dis=cerrada ? ' disabled' : '';
    return '<div class="aud-dec"><div class="campo"><label for="audr-dt'+i+'">Decisión '+(i+1)+'</label><input id="audr-dt'+i+'" maxlength="300" value="'+esc(x.t||'')+'"'+dis+'></div>'+
      '<div class="campo"><label for="audr-dr'+i+'">Responsable</label><input id="audr-dr'+i+'" maxlength="80" value="'+esc(x.resp||'')+'"'+dis+'></div>'+
      '<div class="campo"><label for="audr-dp'+i+'">Plazo</label><input type="date" id="audr-dp'+i+'" value="'+esc(x.plazo||'')+'"'+dis+'></div>'+
      (cerrada ? (x.h ? '<span class="pill ok">en seguimiento</span>' : '<span></span>') : '<button type="button" class="bt-link" data-audr-dq="'+i+'">Quitar</button>')+'</div>'; }).join('');
}
function _audRevLeer(){
  var E=AUDR.ed; if(!E || E.d.estado==='cerrada') return;
  var d=E.d;
  d.fecha=_audFecha(_audVal('audr-f')); d.desde=_audFecha(_audVal('audr-de')); d.hasta=_audFecha(_audVal('audr-ha'));
  d.preside={ n:_audTx(_audVal('audr-pn'), 80), cargo:_audTx(_audVal('audr-pc'), 80) }; d.part=_audArea(_audVal('audr-part'), 1200);
  d.pts={}; AUD_ART89.forEach(function(q){ var v=_audArea(_audVal('audr-q'+q[0]), 1200); if(v) d.pts[q[0]]=v; });
  d.decis=(d.decis||[]).map(function(x, i){ return $('audr-dt'+i) ? { t:_audTx(_audVal('audr-dt'+i), 300), resp:_audTx(_audVal('audr-dr'+i), 80), plazo:_audFecha(_audVal('audr-dp'+i)), h:x.h||'' } : x; });
  d.com={}; AUD_COM.forEach(function(q){ var v=_audFecha(_audVal('audr-c'+q[0])); if(v) d.com[q[0]]=v; });
}
function _audRevMsg(t, cl){ var m=$('audr-msg'); if(m){ m.className='msg '+(cl||''); m.textContent=t||''; } }
function audRevGuardar(cerrar){
  _audRevLeer();
  var E=AUDR.ed, d=E.d;
  if(!d.fecha) return _audRevMsg('Falta la fecha de la revisión.', 'mal');
  if(!d.desde || !d.hasta || d.hasta<d.desde) return _audRevMsg('Revisa el periodo revisado: desde y hasta.', 'mal');
  if(cerrar){
    if(!(d.preside||{}).n) return _audRevMsg('Falta quién preside la revisión.', 'mal');
    if(Object.keys(d.pts||{}).length<3) return _audRevMsg('Escribe la conclusión de la dirección por lo menos en tres de los puntos.', 'mal');
  }
  var nuevas=(d.decis||[]).filter(function(x){ return x.t && x.resp && !x.h; }).length;
  var sigue=function(){
    var b1=$('audr-guardar'), b2=$('audr-cerrar'); [b1, b2].forEach(function(b){ if(b) b.disabled=true; });
    d.por=d.por || _audQuien(); d.t=Date.now();
    _audRevMsg(cerrar ? 'Cerrando…' : 'Guardando…', 'gris');
    var paso=audGuardarFila(AUD_REV, E.id, 'Revisión por la dirección · '+d.fecha, d).then(function(row){ if(!E.id && row && row.id) E.id=row.id; });
    if(cerrar) paso=paso.then(function(){
      var L=(d.decis||[]).filter(function(x){ return x.t && x.resp && !x.h; }), i=0;
      function sig(){
        if(i>=L.length) return Promise.resolve();
        var x=L[i++], hh={ v:1, tipo:'om', origen:'rev', de:E.id, deN:'Revisión por la dirección · '+_audF(d.fecha), cl:'i45:9.3', fecha:d.fecha, desc:x.t, causa:'', accion:x.t, resp:x.resp, plazo:x.plazo||'', estado:'abierta', por:_audQuien(), t:Date.now() };
        return audGuardarFila(AUD_ACC, null, 'Acción de la revisión por la dirección', hh).then(function(row){ x.h=(row && row.id) || 'x'; return sig(); });
      }
      return sig().then(function(){ d.estado='cerrada'; d.t=Date.now(); return audGuardarFila(AUD_REV, E.id, 'Revisión por la dirección · '+d.fecha, d); });
    });
    paso.then(function(){ toast(cerrar ? 'Revisión cerrada.' : 'Revisión guardada.'); return _audRefrescarNotas(); }).then(function(){ if(VISTA.actual==='aud-rev' && AUDR.ed===E) _audRevPintar(); }, function(e){
      [b1, b2].forEach(function(b){ if(b) b.disabled=false; }); _audRevMsg('No se pudo guardar. '+porQueFallo(e), 'mal');
    });
  };
  if(!cerrar) return sigue();
  confirmar('¿Cerrar la revisión?', (nuevas ? 'Se crean '+_audN(nuevas, 'acción', 'acciones')+' en «Hallazgos y acciones», cada una con su responsable y su plazo. ' : '')+'El acta queda como la revisión del periodo; sus conclusiones se comunican (art. 91).', { si:'Sí, cerrarla' }).then(function(si){ if(si) sigue(); });
}
function audRevPdf(d){
  var P=_audPdfBase('REVISIÓN POR LA DIRECCIÓN', _audF(d.fecha)), X=_audRevDatos(d);
  P.dato('Periodo revisado', 'del '+_audF(d.desde)+' al '+_audF(d.hasta)); P.dato('Preside', [(d.preside||{}).n, (d.preside||{}).cargo].filter(Boolean).join(' · '));
  P.dato('Participantes', String(d.part||'').split('\n').map(function(x){ return x.trim(); }).filter(Boolean).join(' · '));
  P.dato('Estado', d.estado==='cerrada' ? 'Cerrada' : 'En curso (borrador)');
  P.tit('Los datos del periodo (OBRASST)');
  X.L.forEach(function(q){ P.par(q[0]+': '+q[1]+(q[2] ? ' ('+q[2]+')' : ''), { s:9, tras:0.6 }); });
  P.par('La carpeta de auditoría del periodo: '+X.cuentas.map(function(q){ return q.n+' — hay '+q.c.ok+', revisar '+q.c.ojo+', falta '+q.c.falta+', subir '+q.c.subir; }).join(' · '), { s:8.6, c:[89, 100, 111] });
  P.tit('Lo que se evalúa (D.S. 005-2012-TR, art. 89)');
  AUD_ART89.forEach(function(q){ P.par(q[0]+') '+q[1], { b:1, s:9.2, tras:0.6 }); P.par((d.pts||{})[q[0]] || '—', { s:9 }); });
  P.tit('Decisiones y acciones');
  if(!(d.decis||[]).length) P.par('Sin decisiones registradas.');
  (d.decis||[]).forEach(function(x, i){ P.par((i+1)+'. '+x.t+(x.resp ? ' · Responsable: '+x.resp : '')+(x.plazo ? ' · Plazo: '+_audF(x.plazo) : ''), { s:9.2 }); });
  P.tit('Comunicación de las conclusiones (art. 91)');
  AUD_COM.forEach(function(q){ P.par(q[1]+': '+((d.com||{})[q[0]] ? _audF(d.com[q[0]]) : 'pendiente'), { s:9, tras:0.6 }); });
  P.firmas([{ n:(d.preside||{}).n, rol:'Preside la revisión', cargo:(d.preside||{}).cargo }]);
  return P.fin('Revisión por la dirección · '+(nombreObraP()||'Obra')+' · '+_audF(d.fecha));
}
