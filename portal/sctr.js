/* ═══ EL SCTR, EN LA WEB (09/10/2026) ════════════════════════════════════════════════════════════════════════════
   Marcelo: «No veo la parte del SCTR, para que se agregue, y quizás, de ahí sacar los datos del personal, podría ser,
   su nombre, apellido, DNI, ver la forma que nos juegue a favor ello, porque no todos estarán en obra, algunos en
   oficina, quizás una previsualización antes de cargarlos todos, y eliminar o editar quizás».
   · Se sube la constancia de la aseguradora (PDF, Excel o foto) con su cobertura, su póliza y su vigencia.
   · Del PDF (con pdf.js, el del portal) o del Excel (el lector de gestion.js) sale la lista de asegurados, y se VE antes
     de guardar: se corrige el documento o el nombre, se quita a quien no va, se agrega a quien falta, y se marca quién
     está en obra y quién en oficina. De una foto no se puede leer: la lista se arma con el personal o pegándola.
   · Guardada, los nuevos que van a obra se cargan al personal con la misma hoja de «Subir la lista de trabajadores»
     (gesPersonalDesdeFilas): se ve quién es nuevo y quién ya estaba, y vale el tope del plan.
   · Arriba, lo que nos juega a favor: quién está hoy en la obra sin SCTR vigente, o con una sola de las dos coberturas.
   Cada constancia es una fila de sst_doc (hoja «sctr») y su archivo va al balde de la obra: es lo mismo que ve y sube
   la app (sctr.js). Lo común de las dos está entre las marcas de abajo (sctr-base.js). */
/* >>> SCTR-BASE-INI (lo re-inyecta armar.py desde ../../sctr-base.js, no editar a mano) <<< */
/* ══ EL SCTR · lo común de la app y de la web (09/10/2026) ══════════════════════════════════════════════════════
   Marcelo: «No veo la parte del SCTR, para que se agregue, y quizás, de ahí sacar los datos del personal: su nombre,
   apellido, DNI… porque no todos estarán en obra, algunos en oficina; quizás una previsualización antes de cargarlos
   todos, y eliminar o editar».
   Cada constancia es una fila de sst_doc (hoja «sctr») con su archivo (el PDF o la foto) en el balde de la obra, y en
   la nota: {v:1, cob:'ambas'|'salud'|'pension', aseg, pol, de, a, por, l:[[tipo, documento, nombre, lugar], …]}
   (lugar: 'o' en obra, 'f' en oficina). La web saca la lista del PDF o del Excel de la aseguradora y la muestra para
   corregirla antes de guardar; en el celular se marca de la lista del personal. Con eso se cruza lo que importa: quién
   está en la obra sin SCTR vigente hoy, o con una sola de las dos coberturas.
   Lo legal que se dice es solo lo que ya dice la ficha del D.S. 003-98-SA de la app: dos coberturas, salud y pensión.
   Este archivo va igual en la app (armar.py lo inyecta) y dentro de portal/sctr.js. Sin DOM: solo datos. */
