/* OBRASST · el país de la obra, para el portal: la lista de países, lo que se
   esconde en cada uno, el documento de la empresa y de la persona, el aviso
   del accidente y la capa que saca la ley peruana de una obra de afuera.
   Lo arma armar.py con los pedazos de la app (paises.js, pais-do.js,
   pais-otros.js). No editar: se cambia en la app y se vuelve a armar. */
var PAIS_OBRA_PORTAL = 'pe';
function paisDeObra(){ return PAIS_OBRA_PORTAL || 'pe'; }
function empActiva(){ return null; }
var MIS_PAISES = {}, NORMAS_PAIS = {}, VACIOS_PAIS = {};
var PAISES = [
  { id:'pe', n:'Perú',      b:'\uD83C\uDDF5\uD83C\uDDEA', fuente:'El Peruano' },
  { id:'cl', n:'Chile',     b:'\uD83C\uDDE8\uD83C\uDDF1', fuente:'LeyChile (BCN)' },
  { id:'co', n:'Colombia',  b:'\uD83C\uDDE8\uD83C\uDDF4', fuente:'Régimen Legal y gestores normativos' },
  { id:'ar', n:'Argentina', b:'\uD83C\uDDE6\uD83C\uDDF7', fuente:'argentina.gob.ar y Boletín Oficial' },
  { id:'do', n:'República Dominicana', b:'\uD83C\uDDE9\uD83C\uDDF4', fuente:'Ministerio de Trabajo (mt.gob.do) e IDOPPRIL' },
  /* 26/09/2026 · paises-fuente/nuevos/ */
  { id:'uy', n:'Uruguay',   b:'\uD83C\uDDFA\uD83C\uDDFE', fuente:'IMPO y gub.uy' },
  { id:'py', n:'Paraguay',  b:'\uD83C\uDDF5\uD83C\uDDFE', fuente:'BACN e IPS' },
  { id:'mx', n:'México',    b:'\uD83C\uDDF2\uD83C\uDDFD', fuente:'DOF, STPS y Cámara de Diputados' },
  { id:'us', n:'Estados Unidos', b:'\uD83C\uDDFA\uD83C\uDDF8', fuente:'OSHA (osha.gov)' },
  { id:'ca', n:'Canadá',    b:'\uD83C\uDDE8\uD83C\uDDE6', fuente:'Justice Laws, e-Laws de Ontario y LégisQuébec' }
];
var LS_PAIS = 'sstc_pais';

/* El reloj del celular dice el país sin pedir permiso de ubicación ni
   gastar datos. Si no se puede leer, Perú, que es de donde venimos.
   07/10/2026 · Marcelo: «Los planes están en dólares, colócalos en soles».
   El reloj solo no alcanza: la zona «Bogotá, Lima, Quito» de Windows —la de
   casi toda computadora del Perú— llega como America/Bogota cuando la región
   de Windows no es «Perú», y a esa persona se le ofrecía Colombia y precios
   en dólares. Ahora se mira también el idioma del equipo: Bogotá es Colombia
   solo si el idioma lo dice (es-CO); y con el idioma del Perú (es-PE) y la
   hora del Perú (UTC-5), es el Perú aunque la zona se llame distinto (la del
   Este de EE. UU. en invierno, Panamá, Cancún). Ante la duda, Perú. */
function _paisIdiomas(){
  var o = {};
  try{
    var L = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for(var i = 0; i < L.length; i++){ var m = String(L[i] || '').match(/^es[-_]([A-Za-z]{2})$/); if(m) o[m[1].toLowerCase()] = 1; }
  }catch(e){}
  return o;
}
function paisDetectado(){
  try{
    var z = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    if(z.indexOf('lima') >= 0) return 'pe';
    var idi = _paisIdiomas();
    if(z.indexOf('bogota') >= 0) return (idi.co && !idi.pe) ? 'co' : 'pe';
    if(idi.pe && new Date().getTimezoneOffset() === 300) return 'pe';
    if(z.indexOf('santiago') >= 0 || z.indexOf('punta_arenas') >= 0 || z.indexOf('easter') >= 0) return 'cl';
    if(z.indexOf('santo_domingo') >= 0) return 'do';
    if(z.indexOf('argentina') >= 0 || z.indexOf('buenos_aires') >= 0 || z.indexOf('cordoba') >= 0) return 'ar';
    /* 26/09/2026 */
    if(z.indexOf('montevideo') >= 0) return 'uy';
    if(z.indexOf('asuncion') >= 0) return 'py';
    if(/mexico_city|cancun|merida|monterrey|matamoros|chihuahua|ciudad_juarez|ojinaga|mazatlan|bahia_banderas|hermosillo|tijuana/.test(z)) return 'mx';
    if(/toronto|vancouver|edmonton|winnipeg|halifax|st_johns|regina|swift_current|moncton|glace_bay|goose_bay|whitehorse|dawson|yellowknife|iqaluit|rankin_inlet|cambridge_bay|resolute|fort_nelson|creston|atikokan|blanc-sablon|inuvik|rainy_river|nipigon|thunder_bay|pangnirtung/.test(z)) return 'ca';
    if(/new_york|chicago|denver|los_angeles|phoenix|anchorage|adak|honolulu|detroit|boise|indiana|kentucky|north_dakota|menominee|juneau|sitka|metlakatla|nome|yakutat/.test(z)) return 'us';
  }catch(e){}
  return 'pe';
}
function paisActual(){
  try{ var v = leer(LS_PAIS, null); if(v && paisPorId(v)) return v; }catch(e){}
  return paisDetectado();
}
function paisPorId(id){
  for(var i=0;i<PAISES.length;i++) if(PAISES[i].id===id) return PAISES[i];
  return null;
}
var OBRA_PAIS_DOC = { pe:'RUC', cl:'RUT', co:'NIT', ar:'CUIT', 'do':'RNC', uy:'RUT', py:'RUC', mx:'RFC', us:'EIN', ca:'BN' };
var OBRA_PAIS_DE  = { pe:'del Perú', cl:'de Chile', co:'de Colombia', ar:'de Argentina', 'do':'de República Dominicana',
                      uy:'de Uruguay', py:'de Paraguay', mx:'de México', us:'de Estados Unidos', ca:'de Canadá' };
/* ══ LOS PAÍSES QUE EL DUEÑO PUEDE ELEGIR ══════════════════════════
   Marcelo, 23/09/2026: República Dominicana, con prospecto.
   28/09/2026: «no solo Perú y República Dominicana, sino los demás
   países, y que esté con su respectivo registro de empresa». Chile,
   Colombia y Argentina entran con lo suyo: el RUT, el NIT y la CUIT
   (documentos.js), los documentos del personal, sus normas (ya estaban
   en la biblioteca), el aviso del accidente de allá y una capa que saca
   la ley peruana de la pantalla y de los PDF (pais-otros.js). Lo que
   está escrito sobre la ley peruana y no tiene todavía su versión se
   esconde, como en RD. Van en este orden: Perú primero y los demás por
   nombre. */
/* 26/09/2026 · Marcelo: «vamos a agregar los países de Uruguay, Paraguay,
   México, Estados Unidos y Canadá». Entran como Chile, Colombia y
   Argentina: su documento de empresa y de personal, sus normas en la
   biblioteca, el aviso del accidente de allá y la capa que saca la ley
   peruana (pais-otros.js). Fuentes: paises-fuente/nuevos/. */
var PAISES_OBRA = ['pe', 'ar', 'ca', 'cl', 'co', 'us', 'mx', 'py', 'do', 'uy'];
/* lo que se esconde en cada país hasta que tenga su versión (llaves del
   catálogo de accesos y pantallas). En RD el comité NO se esconde: tiene
   su versión (Comité Mixto o Coordinador). Lo que sí se esconde es lo
   escrito sobre la ley peruana y que va en la segunda entrega: las
   capacitaciones y evaluaciones, los talleres, la inducción, los
   procedimientos, la señalética de la NTP y las campañas. */
var _OCULTA_OTROS = {
  accesos:   { comite:1, proced:1 },
  pantallas: { 'p-comite':1, 'p-comite-acta':1, 'p-procedimientos':1, 'p-proc':1 }
};
/* Chile, Colombia y Argentina (28/09): lo mismo que RD, y además el
   comité, que en RD tiene su versión y allá todavía no */
var _OCULTA_FUERA = {
  accesos:   { comite:1, proced:1, temas:1, talleres:1, induccion:1, senales:1, constancias:1, campanas:1, sctr:1 },
  pantallas: { 'p-comite':1, 'p-comite-acta':1, 'p-comite-armar':1, 'p-comite-ver':1,
               'p-procedimientos':1, 'p-proc':1, 'p-temas':1, 'p-generar':1, 'p-talleres':1, 'p-taller':1,
               'p-taller-fin':1, 'p-ind-armar':1, 'p-ind-avance':1, 'p-ind-ed':1, 'p-ind-trab':1,
               'p-senales':1, 'p-senal':1, 'p-senal-pers':1, 'p-constancias':1, 'p-plan-cap':1,
               'p-campanas':1, 'p-campana':1,
               /* 08/10 · la autorización del grupo sanguíneo está escrita sobre la Ley 29733 (Perú) */
               'p-aut-lista':1, 'p-aut-trab':1, 'p-aut-firma':1,
               /* 09/10 · el SCTR es del Perú (D.S. 003-98-SA) */
               'p-sctr':1, 'p-sctr-nuevo':1 }
};
var OBRA_OCULTA = {
  cl:_OCULTA_FUERA, co:_OCULTA_FUERA, ar:_OCULTA_FUERA,
  uy:_OCULTA_FUERA, py:_OCULTA_FUERA, mx:_OCULTA_FUERA, us:_OCULTA_FUERA, ca:_OCULTA_FUERA,
  /* 26/09/2026 · los procedimientos ya tienen su versión dominicana
     (procedimientos/fuente/do): el acceso se ve y muestra solo esos */
  'do': {
    accesos:   { temas:1, talleres:1, induccion:1, senales:1, constancias:1, campanas:1, sctr:1 },
    pantallas: { 'p-temas':1, 'p-generar':1, 'p-talleres':1, 'p-taller':1,
                 'p-taller-fin':1, 'p-ind-armar':1, 'p-ind-avance':1, 'p-ind-ed':1, 'p-ind-trab':1,
                 'p-senales':1, 'p-senal':1, 'p-senal-pers':1, 'p-constancias':1, 'p-plan-cap':1,
                 'p-campanas':1, 'p-campana':1,
                 /* 08/10 · la autorización del grupo sanguíneo está escrita sobre la Ley 29733 (Perú) */
                 'p-aut-lista':1, 'p-aut-trab':1, 'p-aut-firma':1,
                 'p-sctr':1, 'p-sctr-nuevo':1 }
  }
};
/* compatibilidad con lo que ya preguntaba por «solo de Perú» */
var OBRA_SOLO_PE = _OCULTA_OTROS;
function esRD(){
  try{ return typeof paisDeObra === 'function' && paisDeObra() === 'do'; }catch(_e){ return false; }
}
/* 28/09 · Chile, Colombia y Argentina también son país de obra, y cada
   uno tiene su capa (pais-otros.js). La maquinaria de acá —la pantalla,
   los PDF, lo que se comparte, los montos— pregunta paisCapa(): el país
   de la obra si no es el Perú, o '' si lo es. */
function paisCapa(){
  try{
    var p = (typeof paisDeObra === 'function') ? paisDeObra() : 'pe';
    return (p && p !== 'pe') ? p : '';
  }catch(_e){ return ''; }
}
/* ¿en qué moneda se le cobra? La paga la empresa (la madre), no el
   proyecto: la constructora peruana con un proyecto en Chile sigue
   pagando en soles; la chilena, en dólares aunque abra una obra en Lima.
   Si todavía no se sabe el país de la madre (MIS_PAISES, pais-proyecto.js),
   el de la obra. */
function paisDelPago(){
  var p = 'pe';
  try{ p = (typeof paisDeObra === 'function') ? paisDeObra() : 'pe'; }catch(_p){}
  try{
    var e = (typeof empActiva === 'function') ? empActiva() : null;
    var raiz = e && e.padre;
    if(raiz && typeof MIS_PAISES === 'object' && MIS_PAISES && MIS_PAISES[raiz]) return MIS_PAISES[raiz];
  }catch(_e){}
  return p || 'pe';
}
function pagoEnDolares(){ return paisDelPago() !== 'pe'; }
function txCapa(s){
  var p = paisCapa();
  if(!p) return s;
  if(p === 'do') return txDO(s);
  return (typeof txOT === 'function') ? txOT(s, p) : s;
}
/* el texto pasa por la capa solo si la obra no es del Perú */
function txPais(s){ return paisCapa() ? txCapa(s) : s; }
function _ejemplosCapa(v){
  var p = paisCapa();
  if(p === 'do') return _doEjemplos(v);
  return (p && typeof _otEjemplos === 'function') ? _otEjemplos(v, p) : v;
}

