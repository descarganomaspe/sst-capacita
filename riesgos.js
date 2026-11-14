/* OBRASST · LOS RIESGOS DE LA OBRA (11/11/2026) — el mismo archivo para la app y para la web (portal: «../riesgos.js»).
   Marcelo (11/11): «Mapa de riesgos georreferenciado de la obra · Simulador de accidentes y escenarios de riesgo · IA
   predictiva: anticipar escenarios de riesgo · Análisis de tendencia a un accidente y/o incidente».
   Cómo se hizo, sin vender humo («NADA QUE NO SEA CIERTO», «No vender IA»):
   · ANTICIPAR: con los registros de la obra —actos y condiciones, casi accidentes y accidentes, inspecciones y equipos
     observados, ATS y PETAR de hoy— se cuenta por tipo de riesgo semana a semana (12 semanas), se compara lo último (4
     semanas) con lo de antes (4) y se arman los escenarios que se están juntando, cada uno con su porqué y qué hacer hoy.
     No es una predicción segura ni es IA: son reglas a la vista, y cada alerta dice de dónde sale.
   · EL ÍNDICE (0 a 100) es una suma de puntos con tope por cada cosa, y la pantalla la muestra («Cómo se calcula»).
   · LA PIRÁMIDE: cuántos avisos (actos, condiciones, casi accidentes) hubo por cada accidente.
   · EL MAPA: cada punto con sus coordenadas reales (las del celular en el lugar, o pegadas de Google Maps): los frentes con
     su radio, los peligros con su nivel y lo de emergencia (punto de reunión, extintor, botiquín, salida…). Se dibuja aquí
     mismo, a escala y con el norte, sin mapas de terceros (sus servidores no son para una app que se vende); cada punto
     se abre en Google Maps o en OpenStreetMap con un toque.
   · EL SIMULADOR: un escenario en un lugar: qué puede pasar, qué tan cerca está hoy (lo que dicen los registros), quién
     responde, lo de emergencia más cercano con su distancia y los pasos con su tiempo. De ahí sale el simulacro.
   Nada de este archivo habla con el servidor: la app y la web le pasan los datos (RIE.normalizar) y guardan lo suyo. */
