/* OBRASST · portal/iperc-pets.js — el IPERC de línea base y los PETS de la obra, por la web (27/10/2026)
   Se pide al abrir «IPERC de línea base» o «PETS» (index: cargarIpets / ipetsIr). Lo arma parches/ipets/armar_web.py
   con base.js (los datos y las cuentas), pdf.js (los PDF), xls.js (el Excel) y web.js (las pantallas). No editar aquí. */
/* ══ EL IPERC DE LÍNEA BASE Y LOS PETS DE LA OBRA · LA BASE (27/10/2026) ═════════════════════════════════════════
   Marcelo: «una opción para que hagas IPERC línea base y PETS, eso para todos los planes, de Prevencionista hasta el
   último. Prevencionista 1, Supervisor 1, SSOMA 4, Gestión 8. PETS igual la cantidad. Tiene que ser bien ordenado,
   buen diseño, que lleve el logo de la empresa, su índice… y las firmas correspondientes». El cupo es POR OBRA (lo
   eligió él). LITE no lo trae.

   LO QUE SE GUARDA (sst_doc de la obra; estas hojas no salen en «Documentos»: DC_NO_DOCS)
   · «iperc-lb»: un IPERC de línea base por fila (nombre = su título; nota = el JSON de iplLimpio).
   · «pets-ob»: un PETS por fila (nota = el JSON de petsLimpio).
   Al PUBLICAR una versión aprobada, su PDF va a la carpeta de siempre («iperc» o «pets»): ahí lo toman el cartel QR,
   la app (Documentos) y la difusión (cada trabajador lo lee y firma en su celular; la constancia lleva el nombre del
   documento, con su versión). La versión anterior sale de la carpeta (sus constancias se quedan).

   LAS NORMAS (solo lo verificado; consultado el 27/10/2026)
   · R.M. 050-2013-TR, Anexo 3: el método del IPERC (índices A, B, C y D de 1 a 3; probabilidad = A+B+C+D; severidad de
     1 a 3; nivel = probabilidad × severidad: Trivial 4, Tolerable 5-8, Moderado 9-16, Importante 17-24, Intolerable
     25-36, y lo que se hace en cada nivel). Fuente: el manual de la matriz IPER según la R.M. (sigweb.cl) y la matriz
     de la EPS Moyobamba. Desde qué nivel un riesgo es «significativo» no lo fija una sola copia: lo elige la empresa
     (por defecto, desde Moderado), porque la metodología la define el empleador (D.S. 011-2019-TR, art. 20).
   · D.S. 011-2019-TR (construcción): art. 20 (el IPERC; la metodología la define el empleador y se actualiza con la
     participación de los trabajadores) y art. 18 (el plan de SST lleva el IPERC y los procedimientos de las labores de
     alto riesgo).
   · D.S. 024-2016-EM (minería): art. 7 (qué es el IPERC y qué es el PETS), art. 33 (PETS de cada proceso), arts. 40 b)
     y 44 f) (el IPERC de línea base, con los trabajadores), Anexo 8 (el IPERC de línea base) y Anexo 10 (el formato
     del PETS: personal, EPP, equipos/herramientas/materiales, procedimiento, restricciones y sus firmas: preparado,
     revisado por el supervisor del área, revisado por el gerente del área o de seguridad, aprobado por el gerente de
     operaciones, con las fechas de elaboración y de aprobación). El nivel Alto, Medio o Bajo y su plazo son los del
     IPERC continuo de la app (Anexo 7); los cortes de la matriz del 1 al 25 no están en ninguna copia verificable y
     no se inventan: el nivel se marca.
   · Ley 29783, art. 57 (la evaluación de riesgos se actualiza una vez al año como mínimo).
   · ISO 45001:2018, 6.1.2 (identificación de peligros y evaluación de riesgos) y 8.1.2 (eliminar peligros y reducir
     riesgos: la jerarquía de controles).
   OBRASST ordena y da el formato: el contenido lo define y lo aprueba la empresa. */
var IPL_HOJA = 'iperc-lb', PETS_HOJA = 'pets-ob';
var IPETS_CUPO = { lite:0, prevencionista:1, supervisor:1, ssoma:4, gestion:8 };
function ipetsCupoDe(plan){ var n = IPETS_CUPO[String(plan || '').toLowerCase()]; return (typeof n === 'number') ? n : 0; }
var IPL_TOPE = 250, PETS_TOPE = 60;