/* ── los documentos de cada país ─────────────────────────────────── */
var DOC_PAIS = {
  pe: { emp:'RUC', empLargo:'RUC de la empresa', per:'DNI', perPh:'70123456', empPh:'20123456789', tel:'51',
        tipos:[['DNI','DNI'],['CE','Carné de extranjería'],['PTP','PTP'],['Pasaporte','Pasaporte']] },
  'do': { emp:'RNC', empLargo:'RNC de la empresa', per:'Cédula', perPh:'00112345678', empPh:'101234567', tel:'1',
        tipos:[['Cédula','Cédula'],['Pasaporte','Pasaporte'],['Otro','Otro documento']] },
  /* 28/09 · los tipos los rellena documentos.js con su lista */
  cl: { emp:'RUT', empLargo:'RUT de la empresa', per:'RUN', perPh:'12.345.678-5', empPh:'76.123.456-0', tel:'56',
        tipos:[['RUN','RUN'],['Pasaporte','Pasaporte']] },
  co: { emp:'NIT', empLargo:'NIT de la empresa', per:'Cédula', perPh:'1023456789', empPh:'900.123.456-8', tel:'57',
        tipos:[['CC','Cédula de ciudadanía'],['CE','Cédula de extranjería'],['PPT','PPT'],['Pasaporte','Pasaporte']] },
  ar: { emp:'CUIT', empLargo:'CUIT de la empresa', per:'DNI', perPh:'30123456', empPh:'30-71234567-1', tel:'54',
        tipos:[['DNI','DNI'],['Pasaporte','Pasaporte'],['Otro','Otro documento']] },
  /* 26/09/2026 · los tipos, también de documentos.js */
  uy: { emp:'RUT', empLargo:'RUT de la empresa', per:'Cédula', perPh:'45678901', empPh:'211234560012', tel:'598',
        tipos:[['Cédula','Cédula (DNI)'],['Pasaporte','Pasaporte'],['Otro','Otro documento']] },
  py: { emp:'RUC', empLargo:'RUC de la empresa', per:'Cédula', perPh:'4567890', empPh:'80012345-6', tel:'595',
        tipos:[['Cédula','Cédula de identidad'],['Pasaporte','Pasaporte'],['Otro','Otro documento']] },
  mx: { emp:'RFC', empLargo:'RFC de la empresa', per:'CURP', perPh:'PEGJ850101HDFRRN09', empPh:'CAN120101AB1', tel:'52',
        tipos:[['CURP','CURP'],['Pasaporte','Pasaporte'],['Otro','Otro documento']] },
  us: { emp:'EIN', empLargo:'EIN de la empresa', per:'ID', perPh:'', empPh:'12-3456789', tel:'1',
        tipos:[['ID','ID o licencia de conducir'],['Pasaporte','Pasaporte'],['Otro','Otro documento']] },
  ca: { emp:'BN', empLargo:'Business Number (BN) de la empresa', per:'ID', perPh:'', empPh:'123456789', tel:'1',
        tipos:[['ID','ID o licencia de conducir'],['Pasaporte','Pasaporte'],['Otro','Otro documento']] }
};
function docPais(p){ return DOC_PAIS[p || paisCapa() || 'pe'] || DOC_PAIS.pe; }
/* ¿el documento de una persona es de los que se escriben solo con
   números? En RD la cédula se escribe con guiones (001-1234567-8) y se
   guarda sin ellos: si no, el supervisor la carga con guiones, el
   trabajador sin guiones, y la app no los junta nunca. */
function docPersonaNorm(td, v){
  v = String(v||'').trim();
  if(td === 'DNI' || td === 'Cédula') return v.replace(/\D/g,'');
  return v.toUpperCase().replace(/[^A-Z0-9]/g,'');
}

/* El RNC: 9 dígitos, el último es verificador (pesos 7,9,8,6,5,4,3,2).
   La cédula: 11 dígitos, verificador Luhn. Hay números válidos que no
   pasan el verificador —la DGII los tiene listados—, así que el aviso es
   blando: se avisa y se deja seguir. Lo duro es el largo. */
function rncDigito(d8){
  var w = [7,9,8,6,5,4,3,2], s = 0;
  for(var i=0;i<8;i++) s += w[i]*(+d8.charAt(i));
  var r = s % 11;
  return r === 0 ? 2 : (r === 1 ? 1 : 11 - r);
}
function cedulaLuhnOk(d){
  if(!/^\d{11}$/.test(d)) return false;
  var s = 0;
  for(var i=0;i<11;i++){
    var n = +d.charAt(10 - i);
    if(i % 2 === 1){ n *= 2; if(n > 9) n -= 9; }
    s += n;
  }
  return s % 10 === 0;
}
/* devuelve null si está bien, {duro:'…'} si no se puede seguir, o
   {blando:'…'} si se puede seguir con el aviso */
function rncRevisar(v){
  var d = String(v||'').replace(/\D/g,'');
  if(!d) return { duro:'Falta el RNC. Es lo que hace que tu empresa sea una sola en la app.' };
  if(d.length === 9){
    if(rncDigito(d.slice(0,8)) !== +d.charAt(8))
      return { blando:'El último dígito de ese RNC no calza con los demás. Revísalo: si está bien escrito, toca «Crear» otra vez.' };
    return null;
  }
  if(d.length === 11){
    if(!cedulaLuhnOk(d))
      return { blando:'El último dígito de esa cédula no calza con los demás. Revísala: si está bien escrita, toca «Crear» otra vez.' };
    return null;
  }
  return { duro:'El RNC tiene 9 dígitos. Si la empresa es tuya como persona física, pon tu cédula: 11 dígitos.' };
}

/* ── las normas dominicanas ──────────────────────────────────────────
   Mismo formato que las de Chile, Colombia y Argentina: código, qué es,
   ámbito, sector, año, qué obliga en una línea, y el texto oficial. */
var _RD_522 = 'https://mt.gob.do/wp-content/uploads/2023/06/Reglamento-522-06.pdf';
NORMAS_PAIS['do'] = [
  { c:'Ley 16-92', d:'Código de Trabajo', a:'sst', s:'*', y:'1992',
    o:'Es la base: el reglamento de SST sale de su art. 420, y las multas por incumplirlo, de su Libro Octavo.',
    u:'https://mt.gob.do/wp-content/uploads/2024/07/codigo_de_trabajo.pdf' },
  { c:'Decreto 522-06', d:'Reglamento de Seguridad y Salud en el Trabajo', a:'sst', s:'*', y:'2006',
    o:'Obliga a evitar y controlar los riesgos, dar el EPP gratis (7.9), registrar los accidentes (6.1.3) y capacitar a cada trabajador en los riesgos de su puesto, con registro por persona (9.3 y 9.6).',
    u:_RD_522 },
  { c:'Decreto 522-06, art. 8', d:'Programa de Seguridad y Salud en el Trabajo', a:'sst', s:'*', y:'2006',
    o:'Obliga a remitir el programa de SST al Ministerio de Trabajo entre julio y septiembre y a actualizarlo cada 3 años. La empresa nueva tiene 3 meses desde que inicia actividades.',
    u:_RD_522 },
  { c:'Decreto 522-06, arts. 4.3 y 11', d:'Riesgo grave e inminente', a:'sst', s:'*', y:'2006',
    o:'El trabajador puede interrumpir su actividad ante un riesgo grave e inminente, agotados los canales internos. El empleador debe dejarlo retirarse y no puede exigirle volver mientras siga el peligro (art. 12: sin perjuicio para él).',
    u:_RD_522 },
  { c:'Decreto 522-06, art. 10', d:'Coordinación con contratistas', a:'sst', s:'*', y:'2006',
    o:'Si varias empresas trabajan en el mismo lugar, todas coordinan la prevención, y el titular del lugar informa a los contratistas de los riesgos y de las medidas de emergencia.',
    u:_RD_522 },
  { c:'Decreto 522-06, art. 7.14', d:'Vigilancia de la salud', a:'salud', s:'*', y:'2006',
    o:'Obliga a exámenes médicos periódicos según el riesgo, nunca con más de un año entre uno y otro, hechos o supervisados por médico con especialidad o maestría en salud ocupacional.',
    u:_RD_522 },
  { c:'Resolución 04/2007', d:'Condiciones generales y particulares de SST', a:'sst', s:'*', y:'2007',
    o:'Fija las condiciones del lugar de trabajo: botiquín en todo lugar de trabajo (1.20), puestos de primeros auxilios con 100 o más trabajadores por turno (1.21), barandillas rígidas de 90 cm como mínimo (1.26) y protectores auditivos sobre 80 dB(A) (3.1.5.2).',
    u:_RD_522 },
  { c:'Resolución 04/2007, 1.35 y 2.46', d:'Escaleras y cargas suspendidas', a:'sst', s:'construccion', y:'2007',
    o:'Desde una escalera de mano, sobre 2.44 m (8 pies) solo con cinturón de seguridad (1.35.15); escaleras fijas de más de 2.44 m con protección circundante (1.35.10); nadie debajo de una carga suspendida (2.46).',
    u:_RD_522 },
  { c:'Resolución 04/2007, parte II, 2.3', d:'Construcciones', a:'sst', s:'construccion', y:'2007',
    o:'La sección propia de las obras. La app todavía no la resume: antes de citar una medida de andamios, excavaciones o altura, ábrela en el texto oficial.',
    u:_RD_522 },
  { c:'Comité Mixto de SST', d:'Manual-Guía del Ministerio de Trabajo (2024)', a:'sst', s:'*', y:'2024',
    o:'Con 15 o más trabajadores, Comité Mixto paritario: preside el empleador y el secretario es de los trabajadores; se reúne por lo menos una vez al mes y manda sus actas a la Dirección General de Higiene y Seguridad Industrial. Con menos de 15, un Coordinador de SST.',
    u:'https://mt.gob.do/wp-content/uploads/2024/09/Manual-Guia-para-Conformacion-del-CM.pdf' },
  { c:'Proyecto de reforma del 522-06', d:'En consulta pública desde octubre de 2023', a:'sst', s:'*', y:'no vigente',
    o:'El Ministerio de Trabajo consultó un reglamento nuevo. Mientras no se promulgue manda el Decreto 522-06, que el Ministerio sigue publicando como vigente.',
    u:'https://transparencia.mt.gob.do/index.php/consulta-publica/category/consulta-publica-del-proyecto-de-modificacion-del-decreto-522-06' },
  { c:'Ley 87-01', d:'Sistema Dominicano de Seguridad Social', a:'salud', s:'*', y:'2001',
    o:'Crea el Seguro de Riesgos Laborales: el trabajador inscrito en la TSS queda cubierto por accidente de trabajo, de trayecto y enfermedad profesional.',
    u:'https://idoppril.gob.do/download/sobre-sistema-de-seguridad-social-ley-87-01/' },
  { c:'Ley 397-19', d:'Crea el IDOPPRIL', a:'salud', s:'*', y:'2019',
    o:'El IDOPPRIL administra el Seguro de Riesgos Laborales. Ahí se notifica el accidente de trabajo (formulario ATR-2) y la enfermedad profesional (EPR-1).',
    u:'https://idoppril.gob.do/download/que-crea-el-instituto-dominicano-de-prevencion-y-proteccion-de-riegos-laborales-y-modifica-ley-87-01-ley-no-397-19/' },
  { c:'Reglamento del Seguro de Riesgos Laborales, art. 36', d:'Aviso del accidente de trabajo', a:'salud', s:'*', y:'Ley 87-01',
    o:'Obliga al empleador a notificar el accidente a la administradora —hoy el IDOPPRIL— dentro de las 72 horas hábiles (3 días laborables). Si no avisa, el trabajador reclama directo.',
    u:'https://www.tss.gob.do/assets/regla_srl_v2.pdf' },
  { c:'Ley 64-00', d:'Ley General sobre Medio Ambiente y Recursos Naturales', a:'ambiente', s:'*', y:'2000',
    o:'Obliga a tener la autorización ambiental antes de ejecutar una obra que pueda afectar el ambiente (arts. 40 y 41: incluye carreteras y proyectos de desarrollo urbano).',
    u:'https://ambiente.gob.do/wpfd_file/ley-64-00-general-sobre-medio-ambiente-y-recursos-naturales/' },
  { c:'Ley 225-20', d:'Gestión integral y coprocesamiento de residuos sólidos', a:'ambiente', s:'*', y:'2020',
    o:'Obliga a separar los residuos en la fuente (art. 17). Los de construcción y demolición son una categoría propia de la ley.',
    u:'https://ambiente.gob.do/wpfd_file/ley-no-225-20-gestion-residuos-solidos/' },
  { c:'Decreto 320-21', d:'Reglamento de la Ley 225-20', a:'ambiente', s:'*', y:'2021',
    o:'Reglamento de aplicación de la ley de residuos: baja a detalle cómo cumplirla.',
    u:'https://ambiente.gob.do/wpfd_file/reglamento-de-aplicacion-de-la-ley-num-225-20-general-de-gestion-integral-y-coprocesamiento-de-residuos-solidos/' },
  { c:'NA-RU-001-03', d:'Norma ambiental de protección contra ruidos', a:'ambiente', s:'*', y:'2003',
    o:'Fija los niveles máximos permisibles del ruido ambiental de fuentes fijas y móviles: es la que mide el ruido que la obra saca a los vecinos.',
    u:'https://ambiente.gob.do/wpfd_file/normas-ambientales-para-la-proteccion-contra-ruidos/' },
  { c:'Ley 172-13', d:'Protección de los datos personales', a:'salud', s:'*', y:'2013',
    o:'Rige cómo la empresa trata los datos de su personal: fichas, fotos, firmas y exámenes.',
    u:'https://presidencia.gob.do/sites/default/files/statics/transparencia/marco-legal/leyes/Ley-172-13.pdf' }
];
VACIOS_PAIS['do'] = [];

/* ── los precios, en dólares ──────────────────────────────────────────
   Marcelo eligió dólares para República Dominicana. Los montos son una
   propuesta hasta que él los confirme: se cambian aquí y en ningún otro
   lado. Salen de la escalera nueva en soles (24/09/2026: 59 · 139 · 299 ·
   590, puesto 49, obra 79) al cambio de 3.36 soles por dólar del
   22/09/2026, redondeado al dólar. En la web no hay Mercado Pago en
   dólares, así que el botón es «Pedir este plan» y el código se manda a
   mano; en Google Play cobra Google, en la moneda del celular. El anual
   que pasa de US$ 999,99 no existe en Play (es el techo de Google por
   producto): el de Gestión SST se pide aparte. */
var PRECIO_USD = {
  prevencionista:{ m:18,  a:180  },
  supervisor:    { m:41,  a:410  },
  ssoma:         { m:89,  a:890  },
  gestion:       { m:175, a:1750 },
  puesto: 15,
  obra: 24
};

/* ══════════════════════════════════════════════════════════════════
   LA CAPA DE TEXTO
   ══════════════════════════════════════════════════════════════════ */

/* 1 · frases enteras que en RD no valen y tienen su par. Van primero y
   de la más larga a la más corta, para que una no se coma a la otra. */
