/* ══════════════════════════════════════════════════════════════════
   OBRASST · el portal · LAS OBRAS DE EJEMPLO DE FISCALIZACIÓN Y DE
   MANDANTE (28/10/2026, #183)
   Marcelo: «corrígelo… crea obras de ejemplo para Mandante y
   Fiscalización».
   portal/?demo=fiscalizacion y portal/?demo=mandante abren EL MISMO
   portal de una cuenta de verdad: el mismo menú (la casa de cada
   cuenta), las mismas secciones y las mismas pantallas (portal/arriba.js
   y portal/cadena.js). Lo único distinto es de dónde salen los datos:
   sbFetch —la puerta al servidor— contesta desde aquí, con lo mismo que
   contestarían las funciones del servidor (sql/2026-11-17 … 2026-11-24).
   Así la obra de ejemplo no puede prometer nada que la cuenta no tenga.
   Todo es inventado: la entidad, los proyectos, las empresas, los RUC
   (con el dígito verificador a propósito mal, para que no sea el de
   nadie), las personas y las fotos (dibujos de central-demo/). Sin
   celulares: ningún botón lleva a un número de verdad.
   Lo que se hace aquí (ordenar una inspección, pedir un documento,
   validar, observar, programar…) queda en este navegador hasta
   «Reiniciar el ejemplo». No toca ningún servidor.
   No editar la versión: la pone herr/huellas.py (DEMOARR_VER).
   ══════════════════════════════════════════════════════════════════ */
var DMA = { t:'', d:null, rol:'jefe', log:[], fotos:{} };
var DMA_LS = 'sstp_demo_arr_v1_', DMA_LS_ROL = 'sstp_demo_arr_rol_';

/* ── lo fijo: la entidad, los proyectos, las empresas, el equipo ── */
var DMA_ENT = {
  fis:{ id:'demo-fis', nombre:'Proyecto Especial de Obras (ejemplo)', codigo:'DEM-F01', tipo:'fiscalizacion', papel:'Estado', puestos:5000, incl:20 },
  man:{ id:'demo-man', nombre:'Inversiones Valle Alto S.A.C. (ejemplo)', codigo:'DEM-M01', tipo:'mandante', papel:'Mandante', puestos:100, incl:3 }
};
var DMA_PROY = [
  { id:'p1', n:'Carretera tramo norte', reg:'Piura', lug:['Km 12+300 · desvío', 'Km 14+050', 'Km 9+800 · cantera', 'Campamento', 'Km 16+400 · alcantarilla'], tipos:['zanja', 'senal', 'epp', 'cable', 'orden', 'extintor'] },
  { id:'p2', n:'Puente vehicular Los Sauces', reg:'Junín', lug:['Estribo izquierdo', 'Tablero · eje 3', 'Pila central', 'Patio de prefabricados', 'Acceso norte'], tipos:['baranda', 'arnes', 'andamio', 'tablero', 'orden'] },
  { id:'p3', n:'Hospital de apoyo', reg:'Cusco', lug:['Bloque B · piso 3', 'Bloque A · techo', 'Sótano · cuarto de bombas', 'Fachada este', 'Almacén general'], tipos:['hueco', 'andamio', 'arnes', 'tablero', 'cable', 'extintor'] },
  { id:'p4', n:'Saneamiento Valle Alto', reg:'Arequipa', lug:['Calle 4 · tramo 2', 'Reservorio R-2', 'Línea de impulsión · km 1+200', 'Planta de tratamiento', 'Calle 7 · buzón B-14'], tipos:['zanja', 'epp', 'orden', 'extintor', 'senal'] }
];
var DMA_PROY_DE = { fis:['p1', 'p2', 'p3', 'p4'], man:['p3', 'p4'] };
var DMA_EMPS = [
  { id:'e1', n:'Consorcio Vial Norte Grande', ruc:'20999200014', p:'p1', gente:186, cap:0.86, ats:[9, 8], rep:3, acc:1, contacto:'Walter Ramos Chunga', sup:'s1', peso:0.2 },
  { id:'e2', n:'Pavimentos del Pacífico S.A.C.', ruc:'20999200022', p:'p1', gente:64, cap:0.95, ats:[4, 4], rep:1, acc:0, contacto:'Rosa Purizaca Zapata', sup:'s1', peso:0.1 },
  { id:'e3', n:'Estructuras Metálicas Los Sauces S.A.C.', ruc:'20999200030', p:'p2', gente:72, cap:0.79, ats:[5, 4], rep:2, acc:1, contacto:'Edwin Huaringa Poma', sup:'s1', peso:0.17 },
  { id:'e4', n:'Cimentaciones del Centro S.A.C.', ruc:'20999200048', p:'p2', gente:38, cap:0.97, ats:[3, 3], rep:0, acc:0, contacto:'Martha Inga Ccahua', sup:'s1', peso:0.06 },
  { id:'e5', n:'Constructora Ayllu S.A.C.', ruc:'20999200056', p:'p3', gente:154, cap:0.9, ats:[8, 8], rep:2, acc:0, contacto:'Julio Ccori Mamani', sup:'s2', peso:0.2 },
  { id:'e6', n:'Instalaciones Sanitarias del Sur E.I.R.L.', ruc:'20999200064', p:'p3', gente:41, cap:0.98, ats:[3, 3], rep:0, acc:0, contacto:'Gladys Apaza Ticona', sup:'s2', peso:0.07 },
  { id:'e7', n:'Redes y Saneamiento Valle Alto S.A.C.', ruc:'20999200073', p:'p4', gente:96, cap:0.83, ats:[6, 5], rep:1, acc:0, contacto:'Percy Chávez Laura', sup:'s2', peso:0.2 },
  { id:'e8', n:'Excavaciones Pampa Alta S.A.C.', ruc:'20999200081', p:'p4', estado:'invitada', contacto:'Ronald Vilca Pari', sup:'s2', peso:0 }
];
var DMA_SUPS = [
  { id:'s1', n:'Supervisión Técnica Cóndor S.A.C.', ruc:'20999200099', ps:['p1', 'p2'], gente:14, cap:1, ats:[2, 2], rep:0, acc:0, contacto:'Hernán Soto Llanos' },
  { id:'s2', n:'Consultores Kallpa S.A.C.', ruc:'20999200103', ps:['p3', 'p4'], gente:11, cap:1, ats:[2, 2], rep:0, acc:0, contacto:'Yesenia Arias Medina' }
];
var DMA_EQUIPO = {
  fis:[ { uid:'u0', n:'Óscar Valdivia Torres', c:'Gerente de Supervisión y Fiscalización', rango:'gerente', correo:'gerencia@entidad.ejemplo', rol:'dueno' },
        { uid:'u1', n:'Lucía Paredes Ramírez', c:'Jefa de fiscalización', rango:'jefe', correo:'lparedes@entidad.ejemplo' },
        { uid:'u2', n:'Jorge Salinas Cárdenas', c:'Inspector', rango:'supervisor', correo:'jsalinas@entidad.ejemplo' },
        { uid:'u3', n:'Milagros Quispe Rojas', c:'Inspectora', rango:'supervisor', correo:'mquispe@entidad.ejemplo' },
        { uid:'u4', n:'Renzo Huamán Vega', c:'Inspector', rango:'supervisor', correo:'rhuaman@entidad.ejemplo' },
        { uid:'u5', n:'Carla Mendoza Ríos', c:'Inspectora', rango:'supervisor', correo:'cmendoza@entidad.ejemplo' } ],
  man:[ { uid:'u0', n:'Óscar Valdivia Torres', c:'Gerente de proyectos', rango:'gerente', correo:'gerencia@empresa.ejemplo', rol:'dueno' },
        { uid:'u1', n:'Lucía Paredes Ramírez', c:'Jefa de SSOMA de la empresa', rango:'jefe', correo:'lparedes@empresa.ejemplo' },
        { uid:'u2', n:'Jorge Salinas Cárdenas', c:'Supervisor SSOMA', rango:'supervisor', correo:'jsalinas@empresa.ejemplo' },
        { uid:'u3', n:'Milagros Quispe Rojas', c:'Supervisora SSOMA', rango:'supervisor', correo:'mquispe@empresa.ejemplo' } ]
};
var DMA_ROLES = {
  fis:[ { k:'gerente', u:'u0', o:'Gerente de fiscalización' }, { k:'jefe', u:'u1', o:'Jefa de fiscalización' }, { k:'supervisor', u:'u2', o:'Inspector' } ],
  man:[ { k:'gerente', u:'u0', o:'Gerente de proyectos' }, { k:'jefe', u:'u1', o:'Jefa de SSOMA' }, { k:'supervisor', u:'u2', o:'Supervisor SSOMA' } ]
};
var DMA_TIPOS = {
  zanja:{ t:'Zanja sin entibado ni barrera', r:'alto', cond:true, fa:'zanja-antes', fd:'zanja-despues', sol:'Se entibó la zanja y se cerró con barrera rígida.' },
  baranda:{ t:'Borde sin baranda en el tablero del puente', r:'alto', cond:true, fa:'baranda-antes', fd:'baranda-despues', sol:'Se instaló baranda con rodapié y se señalizó el borde.' },
  arnes:{ t:'Trabajo en altura sin enganchar el arnés', r:'alto', cond:false, fa:'baranda-antes', fd:'baranda-despues', sol:'Se paró el trabajo, se instaló la línea de vida y se dio charla a la cuadrilla.' },
  andamio:{ t:'Andamio sin rodapié ni barandas', r:'alto', cond:true, fa:'andamio-antes', fd:'andamio-despues', sol:'Se completaron barandas y rodapiés; tarjeta verde de andamio operativo.' },
  hueco:{ t:'Abertura en losa sin tapa', r:'alto', cond:true, fa:'hueco', fd:'hueco-tapado', sol:'Se tapó con tablones fijados y se señalizó.' },
  tablero:{ t:'Tablero eléctrico sin tapa', r:'medio', cond:true, fa:'tablero-antes', fd:'tablero-despues', sol:'Se colocó la tapa con candado y la señal de riesgo eléctrico.' },
  cable:{ t:'Cable eléctrico expuesto en la vía de tránsito', r:'medio', cond:true, fa:'cable', fd:'cable-canalizado', sol:'Se canalizó el cable por el borde, fuera del paso.' },
  senal:{ t:'Desvío vehicular sin señalización nocturna', r:'alto', cond:true, fa:'orden-antes', fd:'orden-despues', sol:'Se colocaron conos, tranqueras y luces de advertencia en todo el desvío.' },
  epp:{ t:'Personal sin protección auditiva junto a la compactadora', r:'medio', cond:false, fa:'orden-antes', fd:'orden-despues', sol:'Se entregaron tapones y se reforzó el uso en la charla del día.' },
  extintor:{ t:'Extintor vencido en el campamento', r:'bajo', cond:true, fa:'extintor-antes', fd:'extintor-despues', sol:'Se cambió por uno recargado, colgado y señalizado.' },
  orden:{ t:'Material apilado en la vía de tránsito', r:'bajo', cond:true, fa:'orden-antes', fd:'orden-despues', sol:'Se ordenó el material fuera de la vía y se demarcó el paso.' }
};
var DMA_HORAS = { alto:24, medio:72, bajo:168 };
var DMA_NOMBRES = ['Juan', 'José', 'Luis', 'Carlos', 'Miguel', 'Jorge', 'Pedro', 'Víctor', 'Raúl', 'César', 'Edwin', 'Wilber', 'Freddy', 'Percy', 'Héctor', 'Abel', 'Julio',
  'Rubén', 'Elmer', 'Gustavo', 'Nilton', 'Marco', 'Ronald', 'Wilmer', 'Alex', 'Hugo', 'Iván', 'Óscar', 'Santos', 'Fidel', 'Germán', 'Félix', 'Ángel', 'Walter', 'Erick',
  'Kevin', 'Roberto', 'Simón', 'Ana', 'Rosa', 'María', 'Carmen', 'Lucía', 'Gladys', 'Yesenia', 'Milagros'];
var DMA_APELLIDOS = ['Quispe', 'Mamani', 'Huamán', 'Condori', 'Flores', 'Rojas', 'Torres', 'Vargas', 'Ramos', 'Chávez', 'Cruz', 'Mendoza', 'Ccori', 'Apaza', 'Ticona',
  'Huaraca', 'Pariona', 'Laura', 'Mallma', 'Sánchez', 'Huillca', 'Espinoza', 'Gutiérrez', 'Salas', 'Benites', 'Llanos', 'Cárdenas', 'Inga', 'Choque', 'Yupanqui', 'Vilca',
  'Tito', 'Paredes', 'Coaquira', 'Layme', 'Pari', 'Soto', 'Díaz', 'Paz', 'León', 'Castro', 'Rivas', 'Aguilar', 'Medina', 'Reyes', 'Velásquez', 'Romero', 'Arias'];
var DMA_PUESTOS = ['Operario', 'Oficial', 'Peón', 'Capataz', 'Operador de equipo pesado', 'Vigía', 'Fierrero', 'Soldador', 'Electricista', 'Rigger', 'Topógrafo', 'Almacenero'];
var DMA_FORMATOS = {
  p1:['Inspección de señalización vial', 'Inspección de excavaciones y zanjas', 'Inspección de equipo pesado'],
  p2:['Inspección de equipos de izaje', 'Inspección de andamios', 'Inspección de trabajos en altura'],
  p3:['Inspección de andamios', 'Inspección de instalaciones eléctricas temporales', 'Inspección de orden y limpieza'],
  p4:['Inspección de excavaciones y zanjas', 'Inspección de señalización vial', 'Inspección de orden y limpieza']
};
var DMA_PUNTOS = {
  'Inspección de señalización vial':[['Señalización', 'Conos y tranqueras en todo el desvío'], ['Señalización', 'Luces de advertencia para la noche'], ['Señalización', 'Vigía con paleta PARE/SIGA'], ['Tránsito', 'Velocidad máxima señalizada'], ['Tránsito', 'Paso peatonal protegido']],
  'Inspección de excavaciones y zanjas':[['Antes de entrar', 'Permiso de excavación firmado'], ['Antes de entrar', 'Interferencias identificadas'], ['Protección', 'Entibado o talud según el tipo de suelo'], ['Protección', 'Barrera rígida a 1 m del borde'], ['Acceso', 'Escalera cada 7,5 m']],
  'Inspección de equipo pesado':[['Equipo', 'Alarma de retroceso operativa'], ['Equipo', 'Cinturón de seguridad'], ['Operador', 'Licencia y certificación vigentes'], ['Entorno', 'Vigía en maniobras']],
  'Inspección de equipos de izaje':[['Grúa', 'Certificado de inspección vigente'], ['Grúa', 'Limitador de carga operativo'], ['Maniobra', 'Plan de izaje firmado'], ['Maniobra', 'Rigger certificado'], ['Accesorios', 'Eslingas con su etiqueta de capacidad']],
  'Inspección de andamios':[['Estructura', 'Base sobre placas y niveladas'], ['Estructura', 'Barandas a 1 m y rodapiés'], ['Acceso', 'Escalera interior'], ['Uso', 'Tarjeta verde de andamio operativo']],
  'Inspección de trabajos en altura':[['Permiso', 'PETAR de trabajo en altura firmado'], ['Protección', 'Línea de vida instalada'], ['Protección', 'Arnés con doble línea de anclaje'], ['Rescate', 'Plan de rescate en el frente']],
  'Inspección de instalaciones eléctricas temporales':[['Tableros', 'Tablero con tapa y llave'], ['Tableros', 'Interruptor diferencial'], ['Cables', 'Cables elevados o canalizados'], ['Puesta a tierra', 'Pozo a tierra con su medición']],
  'Inspección de orden y limpieza':[['Vías', 'Vías de tránsito libres'], ['Materiales', 'Material apilado y demarcado'], ['Residuos', 'Residuos en sus cilindros'], ['Emergencias', 'Extintores vigentes y señalizados']]
};

/* ── los números al azar, siempre los mismos ── */
function _dmaAzar(semilla){ var a = semilla >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function _dmaDos(n){ return (n < 10 ? '0' : '') + n; }
function _dmaISO(d){ return d.getFullYear() + '-' + _dmaDos(d.getMonth() + 1) + '-' + _dmaDos(d.getDate()); }
function _dmaDia(iso, n){ var p = String(iso).slice(0, 10).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n); return _dmaISO(d); }
function _dmaT(ms){ return new Date(ms).toISOString(); }
function _dmaNum(pre, n){ return pre + '-' + ('000' + n).slice(-4); }
function _dmaHex(r, n){ var s = ''; for(var i = 0; i < n; i++) s += '0123456789abcdef'.charAt(Math.floor(r() * 16)); return s; }
function dmaFoto(n){ return 'central-demo/' + n + '.jpg'; }

