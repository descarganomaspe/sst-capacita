/* OBRASST · portal/alto-riesgo.js — los trabajos de alto riesgo, por la web (27/10/2026)
   Se pide al abrir «Trabajos de alto riesgo» (index: cargarAlto / altoIr). La base (ALTO-BASE) es la de la app, tal cual:
   la arma parches/altoriesgo/armar_web.py y herr/copias.py vigila que siga igual. */
/* >>> ALTO-BASE-INI (27/10/2026 · se edita aquí, en la app; su copia va en portal/alto-riesgo.js y herr/copias.py la revisa) <<< */
/* ══ LOS TRABAJOS DE ALTO RIESGO ════════════════════════════════════════════════════════════════════════════════════
   Marcelo (27/10/2026): «sobre el tema de espacio confinado, cuántas veces hay que recircular el aire en un tanque o algo
   así, su fórmula y todo, eso podríamos colocar para los trabajadores y los supervisores en la app/web… una sección de los
   trabajos de alto riesgo».
   La sección junta, por tipo de trabajo, lo que la app ya trae (el PETAR, la caída libre, el plan de izaje, el bloqueo) y
   las calculadoras nuevas. La primera: cuánto ventilar un espacio confinado antes de medir y entrar.

   LA CUENTA DE LA VENTILACIÓN (solo de fuentes oficiales, consultadas el 27/10/2026)
   · CDC, «Guidelines for Environmental Infection Control in Health-Care Facilities», apéndice B (tabla B.1): el tiempo para
     bajar lo que hay en el aire con ventilación por dilución es t = −ln(C2/C1) / (Q/V) × 60 minutos, con Q/V = renovaciones
     por hora, si la mezcla fuera perfecta (2 renovaciones por hora → 138 min para el 99 % y 207 min para el 99,9 %).
   · OSHA Technical Manual, sección III, capítulo 3, apéndice III:3-1: la mezcla nunca es perfecta; el factor de mezcla K va
     de 2 a 5, y 2 es lo óptimo. Con él: t = K × (V/Q) × ln(C1/C2) y las renovaciones necesarias son K × ln(C1/C2).
   · OSHA 29 CFR 1910.146: atmósfera peligrosa = inflamables sobre el 10 % del límite inferior, oxígeno bajo 19,5 % o sobre
     23,5 % (b); se mide, en este orden, oxígeno, inflamables y tóxicos (c)(5)(ii)(C); la ventilación forzada sigue mientras
     haya alguien adentro, va a donde se trabaja y toma aire de una fuente limpia (c)(5)(ii)(E).
   · INSST (España), NTP 223 «Trabajos en recintos confinados»: nunca se ventila con oxígeno; si el gas pesa más que el aire,
     la extracción va al fondo; si pesa igual o menos, se insufla al fondo y sale por arriba.
   El caudal que vale es el del ventilador con su manga puesta (la curva del fabricante): cada metro y cada codo le quitan. */
