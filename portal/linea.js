/* ══════════════════════════════════════════════════════════════════
   OBRASST · el portal · ESTADO 3.0 · LA LÍNEA (29/10/2026)
   Marcelo: «Mejórame por completo el tema del plan Estado… que se acople a las subcontratas… una línea de arriba hacia
   abajo y viceversa… lo más simple, profesional, técnico y manejable posible para el Estado: aprieta un botón y listo,
   su información ya está».
   Cinco secciones (necesitan portal/cadena.js y portal/arriba.js):
     · la mesa de control (el inicio del Estado): lo que necesita su atención hoy, la gente en obra con requisitos
       vencidos, las cifras de todas sus obras con sus subcontratas, sus obras una por una, dónde inspeccionar primero y
       sus informes en un botón (también el resumen para WhatsApp);
     · el árbol de la obra: la entidad, la supervisora, cada contratista y sus subcontratas, con lo de hoy de cada una;
     · los comunicados en cascada: lo que la entidad publica llega solo a cada empresa de sus obras (subcontratas
       incluidas) y a su gente; aquí, el acuse de cada una, reiterar y retirar con su motivo;
     · los accidentes de la cadena: lo que cada empresa registró en su app, con el reloj de las 24 horas del aviso al MTPE;
     · la bitácora de gestión: lo que hizo el equipo de la entidad con cada alerta (con su documento, su plazo y su cierre),
       sellado: la constancia de su diligencia.
   Prototipo 2 (del análisis 1): las palabras del Estado (estándar con su sustento, entidad del Estado), cifras que cuadran,
   el accidente sin datos de salud de nadie, las subcontratas sumadas a su contratista, «Registrar lo que hice» y el texto
   para el asiento del cuaderno de obra en cada alerta, «Pedir que lo regularice» y reiterar a las que no confirmaron.
   Servidor: sql/2026-10-30-estado-linea.sql (sst_est_bajar, sst_est_lista, sst_est_retirar, sst_est_reiterar,
   sst_cad_accidentes, sst_est_gestion_poner, sst_est_gestion_cerrar, sst_est_gestion_lista) y lo de siempre
   (sst_cad_tablero, sst_cad_cumple, sst_cad_cartera, sst_cad_medidas, sst_cad_prioridad, sst_cad_observar).
   La obra de ejemplo (portal/demo-arriba.js) contesta lo mismo, con datos inventados.
   ══════════════════════════════════════════════════════════════════ */
var LIN = { caja:null, cual:'', d:null, de:'', t:0, yendo:null, todas:false, reqTodas:false, proy:'', com:{ form:false, tipo:'comunicado', arch:null, abierto:{}, para:'' }, acc:{ dias:90 },
            bit:{ ver:'mes' } };
var LIN_VIA = { contratista:'Contratista', directa:'Contratista', subcontrata:'Subcontrata', supervisora:'Supervisora', contratista_sup:'Contratista de la supervisora', propia:'Tu empresa' };
var LIN_CLASE = { mortal:['Accidente mortal', 'mal'], incap:['Incapacitante', 'mal'], leve:['Leve', 'ojo'], casi:['Incidente', 'gris'], dano:['Daño a la propiedad', 'gris'], primeros:['Primeros auxilios', 'gris'] };
var LIN_QUE = { asiento:'Asiento en el cuaderno de obra', carta:'Carta al contratista', informe:'Informe', observacion:'Observación a la empresa', orden:'Orden de inspección',
                reunion:'Reunión o coordinación en obra', otro:'Otra acción' };
var LIN_QUE_DOC = { asiento:'Asiento N.° 245', carta:'Carta N.° 087-2026-…', informe:'Informe N.° 012-2026-…', observacion:'OB-0012', orden:'OI-0005', reunion:'', otro:'' };
var LIN_MOTIVO = { sin_sesion:'Tu sesión venció: vuelve a entrar.', no_eres_de_la_obra:'Esta cuenta no es de esta entidad.', sin_plan:'Esto es de OBRASST Estado y Mandante.',
  solo_jefes:'Lo hace un jefe o el gerente de tu equipo.', tipo:'Elige si es un comunicado o un estándar.', titulo:'Ponle un título de al menos 3 letras.',
  url:'El archivo no se pudo subir: vuelve a elegirlo.', archivo:'El estándar va con su documento: elige el PDF.', texto:'Escribe el mensaje (al menos 10 letras) o elige un archivo.',
  base:'Escribe su sustento: la norma o la cláusula del contrato.',
  fechas:'Revisa la fecha: no puede ser antes de hoy ni pasar de un año.', proy:'Esa obra no es tuya.', sin_empresas:'Todavía no hay empresas activas en tus obras: cuando acepten, les llega.',
  muy_seguido:'Demasiados envíos seguidos: espera unos minutos.', 'muy-grande':'El archivo pesa más de 25 MB: comprímelo.', no_existe:'Ya no existe: actualiza la página.',
  falta_motivo:'Escribe por qué lo retiras (al menos 5 letras).', ya_retirado:'Ya estaba retirado.', no_vigente:'Ya no está vigente.',
  reiterado_hace_poco:'Ya se reiteró hace menos de 6 horas: dales tiempo.', todas_confirmaron:'Todas las empresas ya confirmaron.',
  clave:'Esta alerta no se puede anotar: actualiza la página.', que:'Elige qué hiciste.', documento:'Escribe el número del documento (es la prueba).',
  detalle:'Cuenta en pocas palabras qué hiciste.', cierre:'Escribe cómo se resolvió.', ya_cerrada:'Ya estaba cerrada.' };
