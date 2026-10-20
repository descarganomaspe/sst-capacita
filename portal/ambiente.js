/* OBRASST · el portal · MEDIO AMBIENTE (19/10/2026 · lote 20)
   Lo de medio ambiente de la obra, mes por mes: los residuos que salen (con su certificado o su boleta; lo que se vende, con su
   comprobante de pago), el agua consumida (m³), el combustible con sus boletas de carga y los certificados y constancias. Se
   registra aquí o en la app (la misma hoja «amb-reg»: el módulo AMB del núcleo dice cómo se guarda). Abajo, los temas de las
   charlas del mes: de seguridad o de medio ambiente (lo decide la obra; de entrada lo dicen sus palabras). Y el informe de
   medio ambiente del mes, en «Informe del mes». */
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
  if(d.k==='comb') return ambNombre(AMB_COMB, d.tipo)+(d.cant!=null ? ' · '+_ambNw(d.cant)+' '+d.und : '')+(d.equipo ? ' · '+d.equipo : '');
  return ambNombre(AMB_DOC_TIPOS, d.tipo)+(d.nombre ? ' · '+d.nombre : '');
}

/* ═══ LA VISTA ═══ */
function vistaAmbiente(caja){
  _ambCss();
  if(!AMBW.mes) AMBW.mes=MES;
  var ac=$('acciones');
  if(ac){
    ac.innerHTML='<button type="button" class="bt sec" id="amb-inf-b">🌱 Informe de medio ambiente</button><button type="button" class="bt" id="amb-nuevo-b">＋ Registrar</button>';
    $('amb-inf-b').onclick=function(){ window.INFW_PIDE={ tipo:'amb', mes:AMBW.mes }; navegar('informe'); };
    $('amb-nuevo-b').onclick=function(){ ambFormHoja('res'); };
  }
  caja.innerHTML='<div id="amb-vista"><div class="vacio">Cargando…</div></div>';
  function pinta(){
    return Promise.all([ambTraerP(true), ambMapaP(), ambTemasMesP(AMBW.mes)]).then(function(r){ AMBW.mapa=r[1]; AMBW.temas=r[2]; _ambPintar(); }, function(e){ var v=$('amb-vista'); if(v) fallo(v, e); });
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
      tarj('comb', '⛽', 'Combustible', esc(_ambNw(R.combGal))+' gal', R.combN+(R.combN===1 ? ' carga' : ' cargas')+' · con su boleta')+
      tarj('doc', '📄', 'Certificados y constancias', String(R.docs), 'documentos ambientales del mes')+'</div>';
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
  return [['cert', 'El documento']];
}
function ambFormHoja(k, fila){
  var d=(fila && fila.d) || {}, hoy=hoyISO(), sel=function(v, def){ return v || def; };
  AMBW.ed={ k:k, fila:fila || null }; AMBW.ev=(d.ev||[]).map(function(e){ return { u:e.u, n:e.n, t:e.t }; }); AMBW.guardando=false;
  var h='<div class="campo"><label id="ambw-k-t">Qué se registra</label>'+_ambChipsW('ambw-k', [['res', '♻️ Residuos'], ['agua', '💧 Agua'], ['comb', '⛽ Combustible'], ['doc', '📄 Certificado o constancia']], k)+'</div>';
  if(k==='res') h+='<div class="campo"><label>Qué residuo</label>'+_ambChipsW('ambw-tipo', AMB_RES_TIPOS, sel(d.tipo, 'generales'))+'</div>'+
    '<div class="campo"><label>Qué se hizo</label>'+_ambChipsW('ambw-dest', AMB_RES_DEST, sel(d.dest, 'disposicion'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-cant">Cantidad</label><input id="ambw-cant" inputmode="decimal" maxlength="10" value="'+esc(d.cant==null ? '' : d.cant)+'"></div><div class="campo"><label>Unidad</label>'+_ambChipsW('ambw-und', AMB_UNID, sel(d.und, 'kg'))+'</div></div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-emp">Empresa <span class="tenue">· la EO-RS, la recicladora o quien compra</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div>'+
      '<div class="campo" id="ambw-monto-c"'+(d.dest==='venta' ? '' : ' hidden')+'><label for="ambw-monto">Monto de la venta (S/)</label><input id="ambw-monto" inputmode="decimal" maxlength="10" value="'+esc(d.monto==null ? '' : d.monto)+'"></div></div>';
  if(k==='agua') h+='<div class="fila-c"><div class="campo"><label for="ambw-m3">Agua (m³)</label><input id="ambw-m3" inputmode="decimal" maxlength="10" value="'+esc(d.m3==null ? '' : d.m3)+'"></div><div class="campo"><label>De dónde</label>'+_ambChipsW('ambw-fuente', AMB_AGUA, sel(d.fuente, 'red'))+'</div></div>';
  if(k==='comb') h+='<div class="campo"><label>Qué combustible</label>'+_ambChipsW('ambw-tipo', AMB_COMB, sel(d.tipo, 'diesel'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-cant">Cantidad</label><input id="ambw-cant" inputmode="decimal" maxlength="9" value="'+esc(d.cant==null ? '' : d.cant)+'"></div><div class="campo"><label>Unidad</label>'+_ambChipsW('ambw-und', [['gal', 'galones'], ['L', 'litros']], sel(d.und, 'gal'))+'</div></div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-equipo">Equipo o vehículo</label><input id="ambw-equipo" maxlength="120" value="'+esc(d.equipo||'')+'"></div><div class="campo"><label for="ambw-emp">Grifo o proveedor <span class="tenue">· opcional</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div></div>';
  if(k==='doc') h+='<div class="campo"><label>Qué es</label>'+_ambChipsW('ambw-tipo', AMB_DOC_TIPOS, sel(d.tipo, 'cert'))+'</div>'+
    '<div class="fila-c"><div class="campo"><label for="ambw-nombre">El documento</label><input id="ambw-nombre" maxlength="160" value="'+esc(d.nombre||'')+'" placeholder="Certificado de disposición final de residuos de setiembre"></div><div class="campo"><label for="ambw-emp">Quién lo emite <span class="tenue">· opcional</span></label><input id="ambw-emp" maxlength="120" value="'+esc(d.emp||'')+'"></div></div>';
  h+='<div class="fila-c"><div class="campo"><label for="ambw-fecha">Fecha</label><input type="date" id="ambw-fecha" max="'+hoy+'" value="'+esc(d.fecha || (AMBW.mes===MES ? hoy : obsMesFin(AMBW.mes)))+'"></div><div class="campo"><label for="ambw-obs">Nota <span class="tenue">· opcional</span></label><input id="ambw-obs" maxlength="300" value="'+esc(d.obs||'')+'"></div></div>'+
    '<div class="seccion"><h3>Los papeles</h3><div id="ambw-ev"></div></div><div class="msg" id="ambw-msg" role="status"></div>';
  abrirHoja(fila ? 'Corregir el registro' : 'Registrar en medio ambiente', mesLargo(AMBW.mes), h,
    (fila ? '<button type="button" class="bt mal" id="ambw-quitar">Quitar</button>' : '')+'<button type="button" class="bt sec" id="ambw-no">Cancelar</button><button type="button" class="bt ok" id="ambw-ok">Guardar</button>', { ancha:true, sinFoco:true });
  _ambChipsWAl('ambw-k', function(v){ if(v!==k) ambFormHoja(v, null); });
  ['ambw-tipo', 'ambw-und', 'ambw-fuente'].forEach(function(id){ _ambChipsWAl(id); });
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
    '<p class="ayuda">'+(AMBW.ed.k==='res' ? 'El certificado o la constancia de disposición y la boleta o la guía; si se vendió, también el comprobante de pago.' : (AMBW.ed.k==='comb' ? 'La boleta o el vale de cada carga.' : (AMBW.ed.k==='agua' ? 'El recibo, o la foto del medidor con su lectura.' : 'El documento escaneado o en PDF.')))+'</p>';
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
          cant:v('ambw-cant'), m3:v('ambw-m3'), monto:v('ambw-monto'), emp:v('ambw-emp'), equipo:v('ambw-equipo'), nombre:v('ambw-nombre'), obs:v('ambw-obs'), por:(fila && fila.d.por) || YO.nombre || quienSoy() || '', t:Date.now() };
  if((k==='res' || k==='comb') && ambNum(d.cant)===null) return mal('Escribe la cantidad (solo el número).', 'ambw-cant');
  if(k==='agua' && ambNum(d.m3)===null) return mal('Escribe los m³ (solo el número).', 'ambw-m3');
  if(k==='doc' && d.nombre.length<3) return mal('Escribe qué documento es.', 'ambw-nombre');
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
