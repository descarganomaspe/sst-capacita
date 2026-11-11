/* ══ 4/11/2026 · V7.9c · PENDIENTES POR ÁREA (revisión de Gemini, documentos 1, 2 y 3) ══════════════════════════════════
   Lo que le toca hacer o entregar a cada área de la empresa, con su plazo: quién lo vio y quién lo cerró, con su nota.
   · Quien tiene un área (la pone el dueño —o el de la obra madre— en «Obras y equipo») ve los de su vista: gerencia y legal juntos,
     producción y mantenimiento, logística y almacén, administración y RRHH, y salud. SST y calidad, y quien no tiene área,
     ven todos y mandan pedidos: como hoy, nadie pierde nada.
   · Fase 1, a mano: «＋ Nuevo pedido», y desde la carpeta de auditoría («Pedir» deja el pendiente además de copiar el
     mensaje; la evidencia que se sube lo cierra).
   · Fase 2, lo que falta en la obra: «Buscar pendientes en la obra» arma la lista —químicos sin hoja MSDS → Logística;
     equipos fuera de servicio o con observación, y extintores con la recarga vencida o por vencer (V7.9h) → Mantenimiento; los que no tienen su revisión del mes → Producción; EMO
     vencidos o por vencer → Salud; gente sin SCTR o sin Vida Ley vigentes, o la constancia por vencer → Administración— y se elige qué
     mandar. Lo que ya está pedido y abierto no se repite (el servidor lo reconoce por su referencia).
   · El servidor: sst_area_pend, con sst_area_pend_crear, _varios, _visto y _cerrar (sql/2026-11-04-v79-areas-pendientes.sql;
     «sst_aviso» es la cola de los avisos al celular y «sst_pendiente», la lista de la app: no se tocan). Nadie escribe
     directo en la tabla. Los informes médicos no pasan por aquí: el pendiente de un EMO dice solo el nombre y la fecha
     del próximo examen.
   Las pruebas: pruebas/v79c.js (todo inventado). */
var PENW={ obra:null, caja:null, n:0, L:null, filtro:'abiertos', vista:'', cand:null, sel:{} };
var PEN_TIPOS={ auditoria:['🗂️', 'Carpeta de auditoría'], quimico:['🧪', 'Productos químicos'], emo:['🩺', 'Salud (EMO)'], sctr:['🛡️', 'SCTR y Vida Ley'],
                equipo:['🏷️', 'Equipos y herramientas'], capacitacion:['🎓', 'Capacitación'], otro:['📌', 'Pedido'] };
/* de dónde viene cada pendiente: la sección donde se resuelve */
var PEN_IR={ auditoria:'aud', quimico:'quimicos', emo:'emo', sctr:'sctr', equipo:'equipos' };
var PEN_FILTROS=[['abiertos', 'Abiertos'], ['vencidos', 'Vencidos'], ['cerrados', 'Cerrados']];

function _penF(iso){ var s=String(iso||'').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.slice(8, 10)+'/'+s.slice(5, 7)+'/'+s.slice(0, 4) : ''; }
function _penFH(ts){
  var d=ts ? new Date(ts) : null; if(!d || isNaN(d)) return '';
  var z=function(n){ return (n<10 ? '0' : '')+n; };
  return z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear()+' '+z(d.getHours())+':'+z(d.getMinutes());
}
function _penDiaDe(ts){ var d=ts ? new Date(ts) : null; if(!d || isNaN(d)) return ''; var z=function(n){ return (n<10 ? '0' : '')+n; }; return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); }
function _penDias(iso){
  var a=Date.parse(String(iso||'').slice(0, 10)+'T00:00:00Z'), b=Date.parse(hoyISO()+'T00:00:00Z');
  return (isNaN(a) || isNaN(b)) ? null : Math.round((a-b)/86400000);
}
function _penMas(n){ var d=new Date(); d.setDate(d.getDate()+n); var z=function(x){ return (x<10 ? '0' : '')+x; }; return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); }
function _penUid(){ return String((TOK && TOK.uid) || ''); }
function _penCorta(s, n){ s=String(s==null ? '' : s).replace(/\s+/g, ' ').trim(); n=n||140; return s.length>n ? s.slice(0, n-1)+'…' : s; }
function _penN(n, uno, varios){ return n+' '+(n===1 ? uno : varios); }
function _penVistoPor(a){ var v=(a && a.visto && typeof a.visto==='object') ? a.visto : {}; return Object.keys(v); }
function _penLoVi(a){ return _penVistoPor(a).indexOf(_penUid())>-1; }
function _penVencido(a){ return !a.cerrado && a.hasta && String(a.hasta).slice(0, 10)<hoyISO(); }
/* lo cierra su vista o el jefe (como el servidor) */
function _penPuedeCerrar(a){ return !a.cerrado && (areaJefe() || (AREAW.grupo && areaGrupoDe(a.area)===AREAW.grupo)); }
function _penPlazo(a){
  if(!a.hasta) return '';
  var d=_penDias(a.hasta), f=_penF(a.hasta);
  if(a.cerrado || d===null) return 'Para el '+f;
  if(d<0) return 'Venció el '+f+(d===-1 ? ' (hace 1 día)' : ' (hace '+(-d)+' días)');
  if(d===0) return 'Para hoy, '+f;
  return 'Para el '+f+(d===1 ? ' (mañana)' : ' (faltan '+d+' días)');
}

/* ── lo que hay: los abiertos (hasta 500, el tope del servidor) y los cerrados de los últimos 90 días ──────────────── */
function penTraer(){
  var oid=(YO.obra||{}).id, desde=new Date(Date.now()-90*86400000).toISOString();
  return Promise.all([
    traer('sst_area_pend', '&cerrado=is.null&order=creado.desc', 500),
    traer('sst_area_pend', '&cerrado=gte.'+encodeURIComponent(desde)+'&order=cerrado.desc', 300).catch(function(){ return []; })
  ]).then(function(r){
    if((YO.obra||{}).id!==oid) return PENW.L;
    var vistos={}, L=[];
    (r[0]||[]).concat(r[1]||[]).forEach(function(a){ if(a && a.id && !vistos[a.id]){ vistos[a.id]=1; L.push(a); } });
    PENW.L=L;
    AREAW.abiertos=L.filter(function(a){ return !a.cerrado; }).length;
    return L;
  });
}

