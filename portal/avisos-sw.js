/* OBRASST · el portal en la PC · 28/09/2026
   Este service worker SOLO recibe los avisos de fallas (Web Push) para el
   equipo de OBRASST y abre el portal cuando se tocan. No guarda nada ni
   se mete con la red: el portal sigue trayendo todo del servidor. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
function _raiz(){ try{ return new URL('../', self.registration.scope).href; }catch(_e){ return self.registration.scope; } }
self.addEventListener('push', function(e){
  var d = {};
  try{ d = e.data ? e.data.json() : {}; }catch(_j){ try{ d = { cuerpo: e.data ? e.data.text() : '' }; }catch(_t){ d = {}; } }
  var r = _raiz();
  e.waitUntil(self.registration.showNotification(String(d.titulo || 'OBRASST').slice(0, 120), {
    body: String(d.cuerpo || 'Tienes un aviso nuevo.').slice(0, 400),
    icon: new URL('icono-192.png', r).href,
    badge: new URL('icono-mask-192.png', r).href,
    tag: String(d.tag || 'obrasst-aviso'),
    renotify: true,
    lang: 'es',
    data: { ruta: String(d.ruta || 'portal/#fallas') }
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = '';
  try{ url = new URL((e.notification.data && e.notification.data.ruta) || 'portal/#fallas', _raiz()).href; }catch(_u){ url = self.registration.scope; }
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(lista){
    for(var i = 0; i < lista.length; i++){
      if(lista[i].url.split('#')[0] === url.split('#')[0] && 'focus' in lista[i]){
        try{ if('navigate' in lista[i]) lista[i].navigate(url); }catch(_n){}
        return lista[i].focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