var DO_FRASES = [
  /* emergencias */
  ['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o al SAMU (106), a los Bomberos (116) o a la Policía (105).',
   'Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o al 911, donde haya cobertura.'],
  ['Números de emergencia en el Perú: Bomberos 116 · SAMU 106 · Policía 105.',
   'Número de emergencia: 911, donde haya cobertura. Ten a mano también el del centro de salud y el de los bomberos más cercanos a la obra.'],
  /* ATS */
  ['El ATS es una orden escrita específica. El incumplimiento del ATS que derive en lesión al trabajador no constituye accidente de trabajo según el D.S. 003-98-SA, art. 2, inciso 2.3, literal c.',
   'El ATS es una orden escrita específica.'],
  ['Paralizaré mi actividad ante peligro inminente, y avisaré. Es un derecho que me reconoce la Ley 29783.',
   'Ante un riesgo grave e inminente interrumpiré mi actividad y avisaré de inmediato a mi supervisor. Es un derecho que me reconoce el Decreto 522-06 (arts. 4.3 y 11).'],
  /* denuncias */
  ['Interrumpir un trabajo ante un peligro inminente está protegido por la Ley 29783 (art. 63). Una represalia por eso, o por reportar, hay que pararla y corregirla.',
   'Interrumpir un trabajo ante un riesgo grave e inminente está protegido por el Decreto 522-06 (arts. 4.3, 11 y 12). Una represalia por eso, o por reportar, hay que pararla y corregirla.'],
  /* 01/10/2026 · el hostigamiento sexual: la Ley 27942 y su reglamento son
     del Perú. Afuera no hay par verificado: se dice sin la cita (la
     primera es la de la app; la segunda, la del portal) */
  ['El hostigamiento sexual tiene su propio procedimiento por ley (Ley 27942 y su reglamento, D.S. 014-2019-MIMP). Pásala sin demora a quien lleva estos casos en tu empresa —el comité de intervención o su delegado— para que proteja a la víctima.',
   'El hostigamiento sexual tiene su propio procedimiento. Pásala sin demora a quien lleva estos casos en tu empresa, para que proteja a la víctima.'],
  ['El hostigamiento sexual tiene su propio procedimiento por ley (Ley 27942 y su reglamento, D.S. 014-2019-MIMP). Pásala sin demora a quien lleva estos casos en tu empresa.',
   'El hostigamiento sexual tiene su propio procedimiento. Pásala sin demora a quien lleva estos casos en tu empresa.'],
  /* EPP: la declaración del kardex y la amonestación */
  ['Conforme al D.S. N° 005-2012-TR.', 'Conforme al Decreto 522-06 (arts. 5.1.3 y 7.9).'],
  ['Conforme al D.S. Nº 005-2012-TR.', 'Conforme al Decreto 522-06 (arts. 5.1.3 y 7.9).'],
  /* el comité */
  ['Una ordinaria al mes, en día fijado', 'Por lo menos una reunión al mes'],
  ['La constitución, la instalación, las reuniones y los acuerdos van todos al mismo libro',
   'La elección, la instalación, las reuniones y los acuerdos van todos a las actas'],
  ['Este PDF es para imprimirlo y pegarlo en el libro legalizado, o para mandarlo entero.',
   'Las actas se mandan a la Dirección General de Higiene y Seguridad Industrial del Ministerio de Trabajo. Este PDF las junta todas.'],
  ['El Libro de Actas', 'Las actas del comité'],
  ['Descargar el Libro de Actas', 'Descargar las actas de'],
  ['(la mitad más uno, D.S. 005-2012-TR art. 69). ', '. '],
  ['(la mitad más uno, D.S. 005-2012-TR art. 69).', '.'],
  ['de las 12 reuniones ordinarias que exige el D.S. 005-2012-TR art. 68', 'de las 12 reuniones mensuales del año'],
  ['El mandato de los representantes de los trabajadores dura de 1 a 2 años', 'El Manual-Guía no fija cuánto dura el mandato: pon el período que quedó en el acta de elección'],
  ['Los nuevos miembros inician funciones dentro de los 10 días hábiles de terminada la elección.', 'Anota el día en que el comité quedó instalado.'],
  ['N° del Libro de Actas legalizado (opcional)', 'N° de registro del comité (opcional)'],
  ['La ordinaria es una al mes.', 'Se reúne por lo menos una vez al mes.'],
  ['Comité o Subcomité SST', 'Comité Mixto o Coordinador de SST'],
  ['Ley 29783, DS 011-2019 y las demás', 'Decreto 522-06, Res. 04/2007 y las demás'],
  /* los simulacros de INDECI son del Perú */
  ['Es el que convoca INDECI en fechas fijas. Participar deja constancia ante el cliente y ante la autoridad.',
   'Simulacro convocado por la autoridad o por el cliente. Participar deja constancia.'],
  ['Los convoca INDECI. Participar es la forma más barata de tener un simulacro con constancia.',
   'Los convoca la autoridad o el cliente. Participar es la forma más barata de tener un simulacro con constancia.'],
  ['¿Se registró la participación en la plataforma de INDECI?', '¿Se registró la participación ante quien convocó?'],
  ['La Ley 29783 pide ensayar la respuesta ante emergencias; lo que vale en una inspección es el registro de que se hizo, con tiempos y participantes.',
   'Ensayar la respuesta ante emergencias es parte de la prevención; lo que vale en una inspección es el registro de que se hizo, con tiempos y participantes.'],
  /* la inspección de altura */
  ['Se hizo el ATS, el PETAR de altura y el permiso de montaje del andamio.', 'Se hizo el ATS, el permiso de trabajo en altura y el permiso de montaje del andamio.'],
  ['Permiso de trabajo (PETAR)', 'Permiso de trabajo'],
  ['Permisos de trabajo (PETAR)', 'Permisos de trabajo'],
  [' (encima de 1.80 m)', ''],
  [' (por encima de 1.80 m)', ''],
  ['(encima de 1.80 m)', ''],
  ['(por encima de 1.80 m)', ''],
  ['(dirección, distrito, provincia, departamento)', '(dirección, sector, municipio, provincia)'],
  ['(Dirección, distrito, departamento, provincia)', '(Dirección, sector, municipio, provincia)'],
  ['(opcional · CIP, CQP…)', '(opcional · CODIA…)'],
  ['🔎 Traer los datos de SUNAT', '🔎 Traer los datos de la DGII']
];

/* 1b · los EJEMPLOS de los campos (placeholder): nombres, lugares y
   teléfonos de allá. Van SOLO en los placeholders: en un texto de verdad
   «Pérez Quispe» puede ser un trabajador de la obra, y ese nombre no se
   toca nunca. */
var DO_EJEMPLOS = [
  ['Juan Pérez Quispe', 'Juan Pérez Rodríguez'],
  ['Pérez Quispe', 'Pérez Rodríguez'],
  ['Luis Mamani Quispe', 'Luis Martínez Rosario'],
  ['Quispe o 4455', 'Pérez o 4455'],
  ['Proyecto Metro de Lima — Línea 2', 'Torre Residencial — Santo Domingo'],
  ['Proyecto Metro de Lima', 'Torre Residencial Santo Domingo'],
  ['Av. Los Constructores 123, San Miguel, Lima', 'Av. Los Constructores 123, Santo Domingo'],
  ['Constructora Andes · Obra Torre Lima', 'Constructora Caribe · Obra Torre Santo Domingo'],
  ['Soy el nuevo prevencionista de la obra Torre Lima', 'Soy el nuevo prevencionista de la obra Torre Santo Domingo'],
  ['Constructora Los Andes S.A.C.', 'Constructora Caribe S.R.L.'],
  ['Línea 2 del Metro – Ramal 4', 'Torre B – Etapa 2'],
  ['seguridad@constructora.pe', 'seguridad@constructora.com.do'],
  ['999 888 777', '809 555 1234'],
  ['987 654 321', '809 555 1234'],
  ['CIP 123456', 'CODIA 12345'],
  ['RISST 2026', 'Reglamento interno 2026'],
  ['PETS-012', 'PT-012'],
];
function _doEjemplos(v){
  for(var i=0;i<DO_EJEMPLOS.length;i++) if(v.indexOf(DO_EJEMPLOS[i][0]) > -1) v = v.split(DO_EJEMPLOS[i][0]).join(DO_EJEMPLOS[i][1]);
  return v;
}

/* 2 · las citas del Perú. Se marcan primero (con caracteres de uso
   privado, que nadie escribe) y después se resuelven: así una cita
   dominicana escrita a propósito —«Decreto 522-06, art. 7.9»— nunca se
   confunde con una peruana que se está traduciendo. */
var _PE_N = '(?:N[.\\u00B0\\u00BA]*\\s*[\\u00B0\\u00BA]?\\s*)?';
var _PE_DS = '(?:D\\.?\\s?S\\.?\\s*' + _PE_N + ')';
var _PE_RM = '(?:R\\.?\\s?M\\.?\\s*' + _PE_N + ')';
var DO_MARCAS = [
  [new RegExp('(?:la\\s+)?Ley\\s+' + _PE_N + '29783', 'g'), 'L29783', true],
  [new RegExp(_PE_DS + '005-2012-TR', 'g'), 'DS005'],
  [new RegExp(_PE_DS + '011-2019(?:-TR)?', 'g'), 'DS011'],
  [new RegExp(_PE_RM + '050-2013-TR', 'g'), 'RM050'],
  [new RegExp('(?:(?:la\\s+)?[Nn]orma(?:\\s+[Tt]écnica)?\\s+)?G\\.?\\s?050(?:\\s+(?:Seguridad durante la construcción|del RNE))?(?:\\s*\\(RNE\\))?', 'g'), 'G050'],
  [new RegExp(_PE_DS + '003-98-SA', 'g'), 'DS003'],
  [new RegExp('Ley\\s+' + _PE_N + '29733', 'g'), 'L29733'],
  /* la misma ley, ya traducida (26/09/2026): «Law 29733», «Lei 29733», «loi 29733» */
  [new RegExp('(?:Law|Lei|[Ll]oi)\\s+' + _PE_N + '29733', 'g'), 'L29733'],
  [new RegExp(_PE_DS + '016-2024-JUS', 'g'), 'NADA'],
  [new RegExp('D\\.?\\s?L\\.?\\s*' + _PE_N + '1278(?:\\s+Ley de Gestión Integral de Residuos Sólidos)?', 'g'), 'DL1278'],
  [new RegExp(_PE_DS + '014-2017-MINAM', 'g'), 'DS014'],
  [new RegExp(_PE_RM + '021-2016-TR', 'g'), 'RM021'],
  [new RegExp('NTP\\s*\\d{3}\\.\\d{3}(?:-\\d)?(?::\\d{4})?(?:,?\\s*Anexo\\s+[A-Z])?', 'g'), 'NADA'],
  [new RegExp(_PE_RM + '375-2008-TR', 'g'), 'NADA'],
  [new RegExp('RM\\s+375\\b', 'g'), 'NADA'],
  [new RegExp(_PE_DS + '42-F', 'g'), 'NADA'],
  [new RegExp('Ley\\s+' + _PE_N + '28256', 'g'), 'NADA'],
  [new RegExp(_PE_DS + '015-2005-SA', 'g'), 'NADA'],
  [new RegExp(_PE_DS + '021-2008-MTC', 'g'), 'NADA'],
  [new RegExp(_PE_RM + '111-2013-MEM(?:\\/DM)?(?:\\s*\\(RESESATE\\))?', 'g'), 'NADA'],
  [new RegExp('Ley\\s+' + _PE_N + '30222', 'g'), 'NADA'],
  [new RegExp('Ley\\s+' + _PE_N + '31246', 'g'), 'NADA'],
  [new RegExp('C[óo]digo Nacional de Electricidad', 'g'), 'NADA'],
  [new RegExp('Protocolo\\s+002-2016-SUNAFIL\\/INII', 'g'), 'NADA'],
  [new RegExp(_PE_DS + '0(?:24-2016|23-2017|34-2023|43-2007)-EM', 'g'), 'NADA'],
  [new RegExp(_PE_DS + '014-2019-[A-Z]+', 'g'), 'NADA'],
  [new RegExp('art(?:ículo|\\.)\\s*168-A del Código Penal', 'g'), 'NADA']
];
/* lo que dice cada artículo peruano en RD, cuando hay un par verificado */
var DO_ARTS = {
  L29783: { '19':'Decreto 522-06, art. 4.2', '21':'Decreto 522-06, art. 7', '28':'Decreto 522-06, arts. 6.1.3 y 9.6',
            '29':'Manual-Guía del Comité Mixto', '30':'Manual-Guía del Comité Mixto', '31':'Manual-Guía del Comité Mixto',
            '32':'Manual-Guía del Comité Mixto', '49':'Decreto 522-06, art. 6', '50':'Decreto 522-06, art. 7',
            '57':'Decreto 522-06, art. 8.2', '60':'Decreto 522-06, art. 7.9', '63':'Decreto 522-06, arts. 4.3 y 11',
            '79':'Decreto 522-06, art. 5.1.3' },
  DS005:  { '33':'Decreto 522-06, arts. 6.1.3 y 9.6', '30':'Decreto 522-06, art. 9.1',
            '43':'Manual-Guía del Comité Mixto', '44':'Manual-Guía del Comité Mixto', '45':'Manual-Guía del Comité Mixto',
            '51':'Manual-Guía del Comité Mixto', '53':'Manual-Guía del Comité Mixto', '56':'Manual-Guía del Comité Mixto',
            '58':'Manual-Guía del Comité Mixto', '62':'Manual-Guía del Comité Mixto', '68':'Manual-Guía del Comité Mixto',
            '69':'Manual-Guía del Comité Mixto' }
};
var DO_BASE = { L29783:'Decreto 522-06', DS005:'Decreto 522-06', DS011:'Res. 04/2007', G050:'Res. 04/2007',
                RM050:'', DS003:'Ley 87-01', L29733:'Ley 172-13', DL1278:'Ley 225-20', DS014:'Decreto 320-21',
                RM021:'Res. 04/2007, 1.20', NADA:'' };
var _M0 = '', _M1 = '';
/* el artículo que sigue a la cita: «, art. 30», «art. 22.1.b y 23»,
   «Art. 35», «arts. 29 a 35 y 42», «art. 2, inciso 2.3, literal c» */
