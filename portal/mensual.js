/* OBRASST · portal · LA INSPECCIÓN MENSUAL DE EQUIPOS (07/10/2026)
   Marcelo: «las inspecciones […] las mensuales con su check list […] que sea mensual y diario […] las mensuales no creo
   que se cree un QR para ello, quizás un check list general, dónde se agreguen las herramientas o materiales
   automáticamente […] o quizás, un día escoger hacer check list mensual, y escanea los QR para hacer inspección
   diario, y a la par se hace la inspección mensual ese día […] en la mensual, firma producción y seguridad,
   únicamente» y «poder previsualizar todo, o sea las inspecciones, como se hace con los brigadistas».
   Lo que ya había: la revisión del mes de cada equipo («Al día» / «Le toca revisión», con la cinta del color del
   mes) la anota la app al guardar una inspección, con sst_equipo_revisar; y la inspección DIARIA con el QR la hace
   quien usa el equipo (sst_equipo_insp). Aquí va la mensual hecha desde la oficina:
     · la hoja se arma SOLA con todos los equipos de la obra, por grupo; a cada uno se le pone conforme, con
       observación (qué punto no cumple y qué tiene) o fuera de servicio;
     · lo que ya se revisó ese mes en la app aparece hecho; y las inspecciones DIARIAS del mes se pueden traer como
       la revisión del mes de esos equipos («a la par»);
     · firman Producción y Seguridad —en pantalla, o en la hoja impresa—;
     · la hoja se ve antes de imprimirla (con lo marcado, o en blanco para llevarla al campo).
   Lo que guarda, sin nada nuevo en el servidor:
     1 · cada equipo, con la misma función de la app (sst_equipo_revisar): su QR y la app lo ven «al día»;
     2 · la hoja entera (resultados, puntos, firmas) en sst_doc, hoja «ges-inspm», una por mes, sin «url»;
     3 · un renglón en «Inspecciones» por cada formato (sst_inspeccion, ext «wm<mes>-<formato>»), como los que deja
         la app: así cuenta en el resumen, en la lista de inspecciones y en el programa de inspecciones.
   07/10/2026 · Marcelo: «Uno distinto, check list de arnés por tipo». Cada tipo de equipo se revisa con SU check list
   (listas-equipo.js: armar.py lo pone aquí adentro, entre las dos marcas): la pantalla y la hoja van por check list,
   con una columna por punto. El equipo que tiene un checklist propio (el de su inspección diaria) usa ese; el tipo
   que no tiene lista usa los seis puntos del formato «Equipos en general» de la app (EQ_GENERAL: armar.py comprueba
   que sigan siendo los mismos). La hoja guarda el texto de los check list que usó (listas) y, en cada equipo, cuál
   fue (ck): una hoja vieja se sigue leyendo aunque el catálogo cambie. Las hojas de antes (sin ck) son las de los seis
   puntos. Necesita gestion.js, papeles.js (la hoja: _ppDoc) y equipos.js (los tipos, los colores e IQB). */
/* >>> LISTAS-EQUIPO-INI (lo pone armar.py desde listas-equipo.js: no editar aquí) <<< */
/* ══════════════════════════════════════════════════════════════════
   EL CHECK LIST DE LA REVISIÓN MENSUAL, POR TIPO DE EQUIPO (07/10/2026)
   Marcelo: «Uno distinto, check list de arnés por tipo».
   La revisión del mes ya no mira los mismos seis puntos en todo: un arnés
   se revisa como arnés (cintas, costuras, argollas…), una amoladora como
   amoladora (guarda, disco, mango lateral…) y un extintor como extintor.
   Cada lista: k (su llave, la que queda guardada en la hoja del mes), n (cómo
   se llama), t (los tipos de EQ_TIPOS que la usan) y p (sus puntos:
   [nombre corto, lo que se mira]). El nombre corto es lo que queda anotado
   en el equipo cuando un punto no cumple, y sale al escanear su QR.
   · Hasta 12 puntos por lista: entran como columnas en la hoja A4 echada.
   · El primero es siempre el código y la cinta del color del mes (menos en
     el extintor, que lleva sus diez puntos de siempre en su orden).
   · Lo que depende del modelo va con «Si…»: el que no lo tiene, cumple.
   · Donde la app ya tenía el punto escrito (extintores, escaleras, tableros,
     andamios, grúas, montacargas) se parte de su mismo texto.
   · Sin citas de normas: son puntos de revisión, no artículos.
   El tipo que no está aquí («Otro equipo», o uno escrito a mano) se revisa
   con los seis puntos de «Equipos en general». Hoy lo usa el portal
   (armar.py lo pone dentro de portal/mensual.js); la app lo tomará igual.
   ══════════════════════════════════════════════════════════════════ */
var EQL_COD = ['Código y cinta', 'Tiene su código y la cinta del color del mes, visibles.'];
var EQL_GUARDA = 'Está limpia y se guarda en su lugar.';
var EQL_GUARDO = 'Está limpio y se guarda en su lugar.';
/* lo que toda herramienta eléctrica de mano tiene */
var EQL_ELEC = [
  ['Cable', 'El cable no tiene cortes, empalmes con cinta ni conductores a la vista, y entra firme a la herramienta.'],
  ['Enchufe', 'El enchufe está completo, sin quemaduras ni espigas dobladas; con espiga a tierra, o la herramienta es de doble aislamiento.'],
  ['Interruptor', 'El interruptor prende y apaga con firmeza, no queda trabado y el gatillo vuelve solo.'],
  ['Carcasa', 'La carcasa no está rajada, tiene todos sus tornillos y las rejillas de ventilación libres.']
];
function _eqlElec(n, t, propios){ return { k:n, n:t[0], t:t, p:[EQL_COD].concat(EQL_ELEC, propios) }; }

