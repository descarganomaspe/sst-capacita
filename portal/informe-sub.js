/* OBRASST · el portal · EL INFORME DE LAS SUBCONTRATAS, Y LOS ESTÁNDARES Y BOLETINES DE LA PRINCIPAL (15/10/2026, lote 12)
   Marcelo: «la principal, o sea el cliente, siempre pide informe a las subcontratas, y que en la plataforma y/o web les
   manden o armen la estructura del informe que serán carpetas o archivos… lo publica para las subcontratas, únicamente
   para los supervisores o jefes… y le sale tipo un porcentaje de cumplimiento… o que la principal tenga la opción de que
   sea automático la subida o que le presenten al último día del mes». Y «estándares, difusiones de boletines».
   Dos secciones del área «Supervisión»:
     · «Informes»: lo que pido (armar con una plantilla o desde cero, publicar, el tablero de todas mis subcontratas
       periodo a periodo, revisar por carpeta, aprobar y sellar, el ZIP con las carpetas tal cual, el panel fotográfico en
       PDF, el año) y lo que me piden (llenar, ordenar, presentar);
     · «Estándares y boletines»: publicar (con el acuse de cada subcontrata, la difusión a su gente con su firma y quién
       vio el boletín) y lo que me llegó.
   Todo por las funciones del servidor (sql/2026-11-26-informe.sql): quién puede qué lo decide el servidor. Lo común con la
   app (las plantillas, los nombres, la nomenclatura, el ZIP) va entre las marcas de abajo: lo pone armar.py desde
   informe-sub-base.js. Necesita portal/cadena.js (CADP, cadCorto). No editar la versión: la sella armar.py (INFSUB_VER). */
/* >>> INFSUB-BASE-INI (lo re-inyecta armar.py, no editar a mano) <<< */
/* ═══ EL INFORME DE LAS SUBCONTRATAS · LO COMÚN (15/10/2026, lote 12) ════════════════════════════════════════════
   Marcelo: «la principal, o sea el cliente, siempre pide informe a las subcontratas… el cliente arma las carpetas y qué
   documentos necesitaría en cada una, lo publica para las subcontratas, únicamente para los supervisores o jefes…
   y le sale tipo un porcentaje de cumplimiento del informe, a la subcontrata y a la principal». Y después: «reportes
   semanales (horas hombre por cada subcontrata que llena durante la semana) y cumplimientos esporádicos que lanza la
   principal… se sumaría para el informe mensual también».
   El mismo archivo en la app (lo inyecta armar.py en index.html) y dentro de portal/informe-sub.js (también armar.py):
     · lo que se puede pedir y cómo se llama (fotos, archivos, lo de la app, un dato);
     · las tres plantillas: el informe mensual (9 carpetas), el reporte semanal de horas hombre y el pedido con fecha;
     · el programa anual de la subcontrata (lo programado del mes, cumplido o no) y sus objetivos; la estancia corta;
     · los estados y los periodos (el mes, la semana, el día) en palabras;
     · la vista previa de la nomenclatura (el nombre de verdad lo pone el servidor, en orden: nadie renombra a mano);
     · el ZIP con las carpetas tal cual (sin comprimir: las fotos y los PDF ya vienen comprimidos).
   Servidor: sql/2026-11-26-informe.sql (funciones sst_inf_* y sst_est_*). */