/* ── la sección ─────────────────────────────────────────────────────────────────────────────────────────────────── */
function vistaPend(caja){
  _penCss();
  var oid=(YO.obra||{}).id;
  if(PENW.obra!==oid){ PENW.obra=oid; PENW.L=null; PENW.vista=''; PENW.filtro='abiertos'; }
  PENW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(!areaActiva()){
    caja.innerHTML='<div class="vacio"><b>Esta parte necesita la actualización del servidor</b>Cuando esté, cada área de la empresa tendrá aquí lo que le toca.</div>';
    return;
  }
  if(ac && areaJefe()){
    ac.innerHTML='<button type="button" class="bt sec" id="pen-buscar">🔎 Buscar pendientes en la obra</button><button type="button" class="bt" id="pen-nuevo">＋ Nuevo pedido</button>';
    $('pen-buscar').onclick=penBuscar; $('pen-nuevo').onclick=function(){ penNuevo(); };
  }
  function pinta(silencio){
    var n=++PENW.n;
    penTraer().then(function(){ if(n!==PENW.n || VISTA.actual!=='avisos') return; penPintar(); try{ pintarRail(true); }catch(_r){} },
                    function(e){ if(n!==PENW.n || VISTA.actual!=='avisos') return; if(!silencio) fallo(caja, e); });
  }
  VISTA.recargar=pinta; pinta();
}
function _penDeVista(L){ return PENW.vista ? L.filter(function(a){ return areaGrupoDe(a.area)===PENW.vista; }) : L; }
function penPintar(){
  var caja=PENW.caja; if(!caja || !document.body.contains(caja)) return;
  var T=PENW.L||[], jefe=areaJefe(), G=areaGrupoPropio();
  var L=_penDeVista(T), ab=L.filter(function(a){ return !a.cerrado; }), ve=ab.filter(_penVencido), ce=L.filter(function(a){ return !!a.cerrado; });
  var h='';
  if(G) h+='<p class="pen-intro">Lo que le toca a <b>'+esc(G.n)+'</b>: ábrelo, hazlo y ciérralo con una nota. Quien lo pidió lo ve cerrado.</p>';
  else if(jefe) h+='<p class="pen-intro">Lo que le toca a cada área de la obra, con su plazo. Cada área ve los suyos; tú, todos. Los pedidos salen de aquí, de la carpeta de auditoría («Pedir») y de «Buscar pendientes en la obra».'+
    (AREAW.asigna ? ' El área de cada persona se pone en <button type="button" class="enlace" id="pen-ir-equipo">Obras y equipo</button>.' : '')+'</p>';
  else h+='<p class="pen-intro">Lo que le toca a tu área en esta obra.</p>';
  h+='<div class="rej pen-cifras">'+cifra('Abiertos', ab.length, '', '')+cifra('Vencidos', ve.length, 'pasó su fecha', ve.length ? 'mal' : '')+cifra('Cerrados', ce.length, 'en los últimos 90 días', '')+'</div>';
  h+='<div class="pen-filtros"><div class="seg" id="pen-filtro" role="tablist" aria-label="Qué pendientes ver">'+PEN_FILTROS.map(function(f){
      var n=f[0]==='abiertos' ? ab.length : (f[0]==='vencidos' ? ve.length : ce.length), on=(PENW.filtro===f[0]);
      return '<button type="button" role="tab" data-f="'+f[0]+'" class="'+(on ? 'on' : '')+'" aria-selected="'+(on ? 'true' : 'false')+'">'+esc(f[1])+' ('+n+')</button>';
    }).join('')+'</div>';
  if(jefe){
    h+='<label class="pen-vista">Área <select id="pen-vista"><option value="">Todas</option>'+AREA_GRUPOS.filter(function(G2){ return G2.k!=='sst'; }).concat(AREA_GRUPOS.filter(function(G2){ return G2.k==='sst'; })).map(function(G2){
      var n=T.filter(function(a){ return !a.cerrado && areaGrupoDe(a.area)===G2.k; }).length;
      return '<option value="'+G2.k+'"'+(PENW.vista===G2.k ? ' selected' : '')+'>'+esc(G2.n)+(n ? ' ('+n+')' : '')+'</option>';
    }).join('')+'</select></label>';
  }
  h+='</div>';
  var V=PENW.filtro==='cerrados' ? ce : (PENW.filtro==='vencidos' ? ve : ab);
  if(PENW.filtro==='cerrados') V=V.slice().sort(function(x, y){ return String(y.cerrado).localeCompare(String(x.cerrado)); });
  else V=V.slice().sort(function(x, y){
    var hx=x.hasta ? String(x.hasta).slice(0, 10) : '9999', hy=y.hasta ? String(y.hasta).slice(0, 10) : '9999';
    return hx.localeCompare(hy) || String(y.creado||'').localeCompare(String(x.creado||''));
  });
  if(!V.length){
    var vac=PENW.filtro==='cerrados' ? ['Nada cerrado', 'En los últimos 90 días no se cerró ningún pendiente.'] :
            (PENW.filtro==='vencidos' ? ['Nada vencido', 'Ningún pendiente pasó su fecha.'] :
             (jefe ? ['Nada pendiente', 'Manda un pedido con «＋ Nuevo pedido» o mira lo que falta en la obra con «🔎 Buscar pendientes en la obra».'] : ['Nada pendiente', 'Cuando te pidan algo, aparece aquí.']));
    h+='<div class="vacio" id="pen-vacio"><b>'+esc(vac[0])+'</b>'+esc(vac[1])+'</div>';
  } else h+='<div class="pen-lista" id="pen-lista">'+V.map(_penFila).join('')+'</div>';
  caja.innerHTML=h;
  var ie=$('pen-ir-equipo'); if(ie) ie.onclick=function(){ navegar('equipo'); };
  $('pen-filtro').onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-f]') : null; if(!b) return;
    PENW.filtro=b.getAttribute('data-f'); penPintar();
  };
  var sv=$('pen-vista'); if(sv) sv.onchange=function(){ PENW.vista=sv.value; penPintar(); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-pen-ver]'), function(b){ b.onclick=function(){ penAbrir(b.getAttribute('data-pen-ver')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-pen-cerrar]'), function(b){ b.onclick=function(){ penCerrar(b.getAttribute('data-pen-cerrar'), b); }; });
}
function _penFila(a){
  var t=PEN_TIPOS[a.tipo] || PEN_TIPOS.otro, venc=_penVencido(a), nuevo=!a.cerrado && !_penLoVi(a) && !areaJefe();
  var vis=_penVistoPor(a).length, pz=_penPlazo(a);
  var pie=[];
  if(a.cerrado) pie.push('Cerrado el '+_penF(_penDiaDe(a.cerrado))+(a.nota_cierre ? ': «'+_penCorta(a.nota_cierre, 160)+'»' : ''));
  else { if(pz) pie.push(pz); pie.push('Pedido el '+_penF(_penDiaDe(a.creado))); pie.push(vis ? 'Visto por '+_penN(vis, 'persona', 'personas') : 'Nadie lo vio todavía'); }
  return '<div class="pen-r'+(venc ? ' venc' : '')+(a.cerrado ? ' cerrado' : '')+'" data-id="'+esc(a.id)+'">'+
    '<div class="pen-r-cab"><span class="pill '+(a.cerrado ? 'gris' : 'azul')+'">'+esc(areaN(a.area)||a.area)+'</span><span class="pen-tipo" title="'+esc(t[1])+'">'+t[0]+' '+esc(t[1])+'</span>'+
      (nuevo ? '<span class="pill ojo">nuevo</span>' : '')+(venc ? '<span class="pill mal">vencido</span>' : '')+'</div>'+
    '<b class="pen-t">'+esc(a.titulo)+'</b>'+(a.cuerpo ? '<p class="pen-d">'+esc(_penCorta(a.cuerpo, 220))+'</p>' : '')+
    '<div class="pen-pie">'+pie.map(esc).join(' · ')+'</div>'+
    '<div class="pen-acc"><button type="button" class="bt sec chico" data-pen-ver="'+esc(a.id)+'">Ver</button>'+
      (_penPuedeCerrar(a) ? '<button type="button" class="bt chico" data-pen-cerrar="'+esc(a.id)+'">✓ Cerrar</button>' : '')+'</div></div>';
}
function _penPorId(id){ return (PENW.L||[]).filter(function(a){ return String(a.id)===String(id); })[0] || null; }

