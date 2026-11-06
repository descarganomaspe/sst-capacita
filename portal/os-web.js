/* ══════════════════════════════════════════════════════════════════
   OBRASST OS en la web pública (2/11/2026): el demostrador del
   Compliance Engine (cargo → riesgos → normativa → lo que exige), el
   detector de riesgo SUNAFIL (la escala oficial del D.S. 019-2006-TR,
   art. 48.1, con la UIT 2026) y los interruptores de cada sección
   (os_flags_publicos: si OBRASST apaga una, no se muestra). Lo que se
   ve como «ejemplo» lo dice. Lo usan la portada, estado.html y
   marketplace.html (con OS_CATALOGO de os-catalogo.js).
   ════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var C = window.OS_CATALOGO || { normas:{}, sectores:[] };
  var UIT = 5500;   /* UIT 2026 (MEF, El Peruano). La misma de os_param en el servidor */
  /* D.S. 019-2006-TR, art. 48.1 (cuadros del D.S. 008-2020-TR), en UIT: desde cuántos afectados */
  var MULTAS = {
    micro:{ r:[1,2,3,4,5,6,7,8,9,10], grave:[0.11,0.14,0.16,0.18,0.20,0.25,0.29,0.34,0.38,0.45], muy_grave:[0.23,0.25,0.29,0.32,0.36,0.41,0.47,0.54,0.61,0.68] },
    pequena:{ r:[1,6,11,21,31,41,51,61,71,100], grave:[0.45,0.59,0.77,0.97,1.26,1.62,2.09,2.43,2.81,4.50], muy_grave:[0.77,0.99,1.28,1.64,2.14,2.75,3.56,4.32,4.95,7.65] },
    no_mype:{ r:[1,11,26,51,101,201,301,401,501,1000], grave:[1.57,3.92,5.22,6.53,7.83,10.45,13.06,18.28,20.89,26.12], muy_grave:[2.63,5.25,7.88,11.56,14.18,18.39,23.64,31.52,42.03,52.53] } };
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function $(id){ return document.getElementById(id); }
  function soles(n){ return 'S/ ' + (Math.round(n * 100) / 100).toLocaleString('es-PE', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
  function multa(tam, grav, n){ var t = MULTAS[tam] || MULTAS.no_mype, i, k = 0; if(!(n >= 1)) return 0; for(i = 0; i < t.r.length; i++) if(n >= t.r[i]) k = i; return t[grav][k]; }
  /* en UIT con dos decimales, sin errores de coma flotante: todo en centésimos */
  function suma(a){ return a.reduce(function(s, x){ return s + Math.round(x * 100); }, 0) / 100; }
  window.OSWEB = { multa:multa, suma:suma, UIT:UIT };

  /* ── los interruptores: lo apagado no se muestra ── */
  function flags(){
    var sb = window.SB || window.OS_SB; if(!sb || !window.fetch) return;
    fetch(sb.url + '/rest/v1/rpc/os_flags_publicos', { method:'POST', headers:{ apikey:sb.key, 'Content-Type':'application/json' }, body:'{}' })
      .then(function(r){ return r.ok ? r.json() : null; }).then(function(f){
        if(!f || typeof f !== 'object') return;
        [].forEach.call(document.querySelectorAll('[data-os-flag]'), function(el){ if(f[el.getAttribute('data-os-flag')] === false) el.hidden = true; });
        [].forEach.call(document.querySelectorAll('[data-os-rubro-flag]'), function(el){ var on = f[el.getAttribute('data-os-rubro-flag')] === true; el.setAttribute('data-activo', on ? 'si' : 'no'); });
        document.dispatchEvent(new CustomEvent('os-flags', { detail:f }));
      }).catch(function(){});
  }

  /* ── el demostrador del Compliance Engine ── */
  var CARGOS = {}, DEMO = ['construccion.soldador', 'construccion.operador_maquinaria', 'industria.electricista', 'hidrocarburos.tecnico_hidrocarburos', 'salud.enfermeria', 'educacion.docente'];
  (C.sectores || []).forEach(function(s){ (s.cargos || []).forEach(function(c){ CARGOS[s.k + '.' + c.k] = { s:s, c:c }; }); });
  function norma(k){ return (C.normas || {})[k] || ''; }
  function items(arr, f){ return (arr || []).map(function(x){ return '<li>' + f(x) + '</li>'; }).join(''); }
  function conNorma(x){ return esc(x.t) + (x.std ? ' <small>' + esc(x.std) + '</small>' : '') + (x.n ? ' <small>' + esc(norma(x.n)) + '</small>' : ''); }
  function demoPinta(k){
    var x = CARGOS[k]; if(!x) return;
    var c = x.c, caja = $('osm-res'); if(!caja) return;
    [].forEach.call(document.querySelectorAll('[data-osm]'), function(b){ var on = b.getAttribute('data-osm') === k; b.className = on ? 'on' : ''; b.setAttribute('aria-pressed', String(on)); });
    caja.innerHTML =
      '<div class="osm-paso"><small>1 · Cargo</small><b>' + esc(c.n) + '</b><span>' + esc(x.s.n) + '</span></div>' +
      '<div class="osm-paso"><small>2 · Riesgos</small><ul>' + items(c.riesgos, esc) + '</ul></div>' +
      '<div class="osm-paso"><small>3 · Normativa</small><ul>' + items(c.normas, function(n){ return esc(norma(n)); }) + items(x.s.normas.filter(function(n){ return c.normas.indexOf(n) < 0; }), function(n){ return esc(norma(n)); }) + '</ul></div>' +
      '<div class="osm-paso osm-exige"><small>4 · Lo que exige, para cada trabajador</small>' +
        ((c.epp || []).length ? '<h4>EPP</h4><ul>' + items(c.epp, conNorma) + '</ul>' : '') +
        '<h4>Exámenes médicos (EMO)</h4><ul>' + items(c.emo, conNorma) + '</ul>' +
        '<h4>SCTR</h4><ul>' + items([c.sctr], conNorma) + '</ul>' +
        '<h4>Capacitación</h4><ul>' + items(c.cap, conNorma) + '</ul>' +
        (((c.permisos || []).concat(c.insp || [])).length ? '<h4>Permisos e inspecciones</h4><ul>' + items((c.permisos || []).concat(c.insp || []), conNorma) + '</ul>' : '') +
      '</div>';
  }
  function demo(){
    var bts = $('osm-cargos'); if(!bts) return;
    bts.innerHTML = DEMO.filter(function(k){ return CARGOS[k]; }).map(function(k, i){ return '<button type="button" data-osm="' + k + '" aria-pressed="' + (i === 0) + '">' + esc(CARGOS[k].c.n) + '</button>'; }).join('');
    bts.onclick = function(ev){ var b = ev.target.closest('[data-osm]'); if(b) demoPinta(b.getAttribute('data-osm')); };
    var otros = $('osm-otros');
    if(otros){
      otros.innerHTML = '<option value="">Ver otro cargo…</option>' + (C.sectores || []).map(function(s){ return '<optgroup label="' + esc(s.n) + '">' + s.cargos.map(function(c){ return '<option value="' + esc(s.k + '.' + c.k) + '">' + esc(c.n) + '</option>'; }).join('') + '</optgroup>'; }).join('');
      otros.onchange = function(){ if(this.value) demoPinta(this.value); };
    }
    demoPinta(DEMO[0]);
  }

  /* ── el detector de riesgo SUNAFIL ── */
  function detector(){
    var f = $('osr-form'); if(!f) return;
    function calc(){
      var tam = $('osr-tam').value, cap = +$('osr-cap').value || 0, emo = +$('osr-emo').value || 0, sctr = +$('osr-sctr').value || 0;
      var P = [], u;
      if(cap > 0){ u = multa(tam, 'grave', cap); P.push(['Sin capacitación sobre los riesgos del puesto', '27.8', 'Grave', cap, u]); }
      if(emo > 0){ u = multa(tam, 'muy_grave', emo); P.push(['Sin examen médico ocupacional vigente', '28.13', 'Muy grave', emo, u]); }
      if(sctr > 0){ u = suma(Array(sctr).fill(multa(tam, 'grave', 1))); P.push(['Sin SCTR (una infracción por trabajador)', '27.15', 'Grave', sctr, u]); }
      var tot = suma(P.map(function(p){ return p[4]; })), nivel = emo > 0 ? ['ALTO', 'osr-alto'] : P.length ? ['MEDIO', 'osr-medio'] : ['BAJO', 'osr-bajo'];
      $('osr-res').innerHTML = '<div class="osr-nivel ' + nivel[1] + '">RIESGO DE MULTA: ' + nivel[0] + (tot ? ' · ' + soles(tot * UIT) : '') + '</div>' +
        (P.length ? '<ul>' + P.map(function(p){ return '<li><b>' + p[3] + '</b> · ' + esc(p[0]) + ' <small>(art. ' + p[1] + ', ' + p[2].toLowerCase() + ': ' + p[4] + ' UIT)</small></li>'; }).join('') + '</ul>' : '<p>Con lo que marcaste, no hay multa posible por estas tres causas.</p>') +
        '<p class="osr-nota">' + tot + ' UIT × S/ ' + UIT.toLocaleString('es-PE') + ' (UIT 2026). Escala del D.S. 019-2006-TR, art. 48.1. Es lo que podría proponer una inspección; no incluye reducciones por subsanar.</p>';
    }
    f.oninput = calc; f.onchange = calc; calc();
  }

  /* ── Camino C (estado.html): lo que la ley le pide a una empresa para entrar a una obra, según su sector y su
     tamaño. La empresa marca lo que tiene y ve lo que le falta y quién se lo resuelve. Aquí no se calcula con
     datos de nadie: con su cuenta, OBRASST lo saca de lo que registra, trabajador por trabajador. ── */
  function rucMalo(r){
    r = String(r || '').replace(/\D/g, '');
    if(r.length !== 11) return 'El RUC tiene 11 dígitos.';
    if(!/^(10|15|16|17|20)/.test(r)) return 'Un RUC del Perú empieza por 10, 15, 16, 17 o 20.';
    var w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2], s = 0, i; for(i = 0; i < 10; i++) s += (+r.charAt(i)) * w[i];
    var d = 11 - (s % 11); if(d === 10) d = 0; if(d === 11) d = 1;
    return d === +r.charAt(10) ? '' : 'Ese RUC no pasa el dígito verificador de SUNAT.';
  }
  var HC_RUBRO = { epp:'EPP', sctr:'SCTR', emo:'exámenes médicos', consultor:'capacitación' };
  function hcItems(sk, n){
    var s = (C.sectores || []).filter(function(x){ return x.k === sk; })[0]; if(!s) return [];
    var L = [
      { k:'pol', g:'base', t:'Política de seguridad y salud, firmada y difundida', n:'L29783', r:'' },
      { k:'iperc', g:'base', t:'IPERC de cada puesto y mapa de riesgos', n:'L29783', r:'' },
      { k:'prog', g:'base', t:'Programa anual de seguridad y salud, con su programa de capacitación', n:'DS005', r:'' },
      n >= 20 ? { k:'comite', g:'base', t:'Comité de seguridad y salud elegido por los trabajadores (20 trabajadores o más)', n:'L29783', r:'' }
              : { k:'comite', g:'base', t:'Supervisor de seguridad y salud elegido por los trabajadores (menos de 20)', n:'L29783', r:'' }];
    if(n >= 20) L.push({ k:'risst', g:'base', t:'Reglamento interno de seguridad y salud (20 trabajadores o más)', n:'L29783', r:'' });
    L.push({ k:'emo', g:'base', t:'Exámenes médicos de ingreso, periódicos y de retiro, según el puesto', n:'RM312', r:'emo' },
      { k:'cap', g:'base', t:'Inducción antes de empezar y al menos 4 capacitaciones al año', n:'L29783', r:'consultor' },
      { k:'epp', g:'base', t:'EPP para cada riesgo, entregado con su registro', n:'L29783', r:'epp' },
      { k:'reg', g:'base', t:'Registros obligatorios al día: accidentes, exámenes médicos, inspecciones, capacitaciones y más', n:'RM050', r:'' },
      { k:'sctr', g:'base', t:s.sctr ? 'SCTR salud y pensión de todo el personal, vigente todo el tiempo que trabaja' : 'SCTR salud y pensión, si la actividad está en el Anexo 5 del D.S. 003-98-SA', n:'DS003', r:'sctr' });
    if(s.k === 'construccion') L.push({ k:'psst', g:'sec', t:'Plan de seguridad y salud en el trabajo de cada obra', n:'G050', r:'' });
    var visto = {};
    (s.cargos || []).forEach(function(c){ (c.cap || []).forEach(function(x){
      if(!x.k || x.k === 'induc' || visto[x.t]) return; visto[x.t] = 1;
      /* V7.10 · si el tema ya trae su paréntesis (25 kg…), el cargo va con una raya */
      var quien = c.n.replace(/\s*\(.*\)\s*$/, '').toLowerCase();
      L.push({ k:'cap-' + Object.keys(visto).length, g:'sec', t:'Capacitación en ' + x.t.charAt(0).toLowerCase() + x.t.slice(1) + (/\)$/.test(x.t) ? ' — ' + quien : ' (' + quien + ')'), n:x.n, r:'consultor' }); }); });
    return L;
  }
  function homologa(){
    var f = $('hc-form'); if(!f) return;
    var sec = $('hc-sec'), trab = $('hc-trab'), ruc = $('hc-ruc'), lista = $('hc-lista'), res = $('hc-res'), tiene = { pol:1, iperc:1, emo:1, epp:1 }, ejemplo = true;
    sec.innerHTML = (C.sectores || []).map(function(s){ return '<option value="' + esc(s.k) + '"' + (s.k === 'construccion' ? ' selected' : '') + '>' + esc(s.n) + '</option>'; }).join('');
    var secAntes = sec.value;
    function pinta(){
      /* lo marcado de un sector no vale para otro */
      if(sec.value !== secAntes){ Object.keys(tiene).forEach(function(k){ if(/^(cap-|psst)/.test(k)) delete tiene[k]; }); secAntes = sec.value; }
      var n = Math.max(1, Math.floor(+trab.value || 1)), L = hcItems(sec.value, n), s = (C.sectores || []).filter(function(x){ return x.k === sec.value; })[0] || { n:'' };
      function fila(x){ var on = !!tiene[x.k];
        return '<label class="hc-it' + (on ? ' si' : '') + '"><input type="checkbox" data-hc="' + esc(x.k) + '"' + (on ? ' checked' : '') + '><span><b>' + esc(x.t) + '</b>' + (x.n ? '<small>' + esc(norma(x.n)) + '</small>' : '') + '</span></label>'; }
      lista.innerHTML = '<h4>Para toda empresa</h4>' + L.filter(function(x){ return x.g === 'base'; }).map(fila).join('') +
        (L.some(function(x){ return x.g === 'sec'; }) ? '<h4>Del sector: ' + esc(s.n) + '</h4>' + L.filter(function(x){ return x.g === 'sec'; }).map(fila).join('') : '');
      var faltan = L.filter(function(x){ return !tiene[x.k]; }), listos = L.length - faltan.length, rubros = [];
      faltan.forEach(function(x){ if(x.r && rubros.indexOf(x.r) < 0) rubros.push(x.r); });
      var rm = ruc.value.trim() ? rucMalo(ruc.value) : '', rv = ruc.value.replace(/\D/g, '');
      $('hc-ruc-m').textContent = ruc.value.trim() ? (rm || 'RUC válido.') : 'Opcional. Solo se revisa aquí, con el dígito verificador de SUNAT.';
      $('hc-ruc-m').className = ruc.value.trim() ? (rm ? 'mal' : 'ok') : '';
      var txt = 'Hola OBRASST, quiero cerrar las brechas de la empresa' + (rv && !rm ? ' (RUC ' + rv + ')' : '') + ' para entrar a una obra. Sector: ' + s.n + '. Trabajadores: ' + n + '. Me falta: ' + faltan.map(function(x){ return x.t; }).join('; ') + '.';
      res.innerHTML = '<div class="hc-cifra"><b>' + listos + ' de ' + L.length + '</b><span>listos para entrar a la obra</span></div>' +
        '<div class="hc-barra" aria-hidden="true"><i style="width:' + Math.round(100 * listos / L.length) + '%"></i></div>' +
        (ejemplo ? '<p class="hc-ej">Es un ejemplo: lo marcado se cambia por lo que tiene la empresa.</p>' : '') +
        (faltan.length ? '<h4>Falta (' + faltan.length + ')</h4><ul>' + faltan.map(function(x){
          return '<li>' + esc(x.t) + ' <a href="' + (x.r ? 'marketplace.html?r=' + x.r : 'index.html#acceso') + '">' + (x.r ? 'Aliados de ' + HC_RUBRO[x.r] + ' ›' : 'Se arma en OBRASST ›') + '</a></li>'; }).join('') + '</ul>'
          : '<p class="hc-ok">Con lo marcado, la empresa tiene todo lo de esta lista. En la obra se verifica trabajador por trabajador: con OBRASST se lleva al día.</p>') +
        '<div class="hc-acc">' + (rubros.length ? '<a class="bt casco" href="marketplace.html?r=' + rubros.join(',') + '">Resolver con aliados</a>' : '') +
        (typeof window.WA === 'string' && /^https:\/\/wa\.me\//.test(window.WA) && faltan.length ? '<a class="bt linea" href="' + esc(window.WA + encodeURIComponent(txt)) + '" target="_blank" rel="noopener">Pedir ayuda a OBRASST</a>' : '') + '</div>' +
        '<p class="hc-pie"><a href="index.html#os-riesgo">¿Cuánto podría costar en multas? ›</a></p>';
    }
    lista.addEventListener('change', function(ev){ var x = ev.target.getAttribute('data-hc'); if(!x) return; ejemplo = false; if(ev.target.checked) tiene[x] = 1; else delete tiene[x]; pinta(); });
    f.addEventListener('input', pinta); f.addEventListener('change', pinta); f.addEventListener('submit', function(ev){ ev.preventDefault(); });
    pinta();
  }
  window.OSWEB.rucMalo = rucMalo; window.OSWEB.hcItems = hcItems;

  function arrancar(){ demo(); detector(); homologa(); flags(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