var RIE = (function(){
  'use strict';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }

  /* ── los tipos de riesgo: de qué habla cada registro (por sus palabras) ── */
  var CAT = [
    { k:'confinado',  n:'Espacio confinado',          ic:'🕳️', grave:true,  sim:'confinado',
      re:/confinad|cisterna|tanque|buz[oó]n|pozo|alcantarill|atm[oó]sfera|ox[ií]geno|\bgases?\b|\bh2s\b|mon[oó]xido/i,
      esc:'Atmósfera peligrosa en un espacio confinado', pasa:'Asfixia o intoxicación; y el que entra a rescatar sin equipo es la segunda víctima.',
      hacer:['Medir el aire antes de entrar y durante el trabajo (O₂, LEL, CO, H₂S)', 'PETAR de espacio confinado firmado y vigía afuera todo el tiempo', 'Nadie entra a rescatar sin equipo: el rescate está ensayado'] },
    { k:'altura',     n:'Trabajo en altura',          ic:'🪜', grave:true,  sim:'altura',
      re:/altura|andami|escaler|arn[eé]s|l[ií]nea de vida|baranda|barandilla|borde|techo|tijeral|plataforma|canastilla|anclaje|ca[ií]da (a|de) distinto nivel|ca[ií]da de altura|vac[ií]o/i,
      esc:'Caída de altura', pasa:'Fracturas, lesión de columna o muerte; si queda colgado del arnés, el rescate tiene minutos.',
      hacer:['Revisar arneses, líneas de vida y anclajes antes de subir (con su check list)', 'Barandas y rodapiés completos en bordes y andamios', 'PETAR de altura firmado y alguien de supervisión en el frente', 'Charla de 5 minutos de caída de altura hoy'] },
    { k:'electrico',  n:'Riesgo eléctrico',           ic:'⚡', grave:true,  sim:'medica',
      re:/el[eé]ctric|tablero|cable|energ[ií]a|tensi[oó]n|electrocu|descarga|bloqueo|loto|enchufe|extensi[oó]n|tomacorriente|empalme/i,
      esc:'Contacto eléctrico', pasa:'Quemaduras, paro cardíaco o una caída por la descarga.',
      hacer:['Bloqueo y etiquetado antes de intervenir: cada uno con su candado', 'Extensiones y tableros revisados, con su tapa y su diferencial', 'Distancia a las líneas eléctricas con equipos de altura y grúas'] },
    { k:'izaje',      n:'Izaje de cargas',            ic:'🏗️', grave:true,  sim:'colapso',
      re:/izaj|gr[uú]a|eslinga|grillete|estrobo|carga suspendida|rigger|tecle|winche|montaje de (vigas|estructura)/i,
      esc:'Caída de una carga suspendida', pasa:'Aplastamiento o golpe grave a quien está debajo o cerca.',
      hacer:['Plan de izaje con el semáforo de capacidad y el viento del día', 'Nadie debajo de la carga: zona aislada y vigía', 'Eslingas y grilletes con su check list del día'] },
    { k:'excavacion', n:'Excavaciones y zanjas',      ic:'⛏️', grave:true,  sim:'colapso',
      re:/excava|zanja|talud|derrumbe|entibad|sostenimiento|desmoron|atrapamiento/i,
      esc:'Derrumbe o caída a la zanja', pasa:'Atrapamiento: con medio metro de tierra encima ya no se respira.',
      hacer:['Talud o entibado según la profundidad y el suelo, revisado hoy', 'Material y máquinas lejos del borde; barandas y señales', 'Escalera de salida cada pocos metros'] },
    { k:'caliente',   n:'Trabajo en caliente',        ic:'🔥', grave:true,  sim:'incendio',
      re:/soldad|oxicorte|esmeril|amolad|caliente|chispa|incendi|fuego|llama|inflamable|quemadura/i,
      esc:'Incendio o quemadura', pasa:'Un amago que crece, quemaduras y humo en el frente.',
      hacer:['PETAR de trabajo en caliente con el área despejada de combustibles', 'Extintor al lado y vigía de fuego hasta media hora después', 'Biombos y EPP de soldador completos'] },
    { k:'vehiculos',  n:'Vehículos y equipos móviles', ic:'🚜', grave:true, sim:'medica',
      re:/veh[ií]cul|cami[oó]n|camioneta|montacarga|retroexcavadora|excavadora|cargador|volquete|minicargador|maquinaria|atropell|tr[aá]nsito|retroceso|alarma de retroceso|vig[ií]a/i,
      esc:'Atropello o choque', pasa:'Atropello en retroceso o en un punto ciego; vuelco del equipo.',
      hacer:['Vías separadas para gente y máquinas, con señales', 'Vigía en las maniobras de retroceso; alarma de retroceso funcionando', 'Pre-uso del equipo con su QR antes de arrancar'] },
    { k:'quimicos',   n:'Productos químicos',         ic:'🧪', grave:false, sim:'derrame',
      re:/qu[ií]mic|msds|sustancia|derrame|solvente|thinner|pintura|combustible|petr[oó]leo|gasolina|aceite|[aá]cido|cemento|aditivo/i,
      esc:'Derrame o exposición química', pasa:'Quemaduras en la piel u ojos, intoxicación o un derrame que llega al suelo o al agua.',
      hacer:['La hoja MSDS a la mano y el rombo en el envase', 'Kit antiderrame cerca del almacén y de los equipos', 'Respirador, guantes y lentes según la hoja MSDS'] },
    { k:'herramientas', n:'Herramientas y máquinas',  ic:'🔧', grave:false, sim:'medica',
      re:/herramienta|taladro|sierra|disco|guarda|martillo|cincel|cortadora|mezcladora|vibrador|compresora|corte o punzada/i,
      esc:'Corte o golpe con una herramienta', pasa:'Cortes, amputación de dedos o golpes.',
      hacer:['Herramientas con su guarda y su check list del día', 'Retirar de la obra lo que está malogrado (tarjeta roja)', 'Guantes según la tarea'] },
    { k:'epp',        n:'Equipos de protección (EPP)', ic:'🦺', grave:false, sim:'medica',
      re:/\bepp\b|casco|lentes|guantes|botas|tapones|orejeras|respirador|mascarilla|chaleco|careta|barbiquejo|sin (casco|lentes|guantes)/i,
      esc:'Lesión por no usar el EPP', pasa:'Golpes en la cabeza, partículas en los ojos, cortes en las manos.',
      hacer:['Revisar el EPP en el ingreso y en el frente', 'Cambiar el que está gastado (la entrega queda en el kardex)', 'Charla corta de por qué se usa'] },
    { k:'orden',      n:'Orden y limpieza',           ic:'🧹', grave:false, sim:'medica',
      re:/orden|limpieza|desorden|tropez|resbal|obst[aá]cul|clavo|desmonte|escombro|pasadizo|piso mojado|material suelto|ca[ií]da al mismo nivel/i,
      esc:'Caída al mismo nivel o pisar un clavo', pasa:'Torceduras, fracturas y heridas punzantes.',
      hacer:['Diez minutos de orden y limpieza al cierre de cada jornada', 'Clavos doblados o retirados; pasadizos libres', 'Desmonte en su lugar, no en el paso'] },
    { k:'ergonomia',  n:'Ergonomía y esfuerzo',       ic:'🏋️', grave:false, sim:'medica',
      re:/ergon|postura|carga manual|sobreesfuerzo|esfuerzo|levantar|lumbar|espalda|repetitiv/i,
      esc:'Lesión de espalda por carga manual', pasa:'Lumbalgias y hernias; se acumulan y aparecen meses después.',
      hacer:['Cargas de más de 25 kg entre dos o con ayuda mecánica', 'Rotar las tareas repetitivas', 'Pausas activas a media mañana'] },
    { k:'otros',      n:'Otros',                      ic:'•',  grave:false, sim:'medica', re:null,
      esc:'Otro evento', pasa:'Depende de lo reportado.', hacer:['Revisar lo reportado con el responsable del área'] }
  ];
  var POR = {}; CAT.forEach(function(c){ POR[c.k] = c; });
  function cat(k){ return POR[k] || POR.otros; }
  /* el agente del registro de accidentes, cuando lo hay, manda */
  var AGENTE = { 'caída a distinto nivel':'altura', 'caída al mismo nivel':'orden', 'caída de objetos':'izaje', 'atrapamiento':'excavacion',
                 'corte o punzada':'herramientas', 'contacto eléctrico':'electrico', 'quemadura':'caliente', 'golpe contra objeto':'orden',
                 'atropello':'vehiculos', 'sobreesfuerzo':'ergonomia', 'exposición a sustancias':'quimicos' };
  function clasificar(texto, agente){
    var a = String(agente || '').toLowerCase().trim();
    if(a && AGENTE[a]) return AGENTE[a];
    var t = String(texto || '');
    for(var i = 0; i < CAT.length; i++) if(CAT[i].re && CAT[i].re.test(t)) return CAT[i].k;
    return 'otros';
  }

  /* ── las fechas: 'aaaa-mm-dd', sin zona horaria (la de la obra la pone quien llama) ── */
  function dia(s){ var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '')); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5 : NaN; }
  function iso(n){ var d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
  function lunes(n){ var w = new Date(n * 864e5).getUTCDay(); return n - ((w + 6) % 7); }
  /* «1 aviso», «3 avisos» */
  function pl(n, uno, varios){ return n + ' ' + (n === 1 ? uno : varios); }
  function dm(s){ var p = String(s || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] : ''; }

  /* ── lo que llega de la app o de la web, en una sola forma ──
     R = { hoy, reportes:[{fecha, clase, descripcion, lugar, actividad, estado, cerrado}], accidentes:[{fecha, clase, descripcion,
           lugar, agente, potencial}], inspecciones:[{fecha, resultado, texto}], ats:[{fecha, trabajo, texto, estado}],
           petar:[{fecha, tipos, tarea, lugar, estado}], hht:[{fecha, horas}], frentes:[{id, n, gps}] } */
  var PTR_CAT = { altura:'altura', caliente:'caliente', confinado:'confinado', excavacion:'excavacion', izaje:'izaje', electrico:'electrico' };
  function normalizar(R){
    R = R || {};
    var hoy = String(R.hoy || '').slice(0, 10);
    var D = { hoy:hoy, eventos:[], hoyTrabajo:[], hht:[], frentes:[] };
    (R.reportes || []).forEach(function(r){
      if(!r) return;
      var f = String(r.fecha || r.creado || '').slice(0, 10); if(isNaN(dia(f))) return;
      var tx = [r.descripcion, r.actividad, r.lugar].filter(Boolean).join(' · ');
      var abierto = !/cerrad|levantad/i.test(String(r.estado || '')) && !r.cerrado;
      D.eventos.push({ tipo:(r.clase === 'acto' ? 'acto' : 'condicion'), fecha:f, cat:clasificar(tx), texto:String(r.descripcion || '').slice(0, 160),
                       lugar:String(r.lugar || '').slice(0, 80), abierto:abierto });
    });
    (R.accidentes || []).forEach(function(a){
      if(!a) return;
      var f = String(a.fecha || '').slice(0, 10); if(isNaN(dia(f))) return;
      var k = String(a.clase || '');
      var tipo = (k === 'leve' || k === 'incap' || k === 'mortal') ? 'accidente' : 'incidente';   /* casi, daño, primeros auxilios */
      D.eventos.push({ tipo:tipo, grave:(k === 'incap' || k === 'mortal' || !!a.potencial), fecha:f,
                       cat:clasificar([a.descripcion, a.lugar].filter(Boolean).join(' · '), a.agente), texto:String(a.descripcion || a.agente || '').slice(0, 160),
                       lugar:String(a.lugar || '').slice(0, 80) });
    });
    (R.inspecciones || []).forEach(function(x){
      if(!x) return;
      var f = String(x.fecha || '').slice(0, 10); if(isNaN(dia(f))) return;
      var r = String(x.resultado || '');
      if(!/observ|no_apto|no apto|mal|nc/i.test(r)) return;
      D.eventos.push({ tipo:'inspeccion', fecha:f, cat:clasificar(x.texto || ''), texto:String(x.texto || '').slice(0, 160), noApto:/no_apto|no apto/i.test(r) });
    });
    (R.ats || []).forEach(function(a){
      if(!a) return;
      var f = String(a.fecha || '').slice(0, 10); if(f !== hoy) return;
      var tx = [a.trabajo, a.texto].filter(Boolean).join(' · ');
      var ks = {}; CAT.forEach(function(c){ if(c.grave && c.re && c.re.test(tx)) ks[c.k] = 1; });
      Object.keys(ks).forEach(function(k){ D.hoyTrabajo.push({ de:'ats', cat:k, texto:String(a.trabajo || 'ATS').slice(0, 90) }); });
    });
    (R.petar || []).forEach(function(p){
      if(!p) return;
      var f = String(p.fecha || '').slice(0, 10); if(f !== hoy) return;
      if(/cerrad|suspend|vencid|borrador/i.test(String(p.estado || ''))) return;
      (p.tipos || []).forEach(function(t){ if(PTR_CAT[t]) D.hoyTrabajo.push({ de:'petar', cat:PTR_CAT[t], texto:String(p.tarea || 'PETAR').slice(0, 90) }); });
    });
    (R.hht || []).forEach(function(h){ var f = String(h.fecha || '').slice(0, 10); if(!isNaN(dia(f))) D.hht.push({ fecha:f, horas:+h.horas || 0 }); });
    (R.frentes || []).forEach(function(f){ if(f && f.n) D.frentes.push({ id:f.id || f.n, n:String(f.n), gps:f.gps || null, punto:f.punto || '' }); });
    return D;
  }

  /* ── el análisis ── */
  var SEM = 12;
  function analizar(D){
    var h = dia(D.hoy), L0 = lunes(h), A = { hoy:D.hoy, semanas:[], series:{}, cats:[], alertas:[], escenarios:[], puntos:[], indice:0, nivel:'bajo' };
    for(var i = SEM - 1; i >= 0; i--) A.semanas.push(iso(L0 - 7 * i));
    var tipos = ['acto', 'condicion', 'incidente', 'accidente', 'inspeccion'];
    tipos.forEach(function(t){ A.series[t] = A.semanas.map(function(){ return 0; }); });
    var ult = { }, ant = { }, ev4 = [];
    CAT.forEach(function(c){ ult[c.k] = 0; ant[c.k] = 0; });
    D.eventos.forEach(function(e){
      var d = dia(e.fecha); if(d > h) return;
      var s = Math.floor((d - (L0 - 7 * (SEM - 1))) / 7);
      if(s >= 0 && s < SEM && A.series[e.tipo]) A.series[e.tipo][s]++;
      var hace = h - d;
      if(hace < 28){ ult[e.cat]++; ev4.push(e); } else if(hace < 56) ant[e.cat]++;
    });
    /* por tipo de riesgo: lo de las últimas 4 semanas contra las 4 de antes */
    CAT.forEach(function(c){
      var u = ult[c.k], a = ant[c.k];
      if(!u && !a) return;
      var eventos = ev4.filter(function(e){ return e.cat === c.k; });
      var abiertas = D.eventos.filter(function(e){ return e.cat === c.k && e.abierto && (e.tipo === 'acto' || e.tipo === 'condicion'); });
      var vencidas = abiertas.filter(function(e){ return h - dia(e.fecha) > 7; });
      A.cats.push({ k:c.k, n:c.n, ic:c.ic, grave:c.grave, ult:u, ant:a, sube:(u >= 3 && u >= a * 1.5 && u - a >= 2), cambio:(a ? Math.round((u - a) / a * 100) : null),
                    inc:eventos.filter(function(e){ return e.tipo === 'incidente'; }).length, acc:eventos.filter(function(e){ return e.tipo === 'accidente'; }).length,
                    abiertas:abiertas.length, vencidas:vencidas.length, insp:eventos.filter(function(e){ return e.tipo === 'inspeccion'; }).length,
                    hoy:D.hoyTrabajo.filter(function(x){ return x.cat === c.k; }), lugares:_lugares(eventos), ejemplo:(eventos.filter(function(e){ return e.tipo === 'incidente' || e.tipo === 'accidente'; })[0] || eventos[0] || {}).texto || '' });
    });
    A.cats.sort(function(x, y){ return (y.ult + 3 * y.inc + 6 * y.acc) - (x.ult + 3 * x.inc + 6 * x.acc); });
    /* la pirámide de las 12 semanas */
    var tot = function(t){ return A.series[t].reduce(function(s, x){ return s + x; }, 0); };
    A.piramide = { accidentes:tot('accidente'), incidentes:tot('incidente'), avisos:tot('acto') + tot('condicion'), inspecciones:tot('inspeccion') };
    /* los puntos del índice, cada uno con su tope (se muestran) */
    var c4 = function(t){ return ev4.filter(function(e){ return e.tipo === t; }).length; };
    var graves = A.cats.filter(function(c){ return c.grave; });
    var abiertasG = graves.reduce(function(s, c){ return s + c.abiertas; }, 0), vencidas = A.cats.reduce(function(s, c){ return s + c.vencidas; }, 0);
    var subenG = graves.filter(function(c){ return c.sube; }).length;
    var noApto = ev4.filter(function(e){ return e.tipo === 'inspeccion'; }).length;
    var hoyConAvisos = graves.filter(function(c){ return c.hoy.length && (c.abiertas || c.inc || c.ult >= 2); }).length;
    var hht2 = D.hht.filter(function(x){ return h - dia(x.fecha) < 14; }).reduce(function(s, x){ return s + x.horas; }, 0);
    var rep2 = D.eventos.filter(function(e){ return (e.tipo === 'acto' || e.tipo === 'condicion') && h - dia(e.fecha) < 14; }).length;
    var silencio = (hht2 > 0 || D.hoyTrabajo.length > 0) && rep2 === 0;
    function p(k, n, por, tope, txt){ var v = Math.min(tope, n * por); if(v > 0) A.puntos.push({ k:k, v:v, tope:tope, txt:txt }); return v; }
    var I = 0;
    I += p('acc', c4('accidente'), 20, 40, pl(c4('accidente'), 'accidente', 'accidentes') + ' en 4 semanas');
    I += p('inc', c4('incidente'), 10, 30, pl(c4('incidente'), 'casi accidente o daño', 'casi accidentes o daños') + ' en 4 semanas');
    I += p('abiertas', abiertasG, 4, 20, pl(abiertasG, 'acto o condición', 'actos o condiciones') + ' de riesgo grave sin levantar');
    I += p('vencidas', vencidas, 2, 10, pl(vencidas, 'sin levantar', 'sin levantar') + ' hace más de 7 días');
    I += p('suben', subenG, 8, 24, pl(subenG, 'tipo', 'tipos') + ' de riesgo grave en subida');
    I += p('equipos', noApto, 3, 12, pl(noApto, 'inspección o equipo observado', 'inspecciones o equipos observados') + ' en 4 semanas');
    I += p('hoy', hoyConAvisos, 10, 20, pl(hoyConAvisos, 'trabajo', 'trabajos') + ' de alto riesgo hoy donde ya hubo avisos');
    if(silencio) I += p('silencio', 1, 10, 10, 'Dos semanas sin un solo reporte, con gente trabajando');
    A.indice = Math.min(100, Math.round(I));
    A.nivel = A.indice >= 60 ? 'alto' : (A.indice >= 30 ? 'medio' : 'bajo');
    /* las alertas, cada una con de dónde sale */
    graves.forEach(function(c){
      if(c.sube) A.alertas.push({ nivel:'alto', ic:c.ic, txt:c.n + ': ' + pl(c.ult, 'aviso', 'avisos') + ' en las últimas 4 semanas (antes ' + c.ant + ').', k:c.k });
      if(c.vencidas) A.alertas.push({ nivel:'medio', ic:c.ic, txt:c.n + ': ' + c.vencidas + ' sin levantar hace más de 7 días.', k:c.k });
      if(c.hoy.length && (c.abiertas || c.inc || c.ult >= 2)) A.alertas.push({ nivel:'alto', ic:c.ic, txt:'Hoy hay ' + c.n.toLowerCase() + ' (' + c.hoy.map(function(x){ return x.texto; }).slice(0, 2).join('; ') + ') donde ya hubo avisos.', k:c.k });
    });
    if(silencio) A.alertas.push({ nivel:'medio', ic:'🤐', txt:'Dos semanas sin reportes de actos o condiciones, con gente trabajando: no es que no pase nada, es que nadie lo cuenta.', k:'' });
    if(A.piramide.accidentes && A.piramide.avisos + A.piramide.incidentes < 10 * A.piramide.accidentes)
      A.alertas.push({ nivel:'medio', ic:'🔺', txt:'Pocos avisos por cada accidente (' + (A.piramide.avisos + A.piramide.incidentes) + ' para ' + A.piramide.accidentes + '): lo de abajo de la pirámide se está quedando sin contar.', k:'' });
    /* los escenarios: los riesgos graves con señales, del más cargado al menos */
    graves.forEach(function(c){
      var pts = c.ult + 3 * c.inc + 6 * c.acc + 2 * c.vencidas + (c.sube ? 4 : 0) + (c.hoy.length ? 4 : 0);
      if(pts < 3 && !c.inc && !c.acc) return;
      var C = cat(c.k), por = [];
      por.push(pl(c.ult, 'aviso', 'avisos') + ' de ' + c.n.toLowerCase() + ' en 4 semanas' + (c.ant || c.sube ? ' (antes ' + c.ant + ')' : ''));
      if(c.inc) por.push(pl(c.inc, 'casi accidente', 'casi accidentes') + ' del mismo tipo: es lo que pasa justo antes');
      if(c.acc) por.push(pl(c.acc, 'accidente', 'accidentes') + ' del mismo tipo en 4 semanas');
      if(c.abiertas) por.push(c.abiertas + ' sin levantar' + (c.vencidas ? ' (' + c.vencidas + ' hace más de 7 días)' : ''));
      if(c.insp) por.push(pl(c.insp, 'inspección o equipo observado', 'inspecciones o equipos observados'));
      if(c.hoy.length) por.push('Hoy: ' + c.hoy.map(function(x){ return (x.de === 'petar' ? 'PETAR ' : 'ATS ') + '«' + x.texto + '»'; }).slice(0, 3).join(', '));
      A.escenarios.push({ k:c.k, ic:c.ic, titulo:C.esc, pasa:C.pasa, nivel:(pts >= 14 ? 'alto' : (pts >= 7 ? 'medio' : 'bajo')), pts:pts,
                          donde:c.lugares[0] || '', por:por, hacer:C.hacer.slice(), sim:C.sim });
    });
    A.escenarios.sort(function(x, y){ return y.pts - x.pts; });
    A.vacio = !D.eventos.length && !D.hoyTrabajo.length;
    /* 12/11/2026 · Orden 17 #4: lo que viene si sigue la tendencia actual (reglas transparentes, cero «IA») */
    A.proxima = [];
    A.cats.forEach(function(c){
      if(A.proxima.length >= 4) return;
      if(c.sube || (c.ult >= 2 && c.ult > c.ant)){
        A.proxima.push({ nivel:(c.grave && (c.abiertas || c.inc || c.acc) ? 'alto' : 'medio'), ic:c.ic,
          t:c.n + ' subió de ' + c.ant + ' a ' + c.ult + ' en 4 semanas' + (c.abiertas ? ' y deja ' + c.abiertas + ' sin levantar' : '') + ': si sigue así esta semana puede repetirse' + (c.lugares[0] ? ' en ' + c.lugares[0] : '') + '.' });
      } else if(c.grave && c.vencidas){
        A.proxima.push({ nivel:'medio', ic:c.ic,
          t:c.n + ': ' + pl(c.vencidas, 'aviso vencido', 'avisos vencidos') + ' de más de 7 días sin cerrar' + (c.hoy.length ? ' y trabajo activo hoy en el frente' : '') + '.' });
      }
    });
    if(silencio && A.proxima.length < 4){
      A.proxima.push({ nivel:'medio', ic:'🤐', t:'Dos semanas sin reportes con gente trabajando: conviene reactivar avisos de actos y condiciones esta semana.' });
    }
    return A;
  }
  function _lugares(evs){
    var n = {}; evs.forEach(function(e){ var l = String(e.lugar || '').trim(); if(l) n[l] = (n[l] || 0) + 1; });
    return Object.keys(n).sort(function(a, b){ return n[b] - n[a]; });
  }

  /* ── lo que se ve: el índice, las alertas, los escenarios, las tendencias y la pirámide ── */
  var NIV = { alto:{ c:'#D9261C', n:'Alto' }, medio:{ c:'#E8A000', n:'Medio' }, bajo:{ c:'#0B8A4B', n:'Bajo' } };
  function htmlAnticipar(A, o){
    o = o || {};
    var N = NIV[A.nivel], h = '';
    if(o.ejemplo) h += '<div class="rie-ej">Ejemplo: así se ve con registros inventados. Con los de tu obra, sale lo tuyo.</div>';
    h += '<div class="rie-cab"><div class="rie-gauge" style="--c:' + N.c + ';--p:' + A.indice + '"><b data-sin-trad>' + A.indice + '</b><small>de 100</small></div>' +
         '<div class="rie-cab-t"><span class="rie-niv" style="background:' + N.c + '">' + (A.nivel === 'alto' ? 'Riesgo alto' : (A.nivel === 'medio' ? 'Riesgo medio' : 'Riesgo bajo')) + '</span>' +
         '<p>' + (A.vacio ? 'Todavía no hay registros para medir: con los reportes, los casi accidentes y las inspecciones de tu obra, aquí sale lo que se viene armando.'
                : (A.nivel === 'alto' ? 'Hay escenarios armándose: revisa los de abajo hoy mismo.' : (A.nivel === 'medio' ? 'Hay señales que conviene atender esta semana.' : 'Sin señales fuertes en las últimas 4 semanas. Que se siga reportando.'))) + '</p>' +
         '<details class="rie-como"><summary>Cómo se calcula</summary><p>Suma de puntos de las últimas 4 semanas, cada cosa con su tope: accidentes (20 c/u, hasta 40), casi accidentes (10, hasta 30), actos y condiciones de riesgo grave sin levantar (4, hasta 20), los que pasan de 7 días (2, hasta 10), tipos de riesgo grave en subida (8, hasta 24), inspecciones y equipos observados (3, hasta 12), trabajo de alto riesgo hoy donde ya hubo avisos (10, hasta 20) y dos semanas sin reportes con gente trabajando (10). Hasta 29, bajo; de 30 a 59, medio; 60 o más, alto. No es una predicción segura: es una alerta para revisar.</p>' +
         (A.puntos.length ? '<ul>' + A.puntos.map(function(x){ return '<li><b data-sin-trad>+' + x.v + '</b> <span data-sin-trad>' + esc(x.txt) + '</span></li>'; }).join('') + '</ul>' : '') + '</details></div></div>';
    if(A.alertas.length){
      h += '<div class="rie-tit">Lo que está pasando</div><div class="rie-alertas">' + A.alertas.slice(0, 8).map(function(x){
        return '<div class="rie-al ' + x.nivel + '"><span aria-hidden="true">' + x.ic + '</span><span data-sin-trad>' + esc(x.txt) + '</span></div>'; }).join('') + '</div>';
    }
    if(A.proxima && A.proxima.length){
      h += '<div class="rie-tit">Si todo sigue igual · la semana que viene</div><div class="rie-sem" role="region" aria-label="Tendencia para la próxima semana">' +
        A.proxima.map(function(x){ return '<div class="rie-sem-f ' + x.nivel + '"><span aria-hidden="true">' + x.ic + '</span><span data-sin-trad>' + esc(x.t) + '</span></div>'; }).join('') +
        '<p class="rie-sub">Sale de comparar las últimas 4 semanas con las 4 anteriores y lo pendiente hoy.</p></div>';
    }
    h += '<div class="rie-tit">Escenarios que se están armando</div>';
    if(!A.escenarios.length) h += '<p class="rie-sub">Ninguno con señales: no hay avisos de riesgos graves que se repitan en las últimas semanas.</p>';
    A.escenarios.slice(0, 6).forEach(function(e, i){
      var n = NIV[e.nivel];
      h += '<div class="rie-esc" data-k="' + e.k + '"><div class="rie-esc-c"><span class="rie-esc-ic" aria-hidden="true">' + e.ic + '</span><div><b>' + esc(e.titulo) + '</b>' +
           (e.donde ? '<small data-sin-trad>' + esc(e.donde) + '</small>' : '') + '</div><span class="rie-niv chico" style="background:' + n.c + '">' + n.n + '</span></div>' +
           '<p class="rie-pasa">' + esc(e.pasa) + '</p>' +
           '<div class="rie-por"><i>Por qué</i><ul>' + e.por.map(function(x){ return '<li data-sin-trad>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
           '<div class="rie-hacer"><i>Qué hacer hoy</i><ul>' + e.hacer.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
           (o.simular ? '<button type="button" class="' + (o.btn || 'btn sec') + ' rie-simular" data-k="' + e.k + '" data-donde="' + esc(e.donde) + '">🎯 Simularlo</button>' : '') + '</div>';
    });
    h += '<div class="rie-tit">Las últimas 12 semanas</div>' + htmlTendencia(A);
    if(A.cats.length){
      h += '<div class="rie-tit">Por tipo de riesgo · últimas 4 semanas</div><div class="rie-tabla"><table><thead><tr><th>Riesgo</th><th>4 sem.</th><th>Antes</th><th>Casi acc.</th><th>Sin levantar</th></tr></thead><tbody>' +
        A.cats.map(function(c){ return '<tr' + (c.sube ? ' class="sube"' : '') + '><td><span aria-hidden="true">' + c.ic + '</span> <span>' + esc(c.n) + '</span>' + (c.sube ? ' <b class="rie-flecha" aria-label="sube">▲</b>' : '') + '</td><td data-sin-trad>' + c.ult + '</td><td data-sin-trad>' + c.ant +
          '</td><td data-sin-trad>' + c.inc + '</td><td data-sin-trad>' + c.abiertas + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }
    var P = A.piramide;
    h += '<div class="rie-tit">La pirámide · 12 semanas</div><div class="rie-pir">' +
         '<div style="--w:34%"><b data-sin-trad>' + P.accidentes + '</b><span>accidentes</span></div>' +
         '<div style="--w:58%"><b data-sin-trad>' + P.incidentes + '</b><span>casi accidentes y daños</span></div>' +
         '<div style="--w:82%"><b data-sin-trad>' + P.avisos + '</b><span>actos y condiciones reportados</span></div></div>' +
         '<p class="rie-sub">' + (P.accidentes ? '<span>Por cada accidente hubo</span> <span data-sin-trad>' + Math.round((P.avisos + P.incidentes) / P.accidentes) + '</span> <span>avisos antes. Mientras más se reporta abajo, menos llega arriba.</span>' : '<span>Sin accidentes en 12 semanas. Lo de abajo de la pirámide es lo que avisa a tiempo: que se siga reportando.</span>') + '</p>';
    return h;
  }
  /* las barras de cada semana: lo que avisa (actos, condiciones, inspecciones) y lo que ya pasó (casi accidentes y accidentes) */
  function htmlTendencia(A){
    var W = 640, H = 210, M = { l:34, r:10, t:12, b:34 }, n = A.semanas.length, bw = (W - M.l - M.r) / n;
    var av = A.semanas.map(function(_, i){ return A.series.acto[i] + A.series.condicion[i] + A.series.inspeccion[i]; });
    var pa = A.semanas.map(function(_, i){ return A.series.incidente[i] + A.series.accidente[i]; });
    var max = Math.max(4, Math.max.apply(null, av.map(function(x, i){ return x + pa[i]; })));
    var paso = max <= 8 ? 2 : (max <= 20 ? 5 : (max <= 50 ? 10 : 25)); max = Math.ceil(max / paso) * paso;
    var y = function(v){ return M.t + (H - M.t - M.b) * (1 - v / max); };
    var s = '<svg class="rie-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Avisos y eventos por semana">';
    for(var g = 0; g <= max; g += paso) s += '<line x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + y(g) + '" y2="' + y(g) + '" class="rie-g"/><text x="' + (M.l - 6) + '" y="' + (y(g) + 4) + '" text-anchor="end" class="rie-t">' + g + '</text>';
    A.semanas.forEach(function(sem, i){
      var x = M.l + i * bw + bw * 0.18, w = bw * 0.64, y1 = y(av[i]), y2 = y(av[i] + pa[i]);
      if(av[i]) s += '<rect x="' + x.toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (y(0) - y1).toFixed(1) + '" rx="3" class="rie-b1"><title>' + dm(sem) + ': ' + av[i] + ' avisos</title></rect>';
      if(pa[i]) s += '<rect x="' + x.toFixed(1) + '" y="' + y2.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (y1 - y2 - (av[i] ? 2 : 0)).toFixed(1) + '" rx="3" class="rie-b2"><title>' + dm(sem) + ': ' + pa[i] + ' casi accidentes o accidentes</title></rect>';
      if(i % 2 === n % 2 || i === n - 1) s += '<text x="' + (M.l + i * bw + bw / 2).toFixed(1) + '" y="' + (H - 14) + '" text-anchor="middle" class="rie-t">' + dm(sem) + '</text>';
    });
    s += '</svg>';
    return '<div class="rie-chart">' + s + '<div class="rie-ley"><span><i class="rie-b1"></i><span>Actos, condiciones e inspecciones observadas</span></span><span><i class="rie-b2"></i><span>Casi accidentes y accidentes</span></span><span class="rie-sub">Semanas desde el lunes</span></div></div>';
  }

  /* ══ EL MAPA ══════════════════════════════════════════════════════
     Cada punto con su latitud y longitud. Se proyecta en metros alrededor del centro (a esta escala, una obra, la Tierra
     es plana) y se dibuja con la cuadrícula, la escala y el norte. */
  var MARCAS = [
    { k:'altura',    n:'Caída de altura',          f:'p', ic:'🪜' }, { k:'electrico', n:'Riesgo eléctrico', f:'p', ic:'⚡' },
    { k:'izaje',     n:'Izaje / carga suspendida',  f:'p', ic:'🏗️' }, { k:'excavacion', n:'Excavación / zanja', f:'p', ic:'⛏️' },
    { k:'caliente',  n:'Trabajo en caliente',       f:'p', ic:'🔥' }, { k:'confinado', n:'Espacio confinado', f:'p', ic:'🕳️' },
    { k:'vehiculos', n:'Tránsito de vehículos',     f:'p', ic:'🚜' }, { k:'quimicos', n:'Productos químicos', f:'p', ic:'🧪' },
    { k:'ruido',     n:'Ruido',                     f:'o', ic:'🎧' }, { k:'epp', n:'Uso obligatorio de EPP', f:'o', ic:'🦺' },
    { k:'reunion',   n:'Punto de reunión',          f:'e', ic:'🟩' }, { k:'salida', n:'Salida / ruta de evacuación', f:'e', ic:'🏃' },
    { k:'botiquin',  n:'Botiquín',                  f:'e', ic:'⛑️' }, { k:'camilla', n:'Camilla', f:'e', ic:'🛏️' },
    { k:'lavaojos',  n:'Lavaojos / ducha',          f:'e', ic:'🚿' }, { k:'extintor', n:'Extintor', f:'x', ic:'🧯' },
    { k:'otro',      n:'Otro peligro',              f:'p', ic:'⚠️' }
  ];
  var MPOR = {}; MARCAS.forEach(function(m){ MPOR[m.k] = m; });
  function marca(k){ return MPOR[k] || MPOR.otro; }
  /* las formas de la señalética (NTP 399.010-1): advertencia, triángulo amarillo; obligación, círculo azul; emergencia,
     cuadrado verde; contra incendios, cuadrado rojo */
  var FORMA = { p:{ fill:'#FFD100', stroke:'#111' }, o:{ fill:'#005AA9', stroke:'#fff' }, e:{ fill:'#009639', stroke:'#fff' }, x:{ fill:'#D52B1E', stroke:'#fff' } };
  var NIVM = { bajo:'#0B8A4B', medio:'#E8A000', alto:'#D9261C', critico:'#7A0B0B' };
  function gpsLimpio(lat, lng){ lat = +lat; lng = +lng; if(!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || (lat === 0 && lng === 0)) return null; return { lat:Math.round(lat * 1e6) / 1e6, lng:Math.round(lng * 1e6) / 1e6 }; }
  function gpsDeTexto(s){ var m = /(-?\d{1,2}(?:\.\d+)?)\s*[,;]?\s+(-?\d{1,3}(?:\.\d+)?)|(-?\d{1,2}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)/.exec(String(s || '').trim()); return m ? gpsLimpio(m[1] || m[3], m[2] || m[4]) : null; }
  function distM(a, b){
    var R = 6371000, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  function enlaces(p){ var q = p.lat + ',' + p.lng; return { google:'https://www.google.com/maps?q=' + q, osm:'https://www.openstreetmap.org/?mlat=' + p.lat + '&mlon=' + p.lng + '#map=19/' + q.replace(',', '/') }; }
  /* los puntos del mapa: los frentes (con su radio) y las marcas */
  function puntosMapa(frentes, marcas){
    var P = [];
    (frentes || []).forEach(function(f){ var g = f.gps && gpsLimpio(f.gps.lat, f.gps.lng); if(g) P.push({ id:'f:' + (f.id || f.n), es:'frente', n:f.n, lat:g.lat, lng:g.lng, r:Math.max(20, Math.min(2000, +f.gps.r || 80)), punto:f.punto || '' }); });
    (marcas || []).forEach(function(m){ var g = gpsLimpio(m.lat, m.lng); if(g) P.push({ id:m.id, es:'marca', k:m.k, n:m.n || marca(m.k).n, nota:m.nota || '', nivel:m.nivel || '', lat:g.lat, lng:g.lng, frente:m.frente || '', t:m.t || 0, por:m.por || '' }); });
    return P;
  }
  function proyectar(P){
    if(!P.length) return null;
    var lat0 = P.reduce(function(s, p){ return s + p.lat; }, 0) / P.length, lng0 = P.reduce(function(s, p){ return s + p.lng; }, 0) / P.length;
    var kx = 111320 * Math.cos(lat0 * Math.PI / 180), ky = 110540;
    var xy = P.map(function(p){ return { x:(p.lng - lng0) * kx, y:(p.lat - lat0) * ky, r:(p.r || 0) }; });
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    xy.forEach(function(q){ x0 = Math.min(x0, q.x - q.r); x1 = Math.max(x1, q.x + q.r); y0 = Math.min(y0, q.y - q.r); y1 = Math.max(y1, q.y + q.r); });
    var lado = Math.max(60, x1 - x0, y1 - y0) * 1.25, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return { lat0:lat0, lng0:lng0, kx:kx, ky:ky, x0:cx - lado / 2, y0:cy - lado / 2, lado:lado, xy:xy };
  }
  /* el dibujo: un cuadrado de T px; el norte arriba */
  function svgMapa(P, o){
    o = o || {}; var T = o.tam || 640, J = proyectar(P);
    var s = '<svg class="rie-mapa" viewBox="0 0 ' + T + ' ' + T + '" role="img" aria-label="Mapa de riesgos de la obra" data-lat0="' + (J ? J.lat0 : '') + '" data-lng0="' + (J ? J.lng0 : '') + '"' +
            (J ? ' data-x0="' + J.x0 + '" data-y0="' + J.y0 + '" data-lado="' + J.lado + '" data-kx="' + J.kx + '" data-ky="' + J.ky + '"' : '') + '>';
    s += '<rect x="0" y="0" width="' + T + '" height="' + T + '" class="rie-fondo"/>';
    if(!J){ return s + '<text x="' + T / 2 + '" y="' + T / 2 + '" text-anchor="middle" class="rie-t">Todavía no hay puntos con coordenadas</text></svg>'; }
    var esc_ = T / J.lado, X = function(x){ return (x - J.x0) * esc_; }, Y = function(y){ return T - (y - J.y0) * esc_; };
    /* la cuadrícula: un paso «redondo» en metros */
    var pasos = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000], paso = pasos.filter(function(v){ return J.lado / v <= 9; })[0] || 10000;
    for(var gx = Math.ceil(J.x0 / paso) * paso; gx <= J.x0 + J.lado; gx += paso) s += '<line x1="' + X(gx).toFixed(1) + '" x2="' + X(gx).toFixed(1) + '" y1="0" y2="' + T + '" class="rie-g"/>';
    for(var gy = Math.ceil(J.y0 / paso) * paso; gy <= J.y0 + J.lado; gy += paso) s += '<line y1="' + Y(gy).toFixed(1) + '" y2="' + Y(gy).toFixed(1) + '" x1="0" x2="' + T + '" class="rie-g"/>';
    /* los frentes: su radio */
    P.forEach(function(p, i){
      if(p.es !== 'frente') return;
      var q = J.xy[i], col = (o.nivelFrente && o.nivelFrente[p.n]) ? NIVM[o.nivelFrente[p.n]] : '#00599E';
      s += '<g class="rie-fre" data-id="' + esc(p.id) + '"><circle cx="' + X(q.x).toFixed(1) + '" cy="' + Y(q.y).toFixed(1) + '" r="' + Math.max(6, q.r * esc_).toFixed(1) + '" fill="' + col + '" fill-opacity=".10" stroke="' + col + '" stroke-width="2" stroke-dasharray="6 4"/>' +
           '<text x="' + X(q.x).toFixed(1) + '" y="' + (Y(q.y) - Math.max(6, q.r * esc_) - 6).toFixed(1) + '" text-anchor="middle" class="rie-fre-t">' + esc(p.n) + '</text></g>';
    });
    /* las marcas, con su forma de señal */
    P.forEach(function(p, i){
      if(p.es !== 'marca') return;
      var q = J.xy[i], m = marca(p.k), F = FORMA[m.f], x = X(q.x), y = Y(q.y), k = 13, sel = (o.sel === p.id);
      var forma = m.f === 'p' ? '<path d="M' + x.toFixed(1) + ' ' + (y - k).toFixed(1) + ' L' + (x + k * 1.1).toFixed(1) + ' ' + (y + k * 0.8).toFixed(1) + ' L' + (x - k * 1.1).toFixed(1) + ' ' + (y + k * 0.8).toFixed(1) + ' Z" fill="' + F.fill + '" stroke="' + F.stroke + '" stroke-width="2" stroke-linejoin="round"/>'
              : (m.f === 'o' ? '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + k + '" fill="' + F.fill + '" stroke="' + F.stroke + '" stroke-width="2"/>'
              : '<rect x="' + (x - k).toFixed(1) + '" y="' + (y - k).toFixed(1) + '" width="' + 2 * k + '" height="' + 2 * k + '" rx="3" fill="' + F.fill + '" stroke="' + F.stroke + '" stroke-width="2"/>');
      var halo = (p.nivel && NIVM[p.nivel]) ? '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (k + 7) + '" fill="none" stroke="' + NIVM[p.nivel] + '" stroke-width="3" opacity=".9"/>' : '';
      s += '<g class="rie-m' + (sel ? ' sel' : '') + '" data-id="' + esc(p.id) + '" tabindex="0" role="button" aria-label="' + esc(p.n) + '">' + halo + forma +
           '<text x="' + x.toFixed(1) + '" y="' + (y + (m.f === 'p' ? 5 : 5)).toFixed(1) + '" text-anchor="middle" class="rie-m-ic">' + m.ic + '</text>' +
           (o.nombres ? '<text x="' + (x + k + 5).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" class="rie-m-t">' + esc(p.n) + '</text>' : '') + '</g>';
    });
    /* la escala y el norte */
    var eb = paso * esc_;
    s += '<g class="rie-esc"><rect x="12" y="' + (T - 34) + '" width="' + (eb + 54).toFixed(1) + '" height="24" rx="5" class="rie-esc-f"/><line x1="18" x2="' + (18 + eb).toFixed(1) + '" y1="' + (T - 22) + '" y2="' + (T - 22) + '" stroke-width="3" class="rie-esc-l"/>' +
         '<text x="' + (24 + eb).toFixed(1) + '" y="' + (T - 17) + '" class="rie-t">' + paso + ' m</text></g>';
    s += '<g class="rie-norte" transform="translate(' + (T - 30) + ' 34)"><circle r="18" class="rie-esc-f"/><path d="M0 -13 L7 7 L0 3 L-7 7 Z" class="rie-norte-f"/><text y="-21" text-anchor="middle" class="rie-t">N</text></g>';
    return s + '</svg>';
  }
  /* de un toque en el dibujo (px) a latitud y longitud */
  function aGps(svg, px, py){
    var d = svg && svg.dataset; if(!d || !d.lado) return null;
    var T = svg.viewBox.baseVal.width, x = +d.x0 + px / T * +d.lado, y = +d.y0 + (T - py) / T * +d.lado;
    return gpsLimpio(+d.lat0 + y / +d.ky, +d.lng0 + x / +d.kx);
  }
  function leyenda(P){
    var usados = {}; P.forEach(function(p){ if(p.es === 'marca') usados[p.k] = 1; });
    var L = MARCAS.filter(function(m){ return usados[m.k]; });
    return '<div class="rie-leyenda">' + (P.some(function(p){ return p.es === 'frente'; }) ? '<span><i class="rie-ley-fre"></i><span>Frente (su radio)</span></span>' : '') +
      L.map(function(m){ return '<span><i class="rie-ley-' + m.f + '">' + m.ic + '</i><span>' + esc(m.n) + '</span></span>'; }).join('') + '</div>';
  }

  /* ══ EL SIMULADOR ═════════════════════════════════════════════════
     Un escenario en un lugar: qué puede pasar, qué tan cerca está hoy, quién responde, lo de emergencia más cercano y los
     pasos con su tiempo. Los tiempos son los objetivos de un simulacro, no una norma. */
  var PASOS = {
    comun:[ { t:'Dar la alarma y parar los trabajos alrededor', s:60 }, { t:'Avisar a la brigada y al responsable del frente', s:120 } ],
    altura:[ { t:'Rescate del suspendido con el equipo de rescate (sin subir solo)', s:600 }, { t:'Primeros auxilios: no mover la columna si se sospecha lesión', s:180 } ],
    confinado:[ { t:'Nadie entra sin equipo: ventilar y medir el aire', s:300 }, { t:'Rescate con arnés, trípode y vigía', s:600 } ],
    incendio:[ { t:'Cortar la energía y el gas del área', s:60 }, { t:'Usar el extintor solo si el fuego es chico; si no, evacuar', s:120 }, { t:'Evacuar por la ruta sin humo al punto de reunión', s:240 } ],
    derrame:[ { t:'Aislar la zona y leer la hoja MSDS', s:120 }, { t:'Contener con el kit antiderrame (antes que limpiar)', s:300 } ],
    colapso:[ { t:'Aislar la zona: nadie entra hasta estabilizar', s:180 }, { t:'Rescate con apuntalamiento o con la grúa, si se puede', s:900 } ],
    medica:[ { t:'Primeros auxilios: consciencia, respiración y hemorragias', s:180 }, { t:'Si es eléctrico: cortar la energía antes de tocarlo', s:60 } ],
    fin:[ { t:'Traslado: ambulancia o la clínica del SCTR, con su documento', s:900 }, { t:'Contar a la gente en el punto de reunión', s:240 }, { t:'Registrar el evento y empezar la investigación', s:0 } ]
  };
  var MASCERCA = ['reunion', 'extintor', 'botiquin', 'camilla', 'lavaojos', 'salida'];
  function simular(k, lugar, A, puntos){
    var C = cat(k), sim = C.sim || 'medica';
    var c = A && A.cats ? A.cats.filter(function(x){ return x.k === k; })[0] : null;
    var e = A && A.escenarios ? A.escenarios.filter(function(x){ return x.k === k; })[0] : null;
    var donde = (lugar && lugar.lat != null) ? lugar : null;
    var cerca = [];
    if(donde && puntos) MASCERCA.forEach(function(t){
      var mejor = null;
      puntos.forEach(function(p){ if(p.es === 'marca' && p.k === t){ var d = distM(donde, p); if(!mejor || d < mejor.d) mejor = { p:p, d:d }; } });
      cerca.push({ k:t, n:marca(t).n, ic:marca(t).ic, d:mejor ? Math.round(mejor.d) : null, p:mejor ? mejor.p : null });
    });
    var pasos = PASOS.comun.concat(PASOS[sim] || PASOS.medica, PASOS.fin).map(function(p){ return { t:p.t, s:p.s }; });
    return { k:k, ic:C.ic, titulo:C.esc, pasa:C.pasa, hacer:C.hacer.slice(), sim:sim, lugar:lugar || null,
             nivel:e ? e.nivel : (c && (c.ult || c.inc) ? 'bajo' : ''), por:e ? e.por : (c ? [pl(c.ult, 'aviso', 'avisos') + ' de ' + C.n.toLowerCase() + ' en 4 semanas'] : ['Sin avisos de este tipo en las últimas 4 semanas']),
             cerca:cerca, pasos:pasos, meta:pasos.reduce(function(s, p){ return s + p.s; }, 0) };
  }
  function reloj(seg){ seg = Math.max(0, Math.round(seg || 0)); var m = Math.floor(seg / 60), s = seg % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function htmlSimulacion(S, o){
    o = o || {};
    var N = NIV[S.nivel] || null, h = '';
    h += '<div class="rie-sim-cab"><span class="rie-esc-ic" aria-hidden="true">' + S.ic + '</span><div><b>' + esc(S.titulo) + '</b>' +
         (S.lugar ? '<small data-sin-trad>' + esc(S.lugar.n || '') + (S.lugar.lat != null ? ' · ' + S.lugar.lat + ', ' + S.lugar.lng : '') + '</small>' : '') + '</div>' +
         (N ? '<span class="rie-niv chico" style="background:' + N.c + '">' + N.n + '</span>' : '') + '</div>';
    h += '<div class="rie-sim-b"><i>Lo que puede pasar</i><p>' + esc(S.pasa) + '</p></div>';
    h += '<div class="rie-sim-b"><i>Qué tan cerca está hoy</i><ul>' + S.por.map(function(x){ return '<li data-sin-trad>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    if(S.cerca.length){
      h += '<div class="rie-sim-b"><i>Lo de emergencia más cercano</i><div class="rie-cerca">' + S.cerca.map(function(c){
        return '<div class="' + (c.d == null ? 'falta' : '') + '"><span aria-hidden="true">' + c.ic + '</span><b>' + esc(c.n) + '</b><small data-sin-trad>' + (c.d == null ? 'no está marcado en el mapa' : 'a ' + c.d + ' m') + '</small></div>'; }).join('') + '</div></div>';
    }
    h += '<div class="rie-sim-b"><i>Los pasos y su tiempo objetivo</i><ol class="rie-pasos">' + S.pasos.map(function(p, i){
      return '<li data-i="' + i + '"><span>' + esc(p.t) + '</span>' + (p.s ? '<small data-sin-trad>' + reloj(p.s) + '</small>' : '') + '</li>'; }).join('') + '</ol>' +
      '<p class="rie-sub">Los tiempos son los objetivos del ensayo, no una norma: se ajustan a tu obra.</p></div>';
    h += '<div class="rie-sim-b"><i>Para que no pase</i><ul>' + S.hacer.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    return h;
  }

  /* ── un ejemplo para la pantalla vacía (se dice que es ejemplo) ── */
  function ejemplo(hoy){
    var h = dia(hoy), f = function(n){ return iso(h - n); };
    var R = { hoy:hoy, reportes:[], accidentes:[], inspecciones:[], ats:[], petar:[], hht:[] };
    var alt = ['Andamio sin rodapié en el eje 4', 'Trabajador sin anclar su arnés en el borde de losa', 'Baranda suelta en la escalera del piso 3', 'Línea de vida sin tensar en el techo', 'Escalera de mano con un peldaño roto'];
    alt.forEach(function(t, i){ R.reportes.push({ fecha:f(2 + i * 4), clase:(i % 2 ? 'acto' : 'condicion'), descripcion:t + ' (ejemplo)', lugar:'Torre A', estado:(i < 3 ? 'abierto' : 'cerrado') }); });
    R.reportes.push({ fecha:f(40), clase:'condicion', descripcion:'Andamio sin baranda (ejemplo)', lugar:'Torre A', estado:'cerrado' });
    R.reportes.push({ fecha:f(5), clase:'condicion', descripcion:'Extensión eléctrica con empalme sin aislar (ejemplo)', lugar:'Sótano', estado:'abierto' });
    R.reportes.push({ fecha:f(20), clase:'acto', descripcion:'Sin lentes al esmerilar (ejemplo)', lugar:'Taller', estado:'cerrado' });
    R.reportes.push({ fecha:f(12), clase:'condicion', descripcion:'Clavos en el pasadizo (ejemplo)', lugar:'Torre B', estado:'cerrado' });
    R.accidentes.push({ fecha:f(9), clase:'casi', descripcion:'Cayó una herramienta desde el piso 5 (ejemplo)', agente:'Caída de objetos', lugar:'Torre A' });
    R.accidentes.push({ fecha:f(6), clase:'casi', descripcion:'Resbaló en el andamio y se sostuvo de la baranda (ejemplo)', agente:'Caída a distinto nivel', lugar:'Torre A' });
    R.inspecciones.push({ fecha:f(3), resultado:'observado', texto:'Arnés con costuras gastadas (ejemplo)' });
    R.ats.push({ fecha:hoy, trabajo:'Encofrado del techo del piso 6 (ejemplo)', texto:'Trabajo en altura con andamio' });
    for(var i = 0; i < 14; i++) R.hht.push({ fecha:f(i), horas:400 });
    return R;
  }

  /* ══ LA PANTALLA (la misma en la app y en la web) ═══════════════════
     host = { hoy(), traer() → Promise<R>, marcas:{ leer() → Promise<[...]>, poner(m) → Promise, quitar(id) → Promise },
              ensayos:{ leer() → Promise<[...]>, poner(e) → Promise }, puedeEditar, gpsAhora() → Promise<{lat,lng,acc}> (solo el
              celular), simulacro(S) (la app: lo programa como simulacro), bajar(blob, nombre), toast(t), btn, btnSec, quien } */
  function estilos(){
    if(typeof document === 'undefined' || document.getElementById('rie-css')) return;
    var st = document.createElement('style'); st.id = 'rie-css';
    st.textContent = [
      '.rie{--rie-l:rgba(127,127,127,.22);--rie-f:rgba(127,127,127,.08);--rie-rojo:#D9261C;--rie-ambar:#E8A000;--rie-verde:#0B8A4B;font-size:15px;line-height:1.45}',
      '.rie-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 14px}.rie-tab{border:0;border-radius:999px;padding:9px 14px;font:inherit;font-weight:700;cursor:pointer;background:var(--rie-f);color:inherit;box-shadow:inset 0 0 0 1px var(--rie-l)}',
      '.rie-tab.on{background:#0B2A3A;color:#FCDB00;box-shadow:none}.rie-tab:focus-visible,.rie button:focus-visible,.rie-m:focus-visible{outline:3px solid #FCDB00;outline-offset:2px}',
      '.rie-ej{margin:0 0 12px;padding:9px 12px;border-radius:10px;background:rgba(232,160,0,.14);box-shadow:inset 0 0 0 1px rgba(232,160,0,.5);font-size:13.5px;font-weight:600}',
      '.rie-cab{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;padding:14px;border-radius:16px;background:var(--rie-f);box-shadow:inset 0 0 0 1px var(--rie-l)}',
      '.rie-gauge{--p:0;flex:0 0 auto;width:104px;height:104px;border-radius:50%;display:grid;place-items:center;align-content:center;background:conic-gradient(var(--c) calc(var(--p)*1%),var(--rie-l) 0);position:relative}',
      '.rie-gauge::before{content:"";position:absolute;inset:11px;border-radius:50%;background:var(--rie-fondo,#fff)}.rie-gauge b,.rie-gauge small{position:relative}.rie-gauge b{font-size:30px;line-height:1;font-variant-numeric:tabular-nums}.rie-gauge small{font-size:11.5px;opacity:.75}',
      '.rie-cab-t{flex:1 1 220px;min-width:0}.rie-cab-t p{margin:8px 0 6px}',
      '.rie-niv{display:inline-block;color:#fff;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;letter-spacing:.02em}.rie-niv.chico{font-size:11.5px;padding:3px 8px;flex:0 0 auto}',
      '.rie-como summary{cursor:pointer;font-size:13px;font-weight:700;opacity:.85}.rie-como p,.rie-como li{font-size:12.5px;opacity:.9}.rie-como ul{margin:6px 0 0;padding-left:18px}',
      '.rie-tit{margin:20px 0 8px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.8}',
      '.rie-sub{font-size:12.5px;opacity:.78;margin:6px 0 0}',
      '.rie-alertas{display:grid;gap:7px}.rie-al{display:flex;gap:9px;align-items:flex-start;padding:9px 12px;border-radius:12px;background:var(--rie-f);box-shadow:inset 3px 0 0 var(--rie-ambar);font-size:14px}.rie-al.alto{box-shadow:inset 3px 0 0 var(--rie-rojo)}',
      '.rie-sem{display:grid;gap:7px}.rie-sem-f{display:flex;gap:9px;align-items:flex-start;padding:9px 12px;border-radius:12px;background:var(--rie-f);box-shadow:inset 3px 0 0 #2F7FC1;font-size:14px}.rie-sem-f.alto{box-shadow:inset 3px 0 0 var(--rie-rojo)}',
      '.rie-esc{padding:13px 14px;border-radius:14px;background:var(--rie-f);box-shadow:inset 0 0 0 1px var(--rie-l);margin:0 0 10px}',
      '.rie-esc-c,.rie-sim-cab{display:flex;gap:10px;align-items:center}.rie-esc-c>div,.rie-sim-cab>div{flex:1;min-width:0}.rie-esc-c b,.rie-sim-cab b{display:block;font-size:16px}.rie-esc-c small,.rie-sim-cab small{display:block;font-size:12.5px;opacity:.75}',
      '.rie-esc-ic{font-size:26px;line-height:1}.rie-pasa{margin:8px 0;font-size:14px}',
      '.rie-por i,.rie-hacer i,.rie-sim-b>i{display:block;font-style:normal;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.72;margin:8px 0 2px}',
      '.rie-por ul,.rie-hacer ul,.rie-sim-b ul{margin:0;padding-left:18px;font-size:14px}.rie-hacer li::marker{content:"✓  "}',
      '.rie-simular{margin:10px 0 0!important;width:auto!important}',
      '.rie-chart{padding:10px;border-radius:14px;background:var(--rie-f);box-shadow:inset 0 0 0 1px var(--rie-l)}.rie-svg{display:block;width:100%;height:auto}',
      '.rie-g{stroke:var(--rie-l);stroke-width:1}.rie-t{fill:currentColor;opacity:.72;font-size:11px;font-variant-numeric:tabular-nums}',
      '.rie-b1{fill:#2F7FC1}.rie-b2{fill:#D9261C}.rie-ley{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:12.5px}.rie-ley i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:5px;vertical-align:-1px}.rie-ley i.rie-b1{background:#2F7FC1}.rie-ley i.rie-b2{background:#D9261C}',
      '.rie-tabla{overflow-x:auto;border-radius:12px;box-shadow:inset 0 0 0 1px var(--rie-l)}.rie-tabla table{width:100%;border-collapse:collapse;font-size:13.5px}.rie-tabla th,.rie-tabla td{padding:7px 9px;text-align:left;border-bottom:1px solid var(--rie-l);white-space:nowrap}.rie-tabla td+td,.rie-tabla th+th{text-align:right;font-variant-numeric:tabular-nums}.rie-tabla tr.sube td:first-child{font-weight:700}.rie-flecha{color:var(--rie-rojo)}',
      '.rie-pir{display:grid;gap:5px;justify-items:center;margin:4px 0}.rie-pir>div{width:var(--w);min-width:150px;max-width:100%;display:flex;gap:8px;align-items:baseline;justify-content:center;padding:7px 10px;border-radius:8px;background:var(--rie-f);box-shadow:inset 0 0 0 1px var(--rie-l);font-size:13px}',
      '.rie-pir>div:first-child{box-shadow:inset 0 0 0 1.5px var(--rie-rojo)}.rie-pir b{font-size:18px;font-variant-numeric:tabular-nums}',
      '.rie-mapa{display:block;width:100%;height:auto;max-width:720px;border-radius:14px;touch-action:manipulation;cursor:crosshair}.rie-fondo{fill:var(--rie-f);stroke:var(--rie-l)}',
      '.rie-fre-t{font-size:12.5px;font-weight:700;fill:currentColor}.rie-m{cursor:pointer}.rie-m-ic{font-size:13px}.rie-m.sel path,.rie-m.sel circle,.rie-m.sel rect{stroke:#FCDB00;stroke-width:3.5}.rie-m-t{font-size:11.5px;fill:currentColor}',
      '.rie-esc-f{fill:var(--rie-fondo,#fff);opacity:.92}.rie-esc-l{stroke:currentColor}.rie-norte-f{fill:#D9261C}',
      '.rie-leyenda{display:flex;flex-wrap:wrap;gap:6px 14px;margin:10px 0 0;font-size:12.5px}.rie-leyenda i{display:inline-grid;place-items:center;width:20px;height:20px;margin-right:5px;font-style:normal;font-size:12px;vertical-align:middle}',
      '.rie-ley-p{background:#FFD100;clip-path:polygon(50% 4%,100% 96%,0 96%)}.rie-ley-o{background:#005AA9;border-radius:50%}.rie-ley-e{background:#009639;border-radius:4px}.rie-ley-x{background:#D52B1E;border-radius:4px}.rie-ley-fre{border:2px dashed #00599E;border-radius:50%}',
      '.rie-acc{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0}.rie-acc>*{width:auto!important;margin:0!important}',
      '.rie-panel{margin:12px 0 0;padding:13px 14px;border-radius:14px;background:var(--rie-f);box-shadow:inset 0 0 0 1px var(--rie-l)}.rie-panel label{display:block;margin:10px 0 4px;font-size:13px;font-weight:700}',
      '.rie-panel select,.rie-panel input,.rie-panel textarea{width:100%;box-sizing:border-box;font:inherit;padding:9px 10px;border-radius:10px;border:1px solid var(--rie-l);background:var(--rie-fondo,#fff);color:inherit}',
      '.rie-lista{display:grid;gap:6px;margin:10px 0 0}.rie-pt{display:flex;gap:10px;align-items:center;width:100%;text-align:left;padding:9px 11px;border:0;border-radius:12px;font:inherit;color:inherit;cursor:pointer;background:var(--rie-f);box-shadow:inset 0 0 0 1px var(--rie-l)}.rie-pt>span:nth-child(2){flex:1;min-width:0}.rie-pt small{display:block;opacity:.72;font-size:12px}',
      '.rie-cerca{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:7px}.rie-cerca>div{display:grid;grid-template-columns:auto 1fr;gap:0 7px;padding:8px 10px;border-radius:10px;background:var(--rie-f)}.rie-cerca>div>span{grid-row:span 2;font-size:20px}.rie-cerca small{opacity:.75}.rie-cerca .falta{opacity:.6}',
      '.rie-pasos{margin:0;padding-left:22px}.rie-pasos li{display:list-item;padding:5px 0;border-bottom:1px solid var(--rie-l)}.rie-pasos li>span{display:inline}.rie-pasos li>small{float:right;font-variant-numeric:tabular-nums;opacity:.8}',
      '.rie-pasos li.hecho{opacity:.6}.rie-pasos li.tarde>small{color:var(--rie-rojo);opacity:1;font-weight:700}.rie-pasos li.ahora{font-weight:700}',
      '.rie-reloj{font-size:44px;font-weight:800;text-align:center;font-variant-numeric:tabular-nums;margin:6px 0}.rie-reloj.tarde{color:var(--rie-rojo)}',
      '.rie-sim-b{margin:10px 0 0}.rie-sim-b p{margin:2px 0}',
      '@media (prefers-reduced-motion:reduce){.rie *{transition:none!important;animation:none!important}}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  function montar(caja, host){
    if(!caja) return;
    estilos();
    var Z = { tab:'anticipar', R:null, D:null, A:null, marcas:[], ensayos:[], sel:null, nueva:null, simK:'', simLugar:'', S:null, run:null, ej:false, cargando:true, error:'' };
    var B = host.btn || 'btn', BS = host.btnSec || 'btn sec', hoy = host.hoy();
    caja.classList.add('rie'); try{ caja.style.setProperty('--rie-fondo', host.fondo || '#fff'); }catch(_f){}
    function puntos(){ return puntosMapa(Z.D ? Z.D.frentes : [], Z.marcas); }
    function pintar(){
      var h = '<div class="rie-tabs" role="tablist">' + [['anticipar', '📈 Anticipar'], ['mapa', '🗺️ Mapa de riesgos'], ['simulador', '🎯 Simulador']].map(function(t){
        return '<button type="button" role="tab" class="rie-tab' + (Z.tab === t[0] ? ' on' : '') + '" aria-selected="' + (Z.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
      if(Z.cargando) h += '<p class="rie-sub">Cargando los registros de la obra…</p>';
      else if(Z.error) h += '<p class="rie-sub">' + esc(Z.error) + '</p>';
      else if(Z.tab === 'anticipar') h += htmlAnticipar(Z.A, { ejemplo:Z.ej, simular:true, btn:BS });
      else if(Z.tab === 'mapa') h += pintarMapa();
      else h += pintarSimulador();
      caja.innerHTML = h;
      atar();
    }
    /* ── el mapa ── */
    function pintarMapa(){
      var P = puntos(), h = '';
      var nivF = {};   /* el color de cada frente: el nivel más alto de sus puntos */
      Z.marcas.forEach(function(m){ var f = m.frente; if(!f || !m.nivel) return; var o = ['bajo', 'medio', 'alto', 'critico']; if(o.indexOf(m.nivel) > o.indexOf(nivF[f] || 'bajo') || !nivF[f]) nivF[f] = m.nivel; });
      h += '<p class="rie-sub" style="margin:0 0 10px">Cada punto con sus coordenadas: los frentes con su radio, los peligros con su nivel y lo de emergencia. ' +
           (host.gpsAhora ? 'En la obra, «📍 Marcar dónde estoy» toma las del celular.' : 'Se pegan de Google Maps (clic derecho en el lugar) o se toca el mapa.') + '</p>';
      h += svgMapa(P, { tam:640, sel:Z.sel, nivelFrente:nivF });
      h += leyenda(P);
      if(host.puedeEditar){
        h += '<div class="rie-acc">' + (host.gpsAhora ? '<button type="button" class="' + B + '" data-acc="gps">📍 Marcar dónde estoy</button>' : '') +
             '<button type="button" class="' + (host.gpsAhora ? BS : B) + '" data-acc="nueva">＋ Marcar un punto</button>' +
             (P.length ? '<button type="button" class="' + BS + '" data-acc="png">🖼️ Bajar el mapa</button>' : '') + '</div>';
      } else if(P.length) h += '<div class="rie-acc"><button type="button" class="' + BS + '" data-acc="png">🖼️ Bajar el mapa</button></div>';
      if(Z.nueva) h += formNueva();
      var s = Z.sel ? P.filter(function(p){ return p.id === Z.sel; })[0] : null;
      if(s) h += panelPunto(s);
      var M = P.filter(function(p){ return p.es === 'marca'; });
      h += '<div class="rie-tit"><span>Los puntos</span> · <span data-sin-trad>' + M.length + '</span></div>';
      if(!M.length) h += '<p class="rie-sub">' + (Z.D && Z.D.frentes.some(function(f){ return f.gps; }) ? 'Todavía no hay puntos marcados.' : 'Todavía no hay puntos marcados. Tampoco hay frentes con su GPS: se ponen en «Frentes de trabajo».') + '</p>';
      h += '<div class="rie-lista">' + M.map(function(p){ var m = marca(p.k); return '<button type="button" class="rie-pt" data-pt="' + esc(p.id) + '"><span aria-hidden="true">' + m.ic + '</span><span><b>' + esc(p.n) + '</b><small data-sin-trad>' +
        esc([p.nivel ? 'nivel ' + p.nivel : '', p.frente, p.nota].filter(Boolean).join(' · ')) + '</small></span><span aria-hidden="true">›</span></button>'; }).join('') + '</div>';
      return h;
    }
    function formNueva(){
      var N = Z.nueva, h = '<div class="rie-panel" id="rie-nueva"><b>＋ Un punto en el mapa</b>';
      h += '<label for="rie-n-tipo">Qué hay</label><select id="rie-n-tipo">' + MARCAS.map(function(m){ return '<option value="' + m.k + '"' + (N.k === m.k ? ' selected' : '') + '>' + m.ic + ' ' + esc(m.n) + '</option>'; }).join('') + '</select>';
      h += '<label for="rie-n-nivel">Nivel del riesgo (del IPERC)</label><select id="rie-n-nivel"><option value="">—</option>' + ['bajo', 'medio', 'alto', 'critico'].map(function(n){ return '<option value="' + n + '"' + (N.nivel === n ? ' selected' : '') + '>' + (n === 'critico' ? 'crítico' : n) + '</option>'; }).join('') + '</select>';
      if(Z.D && Z.D.frentes.length) h += '<label for="rie-n-frente">Frente</label><select id="rie-n-frente"><option value="">—</option>' + Z.D.frentes.map(function(f){ return '<option data-sin-trad' + (N.frente === f.n ? ' selected' : '') + '>' + esc(f.n) + '</option>'; }).join('') + '</select>';
      h += '<label for="rie-n-nota">Nota (dónde exactamente, qué cuidar)</label><input id="rie-n-nota" maxlength="140" value="' + esc(N.nota || '') + '" placeholder="Borde de losa del piso 3, lado norte">';
      h += '<label for="rie-n-gps">Coordenadas</label><input id="rie-n-gps" inputmode="decimal" value="' + (N.lat != null ? N.lat + ', ' + N.lng : '') + '" placeholder="-12.046374, -77.042793">';
      h += '<p class="rie-sub">' + (N.acc ? '± ' + Math.round(N.acc) + ' m según el celular. ' : '') + 'Con este cuadro abierto, también se puede tocar el mapa en el lugar.</p>';
      h += '<div class="rie-acc"><button type="button" class="' + B + '" data-acc="guardar">Guardar el punto</button><button type="button" class="' + BS + '" data-acc="cancelar">Cancelar</button></div><p class="rie-sub" id="rie-n-msg" role="status"></p></div>';
      return h;
    }
    function panelPunto(p){
      var L = enlaces(p), h = '<div class="rie-panel" id="rie-punto"><b' + (p.es === 'frente' ? ' data-sin-trad' : '') + '>' + (p.es === 'frente' ? '🚧 ' : marca(p.k).ic + ' ') + esc(p.n) + '</b>';
      h += '<p class="rie-sub" data-sin-trad>' + esc([p.es === 'frente' ? 'radio ' + p.r + ' m' : (p.nivel ? 'nivel ' + p.nivel : ''), p.frente, p.nota, p.punto ? 'punto de reunión: ' + p.punto : ''].filter(Boolean).join(' · ')) + '</p>';
      h += '<p class="rie-sub" data-sin-trad>' + p.lat + ', ' + p.lng + '</p>';
      h += '<div class="rie-acc"><a class="' + BS + '" href="' + L.google + '" target="_blank" rel="noopener">Abrir en Google Maps</a><a class="' + BS + '" href="' + L.osm + '" target="_blank" rel="noopener" data-sin-trad>OpenStreetMap</a>' +
           (p.es === 'marca' && cat(p.k).k === p.k ? '<button type="button" class="' + BS + '" data-acc="simular-aqui">🎯 Simular aquí</button>' : '') +
           (p.es === 'marca' && host.puedeEditar ? '<button type="button" class="' + BS + '" data-acc="quitar">Quitar el punto</button>' : '') + '</div></div>';
      return h;
    }
    /* ── el simulador ── */
    function lugares(){ return puntos().filter(function(p){ return p.es === 'frente' || cat(p.k).k === p.k; }); }
    function pintarSimulador(){
      var h = '<p class="rie-sub" style="margin:0 0 10px">Elige qué pasa y dónde: sale lo que puede pasar, qué tan cerca está hoy según tus registros, lo de emergencia más cercano y los pasos con su tiempo. Después se ensaya con el cronómetro.</p>';
      h += '<div class="rie-panel"><label for="rie-s-k">Qué pasa</label><select id="rie-s-k">' + CAT.filter(function(c){ return c.k !== 'otros'; }).map(function(c){
        return '<option value="' + c.k + '"' + (Z.simK === c.k ? ' selected' : '') + '>' + c.ic + ' ' + esc(c.esc) + '</option>'; }).join('') + '</select>';
      var L = lugares();
      h += '<label for="rie-s-l">Dónde</label><select id="rie-s-l"><option value="">En la obra (sin un punto)</option>' + L.map(function(p){
        return '<option data-sin-trad value="' + esc(p.id) + '"' + (Z.simLugar === p.id ? ' selected' : '') + '>' + (p.es === 'frente' ? '🚧 ' : marca(p.k).ic + ' ') + esc(p.n + (p.nota ? ' · ' + p.nota : '')) + '</option>'; }).join('') + '</select>';
      h += '<div class="rie-acc"><button type="button" class="' + B + '" data-acc="simular">Ver el escenario</button></div></div>';
      if(Z.S){
        h += '<div class="rie-panel" id="rie-sim">' + htmlSimulacion(Z.S) + '<div class="rie-acc">' +
             (Z.run ? '' : '<button type="button" class="' + B + '" data-acc="ensayar">▶ Ensayarlo ahora</button>') +
             (host.simulacro ? '<button type="button" class="' + BS + '" data-acc="programar">🧯 Programarlo como simulacro</button>' : '') + '</div></div>';
        if(Z.run) h += pintarEnsayo();
      }
      h += '<div class="rie-tit"><span>Ensayos hechos</span> · <span data-sin-trad>' + Z.ensayos.length + '</span></div>';
      if(!Z.ensayos.length) h += '<p class="rie-sub">Todavía no hay ensayos guardados.</p>';
      h += '<div class="rie-lista">' + Z.ensayos.slice(0, 20).map(function(e){
        var tarde = (e.pasos || []).filter(function(p){ return p.tarde; }).length;
        return '<div class="rie-pt" style="cursor:default"><span aria-hidden="true">' + cat(e.k).ic + '</span><span><b>' + esc(e.titulo || cat(e.k).esc) + '</b><small data-sin-trad>' +
          esc([e.fecha, e.lugar, 'total ' + reloj(e.total), tarde ? pl(tarde, 'paso fuera de tiempo', 'pasos fuera de tiempo') : 'todo a tiempo', e.por].filter(Boolean).join(' · ')) + '</small></span></div>'; }).join('') + '</div>';
      return h;
    }
    function pintarEnsayo(){
      var R = Z.run, t = (Date.now() - R.t0) / 1000, i = R.i, S = Z.S, acum = 0;
      var h = '<div class="rie-panel" id="rie-ensayo"><b>⏱ Ensayo de gabinete</b><div class="rie-reloj' + (t > S.meta && S.meta ? ' tarde' : '') + '" id="rie-reloj" data-sin-trad>' + reloj(t) + '</div><ol class="rie-pasos">';
      S.pasos.forEach(function(p, k){
        acum += p.s; var hecho = R.marcas[k];
        h += '<li class="' + (hecho != null ? 'hecho' : '') + (k === i ? ' ahora' : '') + (hecho != null && p.s && hecho > acum ? ' tarde' : '') + '"><span>' + esc(p.t) + '</span><small data-sin-trad>' + (hecho != null ? reloj(hecho) : (p.s ? '≤ ' + reloj(acum) : '')) + '</small></li>';
      });
      h += '</ol>';
      if(i < S.pasos.length) h += '<div class="rie-acc"><button type="button" class="' + B + '" data-acc="paso">✓ Hecho, el siguiente</button><button type="button" class="' + BS + '" data-acc="parar">Terminar aquí</button></div>';
      else h += '<label for="rie-e-obs">Qué salió mal y qué se mejora</label><textarea id="rie-e-obs" rows="3" maxlength="600"></textarea><label for="rie-e-n">Cuántos participaron</label><input id="rie-e-n" type="number" min="1" max="999" inputmode="numeric">' +
                '<div class="rie-acc"><button type="button" class="' + B + '" data-acc="guardar-ensayo">Guardar el ensayo</button></div><p class="rie-sub" id="rie-e-msg" role="status"></p>';
      return h + '</div>';
    }
    function tic(){
      if(!Z.run || Z.tab !== 'simulador'){ return; }
      var r = caja.querySelector('#rie-reloj'); if(!r){ return; }
      var t = (Date.now() - Z.run.t0) / 1000; r.textContent = reloj(t); r.className = 'rie-reloj' + (Z.S.meta && t > Z.S.meta ? ' tarde' : '');
      Z.run.tm = setTimeout(tic, 500);
    }
    /* ── los toques ── */
    function atar(){
      [].forEach.call(caja.querySelectorAll('[data-tab]'), function(b){ b.onclick = function(){ Z.tab = b.getAttribute('data-tab'); pintar(); if(Z.tab === 'simulador' && Z.run) tic(); }; });
      [].forEach.call(caja.querySelectorAll('.rie-simular'), function(b){ b.onclick = function(){
        Z.simK = b.getAttribute('data-k'); var d = b.getAttribute('data-donde') || '';
        var l = lugares().filter(function(p){ return d && (p.n === d || p.frente === d); })[0]; Z.simLugar = l ? l.id : '';
        Z.tab = 'simulador'; verEscenario(); }; });
      var svg = caja.querySelector('svg.rie-mapa');
      if(svg){
        [].forEach.call(svg.querySelectorAll('.rie-m'), function(g){
          g.addEventListener('click', function(ev){ ev.stopPropagation(); Z.sel = g.getAttribute('data-id'); pintar(); });
          g.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); Z.sel = g.getAttribute('data-id'); pintar(); } });
        });
        /* con «＋ Marcar un punto» abierto, tocar el mapa pone sus coordenadas; si no, deja de marcar el elegido */
        svg.addEventListener('click', function(ev){
          if(!Z.nueva || !host.puedeEditar){ if(Z.sel){ Z.sel = null; pintar(); } return; }
          var r = svg.getBoundingClientRect(), T = svg.viewBox.baseVal.width, g = aGps(svg, (ev.clientX - r.left) / r.width * T, (ev.clientY - r.top) / r.height * T);
          if(!g) return;
          Z.nueva = Object.assign(Z.nueva, leerNueva(), { lat:g.lat, lng:g.lng, acc:null }); pintar();
        });
      }
      [].forEach.call(caja.querySelectorAll('[data-pt]'), function(b){ b.onclick = function(){ Z.sel = b.getAttribute('data-pt'); pintar(); }; });
      [].forEach.call(caja.querySelectorAll('[data-acc]'), function(b){ b.onclick = function(){ accion(b.getAttribute('data-acc'), b); }; });
    }
    function leerNueva(){
      var v = function(id){ var e = caja.querySelector('#' + id); return e ? String(e.value || '').trim() : undefined; }, o = {};
      if(v('rie-n-tipo') !== undefined){ o.k = v('rie-n-tipo'); o.nivel = v('rie-n-nivel') || ''; o.nota = v('rie-n-nota') || ''; o.frente = v('rie-n-frente') || ''; }
      return o;
    }
    function verEscenario(){
      var k = Z.simK || 'altura', P = puntos(), l = Z.simLugar ? P.filter(function(p){ return p.id === Z.simLugar; })[0] : null;
      Z.S = simular(k, l ? { n:l.n + (l.nota ? ' · ' + l.nota : ''), lat:l.lat, lng:l.lng } : null, Z.A, P);
      Z.run = null; pintar();
      var el = caja.querySelector('#rie-sim'); if(el && el.scrollIntoView) try{ el.scrollIntoView({ block:'start', behavior:'smooth' }); }catch(_s){}
    }
    function accion(a, b){
      var msg = function(id, t){ var m = caja.querySelector('#' + id); if(m) m.textContent = t; };
      if(a === 'nueva'){ Z.nueva = { k:'altura', nivel:'', nota:'', frente:'', lat:null, lng:null }; Z.sel = null; pintar(); var f = caja.querySelector('#rie-nueva'); if(f && f.scrollIntoView) try{ f.scrollIntoView({ block:'center' }); }catch(_f){} return; }
      if(a === 'cancelar'){ Z.nueva = null; pintar(); return; }
      if(a === 'gps'){
        b.disabled = true; b.textContent = 'Buscando la señal del GPS…';
        host.gpsAhora().then(function(g){ Z.nueva = Object.assign({ k:'altura', nivel:'', nota:'', frente:'' }, Z.nueva || {}, { lat:g.lat, lng:g.lng, acc:g.acc }); Z.sel = null; pintar(); },
          function(e){ b.disabled = false; b.textContent = '📍 Marcar dónde estoy'; if(host.toast) host.toast((e && e.message) || 'No se pudo leer el GPS del celular.'); });
        return;
      }
      if(a === 'guardar'){
        var o = leerNueva(), g = gpsDeTexto((caja.querySelector('#rie-n-gps') || {}).value || '');
        if(!g){ msg('rie-n-msg', 'Faltan las coordenadas: «📍 Marcar dónde estoy», pegarlas de Google Maps o tocar el mapa en el lugar.'); return; }
        var m = { id:'rp' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), k:o.k || 'otro', n:marca(o.k).n, nivel:o.nivel, nota:o.nota.slice(0, 140), frente:o.frente,
                  lat:g.lat, lng:g.lng, acc:(Z.nueva && Z.nueva.acc) ? Math.round(Z.nueva.acc) : null, t:Date.now(), por:host.quien || '' };
        b.disabled = true; msg('rie-n-msg', 'Guardando…');
        host.marcas.poner(m).then(function(fila){ if(fila && fila.id) m.id = fila.id; Z.marcas.push(m); Z.nueva = null; Z.sel = m.id; pintar(); if(host.toast) host.toast('Punto guardado en el mapa.'); },
          function(e){ b.disabled = false; msg('rie-n-msg', 'No se guardó: ' + ((e && e.message) || 'sin conexión') + '. Vuelve a intentarlo.'); });
        return;
      }
      if(a === 'quitar'){
        var id = Z.sel; if(!id) return;
        host.marcas.quitar(id).then(function(){ Z.marcas = Z.marcas.filter(function(x){ return x.id !== id; }); Z.sel = null; pintar(); if(host.toast) host.toast('Punto quitado.'); },
          function(){ if(host.toast) host.toast('No se pudo quitar: revisa la conexión.'); });
        return;
      }
      if(a === 'png'){
        var svgTxt = svgMapa(puntos(), { tam:1400, nombres:true });
        svgAPng(svgTxt, 1400).then(function(blob){ host.bajar(blob, 'mapa-de-riesgos-' + hoy + '.png'); }, function(){ if(host.toast) host.toast('No se pudo armar la imagen del mapa.'); });
        return;
      }
      if(a === 'simular-aqui'){ var p = puntos().filter(function(x){ return x.id === Z.sel; })[0]; if(!p) return; Z.simK = cat(p.k).k; Z.simLugar = p.id; Z.tab = 'simulador'; verEscenario(); return; }
      if(a === 'simular'){ Z.simK = (caja.querySelector('#rie-s-k') || {}).value || 'altura'; Z.simLugar = (caja.querySelector('#rie-s-l') || {}).value || ''; verEscenario(); return; }
      if(a === 'ensayar'){ Z.run = { t0:Date.now(), i:0, marcas:{} }; pintar(); tic(); return; }
      if(a === 'paso'){ var R = Z.run; if(!R) return; R.marcas[R.i] = Math.round((Date.now() - R.t0) / 1000); R.i++; if(R.i >= Z.S.pasos.length) R.fin = R.marcas[R.i - 1]; pintar(); if(R.i < Z.S.pasos.length) tic(); return; }
      if(a === 'parar'){ var R2 = Z.run; if(!R2) return; R2.fin = Math.round((Date.now() - R2.t0) / 1000); R2.i = Z.S.pasos.length; pintar(); return; }
      if(a === 'programar'){ if(host.simulacro) host.simulacro(Z.S); return; }
      if(a === 'guardar-ensayo'){
        var R3 = Z.run, S = Z.S, ac = 0;
        var e = { id:'re' + Date.now().toString(36), k:S.k, titulo:S.titulo, fecha:hoy, lugar:S.lugar ? S.lugar.n : '', total:R3.fin || 0, meta:S.meta,
                  pasos:S.pasos.map(function(p, k){ ac += p.s; var m = R3.marcas[k]; return { t:p.t, meta:ac, hecho:(m == null ? null : m), tarde:(m != null && p.s > 0 && m > ac) }; }),
                  obs:String((caja.querySelector('#rie-e-obs') || {}).value || '').trim().slice(0, 600), n:+((caja.querySelector('#rie-e-n') || {}).value || 0) || null, por:host.quien || '', t:Date.now() };
        b.disabled = true; msg('rie-e-msg', 'Guardando…');
        host.ensayos.poner(e).then(function(){ Z.ensayos.unshift(e); Z.run = null; pintar(); if(host.toast) host.toast('Ensayo guardado.'); },
          function(){ b.disabled = false; msg('rie-e-msg', 'No se guardó: revisa la conexión y vuelve a intentarlo.'); });
        return;
      }
    }
    pintar();
    Promise.all([host.traer(), host.marcas.leer().catch(function(){ return []; }), host.ensayos.leer().catch(function(){ return []; })]).then(function(r){
      Z.R = r[0] || {}; Z.R.hoy = hoy; Z.marcas = r[1] || []; Z.ensayos = r[2] || [];
      Z.D = normalizar(Z.R); Z.A = analizar(Z.D);
      if(Z.A.vacio){ Z.ej = true; Z.A = analizar(normalizar(ejemplo(hoy))); Z.A.vacio = false; }
      Z.cargando = false; pintar();
    }, function(e){ Z.cargando = false; Z.error = 'No se pudieron traer los registros: ' + ((e && e.message) || 'sin conexión') + '. Vuelve a entrar cuando tengas señal.'; pintar(); });
    return Z;
  }
  /* el mapa en una imagen (para el mural o el informe): el dibujo, con fondo blanco */
  function svgAPng(svgTxt, tam){
    return new Promise(function(ok, mal){
      try{
        var s = svgTxt.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" style="color:#10202B;font-family:Arial,Helvetica,sans-serif" ')
                      .replace(/class="rie-fondo"/, 'fill="#ffffff" stroke="#cccccc"').replace(/class="rie-g"/g, 'stroke="#d8dde2" stroke-width="1"')
                      .replace(/class="rie-esc-f"/g, 'fill="#ffffff"').replace(/class="rie-esc-l"/g, 'stroke="#10202B"').replace(/class="rie-norte-f"/g, 'fill="#D9261C"')
                      .replace(/class="rie-t"/g, 'fill="#44525C" font-size="13"').replace(/class="rie-fre-t"/g, 'fill="#00599E" font-size="15" font-weight="700"')
                      .replace(/class="rie-m-t"/g, 'fill="#10202B" font-size="13"').replace(/class="rie-m-ic"/g, 'font-size="14"');
        var img = new Image();
        img.onload = function(){ var c = document.createElement('canvas'); c.width = tam; c.height = tam; var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, tam, tam); x.drawImage(img, 0, 0, tam, tam); c.toBlob(function(b){ b ? ok(b) : mal(new Error('png')); }, 'image/png'); };
        img.onerror = function(){ mal(new Error('svg')); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
      }catch(e){ mal(e); }
    });
  }

  return { CAT:CAT, cat:cat, clasificar:clasificar, normalizar:normalizar, analizar:analizar, htmlAnticipar:htmlAnticipar, htmlTendencia:htmlTendencia,
           MARCAS:MARCAS, marca:marca, NIVM:NIVM, gpsLimpio:gpsLimpio, gpsDeTexto:gpsDeTexto, distM:distM, enlaces:enlaces, puntosMapa:puntosMapa,
           proyectar:proyectar, svgMapa:svgMapa, aGps:aGps, leyenda:leyenda, simular:simular, htmlSimulacion:htmlSimulacion, reloj:reloj,
           ejemplo:ejemplo, esc:esc, dia:dia, iso:iso, estilos:estilos, montar:montar, svgAPng:svgAPng };
})();
if(typeof module !== 'undefined' && module.exports) module.exports = RIE;
