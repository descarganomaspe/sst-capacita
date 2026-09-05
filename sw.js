var CACHE = 'sstc-0b3baeca4e-b';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if (k !== CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  /* SOLO lo nuestro. Antes se cacheaba TODO lo que pedia la app,
     incluidas las respuestas del servidor de datos: sin senal se
     servia la copia vieja como si fuera de ahora -un trabajador
     dado de baja volvia a aparecer- y ademas quedaban guardados en
     el celular datos que no tienen por que quedar guardados ahi.
     El service worker existe para que la APP abra sin senal, no
     para hacerle de cache a la base de datos. */
  var _mio; try{ _mio = (new URL(e.request.url)).origin === self.location.origin; }
  catch(_x){ _mio = false; }
  if (!_mio) return;
  e.respondWith(fetch(e.request).then(function(r){
    var c = r.clone(); caches.open(CACHE).then(function(x){ try{ x.put(e.request, c); }catch(err){} });
    return r;
  }).catch(function(){ return caches.match(e.request); }));
});