/* ══ LA OBRA DE EJEMPLO, ARMADA HOY ══════════════════════════════════ */
function dmaArmar(t){
  var ahora = Date.now(), hoy = _dmaISO(new Date(ahora)), r = _dmaAzar(t === 'fis' ? 20261028 : 20261029);
  var pick = function(l){ return l[Math.floor(r() * l.length)]; };
  var ent = DMA_ENT[t], pids = DMA_PROY_DE[t];
  var proy = DMA_PROY.filter(function(p){ return pids.indexOf(p.id) > -1; });
  var emps = DMA_EMPS.filter(function(e){ return pids.indexOf(e.p) > -1; }).map(function(e){ return Object.assign({ estado:'activa' }, e, { enl:'L-' + e.id }); });
  var sups = DMA_SUPS.filter(function(s){ return s.ps.some(function(p){ return pids.indexOf(p) > -1; }); }).map(function(s){
    var ps = s.ps.filter(function(p){ return pids.indexOf(p) > -1; }); return Object.assign({}, s, { enl:'L-' + s.id, ps:ps, p:ps[0], estado:'activa', sup:true, peso:0 }); });
  var equipo = DMA_EQUIPO[t].slice(), insp = equipo.filter(function(u){ return u.rango === 'supervisor'; });
  var d = { t:t, ahora:ahora, hoy:hoy, ent:ent, proy:proy, emps:emps, sups:sups, equipo:equipo, obs:[], actas:[], insps:[], ordenes:[], medidas:[], prog:[], recorridos:[], reqs:[], accesos:[], n:{ ob:0, ac:0, in:0, oi:0 } };
  var activas = emps.filter(function(e){ return e.estado === 'activa'; });
  var eP = function(id){ return proy.filter(function(p){ return p.id === id; })[0]; };
  /* el personal de cada empresa (lo que se ve en su ficha: el mandato da el detalle); también el de las supervisoras */
  activas.concat(sups).forEach(function(e){
    var usados = {}; e.personal = [];
    for(var i = 0; i < e.gente; i++){
      var nom; do { nom = pick(DMA_APELLIDOS) + ' ' + pick(DMA_APELLIDOS) + ', ' + pick(DMA_NOMBRES); } while(usados[nom]); usados[nom] = 1;
      var vig = r() < e.cap;
      e.personal.push({ n:nom, td:'DNI', d:String(40000000 + Math.floor(r() * 39999999)), p:e.sup === true ? pick(['Supervisor SSOMA', 'Ingeniero supervisor', 'Inspector de campo']) : pick(DMA_PUESTOS), a:pick(eP(e.p).lug).split(' · ')[0],
        cap:vig ? _dmaDia(hoy, -Math.floor(r() * 300)) : null, caps:vig ? 1 + Math.floor(r() * 4) : 0, ind:r() < 0.97 });
    }
    e.atsL = [];
    for(var k = 0; k < 14; k++){ var dia = _dmaDia(hoy, -k), dw = new Date(dia + 'T12:00:00').getDay(); if(dw === 0) continue;
      for(var q = 0; q < Math.min(3, e.ats[0]); q++) e.atsL.push({ n:'ATS · ' + pick(eP(e.p).lug), f:dia, h:'0' + (7 + q) + ':' + _dmaDos(Math.floor(r() * 50)), g:4 + Math.floor(r() * 9), ok:!(k === 0 && q === 0 && e.ats[1] < e.ats[0]) }); }
    e.ult = ahora - Math.floor((0.2 + r() * 3) * 3600000);
  });
  /* las observaciones de 30 días (unas 1,4 por día) y las de la portada, a propósito */
  var porQuien = function(){ return pick(insp); };
  var nueva = function(e, tipoK, hAtras, op){
    var T = DMA_TIPOS[tipoK], P = eP(e.p), u = (op && op.por) ? equipo.filter(function(x){ return x.uid === op.por; })[0] : porQuien();
    var creado = ahora - hAtras * 3600000, vence = creado + DMA_HORAS[T.r] * 3600000;
    d.n.ob++;
    var o = { id:'ob' + d.n.ob, n:_dmaNum('OB', d.n.ob), enlace:e.enl, emp:e.id, titulo:(op && op.titulo) || T.t, lugar:(op && op.lugar) || pick(P.lug), riesgo:T.r, cond:T.cond,
              creado:creado, vence:vence, por:u.uid, foto:dmaFoto(T.fa), fd:T.fd, sol:T.sol, pasos:[] };
    o.pasos.push({ t:creado, lado:'arriba', que:'observa', uid:u.uid, nota:(op && op.nota) || ('Riesgo ' + T.r + ': plazo de ' + (DMA_HORAS[T.r] < 48 ? DMA_HORAS[T.r] + ' horas' : (DMA_HORAS[T.r] / 24) + ' días') + '.') });
    d.obs.push(o); return o;
  };
  var levanta = function(o, t0){ o.pasos.push({ t:t0, lado:'abajo', que:'levanta', n:dmaContacto(o.emp, d), c:'Supervisor SSOMA', nota:o.sol, foto:dmaFoto(o.fd) }); o.foto_lev = dmaFoto(o.fd); o.levantado = t0; };
  var valida = function(o, t0){ o.pasos.push({ t:t0, lado:'arriba', que:'valida', uid:o.por, nota:'' }); o.validado = t0; };
  var dias = 30, nObs = Math.round(dias * 1.4);
  for(var i = 0; i < nObs; i++){
    var x = r(), ac = 0, e = activas[0];
    for(var j = 0; j < activas.length; j++){ ac += activas[j].peso; if(x * activas.reduce(function(s, a){ return s + a.peso; }, 0) <= ac){ e = activas[j]; break; } }
    var hAtras = 30 + Math.floor(r() * (dias * 24 - 40));
    var o = nueva(e, pick(eP(e.p).tipos), hAtras);
    var plazo = DMA_HORAS[o.riesgo] * 3600000, suerte = r();
    var lev = o.creado + plazo * (suerte > 0.86 ? (1.1 + r() * 0.7) : (0.2 + r() * 0.6));
    if(lev > ahora - 7200000) lev = ahora - 7200000 - r() * 3600000 * 5;
    levanta(o, lev);
    if(r() < 0.08){ o.pasos.push({ t:lev + 3 * 3600000, lado:'arriba', que:'rechaza', uid:o.por, nota:'La foto no muestra el tramo completo. Que se termine y se vuelva a levantar.' }); lev += 9 * 3600000; if(lev < ahora - 3600000) levanta(o, lev); }
    var val = lev + (1 + r() * 8) * 3600000;
    if(val < ahora - 1800000 && o.pasos[o.pasos.length - 1].que === 'levanta') valida(o, val);
  }
  /* las de la portada: lo que se ve en el inicio, en las alertas y en la prioridad */
  var E = function(id){ return emps.filter(function(x){ return x.id === id; })[0]; };
  var fija = [];
  if(t === 'fis'){
    fija.push(nueva(E('e1'), 'senal', 52, { lugar:'Km 12+300 · desvío', nota:'Desvío de la vía sin conos ni luces: de noche no se ve el corte de la calzada.', por:'u3' }));
    fija.push(nueva(E('e1'), 'zanja', 31, { lugar:'Km 14+050', por:'u2' }));
    var oa = nueva(E('e3'), 'arnes', 9, { lugar:'Tablero · eje 3', por:'u4' }); levanta(oa, ahora - 2.5 * 3600000); fija.push(oa);
    fija.push(nueva(E('e3'), 'baranda', 19, { lugar:'Tablero · eje 3', por:'u4' }));
  }
  if(t === 'man'){
    fija.push(nueva(E('e7'), 'senal', 46, { lugar:'Calle 7 · buzón B-14', nota:'Corte de la calzada sin conos ni luces: de noche no se ve.', por:'u3' }));
    fija.push(nueva(E('e7'), 'epp', 98, { lugar:'Línea de impulsión · km 1+200', por:'u2' }));
  }
  fija.push(nueva(E('e5'), 'hueco', 29, { lugar:'Bloque B · piso 3', por:'u2' }));
  fija.push(nueva(E('e7'), 'zanja', 11, { lugar:'Calle 4 · tramo 2', por:'u3' }));
  var ot = nueva(E('e5'), 'tablero', 26, { lugar:'Sótano · cuarto de bombas', por:'u3' }); levanta(ot, ahora - 3.5 * 3600000); fija.push(ot);
  fija.push(nueva(E('e6'), 'cable', 14, { lugar:'Fachada este', por:'u2' }));
  /* registro propio: lo que se le observó a la que todavía no acepta */
  var e8 = E('e8'); if(e8) nueva(e8, 'zanja', 20, { lugar:'Calle 7 · buzón B-14', por:'u3', nota:'Registro propio: la empresa todavía no acepta el requerimiento.' });
  /* las actas, las órdenes y las medidas (Fiscalización) */
  var acta = function(e, tipo, hAtras, op){
    d.n.ac++; var u = equipo.filter(function(x){ return x.uid === op.por; })[0], f = new Date(ahora - hAtras * 3600000);
    var a = { id:'ac' + d.n.ac, n:_dmaNum('AC', d.n.ac), tipo:tipo, enlace:e.enl, emp:e.id, fecha:_dmaISO(f), hora:_dmaDos(f.getHours()) + ':' + _dmaDos(f.getMinutes()), lugar:op.lugar,
              por:op.por, hechos:op.hechos, medidas:op.medidas || [], obs:op.obs || [], conclusiones:op.conc || '', estado:op.estado || 'firmada', t:f.getTime(),
              codigo:'OBR-' + _dmaHex(r, 4).toUpperCase() + '-' + _dmaHex(r, 4).toUpperCase(), huella:_dmaHex(r, 64), orden:op.orden || null };
    a.firmas = [{ rol:'inspector', n:u.n, c:u.c, t:a.t }];
    if(a.estado === 'firmada') a.firmas.push({ rol:'representante', n:dmaContacto(e.id, d), c:'Residente de obra', t:a.t + 1800000 });
    if(a.estado === 'negada'){ a.firmas.push({ rol:'representante', n:dmaContacto(e.id, d), c:'Residente de obra', negada:true, t:a.t + 900000 }, { rol:'testigo', n:'Ernesto Gamarra Soto', c:'Capataz', t:a.t + 1200000 }); }
    if(op.acuse) a.acuse = { n:dmaContacto(e.id, d), t:_dmaT(a.t + op.acuse * 3600000) };
    d.actas.push(a); return a;
  };
  var orden = function(e, u, motivo, detalle, diasPlazo, hAtras, estado, actaId, nota){
    d.n.oi++; var c = ahora - hAtras * 3600000;
    var o = { id:'oi' + d.n.oi, n:_dmaNum('OI', d.n.oi), enlace:e.enl, emp:e.id, inspector:u, motivo:motivo, detalle:detalle || null, plazo:_dmaDia(_dmaISO(new Date(c)), diasPlazo), estado:estado, creado:c, acta:actaId || null, anulado_nota:nota || null };
    d.ordenes.push(o); return o;
  };
  if(t === 'fis'){
    var a1 = acta(E('e2'), 'supervision', 24 * 26, { por:'u2', lugar:'Km 9+800 · cantera', hechos:[{ t:'Voladura sin vigía en el acceso a la cantera.', foto:dmaFoto('orden-antes') }, { t:'Polvorín con su registro al día.' }], conc:'Se ordena colocar vigías en los dos accesos antes de la próxima voladura.', acuse:5 });
    orden(E('e2'), 'u2', 'programada', 'Visita del mes', 5, 24 * 27, 'cerrada', a1.id);
    var a2 = acta(E('e5'), 'supervision', 24 * 19, { por:'u3', lugar:'Bloque A · techo', hechos:[{ t:'Andamio del bloque A sin tarjeta de inspección.', foto:dmaFoto('andamio-antes') }, { t:'Línea de vida instalada en todo el techo.' }], conc:'Se levanta la observación del andamio con plazo de 24 horas.', acuse:3 });
    var a3 = acta(E('e1'), 'fiscalizacion', 24 * 12, { por:'u3', lugar:'Km 16+400 · alcantarilla',
      hechos:[{ t:'Excavación de 2,4 m de profundidad sin entibado, con personal dentro.', med:'Profundidad 2,4 m', foto:dmaFoto('zanja-antes') }, { t:'Sin escalera de salida en la zanja.' }],
      medidas:[{ tipo:'prohibicion', detalle:'Prohibido el ingreso de personal a la zanja de la alcantarilla hasta entibarla.', plazo:_dmaDia(hoy, -8) }], conc:'Se dicta la prohibición de ingreso hasta que se entibe y se coloque la escalera.', acuse:2 });
    orden(E('e1'), 'u3', 'denuncia', 'Denuncia por excavación sin entibar', 3, 24 * 13, 'cerrada', a3.id);
    var a4 = acta(E('e3'), 'fiscalizacion', 24 * 4, { por:'u4', lugar:'Tablero · eje 3',
      hechos:[{ t:'Montaje de vigas metálicas sin línea de vida, a 9 m de altura.', med:'Altura 9 m', foto:dmaFoto('baranda-antes') }, { t:'Grúa de 50 t sin certificado de inspección vigente.' }],
      medidas:[{ tipo:'paralizacion', detalle:'Paralización del montaje de vigas hasta instalar la línea de vida y presentar el certificado de la grúa.' }], conc:'Se paraliza el montaje. La empresa presenta el certificado y la línea de vida para levantar la medida.', acuse:1 });
    orden(E('e3'), 'u4', 'prioridad', 'Índice de riesgo alto: trabajos en altura', 4, 24 * 6, 'cerrada', a4.id);
    var a5 = acta(E('e7'), 'fiscalizacion', 24 * 7, { por:'u2', lugar:'Línea de impulsión · km 1+200', estado:'negada', hechos:[{ t:'Personal sin protección auditiva junto a la compactadora.', foto:dmaFoto('orden-antes') }, { t:'Sin registro de la charla de inicio de jornada del día.' }], conc:'El representante se negó a firmar; firma un testigo.' });
    var a6 = acta(E('e2'), 'supervision', 24 * 4 + 3, { por:'u5', lugar:'Km 14+050', estado:'abierta', hechos:[{ t:'Equipo pesado sin alarma de retroceso operativa.' }], conc:'Se requiere reparar la alarma antes de volver a operar.' });
    orden(E('e1'), 'u3', 'prioridad', 'Índice de riesgo alto: señalización y zanjas', 3, 20, 'asignada');
    orden(E('e7'), 'u4', 'seguimiento', 'Seguimiento del acta', 5, 24 * 6 + 5, 'asignada').sigue = a5.id;            /* vencida: su plazo pasó ayer */
    orden(E('e4'), 'u5', 'programada', 'Visita del mes', 9, 30, 'asignada');
    orden(E('e6'), 'u2', 'otro', 'Pedido del área usuaria', 6, 24 * 10, 'anulada', null, 'Se cruzaba con la visita del mes: se programa junto con ella.');
    d.medidas.push({ id:'md1', enlace:E('e1').enl, emp:'e1', tipo:'prohibicion', detalle:a3.medidas[0].detalle, acta:a3.id, plazo:a3.medidas[0].plazo, estado:'levantada', levantada:ahora - 24 * 9 * 3600000, levantada_nombre:'Milagros Quispe Rojas', nota:'Se entibó todo el tramo y se colocó la escalera.', foto:dmaFoto('zanja-despues') });
    d.medidas.push({ id:'md2', enlace:E('e3').enl, emp:'e3', tipo:'paralizacion', detalle:a4.medidas[0].detalle, acta:a4.id, plazo:null, estado:'vigente' });
    void a2; void a6;
  } else {
    acta(E('e5'), 'supervision', 24 * 9, { por:'u2', lugar:'Bloque A · techo', hechos:[{ t:'Andamio del bloque A sin tarjeta de inspección.', foto:dmaFoto('andamio-antes') }, { t:'Línea de vida instalada en todo el techo.' }], conc:'Se levanta la observación del andamio con plazo de 24 horas.', acuse:3 });
    acta(E('e7'), 'supervision', 24 * 3, { por:'u3', lugar:'Calle 4 · tramo 2', estado:'abierta', hechos:[{ t:'Zanja de 1,8 m sin barrera rígida en el borde.', foto:dmaFoto('zanja-antes') }], conc:'Se requiere colocar barrera rígida en todo el tramo.' });
  }
  /* las inspecciones con lista */
  for(var k2 = 0; k2 < (t === 'fis' ? 11 : 6); k2++){
    var e2 = activas[k2 % activas.length], fmts = DMA_FORMATOS[e2.p], fm = fmts[k2 % fmts.length], P2 = DMA_PUNTOS[fm], u2 = pick(insp);
    var items = P2.map(function(pt, z){ var res = r(); return { b:pt[0], t:pt[1], r:res < 0.78 ? 'c' : (res < 0.93 ? 'nc' : 'na'), nota:'' }; });
    items.forEach(function(it){ if(it.r === 'nc'){ it.nota = 'Se observa en el acta del día.'; it.observar = r() < 0.6; } });
    var ap = items.filter(function(it){ return it.r !== 'na'; }), cum = ap.filter(function(it){ return it.r === 'c'; }).length;
    d.n.in++; var fI = new Date(ahora - (k2 * 2.6 + 1) * 86400000);
    d.insps.push({ id:'in' + d.n.in, n:_dmaNum('IN', d.n.in), enlace:e2.enl, emp:e2.id, fecha:_dmaISO(fI), lugar:pick(eP(e2.p).lug), formato:fm, items:items,
      cumple:cum, nocumple:ap.length - cum, puntaje:ap.length ? 100 * cum / ap.length : null, por:u2.uid, creado:fI.getTime(), nobs:items.filter(function(it){ return it.observar; }).length, nota:'' });
  }
  /* los recorridos de 30 días (con la prueba de presencia) */
  for(var k3 = 0; k3 < (t === 'fis' ? 14 : 8); k3++){
    var e3 = activas[(k3 * 3) % activas.length], u3 = insp[k3 % insp.length], ini = ahora - (k3 * 2.1 + 0.4) * 86400000 - r() * 4 * 3600000;
    var ver = 'en_obra', dist = Math.round(40 + r() * 260);
    if(t === 'fis' && k3 === 4){ ver = 'lejos'; dist = 2380; u3 = insp.filter(function(u){ return u.uid === 'u4'; })[0] || u3; }
    if(k3 === 9){ ver = 'sin_ubicacion'; dist = null; }
    var mins = 50 + Math.floor(r() * 140);
    d.recorridos.push({ id:'rc' + k3, enlace:e3.enl, emp:e3.id, por:u3.uid, inicio:ini, min:mins, veredicto:ver, dist_ini:dist, hizo:{ insp:r() < 0.4 ? 1 : 0, actas:r() < 0.2 ? 1 : 0, obs:Math.floor(r() * 3) }, nota:k3 === 4 ? 'Empezó desde la oficina zonal.' : '' });
  }
  /* el programa del equipo: estas dos semanas */
  var lunes = _dmaDia(hoy, -((new Date(hoy + 'T12:00:00').getDay() + 6) % 7));
  var acts = ['recorrido', 'inspeccion', 'acta'];
  for(var k4 = 0; k4 < 14; k4++){
    var dia2 = _dmaDia(lunes, k4), dw2 = new Date(dia2 + 'T12:00:00').getDay(); if(dw2 === 0 || dw2 === 6) continue;
    for(var q2 = 0; q2 < 2; q2++){
      var e4 = activas[(k4 + q2 * 3) % activas.length], u4 = insp[(k4 + q2) % insp.length], est = 'pendiente';
      if(dia2 < hoy) est = r() < 0.82 ? 'cumplida' : 'no_cumplida';
      if(dia2 === hoy && q2 === 0) est = 'cumplida';
      d.prog.push({ id:'pg' + k4 + q2, enlace:e4.enl, emp:e4.id, fecha:dia2, actividad:acts[(k4 + q2) % 3], inspector:u4.uid, nota:null, estado:est });
    }
  }
  /* lo que se pide en documentos */
  var REQS = [['Plan de seguridad y salud de la obra', 'una', true], ['Constancias de inducción del personal', 'una', true], ['SCTR (pensión y salud) del mes', 'mes', true],
              ['Programa anual de SST', 'una', false], ['Informe mensual de SST', 'mes', false], ['Matriz IPERC de línea base', 'una', false]];
  var mes = hoy.slice(0, 7), mesAnt = _dmaISO(new Date(+hoy.slice(0, 4), +hoy.slice(5, 7) - 2, 1)).slice(0, 7);
  activas.forEach(function(e, ie){
    REQS.forEach(function(q3, iq){
      var est = 'aprobado', x2 = r();
      if(e.id === 'e1' && iq === 2) est = 'pendiente';
      else if(e.id === 'e3' && iq === 0) est = 'observado';
      else if(e.id === 'e5' && iq === 4) est = 'entregado';
      else if(e.id === 'e7' && (iq === 2 || iq === 5)) est = iq === 2 ? 'entregado' : 'pendiente';
      else if(x2 < 0.08) est = 'pendiente';
      var ent2 = est === 'aprobado' || est === 'entregado' || est === 'observado';
      d.reqs.push({ id:'rq' + ie + iq, enlace:e.enl, emp:e.id, item:q3[0], cada:q3[1], ingreso:q3[2], estado:est, periodo:q3[1] === 'mes' ? (est === 'pendiente' ? mesAnt : mes) : null,
        url:ent2 ? 'central-demo/documento-ejemplo.pdf' : null, archivo:ent2 ? q3[0].replace(/[^A-Za-z0-9áéíóúñÁÉÍÓÚÑ]+/g, '-').toLowerCase() + '.pdf' : null,
        entregado:ent2 ? ahora - (2 + r() * 20) * 86400000 : null, nota:est === 'observado' ? 'Falta el procedimiento de montaje de vigas y la firma del residente.' : null });
    });
  });
  /* quién miró qué (los accesos quedan sellados) */
  for(var k5 = 0; k5 < 16; k5++){ var e5 = activas[k5 % activas.length]; d.accesos.push({ t:ahora - k5 * 1.7 * 86400000, uid:insp[k5 % insp.length].uid, enlace:e5.enl, emp:e5.id, que:pick(['ficha', 'inspecciones', 'documentos', 'acta']) }); }
  if(t === 'fis') for(var k6 = 0; k6 < 3; k6++) d.accesos.push({ t:ahora - (k6 + 1) * 2.2 * 86400000, uid:'u4', enlace:'L-e4', emp:'e4', que:'documentos', sinOrden:true });
  d.reglas = { obs_alto:500, obs_otro:150, doc:200, insp_bajo:800, umbral:80, tope_pct:5 };
  d.fijas = fija.map(function(o){ return o.id; });
  /* los números van por orden de llegada, como en el servidor */
  var renum = function(L, pre, tf){ L.slice().sort(function(x, y){ return tf(x) - tf(y); }).forEach(function(x, k){ x.n = _dmaNum(pre, k + 1); }); };
  renum(d.obs, 'OB', function(o){ return o.creado; }); renum(d.actas, 'AC', function(a){ return a.t; });
  renum(d.insps, 'IN', function(i){ return i.creado; }); renum(d.ordenes, 'OI', function(o){ return o.creado; });
  d.ordenes.forEach(function(o){ if(o.sigue){ var ac = d.actas.filter(function(a){ return a.id === o.sigue; })[0]; if(ac) o.detalle = 'Seguimiento del acta ' + ac.n; } });
  return d;
}
function dmaContacto(emp, d){ var e = (d || DMA.d).emps.filter(function(x){ return x.id === emp; })[0]; return e ? e.contacto : ''; }
function dmaUsr(uid){ return (DMA.d.equipo.filter(function(u){ return u.uid === uid; })[0]) || { uid:uid, n:'', c:'' }; }
function dmaEmpDe(enl){ var d = DMA.d; return d.emps.filter(function(e){ return e.enl === enl; })[0] || d.sups.filter(function(s){ return s.enl === enl; })[0] || null; }
function dmaProy(pid){ return DMA.d.proy.filter(function(p){ return p.id === pid; })[0] || { n:'', reg:'' }; }
function dmaYo(){ var R = (DMA_ROLES[DMA.t] || []).filter(function(x){ return x.k === DMA.rol; })[0] || DMA_ROLES[DMA.t][1]; return dmaUsr(R.u); }

