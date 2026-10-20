/* OBRASST · portal · LA SEÑALÉTICA (07/10/2026)
   Marcelo: «Señaléticas no he visto en la web, agregalo.»
   Lo mismo que el acceso «Señalética» de la app, hecho para la pantalla de la oficina (donde está la impresora):
     · las 171 señales de la NTP 399.010-1, con su cartel (palabra de aviso, texto, renglón de abajo), el tamaño de la
       hoja y cuántas van en cada una;
     · el cartel de «personal autorizado», con las caras de la gente de la obra y los seis modelos de siempre;
     · las tarjetas de andamio (el semáforo y la de equipo defectuoso).
   Y dos cosas que el celular no tiene: la VISTA PREVIA es el PDF de verdad, que se va rehaciendo mientras se escribe,
   y la LISTA PARA IMPRIMIR, que junta varias señales distintas en un solo PDF.
   El dibujo de cada hoja NO está aquí: es el de la app (senales-app.js, que arma armar.py). Aquí van las pantallas.
   Lo que cuenta en el cupo del plan (LITE: 10 señales y 5 hojas de tarjetas al mes) son los mismos contadores de la
   app (sst_uso): se suma al bajar o imprimir, una vez por cada hoja distinta. Mirar la vista previa no gasta.
   Fuera del Perú la app esconde las señales de la NTP y el cartel de personal autorizado; aquí igual: queda la
   pestaña de las tarjetas de andamio. */
var SN_ESTADO = 'senp';      /* sst_estado: los carteles de «personal autorizado» que la obra dejó armados */
var SN_LISTA_MAX = 60;       /* cuántas señales distintas entran en la lista para imprimir */
var SNW = { obra:null, tab:'', caja:null, filtro:'', busca:'', idx:null,
            lista:[], lop:null, op:{ tam:'A4', orient:'v', porHoja:1 },
            ctx:null, ctxObra:null, ctxT:0, gente:null, genteObra:null, genteT:0,
            and:null, uso:null, T:null };

function _snCss(){
  if($('sn-css')) return;
  var st=document.createElement('style'); st.id='sn-css';
  st.textContent=[
    '.hoja.ancha.sn-h{width:min(1180px,100%)}',
    '.sn-tabs{max-width:100%;flex-wrap:wrap}',
    '.sn-panel{background:var(--panel);border:1px solid var(--raya);border-radius:12px;padding:18px 18px 20px}',
    '.sn-panel .sn-lado{top:72px}',
    '.sn-acc{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 0}',
    '.sn-intro{margin:0 0 14px;font-size:14px;color:var(--texto);line-height:1.55;max-width:860px}',
    '.sn-cupo{margin:-6px 0 14px;font-size:12.5px;color:var(--gris)}.sn-cupo b{color:var(--tinta);font-weight:600}',
    '.sn-herr{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin:0 0 6px}.sn-herr input[type=search]{flex:1 1 260px;max-width:420px;min-width:0}',
    '.sn-cuantas{margin:10px 0 8px;font-size:12.5px;color:var(--gris)}',
    /* el catálogo */
    '.sn-rej{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px}',
    '.sn-c{position:relative;display:flex}',
    '.sn-c-b{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:8px;border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:12px 8px 10px;color:var(--texto);transition:border-color .12s,box-shadow .12s}',
    '.sn-c-b:hover{border-color:var(--raya2);box-shadow:var(--sombra)}',
    '.sn-ic{position:relative;display:block;width:84px;height:84px}.sn-ic svg{display:block;width:84px;height:84px}',
    '.sn-fr{display:block;width:46px;height:4px;border-radius:2px;margin:2px auto 0}',
    '.sn-c-b b{font-size:10.5px;font-weight:600;line-height:1.3;color:var(--tinta);text-align:center;letter-spacing:.01em;overflow-wrap:anywhere;text-wrap:balance}',
    '.sn-mas{appearance:none;-webkit-appearance:none;cursor:pointer;position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;border:1px solid var(--raya2);background:var(--panel);color:var(--tinta);font:inherit;font-size:17px;font-weight:600;line-height:1;padding:0;display:grid;place-items:center}',
    '.sn-mas:hover{background:var(--fondo)}.sn-mas.on{background:var(--ok);border-color:var(--ok);color:#fff;font-size:14px}',
    '.sn-c.on .sn-c-b{border-color:var(--ok);box-shadow:0 0 0 2px rgba(30,142,90,.16)}',
    '.sn-nada{padding:26px 14px;text-align:center;color:var(--gris);font-size:14px}',
    '.sn-nota{border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:14px 16px;margin:20px 0 0;font-size:13px;color:var(--gris);line-height:1.6;max-width:860px}.sn-nota b{color:var(--tinta)}.sn-nota p{margin:0}.sn-nota p+p{margin-top:8px}',
    /* la lista para imprimir: la barra de abajo y su hoja */
    '.sn-lb{position:sticky;bottom:14px;z-index:5;display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;justify-content:space-between;margin:16px 0 0;padding:11px 14px;border-radius:12px;background:var(--tinta);color:#fff;box-shadow:0 10px 30px -14px rgba(11,42,58,.7);font-size:14px}',
    '.sn-lb b{font-weight:600}.sn-lb .acciones{gap:8px}.sn-lb .bt{background:#fff;color:var(--tinta);border-color:#fff}.sn-lb .bt:hover{background:#EAF1F5}.sn-lb .bt.sec{background:transparent;color:#fff;border-color:rgba(255,255,255,.45)}.sn-lb .bt.sec:hover{background:rgba(255,255,255,.12)}',
    '.sn-l{display:grid;gap:8px;margin:0 0 16px}',
    '.sn-li{display:grid;grid-template-columns:52px minmax(0,.8fr) minmax(0,1.5fr) minmax(0,1.3fr) auto 30px;gap:8px;align-items:center;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:8px}',
    '.sn-li svg{display:block;width:48px;height:48px}.sn-li input{padding:7px 9px;font-size:13.5px;min-width:0}',
    '.sn-cop{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--raya2);border-radius:8px;background:var(--panel)}',
    '.sn-cop button{appearance:none;-webkit-appearance:none;cursor:pointer;border:0;background:transparent;color:var(--tinta);font:inherit;font-size:16px;line-height:1;width:28px;height:32px;padding:0;border-radius:7px}.sn-cop button:hover{background:var(--fondo)}.sn-cop button[disabled]{opacity:.35;cursor:default}',
    '.sn-cop b{min-width:22px;text-align:center;font-weight:600;font-size:13.5px;font-variant-numeric:tabular-nums;color:var(--tinta)}',
    '.sn-x{appearance:none;-webkit-appearance:none;cursor:pointer;border:0;background:transparent;color:var(--gris);font-size:19px;line-height:1;padding:5px 0;border-radius:6px}.sn-x:hover{color:var(--mal);background:var(--mal-f)}',
    '.sn-li-et{display:none}',
    /* el editor: el formulario y, al lado, la hoja */
    '.sn-ed{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,400px);gap:8px 26px;align-items:start}',
    '.sn-ed.echada{grid-template-columns:minmax(0,1fr) minmax(300px,480px)}',
    '.sn-form .campo small,.sn-form label small{font-weight:400;opacity:.8}',
    '.sn-form>.campo>label{font-size:13px;color:var(--tinta);font-weight:600}',
    '.sn-lado{position:sticky;top:0;display:grid;gap:10px;min-width:0}',
    '.sn-prev{border:1px solid var(--raya);border-radius:12px;background:#EEF1F4;padding:12px;display:grid;gap:12px;min-height:180px;transition:opacity .15s}',
    '.sn-prev.viene{opacity:.62}',
    '.sn-pag{background:#fff;border-radius:3px;box-shadow:0 1px 5px rgba(0,0,0,.2);overflow:hidden;width:100%}.sn-pag canvas{display:block;width:100%;height:100%}',
    '.sn-prev-msg{align-self:center;justify-self:center;text-align:center;font-size:13px;color:var(--gris);padding:26px 10px;line-height:1.5}.sn-prev-msg b{display:block;color:var(--texto);font-weight:500;margin:0 0 4px}',
    '.sn-mas-p{margin:0;font-size:12px;color:var(--gris);text-align:center}',
    '.sn-med{font-size:13px;line-height:1.55;color:var(--texto)}.sn-med p{margin:0}.sn-med p+p{margin-top:6px}.sn-med b{color:var(--tinta);font-weight:600}',
    '.sn-med .ojo{background:var(--ojo-f);border:1px solid #EED9A8;border-radius:9px;padding:9px 11px}.sn-med .gris{color:var(--gris);font-size:12.5px}',
    '.sn-logo{font-size:12.5px;color:var(--gris);line-height:1.5;margin:4px 0 0}.sn-logo b{color:var(--tinta)}',
    '.sn-pie-msg{margin:0 auto 0 0;min-height:0;align-self:center}',
    /* lote 15 · los carteles propios */
    '.sn-sub{font-size:14px;font-weight:600;color:var(--tinta);margin:20px 0 10px}',
    '.snx-l{display:grid;gap:8px;margin:0 0 6px;max-width:860px}',
    '.snx-f{display:flex;gap:6px;align-items:stretch}',
    '.snx-f-b{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;text-align:left;flex:1;min-width:0;display:flex;gap:12px;align-items:center;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:10px 12px;color:var(--texto)}',
    '.snx-f-b:hover{border-color:var(--raya2)}.snx-f-b>span{min-width:0}',
    '.snx-f-b b{display:block;color:var(--tinta);font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.snx-f-b small{display:flex;flex-wrap:wrap;align-items:center;gap:4px;color:var(--gris);font-size:12.5px;margin-top:2px}.snx-f-b small svg{display:inline-block;width:18px;height:18px}',
    '.snx-sw{flex:0 0 auto;display:block;width:26px;height:26px;border-radius:6px}',
    '.snx-ic{border-radius:12px}.snx-ic>span{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#fff}.snx-ic>span svg{width:34px;height:34px}.snx-ic>i{font-style:normal;color:#fff;font-weight:700;font-size:24px}',
    '.snx-pks{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}',
    '.snx-pk{display:flex;align-items:center;gap:8px;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:4px 4px 4px 6px;max-width:100%}.snx-pk svg{flex:0 0 auto;display:block;width:34px;height:34px}.snx-pk b{font-size:12px;font-weight:600;color:var(--tinta);line-height:1.25;max-width:200px}',
    '.snx-pick{margin:10px 0 0;display:grid;gap:8px}',
    /* lote 15 · la señal con el QR de cada equipo */
    '.sn-qr-sw{display:flex;align-items:center;gap:9px;font-size:13.5px;font-weight:600;color:var(--tinta);cursor:pointer}.sn-qr-sw input{flex:0 0 auto;width:18px;height:18px;margin:0;accent-color:var(--ok)}',
    '.sn-qr-cab{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;margin:10px 0 6px;font-size:13px}.sn-qr-cab b{font-variant-numeric:tabular-nums;color:var(--tinta);font-weight:600}',
    '.sn-eqs{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px;max-height:300px;overflow:auto;padding:2px}',
    '.sn-eq{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) 22px;gap:8px;align-items:center;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:7px 10px;color:var(--texto)}',
    '.sn-eq:hover{border-color:var(--raya2)}.sn-eq.on{border-color:var(--ok);background:#F4FBF7}',
    '.sn-eq b{display:block;font-weight:600;color:var(--tinta);font-size:13.5px}.sn-eq small{display:block;color:var(--gris);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.sn-eq .tic{width:22px;height:22px;border-radius:6px;border:1px solid var(--raya2);display:grid;place-items:center;font-size:13px;font-style:normal;color:#fff;background:var(--panel)}.sn-eq.on .tic{background:var(--ok);border-color:var(--ok)}',
    /* personal autorizado */
    '.sn-mods{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}',
    '.sn-mod{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;text-align:left;display:flex;gap:13px;align-items:center;border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:13px 14px;color:var(--texto);transition:border-color .12s,box-shadow .12s}',
    '.sn-mod:hover{border-color:var(--raya2);box-shadow:var(--sombra)}.sn-mod-ic{flex:0 0 54px;width:54px;height:54px;display:grid;place-items:center;font-size:28px}.sn-mod-ic svg{display:block;width:54px;height:54px}',
    '.sn-mod b{display:block;color:var(--tinta);font-weight:600;font-size:14.5px}.sn-mod small{display:block;color:var(--gris);font-size:12.5px;line-height:1.4;margin-top:1px}.sn-mod .pill{margin-top:6px}',
    '.sn-mod.blanco{border-style:dashed;background:#FAFBFC}',
    '.sn-pic{display:flex;gap:11px;align-items:center;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:8px 10px;margin:0 0 8px}.sn-pic svg{display:block;width:46px;height:46px;flex:0 0 auto}.sn-pic b{flex:1;min-width:0;font-size:12.5px;color:var(--tinta);font-weight:600;line-height:1.35}',
    '.sn-cat{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin:10px 0 0;max-height:330px;overflow:auto;padding:2px}',
    '.sn-cat button{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;display:flex;flex-direction:column;align-items:center;gap:6px;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:8px 5px;color:var(--tinta)}',
    '.sn-cat button:hover{border-color:var(--raya2);background:var(--fondo)}.sn-cat button.on{border-color:var(--tinta);box-shadow:0 0 0 2px var(--tinta) inset}.sn-cat svg{display:block;width:56px;height:56px}.sn-cat b{font-size:9.5px;font-weight:600;line-height:1.25;text-align:center;overflow-wrap:anywhere}',
    '.sn-prop{margin:0 0 10px;font-size:13px;color:var(--texto);line-height:1.5;background:var(--azul-f);border:1px solid #CFDDF0;border-radius:9px;padding:9px 11px}.sn-prop b{color:var(--tinta)}',
    '.sn-gente{display:grid;gap:6px;margin:8px 0 0}',
    '.sn-per{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;text-align:left;display:grid;grid-template-columns:40px minmax(0,1fr) auto 24px;gap:11px;align-items:center;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:7px 10px;color:var(--texto)}',
    '.sn-per:hover{border-color:var(--raya2)}.sn-per.on{border-color:var(--ok);background:#F4FBF7}',
    '.sn-per .ini{width:40px;height:40px;border-radius:50%;background:var(--fondo);color:var(--gris);display:grid;place-items:center;font-size:13px;font-weight:600;overflow:hidden}.sn-per .ini img{width:100%;height:100%;object-fit:cover;display:block}',
    '.sn-per b{display:block;font-weight:500;color:var(--tinta);font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sn-per small{display:block;color:var(--gris);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.sn-per small.pr{color:var(--azul);font-weight:500}.sn-per .ord{font-size:12px;font-weight:600;color:var(--ok);font-variant-numeric:tabular-nums}.sn-per .tic{width:22px;height:22px;border-radius:6px;border:1px solid var(--raya2);display:grid;place-items:center;font-size:13px;color:#fff;background:var(--panel)}.sn-per.on .tic{background:var(--ok);border-color:var(--ok)}',
    /* tarjetas de andamio */
    '.sn-and{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 8px}',
    '.sn-and button{appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:7px;border:1px solid var(--raya);border-radius:11px;background:var(--panel);padding:0 0 9px;overflow:hidden;color:var(--tinta);text-align:center}',
    '.sn-and button i{display:block;height:34px;background:var(--c);border-bottom:1px solid rgba(0,0,0,.14)}.sn-and button b{font-size:12.5px;font-weight:600;padding:0 8px;line-height:1.3}',
    '.sn-and button:hover{border-color:var(--raya2)}.sn-and button.on{border-color:var(--tinta);box-shadow:0 0 0 2px var(--tinta)}',
    '@media (max-width:900px){',
    '.sn-ed,.sn-ed.echada{grid-template-columns:minmax(0,1fr)}.sn-lado{display:contents}.sn-prev{order:-2;max-width:270px;width:100%;justify-self:center;min-height:120px;margin:0 0 4px}.sn-ed.echada .sn-prev{max-width:360px}',
    '.sn-med{order:-1;margin:0 0 14px}.sn-acc{order:1;margin:14px 0 0}.sn-and{grid-template-columns:repeat(2,minmax(0,1fr))}',
    '.sn-li{grid-template-columns:52px minmax(0,1fr) 30px;align-items:start}.sn-li>.sn-li-ic{grid-row:1 / span 3}.sn-li>input{grid-column:2}.sn-li>.sn-cop{grid-column:2;justify-self:start}.sn-li>.sn-x{grid-column:3;grid-row:1}',
    '.sn-rej{grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:8px}.sn-ic,.sn-ic svg{width:70px;height:70px}',
    '.sn-lb{bottom:10px}',
    '}'
  ].join('\n');
  document.head.appendChild(st);
}

