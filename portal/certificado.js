/* OBRASST · la página pública del QR (2/11/2026): ?k=<código> verifica un certificado de un aliado de servicios (vigente, vencido
   o anulado, quién lo emitió, su huella) y ?a=<código> dice si un equipo, elemento, instrumento o vehículo está habilitado.
   Lo responde el servidor (erp_srv_verificar, abierta a cualquiera): sin precios, sin datos de salud y con el documento tapado. */
'use strict';
(function(){
  var SB = { url:'https://gwjjkknuiumgysezeatz.supabase.co', key:'sb_publishable_7fLOMEbxMHW9ButihszpoQ_gkfNKnnx' };
  var m = document.getElementById('m'), q = location.search || '';
  var k = (/[?&](?:k|a)=([0-9a-f]{32})(&|$)/.exec(q) || [])[1];
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); };
  var f = function(d){ if(!d) return '—'; var p = String(d).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : esc(d); };
  var num = function(n, d){ var v = Number(n); return isFinite(v) ? v.toLocaleString('es-PE', { maximumFractionDigits:d == null ? 2 : d }) : esc(n); };
  var RES = { ok:'Conforme', observado:'Observado', critico:'Crítico', aprobado:'Aprobado', rechazado:'Rechazado', bloqueado:'Bloqueado', conforme:'Conforme', no_conforme:'No conforme',
              apto:'Apto', apto_restr:'Apto con restricciones', no_apto:'No apto' };
  var junta = function(o, ks){ return ks.map(function(x){ return o && o[x]; }).filter(Boolean).join(' · '); };
  var fila = function(l, v){ return v == null || v === '' ? '' : '<dt>' + esc(l) + '</dt><dd>' + esc(v) + '</dd>'; };
  var sello = function(c, ic, t, p){ return '<div class="sello ' + c + '" role="status"><span class="ic" aria-hidden="true">' + ic + '</span><div><b>' + esc(t) + '</b>' + (p ? '<p>' + esc(p) + '</p>' : '') + '</div></div>'; };
  if(!k){ m.innerHTML = '<h1>Enlace no válido</h1><p class="gris">Escanea otra vez el QR del certificado o del equipo.</p>'; return; }
  fetch(SB.url + '/rest/v1/rpc/erp_srv_verificar', { method:'POST', headers:{ apikey:SB.key, Authorization:'Bearer ' + SB.key, 'Content-Type':'application/json' }, body:JSON.stringify({ p_k:k }) })
    .then(function(r){ return r.json().catch(function(){ return null; }); }).then(function(d){
      if(!d || !d.ok){ m.innerHTML = '<h1>No encontramos este código</h1><p class="gris">No es un certificado ni un equipo registrado en OBRASST. Revisa que el QR esté completo o consulta a quien te lo entregó.</p>'; return; }
      var em = d.emisor || {}, emisor = (em.razon || '') + (em.ruc ? ' · RUC ' + em.ruc : ''), h = '';
      if(d.clase === 'certificado'){
        var x = d.detalle || {};
        h += '<h1>' + esc(d.titulo || 'Certificado') + '</h1><p class="gris">N.° <span class="mono">' + esc(d.numero) + '</span></p>';
        h += d.estado === 'anulado' ? sello('mal', '✕', 'ANULADO', 'Quien lo emitió lo anuló' + (d.motivo_anulacion ? ': ' + d.motivo_anulacion : '.') + ' No vale.') :
             d.estado === 'vencido' ? sello('ojo', '!', 'VENCIDO', 'Venció el ' + f(d.hasta) + '.') :
             sello('ok', '✓', 'VIGENTE', d.hasta ? 'Vale hasta el ' + f(d.hasta) + '.' : 'Sin fecha de vencimiento.');
        h += '<div class="tarj"><h2>Lo que certifica</h2><dl>' + fila('Emitido por', emisor) + fila('Vigencia', d.hasta ? 'Del ' + f(d.desde) + ' al ' + f(d.hasta) : d.desde ? 'Desde el ' + f(d.desde) : '') +
          fila('Resultado', RES[x.aptitud] || RES[d.resultado] || d.resultado) + fila('Norma', d.norma) +
          fila('Firma', d.profesional ? junta(d.profesional, ['nombre', 'colegiatura']) : '') +
          fila('Trabajador', x.trabajador ? junta(x.trabajador, ['nombre', 'doc']) : '') + fila('Elemento', x.elemento ? junta(x.elemento, ['tipo', 'codigo', 'tag']) : '') +
          fila('Carga de trabajo segura', x.wll_t != null ? num(x.wll_t) + ' t' : '') + fila('Color del periodo', x.color) +
          fila('Instrumento', x.instrumento ? junta(x.instrumento, ['tipo', 'codigo', 'marca', 'modelo', 'serie']) : '') + fila('Equipo', x.equipo ? junta(x.equipo, ['tipo', 'codigo', 'marca', 'modelo', 'placa']) : '') +
          fila('Vehículo', x.vehiculo ? junta(x.vehiculo, ['codigo', 'placa']) : '') + fila('Póliza', x.poliza ? junta(x.poliza, ['tipo', 'aseguradora', 'numero']) : '') +
          fila('Periodo', x.periodo ? String(x.periodo).split('-').reverse().join('/') : '') + fila('Tema', x.tema) + fila('Participantes', x.participantes ? String(x.participantes) : '') +
          fila('Servicio', x.servicio) + fila('Manifiesto de residuos peligrosos', x.manifiesto) + '</dl></div>';
        h += '<div class="tarj"><h2>Huella del documento</h2><p class="gris" style="margin:0">El PDF de este certificado lleva esta misma huella (SHA-256). Si no coincide, el documento que tienes en la mano fue cambiado.</p><p class="huella">' + esc(d.huella) + '</p></div>';
      } else {
        var docs = d.documentos || [], hoy = d.hoy || '', venc = docs.filter(function(x){ return x.vence && x.vence < hoy; }), ctrl = d.prox_control && d.prox_control < hoy;
        h += '<h1>' + esc(d.tipo || 'Equipo') + ' · <span class="mono">' + esc(d.codigo) + '</span></h1><p class="gris">' + esc(emisor) + '</p>';
        h += d.estado === 'bloqueado' ? sello('mal', '✕', 'BLOQUEADO: NO SE USA', d.motivo || '') : d.estado === 'baja' ? sello('neu', '–', 'DE BAJA', d.motivo || '') :
             venc.length || ctrl ? sello('mal', '!', 'NO HABILITADO', [venc.length ? 'Documento vencido: ' + venc.map(function(x){ return x.n; }).join(', ') : '', ctrl ? 'Control vencido el ' + f(d.prox_control) : ''].filter(Boolean).join(' · ') + '.') :
             d.estado === 'observado' ? sello('ojo', '!', 'CON OBSERVACIONES', 'Su proveedor registró algo por corregir.') :
             sello('ok', '✓', 'HABILITADO', 'Con sus documentos al día' + (d.prox_control ? ' y su próximo control el ' + f(d.prox_control) : '') + '.');
        h += '<div class="tarj"><h2>Documentos</h2>' + (docs.length ? '<dl>' + docs.map(function(x){ return '<dt>' + esc(x.n) + '</dt><dd>' + (x.vence ? '<span class="pill ' + (x.vence < hoy ? 'mal' : 'ok') + '">' +
          (x.vence < hoy ? 'venció ' : 'hasta ') + f(x.vence) + '</span>' : 'Sin vencimiento') + '</dd>'; }).join('') + '</dl>' : '<p class="gris" style="margin:0">Su proveedor no registró documentos con vencimiento.</p>') + '</div>';
        if(d.certificado) h += '<div class="tarj"><h2>Último certificado</h2><p style="margin:0 0 10px">N.° <span class="mono">' + esc(d.certificado.numero) + '</span>' + (d.certificado.hasta ? ' · hasta el ' + f(d.certificado.hasta) : '') + '</p>' +
          (/^[0-9a-f]{32}$/.test(d.certificado.k || '') ? '<a class="bt" href="certificado.html?k=' + d.certificado.k + '">Verificar el certificado</a>' : '') + '</div>';
      }
      h += '<p class="gris">Consultado el ' + f(d.hoy) + ' en OBRASST. Lo registra el proveedor; OBRASST guarda quién lo emitió y cuándo.</p>';
      m.innerHTML = h;
      document.title = (d.clase === 'certificado' ? (d.titulo || 'Certificado') + ' ' + (d.numero || '') : (d.codigo || 'Equipo')) + ' · Verificación OBRASST';
    }, function(){ m.innerHTML = '<h1>Sin conexión</h1><p class="gris">Revisa tu internet y vuelve a escanear.</p>'; });
})();