/* ── lo de siempre: textos limpios, fechas, versiones ── */
function ipTx(v, n){ return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 200); }
function ipArea(v, n){
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, n || 1200);
}
function ipFecha(v){ v = String(v || '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''; }
function ipId(){ return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function ipVer(v){ var n = parseInt(v, 10); return (n > 0 && n < 100) ? (n < 10 ? '0' + n : String(n)) : '01'; }
function ipVerSig(v){ return ipVer((parseInt(ipVer(v), 10) || 1) + 1); }
function ipLista(a, n, max){ return (Array.isArray(a) ? a : []).map(function(x){ return ipTx(x, n); }).filter(Boolean).slice(0, max || 40); }
function ipDma(iso){ iso = ipFecha(iso); return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : ''; }
function ipNorm(s){ return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

/* ── el método de la R.M. 050-2013-TR (Anexo 3) ── */
var IPL_IND = [
  { k:'a', c:'A', n:'Personas expuestas', o:['De 1 a 3', 'De 4 a 12', 'Más de 12'] },
  { k:'b', c:'B', n:'Procedimientos existentes', o:['Existen, son satisfactorios y suficientes', 'Existen parcialmente y no son satisfactorios o suficientes', 'No existen'] },
  { k:'c', c:'C', n:'Capacitación', o:['Personal entrenado: conoce el peligro y lo previene', 'Personal parcialmente entrenado: conoce el peligro, pero no toma acciones de control', 'Personal no entrenado: no conoce el peligro y no toma acciones de control'] },
  { k:'d', c:'D', n:'Exposición al riesgo', o:['Al menos una vez al año (S) · esporádicamente (SO)', 'Al menos una vez al mes (S) · eventualmente (SO)', 'Al menos una vez al día (S) · permanentemente (SO)'] }
];
var IPL_SEV = { k:'s', c:'S', n:'Severidad', o:['Lesión sin incapacidad (S) · disconfort o incomodidad (SO)', 'Lesión con incapacidad temporal (S) · daño a la salud reversible (SO)', 'Lesión con incapacidad permanente (S) · daño a la salud irreversible (SO)'] };
/* los colores: web (texto y fondo), PDF y Excel */
var IPL_NIV = [
  { k:'triv', n:'Trivial',     de:4,  a:4,  t:'#1E6B3A', f:'#DCEFE0', tin:[30, 107, 58],  fon:[220, 239, 224], xt:'1E6B3A', xf:'DCEFE0',
    d:'No se necesita adoptar ninguna acción.' },
  { k:'tol', n:'Tolerable',    de:5,  a:8,  t:'#3F6B12', f:'#EAF3D9', tin:[63, 107, 18],  fon:[234, 243, 217], xt:'3F6B12', xf:'EAF3D9',
    d:'No se necesita mejorar la acción preventiva; se consideran soluciones más rentables o mejoras que no supongan una carga económica importante, y se comprueba periódicamente que las medidas de control siguen siendo eficaces.' },
  { k:'mod', n:'Moderado',     de:9,  a:16, t:'#7A5300', f:'#FFF0C2', tin:[122, 83, 0],   fon:[255, 240, 194], xt:'7A5300', xf:'FFF0C2',
    d:'Se deben hacer esfuerzos para reducir el riesgo, determinando las inversiones precisas; las medidas se implantan en un período determinado.' },
  { k:'imp', n:'Importante',   de:17, a:24, t:'#8A3B00', f:'#FFDDC2', tin:[138, 59, 0],   fon:[255, 221, 194], xt:'8A3B00', xf:'FFDDC2',
    d:'No debe comenzarse el trabajo hasta que se haya reducido el riesgo; puede que se precisen recursos considerables. Si es un trabajo que se está realizando, el problema se remedia en un tiempo inferior al de los riesgos moderados.' },
  { k:'int', n:'Intolerable',  de:25, a:36, t:'#9B1C1C', f:'#F8D3D3', tin:[155, 28, 28],  fon:[248, 211, 211], xt:'9B1C1C', xf:'F8D3D3',
    d:'No debe comenzar ni continuar el trabajo hasta que se reduzca el riesgo. Si no es posible reducirlo, incluso con recursos ilimitados, debe prohibirse el trabajo.' }
];
/* minería (D.S. 024-2016-EM): el nivel se marca, con el plazo del IPERC continuo de la app */
var IPL_MIN = [
  { k:'A', n:'Alto',  plazo:'0-24 horas', t:'#9B1C1C', f:'#F8D3D3', tin:[155, 28, 28], fon:[248, 211, 211], xt:'9B1C1C', xf:'F8D3D3',
    d:'Riesgo intolerable. Si el peligro no se puede controlar, los trabajos se paralizan.' },
  { k:'M', n:'Medio', plazo:'0-72 horas', t:'#7A5300', f:'#FFF0C2', tin:[122, 83, 0], fon:[255, 240, 194], xt:'7A5300', xf:'FFF0C2',
    d:'Se corrige dentro del plazo; mientras tanto, la tarea sigue con el control puesto.' },
  { k:'B', n:'Bajo',  plazo:'1 mes',      t:'#1E6B3A', f:'#DCEFE0', tin:[30, 107, 58], fon:[220, 239, 224], xt:'1E6B3A', xf:'DCEFE0',
    d:'Riesgo tolerable.' }
];
var IPL_MET = {
  rm050:{ n:'Probabilidad × severidad (índices A, B, C y D)', corto:'Probabilidad × severidad', norma:'R.M. N.° 050-2013-TR, Anexo 3' },
  ds024:{ n:'Minería: nivel Alto, Medio o Bajo', corto:'Alto, Medio o Bajo', norma:'D.S. N.° 024-2016-EM, Anexo 8' }
};
var IPL_SIG = { rm050:[['tol', 'Desde Tolerable'], ['mod', 'Desde Moderado'], ['imp', 'Desde Importante']], ds024:[['M', 'Medio y Alto'], ['A', 'Solo Alto']] };
/* 28/10/2026 · #186 · el modelo del documento. Marcelo: «te adjunté un IPERC modelo, ese será nuestro ejemplo… y crea
   otros modelos quizás, y el usuario elija cuál desea. Igualmente con los PETS».
   · 'obra': el suyo (el de su Excel): una sola tabla A3 apaisada con su cabecera (logo, título, proyecto, código,
     revisión, fecha y páginas), quién elaboró, revisó y aprobó, la leyenda de los niveles, los 4 grupos y las 28
     columnas, las filas de cada proceso, y al pie los criterios de evaluación, la normativa y las tres firmas. De su
     archivo se tomó SOLO la forma: ni nombres, ni el proyecto, ni su código, ni sus firmas.
   · 'completo': el de siempre (portada con hoja de control, índice, objetivo… y la matriz en A4 o A3).
   Un tercero «de la R.M. 050-2013-TR» no se hizo: la matriz de esa norma no se pudo verificar en una copia oficial
   (el manual de sigweb.cl la da como «elaboración propia»). Es mejor no tener un modelo que uno inventado. */
var IPL_FMT = [['obra', 'Matriz de obra (A3, en una sola tabla)', 'La matriz entera en una tabla A3 apaisada: la cabecera con el código, la revisión y las páginas, quién elaboró, revisó y aprobó, la leyenda de los niveles, cada proceso con sus peligros y, al pie, los criterios de evaluación, la normativa y las firmas. En PDF y en Excel.'],
               ['completo', 'Documento completo (portada, índice y matriz)', 'Portada con hoja de control, índice, objetivo, alcance, base legal, metodología, equipo evaluador, resumen, la matriz en A4 o A3 apaisada, las firmas y el control de cambios.']];
/* los colores del modelo de obra (los de su Excel) */
var IPL_OBRA_COL = { oscuro:'1F4E79', medio:'2E5C8A', claro:'D5E8F0', raya:'BFBFBF',
  niv:{ triv:'92D050', tol:'C6EFCE', mod:'FFE699', imp:'F4B183', 'int':'FF7C80', B:'C6EFCE', M:'FFE699', A:'FF7C80' } };
/* la jerarquía de controles (ISO 45001, 8.1.2) */
var IPL_CTL = [['eli', 'Eliminación'], ['sus', 'Sustitución'], ['ing', 'Controles de ingeniería'], ['adm', 'Controles administrativos y señalización'], ['epp', 'Equipos de protección personal']];
var IPL_ROLES = [['elab', 'Elaborado por'], ['rev', 'Revisado por'], ['apr', 'Aprobado por']];

function iplIdx(v){ v = parseInt(v, 10); return (v >= 1 && v <= 3) ? v : 0; }
/* la evaluación de una fila (la inicial o la residual): null si le falta algo */
function iplEv(e, met, sig){
  e = (e && typeof e === 'object') ? e : {};
  if(met === 'ds024'){
    var m = null; IPL_MIN.forEach(function(x){ if(x.k === e.n) m = x; });
    if(!m) return null;
    return { niv:m, mina:true, ip:null, s:null, nr:null, sig:(sig === 'A') ? m.k === 'A' : (m.k === 'A' || m.k === 'M') };
  }
  var a = iplIdx(e.a), b = iplIdx(e.b), c = iplIdx(e.c), d = iplIdx(e.d), s = iplIdx(e.s);
  if(!a || !b || !c || !d || !s) return null;
  var ip = a + b + c + d, nr = ip * s, niv = null;
  IPL_NIV.forEach(function(x){ if(nr >= x.de && nr <= x.a) niv = x; });
  var corte = ({ tol:1, mod:2, imp:3 })[sig || 'mod'] || 2;
  return { niv:niv, mina:false, ip:ip, s:s, nr:nr, sig:IPL_NIV.indexOf(niv) >= corte };
}
function iplNivDe(k){ var r = null; IPL_NIV.concat(IPL_MIN).forEach(function(x){ if(x.k === k) r = x; }); return r; }

/* ── una fila del IPERC ── */
function _iplEvLimpia(e){
  e = (e && typeof e === 'object') ? e : {};
  var o = {}; ['a', 'b', 'c', 'd', 's'].forEach(function(k){ var v = iplIdx(e[k]); if(v) o[k] = v; });
  if(/^[AMB]$/.test(String(e.n || ''))) o.n = e.n;
  return o;
}
function iplFilaLimpia(f){
  f = (f && typeof f === 'object') ? f : {};
  var c = (f.ctl && typeof f.ctl === 'object') ? f.ctl : {};
  return { id:ipTx(f.id, 24) || ipId(), proc:ipTx(f.proc, 90), act:ipTx(f.act, 140), tar:ipTx(f.tar, 180), pue:ipTx(f.pue, 90),
    rut:f.rut === 'NR' ? 'NR' : 'R', tipo:f.tipo === 'SO' ? 'SO' : 'S', pel:ipTx(f.pel, 220), rie:ipTx(f.rie, 220), con:ipTx(f.con, 220), leg:ipTx(f.leg, 220),
    ini:_iplEvLimpia(f.ini), ctl:{ eli:ipArea(c.eli, 500), sus:ipArea(c.sus, 500), ing:ipArea(c.ing, 500), adm:ipArea(c.adm, 700), epp:ipArea(c.epp, 500) },
    res:_iplEvLimpia(f.res), resp:ipTx(f.resp, 90), plazo:ipFecha(f.plazo) };
}
function iplFilaVacia(f){ return !f.pel && !f.rie && !f.act && !f.tar; }

/* ── las firmas: nombre, cargo, fecha y el trazo (o «en papel») ── */
function ipTrazoLimpio(tr){
  if(!tr || !Array.isArray(tr.p) || !tr.p.length) return null;
  var p = tr.p.filter(Array.isArray).slice(0, 80).map(function(s){
    return s.slice(0, 1600).map(function(v){ v = Math.round(+v || 0); return v < -50 ? -50 : (v > 2000 ? 2000 : v); });
  }).filter(function(s){ return s.length >= 4; });
  if(!p.length) return null;
  var h = parseInt(tr.h, 10) || 380;
  return { h:h < 60 ? 60 : (h > 1000 ? 1000 : h), p:p };
}
function ipFirmaLimpia(x){
  x = (x && typeof x === 'object') ? x : {};
  var tr = ipTrazoLimpio(x.tr), f = ipFecha(x.f);
  return { n:ipTx(x.n, 100), c:ipTx(x.c, 90), f:f, tr:f ? tr : null, t:f ? (+x.t || 0) : 0, via:f ? (tr ? 'pantalla' : 'papel') : '', por:f ? ipTx(x.por, 80) : '' };
}
function ipFirmada(x){ return !!(x && x.n && x.f); }
function ipHistLimpia(h){
  return (Array.isArray(h) ? h : []).map(function(x){
    x = (x && typeof x === 'object') ? x : {};
    return { ver:ipVer(x.ver), cambio:ipTx(x.cambio, 300), fecha:ipFecha(x.fecha), apr:ipTx(x.apr, 100), url:/^https:\/\//.test(String(x.url || '')) ? String(x.url).slice(0, 600) : '' };
  }).slice(-30);
}
function ipPubLimpia(p){
  if(!p || typeof p !== 'object' || !p.id) return null;
  return { id:String(p.id).slice(0, 60), url:/^https:\/\//.test(String(p.url || '')) ? String(p.url).slice(0, 600) : '', ver:ipVer(p.ver), al:String(p.al || '').slice(0, 30), nombre:ipTx(p.nombre, 180) };
}
function _ipFirmas(F, roles){ F = (F && typeof F === 'object') ? F : {}; var o = {}; roles.forEach(function(r){ o[r[0]] = ipFirmaLimpia(F[r[0]]); }); return o; }

/* ── el IPERC de línea base ── */
function iplLimpio(d){
  d = (d && typeof d === 'object') ? d : {};
  var met = (d.met === 'ds024') ? 'ds024' : 'rm050', sigOk = IPL_SIG[met].map(function(x){ return x[0]; });
  return { k:IPL_HOJA, v:1, id:ipTx(d.id, 24) || ipId(), tit:ipTx(d.tit, 140) || 'IPERC de línea base', cod:ipTx(d.cod, 40), ver:ipVer(d.ver), fecha:ipFecha(d.fecha),
    area:ipTx(d.area, 160), lugar:ipTx(d.lugar, 160), met:met, sig:sigOk.indexOf(d.sig) > -1 ? d.sig : (met === 'ds024' ? 'M' : 'mod'), hoja:d.hoja === 'a3' ? 'a3' : 'a4',
    formato:d.formato === 'completo' ? 'completo' : 'obra',
    obj:ipArea(d.obj, 900), alc:ipArea(d.alc, 900), leg:ipLista(d.leg, 220, 20),
    equipo:(Array.isArray(d.equipo) ? d.equipo : []).map(function(p){ p = (p && typeof p === 'object') ? p : {}; return { n:ipTx(p.n, 100), c:ipTx(p.c, 90), rol:p.rol === 'trab' ? 'trab' : 'eq' }; })
      .filter(function(p){ return p.n; }).slice(0, 30),
    filas:(Array.isArray(d.filas) ? d.filas : []).slice(0, IPL_TOPE).map(iplFilaLimpia),
    firmas:_ipFirmas(d.firmas, IPL_ROLES), hist:ipHistLimpia(d.hist), pub:ipPubLimpia(d.pub), al:String(d.al || '').slice(0, 30), por:ipTx(d.por, 80) };
}
/* los procesos, en el orden en que aparecen; cada uno con sus filas */
function iplProcesos(d){
  var por = {}, L = [];
  (d.filas || []).forEach(function(f, i){
    var k = ipNorm(f.proc) || '~';
    if(!por[k]){ por[k] = { n:f.proc || 'Sin proceso', filas:[], k:k }; L.push(por[k]); }
    por[k].filas.push({ f:f, i:i });
  });
  return L;
}
function iplResumen(d){
  var R = { n:0, ini:{}, res:{}, sinIni:0, sinRes:0, sig:0, sigRes:0, procs:iplProcesos(d).length };
  (d.filas || []).forEach(function(f){
    if(iplFilaVacia(f)) return;
    R.n++;
    var a = iplEv(f.ini, d.met, d.sig), b = iplEv(f.res, d.met, d.sig);
    if(a){ R.ini[a.niv.k] = (R.ini[a.niv.k] || 0) + 1; if(a.sig) R.sig++; } else R.sinIni++;
    if(b){ R.res[b.niv.k] = (R.res[b.niv.k] || 0) + 1; if(b.sig) R.sigRes++; } else R.sinRes++;
  });
  return R;
}
function iplNiveles(d){ return d.met === 'ds024' ? IPL_MIN : IPL_NIV; }

/* ── lo del modelo de obra que comparten el PDF y el Excel ── */
var IPL_OBRA_TIT = 'IDENTIFICACIÓN DE PELIGROS, EVALUACIÓN DE RIESGOS Y CONTROLES (IPERC) – LÍNEA BASE';
/* el título: el de siempre y, si el IPERC tiene un nombre propio («IPERC de línea base · Estructuras»), lo suyo */
function iplTituloObra(d){
  var t = String(d.tit || '').trim(), resto = t.replace(/^(matriz\s+)?iperc(\s+de)?\s+l[ií]nea\s+base\s*/i, '').replace(/^[·:\-–—,]+\s*/, '');
  if(resto === t && /^iperc$/i.test(t)) resto = '';
  return IPL_OBRA_TIT + (resto ? ' · ' + resto.toUpperCase() : '');
}
/* la base legal en dos columnas (norma | aplicación): se parte en la primera coma */
function iplNormativa(d){
  return (d.leg || []).map(function(l){ var s = String(l || ''), i = s.indexOf(', '), a = i > 0 ? s.slice(i + 2) : ''; return [i > 0 ? s.slice(0, i) : s, a.charAt(0).toUpperCase() + a.slice(1)]; })
    .filter(function(x){ return x[0]; });
}
/* los criterios de evaluación del pie: los textos verificados del método (IPL_IND, IPL_SEV, IPL_NIV) */
function iplCriterios(d, C){
  var mina = d.met === 'ds024', pe = !C || C.pais === 'pe', sigTx = (IPL_SIG[d.met].filter(function(x){ return x[0] === d.sig; })[0] || ['', ''])[1];
  var L = [];
  if(!mina){
    L.push(['Probabilidad = A + B + C + D', IPL_IND.map(function(x){ return x.c + ': ' + x.n + ' (' + x.o.map(function(o, i){ return (i + 1) + ': ' + o.charAt(0).toLowerCase() + o.slice(1); }).join(' · ') + ')'; }).join(' | ')]);
    L.push(['Severidad (S)', IPL_SEV.o.map(function(o, i){ return (i + 1) + ': ' + o.charAt(0).toLowerCase() + o.slice(1); }).join(' · ') + '. S: seguridad · SO: salud ocupacional.']);
    L.push(['Nivel de riesgo (R = P × S)', IPL_NIV.map(function(n){ return n.n + ': ' + (n.de === n.a ? n.de : n.de + '–' + n.a); }).join(' · ') + (pe ? ' (R.M. N.° 050-2013-TR, Anexo 3).' : '.')]);
  }else{
    L.push(['Nivel de riesgo', IPL_MIN.map(function(n){ return n.n + ': ' + n.d.charAt(0).toLowerCase() + n.d.slice(1).replace(/\.$/, '') + ' (corregir en ' + n.plazo + ')'; }).join(' · ') +
      (pe ? '. Lo marca la empresa con su matriz (D.S. N.° 024-2016-EM; los plazos son los del IPERC continuo).' : '.')]);
  }
  L.push(['Riesgo significativo', (sigTx ? sigTx : '—') + ' (lo define la empresa): un riesgo significativo no se acepta sin sus medidas de control.']);
  L.push(['Evaluación', 'Inicial: con los controles que ya existen. Residual: con las medidas de control propuestas, en el orden de la jerarquía de controles (ISO 45001:2018, 8.1.2): eliminación, sustitución, ingeniería, administrativos y EPP.']);
  return L;
}
/* los controles de una fila: eliminación y sustitución vacías dicen «No aplica» solo si la fila tiene algún otro control */
function iplCtlObra(f){
  var c = f.ctl || {}, otro = !!(c.ing || c.adm || c.epp || c.eli || c.sus);
  return { eli:c.eli || (otro ? 'No aplica' : ''), sus:c.sus || (otro ? 'No aplica' : ''), ing:c.ing || '', adm:c.adm || '', epp:c.epp || '' };
}
/* las columnas del modelo de obra, con los anchos de su Excel (en caracteres); en minería, sin los índices */
function iplColsObra(d, pdf){
  var mina = d.met === 'ds024', wN = pdf ? 15 : 12, wC = pdf ? 31 : 34;   /* en el PDF, «INTOLERABLE» entra entero en su celda */
  var C = [{ k:'n', t:'N°', w:5, al:'center' }, { k:'act', t:'Actividad / Tarea', w:22 }, { k:'rut', t:'Tipo', w:6, al:'center' }, { k:'pue', t:'Puesto / Expuestos', w:16 },
           { k:'pel', t:'Peligro', w:26 }, { k:'rie', t:'Riesgo', w:24 }, { k:'con', t:'Consecuencia', w:22 }];
  var ev = function(s){ return mina ? [{ k:s + 'niv', t:'Nivel', w:22, al:'center', niv:s }]
    : [{ k:s + 'a', t:'A', w:4, al:'center' }, { k:s + 'b', t:'B', w:4, al:'center' }, { k:s + 'c', t:'C', w:4, al:'center' }, { k:s + 'd', t:'D', w:4, al:'center' },
       { k:s + 'p', t:'P', w:5, al:'center' }, { k:s + 's', t:'S', w:5, al:'center' }, { k:s + 'r', t:'R', w:5, al:'center' }, { k:s + 'niv', t:'Nivel', w:wN, al:'center', niv:s }]; };
  C = C.concat(ev('i'));
  C = C.concat([{ k:'eli', t:'Eliminación', w:14 }, { k:'sus', t:'Sustitución', w:14 }, { k:'ing', t:'Ingeniería', w:wC }, { k:'adm', t:'Administrativo', w:wC }, { k:'epp', t:'EPP', w:26 }]);
  return C.concat(ev('r'));
}
/* los cuatro grupos (índices de columna desde–hasta) */
function iplGruposObra(cols){
  var ix = function(k){ for(var i = 0; i < cols.length; i++) if(cols[i].k === k) return i; return -1; };
  var i0 = ix('ia') > -1 ? ix('ia') : ix('iniv'), r0 = ix('ra') > -1 ? ix('ra') : ix('rniv');
  return [{ t:'IDENTIFICACIÓN DE PELIGRO Y RIESGO', de:0, a:i0 - 1 }, { t:'EVALUACIÓN DEL RIESGO (INICIAL)', de:i0, a:ix('iniv') },
          { t:'MEDIDAS DE CONTROL (JERARQUÍA)', de:ix('eli'), a:ix('epp') }, { t:'EVALUACIÓN DEL RIESGO (RESIDUAL)', de:r0, a:cols.length - 1 }];
}
/* lo de cada celda de una fila */
function iplCeldasObra(f, n, d){
  var a = iplEv(f.ini, d.met, d.sig), b = iplEv(f.res, d.met, d.sig), ctl = iplCtlObra(f), cel = { a:a, b:b };
  cel.n = String(n); cel.act = [f.act, f.tar].filter(Boolean).join(' – '); cel.rut = f.rut || ''; cel.pue = f.pue || ''; cel.pel = f.pel || ''; cel.rie = f.rie || ''; cel.con = f.con || '';
  [['i', f.ini, a], ['r', f.res, b]].forEach(function(q){
    var e = q[1] || {}, ev = q[2];
    ['a', 'b', 'c', 'd', 's'].forEach(function(k){ cel[q[0] + k] = e[k] ? String(e[k]) : ''; });
    cel[q[0] + 'p'] = ev && ev.ip != null ? String(ev.ip) : ''; cel[q[0] + 'r'] = ev && ev.nr != null ? String(ev.nr) : '';
    cel[q[0] + 'niv'] = ev ? ev.niv.n.toUpperCase() : '';
  });
  ['eli', 'sus', 'ing', 'adm', 'epp'].forEach(function(k){ cel[k] = ctl[k]; });
  return cel;
}

/* ── el PETS (D.S. 024-2016-EM, Anexo 10, con lo que pide una obra) ── */
var PETS_ROLES = [['prep', 'Preparado por'], ['rev1', 'Revisado por'], ['rev2', 'Revisado por'], ['apr', 'Aprobado por']];
/* 28/10/2026 · #186 · el modelo del PETS: el completo (el de siempre) o el del Anexo 10, corto (fuera del Perú, «corto») */
var PETS_FMT = [['completo', 'Documento completo (portada, índice y todo lo de la obra)', 'Portada con su índice, objetivo, alcance, referencias, definiciones, responsabilidades, personal, EPP, equipos, peligros, procedimiento, restricciones, registros, las cuatro firmas, los participantes y el control de cambios.'],
                ['anexo10', 'Formato del Anexo 10 (D.S. 024-2016-EM)', 'Una o dos hojas, como el Anexo 10: personal, EPP, equipo, herramientas y materiales, procedimiento y restricciones, con las cuatro firmas y las fechas de elaboración y de aprobación. Lo demás (objetivo, definiciones, peligros, participantes) sale solo en el completo.']];
function petsLimpio(d){
  d = (d && typeof d === 'object') ? d : {};
  var par = function(a, k1, n1, k2, n2, max){ return (Array.isArray(a) ? a : []).map(function(x){ x = (x && typeof x === 'object') ? x : {}; var o = {}; o[k1] = ipTx(x[k1], n1); o[k2] = ipArea(x[k2], n2); return o; }).filter(function(x){ return x[k1] || x[k2]; }).slice(0, max); };
  var ipl = (d.ipl && typeof d.ipl === 'object' && d.ipl.id) ? { id:ipTx(d.ipl.id, 60), cod:ipTx(d.ipl.cod, 40), tit:ipTx(d.ipl.tit, 140) } : null;
  return { k:PETS_HOJA, v:1, id:ipTx(d.id, 24) || ipId(), tit:ipTx(d.tit, 140) || 'PETS', cod:ipTx(d.cod, 40), ver:ipVer(d.ver), fecha:ipFecha(d.fecha),
    formato:d.formato === 'anexo10' ? 'anexo10' : 'completo',
    area:ipTx(d.area, 120), lugar:ipTx(d.lugar, 160), obj:ipArea(d.obj, 900), alc:ipArea(d.alc, 900), refs:ipLista(d.refs, 220, 20),
    defs:par(d.defs, 't', 80, 'd', 500, 20), resp:par(d.resp, 'q', 90, 'd', 600, 15),
    pers:(Array.isArray(d.pers) ? d.pers : []).map(function(x){ x = (x && typeof x === 'object') ? x : {}; var n = parseInt(x.n, 10); return { c:ipTx(x.c, 90), n:(n > 0 && n < 1000) ? n : 0, req:ipArea(x.req, 400) }; })
      .filter(function(x){ return x.c; }).slice(0, 20),
    epp:ipLista(d.epp, 90, 40), eq:ipLista(d.eq, 120, 40), her:ipLista(d.her, 120, 40), mat:ipLista(d.mat, 120, 40),
    pel:(Array.isArray(d.pel) ? d.pel : []).map(function(x){ x = (x && typeof x === 'object') ? x : {}; return { p:ipTx(x.p, 220), r:ipTx(x.r, 220), c:ipArea(x.c, 700) }; })
      .filter(function(x){ return x.p || x.r; }).slice(0, 60),
    pasos:(Array.isArray(d.pasos) ? d.pasos : []).map(function(x){ x = (x && typeof x === 'object') ? x : {}; return { t:ipArea(x.t, 900), rie:ipArea(x.rie, 500), ctl:ipArea(x.ctl, 700) }; })
      .filter(function(x){ return x.t; }).slice(0, PETS_TOPE),
    restr:ipLista(d.restr, 300, 30), regs:ipLista(d.regs, 120, 20),
    part:(Array.isArray(d.part) ? d.part : []).map(function(x){ x = (x && typeof x === 'object') ? x : {}; return { n:ipTx(x.n, 100), dni:ipTx(x.dni, 20), c:ipTx(x.c, 90) }; })
      .filter(function(x){ return x.n; }).slice(0, 40),
    ipl:ipl, firmas:_ipFirmas(d.firmas, PETS_ROLES), hist:ipHistLimpia(d.hist), pub:ipPubLimpia(d.pub), al:String(d.al || '').slice(0, 30), por:ipTx(d.por, 80) };
}
/* las listas de partida (sugerencias que la empresa elige; nada es norma) */
var PETS_EPP = ['Casco de seguridad', 'Barbiquejo', 'Lentes de seguridad', 'Careta facial', 'Careta de soldar', 'Protección auditiva (tapones u orejeras)',
  'Respirador con filtro para polvo', 'Respirador con filtro para gases y vapores', 'Guantes de cuero', 'Guantes de nitrilo o neopreno', 'Guantes dieléctricos',
  'Zapatos de seguridad con puntera', 'Botas de jebe con puntera', 'Botas dieléctricas', 'Chaleco con cintas reflectivas', 'Ropa de trabajo',
  'Arnés de cuerpo entero con línea de vida y absorbedor', 'Mandil, mangas y escarpines de cuero', 'Traje de protección química', 'Bloqueador solar', 'Cortaviento o legionario'];
var PETS_RESTR = [
  'No se inicia la tarea sin el ATS llenado y firmado por la cuadrilla.',
  'Si es un trabajo de alto riesgo, no se inicia sin el permiso de trabajo (PETAR) firmado y autorizado.',
  'Solo realiza la tarea el personal capacitado en este PETS y autorizado por su supervisor.',
  'No se usan equipos ni herramientas sin inspeccionar o en mal estado.',
  'No se realiza la tarea sin el EPP completo y en buen estado.',
  'La tarea se detiene si cambian las condiciones (lluvia, viento fuerte, tormenta eléctrica, poca luz) o aparece un peligro que no estaba previsto.',
  'Nadie trabaja bajo los efectos del alcohol o de drogas, ni con fatiga o malestar.'
];
var PETS_REGS = ['ATS', 'Permiso de trabajo de alto riesgo (PETAR)', 'Inspección de equipos y herramientas', 'Inspección de EPP', 'Registro de capacitación en este PETS'];
var PETS_RESP = [
  { q:'Residente de obra', d:'Aprueba el PETS, da los recursos para cumplirlo y verifica que se aplique.' },
  { q:'Prevencionista o supervisor de SST', d:'Revisa el PETS, capacita a la cuadrilla y verifica en campo que se cumpla.' },
  { q:'Capataz o supervisor de la tarea', d:'Dirige la tarea según el PETS, llena el ATS con su cuadrilla y la detiene si cambian las condiciones.' },
  { q:'Trabajadores', d:'Cumplen el PETS, usan su EPP, participan en el ATS y reportan los peligros, los incidentes y los actos o condiciones subestándar.' }
];
/* los cargos de cada firma: los del Anexo 10 en minería; en las demás, los de una obra (se cambian) */
function petsCargos(sector){
  if(sector === 'mineria') return { prep:'Supervisor de la tarea', rev1:'Supervisor del área', rev2:'Gerente del área / Gerente de Seguridad y Salud Ocupacional', apr:'Gerente de Operaciones' };
  return { prep:'Supervisor o capataz de la tarea', rev1:'Ingeniero de campo o de producción', rev2:'Prevencionista / jefe de SSOMA', apr:'Residente de obra' };
}
function iplCargos(sector){
  if(sector === 'mineria') return { elab:'Supervisor del área', rev:'Gerente de Seguridad y Salud Ocupacional', apr:'Gerente de Operaciones' };
  return { elab:'Prevencionista / supervisor de SST', rev:'Ingeniero residente o jefe de producción', apr:'Gerente de proyecto o residente de obra' };
}

/* ── lo que se escribe solo al empezar (C: { razon, obra, sector, pais, hoy, n }) ── */
function ipetsBaseLegal(C, que){
  if(C.pais !== 'pe') return ['ISO 45001:2018, Sistemas de gestión de la seguridad y salud en el trabajo (6.1.2 y 8.1.2)'];
  var L = ['Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo', 'D.S. N.° 005-2012-TR, Reglamento de la Ley de Seguridad y Salud en el Trabajo'];
  if(que === 'ipl') L.push('R.M. N.° 050-2013-TR, formatos referenciales del Sistema de Gestión de la SST (Anexo 3: el IPERC)');
  if(C.sector === 'mineria') L.push('D.S. N.° 024-2016-EM, Reglamento de Seguridad y Salud Ocupacional en Minería' + (que === 'ipl' ? ' (Anexo 8: IPERC de línea base)' : ' (art. 33 y Anexo 10)'));
  else if(C.sector === 'construccion' || !C.sector) L.push('D.S. N.° 011-2019-TR, Reglamento de Seguridad y Salud en el Trabajo para el Sector Construcción');
  if(que === 'ipl') L.push('ISO 45001:2018, Sistemas de gestión de la seguridad y salud en el trabajo (6.1.2 y 8.1.2)');
  return L;
}
function _ipDos(n){ n = Math.max(1, parseInt(n, 10) || 1); return n < 10 ? '0' + n : String(n); }
function iplNuevo(C, tit){
  var obra = C.obra || 'la obra', razon = C.razon || 'la empresa', cg = iplCargos(C.sector), F = {};
  IPL_ROLES.forEach(function(r){ F[r[0]] = { c:cg[r[0]] }; });
  return iplLimpio({ tit:tit || 'IPERC de línea base', cod:'IPERC-LB-' + _ipDos(C.n), ver:'01', fecha:C.hoy, met:(C.sector === 'mineria' && C.pais === 'pe') ? 'ds024' : 'rm050', formato:'obra',
    obj:'Identificar los peligros, evaluar los riesgos y establecer las medidas de control de los procesos, actividades y tareas de ' + obra + ', para eliminar los peligros o reducir sus riesgos a un nivel aceptable.',
    alc:'Aplica a todos los procesos, actividades y tareas, rutinarias y no rutinarias, de ' + obra + ', realizadas por el personal de ' + razon + ' y de sus subcontratistas, y a las visitas.',
    leg:ipetsBaseLegal(C, 'ipl'), firmas:F, hist:[{ ver:'01', cambio:'Elaboración del documento' }] });
}
function petsTextos(C, tit){
  var obra = C.obra || 'la obra', razon = C.razon || 'la empresa', t = tit ? '«' + tit + '»' : 'esta tarea';
  return { obj:'Establecer la forma correcta y segura de realizar ' + (tit ? 'la tarea ' + t : t) + ', paso a paso, para prevenir accidentes de trabajo, enfermedades ocupacionales y daños a la propiedad.',
           alc:'Aplica a todo el personal de ' + razon + ' y de sus subcontratistas que realice ' + (tit ? 'la tarea ' + t : t) + ' en ' + obra + '.' };
}
function petsNuevo(C, tit){
  var x = petsTextos(C, tit), cg = petsCargos(C.sector), F = {};
  PETS_ROLES.forEach(function(r){ F[r[0]] = { c:cg[r[0]] }; });
  return petsLimpio({ tit:tit || 'PETS', cod:'PETS-' + _ipDos(C.n), ver:'01', fecha:C.hoy, obj:x.obj, alc:x.alc, refs:ipetsBaseLegal(C, 'pets'),
    restr:PETS_RESTR.slice(0, 3).map(function(s){ return C.pais === 'pe' ? s : s.replace(' (PETAR)', ''); }), regs:['ATS'], firmas:F,
    hist:[{ ver:'01', cambio:'Elaboración del documento' }] });
}

/* ── el estado de un documento (por sus firmas y su publicación) ── */
var IPETS_EST = { bor:{ n:'Borrador', cl:'gris' }, firmas:{ n:'En firmas', cl:'ojo' }, apr:{ n:'Aprobado', cl:'ok' }, pub:{ n:'Publicado', cl:'azul' } };
function ipetsEstado(d, roles){
  var F = d.firmas || {};
  if(ipFirmada(F.apr)) return (d.pub && d.pub.ver === d.ver) ? 'pub' : 'apr';
  return roles.some(function(r){ return ipFirmada(F[r[0]]); }) ? 'firmas' : 'bor';
}
function ipetsFaltan(d, roles){ var F = d.firmas || {}; return roles.filter(function(r){ return !ipFirmada(F[r[0]]); }); }
/* una versión nueva: las firmas se vuelven a dar (quedan el nombre y el cargo) y el cambio va al control de cambios */
function ipetsNuevaVersion(d, roles, cambio, hoy){
  var x = JSON.parse(JSON.stringify(d)), ver = ipVerSig(d.ver);
  roles.forEach(function(r){ var f = x.firmas[r[0]] || {}; x.firmas[r[0]] = { n:f.n || '', c:f.c || '' }; });
  x.ver = ver; x.fecha = ipFecha(hoy);
  x.hist = ipetsHistVigente(d).concat([{ ver:ver, cambio:ipTx(cambio, 300) || 'Actualización' }]);
  return x;
}
/* el control de cambios, con lo de la versión vigente al día (quién la aprobó, cuándo, su PDF publicado) */
function ipetsHistVigente(d){
  var H = (d.hist || []).slice(), apr = (d.firmas || {}).apr || {};
  if(!H.length || H[H.length - 1].ver !== d.ver) H.push({ ver:d.ver, cambio:H.length ? 'Actualización' : 'Elaboración del documento', fecha:'', apr:'', url:'' });
  var u = H[H.length - 1];
  if(ipFirmada(apr)){ u.fecha = apr.f; u.apr = apr.n; }
  if(d.pub && d.pub.ver === d.ver && d.pub.url) u.url = d.pub.url;
  return H;
}
/* el nombre con el que va a «Documentos» (y a la constancia de difusión): con su versión */
function ipetsNombreDoc(d, que){
  var base = que === 'pets' ? 'PETS · ' + (d.cod ? d.cod + ' · ' : '') + d.tit : d.tit + (d.cod ? ' · ' + d.cod : '');
  return ipTx(base + ' · v' + d.ver, 180);
}

/* ── la base de peligros del ATS (papeles-app.js, ATS_PREG) → filas del IPERC ── */
/* el control del ATS viene en una sola frase («Arnés…, permiso…, señalizar…»): se reparte en la jerarquía por sus palabras */
var IPL_KW_EPP = /\b(casco|barbiquejo|lentes|careta|tapones|orejeras|protecci[oó]n auditiva|respirador|mascarilla|guantes?|botas|zapatos|calzado|chaleco|arn[eé]s|mandil|mangas|escarpines|traje|bloqueador|legionario|cortaviento|uniforme|ropa de trabajo|epp)\b/i;
var IPL_KW_ING = /(baranda|guarda\b|entibad|talud|ventilaci|extractor|\btapas?\b|malla|interruptor diferencial|puesta a tierra|arrestallamas|pasarela|tabl[oó]n|l[ií]nea de vida|aislamiento|resguardo|barrera|cerco|cerramiento|rodapi|plataforma|calzas|iluminaci[oó]n|bombear|detector)/i;
var IPL_KW_SUS = /\b(sustitu|reemplaz|cambiar por)/i;
var IPL_KW_SO = /(ruido|polvo|radiaci|\buv\b|humos?\b|vapores|\bgases\b|qu[ií]mic|solvente|sobreesfuerzo|postura|ergon|vibraci|calor|t[eé]rmic|biol[oó]gic|psicosocial|estr[eé]s|insolaci)/i;
/* cada parte va a un escalón: la sustitución por su palabra; lo que prohíbe, a lo administrativo; lo que empieza por un
   EPP, al EPP; lo que es una barrera física, a ingeniería; lo demás, administrativo. Es una sugerencia: se revisa. */
function iplRepartir(m){
  var o = { eli:[], sus:[], ing:[], adm:[], epp:[] }, partes = [];
  String(m || '').split(/\s*[,;]\s*/).forEach(function(p){
    p = ipTx(p, 220); if(!p) return;
    /* «…, en buen estado y sin hechizas»: un pedazo que empieza con preposición va con el anterior */
    if(partes.length && /^(en|sin|con|de|del|al?|que|y|o|para|por|seg[uú]n|hasta)\b/i.test(p)) partes[partes.length - 1] += ', ' + p;
    else partes.push(p);
  });
  partes.forEach(function(p){
    var ini = p.split(/\s+/).slice(0, 3).join(' ');
    var k = IPL_KW_SUS.test(p) ? 'sus' : (/^(no|nunca|prohibido|evitar)\b/i.test(p) ? 'adm' : (IPL_KW_EPP.test(ini) ? 'epp' : (IPL_KW_ING.test(p) ? 'ing' : (IPL_KW_EPP.test(p) ? 'epp' : 'adm'))));
    o[k].push(p.charAt(0).toUpperCase() + p.slice(1));
  });
  var r = {}; Object.keys(o).forEach(function(k){ r[k] = o[k].join('\n'); });
  return r;
}
function iplDesdeAts(h, base){
  base = base || {};
  return iplFilaLimpia({ proc:base.proc, act:base.act, tar:base.tar, rut:base.rut, tipo:IPL_KW_SO.test(h.p + ' ' + h.r) ? 'SO' : 'S',
    pel:h.p, rie:h.r, con:h.c, ctl:iplRepartir(h.m) });
}


/* ══ LOS PDF DEL IPERC DE LÍNEA BASE Y DEL PETS (27/10/2026) ═════════════════════════════════════════════════════
   Un documento controlado: en cada hoja la cabecera de siempre (el logo de la empresa, el título, el código, la
   versión, la fecha y «página X de Y»), la portada con sus datos y su hoja de control, el índice con el número de
   página de cada parte (se arma dos veces: la primera solo cuenta las páginas) y las firmas con su trazo (o el
   espacio para firmar en papel). El IPERC va en A4 vertical y su matriz en A4 o A3 horizontal; el PETS, en A4. */
var IPT = 0.352778;   /* 1 punto en mm */
var IPDF = { tinta:[22, 30, 38], gris:[88, 100, 110], suave:[125, 136, 146], raya:[160, 171, 180], rayaF:[205, 213, 220],
  cab:[23, 52, 77], cab2:[226, 233, 239], cab3:[240, 244, 247], zebra:[248, 250, 251], blanco:[255, 255, 255] };
function _ipP(s){
  return String(s == null ? '' : s).replace(/…/g, '...').replace(/[‘´]/g, '’').replace(/≤/g, '<=').replace(/≥/g, '>=')
    .replace(/[→➔]/g, '->').replace(/[^\u0000-ÿ–—’“”•€\n]/g, '').replace(/[ \t]+/g, ' ');
}
/* el logo sin su marco blanco (en la app se guarda centrado en un cuadrado blanco), con su proporción */
var _IP_LOGO = {};
function ipLogoListo(du){
  if(!du) return Promise.resolve(null);
  var llave = du.length + ':' + du.slice(-40);
  if(_IP_LOGO[llave]) return Promise.resolve(_IP_LOGO[llave]);
  return new Promise(function(res){
    var im = new Image();
    im.onload = function(){
      var W = im.naturalWidth, H = im.naturalHeight;
      if(!W || !H) return res(null);
      try{
        var k = Math.min(1, 700 / Math.max(W, H)), w = Math.max(1, Math.round(W * k)), h = Math.max(1, Math.round(H * k));
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h);
        var px = g.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1, x, y, i;
        for(y = 0; y < h; y++) for(x = 0; x < w; x++){ i = (y * w + x) * 4; if(px[i] < 240 || px[i + 1] < 240 || px[i + 2] < 240){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; } }
        if(x1 < 0) return res(null);
        var m = Math.round(Math.max(x1 - x0, y1 - y0) * 0.03);
        x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
        var cw = x1 - x0 + 1, ch = y1 - y0 + 1, c2 = document.createElement('canvas'); c2.width = cw; c2.height = ch;
        var g2 = c2.getContext('2d'); g2.fillStyle = '#fff'; g2.fillRect(0, 0, cw, ch); g2.drawImage(cv, x0, y0, cw, ch, 0, 0, cw, ch);
        _IP_LOGO[llave] = { du:c2.toDataURL('image/jpeg', 0.92), r:cw / ch };
      }catch(e){ _IP_LOGO[llave] = { du:du, r:W / H }; }
      res(_IP_LOGO[llave]);
    };
    im.onerror = function(){ res(null); };
    im.src = du;
  });
}
function _ipFirmaPDF(doc, tr, x, y, w, h){
  if(!tr || !tr.p || !tr.p.length) return;
  var prop = (tr.h || 380) / 1000, k = Math.min(w / 1000, h / (1000 * prop)), aw = 1000 * k, ah = 1000 * prop * k;
  var ox = x + (w - aw) / 2, oy = y + (h - ah) / 2;
  doc.setDrawColor(16, 24, 32); doc.setLineWidth(Math.max(0.18, aw / 240));
  try{ doc.setLineCap('round'); doc.setLineJoin('round'); }catch(e){}
  tr.p.forEach(function(s){
    var pasos = [], px = s[0] * k, py = s[1] * k;
    for(var i = 2; i < s.length; i += 2){ var nx = s[i] * k, ny = s[i + 1] * k; pasos.push([nx - px, ny - py]); px = nx; py = ny; }
    if(pasos.length) try{ doc.lines(pasos, ox + s[0] * k, oy + s[1] * k); }catch(e){}
  });
  try{ doc.setLineCap('butt'); doc.setLineJoin('miter'); }catch(e){}
  doc.setLineWidth(0.25);
}

/* ══ el armazón: páginas, cabecera, pie, texto, tablas, índice y firmas ══ */
function _ipDoc(C, meta, op){
  op = op || {};
  var J = window.jspdf.jsPDF, doc = new J({ unit:'mm', format:op.fmt || 'a4', orientation:op.orient || 'portrait', compress:true });
  var P = { doc:doc, C:C, meta:meta, y:0, marcas:{}, fmt:op.fmt || 'a4', orient:op.orient || 'portrait', hojaAncha:{} };
  P.W = function(){ return doc.internal.pageSize.getWidth(); };
  P.H = function(){ return doc.internal.pageSize.getHeight(); };
  P.M = function(){ return P.W() > P.H() ? 10 : 15; };
  P.ancho = function(){ return P.W() - 2 * P.M(); };
  P.top = function(){ return 36; };
  P.fondo = function(){ return P.H() - (P.hojaAncha[doc.getCurrentPageInfo().pageNumber] ? 17 : 13); };
  P.pag = function(){ return doc.getCurrentPageInfo().pageNumber; };
  P.fuente = function(fs, b, col, it){ doc.setFont('helvetica', b ? 'bold' : (it ? 'italic' : 'normal')); doc.setFontSize(fs); doc.setTextColor.apply(doc, col || IPDF.tinta); };
  P.lineas = function(t, w, fs, b){ P.fuente(fs, b); return doc.splitTextToSize(_ipP(t), Math.max(2, w)); };
  P.nueva = function(fmt, orient){ P.fmt = fmt || P.fmt; P.orient = orient || P.orient; doc.addPage(P.fmt, P.orient); P.cab(); P.y = P.top(); };
  P.sitio = function(h){ if(P.y + h > P.fondo()){ P.nueva(); return true; } return false; };
  /* la cabecera: logo | título | código, versión, fecha y página */
  P.cab = function(){
    var W = P.W(), M = P.M(), y = 8, h = 22, wL = 42, wR = 48, wC = W - 2 * M - wL - wR, x2 = M + wL, x3 = W - M - wR;
    doc.setDrawColor.apply(doc, IPDF.raya); doc.setLineWidth(0.3);
    doc.rect(M, y, W - 2 * M, h); doc.line(x2, y, x2, y + h); doc.line(x3, y, x3, y + h);
    if(C.logo){
      var bw = wL - 6, bh = h - 6, lw = bw, lh = bw / (C.logo.r || 1);
      if(lh > bh){ lh = bh; lw = bh * (C.logo.r || 1); }
      try{ doc.addImage(C.logo.du, 'JPEG', M + (wL - lw) / 2, y + (h - lh) / 2, lw, lh, 'logo', 'FAST'); }catch(e){}
    }else{
      var lr = P.lineas(C.razon || 'Empresa', wL - 6, 8, true).slice(0, 3);
      P.fuente(8, true, IPDF.tinta); doc.text(lr, M + wL / 2, y + h / 2 - (lr.length - 1) * 1.6 + 1, { align:'center' });
    }
    var t1 = P.lineas(meta.cab1, wC - 8, 10.5, true).slice(0, 2), t2 = P.lineas(meta.cab2 || '', wC - 8, 7.5, false).slice(0, 2);
    var alto = t1.length * 4.4 + (t2.length ? 1.2 + t2.length * 3.2 : 0), yy = y + (h - alto) / 2 + 3.4;
    P.fuente(10.5, true, IPDF.cab); doc.text(t1, x2 + wC / 2, yy, { align:'center', lineHeightFactor:1.2 }); yy += t1.length * 4.4 + 1.2;
    if(t2.length){ P.fuente(7.5, false, IPDF.gris); doc.text(t2, x2 + wC / 2, yy, { align:'center', lineHeightFactor:1.2 }); }
    var filas = [['Código', meta.cod || '—'], ['Versión', meta.ver || '01'], ['Fecha', meta.fecha || '—'], ['Página', '']];
    filas.forEach(function(f, i){
      var fy = y + i * (h / 4);
      if(i) { doc.setDrawColor.apply(doc, IPDF.rayaF); doc.line(x3, fy, W - M, fy); }
      P.fuente(6.8, false, IPDF.suave); doc.text(f[0], x3 + 2.2, fy + 3.7);
      P.fuente(7.6, true, IPDF.tinta); doc.text(_ipP(f[1]).slice(0, 34), W - M - 2.2, fy + 3.7, { align:'right' });
    });
  };
  /* al final: «página X de Y» y el pie */
  P.fin = function(){
    var n = doc.getNumberOfPages(), hoy = ipDma(C.hoy) || '';
    for(var i = 1; i <= n; i++){
      doc.setPage(i);
      var W = P.W(), M = P.M(), H = P.H(), wR = 48, x3 = W - M - wR, fy = 8 + 3 * (22 / 4);
      P.fuente(7.6, true, IPDF.tinta); doc.text(i + ' de ' + n, W - M - 2.2, fy + 3.7, { align:'right' });
      if(P.hojaAncha[i] && meta.leyenda){
        P.fuente(6.2, false, IPDF.gris); doc.text(doc.splitTextToSize(_ipP(meta.leyenda), W - 2 * M).slice(0, 2), M, H - 13.2);
      }
      doc.setDrawColor.apply(doc, IPDF.rayaF); doc.setLineWidth(0.2); doc.line(M, H - 9.5, W - M, H - 9.5);
      P.fuente(6.8, false, IPDF.suave); doc.text(_ipP(meta.pie || ''), M, H - 6);
      if(hoy) doc.text('Impreso el ' + hoy, W - M, H - 6, { align:'right' });
    }
    return doc;
  };
  /* un título de sección (se anota su página para el índice) */
  P.h1 = function(k, num, t, sigue){
    if(P.y > P.top() + 2) P.y += 3;
    P.sitio(16 + Math.min(sigue || 10, 70));
    P.marcas[k] = P.pag();
    P.fuente(10.5, true, IPDF.cab); doc.text(_ipP((num ? num + '. ' : '') + t).toUpperCase(), P.M(), P.y + 3.6);
    P.y += 5.4; doc.setDrawColor.apply(doc, IPDF.cab); doc.setLineWidth(0.45); doc.line(P.M(), P.y, P.M() + P.ancho(), P.y); doc.setLineWidth(0.25);
    P.y += 4.2;
  };
  P.h2 = function(k, t){
    P.sitio(12); if(k) P.marcas[k] = P.pag();
    P.fuente(9.2, true, IPDF.tinta); doc.text(_ipP(t), P.M(), P.y + 3.2); P.y += 6;
  };
  P.par = function(t, op){
    op = op || {}; var fs = op.fs || 9.3, lh = fs * IPT * 1.38, x = P.M() + (op.sang || 0), w = P.ancho() - (op.sang || 0);
    String(t == null ? '' : t).split('\n').forEach(function(pz){
      var L = P.lineas(pz, w, fs, op.b);
      L.forEach(function(l){ P.sitio(lh); P.fuente(fs, op.b, op.col, op.it); doc.text(l, x, P.y + fs * IPT * 0.95); P.y += lh; });
    });
    P.y += (op.tras == null ? 2 : op.tras);
  };
  P.vinetas = function(L, op){
    op = op || {}; var fs = op.fs || 9.3, lh = fs * IPT * 1.38, M = P.M(), w = P.ancho() - 6;
    L = L || [];
    /* una lista corta de cosas cortas va en dos columnas */
    if(!op.num && L.length > 3 && L.every(function(t){ return String(t).length <= 44; })){
      var mitad = Math.ceil(L.length / 2), cw = P.ancho() / 2;
      P.sitio(Math.min(mitad * (lh + 0.8), 60));
      for(var r = 0; r < mitad; r++){
        P.sitio(lh + 0.8);
        [L[r], L[r + mitad]].forEach(function(t, j){
          if(!t) return;
          var x = M + j * cw; P.fuente(fs, false, IPDF.tinta);
          doc.setFillColor.apply(doc, IPDF.cab); doc.circle(x + 2, P.y + fs * IPT * 0.6, 0.55, 'F');
          doc.text(P.lineas(t, cw - 8, fs)[0] || '', x + 6, P.y + fs * IPT * 0.95);
        });
        P.y += lh + 0.8;
      }
      P.y += 1.4; return;
    }
    var total = L.reduce(function(s, t){ return s + P.lineas(t, w, fs).length * lh + 0.8; }, 0);
    if(total < 60) P.sitio(total);
    L.forEach(function(t, i){
      var lin = P.lineas(t, w, fs);
      lin.forEach(function(l, j){
        P.sitio(lh); P.fuente(fs, false, IPDF.tinta);
        if(!j){ if(op.num) doc.text((i + 1) + '.', M + 1, P.y + fs * IPT * 0.95); else { doc.setFillColor.apply(doc, IPDF.cab); doc.circle(M + 2, P.y + fs * IPT * 0.6, 0.55, 'F'); } }
        doc.text(l, M + 6, P.y + fs * IPT * 0.95); P.y += lh;
      });
      P.y += 0.8;
    });
    P.y += 1.4;
  };
  /* una tabla: cols [{t, w (relativo), al, b, fs}], filas [[...celdas]] o {c:[...], fon:[r,g,b]|fn, banda:texto, k:marca}.
     La cabecera se repite en cada hoja; ninguna fila se parte entre hojas. op: {fs, cabFs, grupos:[{t, de, a}], zebra, x, ancho, minAlto} */
  P.tabla = function(cols, filas, op){
    op = op || {};
    var fs = op.fs || 8.2, lh = fs * IPT * 1.22, pad = 1.3, x0 = op.x != null ? op.x : P.M(), AW = op.ancho || P.ancho();
    var tot = cols.reduce(function(s, c){ return s + c.w; }, 0), ws = cols.map(function(c){ return c.w * AW / tot; });
    var xs = []; ws.reduce(function(s, w, i){ xs[i] = s; return s + w; }, x0);
    var cfs = op.cabFs || Math.max(6, fs - 0.6), clh = cfs * IPT * 1.18;
    /* 28/10/2026 · los colores (op.tema): los de siempre, o los del modelo de obra */
    var tm = op.tema || {}, cCab = tm.cab || IPDF.cab, cCabTx = tm.cabTx || IPDF.blanco, cGru = tm.gru || IPDF.cab2, cGruTx = tm.gruTx || IPDF.cab,
        cBan = tm.banda || IPDF.cab3, cBanTx = tm.bandaTx || IPDF.cab, cRaya = tm.raya || IPDF.raya, bfs = op.bandaFs || fs + 0.4;
    var cabL = cols.map(function(c, i){ return P.lineas(c.t, ws[i] - 2 * pad, cfs, true); });
    var cabH = op.sinCab ? 0 : Math.max.apply(null, cabL.map(function(l){ return l.length; })) * clh + 2 * pad + 0.6;
    /* el título de cada grupo, partido si no entra en su ancho */
    var gruL = (op.grupos || []).map(function(g){ return P.lineas(g.t, xs[g.a] + ws[g.a] - xs[g.de] - 2, cfs, true); });
    var gruH = op.grupos ? Math.max(5.2, Math.max.apply(null, gruL.map(function(l){ return l.length; }).concat([1])) * clh + 1.8) : 0;
    function cabecera(){
      if(op.sinCab) return;
      var y = P.y;
      if(op.grupos){
        op.grupos.forEach(function(g, gi){
          var gx = xs[g.de], gw = xs[g.a] + ws[g.a] - gx, L = gruL[gi];
          /* el color de relleno se pone cada vez: el texto de la anterior lo cambió */
          doc.setFillColor.apply(doc, cGru); doc.setDrawColor.apply(doc, cRaya); doc.setLineWidth(0.2);
          doc.rect(gx, y, gw, gruH, 'FD');
          P.fuente(cfs, true, cGruTx); doc.text(L, gx + gw / 2, y + (gruH - L.length * clh) / 2 + cfs * IPT * 0.85, { align:'center', lineHeightFactor:1.18 });
        });
        y += gruH;
      }
      cols.forEach(function(c, i){
        doc.setFillColor.apply(doc, cCab); doc.setDrawColor.apply(doc, cRaya); doc.setLineWidth(0.2);
        doc.rect(xs[i], y, ws[i], cabH, 'FD');
        P.fuente(cfs, true, cCabTx);
        var L = cabL[i], ty = y + (cabH - L.length * clh) / 2 + cfs * IPT * 0.85;
        doc.text(L, xs[i] + ws[i] / 2, ty, { align:'center', lineHeightFactor:1.18 });
      });
      P.y = y + cabH;
    }
    P.sitio(gruH + cabH + 8); cabecera();
    var ultBanda = null;
    function banda(t, fon){
      var bL = P.lineas(t, AW - 4, bfs, true), bh = bL.length * lh + 2 * pad + 0.6;
      doc.setFillColor.apply(doc, fon || cBan); doc.setDrawColor.apply(doc, cRaya); doc.setLineWidth(0.2); doc.rect(x0, P.y, AW, bh, 'FD');
      P.fuente(bfs, true, cBanTx); doc.text(bL, x0 + 2, P.y + pad + bfs * IPT * 0.9);
      P.y += bh;
    }
    filas.forEach(function(F, ri){
      var o = Array.isArray(F) ? { c:F } : F;
      if(o.banda != null){
        var bh0 = P.lineas(o.banda, AW - 4, bfs, true).length * lh + 2 * pad + 0.6;
        if(P.y + bh0 + lh * 2 + 2 * pad > P.fondo()){ P.nueva(); cabecera(); }
        if(o.k) P.marcas[o.k] = P.pag();
        ultBanda = { t:o.banda, fon:o.fon };
        banda(o.banda, o.fon); return;
      }
      var max = Math.floor((P.fondo() - P.top() - gruH - cabH - 2 * pad - 8) / lh);
      var L = o.c.map(function(v, i){ var c = cols[i]; return P.lineas(v == null ? '' : v, ws[i] - 2 * pad, c.fs || fs, c.b || (o.bold && o.bold[i])).slice(0, max); });
      var h = Math.max(op.minAlto || 0, Math.max.apply(null, L.map(function(l){ return l.length; })) * lh + 2 * pad);
      /* en la hoja nueva, la cabecera y (si las hay) la banda de lo que sigue: «… (continúa)» */
      if(P.y + h > P.fondo()){ P.nueva(); cabecera(); if(ultBanda) banda(ultBanda.t + ' (continúa)', ultBanda.fon); }
      o.c.forEach(function(v, i){
        var c = cols[i], fon = typeof o.fon === 'function' ? o.fon(i) : (o.fon || ((op.zebra && ri % 2) ? IPDF.zebra : null));
        doc.setDrawColor.apply(doc, cRaya); doc.setLineWidth(0.2);
        if(fon){ doc.setFillColor.apply(doc, fon); doc.rect(xs[i], P.y, ws[i], h, 'FD'); } else doc.rect(xs[i], P.y, ws[i], h);
        var col = (typeof o.tin === 'function' ? o.tin(i) : o.tin) || IPDF.tinta, cfs2 = c.fs || fs;
        P.fuente(cfs2, c.b || (o.bold && o.bold[i]), col);
        var al = c.al || 'left', tx = al === 'center' ? xs[i] + ws[i] / 2 : (al === 'right' ? xs[i] + ws[i] - pad : xs[i] + pad);
        var ty = (c.medio ? P.y + (h - L[i].length * lh) / 2 : P.y + pad) + cfs2 * IPT * 0.9;
        if(L[i].length) doc.text(L[i], tx, ty, { align:al, lineHeightFactor:1.22 });
        if(o.dibuja && o.dibuja[i]) o.dibuja[i](xs[i], P.y, ws[i], h);
      });
      P.y += h;
    });
    P.y += 3;
  };
  /* los datos de la portada: etiqueta | valor */
  P.datos = function(pares, op){
    op = op || {};
    var x = op.x != null ? op.x : P.M(), w = op.ancho || P.ancho(), wl = op.wl || 48, fs = op.fs || 9, lh = fs * IPT * 1.3;
    pares.filter(function(p){ return p && p[1]; }).forEach(function(p){
      var L = P.lineas(p[1], w - wl - 4, fs, op.b), h = Math.max(1, L.length) * lh + 3;
      P.sitio(h);
      doc.setDrawColor.apply(doc, IPDF.raya); doc.setLineWidth(0.2);
      doc.setFillColor.apply(doc, IPDF.cab3); doc.rect(x, P.y, wl, h, 'FD'); doc.rect(x + wl, P.y, w - wl, h);
      P.fuente(fs - 0.6, true, IPDF.gris); doc.text(_ipP(p[0]), x + 2, P.y + 1.5 + (fs - 0.6) * IPT * 0.95);
      P.fuente(fs, !!op.b, IPDF.tinta); doc.text(L, x + wl + 2, P.y + 1.5 + fs * IPT * 0.95, { lineHeightFactor:1.3 });
      P.y += h;
    });
    P.y += 3;
  };
  /* el índice (en la primera vuelta, sin números) */
  P.indice = function(E, idx, dx){
    var M = P.M() + (dx || 0), W = P.W(), fs = 9.6, lh = 6.4;
    E.forEach(function(e){
      P.sitio(lh);
      var x = M + (e.lvl ? 9 : 0), num = e.n ? e.n + (e.lvl ? '' : '.') : '', pg = idx && idx[e.k] ? String(idx[e.k]) : '';
      P.fuente(e.lvl ? 9 : fs, !e.lvl, e.lvl ? IPDF.gris : IPDF.tinta);
      var t = _ipP((num ? num + '  ' : '') + e.t), maxW = W - M - x - 16;
      while(doc.getTextWidth(t) > maxW && t.length > 8) t = t.slice(0, -2);
      doc.text(t, x, P.y + 4);
      var tw = doc.getTextWidth(t);
      P.fuente(8, false, IPDF.rayaF);
      var pts = '', dw = doc.getTextWidth('.'), espacio = W - M - 10 - (x + tw + 2);
      if(espacio > dw) pts = new Array(Math.floor(espacio / dw)).join('.');
      doc.text(pts, x + tw + 2, P.y + 4);
      P.fuente(e.lvl ? 9 : fs, !e.lvl, IPDF.tinta); doc.text(pg, W - M, P.y + 4, { align:'right' });
      P.y += lh;
    });
    P.y += 2;
  };
  /* las firmas: una columna por rol; nombre, cargo, firma (trazo o espacio para firmar) y fecha */
  P.firmas = function(roles, F, op){
    op = op || {};
    var M = P.M(), AW = op.ancho || Math.min(P.ancho(), roles.length > 3 ? 260 : 200), x0 = op.x != null ? op.x : M, n = roles.length, w = AW / n;
    var hT = 7, hN = 10, hC = 10, hF = op.altoFirma || 22, hD = 6.5, tot = hT + hN + hC + hF + hD;
    P.sitio(tot + (op.pie ? 8 : 0) + 2);
    var y = P.y;
    roles.forEach(function(r, i){
      var x = x0 + i * w, f = (F || {})[r[0]] || {};
      doc.setDrawColor.apply(doc, IPDF.raya); doc.setLineWidth(0.25);
      doc.setFillColor.apply(doc, IPDF.cab); doc.rect(x, y, w, hT, 'FD');
      P.fuente(8, true, IPDF.blanco); doc.text(_ipP(r[1]).toUpperCase(), x + w / 2, y + 4.6, { align:'center' });
      var yy = y + hT;
      [['Nombre', f.n, hN], ['Cargo', f.c, hC]].forEach(function(q){
        doc.rect(x, yy, w, q[2]);
        P.fuente(6.4, false, IPDF.suave); doc.text(q[0], x + 1.6, yy + 2.7);
        var L = P.lineas(q[1] || '', w - 3.2, 7.8, q[0] === 'Nombre').slice(0, 2);
        P.fuente(7.8, q[0] === 'Nombre', IPDF.tinta); doc.text(L, x + 1.6, yy + 5.6, { lineHeightFactor:1.15 });
        yy += q[2];
      });
      doc.rect(x, yy, w, hF);
      P.fuente(6.4, false, IPDF.suave); doc.text('Firma', x + 1.6, yy + 2.7);
      if(f.tr) _ipFirmaPDF(doc, f.tr, x + 3, yy + 3.2, w - 6, hF - 4.6);
      yy += hF;
      doc.setDrawColor.apply(doc, IPDF.raya); doc.rect(x, yy, w, hD);
      P.fuente(6.4, false, IPDF.suave); doc.text('Fecha', x + 1.6, yy + 4.2);
      P.fuente(7.8, true, IPDF.tinta); doc.text(f.f ? ipDma(f.f) : '', x + w - 1.8, yy + 4.4, { align:'right' });
    });
    P.y = y + tot;
    if(op.pie){
      var pw = AW / op.pie.length;
      op.pie.forEach(function(p, i){
        var x = x0 + i * pw;
        doc.setDrawColor.apply(doc, IPDF.raya); doc.setFillColor.apply(doc, IPDF.cab3); doc.rect(x, P.y, pw, 7, 'FD');
        P.fuente(7.4, true, IPDF.gris); doc.text(_ipP(p[0]).toUpperCase(), x + 2, P.y + 4.6);
        P.fuente(8.2, true, IPDF.tinta); doc.text(_ipP(p[1] || '—'), x + pw - 2, P.y + 4.7, { align:'right' });
      });
      P.y += 7;
    }
    P.y += 4;
  };
  /* la hoja de los participantes: n.°, nombre, (DNI), cargo, (cómo participa) y el espacio para su firma */
  P.participantes = function(L, op){
    op = op || {};
    var cols = [{ t:'N.°', w:6, al:'center', medio:true }, { t:'Nombres y apellidos', w:40, medio:true }];
    if(op.dni) cols.push({ t:C.pais === 'pe' ? 'DNI' : 'Documento', w:13, al:'center', medio:true });
    cols.push({ t:'Cargo o puesto', w:26, medio:true });
    if(op.rol) cols.push({ t:'Participa como', w:24, medio:true });
    cols.push({ t:'Firma', w:24 });
    var filas = (L || []).map(function(p, i){
      var c = [String(i + 1), p.n]; if(op.dni) c.push(p.dni || ''); c.push(p.c || '');
      if(op.rol) c.push(p.rol === 'trab' ? 'Representante de los trabajadores' : 'Equipo evaluador');
      c.push(''); return c;
    });
    for(var i = 0; i < (op.blancos || 0); i++){ var c = [String((L || []).length + i + 1)]; while(c.length < cols.length) c.push(''); filas.push(c); }
    P.tabla(cols, filas, { fs:8.2, minAlto:9.5 });
  };
  /* una lista con su casilla marcada (el EPP del PETS), en dos columnas */
  P.casillas = function(L){
    var M = P.M(), w = P.ancho() / 2, fs = 8.8, lh = fs * IPT * 1.3, mitad = Math.ceil(L.length / 2);
    P.sitio(Math.min(mitad * (lh + 2.2), 70));
    for(var i = 0; i < mitad; i++){
      var par = [L[i], L[i + mitad]], lin = par.map(function(t){ return t ? P.lineas(t, w - 10, fs) : []; });
      var h = Math.max(lin[0].length, lin[1].length, 1) * lh + 2.2;
      P.sitio(h);
      par.forEach(function(t, j){
        if(!t) return;
        var x = M + j * w;
        doc.setDrawColor.apply(doc, IPDF.cab); doc.setLineWidth(0.3); doc.rect(x + 1, P.y + 0.6, 3.2, 3.2);
        doc.setLineWidth(0.45); doc.lines([[0.8, 0.9], [1.5, -2.1]], x + 1.6, P.y + 2.3); doc.setLineWidth(0.25);
        P.fuente(fs, false, IPDF.tinta); doc.text(lin[j], x + 6.5, P.y + fs * IPT * 0.95, { lineHeightFactor:1.3 });
      });
      P.y += h;
    }
    P.y += 2;
  };
  return P;
}

/* ══ EL IPERC DE LÍNEA BASE ══ */
function _iplColumnas(d){
  var mina = d.met === 'ds024';
  var C = [{ k:'n', t:'N.°', w:6, al:'center' }, { k:'act', t:'Actividad / tarea', w:mina ? 29.5 : 26.5 }, { k:'rut', t:'R/NR\nS/SO', w:8.5, al:'center' },
           { k:'pel', t:'Peligro', w:mina ? 28 : 24 }, { k:'rie', t:'Riesgo', w:mina ? 26 : 22 }, { k:'con', t:'Consecuencia', w:mina ? 24 : 21 }];
  if(!mina) C = C.concat([{ k:'a', t:'A', w:4.5, al:'center' }, { k:'b', t:'B', w:4.5, al:'center' }, { k:'c', t:'C', w:4.5, al:'center' }, { k:'d', t:'D', w:4.5, al:'center' },
                          { k:'ip', t:'IP', w:5.5, al:'center' }, { k:'s', t:'S', w:4.5, al:'center' }]);
  C = C.concat([{ k:'niv', t:mina ? 'Nivel' : 'Nivel\n(IP × S)', w:15, al:'center', medio:true, b:true }, { k:'sig', t:'Sig.', w:7, al:'center', medio:true },
                { k:'es', t:'Eliminación /\nsustitución', w:mina ? 20 : 16 }, { k:'ing', t:'Controles de ingeniería', w:mina ? 23 : 19 },
                { k:'adm', t:'Controles administrativos y señalización', w:mina ? 30 : 25 }, { k:'epp', t:'EPP', w:mina ? 22 : 19 },
                { k:'res', t:mina ? 'Nivel' : 'Nivel\n(IP × S)', w:15, al:'center', medio:true, b:true }, { k:'resp', t:'Responsable y plazo', w:17 }]);
  return C;
}
function _iplNumeros(d){
  var P = iplProcesos(d), r = []; P.forEach(function(p, i){ r.push({ k:'p' + i, n:'7.' + (i + 1), t:p.n }); }); return r;
}
function _iplArmar(d, C, idx){
  var mina = d.met === 'ds024', tit = d.tit || 'IPERC de línea base', dma = ipDma;
  var meta = { cab1:/^iperc de l[ií]nea base$/i.test(tit) ? 'MATRIZ IPERC DE LÍNEA BASE' : tit, cab2:[C.razon, C.obra, d.area].filter(Boolean).join(' · '),
    cod:d.cod, ver:d.ver, fecha:dma(d.fecha), pie:[d.cod, tit, 'Versión ' + d.ver].filter(Boolean).join(' · '),
    leyenda:mina ? 'R/NR: rutinaria / no rutinaria · S/SO: seguridad / salud ocupacional · Nivel: Alto (0-24 horas), Medio (0-72 horas), Bajo (1 mes) · Sig.: riesgo significativo (' + (d.sig === 'A' ? 'solo Alto' : 'Medio y Alto') + ')'
      : 'A: personas expuestas · B: procedimientos existentes · C: capacitación · D: exposición al riesgo · IP: índice de probabilidad (A + B + C + D) · S: severidad · Nivel: IP × S · Sig.: riesgo significativo · R/NR: rutinaria / no rutinaria · S/SO: seguridad / salud ocupacional' };
  var P = _ipDoc(C, meta), doc = P.doc, F = d.firmas || {}, R = iplResumen(d), procs = iplProcesos(d), cg = iplCargos(C.sector), sigTx = (IPL_SIG[d.met].filter(function(x){ return x[0] === d.sig; })[0] || ['', ''])[1];
  P.cab(); P.y = P.top();
  /* ── la portada ── */
  var W = P.W(), M = P.M();
  if(C.logo){
    var lw = 64, lh = lw / (C.logo.r || 1); if(lh > 30){ lh = 30; lw = lh * (C.logo.r || 1); }
    try{ doc.addImage(C.logo.du, 'JPEG', (W - lw) / 2, 44, lw, lh, 'logo', 'FAST'); }catch(e){}
    P.y = 44 + lh + 10;
  }else P.y = 58;
  P.fuente(8.2, true, IPDF.gris); doc.text('IDENTIFICACIÓN DE PELIGROS, EVALUACIÓN DE RIESGOS Y MEDIDAS DE CONTROL', W / 2, P.y, { align:'center', charSpace:0.25 }); P.y += 9;
  var tl = P.lineas(tit.toUpperCase(), W - 2 * M - 20, 21, true).slice(0, 3);
  P.fuente(21, true, IPDF.cab); doc.text(tl, W / 2, P.y, { align:'center', lineHeightFactor:1.15 }); P.y += tl.length * 8.6 + 2;
  doc.setDrawColor.apply(doc, IPDF.cab); doc.setLineWidth(0.6); doc.line(W / 2 - 18, P.y, W / 2 + 18, P.y); doc.setLineWidth(0.25); P.y += 9;
  P.datos([['Empresa', C.razon], ['RUC', C.ruc], ['Obra o proyecto', C.obra], ['Lugar', d.lugar], ['Alcance', d.area],
           ['Método de evaluación', IPL_MET[d.met].n + (C.pais === 'pe' ? ' (' + IPL_MET[d.met].norma + ')' : '')],
           ['Código', d.cod], ['Versión', d.ver], ['Fecha de elaboración', dma(d.fecha)], ['Fecha de aprobación', dma((F.apr || {}).f)],
           ['Contenido', R.n + (R.n === 1 ? ' peligro evaluado' : ' peligros evaluados') + ' en ' + R.procs + (R.procs === 1 ? ' proceso' : ' procesos')]],
           { x:M + 14, ancho:W - 2 * M - 28, wl:46 });
  P.y = Math.max(P.y + 4, P.fondo() - 60);
  P.fuente(8.2, true, IPDF.gris); doc.text('HOJA DE CONTROL', M + 14, P.y); P.y += 3;
  P.firmas(IPL_ROLES, F, { x:M + 14, ancho:W - 2 * M - 28, altoFirma:16 });
  /* ── el índice ── */
  P.nueva('a4', 'portrait');
  P.fuente(13, true, IPDF.cab); doc.text('ÍNDICE', M, P.y + 4); P.y += 12;
  var E = [{ k:'obj', n:'1', t:'Objetivo' }, { k:'alc', n:'2', t:'Alcance' }, { k:'leg', n:'3', t:'Base legal' }, { k:'met', n:'4', t:'Metodología de evaluación' },
           { k:'eq', n:'5', t:'Equipo evaluador y participación de los trabajadores' }, { k:'res', n:'6', t:'Resumen de la evaluación' }, { k:'mat', n:'7', t:'Matriz IPERC' }]
    .concat(_iplNumeros(d).map(function(x){ return { k:x.k, n:x.n, t:x.t, lvl:1 }; }))
    .concat([{ k:'fir', n:'8', t:'Firmas' }, { k:'cc', n:'9', t:'Control de cambios' }]);
  P.indice(E, idx);
  /* ── 1 a 6 ── */
  P.nueva('a4', 'portrait');
  P.h1('obj', '1', 'Objetivo'); P.par(d.obj || '—');
  P.h1('alc', '2', 'Alcance'); P.par(d.alc || '—');
  P.h1('leg', '3', 'Base legal'); if((d.leg || []).length) P.vinetas(d.leg); else P.par('—');
  P.h1('met', '4', 'Metodología de evaluación');
  if(!mina){
    P.par('Cada peligro se evalúa con el índice de probabilidad (IP), que es la suma de cuatro índices de 1 a 3 (A, B, C y D), y con el índice de severidad (S), de 1 a 3. El nivel de riesgo es IP × S' +
      (C.pais === 'pe' ? ' (R.M. N.° 050-2013-TR, Anexo 3).' : '.') + ' Se evalúa dos veces: con los controles que ya existen (evaluación inicial) y con las medidas propuestas (riesgo residual).');
    P.tabla([{ t:'Índice', w:9, al:'center', b:true, medio:true }, { t:'A · Personas expuestas', w:20 }, { t:'B · Procedimientos existentes', w:25 }, { t:'C · Capacitación', w:28 }, { t:'D · Exposición al riesgo', w:25 }, { t:'S · Severidad', w:28 }],
      [0, 1, 2].map(function(i){ return [String(i + 1), IPL_IND[0].o[i], IPL_IND[1].o[i], IPL_IND[2].o[i], IPL_IND[3].o[i], IPL_SEV.o[i]]; }), { fs:7.6 });
    P.par('S: seguridad · SO: salud ocupacional.', { fs:7.6, col:IPDF.gris, tras:3 });
    P.tabla([{ t:'Nivel de riesgo', w:14, b:true, medio:true }, { t:'IP × S', w:8, al:'center', medio:true }, { t:'Qué se hace', w:58 }],
      IPL_NIV.map(function(n){ return { c:[n.n, n.de === n.a ? String(n.de) : n.de + ' a ' + n.a, n.d], fon:function(i){ return i === 0 ? n.fon : null; }, tin:function(i){ return i === 0 ? n.tin : null; } }; }), { fs:7.8 });
  }else{
    P.par('Cada peligro se evalúa con la matriz de evaluación de riesgos de la empresa y se marca su nivel: Alto, Medio o Bajo' +
      (C.pais === 'pe' ? ' (D.S. N.° 024-2016-EM; los plazos son los del IPERC continuo, Anexo 7).' : '.') + ' Se evalúa dos veces: con los controles que ya existen (evaluación inicial) y con las medidas propuestas (riesgo residual).');
    P.tabla([{ t:'Nivel de riesgo', w:14, b:true, medio:true }, { t:'Plazo de corrección', w:14, al:'center', medio:true }, { t:'Qué se hace', w:52 }],
      IPL_MIN.map(function(n){ return { c:[n.n, n.plazo, n.d], fon:function(i){ return i === 0 ? n.fon : null; }, tin:function(i){ return i === 0 ? n.tin : null; } }; }), { fs:7.8 });
  }
  P.par('Riesgo significativo: ' + (sigTx ? sigTx.charAt(0).toLowerCase() + sigTx.slice(1) : '') + ' (criterio de la empresa). Un riesgo significativo no se acepta sin sus medidas de control.', { fs:8.8 });
  P.par('Las medidas de control se proponen en este orden (jerarquía de controles, ISO 45001:2018, 8.1.2): eliminación, sustitución, controles de ingeniería, controles administrativos y señalización, y equipos de protección personal.', { fs:8.8 });
  P.par('Este IPERC se actualiza una vez al año como mínimo, y antes si cambian las condiciones de trabajo o si ocurre un accidente o un incidente peligroso' + (C.pais === 'pe' ? ' (Ley N.° 29783, art. 57).' : '.'), { fs:8.8 });
  P.h1('eq', '5', 'Equipo evaluador y participación de los trabajadores');
  P.par('Elaboraron esta evaluación, con la participación de los trabajadores:', { fs:9 });
  P.participantes(d.equipo || [], { rol:true, blancos:(d.equipo || []).length ? 0 : 4 });
  P.h1('res', '6', 'Resumen de la evaluación');
  var N = iplNiveles(d);
  P.tabla([{ t:'Nivel de riesgo', w:22, b:true, medio:true }, { t:'Evaluación inicial', w:16, al:'center', medio:true }, { t:'%', w:9, al:'center', medio:true }, { t:'Riesgo residual', w:16, al:'center', medio:true }, { t:'%', w:9, al:'center', medio:true }],
    N.slice().reverse().map(function(n){
      var a = R.ini[n.k] || 0, b = R.res[n.k] || 0, pc = function(v){ return R.n ? Math.round(v * 100 / R.n) + ' %' : '—'; };
      return { c:[n.n, String(a), pc(a), String(b), pc(b)], fon:function(i){ return i === 0 ? n.fon : null; }, tin:function(i){ return i === 0 ? n.tin : null; } };
    }).concat(R.sinIni || R.sinRes ? [{ c:['Sin evaluar', String(R.sinIni), '', String(R.sinRes), ''] }] : [])
      .concat([{ c:['Total', String(R.n), '', String(R.n), ''], bold:[true, true, false, true, false], fon:IPDF.cab3 }]), { fs:8.6, ancho:Math.min(P.ancho(), 150) });
  P.par('Riesgos significativos: ' + R.sig + ' en la evaluación inicial y ' + R.sigRes + ' después de las medidas de control.', { fs:9, b:true });
  /* ── 7 · la matriz, en horizontal ── */
  var fmt = d.hoja === 'a3' ? 'a3' : 'a4';
  P.nueva(fmt, 'landscape'); P.hojaAncha[P.pag()] = 1;
  var _nueva = P.nueva; P.nueva = function(f, o){ _nueva(f, o); if(P.orient === 'landscape') P.hojaAncha[P.pag()] = 1; };
  P.h1('mat', '7', 'Matriz IPERC');
  var cols = _iplColumnas(d), ci = {}; cols.forEach(function(c, i){ ci[c.k] = i; });
  var grupos = mina ? [{ t:'Evaluación inicial', de:ci.niv, a:ci.sig }, { t:'Medidas de control', de:ci.es, a:ci.epp }, { t:'Residual', de:ci.res, a:ci.res }]
                    : [{ t:'Evaluación inicial', de:ci.a, a:ci.sig }, { t:'Medidas de control', de:ci.es, a:ci.epp }, { t:'Residual', de:ci.res, a:ci.res }];
  var filas = [], n = 0, txNiv = function(e){ return e ? e.niv.n + (e.nr != null ? '\n' + e.nr : '') : '—'; };
  procs.forEach(function(p, pi){
    filas.push({ banda:'7.' + (pi + 1) + '   Proceso: ' + p.n, k:'p' + pi });
    p.filas.forEach(function(x){
      var f = x.f; if(iplFilaVacia(f)) return;
      n++;
      var a = iplEv(f.ini, d.met, d.sig), b = iplEv(f.res, d.met, d.sig), cel = {};
      cel.n = String(n);
      cel.act = (f.act || '') + (f.tar ? '\nTarea: ' + f.tar : '') + (f.pue ? '\nPuesto: ' + f.pue : '');
      cel.rut = f.rut + '\n' + f.tipo; cel.pel = f.pel; cel.rie = f.rie; cel.con = f.con + (f.leg ? '\nRequisito legal: ' + f.leg : '');
      if(!mina){ ['a', 'b', 'c', 'd', 's'].forEach(function(k){ cel[k] = f.ini[k] ? String(f.ini[k]) : ''; }); cel.ip = a ? String(a.ip) : ''; }
      cel.niv = txNiv(a); cel.sig = a ? (a.sig ? 'Sí' : 'No') : '';
      cel.es = [f.ctl.eli, f.ctl.sus].filter(Boolean).join('\n'); cel.ing = f.ctl.ing; cel.adm = f.ctl.adm; cel.epp = f.ctl.epp;
      cel.res = txNiv(b); cel.resp = [f.resp, f.plazo ? 'Plazo:\n' + ipDma(f.plazo) : ''].filter(Boolean).join('\n');
      filas.push({ c:cols.map(function(c){ return cel[c.k] || ''; }),
        fon:function(i){ return i === ci.niv && a ? a.niv.fon : (i === ci.res && b ? b.niv.fon : (i === ci.sig && a && a.sig ? [251, 236, 236] : null)); },
        tin:function(i){ return i === ci.niv && a ? a.niv.tin : (i === ci.res && b ? b.niv.tin : (i === ci.sig && a && a.sig ? [155, 28, 28] : null)); } });
    });
  });
  if(!n) filas.push({ c:cols.map(function(c, i){ return i === 1 ? 'Todavía no hay peligros en esta matriz.' : ''; }) });
  P.tabla(cols, filas, { fs:fmt === 'a3' ? 7.6 : 6.1, cabFs:fmt === 'a3' ? 7.2 : 5.9, grupos:grupos });
  /* ── 8 y 9 ── */
  P.h1('fir', '8', 'Firmas');
  P.firmas(IPL_ROLES, F, { ancho:Math.min(P.ancho(), 210) });
  P.h1('cc', '9', 'Control de cambios');
  P.tabla([{ t:'Versión', w:10, al:'center' }, { t:'Fecha de aprobación', w:16, al:'center' }, { t:'Descripción del cambio', w:60 }, { t:'Aprobado por', w:30 }],
    ipetsHistVigente(d).map(function(h){ return [h.ver, ipDma(h.fecha), h.cambio, h.apr]; }), { fs:8, ancho:Math.min(P.ancho(), 230) });
  P.fin();
  return P;
}
/* las dos vueltas: la primera cuenta las páginas de cada parte, la segunda las escribe en el índice.
   28/10/2026 · #186 · el modelo de obra (el de su Excel) es de una vuelta: no lleva índice. */
function iplPdf(d, C){
  if(d.formato !== 'completo') return iplPdfObra(d, C);
  var a = _iplArmar(d, C, null); return _iplArmar(d, C, a.marcas).doc;
}

/* ══ EL IPERC EN EL MODELO DE OBRA (28/10/2026, #186) ════════════════════════════════════════════════════════════
   El de su Excel, en A3 apaisado y una sola tabla. En cada hoja: la cabecera (el logo | el título y el proyecto | el
   código, la revisión, la fecha y «X de Y»), quién elaboró, revisó y aprobó (nombre – cargo) y la leyenda de los
   niveles; mientras corre la matriz, la cabecera de la tabla (los 4 grupos y sus columnas) y, en cada proceso, su
   franja «N. PROCESO». Al pie: los criterios de evaluación, la normativa (norma | aplicación) y las tres firmas.
   Los colores son los de su Excel (IPL_OBRA_COL); la letra, un poco más grande que la de su impresión. */
var IPDF_OBRA = { oscuro:[31, 78, 121], medio:[46, 92, 138], claro:[213, 232, 240], raya:[191, 191, 191], negro:[0, 0, 0], blanco:[255, 255, 255] };
function _ipRgb(h){ h = String(h || '').replace('#', ''); return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0]; }
/* la grilla de su Excel, de la A a la AB (anchos en caracteres): la cabecera y el pie caen donde caen sus columnas */
var IPL_OBRA_GRILLA = [5, 22, 6, 16, 26, 24, 22, 4, 4, 4, 4, 5, 5, 5, 12, 14, 14, 34, 34, 26, 4, 4, 4, 4, 5, 5, 5, 12];
function iplPdfObra(d, C){
  var mina = d.met === 'ds024', F = d.firmas || {}, K = IPDF_OBRA, dma = ipDma;
  var meta = { pie:[d.cod, d.tit || 'IPERC de línea base', 'Revisión ' + d.ver].filter(Boolean).join(' · ') };
  var P = _ipDoc(C, meta, { fmt:'a3', orient:'landscape' }), doc = P.doc;
  var M = 7, W = P.W(), AW = W - 2 * M, G = IPL_OBRA_GRILLA, GT = G.reduce(function(s, x){ return s + x; }, 0);
  P.M = function(){ return M; };
  var gx = function(i){ var s = 0; for(var j = 0; j < i; j++) s += G[j]; return M + s * AW / GT; };
  var gw = function(i, j){ return gx(j + 1) - gx(i); };
  /* una celda: su relleno, su borde y su texto centrado en el alto */
  var celda = function(x, y, w, h, t, o){
    o = o || {};
    doc.setDrawColor.apply(doc, K.raya); doc.setLineWidth(0.2);
    if(o.f){ doc.setFillColor.apply(doc, o.f); doc.rect(x, y, w, h, 'FD'); } else doc.rect(x, y, w, h);
    if(t == null || t === '') return;
    var fs = o.fs || 7, lh = fs * IPT * 1.2, L = P.lineas(t, (w - 2.4) * 0.97, fs, o.b).slice(0, o.max || Math.max(1, Math.floor((h - 0.6) / lh)));
    P.fuente(fs, o.b, o.c || K.negro);
    var al = o.al || 'left', tx = al === 'center' ? x + w / 2 : x + 1.2;
    doc.text(L, tx, y + (h - L.length * lh) / 2 + fs * IPT * 0.86, { align:al, lineHeightFactor:1.2 });
  };
  var Y0 = 7, hT = 12, hP = 9, hR = 4.6, rh = (hT + hP) / 4, wEt = 14;
  var TOP = Y0 + hT + hP + 4 * hR;
  P.top = function(){ return TOP; };
  P.fondo = function(){ return P.H() - 10; };
  P.cab = function(){
    var y = Y0, lx = gx(0), lw = gw(0, 1), lh = hT + hP;
    /* A1:B4 · el logo, o la razón social */
    celda(lx, y, lw, lh, '');
    if(C.logo){
      var bw = lw - 4, bh = lh - 4, iw = bw, ih = bw / (C.logo.r || 1); if(ih > bh){ ih = bh; iw = bh * (C.logo.r || 1); }
      try{ doc.addImage(C.logo.du, 'JPEG', lx + (lw - iw) / 2, y + (lh - ih) / 2, iw, ih, 'logo', 'FAST'); }catch(e){}
    }else celda(lx, y, lw, lh, C.razon || 'Empresa', { b:true, fs:8, al:'center', max:4 });
    /* C1:V2 · el título; C3:V4 · el proyecto (y lo que abarca) */
    celda(gx(2), y, gw(2, 21), hT, iplTituloObra(d), { f:K.oscuro, c:K.blanco, b:true, fs:12, al:'center', max:2 });
    celda(gx(2), y + hT, gw(2, 21), hP, '', { f:K.claro });
    var proy = 'Proyecto: ' + ([C.obra, d.lugar].filter(Boolean).join(' – ') || '—'), cx = gx(2) + gw(2, 21) / 2;
    P.fuente(9.5, true, K.negro);
    doc.text(P.lineas(proy, gw(2, 21) - 8, 9.5, true).slice(0, 1), cx, y + hT + (d.area ? 3.7 : hP / 2 + 1.3), { align:'center' });
    if(d.area){ P.fuente(7.2, false, K.negro); doc.text(P.lineas('Alcance: ' + d.area, gw(2, 21) - 8, 7.2).slice(0, 1), cx, y + hT + 7.4, { align:'center' }); }
    /* W1:AB4 · código, revisión, fecha y páginas (las páginas se escriben al final) */
    [['Código:', d.cod || '—'], ['Revisión:', d.ver], ['Fecha:', dma(d.fecha) || '—'], ['Páginas:', '']].forEach(function(r, i){
      celda(gx(22), y + i * rh, wEt, rh, r[0], { f:K.claro, b:true, fs:6.4 });
      celda(gx(22) + wEt, y + i * rh, gw(22, 27) - wEt, rh, r[1], { fs:6.8, max:1 });
    });
    y += hT + hP;
    /* quién elaboró, revisó y aprobó */
    [['elab', 'Elaborado por:'], ['rev', 'Revisado por:'], ['apr', 'Aprobado por:']].forEach(function(r){
      var f = F[r[0]] || {};
      celda(gx(0), y, gw(0, 2), hR, r[1], { f:K.claro, b:true, fs:6.8 });
      celda(gx(3), y, gw(3, 15), hR, [f.n, f.c].filter(Boolean).join(' – '), { fs:6.8, max:1 });
      y += hR;
    });
    /* la leyenda de los niveles */
    celda(gx(0), y, gw(0, 2), hR, 'Nivel de riesgo:', { f:K.claro, b:true, fs:6.8 });
    var chips = mina ? [['B', 3, 3], ['M', 4, 4], ['A', 5, 5]] : [['triv', 3, 3], ['tol', 4, 4], ['mod', 5, 5], ['imp', 6, 6], ['int', 7, 12]];
    chips.forEach(function(c){ var n = iplNivDe(c[0]); celda(gx(c[1]), y, gw(c[1], c[2]), hR, n.n.toUpperCase(), { f:_ipRgb(IPL_OBRA_COL.niv[c[0]]), b:true, fs:6.4, al:'center' }); });
    var lx2 = mina ? 6 : 13;
    celda(gx(lx2), y, gw(lx2, 27), hR, mina ? IPL_MIN.map(function(n){ return n.n + ': corregir en ' + n.plazo; }).join(' · ') + ' · el nivel se marca con la matriz de la empresa'
                                           : 'R = Probabilidad (A+B+C+D) × Severidad', { fs:6.6, max:1 });
  };
  P.fin = function(){
    var n = doc.getNumberOfPages(), hoy = dma(C.hoy) || '';
    for(var i = 1; i <= n; i++){
      doc.setPage(i);
      var H = P.H();
      P.fuente(6.8, false, K.negro); doc.text(i + ' de ' + n, gx(22) + wEt + 1.2, Y0 + 3 * rh + rh / 2 + 6.8 * IPT * 0.36);
      doc.setDrawColor.apply(doc, IPDF.rayaF); doc.setLineWidth(0.2); doc.line(M, H - 7.6, W - M, H - 7.6);
      P.fuente(6.6, false, IPDF.suave); doc.text(_ipP(meta.pie || ''), M, H - 4.6);
      if(hoy) doc.text('Impreso el ' + hoy, W - M, H - 4.6, { align:'right' });
    }
    return doc;
  };
  P.cab(); P.y = P.top();
  /* ── la matriz ── */
  var cols = iplColsObra(d, true).map(function(c){ return { k:c.k, t:c.t, w:c.w, al:c.al, medio:true, niv:c.niv, b:!!c.niv, fs:c.niv ? 6 : null }; });
  var filas = [], n = 0;
  iplProcesos(d).forEach(function(p, pi){
    filas.push({ banda:(pi + 1) + '. ' + String(p.n || 'Sin proceso').toUpperCase() });
    p.filas.forEach(function(x){
      var f = x.f; if(iplFilaVacia(f)) return;
      n++;
      var cel = iplCeldasObra(f, n, d), fondo = {};
      cols.forEach(function(c, i){ var e = c.niv === 'i' ? cel.a : (c.niv === 'r' ? cel.b : null); if(e) fondo[i] = _ipRgb(IPL_OBRA_COL.niv[e.niv.k]); });
      filas.push({ c:cols.map(function(c){ return cel[c.k] || ''; }), fon:function(i){ return fondo[i] || null; }, tin:function(){ return K.negro; } });
    });
  });
  if(!n) filas.push({ c:cols.map(function(c, i){ return i === 1 ? 'Todavía no hay peligros en esta matriz.' : ''; }) });
  P.tabla(cols, filas, { fs:6.4, cabFs:6.4, bandaFs:7.4, grupos:iplGruposObra(cols),
    tema:{ cab:K.oscuro, cabTx:K.blanco, gru:K.oscuro, gruTx:K.blanco, banda:K.medio, bandaTx:K.blanco, raya:K.raya } });
  P.y -= 3;
  /* ── al pie: los criterios, la normativa y las firmas ── */
  var barra = function(t, fill, sigue){ if(P.y + 5 + (sigue || 6) > P.fondo()) P.nueva(); celda(M, P.y, AW, 5, t, { f:fill || K.oscuro, c:K.blanco, b:true, fs:7.6, al:'center' }); P.y += 5; };
  var fila2 = function(c1, c2, t1, t2, o1, o2, titulo){
    var fs = 6.6, L = Math.max(P.lineas(t1, (gw(c1[0], c1[1]) - 2.4) * 0.97, fs, true).length, P.lineas(t2, (gw(c2[0], c2[1]) - 2.4) * 0.97, fs).length), h = Math.max(5, L * fs * IPT * 1.2 + 2);
    if(P.y + h > P.fondo()){ P.nueva(); if(titulo) barra(titulo + ' (continúa)'); }
    celda(gx(c1[0]), P.y, gw(c1[0], c1[1]), h, t1, Object.assign({ fs:fs, max:30 }, o1));
    celda(gx(c2[0]), P.y, gw(c2[0], c2[1]), h, t2, Object.assign({ fs:fs, max:30 }, o2));
    P.y += h;
  };
  barra('CRITERIOS DE EVALUACIÓN', K.oscuro, 12);
  iplCriterios(d, C).forEach(function(r){ fila2([0, 3], [4, 27], r[0], r[1], { f:K.claro, b:true }, {}, 'CRITERIOS DE EVALUACIÓN'); });
  var norm = iplNormativa(d);
  if(norm.length){
    P.y += 4;
    barra('NORMATIVA, LEYES Y DECRETOS DE REFERENCIA', K.oscuro, 12);
    fila2([0, 4], [5, 27], 'Norma', 'Aplicación', { f:K.medio, c:K.blanco, b:true, al:'center' }, { f:K.medio, c:K.blanco, b:true, al:'center' });
    norm.forEach(function(r){ fila2([0, 4], [5, 27], r[0], r[1], {}, {}, 'NORMATIVA, LEYES Y DECRETOS DE REFERENCIA'); });
  }
  /* las tres firmas: su trazo (o el espacio para firmar), el nombre, el cargo y la fecha */
  var hF = 5 + 19 + 13;
  if(P.y + 6 + hF > P.fondo()) P.nueva(); else P.y += 6;
  [['elab', 'ELABORADO POR', 0, 8], ['rev', 'REVISADO POR', 9, 17], ['apr', 'APROBADO POR', 18, 27]].forEach(function(q){
    var x = gx(q[2]), w = gw(q[2], q[3]), y = P.y, f = F[q[0]] || {}, ok = ipFirmada(f);
    celda(x, y, w, 5, q[1], { f:K.oscuro, c:K.blanco, b:true, fs:7.4, al:'center' });
    doc.setDrawColor.apply(doc, K.raya); doc.setLineWidth(0.2); doc.rect(x, y + 5, w, hF - 5);
    if(f.tr && ok) _ipFirmaPDF(doc, f.tr, x + w * 0.25, y + 6, w * 0.5, 16.5);
    doc.setDrawColor.apply(doc, IPDF.raya); doc.line(x + w * 0.2, y + 23.4, x + w * 0.8, y + 23.4);
    P.fuente(7.6, true, K.negro); doc.text(P.lineas(f.n || '', w - 4, 7.6, true).slice(0, 1), x + w / 2, y + 26.6, { align:'center' });
    P.fuente(6.8, false, K.negro); doc.text(P.lineas(f.c || '', w - 4, 6.8).slice(0, 1), x + w / 2, y + 30, { align:'center' });
    P.fuente(6.4, false, IPDF.gris); doc.text(ok ? 'Firmó el ' + dma(f.f) + (f.via === 'papel' ? ' (en papel)' : '') : 'Firma / Fecha', x + w / 2, y + 33.6, { align:'center' });
  });
  P.y += hF;
  P.fin();
  return doc;
}

/* ══ EL PETS ══ */
function _petsSecciones(d){
  var S = [['obj', 'Objetivo'], ['alc', 'Alcance'], ['refs', 'Documentos de referencia']];
  if((d.defs || []).length) S.push(['defs', 'Definiciones']);
  if((d.resp || []).length) S.push(['resp', 'Responsabilidades']);
  S = S.concat([['pers', 'Personal'], ['epp', 'Equipos de protección personal'], ['eq', 'Equipos, herramientas y materiales']]);
  if((d.pel || []).length) S.push(['pel', 'Peligros, riesgos y medidas de control']);
  S = S.concat([['pro', 'Procedimiento'], ['restr', 'Restricciones']]);
  if((d.regs || []).length) S.push(['regs', 'Registros y formatos relacionados']);
  S = S.concat([['fir', 'Firmas'], ['cc', 'Control de cambios']]);
  return S.map(function(s, i){ return { k:s[0], n:String(i + 1), t:s[1] }; });
}
function _petsArmar(d, C, idx){
  var dma = ipDma, F = d.firmas || {};
  var meta = { cab1:d.tit || 'PETS', cab2:['PROCEDIMIENTO ESCRITO DE TRABAJO SEGURO', C.razon, C.obra, d.area].filter(Boolean).join(' · '),
    cod:d.cod, ver:d.ver, fecha:dma(d.fecha), pie:[d.cod, 'PETS · ' + (d.tit || ''), 'Versión ' + d.ver].filter(Boolean).join(' · ') };
  var P = _ipDoc(C, meta), doc = P.doc, W = P.W(), M = P.M(), S = _petsSecciones(d), num = {};
  S.forEach(function(s){ num[s.k] = s.n; });
  P.cab(); P.y = P.top();
  /* ── la portada con su índice ── */
  if(C.logo){
    var lw = 52, lh = lw / (C.logo.r || 1); if(lh > 24){ lh = 24; lw = lh * (C.logo.r || 1); }
    try{ doc.addImage(C.logo.du, 'JPEG', (W - lw) / 2, 42, lw, lh, 'logo', 'FAST'); }catch(e){}
    P.y = 42 + lh + 9;
  }else P.y = 50;
  P.fuente(8.2, true, IPDF.gris); doc.text('PROCEDIMIENTO ESCRITO DE TRABAJO SEGURO (PETS)', W / 2, P.y, { align:'center', charSpace:0.25 }); P.y += 8.5;
  var tl = P.lineas(String(d.tit || '').toUpperCase(), W - 2 * M - 20, 18, true).slice(0, 3);
  P.fuente(18, true, IPDF.cab); doc.text(tl, W / 2, P.y, { align:'center', lineHeightFactor:1.15 }); P.y += tl.length * 7.4 + 1;
  doc.setDrawColor.apply(doc, IPDF.cab); doc.setLineWidth(0.6); doc.line(W / 2 - 16, P.y, W / 2 + 16, P.y); doc.setLineWidth(0.25); P.y += 7;
  P.datos([['Empresa', C.razon], ['RUC', C.ruc], ['Obra o proyecto', C.obra], ['Área', d.area], ['Lugar', d.lugar], ['Código', d.cod], ['Versión', d.ver],
           ['Fecha de elaboración', dma(d.fecha)], ['Fecha de aprobación', dma((F.apr || {}).f)], ['IPERC relacionado', d.ipl ? [d.ipl.tit, d.ipl.cod].filter(Boolean).join(' · ') : '']],
           { x:M + 12, ancho:W - 2 * M - 24, wl:44, fs:8.8 });
  P.y += 3;
  P.fuente(11, true, IPDF.cab); doc.text('ÍNDICE', M + 12, P.y + 3); P.y += 9;
  P.indice(S, idx, 12);
  /* ── el contenido ── */
  P.nueva('a4', 'portrait');
  var h1 = function(k, sigue){ var s = S.filter(function(x){ return x.k === k; })[0]; if(s) P.h1(k, s.n, s.t, sigue); };
  h1('obj'); P.par(d.obj || '—');
  h1('alc'); P.par(d.alc || '—');
  h1('refs'); if((d.refs || []).length) P.vinetas(d.refs); else P.par('—');
  if((d.defs || []).length){ h1('defs'); P.tabla([{ t:'Término', w:22, b:true }, { t:'Qué es', w:78 }], d.defs.map(function(x){ return [x.t, x.d]; }), { fs:8.4 }); }
  if((d.resp || []).length){ h1('resp'); P.tabla([{ t:'Quién', w:26, b:true }, { t:'Su responsabilidad en este PETS', w:74 }], d.resp.map(function(x){ return [x.q, x.d]; }), { fs:8.4 }); }
  h1('pers');
  if((d.pers || []).length) P.tabla([{ t:'Cargo', w:30, b:true }, { t:'Cantidad', w:11, al:'center' }, { t:'Requisitos y competencias', w:59 }], d.pers.map(function(x){ return [x.c, x.n ? String(x.n) : '', x.req]; }), { fs:8.4 });
  else P.par('—');
  h1('epp', Math.ceil((d.epp || []).length / 2) * 6.2 + 8);
  if((d.epp || []).length){ P.par('Todo el personal de la tarea usa:', { fs:9, tras:1.5 }); P.casillas(d.epp); }
  else P.par('—');
  h1('eq');
  [['eq', 'Equipos'], ['her', 'Herramientas'], ['mat', 'Materiales']].forEach(function(q){
    var L = d[q[0]] || []; if(!L.length) return;
    P.par(q[1], { b:true, fs:9, tras:0.5 }); P.vinetas(L, { fs:8.8 });
  });
  if(!(d.eq || []).length && !(d.her || []).length && !(d.mat || []).length) P.par('—');
  if((d.pel || []).length){
    h1('pel');
    if(d.ipl) P.par('Del ' + [d.ipl.tit, d.ipl.cod].filter(Boolean).join(' · ') + '.', { fs:8.4, col:IPDF.gris, it:true });
    P.tabla([{ t:'N.°', w:6, al:'center' }, { t:'Peligro', w:28 }, { t:'Riesgo', w:28 }, { t:'Medidas de control', w:48 }], d.pel.map(function(x, i){ return [String(i + 1), x.p, x.r, x.c]; }), { fs:8.2 });
  }
  h1('pro');
  var conRie = (d.pasos || []).some(function(x){ return x.rie || x.ctl; });
  if(!(d.pasos || []).length) P.par('—');
  else if(conRie) P.tabla([{ t:'Paso', w:7, al:'center', b:true }, { t:'Qué se hace', w:46 }, { t:'Riesgos del paso', w:23 }, { t:'Cómo se controla', w:30 }], d.pasos.map(function(x, i){ return [String(i + 1), x.t, x.rie, x.ctl]; }), { fs:8.3 });
  else P.tabla([{ t:'Paso', w:8, al:'center', b:true }, { t:'Qué se hace', w:92 }], d.pasos.map(function(x, i){ return [String(i + 1), x.t]; }), { fs:8.6 });
  h1('restr'); if((d.restr || []).length) P.vinetas(d.restr); else P.par('—');
  if((d.regs || []).length){ h1('regs'); P.vinetas(d.regs); }
  h1('fir');
  P.firmas(PETS_ROLES, F, { ancho:P.ancho(), altoFirma:20, pie:[['Fecha de elaboración', dma(d.fecha)], ['Fecha de aprobación', dma((F.apr || {}).f)]] });
  P.par('Trabajadores que participaron en su elaboración:', { fs:9, b:true, tras:1 });
  P.participantes(d.part || [], { dni:true, blancos:(d.part || []).length ? 0 : 5 });
  h1('cc');
  P.tabla([{ t:'Versión', w:10, al:'center' }, { t:'Fecha de aprobación', w:16, al:'center' }, { t:'Descripción del cambio', w:48 }, { t:'Aprobado por', w:26 }],
    ipetsHistVigente(d).map(function(h){ return [h.ver, ipDma(h.fecha), h.cambio, h.apr]; }), { fs:8 });
  P.fin();
  return P;
}
function petsPdf(d, C){
  if(d.formato === 'anexo10') return petsPdfA10(d, C);
  var a = _petsArmar(d, C, null); return _petsArmar(d, C, a.marcas).doc;
}

/* ══ EL PETS EN EL FORMATO DEL ANEXO 10 (28/10/2026, #186) ════════════════════════════════════════════════════════
   D.S. N.° 024-2016-EM, Anexo 10: en cada hoja la cabecera (el logo | PETS y el nombre de la tarea | área, versión,
   código y página); 1 Personal, 2 Equipos de protección personal, 3 Equipo / herramientas / materiales, 4 Procedimiento
   y 5 Restricciones; al final las cuatro firmas (preparado, revisado, revisado y aprobado) con la fecha de elaboración y
   la de aprobación. Con los colores del IPERC de obra (1F4E79 y D5E8F0). Lo demás del PETS (objetivo, definiciones,
   peligros, participantes, control de cambios) sale en el completo. */
function petsPdfA10(d, C){
  var F = d.firmas || {}, K = IPDF_OBRA, dma = ipDma, pe = !C || C.pais === 'pe';
  var meta = { pie:[d.cod, 'PETS · ' + (d.tit || ''), 'Versión ' + d.ver].filter(Boolean).join(' · ') };
  var P = _ipDoc(C, meta), doc = P.doc, M = 12, W = P.W(), AW = W - 2 * M;
  P.M = function(){ return M; };
  var celda = function(x, y, w, h, t, o){
    o = o || {};
    doc.setDrawColor.apply(doc, K.raya); doc.setLineWidth(0.25);
    if(o.f){ doc.setFillColor.apply(doc, o.f); doc.rect(x, y, w, h, 'FD'); } else doc.rect(x, y, w, h);
    if(t == null || t === '') return;
    var fs = o.fs || 8, lh = fs * IPT * 1.22, L = P.lineas(t, (w - 3) * 0.97, fs, o.b).slice(0, o.max || Math.max(1, Math.floor((h - 0.6) / lh)));
    P.fuente(fs, o.b, o.c || K.negro);
    var al = o.al || 'left', tx = al === 'center' ? x + w / 2 : x + 1.5;
    doc.text(L, tx, y + (h - L.length * lh) / 2 + fs * IPT * 0.86, { align:al, lineHeightFactor:1.22 });
  };
  var Y0 = 8, hC = 24, wL = 38, wR = 50, wC = AW - wL - wR, rh = hC / 4;
  P.top = function(){ return Y0 + hC + 6; };
  P.fondo = function(){ return P.H() - 13; };
  P.cab = function(){
    var x2 = M + wL, x3 = M + wL + wC;
    celda(M, Y0, wL, hC, '');
    if(C.logo){
      var bw = wL - 6, bh = hC - 6, iw = bw, ih = bw / (C.logo.r || 1); if(ih > bh){ ih = bh; iw = bh * (C.logo.r || 1); }
      try{ doc.addImage(C.logo.du, 'JPEG', M + (wL - iw) / 2, Y0 + (hC - ih) / 2, iw, ih, 'logo', 'FAST'); }catch(e){}
    }else celda(M, Y0, wL, hC, C.razon || 'Empresa', { b:true, fs:8, al:'center', max:4 });
    celda(x2, Y0, wC, 8, pe ? 'PROCEDIMIENTO ESCRITO DE TRABAJO SEGURO (PETS)' : 'PROCEDIMIENTO ESCRITO DE TRABAJO SEGURO', { f:K.oscuro, c:K.blanco, b:true, fs:8.6, al:'center', max:1 });
    celda(x2, Y0 + 8, wC, hC - 8, String(d.tit || '').toUpperCase(), { f:K.claro, b:true, fs:11, al:'center', max:3 });
    [['Área:', d.area || '—'], ['Versión:', d.ver], ['Código:', d.cod || '—'], ['Página:', '']].forEach(function(r, i){
      celda(x3, Y0 + i * rh, 17, rh, r[0], { f:K.claro, b:true, fs:7 });
      celda(x3 + 17, Y0 + i * rh, wR - 17, rh, r[1], { fs:7.6, max:1 });
    });
  };
  P.fin = function(){
    var n = doc.getNumberOfPages(), hoy = dma(C.hoy) || '';
    for(var i = 1; i <= n; i++){
      doc.setPage(i);
      var H = P.H();
      P.fuente(7.6, false, K.negro); doc.text(i + ' de ' + n, M + wL + wC + 17 + 1.5, Y0 + 3 * rh + rh / 2 + 7.6 * IPT * 0.36);
      doc.setDrawColor.apply(doc, IPDF.rayaF); doc.setLineWidth(0.2); doc.line(M, H - 9.5, W - M, H - 9.5);
      P.fuente(6.8, false, IPDF.suave); doc.text(_ipP(meta.pie || ''), M, H - 6);
      if(hoy) doc.text('Impreso el ' + hoy, W - M, H - 6, { align:'right' });
    }
    return doc;
  };
  var tema = { cab:K.claro, cabTx:K.negro, gru:K.claro, gruTx:K.negro, banda:K.claro, bandaTx:K.negro, raya:K.raya };
  var sec = function(n, t, sigue){ if(P.y > P.top() + 1) P.y += 3; P.sitio(9 + Math.min(sigue || 12, 60)); celda(M, P.y, AW, 6.6, n + '. ' + t.toUpperCase(), { f:K.oscuro, c:K.blanco, b:true, fs:8.8 }); P.y += 9; };
  P.cab(); P.y = P.top();
  /* 1 · personal */
  sec('1', 'Personal', 16);
  if((d.pers || []).length) P.tabla([{ t:'Cargo', w:30, b:true }, { t:'Cantidad', w:11, al:'center' }, { t:'Requisitos y competencias', w:59 }], d.pers.map(function(x){ return [x.c, x.n ? String(x.n) : '', x.req]; }), { fs:8.4, tema:tema });
  else P.par('—');
  /* 2 · EPP */
  sec('2', 'Equipos de protección personal', Math.ceil((d.epp || []).length / 2) * 6.2);
  if((d.epp || []).length) P.casillas(d.epp); else P.par('—');
  /* 3 · equipo, herramientas y materiales (una columna cada uno) */
  sec('3', 'Equipo / herramientas / materiales', 20);
  var lista = function(L){ return (L || []).length ? L.map(function(t){ return '• ' + t; }).join('\n') : '—'; };
  P.tabla([{ t:'Equipos', w:1 }, { t:'Herramientas', w:1 }, { t:'Materiales', w:1 }], [[lista(d.eq), lista(d.her), lista(d.mat)]], { fs:8.4, tema:tema });
  /* 4 · el procedimiento */
  var conRie = (d.pasos || []).some(function(x){ return x.rie || x.ctl; });
  sec('4', 'Procedimiento', 16);
  if(!(d.pasos || []).length) P.par('—');
  else if(conRie) P.tabla([{ t:'Paso', w:7, al:'center', b:true }, { t:'Qué se hace', w:46 }, { t:'Riesgos del paso', w:23 }, { t:'Cómo se controla', w:30 }], d.pasos.map(function(x, i){ return [String(i + 1), x.t, x.rie, x.ctl]; }), { fs:8.3, tema:tema });
  else P.tabla([{ t:'Paso', w:8, al:'center', b:true }, { t:'Qué se hace', w:92 }], d.pasos.map(function(x, i){ return [String(i + 1), x.t]; }), { fs:8.6, tema:tema });
  /* 5 · restricciones */
  sec('5', 'Restricciones', 12);
  if((d.restr || []).length) P.vinetas(d.restr); else P.par('—');
  /* las firmas: el rol, su cargo, el trazo (o el espacio), el nombre, y las dos fechas */
  var hF = 6 + 9 + 20 + 8 + 7;
  P.y += 3; P.sitio(hF + 2);
  var y = P.y, w = AW / 4;
  PETS_ROLES.forEach(function(r, i){
    var x = M + i * w, f = F[r[0]] || {}, ok = ipFirmada(f);
    celda(x, y, w, 6, r[1].toUpperCase(), { f:K.oscuro, c:K.blanco, b:true, fs:7.6, al:'center' });
    celda(x, y + 6, w, 9, f.c || '', { f:K.claro, fs:6.8, al:'center', max:3 });
    celda(x, y + 15, w, 20, '');
    if(f.tr && ok) _ipFirmaPDF(doc, f.tr, x + 3, y + 16, w - 6, 15);
    else if(ok){ P.fuente(6.6, false, IPDF.gris); doc.text('Firmó en papel', x + w / 2, y + 26, { align:'center' }); }
    celda(x, y + 35, w, 8, f.n || '', { b:true, fs:7.6, al:'center', max:2 });
  });
  y += 43;
  celda(M, y, AW / 4, 7, 'FECHA DE ELABORACIÓN', { f:K.claro, b:true, fs:7 });
  celda(M + AW / 4, y, AW / 4, 7, dma(d.fecha) || '', { fs:8, al:'center' });
  celda(M + AW / 2, y, AW / 4, 7, 'FECHA DE APROBACIÓN', { f:K.claro, b:true, fs:7 });
  celda(M + 3 * AW / 4, y, AW / 4, 7, dma((F.apr || {}).f) || '', { fs:8, al:'center' });
  P.y = y + 7;
  P.fin();
  return doc;
}


/* ══ EL IPERC EN EXCEL (27/10/2026) ═══════════════════════════════════════════════════════════════════════════════
   La matriz completa (cada índice en su columna, la de la R.M. 050-2013-TR con sus fórmulas: IP, IP × S, el nivel y si
   es significativo se recalculan solos al cambiar un índice), con el logo, la metodología y el control de cambios. */
function _iplXlsEst(X){
  var E = new X.Estilos(), K = X.C, az = '17344D', gc = 'F0F4F7';
  var S = { E:E,
    tit:E.xf({ b:1, sz:14, c:az }), sub:E.xf({ sz:10, c:K.gris }), et:E.xf({ b:1, sz:9, c:K.gris, f:gc, borde:true, v:'center' }),
    val:E.xf({ sz:10, c:K.tinta, borde:true, wrap:1, v:'center' }), g:E.xf({ b:1, sz:9, c:az, f:'E2E9EF', borde:true, h:'center', v:'center' }),
    cab:E.xf({ b:1, sz:9, c:K.blanco, f:az, borde:true, h:'center', v:'center', wrap:1 }), tx:E.xf({ sz:9, c:K.tinta, borde:true, wrap:1, v:'top' }),
    c:E.xf({ sz:9, c:K.tinta, borde:true, h:'center', v:'top' }), n:E.xf({ b:1, sz:9, c:K.tinta, borde:true, h:'center', v:'top' }),
    banda:E.xf({ b:1, sz:10, c:az, f:gc, borde:true, v:'center' }), f:E.xf({ sz:9, c:K.tinta, borde:true, h:'center', v:'top', fmt:'dd/mm/yyyy' }),
    sig:E.xf({ b:1, sz:9, c:'9B1C1C', borde:true, h:'center', v:'center' }), ley:E.xf({ sz:9, c:K.gris, wrap:1, v:'top' }) };
  S.niv = {}; IPL_NIV.concat(IPL_MIN).forEach(function(n){ S.niv[n.k] = E.xf({ b:1, sz:9, c:n.xt, f:n.xf, borde:true, h:'center', v:'center', wrap:1 }); });
  return S;
}
function _iplXlsLogo(h, medios, logo, c, alto){
  try{
    var m0 = logo && /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(String(logo.du || ''));
    if(!m0) return;
    var bin = atob(m0[2]), u8 = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    medios.push({ b:u8, ext:/png/i.test(m0[1]) ? 'png' : 'jpeg' });
    var ancho = Math.min(170, Math.round(alto * (logo.r || 1)));
    h.imagen(c, 1, medios.length - 1, ancho, alto, 4, 3);
  }catch(e){}
}
/* el control de cambios, en su hoja (los dos modelos) */
function _iplXlsCambios(X, S, d){
  var cc = new X.Hoja('Control de cambios'); cc.pie = 'Control de cambios';
  cc.anchos[0] = 10; cc.anchos[1] = 16; cc.anchos[2] = 70; cc.anchos[3] = 30;
  cc.unir(0, 1, 3, 1, 'Control de cambios · ' + (d.cod || d.tit), S.tit); cc.altos[1] = 24;
  ['Versión', 'Fecha de aprobación', 'Descripción del cambio', 'Aprobado por'].forEach(function(t, j){ cc.celda(j, 3, t, S.cab); });
  ipetsHistVigente(d).forEach(function(x, i){
    cc.celda(0, 4 + i, x.ver, S.c); if(x.fecha) cc.celda(1, 4 + i, X.serial(x.fecha), S.f); else cc.celda(1, 4 + i, '', S.c);
    cc.celda(2, 4 + i, x.cambio, S.tx); cc.celda(3, 4 + i, x.apr, S.tx);
  });
  return cc;
}
/* una firma (su trazo) como PNG, para el Excel: solo donde hay canvas (en el navegador); si no, sin imagen */
function _ipFirmaPng(tr, ancho){
  try{
    if(!tr || !tr.p || !tr.p.length || typeof document === 'undefined') return null;
    var w = ancho || 360, h = Math.max(40, Math.round(w * (tr.h || 380) / 1000));
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var g = cv.getContext('2d'); if(!g || !cv.toDataURL) return null;
    g.strokeStyle = '#101820'; g.lineWidth = Math.max(1.6, w / 220); g.lineCap = 'round'; g.lineJoin = 'round';
    var k = w / 1000;
    tr.p.forEach(function(s){ if(s.length < 4) return; g.beginPath(); g.moveTo(s[0] * k, s[1] * k); for(var i = 2; i < s.length; i += 2) g.lineTo(s[i] * k, s[i + 1] * k); g.stroke(); });
    var du = cv.toDataURL('image/png'), m = /^data:image\/png;base64,(.+)$/.exec(du); if(!m) return null;
    var bin = atob(m[1]), u8 = new Uint8Array(bin.length); for(var j = 0; j < bin.length; j++) u8[j] = bin.charCodeAt(j);
    return { b:u8, w:w, h:h };
  }catch(e){ return null; }
}

/* ══ EL IPERC EN EXCEL, MODELO DE OBRA (28/10/2026, #186) ════════════════════════════════════════════════════════
   Igual que su Excel: las 28 columnas con sus anchos (en minería, sin los índices), A3 apaisado ajustado al ancho,
   márgenes de 0.2 y 0.3, las filas 1 a 10 repetidas al imprimir, N.° y Actividad fijos al moverse, P, R y el nivel con
   sus fórmulas, el relleno de cada nivel, y al pie los criterios, la normativa y las firmas (su trazo como imagen). */
function _iplXlsObra(d, C){
  var X = RCAP.xlsx, S = _iplXlsEst(X), E = S.E, mina = d.met === 'ds024', medios = [], dma = ipDma, F = d.firmas || {}, Q = IPL_OBRA_COL;
  var raya = { c:Q.raya }, base = { borde:raya, v:'center' };
  var st = function(o){ return E.xf(Object.assign({}, base, o)); };
  var O = { tit:st({ b:1, sz:14, c:'FFFFFF', f:Q.oscuro, h:'center', wrap:1 }), proy:st({ b:1, sz:11, c:'000000', f:Q.claro, h:'center', wrap:1 }),
    et:st({ b:1, sz:9, c:'000000', f:Q.claro }), val:st({ sz:9, c:'000000' }), ley:st({ sz:8, c:'000000', f:'FFFFFF' }),
    gru:st({ b:1, sz:9, c:'FFFFFF', f:Q.oscuro, h:'center', wrap:1 }), cab:st({ b:1, sz:8, c:'FFFFFF', f:Q.oscuro, h:'center', wrap:1 }),
    sec:st({ b:1, sz:10, c:'FFFFFF', f:Q.medio }), tx:st({ sz:8, c:'000000', wrap:1 }), num:st({ sz:8, c:'000000', h:'center' }),
    banda:st({ b:1, sz:10, c:'FFFFFF', f:Q.oscuro, h:'center' }), cEt:st({ b:1, sz:8, c:'000000', f:Q.claro, wrap:1 }),
    nCab:st({ b:1, sz:8, c:'FFFFFF', f:Q.medio, h:'center' }), fCab:st({ b:1, sz:9, c:'FFFFFF', f:Q.oscuro, h:'center' }),
    fCaja:st({ sz:8, c:'000000' }), fNom:st({ b:1, sz:9, c:'000000', h:'center', wrap:1 }), fCar:st({ sz:8, c:'000000', h:'center', wrap:1 }),
    fFec:st({ sz:8, c:'595959', h:'center' }), logoTx:st({ b:1, sz:9, c:'000000', h:'center', wrap:1 }) };
  O.niv = {}; Object.keys(Q.niv).forEach(function(k){ O.niv[k] = st({ b:1, sz:8, c:'000000', f:Q.niv[k], h:'center' }); });
  O.chip = {}; Object.keys(Q.niv).forEach(function(k){ O.chip[k] = st({ b:1, sz:8, c:'000000', f:Q.niv[k], h:'center' }); });
  var cols = iplColsObra(d), ult = cols.length - 1, h = new X.Hoja('IPERC'), ix = {};
  cols.forEach(function(c, j){ ix[c.k] = j; h.anchos[j] = c.w; });
  h.activa = true; h.pie = [d.cod, 'Revisión ' + d.ver].filter(Boolean).join(' · ') || 'IPERC';
  /* dónde cae cada parte de la cabecera y del pie (en minería hay menos columnas) */
  var R = mina ? { tit:[2, ult - 2], lab:[ult - 1, ult - 1], val:[ult, ult], fv:[3, 9], chips:[['B', 3, 3], ['M', 4, 4], ['A', 5, 5]], ley:[6, ult], fir:[[0, 4], [5, 9], [10, ult]] }
               : { tit:[2, 21], lab:[22, 23], val:[24, 27], fv:[3, 15], chips:[['triv', 3, 3], ['tol', 4, 4], ['mod', 5, 5], ['imp', 6, 6], ['int', 7, 12]], ley:[13, 27], fir:[[0, 8], [9, 17], [18, 27]] };
  /* 1 a 4 · el logo (o la razón social), el título, el proyecto, y código, revisión, fecha y páginas */
  h.unir(0, 1, 1, 4, C.logo ? '' : (C.razon || ''), C.logo ? O.val : O.logoTx);
  if(C.logo) _iplXlsLogo(h, medios, C.logo, 0, 76);
  h.unir(R.tit[0], 1, R.tit[1], 2, iplTituloObra(d), O.tit);
  h.unir(R.tit[0], 3, R.tit[1], 4, 'Proyecto: ' + ([C.obra, d.lugar].filter(Boolean).join(' – ') || '—') + (d.area ? '\nAlcance: ' + d.area : ''), O.proy);
  [['Código:', d.cod || ''], ['Revisión:', d.ver], ['Fecha:', dma(d.fecha) || ''], ['Páginas:', '']].forEach(function(r, i){
    h.unir(R.lab[0], 1 + i, R.lab[1], 1 + i, r[0], O.et); h.unir(R.val[0], 1 + i, R.val[1], 1 + i, r[1], O.val);
  });
  h.altos[1] = 18; h.altos[2] = 18; h.altos[3] = 15; h.altos[4] = d.area ? 18 : 15;
  /* 5 a 7 · quién elaboró, revisó y aprobó */
  [['elab', 'Elaborado por:'], ['rev', 'Revisado por:'], ['apr', 'Aprobado por:']].forEach(function(r, i){
    var f = F[r[0]] || {};
    h.unir(0, 5 + i, 2, 5 + i, r[1], O.et); h.unir(R.fv[0], 5 + i, R.fv[1], 5 + i, [f.n, f.c].filter(Boolean).join(' – '), O.val);
  });
  /* 8 · la leyenda de los niveles */
  h.unir(0, 8, 2, 8, 'Nivel de riesgo:', O.et);
  R.chips.forEach(function(c){ h.unir(c[1], 8, c[2], 8, iplNivDe(c[0]).n.toUpperCase(), O.chip[c[0]]); });
  h.unir(R.ley[0], 8, R.ley[1], 8, mina ? IPL_MIN.map(function(n){ return n.n + ': corregir en ' + n.plazo; }).join(' · ') + ' · el nivel se marca con la matriz de la empresa'
                                        : 'R = Probabilidad (A+B+C+D) × Severidad', O.ley);
  /* 9 y 10 · los grupos y las columnas */
  iplGruposObra(cols).forEach(function(g){ h.unir(g.de, 9, g.a, 9, g.t, O.gru); });
  cols.forEach(function(c, j){ h.celda(j, 10, c.t, O.cab); });
  h.altos[9] = mina ? 26 : 15; h.altos[10] = 24;
  h.congelar = { c:2, r:10 }; h.titulos = "'IPERC'!$1:$10";
  /* 11… · cada proceso con sus filas */
  var fr = 11, n = 0, L = X.ref;
  var evF = function(s, r){
    if(mina) return;
    var a = ix[s + 'a'], dd = ix[s + 'd'], p = ix[s + 'p'], sv = ix[s + 's'], rr = ix[s + 'r'], nv = ix[s + 'niv'];
    return { p:'IF(COUNT(' + L(a, r) + ':' + L(dd, r) + ')=4,SUM(' + L(a, r) + ':' + L(dd, r) + '),"")',
             r:'IF(AND(ISNUMBER(' + L(p, r) + '),ISNUMBER(' + L(sv, r) + ')),' + L(p, r) + '*' + L(sv, r) + ',"")',
             niv:'IF(' + L(rr, r) + '="","",IF(' + L(rr, r) + '<=4,"TRIVIAL",IF(' + L(rr, r) + '<=8,"TOLERABLE",IF(' + L(rr, r) + '<=16,"MODERADO",IF(' + L(rr, r) + '<=24,"IMPORTANTE","INTOLERABLE")))))' };
  };
  iplProcesos(d).forEach(function(p, pi){
    h.unir(0, fr, ult, fr, (pi + 1) + '. ' + String(p.n || 'Sin proceso').toUpperCase(), O.sec); h.altos[fr] = 18; fr++;
    p.filas.forEach(function(x){
      var f = x.f; if(iplFilaVacia(f)) return;
      n++;
      var cel = iplCeldasObra(f, n, d), fi = evF('i', fr), fre = evF('r', fr), lineas = 1;
      cols.forEach(function(c, j){
        var v = cel[c.k], k = c.k;
        if(c.niv){ var e = c.niv === 'i' ? cel.a : cel.b, fo = c.niv === 'i' ? fi : fre; h.celda(j, fr, v || '', e ? O.niv[e.niv.k] : O.num, fo ? fo.niv : null); return; }
        if(/^[ir][abcds]$/.test(k)){ h.celda(j, fr, v ? +v : '', O.num); return; }
        if(/^[ir]p$/.test(k)){ h.celda(j, fr, v ? +v : '', O.num, (k[0] === 'i' ? fi : fre).p); return; }
        if(/^[ir]r$/.test(k)){ h.celda(j, fr, v ? +v : '', O.num, (k[0] === 'i' ? fi : fre).r); return; }
        if(k === 'n'){ h.celda(j, fr, n, O.num); return; }
        if(k === 'rut'){ h.celda(j, fr, v, O.num); return; }
        h.celda(j, fr, v, O.tx);
        if(v) lineas = Math.max(lineas, String(v).split('\n').reduce(function(s, z){ return s + Math.max(1, Math.ceil(z.length / (c.w * 1.3))); }, 0));
      });
      h.altos[fr] = Math.max(24, Math.min(170, lineas * 10.5 + 5));
      fr++;
    });
  });
  if(!n){ h.unir(0, fr, ult, fr, 'Todavía no hay peligros en esta matriz.', O.tx); fr++; }
  /* el pie: los criterios de evaluación */
  var dos = function(c1, c2, t1, t2, s1, s2){
    h.unir(c1[0], fr, c1[1], fr, t1, s1); h.unir(c2[0], fr, c2[1], fr, t2, s2);
    var w2 = 0; for(var j = c2[0]; j <= c2[1]; j++) w2 += cols[j].w;
    var w1 = 0; for(var k = c1[0]; k <= c1[1]; k++) w1 += cols[k].w;
    h.altos[fr] = Math.max(15, Math.min(150, Math.max(Math.ceil(String(t2 || '').length / (w2 * 1.3)), Math.ceil(String(t1 || '').length / (w1 * 1.3))) * 11 + 5)); fr++;
  };
  h.unir(0, fr, ult, fr, 'CRITERIOS DE EVALUACIÓN', O.banda); h.altos[fr] = 16; fr++;
  iplCriterios(d, C).forEach(function(r){ dos([0, 3], [4, ult], r[0], r[1], O.cEt, O.tx); });
  var norm = iplNormativa(d);
  if(norm.length){
    fr++;
    h.unir(0, fr, ult, fr, 'NORMATIVA, LEYES Y DECRETOS DE REFERENCIA', O.banda); h.altos[fr] = 16; fr++;
    dos([0, 4], [5, ult], 'Norma', 'Aplicación', O.nCab, O.nCab);
    norm.forEach(function(r){ dos([0, 4], [5, ult], r[0], r[1], O.tx, O.tx); });
  }
  /* las tres firmas: su trazo como imagen (si firmó en la pantalla), el nombre, el cargo y la fecha */
  fr += 2;
  [['elab', 'ELABORADO POR'], ['rev', 'REVISADO POR'], ['apr', 'APROBADO POR']].forEach(function(q, i){
    var a = R.fir[i][0], b = R.fir[i][1], f = F[q[0]] || {}, ok = ipFirmada(f);
    h.unir(a, fr, b, fr, q[1], O.fCab);
    h.unir(a, fr + 1, b, fr + 3, '', O.fCaja);
    h.unir(a, fr + 4, b, fr + 4, f.n || '', O.fNom);
    h.unir(a, fr + 5, b, fr + 5, f.c || '', O.fCar);
    h.unir(a, fr + 6, b, fr + 6, ok ? 'Firmó el ' + dma(f.f) + (f.via === 'papel' ? ' (en papel)' : '') : 'Firma / Fecha', O.fFec);
    if(ok && f.tr){
      var png = _ipFirmaPng(f.tr, 360);
      if(png){
        var wpx = 0; for(var j = a; j <= b; j++) wpx += cols[j].w * 7 + 5;
        var hh = 52, ww = Math.round(hh * png.w / png.h); if(ww > wpx - 16){ ww = wpx - 16; hh = Math.round(ww * png.h / png.w); }
        medios.push({ b:png.b, ext:'png' }); h.imagen(a, fr + 1, medios.length - 1, ww, hh, Math.max(4, Math.round((wpx - ww) / 2)), 4);
      }
    }
  });
  h.altos[fr] = 16; h.altos[fr + 1] = 20; h.altos[fr + 2] = 20; h.altos[fr + 3] = 20; h.altos[fr + 4] = 15; h.altos[fr + 5] = 15; h.altos[fr + 6] = 14;
  /* A3 apaisado, ajustado al ancho, con los márgenes de su Excel */
  var xml0 = h.xml;
  h.xml = function(){
    return xml0.call(this).replace(/<pageMargins[^>]*\/>/, '<pageMargins left="0.2" right="0.2" top="0.3" bottom="0.3" header="0.2" footer="0.2"/>')
      .replace('<pageSetup paperSize="9"', '<pageSetup paperSize="8"');
  };
  return X.libro([h, _iplXlsCambios(X, S, d)], E, d.tit || 'IPERC de línea base', medios);
}
function iplXls(d, C){
  if(d.formato !== 'completo') return _iplXlsObra(d, C);
  var X = RCAP.xlsx, S = _iplXlsEst(X), mina = d.met === 'ds024', medios = [], dma = ipDma, F = d.firmas || {};
  var cols = [['N.°', 5], ['Proceso', 16], ['Actividad', 20], ['Tarea', 22], ['Puesto de trabajo', 14], ['R / NR', 6], ['S / SO', 6], ['Peligro', 24], ['Riesgo', 22], ['Consecuencia', 20], ['Requisito legal', 18]];
  var gI0 = cols.length;
  if(!mina) cols = cols.concat([['A', 4.5], ['B', 4.5], ['C', 4.5], ['D', 4.5], ['IP', 5], ['S', 4.5], ['IP × S', 6.5]]);
  cols = cols.concat([['Nivel de riesgo', 12], ['Significativo', 10]]);
  var gC0 = cols.length; cols = cols.concat([['Eliminación', 18], ['Sustitución', 18], ['Controles de ingeniería', 22], ['Controles administrativos y señalización', 26], ['EPP', 22]]);
  var gR0 = cols.length;
  if(!mina) cols = cols.concat([['A', 4.5], ['B', 4.5], ['C', 4.5], ['D', 4.5], ['IP', 5], ['S', 4.5], ['IP × S', 6.5]]);
  cols = cols.concat([['Nivel de riesgo', 12], ['Responsable', 16], ['Plazo', 11]]);
  var ult = cols.length - 1, h = new X.Hoja('IPERC');
  h.activa = true; h.pie = d.tit; h.escala = 60;
  cols.forEach(function(c, j){ h.anchos[j] = c[1]; });
  /* la cabecera: título, empresa y obra, código, versión y fechas (y el logo, si lo hay) */
  var ini = C.logo ? 3 : 0;
  h.unir(ini, 1, ult, 1, (d.tit || 'IPERC de línea base').toUpperCase() + ' · IDENTIFICACIÓN DE PELIGROS, EVALUACIÓN DE RIESGOS Y MEDIDAS DE CONTROL', S.tit); h.altos[1] = 26;
  h.unir(ini, 2, ult, 2, [C.razon, C.ruc ? 'RUC ' + C.ruc : '', C.obra, d.area, d.lugar].filter(Boolean).join(' · '), S.sub); h.altos[2] = 16;
  h.unir(ini, 3, ult, 3, ['Código: ' + (d.cod || '—'), 'Versión: ' + d.ver, 'Elaborado: ' + (dma(d.fecha) || '—'), 'Aprobado: ' + (dma((F.apr || {}).f) || '—'),
    'Método: ' + IPL_MET[d.met].n + (C.pais === 'pe' ? ' (' + IPL_MET[d.met].norma + ')' : '')].join('   ·   '), S.sub); h.altos[3] = 16;
  if(C.logo) _iplXlsLogo(h, medios, C.logo, 0, 52);
  /* los grupos y la cabecera de columnas */
  var fr = 5;
  h.unir(0, fr, gI0 - 1, fr, '', S.g);
  h.unir(gI0, fr, gC0 - 1, fr, 'Evaluación inicial', S.g);
  h.unir(gC0, fr, gR0 - 1, fr, 'Medidas de control (jerarquía de controles)', S.g);
  h.unir(gR0, fr, ult - 2, fr, 'Riesgo residual', S.g);
  h.unir(ult - 1, fr, ult, fr, '', S.g);
  fr++;
  cols.forEach(function(c, j){ h.celda(j, fr, c[0], S.cab); }); h.altos[fr] = 34; h.congelar = { c:4, r:fr }; h.titulos = "'IPERC'!$" + (fr - 1) + ':$' + fr;
  fr++;
  var corte = ({ tol:5, mod:9, imp:17 })[d.sig] || 9, n = 0;
  var evCeldas = function(c0, e, r){
    /* A, B, C, D, IP, S, IP×S, nivel (con sus fórmulas) */
    var L = X.ref, ip = iplEv(e, d.met, d.sig);
    ['a', 'b', 'c', 'd'].forEach(function(k, j){ h.celda(c0 + j, r, e[k] || '', S.c); });
    h.celda(c0 + 4, r, ip ? ip.ip : '', S.n, 'IF(COUNT(' + L(c0, r) + ':' + L(c0 + 3, r) + ')=4,SUM(' + L(c0, r) + ':' + L(c0 + 3, r) + '),"")');
    h.celda(c0 + 5, r, e.s || '', S.c);
    h.celda(c0 + 6, r, ip ? ip.nr : '', S.n, 'IF(AND(ISNUMBER(' + L(c0 + 4, r) + '),ISNUMBER(' + L(c0 + 5, r) + ')),' + L(c0 + 4, r) + '*' + L(c0 + 5, r) + ',"")');
    var nr = L(c0 + 6, r);
    h.celda(c0 + 7, r, ip ? ip.niv.n : '', ip ? S.niv[ip.niv.k] : S.c,
      'IF(' + nr + '="","",IF(' + nr + '<=4,"Trivial",IF(' + nr + '<=8,"Tolerable",IF(' + nr + '<=16,"Moderado",IF(' + nr + '<=24,"Importante","Intolerable")))))');
    return ip;
  };
  iplProcesos(d).forEach(function(p, pi){
    h.unir(0, fr, ult, fr, (pi + 1) + '. Proceso: ' + p.n, S.banda); h.altos[fr] = 18; fr++;
    p.filas.forEach(function(x){
      var f = x.f; if(iplFilaVacia(f)) return;
      n++;
      [n, f.proc, f.act, f.tar, f.pue, f.rut, f.tipo, f.pel, f.rie, f.con, f.leg].forEach(function(v, j){ h.celda(j, fr, v, j === 0 || j === 5 || j === 6 ? S.c : S.tx); });
      var a, b;
      if(mina){
        a = iplEv(f.ini, d.met, d.sig);
        h.celda(gI0, fr, a ? a.niv.n : '', a ? S.niv[a.niv.k] : S.c);
        h.celda(gI0 + 1, fr, a ? (a.sig ? 'Sí' : 'No') : '', a && a.sig ? S.sig : S.c);
      }else{
        a = evCeldas(gI0, f.ini, fr);
        var nr = X.ref(gI0 + 6, fr);
        h.celda(gI0 + 8, fr, a ? (a.sig ? 'Sí' : 'No') : '', a && a.sig ? S.sig : S.c, 'IF(' + nr + '="","",IF(' + nr + '>=' + corte + ',"Sí","No"))');
      }
      ['eli', 'sus', 'ing', 'adm', 'epp'].forEach(function(k, j){ h.celda(gC0 + j, fr, f.ctl[k], S.tx); });
      if(mina){ b = iplEv(f.res, d.met, d.sig); h.celda(gR0, fr, b ? b.niv.n : '', b ? S.niv[b.niv.k] : S.c); }
      else b = evCeldas(gR0, f.res, fr);
      h.celda(ult - 1, fr, f.resp, S.tx);
      if(f.plazo) h.celda(ult, fr, X.serial(f.plazo), S.f); else h.celda(ult, fr, '', S.c);
      var largo = Math.max.apply(null, [f.pel, f.rie, f.con, f.ctl.adm, f.ctl.ing, f.ctl.epp, f.act + ' ' + f.tar].map(function(t){ return String(t || '').length / 24 + String(t || '').split('\n').length; }));
      h.altos[fr] = Math.max(30, Math.min(160, Math.ceil(largo) * 12 + 6));
      fr++;
    });
  });
  if(!n){ h.unir(0, fr, ult, fr, 'Todavía no hay peligros en esta matriz.', S.tx); fr++; }
  /* las firmas */
  fr++;
  var anchoF = Math.floor((ult + 1) / 3);
  IPL_ROLES.forEach(function(r, i){
    var x = F[r[0]] || {}, c1 = i * anchoF, c2 = i === 2 ? ult : c1 + anchoF - 1;
    h.unir(c1, fr, c2, fr, r[1], S.cab);
    h.unir(c1, fr + 1, c2, fr + 1, 'Nombre: ' + (x.n || ''), S.val);
    h.unir(c1, fr + 2, c2, fr + 2, 'Cargo: ' + (x.c || ''), S.val);
    h.unir(c1, fr + 3, c2, fr + 3, 'Firma:', S.val);
    h.unir(c1, fr + 4, c2, fr + 4, 'Fecha: ' + (dma(x.f) || ''), S.val);
  });
  h.altos[fr + 3] = 40; fr += 6;
  h.unir(0, fr, ult, fr, 'Evaluación inicial: con los controles que ya existen. Riesgo residual: con las medidas de control propuestas. ' +
    (mina ? 'Nivel Alto: corregir en 0-24 horas; Medio: 0-72 horas; Bajo: 1 mes.' : 'IP = A + B + C + D; nivel = IP × S: Trivial 4, Tolerable 5 a 8, Moderado 9 a 16, Importante 17 a 24, Intolerable 25 a 36.') +
    ' Significativo: ' + ((IPL_SIG[d.met].filter(function(x){ return x[0] === d.sig; })[0] || ['', ''])[1]).toLowerCase() + '.', S.ley); h.altos[fr] = 30;
  /* la metodología */
  var m = new X.Hoja('Metodología'); m.pie = 'Metodología';
  m.anchos[0] = 12; m.anchos[1] = 34; m.anchos[2] = 34; m.anchos[3] = 34; m.anchos[4] = 34; m.anchos[5] = 34;
  var r = 1;
  m.unir(0, r, 5, r, 'Metodología de evaluación', S.tit); m.altos[r] = 24; r += 2;
  if(!mina){
    ['Índice', 'A · Personas expuestas', 'B · Procedimientos existentes', 'C · Capacitación', 'D · Exposición al riesgo', 'S · Severidad'].forEach(function(t, j){ m.celda(j, r, t, S.cab); }); m.altos[r] = 30; r++;
    [0, 1, 2].forEach(function(i){ [i + 1, IPL_IND[0].o[i], IPL_IND[1].o[i], IPL_IND[2].o[i], IPL_IND[3].o[i], IPL_SEV.o[i]].forEach(function(v, j){ m.celda(j, r, v, j ? S.tx : S.n); }); m.altos[r] = 44; r++; });
    r++;
  }
  ['Nivel', mina ? 'Plazo' : 'IP × S', 'Qué se hace'].forEach(function(t, j){ if(j === 2) m.unir(2, r, 5, r, t, S.cab); else m.celda(j, r, t, S.cab); }); r++;
  iplNiveles(d).forEach(function(nv){
    m.celda(0, r, nv.n, S.niv[nv.k]); m.celda(1, r, mina ? nv.plazo : (nv.de === nv.a ? String(nv.de) : nv.de + ' a ' + nv.a), S.c); m.unir(2, r, 5, r, nv.d, S.tx); m.altos[r] = 32; r++;
  });
  r++;
  m.unir(0, r, 5, r, 'Las medidas de control se proponen en este orden (ISO 45001:2018, 8.1.2): eliminación, sustitución, controles de ingeniería, controles administrativos y señalización, y equipos de protección personal.', S.ley); m.altos[r] = 30; r++;
  if(C.pais === 'pe'){ m.unir(0, r, 5, r, 'Base: ' + IPL_MET[d.met].norma + '. Se actualiza una vez al año como mínimo, y antes si cambian las condiciones de trabajo (Ley N.° 29783, art. 57).', S.ley); m.altos[r] = 30; r++; }
  /* el control de cambios */
  return X.libro([h, m, _iplXlsCambios(X, S, d)], S.E, d.tit || 'IPERC de línea base', medios);
}


/* ══ LAS SECCIONES «IPERC DE LÍNEA BASE» Y «PETS» DE LA WEB (27/10/2026) ══════════════════════════════════════════
   Cada una con su lista (con el cupo del plan, por obra) y su editor por pestañas. El IPERC: datos, matriz (por
   proceso, cada peligro con su evaluación inicial, sus controles y su riesgo residual), firmas y versiones. El PETS:
   datos, personal y EPP, procedimiento, firmas y versiones. Se guarda solo (y en este navegador mientras tanto, por si
   se corta la conexión). Firmado no se cambia: para corregirlo se quitan las firmas, o se abre la versión siguiente.
   Aprobado, se publica en «Documentos» (el PDF): lo toman el cartel QR, la app y la difusión. */
var IPETS_T = {
  ipl:{ k:'ipl', hoja:IPL_HOJA, vista:'iperc-lb', n:'IPERC de línea base', uno:'IPERC', cupoTx:'IPERC', nuevo:'＋ Nuevo IPERC', ic:'📙', roles:IPL_ROLES,
        carpeta:'iperc', carpetaN:'IPERC', limpio:iplLimpio, pdf:iplPdf, todos:'Todos los IPERC',
        tabs:[['datos', 'Datos'], ['matriz', 'Matriz'], ['firmas', 'Firmas'], ['versiones', 'Versiones']] },
  pets:{ k:'pets', hoja:PETS_HOJA, vista:'pets', n:'PETS', uno:'PETS', cupoTx:'PETS', nuevo:'＋ Nuevo PETS', ic:'📘', roles:PETS_ROLES,
        carpeta:'pets', carpetaN:'PETS', limpio:petsLimpio, pdf:petsPdf, todos:'Todos los PETS',
        tabs:[['datos', 'Datos'], ['recursos', 'Personal, EPP y equipos'], ['proc', 'Procedimiento'], ['firmas', 'Firmas'], ['versiones', 'Versiones']] }
};
var IPW = { k:'ipl', caja:null, n:0, obra:null, t:{}, filas:{}, ctx:null, ed:null, sub:{}, subT:{} };
function _ipwCss(){
  if(document.getElementById('ipw-css')) return;
  var st = document.createElement('style'); st.id = 'ipw-css';
  st.textContent = [
    '.ipw-cupo{display:inline-flex; align-items:center; gap:8px; font-size:13px; color:var(--gris)}',
    '.ipw-cupo b{font-variant-numeric:tabular-nums; color:var(--tinta); border:1px solid var(--raya2); border-radius:999px; padding:3px 10px; font-size:14px}',
    '.ipw-t h2{display:flex; align-items:center; gap:8px; flex-wrap:wrap}',
    '.ipw-res{display:grid; gap:10px}',
    '.ipw-barras{display:grid; grid-template-columns:max-content minmax(0,1fr); gap:6px 12px; align-items:center; font-size:12.5px; color:var(--gris)}',
    '.ipw-barra{display:flex; height:12px; border-radius:6px; overflow:hidden; background:var(--fondo); box-shadow:inset 0 0 0 1px var(--raya)}',
    '.ipw-barra i{display:block; height:100%}',
    '.ipw-ley{display:flex; flex-wrap:wrap; gap:4px 14px; font-size:12px; color:var(--gris)}',
    '.ipw-ley span{display:inline-flex; align-items:center; gap:5px}',
    '.ipw-ley span i{width:10px; height:10px; border-radius:3px; display:inline-block}',
    '.ipw-linea{display:flex; flex-wrap:wrap; align-items:center; gap:6px 12px; font-size:13px; color:var(--texto)}',
    '.ipw-linea small{color:var(--gris)}',
    '.ipw-ok{color:var(--ok); font-weight:600} .ipw-falta{color:var(--mal); font-weight:600}',
    '.ipw-barra-ed{display:flex; align-items:center; gap:10px 14px; flex-wrap:wrap; margin:0 0 14px}',
    '.ipw-barra-ed .t{flex:1 1 260px; min-width:0; display:flex; align-items:center; gap:8px; flex-wrap:wrap}',
    '.ipw-barra-ed .t b{color:var(--tinta); font-size:16px; font-weight:600; overflow-wrap:anywhere}',
    '.ipw-gu{font-size:12.5px; color:var(--gris)} .ipw-gu.mal{color:var(--mal)} .ipw-gu.ojo{color:var(--ojo)}',
    '.ipw-tabs{margin:0 0 18px}',
    '.ipw-g2{display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0 14px}',
    '.ipw-g3{display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:0 14px}',
    '.ipw-g2>.campo, .ipw-g3>.campo{min-width:0}',
    '.ipw-sec{margin:0 0 22px}',
    '.ipw-sec>h3{font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--gris); margin:0 0 10px; font-weight:600}',
    '.ipw-filas{display:grid; gap:8px}',
    '.ipw-fila{display:grid; gap:8px; align-items:start; border:1px solid var(--raya); border-radius:10px; padding:10px; background:var(--panel)}',
    '.ipw-fila .campo{margin:0} .ipw-fila label{font-size:11.5px; margin:0 0 4px}',
    '.ipw-fila-q{display:flex; gap:4px; align-items:center; justify-content:flex-end}',
    '.ipw-fila-q button{min-width:34px}',
    '.ipw-chips{display:flex; flex-wrap:wrap; gap:6px; margin:0 0 8px}',
    '.ipw-chip{display:inline-flex; align-items:center; gap:6px; font-size:13px; border:1px solid var(--raya2); border-radius:999px; padding:4px 6px 4px 11px; background:var(--panel)}',
    '.ipw-chip button{border:0; background:transparent; cursor:pointer; color:var(--gris); font-size:15px; line-height:1; padding:0 4px}',
    '.ipw-chip.ipw-sugc{border-style:dashed; color:var(--gris); padding:4px 11px; cursor:pointer}',
    '.ipw-chip.ipw-sugc:hover{color:var(--tinta); border-color:var(--tinta)}',
    '.ipw-add{display:flex; gap:8px} .ipw-add input{flex:1; min-width:0}',
    '.ipw-epp{display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:6px 14px; margin:0 0 10px}',
    '.ipw-epp label{display:flex; align-items:flex-start; gap:8px; font-size:13.5px; color:var(--texto); font-weight:400; margin:0; cursor:pointer}',
    '.ipw-epp input{width:17px; height:17px; margin:2px 0 0; flex:none}',
    '.ipw-mat{width:100%; border-collapse:collapse; font-size:13px}',
    '.ipw-mat th{text-align:left; font-size:11.5px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--gris); padding:8px; border-bottom:1px solid var(--raya); background:#FAFBFC}',
    '.ipw-mat td{padding:8px; border-bottom:1px solid var(--raya); vertical-align:top}',
    '.ipw-mat tr.proc td{background:var(--fondo); font-weight:600; color:var(--tinta)}',
    '.ipw-mat tr.f{cursor:pointer} .ipw-mat tr.f:hover td{background:#FAFBFC}',
    '.ipw-mat td small{display:block; color:var(--gris); font-size:12px; margin-top:2px}',
    '.ipw-mat .acc{white-space:nowrap; text-align:right}',
    '.ipw-mat .acc button{padding:4px 7px; min-width:0}',
    '.ipw-niv{display:inline-block; font-size:12px; font-weight:600; border-radius:6px; padding:2px 8px; white-space:nowrap}',
    '.ipw-niv.no{background:var(--fondo); color:var(--gris2); font-weight:500}',
    '.ipw-sig{font-size:11px; font-weight:600; color:var(--mal); margin-left:4px}',
    '.ipw-ctl{font-size:12.5px; color:var(--gris)}',
    '.ipw-tabla{overflow-x:auto; border:1px solid var(--raya); border-radius:10px; background:var(--panel)}',
    '.ipw-herr{display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin:0 0 14px}',
    '.ipw-herr select{width:auto; min-width:180px}',
    '.ipw-ev{display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); gap:8px}',
    '@media (max-width:860px){ .ipw-ev{grid-template-columns:repeat(2, minmax(0,1fr))} }',
    '.ipw-ev .campo{margin:0} .ipw-ev select{font-size:13px; padding:8px}',
    '.ipw-res-ev{display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin:10px 0 0; font-size:13.5px}',
    '.ipw-seg{margin:0}',
    '.ipw-firmas{display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:14px}',
    '.ipw-firma{border:1px solid var(--raya); border-radius:12px; padding:14px; background:var(--panel)}',
    '.ipw-firma h3{font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--gris); margin:0 0 10px}',
    '.ipw-firma img{display:block; max-width:100%; height:64px; object-fit:contain; background:#fff; border:1px solid var(--raya); border-radius:8px; margin:8px 0}',
    '.ipw-firma .ya{font-size:13px; color:var(--ok); font-weight:600}',
    '.ipw-firma .acciones{margin-top:10px}',
    '.ipw-sugs{display:grid; gap:6px; max-height:46vh; overflow:auto; border:1px solid var(--raya); border-radius:10px; padding:8px}',
    '.ipw-sugs label{display:grid; grid-template-columns:auto minmax(0,1fr); gap:8px; align-items:start; font-size:13.5px; color:var(--texto); font-weight:400; margin:0; padding:6px; border-radius:8px; cursor:pointer}',
    '.ipw-sugs label:hover{background:var(--fondo)}',
    '.ipw-sugs input{width:17px; height:17px; margin:2px 0 0}',
    '.ipw-sugs small{display:block; color:var(--gris); font-size:12px}',
    '.ipw-tipos{display:flex; flex-wrap:wrap; gap:6px; margin:0 0 12px}',
    '.ipw-tipos button{border:1px solid var(--raya2); background:var(--panel); border-radius:999px; padding:6px 12px; font-size:13px; cursor:pointer; color:var(--texto)}',
    '.ipw-tipos button.on{background:var(--tinta); border-color:var(--tinta); color:#fff}',
    '.ipw-hist{width:100%; border-collapse:collapse; font-size:13.5px}',
    '.ipw-hist th, .ipw-hist td{text-align:left; padding:8px 10px; border-bottom:1px solid var(--raya); vertical-align:top}',
    '.ipw-hist th{font-size:11.5px; letter-spacing:.04em; text-transform:uppercase; color:var(--gris); background:#FAFBFC}',
    '.ipw-pasos .ipw-fila{grid-template-columns:34px minmax(0,1fr) auto}',
    '.ipw-n{font-weight:700; color:var(--tinta); font-size:15px; text-align:center; padding-top:6px; font-variant-numeric:tabular-nums}',
    '.ipw-mas{font-size:12.5px; margin:6px 0 0}',
    '.ipw-mas summary{cursor:pointer; color:var(--azul)}',
    '.ipw-cand{font-size:13px}',
    '.ipw-sr{position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap}',
    /* 28/10/2026 · lo que está en su carpeta y en su cartel QR */
    '.ipw-sub .tarj-cuerpo{display:grid; gap:0; padding-top:4px}',
    '.ipw-subf{display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid var(--raya)}',
    '.ipw-subf:last-child{border-bottom:0}',
    '.ipw-subf .ic{font:600 10.5px/1 var(--mono); letter-spacing:.04em; padding:6px 7px; border-radius:6px; color:#fff; background:var(--gris)}',
    '.ipw-subf .ic.pdf{background:#B42318} .ipw-subf .ic.img{background:#0F766E} .ipw-subf .ic.word{background:#1D4ED8} .ipw-subf .ic.excel{background:#15803D} .ipw-subf .ic.enlace{background:#475569}',
    '.ipw-subf b{display:block; font-weight:500; color:var(--tinta); overflow-wrap:anywhere}',
    '.ipw-subf small{display:block; color:var(--gris); font-size:12.5px; margin-top:2px}',
    '.ipw-subf .acciones{margin:0; flex-wrap:nowrap}'
  ].join('\n');
  document.head.appendChild(st);
}
/* ── lo de la obra (para los PDF y los textos de partida) ── */
function ipwCtx(fresco){
  var o = YO.obra || {};
  if(!fresco && IPW.ctx && IPW.ctx.obraId === o.id && Date.now() - IPW.ctx.t < 120000) return Promise.resolve(IPW.ctx);
  var nada = function(){ return null; };
  return Promise.all([(typeof empleadorP === 'function' ? empleadorP() : Promise.resolve(null)).catch(nada),
                      (typeof obraInfo === 'function' ? obraInfo() : Promise.resolve(null)).catch(nada)]).then(function(r){
    var emp = r[0] || {};
    return ipLogoListo(emp.logo).then(function(L){
      IPW.ctx = { obraId:o.id, t:Date.now(), razon:emp.razon || (typeof empresaDeObraP === 'function' ? empresaDeObraP() : '') || o.nombre || '', ruc:String(o.ruc || ''),
        obra:(typeof nombreObraP === 'function' ? nombreObraP() : '') || o.nombre || '', logo:L, sector:(typeof sectorObraP === 'function' ? sectorObraP() : 'construccion'),
        pais:(typeof paisObraP === 'function' ? paisObraP() : 'pe'), hoy:hoyISO() };
      return IPW.ctx;
    });
  });
}
/* ── los documentos de la obra (sst_doc) ── */
function ipwTraer(k, fresco){
  var oid = (YO.obra || {}).id, T = IPETS_T[k];
  if(IPW.obra !== oid){ IPW.obra = oid; IPW.filas = {}; IPW.t = {}; }
  if(!fresco && IPW.filas[k] && Date.now() - (IPW.t[k] || 0) < 15000) return Promise.resolve(IPW.filas[k]);
  return traer('sst_doc', '&hoja=eq.' + T.hoja + '&select=id,hoja,nombre,nota,creado&order=creado.asc', 60).then(function(r){
    if((YO.obra || {}).id !== oid) return [];
    IPW.t[k] = Date.now();
    IPW.filas[k] = (Array.isArray(r) ? r : []).map(function(row){
      var n = nota(row.nota), d = T.limpio((n && typeof n === 'object') ? n : { tit:row.nombre });
      d._fila = row.id; d._creado = row.creado; return d;
    });
    return IPW.filas[k];
  });
}
/* 28/10/2026 · lo que está en su carpeta («iperc» / «pets»: la que abre su cartel QR), subido aquí, en «Documentos», en la
   app o en el cartel; y lo que se publicó desde aquí (su nota dice «Armado en OBRASST…») */
function ipwTraerCarpeta(k, fresco){
  var oid = (YO.obra || {}).id, T = IPETS_T[k];
  if(!fresco && IPW.sub[k] && IPW.obra === oid && Date.now() - (IPW.subT[k] || 0) < 15000) return Promise.resolve(IPW.sub[k]);
  return traer('sst_doc', '&hoja=eq.' + T.carpeta + '&select=id,hoja,nombre,url,nota,creado&order=creado.desc', 200).then(function(r){
    if((YO.obra || {}).id !== oid) return [];
    IPW.subT[k] = Date.now();
    IPW.sub[k] = (Array.isArray(r) ? r : []).filter(function(f){ return f && /^https?:\/\//i.test(String(f.url || '')); });
    return IPW.sub[k];
  });
}
function _ipwSubTipo(u){
  var p = String(u || '').split(/[?#]/)[0].toLowerCase();
  if(/\.pdf$/.test(p)) return ['pdf', 'PDF'];
  if(/\.(jpe?g|png|webp|gif|heic|heif)$/.test(p)) return ['img', 'JPG'];
  if(/\.docx?$/.test(p)) return ['word', 'DOC'];
  if(/\.xlsx?$/.test(p)) return ['excel', 'XLS'];
  if(!/\/storage\/v1\/object\//.test(String(u || ''))) return ['enlace', 'URL'];
  return ['', 'ARCH'];
}
function _ipwSubHTML(k){
  var T = IPETS_T[k], L = IPW.sub[k] || [];
  if(!L.length) return '';
  var h = '<div class="tarj ipw-sub" id="ipw-sub"><div class="tarj-cab"><div><h2><span aria-hidden="true">📎</span> En la carpeta «' + esc(T.carpetaN) + '» y en su cartel QR</h2>' +
    '<p class="sub">' + (k === 'ipl' ? 'Los IPERC' : 'Los PETS') + ' que subiste aquí, en «Documentos», en la app o en su cartel: ' + (L.length === 1 ? 'es el que abre' : 'son los que abre') + ' el cartel QR ' + (k === 'ipl' ? 'de la matriz IPERC' : 'de los procedimientos') + ', y tu gente los ve en la app.</p></div>' +
    '<div class="acciones"><button type="button" class="bt sec chico" id="ipw-sub-enl">🔗 Con un enlace</button></div></div><div class="tarj-cuerpo">';
  L.forEach(function(f){
    var ti = _ipwSubTipo(f.url), arm = /^Armado en OBRASST/i.test(String(f.nota || ''));
    h += '<div class="ipw-subf" data-ipw-sub="' + esc(String(f.id)) + '"><span class="ic ' + ti[0] + '">' + ti[1] + '</span>' +
      '<div><b>' + esc(f.nombre || T.uno) + '</b><small>' + (f.creado ? 'Subido el ' + esc(fechaLarga(f.creado)) : '') + (arm ? ' · armado aquí, en OBRASST' : '') + '</small></div>' +
      '<div class="acciones"><a class="bt sec chico" href="' + esc(f.url) + '" target="_blank" rel="noopener">Abrir</a>' +
      '<button type="button" class="bt sec chico" data-ipw-subq="' + esc(String(f.id)) + '" style="color:var(--mal)">Quitar</button></div></div>';
  });
  return h + '</div></div>';
}
/* subir uno a su carpeta: lo abre su cartel QR y sale en la app (no cuenta en el cupo: eso es para los que se arman aquí) */
function ipwSubir(k, f){
  var T = IPETS_T[k];
  var no = (typeof _dcNoVa === 'function') ? _dcNoVa(f) : '';
  if(no){ toast(no); return; }
  var nom = ((typeof _dcNombreDe === 'function') ? _dcNombreDe(f) : String(f.name || '')) || T.uno;
  toast('Subiendo «' + f.name + '»…');
  subirArchivoP('docs', f).then(function(url){
    return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:T.carpeta, nombre:nom.slice(0, 120), url:url, nota:null }).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject({ fila:'sin_fila' });
    }, function(e){ return Promise.reject({ fila:e }); });
  }).then(function(){
    toast('Subido: ya lo abre su cartel QR y está en la app, en «' + T.carpetaN + '»');
    if(VISTA.actual === T.vista && VISTA.recargar) VISTA.recargar(true);
  }, function(e){
    var enFila = !!(e && typeof e === 'object' && Object.prototype.hasOwnProperty.call(e, 'fila'));
    toast((typeof _dcMotivo === 'function') ? _dcMotivo(enFila ? e.fila : e, enFila ? 'fila' : 'archivo') : 'No se pudo subir. Revisa tu conexión.');
  });
}
/* o un enlace (Drive, OneDrive): no ocupa espacio y el cartel lo abre igual */
function ipwEnlace(k){
  var T = IPETS_T[k];
  var cuerpo = '<p class="ayuda" style="margin:0 0 14px">Para ' + (k === 'ipl' ? 'el IPERC' : 'el PETS') + ' que ya está en Drive o en OneDrive: ponlo en «cualquiera con el enlace puede ver», si no tu gente no lo va a poder abrir.</p>' +
    '<div class="campo"><label for="ipwe-nom">Cómo se llama</label><input id="ipwe-nom" maxlength="120" placeholder="' + esc(k === 'ipl' ? 'IPERC de línea base 2026' : 'PETS · Excavación manual de zanjas') + '"></div>' +
    '<div class="campo"><label for="ipwe-url">Enlace</label><input id="ipwe-url" type="url" placeholder="https://drive.google.com/file/d/…/view"></div>' +
    '<div class="msg" id="ipwe-msg"></div>';
  abrirHoja(k === 'ipl' ? 'Agregar un IPERC con su enlace' : 'Agregar un PETS con su enlace', 'Va a la carpeta «' + T.carpetaN + '» y a su cartel QR', cuerpo, '<button type="button" class="bt" id="ipwe-si">Guardar</button>', { sinFoco:true });
  /* sin quitarle el foco a un campo de esta hoja en el que ya se está escribiendo */
  setTimeout(function(){ try{ var a = document.activeElement; if(!(a && /^ipwe-/.test(a.id || ''))) $('ipwe-nom').focus(); }catch(_f){} }, 30);
  $('ipwe-si').onclick = function(){
    var b = this, m = $('ipwe-msg'), nom = String($('ipwe-nom').value || '').replace(/\s+/g, ' ').trim(), url = String($('ipwe-url').value || '').trim();
    if(!nom){ m.className = 'msg mal'; m.textContent = 'Ponle un nombre.'; $('ipwe-nom').focus(); return; }
    if(!/^https?:\/\/\S+\.\S+/i.test(url)){ m.className = 'msg mal'; m.textContent = 'El enlace tiene que empezar con https://'; $('ipwe-url').focus(); return; }
    b.disabled = true; m.className = 'msg gris'; m.textContent = 'Guardando…';
    sbPostP('sst_doc', { empresa:YO.obra.id, hoja:T.carpeta, nombre:nom.slice(0, 120), url:url, nota:null }).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject('sin_fila');
      cerrarHoja(); toast('Guardado: ya lo abre su cartel QR y está en la app');
      if(VISTA.actual === T.vista && VISTA.recargar) VISTA.recargar(true);
    }).catch(function(e){ b.disabled = false; m.className = 'msg mal'; m.textContent = (typeof _dcMotivo === 'function') ? _dcMotivo(e, 'fila').replace('El archivo subió, pero no', 'No') : 'No se pudo guardar. Revisa tu conexión.'; });
  };
}
function ipwCupo(){
  if(YO && YO.central) return IPETS_CUPO.gestion;
  var A = (typeof planWebActual === 'function') ? planWebActual() : null;
  return ipetsCupoDe((A && A.id) || (YO.obra || {}).plan || 'lite');
}
function _ipwMsg(t, cl){ var m = $('ipw-msg'); if(m){ m.className = 'msg ' + (cl || ''); m.textContent = t || ''; } else if(t) toast(t); }
/* escribir y, si el servidor dice que no, leer por qué (el cupo lo cuida también él) */
function _ipwEscribir(met, ruta, obj){
  return sbFetch(SB.url + '/rest/v1/' + ruta, { method:met, body:JSON.stringify(obj), extra:{ 'Prefer':'return=representation' } }).then(function(r){
    if(r.ok) return r.json().catch(function(){ return []; });
    return r.json().catch(function(){ return {}; }).then(function(j){ return Promise.reject({ status:r.status, detalle:String((j && (j.message || j.hint || j.code)) || '') }); });
  });
}
function _ipwMotivo(e){
  var s = String((e && typeof e === 'object') ? (e.detalle || '') : (e || ''));
  if(/cupo_iperc|cupo_pets/i.test(s)) return 'Tu plan ya no tiene cupo para otro en esta obra.';
  var st = (e && typeof e === 'object') ? e.status : e;
  if(st === 401 || st === 403) return 'Esta cuenta no puede cambiar los documentos de esta obra.';
  if(e === 'muy-grande') return 'El PDF pesa más de 25 MB: no sube.';
  return 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.';
}

/* ══ LA LISTA ══ */
function vistaIpercLB(caja){ _ipwVista('ipl', caja); }
function vistaPets(caja){ _ipwVista('pets', caja); }
function _ipwVista(k, caja){
  _ipwCss();
  /* lo que se estaba editando y no alcanzó a guardarse, se guarda igual (en segundo plano) */
  if(IPW.ed && IPW.ed.sucio) _ipwGuardar(IPW.ed, true);
  IPW.k = k; IPW.caja = caja; IPW.ed = null;
  var T = IPETS_T[k];
  function pinta(fresco){
    var n = ++IPW.n;
    cargando(caja);
    Promise.all([ipwTraer(k, fresco), ipwCtx(false).catch(function(){ return null; }),
                 ipwTraerCarpeta(k, fresco).catch(function(){ IPW.sub[k] = IPW.sub[k] || []; return null; })]).then(function(){
      if(n !== IPW.n || VISTA.actual !== T.vista) return;
      _ipwLista();
    }, function(cod){ if(n === IPW.n && VISTA.actual === T.vista) fallo(caja, cod); });
  }
  /* lo que llega de otro lado (la app, otra pestaña) repinta la lista, nunca el editor abierto */
  VISTA.recargar = function(){ if(!IPW.ed) pinta(true); };
  pinta(false);
}
function _ipwNiveles(d, cual){
  var R = iplResumen(d), N = iplNiveles(d), C = R[cual];
  var tot = R.n || 1, h = '<div class="ipw-barra" role="img" aria-label="' + esc(N.map(function(n){ return (C[n.k] || 0) + ' ' + n.n; }).join(', ')) + '">';
  N.slice().reverse().forEach(function(n){ var v = C[n.k] || 0; if(v) h += '<i style="width:' + (v * 100 / tot).toFixed(1) + '%;background:' + n.t + '"></i>'; });
  var sin = cual === 'ini' ? R.sinIni : R.sinRes; if(sin) h += '<i style="width:' + (sin * 100 / tot).toFixed(1) + '%;background:var(--raya2)"></i>';
  return h + '</div>';
}
function _ipwTarj(k, d){
  var T = IPETS_T[k], est = ipetsEstado(d, T.roles), E = IPETS_EST[est], faltan = ipetsFaltan(d, T.roles), id = esc(String(d._fila));
  var sub = [d.cod, 'versión ' + d.ver, d.fecha ? 'elaborado el ' + ipDma(d.fecha) : ''];
  if(k === 'ipl'){ var R = iplResumen(d); sub.push(R.n + (R.n === 1 ? ' peligro' : ' peligros') + ' en ' + R.procs + (R.procs === 1 ? ' proceso' : ' procesos')); sub.push(d.formato === 'completo' ? 'documento completo' : 'matriz de obra'); }
  else { sub.push(d.pasos.length + (d.pasos.length === 1 ? ' paso' : ' pasos')); if(d.area) sub.push(d.area); if(d.formato === 'anexo10') sub.push('formato del Anexo 10'); }
  var h = '<div class="tarj ipw-t" data-ipw="' + id + '"><div class="tarj-cab"><div><h2><span aria-hidden="true">' + T.ic + '</span> ' + esc(d.tit) + ' <span class="pill ' + E.cl + '">' + esc(E.n) + (est === 'pub' ? ' · v' + esc(d.ver) : '') + '</span></h2>' +
    '<p class="sub">' + esc(sub.filter(Boolean).join(' · ')) + '</p></div>' +
    '<div class="acciones"><button type="button" class="bt chico" data-ipw-abrir="' + id + '">Abrir</button>' +
    '<button type="button" class="bt sec chico" data-ipw-pdf="' + id + '">PDF</button>' +
    (k === 'ipl' ? '<button type="button" class="bt sec chico" data-ipw-xls="' + id + '">Excel</button>' : '') +
    '<button type="button" class="bt sec chico" data-ipw-dup="' + id + '">Duplicar</button>' +
    '<button type="button" class="bt sec chico" data-ipw-q="' + id + '" style="color:var(--mal)">Quitar</button></div></div><div class="tarj-cuerpo ipw-res">';
  if(k === 'ipl' && iplResumen(d).n){
    h += '<div class="ipw-barras"><span>Al inicio</span>' + _ipwNiveles(d, 'ini') + '<span>Con los controles</span>' + _ipwNiveles(d, 'res') + '</div>' +
      '<div class="ipw-ley">' + iplNiveles(d).slice().reverse().map(function(n){ var R2 = iplResumen(d); return '<span><i style="background:' + n.t + '"></i>' + esc(n.n) + ' ' + (R2.ini[n.k] || 0) + ' → ' + (R2.res[n.k] || 0) + '</span>'; }).join('') + '</div>';
  }
  h += '<div class="ipw-linea"><small>Firmas:</small>' + T.roles.map(function(r){ var ok = ipFirmada((d.firmas || {})[r[0]]); return '<span class="' + (ok ? 'ipw-ok' : 'ipw-falta') + '">' + (ok ? '✓ ' : '✗ ') + esc(r[1]) + '</span>'; }).join('') + '</div>';
  if(d.pub) h += '<div class="ipw-linea"><small>En «Documentos ▸ ' + esc(T.carpetaN) + '»:</small> la versión ' + esc(d.pub.ver) + (d.pub.al ? ', desde el ' + esc(ipDma(String(d.pub.al).slice(0, 10))) : '') + (d.pub.ver !== d.ver ? ' <small>(la ' + esc(d.ver) + ' todavía no)</small>' : '') + '</div>';
  else if(est === 'apr') h += '<div class="ipw-linea"><span class="ipw-ok">Aprobado.</span> <small>Publícalo en «Documentos» desde su pestaña «Versiones».</small></div>';
  else if(faltan.length && est === 'firmas') h += '<div class="ipw-linea"><small>Faltan ' + esc(faltan.map(function(r){ return r[1].toLowerCase(); }).join(', ')) + '.</small></div>';
  return h + '</div></div>';
}
function _ipwLista(){
  var k = IPW.k, T = IPETS_T[k], caja = IPW.caja; if(!caja || !document.body.contains(caja)) return;
  var L = IPW.filas[k] || [], cupo = ipwCupo(), lleno = L.length >= cupo, A = (typeof planWebActual === 'function') ? planWebActual() : { n:'' };
  var ac = $('acciones');
  /* 28/10/2026 · «⬆ Agregar IPERC de línea base» / «⬆ Agregar PETS»: el archivo que ya tienen, a su carpeta y a su cartel QR */
  if(ac) ac.innerHTML = '<span class="ipw-cupo"><b>' + L.length + ' / ' + cupo + '</b>' + esc(T.cupoTx) + ' por obra en tu plan' + (A && A.n ? ' ' + esc(A.n) : '') + '</span>' +
    '<label class="bt sec" for="ipw-sube" id="ipw-sube-b">' + (k === 'ipl' ? '⬆ Agregar IPERC de línea base' : '⬆ Agregar PETS') + '</label>' +
    '<input type="file" class="pi-oculto" id="ipw-sube" accept=".pdf,image/*,.doc,.docx,.xls,.xlsx">' +
    '<button type="button" class="bt" id="ipw-nuevo"' + (lleno ? ' disabled' : '') + '>' + esc(T.nuevo) + '</button>';
  var subidos = IPW.sub[k] || [];
  var h = _ipwSubHTML(k);
  if(lleno && L.length){
    h += '<p class="ayuda" style="margin:0 0 14px">' + (L.length > cupo ? '<b>Tienes más que los de tu plan.</b> Siguen a la vista y se pueden abrir, pero no se puede agregar otro hasta quitar los que sobran o cambiar de plan.'
      : (cupo < IPETS_CUPO.gestion ? 'Ya usas los ' + esc(T.cupoTx) + ' de tu plan en esta obra. Con SSOMA son 4 por obra, y con Gestión SST, 8.' : 'Ya usas los ' + esc(T.cupoTx) + ' de tu plan en esta obra.')) + '</p>';
  }
  if(!L.length){
    h += k === 'ipl'
      ? '<div class="tarj"><div class="vacio"><b>' + (subidos.length ? 'Todavía no armaste un IPERC de línea base en OBRASST' : 'Todavía no hay un IPERC de línea base en esta obra') + '</b>La matriz de peligros y riesgos de la obra, por proceso, actividad y tarea: cada peligro con su evaluación, sus medidas de control y el riesgo que queda. ' +
        'Sale en PDF y en Excel, con el logo de tu empresa y sus firmas, en el modelo que elijas: la matriz de obra en una sola tabla A3, o el documento completo con su portada y su índice. Aprobado, lo publicas en «Documentos»: tu gente lo lee y firma en su celular, y va al cartel QR de la matriz IPERC.' +
        '<div class="acciones" style="justify-content:center; margin-top:14px"><button type="button" class="bt" id="ipw-nuevo2"' + (cupo ? '' : ' disabled') + '>' + esc(T.nuevo) + '</button></div></div></div>'
      : '<div class="tarj"><div class="vacio"><b>' + (subidos.length ? 'Todavía no armaste un PETS en OBRASST' : 'Todavía no hay PETS en esta obra') + '</b>El procedimiento escrito de cada tarea, paso a paso: el personal, el EPP, los equipos, el procedimiento y las restricciones, con sus firmas. ' +
        'Sale en PDF con el logo de tu empresa y su índice. Aprobado, lo publicas en «Documentos»: tu gente lo lee y firma en su celular, y va al cartel QR de los procedimientos.' +
        '<div class="acciones" style="justify-content:center; margin-top:14px"><button type="button" class="bt" id="ipw-nuevo2"' + (cupo ? '' : ' disabled') + '>' + esc(T.nuevo) + '</button></div></div></div>';
  }
  L.forEach(function(d){ h += _ipwTarj(k, d); });
  h += '<p class="ayuda">OBRASST ordena y le da el formato; el contenido lo define y lo aprueba tu equipo.' + (k === 'ipl' ? ' El IPERC se actualiza una vez al año como mínimo, y antes si cambian las condiciones de trabajo.' : '') + '</p>' +
    '<div class="msg" id="ipw-msg" role="status"></div>';
  caja.innerHTML = h;
  [$('ipw-nuevo'), $('ipw-nuevo2')].forEach(function(b){ if(b) b.onclick = ipwNuevo; });
  var sube = $('ipw-sube');
  if(sube) sube.onchange = function(){ var f = this.files && this.files[0]; this.value = ''; if(f) ipwSubir(k, f); };
  if($('ipw-sub-enl')) $('ipw-sub-enl').onclick = function(){ ipwEnlace(k); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ipw-subq]'), function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-ipw-subq'), f = (IPW.sub[k] || []).filter(function(x){ return String(x.id) === id; })[0];
      if(f) quitarDocP({ id:f.id, hoja:f.hoja, nombre:f.nombre });
    };
  });
  var on = function(sel, fn){ Array.prototype.forEach.call(caja.querySelectorAll('[' + sel + ']'), function(b){ b.onclick = function(){ fn(b.getAttribute(sel)); }; }); };
  on('data-ipw-abrir', function(id){ ipwAbrir(id); });
  on('data-ipw-pdf', function(id){ ipwBajar(id, 'pdf'); });
  on('data-ipw-xls', function(id){ ipwBajar(id, 'xls'); });
  on('data-ipw-dup', function(id){ ipwDuplicar(id); });
  on('data-ipw-q', function(id){ ipwQuitar(id); });
}
function _ipwDoc(id){ var r = null; (IPW.filas[IPW.k] || []).forEach(function(d){ if(String(d._fila) === String(id)) r = d; }); return r; }
function _ipwCodigoLibre(k){
  var L = IPW.filas[k] || [], pre = k === 'ipl' ? 'IPERC-LB-' : 'PETS-', usados = {};
  L.forEach(function(d){ usados[String(d.cod || '').toUpperCase()] = 1; });
  for(var i = 1; i < 200; i++){ var c = pre + (i < 10 ? '0' + i : i); if(!usados[c]) return i; }
  return L.length + 1;
}
/* uno nuevo: se pide el nombre, se guarda y se abre */
function ipwNuevo(){
  var k = IPW.k, T = IPETS_T[k], L = IPW.filas[k] || [];
  if(L.length >= ipwCupo()){ toast('Ya usas los ' + T.cupoTx + ' de tu plan en esta obra'); return; }
  var ipl = k === 'ipl';
  preguntar(ipl ? 'Un IPERC de línea base nuevo' : 'Un PETS nuevo',
    ipl ? 'Su nombre sale en la portada y en cada hoja. Si vas a tener más de uno en la obra, ponle el área o el proceso.' : 'El nombre de la tarea: sale en la portada, en cada hoja y en el cartel QR de los procedimientos.',
    { etiqueta:ipl ? 'Nombre del IPERC' : 'Nombre de la tarea', placeholder:ipl ? 'IPERC de línea base · Estructuras' : 'Excavación manual de zanjas', valor:ipl && !L.length ? 'IPERC de línea base' : '', maximo:140, minimo:3, corto:'Escribe un nombre de 3 letras o más.' },
    { si:ipl ? 'Crear el IPERC' : 'Crear el PETS' }).then(function(tit){
    if(!tit) return;
    ipwCtx(false).then(function(C){
      var c = Object.assign({}, C, { n:_ipwCodigoLibre(k) });
      var d = ipl ? iplNuevo(c, ipTx(tit, 140)) : petsNuevo(c, ipTx(tit, 140));
      return _ipwCrear(k, d);
    }).then(function(d){ if(d){ toast(ipl ? 'IPERC creado: empieza por su matriz' : 'PETS creado: empieza por sus datos'); ipwAbrir(d._fila, ipl ? 'matriz' : 'datos'); } })
      .catch(function(e){ _ipwMsg(_ipwMotivo(e), 'mal'); });
  });
}
function _ipwCrear(k, d){
  var T = IPETS_T[k];
  d = T.limpio(d); d.al = new Date().toISOString(); d.por = String((TOK && TOK.correo) || '').slice(0, 80);
  return _ipwEscribir('POST', 'sst_doc', { empresa:YO.obra.id, hoja:T.hoja, nombre:d.tit, url:null, nota:JSON.stringify(d) }).then(function(rows){
    var row = Array.isArray(rows) ? rows[0] : null; if(!row || !row.id) return Promise.reject({ status:403 });
    d._fila = row.id; d._creado = row.creado;
    IPW.filas[k] = (IPW.filas[k] || []).concat([d]);
    return d;
  });
}
function ipwDuplicar(id){
  var k = IPW.k, T = IPETS_T[k], d0 = _ipwDoc(id); if(!d0) return;
  if((IPW.filas[k] || []).length >= ipwCupo()){ toast('Ya usas los ' + T.cupoTx + ' de tu plan en esta obra'); return; }
  var x = JSON.parse(JSON.stringify(d0)); delete x._fila; delete x._creado;
  x.id = ipId(); x.tit = ipTx(x.tit + ' (copia)', 140); x.ver = '01'; x.fecha = hoyISO(); x.pub = null;
  x.cod = (k === 'ipl' ? 'IPERC-LB-' : 'PETS-') + (function(n){ return n < 10 ? '0' + n : String(n); })(_ipwCodigoLibre(k));
  T.roles.forEach(function(r){ var f = x.firmas[r[0]] || {}; x.firmas[r[0]] = { n:f.n, c:f.c }; });
  x.hist = [{ ver:'01', cambio:'Elaboración del documento (copia de ' + (d0.cod || d0.tit) + ')' }];
  _ipwCrear(k, x).then(function(d){ toast('Copia creada: cámbiale lo que haga falta'); ipwAbrir(d._fila); }, function(e){ _ipwMsg(_ipwMotivo(e), 'mal'); });
}
function ipwQuitar(id){
  var k = IPW.k, T = IPETS_T[k], d = _ipwDoc(id); if(!d) return;
  dialogo({ titulo:'¿Quitar «' + d.tit + '»?', texto:'Se borra de esta lista para todo el equipo.' + (d.pub ? ' El PDF que publicaste se queda en «Documentos ▸ ' + T.carpetaN + '» (lo quitas desde ahí si ya no va).' : '') + ' Si solo quieres cambiarlo, ábrelo.',
    si:'Sí, quitarlo', no:'Cancelar', mal:true }).then(function(ok){
    if(ok !== true) return;
    sbDelP('sst_doc?id=eq.' + _enc(d._fila)).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject(403);
      try{ localStorage.removeItem('sstp_ipets_bor_' + d._fila); }catch(e){}
      toast('Quitado'); return ipwTraer(k, true).then(_ipwLista);
    }).catch(function(e){ _ipwMsg(_ipwMotivo(e), 'mal'); });
  });
}
/* el PDF o el Excel de uno de la lista (o del que se está editando) */
function ipwBajar(id, que, dEd){
  var k = IPW.k, T = IPETS_T[k], d = dEd || _ipwDoc(id); if(!d) return;
  var listo = (typeof cargarEvPDF === 'function') ? cargarEvPDF() : Promise.resolve(true);
  toast(que === 'xls' ? 'Armando el Excel…' : 'Armando el PDF…');
  Promise.all([listo, ipwCtx(false)]).then(function(r){
    var C = r[1], nom = nombreArchivo((d.cod ? d.cod + ' ' : '') + d.tit + ' v' + d.ver);
    if(que === 'xls'){ bajarBlob(iplXls(d, C), nom + '.xlsx'); return; }
    bajarBlob(T.pdf(d, C).output('blob'), nom + '.pdf');
  }).catch(function(){ toast('No se pudo armar el archivo. Recarga la página e inténtalo otra vez.'); });
}

