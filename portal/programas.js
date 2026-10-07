/* OBRASST · portal/programas.js — los programas del año, por la web (07/10/2026)
   Marcelo: «También el tener la opción de armar el programa de capacitaciones, programa de inspecciones, programa de
   simulacros, programa de campaña, programa anual sst, ve la forma y que sea ordenado, la manera que sea firmado según
   lo que pide la norma para cada país y sector.»

   Se escribe a mano y se pide al abrir «Programas del año» (index: cargarProgramas / progIr). Llega después de
   gestion.js (las ayudas y el personal), de evaluaciones-pdf.js (jsPDF y el Excel) y de papeles.js (el dibujo de las
   hojas: _ppDoc, la vista previa, lo de la empresa).

   QUÉ ES UN PROGRAMA
   Una hoja por año: las actividades en filas y los doce meses en columnas. En cada mes, P = programado y E = ejecutado.
   · La P la pone quien arma el programa (un toque en el mes).
   · La E se cuenta SOLA con lo que la obra ya registra en OBRASST —las capacitaciones (las rendidas en la app y las
     registradas a mano), las inspecciones, los simulacros y las campañas—, buscando por el NOMBRE de la actividad; y
     también se puede marcar a mano (otro toque), para lo que se hizo y no pasó por aquí.
   · El programa anual de SST es el paraguas: sus actividades propias (a mano) y una fila por cada uno de los otros
     cuatro programas, que se llena sola con lo que digan ellos.

   LO QUE GUARDA, Y DÓNDE
   sst_doc, hoja «ges-prog», SIN «url» (no es un archivo de ninguna carpeta), una fila por programa y año:
     nota = { v:1, k:'prog', tipo:'sst'|'cap'|'insp'|'sim'|'camp', anio, cod, ver, aprob, acta, obj, alc, meta, ind,
              pres, rec, items:[{ id, n, resp, a, h, fr, g, ref, m:[12 × 0|1|2], obs }], firmas:[{ rol, nombre, cargo }],
              base:true|false, por, cuando, cambio }
   En «m»: 0 = nada · 1 = programado · 2 = programado y ejecutado (marcado a mano).

   LAS FIRMAS, SEGÚN LA NORMA
   Solo lo verificado en la fuente oficial (PROG_PE y PROG_EXIGE, más abajo). Donde la norma dice quién aprueba, ese
   va de firmante y su cita se imprime debajo; donde no hay nada verificado, las firmas de uso —elaboró, revisó,
   aprobó— y ninguna cita. Es mejor un casillero vacío que una norma inventada. Todo se puede cambiar a mano. */
var PROG_HOJA = 'ges-prog';
var PROG_TIPOS = [
  { k:'sst',  ic:'🧭', n:'Programa anual de SST', tit:'PROGRAMA ANUAL DE SEGURIDAD Y SALUD EN EL TRABAJO', una:'actividad', varias:'actividades',
    d:'El paraguas del año: el objetivo, la meta, las actividades de gestión mes a mes y, colgados de él, los otros cuatro programas.',
    obj:'Prevenir los accidentes de trabajo y las enfermedades ocupacionales mediante la gestión de los riesgos de la obra, el cumplimiento de la normativa de seguridad y salud en el trabajo y la mejora continua.' },
  { k:'cap',  ic:'🎓', n:'Programa de capacitación', tit:'PROGRAMA ANUAL DE CAPACITACIONES', una:'capacitación', varias:'capacitaciones', acceso:'',
    d:'Los temas del año, mes a mes, con su responsable, a quién va dirigido y sus horas. Lo dictado se cuenta solo.',
    obj:'Dar a cada trabajador los conocimientos y las habilidades para hacer su trabajo de forma segura, según los peligros de su puesto.' },
  { k:'insp', ic:'🔎', n:'Programa de inspecciones', tit:'PROGRAMA ANUAL DE INSPECCIONES', una:'inspección', varias:'inspecciones', acceso:'inspec',
    d:'Qué se inspecciona, con qué frecuencia y quién responde. Las inspecciones registradas se cuentan solas.',
    obj:'Detectar a tiempo las condiciones y los actos subestándares de la obra y corregirlos antes de que causen un accidente.' },
  { k:'sim',  ic:'🧯', n:'Programa de simulacros', tit:'PROGRAMA ANUAL DE SIMULACROS', una:'simulacro', varias:'simulacros', masc:1, acceso:'simulacros',
    d:'Los simulacros del año, con su escenario y su responsable. Los realizados se cuentan solos.',
    obj:'Comprobar que el plan de respuesta ante emergencias funciona y que el personal sabe qué hacer cuando ocurre una.' },
  { k:'camp', ic:'🎯', n:'Programa de campañas', tit:'PROGRAMA ANUAL DE CAMPAÑAS DE SEGURIDAD', una:'campaña', varias:'campañas', acceso:'campanas',
    d:'Las campañas de seguridad del año, con su mensaje y su responsable. Las realizadas se cuentan solas.',
    obj:'Reforzar la cultura de prevención con campañas sobre los riesgos más importantes de la obra.' }
];
function progTipo(k){ for(var i=0;i<PROG_TIPOS.length;i++) if(PROG_TIPOS[i].k===k) return PROG_TIPOS[i]; return PROG_TIPOS[0]; }
/* «programada», «cumplidas», «atrasada»… con el género de lo que cuenta ese programa (los simulacros, en masculino) */
function progGen(tipo, palabra){ return progTipo(tipo).masc ? String(palabra).replace(/a(s?)$/, 'o$1').replace(/A(S?)$/, 'O$1') : palabra; }
var PROG_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
function progMes(i, largo){ var n=PROG_MESES[i]||''; if(i===8 && paisObraP()!=='pe') n='septiembre'; return largo ? n : (n.charAt(0).toUpperCase()+n.slice(1, 3)); }
var PROG_FREQ = [['mensual', 'Mensual'], ['semanal', 'Semanal'], ['diaria', 'Diaria'], ['trimestral', 'Trimestral'], ['semestral', 'Semestral'], ['anual', 'Anual'], ['porEvento', 'Por evento']];
function progFreqN(k){ for(var i=0;i<PROG_FREQ.length;i++) if(PROG_FREQ[i][0]===k) return PROG_FREQ[i][1]; return ''; }
/* las líneas del programa anual de SST (para ordenar sus actividades) */
var PROG_LINEAS = ['Gestión y liderazgo', 'Peligros y riesgos', 'Capacitación', 'Inspecciones', 'Salud ocupacional', 'Emergencias', 'Accidentes e incidentes', 'Campañas y participación', 'Mejora continua'];
/* lo sugerido para el programa anual de SST: actividades de gestión de uso general (sin citar normas). «ref» = la fila
   que se llena sola con otro programa · «cada»: cada cuántos meses (1 = todos) · «en»: el mes en que cae (0 = enero) ·
   «fuera»: cómo se llama fuera del Perú y de República Dominicana (allá el comité tiene otro nombre en cada país) */
var PROG_SST_BASE = [
  { g:'Gestión y liderazgo',        n:'Difundir la política y los objetivos de seguridad y salud en el trabajo', en:[0] },
  { g:'Gestión y liderazgo',        n:'Reunión mensual del Comité de SST', fuera:'Reunión del comité paritario de seguridad y salud en el trabajo', cada:1 },
  { g:'Peligros y riesgos',         n:'Revisar y actualizar la matriz IPERC', en:[0, 6] },
  { g:'Peligros y riesgos',         n:'Revisar los procedimientos de trabajo seguro de las tareas de alto riesgo', en:[1, 7] },
  { g:'Capacitación',               ref:'cap' },
  { g:'Inspecciones',               ref:'insp' },
  { g:'Salud ocupacional',          n:'Exámenes médicos ocupacionales del personal', en:[2] },
  { g:'Salud ocupacional',          n:'Monitoreo de agentes ocupacionales (ruido, polvo, iluminación)', en:[5] },
  { g:'Emergencias',                ref:'sim' },
  { g:'Emergencias',                n:'Revisar el plan de respuesta ante emergencias y los equipos de emergencia', en:[0, 6] },
  { g:'Accidentes e incidentes',    n:'Revisar las estadísticas de accidentes e incidentes del mes', cada:1 },
  { g:'Campañas y participación',   ref:'camp' },
  { g:'Mejora continua',            n:'Auditoría interna del sistema de gestión', en:[9] },
  { g:'Mejora continua',            n:'Revisión del sistema por la dirección', en:[11] }
];

/* ── LO QUE PIDE LA NORMA ───────────────────────────────────────────────────────────────────────
   El Perú: el artículo 42 del reglamento (D.S. 005-2012-TR), con el texto que le dio el D.S. 001-2021-TR, leído en El
   Peruano (publicado el 29/01/2021) el 07/10/2026; lo demás es lo que ya dicen las fichas de la app. «firma»: habla de
   quién aprueba (va debajo de las firmas) · «sector»: solo en ese sector. */
var PROG_PE_U = 'https://busquedas.elperuano.pe/dispositivo/NL/1923867-3';
var PROG_PE = {
  sst: [
    { v:'El Comité de SST —o el Supervisor de SST, donde no hay comité— conoce, aprueba y da seguimiento al cumplimiento del Programa Anual de Seguridad y Salud en el Trabajo.', n:'D.S. 005-2012-TR, art. 42, inc. c) (texto del D.S. 001-2021-TR)', u:PROG_PE_U, firma:1 },
    { v:'El Comité se reúne cada mes para analizar y evaluar el avance de los objetivos del programa anual.', n:'D.S. 005-2012-TR, art. 42, inc. r) (texto del D.S. 001-2021-TR)', u:PROG_PE_U },
    { v:'En construcción, además: Plan de Seguridad y Salud en el Trabajo específico para cada obra, antes de empezar.', n:'D.S. 011-2019-TR', sector:'construccion' }
  ],
  cap: [
    { v:'El Comité de SST —o el Supervisor de SST, donde no hay comité— conoce, aprueba y da seguimiento al cumplimiento del Programa Anual de Capacitaciones en seguridad y salud en el trabajo.', n:'D.S. 005-2012-TR, art. 42, inc. c) (texto del D.S. 001-2021-TR)', u:PROG_PE_U, firma:1 },
    { v:'Mínimo 4 capacitaciones al año.', n:'Ley 29783, art. 35' },
    { v:'En minería: programa de capacitación anual aprobado por el comité.', n:'D.S. 024-2016-EM', sector:'mineria', firma:1 }
  ],
  insp: [
    { v:'El Comité de SST —o el Supervisor de SST— realiza inspecciones periódicas del lugar de trabajo y de sus instalaciones, maquinarias y equipos.', n:'D.S. 005-2012-TR, art. 42, inc. i) (texto del D.S. 001-2021-TR)', u:PROG_PE_U }
  ],
  sim: [], camp: []
};
/* Los demás países: tal cual está en exige.js (lo verificado de cada país, con su norma y su enlace). Cada entrada se
   busca por su pregunta ('q') o por cómo empieza su texto ('v'); el tercer dato dice si habla de quién aprueba o firma.
   armar.py se para si alguna deja de existir. */
var PROG_EXIGE = {
  cl:{ sst:[['q', 'Programa preventivo', 1]], cap:[['q', 'Capacitación mínima']], sim:[['q', 'Simulacros']] },
  co:{ cap:[['q', 'Revisión del programa de capacitación', 1], ['q', 'Capacitaciones mínimas al año']], sim:[['q', 'Simulacros']] },
  ar:{ sst:[['v', 'Funciones de los servicios: programa anual de prevención'], ['v', 'Aviso de inicio de obra']], cap:[['q', 'Capacitaciones mínimas por año']], insp:[['q', 'Frecuencia de inspección de equipos contra incendio']] },
  'do':{ sst:[['q', 'Quién hace el programa', 1], ['q', 'Programa de SST']], cap:[['q', 'Capacitación del trabajador']] },
  uy:{ sst:[['q', 'Estudio y Plan de Seguridad e Higiene', 1]], cap:[['q', 'Al empezar la obra']] },
  mx:{ sst:[['q', 'Diagnóstico y programa']], insp:[['q', 'Recorridos de la comisión']], sim:[['q', 'Emergencias']] },
  us:{ sst:[['q', 'Programa e inspecciones']], insp:[['q', 'Programa e inspecciones']], cap:[['q', 'Capacitación']] },
  ca:{ sst:[['q', 'Política y programa'], ['q', 'Programa de prevención']], cap:[['q', 'Capacitación básica']], insp:[['q', 'El comité por dentro']] }
};
/* lo que pide la norma del país de la obra para este programa → [{ v, n, u, firma }] (vacío: nada verificado) */
function progNorma(tipo){
  var p=paisObraP(), sec=sectorObraP(), out=[];
  if(p==='pe'){
    (PROG_PE[tipo]||[]).forEach(function(x){ if(!x.sector || x.sector===sec) out.push({ v:x.v, n:x.n, u:x.u||'', firma:!!x.firma }); });
    return out;
  }
  var R=(PROG_EXIGE[p]||{})[tipo]||[], E=(typeof EXIGE==='object' && EXIGE && EXIGE[p]) || null;
  if(!E) return out;
  R.forEach(function(r){
    var hallado=null;
    (E.g||[]).forEach(function(g){ (g.i||[]).forEach(function(i){ if(hallado) return; if(r[0]==='q' ? i.q===r[1] : String(i.v||'').indexOf(r[1])===0) hallado=i; }); });
    if(hallado) out.push({ v:(r[0]==='q' ? hallado.q+': ' : '')+hallado.v, n:hallado.n||'', u:hallado.u||'', firma:!!r[2] });
  });
  return out;
}
/* quién está designado en la obra (Brigada y comité): el presidente del comité —o del sub-comité— y el supervisor de SST */
function progDesignados(){
  var nada=function(){ return null; };
  return Promise.all([estadoLeerP('cargos').catch(nada), traerTodo('sst_trabajador', '&select=id,ext,nombre,puesto,estatus&order=nombre.asc', 5000).catch(nada)]).then(function(r){
    var G=(r[0] && r[0].valor && r[0].valor.c) || {}, por={}, o={ pres:'', sup:'' };
    (r[1]||[]).forEach(function(t){ if(t && String(t.estatus||'activo')!=='cesado') por[String(t.ext || t.id)]=t.nombre||''; });
    var de=function(cartel, rol){ var a=(G[cartel] && G[cartel].asig) || {}; for(var id in a) if(a[id]===rol && por[id]) return por[id]; return ''; };
    o.pres=de('comite', 'pres') || de('subcomite', 'pres'); o.sup=de('supervisor', 'tit');
    return o;
  }, function(){ return { pres:'', sup:'' }; });
}
/* las firmas de partida, según el país, el sector y el programa (lo que la norma verificada dice; si no, las de uso) */
function progFirmasDef(tipo, des){
  var p=paisObraP(), sec=sectorObraP(), yo=''; try{ yo=gesQuien(); }catch(e){}
  des=des||{};
  var E={ rol:'Elaborado por', nombre:yo, cargo:'' }, R={ rol:'Revisado por', nombre:'', cargo:'' }, A={ rol:'Aprobado por', nombre:'', cargo:'' };
  if(p==='pe' && (tipo==='sst' || tipo==='cap')){
    var com=(sec==='mineria') ? 'Comité de Seguridad y Salud Ocupacional' : 'Comité de SST';
    if(des.pres){ A.nombre=des.pres; A.cargo='Presidente del '+com; }
    else if(des.sup){ A.nombre=des.sup; A.cargo='Supervisor de SST'; }
    else A.cargo=com+' o Supervisor de SST';
    return [E, R, A];
  }
  if(p==='cl' && tipo==='sst'){ A.cargo='Representante legal'; return [E, A]; }
  if(p==='co' && tipo==='cap') return [E, { rol:'Revisado con', nombre:'', cargo:'COPASST o vigía' }, { rol:'Aprobado por', nombre:'', cargo:'Alta dirección' }];
  if(p==='do' && tipo==='sst') return [{ rol:'Elaborado por', nombre:'', cargo:'Proveedor certificado por el Ministerio de Trabajo' }, A];
  if(p==='uy' && tipo==='sst') return [{ rol:'Elaborado por', nombre:yo, cargo:'Técnico prevencionista' }, A];
  if(p==='ar' && (tipo==='sst' || tipo==='cap')) return [{ rol:'Elaborado por', nombre:yo, cargo:'Servicio de Higiene y Seguridad' }, A];
  return [E, R, A];
}