var _DO_LETRA = '(?:\\.?[a-z]\\b|\\s[a-z](?=\\s*(?:$|[·;,)])))?(?:\\s*[a-z]\\))?';
var _DO_ART = '(?:,?\\s*(?:[Aa]rts?\\.?|[Aa]rt[íi]culos?)\\s*\\d+[\\u00B0\\u00BA]?(?:\\.\\d+)*' + _DO_LETRA +
              '(?:\\s*\\([a-z][–-][a-z]\\))?(?:,?\\s*(?:inciso|inc\\.|literal|lit\\.|numerales?)\\s*[\\d.]*[a-z]?(?:\\s+y\\s+[\\d.]+)?)*' +
              '(?:(?:\\s*,\\s*|\\s+y\\s+|\\s+a\\s+)\\d+(?:\\.\\d+)*' + _DO_LETRA + ')*)?';
var _DO_MARCA_ART = new RegExp(_M0 + '([A-Z0-9]+)' + _M1 + '(' + _DO_ART + ')', 'g');
var _DO_ART_ANTES = new RegExp('(\\b(?:[Ee]l|[Aa]l)\\s+)?[Aa]rt(?:ículo|\\.)\\s*(\\d+)[\\u00B0\\u00BA]?(?:\\s*(?:lit\\.|literal|inc\\.)\\s*[a-z])?\\s+de\\s+(?:la\\s+)?' + _M0 + '(L29783|DS005)' + _M1, 'g');

function _doCita(cod, art){
  var base = (DO_BASE[cod] !== undefined) ? DO_BASE[cod] : '';
  if(!base) return '';
  var tabla = DO_ARTS[cod];
  if(tabla && art){
    /* «arts. 29 a 35 y 42»: si todos dicen lo mismo en RD, eso; si no,
       la norma entera. Nunca se elige uno al azar. */
    var nums = String(art).replace(/\.\d+/g, '').match(/\d+/g) || [], out = null;
    for(var i=0;i<nums.length;i++){
      var t = tabla[nums[i]] || base;
      if(out === null) out = t; else if(out !== t) return base;
    }
    if(out) return out;
  }
  return base;
}

/* 3 · palabras sueltas: instituciones, documentos, siglas del Perú */
var _L = 'A-Za-z\\u00C0-\\u00FF';
function _pal(p, f){ return new RegExp('(^|[^' + _L + '0-9])' + p + '(?![' + _L + '0-9])', f || 'g'); }
var DO_PALABRAS = [
  /* el documento de la persona */
  [_pal('DNI o carné de extranjería'), '$1Cédula o pasaporte'],
  [_pal('[Cc]arné de extranjería'), function(m, a){ return a + (m.charAt(a.length) === 'C' ? 'Pasaporte' : 'pasaporte'); }],
  [_pal('los DNI'), '$1las cédulas'],
  [_pal('Los DNI'), '$1Las cédulas'],
  [_pal('del DNI'), '$1de la cédula'],
  [_pal('al DNI'), '$1a la cédula'],
  [_pal('el DNI'), '$1la cédula'],
  [_pal('El DNI'), '$1La cédula'],
  [_pal('un DNI'), '$1una cédula'],
  [_pal('Un DNI'), '$1Una cédula'],
  [_pal('DNI'), function(m, a, off, s){
    /* a principio de frase o de etiqueta, con mayúscula */
    var antes = s.slice(0, off + a.length).replace(/\s+$/, '');
    var inicio = !antes || /[.:·|(\-—–\n]$/.test(antes) || /^[\s·•\-—]*$/.test(antes);
    return a + (inicio ? 'Cédula' : 'cédula'); }],
  [_pal('RUC'), '$1RNC'],
  [_pal('de SUNAT'), '$1de la DGII'],
  [_pal('a SUNAT'), '$1a la DGII'],
  [_pal('SUNAT'), '$1DGII'],
  /* las instituciones */
  [/Ministerio de Trabajo y Promoción del Empleo/g, 'Ministerio de Trabajo'],
  [_pal('MTPE'), '$1Ministerio de Trabajo'],
  [_pal('SUNAFIL'), '$1la inspección de trabajo'],
  [_pal('INDECI'), '$1Defensa Civil'],
  [/Seguro Complementario de Trabajo de Riesgo/g, 'Seguro de Riesgos Laborales'],
  [_pal('SCTR'), '$1Seguro de Riesgos Laborales'],
  /* el comité y el supervisor de SST: en RD, Comité Mixto y Coordinador */
  [/Sub-?comit[ée] de Seguridad y Salud en el Trabajo/g, 'Comité Mixto de Seguridad y Salud en el Trabajo'],
  [/Sub-?comit[ée] de SST/g, 'Comité Mixto de SST'],
  [/sub-?comit[ée] de SST/g, 'comité mixto de SST'],
  [_pal('[Ss]ub-?comit[ée]s?'), function(m, a){ var w = m.slice(a.length); return a + (w.charAt(0) === 'S' ? 'Comité' : 'comité') + (/s$/.test(w) ? 's' : ''); }],
  [/Comité de Seguridad y Salud en el Trabajo/g, 'Comité Mixto de Seguridad y Salud en el Trabajo'],
  [/Comité de SST/g, 'Comité Mixto de SST'],
  [/[Cc]omité paritario/g, function(m){ return m.charAt(0) + 'omité mixto'; }],
  [/Supervisor de Seguridad y Salud en el Trabajo/g, 'Coordinador de Seguridad y Salud en el Trabajo'],
  [/Supervisor de SST/g, 'Coordinador de SST'],
  [/supervisor de SST/g, 'coordinador de SST'],
  [/Supervisores de SST/g, 'Coordinadores de SST'],
  [/Cartel del supervisor SST/g, 'Cartel del coordinador de SST'],
  /* los documentos con sigla peruana */
  [/Reglamento Interno de Seguridad y Salud en el Trabajo \(RISST\)/g, 'Reglamento Interno de Seguridad y Salud en el Trabajo'],
  [_pal('QR del RISST'), '$1QR del reglamento interno'],
  [_pal('el RISST'), '$1el reglamento interno de SST'],
  [_pal('El RISST'), '$1El reglamento interno de SST'],
  [_pal('del RISST'), '$1del reglamento interno de SST'],
  [_pal('su RISST'), '$1su reglamento interno de SST'],
  [_pal('Tu RISST'), '$1Tu reglamento interno de SST'],
  [_pal('tu RISST'), '$1tu reglamento interno de SST'],
  [_pal('un RISST'), '$1un reglamento interno de SST'],
  [_pal('RISST'), '$1Reglamento interno de SST'],
  [/\(PETAR\)/g, ''],
  [_pal('PETAR emitidos'), '$1Permisos de trabajo emitidos'],
  [_pal('el PETAR'), '$1el permiso de trabajo'],
  [_pal('El PETAR'), '$1El permiso de trabajo'],
  [_pal('Un PETAR'), '$1Un permiso de trabajo'],
  [_pal('un PETAR'), '$1un permiso de trabajo'],
  [_pal('con PETAR'), '$1con permiso de trabajo'],
  [_pal('PETAR'), '$1permiso de trabajo'],
  [_pal('QR de PETS'), '$1QR de procedimientos'],
  [_pal('los PETS'), '$1los procedimientos de trabajo'],
  [_pal('Los PETS'), '$1Los procedimientos de trabajo'],
  [_pal('un PETS'), '$1un procedimiento de trabajo'],
  [_pal('sin PETS'), '$1sin procedimiento escrito'],
  [_pal('PETS'), '$1Procedimientos de trabajo'],
  [_pal('QR de IPERC'), '$1QR de la matriz de riesgos'],
  [/[Mm]atriz IPERC/g, function(m){ return m.charAt(0) + 'atriz de riesgos'; }],
  [_pal('e IPERC(?!\\s+[Cc]ontinuo)'), '$1y la matriz de riesgos'],
  [_pal('del IPERC(?!\\s+[Cc]ontinuo)'), '$1de la matriz de riesgos'],
  [_pal('al IPERC(?!\\s+[Cc]ontinuo)'), '$1a la matriz de riesgos'],
  [_pal('el IPERC(?!\\s+[Cc]ontinuo)'), '$1la matriz de riesgos'],
  [_pal('El IPERC(?!\\s+[Cc]ontinuo)'), '$1La matriz de riesgos'],
  [_pal('un IPERC(?!\\s+[Cc]ontinuo)'), '$1una matriz de riesgos'],
  /* 26/09/2026 · «¿Borrar este IPERC?» decía «este matriz de riesgos» */
  [_pal('este IPERC(?!\\s+[Cc]ontinuo)'), '$1esta matriz de riesgos'],
  [_pal('Este IPERC(?!\\s+[Cc]ontinuo)'), '$1Esta matriz de riesgos'],
  [_pal('cada IPERC(?!\\s+[Cc]ontinuo)'), '$1cada matriz de riesgos'],
  [_pal('IPERC'), function(m, a, off, s){
    if(/^\s*continuo/.test(s.slice(off + m.length))) return m;
    var antes = s.slice(0, off + a.length).replace(/\s+$/, '');
    var inicio = !antes || /[.:·|(\-—–\n]$/.test(antes);
    return a + (inicio ? 'Matriz de riesgos' : 'matriz de riesgos'); }],
  /* la altura que es del Perú */
  [/(sobre|por encima de|encima de|a más de)\s+1[.,]80\s*m(?:etros)?(?![0-9])/g, 'en altura']
];

/* 4 · la limpieza de lo que queda después de sacar citas. Solo corre
   cuando alguna cita se fue sin reemplazo: el resto del texto de la app
   queda tal cual lo escribió quien lo escribió. */
var DO_LIMPIEZA = [
  [/\(\s*(?:[·;,y]\s*)*\)/g, ''],
  [/\(\s*[·;,]\s*/g, '('],
  [/\s*[·;,]\s*\)/g, ')'],
  [/(?:\s*·\s*){2,}/g, ' · '],
  [/(?:\s*;\s*){2,}/g, '; '],
  [/^\s*[·;,]\s*/, ''],
  [/\s*[·;,]\s*$/, ''],
  /* 26/09/2026 · también antes de la coma: «Los once temas mínimos del,
     el reglamento…» quedaba así cuando se iba la cita peruana */
  [/\s+(?:de la|del|de|según(?: el| la)?|conforme a(?:l| la)?)\s*(?=[.,;:)]|$)/g, ''],
  [/([^\s(])[ \t]+([.,;:)])(?![0-9])/g, '$1$2'],
  [/[ \t]{2,}/g, ' '],
  [/^[ \t]+|[ \t]+$/g, '']
];

function _doMarcar(s){
  for(var i=0;i<DO_MARCAS.length;i++){
    var r = DO_MARCAS[i];
    if(r[2]){
      /* «la Ley 29783» deja «la» marcada, porque «el Decreto» la cambia */
      s = s.replace(r[0], function(m){ return (/^la\s/.test(m) ? 'la ' : '') + _M0 + r[1] + _M1; });
    } else {
      s = s.replace(r[0], _M0 + r[1] + _M1);
    }
  }
  return s;
}
function _doResolver(s, cita){
  /* la cita de allá: la de RD por defecto; los otros países traen la suya */
  cita = cita || _doCita;
  /* «Art. 35 de la Ley 29783» */
  s = s.replace(_DO_ART_ANTES, function(m, pre, art, cod){
    var t = cita(cod, art);
    if(t) return (pre || '') + t;
    /* sin par: «el art. 35 de la Ley 29783» es «la norma», con su artículo */
    var P = String(pre || '').trim();
    return P === 'al' ? 'a la norma' : P === 'Al' ? 'A la norma' : P === 'El' ? 'La norma' : 'la norma';
  });
  /* la cita con su artículo detrás */
  s = s.replace(_DO_MARCA_ART, function(m, cod, art){ return _M0 + '=' + cita(cod, art) + _M1; });
  /* los artículos: «la [Decreto]» → «el Decreto», «de la» → «del», «a la» → «al» */
  s = s.replace(new RegExp('(^|[^' + _L + '])([Dd]e|[Aa]|[Pp]or|[Ee]n|[Cc]on|[Ss]egún|[Yy]|[Oo])?(\\s*)la\\s+' + _M0 + '=([^' + _M1 + ']*)' + _M1, 'g'),
    function(m, a, prep, esp, txt){
      if(!txt) return a + (prep ? prep + esp : '');
      var masc = /^(Decreto|Manual)/.test(txt);
      if(!masc) return a + (prep ? prep + esp : '') + 'la ' + txt;
      if(prep && /^de$/i.test(prep)) return a + prep.charAt(0) + 'el ' + txt;
      if(prep && /^a$/i.test(prep)) return a + prep.charAt(0) + 'l ' + txt;
      return a + (prep ? prep + esp : '') + 'el ' + txt;
    });
  s = s.replace(new RegExp('(^|[^' + _L + '])La\\s+' + _M0 + '=([^' + _M1 + ']*)' + _M1, 'g'), function(m, a, txt){
    if(!txt) return a;
    return a + (/^(Decreto|Manual)/.test(txt) ? 'El ' : 'La ') + txt;
  });
  s = s.replace(new RegExp(_M0 + '=([^' + _M1 + ']*)' + _M1, 'g'), '$1');
  /* las que quedaron sin artículo detrás (no deberían, pero por si acaso) */
  s = s.replace(new RegExp(_M0 + '([A-Z0-9]+)' + _M1, 'g'), function(m, cod){ return cita(cod, ''); });
  /* «el D.S. 011-2019-TR» es «la Res. 04/2007»; «el D.L. 1278», «la Ley 225-20» */
  s = s.replace(new RegExp('(^|[^' + _L + '])(el|El|del|al)\\s+((?:Res\\.|Ley) [0-9])', 'g'), function(m, a, art, t){
    var r = { el:'la', El:'La', del:'de la', al:'a la' }[art];
    return a + r + ' ' + t;
  });
  /* la general junto a la específica: se queda la específica */
  s = s.replace(/(Res\. 04\/2007|Decreto 522-06)(?![,0-9])\s*(?:·|;|,|\sy)\s*(\1, (?:arts?\. )?[0-9][0-9.]*(?: y [0-9.]+)?)/g, '$2');
  s = s.replace(/(Res\. 04\/2007|Decreto 522-06)(, (?:arts?\. )?[0-9][0-9.]*(?: y [0-9.]+)?)\s*(?:·|;|,|\sy)\s*\1(?![,0-9])/g, '$1$2');
  /* la misma cita dos veces seguidas: «Decreto 522-06 · Decreto 522-06» */
  s = s.replace(/((?:Decreto 522-06|Res\. 04\/2007|Ley 225-20|Ley 87-01|Ley 172-13|Manual-Guía del Comité Mixto)(?:, (?:arts?\.) [0-9.]+(?: y [0-9.]+)?)?)(?:\s*(?:·|;|,|\sy)\s*\1(?![0-9.,]))+/g, '$1');
  s = s.replace(/(Decreto 522-06)(?:\s*(?:·|;|,|\sy)\s*Decreto 522-06(?!,))+/g, '$1');
  s = s.replace(/((?:al |el |del )?(Decreto 522-06|Res\. 04\/2007))(?![,0-9])\s+y\s+(?:al |el |del |la |a la |de la )?\2(?![,0-9])/g, '$1');
  /* «conforme al», «según el», «por el» colgando sin nada */
  s = s.replace(/\s+(?:según(?: el| la)?|conforme a(?:l| la)?|por el|y al|y a la|y el)\s*(?=[.;:)]|$)/g, '');
  return s;
}

