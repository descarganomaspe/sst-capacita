/* 12/11/2026 · el Portal del proveedor y el ERP abiertos desde la app (?app=1): «‹ Volver a la app». Solo cuando la
   página vive junto a la app (…/portal/…); en obrasstapp.com no hace nada. Archivo aparte: el ERP no deja scripts en línea. */
(function(){
  try{
    var q = /[?&]app=1(&|$)/.test(location.search); if(q) sessionStorage.setItem('sstp_app', '1');
    if(!(q || sessionStorage.getItem('sstp_app') === '1')) return;
    var raiz = location.pathname.replace(/portal\/[^\/]*$/, ''); if(raiz === location.pathname) return;
    var a = document.createElement('a'); a.id = 'volver-app'; a.href = raiz; a.textContent = '\u2039 Volver a la app';
    a.setAttribute('style', 'display:block;padding:9px 16px;background:#F5B700;color:#0B2A3A;font:600 14px/1.3 system-ui,sans-serif;text-decoration:none');
    var poner = function(){ if(!document.getElementById('volver-app')) document.body.insertBefore(a, document.body.firstChild); };
    if(document.body) poner(); else document.addEventListener('DOMContentLoaded', poner);
  }catch(e){}
})();