/* ── el estado de cada observación ── */
function dmaEst(o){
  var ult = o.pasos[o.pasos.length - 1].que;
  if(o.anulada) return 'anulada';
  return ult === 'valida' ? 'cerrada' : (ult === 'levanta' ? 'levantada' : 'abierta');
}
function dmaNivel(o){ if(dmaEst(o) !== 'abierta') return 0; var v = DMA.d.ahora - o.vence; return v <= 0 ? 0 : (v > 86400000 ? 2 : 1); }
function dmaObsJson(o, conPasos){
  var e = dmaEmpDe(o.enlace), u = dmaUsr(o.por), est = dmaEst(o), ult = o.pasos[o.pasos.length - 1];
  var x = { id:o.id, n:o.n, enlace:o.enlace, arriba:DMA.d.ent.nombre, abajo:e ? e.n : '', riesgo:o.riesgo, cond:o.cond, titulo:o.titulo, lugar:o.lugar, foto:o.foto,
            vence:_dmaT(o.vence), estado:est, creado:_dmaT(o.creado), por:{ n:u.n, c:u.c }, mia:o.por === dmaYo().uid, propio:!!(e && e.estado !== 'activa'),
            levantado:o.levantado ? _dmaT(o.levantado) : null, validado:o.validado ? _dmaT(o.validado) : null, nivel:dmaNivel(o), foto_lev:o.foto_lev || null,
            ult:{ que:ult.que, t:_dmaT(ult.t), n:ult.uid ? dmaUsr(ult.uid).n : (ult.n || ''), nota:ult.nota || '' } };
  if(conPasos) x.pasos = o.pasos.map(function(p){ var pu = p.uid ? dmaUsr(p.uid) : null; return { t:_dmaT(p.t), lado:p.lado, que:p.que, n:pu ? pu.n : (p.n || ''), c:pu ? pu.c : (p.c || ''), nota:p.nota || '', foto:p.foto || null }; });
  return x;
}
/* lo que se resume de cada enlace: sus observaciones, lo pedido y sus inspecciones */
function dmaObsRes(enl){
  var d = DMA.d, L = d.obs.filter(function(o){ return o.enlace === enl; }), r = { ab:0, ven:0, val:0, lev:0, a_tiempo:0, total:L.length, alto:0, medio:0, bajo:0, n3:0 };
  var desde = d.ahora - 30 * 86400000;
  L.forEach(function(o){
    var est = dmaEst(o), niv = dmaNivel(o);
    if(est === 'abierta'){ r.ab++; r[o.riesgo]++; if(niv >= 1) r.ven++; if(d.ahora - o.vence > 2 * 86400000) r.n3++; }
    if(est === 'levantada') r.val++;
    if(o.levantado && o.creado >= desde){ r.lev++; var pl = o.pasos.filter(function(p){ return p.que === 'levanta'; })[0]; if(pl && pl.t <= o.vence) r.a_tiempo++; }
  });
  return r;
}
function dmaReqRes(enl){
  var L = DMA.d.reqs.filter(function(q){ return q.enlace === enl && q.estado !== 'anulado'; }), ing = L.filter(function(q){ return q.ingreso; });
  return { total:L.length, ok:L.filter(function(q){ return q.estado === 'aprobado'; }).length, por_revisar:L.filter(function(q){ return q.estado === 'entregado'; }).length,
           ingreso:ing.length, homologada:ing.length ? ing.every(function(q){ return q.estado === 'aprobado'; }) : null };
}
function dmaInspRes(enl){
  var mes = DMA.d.hoy.slice(0, 7), L = DMA.d.insps.filter(function(i){ return i.enlace === enl; });
  return { n:L.length, mes:L.filter(function(i){ return i.fecha.slice(0, 7) === mes; }).length };
}
function dmaInd(e){
  if(!e || e.estado !== 'activa' || !e.personal) return null;
  return { gente:e.gente, cap:e.personal.filter(function(p){ return p.cap; }).length, ats:e.ats[0], ats_ok:e.ats[1], rep_ab:e.rep, rep_mes:e.rep + 4, epp_mes:Math.round(e.gente * 1.7),
           insp_mes:dmaInspRes(e.enl).mes, acc_anio:e.acc, ult:_dmaT(e.ult) };
}
/* el enlace, como lo da el servidor (_cad_enlace_json desde arriba) */
function dmaEnlaceJson(x, esSup){
  var d = DMA.d, inv = x.estado === 'invitada';
  var j = { id:x.enl, clase:'supervision', papel:d.t === 'fis' ? 'regulador' : 'cliente', modo:'observa', ve:'detalle', estado:x.estado || 'activa', nombre:x.n, razon:x.n, ruc:x.ruc,
            contacto:x.contacto || null, invite_yo:true, creado:_dmaT(d.ahora - 60 * 86400000) };
  if(inv){ j.token = (x.token || ('d' + x.id + '00000000000000000000000000000000')).slice(0, 32); j.vence = _dmaDia(d.hoy, x.venceDias != null ? x.venceDias : 6); j.vencida = j.vence < d.hoy; }
  else { j.aceptado = _dmaT(d.ahora - 55 * 86400000); j.acepto = (x.contacto || 'r').toLowerCase().charAt(0) + '•••@' + 'empresa.ejemplo'; }
  if(esSup) j.incluida = true;
  return j;
}

/* ══ LAS FUNCIONES DEL SERVIDOR, AQUÍ ════════════════════════════════
   Cada una contesta lo mismo que su función de verdad (los mismos
   campos). Las que escriben cambian la obra de ejemplo y lo anotan. */
