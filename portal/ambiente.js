/* OBRASST · el portal · MEDIO AMBIENTE (19/10/2026 · lote 20)
   Lo de medio ambiente de la obra, mes por mes: los residuos que salen (con su certificado o su boleta; lo que se vende, con su
   comprobante de pago), el agua consumida (m³), el combustible con sus boletas de carga y los certificados y constancias. Se
   registra aquí o en la app (la misma hoja «amb-reg»: el módulo AMB del núcleo dice cómo se guarda). Abajo, los temas de las
   charlas del mes: de seguridad o de medio ambiente (lo decide la obra; de entrada lo dicen sus palabras). Y el informe de
   medio ambiente del mes, en «Informe › Medio ambiente» (lote 23). */
var AMBW = { obra:null, mes:'', filas:null, temas:null, mapa:null, ed:null, guardando:false, ev:[] };
function _ambCss(){
  if(document.getElementById('amb-css')) return;
  var st=document.createElement('style'); st.id='amb-css';
  st.textContent=[
    '.amb-res{display:flex; flex-wrap:wrap; gap:10px 18px; align-items:end}.amb-res .campo{margin:0}',
    '.amb-hub{display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:12px; margin:0 0 16px}',
    '.amb-t{display:flex; flex-direction:column; gap:6px; border:1px solid var(--raya); border-radius:12px; background:var(--panel); padding:14px 15px}',
    '.amb-t h3{margin:0; font-size:14.5px; color:var(--tinta); display:flex; gap:8px; align-items:center}.amb-t .v{font-size:24px; font-weight:600; color:var(--tinta); font-variant-numeric:tabular-nums}',
    '.amb-t p{margin:0; font-size:12.5px; color:var(--gris); flex:1}.amb-t .acciones{margin:4px 0 0; justify-content:flex-start}',
    '.amb-ev-l{display:flex; flex-wrap:wrap; gap:6px}.amb-ev-l a{font-size:12.5px}',
    '.amb-q{display:grid; grid-template-columns:minmax(0,1fr) 230px auto; gap:8px; align-items:center; border:1px solid var(--raya); border-radius:9px; padding:8px 10px; margin:0 0 6px; background:var(--panel)}',
    '.amb-q .n{overflow-wrap:anywhere; font-size:13.5px}.amb-q select{margin:0}',
    '.amb-tema{display:flex; gap:10px; align-items:center; padding:8px 0; border-top:1px solid var(--raya); font-size:13.5px}.amb-tema span{flex:1; min-width:0}',
    '@media (max-width:640px){ .amb-q{grid-template-columns:minmax(0,1fr)} .amb-tema{flex-wrap:wrap; gap:6px 10px} .amb-tema span{flex:1 1 100%} }'
  ].join('\n');
  document.head.appendChild(st);
}
function ambTraerP(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && AMBW.obra===oid && AMBW.filas) return Promise.resolve(AMBW.filas);
  return traerTodo('sst_doc', '&select=id,hoja,nombre,url,nota,creado&hoja=eq.'+AMB_HOJA+'&order=creado.asc', 8000).then(function(r){ AMBW.obra=oid; AMBW.filas=ambFilas(r); return AMBW.filas; });
}
/* de qué es cada tema (ambMapaP y ambMapaPonerP): en el núcleo del portal, porque también lo usa «Capacitaciones realizadas» */
/* los temas de las charlas del mes: las asistencias con QR y las capacitaciones registradas */
function ambTemasMesP(mes){
  var d0=new Date(mes+'-01T00:00:00'), y=+mes.slice(0, 4), m=+mes.slice(5, 7), d1=new Date(m===12 ? (y+1)+'-01-01T00:00:00' : y+'-'+dos(m+1)+'-01T00:00:00');
  return Promise.all([
    traer('sst_asist', '&inicio=gte.'+encodeURIComponent(d0.toISOString())+'&inicio=lt.'+encodeURIComponent(d1.toISOString())+'&select=id,tipo,tema,inicio&order=inicio.asc', 1000).catch(function(){ return []; }),
    traer('sst_doc', '&hoja=eq.ges-act&select=id,nota&order=creado.desc', 3000).catch(function(){ return []; })
  ]).then(function(r){
    var T={};
    var pon=function(tema, f, tipo){ var k=ambTemaClave(tema); if(!k) return; var x=T[k] || (T[k]={ k:k, tema:String(tema).trim(), veces:0, f:f, tipo:tipo }); x.veces++; };
    (r[0]||[]).forEach(function(s){ pon(s.tema, String(s.inicio||'').slice(0, 10), s.tipo); });
    (r[1]||[]).forEach(function(x){ var d=nota(x.nota); if(d && d.k==='cap' && String(d.fecha||'').slice(0, 7)===mes && d.tema) pon(d.tema, d.fecha, d.tipo); });
    return Object.keys(T).map(function(k){ return T[k]; }).sort(function(a, b){ return a.tema.localeCompare(b.tema, 'es'); });
  });
}
function _ambMeses(){ var out=[]; for(var j=0; j<12; j++){ var d=new Date(Date.parse(MES+'-15T12:00:00')); d.setMonth(d.getMonth()-j); out.push(d.getFullYear()+'-'+dos(d.getMonth()+1)); } return out; }
function _ambNw(n){ return (Math.round((+n||0)*100)/100).toLocaleString('es-PE'); }
function _ambLineaP(d){
  if(d.k==='res') return ambNombre(AMB_RES_TIPOS, d.tipo)+(d.cant!=null ? ' · '+_ambNw(d.cant)+' '+ambNombre(AMB_UNID, d.und) : '')+' · '+ambNombre(AMB_RES_DEST, d.dest)+(d.dest==='venta' && d.monto ? ' · S/ '+_ambNw(d.monto) : '');
  if(d.k==='agua') return 'Agua · '+(d.m3!=null ? _ambNw(d.m3)+' m³' : 'sin cantidad')+' · '+ambNombre(AMB_AGUA, d.fuente);
  if(d.k==='comb') return ambNombre(AMB_COMB, d.tipo)+(d.cant!=null ? ' · '+_ambNw(d.cant)+' '+(AMB_UND_N[d.und] || d.und) : '')+(d.equipo ? ' · '+d.equipo : '');
  if(d.k==='ener' || d.k==='refr' || d.k==='mat' || d.k==='viaje') return ambLineaHC(d, _ambNw);
  return ambNombre(AMB_DOC_TIPOS, d.tipo)+(d.nombre ? ' · '+d.nombre : '');
}

/* ═══ LA VISTA ═══ */
function vistaAmbiente(caja){
  _ambCss();
  if(!AMBW.mes) AMBW.mes=MES;
  var ac=$('acciones');
  if(ac){
    ac.innerHTML='<button type="button" class="bt sec" id="amb-hc-b">🌍 Huella de carbono</button><button type="button" class="bt sec" id="amb-inf-b">🌱 Informe de medio ambiente</button><button type="button" class="bt" id="amb-nuevo-b">＋ Registrar</button>';
    $('amb-hc-b').onclick=function(){ navegar('huella'); };
    $('amb-inf-b').onclick=function(){ window.INFW_PIDE={ tipo:'amb', mes:AMBW.mes }; navegar('inf-amb'); };
    $('amb-nuevo-b').onclick=function(){ ambFormHoja('res'); };
  }
  caja.innerHTML='<div id="amb-vista"><div class="vacio">Cargando…</div></div>';
  function pinta(){
    return Promise.all([ambTraerP(true), ambMapaP(), ambTemasMesP(AMBW.mes), hcCfgTraerP()]).then(function(r){ AMBW.mapa=r[1]; AMBW.temas=r[2]; _ambPintar(); }, function(e){ var v=$('amb-vista'); if(v) fallo(v, e); });
  }
  VISTA.recargar=pinta; pinta();
}
function _ambPintar(){
  var v=$('amb-vista'); if(!v) return;
  var L=ambDelMes(AMBW.filas||[], AMBW.mes), R=ambResumen(L), kg=0, m3=0;
  Object.keys(R.res).forEach(function(k){ kg+=R.res[k].kg; m3+=R.res[k].m3; });
  var tarj=function(k, ic, t, val, sub){ return '<section class="amb-t"><h3><span aria-hidden="true">'+ic+'</span>'+esc(t)+'</h3><div class="v">'+val+'</div><p>'+sub+'</p><div class="acciones"><button type="button" class="bt sec chico" data-nuevo="'+k+'">＋ Registrar</button></div></section>'; };
  var h='<div class="tarj"><div class="tarj-cuerpo amb-res"><div class="campo"><label for="amb-mes">El mes</label><select id="amb-mes">'+_ambMeses().map(function(m){ return '<option value="'+m+'"'+(m===AMBW.mes ? ' selected' : '')+'>'+esc(mesLargo(m))+'</option>'; }).join('')+'</select></div>'+
      '<p class="ayuda" style="margin:0;flex:1 1 380px">Lo de cada mes, con la foto o el PDF de su papel: aquí o en la app («Medio ambiente»). Sale en el informe de medio ambiente del mes, con los papeles en los anexos.'+(R.sinDoc ? ' <span class="pill mal">'+R.sinDoc+(R.sinDoc===1 ? ' registro sin su papel' : ' registros sin su papel')+'</span>' : '')+'</p></div></div>'+
    '<div class="amb-hub">'+
      tarj('res', '♻️', 'Residuos', esc(_ambNw(kg))+' kg'+(m3 ? ' · '+esc(_ambNw(m3))+' m³' : ''), R.resN+(R.resN===1 ? ' salida' : ' salidas')+(R.venta ? ' · '+R.venta+(R.venta===1 ? ' vendida' : ' vendidas') : '')+' · con su certificado o su boleta')+
      tarj('agua', '💧', 'Agua', esc(_ambNw(R.agua))+' m³', R.aguaN+(R.aguaN===1 ? ' registro' : ' registros')+' · del recibo o del medidor')+
      tarj('comb', '⛽', 'Combustible', esc(_ambNw(R.combGal))+' gal'+(R.gnv ? ' · '+esc(_ambNw(R.gnv))+' m³ GNV' : '')+(R.glpKg ? ' · '+esc(_ambNw(R.glpKg))+' kg GLP' : ''), R.combN+(R.combN===1 ? ' carga' : ' cargas')+' · con su boleta')+
      tarj('ener', '⚡', 'Electricidad', esc(_ambNw(R.kwh))+' kWh', R.enerN+(R.enerN===1 ? ' recibo' : ' recibos')+' · del recibo de luz')+
      tarj('mat', '🧱', 'Materiales e insumos', String(L.filter(function(x){ return x.d.k==='mat'; }).length), 'concreto, cemento, acero… con su guía o su factura')+
      tarj('viaje', '✈️', 'Viajes y refrigerantes', String(L.filter(function(x){ return x.d.k==='viaje' || x.d.k==='refr'; }).length), 'viajes de trabajo y recargas de refrigerante o de extintores de CO₂')+
      tarj('doc', '📄', 'Certificados y constancias', String(R.docs), 'documentos ambientales del mes')+
      (function(){ var Rh=hcCalc(L, HCW.cfg); return '<section class="amb-t" style="border-color:#4d7c0f"><h3><span aria-hidden="true">🌍</span>Huella de carbono del mes</h3><div class="v">'+esc(hcT(Rh.kg))+' t CO₂e</div><p>'+(Rh.nPend ? '⏳ '+Rh.nPend+(Rh.nPend===1 ? ' dato espera' : ' datos esperan')+' su factor oficial' : 'A1 '+esc(hcT(Rh.s[1]))+' · A2 '+esc(hcT(Rh.s[2]))+' · A3 '+esc(hcT(Rh.s[3])))+'</p><div class="acciones"><button type="button" class="bt sec chico" data-ir-hc="1">Ver la huella ›</button></div></section>'; })()+'</div>'+
    /* 3/11/2026 · Gemini (mejora 3): sacar los residuos con su certificado, pedido a las empresas autorizadas de su zona */
    (typeof pedirBarraHTML==='function' ? pedirBarraHTML({ r:'residuos', n:0, id:'pedir-residuos',
      tx:'¿Tienes residuos para sacar con su certificado (peligrosos, aceite usado, desmonte)?', bt:'Pedir el recojo a empresas autorizadas de mi zona',
      det:'Recojo de residuos con su certificado.' }) : '');
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Lo registrado en '+esc(mesLargo(AMBW.mes))+'</h2><p class="sub">Cada registro con sus papeles; se corrige o se quita desde aquí</p></div></div>'+
    (L.length ? '<div class="tabla-caja"><table><thead><tr><th>Fecha</th><th>Qué</th><th>Empresa</th><th>Papeles</th><th></th></tr></thead><tbody>'+L.slice().reverse().map(function(x){ var d=x.d;
        return '<tr><td>'+esc(fechaLarga(d.fecha))+'</td><td>'+esc(_ambLineaP(d))+(d.por ? '<span class="sub">'+esc(d.por)+'</span>' : '')+'</td><td>'+esc(d.emp || '—')+'</td>'+
          '<td><div class="amb-ev-l">'+(d.ev.length ? d.ev.map(function(e){ return '<a href="'+esc(e.u)+'" target="_blank" rel="noopener">📎 '+esc(AMB_EV_N[e.t] || e.n)+'</a>'; }).join('') : '<span class="pill ojo">sin papel</span>')+'</div></td>'+
          '<td><button type="button" class="bt sec chico" data-ed="'+esc(x.id)+'">Editar</button></td></tr>'; }).join('')+'</tbody></table></div>'
      : '<div class="vacio"><b>Nada registrado en '+esc(mesLargo(AMBW.mes))+'</b>Registra aquí o desde la app los residuos, el agua, el combustible y los certificados del mes.</div>')+'</div>';
  /* los temas de las charlas del mes */
  var T=AMBW.temas||[], M=AMBW.mapa||{};
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Los temas de las charlas de '+esc(mesLargo(AMBW.mes))+'</h2><p class="sub">De seguridad o de medio ambiente: los de medio ambiente salen en el informe ambiental con sus horas hombre de capacitación. De entrada lo dicen sus palabras; si no es así, cámbialo aquí (vale para la obra).</p></div></div><div class="tarj-cuerpo">'+
    (T.length ? T.map(function(t){ var es=ambTemaEs(t.tema, M);
      return '<div class="amb-tema"><span><b>'+esc(t.tema)+'</b> <small class="tenue">· '+t.veces+(t.veces===1 ? ' vez' : ' veces')+'</small></span><div class="chips" role="radiogroup" aria-label="De qué es «'+esc(t.tema)+'»">'+
        '<button type="button" role="radio" class="chip'+(es ? '' : ' on')+'" aria-checked="'+(!es)+'" data-tema="'+esc(t.k)+'" data-v="0">Seguridad y salud</button><button type="button" role="radio" class="chip'+(es ? ' on' : '')+'" aria-checked="'+es+'" data-tema="'+esc(t.k)+'" data-v="1">🌱 Medio ambiente</button></div></div>'; }).join('')
      : '<div class="vacio" style="padding:10px">Sin charlas registradas en el mes.</div>')+'<div class="msg" id="amb-temas-msg" role="status"></div></div></div>';
  v.innerHTML=h;
  $('amb-mes').onchange=function(){ AMBW.mes=this.value; cargando(v); ambTemasMesP(AMBW.mes).then(function(t){ AMBW.temas=t; _ambPintar(); }); };
  v.onclick=function(ev){
    var n=ev.target.closest('[data-nuevo]'), e=ev.target.closest('[data-ed]'), t=ev.target.closest('[data-tema]');
    if(ev.target.closest('[data-ir-hc]')){ navegar('huella'); return; }
    if(n){ ambFormHoja(n.getAttribute('data-nuevo')); return; }
    if(e){ var x=(AMBW.filas||[]).filter(function(y){ return String(y.id)===e.getAttribute('data-ed'); })[0]; if(x) ambFormHoja(x.d.k, x); return; }
    if(t){
      var k=t.getAttribute('data-tema'), quiere=+t.getAttribute('data-v'), tema=(T.filter(function(q){ return q.k===k; })[0] || {}).tema || k;
      var m=JSON.parse(JSON.stringify(AMBW.mapa||{}));
      if(quiere===(ambTemaAuto(tema) ? 1 : 0)) delete m[k]; else m[k]=quiere;
      var msg=$('amb-temas-msg'); msg.className='msg gris'; msg.textContent='Guardando…';
      ambMapaPonerP(m).then(function(mm){ AMBW.mapa=mm; _ambPintar(); toast(quiere ? '«'+tema+'» es de medio ambiente.' : '«'+tema+'» es de seguridad y salud.'); }, function(er){ msg.className='msg mal'; msg.textContent='No se pudo guardar. '+porQueFallo(er); });
    }
  };
}