/* ── lo de la obra que va en el papel: la empresa, su logo y el nombre de la obra ─────────────── */
function snCtx(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && SNW.ctx && SNW.ctxObra===oid && Date.now()-SNW.ctxT<120000) return Promise.resolve(SNW.ctx);
  return empleadorP().then(null, function(){ return null; }).then(function(emp){
    emp=emp||{};
    var logo=/^data:image\//.test(String(emp.logo||'')) ? emp.logo : null;
    return SEN_APP.logo(logo).then(null, function(){ return null; }).then(function(L){
      SNW.ctx={ emp:{ razon:String(emp.razon||''), logo:logo }, logo:L, obra:String(nombreObraP()||''), trabs:[], creds:{} };
      SNW.ctxObra=oid; SNW.ctxT=Date.now();
      return SNW.ctx;
    });
  });
}
/* de quién es el logo, dicho aquí: el cartel se imprime y se clava en la obra, y un logo equivocado se ve cuando ya
   hay cincuenta pegados */
function snLogoNota(C, que){
  var q=String((C && C.emp && C.emp.razon)||'').trim();
  if(C && C.emp && C.emp.logo) return '<p class="sn-logo" id="sn-logo">'+(q ? 'Sale con el logo de <b>'+esc(q)+'</b>'+(/[.!?]$/.test(q) ? ' ' : '. ') : 'Sale con el logo de tu empresa. ')+esc(que||'')+'</p>';
  return '<p class="sn-logo" id="sn-logo"><b>Sin logo de la empresa.</b> Se carga en la app, en «Datos de mi empresa», y desde ahí sale en todos los carteles.</p>';
}

/* ── el cupo del plan: los contadores de la app (sst_uso). Decide el plan que el portal muestra; sin poder leerlos no
      se frena (como la app sin señal) ── */
function _snTope(clave){
  var P=planWebActual(), tope=(P && P.tope && typeof P.tope[clave]==='number') ? P.tope[clave] : -1;
  return { P:P, tope:tope, porMes:!!(P && (P.mes||[]).indexOf(clave)>-1) };
}
function snUso(){
  return sbRpc('sst_uso_leer', { p_emp:YO.obra.id }).then(function(j){ SNW.uso=(j && j.ok) ? { m:j.m||{}, t:j.t||{} } : null; return SNW.uso; }, function(){ SNW.uso=null; return null; });
}
function snCupo(clave, pide){
  pide=Math.max(1, pide||1);
  var X=_snTope(clave);
  if(X.tope<0) return Promise.resolve({ ok:true });
  return snUso().then(function(u){
    if(!u) return { ok:true };
    var n=+((X.porMes ? u.m : u.t)[clave])||0;
    return { ok:(n+pide<=X.tope), tope:X.tope, lleva:n, pide:pide, porMes:X.porMes, plan:X.P.n };
  });
}
function snSumar(clave, n){
  n=Math.max(1, Math.min(500, n||1));
  try{
    if(SNW.uso){ SNW.uso.m[clave]=(+SNW.uso.m[clave]||0)+n; SNW.uso.t[clave]=(+SNW.uso.t[clave]||0)+n; }
    sbRpc('sst_uso_sumar', { p_emp:YO.obra.id, p_clave:clave, p_n:n }).then(function(){}, function(){});
  }catch(e){}
  snCupoPinta();
}
function snTope(r, que){
  var quedan=Math.max(0, r.tope-r.lleva);
  var texto=(r.pide>1 && quedan>0)
    ? 'Ya van '+r.lleva+' '+que+(r.porMes ? ' este mes' : '')+' y el plan '+r.plan+' llega a '+r.tope+': '+(quedan===1 ? 'queda 1' : 'quedan '+quedan)+' y en la lista hay '+r.pide+'. Quita algunas de la lista, o cambia de plan.'
    : 'Ya van '+r.lleva+' '+que+(r.porMes ? ' este mes' : '')+' y el plan '+r.plan+' llega a '+r.tope+'. La vista previa se sigue viendo; para bajar o imprimir más hace falta un plan mayor'+(r.porMes ? ', o esperar al mes que viene' : '')+'.';
  return dialogo({ titulo:'Llegaste al tope de tu plan', texto:texto, si:(planwPuedePagar() ? 'Ver los planes' : 'Ver mi plan'), no:'Cerrar' })
    .then(function(v){ if(v===true){ cerrarHoja(); navegar('plan'); } });
}
/* «Tu plan LITE trae 10 señales al mes: llevas 3» (solo cuando el plan tiene tope) */
function snCupoPinta(){
  var c=$('sn-cupo'); if(!c) return;
  var clave=c.getAttribute('data-clave'), X=_snTope(clave);
  if(X.tope<0 || !SNW.uso){ c.hidden=true; return; }
  var n=+((X.porMes ? SNW.uso.m : SNW.uso.t)[clave])||0, que=(clave==='andamio') ? ['hoja de tarjetas', 'hojas de tarjetas'] : ['señal', 'señales'];
  c.hidden=false;
  c.innerHTML='Tu plan <b>'+esc(X.P.n)+'</b> trae '+X.tope+' '+que[X.tope===1 ? 0 : 1]+(X.porMes ? ' al mes' : '')+': llevas <b>'+n+'</b>. Se cuentan al bajar o imprimir; mirar la vista previa no gasta.';
}

/* ── la vista previa: el PDF de verdad, dibujado con pdf.js (portal/pdfjs). Se dibuja aparte y se cambia de un golpe:
      mientras se escribe, la hoja anterior sigue a la vista y no parpadea ── */
function snVer(caja, blob, max){
  var yo={}; caja._sn=yo;
  caja.classList.add('viene');
  return pdfjsP().then(function(pdfjs){
    return blob.arrayBuffer().then(function(b){ return pdfjs.getDocument({ data:new Uint8Array(b), isEvalSupported:false }).promise; });
  }).then(function(doc){
    var n=doc.numPages||0, ver=Math.min(n, max||6), i=0, hechas=[];
    function una(){
      if(caja._sn!==yo || !caja.isConnected) return false;
      if(i>=ver) return true;
      return doc.getPage(++i).then(function(pg){
        var w=Math.max(220, (caja.clientWidth||380)-24), dpr=Math.min(2, window.devicePixelRatio||1);
        var v0=pg.getViewport({ scale:1 }), vp=pg.getViewport({ scale:(w/v0.width)*dpr });
        var cv=document.createElement('canvas'); cv.width=Math.max(1, Math.floor(vp.width)); cv.height=Math.max(1, Math.floor(vp.height));
        var el=document.createElement('div'); el.className='sn-pag'; el.style.aspectRatio=(v0.width/v0.height).toFixed(4);
        el.appendChild(cv); hechas.push(el);
        return pg.render({ canvasContext:cv.getContext('2d'), canvas:cv, viewport:vp }).promise.then(una);
      });
    }
    return Promise.resolve(una()).then(function(si){
      try{ doc.destroy(); }catch(e){}
      if(!si || caja._sn!==yo) return false;
      caja.innerHTML=''; hechas.forEach(function(el){ caja.appendChild(el); });
      if(n>ver){ var p=document.createElement('p'); p.className='sn-mas-p'; p.textContent='Aquí se ven las primeras '+ver+' hojas de '+n+': el PDF las trae todas.'; caja.appendChild(p); }
      caja.setAttribute('data-hojas', String(n));
      caja.classList.remove('viene');
      return true;
    });
  }).then(null, function(){
    if(caja._sn!==yo) return false;
    caja.classList.remove('viene'); caja.removeAttribute('data-hojas');
    caja.innerHTML='<div class="sn-prev-msg"><b>La vista previa no se pudo mostrar aquí</b>El PDF se arma igual: bájalo y ábrelo.</div>';
    return false;
  });
}
function snPrevMsg(caja, titulo, texto){
  if(!caja) return;
  caja._sn={}; caja.classList.remove('viene'); caja.removeAttribute('data-hojas');
  caja.innerHTML='<div class="sn-prev-msg"><b>'+esc(titulo)+'</b>'+esc(texto||'')+'</div>';
}

/* ── un «taller»: lo que se está armando, con su vista previa. pide() lo vuelve a armar (con espera, si se está
      escribiendo); listo() entrega el PDF del momento —lo espera si todavía se está armando— ── */
function snTaller(caja, armar, alListo){
  var T={ R:null, n:0, t:null, p:null, v:null };
  function ya(){
    var n=++T.n; T.t=null;
    var p=Promise.resolve().then(armar).then(function(R){
      if(n!==T.n) return (T.p && T.p!==p) ? T.p : null;     /* mientras se armaba se pidió otra: vale la última */
      T.R=R||null;
      if(R && R.blob && caja.isConnected) T.v=snVer(caja, R.blob, R.max||6);
      if(alListo) alListo(R||null, null);
      return T.R;
    }, function(e){
      if(n!==T.n) return (T.p && T.p!==p) ? T.p : null;
      T.R=null;
      if(alListo) alListo(null, e||'mal');
      return null;
    });
    T.p=p;
    return p;
  }
  T.pide=function(espera){
    if(T.t){ clearTimeout(T.t); T.t=null; }
    T.R=null; T.n++;
    caja.classList.add('viene');
    if(espera){ T.t=setTimeout(ya, espera); return null; }
    return ya();
  };
  T.listo=function(){
    if(T.t){ clearTimeout(T.t); T.t=null; return ya(); }
    if(T.R) return Promise.resolve(T.R);
    return T.p ? T.p.then(function(R){ return R || T.R; }) : ya();
  };
  SNW.T=T;
  return T;
}
function snImprimir(R){
  if(!R || !R.blob) return;
  /* el PDF se abre en otra pestaña: ahí está el botón de imprimir del navegador, con su «tamaño real» */
  try{
    var u=URL.createObjectURL(R.blob), w=window.open(u, '_blank');
    if(!w){ bajarBlob(R.blob, R.nombre||'senal.pdf'); toast('El navegador no dejó abrir el PDF: se descargó. Ábrelo e imprímelo desde ahí.'); }
    setTimeout(function(){ try{ URL.revokeObjectURL(u); }catch(e){} }, 60000);
  }catch(e2){ bajarBlob(R.blob, R.nombre||'senal.pdf'); }
}
/* bajar o imprimir lo armado. Se cuenta en el cupo del plan una vez por cada hoja distinta que sale (R.cuenta: cuántas
   señales distintas lleva); lo que ya se contó se puede volver a bajar */
function snEntregar(T, clave, que, como, bt){
  if(!T) return Promise.resolve(null);
  if(bt) bt.disabled=true;
  var suelta=function(){ if(bt) bt.disabled=false; };
  return T.listo().then(function(R){
    if(!R || !R.blob){ suelta(); return null; }
    var cuantas=R.contado ? 0 : Math.max(1, R.cuenta||1);
    return (cuantas ? snCupo(clave, cuantas) : Promise.resolve({ ok:true })).then(function(r){
      suelta();
      if(!r.ok){ snTope(r, que); return null; }
      if(cuantas){ R.contado=true; snSumar(clave, cuantas); }
      if(como==='imp') snImprimir(R); else bajarBlob(R.blob, R.nombre||'senal.pdf');
      return R;
    });
  }).then(null, function(){ suelta(); toast('No se pudo armar el PDF. Revisa tu conexión e inténtalo otra vez.'); return null; });
}
/* las pastillas de una opción (tamaño, orientación, cuántas por hoja): una sola encendida */
function snChips(id, ops, actual, nombre){
  return '<div class="chips" id="'+id+'" role="group" aria-label="'+esc(nombre||'')+'">'+ops.map(function(o){
    var on=String(o.v)===String(actual);
    return '<button type="button" class="chip'+(on ? ' on' : '')+'" data-v="'+esc(o.v)+'" aria-pressed="'+(on ? 'true' : 'false')+'">'+esc(o.t)+(o.s ? ' <i>'+esc(o.s)+'</i>' : '')+'</button>';
  }).join('')+'</div>';
}
function snChipsAl(id, fn){
  var c=$(id); if(!c) return;
  c.onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-v]') : null; if(!b || !c.contains(b)) return;
    Array.prototype.forEach.call(c.querySelectorAll('button[data-v]'), function(x){ var on=(x===b); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    fn(b.getAttribute('data-v'));
  };
}
function snTamOps(){ return SEN_APP.tam.map(function(t){ return { v:t.k, t:t.n, s:t.w+'×'+t.h }; }); }
var SN_ORI=[{ v:'v', t:'Vertical' }, { v:'h', t:'Horizontal' }];
function snHojaTxt(T){ return T ? (T.n+(T.oh ? ' horizontal' : ' vertical')) : ''; }

/* ══ 2 · LA SECCIÓN, Y LA PESTAÑA «SEÑALES DE LA NORMA» ═══════════════════════════════════════
   El catálogo se pinta una vez (son 171 dibujos) y al buscar solo se esconden las que no van. */
var SN_TABS=[['norma', 'Señales de la norma'], ['prop', 'Carteles propios'], ['pers', 'Personal autorizado'], ['and', 'Tarjetas de andamio']];
var SN_GRUPOS=['adv', 'obl', 'proh', 'fuego', 'emer'];
var SN_POR_HOJA=[1, 2, 4, 6, 8, 9, 12, 15];
/* fuera del Perú, como en la app: sin las señales de la NTP ni el cartel de personal autorizado */
function snTabsDe(){ return (paisObraP()==='pe') ? SN_TABS : SN_TABS.filter(function(t){ return t[0]==='and'; }); }

function senVista(caja){
  _snCss();
  var oid=(YO.obra||{}).id;
  if(SNW.obra!==oid){
    SNW.obra=oid; SNW.tab=''; SNW.filtro=''; SNW.busca=''; SNW.gente=null; SNW.ctx=null; SNW.and=null; SNW.uso=null;
    SNW.op={ tam:'A4', orient:'v', porHoja:1 };
    snListaLeer();
  }
  SNW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  var tabs=snTabsDe(), fuera=(tabs.length===1);
  if(!tabs.some(function(t){ return t[0]===SNW.tab; })) SNW.tab=tabs[0][0];
  var h='';
  if(fuera){
    var x=paisInfoP(), sub=document.querySelector('#main .cab .sub');
    if(sub) sub.textContent='Las tarjetas de andamio —el semáforo verde, amarillo y rojo, y la de equipo defectuoso—, listas para imprimir con tu logo';
    h+='<div class="aviso" id="sn-fuera" data-sin-pais>La obra está en '+esc(x.n)+': las señales que trae OBRASST son las de la norma del Perú (NTP 399.010-1) y se esconden hasta que tengan su versión '+esc(paisDeP(x.id))+'. Las tarjetas de andamio se usan igual.</div>';
  }else{
    h+='<div class="seg sn-tabs" id="sn-tabs" role="tablist" aria-label="Qué se va a imprimir">'+tabs.map(function(t){
      var on=(t[0]===SNW.tab);
      return '<button type="button" role="tab" data-tab="'+t[0]+'" class="'+(on ? 'on' : '')+'" aria-selected="'+(on ? 'true' : 'false')+'">'+esc(t[1])+'</button>';
    }).join('')+'</div>';
  }
  h+='<div id="sn-cuerpo"></div>';
  caja.innerHTML=h;
  var tb=$('sn-tabs');
  if(tb) tb.onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-tab]') : null; if(!b) return;
    SNW.tab=b.getAttribute('data-tab');
    Array.prototype.forEach.call(tb.querySelectorAll('button[data-tab]'), function(z){ var on=(z===b); z.classList.toggle('on', on); z.setAttribute('aria-selected', on ? 'true' : 'false'); });
    snPintarTab();
  };
  snPintarTab();
}
function snPintarTab(){
  var c=$('sn-cuerpo'); if(!c) return;
  SNW.T=null;
  if(SNW.tab==='pers') snpPintar(c); else if(SNW.tab==='and') snaPintar(c); else if(SNW.tab==='prop') snxPintar(c); else snnPintar(c);
}