/* ── lo guardado ──────────────────────────────────────────────────────────────────────────── */
var PROGD = { obra:null, filas:null, t:0 };
function progTraer(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && PROGD.obra===oid && PROGD.filas && Date.now()-PROGD.t<3000) return Promise.resolve(PROGD.filas);
  return traer('sst_doc', '&select=id,hoja,nombre,nota,creado&hoja=eq.'+PROG_HOJA+'&order=creado.desc', 400).then(function(rows){
    var l=[];
    (rows||[]).forEach(function(r){
      if(!r || r.hoja!==PROG_HOJA) return;
      var d=nota(r.nota); if(!d || typeof d!=='object' || d.k!=='prog' || !d.tipo || !d.anio) return;
      l.push({ id:r.id, creado:r.creado, texto:String(r.nota||''), d:progLimpio(d) });
    });
    PROGD.obra=oid; PROGD.filas=l; PROGD.t=Date.now();
    return l;
  });
}
function progDe(filas, tipo, anio){ return (filas||[]).filter(function(f){ return f.d.tipo===tipo && String(f.d.anio)===String(anio); })[0] || null; }
function _pgMeses(m){ var o=[]; for(var i=0;i<12;i++){ var v=parseInt((m||[])[i], 10); o.push(v===1 || v===2 ? v : 0); } return o; }
var _PG_SEQ = 0;
function _pgId(){ return 'a'+Date.now().toString(36)+(++_PG_SEQ).toString(36); }
/* lo que llega de la nube, a la forma que usa la página (sin tocar lo que no conoce) */
function progLimpio(n){
  var d={}, k;
  for(k in n) if(Object.prototype.hasOwnProperty.call(n, k)) d[k]=n[k];
  d.v=1; d.k='prog'; d.tipo=progTipo(n.tipo).k; d.anio=String(n.anio||'').slice(0, 4);
  ['cod', 'ver', 'aprob', 'acta', 'obj', 'alc', 'meta', 'ind', 'pres', 'rec'].forEach(function(c){ d[c]=String(n[c]==null ? '' : n[c]); });
  d.items=(Array.isArray(n.items) ? n.items : []).map(function(x){
    x=x||{};
    var o={ id:String(x.id||_pgId()), n:String(x.n||''), resp:String(x.resp||''), a:String(x.a||''), h:(x.h==null || x.h==='') ? '' : String(x.h), fr:String(x.fr||''), g:String(x.g||''), obs:String(x.obs||''), m:_pgMeses(x.m) };
    if(x.ref && progTipo(x.ref).k===x.ref && x.ref!=='sst') o.ref=x.ref;
    return o;
  });
  d.firmas=(Array.isArray(n.firmas) ? n.firmas : []).slice(0, 6).map(function(f){ f=f||{}; return { rol:String(f.rol||''), nombre:String(f.nombre||''), cargo:String(f.cargo||'') }; });
  d.base=(n.base!==false);
  return d;
}
function progVacio(tipo, anio, des){
  var T=progTipo(tipo), obra=String((YO.obra||{}).nombre||'');
  return progLimpio({ tipo:T.k, anio:String(anio), cod:'', ver:'01', aprob:'', acta:'', obj:T.obj, alc:obra ? 'Todo el personal de '+obra+', propio y de las empresas contratistas.' : 'Todo el personal de la obra, propio y de las empresas contratistas.',
    meta:T.k==='sst' ? 'Cumplir el 100 % de las actividades programadas.' : '', ind:T.k==='sst' ? '(Actividades ejecutadas ÷ actividades programadas) × 100' : '', pres:'', rec:'',
    items:[], firmas:progFirmasDef(T.k, des), base:true });
}
function progNombre(tipo, anio){ return progTipo(tipo).n+' '+anio; }

/* ── LO EJECUTADO: lo que la obra ya registró en OBRASST en ese año ─────────────────────────────
   → { cap:{ llave:[12] }, insp:{…}, sim:{…}, camp:{…}, prog:{ cap:{…}, sim:{…}, camp:{…} }, nom:{ cap:{ llave:'Nombre' }, … } }
   La llave es el nombre de la actividad sin tildes ni mayúsculas (nrm). «prog» = lo que ya tiene fecha puesta para ese
   año (capacitaciones programadas, simulacros y campañas que «se van a hacer»). */
var PROGH = { obra:null, anio:'', H:null, t:0 };
function _pgLlave(t){ return nrm(gesTxt(t)); }
function progHechos(anio, fresco){
  var oid=(YO.obra||{}).id; anio=String(anio);
  if(!fresco && PROGH.obra===oid && PROGH.anio===anio && PROGH.H && Date.now()-PROGH.t<20000) return Promise.resolve(PROGH.H);
  var nada=function(){ return []; }, tieneGes=(typeof gesActTraer==='function'), sig=String(+anio+1);
  return Promise.all([
    traerTodo('sst_constancia', '&select=fecha,tema,tipo&fecha=gte.'+anio+'-01-01&fecha=lt.'+sig+'-01-01&order=fecha.desc', 20000).catch(nada),
    tieneGes ? gesActTraer(true).catch(nada) : Promise.resolve([]),
    traerTodo('sst_inspeccion', '&select=tipo,fecha&fecha=gte.'+anio+'-01-01&fecha=lt.'+sig+'-01-01&order=fecha.desc', 20000).catch(nada),
    traer('sst_doc', '&select=id,hoja,nombre,nota&hoja=eq.temas&order=creado.desc', 800).catch(nada),
    gesCat().catch(function(){ return {}; })
  ]).then(function(r){
    var H={ cap:{}, insp:{}, sim:{}, camp:{}, prog:{ cap:{}, sim:{}, camp:{} }, nom:{ cap:{}, insp:{}, sim:{}, camp:{} } }, cat=r[4]||{};
    var mesDe=function(f){ f=String(f||''); return f.slice(0, 4)===anio ? (+f.slice(5, 7)-1) : -1; };
    var suma=function(caja, tipo, nombre, mes, noms){
      var k=_pgLlave(nombre); if(!k || mes<0 || mes>11) return;
      if(!caja[k]) caja[k]=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      caja[k][mes]++; if(!noms[tipo][k]) noms[tipo][k]=gesTxt(nombre);
    };
    var simN=function(k){ var L=Array.isArray(cat.simTipos) ? cat.simTipos : []; for(var i=0;i<L.length;i++) if(L[i][0]===k) return L[i][2]; return ''; };
    /* las capacitaciones: las rendidas en la app (una constancia por persona: cuenta la capacitación, no la gente) */
    var visto={};
    (r[0]||[]).forEach(function(c){
      if(!c || !c.tema) return;
      var f=String(c.fecha||'').slice(0, 10), t=temaLimpio(c.tema), q=_pgLlave(t)+'|'+f; if(visto[q]) return; visto[q]=1;
      suma(H.cap, 'cap', t, mesDe(f), H.nom);
    });
    (r[1]||[]).forEach(function(x){
      var d=x && x.d; if(!d) return;
      if(d.k==='cap' && d.tema) suma(H.cap, 'cap', d.tema, mesDe(d.fecha), H.nom);
      else if(d.k==='sim'){
        var ns=(d.tipo && d.tipo!=='otro' && simN(d.tipo)) || d.escenario || 'Simulacro';
        suma(d.estado==='hecho' ? H.sim : H.prog.sim, 'sim', ns, mesDe(d.fecha), H.nom);
      }
      else if(d.k==='camp' && d.nombre){
        /* una campaña cuenta en cada mes que toca (de «desde» a «hasta») */
        var a=String(d.desde||''), b=String(d.hasta||d.desde||''), caja=(d.estado==='hecha') ? H.camp : H.prog.camp;
        if(/^\d{4}-\d{2}/.test(a)){
          var y=+a.slice(0, 4), mm=+a.slice(5, 7), yb=+b.slice(0, 4)||y, mb=+b.slice(5, 7)||mm, tope=0;
          while((y<yb || (y===yb && mm<=mb)) && tope++<24){ if(String(y)===anio) suma(caja, 'camp', d.nombre, mm-1, H.nom); mm++; if(mm>12){ mm=1; y++; } }
        }
      }
    });
    (r[2]||[]).forEach(function(i){ if(i && i.tipo) suma(H.insp, 'insp', i.tipo, mesDe(i.fecha), H.nom); });
    /* las capacitaciones que ya tienen día puesto en «Programar capacitación» */
    (r[3]||[]).forEach(function(doc){
      if(!doc || doc.hoja!=='temas') return;
      var o=nota(doc.nota); if(!o || o.t!=='E' || !o.d) return;
      var nom=String(doc.nombre||'').replace(/^Capacitación\s*·\s*/, '') || String(o.d);
      suma(H.prog.cap, 'cap', temaLimpio(nom), mesDe(String(o.fe||o.v||'').slice(0, 10)), H.nom);
    });
    PROGH.obra=oid; PROGH.anio=anio; PROGH.H=H; PROGH.t=Date.now();
    return H;
  });
}
/* cuántos meses del año ya cerraron (0 = ninguno · 12 = todos): el mes en curso todavía no cuenta como atrasado */
function progCerrados(anio){ anio=String(anio); return anio<ANIO ? 12 : (anio>ANIO ? 0 : +MES.slice(5, 7)-1); }
/* una actividad, mes por mes → [{ p (programado), e (ejecutado), auto (cuántas contó sola), mano }] */
function progFila(item, tipo, H, progs, anio){
  var out=[], i;
  if(item.ref){
    /* la fila que se llena con otro programa: programado si ese programa tiene algo ese mes; ejecutado si lo cumplió todo */
    var otro=progDe(progs, item.ref, anio), M=otro ? progResumen(otro.d, H, progs).meses : null;
    for(i=0;i<12;i++){ var q=M ? M[i] : { p:0, e:0 }; out.push({ p:q.p>0, e:q.p>0 && q.e>=q.p, parte:(q.p>0 && q.e>0 && q.e<q.p) ? q.e+'/'+q.p : '', np:q.p, ne:q.e, auto:0, mano:false, ref:true }); }
    return out;
  }
  var A=((H && H[tipo])||{})[_pgLlave(item.n)] || null;
  for(i=0;i<12;i++){ var m=item.m[i]||0, a=A ? (A[i]||0) : 0; out.push({ p:m>=1, e:m===2 || a>0, auto:a, mano:m===2 }); }
  return out;
}
/* el programa entero → { n (actividades), prog (P del año), aFecha (lo que ya se puede medir: las P de los meses cerrados y
   las que ya se ejecutaron), cumpl (de esas, las ejecutadas), pct (null si todavía no toca nada), atras (P de meses
   cerrados sin ejecutar), extra (ejecutadas sin programar), meses:[{p,e}] } */
function progResumen(d, H, progs){
  var cerr=progCerrados(d.anio), R={ n:0, prog:0, aFecha:0, cumpl:0, pct:null, atras:0, extra:0, meses:[] }, i;
  for(i=0;i<12;i++) R.meses.push({ p:0, e:0 });
  (d.items||[]).forEach(function(it){
    if(!it.ref && !gesTxt(it.n)) return;
    R.n++;
    var F=progFila(it, d.tipo, H, it.ref ? progs : null, d.anio);
    F.forEach(function(c, m){
      if(c.p){ R.prog++; R.meses[m].p++; if(c.e){ R.meses[m].e++; R.aFecha++; R.cumpl++; } else if(m<cerr){ R.aFecha++; R.atras++; } }
      else if(c.e) R.extra++;
    });
  });
  if(R.aFecha) R.pct=Math.round(R.cumpl*100/R.aFecha);
  return R;
}

/* ══ 2 · LA SECCIÓN «PROGRAMAS DEL AÑO» ════════════════════════════════════════════════════════
   Cinco tarjetas, una por programa: si está armado, cuánto lleva cumplido y la tira de sus doce meses; si no, la
   puerta para armarlo (o copiar el del año anterior). El año se cambia con las flechas. */
