/* OBRASST · el portal · EL REGISTRO FOTOGRÁFICO DEL MES (19/10/2026 · lote 19)
   Marcelo: «Anexar el registro fotográfico (charlas, uso de EPPs, sistema de emergencia, servicios de bienestar, etc)
   (todo lo que el líder sst vea conveniente colocar)».
   Las fotos del mes, tema por tema: las que se suben aquí o desde la cámara de la app («Al registro fotográfico»), y las
   que ya están en otros registros de la obra (reportes, buenas prácticas, fotos de obra, inspecciones), que se suman sin
   volver a subirlas. El informe del mes las anexa en este mismo orden. Los temas son de la obra: el líder los cambia
   (la nota de «ats-cfg», «fotoCat»: la misma lista en la app). El módulo FOTO-REG (núcleo del portal) dice cómo se guarda. */
var FRW = { obra:null, filas:null, t:0, mes:'', L:null, Lobra:null, cola:[], ed:null };
function _fotCss(){
  if(document.getElementById('fot-css')) return;
  var st=document.createElement('style'); st.id='fot-css';
  st.textContent=[
    '.fr-res{display:flex; flex-wrap:wrap; gap:10px 18px; align-items:end}',
    '.fr-res .campo{margin:0}',
    '.fr-chips{display:flex; flex-wrap:wrap; gap:6px; flex:1 1 380px}',
    '.fr-chip{display:inline-flex; gap:6px; align-items:center; border:1px solid var(--raya); border-radius:999px; padding:4px 10px; font-size:12.5px; background:var(--panel); color:var(--texto); cursor:pointer; font:inherit; font-size:12.5px}',
    '.fr-chip b{font-variant-numeric:tabular-nums; color:var(--tinta)}.fr-chip.cero{color:var(--gris); border-style:dashed}',
    '.fr-cat .tarj-cab h2 small{font-weight:400; color:var(--gris); font-size:13px; margin-left:6px}',
    '.fr-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(170px, 1fr)); gap:12px}',
    '.fr-f{margin:0; border:1px solid var(--raya); border-radius:10px; overflow:hidden; background:var(--panel); display:flex; flex-direction:column}',
    '.fr-f button.fr-img{display:block; padding:0; border:0; background:var(--fondo); cursor:zoom-in; aspect-ratio:4/3; width:100%}',
    '.fr-f img{display:block; width:100%; height:100%; object-fit:cover}',
    '.fr-f figcaption{padding:7px 9px 8px; font-size:12.5px; line-height:1.35; color:var(--texto); display:flex; flex-direction:column; gap:2px; flex:1}',
    '.fr-f figcaption b{font-weight:600; color:var(--tinta); font-size:12px}.fr-f figcaption small{color:var(--gris)}',
    '.fr-f .fr-ed{align-self:flex-start; margin-top:4px}',
    '.fr-vacio{border:1.5px dashed var(--raya); border-radius:10px; padding:14px; color:var(--gris); font-size:13px; display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap}',
    '.fr-cola{display:grid; gap:10px}',
    '.fr-q{display:grid; grid-template-columns:96px minmax(0,1fr); gap:12px; align-items:start; border:1px solid var(--raya); border-radius:10px; padding:10px; background:var(--panel)}',
    '.fr-q img{width:96px; height:72px; object-fit:cover; border-radius:8px; background:var(--fondo)}',
    '.fr-q .fila-c{margin:0}.fr-q .campo{margin:0 0 6px}',
    '.fr-q-est{font-size:12.5px; color:var(--gris)}.fr-q-est.ok{color:var(--ok)}.fr-q-est.mal{color:var(--mal)}',
    '.fr-de{display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:12px}',
    '.fr-de .fr-f figcaption .campo{margin:6px 0 0}',
    '.fr-grande{display:block; width:100%; max-height:62vh; object-fit:contain; background:var(--fondo); border-radius:10px; border:1px solid var(--raya); margin:0 0 12px}',
    '.fr-temas{list-style:none; margin:0 0 10px; padding:0; display:grid; gap:8px}',
    '.fr-temas li{display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,1.6fr) auto auto; gap:8px; align-items:center}',
    '.fr-temas li input{margin:0}.fr-temas li .chk{margin:0; white-space:nowrap; font-size:12.5px}',
    '.fr-temas li .fr-mov{display:flex; gap:4px}',
    '@media (max-width:720px){ .fr-temas li{grid-template-columns:minmax(0,1fr)} .fr-q{grid-template-columns:72px minmax(0,1fr)} .fr-q img{width:72px; height:56px} }'
  ].join('\n');
  document.head.appendChild(st);
}
/* ── lo guardado ── */
function fotoRegTraerP(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && FRW.obra===oid && FRW.filas && Date.now()-FRW.t<20000) return Promise.resolve(FRW.filas);
  return traerTodo('sst_doc', '&select=id,hoja,nombre,url,nota,creado&hoja=eq.'+FOTO_HOJA+'&order=creado.asc', 8000).then(function(rows){
    FRW.obra=oid; FRW.filas=fotoRegFilas(rows); FRW.t=Date.now();
    return FRW.filas;
  });
}
function fotoCatP(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && FRW.Lobra===oid && FRW.L) return Promise.resolve(FRW.L);
  return traer('sst_doc', '&select=id,nota&hoja=eq.ats-cfg&order=creado.desc', 1).then(function(rows){
    var f=(rows||[])[0], n=f ? nota(f.nota) : null;
    FRW.L=fotoCatLista(n && n.fotoCat); FRW.Lobra=oid; FRW.propia=!!(n && Array.isArray(n.fotoCat) && n.fotoCat.length);
    return FRW.L;
  }, function(){ FRW.L=fotoCatLista(null); FRW.Lobra=oid; return FRW.L; });
}
function fotoCatPonerP(L){
  var g=fotoCatGuardable(L);
  return traer('sst_doc', '&select=id,nombre,nota&hoja=eq.ats-cfg&order=creado.desc', 1).then(function(rows){
    var f=(rows||[])[0], n=(f && nota(f.nota)) || {};
    if(!n || typeof n!=='object' || Array.isArray(n)) n={};
    n.fotoCat=g;
    if(f) return sbPatch('sst_doc?id=eq.'+encodeURIComponent(f.id), { nota:JSON.stringify(n) });
    return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'ats-cfg', nombre:'digital', nota:JSON.stringify(n) });
  }).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'Esta cuenta no puede cambiarlo en esta obra.'});
    FRW.L=fotoCatLista(g); FRW.Lobra=(YO.obra||{}).id; FRW.propia=true;
    return FRW.L;
  });
}
function _fotNueva(url, d, nombre){
  return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:FOTO_HOJA, nombre:String(nombre || d.desc || 'Foto').slice(0, 180), url:url, nota:JSON.stringify(d) }).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede registrar en esta obra.'});
    FRW.t=0; return rows;
  });
}
/* los meses para elegir: el actual y los 11 de antes */
function _fotMeses(){ var out=[]; for(var j=0; j<12; j++){ var d=new Date(Date.parse(MES+'-15T12:00:00')); d.setMonth(d.getMonth()-j); out.push(d.getFullYear()+'-'+dos(d.getMonth()+1)); } return out; }
function _fotFecha(f){ return f ? fechaLarga(f) : ''; }