/* ── el catálogo ─────────────────────────────────────────────────────────────────────────── */
function _snnTarjeta(s, on){
  var A=SEN_APP;
  return '<div class="sn-c'+(on ? ' on' : '')+'" data-k="'+esc(s.k)+'" data-g="'+esc(s.g)+'">'+
    '<button type="button" class="sn-c-b" data-abrir="'+esc(s.k)+'" title="'+esc(s.n)+'"><span class="sn-ic">'+A.svg(s, 84)+'</span>'+
    '<i class="sn-fr" style="background:'+A.color(s.g).cf+'"></i><b>'+esc(A.corto(s.n))+'</b></button>'+
    '<button type="button" class="sn-mas'+(on ? ' on' : '')+'" data-mas="'+esc(s.k)+'" aria-pressed="'+(on ? 'true' : 'false')+'" '+
    'title="'+(on ? 'Quitar de la lista para imprimir' : 'Agregar a la lista para imprimir')+'" aria-label="'+(on ? 'Quitar de la lista para imprimir: ' : 'Agregar a la lista para imprimir: ')+esc(s.n)+'">'+(on ? '✓' : '＋')+'</button></div>';
}
function snnPintar(c){
  var A=SEN_APP, S=A.senales;
  if(!SNW.idx) SNW.idx=S.map(function(s){ return { k:s.k, t:A.norm(s.n+' '+(A.grupos[s.g]||'')) }; });
  var enLista={}; SNW.lista.forEach(function(it){ enLista[it.k]=1; });
  var cuenta={}; S.forEach(function(s){ cuenta[s.g]=(cuenta[s.g]||0)+1; });
  c.innerHTML='<p class="sn-intro">Las '+S.length+' señales del Anexo B de la <b>NTP 399.010-1</b>, tal como están en la norma. Toca una, ponle el tamaño y sale lista para imprimir, con el logo de tu empresa. '+
    'Con <b>＋</b> juntas varias y las imprimes en un solo PDF.</p>'+
    '<p class="sn-cupo" id="sn-cupo" data-clave="senal" hidden></p>'+
    '<div class="sn-herr"><input type="search" id="sn-q" placeholder="Buscar: casco, altura, extintor, eléctrico…" autocomplete="off" aria-label="Buscar una señal" value="'+esc(SNW.busca)+'">'+
    '<div class="chips" id="sn-grupos" role="group" aria-label="Grupo de señales">'+SN_GRUPOS.map(function(g){
      var on=(SNW.filtro===g);
      return '<button type="button" class="chip'+(on ? ' on' : '')+'" data-g="'+g+'" aria-pressed="'+(on ? 'true' : 'false')+'">'+esc(A.grupos[g])+' <i>'+(cuenta[g]||0)+'</i></button>';
    }).join('')+'</div></div>'+
    '<p class="sn-cuantas" id="sn-cuantas" aria-live="polite"></p>'+
    '<div class="sn-rej" id="sn-rej">'+S.map(function(s){ return _snnTarjeta(s, !!enLista[s.k]); }).join('')+'</div>'+
    '<div class="sn-nada" id="sn-nada" hidden></div>'+
    '<div class="sn-lb" id="sn-lb" hidden></div>'+
    '<div class="sn-nota"><p><b>De dónde salen estos dibujos.</b> Del Anexo B de la NTP 399.010-1, leídos del propio PDF de la norma trazo por trazo. No están redibujados ni son parecidos: '+
    'son los de la norma, con su forma, su color y sus bordes, y por eso se imprimen nítidos a cualquier tamaño.</p>'+
    '<p>Salen como manda la norma: <b>enmarcadas</b>, con el pictograma arriba y <b>el texto debajo, en una banda del color de la señal</b> —azul la de obligación, roja la de prohibición y la de incendios, '+
    'verde la de evacuación y amarilla la de advertencia (esa con el texto en negro: sobre amarillo, el blanco no se lee)—. Son las mismas que arma la app en el celular.</p></div>';
  $('sn-q').oninput=function(){ SNW.busca=this.value; snnFiltra(); };
  $('sn-grupos').onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-g]') : null; if(!b) return;
    var g=b.getAttribute('data-g'); SNW.filtro=(SNW.filtro===g) ? '' : g;
    Array.prototype.forEach.call(this.querySelectorAll('button[data-g]'), function(z){ var on=(z.getAttribute('data-g')===SNW.filtro); z.classList.toggle('on', on); z.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    snnFiltra();
  };
  $('sn-rej').onclick=function(ev){
    var m=ev.target.closest ? ev.target.closest('button[data-mas]') : null;
    if(m){ snListaToca(m.getAttribute('data-mas')); return; }
    var a=ev.target.closest ? ev.target.closest('button[data-abrir]') : null;
    if(a) snAbrir(a.getAttribute('data-abrir'));
  };
  snnFiltra(); snListaBarra();
  snUso().then(snCupoPinta);
}
function snnFiltra(){
  var rej=$('sn-rej'); if(!rej) return;
  var A=SEN_APP, q=A.norm(SNW.busca).trim(), ps=q ? q.split(/\s+/) : [], g=SNW.filtro, n=0, por={};
  SNW.idx.forEach(function(x){ por[x.k]=x.t; });
  Array.prototype.forEach.call(rej.children, function(el){
    var ve=(!g || el.getAttribute('data-g')===g);
    if(ve && ps.length){ var t=por[el.getAttribute('data-k')]||''; for(var i=0;i<ps.length;i++) if(t.indexOf(ps[i])<0){ ve=false; break; } }
    el.hidden=!ve; if(ve) n++;
  });
  var cu=$('sn-cuantas'), nada=$('sn-nada'), b=String(SNW.busca||'').trim();
  if(cu){ cu.hidden=!n; cu.textContent=n+' '+(n===1 ? 'señal' : 'señales')+(g ? ' · '+A.grupos[g] : '')+(b ? ' · con «'+b+'»' : ''); }
  if(nada){
    nada.hidden=!!n;
    if(!n){
      nada.innerHTML='Ninguna señal con «'+esc(b)+'»'+(g ? ' en '+esc(A.grupos[g]) : '')+'.'+(g ? ' <button type="button" class="bt-link" id="sn-todas">Buscar en todos los grupos</button>' : '');
      var t=$('sn-todas');
      if(t) t.onclick=function(){ SNW.filtro=''; Array.prototype.forEach.call(document.querySelectorAll('#sn-grupos button'), function(z){ z.classList.remove('on'); z.setAttribute('aria-pressed', 'false'); }); snnFiltra(); };
    }
  }
}