function _pgCss(){
  if($('pg-css')) return;
  var st=document.createElement('style'); st.id='pg-css';
  st.textContent=[
    '.hoja.ancha.pg-h{width:min(1250px,100%)}',
    '.pg-hub{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}',
    '.pg-t{display:flex;flex-direction:column;gap:9px;border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:16px 16px 14px}',
    '.pg-t h3{margin:0;font-size:15px;color:var(--tinta);font-weight:600;display:flex;gap:9px;align-items:center}.pg-t h3 span{font-size:18px;line-height:1}',
    '.pg-t p{margin:0;font-size:13px;color:var(--gris);line-height:1.5}.pg-t .pg-n{font-size:13px;color:var(--texto);font-variant-numeric:tabular-nums}.pg-t .pg-n b{color:var(--tinta);font-weight:600}',
    '.pg-t .acciones{margin:auto 0 0;padding-top:2px;justify-content:flex-start;flex-wrap:wrap}.pg-t.cand{background:#FAFBFC}.pg-t.cand h3{color:var(--gris)}',
    '.pg-tira{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:3px}',
    '.pg-tira i{display:block;height:20px;border-radius:4px;background:#EEF1F4;font-style:normal;font-size:10px;font-weight:600;line-height:20px;text-align:center;color:#98A7B1}',
    '.pg-tira i.p{background:#D6E8F3;color:#12506B}.pg-tira i.e{background:#CFEBD9;color:#0B6B3A}.pg-tira i.m{background:#FFE9BF;color:#8A5700}.pg-tira i.x{background:#F9D5D2;color:#A8201A}',
    '.pg-barra{height:7px;border-radius:4px;background:#EEF1F4;overflow:hidden}.pg-barra i{display:block;height:100%;background:#2E7D32;border-radius:4px}.pg-barra.ojo i{background:#E8A000}.pg-barra.mal i{background:#D9261C}',
    '.pg-ley{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;font-size:12.5px;color:var(--gris);margin:0 0 10px}.pg-ley span{display:inline-flex;gap:6px;align-items:center}',
    '.pg-ley i{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:5px;font-style:normal;font-size:11px;font-weight:700;border:1px solid var(--raya);background:var(--panel);color:var(--gris)}',
    /* la matriz del editor */
    '.pg-tabla{border:1px solid var(--raya);border-radius:12px;background:var(--panel);margin:0 0 12px}',
    '.pg-cab,.pg-fila,.pg-pie{display:grid;grid-template-columns:var(--pg-cols);gap:6px;align-items:center;padding:6px 8px}',
    '.pg-cab{background:#FAFBFC;border-bottom:1px solid var(--raya);border-radius:12px 12px 0 0;font-size:11px;color:var(--gris);text-transform:uppercase;letter-spacing:.03em;padding-top:8px;padding-bottom:8px}',
    '.pg-fila{border-bottom:1px solid var(--raya)}.pg-fila:last-child{border-bottom:0}.pg-fila.ref{background:#F7FAFC}',
    '.pg-fila input,.pg-fila select{padding:6px 8px;font-size:13.5px;min-width:0;width:100%}.pg-fila>b.pg-num{color:var(--gris);font-size:12.5px;font-weight:600;text-align:center}',
    '.pg-fila .pg-ref{font-size:13.5px;color:var(--tinta);font-weight:600;line-height:1.35}.pg-fila .pg-ref small{display:block;font-weight:400;color:var(--gris);font-size:12px}',
    '.pg-meses,.pg-meses-c{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:2px}.pg-meses-c span{text-align:center;font-size:10.5px;letter-spacing:0;text-transform:none}',
    '.pg-meses button{appearance:none;-webkit-appearance:none;cursor:pointer;border:1px solid var(--raya);background:var(--panel);color:var(--gris);border-radius:6px;height:30px;padding:0;font:inherit;font-size:12px;font-weight:700;position:relative;min-width:0}',
    '.pg-meses button small{display:none;font-size:9.5px;font-weight:500;line-height:1;color:inherit;opacity:.85}',
    '.pg-meses button.p{background:#D6E8F3;border-color:#9CC3DA;color:#12506B}.pg-meses button.e{background:#2E7D32;border-color:#2E7D32;color:#fff}',
    '.pg-meses button.a{background:#CFEBD9;border-color:#7FC79B;color:#0B6B3A}.pg-meses button.s{background:var(--panel);border-color:#7FC79B;border-style:dashed;color:#0B6B3A}',
    '.pg-meses button.x{background:#FDECEA;border-color:#E58F87;color:#A8201A}.pg-meses button.m{background:#FFE9BF;border-color:#E3B85C;color:#8A5700}',
    '.pg-meses button[disabled]{cursor:default;opacity:1}',
    '.pg-cump{font-size:12px;color:var(--gris);text-align:center;font-variant-numeric:tabular-nums;white-space:nowrap}.pg-cump.ok{color:#0B6B3A;font-weight:600}.pg-cump.mal{color:#A8201A;font-weight:600}',
    '.pg-x{appearance:none;-webkit-appearance:none;cursor:pointer;border:0;background:transparent;color:var(--gris);font-size:18px;line-height:1;padding:6px 0;border-radius:6px}.pg-x:hover{color:var(--mal);background:#FDECEA}',
    '.pg-12{appearance:none;-webkit-appearance:none;cursor:pointer;border:1px solid var(--raya);background:var(--panel);color:var(--gris);border-radius:6px;font:inherit;font-size:11px;font-weight:600;height:30px;padding:0 5px}.pg-12:hover{color:var(--tinta);border-color:var(--gris2)}',
    '.pg-et{display:none}',
    '.pg-pie{background:#FAFBFC;border-top:1px solid var(--raya);font-size:12px;color:var(--gris)}.pg-pie:last-child{border-radius:0 0 12px 12px}',
    '.pg-pie .pg-meses-c span{font-variant-numeric:tabular-nums;font-size:11px;color:var(--texto)}.pg-pie .pg-meses-c span.cero{color:#B4BEC6}',
    '.pg-herr{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px}',
    '.pg-cat{border:1px solid var(--raya);border-radius:12px;background:var(--panel);margin:0 0 12px;overflow:hidden}',
    '.pg-cat-cab{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 12px;background:#FAFBFC;border-bottom:1px solid var(--raya)}.pg-cat-cab input[type=search]{flex:1 1 200px;min-width:0;padding:8px 11px;font-size:13.5px}',
    '.pg-cat-l{max-height:300px;overflow:auto}.pg-cat-l label{display:flex;gap:10px;align-items:flex-start;padding:8px 12px;border-bottom:1px solid var(--raya);cursor:pointer;font-size:13.5px;margin:0}.pg-cat-l label:last-child{border-bottom:0}',
    '.pg-cat-l label:hover{background:#FAFBFC}.pg-cat-l input{width:17px;height:17px;flex:0 0 auto;margin:1px 0 0;padding:0}.pg-cat-l b{display:block;font-weight:500;color:var(--tinta)}.pg-cat-l small{display:block;color:var(--gris);font-size:12px;line-height:1.35}',
    '.pg-cat-l label.ya{opacity:.55;cursor:default}.pg-cat-g{padding:7px 12px;background:#F4F6F8;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--gris);font-weight:600;border-bottom:1px solid var(--raya)}',
    '.pg-cat-pie{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;padding:10px 12px;border-top:1px solid var(--raya);background:#FAFBFC;font-size:13px}',
    '.pg-norma{border:1px solid var(--raya);border-radius:12px;background:#F7FAFC;padding:12px 14px;margin:0 0 14px}.pg-norma h3{margin:0 0 8px;font-size:13.5px;color:var(--tinta)}',
    '.pg-norma ul{margin:0;padding:0 0 0 18px;display:grid;gap:7px;font-size:13px;line-height:1.5}.pg-norma li small{display:block;color:var(--gris);font-size:12px}.pg-norma p{margin:0;font-size:13px;color:var(--gris);line-height:1.5}',
    '.pg-firmas{display:grid;gap:8px;margin:0 0 10px}.pg-firma{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) minmax(0,1.4fr) 30px;gap:8px;align-items:end}.pg-firma .campo{margin:0}',
    '.pg-modo{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:0 0 12px}.pg-modo p{margin:0;font-size:13px;color:var(--gris);flex:1 1 260px;line-height:1.45}',
    '@media (max-width:860px){',
    '.pg-cab{display:none}.pg-fila{position:relative;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;padding:10px;align-items:start}.pg-fila>*{grid-column:1 / -1}.pg-fila>b.pg-num{display:none}',
    '.pg-fila>.pg-mit{grid-column:auto}.pg-fila>div:first-of-type,.pg-fila>.pg-ref{margin-right:30px}.pg-fila>.pg-x{position:absolute;top:8px;right:6px;width:30px}',
    '.pg-fila>.pg-12{grid-column:1;justify-self:start;padding:0 10px}.pg-fila>.pg-12::after{content:" meses"}.pg-fila>.pg-cump{grid-column:2;align-self:center;text-align:right}.pg-fila>span:empty{display:none}.pg-et{display:block;font-size:11px;color:var(--gris);text-transform:uppercase;letter-spacing:.03em;margin:0 0 3px}',
    '.pg-meses{grid-template-columns:repeat(6,minmax(0,1fr));gap:4px}.pg-meses button{height:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.pg-meses button small{display:block}',
    '.pg-pie{display:none}.pg-firma{grid-template-columns:minmax(0,1fr) 30px}.pg-firma .campo{grid-column:1}.pg-firma .pg-x{grid-column:2;grid-row:1}',
    '}'
  ].join('\n');
  document.head.appendChild(st);
}
var PROGW = { obra:null, anio:'', n:0, caja:null, filas:[], H:null, firma:'' };
function progVista(caja){
  _gesCss(); _yaCss(); _accCss(); _papCss(); _pgCss();
  var oid=(YO.obra||{}).id;
  if(PROGW.obra!==oid){ PROGW.obra=oid; PROGW.anio=''; PROGW.firma=''; }
  if(!PROGW.anio) PROGW.anio=ANIO;
  PROGW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  function pinta(silencio){
    var n=++PROGW.n, A=PROGW.anio;
    Promise.all([progTraer(true), progHechos(A, true)]).then(function(r){
      if(n!==PROGW.n || VISTA.actual!=='programas') return;
      var firma=''; try{ firma=A+'|'+r[0].map(function(f){ return f.id+':'+f.texto; }).join('|')+'|'+JSON.stringify(r[1]); }catch(e){}
      if(silencio && firma && firma===PROGW.firma && $('pg-hub') && document.body.contains(caja)) return;
      PROGW.firma=firma; PROGW.filas=r[0]; PROGW.H=r[1]; progPintar();
    }).catch(function(cod){ if(n!==PROGW.n || VISTA.actual!=='programas') return; if(!silencio) fallo(caja, cod); });
  }
  PROGW.pinta=pinta; VISTA.recargar=pinta; pinta();
}
/* el plan que abre un acceso de la vitrina (para el candado de una tarjeta) */
function _pgPlanDe(k){
  if(!k || (typeof planWebTrae==='function' && planWebTrae(k))) return null;
  var x=(typeof INI_VITRINA==='object' ? INI_VITRINA : []).filter(function(v){ return v.k===k; })[0];
  return x ? (planWebPlan(x.desde) || { n:'' }) : null;
}
function _pgTira(R, anio, tipo){
  var cerr=progCerrados(anio);
  return '<div class="pg-tira" aria-hidden="true">'+R.meses.map(function(q, i){
    var cl='';
    if(q.p){ if(q.e>=q.p) cl='e'; else if(q.e>0) cl='m'; else cl=(i<cerr) ? 'x' : 'p'; }
    return '<i class="'+cl+'" title="'+esc(progMes(i, true)+': '+(q.p ? q.e+' de '+q.p+' '+progGen(tipo, q.p===1 ? 'cumplida' : 'cumplidas') : 'nada programado'))+'">'+esc(progMes(i).charAt(0))+'</i>';
  }).join('')+'</div>';
}
/* «A la fecha: 3 de 5 cumplidas · 60 %» (se miden los meses cerrados y lo que ya se ejecutó; el mes en curso no atrasa) */
function _pgAvance(R, anio, tipo){
  if(!R.prog) return 'Todavía no tiene meses marcados.';
  if(!R.aFecha) return String(anio)>ANIO ? 'Es del año que viene: todavía no toca nada.' : 'Lo programado empieza este mes: todavía no hay nada que medir.';
  return (String(anio)<ANIO ? 'En el año: ' : 'A la fecha: ')+'<b>'+R.cumpl+' de '+R.aFecha+'</b> '+progGen(tipo, R.aFecha===1 ? 'cumplida' : 'cumplidas')+' · <b>'+R.pct+' %</b>'+
    (R.atras ? ' <span class="pill mal">'+R.atras+' '+progGen(tipo, R.atras===1 ? 'atrasada' : 'atrasadas')+'</span>' : '');
}
function progPintar(){
  var caja=PROGW.caja; if(!caja || !document.body.contains(caja)) return;
  var A=String(PROGW.anio), F=PROGW.filas||[], H=PROGW.H, esHoy=(A===ANIO), tope=String(+ANIO+1);
  var anios={}; F.forEach(function(f){ anios[String(f.d.anio)]=1; });
  var otros=Object.keys(anios).filter(function(y){ return y!==A; }).sort().reverse().slice(0, 6);
  var h='<div class="acc-anio" id="pg-anio"><button type="button" class="bt sec chico" id="pg-ant" aria-label="Año anterior">‹</button><h2 id="pg-tit">'+esc(A)+'</h2>'+
    '<button type="button" class="bt sec chico" id="pg-sig" aria-label="Año siguiente"'+(A>=tope ? ' disabled' : '')+'>›</button>'+
    (esHoy ? '' : '<button type="button" class="bt sec chico" id="pg-hoy">Este año</button>')+
    (otros.length ? '<span class="acc-otros" id="pg-otros">También hay programas de'+otros.map(function(y){ return ' <button type="button" class="bt-link" data-anio="'+esc(y)+'">'+esc(y)+'</button>'; }).join('')+'</span>' : '')+'</div>';
  h+='<div class="aviso" id="pg-que"><b>Cada programa es la hoja del año:</b> las actividades en filas y los doce meses en columnas. Lo programado (P) lo marcas tú; lo ejecutado (E) se cuenta solo con lo que la obra registra en OBRASST '+
     '—capacitaciones, inspecciones, simulacros y campañas— y también se puede marcar a mano. Cada uno sale en PDF y en Excel, con su bloque de firmas.</div>';
  h+='<div class="pg-hub" id="pg-hub">'+PROG_TIPOS.map(function(T){
    var f=progDe(F, T.k, A), plan=_pgPlanDe(T.acceso), prev=progDe(F, T.k, String(+A-1));
    var cab='<h3><span aria-hidden="true">'+T.ic+'</span>'+esc(T.n)+'</h3>';
    if(plan) return '<section class="pg-t cand" data-tipo="'+T.k+'">'+cab+'<p>'+esc(T.d)+'</p><div class="pg-n">🔒 No está en tu plan'+(plan.n ? ': se abre con el plan <b>'+esc(plan.n)+'</b>' : '')+'</div>'+
      '<div class="acciones"><button type="button" class="bt sec chico" data-plan="'+T.k+'">Ver qué trae</button></div></section>';
    if(!f) return '<section class="pg-t" data-tipo="'+T.k+'">'+cab+'<p>'+esc(T.d)+'</p><div class="pg-n">Todavía no está armado para '+esc(A)+'.</div>'+
      '<div class="acciones"><button type="button" class="bt chico" data-armar="'+T.k+'">Armar el programa</button>'+(prev ? '<button type="button" class="bt sec chico" data-copiar="'+T.k+'">Copiar el de '+esc(String(+A-1))+'</button>' : '')+'</div></section>';
    var R=progResumen(f.d, H, F), d=f.d;
    return '<section class="pg-t" data-tipo="'+T.k+'" data-id="'+esc(f.id)+'">'+cab+
      '<div class="pg-n"><b>'+R.n+'</b> '+(R.n===1 ? T.una : T.varias)+' · <b>'+R.prog+'</b> '+progGen(T.k, R.prog===1 ? 'programada' : 'programadas')+' en el año</div>'+
      _pgTira(R, A, T.k)+
      '<div class="pg-n" data-avance>'+_pgAvance(R, A, T.k)+'</div>'+
      (R.aFecha ? '<div class="pg-barra'+(R.pct>=90 ? '' : (R.pct>=60 ? ' ojo' : ' mal'))+'" role="img" aria-label="'+R.pct+' % cumplido"><i style="width:'+Math.max(2, Math.min(100, R.pct))+'%"></i></div>' : '')+
      '<p>'+(d.aprob ? 'Aprobado el '+esc(fechaLarga(d.aprob))+(d.acta ? ' · '+esc(d.acta) : '') : 'Sin fecha de aprobación todavía')+(d.ver ? ' · versión '+esc(d.ver) : '')+'</p>'+
      '<div class="acciones"><button type="button" class="bt chico" data-abrir="'+T.k+'">Abrir</button><button type="button" class="bt sec chico" data-pdf="'+T.k+'">PDF</button><button type="button" class="bt sec chico" data-xls="'+T.k+'">Excel</button></div></section>';
  }).join('')+'</div>';
  caja.innerHTML=h;
  var ir=function(y){ PROGW.anio=String(y); PROGW.firma=''; cargando(caja); PROGW.pinta(); };
  $('pg-ant').onclick=function(){ if(+A>2000) ir(+A-1); };
  $('pg-sig').onclick=function(){ if(A<tope) ir(+A+1); };
  if($('pg-hoy')) $('pg-hoy').onclick=function(){ ir(ANIO); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-anio]'), function(b){ b.onclick=function(){ ir(b.getAttribute('data-anio')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-armar]'), function(b){ b.onclick=function(){ progAbrir(b.getAttribute('data-armar'), A); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-copiar]'), function(b){ b.onclick=function(){ progAbrir(b.getAttribute('data-copiar'), A, { copiar:true }); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-abrir]'), function(b){ b.onclick=function(){ progAbrir(b.getAttribute('data-abrir'), A); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-pdf]'), function(b){ b.onclick=function(){ progVer(b.getAttribute('data-pdf'), A); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-xls]'), function(b){ b.onclick=function(){ var f=progDe(PROGW.filas, b.getAttribute('data-xls'), A); if(f) progExcel(f.d, PROGW.H, PROGW.filas, b); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-plan]'), function(b){ b.onclick=function(){ var T=progTipo(b.getAttribute('data-plan')); navegar(T.k==='insp' ? 'insp' : (T.k==='sim' ? 'simulacros' : 'campanas')); }; });
}

/* ── la hoja a la vista: «para aprobar» (solo lo programado) o «con el avance» (programado y ejecutado) ──
   pref: el prefijo de los ids · datos(): { d, H, progs } · op.guardar(): Promise (el editor guarda antes de bajar) */
