/* ══ 4/11/2026 · V7.9d · ERGONOMÍA DE OFICINA (revisión de Gemini, documento 3) ══════════════════════════════════════
   Lo común con la app (ERGO-BASE: las preguntas, el resultado y el texto) va tal cual, entre sus marcas: se edita en la
   app y se copia aquí (herr/copias.py revisa que las funciones sean las mismas). Abajo, la sección de la web.
   Las pruebas: pruebas/v79d.js (todo inventado). */
/* >>> ERGO-BASE-INI (4/11/2026 · V7.9d · se edita aquí, en la app; su copia va en portal/ergo.js: herr/copias.py revisa las funciones) <<< */
/* ══════════════════════════════════════════════════════════════════
   EL PUESTO DE OFICINA · AUTODIAGNÓSTICO ERGONÓMICO (4/11/2026 · V7.9d, revisión de Gemini, documento 3)
   Preguntas de sí o no sobre la silla, la mesa, la pantalla y las pausas. Cada «no» dice qué cambiar y el numeral de
   la R.M. 375-2008-TR (Norma básica de ergonomía y de procedimiento de evaluación de riesgo disergonómico), verificada
   en su texto: num. 16 (trabajo en posición sentada), 17 (la silla), 21 (pantallas) y 37 e) (pausas cortas y
   frecuentes). En teletrabajo, el D.S. 002-2023-TR, art. 26: la autoevaluación es opcional y de común acuerdo, con el
   formulario que indica el empleador; esto ayuda a prepararla y no lo reemplaza. No es un examen médico ni la
   evaluación de riesgo disergonómico: es una revisión rápida del puesto. Lo común de la app (el trabajador, en su
   celular) y de la web (SST evalúa y guarda el puesto). Sin DOM.
   ══════════════════════════════════════════════════════════════════ */
