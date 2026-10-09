/* OBRASST · la autorización del grupo sanguíneo (el texto, su huella y el PDF), para el portal.
   Lo arma armar.py desde autorizacion-base.js (el mismo de la app). No editar. */
/* ══════════════════════════════════════════════════════════════════
   LA AUTORIZACIÓN DEL GRUPO SANGUÍNEO · lo común de la app y del portal (08/10/2026)

   Marcelo: «hay que agregar en app y web el formato de autorización para
   poder tener su tipo de sangre, y tener la opción de imprimirlo o que el
   trabajador lo autorice desde la app, más rápido y fácil, donde tenga
   que firmar esa autorización».

   · El grupo sanguíneo es un dato de salud: un dato sensible (Ley N.°
     29733, art. 2.5). Se registra solo con la autorización del trabajador,
     por escrito (art. 13.6 de la ley; art. 8 del Reglamento, D.S. N.°
     016-2024-JUS: firma manuscrita, digital, electrónica u otra que
     garantice su voluntad) y la puede revocar cuando quiera, sin dar
     razones, gratis, y la empresa deja de usarlo en no más de 10 días hábiles
     (art. 10 del reglamento).
   · El texto (AUT_VERSION) dice con palabras simples lo que el art. 6.1
     del reglamento manda informar: quién es el responsable, su domicilio
     y dónde revocar; para qué; quién lo verá; el banco de datos; que es
     voluntario y qué pasa si no lo da; dónde se guarda (São Paulo: flujo
     transfronterizo); que no se usa para decisiones automáticas; cuánto
     se conserva; y cómo ejercer sus derechos. Es el MISMO en el celular
     del trabajador, en la pantalla donde firma con el supervisor y en el
     formato para imprimir; su huella queda con la firma.
   · Tres maneras de firmarla: en su celular (con su usuario y su PIN), en
     la pantalla del supervisor, o en papel (el formato impreso, y su foto
     si se quiere). Las tres quedan en sst_autorizacion, que no se borra
     ni se reescribe: la última decisión es la que vale.
   No toca la pantalla ni el servidor: recibe datos, devuelve el texto y el PDF.
   ══════════════════════════════════════════════════════════════════ */
var AUT_VERSION = 'GS-1';
var AUT_GRUPOS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
var AUT_CANAL = { app:'En su celular (app OBRASST)', pantalla:'En la pantalla del supervisor', papel:'En papel' };
var AUT_ESTADO = { firmada:'Autorizó', negada:'No autorizó', revocada:'Revocó', pedida:'Se le pidió' };
function autGrupo(s){ s=String(s||'').toUpperCase().replace(/\s+/g, '').replace(/[−–]/g, '-'); return AUT_GRUPOS.indexOf(s) > -1 ? s : ''; }
function autGrupoTxt(s){ return autGrupo(s).replace(/-$/, '–'); }

/* lo que va en el texto: la empresa (responsable) y el trabajador */
function autDatos(o){
  o=o||{};
  var t=function(v, n){ return String(v==null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n||160); };
  return { razon:t(o.razon), ruc:t(o.ruc, 20), dom:t(o.dom, 200), obra:t(o.obra), banco:t(o.banco, 60), contacto:t(o.contacto, 120),
           nombre:t(o.nombre, 120), doc:t(o.doc, 20), td:t(o.td, 30) || 'DNI', cargo:t(o.cargo, 80), sangre:autGrupo(o.sangre) };
}
/* ¿puede pedirse ya? El responsable y su domicilio son lo primero que el trabajador tiene que saber */
function autFaltaEmpresa(d){ var f=[]; if(!d.razon) f.push('la razón social'); if(!d.dom) f.push('el domicilio'); return f; }

/* ══ EL TEXTO ═══════════════════════════════════════════════════════
   → { titulo, intro, puntos:[{ t, x }], base } ; con «blanco» (el formato para llenar a mano) van rayas */