function _pgHojaHTML(pref){
  return '<div class="pg-modo"><div class="seg" id="'+pref+'-modo" role="tablist" aria-label="Qué hoja">'+
      '<button type="button" role="tab" data-v="aprobar">Para aprobar</button><button type="button" role="tab" data-v="avance">Con el avance</button></div>'+
      '<p id="'+pref+'-modo-d"></p></div>'+
    '<div class="pdfv" id="'+pref+'-prev" aria-label="Vista previa de la hoja"></div>';
}
function _pgHojaArmar(pref, datos, op){
  op=op||{};
  var E={ modo:'', R:null, n:0 };
  var D0=datos(), R0=progResumen(D0.d, D0.H, D0.progs);
  E.modo=(R0.cumpl>0 || R0.extra>0 || R0.atras>0) ? 'avance' : 'aprobar';
  var bts=function(si){ ['pdf', 'imp'].forEach(function(k){ var b=$(pref+'-'+k); if(b) b.disabled=!si; }); };
  function pinta(){
    var n=++E.n, D=datos(); E.R=null; bts(false);
    Array.prototype.forEach.call($(pref+'-modo').querySelectorAll('button'), function(b){ var on=(b.getAttribute('data-v')===E.modo); b.className=on ? 'on' : ''; b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    $(pref+'-modo-d').textContent=(E.modo==='aprobar') ? 'Solo lo programado, con el renglón de lo ejecutado en blanco: la hoja que se firma al aprobar el programa.'
                                                       : 'Lo programado y lo ejecutado hasta hoy, con el cumplimiento de cada mes: la hoja para revisar el avance.';
    var caja=$(pref+'-prev'); caja.innerHTML='<div class="pdfv-msg">Armando la hoja…</div>';
    progPdf(D.d, D.H, D.progs, { avance:E.modo==='avance' }).then(function(R){
      if(n!==E.n || !$(pref+'-prev')) return;
      E.R=R; pdfVistaP($(pref+'-prev'), R.blob); bts(true);
    }, function(){ if(n===E.n && $(pref+'-prev')) $(pref+'-prev').innerHTML='<div class="pdfv-msg">No se pudo armar la hoja. Revisa tu conexión e inténtalo otra vez.</div>'; });
  }
  $(pref+'-modo').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b || b.getAttribute('data-v')===E.modo) return; E.modo=b.getAttribute('data-v'); pinta(); };
  var antes=function(hacer){ return function(){ var bt=this; (op.guardar ? op.guardar() : Promise.resolve(true)).then(function(si){ if(si===false) return; var D=datos(); hacer(D, bt); }); }; };
  if($(pref+'-pdf')) $(pref+'-pdf').onclick=antes(function(D){ progPdf(D.d, D.H, D.progs, { avance:E.modo==='avance' }).then(function(R){ papBajar(R); }, function(){ toast('No se pudo armar el PDF. Revisa tu conexión.'); }); });
  if($(pref+'-imp')) $(pref+'-imp').onclick=antes(function(D){ progPdf(D.d, D.H, D.progs, { avance:E.modo==='avance' }).then(function(R){ papImprimir(R); }, function(){ toast('No se pudo armar la hoja. Revisa tu conexión.'); }); });
  if($(pref+'-xls')) $(pref+'-xls').onclick=antes(function(D, bt){ progExcel(D.d, D.H, D.progs, bt); });
  pinta();
  return { pinta:pinta, modo:function(){ return E.modo; } };
}
/* la hoja de un programa ya guardado, desde su tarjeta */
function progVer(tipo, anio){
  _papCss(); _pgCss();
  var f=progDe(PROGW.filas, tipo, anio); if(!f){ toast('Ese programa ya no está.'); return; }
  abrirHoja(progNombre(tipo, anio), 'La hoja para firmar, imprimir o mandar', _pgHojaHTML('pgv'),
    '<button type="button" class="bt sec" id="pgv-xls">Excel</button><button type="button" class="bt sec" id="pgv-imp" disabled>Imprimir</button><button type="button" class="bt" id="pgv-pdf" disabled>Descargar el PDF</button>', {clase:'pdf', sinFoco:true});
  _pgHojaArmar('pgv', function(){ return { d:f.d, H:PROGW.H, progs:PROGW.filas }; });
}

/* ══ 3 · ARMAR UN PROGRAMA ═════════════════════════════════════════════════════════════════════
   Cuatro pasos: los datos, las actividades (la matriz de los doce meses), las firmas y la hoja. Lo que se arma y no se
   guarda queda de borrador en este navegador: un cierre sin querer no tira una hora de trabajo. */
var PGF = null;
var PGF_PASOS = ['datos', 'acts', 'firmas', 'hoja'], PGF_NOM = { datos:'Datos', acts:'Actividades', firmas:'Firmas', hoja:'La hoja' };
function _pgfLlave(tipo, anio){ return 'sstp_prog_'+((YO.obra||{}).id||'')+'_'+tipo+'_'+anio; }
/* desde qué mes se marca lo que se agrega: en el año en curso, desde este mes (o desde enero, si se pidió «todo el
   año»: el que está pasando a OBRASST un programa que ya traía); en otro año, desde enero */