var DMA_RPC = {
  sst_cad_inicio:function(){
    var d = DMA.d, yo = dmaYo(), manda = yo.rango !== 'supervisor', min = yo.rango === 'gerente' ? 2 : (yo.rango === 'jefe' ? 1 : 99);
    var abajo = d.emps.map(function(e){
      var j = dmaEnlaceJson(e, false);
      j.obs = dmaObsRes(e.enl); j.req = dmaReqRes(e.enl); j.insp = dmaInspRes(e.enl);
      if(e.estado === 'activa') j.ind = dmaInd(e); else j.registro_propio = true;
      return j;
    }).concat(d.sups.map(function(s){ var j = dmaEnlaceJson(s, true); j.obs = dmaObsRes(s.enl); j.req = dmaReqRes(s.enl); j.insp = dmaInspRes(s.enl); j.ind = dmaInd(s); return j; }));
    var abiertas = d.obs.filter(function(o){ return dmaEst(o) === 'abierta'; });
    return { ok:true, rango:yo.rango, dueno:yo.rango === 'gerente', central:{ activo:false, usadas:0, plazos:{ alto:24, medio:72, bajo:168 } },
      tier:{ tipo:d.ent.tipo, hasta:_dmaDia(d.hoy, 400), puestos:d.ent.puestos, madre:false, estandar:true, supervisoras:{ tope:d.ent.incl, usadas:d.sups.length } },
      patrocinada:false, grado:d.t === 'fis' ? 4 : 3,
      puedo:{ invitar_sub:false, invitar_arriba:manda, supervisar:manda, incluir:manda, estandar:manda, rangos:yo.rango === 'gerente' },
      abajo:abajo, arriba:[],
      cuenta:{ por_levantar:0, vencidas_mias:0, por_validar:d.obs.filter(function(o){ return dmaEst(o) === 'levantada'; }).length,
               subio:min === 99 ? 0 : abiertas.filter(function(o){ return dmaNivel(o) >= min; }).length,
               mias_vencidas:abiertas.filter(function(o){ return o.por === yo.uid && dmaNivel(o) >= 1; }).length, docs_por_entregar:0,
               docs_por_revisar:d.reqs.filter(function(q){ return q.estado === 'entregado'; }).length } };
  },
  sst_cad_obs:function(a){
    var p = a.p || {}; if(p.lado === 'abajo') return { ok:true, lista:[] };
    return { ok:true, lista:DMA.d.obs.slice().sort(function(x, y){ return y.creado - x.creado; }).map(function(o){ return dmaObsJson(o, false); }) };
  },
  sst_cad_obs_ver:function(a){
    var o = DMA.d.obs.filter(function(x){ return x.id === (a.p || {}).id; })[0]; if(!o) return { ok:false, motivo:'no_existe' };
    var e = dmaEmpDe(o.enlace);
    return { ok:true, lado:'arriba', obs:dmaObsJson(o, true), contacto:{ n:e ? e.contacto : '' }, modo:'observa', enlace_estado:e && e.estado === 'activa' ? 'activa' : 'invitada' };
  },
  sst_cad_validar:function(a){ return dmaHacer({ op:'validar', id:a.p.id, ok:!!a.p.ok, nota:a.p.nota || '' }); },
  sst_cad_anular:function(a){ return dmaHacer({ op:'anular', id:a.p.id, nota:a.p.nota || '' }); },
  sst_cad_nota:function(a){ return dmaHacer({ op:'nota', id:a.p.id, nota:a.p.nota || '', foto:a.p.foto || null }); },
  sst_cad_observar:function(a){ return dmaHacer({ op:'observar', enlace:a.p.enlace, titulo:a.p.titulo, lugar:a.p.lugar, riesgo:a.p.riesgo, cond:a.p.cond !== false, nota:a.p.nota, foto:a.p.foto || null }); },
  sst_cad_empresa:function(a){
    var x = dmaEmpDe((a.p || {}).enlace); if(!x || x.estado !== 'activa' || !x.personal) return { ok:false, motivo:'no_existe' };
    var r = dmaObsRes(x.enl);
    return { ok:true, enlace:dmaEnlaceJson(x, false), ind:dmaInd(x), obs:r, personal:x.personal, ats:x.atsL };
  },
  sst_cad_equipo:function(){
    var yo = dmaYo();
    return { ok:true, puedo:yo.rango === 'gerente', equipo:DMA.d.equipo.map(function(u){ return { nombre:u.n, correo:u.correo, rol:u.rol || 'supervisor', puesto:true, rango:u.rango, yo:u.uid === yo.uid }; }) };
  },
  sst_cad_rango:function(a){ return dmaHacer({ op:'rango', correo:a.p.correo, rango:a.p.rango }); },
  sst_cad_cartera:function(){
    var d = DMA.d, L = d.emps.map(function(e){
      var j = dmaEnlaceJson(e, false), P = dmaProy(e.p);
      return Object.assign(j, { obra:P.n, obra_id:d.ent.id, mia:true, ind:dmaInd(e), obs:dmaObsRes(e.enl), req:dmaReqRes(e.enl), insp:dmaInspRes(e.enl), registro_propio:e.estado !== 'activa',
        homologada:e.estado === 'activa' ? dmaReqRes(e.enl).homologada : null });
    }).concat(d.sups.map(function(s){ var j = dmaEnlaceJson(s, true); return Object.assign(j, { obra:s.ps.map(function(p){ return dmaProy(p).n; }).join(' · '), mia:true, ind:dmaInd(s), obs:dmaObsRes(s.enl), req:dmaReqRes(s.enl), insp:dmaInspRes(s.enl) }); }));
    var act = L.filter(function(x){ return x.estado === 'activa'; }), sum = function(f){ return L.reduce(function(s, x){ return s + (f(x) || 0); }, 0); };
    return { ok:true, tier:{ tipo:d.ent.tipo, hasta:_dmaDia(d.hoy, 400) }, obras:1, lista:L, ahora:_dmaT(d.ahora),
      tot:{ empresas:act.length, invitadas:L.filter(function(x){ return x.estado === 'invitada'; }).length, rechazaron:0, no_atendieron:L.filter(function(x){ return x.vencida; }).length,
            gente:sum(function(x){ return x.ind && x.ind.gente; }), ab:sum(function(x){ return x.obs.ab; }), ven:sum(function(x){ return x.obs.ven; }), val:sum(function(x){ return x.obs.val; }),
            lev:sum(function(x){ return x.obs.lev; }), a_tiempo:sum(function(x){ return x.obs.a_tiempo; }), req_total:sum(function(x){ return x.req.total; }), req_ok:sum(function(x){ return x.req.ok; }),
            req_por_revisar:sum(function(x){ return x.req.por_revisar; }), insp_mes:sum(function(x){ return x.insp.mes; }), acc:sum(function(x){ return x.ind && x.ind.acc_anio; }) } };
  },
  sst_cad_reqs:function(a){
    var enl = (a.p || {}).enlace, x = dmaEmpDe(enl); if(!x) return { ok:false, motivo:'enlace' };
    return { ok:true, mes:DMA.d.hoy.slice(0, 7), enlace:{ nombre:x.n, razon:x.n }, resumen:dmaReqRes(enl),
      lista:DMA.d.reqs.filter(function(q){ return q.enlace === enl; }).map(function(q){ return { id:q.id, item:q.item, detalle:null, nota:q.nota, ingreso:q.ingreso, cada:q.cada, periodo:q.periodo,
        estado:q.estado, hoy:q.estado, url:q.url, archivo:q.archivo, entregado:q.entregado ? _dmaT(q.entregado) : null }; }) };
  },
  sst_cad_req_poner:function(a){ return a.p.anular ? dmaHacer({ op:'req_anular', id:a.p.id, nota:a.p.nota }) : dmaHacer({ op:'req_poner', enlace:a.p.enlace, items:a.p.items }); },
  sst_cad_req_revisar:function(a){ return dmaHacer({ op:'req_revisar', id:a.p.id, ok:!!a.p.ok, nota:a.p.nota || null }); },
  sst_cad_prog:function(a){
    var p = a.p || {}, d = DMA.d, desde = p.desde || d.hoy, hasta = p.hasta || _dmaDia(desde, 13);
    var L = d.prog.filter(function(x){ return x.fecha >= desde && x.fecha <= hasta; }).sort(function(x, y){ return x.fecha < y.fecha ? -1 : (x.fecha > y.fecha ? 1 : 0); });
    var pas = L.filter(function(x){ return x.estado === 'cumplida' || x.estado === 'no_cumplida'; }), cum = pas.filter(function(x){ return x.estado === 'cumplida'; }).length;
    return { ok:true, desde:desde, hasta:hasta, resumen:{ programadas:L.filter(function(x){ return x.estado !== 'anulada'; }).length, cumplidas:cum, no_cumplidas:pas.length - cum,
      pendientes:L.filter(function(x){ return x.estado === 'pendiente'; }).length, pct:pas.length ? Math.round(100 * cum / pas.length) : null },
      lista:L.map(function(x){ var e = dmaEmpDe(x.enlace); return { id:x.id, fecha:x.fecha, actividad:x.actividad, nota:x.nota, empresa:e ? e.n : '', inspector_nombre:x.inspector ? dmaUsr(x.inspector).n : null, estado:x.estado, anulado_nota:x.anulado_nota || null }; }) };
  },
  sst_cad_prog_poner:function(a){ return a.p.anular ? dmaHacer({ op:'prog_anular', id:a.p.id, nota:a.p.nota }) : dmaHacer({ op:'prog_poner', items:a.p.items }); },
  sst_cad_recorridos:function(){
    var d = DMA.d;
    return { ok:true, desde:_dmaDia(d.hoy, -29), hasta:d.hoy, lista:d.recorridos.slice().sort(function(x, y){ return y.inicio - x.inicio; }).map(function(x){ var e = dmaEmpDe(x.enlace);
      return { inicio:_dmaT(x.inicio), empresa:e ? e.n : '', por:{ n:dmaUsr(x.por).n }, min:x.min, veredicto:x.veredicto, dist_ini:x.dist_ini, hizo:x.hizo, nota:x.nota }; }) };
  },
  sst_cad_actas:function(a){
    if((a.p || {}).lado === 'abajo') return { ok:true, lista:[] };
    return { ok:true, lista:DMA.d.actas.slice().sort(function(x, y){ return y.t - x.t; }).map(function(x){ var e = dmaEmpDe(x.enlace);
      return { id:x.id, n:x.n, tipo:x.tipo, fecha:x.fecha, hora:x.hora, empresa:e ? e.n : '', propio:!!(e && e.estado !== 'activa'), nhechos:x.hechos.length, estado:x.estado, acuse:x.acuse || null }; }) };
  },
  sst_cad_acta_ver:function(a){
    var x = DMA.d.actas.filter(function(z){ return z.id === (a.p || {}).id; })[0]; if(!x) return { ok:false, motivo:'no_existe' };
    var e = dmaEmpDe(x.enlace);
    return { ok:true, acta:{ id:x.id, n:x.n, tipo:x.tipo, estado:x.estado, codigo:x.codigo, huella:x.huella, acuse:x.acuse || null, firmas:x.firmas.map(function(f){ return Object.assign({}, f, { t:_dmaT(f.t) }); }),
      obs:(x.obs || []).map(function(id){ var o = DMA.d.obs.filter(function(z){ return z.id === id; })[0]; return o ? { riesgo:o.riesgo, n:o.n, titulo:o.titulo, vence:_dmaT(o.vence) } : null; }).filter(Boolean),
      contenido:{ emisor:DMA.d.ent.nombre, empresa:e ? e.n : '', fecha:x.fecha, hora:x.hora, lugar:x.lugar, hechos:x.hechos, medidas:x.medidas, conclusiones:x.conclusiones } } };
  },
  sst_cad_insps:function(a){
    if((a.p || {}).lado === 'abajo') return { ok:true, lista:[] };
    return { ok:true, lista:DMA.d.insps.slice().sort(function(x, y){ return y.creado - x.creado; }).map(function(x){ var e = dmaEmpDe(x.enlace);
      return { id:x.id, n:x.n, fecha:x.fecha, abajo:e ? e.n : '', propio:false, formato:x.formato, cumple:x.cumple, nocumple:x.nocumple, puntaje:x.puntaje, por:{ n:dmaUsr(x.por).n }, nobs:x.nobs }; }) };
  },
  sst_cad_insp_ver:function(a){
    var x = DMA.d.insps.filter(function(z){ return z.id === (a.p || {}).id; })[0]; if(!x) return { ok:false, motivo:'no_existe' };
    var e = dmaEmpDe(x.enlace), u = dmaUsr(x.por);
    return { ok:true, insp:{ n:x.n, formato:x.formato, abajo:e ? e.n : '', fecha:x.fecha, lugar:x.lugar, puntaje:x.puntaje, items:x.items, nota:x.nota, por:{ n:u.n, c:u.c }, creado:_dmaT(x.creado) } };
  },
  sst_cad_productividad:function(a){
    var d = DMA.d, m = ((a.p || {}).mes) || d.hoy.slice(0, 7), yo = dmaYo(), enMes = function(t){ return _dmaISO(new Date(t)).slice(0, 7) === m; };
    var L = d.equipo.filter(function(u){ return u.rango !== 'gerente'; }).map(function(u){
      var rec = d.recorridos.filter(function(x){ return x.por === u.uid && enMes(x.inicio); }), eo = rec.filter(function(x){ return x.veredicto === 'en_obra'; });
      var ins = d.insps.filter(function(x){ return x.por === u.uid && x.fecha.slice(0, 7) === m; }), con = ins.filter(function(x){ return x.puntaje != null; });
      var pg = d.prog.filter(function(x){ return x.inspector === u.uid && x.fecha.slice(0, 7) === m && (x.estado === 'cumplida' || x.estado === 'no_cumplida'); }), cu = pg.filter(function(x){ return x.estado === 'cumplida'; }).length;
      return { uid:u.uid, nombre:u.n, rango:u.rango, yo:u.uid === yo.uid, recorridos:rec.length, en_obra:eo.length, horas_obra:Math.round(eo.reduce(function(s, x){ return s + x.min; }, 0) / 6) / 10,
        insp:ins.length, insp_prom:con.length ? con.reduce(function(s, x){ return s + x.puntaje; }, 0) / con.length : null, actas:d.actas.filter(function(x){ return x.por === u.uid && x.fecha.slice(0, 7) === m; }).length,
        obs:d.obs.filter(function(x){ return x.por === u.uid && enMes(x.creado); }).length, cierres:d.obs.filter(function(x){ return x.por === u.uid && x.validado && enMes(x.validado); }).length,
        programadas:pg.length, cumplidas:cu, prog_pct:pg.length ? Math.round(100 * cu / pg.length) : null };
    });
    if(yo.rango === 'supervisor') L = L.filter(function(g){ return g.yo; });
    return { ok:true, mes:m, lista:L };
  },
  sst_cad_informe:function(a){
    var d = DMA.d, m = ((a.p || {}).mes) || d.hoy.slice(0, 7), enMes = function(t){ return _dmaISO(new Date(t)).slice(0, 7) === m; };
    return { ok:true, mes:m, empresa:d.ent.nombre, ahora:_dmaT(d.ahora), lista:d.emps.filter(function(e){ return e.estado === 'activa'; }).map(function(e){
      var O = d.obs.filter(function(o){ return o.enlace === e.enl && enMes(o.creado); }), I = d.insps.filter(function(i){ return i.enlace === e.enl && i.fecha.slice(0, 7) === m; }), con = I.filter(function(i){ return i.puntaje != null; });
      return { nombre:e.n, obra:dmaProy(e.p).n, ind:{ gente:e.gente }, req:dmaReqRes(e.enl),
        obs:{ n:O.length, alto:O.filter(function(o){ return o.riesgo === 'alto'; }).length, cerradas:O.filter(function(o){ return dmaEst(o) === 'cerrada'; }).length,
              a_tiempo:O.filter(function(o){ var pl = o.pasos.filter(function(p){ return p.que === 'levanta'; })[0]; return pl && pl.t <= o.vence; }).length, vencidas:O.filter(function(o){ return dmaNivel(o) >= 1; }).length },
        insp:{ n:I.length, prom:con.length ? con.reduce(function(s, i){ return s + i.puntaje; }, 0) / con.length : null } };
    }) };
  },
  sst_cad_tablero:function(){
    var d = DMA.d, act = d.emps.filter(function(e){ return e.estado === 'activa'; }), R = act.map(function(e){ return { e:e, o:dmaObsRes(e.enl), q:dmaReqRes(e.enl) }; });
    var k = { proyectos:d.proy.length, empresas:act.length, supervisoras:d.sups.length, gente:act.reduce(function(s, e){ return s + e.gente; }, 0),
              ab:R.reduce(function(s, x){ return s + x.o.ab; }, 0), ven:R.reduce(function(s, x){ return s + x.o.ven; }, 0), lev:R.reduce(function(s, x){ return s + x.o.lev; }, 0),
              a_tiempo:R.reduce(function(s, x){ return s + x.o.a_tiempo; }, 0), con_ingreso:R.filter(function(x){ return x.q.ingreso; }).length,
              homologadas:R.filter(function(x){ return x.q.homologada; }).length, acc:act.reduce(function(s, e){ return s + e.acc; }, 0) };
    return { ok:true, cifras:k, alertas:dmaAlertas('tablero'), ahora:_dmaT(d.ahora) };
  },
  sst_cad_ranking:function(){ return { ok:true, como:'La nota sale de levantar a tiempo (40 %), el promedio de sus inspecciones (25 %), no tener observaciones de riesgo alto vencidas (20 %) y lo pedido en documentos (15 %). Los accidentes se muestran aparte.', lista:dmaRanking() }; },
  sst_cad_reglas:function(a){ var p = a.p || {}; if(Object.keys(p).length > 1) return dmaHacer({ op:'reglas', reglas:p }); return { ok:true, reglas:DMA.d.reglas }; },
  sst_cad_retencion:function(a){ return dmaRetencion(a.p || {}); },
  sst_cad_auditoria:function(a){ return dmaAuditoria(((a.p || {}).mes) || DMA.d.hoy.slice(0, 7)); },
  sst_cad_prioridad:function(a){ return dmaPrioridad((a.p || {}).region || null); },
  sst_cad_ordenes:function(a){
    var est = (a.p || {}).estado || null, d = DMA.d, yo = dmaYo();
    return { ok:true, lista:d.ordenes.filter(function(o){ return !est || o.estado === est; }).sort(function(x, y){ return y.creado - x.creado; }).map(function(o){
      var e = dmaEmpDe(o.enlace), ac = d.actas.filter(function(x){ return x.id === o.acta; })[0];
      return { id:o.id, n:o.n, enlace:o.enlace, empresa:e ? e.n : '', inspector_nombre:dmaUsr(o.inspector).n, mia:o.inspector === yo.uid, motivo:o.motivo, detalle:o.detalle, plazo:o.plazo,
               estado:o.estado, vencida:o.estado === 'asignada' && o.plazo < d.hoy, creado:_dmaT(o.creado), acta:ac ? { id:ac.id, n:ac.n } : null, anulado_nota:o.anulado_nota }; }) };
  },
  sst_cad_orden_nueva:function(a){ return dmaHacer({ op:'orden', enlace:a.p.enlace, inspector:a.p.inspector, motivo:a.p.motivo, detalle:a.p.detalle, plazo:a.p.plazo }); },
  sst_cad_orden_anular:function(a){ return dmaHacer({ op:'orden_anular', id:a.p.id, nota:a.p.nota }); },
  sst_cad_medidas:function(a){
    var d = DMA.d, p = a.p || {}; if(p.lado === 'abajo') return { ok:true, lista:[] };
    return { ok:true, lista:d.medidas.filter(function(m){ return !p.vigentes || m.estado === 'vigente'; }).map(function(m){ var e = dmaEmpDe(m.enlace), ac = d.actas.filter(function(x){ return x.id === m.acta; })[0];
      return { id:m.id, tipo:m.tipo, detalle:m.detalle, empresa:e ? e.n : '', acta:ac ? { id:ac.id, n:ac.n, fecha:ac.fecha } : null, plazo:m.plazo, estado:m.estado,
               levantada:m.levantada ? _dmaT(m.levantada) : null, levantada_nombre:m.levantada_nombre || null, nota:m.nota || null, foto:m.foto || null }; }) };
  },
  sst_cad_medida_levantar:function(a){ return dmaHacer({ op:'medida_levantar', id:a.p.id, nota:a.p.nota, foto:a.p.foto }); },
  sst_cad_control:function(a){ return dmaControl(a.p || {}); },
  sst_cad_expediente:function(a){ return dmaExpediente(a.p || {}); },
  sst_cad_invitar:function(a){ return dmaHacer({ op:'invitar', nombre:a.p.nombre, ruc:a.p.ruc, contacto:a.p.contacto, incluir:!!a.p.incluir }); },
  sst_cad_reinvitar:function(a){ return dmaHacer({ op:'reinvitar', enlace:a.p.enlace, quitar:!!a.p.quitar }); },
  sst_cad_terminar:function(){ return { ok:false, motivo:'demo' }; },
  sst_cad_invitacion:function(){ return { ok:false, motivo:'no_existe' }; }
};

