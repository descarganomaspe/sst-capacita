/* OBRASST · lo común de los requerimientos de EPP y materiales, para el portal y la página del enlace.
   Lo arma armar.py desde requerimientos-base.js (el mismo de la app). No editar. */
/* ══════════════════════════════════════════════════════════════════
   LOS REQUERIMIENTOS DE EPP Y MATERIALES · LO COMÚN (04/10/2026)
   Marcelo: «podemos manejar el pedir requerimiento de EPPs, materiales…
   por celular puedo hacerlo, con la app, y se envía también al jefe, al
   coordinador que esté viendo el tema de SSOMA. Y para la web, que se vea
   bonito, que se descargue el Excel, o llenarlo en la misma web… que salga
   su fecha de creación, la ubicación, quién requiere, quién autoriza.
   Además, tomar los datos de consumo de EPP, como dándole un sustento al
   que pide: por tantos trabajadores consumes tanto, puedes pedir tanto
   para el próximo mes o semanal, con una holgura por una eventualidad».

   Lo mismo en la app, en el portal y en la página del enlace (armar.py lo
   pone en la app, y arma portal/requerimientos.js y r/requerimiento.js):
     · las clases, las prioridades y los estados, con su nombre;
     · LA CUENTA DEL CONSUMO: de las entregas de EPP del kardex saca cuánto
       sale por trabajador y cuánto pedir para una semana, una quincena o
       un mes, con holgura, y escribe el sustento de cada línea;
     · el semáforo de cada línea contra ese consumo;
     · el PDF y el Excel del requerimiento, con sus firmas.

   05/10/2026 · Marcelo: «mejorar el análisis de pedido de EPP: tener en
   consideración la cantidad de personal que tuvo, tiene y tendrá de acá
   hasta el próximo requerimiento, y guardar la información para futuros
   análisis, quizás por etapas del proyecto; también que ese requerimiento
   toma una semana para que llegue al proyecto; y que tenga la firma del
   que pide, del que aprueba por seguridad, del gerente de proyecto y del
   gerente general».
     · EL PERSONAL: lo que salió se divide entre los días-trabajador que
       hubo de verdad en esos días (el padrón, con ingresos, ceses y
       descansos), y se proyecta con los que va a haber;
     · EL PLAZO: mientras el pedido llega (7 días) la obra sigue gastando:
       se pide para la espera más el periodo, y se avisa si lo que hay en
       almacén se acaba antes de que llegue;
     · LO QUE YA VIENE: lo autorizado en otros pedidos que todavía no llega
       se descuenta;
     · LA ETAPA: cada pedido guarda su etapa y cuánto salía por trabajador
       al mes de cada EPP; «aprendido» lo junta por etapa para comparar;
     · LAS FIRMAS: después de Solicita y de Seguridad van las de la ruta
       de la obra (gerentes): «firmantes» las ordena para la pantalla, el
       PDF y el Excel, con sus casilleros en blanco si falta firmar.
   Sin nada de la pantalla: el PDF necesita jsPDF y el Excel RCAP.xlsx, y
   los dos se piden recién al armarse.
   ══════════════════════════════════════════════════════════════════ */
