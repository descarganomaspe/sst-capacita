/* ══ LOS EXÁMENES MÉDICOS OCUPACIONALES (EMO) · el portal (08/10/2026) ═════════════════════════════════════════════
   Marcelo: «se podría crear una sección de EMOS y anexarlo al registro de trabajadores… el líder podría designarlo como
   responsable de los EMOS… el único que puede ver el contenido y subirlo, descargarlo, y los supervisores, líderes, solo
   podrán ver la fecha de su emo y de su próximo emo, y cuántos días le faltan… Y tener la opción de que esa sección se
   anexe a cualquier centro de salud». Eligió: el equipo ve fechas y aptitud; la clínica entra como usuario invitado.
   Esta hoja se pide recién al abrir «Salud (EMO)» o el centro médico (cargarEmo, en index.html). Quién ve qué lo decide
   el servidor (sql/2026-10-30-emo.sql): aquí solo se pinta lo que llega.
     · el equipo: la lista de la obra con el último examen de cada uno, su aptitud, el próximo y los días que faltan;
     · el dueño o el colíder: quién maneja los EMO («salud») y qué centros médicos están invitados;
     · salud: la historia de cada trabajador, el informe, entregárselo, anularlo, quién lo vio y la constancia de entrega;
     · el centro médico (una cuenta sin obra): busca por documento, registra y ve lo que registró. */
/* >>> EMO-BASE-INI (lo re-inyecta armar.py desde ../../emo-base.js, no editar a mano) <<< */
/* ══ LOS EXÁMENES MÉDICOS OCUPACIONALES (EMO) · LO COMÚN (08/10/2026) ═══════════════════════════════════════
   Marcelo: «crear una sección de EMOS y anexarlo al registro de trabajadores que se tiene… los supervisores, líderes,
   solo podrán ver la fecha de su emo y de su próximo emo, y cuántos días le faltan, y que se le pueda entregar también
   los resultados al trabajador por esa vía… y firmar el recibí conforme».
   El MISMO archivo en la app y en la web (armar.py lo pone en las dos): los tipos, la aptitud, el estado de cada uno, las
   fechas y la huella (SHA-256) de un archivo. Las reglas de quién ve qué las cuida el servidor (sql/2026-10-30-emo.sql):
   el equipo ve fechas, días y aptitud; el contenido, solo «salud» (a quien designa el dueño), el centro médico que lo
   subió y el trabajador.
   Lo que se verificó en fuente oficial y se dice en pantalla:
     · Ley 29783, art. 71: los resultados son confidenciales y se le informan al trabajador personalmente.
     · Ley 29783, art. 49 d): exámenes cada dos años, obligatorios, a cargo del empleador (en el Perú, el próximo se
       propone a los dos años; afuera no se supone nada).
     · Procedimiento de EMO del MIMP: aptitud Apto · Apto con restricciones · No apto · Observado. */
