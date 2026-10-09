/* ═══ EL INFORME DEL MES, PARA LA GERENCIA O EL CLIENTE (09/10/2026) ═══════════════════════════════════════════════
   Marcelo: «hay que tener la opción que tendrán los planes Prevencionista, Supervisor SST, SSOMA y Gestión SST, para armar
   su informe para presentar a su gerencia o cliente, y si su cliente usa Central o el otro plan, es de acuerdo a lo que
   pidan ellos: el orden, los archivos y todo ello».
   · Se elige el mes, para quién es y qué va, en qué orden. Los datos salen solos de lo registrado ese mes (personal,
     horas hombre, accidentes con sus índices del año, capacitación, reportes, inspecciones, EPP y el SCTR), y se le suman
     los documentos que se elijan del archivo de la obra (PDF o fotos), en el orden que se quiera.
   · Sale un solo PDF, con portada, el índice y las páginas numeradas; se ve antes de bajarlo, y se puede guardar en el
     archivo de la obra (carpeta «Informes del mes»).
   · El orden y lo que va se guarda como el MODELO de la obra (sst_doc, hoja «informe-modelo»): el mes siguiente sale igual.
     El modelo tiene la forma que podrá fijar después un cliente con Central para todas sus subcontratas (qué va, en qué
     orden, qué archivos pide): por ahora lo arma cada obra.
   Va en los planes de pago (la vitrina: desde Prevencionista). */