/* ── ver uno: el detalle; quien lo abre queda como que lo vio ───────────────────────────────────────────────────────── */
function penAbrir(id){
  var a=_penPorId(id); if(!a) return;
  var t=PEN_TIPOS[a.tipo] || PEN_TIPOS.otro, ir=PEN_IR[a.tipo], vis=_penVistoPor(a);
  var ultimo=vis.map(function(u){ return a.visto[u]; }).sort().pop();
  var h='<dl class="pen-dl"><dt>Área</dt><dd>'+esc(areaN(a.area)||a.area)+' <span class="tenue">· '+esc((areaGrupoInfo(areaGrupoDe(a.area))||{}).n||'')+'</span></dd>'+
    '<dt>De dónde viene</dt><dd>'+t[0]+' '+esc(t[1])+'</dd>'+
    (a.hasta ? '<dt>Para cuándo</dt><dd>'+esc(_penPlazo(a))+'</dd>' : '')+
    '<dt>Pedido</dt><dd>'+esc(_penFH(a.creado))+'</dd>'+
    '<dt>Lo vieron</dt><dd>'+(vis.length ? esc(_penN(vis.length, 'persona', 'personas'))+(ultimo ? ' · la última vez, el '+esc(_penFH(ultimo)) : '') : 'Nadie todavía')+'</dd>'+
    (a.cerrado ? '<dt>Cerrado</dt><dd>'+esc(_penFH(a.cerrado))+(a.nota_cierre ? '<br>«'+esc(a.nota_cierre)+'»' : '')+'</dd>' : '')+'</dl>'+
    (a.cuerpo ? '<div class="pen-cuerpo">'+esc(a.cuerpo).replace(/\n/g, '<br>')+'</div>' : '');
  var pie='<button type="button" class="bt sec" id="pen-h-no">Cerrar la ventana</button>'+
    '<button type="button" class="bt sec" id="pen-h-copiar">📋 Copiar el mensaje</button>'+
    (ir && vistasDe().some(function(v){ return v.id===ir; }) ? '<button type="button" class="bt sec" id="pen-h-ir">Ir a '+esc(t[1])+'</button>' : '')+
    (_penPuedeCerrar(a) ? '<button type="button" class="bt" id="pen-h-cerrar">✓ Cerrar el pendiente</button>' : '');
  abrirHoja(a.titulo, areaN(a.area)+(a.cerrado ? ' · cerrado' : ''), h, pie, { sinFoco:true, id:a.id, tabla:'sst_area_pend' });
  $('pen-h-no').onclick=cerrarHoja;
  $('pen-h-copiar').onclick=function(){ _penCopiar(penTexto(a)); };
  var bi=$('pen-h-ir'); if(bi) bi.onclick=function(){ cerrarHoja(); if(a.tipo==='sctr' && typeof sctrSegIr==='function'){ sctrSegIr(/^vida:/.test(String(a.ref||'')) ? 'vida' : 'sctr'); return; } navegar(ir); };
  var bc=$('pen-h-cerrar'); if(bc) bc.onclick=function(){ penCerrar(a.id, bc); };
  /* lo vio: queda anotado si lo abre alguien de su vista (no el jefe que lo mandó). No espera; si falla, no pasa nada */
  if(!a.cerrado && !_penLoVi(a) && _penUid() && AREAW.grupo && areaGrupoDe(a.area)===AREAW.grupo){
    sbRpc('sst_area_pend_visto', { p_id:a.id }).then(function(j){
      if(j && j.ok){ a.visto=Object.assign({}, a.visto||{}); a.visto[_penUid()]=new Date().toISOString(); if(VISTA.actual==='avisos') penPintar(); }
    }, function(){});
  }
}
/* el mensaje para pegar en WhatsApp o en un correo */
function penTexto(a){
  return 'Hola, equipo de '+(areaN(a.area)||'la obra')+'. Pendiente de '+(nombreObraP()||'la obra')+':\n• '+a.titulo+
    (a.cuerpo ? '\n'+a.cuerpo : '')+(a.hasta ? '\nPara el '+_penF(a.hasta)+'.' : '')+
    '\nLo ves en OBRASST, en «Pendientes». Gracias.';
}
function _penCopiar(t){
  try{
    navigator.clipboard.writeText(t).then(function(){ toast('Mensaje copiado: pégalo en WhatsApp o en un correo.'); }, function(){ toast('No se pudo copiar el mensaje.'); });
  }catch(_c){ toast('No se pudo copiar el mensaje.'); }
}

