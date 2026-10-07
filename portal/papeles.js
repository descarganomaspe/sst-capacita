/* OBRASST · portal/papeles.js — el ATS y el IPERC continuo, también por la web (07/10/2026)
   Marcelo: «No se puede hacer ATS ni IPERC continuo en la web, al menos como modelo, arréglalo por favor. Usa
   diferentes modelos de ATS e IPERC continuo, muy aparte de los que te di en su momento y se usa en la app, darle
   al usuario a escoger ello.»

   Se escribe a mano y se pide al abrir «ATS e IPERC» (index: cargarPapeles / papIr). Llega después de gestion.js (de
   ahí salen el buscador de personal y las ayudas) y de papeles-app.js (lo que viene de la app: las listas A / NA, la
   biblioteca, la base de peligros y el dibujo del ATS «clásico» y del IPERC «Anexo 7»).

   LO QUE GUARDA, Y DÓNDE
   · El ATS: la MISMA fila que sube la app. sst_doc, hoja «ats» (el del día) o «ats-modelo» (el modelo de una
     actividad, con modelo:true), nota = el paquete de la app { v:1, id, fecha, hora, turno, trabajo, area, ubic, req,
     epp, epc, perm, acts:[{ a, filas:[{ p, r, c, m }] }], gente:[{ n, d, p, tr, t }], vb, devuelto, estado }. El celular
     del capataz lo trae con «↻ Traer de la nube» (ATS); la cuadrilla firma allí (o en el papel). Lo que la web le suma y la app deja
     pasar: fmt (el modelo de formato elegido), resp:{ cap, ing, sst } (los nombres para el papel), y en cada fila n1,
     n2 (nivel A / M / B antes y después del control) y rs (quién responde por ese control).
     Desde aquí solo se corrige mientras nadie haya firmado: después, cambiarlo sería cambiar lo que otro firmó.
   · El IPERC continuo: sst_doc, hoja «iperc-c», SIN «url» (así no aparece como archivo en ninguna carpeta), nota =
     { v:1, k:'ipc', id, fecha, hora, nivel, labor, gente:[{ nombre, dni }], filas:[{ p, r, ev, m, res, j }],
     secuencia:[…], sup:[{ hora, nombre, medida }], fmt, por, cuando } — los nombres de campo del celular. En la app el
     IPERC continuo vive solo en el teléfono que lo hizo: el de la web es para armarlo en la oficina e imprimirlo.
   · El cupo del plan es el de la app (los contadores de sst_uso): «ats» por mes y «ats_modelo» en total; el IPERC
     continuo gasta el del ATS. Los formatos en blanco no gastan nada.

   EL PAPEL
   El usuario elige el modelo de formato; todos se llenan con lo mismo. La obra deja elegido el suyo una vez
   (sst_estado «papeles»: { ats, ipc }): es el que se propone al armar uno y con el que salen los que llegan de los
   celulares, que no traen modelo (y los que pasaron por un celular: al volver a subirlos, la app suelta «fmt»).
   La franja roja «SIN V°B° DEL SSOMA» sale como
   en la app: solo en el ATS del día de una obra que firma en digital, mientras el SSOMA no haya firmado. */
var PAP_HOJA_IPC = 'iperc-c';
var PAP_MODELOS = {
  ats: [
    { k:'clasico', n:'Clásico de obra', hoja:'A4 horizontal · dos caras',
      d:'El de la app. Las listas para marcar «aplica / no aplica» —requisitos, EPP, protección colectiva y permisos— y la tabla de peligros; al reverso, las obligaciones, las reglas y la firma de cada uno al inicio y al término.' },
    { k:'pasos', n:'Paso a paso', hoja:'A4 vertical',
      d:'Tres columnas: el paso, sus peligros y riesgos, y el control de cada uno. Lleva solo el EPP y los permisos que aplican, y las firmas en la misma hoja.' },
    { k:'riesgo', n:'Con nivel de riesgo', hoja:'A4 horizontal',
      d:'Cada peligro se califica —alto, medio o bajo— antes y después del control, y lleva el nombre de quien responde por ese control.' },
    { k:'verifica', n:'Con verificación previa', hoja:'A4 vertical',
      d:'Arranca con ocho preguntas de «antes de empezar» para marcar en el frente, y termina con el cierre de la tarea.' }
  ],
  ipc: [
    { k:'anexo7', n:'Anexo N.º 7 (minería)', hoja:'A4 horizontal', pais:'pe',
      d:'El formato del reglamento de minería (D.S. 024-2016-EM), rótulo por rótulo. Es el de la app.' },
    { k:'general', n:'General', hoja:'A4 vertical',
      d:'Los mismos cinco casilleros —peligro, riesgo, evaluación, control y riesgo residual—, con más espacio para escribir a mano y sin el rótulo del anexo.' },
    { k:'jerarquia', n:'Con jerarquía de controles', hoja:'A4 horizontal',
      d:'Cada control se marca según su tipo: eliminación, sustitución, ingeniería, administrativo o EPP. Ayuda a no quedarse solo en el EPP.' }
  ]
};
function papModelos(tipo){ var p=paisObraP(); return (PAP_MODELOS[tipo]||[]).filter(function(m){ return !m.pais || m.pais===p; }); }
/* el de partida: el que la obra dejó elegido («¿Con qué formato salen?»); si no eligió, el ATS sale en el clásico y el
   IPERC continuo en el general (el del anexo, solo en una obra de minería del Perú) */
function papModeloDef(tipo){
  var X=(PAP.ctx && PAP.ctxObra===(YO.obra||{}).id) ? PAP.ctx : null, k=X && X.pref && X.pref[tipo];
  if(k && papModelos(tipo).some(function(m){ return m.k===k; })) return k;
  if(tipo==='ipc') return (paisObraP()==='pe' && sectorObraP()==='mineria') ? 'anexo7' : 'general';
  return 'clasico';
}
function papModelo(tipo, k){ var L=papModelos(tipo), d=papModeloDef(tipo); return L.filter(function(m){ return m.k===k; })[0] || L.filter(function(m){ return m.k===d; })[0] || L[0]; }

var PAP = { ctx:null, ctxObra:null, ctxT:0 };
function _papCss(){
  if($('pap-css')) return;
  var st=document.createElement('style'); st.id='pap-css';
  st.textContent=[
    '.pap-modo{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:12px 14px;margin:0 0 16px}',
    '.pap-modo p{margin:0;flex:1 1 320px;font-size:13px;color:var(--gris);line-height:1.5}.pap-modo p b{color:var(--tinta)}.pap-modo .seg{margin:0}',
    '.pap-pref{margin-top:-8px}.pap-pref-s{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center}.pap-pref-s label{display:inline-flex;gap:7px;align-items:center;margin:0;font-size:12.5px;color:var(--gris);white-space:nowrap}.pap-pref-s select{width:auto;max-width:100%;padding:7px 30px 7px 10px;font-size:13.5px}',
    '.pap-pasos{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px;padding:0;list-style:none}',
    '.pap-pasos button{appearance:none;-webkit-appearance:none;cursor:pointer;border:1px solid var(--raya);background:var(--panel);color:var(--gris);border-radius:999px;padding:7px 13px;font:inherit;font-size:13px;display:inline-flex;gap:7px;align-items:center}',
    '.pap-pasos button b{display:inline-grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#EEF1F4;color:var(--gris);font-size:11.5px;font-weight:600}',
    '.pap-pasos button.on{border-color:var(--azul);color:var(--tinta);background:#F4F8FB}.pap-pasos button.on b{background:var(--azul);color:#fff}',
    '.pap-pasos button.ok b{background:#DFF3E7;color:#0B6B3A}.pap-pasos button.falta b{background:#FDECEA;color:#B42318}',
    '.pap-marcas{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:4px 16px;margin:0 0 6px}',
    '.pap-m{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--raya);font-size:13.5px}.pap-m span{flex:1;min-width:0;overflow-wrap:anywhere}',
    '.pap-m button{appearance:none;-webkit-appearance:none;cursor:pointer;border:1px solid var(--raya);background:var(--panel);color:var(--gris);border-radius:6px;min-width:34px;padding:4px 0;font:inherit;font-size:12px;font-weight:600}',
    '.pap-m button.a{background:#FCDB00;border-color:#D9B800;color:#1B2025}.pap-m button.na{background:#EEF1F4;border-color:#C9D1D8;color:#1B2025}',
    '.pap-act{border:1px solid var(--raya);border-radius:12px;background:var(--panel);margin:0 0 12px}',
    '.pap-act-cab{display:flex;gap:8px;align-items:center;padding:10px 12px;background:#FAFBFC;border-bottom:1px solid var(--raya);border-radius:12px 12px 0 0}',
    '.pap-act-cab>b{flex:0 0 auto;display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--azul);color:#fff;font-size:12.5px}',
    '.pap-act-cab input{flex:1;min-width:0;font-weight:600}.pap-act-cab .bt-link{white-space:nowrap}',
    '.pap-filas{padding:10px 12px 12px}',
    '.pap-fila-cab,.pap-fila{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.5fr) 30px;gap:6px;align-items:start}',
    '.pap-fila-cab{font-size:11.5px;color:var(--gris);text-transform:uppercase;letter-spacing:.03em;margin:0 0 5px}',
    '.pap-et{display:none}',
    '.pap-fila{margin:0 0 6px;position:relative}.pap-fila textarea{min-height:58px;padding:7px 9px;font-size:13.5px;line-height:1.35;resize:vertical}',
    '.pap-fila .pap-x{appearance:none;-webkit-appearance:none;cursor:pointer;border:0;background:transparent;color:var(--gris);font-size:18px;line-height:1;padding:8px 0;border-radius:6px}.pap-fila .pap-x:hover{color:var(--mal);background:#FDECEA}',
    '.pap-mas{grid-column:1 / -1;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;font-size:12.5px;color:var(--gris);padding:0 0 4px}',
    '.pap-mas label{display:inline-flex;gap:6px;align-items:center;margin:0;font-size:12.5px;color:var(--gris)}.pap-mas input[type=text]{width:190px;padding:5px 8px;font-size:13px}',
    '.pap-niv{display:inline-flex;gap:3px}.pap-niv button{appearance:none;-webkit-appearance:none;cursor:pointer;border:1px solid var(--raya);background:var(--panel);color:var(--gris);border-radius:6px;width:30px;padding:3px 0;font:inherit;font-size:12px;font-weight:700}',
    '.pap-niv button.on[data-v=A]{background:#D9261C;border-color:#D9261C;color:#fff}.pap-niv button.on[data-v=M]{background:#E8A000;border-color:#E8A000;color:#fff}.pap-niv button.on[data-v=B]{background:#2E7D32;border-color:#2E7D32;color:#fff}',
    '.pap-sug{position:absolute;z-index:6;left:0;top:100%;width:min(560px,92vw);max-height:268px;overflow:auto;background:var(--panel);border:1px solid var(--raya);border-radius:10px;box-shadow:0 10px 30px rgba(11,42,58,.16);margin-top:2px}',
    '.pap-sug button{appearance:none;-webkit-appearance:none;display:block;width:100%;text-align:left;cursor:pointer;border:0;border-bottom:1px solid var(--raya);background:transparent;padding:8px 11px;font:inherit;font-size:13px;color:var(--tinta)}',
    '.pap-sug button:last-child{border-bottom:0}.pap-sug button:hover,.pap-sug button:focus{background:#F4F8FB}.pap-sug small{display:block;color:var(--gris);font-size:12px;margin-top:1px}',
    '.pap-sug p{margin:0;padding:8px 11px;font-size:12px;color:var(--gris);background:#FAFBFC;border-bottom:1px solid var(--raya)}',
    '.pap-fmt{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin:0 0 14px}',
    '.pap-fmt button{appearance:none;-webkit-appearance:none;cursor:pointer;text-align:left;border:1px solid var(--raya);background:var(--panel);border-radius:12px;padding:12px 13px;font:inherit;color:var(--texto);display:flex;flex-direction:column;gap:5px}',
    '.pap-fmt button b{color:var(--tinta);font-size:14px;font-weight:600}.pap-fmt button i{font-style:normal;font-size:11.5px;color:var(--gris);text-transform:uppercase;letter-spacing:.03em}.pap-fmt button span{font-size:12.5px;color:var(--gris);line-height:1.45}',
    '.pap-fmt button.on{border-color:var(--azul);box-shadow:0 0 0 2px rgba(0,89,158,.16);background:#F8FBFD}',
    '.pap-chips-alto{min-height:42px;align-items:center}',
    '.pap-sup-g{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:8px;padding-right:26px}.pap-sup-g .campo{margin:0}',
    '.pap-sec{display:grid;gap:6px;margin:0 0 8px}.pap-sec div{display:flex;gap:8px;align-items:center}.pap-sec div>b{flex:0 0 22px;text-align:center;color:var(--gris);font-size:12.5px}.pap-sec input{flex:1;min-width:0}',
    '.pap-ipf{border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:12px;margin:0 0 10px;position:relative}',
    '.pap-ipf-g{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) minmax(0,1.6fr);gap:8px}',
    '.pap-ipf label{font-size:11.5px;color:var(--gris);text-transform:uppercase;letter-spacing:.03em;margin:0 0 4px;display:block}.pap-ipf textarea{min-height:56px;padding:7px 9px;font-size:13.5px;line-height:1.35}',
    '.pap-ipf-n{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;margin:8px 0 0;font-size:12.5px;color:var(--gris)}.pap-ipf-n>span{display:inline-flex;gap:7px;align-items:center}',
    '.pap-ipf .pap-x{position:absolute;top:6px;right:8px;appearance:none;-webkit-appearance:none;cursor:pointer;border:0;background:transparent;color:var(--gris);font-size:18px;line-height:1;padding:4px 7px;border-radius:6px}.pap-ipf .pap-x:hover{color:var(--mal);background:#FDECEA}',
    '.pap-jer{display:inline-flex;flex-wrap:wrap;gap:4px 12px}.pap-jer label{display:inline-flex;gap:5px;align-items:center;margin:0;text-transform:none;letter-spacing:0;font-size:12.5px;color:var(--texto)}.pap-jer input{width:15px;height:15px;margin:0;padding:0}',
    '@media (max-width:760px){.pap-pref-s{flex:1 1 100%}.pap-pref-s label{flex:1 1 100%;justify-content:space-between}.pap-pref-s select{flex:0 1 230px;min-width:0}.pap-fila-cab{display:none}.pap-fila{grid-template-columns:minmax(0,1fr) 30px;border:1px solid var(--raya);border-radius:10px;padding:8px;background:#FCFDFE}.pap-fila textarea{grid-column:1;min-height:46px}.pap-et{display:block;grid-column:1;font-size:11px;color:var(--gris);text-transform:uppercase;letter-spacing:.03em;margin:2px 0 -3px}.pap-fila .pap-x{grid-column:2;grid-row:1}.pap-ipf-n>span{flex-wrap:wrap}.pap-mas{grid-column:1 / -1}.pap-ipf-g{grid-template-columns:minmax(0,1fr)}.pap-sup-g{grid-template-columns:minmax(0,1fr)}.pap-act-cab{flex-wrap:wrap}.pap-act-cab input{flex:1 1 100%;order:2}.pap-sug{width:86vw}}'
  ].join('\n');
  document.head.appendChild(st);
}
/* ── lo de la obra que va al papel: la empresa y su logo, los códigos de formato y cómo se firma el ATS ── */
function _papLogo(du){
  return new Promise(function(res){
    if(!du) return res(null);
    var im=new Image();
    im.onload=function(){ var r=(im.naturalWidth && im.naturalHeight) ? im.naturalWidth/im.naturalHeight : 1; res({ du:du, r:r||1 }); };
    im.onerror=function(){ res(null); };
    im.src=du;
  });
}
function _papPref(v){ v=(v && typeof v==='object' && !Array.isArray(v)) ? v : {}; return { ats:String(v.ats||'').slice(0, 20), ipc:String(v.ipc||'').slice(0, 20) }; }
function _papFmt(x){ x=(x && typeof x==='object') ? x : {}; return { cod:gesTxt(x.cod).slice(0, 40), rev:gesTxt(x.rev).slice(0, 12), fecha:/^\d{4}-\d{2}-\d{2}/.test(String(x.fecha||'')) ? String(x.fecha).slice(0, 10) : '' }; }
function papCtx(fresco){
  var oid=(YO.obra||{}).id;
  if(!fresco && PAP.ctx && PAP.ctxObra===oid && Date.now()-PAP.ctxT<120000) return Promise.resolve(PAP.ctx);
  var nada=function(){ return null; };
  return Promise.all([
    empleadorP().catch(nada),
    estadoLeerP('formatos').catch(nada),
    traer('sst_doc', '&select=id,nombre,nota&hoja=eq.ats-cfg&order=creado.desc', 1).catch(nada),
    estadoLeerP('papeles').catch(nada)
  ]).then(function(r){
    var emp=r[0]||{}, it=(r[1] && r[1].valor && typeof r[1].valor==='object' && r[1].valor.items) || {}, cfg=(r[2]||[])[0]||null;
    return _papLogo(emp.logo).then(function(L){
      PAP.ctx={ emp:{ razon:String(emp.razon||''), logo:L ? L.du : null }, logo:L, obra:String((YO.obra||{}).nombre||''), fmt:{ ats:_papFmt(it.ats), iperc:_papFmt(it.iperc) },
                modo:(cfg && String(cfg.nombre||'').toLowerCase()==='papel') ? 'papel' : 'digital', cfgId:cfg ? cfg.id : null, pref:_papPref(r[3] && r[3].valor) };
      PAP.ctxObra=oid; PAP.ctxT=Date.now();
      return PAP.ctx;
    });
  });
}
/* «¿Cómo se hace el ATS en esta obra?»: la misma fila que usa la app (sst_doc «ats-cfg», el modo va en «nombre»; su
   «nota» lleva otros interruptores de la obra y no se toca) */