var ISB_TIPO = { fotos:'Fotos', archivos:'Archivos', app:'De la app', dato:'Un dato' };
var ISB_FUENTES = [
  ['ats', 'ATS'], ['asis:charla', 'Charlas de inicio de jornada'], ['asis:difusion', 'Difusiones'], ['asis:capacitacion', 'Capacitaciones'],
  ['asis:induccion', 'Inducciones'], ['asis:simulacro', 'Simulacros de emergencia'], ['asis:reunion', 'Reuniones semanales'],
  ['asis:sensibilizacion', 'Sensibilizaciones'], ['asis:taller', 'Talleres'], ['asis:entrenamiento', 'Entrenamientos'], ['asis:retro', 'Retroalimentaciones'],
  ['asis:parada', 'Paradas de seguridad'], ['asis:otra', 'Otras reuniones'],
  ['herramientas', 'Revisión del mes de herramientas y equipos'], ['equipos', 'Inspecciones de equipos con QR'], ['inspecciones', 'Inspecciones de obra'],
  ['epp', 'Entregas de EPP'], ['reportes', 'Reportes de actos y condiciones'], ['incidentes', 'Incidentes y accidentes'], ['est', 'Estándares difundidos'],
  ['programa', 'Lo programado del mes (su programa anual)'], ['objetivos', 'Sus objetivos y metas']
];
var ISB_DATOS = [['hht', 'Horas hombre trabajadas'], ['trab', 'Trabajadores'], ['acc', 'Accidentes'], ['numero', 'Un número'], ['texto', 'Un texto']];
var ISB_FORMATOS = [['pdf', 'PDF'], ['excel', 'Excel'], ['word', 'Word'], ['foto', 'Foto']];
var ISB_EST = { sin_abrir:['Sin abrir', 'gris'], abierta:['Abierta', 'azul'], presentada:['Presentada', 'ojo'], observada:['Observada', 'mal'], aprobada:['Aprobada', 'ok'] };
var ISB_CADA = { mes:'Mensual', semana:'Semanal', una:'Con fecha' };
var ISB_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
var ISB_MOTIVO = {
  sin_sesion:'Tu sesión venció: vuelve a entrar.', no_existe:'Eso ya no está (o no es de tu empresa).', solo_jefes:'Eso lo hace un jefe o un gerente de la obra.',
  sin_plan:'Pedir informes a tus subcontratas viene con OBRASST Central (o un plan de arriba).', estructura:'Revisa las carpetas: cada una con su nombre y algo que pedir.',
  nombre:'Ponle un nombre (3 letras o más).', limite:'Revisa la fecha límite: desde hoy y hasta un año.', cierre:'Revisa el día de cierre.', para:'Elige al menos una subcontrata.',
  cada:'Lo mensual, lo semanal y lo que va con fecha no se cambian entre sí: arma uno nuevo.', tope:'Ya tienes muchos informes vivos: archiva los que ya no pides.',
  cerrada:'Ya se presentó: no se cambia.', item:'Eso no se puede subir ahí.', url:'El archivo no subió bien: vuelve a intentarlo.', conforme:'Esa carpeta ya está conforme: no se toca.',
  numero:'Escribe solo el número (con punto para los decimales).', que:'No se entendió qué cambiar.', nota:'Escribe qué falta o qué corregir (unas palabras).',
  carpeta:'Esa carpeta ya no está.', no_presentada:'Todavía no lo presentan (o ya se aprobó).', no_toca:'Ese periodo todavía no llega (o no te toca).',
  titulo:'Ponle un título.', fechas:'Revisa las fechas.', no_va:'Un boletín se ve en su mural: no se difunde como lectura.', sin_induccion:'Para difundirlo falta la inducción en el servidor.',
  datos:'No se entendió lo que se mandó.', sin_red:'Sin señal: inténtalo cuando tengas datos o wifi.', muy_grande:'El archivo pesa más de 25 MB.',
  corta:'Eso no se pide en una estancia corta.', dias:'Revisa los días: desde 1 y menos que el mes entero.', solo_mes:'La estancia corta va en el informe mensual.'
};
function isbMotivo(j, e){
  if(j && j.motivo && ISB_MOTIVO[j.motivo]) return ISB_MOTIVO[j.motivo];
  if(e === 'muy-grande') return ISB_MOTIVO.muy_grande;
  return (e === 0 || e === 'red' || e === 'sin_red' || (e && /fetch|network/i.test(String(e)))) ? ISB_MOTIVO.sin_red : 'No se pudo. Inténtalo otra vez.';
}
function isbFuenteN(f){ for(var i = 0; i < ISB_FUENTES.length; i++) if(ISB_FUENTES[i][0] === f) return ISB_FUENTES[i][1]; return 'De la app'; }
function isbDatoN(d){ for(var i = 0; i < ISB_DATOS.length; i++) if(ISB_DATOS[i][0] === d) return ISB_DATOS[i][1]; return 'Un dato'; }
function isbDos(n){ return (n < 10 ? '0' : '') + n; }
function isbIso(d){ return d.getUTCFullYear() + '-' + isbDos(d.getUTCMonth() + 1) + '-' + isbDos(d.getUTCDate()); }
/* el lunes de una semana ISO (el 4 de enero siempre cae en la semana 1) */
function isbLunes(y, w){ var d = new Date(Date.UTC(y, 0, 4)), dia = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() - dia + 1 + (w - 1) * 7); return d; }
/* el primer y el último día de un periodo: AAAA-MM · AAAA-Wss · AAAA-MM-DD */
function isbRango(p){
  p = String(p || '');
  var m = /^(\d{4})-(\d{2})$/.exec(p);
  if(m) return { d0:p + '-01', d1:p + '-' + isbDos(new Date(Date.UTC(+m[1], +m[2], 0)).getUTCDate()) };
  m = /^(\d{4})-W(\d{2})$/.exec(p);
  if(m){ var l = isbLunes(+m[1], +m[2]), dg = new Date(l.getTime() + 6 * 864e5); return { d0:isbIso(l), d1:isbIso(dg) }; }
  return { d0:p.slice(0, 10), d1:p.slice(0, 10) };
}
/* la semana ISO de una fecha (AAAA-Wss), como el servidor */
function isbSemanaDe(iso){
  var p = String(iso).split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])), dia = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dia);
  var y = d.getUTCFullYear(), w = Math.ceil(((d - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return y + '-W' + isbDos(w);
}
function isbFecha(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 && p[0] ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
/* el periodo en palabras (para el portal; la app pone las fechas con números, aparte del texto) */
function isbPeriodoTx(p){
  p = String(p || '');
  if(/^\d{4}-\d{2}$/.test(p)) return ISB_MESES[+p.slice(5, 7) - 1] + ' ' + p.slice(0, 4);
  if(/^\d{4}-W\d{2}$/.test(p)){ var r = isbRango(p); return 'semana del ' + isbFecha(r.d0).slice(0, 5) + ' al ' + isbFecha(r.d1); }
  return isbFecha(p);
}
/* el periodo anterior o el siguiente */
function isbPeriodoMas(p, n){
  p = String(p || '');
  if(/^\d{4}-\d{2}$/.test(p)){ var d = new Date(Date.UTC(+p.slice(0, 4), +p.slice(5, 7) - 1 + n, 1)); return d.getUTCFullYear() + '-' + isbDos(d.getUTCMonth() + 1); }
  if(/^\d{4}-W\d{2}$/.test(p)){ var r = isbRango(p), x = new Date(Date.parse(r.d0 + 'T00:00:00Z') + n * 7 * 864e5); return isbSemanaDe(isbIso(x)); }
  return p;
}
function isbPct(v){ return (v == null || v === '' || isNaN(+v)) ? '—' : (Math.round(+v * 10) / 10) + ' %'; }
function isbPctCl(v){ v = +v || 0; return v >= 100 ? 'ok' : (v >= 70 ? 'ojo' : 'mal'); }
function isbNum(v){ var n = +v; if(v == null || v === '' || isNaN(n)) return ''; return (Math.round(n * 10) / 10).toString(); }
/* los formatos que acepta un pedido de archivos: para el «accept» del selector y para revisar antes de subir */
var ISB_EXT = { pdf:['pdf'], excel:['xls', 'xlsx', 'csv', 'ods'], word:['doc', 'docx', 'odt'], foto:['jpg', 'jpeg', 'png', 'heic', 'webp'] };
function isbAccept(formatos){
  if(!formatos || !formatos.length) return '';
  var a = []; formatos.forEach(function(f){ (ISB_EXT[f] || []).forEach(function(x){ a.push('.' + x); }); if(f === 'foto') a.push('image/*'); });
  return a.join(',');
}
function isbFormatoOk(formatos, nombre){
  if(!formatos || !formatos.length) return true;
  var x = (String(nombre || '').match(/\.([A-Za-z0-9]{2,5})$/) || [])[1]; x = String(x || '').toLowerCase();
  return formatos.some(function(f){ return (ISB_EXT[f] || []).indexOf(x) > -1; });
}
function isbExt(nombre){ return String((String(nombre || '').match(/\.([A-Za-z0-9]{2,5})$/) || [])[1] || '').toLowerCase(); }
/* la vista previa del nombre (el servidor pone el de verdad, con la misma regla): las piezas que eligió la principal y
   el número al final; año, mes y día, los del archivo si cae en el periodo (si no, los del primer día del periodo) */
function isbNomPrev(nom, ruc, periodo, n, ext, fecha){
  var r = isbRango(periodo || ''), f = (fecha && fecha >= r.d0 && fecha <= r.d1) ? fecha : r.d0;
  var num = n < 10 ? '0' + n : String(n), x = ext ? '.' + String(ext).toLowerCase() : '';
  if(!nom) return num + '-nombre-del-archivo' + x;
  var s = nom.s === '_' ? '_' : '-', p = [];
  if(nom.p) p.push(String(nom.p).replace(/[^A-Za-z0-9]/g, '').slice(0, 12));
  if(nom.r) p.push(ruc ? String(ruc).replace(/[^0-9A-Za-z]/g, '') : 'RUC');
  if(nom.a) p.push(String(f).slice(0, 4));
  if(nom.m) p.push(String(f).slice(5, 7));
  if(nom.d) p.push(String(f).slice(8, 10));
  p.push(num);
  return p.filter(Boolean).join(s) + x;
}
/* una llave nueva para una carpeta o un pedido: no cambia aunque se ordene (los archivos van atados a ella) */
function isbLlave(pre){ var s = pre || 'k'; for(var i = 0; i < 7; i++) s += 'abcdefghijkmnpqrstuvwxyz23456789'.charAt(Math.floor(Math.random() * 32)); return s; }
/* LAS PLANTILLAS: el informe mensual (8 carpetas), el reporte semanal de horas hombre y el pedido con fecha */
var ISB_PLANTILLAS = {
  mensual:{ nombre:'Informe mensual de SST', cada:'mes', modo:'cierre', cierre:0, suma:true, carpetas:[
    /* 19/10/2026 · lote 19 · el registro fotográfico por tema (Marcelo: «charlas, uso de EPPs, sistema de emergencia, servicios
       de bienestar… para central, igual decide eso para las subcontratas»): la principal cambia los temas al armar su pedido */
    { k:'panel', n:'Registro fotográfico', items:[
      { k:'f-charlas', n:'Charlas y capacitaciones', tipo:'fotos', min:2, desc:true, nom:{ p:'RF-CH', r:true, a:true, m:true, d:false, s:'_' }, ayuda:'Cada una con su descripción: dónde es y qué se ve.' },
      { k:'f-epp', n:'Uso de EPP', tipo:'fotos', min:2, desc:true, nom:{ p:'RF-EPP', r:true, a:true, m:true, d:false, s:'_' }, ayuda:'La cuadrilla con su EPP completo, o una entrega de EPP.' },
      { k:'f-emergencia', n:'Sistema de emergencia', tipo:'fotos', min:2, desc:true, nom:{ p:'RF-EM', r:true, a:true, m:true, d:false, s:'_' }, ayuda:'Extintores, botiquín, camilla, rutas de evacuación y punto de reunión.' },
      { k:'f-bienestar', n:'Servicios de bienestar', tipo:'fotos', min:1, desc:true, nom:{ p:'RF-BI', r:true, a:true, m:true, d:false, s:'_' }, ayuda:'Comedor, servicios higiénicos, vestuarios y agua para beber.' },
      { k:'fotos', n:'Trabajos del mes', tipo:'fotos', min:4, desc:true, nom:{ p:'PF', r:true, a:true, m:true, d:false, s:'_' }, ayuda:'Los frentes de trabajo: orden y limpieza, señalización y los trabajos de alto riesgo.' }] },
    { k:'cats', n:'ATS', items:[{ k:'ats', n:'ATS del mes', tipo:'app', fuente:'ats', min:20, papel:true, ayuda:'Los de la app entran solos; los de papel, escaneados.' }] },
    { k:'asistencia', n:'Registro de asistencia', items:[
      { k:'charlas', n:'Charlas de inicio de jornada', tipo:'app', fuente:'asis:charla', min:20, papel:true },
      { k:'difusiones', n:'Difusiones', tipo:'app', fuente:'asis:difusion', min:2, papel:true },
      { k:'capacitaciones', n:'Capacitaciones', tipo:'app', fuente:'asis:capacitacion', min:1, papel:true }] },
    { k:'cinsp', n:'Inspecciones', items:[
      { k:'herramientas', n:'Revisión del mes de herramientas y equipos', tipo:'app', fuente:'herramientas', min:0, papel:true, ayuda:'Se mide contra todos sus equipos con QR.' },
      { k:'equipos', n:'Inspecciones de equipos con QR', tipo:'app', fuente:'equipos', min:4, papel:true },
      { k:'obra', n:'Inspecciones de obra', tipo:'app', fuente:'inspecciones', min:4, papel:true }] },
    { k:'cepp', n:'Equipos de protección personal', items:[{ k:'entregas', n:'Entregas de EPP', tipo:'app', fuente:'epp', min:1, papel:true }] },
    { k:'creportes', n:'Reportes e incidentes', items:[
      { k:'actos', n:'Reportes de actos y condiciones', tipo:'app', fuente:'reportes', min:4, papel:true },
      { k:'incidentes', n:'Incidentes y accidentes', tipo:'app', fuente:'incidentes', min:0, papel:true }] },
    { k:'indicadores', n:'Indicadores', items:[
      { k:'hht', n:'Horas hombre trabajadas', tipo:'dato', dato:'hht' }, { k:'trab', n:'Trabajadores', tipo:'dato', dato:'trab' },
      { k:'acc', n:'Accidentes del mes', tipo:'dato', dato:'acc' }] },
    { k:'documentos', n:'Documentos', items:[
      { k:'programa', n:'Programa mensual de SST', tipo:'archivos', min:1, formatos:['pdf', 'excel'], corta:false },
      { k:'estandares', n:'Estándares difundidos', tipo:'app', fuente:'est', min:0, papel:true }] },
    { k:'canual', n:'Programa anual y objetivos', items:[
      { k:'programado', n:'Lo programado del mes', tipo:'app', fuente:'programa', min:0, papel:true, corta:false,
        ayuda:'Sale solo de su programa anual: cada actividad del mes, cumplida o pendiente. Si la hicieron sin registrarla, suben su evidencia.' },
      { k:'objetivos', n:'Objetivos y metas del año', tipo:'app', fuente:'objetivos', min:1, papel:true, corta:false, ayuda:'Con el avance de su programa.' }] }] },
  semanal:{ nombre:'Reporte semanal de horas hombre', cada:'semana', modo:'cierre', cierre:1, suma:true, carpetas:[
    { k:'hh', n:'Horas hombre', items:[{ k:'hht', n:'Horas hombre de la semana', tipo:'dato', dato:'hht', ayuda:'Si llevan el tareo o el reporte semanal en OBRASST, ya salen solas.' },
                                       { k:'trab', n:'Trabajadores en la semana', tipo:'dato', dato:'numero' }] }] },
  fecha:{ nombre:'', cada:'una', modo:'cierre', cierre:0, suma:true, carpetas:[
    { k:'evidencias', n:'Evidencias', items:[{ k:'evidencias', n:'Evidencias de cumplimiento', tipo:'archivos', min:1, formatos:['pdf', 'foto'] }] }] }
};
function isbPlantilla(k){ var t = ISB_PLANTILLAS[k] || ISB_PLANTILLAS.mensual; return JSON.parse(JSON.stringify(t)); }
/* lo que pide un pedido, en una línea */
function isbItemTx(it){
  if(!it) return '';
  var m = (it.min == null ? 1 : +it.min);
  if(it.tipo === 'fotos') return (m ? m + (m === 1 ? ' foto' : ' fotos') + ' como mínimo' : 'Fotos') + (it.desc ? ', con su descripción' : '');
  if(it.tipo === 'archivos') return (m ? m + (m === 1 ? ' archivo' : ' archivos') + ' como mínimo' : 'Archivos') +
    (it.formatos && it.formatos.length ? ' (' + it.formatos.map(function(f){ return { pdf:'PDF', excel:'Excel', word:'Word', foto:'foto' }[f] || f; }).join(', ') + ')' : '');
  if(it.tipo === 'app') return isbFuenteN(it.fuente) + (it.fuente === 'herramientas' && !m ? ': todos sus equipos' : (it.fuente === 'programa' && !m ? ': todo lo programado' : (m ? ': ' + m + ' como mínimo' : ''))) +
    (it.papel && it.fuente !== 'programa' ? ' · también en papel' : '');
  return isbDatoN(it.dato);
}
/* ══ EL ZIP ══ (método «guardado»: sin comprimir. Cada archivo con su CRC-32 y su nombre en UTF-8) */
var _ISB_CRC = null;
function isbCrc32(u8){
  if(!_ISB_CRC){ _ISB_CRC = []; for(var n = 0; n < 256; n++){ var c = n; for(var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); _ISB_CRC[n] = c >>> 0; } }
  var crc = 0xFFFFFFFF; for(var i = 0; i < u8.length; i++) crc = _ISB_CRC[(crc ^ u8[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function isbUtf8(s){ return (typeof TextEncoder !== 'undefined') ? new TextEncoder().encode(s) : new Uint8Array(unescape(encodeURIComponent(s)).split('').map(function(c){ return c.charCodeAt(0); })); }
/* entradas: [{ nombre:'carpeta/archivo.jpg', datos:Uint8Array | string }] → Blob (application/zip) */
function isbZip(entradas){
  var partes = [], central = [], off = 0, d = new Date();
  var hora = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2), dia = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  function u16(v){ return [v & 255, (v >>> 8) & 255]; }
  function u32(v){ return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
  var usados = {};
  entradas.forEach(function(e){
    var nom = String(e.nombre || 'archivo').replace(/\\/g, '/').replace(/^\/+/, '');
    var base = nom, k = 2; while(usados[nom.toLowerCase()]){ nom = base.replace(/(\.[^.\/]+)?$/, ' (' + (k++) + ')$1'); } usados[nom.toLowerCase()] = 1;
    var n8 = isbUtf8(nom), dat = typeof e.datos === 'string' ? isbUtf8(e.datos) : (e.datos instanceof Uint8Array ? e.datos : new Uint8Array(e.datos || 0));
    var crc = isbCrc32(dat);
    var cab = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(hora), u16(dia), u32(crc), u32(dat.length), u32(dat.length), u16(n8.length), u16(0));
    partes.push(new Uint8Array(cab), n8, dat);
    central.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(hora), u16(dia), u32(crc), u32(dat.length), u32(dat.length),
                                          u16(n8.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), n8);
    off += cab.length + n8.length + dat.length;
  });
  var tam = 0; central.forEach(function(c){ tam += c.length; });
  var fin = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(entradas.length), u16(entradas.length), u32(tam), u32(off), u16(0)));
  return new Blob(partes.concat(central, [fin]), { type:'application/zip' });
}
/* un nombre que sirve de carpeta o de archivo en cualquier sistema */
function isbCarpetaN(s){ return String(s || '').replace(/[\\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Carpeta'; }
/* <<< INFSUB-BASE-FIN >>> */

var ISW = { caja:null, cual:'', tab:'', pant:'lista', p:{}, hist:[], ed:null, sube:0, zip:false, estTipo:'estandar', estArch:null };
var ISW_DETALLE = { carpetas:'Entre 1 y 20 carpetas.', carpeta_nombre:'Cada carpeta necesita su nombre.', carpeta_vacia:'Cada carpeta con algo que pedir (hasta 12).',
  muchos:'Hasta 80 pedidos en total.', pedido_nombre:'Cada pedido necesita su nombre.', tipo:'Revisa el tipo de cada pedido.', fuente:'Elige de qué parte de la app sale.',
  dato:'Elige qué dato es.', estructura:'Revisa las carpetas.' };
function iswMotivo(j, e){
  if(j && j.motivo === 'estructura' && j.detalle && ISW_DETALLE[j.detalle]) return ISW_DETALLE[j.detalle];
  return isbMotivo(j, e);
}
function iswIni(){ return (typeof CADP !== 'undefined' && CADP.ini && CADP.ini.ok && YO.obra && CADP.de === String(YO.obra.id)) ? CADP.ini : null; }
function iswGrado(){ var i = iswIni(); return (i && i.grado) || 0; }
function iswEmp(){ return YO.obra ? YO.obra.id : null; }
function iswPill(t, cl){ return '<span class="pill ' + (cl || 'gris') + '">' + esc(t) + '</span>'; }
function iswEst(e){ var x = ISB_EST[e] || ISB_EST.sin_abrir; return iswPill(x[0], x[1]); }
function iswVacio(t, s){ return '<div class="vacio"><b>' + esc(t) + '</b>' + (s ? esc(s) : '') + '</div>'; }
function iswBarra(v){ var n = Math.max(0, Math.min(100, Math.round(+v || 0))); return '<span class="isw-barra ' + isbPctCl(v) + '" title="' + n + ' de 100"><i style="width:' + n + '%"></i></span><b class="isw-pct">' + esc(isbPct(v)) + '</b>'; }
function iswHoy(){ var d = new Date(); return d.getFullYear() + '-' + isbDos(d.getMonth() + 1) + '-' + isbDos(d.getDate()); }
function iswHora(t){ var d = new Date(t); return isNaN(d) ? '' : isbFecha(d.getFullYear() + '-' + isbDos(d.getMonth() + 1) + '-' + isbDos(d.getDate())) + ' ' + isbDos(d.getHours()) + ':' + isbDos(d.getMinutes()); }
function iswMsg(id, t, mal){ var m = $(id); if(m){ m.textContent = t || ''; m.className = 'msg' + (mal ? ' mal' : ' ok'); } }
function _iswCss(){
  if($('isw-css')) return;
  var s = document.createElement('style'); s.id = 'isw-css';
  s.textContent = '.isw-seg{flex-wrap:wrap;max-width:100%}.isw-volver{margin:0 0 12px}.isw-sub{display:block;color:var(--gris);font-size:12px;font-weight:400;margin-top:2px}' +
    '.isw-barra{display:inline-block;vertical-align:middle;width:84px;height:8px;border-radius:99px;background:var(--fondo);overflow:hidden;margin-right:8px}' +
    '.isw-barra i{display:block;height:100%;border-radius:99px;background:var(--ok)}.isw-barra.ojo i{background:#C98A00}.isw-barra.mal i{background:var(--mal)}.isw-pct{font-variant-numeric:tabular-nums;white-space:nowrap}' +
    '.isw-acc{white-space:nowrap;text-align:right}.isw-acc .bt{margin-left:4px}.isw-nuevos{display:flex;gap:6px;flex-wrap:wrap}.isw-t td{vertical-align:top}.isw-pend td{background:var(--fondo);font-size:12.5px}' +
    '.isw-cuerpo{padding:14px 18px}.isw-fila{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin:0 0 10px}.isw-fila .campo{margin:0;min-width:150px;flex:1}' +
    '.isw-fila label.chk{display:flex;gap:6px;align-items:center;font-size:13.5px}.isw-op{display:flex;flex-direction:column;gap:6px;margin:0 0 12px}.isw-op label{display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:1.35}' +
    /* 15/10: el input de la hoja es width:100%: sin esto el círculo de «Para quiénes» se estiraba y empujaba su letra a la derecha */
    '.isw-op label input,.isw-emp-l label input{width:17px;height:17px;flex:0 0 auto;padding:0;margin:2px 0 0}' +
    '.isw-carp{border:1px solid var(--raya);border-radius:10px;margin:0 0 12px;background:var(--panel)}.isw-carp-cab{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--raya);background:var(--fondo);border-radius:10px 10px 0 0}' +
    '.isw-carp-cab input{flex:1;font-weight:600}.isw-it{padding:10px 12px;border-top:1px dashed var(--raya)}.isw-it:first-of-type{border-top:0}.isw-it-cab{display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
    '.isw-it-cab input[data-f="n"]{flex:1;min-width:200px}.isw-it-op{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:8px;font-size:13px}.isw-it-op input[type=number]{width:70px}' +
    '.isw-prev{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;background:var(--fondo);padding:3px 7px;border-radius:6px}.isw-mini{padding:4px 8px;font-size:12px;border-radius:6px}' +
    '.isw-ent-cab{display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:14px 18px}.isw-ent-cab h2{font-size:17px;margin:0}.isw-ent-cab .isw-big{font-size:30px;font-weight:700;font-variant-numeric:tabular-nums}' +
    '.isw-ent-acc{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}.isw-item{padding:12px 18px;border-top:1px solid var(--raya)}.isw-item-cab{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}' +
    '.isw-item-cab b{font-size:14px}.isw-item-cab .isw-n{margin-left:auto;color:var(--gris);font-size:12.5px}.isw-arch{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:10px 0 6px}' +
    '.isw-a{border:1px solid var(--raya);border-radius:9px;overflow:hidden;background:var(--panel);font-size:12px}.isw-a .isw-img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:var(--fondo)}' +
    '.isw-a .isw-doc{display:flex;align-items:center;justify-content:center;aspect-ratio:4/3;background:var(--fondo);font-size:26px;text-decoration:none}' +
    '.isw-a-tx{padding:6px 8px}.isw-a-tx b{display:block;word-break:break-all;font-size:11.5px;font-family:ui-monospace,Menlo,monospace}.isw-a-tx span{display:block;color:var(--gris);margin-top:2px}' +
    '.isw-a-acc{display:flex;gap:4px;padding:0 6px 6px}.isw-a-acc button{flex:1;padding:3px 0;font-size:12px;border-radius:6px;border:1px solid var(--raya2);background:var(--panel);cursor:pointer}' +
    '.isw-auto{list-style:none;margin:8px 0 0;padding:0;font-size:13px}.isw-auto li{padding:4px 0;border-top:1px solid var(--raya)}.isw-auto li:first-child{border-top:0}.isw-auto small{color:var(--gris)}' +
    '.isw-dato{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}.isw-dato input{width:160px}.isw-obs{background:var(--mal-f);color:var(--mal);border-radius:8px;padding:8px 10px;margin:8px 0 0;font-size:13px}' +
    '.isw-conf{background:var(--ok-f);color:var(--ok);border-radius:8px;padding:6px 10px;margin:8px 0 0;font-size:13px}.isw-ayuda{color:var(--gris);font-size:12.5px;margin:4px 0 0}' +
    '.isw-hh td,.isw-hh th{text-align:right;font-variant-numeric:tabular-nums}.isw-hh td:first-child,.isw-hh th:first-child{text-align:left}.isw-curva{display:block;width:100%;max-width:640px;height:auto}' +
    '.isw-hist{list-style:none;padding:0;margin:0;font-size:13px}.isw-hist li{padding:6px 0;border-top:1px solid var(--raya)}.isw-hist li:first-child{border-top:0}' +
    '.isw-emp-l{display:flex;flex-wrap:wrap;gap:6px 14px;margin:6px 0 0 24px}.isw-emp-l label{font-size:13.5px;display:flex;gap:6px;align-items:center}' +
    '.isw-sello{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--gris)}.isw-cifras{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px}';
  document.head.appendChild(s);
}

/* ══ la puerta ══════════════════════════════════════════════════════════════════════════════════════════════════ */
function iswPintar(cual, caja){
  _iswCss();
  if(ISW.cual !== cual){ ISW.pant = 'lista'; ISW.p = {}; ISW.hist = []; }
  ISW.caja = caja; ISW.cual = cual;
  if(!iswEmp()){ caja.innerHTML = iswVacio('Elige una obra', ''); return; }
  if(cual === 'est') return iswEst2(caja);
  iswRender();
}
function iswRender(){
  var c = ISW.caja; if(!c || !c.isConnected) return;
  if(typeof _cadAcc === 'function') _cadAcc('');
  var F = { lista:iswLista, editor:iswEditor, tablero:iswTablero, entrega:iswEntrega, anual:iswAnual }[ISW.pant] || iswLista;
  F(c);
  try{ window.scrollTo(0, 0); }catch(e){}
}
function iswIr(pant, p){ ISW.hist.push({ pant:ISW.pant, p:ISW.p }); ISW.pant = pant; ISW.p = p || {}; iswRender(); }
function iswVolver(){ var h = ISW.hist.pop() || { pant:'lista', p:{} }; ISW.pant = h.pant; ISW.p = h.p; iswRender(); }
function iswVolverBt(){ return '<div class="isw-volver"><button type="button" class="bt sec chico" id="isw-volver">← Volver</button></div>'; }
function iswAtarVolver(c){ var b = c.querySelector('#isw-volver'); if(b) b.onclick = function(){ if(ISW.ed && ISW.ed.cambio && ISW.pant === 'editor'){ confirmar('¿Sales sin guardar?', 'Lo que cambiaste en este informe se pierde.', { si:'Salir', mal:true }).then(function(s){ if(s){ ISW.ed = null; iswVolver(); } }); return; } iswVolver(); }; }
function iswPedir(c, fn, args, pinta){
  var pant = ISW.pant, cual = ISW.cual;
  c.innerHTML = '<div class="vacio">Cargando…</div>';
  return sbRpc(fn, args).then(function(j){
    if(!c.isConnected || ISW.pant !== pant || ISW.cual !== cual) return;
    if(!j || !j.ok){ c.innerHTML = (ISW.hist.length ? iswVolverBt() : '') + iswVacio('No se pudo cargar', iswMotivo(j)); iswAtarVolver(c); return; }
    pinta(j);
  }, function(e){ if(c.isConnected){ c.innerHTML = (ISW.hist.length ? iswVolverBt() : '') + iswVacio('No se pudo cargar', iswMotivo(null, e)); iswAtarVolver(c); } });
}

/* ══ 1 · LA LISTA: lo que pido y lo que me piden ═══════════════════════════════════════════════════════════════════ */
function iswLista(c){
  iswPedir(c, 'sst_inf_lista', { p:{ emp:iswEmp() } }, function(j){
    ISW.lista = j;
    var ini = iswIni(), soySub = ((ini && ini.arriba) || []).some(function(l){ return l.estado === 'activa'; });
    var pido = !!(j.puede_pedir || (j.arriba || []).length), piden = (j.abajo || []).length > 0 || soySub;
    var t = ISW.tab || (piden && !pido ? 'piden' : 'pido');
    if(t === 'piden' && !piden && pido) t = 'pido';
    ISW.tab = t;
    var h = '';
    if(pido && piden) h += '<div class="seg isw-seg" role="tablist" aria-label="Qué ver"><button type="button" role="tab" data-isw-tab="pido" aria-selected="' + (t === 'pido') + '" class="' + (t === 'pido' ? 'on' : '') + '">Lo que pido</button>' +
      '<button type="button" role="tab" data-isw-tab="piden" aria-selected="' + (t === 'piden') + '" class="' + (t === 'piden' ? 'on' : '') + '">Lo que me piden</button></div>';
    h += '<div id="isw-l"></div>';
    c.innerHTML = h;
    Array.prototype.forEach.call(c.querySelectorAll('[data-isw-tab]'), function(b){ b.onclick = function(){ ISW.tab = b.getAttribute('data-isw-tab'); iswRender(); }; });
    var cc = $('isw-l');
    if(t === 'piden' && piden) iswPiden(cc, j); else iswPido(cc, j);
  });
}
function iswPido(c, j){
  var L = j.arriba || [], m = !!j.manda;
  if(!j.puede_pedir && !L.length){
    c.innerHTML = '<div class="tarj"><div class="tarj-cuerpo isw-cuerpo"><h2>Pedir informes a tus subcontratas</h2><p>Con OBRASST Central (o un plan de arriba) armas las carpetas y lo que va en cada una, se lo publicas a tus subcontratas y ves el avance de cada una, mes a mes.</p></div></div>';
    return;
  }
  var h = '<div class="tarj"><div class="tarj-cab"><div><h2>Lo que pides a tus subcontratas</h2><p class="sub">Arma las carpetas y lo que va en cada una; publícalo y les sale a sus supervisores y jefes, en la app y en la web. Lo de la app entra solo.</p></div>' +
    (m && j.puede_pedir ? '<div class="isw-nuevos"><button type="button" class="bt chico" data-nuevo="mensual">+ Informe mensual</button><button type="button" class="bt sec chico" data-nuevo="semanal">+ Reporte semanal</button>' +
      '<button type="button" class="bt sec chico" data-nuevo="fecha">+ Pedido con fecha</button><button type="button" class="bt sec chico" id="isw-copiar">Copiar de otra obra</button></div>' : '') + '</div>';
  if(!L.length) h += iswVacio('Todavía no pides nada', m ? 'Empieza con el informe mensual: trae 8 carpetas listas (panel fotográfico, ATS, asistencia, inspecciones, EPP, reportes, indicadores y documentos) y lo cambias a tu gusto.' : 'Lo arma un jefe o un gerente de la obra.');
  else {
    h += '<div class="tabla-caja"><table class="isw-t"><thead><tr><th>Informe</th><th>Cada cuánto</th><th>Este periodo</th><th>Presentadas</th><th>Promedio</th><th>Estado</th><th></th></tr></thead><tbody>' + L.map(function(x){
      var pub = x.estado === 'publicado';
      return '<tr><td><b>' + esc(x.nombre) + '</b>' + (x.version > 1 ? '<span class="isw-sub">Versión ' + x.version + '</span>' : '') + '</td>' +
        '<td>' + esc(ISB_CADA[x.cada] || '') + (x.cada === 'una' && x.limite ? '<span class="isw-sub">hasta el ' + esc(isbFecha(x.limite)) + '</span>' : '') + '</td>' +
        '<td>' + (pub ? esc(isbPeriodoTx(x.periodo)) + (x.cierre ? '<span class="isw-sub">cierra el ' + esc(isbFecha(x.cierre)) + '</span>' : '') : '—') + '</td>' +
        '<td>' + (pub ? (x.presentadas || 0) + (x.aprobadas || 0) + ' de ' + (x.empresas || 0) + ((x.observadas || 0) ? '<span class="isw-sub">' + x.observadas + (x.observadas === 1 ? ' observada' : ' observadas') + '</span>' : '') +
          ((x.tarde || 0) ? '<span class="isw-sub">' + x.tarde + ' fuera de plazo</span>' : '') : '—') + '</td>' +
        '<td>' + (x.promedio != null ? iswBarra(x.promedio) : '—') + '</td>' +
        '<td>' + (pub ? iswPill('Publicado', 'ok') : iswPill('Borrador', 'gris')) + '</td>' +
        '<td class="isw-acc">' + (pub ? '<button type="button" class="bt chico" data-tab="' + esc(x.id) + '">Tablero</button>' : '') +
          (m ? '<button type="button" class="bt sec chico" data-ed="' + esc(x.id) + '">Editar</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  }
  h += '</div>';
  c.innerHTML = h;
  Array.prototype.forEach.call(c.querySelectorAll('[data-nuevo]'), function(b){ b.onclick = function(){ iswNuevo(b.getAttribute('data-nuevo')); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-tab]'), function(b){ b.onclick = function(){ iswIr('tablero', { inf:b.getAttribute('data-tab') }); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-ed]'), function(b){ b.onclick = function(){ iswEditar(b.getAttribute('data-ed')); }; });
  var cp = $('isw-copiar'); if(cp) cp.onclick = iswCopiar;
}
function iswPiden(c, j){
  var L = j.abajo || [];
  if(!L.length){ c.innerHTML = '<div class="tarj"><div class="tarj-cuerpo isw-cuerpo"><h2>Lo que te piden</h2><p>Todavía no te piden nada. Cuando la principal publique su informe (las carpetas y lo que va en cada una), te sale aquí y en la app, con lo de la app ya puesto.</p></div></div>'; return; }
  var h = '<div class="tarj"><div class="tarj-cab"><div><h2>Lo que te piden</h2><p class="sub">Lo que te pide la principal (o quien te supervisa). Lo de la app entra solo; las fotos y los archivos los subes aquí o desde el celular, y lo presentas hasta el cierre.</p></div></div>' +
    '<div class="tabla-caja"><table class="isw-t"><thead><tr><th>Informe</th><th>De</th><th>Periodo</th><th>Cierre</th><th>Avance</th><th>Estado</th><th></th></tr></thead><tbody>';
  L.forEach(function(x){
    var ven = x.cierre && x.cierre < iswHoy() && (x.estado === 'abierta' || x.estado === 'observada');
    h += '<tr><td><b>' + esc(x.nombre) + '</b><span class="isw-sub">' + esc(ISB_CADA[x.cada] || '') + (x.modo === 'auto' ? ' · automático' : '') + '</span></td><td>' + esc(x.arriba_nombre || '') + '</td>' +
      '<td>' + esc(isbPeriodoTx(x.periodo)) + '</td><td>' + esc(isbFecha(x.cierre)) + (ven ? '<span class="isw-sub" style="color:var(--mal)">venció</span>' : '') + '</td>' +
      '<td>' + iswBarra(x.cumple) + ((x.faltan || 0) ? '<span class="isw-sub">' + x.faltan + (x.faltan === 1 ? ' pedido por completar' : ' pedidos por completar') + '</span>' : '') + '</td>' +
      '<td>' + iswEst(x.estado) + '</td><td class="isw-acc"><button type="button" class="bt chico" data-ent="' + esc(x.entrega) + '">' + (x.estado === 'abierta' || x.estado === 'observada' ? 'Llenar' : 'Ver') + '</button></td></tr>';
    (x.pendientes || []).forEach(function(p){
      h += '<tr class="isw-pend"><td colspan="2">↳ Pendiente de antes</td><td>' + esc(isbPeriodoTx(p.periodo)) + '</td><td></td><td>' + (p.cumple != null ? esc(isbPct(p.cumple)) : '') + '</td><td>' + iswEst(p.estado) + '</td>' +
        '<td class="isw-acc"><button type="button" class="bt sec chico" data-per="' + esc(x.inf) + '|' + esc(x.enlace) + '|' + esc(p.periodo) + '">Abrir</button></td></tr>';
    });
  });
  h += '</tbody></table></div></div>';
  c.innerHTML = h;
  Array.prototype.forEach.call(c.querySelectorAll('[data-ent]'), function(b){ b.onclick = function(){ iswIr('entrega', { entrega:b.getAttribute('data-ent') }); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-per]'), function(b){ b.onclick = function(){ var p = b.getAttribute('data-per').split('|'); iswIr('entrega', { inf:p[0], enlace:p[1], periodo:p[2] }); }; });
}

/* ══ 2 · ARMAR: con una plantilla o desde otra obra; las carpetas y lo que va en cada una ══════════════════════════ */
function iswNuevo(k, desde){
  var t = isbPlantilla(k);
  ISW.ed = { id:null, nombre:t.nombre, cada:t.cada, modo:t.modo, cierre:t.cierre, suma:t.suma, limite:t.cada === 'una' ? '' : null, para:'todas', enlaces:[],
             carpetas:desde ? JSON.parse(JSON.stringify(desde.carpetas || [])) : t.carpetas, estado:'borrador', version:1, empresas:null, cambio:false };
  if(desde){ ISW.ed.nombre = desde.nombre || t.nombre; ISW.ed.cada = desde.cada || t.cada; if(ISW.ed.cada === 'una') ISW.ed.limite = ''; }
  iswIr('editor', {});
  iswEmpresas();
}
function iswEditar(id){
  ISW.caja.innerHTML = '<div class="vacio">Cargando…</div>';
  sbRpc('sst_inf_uno', { p:{ id:id } }).then(function(j){
    if(!j || !j.ok){ toast(iswMotivo(j)); iswRender(); return; }
    var i = j.inf;
    ISW.ed = { id:i.id, nombre:i.nombre, cada:i.cada, modo:i.modo, cierre:i.cierre, suma:i.suma, limite:i.limite || '', para:i.para, enlaces:(i.enlaces || []).slice(),
               carpetas:JSON.parse(JSON.stringify((i.estructura || {}).carpetas || [])), estado:i.estado, version:i.version, empresas:j.empresas || [], cambio:false, manda:j.manda };
    iswIr('editor', {});
  }, function(e){ toast(iswMotivo(null, e)); iswRender(); });
}
function iswEmpresas(){
  var i = iswIni(), E = ((i && i.abajo) || []).filter(function(l){ return l.clase === 'subcontrata' && (l.estado === 'activa' || l.estado === 'invitada'); })
    .map(function(l){ return { enlace:l.id, nombre:cadCorto(l.nombre || l.razon || ''), estado:l.estado }; });
  if(ISW.ed) ISW.ed.empresas = E;
}
function iswCopiar(){
  sbRpc('sst_inf_uno', { p:{ emp:iswEmp() } }).then(function(j){
    var L = (j && j.ok && j.otras) || [];
    if(!L.length){ toast('En tus otras obras todavía no hay informes para copiar.'); return; }
    abrirHoja('Copiar de otra obra', 'Se copia cómo está armado (las carpetas y lo que va en cada una); lo cambias antes de publicar.',
      '<div class="tabla-caja"><table><tbody>' + L.map(function(x, k){ return '<tr><td><b>' + esc(x.nombre) + '</b><span class="isw-sub">' + esc(x.obra) + ' · ' + esc(ISB_CADA[x.cada] || '') + ' · ' +
        ((x.estructura || {}).carpetas || []).length + ' carpetas</span></td><td class="isw-acc"><button type="button" class="bt chico" data-cp="' + k + '">Copiar</button></td></tr>'; }).join('') + '</tbody></table></div>');
    Array.prototype.forEach.call(document.querySelectorAll('[data-cp]'), function(b){ b.onclick = function(){
      var x = L[+b.getAttribute('data-cp')]; cerrarHoja();
      iswNuevo(x.cada === 'semana' ? 'semanal' : (x.cada === 'una' ? 'fecha' : 'mensual'), { nombre:x.nombre, cada:x.cada, carpetas:(x.estructura || {}).carpetas });
    }; });
  }, function(e){ toast(iswMotivo(null, e)); });
}
var ISW_DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
function iswEditor(c){
  var E = ISW.ed; if(!E){ iswVolver(); return; }
  if(!E.empresas) iswEmpresas();
  var ruc = null;   /* la vista previa dice «RUC»: va el de cada subcontrata */
  var h = iswVolverBt() + '<div class="tarj"><div class="tarj-cab"><div><h2>' + (E.id ? 'Editar el informe' : 'Nuevo: ' + esc(ISB_CADA[E.cada] || '').toLowerCase()) + '</h2>' +
    '<p class="sub">' + (E.estado === 'publicado' ? 'Publicado (versión ' + E.version + '): lo que cambies les llega a las entregas que siguen abiertas; lo ya presentado queda como se entregó.' : 'Borrador: nadie lo ve hasta que lo publiques.') + '</p></div>' +
    (E.estado === 'publicado' ? iswPill('Publicado', 'ok') : iswPill('Borrador', 'gris')) + '</div><div class="tarj-cuerpo isw-cuerpo">' +
    '<div class="isw-fila"><div class="campo"><label for="isw-nom">Nombre</label><input id="isw-nom" maxlength="100" value="' + esc(E.nombre || '') + '" placeholder="Informe mensual de SST"></div>' +
    (E.cada === 'una' ? '<div class="campo" style="max-width:200px"><label for="isw-lim">Fecha límite</label><input id="isw-lim" type="date" value="' + esc(E.limite || '') + '" min="' + iswHoy() + '"></div>' : '') +
    (E.cada === 'mes' ? '<div class="campo" style="max-width:320px"><label for="isw-cie">Cierre</label><select id="isw-cie"><option value="0">El último día del mes</option>' +
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(n){ return '<option value="' + n + '"' + (+E.cierre === n ? ' selected' : '') + '>Hasta el día ' + n + ' del mes siguiente</option>'; }).join('') + '</select></div>' : '') +
    (E.cada === 'semana' ? '<div class="campo" style="max-width:320px"><label for="isw-cie">Cierre</label><select id="isw-cie"><option value="0">El domingo</option>' +
      ISW_DIAS.map(function(d, k){ return '<option value="' + (k + 1) + '"' + (+E.cierre === k + 1 ? ' selected' : '') + '>Hasta el ' + d + ' siguiente</option>'; }).join('') + '</select></div>' : '') + '</div>' +
    '<div class="isw-op" role="radiogroup" aria-label="Cómo se entrega"><b>Cómo se entrega</b>' +
    '<label><input type="radio" name="isw-modo" value="cierre"' + (E.modo !== 'auto' ? ' checked' : '') + '> <span><b>Me lo presentan</b> hasta el cierre. Mientras, ves su avance; presentado, todo el contenido.</span></label>' +
    '<label><input type="radio" name="isw-modo" value="auto"' + (E.modo === 'auto' ? ' checked' : '') + '> <span><b>Automático</b>: lo ves en vivo y, al cierre, se presenta solo con lo que haya.</span></label></div>' +
    '<div class="isw-op"><label class="chk"><input type="checkbox" id="isw-suma"' + (E.suma !== false ? ' checked' : '') + '> <span>' +
      (E.cada === 'mes' ? 'Sumar los reportes semanales y los pedidos con fecha del mes (salen como una carpeta más: «Lo que pidió la principal este mes»)' : 'Que cuente en el informe mensual') + '</span></label></div>' +
    '<div class="isw-op" role="radiogroup" aria-label="Para quiénes"><b>Para quiénes</b>' +
    '<label><input type="radio" name="isw-para" value="todas"' + (E.para !== 'algunas' ? ' checked' : '') + '> <span>Todas mis subcontratas (también las que entren después)</span></label>' +
    '<label><input type="radio" name="isw-para" value="algunas"' + (E.para === 'algunas' ? ' checked' : '') + '> <span>Algunas</span></label>' +
    '<div class="isw-emp-l" id="isw-emps"' + (E.para === 'algunas' ? '' : ' hidden') + '>' + ((E.empresas || []).length ? (E.empresas || []).map(function(x){
      return '<label><input type="checkbox" data-enl="' + esc(x.enlace) + '"' + (E.enlaces.indexOf(x.enlace) > -1 ? ' checked' : '') + '> ' + esc(x.nombre) + (x.estado !== 'activa' ? ' <small>(sin aceptar)</small>' : '') + '</label>'; }).join('')
      : '<small>Todavía no tienes subcontratas: invítalas desde «Empresas de la obra».</small>') + '</div></div>' +
    '</div></div>';
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>Las carpetas</h2><p class="sub">Así le llegan, en este orden. Cada pedido cuenta igual en el porcentaje.</p></div><button type="button" class="bt sec chico" id="isw-mas-c">+ Carpeta</button></div><div class="isw-cuerpo">' +
    E.carpetas.map(function(cp, ci){ return iswCarpEd(cp, ci, ruc); }).join('') + '</div></div>';
  h += '<div class="tarj"><div class="tarj-cuerpo isw-cuerpo"><div class="isw-fila" style="align-items:center"><button type="button" class="bt" id="isw-pub">' + (E.estado === 'publicado' ? 'Guardar los cambios' : 'Publicar') + '</button>' +
    (E.estado !== 'publicado' ? '<button type="button" class="bt sec" id="isw-bor">Guardar como borrador</button>' : '') +
    (E.id ? '<button type="button" class="bt sec mal" id="isw-arch">Archivar</button>' : '') + '<span class="msg" id="isw-msg" role="status"></span></div></div></div>';
  c.innerHTML = h;
  iswAtarVolver(c);
  iswEdAtar(c);
}
function iswCarpEd(cp, ci, ruc){
  return '<div class="isw-carp" data-ci="' + ci + '"><div class="isw-carp-cab"><span aria-hidden="true">📁</span><input data-cf="n" maxlength="80" value="' + esc(cp.n || '') + '" aria-label="Nombre de la carpeta" placeholder="Nombre de la carpeta">' +
    '<button type="button" class="bt sec isw-mini" data-cm="-1" aria-label="Subir la carpeta">↑</button><button type="button" class="bt sec isw-mini" data-cm="1" aria-label="Bajar la carpeta">↓</button>' +
    '<button type="button" class="bt sec isw-mini" data-cq aria-label="Quitar la carpeta">Quitar</button></div>' +
    (cp.items || []).map(function(it, ii){ return iswItemEd(it, ci, ii, ruc); }).join('') +
    '<div class="isw-it"><button type="button" class="bt sec chico" data-mas-i="' + ci + '">+ Algo que pedir</button></div></div>';
}
function iswItemEd(it, ci, ii, ruc){
  var nom = it.nom || null, t = it.tipo;
  var h = '<div class="isw-it" data-ci="' + ci + '" data-ii="' + ii + '"><div class="isw-it-cab"><input data-f="n" maxlength="120" value="' + esc(it.n || '') + '" aria-label="Qué se pide" placeholder="Qué se pide">' +
    '<select data-f="tipo" aria-label="Tipo">' + Object.keys(ISB_TIPO).map(function(k){ return '<option value="' + k + '"' + (k === t ? ' selected' : '') + '>' + esc(ISB_TIPO[k]) + '</option>'; }).join('') + '</select>' +
    '<button type="button" class="bt sec isw-mini" data-im="-1" aria-label="Subir">↑</button><button type="button" class="bt sec isw-mini" data-im="1" aria-label="Bajar">↓</button><button type="button" class="bt sec isw-mini" data-iq aria-label="Quitar">×</button></div><div class="isw-it-op">';
  if(t === 'fotos' || t === 'archivos'){
    h += '<label>Como mínimo <input type="number" min="0" max="500" data-f="min" value="' + (it.min == null ? 1 : it.min) + '"></label>';
    if(t === 'fotos') h += '<label class="chk"><input type="checkbox" data-f="desc"' + (it.desc !== false ? ' checked' : '') + '> Cada una con su descripción</label>';
    if(t === 'archivos') h += '<span>Formatos:</span>' + ISB_FORMATOS.map(function(f){ return '<label class="chk"><input type="checkbox" data-fmt="' + f[0] + '"' + ((it.formatos || []).indexOf(f[0]) > -1 ? ' checked' : '') + '> ' + f[1] + '</label>'; }).join('') +
      (it.plantilla ? '<span>Formato: <a href="' + esc(it.plantilla.url) + '" target="_blank" rel="noopener">' + esc(it.plantilla.archivo || 'formato') + '</a> <button type="button" class="bt sec isw-mini" data-plq>Quitar</button></span>'
        : '<label class="bt sec isw-mini" style="cursor:pointer">Subir tu formato<input type="file" data-pl hidden></label>');
    h += '</div><div class="isw-it-op"><label class="chk"><input type="checkbox" data-f="connom"' + (nom ? ' checked' : '') + '> Con nomenclatura</label>';
    if(nom){
      h += '<label>Prefijo <input data-n="p" maxlength="12" value="' + esc(nom.p || '') + '" style="width:80px"></label>' +
        [['r', 'RUC'], ['a', 'Año'], ['m', 'Mes'], ['d', 'Día']].map(function(x){ return '<label class="chk"><input type="checkbox" data-n="' + x[0] + '"' + (nom[x[0]] ? ' checked' : '') + '> ' + x[1] + '</label>'; }).join('') +
        '<label>Separador <select data-n="s"><option value="_"' + (nom.s === '_' ? ' selected' : '') + '>_</option><option value="-"' + (nom.s !== '_' ? ' selected' : '') + '>-</option></select></label>' +
        '<span class="isw-prev" title="Así se llamará la primera">' + esc(isbNomPrev(nom, ruc, iswHoy().slice(0, 7), 1, t === 'fotos' ? 'jpg' : 'pdf')) + '</span>';
    }
  } else if(t === 'app'){
    h += '<label>De <select data-f="fuente">' + ISB_FUENTES.map(function(f){ return '<option value="' + f[0] + '"' + (f[0] === it.fuente ? ' selected' : '') + '>' + esc(f[1]) + '</option>'; }).join('') + '</select></label>' +
      '<label>Como mínimo <input type="number" min="0" max="500" data-f="min" value="' + (it.min == null ? 1 : it.min) + '"></label>' +
      (it.fuente === 'herramientas' ? '<small>0 = todos sus equipos</small>' : (it.fuente === 'programa' ? '<small>0 = todo lo programado del mes</small>' : '')) +
      '<label class="chk"><input type="checkbox" data-f="papel"' + (it.papel !== false ? ' checked' : '') + '> También vale en papel (escaneado)</label>';
  } else {
    h += '<label>Qué dato <select data-f="dato">' + ISB_DATOS.map(function(d){ return '<option value="' + d[0] + '"' + (d[0] === it.dato ? ' selected' : '') + '>' + esc(d[1]) + '</option>'; }).join('') + '</select></label>' +
      (/^(hht|trab|acc)$/.test(it.dato || '') ? '<small>Sale solo de lo que llevan en OBRASST; si no, lo escriben.</small>' : '');
  }
  h += '</div><div class="isw-it-op"><label style="flex:1">Ayuda <input data-f="ayuda" maxlength="240" value="' + esc(it.ayuda || '') + '" placeholder="Opcional: cómo lo quieres" style="width:100%"></label>' +
    (ISW.ed && ISW.ed.cada === 'mes' ? '<label class="chk" title="Si la subcontrata estuvo menos de un mes (7 o 15 días), ¿también se le pide esto? Los mínimos bajan en proporción a sus días."><input type="checkbox" data-f="corta"' + (it.corta === false ? '' : ' checked') + '> También en una estancia corta</label>' : '') + '</div></div>';
  return h;
}
function iswEdLeer(){
  var E = ISW.ed, c = ISW.caja; if(!E || !c) return;
  var n = $('isw-nom'); if(n) E.nombre = n.value;
  var l = $('isw-lim'); if(l) E.limite = l.value;
  var ci = $('isw-cie'); if(ci) E.cierre = +ci.value;
  var md = c.querySelector('input[name="isw-modo"]:checked'); if(md) E.modo = md.value;
  var su = $('isw-suma'); if(su) E.suma = su.checked;
  var pa = c.querySelector('input[name="isw-para"]:checked'); if(pa) E.para = pa.value;
  E.enlaces = Array.prototype.map.call(c.querySelectorAll('[data-enl]:checked'), function(x){ return x.getAttribute('data-enl'); });
  Array.prototype.forEach.call(c.querySelectorAll('.isw-carp'), function(cd){
    var cp = E.carpetas[+cd.getAttribute('data-ci')]; if(!cp) return;
    var cn = cd.querySelector('[data-cf="n"]'); if(cn) cp.n = cn.value;
  });
  Array.prototype.forEach.call(c.querySelectorAll('.isw-it[data-ii]'), function(d){
    var cp = E.carpetas[+d.getAttribute('data-ci')], it = cp && cp.items[+d.getAttribute('data-ii')]; if(!it) return;
    function v(f){ var x = d.querySelector('[data-f="' + f + '"]'); return x ? (x.type === 'checkbox' ? x.checked : x.value) : undefined; }
    it.n = v('n');
    if(v('min') !== undefined) it.min = Math.max(0, Math.min(500, parseInt(v('min'), 10) || 0));
    if(v('desc') !== undefined) it.desc = v('desc');
    if(v('papel') !== undefined) it.papel = v('papel');
    if(v('fuente') !== undefined) it.fuente = v('fuente');
    if(v('dato') !== undefined) it.dato = v('dato');
    it.ayuda = v('ayuda') || '';
    if(v('corta') !== undefined){ if(v('corta')) delete it.corta; else it.corta = false; }
    var fm = d.querySelectorAll('[data-fmt]'); if(fm.length) it.formatos = Array.prototype.filter.call(fm, function(x){ return x.checked; }).map(function(x){ return x.getAttribute('data-fmt'); });
    if(it.nom){
      var p = d.querySelector('[data-n="p"]'); if(p) it.nom.p = p.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
      ['r', 'a', 'm', 'd'].forEach(function(k){ var x = d.querySelector('[data-n="' + k + '"]'); if(x) it.nom[k] = x.checked; });
      var s = d.querySelector('[data-n="s"]'); if(s) it.nom.s = s.value;
    }
  });
}
function iswEdAtar(c){
  var E = ISW.ed;
  function repinta(){ iswEdLeer(); E.cambio = true; var y = window.scrollY; iswEditor(c); try{ window.scrollTo(0, y); }catch(e){} }
  c.oninput = function(){ if(ISW.ed) ISW.ed.cambio = true; };
  Array.prototype.forEach.call(c.querySelectorAll('input[name="isw-para"]'), function(r){ r.onchange = function(){ var l = $('isw-emps'); if(l) l.hidden = r.value !== 'algunas' || !r.checked; E.cambio = true; }; });
  $('isw-mas-c').onclick = function(){ iswEdLeer(); E.carpetas.push({ k:isbLlave('c'), n:'', items:[{ k:isbLlave('i'), n:'', tipo:'fotos', min:1, desc:true }] }); repinta(); };
  Array.prototype.forEach.call(c.querySelectorAll('.isw-carp'), function(cd){
    var ci = +cd.getAttribute('data-ci');
    Array.prototype.forEach.call(cd.querySelectorAll('[data-cm]'), function(b){ b.onclick = function(){ iswEdLeer(); var k = ci + (+b.getAttribute('data-cm')); if(k < 0 || k >= E.carpetas.length) return; var x = E.carpetas.splice(ci, 1)[0]; E.carpetas.splice(k, 0, x); repinta(); }; });
    var q = cd.querySelector('[data-cq]'); if(q) q.onclick = function(){
      iswEdLeer(); if(E.carpetas.length <= 1){ toast('El informe necesita al menos una carpeta.'); return; }
      confirmar('¿Quitas la carpeta «' + (E.carpetas[ci].n || 'sin nombre') + '»?', 'Con todo lo que pide. Lo que ya subieron en entregas abiertas deja de contar.', { si:'Quitar', mal:true }).then(function(s){ if(s){ E.carpetas.splice(ci, 1); repinta(); } });
    };
    var mi = cd.querySelector('[data-mas-i]'); if(mi) mi.onclick = function(){ iswEdLeer(); if(E.carpetas[ci].items.length >= 12){ toast('Hasta 12 pedidos por carpeta.'); return; } E.carpetas[ci].items.push({ k:isbLlave('i'), n:'', tipo:'archivos', min:1 }); repinta(); };
  });
  Array.prototype.forEach.call(c.querySelectorAll('.isw-it[data-ii]'), function(d){
    var ci = +d.getAttribute('data-ci'), ii = +d.getAttribute('data-ii'), L = E.carpetas[ci].items;
    var tp = d.querySelector('[data-f="tipo"]'); if(tp) tp.onchange = function(){
      iswEdLeer(); var it = L[ii]; it.tipo = tp.value;
      delete it.fuente; delete it.dato; delete it.nom; delete it.formatos; delete it.plantilla; delete it.desc; delete it.papel;
      if(it.tipo === 'app'){ it.fuente = 'ats'; it.papel = true; it.min = 1; } else if(it.tipo === 'dato'){ it.dato = 'numero'; delete it.min; } else if(it.tipo === 'fotos'){ it.desc = true; it.min = it.min == null ? 1 : it.min; }
      repinta();
    };
    ['fuente', 'dato'].forEach(function(f){ var s = d.querySelector('[data-f="' + f + '"]'); if(s) s.onchange = repinta; });
    var cn = d.querySelector('[data-f="connom"]'); if(cn) cn.onchange = function(){ iswEdLeer(); L[ii].nom = cn.checked ? { p:'', r:true, a:true, m:true, d:false, s:'_' } : null; if(!L[ii].nom) delete L[ii].nom; repinta(); };
    Array.prototype.forEach.call(d.querySelectorAll('[data-n]'), function(x){ x.onchange = repinta; });
    Array.prototype.forEach.call(d.querySelectorAll('[data-im]'), function(b){ b.onclick = function(){ iswEdLeer(); var k = ii + (+b.getAttribute('data-im')); if(k < 0 || k >= L.length) return; var x = L.splice(ii, 1)[0]; L.splice(k, 0, x); repinta(); }; });
    var q = d.querySelector('[data-iq]'); if(q) q.onclick = function(){ iswEdLeer(); if(L.length <= 1){ toast('Cada carpeta necesita algo que pedir: quita la carpeta.'); return; } L.splice(ii, 1); repinta(); };
    var pl = d.querySelector('[data-pl]'); if(pl) pl.onchange = function(){
      var f = pl.files && pl.files[0]; if(!f) return;
      iswEdLeer(); toast('Subiendo tu formato…');
      subirArchivoP('informes', f).then(function(url){ L[ii].plantilla = { url:url, archivo:String(f.name || 'formato').slice(0, 120) }; repinta(); }, function(e){ toast(isbMotivo(null, e)); });
    };
    var plq = d.querySelector('[data-plq]'); if(plq) plq.onclick = function(){ iswEdLeer(); delete L[ii].plantilla; repinta(); };
  });
  $('isw-pub').onclick = function(){ iswGuardar(true); };
  var bo = $('isw-bor'); if(bo) bo.onclick = function(){ iswGuardar(false); };
  var ar = $('isw-arch'); if(ar) ar.onclick = function(){
    confirmar('¿Archivas «' + (E.nombre || '') + '»?', 'Ya no se pide a nadie. Lo que ya entregaron queda.', { si:'Archivar', mal:true }).then(function(s){
      if(!s) return;
      sbRpc('sst_inf_archivar', { p:{ id:E.id } }).then(function(j){ if(j && j.ok){ toast('Archivado'); ISW.ed = null; ISW.hist = []; ISW.pant = 'lista'; iswRender(); } else iswMsg('isw-msg', iswMotivo(j), true); },
        function(e){ iswMsg('isw-msg', iswMotivo(null, e), true); });
    });
  };
}
function iswEstructura(E){
  return { carpetas:E.carpetas.map(function(cp){
    return { k:cp.k || isbLlave('c'), n:String(cp.n || '').trim(), items:(cp.items || []).map(function(it){
      var o = { k:it.k || isbLlave('i'), n:String(it.n || '').trim(), tipo:it.tipo };
      if(it.tipo !== 'dato') o.min = it.min == null ? 1 : it.min;
      if(it.tipo === 'fotos') o.desc = it.desc !== false;
      if(it.tipo === 'app'){ o.fuente = it.fuente; o.papel = it.papel !== false; }
      if(it.tipo === 'dato') o.dato = it.dato || 'numero';
      if(it.tipo === 'archivos'){ if(it.formatos && it.formatos.length) o.formatos = it.formatos; if(it.plantilla) o.plantilla = it.plantilla; }
      if((it.tipo === 'fotos' || it.tipo === 'archivos') && it.nom) o.nom = it.nom;
      if(it.ayuda) o.ayuda = String(it.ayuda).trim();
      if(it.corta === false && E.cada === 'mes') o.corta = false;
      return o;
    }) };
  }) };
}
function iswGuardar(publicar){
  iswEdLeer();
  var E = ISW.ed;
  if(String(E.nombre || '').trim().length < 3){ iswMsg('isw-msg', ISB_MOTIVO.nombre, true); $('isw-nom').focus(); return; }
  if(E.cada === 'una' && !E.limite){ iswMsg('isw-msg', ISB_MOTIVO.limite, true); return; }
  if(E.para === 'algunas' && !E.enlaces.length){ iswMsg('isw-msg', ISB_MOTIVO.para, true); return; }
  var vacia = E.carpetas.filter(function(cp){ return !String(cp.n || '').trim() || cp.items.some(function(it){ return !String(it.n || '').trim(); }); })[0];
  if(vacia){ iswMsg('isw-msg', 'Ponle nombre a cada carpeta y a cada pedido.', true); return; }
  var p = { emp:iswEmp(), nombre:E.nombre.trim(), cada:E.cada, modo:E.modo, cierre:E.cierre || 0, suma:E.suma !== false, para:E.para, enlaces:E.enlaces, estructura:iswEstructura(E) };
  if(E.id) p.id = E.id;
  if(E.cada === 'una') p.limite = E.limite;
  var b = $('isw-pub'); if(b) b.disabled = true;
  iswMsg('isw-msg', 'Guardando…');
  sbRpc('sst_inf_guardar', { p:p }).then(function(j){
    if(!j || !j.ok){ if(b) b.disabled = false; iswMsg('isw-msg', iswMotivo(j), true); return; }
    E.id = j.inf.id; E.version = j.inf.version; E.cambio = false;
    if(!publicar || j.inf.estado === 'publicado'){
      toast(j.inf.estado === 'publicado' ? 'Cambios guardados: les llegan a las entregas abiertas' : 'Borrador guardado');
      ISW.ed = null; ISW.hist = []; ISW.pant = 'lista'; iswRender(); return;
    }
    return sbRpc('sst_inf_publicar', { p:{ id:j.inf.id } }).then(function(k){
      if(!k || !k.ok){ if(b) b.disabled = false; E.estado = 'borrador'; iswMsg('isw-msg', iswMotivo(k), true); return; }
      toast('Publicado: les llegó a ' + k.empresas + (k.empresas === 1 ? ' subcontrata' : ' subcontratas'));
      ISW.ed = null; ISW.hist = []; ISW.pant = 'tablero'; ISW.p = { inf:k.inf.id }; iswRender();
    });
  }, function(e){ if(b) b.disabled = false; iswMsg('isw-msg', iswMotivo(null, e), true); });
}

/* ══ 3 · EL TABLERO: todas mis subcontratas, periodo a periodo ══════════════════════════════════════════════════════ */
function iswTablero(c){
  var P = ISW.p;
  iswPedir(c, 'sst_inf_tablero', { p:{ inf:P.inf, periodo:P.periodo || '' } }, function(j){
    var i = j.inf, F = j.filas || [], per = j.periodo, hht = ((i.estructura || {}).carpetas || []).some(function(cp){ return (cp.items || []).some(function(it){ return it.dato === 'hht'; }); });
    P.periodo = per;
    var pres = F.filter(function(f){ return f.estado === 'presentada' || f.estado === 'aprobada'; }).length, apr = F.filter(function(f){ return f.estado === 'aprobada'; }).length,
        obs = F.filter(function(f){ return f.estado === 'observada'; }).length, cs = F.filter(function(f){ return f.cumple != null; });
    var prom = cs.length ? cs.reduce(function(s, f){ return s + (+f.cumple || 0); }, 0) / cs.length : null;
    var h = iswVolverBt() + '<div class="tarj"><div class="tarj-cab"><div><h2>' + esc(i.nombre) + '</h2><p class="sub">' + esc(ISB_CADA[i.cada] || '') + ' · ' + (i.modo === 'auto' ? 'automático' : 'te lo presentan') +
      ' · cierra el ' + esc(isbFecha(j.cierre)) + '</p></div>' +
      (i.cada !== 'una' ? '<div class="isw-nuevos"><button type="button" class="bt sec chico" data-per="-1" aria-label="Periodo anterior">‹</button><b style="align-self:center;min-width:150px;text-align:center">' + esc(isbPeriodoTx(per)) + '</b>' +
        '<button type="button" class="bt sec chico" data-per="1" aria-label="Periodo siguiente"' + (per >= (i.cada === 'mes' ? iswHoy().slice(0, 7) : isbSemanaDe(iswHoy())) ? ' disabled' : '') + '>›</button></div>' : '') + '</div>' +
      '<div class="isw-cuerpo"><div class="isw-cifras">' + cifra('Presentadas', pres + ' de ' + F.length, apr ? apr + ' aprobadas' : 'ninguna aprobada todavía', '') + cifra('Observadas', String(obs), obs ? 'esperan su corrección' : 'ninguna', obs ? 'mal' : '') +
      cifra('Avance promedio', isbPct(prom), 'de todas, hoy', '') + '</div>';
    if(!F.length) h += iswVacio('Todavía no tienes subcontratas activas', 'Invítalas desde «Empresas de la obra»: en cuanto acepten, les llega.');
    else {
      h += '<div class="tabla-caja"><table class="isw-t"><thead><tr><th>Empresa</th><th>Estado</th><th>Avance</th><th>Presentado</th>' + (hht ? '<th class="num">Horas hombre</th>' : '') + '<th></th></tr></thead><tbody>' + F.map(function(f){
        return '<tr><td><b>' + esc(f.nombre) + '</b>' + (f.ruc ? '<span class="isw-sub">RUC ' + esc(f.ruc) + '</span>' : '') + '</td><td>' + iswEst(f.estado) + (f.vencido ? ' ' + iswPill('Venció', 'mal') : '') + (f.tarde ? ' ' + iswPill('Fuera de plazo', 'ojo') : '') + (f.dias ? ' ' + iswPill(f.dias + ' días', 'azul') : '') + '</td>' +
          '<td>' + (f.cumple != null ? iswBarra(f.cumple) : '—') + ((f.faltan || 0) ? '<span class="isw-sub">faltan ' + f.faltan + '</span>' : '') + '</td>' +
          '<td>' + (f.presentado ? esc(iswHora(f.presentado)) + (f.solo ? '<span class="isw-sub">sola, al cierre</span>' : '') : '—') + '</td>' +
          (hht ? '<td class="num">' + esc(isbNum(f.hht)) + '</td>' : '') +
          '<td class="isw-acc">' + (f.entrega ? '<button type="button" class="bt chico" data-ent="' + esc(f.entrega) + '">' + (f.estado === 'presentada' || f.estado === 'observada' ? 'Revisar' : 'Ver') + '</button>' : '') +
          (i.cada === 'mes' ? '<button type="button" class="bt sec chico" data-anio="' + esc(f.enlace) + '">El año</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
      if(hht && i.cada === 'semana') h += iswCuadroHH(F);
      var hay = F.filter(function(f){ return f.entrega && (i.modo === 'auto' || f.estado === 'presentada' || f.estado === 'aprobada' || f.estado === 'observada'); });
      if(hay.length) h += '<div class="isw-fila" style="margin-top:12px"><button type="button" class="bt sec" id="isw-zip-todo">Descargar todo (ZIP)</button><span class="msg" id="isw-zmsg" role="status"></span></div>';
    }
    h += '</div></div>';
    c.innerHTML = h;
    iswAtarVolver(c);
    Array.prototype.forEach.call(c.querySelectorAll('[data-per]'), function(b){ b.onclick = function(){ P.periodo = isbPeriodoMas(per, +b.getAttribute('data-per')); iswRender(); }; });
    Array.prototype.forEach.call(c.querySelectorAll('[data-ent]'), function(b){ b.onclick = function(){ iswIr('entrega', { entrega:b.getAttribute('data-ent') }); }; });
    Array.prototype.forEach.call(c.querySelectorAll('[data-anio]'), function(b){ b.onclick = function(){ iswIr('anual', { inf:i.id, enlace:b.getAttribute('data-anio'), anio:per.slice(0, 4) }); }; });
    var z = $('isw-zip-todo'); if(z) z.onclick = function(){ iswZipVarios(F.filter(function(f){ return f.entrega; }).map(function(f){ return f.entrega; }), isbCarpetaN(i.nombre + ' - ' + isbPeriodoTx(per)), 'isw-zmsg'); };
  });
}
/* el cuadro de horas hombre: cada subcontrata, sus últimas semanas (y el total de cada semana) */
function iswCuadroHH(F){
  var pers = {}; F.forEach(function(f){ (f.historial || []).forEach(function(x){ pers[x.periodo] = 1; }); });
  var P = Object.keys(pers).sort().slice(-8);
  if(!P.length) return '';
  var tot = P.map(function(){ return 0; });
  var h = '<h3 style="margin:18px 0 6px;font-size:14px">Horas hombre, semana a semana</h3><div class="tabla-caja"><table class="isw-hh"><thead><tr><th>Empresa</th>' +
    P.map(function(p){ return '<th>' + esc(isbFecha(isbRango(p).d0).slice(0, 5)) + '</th>'; }).join('') + '</tr></thead><tbody>';
  F.forEach(function(f){
    var por = {}; (f.historial || []).forEach(function(x){ por[x.periodo] = x; });
    h += '<tr><td>' + esc(f.nombre) + '</td>' + P.map(function(p, k){ var x = por[p], v = x && x.hht != null ? +x.hht : null; if(v != null) tot[k] += v;
      return '<td' + (x && x.estado === 'abierta' && v == null ? ' style="color:var(--gris)"' : '') + '>' + (v != null ? esc(isbNum(v)) : '—') + '</td>'; }).join('') + '</tr>';
  });
  return h + '<tr><td><b>Total</b></td>' + tot.map(function(v){ return '<td><b>' + esc(isbNum(v)) + '</b></td>'; }).join('') + '</tr></tbody></table></div>';
}

/* ══ 4 · LA ENTREGA: la llena la subcontrata; la revisa la principal ═══════════════════════════════════════════════ */
function iswEntrega(c){
  var P = ISW.p, args = P.entrega ? { entrega:P.entrega } : { inf:P.inf, enlace:P.enlace, periodo:P.periodo };
  iswPedir(c, 'sst_inf_ver', { p:args }, function(j){ P.entrega = j.entrega.id; ISW.ent = j.entrega; iswPintarEnt(c, j.entrega); });
}
function iswPintarEnt(c, e){
  var cu = e.cuenta || {}, items = cu.items || {}, carp = cu.carpetas || {}, A = e.archivos || [], abajo = e.lado === 'abajo';
  var h = iswVolverBt() + '<div class="tarj"><div class="isw-ent-cab"><div><h2>' + esc(e.nombre) + ' · ' + esc(isbPeriodoTx(e.periodo)) + '</h2>' +
    '<p class="sub" style="margin:4px 0 0">' + esc(e.abajo_nombre || '') + (e.ruc ? ' · RUC ' + esc(e.ruc) : '') + ' · para ' + esc(e.arriba_nombre || 'la principal') + '</p>' +
    '<p style="margin:8px 0 0">' + iswEst(e.estado) + (e.tarde ? ' ' + iswPill('Fuera de plazo', 'ojo') : '') + (e.solo ? ' ' + iswPill('Se presentó sola al cierre', 'gris') : '') +
    (e.dias ? ' ' + iswPill('Estancia corta: ' + e.dias + (e.dias === 1 ? ' día' : ' días'), 'azul') : '') +
    ' <span class="isw-sub" style="display:inline">' + (e.vencido && (e.estado === 'abierta' || e.estado === 'observada') ? 'Venció el ' : 'Cierra el ') + esc(isbFecha(e.cierre)) + '</span></p></div>' +
    '<div><span class="isw-big">' + esc(isbPct(cu.total)) + '</span><span class="isw-sub">' + ((cu.faltan || 0) ? cu.faltan + (cu.faltan === 1 ? ' pedido por completar' : ' pedidos por completar') : 'todo completo') + '</span></div>' +
    '<div class="isw-ent-acc">' + (e.puede ? '<button type="button" class="bt" id="isw-presentar">' + (e.estado === 'observada' ? 'Presentar lo corregido' : 'Presentar') + '</button>' : '') +
    (e.revisa ? '<button type="button" class="bt" id="isw-aprobar">Todo conforme (aprobar)</button>' : '') +
    (e.ve && A.length ? '<button type="button" class="bt sec" id="isw-zip">Descargar (ZIP)</button>' : '') +
    (e.ve && A.some(function(a){ return /^image\//.test(a.tipo || '') || /\.(jpe?g|png)$/i.test(a.nombre || ''); }) ? '<button type="button" class="bt sec" id="isw-panel">Panel fotográfico (PDF)</button>' : '') +
    (e.cada === 'mes' ? '<button type="button" class="bt sec" id="isw-anio">El año</button>' : '') + '</div></div>';
  if(e.sello) h += '<div class="isw-cuerpo" style="padding-top:0"><span class="isw-sello">🔒 Aprobado y sellado' + (e.revisado_nombre ? ' por ' + esc(e.revisado_nombre) : '') + ' el ' + esc(iswHora(e.revisado)) + ' · huella ' + esc(String(e.sello).slice(0, 16)) + '…</span></div>';
  if(e.presentado && !e.sello) h += '<div class="isw-cuerpo" style="padding-top:0"><span class="isw-sub">Presentada por ' + esc(e.presentado_nombre || '') + ' el ' + esc(iswHora(e.presentado)) + '</span></div>';
  if(e.puede && e.cada === 'mes') h += '<div class="isw-cuerpo" style="padding-top:0"><div class="isw-fila" style="align-items:center;margin:0"><span>¿Estuvieron menos de un mes en la obra?</span>' +
    '<input id="isw-dias" type="number" min="1" max="30" inputmode="numeric" value="' + (e.dias || '') + '" placeholder="días" style="width:90px" aria-label="Días en la obra este mes">' +
    '<button type="button" class="bt sec chico" id="isw-dias-g">Guardar los días</button>' + (e.dias ? '<button type="button" class="bt sec chico" id="isw-dias-x">Fue el mes entero</button>' : '') +
    '</div><p class="isw-ayuda">En una estancia corta se pide lo que la principal marcó para eso, con los mínimos en proporción a sus días.</p></div>';
  h += '<div class="isw-cuerpo" style="padding-top:0"><span class="msg" id="isw-emsg" role="status"></span></div></div>';
  if(!e.ve){
    h += '<div class="tarj"><div class="tarj-cuerpo isw-cuerpo"><p>Esta entrega es <b>«Me lo presentan»</b>: verás lo que subieron cuando la presenten. Mientras, su avance por carpeta:</p><ul class="isw-auto">' +
      ((e.estructura || {}).carpetas || []).map(function(cp){ return '<li><b>' + esc(cp.n) + '</b> · ' + iswBarra(carp[cp.k]) + '</li>'; }).join('') + '</ul></div></div>';
  } else {
    ((e.estructura || {}).carpetas || []).forEach(function(cp){
      var r = (e.carpetas || {})[cp.k] || {};
      if(e.dias && carp[cp.k] == null){ h += '<div class="tarj" data-carp="' + esc(cp.k) + '"><div class="tarj-cab"><div><h2 style="color:var(--gris)">📁 ' + esc(cp.n) + '</h2></div>' + iswPill('No va en una estancia corta', 'gris') + '</div></div>'; return; }
      h += '<div class="tarj" data-carp="' + esc(cp.k) + '"><div class="tarj-cab"><div><h2>📁 ' + esc(cp.n) + '</h2></div><div class="isw-nuevos" style="align-items:center">' + iswBarra(carp[cp.k]) +
        (r.e === 'conforme' ? iswPill('Conforme', 'ok') : (r.e === 'observado' ? iswPill('Observado', 'mal') : '')) +
        (e.revisa ? '<button type="button" class="bt sec chico" data-rev="conforme" data-k="' + esc(cp.k) + '">Conforme</button><button type="button" class="bt sec chico" data-rev="observado" data-k="' + esc(cp.k) + '">Observar…</button>' : '') + '</div></div>' +
        (r.e === 'observado' ? '<div class="isw-cuerpo" style="padding-bottom:0"><div class="isw-obs"><b>Observado' + (r.n ? ' por ' + esc(r.n) : '') + ':</b> ' + esc(r.nota || '') + '</div></div>' : '');
      (cp.items || []).forEach(function(it){ h += iswItemVer(e, cp, it, items[it.k] || {}, A.filter(function(a){ return a.i === it.k; }), r.e === 'conforme' && e.estado === 'observada'); });
      h += '</div>';
    });
    var mes = cu.mes;
    if(mes && (mes.items || []).length){
      h += '<div class="tarj"><div class="tarj-cab"><div><h2>Lo que pidió la principal este mes</h2><p class="sub">Los reportes semanales y los pedidos con fecha del mes: cuentan como una carpeta más.</p></div>' + iswBarra(carp._mes) + '</div><div class="isw-cuerpo"><ul class="isw-auto">' +
        mes.items.map(function(x){ return '<li><b>' + esc(x.n) + '</b> · ' + x.n_ok + ' de ' + x.de + (x.tipo === 'semana' ? ' semanas presentadas' : ' presentados') + ' · ' + esc(isbPct(x.pct)) +
          ((x.l || []).length ? '<ul class="isw-auto" style="margin-left:14px">' + x.l.map(function(u){ return '<li>' + esc(u.n) + ' <small>hasta el ' + esc(isbFecha(u.limite)) + '</small> ' + iswEst(u.e) + '</li>'; }).join('') + '</ul>' : '') + '</li>'; }).join('') +
        (mes.hht ? '<li>Horas hombre de las semanas del mes: <b>' + esc(isbNum(mes.hht)) + '</b></li>' : '') + '</ul></div></div>';
    }
    if((e.historial || []).length){
      var QUE = { presenta:'Presentó', corrige:'Presentó lo corregido', presenta_sola:'Se presentó sola al cierre', conforme:'Conforme', observado:'Observó', todas_conforme:'Aprobó todo', todas_observado:'Observó todo', estancia:'Estancia corta' };
      h += '<div class="tarj"><div class="tarj-cab"><h2>Historial</h2></div><div class="isw-cuerpo"><ul class="isw-hist">' + e.historial.slice().reverse().map(function(x){
        var cpn = x.c ? (((e.estructura || {}).carpetas || []).filter(function(cp){ return cp.k === x.c; })[0] || {}).n : '';
        return '<li><b>' + esc(QUE[x.que] || x.que) + '</b>' + (x.que === 'estancia' ? ' · ' + (x.dias ? x.dias + ' días' : 'el mes entero') : '') + (cpn ? ' · ' + esc(cpn) : '') + (x.pct != null ? ' · ' + esc(isbPct(x.pct)) : '') + ' <span class="isw-sub" style="display:inline">' + esc(x.n || '') + ' · ' + esc(iswHora(x.t)) + '</span>' + (x.nota ? '<div class="isw-ayuda">' + esc(x.nota) + '</div>' : '') + '</li>';
      }).join('') + '</ul></div></div>';
    }
  }
  c.innerHTML = h;
  iswAtarVolver(c);
  iswEntAtar(c, e);
}
function iswEsImg(a){ return /^image\//.test(a.tipo || '') || /\.(jpe?g|png|webp|gif)$/i.test(a.nombre || ''); }
function iswItemVer(e, cp, it, x, A, bloqueada){
  var abre = e.puede && !bloqueada, auto = (e.auto || {})[it.k], txt = isbItemTx(it);
  if(x.no_va) return '<div class="isw-item" data-item="' + esc(it.k) + '"><div class="isw-item-cab"><b style="color:var(--gris)">' + esc(it.n) + '</b><span class="isw-n">' + iswPill('No va en una estancia corta', 'gris') + '</span></div></div>';
  var h = '<div class="isw-item" data-item="' + esc(it.k) + '"><div class="isw-item-cab"><b>' + esc(it.n) + '</b><span class="isw-sub" style="display:inline">' + esc(txt) + '</span>' +
    '<span class="isw-n">' + (it.tipo === 'dato' ? '' : (x.n || 0) + (x.req ? ' de ' + x.req : '')) + ' ' + iswBarra(x.pct) + '</span></div>' + (it.ayuda ? '<p class="isw-ayuda">' + esc(it.ayuda) + '</p>' : '');
  if(it.tipo === 'app' && it.fuente === 'programa'){
    var LP = (auto && auto.l) || [];
    h += '<p class="isw-ayuda">Programado: <b>' + ((auto && auto.de) || 0) + '</b> · cumplido: <b>' + (x.n || 0) + '</b>. Se cumple si lo registran en OBRASST con el mismo nombre, si lo marcan como hecho en su programa o si suben su evidencia.</p>';
    if(!LP.length) h += '<p class="isw-ayuda">No tiene nada programado en este periodo (o todavía no carga su programa anual en OBRASST).</p>';
    else h += '<ul class="isw-auto">' + LP.map(function(r){
      var ev = A.filter(function(a){ return a.ref === r.id; }), hecho = r.e || ev.length > 0;
      return '<li data-act="' + esc(r.id) + '">' + iswPill(hecho ? 'Cumplida' : 'Pendiente', hecho ? 'ok' : 'ojo') + ' <b>' + esc(r.t) + '</b> <small>' + esc(r.g || '') +
        (r.mano ? ' · marcada como hecha' : (r.e ? ' · registrada en OBRASST' : '')) + '</small>' +
        ev.map(function(a){ return ' <a href="' + esc(a.u) + '" target="_blank" rel="noopener">' + esc(a.nombre) + '</a>' + (abre ? ' <button type="button" class="bt sec isw-mini" data-qu-ev="' + esc(a.id) + '" aria-label="Quitar">×</button>' : ''); }).join('') +
        (abre && !r.e ? ' <label class="bt sec isw-mini" style="cursor:pointer">' + (ev.length ? 'Otra evidencia' : 'Subir su evidencia') + '<input type="file" data-sube="' + esc(it.k) + '" data-ref="' + esc(r.id) + '" accept="image/*,.pdf" hidden></label>' : '') + '</li>';
    }).join('') + '</ul>';
    A = A.filter(function(a){ return !a.ref; });
    if(!A.length) return h + '</div>';
  } else if(it.tipo === 'app' && it.fuente === 'objetivos'){
    var LO = (auto && auto.l) || [];
    h += LO.length ? '<ul class="isw-auto">' + LO.map(function(o){ return '<li><b>' + esc(o.t) + '</b>' + (o.meta ? ' <small>· meta: ' + esc(o.meta) + '</small>' : '') +
        (o.av != null ? ' · avance <b>' + o.av + ' %</b>' : ' <small>· sin avance (escrito a mano)</small>') + '</li>'; }).join('') + '</ul>'
      : '<p class="isw-ayuda">Todavía no tiene sus objetivos y metas del año en OBRASST: los arma en «Objetivos y metas», o sube su documento.</p>';
  } else if(it.tipo === 'app'){
    var L = (auto && auto.l) || [];
    h += '<p class="isw-ayuda">Entró solo de la app: <b>' + ((auto && auto.n) || 0) + '</b>' + (auto && auto.de != null ? ' de ' + auto.de + ' equipos' : '') + '</p>';
    if(L.length) h += '<ul class="isw-auto">' + L.slice(0, 8).map(function(r){ return '<li>' + esc(isbFecha(r.f)) + ' · ' + esc(r.t || '') + (r.g != null ? ' <small>· ' + r.g + (r.g === 1 ? ' persona' : ' personas') + '</small>' : '') +
      (r.p ? ' <small>· en papel</small>' : '') + (r.u ? ' <a href="' + esc(r.u) + '" target="_blank" rel="noopener">ver</a>' : '') + '</li>'; }).join('') + (L.length > 8 ? '<li><small>y ' + (L.length - 8) + ' más</small></li>' : '') + '</ul>';
  }
  if(it.tipo === 'dato'){
    var d = (e.datos || {})[it.k], v = x.v || null, app = !d && v && v.o === 'app';
    h += '<div class="isw-dato">' + (v && v.v != null && v.v !== '' ? '<b style="font-size:16px">' + esc(it.dato === 'texto' ? v.v : isbNum(v.v)) + '</b>' + (it.dato === 'hht' ? ' h' : '') +
      ' <span class="isw-sub" style="display:inline">' + (app ? 'de lo que llevan en OBRASST' + (v.dias ? ' (' + v.dias + ' días)' : '') + (it.dato === 'acc' && v.inc != null ? ' · ' + v.inc + ' incidentes' : '') : (d && d.o === 'tareo' ? 'del tareo' : 'escrito')) + '</span>' : '<span class="isw-sub" style="display:inline">Sin dato</span>');
    if(abre) h += ' <input data-dato="' + esc(it.k) + '" ' + (it.dato === 'texto' ? 'maxlength="200"' : 'inputmode="decimal"') + ' placeholder="' + (it.dato === 'texto' ? 'Escribe' : 'El número') + '" value="' + esc(d ? d.v : '') + '" aria-label="' + esc(it.n) + '">' +
      '<button type="button" class="bt sec chico" data-dato-g="' + esc(it.k) + '">Guardar</button>';
    h += '</div>';
  }
  if(it.tipo !== 'dato'){
    if(A.length) h += '<div class="isw-arch">' + A.map(function(a, k){
      var img = iswEsImg(a);
      return '<div class="isw-a" data-a="' + esc(a.id) + '">' + (img ? '<a href="' + esc(a.u) + '" target="_blank" rel="noopener"><img class="isw-img" src="' + esc(a.u) + '" alt="' + esc(a.d || a.nombre) + '" loading="lazy"></a>'
        : '<a class="isw-doc" href="' + esc(a.u) + '" target="_blank" rel="noopener" aria-label="Abrir ' + esc(a.nombre) + '">📄</a>') +
        '<div class="isw-a-tx"><b>' + esc(a.nombre) + '</b>' + (a.d ? '<span>' + esc(a.d) + '</span>' : (abre && it.desc ? '<span style="color:var(--mal)">Falta su descripción</span>' : '')) + '</div>' +
        (abre ? '<div class="isw-a-acc"><button type="button" data-mv="-1" aria-label="Antes"' + (k ? '' : ' disabled') + '>◀</button><button type="button" data-mv="1" aria-label="Después"' + (k < A.length - 1 ? '' : ' disabled') + '>▶</button>' +
          '<button type="button" data-de aria-label="Descripción">✎</button><button type="button" data-qu aria-label="Quitar">×</button></div>' : '') + '</div>';
    }).join('') + '</div>';
    if(abre && (it.tipo !== 'app' || it.papel !== false)){
      var acc = it.tipo === 'fotos' ? 'image/*' : (it.tipo === 'archivos' ? isbAccept(it.formatos) : 'image/*,.pdf');
      h += '<div class="isw-fila" style="margin:8px 0 0"><label class="bt sec chico" style="cursor:pointer">' + (it.tipo === 'fotos' ? '+ Subir fotos' : (it.tipo === 'app' ? '+ Subir en papel (escaneado)' : '+ Subir archivo')) +
        '<input type="file" data-sube="' + esc(it.k) + '"' + (acc ? ' accept="' + esc(acc) + '"' : '') + ' multiple hidden></label>' +
        (it.plantilla ? '<a class="bt sec chico" href="' + esc(it.plantilla.url) + '" target="_blank" rel="noopener">Descargar el formato de la principal</a>' : '') + '</div>';
    } else if(it.plantilla && e.lado === 'abajo') h += '<p class="isw-ayuda"><a href="' + esc(it.plantilla.url) + '" target="_blank" rel="noopener">Descargar el formato de la principal</a></p>';
  }
  return h + '</div>';
}
function iswEntAtar(c, e){
  function rehacer(j){ if(j && j.ok && j.entrega){ ISW.ent = j.entrega; var y = window.scrollY; iswPintarEnt(c, j.entrega); try{ window.scrollTo(0, y); }catch(_e){} return true; } return false; }
  function err(j, x){ iswMsg('isw-emsg', iswMotivo(j, x), true); toast(iswMotivo(j, x)); }
  Array.prototype.forEach.call(c.querySelectorAll('[data-sube]'), function(inp){ inp.onchange = function(){
    var k = inp.getAttribute('data-sube'), ref = inp.getAttribute('data-ref') || null, fs = Array.prototype.slice.call(inp.files || []); if(!fs.length) return;
    var it = iswItemDe(e, k); if(!it) return;
    if(it.tipo === 'archivos'){ var malos = fs.filter(function(f){ return !isbFormatoOk(it.formatos, f.name); }); if(malos.length){ var t = '«' + malos[0].name + '» no es del formato que piden (' + (it.formatos || []).join(', ') + ').'; iswMsg('isw-emsg', t, true); toast(t); inp.value = ''; return; } }
    var desc = '';
    var seguir = Promise.resolve();
    if(it.tipo === 'fotos' && it.desc && fs.length === 1) seguir = preguntar('La descripción de la foto', 'Dónde es y qué se ve (sale en el panel fotográfico).', { etiqueta:'Descripción', maximo:200 }, { si:'Subir' }).then(function(v){ if(v === null) throw 'no'; desc = v || ''; });
    seguir.then(function(){
      var hechos = 0, ultimo = null;
      iswMsg('isw-emsg', 'Subiendo ' + fs.length + (fs.length === 1 ? ' archivo…' : ' archivos…'));
      return fs.reduce(function(cad, f){ return cad.then(function(){
        var esImg = /^image\/(jpeg|png|webp)/.test(f.type || '');
        var listo = esImg ? achicarFoto(f, 1800, 0.82).then(function(b){ return new File([b], String(f.name || 'foto.jpg').replace(/\.[A-Za-z0-9]+$/, '') + '.jpg', { type:'image/jpeg' }); }, function(){ return f; }) : Promise.resolve(f);
        return listo.then(function(ff){ return subirArchivoP('informes', ff).then(function(url){
          var fe = f.lastModified ? new Date(f.lastModified) : null, fecha = fe ? fe.getFullYear() + '-' + isbDos(fe.getMonth() + 1) + '-' + isbDos(fe.getDate()) : null;
          return sbRpc('sst_inf_subir', { p:{ entrega:e.id, item:k, url:url, original:ff.name, descripcion:desc || null, fecha:fecha, peso:ff.size, tipo:ff.type, ref:ref } }).then(function(j){
            if(!j || !j.ok) throw { j:j }; hechos++; ultimo = j; iswMsg('isw-emsg', 'Subido ' + hechos + ' de ' + fs.length + '…');
          });
        }); });
      }); }, Promise.resolve()).then(function(){ if(ultimo) rehacer(ultimo); toast(hechos === 1 ? 'Subido: ' + (ultimo.nombre || '') : 'Subidos: ' + hechos); },
        function(x){ if(ultimo) rehacer(ultimo); err(x && x.j, x && !x.j ? x : null); });
    }, function(){});
  }; });
  Array.prototype.forEach.call(c.querySelectorAll('.isw-a[data-a]'), function(d){
    var id = d.getAttribute('data-a');
    function cambiar(p){ p.entrega = e.id; p.id = id; return sbRpc('sst_inf_archivo_cambiar', { p:p }).then(function(j){ if(!rehacer(j)) err(j); }, function(x){ err(null, x); }); }
    Array.prototype.forEach.call(d.querySelectorAll('[data-mv]'), function(b){ b.onclick = function(){ cambiar({ mover:+b.getAttribute('data-mv') }); }; });
    var de = d.querySelector('[data-de]'); if(de) de.onclick = function(){
      var a = (e.archivos || []).filter(function(x){ return x.id === id; })[0] || {};
      preguntar('La descripción', 'Dónde es y qué se ve.', { etiqueta:'Descripción', maximo:200, valor:a.d || '' }).then(function(v){ if(v !== null) cambiar({ descripcion:v }); });
    };
    var qu = d.querySelector('[data-qu]'); if(qu) qu.onclick = function(){ confirmar('¿Quitas este archivo?', 'Los que siguen se vuelven a numerar.', { si:'Quitar', mal:true }).then(function(s){ if(s) cambiar({ quitar:true }); }); };
  });
  Array.prototype.forEach.call(c.querySelectorAll('[data-qu-ev]'), function(b){ b.onclick = function(){
    confirmar('¿Quitas esta evidencia?', 'La actividad vuelve a quedar pendiente si no tiene otra.', { si:'Quitar', mal:true }).then(function(s){
      if(s) sbRpc('sst_inf_archivo_cambiar', { p:{ entrega:e.id, id:b.getAttribute('data-qu-ev'), quitar:true } }).then(function(j){ if(!rehacer(j)) err(j); }, function(x){ err(null, x); });
    });
  }; });
  function estancia(d){ return sbRpc('sst_inf_estancia', { p:{ entrega:e.id, dias:d } }).then(function(j){ if(!rehacer(j)) err(j); else toast(d ? 'Estancia corta: ' + d + ' días' : 'El mes entero'); }, function(x){ err(null, x); }); }
  var dg = $('isw-dias-g'); if(dg) dg.onclick = function(){ var v = String(($('isw-dias') || {}).value || '').trim(); if(!v){ iswMsg('isw-emsg', ISB_MOTIVO.dias, true); return; } estancia(v); };
  var dx = $('isw-dias-x'); if(dx) dx.onclick = function(){ estancia(''); };
  Array.prototype.forEach.call(c.querySelectorAll('[data-dato-g]'), function(b){ b.onclick = function(){
    var k = b.getAttribute('data-dato-g'), inp = c.querySelector('[data-dato="' + k + '"]'), v = String(inp ? inp.value : '').trim().replace(',', '.');
    b.disabled = true;
    sbRpc('sst_inf_dato', { p:{ entrega:e.id, item:k, v:v, o:'mano' } }).then(function(j){ b.disabled = false; if(!rehacer(j)) err(j); else toast(v ? 'Guardado' : 'Borrado: vale lo de la app'); }, function(x){ b.disabled = false; err(null, x); });
  }; });
  var pr = $('isw-presentar'); if(pr) pr.onclick = function(){
    var cu = e.cuenta || {};
    confirmar(e.estado === 'observada' ? '¿Presentas lo corregido?' : '¿Presentas el informe?',
      'Va con ' + isbPct(cu.total) + ' de avance' + ((cu.faltan || 0) ? ' (faltan ' + cu.faltan + ')' : '') + '. Lo de la app queda como está hoy y ya no se cambia, salvo lo que te observen.', { si:'Presentar' }).then(function(s){
      if(!s) return;
      pr.disabled = true;
      sbRpc('sst_inf_presentar', { p:{ entrega:e.id } }).then(function(j){ if(!rehacer(j)){ pr.disabled = false; err(j); } else toast(j.entrega.tarde ? 'Presentado (fuera de plazo)' : 'Presentado'); }, function(x){ pr.disabled = false; err(null, x); });
    });
  };
  function revisar(p){ p.entrega = e.id; return sbRpc('sst_inf_revisar', { p:p }).then(function(j){ if(!rehacer(j)) err(j); else toast(j.entrega.estado === 'aprobada' ? 'Aprobado y sellado' : 'Anotado'); }, function(x){ err(null, x); }); }
  Array.prototype.forEach.call(c.querySelectorAll('[data-rev]'), function(b){ b.onclick = function(){
    var k = b.getAttribute('data-k');
    if(b.getAttribute('data-rev') === 'conforme') return revisar({ carpeta:k, e:'conforme' });
    preguntar('¿Qué falta o qué corrigen?', 'Le llega a la subcontrata con la carpeta; lo demás queda como está.', { etiqueta:'La observación', maximo:400, minimo:5, corto:'Escribe qué falta (unas palabras).' }, { si:'Observar', mal:true })
      .then(function(v){ if(v) revisar({ carpeta:k, e:'observado', nota:v }); });
  }; });
  var ap = $('isw-aprobar'); if(ap) ap.onclick = function(){
    confirmar('¿Todo conforme?', 'Se aprueba y se sella: ya no se cambia. Si algo falta, mejor observa esa carpeta.', { si:'Aprobar' }).then(function(s){ if(s) revisar({ todas:true, e:'conforme' }); });
  };
  var z = $('isw-zip'); if(z) z.onclick = function(){ iswZipVarios([e.id], null, 'isw-emsg', e); };
  var pn = $('isw-panel'); if(pn) pn.onclick = function(){ iswPanelPdf(e); };
  var an = $('isw-anio'); if(an) an.onclick = function(){ iswIr('anual', { inf:e.inf, enlace:e.enlace, anio:String(e.periodo).slice(0, 4) }); };
}
function iswItemDe(e, k){ var r = null; ((e.estructura || {}).carpetas || []).forEach(function(cp){ (cp.items || []).forEach(function(it){ if(it.k === k) r = it; }); }); return r; }

/* ══ 5 · LO QUE SE BAJA: el ZIP (las carpetas tal cual, con un índice) y el panel fotográfico en PDF ═══════════════ */
function iswBajarU8(url){ return fetch(url).then(function(r){ return r.ok ? r.arrayBuffer() : Promise.reject(r.status); }).then(function(b){ return new Uint8Array(b); }); }
function iswEntradas(e, raiz){
  var n = 0, E = [], idx = ['Carpeta;Pedido;Archivo;Descripción;Fecha'], cu = e.cuenta || {};
  var pre = raiz ? raiz + '/' : '';
  ((e.estructura || {}).carpetas || []).forEach(function(cp, ci){
    var dir = pre + isbDos(ci + 1) + ' ' + isbCarpetaN(cp.n);
    (cp.items || []).forEach(function(it){
      (e.archivos || []).filter(function(a){ return a.i === it.k; }).forEach(function(a){ n++; E.push({ dir:dir + ((cp.items || []).length > 1 ? '/' + isbCarpetaN(it.n) : ''), a:a }); idx.push([cp.n, it.n, a.nombre, a.d || '', a.f || ''].map(function(s){ return '"' + String(s).replace(/"/g, '""') + '"'; }).join(';')); });
      var au = (e.auto || {})[it.k];
      if(it.tipo === 'app' && au && (au.l || []).length) E.push({ dir:dir, txt:isbCarpetaN(it.n) + ' (de la app).csv',
        datos:'﻿Fecha;Qué;Personas;En papel\n' + au.l.map(function(r){ return [r.f || '', r.t || '', r.g != null ? r.g : '', r.p ? 'sí' : ''].map(function(s){ return '"' + String(s).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n') });
    });
  });
  var res = 'Informe: ' + e.nombre + '\nEmpresa: ' + (e.abajo_nombre || '') + (e.ruc ? ' (RUC ' + e.ruc + ')' : '') + '\nPara: ' + (e.arriba_nombre || '') + '\nPeriodo: ' + isbPeriodoTx(e.periodo) +
    '\nEstado: ' + ((ISB_EST[e.estado] || [''])[0]) + (e.presentado ? ' · presentado el ' + iswHora(e.presentado) : '') + (e.sello ? '\nSello: ' + e.sello : '') + '\nAvance: ' + isbPct(cu.total) + '\n\n' +
    ((e.estructura || {}).carpetas || []).map(function(cp){ return cp.n + ': ' + isbPct((cu.carpetas || {})[cp.k]); }).join('\n') + '\n';
  E.push({ dir:pre.replace(/\/$/, ''), txt:'00 Resumen.txt', datos:res }, { dir:pre.replace(/\/$/, ''), txt:'00 Índice.csv', datos:'﻿' + idx.join('\n') });
  return E;
}
function iswZipVarios(ids, nombre, msg, una){
  if(ISW.zip) return; ISW.zip = true;
  iswMsg(msg, 'Juntando…');
  var ents = [], todas = [];
  (una ? Promise.resolve([una]) : ids.reduce(function(cad, id){ return cad.then(function(L){ return sbRpc('sst_inf_ver', { p:{ entrega:id } }).then(function(j){ if(j && j.ok && j.entrega.ve) L.push(j.entrega); return L; }, function(){ return L; }); }); }, Promise.resolve([])))
  .then(function(L){
    L.forEach(function(e){ iswEntradas(e, una ? '' : isbCarpetaN(e.abajo_nombre || 'Empresa')).forEach(function(x){ todas.push(x); }); });
    var tot = todas.filter(function(x){ return x.a; }).length, k = 0;
    return todas.reduce(function(cad, x){ return cad.then(function(){
      if(!x.a){ ents.push({ nombre:(x.dir ? x.dir + '/' : '') + x.txt, datos:x.datos }); return; }
      return iswBajarU8(x.a.u).then(function(u8){ k++; iswMsg(msg, 'Bajando ' + k + ' de ' + tot + '…'); ents.push({ nombre:x.dir + '/' + x.a.nombre, datos:u8 }); },
        function(){ k++; ents.push({ nombre:x.dir + '/' + x.a.nombre + ' (no se pudo bajar).txt', datos:x.a.u }); });
    }); }, Promise.resolve());
  }).then(function(){
    var e = una || ISW.ent || {};
    bajarBlob(isbZip(ents), (nombre || isbCarpetaN((e.nombre || 'Informe') + ' - ' + (e.abajo_nombre || '') + ' - ' + isbPeriodoTx(e.periodo || ''))) + '.zip');
    iswMsg(msg, 'Listo: se bajó el ZIP.'); ISW.zip = false;
  }, function(x){ ISW.zip = false; iswMsg(msg, iswMotivo(null, x), true); });
}
/* el panel fotográfico: 2 fotos por hoja, con su nombre, su descripción y su fecha; la portada con la empresa */
function iswPanelPdf(e){
  var F = (e.archivos || []).filter(iswEsImg);
  if(!F.length) return;
  iswMsg('isw-emsg', 'Armando el panel fotográfico…');
  cargarEvPDF().then(function(){
    var J = window.jspdf && window.jspdf.jsPDF; if(!J) throw 'sin_pdf';
    var doc = new J({ unit:'mm', format:'a4' }), W = 210, M = 14;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text('Panel fotográfico', M, 22);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    [e.nombre + ' · ' + isbPeriodoTx(e.periodo), (e.abajo_nombre || '') + (e.ruc ? ' · RUC ' + e.ruc : ''), 'Para: ' + (e.arriba_nombre || ''), F.length + (F.length === 1 ? ' foto' : ' fotos')].forEach(function(t, k){ doc.text(String(t), M, 32 + k * 6); });
    var y = 62, enHoja = 0;
    return F.reduce(function(cad, a, k){ return cad.then(function(){
      return fetch(a.u).then(function(r){ return r.ok ? r.blob() : Promise.reject(r.status); }).then(function(b){ return new Promise(function(ok, no){ var fr = new FileReader(); fr.onload = function(){ ok(fr.result); }; fr.onerror = no; fr.readAsDataURL(b); }); })
        .then(function(durl){ return new Promise(function(ok){ var im = new Image(); im.onload = function(){ ok({ d:durl, w:im.naturalWidth, h:im.naturalHeight }); }; im.onerror = function(){ ok({ d:durl, w:4, h:3 }); }; im.src = durl; }); })
        .then(function(im){
          if(enHoja === 2 || (k === 0 && y > 60)){ doc.addPage(); y = 16; enHoja = 0; }
          var mw = W - 2 * M, mh = 108, r = Math.min(mw / im.w, mh / im.h), w = im.w * r, h = im.h * r;
          try{ doc.addImage(im.d, /png/i.test(im.d.slice(0, 30)) ? 'PNG' : 'JPEG', M + (mw - w) / 2, y, w, h); }catch(_i){}
          doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text(String(a.nombre), M, y + h + 5);
          doc.setFont('helvetica', 'normal'); doc.text(doc.splitTextToSize(String((a.d || '') + (a.f ? '  ·  ' + isbFecha(a.f) : '')), mw), M, y + h + 10);
          y += h + 22; enHoja++;
        }, function(){});
    }); }, Promise.resolve()).then(function(){
      var n = doc.getNumberOfPages(); for(var i = 1; i <= n; i++){ doc.setPage(i); doc.setFontSize(8); doc.text('OBRASST · ' + i + ' de ' + n, W - M, 290, { align:'right' }); }
      bajarBlob(doc.output('blob'), isbCarpetaN('Panel fotográfico - ' + (e.abajo_nombre || '') + ' - ' + isbPeriodoTx(e.periodo)) + '.pdf');
      iswMsg('isw-emsg', 'Listo: se bajó el panel fotográfico.');
    });
  }).catch(function(x){ iswMsg('isw-emsg', iswMotivo(null, x), true); });
}

/* ══ 6 · EL AÑO: cada mes con su estado y su avance (la curva), lo de la app sumado y el ZIP del año ══════════════ */
function iswAnual(c){
  var P = ISW.p;
  iswPedir(c, 'sst_inf_anual', { p:{ inf:P.inf, enlace:P.enlace, anio:P.anio } }, function(j){
    var M = j.meses || [], por = {}; M.forEach(function(x){ por[x.periodo] = x; });
    var anio = j.anio, hoy = iswHoy().slice(0, 7);
    var meses = []; for(var m = 1; m <= 12; m++) meses.push(anio + '-' + isbDos(m));
    var pts = meses.map(function(p, k){ var x = por[p]; return x && x.cumple != null ? { k:k, v:+x.cumple } : null; }).filter(Boolean);
    var svg = '<svg class="isw-curva" viewBox="0 0 640 170" role="img" aria-label="El avance de cada mes"><g font-size="10" fill="currentColor" opacity=".55">' +
      [0, 50, 100].map(function(v){ var y = 140 - v * 1.2; return '<line x1="34" x2="630" y1="' + y + '" y2="' + y + '" stroke="currentColor" stroke-opacity=".2"/><text x="4" y="' + (y + 3) + '">' + v + ' %</text>'; }).join('') +
      meses.map(function(p, k){ return '<text x="' + (44 + k * 49) + '" y="160">' + ISB_MESES[k].slice(0, 3) + '</text>'; }).join('') + '</g>' +
      (pts.length ? '<polyline fill="none" stroke="var(--azul)" stroke-width="2.5" points="' + pts.map(function(q){ return (52 + q.k * 49) + ',' + (140 - q.v * 1.2); }).join(' ') + '"/>' +
        pts.map(function(q){ return '<circle cx="' + (52 + q.k * 49) + '" cy="' + (140 - q.v * 1.2) + '" r="4" fill="var(--azul)"/>'; }).join('') : '') + '</svg>';
    var nomK = {}; ((j.estructura || {}).carpetas || []).forEach(function(cp){ (cp.items || []).forEach(function(it){ nomK[it.k] = it.n; }); });
    var tot = Object.keys(j.totales || {}).filter(function(k){ return nomK[k]; });
    var h = iswVolverBt() + '<div class="tarj"><div class="tarj-cab"><div><h2>' + esc(j.nombre) + ' · ' + esc(anio) + '</h2><p class="sub">' + esc(j.empresa || '') + ' · el año, mes a mes</p></div>' +
      '<div class="isw-nuevos"><button type="button" class="bt sec chico" data-anio="-1">‹ ' + (+anio - 1) + '</button>' + (+anio < +hoy.slice(0, 4) ? '<button type="button" class="bt sec chico" data-anio="1">' + (+anio + 1) + ' ›</button>' : '') + '</div></div>' +
      '<div class="isw-cuerpo"><div class="isw-cifras">' + cifra('Promedio del año', isbPct(j.promedio), 'de lo presentado', '') + cifra('Meses presentados', String(M.filter(function(x){ return x.estado === 'presentada' || x.estado === 'aprobada'; }).length), 'de ' + M.length + ' abiertos', '') + '</div>' + svg +
      '<div class="tabla-caja"><table class="isw-t"><thead><tr><th>Mes</th><th>Estado</th><th>Avance</th><th>Presentado</th><th>Sello</th><th></th></tr></thead><tbody>' + meses.filter(function(p){ return p <= hoy || por[p]; }).map(function(p){
        var x = por[p];
        return '<tr><td>' + esc(isbPeriodoTx(p)) + '</td><td>' + (x ? iswEst(x.estado) + (x.tarde ? ' ' + iswPill('Fuera de plazo', 'ojo') : '') : iswEst('sin_abrir')) + '</td><td>' + (x && x.cumple != null ? iswBarra(x.cumple) : '—') + '</td>' +
          '<td>' + (x && x.presentado ? esc(iswHora(x.presentado)) : '—') + '</td><td>' + (x && x.sello ? '<span class="isw-sello">' + esc(x.sello) + '…</span>' : '') + '</td>' +
          '<td class="isw-acc">' + (x ? '<button type="button" class="bt sec chico" data-ent="' + esc(x.entrega) + '">Ver</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (tot.length ? '<h3 style="margin:16px 0 6px;font-size:14px">En el año, de la app (lo presentado)</h3><ul class="isw-auto">' + tot.map(function(k){ return '<li>' + esc(nomK[k]) + ': <b>' + j.totales[k] + '</b></li>'; }).join('') + '</ul>' : '') +
      (M.some(function(x){ return x.estado === 'presentada' || x.estado === 'aprobada'; }) ? '<div class="isw-fila" style="margin-top:12px"><button type="button" class="bt sec" id="isw-zip-anio">Descargar el año (ZIP)</button><span class="msg" id="isw-amsg" role="status"></span></div>' : '') +
      '</div></div>';
    c.innerHTML = h;
    iswAtarVolver(c);
    Array.prototype.forEach.call(c.querySelectorAll('[data-anio]'), function(b){ b.onclick = function(){ P.anio = String(+anio + (+b.getAttribute('data-anio'))); iswRender(); }; });
    Array.prototype.forEach.call(c.querySelectorAll('[data-ent]'), function(b){ b.onclick = function(){ iswIr('entrega', { entrega:b.getAttribute('data-ent') }); }; });
    var z = $('isw-zip-anio'); if(z) z.onclick = function(){
      var ids = M.filter(function(x){ return x.estado === 'presentada' || x.estado === 'aprobada'; }).map(function(x){ return x.entrega; });
      iswZipAnio(ids, isbCarpetaN(j.nombre + ' ' + anio + ' - ' + (j.empresa || '')));
    };
  });
}
function iswZipAnio(ids, nombre){
  if(ISW.zip) return; ISW.zip = true;
  var ents = [];
  iswMsg('isw-amsg', 'Juntando el año…');
  ids.reduce(function(cad, id){ return cad.then(function(){ return sbRpc('sst_inf_ver', { p:{ entrega:id } }).then(function(j){
    if(!(j && j.ok)) return;
    var e = j.entrega, raiz = String(e.periodo).slice(5, 7) + ' ' + isbPeriodoTx(e.periodo);
    return iswEntradas(e, raiz).reduce(function(c2, x){ return c2.then(function(){
      if(!x.a){ ents.push({ nombre:(x.dir ? x.dir + '/' : '') + x.txt, datos:x.datos }); return; }
      return iswBajarU8(x.a.u).then(function(u8){ ents.push({ nombre:x.dir + '/' + x.a.nombre, datos:u8 }); iswMsg('isw-amsg', 'Bajando ' + ents.length + '…'); }, function(){ ents.push({ nombre:x.dir + '/' + x.a.nombre + ' (no se pudo bajar).txt', datos:x.a.u }); });
    }); }, Promise.resolve());
  }); }); }, Promise.resolve()).then(function(){ bajarBlob(isbZip(ents), nombre + '.zip'); iswMsg('isw-amsg', 'Listo: se bajó el ZIP del año.'); ISW.zip = false; },
    function(x){ ISW.zip = false; iswMsg('isw-amsg', iswMotivo(null, x), true); });
}

/* ══ 7 · LOS ESTÁNDARES Y LOS BOLETINES ═════════════════════════════════════════════════════════════════════════════ */
function iswEst2(c){
  c.innerHTML = '<div class="vacio">Cargando…</div>';
  sbRpc('sst_est_lista', { p:{ emp:iswEmp() } }).then(function(j){
    if(!c.isConnected || ISW.cual !== 'est') return;
    if(!j || !j.ok){ c.innerHTML = iswVacio('No se pudo cargar', iswMotivo(j)); return; }
    var pone = iswGrado() >= 1, h = '';
    if(pone && j.manda) h += iswEstForm();
    if(pone || (j.arriba || []).length) h += iswEstArriba(j);
    if((j.abajo || []).length) h += iswEstAbajo(j);
    if(!h) h = '<div class="tarj"><div class="tarj-cuerpo isw-cuerpo"><h2>Estándares y boletines</h2><p>Cuando la principal de tu obra publique un estándar o un boletín, te llega aquí y en la app: das el «Recibido», lo difundes a tu gente con su firma, y el boletín sale en tu mural.</p></div></div>';
    c.innerHTML = h;
    iswEstAtar(c, j);
  }, function(e){ if(c.isConnected) c.innerHTML = iswVacio('No se pudo cargar', iswMotivo(null, e)); });
}
function iswEstForm(){
  var t = ISW.estTipo, E = ((iswIni() || {}).abajo || []).filter(function(l){ return l.clase === 'subcontrata' && l.estado === 'activa'; });
  return '<div class="tarj"><div class="tarj-cab"><div><h2>Publicar a tus subcontratas</h2><p class="sub">Un estándar (lo confirman y lo difunden a su gente, que firma que lo leyó) o un boletín (sale en el mural de cada una).</p></div></div><div class="isw-cuerpo">' +
    '<div class="seg isw-seg" role="tablist" aria-label="Qué publicas"><button type="button" role="tab" data-et="estandar" aria-selected="' + (t === 'estandar') + '" class="' + (t === 'estandar' ? 'on' : '') + '">Estándar</button>' +
    '<button type="button" role="tab" data-et="boletin" aria-selected="' + (t === 'boletin') + '" class="' + (t === 'boletin' ? 'on' : '') + '">Boletín</button></div>' +
    '<div class="isw-fila"><div class="campo"><label for="ise-t">Título</label><input id="ise-t" maxlength="140" placeholder="' + (t === 'estandar' ? 'Estándar de trabajos en altura' : 'Boletín de seguridad de la semana') + '"></div>' +
    (t === 'estandar' ? '<div class="campo" style="max-width:170px"><label for="ise-c">Código</label><input id="ise-c" maxlength="40" placeholder="EST-SST-01"></div><div class="campo" style="max-width:110px"><label for="ise-v">Versión</label><input id="ise-v" maxlength="20" placeholder="1"></div>'
      : '<div class="campo" style="max-width:190px"><label for="ise-h">Sale en el mural hasta</label><input id="ise-h" type="date" min="' + iswHoy() + '"></div>') + '</div>' +
    '<div class="isw-fila"><label class="bt sec chico" style="cursor:pointer">' + (ISW.estArch ? 'Cambiar el archivo' : 'Elegir el archivo (PDF o imagen)') + '<input type="file" id="ise-f" accept=".pdf,image/*" hidden></label><span id="ise-fn">' + (ISW.estArch ? esc(ISW.estArch.name) : '') + '</span></div>' +
    (t === 'estandar' ? '<div class="isw-op"><label class="chk"><input type="checkbox" id="ise-d" checked> <span>Que lo difundan a su gente (cada uno lo lee y firma en su celular)</span></label></div>' : '') +
    '<div class="isw-op" role="radiogroup" aria-label="Para quiénes"><label><input type="radio" name="ise-para" value="todas" checked> <span>Todas mis subcontratas</span></label><label><input type="radio" name="ise-para" value="algunas"> <span>Algunas</span></label>' +
    '<div class="isw-emp-l" id="ise-emps" hidden>' + (E.length ? E.map(function(l){ return '<label><input type="checkbox" data-ise-enl="' + esc(l.id) + '"> ' + esc(cadCorto(l.nombre || '')) + '</label>'; }).join('') : '<small>Todavía no tienes subcontratas activas.</small>') + '</div></div>' +
    '<div class="isw-fila" style="align-items:center"><button type="button" class="bt" id="ise-pub">Publicar</button><span class="msg" id="ise-msg" role="status"></span></div></div></div>';
}
function iswEstArriba(j){
  var L = j.arriba || [];
  if(!L.length) return '';
  return '<div class="tarj"><div class="tarj-cab"><div><h2>Lo que publicaste</h2><p class="sub">Cada subcontrata con su acuse, su difusión y las firmas de su gente; el boletín, cuántos lo vieron.</p></div></div>' + L.map(function(s){
    var E = s.empresas || [];
    return '<div class="isw-item"><div class="isw-item-cab"><b>' + esc((s.codigo ? s.codigo + ' · ' : '') + s.titulo) + '</b>' + iswPill(s.tipo === 'boletin' ? 'Boletín' : 'Estándar', s.tipo === 'boletin' ? 'azul' : 'gris') +
      (s.version ? ' <span class="isw-sub" style="display:inline">versión ' + esc(s.version) + '</span>' : '') + (s.estado === 'retirado' ? ' ' + iswPill('Retirado', 'gris') : '') +
      '<span class="isw-n"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">Ver el archivo</a>' + (s.estado === 'vigente' && j.manda ? ' <button type="button" class="bt sec chico" data-ret="' + esc(s.id) + '">Retirar</button>' : '') + '</span></div>' +
      '<p class="isw-ayuda">Publicado el ' + esc(iswHora(s.creado)) + (s.hasta ? ' · en el mural hasta el ' + esc(isbFecha(s.hasta)) : '') + '</p>' +
      (E.length ? '<div class="tabla-caja"><table class="isw-t"><thead><tr><th>Empresa</th><th>Recibido</th>' + (s.tipo === 'estandar' ? '<th>Difundido</th><th>Firmaron</th>' : '<th>Lo vieron</th>') + '</tr></thead><tbody>' + E.map(function(x){
        return '<tr><td>' + esc(x.nombre) + '</td><td>' + (x.recibido ? '✓ ' + esc(iswHora(x.recibido)) + (x.por ? '<span class="isw-sub">' + esc(x.por) + '</span>' : '') : iswPill('Sin acuse', 'ojo')) + '</td>' +
          (s.tipo === 'estandar' ? '<td>' + (x.difundido ? '✓ ' + esc(iswHora(x.difundido)) : '—') + '</td><td>' + (x.firmas != null ? x.firmas + ' de ' + (x.gente || 0) : '—') + '</td>'
            : '<td>' + (x.vistos != null ? x.vistos + (x.vistos === 1 ? ' persona' : ' personas') : '—') + '</td>') + '</tr>';
      }).join('') + '</tbody></table></div>' : '<p class="isw-ayuda">Todavía no le llegó a nadie (sin subcontratas activas).</p>') + '</div>';
  }).join('') + '</div>';
}
function iswEstAbajo(j){
  return '<div class="tarj"><div class="tarj-cab"><div><h2>Lo que te llegó</h2><p class="sub">De la principal (o quien te supervisa): da el «Recibido» y, si es un estándar, difúndelo a tu gente desde aquí o desde la app.</p></div></div>' + (j.abajo || []).map(function(s){
    return '<div class="isw-item"><div class="isw-item-cab"><b>' + esc((s.codigo ? s.codigo + ' · ' : '') + s.titulo) + '</b>' + iswPill(s.tipo === 'boletin' ? 'Boletín' : 'Estándar', s.tipo === 'boletin' ? 'azul' : 'gris') +
      '<span class="isw-n"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">Ver el archivo</a></span></div><p class="isw-ayuda">De ' + esc(s.de || 'la principal') + ' · ' + esc(iswHora(s.creado)) + (s.version ? ' · versión ' + esc(s.version) : '') +
      (s.tipo === 'boletin' ? ' · sale en tu mural' + (s.hasta ? ' hasta el ' + esc(isbFecha(s.hasta)) : '') : '') + '</p><div class="isw-fila" style="margin:6px 0 0">' +
      (s.recibido ? '<span class="isw-conf">✓ Recibido el ' + esc(iswHora(s.recibido)) + '</span>' : '<button type="button" class="bt chico" data-rec="' + esc(s.id) + '|' + esc(s.enlace) + '">Recibido</button>') +
      (s.tipo === 'estandar' ? (s.difundido ? '<span class="isw-conf">✓ Difundido a tu gente el ' + esc(iswHora(s.difundido)) + ' (en la app: «Inducción y difusiones»)</span>'
        : (s.difundir ? '<button type="button" class="bt sec chico" data-dif="' + esc(s.id) + '|' + esc(s.enlace) + '">Difundir a mi gente</button>' : '')) : '') + '</div></div>';
  }).join('') + '</div>';
}
function iswEstAtar(c, j){
  Array.prototype.forEach.call(c.querySelectorAll('[data-et]'), function(b){ b.onclick = function(){ ISW.estTipo = b.getAttribute('data-et'); iswEst2(c); }; });
  var f = $('ise-f'); if(f) f.onchange = function(){ ISW.estArch = (f.files && f.files[0]) || null; var n = $('ise-fn'); if(n) n.textContent = ISW.estArch ? ISW.estArch.name : ''; };
  Array.prototype.forEach.call(c.querySelectorAll('input[name="ise-para"]'), function(r){ r.onchange = function(){ var l = $('ise-emps'); if(l) l.hidden = !(r.value === 'algunas' && r.checked); }; });
  var pub = $('ise-pub'); if(pub) pub.onclick = function(){
    var t = ($('ise-t').value || '').trim(), para = (c.querySelector('input[name="ise-para"]:checked') || {}).value || 'todas';
    if(t.length < 3){ iswMsg('ise-msg', ISB_MOTIVO.titulo, true); return; }
    if(!ISW.estArch){ iswMsg('ise-msg', 'Elige el archivo.', true); return; }
    var enl = Array.prototype.map.call(c.querySelectorAll('[data-ise-enl]:checked'), function(x){ return x.getAttribute('data-ise-enl'); });
    if(para === 'algunas' && !enl.length){ iswMsg('ise-msg', ISB_MOTIVO.para, true); return; }
    pub.disabled = true; iswMsg('ise-msg', 'Subiendo el archivo…');
    subirArchivoP('estandares', ISW.estArch).then(function(url){
      var p = { emp:iswEmp(), tipo:ISW.estTipo, titulo:t, url:url, archivo:ISW.estArch.name, para:para, enlaces:enl };
      if(ISW.estTipo === 'estandar'){ p.codigo = ($('ise-c').value || '').trim() || null; p.version = ($('ise-v').value || '').trim() || null; p.difundir = !!($('ise-d') || {}).checked; }
      else p.hasta = ($('ise-h').value || '') || null;
      return sbRpc('sst_est_poner', { p:p });
    }).then(function(r){
      pub.disabled = false;
      if(!r || !r.ok){ iswMsg('ise-msg', iswMotivo(r), true); return; }
      ISW.estArch = null; toast('Publicado: le llegó a ' + r.empresas + (r.empresas === 1 ? ' subcontrata' : ' subcontratas')); iswEst2(c);
    }, function(x){ pub.disabled = false; iswMsg('ise-msg', iswMotivo(null, x), true); });
  };
  Array.prototype.forEach.call(c.querySelectorAll('[data-ret]'), function(b){ b.onclick = function(){
    confirmar('¿Lo retiras?', 'Deja de pedirse a tus subcontratas; lo que ya confirmaron queda.', { si:'Retirar', mal:true }).then(function(s){
      if(s) sbRpc('sst_est_retirar', { p:{ id:b.getAttribute('data-ret') } }).then(function(r){ if(r && r.ok){ toast('Retirado'); iswEst2(c); } else toast(iswMotivo(r)); }, function(x){ toast(iswMotivo(null, x)); });
    });
  }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-rec]'), function(b){ b.onclick = function(){
    var p = b.getAttribute('data-rec').split('|'); b.disabled = true;
    sbRpc('sst_est_recibir', { p:{ id:p[0], enlace:p[1] } }).then(function(r){ if(r && r.ok){ toast('Recibido'); iswEst2(c); } else { b.disabled = false; toast(iswMotivo(r)); } }, function(x){ b.disabled = false; toast(iswMotivo(null, x)); });
  }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-dif]'), function(b){ b.onclick = function(){
    var p = b.getAttribute('data-dif').split('|');
    confirmar('¿Lo difundes a tu gente?', 'Se arma una difusión «lee y firma» con el documento: a cada uno le llega a su celular y firma que lo leyó. La principal ve cuántos firmaron.', { si:'Difundir' }).then(function(s){
      if(!s) return; b.disabled = true;
      sbRpc('sst_est_difundir', { p:{ id:p[0], enlace:p[1] } }).then(function(r){ if(r && r.ok){ toast('Difundido a tu gente'); iswEst2(c); } else { b.disabled = false; toast(iswMotivo(r)); } }, function(x){ b.disabled = false; toast(iswMotivo(null, x)); });
    });
  }; });
}