var EMO_TIPOS = [['pre', 'Preocupacional'], ['periodico', 'Periódico'], ['retiro', 'De retiro'], ['reingreso', 'Por reingreso'], ['otro', 'Otro']];
var EMO_APTITUD = [['apto', 'Apto', 'ok'], ['apto_restr', 'Apto con restricciones', 'ojo'], ['no_apto', 'No apto', 'mal'], ['observado', 'Observado', 'gris']];
var EMO_ESTADO = { vigente:['Vigente', 'ok'], por_vencer:['Por vencer', 'ojo'], vencido:['Vencido', 'mal'], sin:['Sin examen', 'gris'], sin_proximo:['Sin próximo', 'gris'] };
var EMO_LEY = 'Los resultados de los exámenes médicos son confidenciales y se le informan al trabajador personalmente (Ley 29783, art. 71).';
function _emoDe(lista, k, i){ for(var j = 0; j < lista.length; j++) if(lista[j][0] === k) return lista[j][i]; return ''; }
function emoTipoN(k){ return _emoDe(EMO_TIPOS, k, 1) || 'Examen'; }
function emoAptN(k){ return _emoDe(EMO_APTITUD, k, 1) || '—'; }
function emoAptCl(k){ return _emoDe(EMO_APTITUD, k, 2) || 'gris'; }
function emoEstN(k){ return (EMO_ESTADO[k] || EMO_ESTADO.sin)[0]; }
function emoEstCl(k){ return (EMO_ESTADO[k] || EMO_ESTADO.sin)[1]; }
/* 2026-03-12 → 12/03/2026 */
function emoFecha(iso){ var s = String(iso || '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '—'; }
/* «faltan 120 días» · «vence hoy» · «venció hace 3 días» */
function emoDiasTexto(d){
  if(d === null || d === undefined || d === '' || isNaN(d)) return '';
  d = +d;
  if(d === 0) return 'vence hoy';
  if(d === 1) return 'falta 1 día';
  if(d > 1) return 'faltan ' + d + ' días';
  return d === -1 ? 'venció hace 1 día' : 'venció hace ' + (-d) + ' días';
}
/* el estado con las mismas reglas del servidor (para lo guardado sin señal) */
function emoEstado(proximo, hoy){
  if(!proximo) return 'sin_proximo';
  var a = Date.parse(String(proximo).slice(0, 10) + 'T00:00:00Z'), b = Date.parse(String(hoy).slice(0, 10) + 'T00:00:00Z');
  if(isNaN(a) || isNaN(b)) return 'sin_proximo';
  var d = Math.round((a - b) / 86400000);
  return d < 0 ? 'vencido' : (d <= 30 ? 'por_vencer' : 'vigente');
}
/* el próximo que se propone: en el Perú, a los dos años (no en el de retiro); afuera, ninguno (se escribe) */
function emoProximo(fecha, pais, tipo){
  var s = String(fecha || '').slice(0, 10);
  if(pais !== 'pe' || tipo === 'retiro' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
  var y = +s.slice(0, 4) + 2, m = s.slice(5, 7), dd = s.slice(8, 10);
  if(m === '02' && dd === '29') dd = '28';
  return y + '-' + m + '-' + dd;
}
/* la huella SHA-256 de un archivo (ArrayBuffer o Blob) → hex; sin crypto.subtle, '' */
function emoHuella(datos){
  try{
    if(!(window.crypto && crypto.subtle)) return Promise.resolve('');
    var buf = (datos && typeof datos.arrayBuffer === 'function') ? datos.arrayBuffer() : Promise.resolve(datos);
    return buf.then(function(b){ return crypto.subtle.digest('SHA-256', b); }).then(function(h){
      var u = new Uint8Array(h), s = ''; for(var i = 0; i < u.length; i++) s += ('0' + u[i].toString(16)).slice(-2); return s;
    }, function(){ return ''; });
  }catch(e){ return Promise.resolve(''); }
}
/* un id nuevo (el examen se nombra antes de subir su informe: su carpeta es <raíz>/emo/<id>/) */
function emoNuevoId(){
  try{ if(window.crypto && crypto.randomUUID) return crypto.randomUUID(); }catch(e){}
  var h = '0123456789abcdef', s = '';
  for(var i = 0; i < 32; i++) s += h.charAt(Math.floor(Math.random() * 16));
  return s.slice(0, 8) + '-' + s.slice(8, 12) + '-4' + s.slice(13, 16) + '-' + h.charAt(8 + Math.floor(Math.random() * 4)) + s.slice(17, 20) + '-' + s.slice(20, 32);
}
/* el nombre del archivo, limpio, para su ruta en el balde */
function emoNombreArchivo(n){
  var s = String(n || 'informe').normalize ? String(n || 'informe').normalize('NFD').replace(/[̀-ͯ]/g, '') : String(n || 'informe');
  s = s.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-60);
  return s || 'informe';
}
/* lo que el servidor dice cuando no se puede, en palabras */
function emoPorQue(m){
  return ({ no_eres_salud:'Solo quien designó la empresa para los EMO (o el centro médico) puede hacer esto.', no_eres_jefe:'Solo el dueño de la empresa (o su colíder) puede hacer esto.',
    no_es_del_equipo:'Ese correo no es de nadie de tu equipo. Primero invítalo a la empresa.', sin_nombre:'Escribe el nombre.', fecha_rara:'Revisa la fecha del examen.',
    proximo_raro:'El próximo examen tiene que ser después de este.', aptitud_rara:'Elige la aptitud.', tipo_raro:'Elige el tipo de examen.', archivo_raro:'El archivo no se subió bien. Vuelve a elegirlo.',
    ya_existe:'Ese examen ya estaba registrado.', no_existe:'Ya no existe.', anulado:'Ese examen está anulado.', sin_motivo:'Escribe por qué se anula (con algunas palabras).',
    sin_firma:'Falta tu firma.', sin_foto:'Falta tu foto.', pin_viejo:'Vuelve a escribir tu PIN.', no_es_tuyo:'Ese examen no es tuyo.', no_entregado:'Ese examen todavía no te lo entregaron.',
    codigo_raro:'El código empieza con CLI- y tiene 6 letras o números más.', ya_usada:'Ese código ya se usó.', vencida:'Ese código ya venció: pide uno nuevo.', muchas:'Ya creaste muchos códigos hoy.',
    doc_raro:'Escribe el documento completo.', no_eres_de_la_obra:'Esta cuenta no es de esta obra.', sin_cuenta:'Entra a tu cuenta primero.' })[m] || 'No se pudo (' + (m || 'sin conexión') + ').';
}
/* 2026-03-12T15:04:00Z → 12/03/2026 10:04 (la hora de aquí) */
function emoFechaHora(iso){
  var d = new Date(iso); if(!iso || isNaN(d)) return emoFecha(iso);
  var z = function(v){ return (v < 10 ? '0' : '') + v; };
  return z(d.getDate()) + '/' + z(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes());
}
/* ── el «recibí conforme» ──
   Lo que firma el trabajador: que se lo entregaron, de manera personal y confidencial (art. 71). No repite el resultado:
   así la constancia se puede mostrar sin exponerlo. La huella une ese texto con el informe que se le entregó. */
function emoRecibiTexto(e){
  e = e || {};
  return 'Recibí conforme, de manera personal y confidencial, los resultados de mi examen médico ocupacional (' +
    emoTipoN(e.tipo).toLowerCase() + ', del ' + emoFecha(e.fecha) + (e.clinica ? ', ' + String(e.clinica) : '') + ').';
}
function emoRecibiHuella(e, texto){
  var t = String(texto || emoRecibiTexto(e)) + '|' + ((e && e.archivo_hash) || '') + '|' + ((e && e.id) || '');
  try{ return emoHuella(new TextEncoder().encode(t).buffer); }catch(_t){ return Promise.resolve(''); }
}
/* la firma (la de _atsNorm: {h, p:[[x,y,x,y…]…]}, ancho 1000) dibujada en el PDF, dentro de su recuadro */
function _emoFirmaPDF(doc, tr, x, y, w, h){
  if(!tr || !tr.p || !tr.p.length) return;
  var k = Math.min(w / 1000, h / (tr.h || 380)), ox = x + (w - 1000 * k) / 2, oy = y + (h - (tr.h || 380) * k) / 2;
  doc.setDrawColor(16, 24, 32); doc.setLineWidth(Math.max(0.25, w / 170)); doc.setLineCap && doc.setLineCap('round');
  tr.p.forEach(function(s){ for(var i = 2; i < s.length; i += 2) doc.line(ox + s[i - 2] * k, oy + s[i - 1] * k, ox + s[i] * k, oy + s[i + 1] * k); });
}
/* la constancia de entrega (A4). d = {nombre, doc, td, cargo, obra, tipo, fecha, clinica, entregado, recibido:{cuando, firma,
   dispositivo, hash, pin}, fotoDU, texto, pais}; ctx = {emp:{razon, logo}, logoPDF}. Sin aptitud ni restricciones. */
function emoConstanciaPDF(d, ctx){
  ctx = ctx || {}; d = d || {};
  var emp = ctx.emp || {}, doc = new jspdf.jsPDF({ unit:'mm', format:'a4' }), W = 210, M = 16, AZUL = [11, 42, 58], ORO = [245, 183, 0], GRIS = [95, 105, 114], NEGRO = [28, 34, 40];
  doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]); doc.rect(0, 0, W, 24, 'F');
  doc.setFillColor(ORO[0], ORO[1], ORO[2]); doc.rect(0, 24, W, 1.3, 'F');
  var xT = M;
  if(emp.logo){
    try{
      doc.setFillColor(255, 255, 255); doc.roundedRect(M, 4.5, 32, 15, 1.8, 1.8, 'F');
      if(typeof ctx.logoPDF === 'function') ctx.logoPDF(doc, M + 1.5, 5.8, 29, 12.4);
      else doc.addImage(emp.logo, /^data:image\/png/i.test(emp.logo) ? 'PNG' : 'JPEG', M + 1.5, 5.8, 29, 12.4, undefined, 'FAST');
      xT = M + 36;
    }catch(_l){ xT = M; }
  }
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text(doc.splitTextToSize(String(emp.razon || d.obra || 'OBRASST').toUpperCase(), W - xT - M)[0], xT, 11.5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); doc.setTextColor(203, 220, 230);
  doc.text('Sistema de Gestión de Seguridad y Salud en el Trabajo', xT, 17);
  var y = 34;
  doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('CONSTANCIA DE ENTREGA DE RESULTADOS', W / 2, y, { align:'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
  doc.text('Examen médico ocupacional · esta constancia no incluye el resultado', W / 2, y + 5, { align:'center' });
  function caja(yy, alto){ doc.setDrawColor(214, 221, 227); doc.setLineWidth(0.3); doc.setFillColor(246, 248, 250); doc.roundedRect(M, yy, W - 2 * M, alto, 2, 2, 'FD'); }
  function campo(et, val, x, yy, w){
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]); doc.text(String(et).toUpperCase(), x, yy);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    var tam = 9.6, v = String(val || '—'); doc.setFontSize(tam);
    while(tam > 7 && doc.getTextWidth(v) > w){ tam -= 0.2; doc.setFontSize(tam); }
    while(v.length > 1 && doc.getTextWidth(v) > w) v = v.slice(0, -2) + '…';
    doc.text(v, x, yy + 4.4);
  }
  y += 11; caja(y, 22);
  campo('Apellidos y nombres', d.nombre, M + 4, y + 5, 96); campo(d.td || 'Documento', d.doc, M + 104, y + 5, 30); campo('Cargo', d.cargo, M + 138, y + 5, W - 2 * M - 142);
  campo('Obra', d.obra, M + 4, y + 15, 96);
  y += 27; caja(y, 22);
  campo('Examen', emoTipoN(d.tipo), M + 4, y + 5, 60); campo('Fecha del examen', emoFecha(d.fecha), M + 68, y + 5, 36); campo('Centro médico', d.clinica, M + 108, y + 5, W - 2 * M - 112);
  campo('Se le entregó', d.entregado ? emoFechaHora(d.entregado) : '—', M + 4, y + 15, 60);
  campo('Lo recibió', (d.recibido && d.recibido.cuando) ? emoFechaHora(d.recibido.cuando) : 'Todavía no firmó', M + 68, y + 15, W - 2 * M - 72);
  /* lo que firmó */
  y += 29;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]); doc.text('Lo que firmó en su celular', M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  var L = doc.splitTextToSize(String(d.texto || emoRecibiTexto(d)), W - 2 * M - 8);
  caja(y + 2.5, 6 + L.length * 4.8); doc.text(L, M + 4, y + 8.2);
  y += 10 + L.length * 4.8 + 6;
  /* la firma y la foto */
  var bw = 104, fh = 52;
  doc.setDrawColor(214, 221, 227); doc.setLineWidth(0.3); doc.roundedRect(M, y, bw, fh, 2, 2, 'S');
  _emoFirmaPDF(doc, d.recibido && d.recibido.firma, M + 6, y + 4, bw - 12, fh - 14);
  doc.setDrawColor(150, 158, 166); doc.line(M + 8, y + fh - 9, M + bw - 8, y + fh - 9);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]); doc.text('Firma del trabajador', M + bw / 2, y + fh - 4.5, { align:'center' });
  var fx = M + bw + 6, fw = W - M - fx;
  doc.roundedRect(fx, y, fw, fh, 2, 2, 'S');
  if(d.fotoDU){ try{ var pw = fw - 8, ph = fh - 13, r = d.fotoR || 0.75, iw = Math.min(pw, ph * r), ih = iw / r; doc.addImage(d.fotoDU, 'JPEG', fx + (fw - iw) / 2, y + 3 + (ph - ih) / 2, iw, ih, undefined, 'FAST'); }catch(_f){} }
  else { doc.setFontSize(8); doc.text('Sin foto', fx + fw / 2, y + fh / 2, { align:'center' }); }
  doc.setFontSize(7.6); doc.text('Su foto al recibir', fx + fw / 2, y + fh - 4.5, { align:'center' });
  y += fh + 8;
  doc.setFontSize(8); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
  var R = d.recibido || {}, notas = [];
  if(R.cuando) notas.push('Lo firmó en su app el ' + emoFechaHora(R.cuando) + (R.pin ? ', después de escribir su PIN' : '') + (R.dispositivo ? ' (equipo: ' + R.dispositivo + ')' : '') + '.');
  if(R.hash) notas.push('Huella SHA-256 de lo firmado y del informe entregado: ' + R.hash);
  notas.push('La foto se toma para dejar constancia de quién recibió; no se compara de forma automática.');
  notas.forEach(function(t){ var l = doc.splitTextToSize(t, W - 2 * M); doc.text(l, M, y); y += l.length * 3.9 + 1.2; });
  if(d.pais === 'pe'){ y += 2; doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]); doc.setFontSize(7.6); var l2 = doc.splitTextToSize(EMO_LEY, W - 2 * M); doc.text(l2, M, y); }
  doc.setFontSize(7); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]); doc.text('Generado con OBRASST', W - M, 289, { align:'right' });
  return doc;
}
/* <<< EMO-BASE-FIN >>> */
var EMOW = { caja:null, n:0, papel:null, de:'', R:null, eq:null, filtro:'todos', sin:false, form:null };
var EMOC = { lista:null, t:0, emp:null, caja:null, n:0, op:null, hechos:null };
function _emoCss(){
  if($('emo-css')) return;
  var s=document.createElement('style'); s.id='emo-css';
  s.textContent=
    '.emo-ex{border:1px solid var(--raya); border-radius:12px; padding:12px 14px; margin:0 0 10px; background:var(--panel)}'+
    '.emo-ex.anulado{background:var(--fondo)} .emo-ex.anulado .emo-ex-cab b{text-decoration:line-through; text-decoration-color:var(--gris2)}'+
    '.emo-ex-cab{display:flex; flex-wrap:wrap; gap:6px 10px; align-items:center; margin:0 0 4px}'+
    '.emo-ex-cab b{font-size:14.5px; color:var(--tinta); font-weight:600}'+
    '.emo-dl{display:grid; grid-template-columns:max-content minmax(0,1fr); gap:4px 14px; margin:6px 0 0; font-size:13px; line-height:1.45}'+
    '.emo-dl dt{color:var(--gris)} .emo-dl dd{margin:0; color:var(--texto); min-width:0; overflow-wrap:anywhere}'+
    '.emo-restr{background:var(--ojo-f); border-radius:8px; padding:6px 9px}'+
    '.emo-acc{display:flex; flex-wrap:wrap; gap:6px; margin:10px 0 0}'+
    '.emo-vi{list-style:none; margin:8px 0 0; padding:8px 0 0; border-top:1px dashed var(--raya); display:grid; gap:4px; font-size:12.5px; color:var(--gris)}'+
    '.emo-vi b{color:var(--texto); font-weight:500}'+
    '.emo-acc-l{list-style:none; margin:0 0 10px; padding:0; display:grid; gap:6px}'+
    '.emo-acc-l li{display:flex; align-items:center; gap:10px; border:1px solid var(--raya); border-radius:10px; padding:9px 12px}'+
    '.emo-acc-l li>span{flex:1; min-width:0} .emo-acc-l b{display:block; color:var(--tinta); font-weight:500}'+
    '.emo-acc-l small{display:block; color:var(--gris); font-size:12px; overflow-wrap:anywhere}'+
    '.emo-cod{font-family:var(--mono); font-size:26px; letter-spacing:.14em; color:var(--tinta); background:var(--fondo); border:1px dashed var(--raya2); border-radius:10px; padding:10px 14px; text-align:center; margin:8px 0}'+
    '.emo-busca{display:flex; gap:8px; flex-wrap:wrap} .emo-busca input{flex:1; min-width:180px}'+
    '.emo-res{list-style:none; margin:10px 0 0; padding:0; display:grid; gap:8px}'+
    '.emo-res li{display:flex; flex-wrap:wrap; gap:8px 12px; align-items:center; border:1px solid var(--raya); border-radius:10px; padding:10px 12px}'+
    '.emo-res li>span{flex:1; min-width:180px} .emo-res b{display:block; color:var(--tinta); font-weight:500} .emo-res small{color:var(--gris); font-size:12.5px}'+
    '.emo-cli h1{margin:0 0 6px}'+
    '#emo-f-apt .chip.on.ok{background:var(--ok); border-color:var(--ok)} #emo-f-apt .chip.on.ojo{background:var(--ojo); border-color:var(--ojo)}'+
    '#emo-f-apt .chip.on.mal{background:var(--mal); border-color:var(--mal)} #emo-f-apt .chip.on.gris{background:var(--gris); border-color:var(--gris)}'+
    '@media (max-width:560px){ .emo-dl{grid-template-columns:1fr} .emo-dl dt{margin-top:4px} }';
  document.head.appendChild(s);
}
function _emoEmp(){ return (YO.obra||{}).id || ''; }
function _emoPe(){ try{ return paisObraP()==='pe'; }catch(e){ return true; } }
function _emoDias(iso){ var a=Date.parse(String(iso||'').slice(0,10)+'T00:00:00Z'), b=Date.parse(hoyISO()+'T00:00:00Z'); return (isNaN(a)||isNaN(b)) ? null : Math.round((a-b)/86400000); }
function _emoMsg(id, t, cl){ var m=$(id); if(m){ m.className='msg '+(cl||'gris'); m.textContent=t||''; } }
function _emoRecargar(){ try{ if(VISTA.actual==='emo' && typeof VISTA.recargar==='function') VISTA.recargar(true); }catch(e){} }
/* un archivo del balde privado (el informe, la foto del recibí): con la sesión, nunca por enlace público */
function _emoArchivo(ruta){
  var url=SB.url+'/storage/v1/object/authenticated/salud/'+String(ruta||'').split('/').map(encodeURIComponent).join('/');
  return sbFetch(url, {method:'GET'}).then(function(r){ return r.ok ? r.blob() : Promise.reject(r.status); });
}
function _emoSubir(ruta, file){
  var url=SB.url+'/storage/v1/object/salud/'+String(ruta).split('/').map(encodeURIComponent).join('/');
  return sbFetch(url, {method:'POST', body:file, extra:{'Content-Type':file.type||'application/octet-stream'}})
    .then(function(r){ return r.ok ? ruta : Promise.reject(r.status); });
}
function _emoBlobDU(bl){
  return new Promise(function(ok){
    var fr=new FileReader();
    fr.onload=function(){ var du=fr.result, im=new Image(); im.onload=function(){ ok({du:du, r:(im.width/im.height)||0.75}); }; im.onerror=function(){ ok({du:du, r:0.75}); }; im.src=du; };
    fr.onerror=function(){ ok(null); }; fr.readAsDataURL(bl);
  });
}
function _emoBajar(e, b){
  if(!e || !e.archivo) return;
  if(b) b.disabled=true;
  _emoArchivo(e.archivo).then(function(bl){
    if(b) b.disabled=false;
    /* el nombre del archivo, sin tildes ni signos raros (como las demás descargas del portal), con su extensión */
    var n0=String(e.archivo_nombre || ('EMO '+(e.nombre||'')+' '+emoFecha(e.fecha).replace(/\//g, '-')+'.pdf')), ext=(n0.match(/\.[a-z0-9]{2,5}$/i)||['.pdf'])[0];
    bajarBlob(bl, nombreArchivo(n0.slice(0, n0.length-ext.length))+ext.toLowerCase());
    sbRpc('sst_emo_anotar', {p_id:e.id, p_accion:'bajar'}).catch(function(){});
    toast('Descargado el informe (queda anotado)');
  }, function(err){ if(b) b.disabled=false; toast('No se pudo bajar el informe. '+porQueFallo(err)); });
}

/* ══ LA VISTA «SALUD (EMO)» ══════════════════════════════════════════════════════════════════════════════════════ */
function _emoPapel(emp){
  return sbRpc('sst_emo_papel', {p_emp:emp}).then(function(j){ EMOW.sin=false; EMOW.papel=(j && j.ok) ? j : {}; EMOW.de=emp; return EMOW.papel; });
}
function emoVista(caja){
  _emoCss(); EMOW.caja=caja; EMOW.R=null; EMOW.eq=null;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  cargando(caja);
  function pinta(silencio){
    var n=++EMOW.n, emp=_emoEmp();
    _emoPapel(emp).then(function(P){
      return Promise.all([sbRpc('sst_emo_resumen', {p_emp:emp}), (P.jefe || P.salud) ? sbRpc('sst_emo_equipo', {p_emp:emp}).catch(function(){ return null; }) : null]);
    }).then(function(r){
      if(n!==EMOW.n || VISTA.actual!=='emo') return;
      EMOW.R=r[0]||{}; EMOW.eq=(r[1] && r[1].ok) ? r[1] : null; _emoPintar();
    }, function(e){
      if(n!==EMOW.n || VISTA.actual!=='emo') return;
      if(e===404){ EMOW.sin=true; _emoPintar(); return; }
      if(!silencio) fallo(caja, e);
    });
  }
  VISTA.recargar=pinta; pinta();
}
var EMO_RANGO={ vencido:0, sin:1, por_vencer:2, sin_proximo:3, vigente:4 };
function _emoPintar(){
  var caja=EMOW.caja; if(!caja || !document.body.contains(caja)) return;
  var ac=$('acciones');
  if(EMOW.sin){
    if(ac) ac.innerHTML='';
    caja.innerHTML='<div class="aviso ojo" id="emo-sin">Esto todavía no está activo en el servidor: falta correr su SQL (sql/2026-10-30-emo.sql).</div>'; return;
  }
  var P=EMOW.papel||{}, R=EMOW.R||{}, pe=_emoPe(), eq=EMOW.eq;
  if(R.ok===false){ if(ac) ac.innerHTML=''; caja.innerHTML='<div class="vacio" id="emo-no"><b>No se pudo ver</b>'+esc(emoPorQue(R.motivo))+'</div>'; return; }
  var L=R.lista||[], S=eq ? (eq.accesos||[]).filter(function(a){ return a.papel==='salud'; }) : null;
  if(ac){
    ac.innerHTML=(P.salud ? '<button type="button" class="bt" id="emo-nuevo">＋ Registrar un EMO</button><button type="button" class="bt sec" id="emo-todo">📋 Todo lo registrado</button>' : '')+
      ((P.jefe || P.salud) ? '<button type="button" class="bt sec" id="emo-quien">👥 Quién ve los EMO</button>' : '');
    if($('emo-nuevo')) $('emo-nuevo').onclick=function(){ emoNuevoHoja(null); };
    if($('emo-todo')) $('emo-todo').onclick=function(){ emoTodoHoja(); };
    if($('emo-quien')) $('emo-quien').onclick=function(){ emoQuienHoja(); };
  }
  var K={ vigente:0, por_vencer:0, vencido:0, sin:0, sin_proximo:0 };
  L.forEach(function(x){ K[x.estado]=(K[x.estado]||0)+1; });
  /* en el Perú la frase de la ley ya lo dice entera: arriba, corto */
  var h='<div class="aviso" id="emo-que">🩺 <b>'+(pe ? 'Es confidencial.' : 'Los resultados de los exámenes médicos son confidenciales.')+'</b> '+
    (P.salud ? 'Tú los manejas: ves el informe y las restricciones, registras cada examen y se lo entregas al trabajador, que lo ve en su app y firma que lo recibió. Queda anotado quién vio cada uno.'
             : 'Aquí el equipo ve las fechas, la aptitud y cuánto falta para el próximo examen. El informe y las restricciones los ven solo quien designó la empresa para los EMO, el centro médico que lo registró y el trabajador, en su app.')+
    (pe ? ' <span class="tenue">'+esc(EMO_LEY)+'</span>' : '')+'</div>';
  if(P.jefe && S && !S.length) h+='<div class="aviso ojo" id="emo-nadie"><b>Nadie maneja todavía los EMO de tu empresa.</b> Designa a alguien de tu equipo —enfermería, salud ocupacional o recursos humanos—: '+
    'es quien registra los exámenes, ve los informes y se los entrega a cada trabajador. <button type="button" class="bt chico" id="emo-designar">Designar</button></div>';
  h+='<div class="rej" id="emo-cifras">'+cifra('Vigentes', K.vigente, L.length ? 'de '+L.length+' activos' : 'sin personal', K.vigente ? 'ok' : '')+
    cifra('Por vencer', K.por_vencer, 'en 30 días o menos', K.por_vencer ? 'ojo' : '')+
    cifra('Vencidos', K.vencido, K.vencido ? 'hay que programarlos' : 'ninguno', K.vencido ? 'mal' : 'ok')+
    cifra('Sin examen', K.sin, K.sin ? 'sin ninguno registrado' : 'todos tienen uno', K.sin ? 'ojo' : 'ok')+'</div>';
  var F=[['todos', 'Todos', L.length], ['vencido', 'Vencidos', K.vencido], ['por_vencer', 'Por vencer', K.por_vencer], ['sin', 'Sin examen', K.sin]];
  if(K.sin_proximo) F.push(['sin_proximo', 'Sin próximo', K.sin_proximo]);
  F.push(['vigente', 'Vigentes', K.vigente]);
  if(!F.some(function(f){ return f[0]===EMOW.filtro; })) EMOW.filtro='todos';
  h+='<div class="chips" id="emo-filtros" style="margin:0 0 12px">'+F.map(function(f){ return '<button type="button" class="chip'+(EMOW.filtro===f[0] ? ' on' : '')+'" data-f="'+f[0]+'">'+esc(f[1])+' <i>'+f[2]+'</i></button>'; }).join('')+'</div>';
  h+='<div class="tarj" id="t-emo"></div>';
  var est=$('t-emo') ? $('t-emo')._est : null;
  caja.innerHTML=h; if(est) $('t-emo')._est=est;
  if($('emo-designar')) $('emo-designar').onclick=function(){ emoQuienHoja(); };
  Array.prototype.forEach.call(caja.querySelectorAll('#emo-filtros [data-f]'), function(b){ b.onclick=function(){ EMOW.filtro=b.getAttribute('data-f'); _emoPintar(); }; });
  var filas=L.filter(function(x){ return EMOW.filtro==='todos' || x.estado===EMOW.filtro; }).slice().sort(function(a, b){
    var r=(EMO_RANGO[a.estado]||0)-(EMO_RANGO[b.estado]||0); if(r) return r;
    if(a.dias!=null && b.dias!=null && a.dias!==b.dias) return a.dias-b.dias;
    return String(a.nombre||'').localeCompare(String(b.nombre||''), 'es');
  });
  var cols=[
    { k:'nombre', t:'Trabajador', h:function(x){ return '<b>'+esc(x.nombre)+'</b>'+(x.doc ? '<span class="sub">'+esc(x.doc)+'</span>' : ''); }, v:function(x){ return (x.nombre||'')+' '+(x.doc||''); }, csv:function(x){ return x.nombre; } },
    { k:'doc', t:docPersonaP(), soloCsv:true },
    { k:'fecha', t:'Último examen', h:function(x){ return x.fecha ? esc(emoFecha(x.fecha))+'<span class="sub">'+esc(emoTipoN(x.tipo))+'</span>' : '<span class="tenue">—</span>'; }, v:function(x){ return x.fecha||''; }, csv:function(x){ return x.fecha ? emoFecha(x.fecha) : ''; } },
    { k:'tipo', t:'Tipo', soloCsv:true, v:function(x){ return x.tipo ? emoTipoN(x.tipo) : ''; } },
    { k:'aptitud', t:'Aptitud', h:function(x){ return x.aptitud ? '<span class="pill '+emoAptCl(x.aptitud)+'">'+esc(emoAptN(x.aptitud))+'</span>' : '<span class="tenue">—</span>'; }, v:function(x){ return x.aptitud ? emoAptN(x.aptitud) : ''; } },
    { k:'proximo', t:'Próximo', h:function(x){ return x.proximo ? esc(emoFecha(x.proximo)) : '<span class="tenue">—</span>'; }, v:function(x){ return x.proximo||''; }, csv:function(x){ return x.proximo ? emoFecha(x.proximo) : ''; } },
    { k:'dias', t:'Estado', num:true, v:function(x){ return x.dias==null ? (x.estado==='sin' ? -99999 : 99999) : x.dias; },
      h:function(x){ return '<span class="pill '+emoEstCl(x.estado)+'">'+esc(emoEstN(x.estado))+'</span>'+((x.dias!=null) ? '<span class="sub">'+esc(emoDiasTexto(x.dias))+'</span>' : ''); },
      csv:function(x){ return emoEstN(x.estado); } },
    { k:'dias_n', t:'Días para el próximo', soloCsv:true, v:function(x){ return x.dias==null ? '' : x.dias; } },
    { k:'entrega', t:'Entrega', h:function(x){ return !x.fecha ? '<span class="tenue">—</span>' : (x.recibido ? '<span class="pill ok">Recibió</span>' : (x.entregado ? '<span class="pill ojo">Sin firmar</span>' : '<span class="pill gris">Sin entregar</span>')); },
      v:function(x){ return !x.fecha ? '' : (x.recibido ? 'Recibió' : (x.entregado ? 'Entregado, sin firmar' : 'Sin entregar')); } }
  ];
  if(P.salud) cols.push({ k:'_acc', t:'', acc:true, h:function(){ return '<button type="button" class="bt sec chico" data-acc="ver">Abrir</button>'; } });
  tabla($('t-emo'), cols, filas, { unidad:'personas', archivo:'emo-'+nombreArchivo((YO.obra||{}).nombre||'obra'), vacio:(L.length ? 'Nadie en este filtro' : 'Todavía no hay personal'),
    vacioSub:(L.length ? 'Elige otro arriba.' : 'Carga a tu gente en «Personal»: aquí sale cada uno con su examen.'),
    alClic:P.salud ? function(x){ emoTrabHoja(x); } : null, accion:P.salud ? function(acc, x){ emoTrabHoja(x); } : null });
}

/* ══ SALUD · LA HISTORIA DE UN TRABAJADOR ═══════════════════════════════════════════════════════════════════════════ */
var EMO_ACCION={ registrar:'Lo registró', entregar:'Se lo entregó', recibir:'Firmó que lo recibió', anular:'Lo anuló', bajar:'Bajó el informe', ver:'Lo vio', lista:'Miró la lista' };
function emoTrabHoja(x, aviso){
  _emoCss();
  var t={ trabajador:x.trabajador || x.id, nombre:x.nombre, doc:x.doc };
  abrirHoja('EMO · '+(t.nombre||''), t.doc ? docPersonaP()+' '+t.doc : '', '<div class="vacio">Cargando…</div>', '', { sinFoco:true });
  sbRpc('sst_emo_detalle', {p_emp:_emoEmp(), p_trab:t.trabajador}).then(function(j){
    if(!HOJA.abierta || !$('hoja-cuerpo')) return;
    if(!j || !j.ok){ $('hoja-cuerpo').innerHTML='<div class="vacio"><b>No se pudo ver</b>'+esc(emoPorQue(j && j.motivo))+'</div>'; return; }
    _emoTrabPintar(t, j, aviso);
  }, function(e){ if(HOJA.abierta && $('hoja-cuerpo')) $('hoja-cuerpo').innerHTML='<div class="vacio"><b>No se pudo cargar</b>'+esc(porQueFallo(e))+'</div>'; });
}
function _emoExHTML(e, i, salud){
  var anul=!!e.anulado, R=e.recibido||null, d=e.proximo ? _emoDias(e.proximo) : null;
  var h='<div class="emo-ex'+(anul ? ' anulado' : '')+'" data-i="'+i+'" id="emo-ex-'+i+'"><div class="emo-ex-cab"><b>'+esc(emoTipoN(e.tipo))+' · '+esc(emoFecha(e.fecha))+'</b>'+
    '<span class="pill '+emoAptCl(e.aptitud)+'">'+esc(emoAptN(e.aptitud))+'</span>'+(anul ? '<span class="pill mal">Anulado</span>' : '')+'</div>'+
    '<dl class="emo-dl">'+
      '<dt>Próximo</dt><dd>'+(e.proximo ? esc(emoFecha(e.proximo))+(anul ? '' : ' · '+esc(emoDiasTexto(d))) : '—')+'</dd>'+
      '<dt>Centro médico</dt><dd>'+esc(e.clinica||'—')+'</dd>'+
      (e.restricciones ? '<dt>Restricciones</dt><dd class="emo-restr">'+esc(e.restricciones)+'</dd>' : '')+
      '<dt>Informe</dt><dd>'+(e.archivo ? '<button type="button" class="bt-link" data-acc="bajar">📄 '+esc(e.archivo_nombre||'Bajar el informe')+'</button>' : '<span class="tenue">Sin informe</span>')+'</dd>'+
      '<dt>Entrega</dt><dd>'+(anul ? '—' : (R ? '✅ Recibió conforme el '+esc(emoFechaHora(R.cuando)) : (e.entregado ? 'Se le entregó el '+esc(emoFechaHora(e.entregado))+': le falta firmar que lo recibió (le sale en su app).' : 'Todavía no se le entrega.')))+'</dd>'+
      '<dt>Lo registró</dt><dd>'+esc(e.por_nombre||'—')+(e.por_papel==='clinica' ? ' (centro médico)' : '')+' · '+esc(emoFechaHora(e.creado))+'</dd>'+
      (anul ? '<dt>Anulado</dt><dd>'+esc(emoFechaHora(e.anulado))+' · '+esc(e.anulado_motivo||'')+'</dd>' : '')+
    '</dl>';
  if(salud){
    h+='<div class="emo-acc">'+
      (!anul && !e.entregado ? '<button type="button" class="bt chico" data-acc="entregar">📲 Entregárselo (lo ve en su app)</button>' : '')+
      (R ? '<button type="button" class="bt sec chico" data-acc="constancia">📄 Constancia de entrega</button>' : '')+
      '<button type="button" class="bt sec chico" data-acc="vistas">👁 Quién lo vio</button>'+
      (!anul ? '<button type="button" class="bt sec chico" data-acc="anular">Anular</button>' : '')+'</div><div class="emo-vi-caja"></div>';
  }
  return h+'</div>';
}
function _emoTrabPintar(t, j, aviso){
  var c=$('hoja-cuerpo'); if(!c) return;
  var T=j.trabajador||{}, L=j.lista||[], salud=j.papel==='salud';
  t.puesto=T.puesto||''; t.obra=T.obra||'';
  var h=(aviso ? '<div class="aviso ok" id="emo-t-ok">'+esc(aviso)+'</div>' : '')+
    (T.puesto ? '<p class="ayuda" style="margin:0 0 10px">'+esc(T.puesto)+'</p>' : '')+
    '<div class="acciones" style="justify-content:flex-start;margin:0 0 12px"><button type="button" class="bt" id="emo-t-nuevo">＋ Registrar un EMO</button></div>';
  if(!L.length) h+='<div class="vacio"><b>Todavía no tiene exámenes registrados</b>Registra el último que le hicieron, con su informe.</div>';
  L.forEach(function(e, i){ h+=_emoExHTML(e, i, salud); });
  h+='<p class="ayuda" style="margin-top:12px">Queda anotado que viste su historia.</p><div class="msg" id="emo-t-msg" role="status"></div>';
  c.innerHTML=h;
  $('emo-t-nuevo').onclick=function(){ emoNuevoHoja({ trabajador:t.trabajador, nombre:t.nombre, doc:t.doc }); };
  Array.prototype.forEach.call(c.querySelectorAll('.emo-ex [data-acc]'), function(b){
    b.onclick=function(){
      var cj=b.closest('.emo-ex'), e=L[+cj.getAttribute('data-i')], acc=b.getAttribute('data-acc'); if(!e) return;
      if(acc==='bajar') _emoBajar(e, b);
      else if(acc==='entregar') _emoEntregar(e, t);
      else if(acc==='anular') _emoAnular(e, t);
      else if(acc==='vistas') _emoVistas(e, cj.querySelector('.emo-vi-caja'), b);
      else if(acc==='constancia') _emoConstancia(e, t, b);
    };
  });
}
function _emoEntregar(e, t){
  confirmar('¿Entregarle el resultado?', 'Le llega a su app: ve la aptitud, las restricciones y el informe, y firma que lo recibió (con su firma, su PIN y una foto suya).', { si:'Sí, entregárselo' }).then(function(si){
    if(!si) return;
    sbRpc('sst_emo_entregar', {p_id:e.id}).then(function(j){
      if(!j || j.ok===false){ _emoMsg('emo-t-msg', emoPorQue(j && j.motivo), 'mal'); return; }
      _emoRecargar(); emoTrabHoja(t, j.ya ? 'Ya se le había entregado.' : 'Entregado: le sale en su app para verlo y firmar que lo recibió.');
    }, function(err){ _emoMsg('emo-t-msg', 'No se pudo entregar. '+porQueFallo(err), 'mal'); });
  });
}
function _emoAnular(e, t){
  preguntar('¿Anular este examen?', 'No se borra: queda anulado, con su motivo, y deja de contar. Si ya se le entregó, deja de verlo en su app.',
    { etiqueta:'Por qué se anula', placeholder:'Ej.: el informe era de otra persona', minimo:8, corto:'Escribe por qué, con algunas palabras (8 letras o más).', maximo:300 }, { si:'Anular', mal:true }).then(function(m){
    if(m==null) return;
    sbRpc('sst_emo_anular', {p_id:e.id, p_motivo:m}).then(function(j){
      if(!j || j.ok===false){ _emoMsg('emo-t-msg', emoPorQue(j && j.motivo), 'mal'); return; }
      _emoRecargar(); emoTrabHoja(t, 'Anulado. Queda en su historia con su motivo.');
    }, function(err){ _emoMsg('emo-t-msg', 'No se pudo anular. '+porQueFallo(err), 'mal'); });
  });
}
function _emoVistas(e, caja, b){
  if(!caja) return;
  if(caja.innerHTML){ caja.innerHTML=''; return; }
  if(b) b.disabled=true;
  sbRpc('sst_emo_vistas', {p_id:e.id}).then(function(j){
    if(b) b.disabled=false;
    if(!j || !j.ok){ caja.innerHTML='<p class="msg mal">'+esc(emoPorQue(j && j.motivo))+'</p>'; return; }
    var L=j.lista||[];
    caja.innerHTML='<ul class="emo-vi">'+(L.length ? L.map(function(v){
      var a=String(v.accion||''), q=/^ver:/.test(a) ? 'Vio su historia' : (EMO_ACCION[a] || a);
      if(a==='ver' && v.papel==='trabajador') q='Lo vio en su app';
      return '<li><b>'+esc(emoFechaHora(v.cuando))+'</b> · '+esc(q)+' · '+esc(v.correo || (v.papel==='trabajador' ? 'el trabajador' : ''))+'</li>';
    }).join('') : '<li>Nadie todavía.</li>')+'</ul>';
  }, function(err){ if(b) b.disabled=false; caja.innerHTML='<p class="msg mal">No se pudo ver. '+esc(porQueFallo(err))+'</p>'; });
}
/* la constancia de entrega (sin el resultado): para mostrarla sin exponer nada de salud */
function _emoConstancia(e, t, b){
  if(b) b.disabled=true;
  var fin=function(){ if(b) b.disabled=false; };
  var ctx=(typeof cargarMas==='function') ? cargarMas().then(function(){ return masCtx(); }).catch(function(){ return {}; }) : Promise.resolve({});
  var foto=(e.recibido && e.recibido.foto) ? _emoArchivo(e.recibido.foto).then(_emoBlobDU).catch(function(){ return null; }) : Promise.resolve(null);
  Promise.all([cargarEvPDF(), ctx, foto]).then(function(r){
    var C=r[1]||{}, F=r[2], E=C.emp||{};
    var doc=emoConstanciaPDF({ nombre:t.nombre, doc:t.doc, td:docPersonaP(), cargo:t.puesto, obra:(YO.obra||{}).nombre, tipo:e.tipo, fecha:e.fecha, clinica:e.clinica,
                               entregado:e.entregado, recibido:e.recibido, fotoDU:F && F.du, fotoR:F && F.r, pais:paisObraP(), texto:emoRecibiTexto(e) },
                             { emp:{ razon:E.razon, logo:E.logo } });
    bajarBlob(doc.output('blob'), nombreArchivo('Constancia de entrega EMO - '+t.nombre)+'.pdf');
    toast('Descargada la constancia de entrega'); fin();
  }, function(err){ fin(); toast('No se pudo armar el PDF. '+porQueFallo(err)); });
}

/* ══ REGISTRAR UN EXAMEN (salud o el centro médico) ═════════════════════════════════════════════════════════════════ */
/* pre: {trabajador, nombre, doc, obra} · op: {clinica:true, raiz, como, alListo(j)} */
function emoNuevoHoja(pre, op){
  _emoCss(); op=op||{};
  var cli=!!op.clinica, P=EMOW.papel||{}, pe=cli ? null : _emoPe();
  EMOW.form={ id:emoNuevoId(), trab:pre ? { id:pre.trabajador||pre.id, nombre:pre.nombre, doc:pre.doc, obra:pre.obra } : null, apt:'', subido:null, op:op, raiz:cli ? op.raiz : P.raiz };
  var F=EMOW.form, h='';
  if(!F.trab) h+='<div class="campo"><label for="emo-f-trab">Trabajador</label><input id="emo-f-trab" maxlength="120" placeholder="Escribe sus apellidos o su documento"><p class="ayuda">Elígelo de la lista de la obra.</p></div>';
  else h+='<div class="tl-sel" style="margin:0 0 12px"><b>'+esc(F.trab.nombre||'')+'<small>'+esc([F.trab.doc ? docPersonaP()+' '+F.trab.doc : '', F.trab.obra||''].filter(Boolean).join(' · '))+'</small></b></div>';
  h+='<div class="campo-dos"><div class="campo"><label for="emo-f-tipo">Tipo de examen</label><select id="emo-f-tipo">'+EMO_TIPOS.map(function(x){ return '<option value="'+x[0]+'"'+(x[0]==='periodico' ? ' selected' : '')+'>'+esc(x[1])+'</option>'; }).join('')+'</select></div>'+
     '<div class="campo"><label for="emo-f-fecha">Fecha del examen</label><input type="date" id="emo-f-fecha" max="'+hoyISO()+'"></div></div>';
  h+='<div class="campo"><label id="emo-f-apt-l">Aptitud</label><div class="chips" id="emo-f-apt" role="radiogroup" aria-labelledby="emo-f-apt-l">'+
     EMO_APTITUD.map(function(a){ return '<button type="button" class="chip" role="radio" aria-checked="false" data-apt="'+a[0]+'">'+esc(a[1])+'</button>'; }).join('')+'</div>'+
     '<p class="ayuda">La que dice el certificado del médico. Aquí no va el diagnóstico.</p></div>';
  h+='<div class="campo"><label for="emo-f-restr">Restricciones o recomendaciones <span class="tenue">(si las hay)</span></label>'+
     '<textarea id="emo-f-restr" maxlength="1000" rows="3" placeholder="Ej.: no trabajos en altura por seis meses"></textarea><p class="ayuda">Las ven solo salud, el centro médico que lo registró y el trabajador.</p></div>';
  h+='<div class="campo-dos"><div class="campo"><label for="emo-f-prox">Próximo examen</label><input type="date" id="emo-f-prox"><p class="ayuda" id="emo-f-prox-a">'+
       (cli ? 'Si lo dejas vacío y la obra es del Perú, se pone a los dos años (Ley 29783, art. 49 d).' : (pe ? 'En el Perú, a los dos años si el médico no indica otra fecha (Ley 29783, art. 49 d).' : 'La fecha que indicó el médico o tu procedimiento.'))+'</p></div>'+
     (cli ? '' : '<div class="campo"><label for="emo-f-cli">Centro médico</label><input id="emo-f-cli" maxlength="120" placeholder="Dónde se hizo el examen"></div>')+'</div>';
  h+='<div class="campo"><label for="emo-f-arch">Informe o certificado <span class="tenue">(PDF o foto, hasta 25 MB)</span></label>'+
     '<input type="file" id="emo-f-arch" accept="application/pdf,image/jpeg,image/png,image/webp"><p class="ayuda">Se guarda en un lugar privado: no tiene enlace público. Sin el informe, el trabajador ve solo la aptitud.</p></div>';
  if(!cli) h+='<label class="check"><input type="checkbox" id="emo-f-entregar"><span>Entregárselo ya: le llega a su app para verlo y firmar que lo recibió</span></label>';
  h+='<div class="msg" id="emo-f-msg" role="status"></div>';
  abrirHoja('Registrar un EMO', cli ? 'Centro médico'+(op.como ? ' · '+op.como : '') : 'Queda en la historia del trabajador', h,
    '<button type="button" class="bt sec" id="emo-f-no">Cancelar</button><button type="button" class="bt" id="emo-f-si">Registrar</button>', { sinFoco:true });
  $('emo-f-no').onclick=cerrarHoja;
  $('emo-f-si').onclick=_emoGuardar;
  var ti=$('emo-f-trab');
  if(ti){
    var lista=((EMOW.R && EMOW.R.lista)||[]).map(function(x){ return { id:x.trabajador, nombre:x.nombre, dni:x.doc||'', puesto:'' }; });
    sugGente(ti, { lista:lista, alElegir:function(x){ F.trab={ id:x.id, nombre:x.nombre, doc:x.dni }; _emoMsg('emo-f-msg', ''); } });
    ti.addEventListener('input', function(){ if(F.trab && ti.value!==F.trab.nombre) F.trab=null; });
    setTimeout(function(){ try{ ti.focus(); }catch(e){} }, 40);
  }
  Array.prototype.forEach.call(document.querySelectorAll('#emo-f-apt [data-apt]'), function(b){
    b.onclick=function(){
      F.apt=b.getAttribute('data-apt');
      Array.prototype.forEach.call(document.querySelectorAll('#emo-f-apt [data-apt]'), function(x){ var on=(x===b); x.classList.toggle('on', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); x.classList.remove('ok', 'ojo', 'mal', 'gris'); if(on) x.classList.add(emoAptCl(F.apt)); });
      _emoMsg('emo-f-msg', '');
    };
  });
  /* el próximo que se propone (en el Perú, a los dos años; el de retiro no lleva) */
  var sug=function(){
    if(cli) return;
    var px=$('emo-f-prox'), f=($('emo-f-fecha')||{}).value, tp=($('emo-f-tipo')||{}).value;
    if(!px || (px.value && px.getAttribute('data-auto')!==px.value)) return;
    var v=emoProximo(f, pe ? 'pe' : '', tp); px.value=v; px.setAttribute('data-auto', v);
  };
  $('emo-f-fecha').onchange=sug; $('emo-f-tipo').onchange=sug;
}
function _emoGuardar(){
  var F=EMOW.form; if(!F) return;
  var op=F.op||{}, cli=!!op.clinica, bt=$('emo-f-si');
  var mal=function(t, foco){ _emoMsg('emo-f-msg', t, 'mal'); if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} };
  if(!F.trab || !F.trab.id) return mal('Elige al trabajador de la lista.', 'emo-f-trab');
  var fecha=($('emo-f-fecha')||{}).value||'', tipo=($('emo-f-tipo')||{}).value||'', prox=($('emo-f-prox')||{}).value||'';
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return mal('Escribe la fecha del examen.', 'emo-f-fecha');
  if(fecha>hoyISO()) return mal('La fecha del examen no puede ser después de hoy.', 'emo-f-fecha');
  if(!F.apt) return mal('Elige la aptitud que dice el certificado.');
  if(prox && prox<=fecha) return mal('El próximo examen tiene que ser después de este.', 'emo-f-prox');
  var file=($('emo-f-arch') && $('emo-f-arch').files[0]) || null;
  if(file){
    if(!/^(application\/pdf|image\/(jpeg|png|webp))$/i.test(file.type||'') && !/\.(pdf|jpe?g|png|webp)$/i.test(file.name||'')) return mal('El informe tiene que ser PDF o foto (JPG, PNG o WEBP).', 'emo-f-arch');
    if(file.size>25*1024*1024) return mal('El informe pesa más de 25 MB: comprímelo.', 'emo-f-arch');
  }
  if(file && !F.raiz) return mal('No se pudo saber la carpeta de tu empresa. Vuelve a abrir esta sección.');
  bt.disabled=true; _emoMsg('emo-f-msg', file ? 'Subiendo el informe…' : 'Registrando…');
  var clave=file ? [file.name, file.size, file.lastModified].join('|') : '';
  var subir=!file ? Promise.resolve(null)
    : (F.subido && F.subido.clave===clave) ? Promise.resolve(F.subido)
    : emoHuella(file).then(function(hx){
        var ruta=F.raiz+'/emo/'+F.id+'/'+emoNombreArchivo(file.name);
        return _emoSubir(ruta, file).then(function(r){ F.subido={ clave:clave, ruta:r, nombre:String(file.name||'informe').slice(0, 160), hash:hx }; return F.subido; });
      });
  subir.then(function(S){
    _emoMsg('emo-f-msg', 'Registrando…');
    var p={ id:F.id, trabajador:F.trab.id, tipo:tipo, fecha:fecha, proximo:prox||null, aptitud:F.apt, restricciones:String(($('emo-f-restr')||{}).value||'').trim(),
            archivo:S ? S.ruta : null, archivo_nombre:S ? S.nombre : null, archivo_hash:S ? S.hash : null };
    if(!cli){ p.clinica=String(($('emo-f-cli')||{}).value||'').trim(); p.entregar=!!($('emo-f-entregar') && $('emo-f-entregar').checked); }
    return sbRpc('sst_emo_guardar', { p:p });
  }).then(function(j){
    bt.disabled=false;
    if(!j || j.ok===false){ mal(emoPorQue(j && j.motivo)); return; }
    var t=F.trab; EMOW.form=null;
    if(typeof op.alListo==='function'){ cerrarHoja(); op.alListo(j, t); return; }
    _emoRecargar();
    emoTrabHoja({ trabajador:t.id, nombre:t.nombre, doc:t.doc }, 'Registrado'+(j.proximo ? ': el próximo es el '+emoFecha(j.proximo) : '')+'.');
  }, function(err){
    bt.disabled=false;
    mal((err==='muy-grande' ? 'El informe pesa demasiado.' : (F.subido ? 'El informe ya subió, pero no se pudo registrar. ' : 'No se pudo subir el informe. '))+porQueFallo(err));
  });
}

/* ══ TODO LO REGISTRADO (salud): la lista entera, para revisar y exportar ═══════════════════════════════════════════ */
function emoTodoHoja(){
  _emoCss();
  abrirHoja('Todo lo registrado', 'Los exámenes de la empresa, también los anulados', '<div class="vacio">Cargando…</div>', '', { ancha:true, sinFoco:true });
  sbRpc('sst_emo_hechos', {p_emp:_emoEmp()}).then(function(j){
    var c=$('hoja-cuerpo'); if(!HOJA.abierta || !c) return;
    if(!j || !j.ok){ c.innerHTML='<div class="vacio"><b>No se pudo ver</b>'+esc(emoPorQue(j && j.motivo))+'</div>'; return; }
    c.innerHTML='<div class="aviso ojo" style="margin:0 0 12px">Esta lista y su CSV llevan las restricciones: es información confidencial. Queda anotado que la miraste.</div><div class="tarj" id="t-emo-todo"></div>';
    _emoTablaHechos($('t-emo-todo'), j.lista||[], 'emo-todo-'+nombreArchivo((YO.obra||{}).nombre||'obra'), false);
  }, function(e){ var c=$('hoja-cuerpo'); if(c) c.innerHTML='<div class="vacio"><b>No se pudo cargar</b>'+esc(porQueFallo(e))+'</div>'; });
}
function _emoTablaHechos(caja, L, archivo, cli){
  tabla(caja, [
    { k:'fecha', t:'Examen', h:function(e){ return esc(emoFecha(e.fecha))+'<span class="sub">'+esc(emoTipoN(e.tipo))+'</span>'; }, v:function(e){ return e.fecha; }, csv:function(e){ return emoFecha(e.fecha); } },
    { k:'tipo', t:'Tipo', soloCsv:true, v:function(e){ return emoTipoN(e.tipo); } },
    { k:'nombre', t:'Trabajador', h:function(e){ return '<b>'+esc(e.nombre||'')+'</b><span class="sub">'+esc([e.doc, e.obra].filter(Boolean).join(' · '))+'</span>'; }, v:function(e){ return (e.nombre||'')+' '+(e.doc||'')+' '+(e.obra||''); }, csv:function(e){ return e.nombre; } },
    { k:'doc', t:'Documento', soloCsv:true }, { k:'obra', t:'Obra', soloCsv:true },
    { k:'aptitud', t:'Aptitud', h:function(e){ return '<span class="pill '+emoAptCl(e.aptitud)+'">'+esc(emoAptN(e.aptitud))+'</span>'+(e.anulado ? ' <span class="pill mal">Anulado</span>' : ''); }, v:function(e){ return emoAptN(e.aptitud)+(e.anulado ? ' (anulado)' : ''); } },
    { k:'restricciones', t:'Restricciones', soloCsv:true },
    { k:'proximo', t:'Próximo', h:function(e){ return e.proximo ? esc(emoFecha(e.proximo)) : '<span class="tenue">—</span>'; }, v:function(e){ return e.proximo||''; }, csv:function(e){ return e.proximo ? emoFecha(e.proximo) : ''; } },
    { k:'clinica', t:'Centro médico', soloCsv:cli, v:function(e){ return e.clinica||''; } },
    { k:'entrega', t:'Entrega', soloCsv:cli, h:function(e){ return e.anulado ? '<span class="tenue">—</span>' : (e.recibido ? '<span class="pill ok">Recibió</span>' : (e.entregado ? '<span class="pill ojo">Sin firmar</span>' : '<span class="pill gris">Sin entregar</span>')); },
      v:function(e){ return e.anulado ? '' : (e.recibido ? 'Recibió '+emoFecha(e.recibido.cuando) : (e.entregado ? 'Entregado, sin firmar' : 'Sin entregar')); } },
    { k:'creado', t:'Registrado', h:function(e){ return esc(emoFechaHora(e.creado))+'<span class="sub">'+esc(e.por_nombre||'')+'</span>'; }, v:function(e){ return e.creado; }, csv:function(e){ return emoFechaHora(e.creado); } },
    { k:'_acc', t:'', acc:true, h:function(e){ return e.archivo ? '<button type="button" class="bt sec chico" data-acc="bajar">Informe</button>' : ''; } }
  ], L, { unidad:'filas', archivo:archivo, vacio:'Todavía no hay exámenes registrados', vacioSub:cli ? 'Busca a un trabajador por su documento y registra su examen.' : 'Registra el primero con «＋ Registrar un EMO».',
    accion:function(acc, e, b){ if(acc==='bajar') _emoBajar(e, b); } });
}

/* ══ EL DUEÑO (O EL COLÍDER): QUIÉN VE LOS EMO ══════════════════════════════════════════════════════════════════════ */
function emoQuienHoja(aviso){
  _emoCss();
  abrirHoja('Quién ve los EMO', 'Salud de tu empresa y los centros médicos invitados', '<div class="vacio">Cargando…</div>', '', { sinFoco:true });
  sbRpc('sst_emo_equipo', {p_emp:_emoEmp()}).then(function(j){
    var c=$('hoja-cuerpo'); if(!HOJA.abierta || !c) return;
    if(!j || !j.ok){ c.innerHTML='<div class="vacio"><b>No se pudo ver</b>'+esc(emoPorQue(j && j.motivo))+'</div>'; return; }
    EMOW.eq=j; _emoQuienPintar(j, aviso);
  }, function(e){ var c=$('hoja-cuerpo'); if(c) c.innerHTML='<div class="vacio"><b>No se pudo cargar</b>'+esc(porQueFallo(e))+'</div>'; });
}
function _emoPortalUrl(){ try{ return location.origin+location.pathname.replace(/[^\/]*$/, ''); }catch(e){ return 'obrasstapp.com'; } }
function _emoQuienPintar(j, aviso){
  var c=$('hoja-cuerpo'); if(!c) return;
  var P=EMOW.papel||{}, A=j.accesos||[], S=A.filter(function(a){ return a.papel==='salud'; }), C=A.filter(function(a){ return a.papel==='clinica'; }), I=j.invitaciones||[];
  var fila=function(a, extra){
    return '<li><span><b>'+esc(a.nombre||'')+'</b><small>'+esc([a.cargo, a.correo, extra].filter(Boolean).join(' · '))+'</small></span>'+
      (P.jefe ? '<button type="button" class="bt sec chico" data-quitar="'+esc(a.id)+'" data-nom="'+esc(a.nombre||'')+'">Quitar</button>' : '')+'</li>';
  };
  var h=aviso || '';
  h+='<div class="seccion" style="margin-top:0"><h3>Salud de la empresa</h3><p class="ayuda" style="margin:0 0 8px">Registran los exámenes, ven el informe y las restricciones y se los entregan a cada trabajador. '+
     'Tiene que ser alguien de tu equipo, con su cuenta: enfermería, salud ocupacional o recursos humanos.</p>';
  h+=S.length ? '<ul class="emo-acc-l" id="emo-q-salud">'+S.map(function(a){ return fila(a, a.yo ? 'tú' : ''); }).join('')+'</ul>' : '<p class="tenue" style="margin:0 0 8px">Todavía nadie.</p>';
  if(P.jefe){
    var ya={}; S.forEach(function(a){ ya[String(a.correo||'').toLowerCase()]=1; });
    var E=(j.equipo||[]).map(function(x){ return x.correo; }).filter(function(x){ return x && !ya[String(x).toLowerCase()]; });
    h+=E.length ? '<div class="tarj"><div class="tarj-cuerpo"><b>Designar a alguien</b>'+
        '<div class="campo"><label for="emo-q-correo">De tu equipo</label><select id="emo-q-correo"><option value="">Elige su correo…</option>'+E.map(function(x){ return '<option>'+esc(x)+'</option>'; }).join('')+'</select></div>'+
        '<div class="campo-dos"><div class="campo"><label for="emo-q-nom">Su nombre</label><input id="emo-q-nom" maxlength="120" placeholder="Nombres y apellidos"></div>'+
        '<div class="campo"><label for="emo-q-cargo">Su cargo</label><input id="emo-q-cargo" maxlength="80" placeholder="Ej.: Enfermera ocupacional"></div></div>'+
        '<div class="msg" id="emo-q-msg" role="status"></div><button type="button" class="bt" id="emo-q-des">Designar</button></div></div>'
      : '<p class="ayuda">Para designar a alguien, primero súmalo a tu equipo en «Obras y equipo».</p>';
  }
  h+='</div><div class="seccion"><h3>Centros médicos</h3><p class="ayuda" style="margin:0 0 8px">Un centro médico invitado registra los exámenes que hace y sube su informe. '+
     'No ve tu lista de personal: busca a cada trabajador por su documento, y solo ve lo que registró él.</p>';
  h+=C.length ? '<ul class="emo-acc-l" id="emo-q-cli">'+C.map(function(a){ return fila(a, 'desde el '+emoFecha(a.creado)); }).join('')+'</ul>' : '<p class="tenue" style="margin:0 0 8px">Ninguno todavía.</p>';
  if(I.length) h+='<p class="ayuda" style="margin:8px 0 4px">Códigos sin usar:</p><ul class="emo-acc-l">'+I.map(function(i){ return '<li><span><b>'+esc(i.nombre)+'</b><small>vence el '+esc(emoFecha(i.vence))+'</small></span></li>'; }).join('')+'</ul>';
  h+='<div class="tarj"><div class="tarj-cuerpo"><b>Invitar a un centro médico</b><div class="campo"><label for="emo-q-cli-n">Nombre del centro médico</label>'+
     '<input id="emo-q-cli-n" maxlength="120" placeholder="Ej.: Clínica de Salud Ocupacional"></div><div class="msg" id="emo-q-cmsg" role="status"></div>'+
     '<button type="button" class="bt sec" id="emo-q-inv">Crear su código</button></div></div></div>';
  c.innerHTML=h;
  if($('emo-q-des')) $('emo-q-des').onclick=function(){
    var co=$('emo-q-correo').value, no=String($('emo-q-nom').value||'').trim(), ca=String($('emo-q-cargo').value||'').trim(), b=this;
    if(!co){ _emoMsg('emo-q-msg', 'Elige su correo.', 'mal'); return; }
    if(no.length<3){ _emoMsg('emo-q-msg', 'Escribe su nombre.', 'mal'); $('emo-q-nom').focus(); return; }
    b.disabled=true;
    sbRpc('sst_emo_designar', {p_emp:_emoEmp(), p_correo:co, p_nombre:no, p_cargo:ca}).then(function(r){
      b.disabled=false;
      if(!r || r.ok===false){ _emoMsg('emo-q-msg', emoPorQue(r && r.motivo), 'mal'); return; }
      _emoRecargar(); emoQuienHoja('<div class="aviso ok" id="emo-q-ok">Listo: '+esc(no)+' maneja los EMO. Al entrar al portal o a la app verá «Salud (EMO)» con todo lo de salud.</div>');
    }, function(e){ b.disabled=false; _emoMsg('emo-q-msg', 'No se pudo. '+porQueFallo(e), 'mal'); });
  };
  $('emo-q-inv').onclick=function(){
    var no=String($('emo-q-cli-n').value||'').trim(), b=this;
    if(no.length<3){ _emoMsg('emo-q-cmsg', 'Escribe el nombre del centro médico.', 'mal'); $('emo-q-cli-n').focus(); return; }
    b.disabled=true;
    sbRpc('sst_emo_invitar', {p_emp:_emoEmp(), p_nombre:no}).then(function(r){
      b.disabled=false;
      if(!r || r.ok===false){ _emoMsg('emo-q-cmsg', emoPorQue(r && r.motivo), 'mal'); return; }
      var u=_emoPortalUrl(), tx='Te invitamos a registrar los exámenes médicos ocupacionales de nuestro personal en OBRASST. Entra a '+u+', crea tu cuenta con tu correo y elige «Soy un centro médico». Tu código: '+r.codigo+' (sirve una sola vez, vence el '+emoFecha(r.vence)+').';
      emoQuienHoja('<div class="aviso ok" id="emo-q-cod"><b>Código para '+esc(r.nombre||no)+'</b><div class="emo-cod" id="emo-cod">'+esc(r.codigo)+'</div>'+
        '<p style="margin:0 0 8px">Pásaselo al centro médico: entra a <b>'+esc(u)+'</b>, crea su cuenta con su correo y elige <b>«Soy un centro médico»</b>. Sirve una sola vez y vence el '+esc(emoFecha(r.vence))+'. '+
        '<b>Anótalo: no se vuelve a mostrar.</b></p><div class="acciones" style="justify-content:flex-start"><button type="button" class="bt sec chico" id="emo-cod-copiar">Copiar el mensaje</button>'+
        '<a class="bt sec chico" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(tx)+'">Mandar por WhatsApp</a></div></div>');
      setTimeout(function(){ var bc=$('emo-cod-copiar'); if(bc) bc.onclick=function(){ try{ navigator.clipboard.writeText(tx).then(function(){ toast('Copiado'); }, function(){ toast('No se pudo copiar: anótalo.'); }); }catch(e){ toast('No se pudo copiar: anótalo.'); } }; }, 0);
    }, function(e){ b.disabled=false; _emoMsg('emo-q-cmsg', 'No se pudo. '+porQueFallo(e), 'mal'); });
  };
  Array.prototype.forEach.call(c.querySelectorAll('[data-quitar]'), function(b){
    b.onclick=function(){
      var nom=b.getAttribute('data-nom')||'';
      confirmar('¿Quitarle el acceso a '+nom+'?', 'Deja de ver los EMO desde ahora. Lo que registró queda en la historia de cada trabajador.', { si:'Quitar', mal:true }).then(function(si){
        if(!si) return;
        sbRpc('sst_emo_quitar', {p_emp:_emoEmp(), p_acceso:b.getAttribute('data-quitar')}).then(function(r){
          if(!r || r.ok===false){ toast(emoPorQue(r && r.motivo)); return; }
          _emoRecargar(); emoQuienHoja('<div class="aviso ok">Listo: '+esc(nom)+' ya no ve los EMO.</div>');
        }, function(e){ toast('No se pudo. '+porQueFallo(e)); });
      });
    };
  });
}

/* ══ EL CENTRO MÉDICO ═══════════════════════════════════════════════════════════════════════════════════════════════
   Una cuenta que canjeó un código CLI-…: no es del equipo de nadie (no tiene obra). Ve los nombres de las empresas que la
   invitaron, busca a cada trabajador por su documento, registra su examen y ve lo que registró ella. */
function emoMisEmpresas(forzar){
  if(!forzar && EMOC.lista && Date.now()-EMOC.t<60000) return Promise.resolve(EMOC.lista);
  return sbRpc('sst_emo_mis_empresas', {}).then(function(j){ EMOC.lista=(j && j.ok) ? (j.lista||[]) : []; EMOC.t=Date.now(); return EMOC.lista; });
}
function _emoClinicas(){ return (EMOC.lista||[]).filter(function(x){ return x.papel==='clinica'; }); }
/* la pestaña «Soy un centro médico» de la cuenta sin obra */
function emoAltaClinica(caja){ emoClinicaPintar(caja, { enAlta:true }); }
function emoClinicaHoja(){
  abrirHoja('Centro médico', 'Los exámenes que registras para las empresas que te invitaron', '<div id="emo-cli-hoja"></div>', '', { ancha:true, sinFoco:true });
  emoClinicaPintar($('emo-cli-hoja'), { enHoja:true });
}
function emoClinicaPintar(caja, op){
  if(!caja) return;
  _emoCss(); EMOC.caja=caja; EMOC.op=op||{}; var n=++EMOC.n;
  caja.innerHTML='<div class="vacio">Cargando…</div>';
  emoMisEmpresas(true).then(function(){
    if(n!==EMOC.n) return;
    var C=_emoClinicas();
    if(!EMOC.emp || !C.some(function(x){ return x.empresa===EMOC.emp.empresa; })) EMOC.emp=C[0]||null;
    _emoCliPintar();
  }, function(e){
    if(n!==EMOC.n) return;
    caja.innerHTML=(e===404) ? '<div class="aviso ojo">Esto todavía no está activo en el servidor: falta correr su SQL (sql/2026-10-30-emo.sql).</div>' : '<div class="vacio"><b>No se pudo cargar</b>'+esc(porQueFallo(e))+'</div>';
  });
}
function _emoUnirseHTML(abierto){
  return '<form id="emo-c-uf" class="emo-busca" style="margin-top:8px"><input id="emo-c-cod" maxlength="11" autocapitalize="characters" autocomplete="off" placeholder="CLI-A1B2C3" aria-label="Código del centro médico" '+
    'style="font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase"><button class="bt'+(abierto ? '' : ' sec')+'" type="submit" id="emo-c-ubt">Unirme</button></form><div class="msg" id="emo-c-umsg" role="status"></div>';
}
function _emoCliPintar(){
  var caja=EMOC.caja; if(!caja || !document.body.contains(caja)) return;
  var op=EMOC.op||{}, C=_emoClinicas(), E=EMOC.emp;
  var h='<div class="emo-cli">'+(op.enAlta ? '<h2>Centro médico</h2>' : '');
  h+='<p class="sub" style="margin:0 0 14px">Registras los exámenes médicos ocupacionales de las empresas que te invitaron. Buscas a cada trabajador por su documento y solo ves lo que registraste tú. '+
     'El resultado le llega a la empresa (a quien maneja los EMO) y, cuando ella se lo entrega, al trabajador.</p>';
  if(!C.length){
    h+='<div class="tarj"><div class="tarj-cuerpo"><b>Escribe el código que te dio la empresa</b><p class="ayuda" style="margin:2px 0 0">Empieza con CLI- y sirve una sola vez. Entras con esta cuenta'+(TOK && TOK.correo ? ' ('+esc(TOK.correo)+')' : '')+'.</p>'+
       _emoUnirseHTML(true)+'</div></div>';
  } else {
    if(C.length>1) h+='<div class="campo"><label for="emo-c-emp">Empresa</label><select id="emo-c-emp">'+C.map(function(x, i){ return '<option value="'+i+'"'+(x===E ? ' selected' : '')+'>'+esc(x.nombre||'')+'</option>'; }).join('')+'</select></div>';
    else h+='<p style="margin:0 0 12px">Atiendes a <b>'+esc(E.nombre||'')+'</b> como <b>'+esc(E.como||'')+'</b>.</p>';
    h+='<div class="seccion" style="margin-top:0"><h3>Buscar al trabajador</h3><form id="emo-c-f" class="emo-busca"><input id="emo-c-doc" maxlength="15" autocomplete="off" placeholder="Su documento (DNI, CE, pasaporte…)" aria-label="Documento del trabajador">'+
       '<button class="bt" type="submit" id="emo-c-bt">Buscar</button></form><div id="emo-c-res"></div></div>';
    h+='<div class="seccion"><h3>Lo que registraste</h3><div class="msg" id="emo-c-msg" role="status"></div><div class="tarj" id="t-emo-c"></div></div>';
    h+='<details class="seccion"><summary>¿Otra empresa te invitó? Canjea su código</summary>'+_emoUnirseHTML(false)+'</details>';
  }
  caja.innerHTML=h+'</div>';
  var uf=$('emo-c-uf');
  if(uf) uf.onsubmit=function(ev){
    ev.preventDefault();
    var cod=String($('emo-c-cod').value||'').trim().toUpperCase(), b=$('emo-c-ubt');
    if(!/^CLI-?[A-Z0-9]{6}$/.test(cod)){ _emoMsg('emo-c-umsg', emoPorQue('codigo_raro'), 'mal'); return; }
    b.disabled=true;
    sbRpc('sst_emo_unirse', {p_codigo:cod}).then(function(j){
      b.disabled=false;
      if(!j || j.ok===false){ _emoMsg('emo-c-umsg', emoPorQue(j && j.motivo), 'mal'); return; }
      EMOC.emp=null; EMOC.t=0; toast('Listo: ya registras los EMO de '+(j.razon||'la empresa'));
      emoClinicaPintar(caja, op);
    }, function(e){ b.disabled=false; _emoMsg('emo-c-umsg', 'No se pudo. '+porQueFallo(e), 'mal'); });
  };
  if(!E) return;
  var se=$('emo-c-emp'); if(se) se.onchange=function(){ EMOC.emp=C[+se.value]||C[0]; _emoCliPintar(); };
  $('emo-c-f').onsubmit=function(ev){
    ev.preventDefault();
    var d=String($('emo-c-doc').value||'').trim(), b=$('emo-c-bt'), res=$('emo-c-res');
    if(d.replace(/[^A-Za-z0-9]/g, '').length<5){ res.innerHTML='<p class="msg mal">'+esc(emoPorQue('doc_raro'))+'</p>'; return; }
    b.disabled=true; res.innerHTML='<p class="msg gris">Buscando…</p>';
    sbRpc('sst_emo_buscar', {p_emp:E.empresa, p_doc:d}).then(function(j){
      b.disabled=false;
      if(!j || !j.ok){ res.innerHTML='<p class="msg mal">'+esc(emoPorQue(j && j.motivo))+'</p>'; return; }
      var L=j.lista||[];
      if(!L.length){ res.innerHTML='<p class="msg gris">Nadie con ese documento en '+esc(E.nombre||'esta empresa')+'. Revisa el número o pídele a la empresa que lo registre en su personal.</p>'; return; }
      res.innerHTML='<ul class="emo-res">'+L.map(function(t, i){
        return '<li><span><b>'+esc(t.nombre||'')+'</b><small>'+esc([t.doc, t.puesto, t.obra].filter(Boolean).join(' · '))+(t.cesado ? ' · ya no trabaja ahí' : '')+'</small></span>'+
          '<button type="button" class="bt chico" data-i="'+i+'">Registrar su EMO</button></li>'; }).join('')+'</ul>';
      Array.prototype.forEach.call(res.querySelectorAll('[data-i]'), function(bt){
        bt.onclick=function(){
          var t=L[+bt.getAttribute('data-i')];
          emoNuevoHoja({ trabajador:t.id, nombre:t.nombre, doc:t.doc, obra:t.obra }, { clinica:true, raiz:E.empresa, como:E.como, alListo:function(r, tt){
            /* en el alta el formulario abre en el cajón; al cerrarlo, la lista se repinta con lo nuevo */
            if(!op.enHoja) _emoCliHechos('Registrado: '+tt.nombre+(r.proximo ? ' · próximo examen el '+emoFecha(r.proximo) : '')+'.');
            else emoClinicaHoja();
          } });
        };
      });
    }, function(e){ b.disabled=false; res.innerHTML='<p class="msg mal">No se pudo buscar. '+esc(porQueFallo(e))+'</p>'; });
  };
  _emoCliHechos();
}
function _emoCliHechos(aviso){
  var E=EMOC.emp, t=$('t-emo-c'); if(!E || !t) return;
  if(aviso) _emoMsg('emo-c-msg', aviso, 'ok');
  cargando(t);
  sbRpc('sst_emo_hechos', {p_emp:E.empresa}).then(function(j){
    if(!$('t-emo-c')) return;
    if(!j || !j.ok){ t.innerHTML='<div class="vacio"><b>No se pudo ver</b>'+esc(emoPorQue(j && j.motivo))+'</div>'; return; }
    _emoTablaHechos(t, j.lista||[], 'emo-centro-medico-'+nombreArchivo(E.nombre||''), true);
  }, function(e){ if($('t-emo-c')) fallo(t, e); });
}