/* ── una señal: su cartel y su hoja, con la vista previa al lado ──────────────────────────── */
var SNE=null;
function snTextoDe(k){
  var S=SEN_APP.porK(k);
  /* las flechas del nombre no existen en las tipografías del PDF: en la pantalla sí, en el papel va la palabra */
  return SEN_APP.partir(String(S.n).replace(/[←-⇿]\s*/g, ''));
}
function snAbrir(k){
  var A=SEN_APP; if(!A.hay(k)) return;
  var S=A.porK(k), pa=snTextoDe(k);
  SNE={ k:k, aviso:pa.aviso, texto:pa.texto, sub:'', tam:SNW.op.tam, orient:SNW.op.orient, porHoja:SNW.op.porHoja, qr:false, qrSel:{}, qrIni:false };
  var tq=A.eqTipo ? A.eqTipo(k) : '';
  SNW.eq=null;     /* los equipos se traen de nuevo cada vez que se abre: si registró uno, ya sale */
  var cuerpo='<div class="sn-ed'+(SNE.orient==='h' ? ' echada' : '')+'" id="sn-ed"><div class="sn-form">'+
    '<div class="campo"><label for="sn-a">Palabra de aviso <small>· el renglón grande</small></label>'+
    '<input id="sn-a" maxlength="24" autocomplete="off" placeholder="ATENCIÓN · PELIGRO · PROHIBIDO (vacío, si no lleva)" value="'+esc(SNE.aviso)+'"></div>'+
    '<div class="campo"><label for="sn-t">El texto del cartel</label><input id="sn-t" maxlength="90" autocomplete="off" value="'+esc(SNE.texto)+'">'+
    '<p class="ayuda">Va debajo del símbolo, en la banda de color: la norma no deja escribir dentro del símbolo, pero sí acompañarlo en el cartel. Se imprime en mayúsculas.</p></div>'+
    '<div class="campo"><label for="sn-s">Renglón de abajo <small>· opcional</small></label>'+
    '<input id="sn-s" maxlength="90" autocomplete="off" placeholder="Tablero general TG-01 · Sector B" value="'+esc(SNE.sub)+'"></div>'+
    '<div class="campo"><label>¿De qué tamaño es la hoja?</label>'+snChips('sn-tam', snTamOps(), SNE.tam, 'Tamaño de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cómo va la hoja?</label>'+snChips('sn-ori', SN_ORI, SNE.orient, 'Orientación de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cuántas por hoja?</label>'+snChips('sn-ph', SN_POR_HOJA.map(function(n){ return { v:n, t:String(n) }; }), SNE.porHoja, 'Cuántas señales por hoja')+
    '<p class="ayuda">La misma señal repetida, para cortar. Si quieres varias señales distintas en una hoja, usa «＋ A la lista».</p></div>'+
    (tq ? snQRCampoHTML() : '')+
    '<div id="sn-logo-c"></div></div>'+
    '<div class="sn-lado"><div class="sn-prev" id="sn-prev" aria-label="Vista previa de la hoja"><div class="sn-prev-msg">Armando la vista previa…</div></div>'+
    '<div class="sn-med" id="sn-med" aria-live="polite"></div></div></div>';
  var pie='<span class="msg gris sn-pie-msg" id="sn-msg"></span><button type="button" class="bt sec" id="sn-cerrar">Cerrar</button>'+
    '<button type="button" class="bt sec" id="sn-ala">＋ A la lista</button><button type="button" class="bt sec" id="sn-imp">🖨 Imprimir</button><button type="button" class="bt" id="sn-pdf">⬇ Descargar PDF</button>';
  abrirHoja(S.n, (A.grupos[S.g]||'')+' · NTP 399.010-1, Anexo B', cuerpo, pie, { ancha:true, clase:'sn-h' });
  var prev=$('sn-prev');
  var T=snTaller(prev, function(){
    var o={ k:SNE.k, aviso:SNE.aviso, texto:SNE.texto, sub:SNE.sub, tam:SNE.tam, orient:SNE.orient, porHoja:SNE.porHoja };
    /* con el QR de cada equipo (lote 15): un cartel por cada uno de los marcados */
    if(SNE.qr){ var q=snQRItems(); if(!q) return Promise.reject('sin_qr'); o.qr=q; }
    return snCtx().then(function(C){ return SEN_APP.senal(o, C); }).then(function(R){ R.cuenta=1; R.o=o; return R; });
  }, function(R, e){
    var m=$('sn-med'); if(!m) return;
    if(!R && e==='sin_qr'){
      if(SNW.eq) snPrevMsg(prev, 'Marca los equipos', 'Elige en la lista cuáles salen: un cartel por cada uno, con su QR.');
      else snPrevMsg(prev, 'Buscando los equipos de la obra…', '');
      m.innerHTML=''; return;
    }
    if(!R){ snPrevMsg(prev, 'No se pudo armar el cartel', 'Revisa tu conexión e inténtalo otra vez.'); m.innerHTML=''; return; }
    m.innerHTML=snMedidaHTML(R);
  });
  $('sn-a').oninput=function(){ SNE.aviso=this.value; T.pide(380); };
  $('sn-t').oninput=function(){ SNE.texto=this.value; T.pide(380); };
  $('sn-s').oninput=function(){ SNE.sub=this.value; T.pide(380); };
  snChipsAl('sn-tam', function(v){ SNE.tam=v; SNW.op.tam=v; T.pide(); });
  snChipsAl('sn-ori', function(v){ SNE.orient=v; SNW.op.orient=v; var ed=$('sn-ed'); if(ed) ed.classList.toggle('echada', v==='h'); T.pide(); });
  snChipsAl('sn-ph', function(v){ SNE.porHoja=+v||1; SNW.op.porHoja=SNE.porHoja; T.pide(); });
  $('sn-cerrar').onclick=cerrarHoja;
  $('sn-pdf').onclick=function(){ if(snQRFalta()) return; snEntregar(T, 'senal', 'señales', 'pdf', this); };
  $('sn-imp').onclick=function(){ if(snQRFalta()) return; snEntregar(T, 'senal', 'señales', 'imp', this); };
  var qc=$('sn-qr');
  if(qc) qc.onchange=function(){ SNE.qr=this.checked; if(SNE.qr) SNE.qrIni=true; var mm=$('sn-msg'); if(mm) mm.textContent=''; snQRPinta(); T.pide(); };
  $('sn-ala').onclick=function(){
    var r=snListaPoner({ k:SNE.k, aviso:SNE.aviso, texto:SNE.texto, sub:SNE.sub, n:1 });
    if(!r){ var mm=$('sn-msg'); if(mm){ mm.className='msg mal sn-pie-msg'; mm.textContent='La lista ya tiene '+SN_LISTA_MAX+' señales: imprímela y empieza otra.'; } return; }
    cerrarHoja(); snListaMarcas(); snListaBarra();
    toast('En la lista para imprimir: '+SNW.lista.length+' '+(SNW.lista.length===1 ? 'señal' : 'señales')+'. Elige otra o ábrela abajo.');
  };
  snCtx().then(function(C){ var l=$('sn-logo-c'); if(l) l.innerHTML=snLogoNota(C, 'Va arriba, en su franja, con la razón social al lado, fuera del símbolo: la norma no deja taparlo ni alterarlo.'); });
  T.pide();
}
/* ══ LOS CARTELES PROPIOS DE LA OBRA (17/10/2026, lote 15) ═════════════════════════════════════
   Marcelo: «colocar la opción de señaléticas personalizadas… cajas de herramientas, acopio de materiales, punto de
   sombra, porta arnés… en una hoja A4 o A3, de fondo obligatorio (azul), fondo verde (informativo) y sus respectivas
   señaléticas de riesgo y EPPs, como opción de colocar, y obviamente con su logo». Los mismos de la app: sst_estado
   «sen_propias» (se juntan por id y gana el más nuevo), el mismo dibujo (SEN_APP.propio) y los mismos modelos. Lo que
   se arma aquí aparece en el celular, y al revés. Se guarda solo, como «personal autorizado». */
var SNX=null;
var SNX_GRUPOS=[['obl', 'EPP (obligación)'], ['adv', 'Riesgo (advertencia)'], ['proh', 'Prohibición'], ['emer', 'Emergencia'], ['fuego', 'Incendios']];
function snxLeer(){
  return estadoLeerP('sen_propias').then(function(f){ var v=f && f.valor; return (v && Array.isArray(v.l)) ? v.l : []; });
}
function snxCuando(t){
  t=+t||0; if(!t) return '';
  var d=new Date(t); return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear();
}
function snxPintar(c){
  var A=SEN_APP;
  c.innerHTML='<p class="sn-intro">Escribe lo que va —caja de herramientas, acopio de materiales, punto de sombra, porta arnés…—, elige el fondo (azul de obligación o verde de información) y, si quieres, '+
    'los pictogramas de riesgo y de EPP. Sale con el logo de tu empresa, en A4 o A3, y queda guardado en la obra: también se ve y se imprime desde la app.</p>'+
    '<p class="sn-cupo" id="sn-cupo" data-clave="senal" hidden></p>'+
    '<div id="snx-l"><p class="sn-cuantas">Buscando los carteles de la obra…</p></div>'+
    '<h3 class="sn-sub">Uno nuevo</h3>'+
    '<div class="sn-mods" id="snx-mods">'+A.propiosModelos.map(function(m){
      return '<button type="button" class="sn-mod" data-m="'+esc(m.k)+'"><span class="sn-mod-ic snx-ic" style="background:'+A.fondos[m.color].cf+'">'+
        (m.pics.length ? '<span>'+A.svg(m.pics[0], 34)+'</span>' : '<i>'+(m.ic || '✎')+'</i>')+'</span><span><b>'+esc(m.n)+'</b><small>'+esc(m.d)+'</small></span></button>';
    }).join('')+'<button type="button" class="sn-mod blanco" data-m=""><span class="sn-mod-ic">✏️</span><span><b>En blanco</b><small>Escribes tú lo que va</small></span></button></div>';
  $('snx-mods').onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-m]') : null; if(!b) return;
    var mk=b.getAttribute('data-m'), m=null; A.propiosModelos.forEach(function(x){ if(x.k===mk) m=x; });
    snxAbrir(m ? { texto:m.texto, sub:m.sub, color:m.color, pics:m.pics.slice(), tam:'A4', orient:'v' } : { color:'azul', pics:[] });
  };
  snxListaPinta();
  snUso().then(snCupoPinta);
}
function snxListaPinta(){
  if(!$('snx-l')) return;
  var oid=(YO.obra||{}).id;
  snxLeer().then(function(L){
    if((YO.obra||{}).id!==oid) return;
    SNW.prop=L;
    var c=$('snx-l'); if(!c) return;
    var V=L.map(SEN_APP.propioLimpio).filter(function(z){ return z.id && !z.b; }).sort(function(a, b){ return (b.t||0)-(a.t||0); });
    if(!V.length){ c.innerHTML='<p class="sn-cuantas">Todavía no hay carteles propios en esta obra. Elige uno para empezar.</p>'; return; }
    c.innerHTML='<h3 class="sn-sub">Los de la obra <span class="gris">· '+V.length+'</span></h3><div class="snx-l">'+V.map(function(z){
      return '<div class="snx-f"><button type="button" class="snx-f-b" data-id="'+esc(z.id)+'"><i class="snx-sw" style="background:'+SEN_APP.fondos[z.color].cf+'"></i>'+
        '<span><b>'+esc(z.texto||'—')+'</b><small>'+z.tam+' · '+(z.orient==='h' ? 'horizontal' : 'vertical')+
        (z.pics.length ? ' · '+z.pics.map(function(k){ return SEN_APP.svg(k, 18); }).join('') : '')+(z.t ? ' · '+esc(snxCuando(z.t)) : '')+'</small></span></button>'+
        '<button type="button" class="sn-x" data-quitar="'+esc(z.id)+'" title="Quitar este cartel" aria-label="Quitar: '+esc(z.texto)+'">✕</button></div>';
    }).join('')+'</div>';
    c.onclick=function(ev){
      var q=ev.target.closest ? ev.target.closest('button[data-quitar]') : null;
      if(q){ snxQuitar(q.getAttribute('data-quitar')); return; }
      var b=ev.target.closest ? ev.target.closest('button[data-id]') : null; if(!b) return;
      var z=null; V.forEach(function(x){ if(x.id===b.getAttribute('data-id')) z=x; });
      if(z) snxAbrir(z);
    };
  }, function(cod){
    var c3=$('snx-l'); if(c3) c3.innerHTML='<p class="sn-cuantas">No se pudieron traer los carteles de la obra. '+esc(porQueFallo(cod))+'</p>';
  });
}
/* se guarda sobre lo que el servidor tiene EN ESE MOMENTO: lo que otro cambió (en la app o en otra pestaña) no se pisa */
function snxGuardar(o){
  var oid=(YO.obra||{}).id;
  return snxLeer().then(function(L){
    if((YO.obra||{}).id!==oid) return Promise.reject('otra_obra');
    var J=SEN_APP.propiosJuntar(L, [o]);
    return estadoEscribirP('sen_propias', { v:1, l:J.slice(-200) }).then(function(){ SNW.prop=J; return J; });
  });
}
function snxQuitar(id){
  var z=null; (SNW.prop||[]).forEach(function(x){ if(x && x.id===id) z=x; });
  if(!z) return;
  confirmar('¿Quitar este cartel?', 'Sale de la lista de la obra, en la web y en la app. Los que ya imprimiste siguen donde los pegaste.', { si:'Sí, quitarlo', no:'Cancelar' }).then(function(si){
    if(!si) return;
    var o=SEN_APP.propioLimpio(z); o.b=1; o.t=Date.now();
    snxGuardar(o).then(function(){ toast('Se quitó el cartel de la obra.'); snxListaPinta(); }, function(e){ if(e!=='otra_obra') toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}
function _snxEstado(t, cl){ var m=$('snx-est'); if(m){ m.className='msg '+(cl||'gris')+' sn-pie-msg'; m.textContent=t||''; } }
function snxAbrir(z){
  var A=SEN_APP, o=A.propioLimpio(z||{});
  var S={ id:o.id, texto:o.texto, sub:o.sub, color:o.color, pics:o.pics.slice(), tam:o.tam, orient:o.orient, t:o.t,
          pick:false, qsen:'', g:'obl', T:null, tG:null, guardando:false, otra:false };
  SNX=S;
  var cuerpo='<div class="sn-ed'+(S.orient==='h' ? ' echada' : '')+'" id="sn-ed"><div class="sn-form">'+
    '<div class="campo"><label for="snx-t">Lo que dice el cartel</label><input id="snx-t" maxlength="80" autocomplete="off" placeholder="CAJA DE HERRAMIENTAS · PUNTO DE SOMBRA · PORTA ARNÉS…" value="'+esc(S.texto)+'">'+
    '<p class="ayuda">Va en blanco y grande, sobre el fondo de color. Se imprime en mayúsculas.</p></div>'+
    '<div class="campo"><label for="snx-s">Renglón de abajo <small>· opcional</small></label><input id="snx-s" maxlength="90" autocomplete="off" placeholder="Sector B · Solo personal de almacén" value="'+esc(S.sub)+'"></div>'+
    '<div class="campo"><label>El fondo</label>'+snChips('snx-f', [{ v:'azul', t:'Azul · obligación' }, { v:'verde', t:'Verde · información' }], S.color, 'El fondo del cartel')+
    '<p class="ayuda">Azul, para lo que es obligatorio; verde, para lo que informa o dice dónde está algo. Son los colores de las señales de la norma.</p></div>'+
    '<div class="campo"><label>Pictogramas de riesgo y de EPP <small>· opcional, hasta '+A.maxPics+'</small></label><div id="snx-pics"></div></div>'+
    '<div class="campo"><label>¿De qué tamaño es la hoja?</label>'+snChips('snx-tam', snTamOps().filter(function(t){ return t.v!=='A5'; }), S.tam, 'Tamaño de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cómo va la hoja?</label>'+snChips('snx-ori', SN_ORI, S.orient, 'Orientación de la hoja')+'</div>'+
    '<div id="sn-logo-c"></div></div>'+
    '<div class="sn-lado"><div class="sn-prev" id="sn-prev" aria-label="Vista previa del cartel"><div class="sn-prev-msg">Armando la vista previa…</div></div>'+
    '<div class="sn-med" id="sn-med" aria-live="polite"></div></div></div>';
  var pie='<span class="msg gris sn-pie-msg" id="snx-est"></span><button type="button" class="bt sec" id="snx-cerrar">Cerrar</button>'+
    '<button type="button" class="bt sec" id="snx-imp">🖨 Imprimir</button><button type="button" class="bt" id="snx-pdf">⬇ Descargar PDF</button>';
  abrirHoja(S.id ? 'Cartel propio' : 'Cartel propio · nuevo', 'Con el logo de tu empresa, en A4 o A3', cuerpo, pie, { ancha:true, clase:'sn-h' });
  var prev=$('sn-prev');
  S.T=snTaller(prev, function(){
    if(!String(S.texto||'').trim()) return null;
    var o={ texto:S.texto, sub:S.sub, color:S.color, pics:S.pics, tam:S.tam, orient:S.orient };
    return snCtx().then(function(C){ return SEN_APP.propio(o, C); }).then(function(R){ R.cuenta=1; return R; });
  }, function(R, e){
    var med=$('sn-med'), bts=[$('snx-pdf'), $('snx-imp')]; if(!med || SNX!==S) return;
    bts.forEach(function(b){ if(b) b.disabled=!R; });
    if(!R){
      med.innerHTML='';
      if(!String(S.texto||'').trim()) snPrevMsg(prev, 'El cartel aparece aquí', 'Escribe lo que dice y lo ves armarse.');
      else snPrevMsg(prev, 'No se pudo armar el cartel', 'Revisa tu conexión e inténtalo otra vez.');
      return;
    }
    med.innerHTML='<p><b>Cartel de '+Math.round(R.w)+' × '+Math.round(R.h)+' mm</b> · hoja '+esc(snHojaTxt(R.hoja))+(R.pics ? ' · '+R.pics+' '+(R.pics===1 ? 'pictograma' : 'pictogramas') : '')+'</p>'+
      (R.ft && R.ft<16 ? '<p class="ojo"><b>La letra quedó chica.</b> El texto es largo para esta hoja: acórtalo o usa una A3.</p>' : '')+
      '<p class="gris">Imprime al 100 %, sin «ajustar a la página». Corta por el marco.</p>';
  });
  $('snx-t').oninput=function(){ S.texto=this.value; snxCambio(420); };
  $('snx-s').oninput=function(){ S.sub=this.value; snxCambio(420); };
  snChipsAl('snx-f', function(v){ S.color=v; snxCambio(); });
  snChipsAl('snx-tam', function(v){ S.tam=v; snxCambio(); });
  snChipsAl('snx-ori', function(v){ S.orient=v; var ed=$('sn-ed'); if(ed) ed.classList.toggle('echada', v==='h'); snxCambio(); });
  $('snx-pics').onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button') : null; if(!b) return;
    var k=b.getAttribute('data-k'), qu=b.getAttribute('data-quitar'), g=b.getAttribute('data-g');
    if(g){ S.g=(S.g===g) ? '' : g; S.qsen=''; _snxPicsPinta(); return; }
    if(qu){ var i=S.pics.indexOf(qu); if(i>-1) S.pics.splice(i, 1); _snxPicsPinta(); snxCambio(); return; }
    if(k){
      var j=S.pics.indexOf(k);
      if(j>-1) S.pics.splice(j, 1);
      else{ if(S.pics.length>=SEN_APP.maxPics){ toast('Ya van '+SEN_APP.maxPics+': quita uno para poner otro.'); return; } S.pics.push(k); }
      _snxPicsPinta(); snxCambio(); return;
    }
    if(b.getAttribute('data-que')==='elegir'){ S.pick=!S.pick; S.qsen=''; _snxPicsPinta(); if(S.pick){ var i2=$('snx-q'); if(i2) i2.focus(); } }
  };
  $('snx-pics').oninput=function(ev){ if(ev.target && ev.target.id==='snx-q'){ S.qsen=ev.target.value; _snxCatPinta(); } };
  $('snx-cerrar').onclick=function(){ if(S.tG){ clearTimeout(S.tG); snxGuardarEd(S); } cerrarHoja(); };
  $('snx-pdf').onclick=function(){ snxEntregar(S, 'pdf', this); };
  $('snx-imp').onclick=function(){ snxEntregar(S, 'imp', this); };
  _snxPicsPinta();
  snCtx().then(function(C){ var l=$('sn-logo-c'); if(l && SNX===S) l.innerHTML=snLogoNota(C, 'Va arriba, en su franja, con la razón social y el nombre de la obra.'); });
  S.T.pide();
}
/* cada cambio: la hoja se vuelve a armar y el cartel se guarda en un momento (si ya dice algo) */
function snxCambio(espera){
  var S=SNX; if(!S) return;
  if(String(S.texto||'').trim()){
    _snxEstado('Guardando…');
    if(S.tG) clearTimeout(S.tG);
    S.tG=setTimeout(function(){ snxGuardarEd(S); }, 900);
  }else _snxEstado('');
  if(S.T) S.T.pide(espera);
}
function snxGuardarEd(S){
  if(!S) return;
  S.tG=null;
  if(!String(S.texto||'').trim()) return;
  if(S.guardando){ S.otra=true; return; }
  if(!S.id) S.id='x'+Date.now().toString(36)+Math.random().toString(36).slice(2, 6);
  S.t=Date.now();
  var o=SEN_APP.propioLimpio({ id:S.id, texto:S.texto, sub:S.sub, color:S.color, pics:S.pics, tam:S.tam, orient:S.orient, t:S.t });
  S.guardando=true;
  snxGuardar(o).then(function(){
    S.guardando=false;
    if(S.otra || S.tG){ S.otra=false; if(!S.tG) S.tG=setTimeout(function(){ snxGuardarEd(S); }, 200); return; }
    if(SNX===S) _snxEstado('Guardado en la obra · también se ve en la app', 'ok');
    snxListaPinta();
  }, function(e){
    S.guardando=false;
    if(e==='otra_obra') return;
    if(SNX===S) _snxEstado('No se pudo guardar. '+porQueFallo(e), 'mal');
  });
}
/* bajar o imprimir: el que es nuevo, o tiene cambios por guardar, se guarda en ese momento */
function snxEntregar(S, como, bt){
  if(!String(S.texto||'').trim()){ _snxEstado('Escribe lo que dice el cartel.', 'mal'); var i=$('snx-t'); if(i) i.focus(); return; }
  if(S.tG || !S.id){ if(S.tG) clearTimeout(S.tG); snxGuardarEd(S); }
  snEntregar(S.T, 'senal', 'señales', como, bt);
}
function _snxPicsPinta(){
  var S=SNX, c=$('snx-pics'); if(!S || !c) return;
  var A=SEN_APP, h='';
  if(S.pics.length) h+='<div class="snx-pks">'+S.pics.map(function(k){
    return '<span class="snx-pk">'+A.svg(k, 34)+'<b>'+esc(A.picNombre(k))+'</b><button type="button" class="sn-x" data-quitar="'+esc(k)+'" aria-label="Quitar: '+esc(A.picNombre(k))+'">✕</button></span>';
  }).join('')+'</div>';
  else h+='<p class="ayuda" style="margin:0 0 8px">Van abajo, cada uno con su nombre: el casco, los guantes, «caída de objetos»…</p>';
  if(S.pics.length<A.maxPics || S.pick) h+='<button type="button" class="bt sec chico" data-que="elegir">'+(S.pick ? 'Cerrar el catálogo' : '＋ Agregar un pictograma')+'</button>';
  if(S.pick) h+='<div class="snx-pick"><input type="search" id="snx-q" autocomplete="off" placeholder="casco, guantes, caída, eléctrico…" aria-label="Buscar un pictograma" value="'+esc(S.qsen)+'">'+
    '<div class="chips" id="snx-g" role="group" aria-label="Grupo de pictogramas">'+SNX_GRUPOS.map(function(g){
      var on=(S.g===g[0]); return '<button type="button" class="chip'+(on ? ' on' : '')+'" data-g="'+g[0]+'" aria-pressed="'+(on ? 'true' : 'false')+'">'+esc(g[1])+'</button>';
    }).join('')+'</div><div id="snx-cat-c"></div></div>';
  c.innerHTML=h;
  if(S.pick) _snxCatPinta();
}
function _snxCatPinta(){
  var S=SNX, c=$('snx-cat-c'); if(!S || !c) return;
  var A=SEN_APP, q=A.norm(S.qsen).trim(), ps=q ? q.split(/\s+/) : [];
  var lista=A.senales.filter(function(s){
    if(!ps.length) return !S.g || s.g===S.g;
    var t=A.norm(s.n+' '+(A.grupos[s.g]||''));
    for(var i=0;i<ps.length;i++) if(t.indexOf(ps[i])<0) return false;
    return true;
  });
  if(!lista.length){ c.innerHTML='<p class="ayuda">Ningún pictograma con «'+esc(S.qsen)+'».</p>'; return; }
  c.innerHTML='<div class="sn-cat">'+lista.map(function(s){
    var on=S.pics.indexOf(s.k)>-1;
    return '<button type="button" data-k="'+esc(s.k)+'" class="'+(on ? 'on' : '')+'" aria-pressed="'+(on ? 'true' : 'false')+'" title="'+esc(s.n)+'">'+A.svg(s, 56)+'<b>'+esc(A.corto(s.n))+'</b></button>';
  }).join('')+'</div>';
}

/* ── 17/10/2026 · lote 15 · la señal con el QR de inspección de cada equipo ──────────────────────
   Marcelo: «el QR del extintor en la misma figura… en la sección señaléticas, la opción de que sí sale con QR de
   inspección o no, y elegir qué extintor será… todo el lote o algunos seleccionados». Igual que en la app: los
   equipos de «Equipos y herramientas» (sst_equipo_qr) de ese tipo que no están dados de baja; al marcarlo salen
   todos y se quitan los que no van. Cada cartel lleva el QR de la etiqueta de SU equipo: nunca el código de la obra. */
function snQRCampoHTML(){
  return '<div class="campo" id="sn-qr-c"><label class="sn-qr-sw"><input type="checkbox" id="sn-qr"> <span>Con el QR de inspección de cada uno</span></label>'+
    '<p class="ayuda">Un cartel por equipo, con el QR de su etiqueta —el de «Equipos y herramientas»—, su código y de qué es. Al escanearlo se ve cómo usarlo y se entra a su inspección. No lleva el código de la obra.</p>'+
    '<div id="sn-qr-l"></div></div>';
}
function snQREquipos(){
  var oid=(YO.obra||{}).id;
  if(SNW.eq && SNW.eqObra===oid && Date.now()-SNW.eqT<60000) return Promise.resolve(SNW.eq);
  return Promise.all([cargarEqBase(), cargarQRLib(), traer('sst_equipo_qr', '&select=*&order=codigo.asc', 5000)]).then(function(r){
    SNW.eq=Array.isArray(r[2]) ? r[2] : []; SNW.eqObra=oid; SNW.eqT=Date.now();
    return SNW.eq;
  });
}
function _snQRLista(){
  var tq=SNE ? SEN_APP.eqTipo(SNE.k) : '';
  if(!tq) return [];
  return (SNW.eq||[]).filter(function(x){ return x && x.tipo===tq && x.estado!=='baja' && x.token; });
}
function _snQRDet(x){
  try{ if(typeof eqCartelDatosDe==='function') return String(eqCartelDatosDe(x, {}).detalle||''); }catch(e){}
  return String((x && x.detalle)||'');
}
/* los cartelitos de los marcados: el QR de su etiqueta (data:), su código y de qué es; null si no hay ninguno */
function snQRItems(){
  if(!SNE || !SNE.qr || !SNW.eq || SNW.eqObra!==(YO.obra||{}).id || typeof _eqQRdato!=='function') return null;
  var L=_snQRLista().filter(function(x){ return SNE.qrSel[x.id]; });
  if(!L.length) return null;
  var q=L.map(function(x){ return { du:_eqQRdato(x, 8), cod:String(x.codigo||''), det:_snQRDet(x), pie:'Escanea el QR: cómo usarlo y su inspección' }; });
  return q.every(function(z){ return !!z.du; }) ? q : null;
}
function snQRFalta(){
  if(!SNE || !SNE.qr || snQRItems()) return false;
  var mm=$('sn-msg'); if(mm){ mm.className='msg mal sn-pie-msg'; mm.textContent='Marca al menos un equipo de la lista, o quita «Con el QR de inspección de cada uno».'; }
  return true;
}
function snQRPinta(){
  var c=$('sn-qr-l'); if(!c || !SNE) return;
  var ala=$('sn-ala'); if(ala){ ala.disabled=!!SNE.qr; ala.title=SNE.qr ? 'La lista para imprimir junta señales sin QR: con el QR de cada equipo, se baja desde aquí.' : ''; }
  if(!SNE.qr){ c.innerHTML=''; return; }
  var oid=(YO.obra||{}).id;
  if(!SNW.eq || SNW.eqObra!==oid){
    c.innerHTML='<p class="ayuda">Buscando los equipos de la obra…</p>';
    snQREquipos().then(function(){ snQRPinta(); if(SNW.T && SNE && SNE.qr) SNW.T.pide(); }, function(cod){
      var c2=$('sn-qr-l'); if(!c2) return;
      c2.innerHTML='<p class="ayuda" style="color:var(--mal)">'+(cod===404 ? 'Para los QR de equipos hay que actualizar el servidor. Avísanos y lo dejamos listo.' : 'No se pudieron traer los equipos de la obra. Revisa tu conexión y vuelve a marcarlo.')+'</p>';
    });
    return;
  }
  var L=_snQRLista();
  if(SNE.qrIni){ SNE.qrIni=false; if(!Object.keys(SNE.qrSel).length) L.forEach(function(x){ SNE.qrSel[x.id]=true; }); }
  if(!L.length){
    c.innerHTML='<div class="aviso ojo" style="margin:8px 0 0">Todavía no hay ninguno en «Equipos y herramientas». Regístralo ahí, con su código y su etiqueta, y sale aquí para elegir. '+
      '<button type="button" class="bt-link" id="sn-qr-ir">Ir a Equipos y herramientas</button></div>';
    var ir=$('sn-qr-ir'); if(ir) ir.onclick=function(){ cerrarHoja(); navegar('equipos'); };
    return;
  }
  var n=L.filter(function(x){ return SNE.qrSel[x.id]; }).length;
  c.innerHTML='<div class="sn-qr-cab"><b>'+n+' de '+L.length+'</b><button type="button" class="bt-link" id="sn-qr-todos"'+(n===L.length ? ' disabled' : '')+'>Marcar todos</button><button type="button" class="bt-link" id="sn-qr-nada"'+(!n ? ' disabled' : '')+'>Quitar todos</button></div>'+
    '<div class="sn-eqs" id="sn-eqs">'+L.map(function(x){
      var on=!!SNE.qrSel[x.id];
      return '<button type="button" class="sn-eq'+(on ? ' on' : '')+'" data-id="'+esc(x.id)+'" aria-pressed="'+(on ? 'true' : 'false')+'"><span><b>'+esc(x.codigo||'')+'</b><small>'+esc(_snQRDet(x)||x.tipo||'')+'</small></span><i class="tic">'+(on ? '✓' : '')+'</i></button>';
    }).join('')+'</div>'+
    (n ? '' : '<p class="ayuda" style="color:var(--mal)">Marca al menos uno: un cartel por cada uno, con su QR.</p>');
  var re=function(){ snQRPinta(); if(SNW.T) SNW.T.pide(); };
  $('sn-qr-todos').onclick=function(){ SNE.qrSel={}; L.forEach(function(x){ SNE.qrSel[x.id]=true; }); re(); };
  $('sn-qr-nada').onclick=function(){ SNE.qrSel={}; re(); };
  $('sn-eqs').onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-id]') : null; if(!b) return;
    var id=b.getAttribute('data-id'); if(SNE.qrSel[id]) delete SNE.qrSel[id]; else SNE.qrSel[id]=true;
    var mm=$('sn-msg'); if(mm) mm.textContent='';
    re();
  };
}

/* lo que mide el cartel y hasta dónde se lee (la fórmula de la NTP: A ≥ L²/2000) */
function snMedidaHTML(R){
  var d=R.metros, n=R.celdas||1, h='';
  if(R.qr) h+='<p><b>'+n+' '+(n===1 ? 'cartel' : 'carteles')+' con su QR'+((R.hojas||1)>1 ? ' en '+R.hojas+' hojas '+esc(snHojaTxt(R.hoja)) : ', en una hoja '+esc(snHojaTxt(R.hoja)))+' · tarjeta de '+Math.round(R.w)+' × '+Math.round(R.h)+' mm</b> · símbolo de '+Math.round(R.lado)+' mm · QR de '+Math.round(R.qr)+' mm</p>';
  else h+='<p><b>'+(n>1 ? n+' señales en una hoja '+esc(snHojaTxt(R.hoja))+' · tarjeta de ' : 'Cartel de ')+Math.round(R.w)+' × '+Math.round(R.h)+' mm</b> · símbolo de '+Math.round(R.lado)+' mm</p>';
  if(R.qr && R.qr<(SEN_APP.qrMin||16)) h+='<p class="ojo"><b>El QR queda de '+Math.round(R.qr)+' mm:</b> se lee acercando mucho el celular. Para que se lea cómodo, pon menos por hoja o usa una hoja más grande.</p>';
  if(d<5) h+='<p class="ojo"><b>Se lee solo de cerca:</b> no llega a los 5 metros. Pon menos por hoja, una hoja más grande, o acorta el texto: la banda le está quitando sitio al símbolo.</p>';
  else h+='<p>Se lee bien hasta unos <b>'+Math.round(d)+' metros</b>. <span class="gris">Sale de la fórmula de la NTP: el área del símbolo tiene que ser al menos la distancia al cuadrado dividida entre 2000.</span></p>';
  if(R.ft && R.ft<5.4) h+='<p class="ojo"><b>El texto quedó muy chico.</b> A este tamaño casi no se lee: pon menos señales por hoja, usa una hoja más grande o acorta el texto.</p>';
  h+='<p class="gris">Imprime al 100 %, sin «ajustar a la página»: si la impresora la encoge, el tamaño cambia. Corta por el marco.</p>';
  return h;
}

/* ── la lista para imprimir: varias señales distintas en un solo PDF ──────────────────────── */
function _snListaLlave(){ return 'sstp_senl_'+((YO.obra||{}).id||'x'); }
function _snItem(x){
  if(!x || !SEN_APP.hay(x.k)) return null;
  return { k:String(x.k), aviso:String(x.aviso||'').slice(0, 24), texto:String(x.texto||'').slice(0, 90), sub:String(x.sub||'').slice(0, 90), n:Math.max(1, Math.min(30, Math.round(+x.n||1))) };
}
function snListaLeer(){
  var g=leer(_snListaLlave(), null), l=[], op={ tam:'A4', orient:'v', porHoja:1 };
  if(g && typeof g==='object'){
    (Array.isArray(g.items) ? g.items : []).forEach(function(x){ var it=_snItem(x); if(it && l.length<SN_LISTA_MAX) l.push(it); });
    var o=g.op||{};
    if(SEN_APP.tam.some(function(t){ return t.k===o.tam; })) op.tam=o.tam;
    if(o.orient==='h') op.orient='h';
    if(SN_POR_HOJA.indexOf(+o.porHoja)>-1) op.porHoja=+o.porHoja;
  }
  SNW.lista=l; SNW.lop=op;
}
function snListaGuardar(){ guardar(_snListaLlave(), { v:1, items:SNW.lista, op:SNW.lop }); }
/* una señal a la lista, con su texto: si ya está igual, es una copia más */
function snListaPoner(x){
  var it=_snItem(x); if(!it) return false;
  var ya=SNW.lista.filter(function(z){ return z.k===it.k && z.aviso===it.aviso && z.texto===it.texto && z.sub===it.sub; })[0];
  if(ya){ ya.n=Math.min(30, ya.n+1); snListaGuardar(); return true; }
  if(SNW.lista.length>=SN_LISTA_MAX) return false;
  SNW.lista.push(it); snListaGuardar();
  return true;
}
/* el ＋ de la tarjeta: entra con el texto de la norma; si ya estaba, sale */
function snListaToca(k){
  var esta=SNW.lista.some(function(z){ return z.k===k; });
  if(esta) SNW.lista=SNW.lista.filter(function(z){ return z.k!==k; });
  else{
    if(SNW.lista.length>=SN_LISTA_MAX){ toast('La lista ya tiene '+SN_LISTA_MAX+' señales: imprímela y empieza otra.'); return; }
    var pa=snTextoDe(k); SNW.lista.push({ k:k, aviso:pa.aviso, texto:pa.texto, sub:'', n:1 });
  }
  snListaGuardar(); snListaMarcas(); snListaBarra();
}
function snListaMarcas(){
  var rej=$('sn-rej'); if(!rej) return;
  var en={}; SNW.lista.forEach(function(it){ en[it.k]=1; });
  Array.prototype.forEach.call(rej.children, function(el){
    var k=el.getAttribute('data-k'), on=!!en[k], m=el.querySelector('.sn-mas');
    if(el.classList.contains('on')===on) return;
    el.classList.toggle('on', on);
    if(m){ var n=SEN_APP.porK(k).n; m.classList.toggle('on', on); m.textContent=on ? '✓' : '＋'; m.setAttribute('aria-pressed', on ? 'true' : 'false');
      m.title=on ? 'Quitar de la lista para imprimir' : 'Agregar a la lista para imprimir'; m.setAttribute('aria-label', (on ? 'Quitar de la lista para imprimir: ' : 'Agregar a la lista para imprimir: ')+n); }
  });
}
function snListaBarra(){
  var b=$('sn-lb'); if(!b) return;
  var n=SNW.lista.length;
  b.hidden=!n; if(!n){ b.innerHTML=''; return; }
  var copias=0; SNW.lista.forEach(function(it){ copias+=it.n; });
  b.innerHTML='<span>🖨 <b>'+n+' '+(n===1 ? 'señal' : 'señales')+'</b> en la lista para imprimir'+(copias>n ? ' · '+copias+' tarjetas' : '')+'</span>'+
    '<span class="acciones"><button type="button" class="bt sec chico" id="sn-lb-vaciar">Vaciar</button><button type="button" class="bt chico" id="sn-lb-ver">Abrir la lista</button></span>';
  $('sn-lb-ver').onclick=snLista;
  $('sn-lb-vaciar').onclick=function(){
    confirmar('¿Vaciar la lista?', 'Salen las '+n+' señales de la lista para imprimir. Las señales siguen en el catálogo.', { si:'Vaciar la lista', no:'Cancelar' }).then(function(si){
      if(!si) return;
      SNW.lista=[]; snListaGuardar(); snListaMarcas(); snListaBarra();
    });
  };
}
function _snListaFilas(){
  var A=SEN_APP;
  return SNW.lista.map(function(it, i){
    var S=A.porK(it.k);
    return '<div class="sn-li" data-i="'+i+'"><span class="sn-li-ic" title="'+esc(S.n)+'">'+A.svg(S, 48)+'</span>'+
      '<input data-c="aviso" maxlength="24" autocomplete="off" placeholder="Palabra de aviso" aria-label="Palabra de aviso de '+esc(S.n)+'" value="'+esc(it.aviso)+'">'+
      '<input data-c="texto" maxlength="90" autocomplete="off" placeholder="El texto del cartel" aria-label="Texto de '+esc(S.n)+'" value="'+esc(it.texto)+'">'+
      '<input data-c="sub" maxlength="90" autocomplete="off" placeholder="Renglón de abajo" aria-label="Renglón de abajo (opcional) de '+esc(S.n)+'" value="'+esc(it.sub)+'">'+
      '<span class="sn-cop" title="Cuántas tarjetas de esta señal"><button type="button" data-que="menos" aria-label="Una menos"'+(it.n<=1 ? ' disabled' : '')+'>−</button><b>'+it.n+'</b>'+
      '<button type="button" data-que="mas" aria-label="Una más"'+(it.n>=30 ? ' disabled' : '')+'>＋</button></span>'+
      '<button type="button" class="sn-x" data-que="quita" aria-label="Quitar '+esc(S.n)+' de la lista" title="Quitar de la lista">×</button></div>';
  }).join('');
}
function snLista(){
  if(!SNW.lista.length){ toast('La lista está vacía: toca ＋ en las señales que quieras imprimir juntas.'); return; }
  var op=SNW.lop;
  var cuerpo='<div class="sn-ed'+(op.orient==='h' ? ' echada' : '')+'" id="sn-ed"><div class="sn-form">'+
    '<p class="ayuda" style="margin:0 0 12px">Cada señal sale con su texto, que puedes cambiar aquí mismo. Todas van del mismo tamaño, una tarjeta al lado de la otra, en las hojas que hagan falta.</p>'+
    '<div class="sn-l" id="sn-l">'+_snListaFilas()+'</div>'+
    '<div class="campo"><label>¿De qué tamaño es la hoja?</label>'+snChips('snl-tam', snTamOps(), op.tam, 'Tamaño de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cómo va la hoja?</label>'+snChips('snl-ori', SN_ORI, op.orient, 'Orientación de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cuántas tarjetas por hoja?</label>'+snChips('snl-ph', SN_POR_HOJA.map(function(n){ return { v:n, t:String(n) }; }), op.porHoja, 'Cuántas tarjetas por hoja')+'</div>'+
    '<div id="sn-logo-c"></div></div>'+
    '<div class="sn-lado"><div class="sn-prev" id="sn-prev" aria-label="Vista previa de las hojas"><div class="sn-prev-msg">Armando la vista previa…</div></div>'+
    '<div class="sn-med" id="sn-med" aria-live="polite"></div></div></div>';
  var pie='<span class="msg gris sn-pie-msg" id="sn-msg"></span><button type="button" class="bt sec" id="snl-seguir">Seguir eligiendo</button>'+
    '<button type="button" class="bt sec" id="snl-imp">🖨 Imprimir</button><button type="button" class="bt" id="snl-pdf">⬇ Descargar PDF</button>';
  abrirHoja('Lista para imprimir', 'Varias señales en un solo PDF', cuerpo, pie, { ancha:true, clase:'sn-h' });
  var prev=$('sn-prev');
  var T=snTaller(prev, function(){
    var items=SNW.lista.map(function(it){ return { k:it.k, aviso:it.aviso, texto:it.texto, sub:it.sub, n:it.n }; });
    if(!items.length) return null;
    var o={ tam:SNW.lop.tam, orient:SNW.lop.orient, porHoja:SNW.lop.porHoja };
    return snCtx().then(function(C){ return SEN_APP.varias(items, o, C); }).then(function(R){ R.cuenta=items.length; R.max=4; return R; });
  }, function(R, e){
    var m=$('sn-med'), bts=[$('snl-pdf'), $('snl-imp')]; if(!m) return;
    bts.forEach(function(b){ if(b) b.disabled=!R; });
    if(!R){
      if(!SNW.lista.length){ snPrevMsg(prev, 'La lista quedó vacía', 'Cierra y toca ＋ en las señales que quieras imprimir juntas.'); m.innerHTML=''; return; }
      snPrevMsg(prev, 'No se pudo armar el PDF', 'Revisa tu conexión e inténtalo otra vez.'); m.innerHTML=''; return;
    }
    var n=SNW.lista.length, d=R.metros;
    m.innerHTML='<p><b>'+n+' '+(n===1 ? 'señal' : 'señales')+' · '+R.celdas+' '+(R.celdas===1 ? 'tarjeta' : 'tarjetas')+' en '+R.hojas+' '+(R.hojas===1 ? 'hoja' : 'hojas')+' '+esc(snHojaTxt(R.hoja))+'</b> · tarjeta de '+Math.round(R.w)+' × '+Math.round(R.h)+' mm</p>'+
      (d<5 ? '<p class="ojo"><b>Alguna se lee solo de cerca:</b> el símbolo más chico mide '+Math.round(R.lado)+' mm y no llega a los 5 metros. Pon menos por hoja o una hoja más grande.</p>'
           : '<p>El símbolo más chico mide '+Math.round(R.lado)+' mm: se lee bien hasta unos <b>'+Math.round(d)+' metros</b>.</p>')+
      ((R.ft && R.ft<5.4) ? '<p class="ojo"><b>Algún texto quedó muy chico.</b> Pon menos tarjetas por hoja, usa una hoja más grande o acorta ese texto.</p>' : '')+
      '<p class="gris">Imprime al 100 %, sin «ajustar a la página», y corta por el marco.</p>';
  });
  var L=$('sn-l');
  L.oninput=function(ev){
    var inp=ev.target, f=inp.closest ? inp.closest('.sn-li') : null; if(!f || !inp.getAttribute('data-c')) return;
    var it=SNW.lista[+f.getAttribute('data-i')]; if(!it) return;
    it[inp.getAttribute('data-c')]=inp.value; snListaGuardar(); T.pide(420);
  };
  L.onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-que]') : null; if(!b) return;
    var f=b.closest('.sn-li'), i=+f.getAttribute('data-i'), it=SNW.lista[i], que=b.getAttribute('data-que'); if(!it) return;
    if(que==='quita'){ SNW.lista.splice(i, 1); L.innerHTML=_snListaFilas(); }
    else{
      it.n=Math.max(1, Math.min(30, it.n+(que==='mas' ? 1 : -1)));
      f.querySelector('.sn-cop b').textContent=it.n;
      f.querySelector('[data-que=menos]').disabled=(it.n<=1); f.querySelector('[data-que=mas]').disabled=(it.n>=30);
    }
    snListaGuardar(); snListaMarcas(); snListaBarra(); T.pide();
  };
  snChipsAl('snl-tam', function(v){ SNW.lop.tam=v; snListaGuardar(); T.pide(); });
  snChipsAl('snl-ori', function(v){ SNW.lop.orient=v; snListaGuardar(); var ed=$('sn-ed'); if(ed) ed.classList.toggle('echada', v==='h'); T.pide(); });
  snChipsAl('snl-ph', function(v){ SNW.lop.porHoja=+v||1; snListaGuardar(); T.pide(); });
  $('snl-seguir').onclick=cerrarHoja;
  $('snl-pdf').onclick=function(){ snEntregar(T, 'senal', 'señales', 'pdf', this); };
  $('snl-imp').onclick=function(){ snEntregar(T, 'senal', 'señales', 'imp', this); };
  snCtx().then(function(C){ var l=$('sn-logo-c'); if(l) l.innerHTML=snLogoNota(C, 'Va arriba de cada tarjeta, en su franja (en las tarjetas muy chicas no entra y se omite).'); });
  T.pide();
}

/* ══ 3 · EL CARTEL DE «PERSONAL AUTORIZADO» ═══════════════════════════════════════════════════
   El de la puerta del almacén o del tablero: «ÚNICO PERSONAL AUTORIZADO PARA ___», las caras con el nombre debajo y
   lo que queda prohibido. Seis modelos de siempre (los de la app) y uno en blanco. La app propone a quién poner —por
   la marca de almacenero, por el puesto o por la habilitación VIGENTE de su credencial—; aquí igual, con las mismas
   reglas (son las de la app: SEN_APP.propuestos).
   Lo que se arma queda guardado en la obra (sst_estado «senp», un cartel por modelo): al volver a abrirlo está como
   se dejó, en esta computadora o en otra. Las personas van con el mismo código que usa la app (ext), como en
   «Brigada y comité». */
function _snId(t){ return String((t && (t.ext || t.id)) || ''); }
var SN_MODELO_LLAVES={ alm:1, matpel:1, gas:1, sold:1, vigia:1, elec:1, libre:1 };
function _snpUno(x){
  if(!x || typeof x!=='object') return null;
  var vistos={}, gente=[];
  (Array.isArray(x.gente) ? x.gente : []).forEach(function(id){ id=String(id||''); if(id && !vistos[id] && gente.length<200){ vistos[id]=1; gente.push(id); } });
  return { titulo:String(x.titulo||'').slice(0, 70), pie:String(x.pie||'').slice(0, 90), gente:gente,
           senal:(x.senal && SEN_APP.hay(x.senal)) ? String(x.senal) : '',
           tam:SEN_APP.tam.some(function(t){ return t.k===x.tam; }) ? x.tam : 'A4', orient:(x.orient==='h') ? 'h' : 'v',
           cols:([2, 3, 4, 5, 6].indexOf(+x.cols)>-1) ? +x.cols : 0, t:+x.t||0 };
}
function _snpLimpio(v){
  var out={ v:1, c:{} }, c=(v && typeof v==='object' && v.c && typeof v.c==='object') ? v.c : {};
  Object.keys(c).forEach(function(k){ if(!SN_MODELO_LLAVES[k]) return; var x=_snpUno(c[k]); if(x) out.c[k]=x; });
  return out;
}
/* la credencial de cada uno, como la elige la app (credDeTrab): entre varias, una vigente le gana a una vencida y, entre
   iguales, la que vence más tarde. Se reconoce por el código de la persona o por su documento */
function _snCreds(trabs, lista){
  var out={}, hoy=hoyISO();
  if(!Array.isArray(lista) || !lista.length) return out;
  trabs.forEach(function(t){
    var dni=String(t.dni||'').replace(/\D/g, ''), mejor=null;
    lista.forEach(function(c){
      if(!c || typeof c!=='object') return;
      var suya=(c.trab && String(c.trab)===t.id) || (dni && String(c.d||'').replace(/\D/g, '')===dni);
      if(!suya) return;
      if(!mejor){ mejor=c; return; }
      var a=String(c.v||''), b=String(mejor.v||''), va=(!a || a>=hoy), vb=(!b || b>=hoy);
      if(va!==vb){ if(va) mejor=c; return; }
      if(a>b) mejor=c;
    });
    if(mejor) out[t.id]={ v:String(mejor.v||''), h:Array.isArray(mejor.h) ? mejor.h.slice(0, 30) : [] };
  });
  return out;
}
/* el personal activo, sus credenciales y los carteles que la obra dejó armados */
function snGente(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && SNW.gente && SNW.genteObra===oid && Date.now()-SNW.genteT<60000) return Promise.resolve(SNW.gente);
  var base='id,ext,nombre,dni,puesto,area,estatus';
  function pedir(sel){ return traerTodo('sst_trabajador', '&select='+sel+'&order=nombre.asc', 5000); }
  function si400(sigue){ return function(c){ if(c!==400) throw c; return sigue(); }; }     /* una base sin esa columna */
  var T=pedir(base+',almacenero,foto_url').then(null, si400(function(){ return pedir(base+',almacenero').then(null, si400(function(){ return pedir(base); })); }));
  var nada=function(){ return null; };
  return Promise.all([T, estadoLeerP('credenciales').then(null, nada), estadoLeerP(SN_ESTADO).then(null, nada)]).then(function(r){
    var trabs=[], vistos={};
    (r[0]||[]).forEach(function(t){
      if(!t || String(t.estatus||'activo')==='cesado') return;
      var id=_snId(t); if(!id || vistos[id]) return; vistos[id]=1;
      trabs.push({ id:id, nombre:String(t.nombre||'').trim(), dni:String(t.dni||''), puesto:String(t.puesto||''), area:String(t.area||''), almacenero:t.almacenero===true, estatus:'activo',
                   foto:(/^(https?:|data:image\/)/i.test(String(t.foto_url||'')) ? String(t.foto_url) : '') });
    });
    SNW.gente={ trabs:trabs, creds:_snCreds(trabs, r[1] && r[1].valor), guard:_snpLimpio(r[2] && r[2].valor) };
    SNW.genteObra=oid; SNW.genteT=Date.now();
    return SNW.gente;
  });
}
/* la foto para el papel: un JPEG de 3:4, que es la caja de cada cara. Lo que no carga se vuelve a pedir pasado un rato */
var _SN_FOTOS={};
function snFoto(src){
  if(!src) return Promise.resolve(null);
  var z=_SN_FOTOS[src];
  if(z && (z.v || Date.now()-z.t<30000)) return Promise.resolve(z.v);
  return new Promise(function(ok){
    var listo=function(v){ _SN_FOTOS[src]={ v:v||null, t:Date.now() }; ok(v||null); };
    try{
      var im=new Image();
      if(!/^data:/i.test(src)) im.crossOrigin='anonymous';
      im.onload=function(){
        try{
          var w=im.naturalWidth, h=im.naturalHeight, R0=3/4;
          if(!w || !h){ listo(null); return; }
          if(/^data:image\/jpe?g/i.test(src) && Math.abs(w/h-R0)<0.012){ listo(src); return; }
          var sw=w, sh=h; if(w/h>R0) sw=h*R0; else sh=w/R0;
          var cw=Math.min(600, Math.round(sw)), ch=Math.round(cw/R0);
          var c=document.createElement('canvas'); c.width=cw; c.height=ch;
          var g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0, 0, cw, ch);
          g.drawImage(im, (w-sw)/2, (h-sh)/2, sw, sh, 0, 0, cw, ch);
          listo(c.toDataURL('image/jpeg', 0.86));
        }catch(e){ listo(null); }
      };
      im.onerror=function(){ listo(null); };
      im.src=src;
    }catch(e2){ listo(null); }
  });
}