function linMotivo(j, e){ var m = j && j.motivo; return (m && LIN_MOTIVO[m]) || (typeof arrMotivo === 'function' ? arrMotivo(j, e) : 'No se pudo: revisa tu conexión.'); }
function linEmp(){ return (YO && YO.obra) ? YO.obra.id : null; }
function linGrado(){ return typeof arrGrado === 'function' ? arrGrado() : 0; }
function linManda(){ return typeof arrManda === 'function' ? arrManda() : false; }
function linRpc(fn, args){ return sbRpc(fn, args).then(function(j){ return (j && j.ok) ? j : null; }, function(){ return null; }); }
function linN(n){ return String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function linPct(a, b){ return b ? Math.round(100 * a / b) : null; }
function linUno(n, uno, varios){ return linN(n) + ' ' + (+n === 1 ? uno : varios); }
function linCorto(n){ return typeof cadCorto === 'function' ? cadCorto(n || '') : String(n || ''); }
function linDos(n){ return (n < 10 ? '0' : '') + n; }
function linISO(d){ return d.getFullYear() + '-' + linDos(d.getMonth() + 1) + '-' + linDos(d.getDate()); }
function linMasDias(n){ return linISO(new Date(Date.now() + n * 86400000)); }
function linFecha(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 && p[0] ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
function linHora(t){ var d = new Date(t); return isNaN(d) ? '' : linFecha(linISO(d)) + ' ' + linDos(d.getHours()) + ':' + linDos(d.getMinutes()); }
function linLapso(ms){ var h = Math.abs(ms) / 3600000; return h < 1 ? Math.max(1, Math.round(h * 60)) + ' min' : (h < 48 ? Math.round(h) + ' h' : Math.round(h / 24) + ' días'); }
function linDiasAnio(){ var h = new Date(), i = new Date(h.getFullYear(), 0, 1); return Math.max(1, Math.min(365, Math.floor((h - i) / 86400000) + 1)); }
function linPill(t, cl){ return '<span class="pill ' + (cl || 'gris') + '">' + esc(t) + '</span>'; }
function linIr(id){ if(typeof vistasDe !== 'function' || vistasDe().some(function(v){ return v.id === id; })) navegar(id); }
function linHay(id){ return typeof vistasDe !== 'function' || vistasDe().some(function(v){ return v.id === id; }); }
function linSlug(t){ return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'x'; }
function linHash(s){ var h = 2166136261; s = String(s); for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
function linLimpio(h){ return String(h || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'); }
function linEnt(){ return (YO && YO.obra && (YO.obra.obra_nombre || YO.obra.nombre)) || 'Tu entidad'; }
function linVia(x){
  var v = LIN_VIA[x.via] || 'Empresa';
  if(x.via === 'subcontrata' && x.padre) return 'Subcontrata de ' + linCorto(x.padre);
  if(x.via === 'contratista_sup' && x.padre) return 'Contratista · la supervisa ' + linCorto(x.padre);
  if(x.via === 'supervisora' && x.padre) return 'Contratista · la supervisa ' + linCorto(x.padre);
  return v;
}
function linPintar(cual, caja){
  if(typeof _cadCss === 'function') _cadCss(); if(typeof _arrCss === 'function') _arrCss();
  _linCss(); LIN.caja = caja; LIN.cual = cual;
  /* lo de arriba.js que se abre desde aquí (la orden, los documentos) navega por las vistas del portal, como desde las suyas */
  if(typeof ARR !== 'undefined' && ARR) ARR.solo = true;
  if(cual === 'mesa') return linMesa(caja);
  if(cual === 'arbol') return linArbol(caja);
  if(cual === 'com') return linCom(caja);
  if(cual === 'acc') return linAcc(caja);
  if(cual === 'bit') return linBit(caja);
}
function linRepintar(){ if(LIN.caja && LIN.caja.isConnected) linPintar(LIN.cual, LIN.caja); }

/* ══ 1 · LO QUE SE PIDE AL SERVIDOR (una sola vez para la mesa y el árbol; 30 s de vida) ══════════════════════ */
function linTraer(forzar){
  var de = String(linEmp() || ''), g = linGrado(), emp = linEmp();
  if(!forzar && LIN.d && LIN.de === de && Date.now() - LIN.t < 30000) return Promise.resolve(LIN.d);
  if(LIN.yendo && LIN.de === de && !forzar) return LIN.yendo;
  LIN.de = de;
  LIN.yendo = Promise.all([
    linRpc('sst_cad_tablero', { p:{ emp:emp } }),
    linRpc('sst_cad_cumple', { p:{ emp:emp } }),
    linRpc('sst_cad_cartera', { p_emp:emp }),
    g >= 4 ? linRpc('sst_cad_medidas', { p:{ emp:emp, vigentes:true } }) : Promise.resolve(null),
    g >= 4 ? linRpc('sst_cad_prioridad', { p:{ emp:emp, region:null } }) : Promise.resolve(null),
    linRpc('sst_cad_accidentes', { p:{ emp:emp, dias:linDiasAnio() } }),
    linRpc('sst_est_lista', { p:{ emp:emp } }),
    linRpc('sst_est_gestion_lista', { p:{ emp:emp } })
  ]).then(function(R){
    LIN.yendo = null;
    if(String(linEmp() || '') !== de) return null;
    var D = { tab:R[0], cum:R[1], car:R[2], med:R[3], pri:R[4], acc:R[5], est:R[6], ahora:Date.now() };
    linGestPoner(D, (R[7] && R[7].lista) || []);
    D.obras = linObras(D); D.cosas = linCosas(D);
    LIN.d = D; LIN.t = Date.now();
    return D;
  }, function(){ LIN.yendo = null; return null; });
  return LIN.yendo;
}
/* lo anotado en la bitácora, por alerta: lo abierto más reciente (lo cerrado no cuenta: si la alerta sigue, hay que volver a actuar) */
function linGestPoner(D, L){
  D.gestL = L.slice(); D.gest = {};
  L.slice().sort(function(a, b){ return String(a.creado).localeCompare(String(b.creado)); }).forEach(function(g){
    if(g.estado === 'abierta') D.gest[g.clave] = g; else if(D.gest[g.clave] && D.gest[g.clave].id === g.id) delete D.gest[g.clave];
  });
}
function linGestDe(D, clave){ return clave && D && D.gest ? D.gest[clave] || null : null; }
/* las obras: cada proyecto con sus empresas (de lo que cumple hoy cada una), su supervisora, su región, la gente de sus empresas
   (la de la supervisora, aparte: así la suma de las obras más las supervisoras da el total), la nota más baja, sus accidentes
   del año y sus medidas */
function linObras(D){
  var por = {}, orden = [], cum = (D.cum && D.cum.empresas) || [], car = (D.car && D.car.lista) || [], reg = {};
  var obra = function(n){ n = n || 'Sin obra'; if(!por[n]){ por[n] = { n:n, id:null, region:'', emps:[], sups:[], gente:0, supGente:0, peor:null, acc:0, mortal:0, mortalHoy:false, med:0 }; orden.push(n); } return por[n]; };
  ((D.pri && D.pri.lista) || []).forEach(function(x){ if(x.enlace) reg[x.enlace] = x.region || ''; });
  cum.forEach(function(x){
    var o = obra(x.proyecto);
    o.emps.push(x); o.gente += +x.gente || 0;
    if(x.nota != null && (!o.peor || x.nota < o.peor.nota)) o.peor = { nota:x.nota, nombre:x.nombre };
    if(!o.region && reg[x.enlace]) o.region = reg[x.enlace];
  });
  car.forEach(function(l){
    if(l.estado !== 'activa') return;
    var nombres = String(l.obra || '').split(' · ').filter(Boolean);
    if(l.incluida) nombres.forEach(function(n){ var o = obra(n); o.sups.push(l); o.supGente += (l.ind || {}).gente || 0; });
    else if(nombres.length === 1 && l.obra_id){ var o2 = obra(nombres[0]); if(!o2.id) o2.id = l.obra_id; }
  });
  var deEmp = {}, hoy = linISO(new Date()); cum.forEach(function(x){ deEmp[x.nombre] = x.proyecto; });
  ((D.acc && D.acc.lista) || []).forEach(function(a){ var o = por[a.proyecto]; if(!o) return; if(a.clase === 'incap' || a.clase === 'mortal') o.acc++; if(a.clase === 'mortal'){ o.mortal++; if(a.fecha === hoy) o.mortalHoy = true; } });
  ((D.med && D.med.lista) || []).forEach(function(m){ if(m.estado !== 'vigente') return; var o = por[deEmp[m.empresa]]; if(o) o.med++; });
  return orden.map(function(n){ return por[n]; }).filter(function(o){ return o.emps.length || o.sups.length; });
}
function linObraDe(D, nombre){ return ((D && D.obras) || []).filter(function(o){ return o.emps.some(function(e){ return e.nombre === nombre; }) || o.sups.some(function(s){ return s.nombre === nombre; }); })[0] || null; }
/* las cifras de todas las obras: las mismas en la mesa y en el resumen para WhatsApp (la gente de las supervisoras incluidas, aparte) */
function linTot(D){
  var cum = (D.cum && D.cum.empresas) || [], t = { gente:0, supGente:0, sOk:0, sTot:0, cOk:0, cTot:0, con:0, sub:0, sups:0 };
  cum.forEach(function(x){ t.gente += +x.gente || 0; if(x.sctr){ t.sOk += +x.sctr.ok || 0; t.sTot += +x.sctr.tot || 0; } if(x.cap){ t.cOk += +x.cap.ok || 0; t.cTot += +x.cap.tot || 0; }
    if(x.via === 'subcontrata') t.sub++; else t.con++; });
  ((D.car && D.car.lista) || []).forEach(function(l){ if(l.estado === 'activa' && l.incluida){ t.sups++; t.supGente += (l.ind || {}).gente || 0; } });
  t.gente += t.supGente;
  return t;
}
/* de su personal activo, hoy: sin SCTR vigente (salud y pensión), con el EMO vencido o sin EMO, sin inducción */
function linFaltas(x){
  return { s:x.sctr ? (+x.sctr.ven || 0) + (+x.sctr.sin || 0) : 0, e:x.emo ? (+x.emo.ven || 0) + (+x.emo.sin || 0) : 0,
           n:x.ind ? Math.max(0, (+x.ind.tot || 0) - (+x.ind.ok || 0)) : 0 };
}

/* ══ 2 · LO QUE NECESITA ATENCIÓN HOY (de lo más grave a lo más leve) ══════════════════════════════════════════
   g 1: lo que no espera (accidente mortal sin aviso o sin investigar, gente sin SCTR, riesgo alto vencido, una orden vencida,
   lo que escaló a tu cargo); g 2: lo que hay que mover esta semana; g 3: lo que conviene mirar. Cada cosa con su botón; las que
   se pueden anotar, con «Registrar lo que hice» (clave: de qué alerta es) y el texto para el asiento del cuaderno (as). Las de
   un mismo tipo van juntas. */
function linCosas(D){
  var C = [], ahora = D.ahora || Date.now(), semana = ahora - 7 * 86400000, i = (typeof arrIni === 'function' ? arrIni() : null) || {};
  var conObra = function(x, emp){ var o = linObraDe(D, emp); if(o){ x.obraN = o.n; x.proy = o.id || null; } return x; };
  if(i.cuenta && i.cuenta.subio) C.push({ g:1, k:'subio', t:'<b>' + linUno(i.cuenta.subio, 'observación vencida', 'observaciones vencidas') + '</b> ' + (i.cuenta.subio === 1 ? 'escalada' : 'escaladas') + ' a tu cargo',
    s:'Vencieron sin levantarse y subieron a ti.', fn:'subio', b:'Ver' });
  ((D.acc && D.acc.lista) || []).forEach(function(a){
    var t = Date.parse(a.fecha + 'T' + (a.hora || '00:00') + ':00'), quien = '<b>' + esc(linCorto(a.empresa)) + '</b>' + (a.via === 'subcontrata' && a.padre ? ' (subcontrata de ' + esc(linCorto(a.padre)) + ')' : '');
    var hecho = 'el ' + linFecha(a.fecha) + (a.hora ? ' a las ' + a.hora : '') + ' ocurrió un accidente ' + (a.clase === 'mortal' ? 'mortal' : 'incapacitante') + ' en la empresa ' + linCorto(a.empresa) +
      (a.via === 'subcontrata' && a.padre ? ', subcontrata de ' + linCorto(a.padre) : '') + (a.proyecto ? ', en la obra ' + a.proyecto : '');
    var inv = 'presentar la investigación del accidente con sus causas y medidas correctivas';
    if(a.clase === 'mortal' && !a.mtpe){
      var pl = a.plazo ? Date.parse(a.plazo) : t + 86400000, falta = pl - ahora;
      C.push(conObra({ g:1, k:'acc', clave:'acc:' + linSlug(a.id), reg:true, emp:a.empresa, obraN:a.proyecto, t:'Accidente mortal en ' + quien,
               s:(falta > 0 ? 'El aviso al MTPE vence en ' + linLapso(falta) : 'El plazo de 24 horas para avisar al MTPE venció hace ' + linLapso(falta)) + ' y todavía no está marcado como hecho.',
               ir:'est-acc', b:'Ver el accidente', reloj:falta,
               as:{ hecho:hecho, pedido:'acreditar la notificación al Ministerio de Trabajo y Promoción del Empleo dentro de las 24 horas (D.S. 005-2012-TR, art. 110) y ' + inv } }, a.empresa));
    } else if(a.clase === 'mortal' && !a.investigado && t >= ahora - 30 * 86400000){
      C.push(conObra({ g:1, k:'acc', clave:'acc:' + linSlug(a.id), reg:true, emp:a.empresa, obraN:a.proyecto, t:'Accidente mortal en ' + quien + ': falta la investigación',
               s:'Se avisó al MTPE. Todavía no registra las causas ni las medidas.', ir:'est-acc', b:'Ver el accidente', as:{ hecho:hecho, pedido:inv, dias:5 } }, a.empresa));
    } else if(a.clase === 'incap' && !a.investigado && t >= semana){
      C.push(conObra({ g:2, k:'acc', clave:'acc:' + linSlug(a.id), reg:true, emp:a.empresa, obraN:a.proyecto, t:'Accidente incapacitante en ' + quien + ': falta la investigación',
               s:'Del ' + linFecha(a.fecha) + '. Sin causas ni medidas registradas.', ir:'est-acc', b:'Ver el accidente', as:{ hecho:hecho, pedido:inv, dias:5 } }, a.empresa));
    } else if(a.potencial && t >= ahora - 3 * 86400000){
      C.push(conObra({ g:3, k:'acc', clave:'acc:' + linSlug(a.id), reg:true, emp:a.empresa, obraN:a.proyecto, t:'Incidente que pudo ser grave en ' + quien,
               s:'Del ' + linFecha(a.fecha) + '. Si es un incidente peligroso, también se notifica al MTPE dentro de las 24 horas.', ir:'est-acc', b:'Ver el incidente' }, a.empresa));
    }
  });
  var cum = (D.cum && D.cum.empresas) || [], sinS = 0, sinE = 0, deS = [], deE = [], eS = [], eE = [];
  cum.forEach(function(x){
    var f = linFaltas(x);
    if(f.s){ sinS += f.s; deS.push(linCorto(x.nombre) + ' ' + f.s); eS.push(x.nombre); }
    if(f.e){ sinE += f.e; deE.push(linCorto(x.nombre) + ' ' + f.e); eE.push(x.nombre); }
  });
  var lista = function(L){ return L.slice(0, 4).join(' · ') + (L.length > 4 ? ' · y ' + (L.length - 4) + ' más' : ''); };
  if(sinS) C.push({ g:1, k:'sctr', clave:'sctr:' + linHash(eS.slice().sort().join('|')), reg:true, emps:eS, t:'<b>' + linUno(sinS, 'trabajador', 'trabajadores') + '</b> sin SCTR vigente (salud y pensión)',
    s:esc(lista(deS)) + '. Quien contrata la obra debe verificar que todos estén asegurados; si no, responde solidariamente (D.S. 003-98-SA, art. 5).', ancla:'lin-req', b:'Ver quiénes',
    as:{ hecho:linUno(sinS, 'trabajador', 'trabajadores') + ' del personal activo no ' + (sinS === 1 ? 'tiene' : 'tienen') + ' SCTR vigente de salud y pensión (' + lista(deS) + ')',
         pedido:'acreditar el SCTR vigente de ese personal; mientras no lo tenga, no debe ingresar a trabajar (D.S. 003-98-SA, art. 5)', dias:1 } });
  /* las alertas del tablero, juntas por tipo */
  var porQue = {};
  ((D.tab && D.tab.alertas) || []).forEach(function(a){ (porQue[a.que] = porQue[a.que] || []).push(a); });
  var nom = function(a){ return '<b>' + esc(linCorto(a.empresa || '')) + '</b>'; };
  var AV = porQue.alto_vencido || [];
  if(AV.length === 1) C.push(conObra({ g:1, k:'obs', clave:'obs:' + linSlug(AV[0].empresa), reg:true, emp:AV[0].empresa, t:nom(AV[0]) + ': ' + (AV[0].n === 1 ? '1 observación de riesgo alto vencida' : AV[0].n + ' observaciones de riesgo alto vencidas'),
    s:'Pasó más de un día desde su plazo y no la levanta.', ir:'cad-obs', b:'Ver las observaciones',
    as:{ hecho:'la empresa ' + linCorto(AV[0].empresa) + ' tiene ' + (AV[0].n === 1 ? '1 observación de riesgo alto vencida' : AV[0].n + ' observaciones de riesgo alto vencidas') + ' sin levantar', pedido:'levantarlas con su evidencia', dias:1 } }, AV[0].empresa));
  else if(AV.length > 1) C.push({ g:1, k:'obs', clave:'obs:' + linHash(AV.map(function(a){ return a.empresa; }).sort().join('|')), reg:true, emps:AV.map(function(a){ return a.empresa; }),
    t:'<b>' + AV.length + ' empresas</b> con observaciones de riesgo alto vencidas', s:esc(lista(AV.map(function(a){ return linCorto(a.empresa) + ' ' + a.n; }))) + '. Pasó más de un día desde su plazo.', ir:'cad-obs', b:'Ver las observaciones',
    as:{ hecho:'tienen observaciones de riesgo alto vencidas sin levantar: ' + lista(AV.map(function(a){ return linCorto(a.empresa) + ' ' + a.n; })), pedido:'levantarlas con su evidencia', dias:1 } });
  (porQue.orden_vencida || []).forEach(function(a){
    C.push(conObra({ g:1, k:'orden', clave:'orden:' + linSlug(a.orden), reg:true, emp:a.empresa, t:'La orden ' + esc(a.orden || '') + ' a ' + nom(a) + ' venció sin su acta', s:'Asignada a ' + esc(a.n || '') + '; el plazo era el ' + esc(linFecha(a.t)) + '.', ir:'fis-ord', b:'Ver la orden' }, a.empresa));
  });
  var SH = porQue.sin_homologar || [];
  if(SH.length === 1) C.push(conObra({ g:2, k:'req', clave:'req:' + linSlug(SH[0].empresa), reg:true, emp:SH[0].empresa, t:nom(SH[0]) + ' trabaja sin sus requisitos de ingreso completos',
    s:(SH[0].faltan === 1 ? 'Le falta 1 requisito.' : 'Le faltan ' + (SH[0].faltan || 0) + ' requisitos.') + ' Pídeselos y revísalos en Documentos.', ir:'sup-emp', b:'Ver sus documentos',
    as:{ hecho:'la empresa ' + linCorto(SH[0].empresa) + ' trabaja sin sus requisitos de ingreso completos', pedido:'entregar los requisitos de ingreso pendientes', dias:3 } }, SH[0].empresa));
  else if(SH.length > 1) C.push({ g:2, k:'req', clave:'req:' + linHash(SH.map(function(a){ return a.empresa; }).sort().join('|')), reg:true, emps:SH.map(function(a){ return a.empresa; }),
    t:'<b>' + SH.length + ' empresas</b> trabajan sin sus requisitos de ingreso completos', s:esc(lista(SH.map(function(a){ return linCorto(a.empresa) + ' (' + (a.faltan || 0) + ')'; }))) + '. Pídeselos y revísalos en Documentos.',
    ir:'sup-emp', b:'Ver sus documentos', as:{ hecho:'trabajan sin sus requisitos de ingreso completos: ' + lista(SH.map(function(a){ return linCorto(a.empresa); })), pedido:'entregar los requisitos de ingreso pendientes', dias:3 } });
  (porQue.no_atendio || []).forEach(function(a){ C.push({ g:2, k:'req', clave:'vin:' + linSlug(a.empresa), reg:true, emp:a.empresa, t:nom(a) + ' no atendió el requerimiento de vinculación', s:'Venció el ' + esc(linFecha(a.t)) + '. Mientras tanto la supervisas con registro propio.', ir:'sup-emp', b:'Ver la empresa' }); });
  (porQue.rechazo || []).forEach(function(a){ C.push({ g:2, k:'req', clave:'vin:' + linSlug(a.empresa), reg:true, emp:a.empresa, t:nom(a) + ' rechazó el requerimiento de vinculación', s:a.nota ? '«' + esc(a.nota) + '»' : 'Sin motivo.', ir:'sup-emp', b:'Ver la empresa' }); });
  (porQue.acta_abierta || []).forEach(function(a){
    C.push(conObra({ g:2, k:'acta', clave:'acta:' + linSlug(a.acta), reg:true, emp:a.empresa, t:'El acta ' + esc(a.acta || '') + ' a ' + nom(a) + ' sigue sin la firma del representante', s:'Lleva más de 3 días. Levantada por ' + esc(a.n || '') + '.', ir:'sup-actas', b:'Ver el acta',
      as:{ hecho:'el acta ' + (a.acta || '') + ' a la empresa ' + linCorto(a.empresa) + ' sigue sin la firma de su representante', pedido:'firmar el acta o presentar sus descargos', dias:2 } }, a.empresa));
  });
  ((D.med && D.med.lista) || []).forEach(function(m){
    if(m.estado !== 'vigente') return;
    var tipo = m.tipo === 'paralizacion' ? 'Paralización' : 'Prohibición';
    C.push(conObra({ g:2, k:'med', clave:'med:' + linSlug(m.id), reg:true, emp:m.empresa, t:tipo + ' vigente en <b>' + esc(linCorto(m.empresa)) + '</b>', s:esc(m.detalle || '') + (m.acta ? ' (acta ' + esc(m.acta.n) + ')' : ''), ir:'fis-med', b:'Ver la medida',
      as:{ hecho:'está vigente la medida de ' + tipo.toLowerCase() + ' a la empresa ' + linCorto(m.empresa) + (m.detalle ? ': ' + m.detalle : '') + (m.acta ? ' (acta ' + m.acta.n + ')' : ''), pedido:'acreditar la corrección para verificarla en campo', dias:3 } }, m.empresa));
  });
  if(sinE) C.push({ g:2, k:'emo', clave:'emo:' + linHash(eE.slice().sort().join('|')), reg:true, emps:eE, t:'<b>' + linUno(sinE, 'trabajador', 'trabajadores') + '</b> con el EMO vencido o sin EMO', s:esc(lista(deE)) + '.', ancla:'lin-req', b:'Ver quiénes',
    as:{ hecho:linUno(sinE, 'trabajador', 'trabajadores') + ' del personal activo ' + (sinE === 1 ? 'tiene' : 'tienen') + ' el examen médico ocupacional vencido o no lo ' + (sinE === 1 ? 'tiene' : 'tienen') + ' (' + lista(deE) + ')',
         pedido:'acreditar sus exámenes médicos ocupacionales vigentes', dias:7 } });
  (porQue.supervisora_programa || []).forEach(function(a){ C.push({ g:3, k:'sup', clave:'sup:' + linSlug(a.empresa) + ':' + linISO(new Date()).slice(0, 7), reg:true, emp:a.empresa, t:nom(a) + ' (tu supervisora) va en el ' + a.pct + ' % de su programa del mes', s:'Mira qué le falta en el desempeño de la supervisora.', ir:'car-aud', b:'Ver su desempeño',
    as:{ a:'a la supervisión', hecho:'la supervisora ' + linCorto(a.empresa) + ' va en el ' + a.pct + ' % de su programa del mes', pedido:'presentar cómo completará su programa del mes', dias:3 } }); });
  (porQue.supervisora_valida || []).forEach(function(a){ C.push({ g:3, k:'sup', clave:'supv:' + linSlug(a.empresa), reg:true, emp:a.empresa, t:nom(a) + ' (tu supervisora) tiene ' + a.n + (a.n === 1 ? ' levantamiento' : ' levantamientos') + ' sin validar hace más de 24 h', s:'La empresa ya levantó: falta su visto bueno.', ir:'car-aud', b:'Ver su desempeño',
    as:{ a:'a la supervisión', hecho:'la supervisora ' + linCorto(a.empresa) + ' tiene ' + a.n + ' levantamientos sin validar hace más de 24 horas', pedido:'validarlos', dias:1 } }); });
  ((D.est && D.est.arriba) || []).forEach(function(s){
    if(s.estado !== 'vigente' || !s.cascada || !s.urgente) return;
    var t0 = Date.parse(s.creado); if(!(t0 > ahora - 4 * 86400000) || ahora - t0 < 2 * 3600000) return;
    var sin = (s.empresas || []).filter(function(e){ return !e.recibido; }).length;
    if(sin) C.push({ g:3, k:'com', t:sin + (sin === 1 ? ' empresa no confirmó' : ' empresas no confirmaron') + ' el comunicado urgente «' + esc(s.titulo) + '»', s:'Enviado el ' + linHora(s.creado) + '. A su gente ya le llegó al mural. Puedes reiterarlo.', ir:'est-com', b:'Ver el acuse' });
  });
  var rev = (D.car && D.car.tot && D.car.tot.req_por_revisar) || 0;
  if(rev) C.push({ g:3, k:'doc', t:'<b>' + rev + (rev === 1 ? ' documento entregado espera' : ' documentos entregados esperan') + '</b> tu revisión', s:'Apruébalos u obsérvalos en Documentos.', ir:'sup-emp', b:'Revisar' });
  C = C.filter(function(x){ return !x.ir || linHay(x.ir); });
  C.forEach(function(x){ x.gest = linGestDe(D, x.clave); });
  return C.sort(function(a, b){ return a.g - b.g || (a.gest ? 1 : 0) - (b.gest ? 1 : 0) || (a.reloj != null ? a.reloj : 1e15) - (b.reloj != null ? b.reloj : 1e15); });
}

/* ══ 3 · LA MESA DE CONTROL ════════════════════════════════════════════════════════════════════════════════ */
function linMesa(c){
  var g = linGrado(), manda = linManda(), sup = typeof arrPuedeSupervisar === 'function' && arrPuedeSupervisar();
  if(typeof _cadAcc === 'function') _cadAcc((g >= 3 && manda && linHay('est-com') ? '<button type="button" class="bt" id="lin-m-com">Enviar un comunicado</button>' : '') +
    (sup && typeof arrSupervisar === 'function' ? '<button type="button" class="bt sec" id="lin-m-sup">＋ ' + esc(g >= 4 ? 'Fiscalizar a una empresa' : 'Supervisar a una empresa') + '</button>' : '') +
    '<button type="button" class="bt sec" id="lin-m-wa">Resumen para WhatsApp</button><button type="button" class="bt sec lin-solo-ancho" id="lin-m-imp">Imprimir</button>');
  if($('lin-m-com')) $('lin-m-com').onclick = function(){ LIN.com.form = true; LIN.com.para = ''; linIr('est-com'); };
  if($('lin-m-sup')) $('lin-m-sup').onclick = function(){ arrSupervisar(false); };
  if($('lin-m-imp')) $('lin-m-imp').onclick = function(){ window.print(); };
  if($('lin-m-wa')) $('lin-m-wa').onclick = function(){ linTraer().then(function(D){ if(D) linWhatsApp(D); }); };
  c.innerHTML = '<div class="vacio">Juntando lo de todas tus obras…</div>';
  linTraer().then(function(D){
    if(!c.isConnected || LIN.cual !== 'mesa') return;
    if(!D || (!D.tab && !D.cum)){ c.innerHTML = (typeof arrVacio === 'function' ? arrVacio('No se pudo cargar la mesa', 'Revisa tu conexión y vuelve a abrirla.') : ''); return; }
    if(!(D.obras || []).length && !((D.car && D.car.lista) || []).length){
      c.innerHTML = '<div class="tarj"><div class="tarj-cuerpo">' + (typeof arrVacioSupervisar === 'function' ? arrVacioSupervisar(g) : '') + '</div></div>';
      if(typeof arrVacioAtar === 'function') arrVacioAtar(c); return;
    }
    c.innerHTML = linEstadoHTML(D) + linReqHTML(D) + linCifrasHTML(D) + linObrasHTML(D) + linPriHTML(D) + linBotonesHTML();
    linMesaAtar(c, D);
  });
}
function linEnCurso(gs){
  if(!gs) return '';
  return '<span class="lin-curso' + (gs.vencida ? ' ven' : '') + '"><b>' + (gs.vencida ? 'Plazo vencido' : 'En curso') + ':</b> ' + esc((LIN_QUE[gs.que] || 'Acción') + (gs.documento ? ' · ' + gs.documento : '')) +
    (gs.plazo ? ' · ' + (gs.vencida ? 'venció el ' : 'vence el ') + esc(linFecha(gs.plazo)) : '') + (gs.por ? ' · ' + esc(gs.por) : '') + '</span>';
}
function linEstadoHTML(D){
  var C = D.cosas || [], pend = C.filter(function(x){ return !x.gest; }), n1 = pend.filter(function(x){ return x.g === 1; }).length, curso = C.length - pend.length;
  var cl = !C.length ? 'ok' : (n1 ? 'mal' : (pend.length ? 'ojo' : 'ok'));
  var tit = !C.length ? 'Todo en orden hoy' : (!pend.length ? 'Lo de hoy ya está en curso' : (pend.length === 1 ? 'Una cosa necesita tu atención hoy' : (pend.length <= 3 ? pend.length + ' cosas necesitan tu atención hoy' : 'Primero, estas 3 cosas')));
  var sub = !C.length ? 'Sin accidentes graves pendientes, nada de riesgo alto vencido, todos con SCTR vigente y sin medidas abiertas.' :
    'De todas tus obras, con sus subcontratas · al ' + linHora(D.ahora) + ' · ' + linUno(C.length, 'alerta', 'alertas') + (curso ? ' · ' + curso + ' en curso' : '');
  var li = function(x, k){
    return '<li class="g' + x.g + (x.gest ? ' curso' : '') + '"><span class="lin-g" aria-hidden="true"></span><div class="lin-cosa-t"><b class="lin-cosa-h">' + x.t + '</b><small>' + x.s + '</small>' + linEnCurso(x.gest) + '</div>' +
      '<div class="lin-cosa-b">' + (x.ir || x.ancla || x.fn ? '<button type="button" class="bt sec chico" data-lin-cosa="' + k + '">' + esc(x.b || 'Ver') + '</button>' : '') +
      (x.reg && !x.gest ? '<button type="button" class="bt sec chico lin-reg" data-lin-reg="' + k + '">Registrar lo que hice</button>' : '') +
      (x.gest && linHay('est-bit') ? '<button type="button" class="bt sec chico" data-lin-ir="est-bit">Bitácora</button>' : '') + '</div></li>';
  };
  return '<section class="lin-estado ' + cl + '" aria-labelledby="lin-est-t"><div class="lin-estado-cab"><span class="lin-estado-ic" aria-hidden="true">' + (cl === 'ok' ? '✓' : '!') + '</span>' +
    '<div><h2 id="lin-est-t">' + esc(tit) + '</h2><p class="sub">' + esc(sub) + '</p></div></div>' +
    (C.length ? '<ol class="lin-cosas">' + C.slice(0, 3).map(function(x, k){ return li(x, k); }).join('') + '</ol>' +
      (C.length > 3 ? '<ol class="lin-cosas lin-cosas-mas" id="lin-cosas-mas" ' + (LIN.todas ? '' : 'hidden') + '>' + C.slice(3).map(function(x, k){ return li(x, k + 3); }).join('') + '</ol>' +
        '<button type="button" class="lin-mas" id="lin-mas" aria-expanded="' + (LIN.todas ? 'true' : 'false') + '">' + (LIN.todas ? 'Ver solo las 3 primeras' : 'Ver las ' + C.length + ' alertas') + '</button>' : '') : '') + '</section>';
}
/* la gente en obra con requisitos vencidos, por empresa: lo que la entidad debe verificar (SCTR) y lo que pide regularizar */
function linReqFilas(D){
  var cum = (D.cum && D.cum.empresas) || [], F = [];
  cum.forEach(function(x){
    var f = linFaltas(x); if(!(f.s || f.e || f.n)) return;
    var sub = x.via === 'subcontrata', padre = sub ? cum.filter(function(y){ return y.nombre === x.padre && y.via !== 'subcontrata'; })[0] : null;
    var dest = sub ? padre : x, directa = !!(dest && dest.enlace && dest.via !== 'contratista_sup' && dest.via !== 'supervisora');
    F.push({ x:x, f:f, dest:dest, directa:directa, clave:'reqp:' + linSlug(x.nombre) });
  });
  return F.sort(function(a, b){ return b.f.s - a.f.s || b.f.e - a.f.e || b.f.n - a.f.n; });
}
function linReqHTML(D){
  var F = linReqFilas(D); if(!F.length) return '';
  var manda = linManda(), t = { s:0, e:0, n:0 }; F.forEach(function(r){ t.s += r.f.s; t.e += r.f.e; t.n += r.f.n; });
  var cel = function(n, cl, et){ return '<td class="num" data-et="' + et + '">' + (n ? '<b class="lin-nota-' + cl + '">' + linN(n) + '</b>' : '<span class="arr-gris">—</span>') + '</td>'; };
  return '<div class="tarj" id="lin-req"><div class="tarj-cab"><div><h2>Gente en obra con requisitos vencidos</h2><p class="sub">De su personal activo, hoy: ' +
    [t.s ? linUno(t.s, 'sin SCTR vigente', 'sin SCTR vigente') : '', t.e ? linN(t.e) + ' con el EMO vencido o sin EMO' : '', t.n ? linN(t.n) + ' sin inducción' : ''].filter(Boolean).join(' · ') +
    '. Lo regulariza cada empresa; a la subcontrata se le pide por medio de su contratista.</p></div></div>' +
    '<div class="tabla-caja"><table class="arr-t lin-tabla-cel lin-req-t"><thead><tr><th>Empresa</th><th class="num">Sin SCTR vigente</th><th class="num">EMO vencido o sin EMO</th><th class="num">Sin inducción</th><th></th></tr></thead><tbody>' +
    F.map(function(r, k){
      var gs = linGestDe(D, r.clave), sub = r.x.via === 'subcontrata';
      return '<tr' + (k >= 5 && !LIN.reqTodas ? ' hidden' : '') + '><td data-et="Empresa"><b>' + esc(linCorto(r.x.nombre)) + '</b><small class="arr-sub">' + esc(linVia(r.x) + (r.x.proyecto ? ' · ' + r.x.proyecto : '')) + '</small>' +
        (sub && r.directa ? '<small class="arr-sub">Se le pide a ' + esc(linCorto(r.dest.nombre)) + '</small>' : '') + '</td>' +
        cel(r.f.s, 'mal', 'Sin SCTR vigente') + cel(r.f.e, 'ojo', 'EMO vencido o sin EMO') + cel(r.f.n, 'ojo', 'Sin inducción') +
        '<td class="arr-acc lin-req-acc">' + (gs ? linEnCurso(gs) : (manda && r.directa && typeof cadIni === 'function' ? '<button type="button" class="bt sec chico" data-lin-pide="' + k + '">Pedir que regularice</button>' :
          (!r.directa ? '<small class="arr-sub">Por medio de quien la supervisa</small>' : ''))) + '</td></tr>';
    }).join('') + '</tbody></table></div>' +
    (F.length > 5 ? '<button type="button" class="lin-mas lin-req-mas" id="lin-req-mas" aria-expanded="' + (LIN.reqTodas ? 'true' : 'false') + '">' + (LIN.reqTodas ? 'Ver solo las 5 primeras' : 'Ver las ' + F.length + ' empresas') + '</button>' : '') +
    '<p class="sub lin-pie">El SCTR cuenta como vigente con salud y pensión. Quien contrata la obra debe verificar que todos estén asegurados (D.S. 003-98-SA, art. 5).</p></div>';
}
function linCifrasHTML(D){
  var t = linTot(D), k = (D.tab && D.tab.cifras) || {}, R = (D.acc && D.acc.resumen) || {};
  var ps = linPct(t.sOk, t.sTot), pc = linPct(t.cOk, t.cTot), graves = (R.incap || 0) + (R.mortal || 0), sinS = t.sTot - t.sOk;
  return '<div class="rej arr-seis lin-cifras">' +
    cifra('Obras', String((D.obras || []).length), linUno(t.con, 'contratista', 'contratistas') + ' · ' + linUno(t.sub, 'subcontrata', 'subcontratas') + ' · ' + linUno(t.sups, 'supervisora', 'supervisoras'), '') +
    cifra('Trabajadores hoy', linN(t.gente), t.supGente ? linN(t.gente - t.supGente) + ' de las empresas y ' + linN(t.supGente) + ' de las supervisoras' : 'de todas las empresas de tus obras', '') +
    cifra('Sin SCTR vigente', t.sTot ? linN(sinS) : '—', t.sTot ? (sinS ? 'de ' + linN(t.sTot) + ' en obra · ' + ps + ' % al día (salud y pensión)' : 'todos al día (salud y pensión)') : 'sin dato', t.sTot ? (sinS ? 'mal' : 'ok') : '') +
    cifra('Capacitación vigente', pc == null ? '—' : pc + ' %', t.cTot ? linN(t.cTot - t.cOk) + ' sin capacitación en 12 meses' : 'sin dato', pc == null ? '' : (pc < 85 ? 'ojo' : 'ok')) +
    cifra('Observaciones abiertas', String(k.ab || 0), k.ven ? k.ven + (k.ven === 1 ? ' vencida' : ' vencidas') : 'ninguna vencida', k.ven ? 'mal' : '') +
    cifra('Accidentes del año', String(graves), graves ? (R.mortal ? linUno(R.mortal, 'mortal', 'mortales') + ' · ' : '') + linUno(R.dias_perdidos || 0, 'día', 'días') + ' de descanso médico' : 'ninguno con descanso médico', R.mortal ? 'mal' : (graves ? 'ojo' : '')) + '</div>';
}
/* lo que pasa en una obra, en palabras (lo más grave primero; hasta 3) */
function linObraChips(D, o){
  var ch = [], nombres = o.emps.map(function(e){ return e.nombre; }), en = function(n){ return nombres.indexOf(n) > -1; }, sinS = 0, sinE = 0;
  o.emps.forEach(function(e){ var f = linFaltas(e); sinS += f.s; sinE += f.e; });
  var AL = (D.tab && D.tab.alertas) || [];
  if(o.mortal) ch.push([o.mortalHoy ? 'Accidente mortal hoy' : linUno(o.mortal, 'accidente mortal', 'accidentes mortales') + ' en el año', 'mal']);
  if(sinS) ch.push([sinS + ' sin SCTR vigente', 'mal']);
  if(o.med) ch.push([linUno(o.med, 'medida vigente', 'medidas vigentes'), 'mal']);
  if(AL.some(function(a){ return a.que === 'alto_vencido' && en(a.empresa); })) ch.push(['Riesgo alto vencido', 'mal']);
  if(AL.some(function(a){ return a.que === 'sin_homologar' && en(a.empresa); })) ch.push(['Requisitos de ingreso incompletos', 'ojo']);
  if(sinE) ch.push([sinE + ' con el EMO vencido o sin EMO', 'ojo']);
  if(o.acc && !o.mortal) ch.push([linUno(o.acc, 'accidente con descanso', 'accidentes con descanso') + ' en el año', 'ojo']);
  return ch;
}
function linObrasHTML(D){
  var O = D.obras || []; if(!O.length) return '';
  return '<div class="tarj"><div class="tarj-cab"><div><h2>Tus obras</h2><p class="sub">Cada obra con todas sus empresas: la contratista, sus subcontratas y la supervisora · toca una para ver su árbol</p></div>' +
    (linHay('cum-emp') ? '<button type="button" class="bt sec chico" data-lin-ir="cum-emp">Ver cada empresa ›</button>' : '') + '</div>' +
    '<div class="lin-obras' + (O.length === 2 || O.length === 4 ? ' dos' : '') + '">' + O.map(function(o){
      var con = o.emps.filter(function(e){ return e.via !== 'subcontrata'; }), sub = o.emps.length - con.length, ch = linObraChips(D, o);
      var cl = ch.some(function(x){ return x[1] === 'mal'; }) || (o.peor && o.peor.nota < 60) ? 'mal' : (ch.length || (o.peor && o.peor.nota < 80) ? 'ojo' : 'ok');
      return '<article class="lin-obra ' + cl + '"><button type="button" class="lin-obra-b" data-lin-obra="' + esc(o.n) + '"><span class="lin-obra-n">' + esc(o.n) + '</span>' +
        '<span class="lin-obra-r">' + esc([o.region, con.map(function(e){ return linCorto(e.nombre); }).join(', ')].filter(Boolean).join(' · ')) + '</span>' +
        '<span class="lin-obra-k"><span><b>' + linN(o.gente) + '</b> trabajadores</span><span><b>' + (con.length + sub) + '</b> empresas' + (sub ? ' (' + linUno(sub, 'subcontrata', 'subcontratas') + ')' : '') + '</span>' +
        (o.peor ? '<span>Nota más baja <b class="lin-nota-' + (o.peor.nota < 60 ? 'mal' : (o.peor.nota < 80 ? 'ojo' : 'ok')) + '">' + o.peor.nota + '</b></span>' : '') + '</span>' +
        (o.peor && o.peor.nota < 80 ? '<span class="lin-obra-p">La que más preocupa: <b>' + esc(linCorto(o.peor.nombre)) + '</b></span>' : '') +
        '<span class="lin-obra-x">' + (ch.length ? ch.slice(0, 3).map(function(x){ return linPill(x[0], x[1]); }).join(' ') : linPill('Sin alertas hoy', 'ok')) + ' ' +
          (o.sups.length ? linPill('Supervisora: ' + linCorto(o.sups[0].nombre) + (o.supGente ? ' · ' + linN(o.supGente) + ' trab.' : ''), 'gris') : linPill('Sin supervisora', 'ojo')) + '</span></button></article>';
    }).join('') + '</div></div>';
}
/* dónde inspeccionar primero (la fiscalización): las 5 de índice más alto, con «Ordenar inspección» a un toque; si una
   subcontrata suya tuvo un accidente grave en el año, se dice (la contratista responde por sus subcontratas) */
function linBarra(v){ v = Math.max(0, Math.min(100, Math.round(+v || 0))); var cl = v >= 50 ? 'mal' : (v >= 25 ? 'ojo' : 'gris'); return '<span class="lin-bar ' + cl + '" title="' + v + ' de 100"><i style="width:' + v + '%"></i></span><b class="lin-bar-n">' + v + '</b>'; }
function linPriHTML(D){
  var L = ((D.pri && D.pri.lista) || []).slice(0, 5); if(linGrado() < 4 || !L.length) return '';
  var manda = linManda(), por = typeof ARR_POR !== 'undefined' ? ARR_POR : {}, cum = (D.cum && D.cum.empresas) || [], acc = (D.acc && D.acc.lista) || [];
  return '<div class="tarj"><div class="tarj-cab"><div><h2>Primero lo más riesgoso</h2><p class="sub">Dónde inspeccionar primero: las ' + L.length + ' empresas con el índice de riesgo más alto (de 0 a 100: más alto, más riesgo)' + (D.pri.como ? ' · ' + esc(D.pri.como) : '') + '</p></div>' +
    (linHay('fis-prior') ? '<button type="button" class="bt sec chico" data-lin-ir="fis-prior">Ver toda la prioridad ›</button>' : '') + '</div><div class="tabla-caja"><table class="arr-t lin-tabla-cel"><thead><tr><th>Empresa</th><th>Región</th><th>Índice</th><th>Por qué</th><th>Última inspección</th><th></th></tr></thead><tbody>' +
    L.map(function(x){
      var pq = Object.keys(x.por || {}).filter(function(k){ return (x.por[k] || 0) > 0; }).sort(function(a, b){ return x.por[b] - x.por[a]; }).slice(0, 3).map(function(k){ return (por[k] || k) + ' ' + x.por[k]; });
      var subs = cum.filter(function(e){ return e.via === 'subcontrata' && e.padre === x.nombre; }).map(function(e){ return e.nombre; });
      var gS = acc.filter(function(a){ return subs.indexOf(a.empresa) > -1 && (a.clase === 'mortal' || a.clase === 'incap'); }), mS = gS.filter(function(a){ return a.clase === 'mortal'; }).length;
      return '<tr><td data-et="Empresa"><b>' + esc(linCorto(x.nombre || '')) + '</b>' + (gS.length ? '<small class="arr-sub lin-nota-mal">Su subcontrata: ' + esc(mS ? linUno(mS, 'accidente mortal', 'accidentes mortales') : linUno(gS.length, 'accidente con descanso', 'accidentes con descanso')) + ' en el año</small>' : '') + '</td>' +
        '<td data-et="Región">' + esc(x.region || '') + '</td><td class="arr-nota-c" data-et="Índice">' + linBarra(x.indice) + '</td><td data-et="Por qué"><small>' + esc(pq.join(' · ') || 'nada en contra') + '</small></td>' +
        '<td data-et="Última inspección">' + (x.ultima ? esc(typeof hace === 'function' ? hace(x.ultima) : linFecha(x.ultima)) : '<span class="arr-mal">nunca</span>') + '</td><td class="arr-acc">' + (manda && typeof arrOrdenNueva === 'function' ? '<button type="button" class="bt sec chico" data-ord-a="' + esc(x.enlace) + '">Ordenar inspección</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';
}
var LIN_BOTONES = [
  ['cum-consol', 'Informe consolidado', 'Todas las empresas mes a mes, con el IF y el IG, en PDF'],
  ['sup-inf', 'Informe del mes', 'Lo supervisado empresa por empresa, en PDF'],
  ['fis-exp', 'Expediente probatorio', 'Todo de una empresa en un periodo, con sus sellos, en PDF'],
  ['est-bit', 'Bitácora de gestión', 'Lo que hizo tu equipo con cada alerta: documento, plazo y cierre, en Excel'],
  ['cum-qr', 'Verificar a un trabajador', 'Con su DNI o su fotocheck: si puede trabajar hoy']
];
function linBotonesHTML(){
  var L = LIN_BOTONES.filter(function(b){ return linHay(b[0]); }); if(!L.length) return '';
  return '<div class="tarj lin-solo-ancho"><div class="tarj-cab"><div><h2>Informes en un botón</h2><p class="sub">Salen solos de lo que cada empresa registra en OBRASST y de lo que anota tu equipo: nadie los arma a mano</p></div></div>' +
    '<div class="lin-botones">' + L.map(function(b){ return '<button type="button" class="lin-boton" data-lin-ir="' + esc(b[0]) + '"><b>' + esc(b[1]) + '</b><small>' + esc(b[2]) + '</small></button>'; }).join('') + '</div></div>';
}
function linMesaAtar(c, D){
  var C = D.cosas || [];
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-ir]'), function(b){ b.onclick = function(){ linIr(b.getAttribute('data-lin-ir')); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-obra]'), function(b){ b.onclick = function(){ LIN.proy = b.getAttribute('data-lin-obra'); linIr('est-arbol'); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-cosa]'), function(b){ b.onclick = function(){
    var x = C[+b.getAttribute('data-lin-cosa')]; if(!x) return;
    if(x.fn === 'subio'){ if(typeof CAD !== 'undefined') CAD.f = { lado:'arriba', est:'subio', enlace:'', riesgo:'' }; navegar('cad-obs'); return; }
    if(x.ancla){ var a = $(x.ancla); if(a){ a.scrollIntoView({ behavior:'smooth', block:'start' }); a.classList.add('lin-brillo'); setTimeout(function(){ a.classList.remove('lin-brillo'); }, 1600); } return; }
    linIr(x.ir);
  }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-reg]'), function(b){ b.onclick = function(){ var x = C[+b.getAttribute('data-lin-reg')]; if(x) linRegistrar(x, D); }; });
  var F = linReqFilas(D);
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-pide]'), function(b){ b.onclick = function(){ var r = F[+b.getAttribute('data-lin-pide')]; if(r) linPedirRegularizar(r, D, b); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-ord-a]'), function(b){ b.onclick = function(){ arrOrdenNueva(b.getAttribute('data-ord-a'), 'prioridad'); }; });
  if($('lin-req-mas')) $('lin-req-mas').onclick = function(){ LIN.reqTodas = !LIN.reqTodas;
    Array.prototype.forEach.call(c.querySelectorAll('.lin-req-t tbody tr'), function(tr, k){ tr.hidden = k >= 5 && !LIN.reqTodas; });
    this.textContent = LIN.reqTodas ? 'Ver solo las 5 primeras' : 'Ver las ' + F.length + ' empresas'; this.setAttribute('aria-expanded', LIN.reqTodas ? 'true' : 'false'); };
  if($('lin-mas')) $('lin-mas').onclick = function(){ LIN.todas = !LIN.todas; var m = $('lin-cosas-mas'); if(m) m.hidden = !LIN.todas;
    this.textContent = LIN.todas ? 'Ver solo las 3 primeras' : 'Ver las ' + C.length + ' alertas'; this.setAttribute('aria-expanded', LIN.todas ? 'true' : 'false'); };
}
/* el resumen para pegar en WhatsApp: las cifras de hoy, lo urgente y lo que ya se hizo (sin datos de ninguna persona) */
function linWhatsAppTexto(D){
  var t = linTot(D), k = (D.tab && D.tab.cifras) || {}, R = (D.acc && D.acc.resumen) || {}, nO = (D.obras || []).length, sinS = t.sTot - t.sOk;
  var L = ['*' + linEnt() + '* · seguridad en obra · ' + linHora(D.ahora),
    linUno(nO, 'obra', 'obras') + ' · ' + linUno(t.con, 'contratista', 'contratistas') + ', ' + linUno(t.sub, 'subcontrata', 'subcontratas') + ' y ' + linUno(t.sups, 'supervisora', 'supervisoras') + ' · ' + linN(t.gente) + ' trabajadores',
    'Sin SCTR vigente: ' + (t.sTot ? linN(sinS) + ' de ' + linN(t.sTot) : 'sin dato') + ' · Capacitación vigente: ' + (t.cTot ? linPct(t.cOk, t.cTot) + ' %' : 'sin dato'),
    'Observaciones abiertas: ' + (k.ab || 0) + (k.ven ? ' (' + k.ven + ' vencidas)' : ''),
    'Accidentes del año con descanso: ' + ((R.incap || 0) + (R.mortal || 0)) + (R.mortal ? ' (' + R.mortal + ' mortal' + (R.mortal === 1 ? '' : 'es') + ')' : '')];
  var P = (D.cosas || []).filter(function(x){ return !x.gest; }).slice(0, 3), G = (D.cosas || []).filter(function(x){ return x.gest; }).slice(0, 3);
  L.push(''); L.push(P.length ? '*Para hoy:*' : '*Para hoy:* ' + (G.length ? 'lo urgente ya está en curso.' : 'todo en orden.'));
  P.forEach(function(x, i){ L.push((i + 1) + '. ' + linLimpio(x.t)); });
  if(G.length){ L.push(''); L.push('*En curso:*');
    G.forEach(function(x){ L.push('• ' + linLimpio(x.t) + ' → ' + (LIN_QUE[x.gest.que] || 'Acción') + (x.gest.documento ? ' ' + x.gest.documento : '') + (x.gest.plazo ? ', vence el ' + linFecha(x.gest.plazo) : '')); }); }
  L.push(''); L.push('Sale de lo que cada empresa registra en OBRASST. Uso interno: no reemplaza el informe.');
  return L.join('\n');
}
function linWhatsApp(D){
  var tx = linWhatsAppTexto(D), comparte = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  abrirHoja('Resumen para WhatsApp', 'Cópialo y pégalo en el chat de tu equipo o de tu despacho', '<textarea id="lin-wa-t" class="lin-wa" rows="14" readonly aria-label="Resumen para WhatsApp">' + esc(tx) + '</textarea>' +
    '<p class="sub">Sin nombres ni documentos de ninguna persona: solo cifras, lo urgente y lo que ya se hizo.</p>',
    '<button type="button" class="bt sec" id="lin-wa-x">Cerrar</button>' + (comparte ? '<button type="button" class="bt sec" id="lin-wa-s">Compartir</button>' : '') + '<button type="button" class="bt" id="lin-wa-c">Copiar</button>');
  $('lin-wa-x').onclick = cerrarHoja;
  if($('lin-wa-s')) $('lin-wa-s').onclick = function(){ navigator.share({ text:tx }).catch(function(){}); };
  $('lin-wa-c').onclick = function(){
    var t = $('lin-wa-t'), hecho = function(){ toast('Copiado: pégalo en WhatsApp'); };
    try{ navigator.clipboard.writeText(tx).then(hecho, function(){ t.select(); try{ document.execCommand('copy'); hecho(); }catch(e){ toast('Selecciónalo y cópialo a mano.'); } }); }
    catch(e){ t.select(); try{ document.execCommand('copy'); hecho(); }catch(e2){ toast('Selecciónalo y cópialo a mano.'); } }
  };
}

/* ══ 4 · REGISTRAR LO QUE HICE (la bitácora) Y EL TEXTO PARA EL ASIENTO ═══════════════════════════════════════
   El texto del asiento lo escribe el inspector o la supervisión en el cuaderno de obra; aquí sale armado con los datos de la
   alerta, para copiarlo y ajustarlo. Lo que se registra queda sellado con la hora del servidor. */
function linAsientoTexto(x, D){
  if(!x || !x.as) return '';
  return 'Asiento N.° ___ · ' + linFecha(linISO(new Date())) + '\n' +
    'Se deja constancia de que, según los registros de la obra en OBRASST al ' + linHora((D && D.ahora) || Date.now()) + ', ' + x.as.hecho + '.\n' +
    'Se solicita ' + (x.as.a || 'al contratista') + ' ' + x.as.pedido + (x.as.dias ? ', en el plazo de ' + linUno(x.as.dias, 'día calendario', 'días calendario') : '') + '.';
}
function linRegistrar(x, D, despues){
  var dias = x.as && x.as.dias ? x.as.dias : (x.g === 1 ? 1 : (x.g === 2 ? 3 : 7)), asi = linAsientoTexto(x, D);
  var h = '<p class="lin-reg-de"><b>' + x.t + '</b><small>' + x.s + '</small></p>' +
    '<div class="campo"><label for="lin-g-que">Qué hiciste</label><select id="lin-g-que">' + Object.keys(LIN_QUE).filter(function(k){ return k !== 'observacion' || x.k !== 'orden'; }).map(function(k){
      return '<option value="' + k + '"' + (k === (asi ? 'asiento' : 'carta') ? ' selected' : '') + '>' + esc(LIN_QUE[k]) + '</option>'; }).join('') + '</select></div>' +
    '<div class="lin-fila"><div class="campo"><label for="lin-g-doc">Documento N.°</label><input id="lin-g-doc" maxlength="80" autocomplete="off" placeholder="' + esc(LIN_QUE_DOC[asi ? 'asiento' : 'carta']) + '"></div>' +
    '<div class="campo lin-hasta"><label for="lin-g-plazo">Plazo para que se resuelva</label><input id="lin-g-plazo" type="date" min="' + linISO(new Date()) + '" max="' + linMasDias(365) + '" value="' + linMasDias(dias) + '"></div></div>' +
    '<div class="campo"><label for="lin-g-det">Detalle (opcional en asiento, carta e informe)</label><textarea id="lin-g-det" rows="2" maxlength="600" placeholder="A quién se dirigió y qué se pidió."></textarea></div>' +
    (asi ? '<details class="lin-asi"' + (x.g === 1 ? ' open' : '') + '><summary>Texto para el asiento del cuaderno de obra</summary><textarea id="lin-g-as" rows="6" maxlength="1500" aria-label="Texto para el asiento">' + esc(asi) + '</textarea>' +
      '<div class="lin-fila"><button type="button" class="bt sec chico" id="lin-g-asc">Copiar el texto</button><small class="sub">Lo anota el inspector o la supervisión en el cuaderno de obra; después pon aquí el número del asiento.</small></div></details>' : '') +
    '<p class="sub">Queda en tu bitácora con la hora del servidor y su huella: si alguien lo cambia, se nota.</p><div class="msg mal" id="lin-g-msg" role="alert"></div>';
  abrirHoja('Registrar lo que hice', x.obraN || 'De todas tus obras', h, '<button type="button" class="bt sec" id="lin-g-no">Cancelar</button><button type="button" class="bt" id="lin-g-ok">Guardar en la bitácora</button>');
  $('lin-g-no').onclick = cerrarHoja;
  $('lin-g-que').onchange = function(){ var v = this.value; $('lin-g-doc').placeholder = LIN_QUE_DOC[v] || ''; };
  if($('lin-g-asc')) $('lin-g-asc').onclick = function(){ var t = $('lin-g-as'), ok = function(){ toast('Copiado: pégalo en el cuaderno de obra'); };
    try{ navigator.clipboard.writeText(t.value).then(ok, function(){ t.select(); try{ document.execCommand('copy'); ok(); }catch(e){} }); }catch(e){ t.select(); try{ document.execCommand('copy'); ok(); }catch(e2){} } };
  $('lin-g-ok').onclick = function(){
    var m = $('lin-g-msg'), bt = this, que = $('lin-g-que').value, doc = ($('lin-g-doc').value || '').trim(), det = ($('lin-g-det').value || '').trim(), pl = $('lin-g-plazo').value || null;
    m.textContent = '';
    if(['asiento', 'carta', 'informe', 'observacion', 'orden'].indexOf(que) > -1 && !doc && que !== 'observacion' && que !== 'orden'){ m.textContent = LIN_MOTIVO.documento; $('lin-g-doc').focus(); return; }
    if(['reunion', 'otro'].indexOf(que) > -1 && det.length < 5){ m.textContent = LIN_MOTIVO.detalle; $('lin-g-det').focus(); return; }
    bt.disabled = true;
    var p = { emp:linEmp(), clave:x.clave, titulo:linLimpio(x.t).slice(0, 300), empresa:(x.emp || (x.emps || []).join(', ')).slice(0, 160) || null, proy:x.proy || null, que:que,
              documento:doc || null, detalle:det || null, plazo:pl, n:typeof cadYo === 'function' ? cadYo() : null };
    sbRpc('sst_est_gestion_poner', { p:p }).then(function(r){
      bt.disabled = false;
      if(!r || !r.ok){ m.textContent = linMotivo(r); return; }
      cerrarHoja(); toast('Anotado en tu bitácora' + (r.gestion && r.gestion.plazo ? ': vence el ' + linFecha(r.gestion.plazo) : ''));
      linGestSumar(r.gestion);
      if(despues) despues(r.gestion); else linRepintar();
    }, function(e){ bt.disabled = false; m.textContent = linMotivo(null, e); });
  };
}
function linGestSumar(g){
  var D = LIN.d; if(!D || !g) return;
  D.gestL = [g].concat((D.gestL || []).filter(function(x){ return x.id !== g.id; }));
  linGestPoner(D, D.gestL);
  D.cosas = linCosas(D);
}
/* pedir que regularice a su gente: una observación (riesgo alto si falta SCTR) a la empresa, o a su contratista si es subcontrata,
   y queda en la bitácora con su número */
function linPedirRegularizar(r, D, bt){
  var x = r.x, f = r.f, sub = x.via === 'subcontrata', dest = r.dest;
  if(!dest || !dest.enlace) return;
  var partes = [f.s ? linUno(f.s, 'sin SCTR vigente (salud y pensión)', 'sin SCTR vigente (salud y pensión)') : '', f.e ? linN(f.e) + ' con el EMO vencido o sin EMO' : '', f.n ? linN(f.n) + ' sin inducción' : ''].filter(Boolean).join(', ');
  var titulo = sub ? 'Regularizar los requisitos del personal de su subcontrata ' + linCorto(x.nombre) : 'Regularizar los requisitos de su personal en obra';
  var nota = 'Según los registros en OBRASST al ' + linHora(D.ahora) + (sub ? ', en su subcontrata ' + linCorto(x.nombre) : '') + ': ' + partes + '. Acrediten lo que corresponda (SCTR vigente de salud y pensión, EMO, inducción); mientras tanto, ese personal no debe ingresar a trabajar.';
  var riesgo = f.s ? 'alto' : 'medio';
  confirmar('¿Le pides a ' + linCorto(dest.nombre) + ' que lo regularice?', 'Se le crea una observación de riesgo ' + riesgo + ': «' + titulo + '». ' + nota + ' Queda en tu bitácora.', { si:'Pedirlo' }).then(function(si){
    if(!si) return;
    if(bt) bt.disabled = true;
    var o = linObraDe(D, x.nombre);
    sbRpc('sst_cad_observar', { p:{ enlace:dest.enlace, titulo:titulo.slice(0, 200), lugar:(x.proyecto || '').slice(0, 120), nota:nota.slice(0, 600), riesgo:riesgo, cond:true,
                                    ext:typeof _cadExt === 'function' ? _cadExt() : null, n:typeof cadYo === 'function' ? cadYo() : null, c:typeof cadCargo === 'function' ? cadCargo() : null } }).then(function(rr){
      if(!rr || !rr.ok){ if(bt) bt.disabled = false; toast(linMotivo(rr)); return null; }
      var n = (rr.obs && rr.obs.n) || null;
      return sbRpc('sst_est_gestion_poner', { p:{ emp:linEmp(), clave:r.clave, titulo:('Requisitos vencidos en ' + linCorto(x.nombre) + ': ' + partes).slice(0, 300), empresa:x.nombre.slice(0, 160),
        proy:o ? o.id : null, que:'observacion', documento:n, detalle:titulo, plazo:linMasDias(riesgo === 'alto' ? 1 : 3), n:typeof cadYo === 'function' ? cadYo() : null } }).then(function(rg){
        if(rg && rg.ok){ linGestSumar(rg.gestion); toast((n ? n + ' enviada' : 'Enviada') + ' a ' + linCorto(dest.nombre) + ' y anotada en tu bitácora'); }
        else toast((n ? n + ' enviada' : 'Enviada') + ' a ' + linCorto(dest.nombre) + '. No se pudo anotar en la bitácora: ' + linMotivo(rg));
        if(typeof CAD !== 'undefined' && CAD) CAD.obs = {};
        linRepintar();
      });
    }, function(e){ if(bt) bt.disabled = false; toast(linMotivo(null, e)); });
  });
}

/* ══ 5 · EL ÁRBOL DE LA OBRA ═══════════════════════════════════════════════════════════════════════════════
   La entidad arriba; debajo, la supervisora y cada contratista; debajo de cada contratista, sus subcontratas. Cada empresa
   con su semáforo y lo de hoy; la contratista también responde por lo de sus subcontratas. Lo que se puede hacer va con
   quien la entidad tiene enlazada (nadie se salta a nadie). Con más de 4 ramas, el árbol va en lista (se lee sin moverse). */
function linArbol(c){
  if(typeof _cadAcc === 'function') _cadAcc(linManda() && linHay('est-com') ? '<button type="button" class="bt sec" id="lin-a-com">Comunicado a esta obra</button>' : '');
  c.innerHTML = '<div class="vacio">Armando el árbol…</div>';
  linTraer().then(function(D){
    if(!c.isConnected || LIN.cual !== 'arbol') return;
    if(!D){ c.innerHTML = typeof arrVacio === 'function' ? arrVacio('No se pudo cargar', 'Revisa tu conexión y vuelve a abrir el árbol.') : ''; return; }
    var O = D.obras || [];
    if(!O.length){ c.innerHTML = '<div class="tarj"><div class="tarj-cuerpo">' + (typeof arrVacioSupervisar === 'function' ? arrVacioSupervisar(linGrado()) : '') + '</div></div>'; if(typeof arrVacioAtar === 'function') arrVacioAtar(c); return; }
    var o = O.filter(function(x){ return x.n === LIN.proy; })[0] || O[0]; LIN.proy = o.n;
    if($('lin-a-com')) $('lin-a-com').onclick = function(){ LIN.com.form = true; LIN.com.para = o.id || ''; linIr('est-com'); };
    c.innerHTML = (O.length > 1 ? '<div class="seg lin-seg" role="tablist" aria-label="Obra">' + O.map(function(x){ return '<button type="button" role="tab" aria-selected="' + (x.n === o.n) + '" class="' + (x.n === o.n ? 'on' : '') + '" data-lin-p="' + esc(x.n) + '">' + esc(x.n) + '</button>'; }).join('') + '</div>' : '') +
      linArbolHTML(D, o) + linArbolLeyenda();
    /* si el árbol no cabe a lo ancho, va en lista (no se corta a la derecha) */
    var caja = c.querySelector('.lin-arbol-caja'), ar = c.querySelector('.lin-arbol');
    if(caja && ar && caja.scrollWidth > caja.clientWidth + 2) ar.classList.add('lista');
    Array.prototype.forEach.call(c.querySelectorAll('[data-lin-p]'), function(b){ b.onclick = function(){ LIN.proy = b.getAttribute('data-lin-p'); linArbol(c); }; });
    Array.prototype.forEach.call(c.querySelectorAll('[data-lin-nodo]'), function(b){ b.onclick = function(){ linNodoVer(D, o, b.getAttribute('data-lin-nodo')); }; });
  });
}
/* lo de una empresa en el árbol: su semáforo y sus cifras cortas; la contratista, con lo de sus subcontratas sumado */
function linNodoInfo(D, x, esSup, o){
  var med = ((D.med && D.med.lista) || []).filter(function(m){ return m.estado === 'vigente' && m.empresa === x.nombre; });
  var acc = ((D.acc && D.acc.lista) || []).filter(function(a){ return a.empresa === x.nombre && (a.clase === 'incap' || a.clase === 'mortal'); });
  var car = ((D.car && D.car.lista) || []).filter(function(l){ return l.id === x.enlace || (esSup && l.id === x.id); })[0] || null;
  var q = car ? car.req || {} : {}, ob = x.obs || (car ? car.obs : null) || {}, f = esSup ? { s:0, e:0, n:0 } : linFaltas(x);
  var faltaIng = car && car.homologada === false;
  var mal = med.length || acc.some(function(a){ return a.clase === 'mortal'; }) || f.s || (ob.alto && ob.ven) || (x.nota != null && x.nota < 60);
  var ojo = (ob.ven || 0) > 0 || faltaIng || (x.nota != null && x.nota < 80) || acc.length || f.e;
  var sub = null;
  if(o && !esSup && x.via !== 'subcontrata'){
    var S = o.emps.filter(function(e){ return e.via === 'subcontrata' && e.padre === x.nombre; });
    if(S.length){
      sub = { n:S.length, gente:0, acc:0, mortal:0, sinS:0, med:0, mal:false, ojo:false };
      S.forEach(function(s){ var I = linNodoInfo(D, s, false, null); sub.gente += +s.gente || 0; sub.acc += I.acc.length; sub.mortal += I.acc.filter(function(a){ return a.clase === 'mortal'; }).length;
        sub.sinS += I.f.s; sub.med += I.med.length; if(I.cl === 'mal') sub.mal = true; if(I.cl === 'ojo') sub.ojo = true; });
    }
  }
  var cl = mal ? 'mal' : (ojo ? 'ojo' : 'ok');
  if(sub && sub.mal) cl = 'mal'; else if(sub && sub.ojo && cl === 'ok') cl = 'ojo';
  return { cl:cl, med:med, acc:acc, car:car, q:q, o:ob, f:f, sinS:f.s, faltaIng:faltaIng, sub:sub, propio:!!(mal || ojo) };
}
function linNodoHTML(D, x, papel, esSup, o){
  var I = linNodoInfo(D, x, esSup, o), gente = esSup ? ((x.ind || {}).gente || 0) : (+x.gente || 0), k = [];
  k.push('<span><b>' + linN(gente) + '</b> trab.</span>');
  if(x.nota != null) k.push('<span>nota <b class="lin-nota-' + (x.nota < 60 ? 'mal' : (x.nota < 80 ? 'ojo' : 'ok')) + '">' + x.nota + '</b></span>');
  if(I.o.ab) k.push('<span>' + I.o.ab + (I.o.ab === 1 ? ' abierta' : ' abiertas') + (I.o.ven ? ' · <b class="lin-nota-mal">' + I.o.ven + ' venc.</b>' : '') + '</span>');
  var marcas = [], mort = I.acc.filter(function(a){ return a.clase === 'mortal'; }).length;
  if(I.med.length) marcas.push(linPill((I.med[0].tipo === 'paralizacion' ? 'Paralización' : 'Prohibición') + ' vigente', 'mal'));
  if(I.sinS) marcas.push(linPill(I.sinS + ' sin SCTR', 'mal'));
  if(mort) marcas.push(linPill(mort === 1 ? 'Accidente mortal' : mort + ' accidentes mortales', 'mal'));
  else if(I.acc.length) marcas.push(linPill(linUno(I.acc.length, 'accidente con descanso', 'accidentes con descanso'), 'ojo'));
  if(I.f.e) marcas.push(linPill(I.f.e + ' con EMO vencido', 'ojo'));
  if(I.faltaIng) marcas.push(linPill('Requisitos de ingreso incompletos', 'ojo'));
  if(I.sub && (I.sub.mal || (I.sub.ojo && !I.propio))) marcas.push(linPill('Su subcontrata: ' + (I.sub.mortal ? 'accidente mortal' : (I.sub.sinS ? I.sub.sinS + ' sin SCTR' : (I.sub.med ? 'medida vigente' : 'por regularizar'))), I.sub.mal ? 'mal' : 'ojo'));
  if(x.detalle === false) marcas.push(linPill('Comparte solo cifras', 'gris'));
  if(esSup && !gente && !I.o.ab) marcas.push(linPill('Sin datos de hoy', 'gris'));
  return '<button type="button" class="lin-nodo ' + I.cl + '" data-lin-nodo="' + esc(x.enlace || x.id || x.nombre) + '"><span class="lin-sem" aria-hidden="true"></span>' +
    '<span class="lin-nodo-p">' + esc(papel) + '</span><span class="lin-nodo-n">' + esc(linCorto(x.nombre)) + '</span><span class="lin-nodo-k">' + k.join('') + '</span>' +
    (marcas.length ? '<span class="lin-nodo-m">' + marcas.join(' ') + '</span>' : '') + '</button>';
}
function linArbolHTML(D, o){
  var con = o.emps.filter(function(e){ return e.via !== 'subcontrata'; }), subsDe = function(x){ return o.emps.filter(function(e){ return e.via === 'subcontrata' && e.padre === x.nombre; }); };
  var huerf = o.emps.filter(function(e){ return e.via === 'subcontrata' && !con.some(function(x){ return x.nombre === e.padre; }); });
  var ramas = o.sups.length + huerf.length; con.forEach(function(x){ ramas += Math.max(1, subsDe(x).length); });
  var hijos = o.sups.map(function(s){ return '<li>' + linNodoHTML(D, s, 'Supervisora', true, o) + '</li>'; }).concat(con.map(function(x){
    var S = subsDe(x);
    return '<li>' + linNodoHTML(D, x, x.via === 'supervisora' || x.via === 'contratista_sup' ? 'Contratista (por su supervisora)' : 'Contratista', false, o) + (S.length ? '<ul>' + S.map(function(s){ return '<li>' + linNodoHTML(D, s, 'Subcontrata', false, o) + '</li>'; }).join('') + '</ul>' : '') + '</li>';
  })).concat(huerf.map(function(s){ return '<li>' + linNodoHTML(D, s, 'Subcontrata', false, o) + '</li>'; }));
  var nE = o.emps.length + o.sups.length;
  return '<div class="tarj"><div class="tarj-cab"><div><h2>' + esc(o.n) + '</h2><p class="sub">' + esc([o.region, linUno(nE, 'empresa', 'empresas'), linN(o.gente) + ' trabajadores de las empresas' + (o.supGente ? ' y ' + linN(o.supGente) + ' de la supervisora' : '')].filter(Boolean).join(' · ')) +
    ' · toca una empresa para ver lo suyo</p></div></div><div class="lin-arbol-caja"><div class="lin-arbol' + (ramas > 4 ? ' lista' : '') + '" role="tree" aria-label="Árbol de la obra ' + esc(o.n) + '"><ul><li>' +
    '<div class="lin-nodo raiz"><span class="lin-nodo-p">Entidad</span><span class="lin-nodo-n">' + esc(linCorto(linEnt())) + '</span><span class="lin-nodo-k"><span>' + esc(o.n) + '</span></span></div>' +
    (hijos.length ? '<ul>' + hijos.join('') + '</ul>' : '') + '</li></ul></div></div></div>';
}
function linArbolLeyenda(){
  return '<div class="lin-leyenda"><span><i class="lin-sem ok"></i>Al día</span><span><i class="lin-sem ojo"></i>Por regularizar esta semana</span><span><i class="lin-sem mal"></i>Requiere acción inmediata</span>' +
    '<span class="sub">El semáforo mira la nota de hoy, lo vencido, el SCTR, el EMO, los accidentes, las medidas y los requisitos de ingreso; la contratista, también lo de sus subcontratas. Todo sale de los registros de cada empresa.</span></div>';
}
function linNodoVer(D, o, id){
  var todos = o.emps.concat(o.sups), x = todos.filter(function(e){ return (e.enlace || e.id || e.nombre) === id; })[0]; if(!x) return;
  var esSup = o.sups.indexOf(x) > -1, I = linNodoInfo(D, x, esSup, o), manda = linManda(), g = linGrado();
  var directa = esSup || x.via === 'directa' || x.via === 'contratista', enl = esSup ? x.id : x.enlace;
  var fila = function(a, b, cl){ return '<div class="lin-f"><span>' + esc(a) + '</span><b' + (cl ? ' class="lin-nota-' + cl + '"' : '') + '>' + b + '</b></div>'; };
  var pc = function(o2){ return (o2 && +o2.tot > 0) ? Math.round(100 * (+o2.ok || 0) / +o2.tot) + ' %' : '—'; };
  var h = '<div class="lin-ficha">' + fila('Papel en la obra', esc(esSup ? 'Supervisora' : linVia(x))) +
    (x.ruc ? fila('RUC', esc(x.ruc)) : '') + fila('Trabajadores hoy', linN(esSup ? ((x.ind || {}).gente || 0) : x.gente)) +
    (!esSup && x.nota != null ? fila('Nota de hoy', String(x.nota), x.nota < 60 ? 'mal' : (x.nota < 80 ? 'ojo' : 'ok')) : '') +
    (!esSup ? fila('Capacitación vigente', pc(x.cap)) + fila('SCTR vigente (salud y pensión)', pc(x.sctr) + (I.f.s ? ' · ' + I.f.s + ' sin SCTR' : ''), I.f.s ? 'mal' : '') +
      fila('EMO vigente', x.emo ? pc(x.emo) + (I.f.e ? ' · ' + I.f.e + ' vencido o sin EMO' : '') : 'sin dato', I.f.e ? 'ojo' : '') + (x.ind ? fila('Con inducción', pc(x.ind) + (I.f.n ? ' · ' + I.f.n + ' sin inducción' : ''), I.f.n ? 'ojo' : '') : '') : '') +
    fila('Observaciones abiertas', String(I.o.ab || 0) + (I.o.ven ? ' · ' + I.o.ven + ' vencidas' : ''), I.o.ven ? 'mal' : '') +
    (I.car && I.q.total ? fila('Documentos aprobados', (I.q.ok || 0) + ' de ' + I.q.total + (I.q.por_revisar ? ' · ' + I.q.por_revisar + ' por revisar' : ''), I.faltaIng ? 'ojo' : '') : '') +
    (I.med.length ? fila('Medida vigente', esc((I.med[0].tipo === 'paralizacion' ? 'Paralización: ' : 'Prohibición: ') + (I.med[0].detalle || '')), 'mal') : '') +
    (I.acc.length ? fila('Accidentes con descanso en el año', String(I.acc.length) + (I.acc.some(function(a){ return a.clase === 'mortal'; }) ? ' (mortal)' : ''), I.acc.some(function(a){ return a.clase === 'mortal'; }) ? 'mal' : 'ojo') : '') +
    (I.sub ? fila('Con sus ' + linUno(I.sub.n, 'subcontrata', 'subcontratas'), esc([linN(I.sub.gente) + ' trabajadores', I.sub.acc ? linUno(I.sub.acc, 'accidente con descanso', 'accidentes con descanso') + (I.sub.mortal ? ' (' + linUno(I.sub.mortal, 'mortal', 'mortales') + ')' : '') : '',
      I.sub.sinS ? I.sub.sinS + ' sin SCTR' : '', I.sub.med ? linUno(I.sub.med, 'medida vigente', 'medidas vigentes') : ''].filter(Boolean).join(' · ')), I.sub.mal ? 'mal' : (I.sub.ojo ? 'ojo' : '')) : '') + '</div>';
  if(I.sub && (I.sub.mal || I.sub.ojo)) h += '<p class="sub lin-nota">La contratista responde por sus subcontratas: lo de ellas también la pone en ' + (I.sub.mal ? 'rojo' : 'ámbar') + '.</p>';
  if(!directa) h += '<p class="sub lin-nota">Para observarla o pedirle algo, va por medio de ' + esc(linCorto(x.padre || 'su contratista')) + ': nadie se salta a nadie. Los comunicados de la entidad sí le llegan directo.</p>';
  if(x.detalle === false) h += '<p class="sub lin-nota">Comparte solo sus cifras: su gente no se abre desde aquí.</p>';
  var b = [];
  if(!esSup && linHay('cum-emp') && x.detalle !== false) b.push('<button type="button" class="bt sec" id="lin-n-gente">Ver su gente</button>');
  if(directa && enl && manda && typeof arrDocs === 'function' && linHay('sup-emp')) b.push('<button type="button" class="bt sec" id="lin-n-doc">Documentos</button>');
  if(directa && enl && typeof cadNuevaObs === 'function' && linHay('cad-obs')) b.push('<button type="button" class="bt sec" id="lin-n-obs">Observar</button>');
  if(directa && enl && manda && g >= 4 && typeof arrOrdenNueva === 'function') b.push('<button type="button" class="bt" id="lin-n-ord">Ordenar inspección</button>');
  abrirHoja(linCorto(x.nombre), o.n, h, b.join('') || '<button type="button" class="bt sec" id="lin-n-x">Cerrar</button>');
  if($('lin-n-x')) $('lin-n-x').onclick = cerrarHoja;
  if($('lin-n-gente')) $('lin-n-gente').onclick = function(){ cerrarHoja(); if(typeof CUM !== 'undefined' && CUM){ CUM.abrir = x.enlace; } linIr('cum-emp'); };
  if($('lin-n-doc')) $('lin-n-doc').onclick = function(){ cerrarHoja(); arrDocs(enl); };
  if($('lin-n-obs')) $('lin-n-obs').onclick = function(){ cerrarHoja(); cadNuevaObs(enl); };
  if($('lin-n-ord')) $('lin-n-ord').onclick = function(){ cerrarHoja(); arrOrdenNueva(enl, 'otro'); };
}

/* ══ 6 · LOS COMUNICADOS EN CASCADA ═════════════════════════════════════════════════════════════════════════
   Un comunicado (sale en el mural de cada empresa y en el celular de su gente) o un estándar (cada trabajador lo lee y lo
   firma), con su sustento (la norma o la cláusula del contrato). Llega solo a todas las empresas de tus obras: contratistas,
   sus subcontratas y las supervisoras. Nadie del medio tiene que reenviar nada. Aquí, el acuse de cada una (y cuánto tardó),
   reiterar a las que no confirmaron y retirar con su motivo. El plazo para confirmar: 2 horas el urgente, 24 el de siempre. */
var LIN_MODELOS = [
  { k:'lluvia', n:'Lluvias intensas', tipo:'comunicado', urgente:true, t:'Lluvias intensas: medidas desde hoy', base:'Plan de SST de cada obra',
    x:'Se pronostican lluvias intensas. Apliquen los criterios de suspensión y reinicio de su Plan de SST y de su IPERC para los trabajos en altura, el izaje y las excavaciones: la evaluación es del residente y del responsable de SST de cada empresa, y queda en su inspección del día.' },
  { k:'sismo', n:'Después de un sismo', tipo:'comunicado', urgente:true, t:'Después del sismo: evacuar, contar e inspeccionar', base:'Plan de respuesta ante emergencias de cada obra',
    x:'Activen su plan de respuesta ante emergencias: evacuar a la zona segura, contar a toda la gente con la lista del tareo e inspeccionar estructuras, andamios, excavaciones e instalaciones eléctricas antes de volver a trabajar. Reporten cualquier daño en el registro de la obra.' },
  { k:'visita', n:'Visita de la entidad', tipo:'comunicado', urgente:false, t:'Visita de supervisión de la entidad la próxima semana', base:'',
    x:'La entidad visitará la obra la próxima semana. Tengan al día el Plan de SST, el IPERC, los PETS, los PETAR, el SCTR y los registros de capacitación, inducción y EPP de todo el personal, subcontratas incluidas.' },
  { k:'altura', n:'Estándar de trabajos en altura', tipo:'estandar', urgente:false, t:'Estándar de trabajos en altura', base:'Plan de SST de cada obra y su PETAR',
    x:'Los trabajos en altura se hacen como lo dice el Plan de SST de la obra: con arnés de cuerpo completo, línea de anclaje y punto de anclaje adecuado, y con su PETAR autorizado. Cada trabajador lo lee y lo firma en su celular.' }
];
function linCom(c){
  var manda = linManda(), g = linGrado();
  if(typeof _cadAcc === 'function') _cadAcc(manda && g >= 3 ? '<button type="button" class="bt" id="lin-c-nuevo">Nuevo comunicado</button>' : '');
  if($('lin-c-nuevo')) $('lin-c-nuevo').onclick = function(){ LIN.com.form = !LIN.com.form; linCom(c); };
  c.innerHTML = '<div class="vacio">Cargando los comunicados…</div>';
  Promise.all([linRpc('sst_est_lista', { p:{ emp:linEmp() } }), linTraer()]).then(function(R){
    if(!c.isConnected || LIN.cual !== 'com') return;
    var j = R[0], D = R[1];
    if(!j){ c.innerHTML = typeof arrVacio === 'function' ? arrVacio('No se pudo cargar', 'Revisa tu conexión y vuelve a abrir esta sección.') : ''; return; }
    var L = (j.arriba || []).filter(function(s){ return s.cascada; });
    c.innerHTML = (manda && g >= 3 && LIN.com.form ? linComForm(D) : '') + linComLista(L, j.manda) +
      (!L.length && !LIN.com.form ? '<div class="tarj"><div class="tarj-cuerpo lin-com-vacio"><h2>De la entidad hasta el último trabajador</h2><p>Lo que publicas aquí llega solo a todas las empresas de tus obras: cada contratista, sus subcontratas y la supervisora. El comunicado sale en el mural de cada empresa y en el celular de su gente; el estándar, cada trabajador lo lee y lo firma. Ves quién lo recibió, cuánto tardó y cuántos firmaron.</p>' +
        (manda && g >= 3 ? '<button type="button" class="bt" id="lin-c-prim">Enviar el primero</button>' : '<p class="sub">Lo publica un jefe o el gerente de tu equipo.</p>') + '</div></div>' : '');
    linComAtar(c, D, L);
  });
}
/* a cuántas empresas y trabajadores les llega: cada empresa una sola vez (la supervisora que está en dos obras, también) */
function linComAlcance(D, proy){
  var o = proy ? ((D && D.obras) || []).filter(function(x){ return x.id === proy; })[0] : null, g = 0;
  if(o){ o.emps.forEach(function(x){ g += +x.gente || 0; }); o.sups.forEach(function(l){ g += (l.ind || {}).gente || 0; }); return { n:o.emps.length + o.sups.length, g:g }; }
  var t = D ? linTot(D) : { con:0, sub:0, sups:0, gente:0 };
  return { n:t.con + t.sub + t.sups, g:t.gente };
}
function linComForm(D){
  var t = LIN.com.tipo, O = ((D && D.obras) || []).filter(function(o){ return o.id; }), al = linComAlcance(D, LIN.com.para), est = t === 'estandar';
  return '<div class="tarj lin-com-f"><div class="tarj-cab"><div><h2>Nuevo comunicado</h2><p class="sub">Llega solo a todas las empresas de tus obras y a su gente. Queda con la hora del servidor y su huella: si alguien lo cambia, se nota.</p></div></div><div class="tarj-cuerpo">' +
    '<div class="seg lin-seg" role="tablist" aria-label="Qué envías"><button type="button" role="tab" data-lin-t="comunicado" aria-selected="' + !est + '" class="' + (!est ? 'on' : '') + '">Comunicado</button>' +
    '<button type="button" role="tab" data-lin-t="estandar" aria-selected="' + est + '" class="' + (est ? 'on' : '') + '">Estándar</button></div>' +
    '<p class="sub lin-com-que">' + (!est ? 'Sale en el mural de cada empresa y en el celular de cada trabajador. Puede ir solo con texto, con un archivo o con los dos.' : 'Va con su documento y su sustento. Cada trabajador lo lee y lo firma en su celular; ves cuántos firmaron en cada empresa.') + '</p>' +
    '<div class="lin-modelos"><span class="sub">Usar un modelo:</span>' + LIN_MODELOS.filter(function(m){ return m.tipo === t; }).map(function(m){ return '<button type="button" class="bt sec chico" data-lin-mod="' + m.k + '">' + esc(m.n) + '</button>'; }).join('') + '</div>' +
    '<div class="campo"><label for="lin-c-t">Título</label><input id="lin-c-t" maxlength="140" placeholder="' + (!est ? 'Lluvias intensas: medidas desde hoy' : 'Estándar de trabajos en altura') + '"></div>' +
    '<div class="campo"><label for="lin-c-x">Mensaje</label><textarea id="lin-c-x" rows="4" maxlength="1200" placeholder="Lo que tiene que saber cada empresa y su gente, en pocas líneas."></textarea></div>' +
    '<div class="campo"><label for="lin-c-base">Sustento: la norma o la cláusula del contrato' + (est ? '' : ' (opcional)') + '</label><input id="lin-c-base" maxlength="200" placeholder="Ej.: Plan de SST de la obra; cláusula 12 del contrato"></div>' +
    (est ? '<div class="lin-fila"><div class="campo"><label for="lin-c-cod">Código</label><input id="lin-c-cod" maxlength="40" placeholder="EST-SST-01"></div><div class="campo"><label for="lin-c-ver">Versión</label><input id="lin-c-ver" maxlength="20" placeholder="1"></div></div>' : '') +
    '<div class="lin-fila"><label class="bt sec chico lin-arch">' + (LIN.com.arch ? 'Cambiar el archivo' : (est ? 'Elegir el documento (PDF)' : 'Agregar un archivo (PDF o imagen)')) + '<input type="file" id="lin-c-f" accept=".pdf,image/*" hidden></label>' +
      '<span id="lin-c-fn" class="sub">' + (LIN.com.arch ? esc(LIN.com.arch.name) : (est ? 'Obligatorio' : 'Opcional')) + '</span></div>' +
    '<div class="lin-fila">' + (!est ? '<label class="chk"><input type="checkbox" id="lin-c-urg"> <span>Urgente: sale primero, con ⚠, y se confirma en 2 horas</span></label>' +
        '<div class="campo lin-hasta"><label for="lin-c-h">En el mural hasta</label><input id="lin-c-h" type="date" min="' + linISO(new Date()) + '"></div>'
      : '<label class="chk"><input type="checkbox" id="lin-c-fir" checked> <span>Que cada trabajador lo lea y lo firme</span></label>') + '</div>' +
    (O.length > 1 ? '<div class="campo"><label for="lin-c-para">Para</label><select id="lin-c-para"><option value="">Todas mis obras</option>' + O.map(function(o){ return '<option value="' + esc(o.id) + '"' + (o.id === LIN.com.para ? ' selected' : '') + '>Solo ' + esc(o.n) + '</option>'; }).join('') + '</select></div>' : '') +
    '<p class="lin-alcance" id="lin-c-al">Le llega a <b>' + al.n + (al.n === 1 ? ' empresa' : ' empresas') + '</b> y a <b>' + linN(al.g) + ' trabajadores</b>: contratistas, subcontratas y supervisoras.</p>' +
    '<div class="lin-fila lin-env"><button type="button" class="bt" id="lin-c-env">Enviar a toda la cadena</button><button type="button" class="bt sec" id="lin-c-can">Cancelar</button><span class="msg" id="lin-c-msg" role="status"></span></div></div></div>';
}
function linPlazoAcuse(s){ return (s.urgente ? 2 : 24) * 3600000; }
function linComLista(L, manda){
  if(!L.length) return '';
  var ahora = Date.now();
  return '<div class="tarj"><div class="tarj-cab"><div><h2>Lo que enviaste</h2><p class="sub">Cada empresa con su acuse y cuánto tardó (el urgente se confirma en 2 horas; el de siempre, en 24); el estándar, cuántos firmaron; el comunicado, cuántos lo vieron en el mural</p></div></div>' + L.map(function(s){
    var T = s.tot || {}, E = s.empresas || [], ab = !!LIN.com.abierto[s.id], est = s.tipo === 'estandar', pend = (T.empresas || 0) - (T.recibidas || 0);
    var pr = linPct(T.recibidas || 0, T.empresas || 0), pf = linPct(T.firmas || 0, T.gente || 0), t0 = Date.parse(s.creado), fuera = pend && ahora - t0 > linPlazoAcuse(s);
    var reit = E.reduce(function(m, e){ return e.reiterado && (!m || e.reiterado > m) ? e.reiterado : m; }, null);
    return '<article class="lin-com' + (s.estado !== 'vigente' ? ' ret' : '') + '"><div class="lin-com-cab"><div><b class="lin-com-t">' + (s.urgente ? '⚠ ' : '') + esc((s.codigo ? s.codigo + ' · ' : '') + s.titulo) + '</b>' +
      '<span class="lin-com-s">' + [linPill(est ? 'Estándar' : 'Comunicado', est ? 'azul' : 'gris'), s.urgente ? linPill('Urgente', 'mal') : '', s.estado !== 'vigente' ? linPill('Retirado', 'gris') : '',
        '<span class="sub">' + esc('Enviado el ' + linHora(s.creado) + (s.por ? ' por ' + s.por : '') + ' · ' + (s.proyecto ? 'solo ' + s.proyecto : 'a todas las obras')) + '</span>'].join(' ') + '</span></div>' +
      '<div class="lin-com-acc">' + (s.url ? '<a class="bt sec chico" href="' + esc(s.url) + '" target="_blank" rel="noopener">Ver el archivo</a>' : '') +
        (manda && s.estado === 'vigente' ? '<button type="button" class="bt sec chico" data-lin-ret="' + esc(s.id) + '">Retirar</button>' : '') + '</div></div>' +
      (s.texto ? '<p class="lin-com-x">' + esc(s.texto) + '</p>' : '') + (s.base ? '<p class="sub lin-com-base">Sustento: ' + esc(s.base) + '</p>' : '') +
      (s.estado !== 'vigente' && (s.retiro_motivo || s.retirado) ? '<p class="sub lin-com-ret">Retirado' + (s.retirado ? ' el ' + esc(linHora(s.retirado)) : '') + (s.retirado_por ? ' por ' + esc(s.retirado_por) : '') + (s.retiro_motivo ? ': «' + esc(s.retiro_motivo) + '»' : '') + '</p>' : '') +
      '<div class="lin-barras"><div class="lin-barra"><span>Recibido por las empresas</span><i><em style="width:' + (pr || 0) + '%"></em></i><b>' + (T.recibidas || 0) + ' de ' + (T.empresas || 0) + (pend ? ' · <span class="lin-nota-' + (fuera ? 'mal' : 'ojo') + '">' + pend + ' sin acuse</span>' : '') + '</b></div>' +
        (est ? (s.difundir ? '<div class="lin-barra"><span>Firmaron los trabajadores</span><i><em style="width:' + (pf || 0) + '%"></em></i><b>' + linN(T.firmas || 0) + ' de ' + linN(T.gente || 0) + '</b></div>' : '')
          : '<div class="lin-barra"><span>Lo vieron en el mural</span><i><em style="width:' + (linPct(T.vistos || 0, T.gente || 0) || 0) + '%"></em></i><b>' + linN(T.vistos || 0) + ' de ' + linN(T.gente || 0) + '</b></div>') + '</div>' +
      '<div class="lin-com-pie"><button type="button" class="lin-mas" data-lin-ab="' + esc(s.id) + '" aria-expanded="' + ab + '">' + (ab ? 'Ocultar las empresas' : 'Ver cada empresa (' + E.length + ')') + '</button>' +
        (manda && s.estado === 'vigente' && pend ? '<button type="button" class="bt sec chico" data-lin-reit="' + esc(s.id) + '">Reiterar a ' + (pend === 1 ? 'la que no confirmó' : 'las ' + pend + ' que no confirmaron') + '</button>' : '') +
        (reit ? '<span class="sub">Reiterado el ' + esc(linHora(reit)) + '</span>' : '') + '</div>' +
      (ab ? linAcuseHTML(s) : '') + '</article>';
  }).join('') + '</div>';
}
/* el acuse de cada empresa, en el orden de la cadena: la supervisora y cada contratista con sus subcontratas debajo; cuánto tardó cada una */
function linAcuseHTML(s){
  var E = s.empresas || [], est = s.tipo === 'estandar', top = E.filter(function(e){ return !e.padre; }), t0 = Date.parse(s.creado), ahora = Date.now(), plazo = linPlazoAcuse(s);
  top.sort(function(a, b){ return (a.via === 'supervisora' ? 0 : 1) - (b.via === 'supervisora' ? 0 : 1) || String(a.nombre).localeCompare(String(b.nombre)); });
  var fila = function(e, sub){
    var tr = e.recibido ? Date.parse(e.recibido) - t0 : null, lleva = ahora - t0;
    return '<tr class="' + (sub ? 'lin-sub' : '') + '"><td><b>' + (sub ? '<span class="lin-rama" aria-hidden="true">└</span>' : '') + esc(linCorto(e.nombre)) + '</b><small class="arr-sub">' + esc(linVia(e)) + '</small></td>' +
      '<td>' + (e.recibido ? '✓ ' + esc(linHora(e.recibido)) + '<small class="arr-sub">' + esc((tr != null && tr >= 0 ? 'en ' + linLapso(tr) : '') + (e.por ? ' · ' + e.por : '')) + '</small>'
        : linPill('Sin acuse · lleva ' + linLapso(lleva), lleva > plazo ? 'mal' : 'ojo') + (e.n_reit ? '<small class="arr-sub">Reiterado ' + linUno(e.n_reit, 'vez', 'veces') + '</small>' : '')) + '</td>' +
      (est ? '<td>' + (e.difundido ? '✓ ' + esc(linHora(e.difundido)) : '—') + '</td><td class="num">' + (e.firmas != null ? linN(e.firmas) + ' de ' + linN(e.gente || 0) : '—') + '</td>'
        : '<td class="num">' + (e.vistos != null ? linN(e.vistos) + ' de ' + linN(e.gente || 0) : '<span class="arr-gris">—</span>') + '</td>') + '</tr>';
  };
  var filas = [];
  top.forEach(function(e){ filas.push(fila(e, false)); E.filter(function(x){ return x.padre && x.padre === e.nombre; }).forEach(function(x){ filas.push(fila(x, true)); }); });
  E.filter(function(x){ return x.padre && !top.some(function(t){ return t.nombre === x.padre; }); }).forEach(function(x){ filas.push(fila(x, true)); });
  return '<div class="tabla-caja"><table class="arr-t lin-acuse"><thead><tr><th>Empresa</th><th>Recibido</th>' + (est ? '<th>En sus difusiones</th><th class="num">Firmaron</th>' : '<th class="num">Lo vieron</th>') + '</tr></thead><tbody>' + filas.join('') + '</tbody></table></div>';
}
function linComAtar(c, D, L){
  var q = function(sel, fn){ Array.prototype.forEach.call(c.querySelectorAll(sel), fn); };
  if($('lin-c-prim')) $('lin-c-prim').onclick = function(){ LIN.com.form = true; linCom(c); };
  q('[data-lin-t]', function(b){ b.onclick = function(){ LIN.com.tipo = b.getAttribute('data-lin-t'); linCom(c); }; });
  q('[data-lin-ab]', function(b){ b.onclick = function(){ var id = b.getAttribute('data-lin-ab'); LIN.com.abierto[id] = !LIN.com.abierto[id]; linCom(c); }; });
  q('[data-lin-mod]', function(b){ b.onclick = function(){
    var m = LIN_MODELOS.filter(function(x){ return x.k === b.getAttribute('data-lin-mod'); })[0]; if(!m) return;
    var poner = function(){ if($('lin-c-t')) $('lin-c-t').value = m.t; if($('lin-c-x')) $('lin-c-x').value = m.x; if($('lin-c-base')) $('lin-c-base').value = m.base || ''; if($('lin-c-urg')) $('lin-c-urg').checked = !!m.urgente; };
    if(m.tipo !== LIN.com.tipo){ LIN.com.tipo = m.tipo; linCom(c); var esp = setInterval(function(){ if($('lin-c-t') && $('lin-c-base')){ clearInterval(esp); poner(); } }, 60); setTimeout(function(){ clearInterval(esp); }, 4000); }
    else poner();
  }; });
  var f = $('lin-c-f'); if(f) f.onchange = function(){ LIN.com.arch = (f.files && f.files[0]) || null; var n = $('lin-c-fn'); if(n) n.textContent = LIN.com.arch ? LIN.com.arch.name : ''; };
  var pa = $('lin-c-para'); if(pa) pa.onchange = function(){ LIN.com.para = pa.value; var al = linComAlcance(D, LIN.com.para), e = $('lin-c-al');
    if(e) e.innerHTML = 'Le llega a <b>' + al.n + (al.n === 1 ? ' empresa' : ' empresas') + '</b> y a <b>' + linN(al.g) + ' trabajadores</b>: contratistas, subcontratas y supervisoras.'; };
  if($('lin-c-can')) $('lin-c-can').onclick = function(){ LIN.com.form = false; LIN.com.arch = null; linCom(c); };
  var env = $('lin-c-env'); if(env) env.onclick = function(){
    var msg = function(t, mal){ var m = $('lin-c-msg'); if(m){ m.textContent = t; m.className = 'msg' + (mal ? ' mal' : ''); } };
    var tit = ($('lin-c-t').value || '').trim(), tx = ($('lin-c-x').value || '').trim(), base = ($('lin-c-base').value || '').trim(), est = LIN.com.tipo === 'estandar';
    if(tit.length < 3){ msg(LIN_MOTIVO.titulo, true); $('lin-c-t').focus(); return; }
    if(est && !LIN.com.arch){ msg(LIN_MOTIVO.archivo, true); return; }
    if(est && base.length < 3){ msg(LIN_MOTIVO.base, true); $('lin-c-base').focus(); return; }
    if(!est && !LIN.com.arch && tx.length < 10){ msg(LIN_MOTIVO.texto, true); $('lin-c-x').focus(); return; }
    var al = linComAlcance(D, LIN.com.para);
    confirmar(est ? '¿Envías el estándar?' : '¿Envías el comunicado?', 'Le llega ya a ' + al.n + (al.n === 1 ? ' empresa' : ' empresas') + ' y a ' + linN(al.g) + ' trabajadores. Queda registrado y no se edita; si hace falta, lo retiras (con su motivo) y envías otro.', { si:'Enviar' }).then(function(si){
      if(!si) return;
      env.disabled = true; msg(LIN.com.arch ? 'Subiendo el archivo…' : 'Enviando…');
      var sube = LIN.com.arch ? subirArchivoP('comunicados', LIN.com.arch) : Promise.resolve(null);
      sube.then(function(url){
        msg('Enviando a toda la cadena…');
        var p = { emp:linEmp(), tipo:est ? 'estandar' : 'comunicado', titulo:tit, texto:tx || null, base:base || null, url:url, archivo:LIN.com.arch ? LIN.com.arch.name : null, proy:LIN.com.para || null };
        if(est){ p.codigo = ($('lin-c-cod').value || '').trim() || null; p.version = ($('lin-c-ver').value || '').trim() || null; p.firmar = !!($('lin-c-fir') || {}).checked; }
        else { p.urgente = !!($('lin-c-urg') || {}).checked; p.hasta = ($('lin-c-h').value || '') || null; }
        return sbRpc('sst_est_bajar', { p:p });
      }).then(function(r){
        env.disabled = false;
        if(!r || !r.ok){ msg(linMotivo(r), true); return; }
        LIN.com.form = false; LIN.com.arch = null; LIN.t = 0; if(r.est && r.est.id) LIN.com.abierto[r.est.id] = true;
        toast('Enviado: le llegó a ' + r.empresas + (r.empresas === 1 ? ' empresa' : ' empresas') + ' y a ' + linN(r.gente) + ' trabajadores');
        linCom(c);
      }, function(x){ env.disabled = false; msg(linMotivo({ motivo:x === 'muy-grande' ? 'muy-grande' : null }, x), true); });
    });
  };
  q('[data-lin-reit]', function(b){ b.onclick = function(){
    confirmar('¿Lo reiteras?', 'A cada empresa que todavía no confirmó le llega un recordatorio a su mural y a «Lo que te pide quien te supervisa». Se puede reiterar una vez cada 6 horas.', { si:'Reiterar' }).then(function(si){
      if(!si) return; b.disabled = true;
      sbRpc('sst_est_reiterar', { p:{ id:b.getAttribute('data-lin-reit') } }).then(function(r){ if(r && r.ok){ LIN.t = 0; toast('Reiterado a ' + linUno(r.empresas, 'empresa', 'empresas')); linCom(c); } else { b.disabled = false; toast(linMotivo(r)); } },
        function(x){ b.disabled = false; toast(linMotivo(null, x)); });
    });
  }; });
  q('[data-lin-ret]', function(b){ b.onclick = function(){
    preguntar('¿Por qué lo retiras?', 'Sale de los murales y de las difusiones de todas las empresas. Lo que ya recibieron y firmaron queda en el registro, con tu motivo.',
      { etiqueta:'Motivo', maximo:300, minimo:5, corto:LIN_MOTIVO.falta_motivo, placeholder:'Ej.: se reemplaza por la versión 3' }, { si:'Retirar', mal:true }).then(function(mot){
      if(!mot) return; b.disabled = true;
      sbRpc('sst_est_retirar', { p:{ id:b.getAttribute('data-lin-ret'), motivo:mot, n:typeof cadYo === 'function' ? cadYo() : null } }).then(function(r){ if(r && r.ok){ LIN.t = 0; toast('Retirado de toda la cadena'); linCom(c); } else { b.disabled = false; toast(linMotivo(r)); } },
        function(x){ b.disabled = false; toast(linMotivo(null, x)); });
    });
  }; });
}

/* ══ 7 · LOS ACCIDENTES DE LA CADENA ═══════════════════════════════════════════════════════════════════════
   Lo que registró cada empresa en su app (también las subcontratas), con el reloj de las 24 horas del aviso al MTPE del
   accidente mortal, si ya se avisó y si ya se investigó. Sin el nombre del trabajador (su nombre con su lesión es dato de
   salud): su puesto y su documento tapado. Del accidente grave se ve lo necesario aunque la empresa comparta solo cifras. */
function linAcc(c){
  var dias = LIN.acc.dias || 90, manda = linManda(), g = linGrado();
  if(typeof _cadAcc === 'function') _cadAcc('');
  c.innerHTML = '<div class="vacio">Cargando los accidentes…</div>';
  Promise.all([linRpc('sst_cad_accidentes', { p:{ emp:linEmp(), dias:dias === 'anio' ? linDiasAnio() : dias } }), linTraer()]).then(function(RR){
    var j = RR[0], D = RR[1] || LIN.d;
    if(!c.isConnected || LIN.cual !== 'acc') return;
    if(!j){ c.innerHTML = typeof arrVacio === 'function' ? arrVacio('No se pudo cargar', 'Revisa tu conexión y vuelve a abrir esta sección.') : ''; return; }
    var R = j.resumen || {}, L = j.lista || [], ahora = Date.parse(j.ahora) || Date.now();
    var seg = '<div class="seg lin-seg" role="tablist" aria-label="Periodo">' + [[30, '30 días'], [90, '90 días'], ['anio', 'Este año']].map(function(x){
      return '<button type="button" role="tab" aria-selected="' + (dias === x[0]) + '" class="' + (dias === x[0] ? 'on' : '') + '" data-lin-d="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var cif = '<div class="rej arr-seis lin-cifras">' + cifra('Mortales', String(R.mortal || 0), R.sin_aviso ? R.sin_aviso + ' sin aviso al MTPE marcado' : (R.mortal ? 'con su aviso marcado' : 'ninguno'), R.mortal ? 'mal' : '') +
      cifra('Incapacitantes', String(R.incap || 0), 'con descanso médico', R.incap ? 'ojo' : '') + cifra('Leves', String(R.leve || 0), 'con atención médica', '') +
      cifra('Pudo ser grave', String(R.potencial || 0), 'incidentes y daños que pudieron ser graves', R.potencial ? 'ojo' : '') +
      cifra('Sin investigar', String(R.sin_investigar || 0), 'incapacitantes y mortales sin causas ni medidas', R.sin_investigar ? 'mal' : '') +
      cifra('Días de descanso', linN(R.dias_perdidos || 0), 'de los incapacitantes y los leves (el mortal se cuenta aparte)', '') + '</div>';
    var nota = '<p class="sub lin-norma">Lo registra cada empresa en su app (registro de accidentes de trabajo, D.S. 005-2012-TR). El accidente mortal y el incidente peligroso se notifican al MTPE dentro de las 24 horas (D.S. 005-2012-TR, art. 110): aquí ves el plazo y si la empresa ya lo marcó. Arriba no sube el nombre del trabajador.</p>';
    if(!L.length){ c.innerHTML = seg + cif + '<div class="tarj"><div class="tarj-cuerpo"><div class="aviso ok arr-sin">Ningún accidente con lesión ni nada que pudo ser grave en este periodo, en ninguna empresa de tus obras.</div>' + nota + '</div></div>'; linAccAtar(c, L, D); return; }
    c.innerHTML = seg + cif + '<div class="tarj"><div class="tarj-cab"><div><h2>Cada accidente</h2><p class="sub">De todas las empresas de tus obras, subcontratas incluidas · primero lo que espera el aviso al MTPE</p></div></div>' +
      '<div class="lin-accs">' + L.map(function(a, k){
        var C = LIN_CLASE[a.clase] || [a.clase, 'gris'], t = Date.parse(a.fecha + 'T' + (a.hora || '00:00') + ':00'), aviso = '', grave = a.clase === 'mortal' || a.clase === 'incap';
        if(a.clase === 'mortal'){
          if(a.mtpe) aviso = linPill('Aviso al MTPE: marcado', 'ok');
          else { var pl = a.plazo ? Date.parse(a.plazo) : t + 86400000, falta = pl - ahora; aviso = linPill(falta > 0 ? 'Aviso al MTPE: vence en ' + linLapso(falta) : 'Aviso al MTPE: venció hace ' + linLapso(falta), 'mal'); }
        }
        var inv = grave ? linPill(a.investigado ? 'Investigación registrada' : 'Sin investigar', a.investigado ? 'ok' : 'mal') : '';
        var puede = manda && g >= 4 && a.enlace1 && (a.via === 'contratista' || a.via === 'subcontrata') && a.nivel <= 2 && typeof arrOrdenNueva === 'function';
        var gs = linGestDe(D, 'acc:' + linSlug(a.id)), reg = (grave || a.potencial) && linHay('est-bit');
        var det = [a.doc ? 'Trabajador ' + a.doc : '', a.puesto, a.lugar, a.parte, (a.dias && a.clase !== 'mortal') ? linUno(a.dias, 'día de descanso', 'días de descanso') : ''].filter(Boolean).join(' · ');
        return '<article class="lin-acc ' + (C[1] === 'mal' ? 'mal' : (a.potencial ? 'ojo' : '')) + '"><div class="lin-acc-cab"><div>' + linPill(C[0], C[1]) + (a.potencial ? ' ' + linPill('Pudo ser grave', 'ojo') : '') +
          ' <b>' + esc(linCorto(a.empresa)) + '</b> <span class="sub">' + esc(linVia(a)) + (a.proyecto ? ' · ' + esc(a.proyecto) : '') + '</span></div>' +
          '<span class="lin-acc-f">' + esc(linFecha(a.fecha) + (a.hora ? ' ' + a.hora : '')) + '</span></div>' +
          (a.descripcion ? '<p class="lin-acc-d">' + esc(a.descripcion) + '</p>' + (det ? '<p class="sub">' + esc(det) + '</p>' : '')
            : '<p class="sub">Detalle reservado: la empresa comparte solo sus cifras con quien la supervisa.' + (a.doc ? ' Trabajador ' + esc(a.doc) + '.' : '') + '</p>') +
          (a.potencial ? '<p class="sub lin-acc-nota">Si es un incidente peligroso, también se notifica al MTPE dentro de las 24 horas.</p>' : '') +
          (gs ? '<p class="lin-acc-gs">' + linEnCurso(gs) + '</p>' : '') +
          '<div class="lin-acc-m">' + [aviso, inv].filter(Boolean).join(' ') + (puede ? '<button type="button" class="bt sec chico" data-lin-ord="' + esc(a.enlace1) + '">Ordenar inspección' + (a.via === 'subcontrata' && a.padre ? ' a ' + esc(linCorto(a.padre)) : '') + '</button>' : '') +
            (reg && !gs ? '<button type="button" class="bt sec chico" data-lin-areg="' + k + '">Registrar lo que hice</button>' : '') + '</div></article>';
      }).join('') + '</div><div class="tarj-cuerpo">' + nota + '</div></div>';
    linAccAtar(c, L, D);
  });
}
function linAccAtar(c, L, D){
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-d]'), function(b){ b.onclick = function(){ var v = b.getAttribute('data-lin-d'); LIN.acc.dias = v === 'anio' ? 'anio' : +v; linAcc(c); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-ord]'), function(b){ b.onclick = function(){ arrOrdenNueva(b.getAttribute('data-lin-ord'), 'accidente'); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-areg]'), function(b){ b.onclick = function(){
    var a = (L || [])[+b.getAttribute('data-lin-areg')]; if(!a) return;
    var C = (D && D.cosas || []).filter(function(x){ return x.clave === 'acc:' + linSlug(a.id); })[0];
    var quien = '<b>' + esc(linCorto(a.empresa)) + '</b>' + (a.via === 'subcontrata' && a.padre ? ' (subcontrata de ' + esc(linCorto(a.padre)) + ')' : '');
    var x = C || { g:a.clase === 'mortal' ? 1 : 2, k:'acc', clave:'acc:' + linSlug(a.id), reg:true, emp:a.empresa, obraN:a.proyecto, t:(LIN_CLASE[a.clase] || [a.clase])[0] + ' en ' + quien, s:'Del ' + linFecha(a.fecha) + (a.hora ? ' ' + a.hora : '') + '.' };
    var o = linObraDe(D, a.empresa); if(o && !x.proy) x.proy = o.id || null;
    linRegistrar(x, D, function(){ linAcc(c); });
  }; });
}

