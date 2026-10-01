/* ══════════════════════════════════════════════════════════════════
   OBRASST Central · la principal y sus subcontratas, en el portal
   (01/10/2026). Marcelo: «el portal web para los planes de Central y
   Corporativo… tienen que ser mejores, con visión de que tendrán sus
   propios accesos» y «la demo: una obra de ejemplo con sus subcontratas».

   Lo que promete central.html, aquí:
   · cada uno con su rango: gerente, jefe y supervisor SSOMA de la
     principal; el supervisor de cada subcontrata (gratis) ve solo lo suyo;
   · observación con foto, plazo por riesgo (alto 24 h, medio 72 h, bajo
     7 días) y escalamiento: si vence, sube al jefe; un día después, al
     gerente. La subcontrata levanta con foto y el supervisor valida;
   · el tablero por empresa (gente, capacitación, ATS del día, abiertas),
     la matriz de capacitación, el informe del mes y el uso del mes (se
     cobra el día de más gente);
   · invitar a una subcontrata con su RUC.

   LA OBRA DE EJEMPLO (portal/?demo=central): «Centro Comercial Los
   Álamos», de Consorcio Vía Andina con cuatro subcontratas y 540
   personas. Todo es inventado —empresas, RUC (con el dígito verificador
   a propósito mal, para que no sea el de nadie), nombres, DNI y fotos
   (dibujos)— y se arma aquí, igual cada día. Lo que se hace en la demo
   (validar, levantar, invitar, observar) queda en este navegador hasta
   «Reiniciar el ejemplo». No toca ningún servidor.
   ══════════════════════════════════════════════════════════════════ */
var CEN = { d:null, rol:'jefe', demo:false, n:0, filtro:{}, nuevo:null };
var CEN_LS_ROL = 'sstp_cen_rol', CEN_LS_EST = 'sstp_cen_estado_v1';