/* ══ EL EDITOR: abrir, pestañas, guardar solo, firmado = no se cambia ══ */
function _ipwBorKey(fila){ return 'sstp_ipets_bor_' + fila; }
function _ipwBorLeer(fila){ try{ var v = JSON.parse(localStorage.getItem(_ipwBorKey(fila)) || 'null'); return (v && v.d) ? v : null; }catch(e){ return null; } }
function _ipwBorPoner(ed){ try{ localStorage.setItem(_ipwBorKey(ed.fila), JSON.stringify({ t:Date.now(), base:ed.al || '', d:ed.d })); }catch(e){} }
function _ipwBorQuitar(fila){ try{ localStorage.removeItem(_ipwBorKey(fila)); }catch(e){} }
function _ipwHora(t){ var x = new Date(t); return isNaN(x) ? '' : dos(x.getHours()) + ':' + dos(x.getMinutes()); }
function ipwAbrir(id, tab){
  var k = IPW.k, T = IPETS_T[k];
  if(IPW.ed && IPW.ed.sucio) _ipwGuardar(IPW.ed);
  traerUna('sst_doc', id, 'id,nombre,nota,creado').then(function(row){
    if(!row){ toast('Ya no está: alguien lo quitó.'); return ipwTraer(k, true).then(_ipwLista); }
    if(VISTA.actual !== T.vista) return;
    var n = nota(row.nota), d = T.limpio((n && typeof n === 'object') ? n : { tit:row.nombre });
    d._fila = row.id; d._creado = row.creado;
    var ed = IPW.ed = { k:k, fila:row.id, d:d, al:d.al || '', sucio:false, tab:tab || 'datos', timer:null, guardando:null, conflicto:false, ultimo:0 };
    _ipwEditor();
    /* lo que quedó sin guardar en este navegador (se cortó la conexión, se cerró la pestaña) */
    var bor = _ipwBorLeer(row.id);
    if(bor && bor.t > (Date.parse(d.al || '') || 0)){
      dialogo({ titulo:'Hay cambios sin guardar de las ' + _ipwHora(bor.t), texto:(bor.base === ed.al ? 'Los hiciste en esta computadora y no llegaron a guardarse.' : 'Los hiciste en esta computadora, pero después alguien guardó otra versión: si los recuperas, reemplazan a esa.') + ' ¿Los recuperas?',
        si:'Recuperarlos', no:'Descartarlos' }).then(function(si){
        if(IPW.ed !== ed) return;
        if(si === true){ ed.d = T.limpio(bor.d); ed.d._fila = row.id; ed.sucio = true; _ipwEditor(); _ipwGuardar(ed); }
        else _ipwBorQuitar(row.id);
      });
    }
  }, function(e){ toast('No se pudo abrir: ' + porQueFallo(e)); });
}
function _ipwBloqueo(ed){ var est = ipetsEstado(ed.d, IPETS_T[ed.k].roles); return est === 'bor' ? '' : (est === 'firmas' ? 'firmas' : 'apr'); }
function _ipwTabN(ed, t){
  var d = ed.d, T = IPETS_T[ed.k];
  if(t === 'matriz') return ' <span class="n">' + d.filas.filter(function(f){ return !iplFilaVacia(f); }).length + '</span>';
  if(t === 'proc') return ' <span class="n">' + d.pasos.length + '</span>';
  if(t === 'firmas') return ' <span class="n">' + T.roles.filter(function(r){ return ipFirmada(d.firmas[r[0]]); }).length + '/' + T.roles.length + '</span>';
  return '';
}
function _ipwEditor(){
  var ed = IPW.ed, T = IPETS_T[ed.k], caja = IPW.caja, d = ed.d; if(!caja || !document.body.contains(caja)) return;
  var est = ipetsEstado(d, T.roles), E = IPETS_EST[est], bloq = _ipwBloqueo(ed);
  var ac = $('acciones');
  if(ac) ac.innerHTML = '<button type="button" class="bt sec" id="ipw-ver">Vista previa (PDF)</button>' + (ed.k === 'ipl' ? '<button type="button" class="bt sec" id="ipw-xls">Excel</button>' : '') +
    '<button type="button" class="bt" id="ipw-guardar"' + (bloq ? ' disabled' : '') + '>Guardar</button>';
  var h = '<div class="ipw-barra-ed"><button type="button" class="bt sec chico" id="ipw-volver">← ' + esc(T.todos) + '</button>' +
    '<div class="t"><b id="ipw-tit">' + esc(d.tit) + '</b><span class="pill ' + E.cl + '">' + esc(E.n) + '</span><span class="ipw-gu" id="ipw-gu" role="status"></span></div></div>';
  if(bloq === 'firmas'){
    h += '<div class="aviso ojo"><b>En firmas: el contenido ya no se cambia.</b> Lo que firmaron es lo que está aquí. Para corregir algo, se quitan las firmas dadas y se vuelven a dar.' +
      '<div class="acciones"><button type="button" class="bt sec chico" id="ipw-desfirmar">Quitar las firmas y editar</button></div></div>';
  }else if(bloq === 'apr'){
    var apr = d.firmas.apr || {};
    h += '<div class="aviso ok"><b>Versión ' + esc(d.ver) + ' aprobada' + (apr.f ? ' el ' + esc(ipDma(apr.f)) : '') + (apr.n ? ' por ' + esc(apr.n) : '') + '.</b> ' +
      (est === 'apr' ? 'Publícala en «Documentos» desde «Versiones». ' : '') + 'Para cambiarla, abre la versión ' + esc(ipVerSig(d.ver)) + ': las firmas se vuelven a dar.' +
      '<div class="acciones">' + (est === 'apr' ? '<button type="button" class="bt chico" id="ipw-pub2">Publicar en «Documentos»</button>' : '') +
      '<button type="button" class="bt sec chico" id="ipw-nver">Abrir la versión ' + esc(ipVerSig(d.ver)) + '</button></div></div>';
  }
  h += '<div class="tabs ipw-tabs" role="tablist">' + T.tabs.map(function(t){ return '<button type="button" role="tab" aria-selected="' + (ed.tab === t[0]) + '" class="tab' + (ed.tab === t[0] ? ' on' : '') + '" data-ipw-tab="' + t[0] + '">' + esc(t[1]) + _ipwTabN(ed, t[0]) + '</button>'; }).join('') + '</div>' +
    '<div id="ipw-cuerpo"></div><div class="msg" id="ipw-msg" role="status"></div>';
  caja.innerHTML = h;
  $('ipw-volver').onclick = ipwVolver;
  $('ipw-ver').onclick = function(){ ipwBajar(null, 'pdf', T.limpio(ed.d)); };
  if($('ipw-xls')) $('ipw-xls').onclick = function(){ ipwBajar(null, 'xls', T.limpio(ed.d)); };
  $('ipw-guardar').onclick = function(){ _ipwGuardar(ed, true).then(function(ok){ if(ok) toast('Guardado'); }); };
  if($('ipw-desfirmar')) $('ipw-desfirmar').onclick = ipwDesfirmar;
  if($('ipw-nver')) $('ipw-nver').onclick = ipwNuevaVersion;
  if($('ipw-pub2')) $('ipw-pub2').onclick = ipwPublicar;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ipw-tab]'), function(b){ b.onclick = function(){ ed.tab = b.getAttribute('data-ipw-tab'); _ipwEditor(); }; });
  _ipwTab();
  _ipwGu();
}
function ipwVolver(){
  var ed = IPW.ed;
  var ir = function(){ if(IPW.ed === ed) IPW.ed = null; _ipwVista(IPW.k, IPW.caja); };
  if(ed && ed.sucio) _ipwGuardar(ed, true).then(ir); else ir();
}
/* la pestaña abierta: se pinta y se enchufa; todo lo que se escribe va a ed.d por su «data-ipw-c» (la ruta) */
function _ipwTab(){
  var ed = IPW.ed, c = $('ipw-cuerpo'); if(!ed || !c) return;
  var fn = ({ ipl:{ datos:_iplDatos, matriz:_iplMatriz, firmas:_ipwFirmas, versiones:_ipwVersiones },
              pets:{ datos:_petsDatos, recursos:_petsRecursos, proc:_petsProc, firmas:_ipwFirmas, versiones:_ipwVersiones } })[ed.k][ed.tab] || _ipwFirmas;
  c.innerHTML = fn(ed);
  var bloq = !!_ipwBloqueo(ed);
  if(bloq && ed.tab !== 'firmas' && ed.tab !== 'versiones') Array.prototype.forEach.call(c.querySelectorAll('input, textarea, select'), function(x){ x.disabled = true; });
  if(bloq && ed.tab !== 'firmas' && ed.tab !== 'versiones') Array.prototype.forEach.call(c.querySelectorAll('[data-ipw-edita]'), function(x){ x.hidden = true; });
  c.oninput = c.onchange = function(ev){ var x = ev.target; if(!x || !x.getAttribute) return; var p = x.getAttribute('data-ipw-c'); if(!p || (bloq && !/^firmas\./.test(p))) return; _ipwPonValor(ed, p, x); };
  var post = ({ ipl:{ datos:_iplDatosEnchufar, matriz:_iplMatrizEnchufar, firmas:_ipwFirmasEnchufar, versiones:_ipwVersionesEnchufar },
                pets:{ datos:_petsDatosEnchufar, recursos:_petsRecursosEnchufar, proc:_petsProcEnchufar, firmas:_ipwFirmasEnchufar, versiones:_ipwVersionesEnchufar } })[ed.k][ed.tab];
  if(post) post(ed, c, bloq);
}
function _ipwRuta(o, p){ var a = String(p).split('.'), x = o; for(var i = 0; i < a.length - 1; i++){ if(x == null) return null; x = x[/^\d+$/.test(a[i]) ? +a[i] : a[i]]; } return x == null ? null : { o:x, k:/^\d+$/.test(a[a.length - 1]) ? +a[a.length - 1] : a[a.length - 1] }; }
function _ipwPonValor(ed, p, x){
  var r = _ipwRuta(ed.d, p); if(!r) return;
  var tipo = x.getAttribute('data-ipw-t') || '', v;
  if(x.type === 'checkbox' && tipo === 'lista'){
    var L = Array.isArray(r.o[r.k]) ? r.o[r.k].slice() : [], val = x.value, i = L.indexOf(val);
    if(x.checked && i < 0) L.push(val); if(!x.checked && i > -1) L.splice(i, 1);
    v = L;
  }else if(tipo === 'lineas') v = String(x.value || '').split('\n').map(function(s){ return s.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
  else if(tipo === 'num'){ v = parseInt(x.value, 10); v = (v > 0) ? v : 0; }
  else v = x.value;
  r.o[r.k] = v;
  if(p === 'tit'){ var t = $('ipw-tit'); if(t) t.textContent = ipTx(v, 140) || '—'; }
  _ipwCambio(ed);
}
function _ipwCambio(ed){
  ed.sucio = true;
  clearTimeout(ed.timerB); ed.timerB = setTimeout(function(){ _ipwBorPoner(ed); }, 500);
  _ipwGu();
  _ipwProgramar(ed);
}
function _ipwProgramar(ed){ clearTimeout(ed.timer); ed.timer = setTimeout(function(){ _ipwGuardar(ed); }, 2500); }
function _ipwGu(t, cl){
  var g = $('ipw-gu'), ed = IPW.ed; if(!g || !ed) return;
  if(t == null) t = ed.conflicto ? 'Sin guardar: alguien más lo cambió' : (ed.sucio ? 'Cambios sin guardar…' : (ed.ultimo ? 'Guardado a las ' + _ipwHora(ed.ultimo) : ''));
  g.textContent = t; g.className = 'ipw-gu' + (cl ? ' ' + cl : (ed.conflicto ? ' mal' : (ed.sucio ? ' ojo' : '')));
}
function _ipwCacheDoc(k, fila, d){
  var L = IPW.filas[k] || [], x = JSON.parse(JSON.stringify(d)); x._fila = fila;
  IPW.filas[k] = L.map(function(y){ return String(y._fila) === String(fila) ? Object.assign(x, { _creado:y._creado }) : y; });
}
/* guardar: sobre lo que el servidor tiene AHORA (si otro guardó después de abrir, se avisa y no se pisa) */
function _ipwGuardar(ed, manual){
  ed = ed || IPW.ed; if(!ed) return Promise.resolve(false);
  if(ed.guardando){ ed.otraVez = true; return ed.guardando; }
  if(!ed.sucio && !manual) return Promise.resolve(true);
  if(ed.conflicto && !ed.forzar) return Promise.resolve(false);
  clearTimeout(ed.timer);
  var T = IPETS_T[ed.k], d = T.limpio(ed.d);
  d.al = new Date().toISOString(); d.por = String((TOK && TOK.correo) || '').slice(0, 80);
  ed.sucio = false; if(IPW.ed === ed) _ipwGu('Guardando…');
  ed.guardando = sbGet('sst_doc?id=eq.' + _enc(ed.fila) + '&select=nota').then(function(rows){
    var r = Array.isArray(rows) ? rows[0] : null; if(!r) return Promise.reject({ status:404 });
    var n = nota(r.nota) || {};
    if(String(n.al || '') !== String(ed.al || '') && !ed.forzar) return Promise.reject({ conflicto:true, por:String(n.por || ''), al:String(n.al || '') });
    return _ipwEscribir('PATCH', 'sst_doc?id=eq.' + _enc(ed.fila), { nombre:d.tit, nota:JSON.stringify(d) });
  }).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({ status:403 });
    ed.al = d.al; ed.forzar = false; ed.conflicto = false; ed.ultimo = Date.now();
    if(!ed.sucio) _ipwBorQuitar(ed.fila);
    _ipwCacheDoc(ed.k, ed.fila, d);
    if(IPW.ed === ed) _ipwGu();
    return true;
  }).catch(function(e){
    ed.sucio = true;
    if(e && e.conflicto){ ed.conflicto = true; if(IPW.ed === ed){ _ipwGu(); _ipwConflicto(ed, e); } return false; }
    if(IPW.ed === ed) _ipwGu(e && e.status === 404 ? 'Ya no está: alguien lo quitó' : 'Sin guardar: ' + _ipwMotivo(e).toLowerCase(), 'mal');
    else _ipwBorPoner(ed);
    return false;
  }).then(function(v){
    ed.guardando = null;
    if(ed.otraVez){ ed.otraVez = false; if(ed.sucio && !ed.conflicto) _ipwProgramar(ed); }
    return v;
  });
  return ed.guardando;
}
function _ipwConflicto(ed, e){
  var m = $('ipw-msg'); if(!m) return;
  m.className = 'msg';
  m.innerHTML = '<div class="aviso mal"><b>' + esc(e.por || 'Alguien más') + ' guardó este documento' + (e.al ? ' a las ' + esc(_ipwHora(e.al)) : '') + ' mientras lo editabas.</b> Lo tuyo sigue aquí, sin guardar.' +
    '<div class="acciones"><button type="button" class="bt sec chico" id="ipw-c-ver">Ver lo suyo (se pierde lo tuyo)</button><button type="button" class="bt chico" id="ipw-c-mio">Guardar lo mío encima</button></div></div>';
  $('ipw-c-ver').onclick = function(){ _ipwBorQuitar(ed.fila); ed.sucio = false; ed.conflicto = false; ipwAbrir(ed.fila, ed.tab); };
  $('ipw-c-mio').onclick = function(){ ed.forzar = true; _ipwGuardar(ed, true).then(function(ok){ if(ok){ m.innerHTML = ''; toast('Guardado'); } }); };
}
window.addEventListener('beforeunload', function(ev){ var ed = IPW.ed; if(ed && ed.sucio){ _ipwBorPoner(ed); ev.preventDefault(); ev.returnValue = ''; } });
/* firmado: para cambiarlo se quitan las firmas (antes de aprobar) o se abre la versión siguiente (después) */
function ipwDesfirmar(){
  var ed = IPW.ed, T = IPETS_T[ed.k];
  dialogo({ titulo:'¿Quitar las firmas para editar?', texto:'Se quitan las firmas que ya se dieron (quedan los nombres y los cargos) y el documento vuelve a borrador. Cuando esté listo, se vuelven a dar.', si:'Sí, quitarlas', no:'Cancelar', mal:true })
    .then(function(ok){
      if(ok !== true) return;
      T.roles.forEach(function(r){ var f = ed.d.firmas[r[0]] || {}; ed.d.firmas[r[0]] = { n:f.n || '', c:f.c || '' }; });
      ed.sucio = true;
      _ipwGuardar(ed, true).then(function(v){ if(v) toast('Firmas quitadas: ya se puede editar'); _ipwEditor(); });
    });
}
function ipwNuevaVersion(){
  var ed = IPW.ed, T = IPETS_T[ed.k], sig = ipVerSig(ed.d.ver);
  preguntar('Abrir la versión ' + sig, 'Qué cambia en esta versión: va al control de cambios del documento. Las firmas se vuelven a dar.',
    { etiqueta:'Qué cambia', placeholder:ed.k === 'ipl' ? 'Se agregó el proceso de acabados' : 'Se agregó el paso de la verificación del entibado', minimo:6, maximo:300, corto:'Escribe qué cambia (6 letras o más).' },
    { si:'Abrir la versión ' + sig }).then(function(t){
    if(!t) return;
    var x = ipetsNuevaVersion(ed.d, T.roles, t, hoyISO()); x._fila = ed.fila;
    ed.d = T.limpio(x); ed.d._fila = ed.fila; ed.sucio = true;
    _ipwGuardar(ed, true).then(function(v){ if(v) toast('Versión ' + sig + ' abierta: ya se puede editar'); _ipwEditor(); });
  });
}
/* ── piezas de formulario ── */
function _ipwCampo(id, et, v, op){
  op = op || {};
  var at = ' id="' + id + '"' + (op.c ? ' data-ipw-c="' + esc(op.c) + '"' : '') + (op.t ? ' data-ipw-t="' + op.t + '"' : '') + (op.max ? ' maxlength="' + op.max + '"' : '') + (op.ph ? ' placeholder="' + esc(op.ph) + '"' : '');
  var ctl = op.area ? '<textarea' + at + ' rows="' + (op.filas || 3) + '">' + esc(v == null ? '' : v) + '</textarea>'
    : (op.opc ? '<select' + at + '>' + op.opc.map(function(o){ return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'
    : '<input' + at + ' type="' + (op.tipo || 'text') + '" value="' + esc(v == null ? '' : v) + '"' + (op.ro ? ' readonly' : '') + ' autocomplete="off">');
  return '<div class="campo"><label for="' + id + '">' + esc(et) + (op.opcional ? ' <span class="gris-t">(si quieres)</span>' : '') + '</label>' + ctl + (op.ayuda ? '<p class="ayuda">' + op.ayuda + '</p>' : '') + '</div>';
}
/* una lista de cosas sueltas (EPP, herramientas…): chips, un casillero para sumar y sugerencias */
function _ipwChips(ed, campo, sugs, ph){
  var L = ed.d[campo] || [], h = '<div class="ipw-chips" id="ipw-ch-' + campo + '">';
  L.forEach(function(t, i){ h += '<span class="ipw-chip">' + esc(t) + '<button type="button" data-ipw-edita data-ipw-chq="' + campo + '|' + i + '" aria-label="' + esc('Quitar ' + t) + '">×</button></span>'; });
  if(!L.length) h += '<span class="gris-t" style="font-size:13px">Todavía nada.</span>';
  h += '</div><div class="ipw-add" data-ipw-edita><input id="ipw-add-' + campo + '" maxlength="120" placeholder="' + esc(ph || 'Escribe y presiona Enter') + '" autocomplete="off"><button type="button" class="bt sec chico" data-ipw-chadd="' + campo + '">Agregar</button></div>';
  var faltan = (sugs || []).filter(function(s){ return L.indexOf(s) < 0; });
  if(faltan.length) h += '<div class="ipw-chips" data-ipw-edita style="margin-top:8px">' + faltan.map(function(s){ return '<button type="button" class="ipw-chip ipw-sugc" data-ipw-chsug="' + campo + '|' + esc(s) + '">＋ ' + esc(s) + '</button>'; }).join('') + '</div>';
  return h;
}
function _ipwChipsEnchufar(ed, c, repinta){
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipw-chq]'), function(b){ b.onclick = function(){ var p = b.getAttribute('data-ipw-chq').split('|'); ed.d[p[0]].splice(+p[1], 1); _ipwCambio(ed); repinta(); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipw-chsug]'), function(b){ b.onclick = function(){ var v = b.getAttribute('data-ipw-chsug'), i = v.indexOf('|'), k = v.slice(0, i), t = v.slice(i + 1); if(ed.d[k].indexOf(t) < 0) ed.d[k].push(t); _ipwCambio(ed); repinta(); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipw-chadd]'), function(b){
    var k = b.getAttribute('data-ipw-chadd'), inp = $('ipw-add-' + k);
    var suma = function(){ var t = ipTx(inp.value, 120); if(!t) return; if(ed.d[k].indexOf(t) < 0) ed.d[k].push(t); inp.value = ''; _ipwCambio(ed); repinta(); setTimeout(function(){ var x = $('ipw-add-' + k); if(x) x.focus(); }, 0); };
    b.onclick = suma;
    inp.onkeydown = function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); suma(); } };
    inp.removeAttribute('data-ipw-c');
  });
}
/* filas de objetos (equipo, personal, pasos…): cada campo con su ruta; ↑ ↓ y quitar */
function _ipwFilasBotones(campo, i, n){
  return '<div class="ipw-fila-q" data-ipw-edita>' + (i > 0 ? '<button type="button" class="bt sec chico" data-ipw-sube="' + campo + '|' + i + '" aria-label="Subir">↑</button>' : '') +
    (i < n - 1 ? '<button type="button" class="bt sec chico" data-ipw-baja="' + campo + '|' + i + '" aria-label="Bajar">↓</button>' : '') +
    '<button type="button" class="bt sec chico" data-ipw-fq="' + campo + '|' + i + '" aria-label="Quitar" style="color:var(--mal)">✕</button></div>';
}
function _ipwFilasEnchufar(ed, c, repinta){
  var mueve = function(sel, fn){ Array.prototype.forEach.call(c.querySelectorAll('[' + sel + ']'), function(b){ b.onclick = function(){ var p = b.getAttribute(sel).split('|'), L = ed.d[p[0]], i = +p[1]; fn(L, i); _ipwCambio(ed); repinta(); }; }); };
  mueve('data-ipw-sube', function(L, i){ if(i > 0){ var x = L[i]; L[i] = L[i - 1]; L[i - 1] = x; } });
  mueve('data-ipw-baja', function(L, i){ if(i < L.length - 1){ var x = L[i]; L[i] = L[i + 1]; L[i + 1] = x; } });
  mueve('data-ipw-fq', function(L, i){ L.splice(i, 1); });
}