var SCTR_HOJA = 'sctr';
var SCTR_COB = [['ambas', 'Salud y pensión'], ['salud', 'Salud'], ['pension', 'Pensión']];
var SCTR_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
function sctrCobN(k){ for(var i = 0; i < SCTR_COB.length; i++) if(SCTR_COB[i][0] === k) return SCTR_COB[i][1]; return SCTR_COB[0][1]; }
function _sctrFechaOk(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
function _sctrDos(n){ return (n < 10 ? '0' : '') + n; }
/* el mes de un día: del 1 al último */
function sctrMes(dia){
  var y = +String(dia).slice(0, 4), m = +String(dia).slice(5, 7);
  var u = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { de:y + '-' + _sctrDos(m) + '-01', a:y + '-' + _sctrDos(m) + '-' + _sctrDos(u), n:SCTR_MESES[m - 1] + ' ' + y };
}
function sctrFechaCorta(iso){ return _sctrFechaOk(iso) ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : ''; }
/* el número de documento, limpio: el DNI con sus 8 dígitos (Excel le quita el cero de adelante) */
function sctrDoc(td, doc){
  var d = String(doc == null ? '' : doc).toUpperCase().replace(/[\s.\-]/g, '');
  if(!d) return '';
  if((!td || /^DNI$/i.test(String(td))) && /^\d{5,7}$/.test(d)) d = ('00000000' + d).slice(-8);
  return d.slice(0, 15);
}
function _sctrTipo(td){
  var t = String(td || '').toUpperCase().replace(/[^A-Z]/g, '');
  if(!t || t === 'DNI' || t === 'LE' || t === 'LIBRETAELECTORAL') return 'DNI';
  if(/^(CE|CARNET|CARNE|CARNETDEEXTRANJERIA|CARNEDEEXTRANJERIA|EXTRANJERIA)$/.test(t)) return 'CE';
  if(/^(PAS|PASAPORTE|PASS)$/.test(t)) return 'PAS';
  if(/^(PTP|CPP)$/.test(t)) return t;
  return t.slice(0, 10);
}
/* la nota: de la constancia a la fila, y de vuelta */
function sctrNota(o){
  var visto = {};
  return JSON.stringify({ v:1, cob:(o.cob === 'salud' || o.cob === 'pension') ? o.cob : 'ambas',
    aseg:String(o.aseg || '').replace(/\s+/g, ' ').trim().slice(0, 80), pol:String(o.pol || '').replace(/\s+/g, ' ').trim().slice(0, 40),
    de:_sctrFechaOk(o.de) ? o.de : '', a:_sctrFechaOk(o.a) ? o.a : '', por:String(o.por || '').slice(0, 80),
    l:(o.l || []).map(function(p){ var td = _sctrTipo(p.td); return [td, sctrDoc(td, p.doc), String(p.n || '').replace(/\s+/g, ' ').trim().slice(0, 120), p.lugar === 'f' ? 'f' : 'o']; })
      .filter(function(x){ if(!x[1] || visto[x[1]]) return false; visto[x[1]] = 1; return true; }) });
}
function sctrLeer(f){
  var o = null; try{ o = JSON.parse(String((f && f.nota) || '')); }catch(e){}
  var r = { id:f && f.id, nombre:(f && f.nombre) || 'SCTR', url:(f && f.url) || '', creado:(f && f.creado) || '', cob:'ambas', aseg:'', pol:'', de:'', a:'', por:'', l:[], conLista:false, suelta:true };
  if(o && typeof o === 'object' && o.v){
    r.suelta = false;
    r.cob = (o.cob === 'salud' || o.cob === 'pension') ? o.cob : 'ambas';
    r.aseg = String(o.aseg || ''); r.pol = String(o.pol || ''); r.por = String(o.por || '');
    r.de = _sctrFechaOk(o.de) ? o.de : ''; r.a = _sctrFechaOk(o.a) ? o.a : '';
    r.l = (Array.isArray(o.l) ? o.l : []).map(function(x){ var td = _sctrTipo(x && x[0]); return { td:td, doc:sctrDoc(td, x && x[1]), n:String((x && x[2]) || ''), lugar:(x && x[3]) === 'f' ? 'f' : 'o' }; })
      .filter(function(p){ return p.doc; });
    r.conLista = !!r.l.length;
  }
  return r;
}
/* las constancias, de la más nueva a la más vieja (por su vigencia; las sueltas, por cuándo se subieron) */
function sctrOrdenar(regs){
  return (regs || []).slice().sort(function(x, y){ return String(y.a || y.creado || '').localeCompare(String(x.a || x.creado || '')) || String(y.creado || '').localeCompare(String(x.creado || '')); });
}
/* ¿vale ese día? */
function sctrVigente(r, dia){ return !!(r && r.de && r.a && dia >= r.de && dia <= r.a); }
/* de las constancias que valen ese día: quién tiene salud y quién pensión (por su documento) */
function sctrCubiertos(regs, dia){
  var s = {}, p = {}, n = 0, cs = 0, cp = 0;
  (regs || []).forEach(function(r){
    if(!sctrVigente(r, dia)) return;
    n++; if(r.cob !== 'pension') cs++; if(r.cob !== 'salud') cp++;
    r.l.forEach(function(x){ if(r.cob !== 'pension') s[x.doc] = r; if(r.cob !== 'salud') p[x.doc] = r; });
  });
  return { salud:s, pension:p, constancias:n, conSalud:cs, conPension:cp };
}
/* una persona: 'ok' (las dos), 'salud' (solo salud), 'pension' (solo pensión), 'no' (ninguna) o 'sin_doc' */
function sctrEstado(td, doc, cub){
  var d = sctrDoc(_sctrTipo(td), doc); if(!d) return 'sin_doc';
  var s = !!cub.salud[d], p = !!cub.pension[d];
  return (s && p) ? 'ok' : s ? 'salud' : p ? 'pension' : 'no';
}
var SCTR_ESTADO_N = { ok:'Salud y pensión', salud:'Le falta pensión', pension:'Le falta salud', no:'Sin SCTR', sin_doc:'Sin documento en su ficha' };
/* el personal activo de la obra, contra lo vigente ese día: quién está cubierto y a quién le falta algo */
function sctrRevisar(personal, regs, dia){
  var cub = sctrCubiertos(regs, dia), out = { ok:[], falta:[], sinDoc:[], activos:0, cub:cub };
  (personal || []).forEach(function(t){
    if(!t || String(t.estatus || 'activo') === 'cesado') return;
    out.activos++;
    var e = sctrEstado(t.td, t.dni, cub);
    if(e === 'ok') out.ok.push(t);
    else if(e === 'sin_doc') out.sinDoc.push(t);
    else out.falta.push({ t:t, e:e });
  });
  out.falta.sort(function(x, y){ return String(x.t.nombre || '').localeCompare(String(y.t.nombre || ''), 'es'); });
  return out;
}
/* ── el nombre, como lo lleva el personal de la app: «Huamán Rojas, Pedro» ──
   Las aseguradoras lo escriben en mayúsculas y sin coma («HUAMAN ROJAS PEDRO»): lo común es que los dos primeros sean
   los apellidos (con «de», «del», «de la»… pegados al que sigue). Lo que no calce se corrige en la vista previa. */
var _SCTR_PART = { de:1, del:1, la:1, las:1, los:1, y:1, da:1, di:1, van:1, von:1, san:1, santa:1 };
function _sctrMay(w, i){
  var b = w.toLowerCase();
  if(i > 0 && _SCTR_PART[b]) return b;
  return b.split('-').map(function(p){ return p ? p.charAt(0).toUpperCase() + p.slice(1) : p; }).join('-');
}
function sctrNombreApp(n){
  var t = String(n || '').replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim().replace(/^,|,$/g, '').trim();
  if(!t) return '';
  if(t !== t.toUpperCase()) return t;                      /* ya viene escrito con mayúsculas y minúsculas: tal cual */
  var tit = function(s){ return s.split(' ').map(_sctrMay).join(' '); };
  if(t.indexOf(',') > -1){ var p = t.split(','); return tit(p[0].trim()) + ', ' + tit(p.slice(1).join(' ').trim()); }
  var w = t.split(' ');
  if(w.length < 3) return tit(t);
  /* los grupos: una partícula va con la palabra que sigue */
  var g = [], cur = [];
  w.forEach(function(x){ cur.push(x); if(!_SCTR_PART[x.toLowerCase()]){ g.push(cur.join(' ')); cur = []; } });
  if(cur.length) g.push(cur.join(' '));
  if(g.length < 3) return tit(t);
  return tit(g.slice(0, 2).join(' ')) + ', ' + tit(g.slice(2).join(' '));
}
/* ── una línea de texto (de un PDF sin columnas, o pegada) → {td, doc, n} o null ──
   El documento: 8 dígitos (DNI) o de 9 a 12 letras y números (carné de extranjería, pasaporte). El nombre: la tira más
   larga de palabras sin números; si termina en un oficio («OPERARIO»), ese no es parte del nombre. */
var SCTR_NO_NOMBRE = /^(dni|ce|c\.?e\.?|pas|pasaporte|carnet|carne|extranjeria|extranjería|ptp|cpp|le|ruc|soles|s\/|m|f|masculino|femenino|activo|activa|alta|baja|si|sí|no|nro|n°|nº|item|total|tipo|doc|documento)$/i;
var SCTR_OFICIOS = {};
('operario operaria oficial peon peón capataz ayudante maestro electricista soldador chofer conductor operador operadora vigia vigía almacenero almacenera ' +
 'ingeniero ingeniera supervisor supervisora prevencionista asistente tecnico técnico tecnica técnica administrativo administrativa empleado empleada obrero obrera ' +
 'guardian guardián vigilante rigger topografo topógrafo cadista arquitecto arquitecta residente jefe jefa gerente contador contadora secretaria secretario ' +
 'practicante auxiliar encofrador fierrero albañil carpintero gasfitero pintor mecanico mecánico enfermero enfermera medico médico').split(' ').forEach(function(x){ SCTR_OFICIOS[x] = 1; });
function _sctrSinTilde(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function sctrFilaDeLinea(txt){
  var t = String(txt || '').replace(/[|\t]+/g, ' ').replace(/\s+/g, ' ').trim(); if(!t) return null;
  var toks = t.split(' '), doc = '', td = 'DNI', iDoc = -1, i, k;
  for(i = 0; i < toks.length; i++){ k = toks[i].replace(/[.,;:]+$/, ''); if(/^\d{8}$/.test(k)){ doc = k; iDoc = i; break; } }
  if(!doc){
    for(i = 0; i < toks.length; i++){
      k = toks[i].replace(/[.,;:]+$/, '');
      if(/^(?=[A-Z0-9]*\d)[A-Z0-9]{9,12}$/i.test(k) && /^\d*[A-Z]*\d+$/i.test(k)){ doc = k.toUpperCase(); iDoc = i; td = 'CE'; break; }
    }
  }
  if(!doc) return null;
  var antes = iDoc > 0 ? toks[iDoc - 1].toUpperCase().replace(/[.:]/g, '') : '';
  if(/^(CE|CARNET|CARNE|EXTRANJERIA)$/.test(antes)) td = 'CE'; else if(/^(PAS|PASAPORTE)$/.test(antes)) td = 'PAS'; else if(antes === 'DNI') td = 'DNI';
  var mejor = [], run = [];
  toks.forEach(function(w){
    var limpio = w.replace(/[,;:]+$/, '');
    var esPal = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’\-]+,?$/.test(w) && limpio.length > 1 && !SCTR_NO_NOMBRE.test(limpio);
    if(esPal) run.push(w); else { if(run.length > mejor.length) mejor = run; run = []; }
  });
  if(run.length > mejor.length) mejor = run;
  while(mejor.length > 2 && SCTR_OFICIOS[_sctrSinTilde(mejor[mejor.length - 1].replace(/[,;:]+$/, ''))]) mejor = mejor.slice(0, -1);
  if(mejor.length < 2) return null;
  return { td:td, doc:sctrDoc(td, doc), n:mejor.join(' ').replace(/[,;:]+$/, '') };
}
/* varias líneas → la lista, sin repetir el documento */
function sctrListaDeTexto(t){
  var visto = {}, out = [];
  String(t || '').split(/\r?\n/).forEach(function(l){ var f = sctrFilaDeLinea(l); if(f && !visto[f.doc]){ visto[f.doc] = 1; out.push(f); } });
  return out;
}
/* el nombre de la fila en sst_doc: «SCTR salud y pensión · octubre 2026» */
function sctrNombreFila(o){
  var m = _sctrFechaOk(o.de) ? sctrMes(o.de) : null;
  return 'SCTR ' + sctrCobN(o.cob).toLowerCase() + (m ? ' · ' + m.n : '');
}
/* <<< SCTR-BASE-FIN >>> */

var SCTRW = { caja:null, regs:null, per:null, n:0, F:null };
/* los títulos con que la aseguradora (o el Excel de la obra) llama a cada dato */
var SCTR_CAMPOS = [
  { k:'nombre', sin:['apellidos y nombres', 'nombres y apellidos', 'apellidos nombres', 'nombre completo', 'apellidos y nombres del asegurado', 'nombre del asegurado',
                     'asegurado', 'asegurados', 'nombre del trabajador', 'trabajador', 'colaborador', 'empleado', 'nombre'] },
  { k:'ap1', sin:['apellido paterno', 'ap paterno', 'paterno', 'primer apellido', 'apellidos', 'apellido'] },
  { k:'ap2', sin:['apellido materno', 'ap materno', 'materno', 'segundo apellido'] },
  { k:'nom', sin:['nombres', 'primer nombre', 'prenombres'] },
  { k:'dni', sin:['numero de documento', 'nro de documento', 'n de documento', 'nro documento', 'num documento', 'numero documento', 'documento de identidad',
                  'doc identidad', 'nro doc', 'n doc', 'num doc', 'documento', 'numero de dni', 'nro dni', 'n dni', 'dni', 'doc', 'nro de identidad', 'identificacion'] },
  { k:'td', sin:['tipo de documento', 'tipo documento', 'tipo doc', 'tipo de doc', 't doc', 'tipo'] }
];
function _sctrwCss(){
  if(document.getElementById('sctrw-css')) return;
  var s=document.createElement('style'); s.id='sctrw-css';
  s.textContent='.sctr-zona{display:flex;flex-direction:column;align-items:center;gap:4px;padding:18px;border:1.5px dashed var(--borde);border-radius:12px;text-align:center;cursor:pointer;background:var(--suave,rgba(0,0,0,.02))}'+
    '.sctr-zona.sobre{border-color:var(--azul,#2563eb);background:rgba(37,99,235,.06)} .sctr-zona input{display:none} .sctr-zona b{font-size:15px}'+
    '.sctr-cob{display:flex;gap:8px;flex-wrap:wrap} .sctr-cob button{padding:8px 14px;border-radius:999px;border:1px solid var(--borde);background:none;font:inherit;cursor:pointer}'+
    '.sctr-cob button.on{background:var(--azul,#2563eb);border-color:var(--azul,#2563eb);color:#fff}'+
    '.sctr-dos{display:grid;grid-template-columns:1fr 1fr;gap:12px} @media (max-width:640px){ .sctr-dos{grid-template-columns:1fr} }'+
    '.sctr-tabla input{width:100%;min-width:0;padding:6px 8px;border:1px solid var(--borde);border-radius:7px;font:inherit;background:transparent;color:inherit}'+
    '.sctr-tabla input.mal{border-color:var(--mal,#d33)} .sctr-tabla select{padding:6px;border:1px solid var(--borde);border-radius:7px;font:inherit;background:transparent;color:inherit}'+
    '.sctr-tabla td{vertical-align:middle} .sctr-tabla .x{border:0;background:none;font-size:18px;cursor:pointer;color:var(--gris)} .sctr-tabla .x:hover{color:var(--mal,#d33)}'+
    '.sctr-tabla .doc{width:130px} .sctr-tabla .lug{width:120px} .sctr-barra{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px}'+
    '.sctr-barra .cuenta{margin-left:auto;color:var(--gris);font-size:13px}';
  document.head.appendChild(s);
}
function _sctrwEmp(){ return (YO.obra||{}).id || ''; }
function _sctrwPor(){ return String((YO && YO.nombre) || (TOK && (TOK.cap || TOK.nombre || TOK.correo)) || '').slice(0, 80); }
function _sctrwEstHtml(t){ return t ? (String(t.estatus||'activo')==='cesado' ? '<span class="pill gris">cesado</span>' : '<span class="pill ok">sí</span>') : '<span class="pill azul">nuevo</span>'; }
function _sctrwPersonalPorDoc(per){
  var m={}; (per||[]).forEach(function(t){ var d=sctrDoc(t.td, t.dni); if(d && (!m[d] || String(m[d].estatus||'activo')==='cesado')) m[d]=t; }); return m;
}
function sctrTraer(){
  var emp=_sctrwEmp();
  return Promise.all([
    sbGet('sst_doc?empresa=eq.'+_enc(emp)+'&hoja=eq.'+SCTR_HOJA+'&select=id,nombre,url,nota,creado&order=creado.desc&limit=300'),
    traerTodo('sst_trabajador', '&select=id,nombre,dni,td,estatus&order=nombre.asc', 6000).catch(function(){ return []; })
  ]).then(function(r){ SCTRW.regs=sctrOrdenar((r[0]||[]).map(sctrLeer)); SCTRW.per=r[1]||[]; return SCTRW; });
}

/* ── la sección ─────────────────────────────────────────────────────────────────────────────────────────── */
function sctrVista(caja){
  _sctrwCss(); SCTRW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  function pinta(silencio){
    var n=++SCTRW.n;
    sctrTraer().then(function(){ if(n!==SCTRW.n || VISTA.actual!=='sctr') return; _sctrwPintar(); },
                     function(e){ if(n!==SCTRW.n || VISTA.actual!=='sctr') return; if(!silencio) fallo(caja, e); });
  }
  VISTA.recargar=pinta; pinta();
}
function _sctrwPintar(){
  var caja=SCTRW.caja; if(!caja || !document.body.contains(caja)) return;
  var ac=$('acciones');
  if(ac){ ac.innerHTML='<button type="button" class="bt" id="sctr-nueva">＋ Subir una constancia</button>'; $('sctr-nueva').onclick=function(){ sctrNuevaHoja(); }; }
  var hoy=hoyISO(), mes=sctrMes(hoy), R=sctrRevisar(SCTRW.per, SCTRW.regs, hoy), C=R.cub;
  var h='<div class="aviso" id="sctr-que">🛡️ <b>El SCTR de la obra, mes a mes.</b> Sube la constancia de la aseguradora (PDF, Excel o foto): de ahí sale la lista de asegurados, la revisas y corriges antes de guardar, '+
    'marcas quién va a obra y quién está en oficina, y cargas a tu personal a los nuevos. Con eso se ve, cada día, quién está en la obra sin SCTR vigente. Son dos coberturas: salud y pensión. '+
    '<span class="tenue">D.S. 003-98-SA</span></div>';
  if(!C.conSalud || !C.conPension){
    var falta=(!C.conSalud && !C.conPension) ? 'salud ni de pensión' : (!C.conSalud ? 'salud' : 'pensión');
    h+='<div class="aviso ojo" id="sctr-sin">No hay constancia de SCTR de '+falta+' vigente hoy. Sube la de '+esc(mes.n)+'.</div>';
  }
  h+='<div class="rej" id="sctr-cifras">'+
    cifra('Cubiertos hoy', R.ok.length, R.activos ? 'de '+R.activos+' activos' : 'sin personal', R.activos && R.ok.length===R.activos ? 'ok' : '')+
    cifra('Les falta algo', R.falta.length, R.falta.length ? 'sin SCTR o con una sola cobertura' : 'nadie', R.falta.length ? 'mal' : 'ok')+
    cifra('Constancias vigentes', C.constancias, (C.conSalud ? 'salud ✓' : 'salud ✗')+' · '+(C.conPension ? 'pensión ✓' : 'pensión ✗'), (C.conSalud && C.conPension) ? 'ok' : 'ojo')+
    cifra('Sin documento', R.sinDoc.length, R.sinDoc.length ? 'en su ficha: no se puede cruzar' : 'todos lo tienen', R.sinDoc.length ? 'ojo' : 'ok')+'</div>';
  h+='<div class="tarj" id="t-sctr-falta"></div><div class="tarj" id="t-sctr-const" style="margin-top:16px"></div>';
  var e1=$('t-sctr-falta') ? $('t-sctr-falta')._est : null, e2=$('t-sctr-const') ? $('t-sctr-const')._est : null;
  caja.innerHTML=h; if(e1) $('t-sctr-falta')._est=e1; if(e2) $('t-sctr-const')._est=e2;
  var falta=R.falta.map(function(x){ return { id:x.t.id, nombre:x.t.nombre, dni:x.t.dni, e:x.e }; }).concat(R.sinDoc.map(function(t){ return { id:t.id, nombre:t.nombre, dni:'', e:'sin_doc' }; }));
  tabla($('t-sctr-falta'), [
    { k:'nombre', t:'En obra, sin SCTR completo hoy', h:function(x){ return '<b>'+esc(x.nombre||'')+'</b>'+(x.dni ? '<span class="sub">'+esc(x.dni)+'</span>' : ''); }, v:function(x){ return (x.nombre||'')+' '+(x.dni||''); }, csv:function(x){ return x.nombre; } },
    { k:'dni', t:docPersonaP(), soloCsv:true },
    { k:'e', t:'Qué le falta', h:function(x){ return '<span class="pill '+(x.e==='no' ? 'mal' : 'ojo')+'">'+esc(SCTR_ESTADO_N[x.e]||'')+'</span>'; }, v:function(x){ return SCTR_ESTADO_N[x.e]||''; } }
  ], falta, { unidad:'personas', archivo:'sctr-sin-cobertura-'+nombreArchivo(nombreObraP()||'obra'), vacio:R.activos ? 'Todos cubiertos hoy' : 'Todavía no hay personal',
              vacioSub:R.activos ? 'Todo el personal activo está en una constancia vigente de salud y en una de pensión.' : 'Carga tu personal en «Personal», o desde la constancia.' });
  var regs=SCTRW.regs||[];
  tabla($('t-sctr-const'), [
    { k:'cob', t:'Constancia', h:function(r){ return '<b>'+esc(r.suelta ? r.nombre : 'SCTR '+sctrCobN(r.cob).toLowerCase())+'</b>'+((r.aseg||r.pol) ? '<span class="sub">'+esc([r.aseg, r.pol ? 'póliza '+r.pol : ''].filter(Boolean).join(' · '))+'</span>' : ''); },
      v:function(r){ return (r.suelta ? r.nombre : sctrCobN(r.cob))+' '+r.aseg+' '+r.pol; } },
    { k:'a', t:'Vigencia', h:function(r){
        if(!r.de || !r.a) return '<span class="tenue">—</span>';
        var est=sctrVigente(r, hoy) ? '<span class="pill ok">vigente</span>' : (r.a < hoy ? '<span class="pill gris">vencida</span>' : '<span class="pill azul">desde el '+esc(sctrFechaCorta(r.de))+'</span>');
        return esc(sctrFechaCorta(r.de))+' al '+esc(sctrFechaCorta(r.a))+' '+est; }, v:function(r){ return r.a||''; } },
    { k:'n', t:'Asegurados', num:true, h:function(r){ if(!r.conLista) return '<span class="tenue">sin lista</span>'; var o=r.l.filter(function(p){ return p.lugar!=='f'; }).length;
        return '<b>'+r.l.length+'</b><span class="sub">'+o+' en obra · '+(r.l.length-o)+' en oficina</span>'; }, v:function(r){ return r.l.length; } },
    { k:'_acc', t:'', acc:true, h:function(r){ return (r.url ? '<a class="bt sec chico" target="_blank" rel="noopener" href="'+esc(r.url)+'">Abrir</a> ' : '')+
        (r.conLista ? '<button type="button" class="bt sec chico" data-acc="ver">Ver la lista</button> ' : '')+'<button type="button" class="bt sec chico" data-acc="quitar">Quitar</button>'; } }
  ], regs, { unidad:'constancias', archivo:'sctr-constancias-'+nombreArchivo(nombreObraP()||'obra'), vacio:'Todavía no hay constancias', vacioSub:'Sube la del mes con «＋ Subir una constancia»: el PDF o el Excel de la aseguradora, o una foto.',
             accion:function(a, r){ if(a==='ver') sctrVerHoja(r); else if(a==='quitar') sctrQuitar(r); } });
}

/* ── subir una constancia: los datos y el archivo ───────────────────────────────────────────────────────── */
function sctrNuevaHoja(){
  _sctrwCss();
  var m=sctrMes(hoyISO());
  SCTRW.F={ paso:'datos', cob:'ambas', aseg:'', pol:'', de:m.de, a:m.a, archivo:null, lista:[], leido:'', foto:false, avisoLectura:'' };
  _sctrwDatos();
}
function _sctrwDatos(aviso){
  var F=SCTRW.F;
  var h=(aviso ? '<div class="aviso mal" role="alert" id="sctr-aviso">'+esc(aviso)+'</div>' : '')+
    '<label class="sctr-zona" id="sctr-zona" tabindex="0"><span aria-hidden="true" style="font-size:22px">⬆</span><b id="sctr-zona-t">'+(F.archivo ? esc(F.archivo.name) : 'Suelta aquí la constancia o tócala para elegirla')+'</b>'+
      '<span class="tenue">'+(F.archivo ? (F.leido ? esc(F.leido) : 'Lista para leer') : 'PDF o Excel de la aseguradora (de ahí sale la lista), o una foto · hasta 25 MB')+'</span>'+
      '<input type="file" id="sctr-file" accept=".pdf,.xlsx,.xlsm,.csv,.txt,image/*,application/pdf"></label>'+
    '<div class="campo" style="margin-top:14px"><label>Cobertura</label><div class="sctr-cob" role="radiogroup" aria-label="Cobertura">'+
      SCTR_COB.map(function(c){ return '<button type="button" role="radio" aria-checked="'+(F.cob===c[0])+'" class="'+(F.cob===c[0] ? 'on' : '')+'" data-cob="'+c[0]+'">'+esc(c[1])+'</button>'; }).join('')+'</div></div>'+
    '<div class="sctr-dos"><div class="campo"><label for="sctr-aseg">Aseguradora</label><input id="sctr-aseg" maxlength="80" value="'+esc(F.aseg)+'" placeholder="El nombre de la aseguradora"></div>'+
      '<div class="campo"><label for="sctr-pol">N° de póliza</label><input id="sctr-pol" maxlength="40" value="'+esc(F.pol)+'" placeholder="Como sale en la constancia"></div></div>'+
    '<div class="sctr-dos"><div class="campo"><label for="sctr-de">Vigente desde</label><input type="date" id="sctr-de" value="'+esc(F.de)+'"></div>'+
      '<div class="campo"><label for="sctr-a">Hasta</label><input type="date" id="sctr-a" value="'+esc(F.a)+'"></div></div>'+
    '<div class="campo"><label for="sctr-pega">¿Sin archivo, o es una foto? Pega la lista aquí <span class="tenue">· si quieres</span></label>'+
      '<textarea id="sctr-pega" rows="3" spellcheck="false" placeholder="Una persona por línea: su documento y su nombre, como en la constancia">'+esc(F.pega||'')+'</textarea>'+
      '<p class="ayuda">También puedes armarla en el paso siguiente, marcando a tu personal.</p></div>'+
    '<div class="msg" id="sctr-msg" role="status"></div>';
  abrirHoja('Subir una constancia de SCTR', 'De la constancia sale la lista: la ves y la corriges antes de guardar', h,
    '<button type="button" class="bt sec" id="sctr-no">Cancelar</button><button type="button" class="bt" id="sctr-sig">Ver la lista ›</button>', {ancha:true, sinFoco:true});
  $('sctr-no').onclick=cerrarHoja;
  var z=$('sctr-zona'), fi=$('sctr-file');
  fi.onchange=function(){ _sctrwArchivo(fi.files && fi.files[0]); };
  ['dragenter', 'dragover'].forEach(function(ev){ z.addEventListener(ev, function(e){ e.preventDefault(); z.classList.add('sobre'); }); });
  ['dragleave', 'dragend'].forEach(function(ev){ z.addEventListener(ev, function(){ z.classList.remove('sobre'); }); });
  z.addEventListener('drop', function(e){ e.preventDefault(); z.classList.remove('sobre'); _sctrwArchivo(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });
  z.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); fi.click(); } });
  Array.prototype.forEach.call(document.querySelectorAll('#hoja-cuerpo [data-cob]'), function(b){ b.onclick=function(){ _sctrwLeerCampos(); F.cob=b.getAttribute('data-cob'); _sctrwDatos(); }; });
  $('sctr-sig').onclick=function(){
    _sctrwLeerCampos();
    var m=$('sctr-msg');
    if(!F.de || !F.a){ m.className='msg mal'; m.textContent='Pon desde cuándo y hasta cuándo vale la constancia.'; return; }
    if(F.a < F.de){ m.className='msg mal'; m.textContent='La fecha «hasta» es anterior a «desde».'; return; }
    var t=String(F.pega||'').trim();
    if(t && t!==F.pegaLeida){ var L=sctrListaDeTexto(t); F.pegaLeida=t; _sctrwSumar(L); F.leido=(F.leido ? F.leido+' · ' : '')+L.length+' de lo pegado.'; }
    _sctrwLista();
  };
}
function _sctrwLeerCampos(){
  var F=SCTRW.F; if(!F) return;
  if($('sctr-aseg')) F.aseg=$('sctr-aseg').value.trim();
  if($('sctr-pol')) F.pol=$('sctr-pol').value.trim();
  if($('sctr-de')) F.de=$('sctr-de').value;
  if($('sctr-a')) F.a=$('sctr-a').value;
  if($('sctr-pega')) F.pega=$('sctr-pega').value;
}
/* lo leído se suma a la lista (sin repetir el documento) */
function _sctrwSumar(L){
  var F=SCTRW.F, ya={}; F.lista.forEach(function(p){ ya[p.doc]=1; });
  (L||[]).forEach(function(p){ if(p && p.doc && !ya[p.doc]){ ya[p.doc]=1; F.lista.push({ td:p.td||'DNI', doc:p.doc, n:p.n||'', lugar:'o' }); } });
}
function _sctrwArchivo(f){
  var F=SCTRW.F; if(!f || !F) return;
  _sctrwLeerCampos();
  if((f.size||0) > 25*1024*1024){ _sctrwDatos('Ese archivo pesa más de 25 MB. Usa el PDF original de la aseguradora, o una foto más liviana.'); return; }
  F.archivo=f; F.lista=[]; F.leido=''; F.foto=/^image\//i.test(f.type||'');
  var m=$('sctr-msg'), zt=$('sctr-zona-t'); if(zt) zt.textContent=f.name;
  if(F.foto){ F.leido='Es una foto: la lista no se puede leer de una imagen. Ármala en el paso siguiente con tu personal, o pégala abajo.'; _sctrwDatos(); return; }
  if(m){ m.className='msg gris'; m.textContent='Leyendo «'+f.name+'»…'; }
  var esPdf=/\.pdf$/i.test(f.name||'') || /pdf/i.test(f.type||'');
  cargarGestion().then(function(){ return esPdf ? _sctrwLeerPdf(f) : _sctrwLeerExcel(f); }).then(function(L){
    if(SCTRW.F!==F) return;
    if($('sctr-zona')) _sctrwLeerCampos();
    _sctrwSumar(L);
    F.leido=L.length ? 'Se leyeron '+L.length+' asegurado'+(L.length===1 ? '' : 's')+': los ves en el paso siguiente.'
                     : (esPdf ? 'No se encontró una lista en este PDF. Si es una constancia escaneada (una imagen), no trae el texto: pide a la aseguradora el PDF original o el Excel, o arma la lista con tu personal.'
                              : 'No se encontró una lista en este archivo: tiene que tener una columna con el documento y otra con el nombre.');
    _sctrwDatos();
  }, function(e){
    if(SCTRW.F!==F) return;
    if($('sctr-zona')) _sctrwLeerCampos();
    F.leido=''; _sctrwDatos(typeof e==='string' && typeof gesNoLeyo==='function' && e!=='es_pdf' ? gesNoLeyo(e) : 'No se pudo leer ese archivo. Revisa que sea un PDF, un Excel (.xlsx) o un .csv.');
  });
}
/* el PDF: su texto con pdf.js, en líneas y celdas (por dónde está cada palabra en la hoja) */
function _sctrwLeerPdf(f){
  return f.arrayBuffer().then(function(buf){
    return pdfjsP().then(function(pdfjs){ return pdfjs.getDocument({ data:new Uint8Array(buf), isEvalSupported:false }).promise; });
  }).then(function(doc){
    var n=Math.min(doc.numPages, 80), L=[], cad=Promise.resolve();
    for(var i=1; i<=n; i++) (function(i){ cad=cad.then(function(){ return doc.getPage(i).then(function(pg){ return pg.getTextContent().then(function(tc){ L=L.concat(sctrLineasDePagina(tc.items||[])); }); }); }); })(i);
    return cad.then(function(){ try{ doc.destroy(); }catch(e){} return sctrDeLineas(L); });
  });
}
function sctrLineasDePagina(items){
  var it=items.filter(function(x){ return x && String(x.str||'').trim(); }).map(function(x){
    var t=x.transform||[1, 0, 0, 1, 0, 0], h=Math.abs(t[3])||Math.abs(t[0])||8;
    return { s:String(x.str), x:t[4], y:t[5], w:x.width||0, h:h };
  });
  it.sort(function(a, b){ return (b.y-a.y) || (a.x-b.x); });
  var L=[], cur=null;
  it.forEach(function(x){
    if(cur && Math.abs(cur.y-x.y)<=Math.max(2, Math.min(cur.h, x.h)*0.5)) cur.it.push(x);
    else { cur={ y:x.y, h:x.h, it:[x] }; L.push(cur); }
  });
  return L.map(function(l){
    l.it.sort(function(a, b){ return a.x-b.x; });
    var cel=[], c=null;
    l.it.forEach(function(x){
      var hueco=c ? x.x-c.x1 : 0;
      if(c && hueco<=Math.max(3, x.h*0.8)){ c.s+=(hueco>x.h*0.15 && !/\s$/.test(c.s) && !/^\s/.test(x.s) ? ' ' : '')+x.s; c.x1=Math.max(c.x1, x.x+x.w); }
      else { c={ x0:x.x, x1:x.x+x.w, s:x.s }; cel.push(c); }
    });
    cel.forEach(function(k){ k.s=k.s.replace(/\s+/g, ' ').trim(); });
    return { y:l.y, celdas:cel.filter(function(k){ return k.s; }) };
  });
}
/* las líneas → la lista. Con la fila de títulos («Apellidos y nombres», «DNI»…), cada celda va a su columna (la que más
   se le cruza en la hoja); sin títulos, cada línea por su cuenta (sctrFilaDeLinea). */