var ERGO_NORMA = 'R.M. 375-2008-TR';
var ERGO_TELE = 'D.S. 002-2023-TR, art. 26 (modificado por el D.S. 009-2026-TR)';
var ERGO_GRUPOS = [
  { k:'silla', ic:'🪑', n:'Tu silla' },
  { k:'mesa', ic:'🗄️', n:'Tu mesa' },
  { k:'pantalla', ic:'🖥️', n:'Tu pantalla y tu teclado' },
  { k:'pausas', ic:'⏸️', n:'Tus pausas' }
];
/* q: la pregunta · r: qué cambiar si es «no» · c: el numeral · rec: la norma lo dice «recomendable» · na: puede no aplicar */
var ERGO_PREG = [
  { k:'s1', g:'silla', q:'¿Tu silla sube y baja, y la ajustas estando sentado?', r:'Una silla de altura regulable, que se ajuste estando sentado.', c:'17 a) y b)' },
  { k:'s2', g:'silla', q:'Sentado, ¿apoyas los pies planos en el piso y tus muslos quedan casi horizontales?', r:'Ajusta la altura de la silla hasta apoyar los pies planos, con los muslos casi horizontales.', c:'17 b)' },
  { k:'s3', g:'silla', q:'¿El respaldo se regula en altura e inclinación y sostiene tu espalda baja?', r:'Un respaldo regulable en altura e inclinación, con forma que sostenga la zona lumbar.', c:'17 e)' },
  { k:'s4', g:'silla', q:'¿Tu silla tiene cinco ruedas?', r:'Para el trabajo de oficina, una silla de cinco ruedas.', c:'17 c)' },
  { k:'s5', g:'silla', q:'¿El asiento tiene el borde de adelante redondeado y un acolchado firme?', r:'Un asiento con el borde de adelante redondeado y un acolchado (tapiz) de 20 mm o más.', c:'17 d)' },
  { k:'s6', g:'silla', q:'¿Tu silla tiene apoyabrazos?', r:'Los apoyabrazos son recomendables.', c:'17 f)', rec:1 },
  { k:'m1', g:'mesa', q:'Sentado, ¿la mesa te queda a la altura de los codos?', r:'La mesa a la altura de los codos: sube o baja la silla (o la mesa, si se regula).', c:'17 b)' },
  { k:'m2', g:'mesa', q:'¿Tu mesa y tu silla se pueden regular a tu medida?', r:'Muebles que se regulen a la medida de quien los usa.', c:'16 a)' },
  { k:'p1', g:'pantalla', q:'¿Puedes mover tu pantalla: acercarla, girarla, subirla o bajarla?', r:'Una pantalla que se pueda mover y regular.', c:'21 a) y b)' },
  { k:'p2', g:'pantalla', q:'¿Tu pantalla está sin reflejos de ventanas o lámparas?', r:'Gira o mueve la pantalla hasta quitarle los reflejos.', c:'21 b)' },
  { k:'p3', g:'pantalla', q:'¿El borde de arriba de la pantalla te queda a la altura de los ojos?', r:'El borde de arriba de la pantalla, a la altura de los ojos: súbela o bájala.', c:'21 c)' },
  { k:'p4', g:'pantalla', q:'¿La pantalla está a un brazo de distancia, o más cerca?', r:'La pantalla a una distancia que no pase el largo de tu brazo.', c:'21 d)' },
  { k:'p5', g:'pantalla', q:'¿Tu teclado está separado de la pantalla y al mismo nivel que el mouse?', r:'Un teclado aparte (en una laptop, uno externo), al mismo nivel que el mouse.', c:'21 e)' },
  { k:'p6', g:'pantalla', q:'Si escribes leyendo papeles, ¿tienes un atril para ponerlos?', r:'Un atril (portadocumentos) para los papeles que lees mientras escribes.', c:'21 f)', na:1 },
  { k:'z1', g:'pausas', q:'¿Haces una pausa de unos 10 minutos por cada 50 minutos de trabajo?', r:'Una pausa de 10 minutos cada 50 minutos de trabajo, sin descontarla de la jornada.', c:'16 d) y 37 e)' },
  { k:'z2', g:'pausas', q:'¿Haces estiramientos durante tu jornada?', r:'Estiramientos durante la jornada.', c:'16 e)' },
  { k:'z3', g:'pausas', q:'¿Te enseñaron a ajustar tu puesto y a sentarte bien?', r:'Que te enseñen a ajustar tu puesto y a trabajar sentado.', c:'16 f)' }
];
/* r: { llave: 'si' | 'no' | 'na' } → lo que está en orden, lo que hay que cambiar, lo recomendable y lo que falta contestar.
   «X de Y en orden» cuenta lo que la norma pide (no lo que solo recomienda, como el apoyabrazos: eso va aparte) */
function ergoResultado(r){
  r = (r && typeof r === 'object') ? r : {};
  var R = { si:[], no:[], rec:[], recSi:[], na:[], falta:[], total:0 };
  ERGO_PREG.forEach(function(p){
    var v = r[p.k];
    if(v === 'na' && p.na){ R.na.push(p); return; }
    if(v !== 'si' && v !== 'no'){ R.falta.push(p); return; }
    if(p.rec){ (v === 'si' ? R.recSi : R.rec).push(p); return; }
    R.total++;
    (v === 'si' ? R.si : R.no).push(p);
  });
  R.completo = !R.falta.length;
  R.enOrden = R.si.length;
  return R;
}
function ergoCita(p){ return ERGO_NORMA + ', num. ' + p.c; }
/* lo guardado, limpio: { v:1, fecha, puesto, persona, tele, r } (la web lo guarda en sst_doc, hoja «ergo») */
function ergoNotaLimpia(n){
  var d = null; try{ d = typeof n === 'string' ? JSON.parse(n) : n; }catch(_e){ d = null; }
  if(!d || typeof d !== 'object' || Array.isArray(d)) return null;
  var r = {};
  ERGO_PREG.forEach(function(p){ var v = d.r && d.r[p.k]; if(v === 'si' || v === 'no' || (v === 'na' && p.na)) r[p.k] = v; });
  return { v:1, fecha:/^\d{4}-\d{2}-\d{2}$/.test(String(d.fecha || '')) ? d.fecha : '', puesto:String(d.puesto || '').slice(0, 120), persona:String(d.persona || '').slice(0, 120), tele:d.tele === true, r:r };
}
/* el texto para contarlo (a SST, por WhatsApp o correo) */
function ergoTexto(r, o){
  o = o || {};
  var T = function(s){ return (typeof trad === 'function') ? trad(s) : s; };
  var R = ergoResultado(r), L = [];
  L.push(T('Autodiagnóstico de mi puesto de trabajo') + (o.fecha ? ' (' + o.fecha + ')' : '') + (o.quien ? ' · ' + o.quien : ''));
  L.push(R.enOrden + ' / ' + R.total + ' · ' + T('en orden'));
  if(R.no.length){ L.push(T('Qué cambiar') + ':'); R.no.forEach(function(p){ L.push('• ' + T(p.r) + ' (' + ergoCita(p) + ')'); }); }
  if(R.rec.length){ L.push(T('Recomendable') + ':'); R.rec.forEach(function(p){ L.push('• ' + T(p.r) + ' (' + ergoCita(p) + ')'); }); }
  if(!R.no.length && !R.rec.length) L.push(T('Tu puesto está en orden.'));
  if(o.tele) L.push(T('En teletrabajo, la autoevaluación es opcional y de común acuerdo, con el formulario que indica tu empleador.') + ' (' + ERGO_TELE + ')');
  return L.join('\n');
}
/* <<< ERGO-BASE-FIN >>> */

