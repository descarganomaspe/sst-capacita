/* OBRASST · el portal · LOS FRENTES DE TRABAJO (27/10/2026)
   Marcelo: «si un proyecto tiene varios frentes (una empresa con 5 estaciones del metro), cada punto requiere su propio
   plan de emergencia, mapa de riesgos y mapa de evacuación… pero que no se pasen de vivos»; los cupos, suyos: LITE 1 ·
   Prevencionista 1 · Supervisor SST 1 · SSOMA 2 · Gestión SST 4 frentes por obra.
   Arriba, FRENTES-BASE de la app tal cual (herr/copias.py la compara); abajo, la sección de la web. Se pide recién cuando
   alguien abre «Frentes de trabajo» (freIr en portal/index.html). */
/* >>> FRENTES-BASE-INI (la misma en la app y en portal/frentes.js: herr/copias.py las compara) <<< */
/* ══ LOS FRENTES DE TRABAJO (27/10/2026) ════════════════════════════════════════════════════════════════════
   Marcelo: «si un proyecto tiene varios frentes (una empresa con 5 estaciones del metro), cada punto requiere su
   propio plan de emergencia, mapa de riesgos y mapa de evacuación… pero que no se pasen de vivos». Los cupos, suyos
   (27/10/2026): LITE 1 · Prevencionista 1 · Supervisor SST 1 · SSOMA 2 · Gestión SST 4 frentes por obra.
   Un frente es un punto de la MISMA obra —una estación, un tramo, un bloque—: tiene lo suyo para una emergencia (su
   plan de respuesta, sus mapas, su punto de reunión, sus números y su responsable) y comparte con la obra el
   personal, el IPERC general, los programas y el informe del mes, que sale con un corte por frente.
   Para que no se pasen de vivos:
     · el cupo es por obra y lo cuida también el servidor (sql/2026-10-27-frentes.sql);
     · el tope de personal sigue siendo de la obra entera, no de cada frente;
     · cada documento del frente lleva el nombre del proyecto y del frente;
     · un solo informe del mes por obra, con su corte por frente;
     · la Consola avisa si los frentes de una obra quedan en departamentos distintos.
   Dónde vive: una fila de sst_doc por frente (hoja «frentes»: el nombre en «nombre» y lo demás en «nota», en JSON).
   Sus documentos van en las carpetas de siempre de la obra (plan de emergencia, mapa de riesgos…) con «Frente:
   <nombre>» en la nota y el nombre del frente adelante: así los ven la carpeta, el portal, el trabajador en sus
   documentos y el cartel QR de la obra. Lo que el trabajador necesita en una emergencia (el punto de reunión, los
   números, el responsable, los documentos y los brigadistas que hoy están ahí) viaja en «¿A quién acudo?».
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
var FRE_HOJA = 'frentes';
var FRE_CUPO = { lite:1, prevencionista:1, supervisor:1, ssoma:2, gestion:4 };
var FRE_DOCS = [
  { h:'plan-emergencia',      t:'Plan de respuesta ante emergencias', c:'Plan de respuesta', ic:'🚨', pide:1 },
  { h:'mapa-riesgos',         t:'Mapa de riesgos',                    c:'Mapa de riesgos', ic:'🗺️', pide:1 },
  { h:'mapa-evacuacion',      t:'Mapa de evacuación',                 c:'Mapa de evacuación', ic:'🧭', pide:1 },
  { h:'contactos-emergencia', t:'Contactos de emergencia',            ic:'📞' },
  { h:'brigadistas',          t:'Brigada de emergencia',              ic:'🧯' },
  { h:'estacion-emergencia',  t:'Estación de emergencia',             ic:'⛑️' }
];
var FRE_NUM_MAX = 4;
/* el primer nivel del Perú (INEI: 24 departamentos y la Provincia Constitucional del Callao) */
var FRE_DEP_PE = ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
  'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín',
  'Tacna', 'Tumbes', 'Ucayali'];
