/* OBRASST · el portal en la PC · 28/09/2026
   Este service worker SOLO recibía los avisos de fallas (Web Push) para
   el creador de OBRASST. Desde el 28/09 esos avisos se activan en la
   Consola OBRASST (consola/, con su propio service worker); este queda
   para los equipos que los habían activado aquí antes, y los manda a la
   consola. No guarda nada ni se mete con la red. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
function _raiz(){ try{ return new URL('../', self.registration.scope).href; }catch(_e){ return self.registration.scope; } }
/* cualquier ruta vieja (portal/#fallas) va a la misma sección de la consola */
function _ruta(r){
  var h = String(r || '').split('#')[1] || 'fallas';
  return 'consola/#' + (/^(resumen|fallas|ventas|empresas|codigos|avisos)$/.test(h) ? h : 'fallas');
}
self.addEventListener('push', function(e){
  var d = {};
  try{ d = e.data ? e.data.json() : {}; }catch(_j){ try{ d = { cuerpo: e.data ? e.data.text() : '' }; }catch(_t){ d = {}; } }
  var r = _raiz();
  e.waitUntil(self.registration.showNotification(String(d.titulo || 'OBRASST').slice(0, 120), {
    body: String(d.cuerpo || 'Tienes un aviso nuevo.').slice(0, 400),
    icon: new URL('consola/icono-192.png', r).href,
    badge: new URL('consola/icono-insignia.png', r).href,
    tag: String(d.tag || 'obrasst-aviso'),
    renotify: true,
    lang: 'es',
    data: { ruta: _ruta(d.ruta) }
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = '';
  try{ url = new URL(_ruta(e.notification.data && e.notification.data.ruta), _raiz()).href; }catch(_u){ url = self.registration.scope; }
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