/* ══ LA SECCIÓN DE LA WEB: «Ergonomía de oficina» (4/11/2026 · V7.9d) ══════════════════════════════════════════════════
   SST revisa el puesto de una persona (las mismas preguntas que el trabajador tiene en su app), lo guarda en la obra
   (sst_doc, hoja «ergo»: { v:1, fecha, puesto, persona, tele, r }) y lo baja en PDF con lo que hay que cambiar. */
var ERGOW={ obra:null, caja:null, n:0, L:null, form:null };
function _ergoF(iso){ var s=String(iso||'').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.slice(8, 10)+'/'+s.slice(5, 7)+'/'+s.slice(0, 4) : ''; }
function _ergoLeerFila(f){ var n=ergoNotaLimpia(f && f.nota); return n ? Object.assign({ id:f.id, creado:f.creado }, n) : null; }
function ergoTraer(){
  var oid=(YO.obra||{}).id;
  return traer('sst_doc', '&hoja=eq.ergo&select=id,nombre,nota,creado&order=creado.desc', 300).then(function(L){
    if((YO.obra||{}).id!==oid) return ERGOW.L;
    ERGOW.L=(L||[]).map(_ergoLeerFila).filter(Boolean);
    return ERGOW.L;
  });
}
function vistaErgo(caja){
  _ergoCss();
  var oid=(YO.obra||{}).id;
  if(ERGOW.obra!==oid){ ERGOW.obra=oid; ERGOW.L=null; }
  ERGOW.caja=caja;
  var ac=$('acciones'); if(ac){ ac.innerHTML='<button type="button" class="bt" id="ergo-nuevo">＋ Revisar un puesto</button>'; $('ergo-nuevo').onclick=function(){ ergoNuevo(); }; }
  function ergoPintaW(silencio){
    var n=++ERGOW.n;
    ergoTraer().then(function(){ if(n!==ERGOW.n || VISTA.actual!=='ergo') return; _ergoPintar(); },
                     function(e){ if(n!==ERGOW.n || VISTA.actual!=='ergo') return; if(!silencio) fallo(caja, e); });
  }
  VISTA.recargar=ergoPintaW; ergoPintaW();
}
function _ergoPintar(){
  var caja=ERGOW.caja; if(!caja || !document.body.contains(caja)) return;
  var L=ERGOW.L||[];
  var h='<p class="ergo-w-intro">La revisión rápida del puesto de oficina, pregunta por pregunta, con lo que pide la <b>'+esc(ERGO_NORMA)+'</b> (num. 16, 17, 21 y 37 e): la silla, la mesa, la pantalla y las pausas. '+
        'Cada «no» dice qué cambiar. No es un examen médico ni la evaluación de riesgo disergonómico. '+
        'El trabajador tiene las mismas preguntas en su app («Tu puesto de trabajo», en las obras de oficinas, educación y salud).</p>';
  if(!L.length) h+='<div class="vacio" id="ergo-vacio"><b>Todavía no hay puestos revisados</b>Revisa el primero con «＋ Revisar un puesto»: toma unos minutos, junto a la persona.</div>';
  else h+='<div class="tabla-caja"><table id="ergo-t"><thead><tr><th>Fecha</th><th>Puesto</th><th>Persona</th><th>En orden</th><th>Por cambiar</th><th></th></tr></thead><tbody>'+L.map(function(x){
      var R=ergoResultado(x.r);
      return '<tr data-id="'+esc(x.id)+'"><td>'+esc(_ergoF(x.fecha))+'</td><td><b>'+esc(x.puesto)+'</b>'+(x.tele ? ' <span class="pill azul">teletrabajo</span>' : '')+'</td><td>'+esc(x.persona||'—')+'</td>'+
        '<td>'+R.enOrden+' de '+R.total+'</td><td>'+(R.no.length ? '<span class="pill ojo">'+R.no.length+'</span>' : '<span class="pill ok">nada</span>')+'</td>'+
        '<td class="ergo-w-acc"><button type="button" class="bt sec chico" data-ergo-ver="'+esc(x.id)+'">Ver</button><button type="button" class="bt sec chico" data-ergo-pdf="'+esc(x.id)+'">PDF</button></td></tr>';
    }).join('')+'</tbody></table></div>';
  caja.innerHTML=h;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ergo-ver]'), function(b){ b.onclick=function(){ ergoNuevo(_ergoPorId(b.getAttribute('data-ergo-ver'))); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ergo-pdf]'), function(b){ b.onclick=function(){ ergoPDF(_ergoPorId(b.getAttribute('data-ergo-pdf')), b); }; });
}
function _ergoPorId(id){ return (ERGOW.L||[]).filter(function(x){ return String(x.id)===String(id); })[0] || null; }