/* ── la pestaña: los modelos, con cuántos de tu gente propone cada uno ─────────────────────── */
function _snpArmado(g, porId){
  if(!g) return '';
  var n=g.gente.filter(function(id){ return !!porId[id]; }).length;
  return '<em class="pill ok" style="font-style:normal">Armado · '+n+' '+(n===1 ? 'persona' : 'personas')+'</em>';
}
function snpPintar(c){
  c.innerHTML='<div class="vacio">Cargando…</div>';
  var obra=(YO.obra||{}).id;
  /* fresco cada vez que se entra a la pestaña: quien acaba de cargar gente en «Personal» la encuentra aquí */
  snGente(true).then(function(G){
    if(SNW.tab!=='pers' || !c.isConnected || (YO.obra||{}).id!==obra) return;
    var A=SEN_APP, C={ trabs:G.trabs, creds:G.creds }, porId={};
    G.trabs.forEach(function(t){ porId[t.id]=t; });
    var h='<p class="sn-intro">El cartel de la puerta: los únicos que pueden entrar o hacer ese trabajo, con su cara y su nombre debajo. Elige uno de los de siempre y sale armado con tu gente '+
      '—la que ya está autorizada por su puesto, por ser del almacén o por la habilitación vigente de su credencial—; después lo cambias como quieras.</p>'+
      '<p class="sn-cupo" id="sn-cupo" data-clave="senal" hidden></p>';
    if(!G.trabs.length) h+='<div class="aviso ojo" id="snp-sin"><b>Todavía no hay personal cargado.</b> El cartel sale con las caras de tu gente: cárgala primero. '+
      'Uno por uno en «Personal», o toda la lista de una vez en «Cargar mi gestión».<div class="acciones"><button type="button" class="bt sec chico" id="snp-ir-per">Ir a Personal</button></div></div>';
    h+='<div class="sn-mods" id="sn-mods">'+A.modelos.map(function(m){
      var n=A.propuestos(m.k, C).length;
      return '<button type="button" class="sn-mod" data-m="'+esc(m.k)+'"><span class="sn-mod-ic">'+A.svg(A.porK(m.sen), 54)+'</span><span><b>'+esc(m.n)+'</b>'+
        '<small>'+(n ? n+' '+(n===1 ? 'autorizado' : 'autorizados')+' de tu personal' : 'Eliges tú a quiénes')+'</small>'+_snpArmado(G.guard.c[m.k], porId)+'</span></button>';
    }).join('')+
      '<button type="button" class="sn-mod blanco" data-m=""><span class="sn-mod-ic" aria-hidden="true">✏️</span><span><b>En blanco</b>'+
      '<small>'+((G.guard.c.libre && G.guard.c.libre.titulo) ? esc(G.guard.c.libre.titulo) : 'Escribes tú para qué es')+'</small>'+_snpArmado(G.guard.c.libre, porId)+'</span></button></div>';
    c.innerHTML=h;
    $('sn-mods').onclick=function(ev){ var b=ev.target.closest ? ev.target.closest('button[data-m]') : null; if(b) snpAbrir(b.getAttribute('data-m')); };
    var ir=$('snp-ir-per');
    if(ir) ir.onclick=function(){ navegar(vistasDe().some(function(v){ return v.id==='personas'; }) ? 'personas' : 'personal'); };
    snUso().then(snCupoPinta);
  }, function(cod){
    if(SNW.tab!=='pers' || !c.isConnected) return;
    fallo(c, cod);
  });
}

