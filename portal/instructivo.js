/* OBRASST · el instructivo de riesgos del puesto en la web (16/11/2026). Lo arma parches/instructivo-web-1611.py: el catálogo,
   el PDF del instructivo y el del registro de entrega son los de la app, tal cual (RP-INSTRUCTIVO; herr/copias.py lo revisa).
   Arriba, lo que en la app sale del celular y aquí lo pone quien llama (RPI_APP.usar). Debajo, la pantalla de la web.
   No editar lo de la app aquí: se cambia en la app y se vuelve a correr el armado. */
var RPI_APP = (function(){
  /* RPI_APP.usar({ emp:{ razon, ruc, logo }, logo:{ du, r }, obra, ob:{ id, nombre, obra_nombre }, fmt:{ clave:{ cod, rev, fecha } },
     sup:{ nombre, cargo }, trabs:[{ nombre, dni, puesto, estatus }] }) */
  var _C = {};
  var LS_SUP = '__sup';
  function leer(k, d){ if(k === LS_SUP) return _C.sup || {}; return d; }
  function empleador(){ return _C.emp || {}; }
  function formatoDe(k){ var it = (_C.fmt && _C.fmt[k]) || {}; return { cod:it.cod || '', rev:it.rev || '', fecha:it.fecha || '' }; }
  function nombreDeLaObra(){ return _C.obra || ''; }
  function indsEmp(){ return _C.ob || null; }
  function trabsLocal(){ return _C.trabs || []; }
  /* el logo en su caja, centrado y sin deformarlo (con su proporción, que trae quien llama) */
  function pdfLogo(doc, x, y, w, h){
    var L = _C.logo; if(!L || !L.du) return false;
    var r = L.r || 1, lw = w, lh = w / r; if(lh > h){ lh = h; lw = h * r; }
    try{ doc.addImage(L.du, x + (w - lw) / 2, y + (h - lh) / 2, lw, lh, undefined, 'FAST'); return true; }catch(e){ return false; }
  }
/* ── lo de la app, tal cual ── */
var RPI_CAT = {"v":2,"titulo":"Instructivo de riesgos asociados al puesto de trabajo","para":"Te dice, antes de empezar, los peligros de tu puesto y de tu frente de trabajo, qué te puede pasar y cómo se controla. Léelo con tu supervisor, pregunta lo que no te quede claro y firma la declaración del final.","base":[["Ley N.° 29783, art. 35 c)","Adjuntar al contrato de trabajo la descripción de las recomendaciones de seguridad y salud en el trabajo."],["D.S. N.° 011-2019-TR, art. 6.3","El empleador comunica a los trabajadores los riesgos de seguridad y salud en el trabajo y sus medidas de control, por medios idóneos."],["D.S. N.° 011-2019-TR, art. 13 b)","El trabajador tiene derecho a recibir información clara y suficiente sobre los peligros existentes."]],"grupos":[{"k":"oficina","n":"Trabajo en gabinete (oficina)","sub":[{"n":"Tránsito, mobiliario y orden","riesgos":[{"k":"o1","p":"Pisos resbalosos u obstáculos en los pasadizos (cables, cajas)","r":"Caída al mismo nivel: golpes y torceduras","m":"Transita con atención; no corras. Mantén los pasadizos despejados y los cables canalizados."},{"k":"o2","p":"Escaleras","r":"Caída en la escalera por distracción o por no usar el pasamanos: golpes, fracturas","m":"Usa el pasamanos al subir y al bajar; no te distraigas mientras te desplazas."},{"k":"o3","p":"Archivadores o anaqueles sin fijar a la pared","r":"Caída del mueble sobre la persona: golpes, aplastamiento","m":"Fija archivadores y anaqueles a la pared con anclajes y revisa su estabilidad periódicamente."},{"k":"o4","p":"Mobiliario, cajones abiertos y puertas","r":"Golpes contra objetos","m":"Mantén los cajones cerrados y las zonas de tránsito libres de obstáculos."},{"k":"o5","p":"Papel, bordes de escritorios y útiles punzocortantes","r":"Cortes y pinchazos","m":"Manipula útiles y documentos con cuidado; desecha de inmediato los objetos deteriorados."}]},{"n":"Ergonomía y bienestar","riesgos":[{"k":"o6","p":"Cajas de archivo pesadas","r":"Sobreesfuerzo al levantarlas: lesión lumbar","m":"Aplica la técnica de manejo manual de cargas; pide ayuda o usa medios mecánicos cuando haga falta."},{"k":"o7","p":"Trabajo sentado por mucho tiempo, malas posturas y movimientos repetitivos","r":"Trastornos musculoesqueléticos (cuello, espalda, muñecas)","m":"Usa mobiliario ergonómico. Antes de empezar, ajusta la silla, el monitor y el teclado para una postura neutra. Haz pausas activas de diez minutos cada dos horas."},{"k":"o8","p":"Pantallas con brillo, altura o distancia mal ajustados, por mucho tiempo","r":"Fatiga visual y sequedad ocular","m":"Aplica la regla 20-20-20: cada 20 minutos mira un punto a 6 metros durante 20 segundos, y parpadea conscientemente. Avisa a tu supervisor si la molestia persiste."},{"k":"o9","p":"Doble pantalla sin ajuste de altura y distancia","r":"Posturas forzadas de cuello y espalda","m":"Ajusta la distancia y la altura de ambas pantallas antes de empezar; reporta cualquier molestia a tu supervisor."},{"k":"o10","p":"Carga de trabajo, jornadas largas y doble presencia (trabajo y familia)","r":"Estrés laboral","m":"Organiza con tu jefe la carga, la jornada y la distribución del trabajo; participa en las actividades programadas por el área de SST."}]},{"n":"Electricidad, incendio y ambiente","riesgos":[{"k":"o11","p":"Instalaciones eléctricas deficientes o cables dañados","r":"Contacto eléctrico (electrocución)","m":"Revisa enchufes y cables antes de usarlos; reporta de inmediato cualquier anomalía al área de mantenimiento."},{"k":"o12","p":"Tomacorrientes sobrecargados o equipos encendidos sin uso","r":"Cortocircuito e incendio","m":"No sobrecargues los tomacorrientes y apaga los equipos al terminar la jornada. Conoce dónde está el extintor más cercano, verifica que esté operativo y participa en los simulacros."},{"k":"o13","p":"Módulo metálico al sol (puede pasar de 40 °C en verano)","r":"Calor excesivo: malestar y deshidratación","m":"Asegura la ventilación y controla la temperatura interior en los días de verano; toma agua con frecuencia."},{"k":"o14","p":"Ventilación deficiente en espacios cerrados (acumulación de CO₂)","r":"Somnolencia y menor rendimiento","m":"Renueva el aire periódicamente; instala ventilación cuando haga falta."}]}]},{"k":"obra","n":"Trabajo en campo (ejecución de obra)","sub":[{"n":"Tránsito, caídas y trabajo en altura","riesgos":[{"k":"c1","p":"Pisos irregulares, húmedos u obstruidos; poca luz","r":"Caída al mismo nivel: golpes, torceduras","m":"Transita con atención; no corras. Mantén los pasadizos despejados y los cables canalizados. Usa solo accesos y pasarelas seguros, y lleva linterna en zonas oscuras o dentro del túnel."},{"k":"c2","p":"Bordes de excavaciones, plataformas o taludes","r":"Caída a desnivel","m":"Mantente a 1 metro como mínimo del borde. No traspases ni retires las barreras. Reporta de inmediato cualquier borde sin protección o barrera dañada."},{"k":"c3","p":"Escaleras","r":"Caída en la escalera","m":"Usa el pasamanos; no te distraigas al desplazarte."},{"k":"c4","p":"Trabajo a más de 1,80 m (plataformas, andamios, escaleras, pasarelas)","r":"Caída de altura: lesiones graves o muerte","m":"Usa siempre arnés con doble línea de vida anclada a un punto certificado. Revisa tu arnés antes de cada uso y reporta cualquier daño. Los andamios los arma solo personal certificado (ANSI/SSFI SC100), con inspección diaria y su lista de verificación antes del primer uso."}]},{"n":"Izaje, dovelas y excavaciones","riesgos":[{"k":"c5","p":"Cargas suspendidas y trabajos en niveles superiores","r":"Caída de objetos: golpes, aplastamiento","m":"Respeta la zona de exclusión señalizada bajo el izaje. Identifica la línea de fuego de cada actividad y no te pongas en su trayectoria."},{"k":"c6","t":1,"p":"Manejo y erección de dovelas","r":"Caída de la dovela: aplastamiento","m":"Asegura las dovelas con elementos de sujeción certificados. Cumple el procedimiento de erección; no intervengas el erector sin autorización. No te pongas bajo cargas suspendidas."},{"k":"c7","p":"Excavaciones sin sostenimiento o bermas inestables","r":"Derrumbe: atrapamiento, aplastamiento","m":"Antes de entrar, verifica que la excavación tenga su entibado o sostenimiento aprobado. Pide autorización para entrar a las áreas restringidas."}]},{"n":"Equipos, maquinaria y herramientas","riesgos":[{"k":"c8","p":"Equipos, maquinaria y camiones en la obra o en el túnel","r":"Atropello o choque","m":"Respeta la señalización de tránsito dentro y fuera de la obra. Usa los accesos peatonales y ropa con cintas reflectivas. Velocidad máxima en la obra: 20 km/h."},{"k":"c9","p":"Maquinaria en operación (su radio de acción)","r":"Golpe, atrapamiento o atropello por la interacción persona-equipo","m":"No entres al radio de acción sin la señal del operador. Mantén contacto visual o por radio antes de acercarte. Respeta las zonas de exclusión persona-equipo."},{"k":"c10","p":"Herramientas manuales, eléctricas y de poder","r":"Cortes, golpes, proyección de partículas o contacto eléctrico","m":"Inspecciona cada herramienta antes de usarla. No uses herramientas sin guardas, con cables pelados o mangos rotos: retíralas y repórtalas. No improvises herramientas."}]},{"n":"Iluminación, ruido, vibración y calor","riesgos":[{"k":"c11","p":"Iluminación deficiente (menos de 200 lux en zonas de trabajo y de 50 lux en vías de circulación)","r":"Golpes, caídas y fatiga visual","m":"Verifica que haya como mínimo 200 lux en las zonas de trabajo y 50 lux en las vías de circulación, según la actividad; reporta las zonas oscuras."},{"k":"c12","p":"Ruido elevado (más de 85 dB)","r":"Pérdida de la audición","m":"Usa doble protección auditiva (tapones y orejeras) en las zonas de alto ruido."},{"k":"c13","p":"Vibración de cuerpo completo y mano-brazo (equipos y maquinaria)","r":"Lesiones en manos, brazos y espalda","m":"Haz pausas activas y respeta los tiempos máximos de exposición del procedimiento. Reporta al médico ocupacional el hormigueo, el entumecimiento o el dolor en manos y brazos. Pide rotación si sientes fatiga muscular."},{"k":"c14","p":"Calor y poca ventilación","r":"Deshidratación y golpe de calor","m":"Mantén la ventilación y usa los puntos de hidratación con agua potable. Respeta las jornadas máximas; las horas extra se registran y se rota a quien muestra fatiga."}]},{"n":"Atmósferas, polvo, químicos y emergencias","riesgos":[{"k":"c15","p":"Atmósferas peligrosas: falta de oxígeno y gases tóxicos (CO, H₂S, CH₄)","r":"Asfixia o intoxicación","m":"Monitoreo continuo de gases (O₂, CO, H₂S, CH₄) en el túnel (con equipos o grupos electrógenos en marcha) y en espacios confinados. Lleva tu detector multigás, pruébalo antes de entrar, conoce sus alarmas y evacúa ante cualquier alerta."},{"k":"c16","t":1,"p":"Ingreso de agua a estaciones o pozos","r":"Inundación: atrapamiento o ahogamiento","m":"Conoce el plan de emergencia ante inundación y las rutas de evacuación; ubica las estaciones de emergencia de tu área."},{"k":"c17","p":"Polvo de sílice y de cemento, humos de soldadura y gases de combustión","r":"Irritación y enfermedad respiratoria","m":"Usa siempre el respirador con los filtros adecuados en zonas con polvo, humos o gases; la exposición se monitorea periódicamente."},{"k":"c18","p":"Partículas, chispas y salpicaduras de concreto","r":"Lesiones en los ojos y en la piel","m":"Usa lentes de seguridad, careta facial y guantes adecuados en todo trabajo con proyección de partículas."}]},{"n":"Electricidad, trabajos en caliente e incendio","riesgos":[{"k":"c19","p":"Soldadura y corte (trabajo en caliente), también en espacios confinados","r":"Quemaduras, incendio o explosión","m":"Trabaja solo con el permiso de trabajo en caliente y su autorización. Si no participas, no te acerques al área. Aleja los productos químicos a 15 metros como mínimo y no los almacenes ahí mientras dure el trabajo."},{"k":"c20","p":"Instalaciones y sistemas energizados","r":"Contacto eléctrico: quemaduras, electrocución","m":"Solo electricistas certificados intervienen sistemas energizados. Antes de intervenir un equipo o sistema, aplica el bloqueo y etiquetado, y señaliza."},{"k":"c21","p":"Combustibles, aceites hidráulicos e inflamables","r":"Incendio","m":"Almacénalos en zonas designadas, ventiladas y lejos de fuentes de ignición. Participa en las capacitaciones sobre productos químicos (SGA, rombo NFPA y hojas de datos de seguridad)."},{"k":"c22","t":1,"p":"Bentonita, lechada de mortero y aditivos químicos","r":"Derrame: contaminación y contacto con la piel","m":"Ten a mano el kit antiderrame; contén, neutraliza y gestiona los residuos según el procedimiento ambiental. Las hojas de datos de seguridad (MSDS) de cada producto deben estar disponibles."}]},{"n":"Esfuerzo y fatiga","riesgos":[{"k":"c23","p":"Cargas pesadas y posturas forzadas","r":"Sobreesfuerzo: lesiones musculoesqueléticas","m":"Aplica la técnica de manejo manual de cargas; usa ayuda mecánica para cargas de más de 25 kg."},{"k":"c24","p":"Jornadas prolongadas o trabajo nocturno sin rotación","r":"Fatiga crónica: errores y accidentes","m":"Respeta las jornadas máximas; las horas extra se registran y se rota a quien muestra fatiga crónica."}]}]}],"epp_basico":[{"k":"casco","n":"Casco de seguridad"},{"k":"lentes","n":"Lentes de seguridad"},{"k":"ropa","n":"Ropa de trabajo de manga larga"},{"k":"chaleco","n":"Chaleco o ropa con cintas reflectivas"},{"k":"guantes","n":"Guantes de seguridad (según la tarea)"},{"k":"zapatos","n":"Calzado de seguridad con punta de acero y suela antideslizante"}],"epp_especifico":[{"k":"respirador","n":"Respirador con filtros (P100/OV)","c":"Zonas con polvo, gases o humos de soldadura"},{"k":"auditiva","n":"Tapones auditivos y orejeras","c":"Zonas de alto ruido"},{"k":"barbiquejo","n":"Barbiquejo","c":"Zonas con viento o vibración"},{"k":"arnes","n":"Arnés de seguridad con línea de vida doble","c":"Trabajos a más de 1,80 m"},{"k":"careta","n":"Careta facial","c":"Soldadura, esmerilado o proyección de partículas"},{"k":"tyvek","n":"Traje Tyvek","c":"Sustancias peligrosas o espacios contaminados"},{"k":"scba","n":"Equipo de respiración autónoma (SCBA)","c":"Atmósferas IDLH o hiperbáricas"},{"k":"bloqueador","n":"Bloqueador solar FPS 50 o más","c":"Trabajos al aire libre"},{"k":"rodilleras","n":"Rodilleras ergonómicas","c":"Trabajos de rodillas"}],"reglas":["Antes de empezar la tarea, participa en la charla de inicio de jornada y llena el ATS con tu cuadrilla.","Los trabajos de alto riesgo se hacen solo con su permiso de trabajo (PETAR) aprobado y firmado.","Respeta la señalización, las barreras y las zonas de exclusión: no las retires ni las traspases.","Usa tu EPP completo y en buen estado; si se daña o se pierde, pide el cambio.","Reporta los actos y las condiciones inseguras que veas, y todo incidente o accidente, aunque no haya lesión.","Si ves un peligro grave e inminente, detén la tarea, ponte a salvo y avisa de inmediato a tu supervisor.","No operes equipos ni intervengas instalaciones para los que no estás capacitado y autorizado."],"emergencia":["Da la alarma y avisa a tu supervisor.","Sigue la ruta de evacuación hasta el punto de reunión, sin correr y sin volver por tus cosas.","Sigue las indicaciones de los brigadistas."],"numeros":"Bomberos 116 · SAMU 106 · Policía 105","declaracion":"Declaro haber recibido y estar debidamente informado, en forma verbal y escrita, de los peligros y riesgos a los que estaré expuesto en mi puesto y en mi frente de trabajo, y de sus medidas de control. Me comprometo a cumplir las normas de seguridad y salud en el trabajo que se me han informado, de acuerdo con las actividades propias de mi cargo, incluido el uso correcto del EPP, la participación en las capacitaciones programadas y la comunicación oportuna de las condiciones inseguras."};
var RPI_NIVEL = [['alto', 'Alto'], ['medio', 'Medio'], ['bajo', 'Bajo']];
var RPI_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
function _rpiMesN(m){ m = String(m || ''); return RPI_MESES[(+m.slice(5, 7) || 1) - 1] + ' de ' + m.slice(0, 4); }
function _rpiTx(s){
  return String(s == null ? '' : s).replace(/[₀-₉]/g, function(c){ return String(c.charCodeAt(0) - 0x2080); })
    .replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/[^\u0000-ÿ€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g, '');
}
function _rpiFilas(){ var L = []; RPI_CAT.grupos.forEach(function(g){ g.sub.forEach(function(s){ s.riesgos.forEach(function(r){ L.push({ g:g.k, s:s.n, r:r }); }); }); }); return L; }
function _rpiVan(E){
  var G = [];
  RPI_CAT.grupos.forEach(function(g){
    if(!E.donde[g.k]) return;
    var subs = [];
    g.sub.forEach(function(s){ var R = s.riesgos.filter(function(r){ return E.marc[r.k]; }); if(R.length) subs.push({ n:s.n, riesgos:R }); });
    if(g.k === 'obra' || (!E.donde.obra && g.k === 'oficina')){ if(E.propios.length) subs.push({ n:'Otros riesgos de este puesto', riesgos:E.propios }); }
    if(subs.length) G.push({ k:g.k, n:g.n, sub:subs });
  });
  if(!G.length && E.propios.length) G.push({ k:'propios', n:'Riesgos de este puesto', sub:[{ n:'Otros riesgos de este puesto', riesgos:E.propios }] });
  return G;
}
function _rpiValida(E){
  if(!E.puestos.length) return 'Marca al menos un puesto (o escribe uno en «Otro puesto»).';
  if(!E.donde.oficina && !E.donde.obra && !E.propios.length) return 'Marca dónde trabaja: en la oficina, en la obra o en las dos.';
  var n = 0; _rpiVan(E).forEach(function(g){ g.sub.forEach(function(s){ n += s.riesgos.length; }); });
  if(!n) return 'Marca al menos un peligro de la lista.';
  return '';
}
function _rpiDoc(titulo, fmtClave){
  var doc = new jspdf.jsPDF({ unit:'pt', format:'a4' });
  var K = { doc:doc, W:595.28, H:841.89, M:34, y:0, AZUL:[31, 78, 121], AZCL:[222, 234, 246], GRIS:[89, 89, 89], LINEA:[166, 166, 166], TINTA:[26, 26, 26], CL:[242, 242, 242] };
  K.AN = K.W - 2 * K.M;
  var emp = {}; try{ emp = empleador() || {}; }catch(_e){}
  var fmt = {}; try{ fmt = formatoDe(fmtClave) || {}; }catch(_f){}
  var hoy = hoyISO().split('-').reverse().join('/');
  K.emp = emp; K.ob = (typeof indsEmp === 'function' ? indsEmp() : null) || {};
  K.obra = ''; try{ K.obra = (typeof nombreDeLaObra === 'function' ? nombreDeLaObra() : '') || K.ob.obra_nombre || K.ob.nombre || ''; }catch(_o){ K.obra = K.ob.nombre || ''; }
  K.cab = function(){
    var y0 = 22, hC = 50, wL = 100, wD = 132, M = K.M, W = K.W, AN = K.AN;
    doc.setDrawColor.apply(doc, K.LINEA); doc.setLineWidth(0.6); doc.rect(M, y0, AN, hC); doc.line(M + wL, y0, M + wL, y0 + hC); doc.line(W - M - wD, y0, W - M - wD, y0 + hC);
    var hayLogo = false;
    if(emp.logo){ try{ pdfLogo(doc, M + 6, y0 + 5, wL - 12, hC - 10); hayLogo = true; }catch(_l){} }
    if(!hayLogo){ doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(150, 150, 150);
      doc.text(doc.splitTextToSize(_rpiTx(emp.razon || emp.nombre || K.ob.nombre || 'LOGO DE LA EMPRESA'), wL - 12).slice(0, 3), M + wL / 2, y0 + hC / 2 - 2, { align:'center' }); }
    var cx = M + wL + (AN - wL - wD) / 2;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4); doc.setTextColor.apply(doc, K.GRIS); doc.text(titulo[0], cx, y0 + 19, { align:'center' });
    doc.setFontSize(titulo[1].length > 40 ? 9.6 : 11.2); doc.setTextColor.apply(doc, K.AZUL);
    doc.text(doc.splitTextToSize(titulo[1], AN - wL - wD - 12), cx, y0 + 32, { align:'center' });
    [['Código', fmt.cod || '—'], ['Revisión', fmt.cod ? (fmt.rev || '—') : '—'], ['Fecha', hoy]].forEach(function(f, k){
      var yy = y0 + 12 + k * 11.5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor.apply(doc, K.GRIS); doc.text(f[0] + ':', W - M - wD + 6, yy);
      doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, K.TINTA); doc.text(_rpiTx(f[1]), W - M - wD + 46, yy);
    });
    K.y = y0 + hC + 16;
  };
  K.pie = function(texto){
    var n = doc.getNumberOfPages();
    for(var i = 1; i <= n; i++){
      doc.setPage(i);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor.apply(doc, K.GRIS);
      doc.text('Página:', K.W - K.M - 132 + 6, 22 + 12 + 3 * 11.5);
      doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, K.TINTA); doc.text(i + ' de ' + n, K.W - K.M - 132 + 46, 22 + 12 + 3 * 11.5);
      doc.setDrawColor.apply(doc, K.LINEA); doc.setLineWidth(0.4); doc.line(K.M, K.H - 30, K.W - K.M, K.H - 30);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.6); doc.setTextColor(120, 120, 120);
      doc.text(_rpiTx(texto), K.W / 2, K.H - 20, { align:'center' });
    }
  };
  K.nueva = function(){ doc.addPage(); K.cab(); };
  K.sitio = function(h){ if(K.y + h > K.H - 42){ K.nueva(); return true; } return false; };
  K.titulo = function(t){ K.sitio(46); doc.setFillColor.apply(doc, K.AZUL); doc.rect(K.M, K.y, K.AN, 15, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.8); doc.setTextColor(255, 255, 255); doc.text(_rpiTx(t.toUpperCase()), K.M + 5, K.y + 10.6); K.y += 21; };
  K.parrafo = function(t, o){
    o = o || {}; var sz = o.sz || 8.6, lh = sz * 1.34, x = o.x || K.M;
    doc.setFont('helvetica', o.b ? 'bold' : (o.i ? 'italic' : 'normal')); doc.setFontSize(sz);
    if(o.c) doc.setTextColor.apply(doc, o.c); else doc.setTextColor.apply(doc, K.TINTA);
    var L = doc.splitTextToSize(_rpiTx(t), o.w || (K.AN - (x - K.M)));
    if(K.y + L.length * lh > K.H - 42){ if(L.length * lh < K.H - 160) K.nueva(); }
    doc.setFont('helvetica', o.b ? 'bold' : (o.i ? 'italic' : 'normal')); doc.setFontSize(sz);
    if(o.c) doc.setTextColor.apply(doc, o.c); else doc.setTextColor.apply(doc, K.TINTA);
    doc.text(L, x, K.y + sz); K.y += L.length * lh + (o.despues == null ? 4 : o.despues);
  };
  /* una tabla: cols [{ t, w (fracción), b (negrita), c (al centro) }]; filas: [celdas] o { grupo:'texto' } */
  K.tabla = function(cols, filas, op){
    op = op || {}; var ws = cols.map(function(c){ return c.w * K.AN; }), sz = op.sz || 7.5, lh = sz * 1.3, pad = 4;
    function cabT(){
      if(op.sinCab) return;
      var hh = 14; doc.setFillColor.apply(doc, K.AZUL); doc.rect(K.M, K.y, K.AN, hh, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(sz); doc.setTextColor(255, 255, 255);
      var x = K.M; cols.forEach(function(c, i){ doc.text(_rpiTx(c.t), c.c ? x + ws[i] / 2 : x + pad, K.y + 9.6, c.c ? { align:'center' } : undefined); x += ws[i]; });
      K.y += hh;
    }
    K.sitio(44); cabT();
    filas.forEach(function(f, fi){
      if(f && f.grupo){
        var hg = 13, sig = filas[fi + 1];
        if(K.y + hg + 30 > K.H - 42){ K.nueva(); cabT(); }
        doc.setFillColor.apply(doc, K.AZCL); doc.setDrawColor.apply(doc, K.LINEA); doc.setLineWidth(0.5); doc.rect(K.M, K.y, K.AN, hg, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(sz); doc.setTextColor.apply(doc, K.AZUL); doc.text(_rpiTx(f.grupo), K.M + pad, K.y + 9); K.y += hg;
        return;
      }
      var Ls = f.map(function(v, i){ doc.setFont('helvetica', cols[i].b ? 'bold' : 'normal'); doc.setFontSize(sz); return doc.splitTextToSize(_rpiTx(v), ws[i] - 2 * pad); });
      var n = 1; Ls.forEach(function(L){ n = Math.max(n, L.length); });
      var hf = n * lh + 2 * pad - 1;
      if(K.y + hf > K.H - 42){ K.nueva(); cabT(); }
      var x = K.M;
      ws.forEach(function(w, i){
        if(op.fill && op.fill[i]){ doc.setFillColor.apply(doc, op.fill[i]); doc.rect(x, K.y, w, hf, 'F'); }
        doc.setDrawColor.apply(doc, K.LINEA); doc.setLineWidth(0.5); doc.rect(x, K.y, w, hf);
        doc.setFont('helvetica', cols[i].b ? 'bold' : 'normal'); doc.setFontSize(sz); doc.setTextColor.apply(doc, K.TINTA);
        doc.text(Ls[i], cols[i].c ? x + w / 2 : x + pad, K.y + pad + sz * 0.92, cols[i].c ? { align:'center' } : undefined);
        x += w;
      });
      K.y += hf;
    });
    K.y += op.despues == null ? 9 : op.despues;
  };
  K.cab();
  return K;
}
function rpiPDF(E){
  var K = _rpiDoc(['INSTRUCTIVO', 'RIESGOS ASOCIADOS AL PUESTO DE TRABAJO'], 'instructivo-puesto'), doc = K.doc, emp = K.emp;
  var nivel = ''; RPI_NIVEL.forEach(function(n){ if(n[0] === E.nivel) nivel = n[1]; });
  var donde = [E.donde.oficina ? 'en la oficina (gabinete)' : '', E.donde.obra ? 'en la obra (campo)' : ''].filter(Boolean).join(' y ');
  /* 1 · los datos generales */
  K.titulo('1. Datos generales');
  K.tabla([{ t:'', w:0.24, b:true }, { t:'', w:0.76 }], [
    ['Empresa', (emp.razon || emp.nombre || K.ob.nombre || '—') + (emp.ruc ? '   ·   RUC ' + emp.ruc : '')],
    ['Obra o proyecto', K.obra || '—'],
    [E.puestos.length > 1 ? 'Puestos de trabajo' : 'Puesto de trabajo', E.puestos.join(', ')],
    ['Nivel de riesgo del puesto', (nivel || '—') + '   (según el IPERC del puesto)'],
    ['Alcance', 'Todo trabajador de ' + (E.puestos.length > 1 ? 'estos puestos' : 'este puesto') + (donde ? ', ' + donde : '') + ', antes de empezar a trabajar y cada vez que cambie de puesto o de frente de trabajo.']
  ], { sinCab:true, sz:8, fill:[K.CL, null] });
  /* 2 · para qué es */
  K.titulo('2. Para qué es este instructivo');
  K.parrafo(RPI_CAT.para, { sz:8.8, despues:6 });
  K.tabla([{ t:'Base legal', w:0.27, b:true }, { t:'Qué dice', w:0.73 }], RPI_CAT.base.map(function(b){ return [b[0], b[1]]; }), { sz:7.6 });
  K.parrafo('Peligro: lo que puede hacerte daño.   Riesgo: lo que te puede pasar si el peligro no se controla.   Medidas de control: lo que haces tú y lo que pone la empresa para que no pase.', { sz:7.6, c:K.AZUL, despues:6 });
  /* 3 · el EPP */
  K.titulo('3. Equipo de protección personal (EPP)');
  var B = RPI_CAT.epp_basico.filter(function(x){ return E.eppB[x.k]; }).map(function(x){ return x.n; });
  if(B.length) K.parrafo('EPP básico, obligatorio en toda zona operativa: ' + B.join(' · ') + '.', { sz:8.2, despues:6 });
  var Es = RPI_CAT.epp_especifico.filter(function(x){ return E.eppE[x.k]; });
  if(Es.length) K.tabla([{ t:'EPP específico de este puesto', w:0.42, b:true }, { t:'Cuándo se usa', w:0.58 }], Es.map(function(x){ return [x.n, x.c]; }), { sz:7.6 });
  else K.parrafo('EPP específico: el que pida tu tarea, según tu ATS o tu permiso de trabajo.', { sz:8.2 });
  K.parrafo('Revisa tu EPP antes de usarlo. Si está dañado, vencido o no es de tu talla, no lo uses: pide el cambio.', { sz:8, b:true, despues:6 });
  /* 4… · los riesgos y sus controles */
  var n = 4;
  _rpiVan(E).forEach(function(g){
    K.titulo(n + '. Riesgos y controles — ' + g.n); n++;
    var filas = [], k = 0;
    g.sub.forEach(function(s){ filas.push({ grupo:s.n }); s.riesgos.forEach(function(r){ k++; filas.push([String(k), r.p, r.r, r.m]); }); });
    K.tabla([{ t:'N.°', w:0.055, c:true, b:true }, { t:'Peligro', w:0.255 }, { t:'Riesgo', w:0.25, b:true }, { t:'Medidas de control', w:0.44 }], filas, { sz:7.4 });
  });
  /* lo que siempre se hace y la emergencia */
  K.titulo(n + '. Lo que siempre debes hacer'); n++;
  RPI_CAT.reglas.forEach(function(t){ K.parrafo('•  ' + t, { sz:8.2, x:K.M + 6, despues:2 }); });
  K.y += 6;
  K.titulo(n + '. En una emergencia'); n++;
  RPI_CAT.emergencia.forEach(function(t){ K.parrafo('•  ' + t, { sz:8.2, x:K.M + 6, despues:2 }); });
  K.parrafo('Números de emergencia en el Perú: ' + RPI_CAT.numeros + '.', { sz:8.4, b:true, c:[192, 0, 0], despues:8 });
  /* la declaración de recepción y compromiso, entera en una hoja */
  if(K.y + 330 > K.H - 42) K.nueva();
  K.titulo(n + '. Declaración de recepción y compromiso');
  K.parrafo(RPI_CAT.declaracion, { sz:8.6, despues:8 });
  var M = K.M, AN = K.AN, y = K.y;
  function caja(x, yy, w, h, et, val){
    doc.setDrawColor.apply(doc, K.LINEA); doc.setLineWidth(0.6); doc.rect(x, yy, w, h);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.6); doc.setTextColor.apply(doc, K.GRIS); doc.text(_rpiTx(et).toUpperCase(), x + 5, yy + 9);
    if(val){ doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4); doc.setTextColor.apply(doc, K.TINTA); doc.text(doc.splitTextToSize(_rpiTx(val), w - 10).slice(0, 2), x + 5, yy + 22); }
  }
  caja(M, y, AN * 0.62, 34, 'Nombres y apellidos'); caja(M + AN * 0.62, y, AN * 0.38, 34, 'DNI o carné de extranjería'); y += 34;
  caja(M, y, AN * 0.62, 34, 'Puesto de trabajo', E.puestos.length === 1 ? E.puestos[0] : ''); caja(M + AN * 0.62, y, AN * 0.38, 34, 'Área o frente de trabajo'); y += 44;
  caja(M, y, AN / 3, 70, 'Fecha de entrega', '___ / ___ / ______'); caja(M + AN / 3, y, AN / 3, 70, 'Firma del trabajador'); caja(M + 2 * AN / 3, y, AN / 3, 70, 'Huella digital (índice derecho)'); y += 82;
  var sup = {}; try{ sup = leer(LS_SUP, {}) || {}; }catch(_s){}
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.6); doc.setTextColor.apply(doc, K.AZUL); doc.text('ENTREGADO POR (SUPERVISOR O PREVENCIONISTA DE SST)', M, y + 2); y += 8;
  caja(M, y, AN / 3, 52, 'Nombres y apellidos', sup.nombre || ''); caja(M + AN / 3, y, AN / 3, 52, 'Cargo', sup.cargo || ''); caja(M + 2 * AN / 3, y, AN / 3, 52, 'Firma'); y += 62;
  K.y = y;
  K.parrafo('* Documento de carácter obligatorio: se entrega una copia al trabajador. En OBRASST, el trabajador lo recibe y lo firma en su celular, en su inducción («Recomendaciones de seguridad de tu puesto»); esta hoja es para firmarlo en papel.', { sz:7, i:true, c:K.GRIS });
  K.pie('Documento de carácter obligatorio: se entrega una copia al trabajador y otra queda en su legajo de SST · Ley N.° 29783, art. 35 c) · OBRASST');
  return doc;
}
function rpRegPDF(R, mes, docs){
  var K = _rpiDoc(['REGISTRO DE ENTREGA', 'INSTRUCTIVO DE RIESGOS ASOCIADOS AL PUESTO DE TRABAJO'], 'rp-entrega'), doc = K.doc, emp = K.emp;
  var porDni = {}; try{ (trabsLocal() || []).forEach(function(t){ if(t && t.dni) porDni[String(t.dni).toUpperCase()] = t; }); }catch(_t){}
  K.tabla([{ t:'', w:0.2, b:true }, { t:'', w:0.8 }], [
    ['Empresa', (emp.razon || emp.nombre || K.ob.nombre || '—') + (emp.ruc ? '   ·   RUC ' + emp.ruc : '')],
    ['Obra o proyecto', K.obra || '—'],
    ['Periodo', _rpiMesN(mes)]
  ], { sinCab:true, sz:8, fill:[K.CL, null] });
  K.parrafo('Los trabajadores de esta lista recibieron el instructivo de riesgos asociados a su puesto de trabajo, lo leyeron y lo firmaron en su celular, en su inducción, con su cuenta personal (Ley N.° 29783, art. 35 c).', { sz:8.2, despues:8 });
  var cols = [{ t:'N.°', w:0.05, c:true, b:true }, { t:'Fecha', w:0.1 }, { t:'Nombres y apellidos', w:0.24, b:true }, { t:'DNI / CE', w:0.1 }, { t:'Puesto', w:0.16 }, { t:'Documento', w:0.15 }, { t:'Firma', w:0.2 }];
  var ws = cols.map(function(c){ return c.w * K.AN; }), sz = 7.4, hf = 40, pad = 4;
  function cabT(){ doc.setFillColor.apply(doc, K.AZUL); doc.rect(K.M, K.y, K.AN, 14, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(sz); doc.setTextColor(255, 255, 255);
    var x = K.M; cols.forEach(function(c, i){ doc.text(_rpiTx(c.t), c.c ? x + ws[i] / 2 : x + pad, K.y + 9.6, c.c ? { align:'center' } : undefined); x += ws[i]; }); K.y += 14; }
  cabT();
  R.forEach(function(r, i){
    if(K.y + hf > K.H - 80){ K.nueva(); cabT(); }
    var dt = r.datos || {}, t = porDni[String(r.doc || '').toUpperCase()] || null, puesto = (t && t.puesto) || '';
    var dP = puesto && typeof rpPara === 'function' ? rpPara(docs || [], puesto) : null;
    var val = [String(i + 1), r._f.split('-').reverse().join('/'), r.nombre || (t && t.nombre) || '—', r.doc || (t && t.dni) || '—', puesto || '—', (dP && dP.nombre) || dt.doc_nombre || 'Instructivo del puesto', ''];
    var x = K.M;
    ws.forEach(function(w, k){
      doc.setDrawColor.apply(doc, K.LINEA); doc.setLineWidth(0.5); doc.rect(x, K.y, w, hf);
      doc.setFont('helvetica', cols[k].b ? 'bold' : 'normal'); doc.setFontSize(sz); doc.setTextColor.apply(doc, K.TINTA);
      var L = doc.splitTextToSize(_rpiTx(val[k]), w - 2 * pad).slice(0, 3);
      doc.text(L, cols[k].c ? x + w / 2 : x + pad, K.y + pad + sz * 0.92, cols[k].c ? { align:'center' } : undefined);
      x += w;
    });
    if(r.firma){ try{ _atsFirmaPDF(doc, r.firma, K.M + K.AN - ws[6] + 3, K.y + 3, ws[6] - 6, hf - 6); }catch(_f){} }
    K.y += hf;
  });
  K.y += 16;
  var sup = {}; try{ sup = leer(LS_SUP, {}) || {}; }catch(_s){}
  if(K.y + 60 > K.H - 42) K.nueva();
  doc.setDrawColor.apply(doc, K.LINEA); doc.setLineWidth(0.6); doc.rect(K.M, K.y, K.AN / 2, 50); doc.rect(K.M + K.AN / 2, K.y, K.AN / 2, 50);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.6); doc.setTextColor.apply(doc, K.GRIS);
  doc.text('RESPONSABLE DEL REGISTRO', K.M + 5, K.y + 9); doc.text('FIRMA', K.M + K.AN / 2 + 5, K.y + 9);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4); doc.setTextColor.apply(doc, K.TINTA);
  doc.text(_rpiTx([sup.nombre, sup.cargo].filter(Boolean).join(' · ') || '—'), K.M + 5, K.y + 24);
  K.y += 60;
  K.parrafo('Cada firma la hizo el trabajador en su celular, en el momento, con su cuenta personal: es una firma electrónica (Ley 27269, art. 1) y el registro guarda la fecha, la hora y la versión del documento.', { sz:7, i:true, c:K.GRIS });
  K.pie('Registro de entrega del instructivo de riesgos del puesto · ' + _rpiMesN(mes) + ' · OBRASST');
  return doc;
}
function _atsFirmaPDF(doc, tr, x, y, w, h){
  if(!tr || !tr.p || !tr.p.length) return;
  var prop = (tr.h||380)/1000;
  var esc1 = Math.min(w/1000, h/(1000*prop));
  var aw = 1000*esc1, ah = 1000*prop*esc1;
  var ox = x + (w-aw)/2, oy = y + (h-ah)/2;
  doc.setDrawColor(16,24,32); doc.setLineWidth(Math.max(0.16, aw/260));
  doc.setLineCap('round'); doc.setLineJoin('round');
  tr.p.forEach(function(s){
    var pasos = [], px = s[0]*esc1, py = s[1]*esc1;
    for(var i=2;i<s.length;i+=2){
      var nx = s[i]*esc1, ny = s[i+1]*esc1;
      pasos.push([nx-px, ny-py]); px=nx; py=ny;
    }
    if(!pasos.length) return;
    try{ doc.lines(pasos, ox+s[0]*esc1, oy+s[1]*esc1); }catch(e){}
  });
  doc.setLineWidth(0.2); doc.setDrawColor(150,156,162);
  try{ doc.setLineCap('butt'); doc.setLineJoin('miter'); }catch(e){}
}
  return {
    usar:function(c){ _C = c || {}; return this; },
    CAT:RPI_CAT, NIVEL:RPI_NIVEL, mesN:_rpiMesN, filas:_rpiFilas, van:_rpiVan, valida:_rpiValida,
    pdf:function(E){ return rpiPDF(E); }, registroPdf:function(R, mes, docs){ return rpRegPDF(R, mes, docs); }
  };
})();