var INFW = { caja:null, mes:'', para:'gerencia', paraN:'', por:'', secc:null, anexos:[], modelo:null, datos:null, n:0, pdf:null, armando:false };
var INF_SECC = [
  { k:'portada',      n:'Portada e índice',               d:'La obra, la empresa, el mes, para quién es y lo que trae', fijo:'primero' },
  { k:'resumen',      n:'Resumen del mes',                d:'Personal activo, horas hombre, accidentes y los índices del año' },
  { k:'capacitacion', n:'Capacitación',                   d:'Las evaluaciones del mes: cuántas, cuántas aprobadas y de qué temas' },
  { k:'reportes',     n:'Reportes de actos y condiciones', d:'Los del mes: cuántos se registraron, cuántos se cerraron y cuántos siguen abiertos' },
  { k:'inspecciones', n:'Inspecciones',                   d:'Las del mes, por tipo' },
  { k:'epp',          n:'Entrega de EPP',                 d:'Las entregas del mes y lo que más salió' },
  { k:'sctr',         n:'SCTR',                           d:'Las constancias vigentes y quién está en obra sin cobertura completa' },
  { k:'anexos',       n:'Anexos',                         d:'Los documentos que elijas del archivo de la obra', fijo:'ultimo' }
];
var INF_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
function _infMesN(ym){ return INF_MESES[(+String(ym).slice(5, 7) || 1)-1]+' '+String(ym).slice(0, 4); }
function _infMesFin(ym){ var y=+ym.slice(0, 4), m=+ym.slice(5, 7); return ym+'-'+dos(new Date(Date.UTC(y, m, 0)).getUTCDate()); }
function _infSeccN(k){ for(var i=0;i<INF_SECC.length;i++) if(INF_SECC[i].k===k) return INF_SECC[i]; return null; }
function _infCss(){
  if(document.getElementById('inf-css')) return;
  var s=document.createElement('style'); s.id='inf-css';
  s.textContent='.inf-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;align-items:start} @media (max-width:980px){ .inf-grid{grid-template-columns:minmax(0,1fr)} }'+
    '.inf-sec{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--raya);border-radius:10px;background:var(--panel);margin:0 0 8px}'+
    '.inf-sec.off{opacity:.55} .inf-sec input{width:auto;margin:0} .inf-sec .tx{flex:1;min-width:0} .inf-sec .tx b{display:block;font-size:14px} .inf-sec .tx small{display:block;color:var(--gris);font-size:12.5px;line-height:1.4}'+
    '.inf-sec .mov{display:flex;gap:4px} .inf-sec .mov button{border:1px solid var(--raya);background:none;border-radius:7px;width:30px;height:30px;cursor:pointer;font:inherit;color:var(--tinta)}'+
    '.inf-sec .mov button:disabled{opacity:.3;cursor:default} .inf-sec .n{font:600 12px var(--mono);color:var(--gris);width:18px;text-align:right}'+
    '.inf-anx{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--raya);font-size:13.5px} .inf-anx:last-child{border-bottom:0}'+
    '.inf-anx .tx{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .inf-anx button{border:1px solid var(--raya);background:none;border-radius:7px;min-width:28px;height:28px;cursor:pointer;color:var(--tinta)}'+
    '.inf-para{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px} .inf-para button{padding:7px 13px;border-radius:999px;border:1px solid var(--raya);background:none;font:inherit;cursor:pointer}'+
    '.inf-para button.on{background:var(--tinta);border-color:var(--tinta);color:#fff} .inf-vista{width:100%;height:68vh;border:1px solid var(--raya);border-radius:10px;background:#fff}';
  document.head.appendChild(s);
}
function _infMeses(){ var o=[], d=new Date(); d.setDate(1); for(var i=0;i<12;i++){ o.push(d.getFullYear()+'-'+dos(d.getMonth()+1)); d.setMonth(d.getMonth()-1); } return o; }
/* el modelo de la obra: lo que va y en qué orden (y para quién es, de costumbre) */
function _infModeloAplicar(m){
  var orden=[], visto={};
  (m && Array.isArray(m.secc) ? m.secc : []).forEach(function(x){ if(x && _infSeccN(x.k) && !visto[x.k]){ visto[x.k]=1; orden.push({ k:x.k, on:x.on!==false }); } });
  INF_SECC.forEach(function(s){ if(!visto[s.k]) orden.push({ k:s.k, on:true }); });
  /* la portada, primero; los anexos, al final */
  orden=orden.filter(function(x){ return x.k!=='portada' && x.k!=='anexos'; });
  INFW.secc=[{ k:'portada', on:true }].concat(orden, [{ k:'anexos', on:true }]);
  if(m && (m.para==='gerencia' || m.para==='cliente')) INFW.para=m.para;
  if(m && typeof m.paraN==='string') INFW.paraN=m.paraN;
}
function infVista(caja){
  _infCss(); INFW.caja=caja;
  /* otra obra: su modelo y sus anexos, no los de la anterior */
  if(INFW.obra!==(YO.obra||{}).id){ INFW.obra=(YO.obra||{}).id; INFW.secc=null; INFW.anexos=[]; INFW.modelo=null; INFW.datos=null; INFW.paraN=''; INFW.para='gerencia'; }
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(!INFW.mes){ var d=new Date(); d.setDate(1); d.setMonth(d.getMonth()-(new Date().getDate()<=10 ? 1 : 0)); INFW.mes=d.getFullYear()+'-'+dos(d.getMonth()+1); }
  if(!INFW.por) INFW.por=String(YO.nombre||'');
  cargando(caja);
  var n=++INFW.n;
  sbGet('sst_doc?empresa=eq.'+_enc(YO.obra.id)+'&hoja=eq.informe-modelo&select=id,nota,creado&order=creado.desc&limit=1').catch(function(){ return []; }).then(function(r){
    if(n!==INFW.n || VISTA.actual!=='informe') return;
    var m=null; try{ m=r && r[0] ? JSON.parse(r[0].nota) : null; }catch(e){}
    INFW.modelo=r && r[0] ? { id:r[0].id, m:m } : null;
    if(!INFW.secc) _infModeloAplicar(m);
    _infPintar();
  });
  VISTA.recargar=function(){ _infPintar(); };
}
function _infPintar(){
  var caja=INFW.caja; if(!caja || !document.body.contains(caja)) return;
  var ac=$('acciones');
  if(ac){ ac.innerHTML='<button type="button" class="bt" id="inf-armar">Armar el PDF ›</button>'; $('inf-armar').onclick=infArmar; }
  var S=INFW.secc, nOn=S.filter(function(x){ return x.on; }).length;
  var h='<div class="aviso" id="inf-que">📑 <b>El informe del mes, para tu gerencia o tu cliente.</b> Eliges qué va y en qué orden; los datos salen solos de lo registrado ese mes, y le sumas los documentos del archivo de la obra. '+
    'Sale en un solo PDF, con portada, índice y las páginas numeradas. Si tu cliente pide otro orden o ciertos archivos, ordénalo aquí y guárdalo como modelo: el mes siguiente sale igual.</div>';
  h+='<div class="inf-grid"><div>';
  h+='<div class="tarj"><div class="tarj-cuerpo">'+
    '<div class="campo"><label for="inf-mes">Mes</label><select id="inf-mes">'+_infMeses().map(function(m){ return '<option value="'+m+'"'+(m===INFW.mes ? ' selected' : '')+'>'+esc(_infMesN(m).replace(/^./, function(c){ return c.toUpperCase(); }))+'</option>'; }).join('')+'</select></div>'+
    '<label style="display:block;font-weight:600;font-size:13px;margin:0 0 6px">Para</label><div class="inf-para" role="radiogroup" aria-label="Para quién es">'+
      [['gerencia', 'Mi gerencia'], ['cliente', 'Mi cliente']].map(function(o){ return '<button type="button" role="radio" aria-checked="'+(INFW.para===o[0])+'" class="'+(INFW.para===o[0] ? 'on' : '')+'" data-para="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div>'+
    '<div class="campo"><label for="inf-para-n">'+(INFW.para==='cliente' ? 'El cliente' : 'La gerencia o quien lo recibe')+' <span class="tenue">· si quieres</span></label><input id="inf-para-n" maxlength="100" value="'+esc(INFW.paraN)+'" placeholder="'+(INFW.para==='cliente' ? 'El nombre de tu cliente' : 'Gerencia de operaciones')+'"></div>'+
    '<div class="campo" style="margin:0"><label for="inf-por">Elaborado por</label><input id="inf-por" maxlength="100" value="'+esc(INFW.por)+'"></div></div></div>';
  h+='<div class="tarj" style="margin-top:14px"><div class="tarj-cab"><div><h2>Lo que va, en este orden</h2><p class="sub">'+nOn+' partes · la portada va primero y los anexos al final</p></div>'+
    '<button type="button" class="bt sec chico" id="inf-modelo">'+(INFW.modelo ? 'Guardar los cambios del modelo' : 'Guardar como modelo de la obra')+'</button></div><div class="tarj-cuerpo" id="inf-secc">'+
    S.map(function(x, i){
      var s=_infSeccN(x.k), fijo=!!s.fijo;
      return '<div class="inf-sec'+(x.on ? '' : ' off')+'" data-i="'+i+'"><span class="n">'+(i+1)+'</span>'+
        '<input type="checkbox" aria-label="Incluir '+esc(s.n)+'" data-on="'+i+'"'+(x.on ? ' checked' : '')+(fijo ? ' disabled' : '')+'>'+
        '<span class="tx"><b>'+esc(s.n)+'</b><small>'+esc(s.d)+'</small></span>'+
        (fijo ? '' : '<span class="mov"><button type="button" data-sube="'+i+'" aria-label="Subir '+esc(s.n)+'"'+(i<=1 ? ' disabled' : '')+'>↑</button><button type="button" data-baja="'+i+'" aria-label="Bajar '+esc(s.n)+'"'+(i>=S.length-2 ? ' disabled' : '')+'>↓</button></span>')+'</div>';
    }).join('')+'<p class="msg" id="inf-modelo-msg" role="status"></p></div></div>';
  h+='</div><div>';
  h+='<div class="tarj"><div class="tarj-cab"><div><h2>Anexos</h2><p class="sub">Del archivo de la obra: PDF o fotos, en el orden que elijas</p></div><button type="button" class="bt sec chico" id="inf-anx-mas">＋ Elegir del archivo</button></div><div class="tarj-cuerpo" id="inf-anx">'+
    (INFW.anexos.length ? INFW.anexos.map(function(a, i){
      return '<div class="inf-anx"><span class="n tenue">'+(i+1)+'</span><span class="tx" title="'+esc(a.nombre)+'">'+esc(a.nombre)+'</span>'+
        '<button type="button" data-asube="'+i+'" aria-label="Subir"'+(i ? '' : ' disabled')+'>↑</button><button type="button" data-abaja="'+i+'" aria-label="Bajar"'+(i<INFW.anexos.length-1 ? '' : ' disabled')+'>↓</button>'+
        '<button type="button" data-aquita="'+i+'" aria-label="Quitar '+esc(a.nombre)+'">×</button></div>'; }).join('')
      : '<div class="vacio" id="inf-anx-vacio"><b>Sin anexos</b>Elige del archivo de la obra lo que pide tu gerencia o tu cliente: las asistencias escaneadas, los permisos, las fotos…</div>')+
    '</div></div>';
  h+='</div></div>';
  caja.innerHTML=h;
  $('inf-mes').onchange=function(){ INFW.mes=this.value; INFW.datos=null; };
  $('inf-para-n').oninput=function(){ INFW.paraN=this.value; };
  $('inf-por').oninput=function(){ INFW.por=this.value; };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-para]'), function(b){ b.onclick=function(){ INFW.para=b.getAttribute('data-para'); _infPintar(); }; });
  var sc=$('inf-secc');
  sc.onclick=function(ev){
    var b=ev.target.closest('button'); if(!b) return;
    var i;
    if(b.hasAttribute('data-sube')){ i=+b.getAttribute('data-sube'); if(i>1){ var t=S[i]; S[i]=S[i-1]; S[i-1]=t; _infPintar(); } }
    else if(b.hasAttribute('data-baja')){ i=+b.getAttribute('data-baja'); if(i<S.length-2){ var u=S[i]; S[i]=S[i+1]; S[i+1]=u; _infPintar(); } }
  };
  sc.onchange=function(ev){ var c=ev.target; if(c.hasAttribute('data-on')){ var x=S[+c.getAttribute('data-on')]; if(x && !_infSeccN(x.k).fijo){ x.on=c.checked; _infPintar(); } } };
  $('inf-modelo').onclick=_infGuardarModelo;
  $('inf-anx-mas').onclick=_infElegirAnexos;
  $('inf-anx').onclick=function(ev){
    var b=ev.target.closest('button'); if(!b) return;
    var A=INFW.anexos, i;
    if(b.hasAttribute('data-asube')){ i=+b.getAttribute('data-asube'); if(i>0){ var t=A[i]; A[i]=A[i-1]; A[i-1]=t; } }
    else if(b.hasAttribute('data-abaja')){ i=+b.getAttribute('data-abaja'); if(i<A.length-1){ var u=A[i]; A[i]=A[i+1]; A[i+1]=u; } }
    else if(b.hasAttribute('data-aquita')){ A.splice(+b.getAttribute('data-aquita'), 1); }
    _infPintar();
  };
}
function _infGuardarModelo(){
  var m=$('inf-modelo-msg'), b=$('inf-modelo');
  var nota=JSON.stringify({ v:1, secc:INFW.secc.map(function(x){ return { k:x.k, on:!!x.on }; }), para:INFW.para, paraN:String(INFW.paraN||'').slice(0, 100) });
  b.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
  var p=INFW.modelo && INFW.modelo.id
    ? sbPatch('sst_doc?id=eq.'+_enc(INFW.modelo.id), { nota:nota }).then(function(){ return [{ id:INFW.modelo.id }]; })
    : sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'informe-modelo', nombre:'Modelo del informe del mes', nota:nota });
  p.then(function(rows){
    INFW.modelo={ id:(rows && rows[0] && rows[0].id) || (INFW.modelo && INFW.modelo.id) || null, m:JSON.parse(nota) };
    b.disabled=false; b.textContent='Guardar los cambios del modelo'; m.className='msg ok'; m.textContent='Guardado: es el modelo de esta obra, para ti y tu equipo.';
  }, function(e){ b.disabled=false; m.className='msg mal'; m.textContent=(e===401 || e===403) ? 'Esta cuenta no puede guardar en esta obra.' : 'No se pudo guardar. Revisa tu conexión.'; });
}
/* elegir anexos del archivo de la obra (lo que tiene archivo: PDF o foto) */
function _infElegirAnexos(){
  var h='<div class="campo"><label for="inf-anx-q">Buscar</label><input id="inf-anx-q" type="search" placeholder="Nombre o carpeta"></div><div id="inf-anx-lista" style="max-height:52vh;overflow:auto;border:1px solid var(--raya);border-radius:10px"><div class="vacio">Cargando…</div></div>';
  abrirHoja('Elegir del archivo de la obra', 'PDF o fotos: se suman al final del informe, en el orden que elijas', h,
    '<button type="button" class="bt sec" id="inf-anx-no">Cancelar</button><button type="button" class="bt" id="inf-anx-si">Agregar</button>', {ancha:true, sinFoco:true});
  $('inf-anx-no').onclick=cerrarHoja;
  var ya={}; INFW.anexos.forEach(function(a){ ya[a.id]=1; });
  traer('sst_doc', '&select=id,hoja,nombre,url,creado&url=not.is.null&order=creado.desc', 600).then(function(filas){
    var L=(filas||[]).filter(function(f){ return f && f.url && /\.(pdf|jpe?g|png|webp)(\?|$)/i.test(decodeURIComponent(String(f.url))) && f.hoja!=='informe-modelo'; });
    function pinta(){
      var q=nrm(($('inf-anx-q')||{}).value||''), c=$('inf-anx-lista'); if(!c) return;
      var V=L.filter(function(f){ return !q || nrm(f.nombre+' '+tipoDoc(f.hoja)).indexOf(q)>-1; });
      c.innerHTML=V.length ? V.slice(0, 300).map(function(f){
        return '<label class="inf-anx" style="cursor:pointer"><input type="checkbox" data-id="'+esc(f.id)+'"'+(ya[f.id] ? ' checked disabled' : '')+' style="width:auto;margin:0"> <span class="tx">'+esc(f.nombre||'Documento')+
          ' <span class="tenue">· '+esc(tipoDoc(f.hoja))+' · '+esc(fechaLarga(String(f.creado||'').slice(0, 10)))+'</span></span></label>'; }).join('')
        : '<div class="vacio"><b>'+(L.length ? 'Nada con esa palabra' : 'El archivo de la obra no tiene PDF ni fotos todavía')+'</b>'+(L.length ? '' : 'Sube los documentos en «Documentos» o desde la app.')+'</div>';
    }
    pinta(); $('inf-anx-q').oninput=pinta;
    $('inf-anx-si').onclick=function(){
      Array.prototype.forEach.call(document.querySelectorAll('#inf-anx-lista [data-id]'), function(c){
        if(!c.checked || c.disabled) return;
        var f=L.filter(function(x){ return String(x.id)===c.getAttribute('data-id'); })[0];
        if(f) INFW.anexos.push({ id:f.id, nombre:f.nombre||'Documento', url:f.url, hoja:f.hoja });
      });
      cerrarHoja(); _infPintar();
    };
  }, function(){ var c=$('inf-anx-lista'); if(c) c.innerHTML='<div class="vacio"><b>No se pudo leer el archivo</b>Revisa tu conexión.</div>'; });
}