/* ── los números al azar, siempre los mismos ── */
function _cenAzar(semilla){
  var a = semilla >>> 0;
  return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function _cenDos(n){ return (n < 10 ? '0' : '') + n; }
function _cenISO(d){ return d.getFullYear() + '-' + _cenDos(d.getMonth() + 1) + '-' + _cenDos(d.getDate()); }
function _cenDia(iso, n){ var p = iso.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n); return _cenISO(d); }
function _cenN(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function _cenPct(x){ return Math.round(x * 100) + ' %'; }
function _cenHace(ms){
  var m = Math.round(Math.abs(ms) / 60000);
  if(m < 60) return m + ' min';
  var h = Math.round(m / 60); if(h < 48) return h + ' h';
  return Math.round(h / 24) + ' días';
}

/* ── la obra, las empresas y el equipo ── */
var CEN_RIESGO = { alto:{ t:'Alto', h:24, cl:'mal' }, medio:{ t:'Medio', h:72, cl:'ojo' }, bajo:{ t:'Bajo', h:168, cl:'gris' } };
var CEN_EMPRESAS = [
  { id:'via',    nombre:'Consorcio Vía Andina', corto:'Vía Andina', ruc:'20999100019', principal:true, gente:150, frentes:12, cap:0.97,
    rubro:'Contratista principal · estructuras y obras civiles' },
  { id:'rimac',  nombre:'Encofrados Rímac S.A.C.', corto:'Encofrados Rímac', ruc:'20999100027', gente:140, frentes:10, cap:0.88, rubro:'Encofrados' },
  { id:'sur',    nombre:'Excavaciones Sur Grande S.A.C.', corto:'Excavaciones Sur Grande', ruc:'20999100035', gente:95, frentes:8, cap:0.92, rubro:'Movimiento de tierras' },
  { id:'pacif',  nombre:'Electro Montajes Pacífico S.A.C.', corto:'Electro Montajes Pacífico', ruc:'20999100044', gente:90, frentes:6, cap:0.96, rubro:'Instalaciones eléctricas' },
  { id:'chavin', nombre:'Andamios Chavín E.I.R.L.', corto:'Andamios Chavín', ruc:'20999100052', gente:65, frentes:4, cap:0.81, rubro:'Andamios' }
];
/* la que se invita en la demo (no está todavía) */
var CEN_INVITABLE = { ruc:'20999100060', nombre:'Acabados Huascarán S.A.C.', rubro:'Tabiquería y acabados' };
var CEN_EQUIPO = [
  { id:'u-corp', rango:'corp', nombre:'Fernando Arce Valdez', cargo:'Gerente corporativo SSOMA', emp:'via', cel:'987 410 109' },
  { id:'u-ger', rango:'gerente', nombre:'Patricia Salazar Ugarte', cargo:'Gerente SSOMA', emp:'via', cel:'987 410 225' },
  { id:'u-jef', rango:'jefe', nombre:'Carlos Ramos Vílchez', cargo:'Jefe SSOMA', emp:'via', cel:'987 410 318' },
  { id:'u-s1',  rango:'supervisor', nombre:'Diego Huertas Lazo', cargo:'Supervisor SSOMA', emp:'via', cel:'987 410 441', zona:'Sótanos y cimentación' },
  { id:'u-s2',  rango:'supervisor', nombre:'Rocío Valdivia Paz', cargo:'Supervisora SSOMA', emp:'via', cel:'987 410 552', zona:'Torre de estacionamientos' },
  { id:'u-s3',  rango:'supervisor', nombre:'Martín Cárdenas Ríos', cargo:'Supervisor SSOMA', emp:'via', cel:'987 410 663', zona:'Nave comercial y fachadas' },
  { id:'u-rimac',  rango:'sub', nombre:'Jhon Paredes Mego', cargo:'Supervisor SSOMA', emp:'rimac', cel:'976 220 114' },
  { id:'u-sur',    rango:'sub', nombre:'Miriam Torres Huamán', cargo:'Supervisora SSOMA', emp:'sur', cel:'976 220 225' },
  { id:'u-pacif',  rango:'sub', nombre:'Raúl Benites Coral', cargo:'Supervisor SSOMA', emp:'pacif', cel:'976 220 336' },
  { id:'u-chavin', rango:'sub', nombre:'Edgar Quispe Layme', cargo:'Supervisor SSOMA', emp:'chavin', cel:'976 220 447' }
];
var CEN_ROLES = [
  { k:'corp', u:'u-corp', t:'Gerente corporativo SSOMA', o:'Gerente corporativo', p:'Corporativo', sub:'Plan Corporativo · todas las obras de la empresa' },
  { k:'gerente', u:'u-ger', t:'Gerente SSOMA', o:'Gerente SSOMA', p:'Gerente SSOMA', sub:'Principal · 10 % campo · 90 % oficina' },
  { k:'jefe', u:'u-jef', t:'Jefe SSOMA', o:'Jefe SSOMA', p:'Jefe SSOMA', sub:'Principal · 40 % campo · 60 % oficina' },
  { k:'supervisor', u:'u-s1', t:'Supervisor SSOMA', o:'Supervisor SSOMA', p:'Supervisor', sub:'Principal · 50 % campo · 50 % oficina' },
  { k:'sub', u:'u-rimac', t:'Supervisor de una subcontrata', o:'Supervisor de subcontrata', p:'Subcontrata', sub:'Encofrados Rímac · entra gratis' }
];
var CEN_LUGARES = ['Sótano 2 · eje C-4', 'Sótano 1 · rampa', 'Sótano 2 · cisterna', 'Nave comercial · eje F-7', 'Nave comercial · fachada norte',
  'Torre de estacionamientos · piso 3', 'Torre de estacionamientos · piso 4', 'Torre de estacionamientos · piso 5', 'Patio de maniobras',
  'Cimentación · zapata Z-12', 'Cuarto de tableros', 'Almacén general', 'Acceso vehicular · portería 2', 'Losa del techo · eje B-2'];
/* lo que se observa (con su foto de antes y de después: dibujos, no fotos de nadie) */
var CEN_TIPOS = [
  { k:'baranda', t:'Borde de losa sin baranda', riesgo:'alto', cond:true, emp:['rimac', 'via'], fa:'baranda-antes', fd:'baranda-despues', sol:'Se instaló baranda con rodapié y se señalizó el borde.' },
  { k:'encofrado', t:'Encofrado sin arriostre', riesgo:'alto', cond:true, emp:['rimac'], fa:'orden-antes', fd:'orden-despues', sol:'Se arriostró el encofrado y lo revisó el capataz antes del vaciado.' },
  { k:'hueco', t:'Hueco en losa sin tapa', riesgo:'alto', cond:true, emp:['via', 'rimac'], fa:'hueco', fd:'hueco-tapado', sol:'Se tapó con tablones fijados y se señalizó.' },
  { k:'andamio', t:'Andamio sin rodapié ni barandas', riesgo:'alto', cond:true, emp:['chavin'], fa:'andamio-antes', fd:'andamio-despues', sol:'Se completaron barandas y rodapiés; tarjeta verde de andamio operativo.' },
  { k:'zanja', t:'Zanja sin entibado ni barrera', riesgo:'alto', cond:true, emp:['sur'], fa:'zanja-antes', fd:'zanja-despues', sol:'Se entibó la zanja y se cerró con barrera rígida.' },
  { k:'arnes', t:'Trabajo en altura sin enganchar el arnés', riesgo:'alto', cond:false, emp:['rimac', 'chavin'], fa:'baranda-antes', fd:'baranda-despues', sol:'Se paró el trabajo, se instaló la línea de vida y se dio charla a la cuadrilla.' },
  { k:'cable', t:'Cable eléctrico expuesto en el pasadizo', riesgo:'medio', cond:true, emp:['pacif', 'via'], fa:'cable', fd:'cable-canalizado', sol:'Se canalizó el cable por la pared, fuera del paso.' },
  { k:'tablero', t:'Tablero eléctrico sin tapa', riesgo:'medio', cond:true, emp:['pacif'], fa:'tablero-antes', fd:'tablero-despues', sol:'Se colocó la tapa con candado y la señal de riesgo eléctrico.' },
  { k:'epp', t:'Personal sin lentes en el corte de fierro', riesgo:'medio', cond:false, emp:['via', 'rimac', 'pacif'], fa:'orden-antes', fd:'orden-despues', sol:'Se entregaron lentes y se reforzó el uso en la charla del día.' },
  { k:'extintor', t:'Extintor vencido', riesgo:'bajo', cond:true, emp:['via', 'sur', 'rimac'], fa:'extintor-antes', fd:'extintor-despues', sol:'Se cambió por uno recargado, colgado y señalizado.' },
  { k:'orden', t:'Material apilado en la vía de tránsito', riesgo:'bajo', cond:true, emp:['via', 'rimac', 'sur', 'pacif', 'chavin'], fa:'orden-antes', fd:'orden-despues', sol:'Se ordenó el material fuera de la vía y se demarcó el paso.' }
];
/* el estándar de capacitación: lo que exige cada puesto (12 meses de vigencia) */
var CEN_CURSOS = [
  { k:'ind', t:'Inducción de seguridad y salud en el trabajo', todos:true },
  { k:'epp', t:'Uso y cuidado del EPP', todos:true },
  { k:'emer', t:'Respuesta ante emergencias', todos:true },
  { k:'alt', t:'Trabajos en altura y uso del arnés', pues:/encofrador|andamiero|operario|capataz/i },
  { k:'exc', t:'Excavaciones y zanjas', emp:['sur'] },
  { k:'ele', t:'Trabajo eléctrico seguro y bloqueo (LOTO)', pues:/electricista/i },
  { k:'iza', t:'Izaje de cargas y señalización', pues:/rigger|grúa/i }
];
var CEN_PUESTOS = {
  via:    [['Operario', 38], ['Oficial', 30], ['Peón', 34], ['Capataz', 8], ['Fierrero', 18], ['Rigger', 6], ['Operador de grúa', 4], ['Topógrafo', 4], ['Almacenero', 4], ['Ingeniero de campo', 4]],
  rimac:  [['Encofrador', 62], ['Oficial encofrador', 40], ['Peón', 30], ['Capataz', 8]],
  sur:    [['Operador de excavadora', 14], ['Operador de retroexcavadora', 10], ['Vigía', 14], ['Peón', 50], ['Capataz', 7]],
  pacif:  [['Electricista', 34], ['Oficial electricista', 26], ['Ayudante', 24], ['Capataz', 6]],
  chavin: [['Andamiero', 28], ['Oficial andamiero', 18], ['Ayudante', 15], ['Capataz', 4]]
};
var CEN_NOMBRES = ['Juan', 'José', 'Luis', 'Carlos', 'Miguel', 'Jorge', 'Pedro', 'Víctor', 'Raúl', 'César', 'Edwin', 'Wilber', 'Freddy', 'Percy', 'Héctor',
  'Abel', 'Julio', 'Rubén', 'Elmer', 'Gustavo', 'Nilton', 'Marco', 'Jhon', 'Ronald', 'Wilmer', 'Alex', 'Hugo', 'Iván', 'Óscar', 'Santos', 'Teodoro',
  'Fidel', 'Germán', 'Hernán', 'Félix', 'Ángel', 'Rolando', 'Walter', 'Erick', 'Brayan', 'Kevin', 'Jhonatan', 'Roberto', 'Simón', 'Ana', 'Rosa',
  'María', 'Carmen', 'Lucía', 'Gladys', 'Yesenia', 'Milagros'];
var CEN_APELLIDOS = ['Quispe', 'Mamani', 'Huamán', 'Condori', 'Flores', 'Rojas', 'Torres', 'Vargas', 'Ramos', 'Chávez', 'Cruz', 'Mendoza', 'Ccori',
  'Apaza', 'Ticona', 'Huaraca', 'Pariona', 'Laura', 'Mallma', 'Ñahui', 'Sánchez', 'Huillca', 'Espinoza', 'Gutiérrez', 'Salas', 'Benites', 'Llanos',
  'Cárdenas', 'Pumacayo', 'Inga', 'Choque', 'Yupanqui', 'Vilca', 'Tito', 'Paredes', 'Coaquira', 'Ccahua', 'Layme', 'Pari', 'Soto', 'Díaz', 'Paz',
  'León', 'Castro', 'Rivas', 'Aguilar', 'Medina', 'Reyes', 'Salazar', 'Velásquez', 'Romero', 'Arias', 'Cusi', 'Ayala', 'Lazo', 'Gamarra'];

/* ══ LA OBRA DE EJEMPLO ══════════════════════════════════════════════ */
function cenArmarDemo(ahora0){
  /* ahora0: la hora con la que se armó hoy la primera vez, si en este navegador ya se hizo algo hoy:
     así lo validado o levantado sigue en su sitio al volver a abrir */
  var ahora = ahora0 || Date.now(), hoy = _cenISO(new Date(ahora));
  var r = _cenAzar(20261001);
  var pick = function(l){ return l[Math.floor(r() * l.length)]; };
  var obra = { id:'demo-central', nombre:'Centro Comercial Los Álamos', codigo:'DEM-C01', plan:'central',
               cliente:'Inversiones Los Álamos S.A.', inicio:_cenDia(hoy, -214), principal:'via', lugar:'Lima' };
  /* lo que se ve: el mes pasado entero y este, hasta hoy */
  var mesIni = hoy.slice(0, 8) + '01', antIni = _cenDia(mesIni, -1).slice(0, 8) + '01';
  /* la gente: nombres y DNI inventados */
  var usados = {}, personal = [], nDni = 0;
  CEN_EMPRESAS.forEach(function(e){
    var lista = [];
    CEN_PUESTOS[e.id].forEach(function(p){ for(var i = 0; i < p[1]; i++) lista.push(p[0]); });
    lista.slice(0, e.gente).forEach(function(puesto, i){
      var nom;
      do { nom = pick(CEN_APELLIDOS) + ' ' + pick(CEN_APELLIDOS) + ', ' + pick(CEN_NOMBRES); } while(usados[nom]);
      usados[nom] = 1; nDni++;
      var dni = String(40000000 + Math.floor(r() * 39999999));
      var ingreso = _cenDia(hoy, -Math.floor(10 + r() * 200));
      personal.push({ id:e.id + '-' + i, emp:e.id, nombre:nom, dni:dni, puesto:puesto, ingreso:ingreso,
        frente:pick(['Sótanos', 'Torre de estacionamientos', 'Nave comercial', 'Cimentación', 'Fachadas', 'Patio de maniobras']) });
    });
  });
  /* su capacitación: lo que le exige su puesto, con fecha; cada empresa con su nivel */
  var exige = function(p){ return CEN_CURSOS.filter(function(c){ return c.todos || (c.pues && c.pues.test(p.puesto)) || (c.emp && c.emp.indexOf(p.emp) > -1); }); };
  personal.forEach(function(p){
    var e = cenEmp(p.emp), malo = r() > e.cap;
    p.caps = {};
    exige(p).forEach(function(c, j){
      var dias = Math.floor(r() * 362);
      p.caps[c.k] = { f:_cenDia(hoy, -dias), ok:true };
    });
    if(malo){
      var req = Object.keys(p.caps), k = pick(req), cual = r();
      if(cual < 0.45) p.caps[k] = { f:_cenDia(hoy, -(366 + Math.floor(r() * 60))), ok:false, vencida:true };
      else delete p.caps[k];
    }
    p.req = exige(p).map(function(c){ return c.k; });
    p.falta = p.req.filter(function(k){ return !p.caps[k] || !p.caps[k].ok; });
    p.porVencer = p.req.filter(function(k){ var c = p.caps[k]; return c && c.ok && c.f <= _cenDia(hoy, -335); });
    p.alDia = !p.falta.length;
  });
  /* el ATS del día y los últimos 30 días, por frente */
  var ats = {};
  CEN_EMPRESAS.forEach(function(e){
    var hist = [];
    for(var dia = antIni; dia <= hoy; dia = _cenDia(dia, 1)){
      var dow = new Date(dia + 'T12:00:00').getDay(), esHoy = dia === hoy;
      if(dow === 0 && !esHoy){ hist.push({ dia:dia, fr:0, ok:0 }); continue; }
      var fr = e.frentes - (dow === 6 && !esHoy ? Math.ceil(e.frentes / 3) : 0);
      var ok = fr - (r() < 0.12 ? 1 : 0);
      hist.push({ dia:dia, fr:fr, ok:ok });
    }
    /* hoy: Excavaciones Sur Grande con un frente sin ATS, Encofrados Rímac también */
    var t = hist[hist.length - 1];
    if(t.fr){ t.ok = t.fr - ((e.id === 'sur' || e.id === 'rimac') ? 1 : 0); }
    ats[e.id] = hist;
  });
  /* la gente de cada día: el mes pasado y este (para el uso del mes: se cobra el día de más gente) */
  var dias = [];
  for(var dd = antIni; dd <= hoy; dd = _cenDia(dd, 1)){
    var dw = new Date(dd + 'T12:00:00').getDay(), fila = { dia:dd, por:{} , total:0 };
    CEN_EMPRESAS.forEach(function(e){
      var lejos = Math.max(0, (Date.parse(hoy) - Date.parse(dd)) / 86400000);
      var base = e.gente * (1 - lejos * 0.0028) * (dw === 0 ? 0.08 : (dw === 6 ? 0.62 : 1)) * (0.97 + r() * 0.05);
      var n = Math.round(base); fila.por[e.id] = n; fila.total += n;
    });
    dias.push(fila);
  }
  var tHoy = dias[dias.length - 1];
  CEN_EMPRESAS.forEach(function(e){ tHoy.total += e.gente - tHoy.por[e.id]; tHoy.por[e.id] = e.gente; });
  /* las observaciones desde el mes pasado (unas 3 por día) */
  var largo = Math.round((Date.parse(hoy) - Date.parse(antIni)) / 86400000) + 1;
  var obs = [], nObs = Math.round(largo * 3.4), supervisores = CEN_EQUIPO.filter(function(u){ return u.rango === 'supervisor'; });
  var pesoEmp = { via:0.16, rimac:0.32, sur:0.17, pacif:0.17, chavin:0.18 };
  for(var i = 0; i < nObs; i++){
    var tipo = pick(CEN_TIPOS), emp = pick(tipo.emp);
    if(r() > 0.35){ var x = r(), ac = 0; for(var k in pesoEmp){ ac += pesoEmp[k]; if(x <= ac){ emp = k; break; } } if(tipo.emp.indexOf(emp) < 0) emp = pick(tipo.emp); }
    var hacems = Math.floor(r() * (largo - 0.2) * 86400000) + 3600000;
    var creado = ahora - hacems, R = CEN_RIESGO[tipo.riesgo], vence = creado + R.h * 3600000;
    var o = { id:'OB-' + (1000 + i), tipo:tipo.k, titulo:tipo.t, riesgo:tipo.riesgo, cond:tipo.cond, emp:emp, lugar:pick(CEN_LUGARES),
              creado:creado, vence:vence, por:pick(supervisores).id, fa:tipo.fa, fd:tipo.fd, historia:[] };
    o.historia.push({ t:creado, u:o.por, que:'observa', nota:'Riesgo ' + R.t.toLowerCase() + ': plazo de ' + (R.h < 48 ? R.h + ' horas' : (R.h / 24) + ' días') + '.' });
    /* cómo le fue: casi todo se levanta a tiempo; algo, tarde; lo de estos días sigue abierto */
    var suerte = r(), uSub = CEN_EQUIPO.filter(function(u){ return u.emp === emp && u.rango === 'sub'; })[0];
    var quienLev = uSub ? uSub.id : (emp === 'via' ? 'u-s2' : o.por);
    if(vence < ahora || suerte < 0.75){
      var tarde = suerte > 0.86, lev = creado + R.h * 3600000 * (tarde ? (1.15 + r() * 0.8) : (0.25 + r() * 0.6));
      if(lev < ahora - 1800000){
        o.historia.push({ t:lev, u:quienLev, que:'levanta', nota:tipo.sol });
        var val = lev + (1 + r() * 9) * 3600000;
        if(r() < 0.07 && val < ahora){
          o.historia.push({ t:val, u:o.por, que:'rechaza', nota:'La foto no muestra el rodapié completo. Que se termine y se vuelva a levantar.' });
          var lev2 = val + (2 + r() * 10) * 3600000;
          if(lev2 < ahora){ o.historia.push({ t:lev2, u:quienLev, que:'levanta', nota:tipo.sol }); val = lev2 + 3 * 3600000; }
        }
        if(val < ahora && o.historia[o.historia.length - 1].que === 'levanta') o.historia.push({ t:val, u:o.por, que:'valida', nota:'' });
      }
    }
    obs.push(o);
  }
  /* las de la portada, a propósito (las que se ven en central.html y en los videos) */
  var fijo = function(id, tipoK, emp, lugar, horasAtras, op){
    var tipo = CEN_TIPOS.filter(function(t){ return t.k === tipoK; })[0], R = CEN_RIESGO[tipo.riesgo];
    var creado = ahora - horasAtras * 3600000;
    var o = { id:id, tipo:tipo.k, titulo:tipo.t, riesgo:tipo.riesgo, cond:tipo.cond, emp:emp, lugar:lugar, creado:creado,
              vence:creado + R.h * 3600000, por:(op && op.por) || 'u-s1', fa:tipo.fa, fd:tipo.fd, historia:[], fija:true };
    o.historia.push({ t:creado, u:o.por, que:'observa', nota:(op && op.nota) || ('Riesgo ' + R.t.toLowerCase() + ': plazo de ' + (R.h < 48 ? R.h + ' horas' : (R.h / 24) + ' días') + '.') });
    if(op && op.levantada){ var u = CEN_EQUIPO.filter(function(x){ return x.emp === emp && x.rango === 'sub'; })[0];
      o.historia.push({ t:ahora - op.levantada * 3600000, u:u ? u.id : 'u-s2', que:'levanta', nota:tipo.sol }); }
    obs.push(o);
  };
  fijo('OB-1201', 'encofrado', 'rimac', 'Torre de estacionamientos · piso 4', 26, { nota:'Encofrado de la losa del piso 4 sin arriostre, con vaciado programado para mañana.' });
  fijo('OB-1202', 'arnes', 'rimac', 'Torre de estacionamientos · piso 5', 49, { por:'u-s2' });
  fijo('OB-1203', 'baranda', 'rimac', 'Torre de estacionamientos · piso 5', 6, { por:'u-s2' });
  fijo('OB-1204', 'andamio', 'chavin', 'Nave comercial · fachada norte', 20, { por:'u-s3' });
  fijo('OB-1205', 'orden', 'chavin', 'Nave comercial · eje F-7', 50, { por:'u-s3', levantada:3 });
  fijo('OB-1206', 'tablero', 'pacif', 'Cuarto de tableros', 30, { por:'u-s3' });
  fijo('OB-1207', 'cable', 'pacif', 'Sótano 1 · rampa', 9, { por:'u-s1', levantada:1.5 });
  fijo('OB-1208', 'hueco', 'via', 'Losa del techo · eje B-2', 4, { por:'u-s1' });
  fijo('OB-1209', 'zanja', 'sur', 'Patio de maniobras', 22, { por:'u-s1', levantada:2 });
  obs.sort(function(a, b){ return b.creado - a.creado; });
  /* los reportes de la gente de cada empresa (los resuelve su propio supervisor) y lo demás del mes */
  var mes = { reportes:{ via:18, rimac:25, sur:9, pacif:7, chavin:6 }, resueltos:{ via:0.94, rimac:0.88, sur:1, pacif:1, chavin:0.83 },
              capas:{ via:6, rimac:4, sur:3, pacif:3, chavin:2 }, epp:{ via:412, rimac:466, sur:241, pacif:198, chavin:173 },
              incidentes:2, accidentes:0, diasSin:214 };
  return { obra:obra, empresas:CEN_EMPRESAS.slice(), equipo:CEN_EQUIPO.slice(), personal:personal, ats:ats, dias:dias, obs:obs, mes:mes,
           invitadas:[], ahora:ahora, ahora0:ahora, hoy:hoy, mesIni:mesIni, antIni:antIni };
}
function cenEmp(id){ for(var i = 0; i < CEN_EMPRESAS.length; i++) if(CEN_EMPRESAS[i].id === id) return CEN_EMPRESAS[i];
  var d = CEN.d; if(d) for(var j = 0; j < d.invitadas.length; j++) if(d.invitadas[j].id === id) return d.invitadas[j]; return null; }
function cenUsuario(id){ for(var i = 0; i < CEN_EQUIPO.length; i++) if(CEN_EQUIPO[i].id === id) return CEN_EQUIPO[i]; return null; }
function cenRol(){ return CEN_ROLES.filter(function(x){ return x.k === CEN.rol; })[0] || CEN_ROLES[2]; }
function cenYo(){ return cenUsuario(cenRol().u); }

/* ══ LO QUE SE HIZO EN LA DEMO (queda en este navegador) ═════════════ */
function _cenEstLeer(){ try{ var v = JSON.parse(localStorage.getItem(CEN_LS_EST) || 'null'); return (v && v.dia === _cenISO(new Date())) ? v : null; }catch(e){ return null; } }
function _cenEstGuardar(){
  if(!CEN.demo) return;
  var ext = { dia:CEN.d.hoy, ahora0:CEN.d.ahora0, hist:{}, nuevas:[], invitadas:CEN.d.invitadas };
  CEN.d.obs.forEach(function(o){ if(o.extra) ext.hist[o.id] = o.historia.slice(o.base); if(o.nueva) ext.nuevas.push(o); });
  try{ localStorage.setItem(CEN_LS_EST, JSON.stringify(ext)); }catch(e){}
}
function _cenEstAplicar(ext){
  CEN.d.obs.forEach(function(o){ o.base = o.historia.length; });
  if(!ext) return;
  (ext.nuevas || []).forEach(function(o){ CEN.d.obs.unshift(o); });
  CEN.d.obs.forEach(function(o){ var h = ext.hist[o.id]; if(h && h.length && !o.nueva){ o.historia = o.historia.concat(h); o.extra = true; } });
  CEN.d.invitadas = ext.invitadas || [];
}
/* la obra de ejemplo: la de hoy, con lo que ya se hizo en este navegador */
function cenCargarDemo(){
  var ext = _cenEstLeer();
  CEN.d = cenArmarDemo(ext && ext.ahora0);
  CEN.d.ahora = Date.now();
  _cenEstAplicar(ext);
}
function cenReiniciar(){ try{ localStorage.removeItem(CEN_LS_EST); }catch(e){} cenCargarDemo(); }

/* ══ EL ESTADO DE CADA OBSERVACIÓN ═══════════════════════════════════
   abierta → levantada (la subcontrata, con foto) → cerrada (el
   supervisor la valida) · o rechazada (vuelve a abierta).
   Vencida: pasó su plazo sin levantarse. Sube sola: al vencer, al jefe;
   un día después, al gerente. */
function cenEstado(o){
  var ult = o.historia[o.historia.length - 1].que;
  var est = ult === 'valida' ? 'cerrada' : (ult === 'levanta' ? 'levantada' : 'abierta');
  var ahora = CEN.d.ahora, nivel = 0, vencida = false;
  if(est === 'abierta' && ahora > o.vence){ vencida = true; nivel = (ahora - o.vence > 24 * 3600000) ? 2 : 1; }
  var levs = o.historia.filter(function(h){ return h.que === 'levanta'; });
  var aTiempo = levs.length ? levs[0].t <= o.vence : null;
  var cierre = est === 'cerrada' ? o.historia[o.historia.length - 1].t : null;
  return { est:est, vencida:vencida, nivel:nivel, aTiempo:aTiempo, rechazos:o.historia.filter(function(h){ return h.que === 'rechaza'; }).length, cierre:cierre };
}
function cenEstadoHTML(o, s){
  s = s || cenEstado(o);
  if(s.est === 'cerrada') return '<span class="pill ok">Cerrada</span>';
  if(s.est === 'levantada') return '<span class="pill azul">Levantada · por validar</span>';
  if(s.vencida) return '<span class="pill mal">Vencida hace ' + _cenHace(CEN.d.ahora - o.vence) + '</span>';
  var falta = o.vence - CEN.d.ahora;
  return '<span class="pill ' + (falta < 6 * 3600000 ? 'ojo' : 'gris') + '">Vence en ' + _cenHace(falta) + '</span>';
}
function cenRiesgoHTML(r){ var R = CEN_RIESGO[r]; return '<span class="cen-riesgo ' + r + '">' + R.t + '</span>'; }
function cenFoto(n){ return 'central-demo/' + n + '.jpg'; }
/* el nombre de los archivos que salen: el de la obra, nunca su código (el código es la llave para unirse) */
function _cenSlug(){ return String(CEN.d.obra.nombre).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

/* ── las cifras de cada empresa, hoy ── */
function cenIndicadores(empId){
  var d = CEN.d, gente = d.personal.filter(function(p){ return p.emp === empId; });
  var alDia = gente.filter(function(p){ return p.alDia; }).length;
  var at = (d.ats[empId] || []), hoyAts = at[at.length - 1] || { fr:0, ok:0 };
  var mias = d.obs.filter(function(o){ return o.emp === empId; }), ab = 0, ven = 0, lev = 0;
  mias.forEach(function(o){ var s = cenEstado(o); if(s.est === 'abierta') ab++; if(s.vencida) ven++; if(s.est === 'levantada') lev++; });
  var desde = d.ahora - 30 * 86400000;
  var delMes = mias.filter(function(o){ return o.creado >= desde; });
  var cerradasMes = delMes.filter(function(o){ return cenEstado(o).aTiempo !== null; });
  var aTiempo = cerradasMes.filter(function(o){ return cenEstado(o).aTiempo; }).length;
  var cap = gente.length ? alDia / gente.length : 1;
  var estado = ven ? { t:'Vencida', cl:'mal' } : (cap < 0.85 ? { t:'Capacitación', cl:'ojo' } : (hoyAts.ok < hoyAts.fr ? { t:'Falta ' + (hoyAts.fr - hoyAts.ok) + ' ATS', cl:'ojo' } : { t:'Bien', cl:'ok' }));
  return { gente:gente.length, alDia:alDia, cap:cap, atsFr:hoyAts.fr, atsOk:hoyAts.ok, abiertas:ab, vencidas:ven, levantadas:lev,
           delMes:delMes.length, aTiempo:cerradasMes.length ? aTiempo / cerradasMes.length : 1, estado:estado };
}

/* ══ LAS SECCIONES, SEGÚN EL RANGO ═══════════════════════════════════ */
var CEN_V = {
  obras:    { id:'cen-obras', g:'Corporativo', ic:'◫', n:'Tus obras', s:'Todas las obras de la empresa, lado a lado, con lo de hoy y lo del mes' },
  contratistas: { id:'cen-contratistas', g:'Corporativo', ic:'⇄', n:'Contratistas', s:'Cada subcontrata en todas tus obras: cómo cumple, para decidir a quién llamas en la próxima' },
  tablero:  { id:'cen-tablero', g:'La obra', ic:'▦', n:'Tablero de la obra', s:'Cada empresa, hoy: su gente, su capacitación, su ATS y lo que tiene abierto' },
  subio:    { id:'cen-subio', g:'La obra', ic:'⤴', n:'Subió a ti', s:'Lo que venció sin levantarse y llegó a tu rango, con el teléfono de quien lo tiene que levantar' },
  obs:      { id:'cen-obs', g:'La obra', ic:'◉', n:'Observaciones', s:'Con foto, plazo por riesgo y escalamiento · la subcontrata levanta con foto, el supervisor valida' },
  pend:     { id:'cen-pend', g:'Mi día', ic:'☑', n:'Mis pendientes', s:'Lo que te toca validar y lo tuyo que vence hoy' },
  levantar: { id:'cen-levantar', g:'Mi empresa', ic:'⚒', n:'Por levantar', s:'Lo que la principal le observó a tu empresa, con su plazo y su foto' },
  miemp:    { id:'cen-miemp', g:'Mi empresa', ic:'▦', n:'Mi empresa en la obra', s:'Lo mismo que la principal ve de tu empresa. Las otras empresas no lo ven' },
  empresas: { id:'cen-empresas', g:'Empresas', ic:'▣', n:'Subcontratas', s:'Las empresas de la obra, su supervisor y su invitación · entran gratis' },
  personal: { id:'cen-personal', g:'Empresas', ic:'☺', n:'Personal de la obra', s:'La gente de todas las empresas, con su capacitación al día' },
  matriz:   { id:'cen-matriz', g:'Empresas', ic:'▤', n:'Capacitación por empresa', s:'El estándar de la obra y cuánto lo cumple cada empresa' },
  informe:  { id:'cen-informe', g:'Gestión', ic:'▧', n:'Informe del mes', s:'El consolidado de todas las empresas, en PDF, sin armar nada' },
  uso:      { id:'cen-uso', g:'Gestión', ic:'↗', n:'Uso del mes', s:'La gente de cada día de la obra: se cobra el día de más gente' },
  equipo:   { id:'cen-equipo', g:'Gestión', ic:'⚑', n:'Equipo y rangos', s:'Quién ve qué y a quién le sube cada cosa' },
  estandar: { id:'cen-estandar', g:'Gestión', ic:'⚙', n:'El estándar de la obra', s:'Plazos por riesgo, escalamiento y la capacitación que exige cada puesto' }
};
var CEN_POR_ROL = {
  corp:       ['obras', 'contratistas', 'tablero', 'obs', 'empresas', 'personal', 'matriz', 'informe', 'equipo'],
  gerente:    ['tablero', 'subio', 'obs', 'empresas', 'personal', 'matriz', 'informe', 'uso', 'equipo', 'estandar'],
  jefe:       ['tablero', 'subio', 'obs', 'empresas', 'personal', 'matriz', 'informe', 'equipo', 'estandar'],
  supervisor: ['pend', 'tablero', 'obs', 'personal', 'matriz'],
  sub:        ['levantar', 'miemp', 'personal', 'matriz']
};
function centralVistas(){
  return (CEN_POR_ROL[CEN.rol] || CEN_POR_ROL.jefe).map(function(k){
    var v = CEN_V[k], g = v.g;
    /* el corporativo ve sus obras arriba y, abajo, la obra que tiene abierta */
    if(CEN.rol === 'corp' && v.g !== 'Corporativo') g = 'Obra abierta · ' + CEN.d.obra.nombre.replace(/^Centro Comercial /, '');
    return { id:v.id, g:g, ic:v.ic, n:v.n, s:v.s, tablas:[], pintar:function(caja){ CEN.d.ahora = Date.now(); CEN_PINTA[k](caja); } };
  });
}
function cenEsPrincipal(){ return CEN.rol !== 'sub'; }
function cenMiEmp(){ var u = cenYo(); return u ? u.emp : null; }
/* lo que cada rango puede ver: la subcontrata, solo lo suyo */
function cenObsVisibles(){
  var d = CEN.d; if(cenEsPrincipal()) return d.obs;
  var e = cenMiEmp(); return d.obs.filter(function(o){ return o.emp === e; });
}
function cenPersonalVisible(){
  var d = CEN.d; if(cenEsPrincipal()) return d.personal;
  var e = cenMiEmp(); return d.personal.filter(function(p){ return p.emp === e; });
}
function cenEmpresasVisibles(){ return cenEsPrincipal() ? CEN_EMPRESAS : CEN_EMPRESAS.filter(function(e){ return e.id === cenMiEmp(); }); }
/* lo que subió a este rango: al jefe, todo lo vencido; al gerente, lo que lleva más de un día vencido */
function cenSubioAMi(){
  if(CEN.rol !== 'jefe' && CEN.rol !== 'gerente') return [];
  var min = CEN.rol === 'gerente' ? 2 : 1;
  return CEN.d.obs.filter(function(o){ var s = cenEstado(o); return s.vencida && s.nivel >= min; })
    .sort(function(a, b){ return a.vence - b.vence; });
}
function _cenAcc(html){ var ac = $('acciones'); if(ac) ac.innerHTML = html || ''; }
function _cenWA(cel, txt){ return 'https://wa.me/51' + String(cel || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(txt); }

/* ══ EL TABLERO ════════════════════════════════════════════════════ */
function cenVistaTablero(caja){
  var d = CEN.d, emps = cenEmpresasVisibles(), tot = { gente:0, alDia:0, fr:0, ok:0, ab:0, ven:0, lev:0, aT:0, nT:0 };
  var filas = emps.map(function(e){
    var x = cenIndicadores(e.id);
    tot.gente += x.gente; tot.alDia += x.alDia; tot.fr += x.atsFr; tot.ok += x.atsOk; tot.ab += x.abiertas; tot.ven += x.vencidas; tot.lev += x.levantadas;
    tot.aT += x.aTiempo * x.delMes; tot.nT += x.delMes;
    return { e:e, x:x };
  });
  _cenAcc(cenEsPrincipal() ? '<button type="button" class="bt sec" id="cen-t-informe">Informe del mes</button><button type="button" class="bt" id="cen-t-obs">＋ Nueva observación</button>' : '');
  var h = '';
  var sub = cenSubioAMi();
  if(sub.length) h += '<button type="button" class="cen-subio" id="cen-subio-ir"><span class="cen-subio-n">' + sub.length + '</span><span><b>' +
    (sub.length === 1 ? 'Subió a ti una observación vencida' : 'Subieron a ti ' + sub.length + ' observaciones vencidas') + '</b><small>' +
    esc(cenEmp(sub[0].emp).corto + ' · ' + sub[0].titulo.toLowerCase() + ' · venció hace ' + _cenHace(d.ahora - sub[0].vence)) + '</small></span><span class="cen-subio-ir">Ver ›</span></button>';
  h += '<div class="rej cen-cifras">' +
    cifra('Gente hoy', _cenN(tot.gente), emps.length + (emps.length === 1 ? ' empresa' : ' empresas') + ' en la obra', '') +
    cifra('Capacitación al día', _cenPct(tot.gente ? tot.alDia / tot.gente : 1), _cenN(tot.gente - tot.alDia) + ' con algo pendiente', tot.alDia / Math.max(1, tot.gente) < 0.9 ? 'ojo' : 'ok') +
    cifra('ATS de hoy', tot.ok + ' de ' + tot.fr, tot.ok < tot.fr ? (tot.fr - tot.ok) + (tot.fr - tot.ok === 1 ? ' frente sin ATS' : ' frentes sin ATS') : 'todos los frentes', tot.ok < tot.fr ? 'ojo' : 'ok') +
    cifra('Observaciones abiertas', String(tot.ab), tot.ven ? tot.ven + (tot.ven === 1 ? ' vencida' : ' vencidas') + ' · ' + tot.lev + ' por validar' : tot.lev + ' por validar', tot.ven ? 'mal' : '') +
    cifra('Levantadas a tiempo', _cenPct(tot.nT ? tot.aT / tot.nT : 1), 'últimos 30 días', '') + '</div>';
  /* cada empresa */
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>Cada empresa, hoy</h2><p class="sub">Toca una empresa para ver su detalle · la principal ve a todas; cada subcontrata, solo lo suyo</p></div></div>' +
    '<div class="tabla-caja"><table class="cen-emps"><thead><tr><th>Empresa</th><th class="num">Gente</th><th>Capacitación</th><th class="num">ATS hoy</th><th class="num">Abiertas</th><th class="num">Vencidas</th><th>Estado</th></tr></thead><tbody>';
  filas.forEach(function(f){
    var x = f.x, e = f.e;
    h += '<tr class="clic" data-emp="' + e.id + '"><td><b class="cen-emp-n">' + esc(e.corto) + '</b>' + (e.principal ? ' <span class="pill azul">Principal</span>' : '') +
      '<small class="cen-emp-r">' + esc(e.rubro) + '</small></td><td class="num">' + _cenN(x.gente) + '</td>' +
      '<td>' + _cenBarra(x.cap, 0.85) + '</td>' +
      '<td class="num' + (x.atsOk < x.atsFr ? ' cen-ojo' : '') + '">' + x.atsOk + '/' + x.atsFr + '</td><td class="num">' + x.abiertas + '</td>' +
      '<td class="num' + (x.vencidas ? ' cen-mal' : '') + '">' + x.vencidas + '</td><td><span class="pill ' + x.estado.cl + '">' + esc(x.estado.t) + '</span></td></tr>';
  });
  h += '</tbody></table></div></div>';
  /* lo abierto por riesgo y lo que vence hoy */
  var abiertas = cenObsVisibles().filter(function(o){ var s = cenEstado(o); return s.est === 'abierta'; });
  var porEmp = emps.map(function(e){ var l = abiertas.filter(function(o){ return o.emp === e.id; });
    return { e:e, alto:l.filter(function(o){ return o.riesgo === 'alto'; }).length, medio:l.filter(function(o){ return o.riesgo === 'medio'; }).length, bajo:l.filter(function(o){ return o.riesgo === 'bajo'; }).length }; });
  var maxA = Math.max.apply(null, porEmp.map(function(p){ return p.alto + p.medio + p.bajo; }).concat([1]));
  var vencen = abiertas.filter(function(o){ return !cenEstado(o).vencida && o.vence - d.ahora < 24 * 3600000; }).sort(function(a, b){ return a.vence - b.vence; });
  h += '<div class="cen-dos"><div class="tarj"><div class="tarj-cab"><div><h2>Lo abierto, por riesgo</h2><p class="sub">Observaciones sin levantar de cada empresa</p></div>' +
    '<div class="cen-ley"><span class="alto">Alto</span><span class="medio">Medio</span><span class="bajo">Bajo</span></div></div><div class="tarj-cuerpo cen-riesgos">';
  porEmp.forEach(function(p){
    var n = p.alto + p.medio + p.bajo;
    h += '<div class="cen-rf"><span class="cen-rf-n">' + esc(p.e.corto) + '</span><span class="cen-rf-b">' +
      (p.alto ? '<i class="alto" style="width:' + (p.alto / maxA * 100) + '%" title="' + p.alto + ' de riesgo alto"></i>' : '') +
      (p.medio ? '<i class="medio" style="width:' + (p.medio / maxA * 100) + '%" title="' + p.medio + ' de riesgo medio"></i>' : '') +
      (p.bajo ? '<i class="bajo" style="width:' + (p.bajo / maxA * 100) + '%" title="' + p.bajo + ' de riesgo bajo"></i>' : '') +
      '</span><b class="cen-rf-v">' + n + '</b></div>';
  });
  h += '</div></div><div class="tarj"><div class="tarj-cab"><div><h2>Vence en las próximas 24 horas</h2><p class="sub">Si no se levanta, sube sola al jefe</p></div></div><div class="tarj-cuerpo">';
  h += vencen.length ? '<ul class="cen-lista">' + vencen.slice(0, 6).map(function(o){
      return '<li><button type="button" class="cen-li" data-obs="' + o.id + '">' + cenRiesgoHTML(o.riesgo) + '<span><b>' + esc(o.titulo) + '</b><small>' +
        esc(cenEmp(o.emp).corto + ' · ' + o.lugar) + '</small></span>' + cenEstadoHTML(o) + '</button></li>'; }).join('') + '</ul>'
    : '<p class="cen-nada">Nada vence en las próximas 24 horas.</p>';
  h += '</div></div></div>';
  caja.innerHTML = h;
  Array.prototype.forEach.call(caja.querySelectorAll('tr[data-emp]'), function(tr){ tr.onclick = function(){ cenVerEmpresa(tr.getAttribute('data-emp')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-obs]'), function(b){ b.onclick = function(){ cenVerObs(b.getAttribute('data-obs')); }; });
  if($('cen-subio-ir')) $('cen-subio-ir').onclick = function(){ navegar('cen-subio'); };
  if($('cen-t-obs')) $('cen-t-obs').onclick = function(){ cenNuevaObs(); };
  if($('cen-t-informe')) $('cen-t-informe').onclick = function(){ navegar('cen-informe'); };
}
/* la ficha de una empresa: sus cifras, su supervisor, lo abierto y lo que le falta */
function cenVerEmpresa(id){
  var e = cenEmp(id), x = cenIndicadores(id), d = CEN.d;
  var sup = CEN_EQUIPO.filter(function(u){ return u.emp === id && (u.rango === 'sub' || (e.principal && u.rango === 'jefe')); })[0];
  var ab = d.obs.filter(function(o){ return o.emp === id && cenEstado(o).est !== 'cerrada'; }).sort(function(a, b){ return a.vence - b.vence; });
  var falta = d.personal.filter(function(p){ return p.emp === id && !p.alDia; });
  var porCurso = {}; falta.forEach(function(p){ p.falta.forEach(function(k){ porCurso[k] = (porCurso[k] || 0) + 1; }); });
  var at = d.ats[id] || [], t = at[at.length - 1] || { fr:0, ok:0 };
  var h = '<div class="rej cen-cifras cen-3">' +
    cifra('Gente hoy', _cenN(x.gente), '', '') + cifra('Capacitación al día', _cenPct(x.cap), x.gente - x.alDia + ' con algo pendiente', x.cap < 0.85 ? 'ojo' : 'ok') +
    cifra('ATS de hoy', x.atsOk + ' de ' + x.atsFr, x.atsOk < x.atsFr ? 'falta en ' + (x.atsFr - x.atsOk) + ' frente' + (x.atsFr - x.atsOk === 1 ? '' : 's') : 'todos sus frentes', x.atsOk < x.atsFr ? 'ojo' : 'ok') + '</div>';
  h += '<dl class="datos"><dt>RUC</dt><dd>' + esc(e.ruc) + '</dd><dt>Rubro</dt><dd>' + esc(e.rubro) + '</dd>' +
    (sup ? '<dt>' + (e.principal ? 'Jefe SSOMA' : 'Su supervisor') + '</dt><dd>' + esc(sup.nombre) + ' · <a href="tel:+51' + sup.cel.replace(/\D/g, '') + '">' + esc(sup.cel) + '</a></dd>' : '') +
    '<dt>En la obra</dt><dd>' + (e.principal ? 'Principal' : 'Subcontrata · entra gratis') + '</dd></dl>';
  h += '<h3 class="cen-h3">Lo que tiene abierto (' + ab.length + ')</h3>';
  h += ab.length ? '<ul class="cen-lista">' + ab.map(function(o){ return '<li><button type="button" class="cen-li" data-obs="' + o.id + '">' + cenRiesgoHTML(o.riesgo) +
      '<span><b>' + esc(o.titulo) + '</b><small>' + esc(o.lugar) + '</small></span>' + cenEstadoHTML(o) + '</button></li>'; }).join('') + '</ul>' : '<p class="cen-nada">Nada abierto.</p>';
  var ks = Object.keys(porCurso).sort(function(a, b){ return porCurso[b] - porCurso[a]; });
  h += '<h3 class="cen-h3">Lo que le falta de capacitación</h3>';
  h += ks.length ? '<ul class="cen-plana">' + ks.map(function(k){ var c = CEN_CURSOS.filter(function(z){ return z.k === k; })[0];
      return '<li><span>' + esc(c ? c.t : k) + '</span><b>' + porCurso[k] + (porCurso[k] === 1 ? ' persona' : ' personas') + '</b></li>'; }).join('') + '</ul>' : '<p class="cen-nada">Todo su personal está al día.</p>';
  abrirHoja(e.nombre, e.principal ? 'La principal de la obra' : 'Subcontrata de ' + cenEmp('via').corto, h,
    '<button type="button" class="bt sec" id="cen-e-pers">Ver su personal</button>' + (sup && !e.principal ? '<a class="bt" target="_blank" rel="noopener" href="' +
      _cenWA(sup.cel, 'Hola ' + sup.nombre.split(' ')[0] + ', te escribo de ' + cenEmp('via').corto + ' por lo pendiente de ' + e.corto + ' en ' + d.obra.nombre + '.') + '">Escribirle por WhatsApp</a>' : ''),
    { ancha:false });
  Array.prototype.forEach.call(document.querySelectorAll('#hoja [data-obs]'), function(b){ b.onclick = function(){ cenVerObs(b.getAttribute('data-obs')); }; });
  if($('cen-e-pers')) $('cen-e-pers').onclick = function(){ CEN.filtro.personalEmp = id; cerrarHoja(); navegar('cen-personal'); };
}

/* ══ SUBIÓ A TI ══════════════════════════════════════════════════════ */
function cenVistaSubio(caja){
  var l = cenSubioAMi(), d = CEN.d;
  _cenAcc('');
  var regla = CEN.rol === 'gerente' ? 'Te llega lo que lleva más de un día vencido. Al jefe le llegó primero, al vencer.' : 'Te llega lo que venció sin levantarse. Si pasa un día más, sube al gerente.';
  var h = '<p class="cen-nota">' + esc(regla) + '</p>';
  if(!l.length){ caja.innerHTML = h + '<div class="tarj"><div class="vacio"><b>Nada subió a ti</b>Todo lo vencido se levantó o está en manos del supervisor.</div></div>'; return; }
  h += '<div class="cen-subio-l">';
  l.forEach(function(o){
    var e = cenEmp(o.emp), s = cenEstado(o), sup = CEN_EQUIPO.filter(function(u){ return u.emp === o.emp && u.rango === 'sub'; })[0] || cenUsuario('u-s2');
    var obsr = cenUsuario(o.por);
    h += '<div class="tarj cen-subio-c"><img src="' + cenFoto(o.fa) + '" alt="" loading="lazy"><div class="cen-subio-tx">' +
      '<div class="cen-subio-top">' + cenRiesgoHTML(o.riesgo) + '<span class="pill mal">Venció hace ' + _cenHace(d.ahora - o.vence) + '</span>' +
      (s.nivel === 2 ? '<span class="pill ojo">Subió al gerente</span>' : '<span class="pill ojo">Subió al jefe</span>') + '</div>' +
      '<b class="cen-subio-t">' + esc(o.titulo) + '</b><span class="cen-subio-s">' + esc(e.corto + ' · ' + o.lugar) + '</span>' +
      '<span class="cen-subio-s">La observó ' + esc(obsr ? obsr.nombre : '') + ' · ' + o.id + '</span>' +
      '<div class="cen-subio-bts"><a class="bt sec chico" href="tel:+51' + sup.cel.replace(/\D/g, '') + '">Llamar a ' + esc(sup.nombre.split(' ')[0]) + ' · ' + esc(sup.cel) + '</a>' +
      '<a class="bt sec chico" target="_blank" rel="noopener" href="' + _cenWA(sup.cel, 'Hola ' + sup.nombre.split(' ')[0] + ', la observación ' + o.id + ' (' + o.titulo.toLowerCase() + ', ' + o.lugar + ') venció hace ' + _cenHace(d.ahora - o.vence) + '. ¿La levantamos hoy?') + '">WhatsApp</a>' +
      '<button type="button" class="bt chico" data-obs="' + o.id + '">Ver la observación</button></div></div></div>';
  });
  caja.innerHTML = h + '</div>';
  Array.prototype.forEach.call(caja.querySelectorAll('[data-obs]'), function(b){ b.onclick = function(){ cenVerObs(b.getAttribute('data-obs')); }; });
}

/* ══ LAS OBSERVACIONES ═══════════════════════════════════════════════ */
var CEN_FILTROS = [['todas', 'Todas'], ['abiertas', 'Abiertas'], ['vencidas', 'Vencidas'], ['validar', 'Por validar'], ['cerradas', 'Cerradas']];
function _cenPasaFiltro(o, f){
  var s = cenEstado(o);
  if(f === 'abiertas') return s.est === 'abierta';
  if(f === 'vencidas') return s.vencida;
  if(f === 'validar') return s.est === 'levantada';
  if(f === 'cerradas') return s.est === 'cerrada';
  return true;
}
function cenVistaObs(caja){
  var f = CEN.filtro.obs || 'abiertas', fe = CEN.filtro.obsEmp || '', fr = CEN.filtro.obsRiesgo || '';
  _cenAcc(cenEsPrincipal() ? '<button type="button" class="bt" id="cen-o-nueva">＋ Nueva observación</button>' : '');
  var todas = cenObsVisibles();
  var cuenta = {}; CEN_FILTROS.forEach(function(x){ cuenta[x[0]] = todas.filter(function(o){ return _cenPasaFiltro(o, x[0]); }).length; });
  var h = '<div class="cen-filtros"><div class="cen-chips" role="radiogroup" aria-label="Estado">' + CEN_FILTROS.map(function(x){
      return '<button type="button" role="radio" aria-checked="' + (f === x[0]) + '" class="cen-chip' + (f === x[0] ? ' on' : '') + '" data-f="' + x[0] + '">' + x[1] + ' <b>' + cuenta[x[0]] + '</b></button>'; }).join('') + '</div>';
  if(cenEsPrincipal()) h += '<select id="cen-o-emp" aria-label="Empresa"><option value="">Todas las empresas</option>' + CEN_EMPRESAS.map(function(e){
      return '<option value="' + e.id + '"' + (fe === e.id ? ' selected' : '') + '>' + esc(e.corto) + '</option>'; }).join('') + '</select>';
  h += '<select id="cen-o-ries" aria-label="Riesgo"><option value="">Todo riesgo</option>' + ['alto', 'medio', 'bajo'].map(function(k){
      return '<option value="' + k + '"' + (fr === k ? ' selected' : '') + '>Riesgo ' + CEN_RIESGO[k].t.toLowerCase() + '</option>'; }).join('') + '</select></div>';
  h += '<div class="tarj" id="cen-o-t"></div>';
  caja.innerHTML = h;
  var lista = todas.filter(function(o){ return _cenPasaFiltro(o, f) && (!fe || o.emp === fe) && (!fr || o.riesgo === fr); });
  tabla($('cen-o-t'), [
    { k:'id', t:'N°', v:function(o){ return o.id; }, h:function(o){ return '<span class="mono">' + o.id + '</span>'; } },
    { k:'emp', t:'Empresa', v:function(o){ return cenEmp(o.emp).corto; } },
    { k:'titulo', t:'Observación', v:function(o){ return o.titulo + ' · ' + o.lugar; }, h:function(o){ return '<b class="cen-ot">' + esc(o.titulo) + '</b><small class="cen-ol">' + esc(o.lugar) + '</small>'; } },
    { k:'riesgo', t:'Riesgo', v:function(o){ return CEN_RIESGO[o.riesgo].t; }, h:function(o){ return cenRiesgoHTML(o.riesgo); } },
    { k:'estado', t:'Estado', v:function(o){ var s = cenEstado(o); return s.est + (s.vencida ? ' vencida' : ''); }, h:function(o){ return cenEstadoHTML(o); } },
    { k:'por', t:'Observó', v:function(o){ var u = cenUsuario(o.por); return u ? u.nombre : ''; } },
    { k:'creado', t:'Cuándo', v:function(o){ return new Date(o.creado).toISOString(); }, h:function(o){ return esc(fechaLarga(_cenISO(new Date(o.creado)))) + '<small class="cen-ol">' + esc(hace(new Date(o.creado).toISOString())) + '</small>'; } }
  ], lista, { orden:'creado', asc:false, unidad:'observaciones', archivo:'observaciones-' + _cenSlug(),
    vacio:'Nada con estos filtros', vacioSub:'Cambia el estado, la empresa o el riesgo.', alClic:function(o){ cenVerObs(o.id); } });
  Array.prototype.forEach.call(caja.querySelectorAll('.cen-chip'), function(b){ b.onclick = function(){ CEN.filtro.obs = b.getAttribute('data-f'); cenVistaObs(caja); }; });
  if($('cen-o-emp')) $('cen-o-emp').onchange = function(){ CEN.filtro.obsEmp = this.value; cenVistaObs(caja); };
  $('cen-o-ries').onchange = function(){ CEN.filtro.obsRiesgo = this.value; cenVistaObs(caja); };
  if($('cen-o-nueva')) $('cen-o-nueva').onclick = function(){ cenNuevaObs(); };
}
function cenObsPorId(id){ var l = CEN.d.obs; for(var i = 0; i < l.length; i++) if(l[i].id === id) return l[i]; return null; }
var CEN_QUE = { observa:'Observó', levanta:'Levantó', rechaza:'No lo dio por levantado', valida:'Validó y cerró' };
function cenVerObs(id){
  var o = cenObsPorId(id); if(!o) return;
  var d = CEN.d, s = cenEstado(o), e = cenEmp(o.emp), obsr = cenUsuario(o.por), R = CEN_RIESGO[o.riesgo];
  var sup = CEN_EQUIPO.filter(function(u){ return u.emp === o.emp && u.rango === 'sub'; })[0];
  var ultLev = o.historia.filter(function(x){ return x.que === 'levanta'; }).pop();
  var h = '<div class="cen-ob-top">' + cenRiesgoHTML(o.riesgo) + cenEstadoHTML(o, s) + (s.vencida ? '<span class="pill ojo">Subió ' + (s.nivel === 2 ? 'al gerente' : 'al jefe') + '</span>' : '') + '</div>';
  h += '<div class="cen-fotos"><figure><img src="' + cenFoto(o.fa) + '" alt="La foto de lo observado"><figcaption>Antes · ' + esc(fechaLarga(_cenISO(new Date(o.creado)))) + '</figcaption></figure>' +
    (ultLev ? '<figure><img src="' + cenFoto(o.fd) + '" alt="La foto del levantamiento"><figcaption>Después · ' + esc(fechaLarga(_cenISO(new Date(ultLev.t)))) + '</figcaption></figure>'
            : '<figure class="cen-sinfoto"><span>Todavía sin levantar</span><figcaption>Después</figcaption></figure>') + '</div>';
  h += '<dl class="datos"><dt>Lugar</dt><dd>' + esc(o.lugar) + '</dd><dt>Empresa</dt><dd>' + esc(e.nombre) + '</dd>' +
    '<dt>' + (o.cond ? 'Condición' : 'Acto') + '</dt><dd>' + esc(o.titulo) + '</dd>' +
    '<dt>Plazo</dt><dd>' + R.t + ' · ' + (R.h < 48 ? R.h + ' horas' : (R.h / 24) + ' días') + ' · vence el ' + esc(fechaLarga(_cenISO(new Date(o.vence)))) + ' a las ' + new Date(o.vence).toTimeString().slice(0, 5) + '</dd>' +
    '<dt>La observó</dt><dd>' + esc(obsr ? obsr.nombre + ' · ' + obsr.cargo : '') + '</dd>' +
    (sup ? '<dt>La levanta</dt><dd>' + esc(sup.nombre + ' · ' + sup.cargo + ' de ' + e.corto) + '</dd>' : '') + '</dl>';
  h += '<h3 class="cen-h3">Su historia</h3><ol class="cen-hist">' + o.historia.map(function(x){
      var u = cenUsuario(x.u);
      return '<li class="' + x.que + '"><b>' + CEN_QUE[x.que] + '</b> · ' + esc(u ? u.nombre : '') + '<small>' + esc(fechaLarga(_cenISO(new Date(x.t)))) + ' ' + new Date(x.t).toTimeString().slice(0, 5) +
        (x.nota ? ' · ' + esc(x.nota) : '') + '</small></li>'; }).join('') +
    (s.vencida ? '<li class="sube"><b>Subió ' + (s.nivel === 2 ? 'al jefe y al gerente' : 'al jefe') + '</b><small>Venció el ' + esc(fechaLarga(_cenISO(new Date(o.vence)))) + ' sin levantarse</small></li>' : '') + '</ol>';
  h += '<div id="cen-ob-form"></div>';
  var pie = '', yo = cenYo();
  if(cenEsPrincipal() && s.est === 'levantada') pie = '<button type="button" class="bt mal" id="cen-ob-rech">No está levantada</button><button type="button" class="bt ok" id="cen-ob-val">Validar y cerrar</button>';
  else if(!cenEsPrincipal() && o.emp === cenMiEmp() && s.est === 'abierta') pie = '<button type="button" class="bt" id="cen-ob-lev">Levantar con foto</button>';
  else if(cenEsPrincipal() && s.est === 'abierta' && sup) pie = '<a class="bt sec" href="tel:+51' + sup.cel.replace(/\D/g, '') + '">Llamar a ' + esc(sup.nombre.split(' ')[0]) + '</a>' +
    '<a class="bt sec" target="_blank" rel="noopener" href="' + _cenWA(sup.cel, 'Hola ' + sup.nombre.split(' ')[0] + ', la observación ' + o.id + ' (' + o.titulo.toLowerCase() + ', ' + o.lugar + ') ' + (s.vencida ? 'ya venció' : 'vence pronto') + '. ¿Me confirmas cuándo la levantas?') + '">WhatsApp</a>';
  abrirHoja(o.id + ' · ' + o.titulo, e.corto + ' · ' + o.lugar, h, pie, { id:o.id });
  if($('cen-ob-val')) $('cen-ob-val').onclick = function(){
    o.historia.push({ t:Date.now(), u:yo.id, que:'valida', nota:'' }); o.extra = true; _cenEstGuardar(); _cenRepintar(); cerrarHoja(); toast(o.id + ' validada y cerrada.');
  };
  if($('cen-ob-rech')) $('cen-ob-rech').onclick = function(){
    preguntar('No está levantada', 'Dile a ' + (sup ? sup.nombre.split(' ')[0] : 'la subcontrata') + ' qué falta. Vuelve a su lista con el mismo plazo.',
      { etiqueta:'Qué falta', placeholder:'Ej.: falta el rodapié en el tramo del eje C.', minimo:8, corto:'Escribe qué falta (al menos unas palabras).' }, { si:'Devolver', mal:true })
    .then(function(v){ if(!v) return; o.historia.push({ t:Date.now(), u:yo.id, que:'rechaza', nota:v }); o.extra = true; _cenEstGuardar(); _cenRepintar(); cerrarHoja(); toast(o.id + ' devuelta a ' + e.corto + '.'); });
  };
  if($('cen-ob-lev')) $('cen-ob-lev').onclick = function(){ cenFormLevantar(o); };
}
/* la subcontrata levanta: la foto del después y qué se hizo */
function cenFormLevantar(o){
  var tipo = CEN_TIPOS.filter(function(t){ return t.k === o.tipo; })[0], caja = $('cen-ob-form'); if(!caja) return;
  caja.innerHTML = '<div class="cen-lev"><h3 class="cen-h3">Levantar</h3>' +
    '<div class="cen-lev-foto"><img src="' + cenFoto(o.fd) + '" alt="La foto del después"><span>La foto del después<small>En la obra de ejemplo va esta; en la app se toma con la cámara.</small></span></div>' +
    '<div class="campo"><label for="cen-lev-nota">Qué se hizo</label><textarea id="cen-lev-nota" maxlength="300">' + esc(tipo ? tipo.sol : '') + '</textarea></div></div>';
  var pie = $('hoja-pie'); if(pie) pie.innerHTML = '<button type="button" class="bt" id="cen-lev-ok">Enviar el levantamiento</button>';
  try{ caja.scrollIntoView({ block:'start', behavior:'smooth' }); }catch(e){}
  $('cen-lev-ok').onclick = function(){
    var nota = String($('cen-lev-nota').value || '').trim() || (tipo ? tipo.sol : '');
    o.historia.push({ t:Date.now(), u:cenYo().id, que:'levanta', nota:nota }); o.extra = true; _cenEstGuardar(); _cenRepintar(); cerrarHoja();
    toast('Levantada. Le llega a ' + (cenUsuario(o.por) || {}).nombre + ' para que la valide.');
  };
}
/* una observación nueva (en la obra de ejemplo, con las fotos de ejemplo) */
function cenNuevaObs(){
  var yo = cenYo();
  var h = '<div class="campo"><label for="cen-n-emp">Empresa</label><select id="cen-n-emp">' + CEN_EMPRESAS.map(function(e){
      return '<option value="' + e.id + '"' + (e.id === 'rimac' ? ' selected' : '') + '>' + esc(e.nombre) + '</option>'; }).join('') + '</select></div>' +
    '<div class="campo"><label for="cen-n-tipo">Qué viste</label><select id="cen-n-tipo">' + CEN_TIPOS.map(function(t){
      return '<option value="' + t.k + '">' + esc(t.t) + '</option>'; }).join('') + '</select></div>' +
    '<div class="campo"><label for="cen-n-lugar">Dónde</label><input id="cen-n-lugar" list="cen-n-lugares" maxlength="80" value="Torre de estacionamientos · piso 5">' +
    '<datalist id="cen-n-lugares">' + CEN_LUGARES.map(function(l){ return '<option value="' + esc(l) + '">'; }).join('') + '</datalist></div>' +
    '<div class="campo"><label>Riesgo y plazo</label><div class="cen-ries-ops" role="radiogroup">' + ['alto', 'medio', 'bajo'].map(function(k){ var R = CEN_RIESGO[k];
      return '<label class="cen-ries-op ' + k + '"><input type="radio" name="cen-n-r" value="' + k + '"' + (k === 'alto' ? ' checked' : '') + '><b>' + R.t + '</b><small>' + (R.h < 48 ? R.h + ' horas' : (R.h / 24) + ' días') + '</small></label>'; }).join('') + '</div></div>' +
    '<div class="cen-lev-foto"><img id="cen-n-foto" src="' + cenFoto('baranda-antes') + '" alt="La foto"><span>La foto<small>En la obra de ejemplo va esta; en la app se toma con la cámara y sube aunque no haya señal.</small></span></div>' +
    '<p class="cen-nota">Le llega al supervisor de la empresa en la app y por WhatsApp. Si vence sin levantarse, sube sola al jefe y, un día después, al gerente.</p>';
  abrirHoja('Nueva observación', 'La registra ' + yo.nombre + ' · ' + yo.cargo, h, '<button type="button" class="bt sec" id="cen-n-no">Cancelar</button><button type="button" class="bt" id="cen-n-ok">Guardar la observación</button>');
  var pinta = function(){ var t = CEN_TIPOS.filter(function(x){ return x.k === $('cen-n-tipo').value; })[0]; if(!t) return;
    $('cen-n-foto').src = cenFoto(t.fa);
    Array.prototype.forEach.call(document.querySelectorAll('input[name="cen-n-r"]'), function(r){ r.checked = (r.value === t.riesgo); }); };
  $('cen-n-tipo').onchange = pinta; pinta();
  $('cen-n-no').onclick = cerrarHoja;
  $('cen-n-ok').onclick = function(){
    var t = CEN_TIPOS.filter(function(x){ return x.k === $('cen-n-tipo').value; })[0], r = (document.querySelector('input[name="cen-n-r"]:checked') || {}).value || t.riesgo;
    var ahora = Date.now(), R = CEN_RIESGO[r], n = CEN.d.obs.filter(function(x){ return x.nueva; }).length;
    var o = { id:'OB-' + (1301 + n), tipo:t.k, titulo:t.t, riesgo:r, cond:t.cond, emp:$('cen-n-emp').value, lugar:String($('cen-n-lugar').value || '').trim() || 'Obra',
              creado:ahora, vence:ahora + R.h * 3600000, por:yo.id, fa:t.fa, fd:t.fd, nueva:true, base:0,
              historia:[{ t:ahora, u:yo.id, que:'observa', nota:'Riesgo ' + R.t.toLowerCase() + ': plazo de ' + (R.h < 48 ? R.h + ' horas' : (R.h / 24) + ' días') + '.' }] };
    CEN.d.obs.unshift(o); CEN.d.ahora = ahora; _cenEstGuardar(); cerrarHoja();
    var sup = CEN_EQUIPO.filter(function(u){ return u.emp === o.emp && u.rango === 'sub'; })[0];
    toast(o.id + ' guardada. Le llega a ' + (sup ? sup.nombre.split(' ')[0] + ' (' + cenEmp(o.emp).corto + ')' : cenEmp(o.emp).corto) + '.');
    CEN.filtro.obs = 'abiertas'; if(VISTA.actual === 'cen-obs') _cenRepintar(); else navegar('cen-obs');
  };
}
function _cenRepintar(){ CEN.d.ahora = Date.now(); var v = VISTA.actual; if(v) navegar(v, true); pintarRail(); }

/* ══ EL SUPERVISOR: SUS PENDIENTES ═══════════════════════════════════ */
function cenVistaPend(caja){
  var yo = cenYo(), d = CEN.d;
  _cenAcc('<button type="button" class="bt" id="cen-p-nueva">＋ Nueva observación</button>');
  var validar = d.obs.filter(function(o){ return o.por === yo.id && cenEstado(o).est === 'levantada'; });
  var mias = d.obs.filter(function(o){ var s = cenEstado(o); return o.por === yo.id && s.est === 'abierta'; }).sort(function(a, b){ return a.vence - b.vence; });
  var li = function(o){ return '<li><button type="button" class="cen-li" data-obs="' + o.id + '">' + cenRiesgoHTML(o.riesgo) + '<span><b>' + esc(o.titulo) + '</b><small>' +
      esc(cenEmp(o.emp).corto + ' · ' + o.lugar) + '</small></span>' + cenEstadoHTML(o) + '</button></li>'; };
  var h = '<div class="rej cen-cifras cen-3">' + cifra('Por validar', String(validar.length), 'las levantaron y esperan tu visto', validar.length ? 'ojo' : 'ok') +
    cifra('Tuyas abiertas', String(mias.length), mias.filter(function(o){ return cenEstado(o).vencida; }).length + ' vencidas', '') +
    cifra('Tu zona', yo.zona || 'Toda la obra', 'tus recorridos', 'cen-txt') + '</div>';
  h += '<div class="cen-dos"><div class="tarj"><div class="tarj-cab"><div><h2>Levantadas: te toca validar</h2><p class="sub">Mira la foto del después; si no está, la devuelves con lo que falta</p></div></div><div class="tarj-cuerpo">' +
    (validar.length ? '<ul class="cen-lista">' + validar.map(li).join('') + '</ul>' : '<p class="cen-nada">Nada por validar.</p>') + '</div></div>' +
    '<div class="tarj"><div class="tarj-cab"><div><h2>Las tuyas, abiertas</h2><p class="sub">Primero lo que vence antes</p></div></div><div class="tarj-cuerpo">' +
    (mias.length ? '<ul class="cen-lista">' + mias.slice(0, 12).map(li).join('') + '</ul>' : '<p class="cen-nada">Nada abierto.</p>') + '</div></div></div>';
  caja.innerHTML = h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-obs]'), function(b){ b.onclick = function(){ cenVerObs(b.getAttribute('data-obs')); }; });
  $('cen-p-nueva').onclick = function(){ cenNuevaObs(); };
}

/* ══ LA SUBCONTRATA: POR LEVANTAR Y SU EMPRESA ═══════════════════════ */
function cenVistaLevantar(caja){
  var e = cenMiEmp(), d = CEN.d;
  _cenAcc('');
  var mias = d.obs.filter(function(o){ return o.emp === e; });
  var ab = mias.filter(function(o){ return cenEstado(o).est === 'abierta'; }).sort(function(a, b){ return a.vence - b.vence; });
  var lev = mias.filter(function(o){ return cenEstado(o).est === 'levantada'; });
  var li = function(o){ return '<li><button type="button" class="cen-li" data-obs="' + o.id + '">' + cenRiesgoHTML(o.riesgo) + '<span><b>' + esc(o.titulo) + '</b><small>' +
      esc(o.lugar + ' · ' + o.id) + '</small></span>' + cenEstadoHTML(o) + '</button></li>'; };
  var h = '<div class="aviso">Te las observa <b>' + esc(cenEmp('via').nombre) + '</b>, la principal. Levántalas con la foto del después antes de que venzan: si vencen, le suben a su jefe y luego a su gerente.</div>';
  h += '<div class="cen-dos"><div class="tarj"><div class="tarj-cab"><div><h2>Por levantar (' + ab.length + ')</h2><p class="sub">Primero lo que vence antes</p></div></div><div class="tarj-cuerpo">' +
    (ab.length ? '<ul class="cen-lista">' + ab.map(li).join('') + '</ul>' : '<p class="cen-nada">Nada por levantar.</p>') + '</div></div>' +
    '<div class="tarj"><div class="tarj-cab"><div><h2>Levantadas, esperando su visto (' + lev.length + ')</h2><p class="sub">Las valida el supervisor que las observó</p></div></div><div class="tarj-cuerpo">' +
    (lev.length ? '<ul class="cen-lista">' + lev.map(li).join('') + '</ul>' : '<p class="cen-nada">Ninguna.</p>') + '</div></div></div>';
  caja.innerHTML = h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-obs]'), function(b){ b.onclick = function(){ cenVerObs(b.getAttribute('data-obs')); }; });
}
function cenVistaMiEmp(caja){
  var e = cenEmp(cenMiEmp()), x = cenIndicadores(e.id);
  _cenAcc('');
  caja.innerHTML = '<div class="rej cen-cifras">' + cifra('Gente hoy', _cenN(x.gente), '', '') +
    cifra('Capacitación al día', _cenPct(x.cap), (x.gente - x.alDia) + ' con algo pendiente', x.cap < 0.85 ? 'ojo' : 'ok') +
    cifra('ATS de hoy', x.atsOk + ' de ' + x.atsFr, x.atsOk < x.atsFr ? 'falta en ' + (x.atsFr - x.atsOk) + ' frente' : 'todos tus frentes', x.atsOk < x.atsFr ? 'ojo' : 'ok') +
    cifra('Abiertas', String(x.abiertas), x.vencidas ? x.vencidas + ' vencidas' : 'ninguna vencida', x.vencidas ? 'mal' : '') +
    cifra('Levantadas a tiempo', _cenPct(x.aTiempo), 'últimos 30 días', '') + '</div>' +
    '<div class="tarj"><div class="tarj-cuerpo cen-priv"><b>Lo que ve la principal de tu empresa</b><p>Esto mismo: tu gente, tu capacitación, tus ATS, tu EPP y las observaciones de esta obra. ' +
    'Nada de tus otras obras. Ninguna otra subcontrata ve lo tuyo. Los reportes de tu gente los resuelves tú: a la principal le sube solo lo de riesgo alto que no se levanta a tiempo, ' +
    'el peligro inminente —al instante— y lo que es de otra empresa.</p></div></div>';
}

/* ══ LAS SUBCONTRATAS Y LA INVITACIÓN ════════════════════════════════ */
function cenVistaEmpresas(caja){
  var d = CEN.d;
  _cenAcc('<button type="button" class="bt" id="cen-e-inv">＋ Invitar a una subcontrata</button>');
  var h = '<div class="cen-empresas">';
  CEN_EMPRESAS.forEach(function(e){
    var x = cenIndicadores(e.id), sup = CEN_EQUIPO.filter(function(u){ return u.emp === e.id && (u.rango === 'sub' || (e.principal && u.rango === 'jefe')); })[0];
    h += '<button type="button" class="tarj cen-emp" data-emp="' + e.id + '"><span class="cen-emp-cab"><b>' + esc(e.nombre) + '</b>' +
      (e.principal ? '<span class="pill azul">Principal</span>' : '<span class="pill ok">Activa · gratis</span>') + '</span>' +
      '<small>RUC ' + esc(e.ruc) + ' · ' + esc(e.rubro) + '</small>' +
      '<span class="cen-emp-cif"><span><b>' + _cenN(x.gente) + '</b> personas</span><span><b>' + _cenPct(x.cap) + '</b> capacitación</span><span><b>' + x.abiertas + '</b> abiertas</span></span>' +
      (sup ? '<span class="cen-emp-sup">' + (e.principal ? 'Jefe SSOMA' : 'Su supervisor') + ': <b>' + esc(sup.nombre) + '</b> · ' + esc(sup.cel) + '</span>' : '') + '</button>';
  });
  d.invitadas.forEach(function(e){
    h += '<div class="tarj cen-emp cen-emp-inv"><span class="cen-emp-cab"><b>' + esc(e.nombre) + '</b><span class="pill ojo">Invitación enviada</span></span>' +
      '<small>RUC ' + esc(e.ruc) + ' · ' + esc(e.rubro || '') + '</small>' +
      '<span class="cen-emp-sup">Se la mandaste a <b>' + esc(e.sup) + '</b> · ' + esc(e.cel) + ' · ' + esc(hace(new Date(e.t).toISOString())) + '</span>' +
      '<span class="cen-emp-sup">Cuando acepte, entra con su gente y aparece en el tablero.</span></div>';
  });
  h += '</div><p class="cen-nota">Cada subcontrata lleva su empresa en la app como siempre —ATS, charlas, capacitación, EPP— y entra gratis. ' +
    'La principal ve lo que registra en esta obra; nada de sus otras obras. Una subcontrata nunca ve a otra.</p>';
  caja.innerHTML = h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-emp]'), function(b){ b.onclick = function(){ cenVerEmpresa(b.getAttribute('data-emp')); }; });
  $('cen-e-inv').onclick = cenInvitar;
}
function _cenRucOk(r){ return /^(10|15|16|17|20)\d{9}$/.test(r); }
function cenInvitar(){
  var h = '<p class="cen-nota">Escribes su RUC y a su supervisor le llega un enlace por WhatsApp. Acepta con un toque y entra gratis, con su gente.</p>' +
    '<div class="campo"><label for="cen-i-ruc">RUC de la subcontrata</label><input id="cen-i-ruc" inputmode="numeric" maxlength="11" placeholder="11 dígitos" value="' + CEN_INVITABLE.ruc + '"></div>' +
    '<div class="msg" id="cen-i-razon"></div>' +
    '<div class="campo"><label for="cen-i-sup">Su supervisor SSOMA</label><input id="cen-i-sup" maxlength="80" value="Lucía Rivas Paredes"></div>' +
    '<div class="campo"><label for="cen-i-cel">Su WhatsApp</label><input id="cen-i-cel" inputmode="tel" maxlength="15" value="965 330 118"></div>' +
    '<h3 class="cen-h3">Así le llega</h3><div class="cen-wa" id="cen-i-msg"></div>';
  abrirHoja('Invitar a una subcontrata', CEN.d.obra.nombre, h,
    '<button type="button" class="bt sec" id="cen-i-no">Cancelar</button><button type="button" class="bt" id="cen-i-ok">Mandar la invitación</button>');
  var razon = '';
  var pinta = function(){
    var ruc = String($('cen-i-ruc').value || '').replace(/\D/g, ''), m = $('cen-i-razon');
    razon = '';
    if(ruc.length === 11 && _cenRucOk(ruc)){
      if(ruc === CEN_INVITABLE.ruc) razon = CEN_INVITABLE.nombre;
      else { var ya = CEN_EMPRESAS.filter(function(e){ return e.ruc === ruc; })[0]; if(ya){ m.className = 'msg mal'; m.textContent = ya.nombre + ' ya está en la obra.'; razon = ''; } else razon = 'Empresa con RUC ' + ruc; }
      if(razon){ m.className = 'msg ok'; m.textContent = '✓ ' + razon + (ruc === CEN_INVITABLE.ruc ? ' · ' + CEN_INVITABLE.rubro : ''); }
    } else { m.className = 'msg gris'; m.textContent = ruc.length ? 'El RUC tiene 11 dígitos.' : ''; }
    var sup = String($('cen-i-sup').value || '').trim().split(' ')[0] || 'hola';
    $('cen-i-msg').innerHTML = '<p>Hola ' + esc(sup) + ', soy ' + esc(cenYo().nombre.split(' ')[0]) + ', ' + esc(cenYo().cargo) + ' de <b>' + esc(cenEmp('via').corto) + '</b>. ' +
      'Te invito a registrar a ' + esc(razon || 'tu empresa') + ' en <b>' + esc(CEN.d.obra.nombre) + '</b> con OBRASST. Entras gratis, con tu gente: ATS, charlas, capacitación y EPP en la app, y aquí ves lo que te observamos.</p>' +
      '<p class="cen-wa-link">descarganomaspe.github.io/sst-capacita/?unirse=' + (razon ? 'AH7Q-K2M9' : '····-····') + '</p>' +
      '<p class="cen-wa-nota">El enlace es solo para esa empresa y vence en 7 días.</p>';
  };
  ['cen-i-ruc', 'cen-i-sup', 'cen-i-cel'].forEach(function(id){ $(id).oninput = pinta; }); pinta();
  $('cen-i-no').onclick = cerrarHoja;
  $('cen-i-ok').onclick = function(){
    var ruc = String($('cen-i-ruc').value || '').replace(/\D/g, '');
    if(!razon){ $('cen-i-razon').className = 'msg mal'; $('cen-i-razon').textContent = 'Revisa el RUC: tiene 11 dígitos y empieza con 10, 15, 16, 17 o 20.'; return; }
    if(CEN.d.invitadas.some(function(e){ return e.ruc === ruc; })){ $('cen-i-razon').className = 'msg mal'; $('cen-i-razon').textContent = 'Ya le mandaste la invitación.'; return; }
    CEN.d.invitadas.push({ id:'inv-' + ruc, ruc:ruc, nombre:razon, rubro:ruc === CEN_INVITABLE.ruc ? CEN_INVITABLE.rubro : '', sup:String($('cen-i-sup').value || '').trim(),
      cel:String($('cen-i-cel').value || '').trim(), t:Date.now() });
    _cenEstGuardar(); cerrarHoja(); toast('Invitación lista. En la obra real se abre WhatsApp con el mensaje.'); _cenRepintar();
  };
}

/* ══ EL PERSONAL DE TODAS LAS EMPRESAS ═══════════════════════════════ */
function cenVistaPersonal(caja){
  var fe = CEN.filtro.personalEmp || '', solo = !!CEN.filtro.personalPend;
  _cenAcc('');
  var gente = cenPersonalVisible(), emps = cenEmpresasVisibles();
  var h = '<div class="cen-filtros">' + (emps.length > 1 ? '<select id="cen-p-emp" aria-label="Empresa"><option value="">Todas las empresas</option>' + emps.map(function(e){
      return '<option value="' + e.id + '"' + (fe === e.id ? ' selected' : '') + '>' + esc(e.corto) + '</option>'; }).join('') + '</select>' : '') +
    '<label class="cen-check"><input type="checkbox" id="cen-p-pend"' + (solo ? ' checked' : '') + '> Solo los que tienen algo pendiente</label></div><div class="tarj" id="cen-p-t"></div>';
  caja.innerHTML = h;
  var lista = gente.filter(function(p){ return (!fe || p.emp === fe) && (!solo || !p.alDia); });
  var nomCurso = function(k){ var c = CEN_CURSOS.filter(function(z){ return z.k === k; })[0]; return c ? c.t : k; };
  tabla($('cen-p-t'), [
    { k:'nombre', t:'Trabajador' },
    { k:'dni', t:'DNI' },
    { k:'emp', t:'Empresa', v:function(p){ return cenEmp(p.emp).corto; } },
    { k:'puesto', t:'Puesto' },
    { k:'frente', t:'Frente' },
    { k:'cap', t:'Capacitación', v:function(p){ return p.alDia ? (p.porVencer.length ? 'Al día · vence pronto' : 'Al día') : 'Le falta: ' + p.falta.map(nomCurso).join(', '); },
      h:function(p){ return p.alDia ? (p.porVencer.length ? '<span class="pill ojo">Al día · vence pronto</span>' : '<span class="pill ok">Al día</span>') :
        '<span class="pill mal">Le falta</span><small class="cen-ol">' + esc(p.falta.map(nomCurso).join(' · ')) + '</small>'; } },
    { k:'ingreso', t:'Ingresó', v:function(p){ return p.ingreso; }, h:function(p){ return esc(fechaLarga(p.ingreso)); } }
  ], lista, { orden:'nombre', unidad:'personas', archivo:'personal-' + _cenSlug(), max:600,
    vacio:'Nadie con estos filtros', vacioSub:'Cambia la empresa o quita «Solo los que tienen algo pendiente».' });
  if($('cen-p-emp')) $('cen-p-emp').onchange = function(){ CEN.filtro.personalEmp = this.value; cenVistaPersonal(caja); };
  $('cen-p-pend').onchange = function(){ CEN.filtro.personalPend = this.checked; cenVistaPersonal(caja); };
}

/* ══ LA MATRIZ: EL ESTÁNDAR CONTRA CADA EMPRESA ══════════════════════ */
function cenMatriz(empIds){
  var d = CEN.d;
  return empIds.map(function(id){
    var gente = d.personal.filter(function(p){ return p.emp === id; }), fila = { emp:id, c:{} };
    CEN_CURSOS.forEach(function(c){
      var exig = gente.filter(function(p){ return p.req.indexOf(c.k) > -1; });
      var ok = exig.filter(function(p){ return p.caps[c.k] && p.caps[c.k].ok; }).length;
      fila.c[c.k] = exig.length ? { n:exig.length, ok:ok, pct:ok / exig.length } : null;
    });
    return fila;
  });
}
function cenVistaMatriz(caja){
  _cenAcc('');
  var M = cenMatriz(cenEmpresasVisibles().map(function(e){ return e.id; }));
  var h = '<div class="tarj"><div class="tarj-cab"><div><h2>Cuánto cumple cada empresa lo que exige la obra</h2><p class="sub">De la gente a la que se le exige cada curso, cuántos lo tienen vigente (12 meses). «—»: nadie de esa empresa lo necesita</p></div></div>' +
    '<div class="tabla-caja"><table class="cen-matriz"><thead><tr><th>Empresa</th>' + CEN_CURSOS.map(function(c){ return '<th>' + esc(c.t) + '</th>'; }).join('') + '</tr></thead><tbody>';
  M.forEach(function(f){
    h += '<tr><td><b>' + esc(cenEmp(f.emp).corto) + '</b></td>' + CEN_CURSOS.map(function(c){
      var x = f.c[c.k]; if(!x) return '<td class="cen-mz-no">—</td>';
      var cl = x.pct >= 0.95 ? 'ok' : (x.pct >= 0.85 ? 'ojo' : 'mal');
      return '<td class="cen-mz ' + cl + '" title="' + x.ok + ' de ' + x.n + '"><b>' + _cenPct(x.pct) + '</b><small>' + x.ok + ' de ' + x.n + '</small></td>'; }).join('') + '</tr>';
  });
  h += '</tbody></table></div></div><p class="cen-nota">El estándar lo fija el jefe SSOMA de la principal: qué curso exige cada puesto y cada cuánto se renueva. ' +
    'Cada subcontrata capacita a su gente en la app, y aquí se ve al instante.</p>';
  caja.innerHTML = h;
}

/* ══ EL USO DEL MES: SE COBRA EL DÍA DE MÁS GENTE ═════════════════════ */
function cenVistaUso(caja){
  var d = CEN.d, M = cenMeses(), m = _cenMesElegido('uso'), cerrado = m.cerrado;
  var dias = d.dias.filter(function(x){ return x.dia >= m.ini && x.dia <= m.fin; });
  var pico = dias.reduce(function(a, b){ return b.total > a.total ? b : a; }, dias[0]);
  var lab = dias.filter(function(x){ return new Date(x.dia + 'T12:00:00').getDay() !== 0; });
  var prom = Math.round(lab.reduce(function(a, x){ return a + x.total; }, 0) / Math.max(1, lab.length));
  var monto = Math.max(2400, pico.total * 3.9);
  _cenAcc('');
  var h = '<div class="cen-filtros"><div class="cen-chips" role="radiogroup" aria-label="Mes">' + M.map(function(x){
      return '<button type="button" role="radio" aria-checked="' + (x.k === m.k) + '" class="cen-chip' + (x.k === m.k ? ' on' : '') + '" data-m="' + x.k + '">' +
        esc(_cenMay(_cenMesNom(x.k))) + ' <small>' + (x.cerrado ? 'cerrado' : 'hasta hoy') + '</small></button>'; }).join('') + '</div></div>';
  h += '<div class="rej cen-cifras cen-4">' + cifra('El día de más gente', _cenN(pico.total), 'el ' + fechaLarga(pico.dia) + ' · es lo que se cobra', '') +
    cifra('Promedio', _cenN(prom), 'de lunes a sábado' + (cerrado ? '' : ', hasta hoy'), '') +
    cifra('Días con gente', String(lab.length), cerrado ? 'en el mes' : 'en lo que va del mes', '') +
    cifra(cerrado ? 'Central, ese mes' : 'Central, hasta hoy', 'S/ ' + _cenN(Math.round(monto)),
      (monto === 2400 ? 'el piso del plan · ' + _cenN(pico.total) + ' × S/ 3.90 no llega' : _cenN(pico.total) + ' × S/ 3.90') + ' · más IGV' + (cerrado ? '' : ' · puede subir'), '') + '</div>';
  var max = Math.max.apply(null, dias.map(function(x){ return x.total; }).concat([1]));
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>La gente de cada día</h2><p class="sub">Todas las empresas juntas · en amarillo, el día de más gente</p></div></div><div class="tarj-cuerpo"><div class="cen-uso">';
  dias.forEach(function(x){
    h += '<span class="cen-uso-d este' + (x.dia === pico.dia ? ' pico' : '') + '" title="' + esc(fechaLarga(x.dia)) + ': ' + x.total + ' personas"><i style="height:' + Math.max(2, Math.round(x.total / max * 100)) + '%"></i></span>';
  });
  if(!cerrado){ var largoMes = new Date(+m.k.slice(0, 4), +m.k.slice(5, 7), 0).getDate(); for(var k = dias.length; k < largoMes; k++) h += '<span class="cen-uso-d falta"><i></i></span>'; }
  h += '</div><div class="cen-uso-eje"><span>1 de ' + esc(CEN_MESES_N[+m.k.slice(5, 7) - 1]) + '</span><span>' + (cerrado ? esc(+m.fin.slice(8, 10) + ' de ' + CEN_MESES_N[+m.k.slice(5, 7) - 1]) : 'Fin de mes') + '</span></div></div></div>';
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>Ese día, por empresa</h2><p class="sub">' + esc(fechaLarga(pico.dia)) + ' · los habilitados de cada empresa</p></div></div>' +
    '<div class="tabla-caja"><table><thead><tr><th>Empresa</th><th class="num">Personas</th><th class="num">Parte</th></tr></thead><tbody>' +
    CEN_EMPRESAS.map(function(e){ return '<tr><td>' + esc(e.corto) + (e.principal ? ' <span class="pill azul">Principal</span>' : '') + '</td><td class="num">' + _cenN(pico.por[e.id]) +
      '</td><td class="num">' + _cenPct(pico.por[e.id] / pico.total) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
    '<p class="cen-nota">Se cobra por el día de más gente del mes —los habilitados ese día—, no por todos los que pasaron por la obra, y nunca menos que el piso del plan. ' +
    'Las subcontratas no pagan: la factura es una sola, a la principal.</p>';
  caja.innerHTML = h;
  Array.prototype.forEach.call(caja.querySelectorAll('.cen-chip[data-m]'), function(b){ b.onclick = function(){ CEN.filtro.usoMes = b.getAttribute('data-m'); cenVistaUso(caja); }; });
}

/* ══ EL EQUIPO Y SUS RANGOS ══════════════════════════════════════════ */
var CEN_RECIBE = {
  corp:'El consolidado de todas las obras, el comparativo de contratistas y todo accidente, al instante.',
  gerente:'El consolidado, el informe del mes y lo que lleva más de un día vencido.',
  jefe:'Lo que vence sin levantarse, el peligro inminente al instante y el estándar de la obra.',
  supervisor:'Lo que levantan las subcontratas, para validar; lo suyo que vence.',
  sub:'Lo que la principal le observa a su empresa, con su plazo.'
};
var CEN_VE = {
  corp:'Todas las obras de la empresa y el comparativo de contratistas',
  gerente:'Toda la obra: todas las empresas, el informe y el uso del mes',
  jefe:'Toda la obra: todas las empresas, invita y fija el estándar',
  supervisor:'Toda la obra; observa y valida lo que levantan',
  sub:'Solo su empresa en esta obra: lo que le observan y su gente'
};
function cenVistaEquipo(caja){
  _cenAcc('<button type="button" class="bt sec" id="cen-q-inv">＋ Invitar a alguien de tu equipo</button>');
  var rg = { corp:'Corporativo', gerente:'Gerente', jefe:'Jefe', supervisor:'Supervisor', sub:'Subcontrata' };
  var h = '<div class="tarj" id="cen-q-t"></div><div class="tarj"><div class="tarj-cuerpo cen-priv"><b>Cómo sube lo que vence</b><p>Riesgo alto, 24 horas; medio, 72; bajo, 7 días. ' +
    'Si vence sin levantarse, le llega al jefe SSOMA con el teléfono del supervisor de la subcontrata. Si pasa un día más, al gerente. El peligro inminente, al instante.</p></div></div>';
  caja.innerHTML = h;
  tabla($('cen-q-t'), [
    { k:'nombre', t:'Nombre', v:function(u){ return u.nombre + ' · ' + u.cargo; },
      h:function(u){ return '<b class="cen-ot">' + esc(u.nombre) + '</b><small class="cen-ol">' + esc(u.cargo + (u.zona ? ' · ' + u.zona : '')) + '</small>'; } },
    { k:'rango', t:'Rango', v:function(u){ return rg[u.rango]; }, h:function(u){ return '<span class="cen-rango ' + u.rango + '">' + rg[u.rango] + '</span>'; } },
    { k:'emp', t:'Empresa', v:function(u){ return cenEmp(u.emp).corto; } },
    { k:'ve', t:'Ve', v:function(u){ return CEN_VE[u.rango]; } },
    { k:'recibe', t:'Le llega', v:function(u){ return CEN_RECIBE[u.rango]; } },
    { k:'cel', t:'Celular', h:function(u){ return '<span class="mono">' + esc(u.cel) + '</span>'; } }
  ], CEN_EQUIPO, { unidad:'personas', archivo:'equipo-' + _cenSlug() });
  $('cen-q-inv').onclick = cenInvitarEquipo;
}
/* cada uno con su acceso: su correo (o su DNI) y su rango; lo que ve lo pone el rango */
function cenInvitarEquipo(){
  var h = '<p class="cen-nota">Cada persona entra con su propia cuenta —su correo o su DNI y su contraseña— desde la app o desde aquí. Lo que ve lo decide su rango, no una contraseña compartida.</p>' +
    '<div class="campo"><label for="cen-q-nom">Nombre</label><input id="cen-q-nom" maxlength="80" value="Ana Lucía Rivas Paredes"></div>' +
    '<div class="campo"><label for="cen-q-cor">Su correo o su DNI</label><input id="cen-q-cor" maxlength="80" value="ana.rivas@ejemplo.pe"></div>' +
    '<div class="campo"><label for="cen-q-rg">Rango</label><select id="cen-q-rg"><option value="supervisor">Supervisor SSOMA</option><option value="jefe">Jefe SSOMA</option><option value="gerente">Gerente SSOMA</option></select></div>' +
    '<div class="campo"><label for="cen-q-zona">Su zona (opcional)</label><input id="cen-q-zona" maxlength="80" value="Losas del techo y acabados"></div>' +
    '<div class="aviso" id="cen-q-ve"></div>';
  abrirHoja('Invitar a alguien de tu equipo', CEN.d.obra.nombre, h,
    '<button type="button" class="bt sec" id="cen-q-no">Cancelar</button><button type="button" class="bt" id="cen-q-ok">Mandar la invitación</button>');
  var pinta = function(){ var r = $('cen-q-rg').value; $('cen-q-ve').innerHTML = '<b>Verá:</b> ' + esc(CEN_VE[r]) + '.<br><b>Le llegará:</b> ' + esc(CEN_RECIBE[r]); };
  $('cen-q-rg').onchange = pinta; pinta();
  $('cen-q-no').onclick = cerrarHoja;
  $('cen-q-ok').onclick = function(){ cerrarHoja(); toast('En la obra de ejemplo no se invita a nadie. En la tuya, le llega el acceso a su correo y entra con su rango.'); };
}
function cenVistaEstandar(caja){
  _cenAcc('');
  var h = '<div class="cen-dos"><div class="tarj"><div class="tarj-cab"><div><h2>Plazos por riesgo</h2><p class="sub">Lo que tiene cada empresa para levantar una observación</p></div></div><div class="tarj-cuerpo"><ul class="cen-plana">' +
    ['alto', 'medio', 'bajo'].map(function(k){ var R = CEN_RIESGO[k]; return '<li><span>' + cenRiesgoHTML(k) + ' Riesgo ' + R.t.toLowerCase() + '</span><b>' + (R.h < 48 ? R.h + ' horas' : (R.h / 24) + ' días') + '</b></li>'; }).join('') +
    '</ul></div></div><div class="tarj"><div class="tarj-cab"><div><h2>Escalamiento</h2><p class="sub">Si vence sin levantarse, sube solo</p></div></div><div class="tarj-cuerpo"><ol class="cen-escala">' +
    '<li><b>Al vencer</b><span>Al jefe SSOMA de la principal, con el teléfono del supervisor de la subcontrata.</span></li>' +
    '<li><b>Un día después</b><span>Al gerente SSOMA.</span></li><li><b>Peligro inminente</b><span>Al jefe, al instante, aunque no haya vencido.</span></li></ol></div></div></div>';
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>La capacitación que exige la obra</h2><p class="sub">Vigencia de 12 meses · se cumple en la app de cada empresa</p></div></div><div class="tabla-caja"><table><thead><tr><th>Curso</th><th>A quién se le exige</th></tr></thead><tbody>' +
    CEN_CURSOS.map(function(c){ return '<tr><td>' + esc(c.t) + '</td><td>' + (c.todos ? 'A todos' : (c.emp ? 'A todo ' + c.emp.map(function(x){ return cenEmp(x).corto; }).join(', ') :
      { alt:'Encofradores, andamieros, operarios y capataces', ele:'Electricistas', iza:'Riggers y operadores de grúa' }[c.k] || '')) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
    '<p class="cen-nota">En la obra real, el jefe SSOMA lo ajusta aquí y le llega a cada subcontrata. En la obra de ejemplo se mira, no se cambia.</p>';
  caja.innerHTML = h;
}

/* ══ EL INFORME DEL MES ══════════════════════════════════════════════
   El consolidado de todas las empresas, sin pedirle nada a nadie: lo
   arma lo que cada una registró en la app. El mes pasado, cerrado; este,
   hasta hoy. En PDF para el cliente o la gerencia. */
var CEN_MESES_N = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
function _cenMesNom(k){ var p = k.split('-'); return CEN_MESES_N[+p[1] - 1] + ' ' + p[0]; }
function _cenMay(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function cenMeses(){
  var d = CEN.d;
  return [{ k:d.antIni.slice(0, 7), ini:d.antIni, fin:_cenDia(d.mesIni, -1), cerrado:true },
          { k:d.mesIni.slice(0, 7), ini:d.mesIni, fin:d.hoy, cerrado:false }];
}
function _cenMesElegido(cual){
  var M = cenMeses(), k = cual === 'uso' ? CEN.filtro.usoMes : CEN.filtro.infMes;
  if(!k) k = (+CEN.d.hoy.slice(8, 10) <= 10) ? M[0].k : M[1].k;   /* los primeros días, el mes que se cerró */
  return M.filter(function(m){ return m.k === k; })[0] || M[0];
}
/* las cifras de un mes, por empresa y de la obra */
function cenMes(m){
  var d = CEN.d, emps = cenEmpresasVisibles(), dIni = Date.parse(m.ini + 'T00:00:00'), dFin = Date.parse(_cenDia(m.fin, 1) + 'T00:00:00');
  var dias = d.dias.filter(function(x){ return x.dia >= m.ini && x.dia <= m.fin; });
  var largoMes = new Date(+m.k.slice(0, 4), +m.k.slice(5, 7), 0).getDate();
  var parte = m.cerrado ? 1 : Math.min(1, dias.length / largoMes);   /* este mes: lo que va */
  var obsMes = d.obs.filter(function(o){ return o.creado >= dIni && o.creado < dFin && (cenEsPrincipal() || o.emp === cenMiEmp()); });
  var filas = emps.map(function(e){
    var pico = dias.reduce(function(a, x){ return Math.max(a, x.por[e.id] || 0); }, 0);
    var hht = dias.reduce(function(a, x){ return a + (x.por[e.id] || 0) * 8; }, 0);
    var at = (d.ats[e.id] || []).filter(function(x){ return x.dia >= m.ini && x.dia <= m.fin; });
    var fr = at.reduce(function(a, x){ return a + x.fr; }, 0), ok = at.reduce(function(a, x){ return a + x.ok; }, 0);
    var mias = obsMes.filter(function(o){ return o.emp === e.id; });
    var conLev = mias.filter(function(o){ return cenEstado(o).aTiempo !== null; });
    var aT = conLev.filter(function(o){ return cenEstado(o).aTiempo; }).length;
    var ab = mias.filter(function(o){ return cenEstado(o).est !== 'cerrada'; }).length;
    var x = cenIndicadores(e.id);
    return { e:e, pico:pico, hht:hht, ats:fr ? ok / fr : 1, atsN:ok, atsFr:fr, obs:mias.length, aTiempo:conLev.length ? aT / conLev.length : null,
             abiertas:ab, cap:x.cap, capas:Math.round((d.mes.capas[e.id] || 0) * parte), epp:Math.round((d.mes.epp[e.id] || 0) * parte),
             reportes:Math.round((d.mes.reportes[e.id] || 0) * parte), resueltos:d.mes.resueltos[e.id] };
  });
  var T = { pico:dias.reduce(function(a, x){ return Math.max(a, x.total); }, 0), hht:0, obs:obsMes.length, conLev:0, aT:0, gente:0, alDia:0, atsN:0, atsFr:0,
            capas:0, epp:0, accidentes:0, incidentes:Math.round(d.mes.incidentes * parte),
            diasSin:d.mes.diasSin - (m.cerrado ? Math.round((Date.parse(d.hoy) - Date.parse(m.fin)) / 86400000) : 0) };
  filas.forEach(function(f){ T.hht += f.hht; T.atsN += f.atsN; T.atsFr += f.atsFr; T.capas += f.capas; T.epp += f.epp; });
  obsMes.forEach(function(o){ var s = cenEstado(o); if(s.aTiempo !== null){ T.conLev++; if(s.aTiempo) T.aT++; } });
  emps.forEach(function(e){ var x = cenIndicadores(e.id); T.gente += x.gente; T.alDia += x.alDia; });
  /* lo observado, por tipo */
  var porTipo = {};
  obsMes.forEach(function(o){ var t = porTipo[o.tipo] || (porTipo[o.tipo] = { tipo:o.tipo, t:o.titulo, riesgo:o.riesgo, n:0, emp:{} }); t.n++; t.emp[o.emp] = (t.emp[o.emp] || 0) + 1; });
  var tipos = Object.keys(porTipo).map(function(k){ var t = porTipo[k]; t.top = Object.keys(t.emp).sort(function(a, b){ return t.emp[b] - t.emp[a]; })[0]; return t; })
    .sort(function(a, b){ return b.n - a.n; });
  /* lo que sigue abierto (de cualquier mes), lo vencido primero */
  var abiertas = cenObsVisibles().filter(function(o){ return cenEstado(o).est !== 'cerrada'; })
    .sort(function(a, b){ var sa = cenEstado(a), sb = cenEstado(b); return (sb.vencida - sa.vencida) || (a.vence - b.vence); });
  return { m:m, filas:filas, T:T, tipos:tipos, abiertas:abiertas, dias:dias.length, parte:parte };
}
function _cenIF(acc, hht){ return hht ? (acc * 1000000 / hht).toFixed(2) : '0.00'; }
function cenVistaInforme(caja){
  var M = cenMeses(), m = _cenMesElegido(), I = cenMes(m), T = I.T, yo = cenYo();
  _cenAcc('<button type="button" class="bt" id="cen-i-pdf">Descargar el PDF</button>');
  var h = '<div class="cen-filtros"><div class="cen-chips" role="radiogroup" aria-label="Mes">' + M.map(function(x){
      return '<button type="button" role="radio" aria-checked="' + (x.k === m.k) + '" class="cen-chip' + (x.k === m.k ? ' on' : '') + '" data-m="' + x.k + '">' +
        esc(_cenMay(_cenMesNom(x.k))) + ' <small>' + (x.cerrado ? 'cerrado' : 'hasta hoy') + '</small></button>'; }).join('') + '</div>' +
    '<span class="cen-nota-l">' + (m.cerrado ? 'Del 1 al ' + (+m.fin.slice(8, 10)) + ' de ' + esc(_cenMesNom(m.k)) : 'Del 1 de ' + esc(CEN_MESES_N[+m.k.slice(5, 7) - 1]) + ' a hoy · ' + I.dias + (I.dias === 1 ? ' día' : ' días')) + '</span></div>';
  h += '<div class="rej cen-cifras">' +
    cifra('El día de más gente', _cenN(T.pico), 'todas las empresas', '') +
    cifra('Horas hombre', _cenN(T.hht), 'trabajadas en el mes', '') +
    cifra('Accidentes incapacitantes', String(T.accidentes), T.incidentes + (T.incidentes === 1 ? ' incidente' : ' incidentes') + ' · índice de frecuencia ' + _cenIF(T.accidentes, T.hht), T.accidentes ? 'mal' : 'ok') +
    cifra('Observaciones', _cenN(T.obs), T.conLev ? _cenPct(T.aT / T.conLev) + ' levantadas a tiempo' : 'ninguna levantada todavía', '') +
    cifra('ATS', T.atsFr ? _cenPct(T.atsN / T.atsFr) : '—', _cenN(T.atsN) + ' de ' + _cenN(T.atsFr) + ' frentes-día', T.atsFr && T.atsN / T.atsFr < 0.95 ? 'ojo' : '') + '</div>';
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>Cada empresa en el mes</h2><p class="sub">Lo que registró en la app · la capacitación, como está hoy</p></div></div>' +
    '<div class="tabla-caja"><table class="cen-inf"><thead><tr><th>Empresa</th><th class="num" title="El día de más gente del mes">Más gente</th><th class="num">Horas hombre</th><th class="num">ATS</th>' +
    '<th class="num" title="Capacitación al día, hoy">Capacitación</th><th class="num">Observ.</th><th class="num" title="Levantadas a tiempo">A tiempo</th><th class="num">Abiertas</th><th class="num" title="Capacitaciones dadas en el mes">Capacit.</th><th class="num" title="Unidades de EPP entregadas">EPP</th></tr></thead><tbody>' +
    I.filas.map(function(f){
      return '<tr><td><b>' + esc(f.e.corto) + '</b>' + (f.e.principal ? ' <span class="pill azul">Principal</span>' : '') + '</td><td class="num">' + _cenN(f.pico) + '</td><td class="num">' + _cenN(f.hht) +
        '</td><td class="num' + (f.ats < 0.95 ? ' cen-ojo' : '') + '">' + _cenPct(f.ats) + '</td><td class="num' + (f.cap < 0.85 ? ' cen-ojo' : '') + '">' + _cenPct(f.cap) +
        '</td><td class="num">' + f.obs + '</td><td class="num' + (f.aTiempo !== null && f.aTiempo < 0.8 ? ' cen-mal' : '') + '">' + (f.aTiempo === null ? '—' : _cenPct(f.aTiempo)) +
        '</td><td class="num">' + f.abiertas + '</td><td class="num">' + f.capas + '</td><td class="num">' + _cenN(f.epp) + ' u</td></tr>'; }).join('') +
    '</tbody></table></div></div>';
  h += '<div class="cen-dos"><div class="tarj"><div class="tarj-cab"><div><h2>Lo más observado</h2><p class="sub">Y la empresa donde más se repitió</p></div></div><div class="tarj-cuerpo">' +
    (I.tipos.length ? '<ul class="cen-plana">' + I.tipos.slice(0, 7).map(function(t){
      return '<li><span>' + cenRiesgoHTML(t.riesgo) + ' ' + esc(t.t) + '<small>' + esc(cenEmp(t.top).corto) + '</small></span><b>' + t.n + '</b></li>'; }).join('') + '</ul>'
      : '<p class="cen-nada">Nada observado en este mes todavía.</p>') + '</div></div>' +
    '<div class="tarj"><div class="tarj-cab"><div><h2>Lo que sigue abierto</h2><p class="sub">Al día de hoy · lo vencido primero</p></div></div><div class="tarj-cuerpo">' +
    (I.abiertas.length ? '<ul class="cen-lista">' + I.abiertas.slice(0, 6).map(function(o){
      return '<li><button type="button" class="cen-li" data-obs="' + o.id + '">' + cenRiesgoHTML(o.riesgo) + '<span><b>' + esc(o.titulo) + '</b><small>' +
        esc(cenEmp(o.emp).corto + ' · ' + o.lugar) + '</small></span>' + cenEstadoHTML(o) + '</button></li>'; }).join('') + '</ul>' +
      (I.abiertas.length > 6 ? '<p class="cen-mas">y ' + (I.abiertas.length - 6) + ' más en el PDF</p>' : '') : '<p class="cen-nada">Nada abierto.</p>') + '</div></div></div>';
  h += '<p class="cen-nota">Sale de lo que cada empresa registra en la app: asistencia, ATS, capacitaciones, entregas de EPP y observaciones. Nadie lo arma la última noche del mes. ' +
    'El PDF lleva además las firmas de quien lo elabora y quien lo revisa.</p>';
  caja.innerHTML = h;
  Array.prototype.forEach.call(caja.querySelectorAll('.cen-chip[data-m]'), function(b){ b.onclick = function(){ CEN.filtro.infMes = b.getAttribute('data-m'); cenVistaInforme(caja); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-obs]'), function(b){ b.onclick = function(){ cenVerObs(b.getAttribute('data-obs')); }; });
  $('cen-i-pdf').onclick = function(){
    var bt = this; bt.disabled = true; bt.textContent = 'Armando el PDF…';
    cargarEvPDF().then(function(){ cenInformePDF(I, yo); toast('Listo: el informe de ' + _cenMesNom(m.k) + ' en PDF.'); })
      .catch(function(){ toast('No se pudo armar el PDF. Revisa tu conexión y vuelve a intentar.'); })
      .then(function(){ bt.disabled = false; bt.textContent = 'Descargar el PDF'; });
  };
}
/* el PDF: A4, como los demás papeles del portal */
function _cenPdfTx(s){
  return String(s == null ? '' : s).replace(/[‘’]/g, "'").replace(/[“”«»]/g, '"').replace(/＋/g, '+')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF–—…•]/g, '').trim();
}
function cenInformePDF(I, yo){
  var J = window.jspdf && window.jspdf.jsPDF; if(!J) throw new Error('Falta el generador de PDF');
  var d = CEN.d, m = I.m, T = I.T;
  var doc = new J({ unit:'pt', format:'a4' }), W = 595.28, H = 841.89, M = 36, PIE = H - 52;
  var TINTA = [11, 42, 58], ORO = [245, 183, 0], GRIS = [107, 124, 136], TEXTO = [34, 50, 61], RAYA = [218, 225, 230], FONDO = [244, 247, 249],
      BLANCO = [255, 255, 255], SUAVE = [188, 205, 214], OK = [30, 142, 90], OJO = [154, 96, 10], MAL = [198, 50, 58];
  var RC = { alto:MAL, medio:OJO, bajo:GRIS };
  function L(peso, tam, c){ doc.setFont('helvetica', peso || 'normal'); doc.setFontSize(tam); if(c) doc.setTextColor(c[0], c[1], c[2]); }
  function F(c){ doc.setFillColor(c[0], c[1], c[2]); }
  function R(c){ doc.setDrawColor(c[0], c[1], c[2]); }
  function Tx(s){ return _cenPdfTx(s); }
  function cortar(s, w){ s = Tx(s); if(doc.getTextWidth(s) <= w) return s; while(s.length > 1 && doc.getTextWidth(s + '…') > w) s = s.slice(0, -1); return s + '…'; }
  var ahora = new Date(), hora = _cenDos(ahora.getHours()) + ':' + _cenDos(ahora.getMinutes());
  function banda(){
    F(TINTA); doc.rect(0, 0, W, 62, 'F'); F(ORO); doc.rect(0, 62, W, 3, 'F');
    L('bold', 12.5, BLANCO); doc.text(cortar(d.obra.nombre.toUpperCase(), W - 2 * M - 190), M, 28);
    L('normal', 8.5, SUAVE); doc.text(cortar(cenEmp('via').nombre + ' · contratista principal · cliente: ' + d.obra.cliente, W - 2 * M - 190), M, 43);
    L('bold', 8.5, [255, 226, 150]); doc.text(Tx('INFORME SSOMA DEL MES'), W - M, 25, { align:'right' });
    L('bold', 10, BLANCO); doc.text(Tx(_cenMesNom(m.k).toUpperCase() + (m.cerrado ? '' : ' (HASTA HOY)')), W - M, 38, { align:'right' });
    L('normal', 7, SUAVE); doc.text(Tx('Emitido el ' + fechaLarga(d.hoy) + ' a las ' + hora), W - M, 50, { align:'right' });
    return 65;
  }
  function titulo(y, t, sub){
    L('bold', 11, TINTA); doc.text(Tx(t), M, y);
    if(sub){ L('normal', 8, GRIS); doc.text(cortar(sub, W - 2 * M), M, y + 11); }
    return y + (sub ? 21 : 13);
  }
  function hayLugar(y, alto){ if(y + alto > PIE){ doc.addPage(); return 46; } return y; }
  function tablaP(y, cols, filas, op){
    op = op || {};
    var wt = W - 2 * M, hc = 18, hf = op.hf || 16, tot = cols.reduce(function(s, c){ return s + c.w; }, 0);
    cols.forEach(function(c){ c.W = c.w / tot * wt; });
    function cab(){
      F(TINTA); doc.rect(M, y, wt, hc, 'F'); L('bold', 6.8, BLANCO);
      var x = M; cols.forEach(function(c){ var tx = cortar(c.t, c.W - 8); if(c.num) doc.text(tx, x + c.W - 4, y + 11.5, { align:'right' }); else doc.text(tx, x + 4, y + 11.5); x += c.W; });
      y += hc;
    }
    cab();
    filas.forEach(function(f, i){
      if(y + hf > PIE){ doc.addPage(); y = 46; cab(); }
      if(i % 2){ F(FONDO); doc.rect(M, y, wt, hf, 'F'); }
      var x = M;
      cols.forEach(function(c){
        var v = c.v(f), col = (c.color && c.color(f)) || TEXTO;
        L(c.b ? 'bold' : 'normal', 7.6, col);
        var tx = cortar(v, c.W - 8);
        if(c.num) doc.text(tx, x + c.W - 4, y + 10.8, { align:'right' }); else doc.text(tx, x + 4, y + 10.8);
        x += c.W;
      });
      R(RAYA); doc.setLineWidth(0.5); doc.line(M, y + hf, M + wt, y + hf);
      y += hf;
    });
    if(op.total){
      if(y + hf > PIE){ doc.addPage(); y = 46; cab(); }
      F([230, 236, 240]); doc.rect(M, y, wt, hf + 1, 'F');
      var x2 = M; cols.forEach(function(c){ var v = op.total(c); L('bold', 7.6, TINTA); if(v != null){ var tx = cortar(v, c.W - 8);
        if(c.num) doc.text(tx, x2 + c.W - 4, y + 11, { align:'right' }); else doc.text(tx, x2 + 4, y + 11); } x2 += c.W; });
      y += hf + 1;
    }
    return y + 14;
  }
  var y = banda() + 22;
  /* el resumen */
  y = titulo(y, 'Resumen del mes', m.cerrado ? 'Del 1 al ' + (+m.fin.slice(8, 10)) + ' de ' + _cenMesNom(m.k) + ' · todas las empresas de la obra' : 'Del 1 de ' + CEN_MESES_N[+m.k.slice(5, 7) - 1] + ' al ' + fechaLarga(d.hoy) + ' · todas las empresas de la obra');
  var cajas = [
    ['Día de más gente', _cenN(T.pico), 'personas'], ['Horas hombre', _cenN(T.hht), 'trabajadas'],
    ['Accidentes incapacitantes', String(T.accidentes), 'IF ' + _cenIF(T.accidentes, T.hht) + ' · IG 0.00'], ['Incidentes', String(T.incidentes), 'reportados e investigados'],
    ['Días sin accidentes', _cenN(T.diasSin), 'incapacitantes, al cierre'], ['Observaciones', _cenN(T.obs), T.conLev ? _cenPct(T.aT / T.conLev) + ' levantadas a tiempo' : 'sin levantar todavía'],
    ['ATS', T.atsFr ? _cenPct(T.atsN / T.atsFr) : '-', _cenN(T.atsN) + ' de ' + _cenN(T.atsFr) + ' frentes-día'], ['Capacitación al día', _cenPct(T.gente ? T.alDia / T.gente : 1), 'del personal de hoy']
  ];
  var cw = (W - 2 * M - 3 * 8) / 4, ch = 50;
  cajas.forEach(function(c, i){
    var cx = M + (i % 4) * (cw + 8), cy = y + Math.floor(i / 4) * (ch + 8);
    F(FONDO); R(RAYA); doc.setLineWidth(0.6); doc.roundedRect(cx, cy, cw, ch, 4, 4, 'FD');
    L('normal', 7, GRIS); doc.text(cortar(c[0], cw - 14), cx + 8, cy + 13);
    L('bold', 15, TINTA); doc.text(Tx(c[1]), cx + 8, cy + 32);
    L('normal', 6.6, GRIS); doc.text(cortar(c[2], cw - 14), cx + 8, cy + 43);
  });
  y += 2 * (ch + 8) + 16;
  /* cada empresa */
  y = hayLugar(y, 120);
  y = titulo(y, 'Cada empresa en el mes', 'Lo que registró en la app. La capacitación al día, como está al emitir el informe.');
  y = tablaP(y, [
    { t:'Empresa', w:150, b:true, v:function(f){ return f.e.corto + (f.e.principal ? ' (principal)' : ''); } },
    { t:'Más gente', w:52, num:true, v:function(f){ return _cenN(f.pico); } },
    { t:'Horas hombre', w:62, num:true, v:function(f){ return _cenN(f.hht); } },
    { t:'ATS', w:40, num:true, v:function(f){ return _cenPct(f.ats); }, color:function(f){ return f.ats < 0.95 ? OJO : null; } },
    { t:'Capacitación', w:60, num:true, v:function(f){ return _cenPct(f.cap); }, color:function(f){ return f.cap < 0.85 ? OJO : null; } },
    { t:'Observ.', w:44, num:true, v:function(f){ return String(f.obs); } },
    { t:'A tiempo', w:46, num:true, v:function(f){ return f.aTiempo === null ? '-' : _cenPct(f.aTiempo); }, color:function(f){ return f.aTiempo !== null && f.aTiempo < 0.8 ? MAL : null; } },
    { t:'Abiertas', w:44, num:true, v:function(f){ return String(f.abiertas); } },
    { t:'Capacit.', w:44, num:true, v:function(f){ return String(f.capas); } },
    { t:'EPP (u)', w:46, num:true, v:function(f){ return _cenN(f.epp); } }
  ], I.filas, { total:function(c){
    var tt = { 'Empresa':'Toda la obra', 'Más gente':_cenN(T.pico), 'Horas hombre':_cenN(T.hht), 'ATS':T.atsFr ? _cenPct(T.atsN / T.atsFr) : '-',
      'Capacitación':_cenPct(T.gente ? T.alDia / T.gente : 1), 'Observ.':String(T.obs), 'A tiempo':T.conLev ? _cenPct(T.aT / T.conLev) : '-',
      'Abiertas':String(I.filas.reduce(function(a, f){ return a + f.abiertas; }, 0)), 'Capacit.':String(T.capas), 'EPP (u)':_cenN(T.epp) };
    return tt[c.t]; } });
  /* lo más observado */
  if(I.tipos.length){
    y = hayLugar(y, 90);
    y = titulo(y, 'Lo más observado', 'Cuántas veces en el mes y la empresa donde más se repitió');
    y = tablaP(y, [
      { t:'Observación', w:250, v:function(t){ return t.t; } },
      { t:'Riesgo', w:60, v:function(t){ return CEN_RIESGO[t.riesgo].t; }, color:function(t){ return RC[t.riesgo]; }, b:true },
      { t:'Veces', w:50, num:true, v:function(t){ return String(t.n); } },
      { t:'Donde más', w:150, v:function(t){ return cenEmp(t.top).corto; } }
    ], I.tipos.slice(0, 10));
  }
  /* lo abierto */
  y = hayLugar(y, 90);
  y = titulo(y, 'Lo que sigue abierto al emitir el informe', I.abiertas.length ? I.abiertas.length + ' observaciones · lo vencido primero' : 'Nada abierto');
  if(I.abiertas.length) y = tablaP(y, [
    { t:'N°', w:48, v:function(o){ return o.id; } },
    { t:'Empresa', w:96, v:function(o){ return cenEmp(o.emp).corto; } },
    { t:'Observación', w:180, v:function(o){ return o.titulo; } },
    { t:'Lugar', w:120, v:function(o){ return o.lugar; } },
    { t:'Riesgo', w:44, v:function(o){ return CEN_RIESGO[o.riesgo].t; }, color:function(o){ return RC[o.riesgo]; }, b:true },
    { t:'Estado', w:96, v:function(o){ var s = cenEstado(o); return s.est === 'levantada' ? 'Levantada, por validar' : (s.vencida ? 'Vencida hace ' + _cenHace(d.ahora - o.vence) : 'Vence en ' + _cenHace(o.vence - d.ahora)); },
      color:function(o){ var s = cenEstado(o); return s.vencida ? MAL : (s.est === 'levantada' ? [37, 99, 168] : null); } }
  ], I.abiertas.slice(0, 40));
  /* las firmas */
  y = hayLugar(y, 90) + 30;
  var jefe = cenUsuario('u-jef'), ger = cenUsuario('u-ger'), fw = (W - 2 * M - 40) / 2;
  [[jefe, 'Elaboró'], [ger, 'Revisó']].forEach(function(p, i){
    var fx = M + i * (fw + 40);
    R(GRIS); doc.setLineWidth(0.7); doc.line(fx, y, fx + fw, y);
    L('bold', 8.5, TINTA); doc.text(Tx(p[0].nombre), fx, y + 13);
    L('normal', 7.5, GRIS); doc.text(Tx(p[1] + ' · ' + p[0].cargo + ' · ' + cenEmp('via').corto), fx, y + 24);
  });
  /* el pie de cada página */
  var n = doc.getNumberOfPages();
  for(var i = 1; i <= n; i++){
    doc.setPage(i);
    R(RAYA); doc.setLineWidth(0.6); doc.line(M, H - 34, W - M, H - 34);
    L('normal', 6.8, GRIS);
    doc.text(Tx('OBRASST Central · ' + d.obra.nombre + ' · ' + _cenMesNom(m.k) + (CEN.demo ? ' · Obra de ejemplo: empresas, personas y cifras inventadas' : '')), M, H - 22);
    doc.text(Tx('Página ' + i + ' de ' + n), W - M, H - 22, { align:'right' });
  }
  doc.save('informe-ssoma-' + _cenSlug() + '-' + m.k + '.pdf');
}

/* ══ CORPORATIVO: TODAS LAS OBRAS DE LA EMPRESA ══════════════════════
   El plan Corporativo es Central en cada obra y, arriba, la gerencia
   con sus obras lado a lado y el comparativo de contratistas. En la
   obra de ejemplo solo Los Álamos se abre entera: las otras tres son
   su resumen (inventado). */
var CEN_OBRAS = [
  { id:'demo-central', nombre:'Centro Comercial Los Álamos', lugar:'Lima', tipo:'Comercial', viva:true, avance:0.48 },
  { id:'ob-mirador', nombre:'Residencial Mirador del Parque', lugar:'Lima', tipo:'Vivienda multifamiliar', avance:0.62,
    gente:720, emps:5, cap:0.93, atsOk:17, atsFr:18, ab:21, ven:2, aT:0.86, acc:0, inc:1, diasSin:388, obs:96 },
  { id:'ob-lurin', nombre:'Nave Industrial Lurín Sur', lugar:'Lima', tipo:'Industrial', avance:0.41,
    gente:610, emps:4, cap:0.95, atsOk:12, atsFr:12, ab:9, ven:0, aT:0.94, acc:0, inc:0, diasSin:156, obs:58 },
  { id:'ob-cayma', nombre:'Pabellón Universitario Cayma', lugar:'Arequipa', tipo:'Educación', avance:0.78,
    gente:480, emps:4, cap:0.84, atsOk:10, atsFr:11, ab:17, ven:4, aT:0.71, acc:1, inc:2, diasSin:12, obs:73 }
];
/* las subcontratas en las otras obras (la principal, Vía Andina, no entra en el comparativo) */
var CEN_OTRAS_EMP = {
  drywall:   { nombre:'Drywall Costa Verde S.A.C.', corto:'Drywall Costa Verde', rubro:'Tabiquería' },
  ascensor:  { nombre:'Ascensores Andinos S.A.C.', corto:'Ascensores Andinos', rubro:'Ascensores' },
  metal:     { nombre:'Estructuras Metálicas Pachacámac S.A.C.', corto:'Estructuras Pachacámac', rubro:'Estructuras metálicas' },
  misti:     { nombre:'Instalaciones Sanitarias Misti S.A.C.', corto:'Sanitarias Misti', rubro:'Instalaciones sanitarias' },
  chachani:  { nombre:'Concretos Chachani S.A.C.', corto:'Concretos Chachani', rubro:'Concreto premezclado y vaciado' }
};
/* cada subcontrata en cada obra: gente, capacitación, levantadas a tiempo, vencidas hoy y observaciones del último mes */
var CEN_EN_OBRAS = {
  'ob-mirador': { rimac:{ gente:170, cap:0.86, aT:0.79, ven:1, obs:31 }, pacif:{ gente:110, cap:0.97, aT:0.95, ven:0, obs:7 },
                  drywall:{ gente:140, cap:0.95, aT:0.9, ven:0, obs:11 }, ascensor:{ gente:70, cap:0.99, aT:1, ven:0, obs:3 } },
  'ob-lurin':   { sur:{ gente:120, cap:0.94, aT:0.91, ven:0, obs:9 }, metal:{ gente:230, cap:0.96, aT:0.93, ven:0, obs:14 },
                  chavin:{ gente:70, cap:0.83, aT:0.74, ven:0, obs:12 } },
  'ob-cayma':   { chavin:{ gente:60, cap:0.78, aT:0.62, ven:2, obs:15 }, misti:{ gente:95, cap:0.88, aT:0.8, ven:1, obs:10 },
                  chachani:{ gente:115, cap:0.9, aT:0.77, ven:1, obs:13 } }
};
/* Los Álamos, con lo de la demo (lo que se valida o se levanta, se nota) */
function cenObraViva(){
  var d = CEN.d, t = { gente:0, alDia:0, atsOk:0, atsFr:0, ab:0, ven:0, conLev:0, aT:0, obs:0 }, desde = d.ahora - 30 * 86400000;
  CEN_EMPRESAS.forEach(function(e){ var x = cenIndicadores(e.id); t.gente += x.gente; t.alDia += x.alDia; t.atsOk += x.atsOk; t.atsFr += x.atsFr; t.ab += x.abiertas; t.ven += x.vencidas; });
  d.obs.forEach(function(o){ if(o.creado < desde) return; t.obs++; var s = cenEstado(o); if(s.aTiempo !== null){ t.conLev++; if(s.aTiempo) t.aT++; } });
  var o = CEN_OBRAS[0];
  return { id:o.id, nombre:o.nombre, lugar:o.lugar, tipo:o.tipo, viva:true, avance:o.avance, gente:t.gente, emps:CEN_EMPRESAS.length,
           cap:t.gente ? t.alDia / t.gente : 1, atsOk:t.atsOk, atsFr:t.atsFr, ab:t.ab, ven:t.ven, aT:t.conLev ? t.aT / t.conLev : 1,
           acc:d.mes.accidentes, inc:d.mes.incidentes, diasSin:d.mes.diasSin, obs:t.obs };
}
function cenObrasHoy(){ return [cenObraViva()].concat(CEN_OBRAS.slice(1)); }
function _cenEstadoObra(o){
  if(o.acc) return { t:'Accidente este mes', cl:'mal' };
  if(o.ven >= 3) return { t:o.ven + ' vencidas', cl:'mal' };
  if(o.cap < 0.85 || o.aT < 0.75) return { t:'Atención', cl:'ojo' };
  if(o.ven) return { t:o.ven + (o.ven === 1 ? ' vencida' : ' vencidas'), cl:'ojo' };
  return { t:'Bien', cl:'ok' };
}
function _cenBarra(x, malBajo){ return '<span class="cen-nw"><span class="cen-barra"><i style="width:' + Math.round(x * 100) + '%" class="' + (x < malBajo ? 'ojo' : '') + '"></i></span> <span class="cen-pct">' + _cenPct(x) + '</span></span>'; }
function cenVistaObras(caja){
  var obras = cenObrasHoy(), T = { gente:0, ven:0, acc:0, emps:{} };
  obras.forEach(function(o){ T.gente += o.gente; T.ven += o.ven; T.acc += o.acc; });
  CEN_EMPRESAS.forEach(function(e){ T.emps[e.id] = 1; }); Object.keys(CEN_EN_OBRAS).forEach(function(k){ Object.keys(CEN_EN_OBRAS[k]).forEach(function(e){ T.emps[e] = 1; }); });
  _cenAcc('');
  var h = '<div class="rej cen-cifras">' + cifra('Obras', String(obras.length), 'activas este mes', '') +
    cifra('Gente hoy', _cenN(T.gente), 'entre todas tus obras', '') +
    cifra('Empresas', String(Object.keys(T.emps).length), 'contigo y tus subcontratas', '') +
    cifra('Vencidas sin levantar', String(T.ven), 'en todas tus obras', T.ven ? 'mal' : 'ok') +
    cifra('Accidentes incapacitantes', String(T.acc), 'este mes', T.acc ? 'mal' : 'ok') + '</div>';
  h += '<div class="tarj"><div class="tarj-cab"><div><h2>Tus obras, hoy</h2><p class="sub">Toca una obra para ver su resumen · en la obra de ejemplo se abre entera solo Los Álamos</p></div></div>' +
    '<div class="tabla-caja"><table class="cen-emps cen-obras"><thead><tr><th>Obra</th><th class="num">Gente</th><th>Capacitación</th><th class="num">ATS hoy</th>' +
    '<th>A tiempo</th><th class="num">Vencidas</th><th class="num" title="Días sin accidentes incapacitantes">Sin accidentes</th><th>Estado</th></tr></thead><tbody>';
  obras.forEach(function(o){
    var st = _cenEstadoObra(o);
    h += '<tr class="clic" data-obra="' + o.id + '"><td><b class="cen-emp-n">' + esc(o.nombre) + '</b>' + (o.viva ? ' <span class="pill azul">Abierta</span>' : '') +
      '<small class="cen-emp-r">' + esc(o.tipo + ' · ' + o.lugar + ' · avance ' + _cenPct(o.avance)) + '</small></td><td class="num">' + _cenN(o.gente) + '<small class="cen-emp-r">' + o.emps + ' empresas</small></td>' +
      '<td>' + _cenBarra(o.cap, 0.85) + '</td><td class="num' + (o.atsOk < o.atsFr ? ' cen-ojo' : '') + '">' + o.atsOk + '/' + o.atsFr + '</td>' +
      '<td>' + _cenBarra(o.aT, 0.75) + '</td><td class="num' + (o.ven ? ' cen-mal' : '') + '">' + o.ven + '</td><td class="num' + (o.acc ? ' cen-mal' : '') + '">' + _cenN(o.diasSin) + '</td>' +
      '<td><span class="pill ' + st.cl + '">' + esc(st.t) + '</span></td></tr>';
  });
  h += '</tbody></table></div></div>';
  /* comparar: observaciones por cada 100 personas y levantadas a tiempo */
  var maxO = Math.max.apply(null, obras.map(function(o){ return o.obs / Math.max(1, o.gente) * 100; }).concat([1]));
  h += '<div class="cen-dos"><div class="tarj"><div class="tarj-cab"><div><h2>Cuánto se observa</h2><p class="sub">Observaciones del último mes por cada 100 personas · observar mucho no es malo: es mirar</p></div></div><div class="tarj-cuerpo cen-riesgos">' +
    obras.map(function(o){ var v = o.obs / Math.max(1, o.gente) * 100;
      return '<div class="cen-rf"><span class="cen-rf-n">' + esc(o.nombre.replace(/^(Centro Comercial|Residencial|Nave Industrial|Pabellón Universitario) /, '')) + '</span><span class="cen-rf-b"><i class="obs" style="width:' + (v / maxO * 100) + '%"></i></span><b class="cen-rf-v">' + v.toFixed(1) + '</b></div>'; }).join('') +
    '</div></div><div class="tarj"><div class="tarj-cab"><div><h2>Dónde mirar primero</h2><p class="sub">Lo que la gerencia tendría que preguntar esta semana</p></div></div><div class="tarj-cuerpo"><ul class="cen-plana cen-mirar">' +
    cenDondeMirar(obras).map(function(x){ return '<li><span>' + x.t + '<small>' + esc(x.s) + '</small></span><span class="pill ' + x.cl + '">' + esc(x.p) + '</span></li>'; }).join('') +
    '</ul></div></div></div>';
  caja.innerHTML = h;
  Array.prototype.forEach.call(caja.querySelectorAll('tr[data-obra]'), function(tr){ tr.onclick = function(){ cenVerObra(tr.getAttribute('data-obra')); }; });
}
/* lo que salta a la vista entre las obras y entre los contratistas */
function cenDondeMirar(obras){
  var l = [];
  obras.filter(function(o){ return o.acc; }).forEach(function(o){ l.push({ t:'<b>' + esc(o.nombre) + '</b>: accidente incapacitante este mes', s:'Días sin accidentes: ' + o.diasSin + ' · la investigación y sus medidas, en su obra', p:'Accidente', cl:'mal' }); });
  obras.filter(function(o){ return o.ven >= 2; }).sort(function(a, b){ return b.ven - a.ven; }).forEach(function(o){ l.push({ t:'<b>' + esc(o.nombre) + '</b>: ' + o.ven + ' observaciones vencidas', s:'Ya le subieron a su jefe SSOMA', p:'Vencidas', cl:'ojo' }); });
  var C = cenContratistas().filter(function(c){ return c.obras.length > 1 && c.cap < 0.85; });
  C.forEach(function(c){ l.push({ t:'<b>' + esc(c.corto) + '</b>: capacitación baja en ' + c.obras.length + ' obras', s:'Al día: ' + _cenPct(c.cap) + ' · levantadas a tiempo: ' + _cenPct(c.aT), p:'Contratista', cl:'ojo' }); });
  if(!l.length) l.push({ t:'Nada que salte a la vista', s:'Todas las obras y contratistas dentro del estándar', p:'Bien', cl:'ok' });
  return l.slice(0, 5);
}
function cenVerObra(id){
  if(id === CEN.d.obra.id){ navegar('cen-tablero'); return; }
  var o = CEN_OBRAS.filter(function(x){ return x.id === id; })[0]; if(!o) return;
  var st = _cenEstadoObra(o), en = CEN_EN_OBRAS[id] || {};
  var h = '<div class="rej cen-cifras cen-3">' + cifra('Gente hoy', _cenN(o.gente), o.emps + ' empresas', '') +
    cifra('Capacitación al día', _cenPct(o.cap), '', o.cap < 0.85 ? 'ojo' : 'ok') + cifra('Levantadas a tiempo', _cenPct(o.aT), 'últimos 30 días', o.aT < 0.75 ? 'ojo' : '') + '</div>' +
    '<dl class="datos"><dt>Tipo</dt><dd>' + esc(o.tipo) + '</dd><dt>Lugar</dt><dd>' + esc(o.lugar) + '</dd><dt>Avance</dt><dd>' + _cenPct(o.avance) + '</dd>' +
    '<dt>ATS de hoy</dt><dd>' + o.atsOk + ' de ' + o.atsFr + ' frentes</dd><dt>Abiertas</dt><dd>' + o.ab + ' · ' + o.ven + ' vencidas</dd>' +
    '<dt>Este mes</dt><dd>' + o.acc + ' accidentes incapacitantes · ' + o.inc + ' incidentes · ' + _cenN(o.diasSin) + ' días sin accidentes</dd><dt>Estado</dt><dd><span class="pill ' + st.cl + '">' + esc(st.t) + '</span></dd></dl>' +
    '<h3 class="cen-h3">Sus subcontratas</h3><ul class="cen-plana">' + Object.keys(en).map(function(k){ var x = en[k], e = cenEmp(k) || CEN_OTRAS_EMP[k];
      return '<li><span>' + esc(e.corto) + '<small>' + _cenN(x.gente) + ' personas · capacitación ' + _cenPct(x.cap) + ' · a tiempo ' + _cenPct(x.aT) + '</small></span>' +
        (x.ven ? '<span class="pill ojo">' + x.ven + (x.ven === 1 ? ' vencida' : ' vencidas') + '</span>' : '<span class="pill ok">Al día</span>') + '</li>'; }).join('') + '</ul>' +
    '<p class="cen-nota">En la obra de ejemplo solo se abre entera Los Álamos. En la tuya, cada obra se abre igual: su tablero, sus observaciones, su informe.</p>';
  abrirHoja(o.nombre, o.tipo + ' · ' + o.lugar, h, '<button type="button" class="bt sec" id="cen-ob-alamos">Abrir Los Álamos</button>');
  $('cen-ob-alamos').onclick = function(){ cerrarHoja(); navegar('cen-tablero'); };
}
/* cada subcontrata, juntando todas las obras donde trabaja */
function cenContratistas(){
  var por = {}, d = CEN.d, desde = d.ahora - 30 * 86400000;
  CEN_EMPRESAS.forEach(function(e){
    if(e.principal) return;
    var x = cenIndicadores(e.id), obs = d.obs.filter(function(o){ return o.emp === e.id && o.creado >= desde; });
    var conLev = obs.filter(function(o){ return cenEstado(o).aTiempo !== null; }), aT = conLev.filter(function(o){ return cenEstado(o).aTiempo; }).length;
    por[e.id] = { id:e.id, corto:e.corto, nombre:e.nombre, rubro:e.rubro, obras:[{ id:CEN_OBRAS[0].id, n:'Los Álamos', gente:x.gente, cap:x.cap, aT:conLev.length ? aT / conLev.length : 1, ven:x.vencidas, obs:obs.length }] };
  });
  Object.keys(CEN_EN_OBRAS).forEach(function(oid){
    var ob = CEN_OBRAS.filter(function(o){ return o.id === oid; })[0], corto = ob.nombre.replace(/^(Residencial|Nave Industrial|Pabellón Universitario) /, '');
    Object.keys(CEN_EN_OBRAS[oid]).forEach(function(k){
      var x = CEN_EN_OBRAS[oid][k], e = cenEmp(k) || CEN_OTRAS_EMP[k];
      var c = por[k] || (por[k] = { id:k, corto:e.corto, nombre:e.nombre, rubro:e.rubro, obras:[] });
      c.obras.push({ id:oid, n:corto, gente:x.gente, cap:x.cap, aT:x.aT, ven:x.ven, obs:x.obs });
    });
  });
  return Object.keys(por).map(function(k){
    var c = por[k], g = c.obras.reduce(function(a, o){ return a + o.gente; }, 0);
    c.gente = g; c.cap = c.obras.reduce(function(a, o){ return a + o.cap * o.gente; }, 0) / Math.max(1, g);
    c.aT = c.obras.reduce(function(a, o){ return a + o.aT * o.gente; }, 0) / Math.max(1, g);
    c.ven = c.obras.reduce(function(a, o){ return a + o.ven; }, 0);
    c.obs100 = c.obras.reduce(function(a, o){ return a + o.obs; }, 0) / Math.max(1, g) * 100;
    c.st = (c.cap < 0.85 || c.aT < 0.75 || c.ven >= 3) ? { t:'Atención', cl:'mal' } : ((c.cap < 0.9 || c.aT < 0.85 || c.ven) ? { t:'A mejorar', cl:'ojo' } : { t:'Cumple', cl:'ok' });
    return c;
  }).sort(function(a, b){ return (a.cap + a.aT) - (b.cap + b.aT); });
}
function cenVistaContratistas(caja){
  var C = cenContratistas();
  _cenAcc('');
  var h = '<div class="tarj" id="cen-c-t"></div>' +
    '<p class="cen-nota">Cada fila junta todas las obras donde trabaja esa subcontrata, ponderado por su gente. Sale solo de lo que registra en la app: nadie llena una evaluación aparte. ' +
    'Te sirve para decidir a quién llamas en la próxima obra y qué le pides en el contrato.</p>';
  caja.innerHTML = h;
  tabla($('cen-c-t'), [
    { k:'corto', t:'Contratista', v:function(c){ return c.nombre; }, h:function(c){ return '<b class="cen-ot">' + esc(c.corto) + '</b><small class="cen-ol">' + esc(c.rubro) + '</small>'; } },
    { k:'obras', t:'Obras', v:function(c){ return c.obras.map(function(o){ return o.n; }).join(', '); },
      h:function(c){ return c.obras.map(function(o){ return '<span class="cen-obra-t">' + esc(o.n) + ' <small>' + o.gente + '</small></span>'; }).join(''); } },
    { k:'gente', t:'Gente', num:true },
    { k:'cap', t:'Capacitación', num:true, v:function(c){ return c.cap.toFixed(3); }, h:function(c){ return '<span class="' + (c.cap < 0.85 ? 'cen-mal' : (c.cap < 0.9 ? 'cen-ojo' : '')) + '">' + _cenPct(c.cap) + '</span>'; } },
    { k:'aT', t:'A tiempo', num:true, v:function(c){ return c.aT.toFixed(3); }, h:function(c){ return '<span class="' + (c.aT < 0.75 ? 'cen-mal' : (c.aT < 0.85 ? 'cen-ojo' : '')) + '">' + _cenPct(c.aT) + '</span>'; } },
    { k:'ven', t:'Vencidas', num:true },
    { k:'obs100', t:'Obs./100', num:true, v:function(c){ return c.obs100.toFixed(1); } },
    { k:'st', t:'', v:function(c){ return c.st.t; }, h:function(c){ return '<span class="pill ' + c.st.cl + '">' + esc(c.st.t) + '</span>'; } }
  ], C, { unidad:'empresas', archivo:'contratistas-' + new Date().getFullYear(), alClic:function(c){ if(cenEmp(c.id) && !cenEmp(c.id).principal && CEN_EMPRESAS.some(function(e){ return e.id === c.id; })) cenVerEmpresa(c.id); else toast('En la obra de ejemplo, el detalle se abre solo para las empresas de Los Álamos.'); } });
}

/* ══ EL PORTAL DE LA OBRA DE EJEMPLO ═════════════════════════════════
   portal/?demo=central: sin cuenta y sin servidor. Arriba, «Ver como»
   cambia de rango (lo que en la obra real es la cuenta de cada uno). */
var CEN_PINTA = { obras:cenVistaObras, contratistas:cenVistaContratistas, tablero:cenVistaTablero, subio:cenVistaSubio, obs:cenVistaObs,
  pend:cenVistaPend, levantar:cenVistaLevantar, miemp:cenVistaMiEmp, empresas:cenVistaEmpresas, personal:cenVistaPersonal,
  matriz:cenVistaMatriz, informe:cenVistaInforme, uso:cenVistaUso, equipo:cenVistaEquipo, estandar:cenVistaEstandar };
function centralDemo(){
  CEN.demo = true;
  /* ?como=corp|gerente|jefe|supervisor|sub abre con ese rango (los enlaces de central.html) */
  var como = ((location.search || '').match(/[?&]como=([a-z]+)/) || [])[1];
  if(como && CEN_POR_ROL[como]) guardar(CEN_LS_ROL, como);
  var r = leer(CEN_LS_ROL, 'jefe'); CEN.rol = CEN_POR_ROL[r] ? r : 'jefe';
  cenCargarDemo();
  _cenCss();
  try{ UNIDAD_1['observaciones'] = 'observación'; }catch(e){}
  /* sin token de verdad: nada sale de este navegador (y «Salir» no toca la sesión guardada) */
  YO = { empresas:[CEN.d.obra], obra:CEN.d.obra, rol:'central', nombre:'', dueno:false, admin:false, central:true, demo:true };
  TOK = { correo:'', demo:true };
  $('entrada').hidden = true; $('portal').className = 'on cen-demo';
  try{ document.title = 'OBRASST Central · Obra de ejemplo'; }catch(e){}
  cenPintarBarra();
  var hash = (location.hash || '').slice(1), vs = vistasDe();
  VISTA.actual = null;
  navegar(vs.some(function(v){ return v.id === hash; }) ? hash : vs[0].id, true);
}
function cenPintarBarra(){
  var caja = $('obra-sel'), sel = $('sel-obra'), rol = cenRol(), yo = cenYo();
  caja.hidden = false;
  var obras = CEN.rol === 'corp' ? CEN_OBRAS : [CEN_OBRAS[0]];
  sel.innerHTML = obras.map(function(o){ return '<option value="' + o.id + '"' + (o.id === CEN.d.obra.id ? ' selected' : '') + '>' + esc(o.nombre) + '</option>'; }).join('');
  sel.onchange = function(){ var v = sel.value; sel.value = CEN.d.obra.id; if(v !== CEN.d.obra.id) cenVerObra(v); };
  var p = $('papel'); p.textContent = rol.p; p.className = 'papel cen-papel ' + CEN.rol; p.title = rol.t + ' · ' + rol.sub;
  var vc = $('cen-vercomo');
  if(!vc){
    vc = document.createElement('label'); vc.className = 'cen-vercomo'; vc.id = 'cen-vercomo';
    vc.innerHTML = '<span>Ver como</span><select id="cen-rol" aria-label="Ver la obra como"></select>';
    p.parentNode.insertBefore(vc, p.nextSibling);
  }
  $('cen-rol').innerHTML = CEN_ROLES.map(function(x){
    return '<option value="' + x.k + '"' + (x.k === CEN.rol ? ' selected' : '') + '>' + esc(x.o) + '</option>'; }).join('');
  $('cen-rol').onchange = function(){ cenCambiarRol(this.value); };
  var v = $('vivo'); v.className = 'vivo cen-ej'; v.title = 'Empresas, personas y cifras inventadas. No toca ningún servidor.'; $('vivo-t').textContent = 'Obra de ejemplo';
  ['pais-chip', 'bt-guia', 'bt-app', 'bt-consola'].forEach(function(id){ var b = $(id); if(b) b.hidden = true; });
  $('cuenta-n').textContent = yo.nombre; $('avatar').textContent = iniciales(yo.nombre); $('avatar').title = yo.nombre + ' · ' + yo.cargo;
  var bs = $('bt-salir'); bs.textContent = 'Salir del ejemplo'; bs.onclick = function(){ location.href = 'central.html'; };
  /* en el celular el pie del costado no se ve: la cinta, debajo de la barra */
  var ci = $('cen-cinta');
  if(!ci){ ci = document.createElement('div'); ci.id = 'cen-cinta'; ci.className = 'cen-cinta'; document.querySelector('#portal .barra').appendChild(ci); }
  ci.innerHTML = '<span><b>Obra de ejemplo</b> · empresas y personas inventadas</span><button type="button" class="bt sec chico" id="cen-reini2">Reiniciar</button>';
  $('cen-reini2').onclick = cenPreguntarReinicio;
}
function cenCambiarRol(k){
  if(!CEN_POR_ROL[k]) return;
  var antes = VISTA.actual;
  CEN.rol = k; guardar(CEN_LS_ROL, k); CEN.filtro = {};
  try{ cerrarHoja(); }catch(e){}
  cenPintarBarra();
  var vs = vistasDe(), ir = vs.some(function(v){ return v.id === antes; }) ? antes : vs[0].id;
  VISTA.actual = null; navegar(ir, true);
  var yo = cenYo(); toast('Ahora ves la obra como ' + yo.nombre + ', ' + yo.cargo + (k === 'sub' ? ' de ' + cenEmp(yo.emp).corto : '') + '.');
}
/* el costado: lo que pide acción lleva su número; abajo, el aviso de que es un ejemplo */
function cenRailPie(r){
  var yo = cenYo(), d = CEN.d;
  var n = {
    'cen-subio':cenSubioAMi().length,
    'cen-pend':d.obs.filter(function(o){ return o.por === yo.id && cenEstado(o).est === 'levantada'; }).length,
    'cen-levantar':d.obs.filter(function(o){ return o.emp === yo.emp && CEN.rol === 'sub' && cenEstado(o).est === 'abierta'; }).length
  };
  Object.keys(n).forEach(function(id){ if(!n[id]) return; var b = r.querySelector('.nav[data-v="' + id + '"]');
    if(b) b.insertAdjacentHTML('beforeend', '<span class="n cen-n">' + n[id] + '</span>'); });
  var pie = document.createElement('div'); pie.className = 'cen-rail-pie';
  pie.innerHTML = '<b>Obra de ejemplo</b><span>Empresas, personas, RUC y fotos inventados. Lo que hagas aquí queda solo en este navegador.</span>' +
    '<button type="button" class="bt sec chico" id="cen-reini">Reiniciar el ejemplo</button>';
  r.appendChild(pie);
  $('cen-reini').onclick = cenPreguntarReinicio;
}
function cenPreguntarReinicio(){
  confirmar('Reiniciar el ejemplo', 'Se borra lo que validaste, levantaste, observaste o invitaste aquí, y la obra vuelve a como empezó hoy.', { si:'Reiniciar' }).then(function(ok){
    if(!ok) return;
    cenReiniciar(); try{ cerrarHoja(); }catch(e){}
    var v = VISTA.actual; VISTA.actual = null; navegar(v || vistasDe()[0].id, true);
    toast('La obra de ejemplo volvió a empezar.');
  });
}

/* ══ CÓMO SE VE ══════════════════════════════════════════════════════ */
function _cenCss(){
  if($('cen-css')) return;
  var st = document.createElement('style'); st.id = 'cen-css';
  st.textContent = [
    /* la barra de la demo */
    '.cen-papel{white-space:nowrap}.cen-nw{white-space:nowrap}table.cen-inf td.num,table.cen-emps td.num{white-space:nowrap}',
    '.cen-papel.corp{background:var(--tinta);color:#fff}.cen-papel.gerente{background:#FFF4CC;color:#7A5A00}.cen-papel.sub{background:var(--ok-f);color:var(--ok)}',
    '.cen-vercomo{display:flex;align-items:center;gap:8px;padding:5px 8px 5px 11px;border:1px solid var(--raya);border-radius:8px;background:var(--panel);font-size:12px;color:var(--gris);white-space:nowrap}',
    '.cen-vercomo select{border:0;background:transparent;padding:0;font:inherit;font-size:13px;font-weight:500;color:var(--tinta);max-width:220px;cursor:pointer}',
    '.cen-vercomo select:focus{box-shadow:none}',
    '.vivo.cen-ej i{background:var(--casco);box-shadow:0 0 0 3px rgba(245,183,0,.22)}',
    '.cen-cinta{display:none}',
    '.cen-rail-pie{margin:18px 4px 0;padding:12px;border:1px dashed var(--raya2);border-radius:10px;font-size:12.5px;color:var(--gris);display:grid;gap:6px;line-height:1.45}',
    '.cen-rail-pie b{color:var(--texto);font-weight:600}.cen-rail-pie .bt{justify-self:start}',
    '.nav .n.cen-n{background:var(--mal-f);color:var(--mal);font-weight:600}.nav.on .n.cen-n{background:#fff}',
    '@media (min-width:901px) and (max-width:1180px){.cen-vercomo span{display:none}.cen-vercomo select{max-width:170px}}',
    'table.cen-obras td:first-child{min-width:230px}',
    '@media (max-width:900px){#portal.cen-demo #papel,#portal.cen-demo #vivo{display:none}.cen-rail-pie{display:none}.cen-cinta{display:flex;flex-basis:100%;align-items:center;justify-content:space-between;gap:10px;font-size:12.5px;color:var(--gris);padding:2px 0 0}',
    '  .cen-cinta b{color:var(--texto)}.cen-vercomo span{display:none}.cen-vercomo select{max-width:150px}}',
    /* las cifras */
    '.rej.cen-cifras{grid-template-columns:repeat(5,minmax(0,1fr))}.rej.cen-cifras.cen-3{grid-template-columns:repeat(3,minmax(0,1fr))}',
    '.cifra.cen-txt .v{font-size:17px;line-height:1.3;letter-spacing:0}',
    '@media (max-width:1200px){.rej.cen-cifras{grid-template-columns:repeat(3,minmax(0,1fr))}}',
    '@media (max-width:640px){.rej.cen-cifras,.rej.cen-cifras.cen-3{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    /* subió a ti */
    '.cen-subio{display:flex;align-items:center;gap:14px;width:100%;text-align:left;cursor:pointer;margin:0 0 18px;padding:12px 16px;border-radius:12px;border:1px solid #F0C9CC;background:var(--mal-f);color:var(--texto)}',
    '.cen-subio:hover{border-color:var(--mal)}.cen-subio b{display:block;color:var(--mal);font-weight:600}.cen-subio small{display:block;color:var(--texto);font-size:13px;margin-top:1px}',
    '.cen-subio-n{flex:0 0 auto;width:36px;height:36px;border-radius:50%;background:var(--mal);color:#fff;display:grid;place-items:center;font-weight:600;font-variant-numeric:tabular-nums}',
    '.cen-subio-ir{margin-left:auto;color:var(--mal);font-weight:600;white-space:nowrap}',
    '.cen-subio-l{display:grid;gap:14px}.cen-subio-c{display:grid;grid-template-columns:132px minmax(0,1fr);margin:0}',
    '.cen-subio-c img{width:132px;height:100%;min-height:176px;object-fit:cover;display:block;background:var(--fondo)}',
    '.cen-subio-tx{padding:14px 16px;display:grid;gap:4px;align-content:start}.cen-subio-top{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px}',
    '.cen-subio-t{color:var(--tinta);font-size:15.5px;font-weight:600}.cen-subio-s{color:var(--gris);font-size:13px}',
    '.cen-subio-bts{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}',
    '@media (max-width:640px){.cen-subio-c{grid-template-columns:96px minmax(0,1fr)}.cen-subio-c img{width:96px}}',
    /* la tabla de empresas */
    'table.cen-emps td{vertical-align:middle}.cen-emp-n{color:var(--tinta);font-weight:600}.cen-emp-r{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}',
    '.cen-barra{display:inline-block;vertical-align:middle;width:84px;height:6px;border-radius:3px;background:var(--fondo);overflow:hidden;box-shadow:inset 0 0 0 1px var(--raya)}',
    '.cen-barra i{display:block;height:100%;background:var(--tinta);border-radius:3px}.cen-barra i.ojo{background:var(--ojo)}',
    '.cen-pct{font-variant-numeric:tabular-nums;font-size:13px;margin-left:6px}',
    'td.cen-ojo,.cen-ojo{color:var(--ojo);font-weight:600}td.cen-mal,.cen-mal{color:var(--mal);font-weight:600}',
    /* dos columnas */
    '.cen-dos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.cen-dos>.tarj{margin:0 0 18px}',
    '@media (max-width:1000px){.cen-dos{grid-template-columns:minmax(0,1fr);gap:0}}',
    /* lo abierto por riesgo */
    '.cen-ley{display:flex;gap:12px;font-size:12px;color:var(--gris)}.cen-ley span::before{content:"";display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;vertical-align:-1px}',
    '.cen-ley .alto::before{background:var(--mal)}.cen-ley .medio::before{background:var(--ojo)}.cen-ley .bajo::before{background:var(--gris2)}',
    '.cen-riesgos{display:grid;gap:10px}.cen-rf{display:grid;grid-template-columns:150px minmax(0,1fr) 34px;align-items:center;gap:10px;font-size:13px}',
    '.cen-rf-n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cen-rf-v{text-align:right;font-variant-numeric:tabular-nums;color:var(--tinta)}',
    '.cen-rf-b{display:flex;gap:2px;height:14px}.cen-rf-b i{display:block;height:100%;border-radius:3px;min-width:4px}',
    '.cen-rf-b i.alto{background:var(--mal)}.cen-rf-b i.medio{background:var(--ojo)}.cen-rf-b i.bajo{background:var(--gris2)}.cen-rf-b i.obs{background:var(--azul)}',
    /* las listas */
    '.cen-lista{list-style:none;margin:0;padding:0;display:grid;gap:2px}',
    '.cen-li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;width:100%;text-align:left;cursor:pointer;background:none;border:0;border-radius:8px;padding:9px 10px;color:var(--texto)}',
    '.cen-li:hover{background:var(--fondo)}.cen-li b{display:block;font-weight:500;color:var(--tinta)}.cen-li small{display:block;color:var(--gris);font-size:12.5px}',
    '.cen-nada{color:var(--gris);margin:4px 0;font-size:13.5px}.cen-mas{color:var(--gris);font-size:12.5px;margin:8px 10px 0}',
    '.cen-h3{margin:22px 0 10px;font-size:14px}',
    '.cen-plana{list-style:none;margin:0;padding:0}.cen-plana li{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--raya);font-size:13.5px}',
    '.cen-plana li:last-child{border-bottom:0}.cen-plana li b{font-variant-numeric:tabular-nums;color:var(--tinta);white-space:nowrap}.cen-plana small{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}',
    '.cen-nota{color:var(--gris);font-size:13px;line-height:1.6;max-width:78ch;margin:4px 0 18px}.cen-nota-l{color:var(--gris);font-size:13px}',
    /* filtros */
    '.cen-filtros{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 16px}.cen-filtros select{width:auto;min-width:170px}',
    '.cen-chips{display:inline-flex;flex-wrap:wrap;gap:4px;padding:3px;border:1px solid var(--raya);border-radius:10px;background:var(--panel)}',
    '.cen-chip{border:0;background:none;cursor:pointer;padding:6px 11px;border-radius:7px;font-size:13px;color:var(--texto)}',
    '.cen-chip b{font-weight:600;color:var(--gris);font-variant-numeric:tabular-nums;margin-left:3px}.cen-chip small{color:var(--gris);font-size:11.5px;margin-left:3px}',
    '.cen-chip:hover{background:var(--fondo)}.cen-chip.on{background:var(--tinta);color:#fff}.cen-chip.on b,.cen-chip.on small{color:#CFE0EA}',
    '.cen-check{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;cursor:pointer}.cen-check input{width:auto;margin:0}',
    '.cen-ot{display:block;font-weight:500;color:var(--tinta)}.cen-ol{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}',
    /* el riesgo */
    '.cen-riesgo{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.03em;padding:3px 8px;border-radius:5px;white-space:nowrap}',
    '.cen-riesgo.alto{background:var(--mal);color:#fff}.cen-riesgo.medio{background:var(--ojo-f);color:var(--ojo);box-shadow:inset 0 0 0 1px #EED9A8}.cen-riesgo.bajo{background:var(--fondo);color:var(--gris);box-shadow:inset 0 0 0 1px var(--raya)}',
    /* una observación */
    '.cen-ob-top{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}',
    '.cen-fotos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 16px}.cen-fotos figure{margin:0}',
    '.cen-fotos img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:10px;background:var(--fondo)}',
    '.cen-fotos figcaption{font-size:12.5px;color:var(--gris);margin-top:5px}',
    '.cen-sinfoto span{display:grid;place-items:center;aspect-ratio:3/4;border:1.5px dashed var(--raya2);border-radius:10px;color:var(--gris);font-size:13px;text-align:center;padding:10px}',
    '.cen-hist{list-style:none;margin:0;padding:0 0 0 18px;border-left:2px solid var(--raya);display:grid;gap:12px}',
    '.cen-hist li{position:relative;font-size:13.5px}.cen-hist li::before{content:"";position:absolute;left:-25px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--tinta);box-shadow:0 0 0 3px var(--panel)}',
    '.cen-hist li.levanta::before{background:var(--azul)}.cen-hist li.rechaza::before{background:var(--mal)}.cen-hist li.valida::before{background:var(--ok)}.cen-hist li.sube::before{background:var(--ojo)}',
    '.cen-hist b{color:var(--tinta);font-weight:600}.cen-hist small{display:block;color:var(--gris);font-size:12.5px;margin-top:1px}',
    '.cen-lev{margin-top:6px}.cen-lev-foto{display:flex;gap:12px;align-items:center;margin:0 0 14px;font-size:13.5px}',
    '.cen-lev-foto img{width:84px;aspect-ratio:3/4;object-fit:cover;border-radius:8px;flex:0 0 auto;background:var(--fondo)}.cen-lev-foto small{display:block;color:var(--gris);font-size:12.5px;margin-top:2px}',
    '.cen-ries-ops{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
    '.cen-ries-op{display:grid;gap:1px;padding:9px 11px;border:1px solid var(--raya2);border-radius:9px;cursor:pointer;position:relative;border-top-width:4px}',
    '.cen-ries-op.alto{border-top-color:var(--mal)}.cen-ries-op.medio{border-top-color:var(--ojo)}.cen-ries-op.bajo{border-top-color:var(--gris2)}',
    '.cen-ries-op input{position:absolute;opacity:0}.cen-ries-op small{color:var(--gris);font-size:12px}',
    '.cen-ries-op:has(input:checked){background:var(--azul-f);border-color:var(--azul)}.cen-ries-op:focus-within{outline:2px solid var(--azul);outline-offset:2px}',
    /* las subcontratas */
    '.cen-empresas{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin:0 0 6px}',
    '.cen-emp{display:grid;gap:6px;text-align:left;padding:16px;margin:0;cursor:pointer;color:var(--texto);font:inherit;align-content:start}',
    '.cen-emp:hover{border-color:var(--raya2);box-shadow:var(--sombra)}.cen-emp small{color:var(--gris);font-size:12.5px}',
    '.cen-emp-cab{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.cen-emp-cab b{color:var(--tinta);font-weight:600}',
    '.cen-emp-cif{display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;color:var(--gris);margin-top:4px}.cen-emp-cif b{display:block;font-size:17px;color:var(--tinta);font-variant-numeric:tabular-nums}',
    '.cen-emp-sup{font-size:12.5px;color:var(--gris)}.cen-emp-sup b{color:var(--texto);font-weight:500}',
    '.cen-emp-inv{cursor:default;border-style:dashed;background:var(--fondo)}.cen-emp-inv:hover{box-shadow:none;border-color:var(--raya)}',
    '.cen-wa{background:#E6F6E9;border-radius:4px 12px 12px 12px;padding:10px 13px;font-size:13.5px;line-height:1.55;max-width:440px}.cen-wa p{margin:0 0 6px}',
    '.cen-wa-link{font-family:var(--mono);font-size:12px;color:var(--azul);word-break:break-all}.cen-wa-nota{color:var(--gris);font-size:12px;margin:0!important}',
    /* la matriz */
    'table.cen-matriz th{white-space:normal;min-width:104px;vertical-align:bottom;line-height:1.3}table.cen-matriz td{vertical-align:middle}',
    '.cen-mz{text-align:center}.cen-mz b{display:block;font-variant-numeric:tabular-nums;font-size:14px}.cen-mz small{display:block;font-size:11.5px;color:var(--gris)}',
    '.cen-mz.ok{background:var(--ok-f)}.cen-mz.ok b{color:var(--ok)}.cen-mz.ojo{background:var(--ojo-f)}.cen-mz.ojo b{color:var(--ojo)}.cen-mz.mal{background:var(--mal-f)}.cen-mz.mal b{color:var(--mal)}',
    '.cen-mz-no{text-align:center;color:var(--gris2)}',
    /* el uso del mes */
    '.cen-uso{display:flex;align-items:flex-end;gap:2px;height:150px;padding-top:6px}',
    '.cen-uso-d{flex:1 1 0;height:100%;display:flex;align-items:flex-end;min-width:0}.cen-uso-d i{display:block;width:100%;background:#C9D5DD;border-radius:2px 2px 0 0}',
    '.cen-uso-d.este i{background:var(--tinta)}.cen-uso-d.pico i{background:var(--casco);box-shadow:0 -3px 0 var(--tinta)}',
    '.cen-uso-d.falta i{height:100%;background:repeating-linear-gradient(135deg,transparent 0 5px,var(--raya) 5px 6px);border-radius:2px}',
    '.rej.cen-cifras.cen-4{grid-template-columns:repeat(4,minmax(0,1fr))}@media (max-width:1000px){.rej.cen-cifras.cen-4{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '.cen-uso-eje{display:flex;justify-content:space-between;color:var(--gris);font-size:12px;margin-top:6px}',
    /* el equipo y el estándar */
    '.cen-rango{display:inline-block;font-size:11.5px;font-weight:600;padding:3px 9px;border-radius:999px;background:var(--fondo);color:var(--gris)}',
    '.cen-rango.corp{background:var(--tinta);color:#fff}.cen-rango.gerente{background:#FFF4CC;color:#7A5A00}.cen-rango.jefe{background:var(--azul-f);color:var(--azul)}',
    '.cen-rango.supervisor{background:var(--ok-f);color:var(--ok)}',
    '.cen-priv b{color:var(--tinta)}.cen-priv p{margin:6px 0 0;font-size:13.5px;line-height:1.6;max-width:80ch}',
    '.cen-escala{margin:0;padding-left:20px;display:grid;gap:10px;font-size:13.5px}.cen-escala b{display:block;color:var(--tinta)}.cen-escala span{color:var(--texto)}',
    /* el informe y el corporativo */
    'table.cen-inf th{white-space:normal;line-height:1.3;vertical-align:bottom}',
    '.cen-obra-t{display:inline-block;font-size:12px;padding:2px 8px;border-radius:999px;background:var(--fondo);margin:0 4px 4px 0;white-space:nowrap}.cen-obra-t small{color:var(--gris)}',
    '.cen-mirar li{align-items:flex-start}'
  ].join('\n');
  document.head.appendChild(st);
}
