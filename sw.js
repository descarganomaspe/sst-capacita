var CACHE = 'sstc-4cc628f55f';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if (k !== CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function(r){
    var c = r.clone(); caches.open(CACHE).then(function(x){ try{ x.put(e.request, c); }catch(err){} });
    return r;
  }).catch(function(){ return caches.match(e.request); }));
});