/* ¿vale la pena pasarlo por la capa? (la mayoría del texto no tiene nada) */
/* 07/10/2026 · «mismo libro», «libro legalizado», «dura de 1 a 2 años» y «10 días hábiles de terminada»: cuatro frases
   del comité que DO_FRASES ya tenía escritas para RD y que nunca se cambiaban, porque su renglón no trae ninguna de
   las otras palabras (la cita va en su propio <span>): allá se seguía leyendo el mandato «de 1 a 2 años» del Perú. */
var _DO_HAY = /\+51\b|29783|27942|005-2012|011-2019|050-2013|G\.?\s?050|003-98|29733|016-2024|1278|014-2017|021-2016|NTP|375|42-F|28256|015-2005|021-2008|111-2013|30222|31246|Electricidad|SUNAFIL|SUNAT|MTPE|Promoción del Empleo|INDECI|SCTR|Complementario|DNI|RUC|[Cc]arné de extranjería|RISST|PETAR|PETS|IPERC|[Ss]ub-?comit|Comité de S|[Cc]omité paritario|[Ss]upervisor(?:es)? de S|supervisor SST|1[.,]80|Quispe|Mamani|Lima|Andes|constructora\.pe|999 888 777|987 654 321|distrito|CIP|SAMU|Perú|168-A|Libro de Actas|mitad más uno|ordinaria|Nº 005|N° 005|mismo libro|libro legalizado|dura de 1 a 2 años|10 días hábiles de terminada|S\/\s?\d/;

function txDO(s){
  if(s == null) return s;
  s = String(s);
  if(!_DO_HAY.test(s)) return s;
  var i;
  for(i=0;i<DO_FRASES.length;i++){
    if(s.indexOf(DO_FRASES[i][0]) > -1) s = s.split(DO_FRASES[i][0]).join(DO_FRASES[i][1]);
  }
  var marcado = _doMarcar(s);
  var vacio = new RegExp(_M0 + '(?:NADA|RM050)' + _M1).test(marcado) ||
              new RegExp('\\(PETAR\\)').test(marcado);
  s = _doResolver(marcado);
  for(i=0;i<DO_PALABRAS.length;i++) s = s.replace(DO_PALABRAS[i][0], DO_PALABRAS[i][1]);
  /* los precios: con obra dominicana, los planes ya traen el monto en
     dólares (paisAplicarCambios); acá solo se cambia el símbolo */
  if(pagoEnDolares()) s = s.replace(/S\/\s?(?=\d)/g, 'US$ ');
  if(vacio) for(i=0;i<DO_LIMPIEZA.length;i++) s = s.replace(DO_LIMPIEZA[i][0], DO_LIMPIEZA[i][1]);
  return s;
}
/* jsPDF recibe texto o listas de texto */
function _txDOTodo(v){
  if(typeof v === 'string') return txCapa(v);
  if(Array.isArray(v)) return v.map(function(x){ return (typeof x === 'string') ? txCapa(x) : x; });
  return v;
}
var ACC_AVISO = {
  pe: { clases:{ mortal:1 }, et:'Ya se avisó al MTPE',
        sub:'Los accidentes mortales y los incidentes peligrosos se notifican al Ministerio de Trabajo dentro de las 24 horas. Marca cuando esté hecho.',
        nota:' Recuerda: el aviso al MTPE es dentro de las 24 horas.', fila:'Aviso al MTPE',
        pend:'PENDIENTE — es dentro de 24 horas', col:'Aviso MTPE' },
  'do': { clases:{ leve:1, incap:1, mortal:1 }, et:'Ya se avisó al IDOPPRIL (ATR-2)',
        sub:'Todo accidente de trabajo se notifica al IDOPPRIL con el formulario ATR-2 dentro de las 72 horas hábiles: en su web, en una oficina o por teléfono. Marca cuando esté hecho.',
        nota:' Recuerda: el aviso al IDOPPRIL (ATR-2) es dentro de las 72 horas hábiles.', fila:'Aviso al IDOPPRIL (ATR-2)',
        pend:'PENDIENTE — dentro de las 72 horas hábiles', col:'Aviso IDOPPRIL (ATR-2)' }
};
function accAviso(){ var p = paisCapa(); return (p && ACC_AVISO[p]) ? ACC_AVISO[p] : ACC_AVISO.pe; }
var _SIGLA_SUNAT = { 'do':'DGII', cl:'SII', co:'DIAN', ar:'ARCA', uy:'DGI', py:'DNIT', mx:'SAT', us:'IRS', ca:'CRA' };
var OT_NOMBRE = { cl:'Chile', co:'Colombia', ar:'Argentina',
                  /* 26/09/2026 · fuentes en paises-fuente/nuevos/ */
                  uy:'Uruguay', py:'Paraguay', mx:'México', us:'Estados Unidos', ca:'Canadá' };

/* ── el aviso del accidente (verificado en la fuente oficial) ─────────
   Chile: DIAT al organismo administrador (la mutual o el ISL) dentro de
     24 horas (D.S. 101, art. 71); si es grave o fatal, se suspende la
     faena y se avisa de inmediato a la Inspección del Trabajo y a la
     SEREMI de Salud (Ley 16.744, art. 76; Compendio SUSESO).
   Colombia: FURAT a la ARL y a la EPS dentro de 2 días hábiles; el grave
     y el mortal, también a la Dirección Territorial del Ministerio del
     Trabajo (Decreto Ley 1295 de 1994, art. 62; Res. 156 de 2005; Res.
     1401 de 2007: se investiga dentro de 15 días).
   Argentina: todo accidente, con o sin baja, se denuncia a la ART de
     inmediato; los datos del Modelo C, dentro de 48 horas, con copia al
     trabajador (Res. SRT 525/15, arts. 4.1 y 4.4). */
(function(){
  if(typeof ACC_AVISO !== 'object') return;
  ACC_AVISO.cl = { clases:{ leve:1, incap:1, mortal:1 }, et:'Ya se hizo la DIAT (mutual o ISL)',
    sub:'Todo accidente del trabajo se denuncia al organismo administrador —la mutual o el ISL— con la DIAT dentro de las 24 horas. Si es grave o fatal, además se suspende la faena y se avisa de inmediato a la Inspección del Trabajo y a la SEREMI de Salud. Marca cuando esté hecho.',
    nota:' Recuerda: la DIAT va a la mutual o al ISL dentro de las 24 horas.', fila:'DIAT a la mutual o al ISL',
    pend:'PENDIENTE — dentro de las 24 horas', col:'DIAT (mutual o ISL)' };
  ACC_AVISO.co = { clases:{ leve:1, incap:1, mortal:1 }, et:'Ya se reportó a la ARL y a la EPS (FURAT)',
    sub:'Todo accidente de trabajo se reporta a la ARL y a la EPS con el FURAT dentro de los 2 días hábiles. Si es grave o mortal, también a la Dirección Territorial del Ministerio del Trabajo, en el mismo plazo. Marca cuando esté hecho.',
    nota:' Recuerda: el FURAT va a la ARL y a la EPS dentro de los 2 días hábiles.', fila:'Reporte a la ARL y a la EPS (FURAT)',
    pend:'PENDIENTE — dentro de los 2 días hábiles', col:'Reporte ARL y EPS (FURAT)' };
  /* 26/09/2026 · Uruguay: denuncia al BSE en 72 horas (Montevideo) o 5
     días hábiles (interior), Ley 16.074, art. 48. Paraguay: al IPS en 8
     días (IPS). México: aviso a la STPS en 72 horas por el SIAAT (LFT
     art. 504; RFSST arts. 7, 76 y 77); el ST-7 del IMSS, lo antes
     posible. Estados Unidos: a OSHA, la muerte en 8 horas y la
     hospitalización, amputación o pérdida de un ojo en 24 (29 CFR
     1904.39). Canadá: según la provincia (Ontario OHSA s. 51; Quebec
     LSST art. 62). */
  ACC_AVISO.uy = { clases:{ leve:1, incap:1, mortal:1 }, et:'Ya se denunció al BSE',
    sub:'Todo accidente de trabajo se denuncia al Banco de Seguros del Estado (BSE), con su formulario web: dentro de las 72 horas en Montevideo y de los 5 días hábiles en el resto del país. Marca cuando esté hecho.',
    nota:' Recuerda: la denuncia al BSE va dentro de las 72 horas en Montevideo (5 días hábiles en el interior).', fila:'Denuncia al BSE',
    pend:'PENDIENTE — 72 horas (Montevideo) o 5 días hábiles', col:'Denuncia al BSE' };
  ACC_AVISO.py = { clases:{ leve:1, incap:1, mortal:1 }, et:'Ya se comunicó al IPS',
    sub:'El accidente de trabajo se comunica al IPS dentro de los 8 días, con los papeles que prueban que el trabajador depende de la empresa. Marca cuando esté hecho.',
    nota:' Recuerda: la comunicación al IPS va dentro de los 8 días.', fila:'Comunicación al IPS',
    pend:'PENDIENTE — dentro de los 8 días', col:'Comunicación al IPS' };
  ACC_AVISO.mx = { clases:{ leve:1, incap:1, mortal:1 }, et:'Ya se dio aviso a la STPS (SIAAT)',
    sub:'Todo accidente de trabajo se avisa por escrito a la STPS dentro de las 72 horas, por el SIAAT (siaat.stps.gob.mx), abierto las 24 horas. Para las prestaciones del IMSS, el aviso ST-7 se tramita lo antes posible. Marca cuando esté hecho.',
    nota:' Recuerda: el aviso a la STPS va dentro de las 72 horas, por el SIAAT.', fila:'Aviso a la STPS (SIAAT)',
    pend:'PENDIENTE — dentro de las 72 horas', col:'Aviso a la STPS (SIAAT)' };
  ACC_AVISO.us = { clases:{ incap:1, mortal:1 }, et:'Ya se reportó a OSHA',
    sub:'La muerte de un trabajador se reporta a OSHA dentro de las 8 horas; una hospitalización, una amputación o la pérdida de un ojo, dentro de las 24 horas: por teléfono a la oficina de área, al 1-800-321-6742 o en la web de OSHA. Marca cuando esté hecho.',
    nota:' Recuerda: a OSHA, la muerte dentro de las 8 horas; la hospitalización, la amputación o la pérdida de un ojo, dentro de las 24.', fila:'Reporte a OSHA',
    pend:'PENDIENTE — 8 horas (muerte) o 24 (hospitalización)', col:'Reporte a OSHA' };
  ACC_AVISO.ca = { clases:{ incap:1, mortal:1 }, et:'Ya se avisó al organismo de la provincia',
    sub:'Depende de la provincia. En Ontario, la muerte o una lesión grave se avisa de inmediato a un inspector del Ministerio de Trabajo (1-877-202-0008) y se manda un informe escrito dentro de las 48 horas. En Quebec, se avisa a la CNESST por el medio más rápido y se manda un informe escrito dentro de las 24 horas. En las demás provincias, según su ley. Marca cuando esté hecho.',
    nota:' Recuerda: la muerte o la lesión grave se avisa de inmediato al organismo de la provincia.', fila:'Aviso al organismo de la provincia',
    pend:'PENDIENTE — de inmediato', col:'Aviso a la provincia' };
  ACC_AVISO.ar = { clases:{ leve:1, incap:1, mortal:1 }, et:'Ya se denunció a la ART',
    sub:'Todo accidente de trabajo, con o sin baja, se denuncia a la ART de inmediato; los datos completos (Modelo C), dentro de las 48 horas, con copia al trabajador. Marca cuando esté hecho.',
    nota:' Recuerda: la denuncia a la ART es inmediata, con los datos completos dentro de las 48 horas.', fila:'Denuncia a la ART',
    pend:'PENDIENTE — de inmediato (datos en 48 horas)', col:'Denuncia a la ART' };
})();
var OT_ACC_MORTAL = {
  cl:'Se suspende la faena y se avisa de inmediato a la Inspección del Trabajo y a la SEREMI de Salud; la DIAT va a la mutual o al ISL dentro de las 24 horas. En las estadísticas se cargan 6000 días.',
  co:'Se reporta a la ARL, a la EPS y a la Dirección Territorial del Ministerio del Trabajo dentro de los 2 días hábiles, y se investiga dentro de los 15 días. En las estadísticas se cargan 6000 días.',
  ar:'Se denuncia a la ART de inmediato, como todo accidente de trabajo (datos completos en 48 horas). En las estadísticas se cargan 6000 días.',
  uy:'Se denuncia al BSE dentro de las 72 horas en Montevideo (5 días hábiles en el interior). En las estadísticas se cargan 6000 días.',
  py:'Se comunica al IPS dentro de los 8 días. En las estadísticas se cargan 6000 días.',
  mx:'Se avisa a la STPS dentro de las 72 horas, por el SIAAT. En las estadísticas se cargan 6000 días.',
  us:'Se reporta a OSHA dentro de las 8 horas. En las estadísticas se cargan 6000 días.',
  ca:'Se avisa de inmediato al organismo de seguridad y salud de la provincia (en Ontario, con informe escrito en 48 horas; en Quebec, en 24). En las estadísticas se cargan 6000 días.'
};
/* la cabecera de las inspecciones: la base de allá está en la biblioteca */
function otInspNorma(p){ return 'Las normas ' + (OBRA_PAIS_DE[p] || '') + ' están en la biblioteca de la app.'; }