/* ══ EL IPERC: DATOS ══ */
function _iplDatos(ed){
  var d = ed.d, C = IPW.ctx || {}, pe = (C.pais || 'pe') === 'pe';
  var met = [['rm050', IPL_MET.rm050.n + (pe ? ' (R.M. 050-2013-TR)' : '')]].concat(pe || d.met === 'ds024' ? [['ds024', IPL_MET.ds024.n + ' (D.S. 024-2016-EM)']] : []);
  var h = '<div class="ipw-sec"><h3>El documento</h3><div class="ipw-g2">' +
    _ipwCampo('ipl-tit', 'Nombre del IPERC', d.tit, { c:'tit', max:140 }) + _ipwCampo('ipl-cod', 'Código', d.cod, { c:'cod', max:40, ph:'IPERC-LB-01' }) +
    _ipwCampo('ipl-ver', 'Versión', d.ver, { ro:true, ayuda:'Cambia sola al abrir la versión siguiente.' }) + _ipwCampo('ipl-fecha', 'Fecha de elaboración', d.fecha, { c:'fecha', tipo:'date' }) +
    _ipwCampo('ipl-area', 'Qué abarca', d.area, { c:'area', max:160, ph:'Todas las actividades de la obra' }) + _ipwCampo('ipl-lugar', 'Lugar', d.lugar, { c:'lugar', max:160, opcional:true, ph:'Dirección o frente' }) +
    '</div></div><div class="ipw-sec"><h3>Cómo se evalúa</h3><div class="ipw-g3">' +
    _ipwCampo('ipl-met', 'Método', d.met, { c:'met', opc:met, ayuda:d.met === 'ds024' ? 'Se marca el nivel de cada peligro (Alto, Medio o Bajo) con la matriz de tu empresa.' : 'Probabilidad (A + B + C + D) por severidad: el nivel sale solo.' }) +
    _ipwCampo('ipl-sig', 'Riesgo significativo', d.sig, { c:'sig', opc:IPL_SIG[d.met], ayuda:'Lo define tu empresa. Un riesgo significativo no se acepta sin sus controles.' }) +
    /* 28/10/2026 · #186 · el modelo del documento (el de obra, por defecto; o el completo) */
    _ipwCampo('ipl-fmt', 'Modelo del documento', d.formato, { c:'formato', opc:IPL_FMT.map(function(x){ return [x[0], x[1]]; }),
      ayuda:esc((IPL_FMT.filter(function(x){ return x[0] === d.formato; })[0] || IPL_FMT[0])[2]) }) +
    (d.formato === 'completo' ? _ipwCampo('ipl-hoja', 'Hoja de la matriz en el PDF', d.hoja, { c:'hoja', opc:[['a4', 'A4 horizontal'], ['a3', 'A3 horizontal (letra más grande)']] }) : '') +
    '</div></div><div class="ipw-sec"><h3>Lo que va antes de la matriz</h3>' +
    _ipwCampo('ipl-obj', '1. Objetivo', d.obj, { c:'obj', area:true, filas:3, max:900 }) +
    _ipwCampo('ipl-alc', '2. Alcance', d.alc, { c:'alc', area:true, filas:3, max:900 }) +
    _ipwCampo('ipl-leg', '3. Base legal (una norma por línea)', d.leg.join('\n'), { c:'leg', t:'lineas', area:true, filas:5 }) +
    '</div><div class="ipw-sec"><h3>5. Equipo evaluador y participación de los trabajadores</h3>' +
    '<p class="ayuda" style="margin:0 0 10px">Quienes evaluaron, con al menos un representante de los trabajadores. En el PDF va el espacio para la firma de cada uno.</p><div class="ipw-filas">';
  d.equipo.forEach(function(p, i){
    h += '<div class="ipw-fila" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) auto">' +
      _ipwCampo('ipl-eq-n-' + i, 'Nombres y apellidos', p.n, { c:'equipo.' + i + '.n', max:100 }) + _ipwCampo('ipl-eq-c-' + i, 'Cargo o puesto', p.c, { c:'equipo.' + i + '.c', max:90 }) +
      _ipwCampo('ipl-eq-r-' + i, 'Participa como', p.rol, { c:'equipo.' + i + '.rol', opc:[['eq', 'Equipo evaluador'], ['trab', 'Representante de los trabajadores']] }) +
      _ipwFilasBotones('equipo', i, d.equipo.length) + '</div>';
  });
  if(!d.equipo.length) h += '<p class="gris-t" style="font-size:13px; margin:0">Todavía nadie. En el PDF salen líneas en blanco para llenarlas a mano.</p>';
  return h + '</div><button type="button" class="bt sec chico" id="ipl-eq-mas" data-ipw-edita style="margin-top:10px">＋ Agregar a alguien</button></div>';
}
function _iplDatosEnchufar(ed, c, bloq){
  var re = function(){ _ipwTab(); };
  var m = $('ipl-met');
  if(m) m.addEventListener('change', function(){ if(bloq) return; ed.d.sig = ed.d.met === 'ds024' ? 'M' : 'mod'; _ipwCambio(ed); re(); });
  /* el modelo: se repinta para mostrar (o no) la hoja del PDF y su ayuda */
  var fm = $('ipl-fmt');
  if(fm) fm.addEventListener('change', function(){ if(bloq) return; re(); });
  if(bloq) return;
  _ipwFilasEnchufar(ed, c, re);
  var mas = $('ipl-eq-mas'); if(mas) mas.onclick = function(){ ed.d.equipo.push({ n:'', c:'', rol:ed.d.equipo.length ? 'eq' : 'eq' }); _ipwCambio(ed); re(); var x = $('ipl-eq-n-' + (ed.d.equipo.length - 1)); if(x) x.focus(); };
  ed.d.equipo.forEach(function(p, i){
    var inp = $('ipl-eq-n-' + i); if(inp && typeof sugGente === 'function') sugGente(inp, { alElegir:function(t){ var cc = $('ipl-eq-c-' + i); if(cc && !cc.value && t.puesto){ cc.value = t.puesto; ed.d.equipo[i].c = t.puesto; _ipwCambio(ed); } } });
  });
}