/* ── el cartel de un modelo, con la vista previa al lado ─────────────────────────────────── */
var SNP=null;
var SNP_COLS=[{ v:0, t:'Automático' }, { v:2, t:'2' }, { v:3, t:'3' }, { v:4, t:'4' }, { v:5, t:'5' }, { v:6, t:'6' }];
function _snpFabrica(S){
  var m=S.m;
  if(m){ S.titulo=m.tit; S.pie=m.pie; S.senal=m.sen; S.gente=S.prop.slice(); }
  else { S.titulo=''; S.pie=''; S.senal=''; S.gente=[]; }
  S.cols=0;
}
function _snpComoFabrica(S){
  var m=S.m; if(!m) return true;
  return S.titulo===m.tit && S.pie===m.pie && S.senal===m.sen && S.gente.join('|')===S.prop.join('|');
}
function snpAbrir(mk){
  var A=SEN_APP, G=SNW.gente; if(!G) return;
  var m=null; A.modelos.forEach(function(x){ if(x.k===mk) m=x; });
  var llave=m ? m.k : 'libre', porId={};
  G.trabs.forEach(function(t){ porId[t.id]=t; });
  var S={ m:m, llave:llave, porId:porId, prop:m ? A.propuestos(m.k, { trabs:G.trabs, creds:G.creds }) : [],
          titulo:'', pie:'', senal:'', gente:[], tam:'A4', orient:'v', cols:0,
          busca:'', ver:60, pick:false, qsen:'', orden:null, tG:null, guardando:false, otra:false, T:null };
  var g=G.guard.c[llave];
  if(g){ S.titulo=g.titulo; S.pie=g.pie; S.senal=g.senal; S.gente=g.gente.filter(function(id){ return !!porId[id]; }); S.tam=g.tam; S.orient=g.orient; S.cols=g.cols; }
  else _snpFabrica(S);
  SNP=S;
  var cuerpo='<div class="sn-ed'+(S.orient==='h' ? ' echada' : '')+'" id="sn-ed"><div class="sn-form">'+
    '<div class="campo"><label for="snp-tit">¿Autorizado para qué?</label><input id="snp-tit" maxlength="70" autocomplete="off" placeholder="INGRESAR AL TALLER DE SOLDADURA" value="'+esc(S.titulo)+'">'+
    '<p class="ayuda">Sale como «ÚNICO PERSONAL AUTORIZADO PARA <b>lo que escribas</b>:». Sirve para un área, una máquina o un trabajo: «OPERAR EL MONTACARGAS».</p></div>'+
    '<div class="campo"><label for="snp-pie">¿Y qué queda prohibido?</label><input id="snp-pie" maxlength="90" autocomplete="off" placeholder="INGRESAR AL ÁREA DEL TALLER DE SOLDADURA" value="'+esc(S.pie)+'">'+
    '<p class="ayuda">Sale abajo como «QUEDA TERMINANTEMENTE PROHIBIDO <b>eso</b>».</p></div>'+
    '<div class="campo"><label>Pictograma de la norma <small>· opcional</small></label><div id="snp-pic"></div></div>'+
    '<div class="campo"><label for="snp-b">¿Quiénes van en el cartel?</label><div id="snp-nota"></div>'+
    (G.trabs.length ? '<input type="search" id="snp-b" autocomplete="off" placeholder="Buscar por nombre, '+esc(docPersonaP())+' o puesto">' : '')+
    '<div class="sn-gente" id="snp-lista"></div></div>'+
    '<div class="campo"><label>¿De qué tamaño es la hoja?</label>'+snChips('snp-tam', snTamOps(), S.tam, 'Tamaño de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cómo va la hoja?</label>'+snChips('snp-ori', SN_ORI, S.orient, 'Orientación de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cuántas caras por fila?</label>'+snChips('snp-cols', SNP_COLS, S.cols, 'Cuántas caras por fila')+
    '<p class="ayuda">En automático se prueban todas las repartijas y queda la que hace las caras más grandes <b>entrando todas</b>. Solo pasa a una segunda hoja si ya no se les reconocería la cara.</p></div>'+
    '<div id="sn-logo-c"></div></div>'+
    '<div class="sn-lado"><div class="sn-prev" id="sn-prev" aria-label="Vista previa del cartel"><div class="sn-prev-msg">Armando la vista previa…</div></div>'+
    '<div class="sn-med" id="sn-med" aria-live="polite"></div></div></div>';
  var pie='<span class="msg gris sn-pie-msg" id="snp-est"></span><button type="button" class="bt sec" id="snp-cerrar">Cerrar</button>'+
    '<button type="button" class="bt sec" id="snp-fab" hidden>↺ Volver al modelo</button>'+
    '<button type="button" class="bt sec" id="snp-imp">🖨 Imprimir</button><button type="button" class="bt" id="snp-pdf">⬇ Descargar PDF</button>';
  abrirHoja('Personal autorizado · '+(m ? m.n : 'en blanco'), 'El cartel de la puerta, con las caras de los que sí pueden', cuerpo, pie, { ancha:true, clase:'sn-h' });
  var prev=$('sn-prev');
  S.T=snTaller(prev, function(){
    var ids=S.gente.slice(0, 200);
    if(!ids.length) return null;
    var o={ titulo:S.titulo, pie:S.pie, senal:S.senal, tam:S.tam, orient:S.orient, cols:S.cols };
    return Promise.all([snCtx(), Promise.all(ids.map(function(id){ var t=porId[id]; return snFoto(t && t.foto).then(function(du){ return { id:id, foto:du }; }); }))]).then(function(r){
      return SEN_APP.personal(o, r[1], { emp:r[0].emp, obra:r[0].obra, trabs:G.trabs, creds:G.creds }).then(function(R){
        R.cuenta=1; R.max=3; R.n=ids.length;
        R.sinFoto=ids.filter(function(id){ return !porId[id].foto; }).map(function(id){ return porId[id].nombre; });
        R.noCargo=r[1].filter(function(f){ return porId[f.id].foto && !f.foto; }).length;
        return R;
      });
    });
  }, function(R, e){
    var med=$('sn-med'), bts=[$('snp-pdf'), $('snp-imp')]; if(!med || SNP!==S) return;
    bts.forEach(function(b){ if(b) b.disabled=!R; });
    if(!R){
      med.innerHTML='';
      if(!S.gente.length) snPrevMsg(prev, 'El cartel aparece aquí', G.trabs.length ? 'Marca a la primera persona y lo ves armarse, con su foto.' : 'Falta cargar al personal de la obra.');
      else snPrevMsg(prev, 'No se pudo armar el cartel', 'Revisa tu conexión e inténtalo otra vez.');
      return;
    }
    var n=R.n, sf=R.sinFoto||[];
    med.innerHTML='<p><b>'+n+' '+(n===1 ? 'persona autorizada' : 'personas autorizadas')+'</b> · '+esc(snHojaTxt(R.hoja))+' · '+(R.hojas>1 ? R.hojas+' hojas' : (n===1 ? 'en una hoja' : 'todas en una hoja'))+'</p>'+
      (sf.length ? '<p class="ojo"><b>'+sf.length+' '+(sf.length===1 ? 'sale sin foto' : 'salen sin foto')+':</b> '+esc(sf.slice(0, 6).join(', '))+(sf.length>6 ? '…' : '')+
        '. '+(sf.length===1 ? 'Sale con sus iniciales' : 'Salen con sus iniciales')+', y una puerta con iniciales no le dice al vigilante a quién dejar pasar. La foto se toma en la app, en la ficha de cada uno.</p>' : '')+
      (R.noCargo ? '<p class="ojo"><b>'+R.noCargo+' '+(R.noCargo===1 ? 'foto no se pudo cargar' : 'fotos no se pudieron cargar')+'.</b> Revisa tu conexión: el cartel se vuelve a armar con el próximo cambio.</p>' : '')+
      '<p class="gris">Imprime al 100 % y plastifícalo: este cartel vive a la intemperie.</p>';
  });
  $('snp-tit').oninput=function(){ S.titulo=this.value; snpCambio(420); };
  $('snp-pie').oninput=function(){ S.pie=this.value; snpCambio(420); };
  snChipsAl('snp-tam', function(v){ S.tam=v; snpCambio(); });
  snChipsAl('snp-ori', function(v){ S.orient=v; var ed=$('sn-ed'); if(ed) ed.classList.toggle('echada', v==='h'); snpCambio(); });
  snChipsAl('snp-cols', function(v){ S.cols=+v||0; snpCambio(); });
  var bq=$('snp-b'); if(bq) bq.oninput=function(){ S.busca=this.value; S.ver=60; _snpListaPinta(); };
  var L=$('snp-lista');
  L.onclick=function(ev){
    var mas=ev.target.closest ? ev.target.closest('button[data-que=todos]') : null;
    if(mas){ S.ver=100000; _snpListaPinta(); return; }
    var b=ev.target.closest ? ev.target.closest('button[data-id]') : null; if(!b) return;
    var id=b.getAttribute('data-id'), i=S.gente.indexOf(id);
    if(i>-1) S.gente.splice(i, 1);
    else{
      if(S.gente.length>=200){ toast('En un cartel entran hasta 200 personas.'); return; }
      S.gente.push(id);
    }
    _snpListaPinta(); snpCambio();
  };
  /* una foto que no carga deja sus iniciales */
  L.addEventListener('error', function(ev){ var im=ev.target; if(im && im.tagName==='IMG' && im.parentNode){ var p=im.parentNode; p.textContent=p.getAttribute('data-ini')||''; } }, true);
  $('snp-pic').onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button') : null; if(!b) return;
    var q=b.getAttribute('data-que'), k=b.getAttribute('data-k');
    if(k){ S.senal=k; S.pick=false; _snpPicPinta(); snpCambio(); return; }
    if(q==='quitar'){ S.senal=''; S.pick=false; _snpPicPinta(); snpCambio(); return; }
    if(q==='elegir'){ S.pick=!S.pick; S.qsen=''; _snpPicPinta(); if(S.pick){ var i=$('snp-q'); if(i) i.focus(); } }
  };
  $('snp-pic').oninput=function(ev){ if(ev.target && ev.target.id==='snp-q'){ S.qsen=ev.target.value; _snpCatPinta(); } };
  $('snp-cerrar').onclick=function(){ if(S.tG){ clearTimeout(S.tG); snpGuardar(S); } cerrarHoja(); };
  $('snp-pdf').onclick=function(){ snEntregar(S.T, 'senal', 'señales', 'pdf', this); };
  $('snp-imp').onclick=function(){ snEntregar(S.T, 'senal', 'señales', 'imp', this); };
  $('snp-fab').onclick=function(){
    confirmar('¿Volver al modelo?', 'Se quita lo que cambiaste en este cartel: vuelven el texto y el pictograma del modelo, y la gente que se propone.', { si:'Volver al modelo', no:'Cancelar' }).then(function(si){
      if(!si || SNP!==S) return;
      _snpFabrica(S); S.orden=null; S.pick=false;
      $('snp-tit').value=S.titulo; $('snp-pie').value=S.pie;
      Array.prototype.forEach.call(document.querySelectorAll('#snp-cols button[data-v]'), function(z){ var on=(z.getAttribute('data-v')==='0'); z.classList.toggle('on', on); z.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      _snpPicPinta(); _snpListaPinta(); snpCambio();
    });
  };
  _snpPicPinta(); _snpListaPinta(); _snpNotaPinta();
  snCtx().then(function(C){ var l=$('sn-logo-c'); if(l && SNP===S) l.innerHTML=snLogoNota(C, 'Va arriba, con la razón social y el nombre de la obra.'); });
  S.T.pide();
}
function _snpEstado(t, cl){ var m=$('snp-est'); if(m){ m.className='msg '+(cl||'gris')+' sn-pie-msg'; m.textContent=t||''; } }
/* cada cambio: la hoja se vuelve a armar y el cartel se guarda en un momento */
function snpCambio(espera){
  var S=SNP; if(!S) return;
  _snpEstado('Guardando…');
  if(S.tG) clearTimeout(S.tG);
  S.tG=setTimeout(function(){ snpGuardar(S); }, 800);
  _snpNotaPinta();
  if(S.T) S.T.pide(espera);
}
/* se guarda sobre lo que el servidor tiene EN ESE MOMENTO: lo que otro cambió en los demás modelos no se pisa */
function snpGuardar(S){
  if(!S) return;
  S.tG=null;
  if(S.guardando){ S.otra=true; return; }
  var obra=(YO.obra||{}).id;
  var mio=_snpUno({ titulo:S.titulo, pie:S.pie, gente:S.gente, senal:S.senal, tam:S.tam, orient:S.orient, cols:S.cols, t:Date.now() });
  S.guardando=true;
  estadoLeerP(SN_ESTADO).then(function(f){
    if((YO.obra||{}).id!==obra) return Promise.reject('otra_obra');
    var v=_snpLimpio(f && f.valor); v.c[S.llave]=mio;
    return estadoEscribirP(SN_ESTADO, v).then(function(){ return v; });
  }).then(function(v){
    S.guardando=false;
    if(SNW.gente && SNW.genteObra===obra) SNW.gente.guard=v;
    if(S.otra || S.tG){ S.otra=false; if(!S.tG) S.tG=setTimeout(function(){ snpGuardar(S); }, 200); return; }
    if(SNP===S) _snpEstado('Guardado · al abrirlo otra vez está como lo dejaste', 'ok');
    _snpHubMarca(S.llave);
  }, function(e){
    S.guardando=false;
    if(e==='otra_obra') return;
    if(SNP===S) _snpEstado('No se pudo guardar. '+porQueFallo(e), 'mal');
  });
}
/* en la pestaña, la tarjeta del modelo que se acaba de guardar dice «Armado» */
function _snpHubMarca(llave){
  var G=SNW.gente, hub=$('sn-mods'); if(!G || !hub) return;
  var b=hub.querySelector('button[data-m="'+(llave==='libre' ? '' : llave)+'"]'); if(!b) return;
  var porId={}; G.trabs.forEach(function(t){ porId[t.id]=t; });
  var caja=b.lastElementChild, viejo=caja ? caja.querySelector('.pill') : null;
  if(viejo) viejo.remove();
  if(caja) caja.insertAdjacentHTML('beforeend', _snpArmado(G.guard.c[llave], porId));
  if(llave==='libre' && caja){ var sm=caja.querySelector('small'); if(sm) sm.textContent=(G.guard.c.libre && G.guard.c.libre.titulo) ? G.guard.c.libre.titulo : 'Escribes tú para qué es'; }
}
/* a quiénes propone el modelo y por qué; y la vuelta al modelo, si ya se cambió */
function _snpNotaPinta(){
  var S=SNP, c=$('snp-nota'), fab=$('snp-fab'); if(!S) return;
  if(fab) fab.hidden=!(S.m && !_snpComoFabrica(S));
  if(!c) return;
  if(!S.m){ c.innerHTML=''; return; }
  var n=S.prop.length;
  if(!n){ c.innerHTML='<p class="sn-prop">Nadie de tu personal tiene un puesto o una credencial que lo autorice para esto. Elige abajo a quiénes van en el cartel.</p>'; return; }
  var q={ alm:0, puesto:0, cred:0 }, C={ trabs:SNW.gente.trabs, creds:SNW.gente.creds };
  S.prop.forEach(function(id){ var w=SEN_APP.porQue(S.porId[id], S.m.k, C); if(w) q[w]++; });
  var motivos=[];
  if(q.alm) motivos.push('por estar '+(q.alm===1 ? 'marcado como almacenero' : 'marcados como almaceneros'));
  if(q.puesto) motivos.push('por su puesto');
  if(q.cred) motivos.push('por la habilitación vigente de su credencial');
  c.innerHTML='<p class="sn-prop">✦ Te propongo a <b>'+n+' '+(n===1 ? 'persona' : 'personas')+'</b>'+(motivos.length ? ': '+esc(motivos.join(', ')) : '')+'. Revisa la lista: quita o agrega a quien corresponda. '+
    'A un ayudante no se le propone para un trabajo de riesgo: si va, lo marcas tú.</p>';
}
function _snpPicPinta(){
  var S=SNP, c=$('snp-pic'); if(!S || !c) return;
  var A=SEN_APP, h='';
  if(S.senal){
    var X=A.porK(S.senal);
    h+='<div class="sn-pic">'+A.svg(X, 46)+'<b>'+esc(X.n)+'</b><button type="button" class="bt sec chico" data-que="elegir">'+(S.pick ? 'Cerrar el catálogo' : 'Cambiar')+'</button>'+
       '<button type="button" class="bt sec chico" data-que="quitar">Quitar</button></div>';
  }else{
    h+='<p class="ayuda" style="margin:0 0 8px">Puedes ponerle la señal que corresponda —riesgo eléctrico, prohibido el ingreso— y sale junto al «ATENCIÓN», o grande si en la hoja sobra sitio.</p>'+
       '<button type="button" class="bt sec chico" data-que="elegir">'+(S.pick ? 'Cerrar el catálogo' : 'Elegir un pictograma')+'</button>';
  }
  if(S.pick) h+='<input type="search" id="snp-q" autocomplete="off" placeholder="eléctrico, ingreso, casco…" aria-label="Buscar un pictograma" style="margin-top:10px" value="'+esc(S.qsen)+'"><div id="snp-cat-c"></div>';
  c.innerHTML=h;
  if(S.pick) _snpCatPinta();
}
function _snpCatPinta(){
  var S=SNP, c=$('snp-cat-c'); if(!S || !c) return;
  var A=SEN_APP, q=A.norm(S.qsen).trim(), ps=q ? q.split(/\s+/) : [];
  var lista=A.senales.filter(function(s){
    if(!ps.length) return true;
    var t=A.norm(s.n+' '+(A.grupos[s.g]||''));
    for(var i=0;i<ps.length;i++) if(t.indexOf(ps[i])<0) return false;
    return true;
  }).slice(0, ps.length ? 60 : 24);
  if(!lista.length){ c.innerHTML='<p class="ayuda">Ninguna señal con «'+esc(S.qsen)+'».</p>'; return; }
  c.innerHTML='<div class="sn-cat" id="snp-cat">'+lista.map(function(s){
    return '<button type="button" data-k="'+esc(s.k)+'" class="'+(S.senal===s.k ? 'on' : '')+'" title="'+esc(s.n)+'">'+A.svg(s, 56)+'<b>'+esc(A.corto(s.n))+'</b></button>';
  }).join('')+'</div>'+(ps.length ? '' : '<p class="ayuda">Busca arriba para ver las '+A.senales.length+' señales de la norma.</p>');
}
function _snpListaPinta(){
  var S=SNP, c=$('snp-lista'); if(!S || !c) return;
  var todos=SNW.gente.trabs;
  if(!todos.length){
    c.innerHTML='<div class="aviso ojo" style="margin:0"><b>Todavía no hay personal cargado.</b> El cartel sale con las caras de tu gente: cárgala primero, en «Personal» o en «Cargar mi gestión».</div>';
    return;
  }
  /* arriba, los que ya van en el cartel y los propuestos. El orden se fija al abrir y no cambia al marcar: quien va
     bajando por la lista no pierde el sitio */
  if(!S.orden){
    var pri={}, n0=0;
    S.gente.forEach(function(id){ if(!(id in pri)) pri[id]=n0++; });
    S.prop.forEach(function(id){ if(!(id in pri)) pri[id]=n0++; });
    S.orden=pri;
  }
  var ord=S.orden, A=SEN_APP;
  var lista=todos.map(function(t, i){ return { t:t, r:(t.id in ord) ? ord[t.id] : 1e6+i }; }).sort(function(a, b){ return a.r-b.r; }).map(function(x){ return x.t; });
  var q=A.norm(S.busca).trim();
  if(q){
    var ps=q.split(/\s+/);
    lista=lista.filter(function(t){
      var txt=A.norm(t.nombre+' '+t.dni+' '+t.puesto+' '+t.area);
      for(var i=0;i<ps.length;i++) if(txt.indexOf(ps[i])<0) return false;
      return true;
    });
  }
  if(!lista.length){ c.innerHTML='<p class="ayuda">Nadie con «'+esc(S.busca)+'».</p>'; return; }
  var total=lista.length;
  lista=lista.slice(0, S.ver||60);
  c.innerHTML=lista.map(function(t){
    var i=S.gente.indexOf(t.id), yo=(i>-1), pr=(S.prop.indexOf(t.id)>-1), ini=A.iniciales(t.nombre);
    return '<button type="button" class="sn-per'+(yo ? ' on' : '')+'" data-id="'+esc(t.id)+'" aria-pressed="'+(yo ? 'true' : 'false')+'">'+
      '<span class="ini" data-ini="'+esc(ini)+'">'+(t.foto ? '<img loading="lazy" alt="" src="'+esc(t.foto)+'">' : esc(ini))+'</span>'+
      '<span style="min-width:0"><b>'+esc(t.nombre)+'</b><small>'+esc(t.dni || 'sin documento')+(t.puesto ? ' · '+esc(t.puesto) : '')+'</small>'+(pr ? '<small class="pr">✦ Propuesto</small>' : '')+'</span>'+
      '<span class="ord">'+(yo ? (i+1)+'º' : '')+'</span><span class="tic" aria-hidden="true">'+(yo ? '✓' : '')+'</span></button>';
  }).join('')+(total>lista.length ? '<button type="button" class="bt sec chico" data-que="todos" style="justify-self:start">Mostrar los '+(total-lista.length)+' que faltan</button>' : '');
}

/* ══ 4 · LAS TARJETAS DE ANDAMIO ══════════════════════════════════════════════════════════════
   El semáforo que se cuelga en el andamio, y la de equipo defectuoso. Son las de la app (AND_TIPOS y su dibujo):
   aquí se eligen las mismas opciones, con la hoja a la vista. Lo que se va eligiendo se recuerda mientras dure la
   sesión (el número del andamio cambia de una tarjeta a la siguiente; el resto casi nunca). */
var SNA_FIRMAS=[6, 9, 12, 15], SNA_POR_HOJA=[1, 2, 3, 4, 6];
function snaPintar(c){
  var A=SEN_APP;
  if(!SNW.and) SNW.and={ tipo:'verde', rotulo:'', ubic:'', firmas:9, porHoja:2, tam:'A4', orient:'v', reverso:true };
  var o=SNW.and, tipoDe=function(k){ var t=A.andTipos[0]; A.andTipos.forEach(function(x){ if(x.k===k) t=x; }); return t; };
  c.innerHTML='<p class="sn-intro">El semáforo que se cuelga en el andamio —<b>verde</b>, operativo; <b>amarilla</b>, con arnés obligatorio; <b>roja</b>, prohibido el uso— y la tarjeta de equipo defectuoso. '+
    'Salen con el anverso y el reverso uno al lado del otro: se corta, se dobla y se plastifica.</p>'+
    '<p class="sn-cupo" id="sn-cupo" data-clave="andamio" hidden></p>'+
    '<div class="sn-panel"><div class="sn-ed'+(o.orient==='h' ? ' echada' : '')+'" id="sn-ed"><div class="sn-form">'+
    '<div class="campo"><label>¿Cuál?</label><div class="sn-and" id="sna-tipos" role="group" aria-label="Qué tarjeta">'+A.andTipos.map(function(t){
      var on=(t.k===o.tipo);
      return '<button type="button" data-v="'+esc(t.k)+'" class="'+(on ? 'on' : '')+'" aria-pressed="'+(on ? 'true' : 'false')+'" style="--c:'+t.cf+'"><i></i><b>'+esc(t.n)+'</b></button>';
    }).join('')+'</div><p class="ayuda" id="sna-pie">'+esc(tipoDe(o.tipo).pie)+'</p></div>'+
    '<div class="campo"><label for="sna-r">Número o nombre del andamio <small>· opcional</small></label><input id="sna-r" maxlength="30" autocomplete="off" placeholder="AND-07" value="'+esc(o.rotulo)+'"></div>'+
    '<div class="campo"><label for="sna-u">¿Dónde está? <small>· opcional</small></label><input id="sna-u" maxlength="48" autocomplete="off" placeholder="Fachada norte · eje 4-5" value="'+esc(o.ubic)+'">'+
    '<p class="ayuda">Una tarjeta sin número sirve para cualquier andamio, y por eso no sirve para ninguno: si la mueven, nadie sabe cuál se revisó.</p></div>'+
    '<div class="campo"><label>¿Cuántas rayas para firmar?</label>'+snChips('sna-fir', SNA_FIRMAS.map(function(n){ return { v:n, t:String(n) }; }), o.firmas, 'Cuántas rayas para firmar')+
    '<p class="ayuda">En el anverso va la tabla de nombre, firma y fecha: una tarjeta verde que nadie firmó no dice quién respondió por ese andamio.</p></div>'+
    '<div class="campo"><label>¿De qué tamaño es la hoja?</label>'+snChips('sna-tam', snTamOps(), o.tam, 'Tamaño de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cómo va la hoja?</label>'+snChips('sna-ori', SN_ORI, o.orient, 'Orientación de la hoja')+'</div>'+
    '<div class="campo"><label>¿Cuántas tarjetas por hoja?</label>'+snChips('sna-ph', SNA_POR_HOJA.map(function(n){ return { v:n, t:String(n) }; }), o.porHoja, 'Cuántas tarjetas por hoja')+'</div>'+
    '<div class="campo"><label>¿Con reverso?</label>'+snChips('sna-rev', [{ v:'1', t:'Anverso y reverso' }, { v:'0', t:'Solo el anverso' }], o.reverso ? '1' : '0', 'Con reverso o sin él')+'</div>'+
    '<div id="sn-logo-c"></div>'+
    '</div><div class="sn-lado"><div class="sn-prev" id="sn-prev" aria-label="Vista previa de la hoja"><div class="sn-prev-msg">Armando la vista previa…</div></div>'+
    '<div class="sn-med" id="sn-med" aria-live="polite"></div>'+
    '<div class="sn-acc"><button type="button" class="bt" id="sna-pdf">⬇ Descargar PDF</button><button type="button" class="bt sec" id="sna-imp">🖨 Imprimir</button></div></div></div></div>';
  var prev=$('sn-prev');
  var T=snTaller(prev, function(){
    var x={ tipo:o.tipo, rotulo:o.rotulo, ubic:o.ubic, firmas:o.firmas, porHoja:o.porHoja, tam:o.tam, orient:o.orient, reverso:o.reverso };
    return snCtx().then(function(C){ return SEN_APP.andamio(x, C); }).then(function(R){ R.cuenta=1; R.x=x; return R; });
  }, function(R, e){
    var m=$('sn-med'); if(!m) return;
    if(!R){ snPrevMsg(prev, 'No se pudo armar la hoja', 'Revisa tu conexión e inténtalo otra vez.'); m.innerHTML=''; return; }
    var x=R.x;
    m.innerHTML='<p><b>'+esc(tipoDe(x.tipo).n)+'</b> · '+x.porHoja+' '+(x.porHoja===1 ? 'tarjeta' : 'tarjetas')+' en una hoja '+esc(snHojaTxt(R.hoja))+' · '+(x.reverso ? 'anverso y reverso' : 'solo el anverso')+'</p>'+
      '<p class="gris">Corta por el marco, dobla por el medio y plastifícala: esta tarjeta vive a la intemperie y se toca con las manos sucias.</p>';
  });
  $('sna-tipos').onclick=function(ev){
    var b=ev.target.closest ? ev.target.closest('button[data-v]') : null; if(!b) return;
    o.tipo=b.getAttribute('data-v');
    Array.prototype.forEach.call(this.querySelectorAll('button[data-v]'), function(z){ var on=(z===b); z.classList.toggle('on', on); z.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var p=$('sna-pie'); if(p) p.textContent=tipoDe(o.tipo).pie;
    T.pide();
  };
  $('sna-r').oninput=function(){ o.rotulo=this.value; T.pide(380); };
  $('sna-u').oninput=function(){ o.ubic=this.value; T.pide(380); };
  snChipsAl('sna-fir', function(v){ o.firmas=+v||9; T.pide(); });
  snChipsAl('sna-tam', function(v){ o.tam=v; T.pide(); });
  snChipsAl('sna-ori', function(v){ o.orient=v; var ed=$('sn-ed'); if(ed) ed.classList.toggle('echada', v==='h'); T.pide(); });
  snChipsAl('sna-ph', function(v){ o.porHoja=+v||2; T.pide(); });
  snChipsAl('sna-rev', function(v){ o.reverso=(v==='1'); T.pide(); });
  $('sna-pdf').onclick=function(){ snEntregar(T, 'andamio', 'hojas de tarjetas de andamio', 'pdf', this); };
  $('sna-imp').onclick=function(){ snEntregar(T, 'andamio', 'hojas de tarjetas de andamio', 'imp', this); };
  snCtx().then(function(C){
    var l=$('sn-logo-c'); if(!l) return;
    l.innerHTML=(C.emp && C.emp.logo) ? snLogoNota(C, 'Va sobre un recuadro blanco, para que se vea sobre el color.')
      : '<p class="sn-logo" id="sn-logo"><b>Sin logo de la empresa.</b> La tarjeta sale igual, pero sin logo no se sabe de quién es el andamio cuando hay tres contratistas en la misma obra. Se carga en la app, en «Datos de mi empresa».</p>';
  });
  T.pide();
  snUso().then(snCupoPinta);
}