function _pgDesde(anio){ return (String(anio)===ANIO && !(PGF && PGF.todoAnio)) ? (+MES.slice(5, 7)-1) : 0; }
/* los meses que le tocan a una frecuencia, desde un mes */
function _pgPatron(fr, desde){
  var m=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], paso=(fr==='trimestral') ? 3 : (fr==='semestral' ? 6 : (fr==='anual' ? 12 : (fr==='porEvento' ? 0 : 1)));
  if(!paso) return m;
  for(var i=desde;i<12;i+=paso) m[i]=1;
  return m;
}
/* el programa del año anterior, como punto de partida de este (sin lo ejecutado, sin la aprobación) */
function _pgfCopia(prev, anio, des){
  var d=progVacio(prev.tipo, anio, des);
  ['cod', 'ver', 'obj', 'alc', 'meta', 'ind', 'pres', 'rec'].forEach(function(c){ if(prev[c]) d[c]=prev[c]; });
  d.items=(prev.items||[]).map(function(x){ var o={ id:_pgId(), n:x.n, resp:x.resp, a:x.a, h:x.h, fr:x.fr, g:x.g, obs:x.obs, m:x.m.map(function(v){ return v ? 1 : 0; }) }; if(x.ref) o.ref=x.ref; return o; });
  if((prev.firmas||[]).length) d.firmas=prev.firmas.map(function(f){ return { rol:f.rol, nombre:f.nombre, cargo:f.cargo }; });
  d.base=prev.base!==false;
  return d;
}
function progAbrir(tipo, anio, op){
  _gesCss(); _yaCss(); _papCss(); _pgCss();
  op=op||{}; anio=String(anio);
  var T=progTipo(tipo), plan=_pgPlanDe(T.acceso);
  if(plan){ toast('Este programa se abre con el plan '+(plan.n||'siguiente')+'.'); return Promise.resolve(false); }
  abrirHoja(progNombre(T.k, anio), 'Lo programado, mes a mes; lo ejecutado se cuenta solo con lo que la obra registra', '<div class="vacio" id="pgf-carga">Trayendo lo de la obra…</div>',
    '<button type="button" class="bt mal" id="pgf-quitar" hidden>Quitar</button><button type="button" class="bt sec" id="pgf-sig" disabled>Siguiente ›</button><button type="button" class="bt" id="pgf-ok" disabled>Guardar el programa</button>',
    {ancha:true, clase:'pg-h', sinFoco:true});
  var yo={ tipo:T.k, anio:anio }; PGF=yo;
  var nada=function(){ return null; };
  return Promise.all([progTraer(true), progHechos(anio), gesGente().catch(function(){ return []; }), papCtx().catch(nada), gesCat().catch(function(){ return {}; }), progDesignados(),
                      paisObraP()==='pe' ? Promise.resolve(null) : cargarExige().catch(nada)]).then(function(r){
    if(PGF!==yo || !$('pgf-carga')) return false;
    var filas=r[0]||[], f=progDe(filas, T.k, anio), prev=progDe(filas, T.k, String(+anio-1));
    yo.filas=filas; yo.H=r[1]; yo.gente=r[2]||[]; yo.X=r[3]; yo.cat=r[4]||{}; yo.des=r[5]||{};
    yo.id=f ? f.id : null; yo.texto=f ? f.texto : ''; yo.nuevo=!f; yo.paso='datos'; yo.sucio=false; yo.guardando=false; yo.prev=prev; yo.cat_abierto=false;
    var base=f ? progLimpio(f.d) : ((op.copiar && prev) ? _pgfCopia(prev.d, anio, yo.des) : progVacio(T.k, anio, yo.des));
    var B=leer(_pgfLlave(T.k, anio), null), arranca=function(d, sucio){ yo.d=d; yo.sucio=!!sucio; _pgfMontar(); if(op.copiar && !f && prev && !sucio){ yo.sucio=true; _pgfMsg('Copiado del programa de '+(+anio-1)+': las mismas actividades y los mismos meses, sin lo ejecutado. Revísalo y guárdalo.', 'ok'); } return true; };
    if(B && B.d && String(B.base||'')===String(yo.texto||'') && JSON.stringify(progLimpio(B.d))!==JSON.stringify(base)){
      return confirmar('Tienes cambios sin guardar en este programa', 'Son de '+(hace(B.t)||'hace un rato')+'. ¿Sigues con ellos?', { si:'Seguir con ellos', no:'Descartarlos' }).then(function(si){
        if(PGF!==yo) return false;
        if(!si) guardar(_pgfLlave(T.k, anio), null);
        return arranca(si ? progLimpio(B.d) : base, si);
      });
    }
    return arranca(base, false);
  }, function(e){ if(PGF===yo && $('pgf-carga')) $('pgf-carga').textContent='No se pudo abrir. '+porQueFallo(e); return false; });
}
function _pgfMontar(){
  var yo=PGF;
  $('hoja-cuerpo').innerHTML='<ol class="pap-pasos" id="pgf-pasos"></ol><div id="pgf-cuerpo"></div><div class="msg" id="pgf-msg" role="status"></div>';
  $('pgf-sig').disabled=false; $('pgf-ok').disabled=false;
  if(yo.id){ $('pgf-quitar').hidden=false; $('pgf-quitar').onclick=_pgfQuitar; $('pgf-ok').textContent='Guardar los cambios'; }
  $('pgf-sig').onclick=function(){ var i=PGF_PASOS.indexOf(PGF.paso); _pgfIr(PGF_PASOS[Math.min(PGF_PASOS.length-1, i+1)]); };
  $('pgf-ok').onclick=function(){ _pgfGuardar(); };
  $('pgf-pasos').onclick=function(ev){ var b=ev.target.closest('[data-p]'); if(b) _pgfIr(b.getAttribute('data-p')); };
  var C=$('pgf-cuerpo');
  C.addEventListener('input', _pgfAlEscribir); C.addEventListener('change', _pgfAlEscribir); C.addEventListener('click', _pgfAlTocar);
  _pgfPinta();
}
function _pgfMsg(t, cl){ var m=$('pgf-msg'); if(m){ m.className='msg '+(cl||''); m.textContent=t||''; } }
function _pgfNombres(d){ return (d.items||[]).filter(function(x){ return !x.ref && gesTxt(x.n); }); }
/* lo que le falta a un paso (cadena vacía: está completo) */
function _pgfFalta(k){
  var d=PGF.d;
  if(k==='acts'){
    var con=(d.items||[]).filter(function(x){ return x.ref || gesTxt(x.n); });
    if(!con.length) return 'Pon al menos una actividad.';
    var sin=(d.items||[]).filter(function(x){ return !x.ref && !gesTxt(x.n) && x.m.some(function(v){ return v; }); })[0];
    if(sin) return 'Hay una fila con meses marcados y sin nombre: ponle el nombre o quítala.';
    var v={}, rep='';
    _pgfNombres(d).forEach(function(x){ var q=_pgLlave(x.n); if(v[q] && !rep) rep=gesTxt(x.n); v[q]=1; });
    if(rep) return 'Hay dos filas con el mismo nombre («'+rep+'»): júntalas en una, o cámbiale el nombre a una. Lo ejecutado se cuenta por el nombre.';
    if(!con.some(function(x){ return x.ref || x.m.some(function(q){ return q; }); })) return 'Todavía no hay ningún mes marcado: toca el mes en que se hace cada actividad.';
    return '';
  }
  if(k==='firmas') return (d.firmas||[]).some(function(f){ return gesTxt(f.rol); }) ? '' : 'Pon al menos una firma (quién lo elabora o quién lo aprueba).';
  return '';
}
function _pgfPintaPasos(){
  if(!PGF) return;
  _papBarra('pgf-pasos', PGF_PASOS, PGF_NOM, PGF.paso, function(k){
    if(k==='datos') return !!gesTxt(PGF.d.obj);
    if(k==='hoja') return false;
    return !_pgfFalta(k);
  });
}
function _pgfIr(k){
  if(!PGF || !k) return;
  PGF.paso=k; PGF.cat_abierto=false; _pgfPinta();
  try{ $('hoja-cuerpo').scrollTop=0; }catch(e){}
}
function _pgfCambio(){
  if(!PGF) return;
  PGF.sucio=true;
  clearTimeout(PGF._t);
  var yo=PGF;
  PGF._t=setTimeout(function(){ if(PGF===yo && yo.sucio) try{ guardar(_pgfLlave(yo.tipo, yo.anio), { t:new Date().toISOString(), base:yo.texto||'', d:yo.d }); }catch(e){} }, 500);
  _pgfPintaPasos();
}
function _pgfPinta(){
  var c=$('pgf-cuerpo'); if(!c || !PGF) return;
  var k=PGF.paso;
  _pgfMsg('');
  c.innerHTML=(k==='datos') ? _pgfDatos() : (k==='acts' ? _pgfActs() : (k==='firmas' ? _pgfFirmas() : _pgfHoja()));
  var ult=(k==='hoja'); $('pgf-sig').hidden=ult;
  if(k==='acts') _pgfCuenta();
  if(ult) PGF.hoja=_pgHojaArmar('pgf', function(){ return { d:_pgfPaquete(true), H:PGF.H, progs:PGF.filas }; }, { guardar:function(){ return _pgfGuardar(true); } });
  _pgfPintaPasos();
}
/* ── paso 1 · los datos ── */
function _pgfDatos(){
  var d=PGF.d, T=progTipo(PGF.tipo), sst=(T.k==='sst');
  var campo=function(id, c, rot, val, extra){ return '<div class="campo"><label for="'+id+'">'+rot+'</label><input id="'+id+'" data-c="'+c+'" autocomplete="off" value="'+esc(val||'')+'"'+(extra||'')+'></div>'; };
  var h='<div class="aviso" id="pgf-que" style="margin:0 0 14px"><b>'+esc(T.n)+' '+esc(PGF.anio)+'.</b> '+esc(T.d)+'</div>'+
    '<div class="campo"><label for="pgf-obj">Objetivo</label><textarea id="pgf-obj" data-c="obj" rows="2" maxlength="500">'+esc(d.obj)+'</textarea></div>'+
    campo('pgf-alc', 'alc', 'Alcance', d.alc, ' maxlength="240"');
  if(sst){
    h+='<div class="fila-c ya-al">'+campo('pgf-meta', 'meta', 'Meta', d.meta, ' maxlength="200"')+campo('pgf-ind', 'ind', 'Indicador', d.ind, ' maxlength="200"')+'</div>'+
       '<div class="fila-c ya-al">'+campo('pgf-pres', 'pres', 'Presupuesto <span class="tenue">· opcional</span>', d.pres, ' maxlength="120" placeholder="El monto del año para seguridad y salud"')+
        campo('pgf-rec', 'rec', 'Recursos <span class="tenue">· opcional</span>', d.rec, ' maxlength="200" placeholder="Personal, equipos, servicios"')+'</div>';
  }
  h+='<div class="seccion"><h3>El documento <span class="tenue" style="font-weight:400">· lo que va en la cabecera de la hoja</span></h3><div class="fila-c ya-al">'+
      campo('pgf-cod', 'cod', 'Código <span class="tenue">· opcional</span>', d.cod, ' maxlength="40" placeholder="SST-PRG-001"')+campo('pgf-ver', 'ver', 'Versión', d.ver, ' maxlength="12"')+
      '<div class="campo"><label for="pgf-aprob">Fecha de aprobación <span class="tenue">· cuando la tenga</span></label><input type="date" id="pgf-aprob" data-c="aprob" value="'+esc(d.aprob)+'"></div></div>'+
      campo('pgf-acta', 'acta', 'Acta o documento en que se aprobó <span class="tenue">· opcional</span>', d.acta, ' maxlength="120" placeholder="Acta N.º 01-'+esc(PGF.anio)+'"')+'</div>';
  return h;
}
/* ── paso 2 · las actividades ── */
function _pgfCols(tipo){
  var M='358px 34px 46px 26px';
  if(tipo==='cap') return { css:'26px minmax(0,2fr) minmax(0,1.1fr) minmax(0,1fr) 56px '+M, cab:['N.º', 'Tema', 'Responsable', 'Dirigido a', 'Horas'], n:'Tema' };
  if(tipo==='insp') return { css:'26px minmax(0,2fr) minmax(0,1.1fr) 118px '+M, cab:['N.º', 'Qué se inspecciona', 'Responsable', 'Frecuencia'], n:'Qué se inspecciona' };
  if(tipo==='sim') return { css:'26px minmax(0,1.4fr) minmax(0,1.6fr) minmax(0,1fr) '+M, cab:['N.º', 'Simulacro', 'Escenario', 'Responsable'], n:'Simulacro' };
  if(tipo==='camp') return { css:'26px minmax(0,1.4fr) minmax(0,1.6fr) minmax(0,1fr) '+M, cab:['N.º', 'Campaña', 'Lema o mensaje', 'Responsable'], n:'Campaña' };
  return { css:'26px minmax(0,2.3fr) minmax(0,1fr) minmax(0,1.1fr) '+M, cab:['N.º', 'Actividad', 'Línea', 'Responsable'], n:'Actividad' };
}
/* un mes de una fila: su clase, su letra y lo que dice */
function _pgfMes(c, m, anio){
  var vencido=(m<progCerrados(anio)), mes=progMes(m, true), M=mes.charAt(0).toUpperCase()+mes.slice(1);
  if(c.ref){
    if(c.p && c.e) return { cl:'a', t:'E', d:M+': cumplido ('+c.ne+' de '+c.np+')' };
    if(c.parte) return { cl:'m', t:c.parte, d:M+': '+c.ne+' de '+c.np+' cumplidas' };
    if(c.p) return { cl:vencido ? 'x' : 'p', t:'P', d:M+': '+c.np+(c.np===1 ? ' programada' : ' programadas')+(vencido ? ', sin ejecutar' : '') };
    return { cl:'', t:'', d:M+': nada programado' };
  }
  if(c.p && c.mano) return { cl:'e', t:'E', d:M+': programado y ejecutado (marcado a mano)' };
  if(c.p && c.auto) return { cl:'a', t:'E', d:M+': programado y ejecutado · '+c.auto+' en el registro' };
  if(c.p) return { cl:vencido ? 'x' : 'p', t:'P', d:M+': programado'+(vencido ? ', sin ejecutar' : '') };
  if(c.auto) return { cl:'s', t:'E', d:M+': ejecutado sin estar programado · '+c.auto+' en el registro' };
  return { cl:'', t:'', d:M+': sin programar' };
}
function _pgfMesesHTML(it){
  var F=progFila(it, PGF.tipo, PGF.H, PGF.filas, PGF.anio);
  return F.map(function(c, m){ var q=_pgfMes(c, m, PGF.anio);
    return '<button type="button" data-m="'+m+'" class="'+q.cl+'"'+(it.ref ? ' disabled' : '')+' aria-label="'+esc(q.d)+'" title="'+esc(q.d)+'"><small>'+esc(progMes(m))+'</small><span>'+esc(q.t)+'</span></button>'; }).join('');
}
function _pgfFilaHTML(it, i){
  var t=PGF.tipo, C=_pgfCols(t), et=function(x){ return '<span class="pg-et">'+x+'</span>'; };
  var inp=function(k, rot, extra){ return '<div'+(k==='n' ? '' : ' class="pg-mit"')+'>'+et(rot)+'<input data-k="'+k+'" maxlength="'+(k==='n' ? 160 : 100)+'" autocomplete="off" aria-label="'+esc(rot)+', fila '+(i+1)+'" value="'+esc(it[k]||'')+'"'+(extra||'')+'></div>'; };
  var h='<div class="pg-fila'+(it.ref ? ' ref' : '')+'" data-i="'+i+'"><b class="pg-num">'+(i+1)+'</b>';
  if(t==='sst'){
    if(it.ref){
      var R=progTipo(it.ref), otro=progDe(PGF.filas, it.ref, PGF.anio);
      h+='<div class="pg-ref" data-ref="'+it.ref+'">'+esc(R.n)+'<small>'+(otro ? 'Se llena sola con ese programa: '+gesPlural(progResumen(otro.d, PGF.H, PGF.filas).n, R.una, R.varias)+'.' : 'Todavía no está armado para '+esc(PGF.anio)+': cuando lo armes, esta fila se llena sola.')+'</small></div>';
    } else h+=inp('n', 'Actividad', ' list="pgf-dl-n"');
    h+='<div class="pg-mit">'+et('Línea')+'<input data-k="g" maxlength="60" list="pgf-dl-l" autocomplete="off" aria-label="Línea, fila '+(i+1)+'" value="'+esc(it.g||'')+'"></div>'+inp('resp', 'Responsable', ' list="pgf-dl-g"');
  }
  else if(t==='cap') h+=inp('n', 'Tema', ' list="pgf-dl-n"')+inp('resp', 'Responsable', ' list="pgf-dl-g"')+inp('a', 'Dirigido a', ' placeholder="Todo el personal"')+
    '<div class="pg-mit">'+et('Horas')+'<input data-k="h" inputmode="decimal" maxlength="5" autocomplete="off" aria-label="Horas, fila '+(i+1)+'" value="'+esc(it.h||'')+'"></div>';
  else if(t==='insp') h+=inp('n', 'Qué se inspecciona', ' list="pgf-dl-n"')+inp('resp', 'Responsable', ' list="pgf-dl-g"')+
    '<div class="pg-mit">'+et('Frecuencia')+'<select data-k="fr" aria-label="Frecuencia, fila '+(i+1)+'"><option value="">—</option>'+PROG_FREQ.map(function(x){ return '<option value="'+x[0]+'"'+(it.fr===x[0] ? ' selected' : '')+'>'+x[1]+'</option>'; }).join('')+'</select></div>';
  else h+=inp('n', t==='sim' ? 'Simulacro' : 'Campaña', ' list="pgf-dl-n"')+inp('a', t==='sim' ? 'Escenario' : 'Lema o mensaje')+inp('resp', 'Responsable', ' list="pgf-dl-g"');
  h+='<div>'+et('Meses · un toque: programado · otro: ejecutado')+'<div class="pg-meses" role="group" aria-label="Los meses de la fila '+(i+1)+'">'+_pgfMesesHTML(it)+'</div></div>'+
     (it.ref ? '<span></span>' : '<button type="button" class="pg-12" data-que="todo" title="Marcar los doce meses (o limpiarlos)" aria-label="Marcar los doce meses de la fila '+(i+1)+'">12</button>')+
     '<span class="pg-cump" data-cump></span>'+
     '<button type="button" class="pg-x" data-que="quita" aria-label="Quitar la fila '+(i+1)+'">×</button></div>';
  return h;
}
function _pgfActs(){
  var d=PGF.d, t=PGF.tipo, T=progTipo(t), C=_pgfCols(t), H=PGF.H||{}, cat=_pgfCatLista();
  var h='<p class="ayuda" style="margin:0 0 10px">Una fila por '+T.una+'. En los meses: <b>un toque</b> lo deja programado (P); <b>otro toque</b>, ejecutado a mano (E); el tercero lo limpia. '+
    (t==='sst' ? 'Las filas de los otros programas se llenan solas con lo que digan ellos.' : 'Lo que la obra ya registró en OBRASST con ese mismo nombre se cuenta solo.')+'</p>'+
    '<div class="pg-herr"><button type="button" class="bt chico" data-que="mas">＋ Agregar una fila</button>'+
      (cat.length ? '<button type="button" class="bt sec chico" data-que="cat" id="pgf-bt-cat">'+(t==='sst' ? 'Lo sugerido…' : 'Elegir de la lista…')+'</button>' : '')+
      (t!=='sst' ? '<button type="button" class="bt sec chico" data-que="traer" id="pgf-bt-traer">Traer lo ya registrado en '+esc(PGF.anio)+'</button>' : '')+
      ((PGF.prev && !d.items.length) ? '<button type="button" class="bt sec chico" data-que="copiar" id="pgf-bt-copiar">Copiar el de '+(+PGF.anio-1)+'</button>' : '')+'</div>'+
    '<div id="pgf-cat"></div>'+
    '<div class="pg-ley" aria-hidden="true"><span><i style="background:#D6E8F3;border-color:#9CC3DA;color:#12506B">P</i>programado</span><span><i style="background:#CFEBD9;border-color:#7FC79B;color:#0B6B3A">E</i>ejecutado (contado del registro)</span>'+
      '<span><i style="background:#2E7D32;border-color:#2E7D32;color:#fff">E</i>ejecutado (a mano)</span><span><i style="background:#FDECEA;border-color:#E58F87;color:#A8201A">P</i>programado y sin ejecutar</span></div>';
  if(!d.items.length){
    h+='<div class="vacio" id="pgf-sin" style="padding:28px 14px"><b>Todavía no hay filas</b>'+(t==='sst' ? 'Parte de lo sugerido, o agrega la primera a mano.' : (cat.length ? 'Elige de la lista, trae lo que ya está registrado o agrega la primera a mano.' : 'Agrega la primera, o trae lo que ya está registrado.'))+'</div>';
    return h+_pgfListas();
  }
  h+='<div class="pg-tabla" id="pgf-tabla" style="--pg-cols:'+C.css+'"><div class="pg-cab">'+C.cab.map(function(x){ return '<span>'+x+'</span>'; }).join('')+
       '<div class="pg-meses-c">'+[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(m){ return '<span>'+esc(progMes(m))+'</span>'; }).join('')+'</div><span></span><span style="text-align:center">Cumpl.</span><span></span></div>'+
     '<div id="pgf-filas">'+d.items.map(_pgfFilaHTML).join('')+'</div>'+
     '<div class="pg-pie" id="pgf-pie-p"><span style="grid-column:1 / span '+C.cab.length+';text-align:right">'+progGen(t, 'Programadas')+'</span><div class="pg-meses-c" data-pie="p"></div><span></span><span class="pg-cump" data-tot="p"></span><span></span></div>'+
     '<div class="pg-pie" id="pgf-pie-e" style="border-top:0;padding-top:0"><span style="grid-column:1 / span '+C.cab.length+';text-align:right">'+progGen(t, 'Ejecutadas')+'</span><div class="pg-meses-c" data-pie="e"></div><span></span><span class="pg-cump" data-tot="e"></span><span></span></div></div>'+
     '<p class="ayuda" id="pgf-resumen" style="margin:0 0 4px"></p>';
  return h+_pgfListas();
}
/* las listas de ayuda al escribir: los nombres (lo de la lista y lo ya registrado), el personal y las líneas */
function _pgfListas(){
  var t=PGF.tipo, H=PGF.H||{}, v={}, N=[];
  var pon=function(n){ var k=_pgLlave(n); if(k && !v[k]){ v[k]=1; N.push(n); } };
  _pgfCatLista().forEach(function(x){ if(!x.ref) pon(x.n); });
  if(t!=='sst'){ var nom=(H.nom||{})[t]||{}; Object.keys(nom).forEach(function(k){ pon(nom[k]); }); }
  return '<datalist id="pgf-dl-n" data-sin-pais>'+N.slice(0, 400).map(function(n){ return '<option value="'+esc(n)+'"></option>'; }).join('')+'</datalist>'+
    '<datalist id="pgf-dl-g" data-sin-pais>'+(PGF.gente||[]).slice(0, 1500).map(function(g){ return '<option value="'+esc(g.nombre)+'">'+esc(g.puesto||'')+'</option>'; }).join('')+'</datalist>'+
    '<datalist id="pgf-dl-l">'+PROG_LINEAS.map(function(l){ return '<option value="'+esc(l)+'"></option>'; }).join('')+'</datalist>';
}
/* lo que se puede elegir de una lista, según el programa → [{ g (grupo), n, sub, a, h, fr, m (meses fijos), ref }] */
function _pgfCatLista(){
  if(!PGF) return [];
  if(PGF._cat && PGF._catT===PGF.tipo) return PGF._cat;
  var t=PGF.tipo, cat=PGF.cat||{}, out=[], pe=(paisObraP()==='pe'), sec=sectorObraP(), tx=function(s){ return pe ? s : txPaisP(s); };
  if(t==='sst') PROG_SST_BASE.forEach(function(x){
    if(x.ref){ var R=progTipo(x.ref); if(!_pgPlanDe(R.acceso)) out.push({ g:x.g, n:R.n, sub:'Se llena sola con ese programa', ref:x.ref }); }
    else out.push({ g:x.g, n:(x.fuera && !pe && paisObraP()!=='do') ? x.fuera : tx(x.n), sub:x.cada ? 'Todos los meses' : 'En '+(x.en||[]).map(function(m){ return progMes(m, true); }).join(' y '), cada:x.cada||0, en:x.en||null });
  });
  else if(t==='cap'){
    /* los temas de la app: solo en el Perú (afuera, las capacitaciones de la app no se muestran) */
    if(pe){
      var B={}, orden=[]; (cat.bloques||[]).forEach(function(b){ B[b[0]]=b[1]; });
      var por={};
      (cat.temas||[]).forEach(function(x){
        if(!x || !x[1] || (x[3]!=='*' && x[3]!==sec)) return;
        var k=_pgLlave(x[1]); if(!por[k]){ por[k]={ g:B[x[5]]||'Otros', n:x[1], subs:[] }; orden.push(k); }
        if(x[2]) por[k].subs.push(x[2]);
      });
      var og={}; (cat.bloques||[]).forEach(function(b, i){ og[b[1]]=i; });
      orden.map(function(k){ return por[k]; }).sort(function(a, b){ return ((og[a.g]==null ? 99 : og[a.g])-(og[b.g]==null ? 99 : og[b.g])) || a.n.localeCompare(b.n, 'es'); })
        .forEach(function(x){ var s=x.subs.join(' · '); out.push({ g:x.g, n:x.n, sub:s.length>110 ? s.slice(0, 108)+'…' : s }); });
    }
  }
  else if(t==='insp'){
    _inspFormatos(cat).forEach(function(f){ out.push({ g:tx(f.s), n:tx(f.n), sub:GES_FREQ[f.f] ? 'Frecuencia '+GES_FREQ[f.f] : '', fr:f.f }); });
  }
  else if(t==='sim'){
    var nac=pe ? (((cat.simulacros||{})[PGF.anio])||[]) : [];
    (Array.isArray(cat.simTipos) ? cat.simTipos : GES_SIM_BASE).forEach(function(s){
      if(s[0]==='otro') return;
      if(s[0]==='multi'){
        if(!pe) return;
        var mm=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; nac.forEach(function(x){ var i=+String(x.iso).slice(5, 7)-1; if(i>=0 && i<12) mm[i]=1; });
        out.push({ g:'Simulacros nacionales', n:s[2], sub:nac.length ? 'Los que convoca INDECI en '+PGF.anio+': '+nac.map(function(x){ return fechaLarga(x.iso).slice(0, 5); }).join(', ') : 'Los que convoca INDECI', a:s[4], m:nac.length ? mm : null });
      } else out.push({ g:'Simulacros de la obra', n:tx(s[2]), sub:tx(s[4]||''), a:tx(s[4]||'') });
    });
  }
  else if(t==='camp') (cat.campanas||[]).forEach(function(c){ out.push({ g:'Campañas', n:tx(c[2]), sub:tx(c[3]||''), a:tx(c[3]||'') }); });
  PGF._cat=out; PGF._catT=t;
  return out;
}
function _pgfCatPinta(){
  var caja=$('pgf-cat'); if(!caja) return;
  if(!PGF.cat_abierto){ caja.innerHTML=''; return; }
  var L=_pgfCatLista(), ya={}, t=PGF.tipo;
  PGF.d.items.forEach(function(x){ if(x.ref) ya['ref:'+x.ref]=1; else ya[_pgLlave(x.n)]=1; });
  var g='', h='<div class="pg-cat"><div class="pg-cat-cab"><input type="search" id="pgf-cat-q" placeholder="Buscar en la lista…" aria-label="Buscar en la lista"><button type="button" class="bt-link" data-que="cat-todas" id="pgf-cat-todas">Marcar todas</button><button type="button" class="bt-link" data-que="cat-cerrar">Cerrar</button></div><div class="pg-cat-l" id="pgf-cat-l">';
  L.forEach(function(x, i){
    if(x.g!==g){ g=x.g; h+='<div class="pg-cat-g" data-g>'+esc(g)+'</div>'; }
    var esta=!!ya[x.ref ? 'ref:'+x.ref : _pgLlave(x.n)];
    h+='<label class="'+(esta ? 'ya' : '')+'" data-b="'+esc(nrm(x.n+' '+(x.sub||'')+' '+x.g))+'"><input type="checkbox" data-cat="'+i+'"'+(esta ? ' disabled checked' : '')+'><span><b>'+esc(x.n)+'</b>'+(x.sub ? '<small>'+esc(x.sub)+'</small>' : '')+(esta ? '<small>Ya está en el programa</small>' : '')+'</span></label>';
  });
  var esteAnio=(String(PGF.anio)===ANIO && +MES.slice(5, 7)>1), mesHoy=+MES.slice(5, 7)-1;
  h+='</div><div class="pg-cat-pie"><button type="button" class="bt chico" data-que="cat-ok" id="pgf-cat-ok" disabled>Agregar</button>'+
     (esteAnio ? '<div class="seg" id="pgf-cat-desde" role="tablist" aria-label="Desde qué mes se marcan"><button type="button" role="tab" data-que="cat-desde" data-v="mes" class="'+(PGF.todoAnio ? '' : 'on')+'" aria-selected="'+(PGF.todoAnio ? 'false' : 'true')+'">Desde '+esc(progMes(mesHoy, true))+'</button>'+
        '<button type="button" role="tab" data-que="cat-desde" data-v="anio" class="'+(PGF.todoAnio ? 'on' : '')+'" aria-selected="'+(PGF.todoAnio ? 'true' : 'false')+'">Todo el año</button></div>' : '')+
     '<span class="tenue">'+(t==='sst' ? 'Cada una llega con sus meses de partida' : (t==='insp' ? 'Cada una llega con los meses de su frecuencia' : 'Llegan repartidas, una por mes'))+': después se acomodan con un toque.'+
       (esteAnio ? ' «Todo el año» es para pasar aquí un programa que ya traías desde enero.' : '')+'</span></div></div>';
  caja.innerHTML=h;
  var cuenta=function(){ var n=caja.querySelectorAll('input[data-cat]:checked:not([disabled])').length, b=$('pgf-cat-ok'); b.disabled=!n; b.textContent=n ? 'Agregar '+n : 'Agregar'; };
  caja.querySelector('#pgf-cat-l').onchange=cuenta;
  $('pgf-cat-q').oninput=function(){
    var pal=nrm(this.value).split(' ').filter(Boolean);
    Array.prototype.forEach.call(caja.querySelectorAll('label[data-b]'), function(l){ var b=l.getAttribute('data-b'); l.hidden=pal.some(function(p){ return b.indexOf(p)<0; }); });
    Array.prototype.forEach.call(caja.querySelectorAll('[data-g]'), function(gr){ var s=gr.nextElementSibling, hay=false; while(s && !s.hasAttribute('data-g')){ if(!s.hidden) hay=true; s=s.nextElementSibling; } gr.hidden=!hay; });
  };
}
function _pgfCatAgregar(){
  var caja=$('pgf-cat'), L=_pgfCatLista(), d=PGF.d, t=PGF.tipo, desde=_pgDesde(PGF.anio), n=0;
  var sel=Array.prototype.map.call(caja.querySelectorAll('input[data-cat]:checked:not([disabled])'), function(c){ return L[+c.getAttribute('data-cat')]; }).filter(Boolean);
  /* para repartir «una por mes»: se sigue después del último mes que ya tiene algo */
  var libre=desde; d.items.forEach(function(x){ x.m.forEach(function(v, i){ if(v && i>=libre) libre=i+1; }); });
  sel.forEach(function(x, i){
    var it={ id:_pgId(), n:x.ref ? '' : x.n, resp:'', a:x.a||'', h:'', fr:x.fr||'', g:x.g && t==='sst' ? x.g : '', obs:'', m:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
    if(x.ref) it.ref=x.ref;
    else if(x.m) it.m=x.m.slice();
    else if(t==='insp') it.m=_pgPatron(x.fr||'mensual', desde);
    else if(t==='sst'){
      if(x.cada) it.m=_pgPatron('mensual', desde);
      else { var puso=false; (x.en||[]).forEach(function(m){ if(m>=desde){ it.m[m]=1; puso=true; } }); if(!puso) it.m[Math.min(11, desde)]=1; }
    }
    else {
      var paso=(t==='sim') ? 3 : 1, mes=libre+i*paso;
      if(mes>11) mes=desde+((mes-desde)%Math.max(1, 12-desde));
      it.m[Math.min(11, mes)]=1;
    }
    d.items.push(it); n++;
  });
  if(!n) return;
  PGF.cat_abierto=false; _pgfCambio(); _pgfPinta();
  _pgfMsg(n===1 ? 'Agregada 1 fila: revisa sus meses.' : 'Agregadas '+n+' filas: revisa sus meses.', 'ok');
}
/* lo que la obra ya tiene registrado (hecho o con día puesto) en ese año y no está en el programa */
function _pgfTraer(){
  var d=PGF.d, t=PGF.tipo, H=PGF.H||{}, hechos=H[t]||{}, prog=(H.prog||{})[t]||{}, nom=(H.nom||{})[t]||{}, por={}, nuevas=0, marcas=0;
  d.items.forEach(function(x){ if(!x.ref && gesTxt(x.n)) por[_pgLlave(x.n)]=x; });
  var llaves={}; Object.keys(hechos).forEach(function(k){ llaves[k]=1; }); Object.keys(prog).forEach(function(k){ llaves[k]=1; });
  Object.keys(llaves).sort(function(a, b){ return String(nom[a]||a).localeCompare(String(nom[b]||b), 'es'); }).forEach(function(k){
    var he=hechos[k]||[], pr=prog[k]||[], it=por[k];
    if(!it){
      it={ id:_pgId(), n:nom[k]||k, resp:'', a:'', h:'', fr:'', g:'', obs:'', m:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
      for(var i=0;i<12;i++) if((he[i]||0)>0 || (pr[i]||0)>0) it.m[i]=1;
      d.items.push(it); nuevas++;
    } else for(var j=0;j<12;j++) if(((pr[j]||0)>0 || (he[j]||0)>0) && !it.m[j]){ it.m[j]=1; marcas++; }   /* lo hecho y lo que ya tiene día puesto quedan programados */
  });
  if(!nuevas && !marcas){ _pgfMsg('No hay nada registrado en '+PGF.anio+' que no esté ya en el programa.', 'gris'); return; }
  _pgfCambio(); _pgfPinta();
  _pgfMsg((nuevas ? (nuevas===1 ? 'Traída 1 fila' : 'Traídas '+nuevas+' filas')+' de lo registrado en '+PGF.anio+', con los meses en que se hizo o tiene día puesto.' : '')+
          (marcas ? (nuevas ? ' Y ' : '')+(marcas===1 ? 'quedó programado 1 mes más' : 'quedaron programados '+marcas+' meses más')+' en filas que ya estaban.' : ''), 'ok');
}
/* los números de cada fila y del pie, sin volver a dibujar la tabla */
function _pgfCuenta(){
  if(!PGF || !$('pgf-filas')) return;
  var d=PGF.d, cerr=progCerrados(PGF.anio), P=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], E=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  Array.prototype.forEach.call($('pgf-filas').querySelectorAll('.pg-fila'), function(f){
    var it=d.items[+f.getAttribute('data-i')]; if(!it) return;
    var F=progFila(it, PGF.tipo, PGF.H, PGF.filas, PGF.anio), p=0, e=0, pa=0, ea=0;
    F.forEach(function(c, m){ if(c.p){ p++; P[m]++; if(c.e){ e++; E[m]++; pa++; ea++; } else if(m<cerr) pa++; } });
    var s=f.querySelector('[data-cump]');
    var atras=F.some(function(c, m){ return c.p && !c.e && m<cerr; });
    if(s){ s.textContent=p ? e+'/'+p : '—'; s.className='pg-cump'+(atras ? ' mal' : ((pa && ea>=pa) ? ' ok' : '')); s.title=p ? e+' de '+p+' ejecutadas' : 'Sin meses marcados'; }
  });
  var pp=document.querySelector('#pgf-pie-p [data-pie]'), pe=document.querySelector('#pgf-pie-e [data-pie]');
  if(pp) pp.innerHTML=P.map(function(v){ return '<span class="'+(v ? '' : 'cero')+'">'+v+'</span>'; }).join('');
  if(pe) pe.innerHTML=E.map(function(v){ return '<span class="'+(v ? '' : 'cero')+'">'+v+'</span>'; }).join('');
  var R=progResumen(d, PGF.H, PGF.filas), tp=document.querySelector('[data-tot="p"]'), te=document.querySelector('[data-tot="e"]');
  if(tp) tp.textContent=R.prog; if(te) te.textContent=R.meses.reduce(function(s, q){ return s+q.e; }, 0);
  var r=$('pgf-resumen');
  var av=R.aFecha ? _pgAvance(R, PGF.anio, PGF.tipo) : ''; if(av) av=av.charAt(0).toLowerCase()+av.slice(1);
  var G=function(x){ return progGen(PGF.tipo, x); };
  if(r) r.innerHTML=gesPlural(R.n, 'fila', 'filas')+' · '+R.prog+' '+G(R.prog===1 ? 'programada' : 'programadas')+' en el año'+(av ? ' · '+av : '')+
    (R.extra ? ' · '+R.extra+' '+(R.extra===1 ? G('ejecutada')+' sin estar '+G('programada') : G('ejecutadas')+' sin estar '+G('programadas')) : '');
}
/* una fila cambió de nombre: sus meses pueden contar otra cosa del registro */
function _pgfRefresca(i){
  var f=document.querySelector('#pgf-filas .pg-fila[data-i="'+i+'"]'), it=PGF.d.items[i]; if(!f || !it) return;
  var m=f.querySelector('.pg-meses'); if(m) m.innerHTML=_pgfMesesHTML(it);
  _pgfCuenta();
}
function _pgfAlEscribir(ev){
  if(!PGF) return;
  var e=ev.target, d=PGF.d;
  var fila=e.closest('.pg-fila');
  if(fila){
    var i=+fila.getAttribute('data-i'), it=d.items[i], k=e.getAttribute('data-k'); if(!it || !k) return;
    it[k]=e.value;
    if(k==='fr' && ev.type==='change'){ var pat=_pgPatron(it.fr, _pgDesde(PGF.anio)); it.m=it.m.map(function(v, m){ return v===2 ? 2 : pat[m]; }); _pgfRefresca(i); }
    else if(k==='n' && ev.type==='change') _pgfRefresca(i);
    _pgfCambio(); return;
  }
  var c=e.getAttribute('data-c'); if(c){ d[c]=e.value; _pgfCambio(); return; }
  var fi=e.closest('.pg-firma');
  if(fi){ var q=d.firmas[+fi.getAttribute('data-f')], kk=e.getAttribute('data-k'); if(q && kk){ q[kk]=e.value; _pgfCambio(); } return; }
  if(e.id==='pgf-base'){ d.base=!!e.checked; _pgfCambio(); }
}
function _pgfAlTocar(ev){
  if(!PGF) return;
  var d=PGF.d, b=ev.target.closest('button'); if(!b) return;
  var fila=b.closest('.pg-fila'), i=fila ? +fila.getAttribute('data-i') : -1, it=(i>=0) ? d.items[i] : null;
  /* un mes: nada → programado → ejecutado a mano → nada */
  if(it && b.hasAttribute('data-m')){
    if(it.ref) return;
    var m=+b.getAttribute('data-m'); it.m[m]=((it.m[m]||0)+1)%3;
    var q=_pgfMes(progFila(it, PGF.tipo, PGF.H, PGF.filas, PGF.anio)[m], m, PGF.anio);
    b.className=q.cl; b.setAttribute('aria-label', q.d); b.title=q.d; b.querySelector('span').textContent=q.t;
    _pgfCambio(); _pgfCuenta(); return;
  }
  var que=b.getAttribute('data-que'); if(!que) return;
  if(que==='mas'){ d.items.push({ id:_pgId(), n:'', resp:'', a:'', h:'', fr:'', g:'', obs:'', m:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }); _pgfCambio(); _pgfPinta(); var ins=document.querySelectorAll('#pgf-filas .pg-fila:last-child input'); try{ ins[0].focus(); }catch(e){} return; }
  if(que==='quita' && it){
    var fuera=function(){ d.items.splice(i, 1); _pgfCambio(); _pgfPinta(); };
    if(!it.ref && gesTxt(it.n)) confirmar('¿Quitar esta fila?', '«'+gesTxt(it.n)+'» sale del programa. Lo que esté registrado de ella no se toca.', { si:'Sí, quitarla', mal:true }).then(function(si){ if(si) fuera(); });
    else fuera();
    return;
  }
  if(que==='todo' && it){
    var todos=it.m.every(function(v){ return v; });
    it.m=it.m.map(function(v){ return todos ? 0 : (v || 1); });
    _pgfCambio(); _pgfRefresca(i); return;
  }
  if(que==='cat'){ PGF.cat_abierto=!PGF.cat_abierto; _pgfCatPinta(); if(PGF.cat_abierto) try{ $('pgf-cat-q').focus(); }catch(e2){} return; }
  if(que==='cat-cerrar'){ PGF.cat_abierto=false; _pgfCatPinta(); return; }
  if(que==='cat-todas'){
    var L0=document.querySelectorAll('#pgf-cat-l label:not([hidden]) input[data-cat]:not([disabled])'), falta=Array.prototype.some.call(L0, function(c){ return !c.checked; });
    Array.prototype.forEach.call(L0, function(c){ c.checked=falta; });
    var n0=document.querySelectorAll('#pgf-cat-l input[data-cat]:checked:not([disabled])').length, bk=$('pgf-cat-ok'); bk.disabled=!n0; bk.textContent=n0 ? 'Agregar '+n0 : 'Agregar'; b.textContent=falta ? 'Desmarcar todas' : 'Marcar todas'; return;
  }
  if(que==='cat-desde'){ PGF.todoAnio=(b.getAttribute('data-v')==='anio'); Array.prototype.forEach.call($('pgf-cat-desde').querySelectorAll('button'), function(x){ var on=(x===b); x.className=on ? 'on' : ''; x.setAttribute('aria-selected', on ? 'true' : 'false'); }); return; }
  if(que==='cat-ok'){ _pgfCatAgregar(); return; }
  if(que==='traer'){ _pgfTraer(); return; }
  if(que==='copiar' && PGF.prev){ PGF.d=_pgfCopia(PGF.prev.d, PGF.anio, PGF.des); _pgfCambio(); _pgfPinta(); _pgfMsg('Copiado del programa de '+(+PGF.anio-1)+': las mismas filas y los mismos meses, sin lo ejecutado.', 'ok'); return; }
  if(que==='mas-firma'){ if(d.firmas.length<6){ d.firmas.push({ rol:'', nombre:'', cargo:'' }); _pgfCambio(); _pgfPinta(); } return; }
  if(que==='quita-firma'){ var fi=b.closest('.pg-firma'); if(fi){ d.firmas.splice(+fi.getAttribute('data-f'), 1); _pgfCambio(); _pgfPinta(); } return; }
  if(que==='firmas-def'){ d.firmas=progFirmasDef(PGF.tipo, PGF.des); _pgfCambio(); _pgfPinta(); _pgfMsg('Puestas las firmas de partida.', 'ok'); return; }
}
/* ── paso 3 · las firmas, según lo que pide la norma ── */
function progNormaHTML(tipo){
  var N=progNorma(tipo), pais=paisInfoP().n, hayFirma=N.some(function(x){ return x.firma; });
  var h='<div class="pg-norma" id="pgf-norma" data-sin-pais><h3>Lo que pide la norma · '+esc(pais)+'</h3>';
  if(N.length) h+='<ul>'+N.map(function(x){ return '<li'+(x.firma ? ' data-firma' : '')+'>'+esc(x.v)+'<small>'+esc(x.n)+(x.u ? ' · <a href="'+esc(x.u)+'" target="_blank" rel="noopener">texto oficial ↗</a>' : '')+'</small></li>'; }).join('')+'</ul>';
  if(!hayFirma) h+='<p'+(N.length ? ' style="margin-top:9px"' : '')+'>'+(N.length ? 'Sobre quién firma este programa' : 'Para este programa')+' no tenemos, en la norma '+esc(paisDeP(paisObraP()))+', una exigencia verificada: van las firmas de uso —quien lo elaboró, quien lo revisó y quien lo aprobó—. Cámbialas por las que use tu empresa.</p>';
  return h+'</div>';
}
function _pgfFirmas(){
  var d=PGF.d, hayBase=progNorma(PGF.tipo).some(function(x){ return x.firma; });
  var h=progNormaHTML(PGF.tipo)+
    '<div class="seccion" style="margin-top:0"><h3>Quiénes firman <span class="tenue" style="font-weight:400">· salen al pie de la hoja, cada uno con su casillero</span></h3>'+
    '<div class="pg-firmas" id="pgf-firmas">'+d.firmas.map(function(f, i){
      return '<div class="pg-firma" data-f="'+i+'">'+
        '<div class="campo"><label for="pgf-fr-'+i+'">Firma como</label><input id="pgf-fr-'+i+'" data-k="rol" maxlength="40" list="pgf-dl-rol" autocomplete="off" value="'+esc(f.rol)+'"></div>'+
        '<div class="campo"><label for="pgf-fn-'+i+'">Nombre <span class="tenue">· o en blanco</span></label><input id="pgf-fn-'+i+'" data-k="nombre" maxlength="90" list="pgf-dl-g" autocomplete="off" value="'+esc(f.nombre)+'"></div>'+
        '<div class="campo"><label for="pgf-fc-'+i+'">Cargo</label><input id="pgf-fc-'+i+'" data-k="cargo" maxlength="90" autocomplete="off" value="'+esc(f.cargo)+'"></div>'+
        '<button type="button" class="pg-x" data-que="quita-firma" aria-label="Quitar la firma '+(i+1)+'">×</button></div>'; }).join('')+'</div>'+
    '<div class="acciones" style="justify-content:flex-start;margin:0 0 12px">'+(d.firmas.length<6 ? '<button type="button" class="bt sec chico" data-que="mas-firma">＋ Agregar una firma</button>' : '')+
      '<button type="button" class="bt-link" data-que="firmas-def">Volver a las de partida</button></div></div>'+
    (hayBase ? '<label class="check" style="margin:0 0 6px"><input type="checkbox" id="pgf-base"'+(d.base!==false ? ' checked' : '')+'><span>Imprimir debajo de las firmas la norma que dice quién lo aprueba</span></label>' : '')+
    '<datalist id="pgf-dl-rol"><option value="Elaborado por"></option><option value="Revisado por"></option><option value="Aprobado por"></option></datalist>'+
    '<datalist id="pgf-dl-g" data-sin-pais>'+(PGF.gente||[]).slice(0, 1500).map(function(g){ return '<option value="'+esc(g.nombre)+'">'+esc(g.puesto||'')+'</option>'; }).join('')+'</datalist>';
  return h;
}
/* ── paso 4 · la hoja ── */
function _pgfHoja(){
  return '<div class="acciones" style="justify-content:flex-start;margin:0 0 6px"><button type="button" class="bt chico" id="pgf-pdf" disabled>Descargar el PDF</button><button type="button" class="bt sec chico" id="pgf-xls">Excel</button><button type="button" class="bt sec chico" id="pgf-imp" disabled>Imprimir</button></div>'+
    '<p class="ayuda" style="margin:0 0 12px">Al descargar o imprimir se guarda primero, para que quede en la sección.</p>'+_pgHojaHTML('pgf');
}
/* lo que se guarda (borrador:true → tal cual está, para la vista previa; sin él, limpio) */
function _pgfPaquete(borrador){
  var s=PGF.d, d={ v:1, k:'prog', tipo:PGF.tipo, anio:String(PGF.anio) };
  ['cod', 'ver', 'acta', 'alc', 'meta', 'ind', 'pres', 'rec'].forEach(function(c){ d[c]=gesTxt(s[c]).slice(0, 240); });
  d.obj=String(s.obj||'').trim().slice(0, 500);
  d.aprob=/^\d{4}-\d{2}-\d{2}$/.test(String(s.aprob||'')) ? s.aprob : '';
  d.items=(s.items||[]).filter(function(x){ return x.ref || gesTxt(x.n) || (borrador && x.m.some(function(v){ return v; })); }).map(function(x){
    var o={ id:String(x.id||_pgId()), n:x.ref ? '' : gesTxt(x.n).slice(0, 160), resp:gesTxt(x.resp).slice(0, 100), a:gesTxt(x.a).slice(0, 100), h:gesTxt(x.h).replace(',', '.').slice(0, 5), fr:String(x.fr||''), g:gesTxt(x.g).slice(0, 60), obs:gesTxt(x.obs).slice(0, 200), m:_pgMeses(x.m) };
    if(x.ref) o.ref=x.ref;
    return o;
  });
  d.firmas=(s.firmas||[]).filter(function(f){ return gesTxt(f.rol) || gesTxt(f.nombre) || gesTxt(f.cargo); }).slice(0, 6).map(function(f){ return { rol:gesTxt(f.rol).slice(0, 40), nombre:gesTxt(f.nombre).slice(0, 90), cargo:gesTxt(f.cargo).slice(0, 90) }; });
  d.base=(s.base!==false);
  d.por=s.por || gesQuien(); d.cuando=s.cuando || new Date().toISOString();
  if(!borrador && PGF.id) d.cambio=new Date().toISOString();
  return d;
}
/* sinCerrar: guardar y seguir (lo usa «Descargar el PDF») → Promise<true|false> */
function _pgfGuardar(sinCerrar){
  if(!PGF || PGF.guardando) return Promise.resolve(false);
  var yo=PGF, bt=$('pgf-ok');
  for(var i=0;i<PGF_PASOS.length;i++){
    var f=_pgfFalta(PGF_PASOS[i]);
    if(f){ if(yo.paso!==PGF_PASOS[i]){ yo.paso=PGF_PASOS[i]; _pgfPinta(); } _pgfMsg('«'+PGF_NOM[PGF_PASOS[i]]+'»: '+f, 'mal'); return Promise.resolve(false); }
  }
  /* guardado y sin cambios: no hay nada que escribir */
  if(yo.id && !yo.sucio){ if(!sinCerrar) cerrarHoja(); return Promise.resolve(true); }
  var paq=_pgfPaquete(false), texto=JSON.stringify(paq), nombre=progNombre(yo.tipo, yo.anio), T=progTipo(yo.tipo);
  yo.guardando=true; if(bt) bt.disabled=true; _pgfMsg('Guardando…', 'gris');
  var p;
  if(yo.id){
    /* si otro lo cambió mientras tanto, no se le escribe encima */
    p=traerUna('sst_doc', yo.id, 'id,hoja,nota').then(function(fila){
      if(!fila) return Promise.reject({portal:'Este programa ya no está: alguien lo quitó.'});
      if(String(fila.nota||'')!==String(yo.texto||'')) return Promise.reject({portal:'Otra persona lo cambió mientras lo corregías. Ciérralo y vuelve a abrirlo para ver cómo quedó.'});
      return sbPatch('sst_doc?id=eq.'+encodeURIComponent(yo.id), { nombre:nombre, nota:texto });
    }).then(function(rows){ if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede cambiarlo.'}); return yo.id; });
  } else {
    p=progTraer(true).then(function(filas){
      if(progDe(filas, yo.tipo, yo.anio)) return Promise.reject({portal:'Alguien ya armó este programa mientras tanto. Ciérralo y ábrelo otra vez para verlo.'});
      return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:PROG_HOJA, nombre:nombre, nota:texto });
    }).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede registrar en esta obra.'});
      return (rows && rows[0] && rows[0].id) || null;
    });
  }
  return p.then(function(id){
    yo.guardando=false; if(bt) bt.disabled=false;
    var era=yo.nuevo;
    yo.id=id||yo.id; yo.texto=texto; yo.nuevo=false; yo.sucio=false; yo.d=progLimpio(paq); PROGD.filas=null;
    try{ clearTimeout(yo._t); guardar(_pgfLlave(yo.tipo, yo.anio), null); }catch(e){}
    /* la copia que usan las filas «de otro programa» y la sección */
    var esta={ id:yo.id, creado:new Date().toISOString(), texto:texto, d:progLimpio(paq) };
    yo.filas=(yo.filas||[]).filter(function(x){ return !(x.d.tipo===yo.tipo && String(x.d.anio)===String(yo.anio)); }).concat([esta]);
    toast(era ? T.n+' '+yo.anio+' guardado.' : 'Cambios guardados.');
    if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    if(sinCerrar){ if(PGF===yo){ _pgfMsg('Guardado.', 'ok'); if(bt) bt.textContent='Guardar los cambios'; var q=$('pgf-quitar'); if(q){ q.hidden=false; q.onclick=_pgfQuitar; } } }
    else if(PGF===yo) cerrarHoja();
    return true;
  }, function(e){
    yo.guardando=false; if(bt) bt.disabled=false;
    if(PGF===yo) _pgfMsg('No se pudo guardar. '+porQueFallo(e), 'mal');
    return false;
  });
}
function _pgfQuitar(){
  var yo=PGF; if(!yo || !yo.id) return;
  var T=progTipo(yo.tipo), n=_pgfNombres(yo.d).length;
  confirmar('¿Quitar este programa?', '«'+T.n+' '+yo.anio+'», con '+gesPlural(n, 'fila', 'filas')+'. Lo que la obra tiene registrado —capacitaciones, inspecciones, simulacros, campañas— no se toca.', { si:'Sí, quitarlo', mal:true }).then(function(si){
    if(!si) return;
    sbDelP('sst_doc?id=eq.'+encodeURIComponent(yo.id)).then(function(rows){
      if(Array.isArray(rows) && !rows.length){ toast('No se pudo quitar: esta cuenta no puede borrarlo.'); return; }
      PROGD.filas=null; try{ guardar(_pgfLlave(yo.tipo, yo.anio), null); }catch(e){}
      toast('Programa quitado.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}

/* ══ 4 · LA HOJA: EL PDF Y EL EXCEL ════════════════════════════════════════════════════════════
   A4 horizontal, con el dibujo de papeles.js (_ppDoc: la cabecera con el logo y la caja del código, las hojas que
   hagan falta, el pie). Cada actividad lleva dos renglones en los meses: arriba la P, abajo la E.
   op.avance: false → «para aprobar»: solo lo programado (la E queda en blanco, para marcarla a mano);
              true  → «con el avance»: lo programado, lo ejecutado y el cumplimiento de cada mes. */
var _PG_VERDE = [207, 235, 217], _PG_AMBAR = [255, 233, 191];
/* las filas en el orden de la hoja; en el programa anual de SST, juntas por su línea */
function _pgOrden(d){
  var L=(d.items||[]).filter(function(x){ return x.ref || gesTxt(x.n); });
  if(d.tipo!=='sst') return L.map(function(x){ return { it:x }; });
  var pos=function(g){ var i=PROG_LINEAS.indexOf(g); return i<0 ? (g ? 50 : 99) : i; }, out=[], g0=null;
  L.map(function(x, i){ return { it:x, i:i, g:gesTxt(x.g) }; }).sort(function(a, b){ return (pos(a.g)-pos(b.g)) || a.g.localeCompare(b.g, 'es') || (a.i-b.i); }).forEach(function(q){
    if(q.g!==g0){ g0=q.g; out.push({ banda:q.g || 'Otras actividades' }); }
    out.push({ it:q.it });
  });
  return out;
}
function _pgNombreFila(it, anio, progs, H){
  if(!it.ref) return gesTxt(it.n);
  var R=progTipo(it.ref), otro=progDe(progs, it.ref, anio);
  return R.n+(otro ? ' ('+gesPlural(progResumen(otro.d, H, progs).n, R.una, R.varias)+', según su programa)' : ' (todavía sin armar)');
}
function progPdf(d, H, progs, op){
  op=op||{};
  var fuera=(paisObraP()!=='pe'), nada=function(){ return null; };
  return Promise.all([cargarEvPDF(), papCtx(), fuera ? cargarExige().catch(nada) : Promise.resolve(null)]).then(function(r){
    var X=r[1]||{}, T=progTipo(d.tipo), av=!!op.avance, anio=String(d.anio), cerr=progCerrados(anio), G=function(x){ return progGen(d.tipo, x); };
    var C={ emp:X.emp||{}, logo:X.logo||null, obra:X.obra||'', fmt:{ prog:{ cod:d.cod, rev:d.ver, fecha:d.aprob } }, tx:fuera ? txPaisP : null, rotulo:X.obra||'' };
    var P=_ppDoc('h', C, T.tit+' '+anio, av ? 'Avance al '+fechaLarga(hoyISO()) : 'Lo programado para el año', 'prog'), doc=P.doc, tx=P.tx;
    P.cabecera();
    /* ── los datos ── */
    var x0=P.M, m=P.w/2, hF=6;
    P.par(x0, P.y, 22, m-22, hF, 'EMPRESA', C.emp.razon||''); P.par(x0+m, P.y, 30, m-30, hF, 'OBRA / PROYECTO', C.obra||''); P.y+=hF;
    var largo=function(rot, val){
      if(!gesTxt(val)) return;
      var hh=Math.max(hF, Math.min(3, P.parte(val, P.w-22-2.8, 7.6, true).length)*P.lh(7.6)+1.6);
      P.celda(x0, P.y, 22, hh, tx(rot), {f:_PP_AZUL, b:true, pt:7}); P.celda(x0+22, P.y, P.w-22, hh, tx(val), {b:true, pt:7.6, max:3}); P.y+=hh;
    };
    largo('OBJETIVO', d.obj); largo('ALCANCE', d.alc);
    var dos=function(r1, v1, r2, v2){ if(!gesTxt(v1) && !gesTxt(v2)) return; P.par(x0, P.y, 22, m-22, hF, r1, tx(v1||'')); P.par(x0+m, P.y, 30, m-30, hF, r2, tx(v2||'')); P.y+=hF; };
    if(d.tipo==='sst'){ dos('META', d.meta, 'INDICADOR', d.ind); dos('PRESUPUESTO', d.pres, 'RECURSOS', d.rec); }
    if(d.aprob || d.acta) dos('APROBADO EL', d.aprob ? fechaLarga(d.aprob) : '', 'ACTA / DOCUMENTO', d.acta);
    P.y+=2.2;
    /* ── la tabla ── */
    var wN=7, wPE=5, wM=9, wC=13, cols;
    if(d.tipo==='cap') cols=[['n', 'TEMA', 68, true], ['resp', 'RESPONSABLE', 34], ['a', 'DIRIGIDO A', 32], ['h', 'HORAS', 12, false, 'c']];
    else if(d.tipo==='insp') cols=[['n', 'QUÉ SE INSPECCIONA', 82, true], ['resp', 'RESPONSABLE', 40], ['fr', 'FRECUENCIA', 24, false, 'c']];
    else if(d.tipo==='sim') cols=[['n', 'SIMULACRO', 52, true], ['a', 'ESCENARIO', 60], ['resp', 'RESPONSABLE', 34]];
    else if(d.tipo==='camp') cols=[['n', 'CAMPAÑA', 52, true], ['a', 'LEMA O MENSAJE', 60], ['resp', 'RESPONSABLE', 34]];
    else cols=[['n', 'ACTIVIDAD', 106, true], ['resp', 'RESPONSABLE', 40]];
    var xM=x0+wN+cols.reduce(function(s, c){ return s+c[2]; }, 0)+wPE, hCab=7;
    var cab=function(){
      var x=x0;
      P.celda(x, P.y, wN, hCab, 'N.º', {f:_PP_AZUL, b:true, pt:6.6, al:'c'}); x+=wN;
      cols.forEach(function(c){ P.celda(x, P.y, c[2], hCab, tx(c[1]), {f:_PP_AZUL, b:true, pt:6.6, al:'c'}); x+=c[2]; });
      P.celda(x, P.y, wPE, hCab, '', {f:_PP_AZUL}); x+=wPE;
      for(var i=0;i<12;i++){ P.celda(x, P.y, wM, hCab, progMes(i).toUpperCase(), {f:_PP_AZUL, b:true, pt:6.4, al:'c'}); x+=wM; }
      P.celda(x, P.y, wC, hCab, 'CUMPL.', {f:_PP_AZUL, b:true, pt:6.2, al:'c'});
      P.y+=hCab;
    };
    cab();
    var filas=_pgOrden(d), num=0, TP=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], TE=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    filas.forEach(function(q){
      if(q.banda!==undefined){
        if(!P.cabe(5+8)){ P.salto(); cab(); }
        P.celda(x0, P.y, P.w, 5, tx(String(q.banda).toUpperCase()), {f:_PP_GRIS, b:true, pt:6.8}); P.y+=5; return;
      }
      var it=q.it, F=progFila(it, d.tipo, H, progs, anio), vals={};
      cols.forEach(function(c){ vals[c[0]]=(c[0]==='n') ? _pgNombreFila(it, anio, progs, H) : (c[0]==='fr' ? progFreqN(it.fr) : gesTxt(it[c[0]])); });
      var hR=8;
      cols.forEach(function(c){ hR=Math.max(hR, P.alto(tx(vals[c[0]]), c[2]-2.8, c[3] ? 7.6 : 7, !!c[3])+1.8); });
      if(!P.cabe(hR)){ P.salto(); cab(); }
      var x=x0, y=P.y, h2=hR/2; num++;
      P.celda(x, y, wN, hR, String(num), {pt:7, al:'c'}); x+=wN;
      cols.forEach(function(c){ P.celda(x, y, c[2], hR, tx(vals[c[0]]), {pt:c[3] ? 7.6 : 7, b:!!c[3], al:c[4]||''}); x+=c[2]; });
      P.celda(x, y, wPE, h2, 'P', {pt:6, b:true, al:'c', c:_PP_TENUE}); P.celda(x, y+h2, wPE, h2, 'E', {pt:6, b:true, al:'c', c:_PP_TENUE}); x+=wPE;
      var p=0, e=0, pa=0, ea=0;
      F.forEach(function(c, i){
        var eje=av && c.e, ext=av && !c.p && (c.auto>0);
        if(c.p){ p++; TP[i]++; if(c.e){ pa++; ea++; if(av){ e++; TE[i]++; } } else if(i<cerr) pa++; }
        P.celda(x, y, wM, h2, c.p ? 'P' : '', {f:c.p ? _PP_AZUL : null, b:true, pt:6.6, al:'c'});
        if(av && c.parte) P.celda(x, y+h2, wM, h2, c.parte, {f:_PG_AMBAR, b:true, pt:6, al:'c'});
        else P.celda(x, y+h2, wM, h2, (eje || ext) ? 'E' : '', {f:(eje || ext) ? _PG_VERDE : null, b:true, pt:6.6, al:'c'});
        x+=wM;
      });
      if(av && p){ P.celda(x, y, wC, h2, e+' / '+p, {pt:6.8, b:true, al:'c'}); P.celda(x, y+h2, wC, h2, pa ? Math.round(ea*100/pa)+' %' : '', {pt:6.8, al:'c'}); }
      else P.celda(x, y, wC, hR, '');
      P.y+=hR;
    });
    if(!num){ P.celda(x0, P.y, P.w, 10, tx('Todavía no tiene actividades.'), {pt:7.6, al:'c', c:_PP_TENUE}); P.y+=10; }
    /* ── los totales de cada mes ── */
    var wIzq=xM-x0, R=progResumen(d, H, progs);
    var total=function(rot, V, fin, f){
      if(!P.cabe(5)){ P.salto(); cab(); }
      var x=x0; P.celda(x, P.y, wIzq, 5, tx(rot), {f:_PP_GRIS, b:true, pt:6.6, al:'d'}); x+=wIzq;
      V.forEach(function(v){ P.celda(x, P.y, wM, 5, v, {f:f||null, b:true, pt:6.4, al:'c', max:1}); x+=wM; });
      P.celda(x, P.y, wC, 5, fin, {f:_PP_GRIS, b:true, pt:6.8, al:'c'}); P.y+=5;
    };
    if(num){
      total(G('PROGRAMADAS'), TP.map(function(v){ return v ? String(v) : ''; }), String(R.prog));
      if(av){
        total(G('EJECUTADAS'), TP.map(function(v, i){ return v ? String(TE[i]) : ''; }), String(TE.reduce(function(s, v){ return s+v; }, 0)));
        total('CUMPLIMIENTO DEL MES', TP.map(function(v, i){ return (v && (i<cerr || TE[i]>=v)) ? Math.round(TE[i]*100/v)+'%' : ''; }), R.pct===null ? '—' : R.pct+' %');
      }
    }
    P.y+=1.6;
    var ley='P: programado   ·   E: ejecutado'+(av ? '   ·   Lo ejecutado se cuenta con lo registrado en OBRASST y con lo marcado a mano.'+(R.aFecha ? '   ·   Cumplimiento a la fecha (meses cerrados y lo ya ejecutado): '+R.cumpl+' de '+R.aFecha+' ('+R.pct+' %).' : '') : '   ·   El renglón E queda en blanco para marcar lo ejecutado.');
    if(!P.cabe(4)) P.salto();
    P.txt(tx(ley), x0, P.y, P.w, {pt:6.4, c:_PP_TENUE, max:2}); P.y+=P.alto(tx(ley), P.w, 6.4)+2.6;
    /* ── las firmas, y debajo la norma que dice quién aprueba ── */
    var Fm=(d.firmas||[]).filter(function(f){ return gesTxt(f.rol) || gesTxt(f.nombre) || gesTxt(f.cargo); });
    var base=(d.base!==false) ? progNorma(d.tipo).filter(function(n){ return n.firma; }) : [];
    if(Fm.length){
      var hFi=27, hBase=base.reduce(function(s, n){ return s+P.alto('Base: '+n.v+' ('+n.n+')', P.w, 6.2)+0.8; }, 0);
      if(!P.cabe(hFi+hBase+1)) P.salto();
      var wF=P.w/Fm.length;
      Fm.forEach(function(f, i){
        var x=x0+i*wF, y=P.y;
        P.celda(x, y, wF, 4.8, tx(String(f.rol||'').toUpperCase()), {f:_PP_AZUL, b:true, pt:6.8, al:'c'});
        P.caja(x, y+4.8, wF, hFi-4.8);
        doc.setDrawColor(120, 128, 136); doc.setLineWidth(0.2); doc.line(x+wF*0.14, y+17.4, x+wF*0.86, y+17.4);
        P.txt(f.nombre||'', x+1.4, y+18, wF-2.8, {pt:7.4, b:true, al:'c', max:1});
        P.txt(tx(f.cargo||''), x+1.4, y+21.6, wF-2.8, {pt:6.6, al:'c', c:_PP_TENUE, max:2});
      });
      P.y+=hFi+1.4;
      base.forEach(function(n){ var t='Base: '+n.v+' ('+n.n+')'; P.txt(t, x0, P.y, P.w, {pt:6.2, c:_PP_TENUE}); P.y+=P.alto(t, P.w, 6.2)+0.8; });
    }
    var S=P.listo();
    S.nombre=_papNombre(T.n+' '+anio+' - '+(C.obra||'obra')+(av ? ' (avance)' : ''))+'.pdf';
    S.avance=av;
    return S;
  });
}
/* ── el Excel: la misma matriz, con dos renglones por actividad (P y E) y los totales con fórmula ── */
function progExcel(d, H, progs, bt){
  if(bt) bt.disabled=true;
  var fuera=(paisObraP()!=='pe');
  return Promise.all([cargarEvPDF(), papCtx().catch(function(){ return {}; }), fuera ? cargarExige().catch(function(){ return null; }) : Promise.resolve(null)]).then(function(r){
    var X=RCAP.xlsx, E=new X.Estilos(), C=X.C, ctx=r[1]||{}, T=progTipo(d.tipo), anio=String(d.anio), obra=String(ctx.obra || (YO.obra||{}).nombre || ''), tx=fuera ? txPaisP : function(s){ return s; };
    var sTit=E.xf({ b:1, sz:14, c:C.petroleo }), sSub=E.xf({ sz:10, c:C.gris }), sRot=E.xf({ b:1, sz:9, c:C.petroleo, f:C.pie, borde:true, v:'top' }), sVal=E.xf({ sz:10, c:C.tinta, borde:true, wrap:1, v:'top' }),
        sCab=E.xf({ b:1, sz:9, c:C.blanco, f:C.petroleo, h:'center', v:'center', wrap:1, borde:true }), sTx=E.xf({ sz:10, c:C.tinta, borde:true, wrap:1 }), sTxB=E.xf({ b:1, sz:10, c:C.tinta, borde:true, wrap:1 }),
        sCen=E.xf({ sz:10, c:C.tinta, h:'center', borde:true }), sPE=E.xf({ b:1, sz:8, c:C.gris, h:'center', borde:true }), sP=E.xf({ b:1, sz:9, c:C.progT, f:C.progF, h:'center', borde:true }), sE=E.xf({ b:1, sz:9, c:C.okT, f:C.okF, h:'center', borde:true }),
        sPar=E.xf({ b:1, sz:8, c:C.ojoT, f:C.ojoF, h:'center', borde:true }), sVac=E.xf({ sz:9, c:C.tinta, h:'center', borde:true }), sBanda=E.xf({ b:1, sz:9, c:C.petroleo, f:C.fondo, borde:true }),
        sTot=E.xf({ b:1, sz:9, c:C.petroleo, f:C.pie, h:'center', borde:true, fmt:'0' }), sTotR=E.xf({ b:1, sz:9, c:C.petroleo, f:C.pie, h:'right', borde:true }), sPct=E.xf({ b:1, sz:9, c:C.petroleo, f:C.pie, h:'center', borde:true, fmt:'0%' }), sN0=E.xf({ sz:10, c:C.tinta, h:'center', borde:true, fmt:'0' }), sPc=E.xf({ sz:10, c:C.tinta, h:'center', borde:true, fmt:'0%' });
    var cols;
    if(d.tipo==='cap') cols=[['n', 'Tema', 40], ['resp', 'Responsable', 24], ['a', 'Dirigido a', 22], ['h', 'Horas', 8]];
    else if(d.tipo==='insp') cols=[['n', 'Qué se inspecciona', 42], ['resp', 'Responsable', 26], ['fr', 'Frecuencia', 14]];
    else if(d.tipo==='sim') cols=[['n', 'Simulacro', 30], ['a', 'Escenario', 38], ['resp', 'Responsable', 24]];
    else if(d.tipo==='camp') cols=[['n', 'Campaña', 30], ['a', 'Lema o mensaje', 38], ['resp', 'Responsable', 24]];
    else cols=[['n', 'Actividad', 54], ['resp', 'Responsable', 26]];
    var h=new X.Hoja('Programa'); h.activa=true; h.pie=T.n+' '+anio;
    var cPE=1+cols.length, cM=cPE+1, cFin=cM+12, ult=cFin+2;      /* columnas: N.º · … · P/E · 12 meses · Programadas · Ejecutadas · Cumplimiento */
    h.unir(0, 1, ult, 1, tx(T.tit)+' '+anio, sTit); h.altos[1]=22;
    h.unir(0, 2, ult, 2, [ctx.emp && ctx.emp.razon, obra].filter(Boolean).join(' · ')+(d.ver ? ' · versión '+d.ver : '')+(d.cod ? ' · '+d.cod : '')+(d.aprob ? ' · aprobado el '+fechaLarga(d.aprob) : ''), sSub);
    var fr=4, dato=function(rot, val){ if(!gesTxt(val)) return; h.unir(0, fr, 1, fr, tx(rot), sRot); h.unir(2, fr, ult, fr, tx(val), sVal); h.altos[fr]=Math.max(16, Math.ceil(String(val).length/150)*14); fr++; };
    dato('Objetivo', d.obj); dato('Alcance', d.alc);
    if(d.tipo==='sst'){ dato('Meta', d.meta); dato('Indicador', d.ind); dato('Presupuesto', d.pres); dato('Recursos', d.rec); }
    dato('Acta o documento', d.acta);
    fr++;
    var rCab=fr;
    h.celda(0, fr, 'N.º', sCab); cols.forEach(function(c, i){ h.celda(1+i, fr, tx(c[1]), sCab); }); h.celda(cPE, fr, '', sCab);
    for(var i=0;i<12;i++) h.celda(cM+i, fr, progMes(i), sCab);
    h.celda(cFin, fr, progGen(d.tipo, 'Programadas'), sCab); h.celda(cFin+1, fr, progGen(d.tipo, 'Ejecutadas'), sCab); h.celda(cFin+2, fr, 'Cumplimiento', sCab); h.altos[fr]=26;
    h.anchos[0]=5; cols.forEach(function(c, i){ h.anchos[1+i]=c[2]; }); h.anchos[cPE]=3.5; for(i=0;i<12;i++) h.anchos[cM+i]=5; h.anchos[cFin]=12; h.anchos[cFin+1]=11; h.anchos[cFin+2]=13;
    fr++;
    var r0=fr, num=0, L1=gesLetra(cM), L2=gesLetra(cM+11), filasP=[], filasE=[];
    _pgOrden(d).forEach(function(q){
      if(q.banda!==undefined){ h.unir(0, fr, ult, fr, tx(q.banda), sBanda); fr++; return; }
      var it=q.it, F=progFila(it, d.tipo, H, progs, anio), p=0, e=0; num++;
      h.unir(0, fr, 0, fr+1, num, sN0);
      cols.forEach(function(c, k){ var v=(c[0]==='n') ? _pgNombreFila(it, anio, progs, H) : (c[0]==='fr' ? progFreqN(it.fr) : gesTxt(it[c[0]])); h.unir(1+k, fr, 1+k, fr+1, tx(v), c[0]==='n' ? sTxB : (c[0]==='h' || c[0]==='fr' ? sCen : sTx)); });
      h.celda(cPE, fr, 'P', sPE); h.celda(cPE, fr+1, 'E', sPE);
      F.forEach(function(c, m){
        if(c.p) p++; if(c.p && c.e) e++;
        h.celda(cM+m, fr, c.p ? 'P' : '', c.p ? sP : sVac);
        if(c.parte) h.celda(cM+m, fr+1, c.parte, sPar); else h.celda(cM+m, fr+1, (c.e && (c.p || c.auto)) ? 'E' : '', (c.e && (c.p || c.auto)) ? sE : sVac);
      });
      h.unir(cFin, fr, cFin, fr+1, p, sN0, 'COUNTIF('+L1+fr+':'+L2+fr+',"P")');
      h.unir(cFin+1, fr, cFin+1, fr+1, e, sN0, 'COUNTIFS('+L1+fr+':'+L2+fr+',"P",'+L1+(fr+1)+':'+L2+(fr+1)+',"E")');
      h.unir(cFin+2, fr, cFin+2, fr+1, p ? e/p : 0, sPc, 'IF('+gesLetra(cFin)+fr+'=0,0,'+gesLetra(cFin+1)+fr+'/'+gesLetra(cFin)+fr+')');
      filasP.push(fr); filasE.push(fr+1); fr+=2;
    });
    if(num){
      /* los totales de cada mes: las P de sus renglones P y las E de sus renglones E */
      var R=progResumen(d, H, progs), TE=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      (d.items||[]).forEach(function(it){ if(!it.ref && !gesTxt(it.n)) return; progFila(it, d.tipo, H, progs, anio).forEach(function(c, m){ if(c.p && c.e) TE[m]++; }); });
      var suma=function(col, rows, letra){ return rows.map(function(rr){ return 'IF('+gesLetra(col)+rr+'="'+letra+'",1,0)'; }).join('+'); };
      h.unir(0, fr, cPE, fr, progGen(d.tipo, 'Programadas'), sTotR);
      for(i=0;i<12;i++) h.celda(cM+i, fr, R.meses[i].p, sTot, filasP.length<=60 ? suma(cM+i, filasP, 'P') : null);
      h.celda(cFin, fr, R.prog, sTot, 'SUM('+L1+fr+':'+L2+fr+')'); h.celda(cFin+1, fr, '', sTot); h.celda(cFin+2, fr, '', sTot); fr++;
      h.unir(0, fr, cPE, fr, progGen(d.tipo, 'Ejecutadas')+' (de '+progGen(d.tipo, 'las programadas').replace(/^las (programados)/, 'los $1')+')', sTotR);
      for(i=0;i<12;i++) h.celda(cM+i, fr, TE[i], sTot);
      var te=TE.reduce(function(s, v){ return s+v; }, 0);
      h.celda(cFin, fr, '', sTot); h.celda(cFin+1, fr, te, sTot, 'SUM('+L1+fr+':'+L2+fr+')'); h.celda(cFin+2, fr, R.prog ? te/R.prog : 0, sPct, 'IF('+gesLetra(cFin)+(fr-1)+'=0,0,'+gesLetra(cFin+1)+fr+'/'+gesLetra(cFin)+(fr-1)+')'); fr++;
    }
    fr++;
    h.unir(0, fr, ult, fr, 'P: programado · E: ejecutado. Lo ejecutado se cuenta con lo registrado en OBRASST y con lo marcado a mano. Hoja armada el '+fechaLarga(hoyISO())+'.', sSub); fr+=2;
    var Fm=(d.firmas||[]).filter(function(f){ return gesTxt(f.rol) || gesTxt(f.nombre) || gesTxt(f.cargo); });
    Fm.forEach(function(f){ h.unir(0, fr, 2, fr, tx(f.rol||''), sRot); h.unir(3, fr, ult, fr, [f.nombre, tx(f.cargo||'')].filter(Boolean).join(' · '), sVal); fr++; });
    if(d.base!==false) progNorma(d.tipo).filter(function(n){ return n.firma; }).forEach(function(n){ h.unir(0, fr, ult, fr, 'Base: '+n.v+' ('+n.n+')', sSub); fr++; });
    h.congelar={ c:0, r:rCab };
    bajarBlob(X.libro([h], E, T.n+' '+anio), _papNombre(T.n+' '+anio+' - '+(obra||'obra'))+'.xlsx');
    if(bt) bt.disabled=false;
    return true;
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar el Excel. Revisa tu conexión.'); return false; });
}
