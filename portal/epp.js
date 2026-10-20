/* OBRASST · el EPP de la obra en la web (lote 15): las cuentas de la app (epp-base.js) y las pantallas (epp-web.js).
   Lo arma armar.py. No editar. */
/* ══════════════════════════════════════════════════════════════════
   EL EPP DE LA OBRA · LO COMÚN (17/10/2026, lote 15, #13)
   Marcelo: «Mejora el tema de los EPPs». De la lista de ideas eligió:
   (1) el EPP por puesto, (2) el cambio programado, (3) la verificación
   en campo, (5) las tallas en la ficha, (7) el stock mínimo y (8) el
   costo. Todo sale de UN catálogo de la obra —cada EPP con su tiempo de
   cambio, su stock mínimo, su precio y si lleva talla—, de lo que lleva
   cada puesto, de los ingresos al almacén, de las verificaciones y de
   las tallas; y se cruza con el kardex de siempre (las entregas
   firmadas). Lo mismo en la app y en la web: armar.py lo pone en la app
   y en portal/epp.js.
   Se guarda en sst_estado, una clave por cosa, y se junta por id (gana
   el más nuevo; b = quitado, para que no vuelva desde otro celular):
     · «epp_cat»     { v:1, l:[{ id, n, cambio (días; 0 = sin cambio
                       programado), min, precio, talla, t, b }] }
     · «epp_puestos» { v:1, l:[{ id (el puesto, sin tildes), p, e:[ids
                       del catálogo], t, b }] }
     · «epp_ing»     { v:1, l:[{ id, f, e, c, pu, doc, quien, t, b }] }
     · «epp_verif»   { v:1, l:[{ id, f, tr, nom, p, lleva:[ids],
                       falta:[ids], quien, t, b }] }
     · «epp_tallas»  { v:1, l:[{ id (el trabajador), c (calzado), r
                       (ropa), g (guantes), t }] }
   Las cuentas no inventan nada: el stock empieza con el primer ingreso
   de cada EPP (el inventario de ese día) y desde ahí descuenta lo
   entregado; el cambio programado y el precio los pone la obra (lo que
   dice el fabricante, lo que pagó); sin precio no hay costo.
   ════════════════════════════════════════════════════════════════ */