function autTexto(d, op){
  d=autDatos(d); op=op||{};
  var R=d.razon || 'la empresa', Rp=/\.$/.test(R) ? R : R+'.';
  var quien=d.nombre || (op.blanco ? '______________________________________' : 'el trabajador');
  var doc=d.doc ? (d.td+' N.° '+d.doc) : (op.blanco ? d.td+' N.° ____________' : '');
  var resp=R+(d.ruc ? ' (RUC '+d.ruc+')' : '')+(d.dom ? ', con domicilio en '+d.dom : '');
  var donde=d.contacto || ('el área de seguridad y salud en el trabajo de '+R+(d.dom ? ', en '+d.dom : ''));
  return {
    titulo:'Autorización para el tratamiento de mi grupo sanguíneo',
    intro:'Yo, '+quien+(doc ? ', con '+doc : '')+', autorizo a '+resp+', a registrar y usar mi grupo sanguíneo'+
          (d.sangre ? ' ('+autGrupoTxt(d.sangre)+')' : '')+' para lo que se explica aquí.',
    puntos:[
      { t:'Para qué', x:'Para que, si sufro un accidente o una emergencia en el trabajo, la brigada, quien me dé los primeros auxilios y el servicio de salud que me atienda sepan mi grupo sanguíneo de inmediato.' },
      { t:'Dónde va y quién lo verá', x:'Va en mi ficha de personal, en mi credencial (dentro de su código QR y en el carné) y en el sticker de mi casco. Lo verán el área de seguridad y salud en el trabajo de '+R+', la brigada de emergencia, el servicio de salud que me atienda y cualquier persona que mire mi casco o escanee mi QR: está hecho para que se vea rápido en una emergencia.' },
      { t:'Dónde se guarda', x:'En el banco de datos de personal de '+R+(d.banco ? ' (código de inscripción '+d.banco+')' : '')+', que la empresa lleva con el aplicativo OBRASST. Los datos se guardan en servidores de Supabase en São Paulo, Brasil, que Descarga Nomás (la empresa que hace OBRASST) usa por encargo de '+R+': es un flujo transfronterizo de datos. No se entregan a otras empresas.' },
      { t:'Es voluntario', x:'Darlo es voluntario. Si no lo autorizo, no se registra ni se imprime y en esos lugares dirá «sin dato». Eso no afecta mi trabajo, mi credencial ni ningún otro registro.' },
      { t:'Nada automático', x:'Mi grupo sanguíneo no se usa para tomar decisiones automáticas ni para hacer perfiles sobre mí.' },
      { t:'Cuánto tiempo', x:'Se conserva mientras trabaje en '+R+' o hasta que revoque esta autorización, lo que ocurra primero. Después se quita de mi ficha, de mi credencial y de los stickers nuevos. La constancia de esta autorización, y la de su revocación, se guardan como prueba de lo que decidí.' },
      { t:'Puedo revocarla', x:'Cuando quiera, sin dar razones y sin costo: desde mi app OBRASST o por escrito ante '+donde+'. La empresa deja de usar el dato en un plazo no mayor de diez días hábiles.' },
      { t:'Mis derechos', x:'Puedo pedir acceso, rectificación, cancelación u oposición sobre mis datos ante '+Rp+' Si no me atienden, puedo reclamar ante la Autoridad Nacional de Protección de Datos Personales.' }
    ],
    base:'El grupo sanguíneo es un dato sensible: se trata solo con mi autorización por escrito (Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento, D.S. N.° 016-2024-JUS).'
  };
}
function autTextoPlano(d){
  var T=autTexto(d);
  return [AUT_VERSION, T.titulo, T.intro].concat(T.puntos.map(function(p){ return p.t+': '+p.x; })).concat([T.base]).join('\n');
}
/* la huella del texto que leyó (FNV-1a de 64 bits, en hexadecimal): si el texto cambia, cambia */
function autHuella(s){
  s=String(s||'');
  var h1=0x811c9dc5, h2=0x01000193 ^ 0x5bd1e995;
  for(var i=0;i<s.length;i++){
    var c=s.charCodeAt(i);
    h1^=c; h1=Math.imul(h1, 0x01000193)>>>0;
    h2^=(c<<3)^(c>>>2); h2=Math.imul(h2, 0x5bd1e995)>>>0;
  }
  return ('00000000'+h1.toString(16)).slice(-8)+('00000000'+h2.toString(16)).slice(-8);
}