/* ═══ LA VISTA ═══ */
function vistaFotoReg(caja){
  _fotCss();
  if(!FRW.mes) FRW.mes=MES;
  var ac=$('acciones');
  if(ac){
    ac.innerHTML='<button type="button" class="bt sec" id="fr-temas-b">Temas del registro</button><button type="button" class="bt sec" id="fr-de-b">Sumar de tus registros</button>'+
      '<button type="button" class="bt" id="fr-subir-b">＋ Subir fotos</button><input type="file" id="fr-file" accept="image/*" multiple hidden>';
    $('fr-temas-b').onclick=fotTemasHoja;
    $('fr-de-b').onclick=function(){ fotDeRegistrosHoja(FRW.mes); };
    $('fr-subir-b').onclick=function(){ FRW.catSubir=''; $('fr-file').click(); };
    $('fr-file').onchange=function(){ var l=Array.prototype.slice.call(this.files||[]); this.value=''; if(l.length) fotColaHoja(l, FRW.catSubir); };
  }
  caja.innerHTML='<div id="fr-vista"><div class="vacio">Cargando…</div></div>';
  function pinta(){
    return Promise.all([fotoRegTraerP(true), fotoCatP()]).then(function(r){ _fotPintar(r[0], r[1]); }, function(e){ var v=$('fr-vista'); if(v) fallo(v, e); });
  }
  VISTA.recargar=pinta; pinta();
}
function _fotPintar(filas, L){
  var v=$('fr-vista'); if(!v) return;
  var del=fotoRegDelMes(filas, FRW.mes), cu=fotoCatCuenta(del), conFoto=L.filter(function(c){ return cu[c.k]; }).length;
  /* las de un tema que ya no está en la lista van con «Otros» (o al final, si la obra quitó «Otros») */
  var fuera=del.filter(function(x){ return !L.some(function(c){ return c.k===x.d.cat; }); });
  var h='<div class="tarj"><div class="tarj-cuerpo fr-res"><div class="campo"><label for="fr-mes">El mes</label><select id="fr-mes">'+
      _fotMeses().map(function(m){ return '<option value="'+m+'"'+(m===FRW.mes ? ' selected' : '')+'>'+esc(mesLargo(m))+'</option>'; }).join('')+'</select></div>'+
    '<div class="fr-chips">'+L.map(function(c){ var n=cu[c.k]||0; return '<button type="button" class="fr-chip'+(n ? '' : ' cero')+'" data-ir="'+esc(c.k)+'"><b>'+n+'</b> '+esc(c.n)+'</button>'; }).join('')+'</div>'+
    '<p class="ayuda" style="margin:0; flex:1 1 100%">'+(del.length ? del.length+(del.length===1 ? ' foto' : ' fotos')+' en '+conFoto+' de '+L.length+' temas. ' : 'Todavía no hay fotos de este mes. ')+
      'Se suben aquí o desde la cámara de la app («Al registro fotográfico»), y las de tus reportes, buenas prácticas e inspecciones se suman con «Sumar de tus registros». El informe del mes las anexa tema por tema.</p></div></div>';
  L.forEach(function(c){
    var fs=del.filter(function(x){ return x.d.cat===c.k; });
    if(c.k==='otros') fs=fs.concat(fuera);
    h+='<div class="tarj fr-cat" id="fr-c-'+esc(c.k)+'"><div class="tarj-cab"><div><h2>'+esc(c.n)+'<small>'+(fs.length ? fs.length+(fs.length===1 ? ' foto' : ' fotos') : '')+'</small></h2>'+(c.ej ? '<p class="sub">'+esc(c.ej)+'</p>' : '')+'</div>'+
      '<div class="acciones"><button type="button" class="bt sec chico" data-subir="'+esc(c.k)+'">＋ Subir</button></div></div><div class="tarj-cuerpo">'+
      (fs.length ? '<div class="fr-grid">'+fs.map(_fotFig).join('')+'</div>'
                 : '<div class="fr-vacio"><span>Sin fotos de este tema en '+esc(mesLargo(FRW.mes))+'.</span><button type="button" class="bt sec chico" data-subir="'+esc(c.k)+'">＋ Subir fotos</button></div>')+'</div></div>';
  });
  if(fuera.length && !L.some(function(c){ return c.k==='otros'; }))
    h+='<div class="tarj fr-cat"><div class="tarj-cab"><div><h2>De temas que ya no están en la lista<small>'+fuera.length+'</small></h2></div></div><div class="tarj-cuerpo"><div class="fr-grid">'+fuera.map(_fotFig).join('')+'</div></div></div>';
  v.innerHTML=h;
  $('fr-mes').onchange=function(){ FRW.mes=this.value; _fotPintar(FRW.filas, FRW.L); };
  v.onclick=function(ev){
    var s=ev.target.closest('[data-subir]'), ir=ev.target.closest('[data-ir]'), ed=ev.target.closest('[data-ed]'), ver=ev.target.closest('[data-ver]');
    if(s){ FRW.catSubir=s.getAttribute('data-subir'); $('fr-file').click(); return; }
    if(ir){ var t=$('fr-c-'+ir.getAttribute('data-ir')); if(t) t.scrollIntoView({ behavior:'smooth', block:'start' }); return; }
    if(ed || ver){ fotEditarHoja((ed || ver).getAttribute(ed ? 'data-ed' : 'data-ver')); }
  };
}
function _fotFig(x){
  var d=x.d, de=/^rep:/.test(d.de) ? 'De un reporte' : (/^buena:/.test(d.de) ? 'De una buena práctica' : (/^fotos:/.test(d.de) ? 'De fotos de obra' : (/^insp:/.test(d.de) ? 'De una inspección' : '')));
  return '<figure class="fr-f"><button type="button" class="fr-img" data-ver="'+esc(x.id)+'" aria-label="Ver la foto"><img loading="lazy" src="'+esc(x.url)+'" alt="'+esc(d.desc || 'Foto del registro')+'"></button>'+
    '<figcaption><b>'+esc(_fotFecha(d.fecha))+(d.frente ? ' · '+esc(d.frente) : '')+'</b>'+(d.desc ? '<span>'+esc(d.desc)+'</span>' : '<small>Sin descripción</small>')+(de ? '<small>'+de+'</small>' : '')+
    '<button type="button" class="bt sec chico fr-ed" data-ed="'+esc(x.id)+'">Editar</button></figcaption></figure>';
}

