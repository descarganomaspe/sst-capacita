var CACHE = 'sstc-de616083fd-e';
/* caja aparte para lo que llega por «Compartir»: NO se borra al activar
   un service worker nuevo, porque el usuario puede estar compartiendo
   justo cuando entra una actualizacion. */
var COMP = 'sstc-compartido';
/* ══ LO QUE SE GUARDA AL INSTALAR ══
   Antes install no guardaba nada: el SW viejo servia el index nuevo por
   red, lo metia en el cache VIEJO, y al activarse el SW nuevo borraba ese
   cache. La primera apertura sin señal despues de cada publicacion daba
   pantalla en blanco (y la primerisima instalacion tambien). Ahora la app
   entera se guarda en install, antes de activar. */
var BASE = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png',
            './icono-mask-192.png', './icono-mask-512.png', './apple-touch-icon.png', './fondo.jpg',
            './intro.mp4'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    /* uno por uno: si un icono falta, no se cae la instalacion entera */
    return Promise.all(BASE.map(function(u){ return c.add(new Request(u, {cache:'reload'})).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){
      if (k !== CACHE && k !== COMP) return caches.delete(k);
    }));
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
  /* ══ LO QUE LLEGA DESDE «COMPARTIR» ════════════════════════════════
     Android manda aqui un POST multipart con el archivo adentro. No hay
     pagina que lo reciba: lo recoge el service worker, lo deja guardado
     y manda la app a abrirse con el id. Asi funciona aunque la app este
     cerrada y aunque no haya señal.
     Se responde con un redirect 303 porque es lo que el navegador
     espera despues de un POST: si no, queda la pagina colgada.      */
  var _u; try{ _u = new URL(e.request.url); }catch(_x){ _u = null; }
  if (_u && e.request.method === 'POST' && /__compartir\/?$/.test(_u.pathname)){
    e.respondWith(
      e.request.formData().then(function(fd){
        var id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
        var f = null;
        try{ f = fd.get('archivo'); }catch(_g){}
        if (!f || !f.size){
          /* compartieron un enlace o un texto, no un archivo */
          var txt = [];
          ['titulo','texto','enlace'].forEach(function(k){
            var v=''; try{ v = fd.get(k)||''; }catch(_h){}
            if (v) txt.push(String(v));
          });
          return Response.redirect('./?compartido=' + id + '&t=' +
            encodeURIComponent(txt.join(' ').slice(0,400)), 303);
        }
        return caches.open(COMP).then(function(c){
          return c.put(new Request('./__recibido__/' + id),
            new Response(f, {headers:{
              'Content-Type': f.type || 'application/octet-stream',
              'X-Nombre': encodeURIComponent(f.name || 'hoja'),
              'X-Peso': String(f.size)
            }}));
        }).then(function(){
          return Response.redirect('./?compartido=' + id, 303);
        });
      }).catch(function(){
        return Response.redirect('./?compartido=fallo', 303);
      })
    );
    return;
  }
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
  /* ── sw.js NO se guarda ──────────────────────────────────
     La app le pregunta a sw.js cada tanto —con ?_=<hora> pegado, para
     esquivar el cache del navegador— nada mas que para leerle el sello
     y saber si hay version nueva. Si se guardara cada respuesta, cada
     consulta dejaria una entrada distinta y en un mes habria cientos
     de copias del mismo archivo de 4 KB en el celular. */
  var _esSW = false;
  try{ _esSW = /(^|\/)sw\.js$/.test(_u ? _u.pathname : ''); }catch(_s){}
  e.respondWith(conTope(e.request, esNav ? 4000 : 15000).then(function(r){
    if (r && r.ok && !_esSW){ var c = r.clone(); caches.open(CACHE).then(function(x){ try{ x.put(e.request, c); }catch(err){} }); }
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