/* ── los datos del mes ── */
function _infTraer(mes){
  var P=[
    traer('sst_trabajador', '&select=id,nombre,dni,td,estatus&order=nombre.asc', 6000),
    traer('sst_constancia', '&select=fecha,resultado,tema&order=fecha.desc', 4000),
    traer('sst_reporte', '&select=id,fecha,creado,cerrado,estado,clase&order=creado.desc', 3000),
    traer('sst_accidente', '&select=fecha,clase,dias&order=fecha.desc', 1000),
    traer('sst_hht', '&select=fecha,ob_n,ob_h,st_n,st_h&order=fecha.desc', 4000),
    traer('sst_kardex', '&select=fecha,epp,cantidad&order=fecha.desc', 6000),
    traer('sst_inspeccion', '&select=fecha,tipo&order=fecha.desc', 3000),
    cargarSctr().then(function(){ return sbGet('sst_doc?empresa=eq.'+_enc(YO.obra.id)+'&hoja=eq.sctr&select=id,nombre,url,nota,creado&order=creado.desc&limit=100'); }).catch(function(){ return null; })
  ];
  return Promise.all(P.map(function(p){ return p.catch(function(){ return null; }); })).then(function(r){
    var trab=r[0]||[], cons=r[1]||[], reps=r[2]||[], accs=r[3]||[], hht=r[4]||[], kar=r[5]||[], insp=r[6]||[];
    var anio=mes.slice(0, 4), fin=_infMesFin(mes), hoy=hoyISO(), dia=(fin<hoy) ? fin : hoy;
    var D={ mes:mes, anio:anio, dia:dia };
    D.activos=trab.filter(function(t){ return (t.estatus||'activo')==='activo'; }).length;
    var cm=cons.filter(function(c){ return mesDe(c.fecha)===mes; });
    D.cap={ n:cm.length, ok:cm.filter(function(c){ return /aprob|ok|apto/i.test(String(c.resultado||'')); }).length, temas:_infTop(cm, function(c){ return c.tema||'Sin tema'; }, 1, 8) };
    var rm=reps.filter(function(x){ return mesDe(x.fecha||x.creado)===mes; });
    D.rep={ n:rm.length, cerrados:rm.filter(reporteCerrado).length, actos:rm.filter(function(x){ return x.clase==='acto'; }).length, cond:rm.filter(function(x){ return x.clase==='condicion'; }).length,
            abiertosHoy:reps.filter(function(x){ return !reporteCerrado(x); }).length };
    var am=accs.filter(function(a){ return mesDe(a.fecha)===mes; }), aa=accs.filter(function(a){ return anioDe(a.fecha)===anio && String(a.fecha).slice(0, 10)<=fin; });
    var hMes=hhtDe(hht, mes), hAnio=0;
    hht.forEach(function(x){ var f=String(x.fecha||''); if(anioDe(f)===anio && f.slice(0, 10)<=fin) hAnio+=(parseFloat(x.ob_n)||0)*(parseFloat(x.ob_h)||0)+(parseFloat(x.st_n)||0)*(parseFloat(x.st_h)||0); });
    var nIF=aa.filter(function(a){ return ACC_CUENTA[a.clase]; }).length, dias=aa.reduce(function(s, a){ return s+(parseInt(a.dias, 10)||0); }, 0);
    D.acc={ mes:am.length, anio:aa.length, nIF:nIF, dias:dias, hMes:hMes, hAnio:hAnio, IF:hAnio ? nIF*1e6/hAnio : null, IS:hAnio ? dias*1e6/hAnio : null };
    var km=kar.filter(function(k){ return mesDe(k.fecha)===mes; });
    D.epp={ entregas:km.length, und:km.reduce(function(s, k){ return s+(parseInt(k.cantidad, 10)||1); }, 0), top:_infTop(km, function(k){ return k.epp||'EPP'; }, function(k){ return parseInt(k.cantidad, 10)||1; }, 8) };
    var im=insp.filter(function(i){ return mesDe(i.fecha)===mes; });
    D.insp={ n:im.length, tipos:_infTop(im, function(i){ return i.tipo||'Inspección'; }, 1, 10) };
    if(Array.isArray(r[7]) && typeof sctrLeer==='function'){
      var regs=sctrOrdenar(r[7].map(sctrLeer)), R=sctrRevisar(trab, regs, dia);
      D.sctr={ dia:dia, vig:regs.filter(function(x){ return sctrVigente(x, dia); }), R:R };
    } else D.sctr=null;
    return D;
  });
}
function _infTop(L, clave, peso, n){
  var m={}; L.forEach(function(x){ var k=String(clave(x)).trim()||'—'; m[k]=(m[k]||0)+(typeof peso==='function' ? peso(x) : (peso||1)); });
  return Object.keys(m).map(function(k){ return [k, m[k]]; }).sort(function(a, b){ return b[1]-a[1] || a[0].localeCompare(b[0], 'es'); }).slice(0, n||8);
}