/* ── los placeholders (ejemplos inventados, con la forma de allá) ───── */
var OT_PH = {
  cl: { 'r-doc':'12.345.678-5', 'ac-doc':'12.345.678-5', 'tal-dni':'12.345.678-5', 'id-quien':'12.345.678-5', 'em-ruc':'76.123.456-0', 'cm-dni':'RUN' },
  co: { 'r-doc':'1023456789', 'ac-doc':'1023456789', 'tal-dni':'1023456789', 'id-quien':'1023456789', 'em-ruc':'900.123.456-8', 'cm-dni':'Cédula' },
  ar: { 'r-doc':'30123456', 'ac-doc':'30123456', 'tal-dni':'30123456', 'id-quien':'30123456', 'em-ruc':'30-71234567-1', 'cm-dni':'DNI' },
  uy: { 'r-doc':'45678901', 'ac-doc':'45678901', 'tal-dni':'45678901', 'id-quien':'45678901', 'em-ruc':'211234560012', 'cm-dni':'Cédula' },
  py: { 'r-doc':'4567890', 'ac-doc':'4567890', 'tal-dni':'4567890', 'id-quien':'4567890', 'em-ruc':'80012345-6', 'cm-dni':'Cédula' },
  mx: { 'r-doc':'PEGJ850101HDFRRN09', 'ac-doc':'PEGJ850101HDFRRN09', 'tal-dni':'PEGJ850101HDFRRN09', 'id-quien':'PEGJ850101HDFRRN09', 'em-ruc':'CAN120101AB1', 'cm-dni':'CURP' },
  us: { 'r-doc':'A1234567', 'ac-doc':'A1234567', 'tal-dni':'A1234567', 'id-quien':'A1234567', 'em-ruc':'12-3456789', 'cm-dni':'ID' },
  ca: { 'r-doc':'A1234567', 'ac-doc':'A1234567', 'tal-dni':'A1234567', 'id-quien':'A1234567', 'em-ruc':'123456789', 'cm-dni':'ID' }
};
var OT_EJEMPLOS = {
  cl: [['Juan Pérez Quispe','Juan Pérez González'],['Pérez Quispe','Pérez González'],['Luis Mamani Quispe','Luis Muñoz Rojas'],
       ['Quispe o 4455','Pérez o 4455'],['Proyecto Metro de Lima — Línea 2','Edificio Los Aromos — Santiago'],['Proyecto Metro de Lima','Edificio Los Aromos'],
       ['Av. Los Constructores 123, San Miguel, Lima','Av. Los Constructores 123, Ñuñoa, Santiago'],['Constructora Andes · Obra Torre Lima','Constructora Cordillera · Obra Torre Santiago'],
       ['Soy el nuevo prevencionista de la obra Torre Lima','Soy el nuevo prevencionista de la obra Torre Santiago'],['Constructora Los Andes S.A.C.','Constructora Cordillera SpA'],
       ['Línea 2 del Metro – Ramal 4','Torre B – Etapa 2'],['seguridad@constructora.pe','seguridad@constructora.cl'],
       ['999 888 777','9 1234 5678'],['987 654 321','9 1234 5678'],['CIP 123456','Registro 12345'],['RISST 2026','Reglamento interno 2026'],['PETS-012','PT-012']],
  co: [['Juan Pérez Quispe','Juan Pérez Gómez'],['Pérez Quispe','Pérez Gómez'],['Luis Mamani Quispe','Luis Martínez Rojas'],
       ['Quispe o 4455','Pérez o 4455'],['Proyecto Metro de Lima — Línea 2','Torre Residencial — Bogotá'],['Proyecto Metro de Lima','Torre Residencial Bogotá'],
       ['Av. Los Constructores 123, San Miguel, Lima','Calle 100 # 12-34, Bogotá'],['Constructora Andes · Obra Torre Lima','Constructora Andina · Obra Torre Bogotá'],
       ['Soy el nuevo prevencionista de la obra Torre Lima','Soy el nuevo prevencionista de la obra Torre Bogotá'],['Constructora Los Andes S.A.C.','Constructora Andina S.A.S.'],
       ['Línea 2 del Metro – Ramal 4','Torre B – Etapa 2'],['seguridad@constructora.pe','seguridad@constructora.com.co'],
       ['999 888 777','300 123 4567'],['987 654 321','300 123 4567'],['CIP 123456','Matrícula 12345'],['RISST 2026','Reglamento interno 2026'],['PETS-012','PT-012']],
  ar: [['Juan Pérez Quispe','Juan Pérez Fernández'],['Pérez Quispe','Pérez Fernández'],['Luis Mamani Quispe','Luis Gómez Sosa'],
       ['Quispe o 4455','Pérez o 4455'],['Proyecto Metro de Lima — Línea 2','Torre Palermo — Buenos Aires'],['Proyecto Metro de Lima','Torre Palermo'],
       ['Av. Los Constructores 123, San Miguel, Lima','Av. Los Constructores 123, Palermo, Buenos Aires'],['Constructora Andes · Obra Torre Lima','Constructora del Plata · Obra Torre Palermo'],
       ['Soy el nuevo prevencionista de la obra Torre Lima','Soy el nuevo prevencionista de la obra Torre Palermo'],['Constructora Los Andes S.A.C.','Constructora del Plata S.A.'],
       ['Línea 2 del Metro – Ramal 4','Torre B – Etapa 2'],['seguridad@constructora.pe','seguridad@constructora.com.ar'],
       ['999 888 777','11 2345 6789'],['987 654 321','11 2345 6789'],['CIP 123456','Matrícula 12345'],['RISST 2026','Reglamento interno 2026'],['PETS-012','PT-012']],
  uy: [['Juan Pérez Quispe','Juan Pérez Rodríguez'],['Pérez Quispe','Pérez Rodríguez'],['Luis Mamani Quispe','Luis Silva Méndez'],
       ['Quispe o 4455','Pérez o 4455'],['Proyecto Metro de Lima — Línea 2','Torre Pocitos — Montevideo'],['Proyecto Metro de Lima','Torre Pocitos'],
       ['Av. Los Constructores 123, San Miguel, Lima','Av. Italia 1234, Montevideo'],['Constructora Andes · Obra Torre Lima','Constructora Oriental · Obra Torre Pocitos'],
       ['Soy el nuevo prevencionista de la obra Torre Lima','Soy el nuevo prevencionista de la obra Torre Pocitos'],['Constructora Los Andes S.A.C.','Constructora Oriental S.A.'],
       ['Línea 2 del Metro – Ramal 4','Torre B – Etapa 2'],['seguridad@constructora.pe','seguridad@constructora.com.uy'],
       ['999 888 777','+598 99 123 456'],['987 654 321','+598 99 123 456'],['CIP 123456','Registro 12345'],['RISST 2026','Reglamento interno 2026'],['PETS-012','PT-012']],
  py: [['Juan Pérez Quispe','Juan Pérez Benítez'],['Pérez Quispe','Pérez Benítez'],['Luis Mamani Quispe','Luis González Ramírez'],
       ['Quispe o 4455','Pérez o 4455'],['Proyecto Metro de Lima — Línea 2','Torre Asunción — Asunción'],['Proyecto Metro de Lima','Torre Asunción'],
       ['Av. Los Constructores 123, San Miguel, Lima','Av. Mariscal López 1234, Asunción'],['Constructora Andes · Obra Torre Lima','Constructora Guaraní · Obra Torre Asunción'],
       ['Soy el nuevo prevencionista de la obra Torre Lima','Soy el nuevo prevencionista de la obra Torre Asunción'],['Constructora Los Andes S.A.C.','Constructora Guaraní S.A.'],
       ['Línea 2 del Metro – Ramal 4','Torre B – Etapa 2'],['seguridad@constructora.pe','seguridad@constructora.com.py'],
       ['999 888 777','+595 981 123 456'],['987 654 321','+595 981 123 456'],['CIP 123456','Registro 12345'],['RISST 2026','Reglamento interno 2026'],['PETS-012','PT-012']],
  mx: [['Juan Pérez Quispe','Juan Pérez Hernández'],['Pérez Quispe','Pérez Hernández'],['Luis Mamani Quispe','Luis García López'],
       ['Quispe o 4455','Pérez o 4455'],['Proyecto Metro de Lima — Línea 2','Torre Reforma — Ciudad de México'],['Proyecto Metro de Lima','Torre Reforma'],
       ['Av. Los Constructores 123, San Miguel, Lima','Av. Insurgentes Sur 1234, Ciudad de México'],['Constructora Andes · Obra Torre Lima','Constructora del Valle · Obra Torre Reforma'],
       ['Soy el nuevo prevencionista de la obra Torre Lima','Soy el nuevo prevencionista de la obra Torre Reforma'],['Constructora Los Andes S.A.C.','Constructora del Valle S.A. de C.V.'],
       ['Línea 2 del Metro – Ramal 4','Torre B – Etapa 2'],['seguridad@constructora.pe','seguridad@constructora.com.mx'],
       ['999 888 777','+52 55 1234 5678'],['987 654 321','+52 55 1234 5678'],['CIP 123456','Cédula profesional 1234567'],['RISST 2026','Reglamento interno 2026'],['PETS-012','PT-012']],
  us: [['Juan Pérez Quispe','John Smith'],['Pérez Quispe','Smith'],['Luis Mamani Quispe','Luis García'],
       ['Quispe o 4455','Pérez o 4455'],['Proyecto Metro de Lima — Línea 2','Northfield Tower — Houston'],['Proyecto Metro de Lima','Northfield Tower'],
       ['Av. Los Constructores 123, San Miguel, Lima','1234 Main St, Houston, TX'],['Constructora Andes · Obra Torre Lima','Northfield Builders · Northfield Tower'],
       ['Soy el nuevo prevencionista de la obra Torre Lima','Soy el nuevo prevencionista de la obra Northfield Tower'],['Constructora Los Andes S.A.C.','Northfield Builders LLC'],
       ['Línea 2 del Metro – Ramal 4','Torre B – Etapa 2'],['seguridad@constructora.pe','safety@northfieldbuilders.com'],
       ['999 888 777','+1 713 555 0142'],['987 654 321','+1 713 555 0142'],['CIP 123456','Licencia 12345'],['RISST 2026','Reglamento interno 2026'],['PETS-012','PT-012']],
  ca: [['Juan Pérez Quispe','John Smith'],['Pérez Quispe','Smith'],['Luis Mamani Quispe','Luis García'],
       ['Quispe o 4455','Pérez o 4455'],['Proyecto Metro de Lima — Línea 2','Maple Tower — Toronto'],['Proyecto Metro de Lima','Maple Tower'],
       ['Av. Los Constructores 123, San Miguel, Lima','123 King St W, Toronto, ON'],['Constructora Andes · Obra Torre Lima','Maple Ridge Construction · Maple Tower'],
       ['Soy el nuevo prevencionista de la obra Torre Lima','Soy el nuevo prevencionista de la obra Maple Tower'],['Constructora Los Andes S.A.C.','Maple Ridge Construction Ltd.'],
       ['Línea 2 del Metro – Ramal 4','Torre B – Etapa 2'],['seguridad@constructora.pe','safety@mapleridge.ca'],
       ['999 888 777','+1 416 555 0142'],['987 654 321','+1 416 555 0142'],['CIP 123456','Licencia 12345'],['RISST 2026','Reglamento interno 2026'],['PETS-012','PT-012']]
};
function _otEjemplos(v, p){
  var l = OT_EJEMPLOS[p] || [];
  for(var i = 0; i < l.length; i++) if(v.indexOf(l[i][0]) > -1) v = v.split(l[i][0]).join(l[i][1]);
  return v;
}

/* ── 1 · las frases enteras ──────────────────────────────────────────
   Las mismas que tiene RD (DO_FRASES), con su versión neutra. Las de
   emergencia llevan los números verificados de cada país: Chile, SAMU
   131, Bomberos 132 y Carabineros 133 (Gobierno de Chile); Colombia, el
   123, número único (Res. CRC 5050 de 2016). En Argentina cambian por
   provincia: se dice sin números. */