/* ── cerrarlo, con su nota ──────────────────────────────────────────────────────────────────────────────────────── */
function penCerrar(id, b){
  var a=_penPorId(id); if(!a || a.cerrado) return Promise.resolve(false);
  return preguntar('Cerrar el pendiente', '«'+a.titulo+'». ¿Qué se hizo o se entregó? Lo ve quien lo pidió.',
    { etiqueta:'Nota (opcional)', maximo:600, placeholder:'Por ejemplo: entregado en la carpeta, se compró, se programó para el 20…' }, { si:'Cerrar el pendiente' }).then(function(v){
    if(v==null) return false;
    if(b) b.disabled=true;
    return sbRpc('sst_area_pend_cerrar', { p_id:a.id, p_nota:String(v||'').trim() || null }).then(function(j){
      if(b) b.disabled=false;
      if(!j || !j.ok){ toast(j && j.motivo==='no_puede' ? 'Este pendiente lo cierra su área o quien lleva SST.' : 'No se pudo cerrar.'); return false; }
      try{ if(HOJA.abierta && String(HOJA.id)===String(a.id)) cerrarHoja(); }catch(_h){}
      toast('Cerrado: «'+_penCorta(a.titulo, 60)+'».');
      return _penRecargar();
    }, function(e){ if(b) b.disabled=false; toast('No se pudo cerrar. '+porQueFallo(e)); return false; });
  });
}
function _penRecargar(){
  return penTraer().then(function(){ if(VISTA.actual==='avisos') penPintar(); try{ pintarRail(true); }catch(_r){} return true; }, function(){ return false; });
}

/* ── un pedido a mano ───────────────────────────────────────────────────────────────────────────────────────────── */
function _penAreasOpciones(sel){
  return '<option value="">Elige el área…</option>'+AREA_GRUPOS.map(function(G){
    return '<optgroup label="'+esc(G.n)+'">'+AREAS_TRABAJO.filter(function(x){ return x.g===G.k; }).map(function(x){
      return '<option value="'+x.k+'"'+(x.k===sel ? ' selected' : '')+'>'+esc(x.n)+'</option>'; }).join('')+'</optgroup>';
  }).join('');
}
function penNuevo(pre){
  if(!areaJefe()) return;
  pre=pre||{};
  var h='<div class="campo"><label for="pen-n-area">Para qué área</label><select id="pen-n-area">'+_penAreasOpciones(pre.area||'')+'</select></div>'+
    '<div class="campo"><label for="pen-n-tit">Qué tiene que hacer o entregar</label><input id="pen-n-tit" maxlength="140" value="'+esc(pre.titulo||'')+'" placeholder="Por ejemplo: la lista de proveedores evaluados"></div>'+
    '<div class="campo"><label for="pen-n-det">Detalle (opcional)</label><textarea id="pen-n-det" maxlength="2000" rows="4">'+esc(pre.cuerpo||'')+'</textarea></div>'+
    '<div class="campo"><label for="pen-n-hasta">Para cuándo (opcional)</label><input type="date" id="pen-n-hasta" min="'+hoyISO()+'" value="'+esc(pre.hasta||'')+'"></div>'+
    '<p class="ayuda">Le aparece en sus pendientes en OBRASST. Si quieres avisarle también por WhatsApp o correo, al abrirlo está «📋 Copiar el mensaje».</p>'+
    '<div class="msg mal" id="pen-n-msg"></div>';
  abrirHoja('Nuevo pedido', nombreObraP()||'', h, '<button type="button" class="bt sec" id="pen-n-no">Cancelar</button><button type="button" class="bt" id="pen-n-si">Mandar el pedido</button>', { sinFoco:true });
  $('pen-n-no').onclick=cerrarHoja;
  setTimeout(function(){ try{ $(pre.area ? 'pen-n-tit' : 'pen-n-area').focus(); }catch(_f){} }, 30);
  $('pen-n-si').onclick=function(){
    var area=$('pen-n-area').value, tit=String($('pen-n-tit').value||'').replace(/\s+/g, ' ').trim(), det=String($('pen-n-det').value||'').trim(), hasta=$('pen-n-hasta').value||'';
    var m=$('pen-n-msg');
    if(!area){ m.textContent='Elige el área.'; $('pen-n-area').focus(); return; }
    if(tit.length<3){ m.textContent='Escribe qué tiene que hacer o entregar.'; $('pen-n-tit').focus(); return; }
    if(hasta && !/^\d{4}-\d{2}-\d{2}$/.test(hasta)){ m.textContent='La fecha no se entiende.'; return; }
    var b=$('pen-n-si'); b.disabled=true; m.textContent='';
    sbRpc('sst_area_pend_crear', { p_emp:YO.obra.id, p_area:area, p_tipo:pre.tipo||'otro', p_titulo:tit, p_cuerpo:det || null, p_ref:pre.ref || null, p_hasta:hasta || null }).then(function(j){
      b.disabled=false;
      if(!j || !j.ok){ m.textContent=({ no_puede:'Los pedidos los manda el dueño, el líder o quien lleva SST.', tope:'La obra ya tiene 500 pendientes abiertos: cierra los que ya se hicieron.', area:'Elige el área.', titulo:'Escribe qué tiene que hacer o entregar.' })[j && j.motivo] || 'No se pudo mandar el pedido.'; return; }
      cerrarHoja();
      /* 11/11/2026 · el pedido a producción, también a su celular (AVISOS-OBRA), si la obra tiene los avisos */
      if(!j.ya && area==='produccion') penAvisarCelular(YO.obra.id, tit, j.id);
      toast(j.ya ? 'Ese pedido ya estaba abierto para '+areaN(area)+'.' : 'Pedido a '+areaN(area)+': le aparece en sus pendientes.');
      if(VISTA.actual==='avisos') _penRecargar(); else areaContar().then(function(){ try{ pintarRail(true); }catch(_r){} });
    }, function(e){ b.disabled=false; m.textContent='No se pudo mandar el pedido. '+porQueFallo(e); });
  };
}