/* ── el PDF: lo de OBRASST con jsPDF, los anexos con pdf-lib, y todo numerado ── */
function _infLibPdf(){ if(window.PDFLib) return Promise.resolve(window.PDFLib); return _cargarJS('pdflib/pdf-lib.min.js?v=1.17.1', function(){ return !!window.PDFLib; }).then(function(){ return window.PDFLib; }); }
function infArmar(){
  if(INFW.armando) return;
  var b=$('inf-armar'); INFW.armando=true; if(b){ b.disabled=true; b.textContent='Armando…'; }
  var fin=function(){ INFW.armando=false; var b2=$('inf-armar'); if(b2){ b2.disabled=false; b2.textContent='Armar el PDF ›'; } };
  Promise.all([_infTraer(INFW.mes), cargarEvPDF(), _infLibPdf()]).then(function(r){
    INFW.datos=r[0];
    var base=_infPdfBase(r[0]);
    return _infUnir(base.bytes, base.indice);
  }).then(function(out){
    fin(); INFW.pdf=out; _infVer(out);
  }, function(e){ fin(); toast(e==='sin_red' ? 'No se pudo cargar lo que arma el PDF. Revisa tu conexión.' : 'No se pudo armar el informe: '+((e && e.message) || e)); });
}
function _infPdfBase(D){
  var J=window.jspdf && window.jspdf.jsPDF; if(!J) throw new Error('Falta el generador de PDF');
  var doc=new J({unit:'pt', format:'a4'}), W=595.28, H=841.89, M=42;
  var TINTA=[11,42,58], ORO=[245,183,0], GRIS=[107,124,136], TEXTO=[34,50,61], RAYA=[218,225,230], FONDO=[244,247,249], BLANCO=[255,255,255], SUAVE=[188,205,214], OK=[30,142,90], MAL=[198,50,58];
  function L(peso, tam, c){ doc.setFont('helvetica', peso||'normal'); doc.setFontSize(tam); if(c) doc.setTextColor(c[0], c[1], c[2]); }
  function F(c){ doc.setFillColor(c[0], c[1], c[2]); }
  function T(s){ return _edPdfTx(txPaisP(String(s==null ? '' : s))); }
  function cortar(s, w){ s=T(s); if(doc.getTextWidth(s)<=w) return s; while(s.length>1 && doc.getTextWidth(s+'…')>w) s=s.slice(0, -1); return s+'…'; }
  var obra=nombreObraP()||'Obra', emp=empresaDeObraP()||'', mesN=_infMesN(D.mes), indice=[], y=0;
  INFW._yIndice=0;
  function cab(titulo){
    F(TINTA); doc.rect(0, 0, W, 58, 'F'); F(ORO); doc.rect(0, 58, W, 3, 'F');
    L('bold', 12, BLANCO); doc.text(cortar(String(obra).toUpperCase(), W-2*M-170), M, 27);
    L('normal', 8.5, SUAVE); doc.text(cortar('Informe de seguridad y salud en el trabajo · '+mesN, W-2*M-170), M, 42);
    L('bold', 8, [255,226,150]); doc.text(T('INFORME DEL MES'), W-M, 27, {align:'right'});
    y=96; L('bold', 17, TINTA); doc.text(cortar(titulo, W-2*M), M, y); y+=24;
  }
  function cifras(L4){
    var n=L4.length, g=10, w=(W-2*M-g*(n-1))/n;
    L4.forEach(function(c, i){
      var x=M+i*(w+g); F(FONDO); doc.setDrawColor(RAYA[0], RAYA[1], RAYA[2]); doc.roundedRect(x, y, w, 64, 6, 6, 'FD');
      L('normal', 7.5, GRIS); doc.text(cortar(String(c[0]).toUpperCase(), w-16), x+10, y+16);
      L('bold', 20, c[3]==='mal' ? MAL : (c[3]==='ok' ? OK : TINTA)); doc.text(T(String(c[1])), x+10, y+42);
      if(c[2]){ L('normal', 7.5, GRIS); doc.text(cortar(c[2], w-16), x+10, y+56); }
    });
    y+=84;
  }
  function tabla(tit, cols, filas, anchos){
    if(y+60>H-60){ doc.addPage(); cab(tit+' (continúa)'); }
    L('bold', 10.5, TINTA); doc.text(T(tit), M, y); y+=10;
    var cx=[M]; for(var i=1;i<anchos.length;i++) cx.push(cx[i-1]+anchos[i-1]);
    F(TINTA); doc.rect(M, y, W-2*M, 16, 'F'); L('bold', 7.5, BLANCO); cols.forEach(function(c, j){ doc.text(T(c), cx[j]+6, y+11); }); y+=16;
    if(!filas.length){ L('normal', 8.5, GRIS); doc.text(T('Nada registrado este mes.'), M+6, y+14); y+=26; return; }
    filas.forEach(function(f, k){
      if(y+18>H-60){ doc.addPage(); cab(tit+' (continúa)'); F(TINTA); doc.rect(M, y, W-2*M, 16, 'F'); L('bold', 7.5, BLANCO); cols.forEach(function(c, j){ doc.text(T(c), cx[j]+6, y+11); }); y+=16; }
      if(k%2){ F(FONDO); doc.rect(M, y, W-2*M, 18, 'F'); }
      L('normal', 8.5, TEXTO); f.forEach(function(v, j){ doc.text(cortar(String(v), anchos[j]-12), cx[j]+6, y+12.5); });
      doc.setDrawColor(RAYA[0], RAYA[1], RAYA[2]); doc.setLineWidth(0.5); doc.line(M, y+18, W-M, y+18); y+=18;
    });
    y+=18;
  }
  function nota(t){ L('normal', 8.5, GRIS); var l=doc.splitTextToSize(T(t), W-2*M); doc.text(l, M, y); y+=l.length*11+8; }
  var S=INFW.secc.filter(function(x){ return x.on; });
  var paraTxt=(INFW.para==='cliente' ? 'Cliente' : 'Gerencia')+(String(INFW.paraN||'').trim() ? ': '+String(INFW.paraN).trim() : '');
  S.forEach(function(x, i){
    if(x.k==='anexos') return;
    if(i) doc.addPage();
    var pag=doc.getNumberOfPages(), s=_infSeccN(x.k);
    if(x.k!=='portada') indice.push({ t:s.n, p:pag });
    if(x.k==='portada'){
      F(TINTA); doc.rect(0, 0, W, 300, 'F'); F(ORO); doc.rect(0, 300, W, 5, 'F');
      L('bold', 9, [255,226,150]); doc.text(T('INFORME DE SEGURIDAD Y SALUD EN EL TRABAJO'), M, 92);
      L('bold', 30, BLANCO); doc.text(T(mesN.charAt(0).toUpperCase()+mesN.slice(1)), M, 140);
      L('bold', 16, BLANCO); doc.text(doc.splitTextToSize(T(obra), W-2*M).slice(0, 2), M, 176);
      if(emp){ L('normal', 11, SUAVE); doc.text(cortar(emp, W-2*M), M, 214); }
      y=350;
      [['Para', paraTxt], ['Elaborado por', String(INFW.por||'').trim() || '—'], ['Emitido', fechaLarga(hoyISO())], ['Código de la obra', (YO.obra||{}).codigo||'—']].forEach(function(f){
        L('normal', 8, GRIS); doc.text(T(String(f[0]).toUpperCase()), M, y); L('bold', 11, TEXTO); doc.text(cortar(f[1], W-2*M), M, y+15); y+=34;
      });
      y+=6; L('bold', 11, TINTA); doc.text(T('Contenido'), M, y); y+=8; doc.setDrawColor(RAYA[0], RAYA[1], RAYA[2]); doc.line(M, y, W-M, y); y+=16;
      INFW._yIndice=y;     /* el índice se escribe al final, cuando se sabe en qué página empieza cada cosa */
      return;
    }
    if(x.k==='resumen'){
      cab('Resumen del mes');
      cifras([['Personal activo', D.activos, 'hoy, en la obra'], ['Horas hombre del mes', _infNum(D.acc.hMes), D.acc.hMes ? 'registradas' : 'sin registrar'],
              ['Accidentes del mes', D.acc.mes, D.acc.anio+' en el año', D.acc.mes ? 'mal' : 'ok'], ['Reportes del mes', D.rep.n, D.rep.cerrados+' cerrados']]);
      tabla('Índices del año (hasta fin de mes)', ['Indicador', 'Valor', 'Cómo se calcula'], [
        ['Horas hombre del año', _infNum(D.acc.hAnio), 'suma de las horas registradas'],
        ['Accidentes que cuentan', D.acc.nIF, 'con incapacidad o mortales'],
        ['Días perdidos', D.acc.dias, 'de esos accidentes'],
        ['Índice de frecuencia', D.acc.IF===null ? '—' : D.acc.IF.toFixed(2), 'accidentes × 1 000 000 / horas hombre'],
        ['Índice de severidad', D.acc.IS===null ? '—' : D.acc.IS.toFixed(1), 'días perdidos × 1 000 000 / horas hombre']
      ], [150, 90, W-2*M-240]);
      if(!D.acc.hAnio) nota('Sin horas hombre registradas en el año, los índices no se pueden calcular: se registran en «Horas hombre» (la web) o en el reporte semanal (la app).');
    }
    if(x.k==='capacitacion'){
      cab('Capacitación');
      cifras([['Evaluaciones del mes', D.cap.n, 'constancias'], ['Aprobadas', D.cap.ok, D.cap.n ? Math.round(D.cap.ok*100/D.cap.n)+' %' : '', D.cap.n && D.cap.ok===D.cap.n ? 'ok' : ''], ['Temas', D.cap.temas.length, 'distintos']]);
      tabla('Los temas del mes', ['Tema', 'Evaluaciones'], D.cap.temas.map(function(t){ return [t[0], t[1]]; }), [W-2*M-110, 110]);
    }
    if(x.k==='reportes'){
      cab('Reportes de actos y condiciones');
      cifras([['Registrados en el mes', D.rep.n, ''], ['Cerrados', D.rep.cerrados, D.rep.n ? Math.round(D.rep.cerrados*100/D.rep.n)+' %' : '', D.rep.n && D.rep.cerrados===D.rep.n ? 'ok' : ''], ['Abiertos hoy', D.rep.abiertosHoy, 'de todos los meses', D.rep.abiertosHoy ? 'mal' : 'ok']]);
      tabla('Por tipo', ['Tipo', 'Del mes'], [['Actos', D.rep.actos], ['Condiciones', D.rep.cond]], [W-2*M-110, 110]);
    }
    if(x.k==='inspecciones'){
      cab('Inspecciones');
      cifras([['Inspecciones del mes', D.insp.n, ''], ['Tipos', D.insp.tipos.length, 'distintos']]);
      tabla('Por tipo', ['Tipo', 'Del mes'], D.insp.tipos.map(function(t){ return [t[0], t[1]]; }), [W-2*M-110, 110]);
    }
    if(x.k==='epp'){
      cab('Entrega de EPP');
      cifras([['Entregas del mes', D.epp.entregas, 'con la firma de quien recibe'], ['Unidades', D.epp.und, 'entregadas']]);
      tabla('Lo que más salió', ['EPP', 'Unidades'], D.epp.top.map(function(t){ return [t[0], t[1]]; }), [W-2*M-110, 110]);
    }
    if(x.k==='sctr'){
      cab('SCTR');
      if(!D.sctr){ nota('No se pudo leer el SCTR de la obra.'); return; }
      var R=D.sctr.R;
      cifras([['Cubiertos', R.ok.length+' de '+R.activos, 'salud y pensión, al '+sctrFechaCorta(D.sctr.dia), R.activos && R.ok.length===R.activos ? 'ok' : ''],
              ['Les falta algo', R.falta.length+R.sinDoc.length, 'sin SCTR o con una sola cobertura', (R.falta.length+R.sinDoc.length) ? 'mal' : 'ok'], ['Constancias vigentes', D.sctr.vig.length, '']]);
      tabla('Constancias vigentes', ['Cobertura', 'Vigencia', 'Aseguradora · póliza', 'Asegurados'],
        D.sctr.vig.map(function(v){ return [sctrCobN(v.cob), sctrFechaCorta(v.de)+' al '+sctrFechaCorta(v.a), [v.aseg, v.pol].filter(Boolean).join(' · ') || '—', v.conLista ? v.l.length : '—']; }), [96, 140, W-2*M-316, 80]);
      tabla('En obra, sin cobertura completa', ['Trabajador', docPersonaP(), 'Qué le falta'],
        R.falta.map(function(f){ return [f.t.nombre||'', f.t.dni||'', SCTR_ESTADO_N[f.e]||'']; }).concat(R.sinDoc.map(function(t){ return [t.nombre||'', '—', SCTR_ESTADO_N.sin_doc]; })), [W-2*M-230, 100, 130]);
    }
  });
  return { doc:doc, bytes:doc.output('arraybuffer'), indice:indice };
}
function _infNum(n){ n=Math.round(+n||0); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
/* los anexos, al final; el índice, en la portada; y el número de página en todas */
function _infUnir(base, indice){
  var PL=window.PDFLib;
  return PL.PDFDocument.load(base).then(function(out){
    var anex=INFW.secc.some(function(x){ return x.k==='anexos' && x.on; }) ? INFW.anexos.slice() : [], hechos=[], malos=[];
    var cad=Promise.resolve();
    anex.forEach(function(a){
      cad=cad.then(function(){
        var ini=out.getPageCount()+1;
        return fetch(a.url).then(function(r){ if(!r.ok) throw r.status; return r.arrayBuffer(); }).then(function(buf){
          var u8=new Uint8Array(buf), esPdf=u8[0]===0x25 && u8[1]===0x50 && u8[2]===0x44 && u8[3]===0x46;
          if(esPdf) return PL.PDFDocument.load(u8, { ignoreEncryption:true }).then(function(src){ return out.copyPages(src, src.getPageIndices()); }).then(function(pags){ pags.forEach(function(p){ out.addPage(p); }); });
          var png=u8[0]===0x89 && u8[1]===0x50, jpg=u8[0]===0xFF && u8[1]===0xD8;
          if(!png && !jpg) throw 'tipo';
          return (png ? out.embedPng(u8) : out.embedJpg(u8)).then(function(img){
            var pg=out.addPage([595.28, 841.89]), m=36, w=595.28-2*m, h=841.89-2*m-24, k=Math.min(w/img.width, h/img.height);
            pg.drawImage(img, { x:(595.28-img.width*k)/2, y:m+24+(h-img.height*k)/2, width:img.width*k, height:img.height*k });
          });
        }).then(function(){ hechos.push({ t:a.nombre, p:ini }); }, function(){ malos.push(a.nombre); });
      });
    });
    return cad.then(function(){ return out.embedFont(PL.StandardFonts.Helvetica); }).then(function(fuente){
      var pags=out.getPages(), total=pags.length, gris=PL.rgb(0.42, 0.49, 0.53), tinta=PL.rgb(0.04, 0.16, 0.23);
      var limpio=function(s){ return String(s||'').replace(/[^\x20-\x7E -ÿ]/g, ''); };
      /* el índice, en la portada (si la hay) */
      if(INFW._yIndice && pags[0]){
        var p0=pags[0], H=p0.getHeight(), y=H-INFW._yIndice, filas=indice.concat(hechos.length ? [{ t:'Anexos', p:hechos[0].p }] : []).concat(hechos.map(function(h){ return { t:'   '+h.t, p:h.p, sub:true }; }));
        for(var q=0; q<filas.length; q++){
          var f=filas[q];
          /* lo que no cabe en la portada se resume en una línea */
          if(y<64 && q<filas.length-1){ p0.drawText(limpio('… y '+(filas.length-q)+' más'), { x:42, y:y, size:9, font:fuente, color:gris }); break; }
          var t=limpio(f.t); if(fuente.widthOfTextAtSize(t, 10)>420){ while(t.length>4 && fuente.widthOfTextAtSize(t+'...', 10)>420) t=t.slice(0, -1); t+='...'; }
          p0.drawText(t, { x:42, y:y, size:f.sub ? 9 : 10.5, font:fuente, color:f.sub ? gris : tinta });
          var n=String(f.p); p0.drawText(n, { x:553-fuente.widthOfTextAtSize(n, 10), y:y, size:10, font:fuente, color:gris });
          y-=f.sub ? 15 : 18;
        }
      }
      var pie=limpio('OBRASST · Informe de '+_infMesN(INFW.mes)+' · '+(nombreObraP()||''));
      pags.forEach(function(p, i){
        var w=p.getWidth(), t=limpio('Página '+(i+1)+' de '+total);
        p.drawText(t, { x:w-36-fuente.widthOfTextAtSize(t, 8), y:18, size:8, font:fuente, color:gris });
        if(i) p.drawText(pie.length>90 ? pie.slice(0, 90)+'...' : pie, { x:36, y:18, size:8, font:fuente, color:gris });
      });
      return out.save().then(function(bytes){ return { bytes:bytes, paginas:total, anexos:hechos.length, malos:malos }; });
    });
  });
}
/* verlo antes de bajarlo o guardarlo */
function _infVer(R){
  try{ if(INFW._url) URL.revokeObjectURL(INFW._url); }catch(e){}
  var blob=new Blob([R.bytes], { type:'application/pdf' }); INFW._url=URL.createObjectURL(blob); INFW._blob=blob;
  var nom=nombreArchivo('Informe SST - '+_infMesN(INFW.mes)+' - '+(nombreObraP()||'obra'))+'.pdf';
  var h='<p style="margin:0 0 10px" id="inf-listo">'+R.paginas+' páginas'+(R.anexos ? ' · '+R.anexos+' anexo'+(R.anexos===1 ? '' : 's') : '')+' · '+(blob.size>1048576 ? (blob.size/1048576).toFixed(1)+' MB' : Math.max(1, Math.round(blob.size/1024))+' KB')+'</p>'+
    (R.malos.length ? '<div class="aviso ojo" id="inf-malos">No se pudieron sumar: '+esc(R.malos.join(', '))+'. Solo entran PDF y fotos (JPG o PNG).</div>' : '')+
    '<iframe class="inf-vista" id="inf-vista" title="El informe" src="'+esc(INFW._url)+'"></iframe><p class="msg" id="inf-msg" role="status"></p>';
  abrirHoja('El informe de '+_infMesN(INFW.mes), nombreObraP()||'', h,
    '<button type="button" class="bt sec" id="inf-volver">‹ Volver a cambiar</button><button type="button" class="bt sec" id="inf-guardar">Guardar en el archivo de la obra</button><button type="button" class="bt" id="inf-bajar">Descargar el PDF</button>', {ancha:true, sinFoco:true});
  $('inf-volver').onclick=cerrarHoja;
  $('inf-bajar').onclick=function(){ bajarBlob(blob, nom); };
  $('inf-guardar').onclick=function(){
    var m=$('inf-msg'), b=this;
    if(blob.size>25*1024*1024){ m.className='msg mal'; m.textContent='Pesa más de 25 MB (el tope por archivo de la obra): descárgalo, o quita algún anexo pesado.'; return; }
    b.disabled=true; m.className='msg gris'; m.textContent='Guardando…';
    var f; try{ f=new File([blob], nom, { type:'application/pdf' }); }catch(e){ f=blob; f.name=nom; }
    subirArchivoP('docs', f).then(function(url){
      return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'informe-mes', nombre:'Informe SST · '+_infMesN(INFW.mes), url:url, nota:INFW.mes });
    }).then(function(){ m.className='msg ok'; m.textContent='Guardado en «Documentos», carpeta «Informes del mes».'; }, function(e){ b.disabled=false; m.className='msg mal'; m.textContent=(e===401 || e===403) ? 'Esta cuenta no puede guardar en esta obra.' : 'No se pudo guardar. Revisa tu conexión.'; });
  };
}
