/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   OBRASST · ERP de servicios (2/11/2026): el sistema de los 9 rubros de aliados que no venden EPP — corredores de SCTR,
   consultoras y capacitadoras, gestores de residuos, centros de EMO, alquiler de maquinaria, inspección de izaje y
   extintores, laboratorios de monitoreo y calibración, transporte de personal y saneamiento/catering.
   Pedido de Marcelo (2/11/2026): «comienza con los sistemas de los 9 rubros aliados» (especificación V7, rubros 2 a 10).
   Lo carga erp.js solo cuando el aliado es de uno de esos rubros y su sistema está encendido (Consola › OBRASST OS).
   El catálogo de cada rubro está en erp-srv-catalogo.js (lo genera herr/srv-catalogo.py, el mismo que siembra el servidor).
   Lo que decide (papel, inquilino, cálculo, resultado, bloqueo del activo, certificado y su huella, tarifas) lo decide el
   servidor (sql/2026-11-02-erp-servicios.sql): los cálculos de aquí solo muestran lo mismo antes de guardar.
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
var SRV = (function(){
  var CAT = window.SRV_CATALOGO || { verticales:[], normas:{}, registros:{} };
  var CORTO = { sctr:'SCTR', consultor:'SSOMA', residuos:'Residuos', emo:'EMO', maquinaria:'Maquinaria', izaje:'Izaje', laboratorio:'Laboratorio', transporte:'Transporte', saneamiento:'Saneamiento' };
  var UNO = { sctr:'Póliza', consultor:'Curso', residuos:'Contenedor o vehículo', emo:'Protocolo', maquinaria:'Equipo', izaje:'Elemento', laboratorio:'Instrumento', transporte:'Vehículo', saneamiento:'Reservorio o punto' };
  function D(){ var v = ERP.yo && ERP.yo.vertical; return CAT.verticales.filter(function(x){ return x.k === v; })[0] || { k:v, n:'', activos:[], ordenes:[], certificados:{}, tarifas:[], menu:{} }; }
  function it(lista, k){ return (D()[lista] || []).filter(function(x){ return x.k === k; })[0] || null; }
  function actDef(t){ return it('activos', t) || {}; }
  function regN(t){ return (CAT.registros || {})[t] || t; }
  function papel(){ return ERP.yo && ERP.yo.papel; }
  function uid(){ return ERP.yo && ERP.yo.yo && ERP.yo.yo.uid; }
  function gestiona(){ return papel() === 'admin' || papel() === 'vendedor'; }
  function deCampo(){ return papel() === 'admin' || papel() === 'almacenero' || papel() === 'chofer'; }
  function certifica(){ return papel() === 'admin'; }
  function activosN(){ return (D().menu || {}).activos || 'Activos'; }
  function uno(){ return UNO[D().k] || 'Activo'; }

  /* ── los nombres de lo que guarda el servidor ── */
  var ATTR = { aseguradora:'Aseguradora', numero:'N.° de póliza', tasa_pct:'Tasa (%)', comision_pct:'Tu comisión (%)', horas:'Horas del curso', vigencia_meses:'Vigencia del certificado (meses)',
    nota_min:'Nota mínima para aprobar (0 a 20)', capacidad:'Capacidad', material:'Material', placa:'Placa', capacidad_t:'Capacidad (t)', examenes:'Exámenes que incluye',
    precio:'Precio por atención (S/, sin IGV)', marca:'Marca', modelo:'Modelo', serie:'N.° de serie', mant_cada_h:'Mantenimiento cada (horas)', wll_t:'Carga de trabajo del ramal, WLL (t)',
    largo_m:'Largo (m)', tag:'Tag o código', diametro_mm:'Diámetro (mm)', grado:'Grado', tipo:'Tipo', altura_m:'Altura (m)', agente:'Agente extintor', capacidad_kg:'Capacidad (kg)',
    gases:'Gases que mide (separados por coma)', asientos:'Asientos', volumen_m3:'Volumen (m³)', ubicacion:'Ubicación', raciones_dia:'Raciones al día' };
  var ATTR_NUM = /^(tasa_pct|comision_pct|horas|vigencia_meses|nota_min|capacidad_t|precio|mant_cada_h|wll_t|largo_m|diametro_mm|altura_m|capacidad_kg|asientos|volumen_m3|raciones_dia)$/;
  var EST_ACT = { operativo:['Operativo', 'ok'], observado:['Observado', 'med'], bloqueado:['Bloqueado', 'mal'], baja:['De baja', ''] };
  var EST_ORD = { programada:['Programada', 'az'], en_campo:['En campo', 'med'], cerrada:['Cerrada', 'ok'], anulada:['Anulada', ''] };
  var RES = { ok:['OK', 'ok'], observado:['Observado', 'med'], critico:['Crítico', 'mal'], aprobado:['Aprobado', 'ok'], rechazado:['Rechazado', 'mal'], bloqueado:['Bloqueado', 'mal'],
    conforme:['Conforme', 'ok'], no_conforme:['No conforme', 'mal'] };
  var APT = { apto:'Apto', apto_restr:'Apto con restricciones', no_apto:'No apto', observado:'Observado' };
  var TEMO = { ingreso:'De ingreso', periodico:'Periódico', retiro:'De retiro', otro:'Otro' };
  var DE_CATALOGO = { curso:1, protocolo:1 };                                     /* van en la orden como dato, no como activo de campo */
  var POR_REGISTRO = { aptitud:1, inspeccion:1, calibracion:1 };                   /* uno por registro; los demás, uno por orden cerrada */
  var CON_FIRMA = { aptitud:1, inspeccion:1, calibracion:1, informe_monitoreo:1, saneamiento:1 };   /* llevan nombre y colegiatura de quien firma */
  var MOT = { rubro_apagado:'El sistema de tu rubro está apagado por mantenimiento. Vuelve en unos minutos.', no_es_servicios:'Esta cuenta no es de un rubro de servicios.',
    sin_tarifa:'Falta una tarifa: ponla en «Clientes y tarifas».', registro:'Ese registro no sirve para este certificado.', ya_certificado:'Ya tiene su certificado vigente.',
    vence:'Pon la fecha de vencimiento.', uso:'Revisa el archivo.', tipo_registro:'Esta orden no lleva ese registro.', tiene_certificados:'Tiene certificados vigentes: anúlalos primero.',
    sin_activo:'Elige el ' + 'equipo o elemento.', servicio:'Elige el servicio.', rechazado:'El registro salió rechazado: no se certifica.', orden_cerrada:'Esa orden ya se cerró.',
    fechas:'Revisa las fechas (el periodo va hasta 92 días).', falta_registro:'Elige el registro que se certifica.', activo:'Revisa lo elegido: tiene que ser de esta orden.',
    ya_entregado:'Ya se entregó a la empresa.', viaje_bloqueado:'El viaje quedó bloqueado (descanso o alcohol): no tiene conformidad.',
    viaje:'Faltan datos del viaje: ruta, pasajeros, horas de sueño y la declaración de alcohol cero.', valor:'Revisa el valor.', tipo_certificado:'Ese certificado no es de tu rubro.',
    tema:'Escribe el tema.', siniestro:'Revisa el siniestro: la fecha del evento y su estado.', sin_registros:'La orden todavía no tiene registros.',
    sin_horometro:'Ese equipo no lleva horómetro.', sin_criterios:'Ese tipo no tiene lista de criterios.', sin_checklist:'Tu rubro no tiene esa lista.', sin_certificado:'Esta orden no emite certificado.',
    residuos:'Agrega los residuos.', residuo:'Revisa cada residuo: tipo, clase, cantidad y unidad.', puntos:'Agrega de 1 a 100 puntos.', punto:'Cada punto lleva su nombre, su agente y su valor.',
    protocolo:'Elige un protocolo o un curso tuyo.', profesional:'Pon el nombre y la colegiatura de quien firma.', producto_vencido:'El producto estaba vencido: no se emite el certificado.',
    producto:'Escribe el producto que se usó.', periodo:'Elige el mes.', participantes:'Agrega de 1 a 300 participantes.', participante:'Cada participante lleva su nombre y su documento (4 a 15 letras o números).',
    orden_valorizada:'La orden ya se valorizó.', observado:'La aptitud está «observada»: se certifica cuando haya resultado.', nada_que_valorizar:'No hay órdenes cerradas sin valorizar de ese cliente en ese periodo.',
    linea:'Revisa cada línea: material, peso bruto y tara.', lecturas:'Agrega de 1 a 12 lecturas.', lectura:'Cada lectura lleva su gas o magnitud, el patrón y la lectura.',
    horometro:'Revisa el horómetro: el final mayor que el inicial y no más de 24 h.', fotos:'Máximo 8 fotos.', falta_poliza:'La orden no tiene su póliza: agrégala en la orden.',
    falta_manifiesto:'Con residuos peligrosos va el número del manifiesto.', falta_equipo:'La orden no tiene equipo: agrégalo en la orden.', estaciones:'Agrega las estaciones.',
    estacion:'Cada estación lleva su código y su consumo.', endoso:'Faltan los asegurados y la prima.', empresa_no_recibe:'Esa empresa ya no recibe tus documentos por OBRASST.',
    documento_vencido:'El equipo tiene un documento vencido: renuévalo primero.', documento:'Ese documento no es de este tipo.', color:'Elige un color de la lista.', codigo:'Escribe el código.',
    cliente_sin_obrasst:'Ese cliente no usa OBRASST (su RUC no está registrado): mándale el PDF o el enlace.', clave:'Esa tarifa no es de tu rubro.', cierra_la_orden:'Primero cierra la orden.',
    atencion:'Revisa la atención: nombre, documento, tipo de examen y aptitud.', asignado:'Elige a alguien de tu equipo.', anulado:'Está anulada.', agente:'Elige el agente.',
    activos:'Máximo 50 por orden.', activo_baja:'Está de baja.', actividades:'Escribe lo que se hizo.', equipo_bloqueado:'El equipo está bloqueado o su último pre-uso salió crítico: no se emite la ficha.',
    horometro_atras:'El horómetro inicial es menor que el último registrado.', faltan_puntos:'Falta marcar un punto.', faltan_criterios:'Falta marcar un criterio.', pasajeros:'Hay más pasajeros que asientos.' };
  function msg(j){
    var m = j && j.motivo, t = mensaje(j);
    if(m === 'faltan_puntos' && j.punto) return 'Falta marcar: ' + j.punto + '.';
    if(m === 'faltan_criterios' && j.criterio) return 'Falta marcar: ' + j.criterio + '.';
    if(m === 'horometro_atras' && j.ultimo != null) return 'El horómetro inicial es menor que el último registrado (' + num(j.ultimo, 1) + ').';
    if(m === 'pasajeros' && j.asientos) return 'Hay más pasajeros que asientos (' + j.asientos + ').';
    if(m === 'sin_tarifa' && j.clave) return 'Falta la tarifa «' + ((it('tarifas', j.clave) || {}).n || j.clave) + '»: ponla en «Clientes y tarifas».';
    if(m === 'vence' && j.documento) return 'Pon la fecha de vencimiento de: ' + j.documento + '.';
    if(m === 'equipo_bloqueado' && j.detalle) return t + ' (' + j.detalle + ')';
    if(m === 'datos_personales' && j.claves) return t + ' (' + j.claves.join(', ') + ')';
    return t;
  }

  /* ── al cargar: los nombres del rubro en el menú ── */
  function iniciar(){
    Object.keys(MOT).forEach(function(k){ MOTIVOS[k] = MOT[k]; });
    var d = D(), m = d.menu || {}, campoN = d.campo || 'Campo', regs = [];
    (d.ordenes || []).forEach(function(o){ (o.registros || []).forEach(function(r){ var n = regN(r).toLowerCase(); if(regs.indexOf(n) < 0) regs.push(n); }); });
    SECCIONES.tablero = { t:'Tablero', h:'Hoy: órdenes, ' + activosN().toLowerCase() + ', documentos y certificados por vencer' };
    SECCIONES.srv_activos = { t:m.activos || 'Activos', h:'Con su QR, sus documentos y su estado: bloqueado, no entra a la obra' };
    SECCIONES.srv_ordenes = { t:m.ordenes || 'Órdenes', h:'Lo programado, lo que está en campo y lo cerrado' };
    SECCIONES.srv_campo = { t:'Campo', h:'Lo que llena ' + (campoN === 'Admisión' ? 'admisión' : 'el ' + campoN.toLowerCase()) + ': ' + regs.join(', ') };
    SECCIONES.srv_certificados = { t:m.certificados || 'Certificados', h:'Con su número, su huella y un QR que cualquiera verifica' };
    SECCIONES.srv_clientes = { t:'Clientes y tarifas', h:'Tus clientes y lo que cobras a cada uno' };
    SECCIONES.srv_valorizar = { t:'Valorizaciones', h:'Lo cerrado del periodo, valorizado con tus tarifas y listo para facturar' };
    ERP.cache.srvAct = null; ERP.cache.srvEq = null;
  }
  function papeles(){
    return [['admin', 'Administrador', 'todo; emite y anula certificados (con 2FA)'], ['vendedor', 'Comercial', 'clientes, tarifas, órdenes y valorizaciones; no certifica'],
            ['almacenero', 'Supervisor de campo', 've órdenes, ' + activosN().toLowerCase() + ' y certificados, y llena en campo; sin precios'],
            ['chofer', D().campo || 'Campo', 'solo sus órdenes asignadas y lo que llena en campo']];
  }
  function textoPlan(k){
    return k === 'erp_basico' ? 'El sistema de tu rubro: ' + activosN().toLowerCase() + ' con su QR, órdenes, registros de campo, certificados con verificación pública, valorizaciones, comprobantes y cobranzas. 5 usuarios, tu página web con QR y la app en tu celular.'
                              : 'Lo mismo que Aliado ERP + Web + App, con usuarios sin tope, adelanto de cobro y cuenta SSOMA para tu propio equipo.';
  }

  /* ── ayudantes ── */
  function pillDe(M, k){ var x = M[k] || [k, '']; return pill(x[0], x[1]); }
  function tapar(d){ d = String(d || '').replace(/\s/g, ''); return d ? '••••' + d.slice(-4) : ''; }
  function nro(id){ var v = val(id).replace(',', '.'); if(v === '') return null; var x = Number(v); return isFinite(x) ? x : NaN; }
  function bien(x){ return x != null && !isNaN(x); }
  function r1(x){ return Math.round(x * 10) / 10; }
  function r2(x){ return Math.round(x * 100) / 100; }
  function attrNum(a, k){ var x = a && a.atributos ? Number(String(a.atributos[k] == null ? '' : a.atributos[k]).replace(',', '.')) : NaN; return isFinite(x) && x > 0 ? x : null; }
  function mesN(p){ var s = String(p || '').split('-'); return s.length === 2 ? s[1] + '/' + s[0] : p; }
  function hoy(){ return hoyLima(); }
  function equipo(){
    if(ERP.cache.srvEq) return Promise.resolve(ERP.cache.srvEq);
    return rpc('erp_srv_equipo', {}).then(function(j){ ERP.cache.srvEq = (j && j.ok && j.lista) || []; return ERP.cache.srvEq; });
  }
  function activosTodos(forzar){
    if(ERP.cache.srvAct && !forzar) return Promise.resolve(ERP.cache.srvAct);
    return rpc('erp_srv_activos', {}).then(function(j){ if(!j || !j.ok) return Promise.reject(j); ERP.cache.srvAct = j.lista; return j.lista; });
  }
  function vigencia(x){
    if(x.estado === 'anulado') return pill('anulado', 'mal');
    if(!x.hasta) return pill('sin vencimiento', 'ok');
    if(x.hasta < hoy()) return pill('venció ' + fecha(x.hasta), 'mal');
    return pill('hasta ' + fecha(x.hasta), x.hasta <= masDias(hoy(), 30) ? 'med' : 'ok');
  }
  function resTxt(tipo, r, datos){ if(tipo === 'atencion' && datos && datos.aptitud) return APT[datos.aptitud] || ''; return (RES[r] || [r || ''])[0]; }
  function resPill(tipo, r, datos){ if(!r) return ''; return pill(resTxt(tipo, r, datos), (RES[r] || ['', ''])[1]); }

  /* lo que dice cada registro, en una línea */
  function resumen(r){
    var d = r.datos || {}, c = r.calculo || {};
    switch(r.tipo){
      case 'checklist': return c.criticos && c.criticos.length ? 'Falla crítica: ' + c.criticos.join('; ') : c.observados ? c.observados + ' con observación' : 'Todo conforme';
      case 'parte': return num(c.horas, 1) + ' h (' + num(d.ini, 1) + ' → ' + num(d.fin, 1) + ')' + (d.standby_h ? ' · stand-by ' + num(d.standby_h, 1) + ' h' : '') +
        (d.inoperativo_h ? ' · inoperativo ' + num(d.inoperativo_h, 1) + ' h' : '') + (c.mantenimiento ? ' · toca mantenimiento (cada ' + num(c.cada_h) + ' h)' : '');
      case 'inspeccion': return (c.no_cumple && c.no_cumple.length ? 'No cumple: ' + c.no_cumple.join('; ') : 'Cumple todo') + (c.wll_t != null ? ' · carga segura ' + num(c.wll_t, 2) + ' t' : '') + (d.color ? ' · ' + d.color : '');
      case 'medicion': return (c.puntos || []).length + ' puntos · ' + (c.no_conformes ? c.no_conformes + ' no conformes' : 'todos conformes');
      case 'calibracion': return (c.lecturas || []).length + ' lecturas · ' + (c.fuera ? c.fuera + ' fuera de tolerancia' : 'dentro de tolerancia') + ' (±' + num(d.tolerancia_pct, 1) + ' %)';
      case 'pesaje': return num(c.total_kg, 2) + ' kg netos · ' + soles(c.total_soles);
      case 'recojo': return (d.residuos || []).length + ' residuos' + (c.peligrosos ? ' · ' + c.peligrosos + ' peligrosos (' + num(c.kg_peligrosos, 1) + ' kg)' : '') + (d.manifiesto ? ' · manifiesto ' + d.manifiesto : '');
      case 'dosificacion': return ((it('servicios', d.servicio) || {}).n || '') + (c.litros_producto != null ? ' · ' + num(c.litros_producto, 2) + ' L de producto' : '') +
        (d.cloro_residual_mgl != null ? ' · cloro residual ' + num(d.cloro_residual_mgl, 2) + ' mg/L' : '') + (c.producto_vencido ? ' · producto vencido' : '');
      case 'cebaderas': return num(c.estaciones) + ' estaciones · ' + (c.consumo_total ? c.consumo_total + ' con consumo total' : 'sin consumo total');
      case 'viaje': return (d.ruta || '') + ' · ' + num(d.pasajeros) + ' pasajeros · ' + (c.descanso_ok ? 'descanso suficiente' : 'descanso insuficiente') + ' · ' + (d.alcohol_cero ? 'alcohol cero' : 'sin alcohol cero');
      case 'asistencia': return num(c.participantes) + ' participantes · ' + num(c.aprobados) + ' aprobados (nota mínima ' + num(c.nota_min) + ')';
      case 'atencion': return (d.trabajador ? d.trabajador.nombre + ' ' + tapar(d.trabajador.doc) : '') + ' · ' + (TEMO[d.tipo_emo] || '') + ' · ' + (APT[d.aptitud] || '') + (d.vence ? ' hasta ' + fecha(d.vence) : '');
      case 'endoso': return 'Periodo ' + mesN(d.periodo) + ' · ' + num(d.asegurados) + ' asegurados (altas ' + num(d.altas) + ', bajas ' + num(d.bajas) + ') · prima ' + soles(d.prima);
      case 'siniestro': return 'Evento del ' + fecha(d.fecha_evento) + ' · ' + ({ reportado:'reportado', en_atencion:'en atención', cerrado:'cerrado' }[d.estado] || '') + (d.monto != null ? ' · ' + soles(d.monto) : '');
      case 'servicio': return num(d.horas, 1) + ' h · ' + String(d.actividades || '').slice(0, 90);
      case 'raciones': return num(c.raciones) + ' raciones';
    }
    return '';
  }

  /* ═════════════════ TABLERO ═════════════════ */
  var tableroEpp = PINTAR.tablero;
  PINTAR.tablero = function(sub){
    if(!esSrv()) return tableroEpp(sub);
    $('vista').innerHTML = cabecera('tablero') + '<p class="ayuda" id="cargando">Calculando…</p>';
    var h = hoy(), d = h.slice(0, 8) + '01';
    Promise.all([rpc('erp_srv_tablero', {}), tieneModulo('facturacion') ? rpc('erp_tablero', { desde:d, hasta:h }) : Promise.resolve(null)]).then(function(r){
      var t = r[0], f = r[1];
      if(!t || !t.ok) return fuera(t);
      var html = '<div class="grilla"><div class="kpi"><small>Órdenes de hoy</small><b>' + num(t.ordenes_hoy) + '</b><span>' + num(t.ordenes_abiertas) + ' abiertas en total</span></div>' +
        '<div class="kpi"><small>Por valorizar</small><b>' + num(t.por_valorizar) + '</b><span>órdenes cerradas</span></div>' +
        '<div class="kpi"><small>' + esc(SECCIONES.srv_certificados.t) + ' del mes</small><b>' + num(t.certificados_mes) + '</b><span>' + num(t.certificados_por_vencer) + ' vencen en 30 días</span></div>' +
        (f && f.ok ? '<div class="kpi"><small>Facturado este mes (sin IGV)</small><b>' + soles(f.ventas) + '</b><span>' + soles(f.cobranzas && f.cobranzas.saldo) + ' por cobrar</span></div>' : '') + '</div>';
      var al = [['bloqueados', (t.bloqueados || []).length, activosN().toLowerCase() + ' bloqueados', 'srv_activos'], ['controles', t.controles_vencidos, 'con el control vencido', 'srv_activos'],
        ['vencidos', t.docs_vencidos, 'documentos vencidos', 'srv_activos'], ['por_vencer', t.docs_por_vencer, 'documentos que vencen en 30 días', 'srv_activos'],
        ['valorizar', t.por_valorizar, 'órdenes cerradas por valorizar', 'srv_valorizar'], ['certs', t.certificados_por_vencer, 'certificados que vencen en 30 días', 'srv_certificados']];
      html += '<div class="dos"><div class="tarj"><h2>Alertas</h2>' + al.map(function(x){ return '<p style="display:flex; justify-content:space-between; gap:10px; padding:5px 0; border-bottom:1px solid #EEF2F5">' +
        '<span>' + (x[1] ? '<b>' + num(x[1]) + '</b> ' : '0 ') + esc(x[2]) + '</span>' + (x[1] && puede(x[3]) ? '<button type="button" class="bt-link" data-ir="' + x[3] + '">Ver</button>' : '') + '</p>'; }).join('') + '</div>' +
        '<div class="tarj"><h2>Bloqueados: no entran a la obra</h2>' + ((t.bloqueados || []).length ? t.bloqueados.map(function(b){ return '<p style="padding:5px 0; border-bottom:1px solid #EEF2F5"><span class="srv-chip">' + esc(b.codigo) + '</span>' +
          esc(b.motivo || '') + '</p>'; }).join('') : '<p class="ayuda">Ninguno.</p>') + '</div></div>';
      $('cargando').outerHTML = html;
    });
  };

  /* ═════════════════ ÓRDENES ═════════════════ */
  PINTAR.srv_ordenes = function(sub){
    var subs = [['abiertas', 'Abiertas'], ['cerradas', 'Cerradas'], ['todas', 'Todas']];
    sub = subs.some(function(x){ return x[0] === sub; }) ? sub : 'abiertas';
    $('vista').innerHTML = cabecera('srv_ordenes', subs, sub) + '<p class="ayuda" id="cargando">Cargando…</p>';
    var h = hoy();
    rpc('erp_srv_ordenes', sub === 'abiertas' ? {} : { desde:masDias(h, -150), hasta:masDias(h, 120) }).then(function(j){
      if(!j || !j.ok) return fuera(j);
      ERP.cache.srvOrd = j.lista;
      var L = j.lista.filter(function(o){ return sub === 'todas' || (sub === 'abiertas' ? o.estado === 'programada' || o.estado === 'en_campo' : o.estado === 'cerrada'); });
      if(sub === 'abiertas') L.sort(function(a, b){ return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0; });
      $('cargando').outerHTML = (gestiona() ? '<div class="filtros"><button type="button" class="bt" data-a="srvOrdNueva">Nueva orden</button></div>' : '') +
        tabla([{ t:'Orden', k:function(o){ return '<span class="mono">' + esc(o.numero) + '</span><span class="sub">' + esc(o.tipo_n || o.tipo) + '</span>'; } },
          { t:'Cliente', k:function(o){ return esc(o.cliente_n || '—') + (o.sede ? '<span class="sub">' + esc(o.sede) + '</span>' : ''); } },
          { t:'Fecha', k:function(o){ return fecha(o.fecha) + (o.hasta && o.hasta !== o.fecha ? '<span class="sub">al ' + fecha(o.hasta) + '</span>' : ''); } },
          { t:'Asignada a', k:function(o){ return esc(o.asignado_n || '—'); } },
          { t:activosN(), k:function(o){ return esc((o.activos || []).map(function(a){ return a.codigo; }).join(', ') || '—'); } },
          { t:'Estado', k:function(o){ return pillDe(EST_ORD, o.estado) + (o.valorizada ? '<span class="sub">valorizada</span>' : ''); } },
          { t:'Registros', n:1, k:function(o){ return num(o.registros) + (o.certificados ? '<span class="sub">' + num(o.certificados) + ' cert.</span>' : ''); } }],
          L, { a:'srvOrden', vacio:sub === 'abiertas' ? 'No hay órdenes abiertas' : 'Nada en este periodo', vacioSub:gestiona() && sub === 'abiertas' ? 'Crea la primera con «Nueva orden».' : '' });
    });
  };
  ACC.srvOrdNueva = function(){ formOrden(null); };
  function datosHTML(t, dat, todos){
    var d = D();
    if(d.k === 'saneamiento' && t === 'saneamiento') return campo('so-serv', 'Servicio', sel('so-serv', [['', 'Elige…']].concat((d.servicios || []).map(function(s){ return [s.k, s.n]; })), dat.servicio || ''));
    if(d.k === 'emo') return campo('so-prot', 'Protocolo', sel('so-prot', [['', 'Sin protocolo']].concat(todos.filter(function(a){ return a.tipo === 'protocolo' && a.estado !== 'baja'; }).map(function(a){ return [a.id, a.codigo + ' · ' + (a.nombre || '')]; })), dat.protocolo || ''),
      'El precio de la atención sale del protocolo (o de tu tarifa).');
    if(d.k === 'consultor' && t === 'capacitacion') return campo('so-curso', 'Curso', sel('so-curso', [['', 'Sin curso']].concat(todos.filter(function(a){ return a.tipo === 'curso' && a.estado !== 'baja'; }).map(function(a){ return [a.id, a.codigo + ' · ' + (a.nombre || '')]; })), dat.curso || ''),
      'Del curso salen la nota mínima y la vigencia del certificado.');
    if(d.k === 'transporte') return campo('so-ruta', 'Ruta', inp('so-ruta', dat.ruta || '', ' maxlength="160" placeholder="Campamento → frente de obra"'));
    return '';
  }
  function activosHTML(A, marcados){
    var hay = (D().activos || []).some(function(x){ return !DE_CATALOGO[x.k]; });
    if(!hay) return '';
    if(!A.length) return '<div class="aviso ojo">Todavía no tienes ' + esc(activosN().toLowerCase()) + ': créalos en «' + esc(activosN()) + '» y después los agregas a la orden.</div>';
    return '<p style="font-size:13px; font-weight:500; margin:0 0 6px">' + esc(activosN()) + ' de esta orden</p>' + (A.length > 10 ? '<input id="so-filtro" placeholder="Buscar por código o nombre" style="margin:0 0 6px">' : '') +
      '<div class="srv-act" id="so-acts">' + A.map(function(a){ return '<label data-q="' + esc((a.codigo + ' ' + (a.nombre || '') + ' ' + (a.tipo_n || '')).toLowerCase()) + '"><input type="checkbox" class="so-a" value="' + esc(a.id) + '"' + (marcados[a.id] ? ' checked' : '') + '> <span class="srv-chip">' + esc(a.codigo) + '</span>' +
        esc([a.tipo_n, a.nombre].filter(Boolean).join(' · ')) + (a.estado !== 'operativo' ? ' ' + pillDe(EST_ACT, a.estado) : '') + '</label>'; }).join('') + '</div>';
  }
  function formOrden(o){
    Promise.all([catClientes(), equipo(), activosTodos(true)]).then(function(r){
      var d = D(), E = r[1], todos = r[2], A = todos.filter(function(a){ return a.estado !== 'baja' && !DE_CATALOGO[a.tipo]; }), dat = (o && o.datos) || {}, marcados = {};
      ((o && o.activos) || []).forEach(function(a){ marcados[a.id] = 1; });
      var cli = o && o.cliente ? (ERP.cache.cli || []).filter(function(c){ return c.id === o.cliente; })[0] : null;
      hoja({ titulo:o ? 'Orden ' + o.numero : 'Nueva orden', ancha:true,
        html:'<div class="campos">' + campo('so-tipo', 'Tipo', sel('so-tipo', (d.ordenes || []).map(function(x){ return [x.k, x.n]; }), o ? o.tipo : (d.ordenes[0] || {}).k, o ? ' disabled' : '')) +
            campo('so-f', 'Fecha', inp('so-f', o ? o.fecha : hoy(), ' type="date"')) + campo('so-h', 'Hasta (si dura varios días)', inp('so-h', o ? o.hasta : '', ' type="date"')) +
            campo('so-as', 'Asignada a', sel('so-as', [['', 'Sin asignar']].concat(E.map(function(u){ return [u.uid, (u.nombre || 'Sin nombre') + ' · ' + papelN(u.papel)]; })), o ? o.asignado || '' : '')) + '</div>' +
          campo('so-cli', 'Cliente', inp('so-cli', cli ? (cli.num_doc || 's/d') + ' · ' + cli.razon_social : '', ' list="so-cli-l" autocomplete="off" placeholder="RUC o razón social"') + listaCli('so-cli-l'),
            'Sin cliente, la orden no se valoriza ni su certificado llega a la empresa.') +
          campo('so-sede', 'Obra o sede', inp('so-sede', o ? o.sede : '', ' maxlength="160"')) + '<div id="so-datos"></div><div id="so-act"></div>' +
          campo('so-nota', 'Nota (opcional)', '<textarea id="so-nota" rows="2" maxlength="600">' + esc(o ? o.nota || '' : '') + '</textarea>'),
        alAbrir:function(api){
          var pinta = function(){ $('so-datos').innerHTML = datosHTML(val('so-tipo'), dat, todos); };
          $('so-tipo').onchange = pinta; pinta();
          $('so-act').innerHTML = activosHTML(A, marcados);
          var fi = $('so-filtro'); if(fi) fi.oninput = function(){ var q = fi.value.trim().toLowerCase(); [].forEach.call(document.querySelectorAll('#so-acts label'), function(l){ l.hidden = !!q && l.getAttribute('data-q').indexOf(q) < 0; }); };
        },
        botones:[{ t:'Cancelar', c:'sec' }, { t:o ? 'Guardar' : 'Crear la orden', a:function(api){
          var ct = val('so-cli'), cl = ct ? cliDe(ct) : null;
          if(ct && !cl) return api.msg('Elige el cliente de la lista (o créalo en «Clientes y tarifas»).');
          var p = { tipo:val('so-tipo'), fecha:val('so-f'), hasta:val('so-h'), asignado:val('so-as') || null, cliente:cl ? cl.id : null, sede:val('so-sede'), nota:val('so-nota'), datos:{},
                    activos:[].map.call(document.querySelectorAll('.so-a:checked'), function(x){ return x.value; }) };
          if(val('so-serv')) p.datos.servicio = val('so-serv');
          if(val('so-prot')) p.datos.protocolo = val('so-prot');
          if(val('so-curso')) p.datos.curso = val('so-curso');
          if(val('so-ruta')) p.datos.ruta = val('so-ruta');
          if(d.k === 'saneamiento' && p.tipo === 'saneamiento' && !p.datos.servicio) return api.msg('Elige el servicio.');
          if(o) p.id = o.id;
          guarda(api, rpc('erp_srv_orden_guardar', p), null, function(j){ toast((o ? 'Orden ' : 'Orden creada: ') + j.orden.numero + (o ? ' guardada.' : '.'));
            if(ERP.sec === 'srv_ordenes') PINTAR.srv_ordenes(ERP.sub); else if(ERP.sec === 'srv_campo') PINTAR.srv_campo(); });
        } }] });
    }, function(j){ toast(msg(j)); });
  }

  /* la orden abierta: lo registrado, los certificados y lo que se puede hacer */
  ACC.srvOrden = function(b){ abrirOrden(b.getAttribute('data-id')); };
  function abrirOrden(id){
    Promise.all([rpc('erp_srv_orden', { id:id }), activosTodos().catch(function(){ return []; })]).then(function(r){
      var j = r[0], todos = r[1] || [];
      if(!j || !j.ok){ toast(msg(j)); return; }
      var o = j.orden, R = j.registros || [], X = j.certificados || [], od = it('ordenes', o.tipo) || {}, ck = od.certificado, cd = ck ? (D().certificados || {})[ck] || {} : null;
      var abierta = o.estado === 'programada' || o.estado === 'en_campo', dat = o.datos || {}, nombreDe = function(i){ var a = todos.filter(function(x){ return x.id === i; })[0]; return a ? a.codigo + ' · ' + (a.nombre || '') : '—'; };
      var vigenteOrden = X.some(function(x){ return x.estado === 'vigente' && !x.registro; });
      var dl = [['Tipo', o.tipo_n], ['Cliente', o.cliente_n || 'Sin cliente'], ['Obra o sede', o.sede], ['Fecha', fecha(o.fecha) + (o.hasta && o.hasta !== o.fecha ? ' al ' + fecha(o.hasta) : '')],
        ['Asignada a', o.asignado_n || 'Sin asignar'], [activosN(), (o.activos || []).map(function(a){ return a.codigo + (a.estado !== 'operativo' ? ' (' + (EST_ACT[a.estado] || [a.estado])[0].toLowerCase() + ')' : ''); }).join(', ')],
        ['Servicio', dat.servicio ? (it('servicios', dat.servicio) || {}).n : ''], ['Protocolo', dat.protocolo ? nombreDe(dat.protocolo) : ''], ['Curso', dat.curso ? nombreDe(dat.curso) : ''], ['Ruta', dat.ruta], ['Nota', o.nota]];
      var html = '<div style="margin:0 0 10px">' + pillDe(EST_ORD, o.estado) + (o.valorizada ? ' ' + pill('valorizada', 'az') : '') + '</div>' +
        '<dl class="srv-dl">' + dl.filter(function(x){ return x[1]; }).map(function(x){ return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
        '<h3 style="font-size:14.5px; margin:4px 0 8px">Registros de campo</h3>' +
        tabla([{ t:'Fecha', k:function(x){ return fecha(x.fecha) + '<span class="sub">' + esc(x.por || '') + '</span>'; } },
          { t:'Registro', k:function(x){ return esc(regN(x.tipo)) + (x.activo_codigo ? '<span class="sub mono">' + esc(x.activo_codigo) + '</span>' : ''); } },
          { t:'Resultado', k:function(x){ return x.anulado ? pill('anulado') : resPill(x.tipo, x.resultado, x.datos); } },
          { t:'Detalle', k:function(x){ return esc(resumen(x)) + ((x.fotos || []).length || (x.datos || {}).constancia ? '<span class="sub">' + (x.fotos || []).map(function(f, i){ return '<button type="button" class="bt-link" data-a="verArchivo" data-id="' + esc(f) + '">Foto ' + (i + 1) + '</button>'; }).join(' · ') +
              ((x.datos || {}).constancia ? ((x.fotos || []).length ? ' · ' : '') + '<button type="button" class="bt-link" data-a="verArchivo" data-id="' + esc(x.datos.constancia) + '">Constancia</button>' : '') + '</span>' : ''); } },
          { t:'', k:function(x){
              if(x.certificado) return '<button type="button" class="bt-link" data-a="srvCert" data-id="' + esc(x.certificado.id) + '">' + esc(x.certificado.numero) + '</button>';
              var b = '';
              if(!x.anulado && ck && POR_REGISTRO[ck] && certifica() && regCertificable(ck, x)) b += '<button type="button" class="bt casco mini" data-a="srvCertReg" data-id="' + esc(o.id) + '" data-r="' + esc(x.id) + '">Emitir</button> ';
              if(!x.anulado && gestiona() && !o.valorizada) b += '<button type="button" class="bt mal mini" data-a="srvRegAnular" data-id="' + esc(x.id) + '" data-o="' + esc(o.id) + '">Anular</button>';
              return b; } }],
          R, { vacio:'Todavía no hay registros', vacioSub:abierta && deCampo() ? 'Se llenan en «Campo» (o con «Llenar en campo» aquí abajo).' : '' }) +
        (X.length ? '<h3 style="font-size:14.5px; margin:4px 0 8px">' + esc(SECCIONES.srv_certificados.t) + '</h3>' + tabla([{ t:'Número', k:function(x){ return '<span class="mono">' + esc(x.numero) + '</span>'; } },
          { t:'Vigencia', k:function(x){ return vigencia(x); } }, { t:'Empresa', k:function(x){ return x.entregado ? pill('entregado', 'az') : '—'; } }], X, { a:'srvCert' }) : '') +
        (ck && !POR_REGISTRO[ck] && o.estado !== 'cerrada' && !vigenteOrden ? '<p class="ayuda">' + esc(cd.n || 'El certificado') + ' se emite cuando la orden se cierra.</p>' : '');
      var api = hoja({ titulo:'Orden ' + o.numero, ancha:true, html:html, botones:[{ t:'Cerrar', c:'sec' }]
        .concat(abierta && gestiona() ? [{ t:'Anular la orden', c:'mal', a:function(api){ hoja({ titulo:'Anular la orden ' + o.numero, html:'<p>Anulada, ya no se llena ni se valoriza. Si tiene certificados vigentes, primero se anulan.</p>',
          botones:[{ t:'No', c:'sec' }, { t:'Sí, anularla', c:'mal', a:function(h2){ guarda(h2, rpc('erp_srv_orden_estado', { id:o.id, estado:'anulada' }), 'Orden anulada.', function(){ api.cerrar(); repintar(); }); } }] }); } },
          { t:'Editar', c:'sec', a:function(api){ api.cerrar(); formOrden(o); } }] : [])
        .concat(o.estado === 'cerrada' && !o.valorizada && gestiona() ? [{ t:'Reabrir', c:'sec', a:function(api){ guarda(api, rpc('erp_srv_orden_estado', { id:o.id, estado:'en_campo' }), 'Orden reabierta.', repintar); } }] : [])
        .concat(o.estado === 'en_campo' && (gestiona() || o.asignado === uid()) ? [{ t:'Cerrar la orden', c:'sec', a:function(api){ guarda(api, rpc('erp_srv_orden_estado', { id:o.id, estado:'cerrada' }), 'Orden cerrada.', function(){ repintar(); abrirOrden(o.id); }); } }] : [])
        .concat(abierta && deCampo() && (papel() !== 'chofer' || o.asignado === uid()) ? [{ t:'Llenar en campo', c:'casco', a:function(api){ api.cerrar(); elegirRegistro(o); } }] : [])
        .concat(ck && !POR_REGISTRO[ck] && o.estado === 'cerrada' && !vigenteOrden && certifica() ? [{ t:'Emitir: ' + (cd.n || 'certificado'), c:'casco', a:function(api){ api.cerrar(); certificar(o, null); } }] : []) });
      void api;
    });
  }
  function regCertificable(ck, x){ return ck === 'aptitud' ? x.resultado !== 'observado' : x.resultado === 'aprobado'; }
  function repintar(){ ERP.cache.srvAct = null; if(ERP.sec === 'srv_ordenes') PINTAR.srv_ordenes(ERP.sub); else if(ERP.sec === 'srv_campo') PINTAR.srv_campo(); else if(ERP.sec === 'srv_certificados') PINTAR.srv_certificados(ERP.sub); }
  ACC.srvRegAnular = function(b){
    var id = b.getAttribute('data-id'), o = b.getAttribute('data-o');
    pedirTexto('Anular el registro', 'Motivo (queda en el registro de seguridad)', function(m, api){
      guarda(api, rpc('erp_srv_registro_anular', { id:id, motivo:m }), 'Registro anulado.', function(){ [].forEach.call(document.querySelectorAll('.velo'), function(v){ v.remove(); }); repintar(); abrirOrden(o); }); });
  };
  ACC.srvCertReg = function(b){
    var oid = b.getAttribute('data-id'), rid = b.getAttribute('data-r');
    rpc('erp_srv_orden', { id:oid }).then(function(j){ if(!j || !j.ok) return toast(msg(j)); [].forEach.call(document.querySelectorAll('.velo'), function(v){ v.remove(); }); certificar(j.orden, rid); });
  };

  /* ═════════════════ CAMPO ═════════════════ */
  PINTAR.srv_campo = function(){
    $('vista').innerHTML = cabecera('srv_campo') + '<p class="ayuda" id="cargando">Cargando…</p>';
    rpc('erp_srv_ordenes', {}).then(function(j){
      if(!j || !j.ok) return fuera(j);
      ERP.cache.srvOrd = j.lista;
      var L = j.lista.filter(function(o){ return (o.estado === 'programada' || o.estado === 'en_campo') && (papel() !== 'chofer' || o.asignado === uid()); })
        .sort(function(a, b){ return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0; });
      $('cargando').outerHTML = L.length ? L.map(tarjetaCampo).join('') : '<div class="vacio"><b>No tienes órdenes abiertas</b>' +
        (papel() === 'chofer' ? 'Cuando te asignen una, aparece aquí.' : 'Se crean en «' + esc(SECCIONES.srv_ordenes.t) + '».') + '</div>';
    });
  };
  function tarjetaCampo(o){
    var od = it('ordenes', o.tipo) || { registros:[] };
    return '<div class="tarj"><div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:flex-start"><div><h2 style="margin:0">' + esc(o.tipo_n || o.tipo) + ' · <span class="mono">' + esc(o.numero) + '</span></h2>' +
      '<p class="ayuda">' + esc([o.cliente_n, o.sede].filter(Boolean).join(' · ') || 'Sin cliente') + ' · ' + (o.fecha === hoy() ? 'hoy' : fecha(o.fecha)) + (o.asignado_n ? ' · ' + esc(o.asignado_n) : '') + '</p></div>' + pillDe(EST_ORD, o.estado) + '</div>' +
      ((o.activos || []).length ? '<p style="margin:8px 0 0">' + o.activos.map(function(a){ return '<span class="srv-chip">' + esc(a.codigo) + '</span>' + (a.estado !== 'operativo' ? pillDe(EST_ACT, a.estado) + ' ' : ''); }).join('') + '</p>' : '') +
      '<div class="acciones" style="margin-top:12px">' + (od.registros || []).map(function(t){ return '<button type="button" class="bt casco" data-a="srvLlenar" data-id="' + esc(o.id) + '" data-t="' + esc(t) + '">' + esc(regN(t)) + '</button>'; }).join('') +
      '<button type="button" class="bt sec" data-a="srvOrden" data-id="' + esc(o.id) + '">Ver lo registrado (' + num(o.registros) + ')</button>' +
      (o.estado === 'en_campo' && (gestiona() || o.asignado === uid()) ? '<button type="button" class="bt sec" data-a="srvCerrarOrden" data-id="' + esc(o.id) + '">Cerrar la orden</button>' : '') + '</div></div>';
  }
  function ordenDe(id){ return (ERP.cache.srvOrd || []).filter(function(x){ return x.id === id; })[0]; }
  ACC.srvLlenar = function(b){ var o = ordenDe(b.getAttribute('data-id')); if(o) llenar(o, b.getAttribute('data-t')); };
  ACC.srvCerrarOrden = function(b){
    var o = ordenDe(b.getAttribute('data-id')); if(!o) return;
    hoja({ titulo:'Cerrar la orden ' + o.numero, html:'<p>¿Ya se terminó? Cerrada, ya no se llenan registros' + (gestiona() ? '' : ' (el administrador la puede reabrir)') + ' y queda lista para ' +
        ((it('ordenes', o.tipo) || {}).certificado ? 'su certificado y ' : '') + 'la valorización.</p>',
      botones:[{ t:'Todavía no', c:'sec' }, { t:'Sí, cerrarla', a:function(api){ guarda(api, rpc('erp_srv_orden_estado', { id:o.id, estado:'cerrada' }), 'Orden cerrada.', repintar); } }] });
  };
  function elegirRegistro(o){
    var R = (it('ordenes', o.tipo) || {}).registros || [];
    if(R.length === 1) return llenar(o, R[0]);
    hoja({ titulo:'¿Qué vas a llenar?', html:'<div class="acciones">' + R.map(function(t, i){ return '<button type="button" class="bt casco" data-hb-reg="' + i + '">' + esc(regN(t)) + '</button>'; }).join('') + '</div>',
      alAbrir:function(api){ api.el.addEventListener('click', function(e){ var b = e.target.closest('[data-hb-reg]'); if(b){ api.cerrar(); llenar(o, R[+b.getAttribute('data-hb-reg')]); } }); },
      botones:[{ t:'Cancelar', c:'sec' }] });
  }

  /* ── cada registro de campo: su formulario, lo que se manda y el cálculo en vivo (el mismo del servidor) ── */
  function actSel(ctx){ var i = val('rg-act'); return (ctx.acts || []).filter(function(a){ return a.id === i; })[0] || null; }
  function tablaFilas(id, cab, mas){ return '<div class="tabla-caja"><table><thead><tr>' + cab.map(function(c){ return '<th' + (c[1] ? ' class="num"' : '') + '>' + esc(c[0]) + '</th>'; }).join('') + '<th></th></tr></thead><tbody id="' + id + '"></tbody></table></div>' +
    '<button type="button" class="bt sec mini" id="' + id + '-mas">' + esc(mas) + '</button>'; }
  function filasVivas(ctx, id, fila, n){
    ctx.n = 0;
    var agregar = function(v){ var i = ctx.n++, tr = document.createElement('tr'); tr.setAttribute('data-i', i); tr.innerHTML = fila(i, v || {}) + '<td><button type="button" class="bt-link" data-quitar="1" aria-label="Quitar la fila">Quitar</button></td>'; $(id).appendChild(tr); };
    $(id + '-mas').onclick = function(){ agregar(); if(ctx.re) ctx.re(); };
    $(id).addEventListener('click', function(e){ var q = e.target.closest('[data-quitar]'); if(q){ q.closest('tr').remove(); if(ctx.re) ctx.re(); } });
    ctx.agregar = agregar;
    for(var k = 0; k < (n == null ? 1 : n); k++) agregar();
  }
  function indices(id){ return [].map.call(document.querySelectorAll('#' + id + ' tr[data-i]'), function(tr){ return tr.getAttribute('data-i'); }); }
  var NORMA_TXT = function(k){ return (CAT.normas || {})[k] || ''; };
  var FORM = {
    checklist:{
      activo:function(){ return true; }, req:function(){ return /^(maquinaria|transporte)$/.test(D().k); },
      lista:function(){ return ((D().checklists || {}).checklist || {}); },
      html:function(){ var L = FORM.checklist.lista();
        return '<p style="font-weight:600; margin:4px 0 8px">' + esc(L.n || 'Lista de verificación') + '</p><div class="srv-chk">' + (L.items || []).map(function(x, i){
          return '<div class="srv-chk-f"><span>' + esc(x.t) + (x.critico ? ' <b class="margen-bajo">· crítico</b>' : '') + '</span><span class="srv-seg" role="radiogroup" aria-label="' + esc(x.t) + '">' +
            [['ok', 'OK'], ['obs', 'Obs.'], ['falla', 'Falla'], ['na', 'N/A']].map(function(v){ return '<label><input type="radio" name="rg-c' + i + '" value="' + v[0] + '"><span>' + v[1] + '</span></label>'; }).join('') + '</span></div>'; }).join('') + '</div>' +
          '<p class="ayuda" style="margin:-4px 0 10px">' + (FORM.checklist.req() ? 'Una falla en un punto crítico deja el ' + esc(uno().toLowerCase()) + ' bloqueado (tarjeta roja) hasta que el administrador lo libere con su motivo.' :
            'Una falla en un punto crítico sale como hallazgo crítico en el informe del servicio.') + '</p>' +
          campo('rg-nota', 'Observaciones (opcional)', '<textarea id="rg-nota" rows="2" maxlength="400"></textarea>'); },
      leer:function(ctx){ var I = FORM.checklist.lista().items || [], items = {}, a = actSel(ctx);
        if(!a && FORM.checklist.req()) return 'Elige el ' + uno().toLowerCase() + '.';
        for(var i = 0; i < I.length; i++){ var r = document.querySelector('input[name="rg-c' + i + '"]:checked'); if(!r) return 'Falta marcar: ' + I[i].t + '.'; items[I[i].k] = r.value; }
        return { activo:a ? a.id : null, datos:{ items:items, nota:val('rg-nota') } }; },
      vivo:function(){ var I = FORM.checklist.lista().items || [], crit = [], obs = 0, falta = 0;
        I.forEach(function(x, i){ var r = document.querySelector('input[name="rg-c' + i + '"]:checked'); if(!r) falta++; else if(r.value === 'falla' && x.critico) crit.push(x.t); else if(r.value === 'falla' || r.value === 'obs') obs++; });
        if(crit.length) return '<b class="margen-bajo">Crítico:</b> ' + esc(crit.join('; ')) + (FORM.checklist.req() ? '. Al guardar, queda bloqueado.' : '.');
        return (falta ? 'Faltan ' + falta + ' de ' + I.length + ' puntos por marcar.' : '') + (obs ? ' <b class="margen-medio">Observado:</b> ' + obs + (obs === 1 ? ' punto.' : ' puntos.') : falta ? '' : '<b class="margen-alto">Todo OK.</b>'); }
    },
    parte:{
      activo:function(a){ return actDef(a.tipo).medidor === 'horometro'; }, req:function(){ return true; },
      html:function(){ return '<div class="campos">' + campo('rg-ini', 'Horómetro al empezar', inp('rg-ini', '', ' inputmode="decimal"')) + campo('rg-fin', 'Horómetro al terminar', inp('rg-fin', '', ' inputmode="decimal"')) +
        campo('rg-sb', 'Horas en stand-by', inp('rg-sb', '', ' inputmode="decimal" placeholder="0"')) + campo('rg-inop', 'Horas inoperativo por falla', inp('rg-inop', '', ' inputmode="decimal" placeholder="0"'), 'Se descuentan al valorizar.') + '</div>' +
        campo('rg-rec', 'Quién da la conformidad en la obra (su cargo)', inp('rg-rec', '', ' maxlength="120" placeholder="Residente de obra"')); },
      iniciar:function(ctx){ var pon = function(){ var a = actSel(ctx); $('rg-ini').value = a && a.medidor != null ? a.medidor : ''; }; if($('rg-act')) $('rg-act').addEventListener('change', pon); pon(); },
      leer:function(ctx){ var a = actSel(ctx), i = nro('rg-ini'), f = nro('rg-fin'), sb = nro('rg-sb'), io = nro('rg-inop');
        if(!a) return 'Elige el equipo.'; if(!bien(i) || !bien(f)) return 'Pon los dos horómetros.'; if(f < i) return 'El horómetro final no puede ser menor que el inicial.';
        if(f - i > 24) return 'Más de 24 h en un día: revisa los horómetros.'; if(sb != null && !(sb >= 0 && sb <= 24) || io != null && !(io >= 0 && io <= 24)) return 'Las horas de stand-by e inoperativas van de 0 a 24.';
        return { activo:a.id, datos:{ ini:i, fin:f, standby_h:sb, inoperativo_h:io, recibe:val('rg-rec') } }; },
      vivo:function(ctx){ var a = actSel(ctx), i = nro('rg-ini'), f = nro('rg-fin');
        if(!bien(i) || !bien(f)) return a && a.medidor != null ? 'Último horómetro de ' + esc(a.codigo) + ': <b>' + num(a.medidor, 1) + '</b>' : '';
        if(f < i) return '<b class="margen-bajo">El final es menor que el inicial.</b>';
        var t = 'Horas del día: <b>' + num(r1(f - i), 1) + ' h</b>', cada = attrNum(a, 'mant_cada_h');
        if(a && a.medidor != null && i < a.medidor - 0.5) t += ' · <b class="margen-bajo">el inicial es menor que el último (' + num(a.medidor, 1) + ')</b>';
        if(cada && Math.floor(f / cada) > Math.floor(i / cada)) t += ' · <b class="margen-medio">toca mantenimiento (cada ' + num(cada) + ' h)</b>';
        return t; }
    },
    inspeccion:{
      activo:function(a){ return !!((D().criterios || {})[a.tipo]); }, req:function(){ return true; },
      html:function(){ return '<div id="rg-crit"></div><div id="rg-wll"></div><div class="campos">' + campo('rg-color', 'Color del periodo (opcional)', sel('rg-color', [['', 'Sin color']].concat((D().colores || []).map(function(c){ return [c, c]; })), '')) + '</div>' +
        campo('rg-nota', 'Observaciones (opcional)', '<textarea id="rg-nota" rows="2" maxlength="400"></textarea>'); },
      iniciar:function(ctx){
        var pinta = function(){ var a = actSel(ctx), C = a ? (D().criterios || {})[a.tipo] || [] : [], ad = a ? actDef(a.tipo) : {};
          $('rg-crit').innerHTML = C.length ? '<p style="font-weight:600; margin:4px 0 8px">Criterios de rechazo' + (ad.norma ? ' · ' + esc(NORMA_TXT(ad.norma)) : '') + '</p><div class="srv-chk">' + C.map(function(t, i){
            return '<div class="srv-chk-f"><span>' + esc(t) + '</span><span class="srv-seg" role="radiogroup" aria-label="' + esc(t) + '">' + [['cumple', 'Cumple'], ['no_cumple', 'No cumple']].map(function(v){
              return '<label><input type="radio" name="rg-k' + i + '" value="' + v[0] + '"><span>' + v[1] + '</span></label>'; }).join('') + '</span></div>'; }).join('') + '</div>' : '<p class="ayuda">Elige el elemento.</p>';
          $('rg-wll').innerHTML = ad.wll ? '<div class="campos">' + campo('rg-ram', 'Ramales', sel('rg-ram', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']], '1')) +
            campo('rg-ang', 'Ángulo con la horizontal (°)', inp('rg-ang', '90', ' inputmode="numeric"')) + '</div>' : '';
          if(ctx.re) ctx.re(); };
        if($('rg-act')) $('rg-act').addEventListener('change', pinta); pinta(); },
      leer:function(ctx){ var a = actSel(ctx); if(!a) return 'Elige el elemento.';
        var C = (D().criterios || {})[a.tipo] || [], k = {};
        for(var i = 0; i < C.length; i++){ var r = document.querySelector('input[name="rg-k' + i + '"]:checked'); if(!r) return 'Falta marcar: ' + C[i] + '.'; k[String(i)] = r.value; }
        var d = { criterios:k, color:val('rg-color') || null, nota:val('rg-nota') };
        if($('rg-ram')){ var g = nro('rg-ang'); if(!bien(g) || g < 1 || g > 90) return 'El ángulo va de 1 a 90 grados.'; d.ramales = Number(val('rg-ram')); d.angulo = g; }
        return { activo:a.id, datos:d }; },
      vivo:function(ctx){ var a = actSel(ctx); if(!a) return '';
        var C = (D().criterios || {})[a.tipo] || [], no = [], falta = 0;
        C.forEach(function(t, i){ var r = document.querySelector('input[name="rg-k' + i + '"]:checked'); if(!r) falta++; else if(r.value === 'no_cumple') no.push(t); });
        var t = falta ? 'Faltan ' + falta + ' criterios por marcar.' : no.length ? '<b class="margen-bajo">Rechazado:</b> ' + esc(no.join('; ')) + '. Al guardar, queda bloqueado (baja roja).' :
          '<b class="margen-alto">Aprobado.</b> Próximo control en ' + num(actDef(a.tipo).dias || ((D().certificados || {}).inspeccion || {}).dias || 90) + ' días.';
        if($('rg-ram')){ var w = attrNum(a, 'wll_t'), rm = Number(val('rg-ram')) || 1, g = nro('rg-ang'); g = bien(g) && g >= 1 && g <= 90 ? g : 90;
          if(w){ var s = rm === 1 ? w : Math.floor(w * Math.min(rm, 2) * Math.sin(g * Math.PI / 180) * 100) / 100;
            t += '<br>Carga de trabajo segura: <b>' + num(s, 2) + ' t</b>' + (rm > 2 ? ' (con 3 o 4 ramales se calcula con 2: criterio conservador)' : '') + (g < 30 ? ' · <b class="margen-bajo">ángulo menor a 30°</b>' : ''); }
          else t += '<br>Sin su WLL no se calcula la carga segura: ponla en la ficha del elemento.'; }
        return t; }
    },
    medicion:{ ancha:true,
      html:function(){
        return '<div class="campos">' + campo('rg-rn', 'Ruido: nivel de criterio en 8 h, dB(A)', inp('rg-rn', '85', ' inputmode="decimal"')) + campo('rg-rt', 'Tasa de intercambio (dB)', inp('rg-rt', '3', ' inputmode="decimal"')) + '</div>' +
          '<p class="ayuda" style="margin:-4px 0 10px">El criterio lo elige el laboratorio y queda escrito en el informe. El límite de cada punto lo declaras tú.</p>' +
          tablaFilas('rg-pts', [['Punto'], ['Agente'], ['Valor', 1], ['Límite', 1], ['Horas (ruido)', 1], ['Resultado']], 'Agregar punto'); },
      iniciar:function(ctx){ var A = D().agentes || [];
        filasVivas(ctx, 'rg-pts', function(i){ return '<td>' + inp('rg-p' + i, '', ' maxlength="80" placeholder="Zona de corte" aria-label="Punto"') + '</td><td>' + sel('rg-a' + i, A.map(function(x){ return [x.k, x.n + ' (' + x.u + ')']; }), 'ruido', ' aria-label="Agente"') + '</td>' +
          '<td class="num">' + inp('rg-v' + i, '', ' inputmode="decimal" style="max-width:90px" aria-label="Valor"') + '</td><td class="num">' + inp('rg-l' + i, '', ' inputmode="decimal" style="max-width:90px" aria-label="Límite"') + '</td>' +
          '<td class="num">' + inp('rg-h' + i, '', ' inputmode="decimal" style="max-width:80px" aria-label="Horas de exposición"') + '</td><td id="rg-r' + i + '"></td>'; }, 2); },
      calc:function(i, nv, ts){ var ag = val('rg-a' + i), v = nro('rg-v' + i), l = nro('rg-l' + i), h = nro('rg-h' + i), x = (D().agentes || []).filter(function(a){ return a.k === ag; })[0] || {};
        if(!bien(v)) return null;
        if(ag === 'ruido' && bien(h) && h >= 0.1 && h <= 24){ var dosis = r1(100 * h / (8 / Math.pow(2, (v - nv) / ts))); return { conforme:dosis <= 100, txt:'dosis ' + num(dosis, 1) + ' %' }; }
        if(bien(l)) return { conforme:x.minimo ? v >= l : v <= l, txt:(x.minimo ? 'mínimo ' : 'límite ') + num(l) };
        return null; },
      leer:function(){ var P = [], rn = nro('rg-rn'), rt = nro('rg-rt');
        var I = indices('rg-pts');
        for(var k = 0; k < I.length; k++){ var i = I[k], pu = val('rg-p' + i), v = nro('rg-v' + i); if(!pu && v == null) continue;
          if(!pu || !bien(v)) return 'Cada punto lleva su nombre y su valor.'; var l = nro('rg-l' + i), h = nro('rg-h' + i);
          if(l != null && !bien(l) || h != null && !bien(h)) return 'Revisa el límite y las horas del punto «' + pu + '».';
          P.push({ punto:pu, agente:val('rg-a' + i), valor:v, limite:l, horas:h }); }
        if(!P.length) return 'Agrega al menos un punto.'; if(P.length > 100) return 'Máximo 100 puntos.';
        return { datos:{ puntos:P, criterio_ruido:{ nivel:bien(rn) ? rn : 85, tasa:bien(rt) ? rt : 3 } } }; },
      vivo:function(){ var rn = nro('rg-rn'), rt = nro('rg-rt'), nv = bien(rn) && rn >= 70 && rn <= 100 ? rn : 85, ts = bien(rt) && rt >= 2 && rt <= 6 ? rt : 3, n = 0, mal = 0;
        indices('rg-pts').forEach(function(i){ var c = FORM.medicion.calc(i, nv, ts), td = $('rg-r' + i); if(!td) return;
          td.innerHTML = c ? pill(c.conforme ? 'Conforme' : 'No conforme', c.conforme ? 'ok' : 'mal') + '<span class="sub">' + esc(c.txt) + '</span>' : ''; if(c){ n++; if(!c.conforme) mal++; } });
        return n ? n + (n === 1 ? ' punto evaluado' : ' puntos evaluados') + ' · ' + (mal ? '<b class="margen-bajo">' + mal + ' no conformes</b>' : '<b class="margen-alto">todos conformes</b>') + ' · ruido con ' + num(nv) + ' dB(A) y tasa de ' + num(ts) + ' dB' : ''; }
    },
    calibracion:{ ancha:true,
      activo:function(){ return true; }, req:function(){ return true; },
      html:function(){ return '<div class="campos">' + campo('rg-tol', 'Tolerancia (± %)', inp('rg-tol', '10', ' inputmode="decimal"'), 'La fija el laboratorio y queda escrita en el certificado.') + '</div>' +
        tablaFilas('rg-lec', [['Gas o magnitud'], ['Patrón', 1], ['Lectura', 1], ['Error', 1], ['Resultado']], 'Agregar lectura'); },
      iniciar:function(ctx){
        filasVivas(ctx, 'rg-lec', function(i, v){ return '<td>' + inp('rg-g' + i, v.g || '', ' maxlength="20" placeholder="CO, H2S, dB, lux…" aria-label="Gas o magnitud"') + '</td><td class="num">' + inp('rg-pa' + i, '', ' inputmode="decimal" style="max-width:100px" aria-label="Patrón"') + '</td>' +
          '<td class="num">' + inp('rg-le' + i, '', ' inputmode="decimal" style="max-width:100px" aria-label="Lectura"') + '</td><td class="num" id="rg-e' + i + '"></td><td id="rg-o' + i + '"></td>'; }, 0);
        var pon = function(){ $('rg-lec').innerHTML = ''; var a = actSel(ctx), g = a && a.atributos && a.atributos.gases ? String(a.atributos.gases).split(/[,;]/).map(function(s){ return s.trim(); }).filter(Boolean).slice(0, 12) : [];
          if(g.length) g.forEach(function(x){ ctx.agregar({ g:x }); }); else ctx.agregar(); if(ctx.re) ctx.re(); };
        if($('rg-act')) $('rg-act').addEventListener('change', pon); pon(); },
      leer:function(ctx){ var a = actSel(ctx), tol = nro('rg-tol'), L = [], I = indices('rg-lec'); if(!a) return 'Elige el instrumento.';
        for(var k = 0; k < I.length; k++){ var i = I[k], g = val('rg-g' + i), p = nro('rg-pa' + i), l = nro('rg-le' + i); if(!g && p == null && l == null) continue;
          if(!g || !bien(p) || p <= 0 || !bien(l) || l < 0) return 'Cada lectura lleva su gas o magnitud, el patrón (mayor que 0) y la lectura.'; L.push({ gas:g, patron:p, lectura:l }); }
        if(!L.length) return 'Agrega al menos una lectura.'; if(L.length > 12) return 'Máximo 12 lecturas.';
        return { activo:a.id, datos:{ lecturas:L, tolerancia_pct:bien(tol) ? tol : 10 } }; },
      vivo:function(){ var tol = nro('rg-tol'), t = bien(tol) && tol >= 0.1 && tol <= 50 ? tol : 10, n = 0, mal = 0;
        indices('rg-lec').forEach(function(i){ var p = nro('rg-pa' + i), l = nro('rg-le' + i), e = $('rg-e' + i), o = $('rg-o' + i); if(!e) return;
          if(bien(p) && p > 0 && bien(l)){ var err = r1(Math.abs(l - p) / p * 100); e.textContent = num(err, 1) + ' %'; o.innerHTML = pill(err <= t ? 'Dentro' : 'Fuera', err <= t ? 'ok' : 'mal'); n++; if(err > t) mal++; }
          else { e.textContent = ''; o.innerHTML = ''; } });
        return n ? (mal ? '<b class="margen-bajo">Rechazado:</b> ' + mal + ' fuera de ±' + num(t, 1) + ' %. Al guardar, el instrumento queda bloqueado.' : '<b class="margen-alto">Aprobado</b> con ±' + num(t, 1) + ' %.') : ''; }
    },
    pesaje:{ ancha:true,
      html:function(){ return tablaFilas('rg-pes', [['Material'], ['Bruto (kg)', 1], ['Tara (kg)', 1], ['Impureza (%)', 1], ['Precio por kg (S/)', 1], ['Neto (kg)', 1], ['Monto', 1]], 'Agregar material'); },
      iniciar:function(ctx){ var M = D().materiales || [];
        filasVivas(ctx, 'rg-pes', function(i){ return '<td>' + sel('rg-m' + i, M.map(function(m){ return [m, m]; }), M[0], ' aria-label="Material"') + '</td>' +
          ['b', 't', 'i', 'p'].map(function(k){ return '<td class="num">' + inp('rg-' + k + i, '', ' inputmode="decimal" style="max-width:90px" aria-label="' + ({ b:'Bruto', t:'Tara', i:'Impureza', p:'Precio por kg' })[k] + '"') + '</td>'; }).join('') +
          '<td class="num" id="rg-n' + i + '"></td><td class="num" id="rg-s' + i + '"></td>'; }, 1); },
      linea:function(i){ var b = nro('rg-b' + i), t = nro('rg-t' + i), im = nro('rg-i' + i), p = nro('rg-p' + i); t = t == null ? 0 : t; im = im == null ? 0 : im; p = p == null ? 0 : p;
        if(!bien(b) || !bien(t) || !bien(im) || !bien(p) || t > b || im < 0 || im > 100) return null; var n = r2((b - t) * (1 - im / 100)); return { neto:n, monto:r2(n * p) }; },
      leer:function(){ var L = [], I = indices('rg-pes');
        for(var k = 0; k < I.length; k++){ var i = I[k], b = nro('rg-b' + i); if(b == null) continue; if(!FORM.pesaje.linea(i)) return 'Revisa cada línea: el bruto, la tara (no mayor que el bruto) y la impureza (0 a 100 %).';
          L.push({ material:val('rg-m' + i), bruto_kg:b, tara_kg:nro('rg-t' + i) || 0, impureza_pct:nro('rg-i' + i) || 0, precio_kg:nro('rg-p' + i) || 0 }); }
        if(!L.length) return 'Agrega al menos un material con su peso.'; if(L.length > 40) return 'Máximo 40 líneas.'; return { datos:{ lineas:L } }; },
      vivo:function(){ var kg = 0, s = 0; indices('rg-pes').forEach(function(i){ var x = FORM.pesaje.linea(i); $('rg-n' + i).textContent = x ? num(x.neto, 2) : ''; $('rg-s' + i).textContent = x ? soles(x.monto) : ''; if(x){ kg += x.neto; s += x.monto; } });
        return kg ? 'Total: <b>' + num(r2(kg), 2) + ' kg netos</b> · <b>' + soles(r2(s)) + '</b> a favor del cliente (se descuenta en la valorización; no se factura).' : ''; }
    },
    recojo:{ ancha:true,
      html:function(){ return tablaFilas('rg-res', [['Residuo'], ['Clase'], ['Cantidad', 1], ['Unidad']], 'Agregar residuo') +
        '<div class="campos">' + campo('rg-man', 'N.° de manifiesto (obligatorio con peligrosos)', inp('rg-man', '', ' maxlength="40"')) + campo('rg-des', 'Destino (relleno, planta, valorización)', inp('rg-des', '', ' maxlength="160"')) + '</div>'; },
      iniciar:function(ctx){ filasVivas(ctx, 'rg-res', function(i){ return '<td>' + inp('rg-t' + i, '', ' maxlength="80" placeholder="Aceite usado, trapos con grasa…" aria-label="Residuo"') + '</td><td>' +
        sel('rg-c' + i, [['no_peligroso', 'No peligroso'], ['peligroso', 'Peligroso']], 'no_peligroso', ' aria-label="Clase"') + '</td><td class="num">' + inp('rg-q' + i, '', ' inputmode="decimal" style="max-width:90px" aria-label="Cantidad"') + '</td><td>' +
        sel('rg-u' + i, [['kg', 'kg'], ['t', 't'], ['m3', 'm³'], ['gal', 'gal'], ['und', 'und']], 'kg', ' aria-label="Unidad"') + '</td>'; }, 1); },
      leer:function(){ var L = [], pel = 0, I = indices('rg-res');
        for(var k = 0; k < I.length; k++){ var i = I[k], t = val('rg-t' + i), q = nro('rg-q' + i); if(!t && q == null) continue; if(!t || !bien(q) || q <= 0) return 'Cada residuo lleva su nombre y su cantidad.';
          if(val('rg-c' + i) === 'peligroso') pel++; L.push({ tipo:t, clase:val('rg-c' + i), cantidad:q, unidad:val('rg-u' + i) }); }
        if(!L.length) return 'Agrega al menos un residuo.'; if(pel && !val('rg-man')) return 'Con residuos peligrosos va el número del manifiesto.';
        return { datos:{ residuos:L, manifiesto:val('rg-man'), destino:val('rg-des') } }; },
      vivo:function(){ var pel = 0, kg = 0; indices('rg-res').forEach(function(i){ var q = nro('rg-q' + i); if(val('rg-c' + i) === 'peligroso'){ pel++; if(bien(q)) kg += val('rg-u' + i) === 't' ? q * 1000 : val('rg-u' + i) === 'kg' ? q : 0; } });
        return pel ? pel + (pel === 1 ? ' residuo peligroso' : ' residuos peligrosos') + (kg ? ' · <b>' + num(r1(kg), 1) + ' kg</b>' : '') + (val('rg-man') ? '' : ' · <b class="margen-bajo">falta el manifiesto</b>') : ''; }
    },
    dosificacion:{
      activo:function(a){ return /^(reservorio|tanque_septico|comedor)$/.test(a.tipo); }, req:function(){ return false; },
      html:function(ctx){ var S = D().servicios || [];
        return '<div class="campos">' + campo('rg-sv', 'Servicio', sel('rg-sv', S.map(function(s){ return [s.k, s.n]; }), (ctx.o.datos || {}).servicio || (S[0] || {}).k)) +
          campo('rg-ar', 'Área (m²)', inp('rg-ar', '', ' inputmode="decimal"')) + campo('rg-vo', 'Volumen (m³)', inp('rg-vo', '', ' inputmode="decimal"')) + '</div>' +
          '<div class="campos">' + campo('rg-pn', 'Producto', inp('rg-pn', '', ' maxlength="120"')) + campo('rg-pr', 'Registro sanitario', inp('rg-pr', '', ' maxlength="60"')) +
          campo('rg-pv', 'Vence', inp('rg-pv', '', ' type="date"')) + campo('rg-pc', 'Concentración del producto (%)', inp('rg-pc', '', ' inputmode="decimal"')) + '</div>' +
          '<div class="campos">' + campo('rg-ppm', 'Dosis objetivo (ppm)', inp('rg-ppm', '', ' inputmode="decimal"')) + campo('rg-cl', 'Cloro residual medido (mg/L)', inp('rg-cl', '', ' inputmode="decimal"')) + '</div>'; },
      iniciar:function(ctx){ var pon = function(){ var s = it('servicios', val('rg-sv')) || {}; $('rg-ppm').value = s.ppm != null ? s.ppm : ''; $('rg-ppm').placeholder = s.ppm != null ? '' : 'la que uses';
          var a = actSel(ctx); if(a && attrNum(a, 'volumen_m3') && !val('rg-vo')) $('rg-vo').value = attrNum(a, 'volumen_m3'); };
        $('rg-sv').addEventListener('change', pon); if($('rg-act')) $('rg-act').addEventListener('change', pon); pon(); },
      leer:function(ctx){ var a = actSel(ctx); if(!val('rg-pn')) return 'Escribe el producto que se usó.';
        var x = { area:nro('rg-ar'), vol:nro('rg-vo'), conc:nro('rg-pc'), ppm:nro('rg-ppm'), cl:nro('rg-cl') };
        for(var k in x) if(x[k] != null && !bien(x[k])) return 'Revisa los números.';
        return { activo:a ? a.id : null, datos:{ servicio:val('rg-sv'), area_m2:x.area, volumen_m3:x.vol, producto:{ nombre:val('rg-pn'), registro:val('rg-pr'), vence:val('rg-pv') || null, conc_pct:x.conc },
          ppm:x.ppm, cloro_residual_mgl:x.cl } }; },
      vivo:function(){ var p = nro('rg-ppm'), v = nro('rg-vo'), c = nro('rg-pc'), t = '';
        if(bien(p) && bien(v) && bien(c) && c > 0) t = 'Producto a usar: <b>' + num(r2(p * v * 1000 / (c * 10000)), 2) + ' L</b> (' + num(p) + ' ppm en ' + num(v) + ' m³ con producto al ' + num(c) + ' %)';
        var s = it('servicios', val('rg-sv')) || {}; if(s.k === 'reservorio') t += (t ? '<br>' : '') + 'Reservorios: solución clorada de 50 ppm de cloro libre (' + esc(NORMA_TXT('RM449')) + ', art. 19).';
        if(val('rg-pv') && val('rg-pv') < (val('rg-f') || hoy())) t += (t ? '<br>' : '') + '<b class="margen-bajo">El producto está vencido:</b> el registro sale rechazado y no tiene certificado.';
        return t; }
    },
    cebaderas:{ ancha:true,
      html:function(){ return tablaFilas('rg-ceb', [['Estación'], ['Consumo'], ['Repuesto']], 'Agregar estación'); },
      iniciar:function(ctx){
        filasVivas(ctx, 'rg-ceb', function(i, v){ return '<td>' + inp('rg-e' + i, v.c || '', ' maxlength="30" style="max-width:140px" aria-label="Código de la estación"') + '</td><td>' + sel('rg-co' + i, [['sin', 'Sin consumo'], ['parcial', 'Parcial'], ['total', 'Total']], 'sin', ' aria-label="Consumo"') +
          '</td><td><label class="chk" style="margin:0"><input type="checkbox" id="rg-rp' + i + '"> Repuesto</label></td>'; }, 0);
        var C = (ctx.o.activos || []).filter(function(a){ return a.tipo === 'cebadera'; });
        if(C.length) C.forEach(function(a){ ctx.agregar({ c:a.codigo }); }); else for(var k = 0; k < 5; k++) ctx.agregar(); },
      leer:function(){ var L = [], I = indices('rg-ceb');
        for(var k = 0; k < I.length; k++){ var i = I[k], c = val('rg-e' + i); if(!c) continue; L.push({ codigo:c, consumo:val('rg-co' + i), repuesto:!!$('rg-rp' + i).checked }); }
        if(!L.length) return 'Agrega al menos una estación con su código.'; if(L.length > 300) return 'Máximo 300 estaciones.'; return { datos:{ estaciones:L } }; },
      vivo:function(){ var n = 0, t = 0; indices('rg-ceb').forEach(function(i){ if(val('rg-e' + i)){ n++; if(val('rg-co' + i) === 'total') t++; } });
        return n ? n + ' estaciones' + (t ? ' · <b class="margen-medio">' + t + ' con consumo total</b> (sale observado)' : '') : ''; }
    },
    viaje:{
      activo:function(a){ return actDef(a.tipo).medidor === 'km'; }, req:function(){ return false; },
      html:function(ctx){ var yo = ERP.yo.yo && ERP.yo.yo.nombre, min = (D().criterios_viaje || {}).horas_sueno_min || 6;
        return campo('rg-ru', 'Ruta', inp('rg-ru', (ctx.o.datos || {}).ruta || '', ' maxlength="160"')) +
          '<div class="campos">' + campo('rg-sa', 'Salida', inp('rg-sa', '', ' type="time"')) + campo('rg-ll', 'Llegada', inp('rg-ll', '', ' type="time"')) +
          campo('rg-pa', 'Pasajeros', inp('rg-pa', '', ' inputmode="numeric"')) + campo('rg-km', 'Kilómetros', inp('rg-km', '', ' inputmode="decimal"')) + '</div>' +
          '<div class="campos">' + campo('rg-co', 'Conductor', inp('rg-co', papel() === 'chofer' && yo ? yo : '', ' maxlength="120"')) +
          campo('rg-hs', 'Horas de sueño en las últimas 24 h', inp('rg-hs', '', ' inputmode="decimal"'), 'Mínimo ' + num(min) + ' h (lo fija tu empresa).') + '</div>' +
          '<p style="font-size:13px; font-weight:500; margin:0 0 6px">El conductor declara alcohol cero</p><div class="srv-seg" role="radiogroup" aria-label="Alcohol cero" style="margin:0 0 12px">' +
          '<label><input type="radio" name="rg-al" value="si"><span>Sí, alcohol cero</span></label><label><input type="radio" name="rg-al" value="no"><span>No</span></label></div>'; },
      leer:function(ctx){ var a = actSel(ctx), p = nro('rg-pa'), h = nro('rg-hs'), km = nro('rg-km'), al = document.querySelector('input[name="rg-al"]:checked');
        if(!val('rg-ru')) return 'Escribe la ruta.'; if(!bien(p) || p < 0) return 'Pon cuántos pasajeros.'; if(!bien(h) || h < 0 || h > 24) return 'Pon las horas de sueño del conductor (0 a 24).';
        if(!al) return 'Falta la declaración de alcohol cero.'; if(km != null && !bien(km)) return 'Revisa los kilómetros.';
        return { activo:a ? a.id : null, datos:{ ruta:val('rg-ru'), salida:val('rg-sa'), llegada:val('rg-ll'), pasajeros:p, horas_sueno:h, alcohol_cero:al.value === 'si', conductor:val('rg-co'), km:km } }; },
      vivo:function(ctx){ var a = actSel(ctx), p = nro('rg-pa'), h = nro('rg-hs'), al = document.querySelector('input[name="rg-al"]:checked'), min = (D().criterios_viaje || {}).horas_sueno_min || 6, t = [];
        if(al && al.value === 'no') t.push('<b class="margen-bajo">No sale:</b> sin alcohol cero.');
        if(bien(h) && h < min) t.push('<b class="margen-bajo">No sale:</b> menos de ' + num(min) + ' h de sueño.');
        var as = attrNum(a, 'asientos'); if(as && bien(p) && p > as) t.push('<b class="margen-bajo">Más pasajeros que asientos (' + num(as) + ').</b>');
        if(!t.length && al && bien(h)) t.push('<b class="margen-alto">Puede salir.</b>');
        return t.join(' '); }
    },
    asistencia:{ ancha:true,
      html:function(ctx){ var cu = ctx.curso;
        return '<div class="campos">' + campo('rg-te', 'Tema', inp('rg-te', cu ? cu.nombre || '' : '', ' maxlength="160"')) + campo('rg-ho', 'Horas', inp('rg-ho', cu && cu.atributos ? cu.atributos.horas || '' : '', ' inputmode="decimal"')) +
          campo('rg-in', 'Instructor', inp('rg-in', ERP.yo.yo && ERP.yo.yo.nombre || '', ' maxlength="120"')) + '</div>' +
          tablaFilas('rg-par', [['Apellidos y nombres'], ['Documento'], ['Nota (0 a 20)', 1]], 'Agregar participante') +
          '<details style="margin:10px 0 12px"><summary class="ayuda" style="cursor:pointer">Pegar la lista (una persona por línea: nombre; documento; nota)</summary><textarea id="rg-pegar" rows="4" style="margin-top:6px" placeholder="Rojas Pérez, Ana; 40000001; 16"></textarea>' +
          '<button type="button" class="bt sec mini" id="rg-pegar-bt" style="margin-top:6px">Agregar a la lista</button></details>' +
          '<p class="ayuda">El nombre y el documento quedan en tu sistema; en el certificado y en la verificación pública el documento sale tapado (••••1234).</p>'; },
      iniciar:function(ctx){
        filasVivas(ctx, 'rg-par', function(i, v){ return '<td>' + inp('rg-n' + i, v.n || '', ' maxlength="120" aria-label="Nombre"') + '</td><td>' + inp('rg-d' + i, v.d || '', ' maxlength="15" style="max-width:130px" aria-label="Documento"') + '</td>' +
          '<td class="num">' + inp('rg-no' + i, v.no || '', ' inputmode="decimal" style="max-width:70px" aria-label="Nota"') + '</td>'; }, 3);
        $('rg-pegar-bt').onclick = function(){ var vacias = indices('rg-par').filter(function(i){ return !val('rg-n' + i) && !val('rg-d' + i); });
          vacias.forEach(function(i){ var tr = document.querySelector('#rg-par tr[data-i="' + i + '"]'); if(tr) tr.remove(); });
          val('rg-pegar').split(/\r?\n/).forEach(function(l){ var p = l.split(/[;\t]/).map(function(s){ return s.trim(); }); if(p[0]) ctx.agregar({ n:p[0], d:(p[1] || '').replace(/\s/g, ''), no:p[2] || '' }); });
          $('rg-pegar').value = ''; ctx.re(); }; },
      leer:function(ctx){ var L = [], I = indices('rg-par'), h = nro('rg-ho');
        if(!val('rg-te')) return 'Escribe el tema.'; if(h != null && !(bien(h) && h >= 0.5 && h <= 200)) return 'Las horas van de 0.5 a 200.';
        for(var k = 0; k < I.length; k++){ var i = I[k], n = val('rg-n' + i), d = val('rg-d' + i).replace(/\s/g, ''), no = nro('rg-no' + i); if(!n && !d) continue;
          if(!n || !/^[A-Za-z0-9]{4,15}$/.test(d)) return 'Cada participante lleva su nombre y su documento (4 a 15 letras o números): revisa «' + (n || d) + '».';
          if(no != null && !(bien(no) && no >= 0 && no <= 20)) return 'La nota va de 0 a 20: revisa «' + n + '».';
          L.push({ nombre:n, doc:d, nota:no }); }
        if(!L.length) return 'Agrega a los participantes.'; if(L.length > 300) return 'Máximo 300 participantes.';
        return { activo:ctx.curso ? ctx.curso.id : null, datos:{ tema:val('rg-te'), horas:h, instructor:val('rg-in'), participantes:L } }; },
      vivo:function(ctx){ var min = attrNum(ctx.curso, 'nota_min') || 14, n = 0, ap = 0;
        indices('rg-par').forEach(function(i){ if(val('rg-n' + i) || val('rg-d' + i)){ n++; var no = nro('rg-no' + i); if(no == null || (bien(no) && no >= min)) ap++; } });
        return n ? n + ' participantes · <b>' + ap + ' aprueban</b> (nota mínima ' + num(min) + '; sin nota, cuenta como asistencia)' : ''; }
    },
    atencion:{
      html:function(){ return '<div class="aviso neu">Solo la aptitud y su vigencia: <b>nunca diagnósticos ni resultados</b>. La historia clínica se queda en el centro médico.</div>' +
        '<div class="campos">' + campo('rg-tn', 'Apellidos y nombres del trabajador', inp('rg-tn', '', ' maxlength="120" autocomplete="off"')) + campo('rg-td', 'Documento', inp('rg-td', '', ' maxlength="15" autocomplete="off"')) +
        campo('rg-te', 'Examen', sel('rg-te', [['ingreso', 'De ingreso'], ['periodico', 'Periódico'], ['retiro', 'De retiro'], ['otro', 'Otro']], 'periodico')) +
        campo('rg-ap', 'Aptitud', sel('rg-ap', [['apto', 'Apto'], ['apto_restr', 'Apto con restricciones'], ['no_apto', 'No apto'], ['observado', 'Observado (falta un resultado)']], 'apto')) +
        campo('rg-ve', 'Vigencia hasta', inp('rg-ve', '', ' type="date"')) + '</div>'; },
      leer:function(){ var d = val('rg-td').replace(/\s/g, ''), ap = val('rg-ap');
        if(!val('rg-tn')) return 'Escribe el nombre del trabajador.'; if(!/^[A-Za-z0-9]{4,15}$/.test(d)) return 'El documento va de 4 a 15 letras o números.';
        if((ap === 'apto' || ap === 'apto_restr') && !(val('rg-ve') > (val('rg-f') || hoy()))) return 'Pon hasta cuándo vale la aptitud (después de la fecha de la atención).';
        return { datos:{ trabajador:{ nombre:val('rg-tn'), doc:d }, tipo_emo:val('rg-te'), aptitud:ap, vence:val('rg-ve') || null } }; },
      vivo:function(){ var ap = val('rg-ap'); return ap === 'observado' ? 'Sale <b>observado</b>: la constancia se emite cuando haya resultado.' : ap === 'no_apto' ? 'Sale <b class="margen-bajo">no apto</b>: la constancia lo dice.' : ''; }
    },
    endoso:{
      activo:function(a){ return /^(poliza_salud|poliza_pension|vida_ley)$/.test(a.tipo); }, req:function(){ return true; },
      html:function(){ return '<div class="campos">' + campo('rg-pe', 'Mes', inp('rg-pe', hoy().slice(0, 7), ' type="month"')) + campo('rg-as', 'Asegurados del mes', inp('rg-as', '', ' inputmode="numeric"')) +
        campo('rg-al', 'Altas', inp('rg-al', '', ' inputmode="numeric" placeholder="0"')) + campo('rg-ba', 'Bajas', inp('rg-ba', '', ' inputmode="numeric" placeholder="0"')) + campo('rg-pr', 'Prima del mes (S/)', inp('rg-pr', '', ' inputmode="decimal"')) + '</div>' +
        campo('rg-cons', 'Constancia de la aseguradora (PDF, opcional)', '<input type="file" id="rg-cons" accept="application/pdf">') +
        '<p class="ayuda">Solo los números del mes: la lista de trabajadores no entra aquí.</p>'; },
      leer:function(ctx){ var a = actSel(ctx), as = nro('rg-as'), pr = nro('rg-pr'), al = nro('rg-al'), ba = nro('rg-ba'), f = $('rg-cons').files && $('rg-cons').files[0];
        if(!a) return 'Elige la póliza.'; if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(val('rg-pe'))) return 'Elige el mes.';
        if(!bien(as) || as < 0 || !bien(pr) || pr < 0) return 'Pon los asegurados y la prima.'; if(al != null && !bien(al) || ba != null && !bien(ba)) return 'Revisa las altas y bajas.';
        if(f && f.size > 10 * 1024 * 1024) return 'El PDF pasa los 10 MB.';
        return { activo:a.id, archivo:f || null, datos:{ periodo:val('rg-pe'), asegurados:as, altas:al || 0, bajas:ba || 0, prima:pr } }; },
      vivo:function(ctx){ var a = actSel(ctx), pr = nro('rg-pr'), c = attrNum(a, 'comision_pct'); return c && bien(pr) ? 'Tu comisión: <b>' + soles(r2(pr * c / 100)) + '</b> (' + num(c) + ' % de la póliza)' : ''; }
    },
    siniestro:{
      activo:function(a){ return /^(poliza_salud|poliza_pension|vida_ley)$/.test(a.tipo); }, req:function(){ return false; },
      html:function(){ return '<div class="campos">' + campo('rg-fe', 'Fecha del evento', inp('rg-fe', '', ' type="date"')) + campo('rg-es', 'Estado', sel('rg-es', [['reportado', 'Reportado'], ['en_atencion', 'En atención'], ['cerrado', 'Cerrado']], 'reportado')) +
        campo('rg-mo', 'Monto (S/, opcional)', inp('rg-mo', '', ' inputmode="decimal"')) + '</div>' +
        campo('rg-de', 'Qué pasó (sin nombres ni datos de salud)', '<textarea id="rg-de" rows="2" maxlength="200"></textarea>'); },
      leer:function(ctx){ var a = actSel(ctx), mo = nro('rg-mo'); if(!val('rg-fe')) return 'Pon la fecha del evento.'; if(mo != null && !bien(mo)) return 'Revisa el monto.';
        return { activo:a ? a.id : null, datos:{ fecha_evento:val('rg-fe'), estado:val('rg-es'), descripcion:val('rg-de'), monto:mo } }; }
    },
    servicio:{
      html:function(){ return '<div class="campos">' + campo('rg-ho', 'Horas', inp('rg-ho', '', ' inputmode="decimal" placeholder="0"'), 'Si cobras por hora, se valoriza con ellas.') + '</div>' +
        campo('rg-ac', 'Lo que se hizo', '<textarea id="rg-ac" rows="3" maxlength="600"></textarea>') + campo('rg-en', 'Entregables (opcional)', '<textarea id="rg-en" rows="2" maxlength="400"></textarea>'); },
      leer:function(){ var h = nro('rg-ho'); if(!val('rg-ac')) return 'Escribe lo que se hizo.'; if(h != null && !(bien(h) && h >= 0 && h <= 500)) return 'Revisa las horas.';
        return { datos:{ horas:h || 0, actividades:val('rg-ac'), entregables:val('rg-en') } }; }
    },
    raciones:{
      activo:function(a){ return a.tipo === 'comedor'; }, req:function(){ return false; },
      html:function(){ return '<div class="campos">' + ['desayuno', 'almuerzo', 'cena', 'otros'].map(function(k){ return campo('rg-' + k, k.charAt(0).toUpperCase() + k.slice(1), inp('rg-' + k, '', ' inputmode="numeric" placeholder="0"')); }).join('') + '</div>' +
        tablaFilas('rg-tem', [['Cámara o equipo'], ['Temperatura (°C)', 1]], 'Agregar temperatura'); },
      iniciar:function(ctx){ filasVivas(ctx, 'rg-tem', function(i, v){ return '<td>' + inp('rg-ca' + i, v.c || '', ' maxlength="40" aria-label="Cámara"') + '</td><td class="num">' + inp('rg-gr' + i, '', ' inputmode="decimal" style="max-width:90px" aria-label="Grados"') + '</td>'; }, 0);
        ctx.agregar({ c:'Cámara de refrigeración' }); ctx.agregar({ c:'Cámara de congelación' }); },
      leer:function(){ var x = {}, T = [];
        for(var k = 0, K = ['desayuno', 'almuerzo', 'cena', 'otros']; k < K.length; k++){ var v = nro('rg-' + K[k]); if(v != null && !(bien(v) && v >= 0)) return 'Revisa las raciones.'; x[K[k]] = v || 0; }
        if(!(x.desayuno + x.almuerzo + x.cena + x.otros)) return 'Pon las raciones del día.';
        indices('rg-tem').forEach(function(i){ var g = nro('rg-gr' + i); if(val('rg-ca' + i) && bien(g)) T.push({ camara:val('rg-ca' + i), grados:g }); });
        x.temperaturas = T; return { datos:x }; },
      vivo:function(){ var s = 0; ['desayuno', 'almuerzo', 'cena', 'otros'].forEach(function(k){ var v = nro('rg-' + k); if(bien(v)) s += v; }); return s ? '<b>' + num(s) + ' raciones</b> del día' : ''; }
    }
  };
  function subirFotos(fs){
    if(!fs.length) return Promise.resolve([]);
    return docs().then(function(Dd){ return fs.reduce(function(p, f){ return p.then(function(arr){ return Dd.achicarFoto(f).then(function(bl){ return edge('/subir?uso=pod', bl, 'image/jpeg'); })
      .then(function(s){ if(!s || !s.ok) throw s || { motivo:'no_se_guardo' }; arr.push(s.ruta); return arr; }); }); }, Promise.resolve([])); });
  }
  function llenar(o, tipo){
    var F = FORM[tipo]; if(!F){ toast('Ese registro no está en esta pantalla.'); return; }
    activosTodos().catch(function(){ return []; }).then(function(TA){
      var ids = (o.activos || []).map(function(a){ return a.id; }), base = ids.length ? TA.filter(function(a){ return ids.indexOf(a.id) >= 0; }) : TA.filter(function(a){ return a.estado !== 'baja' && !DE_CATALOGO[a.tipo]; });
      var ctx = { o:o, tipo:tipo, gps:null, acts:F.activo ? base.filter(function(a){ return F.activo(a); }) : [], curso:null };
      if(tipo === 'asistencia' && (o.datos || {}).curso) ctx.curso = TA.filter(function(a){ return a.id === o.datos.curso; })[0] || null;
      var req = F.req && F.req();
      if(req && !ctx.acts.length){ toast('Esta orden no tiene ' + uno().toLowerCase() + ' para este registro: agrégalo en la orden.'); return; }
      var pre = ctx.acts.length && (req || ids.length) ? ctx.acts[0].id : '';
      var selAct = F.activo && ctx.acts.length ? campo('rg-act', uno(), sel('rg-act', (req ? [] : [['', 'Ninguno']]).concat(ctx.acts.map(function(a){ return [a.id, a.codigo + ' · ' + (a.tipo_n || '') + (a.estado !== 'operativo' ? ' (' + (EST_ACT[a.estado] || [a.estado])[0].toLowerCase() + ')' : '')]; })), pre)) : '';
      var html = '<p class="ayuda" style="margin:0 0 10px"><span class="mono">' + esc(o.numero) + '</span> · ' + esc([o.cliente_n || 'Sin cliente', o.sede].filter(Boolean).join(' · ')) + '</p>' +
        '<div class="campos">' + selAct + campo('rg-f', 'Fecha', inp('rg-f', hoy(), ' type="date" max="' + masDias(hoy(), 1) + '"')) + '</div>' + F.html(ctx) +
        '<div class="aviso neu srv-vivo" id="rg-vivo" aria-live="polite" hidden></div>' +
        campo('rg-fotos', 'Fotos (opcional, hasta 8)', '<input type="file" id="rg-fotos" accept="image/*" multiple>', 'Se achican y se guardan sin la ubicación del celular.') +
        '<p class="ayuda" id="rg-gps">Tomando la ubicación (opcional)…</p>';
      hoja({ titulo:regN(tipo) + ' · ' + o.numero, ancha:!!F.ancha, html:html,
        alAbrir:function(api){
          ctx.re = function(){ var c = $('rg-vivo'); if(!c) return; var t = F.vivo ? F.vivo(ctx) : ''; c.hidden = !t; c.innerHTML = t || ''; };
          if(F.iniciar) F.iniciar(ctx);
          api.el.addEventListener('input', ctx.re); api.el.addEventListener('change', ctx.re); ctx.re();
          if(navigator.geolocation) navigator.geolocation.getCurrentPosition(function(p){ ctx.gps = { lat:p.coords.latitude, lng:p.coords.longitude, prec:p.coords.accuracy };
              var g = $('rg-gps'); if(g) g.textContent = 'Ubicación tomada (±' + Math.round(p.coords.accuracy) + ' m).'; },
            function(){ var g = $('rg-gps'); if(g) g.textContent = 'Sin ubicación (el GPS está apagado o sin permiso): se guarda igual.'; }, { enableHighAccuracy:true, timeout:15000, maximumAge:120000 });
          else $('rg-gps').textContent = 'Este equipo no da ubicación: se guarda igual.';
        },
        botones:[{ t:'Cancelar', c:'sec' }, { t:'Guardar', c:'casco', a:function(api){
          var l = F.leer(ctx); if(typeof l === 'string') return api.msg(l);
          var fe = val('rg-f'); if(!fe) return api.msg('Pon la fecha.');
          var fl = $('rg-fotos').files || []; if(fl.length > 8) return api.msg('Máximo 8 fotos.');
          var fs = [].slice.call(fl, 0, 8);
          api.ocupado(true); api.msg(fs.length || l.archivo ? 'Subiendo…' : 'Guardando…', true);
          subirFotos(fs).then(function(rutas){
            var pre = l.archivo ? edge('/subir?uso=cert', l.archivo).then(function(s){ if(!s || !s.ok) throw s || { motivo:'no_se_guardo' }; l.datos.constancia = s.ruta; }) : Promise.resolve();
            return pre.then(function(){ return rpc('erp_srv_registro_guardar', { orden:o.id, tipo:tipo, activo:l.activo || null, fecha:fe, datos:l.datos, fotos:rutas, gps:ctx.gps }); });
          }).then(function(j){
            api.ocupado(false);
            if(!j || !j.ok){ if(pide2FA(j)){ api.cerrar(); return; } return api.msg(msg(j)); }
            api.cerrar();
            var r = j.registro, res = r.resultado;
            toast('Se guardó «' + regN(r.tipo) + '»' + (res && res !== 'ok' || r.tipo === 'atencion' ? ': ' + resTxt(r.tipo, res, r.datos).toLowerCase() : '') +
              (res === 'critico' || res === 'rechazado' && /^(inspeccion|calibracion)$/.test(r.tipo) ? '. Quedó bloqueado.' : res === 'bloqueado' ? '. El viaje no sale.' : (r.calculo || {}).mantenimiento ? '. Toca mantenimiento.' : '.'));
            repintar();
          }, function(e){ api.ocupado(false); api.msg(msg(e)); });
        } }] });
    });
  }

  /* ═════════════════ ACTIVOS ═════════════════ */
  PINTAR.srv_activos = function(){
    $('vista').innerHTML = cabecera('srv_activos') + '<p class="ayuda" id="cargando">Cargando…</p>';
    activosTodos(true).then(function(){ pintarActivos(); }, function(j){ fuera(j); });
  };
  function pintarActivos(){
    var L = ERP.cache.srvAct || [], f = ERP.cache.srvActF || (ERP.cache.srvActF = { tipo:'', estado:'', q:'' }), tipos = [];
    L.forEach(function(a){ if(tipos.indexOf(a.tipo) < 0) tipos.push(a.tipo); });
    var F = L.filter(function(a){ return (!f.tipo || a.tipo === f.tipo) && (f.estado ? a.estado === f.estado : a.estado !== 'baja') &&
      (!f.q || (a.codigo + ' ' + (a.nombre || '') + ' ' + (a.cliente_n || '')).toLowerCase().indexOf(f.q.toLowerCase()) >= 0); });
    ERP.cache.srvActVis = F;
    var h = '<div class="filtros">' + (gestiona() ? '<button type="button" class="bt" data-a="srvActNuevo">Nuevo</button>' : '') +
      (tipos.length > 1 ? [['', 'Todos']].concat(tipos.map(function(t){ return [t, actDef(t).n || t]; })).map(function(x){ return '<button type="button" data-a="srvActTipo" data-id="' + esc(x[0]) + '" class="' + (x[0] === f.tipo ? 'on' : '') + '">' + esc(x[1]) + '</button>'; }).join('') : '') +
      '<select id="sa-est" aria-label="Estado" style="max-width:170px">' + [['', 'En uso'], ['operativo', 'Operativos'], ['observado', 'Observados'], ['bloqueado', 'Bloqueados'], ['baja', 'De baja']].map(function(x){ return '<option value="' + x[0] + '"' + (x[0] === f.estado ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select>' +
      '<input id="sa-q" placeholder="Buscar" value="' + esc(f.q) + '" aria-label="Buscar por código, nombre o cliente">' +
      (F.length ? '<button type="button" class="bt sec mini" data-a="srvEtiquetas">Etiquetas con QR (' + F.length + ')</button>' : '') + '</div>';
    h += tabla([{ t:'Código', k:function(a){ return '<span class="mono">' + esc(a.codigo) + '</span>' + (a.nombre ? '<span class="sub">' + esc(a.nombre) + '</span>' : ''); } },
      { t:'Tipo', k:function(a){ return esc(a.tipo_n || a.tipo); } }, { t:'Cliente', k:function(a){ return esc(a.cliente_n || '—'); } },
      { t:'Estado', k:function(a){ return pillDe(EST_ACT, a.estado) + (a.motivo && a.estado !== 'operativo' ? '<span class="sub">' + esc(a.motivo) + '</span>' : ''); } },
      { t:'Documentos', k:function(a){ return a.docs_vencidos ? pill(a.docs_vencidos + ' vencido' + (a.docs_vencidos > 1 ? 's' : ''), 'mal') : a.docs_por_vencer ? pill(a.docs_por_vencer + ' por vencer', 'med') : (a.documentos || []).length ? pill('al día', 'ok') : '—'; } },
      { t:'Próximo control', k:function(a){ return a.prox_control ? (a.control_vencido ? pill('venció ' + fecha(a.prox_control), 'mal') : fecha(a.prox_control)) : '—'; } },
      { t:'Medidor', n:1, k:function(a){ var m = actDef(a.tipo).medidor; return a.medidor != null && m ? num(a.medidor, 1) + ' ' + (m === 'horometro' ? 'h' : 'km') : '—'; } }],
      F, { a:'srvActivo', vacio:L.length ? 'Nada con ese filtro' : 'Todavía no tienes ' + activosN().toLowerCase(), vacioSub:L.length ? '' : gestiona() ? 'Crea el primero con «Nuevo».' : '' });
    var c = $('cargando'); if(c) c.outerHTML = '<div id="sa-lista">' + h + '</div>'; else if($('sa-lista')) $('sa-lista').innerHTML = h;
    $('sa-est').onchange = function(){ f.estado = this.value; pintarActivos(); };
    var q = $('sa-q'); q.oninput = function(){ clearTimeout(pintarActivos._t); var v = q.value; pintarActivos._t = setTimeout(function(){ f.q = v; pintarActivos(); var n = $('sa-q'); if(n){ n.focus(); n.setSelectionRange(v.length, v.length); } }, 250); };
  }
  ACC.srvActTipo = function(b){ ERP.cache.srvActF.tipo = b.getAttribute('data-id'); pintarActivos(); };
  ACC.srvEtiquetas = function(b){ b.disabled = true; docs().then(function(Dd){ return Dd.etiquetasActivos(ERP.cache.srvActVis || []); }).then(function(){ b.disabled = false; }, function(){ b.disabled = false; toast('No se pudo armar el PDF.'); }); };
  ACC.srvActNuevo = function(){ formActivo(null); };
  ACC.srvActivo = function(b){ var a = (ERP.cache.srvAct || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0]; if(a) fichaActivo(a); };
  function fichaActivo(a){
    var ad = actDef(a.tipo), at = a.atributos || {};
    var html = '<div style="margin:0 0 10px">' + pillDe(EST_ACT, a.estado) + (a.motivo && a.estado !== 'operativo' ? ' <span class="chico">' + esc(a.motivo) + '</span>' : '') + '</div>' +
      '<dl class="srv-dl">' + [['Tipo', a.tipo_n], ['Nombre', a.nombre], ['Cliente', a.cliente_n]].concat((ad.attrs || []).map(function(k){ return [ATTR[k] || k, at[k]]; }))
        .concat([['Medidor', a.medidor != null && ad.medidor ? num(a.medidor, 1) + (ad.medidor === 'horometro' ? ' h' : ' km') : ''], ['Próximo control', a.prox_control ? fecha(a.prox_control) + (a.control_vencido ? ' (vencido)' : '') : '']])
        .filter(function(x){ return x[1] != null && x[1] !== ''; }).map(function(x){ return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
      ((ad.docs || []).length ? '<h3 style="font-size:14.5px; margin:4px 0 8px">Documentos</h3>' + tabla([{ t:'Documento', k:function(d){ return esc(d.n); } }, { t:'Número', k:function(d){ return esc(d.numero || '—'); } },
          { t:'Vence', k:function(d){ return d.vence ? (d.dias < 0 ? pill('venció ' + fecha(d.vence), 'mal') : d.dias <= 30 ? pill(fecha(d.vence), 'med') : fecha(d.vence)) : '—'; } },
          { t:'', k:function(d){ return d.archivo ? '<button type="button" class="bt-link" data-a="verArchivo" data-id="' + esc(d.archivo) + '">Ver</button>' : ''; } }], a.documentos, { vacio:'Sin documentos cargados' }) : '') +
      '<div class="tarj" style="margin-top:6px"><h2>Su QR</h2><p class="ayuda" style="margin:0 0 8px">Quien lo escanea en la obra ve si está habilitado, sus documentos y su último certificado (sin precios).</p>' +
      '<div class="acciones"><input readonly id="sa-qr" class="mono" value="' + esc(a.qr) + '"><button type="button" class="bt sec mini" data-a="copiar" data-id="sa-qr">Copiar</button></div></div>';
    hoja({ titulo:a.codigo + (a.tipo_n ? ' · ' + a.tipo_n : ''), ancha:true, html:html, botones:[{ t:'Cerrar', c:'sec' }, { t:'Etiqueta con QR', c:'sec', a:function(){ docs().then(function(Dd){ Dd.etiquetasActivos([a]); }); } }]
      .concat(gestiona() ? [{ t:'Cambiar el estado', c:'sec', a:function(api){ api.cerrar(); estadoActivo(a); } }, { t:'Editar', a:function(api){ api.cerrar(); formActivo(a); } }] : []) });
  }
  function estadoActivo(a){
    hoja({ titulo:'Estado de ' + a.codigo, html:campo('se-e', 'Estado', sel('se-e', [['operativo', 'Operativo: entra a la obra'], ['observado', 'Observado: con algo por corregir'], ['bloqueado', 'Bloqueado: no se usa'], ['baja', 'De baja']], a.estado)) +
        campo('se-m', 'Motivo (queda en el registro y lo ve quien escanea el QR si está bloqueado)', inp('se-m', '', ' maxlength="300"')),
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Guardar', a:function(api){ if(!val('se-m')) return api.msg('Escribe el motivo.');
        guarda(api, rpc('erp_srv_activo_estado', { id:a.id, estado:val('se-e'), motivo:val('se-m') }), 'Estado guardado.', function(){ if(ERP.sec === 'srv_activos') PINTAR.srv_activos(); }); } }] });
  }
  function formActivo(a){
    catClientes().then(function(){
      var d = D(), tipos = (d.activos || []), t0 = a ? a.tipo : (tipos[0] || {}).k, cli = a && a.cliente ? (ERP.cache.cli || []).filter(function(c){ return c.id === a.cliente; })[0] : null;
      var docsDe = {}; ((a && a.documentos) || []).forEach(function(x){ docsDe[x.k] = x; });
      var cuerpo = function(t){ var ad = actDef(t), at = (a && a.atributos) || {};
        return ((ad.attrs || []).length ? '<div class="campos">' + ad.attrs.map(function(k){ return campo('sf-at-' + k, ATTR[k] || k, inp('sf-at-' + k, at[k], ' maxlength="120"' + (ATTR_NUM.test(k) ? ' inputmode="decimal"' : ''))); }).join('') + '</div>' : '') +
          (ad.medidor && !a ? campo('sf-med', ad.medidor === 'horometro' ? 'Horómetro de hoy' : 'Kilometraje de hoy', inp('sf-med', '', ' inputmode="decimal"')) : '') +
          ((ad.docs || []).length ? '<p style="font-size:13px; font-weight:600; margin:6px 0 6px">Documentos</p>' + ad.docs.map(function(x){ var v = docsDe[x.k] || {};
            return '<div class="campos" style="border-top:1px solid #EEF2F5; padding-top:8px">' + campo('sf-dn-' + x.k, x.n + ' · número', inp('sf-dn-' + x.k, v.numero, ' maxlength="60"')) +
              campo('sf-dv-' + x.k, x.vence ? 'Vence' : 'Vence (si aplica)', inp('sf-dv-' + x.k, v.vence, ' type="date"')) +
              campo('sf-da-' + x.k, 'PDF (opcional)', '<input type="file" id="sf-da-' + x.k + '" accept="application/pdf">' + (v.archivo ? '<span class="ayuda">Ya tiene uno: si eliges otro, lo reemplaza.</span>' : '')) + '</div>'; }).join('') : ''); };
      hoja({ titulo:a ? 'Editar ' + a.codigo : 'Nuevo: ' + activosN().toLowerCase(), ancha:true,
        html:'<div class="campos">' + campo('sf-tipo', 'Tipo', sel('sf-tipo', tipos.map(function(x){ return [x.k, x.n]; }), t0, a ? ' disabled' : '')) +
            campo('sf-cod', 'Código (único)', inp('sf-cod', a ? a.codigo : '', ' maxlength="40" class="mono" autocomplete="off"')) + campo('sf-nom', 'Nombre o descripción', inp('sf-nom', a ? a.nombre : '', ' maxlength="160"')) + '</div>' +
          campo('sf-cli', 'Cliente (opcional: de quién es o dónde está)', inp('sf-cli', cli ? (cli.num_doc || 's/d') + ' · ' + cli.razon_social : '', ' list="sf-cli-l" autocomplete="off"') + listaCli('sf-cli-l')) +
          '<div id="sf-cuerpo">' + cuerpo(t0) + '</div><p class="ayuda">Sin datos de trabajadores: aquí va el ' + esc(uno().toLowerCase()) + ', no personas.</p>',
        alAbrir:function(){ $('sf-tipo').onchange = function(){ $('sf-cuerpo').innerHTML = cuerpo(val('sf-tipo')); }; },
        botones:[{ t:'Cancelar', c:'sec' }, { t:'Guardar', a:function(api){
          var t = val('sf-tipo'), ad = actDef(t), ct = val('sf-cli'), cl = ct ? cliDe(ct) : null;
          if(!val('sf-cod')) return api.msg('Escribe el código.');
          if(ct && !cl) return api.msg('Elige el cliente de la lista.');
          var p = { tipo:t, codigo:val('sf-cod'), nombre:val('sf-nom'), cliente:cl ? cl.id : null, atributos:{}, documentos:[] }, subir = [];
          (ad.attrs || []).forEach(function(k){ if(val('sf-at-' + k)) p.atributos[k] = val('sf-at-' + k); });
          if($('sf-med') && val('sf-med')){ var m = nro('sf-med'); if(!bien(m) || m < 0) return api.msg('Revisa el medidor.'); p.medidor = m; }
          for(var i = 0; i < (ad.docs || []).length; i++){ var x = ad.docs[i], n = val('sf-dn-' + x.k), ve = val('sf-dv-' + x.k), f = $('sf-da-' + x.k).files && $('sf-da-' + x.k).files[0], ya = docsDe[x.k] || {};
            if(!n && !ve && !f && !ya.archivo) continue;
            if(x.vence && !ve) return api.msg('Pon la fecha de vencimiento de: ' + x.n + '.');
            if(f && f.size > 10 * 1024 * 1024) return api.msg('El PDF de ' + x.n + ' pasa los 10 MB.');
            var dd = { k:x.k, numero:n, vence:ve || null, archivo:ya.archivo || null }; p.documentos.push(dd); if(f) subir.push([dd, f]); }
          if(a) p.id = a.id;
          api.ocupado(true); if(subir.length) api.msg('Subiendo…', true);
          subir.reduce(function(pr, s){ return pr.then(function(){ return edge('/subir?uso=cert', s[1]).then(function(r){ if(!r || !r.ok) throw r || { motivo:'no_se_guardo' }; s[0].archivo = r.ruta; }); }); }, Promise.resolve())
            .then(function(){ return guarda(api, rpc('erp_srv_activo_guardar', p), a ? 'Guardado.' : 'Creado.', function(){ ERP.cache.srvAct = null; if(ERP.sec === 'srv_activos') PINTAR.srv_activos(); }); },
                  function(e){ api.ocupado(false); api.msg(msg(e)); });
        } }] });
    });
  }

  /* ═════════════════ CERTIFICADOS ═════════════════ */
  PINTAR.srv_certificados = function(sub){
    var subs = [['emitidos', 'Emitidos'], ['por_emitir', 'Por emitir']];
    sub = subs.some(function(x){ return x[0] === sub; }) ? sub : 'emitidos';
    $('vista').innerHTML = cabecera('srv_certificados', subs, sub) + '<p class="ayuda" id="cargando">Cargando…</p>';
    if(sub === 'por_emitir') return porEmitir();
    rpc('erp_srv_certificados', {}).then(function(j){
      if(!j || !j.ok) return fuera(j);
      var f = ERP.cache.srvCertF || 'vigentes', h = hoy(), en30 = masDias(h, 30);
      var FL = { vigentes:function(x){ return x.estado === 'vigente' && !x.vencido; }, por_vencer:function(x){ return x.estado === 'vigente' && !x.vencido && x.hasta && x.hasta <= en30; },
                 vencidos:function(x){ return x.estado === 'vigente' && x.vencido; }, anulados:function(x){ return x.estado === 'anulado'; }, todos:function(){ return true; } };
      var L = j.lista.filter(FL[f] || FL.vigentes);
      $('cargando').outerHTML = '<div class="filtros">' + [['vigentes', 'Vigentes'], ['por_vencer', 'Vencen en 30 días'], ['vencidos', 'Vencidos'], ['anulados', 'Anulados'], ['todos', 'Todos']].map(function(x){
          return '<button type="button" data-a="srvCertFiltro" data-id="' + x[0] + '" class="' + (x[0] === f ? 'on' : '') + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>' +
        tabla([{ t:'Número', k:function(x){ return '<span class="mono">' + esc(x.numero) + '</span><span class="sub">' + esc(x.tipo_n || x.tipo) + '</span>'; } },
          { t:'Cliente', k:function(x){ return esc(x.cliente_n || '—') + (x.orden_numero ? '<span class="sub mono">' + esc(x.orden_numero) + '</span>' : ''); } },
          { t:'Vigencia', k:function(x){ return vigencia(x); } }, { t:'Resultado', k:function(x){ return x.resultado ? esc(APT[x.resultado] || (RES[x.resultado] || [x.resultado])[0]) : '—'; } },
          { t:'Empresa', k:function(x){ return x.entregado ? pill({ nuevo:'Entregado', aceptado:'Aceptado', rechazado:'Rechazado' }[x.entregado.estado] || 'Entregado', x.entregado.estado === 'rechazado' ? 'mal' : x.entregado.estado === 'aceptado' ? 'ok' : 'az') : '—'; } }],
          L, { a:'srvCert', vacio:'Nada con ese filtro', vacioSub:j.lista.length ? '' : 'Se emiten desde cada orden (o en «Por emitir»).' });
    });
  };
  ACC.srvCertFiltro = function(b){ ERP.cache.srvCertF = b.getAttribute('data-id'); PINTAR.srv_certificados('emitidos'); };
  function porEmitir(){
    var h = hoy();
    rpc('erp_srv_ordenes', { desde:masDias(h, -150), hasta:masDias(h, 62) }).then(function(j){
      if(!j || !j.ok) return fuera(j);
      ERP.cache.srvOrd = j.lista;
      var L = j.lista.filter(function(o){ var ck = (it('ordenes', o.tipo) || {}).certificado; if(!ck || o.estado === 'anulada') return false;
        return POR_REGISTRO[ck] ? o.registros > o.certificados : o.estado === 'cerrada' && !o.certificados; });
      $('cargando').outerHTML = '<p class="ayuda" style="margin:0 0 10px">' + (certifica() ? 'Abre la orden y emite desde ahí.' : 'Los emite el administrador.') + ' Los que van por orden salen cuando la orden se cierra; los de cada inspección, calibración o atención, uno por registro.</p>' +
        tabla([{ t:'Orden', k:function(o){ return '<span class="mono">' + esc(o.numero) + '</span><span class="sub">' + esc(o.tipo_n || '') + '</span>'; } },
          { t:'Cliente', k:function(o){ return esc(o.cliente_n || '—'); } }, { t:'Fecha', k:function(o){ return fecha(o.fecha); } },
          { t:'Por emitir', k:function(o){ var ck = (it('ordenes', o.tipo) || {}).certificado, cd = (D().certificados || {})[ck] || {}; return esc(cd.n || '') + (POR_REGISTRO[ck] ? '<span class="sub">' + num(o.registros - o.certificados) + ' de ' + num(o.registros) + ' registros</span>' : ''); } },
          { t:'Estado', k:function(o){ return pillDe(EST_ORD, o.estado); } }], L, { a:'srvOrden', vacio:'Nada por emitir' });
    });
  }
  function textoVigencia(cd){
    return ({ periodo:'Vale por el mes declarado.', curso:'Vale los meses de vigencia del curso.', registro:'Vale hasta la fecha que se puso en la atención.',
      documentos:'Vale hasta el primer documento del equipo que vence.', dias:'Vale ' + num(cd.dias || 0) + ' días (o los del tipo de elemento).' })[cd.vigencia] || 'Sin vencimiento.';
  }
  function certificar(o, regId){
    var ck = (it('ordenes', o.tipo) || {}).certificado, cd = (D().certificados || {})[ck] || {}, pide = !!CON_FIRMA[ck], pr = leer('sstp_srv_prof', {}) || {};
    hoja({ titulo:'Emitir: ' + (cd.n || 'certificado'), html:'<p style="margin:0 0 8px"><b>' + esc(o.numero) + '</b> · ' + esc(o.cliente_n || 'sin cliente') + '</p>' +
        '<p class="ayuda" style="margin:0 0 12px">' + esc(textoVigencia(cd)) + (cd.norma ? ' Norma: ' + esc(NORMA_TXT(cd.norma)) + '.' : '') + (cd.nota ? ' ' + esc(cd.nota) : '') + '</p>' +
        '<div class="campos">' + campo('ce-pn', 'Profesional que firma' + (pide ? '' : ' (opcional)'), inp('ce-pn', pr.nombre, ' maxlength="120" autocomplete="off"')) +
        campo('ce-pc', 'Colegiatura o registro' + (pide ? '' : ' (opcional)'), inp('ce-pc', pr.colegiatura, ' maxlength="40" autocomplete="off" placeholder="CIP 12345, CMP 12345…"')) + '</div>' +
        '<p class="ayuda">Lleva su número, su huella SHA-256 y un QR que cualquiera verifica en obrasstapp.com. Si te equivocas, se anula (no se borra).</p>',
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Emitir', c:'casco', a:function(api){
        var prof = { nombre:val('ce-pn'), colegiatura:val('ce-pc') };
        if(pide && (!prof.nombre || !prof.colegiatura)) return api.msg('Pon el nombre y la colegiatura de quien firma.');
        if(prof.nombre || prof.colegiatura) guardar('sstp_srv_prof', prof);
        api.ocupado(true);
        rpc('erp_srv_certificar', { orden:o.id, registro:regId || null, profesional:prof }).then(function(j){
          api.ocupado(false);
          if(!j || !j.ok){ if(pide2FA(j)){ api.cerrar(); return; } return api.msg(msg(j)); }
          api.cerrar(); toast((cd.n || 'Certificado') + ' ' + j.certificado.numero + ' emitido.'); repintar(); verCert(j.certificado);
        }); } }] });
  }
  ACC.srvCert = function(b){ rpc('erp_srv_certificado', { id:b.getAttribute('data-id') }).then(function(j){ if(!j || !j.ok) return toast(msg(j)); verCert(j.certificado); }); };

  /* lo que dice el certificado, armado igual para la pantalla y para el PDF */
  function estructura(x){
    var c = x.contenido || {}, P = [], T = [], add = function(l, v){ if(v != null && v !== '') P.push([l, String(v)]); }, obj = function(o, ks){ return ks.map(function(k){ return o[k]; }).filter(Boolean).join(' · '); };
    add('Cliente', x.cliente_n); add('Orden', x.orden_numero);
    add('Vigencia', x.hasta ? 'Del ' + fecha(x.desde) + ' al ' + fecha(x.hasta) : x.desde ? 'Desde el ' + fecha(x.desde) + ' · sin vencimiento' : '');
    if(x.resultado) add('Resultado', APT[x.resultado] || (RES[x.resultado] || [x.resultado])[0]);
    add('Norma', c.norma);
    if(x.profesional && x.profesional.nombre) add('Profesional', x.profesional.nombre + (x.profesional.colegiatura ? ' · ' + x.profesional.colegiatura : ''));
    if(c.poliza) add('Póliza', [c.poliza.tipo, c.poliza.aseguradora, c.poliza.numero ? 'N.° ' + c.poliza.numero : ''].filter(Boolean).join(' · '));
    if(c.periodo) add('Periodo', mesN(c.periodo));
    if(c.asegurados != null) add('Asegurados', num(c.asegurados) + (c.altas != null ? ' (altas ' + num(c.altas) + ', bajas ' + num(c.bajas) + ')' : ''));
    add('Tema', c.tema); add('Curso', c.curso); if(c.horas != null) add('Horas', num(c.horas, 1)); add('Instructor', c.instructor);
    if(c.aprobados != null) add('Aprobados', num(c.aprobados) + ' de ' + num((c.participantes || []).length));
    add('Actividades', c.actividades); add('Entregables', c.entregables);
    add('Manifiesto de residuos peligrosos', c.manifiesto); add('Destino', c.destino); if(c.kg_peligrosos) add('Residuos peligrosos', num(c.kg_peligrosos, 1) + ' kg');
    if(c.total_kg != null) add('Total valorizado', num(c.total_kg, 2) + ' kg');
    if(c.trabajador) add('Trabajador', obj(c.trabajador, ['nombre', 'doc']));
    if(c.tipo_emo) add('Examen', TEMO[c.tipo_emo] || c.tipo_emo); if(c.aptitud) add('Aptitud', APT[c.aptitud] || c.aptitud); add('Protocolo', c.protocolo);
    if(c.equipo) add('Equipo', obj(c.equipo, ['tipo', 'codigo', 'marca', 'modelo', 'serie', 'placa']));
    if(c.preuso) add('Último pre-uso', fecha(c.preuso.fecha) + ' · ' + (RES[c.preuso.resultado] || [c.preuso.resultado])[0]);
    if(c.elemento) add('Elemento', obj(c.elemento, ['tipo', 'codigo', 'tag']) + (c.elemento.wll_ramal_t ? ' · WLL del ramal ' + c.elemento.wll_ramal_t + ' t' : ''));
    if(c.wll_t != null) add('Carga de trabajo segura', num(c.wll_t, 2) + ' t' + (c.ramales && c.ramales > 1 ? ' (' + c.ramales + ' ramales a ' + num(c.angulo) + '°)' : ''));
    add('Color del periodo', c.color); if(c.criterios != null) add('Criterios revisados', num(c.criterios));
    if(c.instrumento) add('Instrumento', obj(c.instrumento, ['tipo', 'codigo', 'marca', 'modelo', 'serie']));
    add('Criterio', c.criterio);
    add('Ruta', c.ruta); if(c.salida || c.llegada) add('Salida y llegada', (c.salida || '—') + ' → ' + (c.llegada || '—'));
    if(c.pasajeros != null) add('Pasajeros', num(c.pasajeros)); if(c.vehiculo) add('Vehículo', [c.vehiculo.codigo, c.vehiculo.placa ? 'placa ' + c.vehiculo.placa : ''].filter(Boolean).join(' · '));
    add('Conductor', c.conductor); if(c.descanso_ok != null) add('Descanso del conductor', c.descanso_ok ? 'Cumple el mínimo' : 'No cumple'); if(c.alcohol_cero != null) add('Alcohol cero', c.alcohol_cero ? 'Declarado' : 'No');
    add('Servicio', c.servicio); if(c.area_m2 != null) add('Área', num(c.area_m2) + ' m²'); if(c.volumen_m3 != null) add('Volumen', num(c.volumen_m3) + ' m³');
    if(c.producto) add('Producto', [c.producto.nombre, c.producto.registro ? 'registro ' + c.producto.registro : ''].filter(Boolean).join(' · '));
    if(c.ppm != null) add('Dosis', num(c.ppm) + ' ppm'); if(c.litros_producto != null) add('Producto usado', num(c.litros_producto, 2) + ' L');
    if(c.cloro_residual_mgl != null) add('Cloro residual', num(c.cloro_residual_mgl, 2) + ' mg/L');
    if(c.estaciones) add('Estaciones cebaderas', num(c.estaciones.estaciones) + ' revisadas · ' + num(c.estaciones.consumo_total) + ' con consumo total');
    var tb = function(titulo, cols, filas){ if(filas && filas.length) T.push({ titulo:titulo, cols:cols, filas:filas }); };
    tb('Participantes', [{ t:'Nombre', k:function(p){ return p.nombre; } }, { t:'Documento', k:function(p){ return p.doc; } }, { t:'Nota', n:1, k:function(p){ return p.nota != null ? num(p.nota) : '—'; } },
      { t:'Resultado', k:function(p){ return p.aprobado ? 'Aprobado' : 'Desaprobado'; } }], c.participantes);
    tb('Residuos', [{ t:'Residuo', k:function(r){ return r.tipo; } }, { t:'Clase', k:function(r){ return r.clase === 'peligroso' ? 'Peligroso' : 'No peligroso'; } }, { t:'Cantidad', n:1, k:function(r){ return num(r.cantidad) + ' ' + r.unidad; } }], c.residuos);
    tb('Materiales', [{ t:'Material', k:function(r){ return r.material; } }, { t:'Peso neto', n:1, k:function(r){ return num(r.neto_kg, 2) + ' kg'; } }], c.materiales);
    tb('Documentos del equipo', [{ t:'Documento', k:function(r){ return r.n; } }, { t:'Número', k:function(r){ return r.numero || '—'; } }, { t:'Vence', k:function(r){ return r.vence ? fecha(r.vence) : '—'; } }], c.documentos);
    tb('Puntos de monitoreo', [{ t:'Punto', k:function(r){ return r.punto; } }, { t:'Agente', k:function(r){ return ((it('agentes', r.agente) || {}).n || r.agente); } },
      { t:'Valor', n:1, k:function(r){ return num(r.valor) + ' ' + (r.unidad || ''); } }, { t:'Límite', n:1, k:function(r){ return r.limite != null ? num(r.limite) : '—'; } },
      { t:'Resultado', k:function(r){ return (r.conforme == null ? '—' : r.conforme ? 'Conforme' : 'No conforme') + (r.dosis_pct != null ? ' · dosis ' + num(r.dosis_pct, 1) + ' %' : ''); } }], c.puntos);
    tb('Lecturas', [{ t:'Gas o magnitud', k:function(r){ return r.gas; } }, { t:'Patrón', n:1, k:function(r){ return num(r.patron); } }, { t:'Lectura', n:1, k:function(r){ return num(r.lectura); } },
      { t:'Error', n:1, k:function(r){ return num(r.error_pct, 1) + ' %'; } }, { t:'Resultado', k:function(r){ return r.ok ? 'Dentro' : 'Fuera'; } }], c.lecturas);
    tb('Inspecciones en campo', [{ t:'Fecha', k:function(r){ return fecha(r.fecha); } }, { t:'Resultado', k:function(r){ return (RES[r.resultado] || [r.resultado])[0]; } },
      { t:'Críticos', k:function(r){ return (r.criticos || []).join('; ') || '—'; } }], c.hallazgos);
    return { pares:P, tablas:T, nota:c.nota };
  }
  function verCert(x){
    var E = estructura(x), est = x.estado === 'anulado' ? pill('anulado', 'mal') : vigencia(x);
    var html = '<div style="margin:0 0 10px">' + est + (x.entregado ? ' ' + pill('entregado a la empresa · ' + ({ nuevo:'sin responder', aceptado:'aceptado', rechazado:'rechazado' }[x.entregado.estado] || ''), 'az') : '') + '</div>' +
      (x.estado === 'anulado' && x.motivo_anulacion ? '<div class="aviso mal">Anulado: ' + esc(x.motivo_anulacion) + '</div>' : '') +
      (x.entregado && x.entregado.estado === 'rechazado' ? '<div class="aviso ojo">La empresa lo rechazó' + (x.entregado.motivo ? ': ' + esc(x.entregado.motivo) : '.') + '</div>' : '') +
      '<dl class="srv-dl">' + E.pares.map(function(p){ return '<dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd>'; }).join('') + '</dl>' +
      E.tablas.map(function(t){ return '<h3 style="font-size:14.5px; margin:4px 0 8px">' + esc(t.titulo) + '</h3>' + tabla(t.cols.map(function(c){ return { t:c.t, n:c.n, k:function(f){ return esc(c.k(f)); } }; }), t.filas); }).join('') +
      (E.nota ? '<p class="ayuda">' + esc(E.nota) + '</p>' : '') +
      '<div class="tarj" style="margin-top:10px"><h2>Verificación pública</h2><p class="ayuda" style="margin:0 0 8px">Huella SHA-256: <span class="mono" style="word-break:break-all">' + esc(x.huella) + '</span></p>' +
      '<div class="acciones"><input readonly id="vc-enl" class="mono" value="' + esc(x.enlace) + '"><button type="button" class="bt sec mini" data-a="copiar" data-id="vc-enl">Copiar</button></div></div>';
    hoja({ titulo:(x.tipo_n || 'Certificado') + ' ' + x.numero, ancha:true, html:html, botones:[{ t:'Cerrar', c:'sec' }, { t:'Descargar el PDF', c:'sec', a:function(api){
        api.ocupado(true); docs().then(function(Dd){ return Dd.certificado(x, E); }).then(function(){ api.ocupado(false); }, function(){ api.ocupado(false); api.msg('No se pudo armar el PDF.'); }); } }]
      .concat(certifica() && x.estado === 'vigente' && !x.entregado ? [{ t:'Entregar a la empresa', a:function(api){
        guarda(api, rpc('erp_srv_entregar', { id:x.id }), 'Entregado: le llega a la empresa en OBRASST.', function(){ repintar(); }); } }] : [])
      .concat(certifica() && x.estado === 'vigente' ? [{ t:'Anular', c:'mal', a:function(api){ pedirTexto('Anular ' + x.numero, 'Motivo (lo ve quien escanee el QR)', function(m, h2){
        guarda(h2, rpc('erp_srv_certificado_anular', { id:x.id, motivo:m }), 'Anulado: el QR ya lo dice.', function(){ api.cerrar(); repintar(); }); }); } }] : []) });
  }

  /* ═════════════════ CLIENTES Y TARIFAS ═════════════════ */
  PINTAR.srv_clientes = function(sub){
    var subs = [['clientes', 'Clientes'], ['tarifas', 'Tarifas']];
    sub = subs.some(function(x){ return x[0] === sub; }) ? sub : 'clientes';
    $('vista').innerHTML = cabecera('srv_clientes', subs, sub) + '<p class="ayuda" id="cargando">Cargando…</p>';
    if(sub === 'clientes') return venClientes();
    Promise.all([rpc('erp_srv_tarifas', {}), catClientes(true)]).then(function(r){
      var j = r[0], C = r[1] || [];
      if(!j || !j.ok) return fuera(j);
      var d = D(), T = d.tarifas || [];
      $('cargando').outerHTML = '<div class="tarj"><h2>Poner una tarifa</h2><p class="ayuda" style="margin:0 0 10px">' + esc(ayudaTarifas()) + '</p><div class="campos">' +
          campo('tf-cli', 'Para', sel('tf-cli', [['', 'Todos los clientes (por defecto)']].concat(C.map(function(c){ return [c.id, c.razon_social]; })), '')) +
          campo('tf-k', 'Tarifa', sel('tf-k', T.map(function(t){ return [t.k, t.n]; }), (T[0] || {}).k)) + campo('tf-v', 'Valor', inp('tf-v', '', ' inputmode="decimal"')) + '</div>' +
          '<button type="button" class="bt" data-a="srvTarifa">Guardar la tarifa</button><p class="msg" id="tf-msg"></p></div>' +
        tabla([{ t:'Para', k:function(t){ return t.cliente ? esc(t.cliente_n || '—') : '<b>Todos los clientes</b>'; } }, { t:'Tarifa', k:function(t){ return esc((it('tarifas', t.clave) || {}).n || t.clave); } },
          { t:'Valor', n:1, k:function(t){ return /pct$/.test(t.clave) ? num(t.valor, 2) + ' %' : /_h$/.test(t.clave) ? num(t.valor, 1) + ' h' : soles(t.valor); } },
          { t:'', k:function(t){ return '<button type="button" class="bt-link" data-a="srvTarifaQuitar" data-id="' + esc(t.cliente || '') + '" data-k="' + esc(t.clave) + '">Quitar</button>'; } }],
          j.lista, { vacio:'Todavía no hay tarifas', vacioSub:'Sin tarifa, no se valoriza.' });
    });
  };
  function ayudaTarifas(){
    var V = {}; (D().ordenes || []).forEach(function(o){ if(o.valoriza) V[o.valoriza] = 1; });
    var t = { horas:'Alquiler: las horas de los partes × la tarifa por hora, por equipo y por orden; si no llegan a las horas mínimas, se cobra el mínimo (menos las horas inoperativas por falla).',
      comision:'SCTR: tu comisión es el % de la prima de cada declaración (el de la póliza o esta tarifa) y se factura a quien elijas al valorizar (la aseguradora).',
      participante:'Capacitación: precio por participante.', servicio:'Servicio: el precio por hora si el registro trae horas; si no, el precio por servicio.',
      recojo:'Recojo: precio por servicio, más el precio por kg de los residuos peligrosos.', compra:'Compra de reciclables: va a favor del cliente con el precio por kg de cada pesaje (no se factura).',
      atencion:'EMO: el precio del protocolo de la orden (o esta tarifa).', unidad:'Precio por elemento inspeccionado o instrumento calibrado.', punto:'Monitoreo: precio por punto.',
      viaje:'Transporte: precio por viaje (los que salieron) y por km.', racion:'Catering: precio por ración.' };
    return Object.keys(V).map(function(k){ return t[k]; }).filter(Boolean).join(' ') + ' La tarifa de un cliente manda sobre la de todos. Montos sin IGV.';
  }
  ACC.srvTarifa = function(b){
    var v = val('tf-v').replace(',', '.'), m = $('tf-msg');
    if(!(v !== '' && isFinite(Number(v)) && Number(v) >= 0)){ m.className = 'msg mal'; m.textContent = 'Escribe el valor.'; return; }
    b.disabled = true;
    rpc('erp_srv_tarifa_guardar', { cliente:val('tf-cli') || null, clave:val('tf-k'), valor:v }).then(function(j){ b.disabled = false;
      if(!j || !j.ok){ m.className = 'msg mal'; m.textContent = msg(j); return; } toast('Tarifa guardada.'); PINTAR.srv_clientes('tarifas'); });
  };
  ACC.srvTarifaQuitar = function(b){
    guarda(null, rpc('erp_srv_tarifa_guardar', { cliente:b.getAttribute('data-id') || null, clave:b.getAttribute('data-k'), valor:'' }), 'Tarifa quitada.', function(){ PINTAR.srv_clientes('tarifas'); });
  };

  /* ═════════════════ VALORIZACIONES ═════════════════ */
  var EST_VAL = { borrador:['Por facturar', 'med'], facturada:['Facturada', 'ok'], anulada:['Anulada', ''] };
  PINTAR.srv_valorizar = function(){
    $('vista').innerHTML = cabecera('srv_valorizar') + '<p class="ayuda" id="cargando">Cargando…</p>';
    rpc('erp_srv_valorizaciones', {}).then(function(j){
      if(!j || !j.ok) return fuera(j);
      ERP.cache.srvVal = j.lista;
      $('cargando').outerHTML = '<div class="filtros"><button type="button" class="bt" data-a="srvValNueva">Nueva valorización</button></div>' +
        tabla([{ t:'Número', k:function(v){ return '<span class="mono">' + esc(v.numero) + '</span><span class="sub">' + num(v.ordenes) + ' órdenes</span>'; } },
          { t:'Cliente', k:function(v){ return esc(v.cliente_n || '—'); } }, { t:'Periodo', k:function(v){ return fecha(v.desde) + '<span class="sub">al ' + fecha(v.hasta) + '</span>'; } },
          { t:'Subtotal', n:1, k:function(v){ return soles(v.subtotal) + (Number(v.a_favor_cliente) ? '<span class="sub">a favor del cliente ' + soles(v.a_favor_cliente) + '</span>' : ''); } },
          { t:'Estado', k:function(v){ return pillDe(EST_VAL, v.estado) + (v.factura_n ? '<span class="sub mono">' + esc(v.factura_n) + '</span>' : ''); } }],
          j.lista, { a:'srvVal', vacio:'Todavía no valorizaste', vacioSub:'Con las órdenes cerradas y tus tarifas, crea la primera.' });
    });
  };
  function lineasHTML(v){
    return tabla([{ t:'Descripción', k:function(l){ return esc(l.d); } }, { t:'Unid.', k:function(l){ return esc(l.u); } }, { t:'Cant.', n:1, k:function(l){ return num(l.c); } },
      { t:'P. unit.', n:1, k:function(l){ return soles(l.p); } }, { t:'Subtotal', n:1, k:function(l){ return soles(l.sub); } }], v.lineas, { vacio:'Sin líneas que facturar' }) +
      '<p style="text-align:right; margin:0 0 4px">Subtotal (sin IGV): <b>' + soles(v.subtotal) + '</b></p>' +
      (Number(v.a_favor_cliente) ? '<p style="text-align:right; margin:0 0 4px">A favor del cliente (lo que se le compró): <b>−' + soles(v.a_favor_cliente) + '</b></p><p style="text-align:right">Neto: <b>' +
        soles(v.neto != null ? v.neto : Number(v.subtotal) - Number(v.a_favor_cliente)) + '</b></p><p class="ayuda">Lo que va a favor del cliente se liquida aparte: no entra a la factura.</p>' : '');
  }
  ACC.srvValNueva = function(){
    catClientes(true).then(function(C){
      if(!C.length){ toast('Primero crea a tus clientes en «Clientes y tarifas».'); return; }
      var h = hoy(), ops = C.map(function(c){ return [c.id, c.razon_social + (c.num_doc ? ' · ' + c.num_doc : '')]; });
      hoja({ titulo:'Nueva valorización', ancha:true, html:'<div class="campos">' + campo('va-cli', 'Cliente (de quién son las órdenes)', sel('va-cli', ops, ops[0][0])) +
          campo('va-de', 'Desde', inp('va-de', h.slice(0, 8) + '01', ' type="date"')) + campo('va-ha', 'Hasta', inp('va-ha', h, ' type="date"')) +
          campo('va-fa', 'Se factura a', sel('va-fa', [['', 'El mismo cliente']].concat(ops), '')) + '</div>' +
          (D().k === 'sctr' ? '<p class="ayuda" style="margin:-4px 0 10px">Tu comisión se factura a la aseguradora: créala como cliente con su RUC y elígela en «Se factura a».</p>' : '') +
          '<div id="va-prev"></div>',
        botones:[{ t:'Cancelar', c:'sec' }, { t:'Ver las líneas', c:'sec', a:function(api){ previa(api, true); } }, { t:'Crear la valorización', a:function(api){ previa(api, false); } }] });
    });
    function previa(api, vista){
      var p = { cliente:val('va-cli'), desde:val('va-de'), hasta:val('va-ha'), facturar_a:val('va-fa') || null, vista:vista };
      api.ocupado(true); api.msg('');
      rpc('erp_srv_valorizar', p).then(function(j){
        api.ocupado(false);
        if(!j || !j.ok){ if(pide2FA(j)){ api.cerrar(); return; } return api.msg(msg(j)); }
        if(vista){ $('va-prev').innerHTML = (j.ordenes || []).length ? '<p class="ayuda" style="margin:4px 0 8px">' + num(j.ordenes.length) + ' órdenes cerradas sin valorizar en el periodo.</p>' + lineasHTML(j) :
          '<div class="aviso neu">No hay órdenes cerradas sin valorizar de ese cliente en ese periodo.</div>'; return; }
        api.cerrar(); toast('Valorización ' + j.valorizacion.numero + ' creada.'); PINTAR.srv_valorizar(); verVal(j.valorizacion);
      });
    }
  };
  ACC.srvVal = function(b){ var v = (ERP.cache.srvVal || []).filter(function(x){ return x.id === b.getAttribute('data-id'); })[0]; if(v) verVal(v); };
  function verVal(v){
    hoja({ titulo:'Valorización ' + v.numero, ancha:true, html:'<p style="margin:0 0 10px">' + esc(v.cliente_n || '') + ' · del ' + fecha(v.desde) + ' al ' + fecha(v.hasta) + ' · ' + pillDe(EST_VAL, v.estado) +
        (v.factura_n ? ' · comprobante <span class="mono">' + esc(v.factura_n) + '</span>' : '') + '</p>' + lineasHTML(v),
      botones:[{ t:'Cerrar', c:'sec' }, { t:'Descargar el PDF', c:'sec', a:function(){ docs().then(function(Dd){ Dd.valorizacion(v, { razon:ERP.yo.aliado.razon, ruc:ERP.yo.aliado.ruc }); }); } }]
        .concat(v.estado === 'borrador' ? [{ t:'Anular', c:'mal', a:function(api){ guarda(api, rpc('erp_srv_valorizacion_anular', { id:v.id }), 'Anulada: sus órdenes vuelven a estar por valorizar.', PINTAR.srv_valorizar); } }] : [])
        .concat(v.estado === 'borrador' && (v.lineas || []).length && puede('facturacion') ? [{ t:'Facturar', c:'casco', a:function(api){ api.cerrar(); facturar(v); } }] : []) });
  }
  function facturar(v){
    var cli = (ERP.cache.cli || []).filter(function(c){ return c.id === v.cliente; })[0] || {};
    hoja({ titulo:'Facturar ' + v.numero, html:'<p class="ayuda" style="margin:0 0 10px">' + esc(v.cliente_n || '') + ' · ' + soles(v.subtotal) + ' sin IGV. El servidor suma el IGV y aplica la detracción y la retención que correspondan.</p>' +
        '<div class="campos">' + campo('fv-t', 'Comprobante', sel('fv-t', [['01', 'Factura'], ['03', 'Boleta']], cli.tipo_doc === '1' ? '03' : '01')) +
        campo('fv-c', 'Condición', sel('fv-c', [['contado', 'Contado'], ['credito30', 'Crédito 30 días'], ['credito60', 'Crédito 60 días'], ['credito90', 'Crédito 90 días']], 'contado')) + '</div>' +
        (ERP.yo.pse && ERP.yo.pse.modo === 'prueba' ? '<div class="aviso ojo"><b>En prueba:</b> sale del simulador, sin valor tributario, hasta que conectes tu PSE.</div>' : ''),
      botones:[{ t:'Cancelar', c:'sec' }, { t:'Emitir', c:'casco', a:function(api){
        guarda(api, rpc('erp_srv_facturar', { valorizacion:v.id, tipo:val('fv-t'), condicion:val('fv-c'), idem:nuevoIdem() }), null, function(j){
          toast('Comprobante ' + ((j.factura || {}).codigo || '') + ' emitido.'); PINTAR.srv_valorizar(); }); } }] });
  }

  return { iniciar:iniciar, papeles:papeles, textoPlan:textoPlan, nombre:function(){ return CORTO[D().k] || 'Servicios'; }, def:D, estructura:estructura, _form:FORM };
})();
