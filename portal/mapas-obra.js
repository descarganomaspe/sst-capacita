/* OBRASST · portal · MAPAS DE OBRA (23/11/2026 · etapa 1: el editor 2D, la leyenda, la lámina y su publicación)
   Marcelo («Suite de 3 mapas de obra»): «un solo plano base por nivel → 3 mapas» (riesgos MR-SST, evacuación ME-SST y
   protecciones colectivas MPC-SST), cada uno con su lámina formal (A3/A4 horizontal, un nivel por hoja, con su leyenda
   automática, su cajetín y sus firmas) que se publica sola en su carpeta de Documentos y en su cartel QR.
   · El plano de cada nivel se sube una vez (PDF, PNG o JPG) o se arma con la plantilla de terreno; se ve atenuado a gris
     (40 % por defecto) para que no compita con lo que se dibuja encima.
   · 5 capas fijas: 0 plano · 1 áreas, oficinas y accesos (lo comparten los 3 mapas del nivel) · 2 línea de fuego y zonas
     de trabajo (translúcidas, con tramado: nunca tapan lo de abajo) · 3 rutas, protecciones lineales y figuras · 4 señales
     NTP y pines (siempre arriba, con halo blanco). Cada capa con su ojo y su candado.
   · Las señales son las 171 de la NTP 399.010-1 que ya tiene OBRASST (senales-app.js), no una copia.
   · Lo guarda el servidor (sql/2026-11-23-mapas-obra.sql): cada mapa por nivel y por revisión; publicar deja la revisión
     aprobada con su PDF, y la siguiente edición abre la revisión que sigue.
   Etapa 2: la vista 3D, el visor en la app, las firmas dibujadas y el mural. Etapa 3: «Usted está aquí», «Mapas del piso». */
var MPO_TIPOS = [
  { k:'riesgos',      n:'Mapa de riesgos',                  cod:'MR-SST-001',  hoja:'mapa-riesgos',      ic:'⚠️', tit:'MAPA DE RIESGOS' },
  { k:'evacuacion',   n:'Mapa de evacuación',               cod:'ME-SST-001',  hoja:'mapa-evacuacion',   ic:'🏃', tit:'MAPA DE EVACUACIÓN' },
  { k:'protecciones', n:'Mapa de protecciones colectivas', cod:'MPC-SST-001', hoja:'mapa-protecciones', ic:'🦺', tit:'MAPA DE PROTECCIONES COLECTIVAS' }
];
var MPO_CAPAS = [
  { k:0, n:'Plano base' }, { k:1, n:'Áreas, oficinas y accesos' }, { k:2, n:'Línea de fuego y zonas' },
  { k:3, n:'Rutas, protecciones y figuras' }, { k:4, n:'Señales y pines' }
];
var MPO_EST = { inst:{ n:'Instalada', c:'#16A34A', e:'🟢' }, pend:{ n:'Por instalar', c:'#D97706', e:'🟡' }, obs:{ n:'Observada / retirada', c:'#DC2626', e:'🔴' } };

/* ── las figuras de OBRASST: un círculo de su color con su dibujo blanco (caja de 0 a 100) ── */
function _mpoF(k, n, g, c, d, op){ var o = { k:k, n:n, g:g, c:c, d:d }; if(op) for(var q in op) o[q] = op[q]; return o; }
var MPO_C = { maq:'#D98E04', est:'#7C5CC4', per:'#2563EB', ofi:'#475569', eva:'#15803D', fue:'#C62828', pro:'#0E7490', amb:'#0F766E' };
var _L = 'fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"', _B = 'fill="#fff"';
var MPO_FIG = [
  /* maquinaria y equipos */
  _mpoF('grua-torre', 'Grúa torre', 'maq', MPO_C.maq, '<path ' + _L + ' d="M45 84V22M24 26h52M68 26v18M63 44h10M45 22l-14 4M45 22l26 4"/><path ' + _B + ' d="M35 80h20v6H35z"/>', { radio:1 }),
  _mpoF('grua-movil', 'Grúa móvil / camión grúa', 'maq', MPO_C.maq, '<path ' + _L + ' d="M18 70h48v-12H30l-6 12M66 70h12v-10l-6-6h-6M36 58L70 24v14"/><circle ' + _B + ' cx="30" cy="74" r="6"/><circle ' + _B + ' cx="64" cy="74" r="6"/>', { radio:1 }),
  _mpoF('grua-oruga-izaje', 'Grúa oruga para izajes', 'maq', MPO_C.maq, '<path ' + _L + ' d="M20 76h60M24 66h44v10M42 66L74 18M74 18v22M70 40h8"/><path ' + _B + ' d="M18 74h64v8H18z"/>', { radio:1 }),
  _mpoF('grua-oruga-pantalla', 'Grúa oruga (muro pantalla / Milán)', 'maq', MPO_C.maq, '<path ' + _L + ' d="M20 76h60M26 66h40v10M46 66V16M46 16l12 8M58 24v14"/><path ' + _B + ' d="M52 38h12l-2 12h-8zM18 74h64v8H18z"/>', { radio:1 }),
  _mpoF('pilotera', 'Pilotera', 'maq', MPO_C.maq, '<path ' + _L + ' d="M50 14v56M40 70h20M36 76h28M50 14l-14 56M50 14l14 56"/><path ' + _B + ' d="M30 74h40v8H30z"/>', { radio:1 }),
  _mpoF('excavadora', 'Excavadora / retroexcavadora', 'maq', MPO_C.maq, '<path ' + _L + ' d="M16 76h44M22 64h30V50H34l-12 14M52 54l16-20 14 16M82 50l-8 10"/><path ' + _B + ' d="M14 72h50v8H14z"/>'),
  _mpoF('volquete', 'Volquete', 'maq', MPO_C.maq, '<path ' + _L + ' d="M16 66h50V44H22zM66 66h14V52l-6-8h-8"/><circle ' + _B + ' cx="28" cy="72" r="7"/><circle ' + _B + ' cx="68" cy="72" r="7"/>'),
  _mpoF('mixer', 'Mixer', 'maq', MPO_C.maq, '<ellipse ' + _L + ' cx="40" cy="48" rx="22" ry="14" transform="rotate(-12 40 48)"/><path ' + _L + ' d="M16 66h50M66 66h14V52l-6-8h-8"/><circle ' + _B + ' cx="26" cy="72" r="7"/><circle ' + _B + ' cx="68" cy="72" r="7"/>'),
  _mpoF('bomba-concreto', 'Bomba de concreto', 'maq', MPO_C.maq, '<path ' + _L + ' d="M16 68h52M68 68h12V54l-6-8h-6M30 60L46 30l18 12 16-18"/><circle ' + _B + ' cx="28" cy="74" r="6"/><circle ' + _B + ' cx="64" cy="74" r="6"/>'),
  _mpoF('camion-cama-cuna', 'Camión cama cuna', 'maq', MPO_C.maq, '<path ' + _L + ' d="M12 64h56l6-8h12v8M18 56h40"/><circle ' + _B + ' cx="22" cy="70" r="6"/><circle ' + _B + ' cx="38" cy="70" r="6"/><circle ' + _B + ' cx="78" cy="70" r="6"/>'),
  _mpoF('vehiculo', 'Vehículo', 'maq', MPO_C.maq, '<path ' + _L + ' d="M16 64h68v-10l-8-4-8-12H36l-10 12-10 4z"/><circle ' + _B + ' cx="32" cy="66" r="7"/><circle ' + _B + ' cx="68" cy="66" r="7"/>'),
  _mpoF('montacargas', 'Montacargas', 'maq', MPO_C.maq, '<path ' + _L + ' d="M30 70V34h22l8 18v18H30M70 22v50M70 72h14M60 46h10"/><circle ' + _B + ' cx="36" cy="72" r="7"/><circle ' + _B + ' cx="56" cy="72" r="7"/>'),
  _mpoF('elevador', 'Elevador / winche de obra', 'maq', MPO_C.maq, '<rect ' + _L + ' x="28" y="16" width="44" height="68" rx="4"/><path ' + _L + ' d="M42 40l8-10 8 10M42 60l8 10 8-10"/>'),
  _mpoF('compactadora', 'Compactadora / rodillo', 'maq', MPO_C.maq, '<circle ' + _L + ' cx="30" cy="62" r="14"/><path ' + _L + ' d="M44 62h30V44H54l-8 10M74 62v10"/>'),
  _mpoF('bomba-sellwood', 'Bomba sellwood / de achique', 'maq', MPO_C.maq, '<circle ' + _L + ' cx="44" cy="54" r="18"/><path ' + _L + ' d="M62 54h20v-20M44 72v12M26 54H16"/><path ' + _B + ' d="M36 46l16 8-16 8z"/>'),
  _mpoF('generador', 'Grupo electrógeno', 'maq', MPO_C.maq, '<rect ' + _L + ' x="18" y="30" width="64" height="42" rx="6"/><path ' + _B + ' d="M54 34L38 54h12l-6 16 16-22H48z"/>'),
  _mpoF('tablero', 'Tablero eléctrico', 'maq', MPO_C.maq, '<rect ' + _L + ' x="26" y="16" width="48" height="68" rx="4"/><path ' + _B + ' d="M54 26L38 50h12l-6 22 16-28H48z"/>'),
  /* estructuras y obra */
  _mpoF('andamio', 'Andamio multidireccional', 'est', MPO_C.est, '<path ' + _L + ' d="M26 84V16M74 84V16M26 30h48M26 54h48M26 78h48M26 30l48 24M26 54l48 24"/>'),
  _mpoF('andamio-colgante', 'Andamio colgante', 'est', MPO_C.est, '<path ' + _L + ' d="M30 14v40M70 14v40M20 54h60v12H20zM18 14h64"/>'),
  _mpoF('zanja', 'Zanja / excavación abierta', 'est', MPO_C.est, '<path ' + _L + ' d="M14 34h20l6 34h20l6-34h20"/><path fill="none" stroke="#fff" stroke-width="3" d="M42 60l16-14M44 66l14-12"/>'),
  _mpoF('zona-izaje', 'Zona de izaje', 'est', MPO_C.est, '<path ' + _L + ' d="M50 14v30M50 44a10 10 0 1 1-10 10M30 76h40M36 66h28v10H36z"/>', { radio:1 }),
  _mpoF('acopio', 'Acopio de materiales', 'est', MPO_C.est, '<path ' + _L + ' d="M18 76h64M22 76V62h56v14M28 62V48h44v14M34 48V34h32v14"/>'),
  _mpoF('matpel', 'Almacén MATPEL', 'est', MPO_C.est, '<path ' + _L + ' d="M50 14l34 36-34 36-34-36z"/><path ' + _B + ' d="M46 30h8v26h-8zM46 62h8v8h-8z"/>'),
  _mpoF('residuos', 'Residuos', 'amb', MPO_C.amb, '<path ' + _L + ' d="M30 32h40l-4 50H34zM24 32h52M42 24h16v8"/>'),
  _mpoF('bateria-residuos', 'Batería de residuos (colores)', 'amb', MPO_C.amb, '<path ' + _L + ' d="M12 40h22l-2 36H14zM39 40h22l-2 36H41zM66 40h22l-2 36H68z"/><path ' + _B + ' d="M12 32h76v6H12z"/>'),
  /* personal y control vial */
  _mpoF('cuadrilla', 'Personal / cuadrilla', 'per', MPO_C.per, '<circle ' + _B + ' cx="34" cy="30" r="8"/><circle ' + _B + ' cx="66" cy="30" r="8"/><path ' + _L + ' d="M34 42v28M22 54h24M66 42v28M54 54h24M28 84l6-14 6 14M60 84l6-14 6 14"/>'),
  _mpoF('vigia', 'Vigía', 'per', MPO_C.per, '<circle ' + _B + ' cx="44" cy="26" r="8"/><path ' + _L + ' d="M44 38v28M34 84l10-18 10 18M44 46l20-10V18M64 18h14v12H64"/>'),
  _mpoF('conos', 'Conos de seguridad', 'per', MPO_C.per, '<path ' + _B + ' d="M42 18h16l14 58H28z"/><path fill="' + MPO_C.per + '" d="M38 40h24l3 10H35zM33 60h34l3 10H30z"/><path ' + _B + ' d="M20 76h60v8H20z"/>'),
  _mpoF('tranquera', 'Tranquera / barrera de cierre', 'per', MPO_C.per, '<path ' + _L + ' d="M18 40h64v18H18zM26 58v24M74 58v24"/><path fill="' + MPO_C.per + '" d="M30 41l10 16h6L36 41zM52 41l10 16h6L58 41z"/>'),
  _mpoF('acceso-peatonal', 'Acceso peatonal', 'per', MPO_C.per, '<circle ' + _B + ' cx="52" cy="20" r="8"/><path ' + _L + ' d="M50 32l-8 22 14 10v20M42 54l-10 30M48 38l16 10M46 36l-14 12"/>', { fijo:1 }),
  _mpoF('acceso-vehicular', 'Acceso vehicular', 'per', MPO_C.per, '<path ' + _L + ' d="M16 60h52v-8l-6-4-6-10H34l-8 10-10 4zM74 50h12M80 44l6 6-6 6"/><circle ' + _B + ' cx="30" cy="62" r="6"/><circle ' + _B + ' cx="56" cy="62" r="6"/>', { fijo:1 }),
  _mpoF('sendero', 'Sendero peatonal seguro', 'per', MPO_C.per, '<path ' + _L + ' d="M20 84L40 16M80 84L60 16"/><path ' + _B + ' d="M46 70h8v8h-8zM47 50h6v8h-6zM48 32h4v6h-4z"/>'),
  /* oficinas y campamento (fijas: las comparten los 3 mapas) */
  _mpoF('contenedor', 'Contenedor oficina (20 ft)', 'ofi', MPO_C.ofi, '<rect ' + _L + ' x="12" y="34" width="76" height="32" rx="2"/><path ' + _L + ' d="M24 34v32M36 34v32M48 34v32M60 34v32M72 34v32"/>', { fijo:1 }),
  _mpoF('modulo-doble', 'Módulo prefabricado doble nivel', 'ofi', MPO_C.ofi, '<rect ' + _L + ' x="18" y="18" width="64" height="30" rx="2"/><rect ' + _L + ' x="18" y="52" width="64" height="30" rx="2"/><path ' + _B + ' d="M28 26h12v10H28zM60 26h12v10H60zM44 62h12v20H44z"/>', { fijo:1 }),
  _mpoF('oficina', 'Oficina de obra', 'ofi', MPO_C.ofi, '<path ' + _L + ' d="M16 44L50 18l34 26M24 40v42h52V40"/><path ' + _B + ' d="M44 58h12v24H44z"/>', { fijo:1 }),
  _mpoF('garita', 'Garita / control', 'ofi', MPO_C.ofi, '<rect ' + _L + ' x="30" y="30" width="40" height="52" rx="2"/><path ' + _L + ' d="M24 30h52M38 42h24v14H38z"/>', { fijo:1 }),
  _mpoF('vestuario', 'Vestuario / comedor', 'ofi', MPO_C.ofi, '<path ' + _L + ' d="M32 16v28M26 16v12a6 6 0 0 0 12 0V16M32 44v40M64 16c-8 6-8 24 0 28v40"/>', { fijo:1 }),
  _mpoF('sshh', 'SSHH portátiles', 'ofi', MPO_C.ofi, '<rect ' + _L + ' x="22" y="18" width="24" height="64" rx="3"/><rect ' + _L + ' x="54" y="18" width="24" height="64" rx="3"/><path ' + _B + ' d="M30 26h8v6h-8zM62 26h8v6h-8z"/>', { fijo:1 }),
  _mpoF('topico', 'Tópico de primeros auxilios', 'ofi', '#15803D', '<path ' + _B + ' d="M40 18h20v22h22v20H60v22H40V60H18V40h22z"/>', { fijo:1 }),
  _mpoF('sala-charlas', 'Sala de charlas', 'ofi', MPO_C.ofi, '<rect ' + _L + ' x="20" y="16" width="60" height="34" rx="3"/><circle ' + _B + ' cx="30" cy="66" r="7"/><circle ' + _B + ' cx="50" cy="66" r="7"/><circle ' + _B + ' cx="70" cy="66" r="7"/>', { fijo:1 }),
  _mpoF('hidratacion', 'Punto de hidratación', 'ofi', '#0369A1', '<path ' + _B + ' d="M50 14C38 34 28 46 28 60a22 22 0 0 0 44 0c0-14-10-26-22-46z"/>', { fijo:1 }),
  _mpoF('sombra', 'Punto de sombra', 'ofi', '#0369A1', '<path ' + _B + ' d="M14 46a36 30 0 0 1 72 0z"/><path ' + _L + ' d="M50 46v34a6 6 0 0 1-12 0"/>', { fijo:1 }),
  /* evacuación y emergencias (pines) */
  _mpoF('zona-segura', 'Zona segura en caso de sismo', 'eva', MPO_C.eva, '<text x="50" y="68" text-anchor="middle" font-size="52" font-weight="800" fill="#fff" font-family="Arial">S</text>', { capa:4, cuadro:1 }),
  _mpoF('punto-reunion', 'Punto de reunión', 'eva', MPO_C.eva, '<circle ' + _B + ' cx="50" cy="28" r="7"/><circle ' + _B + ' cx="30" cy="44" r="6"/><circle ' + _B + ' cx="70" cy="44" r="6"/><circle ' + _B + ' cx="38" cy="66" r="6"/><circle ' + _B + ' cx="62" cy="66" r="6"/><path ' + _L + ' d="M50 50v30"/>', { capa:4, cuadro:1, etiqueta:'PR-1' }),
  _mpoF('escalera', 'Escalera de evacuación', 'eva', MPO_C.eva, '<path ' + _L + ' d="M18 80h16V64h16V48h16V32h16V18"/>', { capa:4, fijo:1 }),
  _mpoF('escalera-prov', 'Escalera provisional', 'eva', MPO_C.eva, '<path ' + _L + ' d="M34 84L50 16M66 84L50 16M38 68h24M42 50h16M46 32h8"/>', { capa:4 }),
  _mpoF('botiquin', 'Botiquín', 'eva', MPO_C.eva, '<rect ' + _B + ' x="20" y="30" width="60" height="46" rx="6"/><path fill="' + MPO_C.eva + '" d="M44 38h12v10h10v12H56v10H44V60H34V48h10z"/><path ' + _L + ' d="M40 30v-8h20v8"/>', { capa:4, cuadro:1 }),
  _mpoF('camilla', 'Camilla rígida', 'eva', MPO_C.eva, '<rect ' + _L + ' x="18" y="38" width="64" height="24" rx="10"/><path ' + _L + ' d="M28 62v14M72 62v14M40 50h20"/>', { capa:4, cuadro:1 }),
  _mpoF('lavaojos', 'Estación lavaojos', 'eva', MPO_C.eva, '<path ' + _L + ' d="M18 54c10-14 54-14 64 0-10 14-54 14-64 0z"/><circle ' + _B + ' cx="50" cy="54" r="8"/><path ' + _L + ' d="M40 16l4 10M50 14v12M60 16l-4 10"/>', { capa:4, cuadro:1 }),
  _mpoF('alarma', 'Pulsador / alarma sonora', 'fue', MPO_C.fue, '<rect ' + _L + ' x="24" y="24" width="52" height="52" rx="6"/><circle ' + _B + ' cx="50" cy="50" r="12"/>', { capa:4, cuadro:1 }),
  _mpoF('luz-emergencia', 'Luz de emergencia', 'eva', MPO_C.eva, '<rect ' + _L + ' x="18" y="36" width="64" height="26" rx="4"/><path ' + _L + ' d="M30 72l-6 10M50 72v12M70 72l6 10"/>', { capa:4, cuadro:1 }),
  _mpoF('antiderrame', 'Kit antiderrame', 'amb', MPO_C.amb, '<path ' + _L + ' d="M26 30h48v50H26zM26 44h48"/><path ' + _B + ' d="M50 52c-6 8-8 12-8 16a8 8 0 0 0 16 0c0-4-2-8-8-16z"/>', { capa:4, cuadro:1 }),
  _mpoF('ext-pqs', 'Extintor PQS', 'fue', MPO_C.fue, '<path ' + _B + ' d="M40 30h20v52H40z"/><path ' + _L + ' d="M50 30v-8h12M44 22h12"/><text x="50" y="62" text-anchor="middle" font-size="12" font-weight="800" fill="' + MPO_C.fue + '" font-family="Arial">PQS</text>', { capa:4, cuadro:1 }),
  _mpoF('ext-co2', 'Extintor CO₂', 'fue', MPO_C.fue, '<path ' + _B + ' d="M40 30h20v52H40z"/><path ' + _L + ' d="M50 30v-8h12M44 22h12"/><text x="50" y="62" text-anchor="middle" font-size="12" font-weight="800" fill="' + MPO_C.fue + '" font-family="Arial">CO2</text>', { capa:4, cuadro:1 }),
  _mpoF('ext-agua', 'Extintor agua / clase K', 'fue', MPO_C.fue, '<path ' + _B + ' d="M40 30h20v52H40z"/><path ' + _L + ' d="M50 30v-8h12M44 22h12"/><text x="50" y="62" text-anchor="middle" font-size="16" font-weight="800" fill="' + MPO_C.fue + '" font-family="Arial">K</text>', { capa:4, cuadro:1 }),
  _mpoF('gabinete', 'Gabinete contra incendios', 'fue', MPO_C.fue, '<rect ' + _L + ' x="20" y="20" width="60" height="60" rx="4"/><circle ' + _L + ' cx="50" cy="50" r="16"/><circle ' + _B + ' cx="50" cy="50" r="5"/>', { capa:4, cuadro:1 }),
  /* protecciones colectivas puntuales (con su estado) */
  _mpoF('tapa-hueco', 'Tapa rígida de hueco / ducto', 'pro', MPO_C.pro, '<rect ' + _B + ' x="16" y="26" width="68" height="48" rx="4"/><text x="50" y="47" text-anchor="middle" font-size="13" font-weight="800" fill="' + MPO_C.pro + '" font-family="Arial">HUECO</text><text x="50" y="64" text-anchor="middle" font-size="9.5" font-weight="700" fill="' + MPO_C.pro + '" font-family="Arial">NO RETIRAR</text>', { estado:1, cuadro:1 }),
  _mpoF('bandeja', 'Bandeja perimetral / pantalla anticaída', 'pro', MPO_C.pro, '<path ' + _L + ' d="M16 34h68M16 34l18 30h50M34 64V34"/>', { estado:1 }),
  _mpoF('marquesina', 'Marquesina / túnel peatonal', 'pro', MPO_C.pro, '<path ' + _L + ' d="M16 40L50 22l34 18M24 40v40M76 40v40M24 80h52"/><circle ' + _B + ' cx="50" cy="52" r="6"/><path ' + _L + ' d="M50 60v14"/>', { estado:1 }),
  _mpoF('entibado', 'Entibado / sostenimiento', 'pro', MPO_C.pro, '<path ' + _L + ' d="M22 18v66M78 18v66M22 34h56M22 56h56M22 78h56"/>', { estado:1 }),
  _mpoF('capuchones', 'Capuchones en aceros', 'pro', MPO_C.pro, '<path ' + _L + ' d="M30 84V40M50 84V40M70 84V40"/><circle ' + _B + ' cx="30" cy="36" r="9"/><circle ' + _B + ' cx="50" cy="36" r="9"/><circle ' + _B + ' cx="70" cy="36" r="9"/>', { estado:1 }),
  _mpoF('tablero-prot', 'Tablero protegido (diferencial + tierra)', 'pro', MPO_C.pro, '<rect ' + _L + ' x="26" y="14" width="48" height="56" rx="4"/><path ' + _B + ' d="M54 22L40 42h10l-4 18 14-24H50z"/><path ' + _L + ' d="M38 80h24M42 86h16"/>', { estado:1 }),
  _mpoF('plataforma', 'Andamio / plataforma de descarga (tarjeta)', 'pro', MPO_C.pro, '<path ' + _L + ' d="M24 84V24M76 84V24M24 40h52M24 62h52M14 40h10"/><rect ' + _B + ' x="56" y="68" width="16" height="12" rx="2"/>', { estado:1 }),
  _mpoF('lv-vertical', 'Línea de vida vertical', 'pro', MPO_C.pro, '<path ' + _L + ' d="M50 12v76M40 20h20M40 80h20"/><circle ' + _B + ' cx="50" cy="44" r="7"/>', { estado:1 })
];
/* las líneas (2 toques o más: se termina con doble clic o «Terminar») */
var MPO_LIN = [
  { k:'ruta',      n:'Ruta de evacuación principal', m:'evacuacion', c:'#15803D', w:7, dash:'', flecha:1 },
  { k:'ruta2',     n:'Ruta de evacuación alterna',   m:'evacuacion', c:'#15803D', w:6, dash:'18 12', flecha:1 },
  { k:'baranda',   n:'Baranda rígida perimetral (1,05 m)', m:'protecciones', c:'#0E7490', w:6, dash:'', doble:1, estado:1 },
  { k:'lv',        n:'Línea de vida horizontal',     m:'protecciones', c:'#1D4ED8', w:4, dash:'14 6 3 6', estado:1 },
  { k:'red',       n:'Red de seguridad',             m:'protecciones', c:'#0E7490', w:10, dash:'4 4', estado:1 },
  { k:'raschel',   n:'Malla raschel perimetral',     m:'protecciones', c:'#15803D', w:6, dash:'10 5', estado:1 },
  { k:'cerco',     n:'Cerco perimetral',             m:'protecciones', c:'#334155', w:5, dash:'', cruz:1, estado:1 },
  { k:'malla-nar', n:'Cachacos con malla naranja',   m:'protecciones', c:'#EA580C', w:6, dash:'12 6', estado:1 },
  { k:'barrera',   n:'Barrera rígida de cierre de vía', m:'protecciones', c:'#B45309', w:8, dash:'16 6', estado:1 },
  { k:'limite',    n:'Límite de obra / cerco',       m:'*', c:'#475569', w:4, dash:'', fijo:1 }
];
/* las zonas (polígono, rectángulo o círculo) */
var MPO_ZON = [
  { k:'fuego',     n:'Línea de fuego / zona crítica', c:'#DC2626', capa:2, rayas:1, borde:'14 8' },
  { k:'actividad', n:'Zona de trabajo (actividad)',    c:'#D97706', capa:2, rayas:1, borde:'10 6' },
  { k:'area',      n:'Área / frente / almacén',        c:'#64748B', capa:1, fijo:1, borde:'' },
  { k:'oficinas',  n:'Zona de oficinas',               c:'#2563EB', capa:1, fijo:1, borde:'' },
  { k:'segura',    n:'Zona segura / de reunión',       c:'#16A34A', capa:2, borde:'8 6' }
];
/* qué se ofrece en cada mapa (las pestañas de la bandeja) */
var MPO_BANDEJA = {
  riesgos:      [{ k:'sen', n:'Señales NTP' }, { k:'maq', n:'Maquinaria' }, { k:'est', n:'Obra y personal' }, { k:'ofi', n:'Oficinas' }, { k:'zon', n:'Zonas' }],
  evacuacion:   [{ k:'rut', n:'Rutas' }, { k:'eva', n:'Pines' }, { k:'sen', n:'Señales NTP' }, { k:'ofi', n:'Oficinas' }, { k:'zon', n:'Zonas' }],
  protecciones: [{ k:'pli', n:'Lineales' }, { k:'pro', n:'Puntuales' }, { k:'sen', n:'Señales NTP' }, { k:'ofi', n:'Oficinas' }, { k:'zon', n:'Zonas' }]
};