/* ── lo que se calcula ── */
function dmaAlertas(para){
  var d = DMA.d, A = [];
  d.emps.filter(function(e){ return e.estado === 'activa'; }).forEach(function(e){
    var alto = d.obs.filter(function(o){ return o.enlace === e.enl && o.riesgo === 'alto' && dmaEst(o) === 'abierta' && d.ahora - o.vence > 86400000; }).length;
    if(alto) A.push({ g:1, que:'alto_vencido', empresa:e.n, n:alto });
    var q = dmaReqRes(e.enl); if(q.ingreso && !q.homologada) A.push({ g:2, que:'sin_homologar', empresa:e.n, faltan:d.reqs.filter(function(x){ return x.enlace === e.enl && x.ingreso && x.estado !== 'aprobado' && x.estado !== 'anulado'; }).length });
    if(e.acc) A.push({ g:2, que:'accidentes', empresa:e.n, n:e.acc });
  });
  d.emps.filter(function(e){ return e.estado === 'invitada' && e.vencida; }).forEach(function(e){ A.push({ g:2, que:'no_atendio', empresa:e.n, t:_dmaDia(d.hoy, -1) }); });
  d.sups.forEach(function(s, k){
    if(k === 0) A.push({ g:3, que:'supervisora_programa', empresa:s.n, pct:74 });
    var lev = d.obs.filter(function(o){ return dmaEst(o) === 'levantada' && d.ahora - o.levantado > 86400000; }).length; if(lev) A.push({ g:3, que:'supervisora_valida', empresa:s.n, n:lev });
  });
  if(d.t === 'fis'){
    var sin = d.accesos.filter(function(x){ return x.sinOrden; }); if(sin.length) A.push({ g:2, que:'acceso_sin_orden', empresa:dmaEmpDe(sin[0].enlace).n, n:dmaUsr(sin[0].uid).n, veces:sin.length });
    d.ordenes.filter(function(o){ return o.estado === 'asignada' && o.plazo < d.hoy; }).forEach(function(o){ A.push({ g:1, que:'orden_vencida', orden:o.n, n:dmaUsr(o.inspector).n, empresa:dmaEmpDe(o.enlace).n, t:o.plazo }); });
    d.actas.filter(function(a){ return a.estado === 'abierta' && d.ahora - a.t > 3 * 86400000; }).forEach(function(a){ A.push({ g:2, que:'acta_abierta', acta:a.n, n:dmaUsr(a.por).n, empresa:dmaEmpDe(a.enlace).n }); });
    d.recorridos.filter(function(x){ return x.veredicto === 'lejos'; }).forEach(function(x){ A.push({ g:3, que:'recorrido_lejos', n:dmaUsr(x.por).n, empresa:dmaEmpDe(x.enlace).n, metros:x.dist_ini }); });
  }
  if(para === 'tablero') A = A.filter(function(a){ return ['acceso_sin_orden', 'recorrido_lejos'].indexOf(a.que) < 0; });
  return A.sort(function(x, y){ return x.g - y.g; });
}
function dmaRanking(){
  var d = DMA.d;
  return d.emps.filter(function(e){ return e.estado === 'activa'; }).map(function(e){
    var o = dmaObsRes(e.enl), q = dmaReqRes(e.enl), I = d.insps.filter(function(i){ return i.enlace === e.enl && i.puntaje != null; });
    var at = o.lev ? Math.round(100 * o.a_tiempo / o.lev) : 100, ins = I.length ? Math.round(I.reduce(function(s, i){ return s + i.puntaje; }, 0) / I.length) : 80;
    var altoV = d.obs.filter(function(x){ return x.enlace === e.enl && x.riesgo === 'alto' && dmaNivel(x) >= 1; }).length, sinA = Math.max(0, 100 - altoV * 35), doc = q.total ? Math.round(100 * q.ok / q.total) : 100;
    return { nombre:e.n, ruc:e.ruc, donde:[{ proyecto:dmaProy(e.p).n, supervisora:(d.sups.filter(function(s){ return s.id === e.sup; })[0] || {}).n || null }],
      nota:Math.round(at * 0.4 + ins * 0.25 + sinA * 0.2 + doc * 0.15), a_tiempo:at, inspecciones:ins, sin_alto_vencido:sinA, documentos:doc, ab:o.ab, ven:o.ven, acc:e.acc, homologada:q.homologada };
  }).sort(function(x, y){ return y.nota - x.nota; });
}
function dmaPrioridad(region){
  var d = DMA.d, todas = d.emps.filter(function(e){ return e.estado === 'activa'; }).map(function(e){
    var o = dmaObsRes(e.enl), q = dmaReqRes(e.enl), I = d.insps.filter(function(i){ return i.enlace === e.enl && i.puntaje != null; });
    var ins = I.length ? I.reduce(function(s, i){ return s + i.puntaje; }, 0) / I.length : 85;
    var ult = Math.max.apply(null, [0].concat(d.recorridos.filter(function(x){ return x.enlace === e.enl; }).map(function(x){ return x.inicio; }), d.actas.filter(function(x){ return x.enlace === e.enl; }).map(function(x){ return x.t; })));
    var altoV = d.obs.filter(function(x){ return x.enlace === e.enl && x.riesgo === 'alto' && dmaNivel(x) >= 1; }).length;
    var por = { accidentes:e.acc * 15, alto_vencido:altoV * 14, a_tiempo:o.lev ? Math.round((1 - o.a_tiempo / o.lev) * 20) : 0, documentos:q.total ? Math.round((1 - q.ok / q.total) * 15) : 0,
                inspecciones:ins < 80 ? Math.round((80 - ins) / 2) : 0, sin_visita:ult && d.ahora - ult < 14 * 86400000 ? 0 : 12, tamano:Math.round(Math.min(10, e.gente / 20)),
                medidas:d.medidas.filter(function(m){ return m.enlace === e.enl && m.estado === 'vigente'; }).length * 15 };
    var ix = Math.min(100, Object.keys(por).reduce(function(s, k){ return s + por[k]; }, 0));
    return { enlace:e.enl, nombre:e.n, ruc:e.ruc, region:dmaProy(e.p).reg, indice:ix, por:por, gente:e.gente, ultima:ult ? _dmaT(ult) : null };
  }).sort(function(x, y){ return y.indice - x.indice; });
  var regs = {}; todas.forEach(function(x){ var g = regs[x.region] || (regs[x.region] = { region:x.region, empresas:0, urgentes:0 }); g.empresas++; if(x.indice >= 50) g.urgentes++; });
  return { ok:true, como:'El índice (0 a 100) suma lo que pesa en contra de cada empresa: accidentes, riesgo alto vencido, no levantar a tiempo, documentos, inspecciones bajas, días sin visita, su tamaño y las medidas vigentes.',
           regiones:Object.keys(regs).map(function(k){ return regs[k]; }).sort(function(x, y){ return y.urgentes - x.urgentes || y.empresas - x.empresas; }),
           lista:region ? todas.filter(function(x){ return x.region === region; }) : todas };
}
function dmaAuditoria(m){
  var d = DMA.d;
  return { ok:true, mes:m, como:'El semáforo mira su programa del mes, cuánto está en la obra y lo que deja sin validar más de 24 horas.', lista:d.sups.map(function(s, k){
    var emps = d.emps.filter(function(e){ return e.sup === s.id; });
    return { nombre:s.n, proyecto:s.ps.map(function(p){ return dmaProy(p).n; }).join(' · '), empresas:emps.length, semaforo:k === 0 ? 'ambar' : 'verde', prog_pct:k === 0 ? 74 : 92, cumplidas:k === 0 ? 17 : 23,
      no_cumplidas:k === 0 ? 6 : 2, programadas:k === 0 ? 31 : 29, en_obra_pct:k === 0 ? 81 : 95, recorridos:k === 0 ? 21 : 26, horas_obra:k === 0 ? 64 : 88, insp:k === 0 ? 12 : 15, insp_prom:k === 0 ? 78 : 86,
      actas:k === 0 ? 4 : 5, obs:k === 0 ? 27 : 19, obs_por_insp:k === 0 ? 2.3 : 1.3, por_validar_24h:k === 0 ? 3 : 0, validadas:k === 0 ? 22 : 18 };
  }) };
}
function dmaRetencion(p){
  var d = DMA.d, e = dmaEmpDe(p.enlace); if(!e || e.estado !== 'activa') return { ok:false, motivo:'enlace' };
  var m = p.mes || d.hoy.slice(0, 7), enMes = function(t){ return _dmaISO(new Date(t)).slice(0, 7) === m; }, rg = d.reglas;
  var venc = d.obs.filter(function(o){ return o.enlace === e.enl && enMes(o.vence) && o.vence < d.ahora && (function(){ var pl = o.pasos.filter(function(q){ return q.que === 'levanta'; })[0]; return !pl || pl.t > o.vence; })(); });
  var alto = venc.filter(function(o){ return o.riesgo === 'alto'; }), otro = venc.filter(function(o){ return o.riesgo !== 'alto'; });
  var docs = d.reqs.filter(function(q){ return q.enlace === e.enl && q.cada === 'mes' && q.estado === 'pendiente'; });
  var I = d.insps.filter(function(i){ return i.enlace === e.enl && i.fecha.slice(0, 7) === m && i.puntaje != null; }), prom = I.length ? I.reduce(function(s, i){ return s + i.puntaje; }, 0) / I.length : null;
  var bajo = prom != null && rg.umbral != null && prom < rg.umbral;
  var monto = alto.length * (rg.obs_alto || 0) + otro.length * (rg.obs_otro || 0) + docs.length * (rg.doc || 0) + (bajo ? (rg.insp_bajo || 0) : 0);
  var val = p.valorizacion != null ? +p.valorizacion : null, tope = (val != null && rg.tope_pct != null) ? Math.round(val * rg.tope_pct) / 100 : null;
  var mapO = function(o){ return { n:o.n, titulo:o.titulo, vence:_dmaT(o.vence) }; };
  return { ok:true, empresa:e.n, mes:m, reglas:rg, obs_alto:alto.map(mapO), obs_otro:otro.map(mapO), docs:docs.map(function(q){ return { item:q.item }; }), insp_prom:prom, insp_bajo:bajo,
           monto:monto, valorizacion:val, tope:tope, sugerido:tope != null ? Math.min(monto, tope) : monto, nota:'OBRASST cuenta y muestra cada caso; cuánto retener lo decides tú según tu contrato.' };
}
function dmaControl(p){
  var d = DMA.d, desde = p.desde || _dmaDia(d.hoy, -29), hasta = p.hasta || d.hoy, en = function(t){ var s = _dmaISO(new Date(t)); return s >= desde && s <= hasta; };
  return { ok:true, desde:desde, hasta:hasta, alertas:dmaAlertas('control').filter(function(a){ return ['acceso_sin_orden', 'orden_vencida', 'acta_abierta', 'recorrido_lejos', 'visitas_sin_acta', 'acta_sin_orden'].indexOf(a.que) > -1; }),
    gente:d.equipo.filter(function(u){ return u.rango !== 'gerente'; }).map(function(u){
      var rec = d.recorridos.filter(function(x){ return x.por === u.uid && en(x.inicio); }), oi = d.ordenes.filter(function(o){ return o.inspector === u.uid && en(o.creado); });
      return { nombre:u.n, rango:u.rango, actas:d.actas.filter(function(a){ return a.por === u.uid && en(a.t); }).length, obs:d.obs.filter(function(o){ return o.por === u.uid && en(o.creado); }).length,
        insp:d.insps.filter(function(i){ return i.por === u.uid && en(i.creado); }).length, recorridos:rec.length, lejos:rec.filter(function(x){ return x.veredicto === 'lejos'; }).length,
        accesos:d.accesos.filter(function(x){ return x.uid === u.uid && en(x.t); }).length, ordenes:oi.length, ordenes_cerradas:oi.filter(function(o){ return o.estado === 'cerrada'; }).length };
    }) };
}
function dmaExpediente(p){
  var d = DMA.d, e = dmaEmpDe(p.enlace); if(!e) return { ok:false, motivo:'enlace' };
  if(dmaYo().rango === 'supervisor') return { ok:false, motivo:'rango' };
  var desde = p.desde || null, hasta = p.hasta || null, en = function(t){ var s = _dmaISO(new Date(t)); return (!desde || s >= desde) && (!hasta || s <= hasta); }, r = _dmaAzar(77), n = 0;
  var sello = function(t){ n++; return { n:n, cuando:_dmaT(t), coincide:true }; };
  var actas = d.actas.filter(function(a){ return a.enlace === e.enl && en(a.t); }), obs = d.obs.filter(function(o){ return o.enlace === e.enl && en(o.creado); });
  var ins = d.insps.filter(function(i){ return i.enlace === e.enl && en(i.creado); });
  d.accesos.push({ t:Date.now(), uid:dmaYo().uid, enlace:e.enl, emp:e.id, que:'expediente' });
  return { ok:true, entidad:d.ent.nombre, empresa:e.n, ruc:e.ruc, desde:desde, hasta:hasta, generado:_dmaT(Date.now()), estado:e.estado === 'activa' ? 'activa' : 'invitada',
    cadena:{ ultimo:{ n:412 + DMA.log.length, cuando:_dmaT(d.ahora - 3600000), sello:_dmaHex(r, 64) } },
    actas:actas.map(function(a){ return { n:a.n, fecha:a.fecha, hora:a.hora, tipo:a.tipo, estado:a.estado, firmas:a.firmas.map(function(f){ return { rol:f.rol, n:f.n, negada:!!f.negada }; }), huella:a.huella, coincide:true,
      contenido:{ hechos:a.hechos, conclusiones:a.conclusiones } }; }),
    observaciones:obs.map(function(o){ return { n:o.n, riesgo:o.riesgo, titulo:o.titulo, vence:_dmaT(o.vence), estado:dmaEst(o), sello:sello(o.creado) }; }),
    inspecciones:ins.map(function(i){ return { n:i.n, fecha:i.fecha, formato:i.formato, cumple:i.cumple, nocumple:i.nocumple, puntaje:i.puntaje, sello:sello(i.creado) }; }),
    pedidos:d.reqs.filter(function(q){ return q.enlace === e.enl; }).map(function(q){ return { item:q.item, cada:q.cada, estado:q.estado, hoy:q.estado, entregado:q.entregado ? _dmaT(q.entregado) : null, entregado_nombre:q.entregado ? e.contacto : null,
      revisado:q.estado === 'aprobado' || q.estado === 'observado' ? _dmaT((q.entregado || d.ahora) + 86400000) : null, revisado_nombre:q.estado === 'aprobado' || q.estado === 'observado' ? 'Lucía Paredes Ramírez' : null }; }),
    medidas:d.medidas.filter(function(m){ return m.enlace === e.enl; }).map(function(m){ var ac = d.actas.filter(function(a){ return a.id === m.acta; })[0]; return { tipo:m.tipo, detalle:m.detalle, acta:ac ? { n:ac.n } : null, estado:m.estado, levantada:m.levantada ? _dmaT(m.levantada) : null, levantada_nombre:m.levantada_nombre || null }; }),
    ordenes:d.ordenes.filter(function(o){ return o.enlace === e.enl; }).map(function(o){ var ac = d.actas.filter(function(a){ return a.id === o.acta; })[0]; return { n:o.n, inspector_nombre:dmaUsr(o.inspector).n, motivo:o.motivo, plazo:o.plazo, estado:o.estado, acta:ac ? { n:ac.n } : null }; }),
    recorridos:d.recorridos.filter(function(x){ return x.enlace === e.enl && en(x.inicio); }).map(function(x){ return { inicio:_dmaT(x.inicio), por:{ n:dmaUsr(x.por).n }, min:x.min, veredicto:x.veredicto, dist_ini:x.dist_ini }; }),
    accesos:d.accesos.filter(function(x){ return x.enlace === e.enl && en(x.t); }).map(function(x){ return { t:_dmaT(x.t), n:dmaUsr(x.uid).n, que:x.que, lado:'arriba' }; }) };
}

/* ══ 28/10/2026 · EL CUMPLIMIENTO, EN EL EJEMPLO (portal/cumple.js) ════════════════════════════════════════════════
   Lo que contestarían sst_cad_cumple, sst_cad_cumple_trabs, sst_cad_trab_qr, sst_cad_verifs, sst_cad_matriz,
   sst_cad_matriz_poner y sst_cad_consolidado (sql/2026-10-28-cumplimiento.sql), con las mismas formas. Lo de cada
   trabajador se inventa aquí, con su propio azar (lo de antes del ejemplo no cambia): su EMO, su SCTR, su ATS y su charla de
   hoy, su PETAR, sus papeletas y los temas de sus capacitaciones. Y algunas cosas a propósito: la del montaje de vigas tiene
   gente en altura con el EMO o la capacitación vencida; el consorcio grande, papeletas y un PETAR de hoy todavía sin
   autorizar; la de saneamiento, un frente sin ATS hoy. Cada contratista con sus subcontratas (inventadas, RUC con el dígito
   mal); la de pozos comparte solo sus cifras (cuenta en los números, pero su gente no se abre). */
var DMA_SUBS = [
  { id:'k1', de:'e1', n:'Señalización Vial Tallán S.A.C.', ruc:'20999200129', gente:24, cap:0.9, pt:'exc' },
  { id:'k2', de:'e1', n:'Volquetes y Transportes Sechura E.I.R.L.', ruc:'20999200137', gente:18, cap:0.8, pt:'man' },
  { id:'k3', de:'e3', n:'Montajes y Grúas Huancayo S.A.C.', ruc:'20999200145', gente:14, cap:0.86, pt:'iza' },
  { id:'k4', de:'e5', n:'Acabados y Drywall Qosqo S.A.C.', ruc:'20999200154', gente:30, cap:0.93, pt:'alt' },
  { id:'k5', de:'e7', n:'Perforaciones y Pozos Misti S.A.C.', ruc:'20999200162', gente:16, cap:0.85, pt:'exc', solo:true }
];
var DMA_TEMAS = { ind:'Inducción de SST', epp:'Uso y cuidado del EPP', emer:'Respuesta ante emergencias', alt:'Trabajos en altura', exc:'Excavaciones y zanjas',
                  ele:'Riesgo eléctrico y bloqueo', iza:'Izaje de cargas', man:'Manejo defensivo' };
/* cómo le va a cada una (lo demás sale de su capacitación): la probabilidad de EMO vencido o sin EMO, de firmar su ATS de hoy, de
   estar en la charla y de no tener la capacitación al día */
var DMA_PERF = { e1:{ emo:0.13, ats:0.82, ch:0.72, cap:0.06 }, e3:{ emo:0.2, ats:0.66, ch:0.5, cap:0.25 }, e7:{ emo:0.13, ats:0.8, ch:0.7, cap:0.08 },
                 k2:{ emo:0.2, ats:0.66, ch:0.5, cap:0.25 }, e5:{ emo:0.06, ats:0.9, ch:0.85 } };
