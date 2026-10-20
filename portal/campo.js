/* ═════════════════════════════════════════════════════════════════
   OBRASST · el portal · «LO DE CAMPO, TAMBIÉN EN LA WEB» (14/10/2026)
   Marcelo: «primeros auxilios, también por la web, dónde se podrá editar o subir contenido. El espacio de caída, el
   tareo, parte del día y legajo quiero que también esté en la web, dónde se puede editar el supervisor».
   Nada de esto es un registro aparte: cada cosa se guarda en el MISMO lugar y con la MISMA forma que la app, así que
   lo hecho aquí aparece en el celular y lo del celular, aquí.
     1 · el tareo (sst_estado «tareo_AAAA-MM-DD», «tareo_cfg»; lo corregido aquí queda anotado en
         «tareo_cambios_AAAA-MM»): el día, la semana y el mes; corregir; el Excel; las horas al registro de horas hombre
   Las cuentas (las horas de cada uno, el refrigerio, el que se fue sin marcar) son las de la app: campo-app.js, que
   armar.py saca de la app. Se pide con campoIr() y necesita mas.js (el personal) y gestion.js (las horas hombre).
   ═════════════════════════════════════════════════════════════════ */
var CAMPO = {};
function _camCss(){
  if($('cam-css')) return;
  var st=document.createElement('style'); st.id='cam-css';
  st.textContent=[
    '.cam-nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}.cam-nav input[type=date]{width:auto;padding:7px 9px}',
    '.cam-nav .bt{padding:7px 12px}',
    '.cam-cifras{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:0 0 14px}',
    '.cam-cifra{border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:10px 12px}',
    '.cam-cifra b{display:block;font-size:22px;font-weight:600;color:var(--tinta);font-variant-numeric:tabular-nums}.cam-cifra span{font-size:12.5px;color:var(--gris)}',
    '.cam-cifra.mal b{color:#B3261E}.cam-cifra.ojo b{color:#9A6700}',
    '.cam-tabla{width:100%;border-collapse:collapse;font-size:13.5px}.cam-tabla th{text-align:left;font-weight:600;color:var(--gris);font-size:12px;padding:7px 8px;border-bottom:1px solid var(--raya2);white-space:nowrap}',
    '.cam-tabla td{padding:8px;border-bottom:1px solid var(--raya);vertical-align:middle}.cam-tabla td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.cam-tabla tr.tot td{font-weight:600;color:var(--tinta);border-top:1px solid var(--raya2)}.cam-tabla td b{font-weight:500;color:var(--tinta)}',
    '.cam-envoltura{overflow-x:auto;border:1px solid var(--raya);border-radius:10px;background:var(--panel)}',
    '.cam-est{display:inline-block;font-size:11.5px;font-weight:600;border-radius:20px;padding:2px 8px;margin:0 4px 2px 0;white-space:nowrap}',
    '.cam-est.ad{background:#E6F4EA;color:#1E7B3A}.cam-est.ss{background:#FCEDEC;color:#B3261E}.cam-est.mu{background:#FFF4D6;color:#8A5A00}.cam-est.ce{background:#E6F4F1;color:#0E6B5C}.cam-est.we{background:#E8F0FE;color:#1A56B8}.cam-est.ma{background:#F1F3F5;color:#4A5560}',
    '.cam-acc{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}',
    '.cam-marcas{display:grid;gap:6px;margin:6px 0 12px}.cam-marca{display:flex;align-items:center;gap:10px;border:1px solid var(--raya);border-radius:9px;padding:7px 10px;background:var(--panel)}',
    '.cam-marca.anulada{opacity:.55;text-decoration:line-through}.cam-marca b{font-variant-numeric:tabular-nums;min-width:48px}.cam-marca span{flex:1;color:var(--gris);font-size:13px}',
    '.cam-fila{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}.cam-fila .campo{flex:1;min-width:120px;margin:0}',
    '.cam-hist{font-size:12.5px;color:var(--gris);margin:14px 0 0;line-height:1.55}.cam-hist b{color:var(--texto);font-weight:500}',
    '.cam-dif{font-size:12px;color:#9A6700}.cam-ok{font-size:12px;color:#1E7B3A}',
    '.cam-tarjs{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}@media (max-width:640px){.cam-tarjs{grid-template-columns:1fr}}',
    '.cam-foto{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.cam-foto .acciones{margin:0;justify-content:flex-start}',
    '.cam-foto img{width:132px;height:99px;object-fit:cover;border-radius:9px;border:1px solid var(--raya);background:#fff}',
    '.cdlw-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}@media (max-width:900px){.cdlw-grid{grid-template-columns:1fr}}',
    '.cdlw-ej{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}.cdlw-chips{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 4px}',
    '.cdlw-chip{font:inherit;font-size:13px;padding:7px 12px;border-radius:999px;border:1px solid var(--raya2);background:var(--panel);color:var(--tinta);cursor:pointer;text-align:left}',
    '.cdlw-chip.on{background:#FFF4D6;border-color:#D99A00;font-weight:600}.cdlw-chip:focus-visible{outline:2px solid #D99A00;outline-offset:2px}',
    '.cdlw-sec{margin:14px 0 6px;font-size:13px;font-weight:600;color:var(--tinta)}.cdlw-sec:first-child{margin-top:0}',
    '.cdlw-l{display:block;margin:12px 0 4px;font-size:13px;color:var(--texto)}.cdlw-num{display:flex;align-items:center;gap:8px}.cdlw-num input{flex:1;min-width:0;margin:0}',
    '.cdlw-num span{color:var(--gris);font-size:13px;min-width:54px}.cdlw-ay{margin:3px 0 0;font-size:12px;color:var(--gris)}',
    '.cdlw-mas{margin-top:12px}.cdlw-mas summary{cursor:pointer;font-size:13px;color:var(--azul)}',
    '.cdl-ver{margin:0 0 6px;padding:12px 14px;border-radius:10px;border:1px solid}.cdl-ver b{display:block;font-size:16px}.cdl-ver p{margin:5px 0 0;font-size:13px;line-height:1.45}',
    '.cdl-ver.verde{background:#E6F4EA;border-color:#8CCB9F;color:#14532D}.cdl-ver.ambar{background:#FFF4D6;border-color:#E8C46A;color:#6B4500}.cdl-ver.rojo{background:#FCEDEC;border-color:#EBA19C;color:#7F1D1D}',
    '.cdl-falta{padding:12px 13px;border-radius:10px;font-size:13.5px;border:1px dashed var(--raya2);color:var(--texto)}',
    '.cdl-svg{display:block;width:100%;max-width:380px;height:auto;margin:10px auto 0;color:var(--tinta)}',
    '.cdl-cuenta{margin-top:8px;display:grid;gap:0}.cdl-f{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13.5px;padding:6px 2px;border-bottom:1px solid var(--raya)}',
    '.cdl-f b{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600}.cdl-f span{display:flex;align-items:center;gap:8px}.cdl-tot{font-weight:600}.cdl-f.falta b{color:#B3261E}.cdl-f.sobra b{color:#1E7B3A}',
    '.cdl-sq{display:inline-block;width:11px;height:11px;border-radius:2px;flex:0 0 auto}.cdl-c-ff{background:#E5484D}.cdl-c-dd{background:#F5A524}.cdl-c-hs{background:#F5D90A}.cdl-c-m{border:1.5px dashed var(--gris)}',
    '.cdl-sug{margin-top:12px;padding:11px 13px;border-radius:10px;border:1px solid var(--raya);background:var(--fondo)}.cdl-sug ul{margin:6px 0 0;padding-left:18px}.cdl-sug li{font-size:13px;line-height:1.45}',
    '.cdl-pendulo{margin:10px 0 0;font-size:12.5px;color:var(--gris)}',
    '.cdlw-oc{display:flex;gap:12px;align-items:flex-start}.cdlw-oc-e{font-size:22px;line-height:1}.cdlw-oc h2{margin:0 0 3px;font-size:15px}.cdlw-oc.abierto{outline:2px solid #D99A00;outline-offset:-2px}',
    '.legw-secs{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px 14px;margin:6px 0 10px}.legw-secs label{display:flex;gap:8px;align-items:center;font-size:13.5px;cursor:pointer}',
    '.legw-secs input,.legw-trab input{width:auto;margin:0}.legw-trab{display:flex;gap:8px;align-items:center;font-size:13.5px;margin:4px 0 0;cursor:pointer}',
    '.legw-q{max-width:340px;margin:0 0 10px}'
  ].join('\n');
  document.head.appendChild(st);
}
function _camH(x){ return (Math.round((Number(x)||0)*10)/10).toFixed(1).replace('.', ','); }
function _camHora(ms){ if(!ms) return ''; var d=new Date(ms); return dos(d.getHours())+':'+dos(d.getMinutes()); }
function _camDiaMas(iso, n){ var d=new Date(iso+'T12:00:00'); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+dos(d.getMonth()+1)+'-'+dos(d.getDate()); }
function _camFecha(iso){ try{ return new Date(iso+'T12:00:00').toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long' }); }catch(e){ return iso; } }
function _camCorta(iso){ try{ return new Date(iso+'T12:00:00').toLocaleDateString('es-PE', { weekday:'short', day:'numeric' }); }catch(e){ return iso; } }
function _camQuien(){ return String((YO && YO.nombre) || (TOK && TOK.correo) || 'la web').slice(0, 80); }
/* la hora escrita «17:30» en ese día (el que sale de madrugada: el día siguiente) */
function _camMs(dia, hhmm, despuesDe){
  var m=String(hhmm||'').trim().match(/^(\d{1,2})[:.h](\d{2})$/); if(!m || +m[1]>23 || +m[2]>59) return null;
  var d=new Date(dia+'T00:00:00'); d.setHours(+m[1], +m[2], 0, 0); var ms=d.getTime();
  if(despuesDe && ms<=despuesDe) ms+=86400000;
  return ms;
}
function _camApp(){ return (typeof CAMPO_APP==='object') ? CAMPO_APP : null; }

/* ══ 1 · EL TAREO ══════════════════════════════════════════════════════════════════════════════════════════════════ */
var TARW = { caja:null, obra:null, dia:'', tab:'dia', cfg:null, dias:{}, hht:{}, cambios:{}, n:0, msg:'', celf:{} };
function _tarwCfg(v){
  var A=_camApp(), D=A ? A.TAR_CFG_DEF : { refri:60, refriDesde:6, jor:8, maxDia:12, maxSem:60 }, o={};
  Object.keys(D).forEach(function(k){ var x=v && +v[k]; o[k]=((x || x===0) && isFinite(x)) ? x : D[k]; });
  return o;
}
/* lo de varios días, de una vez (en tandas de 31) */
function _tarwTraer(dias, fresco){
  var faltan=dias.filter(function(d){ return fresco || !TARW.dias[d]; });
  if(!faltan.length) return Promise.resolve(true);
  var tandas=[]; for(var i=0;i<faltan.length;i+=31) tandas.push(faltan.slice(i, i+31));
  /* 14/10/2026 · y lo que marcaron con su celular (sql/2026-11-15-tareo-cel.sql): se junta con lo de la puerta, con «cel» */
  var orden=faltan.slice().sort(), celP=sbRpc('sst_tareo_cel', { p_emp:YO.obra.id, p_desde:orden[0], p_hasta:orden[orden.length-1] }).catch(function(){ return null; });
  return Promise.all(tandas.map(function(t){
    var claves=t.map(function(d){ return '"tareo_'+d+'"'; }).join(',');
    return sbGet('sst_estado?empresa=eq.'+_enc(YO.obra.id)+'&clave=in.('+_enc(claves)+')&select=clave,valor,actualizado,quien').then(function(rows){
      var por={}; (rows||[]).forEach(function(r){ if(r && /^tareo_\d{4}-\d{2}-\d{2}$/.test(r.clave)) por[r.clave.slice(6)]=r; });
      t.forEach(function(d){ var r=por[d], v=r && r.valor; TARW.dias[d]={ p:(v && v.p && typeof v.p==='object') ? v.p : {}, t:r ? r.actualizado : '', q:r ? r.quien : '' }; });
    });
  })).then(function(){ return celP; }).then(function(j){ _tarwJuntarCel(j); return true; });
}
function _tarwJuntarCel(j){
  var A=_camApp(); if(!A || !j || !j.ok || !Array.isArray(j.l)) return;
  var porDia={};
  j.l.forEach(function(m){ if(!m || !m.dia || !m.k || !(+m.ms) || (m.t!=='e' && m.t!=='s')) return; var d=String(m.dia).slice(0,10); (porDia[d]=porDia[d]||[]).push(m); });
  Object.keys(porDia).forEach(function(d){
    var x=TARW.dias[d]; if(!x) return;
    var p={};
    porDia[d].forEach(function(m){
      var z=p[m.k] || (p[m.k]={ n:String(m.n||'').slice(0,80), d:String(m.d||''), m:[], x:[] });
      z.m.push([+m.ms, m.t, 'cel']);
      (TARW.celf[d]=TARW.celf[d]||{})[m.k+'|'+(+m.ms)]={ lejos:!!m.lejos, sinu:!!m.sinu, sins:!!m.sins, dist:(typeof m.dist==='number') ? m.dist : null };
    });
    x.p=A.tarUnir({ p:x.p }, { p:p }).p;
  });
}
function _tarwMetros(m){ m=Math.round(+m||0); return m>=1000 ? String(Math.round(m/100)/10).replace('.', ',')+' km' : m+' m'; }
/* lo de su celular que hay que mirar: lejos de la puerta, sin ubicación, sin señal (solo de las marcas que valen) */
function _tarwCelDe(dia, k, z){
  var f=TARW.celf[dia]||{}, xs=(z && z.x)||[], o={ cel:false, lejos:0, sinu:false, sins:false };
  ((z && z.m)||[]).forEach(function(q){ if(q[2]!=='cel' || xs.indexOf(q[0])>-1) return; o.cel=true; var y=f[k+'|'+q[0]]; if(!y) return;
    if(y.lejos) o.lejos=Math.max(o.lejos, +y.dist||1); if(y.sinu) o.sinu=true; if(y.sins) o.sins=true; });
  return o;
}
function _tarwCfgTraer(){
  return estadoLeerP('tareo_cfg').then(function(f){ TARW.cfg=_tarwCfg(f && f.valor); return TARW.cfg; }, function(){ TARW.cfg=_tarwCfg(null); return TARW.cfg; });
}
function _tarwCambiosTraer(mes, fresco){
  if(!fresco && TARW.cambios[mes]) return Promise.resolve(TARW.cambios[mes]);
  return estadoLeerP('tareo_cambios_'+mes).then(function(f){ var l=(f && Array.isArray(f.valor && f.valor.l)) ? f.valor.l : []; TARW.cambios[mes]=l; return l; }, function(){ TARW.cambios[mes]=TARW.cambios[mes]||[]; return TARW.cambios[mes]; });
}
/* el día: cada persona con sus horas (la cuenta de la app) */
function tarwResumen(dia){
  var A=_camApp(), x=TARW.dias[dia], cfg=TARW.cfg || _tarwCfg(null), ahora=Date.now(), L=[];
  if(A && x && x.p) Object.keys(x.p).forEach(function(k){
    var z=x.p[k], r=A.tarHorasDe(z, cfg, ahora); if(!r.marcas) return;
    r.k=k; r.n=z.n || z.d || '?'; r.d=z.d || ''; r.z=z;
    r.web=(z.m||[]).some(function(q){ return q[2]==='web'; });
    r.celx=_tarwCelDe(dia, k, z); r.cel=r.celx.cel;
    L.push(r);
  });
  L.sort(function(a, b){ return a.n.localeCompare(b.n, 'es'); });
  var hh=0; L.forEach(function(r){ hh+=r.h; });
  return { L:L, n:L.length, adentro:L.filter(function(r){ return r.adentro; }).length, sinSalida:L.filter(function(r){ return r.sinSalida; }).length, hh:Math.round(hh*100)/100 };
}
function _tarwSemanaDe(dia){ var d=new Date(dia+'T12:00:00'), w=(d.getDay()+6)%7, lunes=_camDiaMas(dia, -w), out=[]; for(var i=0;i<7;i++) out.push(_camDiaMas(lunes, i)); return out; }
function _tarwMesDe(dia){ var ym=dia.slice(0,7), a=+ym.slice(0,4), m=+ym.slice(5,7), nd=new Date(a, m, 0).getDate(), hoy=hoyISO(), out=[]; for(var d=1; d<=nd; d++){ var f=ym+'-'+dos(d); if(f>hoy) break; out.push(f); } return out; }
/* cambiar un día: sobre lo que el servidor tiene EN ESE MOMENTO (otro celular pudo marcar hace un minuto), juntando como
   la app (las marcas de los dos, sin repetir, y las anuladas de los dos). Si no se pudo leer, no se escribe nada. */
function _tarwCambiar(dia, cambio, nota){
  var A=_camApp(); if(!A) return Promise.reject('sin_app');
  return estadoLeerP('tareo_'+dia).then(function(fila){
    var v=fila && fila.valor, base=A.tarUnir(v && v.p ? v : { p:{} }, null), junto=A.tarUnir(base, cambio);
    return estadoEscribirP('tareo_'+dia, { v:1, p:junto.p }).then(function(){
      TARW.dias[dia]={ p:junto.p, t:new Date().toISOString(), q:String((TOK&&TOK.correo)||'') };
      return nota ? _tarwAnotar(dia, nota).catch(function(){ return null; }) : null;
    });
  });
}
/* lo corregido aquí queda anotado (quién, cuándo, qué): el mes en su fila */
function _tarwAnotar(dia, nota){
  var mes=dia.slice(0,7), clave='tareo_cambios_'+mes;
  return estadoLeerP(clave).then(function(f){
    var l=(f && f.valor && Array.isArray(f.valor.l)) ? f.valor.l.slice() : [];
    l.push({ dia:dia, k:nota.k || '', n:String(nota.n || '').slice(0, 80), que:String(nota.que || '').slice(0, 200), por:_camQuien(), cuando:Date.now() });
    if(l.length>600) l=l.slice(-600);
    return estadoEscribirP(clave, { v:1, l:l }).then(function(){ TARW.cambios[mes]=l; });
  });
}
/* ── la pantalla ── */
function tarwVista(caja){
  _camCss(); if(typeof _masCss==='function') _masCss();
  TARW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(TARW.obra!==(YO.obra||{}).id){ TARW.obra=(YO.obra||{}).id; TARW.dia=hoyISO(); TARW.tab='dia'; TARW.dias={}; TARW.hht={}; TARW.cambios={}; TARW.cfg=null; }
  if(!TARW.dia) TARW.dia=hoyISO();
  cargando(caja);
  function pinta(silencio){
    var n=++TARW.n;
    if(silencio){ _tarwTab(true); return; }
    Promise.all([cargarCampoApp(), _tarwCfgTraer()]).then(function(){
      if(n!==TARW.n || VISTA.actual!=='tareo') return;
      _tarwArmar();
    }).catch(function(cod){ if(n!==TARW.n || VISTA.actual!=='tareo') return; fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function _tarwArmar(){
  var caja=TARW.caja; if(!caja || !document.body.contains(caja)) return;
  var tabs=[['dia', 'El día'], ['semana', 'La semana'], ['mes', 'El mes'], ['ajustes', 'Ajustes']];
  caja.innerHTML='<div class="aviso" id="tarw-que"><b>El tareo de la puerta: quién entró, quién salió y sus horas.</b> Cada uno marca con su fotocheck en el celular de la puerta; '+
    'aquí ves cada día, corriges al que se fue sin marcar y pasas las horas al registro de horas hombre. Es el mismo tareo de la app: lo que cambies aquí, lo ve el celular.</div>'+
    '<div class="seg" id="tarw-tabs" role="tablist" style="margin:0 0 14px">'+tabs.map(function(t){ var on=(t[0]===TARW.tab); return '<button type="button" role="tab" aria-selected="'+(on ? 'true' : 'false')+'" class="'+(on ? 'on' : '')+'" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div>'+
    '<div id="tarw-cuerpo"></div>';
  $('tarw-tabs').onclick=function(ev){
    var b=ev.target.closest('[data-v]'); if(!b || b.getAttribute('data-v')===TARW.tab) return;
    TARW.tab=b.getAttribute('data-v'); TARW.msg='';
    Array.prototype.forEach.call(this.querySelectorAll('button'), function(x){ var on=(x===b); x.className=on ? 'on' : ''; x.setAttribute('aria-selected', on ? 'true' : 'false'); });
    _tarwTab();
  };
  _tarwTab();
}
function _tarwTab(silencio){
  if(!$('tarw-cuerpo')) return;
  if(TARW.tab==='semana') _tarwSemana(silencio); else if(TARW.tab==='mes') _tarwMes(silencio); else if(TARW.tab==='ajustes') _tarwAjustes(); else _tarwDia(silencio);
}
function _tarwNav(id){
  var hoy=hoyISO();
  return '<div class="cam-nav"><button type="button" class="bt sec" data-ir="-1" aria-label="Día anterior">‹</button>'+
    '<input type="date" id="'+id+'" value="'+TARW.dia+'" max="'+hoy+'" aria-label="El día">'+
    '<button type="button" class="bt sec" data-ir="1" aria-label="Día siguiente"'+(TARW.dia>=hoy ? ' disabled' : '')+'>›</button>'+
    (TARW.dia!==hoy ? '<button type="button" class="bt sec" data-ir="0">Hoy</button>' : '')+
    '<span style="color:var(--gris);font-size:13px">'+esc(_camFecha(TARW.dia))+'</span></div>';
}
function _tarwNavOn(id, salto){
  var c=$('tarw-cuerpo');
  Array.prototype.forEach.call(c.querySelectorAll('[data-ir]'), function(b){ b.onclick=function(){
    var v=+b.getAttribute('data-ir'), hoy=hoyISO();
    var d=(v===0) ? hoy : _camDiaMas(TARW.dia, v*(salto||1)); if(d>hoy) d=hoy;
    TARW.dia=d; TARW.msg=''; _tarwTab();
  }; });
  var f=$(id); if(f) f.onchange=function(){ if(/^\d{4}-\d{2}-\d{2}$/.test(f.value) && f.value<=hoyISO()){ TARW.dia=f.value; TARW.msg=''; _tarwTab(); } };
}
function _tarwEst(r, cfg, sem){
  var h='';
  if(r.adentro) h+='<span class="cam-est ad">Adentro</span>';
  if(r.sinSalida) h+='<span class="cam-est ss">Sin salida · se contó la jornada</span>';
  if(r.h>cfg.maxDia || (sem && sem>cfg.maxSem)) h+='<span class="cam-est mu">Muchas horas</span>';
  if(r.web) h+='<span class="cam-est we">Corregido en la web</span>';
  else if(r.mano) h+='<span class="cam-est ma">Marcado a mano</span>';
  /* 14/10/2026 · con su celular (tareo-cel): y lo que hay que mirar */
  if(r.cel) h+='<span class="cam-est ce">📱 Con su celular</span>';
  if(r.celx && r.celx.lejos) h+='<span class="cam-est ss">Lejos de la puerta ('+_tarwMetros(r.celx.lejos)+')</span>';
  if(r.celx && r.celx.sinu) h+='<span class="cam-est mu">Sin ubicación</span>';
  if(r.celx && r.celx.sins) h+='<span class="cam-est ma">Sin señal</span>';
  return h;
}

/* ── el día ── */
function _tarwDia(silencio){
  var c=$('tarw-cuerpo'), dia=TARW.dia, n=++TARW.n;
  if(!silencio) c.innerHTML=_tarwNav('tarw-f')+'<div class="vacio">Cargando…</div>';
  var semana=_tarwSemanaDe(dia).filter(function(d){ return d<=hoyISO(); });
  Promise.all([_tarwTraer(semana, true), _tarwCambiosTraer(dia.slice(0,7), !silencio)]).then(function(){
    if(n!==TARW.n || !$('tarw-cuerpo') || TARW.tab!=='dia') return;
    var A=_camApp(), cfg=TARW.cfg, R=tarwResumen(dia), hoy=hoyISO(), sem={};
    semana.forEach(function(d){ var x=TARW.dias[d]; if(!x) return; Object.keys(x.p).forEach(function(k){ var r=A.tarHorasDe(x.p[k], cfg, Date.now()); if(r.marcas) sem[k]=(sem[k]||0)+r.h; }); });
    var h=_tarwNav('tarw-f');
    h+='<div class="cam-cifras">'+
      '<div class="cam-cifra"><b>'+R.n+'</b><span>'+(R.n===1 ? 'persona marcó' : 'personas marcaron')+'</span></div>'+
      (dia===hoy ? '<div class="cam-cifra"><b>'+R.adentro+'</b><span>siguen adentro</span></div>' : '')+
      '<div class="cam-cifra'+(R.sinSalida ? ' mal' : '')+'"><b>'+R.sinSalida+'</b><span>sin salida</span></div>'+
      '<div class="cam-cifra"><b>'+_camH(R.hh)+'</b><span>horas hombre</span></div></div>';
    h+='<div class="cam-acc"><button type="button" class="bt" id="tarw-agregar">＋ Agregar a alguien</button>'+
       '<button type="button" class="bt sec" id="tarw-hh">Pasar el día a las horas hombre</button>'+
       '<button type="button" class="bt sec" id="tarw-xls">Bajar el Excel del mes</button></div>';
    if(TARW.msg) h+='<p class="msg gris" id="tarw-msg">'+esc(TARW.msg)+'</p>';
    if(!R.n) h+='<div class="vacio" id="tarw-vacio">Nadie marcó este día.<br><small>Se marca con el fotocheck en el celular de la puerta (app ▸ Tareo). Si alguien trabajó y no marcó, agrégalo con «＋ Agregar a alguien».</small></div>';
    else {
      h+='<div class="cam-envoltura"><table class="cam-tabla" id="tarw-tabla"><thead><tr><th>Apellidos y nombres</th><th>Documento</th><th>Entrada</th><th>Salida</th><th style="text-align:right">Horas</th><th></th><th></th></tr></thead><tbody>';
      R.L.forEach(function(r){
        h+='<tr data-k="'+esc(r.k)+'"><td><b>'+esc(r.n)+'</b><br>'+_tarwEst(r, cfg, sem[r.k])+'</td><td>'+esc(r.d || '—')+'</td><td class="n">'+(r.e ? _camHora(r.e) : '—')+'</td>'+
           '<td class="n">'+(r.adentro ? '<span style="color:var(--gris)">adentro</span>' : (r.s ? _camHora(r.s) : '—'))+'</td><td class="n">'+_camH(r.h)+'</td>'+
           '<td class="n" style="color:var(--gris);font-size:12px">'+(sem[r.k] ? 'semana: '+_camH(sem[r.k])+' h' : '')+'</td>'+
           '<td style="white-space:nowrap">'+((r.sinSalida || (r.adentro && dia<hoy)) ? '<button type="button" class="bt sec chico" data-sal="'+esc(r.k)+'">Poner salida</button> ' : '')+
           '<button type="button" class="lnk" data-cor="'+esc(r.k)+'">Corregir</button></td></tr>';
      });
      h+='<tr class="tot"><td colspan="4">Total del día</td><td class="n">'+_camH(R.hh)+'</td><td colspan="2"></td></tr></tbody></table></div>';
      h+='<p class="ayuda" style="margin:8px 0 0">Se descuenta el refrigerio ('+cfg.refri+' min) a quien estuvo '+cfg.refriDesde+' h o más. Al que no marcó salida se le cuenta la jornada de la obra ('+cfg.jor+' h). Se cambia en «Ajustes».</p>';
    }
    var hist=(TARW.cambios[dia.slice(0,7)]||[]).filter(function(x){ return x.dia===dia; });
    if(hist.length) h+='<div class="cam-hist" id="tarw-hist"><b>Corregido en la web este día</b><br>'+hist.slice(-12).reverse().map(function(x){
      return esc(_camHora(x.cuando))+' · '+esc(x.por)+': '+esc(x.n ? x.n+' — ' : '')+esc(x.que); }).join('<br>')+'</div>';
    c.innerHTML=h;
    _tarwNavOn('tarw-f');
    $('tarw-agregar').onclick=function(){ _tarwAgregarForm(dia); };
    $('tarw-hh').onclick=function(){ _tarwAlHH([dia], this); };
    $('tarw-xls').onclick=function(){ tarwExcel(dia.slice(0,7), this); };
    Array.prototype.forEach.call(c.querySelectorAll('[data-cor]'), function(b){ b.onclick=function(){ _tarwCorregir(dia, b.getAttribute('data-cor')); }; });
    Array.prototype.forEach.call(c.querySelectorAll('[data-sal]'), function(b){ b.onclick=function(){ _tarwPonerSalida(dia, b.getAttribute('data-sal')); }; });
  }).catch(function(cod){ if(n!==TARW.n || !$('tarw-cuerpo')) return; c.innerHTML=_tarwNav('tarw-f')+'<div class="vacio mal">No se pudo traer el tareo ('+esc(String(cod))+'). Revisa tu conexión.</div>'; _tarwNavOn('tarw-f'); });
}
/* el que no marcó salida (o sigue «adentro» un día que ya pasó): se le pone la hora */
function _tarwPonerSalida(dia, k){
  var x=TARW.dias[dia], z=x && x.p[k], A=_camApp(); if(!z || !A) return;
  var pp=A.tarPares(A.tarMarcas(z)); if(pp.ab===null) return;
  preguntar('Hora de salida de '+(z.n || z.d || ''), 'Entró a las '+_camHora(pp.ab)+'. Escribe la hora en que salió, como 17:30.', { etiqueta:'Hora de salida', placeholder:'17:30', maximo:5 }).then(function(v){
    if(v===null || v===false || v===undefined) return;
    var ms=_camMs(dia, v, pp.ab);
    if(!ms){ toast('Escribe la hora como 17:30.'); return; }
    var cambio={ p:{} }; cambio.p[k]={ n:z.n || '', d:z.d || '', m:[[ms, 's', 'web']], x:[] };
    return _tarwCambiar(dia, cambio, { k:k, n:z.n || z.d, que:'puso la salida a las '+_camHora(ms) }).then(function(){
      toast('Salida puesta: '+_camHora(ms)+'. El celular la recibe al abrir el tareo.'); _tarwTab(true);
    }, function(){ toast('No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'); });
  });
}
/* corregir a una persona: anular una marca, volver a poner una anulada o sumar una entrada o una salida */
function _tarwCorregir(dia, k){
  var x=TARW.dias[dia], z=x && x.p[k], A=_camApp(); if(!z || !A) return;
  var anul={}, nuevas=[];
  function pinta(){
    var xs=(z.x||[]).concat(Object.keys(anul).map(Number)), ms=(z.m||[]).slice().sort(function(p, q){ return p[0]-q[0]; });
    var h='<div class="cam-marcas" id="tarc-marcas">'+(ms.length ? ms.map(function(q){
      var an=xs.indexOf(q[0])>-1, de=q[2]==='web' ? 'corregida en la web' : (q[2]==='mano' ? 'a mano' : (q[2]==='cel' ? 'con su celular' : 'con el fotocheck'));
      return '<div class="cam-marca'+(an ? ' anulada' : '')+'"><b>'+_camHora(q[0])+'</b><span>'+(q[1]==='e' ? 'Entrada' : 'Salida')+' · '+de+(an ? ' · anulada' : '')+'</span>'+
        (an ? ((z.x||[]).indexOf(q[0])>-1 ? '<button type="button" class="lnk" data-otra="'+q[0]+'|'+q[1]+'">Volver a ponerla</button>' : '<button type="button" class="lnk" data-des="'+q[0]+'">Deshacer</button>')
            : '<button type="button" class="lnk" data-anu="'+q[0]+'">Anular</button>')+'</div>';
    }).join('') : '<p class="ayuda">Sin marcas.</p>')+
    nuevas.map(function(q, i){ return '<div class="cam-marca"><b>'+_camHora(q[0])+'</b><span>'+(q[1]==='e' ? 'Entrada' : 'Salida')+' · nueva</span><button type="button" class="lnk" data-qui="'+i+'">Quitar</button></div>'; }).join('')+'</div>'+
    '<div class="cam-fila"><div class="campo"><label for="tarc-tipo">Sumar una marca</label><select id="tarc-tipo"><option value="e">Entrada</option><option value="s">Salida</option></select></div>'+
    '<div class="campo"><label for="tarc-hora">Hora</label><input type="time" id="tarc-hora"></div><button type="button" class="bt sec" id="tarc-sumar">＋ Sumar</button></div>'+
    '<p class="msg" id="tarc-msg"></p>'+
    '<p class="ayuda">Lo que anulas no se borra: queda tachado, como en la app. Las horas se vuelven a contar solas.</p>';
    $('hoja-cuerpo').innerHTML=h;
    Array.prototype.forEach.call(document.querySelectorAll('#tarc-marcas [data-anu]'), function(b){ b.onclick=function(){ anul[b.getAttribute('data-anu')]=1; pinta(); }; });
    Array.prototype.forEach.call(document.querySelectorAll('#tarc-marcas [data-des]'), function(b){ b.onclick=function(){ delete anul[b.getAttribute('data-des')]; pinta(); }; });
    Array.prototype.forEach.call(document.querySelectorAll('#tarc-marcas [data-qui]'), function(b){ b.onclick=function(){ nuevas.splice(+b.getAttribute('data-qui'), 1); pinta(); }; });
    Array.prototype.forEach.call(document.querySelectorAll('#tarc-marcas [data-otra]'), function(b){ b.onclick=function(){ var p=b.getAttribute('data-otra').split('|'); nuevas.push([+p[0]+1000, p[1], 'web']); pinta(); }; });
    $('tarc-sumar').onclick=function(){
      var t=$('tarc-tipo').value, v=$('tarc-hora').value, pri=(z.m||[]).length ? z.m.slice().sort(function(p, q){ return p[0]-q[0]; })[0][0] : null;
      var ms=_camMs(dia, v, (t==='s' && pri) ? pri : null);
      if(!ms){ $('tarc-msg').className='msg mal'; $('tarc-msg').textContent='Pon la hora.'; return; }
      nuevas.push([ms, t, 'web']); pinta();
    };
  }
  abrirHoja('Corregir el tareo', (z.n || z.d || '')+' · '+_camFecha(dia), '', '<button type="button" class="bt sec" id="tarc-no">Cancelar</button><button type="button" class="bt" id="tarc-ok">Guardar</button>');
  pinta();
  $('tarc-no').onclick=cerrarHoja;
  $('tarc-ok').onclick=function(){
    var an=Object.keys(anul).map(Number);
    if(!an.length && !nuevas.length){ cerrarHoja(); return; }
    var cambio={ p:{} }; cambio.p[k]={ n:z.n || '', d:z.d || '', m:nuevas, x:an };
    var que=[]; if(an.length) que.push(an.length===1 ? 'anuló la marca de las '+_camHora(an[0]) : 'anuló '+an.length+' marcas');
    nuevas.forEach(function(q){ que.push('sumó la '+(q[1]==='e' ? 'entrada' : 'salida')+' de las '+_camHora(q[0])); });
    this.disabled=true;
    _tarwCambiar(dia, cambio, { k:k, n:z.n || z.d, que:que.join(', ') }).then(function(){ cerrarHoja(); toast('Tareo corregido. El celular lo recibe al abrir el tareo.'); _tarwTab(true); },
      function(){ $('tarc-ok').disabled=false; $('tarc-msg').className='msg mal'; $('tarc-msg').textContent='No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'; });
  };
}
/* alguien que trabajó y no marcó: del personal, con su entrada y, si ya salió, su salida */
function _tarwAgregarForm(dia){
  var A=_camApp(); if(!A) return;
  abrirHoja('Agregar al tareo', _camFecha(dia),
    '<div class="campo"><label for="tara-q">¿Quién?</label><input id="tara-q" placeholder="Escribe su apellido o su nombre"></div>'+
    '<div class="cam-fila"><div class="campo"><label for="tara-e">Entrada</label><input type="time" id="tara-e"></div><div class="campo"><label for="tara-s">Salida (si ya salió)</label><input type="time" id="tara-s"></div></div>'+
    '<p class="msg" id="tara-msg"></p><p class="ayuda">Queda como marcado en la web, con tu nombre.</p>',
    '<button type="button" class="bt sec" id="tara-no">Cancelar</button><button type="button" class="bt" id="tara-ok">Agregar</button>', { sinFoco:true });
  var elegido=null;
  masGente().then(function(l){
    var act=masActivos(l);
    if(typeof sugGente==='function') sugGente($('tara-q'), { lista:act, alElegir:function(t){ elegido=t; } });
    setTimeout(function(){ try{ $('tara-q').focus(); }catch(e){} }, 40);
    $('tara-ok').onclick=function(){
      var m=$('tara-msg'), q=String($('tara-q').value||'').trim();
      if(!elegido || elegido.nombre!==q){ elegido=act.filter(function(t){ return t.nombre===q || (t.dni && t.dni===q); })[0] || null; }
      if(!elegido){ m.className='msg mal'; m.textContent='Elige a alguien de tu personal (escribe y toca su nombre).'; return; }
      var e=_camMs(dia, $('tara-e').value); if(!e){ m.className='msg mal'; m.textContent='Pon la hora de entrada.'; return; }
      var s=$('tara-s').value ? _camMs(dia, $('tara-s').value, e) : null;
      if($('tara-s').value && !s){ m.className='msg mal'; m.textContent='Revisa la hora de salida.'; return; }
      var k=A.tarK(elegido.dni, elegido.ext, elegido.nombre), cambio={ p:{} }, marcas=[[e, 'e', 'web']]; if(s) marcas.push([s, 's', 'web']);
      cambio.p[k]={ n:elegido.nombre, d:A.tarDoc(elegido.dni).slice(0, 20), m:marcas, x:[] };
      this.disabled=true;
      _tarwCambiar(dia, cambio, { k:k, n:elegido.nombre, que:'lo agregó: entrada '+_camHora(e)+(s ? ', salida '+_camHora(s) : '') }).then(function(){ cerrarHoja(); toast(elegido.nombre+' agregado al tareo.'); _tarwTab(true); },
        function(){ $('tara-ok').disabled=false; m.className='msg mal'; m.textContent='No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'; });
    };
  }, function(){ $('tara-msg').className='msg mal'; $('tara-msg').textContent='No se pudo traer tu personal. Revisa tu conexión.'; });
  $('tara-no').onclick=cerrarHoja;
}

/* ── la semana: cada persona, día por día ── */
function _tarwSemana(silencio){
  var c=$('tarw-cuerpo'), dias=_tarwSemanaDe(TARW.dia), hoy=hoyISO(), vale=dias.filter(function(d){ return d<=hoy; }), n=++TARW.n;
  if(!silencio) c.innerHTML=_tarwNav('tarw-f')+'<div class="vacio">Cargando…</div>';
  _tarwTraer(vale, true).then(function(){
    if(n!==TARW.n || !$('tarw-cuerpo') || TARW.tab!=='semana') return;
    var cfg=TARW.cfg, por={}, tot={}, totDia={}, todo=0;
    vale.forEach(function(d){ var R=tarwResumen(d); totDia[d]=R.hh; todo+=R.hh; R.L.forEach(function(r){ var p=por[r.k] || (por[r.k]={ n:r.n, d:r.d, h:{}, x:{} }); p.h[d]=r.h; p.x[d]=r; tot[r.k]=(tot[r.k]||0)+r.h; }); });
    var ks=Object.keys(por).sort(function(a, b){ return por[a].n.localeCompare(por[b].n, 'es'); });
    var h=_tarwNav('tarw-f')+'<p class="ayuda" style="margin:-4px 0 10px">Semana del '+esc(_camCorta(dias[0]))+' al '+esc(_camCorta(dias[6]))+' · más de '+cfg.maxSem+' h en la semana o '+cfg.maxDia+' h en un día sale en ámbar.</p>';
    h+='<div class="cam-acc"><button type="button" class="bt sec" id="tarw-hh">Pasar la semana a las horas hombre</button></div>';
    if(!ks.length) h+='<div class="vacio">Nadie marcó esta semana.</div>';
    else {
      h+='<div class="cam-envoltura"><table class="cam-tabla" id="tarw-sem"><thead><tr><th>Apellidos y nombres</th>'+dias.map(function(d){ return '<th style="text-align:right">'+esc(_camCorta(d))+'</th>'; }).join('')+'<th style="text-align:right">Semana</th></tr></thead><tbody>';
      ks.forEach(function(k){ var p=por[k], mucho=tot[k]>cfg.maxSem;
        h+='<tr><td><b>'+esc(p.n)+'</b>'+(mucho ? ' <span class="cam-est mu">Muchas horas</span>' : '')+'</td>'+dias.map(function(d){
          var r=p.x[d]; if(!r) return '<td class="n" style="color:var(--gris2)">'+(d>hoy ? '' : '—')+'</td>';
          return '<td class="n" style="'+(r.h>cfg.maxDia ? 'color:#9A6700;font-weight:600' : (r.sinSalida ? 'color:#B3261E' : ''))+'">'+_camH(r.h)+(r.sinSalida ? '*' : '')+'</td>'; }).join('')+
          '<td class="n" style="font-weight:600;'+(mucho ? 'color:#9A6700' : '')+'">'+_camH(tot[k])+'</td></tr>'; });
      h+='<tr class="tot"><td>Horas hombre</td>'+dias.map(function(d){ return '<td class="n">'+(d<=hoy && totDia[d] ? _camH(totDia[d]) : '')+'</td>'; }).join('')+'<td class="n">'+_camH(todo)+'</td></tr></tbody></table></div>';
      h+='<p class="ayuda" style="margin:8px 0 0">* Sin salida: se contó la jornada de la obra. Corrígelo en «El día».</p>';
    }
    c.innerHTML=h;
    _tarwNavOn('tarw-f', 7);
    $('tarw-hh').onclick=function(){ _tarwAlHH(vale, this); };
  }).catch(function(cod){ if(n!==TARW.n || !$('tarw-cuerpo')) return; c.innerHTML=_tarwNav('tarw-f')+'<div class="vacio mal">No se pudo traer el tareo ('+esc(String(cod))+').</div>'; _tarwNavOn('tarw-f', 7); });
}

/* ── el mes: día por día, contra lo que tiene el registro de horas hombre ── */
function _tarwHHTraer(dias){
  if(!dias.length) return Promise.resolve({});
  return sbGet('sst_hht?'+filtroObra('sst_hht')+'&fecha=gte.'+dias[0]+'&fecha=lte.'+dias[dias.length-1]+'&select=fecha,ob_n,ob_h,st_n,st_h,hhc&order=fecha.asc&limit=1000').then(function(rows){
    var por={}; (rows||[]).forEach(function(r){ var f=String(r.fecha||'').slice(0,10); if(!por[f]) por[f]=r; }); dias.forEach(function(d){ TARW.hht[d]=por[d] || null; }); return por;
  });
}
function _tarwMes(silencio){
  var c=$('tarw-cuerpo'), dias=_tarwMesDe(TARW.dia), ym=TARW.dia.slice(0,7), n=++TARW.n;
  var nav='<div class="cam-nav"><button type="button" class="bt sec" data-mes="-1" aria-label="Mes anterior">‹</button><b style="min-width:150px;text-align:center">'+esc(DC_MESES[+ym.slice(5,7)-1]+' '+ym.slice(0,4))+'</b>'+
          '<button type="button" class="bt sec" data-mes="1" aria-label="Mes siguiente"'+(ym>=hoyISO().slice(0,7) ? ' disabled' : '')+'>›</button></div>';
  if(!silencio) c.innerHTML=nav+'<div class="vacio">Cargando…</div>';
  function navOn(){ Array.prototype.forEach.call(c.querySelectorAll('[data-mes]'), function(b){ b.onclick=function(){
    var a=+ym.slice(0,4), m=+ym.slice(5,7)-1+(+b.getAttribute('data-mes')), d=new Date(a, m, 1), nuevo=d.getFullYear()+'-'+dos(d.getMonth()+1);
    if(nuevo>hoyISO().slice(0,7)) return;
    TARW.dia=(nuevo===hoyISO().slice(0,7)) ? hoyISO() : _camDiaMas(nuevo+'-01', new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()-1); _tarwTab(); }; }); }
  Promise.all([_tarwTraer(dias, true), _tarwHHTraer(dias)]).then(function(){
    if(n!==TARW.n || !$('tarw-cuerpo') || TARW.tab!=='mes') return;
    var filas=[], tot={ hh:0, n:0, ss:0 }, per={};
    dias.forEach(function(d){ var R=tarwResumen(d); if(!R.n) return; filas.push({ d:d, R:R }); tot.hh+=R.hh; tot.ss+=R.sinSalida; R.L.forEach(function(r){ var p=per[r.k] || (per[r.k]={ n:r.n, dias:0, h:0 }); p.dias++; p.h+=r.h; }); });
    tot.n=Object.keys(per).length;
    var h=nav+'<div class="cam-cifras"><div class="cam-cifra"><b>'+filas.length+'</b><span>días con marcas</span></div><div class="cam-cifra"><b>'+tot.n+'</b><span>personas</span></div>'+
      '<div class="cam-cifra"><b>'+_camH(tot.hh)+'</b><span>horas hombre del tareo</span></div><div class="cam-cifra'+(tot.ss ? ' mal' : '')+'"><b>'+tot.ss+'</b><span>salidas sin marcar</span></div></div>';
    h+='<div class="cam-acc"><button type="button" class="bt" id="tarw-xls">Bajar el Excel del mes</button><button type="button" class="bt sec" id="tarw-hh">Pasar el mes a las horas hombre</button></div>';
    if(!filas.length) h+='<div class="vacio">Ese mes todavía no tiene marcas.</div>';
    else {
      h+='<div class="cam-envoltura"><table class="cam-tabla" id="tarw-mes"><thead><tr><th>Día</th><th style="text-align:right">Personas</th><th style="text-align:right">Horas hombre</th><th style="text-align:right">Sin salida</th><th>En el registro de horas hombre</th></tr></thead><tbody>';
      filas.forEach(function(f){
        var r=TARW.hht[f.d], ob=r ? (parseFloat(r.ob_n)||0)*(parseFloat(r.ob_h)||0) : null, igual=(ob!==null && Math.abs(ob-f.R.hh)<0.6);
        h+='<tr><td><button type="button" class="lnk" data-dia="'+f.d+'">'+esc(_camCorta(f.d))+'</button></td><td class="n">'+f.R.n+'</td><td class="n">'+_camH(f.R.hh)+'</td><td class="n">'+(f.R.sinSalida || '')+'</td>'+
           '<td>'+(ob===null ? '<span class="cam-dif">Todavía no</span>' : (igual ? '<span class="cam-ok">✓ '+_camH(ob)+' h de obreros</span>' : '<span class="cam-dif">'+_camH(ob)+' h de obreros (distinto)</span>'))+'</td></tr>';
      });
      h+='<tr class="tot"><td>Total del mes</td><td class="n"></td><td class="n">'+_camH(tot.hh)+'</td><td class="n">'+(tot.ss || '')+'</td><td></td></tr></tbody></table></div>';
    }
    c.innerHTML=h; navOn();
    $('tarw-xls').onclick=function(){ tarwExcel(ym, this); };
    $('tarw-hh').onclick=function(){ _tarwAlHH(filas.map(function(f){ return f.d; }), this); };
    Array.prototype.forEach.call(c.querySelectorAll('[data-dia]'), function(b){ b.onclick=function(){ TARW.dia=b.getAttribute('data-dia'); TARW.tab='dia'; _tarwArmar(); }; });
  }).catch(function(cod){ if(n!==TARW.n || !$('tarw-cuerpo')) return; c.innerHTML=nav+'<div class="vacio mal">No se pudo traer el mes ('+esc(String(cod))+').</div>'; navOn(); });
}
/* las horas del tareo, al registro de horas hombre (sst_hht, lo mismo que hace la app con el «Riesgo del mes»): los
   obreros y sus horas salen del tareo; los empleados y las horas de capacitación que ya tenía ese día no se tocan */
function _tarwAlHH(dias, bt){
  var con=dias.filter(function(d){ return tarwResumen(d).n; });
  if(!con.length){ toast('No hay marcas en esos días.'); return; }
  if(typeof _hhGuardarDia!=='function'){ toast('No se pudo abrir el registro de horas hombre.'); return; }
  _tarwHHTraer(con).then(function(){
    var cambian=con.filter(function(d){ var r=TARW.hht[d]; return r && (parseFloat(r.ob_n)||0)*(parseFloat(r.ob_h)||0)>0 && Math.abs((parseFloat(r.ob_n)||0)*(parseFloat(r.ob_h)||0)-tarwResumen(d).hh)>=0.6; });
    var txt='Se '+(con.length===1 ? 'pasa 1 día' : 'pasan '+con.length+' días')+' al registro de horas hombre: los obreros y sus horas salen del tareo. Los empleados y las horas de capacitación que ya tenían se quedan.'+
            (cambian.length ? ' '+(cambian.length===1 ? 'Un día ya tenía' : cambian.length+' días ya tenían')+' otras horas de obreros: se cambian por las del tareo.' : '');
    return confirmar('¿Pasar las horas del tareo?', txt, { si:'Pasar las horas' }).then(function(si){
      if(!si) return;
      if(bt) bt.disabled=true;
      var hechos=0, cfg=TARW.cfg;
      return con.reduce(function(cad, d){ return cad.then(function(){
        var R=tarwResumen(d), r=TARW.hht[d] || {}, e=null, s=null;
        R.L.forEach(function(x){ if(x.e && (e===null || x.e<e)) e=x.e; if(x.s && !x.adentro && (s===null || x.s>s)) s=x.s; });
        var Rhh={ obN:R.n, obH:Math.round(R.hh/R.n*100)/100, obE:_camHora(e), obS:s ? _camHora(s) : '', stN:+r.st_n||0, stH:+r.st_h||0, stE:'', stS:'', hhc:+r.hhc||0, lugar:'' };
        return _hhGuardarDia(d, Rhh).then(function(){ hechos++; });
      }); }, Promise.resolve()).then(function(){
        toast(hechos===1 ? 'Listo: 1 día pasado a las horas hombre.' : 'Listo: '+hechos+' días pasados a las horas hombre.');
        if(bt) bt.disabled=false; _tarwHHTraer(con).then(function(){ _tarwTab(true); });
      }, function(c){ if(bt) bt.disabled=false; toast((c && c.portal) || ('Se pasaron '+hechos+' de '+con.length+'. Revisa tu conexión e inténtalo otra vez.')); });
    });
  }, function(){ toast('No se pudo leer el registro de horas hombre. Revisa tu conexión.'); });
}
/* ── el Excel del mes: las marcas, cada persona y cada día ── */
function tarwExcel(ym, bt){
  var dias=_tarwMesDe(ym+'-01');
  if(ym<hoyISO().slice(0,7)){ var a=+ym.slice(0,4), m=+ym.slice(5,7); dias=[]; for(var d=1; d<=new Date(a, m, 0).getDate(); d++) dias.push(ym+'-'+dos(d)); }
  if(bt) bt.disabled=true;
  Promise.all([_tarwTraer(dias, true), cargarEvPDF()]).then(function(){
    var X=RCAP.xlsx, E=new X.Estilos(), C=X.C, obra=String(nombreObraP()||''), cfg=TARW.cfg, mesN=DC_MESES[+ym.slice(5,7)-1]+' '+ym.slice(0,4);
    var sTit=E.xf({ b:1, sz:14, c:C.petroleo }), sSub=E.xf({ sz:10, c:C.gris }), sCab=E.xf({ b:1, sz:9, c:C.blanco, f:C.petroleo, h:'center', v:'center', wrap:1, borde:true });
    var sTx=E.xf({ sz:10, c:C.tinta, borde:true }), sFe=E.xf({ sz:10, c:C.tinta, h:'center', borde:true, fmt:'dd/mm/yyyy' }), sN2=E.xf({ sz:10, c:C.tinta, h:'right', borde:true, fmt:'#,##0.00' }), sN0=E.xf({ sz:10, c:C.tinta, h:'right', borde:true, fmt:'#,##0' });
    var sT2=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, h:'right', borde:true, fmt:'#,##0.00' }), sTt=E.xf({ b:1, sz:10, c:C.petroleo, f:C.pie, borde:true }), sHo=E.xf({ sz:10, c:C.tinta, h:'center', borde:true });
    var h1=new X.Hoja('Marcas'), f=5, per={}, porDia=[], hay=0; h1.activa=true; h1.pie='Tareo';
    h1.unir(0, 1, 6, 1, 'Tareo de la puerta · '+mesN.toLowerCase(), sTit); h1.altos[1]=22;
    h1.unir(0, 2, 6, 2, obra+' · refrigerio de '+cfg.refri+' min a quien estuvo '+cfg.refriDesde+' h o más · sin salida: jornada de '+cfg.jor+' h', sSub);
    ['Fecha', 'Documento', 'Apellidos y nombres', 'Entrada', 'Salida', 'Horas', 'Observación'].forEach(function(t, i){ h1.celda(i, 4, t, sCab); });
    [12, 13, 36, 9, 9, 9, 34].forEach(function(w, i){ h1.anchos[i]=w; }); h1.altos[4]=24;
    dias.forEach(function(d){
      var R=tarwResumen(d); if(!R.n) return; porDia.push({ d:d, R:R });
      R.L.forEach(function(r){
        hay++;
        h1.celda(0, f, X.serial(d), sFe); h1.celda(1, f, r.d || '', sTx); h1.celda(2, f, r.n, sTx); h1.celda(3, f, r.e ? _camHora(r.e) : '', sHo);
        h1.celda(4, f, (r.s && !r.adentro) ? _camHora(r.s) : '', sHo); h1.celda(5, f, r.h, sN2);
        h1.celda(6, f, [r.adentro ? 'Todavía adentro' : (r.sinSalida ? 'Sin salida: se contó la jornada' : (r.web ? 'Corregido en la web' : (r.mano ? 'Marcado a mano' : ''))),
                        r.cel ? ((r.celx && r.celx.lejos) ? 'Con su celular, lejos de la puerta' : 'Con su celular') : ''].filter(Boolean).join(' · '), sTx);
        var p=per[r.k] || (per[r.k]={ d:r.d, n:r.n, dias:0, h:0 }); p.dias++; p.h+=r.h; f++;
      });
    });
    if(!hay){ if(bt) bt.disabled=false; toast('Ese mes todavía no tiene marcas.'); return; }
    h1.celda(0, f, 'Total', sTt); for(var c0=1;c0<5;c0++) h1.celda(c0, f, '', sTt); h1.celda(5, f, 0, sT2, 'SUM(F5:F'+(f-1)+')'); h1.celda(6, f, '', sTt);
    h1.congelar={ c:0, r:4 };
    var h2=new X.Hoja('Por persona'); h2.pie='Tareo';
    h2.unir(0, 1, 3, 1, 'Horas de cada uno · '+mesN.toLowerCase(), sTit); h2.altos[1]=22; h2.unir(0, 2, 3, 2, obra, sSub);
    ['Documento', 'Apellidos y nombres', 'Días', 'Horas'].forEach(function(t, i){ h2.celda(i, 4, t, sCab); }); [13, 36, 8, 10].forEach(function(w, i){ h2.anchos[i]=w; });
    var f2=5; Object.keys(per).map(function(k){ return per[k]; }).sort(function(a, b){ return a.n.localeCompare(b.n, 'es'); }).forEach(function(p){
      h2.celda(0, f2, p.d || '', sTx); h2.celda(1, f2, p.n, sTx); h2.celda(2, f2, p.dias, sN0); h2.celda(3, f2, Math.round(p.h*100)/100, sN2); f2++; });
    h2.celda(0, f2, 'Total', sTt); h2.celda(1, f2, '', sTt); h2.celda(2, f2, '', sTt); h2.celda(3, f2, 0, sT2, 'SUM(D5:D'+(f2-1)+')');
    var h3=new X.Hoja('Por día'); h3.pie='Tareo';
    h3.unir(0, 1, 3, 1, 'Horas hombre de cada día · '+mesN.toLowerCase(), sTit); h3.altos[1]=22; h3.unir(0, 2, 3, 2, obra+' · para el registro de horas hombre', sSub);
    ['Fecha', 'Personas', 'Horas hombre', 'Sin salida'].forEach(function(t, i){ h3.celda(i, 4, t, sCab); }); [12, 10, 13, 10].forEach(function(w, i){ h3.anchos[i]=w; });
    var f3=5; porDia.forEach(function(x){ h3.celda(0, f3, X.serial(x.d), sFe); h3.celda(1, f3, x.R.n, sN0); h3.celda(2, f3, x.R.hh, sN2); h3.celda(3, f3, x.R.sinSalida, sN0); f3++; });
    h3.celda(0, f3, 'Total', sTt); h3.celda(1, f3, '', sTt); h3.celda(2, f3, 0, sT2, 'SUM(C5:C'+(f3-1)+')'); h3.celda(3, f3, 0, sT2, 'SUM(D5:D'+(f3-1)+')');
    bajarBlob(X.libro([h1, h2, h3], E, 'Tareo'), nombreArchivo('Tareo - '+obra+' - '+ym)+'.xlsx');
    if(bt) bt.disabled=false;
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar el Excel. Revisa tu conexión.'); });
}
/* ── los ajustes (los mismos de la app: sst_estado «tareo_cfg») ── */
function _tarwAjustes(){
  var c=$('tarw-cuerpo'), cfg=TARW.cfg || _tarwCfg(null);
  var campos=[['refri', 'Refrigerio que se descuenta (minutos)', 0, 180], ['refriDesde', 'Se descuenta a quien estuvo al menos (horas)', 0, 16], ['jor', 'Jornada de la obra: la que se cuenta al que no marcó salida (horas)', 1, 16],
              ['maxDia', 'Aviso de muchas horas en un día (horas)', 1, 24], ['maxSem', 'Aviso de muchas horas en la semana (horas)', 1, 120]];
  c.innerHTML='<div class="tarj"><div class="tarj-cuerpo"><h2 style="margin:0 0 10px">Ajustes del tareo</h2>'+campos.map(function(x){
      return '<div class="campo"><label for="tarj-'+x[0]+'">'+esc(x[1])+'</label><input type="number" id="tarj-'+x[0]+'" min="'+x[2]+'" max="'+x[3]+'" step="1" value="'+cfg[x[0]]+'" style="max-width:140px"></div>'; }).join('')+
    '<p class="msg" id="tarj-msg"></p><div class="acciones"><button type="button" class="bt" id="tarj-ok">Guardar los ajustes</button></div>'+
    '<p class="ayuda">Son los mismos de la app («Tareo ▸ Ajustes»): cambian las horas de todos los días.</p></div></div>';
  $('tarj-ok').onclick=function(){
    var o={}, mal=null;
    campos.forEach(function(x){ var v=parseFloat($('tarj-'+x[0]).value); if(!isFinite(v) || v<x[2] || v>x[3]) mal=mal || x; else o[x[0]]=v; });
    if(mal){ $('tarj-msg').className='msg mal'; $('tarj-msg').textContent='Revisa: «'+mal[1]+'» va de '+mal[2]+' a '+mal[3]+'.'; return; }
    this.disabled=true;
    estadoEscribirP('tareo_cfg', o).then(function(){ TARW.cfg=_tarwCfg(o); toast('Ajustes del tareo guardados. El celular los recibe al abrir el tareo.'); $('tarj-ok').disabled=false; },
      function(){ $('tarj-ok').disabled=false; $('tarj-msg').className='msg mal'; $('tarj-msg').textContent='No se pudo guardar. Revisa tu conexión.'; });
  };
}

/* ══ 2 · EL PARTE DEL DÍA ══════════════════════════════════════════════════════════════════════════════════════════
   El mismo parte de la app (la hoja y el texto los arma la app: parteDoc y parteTextoDe en campo-app.js), con lo de
   la nube: el tareo, los ATS (sst_doc «ats»), las charlas y capacitaciones con su asistencia (sst_asist), los reportes,
   los incidentes y el EPP entregado. Lo que se edita aquí son las notas del día (sst_estado «parte_AAAA-MM-DD»: las
   mismas que escribe el supervisor en la app) y a quién le llega (sst_estado «parte_cfg»). */
var PARW = { caja:null, obra:null, dia:'', D:null, n:0, cfg:null, ed:false, sinConf:false };
function parwVista(caja){
  _camCss(); if(typeof _masCss==='function') _masCss();
  PARW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(PARW.obra!==(YO.obra||{}).id){ PARW.obra=(YO.obra||{}).id; PARW.dia=hoyISO(); PARW.D=null; PARW.cfg=null; PARW.ed=false; }
  if(!PARW.dia) PARW.dia=hoyISO();
  cargando(caja);
  function pinta(silencio){
    if(silencio && PARW.ed) return;   /* lo que se está escribiendo no se pisa con una recarga */
    var n=++PARW.n;
    Promise.all([cargarCampoApp(), cargarEvPDF(), _tarwCfgTraer(), _parwCfgTraer()]).then(function(){ return _parwDatos(PARW.dia); }).then(function(D){
      if(n!==PARW.n || VISTA.actual!=='parte') return;
      PARW.D=D; _parwPintar();
    }).catch(function(cod){ if(n!==PARW.n || VISTA.actual!=='parte') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function _parwCfgTraer(){
  return estadoLeerP('parte_cfg').then(function(f){ var v=(f && f.valor) || {}; PARW.cfg={ jefe:String(v.jefe||'').slice(0, 60), tel:String(v.tel||'').slice(0, 22), correo:String(v.correo||'').slice(0, 120) }; return PARW.cfg; },
    function(){ PARW.cfg=PARW.cfg || { jefe:'', tel:'', correo:'' }; return PARW.cfg; });
}
function _parwSoloOk(p){ return p.then(function(x){ return x; }, function(){ return null; }); }
/* lo del día, de la nube, con la forma de parteDatos de la app */
function _parwDatos(dia){
  var E=_enc(YO.obra.id), d0=new Date(dia+'T00:00:00'), d1=new Date(d0.getTime()+86400000), hoy=hoyISO();
  var D={ dia:dia, gente:{ n:0, adentro:0, hh:0, tareo:false, nombres:[] }, ats:[], noApto:0, charlas:[], acc:[], epp:{ n:0, personas:0 }, visitas:0, pend:[], reportes:null, notas:null };
  return Promise.all([
    _parwSoloOk(_tarwTraer([dia], true)),
    _parwSoloOk(sbGet('sst_doc?'+filtroObra('sst_doc')+'&hoja=eq.ats&select=id,nombre,nota,creado&order=creado.desc&limit=500')),
    _parwSoloOk(sbGet('sst_asist?empresa=eq.'+E+'&inicio=gte.'+_enc(d0.toISOString())+'&inicio=lt.'+_enc(d1.toISOString())+'&select=id,tipo,tema,inicio,fin,minutos,estado&order=inicio.asc&limit=200')),
    _parwSoloOk(sbGet('sst_reporte?empresa=eq.'+E+'&fecha=eq.'+dia+'&select=id,clase,descripcion,lugar,estado,fecha&order=creado.desc&limit=200')),
    _parwSoloOk(sbGet('sst_accidente?'+filtroObra('sst_accidente')+'&fecha=eq.'+dia+'&select=id,clase,descripcion,hora,t_nombre,fecha&limit=100')),
    _parwSoloOk(sbGet('sst_kardex?'+filtroObra('sst_kardex')+'&fecha=eq.'+dia+'&select=trabajador,trab_nombre,fecha&limit=2000')),
    _parwSoloOk(estadoLeerP('parte_'+dia)),
    dia===hoy ? _parwSoloOk(sbGet('sst_reporte?empresa=eq.'+E+'&estado=neq.atendido&select=id&limit=1000')) : Promise.resolve(null)
  ]).then(function(r){
    /* quién trabajó: el tareo de la puerta; sin tareo, los que firmaron los ATS de ese día */
    var R=tarwResumen(dia);
    if(R.n) D.gente={ n:R.n, adentro:R.adentro, hh:R.hh, tareo:true, nombres:R.L.map(function(x){ return x.n; }) };
    /* los ATS de ese día */
    var vistos={}, firmaron={};
    (r[1]||[]).forEach(function(f){
      var n=null; try{ n=(typeof f.nota==='string') ? JSON.parse(f.nota) : f.nota; }catch(e){ n=null; }
      if(!n || n.modo==='modelo' || String(n.fecha||'').slice(0,10)!==dia) return;
      var k=String(n.id || f.nombre || f.id); if(vistos[k]) return; vistos[k]=1;
      var g=Array.isArray(n.gente) ? n.gente : [], est=(typeof atsEstadoDe==='function') ? atsEstadoDe(n) : 'borrador';
      g.forEach(function(x){ if(x && x.tr && (x.n || x.d)) firmaron[String(x.d || x.n)]=x.n || x.d; });
      D.ats.push({ t:n.trabajo || n.area || 'ATS', lugar:[n.area, n.ubic].filter(function(x){ return String(x||'').trim(); }).join(' · '), n:g.length,
                   /* 17/10/2026 · lote 14 · «liberado» = con el V°B° del SSOMA: también cuando ya le toca el cierre o está cerrado */
                   firmas:g.filter(function(x){ return x && x.tr; }).length, est:est, ok:(est==='vigente' || est==='porcerrar' || est==='cerrado'), no:0 });
    });
    if(!D.gente.tareo){ var ns=Object.keys(firmaron).map(function(k){ return firmaron[k]; }); D.gente.n=ns.length; D.gente.nombres=ns.sort(function(a, b){ return String(a).localeCompare(String(b), 'es'); }); }
    /* las charlas y capacitaciones, con cuántos marcaron */
    var ses=(r[2]||[]).filter(function(x){ var t=new Date(x.inicio); return !isNaN(t) && (t.getFullYear()+'-'+dos(t.getMonth()+1)+'-'+dos(t.getDate()))===dia; });
    var pM=ses.length ? _parwSoloOk(_parwMarcas(E, ses)) : Promise.resolve([]);
    return pM.then(function(marcas){
      /* 15/10/2026 · lote 12 · de cada una: cuántos marcaron, cuántos estaban en la obra según el tareo (y cuántos de ellos
         faltaron) y lo que dijeron los que anotaron a mano o con su fotocheck (sql/2026-11-19-asistencia-confirma.sql) */
      var por={}; (marcas||[]).forEach(function(m){ (por[m.sesion]=por[m.sesion]||[]).push(m); });
      var TIP={ charla:'Charla de 5 minutos', reunion:'Reunión', difusion:'Difusión', capacitacion:'Capacitación', induccion:'Inducción', simulacro:'Simulacro', otra:'Asistencia' };
      ses.forEach(function(s){
        var L=por[s.id] || [], T=_parwCobertura(s, R, L), cf={ si:0, no:0, falta:0 };
        L.forEach(function(m){ if(m.metodo!=='fotocheck' && m.metodo!=='mano') return; if(m.confirma==='si') cf.si++; else if(m.confirma==='no') cf.no++; else if(!PARW.sinConf) cf.falta++; });
        D.charlas.push({ tipo:TIP[s.tipo] || 'Asistencia', tema:String(s.tema||''), n:L.length, de:T ? T.n : 0, faltan:T ? T.faltan : 0, cf:PARW.sinConf ? null : cf });
      });
      /* los reportes del día */
      if(r[3]) D.reportes=r[3].filter(function(x){ return String(x.fecha||'').slice(0,10)===dia; }).map(function(x){
        return { clase:x.clase==='acto' ? 'Acto inseguro' : (x.clase==='condicion' ? 'Condición insegura' : 'Reporte'), desc:String(x.descripcion||'').slice(0, 140), lugar:x.lugar || '', abierto:x.estado!=='atendido' }; });
      /* los incidentes y accidentes */
      (r[4]||[]).filter(function(x){ return String(x.fecha||'').slice(0,10)===dia; }).forEach(function(x){ D.acc.push({ clase:(typeof ACC_NOMBRE==='object' && ACC_NOMBRE[x.clase]) || x.clase || 'Evento', desc:String(x.descripcion||'').slice(0, 140), hora:x.hora || '', quien:x.t_nombre || '' }); });
      /* el EPP entregado */
      var pers={}; (r[5]||[]).filter(function(k){ return String(k.fecha||'').slice(0,10)===dia; }).forEach(function(k){ D.epp.n++; pers[k.trabajador || k.trab_nombre || '?']=1; }); D.epp.personas=Object.keys(pers).length;
      /* las notas del día */
      var v=r[6] && r[6].valor;
      D.notas={ dia:dia, hoy:String((v && v.hoy) || ''), manana:String((v && v.manana) || ''), quien:String((v && v.quien) || ''), cuando:(v && +v.cuando) || 0, env:(v && v.enviado) || null };
      /* lo pendiente (solo hoy) */
      if(dia===hoy){
        var sinVB=D.ats.filter(function(a){ return !a.ok; }).length; if(sinVB) D.pend.push({ n:sinVB, t:'ATS de hoy sin el V°B° del SSOMA' });
        if(r[7] && r[7].length) D.pend.push({ n:r[7].length, t:'Reportes abiertos' });
        if(D.gente.tareo && D.gente.adentro) D.pend.push({ n:D.gente.adentro, t:'Personas que no marcaron salida' });
      }
      return D;
    });
  });
}
/* las marcas de las sesiones del día; sin sql/2026-11-19 la columna «confirma» no está (400): se piden sin ella */
function _parwMarcas(E, ses){
  var q=function(cols){ return sbGet('sst_asist_marca?empresa=eq.'+E+'&sesion=in.('+ses.map(function(s){ return _enc('"'+s.id+'"'); }).join(',')+')&estado=eq.ok&select='+cols+'&limit=5000'); };
  if(PARW.sinConf) return q('sesion,doc,nombre,metodo');
  return q('sesion,doc,nombre,metodo,confirma').then(null, function(cod){ if(cod!==400) return Promise.reject(cod); PARW.sinConf=true; return q('sesion,doc,nombre,metodo'); });
}
/* los que estaban en la obra a la hora de la sesión (entraron antes de que terminara y no se habían ido antes de que
   empezara; abierta, «terminar» es ahora) y cuántos de ellos no marcaron. Lo mismo que asisTareoDe de la app. */
function _parwCobertura(s, R, marcas){
  if(!R || !R.n) return null;
  var ini=Date.parse(s.inicio); if(isNaN(ini)) return null;
  var fin=Date.parse(s.fin), hasta=(s.estado==='abierta') ? Math.max(Date.now(), ini) : (!isNaN(fin) ? fin : ini+((+s.minutos)||60)*60000);
  var estaban=R.L.filter(function(r){ return r.e && r.e<=hasta && (r.adentro || !r.s || r.s>=ini); });
  if(!estaban.length) return null;
  var A=_camApp(), doc=function(d){ return A ? A.tarDoc(d) : String(d||'').toUpperCase().replace(/[^0-9A-Z]/g, ''); };
  var nom=function(x){ return String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim(); };
  var ya={}, yaN={}; (marcas||[]).forEach(function(m){ var d=doc(m.doc); if(d) ya[d]=1; if(m.nombre) yaN[nom(m.nombre)]=1; });
  var faltan=estaban.filter(function(r){ var d=doc(r.d); return d ? !ya[d] : !yaN[nom(r.n)]; }).length;
  return { n:estaban.length, faltan:faltan };
}
function _parwPintar(){
  var caja=PARW.caja, D=PARW.D, A=_camApp(); if(!caja || !document.body.contains(caja) || !D) return;
  var hoy=hoyISO(), N=D.notas || {}, cfg=PARW.cfg || {}, nr=D.reportes ? D.reportes.length : '—';
  var h='<div class="aviso" id="parw-que"><b>El parte del día, el mismo de la app.</b> Se arma solo con lo que la obra registró: quién trabajó, los ATS, las charlas, los reportes, los incidentes y el EPP. '+
        'Le sumas las notas del día y lo mandas al jefe: en PDF, por WhatsApp o por correo.</div>';
  h+='<div class="cam-nav"><button type="button" class="bt sec" data-pd="-1" aria-label="Día anterior">‹</button><input type="date" id="parw-f" value="'+D.dia+'" max="'+hoy+'" aria-label="El día">'+
     '<button type="button" class="bt sec" data-pd="1" aria-label="Día siguiente"'+(D.dia>=hoy ? ' disabled' : '')+'>›</button>'+(D.dia!==hoy ? '<button type="button" class="bt sec" data-pd="0">Hoy</button>' : '')+
     '<span style="color:var(--gris);font-size:13px">'+esc(_camFecha(D.dia))+'</span></div>';
  h+='<div class="cam-cifras" id="parw-cifras"><div class="cam-cifra"><b>'+D.gente.n+'</b><span>personas</span></div><div class="cam-cifra"><b>'+D.ats.length+'</b><span>ATS</span></div>'+
     '<div class="cam-cifra"><b>'+nr+'</b><span>reportes</span></div><div class="cam-cifra'+(D.acc.length ? ' mal' : '')+'"><b>'+D.acc.length+'</b><span>incidentes</span></div></div>';
  h+='<div class="cam-acc"><button type="button" class="bt" id="parw-pdf">PDF del parte</button><button type="button" class="bt sec" id="parw-wa">Mandar por WhatsApp</button>'+
     '<button type="button" class="bt sec" id="parw-mail">Mandar por correo</button><button type="button" class="bt sec" id="parw-copiar">Copiar el texto</button><button type="button" class="bt sec" id="parw-a">¿A quién le llega?</button></div>';
  if(N.env && N.env.cuando) h+='<p class="ayuda" id="parw-env">'+(N.env.via==='PDF' ? 'PDF bajado el ' : 'Mandado el ')+esc(new Date(N.env.cuando).toLocaleString('es-PE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }))+(N.env.via ? ' · '+esc(N.env.via) : '')+(N.env.por ? ' · por '+esc(N.env.por) : '')+'.</p>';
  /* las notas */
  h+='<div class="tarj" style="margin:0 0 14px"><div class="tarj-cuerpo" id="parw-notas"><h2 style="margin:0 0 6px;font-size:16px">📝 Notas del día</h2>';
  if(PARW.ed){
    h+='<div class="campo"><label for="parw-hoy">Lo que hay que saber del día</label><textarea id="parw-hoy" rows="4" maxlength="1500">'+esc(N.hoy||'')+'</textarea></div>'+
       '<div class="campo"><label for="parw-man">Para mañana</label><textarea id="parw-man" rows="2" maxlength="1000">'+esc(N.manana||'')+'</textarea></div>'+
       '<p class="msg" id="parw-msg"></p><div class="acciones"><button type="button" class="bt sec" id="parw-no">Cancelar</button><button type="button" class="bt" id="parw-ok">Guardar las notas</button></div>';
  } else {
    if(N.hoy || N.manana){
      if(N.hoy) h+='<p class="mas-texto">'+esc(N.hoy)+'</p>';
      if(N.manana) h+='<p style="margin:8px 0 0"><b>Para mañana:</b> '+esc(N.manana)+'</p>';
      if(N.quien) h+='<p class="ayuda" style="margin:6px 0 0">Escritas por '+esc(N.quien)+(N.cuando ? ' · '+esc(new Date(N.cuando).toLocaleString('es-PE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })) : '')+'.</p>';
    } else h+='<p class="ayuda" style="margin:0">Sin notas. Lo que escribas aquí sale en el parte (y en la app del supervisor).</p>';
    h+='<div class="acciones" style="justify-content:flex-start"><button type="button" class="bt sec" id="parw-ed">✏️ Escribir las notas</button></div>';
  }
  h+='</div></div>';
  /* la hoja, como sale */
  h+='<div class="cam-envoltura" style="padding:4px 14px 12px" id="parw-hoja">';
  function sec(t, cuerpo){ return '<h3 style="margin:14px 0 6px;font-size:14px;color:var(--tinta)">'+t+'</h3>'+cuerpo; }
  h+=sec('👷 Quién trabajó', D.gente.tareo ? '<p>'+D.gente.n+' marcaron en la puerta · '+_camH(D.gente.hh)+' horas hombre'+(D.gente.adentro ? ' · '+D.gente.adentro+' siguen adentro' : '')+'</p>'
                                         : (D.gente.n ? '<p>'+D.gente.n+' firmaron los ATS de ese día (sin tareo de la puerta).</p>' : '<p class="ayuda">Nadie registrado ese día.</p>'))+
     (D.gente.nombres.length ? '<p class="ayuda">'+esc(D.gente.nombres.slice(0, 80).join(' · '))+'</p>' : '');
  h+=sec('📋 ATS', D.ats.length ? '<table class="cam-tabla">'+D.ats.map(function(a){ var E=(typeof ATS_EST==='object' && ATS_EST[a.est]) || { et:a.est, ic:'' };
       return '<tr><td><b>'+esc(a.t)+'</b>'+(a.lugar ? '<br><small style="color:var(--gris)">'+esc(a.lugar)+'</small>' : '')+'</td><td class="n">'+a.firmas+'/'+a.n+' firmas</td><td>'+E.ic+' '+esc(E.et)+'</td></tr>'; }).join('')+'</table>'
     : '<p class="ayuda">Ningún ATS ese día.</p>');
  h+=sec('🗣️ Charlas y capacitaciones', D.charlas.length ? '<table class="cam-tabla">'+D.charlas.map(function(s){
       /* 15/10/2026 · lote 12 · según el tareo, y lo que confirmaron los que anotaron a mano o con su fotocheck */
       var cf=s.cf ? [s.cf.si ? s.cf.si+(s.cf.si===1 ? ' confirmó' : ' confirmaron') : '', s.cf.no ? s.cf.no+(s.cf.no===1 ? ' dijo que no estuvo' : ' dijeron que no estuvieron') : '',
                      s.cf.falta ? s.cf.falta+' por confirmar' : ''].filter(Boolean).join(' · ') : '';
       return '<tr><td><b>'+esc(s.tipo)+'</b>'+(s.tema ? '<br><small style="color:var(--gris)">'+esc(s.tema)+'</small>' : '')+
         (s.de ? '<br><small style="color:var(--gris)">'+s.de+' en la obra según el tareo'+(s.faltan ? ' · <b class="parw-faltan">'+s.faltan+(s.faltan===1 ? ' no marcó' : ' no marcaron')+'</b>' : ' · todos marcaron')+'</small>' : '')+
         (cf ? '<br><small style="color:var(--gris)" class="parw-conf">'+cf+'</small>' : '')+'</td><td class="n">'+s.n+' asistentes</td></tr>'; }).join('')+'</table>'
     : '<p class="ayuda">Ninguna charla registrada ese día.</p>');
  h+=sec('🚨 Reportes de actos y condiciones', D.reportes===null ? '<p class="ayuda">No se pudieron traer.</p>' : (D.reportes.length ? '<table class="cam-tabla">'+D.reportes.map(function(x){
       return '<tr><td><b>'+esc(x.clase)+'</b><br><small style="color:var(--gris)">'+esc(x.desc)+(x.lugar ? ' · '+esc(x.lugar) : '')+'</small></td><td>'+(x.abierto ? '<span class="cam-est ss">Abierto</span>' : '<span class="cam-est ad">Atendido</span>')+'</td></tr>'; }).join('')+'</table>'
     : '<p class="ayuda">Ningún reporte ese día.</p>'));
  h+=sec('🚑 Incidentes y accidentes', D.acc.length ? D.acc.map(function(x){ return '<p><b>'+esc(x.clase)+'</b>'+(x.hora ? ' · '+esc(x.hora) : '')+': '+esc(x.desc)+'</p>'; }).join('') : '<p class="cam-ok" style="font-size:13.5px">✓ Sin incidentes ni accidentes ese día.</p>');
  if(D.epp.n) h+=sec('🦺 EPP entregado', '<p>'+D.epp.n+(D.epp.n===1 ? ' entrega a ' : ' entregas a ')+D.epp.personas+(D.epp.personas===1 ? ' persona.' : ' personas.')+'</p>');
  if(D.dia===hoy) h+=sec('⏳ Pendientes', D.pend.length ? D.pend.map(function(p){ return '<p>'+esc(p.t)+': <b>'+p.n+'</b></p>'; }).join('') : '<p class="cam-ok" style="font-size:13.5px">✓ Nada pendiente.</p>');
  h+='</div>';
  caja.innerHTML=h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-pd]'), function(b){ b.onclick=function(){ var v=+b.getAttribute('data-pd'); var d=v===0 ? hoyISO() : _camDiaMas(PARW.dia, v); if(d>hoyISO()) return; PARW.dia=d; PARW.ed=false; cargando(caja); VISTA.recargar(); }; });
  $('parw-f').onchange=function(){ if(/^\d{4}-\d{2}-\d{2}$/.test(this.value) && this.value<=hoyISO()){ PARW.dia=this.value; PARW.ed=false; cargando(caja); VISTA.recargar(); } };
  $('parw-pdf').onclick=function(){ parwPdf(this); };
  $('parw-wa').onclick=function(){ parwMandar('wa'); };
  $('parw-mail').onclick=function(){ parwMandar('correo'); };
  $('parw-copiar').onclick=function(){ parwMandar('copiar'); };
  $('parw-a').onclick=_parwCfgForm;
  if(PARW.ed){
    $('parw-no').onclick=function(){ PARW.ed=false; _parwPintar(); };
    $('parw-ok').onclick=_parwGuardarNotas;
    setTimeout(function(){ try{ $('parw-hoy').focus(); }catch(e){} }, 30);
  } else $('parw-ed').onclick=function(){ PARW.ed=true; _parwPintar(); };
}
/* las notas: sobre lo que hay en el servidor (el supervisor pudo escribir desde la app), se guarda lo de aquí */
function _parwGuardarNotas(){
  var hoyT=String($('parw-hoy').value||'').trim().slice(0, 1500), man=String($('parw-man').value||'').trim().slice(0, 1000), dia=PARW.D.dia, bt=$('parw-ok'), m=$('parw-msg');
  bt.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
  estadoLeerP('parte_'+dia).then(function(f){
    var v=(f && f.valor && typeof f.valor==='object') ? f.valor : {};
    var nuevo={ v:1, hoy:hoyT, manana:man, quien:_camQuien(), cuando:Date.now() }; if(v.enviado) nuevo.enviado=v.enviado;
    return estadoEscribirP('parte_'+dia, nuevo).then(function(){ PARW.D.notas={ dia:dia, hoy:hoyT, manana:man, quien:nuevo.quien, cuando:nuevo.cuando, env:nuevo.enviado || null }; PARW.ed=false; _parwPintar(); toast('Notas guardadas. Salen en el parte y en la app del supervisor.'); });
  }).catch(function(){ bt.disabled=false; m.className='msg mal'; m.textContent='No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'; });
}
/* a quién le llega: el jefe o el residente, su WhatsApp y su correo (para toda la obra: sst_estado «parte_cfg») */
function _parwCfgForm(){
  var c=PARW.cfg || {};
  abrirHoja('¿A quién le llega el parte?', 'El jefe o el residente de la obra',
    '<div class="campo"><label for="parc-jefe">Nombre</label><input id="parc-jefe" maxlength="60" value="'+esc(c.jefe||'')+'" placeholder="Ing. de la obra"></div>'+
    '<div class="campo"><label for="parc-tel">Su WhatsApp</label><input id="parc-tel" type="tel" maxlength="22" value="'+esc(c.tel||'')+'" placeholder="+51 9…"></div>'+
    '<div class="campo"><label for="parc-correo">Su correo</label><input id="parc-correo" type="email" maxlength="120" value="'+esc(c.correo||'')+'" placeholder="jefe@empresa.com"></div>'+
    '<p class="msg" id="parc-msg"></p><p class="ayuda">Con el código del país. Vale para toda la obra.</p>',
    '<button type="button" class="bt sec" id="parc-no">Cancelar</button><button type="button" class="bt" id="parc-ok">Guardar</button>');
  $('parc-no').onclick=cerrarHoja;
  $('parc-ok').onclick=function(){
    var jefe=String($('parc-jefe').value||'').replace(/\s+/g, ' ').trim().slice(0, 60), tel=String($('parc-tel').value||'').trim(), correo=String($('parc-correo').value||'').trim(), dig=tel.replace(/[^0-9]/g, ''), m=$('parc-msg');
    if(tel && (dig.length<8 || dig.length>15)){ m.className='msg mal'; m.textContent='Revisa el WhatsApp: con el código del país, como +51 987 654 321.'; return; }
    if(correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)){ m.className='msg mal'; m.textContent='Revisa el correo.'; return; }
    this.disabled=true;
    estadoEscribirP('parte_cfg', { jefe:jefe, tel:tel, correo:correo }).then(function(){ PARW.cfg={ jefe:jefe, tel:tel, correo:correo }; cerrarHoja(); toast('Guardado'); },
      function(){ $('parc-ok').disabled=false; m.className='msg mal'; m.textContent='No se pudo guardar. Revisa tu conexión.'; });
  };
}
function _parwAnotarEnvio(via){
  var dia=PARW.D.dia;
  return estadoLeerP('parte_'+dia).then(function(f){
    var v=(f && f.valor && typeof f.valor==='object') ? JSON.parse(JSON.stringify(f.valor)) : { v:1, hoy:'', manana:'' };
    v.enviado={ cuando:Date.now(), via:via, por:_camQuien() };
    return estadoEscribirP('parte_'+dia, v).then(function(){ if(PARW.D && PARW.D.dia===dia){ PARW.D.notas=PARW.D.notas || { dia:dia, hoy:'', manana:'' }; PARW.D.notas.env=v.enviado; } });
  }).catch(function(){ return null; });
}
function parwTexto(){ var A=_camApp(); return A ? A.parteTextoDe(PARW.D, String(nombreObraP()||'')) : ''; }
function parwMandar(via){
  var t=parwTexto(), c=PARW.cfg || {};
  if(!t) return;
  if(via==='copiar'){
    var hecho=function(){ toast('Texto copiado: pégalo donde quieras.'); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(hecho, function(){ toast('No se pudo copiar.'); });
    else { var ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); hecho(); }catch(e){} document.body.removeChild(ta); }
    return;
  }
  if(via==='wa'){
    var num=String(c.tel||'').replace(/[^0-9]/g, '');
    window.open('https://wa.me/'+num+'?text='+encodeURIComponent(t), '_blank', 'noopener');
    _parwAnotarEnvio('WhatsApp').then(function(){ if(VISTA.actual==='parte') _parwPintar(); });
    return;
  }
  var asunto='Parte del día · '+String(nombreObraP()||'')+' · '+PARW.D.dia;
  window.open('mailto:'+encodeURIComponent(c.correo||'')+'?subject='+encodeURIComponent(asunto)+'&body='+encodeURIComponent(t), '_blank');
  _parwAnotarEnvio('correo').then(function(){ if(VISTA.actual==='parte') _parwPintar(); });
}
function parwPdf(bt){
  var A=_camApp(); if(!A) return;
  if(bt) bt.disabled=true;
  try{
    var doc=A.parteDoc(PARW.D, String(nombreObraP()||''), String((YO && YO.nombre) || ''));
    bajarBlob(doc.output('blob'), nombreArchivo('Parte del dia - '+String(nombreObraP()||'obra')+' - '+PARW.D.dia)+'.pdf');
    _parwAnotarEnvio('PDF').then(function(){ if(VISTA.actual==='parte') _parwPintar(); });
  }catch(e){ toast('No se pudo armar el PDF.'); }
  if(bt) bt.disabled=false;
}

/* ══ 3 · LOS PRIMEROS AUXILIOS DE LA OBRA ══════════════════════════════════════════════════════════════════════════
   Los seis casos de la app (PA_CASOS, de campo-app.js) con lo que la obra les cambia —con quién y cuándo, y «volver al
   original»—, los casos propios, una foto por caso, dónde está el botiquín y el centro de salud más cercano, y el
   manual en PDF. Se guarda en sst_doc, hoja «auxilios» (una fila por obra): la app del supervisor y la del trabajador la
   reciben con sst_docs_obra y la página del QR de la estación con sst_emergencia_abrir (sql/2026-11-10-campo-web.sql).
   El paquete y cómo se junta con los seis casos son los de la app (paAuxLimpio, paCasosDe). */
var AUXW = { caja:null, obra:null, pkg:null, ids:[], tels:[], n:0 };
function auxwVista(caja){
  _camCss();
  AUXW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(AUXW.obra!==(YO.obra||{}).id){ AUXW.obra=(YO.obra||{}).id; AUXW.pkg=null; AUXW.ids=[]; }
  cargando(caja);
  function pinta(silencio){
    if(silencio && HOJA.abierta) return;
    var n=++AUXW.n;
    Promise.all([cargarCampoApp(), _auxwTraer(), _auxwTels()]).then(function(){
      if(n!==AUXW.n || VISTA.actual!=='auxilios') return;
      _auxwPintar();
    }).catch(function(cod){ if(n!==AUXW.n || VISTA.actual!=='auxilios') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function _auxwTraer(){
  return sbGet('sst_doc?'+filtroObra('sst_doc')+'&hoja=eq.auxilios&select=id,nota,creado&order=creado.desc&limit=20').then(function(rows){
    var A=_camApp(), r=(rows||[])[0], v=null;
    if(r){ try{ v=(typeof r.nota==='string') ? JSON.parse(r.nota) : r.nota; }catch(e){ v=null; } }
    AUXW.ids=(rows||[]).map(function(x){ return x.id; });
    AUXW.pkg=(A && A.paAuxLimpio(v)) || { v:1, casos:{}, ocultos:[], propios:[], notas:{} };
    return AUXW.pkg;
  });
}
function _auxwTels(){
  return sbGet('sst_emergencia_qr?empresa=eq.'+_enc(YO.obra.id)+'&select=tels').then(function(r){ AUXW.tels=(r && r[0] && Array.isArray(r[0].tels)) ? r[0].tels : []; return AUXW.tels; },
    function(){ AUXW.tels=[]; return []; });
}
/* guardar: sobre la última versión del servidor (otro pudo guardar hace un minuto), un cambio a la vez */
function _auxwCambiar(mutar){
  var A=_camApp();
  return _auxwTraer().then(function(pkg){
    var o=JSON.parse(JSON.stringify(pkg));
    var r=mutar(o);
    if(r===false) return Promise.reject('nada');
    if(r && r.portal) return Promise.reject(r);
    o.v=1; o.quien=_camQuien(); o.cuando=Date.now();
    o=A.paAuxLimpio(o);
    var nota=JSON.stringify(o);
    if(nota.length>110000) return Promise.reject({ portal:'Es demasiado texto para la página del QR: acorta algún caso.' });
    var sube=AUXW.ids.length ? sbPatch('sst_doc?id=eq.'+_enc(AUXW.ids[0]), { nombre:'Primeros auxilios de la obra', nota:nota }).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); })
                             : sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'auxilios', nombre:'Primeros auxilios de la obra', nota:nota }).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); if(Array.isArray(r) && r[0] && r[0].id) AUXW.ids=[r[0].id]; });
    return sube.then(function(){ AUXW.pkg=o; return o; });
  });
}
function _auxwCuando(c){ return c.cuando ? new Date(c.cuando).toLocaleDateString('es-PE', { day:'numeric', month:'short' }) : ''; }
function _auxwPintar(){
  var caja=AUXW.caja, A=_camApp(), o=AUXW.pkg; if(!caja || !document.body.contains(caja) || !A) return;
  var base=A.PA_CASOS, L=A.paCasosDe(o, base), NL=A.paNotasLineas(o), ocultos=o.ocultos || [];
  var h='<div class="aviso" id="auxw-que"><b>Los primeros auxilios de tu obra.</b> Los seis casos de la app —puedes adaptarlos a tu obra— y los tuyos, con su foto, y dónde está el botiquín y el centro de salud más cercano. '+
        'Lo que guardes aquí lo ve tu gente en su app y la página del QR de la estación de emergencia.</div>';
  h+='<div class="cam-acc"><button type="button" class="bt" id="auxw-nuevo">＋ Agregar un caso de la obra</button><button type="button" class="bt sec" id="auxw-pdf">Manual en PDF</button></div>';
  h+='<div class="tarj" style="margin:0 0 14px"><div class="tarj-cuerpo" id="auxw-notas"><h2 style="margin:0 0 6px;font-size:16px">📍 En esta obra</h2>'+
     (NL.length ? NL.map(function(x){ return '<p style="margin:4px 0">'+x[0]+' <b>'+esc(x[1])+':</b> '+esc(x[2])+'</p>'; }).join('') : '<p class="ayuda" style="margin:0">Dónde está el botiquín y la camilla, y cuál es el centro de salud más cercano: sale arriba de los casos y en el cartel de la estación.</p>')+
     '<div class="acciones" style="justify-content:flex-start"><button type="button" class="bt sec" id="auxw-ed-notas">✏️ Escribir los datos de la obra</button></div></div></div>';
  h+='<div class="cam-tarjs" id="auxw-casos">';
  L.forEach(function(x){
    var marca=x.propio ? '<span class="cam-est we">Caso de la obra</span>' : (x.obra ? '<span class="cam-est mu">Adaptado'+(x.quien ? ' por '+esc(x.quien) : '')+(x.cuando ? ' · '+esc(_auxwCuando(x)) : '')+'</span>' : '<span class="cam-est ma">El de la app</span>');
    h+='<div class="tarj" data-caso="'+esc(x.k)+'"><div class="tarj-cuerpo"><h2 style="margin:0 0 4px;font-size:15.5px"><span aria-hidden="true">'+x.ic+'</span> '+esc(x.t)+'</h2>'+marca+
       (x.foto ? '<img src="'+esc(x.foto)+'" alt="" style="width:100%;max-height:140px;object-fit:cover;border-radius:8px;margin:8px 0 0">' : '')+
       '<p class="ayuda" style="margin:6px 0 0">'+x.p.length+(x.p.length===1 ? ' paso' : ' pasos')+(x.no.length ? ' · '+x.no.length+' «no hagas»' : '')+'</p>'+
       '<div class="acciones" style="justify-content:flex-start;gap:6px"><button type="button" class="bt sec chico" data-ed="'+esc(x.k)+'">Editar</button>'+
       (x.obra ? '<button type="button" class="lnk" data-orig="'+esc(x.k)+'">Volver al original</button>' : '')+
       (x.propio ? '<button type="button" class="lnk" data-quitar="'+esc(x.k)+'">Quitar</button>' : '<button type="button" class="lnk" data-ocultar="'+esc(x.k)+'">No usarlo en esta obra</button>')+'</div></div></div>';
  });
  h+='</div>';
  var ocu=base.filter(function(x){ return ocultos.indexOf(x.k)>-1; });
  if(ocu.length) h+='<p class="ayuda" id="auxw-ocultos" style="margin:12px 0 0">No se usan en esta obra: '+ocu.map(function(x){ return esc(x.t)+' <button type="button" class="lnk" data-mostrar="'+esc(x.k)+'">volver a usarlo</button>'; }).join(' · ')+'</p>';
  if(o.quien) h+='<p class="cam-hist">Último cambio: '+esc(o.quien)+(o.cuando ? ' · '+esc(new Date(o.cuando).toLocaleString('es-PE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })) : '')+'.</p>';
  caja.innerHTML=h;
  $('auxw-nuevo').onclick=function(){ _auxwEditor(null); };
  $('auxw-pdf').onclick=function(){ auxwManual(this); };
  $('auxw-ed-notas').onclick=_auxwNotasForm;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ed]'), function(b){ b.onclick=function(){ _auxwEditor(b.getAttribute('data-ed')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-orig]'), function(b){ b.onclick=function(){
    var k=b.getAttribute('data-orig');
    confirmar('¿Volver al original?', 'El caso vuelve a ser el de la app, como estaba antes de adaptarlo. Lo que le cambiaron se pierde.', { si:'Volver al original' }).then(function(si){
      if(!si) return; _auxwCambiar(function(o){ if(!o.casos[k]) return false; delete o.casos[k]; }).then(function(){ toast('Listo: el caso es otra vez el de la app.'); _auxwPintar(); }, _auxwMal); }); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-quitar]'), function(b){ b.onclick=function(){
    var k=b.getAttribute('data-quitar');
    confirmar('¿Quitar este caso?', 'Deja de verse en la app de tu gente y en la página del QR.', { si:'Quitarlo', mal:true }).then(function(si){
      if(!si) return; _auxwCambiar(function(o){ var n=o.propios.length; o.propios=o.propios.filter(function(x){ return x.k!==k; }); if(o.propios.length===n) return false; }).then(function(){ toast('Caso quitado.'); _auxwPintar(); }, _auxwMal); }); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ocultar]'), function(b){ b.onclick=function(){
    var k=b.getAttribute('data-ocultar');
    _auxwCambiar(function(o){ if(o.ocultos.indexOf(k)>-1) return false; o.ocultos.push(k); }).then(function(){ toast('Ese caso ya no sale en esta obra.'); _auxwPintar(); }, _auxwMal); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-mostrar]'), function(b){ b.onclick=function(){
    var k=b.getAttribute('data-mostrar');
    _auxwCambiar(function(o){ var n=o.ocultos.length; o.ocultos=o.ocultos.filter(function(x){ return x!==k; }); if(o.ocultos.length===n) return false; }).then(function(){ toast('Ese caso vuelve a salir.'); _auxwPintar(); }, _auxwMal); }; });
}
function _auxwMal(e){ if(e==='nada') return; toast((e && e.portal) || 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'); }
/* los datos de la obra */
function _auxwNotasForm(){
  var n=(AUXW.pkg && AUXW.pkg.notas) || {};
  var c=function(id, et, v, ph, max, area){ return '<div class="campo"><label for="auxn-'+id+'">'+esc(et)+'</label>'+(area ? '<textarea id="auxn-'+id+'" rows="3" maxlength="'+max+'" placeholder="'+esc(ph)+'">'+esc(v||'')+'</textarea>'
                                                    : '<input id="auxn-'+id+'" maxlength="'+max+'" value="'+esc(v||'')+'" placeholder="'+esc(ph)+'">')+'</div>'; };
  abrirHoja('Los datos de la obra', 'Salen arriba de los casos y en el cartel de la estación',
    c('botiquin', 'Dónde está el botiquín', n.botiquin, 'Caseta de seguridad, junto a la puerta 2', 120)+c('camilla', 'Dónde está la camilla', n.camilla, 'Almacén, al lado del extintor', 120)+
    c('centro', 'Centro de salud más cercano', n.centro, 'Nombre del centro de salud', 120)+c('centroDir', 'Su dirección', n.centroDir, 'Av. …', 120)+c('centroTel', 'Su teléfono', n.centroTel, '01 …', 120)+
    c('libre', 'Algo más que tu gente tenga que saber', n.libre, 'Opcional', 400, true)+'<p class="msg" id="auxn-msg"></p>',
    '<button type="button" class="bt sec" id="auxn-no">Cancelar</button><button type="button" class="bt" id="auxn-ok">Guardar</button>');
  $('auxn-no').onclick=cerrarHoja;
  $('auxn-ok').onclick=function(){
    var v={}; ['botiquin', 'camilla', 'centro', 'centroDir', 'centroTel', 'libre'].forEach(function(k){ v[k]=String($('auxn-'+k).value||'').trim(); });
    this.disabled=true;
    _auxwCambiar(function(o){ o.notas=v; }).then(function(){ cerrarHoja(); toast('Guardado. Lo ve tu gente en su app y en la página del QR.'); _auxwPintar(); },
      function(e){ $('auxn-ok').disabled=false; $('auxn-msg').className='msg mal'; $('auxn-msg').textContent=(e && e.portal) || 'No se pudo guardar. Revisa tu conexión.'; });
  };
}
/* el editor de un caso (k: uno de los seis, uno propio; null: uno nuevo) */
function _auxwEditor(k){
  var A=_camApp(), o=AUXW.pkg, base=null, prop=null;
  A.PA_CASOS.forEach(function(x){ if(x.k===k) base=x; });
  (o.propios||[]).forEach(function(x){ if(x.k===k) prop=x; });
  var x=k ? (A.paCasosDe(o, A.PA_CASOS).filter(function(c){ return c.k===k; })[0] || base || prop) : { ic:'⛑️', t:'', p:[['📞', 'Llama a la emergencia de la obra y al brigadista.']], no:[], papel:[], extra:'', foto:'' };
  if(!x) return;
  var E={ ic:x.ic, t:x.t, p:x.p.map(function(s){ return [s[0], s[1]]; }), no:(x.no||[]).slice(), papel:(x.papel||[]).slice(), extra:x.extra || '', foto:x.foto || '' };
  function pasosHtml(){
    return E.p.map(function(s, i){ return '<div class="cam-fila" style="margin:0 0 6px;align-items:center"><input class="auxe-pic" data-i="'+i+'" value="'+esc(s[0])+'" maxlength="8" style="width:58px;text-align:center" aria-label="Dibujo del paso '+(i+1)+'">'+
      '<input class="auxe-ptx" data-i="'+i+'" value="'+esc(s[1])+'" maxlength="220" style="flex:1;min-width:0" aria-label="Paso '+(i+1)+'">'+
      '<button type="button" class="lnk" data-sube="'+i+'" aria-label="Subir"'+(i ? '' : ' disabled')+'>↑</button><button type="button" class="lnk" data-quita="'+i+'" aria-label="Quitar">✕</button></div>'; }).join('');
  }
  function noHtml(){ return E.no.map(function(t, i){ return '<div class="cam-fila" style="margin:0 0 6px;align-items:center"><input class="auxe-no" data-i="'+i+'" value="'+esc(t)+'" maxlength="160" style="flex:1;min-width:0"><button type="button" class="lnk" data-quitano="'+i+'" aria-label="Quitar">✕</button></div>'; }).join(''); }
  function leer(){
    Array.prototype.forEach.call(document.querySelectorAll('.auxe-pic'), function(e){ var i=+e.getAttribute('data-i'); if(E.p[i]) E.p[i][0]=String(e.value||'').trim(); });
    Array.prototype.forEach.call(document.querySelectorAll('.auxe-ptx'), function(e){ var i=+e.getAttribute('data-i'); if(E.p[i]) E.p[i][1]=String(e.value||''); });
    Array.prototype.forEach.call(document.querySelectorAll('.auxe-no'), function(e){ var i=+e.getAttribute('data-i'); if(E.no[i]!==undefined) E.no[i]=String(e.value||''); });
    E.ic=String($('auxe-ic').value||'').trim(); E.t=String($('auxe-t').value||''); E.extra=String($('auxe-extra').value||'');
    E.papel=[0, 1, 2].map(function(i){ return String(($('auxe-pa'+i)||{}).value||'').trim(); }).filter(Boolean);
  }
  function pinta(){
    $('auxe-pasos').innerHTML=pasosHtml(); $('auxe-nos').innerHTML=noHtml();
    Array.prototype.forEach.call(document.querySelectorAll('[data-sube]'), function(b){ b.onclick=function(){ leer(); var i=+b.getAttribute('data-sube'); if(i>0){ var t=E.p[i]; E.p[i]=E.p[i-1]; E.p[i-1]=t; pinta(); } }; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-quita]'), function(b){ b.onclick=function(){ leer(); E.p.splice(+b.getAttribute('data-quita'), 1); pinta(); }; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-quitano]'), function(b){ b.onclick=function(){ leer(); E.no.splice(+b.getAttribute('data-quitano'), 1); pinta(); }; });
    $('auxe-foto-v').innerHTML=E.foto ? '<img src="'+esc(E.foto)+'" alt="" style="width:132px;height:99px;object-fit:cover;border-radius:9px;border:1px solid var(--raya)"> <button type="button" class="lnk" id="auxe-sinfoto">Quitar la foto</button>' : '<span class="ayuda">Sin foto</span>';
    if($('auxe-sinfoto')) $('auxe-sinfoto').onclick=function(){ leer(); E.foto=''; pinta(); };
  }
  abrirHoja(k ? 'Editar · '+x.t : 'Un caso de la obra', base ? 'Es uno de los seis de la app: lo que cambies queda como «adaptado por la obra», con tu nombre, y se puede volver al original' : 'Sale después de los seis de la app, en tu app y en la página del QR',
    '<div class="cam-fila"><div class="campo" style="max-width:110px;flex:0 0 110px"><label for="auxe-ic">Dibujo</label><input id="auxe-ic" maxlength="8" value="'+esc(E.ic)+'" style="text-align:center"></div>'+
    '<div class="campo"><label for="auxe-t">Título</label><input id="auxe-t" maxlength="60" value="'+esc(E.t)+'" placeholder="¿Qué hago si…?"></div></div>'+
    '<h3 style="margin:12px 0 6px;font-size:14px">Los pasos, en orden</h3><div id="auxe-pasos"></div><button type="button" class="bt sec chico" id="auxe-mas">＋ Agregar un paso</button>'+
    '<h3 style="margin:14px 0 6px;font-size:14px">No hagas</h3><div id="auxe-nos"></div><button type="button" class="bt sec chico" id="auxe-masno">＋ Agregar</button>'+
    '<h3 style="margin:14px 0 6px;font-size:14px">Para el cartel de la estación (lo esencial, en tres líneas)</h3>'+[0, 1, 2].map(function(i){ return '<input id="auxe-pa'+i+'" maxlength="90" value="'+esc(E.papel[i]||'')+'" style="margin:0 0 6px" aria-label="Línea '+(i+1)+' del cartel">'; }).join('')+
    '<div class="campo"><label for="auxe-extra">Una nota aparte (opcional)</label><textarea id="auxe-extra" rows="2" maxlength="220">'+esc(E.extra)+'</textarea></div>'+
    '<h3 style="margin:14px 0 6px;font-size:14px">Foto (opcional)</h3><div class="cam-foto"><div id="auxe-foto-v"></div><div class="acciones"><label class="bt sec chico" for="auxe-file" style="cursor:pointer">Elegir una foto</label><input type="file" id="auxe-file" accept="image/*" hidden></div></div>'+
    '<p class="msg" id="auxe-msg"></p><p class="ayuda">Primeros auxilios básicos, para cualquiera: sin medicamentos ni maniobras de profesional. No reemplaza la capacitación ni la atención médica.</p>',
    '<button type="button" class="bt sec" id="auxe-no">Cancelar</button><button type="button" class="bt" id="auxe-ok">Guardar</button>', { ancha:true });
  pinta();
  $('auxe-no').onclick=cerrarHoja;
  $('auxe-mas').onclick=function(){ leer(); if(E.p.length>=10) return; E.p.push(['•', '']); pinta(); var l=document.querySelectorAll('.auxe-ptx'); if(l.length) try{ l[l.length-1].focus(); }catch(e){} };
  $('auxe-masno').onclick=function(){ leer(); if(E.no.length>=6) return; E.no.push(''); pinta(); };
  $('auxe-file').onchange=function(){
    var f=this.files && this.files[0]; if(!f) return; leer();
    var m=$('auxe-msg'); m.className='msg gris'; m.textContent='Subiendo la foto…';
    achicarFoto(f, 1280, 0.82).then(function(b){ return subirFoto('auxilios', b, 'caso.jpg'); }).then(function(u){ E.foto=u; m.textContent=''; pinta(); },
      function(){ m.className='msg mal'; m.textContent='No se pudo subir la foto. Prueba con otra o revisa tu conexión.'; });
  };
  $('auxe-ok').onclick=function(){
    leer();
    var m=$('auxe-msg'), pasos=E.p.map(function(s){ return [String(s[0]||'').trim() || '•', String(s[1]||'').replace(/\s+/g, ' ').trim()]; }).filter(function(s){ return s[1]; });
    if(!String(E.t).trim()){ m.className='msg mal'; m.textContent='Ponle un título.'; return; }
    if(!pasos.length){ m.className='msg mal'; m.textContent='Pon al menos un paso.'; return; }
    var c={ ic:E.ic || (base ? base.ic : '⛑️'), t:String(E.t).trim(), p:pasos, no:E.no.map(function(t){ return String(t).trim(); }).filter(Boolean), papel:E.papel, extra:String(E.extra).trim(), foto:E.foto, quien:_camQuien(), cuando:Date.now() };
    this.disabled=true;
    _auxwCambiar(function(o){
      if(base){ o.casos[base.k]=c; }
      else if(prop){ o.propios=o.propios.map(function(y){ return y.k===prop.k ? Object.assign({ k:prop.k }, c) : y; }); }
      else { if(o.propios.length>=8) return { portal:'Ya hay 8 casos propios: es el máximo.' }; o.propios.push(Object.assign({ k:'p'+Date.now().toString(36) }, c)); }
    }).then(function(){ cerrarHoja(); toast(base ? 'Caso adaptado. Lo ve tu gente en su app y en la página del QR.' : 'Caso guardado. Lo ve tu gente en su app y en la página del QR.'); _auxwPintar(); },
      function(e){ $('auxe-ok').disabled=false; m.className='msg mal'; m.textContent=(e && e.portal) || 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'; });
  };
}
/* el emoji, como imagen (el PDF no tiene letra de colores): como en la app */
function _auxwEmoji(ch, px){
  try{ var c=document.createElement('canvas'); c.width=c.height=px; var g=c.getContext('2d'); g.textAlign='center'; g.textBaseline='middle';
    g.font=Math.round(px*0.8)+'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; g.fillText(ch, px/2, px/2+px*0.04); return c.toDataURL('image/png'); }catch(e){ return null; }
}
function _auxwImg(url){
  return fetch(url).then(function(r){ return r.ok ? r.blob() : Promise.reject(r.status); }).then(function(b){ return new Promise(function(ok, no){ var fr=new FileReader(); fr.onload=function(){ ok(fr.result); }; fr.onerror=no; fr.readAsDataURL(b); }); })
    .then(null, function(){ return null; });
}
/* el manual en PDF: los números, los datos de la obra y cada caso con sus pasos */
function auxwManual(bt){
  var A=_camApp(); if(!A) return;
  var o=AUXW.pkg, L=A.paCasosDe(o, A.PA_CASOS), NL=A.paNotasLineas(o), obra=String(nombreObraP()||'');
  if(bt) bt.disabled=true;
  Promise.all([cargarEvPDF()].concat(L.map(function(x){ return x.foto ? _auxwImg(x.foto) : Promise.resolve(null); }))).then(function(r){
    var fotos=r.slice(1), doc=new window.jspdf.jsPDF({ unit:'pt', format:'a4' }), W=595.28, H=841.89, M=44, y=0;
    function lugar(n){ if(y+n>H-50){ doc.addPage(); y=60; } }
    doc.setFillColor(196, 22, 42); doc.rect(0, 0, W, 110, 'F'); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
    doc.text('MANUAL DE PRIMEROS AUXILIOS', M, 52); doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.text(obra+'  ·  '+new Date().toLocaleDateString('es-PE', { day:'numeric', month:'long', year:'numeric' }), M, 80, { maxWidth:W-2*M });
    y=140; doc.setTextColor(30, 30, 30);
    var T=AUXW.tels || [];
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text('Números de emergencia de la obra', M, y); y+=22;
    if(T.length) T.forEach(function(x){ doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.text(String(x.t), M, y); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(196, 22, 42); doc.text(String(x.tel), M+200, y); doc.setTextColor(30, 30, 30); y+=22; });
    else { doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.text('Emergencia de la obra: ______________________', M, y); y+=22; }
    if(NL.length){ y+=8; doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text('En esta obra', M, y); y+=20;
      NL.forEach(function(x){ doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); var e=x[1]+': '; doc.text(e, M, y); var w0=doc.getTextWidth(e); doc.setFont('helvetica', 'normal');
        var l=doc.splitTextToSize(x[2], W-2*M-w0); doc.text(l, M+w0, y); y+=l.length*13+4; }); }
    y+=10; doc.setDrawColor(220, 220, 220); doc.line(M, y, W-M, y); y+=24;
    L.forEach(function(x, i){
      lugar(120);
      var im=_auxwEmoji(x.ic, 64); if(im) try{ doc.addImage(im, 'PNG', M, y-22, 30, 30); }catch(e){}
      doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(11, 42, 58); doc.text((i+1)+'. '+x.t, M+40, y); doc.setTextColor(30, 30, 30);
      if(x.propio || x.obra){ doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(110, 110, 110); doc.text(x.propio ? 'Caso de esta obra' : 'Adaptado por la obra', M+40, y+13); doc.setTextColor(30, 30, 30); y+=10; }
      y+=20;
      if(fotos[i]){ try{ var pr=doc.getImageProperties(fotos[i]), fw=200, fh=Math.min(150, fw*pr.height/pr.width); lugar(fh+10); doc.addImage(fotos[i], 'JPEG', M, y-6, fh*pr.width/pr.height, fh); y+=fh+10; }catch(e){} }
      x.p.forEach(function(s, j){ doc.setFont('helvetica', 'normal'); doc.setFontSize(11); var l=doc.splitTextToSize((j+1)+'. '+s[1], W-2*M-20); lugar(l.length*14+4); doc.text(l, M+14, y); y+=l.length*14+4; });
      if(x.extra){ doc.setFont('helvetica', 'italic'); doc.setFontSize(10.5); var le=doc.splitTextToSize(x.extra, W-2*M-20); lugar(le.length*13+4); doc.text(le, M+14, y); y+=le.length*13+4; }
      if(x.no.length){ lugar(30); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(196, 22, 42); doc.text('NO HAGAS', M+14, y+4); doc.setTextColor(30, 30, 30); y+=18;
        x.no.forEach(function(t){ doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); var l=doc.splitTextToSize('· '+t, W-2*M-30); lugar(l.length*13+2); doc.text(l, M+20, y); y+=l.length*13+2; }); }
      y+=18;
    });
    var N=doc.getNumberOfPages();
    for(var p=1; p<=N; p++){ doc.setPage(p); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(120, 120, 120);
      doc.text(A.PA_PIE+'  ·  OBRASST  ·  Página '+p+' de '+N, W/2, H-24, { align:'center' }); }
    bajarBlob(doc.output('blob'), nombreArchivo('Manual de primeros auxilios - '+(obra || 'obra'))+'.pdf');
    if(bt) bt.disabled=false;
  }, function(){ if(bt) bt.disabled=false; toast('No se pudo armar el PDF. Revisa tu conexión.'); });
}

/* ══ 4 · LA CAÍDA LIBRE ════════════════════════════════════════════════════════════════════════════════════════════
   La calculadora de la app (las cuentas, qué hacer y el dibujo son los de la app: clDatos, clCalcular, clQueHacer,
   clDibujo, de campo-app.js), con los andamios por cuerpos, y los espacios de caída de la obra: cada uno con su nombre,
   dónde es y lo que la gente tiene que saber. Van en sst_doc, hoja «caida», una fila por espacio: la cuadrilla los ve en
   su app (sst_docs_obra, sql/2026-11-10-campo-web.sql) con su dibujo y qué hacer. Marcelo: «el espacio de caída lo
   podrá compartir con el trabajador, y pondrá ejemplo con andamios, de acuerdo a su altura, modulación, o en una
   general de trabajo en altura». Los ejemplos para empezar son eso: se cargan, se ajustan a la obra y se guardan. */
var CDLW = { caja:null, obra:null, c:null, lista:[], abierto:'', n:0, nom:'', lugar:'', nota:'' };
var CDLW_EJ = [
  { n:'Andamio de 3 cuerpos de 2 m, anclado a un cuerpo más arriba', c:{ donde:'andamio', tipo:'linea', cu:'3', mod:'2', hasta:'piso', ha:'2' } },
  { n:'Andamio de 3 cuerpos de 2 m, anclado a la baranda', c:{ donde:'andamio', tipo:'linea', cu:'3', mod:'2', hasta:'piso', ha:'1' } },
  { n:'Armando el andamio: si cae por dentro, a la plataforma de abajo', c:{ donde:'andamio', tipo:'linea', cu:'3', mod:'2', hasta:'plat', ha:'2' } },
  { n:'Borde de losa a 6 m, anclado a los pies', c:{ donde:'general', tipo:'linea', h:'6', ha:'0' } },
  { n:'Techo a 3 m, con retráctil arriba de la cabeza', c:{ donde:'general', tipo:'retractil', h:'3', ha:'2' } }
];
function _cdlwBase(x){ var A=_camApp(), c=JSON.parse(JSON.stringify(A.CL_DEF)); delete c.mas; if(x) Object.keys(x).forEach(function(k){ c[k]=String(x[k]); }); return c; }
function cdlwVista(caja){
  _camCss();
  CDLW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(CDLW.obra!==(YO.obra||{}).id){ CDLW.obra=(YO.obra||{}).id; CDLW.c=null; CDLW.lista=[]; CDLW.abierto=''; CDLW.nom=''; CDLW.lugar=''; CDLW.nota=''; }
  cargando(caja);
  function pinta(silencio){
    if(silencio && (HOJA.abierta || (document.activeElement && caja.contains(document.activeElement)))) return;
    var n=++CDLW.n;
    Promise.all([cargarCampoApp(), _cdlwTraer()]).then(function(){
      if(n!==CDLW.n || VISTA.actual!=='caida') return;
      if(!CDLW.c) CDLW.c=_cdlwBase(CDLW_EJ[0].c);
      _cdlwPintar();
    }).catch(function(cod){ if(n!==CDLW.n || VISTA.actual!=='caida') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function _cdlwTraer(){
  return sbGet('sst_doc?'+filtroObra('sst_doc')+'&hoja=eq.caida&select=id,hoja,nombre,nota,creado&order=creado.desc&limit=60').then(function(rows){
    var A=_camApp();
    CDLW.lista=(rows||[]).map(function(r){ return A ? A.cdlLimpio(r) : null; }).filter(Boolean);
    if(CDLW.abierto && !CDLW.lista.some(function(x){ return x.id===CDLW.abierto; })) CDLW.abierto='';
    return CDLW.lista;
  });
}
function _cdlwChip(id, et, on, extra){ return '<button type="button" class="cdlw-chip'+(on ? ' on' : '')+'" aria-pressed="'+!!on+'" id="'+id+'"'+(extra||'')+'>'+esc(et)+'</button>'; }
function _cdlwCampo(k, et, ay, ph, unidad){
  return '<label class="cdlw-l" for="cdlw-'+k+'">'+esc(et)+'</label><div class="cdlw-num"><input id="cdlw-'+k+'" data-k="'+k+'" inputmode="decimal" autocomplete="off" placeholder="'+esc(ph)+'" value="'+esc(String(CDLW.c[k]==null ? '' : CDLW.c[k]))+'"><span>'+esc(unidad||'m')+'</span></div>'+
         (ay ? '<p class="cdlw-ay">'+esc(ay)+'</p>' : '');
}
function _cdlwPintar(){
  var caja=CDLW.caja, A=_camApp(); if(!caja || !document.body.contains(caja) || !A) return;
  var c=CDLW.c, an=c.donde==='andamio', lin=c.tipo!=='retractil', ab=CDLW.abierto ? CDLW.lista.filter(function(x){ return x.id===CDLW.abierto; })[0] : null;
  var h='<div class="aviso" id="cdlw-que"><b>¿Alcanza el espacio de caída?</b> En un andamio, por sus cuerpos, o en cualquier trabajo en altura: la cuenta, su dibujo y qué hacer si no alcanza. '+
        'Lo que guardes para la cuadrilla lo ve tu gente en su app, en «Caída libre».</div>';
  h+='<div class="cdlw-sec">Ejemplos para empezar</div><div class="cdlw-ej">'+CDLW_EJ.map(function(x, i){ return '<button type="button" class="cdlw-chip" data-ej="'+i+'">'+esc(x.n)+'</button>'; }).join('')+'</div>';
  h+='<div class="cdlw-grid"><div class="tarj"><div class="tarj-cuerpo" id="cdlw-form">';
  h+='<div class="cdlw-sec">¿Dónde trabaja?</div><div class="cdlw-chips">'+_cdlwChip('cdlw-gen', 'Trabajo en altura', !an)+_cdlwChip('cdlw-and', 'En un andamio', an)+'</div>';
  h+='<div class="cdlw-sec">¿Con qué está amarrado?</div><div class="cdlw-chips">'+_cdlwChip('cdlw-lin', 'Línea con absorbedor', lin)+_cdlwChip('cdlw-ret', 'Retráctil', !lin)+'</div>';
  if(an){
    h+=_cdlwCampo('cu', 'Cuerpos de andamio hasta su plataforma', 'Cuéntalos del piso a la plataforma donde está parado.', '3', 'cuerpos');
    h+=_cdlwCampo('mod', 'Alto de cada cuerpo', 'Lo dice el fabricante del andamio. Lo común: 2 m o 1.5 m.', '2');
    h+='<div class="cdlw-chips" style="margin-top:7px">'+_cdlwChip('cdlw-m2', '2 m', A.clNum(c.mod)===2)+_cdlwChip('cdlw-m15', '1.5 m', A.clNum(c.mod)===1.5)+'</div>';
    h+='<div class="cdlw-sec">Si cae, ¿hasta dónde llegaría?</div><div class="cdlw-chips">'+_cdlwChip('cdlw-piso', 'Al piso, por fuera del andamio', c.hasta!=='plat')+_cdlwChip('cdlw-plat', 'A la plataforma de abajo, por dentro', c.hasta==='plat')+'</div>';
    h+='<div class="cdl-cuenta" id="cdlw-alto"></div>';
  } else h+=_cdlwCampo('h', 'Del piso donde trabaja al piso de abajo', 'O hasta lo primero que golpearía al caer: una losa, un andamio, una máquina.', '6');
  h+='<div class="cdlw-sec">¿Dónde está el anclaje?</div><div class="cdlw-chips">'+(an
      ? _cdlwChip('cdlw-a-cuerpo', 'A un cuerpo más arriba', false, ' data-anc="cuerpo"')+_cdlwChip('cdlw-a-baranda', 'A la baranda', false, ' data-anc="baranda"')+_cdlwChip('cdlw-a-plataforma', 'A la plataforma, a sus pies', false, ' data-anc="plataforma"')
      : _cdlwChip('cdlw-a-arriba', 'Arriba de la cabeza', false, ' data-anc="arriba"')+_cdlwChip('cdlw-a-espalda', 'A la altura de la espalda', false, ' data-anc="espalda"')+_cdlwChip('cdlw-a-pies', 'A los pies', false, ' data-anc="pies"'))+'</div>';
  h+=_cdlwCampo('ha', 'Altura del anclaje sobre sus pies', 'Si está más abajo que sus pies, en negativo (−0.5).', '2');
  if(lin){ h+=_cdlwCampo('l', 'Largo de la línea', 'Lo dice la etiqueta. La común: 1.8 m.', '1.8'); h+=_cdlwCampo('dd', 'Lo que se estira el absorbedor', 'Lo dice la etiqueta. Si no sabes: 1.2 m.', '1.2'); }
  else h+=_cdlwCampo('ddr', 'Lo que recorre hasta frenar', 'La distancia de detención de su etiqueta. Si no sabes: 1.4 m.', '1.4');
  h+='<details class="cdlw-mas"><summary>Más datos: la persona, el arnés y el margen</summary>'+_cdlwCampo('hd', 'Altura del anillo D en la espalda, parado', 'En una persona de 1.70 m, unos 1.5 m.', '1.5')+
     _cdlwCampo('hs', 'Lo que se estira el arnés', 'Si no sabes: 0.3 m.', '0.3')+_cdlwCampo('m', 'Margen de seguridad', 'Lo que queda libre por si acaso: 1 m.', '1')+'</details>';
  h+='</div></div><div class="tarj"><div class="tarj-cuerpo"><div id="cdlw-res" aria-live="polite"></div></div></div></div>';
  /* guardarlo para la cuadrilla */
  h+='<div class="tarj" style="margin-top:14px"><div class="tarj-cuerpo" id="cdlw-guardar-caja"><h2 style="margin:0 0 4px;font-size:16px">'+(ab ? '✏️ '+esc(ab.nombre) : '📌 Para tu cuadrilla')+'</h2>'+
     '<p class="ayuda" style="margin:0 0 8px">'+(ab ? 'Lo estás cambiando: tu gente ve el cambio en su app al guardar.' : 'Con un nombre que tu gente reconozca: dónde es y qué trabajo. Lo ve en su app, con su dibujo y qué hacer.')+'</p>'+
     '<div class="cam-fila"><div class="campo"><label for="cdlw-nom">Nombre</label><input id="cdlw-nom" maxlength="80" value="'+esc(CDLW.nom)+'" placeholder="Andamio de la fachada norte"></div>'+
     '<div class="campo"><label for="cdlw-lugar">Dónde (opcional)</label><input id="cdlw-lugar" maxlength="120" value="'+esc(CDLW.lugar)+'" placeholder="Torre B, ejes 3 al 5"></div></div>'+
     '<div class="campo"><label for="cdlw-nota">Lo que tu gente tiene que saber (opcional)</label><textarea id="cdlw-nota" rows="2" maxlength="400" placeholder="Dónde está el punto de anclaje, con qué línea se sube…">'+esc(CDLW.nota)+'</textarea></div>'+
     '<p class="msg" id="cdlw-msg"></p><div class="acciones" style="justify-content:flex-start;flex-wrap:wrap">'+
     (ab ? '<button type="button" class="bt" id="cdlw-guardar">Guardar los cambios</button><button type="button" class="bt sec" id="cdlw-copia">Guardar como uno nuevo</button><button type="button" class="bt sec" id="cdlw-otro">Empezar otro</button>'
         : '<button type="button" class="bt" id="cdlw-guardar">Guardar para la cuadrilla</button>')+
     '<button type="button" class="bt sec" id="cdlw-wa">Mandar por WhatsApp</button></div></div></div>';
  /* los de la obra */
  h+='<h2 style="margin:22px 0 10px;font-size:17px">Los espacios de caída de la obra'+(CDLW.lista.length ? ' ('+CDLW.lista.length+')' : '')+'</h2>';
  if(!CDLW.lista.length) h+='<p class="ayuda" id="cdlw-vacio">Todavía no guardaste ninguno. Empieza con un ejemplo, ajústalo a tu obra y guárdalo: tu cuadrilla lo verá en su app.</p>';
  else h+='<div class="cam-tarjs" id="cdlw-lista">'+CDLW.lista.map(function(x){
    var v=A.clDatos(x.d), r=A.clCalcular(v), ve=A.clVeredicto(r);
    return '<div class="tarj cdlw-oc'+(x.id===CDLW.abierto ? ' abierto' : '')+'" data-caida="'+esc(x.id)+'"><div class="tarj-cuerpo"><div class="cdlw-oc"><span class="cdlw-oc-e" aria-hidden="true">'+esc(ve[0].split(' ')[0])+'</span><div style="min-width:0">'+
           '<h2>'+esc(x.nombre)+'</h2><p class="ayuda" style="margin:0">'+(x.lugar ? esc(x.lugar)+' · ' : '')+(v.donde==='andamio' ? 'Andamio '+v.cu+' × '+A.clM(v.mod)+' · ' : '')+A.clM(v.h)+' · '+(v.tipo==='linea' ? 'Línea con absorbedor' : 'Retráctil')+'</p>'+
           '<p class="cam-hist" style="margin:4px 0 0">'+esc(ve[0].replace(/^\S+\s/, ''))+(x.quien ? ' · '+esc(x.quien) : '')+(x.cuando ? ' · '+esc(new Date(x.cuando).toLocaleDateString('es-PE', { day:'numeric', month:'short' })) : '')+'</p></div></div>'+
           '<div class="acciones" style="justify-content:flex-start;gap:6px"><button type="button" class="bt sec chico" data-abrir="'+esc(x.id)+'">Abrir</button><button type="button" class="lnk" data-quitar="'+esc(x.id)+'">Quitar</button></div></div></div>';
  }).join('')+'</div>';
  caja.innerHTML=h;
  _cdlwRes();
  /* los toques */
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ej]'), function(b){ b.onclick=function(){ var x=CDLW_EJ[+b.getAttribute('data-ej')]; CDLW.c=_cdlwBase(x.c); CDLW.abierto=''; CDLW.nom=x.n; CDLW.lugar=''; CDLW.nota=''; _cdlwPintar(); }; });
  function pon(k, v){ _cdlwLeerTextos(); CDLW.c[k]=v; _cdlwPintar(); }
  $('cdlw-gen').onclick=function(){ pon('donde', 'general'); }; $('cdlw-and').onclick=function(){ pon('donde', 'andamio'); };
  $('cdlw-lin').onclick=function(){ pon('tipo', 'linea'); }; $('cdlw-ret').onclick=function(){ pon('tipo', 'retractil'); };
  if($('cdlw-m2')){ $('cdlw-m2').onclick=function(){ pon('mod', '2'); }; $('cdlw-m15').onclick=function(){ pon('mod', '1.5'); };
    $('cdlw-piso').onclick=function(){ pon('hasta', 'piso'); }; $('cdlw-plat').onclick=function(){ pon('hasta', 'plat'); }; }
  Array.prototype.forEach.call(caja.querySelectorAll('[data-anc]'), function(b){ b.onclick=function(){ var x=A.clAnclajeAltura(CDLW.c, b.getAttribute('data-anc')); if(x===null) return; CDLW.c.ha=x; $('cdlw-ha').value=x; _cdlwRes(); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('#cdlw-form input[data-k]'), function(e){ e.oninput=function(){ CDLW.c[e.getAttribute('data-k')]=e.value; _cdlwRes(); }; });
  ['nom', 'lugar', 'nota'].forEach(function(k){ $('cdlw-'+k).oninput=function(){ CDLW[k]=this.value; }; });
  $('cdlw-guardar').onclick=function(){ _cdlwGuardar(this, !!ab); };
  if($('cdlw-copia')) $('cdlw-copia').onclick=function(){ _cdlwGuardar(this, false); };
  if($('cdlw-otro')) $('cdlw-otro').onclick=function(){ CDLW.abierto=''; CDLW.nom=''; CDLW.lugar=''; CDLW.nota=''; _cdlwPintar(); };
  $('cdlw-wa').onclick=function(){ var t=A.clTextoDe(CDLW.c, String(CDLW.nom||'').trim()); if(!t){ toast('Completa los datos de la cuenta.'); return; } window.open('https://wa.me/?text='+encodeURIComponent(t), '_blank'); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-abrir]'), function(b){ b.onclick=function(){
    var x=CDLW.lista.filter(function(y){ return y.id===b.getAttribute('data-abrir'); })[0]; if(!x) return;
    CDLW.c=_cdlwBase(x.d); CDLW.abierto=x.id; CDLW.nom=x.nombre; CDLW.lugar=x.lugar; CDLW.nota=x.nota; _cdlwPintar();
    try{ caja.scrollIntoView({ behavior:'smooth', block:'start' }); }catch(e){} }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-quitar]'), function(b){ b.onclick=function(){
    var id=b.getAttribute('data-quitar'), x=CDLW.lista.filter(function(y){ return y.id===id; })[0]; if(!x) return;
    confirmar('¿Quitar «'+x.nombre+'»?', 'Deja de verse en la app de tu cuadrilla.', { si:'Quitarlo', mal:true }).then(function(si){
      if(!si) return;
      sbDelP('sst_doc?id=eq.'+_enc(id)).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); if(CDLW.abierto===id){ CDLW.abierto=''; } return _cdlwTraer(); })
        .then(function(){ toast('Quitado. Tu cuadrilla ya no lo ve.'); _cdlwPintar(); }, function(){ toast('No se pudo quitar. Revisa tu conexión e inténtalo otra vez.'); });
    }); }; });
}
function _cdlwLeerTextos(){ ['nom', 'lugar', 'nota'].forEach(function(k){ var e=$('cdlw-'+k); if(e) CDLW[k]=e.value; }); }
/* el resultado: el de la app (veredicto, dibujo, la cuenta y qué hacer) */
function _cdlwRes(){
  var A=_camApp(), c=$('cdlw-res'); if(!c || !A) return;
  var v=A.clDatos(CDLW.c), al=$('cdlw-alto');
  if(al) al.innerHTML=(v.donde==='andamio' && v.mal!=='cu' && v.mal!=='mod') ? '<div class="cdl-f"><span>Altura de la plataforma</span><b>'+A.clM(v.alto)+'</b></div>'+(v.hasta==='plat' ? '<div class="cdl-f"><span>Hasta la plataforma de abajo</span><b>'+A.clM(v.mod)+'</b></div>' : '') : '';
  if(v.mal){ c.innerHTML='<div class="cdl-falta">'+esc(A.CL_MAL[v.mal])+'</div>'; return; }
  var r=A.clCalcular(v), ve=A.clVeredicto(r), lin=v.tipo==='linea', q=A.clQueHacer(v, r);
  c.innerHTML='<div class="cdl-ver '+r.estado+'" id="cdlw-ver"><b>'+ve[0]+'</b><p>'+ve[1]+'</p></div>'+A.clDibujo(v, r)+
    '<div class="cdl-cuenta" id="cdlw-cuenta">'+A.clFila('cdl-c-ff', 'Caída libre', A.clM(r.ff))+A.clFila('cdl-c-dd', lin ? 'Lo que se estira el absorbedor' : 'Lo que recorre el retráctil hasta frenar', A.clM(r.dd))+
    A.clFila('cdl-c-hs', 'Lo que se estira el arnés', A.clM(r.hs))+A.clFila('cdl-c-m', 'Margen de seguridad', A.clM(r.m))+
    '<div class="cdl-f cdl-tot"><span>Necesita libre debajo de sus pies</span><b>'+A.clM(r.nec)+'</b></div><div class="cdl-f"><span>Hay libre debajo</span><b>'+A.clM(v.h)+'</b></div>'+
    '<div class="cdl-f '+(r.sobra<-1e-9 ? 'falta' : 'sobra')+'"><span>'+(r.sobra<-1e-9 ? 'Falta espacio' : 'Sobra espacio')+'</span><b>'+A.clM(Math.abs(r.sobra))+'</b></div></div>'+
    (q.length ? '<div class="cdl-sug" id="cdlw-sug"><b>Qué hacer</b><ul>'+q.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul></div>' : '')+
    '<p class="cdl-pendulo">↔️ Si el anclaje no está justo encima, al caer se balancea y puede golpear de costado: ancla lo más vertical que se pueda.</p>'+
    '<p class="cdlw-ay">Usa los datos de la etiqueta y la ficha de tu equipo: esta cuenta es una guía y manda lo que diga el fabricante.</p>';
}
/* guardar: nuevo (POST) o los cambios del abierto (PATCH) */
function _cdlwGuardar(bt, cambios){
  var A=_camApp(), m=$('cdlw-msg'); _cdlwLeerTextos();
  var nom=String(CDLW.nom||'').replace(/\s+/g, ' ').trim();
  if(!nom){ m.className='msg mal'; m.textContent='Ponle un nombre que tu gente reconozca.'; $('cdlw-nom').focus(); return; }
  if(A.clDatos(CDLW.c).mal){ m.className='msg mal'; m.textContent='Completa los datos de la cuenta: '+A.CL_MAL[A.clDatos(CDLW.c).mal]; return; }
  var nota=A.cdlNota(CDLW.c, CDLW.lugar, CDLW.nota, _camQuien());
  bt.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
  var p=(cambios && CDLW.abierto) ? sbPatch('sst_doc?id=eq.'+_enc(CDLW.abierto), { nombre:nom, nota:nota }).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); })
                                 : sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'caida', nombre:nom, url:null, nota:nota }).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); if(Array.isArray(r) && r[0] && r[0].id) CDLW.abierto=r[0].id; });
  p.then(function(){ return _cdlwTraer(); }).then(function(){
    toast(cambios ? 'Guardado. Tu cuadrilla ya ve el cambio en su app.' : 'Guardado. Tu cuadrilla lo ve en su app, en «Caída libre».'); _cdlwPintar();
  }, function(){ bt.disabled=false; m.className='msg mal'; m.textContent='No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'; });
}