/* ═══ SUBIR: una fila por foto, con su tema, su fecha y lo que se ve ═══ */
function fotColaHoja(files, cat){
  var L=FRW.L || fotoCatLista(null), hoy=hoyISO();
  var imgs=files.filter(function(f){ return /^image\//i.test(f.type||'') || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name||''); }).slice(0, 40);
  if(!imgs.length){ toast('Elige fotos (JPG o PNG).'); return; }
  FRW.cola=imgs.map(function(f, i){
    var lm=f.lastModified ? new Date(f.lastModified) : null, fe=lm ? lm.getFullYear()+'-'+dos(lm.getMonth()+1)+'-'+dos(lm.getDate()) : hoy;
    if(fe>hoy) fe=hoy;
    /* si se está mirando otro mes, la fecha de fábrica es de ese mes */
    if(mesDe(fe)!==FRW.mes) fe=(FRW.mes===MES) ? hoy : obsMesFin(FRW.mes);
    return { f:f, i:i, cat:cat || '', fecha:fe, desc:'', url:URL.createObjectURL(f), estado:'' };
  });
  var opts=function(sel){ return '<option value="">Elige el tema…</option>'+L.map(function(c){ return '<option value="'+esc(c.k)+'"'+(c.k===sel ? ' selected' : '')+'>'+esc(c.n)+'</option>'; }).join(''); };
  var h='<p class="ayuda" style="margin:0 0 10px">Cada foto con su tema, su fecha y lo que se ve: así sale en el informe. Se achican a 1600 px antes de subir.</p>'+
    '<div class="fila-c"><div class="campo"><label for="frq-todas">Poner a todas el tema</label><select id="frq-todas">'+opts(cat || '')+'</select></div>'+
    '<div class="campo"><label for="frq-frente">Frente <span class="tenue">· opcional, para todas</span></label><input id="frq-frente" maxlength="80" autocomplete="off"></div></div>'+
    '<div class="fr-cola">'+FRW.cola.map(function(q){
      return '<div class="fr-q" data-q="'+q.i+'"><img src="'+q.url+'" alt="">'+
        '<div><div class="fila-c"><div class="campo"><label for="frq-c-'+q.i+'">Tema</label><select id="frq-c-'+q.i+'" data-k="cat">'+opts(q.cat)+'</select></div>'+
        '<div class="campo"><label for="frq-f-'+q.i+'">Fecha</label><input type="date" id="frq-f-'+q.i+'" data-k="fecha" max="'+hoy+'" value="'+q.fecha+'"></div></div>'+
        '<div class="campo"><label for="frq-d-'+q.i+'">Lo que se ve</label><input id="frq-d-'+q.i+'" data-k="desc" maxlength="200" placeholder="Charla de inicio de jornada sobre trabajos en altura" autocomplete="off"></div>'+
        '<div class="fr-q-est" id="frq-e-'+q.i+'">'+esc(q.f.name || '')+'</div></div></div>';
    }).join('')+'</div><div class="msg" id="frq-msg" role="status"></div>';
  abrirHoja('Subir '+FRW.cola.length+(FRW.cola.length===1 ? ' foto' : ' fotos')+' al registro', mesLargo(FRW.mes), h,
    '<button type="button" class="bt sec" id="frq-no">Cancelar</button><button type="button" class="bt ok" id="frq-ok">Subir '+FRW.cola.length+(FRW.cola.length===1 ? ' foto' : ' fotos')+'</button>', { ancha:true, sinFoco:true });
  $('frq-no').onclick=function(){ _fotColaSoltar(); cerrarHoja(); };
  $('frq-todas').onchange=function(){ var v=this.value; FRW.cola.forEach(function(q){ var s=$('frq-c-'+q.i); if(s && v) s.value=v; }); };
  $('frq-ok').onclick=_fotColaSubir;
}
function _fotColaSoltar(){ (FRW.cola||[]).forEach(function(q){ try{ URL.revokeObjectURL(q.url); }catch(e){} }); }
function _fotColaSubir(){
  var m=$('frq-msg'), b=$('frq-ok'), frente=String($('frq-frente').value||'').trim(), hoy=hoyISO();
  var falta=FRW.cola.filter(function(q){ return q.estado!=='ok' && !$('frq-c-'+q.i).value; });
  if(falta.length){ m.className='msg mal'; m.textContent=falta.length===1 ? 'A una foto le falta su tema.' : 'A '+falta.length+' fotos les falta su tema.'; try{ $('frq-c-'+falta[0].i).focus(); }catch(e){} return; }
  var malF=FRW.cola.filter(function(q){ var f=$('frq-f-'+q.i).value; return q.estado!=='ok' && (!/^\d{4}-\d{2}-\d{2}$/.test(f) || f>hoy); });
  if(malF.length){ m.className='msg mal'; m.textContent='Revisa la fecha: hasta hoy.'; try{ $('frq-f-'+malF[0].i).focus(); }catch(e){} return; }
  b.disabled=true; $('frq-no').disabled=true;
  var pend=FRW.cola.filter(function(q){ return q.estado!=='ok'; }), n=0, fallas=0, quien=(YO.nombre || quienSoy() || '');
  function una(k){
    var q=pend[k]; if(!q) return Promise.resolve();
    var e=$('frq-e-'+q.i); e.className='fr-q-est'; e.textContent='Subiendo…';
    m.className='msg gris'; m.textContent='Subiendo '+(k+1)+' de '+pend.length+'…';
    var d=fotoRegLimpia({ cat:$('frq-c-'+q.i).value, fecha:$('frq-f-'+q.i).value, desc:$('frq-d-'+q.i).value, frente:frente, de:'sub', por:quien, t:Date.now() });
    return achicarFoto(q.f, 1600, 0.85).then(function(bl){ return subirFoto('fotoreg', bl, q.f.name || 'foto.jpg'); })
      .then(function(url){ return _fotNueva(url, d, d.desc || fotoCatDe(FRW.L, d.cat).n); })
      .then(function(){ q.estado='ok'; n++; e.className='fr-q-est ok'; e.textContent='✓ Subida'; },
            function(err){ q.estado='mal'; fallas++; e.className='fr-q-est mal'; e.textContent=(err==='foto_rara' ? 'Esta imagen no se pudo leer.' : 'No subió: '+porQueFallo(err)); })
      .then(function(){ return una(k+1); });
  }
  una(0).then(function(){
    FRW.t=0;
    if(!fallas){ _fotColaSoltar(); toast(n===1 ? 'Foto en el registro.' : n+' fotos en el registro.'); cerrarHoja(); if(typeof VISTA.recargar==='function' && VISTA.actual==='fotoreg') VISTA.recargar(); return; }
    b.disabled=false; $('frq-no').disabled=false; b.textContent='Reintentar las que fallaron';
    m.className='msg mal'; m.textContent=(n ? n+' subidas; ' : '')+fallas+(fallas===1 ? ' no subió.' : ' no subieron.')+' Revisa tu conexión y reintenta.';
  });
}

/* ═══ EDITAR UNA ═══ */
function fotEditarHoja(id){
  var x=(FRW.filas||[]).filter(function(y){ return String(y.id)===String(id); })[0], L=FRW.L || fotoCatLista(null); if(!x) return;
  var d=x.d, hoy=hoyISO(), cat=fotoCatDe(L, d.cat);
  var h='<img class="fr-grande" src="'+esc(x.url)+'" alt="'+esc(d.desc || 'Foto del registro')+'">'+
    '<div class="fila-c"><div class="campo"><label for="fre-cat">Tema</label><select id="fre-cat">'+L.map(function(c){ return '<option value="'+esc(c.k)+'"'+(c.k===d.cat ? ' selected' : '')+'>'+esc(c.n)+'</option>'; }).join('')+
      (cat.fuera ? '<option value="'+esc(d.cat)+'" selected>'+esc(cat.n)+' (ya no está en la lista)</option>' : '')+'</select></div>'+
    '<div class="campo"><label for="fre-fecha">Fecha</label><input type="date" id="fre-fecha" max="'+hoy+'" value="'+esc(d.fecha)+'"></div></div>'+
    '<div class="campo"><label for="fre-desc">Lo que se ve</label><input id="fre-desc" maxlength="200" value="'+esc(d.desc)+'" autocomplete="off"></div>'+
    '<div class="fila-c"><div class="campo"><label for="fre-frente">Frente <span class="tenue">· opcional</span></label><input id="fre-frente" maxlength="80" value="'+esc(d.frente)+'" autocomplete="off"></div>'+
    '<div class="campo"><label for="fre-emp">Empresa <span class="tenue">· si es de una subcontrata</span></label><input id="fre-emp" maxlength="100" value="'+esc(d.emp)+'" autocomplete="off"></div></div>'+
    '<div class="msg" id="fre-msg" role="status"></div>';
  abrirHoja('Foto del registro', (d.por ? 'La puso '+d.por+' · ' : '')+_fotFecha(d.fecha), h,
    '<button type="button" class="bt mal" id="fre-quitar">Quitar del registro</button><button type="button" class="bt sec" id="fre-no">Cerrar</button><button type="button" class="bt ok" id="fre-ok">Guardar</button>', { ancha:true, sinFoco:true });
  $('fre-no').onclick=cerrarHoja;
  $('fre-ok').onclick=function(){
    var m=$('fre-msg'), fe=$('fre-fecha').value;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(fe) || fe>hoy){ m.className='msg mal'; m.textContent='Revisa la fecha: hasta hoy.'; return; }
    var n=fotoRegLimpia({ cat:$('fre-cat').value, fecha:fe, desc:$('fre-desc').value, frente:$('fre-frente').value, emp:$('fre-emp').value, de:d.de, por:d.por, t:Date.now() });
    var b=this; b.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
    sbPatch('sst_doc?id=eq.'+encodeURIComponent(x.id), { nombre:String(n.desc || fotoCatDe(L, n.cat).n).slice(0, 180), nota:JSON.stringify(n) }).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: la foto ya no está o esta cuenta no puede cambiarla.'});
      toast('Guardado.'); cerrarHoja(); FRW.t=0; if(typeof VISTA.recargar==='function' && VISTA.actual==='fotoreg') VISTA.recargar();
    }).catch(function(e){ b.disabled=false; m.className='msg mal'; m.textContent='No se pudo guardar. '+porQueFallo(e); });
  };
  $('fre-quitar').onclick=function(){
    confirmar('¿Quitar esta foto del registro?', d.de==='sub' ? 'Deja de salir en el registro y en el informe.' : 'Deja de salir en el registro y en el informe. La foto sigue en el registro de donde vino.', { si:'Sí, quitarla', mal:true }).then(function(si){
      if(!si) return;
      sbDelP('sst_doc?id=eq.'+encodeURIComponent(x.id)).then(function(rows){
        if(Array.isArray(rows) && !rows.length){ toast('No se pudo quitar: esta cuenta no puede borrar en esta obra.'); return; }
        toast('Quitada del registro.'); cerrarHoja(); FRW.t=0; if(typeof VISTA.recargar==='function' && VISTA.actual==='fotoreg') VISTA.recargar();
      }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
    });
  };
}