/* ══ EN QUÉ QUEDÓ CADA UNO ══════════════════════════════════════════
   filas de sst_autorizacion → { trabajador: { ultima (la última decisión: firmada/negada/revocada), pedida (una
   pendiente, más nueva que la última decisión), hist (todas, de la más nueva a la más vieja) } }
   llave: por qué se agrupa ('trabajador', el id de la ficha en el servidor; o 'ext', la llave de la ficha en la app) */
function _autCuando(r){ return String((r && (r.cuando || r.creado)) || ''); }
function autPorTrabajador(filas, llave){
  var m={}; llave=llave || 'trabajador';
  (filas||[]).slice().sort(function(a, b){ var x=_autCuando(b), y=_autCuando(a); return x<y ? -1 : (x>y ? 1 : String(b.creado||'').localeCompare(String(a.creado||''))); })
    .forEach(function(r){
      if(!r || !r[llave]) return;
      var k=String(r[llave]), e=m[k] || (m[k]={ ultima:null, pedida:null, hist:[] });
      e.hist.push(r);
      if(r.estado==='pedida'){ if(!e.ultima && !e.pedida) e.pedida=r; }
      else if(!e.ultima) e.ultima=r;
    });
  return m;
}
/* ¿se puede imprimir su grupo? → 'si' (firmó y no revocó) · 'no' (no autorizó o revocó) · '' (sin registro: lo de antes) */
function autVale(e){
  if(!e || !e.ultima) return '';
  return e.ultima.estado==='firmada' ? 'si' : 'no';
}
function autEstadoTexto(e){
  if(!e || (!e.ultima && !e.pedida)) return { k:'falta', t:'Sin autorización registrada', cl:'gris' };
  if(e.pedida) return { k:'pedida', t:'Pedida: falta que firme en su app', cl:'ojo' };
  var u=e.ultima;
  if(u.estado==='firmada'){ var cn=String(AUT_CANAL[u.canal]||''); return { k:'firmada', t:'Autorizó · '+cn.charAt(0).toLowerCase()+cn.slice(1), cl:'ok', g:autGrupo(u.sangre) }; }
  if(u.estado==='revocada') return { k:'revocada', t:'Revocó su autorización', cl:'mal' };
  return { k:'negada', t:'No autorizó', cl:'gris' };
}

/* ══ EL PDF ═════════════════════════════════════════════════════════ */
/* la fecha como la escribe la gente; si trae hora, en la hora de este equipo (a las 8 p. m. en Lima, en UTC ya es mañana) */
function _autFecha(iso){
  var s=String(iso||'');
  if(/T\d{2}:/.test(s)){ try{ var d=new Date(s); if(!isNaN(d)){ var z=function(v){ return (v<10 ? '0' : '')+v; }; return z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear(); } }catch(_e){} }
  var m=s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3]+'/'+m[2]+'/'+m[1] : '';
}
function _autFechaHora(iso){ try{ var d=new Date(iso); if(isNaN(d)) return _autFecha(iso); var z=function(v){ return (v<10 ? '0' : '')+v; }; return z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear()+' '+z(d.getHours())+':'+z(d.getMinutes()); }catch(e){ return _autFecha(iso); } }
/* la firma, en trazos (sin pasar por una imagen): {h, p:[[x,y,x,y…], …]} con el ancho en 1000 */
function autFirmaPDF(doc, tr, x, y, w, h){
  if(!tr || !tr.p || !tr.p.length) return false;
  var alto=tr.h || 380, m=Math.min(w, h)*0.06, k=Math.min((w-2*m)/1000, (h-2*m)/alto), ox=x+(w-1000*k)/2, oy=y+(h-alto*k)/2;
  doc.setDrawColor(11, 42, 54); doc.setLineWidth(Math.max(0.35, h/60)); doc.setLineCap && doc.setLineCap('round'); doc.setLineJoin && doc.setLineJoin('round');
  tr.p.forEach(function(q){ for(var i=2;i<q.length;i+=2) doc.line(ox+q[i-2]*k, oy+q[i-1]*k, ox+q[i]*k, oy+q[i+1]*k); });
  return true;
}
/* ctx: { emp:{ razon, ruc, dom, logo (dataURL), banco, contacto }, obra, fmt:{ cod, rev, fecha }, logoPDF:function(doc,x,y,w,h) }
   lista: [{ nombre, doc, td, cargo, sangre }] (vacía o con un {} = en blanco) · op.modo: 'formato' | 'constancia'
   En 'constancia' cada uno trae también reg (la fila de sst_autorizacion) y, si la hay, la foto del papel (fotoDU). */