var AR_TIPOS = [
  { k:'confinado', ic:'🕳️', n:'Espacio confinado', d:'Tanques, cisternas, buzones, pozos, ductos: el aire se mide y se ventila antes de entrar.' },
  { k:'altura',    ic:'🧗', n:'Trabajo en altura', d:'Desde 1,8 m: el anclaje, la línea, el absorbedor y el espacio para detener la caída.' },
  { k:'izaje',     ic:'🏗️', n:'Izaje', d:'La carga, la grúa y sus aparejos, la zona de exclusión y el rigger.' },
  { k:'excavacion',ic:'⛏️', n:'Excavación', d:'El talud o el entibado, el borde libre, los accesos y lo que hay bajo tierra.' },
  { k:'caliente',  ic:'🔥', n:'Trabajo en caliente', d:'Soldadura y corte: lo que puede arder alrededor, el extintor y el vigía.' },
  { k:'electrico', ic:'⚡', n:'Trabajo eléctrico', d:'Cortar, bloquear, etiquetar y comprobar que no hay tensión antes de tocar.' }
];
/* las formas del espacio: el volumen en m³ */
var VEN_FORMAS = [
  { k:'cil',  n:'Tanque o pozo cilíndrico', campos:[['d', 'Diámetro'], ['l', 'Largo o alto']] },
  { k:'rect', n:'Rectangular', sub:'cisterna, cámara, buzón', campos:[['a', 'Largo'], ['b', 'Ancho'], ['h', 'Alto']] },
  { k:'vol',  n:'Ya sé el volumen', campos:[['v', 'Volumen']] }
];
/* el caudal del ventilador: a m³ por minuto */
var VEN_UNID = [['m3min', 'm³/min', 1], ['cfm', 'CFM (pies³/min)', 0.028316846592], ['m3h', 'm³/h', 1/60]];
/* la mezcla: K de 2 a 5, 2 es lo óptimo (OSHA Technical Manual) */
var VEN_MEZCLA = [
  { k:2, n:'Buena', d:'El aire entra por una manga hasta el fondo y sale por otra boca: barre todo el espacio.' },
  { k:3, n:'Regular', d:'Barre casi todo, pero quedan rincones o la manga no llega al fondo.' },
  { k:5, n:'Mala', d:'Una sola boca, divisiones, recovecos o el aire entra cerca de donde sale.' }
];
/* cuánto bajar lo que haya en el aire */
var VEN_META = [['p99', '99 % menos', 0.01], ['p999', '99,9 % menos', 0.001], ['med', 'De una medición a otra', null]];
function venNum(v){ var n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return (isFinite(n) && n > 0) ? n : null; }
/* el volumen de la forma elegida (m³), o null si falta un dato o no tiene sentido */
function venVolumen(forma, x){
  x = x || {};
  var d = venNum(x.d), l = venNum(x.l), a = venNum(x.a), b = venNum(x.b), h = venNum(x.h), v = venNum(x.v), M = 500;
  if(forma === 'cil') return (d && l && d <= M && l <= M) ? Math.PI * (d / 2) * (d / 2) * l : null;
  if(forma === 'rect') return (a && b && h && a <= M && b <= M && h <= M) ? a * b * h : null;
  return (v && v <= 1e6) ? v : null;
}
function venCaudal(valor, unid){
  var q = venNum(valor), u = VEN_UNID.filter(function(x){ return x[0] === unid; })[0] || VEN_UNID[0];
  return (q && q <= 1e6) ? q * u[2] : null;
}
/* la cuenta: o = { V (m³), Q (m³/min), K, meta:'p99'|'p999'|'med', c1, c2 } */
function venCalcular(o){
  o = o || {};
  var V = venNum(o.V), Q = venNum(o.Q), K = [2, 3, 5].indexOf(+o.K) > -1 ? +o.K : 2;
  if(!V || !Q) return { mal:'faltan' };
  var r;
  if(o.meta === 'med'){
    var c1 = venNum(o.c1), c2 = venNum(o.c2);
    if(!c1 || !c2) return { mal:'medicion' };
    if(c2 >= c1) return { mal:'meta' };
    r = c2 / c1;
  } else r = (VEN_META.filter(function(x){ return x[0] === o.meta; })[0] || VEN_META[1])[2];
  var porRen = V / Q, ach = Q * 60 / V, lnr = Math.log(1 / r);
  var ren = K * lnr, t = ren * porRen, tIdeal = lnr * porRen;
  return { V:V, Q:Q, K:K, r:r, ach:ach, porRen:porRen, ren:ren, t:t, tIdeal:tIdeal, min:Math.max(1, Math.ceil(t - 1e-9)), largo:t > 1440 };
}
/* los números como en el resto de la app: coma decimal, y de 5 cifras para arriba con espacio entre los miles */
function venFmt(n, dec){
  if(n == null || !isFinite(n)) return '—';
  dec = (dec == null) ? 1 : dec;
  var p = Math.pow(10, dec), v = Math.round(Math.abs(n) * p) / p, e = v.toFixed(dec);
  if(dec > 0) e = e.replace(/0+$/, '').replace(/\.$/, '');
  e = e.split('.');
  var ent = e[0].length > 4 ? e[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : e[0];
  return (n < 0 && v ? '−' : '') + ent + (e[1] ? ',' + e[1] : '');
}
function venPct(r){ var p = (1 - r) * 100; return venFmt(p, p >= 99.95 ? 2 : 1) + ' %'; }
/* el texto para compartir (WhatsApp) */
function venTexto(R, d){
  d = d || {};
  return 'Ventilación de un espacio confinado (OBRASST)\n' +
    (d.lugar ? 'Espacio: ' + d.lugar + '\n' : '') +
    'Volumen: ' + venFmt(R.V) + ' m³ · ventilador: ' + venFmt(R.Q) + ' m³/min (' + venFmt(R.ach, 0) + ' renovaciones por hora)\n' +
    'Mezcla: K = ' + R.K + ' · para bajar lo que haya ' + venPct(R.r) + ': ' + venFmt(R.ren) + ' renovaciones\n' +
    '➡️ Ventilar al menos ' + R.min + ' min antes de medir.\n' +
    'Después, medir en este orden: oxígeno, inflamables y tóxicos. Es peligroso con oxígeno bajo 19,5 % o sobre 23,5 %, o con inflamables sobre el 10 % del límite inferior (OSHA 29 CFR 1910.146). La ventilación sigue mientras haya alguien adentro. Nunca se ventila con oxígeno.';
}
/* las reglas que acompañan el resultado, con su fuente */
var VEN_REGLAS = [
  { t:'Después de ventilar, mide en este orden: oxígeno, inflamables y tóxicos.', f:'OSHA 29 CFR 1910.146 (c)(5)(ii)(C)' },
  { t:'Es una atmósfera peligrosa con oxígeno bajo 19,5 % o sobre 23,5 %, o con inflamables sobre el 10 % de su límite inferior.', f:'OSHA 29 CFR 1910.146 (b)' },
  { t:'La ventilación sigue mientras haya alguien adentro, dirigida a donde se trabaja y con aire de una fuente limpia.', f:'OSHA 29 CFR 1910.146 (c)(5)(ii)(E)' },
  { t:'Nunca ventiles con oxígeno. Si el gas pesa más que el aire (el H₂S, el CO₂), la extracción va al fondo; si pesa igual o menos, el aire se insufla al fondo y sale por arriba.', f:'INSST, NTP 223' }
];
var VEN_FUENTE = 'La cuenta: tiempo = K × (volumen ÷ caudal) × ln(C₁ ÷ C₂). Con mezcla perfecta (K = 1) es la fórmula del CDC (apéndice B de su guía de control ambiental); K va de 2 a 5 y 2 es lo óptimo (OSHA Technical Manual, sección III, capítulo 3).';
/* ══ LAS OTRAS HERRAMIENTAS DE CADA TRABAJO (27/10/2026) ═══════════════════════════════════════════════════════════
   Una por tipo, además de la ventilación. Las cuentas y los límites salen de la norma (consultada el 27/10/2026); la
   app y la web dibujan lo mismo con su propio estilo (arForm y arResultado reciben las clases de cada una).
   · Altura · el factor de caída: INSST (España), NTP 1170 «Utilización de EPI en trabajos con riesgo de caída de
     altura»: es la relación entre la distancia de caída y el largo de la línea, y «siempre que sea posible, hay que
     trabajar con un FC = 0», con el anclaje por encima. La caída libre, como en la calculadora de caída libre: largo de
     la línea + altura del anillo D − altura del anclaje, medidas desde los pies (nunca menos de 0). OSHA 29 CFR 1926.502:
     anclaje de 22,2 kN (5000 lb) por persona (d)(15); fuerza de detención de 8 kN como máximo con arnés (d)(16)(ii);
     caída libre de 1,8 m como máximo (d)(16)(iii); rescate rápido (d)(20).
   · Izaje · la carga en cada ramal: con dos ramales iguales (o una canasta) y la carga centrada, cada uno lleva
     peso ÷ (2 × seno del ángulo con la horizontal). Es lo que dicen las tablas de OSHA («Guidance on Safe Sling Use»): la
     capacidad a 60°, 45° y 30° es la vertical por el seno del ángulo; no se usan eslingas a menos de 30° con la
     horizontal; con más ramales o una carga que no está centrada, lo calcula una persona calificada.
   · Excavación · el talud, el borde y las escaleras: OSHA 29 CFR 1926, subparte P. Apéndice B, tabla B-1: roca estable
     vertical (90°), tipo A ¾:1 (53°), tipo B 1:1 (45°), tipo C 1½:1 (34°); tipo A abierta 24 h o menos y de hasta
     3,67 m: ½:1 (63°); de más de 6,1 m (20 pies), lo diseña un ingeniero colegiado (registered professional engineer).
     Sin clasificar el suelo, 1½:1 (1926.652(b)(1)(i)). Los tipos de suelo, del apéndice A. Protección desde 1,52 m
     (1926.652(a)(1)); salida a no más de 7,62 m de recorrido desde 1,22 m (1926.651(c)(2)); el aire se mide pasando de
     1,22 m si puede haber una atmósfera peligrosa (1926.651(g)(1)(i)); el material y los equipos a 0,61 m del borde
     como mínimo (1926.651(j)(2)); inspección diaria por una persona competente (1926.651(k)(1)).
   · Trabajo en caliente: OSHA 29 CFR 1910.252(a): lo combustible a 10,7 m (35 pies) donde se pueda (a)(2)(vii); lo que no
     se mueve, con protecciones (a)(1)(ii); el extintor listo (a)(2)(ii); vigía si hay combustible a menos de 10,7 m, si
     prende fácil con chispas aunque esté más lejos, si hay aberturas en pisos o paredes en ese radio o combustible al
     otro lado de una pared o techo metálico (a)(2)(iii)(A); el vigía se queda al menos media hora después (a)(2)(iii)(B);
     el área se revisa y se autoriza antes, de preferencia por escrito (a)(2)(iv). Los cilindros de oxígeno guardados, a
     6,1 m de los de gas combustible (o con una barrera no combustible de 1,5 m): 1910.253(b)(4)(iii).
   · Eléctrico · la distancia a una línea aérea: grúas y equipos de izaje, OSHA 29 CFR 1926.1408, tabla A (hasta 50 kV
     10 pies; hasta 200 kV 15; hasta 350 kV 20; hasta 500 kV 25; hasta 750 kV 35; hasta 1000 kV 45; más de 1000 kV, la
     fija la empresa eléctrica o un ingeniero); sin confirmar el voltaje, 20 pies (opción 2) hasta 350 kV y 50 pies de
     350 a 1000 kV (1926.1409). Personas y lo que llevan en la mano: 3,05 m hasta 50 kV y 10 cm más por cada 10 kV sobre
     50 kV (1910.333(c)(3)(i)(A); la norma usa el voltaje a tierra: con el de la línea, la distancia sale mayor). */
var AR_HERR = {
  ven:{ tipo:'confinado', ic:'🌬️', t:'Ventilación: cuánto ventilar antes de entrar', n:'Ventilación de un espacio confinado' },
  fac:{ tipo:'altura', ic:'📐', t:'Factor de caída: dónde anclarse', n:'Factor de caída', s:'Qué tan larga sería la caída libre con tu línea y tu anclaje, y si conviene anclarse más arriba.' },
  esl:{ tipo:'izaje', ic:'⛓️', t:'Eslingas: cuánto carga cada ramal', n:'Carga en cada ramal de las eslingas', s:'Con el peso de la carga y el ángulo de las eslingas: cuánto jala cada ramal y si la eslinga lo aguanta.' },
  exc:{ tipo:'excavacion', ic:'📏', t:'Talud, borde y escaleras', n:'Talud, borde y escaleras de una excavación', s:'Con la profundidad y el tipo de suelo: cuánto se abre el talud, cuántas escaleras van y lo que pide la norma.' },
  cal:{ tipo:'caliente', ic:'🧯', t:'Antes de soldar y el vigía de fuego', n:'Trabajo en caliente: antes y después', s:'Lo que se revisa antes de soldar o cortar, y la media hora del vigía de fuego cuando se termina.' },
  ele:{ tipo:'electrico', ic:'🔌', t:'Distancia a líneas eléctricas', n:'Distancia a una línea eléctrica aérea', s:'Cuánto alejar la grúa, la carga y a las personas de una línea con tensión, según su voltaje.' }
};
/* un número que puede ser 0 o negativo (la altura del anclaje, bajo los pies), o null */
function _arNum0(v){ var s = String(v == null ? '' : v).trim().replace(',', '.'); if(!/^-?\d*\.?\d+$/.test(s)) return null; var n = parseFloat(s); return isFinite(n) ? n : null; }
function _arM(n, dec){ return venFmt(n, dec == null ? 2 : dec) + ' m'; }

/* ── altura: el factor de caída ── */
function facCalcular(o){
  o = o || {};
  var L = venNum(o.l), D = venNum(o.d), A = _arNum0(o.a);
  if(!L || L > 4) return { mal:'linea' };
  if(A === null || A < -3 || A > 12) return { mal:'anclaje' };
  if(!D || D < 0.8 || D > 2.5) return { mal:'anillo' };
  var caida = Math.max(0, L + D - A), fc = caida / L;
  return { L:L, D:D, A:A, caida:caida, fc:fc, nivel:(fc <= 1e-9 ? 0 : (fc <= 1 + 1e-9 ? 1 : 2)), pasa:caida > 1.8 + 1e-9 };
}
var FAC_REGLAS = [
  { t:'El anclaje aguanta 22,2 kN (5000 libras) por cada persona enganchada.', f:'OSHA 29 CFR 1926.502 (d)(15)' },
  { t:'Con arnés, la fuerza que frena la caída no pasa de 8 kN (1800 libras).', f:'OSHA 29 CFR 1926.502 (d)(16)(ii)' },
  { t:'La caída libre no pasa de 1,8 m y nadie llega a golpear el nivel de abajo.', f:'OSHA 29 CFR 1926.502 (d)(16)(iii)' },
  { t:'Si alguien cae, el rescate es rápido: antes de subir ya se sabe quién lo baja y con qué.', f:'OSHA 29 CFR 1926.502 (d)(20)' }
];

/* ── izaje: la carga en cada ramal ── */
var ESL_UNID = [['kg', 'kg', 1], ['t', 't', 1000]];
function eslCalcular(o){
  o = o || {};
  var u = (ESL_UNID.filter(function(x){ return x[0] === o.u; })[0] || ESL_UNID[0]);
  var W = venNum(o.peso), n = (String(o.ram) === '1') ? 1 : 2, s, ang;
  if(!W || W * u[2] > 1e6) return { mal:'peso' };
  if(n === 1){ s = 1; ang = 90; }
  else if(o.modo === 'med'){
    var Lr = venNum(o.lr), H = venNum(o.h);
    if(!Lr || !H || Lr > 100 || H > 100) return { mal:'medidas' };
    if(H > Lr + 1e-9) return { mal:'alto' };
    s = Math.min(1, H / Lr); ang = Math.asin(s) * 180 / Math.PI;
  } else {
    ang = venNum(o.ang);
    if(!ang || ang > 90) return { mal:'angulo' };
    s = Math.sin(ang * Math.PI / 180);
  }
  var t = W / (n * s), cap = venNum(o.cap), uso = cap ? t / cap : null;
  return { u:u[0], W:W, n:n, ang:ang, s:s, factor:1 / s, t:t, cap:cap || null, uso:uso, bajo30:(n === 2 && ang < 30 - 1e-9), sobre:(uso !== null && uso > 1 + 1e-9) };
}
var ESL_REGLAS = [
  { t:'No se usan eslingas a menos de 30° con la horizontal: las tablas de capacidad llegan hasta 30°.', f:'OSHA, Guidance on Safe Sling Use' },
  { t:'Con 3 o 4 ramales, o si la carga no está centrada, cada ramal lo calcula una persona calificada: no siempre cargan parejo.', f:'OSHA, Guidance on Safe Sling Use' },
  { t:'La capacidad es la de la etiqueta de la eslinga para ese amarre: ahorcado o en canasta cambia.', f:'OSHA, Guidance on Safe Sling Use' }
];

/* ── excavación: el talud, el borde y las escaleras ── */
var EXC_SUELOS = [
  { k:'roca', n:'Roca estable', r:0, g:90, d:'Roca sólida que se puede excavar con las paredes verticales y que se queda entera.' },
  { k:'a', n:'Tipo A', r:0.75, g:53, d:'Suelo cohesivo de 144 kPa o más de resistencia a la compresión no confinada: arcilla, arcilla limosa o arenosa. No es tipo A si está fisurado, si vibra por el tránsito pesado o los pilotes, si ya fue removido o si sus capas caen hacia la zanja.' },
  { k:'b', n:'Tipo B', r:1, g:45, d:'Suelo cohesivo de más de 48 y menos de 144 kPa; granular sin cohesión, como grava angulosa, limo o franco arenoso; suelo ya removido; o el que sería tipo A, pero fisurado o con vibración.' },
  { k:'c', n:'Tipo C', r:1.5, g:34, d:'Suelo cohesivo de 48 kPa o menos; granular, como grava, arena o arena franca; suelo sumergido o con agua que filtra libremente.' },
  { k:'nose', n:'No sé', r:1.5, g:34, d:'Sin clasificar el suelo, el talud va a 1½ : 1 (34°), como en el tipo C.' }
];
function excPendiente(r){ return r === 0 ? 'vertical' : ({ 0.5:'½ : 1', 0.75:'¾ : 1', 1:'1 : 1', 1.5:'1½ : 1' }[r] || venFmt(r, 2) + ' : 1'); }
function excCalcular(o){
  o = o || {};
  var P = venNum(o.prof);
  if(!P || P > 30) return { mal:'prof' };
  var S = EXC_SUELOS.filter(function(x){ return x.k === o.suelo; })[0] || EXC_SUELOS[4];
  var r = S.r, g = S.g, corto = false;
  if(S.k === 'a' && o.corto && P <= 3.67 + 1e-9){ r = 0.5; g = 63; corto = true; }
  var F = venNum(o.fondo), L = venNum(o.largo), ret = r * P;
  var esc = P >= 1.22 - 1e-9;
  return { P:P, suelo:S.k, sn:S.n, r:r, g:g, corto:corto, ret:ret, fondo:F || null, arriba:F ? F + 2 * ret : null,
           largo:L || null, escaleras:(esc && L) ? Math.max(1, Math.ceil(L / 15.24 - 1e-9)) : null, esc:esc,
           proteccion:(S.k !== 'roca' && P >= 1.52 - 1e-9), sinProt:(S.k !== 'roca' && P < 1.52 - 1e-9),
           ingeniero:P > 6.1 + 1e-9, aire:P > 1.22 + 1e-9 };
}
var EXC_REGLAS = [
  { t:'El material que sale y los equipos, a 0,61 m del borde como mínimo.', f:'OSHA 29 CFR 1926.651 (j)(2)' },
  { t:'Una persona competente revisa la excavación, lo de alrededor y la protección cada día, antes de empezar.', f:'OSHA 29 CFR 1926.651 (k)(1)' },
  { t:'Si el talud da señales de falla, se corta más tendido: por lo menos ½ : 1 menos que el máximo.', f:'OSHA 29 CFR 1926, subparte P, apéndice B (c)(3)(ii)' },
  { t:'Con material, máquinas o tránsito cerca del borde, la persona competente decide cuánto más tendido va el talud.', f:'OSHA 29 CFR 1926, subparte P, apéndice B (c)(3)(iii)' }
];

/* ── trabajo en caliente: antes de soldar y el vigía ── */
var CAL_LISTA = [
  { k:'permiso', t:'El responsable revisó el área y dio la autorización por escrito (el permiso).', f:'OSHA 29 CFR 1910.252 (a)(2)(iv)' },
  { k:'mover', t:'Lo que puede arder se llevó a 10,7 m (35 pies) como mínimo, donde se pudo.', f:'OSHA 29 CFR 1910.252 (a)(2)(vii)' },
  { k:'cubrir', t:'Lo que no se pudo mover está protegido para que no le lleguen el calor, las chispas ni la escoria.', f:'OSHA 29 CFR 1910.252 (a)(1)(ii)' },
  { k:'extintor', t:'El extintor está listo para usarse al instante.', f:'OSHA 29 CFR 1910.252 (a)(2)(ii)' },
  { k:'vigia', t:'Hay vigía de fuego si queda algo que arde a menos de 10,7 m, si prende fácil con chispas aunque esté más lejos, si hay aberturas en pisos o paredes en ese radio, o si al otro lado de una pared o techo metálico hay algo que arde.', f:'OSHA 29 CFR 1910.252 (a)(2)(iii)(A)' },
  { k:'cilindros', t:'Los cilindros de oxígeno guardados están a 6,1 m de los de gas combustible y de la grasa o el aceite, o detrás de una barrera no combustible de 1,5 m de alto.', f:'OSHA 29 CFR 1910.253 (b)(4)(iii)' }
];
var CAL_VIGIA_MIN = 30;   /* OSHA 29 CFR 1910.252 (a)(2)(iii)(B): al menos media hora después de terminar */
function calResumen(m){ m = m || {}; var h = CAL_LISTA.filter(function(x){ return !!m[x.k]; }).length; return { hechas:h, total:CAL_LISTA.length, todo:h === CAL_LISTA.length }; }
function _arHora(ms){ var d = new Date(ms); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
function calVigia(fin, ahora){
  fin = +fin || 0; if(!fin) return null;
  ahora = ahora || Date.now();
  var resta = Math.max(0, Math.round((fin - ahora) / 1000));
  return { fin:fin, desde:_arHora(fin - CAL_VIGIA_MIN * 60000), hasta:_arHora(fin), resta:resta, mmss:Math.floor(resta / 60) + ':' + ('0' + (resta % 60)).slice(-2), listo:resta === 0 };
}

/* ── eléctrico: la distancia a una línea aérea ── */
var ELE_TABLA_A = [[50, 10], [200, 15], [350, 20], [500, 25], [750, 35], [1000, 45]];   /* kV hasta · pies (1926.1408, tabla A) */
var ELE_PIE = 0.3048;
function eleCalcular(o){
  o = o || {};
  if(o.sabe === 'no') return { sabe:false, op2:20 * ELE_PIE, op2b:50 * ELE_PIE };
  var kv = venNum(o.kv);
  if(!kv || kv > 2000) return { mal:'kv' };
  if(kv > 1000) return { sabe:true, kv:kv, mas1000:true };
  var fila = ELE_TABLA_A.filter(function(r){ return kv <= r[0] + 1e-9; })[0];
  var per = 3.05 + (kv > 50 ? Math.ceil((kv - 50) / 10 - 1e-9) * 0.10 : 0);
  return { sabe:true, kv:kv, pies:fila[1], equipo:fila[1] * ELE_PIE, persona:per };
}
var ELE_REGLAS = [
  { t:'Lo más seguro: que la empresa eléctrica corte la línea y la ponga a tierra a la vista, en la obra.', f:'OSHA 29 CFR 1926.1408 (a)(2)' },
  { t:'Si no se corta: reunión antes de empezar con el operador y la cuadrilla, y una línea de aviso con banderines a esa distancia, a la vista del operador.', f:'OSHA 29 CFR 1926.1408 (b)(1) y (b)(3)' },
  { t:'Además, un vigía dedicado que habla con el operador todo el tiempo, o una alarma de proximidad, o un limitador de giro o de alcance.', f:'OSHA 29 CFR 1926.1408 (b)(4)' },
  { t:'Si se usan vientos o cuerdas guía para la carga, que no conduzcan electricidad.', f:'OSHA 29 CFR 1926.1408 (b)(2)' }
];

/* ── lo que se ve de cada resultado: { big:{a, v, b}, lis:[partes], avisos:[{t, mal | ojo}], reglas, fuente } ──
   una parte es un texto (se traduce) o {n:'número'} (no se traduce) */
function arResumen(k, R, S){
  S = S || {};
  if(!R || R.mal) return null;
  var o = { lis:[], avisos:[], reglas:[], fuente:'' };
  if(k === 'fac'){
    o.big = { a:'Factor de caída', v:venFmt(R.fc, 2), b:R.nivel === 0 ? 'lo mejor: anclaje arriba y sin juego' : (R.nivel === 1 ? 'anclaje a la altura del anillo D o más arriba' : 'anclaje por debajo del anillo D') };
    o.lis.push(['Caída libre:', { n:_arM(R.caida) }]);
    o.lis.push(['Línea', { n:_arM(R.L) }, '· anclaje', { n:_arM(R.A) }, '· anillo D', { n:_arM(R.D) }]);
    if(R.nivel === 0) o.avisos.push({ t:'Factor 0: el anclaje está por encima de tu anillo D y la línea no tiene juego. Así se trabaja siempre que se pueda.' });
    else if(R.nivel === 1) o.avisos.push({ t:'Factor de 1 o menos: el anclaje está a la altura de tu anillo D o más arriba, pero la línea tiene juego. Si puedes, ancla más arriba.', ojo:true });
    else o.avisos.push({ t:'Factor mayor que 1: el anclaje está por debajo de tu anillo D. La caída es más larga y el tirón más fuerte: ancla más arriba.', mal:true });
    if(R.pasa) o.avisos.push({ t:'La caída libre pasa de 1,8 m: así no se trabaja.', mal:true });
    o.reglas = FAC_REGLAS;
    o.fuente = 'Factor de caída = caída libre ÷ largo de la línea (INSST, NTP 1170). Caída libre = largo de la línea + altura del anillo D − altura del anclaje, desde tus pies.';
  } else if(k === 'esl'){
    var un = R.u === 't' ? ' t' : ' kg', dec = R.u === 't' ? 2 : 0;
    o.big = { a:R.n === 1 ? 'El ramal lleva' : 'Cada ramal lleva', v:venFmt(R.t, dec) + un, b:R.n === 1 ? 'en vertical' : 'con la carga centrada' };
    if(R.n === 2){
      o.lis.push(['Ángulo con la horizontal:', { n:venFmt(R.ang, 0) + '°' }]);
      o.lis.push(['El ángulo multiplica el peso por', { n:venFmt(R.factor, 2) }, '(1 ÷ seno del ángulo).']);
    }
    if(R.cap) o.lis.push(['Capacidad de la eslinga:', { n:venFmt(R.cap, dec) + un }, '· usa el', { n:venFmt(R.uso * 100, 0) + ' %' }]);
    if(R.bajo30) o.avisos.push({ t:'Menos de 30° con la horizontal: con ese ángulo no se iza. Usa eslingas más largas.', mal:true });
    if(R.sobre) o.avisos.push({ t:'Cada ramal lleva más de lo que aguanta la eslinga: así no se iza.', mal:true });
    else if(R.cap && !R.bajo30) o.avisos.push({ t:'La eslinga aguanta esa carga en ese ángulo.' });
    o.reglas = ESL_REGLAS;
    o.fuente = 'Cada ramal = peso ÷ (ramales × seno del ángulo con la horizontal). Es la cuenta de las tablas de OSHA: la capacidad a 60°, 45° y 30° es la vertical por el seno del ángulo.';
  } else if(k === 'exc'){
    o.big = { a:'Talud máximo', v:excPendiente(R.r), b:R.r === 0 ? 'roca estable: paredes verticales' : 'horizontal : vertical' };
    if(R.r > 0) o.lis.push(['Ángulo con la horizontal:', { n:R.g + '°' }]);
    if(R.r > 0) o.lis.push(['Cada pared se abre', { n:_arM(R.ret) }, 'hacia afuera, arriba.']);
    if(R.arriba) o.lis.push(['Ancho arriba:', { n:_arM(R.arriba) }, '· en el fondo:', { n:_arM(R.fondo) }]);
    if(R.escaleras) o.lis.push(['Escaleras o rampas:', { n:String(R.escaleras) }, 'para', { n:_arM(R.largo, 1) }, 'de zanja.']);
    if(R.corto) o.avisos.push({ t:'Tipo A abierta 24 horas o menos y de hasta 3,67 m: ½ : 1 (63°).', ojo:true });
    if(R.ingeniero) o.avisos.push({ t:'Más de 6,1 m de profundidad: el talud lo diseña un ingeniero colegiado.', mal:true });
    if(R.proteccion) o.avisos.push({ t:'Desde 1,52 m va con protección contra derrumbes: talud, banquetas, entibado o caja.', ojo:true });
    if(R.sinProt) o.avisos.push({ t:'Con menos de 1,52 m puede ir sin protección solo si una persona competente revisa el terreno y no ve riesgo de derrumbe.', ojo:true });
    if(R.esc) o.avisos.push({ t:'Desde 1,22 m: escalera, rampa u otra salida, para que nadie camine más de 7,62 m hasta ella.', ojo:true });
    if(R.aire) o.avisos.push({ t:'Pasando de 1,22 m, si puede haber poco oxígeno o una atmósfera peligrosa, se mide el aire antes de entrar.', ojo:true });
    o.reglas = EXC_REGLAS;
    o.fuente = 'OSHA 29 CFR 1926, subparte P: el talud de la tabla B-1 del apéndice B y los tipos de suelo del apéndice A; la protección, 1926.652(a)(1); la salida, 1926.651(c)(2); el aire, 1926.651(g)(1)(i).';
  } else if(k === 'ele'){
    if(!R.sabe){
      o.big = { a:'Sin saber el voltaje, la grúa a', v:_arM(R.op2), b:'si la línea es de hasta 350 kV' };
      o.lis.push(['De más de 350 kV y hasta 1000 kV:', { n:_arM(R.op2b) }]);
      o.avisos.push({ t:'Pide el voltaje a la empresa eléctrica: con él sale la distancia de la tabla, para la grúa y para las personas.', ojo:true });
    } else if(R.mas1000){
      o.big = { a:'Más de 1000 kV', v:'—', b:'la distancia la fija la empresa eléctrica o un ingeniero' };
    } else {
      o.big = { a:'La grúa, su cable y la carga, a', v:_arM(R.equipo), b:'como mínimo de la línea' };
      o.lis.push(['En la tabla de OSHA:', { n:R.pies + ' pies' }]);
      o.lis.push(['Las personas y lo que llevan (escaleras, varillas, herramientas):', { n:_arM(R.persona) }]);
      o.lis.push(['Línea de', { n:venFmt(R.kv, 1) + ' kV' }]);
    }
    o.reglas = ELE_REGLAS;
    o.fuente = 'Grúas: OSHA 29 CFR 1926.1408, tabla A, y 1926.1409. Personas: 1910.333(c)(3)(i)(A), 3,05 m hasta 50 kV y 10 cm más por cada 10 kV; con el voltaje de la línea sale más que con el voltaje a tierra que pide la norma.';
  }
  return o;
}
/* el resumen en texto, para compartir */
function arTextoDe(k, Rr, lugar){
  if(!Rr) return '';
  var H = AR_HERR[k] || { n:'' }, plano = function(L){ return L.map(function(p){ return typeof p === 'string' ? p : p.n; }).join(' '); };
  return H.n + ' (OBRASST)\n' + (lugar ? lugar + '\n' : '') +
    (Rr.big ? '➡️ ' + Rr.big.a + ' ' + Rr.big.v + (Rr.big.b ? ' (' + Rr.big.b + ')' : '') + '\n' : '') +
    Rr.lis.map(function(L){ return '· ' + plano(L); }).join('\n') + (Rr.lis.length ? '\n' : '') +
    Rr.avisos.map(function(a){ return (a.mal ? '⛔ ' : (a.ojo ? '⚠️ ' : '✔️ ')) + a.t; }).join('\n');
}
/* el formulario de cada herramienta, con las clases de quien lo dibuja:
   P = { pre, tit, chips, chip, on, campos, campo, nota, sel } */
function arCampos(k, S){
  S = S || {};
  if(k === 'fac') return [
    { t:'1 · Tu línea y tu anclaje' },
    { c:[['l', 'Largo de la línea', 'm', '1,8'], ['a', 'Altura del anclaje sobre tus pies', 'm', '2'], ['d', 'Altura de tu anillo D sobre tus pies', 'm', '1,5']] },
    { nota:'Mide desde donde estás parado. Si el anclaje está más abajo que tus pies, va con menos (−0,5). El anillo D es el de la espalda.' }
  ];
  if(k === 'esl'){
    var L = [{ t:'1 · La carga' }, { c:[['peso', 'Peso de la carga', '', '1200']] }, { ch:['u', ESL_UNID.map(function(u){ return [u[0], u[1]]; }), 'Unidad'] },
      { t:'2 · Las eslingas' }, { ch:['ram', [['2', 'Dos ramales o canasta'], ['1', 'Un ramal vertical']], 'Cuántos ramales'] }];
    if(String(S.ram) !== '1'){
      L.push({ ch:['modo', [['ang', 'Sé el ángulo'], ['med', 'Lo saco con medidas']], 'Cómo sacar el ángulo'] });
      if(S.modo === 'med') L.push({ c:[['lr', 'Largo de cada ramal', 'm', '3'], ['h', 'Alto, del gancho a la carga', 'm', '2,5']] },
                                  { nota:'El alto se mide en vertical, del gancho hasta donde se engancha la carga.' });
      else L.push({ c:[['ang', 'Ángulo con la horizontal', '°', '60']] });
    }
    L.push({ c:[['cap', 'Capacidad de cada eslinga (etiqueta)', 'opcional', '']] }, { nota:'En la misma unidad que el peso. La de la etiqueta para el amarre que vas a usar.' });
    return L;
  }
  if(k === 'exc'){
    var E = [{ t:'1 · La excavación' }, { c:[['prof', 'Profundidad', 'm', '2,5'], ['fondo', 'Ancho del fondo', 'm · opcional', '1'], ['largo', 'Largo de la zanja', 'm · opcional', '30']] },
      { t:'2 · El suelo' }, { ch:['suelo', EXC_SUELOS.map(function(x){ return [x.k, x.n]; }), 'El tipo de suelo', 'nose'] }];
    var su = EXC_SUELOS.filter(function(x){ return x.k === S.suelo; })[0] || EXC_SUELOS[4];
    E.push({ nota:su.d });
    if(su.k === 'a') E.push({ chk:['corto', 'Va a estar abierta 24 horas o menos'] });
    return E;
  }
  if(k === 'ele') {
    var V = [{ t:'1 · La línea' }, { ch:['sabe', [['si', 'Sé el voltaje'], ['no', 'No sé el voltaje']], 'El voltaje'] }];
    if(S.sabe !== 'no') V.push({ c:[['kv', 'Voltaje de la línea', 'kV', '22,9']] }, { nota:'El que figura en el poste o el que da la empresa eléctrica, entre fases.' });
    return V;
  }
  return [];
}
function _arEsc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function arForm(k, S, P){
  S = S || {}; P = P || {};
  var pre = P.pre || 'ar-';
  return arCampos(k, S).map(function(x){
    if(x.t) return '<div class="' + (P.tit || '') + '">' + _arEsc(x.t) + '</div>';
    if(x.nota) return '<p class="' + (P.nota || '') + '">' + _arEsc(x.nota) + '</p>';
    if(x.chk) return '<label class="' + (P.chk || '') + '"><input type="checkbox" id="' + pre + x.chk[0] + '" data-ar-chk="' + x.chk[0] + '"' + (S[x.chk[0]] ? ' checked' : '') + '> <span>' + _arEsc(x.chk[1]) + '</span></label>';
    if(x.ch){
      var sel = S[x.ch[0]] != null && S[x.ch[0]] !== '' ? String(S[x.ch[0]]) : String(x.ch[3] != null ? x.ch[3] : x.ch[1][0][0]);
      return '<div class="' + (P.chips || '') + '" role="radiogroup" aria-label="' + _arEsc(x.ch[2]) + '">' + x.ch[1].map(function(o){
        var on = String(o[0]) === sel;
        return '<button type="button" class="' + (P.chip || '') + (on ? ' ' + (P.on || 'on') : '') + '" role="radio" aria-checked="' + (on ? 'true' : 'false') + '" data-ar-ch="' + x.ch[0] + '" data-v="' + _arEsc(o[0]) + '">' + _arEsc(o[1]) + '</button>'; }).join('') + '</div>';
    }
    if(x.c) return '<div class="' + (P.campos || '') + '">' + x.c.map(function(c){
      return '<div class="' + (P.campo || '') + '"><label for="' + pre + c[0] + '">' + _arEsc(c[1]) + (c[2] ? ' <span class="' + (P.unid || '') + '">· ' + _arEsc(c[2]) + '</span>' : '') + '</label>' +
        '<input id="' + pre + c[0] + '" data-ar="' + c[0] + '" type="text" inputmode="decimal" autocomplete="off" maxlength="9"' + (c[3] ? ' placeholder="' + _arEsc(c[3]) + '"' : '') + ' value="' + _arEsc(S[c[0]] || '') + '"></div>'; }).join('') + '</div>';
    return '';
  }).join('');
}
/* lee el formulario dibujado por arForm (dentro de «caja») a S */
function arLeerForm(caja, S){
  if(!caja) return S;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ar]'), function(e){ S[e.getAttribute('data-ar')] = String(e.value || '').slice(0, 9); });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ar-chk]'), function(e){ S[e.getAttribute('data-ar-chk')] = !!e.checked; });
  return S;
}
/* el resultado, con las clases de quien lo dibuja: P = { caja, big, ul, aviso, ojo, malo, reglas, fuente, vacio } */
function arPartes(L){ return L.map(function(p){ return typeof p === 'string' ? '<span>' + _arEsc(p) + '</span>' : '<b data-sin-trad>' + _arEsc(p.n) + '</b>'; }).join(' '); }
function arResultado(k, R, Rr, P, pie){
  P = P || {};
  if(!Rr){
    var t = { linea:'Escribe el largo de tu línea.', anclaje:'Escribe la altura del anclaje: 0 si está a la altura de tus pies.', anillo:'Escribe la altura de tu anillo D: entre 0,8 y 2,5 m.',
              peso:'Escribe el peso de la carga.', medidas:'Escribe el largo de cada ramal y el alto.', alto:'El alto no puede ser mayor que el largo del ramal.', angulo:'Escribe el ángulo: de 1 a 90°.',
              prof:'Escribe la profundidad de la excavación.', kv:'Escribe el voltaje de la línea, en kV.' }[R && R.mal] || 'Faltan datos.';
    return '<div class="' + (P.vacio || '') + '"><span>' + _arEsc(t) + '</span></div>';
  }
  var h = '<div class="' + (P.caja || '') + '">';
  if(Rr.big) h += '<div class="' + (P.big || '') + '"><small><span>' + _arEsc(Rr.big.a) + '</span></small><b data-sin-trad>' + _arEsc(Rr.big.v) + '</b><small><span>' + _arEsc(Rr.big.b || '') + '</span></small></div>';
  if(Rr.lis.length) h += '<ul class="' + (P.ul || '') + '">' + Rr.lis.map(function(L){ return '<li>' + arPartes(L) + '</li>'; }).join('') + '</ul>';
  h += Rr.avisos.map(function(a){ return '<div class="' + (a.mal ? (P.malo || '') : (a.ojo ? (P.ojo || '') : (P.aviso || ''))) + '">' + (a.mal ? '⛔ ' : (a.ojo ? '⚠️ ' : '✔️ ')) + '<span>' + _arEsc(a.t) + '</span></div>'; }).join('');
  if(Rr.reglas && Rr.reglas.length) h += '<div class="' + (P.reglas || '') + '">' + Rr.reglas.map(function(x){ return '<p>📌 <span>' + _arEsc(x.t) + '</span> <small data-sin-trad>(' + _arEsc(x.f) + ')</small></p>'; }).join('') + '</div>';
  if(Rr.fuente) h += '<p class="' + (P.fuente || '') + '">' + _arEsc(Rr.fuente) + '</p>';
  return h + (pie || '') + '</div>';
}
/* cada herramienta: su cuenta con lo que está escrito */
function arCalcular(k, S){
  S = S || {};
  if(k === 'fac') return facCalcular(S);
  if(k === 'esl') return eslCalcular(S);
  if(k === 'exc') return excCalcular(S);
  if(k === 'ele') return eleCalcular(S);
  return null;
}
/* trabajo en caliente: la lista (con las clases de quien la dibuja: P = { lista, item }) y el vigía */
function calForm(S, P){
  S = S || {}; P = P || {}; var m = S.m || {};
  return '<div class="' + (P.lista || '') + '">' + CAL_LISTA.map(function(x){
    return '<label class="' + (P.item || '') + '"><input type="checkbox" data-cal="' + x.k + '"' + (m[x.k] ? ' checked' : '') + '> <span>' + _arEsc(x.t) + '</span> <small data-sin-trad>(' + _arEsc(x.f) + ')</small></label>'; }).join('') + '</div>';
}
function calVigiaHTML(S, P, ahora){
  S = S || {}; P = P || {};
  var V = calVigia(S.fin, ahora), pre = P.pre || 'ar-';
  if(!V) return '<p class="' + (P.nota || '') + '"><span>Al terminar de soldar o cortar, el vigía de fuego se queda por lo menos 30 minutos.</span> <small data-sin-trad>(OSHA 29 CFR 1910.252 (a)(2)(iii)(B))</small></p>' +
    '<button type="button" class="' + (P.btn || '') + '" id="' + pre + 'cal-vigia" data-cal-vigia="1">⏱️ <span>Terminé: empieza el vigía</span></button>';
  if(!V.listo) return '<div class="' + (P.big || '') + '"><small><span>El vigía se queda hasta las</span></small><b data-sin-trad>' + V.hasta + '</b><small><span>faltan</span> <span data-sin-trad id="' + pre + 'cal-resta">' + V.mmss + '</span></small></div>' +
    '<button type="button" class="' + (P.btn2 || '') + '" id="' + pre + 'cal-otra" data-cal-otra="1">↺ <span>Empezar de nuevo</span></button>';
  return '<div class="' + (P.aviso || '') + '">✔️ <span>Pasaron los 30 minutos del vigía.</span> <span data-sin-trad>(' + V.desde + ' → ' + V.hasta + ')</span></div>' +
    '<button type="button" class="' + (P.btn2 || '') + '" id="' + pre + 'cal-otra" data-cal-otra="1">↺ <span>Empezar de nuevo</span></button>';
}
/* <<< ALTO-BASE-FIN >>> */