function _sctrwDocOk(d){ return /^\d{8}$/.test(d) || /^(?=[A-Z0-9]*\d)[A-Z0-9]{9,12}$/i.test(d); }
function sctrDeLineas(L){
  var out=[], visto={}, cols=null, map=null;
  (L||[]).forEach(function(l){
    var tx=l.celdas.map(function(c){ return c.s; });
    var m=gesMapear(tx, SCTR_CAMPOS);
    if(m.dni!==undefined && (m.nombre!==undefined || m.ap1!==undefined || m.nom!==undefined) && !tx.some(function(s){ return _sctrwDocOk(s.replace(/[^0-9A-Za-z]/g, '')) && /\d/.test(s); })){ cols=l.celdas; map=m; return; }
    var f=null;
    if(cols){
      var v=cols.map(function(){ return ''; });
      l.celdas.forEach(function(c){
        var mejor=-1, sol=-1e9;
        cols.forEach(function(k, i){ var a=Math.max(c.x0, k.x0-4), b=Math.min(c.x1, k.x1+4), s=b-a; if(s<=0) s=-Math.min(Math.abs(c.x0-k.x1), Math.abs(k.x0-c.x1)); if(s>sol){ sol=s; mejor=i; } });
        if(mejor>-1) v[mejor]=(v[mejor] ? v[mejor]+' ' : '')+c.s;
      });
      f=_sctrwDeCeldas(v, map);
    }
    if(!f) f=sctrFilaDeLinea(tx.join(' '));
    if(f && !visto[f.doc]){ visto[f.doc]=1; out.push(f); }
  });
  return out;
}
function _sctrwDeCeldas(v, map){
  var td=map.td!==undefined ? String(v[map.td]||'') : '';
  /* el documento, ya limpio: el DNI al que Excel le quitó el cero de adelante vuelve a tener sus 8 */
  var doc=sctrDoc(td ? _sctrTipo(td) : 'DNI', String(map.dni!==undefined ? v[map.dni]||'' : '').toUpperCase().replace(/[^0-9A-Z]/g, ''));
  if(!_sctrwDocOk(doc)) return null;
  var nom;
  if(map.nombre!==undefined) nom=String(v[map.nombre]||'');
  else {
    var ap=[map.ap1, map.ap2].filter(function(i){ return i!==undefined; }).map(function(i){ return String(v[i]||'').trim(); }).filter(Boolean).join(' ');
    var nn=map.nom!==undefined ? String(v[map.nom]||'').trim() : '';
    nom=ap && nn ? ap+', '+nn : (ap || nn);
  }
  nom=nom.replace(/\s+/g, ' ').replace(/^[,\s]+|[,\s]+$/g, '').trim();
  if(!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/.test(nom) || /\d/.test(nom)) return null;
  var t=td ? _sctrTipo(td) : (/^\d{8}$/.test(doc) ? 'DNI' : 'CE');
  return { td:t, doc:sctrDoc(t, doc), n:nom };
}
/* el Excel (o el .csv): la hoja que más se parece a una lista de asegurados, sus títulos y sus filas */
function _sctrwLeerExcel(f){
  return gesLeerArchivo(f).then(function(x){
    var mejor=null, pm=-1;
    (x.hojas||[]).forEach(function(hj){
      var t=gesFilaTitulos(hj.filas, SCTR_CAMPOS, ['nombre', 'ap1', 'nom', 'dni']);
      var m=t>-1 ? gesMapear(hj.filas[t], SCTR_CAMPOS) : {};
      var p=(t>-1 && m.dni!==undefined ? 1000 : 0)+Object.keys(m).length*100+Math.min(hj.filas.length, 99);
      if(p>pm){ pm=p; mejor={ h:hj, t:t, m:m }; }
    });
    if(!mejor) return [];
    var out=[], visto={};
    mejor.h.filas.forEach(function(fila, i){
      if(mejor.t>-1 && i<=mejor.t) return;
      var r=(mejor.t>-1 && mejor.m.dni!==undefined) ? _sctrwDeCeldas(fila, mejor.m) : null;
      if(!r) r=sctrFilaDeLinea(fila.join(' '));
      if(r && !visto[r.doc]){ visto[r.doc]=1; out.push(r); }
    });
    return out;
  });
}