var EQ_LISTAS = [
  /* ── herramientas eléctricas ── */
  _eqlElec('amoladora', ['Amoladora'], [
    ['Guarda', 'Tiene su guarda de protección, fija y sin deformar; no fue retirada ni recortada.'],
    ['Mango lateral', 'Tiene su mango lateral, firme.'],
    ['Disco', 'El disco es el del trabajo y el de la máquina (diámetro y RPM iguales o mayores), sin rajaduras ni desportillado, y dentro de su fecha de vencimiento.'],
    ['Brida y llave', 'La brida y la tuerca ajustan bien el disco, y tiene su llave de ajuste.'],
    ['Funciona', 'Al probarla en vacío gira sin vibración, chispas ni ruidos raros.'],
    ['Limpia y guardada', EQL_GUARDA]]),
  _eqlElec('taladro', ['Taladro'], [
    ['Mandril', 'El mandril abre, cierra y sujeta la broca centrada; tiene su llave, si la usa.'],
    ['Mango lateral', 'Si lleva mango lateral: lo tiene y está firme.'],
    ['Selector', 'El selector de giro y de percusión cambia y se queda en su posición.'],
    ['Brocas', 'Las brocas están rectas, afiladas y sin el vástago gastado.'],
    ['Funciona', 'Al probarlo en vacío gira parejo, sin chispas, olor a quemado ni ruidos raros.'],
    ['Limpio y guardado', EQL_GUARDO]]),
  _eqlElec('rotomartillo', ['Rotomartillo'], [
    ['Portabroca', 'El portabroca traba la broca o el cincel y lo suelta sin forzar; tiene su guardapolvo.'],
    ['Mango lateral', 'Tiene su mango lateral, firme, y el tope de profundidad.'],
    ['Selector', 'El selector (taladro, percusión, cincel) cambia y se queda en su posición.'],
    ['Brocas y cinceles', 'Las brocas y los cinceles no están rajados, doblados ni con la cabeza deformada.'],
    ['Funciona', 'Al probarlo en vacío golpea y gira parejo, sin fugas de grasa ni ruidos raros.'],
    ['Limpio y guardado', EQL_GUARDO]]),
  _eqlElec('sierra-circular', ['Sierra circular'], [
    ['Guarda fija', 'La guarda superior está completa y fija.'],
    ['Guarda móvil', 'La guarda inferior se retrae al cortar y vuelve sola a cubrir el disco.'],
    ['Disco', 'El disco es el del material a cortar, sin dientes rotos, rajaduras ni deformación, y gira en el sentido de la flecha.'],
    ['Cuchilla divisora', 'Si lleva cuchilla divisora: la tiene y está alineada con el disco.'],
    ['Base', 'La base está plana y firme, y las perillas de profundidad e inclinación ajustan.'],
    ['Funciona', 'Al probarla en vacío gira sin vibración ni ruidos raros, y el disco frena al soltar el gatillo.'],
    ['Limpia y guardada', EQL_GUARDA]]),
  _eqlElec('esmeril', ['Esmeril'], [
    ['Guardas', 'Las guardas de las piedras están completas y fijas.'],
    ['Pantallas', 'Tiene sus pantallas transparentes contra chispas, enteras y limpias.'],
    ['Apoyo', 'El apoyo de la pieza está firme y a no más de 3 mm de la piedra.'],
    ['Piedras', 'Las piedras no están rajadas, desportilladas ni gastadas de forma dispareja, y son para las RPM del esmeril.'],
    ['Fijación', 'Está anclado a su mesa o banco y no vibra al funcionar.'],
    ['Funciona', 'Al probarlo gira parejo, sin vibración ni ruidos raros.'],
    ['Limpio', 'Está limpio y no tiene materiales inflamables cerca.']]),
  _eqlElec('pulidora', ['Pulidora'], [
    ['Plato', 'El plato o respaldo está entero, centrado y bien ajustado.'],
    ['Accesorio', 'El disco, la lija o la boina es el que corresponde, está entero y bien sujeto.'],
    ['Empuñadura', 'Tiene su mango o empuñadura auxiliar, firme.'],
    ['Velocidad', 'Si tiene regulador de velocidad: funciona.'],
    ['Funciona', 'Al probarla en vacío gira sin vibración ni ruidos raros.'],
    ['Limpia y guardada', EQL_GUARDA]]),
  { k:'soldadora', n:'Soldadora', t:['Soldadora'], p:[EQL_COD,
    ['Alimentación', 'El cable de alimentación y su enchufe no tienen cortes, empalmes ni quemaduras.'],
    ['Puesta a tierra', 'La máquina tiene su conexión a tierra.'],
    ['Cables de soldar', 'Los cables de soldar no tienen cortes, empalmes ni el aislamiento quemado, y sus terminales ajustan firmes.'],
    ['Portaelectrodo', 'La pinza portaelectrodo está entera, aislada y aprieta el electrodo.'],
    ['Pinza de masa', 'La pinza de masa (tierra) está entera y aprieta firme.'],
    ['Carcasa', 'La carcasa está completa, con sus tapas, y la ventilación libre.'],
    ['Mandos', 'El interruptor y el regulador de amperaje funcionan y se leen.'],
    ['Funciona', 'Al probarla enciende y regula sin recalentar ni chispear en los bornes.'],
    ['Limpia y guardada', 'Está limpia y seca, y se guarda bajo techo con los cables enrollados.']] },
  { k:'extension', n:'Extensión eléctrica', t:['Extensión eléctrica'], p:[EQL_COD,
    ['Cable', 'El cable es vulcanizado, de una sola pieza: sin empalmes, cortes ni el aislamiento reseco o aplastado.'],
    ['Enchufe', 'El enchufe es de tipo industrial, está completo, sin quemaduras y con su espiga a tierra.'],
    ['Tomacorriente', 'El tomacorriente es de tipo industrial, con tapa, entero y sin quemaduras.'],
    ['Entradas', 'El cable entra firme al enchufe y al tomacorriente, con su prensacable; no se ven los conductores.'],
    ['Tierra', 'Tiene conductor de tierra, con continuidad de punta a punta.'],
    ['Capacidad', 'El calibre del cable alcanza para lo que se conecta: no calienta al usarla.'],
    ['Sin añadidos', 'No tiene adaptadores, triples ni tomacorrientes domésticos añadidos.'],
    ['Limpia y guardada', 'Está limpia y seca, y se guarda enrollada, sin nudos.']] },
  _eqlElec('herramienta-electrica', ['Otra herramienta eléctrica'], [
    ['Guardas', 'Tiene sus guardas y protecciones, fijas y completas.'],
    ['Accesorio', 'El accesorio (disco, broca, hoja…) es el que corresponde, está entero y bien sujeto.'],
    ['Funciona', 'Al probarla en vacío trabaja sin vibración, chispas ni ruidos raros.'],
    ['Limpia y guardada', EQL_GUARDA]]),
  /* ── herramientas manuales ── */
  { k:'martillo', n:'Martillo y comba', t:['Martillo', 'Comba'], p:[EQL_COD,
    ['Mango', 'El mango está entero: sin rajaduras, astillas ni cinta que tape un defecto.'],
    ['Cabeza firme', 'La cabeza está firme en el mango, con su cuña: no se mueve.'],
    ['Caras de golpe', 'Las caras de golpe están lisas: sin rebabas, desportilladuras ni forma de hongo.'],
    ['Sin arreglos', 'No tiene soldaduras ni reparaciones caseras.'],
    ['Limpio y guardado', 'Está limpio, sin grasa en el mango, y se guarda en su lugar.']] },
  { k:'llave', n:'Llave', t:['Llave'], p:[EQL_COD,
    ['Bocas', 'Las bocas no están abiertas, redondeadas ni rajadas: calzan justas en la tuerca.'],
    ['Mango', 'El mango está recto, sin fisuras ni soldaduras.'],
    ['Regulación', 'Si es regulable (francesa, stilson): el tornillo y la mordaza móvil corren sin juego y los dientes no están gastados.'],
    ['Sin extensiones', 'No tiene tubos soldados ni señales de haberse usado con extensión o a golpes.'],
    ['Limpia y guardada', EQL_GUARDA]] },
  { k:'alicate', n:'Alicate', t:['Alicate'], p:[EQL_COD,
    ['Mordazas', 'Las mordazas cierran parejas y sus dientes no están gastados.'],
    ['Corte', 'El filo de corte no está mellado.'],
    ['Articulación', 'La articulación abre y cierra sin juego ni trabarse.'],
    ['Mangos', 'Los mangos tienen su forro entero; si es para trabajo eléctrico, el aislamiento es el de fábrica y no está cortado.'],
    ['Sin arreglos', 'No tiene soldaduras ni reparaciones caseras.'],
    ['Limpio y guardado', EQL_GUARDO]] },
  { k:'destornillador', n:'Destornillador', t:['Destornillador'], p:[EQL_COD,
    ['Punta', 'La punta está entera y con su forma: no está redondeada, torcida ni afilada como cincel.'],
    ['Vástago', 'El vástago está recto y firme en el mango.'],
    ['Mango', 'El mango está entero, sin rajaduras ni golpes de martillo.'],
    ['Aislamiento', 'Si es para trabajo eléctrico: el aislamiento del mango y del vástago está entero.'],
    ['Limpio y guardado', EQL_GUARDO]] },
  { k:'cincel', n:'Cincel', t:['Cincel'], p:[EQL_COD,
    ['Cabeza', 'La cabeza no tiene forma de hongo ni rebabas.'],
    ['Filo', 'El filo está entero y afilado, sin mellas ni rajaduras.'],
    ['Cuerpo', 'El cuerpo está recto, sin fisuras ni soldaduras.'],
    ['Protector', 'Si lleva protector de mano: está entero y firme.'],
    ['Limpio y guardado', EQL_GUARDO]] },
  { k:'serrucho', n:'Serrucho', t:['Serrucho'], p:[EQL_COD,
    ['Hoja', 'La hoja está recta, sin rajaduras ni óxido que la debilite.'],
    ['Dientes', 'Los dientes están completos, afilados y trabados.'],
    ['Mango', 'El mango está entero y firme a la hoja, con todos sus tornillos.'],
    ['Funda', 'Tiene su funda o protector de dientes para guardarlo y llevarlo.'],
    ['Limpio y guardado', EQL_GUARDO]] },
  { k:'barreta', n:'Barreta', t:['Barreta'], p:[EQL_COD,
    ['Cuerpo', 'Está recta, sin fisuras, dobleces ni soldaduras.'],
    ['Punta y uña', 'La punta y la uña están enteras, sin rebabas ni desportilladuras.'],
    ['Extremo de golpe', 'Si tiene extremo de golpe: no tiene forma de hongo.'],
    ['Limpia y guardada', 'Está limpia, sin grasa donde se agarra, y se guarda en su lugar.']] },
  { k:'pala', n:'Pala', t:['Pala'], p:[EQL_COD,
    ['Mango', 'El mango está entero: sin rajaduras, astillas ni cinta que tape un defecto.'],
    ['Unión', 'La hoja está firme en el mango, con su remache o tornillo.'],
    ['Hoja', 'La hoja no está rajada ni doblada, y su borde no tiene rebabas.'],
    ['Empuñadura', 'Si tiene empuñadura: está entera y firme.'],
    ['Limpia y guardada', EQL_GUARDA]] },
  { k:'carretilla', n:'Carretilla', t:['Carretilla'], p:[EQL_COD,
    ['Rueda', 'La rueda gira libre, está inflada o entera y su eje no tiene juego.'],
    ['Tolva', 'La tolva no tiene huecos, bordes cortantes ni rajaduras.'],
    ['Mangos', 'Los mangos están rectos, firmes y con sus empuñaduras.'],
    ['Chasis', 'El chasis y las patas no están doblados, rajados ni con soldaduras rotas.'],
    ['Pernos', 'Tiene todos sus pernos, ajustados.'],
    ['Limpia y guardada', 'Está limpia, sin concreto pegado, y se guarda en su lugar.']] },
  { k:'herramienta-manual', n:'Otra herramienta manual', t:['Otra herramienta manual'], p:[EQL_COD,
    ['La que corresponde', 'Es la herramienta que corresponde al trabajo: no está improvisada ni modificada.'],
    ['Mango', 'El mango está firme, sin rajaduras, astillas ni cinta que tape un defecto.'],
    ['Parte útil', 'La cabeza o la parte útil no está deformada, con rebabas ni con el filo mellado.'],
    ['Sin arreglos', 'No tiene uniones soldadas ni reparaciones caseras en las partes que hacen fuerza.'],
    ['Limpia y guardada', 'Está limpia, sin grasa donde se agarra, y se guarda en su lugar.']] },
  /* ── cajas y maletines ── */
  { k:'caja', n:'Caja, maletín o tablero de herramientas', t:['Caja de herramientas', 'Maletín de herramientas', 'Tablero de herramientas'], p:[EQL_COD,
    ['Contenido', 'Tiene su lista de contenido y están todas las herramientas de la lista.'],
    ['Marcado', 'Cada herramienta lleva su código o su marca, y la cinta del mes.'],
    ['Herramientas', 'Las herramientas están en buen estado; las dañadas se retiraron.'],
    ['Caja', 'La caja, el maletín o el tablero está entero: sin bordes cortantes, con sus bisagras y su asa firmes.'],
    ['Cierre', 'Los cierres o el candado funcionan.'],
    ['Orden', 'Está ordenada y limpia; las herramientas con filo o punta van protegidas.']] },
  /* ── izaje ── */
  { k:'eslinga', n:'Eslinga', t:['Eslinga'], p:[EQL_COD,
    ['Etiqueta', 'Tiene su etiqueta legible, con la capacidad de carga.'],
    ['Cinta', 'La cinta no tiene cortes, desgarros, quemaduras, zonas duras ni desgaste que deje ver los hilos de aviso.'],
    ['Costuras', 'Las costuras están completas, sin hilos rotos ni sueltos.'],
    ['Ojales', 'Los ojales no están desgastados ni cortados, y sus refuerzos están enteros.'],
    ['Sin nudos', 'No tiene nudos, torceduras ni empalmes.'],
    ['Sin daño químico', 'No tiene manchas ni decoloración por químicos, calor o sol.'],
    ['Herrajes', 'Si tiene herrajes: no están deformados, fisurados ni con corrosión.'],
    ['Limpia y guardada', 'Está limpia y seca, y se guarda colgada, lejos del sol y de los químicos.']] },
  { k:'estrobo', n:'Estrobo', t:['Estrobo'], p:[EQL_COD,
    ['Identificación', 'Tiene su placa o casquillo con la capacidad de carga, legible.'],
    ['Alambres', 'No tiene daño por calor ni alambres rotos que obliguen a retirarlo: seis en un paso o tres en un torón.'],
    ['Deformación', 'No tiene cocas, aplastamientos, zonas abiertas ni el alma a la vista.'],
    ['Corrosión', 'No tiene oxidación avanzada ni picaduras.'],
    ['Ojales y casquillos', 'Los ojales, guardacabos y casquillos están enteros, sin fisuras ni deslizamiento del cable.'],
    ['Sin nudos', 'No tiene nudos ni empalmes hechos en obra.'],
    ['Limpio y guardado', 'Está limpio y lubricado, y se guarda colgado, bajo techo.']] },
  { k:'grillete', n:'Grillete', t:['Grillete'], p:[EQL_COD,
    ['Marcado', 'Tiene marcada de fábrica su capacidad de carga, legible.'],
    ['Cuerpo', 'El cuerpo no está abierto, doblado, fisurado ni con desgaste notorio.'],
    ['Pasador', 'El pasador es el original: recto, con la rosca sana, y entra y ajusta completo.'],
    ['Seguro', 'Si es de perno y tuerca: tiene su tuerca y su pasador de seguridad.'],
    ['Sin arreglos', 'No tiene soldaduras ni calentamientos, y el pasador no fue cambiado por un perno cualquiera.'],
    ['Limpio y guardado', 'Está limpio, sin oxidación avanzada, y se guarda en su lugar.']] },
  { k:'tecle', n:'Tecle', t:['Tecle'], p:[EQL_COD,
    ['Placa', 'Tiene su placa con la capacidad de carga, legible.'],
    ['Ganchos', 'Los ganchos giran libres, no están abiertos ni deformados y tienen su pestillo de seguridad.'],
    ['Cadena de carga', 'La cadena de carga no tiene eslabones estirados, doblados, fisurados ni gastados, y está lubricada.'],
    ['Cadena de mando', 'La cadena de mando está completa y corre sin trabarse.'],
    ['Freno', 'Al probarlo con carga sube, baja y sostiene: el freno no deja resbalar la carga.'],
    ['Carcasa', 'La carcasa y las poleas no tienen golpes, fisuras ni piezas sueltas.'],
    ['Sin arreglos', 'No tiene soldaduras, eslabones añadidos ni piezas que no sean las de fábrica.'],
    ['Limpio y guardado', 'Está limpio y se guarda colgado, bajo techo.']] },
  /* ── grúas ── */
  { k:'grua', n:'Grúa', t:['Grúa torre', 'Grúa móvil', 'Camión grúa', 'Puente grúa', 'Otra grúa'], p:[EQL_COD,
    ['Certificado', 'El equipo tiene vigente su certificado de operatividad y su mantenimiento al día.'],
    ['Manual y tabla', 'El manual del fabricante y la tabla de cargas están en la cabina.'],
    ['Estructura', 'La estructura, la pluma y los pasadores no tienen fisuras, deformaciones ni pernos flojos.'],
    ['Cables', 'Los cables de izaje no tienen hilos rotos, dobleces ni ensortijados, y enrollan bien en el tambor.'],
    ['Gancho', 'El gancho gira libre, no está abierto ni deformado y tiene su pestillo de seguridad.'],
    ['Poleas', 'Las poleas y el bloque del gancho están en buen estado y lubricados.'],
    ['Fugas', 'No hay fugas de aceite hidráulico, combustible ni refrigerante.'],
    ['Frenos y mandos', 'Los frenos de izaje, de giro y de traslación responden bien, y los mandos de la cabina funcionan y están identificados.'],
    ['Limitadores', 'El limitador de carga y el de fin de carrera del gancho funcionan.'],
    ['Alarmas y luces', 'La bocina, la alarma de retroceso y las luces funcionan.'],
    ['Extintor', 'Tiene extintor de polvo químico seco ABC de 9 kg como mínimo, cargado y a la mano.']] },
  /* ── trabajo en altura ── */
  { k:'arnes', n:'Arnés', t:['Arnés'], p:[EQL_COD,
    ['Etiqueta', 'La etiqueta del fabricante se lee: modelo, fecha de fabricación y número de serie o de lote.'],
    ['Cintas', 'Las cintas no tienen cortes, quemaduras, deshilachado, zonas duras ni decoloración por sol o químicos.'],
    ['Costuras', 'Las costuras están completas: sin hilos sueltos, cortados ni descosidos.'],
    ['Argollas', 'Las argollas en D, la dorsal y las demás, no están deformadas, fisuradas, con corrosión ni con filos.'],
    ['Hebillas', 'Las hebillas y los pasadores cierran y regulan bien; no están doblados ni oxidados.'],
    ['Piezas plásticas', 'Los ojales, los pasacintas y el protector dorsal están completos, sin rasgaduras ni rajaduras.'],
    ['Indicador de caída', 'Si tiene indicador de impacto: no está activado. El arnés no ha detenido una caída.'],
    ['Sin modificaciones', 'No tiene nudos, añadidos, perforaciones ni reparaciones hechas en obra.'],
    ['Limpio y guardado', 'Está limpio y seco, y se guarda colgado, lejos del sol, la humedad y los químicos.']] },
  { k:'linea-de-vida', n:'Línea de vida', t:['Línea de vida'], p:[EQL_COD,
    ['Etiqueta', 'La etiqueta del fabricante se lee: modelo, fecha de fabricación y longitud.'],
    ['Cinta o cuerda', 'La cinta, la cuerda o el cable no tiene cortes, quemaduras, deshilachado, nudos ni zonas duras o adelgazadas.'],
    ['Costuras y terminales', 'Las costuras y los terminales (guardacabos, casquillos) están completos y firmes.'],
    ['Absorbedor', 'Si tiene absorbedor de impacto: está cerrado, con su funda entera. No se ha desplegado.'],
    ['Ganchos', 'Los ganchos y mosquetones abren, cierran solos y traban con su doble seguro.'],
    ['Sin deformación', 'Los ganchos, mosquetones y argollas no están deformados, fisurados ni con corrosión.'],
    ['Retráctil', 'Si es retráctil: sale y recoge completo, y frena al tirón.'],
    ['Sin modificaciones', 'No tiene añadidos, empalmes ni reparaciones hechas en obra.'],
    ['Limpia y guardada', 'Está limpia y seca, y se guarda colgada, lejos del sol, la humedad y los químicos.']] },
  { k:'escalera', n:'Escalera', t:['Escalera'], p:[EQL_COD,
    ['Largueros', 'Los largueros están completos, rectos y sin rajaduras, abolladuras ni corrosión.'],
    ['Peldaños', 'Los peldaños están completos, firmes y a la misma distancia uno de otro.'],
    ['Sin reparaciones', 'No tiene peldaños, largueros ni uniones reparados con alambre, clavos o soldadura improvisada.'],
    ['Zapatas', 'Tiene zapatas antideslizantes en buen estado en los dos largueros.'],
    ['Limpia', 'Está limpia: sin grasa, aceite ni barro en los peldaños.'],
    ['De tijera', 'Si es de tijera: los tirantes o seguros de apertura están completos y traban bien.'],
    ['Extensible', 'Si es extensible: los seguros y la cuerda traban bien, y los tramos se traslapan lo necesario.'],
    ['Sin pintura', 'Si es de madera: no está pintada, porque la pintura tapa las rajaduras.'],
    ['Guardada', 'Se guarda bajo techo, colgada o echada sobre apoyos, donde no estorba.']] },
  { k:'andamio', n:'Andamio', t:['Andamio'], p:[EQL_COD,
    ['Bases', 'Los husillos, las bases y las garruchas con su freno están completos y en buen estado.'],
    ['Verticales', 'Los verticales están rectos, sin abolladuras ni corrosión, y sus rosetas están en buen estado.'],
    ['Horizontales y diagonales', 'Los horizontales y los diagonales están completos, en buen estado y asegurados.'],
    ['Plataformas', 'La plataforma metálica está completa y asegurada según especificación del fabricante, y su superficie es antideslizante.'],
    ['Barandas', 'Las barandas cumplen la medida normada: 1.05 m la superior y 0.54 m la intermedia.'],
    ['Rodapiés', 'Los rodapiés cumplen los 0.10 m, están completos, en buen estado y asegurados.'],
    ['Accesos', 'El andamio cuenta con escaleras en todos los niveles y con escotillas.'],
    ['Sin piezas ajenas', 'No tiene piezas de otro sistema, soldadas, hechizas ni amarradas con alambre.'],
    ['Estabilidad', 'Está nivelado sobre bases firmes y, si pasa de dos cuerpos, asegurado con vientos o amarrado a una estructura estable.'],
    ['Tarjeta', 'Tiene puesta su tarjeta de andamio, al día.']] },
  /* ── emergencia ── */
  { k:'extintor', n:'Extintor', t:['Extintor'], p:[
    ['Presión', 'La presión del manómetro está en la zona verde.'],
    ['Precinto', 'El precinto y el seguro están intactos.'],
    ['Señalización', 'La señalización del extintor es visible desde cualquier punto del área.'],
    ['Acceso', 'El acceso al extintor está libre de obstáculos.'],
    ['Tarjeta', 'La tarjeta de inspección está firmada y vigente.'],
    ['Manguera', 'La manguera y la boquilla están sin fisuras ni obstrucciones.'],
    ['Cilindro', 'El cilindro no presenta abolladuras, corrosión ni pintura desprendida.'],
    ['Soporte', 'El soporte o gabinete está fijo y a la altura reglamentaria.'],
    ['Cinta del mes', 'La cinta del color del mes corresponde al mes en curso.'],
    ['Vigencia', 'El extintor está dentro de su fecha de vencimiento.']] },
  { k:'botiquin', n:'Botiquín', t:['Botiquín'], p:[EQL_COD,
    ['Ubicación', 'Está en su lugar, señalizado y con el acceso libre.'],
    ['Caja', 'La caja o el maletín está entero, limpio y cierra bien.'],
    ['Lista', 'Tiene a la vista la lista de su contenido.'],
    ['Completo', 'Está completo según esa lista: no falta ningún insumo.'],
    ['Vencimientos', 'Ningún insumo está vencido ni vence este mes.'],
    ['Envases', 'Los envases están cerrados y los empaques estériles, sin abrir.'],
    ['Reposición', 'Lo que se usó desde la última revisión está repuesto y anotado.']] },
  { k:'lavaojos', n:'Lavaojos', t:['Lavaojos'], p:[EQL_COD,
    ['Ubicación', 'Está en su lugar, señalizado, iluminado y con el acceso libre.'],
    ['Agua', 'Tiene el agua o la solución al nivel indicado, limpia y dentro de su fecha de cambio.'],
    ['Boquillas', 'Las boquillas tienen sus tapas contra el polvo y están limpias.'],
    ['Activación', 'Se activa con un solo movimiento y el agua sale pareja por las dos boquillas.'],
    ['Tanque', 'El tanque y las mangueras no tienen fugas, rajaduras ni óxido.'],
    ['Tarjeta', 'Su tarjeta de inspección está al día.'],
    ['Limpio', 'Está limpio por fuera y por dentro.']] },
  { k:'camilla', n:'Camilla', t:['Camilla'], p:[EQL_COD,
    ['Ubicación', 'Está en su lugar, señalizada y con el acceso libre.'],
    ['Tabla', 'La tabla no tiene rajaduras, astillas ni deformación.'],
    ['Correas', 'Tiene todas sus correas, sin cortes, y sus hebillas cierran.'],
    ['Inmovilizador', 'Si lleva inmovilizador de cabeza y collarín: están completos.'],
    ['Asas', 'Las asas están libres y enteras.'],
    ['Limpia', 'Está limpia y seca.']] },
  /* ── equipos ── */
  { k:'tablero-electrico', n:'Tablero eléctrico', t:['Tablero eléctrico'], p:[
    ['Código y cinta', 'El tablero está identificado con su código y el circuito que alimenta, y tiene la cinta del color del mes.'],
    ['Caja', 'La caja es de material aislante o metálica con puesta a tierra.'],
    ['Puerta', 'El tablero cierra completamente y su puerta tiene seguro.'],
    ['Diferencial', 'El interruptor diferencial está instalado y la prueba del botón de test quedó registrada.'],
    ['Tapa interna', 'La tapa interna está colocada y sin partes energizadas expuestas.'],
    ['Cables', 'Los cables entran por prensaestopas, sin empalmes con cinta ni conductores sueltos.'],
    ['Bornes', 'Los bornes están ajustados y sin señales de recalentamiento.'],
    ['Parada de emergencia', 'Cuenta con parada de emergencia accesible e identificada.'],
    ['Bloqueo', 'Tiene punto de bloqueo para candado (LOTO).'],
    ['Señalización', 'Tiene señal de riesgo eléctrico y la indicación del voltaje.'],
    ['Diagrama', 'El diagrama unifilar está pegado en el interior y actualizado.'],
    ['Espacio libre', 'Está libre el espacio de trabajo frente al tablero.']] },
  { k:'montacargas', n:'Montacargas', t:['Montacargas'], p:[EQL_COD,
    ['Fugas', 'No hay fugas de aceite hidráulico, combustible ni refrigerante bajo el equipo.'],
    ['Neumáticos', 'Los neumáticos no presentan cortes, desgaste excesivo ni objetos incrustados.'],
    ['Horquillas', 'Las horquillas no presentan fisuras, deformación ni desgaste mayor al 10% del espesor original, y tienen su pasador o seguro.'],
    ['Cadenas', 'Las cadenas de elevación están lubricadas, sin eslabones dañados y con tensión pareja.'],
    ['Protecciones', 'El respaldo de carga y el techo protector están instalados y sin deformaciones.'],
    ['Placa', 'La placa de capacidad de carga está instalada y legible.'],
    ['Frenos y dirección', 'Los frenos de servicio y de estacionamiento operan correctamente, y la dirección responde sin juego excesivo.'],
    ['Alarmas y luces', 'La bocina, la alarma de retroceso, la baliza y las luces funcionan.'],
    ['Mástil', 'El mástil sube, baja e inclina sin trabas, y los mandos hidráulicos retornan a neutro al soltarlos.'],
    ['Cinturón', 'El cinturón de seguridad está operativo.'],
    ['Extintor', 'El extintor del equipo está operativo y con tarjeta vigente.']] },
  { k:'compresora', n:'Compresora', t:['Compresora'], p:[EQL_COD,
    ['Tanque', 'El tanque no tiene abolladuras, corrosión ni soldaduras de reparación.'],
    ['Válvula de seguridad', 'La válvula de seguridad está instalada y dispara al probarla.'],
    ['Manómetro', 'El manómetro funciona y se lee, y el presostato corta a la presión de trabajo.'],
    ['Purga', 'La válvula de purga funciona y el tanque se purga.'],
    ['Mangueras', 'Las mangueras y los acoples no tienen cortes ni fugas, y llevan su seguro contra el latigazo.'],
    ['Guardas', 'La faja y las poleas tienen su guarda, fija y completa.'],
    ['Motor', 'El cable y el enchufe están enteros y con tierra; o el motor a combustible no tiene fugas.'],
    ['Aceite', 'El nivel de aceite es el correcto y no hay fugas.'],
    ['Parada', 'El interruptor o la parada de emergencia funciona.'],
    ['Estable', 'Está nivelada, con sus ruedas o apoyos completos.'],
    ['Limpia', 'Está limpia y con el filtro de aire en buen estado.']] },
  { k:'grupo-electrogeno', n:'Grupo electrógeno', t:['Grupo electrógeno'], p:[EQL_COD,
    ['Fugas', 'No hay fugas de combustible, aceite ni refrigerante.'],
    ['Niveles', 'Los niveles de aceite, refrigerante y combustible son los correctos.'],
    ['Puesta a tierra', 'Está conectado a tierra.'],
    ['Tablero', 'El tablero de control, sus instrumentos y la parada de emergencia funcionan.'],
    ['Protecciones', 'Los interruptores de salida, el termomagnético y el diferencial, funcionan.'],
    ['Tomas y cables', 'Los tomacorrientes y los cables de salida están enteros, sin empalmes ni quemaduras.'],
    ['Guardas', 'Las partes en movimiento y las calientes tienen su guarda o protección.'],
    ['Batería', 'La batería está fija, con sus bornes limpios y cubiertos.'],
    ['Escape', 'El escape no tiene fugas y descarga hacia un lugar ventilado.'],
    ['Extintor y bandeja', 'Tiene su extintor a la mano y su bandeja contra derrames.'],
    ['Limpio', 'Está limpio y con sus tapas y puertas completas.']] },
  { k:'mezcladora', n:'Mezcladora', t:['Mezcladora'], p:[EQL_COD,
    ['Guardas', 'La faja, las poleas y los engranajes tienen su guarda, fija y completa.'],
    ['Tambor', 'El tambor no tiene rajaduras y sus paletas están completas y firmes.'],
    ['Volante y seguro', 'El volante de volteo gira y su seguro traba el tambor en posición.'],
    ['Motor', 'El motor no tiene fugas de combustible ni de aceite; si es eléctrico, el cable y el enchufe están enteros y con tierra.'],
    ['Parada', 'El interruptor o la parada funciona y está al alcance del operador.'],
    ['Chasis', 'El chasis no tiene fisuras ni soldaduras rotas.'],
    ['Ruedas', 'Las ruedas están completas y la máquina queda estable y calzada al trabajar.'],
    ['Engrase', 'Los puntos de engrase están atendidos.'],
    ['Limpia', 'Está limpia, sin concreto endurecido en el tambor.']] },
  { k:'vibradora', n:'Vibradora', t:['Vibradora'], p:[EQL_COD,
    ['Motor', 'El motor arranca y trabaja parejo, sin fugas de combustible ni de aceite; si es eléctrico, el cable y el enchufe están enteros y con tierra.'],
    ['Interruptor', 'El interruptor o la parada funciona.'],
    ['Manguera', 'La manguera no tiene cortes, aplastamientos ni la malla a la vista.'],
    ['Acoples', 'Los acoples de la manguera al motor y a la aguja están firmes.'],
    ['Aguja', 'La aguja no está rajada ni gastada y vibra pareja.'],
    ['Carcasa', 'La carcasa y el asa están completas, con sus guardas puestas.'],
    ['Limpia y guardada', 'Está limpia, sin concreto pegado, y se guarda con la manguera sin doblar.']] }
];
/* la lista de un tipo de equipo, o null si se revisa con los puntos generales */
function eqListaDeTipo(tipo){
  var n = String(tipo || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if(!n) return null;
  for(var i = 0; i < EQ_LISTAS.length; i++) for(var j = 0; j < EQ_LISTAS[i].t.length; j++) if(EQ_LISTAS[i].t[j].toLowerCase() === n) return EQ_LISTAS[i];
  return null;
}
function eqListaDeLlave(k){ for(var i = 0; i < EQ_LISTAS.length; i++) if(EQ_LISTAS[i].k === k) return EQ_LISTAS[i]; return null; }
/* <<< LISTAS-EQUIPO-FIN >>> */
var MEN_HOJA = 'ges-inspm';
var MEN_PUNTOS = [
  ['Código y cinta', 'Tiene su código y la cinta del color del mes, visibles.'],
  ['Completo', 'Está completo: sin piezas faltantes, sueltas ni cambiadas.'],
  ['Sin daños', 'No tiene daños a la vista: cortes, golpes, rajaduras, deformación ni corrosión.'],
  ['Sin arreglos caseros', 'No tiene reparaciones caseras ni añadidos.'],
  ['Funciona', 'Funciona bien al probarlo, si se puede probar.'],
  ['Limpio y en su lugar', 'Está limpio y se guarda en su lugar.']
];
var MEN_GENERAL = 'Equipos en general';
var MEN_R = {
  c:{ n:'Conforme', bt:'✓ Conforme', pill:'ok', srv:'conforme', pdf:'CONFORME' },
  o:{ n:'Con observación', bt:'⚠ Observado', pill:'ojo', srv:'observado', pdf:'OBSERVADO' },
  f:{ n:'Fuera de servicio', bt:'⛔ Fuera de servicio', pill:'mal', srv:'fuera', pdf:'FUERA DE SERVICIO' }
};
var MEN_SRV = { conforme:'c', observado:'o', fuera:'f' };
var MEN_PASOS = ['datos', 'equipos', 'firmas', 'hoja'];
var MEN_NOM = { datos:'El mes', equipos:'Los equipos', firmas:'Las firmas', hoja:'La hoja' };
var MEN = null;

function _menCss(){
  if($('men-css')) return;
  var st=document.createElement('style'); st.id='men-css';
  st.textContent=[
    '.hoja.ancha.men-h{width:min(1180px,100%)}',
    '.men-est{margin:0 auto 0 0;min-height:0;align-self:center}',
    '.men-res{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin:0 0 12px;font-size:13.5px;color:var(--texto)}.men-res b{color:var(--tinta);font-weight:600}',
    '.men-barra{height:8px;border-radius:5px;background:#EEF1F4;overflow:hidden;display:flex;margin:0 0 14px}.men-barra i{display:block;height:100%}.men-barra i.c{background:#2E7D32}.men-barra i.o{background:#E8A000}.men-barra i.f{background:#D9261C}',
    '.men-herr{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;margin:0 0 12px}.men-herr input[type=search]{flex:1 1 220px;max-width:340px;min-width:0;padding:8px 11px;font-size:13.5px}',
    '.men-g{margin:0 0 14px;border:1px solid var(--raya);border-radius:12px;background:var(--panel);overflow:hidden}',
    '.men-g-cab{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;justify-content:space-between;padding:9px 12px;background:#FAFBFC;border-bottom:1px solid var(--raya)}',
    '.men-g-cab h4{margin:0;font-size:13.5px;color:var(--tinta);font-weight:600}.men-g-cab small{font-size:12px;color:var(--gris);font-weight:400;margin-left:6px}',
    '.men-f{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 14px;align-items:center;padding:9px 12px;border-bottom:1px solid var(--raya)}.men-f:last-child{border-bottom:0}',
    '.men-f.c{background:#F6FBF8}.men-f.o{background:#FFFAF0}.men-f.f{background:#FEF6F5}',
    '.men-q{min-width:0;display:flex;flex-wrap:wrap;gap:2px 9px;align-items:baseline}.men-q b{font-weight:500;color:var(--tinta);font-size:14px}.men-q small{color:var(--gris);font-size:12.5px;flex-basis:100%}.men-q small.ya{color:var(--azul)}',
    '.men-r{display:inline-flex;gap:4px;flex-wrap:wrap}',
    '.men-r button{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;font-size:12.5px;border:1px solid var(--raya2);background:var(--panel);color:var(--texto);border-radius:8px;padding:6px 10px;white-space:nowrap}',
    '.men-r button:hover{background:var(--fondo)}.men-r button.on[data-r=c]{background:#2E7D32;border-color:#2E7D32;color:#fff}.men-r button.on[data-r=o]{background:#E8A000;border-color:#E8A000;color:#1A1A1A}.men-r button.on[data-r=f]{background:#D9261C;border-color:#D9261C;color:#fff}',
    '.men-o{grid-column:1 / -1;display:grid;gap:7px;padding:2px 0 3px}.men-o input{padding:7px 10px;font-size:13.5px}.men-o .chips{gap:5px}.men-o .chip{font-size:12px;padding:4px 9px}.men-o .chip.on{background:#B45309;border-color:#B45309}',
    '.men-o label{margin:0;font-size:12px}',
    '.men-firmas{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin:0 0 12px}',
    '.men-fc{border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:14px}.men-fc h4{margin:0 0 10px;font-size:14px;color:var(--tinta)}',
    '.men-fc .campo{margin:0 0 10px}.men-trazo{border:1px dashed var(--raya2);border-radius:10px;min-height:96px;display:grid;place-items:center;padding:8px;margin:0 0 8px;background:#FCFDFE;color:var(--gris);font-size:13px;text-align:center}',
    '.men-trazo img{max-width:100%;max-height:120px;display:block}',
    '.men-color{display:flex;flex-wrap:wrap;gap:6px}',
    '.men-modo{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:0 0 12px}.men-modo p{margin:0;font-size:13px;color:var(--gris);flex:1 1 260px;line-height:1.45}',
    '.men-puntos{margin:0 0 14px;padding:10px 12px 10px 30px;border:1px solid var(--raya);border-radius:10px;background:#F7FAFC;font-size:13px;line-height:1.5;color:var(--texto)}.men-puntos li{margin:0 0 2px}',
    '.men-otros{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:13px;color:var(--gris);margin:0 0 14px}',
    '.men-puntos li b{font-weight:600;color:var(--tinta)}',
    '.men-listas{display:grid;gap:6px;margin:0 0 4px}',
    '.men-lista{border:1px solid var(--raya);border-radius:10px;background:var(--panel)}.men-lista summary{cursor:pointer;padding:9px 12px;font-size:13.5px;color:var(--tinta)}.men-lista summary b{font-weight:600}.men-lista summary small{color:var(--gris);font-size:12px;margin-left:4px}',
    '.men-lista .men-puntos{margin:0 10px 10px}',
    '.men-g-bt{display:inline-flex;flex-wrap:wrap;gap:4px 14px;align-items:center}',
    '.men-g-pts .men-puntos{margin:0;border:0;border-bottom:1px solid var(--raya);border-radius:0}',
    '@media (max-width:760px){.men-f{grid-template-columns:minmax(0,1fr)}.men-r{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.men-r button{padding:8px 4px;white-space:normal}.men-lg{display:none}}'
  ].join('\n');
  document.head.appendChild(st);
}

/* ── fechas y meses ───────────────────────────────────────────────────────────────────────── */
function menMesTxt(mes){ return eqMesNombre(mes+'-01')+' de '+String(mes).slice(0, 4); }
function menMesAntes(mes){ var y=+String(mes).slice(0, 4), m=+String(mes).slice(5, 7)-1; if(m<1){ m=12; y--; } return y+'-'+dos(m); }
function menUltDia(mes){ var d=new Date(+String(mes).slice(0, 4), +String(mes).slice(5, 7), 0); return mes+'-'+dos(d.getDate()); }
/* una revisión se anota hasta 60 días después (así lo cuida el servidor: más atrás le pone la fecha de hoy) */
function menFechaMin(){ var d=new Date(); d.setDate(d.getDate()-60); return d.getFullYear()+'-'+dos(d.getMonth()+1)+'-'+dos(d.getDate()); }
function menMesEditable(mes){ return mes<=MES && menUltDia(mes)>=menFechaMin(); }
function menDMA(iso){ var p=String(iso||'').slice(0, 10).split('-'); return p.length===3 ? p[2]+'/'+p[1] : ''; }

/* ── los check list ───────────────────────────────────────────────────────────────────────── */
var MEN_LISTA_MAX = 14;      /* hasta cuántos puntos entran como columnas en la hoja; con más, la hoja dice cuáles no cumple */
function _menGeneral(){ return { k:'', n:MEN_GENERAL, p:MEN_PUNTOS }; }
/* una lista guardada en la hoja → limpia, o null */
function _menListaLimpia(x){
  if(!x || typeof x!=='object' || !Array.isArray(x.p)) return null;
  var p=[];
  x.p.forEach(function(z){
    if(p.length>=80) return;
    var c=gesTxt(Array.isArray(z) ? z[0] : '').slice(0, 40), tx=gesTxt(Array.isArray(z) ? z[1] : z).slice(0, 300);
    if(tx) p.push([c || 'Punto '+(p.length+1), tx]);
  });
  return p.length ? { n:gesTxt(x.n).slice(0, 80) || 'Check list', p:p } : null;
}
/* el check list con el que se revisa un equipo: el suyo propio (el de su inspección diaria), el de su tipo, o los
   seis puntos generales */
function menListaDe(x){
  var own=null;
  try{ own=(x && typeof IQB!=='undefined') ? IQB.limpiarChecklist(x.checklist) : null; }catch(e){ own=null; }
  if(own) return { k:'p:'+x.id, n:'Check list propio de '+(gesTxt(x.codigo) || 'el equipo'), p:own.map(function(tx, i){ return ['Punto '+(i+1), tx]; }) };
  var L=null; try{ L=(typeof eqListaDeTipo==='function') ? eqListaDeTipo(x && x.tipo) : null; }catch(e2){ L=null; }
  return L ? { k:L.k, n:L.n, p:L.p } : _menGeneral();
}
/* la lista de una llave: la que la hoja guardó, la del catálogo de hoy, o null si ya nadie la conoce */
function _menListaK(ck, listas){
  if(!ck) return _menGeneral();
  var g=listas && listas[ck]; if(g && Array.isArray(g.p) && g.p.length) return { k:ck, n:g.n, p:g.p };
  var L=null; try{ L=(typeof eqListaDeLlave==='function') ? eqListaDeLlave(ck) : null; }catch(e){ L=null; }
  return L ? { k:L.k, n:L.n, p:L.p } : null;
}
/* el orden de los check list: el del catálogo; después los propios; al final, los seis puntos generales */
function _menOrdenLista(ck){
  if(!ck) return 9999;
  if(typeof EQ_LISTAS!=='undefined') for(var i=0;i<EQ_LISTAS.length;i++) if(EQ_LISTAS[i].k===ck) return i;
  return 9000;
}

/* ── la hoja guardada ─────────────────────────────────────────────────────────────────────── */
function _menFirma(x){
  x=(x && typeof x==='object') ? x : {};
  var f=(x.f && typeof x.f==='object' && Array.isArray(x.f.p) && x.f.p.length) ? { h:+x.f.h||380, p:x.f.p } : null;
  return { n:gesTxt(x.n).slice(0, 120), c:gesTxt(x.c).slice(0, 80), f:f, t:f ? String(x.t||'').slice(0, 30) : '' };
}
function _menItem(x, listas){
  if(!x || typeof x!=='object' || !x.id || !MEN_R[x.r]) return null;
  var ck=String(x.ck||''), Lz=_menListaK(ck, listas);
  if(!Lz){ ck=''; Lz={ p:[] }; }        /* una llave que ya nadie conoce: queda el resultado, sin sus puntos */
  var v={}, p=[];
  (Array.isArray(x.p) ? x.p : []).forEach(function(i){ i=+i; if(i>=0 && i<Lz.p.length && i===Math.floor(i) && !v[i]){ v[i]=1; p.push(i); } });
  p.sort(function(a, b){ return a-b; });
  return { id:String(x.id), cod:gesTxt(x.cod).slice(0, 30), tipo:gesTxt(x.tipo).slice(0, 60), det:gesTxt(x.det).slice(0, 200), resp:gesTxt(x.resp).slice(0, 80),
           g:gesTxt(x.g).slice(0, 60), fk:gesTxt(x.fk).slice(0, 60), ck:ck, r:x.r, p:(x.r==='o') ? p : [], o:(x.r==='c') ? '' : gesTxt(x.o).slice(0, 300),
           f:/^\d{4}-\d{2}-\d{2}$/.test(String(x.f||'')) ? x.f : '', d:x.d ? 1 : 0, app:x.app ? 1 : 0, s:x.s ? 1 : 0 };
}
function menLimpio(o){
  o=(o && typeof o==='object') ? o : {};
  var mes=/^\d{4}-\d{2}$/.test(String(o.mes||'')) ? o.mes : MES, items=[], v={}, listas={};
  if(o.listas && typeof o.listas==='object' && !Array.isArray(o.listas)) Object.keys(o.listas).slice(0, 600).forEach(function(k){
    if(!/^[A-Za-z0-9:._-]{1,90}$/.test(k)) return;
    var l=_menListaLimpia(o.listas[k]); if(l) listas[k]=l;
  });
  (Array.isArray(o.items) ? o.items : []).forEach(function(x){ var it=_menItem(x, listas); if(it && !v[it.id]){ v[it.id]=1; items.push(it); } });
  /* en la hoja viajan solo los check list que algún equipo usa, con su texto: el del catálogo también */
  var fin={};
  items.forEach(function(it){ if(!it.ck || fin[it.ck]) return; var Lz=_menListaK(it.ck, listas); if(Lz) fin[it.ck]={ n:Lz.n, p:Lz.p }; });
  var fe=String(o.fecha||''), col=(typeof eqColor==='function' && eqColor(o.color)) ? eqColor(o.color).k : '';
  return { v:2, k:'inspm', mes:mes, fecha:(/^\d{4}-\d{2}-\d{2}$/.test(fe) && fe.slice(0, 7)===mes) ? fe : '', color:col,
           cod:gesTxt(o.cod).slice(0, 40), ver:gesTxt(o.ver).slice(0, 12), prod:_menFirma(o.prod), sst:_menFirma(o.sst), listas:fin, items:items,
           por:gesTxt(o.por).slice(0, 80), cuando:String(o.cuando||'').slice(0, 30) };
}
function menNombre(mes){ return 'Inspección mensual de equipos · '+mes; }
/* las hojas guardadas, de la más reciente a la más antigua: [{ id, d, texto }] (una por mes) */
function menTraer(){
  return traer('sst_doc', '&select=id,hoja,nombre,nota,creado&hoja=eq.'+MEN_HOJA+'&order=creado.desc', 200).then(function(rows){
    var por={}, out=[];
    (rows||[]).forEach(function(f){
      if(!f || (f.hoja && f.hoja!==MEN_HOJA)) return;
      var n=nota(f.nota); if(!n || n.k!=='inspm') return;
      var d=menLimpio(n); if(por[d.mes]) return;
      por[d.mes]=1; out.push({ id:f.id, d:d, texto:String(f.nota||'') });
    });
    out.sort(function(a, b){ return a.d.mes<b.d.mes ? 1 : -1; });
    return out;
  });
}
function menEquipos(){ return traerTodo('sst_equipo_qr', '&select=*&order=codigo.asc', 5000); }
/* lo que la inspección diaria encontró: las observaciones de los puntos que no cumplen (o su nota) */
function _menDiariaObs(i){
  var L=[], v={};
  (Array.isArray(i && i.puntos) ? i.puntos : []).forEach(function(x){
    if(!x || String(x.e||'').toUpperCase()!=='NC') return;
    var o=gesTxt(x.o) || gesTxt(x.t); if(o && !v[o]){ v[o]=1; L.push(o); }
  });
  return (L.join(' · ') || gesTxt(i && i.nota)).slice(0, 300);
}
/* las inspecciones diarias de ese mes: la última de cada equipo → { idEquipo:{ id, fecha, r, por, o } }.
   Primero la lista liviana (sin los puntos); el detalle se pide solo de las que salieron con observación o no aptas */
function menDiarias(mes){
  return traerTodo('sst_equipo_insp', '&fecha=gte.'+mes+'-01&fecha=lte.'+menUltDia(mes)+'&select=id,equipo,fecha,hora,resultado,op_nombre,creado&order=creado.asc', 20000).then(function(rows){
    var por={};
    (rows||[]).forEach(function(i){
      if(!i || String(i.fecha||'').slice(0, 7)!==mes) return;
      var r=({ conforme:'c', observado:'o', no_apto:'f' })[i.resultado]; if(!r) return;
      var a=por[i.equipo], k=String(i.fecha)+' '+String(i.hora||'')+' '+String(i.creado||'');
      if(!a || k>=a.k) por[i.equipo]={ k:k, id:i.id, fecha:String(i.fecha).slice(0, 10), r:r, por:gesTxt(i.op_nombre), o:'' };
    });
    var ids=[]; Object.keys(por).forEach(function(e){ if(por[e].r!=='c' && por[e].id) ids.push(String(por[e].id)); });
    if(!ids.length) return por;
    var tandas=[], det={};
    for(var j=0;j<ids.length;j+=40) tandas.push(ids.slice(j, j+40));
    return Promise.all(tandas.map(function(t){
      return sbGet('sst_equipo_insp?'+filtroObra('sst_equipo_insp')+'&id=in.('+t.map(encodeURIComponent).join(',')+')&select=id,puntos,nota&limit=100')
        .then(function(rs){ (rs||[]).forEach(function(i){ if(i && i.id) det[i.id]=_menDiariaObs(i); }); }, function(){});
    })).then(function(){
      Object.keys(por).forEach(function(e){ if(por[e].r!=='c') por[e].o=det[por[e].id]||''; });
      return por;
    });
  });
}

/* ── los equipos de la hoja ───────────────────────────────────────────────────────────────── */
function menGrupoDe(x){
  var T=null; try{ T=eqTipoDe(x.tipo); }catch(e){ T=null; }
  return { g:T ? T.g : 'Otros equipos', f:(T && T.f) ? T.f : '' };
}
function menDetalle(x){
  var mms=[x.marca, x.modelo, x.serie ? 'S/N '+x.serie : ''].filter(Boolean).join(' · ');
  return gesTxt(mms || x.detalle || '');
}
function _menOrdenG(g){ for(var i=0;i<EQ_TIPOS.length;i++) if(EQ_TIPOS[i].g===g) return i; return 99; }
function _menFirmaDe(it){ return it.r ? it.r+'|'+(it.ck||'')+'|'+(it.p||[]).join(',')+'|'+(it.o||'')+'|'+(it.f||'') : ''; }
/* la lista de trabajo: todos los equipos activos, con lo que la hoja guardó de cada uno; lo revisado ese mes en la
   app entra hecho (y si la app lo revisó DESPUÉS de lo que dice la hoja, vale lo de la app). Cada equipo lleva su
   check list: «lista» (con el que está marcado, o el de hoy) y «lista0» (el de hoy: el que toma si se vuelve a marcar).
   El check list que la hoja ya guardó manda sobre el del catálogo: en un mismo mes, todos los de un tipo van igual */
function menArmar(d, eqs){
  var por={}, L=[], LS={};
  Object.keys(d.listas||{}).forEach(function(k){ LS[k]={ k:k, n:d.listas[k].n, p:d.listas[k].p }; });
  var deHoy=function(x){ var h=menListaDe(x); if(!h.k) return h; if(!LS[h.k]) LS[h.k]=h; return LS[h.k]; };
  var guardada=function(it){ var g=_menListaK(it.ck, d.listas) || _menGeneral(); if(!g.k) return g; if(!LS[g.k]) LS[g.k]=g; return LS[g.k]; };
  d.items.forEach(function(it){ por[it.id]=it; });
  (eqs||[]).forEach(function(x){
    if(!x || !x.id) return;
    var it=por[x.id];
    if(x.estado==='baja' && !it) return;
    var G=menGrupoDe(x), Lh=deHoy(x);
    var f={ id:String(x.id), cod:String(x.codigo||''), tipo:String(x.tipo||''), det:menDetalle(x), resp:gesTxt(x.responsable), g:G.g, fk:G.f, estado:x.estado||'operativo',
            ck:Lh.k, lista:Lh, ck0:Lh.k, lista0:Lh, r:'', p:[], o:'', f:'', d:0, app:0, s:0 };
    var uf=String(x.ult_fecha||'').slice(0, 10), ur=MEN_SRV[x.ult_resultado];
    if(it){ var Lg=guardada(it); f.ck=Lg.k; f.lista=Lg; f.r=it.r; f.p=it.p.slice(); f.o=it.o; f.f=it.f; f.d=it.d; f.app=it.app; f.s=it.s; }
    if(ur && uf.slice(0, 7)===d.mes && (!it || uf>it.f)){ f.ck=Lh.k; f.lista=Lh; f.r=ur; f.p=[]; f.o=(ur==='c') ? '' : gesTxt(x.ult_obs); f.f=uf; f.d=0; f.app=1; f.s=1; }
    L.push(f); delete por[x.id];
  });
  /* lo que la hoja guardó de un equipo que ya no está en la lista */
  Object.keys(por).forEach(function(id){ var it=por[id], Lg=guardada(it);
    L.push({ id:it.id, cod:it.cod, tipo:it.tipo, det:it.det, resp:it.resp, g:it.g||'Otros equipos', fk:it.fk, estado:'baja', ck:Lg.k, lista:Lg, ck0:Lg.k, lista0:Lg,
             r:it.r, p:it.p.slice(), o:it.o, f:it.f, d:it.d, app:it.app, s:it.s }); });
  L.sort(function(a, b){
    var la=_menOrdenLista(a.ck), lb=_menOrdenLista(b.ck); if(la!==lb) return la-lb;
    if(a.ck!==b.ck) return a.ck<b.ck ? -1 : 1;
    var ga=_menOrdenG(a.g), gb=_menOrdenG(b.g); if(ga!==gb) return ga-gb;
    if(a.g!==b.g) return a.g<b.g ? -1 : 1;
    return String(a.cod).localeCompare(String(b.cod), 'es', { numeric:true });
  });
  return L;
}
function menCuenta(L){
  var c={ n:L.length, c:0, o:0, f:0, hechos:0, faltan:0 };
  L.forEach(function(it){ if(it.r){ c[it.r]++; c.hechos++; } else c.faltan++; });
  return c;
}
function menCuentaTxt(c){
  var p=[];
  if(c.c) p.push(c.c+' '+(c.c===1 ? 'conforme' : 'conformes'));
  if(c.o) p.push(c.o+' con observación');
  if(c.f) p.push(c.f+' fuera de servicio');
  return p.join(', ');
}
/* el nombre del formato de un grupo de equipos, como lo llama la app en «Inspecciones» */
function menFormatoNombre(fk, cat){
  if(!fk) return MEN_GENERAL;
  var F=_inspFormatos(cat||{}).filter(function(t){ return t.k===fk; })[0];
  if(F) return F.n;
  var s=String(fk).replace(/-/g, ' '); return s.charAt(0).toUpperCase()+s.slice(1);
}

/* ══ 2 · EL EDITOR ════════════════════════════════════════════════════════════════════════════
   Cuatro pasos: el mes (y su cinta), los equipos, las firmas y la hoja. Un mes se puede cambiar mientras el servidor
   todavía acepta sus fechas (60 días); después queda para verlo e imprimirlo. */
function menAbrir(mes, paso){
  _gesCss(); _papCss(); _menCss();
  mes=/^\d{4}-\d{2}$/.test(String(mes||'')) ? mes : MES;
  var obra=(YO.obra||{}).id;
  MEN=null;
  abrirHoja('Inspección mensual de equipos', menMesTxt(mes).charAt(0).toUpperCase()+menMesTxt(mes).slice(1), '<div class="vacio" id="men-carga">Cargando los equipos…</div>',
    '<span class="msg gris men-est" id="men-msg" role="status"></span><button type="button" class="bt sec" id="men-cerrar">Cerrar</button>'+
    '<button type="button" class="bt sec" id="men-imp" hidden>🖨 Imprimir</button><button type="button" class="bt sec" id="men-pdf" hidden>⬇ Descargar PDF</button>'+
    '<button type="button" class="bt sec" id="men-sig" disabled>Siguiente</button><button type="button" class="bt" id="men-ok" disabled>Guardar la inspección</button>',
    { ancha:true, clase:'men-h', sinFoco:true });
  $('men-cerrar').onclick=function(){ _menCerrar(); };
  var nada=function(){ return null; };
  Promise.all([menTraer(), menEquipos(), estadoLeerP('color_herramientas').then(null, nada), papCtx().then(null, nada), gesCat().then(null, nada)]).then(function(r){
    if(!$('men-carga') || (YO.obra||{}).id!==obra) return;
    var filas=r[0]||[], fila=filas.filter(function(f){ return f.d.mes===mes; })[0]||null;
    var d=menLimpio(fila ? fila.d : { mes:mes });
    var v=r[2] && r[2].valor, colores=(v && typeof v==='object' && !Array.isArray(v)) ? v : {};
    var lee=!menMesEditable(mes);
    if(!d.fecha){ var fin=menUltDia(mes); d.fecha=(mes===MES) ? HOY : (fin<HOY ? fin : HOY); if(d.fecha<menFechaMin()) d.fecha=menFechaMin(); if(d.fecha.slice(0, 7)!==mes) d.fecha=menUltDia(mes); }
    /* la cinta es la de la obra: si ya está elegida para ese mes, esa es la de la hoja */
    if(eqColor(colores[mes])) d.color=eqColor(colores[mes]).k;
    if(!d.sst.n) d.sst.n=gesQuien();
    if(!d.sst.c) d.sst.c=leer('sstp_iq_cargo_sst', '') || 'Supervisor de SST';
    if(!d.prod.c) d.prod.c=leer('sstp_iq_cargo_prod', '') || 'Ingeniero de producción';
    var L=menArmar(d, r[1]||[]), base={}, env={};
    /* base: lo que la hoja guardada ya tenía de cada equipo; env: lo que el equipo ya tiene anotado en el servidor */
    (fila ? fila.d.items : []).forEach(function(it){ base[it.id]=_menFirmaDe(it); });
    L.forEach(function(it){ if(it.r && it.s) env[it.id]=_menFirmaDe(it); });
    MEN={ obra:obra, mes:mes, fila:fila, d:d, L:L, filas:filas, colores:colores, C:r[3]||{}, cat:r[4]||{}, base:base, env:env, lee:lee,
          paso:lee ? 'hoja' : (paso && MEN_PASOS.indexOf(paso)>-1 ? paso : (d.color ? 'equipos' : 'datos')), q:'', ver:'todos', diarias:null,
          abiertas:{}, guardando:false, sucio:false, toco:{ cab:false, dia:false, color:false, prod:false, sst:false }, firmando:'', modo:'marcado', hoja:null, tB:null, recu:-1,
          cargoT:{ prod:false, sst:false }, auto:false,
          /* el día que queda en lo que se marque ahora: hoy, si la hoja es del mes en curso (aunque se haya empezado otro día) */
          dia:(function(){ if(mes===MES) return HOY; var x=d.fecha, mn=menFechaMin(); if(x<mn) x=mn; if(x.slice(0, 7)!==mes) x=menUltDia(mes); return x; })() };
    _menBorradorPoner(MEN);
    _menMontar();
  }, function(cod){
    var c=$('men-carga'); if(!c) return;
    c.innerHTML=(cod===404) ? '<b>Falta actualizar el servidor.</b> Para los equipos con QR hay que correr una actualización en el servidor. Avísanos y lo dejamos listo.'
                            : '<b>No se pudo cargar</b>'+((cod===401 || cod===403) ? 'Esta cuenta no tiene permiso sobre esta obra.' : 'Revisa tu conexión y vuelve a abrirla.');
  });
}
/* cerrar no pierde nada: lo marcado y sin guardar queda de borrador en esta computadora (_menBorrador) */
function _menCerrar(){
  var S=MEN;
  if(S && S.sucio && !S.guardando){ _menBorradorGuardar(); toast('Lo que marcaste y no guardaste queda de borrador en esta computadora: vuelve a abrir la inspección para guardarlo.'); }
  MEN=null; cerrarHoja();
}
function _menMsg(t, cl){ var m=$('men-msg'); if(m){ m.className='msg '+(cl||'gris')+' men-est'; m.textContent=t||''; } }
function _menSucio(que){
  var S=MEN; if(!S) return;
  S.sucio=true; if(que) S.toco[que]=true;
  if(!S.guardando) _menMsg('Sin guardar', 'gris');
  _menPintaPasos();
  if(S.tB) clearTimeout(S.tB);
  S.tB=setTimeout(function(){ S.tB=null; if(MEN===S) _menBorradorGuardar(); }, 400);
}
/* ── el borrador ──────────────────────────────────────────────────────────────────────────
   Marcar 80 equipos y perderlos por un clic fuera de la hoja no puede pasar: lo que se va marcando queda en esta
   computadora (por obra y por mes) hasta que se guarda. Solo se recupera si la hoja del servidor sigue como estaba
   cuando se empezó: si otro la guardó mientras tanto, vale lo del servidor. */
function _menBorradorLlave(S){ return 'sstp_inspm_'+S.obra+'_'+S.mes; }
function _menBorradorGuardar(){
  var S=MEN; if(!S || S.lee) return;
  var it={}, n=0;
  S.L.forEach(function(x){ if(x.r && _menFirmaDe(x)!==S.base[x.id] && S.env[x.id]!==_menFirmaDe(x)){ it[x.id]={ r:x.r, p:x.p, o:x.o, f:x.f, d:x.d, ck:x.ck||'' }; n++; } });
  if(!n && !S.toco.cab && !S.toco.dia && !S.toco.color && !S.toco.prod && !S.toco.sst){ try{ localStorage.removeItem(_menBorradorLlave(S)); }catch(e){} return; }
  guardar(_menBorradorLlave(S), { v:2, base:(S.fila && S.fila.d.cuando) || '', t:Date.now(), items:it, toco:S.toco,
    cab:{ fecha:S.dia, color:S.d.color, cod:S.d.cod, ver:S.d.ver }, prod:S.d.prod, sst:S.d.sst });
}
function _menBorradorQuitar(S){ try{ if(S.tB){ clearTimeout(S.tB); S.tB=null; } localStorage.removeItem(_menBorradorLlave(S)); }catch(e){} }
function _menBorradorPoner(S){
  var B=leer(_menBorradorLlave(S), null);
  if(!B || (B.v!==1 && B.v!==2) || S.lee) return 0;
  if(B.base!==((S.fila && S.fila.d.cuando) || '') || Date.now()-(+B.t||0)>14*86400000){ _menBorradorQuitar(S); return 0; }
  var n=0, por={}; S.L.forEach(function(x){ por[x.id]=x; });
  Object.keys(B.items||{}).forEach(function(id){
    var x=por[id], b0=B.items[id]; if(!x || !b0 || typeof b0!=='object') return;
    /* los puntos valen solo si se marcaron con el check list que el equipo tiene hoy (un borrador de antes los marcó con los seis) */
    var mismo=(String(b0.ck||'')===String(x.ck0||'')), LSm={}; if(x.ck0) LSm[x.ck0]={ n:x.lista0.n, p:x.lista0.p };
    var b=_menItem({ id:id, r:b0.r, p:mismo ? b0.p : [], o:b0.o, f:b0.f, d:b0.d, ck:x.ck0 }, LSm); if(!b) return;
    x.ck=x.ck0; x.lista=x.lista0; x.r=b.r; x.p=b.p; x.o=b.o; x.f=b.f || S.dia; x.d=b.d; x.app=0; x.s=(S.env[x.id]===_menFirmaDe(x)) ? 1 : 0; n++;
  });
  var t=B.toco||{};
  var c=B.cab ? menLimpio({ mes:S.mes, fecha:B.cab.fecha, color:B.cab.color, cod:B.cab.cod, ver:B.cab.ver }) : null;
  if(t.cab && c){ S.d.cod=c.cod; S.d.ver=c.ver; S.toco.cab=true; }
  if(t.color && c && c.color){ S.d.color=c.color; S.toco.color=true; }
  if(t.dia && c && c.fecha && c.fecha<=HOY && c.fecha>=menFechaMin()){ S.dia=c.fecha; S.d.fecha=c.fecha; S.toco.dia=true; }
  if(t.prod && B.prod){ S.d.prod=_menFirma(B.prod); S.toco.prod=true; }
  if(t.sst && B.sst){ S.d.sst=_menFirma(B.sst); S.toco.sst=true; }
  if(n || S.toco.cab || S.toco.dia || S.toco.color || S.toco.prod || S.toco.sst){ S.sucio=true; S.recu=n; }
  return n;
}
function _menMontar(){
  var S=MEN;
  $('hoja-cuerpo').innerHTML=(S.sucio ? '<div class="aviso" id="men-recu">Recuperamos lo que marcaste la vez pasada y no llegaste a guardar'+(S.recu>0 ? ' ('+S.recu+' '+(S.recu===1 ? 'equipo' : 'equipos')+')' : '')+'. '+
    '<button type="button" class="bt-link" id="men-recu-no">Descartarlo y empezar de lo guardado</button></div>' : '')+'<ol class="pap-pasos" id="men-pasos"></ol><div id="men-cuerpo"></div>';
  if(S.sucio) _menMsg('Sin guardar', 'gris');
  if($('men-recu-no')) $('men-recu-no').onclick=function(){ _menBorradorQuitar(S); menAbrir(S.mes, S.paso); };
  var s=$('hoja-s'); if(s) s.textContent=menMesTxt(S.mes).charAt(0).toUpperCase()+menMesTxt(S.mes).slice(1)+(S.lee ? ' · para verla e imprimirla' : ' · la revisión del mes de cada equipo, con su cinta');
  $('men-ok').disabled=false; $('men-sig').disabled=false;
  $('men-ok').hidden=S.lee; $('men-sig').hidden=S.lee;
  $('men-ok').onclick=function(){ _menGuardar(); };
  $('men-sig').onclick=function(){ var i=MEN_PASOS.indexOf(MEN.paso); _menIr(MEN_PASOS[Math.min(MEN_PASOS.length-1, i+1)]); };
  $('men-pdf').onclick=function(){ _menEntregar('pdf', this); };
  $('men-imp').onclick=function(){ _menEntregar('imp', this); };
  $('men-pasos').onclick=function(ev){ var b=ev.target.closest('[data-p]'); if(b) _menIr(b.getAttribute('data-p')); };
  var C=$('men-cuerpo');
  C.addEventListener('input', _menAlEscribir); C.addEventListener('change', _menAlEscribir); C.addEventListener('click', _menAlTocar);
  _menPinta();
}
function _menPasosDe(){ return MEN.lee ? ['hoja'] : MEN_PASOS; }
function _menPintaPasos(){
  var S=MEN; if(!S || !$('men-pasos')) return;
  var c=menCuenta(S.L);
  _papBarra('men-pasos', _menPasosDe(), MEN_NOM, S.paso, function(k){
    if(k==='datos') return !!S.d.color && !!S.d.fecha;
    if(k==='equipos') return c.n>0 && !c.faltan && !_menSinDetalle();
    if(k==='firmas') return gesTxt(S.d.sst.n).length>=3 && gesTxt(S.d.prod.n).length>=3;
    return false;
  });
}
function _menIr(k){
  var S=MEN; if(!S || !k || _menPasosDe().indexOf(k)<0) return;
  if(S.firmando) S.firmando='';
  S.paso=k; _menPinta();
  try{ $('hoja-cuerpo').scrollTop=0; }catch(e){}
}
function _menPinta(){
  var S=MEN, C=$('men-cuerpo'); if(!S || !C) return;
  _menPintaPasos();
  var enHoja=(S.paso==='hoja');
  $('men-pdf').hidden=!enHoja; $('men-imp').hidden=!enHoja; $('men-sig').hidden=S.lee || enHoja;
  if(S.paso==='datos') C.innerHTML=_menDatosHTML();
  else if(S.paso==='equipos'){ C.innerHTML=_menEquiposHTML(); _menListaPinta(); _menDiariasCarga(); }
  else if(S.paso==='firmas') _menFirmasPon();
  else { C.innerHTML=_menHojaHTML(); _menHojaPinta(); }
}

/* ── 1 · el mes, el día y la cinta ─────────────────────────────────────────────────────────── */
function _menMeses(){
  var S=MEN, o=[], v={};
  var pon=function(m){ if(!v[m]){ v[m]=1; o.push(m); } };
  pon(MES); if(menMesEditable(menMesAntes(MES))) pon(menMesAntes(MES));
  pon(S.mes); S.filas.forEach(function(f){ pon(f.d.mes); });
  return o.sort().reverse();
}
function _menDatosHTML(){
  var S=MEN, d=S.d, min=menFechaMin(), ini=S.mes+'-01', fin=menUltDia(S.mes);
  var otros=S.filas.filter(function(f){ return f.d.mes!==S.mes; }).slice(0, 8);
  return '<div class="fila-c"><div class="campo"><label for="men-mes">Mes de la inspección</label><select id="men-mes">'+_menMeses().map(function(m){
      var gu=S.filas.some(function(f){ return f.d.mes===m; });
      return '<option value="'+m+'"'+(m===S.mes ? ' selected' : '')+'>'+esc(menMesTxt(m))+(gu ? ' · ya empezada' : '')+(menMesEditable(m) ? '' : ' · solo para verla')+'</option>';
    }).join('')+'</select></div>'+
    '<div class="campo"><label for="men-fecha">Día en que se hace</label><input type="date" id="men-fecha" min="'+(ini>min ? ini : min)+'" max="'+(fin<HOY ? fin : HOY)+'" value="'+esc(S.dia)+'">'+
    '<p class="ayuda" id="men-fecha-ay">Es la fecha que queda en cada equipo que marques ahora. '+(S.mes===MES ? 'Si la inspección toma varios días no hay que cambiar nada: cada día que la abras, lo que marques queda con la fecha de ese día.' : 'Elige el día de '+esc(eqMesNombre(S.mes+'-01'))+' en que se revisaron.')+'</p></div></div>'+
    '<div class="campo"><label id="men-color-t">¿De qué color es la cinta de '+esc(eqMesNombre(S.mes+'-01'))+'?</label><div class="peq-colores men-color" id="men-color" role="group" aria-labelledby="men-color-t">'+EQ_COLORES.map(function(k){
      var on=(d.color===k.k);
      return '<button type="button" class="peq-col'+(on ? ' on' : '')+'" data-color="'+k.k+'" aria-pressed="'+(on ? 'true' : 'false')+'" title="'+esc(k.n)+'"><i style="background:'+k.h+'"></i><span>'+esc(k.n)+'</span></button>';
    }).join('')+'</div><p class="ayuda">El color que lleva cada equipo revisado este mes. Es el de la obra: lo ve la app de todos y sale al escanear el QR.</p></div>'+
    '<div class="fila-c"><div class="campo"><label for="men-cod">Código del formato <span class="tenue">· opcional</span></label><input id="men-cod" maxlength="40" autocomplete="off" placeholder="SST-FOR-015" value="'+esc(d.cod)+'"></div>'+
    '<div class="campo"><label for="men-ver">Versión <span class="tenue">· opcional</span></label><input id="men-ver" maxlength="12" autocomplete="off" placeholder="01" value="'+esc(d.ver)+'"></div></div>'+
    '<div class="seccion"><h3>Lo que se mira en cada equipo</h3><p class="ayuda" style="margin:0 0 10px">Cada tipo de equipo tiene su propio check list: el arnés se revisa como arnés y la amoladora como amoladora. «Conforme» es que cumple todos sus puntos; si alguno no, va «con observación» y se dice cuál.</p>'+
    '<div class="men-listas" id="men-listas">'+_menListasHTML()+'</div></div>'+
    (otros.length ? '<div class="men-otros" id="men-otros" style="margin-top:16px">Otras inspecciones guardadas:'+otros.map(function(f){ return ' <button type="button" class="bt-link" data-mes="'+f.d.mes+'">'+esc(menMesTxt(f.d.mes))+'</button>'; }).join('')+'</div>' : '');
}
function _menCambiarMes(m){
  var S=MEN; if(!S || m===S.mes) return;
  if(S.sucio && !S.guardando){ _menBorradorGuardar(); toast('Lo marcado en '+menMesTxt(S.mes)+' queda de borrador: al volver a ese mes lo encuentras.'); }
  menAbrir(m);
}

/* ── 2 · los equipos ───────────────────────────────────────────────────────────────────────── */
function _menSinDetalle(){ var S=MEN; return S.L.filter(function(it){ return (it.r==='o' || it.r==='f') && gesTxt(it.o).length<3; })[0]||null; }
function _menEquiposHTML(){
  var S=MEN;
  if(!S.L.length) return '<div class="aviso ojo" id="men-sin"><b>Todavía no hay equipos registrados.</b> La hoja se arma sola con los equipos y herramientas de la obra: regístralos primero (uno por uno, o pegando la lista de tu Excel).'+
    '<div class="acciones"><button type="button" class="bt sec chico" data-que="ir-equipos">Ir a registrar equipos</button></div></div>';
  return '<div class="men-res" id="men-res"></div><div class="men-barra" id="men-barra" aria-hidden="true"></div>'+
    '<div class="men-herr"><input type="search" id="men-q" autocomplete="off" placeholder="Buscar por código, equipo o responsable" aria-label="Buscar un equipo" value="'+esc(S.q)+'">'+
    '<div class="seg chico" id="men-ver" role="group" aria-label="Qué equipos ver"></div></div>'+
    '<div class="men-herr"><button type="button" class="bt sec chico" data-que="diarias" id="men-diarias" hidden></button>'+
    '<button type="button" class="bt sec chico" data-que="resto" id="men-resto">Los que faltan, conformes</button></div>'+
    '<div id="men-lista"></div>';
}
function _menFiltrados(){
  var S=MEN, q=nrm(S.q), ps=q ? q.split(' ') : [];
  return S.L.filter(function(it){
    if(S.ver==='faltan' && it.r) return false;
    if(S.ver==='ojo' && it.r!=='o' && it.r!=='f') return false;
    if(!ps.length) return true;
    var t=nrm(it.cod+' '+it.tipo+' '+it.det+' '+it.resp+' '+it.g+' '+((it.lista||{}).n||''));
    for(var i=0;i<ps.length;i++) if(t.indexOf(ps[i])<0) return false;
    return true;
  });
}
function _menOrigen(it){
  if(!it.r) return it.estado==='fuera' ? 'Está fuera de servicio: una revisión conforme lo devuelve al trabajo' : '';
  if(it.app) return 'Anotado en la app el '+menDMA(it.f);
  if(it.d) return 'De su inspección diaria del '+menDMA(it.f);
  if(MEN.env[it.id]===_menFirmaDe(it)) return 'Guardado el '+menDMA(it.f);
  return '';
}
function _menFilaHTML(it){
  var S=MEN, og=_menOrigen(it), h='', Lz=it.lista || _menGeneral();
  h+='<div class="men-f '+(it.r||'')+'" data-id="'+esc(it.id)+'"><div class="men-q"><span class="peq-cod">'+esc(it.cod)+'</span><b>'+esc(it.tipo)+'</b>'+
     ((it.det || it.resp) ? '<small>'+esc([it.det, it.resp ? 'Resp.: '+it.resp : ''].filter(Boolean).join(' · '))+'</small>' : '')+
     (og ? '<small class="ya">'+esc(og)+'</small>' : '')+'</div>'+
     '<div class="men-r" role="group" aria-label="Resultado de '+esc(it.cod)+'">'+['c', 'o', 'f'].map(function(k){
       var on=(it.r===k);
       return '<button type="button" data-r="'+k+'" class="'+(on ? 'on' : '')+'" aria-pressed="'+(on ? 'true' : 'false')+'" aria-label="'+MEN_R[k].n+'">'+(k==='f' ? '⛔ Fuera<span class="men-lg"> de servicio</span>' : MEN_R[k].bt)+'</button>';
     }).join('')+'</div>';
  if(it.r==='o' || it.r==='f'){
    h+='<div class="men-o">'+(it.r==='o' ? '<div class="chips" role="group" aria-label="Qué punto no cumple">'+Lz.p.map(function(p, i){
         var on=(it.p.indexOf(i)>-1);
         return '<button type="button" class="chip'+(on ? ' on' : '')+'" data-p="'+i+'" aria-pressed="'+(on ? 'true' : 'false')+'" title="'+esc(p[1])+'">'+(i+1)+' · '+esc(p[0])+'</button>';
       }).join('')+'</div>' : '')+
       '<input data-o maxlength="300" autocomplete="off" aria-label="'+(it.r==='o' ? 'Qué tiene ' : 'Por qué queda fuera de servicio ')+esc(it.cod)+'" placeholder="'+(it.r==='o' ? '¿Qué tiene? Cable con empalme, falta la guarda…' : '¿Por qué no se usa? Sale en su QR')+'" value="'+esc(it.o)+'"></div>';
  }
  return h+'</div>';
}
function _menResPinta(){
  var S=MEN, c=menCuenta(S.L), r=$('men-res'), b=$('men-barra'), v=$('men-ver'), bt=$('men-resto'); if(!r) return;
  r.innerHTML='<span><b>'+c.hechos+' de '+c.n+'</b> '+(c.n===1 ? 'equipo' : 'equipos')+' con resultado</span>'+(c.hechos ? '<span>'+esc(menCuentaTxt(c))+'</span>' : '')+
    (c.faltan ? '<span class="pill ojo">'+(c.faltan===1 ? 'falta 1' : 'faltan '+c.faltan)+'</span>' : '<span class="pill ok">completa</span>');
  if(b) b.innerHTML=['c', 'o', 'f'].map(function(k){ return c[k] ? '<i class="'+k+'" style="width:'+(100*c[k]/Math.max(1, c.n)).toFixed(2)+'%"></i>' : ''; }).join('');
  if(v) v.innerHTML=[['todos', 'Todos', c.n], ['faltan', 'Faltan', c.faltan], ['ojo', 'Con observación o fuera', c.o+c.f]].map(function(x){
    return '<button type="button" data-ver="'+x[0]+'" class="'+(S.ver===x[0] ? 'on' : '')+'" aria-pressed="'+(S.ver===x[0] ? 'true' : 'false')+'">'+x[1]+' <b>'+x[2]+'</b></button>'; }).join('');
  if(bt) bt.disabled=!_menConformables(_menFiltrados()).length;
  _menDiariasPinta();
}
function _menListaPinta(){
  var S=MEN, c=$('men-lista'); if(!S || !c) return;
  _menResPinta();
  var F=_menFiltrados(), h='', g=null, abre=false;
  if(!F.length){ c.innerHTML='<p class="ayuda" id="men-nada">'+(S.q ? 'Ningún equipo con «'+esc(S.q)+'»'+(S.ver!=='todos' ? ' en este filtro' : '')+'.' : (S.ver==='faltan' ? 'No falta ninguno: todos tienen su resultado.' : 'Ninguno con observación ni fuera de servicio.'))+'</p>'; return; }
  F.forEach(function(it){
    var ck=it.ck||'';
    if(ck!==g){
      if(abre) h+='</div>';
      g=ck; abre=true;
      h+='<div class="men-g" data-g="'+esc(g)+'"><div class="men-g-cab">'+_menGrupoCabHTML(g, F)+'</div>'+
         '<div class="men-g-pts"'+(S.abiertas[g] ? '' : ' hidden')+'>'+_menPuntosHTML(it.lista || _menGeneral())+'</div>';
    }
    h+=_menFilaHTML(it);
  });
  c.innerHTML=h+(abre ? '</div>' : '');
}
function _menItem2(id){ var S=MEN; for(var i=0;i<S.L.length;i++) if(S.L[i].id===id) return S.L[i]; return null; }
function _menPoner(it, r, o){
  var S=MEN;
  if(it.lista0){ it.ck=it.ck0||''; it.lista=it.lista0; }
  it.r=r; it.p=[]; it.o=(r==='c') ? '' : (o||''); it.f=r ? S.dia : ''; it.d=0; it.app=0;
  it.s=(r && S.env[it.id]===_menFirmaDe(it)) ? 1 : 0;
}
/* a los que se les puede poner «conforme» de un golpe: los que faltan, menos los que están fuera de servicio */
function _menConformables(lista){ return lista.filter(function(it){ return !it.r && it.estado!=='baja' && it.estado!=='fuera'; }); }
/* todos los que faltan (de los que se ven) pasan a conformes: lo pide quien los revisó */
function _menResto(lista, donde){
  var S=MEN, fa=_menConformables(lista), fuera=lista.filter(function(it){ return !it.r && it.estado==='fuera'; }).length;
  if(!fa.length){
    if(fuera) toast((fuera===1 ? 'El que falta está fuera de servicio: márcalo tú. «Conforme» lo devuelve al trabajo.' : 'Los que faltan están fuera de servicio: márcalos uno por uno. «Conforme» los devuelve al trabajo.'));
    return;
  }
  var uno=(fa.length===1);
  confirmar('¿Marcar '+(uno ? 'ese equipo' : 'esos '+fa.length+' equipos')+' como '+(uno ? 'conforme' : 'conformes')+'?',
    (uno ? 'El equipo' : 'Los '+fa.length+' equipos')+' que todavía no '+(uno ? 'tiene' : 'tienen')+' resultado'+(donde ? ' en «'+donde+'»' : '')+' '+(uno ? 'queda' : 'quedan')+
    ' como que '+(uno ? 'cumple' : 'cumplen')+' todos los puntos de su check list. Hazlo solo si '+(uno ? 'lo' : 'los')+' revisaste: al guardar '+(uno ? 'queda anotado' : 'quedan anotados')+' con tu nombre y con la cinta del mes.'+
    (fuera ? (fuera===1 ? ' El que está fuera de servicio no se toca: ese se marca aparte.' : ' Los '+fuera+' que están fuera de servicio no se tocan: esos se marcan aparte.') : ''),
    { si:(uno ? 'Sí, conforme' : 'Sí, conformes'), no:'Cancelar' }).then(function(si){
    if(!si || MEN!==S) return;
    fa.forEach(function(it){ _menPoner(it, 'c'); });
    _menSucio(); _menListaPinta();
  });
}
/* las inspecciones diarias del mes (las del QR): se piden una vez al llegar a «Los equipos»; el botón aparece solo si
   hay equipos SIN resultado que tengan la suya, y dice cuántos */
function _menDiariasCarga(){
  var S=MEN; if(!S || S.lee || S.diarias || S.diariasP) return;
  S.diariasP=menDiarias(S.mes).then(function(D){ S.diariasP=null; if(MEN!==S) return; S.diarias=D||{}; _menDiariasPinta(); }, function(){ S.diariasP=null; });
}
function _menDiariasPinta(){
  var S=MEN, b=$('men-diarias'); if(!S || !b) return;
  var n=S.diarias ? S.L.filter(function(it){ return !it.r && S.diarias[it.id]; }).length : 0;
  b.hidden=!n;
  if(n) b.textContent=(n===1) ? 'Usar la inspección diaria de 1 equipo' : 'Usar las inspecciones diarias de '+n+' equipos';
}
function _menTraerDiarias(){
  var S=MEN; if(!S || !S.diarias) return;
  var D=S.diarias, n=0;
  S.L.forEach(function(it){
    var x=D[it.id]; if(!x || it.r) return;
    if(it.lista0){ it.ck=it.ck0||''; it.lista=it.lista0; }
    it.r=x.r; it.p=[]; it.f=x.fecha; it.d=1; it.app=0; it.s=0;
    it.o=(x.r==='c') ? '' : (x.o || (x.r==='o' ? 'Con observación en la inspección diaria' : 'No apto en la inspección diaria'));
    n++;
  });
  if(!n) return;
  _menSucio(); _menListaPinta();
  toast((n===1 ? 'Se trajo 1 equipo' : 'Se trajeron '+n+' equipos')+' con el resultado de su inspección diaria de '+eqMesNombre(S.mes+'-01')+'. Revísalos antes de guardar.');
}

/* ── 3 · las firmas: Producción y Seguridad ────────────────────────────────────────────────── */
function _menFirmaHTML(rol){
  var S=MEN, f=S.d[rol], prod=(rol==='prod'), firmando=(S.firmando===rol);
  var h='<div class="men-fc" data-rol="'+rol+'"><h4>'+(prod ? 'Producción' : 'Seguridad (SST)')+'</h4>'+
    '<div class="campo"><label for="men-'+rol+'-n">Nombre y apellidos</label><input id="men-'+rol+'-n" data-f="n" maxlength="120" autocomplete="off" value="'+esc(f.n)+'"></div>'+
    '<div class="campo"><label for="men-'+rol+'-c">Cargo</label><input id="men-'+rol+'-c" data-f="c" maxlength="80" autocomplete="off" value="'+esc(f.c)+'"></div>';
  if(firmando){
    h+='<div class="lienzo" id="men-lienzo"><canvas></canvas><div class="guia"></div><div class="pista">Firma aquí con el mouse, el dedo o el lápiz</div></div>'+
       '<div class="acciones"><button type="button" class="bt sec chico" data-que="borrar-firma">Borrar y repetir</button><button type="button" class="bt sec chico" data-que="no-firmar">No firmar ahora</button>'+
       '<button type="button" class="bt chico" data-que="firma-lista" id="men-firma-ok" disabled>Listo, esa es la firma</button></div>';
  }else if(f.f){
    h+='<div class="men-trazo" id="men-'+rol+'-trazo"><img src="'+atsFirmaImg(f.f, 300)+'" alt="Firma de '+esc(f.n)+'"></div>'+
       '<div class="acciones"><button type="button" class="bt sec chico" data-que="firmar" data-rol="'+rol+'">Firmar otra vez</button><button type="button" class="bt sec chico" data-que="quitar-firma" data-rol="'+rol+'">Quitar la firma</button></div>';
  }else{
    h+='<div class="men-trazo" id="men-'+rol+'-trazo">Sin firma todavía.<br>En la hoja sale el casillero para firmar a mano.</div>'+
       '<div class="acciones"><button type="button" class="bt sec chico" data-que="firmar" data-rol="'+rol+'">✍ Firmar aquí</button></div>';
  }
  return h+'</div>';
}
function _menFirmasHTML(){
  return '<p class="ayuda" style="margin:0 0 12px">En la inspección mensual firman <b>Producción</b> y <b>Seguridad</b>. Pueden firmar aquí, en la pantalla, o dejarlo vacío y firmar la hoja impresa.</p>'+
    '<div class="men-firmas" id="men-firmas">'+_menFirmaHTML('prod')+_menFirmaHTML('sst')+'</div>'+
    '<p class="ayuda">El portal deja constancia de quién dijo ser cada firmante y de cuándo firmó. No verifica identidad, igual que una firma en papel.</p>';
}
/* las dos tarjetas, y el nombre de cada firmante con la lista del personal (se escribe y aparece); al elegir a
   alguien, su puesto pasa a ser el cargo —si el cargo no lo escribió nadie todavía en esta hoja— */
function _menFirmasPon(){
  var S=MEN, C=$('men-cuerpo'); if(!S || !C) return;
  C.innerHTML=_menFirmasHTML();
  if(typeof sugGente!=='function') return;
  ['prod', 'sst'].forEach(function(rol){
    sugGente($('men-'+rol+'-n'), { alElegir:function(t){
      var c=$('men-'+rol+'-c'); if(MEN!==S || !c || !t.puesto || S.cargoT[rol]) return;
      c.value=t.puesto.slice(0, 80); S.auto=true;
      try{ c.dispatchEvent(new Event('input', { bubbles:true })); }finally{ S.auto=false; }
    } });
  });
}
function _menFirmar(rol){
  var S=MEN; if(!S) return;
  if(gesTxt(S.d[rol].n).length<3){ _menMsg('Escribe primero el nombre de quien firma por '+(rol==='prod' ? 'Producción' : 'Seguridad')+'.', 'mal'); try{ $('men-'+rol+'-n').focus(); }catch(e){} return; }
  S.firmando=rol; _menFirmasPon(); _menMsg('');
  setTimeout(function(){
    var l=$('men-lienzo'); if(!l) return;
    prepLienzo(l, 170, function(){ var b=$('men-firma-ok'); if(b) b.disabled=!(lienzoPuntos()>=12); });
    try{ l.scrollIntoView({ block:'nearest' }); }catch(e){}
  }, 30);
}

/* ── 4 · la hoja ───────────────────────────────────────────────────────────────────────────── */
function _menHojaHTML(){
  var S=MEN;
  return (S.lee ? '<div class="aviso" id="men-lee">Esta inspección es de '+esc(menMesTxt(S.mes))+': ya no se puede cambiar (una revisión se anota hasta 60 días después). Aquí queda su hoja, para verla e imprimirla.</div>' : '')+
    '<div class="men-modo"><div class="seg" id="men-modo" role="tablist" aria-label="Qué hoja"><button type="button" role="tab" data-modo="marcado">Con lo marcado</button>'+
    '<button type="button" role="tab" data-modo="blanco">En blanco, para el campo</button></div><p id="men-modo-d"></p></div>'+
    '<div class="pdfv" id="men-prev" aria-label="Vista previa de la hoja"></div>';
}
function _menDatosPdf(){
  var S=MEN;
  return { d:S.d, L:S.L, C:S.C, cat:S.cat };
}
function _menHojaPinta(){
  var S=MEN, caja=$('men-prev'); if(!S || !caja) return;
  var n=(S.hojaN=(S.hojaN||0)+1); S.hoja=null;
  ['men-pdf', 'men-imp'].forEach(function(k){ var b=$(k); if(b) b.disabled=true; });
  Array.prototype.forEach.call($('men-modo').querySelectorAll('button'), function(b){ var on=(b.getAttribute('data-modo')===S.modo); b.className=on ? 'on' : ''; b.setAttribute('aria-selected', on ? 'true' : 'false'); });
  $('men-modo-d').textContent=(S.modo==='blanco') ? 'La lista de los equipos con los casilleros vacíos: para llevarla impresa, marcar a mano y firmarla en el campo.'
                                                : 'Cada equipo con su resultado, el punto que no cumple y la observación; al pie, las firmas de Producción y de Seguridad.';
  caja.innerHTML='<div class="pdfv-msg">Armando la hoja…</div>';
  var D=_menDatosPdf();
  menPdf(D.d, D.L, D.C, { blanco:S.modo==='blanco' }).then(function(R){
    if(MEN!==S || n!==S.hojaN || !$('men-prev')) return;
    S.hoja=R; pdfVistaP($('men-prev'), R.blob);
    ['men-pdf', 'men-imp'].forEach(function(k){ var b=$(k); if(b) b.disabled=false; });
  }, function(){ if(MEN===S && n===S.hojaN && $('men-prev')) $('men-prev').innerHTML='<div class="pdfv-msg">No se pudo armar la hoja. Revisa tu conexión e inténtalo otra vez.</div>'; });
}
function _menEntregar(como, bt){
  var S=MEN; if(!S) return;
  var D=_menDatosPdf();
  if(bt) bt.disabled=true;
  menPdf(D.d, D.L, D.C, { blanco:S.modo==='blanco' }).then(function(R){
    if(bt) bt.disabled=false;
    if(como==='imp') papImprimir(R); else papBajar(R);
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar el PDF. Revisa tu conexión.'); });
}

/* ── lo que se escribe y lo que se toca ────────────────────────────────────────────────────── */
function _menAlEscribir(ev){
  var S=MEN, t=ev.target; if(!S || !t || S.lee) return;
  if(t.id==='men-mes'){ if(ev.type==='change') _menCambiarMes(t.value); return; }
  if(t.id==='men-fecha'){
    var v=t.value;
    if(/^\d{4}-\d{2}-\d{2}$/.test(v) && v.slice(0, 7)===S.mes && v<=HOY && v>=menFechaMin()){ S.dia=v; S.d.fecha=v; _menSucio('dia'); _menMsg('Sin guardar', 'gris'); }
    else if(ev.type==='change'){ t.value=S.dia; _menMsg('Ese día no va: tiene que ser de '+menMesTxt(S.mes)+', no pasar de hoy ni tener más de 60 días.', 'mal'); }
    return;
  }
  if(t.id==='men-cod'){ S.d.cod=t.value; _menSucio('cab'); return; }
  if(t.id==='men-ver'){ S.d.ver=t.value; _menSucio('cab'); return; }
  if(t.id==='men-q'){ S.q=t.value; _menListaPinta(); return; }
  if(t.hasAttribute && t.hasAttribute('data-o')){
    var f=t.closest('.men-f'), it=f ? _menItem2(f.getAttribute('data-id')) : null; if(!it) return;
    it.o=t.value; it.s=(S.env[it.id]===_menFirmaDe(it)) ? 1 : 0; it.d=0; it.app=0; if(!it.f) it.f=S.dia;
    _menSucio(); return;
  }
  var fc=t.closest ? t.closest('.men-fc') : null;
  if(fc && t.getAttribute('data-f')){
    var rol=fc.getAttribute('data-rol'); S.d[rol][t.getAttribute('data-f')]=t.value;
    if(t.getAttribute('data-f')==='c'){ guardar('sstp_iq_cargo_'+rol, gesTxt(t.value)); if(!S.auto) S.cargoT[rol]=true; }
    _menSucio(rol);
  }
}
function _menAlTocar(ev){
  var S=MEN; if(!S) return;
  var b=ev.target.closest ? ev.target.closest('button') : null; if(!b) return;
  var modo=b.getAttribute('data-modo');
  if(modo){ if(modo!==S.modo){ S.modo=modo; _menHojaPinta(); } return; }
  if(S.lee) return;
  var color=b.getAttribute('data-color');
  if(color){ S.d.color=color; _menSucio('color'); Array.prototype.forEach.call(document.querySelectorAll('#men-color .peq-col'), function(z){ var on=(z===b); z.classList.toggle('on', on); z.setAttribute('aria-pressed', on ? 'true' : 'false'); }); return; }
  var mes=b.getAttribute('data-mes'); if(mes){ _menCambiarMes(mes); return; }
  var ver=b.getAttribute('data-ver'); if(ver){ S.ver=ver; _menListaPinta(); return; }
  var que=b.getAttribute('data-que');
  if(que==='ir-equipos'){ MEN=null; cerrarHoja(); if(VISTA.actual!=='equipos') navegar('equipos'); return; }
  if(que==='diarias'){ _menTraerDiarias(); return; }
  if(que==='resto'){ _menResto(_menFiltrados(), (S.q || S.ver!=='todos') ? 'lo que se ve ahora' : ''); return; }
  if(que==='grupo'){ var g=b.getAttribute('data-g')||'', del=_menFiltrados().filter(function(it){ return (it.ck||'')===g; }); _menResto(del, del.length ? (del[0].lista || _menGeneral()).n : ''); return; }
  if(que==='lista'){
    var g2=b.getAttribute('data-g')||''; S.abiertas[g2]=!S.abiertas[g2];
    Array.prototype.forEach.call(document.querySelectorAll('#men-lista .men-g'), function(z){ if((z.getAttribute('data-g')||'')===g2){ var pts=z.querySelector('.men-g-pts'); if(pts) pts.hidden=!S.abiertas[g2]; } });
    _menGrupoCab(g2); return;
  }
  if(que==='firmar'){ _menFirmar(b.getAttribute('data-rol')); return; }
  if(que==='quitar-firma'){ var r0=b.getAttribute('data-rol'); S.d[r0].f=null; S.d[r0].t=''; _menSucio(r0); _menFirmasPon(); return; }
  if(que==='no-firmar'){ S.firmando=''; _menFirmasPon(); return; }
  if(que==='borrar-firma'){ var l=$('men-lienzo'); if(l) prepLienzo(l, 170, function(){ var k=$('men-firma-ok'); if(k) k.disabled=!(lienzoPuntos()>=12); }); var k2=$('men-firma-ok'); if(k2) k2.disabled=true; return; }
  if(que==='firma-lista'){
    var rol=S.firmando, tr=atsNorm(LIENZO.trazos);
    if(!rol || !tr || lienzoPuntos()<12){ _menMsg('Falta la firma.', 'mal'); return; }
    S.d[rol].f=tr; S.d[rol].t=new Date().toISOString(); S.firmando=''; _menSucio(rol);
    _menFirmasPon(); return;
  }
  /* el resultado de un equipo, y el punto que no cumple */
  var fila=b.closest('.men-f'); if(!fila) return;
  var it=_menItem2(fila.getAttribute('data-id')); if(!it) return;
  var r=b.getAttribute('data-r'), p=b.getAttribute('data-p'), ckAntes=it.ck||'';
  if(r){
    if(it.r===r){
      if(S.env[it.id]){ toast('Ese resultado ya quedó anotado en el equipo: si cambió, ponle el de ahora.'); return; }
      _menPoner(it, '');
    }else _menPoner(it, r, (r==='c') ? '' : (it.r && it.r!=='c' ? it.o : ''));
  }else if(p!==null && it.r==='o'){
    var i=+p, k3=it.p.indexOf(i);
    if(k3>-1) it.p.splice(k3, 1); else { it.p.push(i); it.p.sort(function(a, z){ return a-z; }); }
    it.s=(S.env[it.id]===_menFirmaDe(it)) ? 1 : 0; it.d=0; it.app=0;
  }else return;
  _menSucio();
  if((it.ck||'')!==ckAntes){      /* estaba marcado con otro check list (una hoja de antes): pasa al bloque del suyo */
    _menListaPinta();
    var f2=null; Array.prototype.forEach.call(document.querySelectorAll('#men-lista .men-f'), function(z){ if(z.getAttribute('data-id')===it.id) f2=z; });
    if(f2 && r && it.r && it.r!=='c'){ var i2=f2.querySelector('input[data-o]'); if(i2) try{ i2.focus(); }catch(e){} }
    return;
  }
  var caja=document.createElement('div'); caja.innerHTML=_menFilaHTML(it);
  var nueva=caja.firstChild; fila.parentNode.replaceChild(nueva, fila);
  _menResPinta(); _menGrupoCab(it.ck||'');
  if(r && it.r && it.r!=='c'){ var inp=nueva.querySelector('input[data-o]'); if(inp) try{ inp.focus(); }catch(e){} }
}
/* la cabecera de un grupo: cuántos son, cuántos faltan y el atajo para dejar conformes a los que faltan (a los que
   están fuera de servicio no: esos se marcan uno por uno, porque «conforme» los devuelve al trabajo) */
function _menGrupoCabHTML(g, F){
  var S=MEN, del=F.filter(function(z){ return (z.ck||'')===g; }), fa=del.filter(function(z){ return !z.r; }).length, pc=_menConformables(del).length;
  var Lz=del.length ? (del[0].lista || _menGeneral()) : _menGeneral(), ab=!!S.abiertas[g];
  return '<h4>'+esc(Lz.n)+'<small>'+del.length+' '+(del.length===1 ? 'equipo' : 'equipos')+(fa ? ' · '+(fa===1 ? 'falta 1' : 'faltan '+fa) : ' · completo')+'</small></h4>'+
    '<span class="men-g-bt"><button type="button" class="bt-link" data-que="lista" data-g="'+esc(g)+'" aria-expanded="'+(ab ? 'true' : 'false')+'">'+(ab ? 'Ocultar su check list' : 'Ver su check list ('+Lz.p.length+' puntos)')+'</button>'+
    (pc ? '<button type="button" class="bt-link" data-que="grupo" data-g="'+esc(g)+'">'+(pc===1 ? 'Conforme el que falta' : 'Conformes los '+pc+' que faltan')+'</button>' : '')+'</span>';
}
function _menGrupoCab(g){
  var cab=null;
  Array.prototype.forEach.call(document.querySelectorAll('#men-lista .men-g'), function(z){ if((z.getAttribute('data-g')||'')===g) cab=z.querySelector('.men-g-cab'); });
  if(cab) cab.innerHTML=_menGrupoCabHTML(g, _menFiltrados());
}
/* los check list que hay en una lista de equipos, en su orden: [{ ck, L, n }] */
function _menSecciones(lista){
  var out=[], por={};
  lista.forEach(function(it){ var k=it.ck||''; if(!Object.prototype.hasOwnProperty.call(por, k)){ por[k]={ ck:k, L:it.lista || _menListaK(k, null) || _menGeneral(), n:0, items:[] }; out.push(por[k]); } por[k].n++; por[k].items.push(it); });
  return out;
}
/* los puntos de un check list, numerados (el nombre corto en negrita, salvo que sea solo «Punto 3») */
function _menPuntosHTML(Lz){
  return '<ol class="men-puntos">'+Lz.p.map(function(p){ return '<li>'+(/^Punto \d+$/.test(p[0]) ? '' : '<b>'+esc(p[0])+'.</b> ')+esc(p[1])+'</li>'; }).join('')+'</ol>';
}
function _menListasHTML(){
  var S=MEN, secs=_menSecciones(S.L.filter(function(it){ return it.estado!=='baja' || it.r; }));
  if(!secs.length) return '<p class="ayuda" id="men-listas-nada">Cuando registres equipos, aquí sale el check list de cada tipo.</p>';
  return secs.map(function(z){
    return '<details class="men-lista" data-ck="'+esc(z.ck)+'"><summary><b>'+esc(z.L.n)+'</b> <small>'+z.n+' '+(z.n===1 ? 'equipo' : 'equipos')+' · '+z.L.p.length+' puntos</small></summary>'+_menPuntosHTML(z.L)+'</details>';
  }).join('');
}

/* ── guardar ──────────────────────────────────────────────────────────────────────────────── */
function _menFalta(){
  var S=MEN, d=S.d;
  if(!S.L.length) return { paso:'equipos', t:'Todavía no hay equipos registrados en la obra.' };
  if(!eqColor(d.color)) return { paso:'datos', t:'Elige de qué color es la cinta de '+eqMesNombre(S.mes+'-01')+': es la que queda anotada en cada equipo revisado.' };
  if(!d.fecha) return { paso:'datos', t:'Falta el día en que se hace la inspección.', foco:'men-fecha' };
  if(!S.L.some(function(it){ return !!it.r; })) return { paso:'equipos', t:'Todavía no hay ningún equipo con resultado: márcalos conforme, con observación o fuera de servicio.' };
  var sd=_menSinDetalle();
  if(sd) return { paso:'equipos', t:'A '+sd.cod+' le falta decir qué tiene: una observación sin detalle no le sirve a quien lo tiene que arreglar.', fila:sd.id };
  if(gesTxt(d.sst.n).length<3) return { paso:'firmas', t:'Falta el nombre de quien inspecciona por Seguridad: queda anotado en cada equipo.', foco:'men-sst-n' };
  if(d.prod.f && gesTxt(d.prod.n).length<3) return { paso:'firmas', t:'Falta el nombre de quien firmó por Producción.', foco:'men-prod-n' };
  return null;
}
/* lo que se anota en el equipo (y sale en su QR): el punto que no cumple y lo que tiene */
function _menObsSrv(it, listas){
  if(it.r==='c') return '';
  var Lz=it.lista || _menListaK(it.ck, listas || null) || _menGeneral();
  var p=(it.r==='o') ? it.p.map(function(i){ return (Lz.p[i]||[])[0]||''; }).filter(Boolean).join(', ') : '';
  return [p, gesTxt(it.o)].filter(Boolean).join(': ').slice(0, 300);
}
function _menResumenFila(items, d, fkNombre, quien){
  var c={ c:0, o:0, f:0 }, obs=[], fe='';
  items.forEach(function(it){ c[it.r]++; if(it.f>fe) fe=it.f; if(it.r!=='c') obs.push(_inspLimpio(it.cod+' '+it.tipo+': '+(_menObsSrv(it, d.listas) || MEN_R[it.r].n)+(it.r==='f' ? ' (fuera de servicio)' : ''), 300)+' [abierta]'); });
  var n=items.length, cinta=eqCinta(d.color), L=[];
  L.push('Tipo: Planeada');
  L.push(obs.length ? obs.length+' observacion(es): '+obs.slice(0, 30).join(' | ') : 'Sin observaciones.');
  L.push('Conclusiones: '+_inspLimpio('Revisión mensual de equipos'+(cinta ? ' con la '+cinta : '')+' · '+n+' '+(n===1 ? 'equipo' : 'equipos')+': '+menCuentaTxt({ c:c.c, o:c.o, f:c.f })+'.', 500));
  var fi=[d.prod.n ? 'Producción — '+d.prod.n : '', d.sst.n ? 'Seguridad — '+d.sst.n : ''].filter(Boolean).join(' · ');
  if(fi) L.push('Firman: '+_inspLimpio(fi, 240));
  L.push('Registrada en el portal por '+(quien||'la oficina')+' (inspección mensual de equipos).');
  /* «items» va vacío, como en la inspección registrada desde la web: en la app esa columna es la lista de puntos del
     checklist (un arreglo); el detalle de cada equipo está en la hoja del mes */
  return { tipo:fkNombre, items:null, observacion:L.join('\n'), inspector:gesTxt(d.sst.n).slice(0, 100), resultado:(c.o || c.f) ? 'observado' : 'conforme', fecha:fe || d.fecha, foto_url:null };
}
/* un renglón por formato en «Inspecciones», como los de la app: se actualiza el del mes, no se suma otro */
function _menResumenes(paquete, cat){
  var mes=paquete.mes, pre='wm'+mes.replace('-', '')+'-', porF={}, quien=gesQuien();
  paquete.items.forEach(function(it){ var k=it.fk||''; (porF[k]=porF[k]||[]).push(it); });
  var claves=Object.keys(porF); if(!claves.length) return Promise.resolve(0);
  return sbGet('sst_inspeccion?'+filtroObra('sst_inspeccion')+'&ext=like.'+encodeURIComponent(pre+'*')+'&select=id,ext&limit=200').then(function(rows){
    var ya={}; (rows||[]).forEach(function(x){ if(x && String(x.ext||'').indexOf(pre)===0) ya[x.ext]=x.id; });
    var n=0, cadena=Promise.resolve();
    claves.forEach(function(k){
      var ext=pre+(k || 'general'), fila=_menResumenFila(porF[k], paquete, menFormatoNombre(k, cat), quien);
      cadena=cadena.then(function(){
        if(ya[ext]) return sbPatch('sst_inspeccion?id=eq.'+encodeURIComponent(ya[ext]), fila);
        fila.empresa=YO.obra.id; fila.ext=ext;
        return sbPostP('sst_inspeccion', fila);
      }).then(function(){ n++; }, function(){});
    });
    return cadena.then(function(){ return n; });
  }, function(){ return 0; });      /* una base sin la columna «ext»: no se arriesga a duplicar renglones */
}
function _menGuardar(){
  var S=MEN; if(!S || S.guardando || S.lee) return Promise.resolve(false);
  var falta=_menFalta(), bt=$('men-ok');
  if(falta){
    if(S.paso!==falta.paso) _menIr(falta.paso);
    _menMsg(falta.t, 'mal');
    if(falta.foco && $(falta.foco)) try{ $(falta.foco).focus(); }catch(e){}
    if(falta.fila){ if(S.q || S.ver!=='todos'){ S.q=''; S.ver='todos'; var q=$('men-q'); if(q) q.value=''; _menListaPinta(); }
      var f=null; Array.prototype.forEach.call(document.querySelectorAll('#men-lista .men-f'), function(z){ if(z.getAttribute('data-id')===falta.fila) f=z; });
      if(f){ try{ f.scrollIntoView({ block:'center' }); var i=f.querySelector('input[data-o]'); if(i) i.focus(); }catch(e){} } }
    return Promise.resolve(false);
  }
  var obra=S.obra, mes=S.mes, d=S.d, quien=gesQuien();
  var vivo=function(){ return MEN===S; };
  S.guardando=true; if(bt) bt.disabled=true; _menMsg('Guardando la hoja…', 'gris');
  /* lo mío: lo que marqué o cambié respecto de lo que la hoja tenía al abrirla (el detalle, como se va a guardar) */
  S.L.forEach(function(it){ it.o=(it.r==='o' || it.r==='f') ? gesTxt(it.o).slice(0, 300) : ''; });
  var mios={};
  S.L.forEach(function(it){ if(it.r && _menFirmaDe(it)!==S.base[it.id]) mios[it.id]=it; });
  var paquete=null, idFila=null, fallos=[], anotados=0, cintaMal=false;
  var escribir=function(){
    var texto=JSON.stringify(paquete);
    var p=idFila ? sbPatch('sst_doc?id=eq.'+encodeURIComponent(idFila), { nombre:menNombre(mes), nota:texto })
                 : sbPostP('sst_doc', { empresa:YO.obra.id, hoja:MEN_HOJA, nombre:menNombre(mes), nota:texto });
    return p.then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'Esta cuenta no puede guardar en esta obra.' });
      if(!idFila && rows && rows[0] && rows[0].id) idFila=rows[0].id;
      return true;
    });
  };
  /* 1 · la cinta del mes, sobre lo que el servidor tiene ahora */
  var pCinta=(S.colores[mes]===d.color) ? Promise.resolve() : estadoLeerP('color_herramientas').then(function(f){
    var v=f && f.valor, o=(v && typeof v==='object' && !Array.isArray(v)) ? v : {};
    o[mes]=d.color;
    return estadoEscribirP('color_herramientas', o).then(function(){ S.colores=o; });
  }).then(null, function(){ cintaMal=true; });
  return pCinta.then(function(){
    /* 2 · la hoja, sobre lo que el servidor tiene EN ESTE MOMENTO: lo que otro marcó en los demás equipos no se pisa */
    return menTraer();
  }).then(function(filas){
    if((YO.obra||{}).id!==obra) return Promise.reject('otra_obra');
    var f=filas.filter(function(x){ return x.d.mes===mes; })[0]||null, srv=f ? f.d : null, items={}, orden=[];
    idFila=f ? f.id : null;
    (srv ? srv.items : []).forEach(function(it){ items[it.id]=it; orden.push(it.id); });
    /* los check list que viajan en la hoja: el que el servidor ya tiene manda (otros equipos se marcaron con él) */
    var L2={}; Object.keys((srv && srv.listas) || {}).forEach(function(k){ L2[k]=srv.listas[k]; });
    S.L.forEach(function(it){ if(it.r && it.ck && !L2[it.ck] && it.lista) L2[it.ck]={ n:it.lista.n, p:it.lista.p }; });
    S.L.forEach(function(it){
      if(!it.r) return;
      if(mios[it.id] || !items[it.id]){ if(!items[it.id]) orden.push(it.id); items[it.id]=_menItem(it, L2); }
    });
    paquete=menLimpio({ mes:mes, fecha:(S.toco.dia || !srv) ? d.fecha : (srv.fecha || d.fecha), color:d.color, cod:(S.toco.cab || !srv) ? d.cod : srv.cod, ver:(S.toco.cab || !srv) ? d.ver : srv.ver,
      prod:(S.toco.prod || !srv) ? d.prod : srv.prod, sst:(S.toco.sst || !srv) ? d.sst : srv.sst,
      listas:L2, items:orden.map(function(id){ return items[id]; }), por:quien, cuando:new Date().toISOString() });
    return escribir();
  }).then(function(){
    /* 3 · cada equipo, con la función de la app, de a cuatro: todo lo que la hoja tiene SIN anotar todavía en su
       equipo (lo que se acaba de marcar, y lo que quedó pendiente de una vez anterior) */
    var porL={}; S.L.forEach(function(x){ porL[x.id]=x; });
    var cola=paquete.items.filter(function(it){ var x=porL[it.id]; return !it.s && x && x.estado!=='baja'; }), total=cola.length, hechos=0;
    if(!total) return;
    var uno=function(){
      var it=cola.shift(); if(!it) return Promise.resolve();
      return sbRpc('sst_equipo_revisar', { p_id:it.id, p_res:MEN_R[it.r].srv, p_color:paquete.color||null, p_obs:_menObsSrv(it, paquete.listas)||null, p_por:gesTxt(paquete.sst.n) || quien || null, p_fecha:it.f || paquete.fecha })
        .then(function(j){
          if(j && j.ok){ anotados++; it.s=1; }
          else fallos.push({ it:it, m:(j && j.motivo) || '' });
        }, function(){ fallos.push({ it:it, m:'red' }); })
        .then(function(){ hechos++; if(vivo()) _menMsg('Anotando cada equipo… '+hechos+' de '+total, 'gris'); return uno(); });
    };
    return Promise.all([uno(), uno(), uno(), uno()]).then(function(){ return anotados ? escribir() : true; });
  }).then(function(){
    /* 4 · el renglón de cada formato en «Inspecciones» */
    if(vivo()) _menMsg('Dejándola en «Inspecciones»…', 'gris');
    return _menResumenes(paquete, S.cat);
  }).then(function(){
    S.guardando=false; S.sucio=false; S.toco={ cab:false, dia:false, color:false, prod:false, sst:false };
    /* lo que hay en pantalla queda igual a lo guardado: lo de otros con lo que el servidor tenía, y lo mío con su «ya anotado» */
    var porL2={}; S.L.forEach(function(z){ porL2[z.id]=z; });
    S.base={};
    paquete.items.forEach(function(it){
      S.base[it.id]=_menFirmaDe(it);
      var z=porL2[it.id]; if(!z) return;
      if(!mios[it.id]){ var Lg=_menListaK(it.ck, paquete.listas) || _menGeneral(); z.ck=Lg.k; z.lista=Lg; z.r=it.r; z.p=it.p.slice(); z.o=it.o; z.f=it.f; z.d=it.d; z.app=it.app; z.s=it.s; }
      else if(_menFirmaDe(z)===_menFirmaDe(it)) z.s=it.s;
      if(it.s && _menFirmaDe(z)===_menFirmaDe(it)) S.env[it.id]=_menFirmaDe(it);
    });
    S.d=menLimpio(paquete); S.fila={ id:idFila, d:menLimpio(paquete), texto:'' };
    S.filas=[S.fila].concat(S.filas.filter(function(x){ return x.d.mes!==mes; }));
    if(!fallos.length) _menBorradorQuitar(S);
    var recu=$('men-recu'); if(recu && recu.parentNode) recu.parentNode.removeChild(recu);
    var c=menCuenta(S.L), malos=fallos.length;
    var txt='Inspección de '+eqMesNombre(mes+'-01')+' guardada: '+c.hechos+' de '+c.n+' '+(c.n===1 ? 'equipo' : 'equipos')+(c.hechos ? ' ('+menCuentaTxt(c)+')' : '')+'.';
    if(vivo()){
      if(bt) bt.disabled=false;
      _menMsg(malos ? (malos===1 ? 'Un equipo no se pudo anotar' : malos+' equipos no se pudieron anotar')+' ('+fallos.slice(0, 4).map(function(x){ return x.it.cod; }).join(', ')+(malos>4 ? '…' : '')+'): la hoja sí quedó. Vuelve a tocar «Guardar».'
                    : (cintaMal ? 'Guardada, pero la cinta del mes no quedó para toda la obra: elígela en «Equipos y herramientas»' : 'Guardada · cada equipo ya dice su resultado en su QR y en la app'), malos ? 'mal' : (cintaMal ? 'gris' : 'ok'));
      if(malos) S.sucio=true;
      if(S.paso==='equipos') _menListaPinta(); else if(S.paso==='hoja') _menHojaPinta();
      _menPintaPasos();
    }
    toast(txt+(anotados ? ' Su QR ya lo dice.' : ''));
    if((VISTA.actual==='equipos' || VISTA.actual==='insp') && typeof VISTA.recargar==='function') VISTA.recargar(true);
    return true;
  }).then(null, function(e){
    S.guardando=false;
    if(e==='otra_obra') return false;
    if(vivo()){ if(bt) bt.disabled=false; _menMsg('No se pudo guardar. '+porQueFallo(e), 'mal'); }
    return false;
  });
}