function papModoPoner(m){
  m=(m==='papel') ? 'papel' : 'digital';
  return traer('sst_doc', '&select=id,nombre&hoja=eq.ats-cfg&order=creado.desc', 1).then(function(rows){
    var f=(rows||[])[0];
    if(f) return sbPatch('sst_doc?id=eq.'+encodeURIComponent(f.id), { nombre:m });
    return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:'ats-cfg', nombre:m, nota:'{}' });
  }).then(function(rows){
    if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'Esta cuenta no puede cambiarlo en esta obra.'});
    if(PAP.ctx && PAP.ctxObra===(YO.obra||{}).id) PAP.ctx.modo=m;
    return m;
  });
}
/* «¿Con qué formato salen?»: se escribe sobre lo que el servidor tiene en ese momento (otro pudo cambiar el otro papel) */
function papPrefPoner(tipo, k){
  if(!papModelos(tipo).some(function(m){ return m.k===k; })) return Promise.reject({portal:'Ese formato no está en esta obra.'});
  return estadoLeerP('papeles').then(function(f){
    var v=_papPref(f && f.valor); v[tipo]=k;
    return estadoEscribirP('papeles', v).then(function(){ if(PAP.ctx && PAP.ctxObra===(YO.obra||{}).id) PAP.ctx.pref=v; return v; });
  });
}
/* ── el cupo del plan: los contadores de la app (sst_uso). Sin poder leerlos no se frena (como la app sin señal) ── */
function papCupo(clave){
  var P=planWebActual(), tope=(P && P.tope && typeof P.tope[clave]==='number') ? P.tope[clave] : -1;
  if(tope<0) return Promise.resolve({ ok:true });
  var porMes=(P.mes||[]).indexOf(clave)>-1;
  return sbRpc('sst_uso_leer', { p_emp:YO.obra.id }).then(function(j){
    var n=(j && j.ok) ? (+(((porMes ? j.m : j.t)||{})[clave])||0) : 0;
    return (n>=tope) ? { ok:false, tope:tope, lleva:n, porMes:porMes, plan:P.n } : { ok:true };
  }, function(){ return { ok:true }; });
}
function papSumar(clave){ try{ sbRpc('sst_uso_sumar', { p_emp:YO.obra.id, p_clave:clave, p_n:1 }).then(function(){}, function(){}); }catch(e){} }
function papTope(r, que){
  return dialogo({ titulo:'Llegaste al tope de tu plan', texto:'Ya van '+r.lleva+' '+que+(r.porMes ? ' este mes' : '')+' y el plan '+r.plan+' llega a '+r.tope+'. Lo que ya está guardado sigue ahí, y los formatos en blanco se pueden bajar igual.',
                   si:(planwPuedePagar() ? 'Ver los planes' : 'Ver mi plan'), no:'Cerrar' }).then(function(v){ if(v===true){ cerrarHoja(); navegar('plan'); } });
}

/* ── el PDF de un papel ─────────────────────────────────────────────────────────────────────
   tipo: 'ats' | 'ipc' · d: el paquete (el de la nube) · op: { fmt, blanco } → Promise<{ blob, nombre, hojas, fmt, franja }> */
function _papAtsLocal(d){
  var gente=[], firmas={}, trabs=[], vb=d.vb||{}, R=d.resp||{};
  (d.gente||[]).forEach(function(g, i){ var id='g'+i; gente.push(id); trabs.push({ id:id, nombre:(g && g.n)||'', verificado:true }); if(g && g.tr) firmas[id]={ tr:g.tr, t:g.t||0 }; });
  return { trabs:trabs, a:{ id:d.id||'ats', modo:d.modelo ? 'modelo' : 'dia', codigo:d.codigo||'', rev:d.rev||'', fecha:d.fecha||'', hora:d.hora||'', turno:d.turno||'', area:d.area||'', trabajo:d.trabajo||'', ubic:d.ubic||'',
    rGrupo:R.cap || (vb.cap && vb.cap.n) || '', rSuper:R.ing || (vb.ing && vb.ing.n) || '', rSST:R.sst || (vb.sst && vb.sst.n) || '',
    req:d.req||{}, epp:d.epp||{}, epc:d.epc||{}, perm:d.perm||{}, acts:d.acts||[], gente:gente, firmas:firmas, vb:vb, devuelto:d.devuelto||null, obs:d.obs||'' } };
}
/* el nombre del archivo, solo con letras corrientes: con un «·», un «º» o una raya larga, algunos navegadores sueltan
   el nombre y lo bajan como «download» */
function _papNombre(t){
  return nombreArchivo(String(t||'').replace(/[·•–—|]+/g, '-').replace(/º/g, 'o').replace(/ª/g, 'a')).replace(/[^ -~]/g, '').replace(/(\s*-\s*){2,}/g, ' - ').replace(/\s+/g, ' ').trim();
}
function papFranjaAts(d, X, blanco){
  if(blanco || !d || d.modelo || !X || X.modo!=='digital') return '';
  if(d.devuelto) return 'DEVUELTO CON OBSERVACIÓN — NO INICIAR EL TRABAJO';
  if(!(d.vb && d.vb.sst && d.vb.sst.tr)) return 'SIN V°B° DEL SSOMA — ESTE ATS NO HABILITA EL INICIO DEL TRABAJO';
  return '';
}
function papPdfDe(tipo, d, op){
  op=op||{}; d=d||{};
  return Promise.all([cargarEvPDF(), papCtx()]).then(function(r){
    var X=r[1], M=papModelo(tipo, op.fmt || d.fmt), fuera=(paisObraP()!=='pe');
    var C={ emp:X.emp, logo:X.logo, obra:X.obra, fmt:X.fmt, tx:fuera ? txPaisP : null, blanco:!!op.blanco, franja:'' }, R;
    if(tipo==='ats'){
      C.franja=papFranjaAts(d, X, op.blanco);
      if(M.k==='clasico'){
        var L=_papAtsLocal(d);
        R=PAP_APP.ats(L.a, { emp:C.emp, logo:C.logo, obra:C.obra, fmt:C.fmt, trabs:L.trabs, tx:C.tx, libre:!C.franja, sinTurno:!d.turno });
      } else R=(M.k==='pasos' ? _papAtsPasos : (M.k==='riesgo' ? _papAtsRiesgo : _papAtsVerifica))(d, C);
      R.nombre=_papNombre(op.blanco ? 'ATS en blanco - '+M.n : 'ATS - '+(d.trabajo||'trabajo')+(d.modelo ? ' (modelo)' : (d.fecha ? ' - '+d.fecha : '')))+'.pdf';
    } else {
      if(M.k==='anexo7') R=PAP_APP.iperc({ id:d.id||'ip', fecha:d.fecha||'', hora:d.hora||'', nivel:d.nivel||'', labor:d.labor||'', gente:(d.gente||[]).length ? d.gente : [], filas:d.filas||[], secuencia:d.secuencia||[], sup:d.sup||[] },
                                        { emp:C.emp, logo:C.logo, obra:C.obra, fmt:C.fmt, tx:C.tx, ipListo:true });
      else R=(M.k==='jerarquia' ? _papIpcJerarquia : _papIpcGeneral)(d, C);
      R.nombre=_papNombre(op.blanco ? 'IPERC continuo en blanco - '+M.n : 'IPERC continuo - '+(d.labor||d.nivel||'tarea')+(d.fecha ? ' - '+d.fecha : ''))+'.pdf';
    }
    R.fmt=M.k; R.franja=C.franja;
    return R;
  });
}
/* la vista previa: el mismo PDF, dibujado en la página (pdf.js, el de los boletines) */
function papPrevia(caja, tipo, d, op){
  if(!caja) return Promise.resolve(null);
  caja.innerHTML='<div class="pdfv-msg">Armando la hoja…</div>';
  return papPdfDe(tipo, d, op).then(function(R){
    if(!caja.isConnected) return R;
    pdfVistaP(caja, R.blob);
    return R;
  }, function(e){ if(caja.isConnected) caja.innerHTML='<div class="pdfv-msg">No se pudo armar la hoja. Revisa tu conexión e inténtalo otra vez.</div>'; return Promise.reject(e); });
}
function papBajar(R){ if(R && R.blob) bajarBlob(R.blob, R.nombre||'papel.pdf'); }
function papImprimir(R){
  if(!R || !R.blob) return;
  try{ var u=URL.createObjectURL(R.blob), w=window.open(u, '_blank'); if(!w) bajarBlob(R.blob, R.nombre||'papel.pdf'); setTimeout(function(){ try{ URL.revokeObjectURL(u); }catch(e){} }, 60000); }catch(e2){ bajarBlob(R.blob, R.nombre||'papel.pdf'); }
}

/* ══ 2 · EL PAPEL: LOS MODELOS DE FORMATO ══════════════════════════════════════════════════════
   Cada modelo es una función que dibuja con jsPDF (el de la app, que llega con evaluaciones-pdf.js). El «clásico» del
   ATS y el «Anexo 7» del IPERC continuo NO están aquí: son el dibujo de la app (papeles-app.js). Los de aquí son
   formatos generales, hechos para esta página: no copian el de ninguna empresa.
   Lo común: A4, letra Helvetica, el cuerpo a 8 puntos y lo que alguien escribió en negrita (se lee con casco puesto);
   las filas miden lo que pide su texto y se reparten en las hojas que hagan falta; en blanco, la hoja sale llena de
   renglones para escribir a mano. La «C» de cada uno: { emp:{razon}, logo:{du,r}, obra, fmt:{ats,iperc}, tx, franja,
   blanco }. */
var _PP_MMPT = 25.4/72;
var _PP_AZUL = [214, 232, 243], _PP_GRIS = [238, 241, 244], _PP_TINTA = [20, 24, 30], _PP_TENUE = [96, 104, 112], _PP_AMAR = [252, 219, 0];
function _ppDoc(orient, C, titulo, sub, clave){
  var h=(orient==='h'), W=h ? 297 : 210, H=h ? 210 : 297, M=9;
  var doc=new jspdf.jsPDF({ unit:'mm', format:[W, H], orientation:h ? 'landscape' : 'portrait' });
  var tx=(C && typeof C.tx==='function') ? C.tx : function(x){ return x; };
  var P={ doc:doc, W:W, H:H, M:M, w:W-M*2, y:M, C:C||{}, tx:tx, pt:8, fondo:H-M-4.6, _pag:[] };
  P.lh=function(pt){ return (pt||P.pt)*1.16*_PP_MMPT; };
  P.fuente=function(pt, b){ doc.setFont('helvetica', b ? 'bold' : 'normal'); doc.setFontSize(pt||P.pt); };
  P.parte=function(t, w, pt, b){ P.fuente(pt, b); return doc.splitTextToSize(String(t==null ? '' : t), Math.max(4, w)); };
  P.alto=function(t, w, pt, b){ var s=String(t==null ? '' : t); return s ? P.parte(s, w, pt, b).length*P.lh(pt) : 0; };
  P.caja=function(x, y, w, hh, f){
    if(f){ doc.setFillColor(f[0], f[1], f[2]); doc.rect(x, y, w, hh, 'F'); }
    doc.setDrawColor(70, 78, 86); doc.setLineWidth(0.22); doc.rect(x, y, w, hh, 'S');
  };
  /* op: { pt, b, c:[r,g,b], al:'c'|'d', max (renglones), alto (se centra en ese alto) } → el alto que ocupó */
  P.txt=function(t, x, y, w, op){
    op=op||{}; var pt=op.pt||P.pt, s=String(t==null ? '' : t); if(!s) return 0;
    var lin=P.parte(s, w, pt, op.b), lh=P.lh(pt); if(op.max && lin.length>op.max) lin=lin.slice(0, op.max);
    var c=op.c||_PP_TINTA; doc.setTextColor(c[0], c[1], c[2]);
    var y0=y+(op.alto ? Math.max(0, (op.alto-lin.length*lh)/2) : 0)+pt*0.76*_PP_MMPT;
    lin.forEach(function(l, i){
      if(op.al==='c') doc.text(l, x+w/2, y0+i*lh, {align:'center'}); else if(op.al==='d') doc.text(l, x+w, y0+i*lh, {align:'right'}); else doc.text(l, x, y0+i*lh);
    });
    return lin.length*lh;
  };
  /* una celda: su marco y su texto, con 1.4 mm de aire (centrado en lo alto, salvo op.arriba) */
  P.celda=function(x, y, w, hh, t, op){
    op=op||{}; P.caja(x, y, w, hh, op.f||null);
    if(t!=='' && t!=null) P.txt(t, x+1.4, y+(op.arriba ? 0.9 : 0), w-2.8, { pt:op.pt, b:op.b, c:op.c, al:op.al, max:op.max, alto:op.arriba ? 0 : hh });
  };
  /* el rótulo (fondo celeste, negrita chica) y su valor (negrita) en una fila */
  P.par=function(x, y, wR, wV, hh, rot, val){ P.celda(x, y, wR, hh, tx(rot), {f:_PP_AZUL, b:true, pt:7}); P.celda(x+wR, y, wV, hh, val, {b:true, pt:8, max:Math.max(1, Math.floor((hh-0.6)/P.lh(8)))}); };
  /* un casillero para marcar con aspa; lleno, con su aspa dibujada (la letra no tiene ese signo) */
  P.casilla=function(x, y, l, marcada){
    doc.setDrawColor(70, 78, 86); doc.setLineWidth(0.22); doc.rect(x, y, l, l, 'S');
    if(marcada){ doc.setLineWidth(0.45); doc.setDrawColor(20, 24, 30); doc.line(x+l*0.2, y+l*0.2, x+l*0.8, y+l*0.8); doc.line(x+l*0.8, y+l*0.2, x+l*0.2, y+l*0.8); doc.setLineWidth(0.22); }
  };
  P.cabe=function(hh){ return P.y+hh<=P.fondo+0.01; };
  /* la cabecera de la primera hoja: el logo, el título y la caja del código del formato */
  P.cabecera=function(){
    var x=M, y=P.y, hC=15, wCod=54, wLogo=0, F=(P.C.fmt && P.C.fmt[clave]) || {};
    P.caja(x, y, P.w-wCod, hC);
    if(P.C.logo && P.C.logo.du){
      var lh2=hC-3.4, r=P.C.logo.r||1, lw=lh2*r; if(lw>32){ lw=32; lh2=lw/r; }
      try{ doc.addImage(P.C.logo.du, x+2, y+(hC-lh2)/2, lw, lh2, undefined, 'FAST'); wLogo=lw+4; }catch(e){ wLogo=0; }
    }
    P.txt(tx(titulo), x+wLogo+2, y+(sub ? 2.4 : 0), P.w-wCod-wLogo-4, {pt:12.5, b:true, al:'c', alto:sub ? 0 : hC, max:1});
    if(sub) P.txt(tx(sub), x+wLogo+2, y+8.8, P.w-wCod-wLogo-4, {pt:7.4, al:'c', c:_PP_TENUE, max:1});
    var cx=x+P.w-wCod, hf=hC/4;
    ['Código: '+(F.cod||''), 'Versión: '+(F.rev||''), 'Fecha: '+(F.fecha ? fechaLarga(F.fecha) : ''), ''].forEach(function(t, i){
      P.caja(cx, y+i*hf, wCod, hf, i%2 ? [247, 249, 251] : null);
      if(t) P.txt(t, cx+1.6, y+i*hf, wCod-3.2, {pt:6.6, alto:hf, max:1});
    });
    P._pag.push({ n:doc.getNumberOfPages(), x:cx+1.6, y:y+3*hf, w:wCod-3.2, h:hf });
    P.y=y+hC+2.2;
  };
  /* hoja nueva, con una cabecera corta para saber de qué papel es */
  P.salto=function(){
    doc.addPage([W, H], h ? 'landscape' : 'portrait'); P.y=M;
    P.caja(M, P.y, P.w, 7, _PP_GRIS);
    P.txt(tx(titulo)+' (continuación)'+(P.C.rotulo ? '  ·  '+P.C.rotulo : ''), M+1.6, P.y, P.w-50, {pt:7.6, b:true, alto:7, max:1});
    P._pag.push({ n:doc.getNumberOfPages(), x:M+P.w-46, y:P.y, w:44.4, h:7, d:true });
    P.y+=7+2.2;
  };
  P.sitio=function(hh){ if(!P.cabe(hh)) P.salto(); };
  /* una franja de título de bloque */
  P.titulo=function(t, nota){
    P.caja(M, P.y, P.w, 5, _PP_AZUL);
    P.txt(tx(t), M+1.6, P.y, P.w-3.2, {pt:7.4, b:true, alto:5, max:1});
    if(nota){ P.fuente(7.4, true); var a=doc.getTextWidth(tx(t)); P.txt(tx(nota), M+1.6+a+2.4, P.y, P.w-a-7, {pt:6.6, c:_PP_TENUE, alto:5, max:1}); }
    P.y+=5;
  };
  /* al final: «Página x de y» en cada hoja, el pie y, si toca, la franja roja */
  P.listo=function(){
    var n=doc.getNumberOfPages(), pie=[String((P.C.emp||{}).razon||'').toUpperCase(), 'OBRASST'].filter(Boolean).join('  ·  ');
    P._pag.forEach(function(q){ doc.setPage(q.n); P.txt('Página '+q.n+' de '+n, q.x, q.y, q.w, {pt:6.6, alto:q.h, al:q.d ? 'd' : '', max:1}); });
    for(var i=1;i<=n;i++){
      doc.setPage(i);
      P.fuente(5.8, false); doc.setTextColor(150, 158, 166); doc.text(pie, W/2, H-3.4, {align:'center'});
      if(P.C.franja){
        doc.setFillColor(217, 38, 28); doc.rect(0, 0.6, W, 4.6, 'F');
        P.fuente(7.2, true); doc.setTextColor(255, 255, 255); doc.text(tx(P.C.franja), W/2, 3.85, {align:'center'});
      }
    }
    doc.setTextColor(20, 24, 30);
    return { blob:doc.output('blob'), hojas:n };
  };
  return P;
}