var EPPB = (function(){
  'use strict';
  var CLAVES = { cat:'epp_cat', puestos:'epp_puestos', ing:'epp_ing', verif:'epp_verif', tallas:'epp_tallas' };
  var TOPES = { cat:300, puestos:200, ing:3000, verif:3000, tallas:3000 };
  var TALLAS = [['', 'Sin talla'], ['calzado', 'Calzado'], ['ropa', 'Ropa'], ['guantes', 'Guantes']];
  /* las tallas que se eligen (calzado, ropa, guantes) */
  var TALLAS_OP = { c:['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'], r:['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], g:['6', '7', '8', '9', '10', '11', 'S', 'M', 'L', 'XL'] };
  /* la lista general de EPP (la misma EPP_SUG de la app: armar.py lo comprueba) */
  var SUG = ['Casco de seguridad', 'Barbiquejo', 'Tafilete', 'Tapones auditivos', 'Lentes de seguridad claros', 'Lentes de seguridad oscuros', 'Guantes multiflex',
             'Guantes de badana', 'Chaleco plomo', 'Polo manga larga', 'Camisa manga larga', 'Pantalón drill', 'Zapatos de seguridad', 'Botas de jebe',
             'Arnés de cuerpo entero', 'Línea de vida', 'Respirador media cara', 'Filtros para respirador', 'Careta facial', 'Mameluco tyvek'];
  var CAMBIOS = [[0, 'Sin plazo'], [7, 'Cada semana'], [15, 'Cada 15 días'], [30, 'Cada mes'], [60, 'Cada 2 meses'], [90, 'Cada 3 meses'],
                 [180, 'Cada 6 meses'], [365, 'Cada año']];
  function nrm(s){
    s = String(s == null ? '' : s).toLowerCase();
    try{ s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }catch(e){}
    return s.replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function txt(s, n){ return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n || 120); }
  function num(x, max){ var v = parseFloat(String(x == null ? '' : x).replace(',', '.')); return (isFinite(v) && v >= 0) ? Math.min(v, max || 1e9) : 0; }
  function iso(x){ var s = String(x || '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''; }
  function dias(i){ var p = String(i || '').split('-'); return p.length === 3 ? Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000) : 0; }
  function masDias(i, n){ return new Date(Date.UTC(+i.slice(0, 4), +i.slice(5, 7) - 1, +i.slice(8, 10)) + n * 86400000).toISOString().slice(0, 10); }
  function hoyDe(op){ return iso(op && op.hoy) || new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10); }
  function nuevoId(p){ return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  /* el id de un EPP sale de su nombre: dos celulares que lo agregan el mismo día no lo duplican */
  function idDe(n){ var q = nrm(n).replace(/ /g, '-').slice(0, 38); return q ? 'e-' + q : ''; }
  function idsDe(l){ return (Array.isArray(l) ? l : []).map(function(x){ return txt(x, 44); }).filter(Boolean).slice(0, 40); }
  var LIMPIA = {
    cat:function(z){ return { id:txt(z.id, 44), n:txt(z.n, 80), cambio:Math.round(num(z.cambio, 3650)), min:Math.round(num(z.min, 100000)),
                              precio:Math.round(num(z.precio, 100000) * 100) / 100, talla:(['calzado', 'ropa', 'guantes'].indexOf(z.talla) >= 0 ? z.talla : ''),
                              t:+z.t || 0, b:z.b ? 1 : 0 }; },
    puestos:function(z){ return { id:txt(z.id, 80), p:txt(z.p, 80), e:idsDe(z.e), t:+z.t || 0, b:z.b ? 1 : 0 }; },
    ing:function(z){ return { id:txt(z.id, 44), f:iso(z.f), e:txt(z.e, 44), c:num(z.c, 1e6), pu:Math.round(num(z.pu, 1e6) * 100) / 100, doc:txt(z.doc, 80),
                              quien:txt(z.quien, 80), t:+z.t || 0, b:z.b ? 1 : 0 }; },
    verif:function(z){ return { id:txt(z.id, 44), f:iso(z.f), tr:txt(z.tr, 64), nom:txt(z.nom, 100), p:txt(z.p, 80), lleva:idsDe(z.lleva), falta:idsDe(z.falta),
                                quien:txt(z.quien, 80), t:+z.t || 0, b:z.b ? 1 : 0 }; },
    tallas:function(z){ return { id:txt(z.id, 64), c:txt(z.c, 8), r:txt(z.r, 8), g:txt(z.g, 8), t:+z.t || 0, b:z.b ? 1 : 0 }; }
  };
  function limpio(k, v){ return ((v && Array.isArray(v.l)) ? v.l : []).map(function(z){ return LIMPIA[k](z || {}); }).filter(function(z){ return z.id; }); }
  function juntar(k, a, b){
    var por = {}, orden = [];
    (a || []).concat(b || []).forEach(function(z){
      z = LIMPIA[k](z || {}); if(!z.id) return;
      if(!por[z.id]){ por[z.id] = z; orden.push(z.id); } else if((z.t || 0) > (por[z.id].t || 0)) por[z.id] = z;
    });
    var L = orden.map(function(id){ return por[id]; });
    return L.length > TOPES[k] ? L.slice(L.length - TOPES[k]) : L;
  }
  function vivos(L){ return (L || []).filter(function(z){ return z && !z.b; }); }
  /* una entrega del kardex, venga del celular (trab, cant) o del servidor (trabajador, cantidad) */
  function ent(k){
    k = k || {};
    return { tr:String(k.trab || k.trabajador || ''), nom:String(k.trabNombre || k.trab_nombre || ''), n:String(k.epp || ''), f:iso(k.fecha),
             c:num(k.cant != null ? k.cant : k.cantidad, 1e6) || 1, tipo:k.tipo || '' };
  }
  function tallaSugerida(n){
    var s = nrm(n);
    if(/zapato|bota|calzado|botin|zapatilla/.test(s)) return 'calzado';
    if(/guante/.test(s)) return 'guantes';
    if(/polo|camisa|pantalon|chaleco|mameluco|overol|casaca|ropa|traje|chompa|poncho|impermeable/.test(s)) return 'ropa';
    return '';
  }
  /* el catálogo: lo que la obra ya tiene, y lo que se entregó en el kardex y todavía no está (con sus datos en cero,
     para no empezar con la hoja en blanco). nuevo:1 = todavía no se guardó; sug:1 = ni siquiera se entregó: viene
     de la lista general (se ofrece aparte) */
  function catalogo(cat, kardex, sug){
    var L = vivos(cat).slice(), por = {};
    L.forEach(function(z){ por[nrm(z.n)] = z; });
    var poner = function(n, deLista){
      var q = nrm(n); if(!q || por[q]) return;
      por[q] = { id:idDe(n), n:txt(n, 80), cambio:0, min:0, precio:0, talla:tallaSugerida(n), t:0, b:0, nuevo:1 };
      if(deLista) por[q].sug = 1;
      L.push(por[q]);
    };
    (kardex || []).forEach(function(k){ poner(ent(k).n); });
    (sug || []).forEach(function(n){ poner(n, true); });
    return L.sort(function(a, b){ return (a.sug ? 1 : 0) - (b.sug ? 1 : 0) || (a.nuevo ? 1 : 0) - (b.nuevo ? 1 : 0) || a.n.localeCompare(b.n); });
  }
  function porNombre(cat){ var o = {}; vivos(cat).forEach(function(z){ o[nrm(z.n)] = z; }); return o; }
  function porId(cat){ var o = {}; vivos(cat).forEach(function(z){ o[z.id] = z; }); return o; }
  function puestoDe(puestos, p){ var q = nrm(p); return vivos(puestos).filter(function(x){ return x.id === q; })[0] || null; }
  /* la última entrega de cada EPP del catálogo a cada trabajador: { 'tr|e': 'AAAA-MM-DD' } */
  function ultimas(cat, kardex){
    var PN = porNombre(cat), u = {};
    (kardex || []).forEach(function(k){
      var e = ent(k), z = PN[nrm(e.n)]; if(!z || !e.tr || !e.f) return;
      var q = e.tr + '|' + z.id; if(!u[q] || e.f > u[q]) u[q] = e.f;
    });
    return u;
  }
  function activos(trabs){ return (trabs || []).filter(function(t){ return t && t.id && String(t.estatus || 'activo') === 'activo'; }); }
  /* (7) el stock: desde el primer ingreso de cada EPP (el inventario de ese día), lo que entró menos lo entregado */
  function stock(cat, ing, kardex){
    var C = vivos(cat), R = {}, PN = porNombre(cat);
    C.forEach(function(z){ R[z.id] = { id:z.id, n:z.n, min:z.min, ing:0, sal:0, stock:0, desde:'', ult:'', conIng:false, bajo:false }; });
    vivos(ing).forEach(function(x){ var r = R[x.e]; if(!r || !x.f) return; if(!r.desde || x.f < r.desde) r.desde = x.f; if(x.f > r.ult) r.ult = x.f; });
    vivos(ing).forEach(function(x){ var r = R[x.e]; if(r && x.f) r.ing += x.c; });
    (kardex || []).forEach(function(k){ var e = ent(k), z = PN[nrm(e.n)], r = z && R[z.id]; if(r && r.desde && e.f && e.f >= r.desde) r.sal += e.c; });
    return C.map(function(z){
      var r = R[z.id]; r.conIng = !!r.desde; r.stock = Math.round((r.ing - r.sal) * 100) / 100;
      r.bajo = r.conIng && z.min > 0 && r.stock < z.min;
      return r;
    }).sort(function(a, b){ return (b.bajo ? 1 : 0) - (a.bajo ? 1 : 0) || (b.conIng ? 1 : 0) - (a.conIng ? 1 : 0) || a.n.localeCompare(b.n); });
  }
  /* lo que se pide para volver al mínimo (y un poco más: hasta el doble del mínimo) */
  function pedirPara(r){ return r && r.bajo ? Math.max(0, Math.ceil(r.min * 2 - r.stock)) : 0; }
  /* (2) el cambio programado: a quién le toca cambiar qué (la última entrega + su tiempo de cambio).
     op: { hoy, aviso: cuántos días antes avisar (15) } → [{ tr, nom, e, n, ult, vence, d (días que faltan; < 0 ya pasó) }] */
  function cambios(cat, kardex, trabs, op){
    op = op || {};
    var hoy = hoyDe(op), aviso = (op.aviso == null ? 15 : op.aviso), PI = porId(cat), u = ultimas(cat, kardex), A = {}, out = [];
    activos(trabs).forEach(function(t){ A[t.id] = t; });
    Object.keys(u).forEach(function(q){
      var p = q.split('|'), t = A[p[0]], z = PI[p[1]];
      if(!t || !z || !(z.cambio > 0)) return;
      var vence = masDias(u[q], z.cambio), d = dias(vence) - dias(hoy);
      if(d <= aviso) out.push({ tr:t.id, nom:t.nombre || '', e:z.id, n:z.n, ult:u[q], vence:vence, d:d });
    });
    return out.sort(function(a, b){ return a.d - b.d || a.nom.localeCompare(b.nom); });
  }
  /* (1) el EPP por puesto: lo que lleva su puesto y no tiene (nunca se le entregó, o ya pasó su tiempo de cambio).
     → { gente:[{ tr, nom, p, lleva, tiene, falta }], completos, conPuesto, pct, sinPuesto } */
  function completos(cat, puestos, kardex, trabs, op){
    var hoy = hoyDe(op), PI = porId(cat), u = ultimas(cat, kardex), gente = [], sinPuesto = 0;
    activos(trabs).forEach(function(t){
      var x = puestoDe(puestos, t.puesto);
      var lleva = x ? x.e.filter(function(id){ return !!PI[id]; }) : [];
      if(!lleva.length){ sinPuesto++; return; }
      var tiene = lleva.filter(function(id){ var f = u[t.id + '|' + id], z = PI[id]; return !!f && (!z.cambio || dias(hoy) - dias(f) <= z.cambio); });
      gente.push({ tr:t.id, nom:t.nombre || '', p:t.puesto || '', lleva:lleva, tiene:tiene, falta:lleva.filter(function(id){ return tiene.indexOf(id) < 0; }) });
    });
    var comp = gente.filter(function(g){ return !g.falta.length; }).length;
    return { gente:gente.sort(function(a, b){ return b.falta.length - a.falta.length || a.nom.localeCompare(b.nom); }), completos:comp, conPuesto:gente.length,
             pct:gente.length ? Math.round(comp * 100 / gente.length) : null, sinPuesto:sinPuesto };
  }
  /* lo de un trabajador: lo que lleva su puesto, lo que tiene, lo que le falta (venc: lo que tuvo y ya pasó su tiempo
     de cambio) y lo que le toca cambiar pronto */
  function deTrab(cat, puestos, kardex, t, op){
    var hoy = hoyDe(op), PI = porId(cat), u = ultimas(cat, kardex), x = t ? puestoDe(puestos, t.puesto) : null, o = { lleva:[], tiene:[], falta:[], venc:[], cambio:[] };
    if(!t) return o;
    o.lleva = x ? x.e.filter(function(id){ return !!PI[id]; }) : [];
    o.lleva.forEach(function(id){
      var f = u[t.id + '|' + id], z = PI[id];
      if(!f){ o.falta.push(id); return; }
      var d = z.cambio ? (dias(f) + z.cambio - dias(hoy)) : null;
      if(d !== null && d < 0){ o.falta.push(id); o.venc.push(id); } else { o.tiene.push(id); if(d !== null && d <= 15) o.cambio.push({ e:id, d:d }); }
    });
    return o;
  }
  /* (3) la verificación en campo, del mes: cuántas, cuántas completas, el % de uso correcto y lo que más falta */
  function verifMes(verif, mes, cat){
    var PI = porId(cat), L = vivos(verif).filter(function(v){ return String(v.f).slice(0, 7) === mes; }), ok = 0, falta = {};
    L.forEach(function(v){ if(!v.falta.length) ok++; v.falta.forEach(function(id){ falta[id] = (falta[id] || 0) + 1; }); });
    var top = Object.keys(falta).map(function(id){ return { e:id, n:(PI[id] || {}).n || id, c:falta[id] }; }).sort(function(a, b){ return b.c - a.c; });
    return { n:L.length, ok:ok, pct:L.length ? Math.round(ok * 100 / L.length) : null, falta:top };
  }
  /* (8) el costo de lo entregado en un periodo: cada entrega por el precio de su EPP (el del catálogo; si no tiene, el
     del último ingreso con precio). → { total, porEpp:[{ n, c, s }], sinPrecio:[n], trab, prom } */
  function costo(cat, ing, kardex, desde, hasta){
    var PN = porNombre(cat), pu = {}, porE = {}, trab = {}, sin = {}, total = 0;
    vivos(ing).slice().sort(function(a, b){ return String(a.f).localeCompare(String(b.f)); }).forEach(function(x){ if(x.pu > 0) pu[x.e] = x.pu; });
    (kardex || []).forEach(function(k){
      var e = ent(k); if(!e.f || (desde && e.f < desde) || (hasta && e.f > hasta)) return;
      var z = PN[nrm(e.n)], p = z ? (z.precio || pu[z.id] || 0) : 0, nom = z ? z.n : txt(e.n, 80);
      if(!nom) return;
      if(!p){ sin[nom] = 1; return; }
      var s = p * e.c; total += s;
      if(!porE[nom]) porE[nom] = { n:nom, c:0, s:0 };
      porE[nom].c += e.c; porE[nom].s += s;
      var q = e.tr || nrm(e.nom); if(q) trab[q] = (trab[q] || 0) + s;
    });
    var nT = Object.keys(trab).length;
    return { total:Math.round(total * 100) / 100, porEpp:Object.keys(porE).map(function(k){ var x = porE[k]; x.s = Math.round(x.s * 100) / 100; return x; }).sort(function(a, b){ return b.s - a.s; }),
             sinPrecio:Object.keys(sin).sort(), trab:nT, prom:nT ? Math.round(total / nT * 100) / 100 : 0 };
  }
  /* (5) las tallas de la gente que usa un EPP —la de los puestos que lo llevan; si ningún puesto lo tiene, toda la
     obra—, para que el pedido salga con sus tallas. → { tipo, L:[[talla, cuántos]], sin, n } o null (no lleva talla) */
  var TALLA_ORDEN = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  function _ordTalla(v){ var n = parseFloat(v); if(isFinite(n) && /^\d/.test(v)) return n; var i = TALLA_ORDEN.indexOf(String(v).toUpperCase()); return 1000 + (i < 0 ? 99 : i); }
  function tallasPara(cat, puestos, tallas, trabs, eppId){
    var z = porId(cat)[eppId], k = z && { calzado:'c', ropa:'r', guantes:'g' }[z.talla]; if(!k) return null;
    var gente = activos(trabs), lo = vivos(puestos).filter(function(x){ return x.e.indexOf(eppId) >= 0; }).map(function(x){ return x.id; });
    if(lo.length) gente = gente.filter(function(t){ return lo.indexOf(nrm(t.puesto)) >= 0; });
    var T = {}, cuenta = {}, sin = 0;
    vivos(tallas).forEach(function(x){ T[x.id] = x; });
    gente.forEach(function(t){ var v = (T[t.id] || {})[k]; if(v) cuenta[v] = (cuenta[v] || 0) + 1; else sin++; });
    return { tipo:z.talla, L:Object.keys(cuenta).map(function(v){ return [v, cuenta[v]]; }).sort(function(a, b){ return _ordTalla(a[0]) - _ordTalla(b[0]); }), sin:sin, n:gente.length };
  }
  function tallasTexto(x){
    if(!x || !x.L.length) return '';
    return ('Tallas: ' + x.L.map(function(p){ return p[0] + ' (' + p[1] + ')'; }).join(', ') + (x.sin ? ' · ' + x.sin + ' sin talla' : '')).slice(0, 160);
  }
  /* la moneda de la obra (la de su país): el precio lo pone la obra, en lo que paga */
  var MONEDAS = { pe:'S/', 'do':'RD$', py:'Gs.' };
  function moneda(pais){ return MONEDAS[String(pais || 'pe').toLowerCase()] || '$'; }
  function tallasDe(tallas, trId){ return vivos(tallas).filter(function(z){ return z.id === String(trId || ''); })[0] || null; }
  function cambioN(d){ for(var i=0;i<CAMBIOS.length;i++) if(CAMBIOS[i][0] === d) return CAMBIOS[i][1]; return d ? 'Cada ' + d + ' días' : CAMBIOS[0][1]; }
  return { CLAVES:CLAVES, TALLAS:TALLAS, CAMBIOS:CAMBIOS, nrm:nrm, idDe:idDe, nuevoId:nuevoId, limpio:limpio, juntar:juntar, vivos:vivos, ent:ent, limpia:LIMPIA,
           catalogo:catalogo, porId:porId, porNombre:porNombre, puestoDe:puestoDe, tallaSugerida:tallaSugerida, stock:stock, pedirPara:pedirPara,
           cambios:cambios, completos:completos, deTrab:deTrab, verifMes:verifMes, costo:costo, tallasDe:tallasDe, cambioN:cambioN, dias:dias, masDias:masDias,
           tallasPara:tallasPara, tallasTexto:tallasTexto, moneda:moneda, activos:activos, TALLAS_OP:TALLAS_OP, SUG:SUG };
})();
/* ══════════════════════════════════════════════════════════════════
   EL EPP DE LA OBRA · LA WEB (17/10/2026, lote 15, #13)
   Lo mismo que «EPP de la obra» en la app, para la pantalla de la oficina: a quién le toca cambiar qué, la matriz del
   EPP por puesto (y a quién le falta), las verificaciones en campo del mes, el stock con sus ingresos al almacén (y el
   requerimiento armado), las tallas de la gente, el catálogo y el costo. Las cuentas son las de la app (EPPB, de
   epp-base.js, que armar.py pone delante de este archivo en portal/epp.js); lo guardado es el mismo (sst_estado, cinco
   claves): lo que se cambia aquí lo ve la app, y al revés. Cada cambio se escribe sobre lo que el servidor tiene en ese
   momento (se lee, se junta y se escribe): no se pisa lo que otro cambió.
   ════════════════════════════════════════════════════════════════ */
var EPW = { obra:null, caja:null, tab:'cambios', d:null, gente:null, kardex:null, n:0, pend:{}, q:'', costo:'mes', ver:'mes', ingE:'' };
var EPW_TABS = [['cambios', 'Le toca cambio'], ['puestos', 'Por puesto'], ['verif', 'Verificaciones'], ['stock', 'Stock'], ['tallas', 'Tallas'], ['cat', 'Catálogo'], ['costo', 'Costo']];

function _epwCss(){
  if($('epw-css')) return;
  var st = document.createElement('style'); st.id = 'epw-css';
  st.textContent = [
    '.epw-intro{margin:0 0 14px;font-size:14px;color:var(--texto);line-height:1.55;max-width:880px}',
    '.epw-cab{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin:0 0 4px}',
    '.epw-tabs{max-width:100%;flex-wrap:wrap;margin:0 0 14px}',
    '.epw-est{font-size:12.5px;color:var(--gris);margin:0 0 14px}',
    '.epw-est.mal{color:var(--mal)}',
    '.epw-rej{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}',
    '.epw-tit{font-size:14px;font-weight:600;color:var(--tinta);margin:22px 0 8px}',
    '.epw-sub{font-size:13px;color:var(--gris);margin:0 0 10px;max-width:880px}',
    '.epw-acc{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 14px}',
    '.epw-mat th.epw-v{writing-mode:vertical-rl;transform:rotate(180deg);text-transform:none;letter-spacing:0;font-size:12px;font-weight:600;',
    '  padding:10px 6px;vertical-align:bottom;white-space:nowrap;max-height:190px;cursor:default;text-align:left}',
    '.epw-mat td.epw-c{text-align:center;padding:6px 4px;vertical-align:middle}',
    '.epw-mat td.epw-p{white-space:nowrap;font-weight:500;color:var(--tinta);vertical-align:middle}',
    '.epw-mat input[type=checkbox]{width:18px;height:18px;margin:0;accent-color:var(--tinta);cursor:pointer}',
    '.epw-tabla td{vertical-align:middle}',
    '.epw-tabla select,.epw-tabla input{padding:6px 8px;font-size:13.5px;min-width:80px}',
    '.epw-tabla select{min-width:132px}',
    '.epw-tallas select{min-width:76px}',
    '@media (min-width:760px){.epw-form .ancho{grid-column:span 2}}',
    '.epw-tabla input[type=number]{max-width:110px}',
    '.epw-form{display:grid;gap:10px 12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));align-items:end}',
    '.epw-form .campo{margin:0}',
    '.epw-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}',
    '.epw-chip{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;font-size:12.5px;padding:5px 11px;border-radius:999px;',
    '  border:1px solid var(--raya2);background:var(--panel);color:var(--texto)}',
    '.epw-chip:hover{border-color:var(--tinta)}',
    '.epw-x{appearance:none;-webkit-appearance:none;cursor:pointer;border:1px solid var(--raya2);background:var(--panel);color:var(--gris);',
    '  border-radius:7px;width:30px;height:30px;font:inherit;line-height:1}',
    '.epw-x:hover{color:var(--mal);border-color:var(--mal)}',
    '.epw-res{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:13px;color:var(--gris);margin:0 0 6px}',
    '.epw-res b{color:var(--texto);font-weight:600}',
    '.epw-busca{max-width:340px;margin:0 0 10px}',
    'details.epw-lista{margin:14px 0 0}',
    'details.epw-lista>summary{cursor:pointer;font-size:13.5px;font-weight:600;color:var(--tinta)}'
  ].join('\n');
  document.head.appendChild(st);
}

/* ── la vista ── */
function epwVista(caja){
  _epwCss();
  var oid = (YO.obra || {}).id;
  if(EPW.obra !== oid){ EPW.obra = oid; EPW.d = null; EPW.gente = null; EPW.kardex = null; EPW.pend = {}; EPW.q = ''; EPW.ingE = ''; }
  EPW.caja = caja;
  var ac = $('acciones');
  if(ac){ ac.innerHTML = '<button type="button" class="bt sec" id="epw-csv">⬇ Descargar esta lista (Excel)</button>'; $('epw-csv').onclick = epwCsv; }
  function pinta(silencio){
    if(silencio && _epwOcupado()) return;          /* escribiendo en un casillero: no se le repinta debajo */
    var n = ++EPW.n;
    epwCargar().then(function(){
      if(n !== EPW.n || !document.body.contains(caja)) return;
      if(silencio && _epwOcupado()) return;
      epwPintar();
    }, function(cod){
      if(n !== EPW.n || !document.body.contains(caja) || cod === 'otra_obra') return;
      if(!silencio) fallo(caja, cod);
    });
  }
  VISTA.recargar = pinta;
  if(EPW.d) epwPintar(); else cargando(caja);
  pinta(false);
}
function _epwOcupado(){ var a = document.activeElement; return !!(a && EPW.caja && EPW.caja.contains(a) && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)); }
function _epwHoy(){ return hoyISO(); }
function _epwMon(){ return EPPB.moneda((typeof paisObraP === 'function') ? paisObraP() : 'pe'); }
function _epwPlata(n){ return _epwMon() + ' ' + (Math.round((+n || 0) * 100) / 100).toFixed(2); }

/* ── los datos: el personal, el kardex y lo de la obra (sst_estado) ── */
function _epwGente(){
  function q(sel){ return traerTodo('sst_trabajador', '&select=' + sel + '&order=nombre.asc', 5000); }
  return q('id,ext,nombre,dni,puesto,estatus').catch(function(c){ if(c === 400) return q('id,nombre,dni,puesto,estatus'); throw c; }).then(function(l){
    return (l || []).filter(function(t){ return t && t.nombre; }).map(function(t){
      /* el mismo id que usa la app (el del celular, «ext»): con él se guardan las tallas y se cruza el kardex */
      return { id:String(t.ext || t.id), nombre:String(t.nombre).replace(/\s+/g, ' ').trim(), dni:String(t.dni || ''), puesto:String(t.puesto || '').replace(/\s+/g, ' ').trim(), estatus:t.estatus || 'activo' };
    }).sort(function(a, b){ return a.nombre.localeCompare(b.nombre, 'es', { sensitivity:'base' }); });
  });
}
function _epwKardex(){
  function q(sel){ return traerTodo('sst_kardex', '&select=' + sel + '&order=fecha.desc', 30000); }
  return q('ext,trabajador,trab_nombre,epp,tipo,fecha,cantidad,unidad').catch(function(c){ if(c === 400) return q('ext,trabajador,trab_nombre,epp,tipo,fecha,cantidad'); throw c; });
}
function epwCargar(){
  var oid = EPW.obra, K = EPPB.CLAVES, ks = Object.keys(K);
  return Promise.all([
    _epwGente(), _epwKardex(),
    Promise.all(ks.map(function(c){ return estadoLeerP(K[c]).then(function(f){ return f ? f.valor : null; }); }))
  ]).then(function(r){
    if(EPW.obra !== oid) throw 'otra_obra';
    EPW.gente = r[0] || []; EPW.kardex = r[1] || [];
    var d = {};
    /* lo que se cambió aquí y todavía no subió, se queda (gana el más nuevo) */
    ks.forEach(function(c, i){ d[c] = EPPB.juntar(c, EPPB.limpio(c, r[2][i]), (EPW.d && EPW.pend[c]) ? EPW.d[c] : []); });
    EPW.d = d;
  });
}
/* poner (o cambiar) uno: se ve al tiro y se sube enseguida */
function epwPoner(c, z){
  z = EPPB.limpia[c](z); z.t = Date.now();
  var hay = false;
  EPW.d[c] = EPW.d[c].map(function(x){ if(x.id === z.id){ hay = true; return z; } return x; });
  if(!hay) EPW.d[c].push(z);
  EPW.pend[c] = 1; _epwEstado('Guardando…');
  clearTimeout(EPW['tm_' + c]); EPW['tm_' + c] = setTimeout(function(){ epwSubir(c); }, 600);
  return z;
}
function epwSubir(c){
  var oid = EPW.obra, k = EPPB.CLAVES[c];
  return estadoLeerP(k).then(function(f){
    if(EPW.obra !== oid) return Promise.reject('otra_obra');
    EPW.d[c] = EPPB.juntar(c, EPPB.limpio(c, f && f.valor), EPW.d[c]);
    return estadoEscribirP(k, { v:1, l:EPW.d[c] });
  }).then(function(){
    if(EPW.obra !== oid) return;
    delete EPW.pend[c];
    if(!Object.keys(EPW.pend).length) _epwEstado('Guardado: ya está en la app de la obra');
  }, function(e){
    if(e === 'otra_obra') return;
    _epwEstado('No se pudo guardar: revisa tu conexión', true);
    toast('No se pudo guardar. Revisa tu conexión e inténtalo otra vez.');
  });
}
function _epwEstado(t, mal){ var e = $('epw-est'); if(e){ e.textContent = t; e.className = 'epw-est' + (mal ? ' mal' : ''); } }
function _epwCat(){ return EPPB.catalogo(EPW.d.cat, EPW.kardex, EPPB.SUG); }
function _epwUsables(){ return _epwCat().filter(function(z){ return !z.sug; }); }
function _epwAsegurar(id){
  if(EPPB.porId(EPW.d.cat)[id]) return true;
  var z = _epwCat().filter(function(x){ return x.id === id; })[0]; if(!z) return false;
  epwPoner('cat', { id:z.id, n:z.n, cambio:z.cambio || 0, min:z.min || 0, precio:z.precio || 0, talla:z.talla || '' });
  return true;
}
function _epwNom(id){ var z = EPPB.porId(EPW.d.cat)[id]; return z ? z.n : id; }
function _epwPuestoDe(trId){ var t = EPW.gente.filter(function(x){ return x.id === trId; })[0]; return t ? t.puesto : ''; }
/* la unidad de un EPP: la que más se usó al entregarlo en el kardex */
function _epwUnidad(n){
  var q = EPPB.nrm(n), c = {};
  (EPW.kardex || []).forEach(function(k){ if(EPPB.nrm(k.epp) === q && k.unidad){ var u = String(k.unidad).toLowerCase(); c[u] = (c[u] || 0) + 1; } });
  var u = Object.keys(c).sort(function(a, b){ return c[b] - c[a]; })[0];
  return u || 'und';
}

/* ── la pantalla ── */
function epwPintar(){
  var caja = EPW.caja; if(!caja || !EPW.d) return;
  var h = '<p class="epw-intro">Sale de las entregas del kardex (con su firma): no se escribe dos veces.</p>';
  h += '<div class="seg epw-tabs" id="epw-tabs" role="tablist" aria-label="El EPP de la obra">' + EPW_TABS.map(function(t){
    var on = (t[0] === EPW.tab);
    return '<button type="button" role="tab" data-tab="' + t[0] + '" class="' + (on ? 'on' : '') + '" aria-selected="' + (on ? 'true' : 'false') + '">' + esc(t[1]) + '</button>';
  }).join('') + '</div>';
  h += '<p class="epw-est" id="epw-est" aria-live="polite">' + (Object.keys(EPW.pend).length ? 'Guardando…' : '') + '</p><div id="epw-cuerpo"></div>';
  caja.innerHTML = h;
  $('epw-tabs').onclick = function(ev){
    var b = ev.target.closest ? ev.target.closest('button[data-tab]') : null; if(!b) return;
    epwTab(b.getAttribute('data-tab'));
  };
  var c = $('epw-cuerpo');
  c.onclick = _epwClic; c.onchange = _epwCambio; c.oninput = _epwEscribe;
  epwPintarTab();
}
function epwTab(t){
  EPW.tab = t;
  Array.prototype.forEach.call(document.querySelectorAll('#epw-tabs button[data-tab]'), function(z){ var on = (z.getAttribute('data-tab') === t); z.classList.toggle('on', on); z.setAttribute('aria-selected', on ? 'true' : 'false'); });
  epwPintarTab();
}
function epwPintarTab(){
  var c = $('epw-cuerpo'); if(!c) return;
  var f = { cambios:_epwCambios, puestos:_epwPuestos, verif:_epwVerif, stock:_epwStock, tallas:_epwTallas, cat:_epwCatHTML, costo:_epwCosto }[EPW.tab] || _epwCambios;
  c.innerHTML = f();
}
function _epwIrCat(txt){ return '<div class="aviso ojo">' + txt + ' <button type="button" class="bt sec" data-acc="tab:cat" style="margin-left:6px">Ir al catálogo</button></div>'; }

/* (2) a quién le toca cambiar qué */
function _epwCambios(){
  var D = EPW.d, conCambio = EPPB.vivos(D.cat).filter(function(z){ return z.cambio > 0; }).length;
  if(!conCambio) return _epwIrCat('<b>Todavía no hay cambios programados.</b> Pon en «Catálogo» cada cuánto se cambia cada EPP (lo que dice su fabricante o lo que usa tu obra): aquí sale, solo, a quién le toca y desde cuándo.');
  var L = EPPB.cambios(D.cat, EPW.kardex, EPW.gente, { aviso:15, hoy:_epwHoy() }), venc = L.filter(function(x){ return x.d < 0; }).length;
  var h = '<div class="rej epw-rej">' + cifra('Con el cambio vencido', venc, venc === 1 ? 'un EPP que ya pasó su tiempo' : 'EPP que ya pasaron su tiempo', venc ? 'mal' : 'ok') +
          cifra('Vencen en 15 días', L.length - venc, 'para ir preparando la entrega', '') + cifra('EPP con cambio programado', conCambio, 'en el catálogo', '') + '</div>';
  if(!L.length) return h + '<div class="vacio"><b>Nadie tiene un cambio pendiente en los próximos 15 días</b>Cuando a alguien le toque, sale aquí y en la app (con su número rojo en el kardex).</div>';
  h += '<div class="tarj"><div class="tabla-caja"><table><thead><tr><th>Trabajador</th><th>Puesto</th><th>EPP</th><th>Se le dio</th><th>Vence</th><th>Estado</th></tr></thead><tbody>';
  L.forEach(function(x){
    h += '<tr><td>' + esc(x.nom) + '</td><td>' + esc(_epwPuestoDe(x.tr)) + '</td><td>' + esc(x.n) + '</td><td>' + esc(fechaLarga(x.ult)) + '</td><td>' + esc(fechaLarga(x.vence)) + '</td><td>' +
         (x.d < 0 ? '<span class="pill mal">Vencido hace ' + (-x.d) + (x.d === -1 ? ' día' : ' días') + '</span>' : (x.d === 0 ? '<span class="pill ojo">Vence hoy</span>' : '<span class="pill ojo">En ' + x.d + (x.d === 1 ? ' día' : ' días') + '</span>')) + '</td></tr>';
  });
  return h + '</tbody></table></div></div><p class="epw-sub">La entrega se registra en el kardex (en la app, con su firma; o aquí, en «Entrega de EPP»): al entregarse, sale de esta lista.</p>';
}

/* (1) la matriz del EPP por puesto, y a quién le falta */
function _epwPuestos(){
  var D = EPW.d, C = _epwUsables(), T = EPPB.activos(EPW.gente);
  if(!C.length) return _epwIrCat('<b>Todavía no hay EPP en la obra.</b> Salen solos de las entregas del kardex, o se agregan en «Catálogo».');
  var P = {}, orden = [];
  T.forEach(function(t){ var q = EPPB.nrm(t.puesto); if(!q) return; if(!P[q]){ P[q] = { p:t.puesto, n:0 }; orden.push(q); } P[q].n++; });
  orden.sort(function(a, b){ return P[b].n - P[a].n || P[a].p.localeCompare(P[b].p, 'es'); });
  var R = EPPB.completos(D.cat, D.puestos, EPW.kardex, T, { hoy:_epwHoy() });
  var h = '<div id="epw-pu-res">' + _epwPuRes(R) + '</div>';
  if(!orden.length) return h + '<div class="vacio"><b>El personal no tiene puesto registrado</b>Ponlo en «Personal»: aquí se marca lo que lleva cada puesto.</div>';
  h += '<p class="epw-sub">Marca lo que lleva cada puesto. En la app, al entregar, sale lo que le falta a cada uno (y se suma de un toque).</p>';
  h += '<div class="tarj"><div class="tabla-caja"><table class="epw-mat"><thead><tr><th>Puesto</th><th class="num">Gente</th>' +
       C.map(function(z){ return '<th class="epw-v" title="' + esc(z.n) + '">' + esc(z.n) + '</th>'; }).join('') + '</tr></thead><tbody>';
  orden.forEach(function(q){
    var x = EPPB.puestoDe(D.puestos, P[q].p), lleva = x ? x.e : [];
    h += '<tr><td class="epw-p">' + esc(P[q].p) + '</td><td class="num">' + P[q].n + '</td>' + C.map(function(z){
      return '<td class="epw-c"><input type="checkbox" aria-label="' + esc(P[q].p + ': ' + z.n) + '" data-pu="' + esc(q) + '" data-p="' + esc(P[q].p) + '" data-e="' + esc(z.id) + '"' + (lleva.indexOf(z.id) >= 0 ? ' checked' : '') + '></td>';
    }).join('') + '</tr>';
  });
  h += '</tbody></table></div></div>';
  return h + '<div id="epw-pu-falta">' + _epwPuFalta(R) + '</div>';
}
function _epwPuRes(R){
  return '<div class="rej epw-rej">' + cifra('Con su EPP completo', R.pct == null ? '—' : R.pct + '%', R.completos + ' de ' + R.conPuesto + ' (los que tienen su EPP definido)', R.pct == null ? '' : (R.pct >= 90 ? 'ok' : (R.pct >= 70 ? 'ojo' : 'mal'))) +
         cifra('Les falta algo', R.conPuesto - R.completos, 'nunca se les dio o ya pasó su tiempo', (R.conPuesto - R.completos) ? 'mal' : 'ok') +
         cifra('Sin EPP definido', R.sinPuesto, 'su puesto todavía no tiene EPP marcado', R.sinPuesto ? 'ojo' : '') + '</div>';
}
function _epwPuFalta(R){
  var falta = R.gente.filter(function(g){ return g.falta.length; });
  if(!falta.length) return '';
  return '<p class="epw-tit">Les falta</p><div class="tarj"><div class="tabla-caja"><table><thead><tr><th>Trabajador</th><th>Puesto</th><th>Le falta</th></tr></thead><tbody>' +
    falta.map(function(g){ return '<tr><td>' + esc(g.nom) + '</td><td>' + esc(g.p) + '</td><td>' + esc(g.falta.map(_epwNom).join(', ')) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
}
function epwPuestoToca(q, p, id, on){
  var D = EPW.d, x = EPPB.puestoDe(D.puestos, p) || { id:q, p:p, e:[] }, e = x.e.slice(), i = e.indexOf(id);
  if(on && i < 0){ if(!_epwAsegurar(id)) return; e.push(id); }
  if(!on && i >= 0) e.splice(i, 1);
  epwPoner('puestos', { id:q, p:p || x.p, e:e });
  /* se repinta solo lo de arriba y «Les falta»: la matriz queda donde estaba (sin perder el desplazamiento) */
  var R = EPPB.completos(D.cat, D.puestos, EPW.kardex, EPPB.activos(EPW.gente), { hoy:_epwHoy() }), a = $('epw-pu-res'), b = $('epw-pu-falta');
  if(a) a.innerHTML = _epwPuRes(R); if(b) b.innerHTML = _epwPuFalta(R);
}

/* (3) las verificaciones en campo (se hacen en la app, en el recorrido) */
function _epwMesDe(k){ var h = _epwHoy(), y = +h.slice(0, 4), m = +h.slice(5, 7); if(k === 'ant'){ m--; if(!m){ m = 12; y--; } } return y + '-' + (m < 10 ? '0' : '') + m; }
function _epwVerif(){
  var D = EPW.d, mes = _epwMesDe(EPW.ver), V = EPPB.verifMes(D.verif, mes, D.cat);
  var h = '<div class="epw-acc"><div class="seg" style="margin:0">' + [['mes', 'Este mes'], ['ant', 'El mes pasado']].map(function(o){
    return '<button type="button" data-acc="ver:' + o[0] + '" class="' + (EPW.ver === o[0] ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
  h += '<div class="rej epw-rej">' + cifra('Uso correcto', V.pct == null ? '—' : V.pct + '%', 'de las verificaciones, completas', V.pct == null ? '' : (V.pct >= 90 ? 'ok' : (V.pct >= 70 ? 'ojo' : 'mal'))) +
       cifra('Verificaciones', V.n, V.ok + (V.ok === 1 ? ' completa' : ' completas'), '') +
       cifra('Lo que más falta', V.falta.length ? V.falta[0].n : '—', V.falta.length ? V.falta[0].c + (V.falta[0].c === 1 ? ' vez' : ' veces') : 'nada', V.falta.length ? 'mal' : '') + '</div>';
  var L = EPPB.vivos(D.verif).filter(function(v){ return String(v.f).slice(0, 7) === mes; }).sort(function(a, b){ return String(b.f).localeCompare(String(a.f)) || (b.t || 0) - (a.t || 0); });
  if(!L.length) return h + '<div class="vacio"><b>No hay verificaciones ese mes</b>Se hacen en el recorrido, desde la app: «EPP de la obra» › «Verificar». Se busca al trabajador, se marca lo que no lleva puesto y se guarda.</div>';
  h += '<div class="tarj"><div class="tabla-caja"><table><thead><tr><th>Fecha</th><th>Trabajador</th><th>Puesto</th><th>Resultado</th><th>Verificó</th></tr></thead><tbody>' + L.map(function(v){
    return '<tr><td>' + esc(fechaLarga(v.f)) + '</td><td>' + esc(v.nom) + '</td><td>' + esc(v.p) + '</td><td>' + (v.falta.length ? '<span class="pill mal">Le faltaba: ' + esc(v.falta.map(_epwNom).join(', ')) + '</span>' : '<span class="pill ok">Completo</span>') + '</td><td>' + esc(v.quien || '') + '</td></tr>';
  }).join('') + '</tbody></table></div></div>';
  if(V.falta.length > 1) h += '<p class="epw-sub">Lo que más falta: ' + esc(V.falta.slice(0, 6).map(function(x){ return x.n + ' (' + x.c + ')'; }).join(', ')) + '.</p>';
  return h;
}

/* (7) el stock, con los ingresos al almacén */
function _epwStock(){
  var D = EPW.d, C = _epwUsables();
  if(!C.length) return _epwIrCat('<b>Todavía no hay EPP en la obra.</b> Salen solos de las entregas del kardex, o se agregan en «Catálogo».');
  var S = EPPB.stock(C, D.ing, EPW.kardex), bajos = S.filter(function(r){ return r.bajo; }), mes = _epwHoy().slice(0, 7);
  var ingMes = EPPB.vivos(D.ing).filter(function(x){ return String(x.f).slice(0, 7) === mes; }).length;
  var h = '<div class="rej epw-rej">' + cifra('Por debajo de su mínimo', bajos.length, bajos.length === 1 ? 'EPP para reponer' : 'EPP para reponer', bajos.length ? 'mal' : 'ok') +
          cifra('Con inventario', S.filter(function(r){ return r.conIng; }).length, 'de ' + S.length + ' EPP de la obra', '') + cifra('Ingresos de este mes', ingMes, 'al almacén', '') + '</div>';
  h += '<p class="epw-sub">El stock empieza con el primer ingreso de cada EPP (lo que hay ese día en el almacén) y descuenta, solo, lo que se entrega en el kardex.</p>';
  if(bajos.length && typeof prqPuede === 'function' && prqPuede()) h += '<div class="epw-acc"><button type="button" class="bt" data-acc="req" id="epw-req">🧾 Pedir la reposición (' + bajos.length + ' EPP)</button>' +
    '<span class="epw-sub" style="margin:0">Se abre el requerimiento con lo que falta para llegar al doble del mínimo, y con las tallas de la gente.</span></div>';
  var ing = EPW.ingE || (C[0] && C[0].id) || '';
  h += '<div class="tarj"><div class="tarj-cab"><h2>Ingreso al almacén</h2></div><div class="tarj-cuerpo"><div class="epw-form">' +
       '<div class="campo ancho"><label for="epw-i-e">EPP</label><select id="epw-i-e">' + C.map(function(z){ return '<option value="' + esc(z.id) + '"' + (z.id === ing ? ' selected' : '') + '>' + esc(z.n) + '</option>'; }).join('') + '</select></div>' +
       '<div class="campo"><label for="epw-i-c">Cantidad</label><input id="epw-i-c" type="number" min="1" max="100000" inputmode="numeric"></div>' +
       '<div class="campo"><label for="epw-i-f">Fecha</label><input id="epw-i-f" type="date" value="' + _epwHoy() + '" max="' + _epwHoy() + '"></div>' +
       '<div class="campo"><label for="epw-i-pu">Precio c/u (' + esc(_epwMon()) + ', opcional)</label><input id="epw-i-pu" type="number" min="0" step="0.01" inputmode="decimal"></div>' +
       '<div class="campo"><label for="epw-i-doc">Guía o factura (opcional)</label><input id="epw-i-doc" maxlength="80"></div>' +
       '<div class="campo"><button type="button" class="bt" data-acc="ing-guardar" id="epw-i-ok" style="width:100%">Guardar el ingreso</button></div></div>' +
       '<p class="epw-sub" id="epw-i-msg" style="margin:8px 0 0;min-height:18px"></p></div></div>';
  h += '<div class="tarj"><div class="tabla-caja"><table class="epw-tabla"><thead><tr><th>EPP</th><th class="num">Mínimo</th><th class="num">Entró</th><th class="num">Salió</th><th class="num">Hay</th><th>Desde</th><th>Estado</th><th></th></tr></thead><tbody>' +
    S.map(function(r){
      return '<tr><td>' + esc(r.n) + '</td><td class="num">' + (r.min || '—') + '</td><td class="num">' + (r.conIng ? r.ing : '—') + '</td><td class="num">' + (r.conIng ? r.sal : '—') + '</td><td class="num"><b>' + (r.conIng ? r.stock : '—') + '</b></td><td>' + esc(r.desde ? fechaLarga(r.desde) : '') + '</td><td>' +
        (!r.conIng ? '<span class="pill gris">Sin inventario</span>' : (r.bajo ? '<span class="pill mal">Bajo el mínimo</span>' : '<span class="pill ok">Bien</span>')) + '</td>' +
        '<td><button type="button" class="bt sec" data-acc="ing-abrir:' + esc(r.id) + '" title="Un ingreso de este EPP">＋ Ingreso</button></td></tr>';
    }).join('') + '</tbody></table></div></div>';
  var ult = EPPB.vivos(D.ing).slice().sort(function(a, b){ return String(b.f).localeCompare(String(a.f)) || (b.t || 0) - (a.t || 0); });
  if(ult.length){
    h += '<p class="epw-tit">Ingresos al almacén</p><div class="tarj"><div class="tabla-caja"><table><thead><tr><th>Fecha</th><th>EPP</th><th class="num">Cantidad</th><th class="num">Precio c/u</th><th>Guía o factura</th><th>Registró</th><th></th></tr></thead><tbody>' +
      ult.slice(0, 200).map(function(x){
        return '<tr><td>' + esc(fechaLarga(x.f)) + '</td><td>' + esc(_epwNom(x.e)) + '</td><td class="num">' + x.c + '</td><td class="num">' + (x.pu ? esc(_epwPlata(x.pu)) : '—') + '</td><td>' + esc(x.doc || '') + '</td><td>' + esc(x.quien || '') + '</td>' +
               '<td><button type="button" class="epw-x" data-acc="ing-quitar:' + esc(x.id) + '" aria-label="Quitar este ingreso" title="Quitar este ingreso">✕</button></td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }
  return h;
}
function epwIngresoGuardar(){
  var e = ($('epw-i-e') || {}).value, c = parseFloat(String(($('epw-i-c') || {}).value || '').replace(',', '.')), f = ($('epw-i-f') || {}).value || _epwHoy(), m = $('epw-i-msg');
  if(!e) return;
  if(!(c > 0)){ if(m){ m.style.color = 'var(--mal)'; m.textContent = 'Pon la cantidad que entró.'; } try{ $('epw-i-c').focus(); }catch(_f){} return; }
  if(f > _epwHoy()){ if(m){ m.style.color = 'var(--mal)'; m.textContent = 'La fecha no puede ser después de hoy.'; } return; }
  if(!_epwAsegurar(e)) return;
  epwPoner('ing', { id:EPPB.nuevoId('i'), f:f, e:e, c:c, pu:($('epw-i-pu') || {}).value || 0, doc:($('epw-i-doc') || {}).value || '', quien:String(YO.nombre || (TOK && TOK.correo) || '').slice(0, 80) });
  EPW.ingE = e;
  toast('Ingreso guardado');
  epwPintarTab();
}
function epwIngresoQuitar(id){
  var x = EPPB.vivos(EPW.d.ing).filter(function(z){ return z.id === id; })[0]; if(!x) return;
  confirmar('¿Quitar este ingreso?', _epwNom(x.e) + ' · ' + x.c + ' · ' + fechaLarga(x.f) + '. El stock se vuelve a calcular sin él, aquí y en la app.', { si:'Sí, quitarlo', mal:true }).then(function(si){
    if(!si) return;
    var y = JSON.parse(JSON.stringify(x)); y.b = 1; epwPoner('ing', y); epwPintarTab();
  });
}
/* el requerimiento armado: lo que está por debajo de su mínimo, para llegar al doble del mínimo, con las tallas de la gente */
function epwPedir(){
  var D = EPW.d, S = EPPB.stock(_epwUsables(), D.ing, EPW.kardex).filter(function(r){ return r.bajo; });
  if(!S.length || typeof prqPuede !== 'function' || !prqPuede()) return;
  PRQ.alEntrarBase = { clase:'epp', prioridad:'normal', motivo:'Reposición: stock por debajo del mínimo (EPP de la obra).',
    items:S.map(function(r){ return { d:r.n, u:_epwUnidad(r.n), c:String(EPPB.pedirPara(r)), e:EPPB.tallasTexto(EPPB.tallasPara(D.cat, D.puestos, D.tallas, EPW.gente, r.id)),
      s:'En almacén: ' + r.stock + ' · mínimo: ' + r.min + ' · se pide para llegar al doble del mínimo.' }; }) };
  PRQ.alEntrar = true;
  navegar('reqs');
}

/* (5) las tallas de la gente */
function _epwTallas(){
  var D = EPW.d, A = EPPB.activos(EPW.gente), con = A.filter(function(t){ var x = EPPB.tallasDe(D.tallas, t.id); return x && (x.c || x.r || x.g); }).length;
  var h = '<div class="rej epw-rej">' + cifra('Con sus tallas', con, 'de ' + A.length + ' activos', '') + cifra('Sin tallas', A.length - con, 'pónselas aquí o en su ficha de la app', (A.length - con) ? 'ojo' : 'ok') + '</div>';
  var res = [['c', 'Calzado'], ['r', 'Ropa'], ['g', 'Guantes']].map(function(k){
    var cu = {}; A.forEach(function(t){ var x = EPPB.tallasDe(D.tallas, t.id), v = x && x[k[0]]; if(v) cu[v] = (cu[v] || 0) + 1; });
    var L = EPPB.TALLAS_OP[k[0]].filter(function(v){ return cu[v]; }).map(function(v){ return '<b>' + esc(v) + '</b> (' + cu[v] + ')'; });
    return L.length ? '<span>' + k[1] + ': ' + L.join(' · ') + '</span>' : '';
  }).filter(Boolean);
  if(res.length) h += '<div class="epw-res">' + res.join('') + '</div><p class="epw-sub">Para el pedido: cuántos de cada talla. El requerimiento de reposición sale con las tallas de la gente que usa cada EPP.</p>';
  h += '<input type="search" class="epw-busca" id="epw-q" placeholder="Buscar por nombre, documento o puesto" autocomplete="off" value="' + esc(EPW.q) + '">';
  return h + '<div id="epw-tallas-l">' + _epwTallasTabla() + '</div>';
}
function _epwTallasTabla(){
  var D = EPW.d, q = EPPB.nrm(EPW.q), A = EPPB.activos(EPW.gente);
  if(q) A = A.filter(function(t){ return EPPB.nrm(t.nombre + ' ' + t.dni + ' ' + t.puesto).indexOf(q) >= 0; });
  if(!A.length) return '<div class="vacio"><b>Nadie con «' + esc(EPW.q) + '»</b>Prueba con otra parte del nombre o del documento.</div>';
  var sel = function(id, k, v){ return '<select aria-label="' + ({ c:'Calzado', r:'Ropa', g:'Guantes' }[k]) + '" data-ta="' + esc(id) + '" data-k="' + k + '"><option value="">—</option>' + EPPB.TALLAS_OP[k].map(function(o){ return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>'; };
  return '<div class="tarj"><div class="tabla-caja"><table class="epw-tabla epw-tallas"><thead><tr><th>Trabajador</th><th>Puesto</th><th>Calzado</th><th>Ropa</th><th>Guantes</th></tr></thead><tbody>' + A.slice(0, 400).map(function(t){
    var x = EPPB.tallasDe(D.tallas, t.id) || {};
    return '<tr><td>' + esc(t.nombre) + (t.dni ? '<span class="sub">' + esc(t.dni) + '</span>' : '') + '</td><td>' + esc(t.puesto) + '</td><td>' + sel(t.id, 'c', x.c) + '</td><td>' + sel(t.id, 'r', x.r) + '</td><td>' + sel(t.id, 'g', x.g) + '</td></tr>';
  }).join('') + '</tbody></table></div></div>';
}
function epwTalla(trId, k, v){
  var x = EPPB.tallasDe(EPW.d.tallas, trId) || { id:trId, c:'', r:'', g:'' }, y = { id:trId, c:x.c || '', r:x.r || '', g:x.g || '' };
  y[k] = v; epwPoner('tallas', y);
}

/* el catálogo: el tiempo de cambio, el mínimo, el precio y la talla de cada EPP */
function _epwCatHTML(){
  var T = _epwCat(), C = T.filter(function(z){ return !z.sug; }), L = T.filter(function(z){ return z.sug; });
  var h = '<p class="epw-sub">Los EPP de tu obra (los que ya se entregaron en el kardex salen solos). Pon cada cuánto se cambia cada uno, el stock mínimo del almacén, su precio y si lleva talla: con eso salen los cambios, el stock y el costo.</p>';
  h += '<div class="epw-acc"><input id="epw-c-n" maxlength="80" placeholder="Agregar un EPP: Guantes de nitrilo…" autocomplete="off" style="max-width:340px"><button type="button" class="bt sec" data-acc="cat-agregar">＋ Agregar</button></div>';
  if(C.length){
    h += '<div class="tarj"><div class="tabla-caja"><table class="epw-tabla"><thead><tr><th>EPP</th><th>Cambio</th><th>Mínimo en almacén</th><th>Precio (' + esc(_epwMon()) + ')</th><th>Talla</th></tr></thead><tbody>' + C.map(function(z){
      var cam = EPPB.CAMBIOS.map(function(o){ return '<option value="' + o[0] + '"' + (z.cambio === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') +
                (EPPB.CAMBIOS.some(function(o){ return o[0] === z.cambio; }) ? '' : '<option value="' + z.cambio + '" selected>' + esc(EPPB.cambioN(z.cambio)) + '</option>');
      return '<tr data-id="' + esc(z.id) + '"><td>' + esc(z.n) + (z.nuevo ? ' <span class="pill ojo">sin guardar</span>' : '') + '</td>' +
        '<td><select aria-label="Cambio" data-cat="' + esc(z.id) + '" data-k="cambio">' + cam + '</select></td>' +
        '<td><input type="number" min="0" inputmode="numeric" aria-label="Mínimo" data-cat="' + esc(z.id) + '" data-k="min" value="' + (z.min || '') + '" placeholder="0"></td>' +
        '<td><input type="number" min="0" step="0.01" inputmode="decimal" aria-label="Precio" data-cat="' + esc(z.id) + '" data-k="precio" value="' + (z.precio || '') + '" placeholder="0.00"></td>' +
        '<td><select aria-label="Talla" data-cat="' + esc(z.id) + '" data-k="talla">' + EPPB.TALLAS.map(function(o){ return '<option value="' + o[0] + '"' + (z.talla === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></td></tr>';
    }).join('') + '</tbody></table></div></div>';
  } else h += '<div class="vacio"><b>Todavía no hay EPP en la obra</b>Salen solos de las entregas del kardex, o agrégalos arriba o de la lista general.</div>';
  if(L.length) h += '<details class="epw-lista"' + (EPW.listaAbierta ? ' open' : '') + ' id="epw-c-lista"><summary>Más de la lista general (' + L.length + '): toca para agregar</summary><div class="epw-chips">' +
    L.map(function(z){ return '<button type="button" class="epw-chip" data-acc="cat-sug:' + esc(z.id) + '">＋ ' + esc(z.n) + '</button>'; }).join('') + '</div></details>';
  return h;
}
function epwCatCampo(id, k, v){
  var z = _epwCat().filter(function(x){ return x.id === id; })[0]; if(!z) return;
  z = JSON.parse(JSON.stringify(z)); delete z.nuevo; delete z.sug;
  z[k] = v; epwPoner('cat', z);
  var tr = document.querySelector('#epw-cuerpo tr[data-id="' + id + '"] .pill'); if(tr) tr.parentNode.removeChild(tr);
}
function epwCatAgregar(){
  var i = $('epw-c-n'), n = String((i || {}).value || '').replace(/\s+/g, ' ').trim();
  if(n.length < 3){ toast('Escribe el nombre del EPP.'); return; }
  var id = EPPB.idDe(n); if(!id) return;
  if(!EPPB.vivos(EPW.d.cat).some(function(z){ return z.id === id; })) epwPoner('cat', { id:id, n:n, cambio:0, min:0, precio:0, talla:EPPB.tallaSugerida(n) });
  epwPintarTab();
}

/* (8) el costo de lo entregado */
function _epwCosto(){
  var D = EPW.d, h0 = _epwHoy(), desde, hasta = h0, per;
  if(EPW.costo === 'ant'){ var m = _epwMesDe('ant'); desde = m + '-01'; hasta = EPPB.masDias(_epwMesDe('mes') + '-01', -1); per = 'el mes pasado'; }
  else if(EPW.costo === 'anio'){ desde = h0.slice(0, 4) + '-01-01'; per = 'este año'; }
  else { desde = h0.slice(0, 7) + '-01'; per = 'este mes'; }
  var R = EPPB.costo(D.cat, D.ing, EPW.kardex, desde, hasta);
  var h = '<div class="epw-acc"><div class="seg" style="margin:0">' + [['mes', 'Este mes'], ['ant', 'El mes pasado'], ['anio', 'Este año']].map(function(o){
    return '<button type="button" data-acc="costo:' + o[0] + '" class="' + (EPW.costo === o[0] ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
  h += '<div class="rej epw-rej">' + cifra('EPP entregado', _epwPlata(R.total), per, '') + cifra('Por trabajador', _epwPlata(R.prom), R.trab + (R.trab === 1 ? ' persona recibió' : ' personas recibieron'), '') +
       cifra('Sin precio', R.sinPrecio.length, R.sinPrecio.length ? 'no cuentan hasta tener precio' : 'todo tiene precio', R.sinPrecio.length ? 'ojo' : 'ok') + '</div>';
  if(R.sinPrecio.length) h += _epwIrCat('<b>Sin precio:</b> ' + esc(R.sinPrecio.slice(0, 12).join(', ')) + (R.sinPrecio.length > 12 ? '…' : '') + '. No cuentan en el costo hasta que tengan su precio (en «Catálogo», o en el ingreso al almacén).');
  if(R.porEpp.length) h += '<div class="tarj"><div class="tabla-caja"><table><thead><tr><th>EPP</th><th class="num">Entregados</th><th class="num">Costo</th></tr></thead><tbody>' +
    R.porEpp.map(function(x){ return '<tr><td>' + esc(x.n) + '</td><td class="num">' + x.c + '</td><td class="num">' + esc(_epwPlata(x.s)) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  else if(!R.sinPrecio.length) h += '<div class="vacio"><b>No hubo entregas en ese periodo</b>El costo sale de lo entregado en el kardex por el precio de cada EPP.</div>';
  return h;
}

/* ── los toques ── */
function _epwClic(ev){
  var b = ev.target.closest ? ev.target.closest('[data-acc]') : null; if(!b) return;
  var a = b.getAttribute('data-acc'), i = a.indexOf(':'), k = i < 0 ? a : a.slice(0, i), v = i < 0 ? '' : a.slice(i + 1);
  if(k === 'tab') epwTab(v);
  else if(k === 'ver'){ EPW.ver = v; epwPintarTab(); }
  else if(k === 'costo'){ EPW.costo = v; epwPintarTab(); }
  else if(k === 'ing-guardar') epwIngresoGuardar();
  else if(k === 'ing-quitar') epwIngresoQuitar(v);
  else if(k === 'ing-abrir'){ EPW.ingE = v; var s = $('epw-i-e'); if(s){ s.value = v; try{ s.scrollIntoView({ block:'center', behavior:'smooth' }); $('epw-i-c').focus({ preventScroll:true }); }catch(_s){} } }
  else if(k === 'req') epwPedir();
  else if(k === 'cat-agregar') epwCatAgregar();
  else if(k === 'cat-sug'){ EPW.listaAbierta = true; _epwAsegurar(v); epwPintarTab(); }
}
function _epwCambio(ev){
  var t = ev.target; if(!t || !t.getAttribute) return;
  if(t.hasAttribute('data-pu')) epwPuestoToca(t.getAttribute('data-pu'), t.getAttribute('data-p'), t.getAttribute('data-e'), !!t.checked);
  else if(t.hasAttribute('data-cat')) epwCatCampo(t.getAttribute('data-cat'), t.getAttribute('data-k'), t.value);
  else if(t.hasAttribute('data-ta')) epwTalla(t.getAttribute('data-ta'), t.getAttribute('data-k'), t.value);
  else if(t.id === 'epw-i-e') EPW.ingE = t.value;
}
function _epwEscribe(ev){
  var t = ev.target; if(!t) return;
  if(t.id === 'epw-q'){ EPW.q = t.value; var l = $('epw-tallas-l'); if(l) l.innerHTML = _epwTallasTabla(); }
}
(function(){ document.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' && ev.target && ev.target.id === 'epw-c-n'){ ev.preventDefault(); epwCatAgregar(); } }); })();

/* ── la lista que se ve, en Excel (CSV) ── */
function epwCsv(){
  if(!EPW.d) return;
  var D = EPW.d, n = 'epp-' + EPW.tab, cols = [], filas = [];
  if(EPW.tab === 'cambios'){
    filas = EPPB.cambios(D.cat, EPW.kardex, EPW.gente, { aviso:15, hoy:_epwHoy() });
    cols = [{ t:'Trabajador', k:'nom' }, { t:'Puesto', v:function(x){ return _epwPuestoDe(x.tr); } }, { t:'EPP', k:'n' }, { t:'Se le dio', v:function(x){ return fechaLarga(x.ult); } }, { t:'Vence', v:function(x){ return fechaLarga(x.vence); } },
            { t:'Días', v:function(x){ return x.d; } }];
  } else if(EPW.tab === 'puestos'){
    filas = EPPB.completos(D.cat, D.puestos, EPW.kardex, EPPB.activos(EPW.gente), { hoy:_epwHoy() }).gente;
    cols = [{ t:'Trabajador', k:'nom' }, { t:'Puesto', k:'p' }, { t:'Su puesto lleva', v:function(g){ return g.lleva.map(_epwNom).join(', '); } }, { t:'Le falta', v:function(g){ return g.falta.map(_epwNom).join(', '); } }];
  } else if(EPW.tab === 'verif'){
    var mes = _epwMesDe(EPW.ver);
    filas = EPPB.vivos(D.verif).filter(function(v){ return String(v.f).slice(0, 7) === mes; });
    cols = [{ t:'Fecha', v:function(v){ return fechaLarga(v.f); } }, { t:'Trabajador', k:'nom' }, { t:'Puesto', k:'p' }, { t:'Resultado', v:function(v){ return v.falta.length ? 'Le faltaba: ' + v.falta.map(_epwNom).join(', ') : 'Completo'; } }, { t:'Verificó', k:'quien' }];
  } else if(EPW.tab === 'stock'){
    filas = EPPB.stock(_epwUsables(), D.ing, EPW.kardex);
    cols = [{ t:'EPP', k:'n' }, { t:'Mínimo', k:'min' }, { t:'Entró', v:function(r){ return r.conIng ? r.ing : ''; } }, { t:'Salió', v:function(r){ return r.conIng ? r.sal : ''; } }, { t:'Hay', v:function(r){ return r.conIng ? r.stock : ''; } },
            { t:'Desde', v:function(r){ return r.desde ? fechaLarga(r.desde) : ''; } }, { t:'Estado', v:function(r){ return !r.conIng ? 'Sin inventario' : (r.bajo ? 'Bajo el mínimo' : 'Bien'); } }];
  } else if(EPW.tab === 'tallas'){
    filas = EPPB.activos(EPW.gente);
    var ta = function(t, k){ var x = EPPB.tallasDe(D.tallas, t.id); return (x && x[k]) || ''; };
    cols = [{ t:'Trabajador', k:'nombre' }, { t:'Documento', k:'dni' }, { t:'Puesto', k:'puesto' }, { t:'Calzado', v:function(t){ return ta(t, 'c'); } }, { t:'Ropa', v:function(t){ return ta(t, 'r'); } }, { t:'Guantes', v:function(t){ return ta(t, 'g'); } }];
  } else if(EPW.tab === 'cat'){
    filas = _epwUsables();
    cols = [{ t:'EPP', k:'n' }, { t:'Cambio', v:function(z){ return EPPB.cambioN(z.cambio); } }, { t:'Mínimo en almacén', k:'min' }, { t:'Precio (' + _epwMon() + ')', k:'precio' },
            { t:'Talla', v:function(z){ return (EPPB.TALLAS.filter(function(o){ return o[0] === z.talla; })[0] || ['', ''])[1]; } }];
  } else {
    var h0 = _epwHoy(), de = EPW.costo === 'anio' ? h0.slice(0, 4) + '-01-01' : (EPW.costo === 'ant' ? _epwMesDe('ant') + '-01' : h0.slice(0, 7) + '-01'), a = EPW.costo === 'ant' ? EPPB.masDias(_epwMesDe('mes') + '-01', -1) : h0;
    filas = EPPB.costo(D.cat, D.ing, EPW.kardex, de, a).porEpp;
    cols = [{ t:'EPP', k:'n' }, { t:'Entregados', k:'c' }, { t:'Costo (' + _epwMon() + ')', v:function(x){ return (Math.round(x.s * 100) / 100).toFixed(2); } }];
  }
  if(!filas.length){ toast('Esta lista está vacía.'); return; }
  csv(cols, filas, n);
}