function autPDF(lista, ctx, op){
  op=op||{}; ctx=ctx||{};
  var doc=new jspdf.jsPDF({ unit:'mm', format:'a4' }), W=210, H=297, M=14;
  var emp=ctx.emp||{}, L=(lista && lista.length) ? lista : [{}];
  L.forEach(function(p, i){ if(i) doc.addPage(); _autHoja(doc, p||{}, ctx, emp, op, W, H, M); });
  return doc;
}
function _autHoja(doc, p, ctx, emp, op, W, H, M){
  var cons=op.modo==='constancia', reg=p.reg||null, blanco=!cons && !p.nombre;
  var d=autDatos({ razon:emp.razon, ruc:emp.ruc, dom:emp.dom, obra:ctx.obra, banco:emp.banco, contacto:emp.contacto,
                   nombre:p.nombre, doc:p.doc, td:p.td, cargo:p.cargo, sangre:cons && reg ? reg.sangre : p.sangre });
  var T=autTexto(d, { blanco:blanco }), AZUL=[11,42,58], ORO=[245,183,0], ROJO=[198,40,40], GRIS=[95,105,114], NEGRO=[28,34,40];
  /* la cabecera de la empresa (la de los formatos de la app) */
  doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]); doc.rect(0, 0, W, 24, 'F');
  doc.setFillColor(ORO[0], ORO[1], ORO[2]); doc.rect(0, 24, W, 1.3, 'F');
  var xT=M;
  if(emp.logo){
    try{
      doc.setFillColor(255, 255, 255); doc.roundedRect(M, 4.5, 32, 15, 1.8, 1.8, 'F');
      if(typeof ctx.logoPDF==='function') ctx.logoPDF(doc, M+1.5, 5.8, 29, 12.4);
      else doc.addImage(emp.logo, /^data:image\/png/i.test(emp.logo) ? 'PNG' : 'JPEG', M+1.5, 5.8, 29, 12.4, undefined, 'FAST');
      xT=M+36;
    }catch(_l){ xT=M; }
  }
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text(doc.splitTextToSize(String(d.razon || d.obra || 'OBRASST').toUpperCase(), W-xT-58)[0], xT, 11.5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); doc.setTextColor(203, 220, 230);
  doc.text('Sistema de Gestión de Seguridad y Salud en el Trabajo', xT, 17);
  var f=ctx.fmt||{}, ls=[];
  if(f.cod){ ls.push('Código: '+f.cod); ls.push('Versión: '+(f.rev || '00')); if(f.fecha) ls.push('Fecha: '+_autFecha(f.fecha)); }
  doc.setFontSize(6.6); ls.forEach(function(t, i){ doc.text(t, W-M, 9+i*3.6, { align:'right' }); });
  /* el título */
  var y=33;
  doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]); doc.setFont('helvetica', 'bold'); doc.setFontSize(13.2);
  doc.text(T.titulo.toUpperCase(), W/2, y, { align:'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
  doc.text(cons ? 'Constancia · dato sensible · texto '+AUT_VERSION : 'Formato · dato sensible · texto '+AUT_VERSION, W/2, y+4.6, { align:'center' });
  /* los datos del trabajador */
  y+=9;
  doc.setDrawColor(214, 221, 227); doc.setLineWidth(0.3); doc.setFillColor(246, 248, 250);
  doc.roundedRect(M, y, W-2*M, 22, 2, 2, 'FD');
  function campo(et, val, x, yy, w){
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]); doc.text(et.toUpperCase(), x, yy);
    doc.setFont('helvetica', val ? 'bold' : 'normal'); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    if(val){
      var tam=9.6, v=String(val); doc.setFontSize(tam);
      while(tam>7 && doc.getTextWidth(v)>w){ tam-=0.2; doc.setFontSize(tam); }
      while(v.length>1 && doc.getTextWidth(v)>w) v=v.slice(0, -2)+'…';
      doc.text(v, x, yy+4.4);
    }
    else { doc.setDrawColor(150, 158, 166); doc.setLineWidth(0.25); doc.line(x, yy+5, x+w, yy+5); }
  }
  campo('Apellidos y nombres', d.nombre, M+4, y+5, 92);
  campo(d.td || 'Documento', d.doc, M+102, y+5, 26);
  campo('Cargo', d.cargo, M+132, y+5, W-2*M-136);
  campo('Obra', d.obra, M+4, y+15, 92);
  /* el grupo: el que declara (escrito) o los ocho para marcar */
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4); doc.setTextColor(ROJO[0], ROJO[1], ROJO[2]); doc.text('MI GRUPO SANGUÍNEO', M+102, y+15);
  if(d.sangre){
    doc.setFillColor(ROJO[0], ROJO[1], ROJO[2]); doc.roundedRect(M+102, y+16, 18, 5.4, 1.2, 1.2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(10.5); doc.text(autGrupoTxt(d.sangre), M+111, y+20.3, { align:'center' });
  } else {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    AUT_GRUPOS.forEach(function(g, i){ var gx=M+102+i*9.6; doc.setDrawColor(120, 128, 136); doc.rect(gx, y+17, 2.8, 2.8, 'S'); doc.text(autGrupoTxt(g), gx+3.6, y+19.4); });
  }
  /* el texto */
  y+=28;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.2); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
  var li=doc.splitTextToSize(T.intro, W-2*M); doc.text(li, M, y); y+=li.length*4.1+2.2;
  T.puntos.forEach(function(q, n){
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.6); doc.setTextColor(AZUL[0], AZUL[1], AZUL[2]);
    var et=(n+1)+'. '+q.t+'. ', we=doc.getTextWidth(et);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    var primera=doc.splitTextToSize(q.x, W-2*M-we)[0] || '', resto=q.x.slice(primera.length).trim();
    doc.setFont('helvetica', 'bold'); doc.setTextColor(AZUL[0], AZUL[1], AZUL[2]); doc.text(et, M, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]); doc.text(primera, M+we, y);
    y+=3.8;
    if(resto){ var lr=doc.splitTextToSize(resto, W-2*M); doc.text(lr, M, y); y+=lr.length*3.8; }
    y+=1.3;
  });
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7.8); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
  var lb=doc.splitTextToSize(T.base, W-2*M); doc.text(lb, M, y); y+=lb.length*3.4+3;
  /* la decisión y la firma */
  var est=cons && reg ? reg.estado : '';
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.6); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
  function casilla(x, yy, marcada, et){
    doc.setDrawColor(NEGRO[0], NEGRO[1], NEGRO[2]); doc.setLineWidth(0.35); doc.rect(x, yy-3.4, 4, 4, 'S');
    if(marcada){ doc.setLineWidth(0.6); doc.line(x+0.8, yy-1.5, x+1.7, yy-0.4); doc.line(x+1.7, yy-0.4, x+3.4, yy-2.9); }
    doc.text(et, x+5.6, yy);
  }
  casilla(M, y+1, est==='firmada', 'SÍ AUTORIZO');
  casilla(M+48, y+1, est==='negada', 'NO AUTORIZO');
  y+=6;
  var fy=y, fh=24;
  doc.setDrawColor(150, 158, 166); doc.setLineWidth(0.3); doc.roundedRect(M, fy, 82, fh, 1.6, 1.6, 'S');
  if(cons && reg && reg.firma) autFirmaPDF(doc, reg.firma, M+1, fy+1, 80, fh-2);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
  doc.text('Firma del trabajador', M+41, fy+fh+3.4, { align:'center' });
  if(!cons || !reg || reg.canal==='papel'){
    doc.roundedRect(M+86, fy, 26, fh, 1.6, 1.6, 'S');
    doc.text('Huella (opcional)', M+99, fy+fh+3.4, { align:'center' });
  }
  var dx=M+118;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4); doc.text('FECHA', dx, fy+4);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.4); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
  if(cons && reg && reg.cuando) doc.text(_autFechaHora(reg.cuando), dx, fy+9.2);
  else { doc.setDrawColor(150, 158, 166); doc.line(dx, fy+9.6, W-M, fy+9.6); doc.setFontSize(7); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]); doc.text('día / mes / año', dx, fy+12.6); }
  if(cons && reg){
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]); doc.text('CÓMO SE FIRMÓ', dx, fy+16);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    var cm=(AUT_CANAL[reg.canal] || '')+(reg.canal==='pantalla' && reg.quien_nombre ? ', con '+reg.quien_nombre : '')+(reg.canal==='app' ? ', con su usuario y su PIN' : '');
    doc.text(doc.splitTextToSize(cm, W-M-dx).slice(0, 2), dx, fy+19.6);
  }
  y=fy+fh+8;
  /* en la constancia: lo que la respalda */
  if(cons && reg){
    doc.setDrawColor(214, 221, 227); doc.setFillColor(246, 248, 250); doc.roundedRect(M, y, W-2*M, 15, 1.6, 1.6, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    var l1='Registro '+String(reg.id || '').slice(0, 36)+' · texto '+(reg.version || AUT_VERSION)+(reg.texto_hash ? ' · huella del texto '+reg.texto_hash : '');
    var l2=(reg.estado==='firmada' ? 'Autorizó' : (reg.estado==='negada' ? 'No autorizó' : (reg.estado==='revocada' ? 'Revocó' : 'Pedida')))+' el '+_autFechaHora(reg.cuando)+
           (reg.quien_nombre && reg.canal!=='app' ? ' · lo registró '+reg.quien_nombre : '')+(p.revocada ? ' · REVOCADA el '+_autFechaHora(p.revocada) : '');
    doc.text(doc.splitTextToSize(l1, W-2*M-6)[0], M+3, y+5.4); doc.text(doc.splitTextToSize(l2, W-2*M-6)[0], M+3, y+10.4);
    y+=19;
    if(p.fotoDU){
      try{ var r=p.fotoR || 0.75, fw=Math.min(60, (H-14-y)*r), fh2=fw/r; if(fh2>18){ doc.addImage(p.fotoDU, /^data:image\/png/i.test(p.fotoDU) ? 'PNG' : 'JPEG', M, y, fw, fh2, undefined, 'FAST'); doc.setFontSize(7); doc.text('Foto del formato firmado en papel', M+fw+3, y+4); } }catch(_f){}
    }
  } else if(!cons){
    /* para revocar en papel: se corta y se entrega */
    if(y<H-38){
      doc.setLineDashPattern([1.4, 1.2], 0); doc.setDrawColor(150, 158, 166); doc.line(M, y, W-M, y); doc.setLineDashPattern([], 0);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.4); doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]); doc.text('REVOCACIÓN', M, y+5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      var rv=doc.splitTextToSize('Yo, '+(d.nombre || '______________________________')+(d.doc ? ', '+d.td+' N.° '+d.doc : '')+', revoco esta autorización: '+(d.razon || 'la empresa')+' debe quitar mi grupo sanguíneo de mi ficha, de mi credencial y de los stickers.', W-2*M);
      doc.text(rv, M, y+9.4);
      var ry=y+9.4+rv.length*3.6+6;
      doc.setDrawColor(150, 158, 166); doc.line(M, ry, M+70, ry); doc.line(M+90, ry, M+130, ry);
      doc.setFontSize(7); doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]); doc.text('Firma', M, ry+3.2); doc.text('Fecha', M+90, ry+3.2);
    }
  }
  /* el pie */
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.6); doc.setTextColor(140, 140, 140);
  doc.text('Responsable del tratamiento: '+(d.razon || '—')+(d.ruc ? ' · RUC '+d.ruc : '')+' · Hecho con OBRASST · '+AUT_VERSION, W/2, H-7, { align:'center' });
}