/* 11/11/2026 · el aviso al celular de producción: a la bandeja (sst_obra_avisar) y se despierta la función que los manda.
   Sin el SQL de los avisos (404) o sin nadie suscrito, no pasa nada: el pedido ya quedó en sus pendientes. */
function penAvisarCelular(oid, tit, id){
  try{
    sbRpc('sst_obra_avisar', { p_emp:oid, p_para:'produccion', p_titulo:'Pedido de SST', p_cuerpo:String(tit||'').slice(0, 300),
                               p_ir:'p-pend-area', p_tag:'pend-'+String(id||Date.now()).slice(0, 60) })
      .then(function(r){ if(r && r.ok && !r.repetido) sbFetch(SB.url+'/functions/v1/aviso-falla', { method:'POST', body:JSON.stringify({ accion:'obra' }) }).catch(function(){}); }, function(){});
  }catch(_a){}
}
/* ══ FASE 2 · BUSCAR PENDIENTES EN LA OBRA ════════════════════════════════════════════════════════════════════════
   Con lo que la obra ya registra, sin inventar nada: cada candidato dice de dónde sale, y su referencia (ref) hace que el
   mismo pedido abierto no se repita. Lo que no se pudo mirar se dice al pie. */
function _penItem(area, tipo, titulo, cuerpo, ref, hasta){ return { area:area, tipo:tipo, titulo:_penCorta(titulo, 140), cuerpo:String(cuerpo||'').slice(0, 2000), ref:String(ref).slice(0, 120), hasta:hasta || null }; }
function penCandidatos(){
  var oid=(YO.obra||{}).id, hoy=hoyISO(), mes=hoy.slice(0, 7), notas=[], items=[];
  var nomMes=(typeof SCTR_MESES!=='undefined' ? SCTR_MESES : ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'])[+mes.slice(5, 7)-1];
  /* 1 · los químicos sin su hoja MSDS → Logística */
  var pQ=(typeof planWebTrae!=='function' || planWebTrae('msds')) ? traer('sst_msds', '&select=id,producto,ficha_url&order=producto.asc', 3000).then(function(L){
    (L||[]).forEach(function(x){
      if(!x || !x.id || String(x.ficha_url||'').trim()) return;
      var p=String(x.producto||'').trim() || 'un producto sin nombre';
      items.push(_penItem('logistica', 'quimico', 'Hoja MSDS de «'+p+'»',
        '«'+p+'» está en los productos químicos de la obra sin su hoja de datos de seguridad (MSDS). Pídela al proveedor y súbela en «Productos químicos».',
        'quim:'+x.id, _penMas(7)));
    });
  }, function(){ notas.push('los productos químicos (no se pudieron leer)'); }) : Promise.resolve();
  /* 2 · los equipos: fuera de servicio o con observación → Mantenimiento; sin su revisión del mes → Producción */
  var pE=(typeof planWebTrae!=='function' || planWebTrae('equipos')) ? Promise.all([traerTodo('sst_equipo_qr', '&select=*&order=codigo.asc', 5000), cargarEqBase().catch(function(){ return null; })]).then(function(r){
    var sinMes=[];
    (r[0]||[]).forEach(function(x){
      if(!x || !x.id || x.estado==='baja') return;
      var nom=_penCorta([x.tipo, x.codigo].filter(Boolean).join(' '), 80) || 'Un equipo';
      if(x.estado==='fuera'){
        items.push(_penItem('mantenimiento', 'equipo', 'Fuera de servicio: '+nom, 'Está fuera de servicio en «Equipos y herramientas»: repararlo o reemplazarlo. Mientras tanto no se usa.', 'eq:'+x.id+':fuera', _penMas(7)));
        return;
      }
      /* 4/11/2026 · V7.9h · el extintor con la recarga vencida o por vencer (15 días, como su ficha) → Mantenimiento */
      if(typeof eqUsoDe==='function' && typeof eqRecargaEstado==='function'){
        var U=eqUsoDe(x), RE=(U.ext && U.r) ? eqRecargaEstado(U.r, hoy) : null;
        if(RE && (RE.k==='vencida' || RE.k==='pronto'))
          items.push(_penItem('mantenimiento', 'equipo', (RE.k==='vencida' ? 'Recarga vencida: ' : 'Recarga por vencer: ')+nom,
            (RE.k==='vencida' ? 'Su recarga venció el '+_penF(RE.hasta)+'.' : 'Su recarga vence el '+_penF(RE.hasta)+'.')+
            ' Recargarlo con un proveedor y anotar el mes de la nueva recarga en su ficha («Equipos y herramientas» › «Cómo se usa»). Mientras tanto, otro extintor en su lugar.',
            'eq:'+x.id+':recarga:'+U.r, RE.k==='vencida' ? _penMas(3) : RE.hasta));
      }
      if(x.ult_resultado==='observado')
        items.push(_penItem('mantenimiento', 'equipo', 'Con observación: '+nom, 'Su última revisión salió «con observación»'+(x.ult_fecha ? ' ('+_penF(x.ult_fecha)+')' : '')+': levantarla y volver a revisarlo.', 'eq:'+x.id+':obs:'+String(x.ult_fecha||'').slice(0, 10), _penMas(7)));
      if((typeof eqTieneMensual!=='function' || eqTieneMensual(x)) && String(x.ult_fecha||'').slice(0, 7)!==mes) sinMes.push(nom);
    });
    if(sinMes.length){
      var u=new Date(+mes.slice(0, 4), +mes.slice(5, 7), 0), z=function(n){ return (n<10 ? '0' : '')+n; };
      items.push(_penItem('produccion', 'equipo', _penN(sinMes.length, 'equipo', 'equipos')+' sin su revisión de '+nomMes,
        'La revisión del mes se hace con la app (el QR de cada equipo) o con la hoja del mes en «Equipos y herramientas». Faltan: '+sinMes.slice(0, 60).join(', ')+(sinMes.length>60 ? ' y '+(sinMes.length-60)+' más' : '')+'.',
        'eqmes:'+mes, u.getFullYear()+'-'+z(u.getMonth()+1)+'-'+z(u.getDate())));
    }
  }, function(){ notas.push('los equipos (no se pudieron leer)'); }) : Promise.resolve();
  /* 3 · los EMO vencidos o por vencer (30 días) → Salud. Solo el nombre y la fecha del próximo: nada del informe */
  var pM=(typeof planWebTrae!=='function' || planWebTrae('emo')) ? sbRpc('sst_emo_resumen', { p_emp:oid }).then(function(j){
    if(!j || j.ok===false || !Array.isArray(j.lista)){ notas.push('los EMO (tu cuenta no los ve)'); return; }
    j.lista.forEach(function(x){
      if(!x || !x.proximo) return;
      var p=String(x.proximo).slice(0, 10), d=_penDias(p); if(d===null || d>30) return;
      var nom=String(x.nombre||'').trim() || 'Un trabajador';
      items.push(_penItem('salud', 'emo', (d<0 ? 'EMO vencido: ' : 'EMO por vencer: ')+nom,
        (d<0 ? 'Su próximo examen médico ocupacional era el '+_penF(p)+'.' : 'Su próximo examen médico ocupacional es el '+_penF(p)+'.')+' Programarlo con la clínica y registrarlo en «Salud (EMO)».',
        'emo:'+(x.trabajador||nom)+':'+p, d<0 ? _penMas(7) : p));
    });
  }, function(){ notas.push('los EMO (no se pudieron leer)'); }) : Promise.resolve();
  /* 4 · el SCTR (en el Perú): quién está en la obra sin SCTR vigente hoy, y la constancia por vencer → Administración */
  var pS=(typeof vistaOcultaPais==='function' && vistaOcultaPais('sctr')) ? Promise.resolve() : cargarSctr().then(function(){ return sctrTraer(); }).then(function(W){
    var regs=(W && W.regs) || [], per=(W && W.per) || [];
    var R=sctrRevisar(per, regs, hoy);
    if(R.falta.length){
      var nombres=R.falta.map(function(f){ return (f.t.nombre||'')+(f.e==='no' ? '' : ' ('+String(SCTR_ESTADO_N[f.e]||'').toLowerCase()+')'); });
      items.push(_penItem('administracion', 'sctr', _penN(R.falta.length, 'persona', 'personas')+' del personal sin SCTR vigente hoy',
        'Según las constancias cargadas en «SCTR y Vida Ley», a estas personas les falta el SCTR (o una de sus dos coberturas, salud y pensión): '+nombres.slice(0, 40).join('; ')+(nombres.length>40 ? '; y '+(nombres.length-40)+' más' : '')+'. Incluirlas en la póliza y subir la constancia.',
        'sctr:falta:'+mes, _penMas(3)));
    }
    var vig=regs.filter(function(r){ return sctrVigente(r, hoy); }), fin=vig.map(function(r){ return r.a; }).sort().pop();
    if(fin && !regs.some(function(r){ return r.de && r.de>hoy; })){
      var d=_penDias(fin);
      if(d!==null && d<=7) items.push(_penItem('administracion', 'sctr', 'Renovar el SCTR: la constancia vence el '+_penF(fin),
        'La constancia del SCTR que vale hoy termina el '+_penF(fin)+' y no hay otra cargada para después. Renovarla con la aseguradora y subirla en «SCTR y Vida Ley».', 'sctr:vence:'+fin, fin));
    }
    /* 10/11/2026 · la Vida Ley (D. Leg. 688): quién está en la obra sin póliza vigente hoy, y la póliza por vencer → Administración */
    var vreg=(W && W.vida) || [], Rv=vidaRevisar(per, vreg, hoy);
    if(Rv.falta.length){
      var nomV=Rv.falta.map(function(f){ return f.t.nombre||''; });
      items.push(_penItem('administracion', 'sctr', _penN(Rv.falta.length, 'persona', 'personas')+' del personal sin Vida Ley vigente hoy',
        'Según las pólizas cargadas en «SCTR y Vida Ley», estas personas no están en una póliza de Vida Ley vigente: '+nomV.slice(0, 40).join('; ')+(nomV.length>40 ? '; y '+(nomV.length-40)+' más' : '')+
        '. Incluirlas en la póliza y subir la constancia. La Vida Ley va desde el primer día de trabajo ('+VIDA_NORMA+').', 'vida:falta:'+mes, _penMas(3)));
    }
    var finV=vreg.filter(function(r){ return sctrVigente(r, hoy); }).map(function(r){ return r.a; }).sort().pop();
    if(finV && !vreg.some(function(r){ return r.de && r.de>hoy; })){
      var dV=_penDias(finV);
      if(dV!==null && dV<=7) items.push(_penItem('administracion', 'sctr', 'Renovar la Vida Ley: la póliza vence el '+_penF(finV),
        'La póliza de Vida Ley que vale hoy termina el '+_penF(finV)+' y no hay otra cargada para después. Renovarla con la aseguradora y subirla en «SCTR y Vida Ley».', 'vida:vence:'+finV, finV));
    }
  }, function(){ notas.push('el SCTR y la Vida Ley (no se pudieron leer)'); });
  return Promise.all([pQ, pE, pM, pS]).then(function(){
    var orden={}; AREAS_TRABAJO.forEach(function(a, i){ orden[a.k]=i; });
    items.sort(function(x, y){ return (orden[x.area]-orden[y.area]) || x.titulo.localeCompare(y.titulo, 'es'); });
    return { items:items, notas:notas };
  });
}
function penBuscar(){
  if(!areaJefe()) return;
  abrirHoja('Buscar pendientes en la obra', nombreObraP()||'', '<div class="vacio" id="pen-b-cargando">Mirando lo que registra la obra…</div>', '<button type="button" class="bt sec" id="pen-b-no">Cerrar</button>', { sinFoco:true, ancha:true });
  $('pen-b-no').onclick=cerrarHoja;
  var oid=(YO.obra||{}).id;
  Promise.all([penCandidatos(), PENW.L ? Promise.resolve(PENW.L) : penTraer()]).then(function(r){
    if((YO.obra||{}).id!==oid || !HOJA.abierta || !$('pen-b-cargando')) return;
    var C=r[0], abiertos={};
    /* lo mismo ya pedido y abierto (a esa área o a otra: el químico que ya tiene Almacén no se le pide a Logística) */
    (r[1]||[]).forEach(function(a){ if(!a.cerrado && a.ref) abiertos[a.ref]=a; });
    C.items.forEach(function(it, i){ it.i=i; var y=abiertos[it.ref]; it.ya=!!y; it.yaA=y ? y.area : ''; });
    PENW.cand=C; PENW.sel={}; C.items.forEach(function(it){ if(!it.ya) PENW.sel[it.i]=true; });
    _penBuscarPintar();
  }, function(e){ var c=$('hoja-cuerpo'); if(c) c.innerHTML='<div class="vacio"><b>No se pudo mirar la obra</b>'+esc(porQueFallo(e))+'</div>'; });
}
function _penBuscarPintar(){
  var C=PENW.cand, c=$('hoja-cuerpo'), p=$('hoja-pie'); if(!C || !c) return;
  var nuevos=C.items.filter(function(it){ return !it.ya; }), por={};
  C.items.forEach(function(it){ (por[it.area]=por[it.area]||[]).push(it); });
  var h='<p class="ayuda" style="margin:0 0 10px">'+(C.items.length ?
      'Lo que falta en la obra, con lo que ya registra. Marca lo que quieres pedir: a cada área le aparece en sus pendientes. Lo que ya está pedido y abierto no se repite.' :
      'No se encontró nada pendiente: químicos con su hoja MSDS, equipos en servicio y revisados este mes, extintores con su recarga al día, EMO y SCTR al día.')+'</p>';
  AREAS_TRABAJO.forEach(function(A){
    var l=por[A.k]; if(!l) return;
    h+='<div class="pen-b-area"><div class="pen-b-cab"><b>'+esc(A.n)+'</b> <span class="tenue">'+esc(_penN(l.length, 'pendiente', 'pendientes'))+'</span></div><ul>'+l.map(function(it){
      var t=PEN_TIPOS[it.tipo] || PEN_TIPOS.otro;
      return '<li><label class="pen-b-it'+(it.ya ? ' ya' : '')+'"><input type="checkbox" data-pen-b="'+it.i+'"'+(it.ya ? ' disabled' : (PENW.sel[it.i] ? ' checked' : ''))+'>'+
        '<span><b>'+t[0]+' '+esc(it.titulo)+'</b>'+(it.ya ? ' <span class="pill gris">'+esc('ya pedido'+(it.yaA && it.yaA!==it.area ? ' a '+areaN(it.yaA) : ''))+'</span>' : '')+'<small>'+esc(_penCorta(it.cuerpo, 200))+(it.hasta ? ' · Para el '+esc(_penF(it.hasta)) : '')+'</small></span></label></li>';
    }).join('')+'</ul></div>';
  });
  if(C.notas.length) h+='<p class="ayuda pen-b-notas">No se pudo mirar: '+esc(C.notas.join('; '))+'.</p>';
  c.innerHTML=h;
  var n=nuevos.filter(function(it){ return PENW.sel[it.i]; }).length;
  if(p){
    p.innerHTML='<button type="button" class="bt sec" id="pen-b-no">Cerrar</button>'+(nuevos.length ? '<button type="button" class="bt" id="pen-b-si"'+(n ? '' : ' disabled')+'>'+esc(n===1 ? 'Mandar 1 pedido' : 'Mandar '+n+' pedidos')+'</button>' : '');
    $('pen-b-no').onclick=cerrarHoja;
    var bs=$('pen-b-si'); if(bs) bs.onclick=function(){ penBuscarMandar(bs); };
  }
  Array.prototype.forEach.call(c.querySelectorAll('input[data-pen-b]'), function(x){ x.onchange=function(){
    var i=+x.getAttribute('data-pen-b'); if(x.checked) PENW.sel[i]=true; else delete PENW.sel[i];
    var k=C.items.filter(function(it){ return !it.ya && PENW.sel[it.i]; }).length, b=$('pen-b-si');
    if(b){ b.disabled=!k; b.textContent=k===1 ? 'Mandar 1 pedido' : 'Mandar '+k+' pedidos'; }
  }; });
}
function penBuscarMandar(b){
  var C=PENW.cand; if(!C) return Promise.resolve(false);
  var L=C.items.filter(function(it){ return !it.ya && PENW.sel[it.i]; }).map(function(it){ return { area:it.area, tipo:it.tipo, titulo:it.titulo, cuerpo:it.cuerpo, ref:it.ref, hasta:it.hasta }; });
  if(!L.length) return Promise.resolve(false);
  return penMandarVarios(L, b).then(function(R){
    if(!R) return false;
    cerrarHoja();
    toast((R.creados===1 ? '1 pedido mandado' : R.creados+' pedidos mandados')+(R.ya ? ' ('+R.ya+' ya estaban abiertos)' : '')+(R.tope ? '. La obra llegó a los 500 pendientes abiertos: cierra los que ya se hicieron.' : '.'));
    if(VISTA.actual==='avisos') _penRecargar(); else areaContar().then(function(){ try{ pintarRail(true); }catch(_r){} });
    return true;
  });
}
/* varios pedidos de una vez (de 200 en 200, el tope del servidor por llamada): { creados, ya, malos, tope } o null */
function penMandarVarios(L, b){
  if(!areaJefe() || !YO.obra) return Promise.resolve(null);
  var R={ creados:0, ya:0, malos:0, tope:false }, i=0, oid=YO.obra.id;
  if(b) b.disabled=true;
  function sig(){
    if(i>=L.length || R.tope) return Promise.resolve(R);
    var parte=L.slice(i, i+200); i+=200;
    return sbRpc('sst_area_pend_varios', { p_emp:oid, p_items:parte }).then(function(j){
      if(!j || !j.ok) return Promise.reject({ portal:(j && j.motivo==='no_puede') ? 'Los pedidos los manda el dueño, el líder o quien lleva SST.' : 'El servidor no aceptó los pedidos.' });
      R.creados+=(+j.creados||0); R.ya+=(+j.ya||0); R.malos+=(+j.malos||0); R.tope=R.tope || j.tope===true;
      return sig();
    });
  }
  return sig().then(function(r){ if(b) b.disabled=false; return r; }, function(e){ if(b) b.disabled=false; toast('No se pudieron mandar los pedidos. '+porQueFallo(e)); return null; });
}
/* cerrar los abiertos de una referencia (la carpeta de auditoría, al subir la evidencia de un requisito) */
function penCerrarRef(ref, nota){
  if(!areaActiva() || !ref) return Promise.resolve(0);
  return traer('sst_area_pend', '&ref=eq.'+encodeURIComponent(ref)+'&cerrado=is.null&select=id', 20).then(function(L){
    var n=0;
    return (L||[]).reduce(function(p, a){
      return p.then(function(){ return sbRpc('sst_area_pend_cerrar', { p_id:a.id, p_nota:nota || null }).then(function(j){ if(j && j.ok && !j.ya) n++; }, function(){}); });
    }, Promise.resolve()).then(function(){ return n; });
  }, function(){ return 0; });
}

function _penCss(){
  if($('pen-css')) return;
  var st=document.createElement('style'); st.id='pen-css';
  st.textContent=[
    '.pen-intro{margin:0 0 14px;max-width:84ch;line-height:1.55}',
    '.pen-intro .enlace{margin:0;font-size:inherit;vertical-align:baseline}',
    '.pen-cifras{margin-bottom:14px}',
    '.pen-filtros{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:0 0 14px}',
    '.pen-vista{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--gris);margin:0}',
    '.pen-vista select{width:auto}',
    '.pen-vista select{max-width:100%}',
    '.pen-lista{display:grid;gap:10px}',
    '.pen-r{background:var(--panel);border:1px solid var(--raya);border-radius:12px;padding:12px 14px;display:grid;gap:6px;min-width:0}',
    '.pen-r.venc{border-color:var(--mal)}',
    '.pen-r.cerrado{opacity:.85}',
    '.pen-r-cab{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:12.5px}',
    '.pen-tipo{color:var(--gris)}',
    '.pen-t{font-size:15px;line-height:1.35;overflow-wrap:anywhere}',
    '.pen-d{margin:0;color:var(--texto);line-height:1.5;overflow-wrap:anywhere}',
    '.pen-pie{font-size:12.5px;color:var(--gris);font-variant-numeric:tabular-nums}',
    '.pen-r.venc .pen-pie{color:var(--mal)}',
    '.pen-acc{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}',
    '.pen-dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 14px;margin:0 0 12px}',
    '.pen-dl dt{color:var(--gris)} .pen-dl dd{margin:0;overflow-wrap:anywhere}',
    '.pen-cuerpo{background:var(--fondo);border-radius:10px;padding:10px 12px;line-height:1.55;overflow-wrap:anywhere}',
    '.pen-b-area{margin:0 0 14px}',
    '.pen-b-cab{display:flex;gap:8px;align-items:baseline;margin:0 0 6px}',
    '.pen-b-area ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}',
    '.pen-b-it{display:flex;gap:10px;align-items:flex-start;cursor:pointer;padding:8px 10px;border:1px solid var(--raya);border-radius:10px;margin:0;font-size:13.5px;font-weight:400;color:var(--texto);letter-spacing:0}',
    '.pen-b-it > span{flex:1 1 auto;min-width:0;overflow-wrap:anywhere}',
    '.pen-b-it b{font-weight:600}',
    '.pen-b-it.ya{cursor:default;opacity:.7}',
    '.pen-b-it input[type=checkbox]{width:18px;height:18px;min-width:0;padding:0;margin:2px 0 0;flex:0 0 18px;box-shadow:none}',
    '.pen-b-it small{display:block;color:var(--gris);margin-top:2px;line-height:1.45}',
    '.pen-b-notas{margin-top:10px}',
    '@media (max-width:560px){.pen-dl{grid-template-columns:1fr}.pen-dl dt{margin-top:6px}}'
  ].join('\n');
  document.head.appendChild(st);
}
