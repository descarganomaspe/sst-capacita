/* OBRASST · la Consola del creador · 28/09/2026
   Tres cosas, nada más:
   1 · que la consola abra aunque la señal esté mala: sus propios
       archivos (la página, el manifiesto, los íconos) se piden a la red
       y, si no contesta en 4 s, se sirve lo último guardado. Los datos
       NO se guardan: vienen del servidor cada vez.
   2 · los avisos de fallas (Web Push) que manda la función aviso-falla.
   3 · al tocar un aviso, abrir la consola en «Fallas».
   Solo toca lo que está dentro de consola/: la app y el portal tienen
   sus propios service workers. */
var CACHE = 'consola-1';
var BASE = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png',
            './icono-mask-512.png', './icono-insignia.png', './apple-touch-icon.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(BASE.map(function(u){ return c.add(new Request(u, { cache:'reload' })).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  /* solo las cajas de la consola: las de la app no son nuestras */
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(/^consola-/.test(k) && k !== CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function conTope(req, ms){
  return new Promise(function(ok, mal){
    var t = setTimeout(function(){ mal(new Error('tope')); }, ms);
    fetch(req).then(function(r){ clearTimeout(t); ok(r); }, function(e){ clearTimeout(t); mal(e); });
  });
}
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var u; try{ u = new URL(e.request.url); }catch(_x){ return; }
  if(u.origin !== self.location.origin) return;                 /* el servidor de datos, las letras: directo */
  if(e.request.url.indexOf(self.registration.scope) !== 0) return;  /* fuera de consola/: no es nuestro */
  if(/\/sw\.js$/.test(u.pathname)) return;
  var esNav = (e.request.mode === 'navigate');
  e.respondWith(conTope(e.request, esNav ? 4000 : 12000).then(function(r){
    if(r && r.ok){ var c = r.clone(); caches.open(CACHE).then(function(x){ try{ x.put(e.request, c); }catch(_p){} }); }
    return r;
  }).catch(function(){
    return caches.match(e.request, { ignoreSearch:true }).then(function(r){
      if(r) return r;
      if(esNav) return caches.match('./index.html');
      return Response.error();
    });
  }));
});

/* ── los avisos ─────────────────────────────────────────────────────── */
function _hash(ruta){
  /* la ruta viene «desde la raíz» (consola/#fallas; los viejos, portal/#fallas):
     aquí solo importa a qué sección va */
  var h = String(ruta || '').split('#')[1] || 'fallas';
  return /^(resumen|fallas|ventas|empresas|codigos|avisos)$/.test(h) ? h : 'fallas';
}
self.addEventListener('push', function(e){
  var d = {};
  try{ d = e.data ? e.data.json() : {}; }catch(_j){ try{ d = { cuerpo: e.data ? e.data.text() : '' }; }catch(_t){ d = {}; } }
  var s = self.registration.scope;
  e.waitUntil(self.registration.showNotification(String(d.titulo || 'OBRASST').slice(0, 120), {
    body: String(d.cuerpo || 'Tienes un aviso nuevo.').slice(0, 400),
    icon: new URL('icono-192.png', s).href,
    badge: new URL('icono-insignia.png', s).href,
    tag: String(d.tag || 'obrasst-aviso'),
    renotify: true,
    lang: 'es',
    data: { ruta: String(d.ruta || 'consola/#fallas') }
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = self.registration.scope + '#' + _hash(e.notification.data && e.notification.data.ruta);
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(lista){
    for(var i = 0; i < lista.length; i++){
      var c = lista[i];
      if(c.url.indexOf(self.registration.scope) === 0 && 'focus' in c){
        try{ c.postMessage({ tipo:'ir', vista:_hash(e.notification.data && e.notification.data.ruta) }); }catch(_p){}
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