var DMA_ALTO = { alt:['altura', 'Trabajo en altura'], exc:['excavacion', 'Excavación'], iza:['izaje', 'Izaje'], ele:['electrico', 'Trabajo eléctrico'] };
var DMA_COMO_CUM = 'La nota de 0 a 100 sale de la capacitación vigente (20 %), el EMO vigente (15 %), la inducción (10 %), los que firmaron su ATS de hoy (15 %), los que estuvieron en la charla de hoy (10 %), lo levantado a tiempo en 30 días (20 %) y no tener riesgo alto vencido (10 %). Lo que no tiene datos no cuenta; el ATS y la charla, de lunes a sábado.';
function _dmaTapa(d){ d = String(d || ''); return d ? '••••' + d.slice(-4) : ''; }
function _dmaNorm(s){ return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function _dmaSemilla(s){ var h = 2166136261; s = String(s); for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
/* lo que pide cada puesto (para inventar sus capacitaciones) */
function _dmaReq(p, e){
  var R = ['ind', 'epp', 'emer'], pt = e.pt || ({ e1:'exc', e2:'exc', e3:'alt', e4:'alt', e5:'alt', e6:'', e7:'exc' })[e.id] || '';
  if(/Operario|Fierrero|Soldador|Rigger/.test(p) || pt === 'alt') R.push('alt');
  if(pt === 'exc' && /Peón|Vigía|Operario|Capataz/.test(p)) R.push('exc');
  if(/Electricista/.test(p)) R.push('ele');
  if(/Rigger|Operador de equipo pesado/.test(p) || pt === 'iza') R.push('iza');
  if(/Operador de equipo pesado/.test(p) || pt === 'man') R.push('man');
  return R.filter(function(k, i, l){ return l.indexOf(k) === i; });
}
/* un trabajador, con lo de hoy */
function _dmaTrab(p, e, r, hoy, habil){
  var q = e.cap || 0.9, pf = DMA_PERF[e.id] || {}, t = { p:p, temas:{}, req:_dmaReq(p.p, e) };
  /* sus capacitaciones: si su ficha no tiene ninguna vigente, ninguna lo está */
  t.req.forEach(function(k){
    var x = r();
    if(p.cap && (k === 'ind' || x < q + 0.06 - (pf.cap || 0))){ var dias = x < 0.08 ? 336 + Math.floor(r() * 28) : Math.floor(r() * 320); t.temas[k] = _dmaDia(hoy, -dias); }
    else if(r() < 0.5) t.temas[k] = _dmaDia(hoy, -(370 + Math.floor(r() * 150)));
  });
  if(p.cap){ var ks = Object.keys(t.temas).filter(function(k){ return t.temas[k] >= _dmaDia(hoy, -365); }); if(ks.length) t.temas[ks[0]] = p.cap; else t.temas.ind = p.cap; }
  t.ind = !!p.ind;
  /* el EMO y el SCTR */
  var xe = r(), malo = pf.emo != null ? pf.emo : (q < 0.85 ? 0.12 : (q < 0.93 ? 0.07 : 0.03));
  t.emo = xe < malo * 0.35 ? { e:'sin' } : (xe < malo ? { e:'ven', hasta:_dmaDia(hoy, -(3 + Math.floor(r() * 70))) } : (xe < malo + 0.05 ? { e:'vence', hasta:_dmaDia(hoy, 2 + Math.floor(r() * 27)) } : { e:'ok', hasta:_dmaDia(hoy, 35 + Math.floor(r() * 300)) }));
  var finMes = _dmaISO(new Date(+hoy.slice(0, 4), +hoy.slice(5, 7), 0)), finAnt = _dmaISO(new Date(+hoy.slice(0, 4), +hoy.slice(5, 7) - 1, 0));
  t.sctr = r() < (q < 0.85 ? 0.03 : 0.008) ? { e:'ven', hasta:finAnt } : { e:'ok', hasta:finMes };
  /* hoy: su ATS, su charla, su PETAR; y sus papeletas de 30 días */
  t.ats = habil && r() < (pf.ats || (q < 0.85 ? 0.86 : (q < 0.93 ? 0.92 : 0.97)));
  t.charla = habil && r() < (pf.ch || (q < 0.85 ? 0.8 : (q < 0.93 ? 0.88 : 0.95))) ? '07:' + _dmaDos(5 + Math.floor(r() * 40)) : null;
  t.petar = null;
  var xa = r(); t.amon = xa < 0.025 ? [_dmaDia(hoy, -Math.floor(r() * 28))] : (xa < 0.03 ? [_dmaDia(hoy, -Math.floor(r() * 12)), _dmaDia(hoy, -(14 + Math.floor(r() * 14)))] : []);
  return t;
}
/* el estado de un trabajador y lo que le falta (las mismas reglas del contrato) */
function _dmaTrabEstado(t, hoy){
  var vig = function(f){ return f && f >= _dmaDia(hoy, -365); }, vence = function(f){ return f && f >= _dmaDia(hoy, -365) && f < _dmaDia(hoy, -335); };
  var ks = Object.keys(t.temas).filter(function(k){ return vig(t.temas[k]); }), ult = ks.map(function(k){ return t.temas[k]; }).sort().pop() || null;
  var capE = !ks.length ? 'falta' : (ks.every(function(k){ return vence(t.temas[k]); }) ? 'vence' : 'ok');
  var alto = [], reqAlto = Object.keys(DMA_ALTO).filter(function(k){ return (t.req || []).indexOf(k) > -1 || (t.petar && t.petar.k === k); });
  reqAlto.forEach(function(k){
    var falta = [];
    if(!vig(t.temas[k])) falta.push('capacitación vigente');
    if(t.emo.e === 'ven' || t.emo.e === 'sin') falta.push('EMO vigente');
    alto.push({ k:DMA_ALTO[k][0], n:DMA_ALTO[k][1], e:falta.length ? 'mal' : 'ok', falta:falta, hoy:!!(t.petar && t.petar.k === k) });
  });
  /* lo que impide trabajar hoy y lo que hay que mirar, en el orden del servidor (_cad_trab_eval) */
  var mal = [], ojo = [];
  if(t.emo.e === 'ven') mal.push('EMO vencido'); else if(t.emo.e === 'sin') mal.push('Sin EMO');
  if(t.sctr.e === 'ven') mal.push('SCTR vencido'); else if(t.sctr.e === 'sin') mal.push('Sin SCTR');
  if(t.petar && t.petar.aut === false) mal.push('PETAR de hoy sin autorizar');
  alto.forEach(function(a){ if(a.e !== 'mal') return; if(a.hoy) mal.push(a.n + ' hoy: falta ' + a.falta.join(', ')); else ojo.push(a.n + ': falta ' + a.falta.join(', ')); });
  if(capE === 'falta') ojo.push('Sin capacitación vigente');
  if(!t.ind) ojo.push('Sin inducción');
  if(t.emo.e === 'vence') ojo.push('EMO por vencer');
  if(capE === 'vence') ojo.push('Capacitación por vencer');
  if(t.amon.length) ojo.push(t.amon.length === 1 ? '1 papeleta en 30 días' : t.amon.length + ' papeletas en 30 días');
  return { cap:{ e:capE, n:ks.length, ult:ult, temas:ks.map(function(k){ return DMA_TEMAS[k]; }) }, alto:alto, estado:mal.length ? 'mal' : (ojo.length ? 'ojo' : 'ok'), faltan:mal.concat(ojo) };
}
function dmaCum(){
  var d = DMA.d; if(d.cum) return d.cum;
  var hoy = d.hoy, habil = new Date(hoy + 'T12:00:00').getDay() !== 0, r = _dmaAzar(d.t === 'fis' ? 3028 : 3029);
  var pick = function(l){ return l[Math.floor(r() * l.length)]; };
  var activas = d.emps.filter(function(e){ return e.estado === 'activa' && e.personal; });
  var L = [];
  activas.forEach(function(e){ L.push({ e:e, enl:e.enl, id:e.id, n:e.n, ruc:e.ruc, p:e.p, via:'directa', padre:null, detalle:true }); });
  DMA_SUBS.forEach(function(s){
    var de = activas.filter(function(e){ return e.id === s.de; })[0]; if(!de) return;
    var usados = {}, per = [];
    for(var i = 0; i < s.gente; i++){
      var nom; do { nom = pick(DMA_APELLIDOS) + ' ' + pick(DMA_APELLIDOS) + ', ' + pick(DMA_NOMBRES); } while(usados[nom]); usados[nom] = 1;
      var vig = r() < s.cap;
      per.push({ n:nom, td:'DNI', d:String(40000000 + Math.floor(r() * 39999999)), p:s.pt === 'man' ? pick(['Chofer de volquete', 'Operador de equipo pesado', 'Ayudante']) : (s.pt === 'iza' ? pick(['Rigger', 'Operador de grúa', 'Montajista', 'Ayudante']) : pick(DMA_PUESTOS)),
        cap:vig ? _dmaDia(hoy, -Math.floor(r() * 300)) : null, ind:r() < 0.96 });
    }
    L.push({ e:Object.assign({}, s, { personal:per, p:de.p }), enl:'L-' + s.id, id:s.id, n:s.n, ruc:s.ruc, p:de.p, via:'subcontrata', padre:de.n, sub:true, detalle:!s.solo });
  });
  L.forEach(function(x){
    var e = x.e;
    x.trabs = e.personal.map(function(p){ return _dmaTrab(p, e, r, hoy, habil); });
    /* el PETAR de hoy: las que hacen alto riesgo tienen sus cuadrillas en uno */
    var tipo = ({ e1:'exc', e3:'alt', e4:'alt', e5:'alt', e7:'exc', k1:'exc', k3:'iza', k4:'alt', k5:'exc' })[x.id];
    if(tipo && habil){
      var cand = x.trabs.filter(function(t){ return t.req.indexOf(tipo) > -1; });
      var n = Math.min(cand.length, x.id === 'e3' ? 12 : Math.max(4, Math.round(cand.length * 0.18)));
      cand.slice(0, n).forEach(function(t, i){ t.petar = { k:tipo, tipo:DMA_ALTO[tipo][1], aut:!(x.id === 'e1' && i < 6) }; });
      x.petarN = Math.ceil(n / 6); x.petarOk = x.petarN - (x.id === 'e1' && n ? 1 : 0);
    }
  });
  /* a propósito: lo que se ve en la portada del cumplimiento */
  var X = function(id){ return L.filter(function(x){ return x.id === id; })[0]; };
  var e3 = X('e3'); if(e3){ var enAlt = e3.trabs.filter(function(t){ return t.petar; });
    if(enAlt[0]) enAlt[0].emo = { e:'ven', hasta:_dmaDia(hoy, -12) };
    if(enAlt[1]) enAlt[1].emo = { e:'ven', hasta:_dmaDia(hoy, -40) };
    if(enAlt[2]) enAlt[2].temas.alt = _dmaDia(hoy, -398);
    if(enAlt[3]) enAlt[3].emo = { e:'sin' }; }
  var e1 = X('e1'); if(e1) [3, 17, 41, 77].forEach(function(k, i){ var t = e1.trabs[k]; if(t) t.amon = [_dmaDia(hoy, -(2 + i * 5))]; });
  var e7 = X('e7'); if(e7 && habil) e7.trabs.slice(10, 21).forEach(function(t){ t.ats = false; });
  /* los números de cada empresa */
  L.forEach(function(x){
    x.trabs.forEach(function(t){ var s = _dmaTrabEstado(t, hoy); t.s = s; });
    var T = x.trabs, c = function(f){ return T.filter(f).length; };
    var o = x.sub ? null : dmaObsRes(x.enl);
    var altoVen = x.sub ? 0 : d.obs.filter(function(ob){ return ob.enlace === x.enl && ob.riesgo === 'alto' && dmaNivel(ob) >= 1; }).length;
    if(x.sub){ var rs = _dmaAzar(_dmaSemilla(x.id)); var lev = 3 + Math.floor(rs() * 6); o = { ab:Math.floor(rs() * 3), ven:rs() < 0.35 ? 1 : 0, alto:rs() < 0.3 ? 1 : 0, val:Math.floor(rs() * 2), lev:lev, a_tiempo:lev - Math.floor(rs() * 3), mes:lev + 2 }; altoVen = o.ven && o.alto ? 1 : 0; }
    var gente = T.length;
    x.A = { enlace:x.enl, emp:x.id, nombre:x.n, ruc:x.ruc, proyecto:dmaProy(x.p).n, via:x.via, padre:x.padre, detalle:x.detalle !== false, gente:gente,
      cap:{ ok:c(function(t){ return t.s.cap.e !== 'falta'; }), tot:gente }, ind:{ ok:c(function(t){ return t.ind; }), tot:gente },
      emo:{ ok:c(function(t){ return t.emo.e === 'ok' || t.emo.e === 'vence'; }), vence:c(function(t){ return t.emo.e === 'vence'; }), ven:c(function(t){ return t.emo.e === 'ven'; }), sin:c(function(t){ return t.emo.e === 'sin'; }), tot:gente },
      sctr:{ ok:c(function(t){ return t.sctr.e === 'ok'; }), ven:c(function(t){ return t.sctr.e === 'ven'; }), sin:0, tot:gente },
      ats:{ hoy:habil ? (x.sub ? Math.max(1, Math.ceil(gente / 8)) : x.e.ats[0]) : 0, ok:habil ? (x.sub ? Math.max(1, Math.ceil(gente / 8)) : x.e.ats[1]) : 0, firmaron:c(function(t){ return t.ats; }) },
      petar:{ hoy:x.petarN || 0, ok:x.petarOk || 0 }, charla:{ hoy:habil ? 1 : 0, asist:c(function(t){ return !!t.charla; }) },
      amon:{ d30:T.reduce(function(s, t){ return s + t.amon.length; }, 0) },
      obs:{ ab:o.ab || 0, ven:o.ven || 0, alto:o.alto || 0, val:o.val || 0, lev:o.lev || 0, a_tiempo:o.a_tiempo || 0, mes:o.mes != null ? o.mes : (o.lev || 0) + (o.ab || 0) },
      insp_mes:x.sub ? 1 + (x.id.charCodeAt(1) % 3) : dmaInspRes(x.enl).mes, acc_anio:x.sub ? 0 : (x.e.acc || 0), rep_ab:x.sub ? 1 : (x.e.rep || 0), ult:_dmaT(x.sub ? d.ahora - 5400000 : x.e.ult) };
    var P = {}, add = function(k, v){ if(v != null) P[k] = Math.round(v); };
    var pct = function(a, b){ return b ? 100 * a / b : null; };
    add('capacitacion', pct(x.A.cap.ok, gente)); add('emo', pct(x.A.emo.ok, gente)); add('induccion', pct(x.A.ind.ok, gente));
    if(habil){ add('ats', pct(x.A.ats.firmaron, gente)); add('charla', pct(x.A.charla.asist, gente)); }
    if(x.A.obs.lev) add('a_tiempo', pct(x.A.obs.a_tiempo, x.A.obs.lev));
    add('sin_alto_vencido', Math.max(0, 100 - 25 * altoVen));
    var W = { capacitacion:20, emo:15, induccion:10, ats:15, charla:10, a_tiempo:20, sin_alto_vencido:10 }, s = 0, w = 0;
    Object.keys(P).forEach(function(k){ s += P[k] * W[k]; w += W[k]; });
    x.A.nota = w ? Math.round(s / w) : null; x.A.partes = P;
  });
  /* las verificaciones de hoy (las de antes, del equipo; las que se hagan aquí se suman) */
  var V = [], insp = d.equipo.filter(function(u){ return u.rango === 'supervisor'; });
  [[1.4, 'e1', 5], [2.3, 'e3', 0], [3.1, 'e5', 8]].forEach(function(z, k){
    var x = X(z[1]); if(!x) return; var cu = d.ahora - z[0] * 3600000; if(_dmaISO(new Date(cu)) !== hoy) return;
    var t = x.trabs[z[2]] || x.trabs[0]; if(!t) return;
    V.push({ cuando:_dmaT(cu), nombre:t.p.n, empresa:x.n, estado:t.s.estado, quien_nombre:(insp[k % insp.length] || {}).n || '' });
  });
  d.cum = { L:L, hoy:hoy, habil:habil, verifs0:V };
  return d.cum;
}
function _dmaTrabJson(t, x){
  var s = t.s;
  return { id:'t-' + x.id + '-' + t.p.d.slice(-5), nombre:t.p.n, doc:_dmaTapa(t.p.d), puesto:t.p.p, estado:s.estado, faltan:s.faltan,
    cap:s.cap, ind:{ e:t.ind ? 'ok' : 'falta' }, emo:{ e:t.emo.e, hasta:t.emo.hasta || null }, sctr:{ e:t.sctr.e, hasta:t.sctr.hasta || null },
    ats:{ hoy:!!t.ats }, charla:{ hoy:!!t.charla, hora:t.charla || null }, petar:{ hoy:!!t.petar, tipo:t.petar ? t.petar.tipo : null, aut:t.petar ? t.petar.aut !== false : null },
    amon:{ d30:t.amon.length, ult:t.amon.slice().sort().pop() || null }, alto:s.alto.map(function(a){ return { k:a.k, n:a.n, e:a.e, falta:a.falta, hoy:!!a.hoy }; }) };
}
function _dmaOrdenTrab(a, b){ var o = { mal:0, ojo:1, ok:2 }; return (o[a.estado] - o[b.estado]) || String(a.nombre).localeCompare(String(b.nombre)); }
/* lo que el inspector lee en la puerta, en frases (las mismas palabras y llaves que sst_cad_trab_qr) */
function _dmaLista(j, habil){
  var F = function(iso){ var p = String(iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; }, L = [];
  var e = j.emo.e, tipo = j.petar.tipo || 'trabajo de alto riesgo';
  L.push(e === 'ok' ? { k:'emo', e:'ok', tx:'EMO vigente hasta el ' + F(j.emo.hasta) } : (e === 'vence' ? { k:'emo', e:'ojo', tx:'EMO por vencer: vence el ' + F(j.emo.hasta) } :
    (e === 'ven' ? { k:'emo', e:'mal', tx:'EMO vencido: venció el ' + F(j.emo.hasta) } : { k:'emo', e:'mal', tx:'Sin EMO registrado' })));
  L.push(j.sctr.e === 'ok' ? { k:'sctr', e:'ok', tx:'SCTR vigente (salud y pensión) hasta el ' + F(j.sctr.hasta) } :
    (j.sctr.e === 'ven' ? { k:'sctr', e:'mal', tx:'SCTR vencido: venció el ' + F(j.sctr.hasta) } : { k:'sctr', e:'mal', tx:'Sin SCTR registrado' }));
  L.push(j.ind.e === 'ok' ? { k:'ind', e:'ok', tx:'Inducción completa' } : { k:'ind', e:'ojo', tx:'Sin inducción completa' });
  L.push(j.cap.e === 'ok' ? { k:'cap', e:'ok', tx:j.cap.n + (j.cap.n === 1 ? ' capacitación vigente' : ' capacitaciones vigentes') + '; la última el ' + F(j.cap.ult) } :
    (j.cap.e === 'vence' ? { k:'cap', e:'ojo', tx:'Su capacitación más reciente vence pronto (la última el ' + F(j.cap.ult) + ')' } : { k:'cap', e:'ojo', tx:'Sin capacitación vigente (últimos 12 meses)' }));
  j.alto.forEach(function(a){ L.push({ k:'alto:' + a.k, e:a.e, tx:(a.e === 'ok' ? a.n + ': cumple (capacitación vigente y EMO vigente)' : a.n + ': le falta ' + a.falta.join(', ')) + (a.hoy ? ' · está en un PETAR de hoy' : '') }); });
  /* la charla: en el ejemplo, cada empresa tiene la suya de lunes a sábado */
  L.push(j.charla.hoy ? { k:'charla', e:'ok', tx:'Estuvo en la charla de hoy (' + j.charla.hora + ')' } : { k:'charla', e:habil ? 'ojo' : 'gris', tx:habil ? 'No figura en la charla de hoy' : 'Hoy su empresa no registró charla' });
  L.push(j.ats.hoy ? { k:'ats', e:'ok', tx:'Firmó el ATS de hoy' } : { k:'ats', e:habil ? 'ojo' : 'gris', tx:'No firmó un ATS hoy' });
  L.push(j.petar.hoy && j.petar.aut !== false ? { k:'petar', e:'ok', tx:'En el PETAR de hoy: ' + tipo } :
    (j.petar.hoy ? { k:'petar', e:'mal', tx:'En un PETAR de hoy que todavía no está autorizado: ' + tipo } : { k:'petar', e:'gris', tx:'No está en un PETAR hoy' }));
  L.push(j.amon.d30 ? { k:'amon', e:'ojo', tx:(j.amon.d30 === 1 ? '1 papeleta' : j.amon.d30 + ' papeletas') + ' en los últimos 30 días (la última el ' + F(j.amon.ult) + ')' } : { k:'amon', e:'ok', tx:'Sin papeletas en los últimos 30 días' });
  return L;
}
/* para probar en el ejemplo: uno al día, uno con pendientes y uno que no cumple (los usa cum-qr) */
function dmaCumEjemplos(){
  if(!DMA.d) return [];
  var C = dmaCum(), todos = [], solo = null;
  C.L.forEach(function(x){ x.trabs.forEach(function(t){
    if(x.detalle === false){ if(!solo) solo = { doc:t.p.d, nombre:'Uno de ' + x.n, estado:'', solo:true }; return; }
    todos.push({ doc:t.p.d, nombre:t.p.n, estado:t.s.estado, petar:!!t.petar }); }); });
  var uno = function(e, conPetar){ return todos.filter(function(t){ return t.estado === e && (!conPetar || t.petar); })[0] || todos.filter(function(t){ return t.estado === e; })[0]; };
  return [uno('ok'), uno('ojo'), uno('mal', true), solo].filter(Boolean);
}
/* el estándar por puesto del ejemplo (lo que se pone queda en el navegador, como lo demás) */
/* el estándar con el que empieza el ejemplo (el jefe ya lo puso; se cambia en «El estándar por puesto» y «Reiniciar» lo trae de vuelta) */
var DMA_EST0 = { comun:['Inducción de SST', 'Uso y cuidado del EPP', 'Respuesta ante emergencias'], vigencia:12,
  puestos:{ 'operario':['Trabajos en altura'], 'fierrero':['Trabajos en altura'], 'soldador':['Trabajos en altura'], 'rigger':['Trabajos en altura', 'Izaje de cargas'],
            'electricista':['Riesgo eléctrico y bloqueo'], 'operador de equipo pesado':['Izaje de cargas', 'Manejo defensivo'], 'vigia':['Excavaciones y zanjas'],
            'operador de grua':['Izaje de cargas'], 'montajista':['Trabajos en altura'], 'chofer de volquete':['Manejo defensivo'] } };
function _dmaMatriz(enl){
  var d = DMA.d, C = dmaCum(), est = d.cumEst === undefined ? DMA_EST0 : d.cumEst, hoy = C.hoy;
  var mes = (est && est.vigencia) || 12, desde = _dmaDia(hoy, -Math.round(mes * 30.4)), avisa = _dmaDia(desde, 30);
  var temasDe = function(t){ var o = {}; Object.keys(t.temas).forEach(function(k){ o[DMA_TEMAS[k]] = t.temas[k]; }); return o; };
  var cols, pide;
  if(est){
    cols = (est.comun || []).slice(); Object.keys(est.puestos || {}).forEach(function(k){ est.puestos[k].forEach(function(t2){ if(cols.indexOf(t2) < 0) cols.push(t2); }); });
    pide = function(p){ return (est.comun || []).concat((est.puestos || {})[_dmaNorm(p)] || []); };
  } else {
    var fr = {}; C.L.forEach(function(x){ if(x.detalle === false) return; x.trabs.forEach(function(t){ Object.keys(t.temas).forEach(function(k){ if(k !== 'ind' && t.temas[k] >= _dmaDia(hoy, -365)) fr[k] = (fr[k] || 0) + 1; }); }); });
    cols = ['Inducción'].concat(Object.keys(fr).sort(function(a, b){ return fr[b] - fr[a]; }).slice(0, 6).map(function(k){ return DMA_TEMAS[k]; }));
    pide = null;
  }
  var filas = [], R = { ok:0, vence:0, falta:0 }, sin = [];
  C.L.forEach(function(x){
    if(enl && x.enl !== enl) return;
    if(x.detalle === false){ sin.push(x.n); return; }   /* comparte solo cifras: su gente no sale (sin_detalle) */
    x.trabs.forEach(function(t){
      var tm = temasDe(t), c = {}, req = pide ? pide(t.p.p) : null;
      cols.forEach(function(col){
        if(req && !req.some(function(q){ var a = _dmaNorm(q), b = _dmaNorm(col); return a.indexOf(b) > -1 || b.indexOf(a) > -1; })){ c[col] = { e:'na' }; return; }
        var f = null; Object.keys(tm).forEach(function(n){ var a = _dmaNorm(n), b = _dmaNorm(col); if((a.indexOf(b) > -1 || b.indexOf(a) > -1) && (!f || tm[n] > f)) f = tm[n]; });
        if(_dmaNorm(col).indexOf('induccion') > -1 && t.ind && !f) f = t.p.cap || _dmaDia(hoy, -90);
        var e = (f && f >= desde) ? (f < avisa ? 'vence' : 'ok') : 'falta';
        c[col] = f ? { e:e, f:f } : { e:'falta' }; R[e]++;
      });
      filas.push({ enlace:x.enl, empresa:x.n, id:'t-' + x.id + '-' + t.p.d.slice(-5), nombre:t.p.n, doc:_dmaTapa(t.p.d), puesto:t.p.p, c:c });
    });
  });
  return { ok:true, estandar:est ? { puestos:est.puestos || {}, comun:est.comun || [], vigencia:mes, propio:true } : { puestos:{}, comun:['Inducción'], vigencia:12, propio:false }, temas:cols, filas:filas, resumen:R, sin_detalle:sin.sort(), tope:false };
}
/* el consolidado del ejemplo: lo de este mes y del anterior, de lo que hay; los de antes, inventados con su propio azar */
function _dmaConsol(p){
  var d = DMA.d, C = dmaCum(), hoy = C.hoy, mesHoy = hoy.slice(0, 7);
  var n = Math.max(1, Math.min(12, parseInt(p.meses, 10) || 6)), hasta = /^\d{4}-\d{2}$/.test(String(p.hasta || '')) && p.hasta <= mesHoy ? p.hasta : mesHoy;
  var M = []; for(var i = n - 1; i >= 0; i--){ var y = +hasta.slice(0, 4), m = +hasta.slice(5, 7) - 1 - i; var dt = new Date(y, m, 1); M.push(dt.getFullYear() + '-' + _dmaDos(dt.getMonth() + 1)); }
  var enMes = function(t, mm){ return _dmaISO(new Date(t)).slice(0, 7) === mm; };
  var E = C.L.map(function(x){
    var serie = M.map(function(mm){
      var r = _dmaAzar(_dmaSemilla(x.id + mm)), parte = 1;
      if(mm === mesHoy){ var dia = +hoy.slice(8, 10), dm = new Date(+mm.slice(0, 4), +mm.slice(5, 7), 0).getDate(); parte = dia / dm; }
      var g = x.A.gente, gm = Math.round(g * (mm === mesHoy ? 1 : (0.86 + r() * 0.12))), hb = Math.round(26 * parte);
      var s = { m:mm, gente:gm, hht:Math.round(gm * 8.6 * hb * (0.96 + r() * 0.06)), acc:0, acc_leve:r() < 0.18 ? 1 : 0, dias:0,
                cap:Math.round(gm * (0.18 + r() * 0.16) * parte), ats:Math.round((x.sub ? Math.ceil(g / 8) : x.e.ats[0]) * hb * (0.93 + r() * 0.07)), charlas:Math.round(hb * (0.9 + r() * 0.1)),
                obs:0, lev:0, a_tiempo:0, insp:Math.round((1 + r() * 3) * parte), epp:Math.round(gm * (1.2 + r() * 0.6) * parte), amon:Math.floor(r() * 3 * parte) };
      if(!x.sub && (mm === mesHoy || mm === _dmaISO(new Date(+mesHoy.slice(0, 4), +mesHoy.slice(5, 7) - 2, 1)).slice(0, 7))){
        var O = d.obs.filter(function(o){ return o.enlace === x.enl && enMes(o.creado, mm); });
        s.obs = O.length; s.lev = O.filter(function(o){ return o.levantado; }).length;
        s.a_tiempo = O.filter(function(o){ var pl = o.pasos.filter(function(q){ return q.que === 'levanta'; })[0]; return pl && pl.t <= o.vence; }).length;
        s.insp = d.insps.filter(function(q){ return q.enlace === x.enl && q.fecha.slice(0, 7) === mm; }).length || s.insp;
      } else { s.obs = Math.round((x.sub ? 2 : 4) + r() * (x.sub ? 4 : 10)); s.lev = Math.max(0, s.obs - Math.floor(r() * 2)); s.a_tiempo = Math.max(0, s.lev - Math.floor(r() * 3)); }
      if(mm === mesHoy) s.amon = x.A.amon.d30;
      /* los accidentes del año, en su mes (el de la empresa grande y el de las vigas) */
      if(!x.sub && (x.e.acc || 0) && mm === M[Math.max(0, M.length - 3)]){ s.acc = 1; s.dias = 6 + Math.floor(r() * 14); }
      return s;
    });
    return { enlace:x.enl, nombre:x.n, ruc:x.ruc, proyecto:dmaProy(x.p).n, via:x.via, serie:serie };
  });
  var K = ['gente', 'hht', 'acc', 'acc_leve', 'dias', 'cap', 'ats', 'charlas', 'obs', 'lev', 'a_tiempo', 'insp', 'epp', 'amon'];
  var tot = M.map(function(mm, i){ var t = { m:mm }; K.forEach(function(k){ t[k] = E.reduce(function(s, e){ return s + (e.serie[i][k] || 0); }, 0); });
    t['if'] = t.hht ? Math.round(t.acc * 1000000 / t.hht * 100) / 100 : null; t.ig = t.hht ? Math.round(t.dias * 1000000 / t.hht * 100) / 100 : null; return t; });
  return { ok:true, meses:M, empresas:E, total:tot };
}
DMA_RPC.sst_cad_cumple = function(){
  var C = dmaCum(), hora = new Date(DMA.d.ahora);
  var L = C.L.map(function(x){ return x.A; }).sort(function(a, b){ return (a.nota == null ? 999 : a.nota) - (b.nota == null ? 999 : b.nota) || String(a.nombre).localeCompare(String(b.nombre)); });
  return { ok:true, hoy:C.hoy, hora:_dmaDos(hora.getHours()) + ':' + _dmaDos(hora.getMinutes()), dia_habil:C.habil, empresas:JSON.parse(JSON.stringify(L)), como:DMA_COMO_CUM };
};
DMA_RPC.sst_cad_cumple_trabs = function(a){
  var C = dmaCum(), enl = (a.p || {}).enlace, x = C.L.filter(function(z){ return z.enl === enl; })[0];
  if(!x) return { ok:false, motivo:'enlace' };
  if(x.detalle === false) return { ok:false, motivo:'solo_cifras' };
  return { ok:true, hoy:C.hoy, dia_habil:C.habil, empresa:{ nombre:x.n, ruc:x.ruc, proyecto:dmaProy(x.p).n, via:x.via, padre:x.padre }, trabajadores:x.trabs.map(function(t){ return _dmaTrabJson(t, x); }).sort(_dmaOrdenTrab) };
};
DMA_RPC.sst_cad_trab_qr = function(a){
  var C = dmaCum(), p = a.p || {}, doc = String(p.doc || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  if(doc.length < 4 || doc.length > 20) return { ok:false, motivo:'datos' };
  var hall = [];
  C.L.forEach(function(x){ x.trabs.forEach(function(t){ if(t.p.d === doc) hall.push({ x:x, t:t }); }); });
  if(p.nombre && hall.length > 1){ var nn = _dmaNorm(p.nombre); var h2 = hall.filter(function(h){ return _dmaNorm(h.t.p.n) === nn; }); if(h2.length) hall = h2; }
  hall.sort(function(u, v){ return (u.x.via === 'directa' ? 0 : 1) - (v.x.via === 'directa' ? 0 : 1); });
  if(!hall.length) return { ok:true, encontrado:false };
  var h = hall[0];
  if(h.x.detalle === false) return { ok:true, encontrado:true, solo_cifras:true, t:{ empresa:h.x.n, ruc:h.x.ruc, proyecto:dmaProy(h.x.p).n, via:h.x.via } };
  var j = _dmaTrabJson(h.t, h.x);
  var out = Object.assign({ ok:true, encontrado:true, t:{ nombre:j.nombre, doc:j.doc, puesto:j.puesto, empresa:h.x.n, ruc:h.x.ruc, proyecto:dmaProy(h.x.p).n, via:h.x.via } }, j);
  delete out.id; delete out.nombre; delete out.doc; delete out.puesto;
  out.lista = _dmaLista(j, C.habil);
  dmaHacer({ op:'verif', nombre:j.nombre, empresa:h.x.n, estado:j.estado });
  return out;
};
DMA_RPC.sst_cad_verifs = function(){
  var C = dmaCum(), hoy = C.hoy, L = C.verifs0.concat((DMA.d.verifs || []).filter(function(v){ return String(v.cuando).slice(0, 10) === hoy || _dmaISO(new Date(v.cuando)) === hoy; }));
  return { ok:true, lista:L.slice().sort(function(a, b){ return Date.parse(b.cuando) - Date.parse(a.cuando); }) };
};
DMA_RPC.sst_cad_matriz = function(a){ return _dmaMatriz((a.p || {}).enlace || null); };
DMA_RPC.sst_cad_matriz_poner = function(a){ var p = a.p || {}; return dmaHacer({ op:'matriz_poner', puestos:p.puestos || {}, comun:p.comun || [], vigencia:p.vigencia || 12 }); };
DMA_RPC.sst_cad_consolidado = function(a){ return _dmaConsol(a.p || {}); };

/* ══ LO QUE SE HACE EN EL EJEMPLO ════════════════════════════════════
   Cada cambio es una «op» que se aplica a la obra de ejemplo y se anota
   en este navegador: al volver a abrir, la obra se arma de nuevo y se le
   vuelven a aplicar, en orden. */
function dmaHacer(op){
  op.t = op.t || Date.now();
  op.uid = op.uid || dmaYo().uid;
  var r = dmaAplicar(op, false);
  if(r && r.ok){ DMA.log.push(op); dmaGuardar(); }
  return r;
}
function dmaAplicar(op, repaso){
  var d = DMA.d, yo = dmaUsr(op.uid), manda = yo.rango !== 'supervisor';
  var obsDe = function(id){ return d.obs.filter(function(o){ return o.id === id; })[0]; };
  switch(op.op){
    case 'validar': {
      var o = obsDe(op.id); if(!o) return { ok:false, motivo:'no_existe' };
      if(dmaEst(o) !== 'levantada') return { ok:false, motivo:'no_levantada', obs:dmaObsJson(o, true) };
      if(op.ok){ o.pasos.push({ t:op.t, lado:'arriba', que:'valida', uid:op.uid, nota:'' }); o.validado = op.t; }
      else o.pasos.push({ t:op.t, lado:'arriba', que:'rechaza', uid:op.uid, nota:op.nota });
      return { ok:true, obs:dmaObsJson(o, true) };
    }
    case 'anular': {
      var o2 = obsDe(op.id); if(!o2) return { ok:false, motivo:'no_existe' };
      if(!manda && !(o2.por === op.uid && op.t - o2.creado < 30 * 60000)) return { ok:false, motivo:'rango', obs:dmaObsJson(o2, true) };
      o2.pasos.push({ t:op.t, lado:'arriba', que:'anula', uid:op.uid, nota:op.nota }); o2.anulada = true;
      return { ok:true, obs:dmaObsJson(o2, true) };
    }
    case 'nota': {
      var o3 = obsDe(op.id); if(!o3) return { ok:false, motivo:'no_existe' };
      o3.pasos.push({ t:op.t, lado:'arriba', que:'nota', uid:op.uid, nota:op.nota, foto:op.foto });
      return { ok:true, obs:dmaObsJson(o3, true) };
    }
    case 'observar': {
      var e = dmaEmpDe(op.enlace); if(!e) return { ok:false, motivo:'no_existe' };
      d.n.ob++;
      var o4 = { id:'ob' + d.n.ob, n:_dmaNum('OB', d.n.ob), enlace:e.enl, emp:e.id, titulo:op.titulo, lugar:op.lugar || '', riesgo:op.riesgo || 'medio', cond:op.cond,
                 creado:op.t, vence:op.t + DMA_HORAS[op.riesgo || 'medio'] * 3600000, por:op.uid, foto:op.foto || null, sol:'', pasos:[] };
      o4.pasos.push({ t:op.t, lado:'arriba', que:'observa', uid:op.uid, nota:op.nota || '' });
      d.obs.push(o4);
      return { ok:true, obs:dmaObsJson(o4, false) };
    }
    case 'rango': {
      if(yo.rango !== 'gerente') return { ok:false, motivo:'rango' };
      var u = d.equipo.filter(function(x){ return x.correo === op.correo; })[0]; if(!u) return { ok:false, motivo:'no_es_del_equipo' };
      u.rango = op.rango || 'supervisor'; return { ok:true, rango:u.rango };
    }
    case 'req_poner': {
      var e2 = dmaEmpDe(op.enlace); if(!e2) return { ok:false, motivo:'enlace' };
      (op.items || []).forEach(function(it, k){ d.reqs.push({ id:'rqn' + op.t + k, enlace:e2.enl, emp:e2.id, item:it.item, cada:it.cada, ingreso:!!it.ingreso, estado:'pendiente', periodo:it.cada === 'mes' ? d.hoy.slice(0, 7) : null }); });
      return { ok:true, nuevos:(op.items || []).length };
    }
    case 'req_anular': { var q = d.reqs.filter(function(x){ return x.id === op.id; })[0]; if(!q) return { ok:false, motivo:'no_existe' }; if(!manda) return { ok:false, motivo:'rango' }; q.estado = 'anulado'; q.nota = op.nota; return { ok:true }; }
    case 'req_revisar': {
      var q2 = d.reqs.filter(function(x){ return x.id === op.id; })[0]; if(!q2) return { ok:false, motivo:'no_existe' };
      if(q2.estado !== 'entregado') return { ok:false, motivo:'no_entregado' };
      q2.estado = op.ok ? 'aprobado' : 'observado'; q2.nota = op.ok ? null : op.nota; return { ok:true };
    }
    case 'prog_poner': {
      if(!manda) return { ok:false, motivo:'rango' };
      var nuevos = 0, salt = 0;
      (op.items || []).forEach(function(it, k){
        if(d.prog.some(function(x){ return x.enlace === it.enlace && x.fecha === it.fecha && x.actividad === it.actividad && x.estado !== 'anulada'; })){ salt++; return; }
        d.prog.push({ id:'pgn' + op.t + k, enlace:it.enlace, fecha:it.fecha, actividad:it.actividad, inspector:it.inspector || null, nota:it.nota || null, estado:'pendiente' }); nuevos++;
      });
      return { ok:true, nuevos:nuevos, saltados:salt };
    }
    case 'prog_anular': { var x2 = d.prog.filter(function(x){ return x.id === op.id; })[0]; if(!x2) return { ok:false, motivo:'no_existe' }; if(!manda) return { ok:false, motivo:'rango' }; x2.estado = 'anulada'; x2.anulado_nota = op.nota; return { ok:true }; }
    case 'reglas': {
      if(!manda) return { ok:false, motivo:'rango' };
      ['obs_alto', 'obs_otro', 'doc', 'insp_bajo', 'umbral', 'tope_pct'].forEach(function(k){ if(op.reglas[k] != null) d.reglas[k] = +op.reglas[k]; });
      return { ok:true, reglas:d.reglas };
    }
    case 'orden': {
      if(!manda) return { ok:false, motivo:'rango' };
      var e3 = dmaEmpDe(op.enlace); if(!e3) return { ok:false, motivo:'enlace' };
      if(!op.inspector || !d.equipo.some(function(u2){ return u2.uid === op.inspector; })) return { ok:false, motivo:'inspector' };
      if(!op.motivo) return { ok:false, motivo:'motivo' };
      d.n.oi++; var oi = { id:'oi' + d.n.oi, n:_dmaNum('OI', d.n.oi), enlace:e3.enl, emp:e3.id, inspector:op.inspector, motivo:op.motivo, detalle:op.detalle || null, plazo:op.plazo || _dmaDia(d.hoy, 7), estado:'asignada', creado:op.t, acta:null };
      d.ordenes.push(oi); return { ok:true, orden:{ id:oi.id, n:oi.n } };
    }
    case 'orden_anular': { if(!manda) return { ok:false, motivo:'rango' }; var o5 = d.ordenes.filter(function(x){ return x.id === op.id; })[0]; if(!o5) return { ok:false, motivo:'no_existe' }; if(o5.estado !== 'asignada') return { ok:false, motivo:'cerrada' }; o5.estado = 'anulada'; o5.anulado_nota = op.nota; return { ok:true }; }
    case 'medida_levantar': {
      var m = d.medidas.filter(function(x){ return x.id === op.id; })[0]; if(!m) return { ok:false, motivo:'no_existe' }; if(m.estado !== 'vigente') return { ok:false, motivo:'cerrada' };
      if(!op.foto) return { ok:false, motivo:'foto' };
      m.estado = 'levantada'; m.levantada = op.t; m.levantada_nombre = yo.n; m.nota = op.nota; m.foto = op.foto; return { ok:true };
    }
    case 'invitar': {
      if(!manda) return { ok:false, motivo:'rango' };
      if(!op.nombre || op.nombre.length < 3) return { ok:false, motivo:'nombre' };
      if(d.emps.concat(d.sups).some(function(x){ return String(x.n).toLowerCase() === String(op.nombre).toLowerCase(); })) return { ok:false, motivo:'ya_esta' };
      if(op.incluir && d.sups.length >= d.ent.incl) return { ok:false, motivo:'tope_incluidas', tope:d.ent.incl };
      var id = 'n' + op.t, x = { id:id, n:op.nombre, ruc:op.ruc || null, p:d.proy[0].id, estado:'invitada', contacto:op.contacto || null, enl:'L-' + id, token:('f' + op.t.toString(16) + 'abcdef0123456789abcdef0123456789').slice(0, 32), venceDias:14, peso:0 };
      if(op.incluir){ x.ps = [d.proy[0].id]; x.incl = true; d.emps.push(x); } else d.emps.push(x);
      var j = dmaEnlaceJson(x, !!op.incluir);
      return { ok:true, enlace:j };
    }
    /* 28/10/2026 · el cumplimiento: quién verificó a quién, y el estándar por puesto de la matriz */
    case 'verif': {
      d.verifs = d.verifs || [];
      d.verifs.push({ cuando:_dmaT(op.t), nombre:op.nombre || '', empresa:op.empresa || '', estado:op.estado || 'ok', quien_nombre:yo.n || '' });
      return { ok:true };
    }
    case 'matriz_poner': {
      if(!manda) return { ok:false, motivo:'rango' };
      var limpia = function(L){ return (Array.isArray(L) ? L : []).map(function(t){ return String(t || '').replace(/\s+/g, ' ').trim(); }).filter(function(t, i, l){ return t.length >= 3 && t.length <= 80 && l.indexOf(t) === i; }).slice(0, 20); };
      var Pz = {}; Object.keys(op.puestos || {}).slice(0, 60).forEach(function(k){ var L2 = limpia(op.puestos[k]); if(L2.length && _dmaNorm(k)) Pz[_dmaNorm(k)] = L2; });
      d.cumEst = { puestos:Pz, comun:limpia(op.comun), vigencia:Math.max(1, Math.min(36, parseInt(op.vigencia, 10) || 12)) };
      return { ok:true };
    }
    case 'reinvitar': {
      if(!manda) return { ok:false, motivo:'rango' };
      var x3 = d.emps.filter(function(e4){ return e4.enl === op.enlace; })[0]; if(!x3 || x3.estado !== 'invitada') return { ok:false, motivo:'no_activa' };
      if(op.quitar){ d.emps = d.emps.filter(function(e5){ return e5 !== x3; }); return { ok:true }; }
      x3.token = ('e' + op.t.toString(16) + '0123456789abcdef0123456789abcdef').slice(0, 32); x3.venceDias = 14;
      return { ok:true, enlace:dmaEnlaceJson(x3, !!x3.incl) };
    }
  }
  return { ok:false, motivo:'demo' };
}
function dmaGuardar(){
  try{ localStorage.setItem(DMA_LS + DMA.t, JSON.stringify({ dia:DMA.d.hoy, log:DMA.log.map(function(o){ var c = Object.assign({}, o); if(c.foto && String(c.foto).length > 200000) c.foto = dmaFoto('orden-despues'); return c; }) })); }catch(e){}
}
function dmaCargar(t){
  DMA.t = t; DMA.d = dmaArmar(t); DMA.log = [];
  var g = null; try{ g = JSON.parse(localStorage.getItem(DMA_LS + t) || 'null'); }catch(e){}
  if(g && g.dia === DMA.d.hoy && Array.isArray(g.log)){
    g.log.forEach(function(op){ var r = dmaAplicar(op, true); if(r && r.ok) DMA.log.push(op); });
  }
}
function dmaReiniciar(){ try{ localStorage.removeItem(DMA_LS + DMA.t); }catch(e){} dmaCargar(DMA.t); }

/* ══ LA PUERTA AL SERVIDOR, AQUÍ ═════════════════════════════════════ */
function dmaResp(obj, st){ return { ok:(st || 200) < 400, status:st || 200, json:function(){ return Promise.resolve(JSON.parse(JSON.stringify(obj))); }, text:function(){ return Promise.resolve(JSON.stringify(obj)); } }; }
function dmaFetch(url, opt){
  var u = String(url || ''), m = /\/rest\/v1\/rpc\/([a-z0-9_]+)/.exec(u), cuerpo = {};
  try{ cuerpo = (opt && opt.body && typeof opt.body === 'string') ? JSON.parse(opt.body) : {}; }catch(e){}
  return new Promise(function(res){
    setTimeout(function(){
      DMA.d.ahora = Date.now();
      if(m){
        var f = DMA_RPC[m[1]];
        if(f){ var r; try{ r = f(cuerpo); }catch(e){ r = { ok:false, motivo:'demo' }; try{ console.warn('demo', m[1], e); }catch(_w){} } res(dmaResp(r)); return; }
        res(dmaResp(null, 404)); return;
      }
      /* lo demás de la cuenta (tablas, archivos): en el ejemplo no hay */
      if(/\/storage\/v1\//.test(u)) { res(dmaResp({ Key:'demo' })); return; }
      res(dmaResp([]));
    }, 60 + Math.floor(Math.random() * 120));
  });
}

/* ══ ABRIR EL EJEMPLO ════════════════════════════════════════════════ */
function esDemoArriba(){ var m = /[?&]demo=(estado|fiscalizacion|mandante)(&|$)/.exec(location.search || ''); return m ? (m[1] === 'mandante' ? 'man' : 'fis') : ''; }
function demoArribaAbrir(t){
  _dmaCss();
  var r = null; try{ r = localStorage.getItem(DMA_LS_ROL + t); }catch(e){}
  var c = ((location.search || '').match(/[?&]como=([a-z]+)/) || [])[1];
  if(c && DMA_ROLES[t].some(function(x){ return x.k === c; })) r = c;
  DMA.rol = DMA_ROLES[t].some(function(x){ return x.k === r; }) ? r : 'jefe';
  dmaCargar(t);
  var d = DMA.d, yo = dmaYo();
  /* sin token de verdad: nada sale de este navegador */
  sbFetch = dmaFetch;
  subirFoto = function(carpeta, blob){
    return new Promise(function(res){ try{ var fr = new FileReader(); fr.onload = function(){ res(String(fr.result)); }; fr.onerror = function(){ res(dmaFoto('orden-despues')); }; fr.readAsDataURL(blob); }catch(e){ res(dmaFoto('orden-despues')); } });
  };
  var obra = { id:d.ent.id, codigo:d.ent.codigo, nombre:d.ent.nombre, obra_nombre:d.ent.nombre, rol:yo.rango === 'gerente' ? 'dueno' : 'supervisor', plan:'gestion', vence:'2099-12-31', sector:'construccion', pais:'PE' };
  YO = { empresas:[obra], obra:obra, rol:'lider', nombre:yo.n, dueno:yo.rango === 'gerente', admin:false, demo:t };
  TOK = { correo:'', demo:true, cap:yo.n, nombre:yo.n };
  CADP.de = String(obra.id); CADP.ini = DMA_RPC.sst_cad_inicio(); CADP.t = Date.now();
  try{ document.title = 'OBRASST ' + d.ent.papel + ' · Obra de ejemplo'; }catch(e){}
  _soloVer('portal'); try{ document.title = 'OBRASST ' + d.ent.papel + ' · Obra de ejemplo'; }catch(e){}
  $('portal').className = 'on dma-demo';
  dmaPintarBarra();
  pintarRail();
  var hash = vistaAlias((location.hash || '').slice(1)), vs = vistasDe();
  VISTA.actual = null;
  navegar(vs.some(function(v){ return v.id === hash; }) ? hash : vs[0].id, true);
}
function dmaPintarBarra(){
  var t = DMA.t, d = DMA.d, yo = dmaYo(), R = DMA_ROLES[t];
  var caja = $('obra-sel'), sel = $('sel-obra'); caja.hidden = false;
  sel.innerHTML = '<option>' + esc(d.ent.nombre) + '</option>'; sel.onchange = null;
  var p = $('papel'); p.textContent = d.ent.papel; p.className = 'papel lider'; p.title = 'OBRASST ' + d.ent.papel + ' · obra de ejemplo';
  var vc = $('dma-vercomo');
  if(!vc){ vc = document.createElement('label'); vc.className = 'cen-vercomo dma-vercomo'; vc.id = 'dma-vercomo'; vc.innerHTML = '<span>Ver como</span><select id="dma-rol" aria-label="Ver el ejemplo como"></select>'; p.parentNode.insertBefore(vc, p.nextSibling); }
  $('dma-rol').innerHTML = R.map(function(x){ return '<option value="' + x.k + '"' + (x.k === DMA.rol ? ' selected' : '') + '>' + esc(x.o) + '</option>'; }).join('');
  $('dma-rol').onchange = function(){ dmaCambiarRol(this.value); };
  var v = $('vivo'); v.className = 'vivo cen-ej'; v.title = 'Entidad, empresas, personas y cifras inventadas. No toca ningún servidor.'; $('vivo-t').textContent = 'Obra de ejemplo';
  ['pais-chip', 'bt-guia', 'bt-app', 'bt-consola', 'bt-cuenta'].forEach(function(id){ var b = $(id); if(b) b.hidden = true; });
  $('cuenta-n').textContent = yo.n; $('avatar').textContent = iniciales(yo.n); $('avatar').title = yo.n + ' · ' + yo.c;
  var bs = $('bt-salir'); bs.textContent = 'Salir del ejemplo'; bs.onclick = function(){ location.href = 'index.html'; };
  var ci = $('dma-cinta');
  if(!ci){ ci = document.createElement('div'); ci.id = 'dma-cinta'; ci.className = 'cen-cinta dma-cinta'; document.querySelector('#portal .barra').appendChild(ci); }
  ci.innerHTML = '<span><b>Obra de ejemplo</b> · entidad y empresas inventadas</span><button type="button" class="bt sec chico" id="dma-reini2">Reiniciar</button>';
  $('dma-reini2').onclick = dmaPreguntarReinicio;
}
function dmaCambiarRol(k){
  if(!DMA_ROLES[DMA.t].some(function(x){ return x.k === k; })) return;
  var antes = VISTA.actual; DMA.rol = k;
  try{ localStorage.setItem(DMA_LS_ROL + DMA.t, k); }catch(e){}
  try{ cerrarHoja(); }catch(e){}
  var yo = dmaYo(); YO.nombre = yo.n; YO.dueno = yo.rango === 'gerente'; TOK.cap = TOK.nombre = yo.n;
  CADP.ini = DMA_RPC.sst_cad_inicio(); CADP.t = Date.now(); try{ CAD.obs = {}; }catch(e){}
  dmaPintarBarra(); pintarRail();
  var vs = vistasDe(); VISTA.actual = null; navegar(vs.some(function(v){ return v.id === antes; }) ? antes : vs[0].id, true);
  toast('Ahora ves el ejemplo como ' + yo.n + ', ' + yo.c.toLowerCase() + '.');
}
function dmaPreguntarReinicio(){
  confirmar('Reiniciar el ejemplo', 'Se borra lo que hiciste aquí (órdenes, pedidos, validaciones, observaciones…) y el ejemplo vuelve a como empezó hoy.', { si:'Reiniciar' }).then(function(ok){
    if(!ok) return;
    dmaReiniciar(); CADP.ini = DMA_RPC.sst_cad_inicio(); CADP.t = Date.now(); try{ CAD.obs = {}; cerrarHoja(); }catch(e){}
    pintarRail(); var v = VISTA.actual; VISTA.actual = null; navegar(v || vistasDe()[0].id, true);
    toast('El ejemplo volvió a empezar.');
  });
}
/* al pie del carril: que es un ejemplo, y lo de su propia obra (en la cuenta de verdad se abre aquí) */
function dmaRailPie(r){
  if(!r || !DMA.t) return;
  var pie = document.createElement('div'); pie.className = 'cen-rail-pie dma-rail-pie';
  pie.innerHTML = '<b>Obra de ejemplo</b><span>Entidad, proyectos, empresas, RUC, personas y fotos inventados. Lo que hagas aquí queda solo en este navegador.</span>' +
    '<button type="button" class="bt sec chico" id="dma-reini">Reiniciar el ejemplo</button>';
  r.appendChild(pie);
  $('dma-reini').onclick = dmaPreguntarReinicio;
}
/* en el ejemplo, «Tu propia gestión SST» se explica (la cuenta de verdad la abre y la esconde) */
function dmaPropiaExplicar(){
  abrirHoja('Tu propia gestión SST', 'En la cuenta de verdad, aquí se abre', '<p>Además de lo que fiscalizas o supervisas, tu cuenta trae la gestión SST de tu propia entidad: tu personal, sus capacitaciones, el EPP, las inspecciones, los documentos y el informe del mes —lo mismo que usan las constructoras—.</p>' +
    '<p>Como tu trabajo es lo de arriba, va escondida al pie del menú y la abres cuando la necesitas. En la obra de ejemplo de Central puedes recorrer esa parte.</p>',
    '<a class="bt sec" href="?demo=central">Ver la obra de ejemplo de Central</a><button type="button" class="bt" id="dma-pr-ok">Entendido</button>');
  $('dma-pr-ok').onclick = cerrarHoja;
}
function _dmaCss(){
  if($('dma-css')) return;
  var st = document.createElement('style'); st.id = 'dma-css';
  st.textContent = '.cen-vercomo{display:flex;align-items:center;gap:8px;padding:5px 8px 5px 11px;border:1px solid var(--raya);border-radius:8px;background:var(--panel);font-size:12px;color:var(--gris);white-space:nowrap}' +
    '.cen-vercomo select{border:0;background:transparent;padding:0;font:inherit;font-size:13px;font-weight:500;color:var(--tinta);max-width:220px;cursor:pointer}.cen-vercomo select:focus{box-shadow:none}' +
    '.vivo.cen-ej i{background:var(--casco);box-shadow:0 0 0 3px rgba(245,183,0,.22)}.cen-cinta{display:none}' +
    '.cen-rail-pie{margin:18px 4px 0;padding:12px;border:1px dashed var(--raya2);border-radius:10px;font-size:12.5px;color:var(--gris);display:grid;gap:6px;line-height:1.45}' +
    '.cen-rail-pie b{color:var(--texto);font-weight:600}.cen-rail-pie .bt{justify-self:start}' +
    '@media (min-width:901px) and (max-width:1180px){.cen-vercomo span{display:none}.cen-vercomo select{max-width:170px}}' +
    '@media (max-width:900px){#portal.dma-demo #papel,#portal.dma-demo #vivo{display:none}.cen-rail-pie{display:none}.cen-cinta{display:flex;flex-basis:100%;align-items:center;justify-content:space-between;gap:10px;font-size:12.5px;color:var(--gris);padding:2px 0 0}' +
    '  .cen-cinta b{color:var(--texto)}.cen-vercomo span{display:none}.cen-vercomo select{max-width:150px}}';
  document.head.appendChild(st);
}
/* lo que la obra de ejemplo no lleva (los datos de tu entidad, tu equipo, tu plan): la sección dice qué es, sin servidor */
var DMA_VISTAS_SI = /^(arr-ini|sup-|car-|fis-|cum-|cad-obs$|cad-equipo$)/;
var DMA_EXPLICA = {
  equipo:['Tu equipo', 'En la cuenta de verdad, aquí sumas a tu equipo con su correo (jefes e inspectores) y ves quién pidió entrar. Cada uno entra con su cuenta, en la app y en la web; sus rangos van en «Rangos del equipo».'],
  empresa:['Los datos y el logo de tu entidad', 'Tu razón social, tu RUC y tu logo: salen en las actas, en el expediente probatorio y en el informe del mes.'],
  plan:['Tu plan', 'Hasta cuándo va tu plan, cuántas empresas puedes supervisar o fiscalizar y cuántas supervisoras incluye. Se arma en una reunión, a la medida de tus proyectos.']
};
function dmaVistaDemo(v){
  if(!DMA.t || DMA_VISTAS_SI.test(v.id)) return v;
  return Object.assign({}, v, { mira:true, pintar:function(caja){
    var x = DMA_EXPLICA[v.id] || [v.n, 'En la cuenta de verdad, aquí va esta sección. La obra de ejemplo muestra lo de ' + (DMA.d ? DMA.d.ent.papel : 'tu plan') + '.'];
    var ac = $('acciones'); if(ac) ac.innerHTML = '';
    caja.innerHTML = '<div class="tarj"><div class="tarj-cuerpo dma-explica"><h2>' + esc(x[0]) + '</h2><p>' + esc(x[1]) + '</p><p class="sub">Obra de ejemplo: esta parte no se llena con datos inventados.</p></div></div>';
  } });
}