var _OT_FRASES = {};
function _otFrases(p){
  if(_OT_FRASES[p]) return _OT_FRASES[p];
  var emerg = {
    cl:['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra, al SAMU (131), a Bomberos (132) o a Carabineros (133).',
        'Números de emergencia en Chile: SAMU 131 · Bomberos 132 · Carabineros 133.'],
    co:['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o a la línea de emergencias 123.',
        'Número de emergencias en Colombia: 123.'],
    ar:['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o a los números de emergencia de tu provincia.',
        'Ten a mano los números de emergencia de tu provincia —ambulancia, bomberos y policía— y el de la ART.'],
    /* 26/09/2026 · el 911 en los cinco: Ministerio del Interior (Uruguay),
       Ley 4739 (Paraguay), gob.mx/911 (México), 911.gov (Estados Unidos) y
       CRTC (Canadá) */
    uy:['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o al 911.',
        'Número de emergencias en Uruguay: 911.'],
    py:['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o al 911.',
        'Número de emergencias en Paraguay: 911.'],
    mx:['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o al 911.',
        'Número de emergencias en México: 911.'],
    us:['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o al 911.',
        'Número de emergencias en Estados Unidos: 911.'],
    ca:['Ante un accidente o un peligro inminente, detén el trabajo y llama a la central de emergencias de tu obra o al 911.',
        'Número de emergencias en Canadá: 911.']
  }[p];
  var dir = { cl:'(dirección, comuna, región)', co:'(dirección, municipio, departamento)', ar:'(dirección, localidad, provincia)',
              uy:'(dirección, localidad, departamento)', py:'(dirección, ciudad, departamento)', mx:'(dirección, municipio o alcaldía, estado)',
              us:'(dirección, ciudad, estado)', ca:'(dirección, ciudad, provincia)' }[p];
  var sii = { cl:'🔎 Traer los datos del SII', co:'🔎 Traer los datos de la DIAN', ar:'🔎 Traer los datos de ARCA',
              uy:'🔎 Traer los datos de la DGI', py:'🔎 Traer los datos de la DNIT', mx:'🔎 Traer los datos del SAT',
              us:'🔎 Traer los datos del IRS', ca:'🔎 Traer los datos de la CRA' }[p];
  /* lo que en RD dice algo propio de RD, acá se dice neutro */
  var propio = {
    'Paralizaré mi actividad ante peligro inminente, y avisaré. Es un derecho que me reconoce la Ley 29783.':
      'Ante un peligro inminente pararé mi actividad y avisaré de inmediato a mi supervisor.',
    'Interrumpir un trabajo ante un peligro inminente está protegido por la Ley 29783 (art. 63). Una represalia por eso, o por reportar, hay que pararla y corregirla.':
      'Una represalia por parar un trabajo ante un peligro inminente, o por reportar, hay que pararla y corregirla.',
    'Conforme al D.S. N° 005-2012-TR.': '',
    'Conforme al D.S. Nº 005-2012-TR.': '',
    'Este PDF es para imprimirlo y pegarlo en el libro legalizado, o para mandarlo entero.': 'Este PDF junta todas las actas.',
    'El Libro de Actas': 'Las actas del comité',
    'Descargar el Libro de Actas': 'Descargar las actas de',
    'de las 12 reuniones ordinarias que exige el D.S. 005-2012-TR art. 68': 'de las 12 reuniones mensuales del año',
    'El mandato de los representantes de los trabajadores dura de 1 a 2 años': 'Pon el período del mandato que quedó en el acta de elección',
    'Los nuevos miembros inician funciones dentro de los 10 días hábiles de terminada la elección.': 'Anota el día en que el comité quedó instalado.',
    'N° del Libro de Actas legalizado (opcional)': 'N° de registro del comité (opcional)',
    'Comité o Subcomité SST': 'Comité de SST',
    'Ley 29783, DS 011-2019 y las demás': 'las normas ' + (OBRA_PAIS_DE[p] || ''),
    '(opcional · CIP, CQP…)': '(opcional · registro profesional…)'
  };
  var l = [];
  /* el WhatsApp: el celular de allá (index.html, telInternacional) */
  l.push(['Si es de Perú basta con los 9 dígitos. De otro país, ponle el código delante (+56…).',
          { cl:'Si es de Chile basta con los 9 dígitos. De otro país, ponle el código delante (+51…).',
            co:'Si es de Colombia basta con los 10 dígitos. De otro país, ponle el código delante (+51…).',
            ar:'Escríbelo con el código del país delante (+54…).',
            uy:'Escríbelo con el código del país delante (+598…).', py:'Escríbelo con el código del país delante (+595…).',
            mx:'Escríbelo con el código del país delante (+52…).', us:'Escríbelo con el código del país delante (+1…).',
            ca:'Escríbelo con el código del país delante (+1…).' }[p]]);
  l.push(['Número de WhatsApp (con o sin +51)', { cl:'Número de WhatsApp (con o sin +56)', co:'Número de WhatsApp (con o sin +57)', ar:'Número de WhatsApp (con el +54)',
          uy:'Número de WhatsApp (con el +598)', py:'Número de WhatsApp (con el +595)', mx:'Número de WhatsApp (con el +52)',
          us:'Número de WhatsApp (con el +1)', ca:'Número de WhatsApp (con el +1)' }[p]]);
  (typeof DO_FRASES !== 'undefined' ? DO_FRASES : []).forEach(function(f){
    var pe = f[0], nuevo, suyo = true;
    if(/^Ante un accidente o un peligro inminente/.test(pe)) nuevo = emerg[0];
    else if(/^Números de emergencia en el Perú/.test(pe)) nuevo = emerg[1];
    else if(/distrito, (provincia|departamento)/.test(pe)) nuevo = dir;
    else if(/Traer los datos de SUNAT/.test(pe)) nuevo = sii;
    else if(Object.prototype.hasOwnProperty.call(propio, pe)) nuevo = propio[pe];
    else { nuevo = f[1]; suyo = false; }
    /* por si acaso: nada dominicano en una obra de afuera (el 911 de los
       países que sí lo tienen es de ellos, no de RD: ese no se borra) */
    if(!suyo && /522-06|04\/2007|IDOPPRIL|DGII|Mixto|Coordinador de SST|Higiene y Seguridad Industrial|CODIA|\b911\b|dominican/.test(nuevo)) nuevo = '';
    l.push([pe, nuevo]);
  });
  _OT_FRASES[p] = l;
  return l;
}