/* revisar un puesto (o ver uno guardado: se puede bajar en PDF o quitar) */
function ergoNuevo(x){
  var F=ERGOW.form={ id:x ? x.id : null, r:x ? Object.assign({}, x.r) : {}, tele:!!(x && x.tele) };
  var h='<div class="ergo-w-cab"><div class="campo"><label for="ergo-puesto">Puesto</label><input id="ergo-puesto" maxlength="120" placeholder="Por ejemplo: asistente administrativo, 2.º piso" value="'+esc(x ? x.puesto : '')+'"></div>'+
    '<div class="campo"><label for="ergo-persona">Persona (opcional)</label><input id="ergo-persona" maxlength="120" autocomplete="off" value="'+esc(x ? x.persona : '')+'"></div>'+
    '<div class="campo"><label for="ergo-fecha">Fecha</label><input type="date" id="ergo-fecha" value="'+esc(x ? x.fecha : hoyISO())+'"></div></div>'+
    '<label class="ergo-w-tele"><input type="checkbox" id="ergo-tele"'+(F.tele ? ' checked' : '')+'> Es teletrabajo (trabaja desde su casa)</label>'+
    ERGO_GRUPOS.map(function(G){
      return '<div class="ergo-w-g"><h3><span aria-hidden="true">'+G.ic+'</span> '+esc(G.n)+'</h3>'+ERGO_PREG.filter(function(p){ return p.g===G.k; }).map(function(p){
        return '<div class="ergo-w-f" data-k="'+p.k+'"><span class="ergo-w-q">'+esc(p.q)+'<small>'+esc(ergoCita(p))+(p.rec ? ' · recomendable' : '')+'</small></span><span class="seg ergo-w-seg" role="group" aria-label="'+esc(p.q)+'">'+
          ['si', 'no'].concat(p.na ? ['na'] : []).map(function(v){
            return '<button type="button" data-v="'+v+'" class="'+(F.r[p.k]===v ? 'on' : '')+'" aria-pressed="'+(F.r[p.k]===v)+'">'+({ si:'Sí', no:'No', na:'No aplica' })[v]+'</button>';
          }).join('')+'</span></div>';
      }).join('')+'</div>';
    }).join('')+
    '<div class="ergo-w-res" id="ergo-res"></div><div class="msg mal" id="ergo-msg"></div>';
  var pie='<button type="button" class="bt sec" id="ergo-no">'+(x ? 'Cerrar' : 'Cancelar')+'</button>'+
    (x ? '<button type="button" class="bt sec" id="ergo-quitar">Quitar</button><button type="button" class="bt sec" id="ergo-pdf">Bajar PDF</button>' : '')+
    '<button type="button" class="bt" id="ergo-si">'+(x ? 'Guardar los cambios' : 'Guardar en la obra')+'</button>';
  abrirHoja(x ? 'Puesto: '+x.puesto : 'Revisar un puesto', nombreObraP()||'', h, pie, { sinFoco:true, ancha:true });
  $('ergo-no').onclick=cerrarHoja;
  $('ergo-tele').onchange=function(){ F.tele=this.checked; _ergoResPintar(); };
  Array.prototype.forEach.call(document.querySelectorAll('.ergo-w-f'), function(fila){
    fila.onclick=function(ev){
      var b=ev.target.closest ? ev.target.closest('button[data-v]') : null; if(!b) return;
      var k=fila.getAttribute('data-k'); F.r[k]=b.getAttribute('data-v');
      Array.prototype.forEach.call(fila.querySelectorAll('button[data-v]'), function(z){ var on=(z===b); z.classList.toggle('on', on); z.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      _ergoResPintar();
    };
  });
  try{ if(typeof sugGente==='function') sugGente($('ergo-persona'), {}); }catch(_s){}
  if(x){ $('ergo-pdf').onclick=function(){ ergoPDF(_ergoDelForm(), this); }; $('ergo-quitar').onclick=function(){ ergoQuitar(x); }; }
  $('ergo-si').onclick=function(){ ergoGuardar(this); };
  _ergoResPintar();
  setTimeout(function(){ try{ if(!x) $('ergo-puesto').focus(); }catch(_f){} }, 30);
}
function _ergoDelForm(){
  var F=ERGOW.form||{};
  return { id:F.id, v:1, fecha:($('ergo-fecha')||{}).value || hoyISO(), puesto:String(($('ergo-puesto')||{}).value||'').replace(/\s+/g, ' ').trim(),
           persona:String(($('ergo-persona')||{}).value||'').replace(/\s+/g, ' ').trim(), tele:!!F.tele, r:Object.assign({}, F.r) };
}
function _ergoResPintar(){
  var c=$('ergo-res'), F=ERGOW.form; if(!c || !F) return;
  var R=ergoResultado(F.r), h='';
  if(!R.completo) h='<p class="tenue">Faltan '+R.falta.length+' de '+ERGO_PREG.length+' preguntas.</p>';
  else h='<p><b>'+R.enOrden+' de '+R.total+' en orden</b>'+(R.no.length ? ' · '+R.no.length+' por cambiar' : ' · nada que cambiar')+'</p>';
  if(R.no.length) h+='<h3>Qué cambiar</h3><ul>'+R.no.map(function(p){ return '<li>'+esc(p.r)+' <small>'+esc(ergoCita(p))+'</small></li>'; }).join('')+'</ul>';
  if(R.rec.length) h+='<h3>Recomendable</h3><ul>'+R.rec.map(function(p){ return '<li>'+esc(p.r)+' <small>'+esc(ergoCita(p))+'</small></li>'; }).join('')+'</ul>';
  if(F.tele) h+='<p class="ergo-w-tele-n">En teletrabajo, la autoevaluación del lugar de trabajo es opcional y de común acuerdo, con el formulario que indica el empleador, que la usa para proponer correcciones ('+esc(ERGO_TELE)+'). Esta revisión ayuda a prepararla; no reemplaza ese formulario.</p>';
  c.innerHTML=h;
}
function ergoGuardar(b){
  var o=_ergoDelForm(), m=$('ergo-msg');
  if(o.puesto.length<2){ m.textContent='Escribe el puesto.'; $('ergo-puesto').focus(); return Promise.resolve(false); }
  if(!/^\d{4}-\d{2}-\d{2}$/.test(o.fecha)){ m.textContent='La fecha no se entiende.'; return Promise.resolve(false); }
  var R=ergoResultado(o.r);
  if(!R.completo){ m.textContent='Faltan '+R.falta.length+' preguntas por contestar.'; return Promise.resolve(false); }
  m.textContent=''; if(b) b.disabled=true;
  var nota=JSON.stringify(ergoNotaLimpia(o)), nom=(o.puesto+(o.persona ? ' · '+o.persona : '')).slice(0, 160);
  var p=o.id ? sbPatch('sst_doc?id=eq.'+encodeURIComponent(o.id), { nombre:nom, nota:nota }).then(function(rows){ if(Array.isArray(rows) && !rows.length) return Promise.reject({ portal:'Esta cuenta no puede cambiarlo en esta obra.' }); })
             : sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'ergo', nombre:nom, nota:nota });
  return p.then(function(){
    if(b) b.disabled=false; cerrarHoja();
    toast(o.id ? 'Cambios guardados.' : 'Puesto guardado en la obra'+(R.no.length ? ': '+R.no.length+' por cambiar.' : ': todo en orden.'));
    if(VISTA.actual==='ergo' && typeof VISTA.recargar==='function') VISTA.recargar(true);
    return true;
  }, function(e){ if(b) b.disabled=false; m.textContent='No se pudo guardar. '+porQueFallo(e); return false; });
}
function ergoQuitar(x){
  return confirmar('¿Quitar esta revisión?', '«'+x.puesto+'», del '+_ergoF(x.fecha)+'. Deja de estar en la obra.', { si:'Sí, quitarla', mal:true }).then(function(si){
    if(!si) return false;
    return sbDelP('sst_doc?id=eq.'+encodeURIComponent(x.id)).then(function(){ cerrarHoja(); toast('Revisión quitada.'); if(typeof VISTA.recargar==='function') VISTA.recargar(true); return true; },
                                                                 function(e){ toast('No se pudo quitar. '+porQueFallo(e)); return false; });
  });
}
/* el PDF: una hoja A4 con el puesto, cada pregunta con su respuesta y su numeral, qué cambiar y las firmas */
function ergoPDF(x, b){
  if(!x) return Promise.resolve(false);
  if(b) b.disabled=true;
  return cargarEvPDF().then(function(){
    if(b) b.disabled=false;
    var J=window.jspdf && window.jspdf.jsPDF; if(!J) throw new Error('Falta el generador de PDF');
    var d=new J({ unit:'mm', format:'a4' }), W=210, M=16, y=18, R=ergoResultado(x.r);
    var lin=function(t, tam, est, col){ d.setFont('helvetica', est||'normal'); d.setFontSize(tam||10); d.setTextColor(col||30); var L=d.splitTextToSize(String(t), W-2*M); d.text(L, M, y); y+=L.length*(tam||10)*0.42+1.6; };
    var sig=function(n){ if(y+n>282){ d.addPage(); y=18; } };
    lin('Revisión ergonómica del puesto de oficina', 15, 'bold', 20);
    lin((nombreObraP()||'')+' · '+_ergoF(x.fecha), 10, 'normal', 90);
    y+=2;
    lin('Puesto: '+x.puesto+(x.persona ? '   ·   Persona: '+x.persona : '')+(x.tele ? '   ·   Teletrabajo' : ''), 10.5, 'bold', 30);
    lin(R.enOrden+' de '+R.total+' en orden'+(R.no.length ? ' · '+R.no.length+' por cambiar' : ' · nada que cambiar'), 10.5, 'normal', 30);
    y+=2;
    ERGO_GRUPOS.forEach(function(G){
      sig(12); lin(G.n, 11, 'bold', 20);
      ERGO_PREG.filter(function(p){ return p.g===G.k; }).forEach(function(p){
        var v=x.r[p.k], t=({ si:'Sí', no:'No', na:'No aplica' })[v] || '—';
        sig(10);
        d.setFont('helvetica', 'normal'); d.setFontSize(9.5); d.setTextColor(30);
        var L=d.splitTextToSize(p.q, W-2*M-48); d.text(L, M, y);
        d.setFont('helvetica', 'bold'); d.setTextColor(v==='no' ? 180 : 30); d.text(t, W-M-44, y);
        d.setFont('helvetica', 'normal'); d.setTextColor(110); d.setFontSize(8); d.text('num. '+p.c, W-M-26, y);
        y+=L.length*4+1.8;
      });
      y+=1.5;
    });
    if(R.no.length){ sig(14); lin('Qué cambiar', 11, 'bold', 20); R.no.forEach(function(p){ sig(8); lin('• '+p.r+' ('+ergoCita(p)+')', 9.5, 'normal', 30); }); }
    if(R.rec.length){ sig(10); lin('Recomendable', 11, 'bold', 20); R.rec.forEach(function(p){ sig(8); lin('• '+p.r+' ('+ergoCita(p)+')', 9.5, 'normal', 30); }); }
    if(x.tele){ sig(14); lin('En teletrabajo, la autoevaluación del lugar de trabajo es opcional y de común acuerdo, con el formulario que indica el empleador ('+ERGO_TELE+'). Esta revisión ayuda a prepararla; no reemplaza ese formulario.', 8.5, 'normal', 90); }
    sig(30); y+=4;
    lin('No es un examen médico ni la evaluación de riesgo disergonómico de la '+ERGO_NORMA+': es una revisión rápida del puesto.', 8.5, 'normal', 90);
    y+=14; d.setDrawColor(120); d.line(M, y, M+70, y); d.line(W-M-70, y, W-M, y);
    d.setFontSize(9); d.setTextColor(60); d.text('Revisó (nombre, cargo y firma)', M, y+5); d.text('Trabajador (nombre y firma)', W-M-70, y+5);
    var n=d.getNumberOfPages();
    for(var i=1;i<=n;i++){ d.setPage(i); d.setFontSize(7.5); d.setTextColor(140); d.text('OBRASST · '+ERGO_NORMA+' · página '+i+' de '+n, M, 292); }
    bajarBlob(d.output('blob'), nombreArchivo('Ergonomia - '+x.puesto+' - '+x.fecha)+'.pdf');
    return true;
  }).catch(function(e){ if(b) b.disabled=false; toast('No se pudo armar el PDF. '+(e && e.message ? e.message : porQueFallo(e))); return false; });
}
function _ergoCss(){
  if($('ergo-css')) return;
  var st=document.createElement('style'); st.id='ergo-css';
  st.textContent=[
    '.ergo-w-intro{margin:0 0 14px;max-width:86ch;line-height:1.55}',
    '.ergo-w-acc{white-space:nowrap} .ergo-w-acc .bt + .bt{margin-left:6px}',
    '.ergo-w-cab{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:0 14px}',
    '.ergo-w-tele{display:flex;gap:8px;align-items:center;font-size:14px;font-weight:400;color:var(--texto);margin:2px 0 12px}',
    '.ergo-w-tele input{width:18px;height:18px;padding:0;margin:0;flex:0 0 18px}',
    '.ergo-w-g{margin:0 0 14px}',
    '.ergo-w-g h3{margin:0 0 6px;font-size:15px}',
    '.ergo-w-f{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--raya)}',
    '.ergo-w-q{flex:1 1 300px;min-width:0;line-height:1.4}',
    '.ergo-w-q small{display:block;color:var(--gris);font-size:12px;margin-top:2px}',
    '.ergo-w-seg{flex:0 0 auto}',
    '.ergo-w-res{background:var(--fondo);border-radius:10px;padding:10px 12px;margin-top:6px}',
    '.ergo-w-res h3{margin:10px 0 4px;font-size:14px} .ergo-w-res ul{margin:0;padding-left:18px} .ergo-w-res li{margin:3px 0;line-height:1.45}',
    '.ergo-w-res small{color:var(--gris)} .ergo-w-res p{margin:0}',
    '.ergo-w-tele-n{margin-top:10px !important;font-size:13px;color:var(--gris);line-height:1.5}'
  ].join('\n');
  document.head.appendChild(st);
}