/* ══ EL IPERC: LA MATRIZ ══ */
function _iplChip(ev){
  if(!ev) return '<span class="ipw-niv no">Sin evaluar</span>';
  return '<span class="ipw-niv" style="background:' + ev.niv.f + ';color:' + ev.niv.t + '">' + esc(ev.niv.n) + (ev.nr != null ? ' ' + ev.nr : '') + '</span>' + (ev.sig ? '<span class="ipw-sig" title="Riesgo significativo">SIG.</span>' : '');
}
function _iplCtlResumen(f){
  var L = IPL_CTL.filter(function(c){ return f.ctl[c[0]]; }).map(function(c){ var t = f.ctl[c[0]].split('\n')[0]; return '<b>' + esc(c[0] === 'epp' ? 'EPP' : c[1].split(' ')[0].replace('Controles', c[0] === 'ing' ? 'Ingeniería' : 'Administrativos')) + ':</b> ' + esc(t.length > 64 ? t.slice(0, 62) + '…' : t); });
  return L.length ? L.slice(0, 3).join('<br>') + (L.length > 3 ? '<br>…' : '') : '<span class="ipw-falta">Sin controles</span>';
}
function _iplMatriz(ed){
  var d = ed.d, R = iplResumen(d), P = iplProcesos(d), filtro = ed.filtroProc || '';
  var h = '<div class="ipw-herr" data-ipw-edita><button type="button" class="bt" id="ipl-f-nueva">＋ Agregar un peligro</button>' +
    '<button type="button" class="bt sec" id="ipl-f-sug">Sugerir peligros de la base del ATS</button></div>';
  if(P.length > 1) h += '<div class="ipw-herr"><select id="ipl-f-proc" aria-label="Proceso"><option value="">Todos los procesos</option>' + P.map(function(p){ return '<option value="' + esc(p.k) + '"' + (filtro === p.k ? ' selected' : '') + '>' + esc(p.n) + ' (' + p.filas.length + ')</option>'; }).join('') + '</select>' +
    '<span class="ayuda" style="margin:0">' + R.n + (R.n === 1 ? ' peligro' : ' peligros') + ' · ' + R.sig + (R.sig === 1 ? ' significativo' : ' significativos') + ' al inicio → ' + R.sigRes + ' con los controles' + (R.sinIni || R.sinRes ? ' · <b class="ipw-falta">' + Math.max(R.sinIni, R.sinRes) + ' por evaluar</b>' : '') + '</span></div>';
  if(!d.filas.length){
    return h + '<div class="tarj"><div class="vacio"><b>La matriz está vacía</b>Agrega los peligros de cada proceso, actividad y tarea de la obra, o parte de la base de peligros del ATS: eliges el tipo de trabajo y marcas los que hay en tu obra. Después evalúas cada uno.</div></div>';
  }
  h += '<div class="ipw-tabla"><table class="ipw-mat"><thead><tr><th>N.°</th><th>Actividad y tarea</th><th>Peligro y riesgo</th><th>Inicial</th><th>Medidas de control</th><th>Residual</th><th><span class="ipw-sr">Acciones</span></th></tr></thead><tbody>';
  var n = 0;
  P.forEach(function(p, pi){
    var visible = !filtro || filtro === p.k;
    p.filas.forEach(function(x){ if(!iplFilaVacia(x.f)) n++; x.n = n; });
    if(!visible) return;
    h += '<tr class="proc"><td colspan="7">Proceso: ' + esc(p.n) + ' <span class="gris-t">· ' + p.filas.length + '</span> <button type="button" class="bt sec chico" data-ipw-edita data-ipl-mas="' + pi + '" style="margin-left:8px">＋ En este proceso</button>' +
      (P.length > 1 && !filtro ? '<span data-ipw-edita style="margin-left:6px">' + (pi > 0 ? '<button type="button" class="bt sec chico" data-ipl-psube="' + pi + '" title="Subir el proceso" aria-label="Subir el proceso">↑</button>' : '') +
        (pi < P.length - 1 ? '<button type="button" class="bt sec chico" data-ipl-pbaja="' + pi + '" title="Bajar el proceso" aria-label="Bajar el proceso">↓</button>' : '') + '</span>' : '') + '</td></tr>';
    p.filas.forEach(function(x, j){
      var f = x.f, a = iplEv(f.ini, d.met, d.sig), b = iplEv(f.res, d.met, d.sig);
      h += '<tr class="f" data-ipl-f="' + x.i + '"><td>' + (iplFilaVacia(f) ? '—' : x.n) + '</td><td><b>' + esc(f.act || '—') + '</b>' + (f.tar ? '<small>' + esc(f.tar) + '</small>' : '') + '<small>' + (f.rut === 'NR' ? 'No rutinaria' : 'Rutinaria') + (f.tipo === 'SO' ? ' · salud ocupacional' : '') + '</small></td>' +
        '<td><b>' + esc(f.pel || '—') + '</b>' + (f.rie ? '<small>' + esc(f.rie) + '</small>' : '') + '</td><td>' + _iplChip(a) + '</td><td class="ipw-ctl">' + _iplCtlResumen(f) + '</td><td>' + _iplChip(b) + '</td>' +
        '<td class="acc" data-ipw-edita>' + (j > 0 ? '<button type="button" class="bt sec chico" data-ipl-sube="' + x.i + '" aria-label="Subir">↑</button>' : '') +
        (j < p.filas.length - 1 ? '<button type="button" class="bt sec chico" data-ipl-baja="' + x.i + '" aria-label="Bajar">↓</button>' : '') +
        '<button type="button" class="bt sec chico" data-ipl-dup="' + x.i + '" aria-label="Copiar" title="Copiar">⧉</button>' +
        '<button type="button" class="bt sec chico" data-ipl-q="' + x.i + '" aria-label="Quitar" style="color:var(--mal)">✕</button></td></tr>';
    });
  });
  return h + '</tbody></table></div>' + (d.filas.length >= IPL_TOPE ? '<p class="ayuda">Llegaste a ' + IPL_TOPE + ' peligros: es el tope de una matriz. Si necesitas más, haz otro IPERC por área.</p>' : '');
}
function _iplMatrizEnchufar(ed, c, bloq){
  var d = ed.d, re = function(){ _ipwEditor(); };
  var pf = $('ipl-f-proc'); if(pf) pf.onchange = function(){ ed.filtroProc = pf.value; _ipwTab(); };
  Array.prototype.forEach.call(c.querySelectorAll('tr.f'), function(tr){ tr.onclick = function(ev){ if(ev.target.closest('button')) return; iplFilaForm(+tr.getAttribute('data-ipl-f')); }; });
  if(bloq) return;
  var nueva = $('ipl-f-nueva');
  if(nueva) nueva.onclick = function(){ var P = iplProcesos(d), fp = ed.filtroProc && P.filter(function(p){ return p.k === ed.filtroProc; })[0], u = fp ? fp.filas[fp.filas.length - 1].f : d.filas[d.filas.length - 1]; iplFilaForm(-1, u ? { proc:u.proc, act:u.act } : {}); };
  var sug = $('ipl-f-sug'); if(sug) sug.onclick = function(){ iplSugerir(); };
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipl-mas]'), function(b){ b.onclick = function(){ var p = iplProcesos(d)[+b.getAttribute('data-ipl-mas')], u = p.filas[p.filas.length - 1].f; iplFilaForm(-1, { proc:u.proc, act:u.act }); }; });
  var en = function(sel, fn){ Array.prototype.forEach.call(c.querySelectorAll('[' + sel + ']'), function(b){ b.onclick = function(ev){ ev.stopPropagation(); fn(+b.getAttribute(sel)); }; }); };
  /* subir y bajar dentro de su proceso: se cambia con la fila de al lado del mismo proceso */
  var vecino = function(i, paso){ var k = ipNorm(d.filas[i].proc) || '~'; for(var j = i + paso; j >= 0 && j < d.filas.length; j += paso){ if((ipNorm(d.filas[j].proc) || '~') === k) return j; } return -1; };
  var cambia = function(i, j){ if(j < 0) return; var x = d.filas[i]; d.filas[i] = d.filas[j]; d.filas[j] = x; _ipwCambio(ed); _ipwTab(); };
  en('data-ipl-sube', function(i){ cambia(i, vecino(i, -1)); });
  en('data-ipl-baja', function(i){ cambia(i, vecino(i, 1)); });
  /* un proceso entero sube o baja (con todas sus filas) */
  var mueveProc = function(pi, paso){
    var P = iplProcesos(d), j = pi + paso; if(j < 0 || j >= P.length) return;
    var x = P[pi]; P[pi] = P[j]; P[j] = x;
    d.filas = [].concat.apply([], P.map(function(p){ return p.filas.map(function(y){ return y.f; }); }));
    _ipwCambio(ed); _ipwTab();
  };
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipl-psube]'), function(b){ b.onclick = function(){ mueveProc(+b.getAttribute('data-ipl-psube'), -1); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipl-pbaja]'), function(b){ b.onclick = function(){ mueveProc(+b.getAttribute('data-ipl-pbaja'), 1); }; });
  en('data-ipl-dup', function(i){ if(d.filas.length >= IPL_TOPE) return toast('Llegaste al tope de ' + IPL_TOPE + ' peligros'); var x = JSON.parse(JSON.stringify(d.filas[i])); x.id = ipId(); d.filas.splice(i + 1, 0, x); _ipwCambio(ed); re(); });
  en('data-ipl-q', function(i){
    var f = d.filas[i];
    confirmar('¿Quitar este peligro?', '«' + (f.pel || f.act || 'Sin nombre') + '» sale de la matriz.', { si:'Sí, quitarlo', mal:true }).then(function(ok){ if(!ok) return; d.filas.splice(i, 1); _ipwCambio(ed); re(); });
  });
}
/* un peligro: su lugar, qué es, la evaluación inicial, los controles y el riesgo residual */
function _iplEvHTML(cual, e, mina){
  if(mina) return '<div class="ipw-g3">' + _ipwCampo('ipl-ev-' + cual + '-n', 'Nivel de riesgo', e.n || '', { opc:[['', '—']].concat(IPL_MIN.map(function(m){ return [m.k, m.n + ' (corregir en ' + m.plazo + ')']; })) }) + '</div>' +
    '<div class="ipw-res-ev" id="ipl-ev-' + cual + '-r"></div>';
  return '<div class="ipw-ev">' + IPL_IND.concat([IPL_SEV]).map(function(x){
    return _ipwCampo('ipl-ev-' + cual + '-' + x.k, x.c + ' · ' + x.n, e[x.k] || '', { opc:[['', '—']].concat(x.o.map(function(o, i){ return [String(i + 1), (i + 1) + ' · ' + o]; })) });
  }).join('') + '</div><div class="ipw-res-ev" id="ipl-ev-' + cual + '-r"></div>';
}
function _iplEvLeer(cual, mina){
  var v = function(k){ var x = $('ipl-ev-' + cual + '-' + k); return x ? x.value : ''; };
  return mina ? { n:v('n') } : { a:v('a'), b:v('b'), c:v('c'), d:v('d'), s:v('s') };
}
function _iplEvPinta(cual, d){
  var r = $('ipl-ev-' + cual + '-r'); if(!r) return;
  var e = _iplEvLeer(cual, d.met === 'ds024'), ev = iplEv(e, d.met, d.sig);
  if(!ev){ r.innerHTML = '<span class="gris-t">' + (d.met === 'ds024' ? 'Marca el nivel.' : 'Elige los cinco índices y el nivel sale solo.') + '</span>'; return; }
  r.innerHTML = (ev.nr != null ? '<span>IP = ' + ev.ip + ' · S = ' + ev.s + ' · IP × S = <b>' + ev.nr + '</b></span>' : '') + _iplChip(ev) +
    '<span class="gris-t">' + esc(ev.niv.d) + '</span>';
}
function iplFilaForm(i, base){
  var ed = IPW.ed, d = ed.d, nueva = i < 0, bloq = !!_ipwBloqueo(ed), mina = d.met === 'ds024';
  var f = nueva ? iplFilaLimpia(base || {}) : JSON.parse(JSON.stringify(d.filas[i]));
  var procs = iplProcesos(d).map(function(p){ return p.n; }).filter(function(n){ return n && n !== 'Sin proceso'; });
  var acts = []; d.filas.forEach(function(x){ if(x.act && acts.indexOf(x.act) < 0) acts.push(x.act); });
  var cuerpo = '<datalist id="ipl-dl-proc">' + procs.map(function(p){ return '<option value="' + esc(p) + '">'; }).join('') + '</datalist>' +
    '<datalist id="ipl-dl-act">' + acts.slice(0, 80).map(function(p){ return '<option value="' + esc(p) + '">'; }).join('') + '</datalist>' +
    '<div class="ipw-g3">' + _ipwCampo('ipl-x-proc', 'Proceso', f.proc, { max:90, ph:'Movimiento de tierras' }) + _ipwCampo('ipl-x-act', 'Actividad', f.act, { max:140, ph:'Excavación de zanjas' }) +
    _ipwCampo('ipl-x-tar', 'Tarea', f.tar, { max:180, ph:'Excavación manual hasta 1.50 m' }) + '</div>' +
    '<div class="ipw-g3">' + _ipwCampo('ipl-x-pue', 'Puesto de trabajo', f.pue, { max:90, opcional:true, ph:'Operario, peón…' }) +
    _ipwCampo('ipl-x-rut', '¿Rutinaria?', f.rut, { opc:[['R', 'Rutinaria'], ['NR', 'No rutinaria']] }) +
    _ipwCampo('ipl-x-tipo', 'De', f.tipo, { opc:[['S', 'Seguridad (S)'], ['SO', 'Salud ocupacional (SO)']] }) + '</div>' +
    '<div class="ipw-g2">' + _ipwCampo('ipl-x-pel', 'Peligro', f.pel, { max:220, ph:'Trabajo en altura (por encima de 1.80 m)' }) + _ipwCampo('ipl-x-rie', 'Riesgo', f.rie, { max:220, ph:'Caída a distinto nivel' }) +
    _ipwCampo('ipl-x-con', 'Consecuencia', f.con, { max:220, ph:'Fracturas, politraumatismos, muerte' }) + _ipwCampo('ipl-x-leg', 'Requisito legal', f.leg, { max:220, opcional:true }) + '</div>' +
    '<h3 class="peq-lbl" style="margin:8px 0 8px">EVALUACIÓN INICIAL · con los controles que ya existen</h3>' + _iplEvHTML('ini', f.ini, mina) +
    '<h3 class="peq-lbl" style="margin:18px 0 8px">MEDIDAS DE CONTROL · en este orden</h3><div class="ipw-g2">' +
    IPL_CTL.map(function(c){ return _ipwCampo('ipl-x-' + c[0], c[1], f.ctl[c[0]], { area:true, filas:2, max:c[0] === 'adm' ? 700 : 500, ph:({ eli:'¿Se puede quitar el peligro?', sus:'¿Algo menos peligroso?', ing:'Barandas, guardas, ventilación…', adm:'Permisos, procedimientos, señalización, capacitación…', epp:'Arnés, careta, respirador…' })[c[0]] }); }).join('') + '</div>' +
    '<h3 class="peq-lbl" style="margin:12px 0 8px">RIESGO RESIDUAL · con las medidas de control</h3>' + _iplEvHTML('res', f.res, mina) +
    (bloq ? '' : '<button type="button" class="bt sec chico" id="ipl-x-copia" style="margin-top:8px">Empezar con la evaluación inicial</button>') +
    '<div class="ipw-g2" style="margin-top:14px">' + _ipwCampo('ipl-x-resp', 'Responsable', f.resp, { max:90, opcional:true }) + _ipwCampo('ipl-x-plazo', 'Plazo', f.plazo, { tipo:'date', opcional:true }) + '</div>' +
    '<div class="msg" id="ipl-x-msg" role="status"></div>';
  var pie = bloq ? '<button type="button" class="bt" id="ipl-x-no">Cerrar</button>'
    : '<button type="button" class="bt sec" id="ipl-x-no">Cancelar</button>' + '<button type="button" class="bt sec" id="ipl-x-otro">Guardar y agregar otro</button><button type="button" class="bt" id="ipl-x-ok">' + (nueva ? 'Agregar' : 'Guardar') + '</button>';
  abrirHoja(nueva ? 'Un peligro nuevo' : 'Peligro ' + (i + 1), [f.proc, f.act].filter(Boolean).join(' · ') || 'En la matriz IPERC', cuerpo, pie, { ancha:true });
  $('ipl-x-proc').setAttribute('list', 'ipl-dl-proc'); $('ipl-x-act').setAttribute('list', 'ipl-dl-act');
  ['ini', 'res'].forEach(function(cual){
    _iplEvPinta(cual, d);
    Array.prototype.forEach.call(document.querySelectorAll('#hoja [id^="ipl-ev-' + cual + '-"]'), function(s){ if(s.tagName === 'SELECT') s.onchange = function(){ _iplEvPinta(cual, d); }; });
  });
  $('ipl-x-no').onclick = cerrarHoja;
  if(bloq){ Array.prototype.forEach.call(document.querySelectorAll('#hoja input, #hoja select, #hoja textarea'), function(x){ x.disabled = true; }); return; }
  $('ipl-x-copia').onclick = function(){
    ['a', 'b', 'c', 'd', 's', 'n'].forEach(function(k){ var a = $('ipl-ev-ini-' + k), b = $('ipl-ev-res-' + k); if(a && b) b.value = a.value; });
    _iplEvPinta('res', d);
  };
  var guardar = function(otro){
    var v = function(id){ var x = $(id); return x ? x.value : ''; }, ctl = {};
    IPL_CTL.forEach(function(c){ ctl[c[0]] = v('ipl-x-' + c[0]); });
    var x = iplFilaLimpia({ id:f.id, proc:v('ipl-x-proc'), act:v('ipl-x-act'), tar:v('ipl-x-tar'), pue:v('ipl-x-pue'), rut:v('ipl-x-rut'), tipo:v('ipl-x-tipo'),
      pel:v('ipl-x-pel'), rie:v('ipl-x-rie'), con:v('ipl-x-con'), leg:v('ipl-x-leg'), ini:_iplEvLeer('ini', mina), ctl:ctl, res:_iplEvLeer('res', mina), resp:v('ipl-x-resp'), plazo:v('ipl-x-plazo') });
    var m = $('ipl-x-msg');
    if(!x.pel){ m.className = 'msg mal'; m.textContent = 'Escribe el peligro.'; $('ipl-x-pel').focus(); return; }
    if(!x.act && !x.tar){ m.className = 'msg mal'; m.textContent = 'Escribe la actividad o la tarea.'; $('ipl-x-act').focus(); return; }
    if(nueva){
      if(d.filas.length >= IPL_TOPE){ m.className = 'msg mal'; m.textContent = 'Llegaste al tope de ' + IPL_TOPE + ' peligros en esta matriz.'; return; }
      /* va al final de su proceso (si ya existe), si no al final */
      var k = ipNorm(x.proc) || '~', pos = -1;
      d.filas.forEach(function(y, j){ if((ipNorm(y.proc) || '~') === k) pos = j; });
      if(pos > -1) d.filas.splice(pos + 1, 0, x); else d.filas.push(x);
    }else d.filas[i] = x;
    _ipwCambio(ed);
    if(otro){ cerrarHoja(); _ipwEditor(); iplFilaForm(-1, { proc:x.proc, act:x.act, tar:x.tar, rut:x.rut }); toast('Guardado: el siguiente'); }
    else { cerrarHoja(); _ipwEditor(); }
  };
  $('ipl-x-ok').onclick = function(){ guardar(false); };
  $('ipl-x-otro').onclick = function(){ guardar(true); };
  setTimeout(function(){ var x = $(nueva && !f.proc ? 'ipl-x-proc' : 'ipl-x-pel'); if(x) x.focus(); }, 60);
}
/* la base de peligros del ATS (la de la app): el tipo de trabajo, y se marcan los que hay en la obra */
function _iplBaseAts(){
  var L = [], vis = {};
  ((typeof ATS_PREG === 'object' && ATS_PREG.preg) || []).forEach(function(q){
    var pon = function(h){ if(!h || !h.p) return; var k = ipNorm(h.p + '|' + h.r); if(vis[k]){ vis[k].t = vis[k].t.concat(q.t || []); return; } vis[k] = { p:h.p, r:h.r || '', c:h.c || '', m:h.m || '', t:(q.t || []).slice() }; L.push(vis[k]); };
    (q.f || []).forEach(pon);
    if(q.of) Object.keys(q.of).forEach(function(o){ (q.of[o] || []).forEach(pon); });
  });
  return L;
}
function iplSugerir(){
  var ed = IPW.ed, d = ed.d, sel = {}, marcados = {};
  var u = d.filas[d.filas.length - 1] || {};
  abrirHoja('Sugerir peligros', 'De la base de peligros del ATS: marcas los que hay en tu obra', '<p class="ayuda">Cargando la base de peligros…</p>', '<button type="button" class="bt sec" id="ipl-s-no">Cancelar</button>', { ancha:true });
  $('ipl-s-no').onclick = cerrarHoja;
  (typeof cargarPapeles === 'function' ? cargarPapeles() : Promise.reject('sin')).then(function(){
    if(typeof ATS_PREG !== 'object') return Promise.reject('sin');
    var base = _iplBaseAts(), tipos = [{ k:'*', n:'De siempre (sol, ruido, polvo, cargas…)', ic:'⭐' }].concat(ATS_PREG.tipos || []);
    var cuerpo = '<p class="ayuda" style="margin:0 0 10px">Elige el tipo de trabajo y marca los peligros que de verdad hay. Cada uno entra con su riesgo, su consecuencia y un control para empezar, repartido en la jerarquía: después lo revisas y lo evalúas.</p>' +
      '<div class="ipw-tipos" id="ipl-s-tipos">' + tipos.map(function(t){ return '<button type="button" data-t="' + esc(t.k) + '">' + (t.ic ? t.ic + ' ' : '') + esc(t.n) + '</button>'; }).join('') + '</div>' +
      '<div class="ipw-sugs" id="ipl-s-lista"><p class="gris-t" style="margin:4px">Elige uno o más tipos de trabajo.</p></div>' +
      '<div class="ipw-g3" style="margin-top:14px">' + _ipwCampo('ipl-s-proc', 'Proceso', u.proc || '', { max:90, ph:'Estructuras' }) + _ipwCampo('ipl-s-act', 'Actividad', u.act || '', { max:140, ph:'Encofrado de columnas' }) +
      _ipwCampo('ipl-s-tar', 'Tarea', '', { max:180, opcional:true }) + '</div><div class="msg" id="ipl-s-msg" role="status"></div>';
    $('hoja-cuerpo').innerHTML = cuerpo;
    $('hoja-pie').innerHTML = '<button type="button" class="bt sec" id="ipl-s-no2">Cancelar</button><button type="button" class="bt" id="ipl-s-ok" disabled>Agregar los marcados</button>';
    $('ipl-s-no2').onclick = cerrarHoja;
    var pinta = function(){
      var ks = Object.keys(sel).filter(function(k){ return sel[k]; }), L = base.filter(function(h){ return h.t.some(function(t){ return ks.indexOf(t) > -1; }); });
      var hay = {}; d.filas.forEach(function(f){ hay[ipNorm(f.pel + '|' + f.rie)] = 1; });
      $('ipl-s-lista').innerHTML = !ks.length ? '<p class="gris-t" style="margin:4px">Elige uno o más tipos de trabajo.</p>' : L.map(function(h){
        var k = ipNorm(h.p + '|' + h.r), ya = hay[k];
        return '<label><input type="checkbox" data-k="' + esc(k) + '"' + (marcados[k] ? ' checked' : '') + '><span><b>' + esc(h.p) + '</b>' + (ya ? ' <span class="gris-t">· ya está en la matriz</span>' : '') +
          '<small>' + esc(h.r) + (h.c ? ' → ' + esc(h.c) : '') + '</small><small>Control: ' + esc(h.m) + '</small></span></label>';
      }).join('');
      Array.prototype.forEach.call(document.querySelectorAll('#ipl-s-lista input'), function(x){ x.onchange = function(){ marcados[x.getAttribute('data-k')] = x.checked; cuenta(); }; });
      cuenta();
    };
    var cuenta = function(){ var n = Object.keys(marcados).filter(function(k){ return marcados[k]; }).length, b = $('ipl-s-ok'); if(b){ b.disabled = !n; b.textContent = n ? 'Agregar ' + n + (n === 1 ? ' peligro' : ' peligros') : 'Agregar los marcados'; } };
    Array.prototype.forEach.call(document.querySelectorAll('#ipl-s-tipos button'), function(b){ b.onclick = function(){ var k = b.getAttribute('data-t'); sel[k] = !sel[k]; b.classList.toggle('on', !!sel[k]); pinta(); }; });
    $('ipl-s-ok').onclick = function(){
      var v = function(id){ var x = $(id); return x ? x.value : ''; }, m = $('ipl-s-msg');
      var proc = ipTx(v('ipl-s-proc'), 90), act = ipTx(v('ipl-s-act'), 140), tar = ipTx(v('ipl-s-tar'), 180);
      if(!act && !tar){ m.className = 'msg mal'; m.textContent = 'Escribe la actividad (o la tarea) de estos peligros.'; $('ipl-s-act').focus(); return; }
      var nuevos = base.filter(function(h){ return marcados[ipNorm(h.p + '|' + h.r)]; }).map(function(h){ return iplDesdeAts(h, { proc:proc, act:act, tar:tar }); });
      var cabe = Math.max(0, IPL_TOPE - d.filas.length); nuevos = nuevos.slice(0, cabe);
      if(!nuevos.length){ m.className = 'msg mal'; m.textContent = 'La matriz ya llegó a su tope de ' + IPL_TOPE + ' peligros.'; return; }
      var k = ipNorm(proc) || '~', pos = -1;
      d.filas.forEach(function(y, j){ if((ipNorm(y.proc) || '~') === k) pos = j; });
      if(pos > -1) Array.prototype.splice.apply(d.filas, [pos + 1, 0].concat(nuevos)); else d.filas = d.filas.concat(nuevos);
      _ipwCambio(ed); cerrarHoja(); ed.tab = 'matriz'; _ipwEditor();
      toast(nuevos.length + (nuevos.length === 1 ? ' peligro agregado' : ' peligros agregados') + ': revisa cada uno y evalúalo');
    };
  }).catch(function(){ $('hoja-cuerpo').innerHTML = '<p class="msg mal">No se pudo cargar la base de peligros. Revisa tu conexión e inténtalo otra vez.</p>'; });
}