/* ── 3 · las palabras sueltas ─────────────────────────────────────── */
var _OT_PALABRAS = {};
function _otPalabras(p){
  if(_OT_PALABRAS[p]) return _OT_PALABRAS[p];
  var l = [];
  /* el documento de la persona */
  if(p === 'cl'){
    l.push([_pal('DNI o carné de extranjería'), '$1RUN o pasaporte']);
    l.push([_pal('[Cc]arné de extranjería'), function(m, a){ return a + (m.charAt(a.length) === 'C' ? 'Pasaporte' : 'pasaporte'); }]);
    l.push([_pal('DNI'), '$1RUN']);
  } else if(p === 'co'){
    l.push([_pal('DNI o carné de extranjería'), '$1Cédula de ciudadanía o de extranjería']);
    l.push([_pal('[Cc]arné de extranjería'), function(m, a){ return a + (m.charAt(a.length) === 'C' ? 'Cédula de extranjería' : 'cédula de extranjería'); }]);
    /* la cédula es femenina: las mismas reglas que RD */
    l.push([_pal('los DNI'), '$1las cédulas'], [_pal('Los DNI'), '$1Las cédulas'], [_pal('del DNI'), '$1de la cédula'],
           [_pal('al DNI'), '$1a la cédula'], [_pal('el DNI'), '$1la cédula'], [_pal('El DNI'), '$1La cédula'],
           [_pal('un DNI'), '$1una cédula'], [_pal('Un DNI'), '$1Una cédula']);
    l.push([_pal('DNI'), function(m, a, off, s){
      var antes = s.slice(0, off + a.length).replace(/\s+$/, '');
      var inicio = !antes || /[.:·|(\-—–\n]$/.test(antes) || /^[\s·•\-—]*$/.test(antes);
      return a + (inicio ? 'Cédula' : 'cédula'); }]);
  } else if(p === 'uy' || p === 'py'){
    /* 26/09/2026 · la cédula, femenina, como en Colombia */
    l.push([_pal('DNI o carné de extranjería'), '$1Cédula o pasaporte']);
    l.push([_pal('[Cc]arné de extranjería'), function(m, a){ return a + (m.charAt(a.length) === 'C' ? 'Pasaporte' : 'pasaporte'); }]);
    l.push([_pal('los DNI'), '$1las cédulas'], [_pal('Los DNI'), '$1Las cédulas'], [_pal('del DNI'), '$1de la cédula'],
           [_pal('al DNI'), '$1a la cédula'], [_pal('el DNI'), '$1la cédula'], [_pal('El DNI'), '$1La cédula'],
           [_pal('un DNI'), '$1una cédula'], [_pal('Un DNI'), '$1Una cédula']);
    l.push([_pal('DNI'), function(m, a, off, s){
      var antes = s.slice(0, off + a.length).replace(/\s+$/, '');
      var inicio = !antes || /[.:·|(\-—–\n]$/.test(antes) || /^[\s·•\-—]*$/.test(antes);
      return a + (inicio ? 'Cédula' : 'cédula'); }]);
  } else if(p === 'mx'){
    /* la CURP, femenina («la Clave Única…») */
    l.push([_pal('DNI o carné de extranjería'), '$1CURP o pasaporte']);
    l.push([_pal('[Cc]arné de extranjería'), function(m, a){ return a + (m.charAt(a.length) === 'C' ? 'Pasaporte' : 'pasaporte'); }]);
    l.push([_pal('los DNI'), '$1las CURP'], [_pal('Los DNI'), '$1Las CURP'], [_pal('del DNI'), '$1de la CURP'],
           [_pal('al DNI'), '$1a la CURP'], [_pal('el DNI'), '$1la CURP'], [_pal('El DNI'), '$1La CURP'],
           [_pal('un DNI'), '$1una CURP'], [_pal('Un DNI'), '$1Una CURP'], [_pal('DNI'), '$1CURP']);
  } else if(p === 'us' || p === 'ca'){
    /* sin el número de Seguro Social ni el SIN: el ID de la persona */
    l.push([_pal('DNI o carné de extranjería'), '$1ID o pasaporte']);
    l.push([_pal('[Cc]arné de extranjería'), function(m, a){ return a + (m.charAt(a.length) === 'C' ? 'Pasaporte' : 'pasaporte'); }]);
    l.push([_pal('DNI'), '$1ID']);
  } else {
    l.push([_pal('DNI o carné de extranjería'), '$1DNI o pasaporte']);
    l.push([_pal('[Cc]arné de extranjería'), function(m, a){ return a + (m.charAt(a.length) === 'C' ? 'Pasaporte' : 'pasaporte'); }]);
  }
  /* el documento de la empresa y quien lo da */
  if(p === 'ar'){
    /* «la CUIT» */
    l.push([_pal('del RUC'), '$1de la CUIT'], [_pal('al RUC'), '$1a la CUIT'], [_pal('el RUC'), '$1la CUIT'],
           [_pal('El RUC'), '$1La CUIT'], [_pal('un RUC'), '$1una CUIT'], [_pal('Un RUC'), '$1Una CUIT'], [_pal('RUC'), '$1CUIT']);
    l.push([_pal('de SUNAT'), '$1de ARCA'], [_pal('a SUNAT'), '$1a ARCA'], [_pal('SUNAT'), '$1ARCA']);
  } else if(p === 'cl'){
    l.push([_pal('RUC'), '$1RUT']);
    l.push([_pal('de SUNAT'), '$1del SII'], [_pal('a SUNAT'), '$1al SII'], [_pal('SUNAT'), '$1el SII']);
  } else if(p === 'uy'){
    l.push([_pal('RUC'), '$1RUT']);
    l.push([_pal('de SUNAT'), '$1de la DGI'], [_pal('a SUNAT'), '$1a la DGI'], [_pal('SUNAT'), '$1la DGI']);
  } else if(p === 'py'){
    /* en Paraguay también es RUC: solo cambia quien lo da */
    l.push([_pal('de SUNAT'), '$1de la DNIT'], [_pal('a SUNAT'), '$1a la DNIT'], [_pal('SUNAT'), '$1la DNIT']);
  } else if(p === 'mx'){
    l.push([_pal('RUC'), '$1RFC']);
    l.push([_pal('de SUNAT'), '$1del SAT'], [_pal('a SUNAT'), '$1al SAT'], [_pal('SUNAT'), '$1el SAT']);
  } else if(p === 'us'){
    l.push([_pal('RUC'), '$1EIN']);
    l.push([_pal('de SUNAT'), '$1del IRS'], [_pal('a SUNAT'), '$1al IRS'], [_pal('SUNAT'), '$1el IRS']);
  } else if(p === 'ca'){
    l.push([_pal('RUC'), '$1BN']);
    l.push([_pal('de SUNAT'), '$1de la CRA'], [_pal('a SUNAT'), '$1a la CRA'], [_pal('SUNAT'), '$1la CRA']);
  } else {
    l.push([_pal('RUC'), '$1NIT']);
    l.push([_pal('de SUNAT'), '$1de la DIAN'], [_pal('a SUNAT'), '$1a la DIAN'], [_pal('SUNAT'), '$1la DIAN']);
  }
  /* las instituciones: el nombre de allá, o uno que sea cierto en los tres */
  if(p === 'ar' || p === 'mx' || p === 'us' || p === 'ca'){
    l.push([/al Ministerio de Trabajo y Promoción del Empleo/g, 'a la autoridad laboral'],
           [/del Ministerio de Trabajo y Promoción del Empleo/g, 'de la autoridad laboral'],
           [/el Ministerio de Trabajo y Promoción del Empleo/g, 'la autoridad laboral'],
           [/Ministerio de Trabajo y Promoción del Empleo/g, 'autoridad laboral'],
           [_pal('al MTPE'), '$1a la autoridad laboral'], [_pal('del MTPE'), '$1de la autoridad laboral'],
           [_pal('el MTPE'), '$1la autoridad laboral'], [_pal('El MTPE'), '$1La autoridad laboral'], [_pal('MTPE'), '$1la autoridad laboral']);
  } else if(p === 'uy'){
    l.push([/Ministerio de Trabajo y Promoción del Empleo/g, 'Ministerio de Trabajo y Seguridad Social'], [_pal('MTPE'), '$1MTSS']);
  } else if(p === 'py'){
    l.push([/Ministerio de Trabajo y Promoción del Empleo/g, 'Ministerio de Trabajo, Empleo y Seguridad Social'], [_pal('MTPE'), '$1MTESS']);
  } else {
    l.push([/Ministerio de Trabajo y Promoción del Empleo/g, 'Ministerio del Trabajo'], [_pal('MTPE'), '$1Ministerio del Trabajo']);
  }
  l.push([_pal('SUNAFIL'), '$1la inspección del trabajo']);
  l.push([_pal('INDECI'), '$1la autoridad de emergencias']);
  /* el seguro de los accidentes: la ARL en Colombia, la ART en
     Argentina; en Chile, la mutual o el ISL */
  var seg = { cl:['el seguro de accidentes del trabajo', 'del seguro de accidentes del trabajo', 'al seguro de accidentes del trabajo', 'seguro de accidentes del trabajo'],
              co:['la ARL', 'de la ARL', 'a la ARL', 'ARL'],
              ar:['la ART', 'de la ART', 'a la ART', 'ART'],
              /* 26/09/2026 */
              uy:['el seguro del BSE', 'del seguro del BSE', 'al seguro del BSE', 'seguro del BSE'],
              py:['el seguro del IPS', 'del seguro del IPS', 'al seguro del IPS', 'seguro del IPS'],
              mx:['el seguro de riesgos de trabajo del IMSS', 'del seguro de riesgos de trabajo del IMSS', 'al seguro de riesgos de trabajo del IMSS', 'seguro de riesgos de trabajo del IMSS'],
              us:['el seguro de compensación al trabajador', 'del seguro de compensación al trabajador', 'al seguro de compensación al trabajador', 'seguro de compensación al trabajador'],
              ca:['el seguro de la junta de la provincia', 'del seguro de la junta de la provincia', 'al seguro de la junta de la provincia', 'seguro de la junta de la provincia'] }[p];
  l.push([/Seguro Complementario de Trabajo de Riesgo(?:\s*\(SCTR\))?/g, seg[3].charAt(0).toUpperCase() + seg[3].slice(1)]);
  l.push([_pal('el SCTR'), '$1' + seg[0]], [_pal('del SCTR'), '$1' + seg[1]], [_pal('al SCTR'), '$1' + seg[2]], [_pal('SCTR'), '$1' + seg[3]]);
  /* el IPERC continuo es un formato de la norma minera peruana: su anexo no va */
  l.push([/IPERC continuo \(Anexo N[º°.]?\s?7\)/g, 'IPERC continuo']);
  /* lo demás, igual que en RD: siglas peruanas por su nombre común */
  (typeof DO_PALABRAS !== 'undefined' ? DO_PALABRAS : []).forEach(function(r){
    var src = r[0].source;
    if(/RISST|PETAR|PETS|IPERC|1\[\.,\]80/.test(src)) l.push(r);
  });
  _OT_PALABRAS[p] = l;
  return l;
}

/* ── la cita peruana, sin par: se va ──────────────────────────────── */
function _otCita(){ return ''; }

function txOT(s, p){
  if(s == null) return s;
  s = String(s);
  p = p || (typeof paisCapa === 'function' ? paisCapa() : '');
  if(!OT_NOMBRE[p]) return s;
  if(!_DO_HAY.test(s)) return s;
  var i, F = _otFrases(p);
  var vacio = false;
  for(i = 0; i < F.length; i++){
    if(s.indexOf(F[i][0]) > -1){ s = s.split(F[i][0]).join(F[i][1]); if(!F[i][1]) vacio = true; }
  }
  var marcado = _doMarcar(s);
  if(new RegExp(_M0 + '[A-Z0-9]+' + _M1).test(marcado) || /\(PETAR\)/.test(marcado)) vacio = true;
  s = _doResolver(marcado, _otCita);
  var W = _otPalabras(p);
  for(i = 0; i < W.length; i++) s = s.replace(W[i][0], W[i][1]);
  /* los precios: en dólares si la empresa que paga no es del Perú (una
     constructora peruana con un proyecto en Chile sigue pagando en soles) */
  if(typeof pagoEnDolares !== 'function' || pagoEnDolares()) s = s.replace(/S\/\s?(?=\d)/g, 'US$ ');
  if(vacio) for(i = 0; i < DO_LIMPIEZA.length; i++) s = s.replace(DO_LIMPIEZA[i][0], DO_LIMPIEZA[i][1]);
  return s;
}
/* ── para crear la empresa desde la web (03/10/2026) ── */
function rucMalo(ruc){
  ruc=String(ruc||'').replace(/\D/g,'');
  if(ruc.length!==11) return 'El RUC tiene 11 dígitos.';
  var ini=ruc.slice(0,2);
  if(['10','15','16','17','20'].indexOf(ini)<0)
    return 'Un RUC peruano empieza por 10, 15, 16, 17 o 20.';
  var pesos=[5,4,3,2,7,6,5,4,3,2], suma=0;
  for(var i=0;i<10;i++) suma += parseInt(ruc.charAt(i),10)*pesos[i];
  var resto=11-(suma%11); if(resto===10) resto=0; if(resto===11) resto=1;
  if(resto!==parseInt(ruc.charAt(10),10)) return 'Ese RUC no existe: revisa los dígitos.';
  return '';
}
var EMP_DOCS = {
  pe:   { n:'RUC',  largo:'RUC de la empresa',  ph:'20123456789',   im:'numeric', max:11, quien:'SUNAT' },
  'do': { n:'RNC',  largo:'RNC de la empresa',  ph:'101234567',     im:'numeric', max:13, quien:'DGII' },
  cl:   { n:'RUT',  largo:'RUT de la empresa',  ph:'76.123.456-0',  im:'text',    max:12, quien:'SII' },
  co:   { n:'NIT',  largo:'NIT de la empresa',  ph:'900.123.456-8', im:'numeric', max:15, quien:'DIAN' },
  ar:   { n:'CUIT', largo:'CUIT de la empresa', ph:'30-71234567-1', im:'numeric', max:13, quien:'ARCA' },
  /* 26/09/2026 · los cinco nuevos (paises-fuente/nuevos/): RUT de
     Uruguay, 12 números (DGI; su dígito verificador es reservado, no se
     calcula); RUC de Paraguay (DNIT; su sitio no se dejó leer: blando);
     RFC de México, 12 caracteres la persona moral y 13 la física (SAT),
     con letras: se guarda con ellas; EIN de Estados Unidos, 9 números,
     XX-XXXXXXX (IRS, Pub. 1635); BN de Canadá, 9 números (estándar de
     datos del Gobierno de Canadá). */
  uy:   { n:'RUT',  largo:'RUT de la empresa',  ph:'211234560012',  im:'numeric', max:15, quien:'DGI' },
  py:   { n:'RUC',  largo:'RUC de la empresa',  ph:'80012345-6',    im:'numeric', max:12, quien:'DNIT' },
  mx:   { n:'RFC',  largo:'RFC de la empresa',  ph:'CAN120101AB1',  im:'text',    max:15, quien:'SAT' },
  us:   { n:'EIN',  largo:'EIN de la empresa',  ph:'12-3456789',    im:'numeric', max:10, quien:'IRS' },
  ca:   { n:'BN',   largo:'Business Number (BN) de la empresa', ph:'123456789', im:'numeric', max:15, quien:'CRA' }
};
function empDoc(p){ return EMP_DOCS[p] || EMP_DOCS.pe; }
/* el dígito verificador del RUT (módulo 11, pesos 2 a 7 desde la derecha) */
function rutDv(cuerpo){
  var s = 0, f = 2, c = String(cuerpo || '');
  for(var i = c.length - 1; i >= 0; i--){ s += (+c.charAt(i)) * f; f = (f === 7) ? 2 : f + 1; }
  var r = 11 - (s % 11);
  return r === 11 ? '0' : (r === 10 ? 'K' : String(r));
}
/* el de verificación del NIT (DIAN: pesos primos desde la derecha) */
function nitDv(cuerpo){
  var w = [3,7,13,17,19,23,29,37,41,43,47,53,59,67,71], c = String(cuerpo || ''), s = 0;
  for(var i = 0; i < c.length && i < w.length; i++) s += (+c.charAt(c.length - 1 - i)) * w[i];
  var r = s % 11;
  return (r === 0 || r === 1) ? r : 11 - r;
}
/* la CUIT: pesos 5,4,3,2,7,6,5,4,3,2; 11 es 0 y 10 es 9 */
function cuitOk(d){
  d = String(d || '');
  if(!/^\d{11}$/.test(d)) return false;
  var w = [5,4,3,2,7,6,5,4,3,2], s = 0;
  for(var i = 0; i < 10; i++) s += (+d.charAt(i)) * w[i];
  var r = 11 - (s % 11);
  if(r === 11) r = 0; else if(r === 10) r = 9;
  return r === +d.charAt(10);
}
/* lo que la persona ESCRIBIÓ, como se guarda en el servidor: solo
   números. El RUT se escribe siempre con su verificador: se guarda el
   cuerpo (lo que va antes del guion). No se le pasa lo que ya vino del
   servidor: eso ya está guardado. */
function empDocNorm(p, escrito){
  var v = String(escrito == null ? '' : escrito).trim();
  /* el RFC lleva letras (y a veces Ñ o &): se guarda con ellas */
  if(p === 'mx') return v.toUpperCase().replace(/[^A-Z0-9Ñ&]/g, '');
  /* el BN puede venir con su cuenta de programa (123456789 RT0001): el BN son los 9 primeros */
  if(p === 'ca'){ var b = v.replace(/\D/g, ''); return b.length > 9 && /[A-Za-z]/.test(v) ? b.slice(0, 9) : b; }
  if(p === 'cl'){
    var s = v.toUpperCase().replace(/[^0-9K]/g, '');
    return s.length > 1 ? s.slice(0, -1).replace(/\D/g, '') : '';
  }
  return v.replace(/\D/g, '');
}
/* como se muestra y se imprime. Recibe lo del servidor (el RUT, su
   cuerpo) o algo ya mostrado (el RUT, con su guion) */
function _milesPunto(d){ return String(d || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function empDocFmt(p, v){
  var d = String(v == null ? '' : v).trim();
  if(!d) return '';
  if(p === 'cl'){
    var s = d.toUpperCase().replace(/[^0-9K]/g, '');
    var cuerpo = (d.indexOf('-') > -1) ? s.slice(0, -1) : s;
    if(!/^\d{6,8}$/.test(cuerpo)) return d;
    return _milesPunto(cuerpo) + '-' + rutDv(cuerpo);
  }
  var n = d.replace(/\D/g, '');
  if(p === 'co' && n.length >= 6) return _milesPunto(n.slice(0, -1)) + '-' + n.slice(-1);
  if(p === 'ar' && n.length === 11) return n.slice(0, 2) + '-' + n.slice(2, 10) + '-' + n.slice(10);
  if(p === 'mx') return d.toUpperCase().replace(/[^A-Z0-9Ñ&]/g, '') || d;
  if(p === 'us' && n.length === 9) return n.slice(0, 2) + '-' + n.slice(2);
  return n || d;
}
/* null si está bien · {duro:'…'} si no se puede seguir · {blando:'…'}
   si conviene revisarlo, pero se puede seguir tocando otra vez */
function empDocRevisar(p, v){
  var raw = String(v == null ? '' : v).trim(), d = raw.replace(/\D/g, ''), x = empDoc(p);
  if(!raw) return { duro:'Falta el ' + x.n + '. Es lo que hace que tu empresa sea una sola en la app.' };
  if(p === 'pe'){
    var m = (typeof rucMalo === 'function') ? rucMalo(d) : (d.length === 11 ? '' : 'El RUC tiene 11 dígitos.');
    return m ? { duro:m } : null;
  }
  if(p === 'do') return (typeof rncRevisar === 'function') ? rncRevisar(d) : (/^(\d{9}|\d{11})$/.test(d) ? null : { duro:'El RNC tiene 9 dígitos; la cédula, 11.' });
  if(p === 'cl'){
    var s = raw.toUpperCase().replace(/[^0-9K]/g, '');
    if(!/^\d{6,8}[0-9K]$/.test(s))
      return { duro:'El RUT son sus números y el dígito verificador del final (0 a 9, o K). Por ejemplo, 76.123.456-0.' };
    if(rutDv(s.slice(0, -1)) !== s.slice(-1))
      return { duro:'El RUT no calza con su dígito verificador: revisa los números y el del final.' };
    return null;
  }
  if(p === 'co'){
    if(d.length < 6 || d.length > 11)
      return { duro:'Escribe el NIT con su dígito de verificación, el que va después del guion: por ejemplo, 900.123.456-8.' };
    if(!/-/.test(raw) && d.length === 9 && /^[89]/.test(d))
      return { blando:'¿Le falta el dígito de verificación? Es el número que va después del guion en el RUT de la DIAN (900.123.456-8). Si el NIT está completo, vuelve a tocar.' };
    if(nitDv(d.slice(0, -1)) !== +d.slice(-1))
      return { blando:'El dígito de verificación no calza con el NIT. Revísalo en el RUT de la DIAN; si está tal cual, vuelve a tocar.' };
    return null;
  }
  if(p === 'ar'){
    if(d.length !== 11)
      return { duro:'La CUIT son 11 números: por ejemplo, 30-71234567-1.' };
    if(!cuitOk(d))
      return { blando:'El último número de la CUIT no calza con los otros diez. Revísala en la constancia de ARCA; si está tal cual, vuelve a tocar.' };
    return null;
  }
  if(p === 'uy'){
    if(d.length !== 12) return { duro:'El RUT son 12 números: por ejemplo, 211234560012.' };
    return null;
  }
  if(p === 'py'){
    if(d.length < 5 || d.length > 10)
      return { blando:'Revisa el RUC: son los números con el dígito verificador del final, el que va después del guion. Si está tal cual, vuelve a tocar.' };
    return null;
  }
  if(p === 'mx'){
    var r = raw.toUpperCase().replace(/[^A-Z0-9Ñ&]/g, '');
    if(!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(r))
      return { duro:'El RFC de una empresa son 12 caracteres: 3 letras, la fecha de constitución (aammdd) y 3 de la homoclave. El de una persona física, 13.' };
    return null;
  }
  if(p === 'us'){
    if(d.length !== 9) return { duro:'El EIN son 9 números: por ejemplo, 12-3456789.' };
    return null;
  }
  if(p === 'ca'){
    var bn = empDocNorm('ca', raw);
    if(bn.length !== 9) return { duro:'El Business Number son 9 números: por ejemplo, 123456789.' };
    return null;
  }
  return null;
}
var EMP_CREAR_NOMBRE_PH = { pe:'Constructora Los Andes S.A.C.', 'do':'Constructora Caribe S.R.L.',
  cl:'Constructora Cordillera SpA', co:'Constructora Andina S.A.S.', ar:'Constructora del Plata S.A.',
  uy:'Constructora Oriental S.A.', py:'Constructora Guaraní S.A.', mx:'Constructora del Valle S.A. de C.V.',
  us:'Northfield Builders LLC', ca:'Maple Ridge Construction Ltd.' };
var ALTA_SECTORES = [{"id":"construccion","nombre":"Construcción","icono":"🏗️","pie":"Obra, edificación y montaje"},{"id":"mineria","nombre":"Minería","icono":"⛏️","pie":"Interior mina, tajo y planta concentradora"},{"id":"industria","nombre":"Industria","icono":"🏭","pie":"Planta de producción y manufactura"},{"id":"hidrocarburos","nombre":"Hidrocarburos","icono":"🛢️","pie":"Refinería, planta de proceso y almacenamiento"}];