/* ── la lista: verla, corregirla y marcar quién va a obra ───────────────────────────────────────────────── */
function _sctrwLista(aviso){
  var F=SCTRW.F, P=_sctrwPersonalPorDoc(SCTRW.per), L=F.lista;
  var nObra=L.filter(function(p){ return p.lugar!=='f'; }).length, nuevos=L.filter(function(p){ return !P[p.doc]; }).length;
  var h=(aviso ? '<div class="aviso mal" role="alert" id="sctr-aviso">'+esc(aviso)+'</div>' : '')+
    '<p style="margin:0 0 10px">'+(F.leido ? esc(F.leido)+' ' : '')+'Revisa cada fila antes de guardar: corrige el documento o el nombre, quita a quien no va y marca quién está en <b>obra</b> y quién en <b>oficina</b>. '+
      'Los de oficina quedan en la constancia, pero no se cruzan con el personal de la obra.</p>'+
    '<div class="sctr-barra"><button type="button" class="bt sec chico" id="sctr-todos-o">Todos en obra</button><button type="button" class="bt sec chico" id="sctr-todos-f">Todos en oficina</button>'+
      '<button type="button" class="bt sec chico" id="sctr-mas">＋ Agregar una persona</button><button type="button" class="bt sec chico" id="sctr-de-per">＋ Marcar de mi personal</button>'+
      '<span class="cuenta" id="sctr-cuenta">'+L.length+' en la lista · '+nObra+' en obra · '+nuevos+' no están en tu personal</span></div>';
  if(!L.length) h+='<div class="vacio" id="sctr-vacia"><b>La lista está vacía</b>Agrega a cada persona, o márcalas de tu personal.</div>';
  else {
    h+='<div class="tabla-caja"><table class="sctr-tabla" id="sctr-tabla"><thead><tr><th>#</th><th>'+esc(docPersonaP())+'</th><th>Apellidos y nombres</th><th>Dónde</th><th>En tu personal</th><th></th></tr></thead><tbody>'+
      L.map(function(p, i){
        var est=_sctrwEstHtml(P[p.doc]);
        return '<tr data-i="'+i+'"><td class="tenue">'+(i+1)+'</td>'+
          '<td class="doc"><input data-c="doc" value="'+esc(p.doc)+'" aria-label="Documento de la fila '+(i+1)+'" class="'+(_sctrwDocOk(p.doc) ? '' : 'mal')+'"></td>'+
          '<td><input data-c="n" value="'+esc(p.n)+'" aria-label="Nombre de la fila '+(i+1)+'" class="'+(String(p.n||'').trim().length>=3 ? '' : 'mal')+'"></td>'+
          '<td class="lug"><select data-c="lugar" aria-label="Dónde trabaja"><option value="o"'+(p.lugar!=='f' ? ' selected' : '')+'>En obra</option><option value="f"'+(p.lugar==='f' ? ' selected' : '')+'>En oficina</option></select></td>'+
          '<td>'+est+'</td><td><button type="button" class="x" data-quitar="'+i+'" aria-label="Quitar a '+esc(p.n||p.doc)+'">×</button></td></tr>';
      }).join('')+'</tbody></table></div>';
  }
  h+='<div class="msg" id="sctr-msg" role="status"></div>';
  abrirHoja('La lista de asegurados', 'SCTR '+sctrCobN(F.cob).toLowerCase()+' · '+sctrFechaCorta(F.de)+' al '+sctrFechaCorta(F.a)+(F.archivo ? ' · '+F.archivo.name : ''), h,
    '<button type="button" class="bt sec" id="sctr-volver">‹ Volver</button><button type="button" class="bt" id="sctr-guardar">Guardar la constancia</button>', {ancha:true, sinFoco:true});
  $('sctr-volver').onclick=function(){ _sctrwDatos(); };
  $('sctr-guardar').onclick=_sctrwGuardar;
  $('sctr-todos-o').onclick=function(){ L.forEach(function(p){ p.lugar='o'; }); _sctrwLista(); };
  $('sctr-todos-f').onclick=function(){ L.forEach(function(p){ p.lugar='f'; }); _sctrwLista(); };
  $('sctr-mas').onclick=function(){ L.push({ td:'DNI', doc:'', n:'', lugar:'o' }); _sctrwLista(); var q=document.querySelector('#sctr-tabla tr[data-i="'+(L.length-1)+'"] input[data-c="doc"]'); if(q) q.focus(); };
  $('sctr-de-per').onclick=_sctrwDePersonal;
  var tb=$('sctr-tabla');
  if(tb){
    tb.addEventListener('input', function(ev){
      var x=ev.target, tr=x.closest('tr'); if(!tr || !x.getAttribute('data-c')) return;
      var p=L[+tr.getAttribute('data-i')]; if(!p) return;
      var c=x.getAttribute('data-c');
      if(c==='doc'){
        p.doc=sctrDoc(p.td, x.value); x.classList.toggle('mal', !_sctrwDocOk(p.doc));
        /* sin volver a dibujar la tabla (se perdería lo que se está escribiendo en otra celda): su estado y la cuenta */
        if(tr.children[4]) tr.children[4].innerHTML=_sctrwEstHtml(_sctrwPersonalPorDoc(SCTRW.per)[p.doc]);
        _sctrwCuenta();
      }
      else if(c==='n'){ p.n=x.value; x.classList.toggle('mal', String(p.n).trim().length<3); }
    });
    tb.addEventListener('change', function(ev){
      var x=ev.target, tr=x.closest('tr'); if(!tr) return;
      var p=L[+tr.getAttribute('data-i')]; if(!p) return;
      if(x.getAttribute('data-c')==='lugar'){ p.lugar=x.value==='f' ? 'f' : 'o'; _sctrwCuenta(); }
      else if(x.getAttribute('data-c')==='doc'){ p.doc=sctrDoc(p.td, x.value); x.value=p.doc; }
    });
    tb.addEventListener('click', function(ev){ var b=ev.target.closest('[data-quitar]'); if(!b) return; L.splice(+b.getAttribute('data-quitar'), 1); _sctrwLista(); });
  }
}
function _sctrwCuenta(){
  var F=SCTRW.F, P=_sctrwPersonalPorDoc(SCTRW.per), L=F.lista, c=$('sctr-cuenta'); if(!c) return;
  c.textContent=L.length+' en la lista · '+L.filter(function(p){ return p.lugar!=='f'; }).length+' en obra · '+L.filter(function(p){ return !P[p.doc]; }).length+' no están en tu personal';
}
/* de una foto (o para completar): marcar a la gente del personal activo que está en la constancia */
function _sctrwDePersonal(){
  var F=SCTRW.F, ya={}; F.lista.forEach(function(p){ ya[p.doc]=1; });
  var act=(SCTRW.per||[]).filter(function(t){ return String(t.estatus||'activo')!=='cesado' && sctrDoc(t.td, t.dni) && !ya[sctrDoc(t.td, t.dni)]; });
  if(!act.length){ toast(SCTRW.per && SCTRW.per.length ? 'Todo tu personal activo ya está en la lista.' : 'Todavía no hay personal con su documento.'); return; }
  var h='<p style="margin:0 0 10px">Marca a quienes están en esta constancia. Entran como «en obra».</p>'+
    '<label style="display:flex;gap:8px;align-items:center;margin:0 0 8px"><input type="checkbox" id="sctr-per-todos" checked> <b>Todos ('+act.length+')</b></label>'+
    '<div id="sctr-per-lista" style="max-height:50vh;overflow:auto;border:1px solid var(--borde);border-radius:10px;padding:6px 10px">'+
    act.map(function(t, i){ return '<label style="display:flex;gap:8px;align-items:center;padding:5px 0"><input type="checkbox" data-p="'+i+'" checked> '+esc(t.nombre||'')+' <span class="tenue">'+esc(t.dni||'')+'</span></label>'; }).join('')+'</div>';
  abrirHoja('Marcar de mi personal', 'El personal activo de la obra que todavía no está en la lista', h,
    '<button type="button" class="bt sec" id="sctr-per-no">‹ Volver</button><button type="button" class="bt" id="sctr-per-si">Agregar a la lista</button>', {sinFoco:true});
  $('sctr-per-todos').onchange=function(){ var on=this.checked; Array.prototype.forEach.call(document.querySelectorAll('#sctr-per-lista [data-p]'), function(c){ c.checked=on; }); };
  $('sctr-per-no').onclick=function(){ _sctrwLista(); };
  $('sctr-per-si').onclick=function(){
    var L=[];
    Array.prototype.forEach.call(document.querySelectorAll('#sctr-per-lista [data-p]'), function(c){ if(c.checked){ var t=act[+c.getAttribute('data-p')]; L.push({ td:_sctrTipo(t.td), doc:sctrDoc(t.td, t.dni), n:t.nombre }); } });
    _sctrwSumar(L); _sctrwLista();
  };
}
/* guardar: el archivo al balde de la obra y la fila en sst_doc */
function _sctrwGuardar(){
  var F=SCTRW.F, m=$('sctr-msg'), b=$('sctr-guardar');
  var malas=F.lista.filter(function(p){ return !_sctrwDocOk(p.doc) || String(p.n||'').trim().length<3; });
  if(malas.length){ m.className='msg mal'; m.textContent=malas.length===1 ? 'Hay una fila sin documento o sin nombre: corrígela o quítala con la ×.' : 'Hay '+malas.length+' filas sin documento o sin nombre: corrígelas o quítalas con la ×.'; return; }
  var docs={}, rep=F.lista.filter(function(p){ if(docs[p.doc]) return true; docs[p.doc]=1; return false; });
  if(rep.length){ m.className='msg mal'; m.textContent='El documento '+rep[0].doc+' está dos veces en la lista: quita una.'; return; }
  if(!F.archivo && !F.lista.length){ m.className='msg mal'; m.textContent='Sube el archivo de la constancia o arma su lista: sin ninguno de los dos no hay qué guardar.'; return; }
  b.disabled=true; m.className='msg gris'; m.textContent=F.archivo ? 'Subiendo la constancia…' : 'Guardando…';
  var o={ cob:F.cob, aseg:F.aseg, pol:F.pol, de:F.de, a:F.a, por:_sctrwPor(), l:F.lista };
  (F.archivo ? subirArchivoP('docs', F.archivo) : Promise.resolve(null)).then(function(url){
    m.textContent='Guardando…';
    return sbPostP('sst_doc', { empresa:_sctrwEmp(), hoja:SCTR_HOJA, nombre:sctrNombreFila(o), url:url, nota:sctrNota(o) });
  }).then(function(){
    _sctrwListo(o);
    if(VISTA.actual==='sctr' && VISTA.recargar) VISTA.recargar(true);
  }, function(e){
    b.disabled=false; m.className='msg mal';
    m.textContent=e==='muy-grande' ? 'Ese archivo pesa más de 25 MB.' : (e===401 || e===403) ? 'Tu sesión venció o esta cuenta no puede guardar en esta obra.' : 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.';
  });
}
function _sctrwNuevosObra(l){
  var P=_sctrwPersonalPorDoc(SCTRW.per);
  return (l||[]).filter(function(p){ return p.lugar!=='f' && !P[p.doc]; });
}
function _sctrwListo(o){
  var nuevos=_sctrwNuevosObra(o.l), nObra=o.l.filter(function(p){ return p.lugar!=='f'; }).length;
  var h='<div class="aviso ok" id="sctr-listo">✓ <b>Guardada.</b> '+esc(sctrNombreFila(o))+(o.l.length ? ': '+o.l.length+' asegurado'+(o.l.length===1 ? '' : 's')+' ('+nObra+' en obra, '+(o.l.length-nObra)+' en oficina).' : '.')+' La ve también la app.</div>'+
    (nuevos.length ? '<p id="sctr-nuevos">'+(nuevos.length===1 ? 'Hay <b>1 persona en obra</b> que no está en tu personal.' : 'Hay <b>'+nuevos.length+' personas en obra</b> que no están en tu personal.')+
      ' ¿Las cargas? Vas a ver cómo quedan antes de guardar (el nombre se escribe como en la app: «Apellidos, Nombres»).</p>' : '');
  abrirHoja('Constancia guardada', '', h, (nuevos.length ? '<button type="button" class="bt sec" id="sctr-fin">Ahora no</button><button type="button" class="bt" id="sctr-cargar">Cargar a mi personal ('+nuevos.length+')</button>'
                                                        : '<button type="button" class="bt" id="sctr-fin">Listo</button>'), {sinFoco:true});
  $('sctr-fin').onclick=cerrarHoja;
  if($('sctr-cargar')) $('sctr-cargar').onclick=function(){ sctrCargarPersonal(nuevos); };
}
/* los nuevos de obra, a la hoja de «Subir la lista de trabajadores» (gestion.js): ahí se ve cómo quedan y vale el tope */
function sctrCargarPersonal(nuevos){
  var filas=[['Apellidos y nombres', 'Tipo de documento', 'Documento']].concat((nuevos||[]).map(function(p){ return [sctrNombreApp(p.n), p.td||'DNI', p.doc]; }));
  cargarGestion().then(function(){
    if(typeof gesPersonalDesdeFilas!=='function'){ toast('No se pudo abrir la carga del personal. Vuelve a cargar la página.'); return; }
    gesPersonalDesdeFilas(filas, 'SCTR');
  }, function(){ toast('No se pudo abrir esta parte. Revisa tu conexión e inténtalo otra vez.'); });
}