/* ══ EL PETS: DATOS ══ */
var PETS_DEFS = [
  { t:'PETS', d:'Procedimiento escrito de trabajo seguro: describe paso a paso cómo hacer la tarea de manera correcta y segura.' },
  { t:'ATS', d:'Análisis de trabajo seguro: lo llena la cuadrilla antes de empezar, con los peligros y los controles de ese día.' },
  { t:'PETAR', d:'Permiso escrito de trabajo de alto riesgo: autoriza un trabajo de alto riesgo para ese turno, con sus verificaciones y sus firmas.', pe:1 },
  { t:'EPP', d:'Equipos de protección personal: lo que usa cada trabajador para protegerse del riesgo que queda después de los demás controles.' },
  { t:'IPERC', d:'Identificación de peligros, evaluación de riesgos y medidas de control.' }
];
function _petsDatos(ed){
  var d = ed.d, L = IPW.filas.ipl || [], pe = ((IPW.ctx || {}).pais || 'pe') === 'pe';
  var h = '<div class="ipw-sec"><h3>El documento</h3><div class="ipw-g2">' +
    _ipwCampo('pets-tit', 'Nombre del PETS (la tarea)', d.tit, { c:'tit', max:140 }) + _ipwCampo('pets-cod', 'Código', d.cod, { c:'cod', max:40, ph:'PETS-01' }) +
    _ipwCampo('pets-ver', 'Versión', d.ver, { ro:true, ayuda:'Cambia sola al abrir la versión siguiente.' }) + _ipwCampo('pets-fecha', 'Fecha de elaboración', d.fecha, { c:'fecha', tipo:'date' }) +
    _ipwCampo('pets-area', 'Área', d.area, { c:'area', max:120, ph:'Movimiento de tierras' }) + _ipwCampo('pets-lugar', 'Lugar', d.lugar, { c:'lugar', max:160, opcional:true }) +
    /* 28/10/2026 · #186 · el modelo del PETS: el completo o el del Anexo 10 (fuera del Perú, «formato corto») */
    _ipwCampo('pets-fmt', 'Modelo del documento', d.formato, { c:'formato', opc:PETS_FMT.map(function(x){ return [x[0], pe || x[0] !== 'anexo10' ? x[1] : 'Formato corto (cinco secciones)']; }),
      ayuda:esc((PETS_FMT.filter(function(x){ return x[0] === d.formato; })[0] || PETS_FMT[0])[2].replace(pe ? /^$/ : /, como el Anexo 10/, '')) }) +
    '</div></div><div class="ipw-sec"><h3>Objetivo y alcance</h3>' +
    _ipwCampo('pets-obj', 'Objetivo', d.obj, { c:'obj', area:true, filas:3, max:900 }) + _ipwCampo('pets-alc', 'Alcance', d.alc, { c:'alc', area:true, filas:3, max:900 }) +
    '<button type="button" class="bt sec chico" id="pets-textos" data-ipw-edita>Escribirlos de nuevo con el nombre de la tarea</button></div>' +
    '<div class="ipw-sec"><h3>Documentos de referencia</h3>' +
    _ipwCampo('pets-ipl', 'IPERC de línea base de esta tarea', d.ipl ? d.ipl.id : '', { opc:[['', L.length ? '— Ninguno —' : '— Esta obra todavía no tiene IPERC de línea base —']].concat(L.map(function(x){ return [String(x._fila), x.tit + (x.cod ? ' · ' + x.cod : '')]; })),
      ayuda:'Sus peligros se pueden traer a la pestaña «Procedimiento».' }) +
    _ipwCampo('pets-refs', 'Normas y documentos (uno por línea)', d.refs.join('\n'), { c:'refs', t:'lineas', area:true, filas:5 }) + '</div>';
  h += '<div class="ipw-sec"><h3>Definiciones <span class="gris-t" style="text-transform:none; letter-spacing:0">(si hacen falta)</span></h3><div class="ipw-filas">';
  d.defs.forEach(function(x, i){ h += '<div class="ipw-fila" style="grid-template-columns:minmax(0,.6fr) minmax(0,2fr) auto">' + _ipwCampo('pets-df-t-' + i, 'Término', x.t, { c:'defs.' + i + '.t', max:80 }) + _ipwCampo('pets-df-d-' + i, 'Qué es', x.d, { c:'defs.' + i + '.d', max:500 }) + _ipwFilasBotones('defs', i, d.defs.length) + '</div>'; });
  var ya = d.defs.map(function(x){ return x.t.toUpperCase(); }), faltan = PETS_DEFS.filter(function(x){ return (pe || !x.pe) && ya.indexOf(x.t) < 0; });
  h += '</div><div class="ipw-chips" data-ipw-edita style="margin-top:10px"><button type="button" class="bt sec chico" id="pets-df-mas">＋ Agregar</button>' + faltan.map(function(x){ return '<button type="button" class="ipw-chip ipw-sugc" data-pets-df="' + esc(x.t) + '">＋ ' + esc(x.t) + '</button>'; }).join('') + '</div></div>';
  h += '<div class="ipw-sec"><h3>Responsabilidades</h3><div class="ipw-filas">';
  d.resp.forEach(function(x, i){ h += '<div class="ipw-fila" style="grid-template-columns:minmax(0,.8fr) minmax(0,2fr) auto">' + _ipwCampo('pets-rs-q-' + i, 'Quién', x.q, { c:'resp.' + i + '.q', max:90 }) + _ipwCampo('pets-rs-d-' + i, 'Su responsabilidad', x.d, { c:'resp.' + i + '.d', max:600 }) + _ipwFilasBotones('resp', i, d.resp.length) + '</div>'; });
  return h + '</div><div class="acciones" data-ipw-edita style="margin-top:10px"><button type="button" class="bt sec chico" id="pets-rs-mas">＋ Agregar</button>' +
    (d.resp.length ? '' : '<button type="button" class="bt sec chico" id="pets-rs-siempre">Poner las de siempre (y cambiarlas)</button>') + '</div></div>';
}
function _petsDatosEnchufar(ed, c, bloq){
  var d = ed.d, re = function(){ _ipwTab(); };
  /* el IPERC de la obra: si todavía no se trajo la lista, se trae y se repinta */
  if(!IPW.filas.ipl) ipwTraer('ipl', false).then(function(){ if(IPW.ed === ed && ed.tab === 'datos') re(); }, function(){});
  if(bloq) return;
  _ipwFilasEnchufar(ed, c, re);
  var fm = $('pets-fmt'); if(fm) fm.addEventListener('change', function(){ re(); });
  $('pets-ipl').onchange = function(){
    var id = this.value, x = (IPW.filas.ipl || []).filter(function(y){ return String(y._fila) === id; })[0];
    d.ipl = x ? { id:String(x._fila), cod:x.cod, tit:x.tit } : null;
    if(x){ var ref = x.tit + (x.cod ? ' · ' + x.cod : ''); if(d.refs.indexOf(ref) < 0) d.refs.push(ref); }
    _ipwCambio(ed); re();
  };
  $('pets-textos').onclick = function(){ ipwCtx(false).then(function(C){ var t = petsTextos(C, d.tit); d.obj = t.obj; d.alc = t.alc; _ipwCambio(ed); re(); }); };
  $('pets-df-mas').onclick = function(){ d.defs.push({ t:'', d:'' }); _ipwCambio(ed); re(); var x = $('pets-df-t-' + (d.defs.length - 1)); if(x) x.focus(); };
  Array.prototype.forEach.call(c.querySelectorAll('[data-pets-df]'), function(b){ b.onclick = function(){ var t = b.getAttribute('data-pets-df'), x = PETS_DEFS.filter(function(y){ return y.t === t; })[0]; if(x) d.defs.push({ t:x.t, d:x.d }); _ipwCambio(ed); re(); }; });
  $('pets-rs-mas').onclick = function(){ d.resp.push({ q:'', d:'' }); _ipwCambio(ed); re(); var x = $('pets-rs-q-' + (d.resp.length - 1)); if(x) x.focus(); };
  var s = $('pets-rs-siempre'); if(s) s.onclick = function(){ d.resp = PETS_RESP.map(function(x){ return { q:x.q, d:x.d }; }); _ipwCambio(ed); re(); };
}