/* ══ LA PANTALLA DE LA WEB (16/11/2026) ════════════════════════════════════════════════════════════════════════════
   Marcelo: «falta agregar … el registro de instructivo de riesgos del puesto» en la web. Tres pestañas:
     · Armar el instructivo: lo mismo que en la app (los puestos de tu personal, dónde trabaja, sus peligros con su riesgo y
       sus medidas de control, el EPP y los riesgos propios), con el PDF de la app; «Guardar para esos puestos» lo deja como
       el documento de esos puestos (RIESGO-PUESTO): al trabajador nuevo le llega en su inducción y lo firma en su celular.
     · Los de cada puesto: los documentos guardados (los armados aquí o en la app, y los subidos), con sus puestos.
     · Registro de entrega del mes: quiénes lo recibieron y firmaron en el mes, con su firma, y el registro en PDF (el de la
       app), para la carpeta del personal nuevo del informe del mes.
   Quien lo entrega (nombre y cargo) se recuerda en este navegador. */
var RPIW = { tab:'armar', de:null, ed:null, ctx:null, ctxT:0, puestos:null, item:undefined, mes:'', guardando:false, R:null, docs:null };
var LS_RPIW_SUP = 'sstp_rpi_sup';
function _rpiwSup(){ var s = leer(LS_RPIW_SUP, null) || {}; return { nombre:String(s.nombre || (YO && YO.nombre) || '').slice(0, 80), cargo:String(s.cargo || '').slice(0, 80) }; }
function _rpiwSupGuardar(n, c){ guardar(LS_RPIW_SUP, { nombre:String(n || '').trim().slice(0, 80), cargo:String(c || '').trim().slice(0, 80) }); }
function _rpiwMeses(){ var o = [], d = new Date(); d.setDate(1); for(var i = 0; i < 12; i++){ o.push(d.getFullYear() + '-' + dos(d.getMonth() + 1)); d.setMonth(d.getMonth() - 1); } return o; }
function _rpiwIsoLocal(iso){ var d = new Date(iso); return isNaN(d) ? '' : d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate()); }