/* ── los bloques que comparten los modelos (medir:true → devuelve su alto sin dibujar) ───────── */
/* los datos de la tarea, arriba */
function _ppDatosAts(P, d, medir){
  var hF=6.2, hT=Math.max(hF, Math.min(2, P.parte(d.trabajo||'', P.w-36-2.8, 8, true).length)*P.lh(8)+1.6), alto=hF*3+hT+2.2;
  if(medir) return alto;
  var x=P.M, y=P.y, m=P.w/2, emp=(P.C.emp||{}).razon||'';
  P.par(x, y, 22, m-22, hF, 'EMPRESA', emp); P.par(x+m, y, 30, m-30, hF, 'OBRA / PROYECTO', P.C.obra||''); y+=hF;
  P.celda(x, y, 36, hT, P.tx('TRABAJO A REALIZAR'), {f:_PP_AZUL, b:true, pt:7}); P.celda(x+36, y, P.w-36, hT, d.trabajo||'', {b:true, pt:8, max:2}); y+=hT;
  P.par(x, y, 22, m-22, hF, 'ÁREA', d.area||''); P.par(x+m, y, 30, m-30, hF, 'UBICACIÓN', d.ubic||''); y+=hF;
  var t3=P.w/3;
  P.par(x, y, 22, t3-22, hF, 'FECHA', d.fecha ? fechaLarga(d.fecha) : ''); P.par(x+t3, y, 30, t3-30, hF, 'HORA DE INICIO', d.hora||'');
  P.celda(x+t3*2, y, 18, hF, P.tx('TURNO'), {f:_PP_AZUL, b:true, pt:7});
  var xt=x+t3*2+18, wt=(t3-18)/2;
  P.celda(xt, y, wt, hF, 'Día', {pt:7.4, b:true, al:'c', f:d.turno==='dia' ? _PP_AMAR : null}); P.celda(xt+wt, y, wt, hF, 'Noche', {pt:7.4, b:true, al:'c', f:d.turno==='noche' ? _PP_AMAR : null});
  P.y=y+hF+2.2; return alto;
}
/* lo que aplica de cada lista (lo marcado con A); sin nada marcado queda el renglón para escribirlo */
function _ppListaA(d, campo, lista){ var m=d[campo]||{}, si=[], no=0; lista.forEach(function(et, i){ if(m[i]==='A') si.push(et); else if(m[i]==='NA') no++; }); return { si:si, todoNA:!si.length && no>0 }; }
function _ppProt(P, d, medir){
  var G=[['req', 'REQUISITOS', PAPD.req], ['epp', 'EQUIPO DE PROTECCIÓN PERSONAL', PAPD.epp], ['epc', 'PROTECCIÓN COLECTIVA', PAPD.epc], ['perm', 'PERMISOS DE TRABAJO', PAPD.perm]];
  var wR=50, F=G.map(function(g){
    var L=_ppListaA(d, g[0], g[2]), t=L.si.length ? L.si.join('  ·  ') : (L.todoNA ? 'No aplica' : '');
    return { r:g[1], t:t, h:Math.max(g[0]==='epp' ? 9.4 : 6.2, P.alto(t, P.w-wR-2.8, 7.6, true)+1.8) };
  });
  var alto=5+F.reduce(function(s, f){ return s+f.h; }, 0)+2.2;
  if(medir) return alto;
  P.titulo('PARA ESTA TAREA SE NECESITA', 'lo que aplica; lo demás no va');
  F.forEach(function(f){ P.celda(P.M, P.y, wR, f.h, P.tx(f.r), {f:_PP_GRIS, b:true, pt:6.8}); P.celda(P.M+wR, P.y, P.w-wR, f.h, f.t, {b:true, pt:7.6}); P.y+=f.h; });
  P.y+=2.2; return alto;
}
/* la cuadrilla: nombre, documento y firma; en «cols» columnas, con renglones de sobra para el que se suma */
function _ppCuadrilla(P, d, cols, minimo, medir, titulo){
  var g=d.gente||[], n=Math.max(minimo||6, g.length), filas=Math.ceil(n/cols), hF=8.4, alto=5+4.6+filas*hF+2.2;
  if(medir) return alto;
  P.titulo(titulo||'LA CUADRILLA', 'conozco los peligros, los riesgos y los controles de esta tarea, y firmo en señal de conformidad');
  var wC=P.w/cols, a=[7, 0, 21, 0], y0=P.y; a[3]=Math.min(36, (wC-28)*0.44); a[1]=wC-28-a[3];
  for(var c=0;c<cols;c++){
    var x=P.M+c*wC, xx=x;
    ['N.º', 'Apellidos y nombres', 'Documento', 'Firma'].forEach(function(t, i){ P.celda(xx, y0, a[i], 4.6, P.tx(t), {f:_PP_GRIS, b:true, pt:6.6, al:'c'}); xx+=a[i]; });
    for(var i=0;i<filas;i++){
      var k=c*filas+i, p=g[k]||{}, y=y0+4.6+i*hF; xx=x;
      P.celda(xx, y, a[0], hF, String(k+1), {pt:6.6, al:'c', c:_PP_TENUE}); xx+=a[0];
      P.celda(xx, y, a[1], hF, p.n||'', {b:true, pt:7.6, max:2}); xx+=a[1];
      P.celda(xx, y, a[2], hF, p.d||'', {pt:7.2, al:'c', max:1}); xx+=a[2];
      P.caja(xx, y, a[3], hF); if(p.tr && typeof PAP_APP==='object') try{ PAP_APP.firma(P.doc, p.tr, xx+0.8, y+0.5, a[3]-1.6, hF-1); }catch(e){}
    }
  }
  P.y=y0+4.6+filas*hF+2.2; return alto;
}
/* los tres que responden por el ATS: nombre y firma (la del V°B° digital, si la hay, con su hora) */
function _ppResponsables(P, d, medir){
  var hT=4.6, hF=13, hN=5.4, alto=hT+hF+hN+2.2;
  if(medir) return alto;
  var R=d.resp||{}, vb=d.vb||{}, w=P.w/3, y=P.y;
  [['cap', 'RESPONSABLE DEL TRABAJO (CAPATAZ)'], ['ing', 'SUPERVISOR / INGENIERO'], ['sst', 'SEGURIDAD (V°B° SST)']].forEach(function(q, i){
    var x=P.M+i*w, f=vb[q[0]], nom=(f && f.n) || R[q[0]] || '';
    P.celda(x, y, w, hT, P.tx(q[1]), {f:_PP_AZUL, b:true, pt:6.6, al:'c'});
    P.caja(x, y+hT, w, hF);
    if(f && f.tr && typeof PAP_APP==='object'){ try{ PAP_APP.firma(P.doc, f.tr, x+3, y+hT+0.8, w-6, hF-1.6); }catch(e){} }
    else P.txt('Firma', x+1.4, y+hT+hF-3.6, w-2.8, {pt:5.8, c:[170, 176, 182]});
    P.celda(x, y+hT+hF, w, hN, nom ? nom+((f && f.t) ? '  ·  '+cuando(f.t) : '') : 'Nombre:', {pt:nom ? 7.2 : 6.4, b:!!nom, c:nom ? null : _PP_TENUE, max:1});
  });
  P.y=y+hT+hF+hN+2.2; return alto;
}
/* A, M o B: la letra grande si ya se calificó; si no, los tres casilleros para marcar a mano */
function _ppNivel(P, x, y, w, hh, v){
  P.caja(x, y, w, hh);
  var N=(v && PAPD.niv[v]) ? PAPD.niv[v] : null;
  if(N){
    P.txt(v, x, y+Math.max(0.4, (hh-6.4)/2), w, {pt:10.5, b:true, al:'c'});
    P.txt(N.t, x, y+Math.max(0.4, (hh-6.4)/2)+4.2, w, {pt:5, b:true, al:'c'});
    return;
  }
  var l=Math.min(4.2, (w-2.4)/3-0.6), sep=(w-l*3)/4, yy=y+(hh-l)/2;
  ['A', 'M', 'B'].forEach(function(k, i){ var xx=x+sep+i*(l+sep); P.casilla(xx, yy, l, false); P.txt(k, xx, yy, l, {pt:6.2, al:'c', alto:l, c:[150, 158, 166]}); });
}

/* ── la tabla de peligros de un ATS: una fila por peligro; el paso, en una celda alta por grupo ──
   cols: lo que va después de «N.º» y «Paso»: [{ t, w, alto(f, w) → mm, pinta(f, x, y, w, h) }]. */
function _ppTablaAts(P, d, wN, wA, cols, despues){
  var M=P.M, hCab=6.4, hMin=6.6, hBl=7.2, filas=[];
  (d.acts||[]).forEach(function(a, ia){
    var fs=(a.filas||[]).length ? a.filas : [{}];
    fs.forEach(function(f){ filas.push({ ia:ia, a:a.a||'', f:f, h:0 }); });
  });
  filas.forEach(function(q){
    var hh=hMin; cols.forEach(function(c){ hh=Math.max(hh, c.alto(q.f, c.w)+1.8); }); q.h=hh;
  });
  /* el nombre del paso tiene que caber en lo alto de su grupo */
  var i0=0;
  while(i0<filas.length){
    var i1=i0, s=0; while(i1<filas.length && filas[i1].ia===filas[i0].ia){ s+=filas[i1].h; i1++; }
    var pide=P.alto(filas[i0].a, wA-2.8, 8, true)+1.8; if(pide>s) filas[i1-1].h+=pide-s;
    i0=i1;
  }
  /* lo que sobra de la primera hoja se llena de renglones en blanco (como el formato de papel); en blanco, toda */
  var usado=filas.reduce(function(s, q){ return s+q.h; }, 0), libre=P.fondo-P.y-hCab-usado-(despues||0)-2.4, nb=0;
  if(libre>=hBl){ nb=Math.floor(libre/hBl); if(!P.C.blanco) nb=Math.min(nb, filas.length ? 10 : 14); if(nb) hBl=P.C.blanco ? libre/nb : hBl; }
  else if(!filas.length) nb=6;
  /* en blanco, con pocos renglones no sirve: la tabla se queda con la hoja entera y lo demás pasa a la siguiente */
  if(P.C.blanco && !filas.length && nb<8){ libre=P.fondo-P.y-hCab-2.4; hBl=7.2; nb=Math.max(6, Math.floor(libre/hBl)); hBl=libre/nb; }
  for(var b=0;b<nb;b++) filas.push({ ia:-1-b, a:'', f:{}, h:hBl, bl:true });
  function cab(){
    var x=M;
    P.celda(x, P.y, wN, hCab, 'N.º', {f:_PP_AZUL, b:true, pt:6.8, al:'c'}); x+=wN;
    P.celda(x, P.y, wA, hCab, P.tx('PASO DE LA TAREA'), {f:_PP_AZUL, b:true, pt:6.8, al:'c'}); x+=wA;
    cols.forEach(function(c){ P.celda(x, P.y, c.w, hCab, P.tx(c.t), {f:_PP_AZUL, b:true, pt:6.8, al:'c'}); x+=c.w; });
    P.y+=hCab;
  }
  cab();
  var i=0, sigue=-9;
  while(i<filas.length){
    /* las que entran en esta hoja */
    var j=i, yy=P.y;
    while(j<filas.length && (yy+filas[j].h<=P.fondo+0.01 || j===i)){ yy+=filas[j].h; j++; }
    var y=P.y;
    for(var k=i;k<j;k++){
      var q=filas[k], x=M+wN+wA;
      cols.forEach(function(c){ P.caja(x, y, c.w, q.h); if(!q.bl) c.pinta(q.f, x, y, c.w, q.h); else if(c.vacia) c.vacia(x, y, c.w, q.h); x+=c.w; });
      y+=q.h;
    }
    /* la celda del paso, una por grupo */
    var g0=i, yg=P.y;
    while(g0<j){
      var g1=g0, hg=0; while(g1<j && filas[g1].ia===filas[g0].ia){ hg+=filas[g1].h; g1++; }
      var Q=filas[g0];
      P.celda(M, yg, wN, hg, Q.bl ? '' : String(Q.ia+1), {pt:7.6, b:true, al:'c'});
      P.celda(M+wN, yg, wA, hg, Q.bl ? '' : Q.a+(Q.ia===sigue ? ' (continúa)' : ''), {pt:8, b:true});
      yg+=hg; g0=g1;
    }
    P.y=y; sigue=(j<filas.length && j>0) ? filas[j-1].ia : -9;
    i=j;
    if(i<filas.length){ P.salto(); cab(); }
  }
  P.y+=2.2;
}
/* celdas de texto corrientes para esa tabla */
function _ppColTexto(P, t, w, k, b){
  return { t:t, w:w, alto:function(f, ww){ return P.alto(f[k]||'', ww-2.8, 8, b!==false); }, pinta:function(f, x, y, ww, hh){ P.txt(f[k]||'', x+1.4, y, ww-2.8, {pt:8, b:b!==false, alto:hh}); } };
}
/* el peligro en negrita y, debajo, su riesgo y su consecuencia */
function _ppColPeligro(P, t, w, conPeligro){
  function partes(f){ var l=[]; if(conPeligro && f.p) l.push([f.p, true]); if(f.r) l.push([(conPeligro ? 'Riesgo: ' : '')+f.r, !conPeligro]); if(f.c) l.push(['Consecuencia: '+f.c, false]); return l; }
  return { t:t, w:w,
    alto:function(f, ww){ return partes(f).reduce(function(s, q){ return s+P.alto(q[0], ww-2.8, q[1] ? 8 : 7.4, q[1]); }, 0)+(partes(f).length>1 ? 0.5*(partes(f).length-1) : 0); },
    pinta:function(f, x, y, ww, hh){
      var L=partes(f), tot=this.alto(f, ww), yy=y+Math.max(0.9, (hh-tot)/2);
      L.forEach(function(q){ yy+=P.txt(q[0], x+1.4, yy, ww-2.8, {pt:q[1] ? 8 : 7.4, b:q[1], c:q[1] ? null : [50, 56, 64]})+0.5; });
    } };
}

/* ── ATS · «Paso a paso» (A4 vertical) ─────────────────────────────────────────────────────── */
function _papAtsPasos(d, C){
  C.rotulo=gesTxt(d.trabajo).slice(0, 70);
  var P=_ppDoc('v', C, 'ANÁLISIS DE TRABAJO SEGURO (ATS)', 'Antes de empezar: cada paso de la tarea, sus peligros y cómo se controlan', 'ats');
  P.cabecera(); _ppDatosAts(P, d);
  var hNota=P.alto('x', P.w, 6.4)*2+1.4;
  var despues=_ppProt(P, d, true)+_ppCuadrilla(P, d, 2, 8, true)+_ppResponsables(P, d, true)+hNota;
  _ppTablaAts(P, d, 8, 44, [_ppColPeligro(P, 'PELIGROS Y RIESGOS', 62, true), _ppColTexto(P, 'MEDIDAS DE CONTROL', P.w-8-44-62, 'm')], despues);
  P.sitio(_ppProt(P, d, true)); _ppProt(P, d);
  P.sitio(_ppCuadrilla(P, d, 2, 8, true)+_ppResponsables(P, d, true)); _ppCuadrilla(P, d, 2, 8); _ppResponsables(P, d);
  if(d.obs){ P.sitio(P.alto('Observaciones: '+d.obs, P.w, 7.4)+1.4); P.y+=P.txt('Observaciones: '+d.obs, P.M, P.y, P.w, {pt:7.4, b:true})+1.4; }
  P.sitio(hNota);
  P.txt('Una fila es un peligro con su riesgo y su control. Si cambian las condiciones del trabajo —el clima, el lugar, la gente o el equipo— la tarea se detiene y este análisis se vuelve a revisar con la cuadrilla.', P.M, P.y, P.w, {pt:6.4, c:_PP_TENUE});
  return P.listo();
}
/* ── ATS · «Con nivel de riesgo» (A4 horizontal) ───────────────────────────────────────────── */
function _papAtsRiesgo(d, C){
  C.rotulo=gesTxt(d.trabajo).slice(0, 70);
  var P=_ppDoc('h', C, 'ANÁLISIS DE TRABAJO SEGURO (ATS)', 'Con el nivel de riesgo de cada peligro, antes y después del control', 'ats');
  P.cabecera(); _ppDatosAts(P, d);
  var hLey=P.lh(6.4)*2+1.6;
  var nivel=function(k, t){ return { t:t, w:17, alto:function(){ return 6.6; }, pinta:function(f, x, y, ww, hh){ _ppNivel(P, x, y, ww, hh, f[k]); }, vacia:function(x, y, ww, hh){ _ppNivel(P, x, y, ww, hh, ''); } }; };
  var wResto=P.w-7-40;
  var cols=[_ppColTexto(P, 'PELIGRO', 44, 'p'), _ppColPeligro(P, 'RIESGO Y CONSECUENCIA', 48, false), nivel('n1', 'NIVEL'), _ppColTexto(P, 'MEDIDAS DE CONTROL', wResto-44-48-17-17-34, 'm'), nivel('n2', 'RESIDUAL'), _ppColTexto(P, 'RESPONSABLE', 34, 'rs', false)];
  var despues=hLey+_ppProt(P, d, true)+_ppCuadrilla(P, d, 3, 9, true)+_ppResponsables(P, d, true);
  _ppTablaAts(P, d, 7, 40, cols, despues);
  P.y-=0.8; P.sitio(hLey);
  P.y+=P.txt('NIVEL DE RIESGO · A: alto · M: medio · B: bajo. Se califica antes del control (nivel) y después de aplicarlo (residual). Con riesgo residual alto la tarea no se inicia: se replantea el control. En «Responsable» va quien se encarga de que ese control esté puesto.', P.M, P.y, P.w, {pt:6.4, c:_PP_TENUE})+1.6;
  P.sitio(_ppProt(P, d, true)); _ppProt(P, d);
  P.sitio(_ppCuadrilla(P, d, 3, 9, true)+_ppResponsables(P, d, true)); _ppCuadrilla(P, d, 3, 9); _ppResponsables(P, d);
  if(d.obs){ P.sitio(P.alto('Observaciones: '+d.obs, P.w, 7.4)+1.4); P.txt('Observaciones: '+d.obs, P.M, P.y, P.w, {pt:7.4, b:true}); }
  return P.listo();
}
/* ── ATS · «Con verificación previa» (A4 vertical) ─────────────────────────────────────────── */
var PAP_ANTES = ['La cuadrilla recibió la charla de inicio y conoce la tarea', 'Se revisó el área: accesos, orden, terreno y clima', 'Las herramientas y los equipos fueron inspeccionados',
  'Todos tienen su EPP completo y en buen estado', 'El área está delimitada y señalizada', 'Los permisos de trabajo de alto riesgo están emitidos',
  'Se sabe qué hacer ante una emergencia y a quién avisar', 'Todos están en condiciones de trabajar (descansados y sin malestar)'];
function _ppSiNo(P, x, y, w, hh, t, ops){
  var l=3.2, wo=ops.length*9.4;
  P.caja(x, y, w, hh);
  P.txt(P.tx(t), x+1.4, y, w-wo-3.6, {pt:7.4, alto:hh, max:2});
  ops.forEach(function(o, i){ var xx=x+w-wo+i*9.4; P.casilla(xx, y+(hh-l)/2, l, false); P.txt(o, xx+l+0.7, y, 5.6, {pt:6.2, alto:hh, c:[60, 66, 74], max:1}); });
}
function _ppAntes(P, medir){
  var hF=6.8, n=Math.ceil(PAP_ANTES.length/2), alto=5+n*hF+2.2;
  if(medir) return alto;
  P.titulo('ANTES DE EMPEZAR, VERIFICAMOS', 'se marca en el frente, con la cuadrilla');
  var w=P.w/2;
  PAP_ANTES.forEach(function(t, i){ _ppSiNo(P, P.M+(i%2)*w, P.y+Math.floor(i/2)*hF, w, hF, (i+1)+'. '+t, ['SÍ', 'NO', 'N.A.']); });
  P.y+=n*hF+2.2; return alto;
}
function _ppCierre(P, medir){
  var hF=6.8, alto=5+hF*2+2.2;
  if(medir) return alto;
  P.titulo('AL TERMINAR LA TAREA');
  var w=P.w/2, y=P.y;
  _ppSiNo(P, P.M, y, w, hF, 'La tarea terminó sin incidentes ni lesiones', ['SÍ', 'NO']); _ppSiNo(P, P.M+w, y, w, hF, 'El área quedó ordenada, limpia y señalizada', ['SÍ', 'NO']);
  P.celda(P.M, y+hF, 34, hF, P.tx('HORA DE TÉRMINO'), {f:_PP_GRIS, b:true, pt:6.8}); P.caja(P.M+34, y+hF, w-34, hF);
  P.celda(P.M+w, y+hF, 46, hF, P.tx('FIRMA DEL RESPONSABLE'), {f:_PP_GRIS, b:true, pt:6.8}); P.caja(P.M+w+46, y+hF, w-46, hF);
  P.y=y+hF*2+2.2; return alto;
}
function _papAtsVerifica(d, C){
  C.rotulo=gesTxt(d.trabajo).slice(0, 70);
  var P=_ppDoc('v', C, 'ANÁLISIS DE TRABAJO SEGURO (ATS)', 'Con la verificación de antes de empezar y el cierre de la tarea', 'ats');
  P.cabecera(); _ppDatosAts(P, d); _ppAntes(P);
  var despues=_ppProt(P, d, true)+_ppCuadrilla(P, d, 2, 8, true)+_ppResponsables(P, d, true)+_ppCierre(P, true);
  _ppTablaAts(P, d, 8, 36, [_ppColTexto(P, 'PELIGRO', 40, 'p'), _ppColPeligro(P, 'RIESGO Y CONSECUENCIA', 44, false), _ppColTexto(P, 'MEDIDAS DE CONTROL', P.w-8-36-40-44, 'm')], despues);
  P.sitio(_ppProt(P, d, true)); _ppProt(P, d);
  P.sitio(_ppCuadrilla(P, d, 2, 8, true)+_ppResponsables(P, d, true)); _ppCuadrilla(P, d, 2, 8); _ppResponsables(P, d);
  P.sitio(_ppCierre(P, true)); _ppCierre(P);
  if(d.obs){ P.sitio(P.alto('Observaciones: '+d.obs, P.w, 7.4)+1.4); P.txt('Observaciones: '+d.obs, P.M, P.y, P.w, {pt:7.4, b:true}); }
  return P.listo();
}