var RQB = (function(){
  'use strict';
  var BASE = 'https://descarganomaspe.github.io/sst-capacita/r/';
  var CLASES = [
    { k:'epp',          n:'EPP',                             ic:'🦺', t:'REQUERIMIENTO DE EPP' },
    { k:'materiales',   n:'Materiales de seguridad',         ic:'🧱', t:'REQUERIMIENTO DE MATERIALES DE SEGURIDAD' },
    { k:'senalizacion', n:'Señalización',                    ic:'🚧', t:'REQUERIMIENTO DE SEÑALIZACIÓN' },
    { k:'emergencia',   n:'Emergencia y primeros auxilios',  ic:'🧯', t:'REQUERIMIENTO DE EQUIPOS DE EMERGENCIA' },
    { k:'otros',        n:'Otros',                           ic:'📦', t:'REQUERIMIENTO' }
  ];
  /* c: ok | med | mal | neu (el color en la pantalla); rgb: en el PDF */
  var ESTADOS = {
    enviado:    { n:'Por autorizar',      c:'med', ic:'⏳', rgb:[178,116,10] },
    autorizado: { n:'Autorizado',         c:'ok',  ic:'✅', rgb:[18,122,71] },
    firmas:     { n:'Faltan firmas',      c:'med', ic:'✍️', rgb:[178,116,10] },
    parcial:    { n:'Recibido en parte',  c:'ok',  ic:'📦', rgb:[18,122,71] },
    atendido:   { n:'Recibido',           c:'ok',  ic:'📦', rgb:[18,122,71] },
    observado:  { n:'Observado',          c:'med', ic:'↩️', rgb:[178,116,10] },
    rechazado:  { n:'Rechazado',          c:'mal', ic:'⛔', rgb:[183,47,43] },
    anulado:    { n:'Anulado',            c:'neu', ic:'🗑️', rgb:[110,120,128] }
  };
  var UNIDADES = ['und', 'par', 'caja', 'paquete', 'rollo', 'kit', 'juego', 'galón', 'litro', 'kg', 'm', 'ciento', 'docena'];
  /* lo que más se pide, para no escribirlo: [descripción, unidad] */
  var CATALOGO = {
    epp: [['Casco de seguridad', 'und'], ['Barbiquejo', 'und'], ['Lentes de seguridad claros', 'und'], ['Lentes de seguridad oscuros', 'und'], ['Tapones auditivos', 'par'],
          ['Orejeras', 'und'], ['Respirador de media cara', 'und'], ['Filtros para respirador', 'par'], ['Mascarilla N95', 'und'], ['Guantes multiflex', 'par'],
          ['Guantes de cuero', 'par'], ['Guantes de nitrilo', 'par'], ['Zapatos de seguridad', 'par'], ['Botas de jebe con punta de acero', 'par'], ['Chaleco reflectivo', 'und'],
          ['Uniforme', 'und'], ['Arnés de cuerpo completo', 'und'], ['Línea de vida doble con absorbedor', 'und'], ['Careta facial', 'und'], ['Cortaviento', 'und'],
          ['Bloqueador solar', 'und'], ['Traje descartable', 'und']],
    materiales: [['Cinta de señalización amarilla', 'rollo'], ['Cinta de señalización roja', 'rollo'], ['Malla de seguridad naranja', 'rollo'], ['Conos de seguridad', 'und'],
          ['Parantes para señalización', 'und'], ['Candados de bloqueo', 'und'], ['Tarjetas de bloqueo', 'und'], ['Tarjetas de andamio', 'und'], ['Cintillos', 'ciento'],
          ['Capuchones para fierro', 'ciento'], ['Bolsas para residuos', 'paquete'], ['Cilindros para residuos', 'und'], ['Cinta del color del mes', 'rollo']],
    senalizacion: [['Señal de obligación', 'und'], ['Señal de prohibición', 'und'], ['Señal de advertencia', 'und'], ['Señal de evacuación', 'und'], ['Señal de equipos contra incendio', 'und'],
          ['Letrero de obra', 'und'], ['Mapa de riesgos', 'und'], ['Cinta reflectiva', 'rollo']],
    emergencia: [['Extintor PQS de 6 kg', 'und'], ['Extintor PQS de 9 kg', 'und'], ['Recarga de extintor', 'und'], ['Botiquín equipado', 'und'], ['Reposición de botiquín', 'kit'],
          ['Camilla rígida', 'und'], ['Collarín cervical', 'und'], ['Lavaojos portátil', 'und'], ['Kit antiderrame', 'kit'], ['Linterna', 'und'], ['Megáfono', 'und'], ['Silbato', 'und']],
    otros: []
  };
  var HORIZONTES = [ { d:7, n:'Una semana' }, { d:15, n:'Una quincena' }, { d:30, n:'Un mes' } ];
  /* cuánto demora en llegar un pedido desde que se envía (lo de la obra viene de su configuración: 7) */
  var PLAZOS = [ { d:0, n:'Hoy mismo' }, { d:3, n:'3 días' }, { d:7, n:'7 días' }, { d:15, n:'15 días' }, { d:30, n:'30 días' } ];
  var PLAZO_BASE = 7;
  /* las etapas de una obra, para no escribirlas (se puede poner otra) */
  var ETAPAS = ['Obras preliminares', 'Movimiento de tierras', 'Cimentación', 'Estructuras', 'Albañilería', 'Instalaciones', 'Acabados', 'Obras exteriores', 'Cierre y entrega'];
  /* las firmas que van después de la de Seguridad si la obra no dijo otra cosa (lo mismo que pone el servidor) */
  var RUTA_BASE = [ { k:'gp', t:'Gerente de Proyecto', n:'', m:'', on:true }, { k:'gg', t:'Gerente General', n:'', m:'', on:true } ];
  var VENTANAS = [ { d:30, n:'Los últimos 30 días' }, { d:60, n:'Los últimos 60 días' }, { d:90, n:'Los últimos 90 días' } ];

  function clase(k){ for(var i = 0; i < CLASES.length; i++) if(CLASES[i].k === k) return CLASES[i]; return CLASES[CLASES.length - 1]; }
  /* el estado que se le dice a la gente: «autorizado» con una parte recibida es «recibido en parte» */
  function estadoK(r){
    var e = (r && r.estado) || 'enviado';
    if(e === 'autorizado' && r.aten && r.aten.parcial) return 'parcial';
    /* Seguridad ya lo aprobó, pero a su ruta le faltan firmas (no frena la compra: se dice) */
    if(e === 'autorizado' && faltan(r).length) return 'firmas';
    return e;
  }
  function estado(r){ return ESTADOS[estadoK(r)] || ESTADOS.enviado; }
  /* «urgente» se dice mientras el pedido sigue en camino: una vez recibido, rechazado o anulado ya no apura a nadie
     (la prioridad con que se pidió queda escrita en su PDF y en su Excel) */
  function urge(r){ return !!r && r.prioridad === 'urgente' && ['atendido', 'rechazado', 'anulado'].indexOf(r.estado) < 0; }
  function enlace(token){ return BASE + '?t=' + encodeURIComponent(token || ''); }

  /* ══ LAS FIRMAS DE LA RUTA ══════════════════════════════════════════
     r.ruta: [{k, t, n, m, x}] las firmas que van después de la de Seguridad (título, nombre, correo, llave del enlace)
     r.vistos: {k: {n, c, f, t, como: enlace|aqui|papel, por, nota}} las que ya están */
  function ruta(r){ return (r && Array.isArray(r.ruta)) ? r.ruta : []; }
  function visto(r, k){ var v = r && r.vistos; return (v && typeof v === 'object' && v[k]) || null; }
  function faltan(r){ return ruta(r).filter(function(p){ return !visto(r, p.k); }); }
  /* ¿ya se puede firmar? Solo lo que Seguridad aprobó */
  function seFirma(r){ return !!r && (r.estado === 'autorizado' || r.estado === 'atendido'); }
  /* el segundo casillero: con gerentes detrás, Seguridad «aprueba»; si es la única firma, «autoriza» */
  function titulo2(r){ return ruta(r).length ? 'Aprueba por Seguridad' : 'Autoriza'; }
  function comoTx(v){
    if(!v) return '';
    if(v.como === 'enlace') return 'por enlace, sin cuenta';
    if(v.como === 'aqui') return 'en persona' + (v.por ? ', con ' + v.por : '');
    if(v.como === 'papel') return 'firmó en papel' + (v.por ? ' · lo anotó ' + v.por : '');
    return 'con su cuenta';
  }
  /* todos los casilleros, en orden: Solicita, Seguridad y los de la ruta */
  function firmantes(r){
    r = r || {};
    var aut = (r.res && r.res.accion === 'autorizar') ? r.res : null, L = [];
    L.push({ k:'por', t:'Solicita', n:(r.por || {}).n || '', c:(r.por || {}).c || '', f:(r.por || {}).f || null,
             cuando:dma(r.fecha) + (r.creado ? ' ' + hora(r.creado) : ''), como:'con su cuenta', ok:true });
    L.push({ k:'seg', t:titulo2(r), n:aut ? aut.n || '' : '', c:aut ? aut.c || '' : '', f:aut ? aut.f || null : null, cuando:aut ? cuando(aut.t) : '',
             como:aut ? (aut.como === 'enlace' ? 'por enlace, sin cuenta' : 'con su cuenta') : '', ok:!!aut,
             falta:(r.estado === 'rechazado' ? 'Rechazado' : (r.estado === 'observado' ? 'Observado' : (r.estado === 'anulado' ? 'Anulado' : 'Falta autorizar'))) });
    ruta(r).forEach(function(p){
      var v = visto(r, p.k);
      L.push({ k:p.k, t:p.t || '', extra:true, paso:p, n:v ? v.n || '' : (p.n || ''), c:'', f:v ? v.f || null : null, cuando:v ? cuando(v.t) : '',
               como:v ? comoTx(v) : '', ok:!!v, papel:!!(v && v.como === 'papel'), nota:(v && v.nota) || '', falta:'Falta firmar' });
    });
    return L;
  }
  /* el enlace de UNA firma: el gerente lo abre y firma en su casillero, sin cuenta */
  function enlaceFirma(r, p){ return enlace(r && r.token) + ((p && p.x) ? '&f=' + encodeURIComponent(p.x) : ''); }
  function dma(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
  function dos(n){ return ('0' + n).slice(-2); }
  function hora(iso){ try{ var d = new Date(iso); if(isNaN(d)) return ''; return dos(d.getHours()) + ':' + dos(d.getMinutes()); }catch(_e){ return ''; } }
  function cuando(iso){ if(!iso) return ''; try{ var d = new Date(iso); if(isNaN(d)) return ''; return dos(d.getDate()) + '/' + dos(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + hora(iso); }catch(_e){ return ''; } }
  function isoDe(d){ return d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate()); }
  function fechaMas(iso, n){ var p = String(iso).split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return isoDe(d); }
  function diasEntre(a, b){ var x = String(a).split('-'), y = String(b).split('-'); return Math.round((new Date(+y[0], +y[1] - 1, +y[2]) - new Date(+x[0], +x[1] - 1, +x[2])) / 86400000); }
  /* un número como se lee: 12 · 1,5 · 0,25 */
  function num(v){ var n = Math.round((+v || 0) * 100) / 100; return String(n).replace('.', ','); }
  function llave(d, u){
    var t = String(d || '').toLowerCase(); try{ t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(_n){}
    return t.replace(/\s+/g, ' ').trim() + '|' + String(u || 'und').toLowerCase().trim();
  }
  function unidadDe(u){ var t = String(u || '').trim().toLowerCase(); return t === 'und' || t === 'unidad' || t === 'unid' || t === 'uni' || !t ? 'und' : t; }
  /* las cantidades: lo pedido, lo que se autorizó (si no fue todo) y lo que llegó */
  function cantAut(r, i){ var c = r && r.res && r.res.cant; return (Array.isArray(c) && c[i] !== undefined && c[i] !== null) ? +c[i] : ((r && r.estado !== 'enviado' && r.estado !== 'observado' && r.estado !== 'rechazado' && r.estado !== 'anulado') ? +((r.items[i] || {}).c) : null); }
  function cantRec(r, i){ var c = r && r.aten && r.aten.cant; return (Array.isArray(c) && c[i] !== undefined && c[i] !== null) ? +c[i] : ((r && r.estado === 'atendido') ? cantAut(r, i) : null); }
  function totales(r){
    var o = { lineas:0, pedido:0 };
    ((r && r.items) || []).forEach(function(x){ o.lineas++; o.pedido += (+x.c || 0); });
    return o;
  }
  /* cuánto demoró en resolverse (en horas), si ya se resolvió */
  function demora(r){
    if(!r || !r.res || !r.res.t || !r.creado) return null;
    var h = (new Date(r.res.t) - new Date(r.creado)) / 3600000;
    return isNaN(h) || h < 0 ? null : h;
  }
  function demoraTxt(h){
    if(h === null || h === undefined) return '';
    if(h < 1) return 'menos de una hora';
    if(h < 48) return Math.round(h) + (Math.round(h) === 1 ? ' hora' : ' horas');
    return Math.round(h / 24) + ' días';
  }

  /* ══ EL PERSONAL QUE HUBO ═══════════════════════════════════════════
     ¿estaba trabajando ese día? t: {estatus, desde (desde cuándo está así), ingreso, hist:[{f, e, de:{e}}]}
     La misma regla de la ficha del trabajador: antes de su ingreso no estaba; su historia dice cuándo
     cesó, descansó o volvió. El que está de descanso no gasta EPP: no cuenta. */
  function _iso(v){ var t = String(v || '').slice(0, 10); return /^\d{4}-\d\d-\d\d$/.test(t) ? t : ''; }
  function _histDe(t){
    return (Array.isArray(t.hist) ? t.hist : (Array.isArray(t.historial) ? t.historial : [])).filter(function(e){ return e && _iso(e.f); })
      .sort(function(a, b){ return a.f < b.f ? -1 : (a.f > b.f ? 1 : ((a.t || 0) - (b.t || 0))); });
  }
  function _activo(t, l, dia){
    var ing = _iso(t.ingreso);
    if(ing && dia < ing) return false;
    var e = l.length ? ((l[0].de && l[0].de.e) || 'activo') : (t.estatus || 'activo');
    var d0 = _iso(t.desde || t.estatusDesde || t.estatus_desde);
    if(!l.length && e !== 'activo' && d0 && dia < d0) e = 'activo';
    for(var i = 0; i < l.length; i++) if(l[i].f <= dia) e = l[i].e || 'activo';
    return e === 'activo';
  }
  function activoEn(t, dia){ return !!t && _activo(t, _histDe(t), String(dia).slice(0, 10)); }
  /* cuántos hubo cada día entre dos fechas: {dias, pd (días-trabajador), prom, min, max, ini, fin, entraron, salieron, sinIng, n} */
  function dotacion(trabs, desde, hasta){
    var L = (trabs || []).filter(function(t){ return t && typeof t === 'object'; });
    if(!L.length) return null;
    var dias = Math.max(1, diasEntre(desde, hasta) + 1), D = [], cta = [], i, j;
    for(i = 0; i < dias; i++){ D.push(fechaMas(desde, i)); cta.push(0); }
    var entraron = 0, salieron = 0, sinIng = 0;
    for(j = 0; j < L.length; j++){
      var t = L[j], l = _histDe(t), a0 = false, a1 = false, alguna = false;
      for(i = 0; i < dias; i++){
        var on = _activo(t, l, D[i]);
        if(on){ cta[i]++; alguna = true; }
        if(i === 0) a0 = on; if(i === dias - 1) a1 = on;
      }
      if(alguna && !a0) entraron++;
      if(alguna && !a1) salieron++;
      if(a1 && !_iso(t.ingreso)) sinIng++;
    }
    var pd = 0, min = cta[0], max = 0;
    cta.forEach(function(n){ pd += n; if(n < min) min = n; if(n > max) max = n; });
    return { dias:dias, pd:pd, prom:pd / dias, min:min, max:max, ini:cta[0], fin:cta[dias - 1], entraron:entraron, salieron:salieron, sinIng:sinIng, n:L.length };
  }

  /* ══ LA CUENTA DEL CONSUMO ══════════════════════════════════════════
     entregas: [{epp, unidad, cant, fecha:'AAAA-MM-DD', tipo:'N'|'C'|'P', trab}] (el kardex, sin firmas)
     op: { hoy, dias (la ventana: 30, 60 o 90), horizonte (para cuántos días se pide: 7, 15 o 30),
           holgura (0 a 1), trab (trabajadores hoy), previstos (los que va a haber hasta el próximo pedido),
           modo ('todo' | 'reposicion'), nuevos (personal que va a ingresar: se le suma su kit, en «reposición»),
           salen (los que van a salir: solo queda anotado), stock:{llave: cantidad en almacén},
           plazo (días que demora en llegar el pedido), trabajadores:[…] (el padrón, para saber cuántos hubo cada día),
           camino:{llave: cantidad autorizada en otros pedidos que todavía no llega} }
     Dos formas de contar:
       · «todo»: todo lo que salió en la ventana, por trabajador. Sirve cuando recién se empieza a anotar.
       · «reposicion»: lo que se repone (cambios, pérdidas y las segundas entregas del mismo EPP al mismo
         trabajador, aunque se hayan anotado como «nuevo»), más el kit de cada trabajador que va a ingresar.
     EL PERSONAL (05/10/2026): lo que salió se divide entre los días-trabajador que hubo en la ventana (con el
     padrón: ingresos, ceses y descansos; sin padrón, los de hoy por los días) y se multiplica por los que va a
     haber. EL PLAZO: se pide para la espera más el periodo, porque mientras llega la obra sigue gastando.
     Nada se inventa: sin entregas en la ventana no hay sugerencia. */
  function consumo(entregas, op){
    op = op || {};
    var hoy = String(op.hoy || isoDe(new Date())).slice(0, 10);
    var ventana = +op.dias || 30, H = +op.horizonte || 30;
    var holgura = Math.max(0, Math.min(1, op.holgura === undefined ? 0.15 : +op.holgura || 0));
    var plazo = Math.max(0, Math.min(60, Math.round(+op.plazo || 0)));
    var modo = op.modo === 'reposicion' ? 'reposicion' : 'todo';
    var nuevos = modo === 'reposicion' ? Math.max(0, Math.round(+op.nuevos || 0)) : 0;
    var L = (entregas || []).filter(function(k){ return k && String(k.epp || '').trim() && /^\d{4}-\d\d-\d\d/.test(String(k.fecha || '')) && String(k.fecha).slice(0, 10) <= hoy; });
    /* la ventana no empieza antes de la primera entrega anotada: con 12 días de historia, se cuenta sobre 12 */
    var primera = L.reduce(function(a, k){ var f = String(k.fecha).slice(0, 10); return (!a || f < a) ? f : a; }, '');
    var desde = fechaMas(hoy, -(ventana - 1));
    if(primera && primera > desde) desde = primera;
    var D = Math.max(1, diasEntre(desde, hoy) + 1);
    /* la primera entrega de cada EPP a cada trabajador es su dotación; lo que recibe después es reposición */
    var deCada = {};
    L.forEach(function(k){
      if(!k.trab) return;
      var id = k.trab + '\n' + llave(k.epp, unidadDe(k.unidad)), f = String(k.fecha).slice(0, 10);
      if(!deCada[id] || f < deCada[id]) deCada[id] = f;
    });
    function esDotacion(k){
      if(k.tipo === 'C' || k.tipo === 'P') return false;
      if(!k.trab) return true;
      return deCada[k.trab + '\n' + llave(k.epp, unidadDe(k.unidad))] === String(k.fecha).slice(0, 10);
    }
    var enV = L.filter(function(k){ return String(k.fecha).slice(0, 10) >= desde; });
    var gente = {}, m = {}, kit = {}, genteN = {};
    /* el kit de ingreso sale de TODA la historia: lo que recibió, en promedio, cada trabajador en su primera entrega */
    L.forEach(function(k){
      if(!esDotacion(k)) return;
      var q = llave(k.epp, unidadDe(k.unidad));
      kit[q] = (kit[q] || 0) + (parseFloat(k.cant) || 1);
      if(k.trab) genteN[k.trab] = 1;
    });
    var nGenteN = Object.keys(genteN).length;
    enV.forEach(function(k){
      var u = unidadDe(k.unidad), q = llave(k.epp, u), c = parseFloat(k.cant) || 1;
      if(!m[q]) m[q] = { k:q, d:String(k.epp).trim(), u:u, total:0, nuevo:0, cambio:0, perdida:0, dotacion:0, repos:0, entregas:0, g:{} };
      var x = m[q];
      x.total += c; x.entregas++;
      if(k.tipo === 'C') x.cambio += c; else if(k.tipo === 'P') x.perdida += c; else x.nuevo += c;
      if(esDotacion(k)) x.dotacion += c; else x.repos += c;
      if(k.trab){ x.g[k.trab] = 1; gente[k.trab] = 1; }
    });
    var nGente = Object.keys(gente).length;
    /* el personal: del padrón si lo hay (y no se queda corto frente a quienes recibieron EPP); si no, los de hoy */
    var dot = (op.trabajadores && op.trabajadores.length) ? dotacion(op.trabajadores, desde, hoy) : null;
    if(dot && (!(dot.pd > 0) || dot.max * 2 < nGente)) dot = null;
    var W = Math.max(1, Math.round(+op.trab || 0) || (dot ? dot.fin : 0) || nGente || 1);
    var Wp = Math.max(1, Math.round(+op.previstos || 0) || W);
    var pd = dot ? dot.pd : W * D, prom = pd / D;
    var stock = op.stock || {}, camino = op.camino || {}, cubre = plazo + H;
    var o = { D:D, H:H, W:W, Wp:Wp, holgura:holgura, modo:modo, nuevos:nuevos, plazo:plazo, cubre:cubre, prom:prom, padron:!!dot };
    var filas = Object.keys(m).map(function(q){
      var x = m[q];
      x.personas = Object.keys(x.g).length; delete x.g;
      x.repetida = Math.max(0, x.repos - x.cambio - x.perdida);       /* anotadas «nuevo», pero ya lo tenía */
      x.porTrabMes = x.total / pd * 30;
      x.gasto = modo === 'reposicion' ? x.repos : x.total;
      x.rTrabMes = x.gasto / pd * 30;
      /* cada paso se redondea hacia arriba (no se pide medio par): así la cuenta del sustento se puede rehacer a mano */
      x.base = Math.ceil(x.gasto / pd * Wp * cubre - 1e-9);
      x.kitUno = (modo === 'reposicion' && nGenteN) ? (kit[q] || 0) / nGenteN : 0;
      x.kit = (modo === 'reposicion' && nuevos) ? Math.ceil(nuevos * x.kitUno - 1e-9) : 0;
      x.conHolgura = Math.ceil((x.base + x.kit) * (1 + holgura) - 1e-9);
      x.stock = Math.max(0, +stock[q] || 0);
      x.camino = Math.max(0, +camino[q] || 0);
      x.pedir = Math.max(0, Math.ceil(x.conHolgura - x.stock - x.camino - 1e-9));
      x.diario = x.gasto / pd * Wp;
      /* ¿lo que hay alcanza hasta que llegue el pedido? Solo si se dijo cuánto hay en almacén */
      x.stockDicho = Object.prototype.hasOwnProperty.call(stock, q);
      x.dura = (x.stockDicho && x.diario > 0) ? Math.floor(x.stock / x.diario + 1e-9) : null;
      x.corto = plazo > 0 && x.dura !== null && x.dura < plazo;
      x.s = sustento(x, o);
      return x;
    }).sort(function(a, b){ return b.total - a.total || a.d.localeCompare(b.d, 'es'); });
    var un = 0, per = 0, nu = 0, ca = 0, rep = 0, dt = 0, rpt = 0;
    filas.forEach(function(x){ un += x.total; per += x.perdida; nu += x.nuevo; ca += x.cambio; rep += x.repos; dt += x.dotacion; rpt += x.repetida; });
    return { hoy:hoy, desde:desde, hasta:hoy, dias:D, ventana:ventana, horizonte:H, holgura:holgura, modo:modo, nuevos:nuevos, trab:W, previstos:Wp,
             plazo:plazo, cubre:cubre, llega:fechaMas(hoy, plazo), cubreHasta:fechaMas(hoy, cubre), salen:Math.max(0, Math.round(+op.salen || 0)),
             pd:pd, prom:prom, dot:dot, padron:!!dot,
             entregas:enV.length, unidades:un, nuevo:nu, cambio:ca, perdida:per, repos:rep, dotacion:dt, repetida:rpt, personas:nGente, historia:L.length,
             cortos:filas.filter(function(x){ return x.corto; }), filas:filas };
  }
  function _gente(n){ var v = Math.round(n * 10) / 10; return v >= 10 ? String(Math.round(v)) : num(v); }
  /* el sustento de una línea, en una frase que el jefe entiende */
  function sustento(x, o){
    var u = x.u, t;
    var para = 'Para ' + (o.plazo ? o.cubre + ' días (' + o.plazo + ' de espera + ' + o.H + ')' : o.H + ' días') +
               ((o.Wp !== o.W || (o.padron && _gente(o.prom) !== String(o.Wp))) ? ' con ' + o.Wp + ' trabajadores' : '') + ': ' + num(x.base) + '.';
    if(o.modo === 'reposicion' && !x.repos && o.padron){
      /* en esos días solo salió como primera dotación: no hay reposición que contar (y no se llena de ceros) */
      t = 'En ' + o.D + ' días solo salió como primera dotación (' + num(x.dotacion) + ' ' + u + '): no hay reposición que contar.';
      if(o.nuevos) t += ' Personal nuevo: ' + o.nuevos + ' × ' + num(x.kitUno) + ' = ' + num(x.kit) + '.';
      if(o.holgura && x.conHolgura) t += ' Con ' + Math.round(o.holgura * 100) + ' % de holgura: ' + num(x.conHolgura) + '.';
      if((x.stock || x.camino) && x.conHolgura) t += ' Menos ' + [x.stock ? num(x.stock) + ' en almacén' : '', x.camino ? num(x.camino) + ' por llegar' : ''].filter(Boolean).join(' y ') + ': ' + num(x.pedir) + '.';
      return t;
    }
    if(o.modo === 'reposicion'){
      t = 'Reposición: ' + num(x.repos) + ' ' + u + ' en ' + o.D + ' días (cambio ' + num(x.cambio) + ', pérdida ' + num(x.perdida) +
          (x.repetida ? ', otra entrega al mismo trabajador ' + num(x.repetida) : '') + ')' +
          (o.padron ? ', con ' + _gente(o.prom) + ' trabajadores en promedio: ' + num(x.rTrabMes) + ' por trabajador al mes' : '') + '. ' + para;
      if(o.nuevos) t += ' Personal nuevo: ' + o.nuevos + ' × ' + num(x.kitUno) + ' = ' + num(x.kit) + '.';
    } else {
      t = 'Consumo: ' + num(x.total) + ' ' + u + ' en ' + o.D + ' días (' + num(x.porTrabMes) + ' por trabajador al mes, con ' +
          (o.padron ? _gente(o.prom) + ' trabajadores en promedio' : o.W + ' trabajadores') + '). ' + para;
    }
    if(o.holgura) t += ' Con ' + Math.round(o.holgura * 100) + ' % de holgura: ' + num(x.conHolgura) + '.';
    if(x.stock || x.camino) t += ' Menos ' + [x.stock ? num(x.stock) + ' en almacén' : '', x.camino ? num(x.camino) + ' por llegar' : ''].filter(Boolean).join(' y ') + ': ' + num(x.pedir) + '.';
    return t;
  }
  /* lo que ya viene: lo autorizado en otros pedidos que todavía no llegó, por línea.
     Los que esperan autorización no se descuentan (pueden cambiar): se nombran, para que se sepa. */
  function enCamino(L, salvo){
    var m = {}, de = {}, espera = [];
    (L || []).forEach(function(r){
      if(!r || (salvo && r.id === salvo)) return;
      if(r.estado === 'enviado' && r.clase === 'epp'){ espera.push(r.numero || ''); return; }
      if(r.estado !== 'autorizado') return;
      (r.items || []).forEach(function(it, i){
        var a = cantAut(r, i), rc = cantRec(r, i), falta = (a === null ? +it.c || 0 : a) - (rc === null ? 0 : rc);
        if(!(falta > 0)) return;
        var q = llave(it.d, unidadDe(it.u));
        m[q] = Math.round(((m[q] || 0) + falta) * 100) / 100;
        (de[q] = de[q] || []).push(r.numero || '');
      });
    });
    return { m:m, de:de, espera:espera };
  }
  /* lo que se guarda con el requerimiento: con qué se calculó, el personal que hubo y cuánto salía por trabajador
     al mes de cada EPP (para comparar después, por etapa). extra: {etapa} */
  function resumenAnalisis(A, extra){
    if(!A) return null;
    extra = extra || {};
    var r2 = function(v){ return Math.round((+v || 0) * 100) / 100; };
    var o = { v:2, dias:A.dias, desde:A.desde, hasta:A.hasta, trab:A.trab, previstos:A.previstos, horizonte:A.horizonte, holgura:A.holgura, modo:A.modo, nuevos:A.nuevos,
              entregas:A.entregas, unidades:A.unidades, nuevo:A.nuevo, cambio:A.cambio, perdida:A.perdida, personas:A.personas,
              top:A.filas.slice(0, 5).map(function(x){ return { d:x.d, u:x.u, t:x.total }; }) };
    if(A.plazo) o.plazo = A.plazo;
    if(A.salen) o.salen = A.salen;
    if(A.repetida) o.rep = A.repetida;
    var et = String(extra.etapa || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    if(et) o.etapa = et;
    o.dot = { pd:r2(A.pd), prom:r2(A.prom), padron:A.padron ? 1 : 0 };
    if(A.dot){ o.dot.ini = A.dot.ini; o.dot.min = A.dot.min; o.dot.max = A.dot.max; if(A.dot.entraron) o.dot.ent = A.dot.entraron; if(A.dot.salieron) o.dot.sal = A.dot.salieron; if(A.dot.sinIng) o.dot.sinIng = A.dot.sinIng; }
    o.lin = A.filas.slice(0, 30).map(function(x){
      var l = { d:x.d, u:x.u, t:x.total, g:r2(x.gasto), r:r2(x.rTrabMes), p:x.pedir };
      if(x.kitUno) l.k = r2(x.kitUno);
      return l;
    });
    return o;
  }
  /* el análisis, en renglones para leer (pantalla, PDF y Excel) */
  function analisisTxt(a){
    if(!a || !a.dias) return [];
    var l = [], d = a.dot || null;
    l.push('Del ' + dma(a.desde) + ' al ' + dma(a.hasta) + ' (' + a.dias + ' días) salieron ' + num(a.unidades) + ' unidades de EPP en ' + a.entregas + (a.entregas === 1 ? ' entrega' : ' entregas') +
           (a.personas ? ' a ' + a.personas + (a.personas === 1 ? ' trabajador' : ' trabajadores') : '') + '.');
    if(a.unidades) l.push('Por motivo: ' + num(a.nuevo || 0) + ' nuevo, ' + num(a.cambio || 0) + ' cambio por desgaste, ' + num(a.perdida || 0) + ' pérdida' +
           (a.perdida && a.unidades ? ' (' + Math.round(a.perdida / a.unidades * 100) + ' %)' : '') + '.' +
           (a.rep ? ' De lo anotado como nuevo, ' + num(a.rep) + ' fueron otra entrega al mismo trabajador: se cuentan como reposición.' : ''));
    if(a.top && a.top.length) l.push('Lo que más sale: ' + a.top.slice(0, 3).map(function(x){ return x.d + ' (' + num(x.t) + ' ' + x.u + ')'; }).join(', ') + '.');
    /* el personal que tuvo, tiene y tendrá (cuando sale del padrón) */
    if(d && d.padron && d.ini !== undefined){
      var mov = [a.nuevos ? 'ingresan ' + a.nuevos : '', a.salen ? 'salen ' + a.salen : ''].filter(Boolean).join(', ');
      l.push('Personal: empezó esos días con ' + d.ini + ', hoy tiene ' + a.trab + ' (' + _gente(d.prom) + ' en promedio' + ((d.ent || d.sal) ? '; ingresaron ' + (d.ent || 0) + ' y salieron ' + (d.sal || 0) : '') + ')' +
             ((a.previstos && a.previstos !== a.trab) ? ' y va a tener ' + a.previstos + ' hasta el próximo pedido' + (mov ? ' (' + mov + ')' : '') : ' y se mantiene hasta el próximo pedido') + '.' +
             (d.sinIng ? ' ' + d.sinIng + (d.sinIng === 1 ? ' no tiene' : ' no tienen') + ' fecha de ingreso: se ' + (d.sinIng === 1 ? 'cuenta' : 'cuentan') + ' todo el periodo.' : ''));
    }
    l.push('Se pide para ' + a.horizonte + ' días' + (a.plazo ? ' más ' + a.plazo + ' de espera hasta que llegue' : '') +
           (a.previstos && a.previstos !== a.trab ? ', con ' + a.previstos + ' trabajadores (hoy hay ' + a.trab + ')' : ', con ' + a.trab + ' trabajadores') +
           (a.holgura ? ' y ' + Math.round(a.holgura * 100) + ' % de holgura por cualquier eventualidad' : '') +
           (a.modo === 'reposicion' ? '. Se cuenta solo la reposición (cambios y pérdidas)' + (a.nuevos ? ', más el kit de ' + a.nuevos + (a.nuevos === 1 ? ' trabajador nuevo' : ' trabajadores nuevos') : '') : '') + '.');
    if(a.etapa) l.push('Etapa de la obra: ' + a.etapa + '.');
    return l;
  }
  /* ══ LO APRENDIDO: cuánto salía por trabajador al mes, por etapa ═════
     De los pedidos que guardaron su análisis (no los anulados ni los rechazados): por etapa, cuántos pedidos,
     de cuándo a cuándo, cuánta gente en promedio y, de cada EPP, lo que salió por trabajador al mes. */
  function _valeAnalisis(r){ var a = r && r.analisis; return !!(a && a.v >= 2 && Array.isArray(a.lin) && a.dot && a.dot.pd > 0 && r.estado !== 'anulado' && r.estado !== 'rechazado'); }
  function aprendido(L){
    var G = {}, orden = [];
    (L || []).forEach(function(r){
      if(!_valeAnalisis(r)) return;
      var a = r.analisis, pd = +a.dot.pd, n = String(a.etapa || '').trim(), k = n.toLowerCase() || '\u0000';
      var g = G[k];
      if(!g){ g = G[k] = { etapa:n, pedidos:0, desde:a.desde, hasta:a.hasta, pd:0, dias:0, m:{}, numeros:[] }; orden.push(g); }
      g.pedidos++; g.pd += pd; g.dias += (+a.dias || 0); g.numeros.push(r.numero || '');
      if(a.desde && (!g.desde || a.desde < g.desde)) g.desde = a.desde;
      if(a.hasta && (!g.hasta || a.hasta > g.hasta)) g.hasta = a.hasta;
      a.lin.forEach(function(l){ var q = llave(l.d, l.u), x = g.m[q] || (g.m[q] = { k:q, d:l.d, u:unidadDe(l.u), g:0 }); x.g += (+l.g || 0); });
    });
    orden.forEach(function(g){
      g.prom = g.dias ? g.pd / g.dias : 0;
      g.lin = Object.keys(g.m).map(function(q){ var x = g.m[q]; return { k:x.k, d:x.d, u:x.u, r:g.pd ? x.g / g.pd * 30 : 0 }; }).sort(function(a, b){ return b.r - a.r || a.d.localeCompare(b.d, 'es'); });
      delete g.m;
    });
    return orden.sort(function(a, b){ return String(a.hasta) < String(b.hasta) ? -1 : (String(a.hasta) > String(b.hasta) ? 1 : 0); });
  }
  /* lo que salía ANTES de una línea: el último pedido que la analizó → {r, etapa, numero, hasta} */
  function antes(L, q, salvo){
    var m = null;
    (L || []).forEach(function(r){
      if(!_valeAnalisis(r) || (salvo && r.id === salvo)) return;
      var a = r.analisis, l = a.lin.filter(function(x){ return llave(x.d, x.u) === q; })[0];
      if(!l) return;
      if(!m || String(a.hasta) > String(m.hasta) || (String(a.hasta) === String(m.hasta) && String(r.numero) > String(m.numero))) m = { r:+l.r || 0, etapa:a.etapa || '', numero:r.numero || '', hasta:a.hasta };
    });
    return m;
  }
  /* la etapa en que va la obra: la del último pedido que la dijo */
  function etapaActual(L){
    var m = null;
    (L || []).forEach(function(r){ var a = r && r.analisis; if(a && a.etapa && r.estado !== 'anulado' && (!m || String(r.creado || '') > String(m.c))) m = { e:a.etapa, c:String(r.creado || '') }; });
    return m ? m.e : '';
  }
  /* el semáforo de una línea contra lo que sugiere el consumo: { c: ok|med|neu, t } */
  function semaforo(pedido, sugerido){
    pedido = +pedido || 0; sugerido = +sugerido || 0;
    if(!sugerido) return { c:'neu', t:'Sin consumo anotado para comparar' };
    var d = (pedido - sugerido) / sugerido;
    if(d > 0.25) return { c:'med', t:'Pides ' + Math.round(d * 100) + '\u00a0% más que lo que sale del consumo: di por qué en el motivo' };
    if(d < -0.25) return { c:'med', t:'Pides ' + Math.round(-d * 100) + '\u00a0% menos que lo que sale del consumo' };
    return { c:'ok', t:'En línea con el consumo' };
  }
  /* para cuántos días alcanza lo pedido, al ritmo del consumo */
  function alcanza(pedido, diario){ return (diario > 0 && pedido > 0) ? Math.floor(pedido / diario) : null; }

  /* las líneas, limpias, como las acepta el servidor (o null si alguna no vale) */
  function limpiarItems(items){
    var out = [];
    for(var i = 0; i < (items || []).length; i++){
      var x = items[i] || {}, d = String(x.d || '').replace(/\s+/g, ' ').trim().slice(0, 160), c = parseFloat(String(x.c === undefined ? '' : x.c).replace(',', '.'));
      if(!d && !(c > 0)) continue;                         /* una línea vacía se salta */
      if(d.length < 2 || !(c > 0) || c > 1000000) return null;
      var o = { d:d, u:unidadDe(x.u).slice(0, 20), c:Math.round(c * 100) / 100 };
      var e = String(x.e || '').trim().slice(0, 160), s = String(x.s || '').trim().slice(0, 400);
      if(e) o.e = e; if(s) o.s = s;
      out.push(o);
    }
    return (out.length >= 1 && out.length <= 80) ? out : null;
  }
  /* lo que se le manda al jefe por WhatsApp o correo */
  function mensaje(r){
    var C = clase(r.clase), t = totales(r);
    return 'Requerimiento ' + (r.numero || '') + ' · ' + C.n + (urge(r) ? ' · URGENTE' : '') + '\n' +
           (r.obra ? r.obra + '\n' : '') + t.lineas + (t.lineas === 1 ? ' línea' : ' líneas') + (r.para ? ' · se necesita para el ' + dma(r.para) : '') + '\n' +
           'Pide: ' + ((r.por || {}).n || '') + '\n' + (r.token ? 'Verlo' + (r.por_enlace ? ' y autorizarlo' : '') + ': ' + enlace(r.token) : '');
  }

  /* lo que se le manda a quien le toca firmar (gerente de proyecto, gerente general…): por correo o por WhatsApp */
  function mensajeFirma(r, p){
    var C = clase(r.clase), t = totales(r), aut = (r.res && r.res.accion === 'autorizar') ? r.res : null;
    return 'Requerimiento ' + (r.numero || '') + ' · ' + C.n + (urge(r) ? ' · URGENTE' : '') + '\n' +
           (r.obra ? r.obra + '\n' : '') + t.lineas + (t.lineas === 1 ? ' línea' : ' líneas') + (r.para ? ' · se necesita para el ' + dma(r.para) : '') + '\n' +
           'Solicita: ' + ((r.por || {}).n || '') + (aut ? '\nAprobó por Seguridad: ' + (aut.n || '') : '') + '\n' +
           'Falta su firma' + (p && p.t ? ' como ' + p.t : '') + '.' + (r.token ? '\nVerlo y firmarlo (sin cuenta): ' + enlaceFirma(r, p) : '');
  }
  /* el correo ya escrito: {para, asunto, cuerpo, href} (se abre en el programa de correo de quien lo envía) */
  function correo(r, p){
    var para = String((p && p.m) || '').trim(), n = String((p && p.n) || '').trim();
    var asunto = 'Requerimiento ' + (r.numero || '') + ' · ' + clase(r.clase).n + ' · para su firma';
    var cuerpo = (n ? 'Estimado(a) ' + n + ':\n\n' : 'Buenos días:\n\n') + 'Le envío este requerimiento para su firma.\n\n' + mensajeFirma(r, p) +
                 '\n\nAl abrir el enlace ve el pedido completo, lo puede bajar en PDF o en Excel y firma en su casillero.\n';
    return { para:para, asunto:asunto, cuerpo:cuerpo, href:'mailto:' + encodeURIComponent(para).replace(/%40/g, '@') + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo) };
  }

  /* una firma en el PDF: el trazo como línea de verdad */
  function firmaPDF(doc, tr, x, y, w, h){
    if(!tr || !tr.p || !tr.p.length) return;
    var th = tr.h || 380, k = Math.min(w / 1000, h / th), ox = x + (w - 1000 * k) / 2, oy = y + (h - th * k) / 2;
    doc.setDrawColor(16, 24, 32); doc.setLineWidth(0.9);
    try{ doc.setLineCap('round'); doc.setLineJoin('round'); }catch(_c){}
    tr.p.forEach(function(s){ for(var i = 2; i + 1 < s.length; i += 2) doc.line(ox + s[i - 2] * k, oy + s[i - 1] * k, ox + s[i] * k, oy + s[i + 1] * k); });
    try{ doc.setLineCap('butt'); doc.setLineJoin('miter'); }catch(_d){}
  }
  /* ── el PDF del requerimiento ───────────────────────────────────────
     r: como lo devuelve el servidor ({numero, obra, fecha, clase, …}) · C: {tx(texto), sello:[…]} */
  function pdf(r, C){
    C = C || {};
    var tx = C.tx || function(z){ return z; };
    var doc = new jspdf.jsPDF({ unit:'pt', format:'a4' });
    var W = 595.28, H = 841.89, M = 38, y = 0, K = clase(r.clase), E = estado(r);
    function pie(){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(140, 146, 152);
      doc.text(tx('Generado con OBRASST el') + ' ' + dma(isoDe(new Date())) + ' · ' + tx('La app deja constancia de quién dijo ser, a qué hora firmó y desde dónde.'), M, H - 22);
    }
    function salto(alto){ if(y + alto > H - 50){ pie(); doc.addPage(); y = 50; return true; } return false; }
    doc.setFillColor(11, 42, 58); doc.rect(0, 0, W, 92, 'F');
    doc.setTextColor(245, 183, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('OBRASST · ' + tx(K.t), M, 30);
    if(C.sello && C.sello.length){ doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(190, 205, 215); doc.text(C.sello.join('   ·   '), W - M, 30, { align:'right' }); }
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text('N.° ' + String(r.numero || ''), M, 58);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(200, 215, 225);
    doc.text(doc.splitTextToSize(String(r.obra || ''), W - 2 * M - 180)[0] || '', M, 76);
    doc.setFillColor(E.rgb[0], E.rgb[1], E.rgb[2]); doc.roundedRect(W - M - 150, 44, 150, 26, 5, 5, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
    doc.text(String(tx(E.n)).toUpperCase(), W - M - 75, 61, { align:'center' });
    if(urge(r)){ doc.setFontSize(8.5); doc.setTextColor(255, 170, 160); doc.text(String(tx('URGENTE')), W - M - 75, 82, { align:'center' }); }
    y = 112;
    /* los datos, en dos columnas */
    var datos = [
      [tx('Fecha'), dma(r.fecha)], [tx('Se necesita para'), r.para ? dma(r.para) : tx('Sin fecha')],
      [tx('Ubicación'), r.ubicacion || '—'], [tx('Prioridad'), tx(r.prioridad === 'urgente' ? 'Urgente' : 'Normal')],
      [tx('Solicita'), [(r.por || {}).n, (r.por || {}).c].filter(Boolean).join(' · ')],
      [tx(r.res && r.res.accion === 'autorizar' ? titulo2(r) : 'Enviado a'), (r.res && r.res.accion === 'autorizar') ? [r.res.n, r.res.c].filter(Boolean).join(' · ') : ([(r.a || {}).n, (r.a || {}).c].filter(Boolean).join(' · ') || '—')]
    ];
    var cw = (W - 2 * M) / 2;
    datos.forEach(function(d, i){
      var x = M + (i % 2) * cw, yy = y + Math.floor(i / 2) * 28;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(110, 120, 128); doc.text(String(d[0]).toUpperCase(), x, yy);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(30, 36, 42);
      doc.text(doc.splitTextToSize(String(d[1] || '—'), cw - 14)[0] || '—', x, yy + 12);
    });
    y += Math.ceil(datos.length / 2) * 28 + 6;
    /* las líneas */
    var hayAut = !!(r.res && Array.isArray(r.res.cant)), hayRec = !!(r.aten && Array.isArray(r.aten.cant));
    var cols = [{ t:'N.°', w:24, a:'left' }, { t:'Descripción', w:0, a:'left' }, { t:'Unidad', w:50, a:'left' }, { t:'Pedido', w:50, a:'right' }];
    if(hayAut) cols.push({ t:'Autorizado', w:58, a:'right' });
    if(hayRec) cols.push({ t:'Recibido', w:52, a:'right' });
    var fijo = cols.reduce(function(a, c){ return a + c.w; }, 0);
    cols[1].w = W - 2 * M - fijo;
    function cabecera(){
      doc.setFillColor(11, 42, 58); doc.rect(M, y, W - 2 * M, 18, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
      var x = M;
      cols.forEach(function(c){ doc.text(String(tx(c.t)).toUpperCase(), c.a === 'right' ? x + c.w - 6 : x + 6, y + 12, { align:c.a }); x += c.w; });
      y += 18;
    }
    cabecera();
    (r.items || []).forEach(function(it, i){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      var d = doc.splitTextToSize(String(it.d || ''), cols[1].w - 12);
      doc.setFontSize(8);
      var e = it.e ? doc.splitTextToSize(String(it.e), cols[1].w - 12) : [], s = it.s ? doc.splitTextToSize(String(it.s), cols[1].w - 12) : [];
      var alto = d.length * 11.5 + e.length * 9.5 + s.length * 9.5 + 9;
      if(salto(alto + 4)) cabecera();
      if(i % 2 === 1){ doc.setFillColor(246, 248, 250); doc.rect(M, y, W - 2 * M, alto, 'F'); }
      var x = M, yy = y + 12;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(110, 120, 128); doc.text(String(i + 1), x + 6, yy); x += cols[0].w;
      doc.setTextColor(30, 36, 42); doc.text(d, x + 6, yy);
      var y2 = yy + d.length * 11.5 - 2;
      if(e.length){ doc.setFontSize(8); doc.setTextColor(70, 80, 88); doc.text(e, x + 6, y2 + 1); y2 += e.length * 9.5; }
      if(s.length){ doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(110, 120, 128); doc.text(s, x + 6, y2 + 1); doc.setFont('helvetica', 'normal'); }
      x += cols[1].w;
      doc.setFontSize(9.5); doc.setTextColor(30, 36, 42); doc.text(String(it.u || 'und'), x + 6, yy); x += cols[2].w;
      doc.setFont('helvetica', 'bold'); doc.text(num(it.c), x + cols[3].w - 6, yy, { align:'right' }); x += cols[3].w;
      if(hayAut){ var a = cantAut(r, i); doc.setTextColor(18, 122, 71); doc.text(a === null ? '' : num(a), x + cols[4].w - 6, yy, { align:'right' }); x += cols[4].w; }
      if(hayRec){ var rc = cantRec(r, i), ci = hayAut ? 5 : 4; doc.setTextColor(30, 36, 42); doc.text(rc === null ? '' : num(rc), x + cols[ci].w - 6, yy, { align:'right' }); }
      doc.setFont('helvetica', 'normal');
      y += alto;
      doc.setDrawColor(226, 232, 236); doc.setLineWidth(0.5); doc.line(M, y, W - M, y);
    });
    y += 12;
    function bloque(titulo, lineas, color){
      if(!lineas || !lineas.length) return;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      var t = []; lineas.forEach(function(l){ t = t.concat(doc.splitTextToSize(String(l), W - 2 * M)); });
      salto(t.length * 11.5 + 24);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(11, 42, 58); doc.text(String(tx(titulo)).toUpperCase(), M, y); y += 12;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, color || [40, 46, 52]); doc.text(t, M, y); y += t.length * 11.5 + 8;
    }
    if(r.motivo) bloque('Motivo', [r.motivo]);
    bloque('Sustento: el consumo de EPP de la obra', analisisTxt(r.analisis));
    if(r.res && r.res.nota) bloque(r.res.accion === 'autorizar' ? 'Nota de quien autoriza' : (r.res.accion === 'observar' ? 'Observación' : 'Motivo del rechazo'),
                                   [r.res.nota + ' — ' + (r.res.n || '') + (r.res.t ? ', ' + cuando(r.res.t) : '')], r.res.accion === 'autorizar' ? null : [183, 47, 43]);
    if(r.aten) bloque(r.aten.parcial ? 'Recibido en parte' : 'Recibido', [(r.aten.n || '') + (r.aten.t ? ' · ' + cuando(r.aten.t) : '') + (r.aten.nota ? ' · ' + r.aten.nota : '')]);
    /* las firmas: Solicita, Seguridad y las de la ruta de la obra. El casillero que falta firmar sale en blanco,
       con su raya: el gerente que firma el papel lo hace ahí */
    var Fs = firmantes(r), porFila = Fs.length <= 4 ? Fs.length : 3, gap = porFila > 2 ? 8 : 12;
    var fw = (W - 2 * M - gap * (porFila - 1)) / porFila, fh = porFila > 2 ? 122 : 112, nFilas = Math.ceil(Fs.length / porFila);
    salto(28 + nFilas * (fh + 8)); y += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(11, 42, 58); doc.text(String(tx('FIRMAS')), M, y); y += 8;
    /* un renglón que cabe: se achica hasta 6,5 y, si ni así, se corta */
    function cabe(t, ancho, tam, negrita){
      t = String(t || ''); doc.setFont('helvetica', negrita ? 'bold' : 'normal');
      for(var z = tam; z >= 6.5; z -= 0.5){ doc.setFontSize(z); if(doc.getTextWidth(t) <= ancho) return t; }
      return doc.splitTextToSize(t, ancho)[0] || '';
    }
    Fs.forEach(function(k, i){
      var x = M + (i % porFila) * (fw + gap), yb = y + Math.floor(i / porFila) * (fh + 8), cx = x + fw / 2, an = fw - 14;
      doc.setDrawColor(200, 208, 214); doc.setLineWidth(0.7); doc.roundedRect(x, yb, fw, fh, 5, 5, 'S');
      doc.setTextColor(110, 120, 128); doc.text(cabe(String(tx(k.t)).toUpperCase(), fw - 14, 7.5, true), x + 8, yb + 13);
      if(k.ok){
        if(k.f && k.f.p){ try{ firmaPDF(doc, k.f, x + 14, yb + 19, fw - 28, 44); }catch(_f){} }
        else { doc.setTextColor(140, 146, 152); doc.text(cabe(tx(k.papel ? 'FIRMÓ EN PAPEL' : 'FIRMADO EN OBRASST'), an, 8, true), cx, yb + 46, { align:'center' }); }
        doc.setDrawColor(170, 178, 184); doc.setLineWidth(0.5); doc.line(x + 12, yb + 67, x + fw - 12, yb + 67);
        doc.setTextColor(30, 36, 42); doc.text(cabe(k.n, an, 9, true), cx, yb + 79, { align:'center' });
        doc.setTextColor(90, 100, 108); doc.text(cabe(k.c, an, 8, false), cx, yb + 90, { align:'center' });
        doc.setTextColor(140, 146, 152);
        var det = [k.cuando, tx(k.como)].filter(Boolean).join(' · ');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
        if(doc.getTextWidth(det) <= an) doc.text(det, cx, yb + 102, { align:'center' });
        else {
          /* no entra en un renglón: la fecha arriba, y el cómo debajo (en dos renglones si el casillero es de los angostos) */
          doc.text(cabe(k.cuando, an, 7, false), cx, yb + 100, { align:'center' });
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
          doc.text(doc.splitTextToSize(String(tx(k.como)), an).slice(0, fh > 115 ? 2 : 1), cx, yb + 108, { align:'center' });
        }
      } else if(k.extra){
        /* en blanco, para firmar: su raya, y debajo quién (si la obra lo dijo) */
        doc.setDrawColor(170, 178, 184); doc.setLineWidth(0.5); doc.line(x + 12, yb + 67, x + fw - 12, yb + 67);
        if(k.n){ doc.setTextColor(60, 70, 78); doc.text(cabe(k.n, an, 9, false), cx, yb + 79, { align:'center' }); }
        doc.setTextColor(150, 156, 162); doc.text(cabe(tx('Firma y fecha'), an, 7, false), cx, yb + (k.n ? 91 : 79), { align:'center' });
      } else {
        doc.setTextColor(183, 47, 43); doc.text(cabe(String(tx(k.falta || 'Falta firmar')).toUpperCase(), an, 10, true), cx, yb + 62, { align:'center' });
      }
    });
    y += nFilas * (fh + 8) + 2;
    pie();
    return doc;
  }
  function nombreArchivo(r, ext){
    var t = 'Requerimiento ' + String((r && r.numero) || '') + ' ' + clase(r && r.clase).n;
    try{ t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(_n){}
    return t.replace(/[^A-Za-z0-9 ._-]+/g, '-').replace(/\s+/g, ' ').trim() + '.' + (ext || 'pdf');
  }

  /* ── el Excel del requerimiento ─────────────────────────────────────
     C: { firmaPNG(trazo) → Uint8Array de un PNG (o null): las firmas van dibujadas en la hoja } */
  function xlsx(r, C){
    C = C || {};
    var X = RCAP.xlsx, Cc = X.C, E = new X.Estilos(), Hoja = X.Hoja, K = clase(r.clase), Est = estado(r);
    var sTit = E.xf({ b:true, sz:15, c:Cc.petroleo }), sNum = E.xf({ b:true, sz:13, c:Cc.petroleo, h:'right' });
    var sEt = E.xf({ b:true, sz:8, c:Cc.gris }), sVal = E.xf({ sz:10, c:Cc.tinta, wrap:true });
    var sCab = E.xf({ b:true, sz:9, c:Cc.blanco, f:Cc.petroleo, h:'center', borde:true, wrap:true }), sCabI = E.xf({ b:true, sz:9, c:Cc.blanco, f:Cc.petroleo, h:'left', borde:true });
    var sTx = E.xf({ sz:9.5, c:Cc.tinta, borde:true, wrap:true }), sC = E.xf({ sz:9.5, c:Cc.tinta, h:'center', borde:true });
    var sCant = E.xf({ b:true, sz:10, c:Cc.tinta, h:'center', borde:true, fmt:'0.##' }), sAut = E.xf({ b:true, sz:10, c:Cc.okT, f:Cc.okF, h:'center', borde:true, fmt:'0.##' });
    var sSus = E.xf({ sz:8.5, c:Cc.gris, borde:true, wrap:true }), sSec = E.xf({ b:true, sz:9, c:Cc.petroleo }), sNota = E.xf({ sz:9.5, c:Cc.tinta, wrap:true });
    var sEst = E.xf({ b:true, sz:10, c:(Est.c === 'ok' ? Cc.okT : (Est.c === 'mal' ? Cc.malT : Cc.ojoT)), f:(Est.c === 'ok' ? Cc.okF : (Est.c === 'mal' ? Cc.malF : Cc.ojoF)), h:'center' });
    var sFirma = E.xf({ b:true, sz:9.5, c:Cc.tinta, h:'center' }), sFirmaC = E.xf({ sz:8.5, c:Cc.gris, h:'center' }), sPie = E.xf({ sz:8, c:Cc.grisc });
    var h = new Hoja('Requerimiento'); h.activa = true; h.pie = 'Requerimiento ' + (r.numero || '');
    [5, 34, 26, 9, 10, 11, 10, 46].forEach(function(w, i){ h.anchos[i] = w; });
    h.unir(0, 1, 5, 1, K.t, sTit); h.unir(6, 1, 7, 1, 'N.° ' + (r.numero || ''), sNum); h.altos[1] = 24;
    h.unir(0, 2, 5, 2, String(r.obra || ''), sVal); h.unir(6, 2, 7, 2, Est.n + (urge(r) ? ' · URGENTE' : ''), sEst);
    var aut = (r.res && r.res.accion === 'autorizar') ? r.res : null;
    var datos = [
      ['FECHA', dma(r.fecha), 'SE NECESITA PARA', r.para ? dma(r.para) : 'Sin fecha'],
      ['UBICACIÓN', r.ubicacion || '—', 'PRIORIDAD', r.prioridad === 'urgente' ? 'Urgente' : 'Normal'],
      ['SOLICITA', [(r.por || {}).n, (r.por || {}).c].filter(Boolean).join(' · '), aut ? titulo2(r).toUpperCase() : 'ENVIADO A', aut ? [aut.n, aut.c].filter(Boolean).join(' · ') + (aut.t ? ' · ' + cuando(aut.t) : '') : ([(r.a || {}).n, (r.a || {}).c].filter(Boolean).join(' · ') || '—')]
    ];
    var f = 4;
    datos.forEach(function(d){
      h.unir(0, f, 1, f, d[0], sEt); h.unir(2, f, 4, f, d[2], sEt); f++;
      h.unir(0, f, 1, f, d[1], sVal); h.unir(2, f, 7, f, d[3], sVal); f += 2;
    });
    var f0 = f;
    ['N.°', 'Descripción', 'Especificación', 'Unidad', 'Pedido', 'Autorizado', 'Recibido', 'Sustento'].forEach(function(c, i){ h.celda(i, f0, c, (i === 1 || i === 2 || i === 7) ? sCabI : sCab); });
    h.altos[f0] = 20; f = f0 + 1;
    (r.items || []).forEach(function(it, i){
      var a = cantAut(r, i), rc = cantRec(r, i);
      h.celda(0, f, i + 1, sC); h.celda(1, f, it.d || '', sTx); h.celda(2, f, it.e || '', sTx); h.celda(3, f, it.u || 'und', sC);
      h.celda(4, f, +it.c || 0, sCant); h.celda(5, f, a === null ? '' : a, a === null ? sC : sAut); h.celda(6, f, rc === null ? '' : rc, rc === null ? sC : sCant); h.celda(7, f, it.s || '', sSus);
      var largo = Math.max(String(it.d || '').length / 30, String(it.e || '').length / 24, String(it.s || '').length / 46);
      if(largo > 1) h.altos[f] = Math.min(120, 15 * Math.ceil(largo));
      f++;
    });
    var fin = f - 1; f++;
    function bloque(titulo, lineas){
      if(!lineas || !lineas.length) return;
      h.unir(0, f, 7, f, titulo, sSec); f++;
      lineas.forEach(function(l){ h.unir(0, f, 7, f, String(l), sNota); if(String(l).length > 120) h.altos[f] = 15 * Math.ceil(String(l).length / 120); f++; });
      f++;
    }
    if(r.motivo) bloque('MOTIVO', [r.motivo]);
    bloque('SUSTENTO: EL CONSUMO DE EPP DE LA OBRA', analisisTxt(r.analisis));
    if(r.res && r.res.nota) bloque(r.res.accion === 'autorizar' ? 'NOTA DE QUIEN AUTORIZA' : (r.res.accion === 'observar' ? 'OBSERVACIÓN' : 'MOTIVO DEL RECHAZO'), [r.res.nota + ' — ' + (r.res.n || '') + (r.res.t ? ', ' + cuando(r.res.t) : '')]);
    if(r.aten) bloque(r.aten.parcial ? 'RECIBIDO EN PARTE' : 'RECIBIDO', [(r.aten.n || '') + (r.aten.t ? ' · ' + cuando(r.aten.t) : '') + (r.aten.nota ? ' · ' + r.aten.nota : '')]);
    /* las firmas, de a dos por renglón: el trazo dibujado, y debajo quién y cuándo. La que falta firmar (las de la
       ruta) queda en blanco, con su raya, para firmar el impreso */
    var medios = [], ff = f, Fs = firmantes(r), sRaya = E.xf({ sz:9, c:Cc.grisc, h:'center' });
    function firma(c, fila, tr){
      if(!tr || !C.firmaPNG) return false;
      var b = null; try{ b = C.firmaPNG(tr); }catch(_e){ b = null; }
      if(!b) return false;
      medios.push({ b:b, ext:'png' });
      var prop = (tr.h || 380) / 1000, alto = Math.min(64, 180 * prop), ancho = alto / prop;
      h.imagen(c, fila, medios.length - 1, ancho, alto, 12, 4);
      return true;
    }
    Fs.forEach(function(k, i){
      var c0 = (i % 2) ? 4 : 0, c1 = (i % 2) ? 7 : 2, f0s = ff + Math.floor(i / 2) * 5;
      h.unir(c0, f0s, c1, f0s, String(k.t).toUpperCase(), sEt);
      h.altos[f0s + 1] = 54;
      if(k.ok){
        var dib = firma((i % 2) ? 5 : 1, f0s + 1, k.f);
        h.unir(c0, f0s + 1, c1, f0s + 1, dib ? '' : (k.papel ? 'Firmó en papel' : 'Firmado en OBRASST'), sFirmaC);
        h.unir(c0, f0s + 2, c1, f0s + 2, k.n || '', sFirma);
        h.unir(c0, f0s + 3, c1, f0s + 3, [k.c, k.cuando, k.como].filter(Boolean).join(' · '), sFirmaC);
      } else if(k.extra){
        h.unir(c0, f0s + 1, c1, f0s + 1, '______________________________', sRaya);
        h.unir(c0, f0s + 2, c1, f0s + 2, k.n || '', sFirma);
        h.unir(c0, f0s + 3, c1, f0s + 3, 'Firma y fecha', sFirmaC);
      } else {
        h.unir(c0, f0s + 1, c1, f0s + 1, String(k.falta || 'Falta firmar').toUpperCase(), sEst);
        h.unir(c0, f0s + 2, c1, f0s + 2, '', sFirma);
        h.unir(c0, f0s + 3, c1, f0s + 3, '', sFirmaC);
      }
    });
    ff += Math.ceil(Fs.length / 2) * 5;
    h.unir(0, ff, 7, ff, 'Generado con OBRASST el ' + dma(isoDe(new Date())) + '. La app deja constancia de quién dijo ser, a qué hora firmó y desde dónde.', sPie);
    if(fin >= f0 + 1) h.filtro = null;
    return X.libro([h], E, 'Requerimiento ' + (r.numero || ''), medios);
  }

  /* ── el Excel de la lista: todos los requerimientos de un periodo, una fila por línea ── */
  function xlsxLista(L, D){
    D = D || {};
    var X = RCAP.xlsx, Cc = X.C, E = new X.Estilos(), Hoja = X.Hoja;
    var sTit = E.xf({ b:true, sz:14, c:Cc.petroleo }), sSub = E.xf({ sz:10, c:Cc.gris });
    var sCab = E.xf({ b:true, sz:9, c:Cc.blanco, f:Cc.petroleo, h:'left', borde:true, wrap:true });
    var sTx = E.xf({ sz:9, c:Cc.tinta, borde:true }), sN = E.xf({ sz:9, c:Cc.tinta, h:'center', borde:true, fmt:'0.##' });
    var sOk = E.xf({ b:true, sz:9, c:Cc.okT, f:Cc.okF, borde:true }), sOjo = E.xf({ b:true, sz:9, c:Cc.ojoT, f:Cc.ojoF, borde:true }), sMal = E.xf({ b:true, sz:9, c:Cc.malT, f:Cc.malF, borde:true });
    var h = new Hoja('Requerimientos'); h.activa = true; h.pie = 'Requerimientos';
    h.unir(0, 1, 6, 1, 'Requerimientos de EPP y materiales', sTit); h.altos[1] = 22;
    h.unir(0, 2, 8, 2, String(D.obra || '') + (D.periodo ? ' · ' + D.periodo : ''), sSub);
    var cols = ['N.°', 'Fecha', 'Clase', 'Estado', 'Prioridad', 'Para', 'Ubicación', 'Solicita', 'Autoriza', 'Línea', 'Descripción', 'Unidad', 'Pedido', 'Autorizado', 'Recibido', 'Firmas', 'Etapa'];
    [11, 11, 16, 16, 10, 11, 20, 24, 24, 6, 34, 8, 9, 10, 9, 30, 20].forEach(function(w, i){ h.anchos[i] = w; });
    cols.forEach(function(c, i){ h.celda(i, 4, c, sCab); });
    var f = 5;
    (L || []).forEach(function(r){
      var Est = estado(r), sE = Est.c === 'ok' ? sOk : (Est.c === 'mal' ? sMal : (Est.c === 'neu' ? sTx : sOjo)), aut = (r.res && r.res.accion === 'autorizar') ? r.res.n : '';
      /* las firmas de la ruta: cuáles faltan (solo se dice de lo que Seguridad ya aprobó) */
      var fl = faltan(r), fir = !ruta(r).length ? '' : (!seFirma(r) ? '' : (fl.length ? 'Faltan: ' + fl.map(function(p){ return p.t; }).join(', ') : 'Completas'));
      (r.items || []).forEach(function(it, i){
        var a = cantAut(r, i), rc = cantRec(r, i);
        [r.numero || '', dma(r.fecha), clase(r.clase).n, Est.n, r.prioridad === 'urgente' ? 'Urgente' : 'Normal', r.para ? dma(r.para) : '', r.ubicacion || '', (r.por || {}).n || '', aut,
         i + 1, it.d || '', it.u || 'und', +it.c || 0, a === null ? '' : a, rc === null ? '' : rc, fir, (r.analisis && r.analisis.etapa) || '']
          .forEach(function(v, k){ h.celda(k, f, v, k === 3 ? sE : (((k >= 12 && k <= 14) || k === 9) ? sN : sTx)); });
        f++;
      });
    });
    h.congelar = { c:1, r:4 }; if(f > 5) h.filtro = 'A4:Q' + (f - 1);
    return X.libro([h], E, 'Requerimientos');
  }

  /* ── el Excel de «lo aprendido»: por etapa, cuánto salió de cada EPP por trabajador al mes ── */
  function xlsxEtapas(G, D){
    D = D || {};
    var X = RCAP.xlsx, Cc = X.C, E = new X.Estilos(), Hoja = X.Hoja;
    var sTit = E.xf({ b:true, sz:14, c:Cc.petroleo }), sSub = E.xf({ sz:10, c:Cc.gris }), sNota = E.xf({ sz:9, c:Cc.gris, wrap:true });
    var sCab = E.xf({ b:true, sz:9, c:Cc.blanco, f:Cc.petroleo, h:'left', borde:true, wrap:true }), sCabN = E.xf({ b:true, sz:9, c:Cc.blanco, f:Cc.petroleo, h:'center', borde:true, wrap:true });
    var sTx = E.xf({ sz:9.5, c:Cc.tinta, borde:true, wrap:true }), sB = E.xf({ b:true, sz:9.5, c:Cc.tinta, borde:true, wrap:true }), sN = E.xf({ sz:9.5, c:Cc.tinta, h:'center', borde:true, fmt:'0.00' }), sC = E.xf({ sz:9.5, c:Cc.tinta, h:'center', borde:true });
    var h = new Hoja('Consumo por etapa'); h.activa = true; h.pie = 'Consumo de EPP por etapa';
    var cols = {}, orden = [];
    (G || []).forEach(function(g){ g.lin.forEach(function(l){ if(!cols[l.k]){ cols[l.k] = { k:l.k, d:l.d, u:l.u, m:0 }; orden.push(cols[l.k]); } if(l.r > cols[l.k].m) cols[l.k].m = l.r; }); });
    orden.sort(function(a, b){ return b.m - a.m || a.d.localeCompare(b.d, 'es'); });
    h.unir(0, 1, 5, 1, 'Consumo de EPP por etapa de la obra', sTit); h.altos[1] = 22;
    h.unir(0, 2, 7, 2, String(D.obra || '') + (D.periodo ? ' · ' + D.periodo : ''), sSub);
    h.unir(0, 3, 7, 3, 'Unidades que salieron por trabajador al mes, según el análisis guardado con cada requerimiento de EPP.', sNota);
    ['Etapa', 'Pedidos', 'Desde', 'Hasta', 'Trabajadores (promedio)'].forEach(function(c, i){ h.celda(i, 5, c, i ? sCabN : sCab); });
    [26, 9, 11, 11, 13].forEach(function(w, i){ h.anchos[i] = w; });
    orden.forEach(function(c, i){ h.celda(5 + i, 5, c.d + ' (' + c.u + ')', sCabN); h.anchos[5 + i] = 16; });
    h.altos[5] = 42;
    var f = 6;
    (G || []).forEach(function(g){
      var m = {}; g.lin.forEach(function(l){ m[l.k] = l.r; });
      h.celda(0, f, g.etapa || 'Sin etapa', sB); h.celda(1, f, g.pedidos, sC); h.celda(2, f, dma(g.desde), sC); h.celda(3, f, dma(g.hasta), sC); h.celda(4, f, Math.round(g.prom * 10) / 10, sC);
      orden.forEach(function(c, i){ h.celda(5 + i, f, m[c.k] === undefined ? '' : Math.round(m[c.k] * 100) / 100, m[c.k] === undefined ? sC : sN); });
      f++;
    });
    h.congelar = { c:1, r:5 };
    return X.libro([h], E, 'Consumo de EPP por etapa');
  }

  return { BASE:BASE, CLASES:CLASES, ESTADOS:ESTADOS, UNIDADES:UNIDADES, CATALOGO:CATALOGO, HORIZONTES:HORIZONTES, VENTANAS:VENTANAS,
           PLAZOS:PLAZOS, PLAZO_BASE:PLAZO_BASE, ETAPAS:ETAPAS, RUTA_BASE:RUTA_BASE,
           clase:clase, estado:estado, estadoK:estadoK, urge:urge, enlace:enlace, dma:dma, hora:hora, cuando:cuando, num:num, llave:llave, unidadDe:unidadDe,
           fechaMas:fechaMas, diasEntre:diasEntre,
           cantAut:cantAut, cantRec:cantRec, totales:totales, demora:demora, demoraTxt:demoraTxt,
           consumo:consumo, resumenAnalisis:resumenAnalisis, analisisTxt:analisisTxt, semaforo:semaforo, alcanza:alcanza,
           activoEn:activoEn, dotacion:dotacion, enCamino:enCamino, aprendido:aprendido, antes:antes, etapaActual:etapaActual,
           ruta:ruta, visto:visto, faltan:faltan, seFirma:seFirma, titulo2:titulo2, comoTx:comoTx, firmantes:firmantes, enlaceFirma:enlaceFirma,
           mensajeFirma:mensajeFirma, correo:correo,
           limpiarItems:limpiarItems, mensaje:mensaje, pdf:pdf, xlsx:xlsx, xlsxLista:xlsxLista, xlsxEtapas:xlsxEtapas, nombreArchivo:nombreArchivo };
})();