function rpiwVista(caja){
  _rpiwCss();
  var oid = (YO.obra || {}).id;
  if(RPIW.de !== oid){ RPIW.de = oid; RPIW.ed = null; RPIW.ctx = null; RPIW.puestos = null; RPIW.item = undefined; RPIW.R = null; RPIW.docs = null; }
  /* lo que pide otra sección al abrir esta (la inducción): qué pestaña */
  if(window.RPIW_TAB){ RPIW.tab = window.RPIW_TAB; window.RPIW_TAB = null; }
  var tab = RPIW.tab || 'armar';
  var T = [['armar', '🧩 Armar el instructivo'], ['docs', '📄 Los de cada puesto'], ['reg', '📋 Registro de entrega del mes']];
  caja.innerHTML = '<div class="seg rpiw-seg" role="tablist" aria-label="Instructivo del puesto">' + T.map(function(t){
      return '<button type="button" role="tab" id="rpiw-t-' + t[0] + '" aria-selected="' + (tab === t[0]) + '" class="' + (tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') +
    '</div><div id="rpiw-aviso"></div><div id="rpiw-cuerpo"></div>';
  T.forEach(function(t){ $('rpiw-t-' + t[0]).onclick = function(){ if(RPIW.tab === t[0]) return; if(RPIW.tab === 'armar') _rpiwLeer(); RPIW.tab = t[0]; rpiwVista(caja); }; });
  var ac = $('acciones'); if(ac) ac.innerHTML = '';
  VISTA.recargar = null;
  _rpiwItem().then(function(it){
    var a = $('rpiw-aviso'); if(!a || it) return;
    if(it === null) a.innerHTML = '<div class="aviso ojo">Tu inducción todavía no tiene la difusión «Recomendaciones de seguridad de tu puesto»: actívala en la app («Inducción del trabajador nuevo») para que el instructivo le llegue al trabajador y lo firme en su celular.</div>';
  });
  var c = $('rpiw-cuerpo');
  if(tab === 'docs') _rpiwDocsVista(c);
  else if(tab === 'reg') _rpiwRegVista(c);
  else _rpiwArmarVista(c);
}
/* la difusión «Recomendaciones de seguridad de tu puesto» de la obra (null si no está; se pide una vez por obra) */
function _rpiwItem(){
  if(RPIW.item !== undefined) return Promise.resolve(RPIW.item);
  var oid = (YO.obra || {}).id;
  return traerIndP().then(function(L){
    var it = (L || []).filter(function(x){ return x.clave === 'recomendaciones'; })[0] || null;
    if((YO.obra || {}).id === oid) RPIW.item = it;
    return it;
  }, function(){ return undefined; });
}
/* lo que el PDF de la app toma del celular, aquí desde la obra */
function _rpiwLogo(du){
  if(!du) return Promise.resolve(null);
  return new Promise(function(ok){ var im = new Image(); im.onload = function(){ ok({ du:du, r:((im.naturalWidth || 1) / (im.naturalHeight || 1)) || 1 }); }; im.onerror = function(){ ok(null); }; im.src = du; });
}
function _rpiwCtx(){
  var oid = (YO.obra || {}).id, nada = function(){ return null; };
  var listo = function(C){ return Object.assign({}, C, { sup:_rpiwSup() }); };
  if(RPIW.ctx && RPIW.ctx.ob && RPIW.ctx.ob.id === oid && Date.now() - RPIW.ctxT < 60000) return cargarEvPDF().then(function(){ return listo(RPIW.ctx); });
  return Promise.all([cargarEvPDF(), empleadorP().catch(nada), estadoLeerP('formatos').catch(nada), genteObraP().catch(function(){ return []; })]).then(function(r){
    var em = r[1] || {}, f = r[2], items = (f && f.valor && typeof f.valor === 'object' && f.valor.items) || {}, o = YO.obra || {};
    return _rpiwLogo(em.logo).then(function(L){
      var C = { emp:{ razon:String(em.razon || ''), ruc:String(o.ruc || ''), logo:L ? L.du : null }, logo:L, obra:String(nombreObraP(o) || ''),
                ob:{ id:o.id, nombre:String(o.nombre || ''), obra_nombre:String(o.obra_nombre || '') }, fmt:items,
                trabs:(r[3] || []).map(function(t){ return { nombre:t.nombre, dni:t.dni, puesto:t.puesto, estatus:'activo' }; }) };
      if((YO.obra || {}).id === oid){ RPIW.ctx = C; RPIW.ctxT = Date.now(); }
      return listo(C);
    });
  });
}

/* ── 1 · armarlo ── */
function _rpiwNuevo(){
  var marc = {}, eb = {};
  RPI_APP.filas().forEach(function(x){ if(!x.r.t) marc[x.r.k] = 1; });
  RPI_APP.CAT.epp_basico.forEach(function(x){ eb[x.k] = 1; });
  return { puestos:[], otro:'', nombre:'', nivel:'alto', donde:{ oficina:false, obra:true }, marc:marc, propios:[], eppB:eb, eppE:{} };
}
/* los puestos para elegir: los de tu personal (primero) y los de siempre */
function _rpiwCandidatos(){
  var visto = {}, out = [], pon = function(p){ var t = String(p || '').replace(/\s+/g, ' ').trim(), k = rpNorm(t); if(t && k && !visto[k]){ visto[k] = 1; out.push(t); } };
  (RPIW.puestos || []).forEach(pon);
  var tuyos = out.length;
  (typeof puestosSugeridos === 'function' ? puestosSugeridos() : []).forEach(pon);
  return { L:out, tuyos:tuyos };
}
function _rpiwArmarVista(c){
  if(!RPIW.ed) RPIW.ed = _rpiwNuevo();
  _rpiwPintar();
  if(RPIW.puestos === null) genteObraP().then(function(L){
    var v = {}; RPIW.puestos = [];
    (L || []).forEach(function(t){ var p = String(t.puesto || '').trim(); if(p && !v[rpNorm(p)]){ v[rpNorm(p)] = 1; RPIW.puestos.push(p); } });
    RPIW.puestos.sort(function(a, b){ return a.localeCompare(b, 'es'); });
    if(VISTA.actual === 'instructivo' && RPIW.tab === 'armar' && $('rpiw-ps')){ _rpiwLeer(); _rpiwPintar(); }
  }, function(){ RPIW.puestos = []; });
}
function _rpiwPintar(){
  var c = $('rpiw-cuerpo'); if(!c) return;
  var E = RPIW.ed, CAT = RPI_APP.CAT, C = _rpiwCandidatos(), sel = {}, S = _rpiwSup();
  E.puestos.forEach(function(p){ sel[rpNorm(p)] = 1; });
  var extra = E.puestos.filter(function(p){ return !C.L.some(function(q){ return rpNorm(q) === rpNorm(p); }); });
  var ps = extra.concat(C.L);
  var h = '<p class="rpiw-intro">🧩 <b>El instructivo de riesgos del puesto.</b> Marca lo que aplica al puesto y guárdalo: al trabajador nuevo de ese puesto le llega en su inducción («Recomendaciones de seguridad de tu puesto») y lo firma en su celular. Es el mismo de la app, en PDF, con la declaración para firmar en papel.</p>' +
    '<div class="rpiw-grid"><div class="rpiw-col">';
  /* 1 · los puestos */
  h += '<div class="tarj"><div class="tarj-cuerpo"><h3><span class="rpiw-n">1</span> ¿A qué puestos va?</h3>' +
    (C.tuyos ? '<p class="ayuda">Primero, los de tu personal.</p>' : '') +
    '<div class="rpiw-ps" id="rpiw-ps">' + (ps.length ? ps.map(function(p, i){ return '<label class="check' + (i === C.tuyos + extra.length && C.tuyos ? ' rpiw-corte' : '') + '"><input type="checkbox" data-rpiw-p="' + esc(p) + '"' + (sel[rpNorm(p)] ? ' checked' : '') + '><span>' + esc(p) + '</span></label>'; }).join('') : '<p class="ayuda">Cargando los puestos…</p>') + '</div>' +
    '<div class="campo"><label for="rpiw-otro">Otro puesto <span class="tenue">(si no está en la lista; varios, con comas)</span></label><input id="rpiw-otro" maxlength="200" value="' + esc(E.otro || '') + '" placeholder="Operario de encofrado"></div>' +
    '<div class="campo"><label for="rpiw-nom">Cómo se llama</label><input id="rpiw-nom" maxlength="120" value="' + esc(E.nombre || '') + '" placeholder="Instructivo de riesgos del operario"></div>' +
    '<div class="campo"><label for="rpiw-nivel">Nivel de riesgo del puesto <span class="tenue">(el que dice tu IPERC)</span></label><select id="rpiw-nivel">' +
      RPI_APP.NIVEL.map(function(n){ return '<option value="' + n[0] + '"' + (E.nivel === n[0] ? ' selected' : '') + '>' + esc(n[1]) + '</option>'; }).join('') + '</select></div></div></div>';
  /* 2 · dónde trabaja */
  h += '<div class="tarj"><div class="tarj-cuerpo"><h3><span class="rpiw-n">2</span> ¿Dónde trabaja?</h3>' +
    '<label class="check"><input type="checkbox" id="rpiw-d-oficina"' + (E.donde.oficina ? ' checked' : '') + '><span>En la oficina (gabinete)</span></label>' +
    '<label class="check"><input type="checkbox" id="rpiw-d-obra"' + (E.donde.obra ? ' checked' : '') + '><span>En la obra (campo)</span></label></div></div>';
  /* 4 · el EPP */
  h += '<div class="tarj"><div class="tarj-cuerpo"><h3><span class="rpiw-n">4</span> Su EPP</h3><p class="ayuda">El básico va en toda zona operativa; marca el específico que usa este puesto.</p>' +
    '<div class="rpiw-sub">EPP básico</div>' + CAT.epp_basico.map(function(x){ return '<label class="check"><input type="checkbox" data-rpiw-eb="' + x.k + '"' + (E.eppB[x.k] ? ' checked' : '') + '><span>' + esc(x.n) + '</span></label>'; }).join('') +
    '<div class="rpiw-sub">EPP específico</div>' + CAT.epp_especifico.map(function(x){ return '<label class="check"><input type="checkbox" data-rpiw-ee="' + x.k + '"' + (E.eppE[x.k] ? ' checked' : '') + '><span>' + esc(x.n) + ' <span class="tenue">· ' + esc(x.c) + '</span></span></label>'; }).join('') +
    '</div></div>';
  /* quién lo entrega */
  h += '<div class="tarj"><div class="tarj-cuerpo"><h3>Quién lo entrega</h3><p class="ayuda">Va en «Entregado por» del PDF. Se recuerda en esta computadora.</p>' +
    '<div class="campo"><label for="rpiw-sup-n">Nombres y apellidos</label><input id="rpiw-sup-n" maxlength="80" value="' + esc(S.nombre) + '"></div>' +
    '<div class="campo"><label for="rpiw-sup-c">Cargo</label><input id="rpiw-sup-c" maxlength="80" value="' + esc(S.cargo) + '" placeholder="Supervisor de SST"></div></div></div>';
  h += '<div class="rpiw-acc"><div class="msg" id="rpiw-msg" role="status"></div><button type="button" class="bt sec" id="rpiw-ver">👁️ Ver el PDF</button><button type="button" class="bt" id="rpiw-guardar">Guardar para esos puestos</button></div>';
  h += '</div>';
  /* 3 · los peligros */
  h += '<div class="tarj rpiw-pel"><div class="tarj-cuerpo"><h3><span class="rpiw-n">3</span> Sus peligros y riesgos</h3><p class="ayuda">Desmarca lo que no aplica a este puesto. Lo de túnel viene sin marcar.</p>';
  var algo = false;
  CAT.grupos.forEach(function(g){
    if(!E.donde[g.k]) return; algo = true;
    h += '<div class="rpiw-g"><b>' + esc(g.n) + '</b>';
    g.sub.forEach(function(s){
      h += '<div class="rpiw-sub">' + esc(s.n) + '</div>';
      s.riesgos.forEach(function(r){
        h += '<label class="rpiw-r"><input type="checkbox" data-rpiw-r="' + r.k + '"' + (E.marc[r.k] ? ' checked' : '') + '><span><b>' + esc(r.p) + '</b> → ' + esc(r.r) + (r.t ? ' <i class="rpiw-tunel">túnel</i>' : '') + '<small>' + esc(r.m) + '</small></span></label>';
      });
    });
    h += '</div>';
  });
  if(!algo) h += '<div class="vacio"><b>Marca dónde trabaja</b>En la oficina, en la obra o en las dos: salen sus peligros.</div>';
  h += '<div id="rpiw-propios">' + (E.propios.length ? '<div class="rpiw-sub">Otros riesgos de este puesto</div>' + E.propios.map(function(r, i){
      return '<div class="rpiw-r rpiw-propio"><span><b>' + esc(r.p) + '</b> → ' + esc(r.r) + '<small>' + esc(r.m) + '</small></span><button type="button" class="bt sec chico" data-rpiw-quitar="' + i + '" aria-label="Quitar este riesgo">✕</button></div>';
    }).join('') : '') + '</div>' +
    '<details class="rpiw-nuevo" id="rpiw-nuevo"><summary>＋ Agregar un riesgo propio de este puesto</summary>' +
      '<div class="campo"><label for="rpiw-np">Peligro <span class="tenue">(lo que puede hacer daño)</span></label><input id="rpiw-np" maxlength="200" placeholder="Ej.: Encofrado a más de 1,80 m"></div>' +
      '<div class="campo"><label for="rpiw-nr">Riesgo <span class="tenue">(lo que puede pasar)</span></label><input id="rpiw-nr" maxlength="200" placeholder="Ej.: Caída de altura"></div>' +
      '<div class="campo"><label for="rpiw-nm">Medidas de control</label><textarea id="rpiw-nm" rows="3" maxlength="600" placeholder="Ej.: Arnés con doble línea de vida anclada; plataforma con baranda."></textarea></div>' +
      '<div class="msg" id="rpiw-pmsg"></div><button type="button" class="bt sec" id="rpiw-agregar">Agregarlo</button></details>';
  h += '</div></div></div>';
  c.innerHTML = h;
  var ac = $('acciones');
  if(ac){ ac.innerHTML = '<button type="button" class="bt sec" id="rpiw-ver2">👁️ Ver el PDF</button><button type="button" class="bt" id="rpiw-guardar2">Guardar para esos puestos</button>'; $('rpiw-ver2').onclick = rpiwVer; $('rpiw-guardar2').onclick = rpiwGuardar; }
  $('rpiw-ver').onclick = rpiwVer; $('rpiw-guardar').onclick = rpiwGuardar;
  ['oficina', 'obra'].forEach(function(k){ $('rpiw-d-' + k).onchange = function(){ _rpiwLeer(); _rpiwPintar(); }; });
  $('rpiw-agregar').onclick = rpiwPropio;
  Array.prototype.forEach.call(c.querySelectorAll('[data-rpiw-quitar]'), function(b){ b.onclick = function(){ _rpiwLeer(); RPIW.ed.propios.splice(+b.getAttribute('data-rpiw-quitar'), 1); _rpiwPintar(); }; });
  ['rpiw-sup-n', 'rpiw-sup-c'].forEach(function(id){ $(id).onchange = function(){ _rpiwSupGuardar($('rpiw-sup-n').value, $('rpiw-sup-c').value); }; });
}
/* lo que está en la pantalla, al estado */
function _rpiwLeer(){
  var E = RPIW.ed; if(!E || !$('rpiw-nom')) return E;
  var ps = []; Array.prototype.forEach.call(document.querySelectorAll('#rpiw-ps [data-rpiw-p]'), function(x){ if(x.checked) ps.push(x.getAttribute('data-rpiw-p')); });
  E.otro = String(($('rpiw-otro') || {}).value || '').trim();
  if(E.otro) E.otro.split(/[,;]+/).forEach(function(p){ if(p.trim()) ps.push(p.trim()); });
  E.puestos = _rpLimpios(ps);
  E.nombre = String(($('rpiw-nom') || {}).value || '').trim().slice(0, 120);
  E.nivel = String(($('rpiw-nivel') || {}).value || 'alto');
  ['oficina', 'obra'].forEach(function(k){ var c = $('rpiw-d-' + k); if(c) E.donde[k] = !!c.checked; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-rpiw-r]'), function(x){ var k = x.getAttribute('data-rpiw-r'); if(x.checked) E.marc[k] = 1; else delete E.marc[k]; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-rpiw-eb]'), function(x){ var k = x.getAttribute('data-rpiw-eb'); if(x.checked) E.eppB[k] = 1; else delete E.eppB[k]; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-rpiw-ee]'), function(x){ var k = x.getAttribute('data-rpiw-ee'); if(x.checked) E.eppE[k] = 1; else delete E.eppE[k]; });
  if($('rpiw-sup-n')) _rpiwSupGuardar($('rpiw-sup-n').value, $('rpiw-sup-c').value);
  /* el «Otro puesto» ya escrito pasa a la lista (marcado): así no se pierde al repintar */
  if(E.otro){ E.otro = ''; }
  return E;
}
function rpiwPropio(){
  _rpiwLeer();
  var p = String(($('rpiw-np') || {}).value || '').trim(), r = String(($('rpiw-nr') || {}).value || '').trim(), m = String(($('rpiw-nm') || {}).value || '').trim(), msg = $('rpiw-pmsg');
  if(!p || !r || !m){ if(msg){ msg.className = 'msg mal'; msg.textContent = 'Escribe el peligro, el riesgo y sus medidas de control.'; } return; }
  RPIW.ed.propios.push({ k:'p' + Date.now().toString(36), p:p.slice(0, 200), r:r.slice(0, 200), m:m.slice(0, 600) });
  _rpiwPintar();
  var y = $('rpiw-propios'); if(y) try{ y.scrollIntoView({ block:'center' }); }catch(_s){}
}
function _rpiwMsg(t, cl){ ['rpiw-msg'].forEach(function(id){ var m = $(id); if(m){ m.className = 'msg' + (cl ? ' ' + cl : ''); m.textContent = t; } }); if(cl === 'mal' && t) toast(t); }
function _rpiwNombre(E){ return E.nombre || ('Instructivo de riesgos - ' + (E.puestos[0] || 'puesto')); }
function rpiwVer(){
  var E = _rpiwLeer(); if(!E) return;
  var v = RPI_APP.valida(E); if(v){ _rpiwMsg(v, 'mal'); return; }
  _rpiwMsg('Armando el PDF…', 'gris');
  _rpiwCtx().then(function(C){
    var d = RPI_APP.usar(C).pdf(E);
    _rpiwMsg('');
    bajarBlob(d.output('blob'), nombreArchivo(_rpiwNombre(E)) + '.pdf');
  })['catch'](function(){ _rpiwMsg('No se pudo armar el PDF. Revisa tu conexión e inténtalo otra vez.', 'mal'); });
}
function rpiwGuardar(){
  if(RPIW.guardando) return;
  var E = _rpiwLeer(); if(!E) return;
  var v = RPI_APP.valida(E); if(v){ _rpiwMsg(v, 'mal'); return; }
  var nombre = _rpiwNombre(E).slice(0, 120), url = '';
  var bts = ['rpiw-guardar', 'rpiw-guardar2'].map(function(id){ return $(id); }).filter(Boolean);
  RPIW.guardando = true; bts.forEach(function(b){ b.disabled = true; }); _rpiwMsg('Guardando…', 'gris');
  _rpiwCtx().then(function(C){
    var blob = RPI_APP.usar(C).pdf(E).output('blob'), f;
    try{ f = new File([blob], nombreArchivo(nombre) + '.pdf', { type:'application/pdf' }); }catch(_f){ f = blob; f.name = nombreArchivo(nombre) + '.pdf'; }
    return subirArchivoP('induccion', f);
  }).then(function(u){
    url = u;
    return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:RP_HOJA, nombre:nombre, url:url, nota:rpNota(E.puestos) });
  }).then(function(){
    /* sin documento general, este queda de general (como al subir uno): la difusión lo pide */
    return _rpiwItem().then(function(it){
      if(it && !it.doc_url){ var y = Object.assign({}, it, { doc_url:url, doc_nombre:nombre }); RPIW.item = y; return _pindGuardar([y], false).then(null, function(){ return null; }); }
    });
  }).then(function(){
    RPIW.guardando = false; RPIW.ed = null; PIRP.docs = null;
    toast('Guardado: le llega al trabajador de ese puesto en su inducción');
    RPIW.tab = 'docs'; if(VISTA.actual === 'instructivo') rpiwVista($('vista'));
  }, function(e){
    RPIW.guardando = false; bts.forEach(function(b){ b.disabled = false; });
    _rpiwMsg((e === 401 || e === 403) ? 'Tu sesión venció o esta cuenta no puede guardar en esta obra.' : 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.', 'mal');
  });
}

/* ── 2 · los de cada puesto (RIESGO-PUESTO-WEB, el mismo de la inducción) ── */
function _rpiwDocsVista(c){
  c.innerHTML = '<div class="tarj"><div class="tarj-cuerpo"><h3>Los documentos de cada puesto</h3>' +
    '<p class="ayuda" style="margin:4px 0 12px">Los armados aquí o en la app, y los que se subieron. El trabajador nuevo ve el de su puesto en su inducción y lo firma.</p>' +
    '<div id="pi-rp"><div class="ayuda">Buscando…</div></div>' +
    '<div class="acciones" style="margin-top:12px"><button type="button" class="bt sec" id="rpiw-otro-mas">🧩 Armar otro</button></div></div></div>';
  $('rpiw-otro-mas').onclick = function(){ RPIW.tab = 'armar'; RPIW.ed = null; rpiwVista($('vista')); };
  _rpiwItem().then(function(it){ if(VISTA.actual === 'instructivo' && RPIW.tab === 'docs' && $('pi-rp')) pirpAbrir(it || null); });
}

/* ── 3 · el registro de entrega del mes ── */
function _rpiwRegVista(c){
  var meses = _rpiwMeses(); if(!RPIW.mes || meses.indexOf(RPIW.mes) < 0) RPIW.mes = meses[0];
  var S = _rpiwSup();
  c.innerHTML = '<div class="pind-filtros"><select id="rpiw-mes" aria-label="Mes">' + meses.map(function(m){ return '<option value="' + m + '"' + (m === RPIW.mes ? ' selected' : '') + '>' + esc(RPI_APP.mesN(m)) + '</option>'; }).join('') + '</select>' +
    '<span class="pind-nota">Las firmas de «Recomendaciones de seguridad de tu puesto»: cada uno recibió el instructivo de su puesto y lo firmó en su celular. Va en la carpeta del personal nuevo del informe del mes.</span></div>' +
    '<div id="rpiw-rej"></div><div class="tarj" id="t-rpiw"></div>' +
    '<div class="tarj"><div class="tarj-cuerpo rpiw-resp"><h3>Responsable del registro</h3><div class="rpiw-dos">' +
      '<div class="campo"><label for="rpiw-sup-n">Nombres y apellidos</label><input id="rpiw-sup-n" maxlength="80" value="' + esc(S.nombre) + '"></div>' +
      '<div class="campo"><label for="rpiw-sup-c">Cargo</label><input id="rpiw-sup-c" maxlength="80" value="' + esc(S.cargo) + '" placeholder="Supervisor de SST"></div></div></div></div>' +
    '<div class="msg" id="rpiw-reg-msg" role="status"></div>';
  ['rpiw-sup-n', 'rpiw-sup-c'].forEach(function(id){ $(id).onchange = function(){ _rpiwSupGuardar($('rpiw-sup-n').value, $('rpiw-sup-c').value); }; });
  var ac = $('acciones');
  if(ac){ ac.innerHTML = '<button type="button" class="bt" id="rpiw-reg-pdf" disabled>Registro de entrega (PDF)</button>'; $('rpiw-reg-pdf').onclick = rpiwRegPdf; }
  $('rpiw-mes').onchange = function(){ RPIW.mes = this.value; RPIW.R = null; _rpiwRegTraer(); };
  VISTA.recargar = function(){ if(VISTA.actual === 'instructivo' && RPIW.tab === 'reg') _rpiwRegTraer(true); };
  _rpiwRegTraer();
}
function _rpiwRegTraer(silencio){
  var mes = RPIW.mes, caja = $('t-rpiw'); if(!caja) return;
  if(!silencio) cargando(caja);
  var b = $('rpiw-reg-pdf'); if(b) b.disabled = true;
  var it = null;
  /* desde el día anterior (por la hora de Lima) y después se mira el día de cada firma, como en la app */
  var desde = new Date(+mes.slice(0, 4), +mes.slice(5, 7) - 1, 1); desde.setDate(desde.getDate() - 1);
  Promise.all([_rpiwItem(), _pirpTraer().catch(function(){ return []; }), genteObraP().catch(function(){ return []; })]).then(function(r){
    it = r[0]; RPIW.docs = r[1] || [];
    var porDni = {}; (r[2] || []).forEach(function(t){ if(t && t.dni) porDni[String(t.dni).toUpperCase()] = t; });
    RPIW.porDni = porDni;
    if(!it) return null;
    return sbGet('sst_ind_reg?select=item,version,cuando,firma,datos,trabajador,usuario,nombre,doc&empresa=eq.' + encodeURIComponent(YO.obra.id) +
                 '&item=eq.' + encodeURIComponent(it.id) + '&cuando=gte.' + encodeURIComponent(desde.toISOString()) + '&order=cuando.asc&limit=3000');
  }).then(function(L){
    if(RPIW.mes !== mes || VISTA.actual !== 'instructivo' || RPIW.tab !== 'reg') return;
    if(!it){ caja.innerHTML = '<div class="vacio"><b>Tu inducción todavía no tiene la difusión «Recomendaciones de seguridad de tu puesto»</b>Actívala en la app («Inducción del trabajador nuevo»): ahí el trabajador recibe el instructivo de su puesto y lo firma.</div>'; return; }
    var visto = {}, R = [];
    (Array.isArray(L) ? L : []).forEach(function(x){
      var f = _rpiwIsoLocal(x.cuando); if(f.slice(0, 7) !== mes) return;
      var k = String(x.trabajador || x.usuario || x.doc || x.nombre || '') + '|' + (x.version || '');
      if(visto[k]) return; visto[k] = 1;
      var tr = (typeof _pindTrazo === 'function') ? _pindTrazo(x.firma) : x.firma;
      R.push(Object.assign({}, x, { _f:f, firma:tr }));
    });
    RPIW.R = R;
    var rj = $('rpiw-rej');
    if(rj) rj.innerHTML = '<div class="rej">' + cifra('Firmaron en el mes', R.length, RPI_APP.mesN(mes), R.length ? 'ok' : '') + cifra('Documentos de puesto', RPIW.docs.length, RPIW.docs.length ? 'guardados' : 'todavía ninguno', '') + '</div>';
    var b2 = $('rpiw-reg-pdf'); if(b2) b2.disabled = !R.length;
    tabla(caja, [
      { k:'_f', t:'Fecha', v:function(x){ return x._f + ' ' + String(x.cuando || ''); }, h:function(x){ return esc(x._f.split('-').reverse().join('/')) + '<span class="sub mono">' + esc(_rpiwHora(x.cuando)) + '</span>'; } },
      { k:'nombre', t:'Trabajador', v:function(x){ return (x.nombre || '') + ' ' + (x.doc || ''); }, h:function(x){ return '<b>' + esc(x.nombre || '—') + '</b>' + (x.doc ? '<span class="sub mono">' + esc(x.doc) + '</span>' : ''); } },
      { k:'_p', t:'Puesto', v:function(x){ return _rpiwPuesto(x); }, h:function(x){ return esc(_rpiwPuesto(x) || '—'); } },
      { k:'_d', t:'Documento', v:function(x){ return _rpiwDoc(x); }, h:function(x){ return esc(_rpiwDoc(x)); } },
      { k:'_firma', t:'Firma', h:function(x){ var img = x.firma ? atsFirmaImg(x.firma, 150) : ''; return img ? '<img class="pind-firma pdifu-firma" alt="Firma de ' + esc(x.nombre || '') + '" src="' + img + '">' : '<span class="gris-t">—</span>'; } }
    ], R, { orden:'_f', asc:true, unidad:'firmas', archivo:'registro-entrega-instructivo',
      vacio:'Ese mes todavía nadie firmó el instructivo de su puesto', vacioSub:'Cuando un trabajador nuevo lo firme en su celular, en su inducción, sale aquí solo.' });
  })['catch'](function(e){ if(RPIW.mes === mes && $('t-rpiw')) fallo($('t-rpiw'), e); });
}
function _rpiwHora(iso){ var d = new Date(iso); return isNaN(d) ? '' : dos(d.getHours()) + ':' + dos(d.getMinutes()); }
function _rpiwPuesto(x){ var t = (RPIW.porDni || {})[String(x.doc || '').toUpperCase()]; return (t && t.puesto) || ''; }
function _rpiwDoc(x){ var p = _rpiwPuesto(x), d = p ? rpPara(RPIW.docs || [], p) : null; return (d && d.nombre) || ((x.datos || {}).doc_nombre) || 'Instructivo del puesto'; }
function rpiwRegPdf(){
  var R = RPIW.R, mes = RPIW.mes, b = $('rpiw-reg-pdf'), m = $('rpiw-reg-msg');
  if(!R || !R.length){ if(m){ m.className = 'msg mal'; m.textContent = 'Ese mes todavía nadie firmó el instructivo de su puesto.'; } return; }
  _rpiwSupGuardar(($('rpiw-sup-n') || {}).value, ($('rpiw-sup-c') || {}).value);
  if(b) b.disabled = true; if(m){ m.className = 'msg gris'; m.textContent = 'Armando el registro…'; }
  _rpiwCtx().then(function(C){
    var d = RPI_APP.usar(C).registroPdf(R, mes, RPIW.docs || []);
    if(b) b.disabled = false; if(m){ m.className = 'msg'; m.textContent = ''; }
    bajarBlob(d.output('blob'), nombreArchivo('Registro de entrega del instructivo del puesto - ' + RPI_APP.mesN(mes)) + '.pdf');
  })['catch'](function(){ if(b) b.disabled = false; if(m){ m.className = 'msg mal'; m.textContent = 'No se pudo armar el registro. Revisa tu conexión e inténtalo otra vez.'; } });
}

/* ── su CSS ── */
function _rpiwCss(){
  if($('rpiw-css')) return;
  var s = document.createElement('style'); s.id = 'rpiw-css';
  s.textContent =
  '.rpiw-seg{margin-bottom:14px;flex-wrap:wrap}' +
  '.rpiw-intro{margin:0 0 14px;max-width:880px;color:var(--texto)}' +
  '.rpiw-grid{display:grid;grid-template-columns:minmax(300px,400px) minmax(0,1fr);gap:16px;align-items:start}' +
  '.rpiw-col{display:flex;flex-direction:column;gap:14px;min-width:0}.rpiw-col .tarj{margin:0}' +
  '.rpiw-n{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--tinta);color:#fff;font-size:12px;margin-right:6px;vertical-align:1px}' +
  '.rpiw-ps{max-height:260px;overflow:auto;border:1px solid var(--raya);border-radius:8px;padding:4px 10px;margin:8px 0 10px}' +
  '.rpiw-ps .check{margin:0;padding:4px 0}.rpiw-corte{border-top:1px dashed var(--raya2);margin-top:4px !important;padding-top:8px !important}' +
  '.rpiw-sub{font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--ojo);margin:12px 0 4px}' +
  '.rpiw-g{margin:12px 0 4px;padding:10px 14px;border:1px solid var(--raya);border-radius:10px;background:var(--fondo)}.rpiw-g > b{display:block;font-size:15px;color:var(--tinta)}' +
  '.rpiw-r{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--raya);line-height:1.4;cursor:pointer}' +
  '.rpiw-r input{margin-top:3px;flex:none;width:18px;height:18px}.rpiw-r small{display:block;color:var(--gris);font-size:12.5px;margin-top:3px}' +
  '.rpiw-propio{justify-content:space-between;cursor:default}.rpiw-tunel{font-style:normal;font-size:11px;padding:1px 7px;border-radius:99px;background:var(--ojo-f);color:var(--ojo);margin-left:4px}' +
  '.rpiw-nuevo{margin:12px 0 0}.rpiw-nuevo summary{cursor:pointer;font-weight:600;color:var(--azul);padding:6px 0}' +
  '.rpiw-acc{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.rpiw-acc .msg{flex-basis:100%;margin:0}' +
  '.rpiw-pel{margin:0}' +
  '.rpiw-dos{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
  '@media (max-width:980px){.rpiw-grid{grid-template-columns:1fr}.rpiw-dos{grid-template-columns:1fr}}';
  document.head.appendChild(s);
}
