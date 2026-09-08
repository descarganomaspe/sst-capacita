var CACHE = 'sstc-09bba04f6b-c';
/* ══ LO QUE SE GUARDA AL INSTALAR ══
   Antes install no guardaba nada: el SW viejo servia el index nuevo por
   red, lo metia en el cache VIEJO, y al activarse el SW nuevo borraba ese
   cache. La primera apertura sin señal despues de cada publicacion daba
   pantalla en blanco (y la primerisima instalacion tambien). Ahora la app
   entera se guarda en install, antes de activar. */
var BASE = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png',
            './icono-mask-192.png', './icono-mask-512.png', './apple-touch-icon.png', './fondo.jpg'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    /* uno por uno: si un icono falta, no se cae la instalacion entera */
    return Promise.all(BASE.map(function(u){ return c.add(new Request(u, {cache:'reload'})).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if (k !== CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
/* con 2G, un fetch sin tope espera minutos antes de caer al cache:
   4 s para la app y despues se sirve lo guardado */
function conTope(req, ms){
  return new Promise(function(ok, mal){
    var t = setTimeout(function(){ mal(new Error('tope')); }, ms);
    fetch(req).then(function(r){ clearTimeout(t); ok(r); }, function(e){ clearTimeout(t); mal(e); });
  });
}
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
  var esNav = (e.request.mode === 'navigate');
  e.respondWith(conTope(e.request, esNav ? 4000 : 15000).then(function(r){
    if (r && r.ok){ var c = r.clone(); caches.open(CACHE).then(function(x){ try{ x.put(e.request, c); }catch(err){} }); }
    return r;
  }).catch(function(){
    /* ./?app=1, ./?atajo=kardex y ./ son la misma app: se ignora la query */
    return caches.match(e.request, {ignoreSearch:true}).then(function(r){
      if (r) return r;
      if (esNav) return caches.match('./index.html');
      return Response.error();
    });
  }));
});