/* ══ 8 · LA BITÁCORA DE GESTIÓN ═════════════════════════════════════════════════════════════════════════════
   Lo que hizo el equipo de la entidad con cada alerta: qué hizo, con qué documento, con qué plazo y cómo se cerró. Cada
   registro y cada cierre, con la hora del servidor y su huella en la cadena de la entidad. Sale en Excel e impreso. */
function linBitRango(){
  var h = new Date(), ini = function(d){ return linISO(new Date(d.getFullYear(), d.getMonth(), 1)); }, fin = function(d){ return linISO(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
  var v = LIN.bit.ver, ant = new Date(h.getFullYear(), h.getMonth() - 1, 1);
  if(v === 'mes') return { desde:ini(h), hasta:linISO(h), n:'este mes' };
  if(v === 'ant') return { desde:ini(ant), hasta:fin(ant), n:'el mes pasado' };
  return { desde:null, hasta:null, n:'los últimos 12 meses' };
}
function linBit(c){
  if(typeof _cadAcc === 'function') _cadAcc('<button type="button" class="bt sec" id="lin-b-xls" disabled>Excel</button><button type="button" class="bt sec lin-solo-ancho" id="lin-b-imp">Imprimir</button>');
  if($('lin-b-imp')) $('lin-b-imp').onclick = function(){ window.print(); };
  c.innerHTML = '<div class="vacio">Cargando la bitácora…</div>';
  var R = linBitRango();
  linRpc('sst_est_gestion_lista', { p:{ emp:linEmp(), desde:R.desde, hasta:R.hasta } }).then(function(j){
    if(!c.isConnected || LIN.cual !== 'bit') return;
    if(!j){ c.innerHTML = typeof arrVacio === 'function' ? arrVacio('No se pudo cargar', 'Revisa tu conexión y vuelve a abrir la bitácora.') : ''; return; }
    var T = j.lista || [], L = LIN.bit.ver === 'abiertas' ? T.filter(function(g){ return g.estado === 'abierta'; }) : T;
    var seg = '<div class="seg lin-seg" role="tablist" aria-label="Qué ver">' + [['mes', 'Este mes'], ['ant', 'Mes pasado'], ['todo', 'Últimos 12 meses'], ['abiertas', 'Abiertas']].map(function(x){
      return '<button type="button" role="tab" aria-selected="' + (LIN.bit.ver === x[0]) + '" class="' + (LIN.bit.ver === x[0] ? 'on' : '') + '" data-lin-bv="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var ab = T.filter(function(g){ return g.estado === 'abierta'; }).length, cer = T.length - ab, ven = T.filter(function(g){ return g.vencida; }).length;
    var cif = '<div class="rej lin-cifras">' + cifra('Registradas', String(T.length), R.n, '') + cifra('En curso', String(ab), ab ? (ab === 1 ? 'espera su cierre' : 'esperan su cierre') : 'nada pendiente', ab ? 'ojo' : 'ok') +
      cifra('Con el plazo vencido', String(ven), ven ? (ven === 1 ? 'sigue abierta después de su plazo' : 'siguen abiertas después de su plazo') : 'ninguna', ven ? 'mal' : '') + cifra('Cerradas', String(cer), 'con cómo se resolvió', '') + '</div>';
    var pie = '<p class="sub lin-pie">Cada registro y cada cierre quedan con la hora del servidor y su huella en la cadena de tu entidad: si alguien los cambia, se nota. Es la constancia de lo que hizo tu equipo con cada alerta.</p>';
    if(!L.length){ c.innerHTML = seg + cif + '<div class="tarj"><div class="tarj-cuerpo lin-com-vacio"><h2>' + (LIN.bit.ver === 'abiertas' ? 'Nada en curso' : 'Todavía no hay registros en ' + esc(R.n)) + '</h2><p>En la mesa de control, cada alerta tiene «Registrar lo que hice»: el asiento del cuaderno de obra, la carta, el informe o la orden, con su número y su plazo. Aquí queda todo, en orden.</p>' + pie + '</div></div>'; linBitAtar(c, L); return; }
    c.innerHTML = seg + cif + '<div class="tarj"><div class="tabla-caja"><table class="arr-t lin-tabla-cel lin-bit"><thead><tr><th>Fecha</th><th>Alerta</th><th>Qué se hizo</th><th>Plazo</th><th>Estado</th><th></th></tr></thead><tbody>' +
      L.map(function(g, k){
        return '<tr><td data-et="Fecha">' + esc(linHora(g.creado)) + (g.por ? '<small class="arr-sub">' + esc(g.por) + '</small>' : '') + '</td>' +
          '<td data-et="Alerta"><b>' + esc(g.titulo) + '</b>' + (g.empresa || g.proyecto ? '<small class="arr-sub">' + esc([g.empresa, g.proyecto].filter(Boolean).join(' · ')) + '</small>' : '') + '</td>' +
          '<td data-et="Qué se hizo">' + esc(LIN_QUE[g.que] || g.que) + (g.documento ? ' · <b>' + esc(g.documento) + '</b>' : '') + (g.detalle ? '<small class="arr-sub">' + esc(g.detalle) + '</small>' : '') + '</td>' +
          '<td data-et="Plazo">' + (g.plazo ? '<span class="' + (g.vencida ? 'lin-nota-mal' : '') + '">' + esc(linFecha(g.plazo)) + '</span>' : '—') + '</td>' +
          '<td data-et="Estado">' + (g.estado === 'cerrada' ? linPill('Cerrada', 'ok') + '<small class="arr-sub">' + esc((g.cerrado ? linHora(g.cerrado) + ' · ' : '') + (g.cerrado_por ? g.cerrado_por + ': ' : '') + (g.cierre || '')) + '</small>'
            : linPill(g.vencida ? 'Plazo vencido' : 'En curso', g.vencida ? 'mal' : 'ojo')) + '</td>' +
          '<td class="arr-acc">' + (g.estado === 'abierta' ? '<button type="button" class="bt sec chico" data-lin-bc="' + k + '">Cerrar</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div><div class="tarj-cuerpo">' + pie + '</div></div>';
    linBitAtar(c, L, R);
  });
}
function linBitAtar(c, L, R){
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-bv]'), function(b){ b.onclick = function(){ LIN.bit.ver = b.getAttribute('data-lin-bv'); linBit(c); }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-lin-bc]'), function(b){ b.onclick = function(){
    var g = L[+b.getAttribute('data-lin-bc')]; if(!g) return;
    preguntar('¿Cómo se resolvió?', '«' + g.titulo + '». Queda en la bitácora con la hora del servidor.', { etiqueta:'Cómo se resolvió', maximo:400, minimo:3, corto:LIN_MOTIVO.cierre, placeholder:'Ej.: acreditaron el SCTR de los 3 trabajadores.' }, { si:'Cerrar' }).then(function(t){
      if(!t) return; b.disabled = true;
      sbRpc('sst_est_gestion_cerrar', { p:{ id:g.id, cierre:t, n:typeof cadYo === 'function' ? cadYo() : null } }).then(function(r){
        if(r && r.ok){ toast('Cerrada en la bitácora'); linGestSumar(r.gestion); linBit(c); } else { b.disabled = false; toast(linMotivo(r)); }
      }, function(e){ b.disabled = false; toast(linMotivo(null, e)); });
    });
  }; });
  var bx = $('lin-b-xls'); if(bx){ bx.disabled = !(L && L.length); bx.onclick = function(){ linBitXls(L, R); }; }
}
function linBitXls(L, R){
  var hacer = function(){
    if(typeof _cumXls !== 'function' || typeof bajarBlob !== 'function'){ toast('No se pudo armar el Excel: recarga la página.'); return; }
    _cumConXls(function(){
      var cols = [{ t:'Fecha y hora', w:16, al:'center' }, { t:'Quién', w:20 }, { t:'Alerta', w:46 }, { t:'Empresa', w:28 }, { t:'Obra', w:22 }, { t:'Qué se hizo', w:24 }, { t:'Documento', w:22 },
        { t:'Detalle', w:40 }, { t:'Plazo', w:12, al:'center' }, { t:'Estado', w:13, al:'center' }, { t:'Cierre', w:40 }, { t:'Cerrado', w:16, al:'center' }, { t:'Sello', w:20 }];
      var filas = L.map(function(g){
        return [linHora(g.creado), g.por || '', { v:g.titulo, b:1 }, g.empresa || '', g.proyecto || '', LIN_QUE[g.que] || g.que, g.documento || '', g.detalle || '', g.plazo ? linFecha(g.plazo) : '',
          g.estado === 'cerrada' ? { v:'Cerrada', st:'ok' } : (g.vencida ? { v:'Plazo vencido', st:'mal' } : { v:'En curso', st:'ojo' }), g.cierre || '', g.cerrado ? linHora(g.cerrado) : '', String(g.sello || '').slice(0, 16)];
      });
      var tit = 'Bitácora de gestión · ' + linEnt();
      bajarBlob(_cumXls([{ n:'Bitácora', tit:tit, sub:'Lo que hizo el equipo de la entidad con cada alerta · ' + (R ? R.n : '') + ' · cada registro con la hora del servidor y su huella en la cadena de la entidad', cols:cols, filas:filas, fijas:0 }], tit),
        (typeof _cumArchivo === 'function' ? _cumArchivo(tit + ' ' + linISO(new Date())) : 'bitacora') + '.xlsx');
    });
  };
  if(typeof cargarCumple === 'function') cargarCumple().then(hacer, function(){ toast('No se pudo armar el Excel: revisa tu conexión.'); }); else hacer();
}

/* ══ 9 · LOS ESTILOS ═══════════════════════════════════════════════════════════════════════════════════════ */
function _linCss(){
  if($('lin-css')) return;
  var st = document.createElement('style'); st.id = 'lin-css';
  st.textContent =
    '.lin-estado{border:1px solid var(--raya);border-radius:14px;background:var(--panel);padding:18px 20px;margin:0 0 16px;display:grid;gap:12px;box-shadow:var(--sombra)}' +
    '.lin-estado.mal{border-color:#efc2c5}.lin-estado.mal .lin-estado-ic{background:var(--mal)}' +
    '.lin-estado.ojo .lin-estado-ic{background:var(--ojo)}.lin-estado.ok .lin-estado-ic{background:var(--ok)}' +
    '.lin-estado-cab{display:flex;gap:14px;align-items:flex-start}.lin-estado-cab h2{font-size:19px}' +
    '.lin-estado-ic{flex:none;width:34px;height:34px;border-radius:50%;color:#fff;display:grid;place-items:center;font-weight:700;font-size:17px}' +
    '.lin-cosas{list-style:none;margin:0;padding:0;display:grid;gap:8px}.lin-cosas li{display:grid;grid-template-columns:6px 1fr auto;gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--raya);border-radius:10px;background:var(--fondo)}' +
    '.lin-cosas .lin-g{align-self:stretch;border-radius:3px;background:var(--gris2)}.lin-cosas .g1 .lin-g{background:var(--mal)}.lin-cosas .g2 .lin-g{background:var(--ojo)}.lin-cosas .g3 .lin-g{background:var(--azul)}' +
    '.lin-cosas li.curso{background:var(--panel)}.lin-cosas li.curso .lin-g{opacity:.45}' +
    '.lin-cosa-t{display:grid;gap:2px;min-width:0}.lin-cosa-h{font-weight:500;color:var(--texto)}.lin-cosa-t small{color:var(--gris);font-size:12.5px;line-height:1.4}' +
    '.lin-cosa-b{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}' +
    '.lin-curso{display:block;margin-top:4px;font-size:12.5px;color:var(--ok);line-height:1.4}.lin-curso b{font-weight:600}.lin-curso.ven{color:var(--mal)}' +
    '.lin-mas{justify-self:start;background:none;border:0;color:var(--azul);font:inherit;font-size:13.5px;cursor:pointer;padding:4px 0}.lin-mas:hover{text-decoration:underline}' +
    '.lin-cifras{margin-bottom:16px}.lin-pie{padding:10px 18px 16px;margin:0}' +
    '.lin-brillo{outline:3px solid var(--ojo);outline-offset:2px;transition:outline-color .6s}' +
    '.lin-obras{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;padding:0 18px 18px}.lin-obras.dos{grid-template-columns:repeat(2,minmax(0,1fr))}' +
    '.lin-obra-b>span{min-width:0;overflow-wrap:anywhere}.lin-obra-x .pill,.lin-nodo-m .pill{white-space:normal;text-align:left}.lin-obra-b{width:100%;height:100%;text-align:left;display:grid;align-content:start;gap:8px;padding:14px 14px 12px;border:1px solid var(--raya);border-left:4px solid var(--ok);border-radius:12px;background:var(--panel);cursor:pointer;font:inherit;color:inherit}' +
    '.lin-obra.ojo .lin-obra-b{border-left-color:var(--ojo)}.lin-obra.mal .lin-obra-b{border-left-color:var(--mal)}.lin-obra-b:hover{background:var(--fondo)}' +
    '.lin-obra-n{font-weight:600;color:var(--tinta);font-size:15px}.lin-obra-r{font-size:12.5px;color:var(--gris)}.lin-obra-k{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:var(--gris)}.lin-obra-k b{color:var(--texto)}' +
    '.lin-obra-x{display:flex;flex-wrap:wrap;gap:6px}.lin-obra-p{font-size:12.5px;color:var(--gris)}.lin-obra-p b{color:var(--texto);font-weight:600}' +
    '.lin-nota-ok{color:var(--ok)}.lin-nota-ojo{color:var(--ojo)}.lin-nota-mal{color:var(--mal)}' +
    '.lin-bar{display:inline-block;vertical-align:middle;width:84px;height:8px;border-radius:4px;background:var(--fondo);border:1px solid var(--raya);overflow:hidden;margin-right:8px}.lin-bar i{display:block;height:100%;background:var(--gris2)}' +
    '.lin-bar.ojo i{background:var(--ojo)}.lin-bar.mal i{background:var(--mal)}.lin-bar-n{font-variant-numeric:tabular-nums}' +
    '.lin-botones{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;padding:0 18px 18px}' +
    '.lin-boton{display:grid;gap:3px;text-align:left;padding:12px 14px;border:1px solid var(--raya);border-radius:10px;background:var(--panel);cursor:pointer;font:inherit;color:var(--texto)}.lin-boton:hover{border-color:var(--raya2);background:var(--fondo)}' +
    '.lin-boton b{color:var(--tinta);font-weight:600}.lin-boton small{color:var(--gris);font-size:12.5px;line-height:1.4}' +
    '.lin-wa{width:100%;font:13px/1.5 var(--mono);padding:10px;border:1px solid var(--raya2);border-radius:8px;background:var(--fondo);color:var(--texto);resize:vertical}' +
    '.lin-seg{margin:0 0 14px;flex-wrap:wrap}' +
    '.lin-arbol-caja{overflow-x:auto;padding:4px 18px 22px}.lin-arbol{min-width:max-content}' +
    '.lin-arbol ul{display:flex;justify-content:center;padding:22px 0 0;margin:0;position:relative;list-style:none}' +
    '.lin-arbol li{display:flex;flex-direction:column;align-items:center;position:relative;padding:22px 6px 0}' +
    '.lin-arbol li::before,.lin-arbol li::after{content:"";position:absolute;top:0;width:50%;height:22px;border-top:1.5px solid var(--raya2)}.lin-arbol li::before{right:50%}.lin-arbol li::after{left:50%;border-left:1.5px solid var(--raya2)}' +
    '.lin-arbol li:only-child::before,.lin-arbol li:only-child::after{display:none}.lin-arbol li:only-child{padding-top:0}' +
    '.lin-arbol li:first-child::before,.lin-arbol li:last-child::after{border:0 none}.lin-arbol li:last-child::before{border-right:1.5px solid var(--raya2);border-radius:0 6px 0 0}.lin-arbol li:first-child::after{border-radius:6px 0 0 0}' +
    '.lin-arbol ul ul::before{content:"";position:absolute;top:0;left:50%;border-left:1.5px solid var(--raya2);height:22px}' +
    '.lin-arbol>ul{padding-top:0}.lin-arbol>ul>li{padding-top:0}.lin-arbol>ul>li::before,.lin-arbol>ul>li::after{display:none}' +
    /* el árbol en lista (más de 4 ramas, o el celular): de arriba abajo, con sangría */
    '.lin-arbol.lista{min-width:0;max-width:760px}.lin-arbol.lista ul{flex-direction:column;align-items:stretch;padding:10px 0 0 22px}.lin-arbol.lista>ul{padding-left:0}' +
    '.lin-arbol.lista li{align-items:stretch;padding:10px 0 0}.lin-arbol.lista li::before,.lin-arbol.lista li::after,.lin-arbol.lista ul ul::before{display:none}' +
    '.lin-arbol.lista ul ul{border-left:1.5px solid var(--raya2);margin-left:8px}.lin-arbol.lista .lin-nodo{max-width:none}' +
    '.lin-nodo{display:grid;gap:3px;min-width:160px;max-width:210px;text-align:left;padding:10px 12px 10px 14px;border:1px solid var(--raya);border-radius:10px;background:var(--panel);font:inherit;color:inherit;position:relative;cursor:pointer;box-shadow:var(--sombra)}' +
    '.lin-nodo:hover{border-color:var(--raya2)}.lin-nodo.raiz{background:var(--tinta);border-color:var(--tinta);cursor:default;color:#fff}.lin-nodo.raiz .lin-nodo-n{color:#fff}.lin-nodo.raiz .lin-nodo-p,.lin-nodo.raiz .lin-nodo-k{color:#c9d6de}' +
    '.lin-sem{position:absolute;left:0;top:10px;bottom:10px;width:4px;border-radius:0 3px 3px 0;background:var(--ok)}.lin-nodo.ojo .lin-sem{background:var(--ojo)}.lin-nodo.mal .lin-sem{background:var(--mal)}' +
    '.lin-nodo-p{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--gris)}.lin-nodo-n{font-weight:600;color:var(--tinta);line-height:1.3}' +
    '.lin-nodo-k{display:flex;flex-wrap:wrap;gap:2px 10px;font-size:12px;color:var(--gris)}.lin-nodo-k b{color:var(--texto)}.lin-nodo-m{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}.lin-nodo-m .pill{font-size:11px}' +
    '.lin-leyenda{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;font-size:13px;color:var(--gris);margin:-4px 2px 18px}.lin-leyenda span{display:inline-flex;align-items:center;gap:6px}' +
    '.lin-leyenda .lin-sem{position:static;display:inline-block;width:10px;height:10px;border-radius:50%}.lin-leyenda .lin-sem.ojo{background:var(--ojo)}.lin-leyenda .lin-sem.mal{background:var(--mal)}.lin-leyenda .sub{flex-basis:100%}' +
    '.lin-ficha{display:grid;gap:0}.lin-f{display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-bottom:1px solid var(--raya);font-size:14px}.lin-f span{color:var(--gris)}.lin-f b{font-weight:500;text-align:right}' +
    '.lin-nota{margin-top:12px}' +
    '.lin-reg-de{display:grid;gap:2px;margin:0 0 12px;padding:10px 12px;border-radius:8px;background:var(--fondo)}.lin-reg-de small{color:var(--gris)}' +
    '.lin-asi{margin:4px 0 8px;border:1px solid var(--raya);border-radius:8px;padding:8px 10px;background:var(--fondo)}.lin-asi summary{cursor:pointer;font-weight:500;color:var(--tinta)}' +
    '.lin-asi textarea{width:100%;margin:8px 0;font:13px/1.5 inherit;padding:8px;border:1px solid var(--raya2);border-radius:6px;background:var(--panel);color:var(--texto);resize:vertical}' +
    '.lin-com-f .tarj-cuerpo{display:grid;gap:12px}.lin-com-que{margin:-4px 0 0}.lin-modelos{display:flex;flex-wrap:wrap;gap:6px;align-items:center}' +
    '.lin-fila{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end}.lin-fila .campo{flex:1;min-width:160px}.lin-hasta{max-width:220px}.lin-arch{cursor:pointer}' +
    '.lin-alcance{margin:0;padding:10px 12px;border-radius:8px;background:var(--azul-f);color:var(--texto);font-size:14px}.lin-env{align-items:center}' +
    '.lin-com{padding:14px 18px;border-top:1px solid var(--raya);display:grid;gap:10px}.lin-com.ret{opacity:.75}.lin-com-cab{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}' +
    '.lin-com-t{display:block;color:var(--tinta);font-size:15px;margin-bottom:4px}.lin-com-s{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.lin-com-acc{display:flex;gap:6px;align-items:flex-start}' +
    '.lin-com-x{margin:0;color:var(--texto);white-space:pre-line;max-width:80ch}.lin-com-base,.lin-com-ret{margin:0}.lin-com-vacio{display:grid;gap:10px;max-width:760px}' +
    '.lin-com-pie{display:flex;flex-wrap:wrap;gap:10px;align-items:center}' +
    '.lin-barras{display:grid;gap:6px;max-width:680px}.lin-barra{display:grid;grid-template-columns:200px 1fr auto;gap:10px;align-items:center;font-size:13px;color:var(--gris)}' +
    '.lin-barra i{display:block;height:8px;border-radius:4px;background:var(--fondo);border:1px solid var(--raya);overflow:hidden}.lin-barra em{display:block;height:100%;background:var(--ok)}.lin-barra b{color:var(--texto);font-weight:500;font-variant-numeric:tabular-nums}' +
    '.lin-acuse .lin-sub td:first-child{padding-left:26px}.lin-rama{color:var(--gris2);margin-right:6px}' +
    '.lin-accs{display:grid}.lin-acc{padding:14px 18px;border-top:1px solid var(--raya);display:grid;gap:6px;border-left:4px solid transparent}.lin-acc.mal{border-left-color:var(--mal)}.lin-acc.ojo{border-left-color:var(--ojo)}' +
    '.lin-acc-cab{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.lin-acc-cab>div{flex:1;min-width:240px}.lin-acc-f{font-variant-numeric:tabular-nums;color:var(--gris);font-size:13px;white-space:nowrap}' +
    '.lin-acc-d{margin:0}.lin-acc-m{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.lin-acc-nota,.lin-acc-gs{margin:0}' +
    '.lin-norma{max-width:860px}.lin-bit td{vertical-align:top}.lin-req-t td{vertical-align:top}.lin-req-acc{white-space:nowrap}.lin-req-mas{margin:6px 18px 0}' +
    '@media (max-width:700px){.lin-cosas li{grid-template-columns:6px 1fr}.lin-cosa-b{grid-column:2;justify-content:flex-start}.lin-barra{grid-template-columns:1fr auto}.lin-barra i{grid-column:1 / -1;grid-row:2}' +
    '  .lin-arbol ul{flex-direction:column;align-items:stretch;padding:10px 0 0 18px}.lin-arbol li{align-items:stretch;padding:10px 0 0}.lin-arbol li::before,.lin-arbol li::after,.lin-arbol ul ul::before{display:none}' +
    '  .lin-arbol{min-width:0}.lin-nodo{max-width:none}.lin-arbol ul ul{border-left:1.5px solid var(--raya2);margin-left:6px}.lin-obras.dos{grid-template-columns:1fr}' +
    '  .lin-tabla-cel thead{display:none}.lin-tabla-cel,.lin-tabla-cel tbody,.lin-tabla-cel tr,.lin-tabla-cel td{display:block;width:auto}.lin-tabla-cel tr{padding:10px 12px;border-bottom:1px solid var(--raya)}' +
    '  .lin-tabla-cel td{border:0;padding:3px 0;text-align:left}.lin-tabla-cel td[data-et]::before{content:attr(data-et) ": ";color:var(--gris);font-size:12px}.lin-tabla-cel td[data-et="Empresa"]::before,.lin-tabla-cel td[data-et="Alerta"]::before{content:none}' +
    '  .lin-tabla-cel td.num{text-align:left}.lin-solo-ancho{display:none!important}}' +
    '@media print{.lin-botones,.lin-mas,.lin-reg,.lin-cosa-b,[data-lin-pide],[data-lin-reit],[data-lin-bc]{display:none!important}.lin-cosas-mas{display:grid!important}}';
  document.head.appendChild(st);
}