/* ── IPERC continuo · lo común ─────────────────────────────────────────────────────────────── */
function _ppDatosIpc(P, d){
  var hF=6.2, x=P.M, c=P.w/4;
  P.par(x, P.y, 16, c-16, hF, 'FECHA', d.fecha ? fechaLarga(d.fecha) : ''); P.par(x+c, P.y, 14, c-14, hF, 'HORA', d.hora||'');
  P.par(x+c*2, P.y, 24, c*2-24, hF, 'NIVEL / ÁREA', d.nivel||''); P.y+=hF;
  P.par(x, P.y, 16, P.w-16, hF, 'TAREA', d.labor||''); P.y+=hF+2.2;
}
/* los que hacen la tarea: su nombre y su firma van arriba, porque firman al empezar */
function _ppGenteIpc(P, d, cols){
  var g=d.gente||[], n=Math.max(cols*2, g.length), filas=Math.ceil(n/cols), hF=7.6, wC=P.w/cols, y0;
  P.titulo('TRABAJADORES QUE HACEN LA TAREA', 'identificamos los peligros y evaluamos los riesgos antes de empezar');
  y0=P.y;
  for(var c=0;c<cols;c++){
    var x=P.M+c*wC, a=[7, wC-7-Math.min(44, wC*0.34), Math.min(44, wC*0.34)], xx=x;
    ['N.º', 'Nombres y apellidos', 'Firma'].forEach(function(t, i){ P.celda(xx, y0, a[i], 4.6, P.tx(t), {f:_PP_GRIS, b:true, pt:6.6, al:'c'}); xx+=a[i]; });
    for(var i=0;i<filas;i++){
      var k=c*filas+i, p=g[k]||{}, y=y0+4.6+i*hF; xx=x;
      P.celda(xx, y, a[0], hF, String(k+1), {pt:6.6, al:'c', c:_PP_TENUE}); xx+=a[0];
      P.celda(xx, y, a[1], hF, p.nombre||'', {b:true, pt:7.6, max:2}); xx+=a[1];
      P.caja(xx, y, a[2], hF); if(p.firma && typeof PAP_APP==='object') try{ PAP_APP.firma(P.doc, p.firma, xx+0.8, y+0.5, a[2]-1.6, hF-1); }catch(e){}
    }
  }
  P.y=y0+4.6+filas*hF+2.2;
}
function _ppPieIpc(P, d, medir){
  var sec=(d.secuencia||[]).map(gesTxt).filter(Boolean), nS=Math.max(3, sec.length), sups=(d.sup||[]).length ? d.sup : [{}], nU=Math.max(2, sups.length);
  var hS=5+nS*5.4+2.2, hU=5+4.6+nU*9+0.4, alto=hS+hU;
  if(medir) return alto;
  P.titulo('SECUENCIA PARA CONTROLAR EL PELIGRO Y REDUCIR EL RIESGO');
  for(var i=0;i<nS;i++){ P.celda(P.M, P.y, 8, 5.4, String(i+1), {pt:7, al:'c', c:_PP_TENUE}); P.celda(P.M+8, P.y, P.w-8, 5.4, sec[i]||'', {b:true, pt:7.8, max:1}); P.y+=5.4; }
  P.y+=2.2;
  P.titulo('DATOS DE LOS SUPERVISORES');
  var a=[8, 18, P.w*0.26, 0, P.w*0.2], x=P.M; a[3]=P.w-a[0]-a[1]-a[2]-a[4];
  ['N.º', 'HORA', 'NOMBRE DEL SUPERVISOR', 'MEDIDA CORRECTIVA', 'FIRMA'].forEach(function(t, k){ P.celda(x, P.y, a[k], 4.6, P.tx(t), {f:_PP_GRIS, b:true, pt:6.6, al:'c'}); x+=a[k]; });
  P.y+=4.6;
  for(var u=0;u<nU;u++){
    var s=sups[u]||{}; x=P.M;
    [String(u+1), s.hora||'', s.nombre||'', s.medida||'', ''].forEach(function(t, k){
      if(k===4){ P.caja(x, P.y, a[k], 9); if(s.firma && typeof PAP_APP==='object') try{ PAP_APP.firma(P.doc, s.firma, x+1, P.y+0.6, a[k]-2, 7.8); }catch(e){} }
      else P.celda(x, P.y, a[k], 9, t, {b:k>0, pt:k ? 7.6 : 6.6, al:k<2 ? 'c' : '', c:k ? null : _PP_TENUE, max:2});
      x+=a[k];
    });
    P.y+=9;
  }
  return alto;
}
/* la tabla del IPERC continuo: cols [{ t, w, t2 (segundo piso del rótulo), alto(f, w), pinta(f, x, y, w, h), vacia }] */
function _ppTablaIpc(P, d, cols, despues, cab2){
  var hCab=cab2 ? 9.6 : 7.4, hMin=7.4, hBl=7.6, filas=(d.filas||[]).map(function(f){ return { f:f, h:0 }; });
  filas.forEach(function(q){ var hh=hMin; cols.forEach(function(c){ hh=Math.max(hh, c.alto(q.f, c.w)+1.8); }); q.h=hh; });
  var usado=filas.reduce(function(s, q){ return s+q.h; }, 0), libre=P.fondo-P.y-hCab-usado-(despues||0)-2.4, nb=0;
  if(libre>=hBl){ nb=Math.floor(libre/hBl); if(!P.C.blanco) nb=Math.min(nb, 12); if(nb && P.C.blanco) hBl=libre/nb; }
  else if(!filas.length) nb=6;
  for(var b=0;b<nb;b++) filas.push({ f:{}, h:hBl, bl:true });
  function cab(){
    var x=P.M;
    cols.forEach(function(c){
      if(c.grupo!==undefined){
        if(c.grupo){ var wg=0; cols.forEach(function(z){ if(z.grupo!==undefined) wg+=z.w; }); P.celda(x, P.y, wg, 4.6, P.tx(c.grupo), {f:_PP_AZUL, b:true, pt:6.6, al:'c'}); }
        P.celda(x, P.y+4.6, c.w, hCab-4.6, P.tx(c.t), {f:_PP_AZUL, b:true, pt:6.4, al:'c'});
      } else P.celda(x, P.y, c.w, hCab, P.tx(c.t), {f:_PP_AZUL, b:true, pt:6.8, al:'c'});
      x+=c.w;
    });
    P.y+=hCab;
  }
  cab();
  filas.forEach(function(q, i){
    if(!P.cabe(q.h) && i){ P.salto(); cab(); }
    var x=P.M;
    cols.forEach(function(c){ P.caja(x, P.y, c.w, q.h); if(!q.bl) c.pinta(q.f, x, P.y, c.w, q.h); else if(c.vacia) c.vacia(x, P.y, c.w, q.h); x+=c.w; });
    P.y+=q.h;
  });
  P.y+=2.2;
}
function _ppColNivel(P, t, w, k){ return { t:t, w:w, alto:function(){ return 7.4; }, pinta:function(f, x, y, ww, hh){ _ppNivel(P, x, y, ww, hh, f[k]); }, vacia:function(x, y, ww, hh){ _ppNivel(P, x, y, ww, hh, ''); } }; }
/* ── IPERC continuo · «General» (A4 vertical) ──────────────────────────────────────────────── */
function _papIpcGeneral(d, C){
  C.rotulo=gesTxt(d.labor || d.nivel).slice(0, 70);
  var P=_ppDoc('v', C, 'IPERC CONTINUO', 'Identificación de peligros, evaluación de riesgos y control, al inicio de la tarea', 'iperc');
  P.cabecera(); _ppDatosIpc(P, d); _ppGenteIpc(P, d, 2);
  var hLey=P.lh(6.4)+1.8;
  _ppTablaIpc(P, d, [_ppColTexto(P, 'DESCRIPCIÓN DEL PELIGRO', 48, 'p'), _ppColTexto(P, 'RIESGO', 36, 'r'), _ppColNivel(P, 'EVALUACIÓN DEL RIESGO', 19, 'ev'),
    _ppColTexto(P, 'MEDIDAS DE CONTROL A IMPLEMENTAR', P.w-48-36-19-19, 'm'), _ppColNivel(P, 'RIESGO RESIDUAL', 19, 'res')], hLey+_ppPieIpc(P, d, true));
  P.y-=0.8; P.sitio(hLey); P.y+=P.txt('A: alto · M: medio · B: bajo. Primero se evalúa el riesgo tal como está; después de poner el control, lo que queda (riesgo residual).', P.M, P.y, P.w, {pt:6.4, c:_PP_TENUE})+1.8;
  P.sitio(_ppPieIpc(P, d, true)); _ppPieIpc(P, d);
  return P.listo();
}
/* ── IPERC continuo · «Con jerarquía de controles» (A4 horizontal) ─────────────────────────── */
var PAP_JER = [['e', 'E', 'eliminación'], ['s', 'S', 'sustitución'], ['i', 'I', 'control de ingeniería'], ['a', 'A', 'señalización y control administrativo'], ['epp', 'EPP', 'equipo de protección personal']];
function _papIpcJerarquia(d, C){
  C.rotulo=gesTxt(d.labor || d.nivel).slice(0, 70);
  var P=_ppDoc('h', C, 'IPERC CONTINUO', 'Con el tipo de cada control, según la jerarquía de controles', 'iperc');
  P.cabecera(); _ppDatosIpc(P, d); _ppGenteIpc(P, d, 3);
  var hLey=P.lh(6.4)*2+1.8;
  var jer=PAP_JER.map(function(j, n){
    return { t:j[1], w:j[0]==='epp' ? 10 : 9, grupo:n ? '' : 'TIPO DE CONTROL', alto:function(){ return 7.4; },
      pinta:function(f, x, y, ww, hh){ P.casilla(x+(ww-3.4)/2, y+(hh-3.4)/2, 3.4, (f.j||[]).indexOf(j[0])>-1); },
      vacia:function(x, y, ww, hh){ P.casilla(x+(ww-3.4)/2, y+(hh-3.4)/2, 3.4, false); } };
  });
  var wM=P.w-58-40-21-46-19;
  var cols=[_ppColTexto(P, 'DESCRIPCIÓN DEL PELIGRO', 58, 'p'), _ppColTexto(P, 'RIESGO', 40, 'r'), _ppColNivel(P, 'EVALUACIÓN', 21, 'ev')].concat(jer, [_ppColTexto(P, 'MEDIDA DE CONTROL A IMPLEMENTAR', wM, 'm'), _ppColNivel(P, 'RESIDUAL', 19, 'res')]);
  _ppTablaIpc(P, d, cols, hLey+_ppPieIpc(P, d, true), true);
  P.y-=0.8; P.sitio(hLey);
  P.y+=P.txt('TIPO DE CONTROL · '+PAP_JER.map(function(j){ return j[1]+': '+j[2]; }).join(' · ')+'. Se busca primero eliminar el peligro; el equipo de protección personal va al final, cuando lo demás no alcanza. EVALUACIÓN y RESIDUAL · A: alto · M: medio · B: bajo.', P.M, P.y, P.w, {pt:6.4, c:_PP_TENUE})+1.8;
  P.sitio(_ppPieIpc(P, d, true)); _ppPieIpc(P, d);
  return P.listo();
}

/* ══ 3 · LA SECCIÓN «ATS E IPERC»: LO QUE SE LE SUMA ═══════════════════════════════════════════
   La tabla sigue en el index (vistaATS). Aquí: cómo se firma el ATS en la obra (el mismo interruptor de la app), abrir
   un papel para corregirlo y ver el PDF de cualquiera con el modelo que se elija. */