var MPO = { emp:null, niveles:[], docs:{}, capas:{}, tipo:'riesgos', nivel:'', herr:'sel', pon:null, sel:null, tab:'', busca:'', vb:null,
            vis:{ 0:1, 1:1, 2:1, 3:1, 4:1 }, lock:{}, traz:null, sucio:{}, t:null, caja:null, cargado:false, senales:null,
            vista:'2d', firmas:{}, hist:{}, info:null };
function _mpoTipo(k){ var r = MPO_TIPOS[0]; MPO_TIPOS.forEach(function(t){ if(t.k === k) r = t; }); return r; }
function _mpoFig(k){ for(var i = 0; i < MPO_FIG.length; i++) if(MPO_FIG[i].k === k) return MPO_FIG[i]; return null; }
function _mpoLin(k){ for(var i = 0; i < MPO_LIN.length; i++) if(MPO_LIN[i].k === k) return MPO_LIN[i]; return null; }
function _mpoZon(k){ for(var i = 0; i < MPO_ZON.length; i++) if(MPO_ZON[i].k === k) return MPO_ZON[i]; return null; }
function _mpoSen(k){ var L = MPO.senales || []; for(var i = 0; i < L.length; i++) if(L[i].k === k) return L[i]; return null; }
function _mpoId(){ return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function _mpoNivel(){ var r = null; MPO.niveles.forEach(function(n){ if(n.id === MPO.nivel) r = n; }); return r; }
function _mpoW(N){ return (N && +N.plano_ancho) || 1600; }
function _mpoH(N){ return (N && +N.plano_alto) || 1000; }
/* la capa de un elemento (fija por su clase) */
function mpoCapaDe(e){
  if(e.t === 'sen') return 4;
  if(e.t === 'fig'){ var F = _mpoFig(e.k); return (F && F.capa) || (F && F.fijo ? 1 : 3); }
  if(e.t === 'lin'){ var L = _mpoLin(e.k); return (L && L.fijo) ? 1 : 3; }
  if(e.t === 'zon'){ var Z = _mpoZon(e.k); return (Z && Z.capa) || 2; }
  return 3;
}
function _mpoEsFijo(e){
  if(e.t === 'fig'){ var F = _mpoFig(e.k); return !!(F && F.fijo); }
  if(e.t === 'lin'){ var L = _mpoLin(e.k); return !!(L && L.fijo); }
  if(e.t === 'zon'){ var Z = _mpoZon(e.k); return !!(Z && Z.fijo); }
  return false;
}
/* lo del mapa y nivel que se ve (sus elementos) y lo fijo del nivel */
function _mpoClave(tipo, nivel){ return tipo + '|' + nivel; }
function _mpoCapa(tipo, nivel){
  var k = _mpoClave(tipo || MPO.tipo, nivel || MPO.nivel), c = MPO.capas[k];
  if(!c){ c = MPO.capas[k] = { elementos:[], estado:'nuevo', revision:null }; }
  return c;
}
function _mpoElems(){ var N = _mpoNivel(); return ((N && N.elementos_fijos) || []).concat(_mpoCapa().elementos); }
function _mpoBuscar(id){ var r = null; _mpoElems().forEach(function(e){ if(e.id === id) r = e; }); return r; }

/* ── el servidor ─────────────────────────────────────────────────────────────────────────────── */
function mpoTraer(){
  return sbRpc('sst_mapa_panel', { p_emp:YO.obra.id }).then(function(j){
    if(!j || j.ok === false) return Promise.reject((j && j.motivo) || 'sin_respuesta');
    MPO.emp = YO.obra.id;
    MPO.niveles = (j.niveles || []).map(function(n){ n.elementos_fijos = Array.isArray(n.elementos_fijos) ? n.elementos_fijos : []; return n; });
    MPO.docs = {}; (j.docs || []).forEach(function(d){ MPO.docs[d.tipo] = d; });
    var porId = {}; (j.docs || []).forEach(function(d){ porId[d.id] = d.tipo; });
    MPO.capas = {};
    (j.capas || []).forEach(function(c){
      var t = porId[c.mapa_id]; if(!t) return;
      var k = _mpoClave(t, c.nivel_id), ya = MPO.capas[k];
      /* el borrador manda sobre lo aprobado (es lo que se está editando) */
      if(!ya || (c.estado === 'borrador' && ya.estado !== 'borrador')) MPO.capas[k] = { elementos:Array.isArray(c.elementos) ? c.elementos : [], estado:c.estado, revision:c.revision, pdf:c.pdf_url };
    });
    /* etapa 2 · las firmas (por mapa, revisión y rol) y el historial de lo publicado */
    MPO.firmas = {}; MPO.hist = {};
    (j.firmas || []).forEach(function(f){ var t = porId[f.mapa_id]; if(!t) return; var a = MPO.firmas[t] = MPO.firmas[t] || {}, b = a[f.revision] = a[f.revision] || {}; b[f.rol] = f; });
    (j.historial || []).forEach(function(h){ var t = porId[h.mapa_id]; if(!t) return; (MPO.hist[t] = MPO.hist[t] || []).push(h); });
    if(!MPO.nivel || !_mpoNivel()) MPO.nivel = MPO.niveles.length ? MPO.niveles[0].id : '';
    MPO.cargado = true;
  });
}
/* guardar lo cambiado (un segundo y medio después del último cambio) */
function _mpoSucio(que){
  if(que.indexOf('c:') === 0){ var tp = que.slice(2).split('|')[0], rf = _mpoRevN(tp, true), F = MPO.firmas[tp] && MPO.firmas[tp][rf];
    if(F && Object.keys(F).length){ delete MPO.firmas[tp][rf]; toast('Cambiaste el mapa: la ' + _mpoRev(tp, true) + ' vuelve a pedir sus firmas.'); } }
  MPO.sucio[que] = 1; if(MPO.t) clearTimeout(MPO.t); MPO.t = setTimeout(mpoGuardar, 1500); _mpoEstado('Guardando…'); }
function mpoGuardar(){
  if(MPO.t){ clearTimeout(MPO.t); MPO.t = null; }
  var S = MPO.sucio; MPO.sucio = {};
  var P = [];
  Object.keys(S).forEach(function(q){
    if(q.indexOf('n:') === 0){
      var N = null; MPO.niveles.forEach(function(x){ if(x.id === q.slice(2)) N = x; }); if(!N) return;
      P.push(sbRpc('sst_mapa_nivel_guardar', { p_emp:YO.obra.id, p:{ id:N.id, nombre:N.nombre, orden:N.orden, plano_url:N.plano_url || '', plano_ancho:N.plano_ancho, plano_alto:N.plano_alto,
        opacidad_base:N.opacidad_base, gris_base:N.gris_base, aforo:N.aforo, elementos_fijos:N.elementos_fijos } }));
    } else if(q.indexOf('c:') === 0){
      var p = q.slice(2).split('|'), C = MPO.capas[q.slice(2)]; if(!C) return;
      P.push(sbRpc('sst_mapa_capa_guardar', { p_emp:YO.obra.id, p_tipo:p[0], p_nivel:p[1], p_elementos:C.elementos }).then(function(j){
        if(j && j.ok){ C.estado = 'borrador'; C.revision = j.revision; } return j; }));
    }
  });
  return Promise.all(P).then(function(R){
    var mal = R.filter(function(j){ return !j || j.ok === false; }).length;
    _mpoEstado(mal ? 'No se pudo guardar todo: revisa tu conexión.' : 'Guardado · borrador de la revisión ' + _mpoRev(MPO.tipo, true));
    if(mal) Object.keys(S).forEach(function(q){ MPO.sucio[q] = 1; });
  }, function(){ Object.keys(S).forEach(function(q){ MPO.sucio[q] = 1; }); _mpoEstado('No se pudo guardar: revisa tu conexión.'); });
}
function _mpoEstado(t){ var m = $('mpo-guarda'); if(m) m.textContent = t; }
function _mpoRevN(tipo, borrador){ var d = MPO.docs[tipo], r = d ? +d.revision_actual : -1; return borrador ? r + 1 : Math.max(0, r); }
/* la revisión: la vigente (aprobada) o la que se está armando */
function _mpoRev(tipo, borrador){
  var d = MPO.docs[tipo], r = d ? +d.revision_actual : -1;
  var n = borrador ? r + 1 : Math.max(0, r);
  return 'Rev. ' + (n < 10 ? '0' : '') + n;
}

/* ── la sección ─────────────────────────────────────────────────────────────────────────────── */
function vistaMapasObra(caja){
  MPO.caja = caja; _mpoEstilos();
  caja.innerHTML = '<div class="vacio">Abriendo los mapas de la obra…</div>';
  var emp = YO.obra.id;
  Promise.all([(MPO.emp === emp && MPO.cargado && (MPO.t || Object.keys(MPO.sucio).length)) ? mpoGuardar() : mpoTraer(),
               (typeof cargarSenales === 'function') ? cargarSenales().then(function(){ MPO.senales = (typeof SEN_APP === 'object' && SEN_APP.senales) || []; }, function(){ MPO.senales = []; }) : null
  ]).then(function(){ mpoPintar(); }, function(cod){
    caja.innerHTML = '<div class="vacio mal"><b>No se pudieron abrir los mapas</b>' + (cod === 'no_eres_de_la_obra' ? 'No eres parte del equipo de esta obra.' : 'Revisa tu conexión e inténtalo otra vez. Si el problema sigue, falta activar los mapas en el servidor.') + '</div>';
  });
}
function mpoPintar(){
  var c = MPO.caja; if(!c) return;
  var T = _mpoTipo(MPO.tipo), N = _mpoNivel();
  var h = '<div class="mpo">';
  /* los 3 mapas */
  h += '<div class="mpo-tipos" role="tablist" aria-label="Mapa">' + MPO_TIPOS.map(function(t){
    return '<button type="button" role="tab" aria-selected="' + (t.k === MPO.tipo) + '" class="' + (t.k === MPO.tipo ? 'on' : '') + '" data-mpo="tipo" data-v="' + t.k + '"><span aria-hidden="true">' + t.ic + '</span> ' + esc(t.n) +
      ' <small>' + esc((MPO.docs[t.k] && MPO.docs[t.k].codigo) || t.cod) + ' · ' + _mpoRev(t.k, false) + '</small></button>'; }).join('') + '</div>';
  /* los niveles */
  h += '<div class="mpo-niv"><div class="mpo-niv-l" role="tablist" aria-label="Nivel">' + MPO.niveles.map(function(n){
    return '<button type="button" role="tab" aria-selected="' + (n.id === MPO.nivel) + '" class="' + (n.id === MPO.nivel ? 'on' : '') + '" data-mpo="nivel" data-v="' + esc(n.id) + '">' + esc(n.nombre) + '</button>'; }).join('') +
    '<button type="button" class="mpo-mas" data-mpo="nivel-nuevo">＋ Nivel</button></div>' +
    (N ? '<div class="mpo-niv-a"><button type="button" class="bt sec chico" data-mpo="nivel-dup" title="Copia el plano, lo fijo y lo de los 3 mapas al nivel siguiente">⧉ Duplicar nivel</button>' +
         '<button type="button" class="bt sec chico" data-mpo="nivel-ren">✏️ Nombre</button><button type="button" class="bt sec chico" data-mpo="nivel-sube" aria-label="Mover a la izquierda">◀</button><button type="button" class="bt sec chico" data-mpo="nivel-baja" aria-label="Mover a la derecha">▶</button>' +
         '<button type="button" class="bt sec chico" data-mpo="nivel-quita">Quitar</button></div>' : '') + '</div>';
  if(!N){
    h += '<div class="vacio"><b>Empieza por el primer nivel</b>Un nivel es un plano: «Exteriores / Cerco», «Sótano 1», «Piso 1» o «Pisos típicos: 2 al 14». Sobre ese mismo plano se arman los 3 mapas.<br><br>' +
      '<button type="button" class="bt" data-mpo="nivel-nuevo">＋ Agregar el primer nivel</button></div></div>';
    c.innerHTML = h; c.onclick = _mpoClic; return;
  }
  /* la barra de herramientas */
  h += '<div class="mpo-barra">' + [['sel', '🖱️', 'Mover y elegir'], ['lin', '〰️', 'Trazar línea'], ['pol', '⬠', 'Polígono'], ['rect', '▭', 'Rectángulo'], ['circ', '◯', 'Círculo (radio)']].map(function(b){
      return '<button type="button" class="mpo-h' + (MPO.herr === b[0] ? ' on' : '') + '" data-mpo="herr" data-v="' + b[0] + '" title="' + b[2] + '" aria-pressed="' + (MPO.herr === b[0]) + '"><span aria-hidden="true">' + b[1] + '</span> ' + b[2] + '</button>'; }).join('') +
    '<span class="mpo-sep"></span><span class="mpo-vista" role="group" aria-label="Vista"><button type="button" class="mpo-h' + (MPO.vista === '2d' ? ' on' : '') + '" data-mpo="vista" data-v="2d" aria-pressed="' + (MPO.vista === '2d') + '">2D</button>' +
    '<button type="button" class="mpo-h' + (MPO.vista === '3d' ? ' on' : '') + '" data-mpo="vista" data-v="3d" aria-pressed="' + (MPO.vista === '3d') + '">3D isométrico</button></span>' +
    '<button type="button" class="mpo-h" data-mpo="zoom" data-v="1.25" aria-label="Acercar">＋</button><button type="button" class="mpo-h" data-mpo="zoom" data-v="0.8" aria-label="Alejar">－</button><button type="button" class="mpo-h" data-mpo="ajustar">Ver todo</button>' +
    '<span class="mpo-guarda" id="mpo-guarda" role="status"></span></div>';
  h += '<div class="mpo-cuerpo">';
  /* la bandeja */
  h += '<aside class="mpo-band"><div class="mpo-band-t">' + MPO_BANDEJA[MPO.tipo].map(function(b){
    var on = _mpoTab() === b.k;
    return '<button type="button" class="' + (on ? 'on' : '') + '" data-mpo="tab" data-v="' + b.k + '">' + esc(b.n) + '</button>'; }).join('') + '</div>' +
    '<input type="search" id="mpo-busca" class="mpo-busca" placeholder="Buscar…" value="' + esc(MPO.busca) + '" aria-label="Buscar en la bandeja">' +
    '<div class="mpo-items" id="mpo-items">' + _mpoItemsHTML() + '</div>' +
    (MPO.pon ? '<p class="mpo-ayuda">Toca el plano donde va: <b>' + esc(MPO.pon.n) + '</b>. <button type="button" class="enlace" data-mpo="pon-no">Cancelar</button></p>' : '') + '</aside>';
  /* el lienzo */
  if(MPO.vista === '3d') h += '<div class="mpo-lienzo-c"><div class="mpo-3dc"><div class="mpo-torre" aria-label="Niveles">' + MPO.niveles.map(function(n){ return '<button type="button" class="' + (n.id === MPO.nivel ? 'on' : '') + '" data-mpo="nivel" data-v="' + esc(n.id) + '">' + esc(n.nombre) + '</button>'; }).join('') + '</div>' +
    '<div class="mpo-3dv" id="mpo-3d"></div></div><div class="mpo-info-c" id="mpo-info-c"></div><p class="mpo-ayuda">Vista para mirar y mostrar: se edita en 2D. Toca una figura o una señal para ver su detalle.</p></div>';
  else h += '<div class="mpo-lienzo-c"><div class="mpo-lienzo" id="mpo-lienzo">' + mpoSVG({ editor:true }) + '</div>' +
    (MPO.traz ? '<div class="mpo-traz">' + (MPO.traz.pts.length) + ' puntos · <button type="button" class="bt chico" data-mpo="traz-fin">Terminar</button> <button type="button" class="bt sec chico" data-mpo="traz-no">Cancelar</button></div>' : '') + '</div>';
  /* el panel: capas, plano, lo elegido, la leyenda */
  h += '<aside class="mpo-panel">' + _mpoPanelHTML(N) + '</aside>';
  h += '</div>';
  /* la lámina */
  h += '<div class="mpo-pie"><button type="button" class="bt sec" data-mpo="datos">📝 Datos de la lámina</button><button type="button" class="bt sec" data-mpo="pdf" data-v="A4">📄 Ver la lámina (A4)</button>' +
    '<button type="button" class="bt sec" data-mpo="pdf" data-v="A3">📄 Ver la lámina (A3)</button>' +
    '<button type="button" class="bt sec" data-mpo="firmas">✍️ Firmas de la ' + _mpoRev(MPO.tipo, true) + ' (' + _mpoFirmasN(MPO.tipo) + '/3)</button>' +
    '<button type="button" class="bt sec" data-mpo="historial">🕘 Historial</button><button type="button" class="bt" data-mpo="publicar">✅ Publicar la ' + _mpoRev(MPO.tipo, true) + '</button>' +
    '<span class="ayuda">Publicar deja la revisión aprobada con su PDF en «Documentos» (' + esc(T.n) + ') y en su cartel QR. Lo que cambies después abre la revisión siguiente.</span></div>';
  h += '</div>';
  c.innerHTML = h;
  c.onclick = _mpoClic;
  if(MPO.vista === '3d') _mpo3DPintar();
  var b = $('mpo-busca'); if(b) b.oninput = function(){ MPO.busca = this.value; var it = $('mpo-items'); if(it) it.innerHTML = _mpoItemsHTML(); };
  _mpoLienzoOn();
  Array.prototype.forEach.call(c.querySelectorAll('[data-mpo-in]'), function(i){ i.oninput = i.onchange = _mpoInput; });
}
function _mpoTab(){ var B = MPO_BANDEJA[MPO.tipo], t = MPO.tab; return B.some(function(b){ return b.k === t; }) ? t : B[0].k; }
function _mpo3DPintar(){
  var v = $('mpo-3d'), N = _mpoNivel(); if(!v || !N) return;
  v.innerHTML = mpo3D(N, MPO.tipo, { ancho:Math.max(320, v.clientWidth || 800), alto:Math.max(360, Math.round(window.innerHeight * 0.66)), zoom:MPO.zoom3d || 1 });
  mpo3DAjustar(v);
}
function _mpoItemsHTML(){
  var tab = _mpoTab(), q = String(MPO.busca || '').toLowerCase(), L = [];
  var ok = function(n){ return !q || String(n).toLowerCase().indexOf(q) > -1; };
  if(tab === 'sen'){
    var S = MPO.senales || [], G = (MPO.tipo === 'evacuacion') ? { emer:1, fuego:1 } : null;
    S.forEach(function(s){ if((!G || G[s.g]) && ok(s.n)) L.push({ t:'sen', k:s.k, n:s.n.charAt(0) + s.n.slice(1).toLowerCase(), svg:'<svg viewBox="0 0 100 100">' + s.s + '</svg>' }); });
    if(!S.length) return '<p class="mpo-ayuda">No se pudieron cargar las señales. Revisa tu conexión.</p>';
  } else if(tab === 'zon'){
    MPO_ZON.forEach(function(z){ if(ok(z.n)) L.push({ t:'zon', k:z.k, n:z.n, svg:_mpoMiniZona(z) }); });
  } else if(tab === 'rut' || tab === 'pli'){
    MPO_LIN.forEach(function(l){ if((l.m === MPO.tipo || l.m === '*') && ok(l.n)) L.push({ t:'lin', k:l.k, n:l.n, svg:_mpoMiniLin(l) }); });
  } else {
    var gs = tab === 'est' ? { est:1, per:1, amb:1 } : (tab === 'eva' ? { eva:1, fue:1 } : (tab === 'pro' ? { pro:1 } : (tab === 'ofi' ? { ofi:1 } : { maq:1 })));
    MPO_FIG.forEach(function(f){ if(gs[f.g] && ok(f.n)) L.push({ t:'fig', k:f.k, n:f.n, svg:'<svg viewBox="0 0 100 100">' + _mpoFigSVG(f) + '</svg>' }); });
    if(tab === 'est' || tab === 'eva') MPO_ZON.forEach(function(z){ if(z.k === 'segura' && tab === 'eva' && ok(z.n)) L.push({ t:'zon', k:z.k, n:z.n, svg:_mpoMiniZona(z) }); });
  }
  if(!L.length) return '<p class="mpo-ayuda">Nada con ese nombre.</p>';
  return L.map(function(x){
    var on = MPO.pon && MPO.pon.t === x.t && MPO.pon.k === x.k;
    return '<button type="button" class="mpo-it' + (on ? ' on' : '') + '" data-mpo="pon" data-t="' + x.t + '" data-k="' + esc(x.k) + '" title="' + esc(x.n) + '"><span class="mpo-it-i">' + x.svg + '</span><span class="mpo-it-n">' + esc(x.n) + '</span></button>'; }).join('');
}
function _mpoMiniZona(z){ return '<svg viewBox="0 0 100 100"><rect x="10" y="22" width="80" height="56" rx="6" fill="' + z.c + '" fill-opacity="' + (z.rayas ? 0.2 : 0.25) + '" stroke="' + z.c + '" stroke-width="5"' + (z.borde ? ' stroke-dasharray="' + z.borde.replace(/\d+/g, function(n){ return Math.round(n / 2); }) + '"' : '') + '/></svg>'; }
function _mpoMiniLin(l){ return '<svg viewBox="0 0 100 100"><path d="M10 70L50 30L90 50" fill="none" stroke="' + l.c + '" stroke-width="' + Math.max(4, l.w) + '"' + (l.dash ? ' stroke-dasharray="' + l.dash + '"' : '') + ' stroke-linecap="round"/>' + (l.flecha ? '<path d="M78 40l14 10-16 4z" fill="' + l.c + '"/>' : '') + '</svg>'; }
function _mpoFigSVG(f){
  return (f.cuadro ? '<rect x="4" y="4" width="92" height="92" rx="14" fill="' + f.c + '"/>' : '<circle cx="50" cy="50" r="46" fill="' + f.c + '"/>') + f.d;
}
function _mpoPanelHTML(N){
  var h = '<div class="mpo-sec"><b>Capas</b>' + MPO_CAPAS.map(function(c){
    return '<div class="mpo-capa"><button type="button" class="mpo-ojo" data-mpo="vis" data-v="' + c.k + '" aria-pressed="' + !!MPO.vis[c.k] + '" title="Mostrar u ocultar">' + (MPO.vis[c.k] ? '👁️' : '🚫') + '</button>' +
      '<button type="button" class="mpo-ojo" data-mpo="lock" data-v="' + c.k + '" aria-pressed="' + !!MPO.lock[c.k] + '" title="Bloquear">' + (MPO.lock[c.k] ? '🔒' : '🔓') + '</button><span>' + c.k + ' · ' + esc(c.n) + '</span></div>'; }).join('') + '</div>';
  h += '<div class="mpo-sec"><b>Plano del nivel</b>' +
    '<button type="button" class="bt sec chico" data-mpo="plano">⬆ ' + (N.plano_url ? 'Cambiar el plano' : 'Subir el plano (PDF, PNG o JPG)') + '</button><input type="file" id="mpo-plano-f" accept="application/pdf,image/png,image/jpeg,image/webp" class="pi-oculto">' +
    (N.plano_url ? '' : '<button type="button" class="bt sec chico" data-mpo="plantilla">▭ Plantilla de terreno</button>') +
    '<label class="mpo-chk"><input type="checkbox" data-mpo-in="gris"' + (N.gris_base !== false ? ' checked' : '') + '> Atenuar el plano a gris suave</label>' +
    '<label class="mpo-lab">Opacidad del plano <input type="range" min="10" max="100" step="5" data-mpo-in="opac" value="' + Math.round((N.opacidad_base == null ? 0.4 : +N.opacidad_base) * 100) + '"></label>' +
    (MPO.tipo === 'evacuacion' ? '<label class="mpo-lab">Aforo del nivel <input type="number" min="0" data-mpo-in="aforo" value="' + (N.aforo == null ? '' : N.aforo) + '" style="width:90px"></label>' : '') + '</div>';
  var e = MPO.sel ? _mpoBuscar(MPO.sel) : null;
  if(e) h += '<div class="mpo-sec mpo-selc"><b>' + esc(_mpoNom(e)) + '</b>' +
    '<label class="mpo-lab">Texto / detalle <input type="text" maxlength="80" data-mpo-in="txt" value="' + esc(e.txt || '') + '" placeholder="' + (e.t === 'zon' ? 'Encofrado, Radio de izaje 18 m…' : 'Opcional') + '"></label>' +
    ((e.t === 'sen' || e.t === 'fig') ? '<label class="mpo-lab">Tamaño <input type="range" min="20" max="400" step="5" data-mpo-in="s" value="' + Math.round(e.s || 60) + '"></label><label class="mpo-lab">Giro <input type="range" min="-180" max="180" step="5" data-mpo-in="rot" value="' + Math.round(e.rot || 0) + '"></label>' : '') +
    ((e.t === 'fig' && (_mpoFig(e.k) || {}).radio) ? '<label class="mpo-lab">Radio de giro / línea de fuego (px del plano) <input type="number" min="0" step="10" data-mpo-in="radio" value="' + Math.round(e.radio || 0) + '" style="width:90px"></label>' : '') +
    (_mpoTieneEstado(e) ? '<div class="mpo-est">' + Object.keys(MPO_EST).map(function(k){ return '<button type="button" class="' + ((e.estado || 'pend') === k ? 'on' : '') + '" data-mpo="estado" data-v="' + k + '">' + MPO_EST[k].e + ' ' + MPO_EST[k].n + '</button>'; }).join('') + '</div>' : '') +
    '<button type="button" class="bt sec chico" data-mpo="borrar">🗑 Quitar</button>' + (_mpoEsFijo(e) ? '<p class="mpo-ayuda">Es fijo del nivel: sale en los 3 mapas.</p>' : '') + '</div>';
  h += '<div class="mpo-sec"><b>Leyenda (sola)</b>' + _mpoLeyendaHTML(N) + '</div>';
  return h;
}
function _mpoTieneEstado(e){ if(e.t === 'fig') return !!(_mpoFig(e.k) || {}).estado; if(e.t === 'lin') return !!(_mpoLin(e.k) || {}).estado; return false; }
function _mpoNom(e){
  if(e.t === 'sen'){ var s = _mpoSen(e.k); return s ? s.n.charAt(0) + s.n.slice(1).toLowerCase() : 'Señal'; }
  if(e.t === 'fig') return (_mpoFig(e.k) || {}).n || 'Figura';
  if(e.t === 'lin') return (_mpoLin(e.k) || {}).n || 'Línea';
  if(e.t === 'zon') return (_mpoZon(e.k) || {}).n || 'Zona';
  return '';
}
/* la leyenda: solo lo que se usa en este nivel, con su ícono; las protecciones, con cuántas por estado */
function mpoLeyenda(N, tipo){
  var E = ((N && N.elementos_fijos) || []).concat(_mpoCapa(tipo || MPO.tipo, N && N.id).elementos), por = {}, L = [];
  E.forEach(function(e){
    var k = e.t + ':' + e.k, x = por[k];
    if(!x){ x = por[k] = { t:e.t, k:e.k, n:_mpoNom(e), c:0, est:{}, capa:mpoCapaDe(e) }; L.push(x); }
    x.c++; if(_mpoTieneEstado(e)){ var s = e.estado || 'pend'; x.est[s] = (x.est[s] || 0) + 1; }
  });
  L.sort(function(a, b){ return b.capa - a.capa || a.n.localeCompare(b.n, 'es'); });
  return L;
}
function _mpoIcono(x, lado){
  lado = lado || 28;
  if(x.t === 'sen'){ var s = _mpoSen(x.k); return '<svg viewBox="0 0 100 100" width="' + lado + '" height="' + lado + '">' + (s ? s.s : '') + '</svg>'; }
  if(x.t === 'fig'){ var f = _mpoFig(x.k); return '<svg viewBox="0 0 100 100" width="' + lado + '" height="' + lado + '">' + (f ? _mpoFigSVG(f) : '') + '</svg>'; }
  if(x.t === 'lin'){ var l = _mpoLin(x.k); return l ? _mpoMiniLin(l).replace('<svg ', '<svg width="' + lado + '" height="' + lado + '" ') : ''; }
  var z = _mpoZon(x.k); return z ? _mpoMiniZona(z).replace('<svg ', '<svg width="' + lado + '" height="' + lado + '" ') : '';
}
function _mpoLeyendaHTML(N){
  var L = mpoLeyenda(N);
  if(!L.length) return '<p class="mpo-ayuda">Se arma sola con lo que pongas en el plano.</p>';
  return '<ul class="mpo-ley">' + L.map(function(x){
    var est = Object.keys(x.est).length ? ' <small>' + Object.keys(MPO_EST).filter(function(k){ return x.est[k]; }).map(function(k){ return MPO_EST[k].e + x.est[k]; }).join(' ') + '</small>' : (x.c > 1 ? ' <small>×' + x.c + '</small>' : '');
    return '<li>' + _mpoIcono(x, 26) + '<span>' + esc(x.n) + est + '</span></li>'; }).join('') + '</ul>';
}

/* ── el dibujo (SVG en coordenadas del plano) ─────────────────────────────────────────────────── */
function mpoSVG(op){
  op = op || {};
  var N = op.nivel || _mpoNivel(), W = _mpoW(N), H = _mpoH(N), tipo = op.tipo || MPO.tipo;
  var vb = op.editor && MPO.vb && MPO.vb.n === N.id ? MPO.vb : (op.vb || (op.sinMargen ? { x:0, y:0, w:W, h:H, n:N.id } : { x:-W * 0.03, y:-H * 0.03, w:W * 1.06, h:H * 1.06, n:N.id }));
  if(op.editor) MPO.vb = vb;
  var E = (N.elementos_fijos || []).concat(_mpoCapa(tipo, N.id).elementos), vis = op.editor ? MPO.vis : { 0:1, 1:1, 2:1, 3:1, 4:1 };
  var s = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="' + (op.editor ? 'mpo-svg' : 'mpo-svg-x') + '" viewBox="' + [vb.x, vb.y, vb.w, vb.h].map(function(v){ return Math.round(v * 10) / 10; }).join(' ') + '"' +
    (op.ancho ? ' width="' + op.ancho + '" height="' + op.alto + '"' : '') + ' preserveAspectRatio="xMidYMid meet" style="font-family:Arial,Helvetica,sans-serif">';
  s += '<defs><filter id="mpo-gris"><feColorMatrix type="saturate" values="0"/></filter>' +
    MPO_ZON.map(function(z){ return '<pattern id="mpo-ray-' + z.k + '" patternUnits="userSpaceOnUse" width="16" height="16" patternTransform="rotate(45)"><rect width="16" height="16" fill="' + z.c + '" fill-opacity="0.16"/><line x1="0" y1="0" x2="0" y2="16" stroke="' + z.c + '" stroke-width="3" stroke-opacity="0.55"/></pattern>'; }).join('') +
    '<filter id="mpo-halo" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="h"/><feMerge><feMergeNode in="h"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>';
  /* capa 0: el plano */
  if(vis[0] && (N.plano_url || op.planoDU)){
    s += '<image href="' + esc(op.planoDU || N.plano_url) + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none" opacity="' + (N.opacidad_base == null ? 0.4 : +N.opacidad_base) + '"' + (N.gris_base !== false ? ' filter="url(#mpo-gris)"' : '') + '/>';
  } else if(vis[0]) s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>';
  [1, 2, 3, 4].forEach(function(capa){
    if(!vis[capa]) return;
    s += '<g data-capa="' + capa + '">' + E.filter(function(e){ return mpoCapaDe(e) === capa && !(op.soloPiso && (e.t === 'sen' || (e.t === 'fig' && !(+e.radio > 0)))); }).map(function(e){ return _mpoElSVG(e, W, op); }).join('') + '</g>';
  });
  /* lo que se está trazando */
  if(op.editor && MPO.traz && MPO.traz.pts.length){
    var p = MPO.traz.pts;
    s += '<polyline points="' + p.map(function(q){ return q[0] + ',' + q[1]; }).join(' ') + '" fill="none" stroke="#0B2A3A" stroke-width="' + (W / 400) + '" stroke-dasharray="' + (W / 150) + ' ' + (W / 250) + '"/>' +
      p.map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (W / 250) + '" fill="#0B2A3A"/>'; }).join('');
  }
  return s + '</svg>';
}
function _mpoN(v){ return Math.round((+v || 0) * 10) / 10; }
function _mpoElSVG(e, W, op){
  var sel = op.editor && MPO.sel === e.id, d = ' data-id="' + esc(e.id) + '"', h = '', tit = '<title>' + esc(_mpoNom(e) + (e.txt ? ' · ' + e.txt : '')) + '</title>';
  if(e.t === 'zon'){
    var Z = _mpoZon(e.k) || MPO_ZON[0], st = ' fill="' + (Z.rayas ? 'url(#mpo-ray-' + Z.k + ')' : Z.c) + '"' + (Z.rayas ? '' : ' fill-opacity="0.18"') + ' stroke="' + Z.c + '" stroke-width="' + (W / (Z.rayas ? 220 : 400)) + '"' +
      (Z.borde ? ' stroke-dasharray="' + Z.borde.split(' ').map(function(v){ return _mpoN(v * W / 1000); }).join(' ') + '"' : '') + (Z.k === 'fuego' && op.editor ? ' class="mpo-pulso"' : '');
    var cx, cy;
    if(e.f === 'circ'){ h = '<circle cx="' + _mpoN(e.x) + '" cy="' + _mpoN(e.y) + '" r="' + _mpoN(e.r) + '"' + st + '/>'; cx = e.x; cy = e.y; }
    else if(e.f === 'rect'){ h = '<rect x="' + _mpoN(e.x) + '" y="' + _mpoN(e.y) + '" width="' + _mpoN(e.w) + '" height="' + _mpoN(e.h) + '"' + st + '/>'; cx = e.x + e.w / 2; cy = e.y + e.h / 2; }
    else { h = '<polygon points="' + (e.pts || []).map(function(q){ return _mpoN(q[0]) + ',' + _mpoN(q[1]); }).join(' ') + '"' + st + '/>'; var c = _mpoCentro(e.pts); cx = c[0]; cy = c[1]; }
    var et = e.txt || (Z.k === 'fuego' ? 'Línea de fuego' : '');
    if(et) h += '<text x="' + _mpoN(cx) + '" y="' + _mpoN(cy) + '" text-anchor="middle" dominant-baseline="middle" font-size="' + _mpoN(W / 55) + '" font-weight="700" fill="' + Z.c + '" stroke="#fff" stroke-width="' + _mpoN(W / 400) + '" paint-order="stroke">' + esc(et) + '</text>';
    if(sel) h += _mpoSelMarco(e, W);
    return '<g' + d + ' class="mpo-el">' + tit + h + '</g>';
  }
  if(e.t === 'lin'){
    var L = _mpoLin(e.k) || MPO_LIN[0], pts = e.pts || [], sw = L.w * W / 900, pp = pts.map(function(q){ return _mpoN(q[0]) + ',' + _mpoN(q[1]); }).join(' ');
    var col = (_mpoTieneEstado(e) && (e.estado === 'obs')) ? MPO_EST.obs.c : L.c;
    if(L.doble) h += '<polyline points="' + pp + '" fill="none" stroke="' + col + '" stroke-width="' + _mpoN(sw * 2.4) + '" stroke-linejoin="round"/><polyline points="' + pp + '" fill="none" stroke="#fff" stroke-width="' + _mpoN(sw * 0.9) + '" stroke-linejoin="round"/>';
    else h += '<polyline points="' + pp + '" fill="none" stroke="' + col + '" stroke-width="' + _mpoN(sw) + '" stroke-linecap="round" stroke-linejoin="round"' + (L.dash ? ' stroke-dasharray="' + L.dash.split(' ').map(function(v){ return _mpoN(v * sw / 4); }).join(' ') + '"' : '') + '/>';
    if(L.flecha) h += _mpoFlechas(pts, L.c, sw);
    if(L.cruz) h += _mpoCruces(pts, col, sw);
    if(_mpoTieneEstado(e) && pts.length > 1){ var m = _mpoMitad(pts); h += '<circle cx="' + _mpoN(m[0]) + '" cy="' + _mpoN(m[1]) + '" r="' + _mpoN(sw * 1.6) + '" fill="' + MPO_EST[e.estado || 'pend'].c + '" stroke="#fff" stroke-width="' + _mpoN(sw * 0.5) + '"/>'; }
    if(e.txt && pts.length > 1){ var m2 = _mpoMitad(pts); h += '<text x="' + _mpoN(m2[0]) + '" y="' + _mpoN(m2[1] - sw * 3) + '" text-anchor="middle" font-size="' + _mpoN(W / 62) + '" font-weight="700" fill="' + L.c + '" stroke="#fff" stroke-width="' + _mpoN(W / 500) + '" paint-order="stroke">' + esc(e.txt) + '</text>'; }
    if(op.editor) h += '<polyline points="' + pp + '" fill="none" stroke="transparent" stroke-width="' + _mpoN(Math.max(sw * 3, W / 120)) + '"/>';
    if(sel) h += pts.map(function(q){ return '<circle cx="' + _mpoN(q[0]) + '" cy="' + _mpoN(q[1]) + '" r="' + _mpoN(W / 220) + '" fill="#fff" stroke="#F5B700" stroke-width="' + _mpoN(W / 600) + '"/>'; }).join('');
    return '<g' + d + ' class="mpo-el">' + tit + h + '</g>';
  }
  /* señal o figura: centrada en (x, y), de lado s */
  var sz = +e.s || 60, x0 = e.x - sz / 2, y0 = e.y - sz / 2, inner = '';
  if(e.t === 'sen'){ var S = _mpoSen(e.k); inner = S ? S.s : '<rect width="100" height="100" fill="#ccc"/>'; }
  else { var F = _mpoFig(e.k); inner = F ? _mpoFigSVG(F) : ''; }
  if(op.soloPiso){ return +e.radio > 0 ? '<g' + d + '><circle cx="' + _mpoN(e.x) + '" cy="' + _mpoN(e.y) + '" r="' + _mpoN(e.radio) + '" fill="url(#mpo-ray-fuego)" stroke="#DC2626" stroke-width="' + _mpoN(W / 300) + '" stroke-dasharray="' + _mpoN(W / 90) + ' ' + _mpoN(W / 150) + '"/></g>' : ''; }
  if(e.t === 'fig' && +e.radio > 0) h += '<circle cx="' + _mpoN(e.x) + '" cy="' + _mpoN(e.y) + '" r="' + _mpoN(e.radio) + '" fill="url(#mpo-ray-fuego)" stroke="#DC2626" stroke-width="' + _mpoN(W / 300) + '" stroke-dasharray="' + _mpoN(W / 90) + ' ' + _mpoN(W / 150) + '"/>';
  h += '<g transform="translate(' + _mpoN(x0) + ' ' + _mpoN(y0) + ') rotate(' + _mpoN(e.rot || 0) + ' ' + _mpoN(sz / 2) + ' ' + _mpoN(sz / 2) + ') scale(' + _mpoN(sz / 100 * 1000) / 1000 + ')"' + (mpoCapaDe(e) === 4 ? ' filter="url(#mpo-halo)"' : '') + '>' + inner + '</g>';
  if(_mpoTieneEstado(e)) h += '<circle cx="' + _mpoN(e.x + sz * 0.42) + '" cy="' + _mpoN(e.y - sz * 0.42) + '" r="' + _mpoN(sz * 0.14) + '" fill="' + MPO_EST[e.estado || 'pend'].c + '" stroke="#fff" stroke-width="' + _mpoN(sz * 0.04) + '"/>';
  var et2 = e.txt || (_mpoFig(e.k) || {}).etiqueta;
  if(et2) h += '<text x="' + _mpoN(e.x) + '" y="' + _mpoN(e.y + sz / 2 + W / 80) + '" text-anchor="middle" font-size="' + _mpoN(W / 62) + '" font-weight="700" fill="#0B2A3A" stroke="#fff" stroke-width="' + _mpoN(W / 500) + '" paint-order="stroke">' + esc(et2) + '</text>';
  if(sel) h += '<rect x="' + _mpoN(x0 - 4) + '" y="' + _mpoN(y0 - 4) + '" width="' + _mpoN(sz + 8) + '" height="' + _mpoN(sz + 8) + '" fill="none" stroke="#F5B700" stroke-width="' + _mpoN(W / 500) + '" stroke-dasharray="' + _mpoN(W / 200) + '"/>';
  return '<g' + d + ' class="mpo-el">' + tit + h + '</g>';
}
function _mpoSelMarco(e, W){ var b = _mpoCaja(e); return '<rect x="' + _mpoN(b[0]) + '" y="' + _mpoN(b[1]) + '" width="' + _mpoN(b[2] - b[0]) + '" height="' + _mpoN(b[3] - b[1]) + '" fill="none" stroke="#F5B700" stroke-width="' + _mpoN(W / 500) + '" stroke-dasharray="' + _mpoN(W / 200) + '"/>'; }
function _mpoCaja(e){
  if(e.f === 'circ') return [e.x - e.r, e.y - e.r, e.x + e.r, e.y + e.r];
  if(e.f === 'rect') return [e.x, e.y, e.x + e.w, e.y + e.h];
  var P = e.pts || [[0, 0]], a = [1e9, 1e9, -1e9, -1e9];
  P.forEach(function(q){ a[0] = Math.min(a[0], q[0]); a[1] = Math.min(a[1], q[1]); a[2] = Math.max(a[2], q[0]); a[3] = Math.max(a[3], q[1]); });
  return a;
}
function _mpoCentro(P){ var x = 0, y = 0; (P || []).forEach(function(q){ x += q[0]; y += q[1]; }); var n = (P || []).length || 1; return [x / n, y / n]; }
function _mpoLargo(P){ var l = 0; for(var i = 1; i < P.length; i++) l += Math.sqrt(Math.pow(P[i][0] - P[i - 1][0], 2) + Math.pow(P[i][1] - P[i - 1][1], 2)); return l; }
function _mpoEnTramo(P, d){
  for(var i = 1; i < P.length; i++){
    var dx = P[i][0] - P[i - 1][0], dy = P[i][1] - P[i - 1][1], l = Math.sqrt(dx * dx + dy * dy);
    if(d <= l) return [P[i - 1][0] + dx * d / (l || 1), P[i - 1][1] + dy * d / (l || 1), Math.atan2(dy, dx)];
    d -= l;
  }
  var u = P[P.length - 1], v = P[P.length - 2] || u; return [u[0], u[1], Math.atan2(u[1] - v[1], u[0] - v[0])];
}
function _mpoMitad(P){ return _mpoEnTramo(P, _mpoLargo(P) / 2); }
/* las flechas de la ruta: cada tramo y siempre la del final */
function _mpoFlechas(P, c, sw){
  if(P.length < 2) return '';
  var L = _mpoLargo(P), paso = Math.max(sw * 18, 60), h = '', a = sw * 3.2;
  var fl = function(q){ var x = q[0], y = q[1], t = q[2], c1 = Math.cos(t), s1 = Math.sin(t);
    return '<path d="M' + _mpoN(x + c1 * a) + ' ' + _mpoN(y + s1 * a) + 'L' + _mpoN(x - c1 * a - s1 * a * 0.8) + ' ' + _mpoN(y - s1 * a + c1 * a * 0.8) + 'L' + _mpoN(x - c1 * a + s1 * a * 0.8) + ' ' + _mpoN(y - s1 * a - c1 * a * 0.8) + 'Z" fill="' + c + '" stroke="#fff" stroke-width="' + _mpoN(sw * 0.3) + '"/>'; };
  for(var d = paso; d < L - paso * 0.4; d += paso) h += fl(_mpoEnTramo(P, d));
  return h + fl(_mpoEnTramo(P, L));
}
function _mpoCruces(P, c, sw){
  var L = _mpoLargo(P), paso = Math.max(sw * 12, 40), h = '', a = sw * 1.4;
  for(var d = paso / 2; d < L; d += paso){ var q = _mpoEnTramo(P, d); h += '<path d="M' + _mpoN(q[0] - a) + ' ' + _mpoN(q[1] - a) + 'L' + _mpoN(q[0] + a) + ' ' + _mpoN(q[1] + a) + 'M' + _mpoN(q[0] + a) + ' ' + _mpoN(q[1] - a) + 'L' + _mpoN(q[0] - a) + ' ' + _mpoN(q[1] + a) + '" stroke="' + c + '" stroke-width="' + _mpoN(sw * 0.6) + '"/>'; }
  return h;
}