function freCupoDe(planId){ var n = FRE_CUPO[String(planId || '')]; return (typeof n === 'number') ? n : 1; }
/* el primer plan que trae más frentes que este (para decirlo en el candado) */
function freCupoSiguiente(planId){
  var orden = ['lite', 'prevencionista', 'supervisor', 'ssoma', 'gestion'], i = orden.indexOf(String(planId || 'lite')), n = freCupoDe(planId);
  for(var j = Math.max(0, i + 1); j < orden.length; j++) if(freCupoDe(orden[j]) > n) return orden[j];
  return '';
}
function freTxt(v, max){ return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 120); }
function freTel(v){ return freTxt(v, 22).replace(/[^0-9+() -]/g, '').trim(); }
function freNorm(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function freNuevoId(){
  var a = 'abcdefghijkmnpqrstuvwxyz23456789', s = 'f-';
  for(var i = 0; i < 8; i++) s += a.charAt(Math.floor(Math.random() * a.length));
  return s;
}
/* un frente, limpio: lo que se guarda y lo único que se lee */
function freLimpio(o, idSi){
  o = (o && typeof o === 'object') ? o : {};
  var nums = (Array.isArray(o.nums) ? o.nums : []).map(function(x){ return { t:freTxt(x && x.t, 28), tel:freTel(x && x.tel) }; })
    .filter(function(x){ return x.t && x.tel.replace(/[^0-9]/g, '').length >= 3; }).slice(0, FRE_NUM_MAX);
  /* los nombres que tuvo antes (hasta 5): la ficha de quien ya estaba en ese frente lo sigue encontrando */
  var n = freTxt(o.n, 60), vistos = {}; vistos[freNorm(n)] = 1;
  var antes = (Array.isArray(o.antes) ? o.antes : []).map(function(x){ return freTxt(x, 60); })
    .filter(function(x){ var k = freNorm(x); if(!k || vistos[k]) return false; vistos[k] = 1; return true; }).slice(0, 5);
  return { v:1, id:/^f-[a-z0-9]{4,16}$/.test(String(o.id || '')) ? String(o.id) : (idSi || freNuevoId()),
           n:n, antes:antes, ref:freTxt(o.ref, 140), dep:freTxt(o.dep, 40), dist:freTxt(o.dist, 60),
           resp:freTxt(o.resp, 80), cargo:freTxt(o.cargo, 60), tel:freTel(o.tel), punto:freTxt(o.punto, 140), nums:nums,
           al:/^\d{4}-\d{2}-\d{2}$/.test(String(o.al || '')) ? String(o.al) : '', por:freTxt(o.por, 80) };
}
/* lo que va en la fila de sst_doc: sin los datos de la fila (_fila, _creado) */
function freNota(f){ var o = freLimpio(f); return JSON.stringify(o); }
/* las filas de sst_doc (hoja «frentes») → los frentes, en el orden en que se crearon; cada uno con el id de su fila */
function freDeFilas(rows){
  var out = [], vistos = {};
  (Array.isArray(rows) ? rows : []).filter(function(r){ return r && r.hoja === FRE_HOJA; }).slice()
    .sort(function(a, b){ return String(a.creado || '').localeCompare(String(b.creado || '')) || String(a.id || '').localeCompare(String(b.id || '')); })
    .forEach(function(r){
      var n = null; try{ n = (typeof r.nota === 'string') ? JSON.parse(r.nota) : r.nota; }catch(_e){ n = null; }
      /* sin su id en la nota (una fila escrita a mano), uno fijo sacado de la fila: el mismo cada vez que se lee */
      var idF = String(r.id || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
      var f = freLimpio(Object.assign({}, (n && typeof n === 'object') ? n : {}, { n:(n && n.n) || r.nombre }), idF.length >= 4 ? 'f-' + idF : '');
      var k = freNorm(f.n);
      if(!k || vistos[k]) return;
      vistos[k] = 1; f._fila = r.id; f._creado = r.creado || '';
      out.push(f);
    });
  return out;
}
/* la nota de un documento del frente, y de qué frente es un documento */
function freNotaDoc(f){ return 'Frente: ' + freTxt(f && f.n, 60); }
/* ¿este nombre es el de ese frente (el de hoy o uno de antes)? */
function freEsNombre(f, nom){
  var k = freNorm(nom); if(!k || !f) return false;
  if(freNorm(f.n) === k) return true;
  return (f.antes || []).some(function(x){ return freNorm(x) === k; });
}
function freDeDoc(d, frentes){
  var m = /^Frente:\s*(.+)$/.exec(String((d && d.nota) || '').trim()); if(!m) return null;
  var hit = null;
  (frentes || []).forEach(function(f){ if(!hit && f && freNorm(f.n) === freNorm(m[1])) hit = f; });
  (frentes || []).forEach(function(f){ if(!hit && freEsNombre(f, m[1])) hit = f; });
  return hit;
}
function freDocTipo(h){ for(var i = 0; i < FRE_DOCS.length; i++) if(FRE_DOCS[i].h === h) return FRE_DOCS[i]; return null; }
/* el nombre de un documento del frente: «<frente> · <lo que es>» (así se lee en la carpeta y en el cartel de la obra) */
function freNombreDoc(f, nombre){
  var fn = freTxt(f && f.n, 60), n = freTxt(nombre, 120);
  if(fn && freNorm(n).indexOf(freNorm(fn)) === 0) return n.slice(0, 160);
  return ((fn ? fn + ' · ' : '') + n).slice(0, 160);
}
/* los documentos de un frente, por tipo: { 'plan-emergencia':[docs], … } (lo más nuevo primero) */
function freDocsDe(f, docs, frentes){
  var out = {}; FRE_DOCS.forEach(function(t){ out[t.h] = []; });
  if(!f) return out;
  (docs || []).forEach(function(d){
    if(!d || !out[d.hoja]) return;
    var g = freDeDoc(d, frentes && frentes.length ? frentes : [f]);
    if(!g || g.id !== f.id) return;
    out[d.hoja].push(d);
  });
  Object.keys(out).forEach(function(k){ out[k].sort(function(a, b){ return String(b.creado || '').localeCompare(String(a.creado || '')); }); });
  return out;
}
/* lo que le falta a un frente para una emergencia: los tres documentos que se piden siempre y su punto de reunión */
function freFalta(f, porTipo){
  var falta = [];
  FRE_DOCS.forEach(function(t){ if(t.pide && !((porTipo || {})[t.h] || []).length) falta.push(t.t); });
  if(!(f && f.punto)) falta.push('Punto de reunión');
  return falta;
}
/* ¿en qué frente está hoy este trabajador? 29/10/2026 · por el «Frente de trabajo» de su ficha (la ubicación: la de su
   historia, ese día); si no tiene, por su área, como hasta el 28/10 */
function freDeTrab(t, frentes, iso){
  if(!t) return null;
  var u = '', a = '';
  try{ if(typeof sitEn === 'function' && Array.isArray(t.hist)){ var st = sitEn(t, iso || hoyISO()); u = st.u || ''; a = st.a || ''; } }catch(_s){ u = ''; a = ''; }
  if(!u) u = t.ubicacion || '';
  if(!a) a = t.area || t.frente || '';
  return freDeNombre(u, frentes) || freDeNombre(a, frentes);
}
/* el frente que lleva ese nombre (el de hoy o uno de antes) */
function freDeNombre(nom, frentes){
  var k = freNorm(nom); if(!k) return null;
  var hit = null; (frentes || []).forEach(function(f){ if(!hit && f && freNorm(f.n) === k) hit = f; });
  (frentes || []).forEach(function(f){ if(!hit && freEsNombre(f, nom)) hit = f; });
  return hit;
}
/* lo que viaja en «¿A quién acudo?» (la hoja «quienes» que publica el supervisor): cada frente con su punto de
   reunión, sus números, su responsable, sus documentos y los brigadistas que hoy están en él. Sin DNI, como todo lo
   de esa hoja. brig: los de brigadaDeLaObra() (con su trab y su documento, para saber en qué frente están) */
function frePaquete(frentes, docs, brig, trabs){
  return (frentes || []).filter(function(f){ return f && f.n; }).map(function(f){
    var T = freDocsDe(f, docs, frentes), d = [];
    FRE_DOCS.forEach(function(t){
      (T[t.h] || []).slice(0, 3).forEach(function(x){
        if(x && /^https:\/\//.test(String(x.url || ''))) d.push({ h:t.h, t:t.t, n:String(x.nombre || t.t).slice(0, 160), u:String(x.url).slice(0, 600) });
      });
    });
    var b = (brig || []).filter(function(p){
      var t = null;
      (trabs || []).forEach(function(x){ if(!t && x && ((p.trab && x.id === p.trab) || (p.d && x.dni && String(x.dni) === String(p.d)))) t = x; });
      var g = t ? freDeTrab(t, frentes) : null;
      return !!(g && g.id === f.id);
    }).map(function(p){ var o = { n:p.n, c:p.c || '', tel:p.tel || '', roles:p.roles || [] }; if(p.f) o.f = p.f; return o; });
    return { id:f.id, n:f.n, ref:f.ref, dep:f.dep, dist:f.dist, punto:f.punto,
             resp:f.resp ? { n:f.resp, cargo:f.cargo, tel:f.tel } : null, nums:f.nums, docs:d, brig:b };
  });
}
/* ── la ficha del frente, en una hoja A4 para la caseta del frente: el proyecto y el frente arriba, dónde está, su
   responsable, su punto de reunión, a quién llamar (lo del frente y lo de la obra), sus brigadistas y sus documentos
   con su fecha. ctx: { razon, proyecto, codigo, emergs:[{t,tel}], brig:[{n,c,tel}], gente (cuántos hoy), docs:{tipo:[d]},
   pie } ── */
function freFichaPdf(J, f, ctx){
  ctx = ctx || {};
  var doc = new J({ unit:'mm', format:'a4' }), W = 210, M = 16, y = 18, ancho = W - 2 * M;
  var T = function(s){ return String(s == null ? '' : s).replace(/[^\u0000-ÿ–—’“”•€]/g, '').replace(/\s+/g, ' ').trim(); };
  var linea = function(txt, op){
    op = op || {};
    doc.setFont('helvetica', op.b ? 'bold' : 'normal'); doc.setFontSize(op.s || 10.5);
    doc.setTextColor.apply(doc, op.c || [20, 25, 31]);
    var L = doc.splitTextToSize(T(txt), op.w || ancho);
    L.forEach(function(l){ if(y > 280){ doc.addPage(); y = 18; } doc.text(l, (op.x || M), y); y += (op.lh || 5.2); });
  };
  var titulo = function(txt){
    if(y > 262){ doc.addPage(); y = 18; }
    y += 3; doc.setDrawColor(11, 42, 58); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 5.5;
    linea(String(txt).toUpperCase(), { b:1, s:9.5, c:[11, 42, 58] }); y += 0.5;
  };
  /* la cabecera: la empresa, el proyecto y el frente (una regla para que no se pasen de vivos) */
  doc.setFillColor(11, 42, 58); doc.rect(0, 0, W, 9, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(255, 255, 255);
  doc.text(T('FICHA DE EMERGENCIA DEL FRENTE'), M, 6);
  doc.text(T(ctx.codigo ? 'Obra ' + ctx.codigo : ''), W - M, 6, { align:'right' });
  y = 18;
  if(ctx.razon) linea(ctx.razon, { s:9.5, c:[89, 100, 111] });
  linea('Proyecto: ' + (ctx.proyecto || '—'), { b:1, s:12 });
  linea('Frente: ' + f.n, { b:1, s:19, lh:8.5 });
  var donde = [f.ref, f.dist, f.dep].filter(Boolean).join(' · ');
  if(donde) linea(donde, { s:10.5, c:[89, 100, 111] });
  titulo('Punto de reunión');
  linea(f.punto || 'Falta definirlo.', { b:!!f.punto, s:12, c:f.punto ? [20, 25, 31] : [180, 35, 26] });
  titulo('A quién llamar');
  var nums = (f.nums || []).map(function(x){ return [x.t + ' (del frente)', x.tel]; })
    .concat((ctx.emergs || []).map(function(x){ return [x.t, x.tel]; }));
  if(f.resp) nums.unshift(['Responsable del frente: ' + f.resp + (f.cargo ? ' · ' + f.cargo : ''), f.tel || '—']);
  if(!nums.length) linea('Todavía no hay números cargados.', { c:[180, 35, 26] });
  nums.slice(0, 14).forEach(function(n){
    if(y > 280){ doc.addPage(); y = 18; }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(20, 25, 31);
    var izq = doc.splitTextToSize(T(n[0]), ancho - 48);
    doc.text(izq, M, y); doc.setFont('helvetica', 'bold'); doc.text(T(n[1]), W - M, y, { align:'right' });
    y += 5.2 * izq.length + 0.8;
  });
  titulo('Brigadistas en este frente');
  var br = ctx.brig || [];
  if(!br.length) linea('Ninguno marcado hoy en este frente. La brigada de la obra está en «¿A quién acudo?».', { c:[89, 100, 111] });
  br.slice(0, 16).forEach(function(b){ linea('• ' + b.n + (b.c ? ' · ' + b.c : '') + (b.tel ? '  ·  ' + b.tel : ''), {}); });
  if(typeof ctx.gente === 'number') { y += 1; linea('Personal en este frente hoy: ' + ctx.gente + (ctx.gente === 1 ? ' persona' : ' personas') + '.', { s:9.5, c:[89, 100, 111] }); }
  titulo('Documentos del frente');
  FRE_DOCS.forEach(function(t){
    var L = (ctx.docs && ctx.docs[t.h]) || [];
    var fe = L[0] && L[0].creado ? String(L[0].creado).slice(0, 10) : '';
    var f2 = fe ? fe.slice(8, 10) + '/' + fe.slice(5, 7) + '/' + fe.slice(0, 4) : '';
    if(y > 280){ doc.addPage(); y = 18; }
    doc.setFont('helvetica', L.length ? 'normal' : 'bold'); doc.setFontSize(10.5);
    doc.setTextColor.apply(doc, L.length ? [20, 25, 31] : (t.pide ? [180, 35, 26] : [120, 130, 140]));
    doc.text(T((L.length ? '[x] ' : '[ ] ') + t.t), M, y);
    doc.setFont('helvetica', 'normal');
    doc.text(T(L.length ? (L.length > 1 ? L.length + ' documentos · el último del ' + f2 : 'Subido el ' + f2) : (t.pide ? 'Falta' : 'No subido')), W - M, y, { align:'right' });
    y += 6;
  });
  y += 2;
  linea('Los documentos se abren en la app, en «¿A quién acudo?» (Tu frente) y en «Documentos de SST», y en los carteles QR de la obra.', { s:8.5, c:[89, 100, 111], lh:4.2 });
  var pie = T(ctx.pie || ('Proyecto ' + (ctx.proyecto || '') + ' · Frente ' + f.n + ' · ' + (f.al ? 'actualizado el ' + f.al.slice(8, 10) + '/' + f.al.slice(5, 7) + '/' + f.al.slice(0, 4) : '')));
  var n = doc.getNumberOfPages();
  for(var i = 1; i <= n; i++){
    doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(120, 130, 140);
    doc.text(pie, M, 290); doc.text(i + ' / ' + n, W - M, 290, { align:'right' });
  }
  return doc;
}
/* <<< FRENTES-BASE-FIN >>> */

/* ══ LA SECCIÓN «FRENTES DE TRABAJO» DE LA WEB (27/10/2026) ═════════════════════════════════════════════════════
   La misma de la app (FRENTES-APP), pensada para la computadora: todos los frentes a la vista, cada uno con lo suyo
   para una emergencia, sus documentos (se suben aquí o en la app: son las carpetas de la obra), quiénes están hoy en
   él, sus brigadistas y su ficha en PDF para la caseta. Lo que ve la gente sale en «¿A quién acudo?» al publicarlo. */
var FREW = { obra:null, lista:null, docs:null, gente:null, brig:null, t:0, caja:null, n:0, sube:'', msg:'', msgCl:'' };
var FRE_HOJAS_IN = FRE_DOCS.map(function(t){ return t.h; }).join(',');
function _freCssW(){
  if(document.getElementById('fre-css')) return;
  var st=document.createElement('style'); st.id='fre-css';
  st.textContent=[
    '.frew-cupo{display:inline-flex; align-items:center; gap:8px; font-size:13px; color:var(--gris)}',
    '.frew-cupo b{font-variant-numeric:tabular-nums; color:var(--tinta); border:1px solid var(--raya2); border-radius:999px; padding:3px 10px; font-size:14px}',
    '.frew-g{display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.35fr) minmax(0,.9fr); gap:18px}',
    '@media (max-width:980px){ .frew-g{grid-template-columns:minmax(0,1fr)} }',
    '.frew-g h3{font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--gris); margin:0 0 8px}',
    '.frew-d{display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--raya)}',
    '.frew-d:last-child{border-bottom:0}',
    '.frew-d .ic{font-size:18px; line-height:1.2; flex:none}',
    '.frew-d .tx{flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; font-size:13.5px}',
    '.frew-d .tx small{color:var(--gris); font-size:12px}',
    '.frew-falta{color:var(--mal); font-weight:600}',
    '.frew-doc{border:1px solid var(--raya); border-radius:10px; padding:9px 10px; margin:0 0 8px; background:var(--panel)}',
    '.frew-doc-c{display:flex; align-items:center; gap:10px}',
    '.frew-doc-c .tx{flex:1; min-width:0; display:flex; flex-direction:column}',
    '.frew-doc-c .tx b{font-size:13.5px}',
    '.frew-doc-c .tx small{color:var(--gris); font-size:12px}',
    '.frew-doc-f{display:flex; align-items:center; gap:8px; margin-top:7px; padding-top:7px; border-top:1px dashed var(--raya); font-size:13px}',
    '.frew-doc-f a{flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}',
    '.frew-doc-f small{color:var(--gris); white-space:nowrap}',
    '.frew-subir{position:relative; overflow:hidden}',
    '.frew-subir input{position:absolute; inset:0; opacity:0; cursor:pointer}',
    '.frew-chips{display:flex; flex-wrap:wrap; gap:6px; margin:2px 0 0}',
    '.frew-chip{font-size:12px; font-weight:600; border:1px solid currentColor; border-radius:999px; padding:2px 9px}',
    '.frew-chip.ok{color:var(--ok)}.frew-chip.mal{color:var(--mal)}',
    '.frew-nums{display:grid; grid-template-columns:minmax(0,1fr) minmax(0,.8fr) auto; gap:8px; align-items:end}',
    '.frew-nums .campo{margin:0}'
  ].join('\n');
  document.head.appendChild(st);
}
/* los frentes, sus documentos y el personal (con su frente), de la nube */
function freTraerW(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && FREW.obra===oid && FREW.lista && Date.now()-FREW.t<20000) return Promise.resolve(FREW);
  var nada=function(){ return null; };
  return Promise.all([
    traer('sst_doc', '&hoja=eq.'+FRE_HOJA+'&select=id,hoja,nombre,nota,creado&order=creado.asc', 40),
    traer('sst_doc', '&hoja=in.('+FRE_HOJAS_IN+')&select=id,hoja,nombre,url,nota,creado&order=creado.desc', 600),
    /* 29/10/2026 · con su frente de trabajo (ubicacion, con su historia); si la base no lo tiene, como antes */
    traerTodo('sst_trabajador', '&select=id,ext,nombre,dni,puesto,area,estatus,ubicacion,historial&order=nombre.asc', 6000)
      .catch(function(){ return traerTodo('sst_trabajador', '&select=id,ext,nombre,dni,puesto,area,estatus&order=nombre.asc', 6000); }).catch(nada)
  ]).then(function(r){
    if((YO.obra||{}).id!==oid) return FREW;
    FREW.obra=oid; FREW.t=Date.now();
    FREW.lista=freDeFilas(r[0]||[]);
    FREW.docs=(r[1]||[]).filter(function(d){ return d && /^Frente:/.test(String(d.nota||'')); });
    FREW.gente=Array.isArray(r[2]) ? r[2] : null;
    return FREW;
  });
}
/* los brigadistas de cada frente: los de las credenciales de la obra (lo mismo que «¿A quién acudo?») */
function _freBrigW(){
  if(typeof cargarMasApp!=='function') return Promise.resolve([]);
  return cargarMasApp().then(function(){ return (typeof _quiTraer==='function') ? _quiTraer(false) : null; }).then(function(R){
    if(!R || typeof MAS_APP!=='object') return [];
    var M=MAS_APP.usar(Object.assign({}, R.C, { com:R.com, creds:R.creds,
      trabs:(R.gente||[]).map(function(t){ return { id:String(t.ext||''), nombre:String(t.nombre||''), dni:String(t.dni||''), puesto:String(t.puesto||''), fotoUrl:String(t.foto_url||'') }; }) }));
    return (M.brigadaDeLaObra() || []).filter(function(p){ return p && p.vig; });
  }).catch(function(){ return []; });
}
function _freTrabsW(){ var hoy=hoyISO(); return (FREW.gente||[]).map(function(t){ return { id:String(t.ext||''), dni:String(t.dni||''), nombre:t.nombre, area:String(t.area||''), estatus:t.estatus||'activo',
  /* 29/10/2026 · su frente de trabajo de hoy (la ubicación de su ficha, con su historia) */
  ubicacion:(typeof ubicEnP==='function') ? ubicEnP(t, hoy) : String(t.ubicacion||'') }; }); }
function _freGenteW(f){
  if(!FREW.gente) return null;
  return _freTrabsW().filter(function(t){ if((t.estatus||'activo')!=='activo') return false; var g=freDeTrab(t, FREW.lista); return !!(g && g.id===f.id); });
}
function _freCupoW(){ var o=YO.obra||{}; return freCupoDe((typeof planWebActual==='function' ? planWebActual().id : '') || o.plan || 'lite'); }
function vistaFrentes(caja){
  _freCssW();
  FREW.caja=caja; FREW.msg='';
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  function _freVistaPinta(fresco){
    var n=++FREW.n;
    freTraerW(fresco).then(function(){
      if(n!==FREW.n || VISTA.actual!=='frentes') return;
      _frePintarW();
      _freBrigW().then(function(b){ if(n!==FREW.n || VISTA.actual!=='frentes') return; FREW.brig=b; _frePintarW(); });
    }, function(cod){ if(n===FREW.n && VISTA.actual==='frentes') fallo(caja, cod); });
  }
  VISTA.recargar=function(){ _freVistaPinta(true); };
  _freVistaPinta(false);
}
function _frePintarW(){
  var caja=FREW.caja; if(!caja || !document.body.contains(caja)) return;
  var L=FREW.lista||[], cupo=_freCupoW(), lleno=L.length>=cupo, A=(typeof planWebActual==='function') ? planWebActual() : { n:'' };
  var ac=$('acciones');
  if(ac) ac.innerHTML='<span class="frew-cupo"><b>'+L.length+' / '+cupo+'</b>frentes de tu plan'+(A.n ? ' '+esc(A.n) : '')+'</span>'+
    '<button type="button" class="bt" id="frew-nuevo"'+(lleno ? ' disabled' : '')+'>＋ Agregar un frente</button>';
  var h='';
  if(cupo<=1 && !L.length){
    h+='<div class="tarj"><div class="tarj-cuerpo"><p style="margin:0"><b>Con tu plan, la obra es un solo frente.</b> Con el plan SSOMA puedes tener 2 frentes por obra, y con Gestión SST, 4: cada uno con su plan de respuesta, sus mapas, su punto de reunión y su ficha para la caseta.</p></div></div>';
  }else if(lleno){
    h+='<p class="ayuda" style="margin:0 0 12px">'+(L.length>cupo ? '<b>Tienes más frentes que los de tu plan.</b> Siguen a la vista, pero no se puede agregar otro hasta quitar los que sobran o cambiar de plan.' :
      (cupo<freCupoDe('gestion') ? 'Ya usas los frentes de tu plan. Con Gestión SST son 4 por obra.' : 'Ya usas los frentes de tu plan. Si tu proyecto necesita más, escríbenos.'))+'</p>';
  }
  if(!L.length && cupo>1){
    h+='<div class="vacio"><b>Esta obra todavía no tiene frentes</b>Si tu proyecto tiene varios puntos —estaciones, tramos, bloques—, agrega cada uno con «＋ Agregar un frente»: '+
      'tendrá su plan de respuesta, sus mapas, su punto de reunión, sus números y su responsable. El personal, el IPERC y el informe del mes siguen siendo de la obra.</div>';
  }
  L.forEach(function(f){ h+=_freTarjW(f); });
  if(L.length){
    h+='<div class="tarj"><div class="tarj-cab"><div><h2>Lo que ve tu gente</h2><p class="sub">En «¿A quién acudo?» de su app, cada uno elige su frente y ve su punto de reunión, sus números, su responsable, sus documentos y los brigadistas que hoy están ahí. Les llega cuando lo publicas.</p></div>'+
      '<div class="acciones"><button type="button" class="bt sec" id="frew-quien">Ir a «¿A quién acudo?»</button></div></div></div>';
  }
  h+='<div class="msg '+esc(FREW.msgCl)+'" id="frew-msg" role="status">'+esc(FREW.msg)+'</div>';
  caja.innerHTML=h;
  var b=$('frew-nuevo'); if(b) b.onclick=function(){ freFormW(null); };
  var q=$('frew-quien'); if(q) q.onclick=function(){ navegar('quien'); };
  Array.prototype.forEach.call(caja.querySelectorAll('[data-fre-ed]'), function(x){ x.onclick=function(){ freFormW(x.getAttribute('data-fre-ed')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-fre-q]'), function(x){ x.onclick=function(){ freQuitarW(x.getAttribute('data-fre-q')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-fre-pdf]'), function(x){ x.onclick=function(){ freFichaW(x.getAttribute('data-fre-pdf')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-fre-dq]'), function(x){ x.onclick=function(){ freQuitarDocW(x.getAttribute('data-fre-dq')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('input[data-fre-sube]'), function(x){ x.onchange=function(){ var p=x.getAttribute('data-fre-sube').split('|'); freSubirW(x, p[0], p[1]); }; });
}
function _freTarjW(f){
  var L=FREW.lista||[], T=freDocsDe(f, FREW.docs||[], L), falta=freFalta(f, T), gente=_freGenteW(f);
  var paq=FREW.brig ? (frePaquete(L, FREW.docs||[], FREW.brig, _freTrabsW()).filter(function(p){ return p.id===f.id; })[0] || { brig:[] }) : null;
  var donde=[f.ref, f.dist, f.dep].filter(Boolean).join(' · ');
  var h='<div class="tarj frew" data-fre="'+esc(f.id)+'"><div class="tarj-cab"><div><h2>🚧 '+esc(f.n)+'</h2><p class="sub">'+(donde ? esc(donde) : 'Sin dirección todavía')+'</p>'+
    '<div class="frew-chips">'+FRE_DOCS.filter(function(t){ return t.pide; }).map(function(t){ var ok=(T[t.h]||[]).length>0; return '<span class="frew-chip '+(ok ? 'ok' : 'mal')+'">'+(ok ? '✓ ' : '✗ ')+esc(t.c||t.t)+'</span>'; }).join('')+
    '<span class="frew-chip '+(f.punto ? 'ok' : 'mal')+'">'+(f.punto ? '✓ ' : '✗ ')+'Punto de reunión</span></div></div>'+
    '<div class="acciones"><button type="button" class="bt sec chico" data-fre-pdf="'+esc(f.id)+'">📄 Ficha en PDF</button>'+
    '<button type="button" class="bt sec chico" data-fre-ed="'+esc(f.id)+'">Editar</button>'+
    '<button type="button" class="bt sec chico" data-fre-q="'+esc(f.id)+'" style="color:var(--mal)">Quitar</button></div></div>'+
    '<div class="tarj-cuerpo"><div class="frew-g">';
  /* para una emergencia */
  h+='<div><h3>Para una emergencia</h3>'+
    '<div class="frew-d"><span class="ic">📍</span><span class="tx"><small>Punto de reunión</small>'+(f.punto ? '<b>'+esc(f.punto)+'</b>' : '<b class="frew-falta">Falta definirlo</b>')+'</span></div>'+
    '<div class="frew-d"><span class="ic">👷</span><span class="tx"><small>Responsable del frente</small>'+(f.resp ? '<b>'+esc(f.resp)+'</b>'+(f.cargo || f.tel ? '<small>'+esc([f.cargo, f.tel].filter(Boolean).join(' · '))+'</small>' : '') : '<b class="frew-falta">Sin responsable</b>')+'</span></div>'+
    ((f.nums||[]).length ? (f.nums||[]).map(function(x){ return '<div class="frew-d"><span class="ic">☎️</span><span class="tx"><small>'+esc(x.t)+'</small><b>'+esc(x.tel)+'</b></span></div>'; }).join('')
      : '<p class="ayuda">Sin números propios: tu gente ve los de la obra.</p>')+
    (falta.length ? '<p class="ayuda" style="color:var(--mal)">Le falta: '+esc(falta.join(', '))+'.</p>' : '')+'</div>';
  /* sus documentos */
  h+='<div><h3>Documentos del frente</h3>';
  FRE_DOCS.forEach(function(t){
    var D=T[t.h]||[], sube=(FREW.sube===f.id+'|'+t.h);
    h+='<div class="frew-doc"><div class="frew-doc-c"><span aria-hidden="true">'+t.ic+'</span><span class="tx"><b>'+esc(t.t)+'</b><small>'+
      (D.length ? D.length+(D.length===1 ? ' documento' : ' documentos') : (t.pide ? '<span class="frew-falta">Falta</span>' : 'Todavía nada'))+'</small></span>'+
      '<span class="bt sec chico frew-subir"'+(sube ? ' aria-busy="true"' : '')+'>'+(sube ? 'Subiendo…' : '⬆ Subir')+
      (sube ? '' : '<input type="file" accept="application/pdf,image/*" aria-label="'+esc('Subir '+t.t+' de '+f.n)+'" data-fre-sube="'+esc(f.id)+'|'+esc(t.h)+'">')+'</span></div>';
    D.forEach(function(d){
      h+='<div class="frew-doc-f"><a href="'+esc(d.url||'#')+'" target="_blank" rel="noopener">'+esc(d.nombre||t.t)+'</a><small>'+esc(fechaLarga(String(d.creado||'').slice(0, 10))||'')+'</small>'+
        '<button type="button" class="bt sec chico" data-fre-dq="'+esc(String(d.id))+'" aria-label="'+esc('Quitar '+(d.nombre||t.t))+'">Quitar</button></div>';
    });
    h+='</div>';
  });
  h+='</div>';
  /* hoy en el frente */
  h+='<div><h3>Hoy en este frente</h3>'+
    '<div class="frew-d"><span class="ic">👷</span><span class="tx"><b>'+(gente ? gente.length+(gente.length===1 ? ' persona' : ' personas') : '—')+'</b><small>Por el «Frente de trabajo» de su ficha (en «Personal», o «Pasa a otro frente de trabajo» en la app).</small></span></div>'+
    (paq ? (paq.brig.length ? '<div class="frew-d"><span class="ic">🧯</span><span class="tx"><small>Brigadistas en este frente</small>'+paq.brig.map(function(b){ return '<b>'+esc(b.n)+'</b>'; }).join('')+'</span></div>'
                            : '<p class="ayuda">Ningún brigadista está hoy en este frente.</p>') : '<p class="ayuda">Viendo los brigadistas…</p>')+'</div>';
  h+='</div></div></div>';
  return h;
}
function _freMsgW(t, cl){ FREW.msg=t||''; FREW.msgCl=cl||''; var m=$('frew-msg'); if(m){ m.textContent=FREW.msg; m.className='msg '+FREW.msgCl; } }
function _freDepsW(){
  var pais=(typeof paisObraP==='function') ? paisObraP() : 'pe';
  if(pais==='pe') return FRE_DEP_PE;
  try{ if(typeof UBI_PRIMER==='object' && UBI_PRIMER[pais]) return UBI_PRIMER[pais]; }catch(e){}
  return [];
}
/* el formulario: un frente nuevo o editar uno */
function freFormW(id){
  var L=FREW.lista||[], f0=null; L.forEach(function(x){ if(x.id===id) f0=x; });
  if(!f0 && L.length>=_freCupoW()){ toast('Ya usas los frentes de tu plan'); return; }
  var f=f0 ? JSON.parse(JSON.stringify(f0)) : freLimpio({}), deps=_freDepsW(), nums=(f.nums||[]).slice();
  while(nums.length<2) nums.push({ t:'', tel:'' });
  var cuerpo='<p class="ayuda" style="margin:0 0 14px">Un punto de esta obra con su propia emergencia: una estación, un tramo, un bloque. El nombre es el que sale en sus documentos, en el cartel y en la ficha de cada trabajador.</p>'+
    '<div class="campo"><label for="frew-n">Nombre del frente</label><input id="frew-n" maxlength="60" autocomplete="off" placeholder="Estación 2 · Av. Grau" value="'+esc(f.n)+'"></div>'+
    '<div class="campo-dos"><div class="campo"><label for="frew-dep">'+(deps===FRE_DEP_PE ? 'Departamento' : 'Región')+'</label>'+
    (deps.length ? '<select id="frew-dep"><option value="">—</option>'+deps.map(function(d){ return '<option'+(d===f.dep ? ' selected' : '')+'>'+esc(d)+'</option>'; }).join('')+
      (f.dep && deps.indexOf(f.dep)<0 ? '<option selected>'+esc(f.dep)+'</option>' : '')+'</select>' : '<input id="frew-dep" maxlength="40" value="'+esc(f.dep)+'">')+'</div>'+
    '<div class="campo"><label for="frew-dist">Distrito o ciudad</label><input id="frew-dist" maxlength="60" autocomplete="off" placeholder="San Juan de Lurigancho" value="'+esc(f.dist)+'"></div></div>'+
    '<div class="campo"><label for="frew-ref">Dirección o referencia</label><input id="frew-ref" maxlength="140" autocomplete="off" placeholder="Av. Próceres cuadra 12, frente al paradero" value="'+esc(f.ref)+'"></div>'+
    '<div class="campo"><label for="frew-punto">Punto de reunión</label><input id="frew-punto" maxlength="140" autocomplete="off" placeholder="Explanada frente a la caseta del frente" value="'+esc(f.punto)+'"></div>'+
    '<div class="campo-dos"><div class="campo"><label for="frew-resp">Responsable del frente</label><input id="frew-resp" maxlength="80" autocomplete="off" value="'+esc(f.resp)+'"></div>'+
    '<div class="campo"><label for="frew-cargo">Cargo</label><input id="frew-cargo" maxlength="60" autocomplete="off" placeholder="Jefe de frente" value="'+esc(f.cargo)+'"></div></div>'+
    '<div class="campo"><label for="frew-tel">Su teléfono de trabajo (opcional)</label><input id="frew-tel" type="tel" maxlength="22" autocomplete="off" value="'+esc(f.tel)+'"></div>'+
    '<p class="peq-lbl" style="margin:6px 0 6px">Números propios del frente (hasta '+FRE_NUM_MAX+')</p><p class="ayuda" style="margin:0 0 8px">Los que cambian por estar en ese punto: la clínica o la comisaría más cercana, la central del cliente. Los de la obra ya salen en «¿A quién acudo?».</p>'+
    '<div id="frew-nums">'+nums.slice(0, FRE_NUM_MAX).map(function(x, i){ return _freNumW(x, i); }).join('')+'</div>'+
    (nums.length<FRE_NUM_MAX ? '<button type="button" class="bt sec chico" id="frew-num-mas" style="margin-top:8px">＋ Otro número</button>' : '')+
    '<div class="msg" id="frew-f-msg" role="status" style="margin-top:12px"></div>';
  abrirHoja(f0 ? 'Editar el frente' : 'Un frente nuevo', f0 ? f0.n : 'Con lo suyo para una emergencia', cuerpo,
    '<button type="button" class="bt sec" id="frew-no">Cancelar</button><button type="button" class="bt" id="frew-ok">'+(f0 ? 'Guardar' : 'Agregar el frente')+'</button>');
  $('frew-no').onclick=cerrarHoja;
  var mas=$('frew-num-mas');
  if(mas) mas.onclick=function(){ var c=$('frew-nums'), n=c.querySelectorAll('.frew-nums').length; if(n<FRE_NUM_MAX) c.insertAdjacentHTML('beforeend', _freNumW({ t:'', tel:'' }, n)); if(n+1>=FRE_NUM_MAX) mas.remove(); };
  $('frew-ok').onclick=function(){ _freGuardarW(f, f0); };
  setTimeout(function(){ try{ $('frew-n').focus(); }catch(e){} }, 40);
}
function _freNumW(x, i){
  return '<div class="frew-nums"><div class="campo"><label for="frew-nt-'+i+'">¿De quién es?</label><input id="frew-nt-'+i+'" maxlength="28" autocomplete="off" placeholder="Clínica más cercana" value="'+esc(x.t)+'"></div>'+
    '<div class="campo"><label for="frew-nn-'+i+'">Número</label><input id="frew-nn-'+i+'" type="tel" maxlength="22" autocomplete="off" value="'+esc(x.tel)+'"></div><span></span></div>';
}
/* escribir la fila leyendo el porqué si el servidor dice que no (el cupo lo cuida también él) */
function _freEscribirW(met, ruta, obj){
  return sbFetch(SB.url+'/rest/v1/'+ruta, { method:met, body:JSON.stringify(obj), extra:{ 'Prefer':'return=representation' } }).then(function(r){
    if(r.ok) return r.json().catch(function(){ return []; });
    return r.json().catch(function(){ return {}; }).then(function(j){ return Promise.reject({ status:r.status, detalle:String((j && (j.message || j.hint || j.code)) || '') }); });
  });
}
function _freMotivoW(err){
  var s=String((err && typeof err==='object') ? (err.detalle||'') : (err||''));
  if(/cupo_frentes/i.test(s)) return 'Tu plan ya no tiene cupo para otro frente.';
  if(/nombre_repetido/i.test(s)) return 'Ya hay un frente con ese nombre en esta obra.';
  var st=(err && typeof err==='object') ? err.status : err;
  if(st===401 || st===403) return 'Esta cuenta no puede cambiar los frentes de esta obra.';
  return 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.';
}
function _freGuardarW(f, f0){
  var v=function(id){ var x=$(id); return x ? x.value : ''; }, m=$('frew-f-msg'), b=$('frew-ok');
  var nums=[]; for(var i=0;i<FRE_NUM_MAX;i++) if($('frew-nt-'+i)) nums.push({ t:v('frew-nt-'+i), tel:v('frew-nn-'+i) });
  var x=freLimpio(Object.assign({}, f, { n:v('frew-n'), dep:v('frew-dep'), dist:v('frew-dist'), ref:v('frew-ref'), punto:v('frew-punto'),
    resp:v('frew-resp'), cargo:v('frew-cargo'), tel:v('frew-tel'), nums:nums, al:hoyISO(), por:String((TOK && TOK.correo) || '').slice(0, 80) }));
  var L=FREW.lista||[];
  /* si cambia de nombre, el de antes queda como alias: la ficha de quien ya estaba ahí lo sigue encontrando */
  if(f0 && freNorm(f0.n)!==freNorm(x.n)) x=freLimpio(Object.assign({}, x, { antes:[f0.n].concat(f0.antes||[]) }));
  var mal=function(t){ m.className='msg mal'; m.textContent=t; };
  if(!x.n) return mal('Ponle un nombre al frente.');
  if(L.some(function(y){ return y.id!==x.id && freNorm(y.n)===freNorm(x.n); })) return mal('Ya hay un frente con ese nombre en esta obra.');
  if(!f0 && L.length>=_freCupoW()) return mal('Tu plan ya no tiene cupo para otro frente.');
  b.disabled=true; m.className='msg'; m.textContent='Guardando…';
  var paso=f0 ? _freEscribirW('PATCH', 'sst_doc?id=eq.'+_enc(f0._fila), { nombre:x.n, nota:freNota(x) })
              : _freEscribirW('POST', 'sst_doc', { empresa:YO.obra.id, hoja:FRE_HOJA, nombre:x.n, url:null, nota:freNota(x) });
  paso.then(function(rows){
    if(f0 && Array.isArray(rows) && !rows.length) return Promise.reject({ status:403 });
    /* si cambió de nombre, sus documentos lo siguen (la nota y el nombre adelante) */
    if(!f0 || freNorm(f0.n)===freNorm(x.n)) return null;
    var T=freDocsDe(f0, FREW.docs||[], L), todos=[];
    Object.keys(T).forEach(function(k){ todos=todos.concat(T[k]); });
    return todos.reduce(function(cad, d){
      var nom=String(d.nombre||''), pre=f0.n+' · ';
      var nn=(nom.indexOf(pre)===0) ? freNombreDoc(x, nom.slice(pre.length)) : freNombreDoc(x, nom);
      return cad.then(function(){ return sbPatch('sst_doc?id=eq.'+_enc(d.id), { nota:freNotaDoc(x), nombre:nn }).catch(function(){ return null; }); });
    }, Promise.resolve());
  }).then(function(){
    cerrarHoja(); toast(f0 ? 'Frente guardado' : 'Frente agregado: súbele su plan de respuesta y sus mapas');
    return freTraerW(true).then(_frePintarW);
  }, function(e){ b.disabled=false; mal(_freMotivoW(e)); });
}
function _frePorId(id){ var f=null; (FREW.lista||[]).forEach(function(x){ if(x.id===id) f=x; }); return f; }
function freQuitarW(id){
  var f=_frePorId(id); if(!f) return;
  dialogo({ titulo:'¿Quitar el frente «'+f.n+'»?', texto:'Sus documentos se quedan en las carpetas de la obra, con el nombre del frente. Tu gente deja de verlo cuando vuelvas a publicar «¿A quién acudo?».', si:'Sí, quitarlo', no:'Cancelar', mal:true })
    .then(function(ok){
      if(ok!==true) return;
      sbDelP('sst_doc?id=eq.'+_enc(f._fila)).then(function(rows){
        if(Array.isArray(rows) && !rows.length) return Promise.reject(403);
        toast('Frente quitado'); return freTraerW(true).then(_frePintarW);
      }).catch(function(e){ _freMsgW(_freMotivoW(e), 'mal'); });
    });
}
function freSubirW(inp, id, h){
  var file=inp && inp.files && inp.files[0], f=_frePorId(id), T=freDocTipo(h);
  if(!file || !f || !T) return;
  try{ inp.value=''; }catch(e){}
  var base=String(file.name||T.t).replace(/\.[a-z0-9]{2,5}$/i, '').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100) || T.t;
  FREW.sube=id+'|'+h; _frePintarW();
  subirArchivoP('docs', file).then(function(url){
    return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:h, nombre:freNombreDoc(f, base), url:url, nota:freNotaDoc(f) });
  }).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject('sin_fila');
    FREW.sube=''; toast('Subido: ya está en la carpeta de la obra');
    return freTraerW(true).then(_frePintarW);
  }).catch(function(e){
    FREW.sube=''; _frePintarW();
    _freMsgW(e==='muy-grande' ? 'Pesa más de 25 MB o es un video: no sube.' : (e===401 || e===403 || e==='sin_fila') ? 'Esta cuenta no puede cargar documentos en esta obra.' : 'No se pudo subir el archivo. Revisa tu conexión e inténtalo otra vez.', 'mal');
  });
}
function freQuitarDocW(id){
  var d=null; (FREW.docs||[]).forEach(function(x){ if(String(x.id)===String(id)) d=x; });
  dialogo({ titulo:'¿Quitar «'+((d && d.nombre) || 'este documento')+'»?', texto:'Sale de la carpeta de la obra para todo el equipo.', si:'Sí, quitar', no:'Cancelar', mal:true })
    .then(function(ok){
      if(ok!==true) return;
      sbDelP('sst_doc?id=eq.'+_enc(id)).then(function(){ toast('Documento quitado'); return freTraerW(true).then(_frePintarW); })
        .catch(function(e){ _freMsgW(_freMotivoW(e), 'mal'); });
    });
}
/* la ficha del frente en PDF, para la caseta */
function freFichaW(id){
  var f=_frePorId(id); if(!f) return;
  var J=window.jspdf && window.jspdf.jsPDF; if(!J){ toast('Falta el generador de PDF: recarga la página'); return; }
  var o=YO.obra||{}, emergs=[];
  var listo=(typeof cargarMasApp==='function' ? cargarMasApp().then(function(){ return (typeof _quiTraer==='function') ? _quiTraer(false) : null; }) : Promise.resolve(null))
    .then(function(R){ try{ emergs=(R && R.com && Array.isArray(R.com.emergs) && typeof MAS_APP==='object') ? MAS_APP.emergsLimpios(R.com.emergs) : []; }catch(e){ emergs=[]; } }, function(){});
  listo.then(function(){
    var L=FREW.lista||[], paq=FREW.brig ? (frePaquete(L, FREW.docs||[], FREW.brig, _freTrabsW()).filter(function(p){ return p.id===f.id; })[0] || { brig:[] }) : { brig:[] };
    var g=_freGenteW(f);
    var doc=freFichaPdf(J, f, { razon:(typeof empresaDeObraP==='function' ? empresaDeObraP() : '') || o.nombre || '', proyecto:String(o.obra_nombre||'').trim() || o.nombre || '',
      codigo:o.codigo || '', emergs:emergs, brig:paq.brig, gente:g ? g.length : undefined, docs:freDocsDe(f, FREW.docs||[], L) });
    bajarBlob(doc.output('blob'), nombreArchivo('Ficha del frente '+f.n)+'.pdf');
    toast('Ficha descargada: imprímela y déjala a la vista en el frente');
  }).catch(function(){ toast('No se pudo armar el PDF'); });
}