/* ═══ REGISTRAR O CORREGIR ═══ */
function _ambChipsW(id, L, sel){ return '<div class="chips" id="'+id+'" role="radiogroup">'+L.map(function(x){ var on=(x[0]===sel); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-v="'+esc(x[0])+'">'+esc(x[1])+'</button>'; }).join('')+'</div>'; }
function _ambChipsWAl(id, alCambio){ var c=$(id); if(!c) return; c.onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; Array.prototype.forEach.call(c.querySelectorAll('.chip'), function(x){ var on=(x===b); x.className='chip'+(on ? ' on' : ''); x.setAttribute('aria-checked', on ? 'true' : 'false'); }); if(alCambio) alCambio(b.getAttribute('data-v')); }; }
function _ambChipsWV(id, def){ var b=document.querySelector('#'+id+' .chip.on'); return b ? b.getAttribute('data-v') : (def||''); }
function _ambEvTipos(k, dest){
  if(k==='res') return [['cert', 'Certificado o constancia'], ['boleta', 'Boleta o guía']].concat(dest==='venta' ? [['pago', 'Comprobante de pago']] : []);
  if(k==='agua') return [['recibo', 'Recibo'], ['foto', 'Foto del medidor']];
  if(k==='comb') return [['boleta', 'Boleta de la carga']];
  if(k==='ener') return [['recibo', 'Recibo de luz']];
  if(k==='refr') return [['boleta', 'Boleta o informe del técnico']];
  if(k==='mat') return [['boleta', 'Guía o factura']];
  if(k==='viaje') return [['boleta', 'Boleto o pasaje']];
  if(k==='eqref') return [['foto', 'Foto de la placa']];
  return [['cert', 'El documento']];
}
function ambFormHoja(k, fila){
  var d=(fila && fila.d) || {}, hoy=hoyISO(), sel=function(v, def){ return v || def; };
  AMBW.ed={ k:k, fila:fila || null }; AMBW.ev=(d.ev||[]).map(function(e){ return { u:e.u, n:e.n, t:e.t }; }); AMBW.guardando=false;
  var h='<div class="campo"><label id="ambw-k-t">Qué se registra</label>'+_ambChipsW('ambw-k', [['res', '♻️ Residuos'], ['agua', '💧 Agua'], ['comb', '⛽ Combustible'], ['ener', '⚡ Electricidad'], ['refr', '❄️ Refrigerante o extintor'], ['mat', '🧱 Materiales e insumos'], ['viaje', '✈️ Viaje de trabajo'], ['eqref', '🧊 Equipo con refrigerante'], ['doc', '📄 Certificado o constancia']], k)+'</div>';
  if(k==='res') h+='<div class="campo"><label>Qué residuo</label>'+_ambChipsW('ambw-tipo', AMB_RES_TIPOS, sel(d.tipo, 'generales'))+'</div>'+
    '<div class="campo"><label>Qué se hizo</label>'+_ambChipsW('ambw-dest', AMB_RES_DEST, sel(d.dest, 'disposicion'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-cant">Cantidad</label><input id="ambw-cant" inputmode="decimal" maxlength="10" value="'+esc(d.cant==null ? '' : d.cant)+'"></div><div class="campo"><label>Unidad</label>'+_ambChipsW('ambw-und', AMB_UNID, sel(d.und, 'kg'))+'</div></div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-emp">Empresa <span class="tenue">· la EO-RS, la recicladora o quien compra</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div>'+
      '<div class="campo" id="ambw-monto-c"'+(d.dest==='venta' ? '' : ' hidden')+'><label for="ambw-monto">Monto de la venta (S/)</label><input id="ambw-monto" inputmode="decimal" maxlength="10" value="'+esc(d.monto==null ? '' : d.monto)+'"></div></div>';
  if(k==='agua') h+='<div class="fila-c"><div class="campo"><label for="ambw-m3">Agua (m³)</label><input id="ambw-m3" inputmode="decimal" maxlength="10" value="'+esc(d.m3==null ? '' : d.m3)+'"></div><div class="campo"><label>De dónde</label>'+_ambChipsW('ambw-fuente', AMB_AGUA, sel(d.fuente, 'red'))+'</div></div>';
  if(k==='comb') h+='<div class="campo"><label>Qué combustible</label>'+_ambChipsW('ambw-tipo', AMB_COMB, sel(d.tipo, 'diesel'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-cant">Cantidad</label><input id="ambw-cant" inputmode="decimal" maxlength="9" value="'+esc(d.cant==null ? '' : d.cant)+'"></div><div class="campo"><label>Unidad</label>'+_ambChipsW('ambw-und', [['gal', 'galones'], ['L', 'litros'], ['m3', 'm³ (GNV)'], ['kg', 'kg (GLP en balón)']], sel(d.und, 'gal'))+'</div></div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-equipo">Equipo o vehículo</label><input id="ambw-equipo" maxlength="120" value="'+esc(d.equipo||'')+'"></div><div class="campo"><label for="ambw-emp">Grifo o proveedor <span class="tenue">· opcional</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div></div>';
  /* 19/11/2026 · v2: lo que pide el inventario (auditoría) */
  if(k==='comb') h+='<div class="campo"><label>Qué es</label>'+_ambChipsW('ambw-uso', [['movil', '🚜 Vehículo o máquina'], ['fijo', '⚡ Equipo fijo (grupo, compresora)']], sel(d.uso, 'movil'))+'</div>'+
    '<div class="campo"><label>De quién es</label>'+_ambChipsW('ambw-prop', [['propio', 'Propio'], ['alq_sin', 'Alquilado sin operador'], ['alq_con', 'Alquilado con operador']], sel(d.prop, 'propio'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label>Quién lo consumió</label>'+_ambChipsW('ambw-quien', [['obra', 'La obra'], ['sub', 'Una subcontrata']], d.eo ? 'sub' : 'obra')+'</div>'+
      '<div class="campo" id="ambw-eo-c"'+(d.eo ? '' : ' hidden')+'><label for="ambw-eo">La subcontrata</label><input id="ambw-eo" maxlength="120" value="'+esc(d.eo||'')+'"></div>'+
      '<div class="campo"><label for="ambw-bol">N.º de boleta <span class="tenue">· opcional</span></label><input id="ambw-bol" maxlength="40" value="'+esc(d.bol||'')+'"></div></div>';
  /* 19/11/2026 · lo que pide la huella de carbono */
  if(k==='ener') h+='<div class="fila-c"><div class="campo"><label for="ambw-kwh">Consumo del recibo (kWh)</label><input id="ambw-kwh" inputmode="decimal" maxlength="10" value="'+esc(d.kwh==null ? '' : d.kwh)+'"></div><div class="campo"><label>De dónde</label>'+_ambChipsW('ambw-fuente', AMB_ENER, sel(d.fuente, 'red'))+'</div></div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-sum">N.º de suministro <span class="tenue">· opcional</span></label><input id="ambw-sum" maxlength="60" value="'+esc(d.sum||'')+'"></div><div class="campo"><label for="ambw-emp">Empresa eléctrica <span class="tenue">· opcional</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div></div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-desde">Periodo del recibo: desde <span class="tenue">· opcional</span></label><input type="date" id="ambw-desde" value="'+esc(d.desde||'')+'"></div><div class="campo"><label for="ambw-hasta">hasta</label><input type="date" id="ambw-hasta" value="'+esc(d.hasta||'')+'"></div></div>'+
    '<p class="ayuda">¿Luz de grupo electrógeno? <button type="button" class="bt-link" id="ambw-a-comb">Va en combustible ›</button></p>';
  if(k==='refr') h+='<div class="campo"><label>Qué gas se recargó</label>'+_ambChipsW('ambw-gas', AMB_REFR, sel(d.gas, 'r410a'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-kgr">Cuánto se recargó (kg)</label><input id="ambw-kgr" inputmode="decimal" maxlength="9" value="'+esc(d.kg==null ? '' : d.kg)+'"></div><div class="campo"><label for="ambw-equipo">Equipo <span class="tenue">· aire acondicionado, cámara de frío, extintor…</span></label><input id="ambw-equipo" maxlength="120" value="'+esc(d.equipo||'')+'"></div></div>'+
    '<div class="campo"><label for="ambw-emp">Técnico o empresa <span class="tenue">· opcional</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div>'+
    '<p class="ayuda">Lo que se recarga es lo que se fugó: eso es lo que cuenta. La recarga de un extintor de CO₂ también.</p>';
  if(k==='mat'){ var mt=sel(d.tipo, 'concreto');
    h+='<div class="campo"><label>Qué material o insumo</label>'+_ambChipsW('ambw-tipo', AMB_MAT, mt)+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-cant">Cantidad <span class="tenue" id="ambw-mat-u">· en '+esc(ambMatU(mt))+'</span></label><input id="ambw-cant" inputmode="decimal" maxlength="10" value="'+esc(d.cant==null ? '' : d.cant)+'"></div>'+
      '<div class="campo"><label for="ambw-nombre">Detalle <span class="tenue">· opcional</span></label><input id="ambw-nombre" maxlength="120" value="'+esc(d.nombre||'')+'" placeholder="f\'c 210, varillas de 1/2&quot;…"></div></div>'+
    '<div class="campo"><label for="ambw-emp">Proveedor <span class="tenue">· opcional</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div>'; }
  if(k==='viaje') h+='<div class="campo"><label>Cómo se viajó</label>'+_ambChipsW('ambw-tipo', AMB_VIAJE, sel(d.tipo, 'avion_nac'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-km">Distancia de ida (km)</label><input id="ambw-km" inputmode="decimal" maxlength="8" value="'+esc(d.km==null ? '' : d.km)+'"></div><div class="campo"><label for="ambw-pers">Personas</label><input id="ambw-pers" inputmode="numeric" maxlength="3" value="'+esc(d.pers||1)+'"></div>'+
      '<div class="campo"><label class="check"><input type="checkbox" id="ambw-iv"'+(d.iv ? ' checked' : '')+'> Ida y vuelta</label></div></div>'+
    '<div class="campo"><label for="ambw-tramo">Tramo <span class="tenue">· opcional</span></label><input id="ambw-tramo" maxlength="120" value="'+esc(d.tramo||'')+'" placeholder="Lima – Arequipa"></div>'+
    '<p class="ayuda">En auto o camioneta cuenta el vehículo (no las personas). Los vehículos de la obra van en «Combustible».</p>';
  if(k==='eqref') h+='<div class="fila-c"><div class="campo"><label for="ambw-equipo">Equipo</label><input id="ambw-equipo" maxlength="120" value="'+esc(d.equipo||'')+'" placeholder="Aire acondicionado oficina 1"></div><div class="campo"><label for="ambw-ubic">Dónde está <span class="tenue">· opcional</span></label><input id="ambw-ubic" maxlength="120" value="'+esc(d.ubic||'')+'"></div></div>'+
    '<div class="campo"><label>Gas</label>'+_ambChipsW('ambw-gas', AMB_REFR, sel(d.gas, 'r410a'))+'</div>'+
    '<div class="campo"><label for="ambw-carga">Carga de placa (kg)</label><input id="ambw-carga" inputmode="decimal" maxlength="8" value="'+esc(d.carga==null ? '' : d.carga)+'"></div>';
  if(k!=='doc') h+='<div class="campo"><label>El dato</label>'+_ambChipsW('ambw-dato', [['medido', '📏 Medido'], ['estimado', '≈ Estimado']], sel(d.dato, 'medido'))+'</div>';
  if(k==='doc') h+='<div class="campo"><label>Qué es</label>'+_ambChipsW('ambw-tipo', AMB_DOC_TIPOS, sel(d.tipo, 'cert'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-nombre">El documento</label><input id="ambw-nombre" maxlength="160" value="'+esc(d.nombre||'')+'" placeholder="Certificado de disposición final de residuos de setiembre"></div><div class="campo"><label for="ambw-emp">Quién lo emite <span class="tenue">· opcional</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div></div>';
  h+='<div class="fila-c"><div class="campo"><label for="ambw-fecha">Fecha</label><input type="date" id="ambw-fecha" max="'+hoy+'" value="'+esc(d.fecha || (AMBW.mes===MES ? hoy : obsMesFin(AMBW.mes)))+'"></div><div class="campo"><label for="ambw-obs">Nota <span class="tenue">· opcional</span></label><input id="ambw-obs" maxlength="300" value="'+esc(d.obs||'')+'"></div></div>'+
    '<div class="seccion"><h3>Los papeles</h3><div id="ambw-ev"></div></div><div class="msg" id="ambw-msg" role="status"></div>';
  abrirHoja(fila ? 'Corregir el registro' : 'Registrar en medio ambiente', mesLargo(AMBW.mes), h,
    (fila ? '<button type="button" class="bt mal" id="ambw-quitar">Quitar</button>' : '')+'<button type="button" class="bt sec" id="ambw-no">Cancelar</button><button type="button" class="bt ok" id="ambw-ok">Guardar</button>', { ancha:true, sinFoco:true });
  _ambChipsWAl('ambw-k', function(v){ if(v!==k) ambFormHoja(v, null); });
  ['ambw-und', 'ambw-fuente', 'ambw-gas', 'ambw-uso', 'ambw-prop', 'ambw-dato'].forEach(function(id){ _ambChipsWAl(id); });
  _ambChipsWAl('ambw-quien', function(v){ var c=$('ambw-eo-c'); if(c) c.hidden=(v!=='sub'); });
  if($('ambw-a-comb')) $('ambw-a-comb').onclick=function(){ ambFormHoja('comb'); setTimeout(function(){ var b=document.querySelector('#ambw-uso [data-v="fijo"]'); if(b) b.click(); }, 50); };
  _ambChipsWAl('ambw-tipo', function(v){ var u=$('ambw-mat-u'); if(u) u.textContent='· en '+ambMatU(v); });
  _ambChipsWAl('ambw-dest', function(v){ var c=$('ambw-monto-c'); if(c) c.hidden=(v!=='venta'); _ambEvPintaW(); });
  _ambEvPintaW();
  $('ambw-no').onclick=cerrarHoja;
  $('ambw-ok').onclick=_ambGuardarW;
  if($('ambw-quitar')) $('ambw-quitar').onclick=function(){
    confirmar('¿Quitar este registro?', _ambLineaP(d)+'. Deja de salir en el informe de medio ambiente.', { si:'Sí, quitarlo', mal:true }).then(function(si){
      if(!si) return;
      sbDelP('sst_doc?id=eq.'+encodeURIComponent(fila.id)).then(function(rows){
        if(Array.isArray(rows) && !rows.length){ toast('No se pudo quitar: esta cuenta no puede borrar en esta obra.'); return; }
        toast('Quitado.'); cerrarHoja(); if(typeof VISTA.recargar==='function' && VISTA.actual==='ambiente') VISTA.recargar();
      }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
    });
  };
}
function _ambEvPintaW(){
  var c=$('ambw-ev'); if(!c) return;
  var tipos=_ambEvTipos(AMBW.ed.k, _ambChipsWV('ambw-dest', 'disposicion'));
  c.innerHTML=(AMBW.ev.length ? '<div class="amb-ev-l" style="margin:0 0 8px">'+AMBW.ev.map(function(e, i){ return '<span class="pill gris">📎 '+esc(AMB_EV_N[e.t] || '')+' · '+esc(e.f ? e.f.name : e.n)+' <button type="button" class="bt-link" data-quita="'+i+'">quitar</button></span>'; }).join('')+'</div>' : '')+
    '<div class="amb-q"><span class="n">Adjuntar <b>foto o PDF</b> (hasta 20 MB)</span><select id="ambw-evt" aria-label="Qué papel es">'+tipos.map(function(t){ return '<option value="'+t[0]+'">'+esc(t[1])+'</option>'; }).join('')+'</select>'+
    '<label class="bt sec chico" for="ambw-evf">＋ Elegir el archivo</label><input type="file" id="ambw-evf" accept="application/pdf,image/*" hidden></div>'+
    '<p class="ayuda">'+(AMBW.ed.k==='res' ? 'El certificado o la constancia de disposición y la boleta o la guía; si se vendió, también el comprobante de pago.' : (AMBW.ed.k==='comb' ? 'La boleta o el vale de cada carga.' : (AMBW.ed.k==='agua' ? 'El recibo, o la foto del medidor con su lectura.' : (AMBW.ed.k==='ener' ? 'El recibo de luz del mes.' : (AMBW.ed.k==='mat' ? 'La guía de remisión o la factura.' : (AMBW.ed.k==='viaje' ? 'El boleto o el pasaje.' : (AMBW.ed.k==='refr' ? 'La boleta o el informe del técnico.' : 'El documento escaneado o en PDF.')))))))+'</p>';
  $('ambw-evf').onchange=function(){
    var f=this.files && this.files[0]; this.value=''; if(!f) return;
    if(!/pdf|image\//i.test(f.type||'') && !/\.(pdf|jpe?g|png|webp)$/i.test(f.name||'')){ toast('Solo PDF o fotos.'); return; }
    if(f.size>20*1024*1024){ toast('Pesa más de 20 MB.'); return; }
    AMBW.ev.push({ f:f, t:$('ambw-evt').value }); _ambEvPintaW();
  };
  Array.prototype.forEach.call(c.querySelectorAll('[data-quita]'), function(b){ b.onclick=function(){ AMBW.ev.splice(+b.getAttribute('data-quita'), 1); _ambEvPintaW(); }; });
}
function _ambGuardarW(){
  if(AMBW.guardando) return;
  var k=AMBW.ed.k, fila=AMBW.ed.fila, m=$('ambw-msg'), v=function(id){ var e=$(id); return e ? String(e.value||'').trim() : ''; };
  var mal=function(t, foco){ m.className='msg mal'; m.textContent=t; if(foco) try{ $(foco).focus(); }catch(e){} };
  var fe=v('ambw-fecha'); if(!/^\d{4}-\d{2}-\d{2}$/.test(fe) || fe>hoyISO()) return mal('Revisa la fecha: hasta hoy.', 'ambw-fecha');
  var d={ k:k, fecha:fe, tipo:_ambChipsWV('ambw-tipo', ''), dest:_ambChipsWV('ambw-dest', 'disposicion'), und:_ambChipsWV('ambw-und', k==='comb' ? 'gal' : 'kg'), fuente:_ambChipsWV('ambw-fuente', 'red'),
          cant:v('ambw-cant'), m3:v('ambw-m3'), monto:v('ambw-monto'), emp:v('ambw-emp'), equipo:v('ambw-equipo'), nombre:v('ambw-nombre'), obs:v('ambw-obs'), por:(fila && fila.d.por) || YO.nombre || quienSoy() || '', t:Date.now(),
          kwh:v('ambw-kwh'), sum:v('ambw-sum'), gas:_ambChipsWV('ambw-gas', 'otro'), kg:v('ambw-kgr'), km:v('ambw-km'), pers:v('ambw-pers'), iv:!!($('ambw-iv') && $('ambw-iv').checked), tramo:v('ambw-tramo'),
          uso:_ambChipsWV('ambw-uso', 'movil'), prop:_ambChipsWV('ambw-prop', 'propio'), eo:(_ambChipsWV('ambw-quien', 'obra')==='sub') ? v('ambw-eo') : '', bol:v('ambw-bol'), desde:v('ambw-desde'), hasta:v('ambw-hasta'),
          carga:v('ambw-carga'), ubic:v('ambw-ubic'), dato:_ambChipsWV('ambw-dato', 'medido'), rev:(fila && fila.d.rev) || null };
  if((k==='res' || k==='comb') && ambNum(d.cant)===null) return mal('Escribe la cantidad (solo el número).', 'ambw-cant');
  if(k==='agua' && ambNum(d.m3)===null) return mal('Escribe los m³ (solo el número).', 'ambw-m3');
  if(k==='doc' && d.nombre.length<3) return mal('Escribe qué documento es.', 'ambw-nombre');
  if(k==='mat' && ambNum(d.cant)===null) return mal('Escribe la cantidad (solo el número).', 'ambw-cant');
  if(k==='ener' && ambNum(d.kwh)===null) return mal('Escribe los kWh del recibo (solo el número).', 'ambw-kwh');
  if(k==='refr' && ambNum(d.kg)===null) return mal('Escribe los kg que se recargaron (solo el número).', 'ambw-kgr');
  if(k==='viaje' && ambNum(d.km)===null) return mal('Escribe la distancia en km (solo el número).', 'ambw-km');
  if(k==='eqref' && d.equipo.length<2) return mal('Escribe qué equipo es.', 'ambw-equipo');
  if(k==='comb' && _ambChipsWV('ambw-quien', 'obra')==='sub' && d.eo.length<2) return mal('Escribe la subcontrata.', 'ambw-eo');
  if(k==='ener' && (d.desde || d.hasta) && !(d.desde && d.hasta && d.hasta>=d.desde)) return mal('Revisa el periodo del recibo: desde y hasta.', 'ambw-desde');
  /* 19/11/2026 · si cambia el dato, la revisión de antes ya no vale */
  if(fila && d.rev && JSON.stringify(ambLimpio(Object.assign({}, fila.d, { rev:null, ev:[] })))!==JSON.stringify(ambLimpio(Object.assign({}, d, { rev:null, ev:[], t:fila.d.t, por:fila.d.por })))) d.rev=null;
  var b=$('ambw-ok'); AMBW.guardando=true; b.disabled=true; m.className='msg gris'; m.textContent='Subiendo los papeles…';
  var out=[], i=0, cola=AMBW.ev.slice();
  function sube(){
    var x=cola[i++]; if(!x) return Promise.resolve();
    if(x.u){ out.push({ u:x.u, n:x.n, t:x.t }); return sube(); }
    var f=x.f, p=/^image\//i.test(f.type||'') ? achicarFoto(f, 1800, 0.85).then(function(bl){ return subirFoto('ambiente', bl, f.name || 'papel.jpg'); }) : subirArchivoP('ambiente', f);
    return p.then(function(u){ out.push({ u:u, n:String(f.name||'archivo').slice(0, 120), t:x.t }); return sube(); });
  }
  sube().then(function(){
    d.ev=out; var L=ambLimpio(d); m.textContent='Guardando…';
    var fila2={ nombre:_ambLineaP(L).slice(0, 180), url:(out[0] && out[0].u) || null, nota:JSON.stringify(L) };
    if(fila) return sbPatch('sst_doc?id=eq.'+encodeURIComponent(fila.id), fila2);
    fila2.empresa=YO.obra.id; fila2.hoja=AMB_HOJA;
    return sbPostP('sst_doc', fila2);
  }).then(function(rows){
    AMBW.guardando=false;
    if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'No se guardó: esta cuenta no puede registrar en esta obra.' });
    toast(fila ? 'Corregido.' : 'Guardado: va al informe de medio ambiente.'); cerrarHoja(); AMBW.filas=null;
    if(typeof VISTA.recargar==='function' && VISTA.actual==='ambiente') VISTA.recargar();
  }).catch(function(e){ AMBW.guardando=false; b.disabled=false; mal(e==='muy-grande' ? 'El archivo pesa más de 25 MB.' : 'No se pudo guardar. '+porQueFallo(e)); });
}

/* ═══ 19/11/2026 · LA HUELLA DE CARBONO (v2): por pestañas, con botones ══════════════════════════════════════════════════
   Marcelo: «más botones que letras, visualmente ordenado… tipo auditoría, de acuerdo a ley… nada de factor relativo: el
   oficial». Sale de «Medio ambiente» (aquí o en la app) con la tabla oficial del núcleo (HC_OFICIAL): lo que no tiene
   factor oficial queda con su dato listo y «⏳ pendiente». Pestañas: Resultado · Datos para el MINAM · Revisar ·
   Inventario · Niveles · Exportar. Lo de la obra (límites, iniciativas, verificación…) va en la hoja «hc-cfg». */
var HCW = { anio:'', mes:'', tab:'res', cfg:null, cfgId:null, todo:false, filasE:null, ed:{} };
var HC_COL = ['', '#b45309', '#0e7490', '#4d7c0f'];
function _hcCss(){
  if(document.getElementById('hc-css')) return;
  var st=document.createElement('style'); st.id='hc-css';
  st.textContent=[
    '.hc-bar{display:flex; flex-wrap:wrap; gap:8px; align-items:end}.hc-bar .campo{margin:0}',
    '.hc-tabs{display:flex; flex-wrap:wrap; gap:6px; margin:0 0 14px}.hc-tabs button{border:1px solid var(--raya); background:var(--panel); border-radius:999px; padding:8px 14px; font:inherit; font-size:13.5px; cursor:pointer; color:var(--tinta)}',
    '.hc-tabs button.on{background:var(--tinta); color:var(--panel); border-color:var(--tinta)}.hc-tabs b{font-variant-numeric:tabular-nums}',
    '.hc-top{display:grid; grid-template-columns:minmax(0,280px) minmax(0,1fr); gap:20px; align-items:center}',
    '.hc-tri svg{width:100%; height:auto; display:block}.hc-tri text{font:600 13px system-ui,sans-serif}',
    '.hc-tot{font-size:34px; font-weight:700; color:var(--tinta); font-variant-numeric:tabular-nums; line-height:1.1}.hc-tot small{font-size:14px; font-weight:500; color:var(--gris)}',
    '.hc-alc{display:flex; flex-direction:column; gap:8px; margin:12px 0 0}.hc-alc div{display:grid; grid-template-columns:14px minmax(0,1fr) auto; gap:10px; align-items:center; font-size:13.5px}',
    '.hc-alc i{width:14px; height:14px; border-radius:3px}.hc-num{text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap}',
    '.hc-pend{display:flex; gap:10px; align-items:flex-start; border:1px dashed #b45309; border-radius:10px; padding:10px 12px; margin:0 0 12px; font-size:13.5px}',
    '.hc-eq{font-family:ui-monospace,Menlo,monospace; font-size:12.5px; white-space:nowrap}',
    '.hc-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px}',
    '.hc-c{border:1px solid var(--raya); border-radius:12px; padding:14px; background:var(--panel); display:flex; flex-direction:column; gap:8px}.hc-c h3{margin:0; font-size:14.5px}.hc-c p{margin:0; font-size:12.5px; color:var(--gris)}',
    '.hc-c .chips{margin:0}.hc-c input,.hc-c select{margin:0}.hc-li{display:flex; gap:8px; align-items:center; font-size:13px; border-top:1px solid var(--raya); padding-top:6px}.hc-li span{flex:1; min-width:0; overflow-wrap:anywhere}',
    '.hc-niv{border:1px solid var(--raya); border-radius:12px; padding:14px; background:var(--panel)}.hc-niv.ok{border-color:#4d7c0f; box-shadow:inset 4px 0 0 #4d7c0f}',
    '.hc-niv h3{margin:0 0 8px; font-size:15px}.hc-niv ul{margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:5px; font-size:13px}',
    '.hc-exp{display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px}.hc-exp button{display:flex; flex-direction:column; align-items:flex-start; gap:4px; text-align:left; border:1px solid var(--raya); border-radius:12px; background:var(--panel); padding:16px; cursor:pointer; font:inherit; color:var(--tinta)}',
    '.hc-exp button b{font-size:15px}.hc-exp button small{color:var(--gris); font-size:12.5px}.hc-exp button span{font-size:24px}',
    '@media (max-width:720px){ .hc-top{grid-template-columns:minmax(0,1fr)} .hc-tri{max-width:280px} }'
  ].join('\n');
  document.head.appendChild(st);
}
function hcCfgTraerP(){
  return traer('sst_doc', '&select=id,nota&hoja=eq.'+HC_HOJA+'&order=creado.desc', 1).then(function(r){
    var f=(r||[])[0]; HCW.cfgId=f ? f.id : null; HCW.cfg=hcCfgLimpio(f ? nota(f.nota) : null); return HCW.cfg;
  }, function(){ HCW.cfgId=null; HCW.cfg=hcCfgLimpio(null); return HCW.cfg; });
}
function hcCfgGuardarP(cambio){
  var c=JSON.parse(JSON.stringify(HCW.cfg || hcCfgLimpio(null))); cambio(c);
  var L=hcCfgLimpio(c), fila={ nombre:'Huella de carbono · inventario', nota:JSON.stringify(L) };
  var p=HCW.cfgId ? sbPatch('sst_doc?id=eq.'+encodeURIComponent(HCW.cfgId), fila) : (fila.empresa=YO.obra.id, fila.hoja=HC_HOJA, sbPostP('sst_doc', fila));
  return p.then(function(rows){ if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'Esta cuenta no puede cambiar esto en esta obra.' }); return hcCfgTraerP(); });
}
/* toda la empresa: lo de cada obra de la empresa que esta cuenta ve */
function _hcObrasEmpresa(){
  var o=YO.obra||{}, raiz=o.padre_id || o.id;
  return (YO.empresas||[]).filter(function(e){ return e.id===raiz || e.padre_id===raiz; });
}
function _hcFilas(){ return HCW.todo && HCW.filasE ? HCW.filasE : (AMBW.filas||[]); }
function _hcFilasDe(anio, mes){ return hcExpandir(_hcFilas()).filter(function(x){ var f=String(x.d.fecha); return mes ? f.slice(0, 7)===mes : f.slice(0, 4)===String(anio); }).map(function(x){ return x.orig ? { id:x.id, d:x.d, yaExp:1 } : x; }); }
function _hcCalc(anio, mes){ return hcCalc(_hcFilasDe(anio, mes).map(function(x){ return { id:x.id, d:x.d.parte ? Object.assign({}, x.d, { desde:'', hasta:'' }) : x.d }; }), HCW.cfg); }
function _hcAnios(){ var a={}, y=+MES.slice(0, 4); a[y]=1; a[y-1]=1; _hcFilas().forEach(function(x){ var k=+String(x.d.fecha).slice(0, 4); if(k) a[k]=1; }); return Object.keys(a).map(Number).sort(function(p, q){ return q-p; }); }
function hcTrianguloSVG(R){
  var W=300, H=230, cx=W/2, hw=function(y){ return (y/H)*(W/2); }, out='';
  for(var i=1;i<=3;i++){
    var y0=(i-1)*H/3, y1=i*H/3, pts=[[cx-hw(y0), y0], [cx+hw(y0), y0], [cx+hw(y1), y1], [cx-hw(y1), y1]].map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');
    out+='<polygon points="'+pts+'" fill="'+HC_COL[i]+'" stroke="var(--panel, #fff)" stroke-width="3"/>';
    var ym=(y0+y1)/2+(i===1 ? 14 : 5);
    out+='<text x="'+cx+'" y="'+ym+'" text-anchor="middle" fill="#fff">'+(i===1 ? 'A1' : 'Alcance '+i)+'</text>';
    if(i>1) out+='<text x="'+cx+'" y="'+(ym+17)+'" text-anchor="middle" fill="#fff" style="font-weight:500;font-size:12px">'+esc(hcT(R.s[i]))+' t · '+Math.round(R.pct[i]*100)+' %</text>';
  }
  return '<svg viewBox="0 0 '+W+' '+(H+2)+'" role="img" aria-label="Alcance 1: '+esc(hcT(R.s[1]))+' t; alcance 2: '+esc(hcT(R.s[2]))+' t; alcance 3: '+esc(hcT(R.s[3]))+' t de CO₂ equivalente">'+out+'</svg>';
}
function vistaHuella(caja){
  _ambCss(); _hcCss();
  if(!HCW.anio) HCW.anio=MES.slice(0, 4);
  var ac=$('acciones');
  if(ac){ ac.innerHTML='<button type="button" class="bt sec" id="hc-subir-b">⬆️ Subir Excel</button><button type="button" class="bt" id="hc-reg-b">＋ Registrar</button>';
    $('hc-subir-b').onclick=hcSubirAbrir; $('hc-reg-b').onclick=function(){ AMBW.mes=MES; ambFormHoja('comb'); }; }
  caja.innerHTML='<div id="hc-vista"><div class="vacio">Cargando…</div></div>';
  function pinta(){ return Promise.all([ambTraerP(true), hcCfgTraerP(), HCW.todo ? _hcTraerEmpresa() : null]).then(function(){ _hcPintar(); }, function(e){ var v=$('hc-vista'); if(v) fallo(v, e); }); }
  VISTA.recargar=pinta; pinta();
}
function _hcTraerEmpresa(){
  var ids=_hcObrasEmpresa().map(function(e){ return e.id; });
  if(ids.length<2){ HCW.filasE=null; return Promise.resolve(null); }
  return sbGet('sst_doc?empresa=in.('+ids.map(encodeURIComponent).join(',')+')&hoja=eq.'+AMB_HOJA+'&select=id,empresa,hoja,nombre,url,nota,creado&order=creado.asc&limit=5000').then(function(r){ HCW.filasE=ambFilas(r); return HCW.filasE; });
}
function _hcPintar(){
  var v=$('hc-vista'); if(!v) return;
  var y=HCW.anio, R=_hcCalc(y, HCW.mes), hasta=(String(y)===MES.slice(0, 4)) ? +MES.slice(5, 7) : 12, rev=hcRevisar(_hcFilas(), y, hasta), cerr=HCW.cfg.cierres[y];
  var meses=[]; for(var m=1;m<=12;m++) meses.push(y+'-'+dos(m));
  var emp=_hcObrasEmpresa().length>1;
  var h='<div class="tarj"><div class="tarj-cuerpo hc-bar">'+
    '<div class="campo"><label for="hc-anio">Año</label><select id="hc-anio">'+_hcAnios().map(function(a){ return '<option'+(String(a)===String(y) ? ' selected' : '')+'>'+a+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label for="hc-mes">Periodo</label><select id="hc-mes"><option value="">Todo el año</option>'+meses.map(function(m){ return '<option value="'+m+'"'+(m===HCW.mes ? ' selected' : '')+'>'+esc(mesLargo(m))+'</option>'; }).join('')+'</select></div>'+
    (emp ? '<div class="chips" role="radiogroup" aria-label="Qué se mide"><button type="button" role="radio" class="chip'+(HCW.todo ? '' : ' on')+'" aria-checked="'+!HCW.todo+'" data-todo="0">Esta obra</button><button type="button" role="radio" class="chip'+(HCW.todo ? ' on' : '')+'" aria-checked="'+HCW.todo+'" data-todo="1">🏢 Toda la empresa</button></div>' : '')+
    (cerr ? '<span class="pill ok">🔒 '+esc(y)+' cerrado</span>' : '')+'</div></div>';
  var nRev=rev.A.filter(function(a){ return a.g==='mal'; }).length+rev.A.filter(function(a){ return a.g==='ojo'; }).length;
  var T=[['res', '📊 Resultado'], ['da', '📋 Datos para el MINAM'], ['rev', '🔎 Revisar'+(nRev ? ' <b>('+nRev+')</b>' : '')], ['inv', '🏗️ Inventario'], ['niv', '⭐ Niveles'], ['exp', '⬇️ Exportar']];
  h+='<div class="hc-tabs" role="tablist">'+T.map(function(t){ return '<button type="button" role="tab" aria-selected="'+(HCW.tab===t[0])+'" class="'+(HCW.tab===t[0] ? 'on' : '')+'" data-tab="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div>';
  h+='<div id="hc-cuerpo">'+({ res:_hcTabRes, da:_hcTabDA, rev:_hcTabRev, inv:_hcTabInv, niv:_hcTabNiv, exp:_hcTabExp }[HCW.tab] || _hcTabRes)(R, rev)+'</div>';
  v.innerHTML=h;
  $('hc-anio').onchange=function(){ HCW.anio=this.value; HCW.mes=''; _hcPintar(); };
  $('hc-mes').onchange=function(){ HCW.mes=this.value; _hcPintar(); };
  v.onclick=_hcClic;
  v.onchange=_hcCambio;
}
function _hcPendHTML(R){
  var P=[]; Object.keys(R.pend).forEach(function(k){ if(P.indexOf(R.pend[k].n)<0) P.push(R.pend[k].n); });
  if(!P.length) return '';
  return '<div class="hc-pend"><span aria-hidden="true">⏳</span><span><b>Falta el factor oficial de:</b> '+P.map(esc).join(' · ')+'. Sus datos ya están (pestaña «Datos para el MINAM»). Apenas OBRASST cargue el factor oficial, se calcula solo.</span></div>';
}
function _hcTabRes(R){
  var h=_hcPendHTML(R), per=HCW.mes ? mesLargo(HCW.mes) : HCW.anio;
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Huella de '+esc(per)+'</h2><p class="sub">t CO₂e con factor oficial · GHG Protocol · NTP ISO 14064-1</p></div></div><div class="tarj-cuerpo">';
  if(!R.n) h+='<div class="vacio"><b>Nada registrado</b><button type="button" class="bt" data-reg="comb">＋ Registrar</button></div>';
  else {
    h+='<div class="hc-top"><div class="hc-tri">'+hcTrianguloSVG(R)+'</div><div><div class="hc-tot">'+esc(hcT(R.kg))+' <small>t CO₂e'+(R.nPend ? ' · parcial' : '')+'</small></div><div class="hc-alc">'+
      HC_ALC.map(function(a){ return '<div><i style="background:'+HC_COL[a[0]]+'"></i><span><b>'+esc(a[1])+'</b> · <span class="tenue">'+esc(a[2])+'</span></span><b class="hc-num">'+esc(hcT(R.s[a[0]]))+' t</b></div>'; }).join('')+'</div></div></div>';
  }
  h+='</div></div>';
  var pf=Object.keys(R.porF).map(function(k){ return R.porF[k]; }).sort(function(a, b){ return a.s-b.s || b.kg-a.kg; });
  if(pf.length) h+='<div class="tarj"><div class="tarj-cab"><div><h2>Las ecuaciones</h2><p class="sub">Emisión = dato × factor oficial</p></div></div><div class="tabla-caja"><table><thead><tr><th>A</th><th>Fuente</th><th>Cálculo</th><th class="hc-num">t CO₂e</th><th>Fuente del factor</th></tr></thead><tbody>'+
    pf.map(function(p){ return '<tr><td>'+p.s+'</td><td>'+esc(p.n)+'</td><td class="hc-eq">'+esc(hcNum(p.cant))+' '+esc(p.u)+' × '+esc(hcNum(p.f, p.f%1 ? 2 : 0))+' = '+esc(hcNum(p.kg, 0))+' kg</td><td class="hc-num"><b>'+esc(hcT(p.kg))+'</b></td><td class="tenue">'+esc(p.fuente || '')+'</td></tr>'; }).join('')+'</tbody></table></div></div>';
  if(R.fuera.length) h+='<div class="tarj"><div class="tarj-cab"><div><h2>Aparte</h2><p class="sub">No van en Huella de Carbono Perú</p></div></div><div class="tabla-caja"><table><tbody>'+
    R.fuera.map(function(l){ return '<tr><td>'+esc(fechaLarga(l.fecha))+'</td><td>'+esc(_ambLineaP(l.d))+'</td><td class="tenue">'+esc(l.fuera)+'</td><td class="hc-num">'+(l.f!=null ? esc(hcT(l.kg))+' t' : '⏳')+'</td></tr>'; }).join('')+'</tbody></table></div></div>';
  if(!HCW.mes && R.n){
    var porM=[]; for(var m=1;m<=12;m++){ var k=HCW.anio+'-'+dos(m); porM.push({ m:k, R:_hcCalc(HCW.anio, k) }); }
    h+='<div class="tarj"><div class="tarj-cab"><div><h2>Mes a mes</h2></div></div><div class="tabla-caja"><table><thead><tr><th>Mes</th><th class="hc-num">A1</th><th class="hc-num">A2</th><th class="hc-num">A3</th><th class="hc-num">Total</th><th class="hc-num">⏳</th></tr></thead><tbody>'+
      porM.map(function(q){ return '<tr><td>'+esc(mesLargo(q.m))+'</td>'+[1, 2, 3].map(function(i){ return '<td class="hc-num">'+(q.R.s[i] ? esc(hcT(q.R.s[i])) : '—')+'</td>'; }).join('')+'<td class="hc-num"><b>'+(q.R.kg ? esc(hcT(q.R.kg)) : '—')+'</b></td><td class="hc-num">'+(q.R.nPend || '')+'</td></tr>'; }).join('')+'</tbody></table></div></div>';
  }
  return h;
}
function _hcTabDA(R){
  var h='<div class="tarj"><div class="tarj-cab"><div><h2>Datos de actividad</h2><p class="sub">Lo que se carga en la plataforma Huella de Carbono Perú, por fuente</p></div>'+
    '<div class="acciones"><button type="button" class="bt sec chico" data-copiar-da="1">📋 Copiar</button><button type="button" class="bt chico" data-exp="xls">📊 Excel</button></div></div>';
  if(!R.DA.length) return h+'<div class="vacio">Nada registrado.</div></div>';
  h+='<div class="tabla-caja"><table><thead><tr><th>A</th><th>Fuente</th><th class="hc-num">Cantidad</th><th>Unidad</th><th class="hc-num">Registros</th><th>Factor oficial</th><th>HC-Perú</th></tr></thead><tbody>';
  HC_ALC.forEach(function(a){
    R.DA.filter(function(x){ return x.s===a[0]; }).forEach(function(x){
      var F=hcFactor(x.clave, HCW.anio+'-12-31', HCW.cfg);
      h+='<tr><td>'+x.s+'</td><td>'+esc(x.n)+(x.cat==='alq' ? ' <span class="pill gris">alquilado</span>' : (x.cat==='sub' ? ' <span class="pill gris">subcontrata</span>' : ''))+'</td><td class="hc-num">'+esc(hcNum(x.cant))+'</td><td>'+esc(x.u)+'</td><td class="hc-num">'+x.reg+'</td>'+
        '<td>'+(F ? '✓ '+esc(hcNum(F.v, F.v%1 ? 2 : 0)) : '<span class="pill ojo">⏳ pendiente</span>')+'</td><td>'+(x.fuera ? '<span class="pill gris">aparte</span>' : '✓')+'</td></tr>';
    });
  });
  h+='</tbody></table></div>';
  if(R.sinDato) h+='<div class="tarj-cuerpo"><p class="msg mal" style="margin:0">'+R.sinDato+(R.sinDato===1 ? ' registro sin cantidad o sin tipo' : ' registros sin cantidad o sin tipo')+': <button type="button" class="bt-link" data-tab="rev">corregir</button></p></div>';
  return h+'</div>';
}
function _hcTabRev(R, rev){
  var h='<div class="tarj"><div class="tarj-cab"><div><h2>Revisión del año</h2><p class="sub">Lo que vería un auditor</p></div></div><div class="tarj-cuerpo">';
  if(!rev.A.length) h+='<p>✅ Sin observaciones.</p>';
  rev.A.forEach(function(a, i){ h+='<div class="hc-li"><span>'+(a.g==='mal' ? '⛔' : '⚠️')+' '+esc(a.n)+'</span>'+(a.ids.length ? '<button type="button" class="bt sec chico" data-ver-al="'+i+'">Ver</button>' : '<button type="button" class="bt sec chico" data-reg="'+(/combustible/.test(a.n) ? 'comb' : 'ener')+'">＋ Registrar</button>')+'</div>'; });
  var sinL=R.L.filter(function(l){ return l.sinDato; });
  sinL.forEach(function(l){ h+='<div class="hc-li"><span>⛔ Sin cantidad o sin tipo: '+esc(_ambLineaP(l.d))+'</span><button type="button" class="bt sec chico" data-ed="'+esc(l.id)+'">Corregir</button></div>'; });
  h+='</div></div>';
  /* los registros por revisar */
  var L=_hcFilas().filter(function(x){ return String(x.d.fecha).slice(0, 4)===String(HCW.anio) && x.d.k!=='doc' && !x.d.rev; });
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Por revisar ('+L.length+')</h2><p class="sub">Revisado = alguien comprobó el dato con su papel</p></div>'+(L.length ? '<div class="acciones"><button type="button" class="bt chico" data-rev-todo="1">✓ Revisar todos</button></div>' : '')+'</div>'+
    (L.length ? '<div class="tabla-caja"><table><tbody>'+L.slice(0, 200).map(function(x){ var d=x.d; return '<tr><td>'+esc(fechaLarga(d.fecha))+'</td><td>'+esc(_ambLineaP(d))+(d.dato==='estimado' ? ' <span class="pill ojo">estimado</span>' : '')+'</td><td>'+(d.ev.length ? '📎 '+d.ev.length : '<span class="pill ojo">sin papel</span>')+'</td>'+
      '<td><button type="button" class="bt sec chico" data-ed="'+esc(x.id)+'">Abrir</button> <button type="button" class="bt chico" data-rev="'+esc(x.id)+'">✓</button></td></tr>'; }).join('')+'</tbody></table></div>' : '<div class="vacio">✅ Todo revisado.</div>')+'</div>';
  return h;
}
function _hcTabInv(){
  var c=HCW.cfg, y=String(HCW.anio), V=c.verif[y] || {}, N=c.neutral[y] || {}, eqs=_hcFilas().filter(function(x){ return x.d.k==='eqref'; });
  var chips=function(id, L, sel){ return '<div class="chips" role="radiogroup">'+L.map(function(x){ var on=(String(x[0])===String(sel)); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+on+'" data-cfg="'+id+'" data-v="'+esc(x[0])+'">'+esc(x[1])+'</button>'; }).join('')+'</div>'; };
  var h='<div class="hc-grid">';
  h+='<section class="hc-c"><h3>🧭 Límites</h3>'+chips('lim.enf', [['operacional', 'Control operacional'], ['financiero', 'Control financiero']], c.lim.enf)+
    '<input id="hc-lim-que" maxlength="300" placeholder="Qué entra: obra, campamento, oficina de obra…" value="'+esc(c.lim.que)+'"><p>Fuera del inventario:</p>'+
    c.lim.excl.map(function(x, i){ return '<div class="hc-li"><span><b>'+esc(x.q)+'</b> · '+esc(x.m)+'</span><button type="button" class="bt-link" data-excl-x="'+i+'">quitar</button></div>'; }).join('')+
    '<div class="fila-c"><input id="hc-ex-q" maxlength="120" placeholder="Fuente"><input id="hc-ex-m" maxlength="200" placeholder="Por qué"></div><div class="acciones" style="justify-content:flex-start"><button type="button" class="bt sec chico" data-excl="1">＋ Agregar</button><button type="button" class="bt chico" data-lim-ok="1">Guardar</button></div></section>';
  h+='<section class="hc-c"><h3>❄️ Equipos con refrigerante ('+eqs.length+')</h3>'+eqs.map(function(x){ return '<div class="hc-li"><span>'+esc(x.d.equipo)+' · '+esc(ambNombre(AMB_REFR, x.d.gas))+(x.d.carga!=null ? ' · '+esc(hcNum(x.d.carga))+' kg' : '')+'</span><button type="button" class="bt-link" data-ed="'+esc(x.id)+'">editar</button></div>'; }).join('')+
    '<div class="acciones" style="justify-content:flex-start"><button type="button" class="bt sec chico" data-reg="eqref">＋ Equipo</button><button type="button" class="bt sec chico" data-reg="refr">＋ Recarga</button></div></section>';
  h+='<section class="hc-c"><h3>📈 Indicador</h3>'+chips('ind', [['tco2', 't CO₂e'], ['hht', 'por 1 000 HHT'], ['m2', 'por m²'], ['m3c', 'por m³ de concreto']], c.ind)+
    ((c.ind==='hht' || c.ind==='m2') ? '<div class="campo"><label for="hc-indv">'+(c.ind==='hht' ? 'HHT' : 'm² construidos')+' de '+esc(y)+'</label><input id="hc-indv" inputmode="decimal" value="'+esc(c.indV[y] || '')+'"></div><button type="button" class="bt chico" data-indv="1">Guardar</button>' : '')+
    '<div class="fila-c"><div class="campo"><label for="hc-base">Año base</label><input id="hc-base" inputmode="numeric" maxlength="4" value="'+esc(c.base || '')+'"></div><div class="campo"><label for="hc-meta">Meta −%</label><input id="hc-meta" inputmode="decimal" maxlength="5" value="'+esc(c.meta || '')+'"></div></div><button type="button" class="bt sec chico" data-base="1">Guardar</button></section>';
  h+='<section class="hc-c"><h3>💡 Iniciativas de reducción</h3>'+c.inic.map(function(x, i){ return '<div class="hc-li"><span><b>'+esc(x.q)+'</b>'+(x.r ? ' · '+esc(x.r) : '')+(x.f ? ' · '+esc(fechaLarga(x.f)) : '')+(x.t ? ' · −'+esc(hcNum(x.t))+' t' : '')+'</span><button type="button" class="bt-link" data-inic-x="'+i+'">quitar</button></div>'; }).join('')+
    '<input id="hc-in-q" maxlength="160" placeholder="Qué: luminarias LED, grupo más eficiente…"><div class="fila-c"><input id="hc-in-r" maxlength="80" placeholder="Responsable"><input type="date" id="hc-in-f"><input id="hc-in-t" inputmode="decimal" placeholder="t ahorradas"></div><button type="button" class="bt sec chico" data-inic="1">＋ Agregar</button></section>';
  h+='<section class="hc-c"><h3>✅ Verificación '+esc(y)+'</h3><p>Verificador acreditado por INACAL (NTP ISO 14065)</p><input id="hc-v-oec" maxlength="120" placeholder="Verificador" value="'+esc(V.oec || '')+'"><div class="fila-c"><input type="date" id="hc-v-f" value="'+esc(V.f || '')+'"><input id="hc-v-u" placeholder="Enlace del certificado" value="'+esc(V.u || '')+'"></div><button type="button" class="bt chico" data-verif="1">Guardar</button></section>';
  h+='<section class="hc-c"><h3>🌳 Neutralización '+esc(y)+'</h3><input id="hc-n-t" inputmode="decimal" placeholder="t CO₂e compensadas" value="'+esc(N.t || '')+'"><input id="hc-n-q" maxlength="160" placeholder="Proyecto (autorizado en el Perú)" value="'+esc(N.q || '')+'"><input id="hc-n-u" placeholder="Enlace del certificado" value="'+esc(N.u || '')+'"><button type="button" class="bt chico" data-neutral="1">Guardar</button></section>';
  h+='<section class="hc-c"><h3>⚖️ Sanciones pendientes</h3><p>Con alguna, el MINAM no da el reconocimiento</p>'+[['oefa', 'OEFA'], ['osinfor', 'OSINFOR'], ['penal', 'Delito ambiental (1.ª instancia)']].map(function(k){ return '<div class="hc-li"><span>'+esc(k[1])+'</span>'+chips('sanc.'+k[0], [['0', 'No'], ['1', 'Sí']], c.sanc[k[0]] ? '1' : '0')+'</div>'; }).join('')+'</section>';
  var cerr=c.cierres[y];
  h+='<section class="hc-c"><h3>🔒 Cerrar '+esc(y)+'</h3><p>Guarda los factores con los que se calculó: no cambian después</p>'+(cerr ? '<p>Cerrado el '+esc(fechaLarga(cerr.fe))+(cerr.q ? ' · '+esc(cerr.q) : '')+'</p><button type="button" class="bt sec chico" data-cerrar="0">Reabrir</button>' : '<button type="button" class="bt chico" data-cerrar="1">🔒 Cerrar el año</button>')+'</section>';
  return h+'</div><div class="msg" id="hc-msg" role="status"></div>';
}
function _hcTabNiv(R){
  var c=HCW.cfg, y=String(HCW.anio), Ry=_hcCalc(y, ''), Rp=_hcCalc(+y-1, ''), rev=hcRevisar(_hcFilas(), y, (y===MES.slice(0, 4)) ? +MES.slice(5, 7) : 12), N=hcNiveles(_hcFilas(), c, y, Ry, Rp, rev);
  var it=function(ok, t){ return '<li>'+(ok ? '✅' : '⬜')+' '+t+'</li>'; };
  var h=N.bloqueo ? '<div class="hc-pend" style="border-color:#c6323a"><span>⛔</span><span>Con una sanción pendiente (OEFA, OSINFOR o delito ambiental), el MINAM no otorga el reconocimiento.</span></div>' : '';
  h+='<div class="hc-grid">';
  h+='<div class="hc-niv'+(N.n[1] ? ' ok' : '')+'"><h3>Nivel 1 · Medir</h3><ul>'+it(Ry.n>0, 'Datos de '+esc(y))+it(!N.falta1, 'Todos los meses con combustible y luz')+it(!Ry.sinDato, 'Ningún registro sin cantidad')+it(!!c.lim.que, 'Límites definidos')+'</ul></div>';
  h+='<div class="hc-niv'+(N.n[2] ? ' ok' : '')+'"><h3>Nivel 2 · Verificar</h3><ul>'+it(N.n[1], 'Nivel 1')+it(!!c.verif[y], 'Certificado de un verificador acreditado (INACAL)')+it(!rev.sinRev, 'Todos los datos revisados')+'</ul></div>';
  h+='<div class="hc-niv'+(N.n[3] ? ' ok' : '')+'"><h3>Nivel 3 · Reducir</h3><ul>'+it(!!c.verif[y] && !!c.verif[+y-1], 'Verificado '+(+y-1)+' y '+esc(y))+it(N.inic>0, 'Al menos una iniciativa en '+esc(y))+
    it(N.iy!=null && N.ip!=null && N.iy<N.ip, 'El indicador baja'+(N.iy!=null && N.ip!=null ? ' ('+esc(hcNum(N.ip, 3))+' → '+esc(hcNum(N.iy, 3))+')' : ''))+'</ul></div>';
  h+='<div class="hc-niv'+(N.n[4] ? ' ok' : '')+'"><h3>Nivel 4 · Reducción +</h3><ul>'+it(N.n[3], 'Nivel 3')+it(!!(c.niv3 && c.niv3[+y-1]), 'Nivel 3 también en '+(+y-1))+it(!!N.neu && N.neu.t*1000>=Ry.kg, 'O neutralizar todo lo emitido')+'</ul></div>';
  h+='</div><p class="ayuda">Guía de la herramienta Huella de Carbono Perú (RM 185-2021-MINAM). Se postula en la plataforma del MINAM; aquí se ve qué falta.</p>';
  return h;
}
function _hcTabExp(){
  var b=function(k, ic, t, s){ return '<button type="button" data-exp="'+k+'"><span aria-hidden="true">'+ic+'</span><b>'+t+'</b><small>'+s+'</small></button>'; };
  return '<div class="hc-exp">'+b('xls', '📊', 'Archivo verde', 'Excel: resultado, datos, ecuaciones, factores, revisión')+b('mem', '📄', 'Memoria de cálculo', 'PDF para el verificador')+
    b('zip', '🗂️', 'Paquete del verificador', 'ZIP: memoria, Excel y la lista de papeles')+b('plant', '⬇️', 'Plantilla', 'Excel para llenar')+b('subir', '⬆️', 'Subir datos', 'La plantilla llena')+'</div>'+
    '<div class="tarj" style="margin-top:14px"><div class="tarj-cab"><div><h2>Factores oficiales</h2><p class="sub">Los carga OBRASST, con su documento. La obra no los cambia.</p></div></div><div class="tabla-caja"><table><thead><tr><th>Fuente</th><th class="hc-num">kg CO₂e</th><th>Por</th><th>Documento</th></tr></thead><tbody>'+
    Object.keys(HC_CLAVE_N).map(function(k){ var F=hcFactor(k, HCW.anio+'-12-31', HCW.cfg); return '<tr><td>'+esc(HC_CLAVE_N[k])+'</td><td class="hc-num">'+(F ? esc(hcNum(F.v, F.v%1 ? 2 : 0)) : '⏳')+'</td><td>'+(F ? esc(F.u) : '')+'</td><td class="tenue">'+(F ? esc(F.f) : 'Pendiente del documento oficial')+'</td></tr>'; }).join('')+'</tbody></table></div></div>';
}
function _hcMsg(t, mal){ var m=$('hc-msg'); if(m){ m.className='msg'+(mal ? ' mal' : ''); m.textContent=t; } else toast(t); }
function _hcGuardar(cambio, ok){ return hcCfgGuardarP(cambio).then(function(){ toast(ok || 'Guardado.'); _hcPintar(); }, function(e){ _hcMsg('No se pudo guardar. '+porQueFallo(e), true); }); }
function _hcVal(id){ var e=$(id); return e ? String(e.value||'').trim() : ''; }
function _hcClic(ev){
  var t=ev.target.closest('button'); if(!t) return;
  var g=function(a){ return t.getAttribute(a); };
  if(g('data-tab')){ HCW.tab=g('data-tab'); _hcPintar(); return; }
  if(g('data-todo')!=null){ HCW.todo=g('data-todo')==='1'; var v=$('hc-vista'); if(HCW.todo && !HCW.filasE){ cargando(v); _hcTraerEmpresa().then(_hcPintar, function(){ HCW.todo=false; toast('No se pudo traer las otras obras.'); _hcPintar(); }); } else _hcPintar(); return; }
  if(g('data-reg')){ AMBW.mes=MES; ambFormHoja(g('data-reg')); return; }
  if(g('data-ed')){ var x=_hcFilas().filter(function(y){ return String(y.id)===g('data-ed'); })[0]; if(x){ AMBW.mes=String(x.d.fecha).slice(0, 7); ambFormHoja(x.d.k, x); } return; }
  if(g('data-ver-al')!=null){ var rv=hcRevisar(_hcFilas(), HCW.anio, 12).A[+g('data-ver-al')]; if(rv && rv.ids[0]){ var x2=_hcFilas().filter(function(y){ return String(y.id)===String(rv.ids[0]); })[0]; if(x2){ AMBW.mes=String(x2.d.fecha).slice(0, 7); ambFormHoja(x2.d.k, x2); } } return; }
  if(g('data-rev')){ _hcRevisarIds([g('data-rev')]); return; }
  if(g('data-rev-todo')){ var ids=_hcFilas().filter(function(x){ return String(x.d.fecha).slice(0, 4)===String(HCW.anio) && x.d.k!=='doc' && !x.d.rev; }).map(function(x){ return x.id; });
    confirmar('¿Marcar '+ids.length+' como revisados?', 'Quiere decir que alguien comprobó cada dato con su papel.', { si:'Sí, revisados' }).then(function(si){ if(si) _hcRevisarIds(ids); }); return; }
  if(g('data-copiar-da')){ var R=_hcCalc(HCW.anio, HCW.mes), tx='Alcance\tFuente\tCantidad\tUnidad\tRegistros\n'+R.DA.map(function(x){ return [x.s, x.n, String(Math.round(x.cant*1000)/1000).replace('.', ','), x.u, x.reg].join('\t'); }).join('\n');
    try{ navigator.clipboard.writeText(tx).then(function(){ toast('Copiado: pégalo en Excel o en la plataforma.'); }, function(){ toast('No se pudo copiar.'); }); }catch(e){ toast('No se pudo copiar.'); } return; }
  if(g('data-exp')){ var k=g('data-exp'); if(k==='xls') hcExcel(); else if(k==='mem') hcMemoria(); else if(k==='zip') hcPaquete(); else if(k==='plant') hcPlantilla(); else if(k==='subir') hcSubirAbrir(); return; }
  if(g('data-cfg')){ var cl=g('data-cfg'), val=g('data-v');
    _hcGuardar(function(c){ if(cl==='lim.enf') c.lim.enf=val; else if(cl==='ind') c.ind=val; else if(cl.indexOf('sanc.')===0) c.sanc[cl.slice(5)]=(val==='1'); }); return; }
  if(g('data-excl')){ var q=_hcVal('hc-ex-q'), m=_hcVal('hc-ex-m'); if(!q || !m){ _hcMsg('Escribe la fuente y por qué queda fuera.', true); return; } _hcGuardar(function(c){ c.lim.que=_hcVal('hc-lim-que'); c.lim.excl.push({ q:q, m:m }); }); return; }
  if(g('data-excl-x')!=null){ _hcGuardar(function(c){ c.lim.excl.splice(+g('data-excl-x'), 1); }); return; }
  if(g('data-lim-ok')){ _hcGuardar(function(c){ c.lim.que=_hcVal('hc-lim-que'); }); return; }
  if(g('data-indv')){ _hcGuardar(function(c){ c.indV[HCW.anio]=_hcVal('hc-indv').replace(',', '.'); }); return; }
  if(g('data-base')){ _hcGuardar(function(c){ c.base=_hcVal('hc-base'); c.meta=_hcVal('hc-meta').replace(',', '.'); }); return; }
  if(g('data-inic')){ var iq=_hcVal('hc-in-q'); if(!iq){ _hcMsg('Escribe la iniciativa.', true); return; } _hcGuardar(function(c){ c.inic.push({ q:iq, r:_hcVal('hc-in-r'), f:_hcVal('hc-in-f'), t:_hcVal('hc-in-t').replace(',', '.') }); }); return; }
  if(g('data-inic-x')!=null){ _hcGuardar(function(c){ c.inic.splice(+g('data-inic-x'), 1); }); return; }
  if(g('data-verif')){ var oec=_hcVal('hc-v-oec'); _hcGuardar(function(c){ if(oec) c.verif[HCW.anio]={ oec:oec, f:_hcVal('hc-v-f'), u:_hcVal('hc-v-u') }; else delete c.verif[HCW.anio]; }); return; }
  if(g('data-neutral')){ var nt=_hcVal('hc-n-t'); _hcGuardar(function(c){ if(nt) c.neutral[HCW.anio]={ t:nt.replace(',', '.'), q:_hcVal('hc-n-q'), u:_hcVal('hc-n-u') }; else delete c.neutral[HCW.anio]; }); return; }
  if(g('data-cerrar')){ var y=String(HCW.anio);
    if(g('data-cerrar')==='1') confirmar('¿Cerrar '+y+'?', 'Los factores de hoy quedan guardados con ese año. Lo que registres después en '+y+' se calcula con ellos.', { si:'Cerrar' }).then(function(si){ if(si) _hcGuardar(function(c){ c.cierres[y]={ f:hcFotoFactores(y), fe:hoyISO(), q:YO.nombre || '' }; var Ry=_hcCalc(y, ''), Rp=_hcCalc(+y-1, ''); var N=hcNiveles(_hcFilas(), c, y, Ry, Rp, hcRevisar(_hcFilas(), y, 12)); if(N.n[3]){ c.niv3=c.niv3 || {}; c.niv3[y]=1; } }, y+' cerrado.'); });
    else confirmar('¿Reabrir '+y+'?', 'Se calcula otra vez con la tabla oficial vigente.', { si:'Reabrir', mal:true }).then(function(si){ if(si) _hcGuardar(function(c){ delete c.cierres[y]; }, y+' reabierto.'); });
    return; }
}
function _hcCambio(){}
function _hcRevisarIds(ids){
  var por=YO.nombre || quienSoy() || 'Revisor', f=hoyISO(), i=0, L=_hcFilas();
  (function sig(){
    if(i>=ids.length){ toast(ids.length===1 ? 'Revisado.' : ids.length+' revisados.'); AMBW.filas=null; HCW.filasE=null; VISTA.recargar && VISTA.recargar(); return; }
    var id=ids[i++], x=L.filter(function(y){ return String(y.id)===String(id); })[0]; if(!x) return sig();
    var d=Object.assign({}, x.d, { rev:{ q:por, f:f } });
    sbPatch('sst_doc?id=eq.'+encodeURIComponent(id), { nota:JSON.stringify(ambLimpio(d)) }).then(sig, function(e){ toast('No se pudo marcar. '+porQueFallo(e)); });
  })();
}

/* ── el «archivo verde» en Excel ── */
function _hcLibros(){ return Promise.all([cargarEvPDF(), cargarInforme()]); }
function _hcExcelBlob(){
  var X=RCAP.xlsx, S=_infXlsEstilos(X), y=HCW.anio, per=HCW.mes ? mesLargo(HCW.mes) : 'Año '+y, R=_hcCalc(y, HCW.mes), H=[], h, fr, cfg=HCW.cfg;
  var obra=HCW.todo ? (empresaDeObraP() || nombreObraP()) + ' (toda la empresa)' : nombreObraP()||'Obra', sub=[obra, per].filter(Boolean).join(' · '), t=function(kg){ return Math.round(kg)/1000; };
  h=new X.Hoja('Resultado'); h.activa=true; h.pie='Huella de carbono'; fr=_infXlsCab(h, S, 'Huella de carbono · t CO₂e por alcance', 4, sub);
  var filas=[];
  HC_ALC.forEach(function(a){
    filas.push({ g:a[1]+' · '+a[2] });
    HC_CAT.filter(function(c){ return c[1]===a[0] && R.cats[c[0]]; }).forEach(function(c){ var q=R.cats[c[0]]; filas.push([a[1], q.n, q.reg, t(q.kg), R.kg ? q.kg/R.kg : 0]); });
    filas.push({ v:['Total '+a[1].toLowerCase(), '', '', t(R.s[a[0]]), R.pct[a[0]]], t:'sub' });
  });
  filas.push({ v:['Total con factor oficial', '', '', t(R.kg), R.kg ? 1 : 0], t:'tot' });
  fr=_infXlsTabla(h, S, fr, [['Alcance', 14, 'tx'], ['Fuente', 48, 'tx'], ['Registros', 11, 'n'], ['t CO₂e', 14, 'd2'], ['%', 10, 'p']], filas, X);
  var P=Object.keys(R.pend).map(function(k){ return R.pend[k].n; });
  h.unir(0, fr, 4, fr, (P.length ? 'Falta el factor oficial de: '+P.join(', ')+'. ' : '')+'Emisión = dato × factor oficial. GHG Protocol · NTP ISO 14064-1. Generado con OBRASST el '+fechaLarga(hoyISO())+'.', S.ley); h.altos[fr]=32;
  H.push(h);
  h=new X.Hoja('Datos para el MINAM'); h.pie='Huella de carbono'; fr=_infXlsCab(h, S, 'Datos de actividad por fuente', 6, sub);
  fr=_infXlsTabla(h, S, fr, [['Alcance', 9, 'n'], ['Fuente', 40, 'tx'], ['Cantidad', 14, 'd2'], ['Unidad', 14, 'tx'], ['Registros', 10, 'n'], ['Factor oficial', 14, 'tx'], ['Huella de Carbono Perú', 20, 'tx']],
    R.DA.map(function(x){ var F=hcFactor(x.clave, y+'-12-31', cfg); return [x.s, x.n+(x.cat==='alq' ? ' (alquilado con operador)' : (x.cat==='sub' ? ' (subcontrata)' : '')), Math.round(x.cant*1000)/1000, x.u, x.reg, F ? String(F.v) : 'pendiente', x.fuera ? 'aparte' : 'sí']; }), X);
  H.push(h);
  h=new X.Hoja('Ecuaciones'); h.pie='Huella de carbono'; fr=_infXlsCab(h, S, 'Emisión = dato × factor oficial', 6, sub);
  fr=_infXlsTabla(h, S, fr, [['Alcance', 9, 'n'], ['Fuente', 34, 'tx'], ['Dato', 14, 'd2'], ['Unidad', 14, 'tx'], ['Factor (kg CO₂e por unidad)', 16, 'd2'], ['kg CO₂e', 14, 'd2'], ['Fuente del factor', 44, 'tx']],
    Object.keys(R.porF).map(function(k){ return R.porF[k]; }).map(function(p){ return [p.s, p.n, Math.round(p.cant*1000)/1000, p.u, p.f, Math.round(p.kg*100)/100, p.fuente || '']; }), X);
  H.push(h);
  h=new X.Hoja('Registros'); h.pie='Huella de carbono'; fr=_infXlsCab(h, S, 'Cada registro', 9, sub);
  fr=_infXlsTabla(h, S, fr, [['Fecha', 12, 'f'], ['Alcance', 9, 'n'], ['Qué', 50, 'tx'], ['Cantidad', 12, 'd2'], ['Unidad', 13, 'tx'], ['kg CO₂e', 12, 'tx'], ['Dato', 11, 'tx'], ['Revisado', 22, 'tx'], ['Boleta / suministro', 18, 'tx'], ['Papeles', 28, 'tx']],
    R.L.map(function(l){ var d=l.d; return [l.fecha, l.s, _ambLineaP(d), l.cant==null ? '' : Math.round(l.cant*100)/100, l.u || '', l.sinDato ? 'sin dato' : (l.pend ? 'pendiente' : (l.fuera ? 'aparte' : String(Math.round(l.kg*100)/100))), d.dato || '', d.rev ? d.rev.q+' · '+d.rev.f : '', d.bol || d.sum || '', d.ev.map(function(e){ return AMB_EV_N[e.t]; }).join(', ')]; }), X);
  H.push(h);
  var rev=hcRevisar(_hcFilas(), y, 12);
  h=new X.Hoja('Revisión'); h.pie='Huella de carbono'; fr=_infXlsCab(h, S, 'Revisión del año', 1, sub);
  fr=_infXlsTabla(h, S, fr, [['Gravedad', 12, 'tx'], ['Observación', 90, 'tx']], rev.A.length ? rev.A.map(function(a){ return [a.g==='mal' ? 'Corregir' : 'Revisar', a.n]; }) : [['—', 'Sin observaciones']], X);
  H.push(h);
  h=new X.Hoja('Factores oficiales'); h.pie='Huella de carbono'; fr=_infXlsCab(h, S, 'Los factores oficiales', 3, sub);
  fr=_infXlsTabla(h, S, fr, [['Fuente', 40, 'tx'], ['kg CO₂e', 12, 'tx'], ['Por', 12, 'tx'], ['Documento', 60, 'tx']], Object.keys(HC_CLAVE_N).map(function(k){ var F=hcFactor(k, y+'-12-31', cfg); return [HC_CLAVE_N[k], F ? String(F.v) : 'pendiente', F ? F.u : '', F ? F.f+(F.cerrado ? ' (guardado al cerrar '+y+')' : '') : 'Pendiente del documento oficial']; }), X);
  H.push(h);
  return X.libro(H, S.E, 'Huella de carbono · '+obra);
}
function _hcNombre(t){ return nombreArchivo(t+' - '+(HCW.todo ? (empresaDeObraP() || nombreObraP()) : nombreObraP())+' - '+(HCW.mes || HCW.anio)); }
function hcExcel(){ _hcLibros().then(function(){ bajarBlob(_hcExcelBlob(), _hcNombre('Huella de carbono')+'.xlsx'); }, function(){ toast('No se pudo armar el Excel. Revisa tu conexión.'); }); }
/* ── la memoria de cálculo, para el verificador ── */
function _hcMemoriaPdf(){
  var y=HCW.anio, R=_hcCalc(y, HCW.mes), c=HCW.cfg, obra=HCW.todo ? (empresaDeObraP() || nombreObraP()) : (nombreObraP()||'Obra'), per=HCW.mes ? mesLargo(HCW.mes) : 'Año '+y;
  var P=_infDocNuevo(obra, 'Memoria de cálculo · huella de carbono · '+per), doc=P.doc, W=P.W, M=P.M, q=function(s){ return String(s==null ? '' : s).replace(/₂/g, '2'); };
  P.compacto=true;
  P.sec('Memoria de cálculo de la huella de carbono');
  P.nota(q('Organización: '+obra+' · '+(empresaDeObraP()||'')+'. Periodo: '+per+'. Normas: GHG Protocol, NTP ISO 14064-1:2020; guía de la herramienta Huella de Carbono Perú (RM 185-2021-MINAM). Emitido el '+fechaLarga(hoyISO())+'.'));
  P.tabla('1. Límites', ['', ''], [['Enfoque', c.lim.enf==='financiero' ? 'Control financiero' : 'Control operacional'], ['Qué entra', c.lim.que || '—']].concat(c.lim.excl.map(function(x){ return ['Fuera: '+x.q, x.m]; })), [160, W-2*M-160]);
  P.nota(q('2. Fórmula: emisión (kg CO2e) = dato de actividad × factor oficial (kg CO2e por unidad). Los factores son los oficiales cargados por OBRASST con su documento; lo que no tiene factor oficial queda pendiente y no se suma.'));
  P.tabla('3. Datos de actividad', ['A', 'Fuente', 'Cantidad', 'Unidad', 'Registros'], R.DA.map(function(x){ return [x.s, q(x.n), hcNum(x.cant), q(x.u), x.reg]; }), [26, W-2*M-266, 90, 90, 60], { num:{ 2:1, 4:1 } });
  P.tabla('4. Cálculo', ['A', 'Fuente', 'Ecuación', 't CO2e'], Object.keys(R.porF).map(function(k){ var p=R.porF[k]; return [p.s, q(p.n), q(hcNum(p.cant)+' '+p.u+' × '+hcNum(p.f, p.f%1 ? 2 : 0)+' = '+hcNum(p.kg, 0)+' kg'), hcT(p.kg)]; }), [26, 150, W-2*M-246, 70], { num:{ 3:1 }, vacio:'Sin fuentes con factor oficial.' });
  var fil=[]; HC_ALC.forEach(function(a){ fil.push([q(a[1]), hcT(R.s[a[0]]), Math.round(R.pct[a[0]]*100)+' %']); }); fil.push({ v:['Total con factor oficial', hcT(R.kg), '100 %'], t:'tot' });
  P.tabla('5. Resultado (t CO2e)', ['Alcance', 't CO2e', '%'], fil, [W-2*M-160, 90, 70], { num:{ 1:1, 2:1 } });
  var Pn=Object.keys(R.pend).map(function(k){ var p=R.pend[k]; return [p.s, q(p.n), hcNum(p.cant), q(p.u)]; });
  if(Pn.length) P.tabla('6. Pendiente del factor oficial (no sumado)', ['A', 'Fuente', 'Cantidad', 'Unidad'], Pn, [26, W-2*M-226, 110, 90], { num:{ 2:1 } });
  if(R.fuera.length) P.tabla('7. Aparte (no va en Huella de Carbono Perú)', ['Fecha', 'Registro', 'Motivo'], R.fuera.map(function(l){ return [l.fecha, q(_ambLineaP(l.d)), q(l.fuera)]; }), [62, 220, W-2*M-282]);
  P.tabla('8. Factores usados', ['Fuente', 'kg CO2e', 'Por', 'Documento'], Object.keys(R.porF).map(function(k){ var p=R.porF[k]; return [q(p.n), hcNum(p.f, p.f%1 ? 2 : 0), q(p.u), q(p.fuente || '')]; }), [150, 60, 60, W-2*M-270], { num:{ 1:1 } });
  var rev=hcRevisar(_hcFilas(), y, 12);
  P.tabla('9. Revisión', ['', 'Observación'], rev.A.length ? rev.A.map(function(a){ return [a.g==='mal' ? 'Corregir' : 'Revisar', q(a.n)]; }) : [['—', 'Sin observaciones']], [70, W-2*M-70]);
  if(c.inic.length) P.tabla('10. Iniciativas de reducción', ['Iniciativa', 'Responsable', 'Fecha', 't'], c.inic.map(function(x){ return [q(x.q), q(x.r), x.f, x.t!=null ? hcNum(x.t) : '']; }), [W-2*M-250, 110, 80, 60]);
  P.nota(q('Verificación '+y+': '+(c.verif[y] ? c.verif[y].oec+(c.verif[y].f ? ' · '+c.verif[y].f : '') : 'pendiente')+'. '+(c.cierres[y] ? 'Año cerrado el '+c.cierres[y].fe+': los factores quedaron guardados.' : 'Año abierto.')));
  return doc;
}
function hcMemoria(){ _hcLibros().then(_infLibPdf).then(function(){ bajarBlob(_hcMemoriaPdf().output('blob'), _hcNombre('Memoria de calculo huella')+'.pdf'); }, function(e){ toast('No se pudo armar la memoria: '+((e && e.message) || e)); }); }
/* ── el paquete del verificador: la memoria, el Excel y la lista de papeles con su enlace ── */
function hcPaquete(){
  _hcLibros().then(_infLibPdf).then(function(){
    var R=_hcCalc(HCW.anio, HCW.mes), pap=['Fecha;Registro;Papel;Enlace'];
    R.L.forEach(function(l){ (l.d.ev||[]).forEach(function(e){ pap.push([l.fecha, '"'+_ambLineaP(l.d).replace(/"/g, "'")+'"', AMB_EV_N[e.t] || 'Papel', e.u].join(';')); }); });
    return Promise.all([_hcExcelBlob().arrayBuffer(), Promise.resolve(_hcMemoriaPdf().output('arraybuffer'))]).then(function(b){
      var zip=_infZip([{ n:'1 Memoria de calculo.pdf', b:new Uint8Array(b[1]) }, { n:'2 Archivo verde.xlsx', b:new Uint8Array(b[0]) }, { n:'3 Papeles (enlaces).csv', x:'﻿'+pap.join('\r\n') }], 'application/zip');
      bajarBlob(zip, _hcNombre('Paquete del verificador')+'.zip');
    });
  }).catch(function(e){ toast('No se pudo armar el paquete: '+((e && e.message) || e)); });
}

/* ── la plantilla para subir los datos de una vez, y subirla llena ── */
var HC_PL_QUE = [['comb', 'Combustible'], ['ener', 'Electricidad'], ['refr', 'Refrigerante'], ['mat', 'Material'], ['agua', 'Agua'], ['res', 'Residuo'], ['viaje', 'Viaje']];
function hcPlantilla(){
  _hcLibros().then(function(){
    var X=RCAP.xlsx, S=_infXlsEstilos(X), h=new X.Hoja('Datos'), fr;
    h.activa=true; h.pie='Plantilla de la huella de carbono';
    fr=_infXlsCab(h, S, 'Huella de carbono · los datos para subir', 9, 'Una fila por consumo. Borra las filas de ejemplo.');
    fr=_infXlsTabla(h, S, fr, [['Fecha', 13, 'f'], ['Qué', 15, 'tx'], ['Tipo', 24, 'tx'], ['Cantidad', 12, 'd2'], ['Unidad', 12, 'tx'], ['Personas (viajes)', 12, 'n'], ['Ida y vuelta (viajes)', 12, 'tx'], ['Qué se hizo (residuos)', 18, 'tx'], ['Detalle, equipo o tramo', 30, 'tx'], ['Proveedor', 24, 'tx'], ['N.º de boleta o suministro', 18, 'tx']], [
      [MES+'-05', 'Combustible', 'Diésel', 120, 'gal', '', '', '', 'Retroexcavadora 1 (ejemplo)', 'Grifo (ejemplo)', 'B001-123 (ejemplo)'],
      [MES+'-06', 'Electricidad', 'Red pública', 1850, 'kWh', '', '', '', '', '', '123456 (ejemplo)'],
      [MES+'-07', 'Material', 'Concreto premezclado', 24, 'm³', '', '', '', 'f\'c 210 (ejemplo)', '', ''],
      [MES+'-08', 'Viaje', 'Avión, vuelo nacional', 1010, 'km', 2, 'sí', '', 'Lima – Arequipa (ejemplo)', '', ''],
      [MES+'-09', 'Residuo', 'Residuos generales', 320, 'kg', '', '', 'Disposición final', '', 'EO-RS (ejemplo)', '']], X);
    var H2=new X.Hoja('Cómo llenarla'); H2.pie='Plantilla de la huella de carbono';
    var f2=_infXlsCab(H2, S, 'Los valores que se aceptan', 2, 'Sin importar tildes ni mayúsculas');
    var tipos=function(L){ return L.map(function(x){ return x[1]; }).join(' · '); };
    f2=_infXlsTabla(H2, S, f2, [['Qué', 16, 'tx'], ['Tipo', 70, 'tx'], ['Unidad', 40, 'tx']], [
      ['Combustible', tipos(AMB_COMB), 'gal · L · m³ (GNV) · kg (GLP en balón)'], ['Electricidad', tipos(AMB_ENER), 'kWh'], ['Refrigerante', tipos(AMB_REFR), 'kg recargados'],
      ['Material', tipos(AMB_MAT), AMB_MAT.map(function(x){ return x[1]+': '+x[2]; }).join(' · ')], ['Agua', tipos(AMB_AGUA), 'm³'],
      ['Residuo', tipos(AMB_RES_TIPOS), 'kg · t · m³ — y «Qué se hizo»: '+tipos(AMB_RES_DEST)], ['Viaje', tipos(AMB_VIAJE), 'km de ida (por persona; en auto, del vehículo)']], X);
    bajarBlob(X.libro([h, H2], S.E, 'Plantilla de la huella de carbono'), 'Plantilla huella de carbono.xlsx');
  }, function(){ toast('No se pudo armar la plantilla. Revisa tu conexión.'); });
}
function _hcN(s){ return String(s==null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function _hcBusca(L, v){ var n=_hcN(v); if(!n) return null; for(var i=0;i<L.length;i++){ if(_hcN(L[i][1])===n || _hcN(L[i][0])===n) return L[i][0]; } for(var j=0;j<L.length;j++){ var b=_hcN(L[j][1]); if(b.indexOf(n)===0 || n.indexOf(b)===0) return L[j][0]; } return null; }
function _hcFecha(v){ v=String(v||'').trim(); var m; if(/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; if((m=/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/.exec(v))){ var a=+m[3]; if(a<100) a+=2000; return a+'-'+dos(+m[2])+'-'+dos(+m[1]); } return ''; }
function hcFilaDe(f){
  var fe=_hcFecha(f[0]), k=_hcBusca(HC_PL_QUE, f[1]), cant=ambNum(f[3]), u=_hcN(f[4]);
  if(!fe) return { mal:'la fecha' }; if(fe>hoyISO()) return { mal:'la fecha (es futura)' };
  if(!k) return { mal:'«Qué»' }; if(cant===null) return { mal:'la cantidad' };
  var d={ k:k, fecha:fe, emp:f[9]||'', por:YO.nombre || '', t:Date.now(), dato:'medido' };
  if(k==='comb'){ d.tipo=_hcBusca(AMB_COMB, f[2]) || (/diesel|d2|b5/.test(_hcN(f[2])) ? 'diesel' : (/gasol|gasoh/.test(_hcN(f[2])) ? 'gasolina' : null)); if(!d.tipo) return { mal:'el combustible' };
    d.cant=cant; d.und=/^(l|lt|litro|litros)$/.test(u) ? 'L' : (/^m3$|^m 3$|metro/.test(u) ? 'm3' : (/^kg|kilo/.test(u) ? 'kg' : 'gal')); d.equipo=f[8]||''; d.bol=f[10]||''; }
  if(k==='ener'){ d.kwh=cant; d.fuente=_hcBusca(AMB_ENER, f[2]) || 'red'; d.sum=f[10]||''; }
  if(k==='refr'){ d.gas=_hcBusca(AMB_REFR, f[2]) || (/410/.test(f[2]) ? 'r410a' : (/22/.test(f[2]) ? 'r22' : (/134/.test(f[2]) ? 'r134a' : (/co2|extint/.test(_hcN(f[2])) ? 'co2' : null)))); if(!d.gas) return { mal:'el gas' }; d.kg=cant; d.equipo=f[8]||''; }
  if(k==='mat'){ d.tipo=_hcBusca(AMB_MAT, f[2]); if(!d.tipo) return { mal:'el material' }; d.cant=cant; d.nombre=f[8]||''; }
  if(k==='agua'){ d.m3=cant; d.fuente=_hcBusca(AMB_AGUA, f[2]) || 'red'; }
  if(k==='res'){ d.tipo=_hcBusca(AMB_RES_TIPOS, f[2]); if(!d.tipo) return { mal:'el residuo' }; d.cant=cant; d.und=/^t$|tonel/.test(u) ? 't' : (/^m3$|^m 3$/.test(u) ? 'm3' : (/^und|unid/.test(u) ? 'und' : 'kg')); d.dest=_hcBusca(AMB_RES_DEST, f[7]) || 'disposicion'; }
  if(k==='viaje'){ d.tipo=_hcBusca(AMB_VIAJE, f[2]) || (/avion|vuelo/.test(_hcN(f[2])) ? 'avion_nac' : null); if(!d.tipo) return { mal:'cómo se viajó' }; d.km=cant; d.pers=f[5]||1; d.iv=/^(si|s|x|1|ida y vuelta)$/.test(_hcN(f[6])); d.tramo=f[8]||''; }
  d.ev=[]; return { d:ambLimpio(d) };
}
function hcSubirAbrir(){
  var h='<div class="campo"><label for="hc-file">La plantilla llena (Excel)</label><input type="file" id="hc-file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></div><div id="hc-prev"></div><div class="msg" id="hc-sub-msg" role="status"></div>'+
    '<button type="button" class="bt-link" id="hc-plant2">⬇️ Bajar la plantilla</button>';
  abrirHoja('Subir los datos', 'Cada fila entra como un registro de «Medio ambiente»', h, '<button type="button" class="bt sec" id="hc-sub-no">Cancelar</button><button type="button" class="bt ok" id="hc-sub-ok" disabled>Subir</button>', { ancha:true, sinFoco:true });
  var listas=[];
  $('hc-sub-no').onclick=cerrarHoja; $('hc-plant2').onclick=hcPlantilla;
  $('hc-file').onchange=function(){
    var f=this.files && this.files[0], m=$('hc-sub-msg'); listas=[]; $('hc-sub-ok').disabled=true; $('hc-prev').innerHTML='';
    if(!f) return; m.className='msg gris'; m.textContent='Leyendo…';
    f.arrayBuffer().then(function(b){ return gesIr('gesLeerXlsx', b); }).then(function(r){
      var hoja=(r && r.hojas || []).filter(function(x){ return _hcN(x.n)==='datos'; })[0] || (r && r.hojas || [])[0];
      if(!hoja) return Promise.reject('vacia');
      var malas=[];
      hoja.filas.forEach(function(fl){
        if(!fl[0] && !fl[1]) return;
        if(_hcN(fl[0])==='fecha' || /ejemplo/i.test(fl.join(' '))) return;
        if(!_hcFecha(fl[0]) && !_hcBusca(HC_PL_QUE, fl[1])) return;
        var x=hcFilaDe(fl); if(x.mal) malas.push('Fila '+fl.r+': revisa '+x.mal); else listas.push(x.d);
      });
      $('hc-prev').innerHTML=listas.length ? '<p><b>✓ '+listas.length+(listas.length===1 ? ' registro listo' : ' registros listos')+'</b></p>' : '';
      if(malas.length) $('hc-prev').innerHTML+='<p class="msg mal">'+malas.slice(0, 12).map(esc).join('<br>')+(malas.length>12 ? '<br>…y '+(malas.length-12)+' más' : '')+'</p>';
      m.className='msg'; m.textContent=listas.length ? '' : 'No hay filas para subir (las de ejemplo no cuentan).';
      $('hc-sub-ok').disabled=!listas.length;
    }).catch(function(e){ m.className='msg mal'; m.textContent=(e==='no_es_excel' ? 'No es un Excel (.xlsx).' : 'No se pudo leer el archivo.'); });
  };
  $('hc-sub-ok').onclick=function(){
    var b=this, m=$('hc-sub-msg'); if(!listas.length) return;
    b.disabled=true; m.className='msg gris'; m.textContent='Subiendo…';
    var filas=listas.map(function(d){ return { empresa:YO.obra.id, hoja:AMB_HOJA, nombre:_ambLineaP(d).slice(0, 180), url:null, nota:JSON.stringify(d) }; }), i=0;
    (function lote(){
      var pz=filas.slice(i, i+50); if(!pz.length) return Promise.resolve();
      return sbPostP('sst_doc', pz).then(function(rows){ if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'Esta cuenta no puede registrar en esta obra.' }); i+=50; return lote(); });
    })().then(function(){ toast(filas.length+(filas.length===1 ? ' registro subido.' : ' registros subidos.')); cerrarHoja(); AMBW.filas=null; HCW.filasE=null; if(typeof VISTA.recargar==='function') VISTA.recargar(); },
      function(e){ b.disabled=false; m.className='msg mal'; m.textContent='No se pudo subir'+(i ? ' todo (subieron '+i+')' : '')+'. '+porQueFallo(e); });
  };
}