/* ── la vista 3D isométrica (etapa 2): el plano inclinado como una maqueta, con su losa; las figuras y las señales,
   paradas sobre el piso con su sombra. Sin WebGL: CSS 3D. Lo usan la web y la app (MAPAS-OBRA). ── */
function mpo3D(N, tipo, op){
  op = op || {};
  var W = _mpoW(N), H = _mpoH(N), cw = op.ancho || 900, ch = op.alto || 560;
  var E = (N.elementos_fijos || []).concat(_mpoCapa(tipo, N.id).elementos);
  var k = Math.min(cw / (W * 0.79 + H * 0.62), ch / ((W * 0.62 + H * 0.79) * 0.56 + W * 0.05));
  var piso = mpoSVG({ nivel:N, tipo:tipo, soloPiso:true, sinMargen:true, ancho:'100%', alto:'100%' });
  var h = '<div class="mpo3d" data-zoom="' + (op.zoom || 1) + '" style="height:' + ch + 'px"><div class="mpo3d-cam" style="transform:scale(' + (Math.round(k * 10000) / 10000) + ')">' +
    '<div class="mpo3d-esc" style="width:' + W + 'px;height:' + H + 'px"><div class="mpo3d-piso">' + piso + '</div>';
  E.forEach(function(e){
    if(e.t !== 'fig' && e.t !== 'sen') return;
    var sz = Math.max(30, (+e.s || 60) * 1.5), inner = '';
    if(e.t === 'sen'){ var S = _mpoSen(e.k); inner = S ? S.s : ''; } else { var F = _mpoFig(e.k); inner = F ? _mpoFigSVG(F) : ''; }
    var et = e.txt || (_mpoFig(e.k) || {}).etiqueta || '', est = _mpoTieneEstado(e) ? MPO_EST[e.estado || 'pend'] : null;
    h += '<div class="mpo3d-p" style="left:' + Math.round(e.x) + 'px;top:' + Math.round(e.y) + 'px"><i class="mpo3d-sombra" style="left:' + Math.round(-sz * 0.55) + 'px;top:' + Math.round(-sz * 0.3) + 'px;width:' + Math.round(sz * 1.1) + 'px;height:' + Math.round(sz * 0.6) + 'px"></i>' +
      '<div class="mpo3d-s" data-mpo-info="' + esc(e.id) + '" title="' + esc(_mpoNom(e) + (et ? ' · ' + et : '') + (est ? ' · ' + est.n : '')) + '" style="left:' + Math.round(-sz / 2) + 'px;width:' + Math.round(sz) + 'px;height:' + Math.round(sz) + 'px">' +
      '<svg viewBox="0 0 100 100" width="100%" height="100%">' + inner + '</svg>' + (et ? '<b style="font-size:' + Math.round(Math.max(10, sz * 0.22)) + 'px">' + esc(et) + '</b>' : '') +
      (est ? '<i class="mpo3d-est" style="background:' + est.c + '"></i>' : '') + '</div></div>';
  });
  h += '</div></div></div>';
  _mpo3DEstilos();
  return h;
}
/* después de ponerlo en la página: mide lo que ocupa el piso ya inclinado y lo centra a la medida de su caja */
function mpo3DAjustar(caja){
  var R = caja && caja.querySelector('.mpo3d'), cam = R && R.querySelector('.mpo3d-cam'), piso = R && R.querySelector('.mpo3d-piso'); if(!cam || !piso) return;
  var z = +R.getAttribute('data-zoom') || 1, k = 1, dx = 0, dy = 0;
  for(var i = 0; i < 2; i++){
    cam.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')';
    var a = R.getBoundingClientRect(), b = piso.getBoundingClientRect(); if(!b.width || !b.height) return;
    var f = Math.min(a.width * 0.9 / b.width, a.height * 0.86 / b.height);
    k = k * f; dx = dx * f + (a.left + a.width / 2 - (b.left + b.width / 2)) * f; dy = dy * f + (a.top + a.height / 2 - (b.top + b.height / 2)) * f;
  }
  cam.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + (k * z) + ')';
}
/* la tarjeta de un elemento (al tocarlo en 2D o 3D): qué es, su detalle y su estado */
function mpoInfoHTML(e){
  if(!e) return '';
  var est = _mpoTieneEstado(e) ? MPO_EST[e.estado || 'pend'] : null, Z = e.t === 'zon' ? _mpoZon(e.k) : null;
  return '<div class="mpo-info"><b>' + esc(_mpoNom(e)) + '</b>' + (e.txt ? '<span>' + esc(e.txt) + '</span>' : '') +
    (Z && Z.k === 'fuego' ? '<span>Prohibido el tránsito peatonal dentro de la zona.</span>' : '') +
    (+e.radio > 0 ? '<span>Radio de giro / línea de fuego: ' + Math.round(e.radio) + ' (escala del plano)</span>' : '') +
    (est ? '<span>' + est.e + ' ' + est.n + '</span>' : '') + '</div>';
}
function _mpo3DEstilos(){
  if(document.getElementById('mpo3d-css')) return;
  var st = document.createElement('style'); st.id = 'mpo3d-css';
  st.textContent = '.mpo3d{position:relative;overflow:hidden;perspective:2600px;perspective-origin:50% 30%;background:linear-gradient(#F1F5F9,#E2E8F0);border-radius:12px}' +
    '.mpo3d-cam{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d;transform-origin:0 0}' +
    '.mpo3d-esc{position:absolute;left:0;top:0;transform-style:preserve-3d;transform:translate(-50%,-50%) rotateX(56deg) rotateZ(-38deg)}' +
    '.mpo3d-piso{position:absolute;left:0;top:0;width:100%;height:100%;background:#fff;box-shadow:0 0 0 3px #94A3B8,14px 14px 0 #CBD5E1,26px 26px 0 #94A3B8,32px 32px 40px rgba(15,23,42,.25)}' +
    '.mpo3d-piso svg{width:100%;height:100%;display:block}' +
    '.mpo3d-p{position:absolute;width:0;height:0;transform-style:preserve-3d}' +
    '.mpo3d-sombra{position:absolute;border-radius:50%;background:radial-gradient(ellipse at center,rgba(15,23,42,.35),rgba(15,23,42,0) 70%)}' +
    '.mpo3d-s{position:absolute;bottom:0;transform-origin:50% 100%;transform:rotateZ(38deg) rotateX(-90deg);cursor:pointer;filter:drop-shadow(0 0 2px #fff)}' +
    '.mpo3d-s svg{display:block}.mpo3d-s b{position:absolute;left:50%;top:100%;transform:translateX(-50%);white-space:nowrap;color:#0B2A3A;font-family:Arial,sans-serif;text-shadow:0 0 3px #fff,0 0 3px #fff}' +
    '.mpo3d-est{position:absolute;right:-6%;top:-6%;width:26%;height:26%;border-radius:50%;border:3px solid #fff}' +
    '.mpo-info{display:flex;flex-direction:column;gap:2px;background:#fff;border:1px solid #CBD5E1;border-radius:10px;padding:8px 12px;font-size:13px;box-shadow:0 6px 18px rgba(15,23,42,.12);max-width:280px}' +
    '.mpo-info b{color:#0B2A3A}.mpo-info span{color:#3C4A54}' +
    '.mpo-torre{display:flex;flex-direction:column-reverse;justify-content:flex-end;gap:4px}.mpo-torre button{border:1px solid #CBD5E1;background:#fff;border-radius:8px;padding:6px 10px;font:inherit;font-size:12.5px;cursor:pointer;text-align:left;color:#08222F}' +
    '.mpo-torre button.on{background:#0B2A3A;color:#fff;border-color:#0B2A3A}';
  document.head.appendChild(st);
}

