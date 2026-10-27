/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   OBRASST · las cotizaciones de los requerimientos y el Portal de Aliados: LO COMÚN (27/10/2026)
   Marcelo: «Todo ello ya armarlo, ve la manera correcta, simple, y que no se puedan confundir los usuarios, que todo sea
   parte de un sistema». Lo usan el portal (Pedir cotización, el cuadro comparativo, adjudicar) y portal-aliados.html (la
   bandeja y la respuesta del aliado): las mismas cuentas, los mismos nombres y los mismos estados en los dos lados.
   El servidor (sql/2026-10-27-aliados-fase1.sql) vuelve a revisar y a calcular todo; aquí se avisa antes, con palabras.
     · Los precios: unitarios, en soles, por línea (sin precio = esa línea no la cotiza), con IGV incluido o «más IGV».
       Para comparar, todo se lleva a «con IGV» (18 %).
     · Los departamentos llegan como los guarda el UBIGEO del INEI («SAN MARTIN»): aquí se escriben bien («San Martín»).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
var COT = (function(){
  'use strict';
  var IGV = 0.18;
  var PORTAL = 'https://obrasstapp.com/portal-aliados.html';
  var DEPS = { AMAZONAS:'Amazonas', ANCASH:'Áncash', APURIMAC:'Apurímac', AREQUIPA:'Arequipa', AYACUCHO:'Ayacucho', CAJAMARCA:'Cajamarca',
    CALLAO:'Callao', CUSCO:'Cusco', HUANCAVELICA:'Huancavelica', HUANUCO:'Huánuco', ICA:'Ica', JUNIN:'Junín', 'LA LIBERTAD':'La Libertad',
    LAMBAYEQUE:'Lambayeque', LIMA:'Lima', LORETO:'Loreto', 'MADRE DE DIOS':'Madre de Dios', MOQUEGUA:'Moquegua', PASCO:'Pasco',
    PIURA:'Piura', PUNO:'Puno', 'SAN MARTIN':'San Martín', TACNA:'Tacna', TUMBES:'Tumbes', UCAYALI:'Ucayali' };
  var RUBROS = { epp:'EPP y seguridad', salud:'Centro de salud ocupacional', consultor:'Consultor SSOMA', medico:'Médico ocupacional',
    capacitacion:'Centro de capacitación', residuos:'Gestor de residuos', sctr:'Corredor de seguros (SCTR)', otro:'Otro' };
  var PAGOS = ['Contado', 'Contra entrega', 'Crédito 15 días', 'Crédito 30 días', 'Crédito 45 días', 'Crédito 60 días'];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function dos(n){ return ('0' + n).slice(-2); }
  function isoDe(d){ return d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate()); }
  function hoy(){ return isoDe(new Date()); }
  function fechaMas(iso, n){ var p = String(iso).split('-'); return isoDe(new Date(+p[0], +p[1] - 1, +p[2] + n)); }
  function dma(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
  /* lo que trae hora se cuenta en el día de aquí (a las 8 p. m. de Lima ya es mañana en UTC) */
  function cuando(iso){ if(!iso) return ''; var d = new Date(iso); if(isNaN(d)) return dma(iso); return dos(d.getDate()) + '/' + dos(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + dos(d.getHours()) + ':' + dos(d.getMinutes()); }
  function diaDe(iso){ if(!iso) return ''; if(/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) return dma(iso); var d = new Date(iso); return isNaN(d) ? dma(iso) : dos(d.getDate()) + '/' + dos(d.getMonth() + 1) + '/' + d.getFullYear(); }
  /* una cantidad como se lee en los requerimientos: 12 · 1,5 */
  function num(v){ var n = Math.round((+v || 0) * 100) / 100; return String(n).replace('.', ','); }
  /* la plata como en una factura: S/ 1,234.50 */
  function soles(n){
    if(n === null || n === undefined || n === '' || isNaN(+n)) return '—';
    var x = (Math.round(+n * 100) / 100).toFixed(2).split('.');
    return 'S/ ' + x[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + x[1];
  }
  function r2(n){ return Math.round(n * 100) / 100; }
  /* «SAN JUAN DE LURIGANCHO» → «San Juan de Lurigancho» (el INEI los escribe en mayúsculas y sin tildes) */
  function titulo(s){
    var chicas = { de:1, del:1, la:1, las:1, los:1, el:1, y:1 };
    return String(s || '').toLowerCase().split(/\s+/).filter(Boolean).map(function(w, i){
      return (i > 0 && chicas[w]) ? w : w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }
  function depNombre(d){ var k = String(d || '').toUpperCase().trim(); return DEPS[k] || titulo(k); }
  function zonasTxt(z){
    z = Array.isArray(z) ? z : [];
    if(z.indexOf('*') > -1) return 'Todo el Perú';
    var n = z.map(depNombre);
    return n.length <= 1 ? (n[0] || '') : n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1];
  }
  /* «San Isidro, Lima» · «Chancay (Huaral), Lima» · «Lima» */
  function lugarTxt(l){
    l = l || {};
    var dep = l.dep ? depNombre(l.dep) : '', prov = l.prov ? titulo(l.prov) : '', dist = l.dist ? titulo(l.dist) : '';
    if(dist) return dist + (prov && prov !== dist && prov !== dep ? ' (' + prov + ')' : '') + (dep ? ', ' + dep : '');
    if(prov) return prov + (dep && dep !== prov ? ', ' + dep : '');
    return dep;
  }
  function rubroNombre(k){ return RUBROS[k] || RUBROS.otro; }

  /* ── un precio escrito como sea: «10.50», «10,50», «S/ 1,234.50», «1.234,50» ── */
  function precio(t){
    var s = String(t == null ? '' : t).replace(/s\/\.?|soles|\s/gi, '');
    if(!s) return null;
    if(!/^[0-9.,]+$/.test(s)) return NaN;
    var c = s.lastIndexOf(','), p = s.lastIndexOf('.');
    if(c > -1 && p > -1){ s = (c > p) ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, ''); }
    else if(c > -1){ s = /,\d{1,2}$/.test(s) && (s.match(/,/g) || []).length === 1 ? s.replace(',', '.') : s.replace(/,/g, ''); }
    else if((s.match(/\./g) || []).length > 1){ s = s.replace(/\./g, ''); }
    var n = +s;
    return isNaN(n) ? NaN : r2(n);
  }

  /* ── las cuentas de una respuesta (las mismas que hace el servidor) ── */
  function factor(resp){ return (resp && resp.igv === 'incluido') ? 1 : 1 + IGV; }
  function lineaDe(resp, i){ var l = resp && resp.l && resp.l[i]; return (l && l.p !== undefined && l.p !== null && l.p !== '') ? l : null; }
  /* el precio unitario de una línea llevado a «con IGV», para comparar */
  function unitCon(resp, i){ var l = lineaDe(resp, i); return l ? +l.p * factor(resp) : null; }
  function totales(resp, items){
    var s = 0, n = 0;
    (items || []).forEach(function(it, i){ var l = lineaDe(resp, i); if(l){ s += +l.p * +it.c; n++; } });
    var con = (resp && resp.igv === 'incluido') ? r2(s) : r2(s * (1 + IGV)), sin = (resp && resp.igv === 'incluido') ? r2(s / (1 + IGV)) : r2(s);
    return { sub:sin, total:con, cot:n, todo:n === (items || []).length };
  }
  /* revisar lo escrito antes de mandarlo: {ok:true, resp} o {ok:false, msg, campo} */
  function validar(v, items){
    items = items || [];
    var L = [], cot = 0;
    for(var i = 0; i < items.length; i++){
      var t = (v.precios || [])[i], p = precio(t), m = String((v.marcas || [])[i] || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      if(p !== null && (isNaN(p) || p < 0)) return { ok:false, msg:'Revisa el precio de «' + items[i].d + '»: escríbelo en números (por ejemplo, 12.50).', campo:'p' + i };
      if(p !== null && p > 100000000) return { ok:false, msg:'El precio de «' + items[i].d + '» es demasiado alto.', campo:'p' + i };
      if(p !== null) cot++;
      var o = {}; if(p !== null) o.p = p; if(m) o.m = m; L.push(o);
    }
    if(!cot) return { ok:false, msg:'Pon el precio de al menos una línea. Las que dejes en blanco quedan como «no cotiza».', campo:'p0' };
    var d = String(v.dias == null ? '' : v.dias).trim();
    if(!/^\d{1,3}$/.test(d) || +d > 180) return { ok:false, msg:'Escribe el plazo de entrega en días (de 0 a 180).', campo:'dias' };
    var val = String(v.validez || '');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(val) || val < hoy() || val > fechaMas(hoy(), 180)) return { ok:false, msg:'La oferta tiene que valer desde hoy y hasta 180 días como máximo.', campo:'validez' };
    var resp = { l:L, dias:+d, validez:val, igv:v.igv === 'incluido' ? 'incluido' : 'mas' };
    var pago = String(v.pago || '').replace(/\s+/g, ' ').trim().slice(0, 60); if(pago) resp.pago = pago;
    var nota = String(v.nota || '').trim().slice(0, 500); if(nota) resp.nota = nota;
    return { ok:true, resp:resp, tot:totales(resp, items) };
  }

  /* ── el cuadro comparativo: para cada línea, el precio de cada uno y el más bajo (con IGV) ── */
  function comparativo(cot){
    var items = (cot && cot.items) || [], D = ((cot && cot.destinos) || []).filter(function(d){ return d.resp && d.resp.l; });
    var min = items.map(function(it, i){
      var m = null; D.forEach(function(d){ var u = unitCon(d.resp, i); if(u !== null && (m === null || u < m - 1e-9)) m = u; }); return m;
    });
    var mejor = null;     /* el menor total entre los que cotizaron TODO */
    D.forEach(function(d){ var t = totales(d.resp, items); if(t.todo && (mejor === null || t.total < mejor.total - 1e-9)) mejor = { id:d.id, total:t.total }; });
    return { items:items, destinos:D, min:min, mejor:mejor ? mejor.id : null };
  }

  /* ── los estados, con el mismo nombre para la empresa y para el aliado ── */
  var EST_EMPRESA = { enviado:{ n:'Enviado', c:'neu' }, visto:{ n:'Lo vio', c:'neu' }, respondido:{ n:'Respondió', c:'ok' }, declinado:{ n:'No cotiza', c:'neu' },
                      ganado:{ n:'Ganador', c:'ok' }, no_adjudicado:{ n:'No adjudicado', c:'neu' } };
  function estadoEmpresa(d){ return EST_EMPRESA[(d && d.estado) || 'enviado'] || EST_EMPRESA.enviado; }
  function estadoCot(c){
    if(!c) return { n:'', c:'neu' };
    if(c.estado === 'anulada') return { n:'Anulada', c:'neu' };
    if(c.estado === 'adjudicada') return { n:'Adjudicada', c:'ok' };
    var D = c.destinos || [], r = D.filter(function(d){ return d.estado === 'respondido'; }).length;
    return { n:r + ' de ' + D.length + (D.length === 1 ? ' respondió' : ' respondieron'), c:r ? 'ok' : 'med' };
  }
  /* lo que ve el aliado de cada solicitud suya (27/10/2026: «solicitud», no «pedido», para que no se lea como solo EPP) */
  function estadoAliado(f){
    if(!f) return { n:'', c:'neu', k:'' };
    if(f.cot_estado === 'anulada') return { n:'Anulada por la empresa', c:'neu', k:'anulado' };
    if(f.estado === 'ganado'){
      if(f.recibido && f.recibido.k === 'atendido') return { n:'Recibido en almacén', c:'ok', k:'recibido' };
      if(f.recibido && f.recibido.k === 'parcial') return { n:'Recibido en parte', c:'ok', k:'recibido' };
      return { n:'Ganaste', c:'ok', k:'ganado' };
    }
    if(f.estado === 'no_adjudicado') return { n:'No adjudicada', c:'neu', k:'no' };
    if(f.estado === 'declinado') return { n:'No cotizaste', c:'neu', k:'declinado' };
    if(f.estado === 'respondido') return { n:'Respondida · espera la decisión', c:'med', k:'respondido' };
    if(f.hasta && f.hasta < hoy()) return { n:'Plazo vencido', c:'mal', k:'vencido' };
    return f.estado === 'enviado' ? { n:'Nueva', c:'nuevo', k:'nuevo' } : { n:'Por responder', c:'med', k:'pendiente' };
  }

  /* ── el aviso por correo: sale del correo de quien pide, a todos en copia oculta ── */
  function lineasTxt(items){ return (items || []).map(function(it){ return '- ' + num(it.c) + ' ' + (it.u || 'und') + ' · ' + it.d + (it.e ? ' (' + it.e + ')' : ''); }); }
  function correo(cot, nombre){
    var L = lineasTxt(cot.items), lugar = lugarTxt(cot.lugar);
    var asunto = 'Solicitud de cotización' + (cot.numero ? ' · RQ ' + cot.numero : '') + (cot.obra ? ' · ' + cot.obra : '');
    var pie = '\n' + (cot.para ? 'Se necesita para el ' + dma(cot.para) + '.\n' : '') + (cot.hasta ? 'Respuesta hasta el ' + dma(cot.hasta) + '.\n' : '') +
      (cot.obra ? 'Obra: ' + cot.obra + (lugar ? ' (' + lugar + ')' : '') + '.\n' : '') + (cot.entrega ? 'Entrega en: ' + cot.entrega + '.\n' : '') +
      (cot.nota ? 'Nota: ' + cot.nota + '\n' : '') +
      '\nAliados de OBRASST: respondan en su Portal de Aliados (ya está en su bandeja): ' + PORTAL +
      '\nLos demás: respondan a este correo con el precio unitario de cada línea, la marca o norma, el plazo de entrega y la validez.\n' +
      '\nQuedo atento.\n' + (nombre ? nombre + '\n' : '') + '\n—\nSolicitud armada con OBRASST, la app de seguridad y salud en el trabajo.';
    var cab = 'Buenos días:\n\nLes pedimos cotización de lo siguiente:\n\n';
    /* un mailto largo se corta en algunos correos: se mandan las líneas que entran y se avisa cuántas faltan */
    var cuerpo = cab + L.join('\n') + '\n' + pie, falta = 0;
    while(cuerpo.length > 1300 && L.length > 3){ L.pop(); falta++; cuerpo = cab + L.join('\n') + '\n- (y ' + falta + (falta === 1 ? ' línea más' : ' líneas más') + ': pídanos el detalle o véanlo en el Portal de Aliados)\n' + pie; }
    return { asunto:asunto, cuerpo:cuerpo, cortado:falta, completo:cab + lineasTxt(cot.items).join('\n') + '\n' + pie };
  }
  function mailto(correos, asunto, cuerpo){
    var bcc = (correos || []).filter(Boolean).map(function(c){ return encodeURIComponent(c).replace(/%40/g, '@'); }).join(',');
    return 'mailto:?' + (bcc ? 'bcc=' + bcc + '&' : '') + 'subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
  }

  /* ── el formulario de una respuesta: el del aliado y el que llena la empresa por un proveedor que no es aliado. Las líneas
     con su precio unitario y su marca o norma; debajo, el IGV, el plazo, la validez, la forma de pago y una nota.
     «pre» es el prefijo de los id (para que quepan dos en una página). ── */
  function respFormHTML(items, pre, resp){
    resp = resp || {};
    var l = resp.l || [];
    return '<div class="tabla-caja cot-resp-t"><table><thead><tr><th>Línea</th><th class="num">Cantidad</th><th class="num">Precio unitario (S/)</th><th>Marca o norma</th></tr></thead><tbody>' +
      (items || []).map(function(it, i){
        var x = l[i] || {};
        return '<tr><td><b>' + esc(it.d) + '</b>' + (it.e ? '<span class="sub">' + esc(it.e) + '</span>' : '') + '</td>' +
          '<td class="num">' + esc(num(it.c)) + ' <span class="gris-t">' + esc(it.u || 'und') + '</span></td>' +
          '<td class="num"><input id="' + pre + 'p' + i + '" class="cot-precio" inputmode="decimal" autocomplete="off" aria-label="Precio unitario de ' + esc(it.d) + '" value="' +
            (x.p != null ? esc(String(x.p)) : '') + '" placeholder="—"></td>' +
          '<td><input id="' + pre + 'm' + i + '" maxlength="80" autocomplete="off" aria-label="Marca o norma de ' + esc(it.d) + '" value="' + esc(x.m || '') + '"></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="ayuda cot-ayuda">Deja en blanco el precio de lo que no cotizas.</p>' +
      '<div class="campo-dos"><div class="campo"><label for="' + pre + 'igv">Los precios</label><select id="' + pre + 'igv">' +
        '<option value="mas"' + (resp.igv !== 'incluido' ? ' selected' : '') + '>No incluyen IGV (+ 18 %)</option>' +
        '<option value="incluido"' + (resp.igv === 'incluido' ? ' selected' : '') + '>Incluyen IGV</option></select></div>' +
      '<div class="campo"><label for="' + pre + 'dias">Entrega en (días)</label><input id="' + pre + 'dias" inputmode="numeric" maxlength="3" value="' +
        (resp.dias != null ? esc(String(resp.dias)) : '') + '" placeholder="Por ejemplo, 3"></div></div>' +
      '<div class="campo-dos"><div class="campo"><label for="' + pre + 'val">La oferta vale hasta</label><input id="' + pre + 'val" type="date" min="' + hoy() + '" max="' +
        fechaMas(hoy(), 180) + '" value="' + esc(resp.validez && resp.validez >= hoy() ? resp.validez : fechaMas(hoy(), 15)) + '"></div>' +
      '<div class="campo"><label for="' + pre + 'pago">Forma de pago</label><input id="' + pre + 'pago" maxlength="60" list="' + pre + 'pagos" value="' + esc(resp.pago || '') +
        '" placeholder="Por ejemplo, crédito 30 días"><datalist id="' + pre + 'pagos">' + PAGOS.map(function(x){ return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div></div>' +
      '<div class="campo"><label for="' + pre + 'nota">Nota <span class="gris-t">(opcional)</span></label><textarea id="' + pre + 'nota" rows="2" maxlength="500">' + esc(resp.nota || '') + '</textarea></div>' +
      '<p class="cot-tot" id="' + pre + 'tot" aria-live="polite"></p>';
  }
  function respLeer(pre, items, doc){
    doc = doc || document;
    var g = function(id){ var e = doc.getElementById(pre + id); return e ? e.value : ''; };
    return { precios:(items || []).map(function(_, i){ return g('p' + i); }), marcas:(items || []).map(function(_, i){ return g('m' + i); }),
             dias:g('dias'), validez:g('val'), igv:g('igv'), pago:g('pago'), nota:g('nota') };
  }
  function totTxt(t){
    return t.cot ? 'Total: <b>' + soles(t.total) + '</b> con IGV · ' + soles(t.sub) + ' sin IGV · ' + t.cot + (t.cot === 1 ? ' línea cotizada' : ' líneas cotizadas')
                 : 'Todavía sin precios.';
  }
  /* el total al día mientras se escribe */
  function respVivo(pre, items, doc){
    doc = doc || document;
    var pinta = function(){
      var v = respLeer(pre, items, doc), L = (items || []).map(function(_, i){ var p = precio(v.precios[i]); return (p === null || isNaN(p)) ? {} : { p:p }; });
      var o = doc.getElementById(pre + 'tot'); if(o) o.innerHTML = totTxt(totales({ l:L, igv:v.igv }, items));
    };
    (items || []).forEach(function(_, i){ var e = doc.getElementById(pre + 'p' + i); if(e) e.addEventListener('input', pinta); });
    var g = doc.getElementById(pre + 'igv'); if(g) g.addEventListener('change', pinta);
    pinta();
  }

  return { IGV:IGV, PORTAL:PORTAL, DEPS:DEPS, RUBROS:RUBROS, PAGOS:PAGOS,
           esc:esc, hoy:hoy, fechaMas:fechaMas, dma:dma, cuando:cuando, diaDe:diaDe, num:num, soles:soles, titulo:titulo,
           depNombre:depNombre, zonasTxt:zonasTxt, lugarTxt:lugarTxt, rubroNombre:rubroNombre,
           precio:precio, factor:factor, unitCon:unitCon, totales:totales, validar:validar, comparativo:comparativo,
           estadoEmpresa:estadoEmpresa, estadoCot:estadoCot, estadoAliado:estadoAliado, lineasTxt:lineasTxt, correo:correo, mailto:mailto,
           respFormHTML:respFormHTML, respLeer:respLeer, respVivo:respVivo, totTxt:totTxt };
})();
