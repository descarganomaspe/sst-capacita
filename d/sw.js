/* OBRASST · el cartel QR (d/) · 02/10/2026
   «¿Y si el trabajador no tiene internet?» Hasta hoy el cartel no abría
   nada sin señal. Ahora el celular guarda el documento la primera vez que
   lo abre, y después lo abre también sin señal.
   Este service worker hace dos cosas, nada más:
   1 · que la página del cartel abra sin señal: se pide a la red y, si no
       contesta en 3,5 s, se sirve la última guardada;
   2 · servir los documentos que la página dejó guardados en este celular
       (d/doc/…). No baja nada por su cuenta: lo que se guarda lo decide
       la página, cuando alguien abre un documento.
   Solo toca lo que está dentro de d/: la app, el portal y la consola
   tienen los suyos. La caja de los documentos (DOCS) no se borra al
   cambiar de versión: es lo que el trabajador ya bajó con sus datos. */
var PAGINA = 'obrasst-d-1';
var DOCS = 'obrasst-docs';
var BASE = ['./index.html'];      /* la página, una sola vez: sirve para «./» con cualquier «?t=…» */

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(PAGINA).then(function(c){
    return Promise.all(BASE.map(function(u){ return c.add(new Request(u, { cache:'reload' })).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  /* solo las cajas viejas de esta página: las de la app no son nuestras,
     y la de los documentos no se toca */
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(/^obrasst-d-\d+$/.test(k) && k !== PAGINA) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function conTope(req, ms){
  return new Promise(function(ok, mal){
    var t = setTimeout(function(){ mal(new Error('tope')); }, ms);
    fetch(req).then(function(r){ clearTimeout(t); ok(r); }, function(e){ clearTimeout(t); mal(e); });
  });
}
/* el documento ya no está en este celular (se borró para hacer sitio, o
   el navegador limpió): de vuelta al cartel, que lo baja otra vez si hay
   señal y lo dice si no la hay */
function falta(u, raiz){
  var tk = '';
  try{ tk = u.searchParams.get('t') || ''; }catch(_t){}
  var o = '', h = '';
  try{ o = u.searchParams.get('o') || ''; h = u.searchParams.get('h') || ''; }catch(_o){}
  var q = tk ? ('?t=' + encodeURIComponent(tk) + '&falta=1')
             : (o && h ? ('?o=' + encodeURIComponent(o) + '&h=' + encodeURIComponent(h) + '&falta=1') : '?falta=1');
  return Response.redirect(raiz + q, 302);
}

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var u; try{ u = new URL(e.request.url); }catch(_x){ return; }
  if(u.origin !== self.location.origin) return;                 /* el servidor de datos y el almacén: directo */
  var raiz; try{ raiz = new URL(self.registration.scope).pathname; }catch(_s){ return; }
  if(u.pathname.indexOf(raiz) !== 0) return;                    /* fuera de d/: no es nuestro */
  var resto = u.pathname.slice(raiz.length);

  /* 2 · un documento guardado: se busca sin lo que venga después del «?» */
  if(resto.indexOf('doc/') === 0){
    e.respondWith(caches.open(DOCS).then(function(c){ return c.match(u.origin + u.pathname); })
      .then(function(r){ return r || falta(u, raiz); })
      .catch(function(){ return falta(u, raiz); }));
    return;
  }

  /* 1 · la página del cartel, con cualquier «?t=…» */
  if(resto === '' || resto === 'index.html'){
    e.respondWith(conTope(e.request, 3500).then(function(r){
      if(r && r.ok){ var copia = r.clone(); caches.open(PAGINA).then(function(c){ return c.put('./index.html', copia); }).catch(function(){}); }
      return r;
    }).catch(function(){
      return caches.open(PAGINA).then(function(c){ return c.match('./index.html'); })
        .then(function(r){ return r || Response.error(); });
    }));
    return;
  }
  /* sw.js y cualquier otra cosa: a la red, como si no estuviéramos */
});