/* ═══ SUMAR DE TUS REGISTROS: las fotos que ya están en la obra, sin volver a subirlas ═══ */
function _fotEsImg(u){ u=String(u||''); return /^https:\/\//i.test(u) && !/\.pdf(\?|$)/i.test(u) && !/%2Fdocs%2F|\/docs\//i.test(u); }
function fotDeRegistrosHoja(mes){
  abrirHoja('Sumar de tus registros', mesLargo(mes)+' · las fotos que ya están en la obra', '<div class="vacio">Buscando las fotos del mes…</div>', '<button type="button" class="bt sec" id="frd-no">Cerrar</button>', { ancha:true, sinFoco:true });
  $('frd-no').onclick=cerrarHoja;
  var d0=mes+'-01', d1=obsMesFin(mes), c0=encodeURIComponent(d0+'T00:00:00'), c1=encodeURIComponent(d1+'T23:59:59');
  Promise.all([
    traer('sst_reporte', '&select=id,clase,descripcion,lugar,fecha,creado,foto_url,foto_cierre&fecha=gte.'+d0+'&fecha=lte.'+d1+'&order=fecha.asc', 1000).catch(function(){ return []; }),
    traer('sst_buena', '&select=id,fecha,titulo,descripcion,lugar,foto_url&fecha=gte.'+d0+'&fecha=lte.'+d1+'&order=fecha.asc', 500).catch(function(){ return []; }),
    traer('sst_doc', '&select=id,nombre,url,nota,creado&hoja=eq.fotos&creado=gte.'+c0+'&creado=lte.'+c1+'&order=creado.asc', 500).catch(function(){ return []; }),
    traer('sst_inspeccion', '&select=id,tipo,fecha,foto_url&fecha=gte.'+d0+'&fecha=lte.'+d1+'&order=fecha.asc', 500).catch(function(){ return []; }),
    fotoRegTraerP(true), fotoCatP()
  ]).then(function(r){
    var C=[], ya={};
    (r[4]||[]).forEach(function(x){ ya[x.url]=1; });
    (r[0]||[]).forEach(function(x){
      var t=(x.clase==='acto' ? 'Acto inseguro' : 'Condición insegura'), f=String(x.fecha || x.creado || '').slice(0, 10);
      if(_fotEsImg(x.foto_url)) C.push({ de:'rep:'+x.id, url:x.foto_url, tit:t+' · así se encontró', desc:x.descripcion || '', fecha:f, frente:x.lugar || '', cat:'' });
      if(_fotEsImg(x.foto_cierre)) C.push({ de:'rep:'+x.id+':c', url:x.foto_cierre, tit:t+' · así quedó', desc:x.descripcion ? 'Levantado: '+x.descripcion : '', fecha:f, frente:x.lugar || '', cat:'' });
    });
    (r[1]||[]).forEach(function(x){ if(_fotEsImg(x.foto_url)) C.push({ de:'buena:'+x.id, url:x.foto_url, tit:'Buena práctica', desc:x.titulo || x.descripcion || '', fecha:String(x.fecha || '').slice(0, 10), frente:x.lugar || '', cat:'' }); });
    (r[2]||[]).forEach(function(x){ if(_fotEsImg(x.url)) C.push({ de:'fotos:'+x.id, url:x.url, tit:'Foto de obra', desc:'', fecha:String(x.creado || '').slice(0, 10), frente:(typeof x.nota==='string' && x.nota.charAt(0)!=='{') ? x.nota.slice(0, 80) : '', cat:'' }); });
    (r[3]||[]).forEach(function(x){ if(_fotEsImg(x.foto_url)) C.push({ de:'insp:'+x.id, url:x.foto_url, tit:'Inspección · '+(x.tipo || ''), desc:x.tipo ? 'Inspección de '+x.tipo : '', fecha:String(x.fecha || '').slice(0, 10), frente:'', cat:'' }); });
    FRW.de=C;
    var L=r[5], b=$('hoja-cuerpo'); if(!b) return;
    if(!C.length){ b.innerHTML='<div class="vacio"><b>Sin fotos en tus registros de '+esc(mesLargo(mes))+'</b>Ni en los reportes, ni en las buenas prácticas, ni en las fotos de obra, ni en las inspecciones.</div>'; return; }
    var nuevas=C.filter(function(x){ return !ya[x.url]; }).length;
    b.innerHTML='<p class="ayuda" style="margin:0 0 12px">'+C.length+(C.length===1 ? ' foto' : ' fotos')+' en tus registros de '+esc(mesLargo(mes))+(nuevas<C.length ? ' ('+(C.length-nuevas)+' ya están en el registro)' : '')+'. Elige el tema de las que quieras sumar: no se vuelven a subir.</p>'+
      '<div class="fr-de">'+C.map(function(x, i){
        var en=!!ya[x.url];
        return '<figure class="fr-f"><span class="fr-img" style="display:block;aspect-ratio:4/3"><img loading="lazy" src="'+esc(x.url)+'" alt=""></span><figcaption><b>'+esc(x.tit)+'</b><small>'+esc(_fotFecha(x.fecha))+(x.frente ? ' · '+esc(x.frente) : '')+'</small>'+(x.desc ? '<span>'+esc(x.desc)+'</span>' : '')+
          (en ? '<span class="pill ok" style="align-self:flex-start;margin-top:6px">✓ En el registro</span>'
              : '<div class="campo"><label for="frd-c-'+i+'" class="tenue">Tema</label><select id="frd-c-'+i+'"><option value="">Elige…</option>'+L.map(function(c){ return '<option value="'+esc(c.k)+'">'+esc(c.n)+'</option>'; }).join('')+'</select></div>'+
                '<button type="button" class="bt chico fr-ed" data-sumar="'+i+'">Sumar al registro</button>')+'</figcaption></figure>';
      }).join('')+'</div>';
    b.onclick=function(ev){
      var s=ev.target.closest('[data-sumar]'); if(!s) return;
      var i=+s.getAttribute('data-sumar'), x=FRW.de[i], cat=$('frd-c-'+i).value;
      if(!cat){ toast('Elige el tema de la foto.'); try{ $('frd-c-'+i).focus(); }catch(e){} return; }
      s.disabled=true; s.textContent='Sumando…';
      var d=fotoRegLimpia({ cat:cat, fecha:x.fecha, desc:x.desc, frente:x.frente, de:x.de, por:(YO.nombre || quienSoy() || ''), t:Date.now() });
      _fotNueva(x.url, d, d.desc || x.tit).then(function(){
        var cap=s.parentNode; s.remove(); var c=$('frd-c-'+i); if(c && c.parentNode) c.parentNode.remove();
        cap.insertAdjacentHTML('beforeend', '<span class="pill ok" style="align-self:flex-start;margin-top:6px">✓ En el registro · '+esc(fotoCatDe(L, cat).n)+'</span>');
        if(typeof VISTA.recargar==='function' && VISTA.actual==='fotoreg') VISTA.recargar();
      }, function(e){ s.disabled=false; s.textContent='Sumar al registro'; toast('No se pudo sumar. '+porQueFallo(e)); });
    };
  }, function(e){ var b=$('hoja-cuerpo'); if(b) b.innerHTML='<div class="vacio"><b>No se pudo buscar</b>'+esc(porQueFallo(e))+'</div>'; });
}

/* ═══ LOS TEMAS DE LA OBRA ═══ */
function fotTemasHoja(){
  abrirHoja('Temas del registro fotográfico', 'Los temas en el orden en que salen en el informe · es la misma lista en la app', '<div class="vacio">Cargando…</div>', '', { ancha:true, sinFoco:true });
  fotoCatP(true).then(function(L){ FRW.ed=L.map(function(c){ return { k:c.k, n:c.n, ej:c.ej, amb:c.amb }; }); _fotTemasPintar(); });
}
function _fotTemasPintar(){
  var E=FRW.ed; if(!E) return;
  $('hoja-cuerpo').innerHTML='<p class="ayuda" style="margin:0 0 12px">'+(FRW.propia ? 'Los temas propios de la obra.' : 'Son los temas sugeridos.')+' Pon los que tu obra muestra cada mes —y los que pide tu cliente—: el nombre, un ejemplo de lo que va, y si es de medio ambiente (también sale en el informe ambiental). Las fotos de un tema que se quita pasan a «Otros».</p>'+
    '<ul class="fr-temas">'+E.map(function(c, i){
      return '<li><input value="'+esc(c.n)+'" maxlength="60" data-i="'+i+'" data-c="n" aria-label="Tema"><input value="'+esc(c.ej||'')+'" maxlength="140" data-i="'+i+'" data-c="ej" placeholder="Qué fotos van" aria-label="Qué fotos van">'+
        '<label class="chk" title="Va también al informe de medio ambiente"><input type="checkbox" data-i="'+i+'" data-c="amb"'+(c.amb ? ' checked' : '')+'> <span>Ambiental</span></label>'+
        '<span class="fr-mov"><button type="button" class="bt sec chico" data-sube="'+i+'"'+(i ? '' : ' disabled')+' aria-label="Subir">↑</button><button type="button" class="bt sec chico" data-baja="'+i+'"'+(i<E.length-1 ? '' : ' disabled')+' aria-label="Bajar">↓</button>'+
        '<button type="button" class="bt sec chico" data-quitar="'+i+'" aria-label="Quitar">✕</button></span></li>'; }).join('')+'</ul>'+
    '<div class="fila-c"><div class="campo"><label for="frt-n">Otro tema</label><input id="frt-n" maxlength="60" placeholder="Trabajos en espacios confinados" autocomplete="off"></div><div class="campo" style="align-self:end"><button type="button" class="bt sec" id="frt-mas">＋ Agregar</button></div></div>'+
    '<div class="msg" id="frt-msg" role="status"></div>';
  _obsPieP('<button type="button" class="bt sec" id="frt-sug">Volver a los sugeridos</button><button type="button" class="bt ok" id="frt-ok">Guardar los temas</button>');
  var b=$('hoja-cuerpo');
  b.oninput=function(ev){ var t=ev.target, i=t.getAttribute && t.getAttribute('data-i'); if(i!=null && t.type!=='checkbox') E[+i][t.getAttribute('data-c')]=t.value; };
  b.onchange=function(ev){ var t=ev.target, i=t.getAttribute && t.getAttribute('data-i'); if(i!=null && t.type==='checkbox') E[+i].amb=t.checked; };
  b.onclick=function(ev){
    var s=ev.target.closest('[data-sube]'), j=ev.target.closest('[data-baja]'), q=ev.target.closest('[data-quitar]');
    if(s){ var i=+s.getAttribute('data-sube'); E.splice(i-1, 0, E.splice(i, 1)[0]); _fotTemasPintar(); }
    else if(j){ var k=+j.getAttribute('data-baja'); E.splice(k+1, 0, E.splice(k, 1)[0]); _fotTemasPintar(); }
    else if(q){ E.splice(+q.getAttribute('data-quitar'), 1); _fotTemasPintar(); }
  };
  $('frt-mas').onclick=function(){
    var n=String($('frt-n').value||'').replace(/\s+/g, ' ').trim().slice(0, 60); if(!n) return;
    if(E.some(function(c){ return String(c.n).toLowerCase()===n.toLowerCase(); })){ toast('Ese tema ya está.'); return; }
    E.push({ k:'t'+Date.now().toString(36), n:n, ej:'', amb:false }); _fotTemasPintar(); try{ $('frt-n').focus(); }catch(e){}
  };
  $('frt-n').onkeydown=function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); $('frt-mas').click(); } };
  $('frt-sug').onclick=function(){ FRW.ed=fotoCatLista(null); _fotTemasPintar(); };
  $('frt-ok').onclick=function(){
    var L=fotoCatLista(E), m=$('frt-msg');
    if(!L.length){ m.className='msg mal'; m.textContent='Deja al menos un tema.'; return; }
    var bt=this; bt.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
    fotoCatPonerP(L).then(function(){ toast('Temas guardados: son los mismos en la app.'); cerrarHoja(); if(typeof VISTA.recargar==='function' && VISTA.actual==='fotoreg') VISTA.recargar(); },
      function(e){ bt.disabled=false; m.className='msg mal'; m.textContent='No se pudo guardar. '+porQueFallo(e); });
  };
}