/* ══ EL PETS: PERSONAL, EPP Y EQUIPOS ══ */
function _petsRecursos(ed){
  var d = ed.d, h = '<div class="ipw-sec"><h3>Personal</h3><div class="ipw-filas">';
  d.pers.forEach(function(x, i){
    h += '<div class="ipw-fila" style="grid-template-columns:minmax(0,1fr) 90px minmax(0,1.6fr) auto">' + _ipwCampo('pets-pe-c-' + i, 'Cargo', x.c, { c:'pers.' + i + '.c', max:90, ph:'Operario' }) +
      _ipwCampo('pets-pe-n-' + i, 'Cantidad', x.n || '', { c:'pers.' + i + '.n', t:'num', tipo:'number' }) + _ipwCampo('pets-pe-r-' + i, 'Requisitos y competencias', x.req, { c:'pers.' + i + '.req', max:400, ph:'Capacitado en este PETS' }) +
      _ipwFilasBotones('pers', i, d.pers.length) + '</div>';
  });
  if(!d.pers.length) h += '<p class="gris-t" style="font-size:13px; margin:0">Quiénes hacen la tarea: el cargo, cuántos y qué necesitan saber.</p>';
  h += '</div><button type="button" class="bt sec chico" id="pets-pe-mas" data-ipw-edita style="margin-top:10px">＋ Agregar un cargo</button></div>';
  h += '<div class="ipw-sec"><h3>Equipos de protección personal</h3><div class="ipw-epp">' + PETS_EPP.map(function(t, i){
    return '<label><input type="checkbox" data-ipw-c="epp" data-ipw-t="lista" value="' + esc(t) + '"' + (d.epp.indexOf(t) > -1 ? ' checked' : '') + '>' + esc(t) + '</label>';
  }).join('') + '</div>';
  var otros = d.epp.filter(function(t){ return PETS_EPP.indexOf(t) < 0; });
  h += '<p class="peq-lbl" style="margin:6px 0">Otros</p><div class="ipw-chips">' + otros.map(function(t){ return '<span class="ipw-chip">' + esc(t) + '<button type="button" data-ipw-edita data-pets-epq="' + esc(t) + '" aria-label="' + esc('Quitar ' + t) + '">×</button></span>'; }).join('') +
    '</div><div class="ipw-add" data-ipw-edita><input id="pets-epp-add" maxlength="90" placeholder="Otro EPP y Enter" autocomplete="off"><button type="button" class="bt sec chico" id="pets-epp-mas">Agregar</button></div></div>';
  [['eq', 'Equipos', 'Detector de servicios enterrados, andamio certificado…'], ['her', 'Herramientas', 'Pico, lampa, barreta…'], ['mat', 'Materiales', 'Malla, cinta de señalización…']].forEach(function(q){
    h += '<div class="ipw-sec"><h3>' + q[1] + '</h3>' + _ipwChips(ed, q[0], [], q[2]) + '</div>';
  });
  return h;
}
function _petsRecursosEnchufar(ed, c, bloq){
  var d = ed.d, re = function(){ _ipwTab(); };
  if(bloq) return;
  _ipwFilasEnchufar(ed, c, re);
  _ipwChipsEnchufar(ed, c, re);
  $('pets-pe-mas').onclick = function(){ d.pers.push({ c:'', n:1, req:'' }); _ipwCambio(ed); re(); var x = $('pets-pe-c-' + (d.pers.length - 1)); if(x) x.focus(); };
  var add = $('pets-epp-add'), suma = function(){ var t = ipTx(add.value, 90); if(!t) return; if(d.epp.indexOf(t) < 0) d.epp.push(t); _ipwCambio(ed); re(); setTimeout(function(){ var x = $('pets-epp-add'); if(x) x.focus(); }, 0); };
  $('pets-epp-mas').onclick = suma; add.onkeydown = function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); suma(); } };
  Array.prototype.forEach.call(c.querySelectorAll('[data-pets-epq]'), function(b){ b.onclick = function(){ var t = b.getAttribute('data-pets-epq'), i = d.epp.indexOf(t); if(i > -1) d.epp.splice(i, 1); _ipwCambio(ed); re(); }; });
}