/* ── tocar el plano ──────────────────────────────────────────────────────────────────────────── */
function _mpoPunto(ev){
  var svg = $('mpo-svg'); if(!svg) return [0, 0];
  var r = svg.getBoundingClientRect(), vb = MPO.vb, k = Math.max(vb.w / r.width, vb.h / r.height);
  var ox = (r.width - vb.w / k) / 2, oy = (r.height - vb.h / k) / 2;
  return [vb.x + (ev.clientX - r.left - ox) * k, vb.y + (ev.clientY - r.top - oy) * k];
}
function _mpoRepintarLienzo(){ var l = $('mpo-lienzo'); if(l){ l.innerHTML = mpoSVG({ editor:true }); _mpoLienzoOn(); } }
function _mpoLienzoOn(){
  var svg = $('mpo-svg'); if(!svg) return;
  svg.onpointerdown = function(ev){
    var p = _mpoPunto(ev), g = ev.target.closest ? ev.target.closest('[data-id]') : null, N = _mpoNivel(), W = _mpoW(N);
    if(MPO.pon){ _mpoPoner(p); return; }
    if(MPO.herr === 'lin' || MPO.herr === 'pol'){
      if(!MPO.traz) MPO.traz = { tipo:MPO.herr, pts:[] };
      MPO.traz.pts.push([Math.round(p[0]), Math.round(p[1])]); _mpoRepintarLienzo(); mpoPintarTraz(); return;
    }
    if(MPO.herr === 'rect' || MPO.herr === 'circ'){ MPO.arr = { modo:MPO.herr, p0:p, p1:p }; svg.setPointerCapture && svg.setPointerCapture(ev.pointerId); return; }
    if(g){
      var e = _mpoBuscar(g.getAttribute('data-id'));
      if(e && !MPO.lock[mpoCapaDe(e)]){ MPO.sel = e.id; MPO.arr = { modo:'mover', e:e, p0:p, orig:JSON.parse(JSON.stringify(e)) }; svg.setPointerCapture && svg.setPointerCapture(ev.pointerId); _mpoRepintarLienzo(); _mpoPanel(); return; }
    }
    MPO.sel = null; MPO.arr = { modo:'pan', c0:[ev.clientX, ev.clientY], vb0:{ x:MPO.vb.x, y:MPO.vb.y } }; _mpoPanel(); _mpoRepintarLienzo(); svg = $('mpo-svg');
    svg.setPointerCapture && svg.setPointerCapture(ev.pointerId);
  };
  svg.onpointermove = function(ev){
    if(!MPO.arr) return;
    if(MPO.arr.modo === 'pan'){
      var r = svg.getBoundingClientRect(), k = Math.max(MPO.vb.w / r.width, MPO.vb.h / r.height);
      MPO.vb.x = MPO.arr.vb0.x - (ev.clientX - MPO.arr.c0[0]) * k; MPO.vb.y = MPO.arr.vb0.y - (ev.clientY - MPO.arr.c0[1]) * k;
      svg.setAttribute('viewBox', [MPO.vb.x, MPO.vb.y, MPO.vb.w, MPO.vb.h].join(' ')); return;
    }
    var p = _mpoPunto(ev);
    if(MPO.arr.modo === 'mover'){
      var dx = p[0] - MPO.arr.p0[0], dy = p[1] - MPO.arr.p0[1], e = MPO.arr.e, o = MPO.arr.orig;
      if(e.pts) e.pts = o.pts.map(function(q){ return [Math.round(q[0] + dx), Math.round(q[1] + dy)]; });
      else { e.x = Math.round(o.x + dx); e.y = Math.round(o.y + dy); }
      MPO.arr.movio = true; _mpoRepintarLienzo(); svg = $('mpo-svg'); return;
    }
    MPO.arr.p1 = p;
    var l = $('mpo-lienzo'), tmp = _mpoZonaDe(MPO.arr, true);
    if(tmp){ var N = _mpoNivel(); N._tmp = tmp; }
    _mpoDibujarTmp(tmp);
  };
  svg.onpointerup = function(){
    if(!MPO.arr) return;
    var a = MPO.arr; MPO.arr = null;
    if(a.modo === 'mover' && a.movio) _mpoCambio(a.e);
    if(a.modo === 'rect' || a.modo === 'circ'){
      var z = _mpoZonaDe(a, false);
      if(z){ _mpoAgregar(z); }
      _mpoRepintarLienzo();
    }
  };
  svg.ondblclick = function(){ if(MPO.traz) mpoTrazFin(); };
  svg.onwheel = function(ev){ ev.preventDefault(); _mpoZoom(ev.deltaY < 0 ? 1.15 : 0.87, _mpoPunto(ev)); };
}
function _mpoDibujarTmp(z){
  var svg = $('mpo-svg'); if(!svg) return;
  var t = svg.querySelector('#mpo-tmp'); if(t) t.parentNode.removeChild(t);
  if(!z) return;
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.id = 'mpo-tmp';
  g.innerHTML = _mpoElSVG(z, _mpoW(_mpoNivel()), {}).replace(/^<g[^>]*>|<\/g>$/g, '');
  svg.appendChild(g);
}
/* el rectángulo o el círculo que se arrastró, como zona (la de la pestaña: línea de fuego por defecto) */
function _mpoZonaDe(a, tmp){
  var x0 = a.p0[0], y0 = a.p0[1], x1 = a.p1[0], y1 = a.p1[1], k = (MPO.zonaK || 'fuego');
  if(a.modo === 'rect'){ var w = Math.abs(x1 - x0), h = Math.abs(y1 - y0); if(!tmp && (w < 8 || h < 8)) return null;
    return { id:'tmp', t:'zon', k:k, f:'rect', x:Math.round(Math.min(x0, x1)), y:Math.round(Math.min(y0, y1)), w:Math.round(w), h:Math.round(h) }; }
  var r = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)); if(!tmp && r < 8) return null;
  return { id:'tmp', t:'zon', k:k, f:'circ', x:Math.round(x0), y:Math.round(y0), r:Math.round(r) };
}
function _mpoZoom(f, centro){
  var vb = MPO.vb; if(!vb) return;
  var c = centro || [vb.x + vb.w / 2, vb.y + vb.h / 2], nw = vb.w / f, nh = vb.h / f;
  vb.x = c[0] - (c[0] - vb.x) / f; vb.y = c[1] - (c[1] - vb.y) / f; vb.w = nw; vb.h = nh;
  var svg = $('mpo-svg'); if(svg) svg.setAttribute('viewBox', [vb.x, vb.y, vb.w, vb.h].join(' '));
}
function mpoPintarTraz(){
  var c = document.querySelector('.mpo-lienzo-c'); if(!c) return;
  var t = c.querySelector('.mpo-traz');
  var h = MPO.traz ? MPO.traz.pts.length + ' puntos · <button type="button" class="bt chico" data-mpo="traz-fin">Terminar</button> <button type="button" class="bt sec chico" data-mpo="traz-no">Cancelar</button>' : '';
  if(!MPO.traz){ if(t) t.parentNode.removeChild(t); return; }
  if(!t){ t = document.createElement('div'); t.className = 'mpo-traz'; c.appendChild(t); }
  t.innerHTML = h;
}
function mpoTrazFin(){
  var T = MPO.traz; MPO.traz = null;
  if(T && T.tipo === 'lin' && T.pts.length >= 2) _mpoAgregar({ t:'lin', k:MPO.linK || (MPO.tipo === 'evacuacion' ? 'ruta' : (MPO.tipo === 'protecciones' ? 'baranda' : 'limite')), pts:T.pts, estado:'pend' });
  else if(T && T.tipo === 'pol' && T.pts.length >= 3) _mpoAgregar({ t:'zon', k:MPO.zonaK || 'fuego', f:'pol', pts:T.pts });
  else if(T) toast(T.tipo === 'pol' ? 'Un polígono necesita 3 toques o más.' : 'Una línea necesita 2 toques o más.');
  mpoPintar();
}
function _mpoPoner(p){
  var P = MPO.pon, N = _mpoNivel(), W = _mpoW(N), e;
  if(P.t === 'lin'){ MPO.linK = P.k; MPO.herr = 'lin'; MPO.pon = null; MPO.traz = { tipo:'lin', pts:[[Math.round(p[0]), Math.round(p[1])]] }; mpoPintar(); return; }
  if(P.t === 'zon'){ MPO.zonaK = P.k; MPO.herr = 'pol'; MPO.pon = null; MPO.traz = { tipo:'pol', pts:[[Math.round(p[0]), Math.round(p[1])]] }; mpoPintar(); return; }
  e = { t:P.t, k:P.k, x:Math.round(p[0]), y:Math.round(p[1]), s:Math.round(W * (P.t === 'sen' ? 0.035 : 0.04)), rot:0 };
  var F = P.t === 'fig' ? _mpoFig(P.k) : null;
  if(F && F.estado) e.estado = 'pend';
  if(F && F.k === 'punto-reunion'){ var n = _mpoElems().filter(function(x){ return x.k === 'punto-reunion'; }).length; e.txt = 'PR-' + (n + 1); }
  _mpoAgregar(e);
}
function _mpoAgregar(e){
  e.id = _mpoId();
  var N = _mpoNivel();
  if(MPO.lock[mpoCapaDe(e)]){ toast('Esa capa está bloqueada: ábrele el candado para agregar.'); return; }
  if(_mpoEsFijo(e)){ N.elementos_fijos.push(e); _mpoSucio('n:' + N.id); }
  else { _mpoCapa().elementos.push(e); _mpoSucio('c:' + _mpoClave(MPO.tipo, MPO.nivel)); }
  MPO.sel = e.id;
  if(MPO.pon && !MPO.pon.varios) MPO.pon = null;
  mpoPintar();
}
function _mpoCambio(e){ var N = _mpoNivel(); if(_mpoEsFijo(e)) _mpoSucio('n:' + N.id); else _mpoSucio('c:' + _mpoClave(MPO.tipo, MPO.nivel)); }
function _mpoPanel(){ var p = document.querySelector('.mpo-panel'); var N = _mpoNivel(); if(p && N){ p.innerHTML = _mpoPanelHTML(N); Array.prototype.forEach.call(p.querySelectorAll('[data-mpo-in]'), function(i){ i.oninput = i.onchange = _mpoInput; }); } }
function _mpoInput(){
  var k = this.getAttribute('data-mpo-in'), N = _mpoNivel(), v = this.type === 'checkbox' ? this.checked : this.value;
  if(k === 'gris'){ N.gris_base = !!v; _mpoSucio('n:' + N.id); _mpoRepintarLienzo(); return; }
  if(k === 'opac'){ N.opacidad_base = Math.max(0.1, Math.min(1, (+v || 40) / 100)); _mpoSucio('n:' + N.id); _mpoRepintarLienzo(); return; }
  if(k === 'aforo'){ N.aforo = v === '' ? null : Math.max(0, Math.round(+v || 0)); _mpoSucio('n:' + N.id); return; }
  var e = MPO.sel ? _mpoBuscar(MPO.sel) : null; if(!e) return;
  if(k === 'txt') e.txt = String(v).slice(0, 80);
  else if(k === 's') e.s = Math.max(10, +v || 60);
  else if(k === 'rot') e.rot = +v || 0;
  else if(k === 'radio') e.radio = Math.max(0, +v || 0);
  _mpoCambio(e); _mpoRepintarLienzo();
  if(this.type !== 'range' && this.type !== 'text'){ var p = document.querySelector('.mpo-ley'); if(p) _mpoPanel(); }
}
function _mpoClic(ev){
  var inf = ev.target.closest ? ev.target.closest('[data-mpo-info]') : null;
  if(inf){ var ic = $('mpo-info-c'); if(ic) ic.innerHTML = mpoInfoHTML(_mpoBuscar(inf.getAttribute('data-mpo-info'))); return; }
  var b = ev.target.closest ? ev.target.closest('[data-mpo]') : null; if(!b || !MPO.caja.contains(b)) return;
  var a = b.getAttribute('data-mpo'), v = b.getAttribute('data-v'), N = _mpoNivel();
  if(a === 'tipo'){ if(MPO.traz) MPO.traz = null; MPO.tipo = v; MPO.tab = ''; MPO.pon = null; MPO.sel = null; mpoPintar(); return; }
  if(a === 'nivel'){ MPO.nivel = v; MPO.sel = null; MPO.traz = null; MPO.vb = null; mpoPintar(); return; }
  if(a === 'nivel-nuevo'){ mpoNivelNuevo(); return; }
  if(a === 'nivel-dup'){ mpoNivelDuplicar(); return; }
  if(a === 'nivel-ren'){ preguntar('Nombre del nivel', 'Por ejemplo «Sótano 1» o «Pisos típicos: Piso 2 al 14».', { etiqueta:'Nombre', maximo:60, valor:N.nombre, minimo:1 }).then(function(t){ t = String(t || '').trim(); if(!t) return; N.nombre = t.slice(0, 60); _mpoSucio('n:' + N.id); mpoGuardar(); mpoPintar(); }); return; }
  if(a === 'nivel-sube' || a === 'nivel-baja'){ mpoNivelMover(a === 'nivel-sube' ? -1 : 1); return; }
  if(a === 'nivel-quita'){ confirmar('¿Quitar «' + N.nombre + '»?', 'Deja de salir en los mapas. Las láminas ya publicadas siguen en Documentos.', { si:'Sí, quitar', mal:true }).then(function(si){ if(!si) return;
    sbRpc('sst_mapa_nivel_quitar', { p_emp:YO.obra.id, p_id:N.id }).then(function(j){ if(!j || !j.ok) throw 0; MPO.niveles = MPO.niveles.filter(function(x){ return x.id !== N.id; }); MPO.nivel = MPO.niveles.length ? MPO.niveles[0].id : ''; mpoPintar(); }).catch(function(){ toast('No se pudo quitar: revisa tu conexión.'); }); }); return; }
  if(a === 'herr'){ MPO.herr = v; MPO.pon = null; if(MPO.traz && MPO.traz.tipo !== v) MPO.traz = null; mpoPintar(); return; }
  if(a === 'vista'){ MPO.vista = v; MPO.pon = null; MPO.traz = null; mpoPintar(); return; }
  if(a === 'zoom'){ if(MPO.vista === '3d'){ MPO.zoom3d = Math.max(0.5, Math.min(4, (MPO.zoom3d || 1) * +v)); _mpo3DPintar(); return; } _mpoZoom(+v); return; }
  if(a === 'firmas'){ mpoFirmas(); return; }
  if(a === 'historial'){ mpoHistorial(); return; }
  if(a === 'ajustar'){ if(MPO.vista === '3d'){ MPO.zoom3d = 1; _mpo3DPintar(); return; } MPO.vb = null; _mpoRepintarLienzo(); return; }
  if(a === 'tab'){ MPO.tab = v; mpoPintar(); return; }
  if(a === 'pon'){
    var t = b.getAttribute('data-t'), k = b.getAttribute('data-k');
    if(t === 'zon'){ MPO.zonaK = k; if(MPO.herr === 'sel') MPO.herr = 'pol'; MPO.pon = null; toast('Ahora: ' + (_mpoZon(k) || {}).n + '. Dibuja con «Polígono», «Rectángulo» o «Círculo».'); mpoPintar(); return; }
    if(t === 'lin'){ MPO.linK = k; MPO.herr = 'lin'; MPO.pon = null; MPO.traz = null; toast('Toca el plano punto por punto; doble clic o «Terminar» para cerrar la línea.'); mpoPintar(); return; }
    MPO.pon = { t:t, k:k, n:_mpoNom({ t:t, k:k }) }; mpoPintar(); return;
  }
  if(a === 'pon-no'){ MPO.pon = null; mpoPintar(); return; }
  if(a === 'traz-fin'){ mpoTrazFin(); return; }
  if(a === 'traz-no'){ MPO.traz = null; mpoPintar(); return; }
  if(a === 'vis'){ MPO.vis[v] = !MPO.vis[v]; mpoPintar(); return; }
  if(a === 'lock'){ MPO.lock[v] = !MPO.lock[v]; mpoPintar(); return; }
  if(a === 'estado'){ var e = _mpoBuscar(MPO.sel); if(e){ e.estado = v; _mpoCambio(e); mpoPintar(); } return; }
  if(a === 'borrar'){ mpoBorrar(); return; }
  if(a === 'plano'){ var f = $('mpo-plano-f'); if(f){ f.onchange = function(){ var x = this.files && this.files[0]; this.value = ''; if(x) mpoPlanoSubir(x); }; f.click(); } return; }
  if(a === 'plantilla'){ mpoPlantilla(); return; }
  if(a === 'datos'){ mpoDatos(); return; }
  if(a === 'pdf'){ mpoLamina(v, false); return; }
  if(a === 'publicar'){ mpoPublicar(); return; }
}
function mpoBorrar(){
  var id = MPO.sel, N = _mpoNivel(); if(!id) return;
  var antes = N.elementos_fijos.length;
  N.elementos_fijos = N.elementos_fijos.filter(function(e){ return e.id !== id; });
  if(N.elementos_fijos.length !== antes) _mpoSucio('n:' + N.id);
  else { var C = _mpoCapa(); C.elementos = C.elementos.filter(function(e){ return e.id !== id; }); _mpoSucio('c:' + _mpoClave(MPO.tipo, MPO.nivel)); }
  MPO.sel = null; mpoPintar();
}
document.addEventListener('keydown', function(ev){
  if(!MPO.caja || !document.body.contains(MPO.caja) || !$('mpo-svg')) return;
  var t = ev.target && ev.target.tagName; if(t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
  if((ev.key === 'Delete' || ev.key === 'Backspace') && MPO.sel){ ev.preventDefault(); mpoBorrar(); }
  else if(ev.key === 'Escape'){ MPO.pon = null; MPO.traz = null; MPO.sel = null; mpoPintar(); }
  else if(ev.key === 'Enter' && MPO.traz){ mpoTrazFin(); }
});

/* ── los niveles ─────────────────────────────────────────────────────────────────────────────── */
function mpoNivelNuevo(){
  preguntar('Nuevo nivel', '«Exteriores / Cerco», «Sótano 1», «Piso 1» o un rango: «Pisos típicos: Piso 2 al 14».', { etiqueta:'Nombre', maximo:60, valor:MPO.niveles.length ? '' : 'Exteriores / Cerco', minimo:1, corto:'Escribe el nombre del nivel.' }).then(function(t){
    t = String(t || '').trim(); if(!t) return;
    sbRpc('sst_mapa_nivel_guardar', { p_emp:YO.obra.id, p:{ nombre:t.slice(0, 60), opacidad_base:0.4, gris_base:true, elementos_fijos:[] } }).then(function(j){
      if(!j || !j.ok) throw 0;
      MPO.niveles.push({ id:j.id, nombre:t.slice(0, 60), orden:MPO.niveles.length, opacidad_base:0.4, gris_base:true, elementos_fijos:[] });
      MPO.nivel = j.id; MPO.vb = null; mpoPintar();
    }).catch(function(){ toast('No se pudo crear el nivel: revisa tu conexión.'); });
  });
}
function mpoNivelDuplicar(){
  var N = _mpoNivel(); if(!N) return;
  preguntar('Duplicar «' + N.nombre + '»', 'Se copia el plano, lo fijo (oficinas, escaleras, accesos) y lo de los 3 mapas. Después solo mueves lo que cambia en el nuevo piso.', { etiqueta:'Nombre del nuevo nivel (vacío: «… (copia)»)', maximo:60, valor:'' }).then(function(t){
    if(t === null || t === undefined || t === false) return;
    mpoGuardar().then(function(){ return sbRpc('sst_mapa_nivel_duplicar', { p_emp:YO.obra.id, p_id:N.id, p_nombre:String(t || '').trim().slice(0, 60) }); }).then(function(j){
      if(!j || !j.ok) throw 0;
      MPO.nivel = j.id; MPO.vb = null; return mpoTraer();
    }).then(function(){ mpoPintar(); toast('Nivel duplicado.'); }).catch(function(){ toast('No se pudo duplicar: revisa tu conexión.'); });
  });
}
function mpoNivelMover(d){
  var i = -1; MPO.niveles.forEach(function(n, j){ if(n.id === MPO.nivel) i = j; });
  var k = i + d; if(i < 0 || k < 0 || k >= MPO.niveles.length) return;
  var t = MPO.niveles[i]; MPO.niveles[i] = MPO.niveles[k]; MPO.niveles[k] = t;
  MPO.niveles.forEach(function(n, j){ if(n.orden !== j){ n.orden = j; MPO.sucio['n:' + n.id] = 1; } });
  mpoGuardar(); mpoPintar();
}
/* el plano: un PDF se pasa a imagen (su primera hoja); una foto, tal cual (hasta 3000 px) */
function mpoPlanoSubir(f){
  var N = _mpoNivel(); if(!N) return;
  if(f.size > 25 * 1024 * 1024){ toast('Pesa más de 25 MB: prueba con una exportación más liviana del plano.'); return; }
  _mpoEstado('Preparando el plano…');
  var aImagen = /pdf$/i.test(f.type || '') || /\.pdf$/i.test(f.name || '') ? _mpoPdfAPng(f) : _mpoImgAPng(f);
  aImagen.then(function(r){
    _mpoEstado('Subiendo el plano…');
    var arch; try{ arch = new File([r.blob], 'plano-' + (N.nombre || 'nivel').replace(/[^\w-]+/g, '-').slice(0, 40) + '.png', { type:'image/png' }); }catch(_e){ arch = r.blob; arch.name = 'plano.png'; }
    return subirArchivoP('docs', arch).then(function(url){
      N.plano_url = url; N.plano_ancho = r.w; N.plano_alto = r.h; MPO.vb = null; _mpoSucio('n:' + N.id); mpoGuardar(); mpoPintar(); toast('Plano listo: se ve atenuado para que lo tuyo resalte.');
    });
  }).catch(function(){ _mpoEstado(''); toast('No se pudo usar ese archivo como plano.'); });
}
function _mpoImgAPng(f){
  return new Promise(function(res, rej){
    var u = URL.createObjectURL(f), im = new Image();
    im.onload = function(){ var k = Math.min(1, 3000 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.round(im.naturalWidth * k), h = Math.round(im.naturalHeight * k);
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h); URL.revokeObjectURL(u);
      cv.toBlob(function(b){ b ? res({ blob:b, w:w, h:h }) : rej(); }, 'image/png'); };
    im.onerror = function(){ URL.revokeObjectURL(u); rej(); }; im.src = u;
  });
}
function _mpoPdfAPng(f){
  if(typeof pdfjsP !== 'function') return Promise.reject('sin_pdfjs');
  return f.arrayBuffer().then(function(ab){ return pdfjsP().then(function(pdfjs){ return pdfjs.getDocument({ data:new Uint8Array(ab), isEvalSupported:false }).promise; }); }).then(function(doc){ return doc.getPage(1); }).then(function(pg){
    var v0 = pg.getViewport({ scale:1 }), k = Math.min(4, 3000 / Math.max(v0.width, v0.height)), v = pg.getViewport({ scale:k });
    var cv = document.createElement('canvas'); cv.width = Math.round(v.width); cv.height = Math.round(v.height); var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    return pg.render({ canvasContext:g, viewport:v }).promise.then(function(){ return new Promise(function(res, rej){ cv.toBlob(function(b){ b ? res({ blob:b, w:cv.width, h:cv.height }) : rej(); }, 'image/png'); }); });
  });
}
/* la plantilla rápida de terreno: el límite de la obra y las calles de alrededor (fijos: salen en los 3 mapas) */
function mpoPlantilla(){
  var N = _mpoNivel(), W = _mpoW(N), H = _mpoH(N);
  N.elementos_fijos = N.elementos_fijos.concat([
    { id:_mpoId(), t:'zon', k:'area', f:'rect', x:Math.round(W * 0.12), y:Math.round(H * 0.14), w:Math.round(W * 0.76), h:Math.round(H * 0.66), txt:'Obra' },
    { id:_mpoId(), t:'zon', k:'area', f:'rect', x:0, y:Math.round(H * 0.86), w:W, h:Math.round(H * 0.1), txt:'Calle / Av.' },
    { id:_mpoId(), t:'zon', k:'area', f:'rect', x:Math.round(W * 0.93), y:0, w:Math.round(W * 0.07), h:Math.round(H * 0.84), txt:'Jr.' },
    { id:_mpoId(), t:'fig', k:'acceso-peatonal', x:Math.round(W * 0.4), y:Math.round(H * 0.8), s:Math.round(W * 0.04), rot:0 },
    { id:_mpoId(), t:'fig', k:'acceso-vehicular', x:Math.round(W * 0.6), y:Math.round(H * 0.8), s:Math.round(W * 0.04), rot:0 }
  ]);
  _mpoSucio('n:' + N.id); mpoPintar();
}

/* ── los datos de la lámina (cajetín, firmas y, en evacuación, la emergencia) ──────────────────── */
function _mpoDoc(tipo){ var T = _mpoTipo(tipo), d = MPO.docs[tipo]; if(!d) d = MPO.docs[tipo] = { tipo:tipo, codigo:T.cod, titulo:T.n, revision_actual:-1, datos_emergencia:{} }; if(!d.datos_emergencia || typeof d.datos_emergencia !== 'object') d.datos_emergencia = {}; return d; }
function mpoDatos(){
  var T = _mpoTipo(MPO.tipo), d = _mpoDoc(MPO.tipo), x = d.datos_emergencia, f = function(k, def){ return esc(x[k] == null ? (def || '') : x[k]); };
  var cam = function(id, lab, val, ph, tipo){ return '<div class="campo"><label for="mpd-' + id + '">' + lab + '</label><input id="mpd-' + id + '" ' + (tipo ? 'type="' + tipo + '" ' : '') + 'maxlength="100" value="' + val + '" placeholder="' + esc(ph || '') + '"></div>'; };
  var h = '<div class="mpo-datos">' +
    cam('cod', 'Código', esc(d.codigo || T.cod), T.cod) + cam('tit', 'Título', esc(d.titulo || T.n), T.n) +
    cam('felab', 'Fecha de elaboración', f('felab', hoyISO()), '', 'date') + cam('fprox', 'Próxima revisión', f('fprox'), '', 'date') +
    cam('en', 'Elaborado por · nombre', f('en'), 'Prevencionista / Supervisor SST') + cam('ec', 'Elaborado por · cargo', f('ec'), 'Supervisor de Seguridad') +
    cam('rn', 'Revisado / aprobado por · nombre', f('rn'), 'Supervisor SST o Comité') + cam('rc', 'Revisado / aprobado por · cargo', f('rc'), 'Presidente del Comité de SST') +
    cam('vn', 'V°B° Producción / Residente · nombre' + (MPO.tipo === 'protecciones' ? ' (obligatorio)' : ' (opcional)'), f('vn'), 'Ingeniero residente') + cam('vc', 'V°B° · cargo', f('vc'), 'Residente de obra');
  if(MPO.tipo === 'evacuacion') h += '<p class="ayuda" style="grid-column:1/-1;margin:6px 0 0"><b>Cajetín de emergencia</b> (sale en cada lámina, con el aforo de cada nivel)</p>' +
    cam('tb', 'Bomberos', f('tb', '116')) + cam('ts', 'SAMU', f('ts', '106')) + cam('tp', 'Policía', f('tp', '105')) + cam('cn', 'Clínica SCTR afiliada', f('cn'), 'Nombre de la clínica') + cam('ct', 'Teléfono de la clínica', f('ct')) +
    '<div class="campo" style="grid-column:1/-1"><label for="mpd-be">Brigada de evacuación</label><input id="mpd-be" maxlength="200" value="' + f('be') + '" placeholder="Nombres, separados por comas"></div>' +
    '<div class="campo" style="grid-column:1/-1"><label for="mpd-ba">Brigada de primeros auxilios</label><input id="mpd-ba" maxlength="200" value="' + f('ba') + '"></div>' +
    '<div class="campo" style="grid-column:1/-1"><label for="mpd-bi">Brigada de lucha contra incendios</label><input id="mpd-bi" maxlength="200" value="' + f('bi') + '"></div>';
  h += '</div><p class="msg" id="mpd-msg" role="status"></p>';
  abrirHoja('Datos de la lámina', T.n + ' · lo que va en el cajetín de cada hoja', h, '<button type="button" class="bt sec" id="mpd-no">Cancelar</button><button type="button" class="bt" id="mpd-si">Guardar</button>', { ancha:true });
  $('mpd-no').onclick = cerrarHoja;
  $('mpd-si').onclick = function(){
    var v = function(k){ var e = $('mpd-' + k); return e ? String(e.value || '').trim() : undefined; }, o = {};
    ['felab', 'fprox', 'en', 'ec', 'rn', 'rc', 'vn', 'vc', 'tb', 'ts', 'tp', 'cn', 'ct', 'be', 'ba', 'bi'].forEach(function(k){ var q = v(k); if(q !== undefined) o[k] = q; else if(x[k] !== undefined) o[k] = x[k]; });
    var b = this; b.disabled = true;
    sbRpc('sst_mapa_doc_guardar', { p_emp:YO.obra.id, p_tipo:MPO.tipo, p:{ codigo:v('cod') || T.cod, titulo:v('tit') || T.n, datos_emergencia:o } }).then(function(j){
      if(!j || !j.ok) throw 0;
      d.codigo = v('cod') || T.cod; d.titulo = v('tit') || T.n; d.datos_emergencia = o; cerrarHoja(); toast('Datos de la lámina guardados.'); mpoPintar();
    }).catch(function(){ b.disabled = false; var m = $('mpd-msg'); m.className = 'msg mal'; m.textContent = 'No se pudo guardar: revisa tu conexión.'; });
  };
}

/* ── la lámina en PDF (A3 o A4 horizontal, un nivel por hoja) ─────────────────────────────────── */
function _mpoT(s){ return String(s == null ? '' : s).replace(/₂/g, '2').replace(/[‐-―]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/[^\x00-\xFF]/g, ''); }
function _mpoADataURL(url){
  if(!url) return Promise.resolve('');
  return fetch(url, { mode:'cors', credentials:'omit' }).then(function(r){ return r.ok ? r.blob() : Promise.reject(r.status); }).then(function(b){
    return new Promise(function(res){ var fr = new FileReader(); fr.onload = function(){ res(String(fr.result || '')); }; fr.onerror = function(){ res(''); }; fr.readAsDataURL(b); }); }).catch(function(){ return ''; });
}
function _mpoSvgAPng(svg, w, h){
  return new Promise(function(res){
    var u = URL.createObjectURL(new Blob([svg], { type:'image/svg+xml' })), im = new Image();
    im.onload = function(){ var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h); URL.revokeObjectURL(u); res(cv.toDataURL('image/png')); };
    im.onerror = function(){ URL.revokeObjectURL(u); res(''); }; im.src = u;
  });
}
function mpoLamina(tam, paraPublicar){
  var T = _mpoTipo(MPO.tipo), d = _mpoDoc(MPO.tipo), x = d.datos_emergencia, tipo = MPO.tipo;
  var niveles = MPO.niveles.slice();
  if(!niveles.length){ toast('Agrega un nivel primero.'); return Promise.resolve(null); }
  _mpoEstado('Armando la lámina…');
  return mpoGuardar().then(function(){
    return Promise.all([cargarEvPDF(), (typeof empleadorP === 'function') ? empleadorP().catch(function(){ return {}; }) : {}]);
  }).then(function(r){
    var em = r[1] || {}, J = window.jspdf.jsPDF, A3 = (tam === 'A3'), PW = A3 ? 420 : 297, PH = A3 ? 297 : 210, M = 8, colW = A3 ? 100 : 78, cajH = A3 ? 40 : 33;
    var doc = new J({ unit:'mm', format:A3 ? 'a3' : 'a4', orientation:'landscape' }), rev = paraPublicar ? _mpoRev(tipo, true) : _mpoRev(tipo, true) + ' (borrador)';
    var obra = _mpoT((typeof nombreObraP === 'function' ? nombreObraP() : '') || (YO.obra && YO.obra.nombre) || '');
    var cad = Promise.resolve();
    niveles.forEach(function(N, i){
      cad = cad.then(function(){ return _mpoADataURL(N.plano_url); }).then(function(du){
        var W = _mpoW(N), H = _mpoH(N), mw = PW - 2 * M - colW - 4, mh = PH - 2 * M - cajH - 4, k = Math.min(mw / (W * 1.06), mh / (H * 1.06)), iw = W * 1.06 * k, ih = H * 1.06 * k;
        var px = Math.min(4200, Math.round(iw / 25.4 * 220)), py = Math.round(px * ih / iw);
        return _mpoSvgAPng(mpoSVG({ nivel:N, tipo:tipo, ancho:px, alto:py, planoDU:du }), px, py).then(function(png){
          if(i) doc.addPage();
          doc.setDrawColor(11, 42, 58); doc.setLineWidth(0.4); doc.rect(M, M, PW - 2 * M, PH - 2 * M);
          if(png) doc.addImage(png, 'PNG', M + 2 + (mw - iw) / 2, M + 2 + (mh - ih) / 2, iw, ih, undefined, 'FAST');
          doc.setLineWidth(0.25); doc.line(PW - M - colW - 2, M, PW - M - colW - 2, PH - M - cajH - 2); doc.line(M, PH - M - cajH - 2, PW - M, PH - M - cajH - 2);
          return _mpoLeyendaPDF(doc, N, tipo, PW - M - colW, M + 3, colW - 3, PH - 2 * M - cajH - 8, x);
        }).then(function(){ _mpoCajetinPDF(doc, { T:T, d:d, x:x, N:N, rev:rev, revN:_mpoRevN(tipo, true), obra:obra, em:em, M:M, PW:PW, PH:PH, cajH:cajH, hoja:i + 1, de:niveles.length, A3:A3, tipo:tipo }); });
      });
    });
    return cad.then(function(){
      var nom = nombreArchivo(_mpoT((d.codigo || T.cod) + ' ' + _mpoRev(tipo, true) + ' - ' + T.n + ' - ' + obra)) + '.pdf';
      try{ doc.setProperties({ title:_mpoT(T.n + ' - ' + obra), creator:'OBRASST · Mapas de obra' }); }catch(_p){}
      var blob = doc.output('blob');
      _mpoEstado('');
      if(!paraPublicar) _mpoVerPDF(blob, nom);
      return { blob:blob, nombre:nom };
    });
  }).catch(function(e){ _mpoEstado(''); toast('No se pudo armar la lámina: ' + ((e && e.message) || e)); return null; });
}
function _mpoVerPDF(blob, nom){
  var u = URL.createObjectURL(blob);
  abrirHoja('La lámina', nom, '<iframe class="inf-vista" title="La lámina" src="' + esc(u) + '" style="width:100%;height:70vh;border:0"></iframe>',
    '<button type="button" class="bt sec" id="mpl-no">Cerrar</button><button type="button" class="bt" id="mpl-bajar">Descargar el PDF</button>', { ancha:true });
  $('mpl-no').onclick = cerrarHoja; $('mpl-bajar').onclick = function(){ bajarBlob(blob, nom); };
}
/* la leyenda (y en evacuación, el cajetín de emergencia) en la columna derecha */
function _mpoLeyendaPDF(doc, N, tipo, x, y, w, h, X){
  var L = mpoLeyenda(N, tipo);
  doc.setTextColor(11, 42, 58); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('LEYENDA', x, y + 3);
  var yy = y + 7, lado = 7;
  var iconos = L.map(function(it){ return _mpoSvgAPng('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120">' + _mpoIcono(it, 100).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>', 120, 120); });
  return Promise.all(iconos).then(function(P){
    var tope = y + h - (tipo === 'evacuacion' ? 46 : 0);
    L.forEach(function(it, i){
      if(yy + lado > tope) return;
      if(P[i]) doc.addImage(P[i], 'PNG', x, yy, lado, lado, undefined, 'FAST');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); doc.setTextColor(20, 30, 38);
      var t = _mpoT(it.n), est = Object.keys(it.est).length ? ' (' + Object.keys(MPO_EST).filter(function(k){ return it.est[k]; }).map(function(k){ return it.est[k] + ' ' + _mpoT(MPO_EST[k].n.toLowerCase()); }).join(', ') + ')' : (it.c > 1 ? ' x' + it.c : '');
      var ls = doc.splitTextToSize(t + est, w - lado - 2).slice(0, 2);
      doc.text(ls, x + lado + 2, yy + 3); yy += Math.max(lado, ls.length * 3.2) + 1.5;
    });
    if(!L.length){ doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.text('Sin elementos en este nivel.', x, yy + 3); }
    if(tipo === 'protecciones'){
      var tot = { inst:0, pend:0, obs:0 }; L.forEach(function(it){ for(var k in it.est) tot[k] += it.est[k]; });
      if(tot.inst + tot.pend + tot.obs && yy + 12 < y + h){ yy += 2; doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text('Resumen: ' + tot.inst + ' instaladas · ' + tot.pend + ' por instalar · ' + tot.obs + ' observadas', x, yy + 3, { maxWidth:w }); }
    }
    if(tipo === 'evacuacion'){
      var ey = y + h - 44; doc.setFillColor(254, 242, 242); doc.setDrawColor(198, 40, 40); doc.roundedRect(x - 1, ey, w + 1, 44, 1.5, 1.5, 'FD');
      doc.setTextColor(198, 40, 40); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('EN CASO DE EMERGENCIA', x + 1, ey + 5);
      doc.setTextColor(20, 30, 38); doc.setFontSize(8);
      var tl = ['Bomberos: ' + (X.tb || '116'), 'SAMU: ' + (X.ts || '106'), 'Policía: ' + (X.tp || '105')];
      doc.text(_mpoT(tl.join('   ')), x + 1, ey + 10, { maxWidth:w - 2 });
      var ly = ey + 15, lin = function(t){ if(!t) return; var s = doc.splitTextToSize(_mpoT(t), w - 2).slice(0, 2); doc.setFont('helvetica', 'normal'); doc.text(s, x + 1, ly); ly += s.length * 3.3 + 0.6; };
      lin(X.cn ? 'Clínica SCTR: ' + X.cn + (X.ct ? ' · ' + X.ct : '') : ''); lin(N.aforo != null && N.aforo !== '' ? 'Aforo del nivel: ' + N.aforo + ' personas' : '');
      lin(X.be ? 'Evacuación: ' + X.be : ''); lin(X.ba ? 'Primeros auxilios: ' + X.ba : ''); lin(X.bi ? 'Contra incendios: ' + X.bi : '');
    }
  });
}
/* el cajetín de abajo: logo, título, obra y nivel, código, revisión, fechas y firmas */
function _mpoCajetinPDF(doc, o){
  var M = o.M, y = o.PH - M - o.cajH, W = o.PW - 2 * M, x = M, h = o.cajH, A3 = o.A3, X = o.x;
  var c1 = A3 ? 62 : 46, c2 = A3 ? 150 : 104, c3 = A3 ? 70 : 52, c4 = W - c1 - c2 - c3;
  doc.setDrawColor(11, 42, 58); doc.setLineWidth(0.3);
  [x + c1, x + c1 + c2, x + c1 + c2 + c3].forEach(function(v){ doc.line(v, y, v, y + h); });
  if(o.em && o.em.logo){ try{ var p = doc.getImageProperties(o.em.logo), r = p.width / p.height, lw = c1 - 6, lh = lw / r; if(lh > h - 6){ lh = h - 6; lw = lh * r; } doc.addImage(o.em.logo, x + (c1 - lw) / 2, y + (h - lh) / 2, lw, lh, undefined, 'FAST'); }catch(_l){} }
  else { doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(11, 42, 58); doc.text(_mpoT(o.em && o.em.razon || ''), x + 3, y + h / 2, { maxWidth:c1 - 6 }); }
  var tx = x + c1 + 3;
  doc.setTextColor(11, 42, 58); doc.setFont('helvetica', 'bold'); doc.setFontSize(A3 ? 15 : 12); doc.text(_mpoT(o.T.tit), tx, y + (A3 ? 9 : 8));
  doc.setFontSize(A3 ? 10 : 8.5); doc.setFont('helvetica', 'normal'); doc.text(doc.splitTextToSize(_mpoT(o.obra), c2 - 6).slice(0, 1), tx, y + (A3 ? 16 : 14));
  doc.setFont('helvetica', 'bold'); doc.text(_mpoT('Nivel: ' + o.N.nombre), tx, y + (A3 ? 23 : 20), { maxWidth:c2 - 6 });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(90, 100, 110);
  doc.text(_mpoT(o.tipo === 'protecciones' ? 'Norma G.050 · D.S. 011-2019-TR' : (o.tipo === 'evacuacion' ? 'NTP 399.010-1 · rutas, zonas seguras y puntos de reunión' : 'Ley 29783 · D.S. 005-2012-TR · señales NTP 399.010-1')), tx, y + h - 3);
  var cx = x + c1 + c2 + 3, fila = function(k, v, yy){ doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4); doc.setTextColor(11, 42, 58); doc.text(_mpoT(k), cx, yy); doc.setFont('helvetica', 'normal'); doc.text(_mpoT(v || '—'), cx + (A3 ? 26 : 21), yy); };
  var fl = function(f){ return f ? String(f).slice(8, 10) + '/' + String(f).slice(5, 7) + '/' + String(f).slice(0, 4) : ''; };
  var paso = h / 6.2;
  fila('Código', o.d.codigo || o.T.cod, y + paso); fila('Revisión', o.rev, y + paso * 2); fila('Elaboración', fl(X.felab || hoyISO()), y + paso * 3);
  fila('Actualización', fl(hoyISO()), y + paso * 4); fila('Próx. revisión', fl(X.fprox), y + paso * 5); fila('Hoja', o.hoja + ' de ' + o.de, y + paso * 6 - 1);
  var FF = _mpoFirmasDe(o.tipo, o.revN), fx = x + c1 + c2 + c3, fw = c4 / 3, firmas = MPO_ROLES.map(function(R){ var g = FF[R.k]; return [R.n, g ? g.nombre : X[R.dn], g ? g.cargo : X[R.dc], g ? g.trazo : '', g ? String(g.en || '').slice(0, 10) : '']; });
  firmas.forEach(function(f, i){
    if(f[3]){ try{ var ip = doc.getImageProperties(f[3]), ir = ip.width / ip.height, ih2 = h - 19, iw2 = ih2 * ir; if(iw2 > fw - 6){ iw2 = fw - 6; ih2 = iw2 / ir; } doc.addImage(f[3], 'PNG', x + c1 + c2 + c3 + fw * i + (fw - iw2) / 2, y + 6, iw2, ih2, undefined, 'FAST'); }catch(_f){} }
    var bx = fx + fw * i; if(i) doc.line(bx, y, bx, y + h);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(11, 42, 58); doc.text(_mpoT(f[0] + (i === 2 && o.tipo === 'protecciones' ? ' *' : '')), bx + 2, y + 4, { maxWidth:fw - 4 });
    doc.setDrawColor(160, 170, 178); doc.line(bx + 3, y + h - 11, bx + fw - 3, y + h - 11); doc.setDrawColor(11, 42, 58);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(20, 30, 38);
    doc.text(_mpoT(f[1] || ''), bx + 2, y + h - 7, { maxWidth:fw - 4 }); doc.setTextColor(90, 100, 110); doc.text(_mpoT(f[2] ? f[2] + (f[4] ? ' · ' + f[4].slice(8, 10) + '/' + f[4].slice(5, 7) + '/' + f[4].slice(0, 4) : '') : 'Nombre, cargo, firma y fecha'), bx + 2, y + h - 3, { maxWidth:fw - 4 });
  });
}

/* ── las firmas de la revisión (etapa 2): se dibujan en la web o en la app; una por rol ─────────── */
var MPO_ROLES = [
  { k:'prevencionista', n:'Elaborado por', d:'Prevencionista / Supervisor de Seguridad', dn:'en', dc:'ec' },
  { k:'comite_sst',     n:'Revisado / aprobado por', d:'Supervisor SST elegido o Presidente del Comité / Subcomité', dn:'rn', dc:'rc' },
  { k:'residente',      n:'V°B° Producción / Residente', d:'Obligatorio en el mapa de protecciones colectivas', dn:'vn', dc:'vc' }
];
function _mpoFirmasDe(tipo, rev){ return (MPO.firmas[tipo] && MPO.firmas[tipo][rev]) || {}; }
function _mpoFirmasN(tipo){ return Object.keys(_mpoFirmasDe(tipo, _mpoRevN(tipo, true))).length; }
/* el lienzo para firmar con el dedo o el mouse: devuelve { vacio(), du(), limpiar() } */
function mpoPad(cv){
  var g = cv.getContext('2d'), r = window.devicePixelRatio || 1, w = cv.clientWidth || 360, h = cv.clientHeight || 180, hay = false, abajo = false, ult = null;
  cv.width = Math.round(w * r); cv.height = Math.round(h * r); g.scale(r, r); g.lineWidth = 2.4; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#0B2A3A';
  var pt = function(ev){ var b = cv.getBoundingClientRect(); return [ev.clientX - b.left, ev.clientY - b.top]; };
  cv.onpointerdown = function(ev){ abajo = true; ult = pt(ev); try{ cv.setPointerCapture(ev.pointerId); }catch(_c){} ev.preventDefault(); };
  cv.onpointermove = function(ev){ if(!abajo) return; var p = pt(ev); g.beginPath(); g.moveTo(ult[0], ult[1]); g.lineTo(p[0], p[1]); g.stroke(); ult = p; hay = true; };
  cv.onpointerup = cv.onpointercancel = function(){ abajo = false; };
  return { vacio:function(){ return !hay; }, limpiar:function(){ g.clearRect(0, 0, w, h); hay = false; },
    du:function(){ var c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; var g2 = c2.getContext('2d'); g2.fillStyle = '#fff'; g2.fillRect(0, 0, c2.width, c2.height); g2.drawImage(cv, 0, 0); return c2.toDataURL('image/png'); } };
}
function mpoFirmas(){
  var tipo = MPO.tipo, T = _mpoTipo(tipo), rev = _mpoRevN(tipo, true), F = _mpoFirmasDe(tipo, rev), X = _mpoDoc(tipo).datos_emergencia;
  var h = '<p class="ayuda" style="margin:0 0 10px">La ' + _mpoRev(tipo, true) + ' queda pendiente de firma hasta que la publiques. Si cambias el mapa después de firmar, vuelve a pedir las firmas. También se firma desde la app.</p><div class="mpo-firmas">' +
    MPO_ROLES.map(function(R){ var f = F[R.k];
      return '<div class="mpo-firma"><div><b>' + esc(R.n) + (R.k === 'residente' && tipo === 'protecciones' ? ' *' : '') + '</b><br><small class="tenue">' + esc(f ? f.nombre + (f.cargo ? ' · ' + f.cargo : '') + ' · ' + String(f.en || '').slice(0, 10) : R.d) + '</small></div>' +
        (f && f.trazo ? '<img alt="Firma" src="' + esc(f.trazo) + '">' : '') + '<button type="button" class="bt ' + (f ? 'sec ' : '') + 'chico" data-mpf="' + R.k + '">' + (f ? 'Firmar otra vez' : 'Firmar') + '</button></div>'; }).join('') + '</div>';
  abrirHoja('Firmas · ' + T.n, (_mpoDoc(tipo).codigo || T.cod) + ' · ' + _mpoRev(tipo, true), h, '<button type="button" class="bt sec" id="mpf-no">Cerrar</button>', { ancha:true });
  $('mpf-no').onclick = cerrarHoja;
  Array.prototype.forEach.call(document.querySelectorAll('[data-mpf]'), function(b){ b.onclick = function(){ var R = null; MPO_ROLES.forEach(function(x){ if(x.k === b.getAttribute('data-mpf')) R = x; }); mpoFirmar(R, X[R.dn] || '', X[R.dc] || ''); }; });
}
function mpoFirmar(R, nom, cargo){
  var tipo = MPO.tipo, h = '<div class="campo"><label for="mpf-n">Nombre</label><input id="mpf-n" maxlength="120" value="' + esc(nom) + '"></div><div class="campo"><label for="mpf-c">Cargo</label><input id="mpf-c" maxlength="120" value="' + esc(cargo) + '"></div>' +
    '<p class="ayuda" style="margin:6px 0">Firma aquí, con el mouse o el dedo:</p><canvas class="mpo-pad" id="mpf-pad"></canvas><p class="msg" id="mpf-msg" role="status"></p>';
  abrirHoja(R.n, _mpoTipo(tipo).n + ' · ' + _mpoRev(tipo, true), h, '<button type="button" class="bt sec" id="mpf-limpia">Borrar</button><button type="button" class="bt sec" id="mpf-x">Cancelar</button><button type="button" class="bt" id="mpf-si">Firmar</button>', { ancha:true });
  var pad = mpoPad($('mpf-pad'));
  $('mpf-limpia').onclick = pad.limpiar; $('mpf-x').onclick = mpoFirmas;
  $('mpf-si').onclick = function(){
    var n = String($('mpf-n').value || '').trim(), c = String($('mpf-c').value || '').trim(), m = $('mpf-msg'), b = this;
    if(n.length < 3){ m.className = 'msg mal'; m.textContent = 'Escribe el nombre de quien firma.'; return; }
    if(pad.vacio()){ m.className = 'msg mal'; m.textContent = 'Falta la firma.'; return; }
    b.disabled = true;
    mpoGuardar().then(function(){ return sbRpc('sst_mapa_firmar', { p_emp:YO.obra.id, p_tipo:tipo, p_rol:R.k, p_nombre:n, p_cargo:c, p_trazo:pad.du() }); }).then(function(j){
      if(!j || !j.ok) throw (j && j.motivo) || 0;
      var a = MPO.firmas[tipo] = MPO.firmas[tipo] || {}, q = a[j.revision] = a[j.revision] || {};
      q[R.k] = { rol:R.k, nombre:n, cargo:c, trazo:pad.du(), en:new Date().toISOString(), revision:j.revision };
      toast('Firmado: ' + R.n.toLowerCase() + '.'); mpoFirmas(); mpoPintar();
    }).catch(function(){ b.disabled = false; m.className = 'msg mal'; m.textContent = 'No se pudo guardar la firma: revisa tu conexión.'; });
  };
}
/* el historial: cada revisión publicada con su PDF (la vigente arriba) */
function mpoHistorial(){
  var tipo = MPO.tipo, T = _mpoTipo(tipo), L = (MPO.hist[tipo] || []).slice().sort(function(a, b){ return b.revision - a.revision; });
  var h = L.length ? '<div class="mpo-firmas">' + L.map(function(x){
    return '<div class="mpo-firma"><div><b>' + esc((_mpoDoc(tipo).codigo || T.cod) + ' · Rev. ' + (x.revision < 10 ? '0' : '') + x.revision) + '</b> ' + (x.estado === 'aprobado' ? '<span class="pill ok">vigente</span>' : '<span class="pill gris">histórica</span>') +
      '<br><small class="tenue">Publicada el ' + esc(String(x.fecha || '').slice(0, 10)) + '</small></div>' + (x.pdf_url ? '<a class="bt sec chico" href="' + esc(x.pdf_url) + '" target="_blank" rel="noopener">Ver el PDF</a>' : '') + '</div>'; }).join('') + '</div>'
    : '<div class="vacio"><b>Todavía no hay revisiones publicadas</b>La primera que publiques queda aquí, con su PDF. Las anteriores se guardan para la auditoría.</div>';
  abrirHoja('Historial · ' + T.n, 'Cada revisión publicada, con su lámina firmada', h, '<button type="button" class="bt sec" id="mph-no">Cerrar</button>', { ancha:true });
  $('mph-no').onclick = cerrarHoja;
}

/* ── publicar la revisión: la lámina a Documentos (su carpeta) y al cartel QR; los borradores quedan aprobados ── */
function mpoPublicar(){
  var T = _mpoTipo(MPO.tipo), d = _mpoDoc(MPO.tipo), tipo = MPO.tipo, rev = _mpoRev(tipo, true), X = d.datos_emergencia;
  var hay = MPO.niveles.some(function(N){ return (N.elementos_fijos || []).length || _mpoCapa(tipo, N.id).elementos.length; });
  if(!hay){ toast('El mapa todavía está vacío: pon algo en el plano antes de publicar.'); return; }
  var FF = _mpoFirmasDe(tipo, _mpoRevN(tipo, true)), falta = [];
  if(!FF.prevencionista && !X.en) falta.push('quién lo elaboró');
  if(!FF.comite_sst) falta.push('la firma de quien lo revisa o aprueba');
  if(tipo === 'protecciones' && !FF.residente) falta.push('el V°B° de Producción / Residente (obligatorio en este mapa)');
  falta = falta.join(', ');
  confirmar('¿Publicar la ' + rev + ' del ' + T.n.toLowerCase() + '?',
    'Sale la lámina (A3, un nivel por hoja) a «Documentos» y a su cartel QR, y esta revisión queda aprobada. Lo que cambies después abre la revisión siguiente.' + (falta ? ' Falta: ' + falta + '.' : ''),
    { si:'Publicar' }).then(function(si){
    if(!si) return;
    mpoLamina('A3', true).then(function(L){
      if(!L) return;
      _mpoEstado('Publicando…');
      var f; try{ f = new File([L.blob], L.nombre, { type:'application/pdf' }); }catch(_e){ f = L.blob; f.name = L.nombre; }
      return subirArchivoP('docs', f).then(function(url){
        return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:T.hoja, nombre:_mpoT((d.codigo || T.cod) + ' ' + rev + ' · ' + T.n), url:url, nota:'mapa:' + tipo + ':' + rev }).then(function(){ return url; });
      }).then(function(url){ return sbRpc('sst_mapa_publicar', { p_emp:YO.obra.id, p_tipo:tipo, p_pdf_url:url }); }).then(function(j){
        if(!j || !j.ok) throw (j && j.motivo) || 0;
        d.revision_actual = j.revision;
        MPO.niveles.forEach(function(N){ var C = MPO.capas[_mpoClave(tipo, N.id)]; if(C){ C.estado = 'aprobado'; C.revision = j.revision; } });
        _mpoEstado(''); mpoPintar();
        toast('Publicada la ' + rev + ': está en Documentos y en su cartel QR.');
      });
    }).catch(function(e){ _mpoEstado(''); toast(e === 'nada_que_publicar' ? 'No hay cambios que publicar.' : 'No se pudo publicar: revisa tu conexión.'); });
  });
}