/* ── ver la lista de una constancia guardada ────────────────────────────────────────────────────────────── */
function sctrVerHoja(r){
  _sctrwCss();
  var P=_sctrwPersonalPorDoc(SCTRW.per), nuevos=_sctrwNuevosObra(r.l);
  var h='<p style="margin:0 0 10px">'+esc([r.aseg, r.pol ? 'póliza '+r.pol : '', r.de ? sctrFechaCorta(r.de)+' al '+sctrFechaCorta(r.a) : ''].filter(Boolean).join(' · '))+(r.por ? ' <span class="tenue">· la subió '+esc(r.por)+'</span>' : '')+'</p>'+
    '<div class="tabla-caja"><table class="sctr-tabla" id="sctr-ver"><thead><tr><th>#</th><th>'+esc(docPersonaP())+'</th><th>Apellidos y nombres</th><th>Dónde</th><th>En tu personal</th></tr></thead><tbody>'+
    r.l.map(function(p, i){ var t=P[p.doc];
      return '<tr><td class="tenue">'+(i+1)+'</td><td>'+esc(p.doc)+'</td><td>'+esc(p.n)+'</td><td>'+(p.lugar==='f' ? 'En oficina' : 'En obra')+'</td><td>'+
        (t ? (String(t.estatus||'activo')==='cesado' ? '<span class="pill gris">cesado</span>' : '<span class="pill ok">sí</span>') : '<span class="pill azul">nuevo</span>')+'</td></tr>'; }).join('')+'</tbody></table></div>';
  abrirHoja(r.suelta ? r.nombre : 'SCTR '+sctrCobN(r.cob).toLowerCase(), r.l.length+' asegurado'+(r.l.length===1 ? '' : 's'), h,
    (r.url ? '<a class="bt sec" target="_blank" rel="noopener" href="'+esc(r.url)+'">Abrir el archivo</a>' : '')+
    (nuevos.length ? '<button type="button" class="bt" id="sctr-ver-cargar">Cargar a mi personal ('+nuevos.length+')</button>' : '<button type="button" class="bt" id="sctr-ver-ok">Cerrar</button>'), {ancha:true});
  if($('sctr-ver-ok')) $('sctr-ver-ok').onclick=cerrarHoja;
  if($('sctr-ver-cargar')) $('sctr-ver-cargar').onclick=function(){ sctrCargarPersonal(nuevos); };
}
/* ── quitar una constancia (su fila y su archivo) ───────────────────────────────────────────────────────── */
function sctrQuitar(r){
  confirmar('¿Quitar esta constancia?', (r.suelta ? r.nombre : sctrNombreFila(r))+'. Se borran su archivo y su lista. El personal que ya se cargó desde ella no se toca.', {si:'Quitar', mal:true}).then(function(si){
    if(!si) return;
    sbDelP('sst_doc?id=eq.'+_enc(r.id)).then(function(){
      var pre=SB.url+'/storage/v1/object/public/msds/', u=String(r.url||'');
      if(u.indexOf(pre)===0){
        var ruta=''; try{ ruta=decodeURIComponent(u.slice(pre.length).split('?')[0]); }catch(e){}
        if(ruta && ruta.indexOf(_sctrwEmp()+'/')===0) sbFetch(SB.url+'/storage/v1/object/msds', { method:'DELETE', body:JSON.stringify({ prefixes:[ruta] }) }).catch(function(){ return null; });
      }
      toast('Constancia quitada.');
      if(VISTA.recargar) VISTA.recargar(true);
    }, function(e){ toast((e===401 || e===403) ? 'Esta cuenta no puede quitarla.' : 'No se pudo quitar. Revisa tu conexión.'); });
  });
}