/* ══ EL PETS: PELIGROS, PASOS, RESTRICCIONES Y REGISTROS ══ */
function _petsProc(ed){
  var d = ed.d, pe = ((IPW.ctx || {}).pais || 'pe') === 'pe';
  var h = '<div class="ipw-sec"><h3>Peligros, riesgos y medidas de control</h3><p class="ayuda" style="margin:0 0 10px">Los de la tarea (si hacen falta en el PETS). Se pueden traer del IPERC de línea base.</p><div class="ipw-filas">';
  d.pel.forEach(function(x, i){
    h += '<div class="ipw-fila" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.5fr) auto">' + _ipwCampo('pets-pl-p-' + i, 'Peligro', x.p, { c:'pel.' + i + '.p', max:220 }) +
      _ipwCampo('pets-pl-r-' + i, 'Riesgo', x.r, { c:'pel.' + i + '.r', max:220 }) + _ipwCampo('pets-pl-c-' + i, 'Medidas de control', x.c, { c:'pel.' + i + '.c', area:true, filas:2, max:700 }) +
      _ipwFilasBotones('pel', i, d.pel.length) + '</div>';
  });
  h += '</div><div class="acciones" data-ipw-edita style="margin-top:10px"><button type="button" class="bt sec chico" id="pets-pl-mas">＋ Agregar un peligro</button><button type="button" class="bt sec chico" id="pets-pl-ipl">Traer del IPERC de línea base</button></div></div>';
  h += '<div class="ipw-sec ipw-pasos"><h3>Procedimiento, paso a paso</h3><div class="ipw-filas">';
  d.pasos.forEach(function(x, i){
    h += '<div class="ipw-fila"><div class="ipw-n">' + (i + 1) + '</div><div>' + _ipwCampo('pets-ps-t-' + i, 'Qué se hace', x.t, { c:'pasos.' + i + '.t', area:true, filas:2, max:900 }) +
      '<details class="ipw-mas"' + (x.rie || x.ctl ? ' open' : '') + '><summary>Riesgos de este paso y cómo se controlan</summary><div class="ipw-g2" style="margin-top:8px">' +
      _ipwCampo('pets-ps-r-' + i, 'Riesgos del paso', x.rie, { c:'pasos.' + i + '.rie', area:true, filas:2, max:500 }) + _ipwCampo('pets-ps-c-' + i, 'Cómo se controla', x.ctl, { c:'pasos.' + i + '.ctl', area:true, filas:2, max:700 }) +
      '</div></details></div>' + _ipwFilasBotones('pasos', i, d.pasos.length) + '</div>';
  });
  if(!d.pasos.length) h += '<p class="gris-t" style="font-size:13px; margin:0">Desde la preparación (el ATS, la señalización) hasta el orden y la limpieza del final.</p>';
  h += '</div><button type="button" class="bt sec chico" id="pets-ps-mas" data-ipw-edita style="margin-top:10px">＋ Agregar un paso</button>' + (d.pasos.length >= PETS_TOPE ? '<p class="ayuda">Llegaste a ' + PETS_TOPE + ' pasos: es el tope de un PETS.</p>' : '') + '</div>';
  var sugR = PETS_RESTR.map(function(s){ return pe ? s : s.replace(' (PETAR)', ''); }).filter(function(s){ return d.restr.indexOf(s) < 0; });
  h += '<div class="ipw-sec"><h3>Restricciones</h3>' + _ipwCampo('pets-restr', 'Lo que no se hace (una por línea)', d.restr.join('\n'), { c:'restr', t:'lineas', area:true, filas:5 }) +
    (sugR.length ? '<div class="ipw-chips" data-ipw-edita>' + sugR.map(function(s, i){ return '<button type="button" class="ipw-chip ipw-sugc" data-pets-rsg="' + i + '">＋ ' + esc(s) + '</button>'; }).join('') + '</div>' : '') + '</div>';
  h += '<div class="ipw-sec"><h3>Registros y formatos relacionados</h3>' + _ipwChips(ed, 'regs', PETS_REGS.map(function(s){ return pe ? s : s.replace(' (PETAR)', ''); }), 'Check list de la excavadora…') + '</div>';
  ed._sugR = sugR;
  return h;
}
function _petsProcEnchufar(ed, c, bloq){
  var d = ed.d, re = function(){ _ipwTab(); };
  if(bloq) return;
  _ipwFilasEnchufar(ed, c, re);
  _ipwChipsEnchufar(ed, c, re);
  $('pets-pl-mas').onclick = function(){ d.pel.push({ p:'', r:'', c:'' }); _ipwCambio(ed); re(); var x = $('pets-pl-p-' + (d.pel.length - 1)); if(x) x.focus(); };
  $('pets-pl-ipl').onclick = petsTraerIpl;
  $('pets-ps-mas').onclick = function(){ if(d.pasos.length >= PETS_TOPE) return toast('Llegaste al tope de ' + PETS_TOPE + ' pasos'); d.pasos.push({ t:'', rie:'', ctl:'' }); _ipwCambio(ed); re(); var x = $('pets-ps-t-' + (d.pasos.length - 1)); if(x) x.focus(); };
  Array.prototype.forEach.call(c.querySelectorAll('[data-pets-rsg]'), function(b){ b.onclick = function(){ var s = (ed._sugR || [])[+b.getAttribute('data-pets-rsg')]; if(s && d.restr.indexOf(s) < 0) d.restr.push(s); _ipwCambio(ed); re(); }; });
}
/* los peligros del IPERC de línea base: se eligen los de esta tarea */
function petsTraerIpl(){
  var ed = IPW.ed, d = ed.d;
  ipwTraer('ipl', false).then(function(L){
    if(!L.length){ toast('Esta obra todavía no tiene IPERC de línea base'); return; }
    var x = (d.ipl && L.filter(function(y){ return String(y._fila) === String(d.ipl.id); })[0]) || L[0], marcados = {};
    var pinta = function(q){
      /* cada palabra (de 3 letras o más) tiene que estar, en cualquier orden; si con el nombre de la tarea no sale nada, salen todos */
      var pal = ipNorm(q).split(' ').filter(function(w){ return w.length > 2; }), todos = x.filas.filter(function(f){ return !iplFilaVacia(f); });
      var F = todos.filter(function(f){ var t = ipNorm([f.proc, f.act, f.tar, f.pel, f.rie].join(' ')); return pal.every(function(w){ return t.indexOf(w) > -1; }); });
      var nada = !F.length && q === d.tit; if(nada) F = todos;
      $('pets-ti-lista').innerHTML = (nada && F.length ? '<p class="gris-t" style="margin:4px">Ninguno dice «' + esc(q) + '»: estos son todos los del IPERC.</p>' : '') + (F.length ? F.map(function(f){
        return '<label><input type="checkbox" data-id="' + esc(f.id) + '"' + (marcados[f.id] ? ' checked' : '') + '><span><b>' + esc(f.pel) + '</b><small>' + esc([f.act, f.tar].filter(Boolean).join(' · ')) + '</small><small>' + esc(f.rie) + '</small></span></label>';
      }).join('') : '<p class="gris-t" style="margin:4px">' + (todos.length ? 'Nada con «' + esc(q) + '».' : 'Este IPERC todavía no tiene peligros.') + '</p>');
      Array.prototype.forEach.call(document.querySelectorAll('#pets-ti-lista input'), function(i){ i.onchange = function(){ marcados[i.getAttribute('data-id')] = i.checked; }; });
    };
    abrirHoja('Traer peligros del IPERC', x.tit + (x.cod ? ' · ' + x.cod : ''),
      (L.length > 1 ? _ipwCampo('pets-ti-ipl', 'IPERC', String(x._fila), { opc:L.map(function(y){ return [String(y._fila), y.tit + (y.cod ? ' · ' + y.cod : '')]; }) }) : '') +
      _ipwCampo('pets-ti-q', 'Buscar la actividad o la tarea', d.tit, { max:80 }) + '<div class="ipw-sugs" id="pets-ti-lista"></div>',
      '<button type="button" class="bt sec" id="pets-ti-no">Cancelar</button><button type="button" class="bt" id="pets-ti-ok">Traer los marcados</button>', { ancha:true });
    $('pets-ti-no').onclick = cerrarHoja;
    var q = $('pets-ti-q'); q.oninput = function(){ pinta(q.value); }; pinta(q.value);
    var s = $('pets-ti-ipl'); if(s) s.onchange = function(){ x = L.filter(function(y){ return String(y._fila) === s.value; })[0] || x; marcados = {}; pinta(q.value); };
    $('pets-ti-ok').onclick = function(){
      var nuevos = x.filas.filter(function(f){ return marcados[f.id]; }).map(function(f){
        var c = IPL_CTL.filter(function(k){ return f.ctl[k[0]]; }).map(function(k){ return f.ctl[k[0]].split('\n').join('; '); }).join('; ');
        return { p:f.pel, r:f.rie, c:ipArea(c, 700) };
      });
      if(!nuevos.length){ toast('Marca al menos uno'); return; }
      d.pel = d.pel.concat(nuevos).slice(0, 60);
      if(!d.ipl) d.ipl = { id:String(x._fila), cod:x.cod, tit:x.tit };
      _ipwCambio(ed); cerrarHoja(); _ipwTab(); toast(nuevos.length + (nuevos.length === 1 ? ' peligro traído' : ' peligros traídos'));
    };
  }, function(){ toast('No se pudo traer el IPERC. Revisa tu conexión.'); });
}

/* ══ LAS FIRMAS (las mismas para los dos) ══ */
function _ipwFirmas(ed){
  var T = IPETS_T[ed.k], d = ed.d, est = ipetsEstado(d, T.roles), apr = est === 'apr' || est === 'pub', bloq = !!_ipwBloqueo(ed);
  var h = '<p class="ayuda" style="margin:0 0 14px">' + (ed.k === 'ipl' ? 'Elabora, revisa y aprueba: ' : 'Las firmas del PETS (preparado, revisado, revisado y aprobado): ') +
    'cada uno firma aquí, en la pantalla (con el mouse, el dedo o el lápiz), o en el papel impreso. Con la primera firma el contenido ya no se cambia; «Aprobado por» firma al final.</p><div class="ipw-firmas">';
  T.roles.forEach(function(r){
    var f = d.firmas[r[0]] || {}, ok = ipFirmada(f), otros = T.roles.every(function(x){ return x[0] === 'apr' || ipFirmada(d.firmas[x[0]]); }), puede = !apr && (r[0] !== 'apr' || otros);
    h += '<div class="ipw-firma" data-rol="' + r[0] + '"><h3>' + esc(r[1]) + '</h3>';
    if(ok){
      h += '<p style="margin:0"><b>' + esc(f.n) + '</b>' + (f.c ? '<br><span class="gris-t">' + esc(f.c) + '</span>' : '') + '</p>' +
        (f.tr && typeof atsFirmaImg === 'function' ? '<img alt="' + esc('Firma de ' + f.n) + '" src="' + atsFirmaImg(f.tr, 260) + '">' : '<p class="ayuda">Firmó en el papel impreso.</p>') +
        '<p class="ya">✓ Firmó el ' + esc(ipDma(f.f)) + '</p>' + (!apr ? '<div class="acciones"><button type="button" class="bt sec chico" data-ipw-fquita="' + r[0] + '">Quitar esta firma</button></div>' : '');
    }else{
      h += _ipwCampo('ipw-fn-' + r[0], 'Nombres y apellidos', f.n, { c:'firmas.' + r[0] + '.n', max:100 }) + _ipwCampo('ipw-fc-' + r[0], 'Cargo', f.c, { c:'firmas.' + r[0] + '.c', max:90 });
      h += puede ? '<div class="acciones"><button type="button" class="bt chico" data-ipw-firmar="' + r[0] + '">Firmar en la pantalla</button><button type="button" class="bt sec chico" data-ipw-papel="' + r[0] + '">Firmó en papel</button></div><div data-ipw-lienzo="' + r[0] + '"></div>'
                 : '<p class="ayuda">Firma después de los demás.</p>';
    }
    h += '</div>';
  });
  h += '</div>';
  if(ed.k === 'pets'){
    h += '<div class="ipw-sec" style="margin-top:22px"><h3>Trabajadores que participaron en su elaboración</h3><p class="ayuda" style="margin:0 0 10px">Van en el PDF, cada uno con el espacio para su firma.</p><div class="ipw-filas">';
    d.part.forEach(function(x, i){
      h += '<div class="ipw-fila" style="grid-template-columns:minmax(0,1.4fr) 120px minmax(0,1fr) auto">' + _ipwCampo('pets-pa-n-' + i, 'Nombres y apellidos', x.n, { c:'part.' + i + '.n', max:100 }) +
        _ipwCampo('pets-pa-d-' + i, ((IPW.ctx || {}).pais || 'pe') === 'pe' ? 'DNI' : 'Documento', x.dni, { c:'part.' + i + '.dni', max:20 }) + _ipwCampo('pets-pa-c-' + i, 'Cargo o puesto', x.c, { c:'part.' + i + '.c', max:90 }) +
        (bloq ? '' : _ipwFilasBotones('part', i, d.part.length)) + '</div>';
    });
    if(!d.part.length) h += '<p class="gris-t" style="font-size:13px; margin:0">Todavía nadie. En el PDF salen líneas en blanco para llenarlas a mano.</p>';
    h += '</div>' + (bloq ? '' : '<button type="button" class="bt sec chico" id="pets-pa-mas" style="margin-top:10px">＋ Agregar a un trabajador</button>') + '</div>';
  }
  return h;
}
function _ipwFirmasEnchufar(ed, c, bloq){
  var T = IPETS_T[ed.k], d = ed.d, re = function(){ _ipwEditor(); };
  T.roles.forEach(function(r){ var inp = $('ipw-fn-' + r[0]); if(inp && typeof sugGente === 'function') sugGente(inp, { alElegir:function(t){ var cc = $('ipw-fc-' + r[0]); if(cc && !cc.value && t.puesto){ cc.value = t.puesto; d.firmas[r[0]].c = t.puesto; _ipwCambio(ed); } } }); });
  if(ed.k === 'pets'){
    if(bloq) Array.prototype.forEach.call(c.querySelectorAll('[id^="pets-pa-"]'), function(x){ x.disabled = true; });
    else {
      _ipwFilasEnchufar(ed, c, function(){ _ipwTab(); });
      var mas = $('pets-pa-mas'); if(mas) mas.onclick = function(){ d.part.push({ n:'', dni:'', c:'' }); _ipwCambio(ed); _ipwTab(); var x = $('pets-pa-n-' + (d.part.length - 1)); if(x) x.focus(); };
      d.part.forEach(function(p, i){ var inp = $('pets-pa-n-' + i); if(inp && typeof sugGente === 'function') sugGente(inp, { alElegir:function(t){ var dn = $('pets-pa-d-' + i), cc = $('pets-pa-c-' + i); if(dn && !dn.value && t.dni){ dn.value = t.dni; d.part[i].dni = t.dni; } if(cc && !cc.value && t.puesto){ cc.value = t.puesto; d.part[i].c = t.puesto; } _ipwCambio(ed); } }); });
    }
  }
  var lee = function(rol){ var f = d.firmas[rol] || {}; return { n:ipTx(($('ipw-fn-' + rol) || {}).value || f.n, 100), c:ipTx(($('ipw-fc-' + rol) || {}).value || f.c, 90) }; };
  var falta = function(rol, x){ if(x.n.length >= 3) return false; var m = $('ipw-fn-' + rol); toast('Escribe el nombre de quien firma'); if(m) m.focus(); return true; };
  /* firmar: lo escrito se guarda primero (lo que se firma es lo guardado) */
  var guardaFirma = function(rol, firma, aviso){
    var antes = ed.sucio ? _ipwGuardar(ed, true) : Promise.resolve(true);
    antes.then(function(ok){
      if(!ok) return toast('Primero tiene que guardarse lo escrito: revisa tu conexión');
      d.firmas[rol] = firma; ed.sucio = true;
      return _ipwGuardar(ed, true).then(function(v){ if(v){ toast(aviso); re(); } });
    });
  };
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipw-firmar]'), function(b){ b.onclick = function(){
    var rol = b.getAttribute('data-ipw-firmar'), x = lee(rol); if(falta(rol, x)) return;
    var caja = c.querySelector('[data-ipw-lienzo="' + rol + '"]');
    caja.innerHTML = '<div class="lienzo"><canvas></canvas><div class="guia"></div><div class="pista">Firma aquí con el mouse, el dedo o el lápiz</div></div><p class="msg" id="ipw-fm-' + rol + '"></p>' +
      '<div class="acciones"><button type="button" class="bt sec chico" id="ipw-fb-' + rol + '">Borrar y repetir</button><button type="button" class="bt sec chico" id="ipw-fx-' + rol + '">No firmar</button><button type="button" class="bt chico" id="ipw-fs-' + rol + '" disabled>Guardar la firma</button></div>';
    var candado = function(){ var s = $('ipw-fs-' + rol); if(s) s.disabled = lienzoPuntos() < 12; };
    setTimeout(function(){ prepLienzo(caja.querySelector('.lienzo'), 150, candado); }, 20);
    $('ipw-fb-' + rol).onclick = function(){ prepLienzo(caja.querySelector('.lienzo'), 150, candado); candado(); };
    $('ipw-fx-' + rol).onclick = function(){ caja.innerHTML = ''; };
    $('ipw-fs-' + rol).onclick = function(){
      var tr = atsNorm(LIENZO.trazos), x2 = lee(rol);
      if(!tr || lienzoPuntos() < 12){ $('ipw-fm-' + rol).className = 'msg mal'; $('ipw-fm-' + rol).textContent = 'Esa firma está vacía.'; return; }
      this.disabled = true;
      guardaFirma(rol, { n:x2.n, c:x2.c, f:hoyISO(), tr:tr, t:Date.now(), por:String((TOK && TOK.correo) || '').slice(0, 80) }, r1(rol) + ': firmado');
    };
  }; });
  var r1 = function(rol){ var r = T.roles.filter(function(x){ return x[0] === rol; })[0]; return r ? r[1] : 'Firma'; };
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipw-papel]'), function(b){ b.onclick = function(){
    var rol = b.getAttribute('data-ipw-papel'), x = lee(rol); if(falta(rol, x)) return;
    var caja = c.querySelector('[data-ipw-lienzo="' + rol + '"]');
    caja.innerHTML = '<div class="campo" style="margin-top:10px"><label for="ipw-fp-' + rol + '">¿Cuándo firmó en el papel?</label><input id="ipw-fp-' + rol + '" type="date" value="' + hoyISO() + '" max="' + hoyISO() + '"></div>' +
      '<p class="ayuda">Guarda el papel firmado: si lo escaneas, súbelo en «Documentos».</p><div class="acciones"><button type="button" class="bt sec chico" id="ipw-fpx-' + rol + '">Cancelar</button><button type="button" class="bt chico" id="ipw-fps-' + rol + '">Guardar</button></div>';
    $('ipw-fpx-' + rol).onclick = function(){ caja.innerHTML = ''; };
    $('ipw-fps-' + rol).onclick = function(){
      var f = ipFecha($('ipw-fp-' + rol).value), x2 = lee(rol); if(!f){ toast('Elige la fecha'); return; }
      this.disabled = true;
      guardaFirma(rol, { n:x2.n, c:x2.c, f:f, tr:null, t:Date.now(), por:String((TOK && TOK.correo) || '').slice(0, 80) }, r1(rol) + ': firmado en papel');
    };
  }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-ipw-fquita]'), function(b){ b.onclick = function(){
    var rol = b.getAttribute('data-ipw-fquita'), f = d.firmas[rol] || {};
    confirmar('¿Quitar la firma de ' + (f.n || 'esta persona') + '?', 'Se quita su firma (queda su nombre y su cargo). Si ya nadie firmó, el documento vuelve a borrador y se puede cambiar.', { si:'Sí, quitarla', mal:true }).then(function(ok){
      if(!ok) return;
      d.firmas[rol] = { n:f.n || '', c:f.c || '' }; ed.sucio = true;
      _ipwGuardar(ed, true).then(function(v){ if(v){ toast('Firma quitada'); re(); } });
    });
  }; });
}

/* ══ LAS VERSIONES: el control de cambios y la publicación en «Documentos» ══ */
function _ipwVersiones(ed){
  var T = IPETS_T[ed.k], d = ed.d, est = ipetsEstado(d, T.roles), apr = d.firmas.apr || {}, H = ipetsHistVigente(d);
  var h = '<div class="ipw-sec"><h3>Versión ' + esc(d.ver) + '</h3>';
  if(est === 'pub'){
    h += '<div class="aviso ok"><b>Publicada en «Documentos ▸ ' + esc(T.carpetaN) + '»</b>' + (d.pub && d.pub.al ? ' el ' + esc(ipDma(String(d.pub.al).slice(0, 10))) : '') + ', como «' + esc((d.pub && d.pub.nombre) || ipetsNombreDoc(d, ed.k)) + '». ' +
      'Tu gente la ve en su app, la lee y firma (sus constancias llegan a «Inducción ▸ Documentos firmados»), y sale en el cartel QR' + (ed.k === 'ipl' ? ' de la matriz IPERC.' : ' de los procedimientos.') +
      '<div class="acciones"><button type="button" class="bt sec chico" id="ipw-v-docs">Ir a «Documentos»</button><button type="button" class="bt sec chico" id="ipw-v-pub">Publicarla otra vez</button><button type="button" class="bt sec chico" id="ipw-v-nver">Abrir la versión ' + esc(ipVerSig(d.ver)) + '</button></div></div>';
  }else if(est === 'apr'){
    h += '<div class="aviso ok"><b>Aprobada' + (apr.f ? ' el ' + esc(ipDma(apr.f)) : '') + '.</b> Publícala: su PDF va a «Documentos ▸ ' + esc(T.carpetaN) + '», donde tu gente la lee y firma en su celular, y al cartel QR' + (ed.k === 'ipl' ? ' de la matriz IPERC.' : ' de los procedimientos.') +
      (d.pub ? ' La versión ' + esc(d.pub.ver) + ' sale de la carpeta (sus constancias de lectura se quedan).' : '') +
      '<div class="acciones"><button type="button" class="bt chico" id="ipw-v-pub">Publicar en «Documentos»</button><button type="button" class="bt sec chico" id="ipw-v-nver">Abrir la versión ' + esc(ipVerSig(d.ver)) + '</button></div></div>';
  }else{
    var F = ipetsFaltan(d, T.roles);
    h += '<p class="ayuda" style="margin:0">' + (est === 'firmas' ? 'En firmas. Faltan: ' + esc(F.map(function(r){ return r[1].toLowerCase(); }).join(', ')) + '.' : 'Borrador.') +
      ' Cuando «Aprobado por» firme, la publicas aquí en «Documentos».' + (d.pub ? ' Mientras tanto, en «Documentos» sigue la versión ' + esc(d.pub.ver) + '.' : '') + '</p>';
  }
  if(ed.k === 'ipl' && apr.f){
    var y = +apr.f.slice(0, 4) + 1, prox = y + apr.f.slice(4);
    h += '<p class="ayuda">Próxima actualización: antes del ' + esc(ipDma(prox)) + ' (una vez al año como mínimo), y antes si cambian las condiciones de trabajo o si ocurre un accidente.</p>';
  }
  h += '</div><div class="ipw-sec"><h3>Control de cambios</h3><div class="ipw-tabla"><table class="ipw-hist"><thead><tr><th>Versión</th><th>Qué cambió</th><th>Aprobada el</th><th>Aprobada por</th><th>PDF</th></tr></thead><tbody>' +
    H.slice().reverse().map(function(x){ return '<tr><td><b>' + esc(x.ver) + '</b></td><td>' + esc(x.cambio || '—') + '</td><td>' + esc(ipDma(x.fecha) || '—') + '</td><td>' + esc(x.apr || '—') + '</td><td>' + (x.url ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">Ver</a>' : '—') + '</td></tr>'; }).join('') +
    '</tbody></table></div></div>';
  return h;
}
function _ipwVersionesEnchufar(ed, c){
  var p = $('ipw-v-pub'); if(p) p.onclick = ipwPublicar;
  var n = $('ipw-v-nver'); if(n) n.onclick = ipwNuevaVersion;
  var g = $('ipw-v-docs'); if(g) g.onclick = function(){ navegar('docs'); };
}
function ipwPublicar(){
  var ed = IPW.ed, T = IPETS_T[ed.k], d = ed.d, est = ipetsEstado(d, T.roles);
  if(est !== 'apr' && est !== 'pub'){ toast('Primero tiene que firmar «Aprobado por»'); return; }
  var viejo = d.pub || null;
  dialogo({ titulo:'¿Publicar la versión ' + d.ver + ' en «Documentos»?',
    texto:'Su PDF va a la carpeta «' + T.carpetaN + '» de la obra: tu gente lo ve en su app, lo lee y firma, y sale en el cartel QR' + (ed.k === 'ipl' ? ' de la matriz IPERC' : ' de los procedimientos') + '.' +
      (viejo ? (viejo.ver === d.ver ? ' Reemplaza al que ya estaba publicado.' : ' La versión ' + viejo.ver + ' sale de la carpeta; sus constancias de lectura se quedan.') : ''),
    si:'Publicar', no:'Cancelar' }).then(function(ok){
    if(ok !== true) return;
    _ipwMsg('Armando el PDF y subiéndolo…', 'gris');
    var listo = (typeof cargarEvPDF === 'function') ? cargarEvPDF() : Promise.resolve(true), url = '', nom = '';
    (ed.sucio ? _ipwGuardar(ed, true) : Promise.resolve(true)).then(function(g){
      if(!g) return Promise.reject('sin_guardar');
      return Promise.all([listo, ipwCtx(true)]);
    }).then(function(r){
      var C = r[1], dd = T.limpio(d); nom = ipetsNombreDoc(dd, ed.k);
      var blob = T.pdf(dd, C).output('blob'), file;
      try{ file = new File([blob], nombreArchivo(nom) + '.pdf', { type:'application/pdf' }); }catch(e){ file = blob; file.name = nombreArchivo(nom) + '.pdf'; }
      return subirArchivoP('docs', file);
    }).then(function(u){
      url = u;
      return _ipwEscribir('POST', 'sst_doc', { empresa:YO.obra.id, hoja:T.carpeta, nombre:nom, url:url, nota:'Armado en OBRASST · versión ' + d.ver + ((d.firmas.apr || {}).f ? ' · aprobada el ' + ipDma(d.firmas.apr.f) : '') });
    }).then(function(rows){
      var row = Array.isArray(rows) ? rows[0] : null; if(!row || !row.id) return Promise.reject({ status:403 });
      var quita = (viejo && viejo.id && String(viejo.id) !== String(row.id)) ? sbDelP('sst_doc?id=eq.' + _enc(viejo.id)).catch(function(){ return null; }) : Promise.resolve(null);
      return quita.then(function(){
        d.pub = { id:String(row.id), url:url, ver:d.ver, al:new Date().toISOString(), nombre:nom };
        d.hist = ipetsHistVigente(d);
        ed.sucio = true;
        return _ipwGuardar(ed, true);
      });
    }).then(function(v){
      if(!v) return;
      toast('Publicado en «Documentos ▸ ' + T.carpetaN + '»');
      _ipwEditor();
    }).catch(function(e){ _ipwMsg(e === 'sin_guardar' ? 'Primero tiene que guardarse lo escrito: revisa tu conexión.' : 'No se pudo publicar: ' + _ipwMotivo(e).charAt(0).toLowerCase() + _ipwMotivo(e).slice(1), 'mal'); });
  });
}
