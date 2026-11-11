/* OBRASST Verifica · la página pública (11/11/2026): ¿este PDF es el original? La huella (SHA-256) se calcula en este equipo
   y solo ella va al servidor (sst_huella_ver, abierta a cualquiera). El servidor dice cuándo se registró, de qué obra y
   empresa, de qué tipo y si su eslabón de la cadena cuadra. ?h=<huella> la consulta directo.
   12/11 · varios PDF a la vez (la carpeta del mes de un contratista, hasta 60): primero los que tienen problema, el resumen
   arriba y «Copiar el resumen» para mandarlo; lo que no es PDF se dice; el «no registrado» explica lo de la copia escaneada. */
'use strict';
(function(){
  var SB = { url:'https://gwjjkknuiumgysezeatz.supabase.co', key:'sb_publishable_7fLOMEbxMHW9ButihszpoQ_gkfNKnnx' };
  var MAX = 60;
  var res = document.getElementById('res'), arch = document.getElementById('arch'), caja = document.getElementById('caja');
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); };
  var TIPOS = { ats:'ATS', petar:'PETAR', inspeccion:'Inspección', charla:'Charla o difusión', capacitacion:'Capacitación', epp:'Entrega de EPP',
                informe:'Informe', simulacro:'Simulacro', iperc:'IPERC', pets:'PETS', accidente:'Accidente o incidente', reporte:'Reporte de acto o condición', pdf:'Documento' };
  var hora = function(t){
    try{ return new Intl.DateTimeFormat('es-PE', { timeZone:'America/Lima', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false }).format(new Date(t)).replace(',', ' a las'); }
    catch(e){ return esc(t); }
  };
  var sello = function(c, ic, t, p){ return '<div class="sello ' + c + '" role="status"><span class="ic" aria-hidden="true">' + ic + '</span><div><b>' + esc(t) + '</b>' + (p ? '<p>' + esc(p) + '</p>' : '') + '</div></div>'; };
  var hex = function(buf){ var b = new Uint8Array(buf), s = ''; for(var i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2); return s; };
  var NO_REG = 'Este archivo no coincide con ningún PDF registrado en OBRASST. Si le cambiaron algo, aunque sea una coma, la huella ya es otra; ' +
               'una copia escaneada o impresa tampoco coincide. También puede ser un documento de antes de este registro: pide el PDF tal como salió de la app.';
  var SIN_RED = 'Revisa tu conexión y vuelve a intentarlo.';
  var esPdf = function(f){ return /pdf/i.test(String(f.type || '')) || /\.pdf$/i.test(String(f.name || '')); };
  var huellaDe = function(f){ return f.arrayBuffer().then(function(ab){ return crypto.subtle.digest('SHA-256', ab); }).then(hex); };
  var puedeCalcular = function(){
    if(window.crypto && crypto.subtle) return true;
    res.innerHTML = sello('ojo', '!', 'Este navegador no calcula huellas', 'Ábrelo en un navegador actualizado (Chrome, Edge, Safari o Firefox).');
    return false;
  };
  /* null si no se pudo consultar (sin señal o el servidor no respondió bien) */
  function pedir(h){
    return fetch(SB.url + '/rest/v1/rpc/sst_huella_ver', { method:'POST', headers:{ apikey:SB.key, Authorization:'Bearer ' + SB.key, 'Content-Type':'application/json' }, body:JSON.stringify({ p_hash:h }) })
      .then(function(r){ return r.json().catch(function(){ return null; }); })
      .then(function(d){ return (d && d.ok) ? d : null; }, function(){ return null; });
  }
  var cadenaOk = function(d){ return (d.registros || []).every(function(x){ return x.cadena_ok; }); };
  function consultar(h, nombre){
    res.innerHTML = '<p class="gris">Consultando…</p>';
    return pedir(h).then(function(d){
      var pie = '<div class="tarj"><h2>Huella de este archivo</h2>' + (nombre ? '<p class="gris" style="margin:0 0 4px">' + esc(nombre) + '</p>' : '') + '<div class="huella">' + esc(h) + '</div></div>';
      if(!d){ res.innerHTML = sello('ojo', '!', 'No se pudo consultar', SIN_RED) + pie; return; }
      if(!d.hallado){ res.innerHTML = sello('mal', '✕', 'No es un original registrado', NO_REG) + pie; return; }
      var r0 = d.registros[0] || {};
      var h2 = sello('ok', '✓', 'ES EL ORIGINAL', 'Este PDF es el mismo que salió de OBRASST el ' + hora(r0.creado) + ' (hora de Lima).');
      h2 += '<div class="tarj"><h2>Lo que dice el registro</h2><dl>' +
            '<dt>Documento</dt><dd>' + esc(TIPOS[r0.tipo] || r0.tipo || 'Documento') + '</dd>' +
            '<dt>Obra</dt><dd>' + esc(r0.obra || '—') + '</dd>' +
            (r0.empresa && r0.empresa !== r0.obra ? '<dt>Empresa</dt><dd>' + esc(r0.empresa) + '</dd>' : '') +
            '<dt>Registrado</dt><dd>' + hora(r0.creado) + '</dd>' +
            '<dt>Cadena de la obra</dt><dd>' + (cadenaOk(d) ? '<span class="pill ok">Completa</span>' : '<span class="pill mal">Con un eslabón que no cuadra</span>') + '</dd></dl></div>';
      res.innerHTML = h2 + pie;
    });
  }
  function revisar(f){
    if(!f || !puedeCalcular()) return;
    if(!esPdf(f)){ res.innerHTML = sello('mal', '✕', 'Esto no es un PDF', 'Elige el PDF tal como te llegó: una foto o una captura del documento no se puede comprobar.'); return; }
    res.innerHTML = '<p class="gris">Calculando la huella…</p>';
    huellaDe(f).then(function(h){ return consultar(h, f.name); }, function(){ res.innerHTML = sello('ojo', '!', 'No se pudo leer el archivo', 'Prueba elegirlo otra vez.'); });
  }
  /* ── varios a la vez ── */
  var ETQ = { no:['mal', 'No registrado'], nopdf:['mal', 'No es PDF'], cad:['ojo', 'Original · eslabón que no cuadra'],
              err:['ojo', 'Sin consultar'], leer:['ojo', 'No se pudo leer'], ok:['ok', 'Original'] };
  var ORDEN = { no:0, nopdf:0, cad:1, err:1, leer:1, ok:2 };
  function revisarVarios(lista){
    if(!puedeCalcular()) return;
    var fs = lista.slice(0, MAX), sobran = lista.length - fs.length, filas = [], i = 0;
    (function paso(){
      if(i >= fs.length){ pintarLote(filas, sobran); return; }
      var f = fs[i++];
      res.innerHTML = '<p class="gris">Revisando ' + i + ' de ' + fs.length + '…</p>';
      if(!esPdf(f)){ filas.push({ n:f.name, e:'nopdf' }); paso(); return; }
      huellaDe(f).then(function(h){
        return pedir(h).then(function(d){
          if(!d) filas.push({ n:f.name, h:h, e:'err' });
          else if(!d.hallado) filas.push({ n:f.name, h:h, e:'no' });
          else filas.push({ n:f.name, h:h, e:cadenaOk(d) ? 'ok' : 'cad', r:d.registros[0] || {} });
        });
      }, function(){ filas.push({ n:f.name, e:'leer' }); }).then(paso);
    })();
  }
  function pintarLote(filas, sobran){
    var n = filas.length, cuenta = function(es){ return filas.filter(function(x){ return es.indexOf(x.e) >= 0; }); };
    var malos = cuenta(['no', 'nopdf']), dudas = cuenta(['err', 'leer']), buenos = cuenta(['ok', 'cad']);
    var cab;
    if(malos.length) cab = sello('mal', '✕', malos.length + ' de ' + n + (malos.length === 1 ? ' no es un original registrado' : ' no son originales registrados'),
                                 'Están primero, en rojo. Si le cambiaron algo a un PDF, aunque sea una coma, la huella ya es otra; una copia escaneada o impresa tampoco coincide.');
    else if(dudas.length) cab = sello('ojo', '!', 'No se pudieron revisar ' + dudas.length + ' de ' + n, SIN_RED);
    else cab = sello('ok', '✓', 'LOS ' + n + ' SON ORIGINALES', 'Todos son los mismos PDF que salieron de OBRASST.');
    var orden = filas.map(function(x, k){ return [x, k]; }).sort(function(a, b){ return (ORDEN[a[0].e] - ORDEN[b[0].e]) || (a[1] - b[1]); });
    var lis = orden.map(function(par){
      var x = par[0], t = ETQ[x.e], r = x.r, det = '';
      if(r) det = [TIPOS[r.tipo] || r.tipo || 'Documento', r.obra, r.empresa && r.empresa !== r.obra ? r.empresa : '', hora(r.creado)].filter(Boolean).map(esc).join(' · ');
      return '<li class="' + t[0] + '"><span class="pill ' + t[0] + '">' + esc(t[1]) + '</span><b>' + esc(x.n) + '</b>' + (det ? '<span class="gris">' + det + '</span>' : '') + '</li>';
    }).join('');
    var nombres = function(xs){ return xs.map(function(x){ return x.n; }).join(', '); };
    var resumen = 'Revisión de ' + n + ' archivos en obrasstapp.com/verificar (' + hora(new Date()) + ', hora de Lima): ' +
                  buenos.length + (buenos.length === 1 ? ' original' : ' originales') +
                  (malos.length ? '; no registrados: ' + nombres(malos) : '') +
                  (dudas.length ? '; sin revisar: ' + nombres(dudas) : '') + '.';
    res.innerHTML = cab +
      '<div class="acciones"><button type="button" class="bt" id="copiar">Copiar el resumen</button>' +
      '<span class="gris">' + buenos.length + (buenos.length === 1 ? ' original · ' : ' originales · ') + malos.length + (malos.length === 1 ? ' no registrado' : ' no registrados') + (dudas.length ? ' · ' + dudas.length + ' sin revisar' : '') + '</span></div>' +
      (sobran > 0 ? '<p class="gris">Se revisaron los primeros ' + MAX + '; ' + (sobran === 1 ? 'elige el que falta' : 'elige los otros ' + sobran) + ' en otra tanda.</p>' : '') +
      '<ul class="lote">' + lis + '</ul>';
    var bt = document.getElementById('copiar');
    bt.addEventListener('click', function(){
      var mostrar = function(){
        if(document.getElementById('copia')) return;
        var ta = document.createElement('textarea'); ta.id = 'copia'; ta.className = 'copia'; ta.readOnly = true; ta.value = resumen;
        bt.parentNode.insertAdjacentElement('afterend', ta); ta.focus(); ta.select();
      };
      try{
        if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(resumen).then(function(){ bt.textContent = 'Copiado ✓'; }, mostrar);
        else mostrar();
      }catch(e){ mostrar(); }
    });
  }
  function elegir(fl){
    var xs = Array.prototype.slice.call(fl || []);
    if(xs.length > 1) revisarVarios(xs); else revisar(xs[0]);
  }
  arch.addEventListener('change', function(){ var xs = Array.prototype.slice.call(arch.files || []); arch.value = ''; elegir(xs); });
  ['dragenter', 'dragover'].forEach(function(ev){ caja.addEventListener(ev, function(e){ e.preventDefault(); caja.classList.add('encima'); }); });
  ['dragleave', 'drop'].forEach(function(ev){ caja.addEventListener(ev, function(e){ e.preventDefault(); caja.classList.remove('encima'); }); });
  caja.addEventListener('drop', function(e){ elegir(e.dataTransfer && e.dataTransfer.files); });
  var q = (/[?&]h=([0-9a-fA-F]{64})(&|$)/.exec(location.search || '') || [])[1];
  if(q) consultar(q.toLowerCase(), '');
})();