/* ══ 3 · LA HOJA ══════════════════════════════════════════════════════════════════════════════
   A4 horizontal, con el dibujante de los papeles (_ppDoc): los datos y, por cada check list, lo que se mira (numerado)
   y un renglón por equipo con una columna por punto; al final, el total y las dos firmas. El check list de más de
   MEN_LISTA_MAX puntos no lleva columnas: en «Observación» va el número de los que no cumple. Lo que vino de la app o
   de la inspección diaria no se marcó con estos puntos: lo dice en lugar de las columnas. «En blanco»: la misma lista
   con los casilleros vacíos, para llevarla al campo.
   d: la hoja · L: los equipos (menArmar) · C: lo de la obra (papCtx) → Promise<{ blob, nombre, hojas }> */
/* lo que se mira en un check list: sus puntos numerados y corridos a todo el ancho de la hoja (el número, en negrita):
   ocupa la mitad que una cuadrícula. dibuja=false solo mide. Devuelve el alto; si no entra en la hoja, sigue en otra */
function _menLeyenda(P, Lz, dibuja){
  var doc=P.doc, pt=6.6, lh=P.lh(pt), x0=P.M+1.6, w=P.w-3.2, cx=x0, cy=P.y+0.9, alto=lh;
  var pon=function(pal, b){
    P.fuente(pt, b);
    var a=doc.getTextWidth(pal);
    if(cx>x0 && cx+a>x0+w){
      cx=x0; cy+=lh; alto+=lh;
      if(dibuja && cy+lh>P.fondo){ P.y=cy; P.salto(); cy=P.y+0.9; P.fuente(pt, b); }
    }
    if(dibuja){ doc.setTextColor(_PP_TINTA[0], _PP_TINTA[1], _PP_TINTA[2]); doc.text(pal, cx, cy+pt*0.76*_PP_MMPT); }
    cx+=a+doc.getTextWidth(' ');
  };
  Lz.p.forEach(function(p, i){
    pon((i+1)+'.', true);
    String(p[1]).split(/\s+/).forEach(function(pal){ if(pal) pon(pal, false); });
    cx+=1.8;
  });
  if(dibuja) P.y=cy+lh+0.9;
  return alto+1.8;
}
function menPdf(d, L, C, op){
  op=op||{}; C=C||{};
  return cargarEvPDF().then(function(){
    var blanco=!!op.blanco, obra=String(nombreObraP()||'');
    var P=_ppDoc('h', { emp:C.emp||{}, logo:C.logo||null, obra:obra, rotulo:obra, tx:C.tx, fmt:{ inspm:{ cod:d.cod, rev:d.ver, fecha:blanco ? '' : d.fecha } } },
                 'INSPECCIÓN MENSUAL DE EQUIPOS Y HERRAMIENTAS', menMesTxt(d.mes).toUpperCase()+(blanco ? ' · hoja para llevar al campo' : ''), 'inspm');
    var doc=P.doc, M=P.M, W=P.w, hF=6.2, col=eqColor(d.color);
    P.cabecera();
    /* los datos */
    var y=P.y, w1=W*0.46, w2=W*0.24, w3=W-w1-w2;
    P.par(M, y, 22, w1-22, hF, 'Obra', obra);
    P.par(M+w1, y, 16, w2-16, hF, 'Mes', menMesTxt(d.mes));
    P.par(M+w1+w2, y, 22, w3-22, hF, 'Día', blanco ? '' : fechaLarga(d.fecha));
    y+=hF;
    P.par(M, y, 22, w1-22, hF, 'Seguridad', [d.sst.n, d.sst.c].filter(Boolean).join(' · '));
    P.par(M+w1, y, 20, w2-20, hF, 'Producción', d.prod.n);
    P.par(M+w1+w2, y, 22, w3-22, hF, 'Cinta del mes', col ? col.n : '');
    if(col){ doc.setFillColor(parseInt(col.h.slice(1, 3), 16), parseInt(col.h.slice(3, 5), 16), parseInt(col.h.slice(5, 7), 16)); doc.setDrawColor(70, 78, 86); doc.setLineWidth(0.22); doc.rect(M+W-13, y+1.4, 10, hF-2.8, 'FD'); }
    P.y=y+hF;
    P.celda(M, P.y, W, 5, 'C = cumple · NC = no cumple. «Conforme» es que el equipo cumple todos los puntos de su check list: cada tipo de equipo tiene el suyo.', { pt:6.8, c:_PP_TENUE });
    P.y+=5+2;
    var n=0, c={ c:0, o:0, f:0, sin:0 };
    var FONDO={ c:[232, 245, 238], o:[255, 243, 214], f:[253, 232, 230] }, TINTA={ c:[11, 107, 58], o:[138, 87, 0], f:[168, 32, 26] };
    if(!L.length){ P.celda(M, P.y, W, 9, 'Todavía no hay equipos registrados en la obra.', { pt:7.6, al:'c', c:_PP_TENUE }); P.y+=9; }
    /* los equipos, por check list (los que llegan sin su lista —una hoja guardada— la toman de la hoja o del catálogo) */
    var secs=_menSecciones(L.map(function(it){ if(it.lista) return it; var z=Object.assign({}, it); z.lista=_menListaK(it.ck, d.listas) || _menGeneral(); z.ck=z.lista.k||''; return z; }));
    secs.forEach(function(S0){
      var Lz=S0.L, N=Lz.p.length, conCol=(N<=MEN_LISTA_MAX), nP=conCol ? N : 0, wP=conCol ? Math.max(6, Math.min(8, 84/N)) : 0;
      var resto=W-(8+24+32+28+nP*wP), wE=Math.round(resto*0.44*10)/10, wO=resto-wE;
      var Wc=[8, 24, wE, 32], q;
      for(q=0;q<nP;q++) Wc.push(wP);
      Wc.push(28, wO);
      var X=[M]; for(q=0;q<Wc.length;q++) X.push(X[q]+Wc[q]);
      var iR=4+nP, iO=5+nP;
      var cab=function(){
        var hc=6.4, T=['N.°', 'Código', 'Equipo o herramienta', 'Responsable'], j;
        for(j=0;j<nP;j++) T.push(String(j+1));
        T.push('Resultado', 'Observación');
        T.forEach(function(tt, i){ P.celda(X[i], P.y, Wc[i], hc, tt, { f:_PP_AZUL, b:true, pt:7, al:(i>=4 && i<=iR) ? 'c' : '' }); });
        P.y+=hc;
      };
      /* el título, lo que se mira, la cabecera y el primer equipo van juntos, si entran en una hoja */
      var hLey=_menLeyenda(P, Lz, false);
      if(!P.cabe(5+hLey+6.4+8)) P.salto();
      P.titulo(String(Lz.n).toUpperCase(), S0.n+' '+(S0.n===1 ? 'equipo' : 'equipos')+' · '+N+' puntos'+(conCol ? '' : ' · en «Observación» va el número de los que no cumple'));
      var yL=P.y, entra=P.cabe(hLey);
      _menLeyenda(P, Lz, true);
      if(entra){ doc.setDrawColor(70, 78, 86); doc.setLineWidth(0.22); doc.rect(M, yL, W, P.y-yL, 'S'); }
      if(!P.cabe(6.4+8)) P.salto();
      cab();
      S0.items.forEach(function(it){
        var r=blanco ? '' : it.r;
        var nombre=[it.tipo, it.det].filter(Boolean).join(' · ');
        var deOtro=(r && (it.app || it.d)) ? (it.app ? 'Anotado en la app' : 'De su inspección diaria') : '';
        var nc=(!conCol && r==='o' && it.p.length) ? 'No cumple: '+it.p.map(function(i){ return i+1; }).join(', ')+'.' : '';
        var obs=blanco ? '' : [nc, it.r==='c' ? '' : it.o, (!conCol && it.d && !/inspecci[oó]n diaria/i.test(it.o||'')) ? '(de su inspección diaria)' : ''].filter(Boolean).join(' ');
        var hr=Math.max(blanco ? 7.4 : 6.6, P.alto(nombre, Wc[2]-2.8, 7.2)+1.6, P.alto(obs, Wc[iO]-2.8, 7)+1.6, P.alto(it.resp, Wc[3]-2.8, 7)+1.6);
        if(!P.cabe(hr)){ P.salto(); cab(); }
        var yy=P.y; n++;
        P.celda(X[0], yy, Wc[0], hr, String(n), { pt:7, al:'c', c:_PP_TENUE });
        P.celda(X[1], yy, Wc[1], hr, it.cod, { pt:7.4, b:true });
        P.celda(X[2], yy, Wc[2], hr, nombre, { pt:7.2 });
        P.celda(X[3], yy, Wc[3], hr, it.resp, { pt:7 });
        if(nP && deOtro) P.celda(X[4], yy, nP*wP, hr, deOtro, { pt:6.2, al:'c', c:_PP_TENUE, max:Math.max(1, Math.floor((hr-0.6)/P.lh(6.2))) });
        else for(var j=0;j<nP;j++){
          var tt='', o2={ pt:7, al:'c' };
          if(r==='c') tt='C';
          else if(r==='o' && it.p.length){ if(it.p.indexOf(j)>-1){ tt='NC'; o2.b=true; o2.c=TINTA.o; o2.f=FONDO.o; } else tt='C'; }
          else if(r==='f') tt='—';
          P.celda(X[4+j], yy, Wc[4+j], hr, tt, o2);
        }
        if(r){
          P.caja(X[iR], yy, Wc[iR], hr, FONDO[r]);
          var dos2=(it.f && it.f!==d.fecha) ? 1 : 0, lh=P.lh(6.6);
          P.txt(MEN_R[r].pdf, X[iR]+1, yy+(hr-(1+dos2)*lh)/2, Wc[iR]-2, { pt:(r==='f') ? 6 : 6.6, b:true, al:'c', c:TINTA[r], max:1 });
          if(dos2) P.txt(menDMA(it.f), X[iR]+1, yy+(hr-(1+dos2)*lh)/2+lh, Wc[iR]-2, { pt:6, al:'c', c:_PP_TENUE, max:1 });
          c[r]++;
        }else{ P.celda(X[iR], yy, Wc[iR], hr, '', {}); c.sin++; }
        P.celda(X[iO], yy, Wc[iO], hr, obs, { pt:7 });
        P.y+=hr;
      });
      P.y+=2;
    });
    /* el total */
    P.sitio(8);
    var tot=blanco ? 'TOTAL: '+L.length+' '+(L.length===1 ? 'equipo' : 'equipos')+' en la lista'
                   : 'TOTAL: '+L.length+' '+(L.length===1 ? 'equipo' : 'equipos')+' · '+c.c+' '+(c.c===1 ? 'conforme' : 'conformes')+' · '+c.o+' con observación · '+c.f+' fuera de servicio'+(c.sin ? ' · '+c.sin+' sin revisar' : '');
    P.celda(M, P.y, W, 6.4, tot, { f:_PP_GRIS, b:true, pt:7.4 });
    P.y+=6.4+3;
    /* las firmas: Producción y Seguridad */
    var hS=31; P.sitio(hS);
    var wS=(W-6)/2;
    [['prod', 'PRODUCCIÓN'], ['sst', 'SEGURIDAD (SST)']].forEach(function(z, i){
      var f=d[z[0]], x=M+i*(wS+6), y0=P.y, conF=!blanco && f.f;
      P.celda(x, y0, wS, 5, z[1], { f:_PP_AZUL, b:true, pt:7.2, al:'c' });
      P.caja(x, y0+5, wS, hS-5);
      if(conF){ try{ PAP_APP.firma(doc, f.f, x+wS*0.28, y0+6, wS*0.44, 13.5); }catch(e){} }
      doc.setDrawColor(120, 128, 136); doc.setLineWidth(0.2); doc.line(x+wS*0.2, y0+20.5, x+wS*0.8, y0+20.5);
      P.txt(blanco ? '' : f.n, x+2, y0+21.2, wS-4, { pt:7.6, b:true, al:'c', max:1 });
      P.txt(blanco ? 'Nombre, cargo y firma' : (f.c || ''), x+2, y0+24.6, wS-4, { pt:6.6, al:'c', c:_PP_TENUE, max:1 });
      if(conF && f.t) P.txt('Firmó en pantalla el '+fechaLarga(f.t)+' a las '+(function(){ try{ var t=new Date(f.t); return dos(t.getHours())+':'+dos(t.getMinutes()); }catch(e){ return ''; } })(), x+2, y0+27.6, wS-4, { pt:5.6, al:'c', c:_PP_TENUE, max:1 });
    });
    P.y+=hS;
    var R=P.listo();
    R.nombre=_papNombre('Inspeccion mensual de equipos - '+d.mes+' - '+obra+(blanco ? ' (en blanco)' : ''))+'.pdf';
    return R;
  });
}