function _mpoEstilos(){
  if(document.getElementById('mpo-css')) return;
  var st = document.createElement('style'); st.id = 'mpo-css';
  st.textContent = '.mpo{font-family:var(--letra,"Plus Jakarta Sans",sans-serif)}' +
    '.mpo-tipos{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.mpo-tipos button{border:1px solid #CBD5E1;background:#fff;border-radius:12px;padding:8px 12px;font:inherit;font-weight:600;cursor:pointer;color:#08222F}' +
    '.mpo-tipos button small{display:block;font-weight:500;color:#5B6B76;font-size:11.5px}.mpo-tipos button.on{border-color:#F5B700;box-shadow:0 0 0 3px rgba(245,183,0,.22);background:#FFFBEB}' +
    '.mpo-niv{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin:0 0 10px}.mpo-niv-l,.mpo-niv-a{display:flex;flex-wrap:wrap;gap:6px}' +
    '.mpo-niv-l button{border:1px solid #CBD5E1;background:#F8FAFC;border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer;color:#08222F}.mpo-niv-l button.on{background:#0B2A3A;color:#fff;border-color:#0B2A3A}' +
    '.mpo-niv-l .mpo-mas{border-style:dashed;background:#fff}' +
    '.mpo-barra{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 8px;padding:6px;border:1px solid #E2E8F0;border-radius:12px;background:#fff}' +
    '.mpo-h{border:1px solid transparent;background:none;border-radius:9px;padding:6px 10px;font:inherit;font-size:13px;cursor:pointer;color:#08222F}.mpo-h.on{background:#FFF4CC;border-color:#F5B700}.mpo-h:hover{background:#F1F5F9}' +
    '.mpo-sep{flex:1}.mpo-guarda{font-size:12px;color:#5B6B76}' +
    '.mpo-cuerpo{display:grid;grid-template-columns:230px 1fr 250px;gap:10px;align-items:start}@media (max-width:1100px){.mpo-cuerpo{grid-template-columns:1fr}}' +
    '.mpo-band,.mpo-panel{border:1px solid #E2E8F0;border-radius:12px;background:#fff;padding:10px;max-height:72vh;overflow:auto}' +
    '.mpo-band-t{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 8px}.mpo-band-t button{border:1px solid #E2E8F0;background:#F8FAFC;border-radius:8px;padding:4px 8px;font:inherit;font-size:12px;cursor:pointer}.mpo-band-t button.on{background:#0B2A3A;color:#fff}' +
    '.mpo-busca{width:100%;padding:7px 9px;border:1px solid #CBD5E1;border-radius:9px;font:inherit;font-size:13px;margin:0 0 8px;box-sizing:border-box}' +
    '.mpo-items{display:grid;grid-template-columns:1fr 1fr;gap:6px}.mpo-it{display:flex;flex-direction:column;align-items:center;gap:3px;border:1px solid #E2E8F0;background:#fff;border-radius:10px;padding:6px 4px;font:inherit;font-size:11px;cursor:pointer;color:#08222F;text-align:center}' +
    '.mpo-it.on{border-color:#F5B700;background:#FFFBEB}.mpo-it-i{width:38px;height:38px;border-radius:30%;background:#fff;display:flex;align-items:center;justify-content:center}.mpo-it-i svg{width:36px;height:36px}' +
    '.mpo-ayuda{font-size:12px;color:#5B6B76;margin:6px 0}' +
    '.mpo-lienzo-c{position:relative}.mpo-lienzo{border:1px solid #CBD5E1;border-radius:12px;background:#E5E7EB;height:72vh;overflow:hidden;touch-action:none}.mpo-lienzo svg{width:100%;height:100%;display:block;cursor:crosshair}' +
    '.mpo-traz{position:absolute;left:10px;bottom:10px;background:#fff;border:1px solid #CBD5E1;border-radius:10px;padding:6px 10px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,.08)}' +
    '.mpo-el{cursor:move}.mpo-pulso{animation:mpoPulso 1.6s ease-in-out infinite}@keyframes mpoPulso{50%{stroke-opacity:.35}}@media (prefers-reduced-motion:reduce){.mpo-pulso{animation:none}}' +
    '.mpo-sec{margin:0 0 12px;display:flex;flex-direction:column;gap:6px;font-size:13px}.mpo-sec>b{font-size:13px}.mpo-capa{display:flex;align-items:center;gap:4px;font-size:12.5px}' +
    '.mpo-ojo{border:1px solid #E2E8F0;background:#fff;border-radius:7px;padding:2px 5px;cursor:pointer;font-size:13px}.mpo-lab{display:flex;flex-direction:column;gap:3px;font-size:12.5px}.mpo-chk{display:flex;align-items:center;gap:6px;font-size:12.5px}.mpo-chk input{width:auto;flex:none;margin:0}.mpo-lab input[type=text],.mpo-lab input[type=number]{padding:6px 8px;border:1px solid #CBD5E1;border-radius:8px;font:inherit}' +
    '.mpo-est{display:flex;flex-direction:column;gap:4px}.mpo-est button{border:1px solid #E2E8F0;background:#fff;border-radius:8px;padding:5px 8px;font:inherit;font-size:12.5px;text-align:left;cursor:pointer}.mpo-est button.on{border-color:#0B2A3A;background:#F1F5F9;font-weight:700}' +
    '.mpo-ley{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.mpo-ley li{display:flex;align-items:center;gap:6px;font-size:12px}.mpo-ley small{color:#5B6B76}' +
    '.mpo-pie{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0 0}.mpo-pie .ayuda{flex-basis:100%;margin:0}' +
    '.mpo-3dc{display:grid;grid-template-columns:150px 1fr;gap:8px}.mpo-3dv{min-height:360px}.mpo-info-c{position:absolute;right:12px;top:12px}@media (max-width:700px){.mpo-3dc{grid-template-columns:1fr}}' +
    '.mpo-vista{display:inline-flex;gap:2px;border:1px solid #E2E8F0;border-radius:10px;padding:2px}' +
    '.mpo-firmas{display:flex;flex-direction:column;gap:8px}.mpo-firma{display:flex;gap:10px;align-items:center;justify-content:space-between;border:1px solid #E2E8F0;border-radius:10px;padding:8px 10px;flex-wrap:wrap}' +
    '.mpo-firma img{height:40px;max-width:140px;object-fit:contain}.mpo-pad{border:1px dashed #94A3B8;border-radius:10px;background:#fff;touch-action:none;width:100%;height:180px;display:block}' +
    '.mpo-datos{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px 12px}' +
    '.mpo [hidden],.mpo-traz[hidden]{display:none!important}';
  document.head.appendChild(st);
}