function papVistaExtra(){
  _papCss();
  var c=$('pap-modo'); if(!c) return;
  papCtx(true).then(function(X){
    c=$('pap-modo'); if(!c) return;
    var dig=(X.modo!=='papel');
    c.innerHTML='<div class="pap-modo"><p><b>¿Cómo se firma el ATS en esta obra?</b> '+
      (dig ? 'En el celular: la cuadrilla firma en el teléfono del capataz y cada trabajador ve en su app el ATS del día y si está liberado. El que armes aquí, el capataz lo trae a su celular en ATS · «↻ Traer de la nube». Lo que se imprime sin el V°B° del SSOMA sale con una franja roja.'
           : 'En papel: se imprime y se firma a mano, al pie de la tarea. En su app el trabajador ve los modelos que publiques, para copiarlos bien; el ATS del día que armes aquí es para imprimirlo.')+'</p>'+
      '<div class="seg" id="pap-modo-b" role="tablist" aria-label="Cómo se firma el ATS en esta obra">'+
      [['digital', 'En el celular'], ['papel', 'En papel']].map(function(x){ var on=(x[0]==='papel')!==dig; return '<button type="button" role="tab" aria-selected="'+(on ? 'true' : 'false')+'" class="'+(on ? 'on' : '')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div></div>'+
      /* el formato de la obra: se elige una vez */
      '<div class="pap-modo pap-pref"><p><b>¿Con qué formato salen?</b> El que elijas aquí se propone al armar uno, y con él salen los que llegan de los celulares. En cada hoja se puede elegir otro.</p><div class="pap-pref-s">'+
      [['ats', 'ATS'], ['ipc', 'IPERC continuo']].map(function(x){ var def=papModeloDef(x[0]);
        return '<label for="pap-pref-'+x[0]+'">'+x[1]+' <select id="pap-pref-'+x[0]+'" data-t="'+x[0]+'" data-sin-pais>'+papModelos(x[0]).map(function(m){ return '<option value="'+m.k+'"'+(m.k===def ? ' selected' : '')+'>'+esc(m.n)+'</option>'; }).join('')+'</select></label>'; }).join('')+'</div></div>';
    Array.prototype.forEach.call(c.querySelectorAll('.pap-pref-s select'), function(s){
      s.onchange=function(){
        var tipo=s.getAttribute('data-t'), k=s.value, antes=papModeloDef(tipo), M=papModelo(tipo, k);
        s.disabled=true;
        papPrefPoner(tipo, k).then(function(){ s.disabled=false; toast('Listo: '+(tipo==='ipc' ? 'el IPERC continuo' : 'el ATS')+' de esta obra sale en «'+M.n+'».'); },
                                    function(e){ s.disabled=false; s.value=antes; toast('No se pudo guardar. '+porQueFallo(e)); });
      };
    });
    $('pap-modo-b').onclick=function(ev){
      var b=ev.target.closest('[data-v]'); if(!b) return;
      var m=b.getAttribute('data-v'); if(m===X.modo) return;
      confirmar(m==='papel' ? '¿Pasar esta obra al ATS en papel?' : '¿Pasar esta obra al ATS en el celular?',
        m==='papel' ? 'Tu gente dejará de ver «ATS del día» en su app y verá los modelos que publiques. Lo que imprimas saldrá sin la franja roja, para firmarlo a mano. Se puede volver atrás cuando quieras.'
                    : 'Tu gente verá en su app el ATS del día y si está liberado. Lo que se imprima sin el V°B° del SSOMA saldrá con una franja roja. Se puede volver atrás cuando quieras.',
        { si:'Sí, cambiarlo' }).then(function(si){
          if(!si) return;
          papModoPoner(m).then(function(){ toast(m==='papel' ? 'Listo: en esta obra el ATS se firma en papel.' : 'Listo: en esta obra el ATS se firma en el celular.'); papVistaExtra(); },
                               function(e){ toast('No se pudo cambiar. '+porQueFallo(e)); });
        });
    };
  }, function(){});
}
/* ¿se puede corregir desde la web? Solo mientras nadie haya firmado */
function papAtsEditable(n){
  if(!n || typeof n!=='object') return false;
  if((n.gente||[]).some(function(g){ return g && g.tr; })) return false;
  var vb=n.vb||{}; for(var k in vb) if(vb[k]) return false;
  return true;
}
/* abrir un papel de la lista: el modelo y el IPERC continuo, a corregir; el ATS, si todavía se puede */
function papAbrir(id){
  return traerUna('sst_doc', id, 'id,hoja,nombre,nota,creado').then(function(f){
    if(!f){ toast('Ese papel ya no está.'); return; }
    var n=nota(f.nota);
    if(!n || typeof n!=='object'){ toast('Ese papel no se puede abrir aquí.'); return; }
    if(f.hoja===PAP_HOJA_IPC) return papIpcForm({ id:f.id, texto:String(f.nota||''), d:n });
    if(f.hoja==='ats-modelo') return papAtsForm({ id:f.id, hoja:f.hoja, texto:String(f.nota||''), d:n });
    if(f.hoja==='ats'){
      if(!papAtsEditable(n)){ toast('Este ATS ya tiene firmas: se ve, pero no se corrige desde aquí.'); return abrirATS(f.id); }
      return papAtsForm({ id:f.id, hoja:f.hoja, texto:String(f.nota||''), d:n });
    }
    toast('Ese papel no se puede abrir aquí.');
  }, function(e){ toast('No se pudo abrir: '+porQueFallo(e)); });
}
/* el PDF de un papel que ya existe, con el modelo que se elija */
var PAPV = { tipo:'', d:null, fmt:'', R:null };
function papVerPdfId(id){
  return traerUna('sst_doc', id, 'id,hoja,nombre,nota,creado').then(function(f){
    var n=f ? nota(f.nota) : null;
    if(!n || typeof n!=='object'){ toast('Ese papel ya no está.'); return; }
    if(f.hoja==='ats-modelo') n.modelo=true;
    papVerPdf(f.hoja===PAP_HOJA_IPC ? 'ipc' : 'ats', n);
  }, function(e){ toast('No se pudo abrir: '+porQueFallo(e)); });
}
function papVerPdf(tipo, d){
  _papCss();
  PAPV={ tipo:tipo, d:d, fmt:papModelo(tipo, d.fmt).k, R:null };
  var L=papModelos(tipo);
  abrirHoja(tipo==='ipc' ? (d.labor || d.nivel || 'IPERC continuo') : (d.trabajo || 'ATS'), (tipo==='ipc' ? 'IPERC continuo' : (d.modelo ? 'Modelo de ATS' : 'ATS'))+' · la hoja para imprimir',
    '<div class="campo" style="margin:0 0 12px"><label id="papv-t">Modelo de formato</label><div class="chips" id="papv-fmt" role="radiogroup" aria-labelledby="papv-t">'+
      L.map(function(m){ var on=(m.k===PAPV.fmt); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-k="'+m.k+'">'+esc(m.n)+'</button>'; }).join('')+'</div>'+
      '<p class="ayuda" id="papv-d"></p></div><div class="aviso ojo" id="papv-franja" hidden></div><div class="pdfv" id="papv-prev"></div>',
    '<button type="button" class="bt sec" id="papv-imp" disabled>Imprimir</button><button type="button" class="bt" id="papv-pdf" disabled>Descargar el PDF</button>', {clase:'pdf', sinFoco:true});
  function pinta(){
    var M=papModelo(tipo, PAPV.fmt); $('papv-d').textContent=M.hoja+' · '+M.d;
    $('papv-pdf').disabled=true; $('papv-imp').disabled=true; PAPV.R=null;
    papPrevia($('papv-prev'), tipo, d, { fmt:PAPV.fmt }).then(function(R){
      if(!$('papv-prev') || !R || R.fmt!==PAPV.fmt) return;
      PAPV.R=R; $('papv-pdf').disabled=false; $('papv-imp').disabled=false;
      var f=$('papv-franja'); f.hidden=!R.franja; if(R.franja) f.innerHTML=_papFranjaTexto(d);
    }, function(){});
  }
  $('papv-fmt').onclick=function(ev){
    var b=ev.target.closest('[data-k]'); if(!b || b.getAttribute('data-k')===PAPV.fmt) return;
    PAPV.fmt=b.getAttribute('data-k');
    Array.prototype.forEach.call(this.querySelectorAll('.chip'), function(c){ var on=(c===b); c.className='chip'+(on ? ' on' : ''); c.setAttribute('aria-checked', on ? 'true' : 'false'); });
    pinta();
  };
  $('papv-pdf').onclick=function(){ papBajar(PAPV.R); };
  $('papv-imp').onclick=function(){ papImprimir(PAPV.R); };
  pinta();
}
function _papFranjaTexto(d){
  return d && d.devuelto ? '<b>Sale con la franja roja:</b> este ATS fue devuelto con observación.'
    : '<b>Sale con la franja roja «sin V°B° del SSOMA».</b> En esta obra el ATS se firma en el celular, y este todavía no tiene esa firma. Si tu obra lo firma a mano, cámbialo en «¿Cómo se firma el ATS en esta obra?», arriba de la lista.';
}

/* ══ 4 · ARMAR UN ATS ══════════════════════════════════════════════════════════════════════════
   Los mismos pasos de la app —datos, protección, secuencia, cuadrilla— y uno más: el formato. Guarda la fila que
   guardaría la app; lo que se arma y no se guarda queda de borrador en este navegador (un cierre sin querer no lo tira). */
var PAPA = null;
function _papaLlave(){ return 'sstp_pap_ats_'+((YO.obra||{}).id||''); }
function _papaVacio(modelo){
  return { v:1, id:'ats'+Date.now(), modelo:!!modelo, fecha:modelo ? '' : hoyISO(), hora:'', turno:modelo ? '' : 'dia', trabajo:'', area:'', ubic:'', obs:'', codigo:'', rev:'',
           req:{}, epp:{}, epc:{}, perm:{}, acts:[], gente:[], vb:{}, devuelto:null, resp:{ cap:'', ing:'', sst:'' }, fmt:papModeloDef('ats') };
}
/* lo que llega de la nube, a la forma del editor (sin tocar lo que no conoce) */
function _papaDe(n, modelo){
  var d=_papaVacio(modelo), k;
  for(k in n) if(Object.prototype.hasOwnProperty.call(n, k)) d[k]=n[k];
  d.modelo=!!modelo;
  ['req', 'epp', 'epc', 'perm'].forEach(function(g){ d[g]=(d[g] && typeof d[g]==='object' && !Array.isArray(d[g])) ? JSON.parse(JSON.stringify(d[g])) : {}; });
  d.acts=(Array.isArray(n.acts) ? n.acts : []).map(function(a){ return { a:String((a && a.a)||''), filas:((a && a.filas)||[]).map(function(f){ var o={}; for(var q in f) o[q]=f[q]; return o; }) }; });
  d.gente=(Array.isArray(n.gente) ? n.gente : []).map(function(g){ return { n:String((g && g.n)||''), d:String((g && g.d)||''), p:String((g && g.p)||''), tr:(g && g.tr)||null, t:(g && g.t)||0 }; });
  var R=(n.resp && typeof n.resp==='object') ? n.resp : {}, vb=n.vb||{};
  d.resp={ cap:String(R.cap || (vb.cap && vb.cap.n) || ''), ing:String(R.ing || (vb.ing && vb.ing.n) || ''), sst:String(R.sst || (vb.sst && vb.sst.n) || '') };
  d.fmt=papModelo('ats', n.fmt).k;
  return d;
}
function papAtsNuevo(modo){
  _papCss();
  var modelo=(modo==='modelo');
  return papCupo(modelo ? 'ats_modelo' : 'ats').then(function(r){
    if(!r.ok) return papTope(r, modelo ? 'modelos de ATS' : 'ATS');
    var B=leer(_papaLlave(), null);
    if(B && B.d && !!B.d.modelo===modelo && (gesTxt(B.d.trabajo) || (B.d.acts||[]).length)){
      return confirmar('Tienes un '+(modelo ? 'modelo' : 'ATS')+' a medio armar', '«'+(gesTxt(B.d.trabajo)||'sin nombre todavía')+'», de '+(hace(B.t)||'hace un rato')+'. ¿Sigues con ese?', { si:'Seguir con ese', no:'Empezar de cero' })
        .then(function(si){ if(!si) guardar(_papaLlave(), null); return papAtsForm(null, { modo:modo, borrador:si ? B.d : null }); });
    }
    return papAtsForm(null, { modo:modo });
  });
}
function papAtsForm(fila, op){
  _papCss(); _gesCss(); _yaCss();
  op=op||{};
  var modelo=fila ? (fila.hoja==='ats-modelo') : (op.modo==='modelo');
  PAPA={ id:fila ? fila.id : null, hoja:modelo ? 'ats-modelo' : 'ats', texto:fila ? fila.texto : '', nuevo:!fila, modelo:modelo, paso:'datos', guardando:false, R:null, el:null, gente:[], mods:[], X:null, sucio:false,
         d:fila ? _papaDe(fila.d, modelo) : (op.borrador ? _papaDe(op.borrador, modelo) : _papaVacio(modelo)) };
  var yo=PAPA;
  abrirHoja(fila ? (PAPA.d.trabajo || (modelo ? 'Modelo de ATS' : 'ATS')) : (modelo ? 'Armar un modelo de ATS' : 'Armar un ATS'),
    modelo ? 'El de una actividad: se arma una vez y sirve de base para el ATS de cada día' : 'El del día: queda en la lista y se imprime con el formato que elijas',
    '<div class="vacio" id="papa-carga">Trayendo lo de la obra…</div>',
    (fila ? '<button type="button" class="bt mal" id="papa-quitar">Quitar</button>' : '')+'<button type="button" class="bt sec" id="papa-sig" disabled>Siguiente ›</button><button type="button" class="bt" id="papa-ok" disabled>'+(modelo ? 'Guardar el modelo' : (fila ? 'Guardar los cambios' : 'Guardar el ATS'))+'</button>',
    {ancha:true, sinFoco:true});
  if($('papa-quitar')) $('papa-quitar').onclick=_papaQuitar;
  var nada=function(){ return []; };
  return Promise.all([gesGente().catch(nada), papCtx(), fila ? Promise.resolve([]) : traer('sst_doc', '&select=id,nombre,nota,creado&hoja=eq.ats-modelo&order=creado.desc', 200).catch(nada)]).then(function(r){
    if(PAPA!==yo || !$('papa-carga')) return;
    PAPA.gente=r[0]||[]; PAPA.X=r[1];
    var enPapel=_papaEnPapel();
    if(modelo){ if(!fila && enPapel) $('papa-ok').textContent='Guardar y publicar'; }
    else if($('hoja-s')) $('hoja-s').textContent=enPapel ? 'El del día: queda en la lista y se imprime con el formato que elijas, para firmarlo a mano'
                                                         : 'El del día: queda en la lista, el capataz lo trae a su celular para las firmas y se imprime con el formato que elijas';
    PAPA.mods=(r[2]||[]).map(function(f){ var n=nota(f.nota); return (n && typeof n==='object' && Array.isArray(n.acts)) ? { id:f.id, nombre:f.nombre||n.trabajo||'Modelo', n:n } : null; }).filter(Boolean);
    $('hoja-cuerpo').innerHTML='<ol class="pap-pasos" id="papa-pasos"></ol><div id="papa-cuerpo"></div><div class="msg" id="papa-msg" role="status"></div>';
    $('papa-sig').disabled=false; $('papa-ok').disabled=false;
    $('papa-sig').onclick=function(){ var L=_papaPasos(), i=L.indexOf(PAPA.paso); _papaIr(L[Math.min(L.length-1, i+1)]); };
    $('papa-ok').onclick=function(){ _papaGuardar(); };
    $('papa-pasos').onclick=function(ev){ var b=ev.target.closest('[data-p]'); if(b) _papaIr(b.getAttribute('data-p')); };
    var C=$('papa-cuerpo');
    C.addEventListener('input', _papaAlEscribir); C.addEventListener('change', _papaAlEscribir); C.addEventListener('click', _papaAlTocar);
    C.addEventListener('keydown', function(ev){ if(ev.key==='Escape' && $('pap-sug')){ ev.stopPropagation(); _papSugCerrar(); } });
    _papaPinta();
  }, function(e){ if(PAPA===yo && $('papa-carga')) $('papa-carga').textContent='No se pudo abrir. '+porQueFallo(e); });
}
function _papaEnPapel(){ return !!(PAPA && PAPA.X && PAPA.X.modo==='papel'); }
var PAPA_NOM = { datos:'Datos', prot:'Protección', acts:'Secuencia', gente:'Cuadrilla', fmt:'Formato' };
function _papaPasos(){ return PAPA.modelo ? ['datos', 'prot', 'acts', 'fmt'] : ['datos', 'prot', 'acts', 'gente', 'fmt']; }
function _papaFilaLlena(f){ return !!(gesTxt(f.p) && gesTxt(f.r) && gesTxt(f.c) && gesTxt(f.m)); }
function _papaFilaVacia(f){ return !(gesTxt(f.p) || gesTxt(f.r) || gesTxt(f.c) || gesTxt(f.m)); }
/* lo que le falta a un paso (cadena vacía: está completo). Las reglas son las de la app */
function _papaFalta(k){
  var d=PAPA.d;
  if(k==='datos'){
    var f=[];
    if(gesTxt(d.trabajo).length<4) f.push('el trabajo a realizar');
    if(!gesTxt(d.area)) f.push('el área');
    if(!gesTxt(d.ubic)) f.push('la ubicación');
    if(!PAPA.modelo && !/^\d{4}-\d{2}-\d{2}$/.test(String(d.fecha||''))) f.push('la fecha');
    return f.length ? 'Falta '+f.join(', ')+'.' : '';
  }
  if(k==='prot'){ for(var i in d.epp) if(d.epp[i]==='A') return ''; return 'Marca al menos un EPP como que aplica (A). Ninguna tarea se hace sin equipo de protección.'; }
  if(k==='acts'){
    var hay=false, mal='';
    (d.acts||[]).forEach(function(a, ia){
      var llenas=(a.filas||[]).filter(_papaFilaLlena).length, medias=(a.filas||[]).filter(function(x){ return !_papaFilaLlena(x) && !_papaFilaVacia(x); }).length;
      if(llenas && !gesTxt(a.a) && !mal) mal='Al paso '+(ia+1)+' le falta su nombre.';
      if(medias && !mal) mal='En el paso '+(ia+1)+' hay un peligro a medias: cada fila lleva su peligro, su riesgo, su consecuencia y su control.';
      if(llenas && gesTxt(a.a)) hay=true;
    });
    return mal || (hay ? '' : 'Necesitas al menos un paso con un peligro completo: su riesgo, su consecuencia y su control.');
  }
  return '';
}
/* la barra de pasos se arma una vez y después solo cambia de clase: si se rehiciera a cada tecla, el clic que llega
   desde un casillero recién escrito (que al soltarse avisa su cambio) caería sobre un botón que ya no existe */
function _papBarra(id, pasos, nom, actual, listo){
  var c=$(id); if(!c) return;
  var bs=c.querySelectorAll('button[data-p]');
  if(bs.length!==pasos.length || Array.prototype.some.call(bs, function(b, i){ return b.getAttribute('data-p')!==pasos[i]; })){
    c.innerHTML=pasos.map(function(k, i){ return '<li><button type="button" data-p="'+k+'"><b>'+(i+1)+'</b>'+nom[k]+'</button></li>'; }).join('');
    bs=c.querySelectorAll('button[data-p]');
  }
  Array.prototype.forEach.call(bs, function(b, i){
    var k=pasos[i], on=(k===actual), ok=!!listo(k), cl=(on ? 'on' : '')+(ok ? ' ok' : ''), n=b.querySelector('b'), t=(ok && !on) ? '✓' : String(i+1);
    if(b.className!==cl) b.className=cl;
    if(on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    if(n && n.textContent!==t) n.textContent=t;
  });
}
function _papaPintaPasos(){
  if(!PAPA) return;
  _papBarra('papa-pasos', _papaPasos(), PAPA_NOM, PAPA.paso, function(k){
    if(k==='gente') return (PAPA.d.gente||[]).length>0;
    return (k==='fmt') ? false : !_papaFalta(k);
  });
}
function _papaIr(k){
  if(!PAPA || !k) return;
  _papaTomaGente(); PAPA.el=null; _papSugCerrar();
  PAPA.paso=k; _papaPinta();
  try{ $('hoja-cuerpo').scrollTop=0; }catch(e){}
}
function _papaTomaGente(){
  if(PAPA && PAPA.el){
    var ya={}; (PAPA.d.gente||[]).forEach(function(g){ ya[nrm(g.n)+'|'+g.d]=g; });
    PAPA.d.gente=PAPA.el.elegidos().map(function(g){ var v=ya[nrm(g.n)+'|'+g.d]; return { n:g.n, d:g.d, p:g.p||'', tr:(v && v.tr)||null, t:(v && v.t)||0 }; });
  }
}
function _papaCambio(){
  if(!PAPA) return;
  PAPA.sucio=true; PAPA.R=null;
  if(PAPA.nuevo){ clearTimeout(PAPA._t); PAPA._t=setTimeout(function(){ if(PAPA && PAPA.nuevo) try{ guardar(_papaLlave(), { t:new Date().toISOString(), d:PAPA.d }); }catch(e){} }, 500); }
  _papaPintaPasos();
}
function _papaMsg(t, cl){ var m=$('papa-msg'); if(m){ m.className='msg '+(cl||''); m.textContent=t||''; } }
function _papaPinta(){
  var c=$('papa-cuerpo'); if(!c || !PAPA) return;
  var d=PAPA.d, k=PAPA.paso, h='';
  _papaMsg('');
  if(k==='datos') h=_papaDatos();
  else if(k==='prot') h=_papaProt();
  else if(k==='acts') h=_papaActs();
  else if(k==='gente') h='<p class="ayuda" style="margin:0 0 10px">Marca a los que van a hacer la tarea. Salen con su nombre en la hoja; la firma va en el celular del capataz o a mano, en el papel. Si todavía no se sabe quiénes, déjalo vacío: quedan los renglones en blanco.</p><div id="papa-gente"></div>';
  else h=_papFmtHTML('papa', 'ats', d.fmt);
  c.innerHTML=h;
  $('papa-sig').hidden=(k==='fmt');
  _papaPintaPasos();
  if(k==='gente'){
    PAPA.el=gesElegir($('papa-gente'), { id:'papa-el', gente:PAPA.gente, sel:(d.gente||[]).map(function(g){ return { n:g.n, d:g.d, p:g.p }; }), alCambiar:function(){ _papaTomaGente(); _papaCambio(); } });
  }
  if(k==='datos'){
    if($('papa-turno')) $('papa-turno').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b) return; d.turno=b.getAttribute('data-v'); Array.prototype.forEach.call(this.querySelectorAll('.chip'), function(x){ var on=(x===b); x.className='chip'+(on ? ' on' : ''); x.setAttribute('aria-checked', on ? 'true' : 'false'); }); _papaCambio(); };
    if($('papa-base')) $('papa-base').onchange=_papaPartirDe;
  }
  if(k==='fmt') _papFmtArmar('papa', 'ats', function(){ return _papaPaquete(); }, function(f){ d.fmt=f; _papaCambio(); }, function(){ return _papaGuardar(true); });
}
function _papaDatos(){
  var d=PAPA.d, F=(PAPA.X && PAPA.X.fmt.ats) || {};
  var h='<div class="campo"><label for="papa-trabajo">Trabajo a realizar</label><input id="papa-trabajo" data-c="trabajo" maxlength="120" autocomplete="off" placeholder="Armado de andamio en la fachada norte" value="'+esc(d.trabajo)+'"></div>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="papa-area">Área</label><input id="papa-area" data-c="area" maxlength="80" autocomplete="off" value="'+esc(d.area)+'"></div>'+
      '<div class="campo"><label for="papa-ubic">Ubicación del trabajo</label><input id="papa-ubic" data-c="ubic" maxlength="120" autocomplete="off" placeholder="Eje 4-5, nivel +3.20" value="'+esc(d.ubic)+'"></div></div>';
  if(PAPA.modelo) h='<div class="aviso'+(_papaEnPapel() ? ' ok' : '')+'" id="papa-quien" style="margin:0 0 14px">'+(_papaEnPapel()
      ? 'En esta obra el ATS se firma <b>en papel</b>: tu gente ve este modelo en su app, en «ATS de mi tarea», para copiarlo bien a mano.'
      : 'En esta obra el ATS se firma <b>en el celular</b>: tu gente ve en su app el ATS del día, no los modelos. Este te sirve de base para armar el ATS de cada día y para imprimirlo. Si pasas la obra a «En papel» (arriba de la lista), lo verán en su app.')+'</div>'+h;
  if(!PAPA.modelo){
    h+='<div class="fila-c ya-al"><div class="campo"><label for="papa-fecha">Fecha</label><input type="date" id="papa-fecha" data-c="fecha" value="'+esc(d.fecha)+'"></div>'+
      '<div class="campo"><label for="papa-hora">Hora de inicio <span class="tenue">· o se pone en el frente</span></label><input type="time" id="papa-hora" data-c="hora" value="'+esc(d.hora)+'"></div>'+
      '<div class="campo"><label id="papa-turno-t">Turno</label><div class="chips pap-chips-alto" id="papa-turno" role="radiogroup" aria-labelledby="papa-turno-t">'+
        [['dia', 'Día'], ['noche', 'Noche']].map(function(x){ var on=((d.turno||'dia')===x[0]); return '<button type="button" role="radio" class="chip'+(on ? ' on' : '')+'" aria-checked="'+(on ? 'true' : 'false')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div></div></div>';
  }
  h+='<div class="seccion"><h3>Quiénes responden por el trabajo <span class="tenue" style="font-weight:400">· opcional: salen con su nombre en la hoja</span></h3><div class="fila-c ya-al">'+
    [['cap', 'Responsable del grupo (capataz)'], ['ing', 'Supervisor o ingeniero'], ['sst', 'Seguridad (SST)']].map(function(x){
      return '<div class="campo"><label for="papa-r'+x[0]+'">'+x[1]+'</label><input id="papa-r'+x[0]+'" data-r="'+x[0]+'" maxlength="80" list="papa-gente-dl" autocomplete="off" value="'+esc(d.resp[x[0]]||'')+'"></div>'; }).join('')+
    '</div><datalist id="papa-gente-dl" data-sin-pais>'+PAPA.gente.slice(0, 1500).map(function(t){ return '<option value="'+esc(t.nombre)+'">'+esc(t.puesto||'')+'</option>'; }).join('')+'</datalist></div>'+
    '<div class="campo" style="margin-top:14px"><label for="papa-obs">Observaciones y sugerencias <span class="tenue">· opcional</span></label><textarea id="papa-obs" data-c="obs" rows="2" maxlength="600" placeholder="Lo que la cuadrilla levantó en la charla de inicio: una condición del frente, una herramienta que falta, un cambio de secuencia.">'+esc(d.obs)+'</textarea></div>';
  if(PAPA.nuevo && PAPA.mods.length){
    h+='<div class="campo"><label for="papa-base">Partir de un modelo <span class="tenue">· opcional</span></label><select id="papa-base"><option value="">— no, lo armo desde cero —</option>'+
      PAPA.mods.map(function(m){ return '<option value="'+esc(m.id)+'">'+esc(m.nombre)+'</option>'; }).join('')+'</select><p class="ayuda">Trae la protección y la secuencia del modelo; después le cambias lo que haga falta.</p></div>';
  }
  h+='<p class="ayuda" id="papa-cod" data-sin-pais>'+(F.cod ? 'Código del formato: <b>'+esc(F.cod)+'</b>'+(F.rev ? ' · versión '+esc(F.rev) : '')+'. Es el de tu empresa.' : 'El código del formato sale en blanco: tu empresa todavía no lo configuró.')+' Se cambia en la app, en Ajustes · Códigos de formato.</p>';
  return h;
}
function _papaPartirDe(){
  var id=this.value, m=PAPA.mods.filter(function(x){ return String(x.id)===String(id); })[0], d=PAPA.d;
  if(!m) return;
  var poner=function(){
    var n=m.n;
    ['req', 'epp', 'epc', 'perm'].forEach(function(g){ d[g]=(n[g] && typeof n[g]==='object') ? JSON.parse(JSON.stringify(n[g])) : {}; });
    d.acts=(n.acts||[]).map(function(a){ return { a:String(a.a||''), filas:(a.filas||[]).map(function(f){ var o={}; for(var q in f) o[q]=f[q]; return o; }) }; });
    if(!gesTxt(d.trabajo)) d.trabajo=String(n.trabajo||'');
    if(!gesTxt(d.area)) d.area=String(n.area||'');
    if(!gesTxt(d.ubic)) d.ubic=String(n.ubic||'');
    _papaCambio(); _papaPinta();
    var np=0; d.acts.forEach(function(a){ np+=a.filas.length; });
    _papaMsg('Traído del modelo «'+m.nombre+'»: '+gesPlural(d.acts.length, 'paso', 'pasos')+' y '+gesPlural(np, 'peligro', 'peligros')+'. Revísalo en «Protección» y «Secuencia».', 'ok');
  };
  if((d.acts||[]).length) confirmar('¿Cambiar lo que ya armaste por el modelo?', 'La secuencia y la protección que llevas se reemplazan por las de «'+m.nombre+'».', { si:'Sí, traer el modelo' }).then(function(si){ if(si) poner(); else $('papa-base').value=''; });
  else poner();
}
var PAPA_GRUPOS = [['req', 'Requisitos para ejecutar el trabajo'], ['epp', 'Equipo de protección personal'], ['epc', 'Equipo de protección colectiva'], ['perm', 'Permisos adicionales']];
function _papaProt(){
  var d=PAPA.d;
  return '<p class="ayuda" style="margin:0 0 4px">Marca lo que <b>aplica (A)</b> y lo que <b>no aplica (NA)</b>. Lo que quede sin marcar sale en blanco, para tacharlo a mano.</p>'+
    PAPA_GRUPOS.map(function(g){
      var n=0; for(var k in d[g[0]]) if(d[g[0]][k]==='A') n++;
      return '<div class="seccion"><h3>'+esc(g[1])+' <span class="tenue" style="font-weight:400" data-cuenta="'+g[0]+'">'+(n ? '· '+(n===1 ? '1 aplica' : n+' aplican') : '')+'</span></h3><div class="pap-marcas" data-sin-pais>'+
        PAPD[g[0]].map(function(et, i){
          var v=d[g[0]][i];
          return '<div class="pap-m"><span>'+esc(et)+'</span><button type="button" class="'+(v==='A' ? 'a' : '')+'" data-g="'+g[0]+'" data-i="'+i+'" data-v="A" aria-pressed="'+(v==='A' ? 'true' : 'false')+'" aria-label="'+esc(et)+': aplica">A</button>'+
            '<button type="button" class="'+(v==='NA' ? 'na' : '')+'" data-g="'+g[0]+'" data-i="'+i+'" data-v="NA" aria-pressed="'+(v==='NA' ? 'true' : 'false')+'" aria-label="'+esc(et)+': no aplica">NA</button></div>';
        }).join('')+'</div></div>';
    }).join('');
}
function _papaActs(){
  var d=PAPA.d, conNivel=(d.fmt==='riesgo');
  var h='<p class="ayuda" style="margin:0 0 12px">Primero la <b>secuencia del trabajo</b>: los pasos, en el orden en que se hacen. En cada paso, sus peligros, uno por fila: <b>una fila = un peligro</b> con su riesgo, su consecuencia y su control. Al escribir el peligro se ofrecen los de la matriz, con su riesgo y su consecuencia.</p>';
  h+='<div id="papa-acts">'+(d.acts||[]).map(function(a, ia){ return _papaActHTML(a, ia, conNivel); }).join('')+'</div>';
  if(!(d.acts||[]).length) h+='<div class="vacio" id="papa-sin"><b>Todavía no hay pasos</b>Agrega el primero —«Traslado del material», «Armado de cuerpos», «Retiro»— o trae una actividad ya desglosada.</div>';
  h+='<div class="acciones" style="justify-content:flex-start;margin:4px 0 0"><button type="button" class="bt chico" id="papa-mas-paso" data-que="paso">＋ Agregar un paso</button>'+
    '<select id="papa-bib" aria-label="Traer una actividad de la biblioteca" style="width:auto;max-width:100%"><option value="">Traer una actividad de la biblioteca…</option>'+
    PAPD.bib.map(function(b, i){ return '<option value="'+i+'">'+esc(b.a)+' · '+gesPlural(b.f.length, 'peligro', 'peligros')+'</option>'; }).join('')+'</select></div>';
  if(!conNivel) h+='<p class="ayuda" style="margin:12px 0 0">El modelo «Con nivel de riesgo» (en «Formato») suma a cada peligro su nivel antes y después del control.</p>';
  return h;
}
function _papaActHTML(a, ia, conNivel){
  var h='<section class="pap-act" data-a="'+ia+'"><div class="pap-act-cab"><b>'+(ia+1)+'</b><input data-an="'+ia+'" maxlength="90" autocomplete="off" placeholder="Paso del trabajo: «Armado de cuerpos»" aria-label="Nombre del paso '+(ia+1)+'" value="'+esc(a.a)+'">'+
    (ia>0 ? '<button type="button" class="bt-link" data-que="sube" data-a="'+ia+'" aria-label="Subir el paso '+(ia+1)+'">↑ subir</button>' : '')+
    '<button type="button" class="bt-link" data-que="quita-paso" data-a="'+ia+'">Quitar el paso</button></div><div class="pap-filas">';
  if((a.filas||[]).length) h+='<div class="pap-fila-cab" aria-hidden="true"><span>Peligro</span><span>Riesgo</span><span>Consecuencia</span><span>Control</span><span></span></div>';
  (a.filas||[]).forEach(function(f, j){
    h+='<div class="pap-fila" data-a="'+ia+'" data-f="'+j+'">'+
      [['p', 'Peligro', 120, 'Andamio sin baranda en el lado de la fachada'], ['r', 'Riesgo', 120, 'Caída a distinto nivel'], ['c', 'Consecuencia', 120, 'Fracturas, muerte'], ['m', 'Control', 220, 'Arnés con doble línea de vida anclado a un punto certificado']].map(function(q){
        return '<span class="pap-et" aria-hidden="true">'+q[1]+'</span><textarea data-k="'+q[0]+'" maxlength="'+q[2]+'" placeholder="'+esc(j===0 ? q[3] : q[1])+'" aria-label="'+q[1]+' · paso '+(ia+1)+', fila '+(j+1)+'"'+(q[0]==='p' ? ' autocomplete="off"' : '')+'>'+esc(f[q[0]]||'')+'</textarea>'; }).join('')+
      '<button type="button" class="pap-x" data-que="quita-fila" data-a="'+ia+'" data-f="'+j+'" aria-label="Quitar este peligro">×</button>'+
      (conNivel ? '<div class="pap-mas"><span>Nivel antes '+_papNivHTML('n1', f.n1)+'</span><span>después '+_papNivHTML('n2', f.n2)+'</span><label>Responsable del control <input type="text" data-k="rs" maxlength="60" autocomplete="off" value="'+esc(f.rs||'')+'"></label></div>' : '')+'</div>';
  });
  h+='<button type="button" class="bt sec chico" data-que="fila" data-a="'+ia+'">＋ Agregar un peligro a este paso</button></div></section>';
  return h;
}
function _papNivHTML(k, v){
  return '<span class="pap-niv" data-nk="'+k+'">'+['A', 'M', 'B'].map(function(x){ return '<button type="button" data-v="'+x+'" class="'+(v===x ? 'on' : '')+'" aria-pressed="'+(v===x ? 'true' : 'false')+'" title="'+esc(PAPD.niv[x].t.charAt(0)+PAPD.niv[x].t.slice(1).toLowerCase())+'">'+x+'</button>'; }).join('')+'</span>';
}
/* lo que se escribe va al estado en el momento */
function _papaAlEscribir(ev){
  if(!PAPA) return;
  var e=ev.target, d=PAPA.d;
  if(e.id==='papa-bib'){ if(ev.type==='change' && e.value!==''){ var b=PAPD.bib[+e.value]; if(b){ d.acts.push({ a:b.a, filas:b.f.map(function(f){ return { p:f.p, r:f.r, c:f.c, m:f.m }; }) }); _papaCambio(); _papaPinta(); _papaMsg('«'+b.a+'» traída con sus '+gesPlural(b.f.length, 'peligro', 'peligros')+'. Quítale lo que no aplique.', 'ok'); } } return; }
  if(e.id==='papa-base') return;
  var c=e.getAttribute('data-c');
  if(c){ d[c]=e.value; _papaCambio(); return; }
  var r=e.getAttribute('data-r');
  if(r){ d.resp[r]=e.value; _papaCambio(); return; }
  var an=e.getAttribute('data-an');
  if(an!==null && d.acts[+an]){ d.acts[+an].a=e.value; _papaCambio(); return; }
  var k=e.getAttribute('data-k'), fila=e.closest('.pap-fila');
  if(k && fila){
    var a=d.acts[+fila.getAttribute('data-a')], f=a && a.filas[+fila.getAttribute('data-f')];
    if(!f) return;
    f[k]=e.value; _papaCambio();
    if(k==='p' && ev.type==='input') _papSugerir(e, function(x){ f.p=x[2]; f.r=x[3]; f.c=x[4]; _papaCambio(); var T=fila.querySelectorAll('textarea'); T[0].value=f.p; T[1].value=f.r; T[2].value=f.c; try{ T[3].focus(); }catch(e2){} });
  }
}
function _papaAlTocar(ev){
  if(!PAPA) return;
  var d=PAPA.d, b=ev.target.closest('button'); if(!b) return;
  /* A / NA */
  var g=b.getAttribute('data-g');
  if(g){
    var i=b.getAttribute('data-i'), v=b.getAttribute('data-v');
    if(d[g][i]===v) delete d[g][i]; else d[g][i]=v;
    Array.prototype.forEach.call(b.parentNode.querySelectorAll('button'), function(x){ var on=(d[g][i]===x.getAttribute('data-v')); x.className=on ? (x.getAttribute('data-v')==='A' ? 'a' : 'na') : ''; x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var n=0; for(var q in d[g]) if(d[g][q]==='A') n++;
    var cu=document.querySelector('#papa-cuerpo [data-cuenta="'+g+'"]'); if(cu) cu.textContent=n ? '· '+(n===1 ? '1 aplica' : n+' aplican') : '';
    _papaCambio(); return;
  }
  /* el nivel de un peligro */
  var niv=b.closest('.pap-niv'), fila=b.closest('.pap-fila');
  if(niv && fila){
    var a0=d.acts[+fila.getAttribute('data-a')], f0=a0 && a0.filas[+fila.getAttribute('data-f')], nk=niv.getAttribute('data-nk'), nv=b.getAttribute('data-v');
    if(!f0) return;
    f0[nk]=(f0[nk]===nv) ? '' : nv;
    Array.prototype.forEach.call(niv.querySelectorAll('button'), function(x){ var on=(f0[nk]===x.getAttribute('data-v')); x.className=on ? 'on' : ''; x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    _papaCambio(); return;
  }
  var que=b.getAttribute('data-que'); if(!que) return;
  var ia=+b.getAttribute('data-a');
  if(que==='paso'){ d.acts.push({ a:'', filas:[{ p:'', r:'', c:'', m:'' }] }); _papaCambio(); _papaPinta(); var ins=document.querySelectorAll('#papa-acts [data-an]'); try{ ins[ins.length-1].focus(); }catch(e){} return; }
  if(que==='fila' && d.acts[ia]){ d.acts[ia].filas.push({ p:'', r:'', c:'', m:'' }); _papaCambio(); _papaPinta(); var t=document.querySelector('#papa-acts .pap-fila[data-a="'+ia+'"][data-f="'+(d.acts[ia].filas.length-1)+'"] textarea'); try{ t.focus(); }catch(e2){} return; }
  if(que==='quita-fila' && d.acts[ia]){ d.acts[ia].filas.splice(+b.getAttribute('data-f'), 1); _papaCambio(); _papaPinta(); return; }
  if(que==='sube' && ia>0){ var x=d.acts.splice(ia, 1)[0]; d.acts.splice(ia-1, 0, x); _papaCambio(); _papaPinta(); return; }
  if(que==='quita-paso' && d.acts[ia]){
    var np=(d.acts[ia].filas||[]).filter(function(z){ return !_papaFilaVacia(z); }).length;
    var quitar=function(){ d.acts.splice(ia, 1); _papaCambio(); _papaPinta(); };
    if(np) confirmar('¿Quitar este paso?', 'Se va'+(np===1 ? ' también su peligro.' : 'n también sus '+np+' peligros.'), { si:'Sí, quitarlo', mal:true }).then(function(si){ if(si) quitar(); }); else quitar();
  }
}
/* ── al escribir un peligro: los de la matriz que calzan (todas las palabras), con su riesgo y su consecuencia ── */
function _papSugCerrar(){ var s=$('pap-sug'); if(s) s.remove(); }
function _papSugerir(campo, alElegir){
  _papSugCerrar();
  var pal=nrm(campo.value).split(' ').filter(function(w){ return w.length>1; });
  if(!pal.length || nrm(campo.value).length<3) return;
  /* primero los que calzan en el nombre del peligro; después, los que calzan por su riesgo o su consecuencia */
  if(!PAPD._n) PAPD._n=PAPD.base.map(function(x){ return [nrm(x[2]), nrm(x[2]+' '+x[3]+' '+x[4])]; });
  var L=[], L2=[], val=nrm(campo.value), visto={};
  for(var i=0;i<PAPD.base.length;i++){
    var N=PAPD._n[i], ok=true, enP=true;
    for(var k=0;k<pal.length;k++){ if(N[1].indexOf(pal[k])<0){ ok=false; break; } if(N[0].indexOf(pal[k])<0) enP=false; }
    if(ok && N[0]!==val && !visto[N[1]]){ visto[N[1]]=1; (enP ? L : L2).push(PAPD.base[i]); }   /* la matriz trae algunos repetidos: una sola vez */
  }
  L=L.concat(L2).slice(0, 8);
  if(!L.length) return;
  var s=document.createElement('div'); s.className='pap-sug'; s.id='pap-sug'; s.setAttribute('role', 'listbox'); s.setAttribute('data-sin-pais', '');
  s.innerHTML='<p>De la matriz de peligros · elige uno y trae su riesgo y su consecuencia</p>'+L.map(function(x, n){ return '<button type="button" role="option" data-n="'+n+'"><b>'+esc(x[2])+'</b><small>'+esc((PAPD.tipos[x[1]]||'')+' · '+x[3])+'</small></button>'; }).join('');
  var caja=campo.closest('.pap-fila') || campo.closest('.pap-ipf') || campo.parentNode;
  caja.appendChild(s);
  s.style.top=(campo.offsetTop+campo.offsetHeight)+'px'; s.style.left=campo.offsetLeft+'px';
  s.addEventListener('mousedown', function(ev){ ev.preventDefault(); });
  s.onclick=function(ev){ var b=ev.target.closest('[data-n]'); if(!b) return; var x=L[+b.getAttribute('data-n')]; _papSugCerrar(); alElegir(x); };
  campo.onblur=function(){ setTimeout(function(){ if(document.activeElement && document.activeElement.closest && document.activeElement.closest('#pap-sug')) return; _papSugCerrar(); }, 180); };
}
/* ── el paso «Formato»: elegir el modelo y ver la hoja (lo usan el ATS y el IPERC continuo) ───
   pref: 'papa' | 'papi' · paquete(): lo que se dibuja · alElegir(k) · guardar(): Promise que termina con todo guardado */
function _papFmtHTML(pref, tipo, fmt){
  var L=papModelos(tipo), act=papModelo(tipo, fmt).k;
  return '<div class="pap-fmt" id="'+pref+'-fmt" role="radiogroup" aria-label="Modelo de formato">'+L.map(function(m){ var on=(m.k===act);
      return '<button type="button" role="radio" aria-checked="'+(on ? 'true' : 'false')+'" class="'+(on ? 'on' : '')+'" data-k="'+m.k+'"><b>'+esc(m.n)+'</b><i>'+esc(m.hoja)+'</i><span>'+esc(m.d)+'</span></button>'; }).join('')+'</div>'+
    '<div class="aviso ojo" id="'+pref+'-franja" hidden></div>'+
    '<div class="acciones" style="justify-content:flex-start;margin:0 0 6px"><button type="button" class="bt chico" id="'+pref+'-pdf">Descargar el PDF</button><button type="button" class="bt sec chico" id="'+pref+'-imp">Imprimir</button></div>'+
    '<p class="ayuda" style="margin:0 0 10px">Al descargar o imprimir se guarda primero, para que quede en la lista.</p>'+
    '<div class="pdfv" id="'+pref+'-prev" aria-label="Vista previa de la hoja"></div>';
}
function _papFmtArmar(pref, tipo, paquete, alElegir, guardarP){
  var E={ R:null, n:0 };
  function pinta(){
    var n=++E.n, d=paquete(); E.R=null;
    papPrevia($(pref+'-prev'), tipo, d, { fmt:d.fmt }).then(function(R){
      if(n!==E.n || !$(pref+'-prev')) return;
      E.R=R; var f=$(pref+'-franja'); if(f){ f.hidden=!R.franja; if(R.franja) f.innerHTML=_papFranjaTexto(d); }
    }, function(){});
  }
  $(pref+'-fmt').onclick=function(ev){
    var b=ev.target.closest('[data-k]'); if(!b) return;
    Array.prototype.forEach.call(this.querySelectorAll('button'), function(x){ var on=(x===b); x.className=on ? 'on' : ''; x.setAttribute('aria-checked', on ? 'true' : 'false'); });
    alElegir(b.getAttribute('data-k')); pinta();
  };
  function sacar(como){
    return function(){
      var bt=this; bt.disabled=true;
      guardarP().then(function(ok){
        bt.disabled=false; if(!ok) return;
        var d=paquete();
        return papPdfDe(tipo, d, { fmt:d.fmt }).then(function(R){ if(como==='imp') papImprimir(R); else papBajar(R); });
      }, function(){ bt.disabled=false; });
    };
  }
  $(pref+'-pdf').onclick=sacar('pdf'); $(pref+'-imp').onclick=sacar('imp');
  pinta();
}
/* ── guardar ── */
function _papaPaquete(){
  var d=PAPA.d, o={}, k;
  for(k in d) if(Object.prototype.hasOwnProperty.call(d, k)) o[k]=d[k];
  o.v=1; o.trabajo=gesTxt(d.trabajo).slice(0, 120); o.area=gesTxt(d.area).slice(0, 80); o.ubic=gesTxt(d.ubic).slice(0, 120); o.obs=String(d.obs||'').trim().slice(0, 600);
  o.fecha=PAPA.modelo ? '' : String(d.fecha||''); o.hora=PAPA.modelo ? '' : String(d.hora||''); o.turno=PAPA.modelo ? '' : (d.turno==='noche' ? 'noche' : 'dia');
  o.acts=(d.acts||[]).map(function(a){
    return { a:gesTxt(a.a).slice(0, 90), filas:(a.filas||[]).filter(function(f){ return !_papaFilaVacia(f); }).map(function(f){
      var x={}, q; for(q in f) if(Object.prototype.hasOwnProperty.call(f, q)) x[q]=f[q];
      x.p=gesTxt(f.p).slice(0, 120); x.r=gesTxt(f.r).slice(0, 120); x.c=gesTxt(f.c).slice(0, 120); x.m=gesTxt(f.m).slice(0, 220);
      ['n1', 'n2'].forEach(function(n){ if(x[n]!=='A' && x[n]!=='M' && x[n]!=='B') delete x[n]; });
      if(gesTxt(x.rs)) x.rs=gesTxt(x.rs).slice(0, 60); else delete x.rs;
      return x; }) };
  }).filter(function(a){ return a.a || a.filas.length; });
  o.gente=PAPA.modelo ? [] : (d.gente||[]).map(function(g){ return { n:g.n, d:g.d, p:g.p||'', tr:g.tr||null, t:g.t||0 }; });
  o.resp={ cap:gesTxt(d.resp.cap).slice(0, 80), ing:gesTxt(d.resp.ing).slice(0, 80), sst:gesTxt(d.resp.sst).slice(0, 80) };
  o.vb=d.vb||{}; o.devuelto=d.devuelto||null;
  o.fmt=papModelo('ats', d.fmt).k; o.web=1;
  if(PAPA.modelo) o.modelo=true; else delete o.modelo;
  o.estado=atsEstadoDe(o);
  return o;
}
/* → Promise<true> si quedó guardado (false si faltaba algo o no se pudo). sinCerrar: se queda en la hoja (para el PDF) */
function _papaGuardar(sinCerrar){
  if(!PAPA || PAPA.guardando) return Promise.resolve(false);
  _papaTomaGente();
  var falta='', donde='';
  ['datos', 'prot', 'acts'].some(function(k){ var f=_papaFalta(k); if(f){ falta=f; donde=k; return true; } return false; });
  if(falta){
    if(PAPA.paso!==donde){ PAPA.el=null; PAPA.paso=donde; _papaPinta(); }
    _papaMsg('«'+PAPA_NOM[donde]+'»: '+falta, 'mal');
    try{ $('papa-msg').scrollIntoView({ block:'nearest' }); }catch(e){}
    return Promise.resolve(false);
  }
  if(!PAPA.nuevo && !PAPA.sucio){ if(!sinCerrar){ cerrarHoja(); } return Promise.resolve(true); }
  var yo=PAPA, paq=_papaPaquete(), texto=JSON.stringify(paq), nombre=(paq.trabajo||(yo.modelo ? 'Modelo de ATS' : 'ATS')).slice(0, 90), bt=$('papa-ok');
  yo.guardando=true; if(bt) bt.disabled=true; _papaMsg('Guardando…', 'gris');
  var p;
  if(yo.id){
    /* si cambió desde un celular mientras se corregía, no se le escribe encima */
    p=traerUna('sst_doc', yo.id, 'id,hoja,nota').then(function(f){
      if(!f) return Promise.reject({portal:'Este papel ya no está: alguien lo borró.'});
      if(String(f.nota||'')!==String(yo.texto||'')) return Promise.reject({portal:'Cambió desde un celular mientras lo corregías. Ciérralo y vuelve a abrirlo para ver cómo quedó.'});
      return sbPatch('sst_doc?id=eq.'+encodeURIComponent(yo.id), { nombre:nombre, nota:texto });
    }).then(function(rows){ if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede cambiarlo.'}); return yo.id; });
  } else {
    p=papCupo(yo.modelo ? 'ats_modelo' : 'ats').then(function(r){
      if(!r.ok){ papTope(r, yo.modelo ? 'modelos de ATS' : 'ATS'); return Promise.reject({portal:'Llegaste al tope de tu plan.'}); }
      return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:yo.hoja, nombre:nombre, nota:texto });
    }).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede registrar en esta obra.'});
      papSumar(yo.modelo ? 'ats_modelo' : 'ats');
      return (rows && rows[0] && rows[0].id) || null;
    });
  }
  return p.then(function(id){
    yo.guardando=false; if(bt) bt.disabled=false;
    var era=yo.nuevo;
    yo.id=id||yo.id; yo.texto=texto; yo.nuevo=false; yo.sucio=false; yo.d=_papaDe(paq, yo.modelo);
    try{ clearTimeout(yo._t); guardar(_papaLlave(), null); }catch(e){}
    var papel=!!(yo.X && yo.X.modo==='papel');
    toast(yo.modelo ? (era ? (papel ? 'Modelo publicado: tu gente lo ve en su app' : 'Modelo guardado: ya puedes partir de él al armar un ATS') : 'Modelo guardado')
                    : (era ? (papel ? 'ATS guardado: está en la lista, listo para imprimir' : 'ATS guardado. Falta la firma de la cuadrilla, en el celular del capataz') : 'ATS guardado'));
    if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    if(sinCerrar){ if(PAPA===yo){ _papaMsg('Guardado.', 'ok'); if(bt) bt.textContent=yo.modelo ? 'Guardar el modelo' : 'Guardar los cambios'; } }
    else if(PAPA===yo) cerrarHoja();
    return true;
  }, function(e){
    yo.guardando=false; if(bt) bt.disabled=false;
    if(PAPA===yo) _papaMsg('No se pudo guardar. '+porQueFallo(e), 'mal');
    return false;
  });
}
function _papaQuitar(){
  var yo=PAPA; if(!yo || !yo.id) return;
  confirmar(yo.modelo ? '¿Quitar este modelo?' : '¿Quitar este ATS?', '«'+(yo.d.trabajo||'sin nombre')+'». '+(yo.modelo ? ((yo.X && yo.X.modo==='papel') ? 'Tu gente deja de verlo en su app.' : 'Ya no se podrá partir de él al armar un ATS.') : 'Se borra de la lista y deja de verse en la app.'), { si:'Sí, quitarlo', mal:true }).then(function(si){
    if(!si) return;
    sbDelP('sst_doc?id=eq.'+encodeURIComponent(yo.id)).then(function(rows){
      if(Array.isArray(rows) && !rows.length){ toast('No se pudo quitar: esta cuenta no puede borrarlo.'); return; }
      toast(yo.modelo ? 'Modelo quitado.' : 'ATS quitado.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}

/* ══ 5 · EL IPERC CONTINUO ═════════════════════════════════════════════════════════════════════
   Lo llena quien hace la tarea, en el frente y antes de empezar: eso no cambia. Desde la oficina se deja adelantado
   (los peligros y los controles que ya se conocen de esa tarea), se imprime con el formato que se elija y se completa
   y se firma allá. Por eso aquí casi nada es obligatorio: basta la tarea y un peligro con su riesgo y su control. */
var PAPI = null;
function _papiLlave(){ return 'sstp_pap_ipc_'+((YO.obra||{}).id||''); }
function _papiFilaNueva(){ return { p:'', r:'', ev:'', m:'', res:'', j:[] }; }
function _papiVacio(){ return { v:1, k:'ipc', id:'ip'+Date.now().toString(36), fecha:hoyISO(), hora:'', nivel:'', labor:'', gente:[], filas:[_papiFilaNueva()], secuencia:['', '', ''], sup:[], fmt:papModeloDef('ipc') }; }
function _papiDe(n){
  var d=_papiVacio(), k;
  for(k in n) if(Object.prototype.hasOwnProperty.call(n, k)) d[k]=n[k];
  d.gente=(Array.isArray(n.gente) ? n.gente : []).map(function(g){ return { nombre:String((g && g.nombre)||''), dni:String((g && g.dni)||''), firma:(g && g.firma)||null }; }).filter(function(g){ return g.nombre; });
  d.filas=(Array.isArray(n.filas) ? n.filas : []).map(function(f){ return { p:String((f && f.p)||''), r:String((f && f.r)||''), ev:String((f && f.ev)||''), m:String((f && f.m)||''), res:String((f && f.res)||''), j:(f && Array.isArray(f.j)) ? f.j.slice() : [] }; });
  if(!d.filas.length) d.filas=[_papiFilaNueva()];
  d.secuencia=(Array.isArray(n.secuencia) ? n.secuencia.map(function(x){ return String(x||''); }) : []); while(d.secuencia.length<3) d.secuencia.push('');
  d.sup=(Array.isArray(n.sup) ? n.sup : []).map(function(s){ return { hora:String((s && s.hora)||''), nombre:String((s && s.nombre)||''), medida:String((s && s.medida)||''), firma:(s && s.firma)||null }; });
  d.fmt=papModelo('ipc', n.fmt).k;
  return d;
}
function papIpcNuevo(){
  _papCss();
  return papCupo('ats').then(function(r){
    if(!r.ok) return papTope(r, 'ATS e IPERC continuos');
    var B=leer(_papiLlave(), null);
    if(B && B.d && (gesTxt(B.d.labor) || gesTxt(B.d.nivel) || (B.d.filas||[]).some(function(f){ return gesTxt(f.p); }))){
      return confirmar('Tienes un IPERC continuo a medio armar', '«'+(gesTxt(B.d.labor) || gesTxt(B.d.nivel) || 'sin nombre todavía')+'», de '+(hace(B.t)||'hace un rato')+'. ¿Sigues con ese?', { si:'Seguir con ese', no:'Empezar de cero' })
        .then(function(si){ if(!si) guardar(_papiLlave(), null); return papIpcForm(null, { borrador:si ? B.d : null }); });
    }
    return papIpcForm(null);
  });
}
var PAPI_NOM = { cab:'Cabecera', gente:'Quiénes', filas:'Peligros', sup:'Supervisores', fmt:'Formato' }, PAPI_PASOS = ['cab', 'gente', 'filas', 'sup', 'fmt'];
function papIpcForm(fila, op){
  _papCss(); _gesCss(); _yaCss();
  op=op||{};
  PAPI={ id:fila ? fila.id : null, texto:fila ? fila.texto : '', nuevo:!fila, paso:'cab', guardando:false, el:null, gente:[], X:null, sucio:false, d:fila ? _papiDe(fila.d) : (op.borrador ? _papiDe(op.borrador) : _papiVacio()) };
  var yo=PAPI;
  abrirHoja(fila ? (PAPI.d.labor || PAPI.d.nivel || 'IPERC continuo') : 'Armar un IPERC continuo', 'Se deja adelantado aquí, se imprime y se completa y se firma en el frente',
    '<div class="vacio" id="papi-carga">Trayendo lo de la obra…</div>',
    (fila ? '<button type="button" class="bt mal" id="papi-quitar">Quitar</button>' : '')+'<button type="button" class="bt sec" id="papi-sig" disabled>Siguiente ›</button><button type="button" class="bt" id="papi-ok" disabled>'+(fila ? 'Guardar los cambios' : 'Guardar el IPERC')+'</button>',
    {ancha:true, sinFoco:true});
  if($('papi-quitar')) $('papi-quitar').onclick=_papiQuitar;
  return Promise.all([gesGente().catch(function(){ return []; }), papCtx()]).then(function(r){
    if(PAPI!==yo || !$('papi-carga')) return;
    PAPI.gente=r[0]||[]; PAPI.X=r[1];
    $('hoja-cuerpo').innerHTML='<ol class="pap-pasos" id="papi-pasos"></ol><div id="papi-cuerpo"></div><div class="msg" id="papi-msg" role="status"></div>';
    $('papi-sig').disabled=false; $('papi-ok').disabled=false;
    $('papi-sig').onclick=function(){ var i=PAPI_PASOS.indexOf(PAPI.paso); _papiIr(PAPI_PASOS[Math.min(PAPI_PASOS.length-1, i+1)]); };
    $('papi-ok').onclick=function(){ _papiGuardar(); };
    $('papi-pasos').onclick=function(ev){ var b=ev.target.closest('[data-p]'); if(b) _papiIr(b.getAttribute('data-p')); };
    var C=$('papi-cuerpo');
    C.addEventListener('input', _papiAlEscribir); C.addEventListener('change', _papiAlEscribir); C.addEventListener('click', _papiAlTocar);
    C.addEventListener('keydown', function(ev){ if(ev.key==='Escape' && $('pap-sug')){ ev.stopPropagation(); _papSugCerrar(); } });
    _papiPinta();
  }, function(e){ if(PAPI===yo && $('papi-carga')) $('papi-carga').textContent='No se pudo abrir. '+porQueFallo(e); });
}
function _papiFilaVacia(f){ return !(gesTxt(f.p) || gesTxt(f.r) || gesTxt(f.m)); }
function _papiFilaLlena(f){ return !!(gesTxt(f.p) && gesTxt(f.r) && gesTxt(f.m)); }
function _papiFalta(k){
  var d=PAPI.d;
  if(k==='cab'){
    if(!gesTxt(d.labor) && !gesTxt(d.nivel)) return 'Falta la tarea, o el nivel o área donde se hará.';
    if(d.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(String(d.fecha))) return 'Revisa la fecha.';
    return '';
  }
  if(k==='filas'){
    var llenas=0, mal='';
    (d.filas||[]).forEach(function(f, i){
      if(_papiFilaLlena(f)) llenas++;
      else if(!_papiFilaVacia(f) && !mal) mal='Al peligro '+(i+1)+' le falta '+(!gesTxt(f.p) ? 'su descripción' : (!gesTxt(f.r) ? 'el riesgo' : 'la medida de control'))+'.';
    });
    return mal || (llenas ? '' : 'Pon al menos un peligro con su riesgo y su medida de control.');
  }
  return '';
}
function _papiPintaPasos(){
  if(!PAPI) return;
  var d=PAPI.d;
  _papBarra('papi-pasos', PAPI_PASOS, PAPI_NOM, PAPI.paso, function(k){
    return (k==='cab' || k==='filas') ? !_papiFalta(k) : (k==='gente' ? d.gente.length>0 : (k==='sup' ? d.sup.some(function(s){ return gesTxt(s.nombre); }) : false));
  });
}
function _papiTomaGente(){ if(PAPI && PAPI.el) PAPI.d.gente=PAPI.el.elegidos().map(function(g){ return { nombre:g.n, dni:g.d, firma:null }; }); }
function _papiIr(k){
  if(!PAPI || !k) return;
  _papiTomaGente(); PAPI.el=null; _papSugCerrar();
  PAPI.paso=k; _papiPinta();
  try{ $('hoja-cuerpo').scrollTop=0; }catch(e){}
}
function _papiCambio(){
  if(!PAPI) return;
  PAPI.sucio=true;
  if(PAPI.nuevo){ clearTimeout(PAPI._t); PAPI._t=setTimeout(function(){ if(PAPI && PAPI.nuevo) try{ guardar(_papiLlave(), { t:new Date().toISOString(), d:PAPI.d }); }catch(e){} }, 500); }
  _papiPintaPasos();
}
function _papiMsg(t, cl){ var m=$('papi-msg'); if(m){ m.className='msg '+(cl||''); m.textContent=t||''; } }
function _papiPinta(){
  var c=$('papi-cuerpo'); if(!c || !PAPI) return;
  var d=PAPI.d, k=PAPI.paso, h='', mina=(sectorObraP()==='mineria');
  _papiMsg('');
  if(k==='cab'){
    h='<div class="aviso" id="papi-que"><b>El IPERC continuo lo llena quien hace la tarea, en el frente y antes de empezar.</b> Aquí lo dejas adelantado —los peligros y los controles que ya se conocen de esa tarea— y lo imprimes: lo que falte se completa a mano, y se firma allá.</div>'+
      '<div class="campo"><label for="papi-labor">La tarea</label><input id="papi-labor" data-c="labor" maxlength="120" autocomplete="off" placeholder="'+(mina ? 'Sostenimiento con pernos' : 'Picado de muro para pase de tubería')+'" value="'+esc(d.labor)+'"></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="papi-nivel">Nivel / área</label><input id="papi-nivel" data-c="nivel" maxlength="80" autocomplete="off" placeholder="'+(mina ? 'Nv. 1240 · Rampa 820' : 'Sótano 2 · eje C')+'" value="'+esc(d.nivel)+'"></div>'+
        '<div class="campo"><label for="papi-fecha">Fecha <span class="tenue">· o se pone a mano</span></label><input type="date" id="papi-fecha" data-c="fecha" value="'+esc(d.fecha)+'"></div>'+
        '<div class="campo"><label for="papi-hora">Hora <span class="tenue">· la de mirar el frente</span></label><input type="time" id="papi-hora" data-c="hora" value="'+esc(d.hora)+'"></div></div>';
  } else if(k==='gente'){
    h='<p class="ayuda" style="margin:0 0 10px">Quiénes van a hacer la tarea. Su nombre va arriba en la hoja, junto a la fecha y la hora: firman al empezar. Si todavía no se sabe quiénes, déjalo vacío: quedan los renglones en blanco.</p><div id="papi-gente"></div>';
  } else if(k==='filas'){
    h=_papiFilas();
  } else if(k==='sup'){
    h='<p class="ayuda" style="margin:0 0 12px">El supervisor anota en el frente la <b>medida correctiva</b> que dio y la hora, y firma. Aquí puedes dejar su nombre puesto; lo demás, a mano.</p><div id="papi-sup">'+
      d.sup.map(function(s, i){
        return '<div class="pap-ipf" data-u="'+i+'"><button type="button" class="pap-x" data-que="quita-sup" data-u="'+i+'" aria-label="Quitar este supervisor">×</button>'+
          '<div class="pap-sup-g"><div class="campo"><label>Nombre del supervisor</label><input data-us="nombre" maxlength="80" list="papi-gente-dl" autocomplete="off" value="'+esc(s.nombre)+'"></div>'+
          '<div class="campo"><label>Hora</label><input type="time" data-us="hora" value="'+esc(s.hora)+'"></div></div>'+
          '<div class="campo" style="margin:8px 0 0"><label>Medida correctiva <span class="tenue" style="text-transform:none;letter-spacing:0">· opcional</span></label><textarea data-us="medida" rows="2" maxlength="300" placeholder="Se ordenó humedecer el muro antes de cada tramo">'+esc(s.medida)+'</textarea></div></div>';
      }).join('')+'</div><datalist id="papi-gente-dl" data-sin-pais>'+PAPI.gente.slice(0, 1500).map(function(t){ return '<option value="'+esc(t.nombre)+'">'+esc(t.puesto||'')+'</option>'; }).join('')+'</datalist>'+
      '<button type="button" class="bt sec chico" data-que="sup">＋ Agregar un supervisor</button>';
  } else h=_papFmtHTML('papi', 'ipc', d.fmt);
  c.innerHTML=h;
  $('papi-sig').hidden=(k==='fmt');
  _papiPintaPasos();
  if(k==='gente') PAPI.el=gesElegir($('papi-gente'), { id:'papi-el', gente:PAPI.gente, sel:d.gente.map(function(g){ return { n:g.nombre, d:g.dni }; }), alCambiar:function(){ _papiTomaGente(); _papiCambio(); } });
  if(k==='fmt') _papFmtArmar('papi', 'ipc', function(){ return _papiPaquete(); }, function(f){ d.fmt=f; _papiCambio(); }, function(){ return _papiGuardar(true); });
}
function _papiFilas(){
  var d=PAPI.d, jer=(d.fmt==='jerarquia'), pe=(paisObraP()==='pe' && d.fmt==='anexo7');
  var h='<p class="ayuda" style="margin:0 0 12px"><b>Una fila = un peligro</b>: su riesgo, cuánto vale antes del control, qué control se pone y cuánto queda después. La evaluación (alto, medio o bajo) se puede dejar sin marcar: se hace en el frente. Al escribir el peligro se ofrecen los de la matriz.</p><div id="papi-filas">';
  d.filas.forEach(function(f, i){
    h+='<div class="pap-ipf" data-f="'+i+'">'+(d.filas.length>1 ? '<button type="button" class="pap-x" data-que="quita-fila" data-f="'+i+'" aria-label="Quitar este peligro">×</button>' : '')+
      '<div class="pap-ipf-g"><div><label>Descripción del peligro</label><textarea data-k="p" maxlength="160" autocomplete="off" placeholder="'+(i ? '' : 'Polvo de concreto en suspensión')+'" aria-label="Peligro '+(i+1)+'">'+esc(f.p)+'</textarea></div>'+
      '<div><label>Riesgo</label><textarea data-k="r" maxlength="160" placeholder="'+(i ? '' : 'Inhalación de polvo')+'" aria-label="Riesgo '+(i+1)+'">'+esc(f.r)+'</textarea></div>'+
      '<div><label>Medidas de control a implementar</label><textarea data-k="m" maxlength="300" placeholder="'+(i ? '' : 'Humedecer el muro antes y durante el picado; respirador con filtro')+'" aria-label="Control '+(i+1)+'">'+esc(f.m)+'</textarea></div></div>'+
      '<div class="pap-ipf-n"><span>Evaluación del riesgo '+_papNivHTML('ev', f.ev)+'</span><span>Riesgo residual '+_papNivHTML('res', f.res)+'</span>'+
      (jer ? '<span>Tipo de control <span class="pap-jer">'+PAP_JER.map(function(j){ return '<label><input type="checkbox" data-j="'+j[0]+'"'+((f.j||[]).indexOf(j[0])>-1 ? ' checked' : '')+'> '+esc(j[2].charAt(0).toUpperCase()+j[2].slice(1))+'</label>'; }).join('')+'</span></span>' : '')+'</div></div>';
  });
  h+='</div><button type="button" class="bt sec chico" data-que="fila">＋ Otro peligro</button>';
  var altos=d.filas.filter(function(f){ return f.res==='A'; }).length;
  h+='<div class="aviso mal" id="papi-alto" style="margin-top:14px"'+(altos ? '' : ' hidden')+'><b>'+(altos===1 ? 'Un peligro queda' : altos+' peligros quedan')+' en ALTO después del control.</b> '+esc(PAPD.niv.A.d)+(pe ? ' El plazo que le pone el Anexo N.º 7 es de '+esc(PAPD.niv.A.plazo)+'.' : '')+'</div>';
  if(!jer) h+='<p class="ayuda" style="margin:12px 0 0">El modelo «Con jerarquía de controles» (en «Formato») suma a cada control su tipo: eliminación, sustitución, ingeniería, administrativo o EPP.</p>';
  h+='<div class="seccion"><h3>Secuencia para controlar el peligro y reducir el riesgo</h3><p class="ayuda" style="margin:0 0 8px">Los pasos, en orden, para dejar el frente seguro.</p><div class="pap-sec" id="papi-sec">'+
    d.secuencia.map(function(s, i){ return '<div><b>'+(i+1)+'</b><input data-s="'+i+'" maxlength="160" autocomplete="off" aria-label="Paso '+(i+1)+' de la secuencia" value="'+esc(s)+'"></div>'; }).join('')+'</div>'+
    (d.secuencia.length<12 ? '<button type="button" class="bt sec chico" data-que="sec">＋ Otro paso</button>' : '')+'</div>';
  return h;
}
function _papiAlEscribir(ev){
  if(!PAPI) return;
  var e=ev.target, d=PAPI.d, c=e.getAttribute('data-c');
  if(c){ d[c]=e.value; _papiCambio(); return; }
  var s=e.getAttribute('data-s');
  if(s!==null){ d.secuencia[+s]=e.value; _papiCambio(); return; }
  var us=e.getAttribute('data-us'), cu=e.closest('[data-u]');
  if(us && cu && d.sup[+cu.getAttribute('data-u')]){ d.sup[+cu.getAttribute('data-u')][us]=e.value; _papiCambio(); return; }
  var caja=e.closest('.pap-ipf[data-f]'), f=caja && d.filas[+caja.getAttribute('data-f')];
  if(!f) return;
  var j=e.getAttribute('data-j');
  if(j){ f.j=(f.j||[]).filter(function(x){ return x!==j; }); if(e.checked) f.j.push(j); _papiCambio(); return; }
  var k=e.getAttribute('data-k');
  if(k){
    f[k]=e.value; _papiCambio();
    if(k==='p' && ev.type==='input') _papSugerir(e, function(x){ f.p=x[2]; f.r=x[3]; _papiCambio(); var T=caja.querySelectorAll('textarea'); T[0].value=f.p; T[1].value=f.r; try{ T[2].focus(); }catch(e2){} });
  }
}
function _papiAlTocar(ev){
  if(!PAPI) return;
  var d=PAPI.d, b=ev.target.closest('button'); if(!b) return;
  var niv=b.closest('.pap-niv'), caja=b.closest('.pap-ipf[data-f]');
  if(niv && caja){
    var f=d.filas[+caja.getAttribute('data-f')], nk=niv.getAttribute('data-nk'), nv=b.getAttribute('data-v'); if(!f) return;
    f[nk]=(f[nk]===nv) ? '' : nv;
    Array.prototype.forEach.call(niv.querySelectorAll('button'), function(x){ var on=(f[nk]===x.getAttribute('data-v')); x.className=on ? 'on' : ''; x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var altos=d.filas.filter(function(z){ return z.res==='A'; }).length, av=$('papi-alto');
    if(av){ av.hidden=!altos; var bb=av.querySelector('b'); if(bb) bb.textContent=(altos===1 ? 'Un peligro queda' : altos+' peligros quedan')+' en ALTO después del control.'; }
    _papiCambio(); return;
  }
  var que=b.getAttribute('data-que'); if(!que) return;
  if(que==='fila'){ if(d.filas.length>=40) return; d.filas.push(_papiFilaNueva()); _papiCambio(); _papiPinta(); var t=document.querySelector('#papi-filas .pap-ipf[data-f="'+(d.filas.length-1)+'"] textarea'); try{ t.focus(); }catch(e){} return; }
  if(que==='quita-fila'){ d.filas.splice(+b.getAttribute('data-f'), 1); if(!d.filas.length) d.filas.push(_papiFilaNueva()); _papiCambio(); _papiPinta(); return; }
  if(que==='sec'){ if(d.secuencia.length>=12) return; d.secuencia.push(''); _papiCambio(); _papiPinta(); var ins=document.querySelectorAll('#papi-sec input'); try{ ins[ins.length-1].focus(); }catch(e2){} return; }
  if(que==='sup'){ if(d.sup.length>=6) return; d.sup.push({ hora:'', nombre:'', medida:'', firma:null }); _papiCambio(); _papiPinta(); var u=document.querySelectorAll('#papi-sup [data-us="nombre"]'); try{ u[u.length-1].focus(); }catch(e3){} return; }
  if(que==='quita-sup'){ d.sup.splice(+b.getAttribute('data-u'), 1); _papiCambio(); _papiPinta(); return; }
}
function _papiPaquete(){
  var d=PAPI.d, o={}, k;
  for(k in d) if(Object.prototype.hasOwnProperty.call(d, k)) o[k]=d[k];
  o.v=1; o.k='ipc'; o.labor=gesTxt(d.labor).slice(0, 120); o.nivel=gesTxt(d.nivel).slice(0, 80);
  o.fecha=/^\d{4}-\d{2}-\d{2}$/.test(String(d.fecha||'')) ? d.fecha : ''; o.hora=String(d.hora||'');
  o.gente=(d.gente||[]).map(function(g){ return { nombre:g.nombre, dni:g.dni||'', firma:g.firma||null }; });
  o.filas=(d.filas||[]).filter(function(f){ return !_papiFilaVacia(f); }).map(function(f){
    var x={ p:gesTxt(f.p).slice(0, 160), r:gesTxt(f.r).slice(0, 160), ev:/^[AMB]$/.test(f.ev) ? f.ev : '', m:gesTxt(f.m).slice(0, 300), res:/^[AMB]$/.test(f.res) ? f.res : '' };
    var j=(f.j||[]).filter(function(q){ return PAP_JER.some(function(z){ return z[0]===q; }); }); if(j.length) x.j=j;
    return x; });
  o.secuencia=(d.secuencia||[]).map(function(s){ return gesTxt(s).slice(0, 160); }).filter(Boolean);
  o.sup=(d.sup||[]).map(function(s){ return { hora:String(s.hora||''), nombre:gesTxt(s.nombre).slice(0, 80), medida:gesTxt(s.medida).slice(0, 300), firma:s.firma||null }; }).filter(function(s){ return s.nombre || s.medida; });
  o.fmt=papModelo('ipc', d.fmt).k; o.web=1;
  o.por=d.por || gesQuien(); o.cuando=d.cuando || new Date().toISOString();
  return o;
}
function _papiGuardar(sinCerrar){
  if(!PAPI || PAPI.guardando) return Promise.resolve(false);
  _papiTomaGente();
  var falta='', donde='';
  ['cab', 'filas'].some(function(k){ var f=_papiFalta(k); if(f){ falta=f; donde=k; return true; } return false; });
  if(falta){
    if(PAPI.paso!==donde){ PAPI.el=null; PAPI.paso=donde; _papiPinta(); }
    _papiMsg('«'+PAPI_NOM[donde]+'»: '+falta, 'mal');
    try{ $('papi-msg').scrollIntoView({ block:'nearest' }); }catch(e){}
    return Promise.resolve(false);
  }
  if(!PAPI.nuevo && !PAPI.sucio){ if(!sinCerrar) cerrarHoja(); return Promise.resolve(true); }
  var yo=PAPI, paq=_papiPaquete(), texto=JSON.stringify(paq), nombre=('IPERC continuo · '+(paq.labor || paq.nivel)+(paq.fecha ? ' · '+paq.fecha : '')).slice(0, 120), bt=$('papi-ok'), p;
  yo.guardando=true; if(bt) bt.disabled=true; _papiMsg('Guardando…', 'gris');
  if(yo.id){
    p=traerUna('sst_doc', yo.id, 'id,hoja,nota').then(function(f){
      if(!f) return Promise.reject({portal:'Este papel ya no está: alguien lo borró.'});
      if(String(f.nota||'')!==String(yo.texto||'')) return Promise.reject({portal:'Alguien más lo cambió mientras lo corregías. Ciérralo y vuelve a abrirlo para ver cómo quedó.'});
      return sbPatch('sst_doc?id=eq.'+encodeURIComponent(yo.id), { nombre:nombre, nota:texto });
    }).then(function(rows){ if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede cambiarlo.'}); return yo.id; });
  } else {
    p=papCupo('ats').then(function(r){
      if(!r.ok){ papTope(r, 'ATS e IPERC continuos'); return Promise.reject({portal:'Llegaste al tope de tu plan.'}); }
      return sbPostP('sst_doc', { empresa:YO.obra.id, hoja:PAP_HOJA_IPC, nombre:nombre, nota:texto });
    }).then(function(rows){
      if(Array.isArray(rows) && !rows.length) return Promise.reject({portal:'No se guardó: esta cuenta no puede registrar en esta obra.'});
      papSumar('ats');
      return (rows && rows[0] && rows[0].id) || null;
    });
  }
  return p.then(function(id){
    yo.guardando=false; if(bt) bt.disabled=false;
    var era=yo.nuevo;
    yo.id=id||yo.id; yo.texto=texto; yo.nuevo=false; yo.sucio=false; yo.d=_papiDe(paq);
    try{ clearTimeout(yo._t); guardar(_papiLlave(), null); }catch(e){}
    toast(era ? 'IPERC continuo guardado: está en la lista, listo para imprimir' : 'IPERC continuo guardado');
    if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    if(sinCerrar){ if(PAPI===yo){ _papiMsg('Guardado.', 'ok'); if(bt) bt.textContent='Guardar los cambios'; } }
    else if(PAPI===yo) cerrarHoja();
    return true;
  }, function(e){
    yo.guardando=false; if(bt) bt.disabled=false;
    if(PAPI===yo) _papiMsg('No se pudo guardar. '+porQueFallo(e), 'mal');
    return false;
  });
}
function _papiQuitar(){
  var yo=PAPI; if(!yo || !yo.id) return;
  confirmar('¿Quitar este IPERC continuo?', '«'+(yo.d.labor || yo.d.nivel || 'sin nombre')+'». Se borra de la lista.', { si:'Sí, quitarlo', mal:true }).then(function(si){
    if(!si) return;
    sbDelP('sst_doc?id=eq.'+encodeURIComponent(yo.id)).then(function(rows){
      if(Array.isArray(rows) && !rows.length){ toast('No se pudo quitar: esta cuenta no puede borrarlo.'); return; }
      toast('IPERC continuo quitado.'); cerrarHoja(); if(typeof VISTA.recargar==='function') VISTA.recargar(true);
    }, function(e){ toast('No se pudo quitar. '+porQueFallo(e)); });
  });
}

/* ══ 6 · LOS FORMATOS EN BLANCO ════════════════════════════════════════════════════════════════
   Cada modelo, vacío, con el nombre, el logo y el código de formato de la empresa: para imprimir y llenar a mano.
   No gastan el cupo del plan. */
var PAPB = { tipo:'ats', fmt:{ ats:'', ipc:'' }, R:null, n:0 };
function papBlancos(tipo){
  _papCss();
  PAPB={ tipo:(tipo==='ipc') ? 'ipc' : 'ats', fmt:{ ats:papModeloDef('ats'), ipc:papModeloDef('ipc') }, R:null, n:0 };
  abrirHoja('Formatos en blanco', 'Con el nombre, el logo y el código de tu empresa: para imprimir y llenar a mano',
    '<div class="seg" id="papb-tipo" role="tablist" aria-label="Qué formato">'+[['ats', 'ATS'], ['ipc', 'IPERC continuo']].map(function(x){ var on=(x[0]===PAPB.tipo); return '<button type="button" role="tab" aria-selected="'+(on ? 'true' : 'false')+'" class="'+(on ? 'on' : '')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div>'+
    '<div id="papb-c"></div>',
    '<button type="button" class="bt sec" id="papb-imp" disabled>Imprimir</button><button type="button" class="bt" id="papb-pdf" disabled>Descargar el PDF</button>', {ancha:true, sinFoco:true});
  function previa(){
    var n=++PAPB.n, t=PAPB.tipo; PAPB.R=null; $('papb-pdf').disabled=true; $('papb-imp').disabled=true;
    papPrevia($('papb-prev'), t, {}, { fmt:PAPB.fmt[t], blanco:true }).then(function(R){
      if(n!==PAPB.n || !$('papb-prev')) return;
      PAPB.R=R; $('papb-pdf').disabled=false; $('papb-imp').disabled=false;
    }, function(){});
  }
  function pinta(){
    var t=PAPB.tipo, L=papModelos(t), act=papModelo(t, PAPB.fmt[t]).k; PAPB.fmt[t]=act;
    $('papb-c').innerHTML='<div class="pap-fmt" id="papb-fmt" role="radiogroup" aria-label="Modelo de formato">'+L.map(function(m){ var on=(m.k===act);
        return '<button type="button" role="radio" aria-checked="'+(on ? 'true' : 'false')+'" class="'+(on ? 'on' : '')+'" data-k="'+m.k+'"><b>'+esc(m.n)+'</b><i>'+esc(m.hoja)+'</i><span>'+esc(m.d)+'</span></button>'; }).join('')+'</div>'+
      '<div class="pdfv" id="papb-prev" aria-label="Vista previa de la hoja"></div>';
    $('papb-fmt').onclick=function(ev){
      var b=ev.target.closest('[data-k]'); if(!b || b.getAttribute('data-k')===PAPB.fmt[PAPB.tipo]) return;
      PAPB.fmt[PAPB.tipo]=b.getAttribute('data-k');
      Array.prototype.forEach.call(this.querySelectorAll('button'), function(x){ var on=(x===b); x.className=on ? 'on' : ''; x.setAttribute('aria-checked', on ? 'true' : 'false'); });
      previa();
    };
    previa();
  }
  $('papb-tipo').onclick=function(ev){
    var b=ev.target.closest('[data-v]'); if(!b || b.getAttribute('data-v')===PAPB.tipo) return;
    PAPB.tipo=b.getAttribute('data-v');
    Array.prototype.forEach.call(this.querySelectorAll('button'), function(x){ var on=(x===b); x.className=on ? 'on' : ''; x.setAttribute('aria-selected', on ? 'true' : 'false'); });
    pinta();
  };
  $('papb-pdf').onclick=function(){ papBajar(PAPB.R); };
  $('papb-imp').onclick=function(){ papImprimir(PAPB.R); };
  pinta();
}