/* ══ 5 · EL LEGAJO SST ═════════════════════════════════════════════════════════════════════════════════════════════
   Marcelo: «el legajo … qué cosas se pueden ver, qué cosas no»; eligió «qué secciones lleva el PDF» y «que el
   trabajador vea el suyo». Aquí: las secciones (sst_estado «legajo_cfg», las lee la app al armarlo y el servidor al
   mandárselo al trabajador) y el PDF de cada uno con lo de la nube (sst_legajo_de, sql/2026-11-11-legajo.sql), con el
   mismo dibujo de la app (legPdfDe, de campo-app.js). */
var LEGW = { caja:null, obra:null, cfg:null, trabs:[], n:0, q:'', sinSql:false };
function legwVista(caja){
  _camCss();
  LEGW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(LEGW.obra!==(YO.obra||{}).id){ LEGW.obra=(YO.obra||{}).id; LEGW.cfg=null; LEGW.trabs=[]; LEGW.q=''; LEGW.sinSql=false; }
  cargando(caja);
  function pinta(silencio){
    if(silencio && (HOJA.abierta || (document.activeElement && caja.contains(document.activeElement)))) return;
    var n=++LEGW.n;
    Promise.all([cargarCampoApp(), estadoLeerP('legajo_cfg'), sbGet('sst_trabajador?'+filtroObra('sst_trabajador')+'&select=id,nombre,dni,td,puesto,area,estatus&order=nombre.asc&limit=3000')]).then(function(r){
      if(n!==LEGW.n || VISTA.actual!=='legajo') return;
      var A=_camApp(); LEGW.cfg=A.legCfgLimpio(r[1] && r[1].valor); LEGW.trabs=r[2]||[];
      _legwPintar();
    }).catch(function(cod){ if(n!==LEGW.n || VISTA.actual!=='legajo') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function _legwPintar(){
  var caja=LEGW.caja, A=_camApp(); if(!caja || !document.body.contains(caja) || !A) return;
  var cfg=LEGW.cfg, q=String(LEGW.q||'').trim().toLowerCase();
  var h='<div class="aviso" id="legw-que"><b>El legajo SST de cada trabajador, en PDF.</b> Lo que la obra registró de él: su inducción, sus capacitaciones con su nota, su EPP, la aptitud de su examen médico, sus amonestaciones y más, ordenado y numerado. '+
        'Aquí eliges qué secciones lleva y si cada uno ve el suyo en su app.</div>';
  h+='<div class="tarj" style="margin:0 0 14px"><div class="tarj-cuerpo" id="legw-cfg"><h2 style="margin:0 0 4px;font-size:16px">Qué lleva el legajo</h2>'+
     '<p class="ayuda" style="margin:0">Los datos del trabajador van siempre. Lo que apagues no sale en el PDF (ni en la web ni en la app) ni en lo que ve el trabajador.</p><div class="legw-secs">'+
     A.LEG_SECS.map(function(x){ return '<label><input type="checkbox" data-sec="'+x.k+'"'+(A.legSecOn(cfg, x.k) ? ' checked' : '')+'> '+esc(x.n)+'</label>'; }).join('')+'</div>'+
     '<p class="ayuda" style="margin:0 0 8px">Las habilitaciones y el SCTR salen en el legajo que se saca desde la app: se arman con lo que tiene el celular del supervisor.</p>'+
     '<label class="legw-trab"><input type="checkbox" id="legw-ver"'+(cfg.trab ? ' checked' : '')+'> Cada trabajador ve el suyo en su app, en «Mi legajo» (con estas mismas secciones)</label>'+
     (cfg.quien ? '<p class="cam-hist" style="margin:8px 0 0">Último cambio: '+esc(cfg.quien)+(cfg.cuando ? ' · '+esc(new Date(cfg.cuando).toLocaleDateString('es-PE', { day:'numeric', month:'short', year:'numeric' })) : '')+'.</p>' : '')+
     '<p class="msg" id="legw-msg"></p><div class="acciones" style="justify-content:flex-start"><button type="button" class="bt" id="legw-guardar">Guardar</button></div></div></div>';
  var L=LEGW.trabs.filter(function(t){ return !q || String(t.nombre||'').toLowerCase().indexOf(q)>-1 || String(t.dni||'').indexOf(q)>-1; })
    .sort(function(a, b){ var ca=(a.estatus||'activo')==='cesado', cb=(b.estatus||'activo')==='cesado'; return ca!==cb ? (ca ? 1 : -1) : String(a.nombre||'').localeCompare(String(b.nombre||'')); });
  h+='<h2 style="margin:6px 0 10px;font-size:17px">El legajo de cada uno ('+LEGW.trabs.length+')</h2>';
  h+='<input class="legw-q" id="legw-q" type="search" placeholder="Buscar por nombre o documento" value="'+esc(LEGW.q)+'" aria-label="Buscar trabajador">';
  if(LEGW.sinSql) h+='<div class="aviso ojo" id="legw-sinsql">El legajo en la web todavía no está activo en el servidor. Mientras tanto, sácalo desde la app (en la ficha de cada trabajador).</div>';
  if(!L.length) h+='<p class="ayuda" id="legw-vacio">'+(LEGW.trabs.length ? 'Nadie con ese nombre o documento.' : 'Todavía no hay personal en la obra.')+'</p>';
  else h+='<div class="cam-envoltura"><table class="cam-tabla" id="legw-lista"><thead><tr><th>Trabajador</th><th>Documento</th><th>Puesto</th><th></th></tr></thead><tbody>'+L.slice(0, 300).map(function(t){
    var ces=(t.estatus||'activo')==='cesado';
    return '<tr><td><b>'+esc(t.nombre||'—')+'</b>'+(ces ? ' <span class="cam-est ma">Cesado</span>' : '')+'</td><td>'+esc((t.td||'DNI')+' '+(t.dni||''))+'</td><td>'+esc(t.puesto||'')+'</td>'+
           '<td class="n"><button type="button" class="bt sec chico" data-pdf="'+esc(t.id)+'">PDF</button></td></tr>'; }).join('')+'</tbody></table></div>'+
     (L.length>300 ? '<p class="ayuda">Se muestran los primeros 300: busca por nombre o documento.</p>' : '');
  caja.innerHTML=h;
  $('legw-q').oninput=function(){ var v=this.value, pos=this.selectionStart; LEGW.q=v; _legwPintar(); var e=$('legw-q'); if(e){ e.focus(); try{ e.setSelectionRange(pos, pos); }catch(x){} } };
  $('legw-guardar').onclick=function(){
    var secs={}; Array.prototype.forEach.call(caja.querySelectorAll('[data-sec]'), function(e){ if(!e.checked) secs[e.getAttribute('data-sec')]=false; });
    var v={ v:1, secs:secs, trab:!!$('legw-ver').checked, quien:_camQuien(), cuando:Date.now() }, bt=this, m=$('legw-msg');
    bt.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
    estadoEscribirP('legajo_cfg', v).then(function(){ LEGW.cfg=A.legCfgLimpio(v); toast('Guardado. Así sale el legajo desde ahora.'); _legwPintar(); },
      function(){ bt.disabled=false; m.className='msg mal'; m.textContent='No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'; });
  };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-pdf]'), function(b){ b.onclick=function(){ legwPdf(b.getAttribute('data-pdf'), b); }; });
}
function legwPdf(id, bt){
  var A=_camApp(); if(!A) return;
  var t=LEGW.trabs.filter(function(x){ return String(x.id)===String(id); })[0]; if(!t) return;
  if(bt) bt.disabled=true;
  var listo=function(){ if(bt) bt.disabled=false; };
  Promise.all([cargarEvPDF(), sbRpc('sst_legajo_de', { p_trab:id })]).then(function(r){
    var j=r[1]; listo();
    if(!j || !j.ok || !j.legajo){ toast(j && j.motivo==='no_eres_de_la_obra' ? 'Ese trabajador no es de tu obra.' : 'No se pudo armar el legajo. Inténtalo otra vez.'); return; }
    var D=A.legDeServidor(j.legajo);
    var doc=A.legPdfDe(D, { obra:j.legajo.obra || String(nombreObraP()||''), emp:'', sup:_camQuien(), cfg:A.legCfgLimpio({ secs:j.legajo.secs }), hoy:String(j.legajo.hoy||'').slice(0, 10) });
    bajarBlob(doc.output('blob'), nombreArchivo('Legajo SST - '+(t.nombre||t.dni||'trabajador'))+'.pdf');
  }, function(cod){
    listo();
    if(cod===404){ LEGW.sinSql=true; _legwPintar(); return; }
    toast('No se pudo armar el legajo. Revisa tu conexión e inténtalo otra vez.');
  });
}

/* ══ 6 · LA ALARMA DE SIMULACRO ════════════════════════════════════════════════════════════════════════════════════
   Marcelo: «de los simulacros programados por el mismo supervisor o líder, que tenga una alarma así como en el Perú
   cuando hay un simulacro multipeligro»; a toda la obra o a los que elija. Va dentro de «Simulacros» (gestion.js la
   pide): las alarmas de la obra (sst_alarma, sql/2026-11-12-alarma.sql), programar una (del simulacro o suelta), cambiarla,
   anularla y quiénes tocaron «Llegué al punto de reunión». Los avisos de cada tipo son los de la app (ALR_MSG). */
var ALRW = { caja:null, lista:[], lleg:{}, gente:null, sinSql:false, n:0 };
function alrwVista(caja){
  if(!caja) return;
  _camCss(); ALRW.caja=caja;
  var n=++ALRW.n;
  caja.innerHTML='<div class="tarj-cuerpo"><p class="ayuda">Cargando las alarmas…</p></div>';
  Promise.all([cargarCampoApp(), _alrwTraer()]).then(function(){ if(n===ALRW.n) _alrwPintar(); }, function(){ if(n===ALRW.n) _alrwPintar(); });
}
function _alrwTraer(){
  return sbGet('sst_alarma?'+filtroObra('sst_alarma')+'&select=id,tipo,titulo,mensaje,punto,cuando,para,sim,estado,push_enviado,push_n,quien&order=cuando.desc&limit=40').then(function(r){
    ALRW.sinSql=false; ALRW.lista=Array.isArray(r) ? r : [];
    _alrwDespertadores();
    var ids=ALRW.lista.map(function(a){ return a.id; });
    if(!ids.length){ ALRW.lleg={}; return; }
    return sbGet('sst_alarma_llegada?alarma=in.('+ids.map(_enc).join(',')+')&select=alarma,nombre,doc,cuando&order=cuando.asc').then(function(L){
      ALRW.lleg={}; (L||[]).forEach(function(l){ (ALRW.lleg[l.alarma]=ALRW.lleg[l.alarma]||[]).push(l); });
    }, function(){ ALRW.lleg={}; });
  }, function(cod){ if(cod===404){ ALRW.sinSql=true; ALRW.lista=[]; return; } return Promise.reject(cod); });
}
/* con la web abierta a la hora, también despierta a la función que manda las notificaciones (una vez por alarma) */
function _alrwDespertadores(){
  ALRW.timers=ALRW.timers || {};
  Object.keys(ALRW.timers).forEach(function(k){ clearTimeout(ALRW.timers[k]); }); ALRW.timers={};
  ALRW.lista.forEach(function(a){
    if(a.estado==='anulada' || a.push_enviado) return;
    var ms=Date.parse(a.cuando)-Date.now();
    if(ms>-30*60000 && ms<24*3600000) ALRW.timers[a.id]=setTimeout(function(){
      try{ var k='obrasst_alarma_desp_'+a.id; if(sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); }catch(e){}
      sbFetch(SB.url+'/functions/v1/aviso-falla', { method:'POST', body:JSON.stringify({ accion:'alarmas' }) }).catch(function(){});
    }, Math.max(0, ms)+1500);
  });
}
function _alrwHora(ms){ var d=new Date(ms); return dos(d.getHours())+':'+dos(d.getMinutes()); }
function _alrwTitulo(tipo){ var t=(typeof simTipo==='function') ? simTipo(tipo) : null, n=t ? String(t[2]||'').split(' / ')[0].split(' (')[0] : 'emergencia'; return ('Simulacro de '+(n||'emergencia')).toUpperCase().slice(0, 60); }
function _alrwMsg(tipo){ var A=_camApp(); return (A && A.alrMsgDe) ? A.alrMsgDe(tipo) : 'Evacúa con calma por la ruta señalizada al punto de reunión.'; }
function _alrwPintar(){
  var caja=ALRW.caja; if(!caja || !document.body.contains(caja)) return;
  var h='<div class="tarj-cuerpo" id="alrw-cuerpo"><h2 style="margin:0 0 4px;font-size:16px">🚨 Alarma en los celulares</h2>'+
        '<p class="ayuda" style="margin:0 0 10px">A la hora, el celular de tu gente muestra un aviso grande de SIMULACRO, con sirena y el botón «Llegué al punto de reunión»; los que lo tocan se ven aquí y en «¿Quién falta?» de la app. '+
        'Con la app cerrada les llega una notificación, si la activaron. Con el celular en silencio no suena: eso solo lo puede hacer la alerta del Estado.</p>';
  if(ALRW.sinSql){ caja.innerHTML=h+'<div class="aviso ojo" id="alrw-sinsql">La alarma de simulacro todavía no está activa en el servidor.</div></div>'; return; }
  h+='<div class="cam-acc"><button type="button" class="bt" id="alrw-nueva">Programar una alarma</button></div>';
  var ahora=Date.now();
  if(!ALRW.lista.length) h+='<p class="ayuda" id="alrw-vacio">Ninguna alarma todavía.</p>';
  else h+='<div class="cam-envoltura"><table class="cam-tabla" id="alrw-lista"><thead><tr><th>Cuándo</th><th>El aviso</th><th>Para</th><th>Estado</th><th class="n">Llegaron</th><th></th></tr></thead><tbody>'+
    ALRW.lista.map(function(a){
      var ms=Date.parse(a.cuando), ya=a.estado!=='anulada' && (!!a.push_enviado || ms<=ahora), L=ALRW.lleg[a.id]||[];
      var est=a.estado==='anulada' ? '<span class="cam-est ma">Anulada</span>' : (ya ? '<span class="cam-est ss">Sonó</span>'+(a.push_n!=null ? ' <span class="ayuda">'+esc(a.push_n)+' notif.</span>' : '') : '<span class="cam-est we">Programada</span>');
      return '<tr data-alr="'+esc(a.id)+'"><td><b>'+esc(_alrwHora(ms))+'</b> <span class="ayuda">'+esc(fechaLarga(isoL(new Date(ms))))+'</span></td>'+
             '<td><b>'+esc(a.titulo)+'</b>'+(a.punto ? '<br><span class="ayuda">'+esc(a.punto)+'</span>' : '')+'</td>'+
             '<td>'+(Array.isArray(a.para) ? esc(a.para.length)+' '+(a.para.length===1 ? 'persona' : 'personas') : 'Toda la obra')+'</td><td>'+est+'</td>'+
             '<td class="n">'+(L.length ? '<button type="button" class="lnk" data-lleg="'+esc(a.id)+'">'+L.length+'</button>' : '0')+'</td>'+
             '<td class="n">'+(a.estado==='anulada' ? '' : ((!ya ? '<button type="button" class="lnk" data-cambiar="'+esc(a.id)+'">Cambiar</button> ' : '')+'<button type="button" class="lnk" data-anular="'+esc(a.id)+'" style="margin-left:10px">Anular</button>'))+'</td></tr>';
    }).join('')+'</tbody></table></div>';
  h+='</div>';
  caja.innerHTML=h;
  $('alrw-nueva').onclick=function(){ _alrwForm(null); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-cambiar]'), function(b){ b.onclick=function(){ _alrwForm(ALRW.lista.filter(function(x){ return x.id===b.getAttribute('data-cambiar'); })[0] || null); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-anular]'), function(b){ b.onclick=function(){
    var id=b.getAttribute('data-anular');
    confirmar('¿Anular la alarma?', 'Ya no va a sonar en los celulares de tu gente.', { si:'Anular', mal:true }).then(function(si){
      if(!si) return;
      sbPatch('sst_alarma?id=eq.'+_enc(id), { estado:'anulada' }).then(function(){ return _alrwTraer(); }).then(function(){ toast('Alarma anulada.'); _alrwPintar(); }, function(){ toast('No se pudo anular. Revisa tu conexión.'); });
    }); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-lleg]'), function(b){ b.onclick=function(){
    var a=ALRW.lista.filter(function(x){ return x.id===b.getAttribute('data-lleg'); })[0], L=ALRW.lleg[a.id]||[];
    abrirHoja('Llegaron al punto de reunión', a.titulo+' · '+_alrwHora(Date.parse(a.cuando)),
      '<ul style="margin:0;padding-left:18px">'+L.map(function(l){ return '<li style="margin:4px 0"><b>'+esc(_alrwHora(Date.parse(l.cuando)))+'</b> · '+esc(l.nombre||l.doc||'—')+'</li>'; }).join('')+'</ul>',
      '<button type="button" class="bt" id="alrw-ok">Listo</button>');
    $('alrw-ok').onclick=cerrarHoja; }; });
}
/* programar (a = null) o cambiar una alarma */
function _alrwForm(a){
  var sims=(typeof SIMW==='object' && Array.isArray(SIMW.filas)) ? SIMW.filas.filter(function(f){ return f.d.estado!=='hecho' && String(f.d.fecha||'')>=hoyISO(); }) : [];
  var tipos=(typeof simTipos==='function') ? simTipos() : [['multi', '🚨', 'Multipeligro']];
  var base=a ? new Date(a.cuando) : new Date(Date.now()+60*60000);
  var F={ dia:isoL(base), hora:_alrwHora(base.getTime()), tipo:a ? a.tipo : (tipos[0] ? tipos[0][0] : 'multi'), titulo:a ? a.titulo : '', mensaje:a ? (a.mensaje||'') : '', punto:a ? (a.punto||'') : '',
          todos:!(a && Array.isArray(a.para)), elegidos:(a && Array.isArray(a.para)) ? a.para.slice() : [], sim:a ? (a.sim||'') : '', q:'' };
  if(!a){ F.titulo=_alrwTitulo(F.tipo); F.mensaje=_alrwMsg(F.tipo); }
  var tituloTocado=!!a, msgTocado=!!a;
  function gente(){ return (ALRW.gente||[]).filter(function(t){ return (t.estatus||'activo')!=='cesado'; }); }
  function pintaGente(){
    var g=$('alrw-g'); if(!g) return;
    if(F.todos){ g.innerHTML=''; return; }
    var q=String(F.q||'').toLowerCase(), L=gente().filter(function(t){ return !q || String(t.nombre||'').toLowerCase().indexOf(q)>-1; });
    g.innerHTML='<input id="alrw-q" type="search" placeholder="Buscar por nombre" value="'+esc(F.q)+'" style="margin:6px 0">'+
      '<div style="max-height:220px;overflow:auto;display:grid;gap:4px">'+L.map(function(t){ var on=F.elegidos.indexOf(String(t.id))>-1;
        return '<label class="legw-trab" style="margin:0"><input type="checkbox" data-alrw-g="'+esc(t.id)+'"'+(on ? ' checked' : '')+'> '+esc(t.nombre||t.dni||'')+'</label>'; }).join('')+'</div>'+
      '<p class="ayuda" style="margin:4px 0 0">'+F.elegidos.length+(F.elegidos.length===1 ? ' elegida' : ' elegidas')+'</p>';
    $('alrw-q').oninput=function(){ F.q=this.value; pintaGente(); var e=$('alrw-q'); if(e){ e.focus(); try{ e.setSelectionRange(F.q.length, F.q.length); }catch(x){} } };
    Array.prototype.forEach.call(g.querySelectorAll('[data-alrw-g]'), function(c){ c.onchange=function(){ var id=c.getAttribute('data-alrw-g'); F.elegidos=F.elegidos.filter(function(x){ return x!==id; }); if(c.checked) F.elegidos.push(id); pintaGente(); }; });
  }
  abrirHoja(a ? 'Cambiar la alarma' : 'Programar una alarma', 'A la hora, el aviso grande de SIMULACRO en el celular de tu gente',
    (sims.length ? '<div class="campo"><label for="alrw-sim">Del simulacro (opcional)</label><select id="alrw-sim"><option value="">Ninguno</option>'+sims.map(function(f){ var t=simTipo(f.d.tipo), v=String(f.d.app||f.id);
        return '<option value="'+esc(v)+'"'+(F.sim===v ? ' selected' : '')+'>'+esc(t[2]+' · '+fechaLarga(f.d.fecha)+(f.d.hora ? ' '+f.d.hora : ''))+'</option>'; }).join('')+'</select></div>' : '')+
    '<div class="cam-fila"><div class="campo"><label for="alrw-dia">Día</label><input id="alrw-dia" type="date" value="'+esc(F.dia)+'"></div><div class="campo"><label for="alrw-hora">Hora</label><input id="alrw-hora" type="time" value="'+esc(F.hora)+'"></div></div>'+
    '<div class="campo"><label for="alrw-tipo">Tipo de simulacro</label><select id="alrw-tipo">'+tipos.map(function(t){ return '<option value="'+esc(t[0])+'"'+(F.tipo===t[0] ? ' selected' : '')+'>'+esc(t[1]+' '+t[2])+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label for="alrw-tit">Lo que dice en grande</label><input id="alrw-tit" maxlength="60" value="'+esc(F.titulo)+'"></div>'+
    '<div class="campo"><label for="alrw-msg">Qué hacer</label><textarea id="alrw-msg" rows="2" maxlength="200">'+esc(F.mensaje)+'</textarea></div>'+
    '<div class="campo"><label for="alrw-punto">Punto de reunión</label><input id="alrw-punto" maxlength="120" value="'+esc(F.punto)+'"></div>'+
    '<div class="campo"><span class="lbl" style="display:block;margin-bottom:4px">¿A quién le suena?</span><label class="legw-trab"><input type="radio" name="alrw-para" id="alrw-todos"'+(F.todos ? ' checked' : '')+'> A toda la obra</label>'+
    '<label class="legw-trab"><input type="radio" name="alrw-para" id="alrw-elegir"'+(!F.todos ? ' checked' : '')+'> A los que elija</label><div id="alrw-g"></div></div>'+
    '<p class="msg" id="alrw-m"></p>',
    '<button type="button" class="bt sec" id="alrw-no">Cancelar</button><button type="button" class="bt" id="alrw-ok">'+(a ? 'Guardar los cambios' : 'Programar la alarma')+'</button>', { ancha:true });
  $('alrw-no').onclick=cerrarHoja;
  $('alrw-tit').oninput=function(){ tituloTocado=true; }; $('alrw-msg').oninput=function(){ msgTocado=true; };
  $('alrw-tipo').onchange=function(){ F.tipo=this.value; if(!tituloTocado) $('alrw-tit').value=_alrwTitulo(F.tipo); if(!msgTocado) $('alrw-msg').value=_alrwMsg(F.tipo); };
  if($('alrw-sim')) $('alrw-sim').onchange=function(){
    var v=this.value, f=sims.filter(function(x){ return String(x.d.app||x.id)===v; })[0]; F.sim=v; if(!f) return;
    $('alrw-dia').value=String(f.d.fecha||'').slice(0, 10); if(/^\d{1,2}:\d{2}$/.test(String(f.d.hora||''))) $('alrw-hora').value=('0'+f.d.hora).slice(-5);
    if(f.d.punto) $('alrw-punto').value=f.d.punto;
    if(f.d.tipo && tipos.some(function(t){ return t[0]===f.d.tipo; })){ $('alrw-tipo').value=f.d.tipo; $('alrw-tipo').onchange(); }
  };
  $('alrw-todos').onchange=function(){ F.todos=true; pintaGente(); };
  $('alrw-elegir').onchange=function(){
    F.todos=false;
    if(ALRW.gente) return pintaGente();
    $('alrw-g').innerHTML='<p class="ayuda">Cargando la gente…</p>';
    sbGet('sst_trabajador?'+filtroObra('sst_trabajador')+'&select=id,nombre,dni,estatus&order=nombre.asc&limit=3000').then(function(r){ ALRW.gente=r||[]; pintaGente(); }, function(){ ALRW.gente=[]; pintaGente(); });
  };
  if(!F.todos) $('alrw-elegir').onchange();
  $('alrw-ok').onclick=function(){
    var m=$('alrw-m'), dia=$('alrw-dia').value, hora=$('alrw-hora').value, ms=new Date(dia+'T'+(hora||'00:00')+':00').getTime();
    var tit=String($('alrw-tit').value||'').replace(/\s+/g, ' ').trim();
    m.className='msg mal';
    if(!dia || !hora || isNaN(ms)){ m.textContent='Pon el día y la hora.'; return; }
    if(ms<Date.now()-60000){ m.textContent='Esa hora ya pasó: pon una que venga.'; return; }
    if(tit.length<3){ m.textContent='Escribe lo que dice en grande.'; return; }
    if(!F.todos && !F.elegidos.length){ m.textContent='Elige al menos a una persona, o que suene a toda la obra.'; return; }
    var fila={ tipo:/^[a-z]{2,12}$/.test(F.tipo) ? F.tipo : 'multi', titulo:tit.slice(0, 60), mensaje:String($('alrw-msg').value||'').trim().slice(0, 200) || null, punto:String($('alrw-punto').value||'').trim().slice(0, 120) || null,
               cuando:new Date(ms).toISOString(), para:F.todos ? 'todos' : F.elegidos.slice(0, 500), sim:F.sim ? String(F.sim).slice(0, 60) : null, quien:_camQuien() };
    var bt=this; bt.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
    var p=a ? sbPatch('sst_alarma?id=eq.'+_enc(a.id), fila).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); })
            : sbPostP('sst_alarma', Object.assign({ empresa:YO.obra.id }, fila)).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); });
    p.then(function(){ return _alrwTraer(); }).then(function(){ cerrarHoja(); toast(a ? 'Alarma cambiada.' : 'Alarma programada: a esa hora suena en los celulares.'); _alrwPintar(); },
      function(cod){ bt.disabled=false; m.className='msg mal'; m.textContent=cod===404 ? 'La alarma de simulacro todavía no está activa en el servidor.' : 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.'; });
  };
}
