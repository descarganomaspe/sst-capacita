/* OBRASST · las cuentas de la Torre de control para la web: la de la app, TAL CUAL —sus cuentas y sus metas—, con lo que
   usa de la app (vivo/index.html, entre TORRE-INI y TORRE-FIN). El «Resumen ejecutivo» de la web (portal/torre.js) pinta
   con estas cuentas y pone las funciones _tor… de la web. Lo arma armar.py. No editar. */
var TORRE_APP = (function(){
/* ── de la app · lo que la Torre usa ── */
function esc(t){ /* 26/10/2026 · seguridad: también comillas */ return String(t||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function escA(t){ return esc(t).replace(/"/g,'&quot;'); }
function fechaLarga(iso){
  /* Una fecha que no existe llegaba igual hasta aqui: String(undefined)
     es la palabra «undefined», que es verdadera, pasaba el if y salia
     «undefined/undefined/undefined» en la pantalla del boletin. */
  if(!iso) return '';
  var p=String(iso).split('-');
  if(p.length<3 || !p[0] || !p[1] || !p[2]) return '';
  return p[2]+'/'+p[1]+'/'+p[0];
}
function hoyISO(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
var MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
           'setiembre','octubre','noviembre','diciembre'];
function dosD(n){ return (n<10?'0':'')+n; }
function mesISO(){ var d=new Date(); return d.getFullYear()+'-'+dosD(d.getMonth()+1); }
function mesBonito(iso){
  var p=String(iso||mesISO()).split('-');
  return (MESES[(parseInt(p[1],10)||1)-1]||'')+' '+p[0];
}
var ACC_CLASES=[
  {k:'casi',     n:'Casi accidente',          ic:'⚠️', piso:5, cuenta:false, dias:false,
   d:'Por poco pasa algo. No hubo lesión ni daño, pero pudo haberlo.'},
  /* 12/10/2026 · la pirámide de Bird también cuenta los daños a la propiedad (30 por cada lesión grave). Si además hubo
     un herido, manda la lesión: se elige su clase. */
  {k:'dano',     n:'Daño a la propiedad',     ic:'🔧', piso:4, cuenta:false, dias:false,
   d:'Se dañó un equipo, un material o una instalación, sin heridos. Si alguien se lesionó, elige la clase de la lesión.'},
  {k:'primeros', n:'Primeros auxilios',       ic:'🩹', piso:3, cuenta:false, dias:false,
   d:'Se atendió en obra y siguió trabajando el mismo día.'},
  {k:'leve',     n:'Accidente leve',          ic:'🚑', piso:2, cuenta:false, dias:true,
   d:'Necesitó atención médica y volvió sin descanso, o con descanso del mismo día.'},
  {k:'incap',    n:'Accidente incapacitante', ic:'🏥', piso:1, cuenta:true,  dias:true,
   d:'Con descanso médico. Es el que arma el índice de frecuencia.'},
  {k:'mortal',   n:'Accidente mortal',        ic:'⚫', piso:0, cuenta:true,  dias:true,
   d:'Aviso al MTPE dentro de 24 horas. Descanso de 6000 días por norma.'}
];
function accClase(k){ for(var i=0;i<ACC_CLASES.length;i++) if(ACC_CLASES[i].k===k) return ACC_CLASES[i]; return ACC_CLASES[0]; }
function esAprobado(r){
  /* ojo: _norm() de esta app pasa a MAYUSCULAS (es el normalizador de
     codigos), asi que aqui se baja a minusculas a mano. */
  var t=String(r||'').toLowerCase();
  if(!t) return false;
  if(t.indexOf('desaprob')>-1 || t.indexOf('no aprob')>-1) return false;
  /* ══════ UN TALLER NO SE APRUEBA NI SE DESAPRUEBA ══════════════
     Los talleres se guardan con resultado «completado». Como aqui solo
     se buscaba la palabra «aprobado», «completado» devolvia false y la
     ficha del trabajador pintaba el taller EN ROJO, y al abrirlo decia
     DESAPROBADO con todas sus letras. El trabajador lo hizo entero y la
     app lo trataba de reprobado: no hay peor mentira en un legajo de
     SST. Un taller es participacion, y participar se completa.       */
  if(t.indexOf('complet')>-1 || t.indexOf('particip')>-1) return true;
  return t.indexOf('aprob')>-1;
}
/* INSP_CAT: de cada rubro, solo sus inspecciones mensuales (las que cuenta la Torre) */
var INSP_CAT = {"construccion":{"i":[{"k":"epp-del-personal","n":"Equipos de protección personal","f":"mensual"},{"k":"extintores","n":"Extintores","f":"mensual"},{"k":"tableros-electricos","n":"Tableros eléctricos","f":"mensual"},{"k":"productos-quimicos","n":"Manejo de productos químicos","f":"mensual"},{"k":"botiquin","n":"Botiquín de primeros auxilios","f":"mensual"},{"k":"estacion-de-emergencia","n":"Estación de emergencia","f":"mensual"},{"k":"senalizacion-y-codigo-de-colores","n":"Señalización y código de colores","f":"mensual"},{"k":"herramientas-manuales","n":"Herramientas manuales y eléctricas","f":"mensual"}]},"mineria":{"i":[{"k":"sistema-de-izaje-piques-y-winches","n":"Sistema de izaje, piques y winches","f":"mensual"},{"k":"jaulas-y-baldes-de-izaje","n":"Jaulas y baldes de izaje de personal","f":"mensual"},{"k":"fajas-transportadoras","n":"Fajas transportadoras","f":"mensual"},{"k":"instalaciones-electricas-y-puesta-a-tierra","n":"Instalaciones eléctricas y puesta a tierra","f":"mensual"},{"k":"refugios-mineros-y-salvataje","n":"Refugios mineros y equipos de salvataje","f":"mensual"},{"k":"depositos-de-relaves-y-geotecnia","n":"Depósitos de relaves, pads, pilas de lixiviación y botaderos","f":"mensual"}]},"hidrocarburos":{"i":[{"k":"diques-de-contencion-y-area-de-tanques","n":"Diques de contención y área de tanques","f":"mensual"},{"k":"lineas-tuberias-y-valvulas","n":"Líneas, tuberías, válvulas y bombas","f":"mensual"},{"k":"sistemas-contra-incendio","n":"Sistema contra incendio de agua, espuma y enfriamiento","f":"mensual"},{"k":"extintores-portatiles-y-rodantes","n":"Extintores portátiles y rodantes","f":"mensual"},{"k":"atmosferas-explosivas-y-deteccion-de-gases","n":"Atmósferas explosivas y detección de gases","f":"mensual"},{"k":"surtidores-y-estaciones-de-servicio","n":"Grifos, estaciones de servicio y gasocentros","f":"mensual"},{"k":"plantas-envasadoras-de-glp","n":"Plantas envasadoras de GLP","f":"mensual"}]},"industria":{"i":[{"k":"guardas-de-maquinas","n":"Guardas y resguardos de máquinas","f":"mensual"},{"k":"prensas-y-maquinas-de-accionamiento","n":"Prensas y máquinas de accionamiento","f":"mensual"},{"k":"sistemas-electricos","n":"Sistemas e instalaciones eléctricas","f":"mensual"},{"k":"extintores-y-sistemas-contra-incendio","n":"Extintores y sistemas contra incendio","f":"mensual"},{"k":"sustancias-quimicas-peligrosas","n":"Sustancias químicas peligrosas","f":"mensual"},{"k":"equipos-de-proteccion-personal","n":"Equipos de protección personal","f":"mensual"},{"k":"lineas-de-produccion-orden-y-limpieza","n":"Líneas de producción, orden y limpieza","f":"mensual"},{"k":"comite-sst-y-verificacion-documentaria","n":"Comité de SST y verificación documentaria","f":"mensual"}]}};
function inspeccionesDelMes(sector){
  var cat=INSP_CAT[sector||'construccion']; if(!cat) return [];
  return cat.i.filter(function(t){ return t.f==='mensual'; });
}
var REP_COL_ACTIVIDAD = null;
var REP_SEL_BASE = 'id,clase,descripcion,lugar,foto_url,foto_cierre,accion,cerrado,cerrado_por,anonimo,autor,estado,fecha';
function traerReportes(empId, cola){
  function pedir(conAct){
    return sbGet('sst_reporte?empresa=eq.'+encodeURIComponent(empId)+
                 '&select='+REP_SEL_BASE+(conAct?',actividad':'')+(cola||''));
  }
  if(REP_COL_ACTIVIDAD===false) return pedir(false);
  return pedir(true).then(
    function(r){ REP_COL_ACTIVIDAD=true; return r; },
    function(cod){ if(cod!==400) return Promise.reject(cod); REP_COL_ACTIVIDAD=false; return pedir(false); });
}
/* ── de la app · la Torre ── */
// =================================================================
//  TORRE DE CONTROL SSOMA
//  El tablero del lider. Seis paginas, filtro por proyecto y columna
//  lateral con lo que necesita su decision. Todo lo que sale aqui
//  viene de algo que la app de verdad guarda; cuando un dato no
//  existe se DICE que no existe, no se rellena con un cero bonito.
// =================================================================
var TC = { pag:'resumen', sel:'*', anio:(new Date()).getFullYear(), mes:'',
           proy:[], dat:{}, cargando:false, callado:false, listo:false,
           cuando:0, fallo:0, avance:'' };
/* lo que NO se pudo leer, por proyecto. Se dice; no se pinta como cero */
var TC_FALLO={};
var TC_PAGS=[
  {id:'resumen', ic:'\u25A6', n:'Resumen ejecutivo'},
  {id:'acc',     ic:'\u26A0', n:'Accidentabilidad'},
  {id:'cump',    ic:'\u2714', n:'Cumplimiento'},
  {id:'epp',     ic:'\u26D1', n:'Consumo de EPP'},
  {id:'pers',    ic:'\u263A', n:'Personas'},
  {id:'docs',    ic:'\u2637', n:'Documentos'}
];
/* ── que medir: los parametros que el gerente puede cambiar ────────
   Viven en el servidor (sst_estado), no en el celular del que los
   edita: si el lider cambia la meta en la laptop, su supervisor la ve
   igual desde la obra. */
var TC_CFG_DEF = {metaIF:3, metaIS:50, metaCump:95, metaPerd:10, diasRep:7,
                  ver:{ifr:1, isv:1, racha:1, cump:1, epp:1}};
var TC_CFG = null;
function tcCfg(){ return TC_CFG || (TC_CFG = JSON.parse(JSON.stringify(TC_CFG_DEF))); }
function tcCfgCargar(){
  var e=_torEmp(); if(!e || !_torConCuenta()) return Promise.resolve(tcCfg());
  var _cfgDe=function(id){ return sbGet('sst_estado?empresa=eq.'+encodeURIComponent(id)+'&clave=eq.torre&select=valor'); };
  return _cfgDe(e.id)
    .then(function(r){ return ((!r || !r[0]) && e.obra && String(e.obra)!==String(e.id)) ? _cfgDe(e.obra) : r; })
    .then(function(r){
      var v=(r&&r[0]&&r[0].valor)||{};
      TC_CFG = JSON.parse(JSON.stringify(TC_CFG_DEF));
      Object.keys(v||{}).forEach(function(k){ if(k==='ver'){ Object.keys(v.ver||{}).forEach(function(j){ TC_CFG.ver[j]=v.ver[j]; }); } else TC_CFG[k]=v[k]; });
      return TC_CFG;
    }).catch(function(){ return tcCfg(); });
}
function tcCfgGuardar(){
  var e=_torEmp(); if(!e || !_torConCuenta()) return Promise.resolve(false);
  return _torPost('sst_estado',{empresa:e.id, clave:'torre', valor:tcCfg(), quien:_torCorreo()})
    .then(function(){ return true; })
    .catch(function(){
      return _torPatch('sst_estado?empresa=eq.'+encodeURIComponent(e.id)+'&clave=eq.torre',
                     {valor:tcCfg(), quien:_torCorreo()}).then(function(){ return true; })
             .catch(function(){ return false; });
    });
}

function tcSalir(){ _torCasco(false); tcReloj(false); _torAlInicio(); }
function tcRail(){ _torRailCambiar(); }
/* ══════ LA TORRE SE QUEDABA CONGELADA ═══════════════════════════
   Marcelo: «no se actualiza lo del lider con los datos nuevos en la
   torre de control». Y era exactamente eso: la Torre pedia los datos
   UNA vez por sesion. Despues, TC.listo quedaba en true para siempre
   y entrar de nuevo solo volvia a pintar lo mismo de antes. El lider
   veia el tablero de la primera vez que lo abrio ese dia, aunque sus
   supervisores hubieran registrado veinte cosas desde entonces. Peor
   todavia: no habia forma de notarlo —el tablero no decia de cuando
   eran las cifras—, asi que se tomaban decisiones con numeros viejos
   creyendo que eran los de hoy.
   Ahora: se pinta al toque lo que ya se tiene (nada de pantalla en
   blanco) y en paralelo se vuelve a preguntar al servidor; cuando
   llega, se repinta. Ademas se refresca sola cada pocos minutos
   mientras esta abierta y al volver a la pestaña, y arriba dice
   siempre de que hora son los datos.                                */
var TC_CADA = 180000;      /* cada 3 minutos mientras esta abierta */
var TC_MIN  = 15000;       /* pero no dos veces en 15 s */
var TC_RELOJ = null;
function tcEntrar(){
  _torCasco(true);
  if(!TC.listo && !TC.cargando){ tcCargar(); }
  else {
    tcPintar();
    /* Entrar a la Torre es un acto deliberado del lider: aqui SIEMPRE
       se vuelve a preguntar. Nada de «hace poco lo pedi»: si acaba de
       salir a ver algo y vuelve, es justo cuando quiere lo ultimo.
       Se pide por detras, sin tapar lo que ya se ve. */
    if(!TC.cargando) tcCargar(true);
  }
  tcReloj(true);
}
/* mientras la Torre este abierta se refresca sola; al salir se apaga */
function tcReloj(prender){
  try{ if(TC_RELOJ){ clearInterval(TC_RELOJ); TC_RELOJ=null; } }catch(e){}
  if(!prender) return;
  TC_RELOJ=setInterval(function(){
    if(!_torActiva()){ tcReloj(false); return; }
    if(document.hidden) return;              /* si no la esta mirando, no se gasta datos */
    if(TC.cargando || !TC.listo) return;
    tcCargar(true);
  }, TC_CADA);
}
/* volver a la pestaña despues de un rato es justo cuando mas mentira
   dicen los numeros viejos */
document.addEventListener('visibilitychange', function(){
  if(document.hidden) return;
  if(!_torActiva()) return;
  if(TC.cargando || !TC.listo) return;
  if((Date.now()-(TC.cuando||0)) > TC_MIN) tcCargar(true);
});
function tcHoraDatos(){
  if(!TC.cuando) return '';
  try{
    var d=new Date(TC.cuando);
    return d.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
  }catch(e){ return ''; }
}
/* ── traer los datos de todos los proyectos ─────────────────────── */
function tcCargar(callado){
  if(TC.cargando) return Promise.resolve();
  TC.cargando=true; TC.callado=!!callado;
  TC.avance= callado ? '' : 'Buscando tus proyectos…';
  tcPintar();
  var A=String(TC.anio), desde=A+'-01-01';
  /* ══════ UN CERO NO ES UN DATO ══════════════════════════════════
     Aqui habia un agujero feo. g() se tragaba CUALQUIER error y
     devolvia [], asi que si al servidor le faltaba una sola columna
     del select —PostgREST no devuelve «las demas», rechaza la
     consulta entera— el panel salia en CERO. Y en cero se ve igual
     que «no hubo nada».
     Paso de verdad: el kardex pedia «lugar», esa columna no existia
     en la base, y la Torre del lider mostraba 0 entregas de EPP
     teniendo 25 guardadas. Encima el reintento sin la columna estaba
     escrito... pero nunca corria, porque el catch de g() ya habia
     convertido el error en [] antes.
     Ahora: el reintento corre de verdad, y lo que aun asi no se pueda
     leer queda anotado y se DICE arriba del tablero. */
  function g(q, etq, pid){
    return sbGet(q).catch(function(){
      if(etq && pid){ (TC_FALLO[pid]=TC_FALLO[pid]||{})[etq]=1; }
      return [];
    });
  }
  /* pide con las columnas opcionales; si el servidor las rechaza,
     vuelve a pedir sin ellas antes de darse por vencido */
  function gOpc(base, extra, etq, pid){
    return sbGet(base+extra).catch(function(){
      return sbGet(base).catch(function(){
        (TC_FALLO[pid]=TC_FALLO[pid]||{})[etq]=1;
        return [];
      });
    });
  }
  return sbRpc('sst_mis_empresas',{}).then(function(rows){
    TC.proy=(rows||[]).map(function(e){
      return {id:e.id, nombre:e.nombre, codigo:e.codigo, plan:e.plan||'lite',
              sector:e.sector||'construccion', gestores:e.gestores||1, rol:e.rol||''};
    });
    if(!TC.proy.length) return [];
    var hechos=0;
    /* Cada consulta lleva order (sin order, un limit devuelve filas
       arbitrarias) y las que son del año se filtran por fecha para que
       el tope no las trunque en silencio. Y los proyectos se piden de
       3 en 3: con 20 obras eran 220 peticiones a la vez. */
    var hasta=A+'-12-31';
    /* el mes anterior a enero es diciembre del año pasado: se trae para
       que la comparacion «vs el mes pasado» no salga vacia en enero */
    desde=(TC.anio-1)+'-12-01';
    function unProyecto(p){
      var E=encodeURIComponent(p.id);
      TC_FALLO[p.id]={};
      return Promise.all([
        gOpc('sst_accidente?empresa=eq.'+E+'&order=fecha.desc&limit=1000&select=fecha,clase,dias,medidas,t_nombre',
             ',lugar', 'accidentes', p.id),
        gOpc('sst_hht?duenio=eq.'+E+'&fecha=gte.'+desde+'&fecha=lte.'+hasta+'&order=fecha.asc&limit=1000&select=fecha,ob_n,ob_h,st_n,st_h,hhc',
             '', 'horas hombre', p.id),
        g('sst_inspeccion?empresa=eq.'+E+'&fecha=gte.'+desde+'&order=fecha.desc&select=tipo,fecha,inspector&limit=1000', 'inspecciones', p.id),
        traerReportes(p.id, '&fecha=gte.'+desde+'&order=fecha.desc&limit=1000').catch(function(){
          (TC_FALLO[p.id]=TC_FALLO[p.id]||{})['reportes']=1; return []; }),
        gOpc('sst_kardex?duenio=eq.'+E+'&fecha=gte.'+desde+'&order=fecha.desc&limit=1000&select=epp,tipo,fecha,cantidad,trabajador,trab_nombre',
             ',actividad,lugar', 'entregas de EPP', p.id),
        g('sst_constancia?empresa=eq.'+E+'&order=fecha.desc&select=trabajador,dni,tema,resultado,fecha&limit=1000', 'capacitaciones', p.id),
        g('sst_trabajador?duenio=eq.'+E+'&order=nombre.asc&select=ext,nombre,dni,puesto,area,estatus&limit=1000', 'trabajadores', p.id),
        g('sst_amonestacion?duenio=eq.'+E+'&order=fecha.desc&select=fecha,t_nombre,t_dni,medida&limit=500', 'amonestaciones', p.id),
        g('sst_buena?empresa=eq.'+E+'&order=fecha.desc&select=fecha,titulo,autor,actividad&limit=500', 'buenas prácticas', p.id),
        gOpc('sst_invitacion?empresa_id=eq.'+E+'&limit=100&select=nombre,correo', ',proyecto,papel,usada_en,desde', 'invitaciones', p.id),
        g('sst_doc?empresa=eq.'+E+'&order=creado.desc&select=hoja,nombre,creado&limit=500', 'documentos', p.id)
      ]).then(function(r){
        TC.dat[p.id]={acc:r[0]||[], hht:r[1]||[], insp:r[2]||[], rep:r[3]||[], kdx:r[4]||[],
                      cons:r[5]||[], trab:r[6]||[], amon:r[7]||[], buenas:r[8]||[],
                      inv:r[9]||[], docs:r[10]||[]};
        hechos++;
        if(!TC.callado){ TC.avance='Juntando '+hechos+' de '+TC.proy.length+' proyectos…'; tcPintar(); }
      });
    }
    var tandas=[]; for(var ti=0; ti<TC.proy.length; ti+=3) tandas.push(TC.proy.slice(ti,ti+3));
    return tandas.reduce(function(cad, t){
      return cad.then(function(){ return Promise.all(t.map(unProyecto)); });
    }, Promise.resolve());
  }).then(function(){
    return tcCfgCargar();
  }).then(function(){
    TC.cargando=false; TC.callado=false; TC.listo=true; TC.cuando=Date.now(); TC.avance=''; tcPintar();
  }).catch(function(){
    /* si se cayo la señal, se deja lo que ya estaba en pantalla: mejor
       un dato de hace rato —y dicho— que un tablero en blanco */
    TC.cargando=false; TC.callado=false; TC.avance='';
    TC.fallo=Date.now(); tcPintar();
  });
}
/* el boton de arriba: vuelve a pedir SIN vaciar la pantalla primero */
function tcRefrescar(){ if(TC.cargando) return; tcCargar(TC.listo); }

/* ── cuentas ─────────────────────────────────────────────────────── */
function tcSel(){ return TC.sel==='*' ? TC.proy : TC.proy.filter(function(p){ return p.id===TC.sel; }); }
function tcD(id){ return TC.dat[id] || {acc:[],hht:[],insp:[],rep:[],kdx:[],cons:[],trab:[],amon:[],buenas:[],inv:[],docs:[]}; }
function tcEnAnio(f){ return String(f||'').slice(0,4)===String(TC.anio); }
function tcHHT(ps, mes){
  var t=0;
  ps.forEach(function(p){ tcD(p.id).hht.forEach(function(x){
    var f=String(x.fecha||'');
    if(mes ? f.slice(0,7)!==mes : !tcEnAnio(f)) return;
    t += (parseFloat(x.ob_n)||0)*(parseFloat(x.ob_h)||0) + (parseFloat(x.st_n)||0)*(parseFloat(x.st_h)||0);
  }); });
  return t;
}
function tcAccs(ps, mes){
  var a=[];
  ps.forEach(function(p){ tcD(p.id).acc.forEach(function(x){
    var f=String(x.fecha||'');
    if(mes ? f.slice(0,7)!==mes : !tcEnAnio(f)) return;
    a.push({p:p, x:x});
  }); });
  return a;
}
/* IF = incapacitantes y mortales x 1 000 000 / HHT
   IS = dias perdidos x 1 000 000 / HHT
   IA = IF x IS / 1000.  Sin HHT devuelve null: se avisa, no se inventa. */
function tcIndices(ps, mes){
  var hht=tcHHT(ps,mes), a=tcAccs(ps,mes), n=0, dias=0;
  a.forEach(function(o){
    var c=(typeof accClase==='function') ? accClase(o.x.clase) : {cuenta:false};
    if(c.cuenta) n++;
    dias += parseInt(o.x.dias,10)||0;
  });
  var IF = hht ? n*1e6/hht : null, IS = hht ? dias*1e6/hht : null;
  return {hht:hht, n:n, dias:dias, total:a.length, IF:IF, IS:IS, IA:(IF===null?null:IF*IS/1000)};
}
function tcRachas(ps){
  /* dias desde el ultimo accidente CON LESION, proyecto por proyecto.
     Si no hubo ninguno, se cuenta desde el PRIMER registro del año de
     esa obra (horas hombre, kardex, reporte...): es el numero que se
     cuelga en la caseta, y asi no se infla contando desde enero en una
     obra que arranco en marzo. Sin registros no hay numero. */
  var r=[];
  ps.forEach(function(p){
    var d=tcD(p.id), f='', origen='accidente';
    d.acc.forEach(function(x){
      var esAcc = (x.clase==='leve'||x.clase==='incap'||x.clase==='mortal');
      if(esAcc && String(x.fecha||'')>f) f=String(x.fecha||'');
    });
    if(!f){
      var pri='';
      [d.hht,d.kdx,d.rep,d.cons,d.insp].forEach(function(lista){
        (lista||[]).forEach(function(x){
          var ff=String(x.fecha||'').slice(0,10);
          if(ff && tcEnAnio(ff) && (!pri || ff<pri)) pri=ff;
        });
      });
      if(pri){ f=pri; origen='registro'; }
    }
    r.push({p:p, desde:f, origen:origen,
      dias: f ? Math.max(0, Math.floor((new Date(hoyISO()+'T00:00:00') - new Date(f+'T00:00:00'))/86400000)) : null});
  });
  return r;
}
function tcInspToca(p){
  try{ return (inspeccionesDelMes(p.sector)||[]).length; }catch(e){ return 0; }
}
function tcInspHechas(p, mes){
  var m=mes||TC.mes||mesISO(), n=0;
  tcD(p.id).insp.forEach(function(x){ if(String(x.fecha||'').slice(0,7)===m) n++; });
  return n;
}
function tcEPP(ps, mes){
  var m=mes||TC.mes||mesISO(), r={N:0,C:0,P:0,tot:0, porEpp:{}, porTrab:{},
                                  porActiv:{}, activP:{}, sinActiv:0,
                                  porLugar:{}, sinLugar:0};
  ps.forEach(function(p){ tcD(p.id).kdx.forEach(function(k){
    if(String(k.fecha||'').slice(0,7)!==m) return;
    var c=parseInt(k.cantidad,10)||0, t=(k.tipo||'N').toUpperCase();
    if(t==='C') r.C+=c; else if(t==='P') r.P+=c; else r.N+=c;
    r.tot+=c;
    var e=(k.epp||'—').trim(); r.porEpp[e]=(r.porEpp[e]||0)+c;
    var q=(k.trab_nombre||'—').trim(); r.porTrab[q]=(r.porTrab[q]||0)+c;
    /* la actividad es columna nueva: lo entregado ANTES de que existiera
       no tiene ninguna, y eso se dice, no se reparte a ojo */
    /* el lugar de entrega: mismo criterio. Lo que se registro antes de
       que el campo existiera no tiene lugar, y se cuenta aparte en vez
       de repartirlo entre los que si lo tienen. */
    var lg=(k.lugar||'').trim();
    if(lg) r.porLugar[lg]=(r.porLugar[lg]||0)+c; else r.sinLugar+=c;
    var v=(k.actividad||'').trim();
    if(!v){ r.sinActiv+=c; return; }
    r.porActiv[v]=(r.porActiv[v]||0)+c;
    if(t==='P') r.activP[v]=(r.activP[v]||0)+c;
  }); });
  return r;
}
function tcReps(ps){
  var r={tot:0, abiertos:0, cerrados:0, viejos:0, porAutor:{}, porActiv:{}};
  var lim=tcCfg().diasRep||7, hoy=new Date(hoyISO()+'T00:00:00');
  ps.forEach(function(p){ tcD(p.id).rep.forEach(function(x){
    if(!tcEnAnio(x.fecha)) return;
    r.tot++;
    var cerrado = (x.estado==='atendido');
    if(cerrado) r.cerrados++; else {
      r.abiertos++;
      var d=Math.floor((hoy-new Date(String(x.fecha||hoyISO())+'T00:00:00'))/86400000);
      if(d>lim) r.viejos++;
    }
    var a=(x.autor||'').trim(); if(a && a.toLowerCase()!=='anónimo') r.porAutor[a]=(r.porAutor[a]||0)+1;
    var ac=(x.actividad||'').trim(); if(ac) r.porActiv[ac]=(r.porActiv[ac]||0)+1;
  }); });
  return r;
}
function tcTop(obj, n){
  return Object.keys(obj||{}).map(function(k){ return {k:k, v:obj[k]}; })
    .sort(function(a,b){ return b.v-a.v; }).slice(0, n||8);
}
function tcNum(x, d){
  var v=Number(x)||0;
  try{ return v.toLocaleString('es-PE',{minimumFractionDigits:d||0, maximumFractionDigits:d||0}); }
  catch(e){ return v.toFixed(d||0); }
}
function tcEst(tipo, txt){
  var c = tipo==='ok'?'e-ok' : tipo==='av'?'e-av' : tipo==='cr'?'e-cr':'e-gr';
  var i = tipo==='ok'?'\u2713' : tipo==='cr'?'\u25CF' : tipo==='av'?'\u25B2':'\u25CB';
  return '<span class="tc-est '+c+'">'+i+' '+esc(txt)+'</span>';
}
function tcVacio(t){ return '<div class="tc-vacio">'+t+'</div>'; }
/* ══ LO QUE NO SE PUDO LEER SE DICE ═══════════════════════════════
   Un panel en cero porque el servidor rechazo la consulta se ve
   exactamente igual que un panel en cero porque no paso nada. Y con
   eso se toman decisiones. Aqui se separan las dos cosas. */
function tcAvisoFallos(){
  var ps=tcSel(), malas={}, hay=false;
  ps.forEach(function(p){
    var f=TC_FALLO[p.id]||{};
    Object.keys(f).forEach(function(k){ malas[k]=(malas[k]||[]); malas[k].push(p.nombre); hay=true; });
  });
  if(!hay) return '';
  var qs=Object.keys(malas);
  return '<div class="tc-card" style="border-color:var(--t-aviso);margin-bottom:14px">'+
    '<h3 style="margin:0 0 6px">⚠️ Esto no se pudo leer</h3>'+
    '<p class="sub" style="margin:0">No es que no haya: es que el servidor no contestó por '+
    '<b>'+qs.map(esc).join('</b>, <b>')+'</b>'+
    (ps.length>1 ? (' ('+esc(Object.keys(malas).map(function(k){ return malas[k].join(', '); })[0])+')') : '')+
    '. Lo que veas de eso en el tablero está incompleto — no lo tomes como un cero. '+
    'Toca <b>↻ Actualizar</b>; si sigue igual, avísame.</p></div>';
}
function tcColor(pct){ return pct>=95?'var(--t-ok)' : pct>=80?'var(--t-aviso)':'var(--t-critico)'; }
function tcBarras(filas){
  var h='<div class="tc-b">';
  filas.forEach(function(f){
    var pct = f.tope ? Math.min(100, Math.round(f.v*100/f.tope)) : 0;
    h+='<div class="tc-bf"><div class="et" title="'+escA(f.et)+'">'+esc(f.et)+'</div>'+
       '<div class="tc-riel"><div class="tc-val" style="width:'+Math.max(pct,2)+'%;background:'+(f.col||tcColor(pct))+'"></div></div>'+
       '<div class="tc-num">'+esc(f.txt!==undefined?f.txt:(pct+'%'))+'</div></div>';
  });
  return h+'</div>';
}
function tcApilada(partes, total){
  var h='<div class="tc-riel" style="height:22px;border-radius:7px">';
  partes.forEach(function(p){
    var w = total ? (p.v*100/total) : 0;
    if(w<=0) return;
    h+='<div style="width:'+w+'%;background:'+p.col+'"></div>';
  });
  h+='</div><div class="tc-ley">'+partes.map(function(p){
    return '<span><span class="pt" style="background:'+p.col+'"></span>'+esc(p.et)+'<b>'+tcNum(p.v)+'</b>'+
           (total?' <span style="opacity:.75">'+Math.round(p.v*100/total)+'%</span>':'')+'</span>';
  }).join('')+'</div>';
  return h;
}
/* linea mes a mes, en SVG: se adapta al ancho sin calcular nada */
function tcLinea(serie, meta, etiq){
  var W=760, H=230, ML=44, MB=26, MT=12, MR=10;
  var vals=serie.filter(function(v){ return v!==null; });
  var max=Math.max.apply(null, vals.concat([meta||0]).concat([1]))*1.25;
  var x=function(i){ return ML + (i/(serie.length-1||1))*(W-ML-MR); };
  var y=function(v){ return MT + (1-(v/max))*(H-MT-MB); };
  var d='', prev=false, pts='';
  serie.forEach(function(v,i){
    if(v===null){ prev=false; return; }
    d += (prev?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)+' ';
    pts += '<circle cx="'+x(i).toFixed(1)+'" cy="'+y(v).toFixed(1)+'" r="3.4" fill="var(--t-s1)"></circle>';
    prev=true;
  });
  var g='';
  [0, max/2, max].forEach(function(v){
    g += '<line x1="'+ML+'" x2="'+(W-MR)+'" y1="'+y(v).toFixed(1)+'" y2="'+y(v).toFixed(1)+'" stroke="currentColor" stroke-opacity=".14"></line>'+
         '<text x="'+(ML-7)+'" y="'+(y(v)+4).toFixed(1)+'" text-anchor="end" font-size="11" fill="currentColor" opacity=".55">'+v.toFixed(1)+'</text>';
  });
  var lm = meta ? '<line x1="'+ML+'" x2="'+(W-MR)+'" y1="'+y(meta).toFixed(1)+'" y2="'+y(meta).toFixed(1)+
      '" stroke="var(--t-critico)" stroke-dasharray="5 4" stroke-width="1.6"></line>'+
      '<text x="'+(ML+6)+'" y="'+(y(meta)-6).toFixed(1)+'" font-size="11.5" font-weight="700" fill="var(--t-critico)">Meta '+meta+'</text>' : '';
  var ex = etiq.map(function(t,i){
    return '<text x="'+x(i).toFixed(1)+'" y="'+(H-7)+'" text-anchor="middle" font-size="11" fill="currentColor" opacity=".6">'+esc(t)+'</text>';
  }).join('');
  return '<div class="tc-scroll"><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;min-width:520px;height:auto;color:var(--t-tinta)" role="img" aria-label="Índice de frecuencia mes a mes">'+
    g+lm+'<path d="'+d+'" fill="none" stroke="var(--t-s1)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"></path>'+pts+ex+'</svg></div>';
}
function tcDona(partes){
  var tot=0; partes.forEach(function(p){ tot+=p.v; });
  if(!tot) return '';
  var R=52, C=2*Math.PI*R, ini=0, arcos='';
  partes.forEach(function(p){
    var largo=C*p.v/tot;
    arcos+='<circle cx="70" cy="70" r="'+R+'" fill="none" stroke="'+p.col+'" stroke-width="21" '+
      'stroke-dasharray="'+largo.toFixed(2)+' '+(C-largo).toFixed(2)+'" stroke-dashoffset="'+(-ini).toFixed(2)+
      '" transform="rotate(-90 70 70)"></circle>';
    ini+=largo;
  });
  var pct=Math.round(partes[0].v*100/tot);
  return '<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">'+
    '<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="'+escA(partes[0].et)+'">'+
    '<circle cx="70" cy="70" r="'+R+'" fill="none" stroke="var(--t-regla2)" stroke-width="21"></circle>'+arcos+
    '<text x="70" y="66" text-anchor="middle" font-size="25" font-weight="800" fill="currentColor">'+pct+'%</text>'+
    '<text x="70" y="85" text-anchor="middle" font-size="10" fill="currentColor" opacity=".65">'+esc(partes[0].et.toLowerCase())+'</text></svg>'+
    '<div style="flex:1;min-width:150px"><div class="tc-ley" style="flex-direction:column;gap:7px;margin:0">'+
    partes.map(function(p){ return '<span><span class="pt" style="background:'+p.col+'"></span>'+esc(p.et)+'<b>'+tcNum(p.v)+'</b></span>'; }).join('')+
    '</div></div></div>';
}

/* ══ la cascara: cabecera, columna y filtros ══ */
function tcPintar(){
  var rail=$('tc-rail'), main=$('tc-main'); if(!rail||!main) return;
  var yo=$('tc-yo'); if(yo) yo.textContent = _torYo();
  var pa=$('tc-papel'); if(pa) pa.textContent = _torPapel();
  var tp=$('tc-titp');
  if(tp) tp.textContent = (TC.pag==='cfg') ? 'Qué medir'
        : ((TC_PAGS.filter(function(p){return p.id===TC.pag;})[0]||{}).n || '');
  tcPintarMeses();
  tcPintarFrescura();
  rail.innerHTML = tcRailHTML();
  /* si es un refresco por detras, NO se tapa el tablero que ya se ve */
  if(TC.cargando && !(TC.callado && TC.listo)){
    main.innerHTML = '<div class="tc-card"><h3>Juntando tus proyectos…</h3>'+
      '<p class="sub">'+esc(TC.avance||'Un momento.')+'</p></div>';
    return;
  }
  if(!TC.proy.length){
    main.innerHTML = '<div class="tc-card"><h3>Todavía no hay proyectos</h3>'+
      '<p class="sub">La Torre junta las obras en las que estás registrado con tu cuenta. '+
      'Crea tu empresa o entra con el código de una.</p>'+
      '<button class="tc-bt" onclick="tcSalir()">Volver al inicio</button></div>';
    return;
  }
  var h = tcChipsHTML() + tcAvisoFallos();
  if(TC.pag==='cfg'){ main.innerHTML = tcPagCfg(); return; }
  h += (TC.pag==='resumen') ? tcPagResumen()
     : (TC.pag==='acc')     ? tcPagAcc()
     : (TC.pag==='cump')    ? tcPagCump()
     : (TC.pag==='epp')     ? tcPagEpp()
     : (TC.pag==='pers')    ? tcPagPers()
     : tcPagDocs();
  main.innerHTML = h;
}
function tcVer(p){ TC.pag=p; tcPintar(); try{ window.scrollTo(0,0); }catch(e){} }
function tcFiltro(id){ TC.sel=id; tcPintar(); }
/* El mes de cierre vive en la cabecera, no detrás de un modal: es lo
   primero que toca un gerente cuando llega el día 1 y quiere ver el
   mes que se acaba de cerrar. */
/* De cuando son estos numeros. Un tablero que no dice su hora invita
   a decidir con datos viejos creyendo que son los de ahora. */
function tcPintarFrescura(){
  var c=$('tc-fresco'); if(!c) return;
  if(TC.cargando && TC.callado){ c.className='tc-fresco cargando'; c.innerHTML='<span class="pip"></span>Actualizando…'; return; }
  if(!TC.listo){ c.className='tc-fresco'; c.innerHTML=''; return; }
  var min=Math.floor((Date.now()-(TC.cuando||0))/60000);
  var viejo = (TC.fallo && TC.fallo>(TC.cuando||0)) || min>=10;
  c.className='tc-fresco'+(viejo?' viejo':'');
  if(TC.fallo && TC.fallo>(TC.cuando||0)){
    c.innerHTML='<span class="pip"></span>Sin señal · datos de las '+esc(tcHoraDatos());
  }else{
    c.innerHTML='<span class="pip"></span>Datos de las '+esc(tcHoraDatos())+
      (min>=2 ? (' · hace '+min+' min') : '');
  }
}
function tcPintarMeses(){
  var sel=$('tc-mes-sel'); if(!sel) return;
  var m=TC.mes||mesISO(), h='';
  for(var i=0;i<18;i++){
    var d=new Date(); d.setDate(1); d.setMonth(d.getMonth()-i);
    var x=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);
    h+='<option value="'+x+'"'+(x===m?' selected':'')+'>Cierre '+esc(mesBonito(x))+'</option>';
  }
  sel.innerHTML=h;
}
function tcPonerMes(m){
  if(!m || m===TC.mes) return;
  TC.mes=m; TC.anio=parseInt(m.slice(0,4),10);
  TC.listo=false; TC.dat={}; tcCargar();
}
function tcRailHTML(){
  var h='<div class="tc-rt">Tablero</div><div class="tc-nav">';
  TC_PAGS.forEach(function(p){
    h+='<button type="button" class="'+(TC.pag===p.id?'on':'')+'" onclick="tcVer(\''+p.id+'\')">'+
       '<span class="ic">'+p.ic+'</span>'+esc(p.n)+'</button>';
  });
  h+='</div>';
  var al=tcAlertas();
  h+='<div class="tc-rt">Necesita tu decisión</div>';
  if(!al.length){
    h+='<div class="tc-vacio" style="font-size:12.5px">Nada parado esperándote.</div>';
  } else {
    al.forEach(function(a,i){
      h+='<button type="button" class="tc-al" onclick="tcVer(\''+a.pg+'\')">'+
         '<span class="pt" style="background:'+a.c+'"></span>'+
         '<span><b>'+esc(a.t)+'</b><span class="d">'+esc(a.d)+'</span></span></button>';
    });
  }
  h+='<div class="tc-rt">Documentos de empresa</div>'+tcDocsEmpHTML();
  h+='<div class="tc-nota">El plan anual, el IPERC, el mapa de riesgos y el programa de capacitaciones '+
     'no viven aquí: son distintos en cada obra. Están en <b>Documentos</b>, proyecto por proyecto.</div>';
  return h;
}
/* Los dos documentos que sí son de la empresa entera. Se buscan en
   todos sus proyectos: basta que estén cargados en uno. */
var TC_DOC_EMP=[{h:'politicas', n:'Política de SST'},{h:'risst', n:'Reglamento Interno de SST'}];
function tcDocEmpBuscar(hoja){
  var mejor=null;
  TC.proy.forEach(function(p){ tcD(p.id).docs.forEach(function(d){
    if(d.hoja!==hoja) return;
    if(!mejor || String(d.creado||'')>String(mejor.creado||'')) mejor={d:d, p:p, creado:d.creado};
  }); });
  return mejor;
}
function tcDocsEmpHTML(){
  return TC_DOC_EMP.map(function(x){
    var m=tcDocEmpBuscar(x.h);
    var col = m ? 'var(--t-ok)' : 'var(--t-critico)';
    return '<div class="tc-doc" onclick="tcVer(\'docs\')"><span class="pt" style="width:7px;height:7px;border-radius:50%;background:'+col+'"></span>'+
      '<span class="tx">'+esc(x.n)+'</span><span class="v">'+(m? esc(String(m.creado||'').slice(0,10)) : 'falta')+'</span></div>';
  }).join('');
}
function tcAlertas(){
  var a=[], ps=TC.proy, cfg=tcCfg();
  var R=tcReps(ps);
  if(R.viejos) a.push({t:R.viejos+' reporte'+(R.viejos===1?'':'s')+' sin cerrar hace más de '+cfg.diasRep+' días',
                       d:'de '+R.abiertos+' abiertos en total', c:'var(--t-critico)', pg:'cump'});
  var sinMed=0;
  ps.forEach(function(p){ tcD(p.id).acc.forEach(function(x){ if(!String(x.medidas||'').trim()) sinMed++; }); });
  if(sinMed) a.push({t:sinMed+' investigación'+(sinMed===1?'':'es')+' sin medidas correctivas',
                     d:'es lo primero que pide un fiscalizador', c:'var(--t-critico)', pg:'acc'});
  var sinHHT=ps.filter(function(p){ return !tcHHT([p]); });
  if(sinHHT.length) a.push({t:sinHHT.length+' proyecto'+(sinHHT.length===1?'':'s')+' sin horas hombre',
                            d:'sin ellas el IF y el IS no se pueden calcular', c:'var(--t-aviso)', pg:'acc'});
  var sinAcc=ps.filter(function(p){ return !tcD(p.id).acc.length; });
  if(sinAcc.length===ps.length && ps.length)
    a.push({t:'Ningún proyecto lleva registro de accidentes', d:'es obligatorio: D.S. 005-2012-TR, art. 33',
            c:'var(--t-aviso)', pg:'acc'});
  var flojos=ps.filter(function(p){ var t=tcInspToca(p); return t && tcInspHechas(p)*2 < t; });
  if(flojos.length) a.push({t:flojos.length+' proyecto'+(flojos.length===1?'':'s')+' con menos de la mitad de sus inspecciones',
                            d:flojos.map(function(p){return p.nombre;}).slice(0,2).join(', '), c:'var(--t-critico)', pg:'cump'});
  var inv=0; ps.forEach(function(p){ tcD(p.id).inv.forEach(function(i){ if(!i.usada_en) inv++; }); });
  if(inv) a.push({t:inv+' invitación'+(inv===1?'':'es')+' sin usar', d:'ocupan un puesto de gestión mientras tanto',
                  c:'var(--t-aviso)', pg:'pers'});
  TC_DOC_EMP.forEach(function(x){
    if(!tcDocEmpBuscar(x.h)) a.push({t:x.n+' sin cargar', d:'es de la empresa entera, no de una obra', c:'var(--t-critico)', pg:'docs'});
  });
  return a;
}
function tcChipsHTML(){
  var h='<div class="tc-chips"><span class="et">Proyecto</span>'+
        '<button class="tc-chip '+(TC.sel==='*'?'on':'')+'" onclick="tcFiltro(\'*\')">Todos los proyectos ('+TC.proy.length+')</button>';
  TC.proy.forEach(function(p){
    h+='<button class="tc-chip '+(TC.sel===p.id?'on':'')+'" onclick="tcFiltro(\''+escA(p.id)+'\')">'+esc(p.nombre)+'</button>';
  });
  return h+'</div>';
}

/* ══ 1 · RESUMEN EJECUTIVO ══ */
/* ══════ LO QUE SE MUEVE, PRIMERO ═════════════════════════════════
   Marcelo: «colocar primero los indices no se veria cambio, porque
   no habria muchos incidentes o accidentes, seria 0; mejor algo que
   en verdad se mueva y le interese al gerente o jefe de SST».
   Tiene razon: el IF de una obra sana es 0.00 todo el año, y un
   tablero que abre con cinco ceros parece apagado. Lo que se mueve
   cada semana es esto: reportes que entran y que se cierran, gente
   que rinde capacitaciones, EPP que sale, horas hombre que se
   reportan, dias sin accidentes. Se compara con la semana anterior
   para que se vea la direccion, no solo el numero. Los indices
   legales siguen ahi, mas abajo, para la auditoria. */
function tcPulso(ps){
  var hoy=new Date(hoyISO()+'T00:00:00');
  function iso(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  var d7=new Date(hoy.valueOf()); d7.setDate(d7.getDate()-6);     /* ultimos 7 dias, hoy incluido */
  var d14=new Date(hoy.valueOf()); d14.setDate(d14.getDate()-13);
  var A=iso(d7), B=iso(d14), H=iso(hoy);
  function enA(f){ f=String(f||'').slice(0,10); return f>=A && f<=H; }
  function enB(f){ f=String(f||'').slice(0,10); return f>=B && f<A; }
  var r={repN:[0,0], repC:[0,0], cap:[0,0], capOk:[0,0], epp:[0,0], hht:[0,0], buenas:[0,0], abiertos:0, viejos:0};
  var lim=tcCfg().diasRep||7;
  ps.forEach(function(p){
    var d=tcD(p.id);
    d.rep.forEach(function(x){
      if(enA(x.fecha)) r.repN[0]++; else if(enB(x.fecha)) r.repN[1]++;
      var c=x.cerrado||'';
      if(x.estado==='atendido'){ if(enA(c)) r.repC[0]++; else if(enB(c)) r.repC[1]++; }
      else {
        r.abiertos++;
        var dd=Math.floor((hoy-new Date(String(x.fecha||H)+'T00:00:00'))/86400000);
        if(dd>lim) r.viejos++;
      }
    });
    d.cons.forEach(function(x){
      var i=enA(x.fecha)?0:(enB(x.fecha)?1:-1); if(i<0) return;
      r.cap[i]++; if(esAprobado(x.resultado)) r.capOk[i]++;
    });
    d.kdx.forEach(function(x){
      var i=enA(x.fecha)?0:(enB(x.fecha)?1:-1); if(i<0) return;
      r.epp[i]+=(parseInt(x.cantidad,10)||0);
    });
    d.hht.forEach(function(x){
      var i=enA(x.fecha)?0:(enB(x.fecha)?1:-1); if(i<0) return;
      r.hht[i]+=(parseFloat(x.ob_n)||0)*(parseFloat(x.ob_h)||0)+(parseFloat(x.st_n)||0)*(parseFloat(x.st_h)||0);
    });
    d.buenas.forEach(function(x){
      var i=enA(x.fecha)?0:(enB(x.fecha)?1:-1); if(i<0) return;
      r.buenas[i]++;
    });
  });
  return r;
}
function tcDelta(ahora, antes, malo, unidad){
  var d=ahora-antes;
  if(!antes && !ahora) return '<span class="delta">sin movimiento</span>';
  if(d===0) return '<span class="delta">igual que la semana pasada</span>';
  var cl=(d>0?'up':'dn')+(malo?' malo':'');
  return '<span class="delta '+cl+'">'+(d>0?'▲':'▼')+' '+tcNum(Math.abs(d),unidad==='h'?0:0)+(unidad?(' '+unidad):'')+' vs. semana pasada</span>';
}
function tcPagResumen(){
  var ps=tcSel(), cfg=tcCfg(), mes=TC.mes||mesISO();
  var I=tcIndices(ps), E=tcEPP(ps,mes), R=tcReps(ps);
  var rachas=tcRachas(ps).filter(function(r){ return r.dias!==null; });
  var corta = rachas.length ? rachas.sort(function(a,b){ return a.dias-b.dias; })[0] : null;
  var tocan=0, hechas=0;
  ps.forEach(function(p){ tocan+=tcInspToca(p); hechas+=tcInspHechas(p,mes); });
  var pctC = tocan ? Math.round(hechas*100/tocan) : null;
  var pctP = E.tot ? Math.round(E.P*100/E.tot) : 0;

  var P=tcPulso(ps);
  var h='<div class="tc-kpis">';
  /* 1 · reportes: lo que entra y lo que se levanta */
  h+='<div class="tc-kpi"><div class="et">Reportes abiertos</div>'+
     '<div class="v">'+tcNum(P.abiertos)+'</div>'+
     (P.viejos ? tcEst('cr', P.viejos+' con más de '+cfg.diasRep+' días') : (P.abiertos ? tcEst('av','Todos dentro de plazo') : tcEst('ok','Nada pendiente')))+
     '<div class="sub2">'+tcNum(P.repN[0])+' nuevo'+(P.repN[0]===1?'':'s')+' esta semana · '+tcNum(P.repC[0])+' cerrado'+(P.repC[0]===1?'':'s')+'</div>'+
     tcDelta(P.repN[0], P.repN[1], true, '')+'</div>';
  /* 2 · capacitaciones rendidas */
  var pctOk = P.cap[0] ? Math.round(P.capOk[0]*100/P.cap[0]) : null;
  h+='<div class="tc-kpi"><div class="et">Capacitaciones esta semana</div>'+
     '<div class="v">'+tcNum(P.cap[0])+'</div>'+
     (P.cap[0] ? tcEst(pctOk>=80?'ok':(pctOk>=60?'av':'cr'), pctOk+'% aprobaron') : tcEst('gr','Nadie rindió esta semana'))+
     tcDelta(P.cap[0], P.cap[1], false, '')+'</div>';
  /* 3 · horas hombre reportadas */
  h+='<div class="tc-kpi"><div class="et">Horas hombre esta semana</div>'+
     '<div class="v">'+tcNum(P.hht[0])+'</div>'+
     (P.hht[0] ? tcEst('ok','Reporte semanal al día') : tcEst('cr','Sin reporte semanal: sin HHT no hay índices'))+
     tcDelta(P.hht[0], P.hht[1], false, 'h')+'</div>';
  /* 4 · EPP que salio (15/10/2026 · «Qué medir» ya traía su casilla y no la escondía: ahora sí) */
  if(cfg.ver.epp) h+='<div class="tc-kpi"><div class="et">EPP entregado esta semana</div>'+
     '<div class="v">'+tcNum(P.epp[0])+'<small>und</small></div>'+
     (E.tot ? tcEst(pctP<=cfg.metaPerd?'ok':'av', pctP+'% por pérdida en el mes') : tcEst('gr','Nada registrado este mes'))+
     tcDelta(P.epp[0], P.epp[1], false, 'und')+'</div>';
  /* 5 · dias sin accidentes: el que la gente mira en la caseta */
  if(cfg.ver.racha) h+='<div class="tc-kpi"><div class="et">Días sin accidentes</div>'+
      '<div class="v">'+(corta?tcNum(corta.dias):'—')+'<small>'+(corta?'días':'')+'</small></div>'+
      (corta ? (corta.origen==='registro'
                  ? tcEst('ok','Sin accidentes desde el primer registro ('+esc(fechaLarga(corta.desde)||corta.desde)+')')
                  : (corta.dias<30 ? tcEst('av', 'Último accidente: '+corta.p.nombre) : tcEst('ok', corta.p.nombre)))
             : tcEst('gr','Todavía no hay registros en '+TC.anio))+
      (P.buenas[0] ? '<div class="sub2">'+P.buenas[0]+' buena'+(P.buenas[0]===1?'':'s')+' práctica'+(P.buenas[0]===1?'':'s')+' esta semana</div>' : '')+'</div>';
  /* 6 · inspecciones del mes */
  if(cfg.ver.cump) h+='<div class="tc-kpi"><div class="et">Inspecciones del mes</div>'+
      '<div class="v">'+(pctC===null?'—':pctC)+'<small>'+(pctC===null?'':'%')+'</small></div>'+
      (pctC===null ? tcEst('gr','Sin inspecciones obligatorias')
                   : tcEst(pctC>=cfg.metaCump?'ok':(pctC>=80?'av':'cr'), hechas+' de '+tocan+' hechas'))+'</div>';
  h+='</div>';

  /* los indices legales: siguen, pero ya no abren el tablero */
  if(cfg.ver.ifr || cfg.ver.isv){
    h+='<div class="tc-card" style="margin-bottom:14px"><h3>Índices legales del año '+TC.anio+'</h3>'+
       '<p class="sub">IF, IS e IA: los que pide la auditoría. En una obra sana están en cero todo el año, por eso no abren el tablero.</p>'+
       '<div class="tc-legal">'+
       (cfg.ver.ifr ? ('<div><div class="et">Índice de frecuencia</div><div class="v">'+(I.IF===null?'—':tcNum(I.IF,2))+'</div>'+
          (I.IF===null ? tcEst('gr','Faltan horas hombre') : (I.IF<=cfg.metaIF ? tcEst('ok','Meta '+cfg.metaIF) : tcEst('cr','Sobre la meta de '+cfg.metaIF)))+'</div>') : '')+
       (cfg.ver.isv ? ('<div><div class="et">Índice de severidad</div><div class="v">'+(I.IS===null?'—':tcNum(I.IS,1))+'</div>'+
          (I.IS===null ? tcEst('gr','Faltan horas hombre') : tcEst(I.IS<=cfg.metaIS?'ok':'av', tcNum(I.dias)+' días perdidos'))+'</div>') : '')+
       '<div><div class="et">Índice de accidentabilidad</div><div class="v">'+(I.IA===null?'—':tcNum(I.IA,2))+'</div>'+
          tcEst('gr', I.n+' accidente'+(I.n===1?'':'s')+' con incapacidad')+'</div>'+
       '<div><div class="et">Horas hombre del año</div><div class="v">'+tcNum(I.hht)+'</div>'+tcEst('gr','Del reporte semanal')+'</div>'+
       '</div></div>';
  }

  h+='<div class="tc-rej">';
  /* linea del IF mes a mes */
  var serie=[], etiq=[], MM=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'];
  for(var m=1;m<=12;m++){
    var ym=TC.anio+'-'+('0'+m).slice(-2);
    var hh=tcHHT(ps,ym);
    var accs=tcAccs(ps,ym), n=0;
    accs.forEach(function(o){ var c=accClase(o.x.clase); if(c.cuenta) n++; });
    serie.push(hh ? n*1e6/hh : null); etiq.push(MM[m-1]);
  }
  var hayLinea = serie.some(function(v){ return v!==null; });
  h+='<div class="tc-card ancha"><h3>Índice de frecuencia, mes a mes</h3>'+
     '<p class="sub">Accidentes incapacitantes y mortales por cada millón de horas hombre trabajadas. La línea de corte es la meta anual.</p>'+
     (hayLinea ? tcLinea(serie, cfg.metaIF, etiq)
               : tcVacio('Todavía no se puede dibujar: hacen falta las <b>horas hombre</b> del reporte semanal. Sin ellas ningún índice de accidentabilidad se puede calcular, y es el primer número que pide una auditoría.'))+
     '</div>';
  /* reportes: cerrados / abiertos / vencidos */
  h+='<div class="tc-card"><h3>Reportes de actos y condiciones</h3>'+
     '<p class="sub">Lo que reportó la gente en '+TC.anio+'. Lo que lleva más de '+cfg.diasRep+' días abierto es lo que un fiscalizador mira primero.</p>'+
     (R.tot ? tcDona([{et:'Cerrados', v:R.cerrados, col:'var(--t-ok)'},
                      {et:'Abiertos dentro de plazo', v:Math.max(0,R.abiertos-R.viejos), col:'var(--t-aviso)'},
                      {et:'Abiertos hace más de '+cfg.diasRep+' días', v:R.viejos, col:'var(--t-critico)'}])
            : tcVacio('Ningún reporte este año. Cero reportes casi nunca quiere decir que no pasa nada: quiere decir que no se está reportando.'))+
     '</div>';
  /* programa: inspecciones por proyecto */
  h+='<div class="tc-card"><h3>Inspecciones del mes por proyecto</h3>'+
     '<p class="sub">Lo hecho contra lo que exige el sector de cada obra, en '+esc(mesBonito(mes))+'.</p>'+
     (ps.length ? tcBarras(ps.map(function(p){
        var t=tcInspToca(p), x=tcInspHechas(p,mes);
        return {et:p.nombre, v:x, tope:t||1, txt:x+'/'+t};
      })) : tcVacio('Sin proyectos.'))+'</div>';
  /* EPP del mes */
  h+='<div class="tc-card"><h3>Consumo de EPP del mes</h3>'+
     '<p class="sub">Lo entregado en '+esc(mesBonito(mes))+', separado por motivo. La pérdida es plata que se va sin proteger a nadie.</p>'+
     (E.tot ? tcApilada([{et:'Nuevo', v:E.N, col:'var(--t-ok)'},
                         {et:'Cambio por desgaste', v:E.C, col:'var(--t-s1)'},
                         {et:'Pérdida', v:E.P, col:'var(--t-critico)'}], E.tot)
            : tcVacio('No hay entregas de EPP registradas en el kardex este mes.'))+'</div>';
  /* tabla proyecto por proyecto */
  h+='<div class="tc-card ancha"><h3>Obligaciones del mes, proyecto por proyecto</h3>'+
     '<p class="sub">Una fila por obra. Toca el nombre para dejar el tablero en esa sola.</p><div class="tc-scroll">'+
     '<table class="tc-tab"><thead><tr><th>Proyecto</th><th class="n">Insp.</th><th class="n">Reportes</th>'+
     '<th class="n">Capac.</th><th class="n">EPP</th><th class="n">Personal</th><th class="n">Días sin acc.</th></tr></thead><tbody>';
  TC.proy.forEach(function(p){
    var d=tcD(p.id), t=tcInspToca(p), x=tcInspHechas(p,mes);
    var rep=0, ab=0;
    d.rep.forEach(function(r){ if(String(r.fecha||'').slice(0,7)===mes){ rep++; if(r.estado!=='atendido') ab++; } });
    var cap=0; d.cons.forEach(function(c){ if(String(c.fecha||'').slice(0,7)===mes) cap++; });
    var epp=tcEPP([p],mes).tot;
    var per=d.trab.filter(function(w){ return (w.estatus||'activo')==='activo'; }).length;
    var ra=tcRachas([p])[0];
    h+='<tr><td><b style="cursor:pointer" onclick="tcFiltro(\''+escA(p.id)+'\')">'+esc(p.nombre)+'</b>'+
       '<br><small style="color:var(--t-mudo)">'+esc(p.codigo||'')+'</small></td>'+
       '<td class="n" style="color:'+((t&&x>=t)?'var(--t-ok-tx)':'var(--t-cr-tx)')+'">'+x+'/'+t+'</td>'+
       '<td class="n" style="color:'+(ab?'var(--t-cr-tx)':'var(--t-ok-tx)')+'">'+rep+(ab?(' ('+ab+' ab.)'):'')+'</td>'+
       '<td class="n">'+cap+'</td><td class="n">'+tcNum(epp)+'</td><td class="n">'+per+'</td>'+
       '<td class="n">'+(ra&&ra.dias!==null?ra.dias:'—')+'</td></tr>';
  });
  h+='</tbody></table></div></div>';
  return h+'</div>';
}

/* ══ 2 · ACCIDENTABILIDAD ══ */
function tcPagAcc(){
  var ps=tcSel(), cfg=tcCfg(), I=tcIndices(ps), accs=tcAccs(ps);
  var cuenta={}; ACC_CLASES.forEach(function(c){ cuenta[c.k]=0; });
  accs.forEach(function(o){ if(cuenta[o.x.clase]!==undefined) cuenta[o.x.clase]++; });
  var maxN=Math.max.apply(null, ACC_CLASES.map(function(c){ return cuenta[c.k]; }).concat([1]));
  /* el escalon mortal es el unico lo bastante oscuro para llevar letra
     blanca; en los demas la letra va en tinta, que es lo que se lee */
  var COL={mortal:'#d03b3b', incap:'#ec835a', leve:'#fab219', primeros:'#7fc77f', casi:'#5fa8d3'};
  var OSC={mortal:1};

  var h='<div class="tc-rej">';
  /* piramide */
  h+='<div class="tc-card"><h3>Pirámide de accidentabilidad</h3>'+
     '<p class="sub">Los cinco escalones del año '+TC.anio+'. Una base ancha de casi accidentes es buena señal: quiere decir que la gente avisa antes de que pase algo.</p><div class="tc-pir">';
  ACC_CLASES.slice().sort(function(a,b){ return a.piso-b.piso; }).forEach(function(c){
    var n=cuenta[c.k], ancho = 48 + Math.round((n/maxN)*48);
    h+= n
      ? '<div class="tc-pe'+(OSC[c.k]?' oscuro':'')+'" style="width:'+ancho+'%;background:'+COL[c.k]+'">'+c.ic+' '+esc(c.n)+' · '+n+'</div>'
      : '<div class="tc-pe sin" style="width:'+ancho+'%">'+c.ic+' '+esc(c.n)+' · 0</div>';
  });
  h+='</div></div>';
  /* indices */
  h+='<div class="tc-card"><h3>Los tres índices, y de qué salen</h3>'+
     '<p class="sub">Se calculan con las horas hombre del reporte semanal. Si falta ese dato, el índice no existe: no se rellena con un cero.</p>'+
     '<table class="tc-tab"><tbody>'+
     '<tr><td><b>Horas hombre trabajadas</b><br><small style="color:var(--t-mudo)">obreros + staff, de todo '+TC.anio+'</small></td>'+
       '<td class="n" style="font-size:19px;font-weight:800">'+(I.hht?tcNum(I.hht):'—')+'</td></tr>'+
     '<tr><td><b>IF · frecuencia</b><br><small style="color:var(--t-mudo)">'+I.n+' accidentes que cuentan × 1 000 000 ÷ HHT</small></td>'+
       '<td class="n" style="font-size:19px;font-weight:800;color:'+(I.IF===null?'var(--t-mudo)':(I.IF<=cfg.metaIF?'var(--t-ok-tx)':'var(--t-cr-tx)'))+'">'+(I.IF===null?'—':tcNum(I.IF,2))+'</td></tr>'+
     '<tr><td><b>IS · severidad</b><br><small style="color:var(--t-mudo)">'+I.dias+' días perdidos × 1 000 000 ÷ HHT</small></td>'+
       '<td class="n" style="font-size:19px;font-weight:800">'+(I.IS===null?'—':tcNum(I.IS,1))+'</td></tr>'+
     '<tr><td><b>IA · accidentabilidad</b><br><small style="color:var(--t-mudo)">IF × IS ÷ 1000</small></td>'+
       '<td class="n" style="font-size:19px;font-weight:800">'+(I.IA===null?'—':tcNum(I.IA, I.IA<1?3:2))+'</td></tr>'+
     '</tbody></table>'+
     (I.hht ? '' : '<div class="tc-vacio" style="margin-top:12px">Falta el <b>reporte semanal de horas hombre</b> en '+
       (ps.length===1?'esta obra':'tus obras')+'. Es un dato que se llena una vez por semana y sin él ningún índice se puede calcular.</div>')+
     '</div>';
  /* dias sin accidentes por proyecto */
  h+='<div class="tc-card"><h3>Días sin accidentes, por proyecto</h3>'+
     '<p class="sub">Desde el último accidente con lesión. La obra con la racha más corta es la que hay que mirar.</p>'+
     tcBarras(tcRachas(TC.proy).map(function(r){
       return {et:r.p.nombre, v:(r.dias===null?365:r.dias), tope:365,
               txt:(r.dias===null?'sin registro':r.dias+' d'),
               col:(r.dias===null?'var(--t-pista)':(r.dias<30?'var(--t-critico)':(r.dias<90?'var(--t-aviso)':'var(--t-ok)')))};
     }))+'</div>';
  /* tabla de accidentes */
  h+='<div class="tc-card ancha"><h3>Registro de accidentes e incidentes de '+TC.anio+'</h3>'+
     '<p class="sub">Lo que exige el D.S. 005-2012-TR, art. 33. Sin medidas correctivas escritas, la investigación está a medias.</p>';
  if(!accs.length){
    h+=tcVacio('Ningún registro este año. Si de verdad no pasó nada, igual hay que registrar los <b>casi accidentes</b>: son los que avisan antes.');
  } else {
    h+='<div class="tc-scroll"><table class="tc-tab"><thead><tr><th>Fecha</th><th>Proyecto</th><th>Clase</th>'+
       '<th>Trabajador</th><th>Lugar</th><th class="n">Días</th><th>Medidas</th></tr></thead><tbody>';
    accs.sort(function(a,b){ return String(b.x.fecha).localeCompare(String(a.x.fecha)); }).slice(0,60).forEach(function(o){
      var c=accClase(o.x.clase);
      h+='<tr><td>'+esc(fechaLarga(o.x.fecha)||o.x.fecha)+'</td><td>'+esc(o.p.nombre)+'</td>'+
         '<td>'+c.ic+' '+esc(c.n)+'</td><td>'+esc(o.x.t_nombre||'—')+'</td><td>'+esc(o.x.lugar||'—')+'</td>'+
         '<td class="n">'+(parseInt(o.x.dias,10)||0)+'</td>'+
         '<td>'+(String(o.x.medidas||'').trim() ? tcEst('ok','escritas') : tcEst('cr','faltan'))+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  return h+'</div>';
}

/* ══ 3 · CUMPLIMIENTO ══ */
function tcPagCump(){
  var ps=tcSel(), cfg=tcCfg(), mes=TC.mes||mesISO(), R=tcReps(ps);
  var h='<div class="tc-rej">';
  /* inspecciones obligatorias, cuales faltan */
  h+='<div class="tc-card ancha"><h3>Inspecciones obligatorias de '+esc(mesBonito(mes))+'</h3>'+
     '<p class="sub">Cada sector tiene las suyas. Lo que sale en rojo es lo que todavía no se hizo este mes.</p><div class="tc-scroll">'+
     '<table class="tc-tab"><thead><tr><th>Proyecto</th><th>Sector</th><th class="n">Hechas</th><th class="n">Exige</th><th>Qué falta</th></tr></thead><tbody>';
  ps.forEach(function(p){
    var toca=[]; try{ toca=inspeccionesDelMes(p.sector)||[]; }catch(e){}
    var hechasN=[];
    tcD(p.id).insp.forEach(function(x){ if(String(x.fecha||'').slice(0,7)===mes) hechasN.push(String(x.tipo||'')); });
    var faltan=toca.filter(function(t){
      return !hechasN.some(function(n){ return n && (n===t.n || n.indexOf(t.n)>-1); });
    }).map(function(t){ return t.n; });
    h+='<tr><td><b>'+esc(p.nombre)+'</b></td><td>'+esc(p.sector||'—')+'</td>'+
       '<td class="n">'+hechasN.length+'</td><td class="n">'+toca.length+'</td>'+
       '<td>'+(faltan.length ? '<span style="color:var(--t-cr-tx)">'+esc(faltan.slice(0,4).join(' · '))+(faltan.length>4?(' y '+(faltan.length-4)+' más'):'')+'</span>'
                             : tcEst('ok','al día'))+'</td></tr>';
  });
  h+='</tbody></table></div></div>';
  /* reportes: cuanto tardan en cerrarse */
  var dias=[], hoy=new Date(hoyISO()+'T00:00:00');
  ps.forEach(function(p){ tcD(p.id).rep.forEach(function(r){
    if(!tcEnAnio(r.fecha)) return;
    if(r.estado==='atendido' && r.cerrado){
      var d=Math.floor((new Date(String(r.cerrado).slice(0,10)+'T00:00:00') - new Date(String(r.fecha)+'T00:00:00'))/86400000);
      if(d>=0) dias.push(d);
    }
  }); });
  var prom = dias.length ? Math.round(dias.reduce(function(a,b){return a+b;},0)/dias.length) : null;
  h+='<div class="tc-card"><h3>Cuánto tarda en cerrarse un reporte</h3>'+
     '<p class="sub">Desde que alguien lo levanta hasta que queda cerrado con su acción y su foto.</p>'+
     (prom===null ? tcVacio('Todavía no hay reportes cerrados con fecha de cierre este año.')
       : '<div style="font-size:38px;font-weight:800;font-variant-numeric:tabular-nums">'+prom+
         '<span style="font-size:16px;color:var(--t-mudo);font-weight:600"> días en promedio</span></div>'+
         '<div class="tc-ley"><span>'+dias.length+' reportes cerrados · '+R.abiertos+' siguen abiertos · '+
         '<b style="color:'+(R.viejos?'var(--t-cr-tx)':'var(--t-ok-tx)')+'">'+R.viejos+'</b> pasados de '+cfg.diasRep+' días</span></div>')+
     '</div>';
  /* capacitacion: cobertura */
  h+='<div class="tc-card"><h3>Capacitación: cobertura por proyecto</h3>'+
     '<p class="sub">Trabajadores con al menos una constancia en '+TC.anio+', sobre el personal activo de cada obra.</p>'+
     tcBarras(ps.map(function(p){
       var d=tcD(p.id);
       var act=d.trab.filter(function(w){ return (w.estatus||'activo')==='activo'; });
       var conDoc={};
       d.cons.forEach(function(c){ if(tcEnAnio(c.fecha) && c.dni) conDoc[String(c.dni).trim()]=1; });
       var n=act.filter(function(w){ return w.dni && conDoc[String(w.dni).trim()]; }).length;
       return {et:p.nombre, v:n, tope:act.length||1, txt:(act.length? n+'/'+act.length : 'sin personal')};
     }))+'</div>';
  /* actividades de alto riesgo mas reportadas */
  var act=tcTop(R.porActiv, 8);
  h+='<div class="tc-card"><h3>Qué actividad concentra los reportes</h3>'+
     '<p class="sub">De los trabajos de alto riesgo que marca cada reporte. Es donde conviene poner la próxima charla.</p>'+
     (act.length ? tcBarras(act.map(function(a){ return {et:a.k, v:a.v, tope:act[0].v, txt:String(a.v), col:'var(--t-s1)'}; }))
                 : tcVacio('Todavía ningún reporte trae marcada la actividad. Es un campo nuevo: aparece al levantar el próximo.'))+
     '</div>';
  return h+'</div>';
}

/* ══ 4 · CONSUMO DE EPP ══ */
function tcPagEpp(){
  var ps=tcSel(), cfg=tcCfg(), mes=TC.mes||mesISO(), E=tcEPP(ps,mes);
  var h='<div class="tc-rej">';
  /* de donde sale el EPP: dice donde poner el proximo punto de entrega */
  var lug=tcTop(E.porLugar,8);
  h+='<div class="tc-card"><h3>D\u00f3nde se entrega el EPP</h3>'+
     '<p class="sub">Punto de entrega de lo despachado en '+esc(mesBonito(mes))+'. '+
     'Si casi todo sale de un solo sitio, ah\u00ed se est\u00e1 yendo la hora del obrero que baja a buscarlo.</p>'+
     (lug.length ? tcBarras(lug.map(function(x){ return {et:x.k, v:x.v, tope:lug[0].v, txt:tcNum(x.v), col:'var(--t-s1)'}; }))+
        (E.sinLugar? '<p class="sub" style="margin:10px 0 0">'+tcNum(E.sinLugar)+
          ' unidades no dicen d\u00f3nde se entregaron: son de antes de que el campo existiera.</p>' : '')
      : tcVacio('Todav\u00eda ninguna entrega trae el lugar. Es un campo nuevo: aparece en la pr\u00f3xima entrega que registres.'))+
     '</div>';
  var top=tcTop(E.porEpp,10);
  h+='<div class="tc-card"><h3>Qué EPP se consume más</h3>'+
     '<p class="sub">Unidades entregadas en '+esc(mesBonito(mes))+', de todo el kardex.</p>'+
     (top.length ? tcBarras(top.map(function(a){ return {et:a.k, v:a.v, tope:top[0].v, txt:tcNum(a.v), col:'var(--t-s1)'}; }))
                 : tcVacio('Sin entregas registradas este mes.'))+'</div>';
  h+='<div class="tc-card"><h3>Por qué se entrega</h3>'+
     '<p class="sub">Nuevo, cambio por desgaste o pérdida. Cuando la pérdida pasa del '+cfg.metaPerd+'%, hay algo que revisar antes de comprar más.</p>'+
     (E.tot ? tcApilada([{et:'Nuevo', v:E.N, col:'var(--t-ok)'},
                         {et:'Cambio por desgaste', v:E.C, col:'var(--t-s1)'},
                         {et:'Pérdida', v:E.P, col:'var(--t-critico)'}], E.tot)
            : tcVacio('Sin entregas registradas este mes.'))+'</div>';
  h+='<div class="tc-card"><h3>Pérdida de EPP por proyecto</h3>'+
     '<p class="sub">Solo las entregas marcadas como pérdida, en '+esc(mesBonito(mes))+'.</p>'+
     tcBarras(TC.proy.map(function(p){
       var e=tcEPP([p],mes);
       var pct = e.tot ? Math.round(e.P*100/e.tot) : 0;
       return {et:p.nombre, v:pct, tope:100, txt:(e.tot? (tcNum(e.P)+' und · '+pct+'%') : 'sin datos'),
               col:(!e.tot?'var(--t-pista)':(pct<=cfg.metaPerd?'var(--t-ok)':'var(--t-critico)'))};
     }))+'</div>';
  /* ── PARA QUE ACTIVIDAD SALIO ────────────────────────────────
     Sin esto el consumo de EPP es una lista de compras. Con la
     actividad al lado se lee contra el riesgo que lo genera: si la
     mitad del arnes se va en «trabajo en altura» esta bien, y si se
     va en «otra / no aplica» es que nadie sabe para que salio.     */
  var ta=tcTop(E.porActiv,10);
  var conActiv=E.tot - E.sinActiv;
  h+='<div class="tc-card ancha"><h3>Para qué actividad sale el EPP</h3>'+
     '<p class="sub">Unidades de '+esc(mesBonito(mes))+' repartidas por la actividad de alto riesgo que las pidió, con lo que de esas se fue por pérdida.</p>';
  if(!ta.length){
    h+=tcVacio(E.tot
      ? ('Las '+tcNum(E.tot)+' unidades de este mes se registraron sin actividad. Desde ahora el kardex la pide al entregar: en la próxima entrega ya sale acá.')
      : 'Sin entregas registradas este mes.');
  } else {
    h+='<div class="tc-scroll"><table class="tc-tab"><thead><tr><th>Actividad</th>'+
       '<th class="n">Unidades</th><th class="n">% del mes</th><th class="n">Por pérdida</th></tr></thead><tbody>';
    ta.forEach(function(x){
      var per=E.activP[x.k]||0;
      h+='<tr><td><b>'+esc(x.k)+'</b></td><td class="n">'+tcNum(x.v)+'</td>'+
         '<td class="n">'+(conActiv? Math.round(x.v*100/conActiv):0)+'%</td>'+
         '<td class="n">'+(per? tcNum(per) : '—')+'</td></tr>';
    });
    h+='</tbody></table></div>';
    if(E.sinActiv) h+='<p class="sub" style="margin-top:9px">'+tcNum(E.sinActiv)+
      ' unidad'+(E.sinActiv===1?'':'es')+' más se entregaron sin anotar la actividad. No se reparten entre las de arriba: se dicen aparte.</p>';
  }
  h+='</div>';
  var tt=tcTop(E.porTrab,10);
  h+='<div class="tc-card"><h3>Quién recibe más</h3>'+
     '<p class="sub">Diez trabajadores con más unidades este mes. Un nombre muy arriba suele ser una talla mal pedida o un EPP que no aguanta la tarea.</p>'+
     (tt.length ? tcBarras(tt.map(function(a){ return {et:a.k, v:a.v, tope:tt[0].v, txt:tcNum(a.v), col:'var(--t-aviso)'}; }))
                : tcVacio('Sin entregas registradas este mes.'))+'</div>';
  return h+'</div>';
}

/* ══ 5 · PERSONAS ══ */
function tcPagPers(){
  var ps=tcSel(), mes=TC.mes||mesISO(), h='<div class="tc-rej">';
  /* como va cada supervisor */
  var sup={};
  ps.forEach(function(p){
    var d=tcD(p.id);
    d.insp.forEach(function(x){ var q=(x.inspector||'').trim(); if(!q) return;
      sup[q]=sup[q]||{insp:0, cerr:0, cap:0, obra:{}}; sup[q].insp++; sup[q].obra[p.nombre]=1; });
    d.rep.forEach(function(r){ var q=(r.cerrado_por||'').trim(); if(!q) return;
      sup[q]=sup[q]||{insp:0, cerr:0, cap:0, obra:{}}; sup[q].cerr++; sup[q].obra[p.nombre]=1; });
  });
  var sk=Object.keys(sup);
  h+='<div class="tc-card ancha"><h3>Cómo va cada supervisor SSOMA</h3>'+
     '<p class="sub">Sale de lo que cada uno firmó en '+TC.anio+': las inspecciones que levantó y los reportes que cerró. No es una nota; es para saber a quién apoyar.</p>';
  if(!sk.length){
    h+=tcVacio('Todavía no hay inspecciones ni cierres firmados con nombre. El nombre del inspector se escribe al hacer la inspección.');
  } else {
    h+='<div class="tc-scroll"><table class="tc-tab"><thead><tr><th>Supervisor</th><th>Obras</th>'+
       '<th class="n">Inspecciones</th><th class="n">Reportes cerrados</th></tr></thead><tbody>';
    sk.sort(function(a,b){ return (sup[b].insp+sup[b].cerr)-(sup[a].insp+sup[a].cerr); }).forEach(function(q){
      h+='<tr><td><b>'+esc(q)+'</b></td><td>'+esc(Object.keys(sup[q].obra).join(', '))+'</td>'+
         '<td class="n">'+sup[q].insp+'</td><td class="n">'+sup[q].cerr+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  /* trabajador SST del mes */
  var R=tcReps(ps), autores=tcTop(R.porAutor, 8);
  h+='<div class="tc-card"><h3>Trabajador SST del mes</h3>'+
     '<p class="sub">Quién levantó más reportes en '+TC.anio+'. Los anónimos no entran: no se puede premiar a quien no se sabe quién es.</p>';
  if(!autores.length){
    h+=tcVacio('Todavía no hay reportes con nombre. En la app el trabajador puede reportar con su nombre o en anónimo.');
  } else {
    h+='<div style="border:1px solid var(--t-aviso);border-radius:9px;padding:12px 14px;margin-bottom:14px;background:rgba(250,178,25,.07)">'+
       '<div style="font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--t-ambar);font-weight:800">Primero</div>'+
       '<div style="font-size:21px;font-weight:800;margin-top:3px">'+esc(autores[0].k)+'</div>'+
       '<div style="color:var(--t-mudo);font-size:13px">'+autores[0].v+' reporte'+(autores[0].v===1?'':'s')+' en el año</div></div>'+
       tcBarras(autores.slice(1).map(function(a){ return {et:a.k, v:a.v, tope:autores[0].v, txt:String(a.v), col:'var(--t-s1)'}; }));
  }
  h+='</div>';
  /* amonestaciones */
  var am=[]; ps.forEach(function(p){ tcD(p.id).amon.forEach(function(x){ if(tcEnAnio(x.fecha)) am.push({p:p,x:x}); }); });
  var porMedida={}; am.forEach(function(o){ var k=(o.x.medida||'—').trim(); porMedida[k]=(porMedida[k]||0)+1; });
  var pm=tcTop(porMedida,6);
  h+='<div class="tc-card"><h3>Amonestaciones de '+TC.anio+'</h3>'+
     '<p class="sub">Cuántas y de qué tipo. Muchas amonestaciones leves de lo mismo suelen ser un problema de la tarea, no de la persona.</p>'+
     (am.length ? ('<div style="font-size:32px;font-weight:800">'+am.length+'</div>'+
                   tcBarras(pm.map(function(a){ return {et:a.k, v:a.v, tope:pm[0].v, txt:String(a.v), col:'var(--t-aviso)'}; })))
                : tcVacio('Ninguna amonestación registrada este año.'))+'</div>';
  /* buenas practicas */
  var bp=[]; ps.forEach(function(p){ tcD(p.id).buenas.forEach(function(x){ if(tcEnAnio(x.fecha)) bp.push({p:p,x:x}); }); });
  h+='<div class="tc-card"><h3>Buenas prácticas reconocidas</h3>'+
     '<p class="sub">Lo que salió bien en una obra y se puede repetir en las otras.</p>';
  if(!bp.length){ h+=tcVacio('Todavía ninguna. Es la otra mitad del registro: si solo se anota lo malo, el equipo aprende a esconder.'); }
  else {
    h+=bp.sort(function(a,b){ return String(b.x.fecha).localeCompare(String(a.x.fecha)); }).slice(0,6).map(function(o){
      return '<div style="border-bottom:1px solid var(--t-regla2);padding:9px 0">'+
        '<b>\u2B50 '+esc(o.x.titulo)+'</b><div style="color:var(--t-mudo);font-size:12.5px;margin-top:3px">'+
        esc(o.p.nombre)+' · '+esc(fechaLarga(o.x.fecha)||o.x.fecha)+(o.x.autor?(' · '+esc(o.x.autor)):'')+'</div></div>';
    }).join('');
  }
  h+='</div>';
  /* personal que se movio de proyecto */
  var porDni={};
  TC.proy.forEach(function(p){ tcD(p.id).trab.forEach(function(w){
    var dni=String(w.dni||'').replace(/[^0-9A-Za-z]/g,'').toUpperCase(); if(!dni) return;
    porDni[dni]=porDni[dni]||{nombre:w.nombre, obras:{}};
    porDni[dni].obras[p.nombre]=1;
  }); });
  var mov=Object.keys(porDni).filter(function(d){ return Object.keys(porDni[d].obras).length>1; });
  h+='<div class="tc-card ancha"><h3>Personal que aparece en más de un proyecto</h3>'+
     '<p class="sub">Se cruza por documento de identidad: es lo único que no cambia cuando el mismo trabajador pasa de una obra a otra. '+
     'Su kardex, sus capacitaciones y sus credenciales tienen que viajar con él.</p>';
  if(!mov.length){ h+=tcVacio('Ningún trabajador está registrado en dos obras a la vez. Si alguno se movió y no aparece aquí, es que lo cargaron con otro documento.'); }
  else {
    h+='<div class="tc-scroll"><table class="tc-tab"><thead><tr><th>Trabajador</th><th>Documento</th><th>Obras</th></tr></thead><tbody>';
    mov.slice(0,40).forEach(function(d){
      h+='<tr><td><b>'+esc(porDni[d].nombre||'—')+'</b></td><td>'+esc(d)+'</td>'+
         '<td>'+esc(Object.keys(porDni[d].obras).join(' · '))+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  /* supervisores nombrados */
  var inv=[]; TC.proy.forEach(function(p){ tcD(p.id).inv.forEach(function(i){ inv.push({p:p,i:i}); }); });
  h+='<div class="tc-card ancha"><h3>Supervisores que nombraste</h3>'+
     '<p class="sub">Cada invitación dice a qué obra lo mandaste y desde cuándo. Es la delegación escrita.</p>';
  if(!inv.length){ h+=tcVacio('Todavía no has nombrado a nadie. Se hace desde <b>Nombrar supervisores</b>, en tu inicio.'); }
  else {
    h+='<div class="tc-scroll"><table class="tc-tab"><thead><tr><th>Persona</th><th>Empresa</th><th>Obra encargada</th>'+
       '<th>Desde</th><th>Papel</th><th>Estado</th></tr></thead><tbody>';
    inv.forEach(function(o){
      h+='<tr><td><b>'+esc(o.i.nombre||o.i.correo)+'</b><br><small style="color:var(--t-mudo)">'+esc(o.i.correo)+'</small></td>'+
         '<td>'+esc(o.p.nombre)+'</td><td>'+esc(o.i.proyecto||'—')+'</td>'+
         '<td>'+esc(o.i.desde?fechaLarga(String(o.i.desde).slice(0,10)):'—')+'</td>'+
         '<td>'+(o.i.papel==='colider'?'<b style="color:var(--t-ambar)">segundo líder</b>':'supervisor')+'</td>'+
         '<td>'+(o.i.usada_en?tcEst('ok','ya entró'):tcEst('av','sin usar'))+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  return h+'</div>';
}

/* ══ 6 · DOCUMENTOS ══ */
var TC_DOC_PROY=[
  {h:'prog-anual',        n:'Plan y programa anual de SST'},
  {h:'iperc',             n:'IPERC de línea base'},
  {h:'pma',               n:'Mapa de riesgos'},
  {h:'prog-capacitacion', n:'Programa de capacitaciones'},
  {h:'prog-inspeccion',   n:'Programa de inspecciones'},
  {h:'plan-emergencia',   n:'Plan de respuesta ante emergencias'},
  {h:'comite',            n:'Comité / Supervisor de SST'}
];
function tcPagDocs(){
  var h='<div class="tc-rej">';
  h+='<div class="tc-card ancha"><h3>De la empresa</h3>'+
     '<p class="sub">Estos dos son uno solo para toda la empresa, no cambian de obra en obra. Basta con tenerlos cargados en un proyecto.</p>'+
     '<table class="tc-tab"><tbody>'+
     TC_DOC_EMP.map(function(x){
       var m=tcDocEmpBuscar(x.h);
       return '<tr><td><b>'+esc(x.n)+'</b>'+(m?('<br><small style="color:var(--t-mudo)">cargado en '+esc(m.p.nombre)+'</small>'):'')+'</td>'+
              '<td class="n">'+(m? tcEst('ok', String(m.creado||'').slice(0,10)) : tcEst('cr','sin cargar'))+'</td></tr>';
     }).join('')+
     '</tbody></table>'+
     '<div class="tc-nota" style="margin-top:12px">La política contra el hostigamiento sexual va en la misma hoja de <b>Políticas</b>. '+
     'Se cargan desde el inicio del supervisor: Carpetas del sistema de gestión ▸ Políticas / RISST.</div></div>';
  h+='<div class="tc-card ancha"><h3>De cada proyecto</h3>'+
     '<p class="sub">Estos sí son distintos en cada obra: el plan de una refinería no es el de un metro. Una columna por proyecto.</p><div class="tc-scroll">'+
     '<table class="tc-tab"><thead><tr><th>Documento</th>'+
     TC.proy.map(function(p){ return '<th class="n">'+esc(p.nombre)+'</th>'; }).join('')+'</tr></thead><tbody>';
  TC_DOC_PROY.forEach(function(x){
    h+='<tr><td><b>'+esc(x.n)+'</b></td>';
    TC.proy.forEach(function(p){
      var hay=tcD(p.id).docs.some(function(d){ return d.hoja===x.h; });
      h+='<td class="n">'+(hay? '<span style="color:var(--t-ok-tx)">\u2713</span>' : '<span style="color:var(--t-mudo)">\u2014</span>')+'</td>';
    });
    h+='</tr>';
  });
  h+='</tbody></table></div>'+
     '<div class="tc-nota" style="margin-top:12px">Un guion no quiere decir que el documento no exista: quiere decir que no está cargado en OBRASST. '+
     'El día de una fiscalización, lo que no está cargado es lo que no se puede mostrar.</div></div>';
  return h+'</div>';
}

/* ══ exportar ══ */
function tcFilas(){
  var ps=tcSel(), mes=TC.mes||mesISO(), f=[];
  f.push(['TORRE DE CONTROL SSOMA']);
  f.push(['Empresa', (_torEmp()||{}).nombre||'']);
  f.push(['Cierre', mesBonito(mes)]);
  f.push(['Año', TC.anio]);
  f.push(['Generado', fechaLarga(hoyISO())]);
  f.push([]);
  f.push(['ÍNDICES DEL AÑO']);
  var I=tcIndices(ps);
  f.push(['Horas hombre trabajadas', I.hht||'sin dato']);
  f.push(['Accidentes que cuentan (incapacitantes y mortales)', I.n]);
  f.push(['Días perdidos', I.dias]);
  f.push(['Índice de frecuencia (IF)', I.IF===null?'sin dato':I.IF.toFixed(2)]);
  f.push(['Índice de severidad (IS)', I.IS===null?'sin dato':I.IS.toFixed(1)]);
  f.push(['Índice de accidentabilidad (IA)', I.IA===null?'sin dato':I.IA.toFixed(2)]);
  f.push([]);
  f.push(['PROYECTO POR PROYECTO — '+mesBonito(mes)]);
  f.push(['Proyecto','Código','Sector','Inspecciones hechas','Inspecciones que exige',
          'Reportes del mes','Reportes abiertos','Capacitaciones','EPP entregado','EPP perdido',
          'Personal activo','Días sin accidentes']);
  TC.proy.forEach(function(p){
    var d=tcD(p.id), e=tcEPP([p],mes), rep=0, ab=0, cap=0;
    d.rep.forEach(function(r){ if(String(r.fecha||'').slice(0,7)===mes){ rep++; if(r.estado!=='atendido') ab++; } });
    d.cons.forEach(function(c){ if(String(c.fecha||'').slice(0,7)===mes) cap++; });
    var ra=tcRachas([p])[0];
    f.push([p.nombre, p.codigo||'', p.sector||'', tcInspHechas(p,mes), tcInspToca(p), rep, ab, cap,
            e.tot, e.P, d.trab.filter(function(w){return (w.estatus||'activo')==='activo';}).length,
            (ra&&ra.dias!==null)?ra.dias:'sin registro']);
  });
  f.push([]);
  f.push(['ACCIDENTES DEL AÑO']);
  f.push(['Fecha','Proyecto','Clase','Trabajador','Lugar','Días perdidos','Medidas correctivas']);
  tcAccs(ps).forEach(function(o){
    f.push([o.x.fecha, o.p.nombre, accClase(o.x.clase).n, o.x.t_nombre||'', o.x.lugar||'',
            parseInt(o.x.dias,10)||0, String(o.x.medidas||'').trim()?'escritas':'FALTAN']);
  });
  return f;
}
function tcExcel(){
  var f=tcFilas();
  var csv=f.map(function(fila){
    return fila.map(function(c){
      var t=String(c===undefined||c===null?'':c);
      return /[";\n]/.test(t) ? '"'+t.replace(/"/g,'""')+'"' : t;
    }).join(';');
  }).join('\r\n');
  var b=new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(b);
  a.download='torre-ssoma-'+(TC.mes||mesISO())+'.csv';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 800);
  _torAviso('Excel listo','Se descargó el archivo. Ábrelo con Excel: ya viene separado por punto y coma y con los acentos bien.','\uD83D\uDCC4');
}
function tcPDF(){
  /* el PDF sale de la impresion del navegador; la hoja de estilo de
     @media print ya deja fuera la cabecera, la columna y los filtros */
  try{ window.print(); }catch(e){}
}

/* ══ 7 · QUÉ MEDIR: los parámetros del gerente ══
   No es una pantalla aparte de la app: es una página más de la Torre.
   Salir a la app oscura para cambiar una meta y volver era un salto de
   mundo en medio de una reunión.                                     */
function tcPagCfg(){
  var g=tcCfg();
  function campo(id, et, val, paso, nota){
    return '<div style="margin-bottom:15px"><label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">'+esc(et)+'</label>'+
      '<input id="'+id+'" type="number" step="'+paso+'" value="'+val+'" '+
      'style="width:130px;padding:8px 10px;border:1px solid var(--t-regla);border-radius:7px;'+
      'font-size:15px;font-weight:700;font-family:inherit;background:var(--t-sup);color:var(--t-tinta);'+
      'font-variant-numeric:tabular-nums">'+
      (nota?'<div style="font-size:11.5px;color:var(--t-mudo);margin-top:5px;line-height:1.5">'+nota+'</div>':'')+'</div>';
  }
  var h='<div class="tc-rej">';
  h+='<div class="tc-card"><h3>Tus metas</h3>'+
     '<p class="sub">Son tuyas, no de la app. Se guardan en el servidor: si las cambias aquí, tu supervisor las ve igual desde la obra.</p>'+
     campo('tcf-if','Meta del índice de frecuencia (IF)', g.metaIF, '0.1',
           'Accidentes incapacitantes por millón de horas hombre. En construcción se suele trabajar con 3.')+
     campo('tcf-is','Meta del índice de severidad (IS)', g.metaIS, '1',
           'Días perdidos por millón de horas hombre.')+
     campo('tcf-cump','Cumplimiento que consideras «al día» (%)', g.metaCump, '1',
           'Debajo de este porcentaje, las inspecciones del mes salen en rojo.')+
     campo('tcf-perd','Pérdida de EPP aceptable (%)', g.metaPerd, '1',
           'Sobre este porcentaje, la pérdida deja de ser normal y se marca.')+
     campo('tcf-dias','Un reporte se atrasa después de (días)', g.diasRep, '1',
           'Es lo que decide qué sale en «Necesita tu decisión».')+
     '</div>';
  h+='<div class="tc-card"><h3>Qué tarjetas quieres arriba</h3>'+
     '<p class="sub">Si un indicador no te sirve, quítalo y deja de ocupar pantalla. El resto del tablero no cambia.</p>'+
     ['ifr|Índice de frecuencia','isv|Índice de severidad','racha|Racha más corta',
      'cump|Cumplimiento de inspecciones','epp|EPP entregado en el mes'].map(function(x){
       var k=x.split('|')[0], n=x.split('|')[1];
       return '<label style="display:flex;align-items:center;gap:10px;padding:9px 0;font-size:13.5px;'+
         'font-weight:600;border-bottom:1px solid var(--t-regla2);cursor:pointer">'+
         '<input type="checkbox" id="tcv-'+k+'" '+(g.ver[k]?'checked':'')+' style="width:16px;height:16px;margin:0">'+
         esc(n)+'</label>';
     }).join('')+
     '<div id="tcf-msg" style="font-size:12.5px;margin:16px 0 10px;min-height:18px"></div>'+
     '<button class="tc-bt" style="background:var(--t-marca);border-color:var(--t-marca);padding:9px 18px;font-size:13.5px" onclick="guardarTorreCfg()">Guardar</button> '+
     '<button class="tc-bt" style="background:var(--t-sup);color:var(--t-tinta2);border-color:var(--t-regla);padding:9px 16px;font-size:13.5px" onclick="reiniciarTorreCfg()">Volver a lo de fábrica</button>'+
     '</div>';
  return h+'</div>';
}
function guardarTorreCfg(){
  var g=tcCfg(), m=$('tcf-msg');
  g.metaIF=parseFloat($('tcf-if').value)||3;
  g.metaIS=parseFloat($('tcf-is').value)||50;
  g.metaCump=parseInt($('tcf-cump').value,10)||95;
  g.metaPerd=parseInt($('tcf-perd').value,10)||10;
  g.diasRep=parseInt($('tcf-dias').value,10)||7;
  ['ifr','isv','racha','cump','epp'].forEach(function(k){ g.ver[k]=$('tcv-'+k).checked?1:0; });
  m.style.color='var(--t-mudo)'; m.textContent='Guardando…';
  tcCfgGuardar().then(function(ok){
    m.style.color = ok ? 'var(--t-ok)' : 'var(--t-critico)';
    m.textContent = ok ? 'Guardado para toda la empresa.' : 'Se aplicó aquí, pero no se pudo guardar en el servidor (¿sin internet?).';
    setTimeout(function(){ tcVer('resumen'); }, 800);
  });
}
function reiniciarTorreCfg(){
  TC_CFG=JSON.parse(JSON.stringify(TC_CFG_DEF));
  tcPintar();
}
/* lo que el HTML de la Torre llama al tocar */
window.guardarTorreCfg = guardarTorreCfg;
window.reiniciarTorreCfg = reiniciarTorreCfg;
window.tcExcel = tcExcel;
window.tcFiltro = tcFiltro;
window.tcPDF = tcPDF;
window.tcPonerMes = tcPonerMes;
window.tcRail = tcRail;
window.tcRefrescar = tcRefrescar;
window.tcSalir = tcSalir;
window.tcVer = tcVer;
return {
  estado: function(){ return TC; }, entrar: tcEntrar, pintar: tcPintar, cargar: tcCargar, refrescar: tcRefrescar, reloj: tcReloj,
  PAGS: TC_PAGS,
  /* lo que el «Resumen ejecutivo» de la web pinta con sus tarjetas de siempre: las cuentas de la Torre, las mismas */
  calc: { pulso:tcPulso, indices:tcIndices, rachas:tcRachas, epp:tcEPP, reps:tcReps, inspToca:tcInspToca, inspHechas:tcInspHechas,
          alertas:tcAlertas, cfg:tcCfg, cfgGuardar:tcCfgGuardar, cfgDef:function(){ return JSON.parse(JSON.stringify(TC_CFG_DEF)); },
          sel:tcSel, d:tcD, accs:tcAccs, accClase:accClase, esAprobado:esAprobado, enAnio:tcEnAnio,
          fallos:function(){ return TC_FALLO; }, num:tcNum, mesBonito:mesBonito, mesISO:mesISO } };
})();