/* ══ LA SECCIÓN «TRABAJOS DE ALTO RIESGO» DE LA WEB (27/10/2026) ════════════════════════════════════════════════════
   La misma de la app (ALTO-APP), para la computadora: cada tipo de trabajo con sus herramientas de la web y, abajo, la
   calculadora de ventilación de un espacio confinado con su resultado al lado. No guarda nada en la nube: lo último que
   se escribió queda en este navegador. */
var ARW = { caja:null, S:null };
var LS_VEN_W = 'sstp_ventila';
function _arCssW(){
  if(document.getElementById('ar-css')) return;
  var st=document.createElement('style'); st.id='ar-css';
  st.textContent=[
    '.arw-g{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px}',
    '@media (max-width:1100px){ .arw-g{grid-template-columns:repeat(2,minmax(0,1fr))} }',
    '@media (max-width:680px){ .arw-g{grid-template-columns:minmax(0,1fr)} }',
    '.arw-t{border:1px solid var(--raya); border-radius:12px; background:var(--panel); padding:14px; display:flex; flex-direction:column; gap:8px}',
    '.arw-t h3{margin:0; font-size:15px; display:flex; gap:9px; align-items:center; color:var(--tinta)} .arw-t h3 span{font-size:20px; line-height:1}',
    '.arw-t p{margin:0; font-size:13px; color:var(--gris); line-height:1.45}',
    '.arw-t .acciones{display:flex; flex-direction:column; align-items:stretch; gap:6px; margin-top:auto}',
    '.arw-t .acciones .bt{justify-content:flex-start; text-align:left; white-space:normal; min-width:0; max-width:100%}',
    '.venw{display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,1fr); gap:18px; align-items:start}',
    '@media (max-width:980px){ .venw{grid-template-columns:minmax(0,1fr)} }',
    '.venw h4{font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--gris); margin:14px 0 6px}',
    '.venw h4:first-child{margin-top:0}',
    '.venw-campos{display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:10px; align-items:end}',
    '.venw-campos .campo{margin:0}',
    '.venw-min{font-size:13px; color:var(--gris)} .venw-min b{display:block; font-size:38px; line-height:1.1; color:var(--tinta); font-variant-numeric:tabular-nums}',
    '.venw-ul{margin:10px 0 0; padding-left:18px; display:grid; gap:5px; font-size:13.5px}',
    '.venw-reglas{margin:12px 0 0; padding:10px 0 0; border-top:1px solid var(--raya); display:grid; gap:7px; font-size:13px; line-height:1.45}',
    '.venw-reglas small{color:var(--gris)}', '.venw-reglas p{margin:0}',
    '.venw-fuente{font-size:12px; color:var(--gris); margin:10px 0 0}',
    '.arw-tit{font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--gris); margin:14px 0 6px; font-weight:600}',
    '.arw-tit:first-child{margin-top:0}',
    '.arw-nota{margin:6px 0 0}',
    '.arw-chk{display:flex; gap:8px; align-items:center; margin:10px 0 0; font-size:13.5px; color:var(--tinta)}',
    '.arw-av{margin:10px 0 0}',
    '.arw-vacio{padding:18px; text-align:left}',
    '.arw-cal{display:grid; gap:8px}',
    '.arw-cal-i{display:grid; grid-template-columns:20px minmax(0,1fr); gap:2px 10px; align-items:start; padding:10px 12px; border:1px solid var(--raya); border-radius:10px; font-size:13.5px; line-height:1.45; color:var(--tinta); cursor:pointer}',
    '.arw-cal-i input{margin:2px 0 0}',
    '.arw-cal-i small{grid-column:2; color:var(--gris); font-size:11.5px}',
    '.arw-vig{margin-bottom:10px}'
  ].join('\n');
  document.head.appendChild(st);
}
function _venEstadoW(){
  if(ARW.S) return ARW.S;
  var g=null; try{ g=JSON.parse(localStorage.getItem(LS_VEN_W)||'null'); }catch(_l){ g=null; }
  var S=(g && typeof g==='object' && !Array.isArray(g)) ? g : {};
  if(!VEN_FORMAS.some(function(f){ return f.k===S.forma; })) S.forma='cil';
  if(!S.x || typeof S.x!=='object') S.x={};
  if(!VEN_UNID.some(function(u){ return u[0]===S.unid; })) S.unid='m3min';
  if([2, 3, 5].indexOf(+S.K)<0) S.K=2;
  if(!VEN_META.some(function(m){ return m[0]===S.meta; })) S.meta='p999';
  ARW.S=S; return S;
}
function _venGuardarW(){ try{ localStorage.setItem(LS_VEN_W, JSON.stringify(ARW.S)); }catch(_g){} }
/* las herramientas de la web para cada tipo de trabajo (solo las secciones que esta cuenta tiene) */
function _arwHay(id){ try{ return vistasDe().some(function(v){ return v.id===id; }); }catch(_e){ return false; } }
function arwHerramientas(k){
  var L=[];
  Object.keys(AR_HERR).forEach(function(h){ var H=AR_HERR[h]; if(H.tipo===k) L.push({ ic:H.ic, t:H.t, ir:'#'+h }); });
  if(k==='altura') L.push({ ic:'🧗', t:'Caída libre: ¿alcanza el espacio?', ir:'caida' });
  if(k==='electrico') L.push({ ic:'🔒', t:'Bloqueo y etiquetado', ir:'bloqueos' });
  L.push({ ic:'📋', t:'ATS e IPERC', ir:'ats' });
  return L.filter(function(x){ return x.ir.charAt(0)==='#' || _arwHay(x.ir); });
}
function vistaAlto(caja){
  _arCssW(); ARW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  var h='<div class="arw-g">'+AR_TIPOS.map(function(T){
    return '<div class="arw-t" id="arw-'+T.k+'"><h3><span aria-hidden="true">'+T.ic+'</span>'+esc(T.n)+'</h3><p>'+esc(T.d)+'</p><div class="acciones">'+
      arwHerramientas(T.k).map(function(x){ return '<button type="button" class="bt sec chico" data-arw="'+esc(x.ir)+'">'+x.ic+' '+esc(x.t)+'</button>'; }).join('')+'</div></div>';
  }).join('')+'</div>'+
  '<p class="ayuda" style="margin:10px 0 0">El permiso de trabajo de alto riesgo (PETAR) se llena y se firma en la app, en la obra.</p>'+
  '<div class="tarj" id="arw-panel" style="margin-top:16px"></div>';
  caja.innerHTML=h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-arw]'), function(b){ b.onclick=function(){
    var d=b.getAttribute('data-arw');
    if(d.charAt(0)==='#'){
      arwElegir(d.slice(1));
      var t=$('arw-panel'); if(t) t.scrollIntoView({ behavior:'smooth', block:'start' });
      var f=document.querySelector('#arw-panel input'); if(f) try{ f.focus({ preventScroll:true }); }catch(_f){}
    } else navegar(d);
  }; });
  _arwPanel();
}
/* ── el panel: la herramienta elegida (la última que se usó en este navegador; la primera vez, la ventilación) ── */
var LS_AR_W='sstp_alto', _ARW_RELOJ=null;
var AR_P_WEB={ pre:'arw-', tit:'arw-tit', chips:'chips', chip:'chip', on:'on', campos:'venw-campos', campo:'campo', unid:'tenue', nota:'ayuda arw-nota', chk:'arw-chk' };
var AR_R_WEB={ caja:'', big:'venw-min', ul:'venw-ul', aviso:'aviso ok arw-av', ojo:'aviso ojo arw-av', malo:'aviso mal arw-av', reglas:'venw-reglas', fuente:'venw-fuente', vacio:'vacio arw-vacio' };
function _arwEstado(){
  if(ARW.A) return ARW.A;
  var g=null; try{ g=JSON.parse(localStorage.getItem(LS_AR_W)||'null'); }catch(_l){ g=null; }
  var A=(g && typeof g==='object' && !Array.isArray(g)) ? g : {};
  Object.keys(AR_HERR).forEach(function(k){ if(k!=='ven' && (!A[k] || typeof A[k]!=='object' || Array.isArray(A[k]))) A[k]={}; });
  if(!AR_HERR[A.k]) A.k='ven';
  ARW.A=A; return A;
}
function _arwGuardar(){ try{ localStorage.setItem(LS_AR_W, JSON.stringify(ARW.A)); }catch(_g){} }
function arwElegir(k){ if(!AR_HERR[k]) return; _arwEstado().k=k; _arwGuardar(); _arwPanel(); }
function _arwPanel(){
  var c=$('arw-panel'); if(!c) return;
  var A=_arwEstado(), k=A.k, H=AR_HERR[k];
  var sub=(k==='ven') ? 'Cuánto ventilar antes de medir y entrar, con el tamaño del espacio y el caudal de tu ventilador. Aquí o en la app, es la misma cuenta.' : (H.s||'')+' Aquí o en la app, es la misma cuenta.';
  var h='<div class="tarj-cab"><div><h2>'+H.ic+' '+esc(H.n)+'</h2><p class="sub">'+esc(sub)+'</p></div></div><div class="tarj-cuerpo"><div class="venw">';
  if(k==='ven') h+='<div id="venw-form"></div><div id="venw-res" aria-live="polite"></div>';
  else h+='<div id="arw-form"></div><div id="arw-res" aria-live="polite"></div>';
  c.innerHTML=h+'</div></div>';
  if(k==='ven') _venFormW(); else _arwForm();
}
function _arwForm(){
  var c=$('arw-form'); if(!c) return;
  var A=_arwEstado(), k=A.k, S=A[k];
  if(k==='cal'){
    c.innerHTML='<div class="arw-tit">Antes de empezar</div>'+calForm(S, { lista:'arw-cal', item:'arw-cal-i' });
    Array.prototype.forEach.call(c.querySelectorAll('[data-cal]'), function(e){ e.onchange=function(){
      if(!S.m || typeof S.m!=='object') S.m={}; S.m[e.getAttribute('data-cal')]=!!e.checked; _arwGuardar(); _arwRes(); }; });
  } else {
    c.innerHTML=arForm(k, S, AR_P_WEB)+'<div class="campo" style="margin-top:10px"><label for="arw-lugar">Dónde <span class="tenue">· opcional</span></label><input id="arw-lugar" maxlength="80" value="'+esc(S.lugar||'')+'"></div>';
    Array.prototype.forEach.call(c.querySelectorAll('[data-ar]'), function(e){ e.oninput=_arwLeer; });
    var l=$('arw-lugar'); if(l) l.oninput=_arwLeer;
    Array.prototype.forEach.call(c.querySelectorAll('[data-ar-chk]'), function(e){ e.onchange=function(){ _arwLeer(); _arwForm(); }; });
    Array.prototype.forEach.call(c.querySelectorAll('[data-ar-ch]'), function(b){ b.onclick=function(){ _arwLeer(); S[b.getAttribute('data-ar-ch')]=b.getAttribute('data-v'); _arwGuardar(); _arwForm(); }; });
  }
  _arwRes();
}
function _arwLeer(){
  var A=_arwEstado(), S=A[A.k];
  arLeerForm($('arw-form'), S);
  var l=$('arw-lugar'); if(l) S.lugar=String(l.value||'').slice(0, 80);
  _arwGuardar(); _arwRes();
}
function _arwRes(){
  var c=$('arw-res'); if(!c) return;
  var A=_arwEstado(), k=A.k, S=A[k];
  if(k==='cal'){
    var Z=calResumen(S.m);
    c.innerHTML='<div class="venw-min">Listo antes de soldar o cortar<b>'+Z.hechas+' / '+Z.total+'</b>'+(Z.todo ? 'Todo revisado: con el permiso firmado, se puede empezar.' : 'Marca lo que ya está: lo que falta se resuelve antes de prender el equipo.')+'</div>'+
      '<div class="arw-tit" style="margin-top:16px">Al terminar</div><div id="arw-vigia" aria-live="polite"></div>';
    _arwVigia(); return;
  }
  var R=arCalcular(k, S), Rr=arResumen(k, R, S);
  c.innerHTML=arResultado(k, R, Rr, AR_R_WEB, Rr ? '<div class="acciones" style="margin-top:10px"><button type="button" class="bt sec" id="arw-copiar">📋 Copiar el resultado</button></div>' : '');
  var b=$('arw-copiar'); if(b) b.onclick=function(){
    var t=arTextoDe(k, Rr, S.lugar||'');
    try{ navigator.clipboard.writeText(t).then(function(){ toast('Copiado: ya se puede pegar en WhatsApp o en el PETAR.'); }, function(){ toast('No se pudo copiar.'); }); }catch(_c){ toast('No se pudo copiar.'); }
  };
}
/* el vigía de fuego: la media hora después de terminar, con su cuenta regresiva mientras la sección está abierta */
function _arwVigia(){
  var c=$('arw-vigia'); if(!c) return;
  var S=_arwEstado().cal;
  c.innerHTML=calVigiaHTML(S, { pre:'arw-', nota:'ayuda', btn:'bt', btn2:'bt sec', big:'venw-min arw-vig', aviso:'aviso ok' });
  var v=$('arw-cal-vigia'); if(v) v.onclick=function(){ S.fin=Date.now()+CAL_VIGIA_MIN*60000; _arwGuardar(); _arwVigia(); };
  var o=$('arw-cal-otra'); if(o) o.onclick=function(){ S.fin=null; _arwGuardar(); _arwVigia(); };
  if(_ARW_RELOJ){ clearInterval(_ARW_RELOJ); _ARW_RELOJ=null; }
  var V=calVigia(S.fin);
  if(V && !V.listo) _ARW_RELOJ=setInterval(function(){
    var r=$('arw-cal-resta');
    if(!r){ clearInterval(_ARW_RELOJ); _ARW_RELOJ=null; return; }
    var W=calVigia(_arwEstado().cal.fin);
    if(!W || W.listo){ _arwVigia(); return; }
    r.textContent=W.mmss;
  }, 1000);
}
function _venChipsW(L, sel, k, et){
  return '<div class="chips" role="radiogroup" aria-label="'+esc(et)+'">'+L.map(function(x){ var on=String(x[0])===String(sel);
    return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-venw="'+k+'" data-v="'+esc(String(x[0]))+'">'+esc(x[1])+'</button>'; }).join('')+'</div>';
}
function _venFormW(){
  var c=$('venw-form'); if(!c) return;
  var S=_venEstadoW(), F=VEN_FORMAS.filter(function(f){ return f.k===S.forma; })[0] || VEN_FORMAS[0], M=VEN_MEZCLA.filter(function(m){ return m.k===+S.K; })[0] || VEN_MEZCLA[0];
  var inp=function(id, et, v, ph){ return '<div class="campo"><label for="'+id+'">'+et+'</label><input id="'+id+'" inputmode="decimal" autocomplete="off" maxlength="9"'+(ph ? ' placeholder="'+esc(ph)+'"' : '')+' value="'+esc(v||'')+'"></div>'; };
  c.innerHTML='<h4>1 · El espacio</h4>'+_venChipsW(VEN_FORMAS.map(function(f){ return [f.k, f.n]; }), S.forma, 'forma', 'La forma del espacio')+
    (F.sub ? '<p class="ayuda" style="margin:6px 0 0">'+esc(F.sub)+'</p>' : '')+
    '<div class="venw-campos" style="margin-top:8px">'+F.campos.map(function(cp){ return inp('venw-'+cp[0], esc(cp[1])+' <span class="tenue">· '+(cp[0]==='v' ? 'm³' : 'm')+'</span>', S.x[cp[0]]); }).join('')+'</div>'+
    '<div class="campo" style="margin-top:10px"><label for="venw-lugar">Cuál es <span class="tenue">· opcional</span></label><input id="venw-lugar" maxlength="80" placeholder="Cisterna del sótano 2" value="'+esc(S.lugar||'')+'"></div>'+
    '<h4>2 · El ventilador</h4><div class="venw-campos">'+inp('venw-q', 'Caudal', S.q)+
    '<div class="campo"><label for="venw-u">Unidad</label><select id="venw-u">'+VEN_UNID.map(function(u){ return '<option value="'+u[0]+'"'+(u[0]===S.unid ? ' selected' : '')+'>'+esc(u[1])+'</option>'; }).join('')+'</select></div></div>'+
    '<p class="ayuda" style="margin:6px 0 0">El caudal real, con la manga puesta: cada metro de manga y cada codo le quitan (mira la curva del fabricante).</p>'+
    '<h4>3 · Cómo se mezcla el aire</h4>'+_venChipsW(VEN_MEZCLA.map(function(m){ return [m.k, m.n+' · K = '+m.k]; }), S.K, 'K', 'Cómo se mezcla el aire')+
    '<p class="ayuda" style="margin:6px 0 0">'+esc(M.d)+'</p>'+
    '<h4>4 · Cuánto bajar lo que haya en el aire</h4>'+_venChipsW(VEN_META.map(function(m){ return [m[0], m[1]]; }), S.meta, 'meta', 'Cuánto bajar')+
    (S.meta==='med' ? '<div class="venw-campos" style="margin-top:8px">'+inp('venw-c1', 'Lo que se midió', S.c1, '200')+inp('venw-c2', 'A cuánto bajarlo', S.c2, '25')+'</div>'+
      '<p class="ayuda" style="margin:6px 0 0">En la misma unidad los dos: ppm, o % del límite inferior de explosividad.</p>' : '');
  Array.prototype.forEach.call(c.querySelectorAll('[data-venw]'), function(b){ b.onclick=function(){
    _venLeerW(); var k=b.getAttribute('data-venw'), v=b.getAttribute('data-v'); S[k]=(k==='K') ? +v : v; _venGuardarW(); _venFormW(); }; });
  Array.prototype.forEach.call(c.querySelectorAll('input,select'), function(x){ x.oninput=_venLeerW; x.onchange=_venLeerW; });
  _venResW();
}
function _venLeerW(){
  var S=_venEstadoW(), F=VEN_FORMAS.filter(function(f){ return f.k===S.forma; })[0] || VEN_FORMAS[0], v=function(id){ var e=$(id); return e ? String(e.value||'').slice(0, 9) : undefined; };
  F.campos.forEach(function(cp){ var x=v('venw-'+cp[0]); if(x!==undefined) S.x[cp[0]]=x; });
  var q=v('venw-q'); if(q!==undefined) S.q=q;
  var u=$('venw-u'); if(u) S.unid=u.value;
  var a=v('venw-c1'), b=v('venw-c2'); if(a!==undefined) S.c1=a; if(b!==undefined) S.c2=b;
  var l=$('venw-lugar'); if(l) S.lugar=String(l.value||'').slice(0, 80);
  _venGuardarW(); _venResW();
}
function _venResW(){
  var c=$('venw-res'); if(!c) return;
  var S=_venEstadoW(), R=venCalcular({ V:venVolumen(S.forma, S.x), Q:venCaudal(S.q, S.unid), K:S.K, meta:S.meta, c1:S.c1, c2:S.c2 });
  ARW.R=R;
  if(R.mal){ c.innerHTML='<div class="vacio" style="margin:0"><b>'+esc(R.mal==='medicion' ? 'Falta la medición' : (R.mal==='meta' ? 'Revisa la meta' : 'Faltan datos'))+'</b>'+
    esc(R.mal==='medicion' ? 'Escribe lo que se midió y a cuánto bajarlo.' : (R.mal==='meta' ? 'A cuánto bajarlo tiene que ser menos que lo que se midió.' : 'Escribe las medidas del espacio y el caudal del ventilador.'))+'</div>'; return; }
  c.innerHTML='<div class="venw-min">Ventila al menos<b>'+R.min+' min</b>antes de medir</div>'+
    '<ul class="venw-ul"><li>Volumen: <b>'+esc(venFmt(R.V))+' m³</b></li>'+
    '<li>Tu ventilador renueva el aire <b>'+esc(venFmt(R.ach, 0))+'</b> veces por hora: una vez cada <b>'+esc(venFmt(R.porRen, 2))+'</b> min.</li>'+
    '<li>Para bajar lo que haya <b>'+esc(venPct(R.r))+'</b>, con K = <b>'+R.K+'</b>: <b>'+esc(venFmt(R.ren))+'</b> renovaciones.</li>'+
    '<li class="tenue">Con mezcla perfecta serían '+esc(venFmt(R.tIdeal))+' min: es el mínimo teórico, no el que se usa.</li></ul>'+
    (R.largo ? '<div class="aviso ojo" style="margin-top:10px"><b>Es demasiado tiempo para ese caudal.</b> Usa un ventilador más grande, o varios.</div>' : '')+
    '<div class="venw-reglas">'+VEN_REGLAS.map(function(x){ return '<div>✔️ '+esc(x.t)+' <small>('+esc(x.f)+')</small></div>'; }).join('')+'</div>'+
    '<p class="venw-fuente">'+esc(VEN_FUENTE)+'</p>'+
    '<div class="acciones" style="margin-top:10px"><button type="button" class="bt sec" id="venw-copiar">📋 Copiar el resultado</button></div>';
  $('venw-copiar').onclick=function(){
    var t=venTexto(R, { lugar:S.lugar||'' });
    try{ navigator.clipboard.writeText(t).then(function(){ toast('Copiado: ya se puede pegar en WhatsApp o en el PETAR.'); }, function(){ toast('No se pudo copiar.'); }); }catch(_c){ toast('No se pudo copiar.'); }
  };
}
