/* ══════════════════════════════════════════════════════════════════════════════════════════
   OBRASST · el portal · «MÁS POR LA WEB» (07/10/2026)
   Marcelo: «también traer eso de entrega de EPP, amonestaciones, comité, trabajador del mes, buenas prácticas,
   credenciales y logo de la empresa».
   Lo que hasta hoy solo se hacía en el celular. Nada de esto es un registro aparte: cada cosa se guarda en la MISMA
   tabla y con la MISMA forma que la app, así que lo hecho aquí aparece en el celular, y lo del celular, aquí.
     1 · la entrega de EPP (sst_kardex): registrar una, y cargar el kardex anterior desde su Excel
     2 · los datos y el logo de la empresa (sst_doc, hoja «empleador»)
     3 · las buenas prácticas (sst_buena)
     4 · las amonestaciones (sst_amonestacion)
     5 · las credenciales (sst_estado «credenciales»)
     6 · el trabajador del mes (sst_puntaje; los puntos que se evalúan, en sst_doc «tdm-cfg»)
     7 · el comité de SST (sst_estado «comite_emp:<código de la obra>»)
     8 · «¿A quién acudo?» (los números de emergencia, el punto de reunión y la línea de mando, en el mismo documento
         del comité; y lo que se publica para los trabajadores: sst_doc, hoja «quienes»)
   Y de «el orden de la web» (07/10/2026): el sello «Capacitación al día» en la credencial (con el plan por puesto y
   las constancias de la obra) y la papeleta de la amonestación en Word (mas-word.js, el .docx de la app).
   Los topes del plan son los de la app (sst_uso): las entregas y las amonestaciones del mes, y las credenciales.
   Se pide con cargarMas() / masIr() y necesita gestion.js. Lo que dibuja un PDF o firma un código viene en mas-app.js,
   que armar.py saca de la app: cargarMasApp().
   ══════════════════════════════════════════════════════════════════════════════════════════ */
var MAS = { };
function _masCss(){
  if($('mas-css')) return;
  var st=document.createElement('style'); st.id='mas-css';
  st.textContent=[
    /* a quién: el elegido, con su ficha */
    '.mas-quien{display:flex;align-items:center;gap:11px;border:1px solid var(--raya);border-radius:10px;background:#F4F8FB;padding:9px 12px;margin:8px 0 0}',
    '.mas-quien b{display:block;color:var(--tinta);font-weight:600;overflow-wrap:anywhere}.mas-quien small{display:block;color:var(--gris);font-size:12.5px;line-height:1.35}',
    '.mas-quien .mas-quien-t{flex:1;min-width:0}',
    /* los renglones de la entrega */
    '.mas-lin{display:grid;gap:6px;margin:8px 0 0}',
    '.mas-lin-f{display:grid;grid-template-columns:minmax(0,1fr) 74px 86px 118px auto;gap:8px;align-items:center;border:1px solid var(--raya);border-radius:9px;background:var(--panel);padding:7px 9px}',
    '.mas-lin-f b{font-weight:500;color:var(--tinta);overflow-wrap:anywhere;font-size:13.5px}.mas-lin-f input,.mas-lin-f select{padding:7px 8px;font-size:13.5px;min-width:0;width:100%}',
    '.mas-lin-f input{text-align:right;font-variant-numeric:tabular-nums}',
    '.mas-lin-v{border:1px dashed var(--raya2);border-radius:9px;padding:12px;text-align:center;color:var(--gris);font-size:13.5px}',
    '.mas-otro{display:flex;gap:8px;margin:8px 0 0}.mas-otro input{flex:1;min-width:0}',
    '.mas-cupo{font-size:12.5px;color:var(--gris);margin:6px 0 0}.mas-cupo b{color:var(--tinta);font-weight:600}',
    '.mas-foto{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.mas-foto img{width:132px;height:99px;object-fit:cover;border-radius:9px;border:1px solid var(--raya);background:#fff}',
    '.mas-foto .acciones{margin:0;justify-content:flex-start}',
    /* los datos y el logo de la empresa */
    '.mas-logo{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin:6px 0 0}',
    '.mas-logo-v{width:132px;height:132px;border:1px solid var(--raya);border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:0 0 auto}',
    '.mas-logo-v img{max-width:100%;max-height:100%;object-fit:contain}.mas-logo-v span{font-size:12.5px;color:var(--gris2);text-align:center;padding:0 12px;line-height:1.4}',
    '.mas-logo .acciones{margin:0;justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:8px}',
    '.mas-cab{border:1px solid var(--raya2);border-radius:8px;background:#fff;display:grid;grid-template-columns:118px 1fr 132px;min-height:62px;font-size:12px;color:#333;overflow:hidden}',
    '.mas-cab>div{padding:8px 10px;display:flex;align-items:center;justify-content:center;text-align:center}.mas-cab>div+div{border-left:1px solid var(--raya2)}',
    '.mas-cab img{max-width:100%;max-height:44px;object-fit:contain}.mas-cab b{font-size:13px;color:#141414}.mas-cab .cod{flex-direction:column;align-items:flex-start;gap:2px;font-size:11px;color:#5a5a5a;text-align:left}',
    /* las tarjetas (buenas prácticas, credenciales) */
    '.mas-tarjs{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}',
    '.mas-t{display:flex;flex-direction:column;border:1px solid var(--raya);border-radius:12px;background:var(--panel);overflow:hidden;text-align:left;cursor:pointer;padding:0;font:inherit;color:inherit}',
    '.mas-t:hover{border-color:var(--raya2);box-shadow:0 1px 6px rgba(16,24,32,.07)}.mas-t:focus-visible{outline:2px solid var(--azul);outline-offset:2px}',
    '.mas-t-foto{aspect-ratio:16/9;background:#EEF2F5;display:flex;align-items:center;justify-content:center;font-size:34px;color:var(--gris2);overflow:hidden}.mas-t-foto img{width:100%;height:100%;object-fit:cover}',
    '.mas-t-c{padding:12px 14px 13px;display:flex;flex-direction:column;gap:5px;flex:1}',
    '.mas-t-c b{color:var(--tinta);font-weight:600;font-size:14.5px;line-height:1.35;overflow-wrap:anywhere}.mas-t-c small{color:var(--gris);font-size:12.5px;line-height:1.45}',
    '.mas-t-c p{margin:0;font-size:13px;color:var(--texto);line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}',
    '.mas-ver-foto{width:100%;max-height:420px;object-fit:contain;border-radius:10px;border:1px solid var(--raya);background:#fff;margin:0 0 12px}',
    '.mas-texto{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;margin:0}',
    /* el trabajador del mes: la cuadrilla del día, el podio y los puntos */
    '.tdm-f{display:inline-flex;gap:8px;align-items:center;font-size:13px;color:var(--gris);margin:0}.tdm-f input,.tdm-f select{width:auto;padding:7px 9px;font-size:13.5px}',
    '.tdm-caja{overflow:auto;max-height:62vh;border:1px solid var(--raya);border-radius:10px;background:var(--panel)}',
    '.tdm-t{border-collapse:separate;border-spacing:0;width:100%;font-size:13px}',
    '.tdm-t thead th{position:sticky;top:0;z-index:2;background:#FAFBFC;border-bottom:1px solid var(--raya);padding:8px 5px;font-size:10.5px;letter-spacing:.02em;text-transform:uppercase;color:var(--gris);font-weight:600;text-align:center;white-space:normal;min-width:62px;max-width:116px;overflow-wrap:break-word;line-height:1.25;vertical-align:bottom}',
    '.tdm-t thead th:first-child{text-align:left;min-width:190px;max-width:none;left:0;z-index:3}',
    '.tdm-t tbody th{position:sticky;left:0;z-index:1;background:var(--panel);text-align:left;padding:7px 10px;border-bottom:1px solid var(--raya);font-weight:400;min-width:190px;max-width:260px}',
    '.tdm-t tbody th b{display:block;font-weight:500;color:var(--tinta);overflow-wrap:anywhere}.tdm-t tbody th small{display:block;color:var(--gris);font-size:12px;line-height:1.3}',
    '.tdm-t td{border-bottom:1px solid var(--raya);padding:5px 4px;text-align:center;vertical-align:middle}.tdm-t tr:last-child td,.tdm-t tr:last-child th{border-bottom:0}',
    '.tdm-t tr.fuera th b,.tdm-t tr.fuera th small{color:var(--gris2)}.tdm-t tr.fuera .tdm-b{opacity:.3;pointer-events:none}',
    '.tdm-b{appearance:none;-webkit-appearance:none;width:38px;height:34px;border-radius:8px;border:1px solid var(--raya2);background:#fff;font-size:15px;line-height:1;cursor:pointer;color:var(--gris);font-weight:600}',
    '.tdm-b.si{background:var(--ok-f);border-color:#BFE3CE;color:var(--ok)}.tdm-b.no{background:var(--mal-f);border-color:#F0C9CC;color:var(--mal)}.tdm-b.mas{background:var(--ojo-f);border-color:#EED9A8}.tdm-b.na{color:var(--gris2)}',
    '.tdm-b:focus-visible{outline:2px solid var(--azul);outline-offset:1px}',
    '.tdm-n,.tdm-e{white-space:nowrap}.tdm-v input{width:18px;height:18px;margin:0;vertical-align:middle;cursor:pointer}',
    '.tdm-pie{position:sticky;bottom:0;z-index:5;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:space-between;background:var(--panel);border:1px solid var(--raya);border-radius:12px;padding:10px 14px;margin:12px 0 0;box-shadow:0 -2px 10px rgba(16,24,32,.06);font-size:13.5px}',
    '.tdm-pie b{color:var(--tinta)}.tdm-pie>span:first-child{flex:1 1 150px;min-width:0}.tdm-pie .msg{margin:0;min-height:0;flex:1 1 200px}.tdm-pie .msg:empty{display:none}',
    '.tdm-gana{display:flex;flex-wrap:wrap;gap:14px;align-items:center;border:1px solid #EED9A8;background:var(--ojo-f);border-radius:12px;padding:14px 16px;margin:0 0 14px}',
    '.tdm-gana .tdm-copa{font-size:34px;line-height:1}.tdm-gana>div{flex:1;min-width:200px;display:flex;flex-direction:column;gap:2px}.tdm-gana small{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--gris)}',
    '.tdm-gana b{font-size:19px;color:var(--tinta);font-weight:600;overflow-wrap:anywhere}.tdm-gana span{font-size:13.5px;color:var(--texto)}',
    '.tdm-podio{list-style:none;margin:0;padding:0;display:grid;gap:6px}',
    '.tdm-podio li{display:grid;grid-template-columns:30px minmax(0,1.3fr) minmax(70px,1fr) 46px 62px;gap:10px;align-items:center;border:1px solid var(--raya);border-radius:9px;background:var(--panel);padding:7px 10px;font-size:13.5px}',
    '.tdm-pos{width:26px;height:26px;border-radius:50%;background:var(--fondo);display:grid;place-items:center;font-weight:600;font-size:12.5px;color:var(--tinta)}.tdm-podio li:first-child .tdm-pos{background:#F5B700;color:#1B1400}',
    '.tdm-q b{display:block;font-weight:500;color:var(--tinta);overflow-wrap:anywhere}.tdm-q small{color:var(--gris);font-size:12px}',
    '.tdm-r{height:8px;border-radius:4px;background:var(--fondo);overflow:hidden}.tdm-r i{display:block;height:100%;background:var(--ok);border-radius:4px}.tdm-p{text-align:right;font-variant-numeric:tabular-nums;color:var(--tinta)}',
    '.tdm-reglas{margin-top:14px}.tdm-reglas summary{cursor:pointer;padding:12px 16px;font-size:13.5px;color:var(--tinta);font-weight:500}',
    '.tdm-pl{list-style:none;margin:0;padding:0;display:grid;gap:6px}.tdm-pf{display:flex;gap:12px;align-items:center;justify-content:space-between;border:1px solid var(--raya);border-radius:9px;background:var(--panel);padding:8px 10px;font-size:13.5px}',
    '.tdm-pf>span{flex:1;min-width:0;overflow-wrap:anywhere}.tdm-pf b{font-weight:500;color:var(--tinta)}.tdm-pf small{color:var(--gris)}',
    /* la credencial abierta */
    '.mas-cred{display:flex;gap:18px;align-items:center;flex-wrap:wrap;border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:14px 16px}',
    '.mas-cred-qr{width:148px;height:148px;flex:0 0 auto;background:#fff;border:1px solid var(--raya);border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden}.mas-cred-qr img{width:100%;height:100%;image-rendering:pixelated}.mas-cred-qr span{font-size:12px;color:var(--gris2);text-align:center;padding:8px}',
    '.mas-cred-d{flex:1;min-width:220px;display:flex;flex-direction:column;gap:5px;align-items:flex-start}.mas-cred-d b{font-size:18px;color:var(--tinta);font-weight:600;line-height:1.25;overflow-wrap:anywhere}.mas-cred-d small{font-size:13px;color:var(--gris)}',
    /* las cuatro firmas de la papeleta */
    '.mas-firmas{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}',
    '.mas-firma-c{border:1px solid var(--raya);border-radius:10px;background:var(--panel);padding:8px 10px 10px;display:flex;flex-direction:column;gap:6px;align-items:flex-start}',
    '.mas-firma-c b{font-size:13px;color:var(--tinta);font-weight:600}',
    '.mas-firma-i{width:100%;aspect-ratio:40/11;border-radius:7px;background:#fff;border:1px dashed var(--raya2);display:flex;align-items:center;justify-content:center;overflow:hidden}',
    '.mas-firma-c.ok .mas-firma-i{border-style:solid;border-color:var(--raya)}.mas-firma-i img{width:100%;height:100%;object-fit:contain}.mas-firma-i span{font-size:12px;color:var(--gris2)}',
    /* el comité: lo que le toca, el padrón, los doce meses, los acuerdos */
    '.mas-ley{font-size:12px;color:var(--gris)}',
    '.com-dos{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin:0 0 16px}.com-dos>.tarj{margin:0}',
    '.com-toca{border-color:#EED9A8}.com-nombre{font-size:17px;font-weight:600;color:var(--tinta);margin:0 0 6px;line-height:1.3}.com-dice{margin:0;font-size:13.5px;line-height:1.55;color:var(--texto)}',
    '.com-ojo{margin:10px 0 0;padding-left:10px;border-left:2px solid #F5B700;color:var(--gris);font-size:13px;line-height:1.5}',
    '.com-p{margin:0 0 7px;font-size:13.5px;color:var(--texto)}.com-rojo{color:var(--mal)}.com-ul{margin:8px 0 0;padding-left:18px}.com-ul li{margin:0 0 4px}',
    '.com-lados{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}',
    '.com-lado{border:1px solid var(--raya);border-radius:10px;padding:11px 13px;background:var(--panel);min-width:0}.com-lado>b{display:block;color:var(--tinta);font-weight:600;margin:0 0 5px;overflow-wrap:anywhere}.com-lado>small{display:block;font-size:12.5px;line-height:1.4}',
    '.com-m{display:flex;gap:6px;align-items:baseline;font-size:13.5px;padding:3px 0;line-height:1.4}.com-m i{font-style:normal;width:20px;flex:0 0 auto;text-align:center}.com-m>span{flex:1;min-width:0;overflow-wrap:anywhere}.com-m small{color:var(--gris);font-size:12.5px}.com-m em,.com-pf em{color:var(--gris);font-size:12.5px}',
    '.com-anio{width:auto;display:inline-block;padding:3px 8px;font:inherit;font-weight:600;margin-left:2px}',
    '.com-meses{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:6px;margin:0 0 8px}',
    '.com-mes{appearance:none;-webkit-appearance:none;position:relative;border:1px solid var(--raya2);border-radius:9px;background:var(--panel);padding:8px 2px 7px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;font:inherit;min-width:0;color:var(--gris)}',
    '.com-mes small{font-size:11px;letter-spacing:.03em;text-transform:uppercase}.com-mes b{font-size:15px;line-height:1;font-weight:600;color:var(--gris2)}.com-mes i{position:absolute;top:3px;right:5px;font-style:normal;font-size:10px;color:var(--gris)}',
    '.com-mes.hecha{border-color:#BFE3CE;background:var(--ok-f)}.com-mes.hecha b{color:var(--ok)}.com-mes.perdida{border-color:#F0C9CC;background:var(--mal-f)}.com-mes.perdida b{color:var(--mal)}',
    '.com-mes.toca{border-color:#EED9A8;background:var(--ojo-f)}.com-mes.toca b{color:var(--ojo)}.com-mes:hover{border-color:var(--gris2)}.com-mes:focus-visible{outline:2px solid var(--azul);outline-offset:1px}',
    '.com-acu{list-style:none;margin:0;padding:0;display:grid;gap:6px}.com-acu li{display:flex;gap:12px;align-items:center;justify-content:space-between;border:1px solid var(--raya);border-radius:9px;background:var(--panel);padding:8px 11px}',
    '.com-acu-t{flex:1;min-width:0;display:block;text-align:left;font:inherit;color:inherit;background:none;border:0;padding:0}button.com-acu-t{cursor:pointer}button.com-acu-t:hover b{text-decoration:underline}button.com-acu-t:focus-visible{outline:2px solid var(--azul);outline-offset:2px;border-radius:4px}',
    '.com-acu-t b{display:block;font-weight:500;color:var(--tinta);font-size:13.5px;line-height:1.4;overflow-wrap:anywhere}.com-acu-t small{display:block;color:var(--gris);font-size:12.5px;line-height:1.4;margin-top:1px}',
    '.com-lt{margin:12px 0 6px;font-size:13px;color:var(--gris)}.com-lt:first-child{margin-top:0}.com-lt b{color:var(--tinta);font-weight:600}',
    '.com-pl{list-style:none;margin:0 0 4px;padding:0;display:grid;gap:6px}.com-pf{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;border:1px solid var(--raya);border-radius:9px;background:var(--panel);padding:8px 10px;font-size:13.5px}',
    '.com-pf>span:first-child{flex:1 1 200px;min-width:0;overflow-wrap:anywhere}.com-pf b{font-weight:500;color:var(--tinta)}.com-pf small{display:block;color:var(--gris);font-size:12.5px}.com-pf .acciones{gap:6px}.com-pf .bt.on{background:var(--ojo-f);border-color:#EED9A8;color:var(--tinta)}',
    '.com-af{border:1px solid var(--raya);border-radius:10px;background:#FAFBFC;padding:10px 12px 12px;margin:0 0 8px}.com-af-c{display:flex;justify-content:space-between;align-items:center;margin:0 0 6px;font-size:13px}.com-af-c b{color:var(--tinta);font-weight:600}',
    '.msg.com-ojo{color:var(--ojo)}.msg.com-msg0{min-height:0;margin:0}.msg.com-msg0:not(:empty){margin:6px 0 0}.com-sola .tarj-cab{border-bottom:0}',
    /* «¿A quién acudo?»: lo publicado, lo que se carga y la pantalla del trabajador */
    '.qui-pub{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:space-between;border:1px solid var(--raya);border-radius:12px;background:var(--panel);padding:12px 16px;margin:0 0 16px;font-size:13.5px;line-height:1.5}',
    '.qui-pub.ok{border-color:#BFE3CE;background:var(--ok-f)}.qui-pub.ojo{border-color:#EED9A8;background:var(--ojo-f)}.qui-pub>span{flex:1 1 320px;min-width:0}.qui-pub b{color:var(--tinta)}',
    '.qui-dos{display:grid;grid-template-columns:minmax(0,1fr) 372px;gap:16px;align-items:start}.qui-izq{display:grid;gap:16px;min-width:0}.qui-izq>.tarj{margin:0}.qui-lado{position:sticky;top:72px;min-width:0}',
    '.qui-cel{border:1px solid var(--raya2);border-radius:22px;background:#F4F6F8;padding:16px 14px 18px;max-height:calc(100vh - 150px);overflow:auto}.qui-cel h3{margin:0 0 10px;font-size:17px;color:var(--tinta)}',
    '.qui-st{margin:16px 0 8px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--gris)}.qui-cel h3+.qui-st{margin-top:4px}',
    '.qui-sos{display:grid;gap:6px}.qui-sos-n{display:flex;gap:10px;align-items:center;border:1px solid #F0C9CC;background:#fff;border-radius:11px;padding:8px 11px}.qui-sos-n.uno{background:var(--mal-f)}',
    '.qui-sos-n small{display:block;font-size:12px;color:var(--gris);line-height:1.3}.qui-sos-n b{display:block;font-size:16px;color:var(--tinta);font-variant-numeric:tabular-nums;letter-spacing:.01em}.qui-sos-n>span:nth-child(2){flex:1;min-width:0}',
    '.qui-sos-n i{font-style:normal;font-size:11.5px;color:var(--mal);font-weight:600}.qui-punto{margin:8px 0 0;border:1px solid var(--raya);border-radius:10px;background:#fff;padding:8px 11px;font-size:13px;line-height:1.45}',
    '.qui-gr{border:1px solid var(--raya);border-radius:11px;background:#fff;overflow:hidden;margin:0 0 8px}.qui-gr-t{padding:7px 11px;font-size:12px;font-weight:600;color:var(--gris);background:#FAFBFC;border-bottom:1px solid var(--raya)}',
    '.qui-p{display:flex;gap:10px;align-items:center;padding:8px 11px;border-bottom:1px solid var(--raya)}.qui-p:last-child{border-bottom:0}.qui-p>span:nth-child(2){flex:1;min-width:0}',
    '.qui-p b{display:block;font-size:13.5px;font-weight:600;color:var(--tinta);line-height:1.3;overflow-wrap:anywhere}.qui-p small{display:block;font-size:12px;color:var(--gris);line-height:1.35}',
    '.qui-cara{width:36px;height:36px;border-radius:50%;flex:0 0 auto;background:var(--tinta);color:#fff;display:grid;place-items:center;font-size:12.5px;font-weight:600;overflow:hidden;position:relative}',
    '.qui-cara img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}.qui-cara.mando{background:#6B4EA8}.qui-cara.brig{background:#C2410C}.qui-tel{font-size:12px;color:var(--gris);white-space:nowrap}',
    '.qui-nota{margin:10px 0 0;font-size:12px;color:var(--gris);line-height:1.45}.qui-vacio{border:1px dashed var(--raya2);border-radius:11px;padding:18px 12px;text-align:center;color:var(--gris);font-size:13px;line-height:1.5;background:#fff}',
    '.qui-f{border:1px solid var(--raya);border-radius:10px;background:#FAFBFC;padding:10px 12px 12px;margin:8px 0 0}.qui-f .acciones{justify-content:flex-end;margin:4px 0 0}',
    '.qui-n{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--mal-f);color:var(--mal);font-size:12px;font-weight:600;font-style:normal;margin-right:7px}',
    '.qui-linea{display:flex;gap:8px}.qui-linea input{flex:1;min-width:0}.qui-izq .tarj-cab{flex-wrap:nowrap;align-items:flex-start}.qui-izq .tarj-cab>div:first-child{flex:1 1 auto;min-width:0}.qui-izq .tarj-cab .acciones{flex:0 0 auto}',
    '@media (max-width:1100px){.qui-dos{grid-template-columns:minmax(0,1fr)}.qui-lado{position:static}.qui-cel{max-height:none}}',
    '@media (max-width:640px){.qui-izq .tarj-cab{flex-wrap:wrap}.qui-linea{flex-wrap:wrap}.qui-linea input{flex:1 1 100%}}',
    '@media (max-width:900px){.mas-firmas{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media (max-width:640px){.tdm-podio li{grid-template-columns:28px minmax(0,1fr) 46px 58px}.tdm-podio .tdm-r{display:none}.tdm-t thead th:first-child,.tdm-t tbody th{min-width:150px;max-width:170px}.mas-lin-f{grid-template-columns:58px minmax(74px,.8fr) minmax(98px,1.2fr) auto}.mas-lin-f b{grid-column:1/-1}.mas-lin-f .bt-link{justify-self:end}.mas-cab{grid-template-columns:86px 1fr 104px}.mas-tarjs{grid-template-columns:1fr}.com-meses{grid-template-columns:repeat(6,minmax(0,1fr))}.com-acu li{flex-wrap:wrap}.com-acu-t{flex:1 1 100%}}'
  ].join('\n');
  document.head.appendChild(st);
}
function masId(pref){ return pref+Date.now().toString(36)+Math.random().toString(36).slice(2, 5); }
function masRecargar(){ try{ if(typeof VISTA.recargar==='function') VISTA.recargar(true); }catch(e){} }
/* el cursor al primer campo de un formulario recién abierto, un momento después (cuando ya está pintado). Si para entonces la persona
   ya está en otro campo de ese formulario, se queda donde está: en un equipo lento ese momento llega tarde, y le quitaba el cursor a
   media palabra (lo que escribía caía en el casillero equivocado). */
function _masFoco(id, ms){
  setTimeout(function(){ try{
    var e=$(id), a=document.activeElement; if(!e || a===e) return;
    if(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.closest && a.closest('#hoja, #vista')===e.closest('#hoja, #vista')) return;
    e.focus();
  }catch(_e){} }, ms||60);
}
function _masMal(m, t, foco){ if(m){ m.className='msg mal'; m.textContent=t; } if(foco && $(foco)) try{ $(foco).focus(); }catch(e){} return false; }
function _masDice(m, t, cl){ if(m){ m.className='msg '+(cl||'gris'); m.textContent=t; } }

/* ── el tope del plan: el contador de la app (sst_uso). Sin poder leerlo no se frena, como la app sin señal ──
   masCupo(clave, cuantos, piso) → { ok, tope, lleva, queda, porMes, plan }  (tope −1: sin tope · piso: lo que ya se ve
   guardado, que cuenta aunque el contador venga atrasado) */
function masCupo(clave, cuantos, piso){
  var P=planWebActual(), tope=(P && P.tope && typeof P.tope[clave]==='number') ? P.tope[clave] : -1;
  cuantos=Math.max(1, +cuantos||1); piso=Math.max(0, +piso||0);
  if(tope<0) return Promise.resolve({ ok:true, tope:-1, lleva:0, queda:Infinity, plan:P ? P.n : '' });
  var porMes=((P && P.mes)||[]).indexOf(clave)>-1;
  return sbRpc('sst_uso_leer', { p_emp:YO.obra.id }).then(function(j){
    var n=Math.max(piso, (j && j.ok) ? (+(((porMes ? j.m : j.t)||{})[clave])||0) : 0);
    return { ok:(n+cuantos)<=tope, tope:tope, lleva:n, queda:Math.max(0, tope-n), porMes:porMes, plan:P.n };
  }, function(){ return { ok:(piso+cuantos)<=tope, tope:tope, lleva:piso, queda:Math.max(0, tope-piso), porMes:porMes, plan:P.n, sinLeer:true }; });
}
function masSumar(clave, n){
  n=Math.max(1, Math.min(500, +n||1));
  try{ return sbRpc('sst_uso_sumar', { p_emp:YO.obra.id, p_clave:clave, p_n:n }).then(function(j){ return j; }, function(){ return null; }); }catch(e){ return Promise.resolve(null); }
}
function masTopeAviso(r, que){
  return dialogo({ titulo:'Llegaste al tope de tu plan', texto:'Ya van '+r.lleva+' '+que+(r.porMes ? ' este mes' : '')+' y el plan '+r.plan+' llega a '+r.tope+'. Lo que ya está guardado sigue ahí.',
                   si:(planwPuedePagar() ? 'Ver los planes' : 'Ver mi plan'), no:'Cerrar' }).then(function(v){ if(v===true){ cerrarHoja(); navegar('plan'); } });
}
/* el personal de la obra con lo que hace falta para escribir en las tablas de la app: su «ext» (la llave de la ficha
   en el celular), su documento y su puesto */
var MASG = { obra:null, lista:null, t:0, pide:null };
function masGente(fresco){
  var oid=(YO.obra||{}).id;
  if(MASG.obra!==oid){ MASG.obra=oid; MASG.lista=null; MASG.t=0; MASG.pide=null; }
  if(!fresco && MASG.lista && Date.now()-MASG.t<60000) return Promise.resolve(MASG.lista);
  if(MASG.pide) return MASG.pide;
  var sels=['id,ext,nombre,dni,td,puesto,area,estatus,sangre,emergencia,emer_quien,foto_url', 'id,ext,nombre,dni,td,puesto,area,estatus,sangre,emergencia,emer_quien', 'id,ext,nombre,dni,td,puesto,area,estatus'];
  function prueba(i){ return traerTodo('sst_trabajador', '&select='+sels[i]+'&order=nombre.asc', 6000).catch(function(c){ if(c===400 && i+1<sels.length) return prueba(i+1); throw c; }); }
  var p=prueba(0).then(function(l){
    if(MASG.pide===p) MASG.pide=null;
    if((YO.obra||{}).id!==oid) return [];
    var L=(l||[]).filter(function(t){ return t && t.nombre; }).map(function(t){
      return { id:t.id, ext:String(t.ext||''), nombre:gesTxt(t.nombre), dni:gesTxt(t.dni), td:t.td||'', puesto:gesTxt(t.puesto), area:gesTxt(t.area), cesado:String(t.estatus||'activo')==='cesado',
               sangre:gesTxt(t.sangre), emergencia:gesTxt(t.emergencia), emerQuien:gesTxt(t.emer_quien), fotoUrl:/^https?:\/\//.test(String(t.foto_url||'')) ? String(t.foto_url) : '' }; });
    L.sort(function(x, y){ return x.nombre.localeCompare(y.nombre, 'es', {sensitivity:'base'}); });
    MASG.lista=L; MASG.t=Date.now(); return L;
  }, function(e){ if(MASG.pide===p) MASG.pide=null; if(MASG.obra===oid && MASG.lista) return MASG.lista; throw e; });
  MASG.pide=p; return p;
}
function masActivos(l){ return (l||[]).filter(function(t){ return !t.cesado; }); }
/* una foto del disco → achicada, con su vista previa: { blob, vista } */
function masFotoDe(file, lado){
  if(!file) return Promise.reject('sin_foto');
  if(!/^image\//i.test(file.type||'') && !/\.(jpe?g|png|webp|heic)$/i.test(file.name||'')) return Promise.reject('no_es_foto');
  if((file.size||0)>25*1024*1024) return Promise.reject('muy_grande');
  return _gesFotoChica(file, lado||1400, 0.82);
}
var MAS_FOTO_NO = { no_es_foto:'Ese archivo no es una foto. Tiene que ser JPG o PNG.', muy_grande:'Esa foto pesa más de 25 MB.', sin_foto:'No se pudo leer esa foto. Prueba con otra.' };
function masFotoNo(e){ return MAS_FOTO_NO[e] || MAS_FOTO_NO.sin_foto; }

/* ══ 1 · LA ENTREGA DE EPP ════════════════════════════════════════════════════════════════════
   La app la registra en el celular, con la firma del trabajador en la pantalla. Aquí, lo mismo desde la oficina o el
   almacén: se elige a la persona, lo que se lleva, y firma en la pantalla (con el mouse, el dedo o el lápiz) o se
   anota que ya firmó en papel. Una fila por EPP, como en la app, con la misma firma y la misma foto.
   El código de cada fila dice de dónde salió: «wf-…» firmada aquí · «wp-…» firmada en papel · «wx-…» del Excel. */
var MAS_EPP_SUG = ['Casco de seguridad', 'Barbiquejo', 'Tafilete', 'Tapones auditivos', 'Lentes de seguridad claros', 'Lentes de seguridad oscuros', 'Guantes multiflex',
  'Guantes de badana', 'Chaleco plomo', 'Polo manga larga', 'Camisa manga larga', 'Pantalón drill', 'Zapatos de seguridad', 'Botas de jebe', 'Arnés de cuerpo entero', 'Línea de vida',
  'Respirador media cara', 'Filtros para respirador', 'Careta facial', 'Mameluco tyvek'];
var MAS_EPP_TIPO = [['N', 'Nuevo'], ['C', 'Cambio'], ['P', 'Pérdida']];
/* un par de guantes es PAR, no UND: la misma regla de la app */
var MAS_EPP_UNIDAD = [[/guante|zapato|bota|calzado|botin|botín|zapatilla|rodiller|escarpin|escarpín|manguito|tapón|tapon/i, 'PAR'], [/filtro|cartucho/i, 'PAR'], [/traje|mameluco|overol/i, 'UND']];
function masUnidadDe(epp){ var t=String(epp||''); for(var i=0;i<MAS_EPP_UNIDAD.length;i++) if(MAS_EPP_UNIDAD[i][0].test(t)) return MAS_EPP_UNIDAD[i][1]; return 'UND'; }
/* lo que esta obra entrega más (de su propio kardex) y, después, la lista general */
function masEppFrecuentes(n){
  n=n||14;
  var cuenta={}, out=[], vistos={};
  ((typeof EPPD==='object' && EPPD && EPPD.obra===(YO.obra||{}).id && EPPD.filas) || []).forEach(function(k){
    var e=gesTxt(k.epp); if(!e) return; var kk=nrm(e); if(!cuenta[kk]) cuenta[kk]={ n:0, t:e }; cuenta[kk].n+=1;
  });
  Object.keys(cuenta).map(function(k){ return cuenta[k]; }).sort(function(a, b){ return b.n-a.n; }).slice(0, n).forEach(function(x){ out.push(x.t); vistos[nrm(x.t)]=1; });
  MAS_EPP_SUG.forEach(function(e){ if(out.length<n && !vistos[nrm(e)]){ out.push(e); vistos[nrm(e)]=1; } });
  return out;
}
var EPPN = null;
function masEppNueva(pre){
  _gesCss(); _yaCss(); _masCss();
  var hoy=hoyISO();
  EPPN={ t:null, lin:[], modo:'aqui', foto:null, guardando:false, gente:null };
  var S=EPPN;
  var h='<div class="campo"><label for="eppn-quien">A quién se le entrega</label><input id="eppn-quien" maxlength="120" placeholder="Escribe sus primeras letras o su documento" autocomplete="off">'+
      '<div id="eppn-quien-v"></div></div>'+
    '<div class="seccion"><h3>Lo que se lleva</h3><p class="ayuda" style="margin:0 0 8px">Toca cada EPP que recibe, o escríbelo. Todo lo de esta entrega va con una sola firma.</p>'+
      '<div class="chips" id="eppn-sug"></div>'+
      '<div class="mas-otro"><input id="eppn-otro" maxlength="80" placeholder="Otro EPP: escríbelo" aria-label="Otro EPP"><button type="button" class="bt sec" id="eppn-mas">Agregar</button></div>'+
      '<div class="mas-lin" id="eppn-lin"></div><p class="mas-cupo" id="eppn-cupo" hidden></p></div>'+
    '<div class="fila-c ya-al" style="margin-top:14px"><div class="campo"><label for="eppn-fecha">Día de la entrega</label><input type="date" id="eppn-fecha" max="'+hoy+'" value="'+hoy+'"></div>'+
      '<div class="campo"><label for="eppn-lugar">Lugar <span class="tenue">· opcional</span></label><input id="eppn-lugar" maxlength="120" placeholder="Almacén, frente, sector…" list="eppn-lugares"><datalist id="eppn-lugares"></datalist></div>'+
      '<div class="campo"><label for="eppn-act">Actividad <span class="tenue">· opcional</span></label><input id="eppn-act" maxlength="120" placeholder="Encofrado, soldadura…"></div></div>'+
    '<div class="seccion"><h3>La firma de quien recibe</h3>'+
      '<div class="seg ya-estado" id="eppn-modo" role="tablist" aria-label="Cómo firma">'+
        '<button type="button" role="tab" aria-selected="true" class="on" data-v="aqui">Firma aquí, en la pantalla</button>'+
        '<button type="button" role="tab" aria-selected="false" data-v="papel">Ya firmó en papel</button></div>'+
      '<div id="eppn-aqui"><div class="lienzo" id="eppn-lienzo"><canvas></canvas><div class="guia"></div><div class="pista">Firma aquí con el mouse, el dedo o el lápiz</div></div>'+
        '<div class="acciones" style="justify-content:flex-start;margin:8px 0 0"><button type="button" class="bt sec chico" id="eppn-borrar">Borrar y repetir</button></div></div>'+
      '<p class="ayuda" id="eppn-papel" hidden style="margin:0">La firma queda en tu hoja de kardex. Aquí la entrega sale como «en papel»: conviene adjuntar la foto de la hoja firmada.</p></div>'+
    '<div class="seccion"><h3 id="eppn-foto-t">Foto de la entrega <span class="tenue" style="font-weight:400">· opcional</span></h3><div class="mas-foto" id="eppn-foto"></div></div>'+
    '<div class="msg" id="eppn-msg" role="status"></div>';
  abrirHoja('Registrar una entrega de EPP', 'Queda en el kardex de la obra, igual que la que se registra en el celular', h,
    '<button type="button" class="bt sec" id="eppn-no">Cancelar</button><button type="button" class="bt" id="eppn-ok">Registrar la entrega</button>', {ancha:true, sinFoco:true});
  $('eppn-no').onclick=cerrarHoja;
  /* a quién */
  function quien(){
    var v=$('eppn-quien-v'), t=S.t;
    v.innerHTML=t ? '<div class="mas-quien" id="eppn-elegido"><div class="bol-ini" aria-hidden="true">'+esc(iniciales(t.nombre))+'</div><div class="mas-quien-t"><b>'+esc(t.nombre)+'</b><small>'+
      esc([t.dni ? (t.td||docPersonaP())+' '+t.dni : '', t.puesto, t.area].filter(Boolean).join(' · ')||'Sin más datos en su ficha')+'</small></div>'+
      '<button type="button" class="bt-link" id="eppn-otra">Cambiar</button></div>' : '';
    if($('eppn-otra')) $('eppn-otra').onclick=function(){ S.t=null; $('eppn-quien').value=''; $('eppn-quien').hidden=false; quien(); $('eppn-quien').focus(); };
    $('eppn-quien').hidden=!!t;
  }
  var inp=$('eppn-quien');
  sugGente(inp, { lista:function(){ return masGente().then(masActivos).then(function(l){ S.gente=l; return l; }); }, alElegir:function(t){ S.t=t; quien(); _masDice($('eppn-msg'), '', ''); try{ $('eppn-otro').focus(); }catch(e){} } });
  inp.addEventListener('input', function(){ if(S.t && nrm(inp.value)!==nrm(S.t.nombre)) S.t=null; });
  /* lo que se lleva */
  function chips(){
    var ya={}; S.lin.forEach(function(l){ ya[nrm(l.epp)]=1; });
    $('eppn-sug').innerHTML=masEppFrecuentes(14).map(function(e, i){ var on=!!ya[nrm(e)];
      return '<button type="button" class="chip'+(on ? ' on' : '')+'" aria-pressed="'+(on ? 'true' : 'false')+'" data-i="'+i+'" data-e="'+esc(e)+'">'+esc(e)+'</button>'; }).join('');
  }
  function leer(){
    Array.prototype.forEach.call($('eppn-lin').querySelectorAll('.mas-lin-f'), function(f, i){
      var l=S.lin[i]; if(!l) return;
      var c=parseInt(f.querySelector('input').value, 10); l.cant=(c>0 && c<=999) ? c : 1;
      var ss=f.querySelectorAll('select'); l.unidad=ss[0].value; l.tipo=ss[1].value;
    });
  }
  function lineas(){
    var c=$('eppn-lin');
    c.innerHTML=S.lin.length ? S.lin.map(function(l, i){
      return '<div class="mas-lin-f"><b>'+esc(l.epp)+'</b>'+
        '<input type="number" min="1" max="999" step="1" inputmode="numeric" value="'+esc(l.cant)+'" aria-label="Cantidad de '+esc(l.epp)+'">'+
        '<select aria-label="Unidad">'+['UND', 'PAR'].map(function(u){ return '<option'+(u===l.unidad ? ' selected' : '')+'>'+u+'</option>'; }).join('')+'</select>'+
        '<select aria-label="Motivo">'+MAS_EPP_TIPO.map(function(t){ return '<option value="'+t[0]+'"'+(t[0]===l.tipo ? ' selected' : '')+'>'+t[1]+'</option>'; }).join('')+'</select>'+
        '<button type="button" class="bt-link" data-q="'+i+'" aria-label="Quitar '+esc(l.epp)+'">Quitar</button></div>'; }).join('')
      : '<div class="mas-lin-v" id="eppn-vacio">Todavía no hay nada en esta entrega.</div>';
    Array.prototype.forEach.call(c.querySelectorAll('[data-q]'), function(b){ b.onclick=function(){ leer(); S.lin.splice(+b.getAttribute('data-q'), 1); lineas(); chips(); }; });
    $('eppn-ok').textContent=S.lin.length>1 ? 'Registrar la entrega · '+S.lin.length+' EPP' : 'Registrar la entrega';
  }
  function agrega(e){
    e=gesTxt(e).slice(0, 80); if(e.length<2) return false;
    leer();
    var ya=S.lin.filter(function(l){ return nrm(l.epp)===nrm(e); })[0];
    if(ya){ ya.cant=Math.min(999, ya.cant+1); }
    else {
      if(S.lin.length>=30){ _masMal($('eppn-msg'), 'Una entrega lleva hasta 30 EPP. Registra el resto en otra.'); return false; }
      S.lin.push({ epp:e, cant:1, unidad:masUnidadDe(e), tipo:'N' });
    }
    lineas(); chips(); _masDice($('eppn-msg'), '', ''); return true;
  }
  $('eppn-sug').onclick=function(ev){
    var b=ev.target.closest('[data-e]'); if(!b) return;
    var e=b.getAttribute('data-e'), i=-1; S.lin.forEach(function(l, j){ if(nrm(l.epp)===nrm(e)) i=j; });
    if(i>-1){ leer(); S.lin.splice(i, 1); lineas(); chips(); } else agrega(e);
  };
  function otro(){ var o=$('eppn-otro'); if(agrega(o.value)){ o.value=''; } o.focus(); }
  $('eppn-mas').onclick=otro;
  $('eppn-otro').addEventListener('keydown', function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); otro(); } });
  /* la firma */
  function modo(){
    var aq=(S.modo==='aqui');
    $('eppn-aqui').hidden=!aq; $('eppn-papel').hidden=aq;
    $('eppn-foto-t').innerHTML=aq ? 'Foto de la entrega <span class="tenue" style="font-weight:400">· opcional</span>' : 'Foto de la hoja firmada <span class="tenue" style="font-weight:400">· conviene</span>';
    Array.prototype.forEach.call($('eppn-modo').querySelectorAll('button'), function(b){ var on=(b.getAttribute('data-v')===S.modo); b.className=on ? 'on' : ''; b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if(aq) setTimeout(function(){ if($('eppn-lienzo') && EPPN===S) prepLienzo($('eppn-lienzo'), 170, function(){ _masDice($('eppn-msg'), '', ''); }); }, 30);
  }
  $('eppn-modo').onclick=function(ev){ var b=ev.target.closest('[data-v]'); if(!b || b.getAttribute('data-v')===S.modo) return; S.modo=b.getAttribute('data-v'); modo(); };
  $('eppn-borrar').onclick=function(){ prepLienzo($('eppn-lienzo'), 170, function(){ _masDice($('eppn-msg'), '', ''); }); };
  /* la foto */
  function foto(){
    var c=$('eppn-foto');
    c.innerHTML=(S.foto ? '<img src="'+esc(S.foto.vista)+'" alt="La foto elegida">' : '')+
      '<div class="acciones"><label class="bt sec chico" for="eppn-foto-f">'+(S.foto ? 'Cambiar la foto' : '＋ Adjuntar una foto')+'</label><input type="file" id="eppn-foto-f" accept="image/*" hidden>'+
      (S.foto ? '<button type="button" class="bt-link" id="eppn-foto-q">Quitar</button>' : '')+'</div>';
    $('eppn-foto-f').onchange=function(){
      var f=this.files && this.files[0]; if(!f) return;
      masFotoDe(f, 1400).then(function(x){ if(EPPN!==S) return; S.foto=x; foto(); _masDice($('eppn-msg'), '', ''); }, function(e){ _masMal($('eppn-msg'), masFotoNo(e)); });
    };
    if($('eppn-foto-q')) $('eppn-foto-q').onclick=function(){ S.foto=null; foto(); };
  }
  $('eppn-ok').onclick=_eppnGuardar;
  chips(); lineas(); quien(); modo(); foto();
  /* los lugares que ya se usaron en esta obra, para no escribirlos otra vez */
  try{
    var lug={}; ((typeof EPPD==='object' && EPPD && EPPD.filas) || []).slice(0, 4000).forEach(function(k){ var l=gesTxt(k.lugar); if(l) lug[l]=(lug[l]||0)+1; });
    $('eppn-lugares').innerHTML=Object.keys(lug).sort(function(a, b){ return lug[b]-lug[a]; }).slice(0, 12).map(function(l){ return '<option value="'+esc(l)+'">'; }).join('');
  }catch(e){}
  /* cuánto queda del mes, si el plan tiene tope */
  masCupo('kardex', 1).then(function(r){
    if(EPPN!==S || !$('eppn-cupo') || r.tope<0 || r.sinLeer) return;
    S.cupo=r; var c=$('eppn-cupo'); c.hidden=false;
    c.innerHTML='Tu plan <b>'+esc(r.plan)+'</b> trae '+r.tope+' EPP entregados al mes: van <b>'+r.lleva+'</b>'+(r.queda ? ', quedan '+r.queda+'.' : ' y ya no queda ninguno este mes.');
  });
  if(pre && pre.t){ S.t=pre.t; quien(); }
  setTimeout(function(){ try{ if(!S.t) $('eppn-quien').focus(); }catch(e){} }, 60);
}
function _eppnGuardar(){
  var S=EPPN; if(!S || S.guardando) return;
  var m=$('eppn-msg'), bt=$('eppn-ok'), hoy=hoyISO();
  /* lo escrito en «otro EPP» y no agregado, igual cuenta (como en la app) */
  var suelto=gesTxt($('eppn-otro').value);
  Array.prototype.forEach.call($('eppn-lin').querySelectorAll('.mas-lin-f'), function(f, i){
    var l=S.lin[i]; if(!l) return; var c=parseInt(f.querySelector('input').value, 10); l.cant=(c>0 && c<=999) ? c : 0;
    var ss=f.querySelectorAll('select'); l.unidad=ss[0].value; l.tipo=ss[1].value;
  });
  var lin=S.lin.slice();
  if(suelto.length>=2 && !lin.some(function(l){ return nrm(l.epp)===nrm(suelto); })) lin.push({ epp:suelto.slice(0, 80), cant:1, unidad:masUnidadDe(suelto), tipo:'N' });
  if(!S.t){
    var esc0=gesTxt($('eppn-quien').value), cal=(S.gente||[]).filter(function(g){ return esc0 && nrm(g.nombre)===nrm(esc0); });
    if(cal.length===1) S.t=cal[0];
  }
  if(!S.t){
    esc0=gesTxt($('eppn-quien').value);
    return _masMal(m, esc0 ? '«'+esc0+'» no está en tu personal: elígelo de la lista. Si es nuevo, agrégalo primero en «Personal».' : 'Elige a quién se le entrega.', 'eppn-quien');
  }
  if(!lin.length) return _masMal(m, 'Toca primero el EPP que se lleva.', 'eppn-otro');
  if(lin.some(function(l){ return !(l.cant>0); })) return _masMal(m, 'La cantidad de cada EPP va de 1 a 999.');
  var fe=$('eppn-fecha').value;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fe)) return _masMal(m, 'Falta el día de la entrega.', 'eppn-fecha');
  if(fe>hoy) return _masMal(m, 'Ese día todavía no llega: una entrega se registra cuando se hace.', 'eppn-fecha');
  if(fe<'2000-01-01') return _masMal(m, 'Revisa el año de la fecha.', 'eppn-fecha');
  var firma='';
  if(S.modo==='aqui'){
    var tr=atsNorm(LIENZO.trazos);
    if(!tr || lienzoPuntos()<12) return _masMal(m, 'Falta la firma de quien recibe: firma dentro del recuadro. Si ya firmó en papel, toca «Ya firmó en papel».');
    firma=atsFirmaImg(tr, 360);
    if(!/^data:image\/png;base64,/.test(firma)) return _masMal(m, 'No se pudo tomar la firma. Bórrala y repítela.');
  }
  var lugar=gesTxt($('eppn-lugar').value).slice(0, 120), act=gesTxt($('eppn-act').value).slice(0, 120), t=S.t, pref=(S.modo==='aqui') ? 'wf-' : 'wp-';
  S.guardando=true; bt.disabled=true; _masDice(m, 'Guardando…');
  masCupo('kardex', lin.length).then(function(r){
    if(!r.ok){ S.guardando=false; bt.disabled=false; _masDice(m, '', ''); return masTopeAviso(r, 'EPP entregados').then(function(){ return 'tope'; }); }
    return (S.foto ? subirFoto('kardex', S.foto.blob, 'entrega-'+String(t.ext||t.id||'x').replace(/[^A-Za-z0-9]/g, '').slice(0, 24)+'.jpg').then(null, function(){ return ''; }) : Promise.resolve('')).then(function(url){
      var ahora=Date.now().toString(36);
      var filas=lin.map(function(l, i){
        var f={ duenio:String(YO.obra.id), ext:pref+ahora+i+Math.random().toString(36).slice(2, 5), trabajador:t.ext||String(t.id||''), trab_nombre:t.nombre, epp:l.epp, tipo:l.tipo, fecha:fe, cantidad:l.cant, unidad:l.unidad };
        if(firma) f.firma=firma;
        if(url) f.foto=url;
        if(act) f.actividad=act;
        if(lugar) f.lugar=lugar;
        return f;
      });
      return gesSubirTandas('sst_kardex', filas, [[], ['actividad', 'lugar'], ['actividad', 'lugar', 'foto']], null, 40).then(function(res){
        masSumar('kardex', filas.length);
        S.guardando=false;
        toast(filas.length>1 ? 'Entrega registrada: '+filas.length+' EPP con una sola firma.' : 'Entrega registrada.');
        cerrarHoja();
        if(typeof EPPD==='object' && EPPD) EPPD.carga=0;
        if(VISTA.actual==='kardex' || VISTA.actual==='epp'){ if(typeof EPPD.pinta==='function') EPPD.pinta(false); } else masRecargar();
        if(S.foto && !url) toast('La entrega se guardó, pero la foto no se pudo subir.');
        return res;
      });
    });
  }).catch(function(e){
    S.guardando=false; if(bt) bt.disabled=false;
    _masMal(m, 'No se pudo guardar la entrega. '+porQueFallo((e && e.cod!==undefined) ? e.cod : e));
  });
}

/* ── el kardex anterior, desde su Excel ──────────────────────────────────────────────────────
   Una fila por EPP entregado: la fecha, a quién (su documento o su nombre), qué y cuánto. Se une a cada persona por su
   documento y, si no, por su nombre; la que no está en el personal entra con el nombre tal como viene (es historia).
   No trae firmas: quedan «en papel», con la hoja que ya se tiene. Las entregas de ESTE mes cuentan en el tope del
   plan, como las que se registran una por una; las de los meses anteriores no. */
var MAS_KAR_CAMPOS = [
  { k:'fecha',  t:'Fecha', sin:['fecha de entrega', 'fecha de la entrega', 'fecha entrega', 'fecha', 'dia'] },
  { k:'nombre', t:'Apellidos y nombres', sin:['apellidos y nombres', 'nombres y apellidos', 'apellidos nombres', 'nombre completo', 'nombre y apellido', 'apellido y nombre', 'nombre del trabajador', 'trabajador', 'nombre', 'colaborador', 'personal', 'empleado', 'recibe', 'recibido por'] },
  { k:'dni',    t:'Documento', sin:['numero de documento', 'nro de documento', 'n de documento', 'nro documento', 'documento de identidad', 'doc identidad', 'documento', 'dni', 'cedula', 'ci', 'run', 'rut', 'curp', 'cuil', 'identificacion', 'nro doc', 'n doc', 'doc'] },
  { k:'epp',    t:'EPP', sin:['equipo de proteccion personal', 'descripcion del epp', 'descripcion del equipo', 'nombre del epp', 'epp entregado', 'equipo entregado', 'epp', 'equipo', 'articulo', 'descripcion', 'material', 'producto', 'item'] },
  { k:'cant',   t:'Cantidad', sin:['cantidad entregada', 'cantidad', 'cant', 'unidades', 'cdad', 'ctd'] },
  { k:'unidad', t:'Unidad', sin:['unidad de medida', 'unidad', 'und', 'um', 'u m'] },
  { k:'tipo',   t:'Motivo', sin:['motivo de entrega', 'motivo de la entrega', 'motivo', 'tipo de entrega', 'tipo', 'condicion'] },
  { k:'lugar',  t:'Lugar', sin:['lugar de entrega', 'lugar', 'frente', 'area', 'sector', 'ubicacion'] }
];
var KARS = null;
function masEppSubir(){
  _gesCss(); _yaCss(); _masCss();
  KARS={ hojas:[], hoja:0, nombre:'', tit:-1, map:{}, filas:[], prob:[], gente:null, ya:null, n:{}, subiendo:false };
  var S=KARS;
  masGente(true).then(function(l){ if(KARS!==S) return; S.gente=l||[]; if($('ks-res')) _ksPintarRevisar(); }, function(){ if(KARS===S) S.gente=[]; });
  /* lo que ya está en el kardex, para no cargarlo dos veces */
  traerTodo('sst_kardex', '&select=fecha,trabajador,trab_nombre,epp,cantidad&order=fecha.desc,ext.desc', 40000).then(function(r){ if(KARS!==S) return; S.ya=r||[]; if($('ks-res')) _ksPintarRevisar(); }, function(){ if(KARS===S) S.ya=[]; });
  _ksPintarArchivo();
}
function _ksPintarArchivo(aviso){
  var per=docPersonaP();
  var h=(aviso ? '<div class="aviso mal" id="ks-aviso" role="alert">'+esc(aviso)+'</div>' : '')+
    '<p style="margin:0 0 14px">Sube el kardex de EPP que ya llevabas: una fila por cada EPP entregado, con su fecha, a quién y cuánto. Antes de guardar vas a ver cómo queda.</p>'+
    '<label class="ges-zona" id="ks-zona" tabindex="0"><span class="ges-ic" aria-hidden="true">⬆</span><b>Suelta aquí tu Excel o tócalo para elegirlo</b>'+
      '<span>Excel (.xlsx) o .csv</span><input type="file" id="ks-file" accept=".xlsx,.xlsm,.csv,.txt,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"></label>'+
    '<div class="ges-o">o</div>'+
    '<div class="campo"><label for="ks-pega">Copia las filas de tu Excel (con sus títulos) y pégalas aquí</label>'+
      '<textarea id="ks-pega" rows="5" spellcheck="false" placeholder="Fecha&#9;'+esc(per)+'&#9;Apellidos y nombres&#9;EPP&#9;Cantidad&#10;12/03/2026&#9;…&#9;Quispe Rojas, Ana&#9;Guantes de cuero&#9;1"></textarea></div>'+
    '<div class="acciones"><button type="button" class="bt sec" id="ks-leer">Leer lo pegado</button></div>'+
    '<div class="msg" id="ks-msg" role="status"></div>'+
    '<div class="seccion"><h3>Para que salga a la primera</h3><p class="ayuda" style="margin:0">Cada columna con su título arriba: «Fecha», «'+esc(per)+'» o «Apellidos y nombres», «EPP» y «Cantidad». '+
      'Si además trae «Unidad», «Motivo» (nuevo, cambio o pérdida) o «Lugar», también entran. Si prefieres empezar de cero, <button type="button" class="bt-link" id="ks-plantilla">descarga la plantilla</button> y llénala.</p></div>';
  abrirHoja('Cargar el kardex anterior', 'Las entregas de EPP que ya tenías anotadas, de tu Excel a OBRASST', h, '<button type="button" class="bt sec" id="ks-no">Cancelar</button>', {ancha:true, sinFoco:true});
  $('ks-no').onclick=cerrarHoja;
  var z=$('ks-zona'), fi=$('ks-file'), m=$('ks-msg');
  function leyo(x, nombre){
    if(!x || !x.hojas || !x.hojas.length){ _ksPintarArchivo('Ese archivo no trae ninguna fila con datos.'); return; }
    KARS.hojas=x.hojas; KARS.nombre=nombre||''; KARS.hoja=_ksMejorHoja(x.hojas); _ksPreparar(); _ksPintarRevisar();
  }
  function archivo(f){ if(!f) return; m.className='msg gris'; m.textContent='Leyendo «'+f.name+'»…'; gesLeerArchivo(f).then(function(x){ leyo(x, f.name); }, function(e){ _ksPintarArchivo(gesNoLeyo(e)); }); }
  fi.onchange=function(){ archivo(fi.files && fi.files[0]); };
  ['dragenter', 'dragover'].forEach(function(ev){ z.addEventListener(ev, function(e){ e.preventDefault(); z.classList.add('sobre'); }); });
  ['dragleave', 'dragend'].forEach(function(ev){ z.addEventListener(ev, function(){ z.classList.remove('sobre'); }); });
  z.addEventListener('drop', function(e){ e.preventDefault(); z.classList.remove('sobre'); archivo(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });
  z.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); fi.click(); } });
  $('ks-leer').onclick=function(){
    var t=$('ks-pega').value;
    if(!gesTxt(t)){ m.className='msg mal'; m.textContent='Pega primero las filas copiadas de tu Excel.'; $('ks-pega').focus(); return; }
    var filas=gesLeerTexto(t, true);
    leyo({ hojas:filas.length ? [{ n:'', filas:filas }] : [] }, '');
  };
  $('ks-plantilla').onclick=function(){ _ksPlantilla(); };
}
function _ksForma(filas){
  var tit=gesFilaTitulos(filas, MAS_KAR_CAMPOS, ['epp']);
  if(tit<0) return { ok:false, tit:-1, map:{} };
  var map=gesMapear(filas[tit], MAS_KAR_CAMPOS);
  return { ok:(map.epp!==undefined && map.fecha!==undefined && (map.nombre!==undefined || map.dni!==undefined)), tit:tit, map:map };
}
function _ksMejorHoja(hojas){
  var mejor=0, max=-1;
  hojas.forEach(function(h, i){ var f=_ksForma(h.filas), p=(f.ok ? 5000 : 0)+Object.keys(f.map).length*100+Math.min(h.filas.length, 900); if(p>max){ max=p; mejor=i; } });
  return mejor;
}
function _ksPreparar(){ var S=KARS, H=S.hojas[S.hoja]||{ filas:[] }, f=_ksForma(H.filas); S.ok=f.ok; S.tit=f.tit; S.map=f.map; }
function _ksTipo(txt){ var t=nrm(txt); if(/perd|extrav|robo/.test(t) || t==='p') return 'P'; if(/camb|repos|desgast|deterior|renov|dan/.test(t) || t==='c') return 'C'; return 'N'; }
function _ksUnidad(txt, epp){ var t=nrm(txt); if(/^par(es)?$/.test(t)) return 'PAR'; if(/^(und|unidad|unidades|u|un|pza|pieza|piezas|ud|uds)$/.test(t)) return 'UND'; return masUnidadDe(epp); }
function _ksLlaveNom(n){ return nrm(n).split(' ').filter(Boolean).sort().join(' '); }
/* la hoja → las filas del kardex (S.filas) y lo que no se entendió (S.prob) */
function _ksCalcular(){
  var S=KARS, H=S.hojas[S.hoja]||{ filas:[] }, M=S.map, hoy=hoyISO(), mes=hoy.slice(0, 7), pais=paisObraP();
  var tdDef='DNI'; try{ tdDef=(docPais(pais).tipos||[['DNI']])[0][0]; }catch(e){}
  var porDoc={}, porNom={}, porExt={};
  (S.gente||[]).forEach(function(t){ var d=String(t.dni||'').trim().toUpperCase(); if(d) porDoc[d]=t; var n=_ksLlaveNom(t.nombre); if(n && !porNom[n]) porNom[n]=t; if(t.ext) porExt[t.ext]=t; });
  var ya={};
  (S.ya||[]).forEach(function(k){
    var t=k.trabajador ? porExt[String(k.trabajador)] : null, quien=t ? 'f:'+t.id : 'n:'+_ksLlaveNom(k.trab_nombre);
    ya[String(k.fecha||'').slice(0, 10)+'|'+quien+'|'+nrm(k.epp)+'|'+(parseInt(k.cantidad, 10)||1)]=1;
  });
  var v=function(f, k){ return (M[k]===undefined || M[k]<0) ? '' : gesTxt(f[M[k]]); };
  var filas=[], prob=[], n={ leidas:0, nuevas:0, ya:0, rep:0, fuera:0, mes:0 }, vistas={};
  H.filas.forEach(function(f, i){
    if(i<=S.tit) return;
    var fila=f.r||(i+1), epp=v(f, 'epp').slice(0, 80), feC=v(f, 'fecha'), nom=v(f, 'nombre').replace(/\s+,/g, ',').slice(0, 120), crudo=v(f, 'dni');
    if(!epp && !feC && !nom && !crudo) return;
    n.leidas++;
    if(epp.length<2){ prob.push('Fila '+fila+': sin el EPP.'); return; }
    var fe=gesFecha(feC);
    if(!fe){ prob.push('Fila '+fila+': «'+epp.slice(0, 30)+'» sin fecha que se entienda'+(feC ? ' («'+feC.slice(0, 20)+'»)' : '')+'.'); return; }
    if(fe>hoy){ prob.push('Fila '+fila+': la fecha '+fechaLarga(fe)+' todavía no llega.'); return; }
    if(fe<'2000-01-01'){ prob.push('Fila '+fila+': la fecha '+fechaLarga(fe)+' es demasiado antigua.'); return; }
    var dni=crudo ? ((typeof docPersonaNorm==='function') ? docPersonaNorm(tdDef, crudo) : crudo.replace(/\s/g, '')) : '';
    if(tdDef==='DNI' && pais==='pe' && /^\d{6,7}$/.test(dni)) dni=('00000000'+dni).slice(-8);
    var t=(dni && porDoc[String(dni).toUpperCase()]) || (nom ? porNom[_ksLlaveNom(nom)] : null) || null;
    if(!t && (nom.length<3 || !/[a-záéíóúñ]/i.test(nom))){ prob.push('Fila '+fila+': '+(dni ? 'el documento '+dni+' no está en tu personal y la fila no trae el nombre.' : 'no dice a quién se le entregó.')); return; }
    var cn=v(f, 'cant'), cant=parseInt(String(cn).replace(/[^\d.,-]/g, '').replace(',', '.'), 10);
    if(cn && !(cant>0)){ prob.push('Fila '+fila+': la cantidad «'+cn.slice(0, 12)+'» no es un número.'); return; }
    if(!(cant>0)) cant=1;
    if(cant>999){ prob.push('Fila '+fila+': '+cant+' unidades de «'+epp.slice(0, 30)+'» en una sola entrega no parece una entrega a una persona.'); return; }
    var quien=t ? 'f:'+t.id : 'n:'+_ksLlaveNom(nom), k=fe+'|'+quien+'|'+nrm(epp)+'|'+cant;
    var o={ fila:fila, fecha:fe, t:t, nombre:t ? t.nombre : nom, dni:t ? t.dni : dni, epp:epp, cant:cant, unidad:_ksUnidad(v(f, 'unidad'), epp), tipo:_ksTipo(v(f, 'tipo')), lugar:v(f, 'lugar').slice(0, 120),
            est:ya[k] ? 'ya' : (vistas[k] ? 'rep' : 'nueva'), delMes:(fe.slice(0, 7)===mes) };
    vistas[k]=1;
    if(o.est==='nueva'){ n.nuevas++; if(!t) n.fuera++; if(o.delMes) n.mes++; } else if(o.est==='ya') n.ya++; else n.rep++;
    filas.push(o);
  });
  filas.sort(function(a, b){ return String(b.fecha).localeCompare(String(a.fecha)) || a.nombre.localeCompare(b.nombre, 'es'); });
  S.filas=filas; S.prob=prob; S.n=n;
  return filas;
}
var KS_EST = { nueva:['ok', 'Nueva'], ya:['gris', 'Ya está'], rep:['gris', 'Repetida en la hoja'] };
function _ksPintarRevisar(){
  var S=KARS, H=S.hojas[S.hoja]||{ filas:[] };
  var h='';
  if(S.hojas.length>1) h+='<div class="campo"><label for="ks-hoja">Tu archivo tiene '+S.hojas.length+' hojas. ¿En cuál está el kardex?</label><select id="ks-hoja">'+
    S.hojas.map(function(x, i){ return '<option value="'+i+'"'+(i===S.hoja ? ' selected' : '')+'>'+esc((x.n||'Hoja '+(i+1))+' · '+gesPlural(x.filas.length, 'fila', 'filas'))+'</option>'; }).join('')+'</select></div>';
  if(!S.ok){
    var falta=[]; if(S.map.fecha===undefined) falta.push('la «Fecha»'); if(S.map.epp===undefined) falta.push('el «EPP»'); if(S.map.nombre===undefined && S.map.dni===undefined) falta.push('a quién (su documento o su nombre)');
    h+='<div class="aviso ojo" id="ks-noforma"><b>No reconocí la forma de esta hoja.</b> '+(S.tit<0 ? 'No encontré la fila de los títulos.' : 'Le falta '+falta.join(' y ')+'.')+
      ' Cada columna tiene que llevar su título arriba. <button type="button" class="bt-link" id="ks-plantilla2">Descarga la plantilla</button> para ver cómo.</div><div id="ks-res"></div>';
  } else {
    var cab=H.filas[S.tit]||[];
    h+='<div class="aviso" id="ks-forma"><b>Así la leí:</b> '+MAS_KAR_CAMPOS.filter(function(c){ return S.map[c.k]!==undefined; }).map(function(c){ return esc(c.t)+' ← «'+esc(gesTxt(cab[S.map[c.k]]).slice(0, 30))+'»'; }).join(' · ')+'.</div><div id="ks-res"></div>';
  }
  abrirHoja('Cargar el kardex anterior', S.nombre ? '«'+S.nombre+'»' : 'Lo que pegaste', h,
    '<button type="button" class="bt sec" id="ks-atras">‹ Otro archivo</button><button type="button" class="bt" id="ks-ok" disabled>Cargar</button>', {ancha:true, sinFoco:true});
  $('ks-atras').onclick=function(){ _ksPintarArchivo(); };
  if($('ks-hoja')) $('ks-hoja').onchange=function(){ S.hoja=+this.value; _ksPreparar(); _ksPintarRevisar(); };
  if($('ks-plantilla2')) $('ks-plantilla2').onclick=function(){ _ksPlantilla(); };
  $('ks-ok').onclick=_ksSubir;
  _ksPintarRes();
}
function _ksPintarRes(){
  var S=KARS, c=$('ks-res'), bt=$('ks-ok'); if(!c) return;
  if(!S.ok){ c.innerHTML=''; if(bt) bt.disabled=true; return; }
  if(S.gente===null || S.ya===null){ c.innerHTML='<p class="ayuda">Mirando tu personal y lo que ya está en el kardex…</p>'; if(bt) bt.disabled=true; return; }
  var F=_ksCalcular(), n=S.n;
  var h='<div class="ges-cuenta" id="ks-cuenta"><span class="pill ok">'+gesPlural(n.nuevas, 'entrega nueva', 'entregas nuevas')+'</span>'+
    (n.ya ? '<span class="pill gris">'+gesPlural(n.ya, 'ya estaba', 'ya estaban')+'</span>' : '')+
    (n.rep ? '<span class="pill gris">'+gesPlural(n.rep, 'repetida en la hoja', 'repetidas en la hoja')+'</span>' : '')+
    (S.prob.length ? '<span class="pill ojo">'+gesPlural(S.prob.length, 'fila no se entendió', 'filas no se entendieron')+'</span>' : '')+'</div>';
  if(n.fuera) h+='<p class="ayuda" id="ks-fuera" style="margin:0 0 8px">'+gesPlural(n.fuera, 'entrega es de alguien que no está', 'entregas son de gente que no está')+' en tu personal: '+(n.fuera===1 ? 'entra' : 'entran')+' con el nombre tal como viene en tu hoja.</p>';
  if(F.length){
    h+='<div class="ges-prev" id="ks-prev"><table><thead><tr><th>Fila</th><th>Fecha</th><th>A quién</th><th>EPP</th><th>Cant.</th><th>Motivo</th><th></th></tr></thead><tbody>'+
      F.slice(0, 200).map(function(o){ var E=KS_EST[o.est];
        return '<tr'+(o.est==='nueva' ? '' : ' class="no"')+'><td class="n">'+esc(o.fila)+'</td><td style="white-space:nowrap">'+esc(fechaLarga(o.fecha))+'</td><td><b>'+esc(o.nombre)+'</b>'+
          '<small>'+(o.t ? esc([o.dni, o.t.puesto].filter(Boolean).join(' · ')||'de tu personal') : 'no está en tu personal'+(o.dni ? ' · '+esc(o.dni) : ''))+'</small></td>'+
          '<td>'+esc(o.epp)+(o.lugar ? '<small>'+esc(o.lugar)+'</small>' : '')+'</td><td class="n">'+esc(o.cant)+' '+esc(o.unidad)+'</td><td>'+esc({ N:'Nuevo', C:'Cambio', P:'Pérdida' }[o.tipo])+'</td>'+
          '<td><span class="pill '+E[0]+'">'+E[1]+'</span></td></tr>'; }).join('')+'</tbody></table></div>'+
      (F.length>200 ? '<p class="ayuda" style="margin:6px 0 0">Se muestran las primeras 200 de '+F.length+'.</p>' : '');
  }
  if(S.prob.length) h+='<details class="seccion" id="ks-prob"'+(S.prob.length<=6 ? ' open' : '')+'><summary>Lo que no se entendió ('+S.prob.length+')</summary><ul class="ges-lista-chica">'+S.prob.slice(0, 60).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('')+
    (S.prob.length>60 ? '<li><small>… y '+(S.prob.length-60)+' más.</small></li>' : '')+'</ul></details>';
  h+='<p class="ayuda" id="ks-nota" style="margin:12px 0 0">Estas entregas no traen firma en pantalla: quedan como «en papel», con tu hoja de kardex como respaldo.</p>'+
    '<div class="msg" id="ks-msg2" role="status"></div><div class="ges-avance" id="ks-avance" hidden><i style="width:0"></i></div>';
  c.innerHTML=h;
  if(bt){ bt.disabled=!n.nuevas || S.subiendo; bt.textContent=n.nuevas ? 'Cargar '+gesPlural(n.nuevas, 'entrega', 'entregas') : 'Nada nuevo que cargar'; }
}
function _ksSubir(){
  var S=KARS; if(!S || S.subiendo) return;
  var nuevas=S.filas.filter(function(o){ return o.est==='nueva'; }), m=$('ks-msg2'), bt=$('ks-ok'), av=$('ks-avance');
  if(!nuevas.length) return;
  S.subiendo=true; bt.disabled=true; $('ks-atras').disabled=true; _masDice(m, 'Revisando el tope de tu plan…');
  var delMes=nuevas.filter(function(o){ return o.delMes; });
  (delMes.length ? masCupo('kardex', delMes.length) : Promise.resolve({ ok:true, tope:-1 })).then(function(r){
    var fuera=0;
    if(!r.ok){
      /* las de este mes que pasan del tope se quedan fuera; las de antes entran todas */
      var caben=r.queda||0, dejo=0;
      nuevas=nuevas.filter(function(o){ if(!o.delMes) return true; if(dejo<caben){ dejo++; return true; } fuera++; return false; });
      delMes=nuevas.filter(function(o){ return o.delMes; });
      if(!nuevas.length){ S.subiendo=false; bt.disabled=false; $('ks-atras').disabled=false; _masDice(m, '', ''); return masTopeAviso(r, 'EPP entregados'); }
    }
    var ahora=Date.now().toString(36);
    var filas=nuevas.map(function(o, i){
      var f={ duenio:String(YO.obra.id), ext:'wx-'+ahora+i.toString(36)+Math.random().toString(36).slice(2, 5), trabajador:o.t ? (o.t.ext||String(o.t.id||'')) : null, trab_nombre:o.nombre, epp:o.epp, tipo:o.tipo, fecha:o.fecha, cantidad:o.cant, unidad:o.unidad };
      if(o.lugar) f.lugar=o.lugar;
      return f;
    });
    av.hidden=false; _masDice(m, 'Cargando '+filas.length+'…');
    return gesSubirTandas('sst_kardex', filas, [[], ['lugar']], function(i, t){ var b=av.querySelector('i'); if(b) b.style.width=Math.round(i*100/t)+'%'; _masDice(m, 'Cargando '+i+' de '+t+'…'); }, 40).then(function(res){
      if(delMes.length) masSumar('kardex', delMes.length);
      S.subiendo=false;
      _ksListo(filas.length, fuera, r);
    });
  }).catch(function(e){
    S.subiendo=false; if(bt) bt.disabled=false; if($('ks-atras')) $('ks-atras').disabled=false;
    var hechas=(e && e.hechas) ? e.hechas.length : 0;
    _masMal(m, (hechas ? 'Se cargaron '+hechas+' y el resto no. ' : 'No se pudo cargar. ')+porQueFallo((e && e.cod!==undefined) ? e.cod : e)+(hechas ? ' Vuelve a subir el mismo archivo: las que ya entraron salen como «Ya está».' : ''));
    if(hechas){ if(typeof EPPD==='object' && EPPD) EPPD.carga=0; KARS.ya=null; traerTodo('sst_kardex', '&select=fecha,trabajador,trab_nombre,epp,cantidad&order=fecha.desc,ext.desc', 40000).then(function(r){ if(KARS===S){ S.ya=r||[]; } }, function(){ if(KARS===S) S.ya=[]; }); }
  });
}
function _ksListo(n, fuera, r){
  var h='<div class="aviso ok" id="ks-listo"><b>'+gesPlural(n, 'entrega cargada', 'entregas cargadas')+' en el kardex.</b> Ya cuentan en el consumo de EPP, mes a mes, y en la app de tu equipo.</div>'+
    (fuera ? '<div class="aviso ojo" id="ks-tope">'+gesPlural(fuera, 'entrega de este mes se quedó', 'entregas de este mes se quedaron')+' fuera: tu plan '+esc(r.plan)+' trae '+r.tope+' EPP entregados al mes. Las de los meses anteriores entraron todas.</div>' : '');
  abrirHoja('Kardex cargado', '', h, '<button type="button" class="bt" id="ks-fin">Listo</button>', {sinFoco:true});
  $('ks-fin').onclick=cerrarHoja;
  if(typeof EPPD==='object' && EPPD) EPPD.carga=0;
  if((VISTA.actual==='kardex' || VISTA.actual==='epp') && typeof EPPD.pinta==='function') EPPD.pinta(false); else masRecargar();
}
/* la plantilla: los títulos y dos filas de ejemplo (un .csv que Excel abre directo) */
function _ksPlantilla(){
  var per=docPersonaP();
  var l=[['Fecha', per, 'Apellidos y nombres', 'EPP', 'Cantidad', 'Unidad', 'Motivo', 'Lugar'],
         ['05/03/2026', '', 'Apellidos Apellidos, Nombres', 'Casco de seguridad', '1', 'UND', 'Nuevo', 'Almacén'],
         ['05/03/2026', '', 'Apellidos Apellidos, Nombres', 'Guantes de cuero', '2', 'PAR', 'Cambio', 'Almacén']];
  var t='\uFEFF'+l.map(function(f){ return f.map(function(c){ return /[",;\n]/.test(c) ? '"'+c.replace(/"/g, '""')+'"' : c; }).join(';'); }).join('\r\n')+'\r\n';
  bajarBlob(new Blob([t], {type:'text/csv;charset=utf-8'}), 'plantilla-kardex-de-epp.csv');
}

/* ══ 2 · LOS DATOS Y EL LOGO DE LA EMPRESA ════════════════════════════════════════════════════
   La razón social, el domicilio, la actividad, los códigos del formato y el logo que salen en la cabecera de cada
   registro. Es la misma fila que escribe la app (sst_doc, hoja «empleador»): { v, t, razon, dom, act, formatoCod,
   formatoRev, formatoFecha, codKardex, logo }. Gana la versión más nueva (t), como entre dos celulares.
   El logo se guarda como en la app: centrado en un cuadrado blanco de 312 × 312, que es lo que pide el formato de
   Excel del kardex. El RUC no va aquí: lo pone la cuenta de la empresa. */
var MAS_EMP_CAMPOS = ['razon', 'dom', 'act', 'formatoCod', 'formatoRev', 'formatoFecha', 'codKardex', 'logo'];
var EMPW = { n:0, d:null, ids:[], logo:null, sucio:false, guardando:false, caja:null };
function _empLeer(rows){
  var mejor=null, ids=[];
  (rows||[]).forEach(function(r){
    if(!r || !r.id) return; ids.push(r.id);
    var x=nota(r.nota); if(!x || typeof x!=='object') return;
    if(!mejor || (+x.t||0)>(+mejor.t||0)) mejor=x;
  });
  return { d:mejor||{}, ids:ids };
}
function masVistaEmpresa(caja){
  _masCss();
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  EMPW.caja=caja;
  function pinta(silencio){
    /* lo que se está escribiendo no se pisa con una recarga */
    if(silencio && $('emp-form') && (EMPW.sucio || EMPW.guardando)) return;
    var n=++EMPW.n;
    if(!silencio) cargando(caja);
    sbGet('sst_doc?empresa=eq.'+_enc(YO.obra.id)+'&hoja=eq.empleador&select=id,nota&order=id.desc&limit=6').then(function(rows){
      if(n!==EMPW.n || VISTA.actual!=='empresa') return;
      var L=_empLeer(rows);
      EMPW.d=L.d; EMPW.ids=L.ids; EMPW.logo=(/^data:image\//.test(String(L.d.logo||'')) ? L.d.logo : null); EMPW.sucio=false;
      _empPintar();
    }, function(cod){ if(n!==EMPW.n || VISTA.actual!=='empresa') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
/* el logo sin su marco blanco, para la cabecera de muestra: se pide una vez por logo; si no se puede (sin señal, una
   imagen que no abre), se queda el cuadrado y no se vuelve a pedir con cada letra que se escriba */
function _empRecorte(L){
  if(EMPW.recPide===L) return;
  EMPW.recPide=L;
  var queda=function(du){
    if(EMPW.recPide===L) EMPW.recPide=null;
    if(EMPW.logo!==L) return;
    EMPW.rec={ de:L, du:du||L };
    var im=document.querySelector('#emp-cab img'); if(im && du) im.src=du;
  };
  cargarMasApp().then(function(){ return MAS_APP.logoSinMarco(L); }).then(function(r){ queda(r && r.du); }, function(){ queda(null); });
}
function _empPintar(){
  var caja=EMPW.caja, d=EMPW.d||{}; if(!caja || !document.body.contains(caja)) return;
  var vacio=!MAS_EMP_CAMPOS.some(function(k){ return !!d[k]; });
  var h='<div class="aviso" id="emp-que"><b>Esto es lo que sale en la cabecera de tus registros</b> —el kardex, las constancias, las amonestaciones, los carteles, los ATS—: se llena una vez y vale para toda la obra, aquí y en los celulares de tu equipo.'+
      (vacio ? ' <span id="emp-vacio">Todavía no hay nada cargado.</span>' : '')+'</div>'+
    '<div class="tarj" id="emp-form"><div class="tarj-cab"><div><h2>La empresa</h2><p class="sub">El RUC no se cambia aquí: es el de la cuenta de la empresa.</p></div></div><div class="tarj-cuerpo">'+
      '<div class="campo"><label for="emp-razon">Razón social o denominación social</label><input id="emp-razon" maxlength="160" autocomplete="organization" value="'+esc(d.razon||'')+'"></div>'+
      '<div class="campo"><label for="emp-dom">Domicilio <span class="tenue">· dirección, distrito, provincia, departamento</span></label><input id="emp-dom" maxlength="200" value="'+esc(d.dom||'')+'"></div>'+
      '<div class="campo"><label for="emp-act">Actividad económica</label><input id="emp-act" maxlength="120" placeholder="CONSTRUCCIÓN" value="'+esc(d.act||'')+'"></div>'+
      '<div class="seccion"><h3>El logo</h3><p class="ayuda" style="margin:0 0 4px">Va en la esquina de cada formato y en los carteles. Cuadrado queda mejor; se guarda sobre fondo blanco.</p>'+
        '<div class="mas-logo"><div class="mas-logo-v" id="emp-logo-v"></div><div class="acciones"><label class="bt sec" for="emp-logo-f" id="emp-logo-bt">Elegir el logo</label><input type="file" id="emp-logo-f" accept="image/*" hidden>'+
        '<button type="button" class="bt-link" id="emp-logo-q" hidden>Quitar el logo</button></div></div></div>'+
      '<div class="seccion"><h3>La cabecera de tus formatos</h3><p class="ayuda" style="margin:0 0 8px">El código, la revisión y la fecha con que tu empresa o tu cliente identifican sus formatos. Si no los usas, déjalos en blanco.</p>'+
        '<div class="fila-c ya-al"><div class="campo"><label for="emp-fcod">Código</label><input id="emp-fcod" maxlength="40" placeholder="SSOMA-PC-FO-053" value="'+esc(d.formatoCod||'')+'"></div>'+
        '<div class="campo"><label for="emp-frev">Revisión</label><input id="emp-frev" maxlength="12" placeholder="00" value="'+esc(d.formatoRev||'')+'"></div>'+
        '<div class="campo"><label for="emp-ffecha">Fecha del formato</label><input id="emp-ffecha" maxlength="20" placeholder="28/04/2026" value="'+esc(d.formatoFecha||'')+'"></div></div>'+
        '<div class="campo"><label for="emp-ckardex">Código del registro de entrega de EPP (kardex) <span class="tenue">· si es otro</span></label><input id="emp-ckardex" maxlength="40" placeholder="SSOMA-FR-015" value="'+esc(d.codKardex||'')+'"></div>'+
        '<p class="ayuda" style="margin:10px 0 6px">Así sale arriba de cada hoja:</p><div class="mas-cab" id="emp-cab" data-sin-pais></div></div>'+
      '<div class="msg" id="emp-msg" role="status"></div>'+
      '<div class="acciones" style="justify-content:flex-start;margin-top:14px"><button type="button" class="bt" id="emp-ok">Guardar</button></div>'+
    '</div></div>';
  caja.innerHTML=h;
  /* 08/10/2026 · el lugar de la obra (lo arma el portal: ubiwTarjeta) */
  try{ if(typeof ubiwTarjeta==='function') ubiwTarjeta(caja); }catch(_u){}
  function vista(){
    var L=EMPW.logo, razon=gesTxt($('emp-razon').value);
    /* en las hojas el logo va sin su marco blanco (lo recorta la app, y aquí su misma función): en la cabecera de muestra
       también, o un logo apaisado se ve la mitad de grande de lo que de verdad sale */
    var Lc=(L && EMPW.rec && EMPW.rec.de===L) ? EMPW.rec.du : L;
    $('emp-logo-v').innerHTML=L ? '<img src="'+esc(L)+'" alt="El logo de la empresa">' : '<span>Sin logo: en su lugar sale la razón social</span>';
    $('emp-logo-q').hidden=!L; $('emp-logo-bt').textContent=L ? 'Cambiar el logo' : 'Elegir el logo';
    $('emp-cab').innerHTML='<div>'+(L ? '<img src="'+esc(Lc)+'" alt="">' : '<b style="font-size:11px;color:#6e6e6e">'+esc(razon||'EMPRESA')+'</b>')+'</div><div><b>NOMBRE DEL FORMATO</b></div>'+
      '<div class="cod"><span>Código: '+esc(gesTxt($('emp-fcod').value)||'—')+'</span><span>Versión: '+esc(gesTxt($('emp-frev').value)||'00')+'</span><span>Fecha: '+esc(gesTxt($('emp-ffecha').value)||'—')+'</span></div>';
    if(L && !(EMPW.rec && EMPW.rec.de===L)) _empRecorte(L);
  }
  $('emp-form').oninput=function(){ EMPW.sucio=true; _masDice($('emp-msg'), '', ''); vista(); };
  $('emp-logo-f').onchange=function(){
    var f=this.files && this.files[0], m=$('emp-msg'); if(!f) return;
    _masDice(m, 'Preparando el logo…');
    masLogoDe(f).then(function(du){ EMPW.logo=du; EMPW.sucio=true; vista(); _masDice(m, 'Logo listo. No olvides Guardar.', 'ok'); }, function(e){ _masMal(m, e==='muy_grande' ? 'Esa imagen pesa más de 25 MB.' : 'No se pudo leer esa imagen. Tiene que ser JPG o PNG.'); });
    this.value='';
  };
  $('emp-logo-q').onclick=function(){ EMPW.logo=null; EMPW.sucio=true; vista(); _masDice($('emp-msg'), 'Sin logo. No olvides Guardar.'); };
  $('emp-ok').onclick=_empGuardar;
  vista();
}
/* como la app: se achica a 312 de lado y se centra en un cuadrado blanco de 312 × 312, en JPEG */
function masLogoDe(file){
  return new Promise(function(res, rej){
    if(!file || (!/^image\//i.test(file.type||'') && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name||''))) return rej('no_es_foto');
    if((file.size||0)>25*1024*1024) return rej('muy_grande');
    var url=URL.createObjectURL(file), im=new Image();
    im.onload=function(){
      try{
        var cv=document.createElement('canvas'); cv.width=312; cv.height=312;
        var g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0, 0, 312, 312);
        var w0=im.naturalWidth||im.width, h0=im.naturalHeight||im.height, r=Math.min(312/w0, 312/h0), w=w0*r, hh=h0*r;
        g.imageSmoothingQuality='high'; g.drawImage(im, (312-w)/2, (312-hh)/2, w, hh);
        var du=cv.toDataURL('image/jpeg', 0.92); URL.revokeObjectURL(url);
        if(!/^data:image\/jpeg;base64,/.test(du)) return rej('sin_foto');
        res(du);
      }catch(e){ URL.revokeObjectURL(url); rej(e); }
    };
    im.onerror=function(){ URL.revokeObjectURL(url); rej('sin_foto'); };
    im.src=url;
  });
}
function _empGuardar(){
  if(EMPW.guardando) return;
  var m=$('emp-msg'), bt=$('emp-ok');
  var o={ v:1, t:Date.now() }, v=function(id, max){ return gesTxt($(id).value).slice(0, max); };
  var d={ razon:v('emp-razon', 160), dom:v('emp-dom', 200), act:v('emp-act', 120), formatoCod:v('emp-fcod', 40), formatoRev:v('emp-frev', 12), formatoFecha:v('emp-ffecha', 20), codKardex:v('emp-ckardex', 40), logo:EMPW.logo||'' };
  if(d.razon && d.razon.length<3) return _masMal(m, 'La razón social es muy corta.', 'emp-razon');
  MAS_EMP_CAMPOS.forEach(function(k){ if(d[k]) o[k]=d[k]; });
  EMPW.guardando=true; bt.disabled=true; _masDice(m, 'Guardando…');
  var texto=JSON.stringify(o), oid=YO.obra.id;
  /* sobre lo que el servidor tiene en ese momento: si ya hay fila (o más de una, de antes), se actualizan todas */
  sbGet('sst_doc?empresa=eq.'+_enc(oid)+'&hoja=eq.empleador&select=id&order=id.desc&limit=6').then(function(rows){
    var ids=(rows||[]).map(function(r){ return r && r.id; }).filter(Boolean);
    if(!ids.length) return sbPostP('sst_doc', { empresa:oid, hoja:'empleador', nombre:'Datos de la empresa', nota:texto }).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); });
    return ids.reduce(function(p, id){ return p.then(function(){ return sbPatch('sst_doc?id=eq.'+_enc(id), { nota:texto }).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); }); }); }, Promise.resolve());
  }).then(function(){
    EMPW.guardando=false; EMPW.sucio=false; EMPW.d=o; bt.disabled=false;
    /* lo que el portal ya tenía leído de la empresa (los carteles, las constancias, los papeles) se vuelve a pedir */
    try{ if(typeof _QRP_EMP==='object') delete _QRP_EMP[oid]; }catch(e){}
    try{ if(typeof _RAZON==='object') delete _RAZON[oid]; }catch(e){}
    try{ if(typeof PAP==='object' && PAP) PAP.ctx=null; }catch(e){}
    var ev=$('emp-vacio'); if(ev && MAS_EMP_CAMPOS.some(function(k){ return !!o[k]; })) ev.parentNode.removeChild(ev);
    _masDice(m, 'Guardado. Ya sale en tus registros, aquí y en los celulares de tu equipo.', 'ok');
    toast('Datos de la empresa guardados.');
  }, function(e){ EMPW.guardando=false; bt.disabled=false; _masMal(m, 'No se pudo guardar. '+porQueFallo(e)); });
}

/* ══ 3 · LAS BUENAS PRÁCTICAS ═════════════════════════════════════════════════════════════════
   Lo que salió bien también se registra (sst_buena): { empresa, ext, fecha, titulo, descripcion, lugar, actividad,
   autor, foto_url, destacada }. Como en la app, una buena práctica no se edita: se anota y, si no va, se quita.
   Lo único que cambia después es si está destacada, y eso también les llega a los celulares. */
var BUEW = { filas:null, n:0, caja:null, firma:'', q:'', solo:'', nivel:0 };
var BUE_SELS = ['id,ext,fecha,titulo,descripcion,lugar,actividad,autor,foto_url,destacada,creado', 'id,ext,fecha,titulo,descripcion,lugar,actividad,autor,creado'];
function _bueTraer(){
  function prueba(i){
    return traerTodo('sst_buena', '&select='+BUE_SELS[i]+'&order=fecha.desc,creado.desc', 4000).then(function(r){ BUEW.nivel=i; return r||[]; }, function(c){ if(c===400 && i+1<BUE_SELS.length) return prueba(i+1); throw c; });
  }
  return prueba(BUEW.nivel||0);
}
function masVistaBuenas(caja){
  _masCss(); _yaCss();
  BUEW.caja=caja;
  var ac=$('acciones');
  if(ac){ ac.innerHTML='<button type="button" class="bt" id="bue-nueva">＋ Anotar una buena práctica</button>'; $('bue-nueva').onclick=function(){ bueForm(); }; }
  cargando(caja);
  function pinta(silencio){
    var n=++BUEW.n;
    _bueTraer().then(function(rows){
      if(n!==BUEW.n || VISTA.actual!=='buenas') return;
      var firma=''; try{ firma=JSON.stringify(rows)+hoyISO(); }catch(e){}
      if(silencio && firma && firma===BUEW.firma && $('bue-lista') && document.body.contains(caja)) return;
      BUEW.firma=firma; BUEW.filas=rows; buePintar();
    }).catch(function(cod){ if(n!==BUEW.n || VISTA.actual!=='buenas') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function _bueVisibles(){
  var q=nrm(BUEW.q), s=BUEW.solo;
  return (BUEW.filas||[]).filter(function(x){
    if(s==='dest' && !x.destacada) return false;
    if(s==='foto' && !x.foto_url) return false;
    return !q || nrm([x.titulo, x.descripcion, x.lugar, x.actividad, x.autor].join(' ')).indexOf(q)>-1;
  });
}
function buePintar(){
  var caja=BUEW.caja; if(!caja || !document.body.contains(caja)) return;
  var F=BUEW.filas||[], mes=MES, anio=ANIO;
  var h='<div class="aviso" id="bue-que"><b>Lo que salió bien en la obra, anotado para repetirlo.</b> Es lo que se cuenta en la charla del lunes: una plataforma bien armada, un trabajador que paró la tarea porque algo no estaba seguro. '+
    'Las que se anotan aquí aparecen en la app de tu equipo, y las del celular, aquí.</div>';
  if(!F.length){
    caja.innerHTML=h+'<div class="tarj"><div class="vacio" id="bue-vacio"><b>Todavía no hay ninguna</b>Empieza por la de esta semana, con «＋ Anotar una buena práctica». No tiene que ser algo grande.</div></div>';
    return;
  }
  h+='<div class="rej">'+
    cifra('Este mes', F.filter(function(x){ return String(x.fecha||'').slice(0, 7)===mes; }).length, 'anotadas en '+_mesNombre(mes), '')+
    cifra('En '+anio, F.filter(function(x){ return String(x.fecha||'').slice(0, 4)===anio; }).length, 'en lo que va del año', '')+
    cifra('Destacadas', F.filter(function(x){ return x.destacada; }).length, 'las que más conviene repetir', '')+
    cifra('Con foto', F.filter(function(x){ return x.foto_url; }).length, 'de '+F.length+' en total', '')+'</div>';
  h+='<div class="tarj"><div class="tarj-cab"><div class="herr"><input type="search" id="bue-q" placeholder="Buscar…" aria-label="Buscar" value="'+esc(BUEW.q)+'">'+
    '<select id="bue-solo" aria-label="Cuáles"><option value="">Todas</option><option value="dest"'+(BUEW.solo==='dest' ? ' selected' : '')+'>Solo las destacadas</option><option value="foto"'+(BUEW.solo==='foto' ? ' selected' : '')+'>Solo las que tienen foto</option></select>'+
    '<span class="cuenta-f" id="bue-cuenta"></span></div><div class="acciones"><button type="button" class="bt sec chico" id="bue-csv">Exportar CSV</button></div></div>'+
    '<div class="tarj-cuerpo"><div class="mas-tarjs" id="bue-lista"></div></div></div>';
  caja.innerHTML=h;
  function lista(){
    var V=_bueVisibles(), c=$('bue-lista');
    $('bue-cuenta').textContent=V.length+(V.length!==F.length ? ' de '+F.length : '')+' '+(F.length===1 ? 'buena práctica' : 'buenas prácticas');
    c.innerHTML=V.length ? V.slice(0, 300).map(function(x, i){
      return '<button type="button" class="mas-t" data-i="'+i+'"><span class="mas-t-foto">'+(_edImgOk(x.foto_url) ? '<img src="'+esc(x.foto_url)+'" alt="" loading="lazy">' : '<span aria-hidden="true">🌟</span>')+'</span>'+
        '<span class="mas-t-c"><b>'+(x.destacada ? '⭐ ' : '')+esc(x.titulo||'')+'</b><small>'+esc([fechaLarga(x.fecha), x.lugar, x.actividad].filter(Boolean).join(' · '))+'</small>'+
        '<p>'+esc(x.descripcion||'')+'</p>'+(x.autor ? '<small>👏 '+esc(x.autor)+'</small>' : '')+'</span></button>'; }).join('')
      : '<div class="vacio" style="grid-column:1/-1"><b>Ninguna con ese filtro</b>Cambia la búsqueda o elige «Todas».</div>';
    Array.prototype.forEach.call(c.querySelectorAll('.mas-t'), function(b){ b.onclick=function(){ bueVer(V[+b.getAttribute('data-i')]); }; });
  }
  $('bue-q').oninput=function(){ BUEW.q=this.value; lista(); };
  $('bue-solo').onchange=function(){ BUEW.solo=this.value; lista(); };
  $('bue-csv').onclick=function(){
    csv([{k:'fecha', t:'Fecha'}, {k:'titulo', t:'Qué se hizo bien'}, {k:'descripcion', t:'Descripción'}, {k:'lugar', t:'Lugar'}, {k:'actividad', t:'Actividad'}, {k:'autor', t:'Quién lo hizo'},
         {k:'destacada', t:'Destacada', v:function(x){ return x.destacada ? 'sí' : 'no'; }}, {k:'foto_url', t:'Foto'}], _bueVisibles(), 'buenas-practicas');
  };
  lista();
}
function bueVer(x){
  if(!x) return;
  var h=(_edImgOk(x.foto_url) ? '<img class="mas-ver-foto" src="'+esc(x.foto_url)+'" alt="Foto de la buena práctica">' : '')+
    '<p class="mas-texto" id="bue-v-desc">'+esc(x.descripcion||'')+'</p>'+
    '<div class="seccion"><dl class="datos">'+[['Día', fechaLarga(x.fecha)], ['Lugar', x.lugar], ['Actividad', x.actividad], ['Quién lo hizo', x.autor]].filter(function(d){ return d[1]; })
      .map(function(d){ return '<dt>'+esc(d[0])+'</dt><dd>'+esc(d[1])+'</dd>'; }).join('')+'</dl></div>'+
    '<div class="msg" id="bue-v-msg" role="status"></div>';
  var conDest=(BUEW.nivel===0);
  abrirHoja((x.destacada ? '⭐ ' : '🌟 ')+(x.titulo||'Buena práctica'), 'Buena práctica · '+fechaLarga(x.fecha), h,
    '<button type="button" class="bt mal" id="bue-v-q">Quitar</button><button type="button" class="bt sec" id="bue-v-copiar">Copiar para compartir</button>'+
    (conDest ? '<button type="button" class="bt" id="bue-v-dest">'+(x.destacada ? 'Quitar el destacado' : '⭐ Destacarla')+'</button>' : ''), {sinFoco:true});
  $('bue-v-copiar').onclick=function(){
    var t='🌟 BUENA PRÁCTICA — '+((YO.obra||{}).nombre||'')+'\n'+fechaLarga(x.fecha)+(x.lugar ? ' · '+x.lugar : '')+'\n\n'+(x.titulo||'')+'\n'+(x.descripcion||'')+(x.autor ? '\n\nLo hizo: '+x.autor : '');
    try{ navigator.clipboard.writeText(t).then(function(){ toast('Copiada: ya la puedes pegar en WhatsApp o en un correo.'); }, function(){ _masMal($('bue-v-msg'), 'No se pudo copiar. Selecciona el texto y cópialo a mano.'); }); }
    catch(e){ _masMal($('bue-v-msg'), 'No se pudo copiar. Selecciona el texto y cópialo a mano.'); }
  };
  if($('bue-v-dest')) $('bue-v-dest').onclick=function(){
    var bt=this, va=!x.destacada; bt.disabled=true;
    sbPatch('sst_buena?id=eq.'+_enc(x.id)+'&'+filtroObra('sst_buena'), { destacada:va }).then(function(r){
      if(Array.isArray(r) && !r.length) return Promise.reject(403);
      x.destacada=va; BUEW.firma=''; toast(va ? 'Destacada: sale primero, con su estrella.' : 'Ya no está destacada.'); cerrarHoja(); buePintar(); masRecargar();
    }).catch(function(e){ bt.disabled=false; _masMal($('bue-v-msg'), 'No se pudo cambiar. '+porQueFallo(e)); });
  };
  $('bue-v-q').onclick=function(){
    confirmar('¿Quitar esta buena práctica?', '«'+(x.titulo||'')+'» sale de la lista de la obra, aquí y en los celulares del equipo. La foto subida no se borra.', {si:'Sí, quitarla', mal:true}).then(function(si){
      if(!si) return;
      sbDelP('sst_buena?id=eq.'+_enc(x.id)+'&'+filtroObra('sst_buena')).then(function(r){
        if(Array.isArray(r) && !r.length) return Promise.reject(403);
        BUEW.filas=(BUEW.filas||[]).filter(function(y){ return y.id!==x.id; }); BUEW.firma='';
        toast('Buena práctica quitada.'); cerrarHoja(); buePintar(); masRecargar();
      }).catch(function(e){ _masMal($('bue-v-msg'), 'No se pudo quitar. '+porQueFallo(e)); });
    });
  };
}
var BUEF = null;
function bueForm(){
  _masCss(); _yaCss();
  var hoy=hoyISO();
  BUEF={ foto:null, guardando:false };
  var S=BUEF, acts={}; (BUEW.filas||[]).forEach(function(x){ var a=gesTxt(x.actividad); if(a) acts[a]=(acts[a]||0)+1; });
  var h='<div class="campo"><label for="buef-tit">Qué se hizo bien <span class="tenue">· en una línea</span></label><input id="buef-tit" maxlength="120" placeholder="Paró la tarea porque el andamio no tenía rodapié"></div>'+
    '<div class="campo"><label for="buef-desc">Cuéntalo en dos líneas <span class="tenue">· es lo que se lee después en la charla</span></label><textarea id="buef-desc" rows="4" maxlength="1200"></textarea></div>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="buef-fecha">Día</label><input type="date" id="buef-fecha" max="'+hoy+'" value="'+hoy+'"></div>'+
      '<div class="campo"><label for="buef-lugar">Lugar <span class="tenue">· opcional</span></label><input id="buef-lugar" maxlength="120" placeholder="Torre A, piso 4"></div>'+
      '<div class="campo"><label for="buef-act">Actividad <span class="tenue">· opcional</span></label><input id="buef-act" maxlength="120" placeholder="Encofrado" list="buef-acts"><datalist id="buef-acts">'+
        Object.keys(acts).sort(function(a, b){ return acts[b]-acts[a]; }).slice(0, 20).map(function(a){ return '<option value="'+esc(a)+'">'; }).join('')+'</datalist></div></div>'+
    '<div class="campo"><label for="buef-autor">Quién lo hizo <span class="tenue">· la persona o la cuadrilla</span></label><input id="buef-autor" maxlength="120" placeholder="Escribe sus primeras letras"></div>'+
    '<div class="seccion"><h3>La foto <span class="tenue" style="font-weight:400">· opcional</span></h3><div class="mas-foto" id="buef-foto"></div></div>'+
    '<div class="msg" id="buef-msg" role="status"></div>';
  abrirHoja('Anotar una buena práctica', 'Queda en la lista de la obra y en la app de tu equipo', h, '<button type="button" class="bt sec" id="buef-no">Cancelar</button><button type="button" class="bt" id="buef-ok">Guardar</button>', {sinFoco:true});
  $('buef-no').onclick=cerrarHoja;
  sugGente($('buef-autor'), {});
  function foto(){
    var c=$('buef-foto');
    c.innerHTML=(S.foto ? '<img src="'+esc(S.foto.vista)+'" alt="La foto elegida">' : '')+
      '<div class="acciones"><label class="bt sec chico" for="buef-foto-f">'+(S.foto ? 'Cambiar la foto' : '＋ Adjuntar una foto')+'</label><input type="file" id="buef-foto-f" accept="image/*" hidden>'+
      (S.foto ? '<button type="button" class="bt-link" id="buef-foto-q">Quitar</button>' : '')+'</div>';
    $('buef-foto-f').onchange=function(){
      var f=this.files && this.files[0]; if(!f) return;
      masFotoDe(f, 1400).then(function(x){ if(BUEF!==S) return; S.foto=x; foto(); _masDice($('buef-msg'), '', ''); }, function(e){ _masMal($('buef-msg'), masFotoNo(e)); });
    };
    if($('buef-foto-q')) $('buef-foto-q').onclick=function(){ S.foto=null; foto(); };
  }
  foto();
  $('buef-ok').onclick=function(){
    if(S.guardando) return;
    var m=$('buef-msg'), bt=$('buef-ok');
    var t=gesTxt($('buef-tit').value).slice(0, 120), d=String($('buef-desc').value||'').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 1200), f=$('buef-fecha').value;
    if(t.length<6) return _masMal(m, 'Ponle un título: en una línea, qué se hizo bien.', 'buef-tit');
    if(d.length<15) return _masMal(m, 'Cuéntalo en dos líneas. Es lo que se lee después en la charla.', 'buef-desc');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(f)) return _masMal(m, 'Falta el día.', 'buef-fecha');
    if(f>hoyISO()) return _masMal(m, 'Esa fecha todavía no llega. Revísala.', 'buef-fecha');
    if(f<'2000-01-01') return _masMal(m, 'Revisa el año de la fecha.', 'buef-fecha');
    S.guardando=true; bt.disabled=true; _masDice(m, 'Guardando…');
    (S.foto ? subirFoto('buenas', S.foto.blob, 'buena.jpg').then(null, function(){ return ''; }) : Promise.resolve('')).then(function(url){
      var fila={ empresa:YO.obra.id, ext:masId('b'), fecha:f, titulo:t, descripcion:d, lugar:gesTxt($('buef-lugar').value).slice(0, 120)||null, actividad:gesTxt($('buef-act').value).slice(0, 120)||null, autor:gesTxt($('buef-autor').value).slice(0, 120)||null };
      if(url) fila.foto_url=url;
      return sbPostP('sst_buena', fila).then(null, function(c){ if(c===400 && url){ delete fila.foto_url; return sbPostP('sst_buena', fila); } throw c; }).then(function(r){
        if(Array.isArray(r) && !r.length) return Promise.reject(403);
        S.guardando=false; BUEW.firma='';
        toast(S.foto && !url ? 'Guardada, pero la foto no se pudo subir.' : 'Buena práctica guardada.');
        cerrarHoja(); masRecargar();
      });
    }).catch(function(e){ S.guardando=false; bt.disabled=false; _masMal(m, 'No se pudo guardar. '+porQueFallo(e)); });
  };
  _masFoco('buef-tit');
}

/* ── lo de la obra que necesita mas-app.js para dibujar como la app ───────────────────────────
   masCtx(mas) → Promise<C>: la empresa y su logo (ya sin su marco blanco), la obra, los códigos de formato, el personal
   (para el tipo de documento y el puesto), quién firma, el país. «mas» son las llaves propias de cada pantalla (el
   comité guardado, los puntos del trabajador del mes, las credenciales anuladas). */
var MASC = { obra:null, t:0, base:null, pide:null };
function masCtxSoltar(){ MASC.base=null; MASC.t=0; }
function masCtx(mas){
  var oid=(YO.obra||{}).id, nada=function(){ return null; };
  function listo(base){ return Object.assign({}, base, mas||{}); }
  if(MASC.base && MASC.obra===oid && Date.now()-MASC.t<60000) return cargarMasApp().then(function(){ return listo(MASC.base); });
  return Promise.all([
    cargarMasApp(),
    sbGet('sst_doc?empresa=eq.'+_enc(oid)+'&hoja=eq.empleador&select=id,nota&order=id.desc&limit=6').catch(nada),
    estadoLeerP('formatos').catch(nada),
    masGente().catch(function(){ return []; })
  ]).then(function(r){
    var em=_empLeer(r[1]||[]).d, logo=(/^data:image\//.test(String(em.logo||'')) ? em.logo : null);
    var it=(r[2] && r[2].valor && typeof r[2].valor==='object' && r[2].valor.items) || {}, gente=r[3]||[], docs={};
    gente.forEach(function(t){ if(t.dni && t.td) docs[String(t.dni).trim().toUpperCase()]=t.td; });
    return (logo ? MAS_APP.logoSinMarco(logo) : Promise.resolve(null)).then(function(){
      var pais=paisObraP(), o=YO.obra||{};
      var base={ id:oid, obra:String(o.nombre||''), codigo:String(o.codigo||''), sector:sectorObraP(),
        emp:{ razon:String(em.razon||''), logo:logo, dom:String(em.dom||''), ruc:String(o.ruc||''), formatoCod:String(em.formatoCod||''), formatoRev:String(em.formatoRev||''), formatoFecha:String(em.formatoFecha||''), codKardex:String(em.codKardex||'') },
        fmt:it, base:appBase(), doc:docPersonaP(), docs:docs, trabs:gente.map(function(t){ return { id:t.id, nombre:t.nombre, dni:t.dni, puesto:t.puesto }; }),
        n:masActivos(gente).length, sup:gesQuien(), libre:(_dcOrdenPlan()>0), rd:(pais==='do'), tx:(pais!=='pe') ? txPaisP : null, varias:((YO.empresas||[]).length>1) };
      if((YO.obra||{}).id===oid){ MASC.obra=oid; MASC.base=base; MASC.t=Date.now(); }
      return listo(base);
    });
  });
}
/* la firma dibujada, en un PNG con la proporción de su casillero (la app estira la imagen a su caja: así no se deforma) */
function masFirmaPng(tr, W, H){
  if(!tr || !tr.p || !tr.p.length) return '';
  var cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  var g=cv.getContext('2d'); g.fillStyle='#ffffff'; g.fillRect(0, 0, W, H);
  var m=Math.round(H*0.09), alto=tr.h||380, k=Math.min((W-2*m)/1000, (H-2*m)/alto), ox=(W-1000*k)/2, oy=(H-alto*k)/2;
  g.strokeStyle='#0b2a36'; g.lineWidth=Math.max(2, H/58); g.lineCap='round'; g.lineJoin='round';
  tr.p.forEach(function(q){ g.beginPath(); g.moveTo(ox+q[0]*k, oy+q[1]*k); for(var i=2;i<q.length;i+=2) g.lineTo(ox+q[i]*k, oy+q[i+1]*k); g.stroke(); });
  return cv.toDataURL('image/png');
}
function masAbrirPdf(R){
  if(!R || !R.blob) return;
  try{ var u=URL.createObjectURL(R.blob), w=window.open(u, '_blank'); if(!w) bajarBlob(R.blob, R.nombre||'documento.pdf'); setTimeout(function(){ try{ URL.revokeObjectURL(u); }catch(e){} }, 60000); }catch(e2){ bajarBlob(R.blob, R.nombre||'documento.pdf'); }
}

/* ══ 4 · LAS AMONESTACIONES ═══════════════════════════════════════════════════════════════════
   La papeleta de la medida disciplinaria (sst_amonestacion): { duenio, ext, fecha, t_nombre, t_dni, t_puesto, q_nombre,
   q_dni, q_puesto, descripcion, medida, firmas:{ trabajador, jefe, produccion, ssoma }, foto }. Las cuatro firmas quedan
   pendientes y se completan cuando cada uno pueda, aquí o en el celular: cada firma se guarda sobre lo que el servidor
   tiene en ese momento (si entretanto firmó otro en su celular, no se pisa). El PDF es el de la app (mas-app.js).
   El tope del mes es el del plan (amonestacion). */
var MAS_AMON_MEDIDAS = [['Amonestación verbal', 'Amonestación verbal'], ['Amonestación escrita', 'Amonestación escrita'], ['Suspensión 1 día', 'Suspensión de 1 día'], ['Suspensión 2 días', 'Suspensión de 2 días'], ['Suspensión 5 días', 'Suspensión de 5 días'], ['Retiro de obra', 'Retiro de la obra']];
var MAS_AMON_FIRMAS = [['trabajador', 'Trabajador'], ['jefe', 'Jefe inmediato'], ['produccion', 'Jefe de producción'], ['ssoma', 'SSOMA']];
var AMOW = { filas:null, n:0, caja:null, firma:'' };
function _amoMedida(v){ var x=MAS_AMON_MEDIDAS.filter(function(m){ return m[0]===v; })[0]; return x ? x[1] : (v||'—'); }
function _amoPill(v){ return /retiro|suspensi/i.test(v||'') ? 'mal' : (/escrita/i.test(v||'') ? 'ojo' : 'gris'); }
function _amoFirmadas(f){ var n=0; MAS_AMON_FIRMAS.forEach(function(x){ if(f && f[x[0]]) n++; }); return n; }
function _amoTraer(){
  var out=[], PAG=200;
  function pag(desde){
    return sbGet('sst_amonestacion?'+filtroObra('sst_amonestacion')+'&select=ext,fecha,t_nombre,t_dni,t_puesto,q_nombre,descripcion,medida,firmas&order=fecha.desc,ext.asc&limit='+PAG+'&offset='+desde).then(function(a){
      (a||[]).forEach(function(r){
        if(!r || !r.ext) return;
        var fir={}; MAS_AMON_FIRMAS.forEach(function(x){ if(r.firmas && r.firmas[x[0]]) fir[x[0]]=1; });
        /* las imágenes de las firmas no se quedan en la lista: se piden al abrir la papeleta */
        out.push({ ext:String(r.ext), fecha:String(r.fecha||'').slice(0, 10), t_nombre:gesTxt(r.t_nombre), t_dni:gesTxt(r.t_dni), t_puesto:gesTxt(r.t_puesto), q_nombre:gesTxt(r.q_nombre), descripcion:String(r.descripcion||''), medida:gesTxt(r.medida), fir:fir, nf:_amoFirmadas(fir) });
      });
      return ((a||[]).length<PAG || out.length>=3000) ? out : pag(desde+PAG);
    });
  }
  return pag(0);
}
function masVistaAmon(caja){
  _masCss(); _yaCss();
  AMOW.caja=caja;
  var ac=$('acciones');
  if(ac){ ac.innerHTML='<button type="button" class="bt" id="amo-nueva">＋ Registrar una amonestación</button>'; $('amo-nueva').onclick=function(){ amoForm(); }; }
  cargando(caja);
  function pinta(silencio){
    var n=++AMOW.n;
    _amoTraer().then(function(rows){
      if(n!==AMOW.n || VISTA.actual!=='amon') return;
      var firma=''; try{ firma=JSON.stringify(rows)+hoyISO(); }catch(e){}
      if(silencio && firma && firma===AMOW.firma && $('t-amo') && document.body.contains(caja)) return;
      AMOW.firma=firma; AMOW.filas=rows; amoPintar();
    }).catch(function(cod){ if(n!==AMOW.n || VISTA.actual!=='amon') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function _amoLlave(dni, nombre){ var d=String(dni||'').toUpperCase().replace(/[^0-9A-Z]/g, ''); return d ? 'd'+d : 'n'+nrm(nombre); }
function amoPintar(){
  var caja=AMOW.caja; if(!caja || !document.body.contains(caja)) return;
  var F=AMOW.filas||[], mes=MES, anio=ANIO;
  var h='<div class="aviso" id="amo-que"><b>La papeleta de la medida disciplinaria, con sus cuatro firmas.</b> Se registra aquí o en el celular —es la misma lista— y cada uno firma cuando puede: el trabajador, su jefe inmediato, producción y SSOMA. '+
    'Sale en una hoja A4, con las firmas que ya estén hechas.</div>';
  var porP={}; F.forEach(function(a){ var k=_amoLlave(a.t_dni, a.t_nombre); porP[k]=(porP[k]||0)+1; });
  var rein=Object.keys(porP).filter(function(k){ return porP[k]>1; }).length, pend=F.filter(function(a){ return a.nf<MAS_AMON_FIRMAS.length; }).length;
  h+='<div class="rej">'+
    cifra('Este mes', F.filter(function(a){ return a.fecha.slice(0, 7)===mes; }).length, 'en '+_mesNombre(mes), '')+
    cifra('En '+anio, F.filter(function(a){ return a.fecha.slice(0, 4)===anio; }).length, 'en lo que va del año', '')+
    cifra('Con firmas pendientes', pend, pend ? 'les falta al menos una firma' : (F.length ? 'todas firmadas' : '—'), pend ? 'ojo' : (F.length ? 'ok' : ''))+
    cifra('Con más de una', rein, rein ? (rein===1 ? 'persona que ya tenía otra' : 'personas que ya tenían otra') : 'nadie repite', rein ? 'mal' : '')+'</div>';
  h+='<div class="tarj" id="t-amo"></div>';
  var est=$('t-amo') ? $('t-amo')._est : null;
  caja.innerHTML=h;
  if(est) $('t-amo')._est=est;
  var cols=[
    {k:'fecha', t:'Día', h:function(x){ return esc(fechaLarga(x.fecha)); }},
    {k:'t_nombre', t:'Trabajador', h:function(x){ return '<b>'+esc(x.t_nombre)+'</b><span class="sub" data-sin-pais>'+esc([x.t_dni, x.t_puesto].filter(Boolean).join(' · '))+'</span>'; }, v:function(x){ return x.t_nombre+' '+x.t_dni+' '+x.t_puesto; }, csv:function(x){ return x.t_nombre; }},
    {k:'t_dni', t:'Documento', soloCsv:true}, {k:'t_puesto', t:'Cargo', soloCsv:true},
    {k:'medida', t:'Medida', h:function(x){ return '<span class="pill '+_amoPill(x.medida)+'">'+esc(_amoMedida(x.medida))+'</span>'; }, v:function(x){ return _amoMedida(x.medida); }},
    {k:'descripcion', t:'Motivo', h:function(x){ var d=gesTxt(x.descripcion); return esc(d.length>110 ? d.slice(0, 108)+'…' : d); }, v:function(x){ return gesTxt(x.descripcion); }},
    {k:'q_nombre', t:'Quien la impone', soloCsv:true},
    {k:'nf', t:'Firmas', num:true, h:function(x){ return x.nf>=MAS_AMON_FIRMAS.length ? '<span class="pill ok">las 4</span>' : '<span class="pill ojo">'+x.nf+' de 4</span>'; }, v:function(x){ return x.nf; }, csv:function(x){ return x.nf+' de 4'; }},
    {k:'_acc', t:'', acc:true, h:function(){ return '<button type="button" class="bt sec chico" data-acc="abrir">Abrir</button>'; }}
  ];
  tabla($('t-amo'), cols, F, {orden:'fecha', asc:false, unidad:'amonestaciones', archivo:'amonestaciones', vacio:'Ninguna amonestación', vacioSub:'Cuando haga falta, se registra con «＋ Registrar una amonestación» o desde la app.',
    alClic:function(x){ amoVer(x.ext); }, accion:function(acc, x){ amoVer(x.ext); }});
}
var AMOF = null;
function amoForm(){
  _masCss(); _yaCss();
  var hoy=hoyISO();
  AMOF={ t:null, foto:null, guardando:false };
  var S=AMOF;
  var h='<div id="amof-previas"></div>'+
    '<div class="seccion" style="margin-top:0"><h3>A quién</h3>'+
      '<div class="campo"><label for="amof-tn">Apellidos y nombres</label><input id="amof-tn" maxlength="120" placeholder="Escribe sus primeras letras o su documento"></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="amof-td">'+esc(docPersonaP())+'</label><input id="amof-td" maxlength="20"></div>'+
      '<div class="campo"><label for="amof-tp">Cargo</label><input id="amof-tp" maxlength="80"></div></div></div>'+
    '<div class="seccion"><h3>Quien impone la medida</h3>'+
      '<div class="campo"><label for="amof-qn">Apellidos y nombres</label><input id="amof-qn" maxlength="120" value="'+esc(gesQuien())+'"></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="amof-qd">'+esc(docPersonaP())+' <span class="tenue">· opcional</span></label><input id="amof-qd" maxlength="20"></div>'+
      '<div class="campo"><label for="amof-qp">Cargo</label><input id="amof-qp" maxlength="80" value="Supervisor SSOMA"></div></div></div>'+
    '<div class="seccion"><h3>La medida</h3>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="amof-med">Medida disciplinaria</label><select id="amof-med">'+MAS_AMON_MEDIDAS.map(function(m){ return '<option value="'+esc(m[0])+'">'+esc(m[1])+'</option>'; }).join('')+'</select></div>'+
      '<div class="campo"><label for="amof-fecha">Día</label><input type="date" id="amof-fecha" max="'+hoy+'" value="'+hoy+'"></div></div>'+
      '<div class="campo"><label for="amof-desc">Motivo de la sanción <span class="tenue">· lo que pasó, dónde y qué regla se incumplió</span></label><textarea id="amof-desc" rows="5" maxlength="1500"></textarea></div></div>'+
    '<div class="seccion"><h3>Foto del hecho <span class="tenue" style="font-weight:400">· opcional</span></h3><div class="mas-foto" id="amof-foto"></div></div>'+
    '<p class="mas-cupo" id="amof-cupo" hidden></p><div class="msg" id="amof-msg" role="status"></div>';
  abrirHoja('Registrar una amonestación', 'La papeleta queda guardada y después se firma: aquí o en el celular', h, '<button type="button" class="bt sec" id="amof-no">Cancelar</button><button type="button" class="bt" id="amof-ok">Guardar la papeleta</button>', {sinFoco:true});
  $('amof-no').onclick=cerrarHoja;
  function previas(){
    var c=$('amof-previas'), dni=gesTxt($('amof-td').value), nom=gesTxt($('amof-tn').value);
    if(!dni && nom.length<3){ c.innerHTML=''; return; }
    var k=_amoLlave(dni, nom), L=(AMOW.filas||[]).filter(function(a){ return _amoLlave(a.t_dni, a.t_nombre)===k || (!dni && nrm(a.t_nombre)===nrm(nom)); });
    c.innerHTML=L.length ? '<div class="aviso ojo" id="amof-ya"><b>Ya tiene '+gesPlural(L.length, 'amonestación', 'amonestaciones')+':</b> '+L.slice(0, 5).map(function(a){ return esc(fechaLarga(a.fecha))+' — '+esc(_amoMedida(a.medida)); }).join(' · ')+(L.length>5 ? ' · y '+(L.length-5)+' más' : '')+'.</div>'
      : (S.t ? '<div class="aviso ok" id="amof-ya">Sin amonestaciones previas registradas.</div>' : '');
  }
  sugGente($('amof-tn'), { lista:function(){ return masGente().then(masActivos); }, alElegir:function(t){ S.t=t; $('amof-td').value=t.dni||''; $('amof-tp').value=t.puesto||''; previas(); try{ $('amof-desc').focus(); }catch(e){} } });
  $('amof-tn').addEventListener('input', function(){ if(S.t && nrm(this.value)!==nrm(S.t.nombre)) S.t=null; previas(); });
  $('amof-td').addEventListener('input', previas);
  function foto(){
    var c=$('amof-foto');
    c.innerHTML=(S.foto ? '<img src="'+esc(S.foto.vista)+'" alt="La foto elegida">' : '')+
      '<div class="acciones"><label class="bt sec chico" for="amof-foto-f">'+(S.foto ? 'Cambiar la foto' : '＋ Adjuntar una foto')+'</label><input type="file" id="amof-foto-f" accept="image/*" hidden>'+
      (S.foto ? '<button type="button" class="bt-link" id="amof-foto-q">Quitar</button>' : '')+'</div>';
    $('amof-foto-f').onchange=function(){
      var f=this.files && this.files[0]; if(!f) return;
      masFotoDe(f, 1400).then(function(x){ if(AMOF!==S) return; S.foto=x; foto(); _masDice($('amof-msg'), '', ''); }, function(e){ _masMal($('amof-msg'), masFotoNo(e)); });
    };
    if($('amof-foto-q')) $('amof-foto-q').onclick=function(){ S.foto=null; foto(); };
  }
  foto();
  masCupo('amonestacion', 1).then(function(r){
    if(AMOF!==S || !$('amof-cupo') || r.tope<0 || r.sinLeer) return;
    var c=$('amof-cupo'); c.hidden=false;
    c.innerHTML='Tu plan <b>'+esc(r.plan)+'</b> trae '+r.tope+' amonestaciones al mes: van <b>'+r.lleva+'</b>'+(r.queda ? ', quedan '+r.queda+'.' : ' y ya no queda ninguna este mes.');
  });
  $('amof-ok').onclick=function(){
    if(S.guardando) return;
    var m=$('amof-msg'), bt=$('amof-ok');
    var tn=gesTxt($('amof-tn').value).slice(0, 120), d=String($('amof-desc').value||'').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 1500), f=$('amof-fecha').value;
    if(tn.length<3) return _masMal(m, 'Falta el nombre del trabajador.', 'amof-tn');
    if(d.length<10) return _masMal(m, 'Describe lo que pasó, aunque sea en dos líneas.', 'amof-desc');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(f)) return _masMal(m, 'Falta el día.', 'amof-fecha');
    if(f>hoyISO()) return _masMal(m, 'Ese día todavía no llega.', 'amof-fecha');
    if(f<'2000-01-01') return _masMal(m, 'Revisa el año de la fecha.', 'amof-fecha');
    S.guardando=true; bt.disabled=true; _masDice(m, 'Guardando…');
    var ext=masId('a');
    masCupo('amonestacion', 1).then(function(r){
      if(!r.ok){ S.guardando=false; bt.disabled=false; _masDice(m, '', ''); return masTopeAviso(r, 'amonestaciones'); }
      return (S.foto ? subirFoto('amonestaciones', S.foto.blob, 'hecho.jpg').then(null, function(){ return ''; }) : Promise.resolve('')).then(function(url){
        var fila={ duenio:String(YO.obra.id), ext:ext, fecha:f, t_nombre:tn, t_dni:gesTxt($('amof-td').value).slice(0, 20), t_puesto:gesTxt($('amof-tp').value).slice(0, 80),
          q_nombre:gesTxt($('amof-qn').value).slice(0, 120), q_dni:gesTxt($('amof-qd').value).slice(0, 20), q_puesto:gesTxt($('amof-qp').value).slice(0, 80), descripcion:d, medida:$('amof-med').value, firmas:{} };
        if(url) fila.foto=url;
        return sbPostP('sst_amonestacion', fila).then(function(rr){
          if(Array.isArray(rr) && !rr.length) return Promise.reject(403);
          masSumar('amonestacion', 1);
          S.guardando=false; AMOW.firma='';
          toast(S.foto && !url ? 'Papeleta guardada, pero la foto no se pudo subir. Faltan las 4 firmas.' : 'Papeleta guardada. Faltan las 4 firmas.');
          masRecargar();
          amoVer(ext);
        });
      });
    }).catch(function(e){ S.guardando=false; if(bt) bt.disabled=false; _masMal(m, 'No se pudo guardar. '+porQueFallo(e)); });
  };
  _masFoco('amof-tn');
}
function _amoUna(ext){
  return sbGet('sst_amonestacion?'+filtroObra('sst_amonestacion')+'&ext=eq.'+_enc(ext)+'&select=ext,fecha,t_nombre,t_dni,t_puesto,q_nombre,q_dni,q_puesto,descripcion,medida,firmas,foto&limit=1').then(function(r){ return (r && r[0]) || null; });
}
function _amoLocal(a){ return { fecha:String(a.fecha||'').slice(0, 10), tNombre:a.t_nombre||'', tDni:a.t_dni||'', tPuesto:a.t_puesto||'', qNombre:a.q_nombre||'', qDni:a.q_dni||'', qPuesto:a.q_puesto||'', desc:a.descripcion||'', medida:a.medida||'', firmas:(a.firmas && typeof a.firmas==='object') ? a.firmas : {} }; }
function amoPdf(a){
  return masCtx().then(function(C){
    var R=MAS_APP.usar(C).amonPdf(_amoLocal(a));
    R.nombre=nombreArchivo('Amonestacion - '+(a.t_nombre||'trabajador')+' - '+String(a.fecha||'').slice(0, 10))+'.pdf';
    return R;
  });
}
/* 07/10/2026 · la misma papeleta en Word: el formato de la app (mas-word.js, que se pide recién al tocar el botón), con
   los datos de la empresa de la obra, la medida marcada y las firmas que ya estén hechas → { blob, nombre } */
function amoWord(a){
  return Promise.all([masCtx(), cargarMasWord()]).then(function(r){
    var C=r[0];
    /* el logo, ya sin su marco blanco y con su proporción (masCtx lo dejó listo): así no sale recortado ni estirado */
    return (C.emp.logo ? MAS_APP.logoSinMarco(C.emp.logo).then(null, function(){ return null; }) : Promise.resolve(null)).then(function(L){
      var blob=MAS_WORD.usar({ emp:C.emp, logo:L, obra:C.obra, doc:C.doc, tx:C.tx }).papeleta(_amoLocal(a));
      if(!blob) throw { portal:'El Word no se pudo armar.' };
      return { blob:blob, nombre:nombreArchivo('Amonestacion - '+(a.t_nombre||'trabajador')+' - '+String(a.fecha||'').slice(0, 10))+'.docx' };
    });
  });
}
var AMOV = { ext:null, a:null, tok:0 };
function amoVer(ext, aviso){
  _masCss(); _yaCss();
  var tok=++AMOV.tok; AMOV.ext=ext; AMOV.a=null;
  abrirHoja('Amonestación', '', '<div class="vacio">Cargando…</div>', '', {sinFoco:true, ancha:true});
  _amoUna(ext).then(function(a){
    if(tok!==AMOV.tok) return;
    if(!a){ $('hoja-cuerpo').innerHTML='<div class="vacio"><b>Esa papeleta ya no está</b>La quitaron desde otro equipo.</div>'; masRecargar(); return; }
    AMOV.a=a; _amoVerPintar(aviso);
  }, function(e){ if(tok!==AMOV.tok) return; $('hoja-cuerpo').innerHTML='<div class="vacio"><b>No se pudo abrir</b>'+esc(porQueFallo(e))+'</div>'; });
}
function _amoVerPintar(aviso){
  var a=AMOV.a, F=(a.firmas && typeof a.firmas==='object') ? a.firmas : {}, nf=_amoFirmadas(F);
  var dd=[['Trabajador', a.t_nombre], [docPersonaP(), a.t_dni], ['Cargo', a.t_puesto], ['Quien impone la medida', [a.q_nombre, a.q_puesto].filter(Boolean).join(' · ')], ['Medida', _amoMedida(a.medida)]].filter(function(d){ return d[1]; });
  var h=(aviso ? '<div class="aviso ok" id="amov-aviso">'+esc(aviso)+'</div>' : '')+
    '<dl class="datos" data-sin-pais>'+dd.map(function(d){ return '<dt>'+esc(d[0])+'</dt><dd>'+esc(d[1])+'</dd>'; }).join('')+'</dl>'+
    '<div class="seccion"><h3>Motivo de la sanción</h3><p class="mas-texto" id="amov-desc">'+esc(a.descripcion||'—')+'</p></div>'+
    (_edImgOk(a.foto) ? '<div class="seccion"><h3>Foto del hecho</h3><img class="mas-ver-foto" src="'+esc(a.foto)+'" alt="Foto del hecho" style="max-height:300px"></div>' : '')+
    '<div class="seccion"><h3>Firmas · '+(nf>=4 ? 'las 4' : nf+' de 4')+'</h3><div class="mas-firmas" id="amov-firmas">'+MAS_AMON_FIRMAS.map(function(f){
      var du=F[f[0]], ok=/^data:image\//.test(String(du||''));
      return '<div class="mas-firma-c'+(ok ? ' ok' : '')+'" data-k="'+f[0]+'"><div class="mas-firma-i">'+(ok ? '<img src="'+esc(du)+'" alt="Firma de '+esc(f[1])+'">' : '<span>Pendiente</span>')+'</div>'+
        '<b>'+esc(f[1])+'</b>'+(ok ? '<span class="pill ok">firmó</span>' : '<button type="button" class="bt sec chico" data-firmar="'+f[0]+'">Firmar aquí</button>')+'</div>'; }).join('')+'</div>'+
      '<div id="amov-zona"></div></div>'+
    '<div class="seccion"><h3>La papeleta</h3><p class="ayuda" style="margin:0 0 8px">Una hoja A4, con las firmas que ya estén hechas; las que faltan salen como «pendiente de firma». También se descarga en Word, en el formato de siempre, por si hay que completarla o corregirla a mano.</p><div class="pdfv" id="amov-pdf" aria-label="Vista previa de la papeleta"></div></div>'+
    '<div class="msg" id="amov-msg" role="status"></div>';
  abrirHoja('Amonestación · '+(a.t_nombre||''), fechaLarga(a.fecha)+' · '+_amoMedida(a.medida), h,
    '<button type="button" class="bt mal" id="amov-q">Quitar</button><button type="button" class="bt sec" id="amov-word">Descargar en Word</button><button type="button" class="bt sec" id="amov-abrir">Abrir el PDF</button><button type="button" class="bt" id="amov-bajar">Descargar la papeleta</button>', {sinFoco:true, ancha:true});
  Array.prototype.forEach.call(document.querySelectorAll('#amov-firmas [data-firmar]'), function(b){ b.onclick=function(){ _amoFirmar(b.getAttribute('data-firmar')); }; });
  var tok=AMOV.tok, R0=null, caja=$('amov-pdf');
  caja.innerHTML='<div class="pdfv-msg">Armando la papeleta…</div>';
  var pide=amoPdf(a).then(function(R){ R0=R; if(tok===AMOV.tok && caja.isConnected) pdfVistaP(caja, R.blob); return R; });
  pide.catch(function(){ if(tok===AMOV.tok && caja.isConnected) caja.innerHTML='<div class="pdfv-msg">No se pudo armar la papeleta. Revisa tu conexión e inténtalo otra vez.</div>'; });
  function con(f){ return function(){ var bt=this; bt.disabled=true; (R0 ? Promise.resolve(R0) : amoPdf(a)).then(function(R){ bt.disabled=false; f(R); }, function(){ bt.disabled=false; _masMal($('amov-msg'), 'No se pudo armar la papeleta. Revisa tu conexión e inténtalo otra vez.'); }); }; }
  $('amov-bajar').onclick=con(function(R){ bajarBlob(R.blob, R.nombre); if(R.recorto) toast('El motivo es largo: en la hoja sale recortado para que entre en una sola.'); });
  $('amov-abrir').onclick=con(masAbrirPdf);
  $('amov-word').onclick=function(){
    var bt=this, m=$('amov-msg'); bt.disabled=true; _masDice(m, 'Armando el Word…');
    amoWord(a).then(function(R){ bt.disabled=false; _masDice(m, '', ''); bajarBlob(R.blob, R.nombre); toast('Papeleta en Word descargada: '+R.nombre); },
      function(e){ bt.disabled=false; _masMal(m, 'No se pudo armar el Word. '+((e && e.portal) ? e.portal : 'Revisa tu conexión e inténtalo otra vez.')); });
  };
  $('amov-q').onclick=function(){
    confirmar('¿Quitar esta amonestación?', 'La papeleta de '+(a.t_nombre||'este trabajador')+' del '+fechaLarga(a.fecha)+' se borra de la obra, aquí y en los celulares del equipo, con sus firmas. No se puede deshacer.', {si:'Sí, quitarla', mal:true}).then(function(si){
      if(!si) return;
      sbDelP('sst_amonestacion?'+filtroObra('sst_amonestacion')+'&ext=eq.'+_enc(a.ext)).then(function(r){
        if(Array.isArray(r) && !r.length) return Promise.reject(403);
        AMOW.firma=''; toast('Amonestación quitada.'); cerrarHoja(); masRecargar();
      }).catch(function(e){ _masMal($('amov-msg'), 'No se pudo quitar. '+porQueFallo(e)); });
    });
  };
}
function _amoFirmar(k){
  var a=AMOV.a, f=MAS_AMON_FIRMAS.filter(function(x){ return x[0]===k; })[0], z=$('amov-zona'); if(!a || !f || !z) return;
  var quien=(k==='trabajador') ? a.t_nombre : '';
  z.innerHTML='<div class="tarj piq-form" id="amov-f" style="margin:12px 0 0"><div class="tarj-cuerpo"><b>Firma · '+esc(f[1])+(quien ? ' · '+esc(quien) : '')+'</b>'+
    '<p class="ayuda" style="margin:2px 0 0">Firma la persona, aquí mismo, con el mouse, el dedo o el lápiz.</p>'+
    '<div class="lienzo" id="amov-lienzo"><canvas></canvas><div class="guia"></div><div class="pista">Firma aquí con el mouse, el dedo o el lápiz</div></div>'+
    '<p class="msg" id="amov-fm"></p><div class="acciones"><button type="button" class="bt sec chico" id="amov-fb">Borrar y repetir</button>'+
    '<button type="button" class="bt sec chico" id="amov-fn">Todavía no</button><button type="button" class="bt ok" id="amov-fs">Guardar la firma</button></div></div></div>';
  var limpia=function(){ _masDice($('amov-fm'), '', ''); };
  setTimeout(function(){ if(!$('amov-lienzo')) return; prepLienzo($('amov-lienzo'), 180, limpia); try{ $('amov-f').scrollIntoView({block:'center', behavior:'smooth'}); }catch(e){} }, 30);
  $('amov-fb').onclick=function(){ prepLienzo($('amov-lienzo'), 180, limpia); };
  $('amov-fn').onclick=function(){ z.innerHTML=''; };
  $('amov-fs').onclick=function(){
    var m=$('amov-fm'), bt=$('amov-fs'), tr=atsNorm(LIENZO.trazos);
    if(!tr || lienzoPuntos()<12) return _masMal(m, 'Falta la firma: se firma dentro del recuadro.');
    var png=masFirmaPng(tr, 720, 162);
    if(!/^data:image\/png;base64,/.test(png)) return _masMal(m, 'No se pudo tomar la firma. Bórrala y repítela.');
    bt.disabled=true; _masDice(m, 'Guardando…');
    /* sobre lo que el servidor tiene AHORA: si otro ya firmó en su celular, su firma se queda */
    _amoUna(a.ext).then(function(ya){
      if(!ya) return Promise.reject({ portal:'Esa papeleta ya no está: la quitaron desde otro equipo.', fuera:true });
      var F=(ya.firmas && typeof ya.firmas==='object') ? ya.firmas : {};
      if(F[k]) return Promise.reject({ portal:'«'+f[1]+'» ya firmó desde otro equipo.', ya:true });
      var junto={}; for(var q in F) junto[q]=F[q]; junto[k]=png;
      return sbPatch('sst_amonestacion?'+filtroObra('sst_amonestacion')+'&ext=eq.'+_enc(a.ext), { firmas:junto }).then(function(r){
        if(Array.isArray(r) && !r.length) return Promise.reject(403);
        AMOW.firma=''; masRecargar();
        amoVer(a.ext, 'Firma de «'+f[1]+'» guardada.'+(_amoFirmadas(junto)>=4 ? ' Ya están las cuatro.' : ''));
      });
    }).catch(function(e){
      if(e && (e.ya || e.fuera)){ toast(e.portal); AMOW.firma=''; masRecargar(); if(e.fuera) cerrarHoja(); else amoVer(a.ext); return; }
      bt.disabled=false; _masMal(m, 'No se pudo guardar la firma. '+porQueFallo(e));
    });
  };
}

/* ══ 5 · LAS CREDENCIALES ═════════════════════════════════════════════════════════════════════
   La credencial de cada trabajador, con su QR firmado y su carné. Es la misma lista de la app: sst_estado, llave
   «credenciales» = [{ n, d, v, cod, h:[…], c, trab, hecho }], y «credenciales_anuladas» = { código: cuándo } (la que
   se anula deja su lápida 190 días, para que ningún celular la vuelva a subir). El código lo arma la app (mas-app.js):
   «OBRASST-CRED:» + los datos + su firma; el QR abre la app con la credencial después del «#», así que los datos no
   pasan por ningún servidor. Cada escritura va sobre lo que el servidor tiene en ese momento.
   El tope es el del plan (credencial, en total).
   07/10/2026 · EL SELLO «CAPACITACIÓN AL DÍA» (Marcelo: «…el sello capacitación al día»). Es la «k» del código: la fecha
   —en seis cifras— hasta la que la persona tiene aprobado y vigente TODO lo que el plan de la obra le exige a su puesto.
   La cuenta es la de la matriz del portal (estadoDe, la de la app): el plan por puesto (sst_doc «temas», pc:1) contra las
   constancias de la obra y las capacitaciones registradas en «Realizadas». Sin plan no hay sello. Sale solo al emitir,
   y a la credencial ya emitida se le pone o se le quita volviéndola a emitir —su QR cambia, como en la app—: el código
   viejo deja su lápida y el carné impreso hay que imprimirlo otra vez (se avisa antes). */
var CREW = { lista:null, tumbas:{}, gente:[], com:null, cap:undefined, n:0, caja:null, firma:'' };
var CRECAP = { obra:null, t:0, d:null, pide:null };
var CRE_ST = { si:'Al día', pv:'Por vencer', ven:'Vencida', de:'Desaprobó', no:'Falta' };
/* el plan por puesto y las constancias de la obra (con lo registrado en «Realizadas»), como los lee la matriz → { plan, cons } */
function _creCap(fresco){
  var oid=(YO.obra||{}).id;
  if(CRECAP.obra!==oid){ CRECAP.obra=oid; CRECAP.d=null; CRECAP.t=0; CRECAP.pide=null; }
  if(!fresco && CRECAP.d && Date.now()-CRECAP.t<60000) return Promise.resolve(CRECAP.d);
  if(CRECAP.pide) return CRECAP.pide;
  var p=Promise.all([consMasHechas(traer('sst_constancia', '&select=fecha,trabajador,dni,tema,tipo,resultado,cargo&order=fecha.desc', 5000)),
                     traer('sst_doc', '&select=id,hoja,nota&hoja=eq.temas&order=creado.desc', 300)]).then(function(r){
    if(CRECAP.pide===p) CRECAP.pide=null;
    var d={ cons:r[0]||[], plan:planDeFilas(r[1]) };
    if((YO.obra||{}).id===oid){ CRECAP.d=d; CRECAP.t=Date.now(); }
    return d;
  }, function(e){ if(CRECAP.pide===p) CRECAP.pide=null; throw e; });
  CRECAP.pide=p; return p;
}
/* las constancias de una persona, como las junta la app: por su documento si los dos lo tienen; si no, por su nombre */
function _creCapsDe(q, cons){
  var qd=String(q.dni||'').replace(/\D/g, ''), qn=MAS_APP.normNom(q.nombre||'');
  return (cons||[]).filter(function(c){
    var cd=String(c.dni||'').replace(/\D/g, '');
    if(cd && qd) return cd===qd;
    var a=MAS_APP.normNom(c.trabajador||'');
    return !!(a && qn && a===qn);
  });
}
/* el sello que le toca a alguien → { k:'270912' ('' si no está al día), hasta, est } · null si la obra no tiene plan */
function _creSelloDe(q, D){
  if(!D || !D.plan) return null;
  var est=estadoDe(_creCapsDe(q, D.cons), q.puesto||'', D.plan, null);
  return { k:est.completo ? MAS_APP.pcCorto(est.hasta) : '', hasta:est.completo ? est.hasta : '', est:est };
}
/* la ficha de quien tiene esta credencial (por su ficha, por su documento o, sin documento, por su nombre) */
function _creFicha(c){
  var d=_creDocLlave(c.d), n=nrm(c.n), G=CREW.gente||[], i, t;
  if(c.trab) for(i=0;i<G.length;i++){ t=G[i]; if(t.ext && String(c.trab)===String(t.ext)) return t; }
  for(i=0;i<G.length;i++){ t=G[i]; if(d ? _creDocLlave(t.dni)===d : (!_creDocLlave(t.dni) && nrm(t.nombre)===n)) return t; }
  return null;
}
/* el sello que LLEVA una credencial y el que le TOCA hoy → { lleva:{f, vig}|null, toca:(como _creSelloDe; undefined si todavía no se sabe), k } */
function _creSelloInfo(c){
  var d=null; try{ d=MAS_APP.credDatos(c.cod); }catch(e){ d=null; }
  var t=_creFicha(c), q={ dni:(d && d.d) || c.d || '', nombre:(d && d.n) || c.n || '', puesto:(t && t.puesto) || (d && d.c) || c.c || '' };
  return { lleva:d ? MAS_APP.pcSelloQR(d.k) : null, k:String((d && d.k)||''), toca:(CREW.cap===undefined) ? undefined : _creSelloDe(q, CREW.cap), q:q };
}
/* cómo se dice, y qué se puede hacer → { cl, t, que:'poner'|'quitar'|'', otro } */
function _creSelloEst(s){
  var L=s.lleva, T=s.toca, al=function(){ return 'Al día hasta el '+(fechaLarga(L.f)||L.f); };
  if(T===undefined || T===null) return L ? { cl:L.vig ? 'ok' : 'mal', t:L.vig ? al() : 'Sello vencido el '+(fechaLarga(L.f)||L.f), que:'' } : { cl:'', t:'', que:'' };
  var puede=!!T.k;
  if(L && L.vig){
    if(!puede) return { cl:'ojo', t:'Sello sin respaldo', que:'quitar' };
    return (T.k===s.k) ? { cl:'ok', t:al(), que:'' } : { cl:'ok', t:al(), que:'poner', otro:true };
  }
  if(puede) return { cl:'azul', t:'Puede llevar el sello', que:'poner' };
  if(L) return { cl:'mal', t:'Sello vencido el '+(fechaLarga(L.f)||L.f), que:'' };
  if(T.est && T.est.n) return { cl:'gris', t:'Al día: '+T.est.vig+' de '+T.est.n, que:'' };
  return { cl:'', t:'', que:'' };
}
function _creClaveCom(){ return 'comite_emp:'+String((YO.obra||{}).codigo||''); }
function _creLimpia(l, tumbas){
  var vistos={}, out=[];
  (Array.isArray(l) ? l : []).forEach(function(c){ var k=String((c && c.cod)||''); if(!k || vistos[k] || (tumbas && tumbas[k])) return; vistos[k]=1; out.push(c); });
  return out;
}
function _creTraer(){
  var nada=function(){ return null; };
  return Promise.all([cargarMasApp(), cargarQRLib().catch(nada), estadoLeerP('credenciales'), estadoLeerP('credenciales_anuladas').catch(nada), masGente().catch(function(){ return []; }),
                      (YO.obra||{}).codigo ? estadoLeerP(_creClaveCom()).catch(nada) : Promise.resolve(null)]).then(function(r){
    var t=(r[3] && r[3].valor && typeof r[3].valor==='object' && !Array.isArray(r[3].valor)) ? MAS_APP.tumbasVivas(r[3].valor) : {};
    return { lista:_creLimpia(r[2] && r[2].valor, t), tumbas:t, gente:r[4]||[], com:(r[5] && r[5].valor && typeof r[5].valor==='object') ? r[5].valor : null };
  });
}
function _creEstado(c, hoy){
  var v=String((c && c.v)||'').slice(0, 10);
  if(!v) return { k:'vig', t:'sin fecha', cl:'gris' };
  if(v<hoy) return { k:'ven', t:'venció el '+fechaLarga(v), cl:'mal' };
  var dias=Math.round((new Date(v+'T00:00:00')-new Date(hoy+'T00:00:00'))/86400000);
  return dias<=30 ? { k:'pv', t:'vence el '+fechaLarga(v), cl:'ojo' } : { k:'vig', t:'hasta el '+fechaLarga(v), cl:'ok' };
}
function _creDocLlave(v){ return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
/* la credencial vigente de una persona (por su ficha, por su documento o, sin documento, por su nombre) */
function _creDe(t, hoy){
  var d=_creDocLlave(t.dni), n=nrm(t.nombre), mejor=null;
  (CREW.lista||[]).forEach(function(c){
    var suya=(c.trab && t.ext && String(c.trab)===String(t.ext)) || (d && _creDocLlave(c.d)===d) || (!d && !_creDocLlave(c.d) && nrm(c.n)===n);
    if(!suya || (c.v && String(c.v).slice(0, 10)<hoy)) return;
    if(!mejor || String(c.v||'9999')>String(mejor.v||'9999')) mejor=c;
  });
  return mejor;
}
function masVistaCred(caja){
  _masCss(); _yaCss();
  CREW.caja=caja;
  var ac=$('acciones');
  if(ac){ ac.innerHTML='<button type="button" class="bt sec" id="cre-stk" hidden>🪖 Stickers del casco</button><button type="button" class="bt" id="cre-nueva">＋ Emitir una credencial</button>';
    $('cre-nueva').onclick=function(){ creForm(); }; $('cre-stk').onclick=function(){ stkwAbrir(null); }; }
  cargando(caja);
  function pinta(silencio){
    var n=++CREW.n;
    /* lo de la capacitación (el plan y las constancias) no detiene la lista: si no se pudo leer, la columna sale sin dato */
    Promise.all([_creTraer(), _creCap(!silencio).catch(function(){ return null; })]).then(function(rr){
      var R=rr[0], D=rr[1];
      if(n!==CREW.n || VISTA.actual!=='cred') return;
      var firma=''; try{ firma=JSON.stringify([R.lista, R.tumbas, R.gente.length, D ? [D.plan, D.cons.length, (D.cons[0]||{}).fecha||''] : 0])+hoyISO(); }catch(e){}
      if(silencio && firma && firma===CREW.firma && $('t-cre') && document.body.contains(caja)) return;
      CREW.firma=firma; CREW.lista=R.lista; CREW.tumbas=R.tumbas; CREW.gente=R.gente; CREW.com=R.com; CREW.cap=(D===null) ? undefined : D; crePintar();
    }).catch(function(cod){ if(n!==CREW.n || VISTA.actual!=='cred') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function crePintar(){
  var caja=CREW.caja; if(!caja || !document.body.contains(caja)) return;
  var L=CREW.lista||[], hoy=hoyISO(), E={ vig:0, pv:0, ven:0 };
  L.forEach(function(c){ E[_creEstado(c, hoy).k]++; });
  /* los stickers salen de las credenciales vigentes (como en la app): sin ninguna, el botón no se ofrece */
  if($('cre-stk')) $('cre-stk').hidden=!(E.vig+E.pv);
  var act=masActivos(CREW.gente), sin=act.filter(function(t){ return !_creDe(t, hoy); });
  var h='<div class="aviso" id="cre-que"><b>La credencial de cada trabajador, con su QR y su carné para imprimir.</b> Se escanea con la cámara del celular en la puerta: la app comprueba que no fue alterada y si sigue vigente, también sin señal. '+
    'Las que se emiten aquí salen en la app de tu equipo, y las del celular, aquí.</div>';
  h+='<div class="rej">'+
    cifra('Vigentes', E.vig+E.pv, L.length ? 'de '+L.length+' emitidas' : 'ninguna emitida', (E.vig+E.pv) ? 'ok' : '')+
    cifra('Vencen en 30 días', E.pv, E.pv ? 'conviene renovarlas' : 'ninguna por vencer', E.pv ? 'ojo' : '')+
    cifra('Vencidas', E.ven, E.ven ? 'ya no habilitan' : 'ninguna', E.ven ? 'mal' : '')+
    cifra('Sin credencial', act.length ? sin.length : '—', act.length ? 'de '+act.length+' en tu personal' : 'sin personal cargado', sin.length ? 'ojo' : (act.length ? 'ok' : ''))+'</div>';
  /* el sello «Capacitación al día»: a quién se le puede poner y a quién ya no lo respalda su capacitación */
  var SE=L.map(function(c){ return _creSelloEst(_creSelloInfo(c)); }), nPon=SE.filter(function(e){ return e.que==='poner' && !e.otro; }).length, nQui=SE.filter(function(e){ return e.que==='quitar'; }).length;
  if(CREW.cap && !CREW.cap.plan && L.length) h+='<p class="ayuda" id="cre-sin-plan" style="margin:0 0 14px">Las credenciales pueden llevar el sello «Capacitación al día» cuando la obra dice qué exige cada puesto. El plan se arma en la app, en «Lo que exige cada puesto».</p>';
  else if(nPon || nQui) h+='<div class="aviso'+(nQui ? ' ojo' : '')+'" id="cre-sellos">🎓 '+
    (nPon ? '<b>'+(nPon===1 ? '1 credencial puede llevar' : nPon+' credenciales pueden llevar')+' el sello «Capacitación al día»:</b> su dueño tiene aprobado y vigente todo lo que exige su puesto. ' : '')+
    (nQui ? '<b>'+(nQui===1 ? '1 lo lleva' : nQui+' lo llevan')+' sin respaldo:</b> ahora le falta algo de lo que exige su puesto. ' : '')+'Abre su carné para '+(nPon && nQui ? 'ponérselo o quitárselo' : (nPon ? 'ponérselo' : 'quitárselo'))+'.</div>';
  if(sin.length) h+='<div class="tarj" id="cre-sin"><div class="tarj-cab"><div><h2>Les falta su credencial</h2><p class="sub">Del personal activo, quienes no tienen una vigente. Toca a alguien para emitírsela.</p></div></div><div class="tarj-cuerpo"><div class="chips">'+
    sin.slice(0, 40).map(function(t, i){ return '<button type="button" class="chip" data-sin="'+i+'">'+esc(t.nombre)+(t.puesto ? ' <i>'+esc(t.puesto)+'</i>' : '')+'</button>'; }).join('')+
    (sin.length>40 ? '<span class="tenue" style="align-self:center;font-size:12.5px">y '+(sin.length-40)+' más</span>' : '')+'</div></div></div>';
  h+='<div class="tarj" id="t-cre"></div>';
  var est=$('t-cre') ? $('t-cre')._est : null;
  caja.innerHTML=h;
  if(est) $('t-cre')._est=est;
  Array.prototype.forEach.call(caja.querySelectorAll('[data-sin]'), function(b){ b.onclick=function(){ creForm(sin[+b.getAttribute('data-sin')]); }; });
  var filas=L.map(function(c, i){ var e=_creEstado(c, hoy); return { cod:c.cod, n:gesTxt(c.n), d:gesTxt(c.d), c:gesTxt(c.c), v:String(c.v||'').slice(0, 10), h:Array.isArray(c.h) ? c.h : [], hecho:String(c.hecho||''), e:e, se:SE[i], _c:c }; });
  var cols=[
    {k:'n', t:'Trabajador', h:function(x){ return '<b>'+esc(x.n)+'</b><span class="sub" data-sin-pais>'+esc([x.d, x.c].filter(Boolean).join(' · '))+'</span>'; }, v:function(x){ return x.n+' '+x.d+' '+x.c; }, csv:function(x){ return x.n; }},
    {k:'d', t:'Documento', soloCsv:true}, {k:'c', t:'Cargo', soloCsv:true},
    {k:'h', t:'Habilitaciones', h:function(x){ return x.h.length ? x.h.map(function(k){ var y=MAS_APP.habilDe(k); return y ? '<span class="pill '+(y.bri ? 'azul' : 'gris')+'" title="'+esc(y.n)+'">'+y.ic+' '+esc(y.n)+'</span>' : ''; }).join(' ') : '<span class="tenue">—</span>'; },
      v:function(x){ return x.h.map(function(k){ var y=MAS_APP.habilDe(k); return y ? y.n : ''; }).filter(Boolean).join(', '); }},
    {k:'v', t:'Vigencia', h:function(x){ return '<span class="pill '+x.e.cl+'">'+esc(x.e.t)+'</span>'; }, v:function(x){ return x.v; }, csv:function(x){ return x.v ? fechaLarga(x.v) : ''; }},
    {k:'se', t:'Capacitación', h:function(x){ return x.se.t ? '<span class="pill '+x.se.cl+'" data-sello="'+(x.se.que||'-')+'">🎓 '+esc(x.se.t)+'</span>' : '<span class="tenue">—</span>'; }, v:function(x){ return x.se.t; }, csv:function(x){ return x.se.t; }},
    {k:'hecho', t:'Emitida', h:function(x){ return x.hecho ? esc(fechaLarga(x.hecho)) : '<span class="tenue">—</span>'; }, v:function(x){ return x.hecho; }, csv:function(x){ return x.hecho ? fechaLarga(x.hecho) : ''; }},
    {k:'_acc', t:'', acc:true, h:function(){ return '<button type="button" class="bt sec chico" data-acc="abrir">Carné</button> <button type="button" class="bt mal chico" data-acc="anular">Anular</button>'; }}
  ];
  tabla($('t-cre'), cols, filas, {orden:'hecho', asc:false, unidad:'credenciales', archivo:'credenciales', vacio:'Ninguna credencial todavía', vacioSub:'Emite la primera con «＋ Emitir una credencial»: sale con su QR y su carné para imprimir.',
    alClic:function(x){ creVer(x.cod); }, accion:function(acc, x){ if(acc==='anular') creAnular(x._c); else creVer(x.cod); }});
}
function _creMasMeses(iso, m){ var p=iso.split('-'), d=new Date(+p[0], +p[1]-1+m, +p[2]); if(d.getDate()!==+p[2]) d=new Date(+p[0], +p[1]+m, 0); return d.getFullYear()+'-'+dos(d.getMonth()+1)+'-'+dos(d.getDate()); }
var CREF = null;
function creForm(pre){
  _masCss(); _yaCss();
  var hoy=hoyISO();
  CREF={ t:null, h:[], guardando:false };
  var S=CREF;
  var h='<div class="campo"><label for="cref-n">Apellidos y nombres</label><input id="cref-n" maxlength="120" placeholder="Escribe sus primeras letras o su documento"></div>'+
    '<div class="fila-c ya-al"><div class="campo"><label for="cref-d">'+esc(docPersonaP())+'</label><input id="cref-d" maxlength="20"></div>'+
      '<div class="campo"><label for="cref-c">Cargo</label><input id="cref-c" maxlength="80"></div>'+
      '<div class="campo"><label for="cref-v">Habilitado hasta</label><input type="date" id="cref-v" min="'+hoy+'" value="'+_creMasMeses(hoy, 3)+'"></div></div>'+
    '<div id="cref-ya"></div><div id="cref-cap"></div>'+
    '<div class="seccion"><h3>Para qué está habilitado <span class="tenue" style="font-weight:400">· lo que la empresa le autoriza</span></h3><div class="chips" id="cref-h">'+
      MAS_APP.HABIL.map(function(x){ return '<button type="button" class="chip" aria-pressed="false" data-k="'+x.k+'"><span aria-hidden="true">'+x.ic+'</span> '+esc(x.n)+'</button>'; }).join('')+'</div>'+
      '<p class="ayuda" style="margin:8px 0 0">Una capacitación no es una habilitación: habilitar es un acto de la empresa, con su examen médico y su aptitud de por medio.</p></div>'+
    '<div class="seccion" id="cref-sos-s" hidden><h3>En caso de emergencia</h3><label class="chk"><input type="checkbox" id="cref-sos" checked> <span id="cref-sos-t"></span></label>'+
      '<p class="ayuda" style="margin:6px 0 0">Son los datos de su ficha. Van dentro del QR —se ven al escanearlo— y el grupo sanguíneo, también en el carné. Se cargan y se corrigen en su ficha, en la app.</p></div>'+
    '<p class="mas-cupo" id="cref-cupo" hidden></p><div class="msg" id="cref-msg" role="status"></div>';
  abrirHoja('Emitir una credencial', 'Con su QR firmado y su carné para imprimir', h, '<button type="button" class="bt sec" id="cref-no">Cancelar</button><button type="button" class="bt" id="cref-ok">Emitir la credencial</button>', {sinFoco:true});
  $('cref-no').onclick=cerrarHoja;
  function previa(){
    var c=$('cref-ya'), d=gesTxt($('cref-d').value), n=gesTxt($('cref-n').value);
    var ya=(d || n.length>=3) ? _creDe({ ext:S.t ? S.t.ext : '', dni:d, nombre:n }, hoy) : null;
    S.ya=ya||null;
    c.innerHTML=ya ? '<div class="aviso ojo" id="cref-tiene"><b>Ya tiene una credencial vigente</b> ('+esc(_creEstado(ya, hoy).t)+'). <label class="chk" style="margin:6px 0 0"><input type="checkbox" id="cref-anula" checked> Anular esa al emitir la nueva, para que no queden dos</label></div>' : '';
    cap();
  }
  /* si sale con el sello «Capacitación al día», se dice antes de emitir; y si no, qué le falta */
  function cap(){
    var c=$('cref-cap'); if(!c) return;
    var d=gesTxt($('cref-d').value), n=gesTxt($('cref-n').value), pu=gesTxt($('cref-c').value);
    if(!d && n.length<3){ c.innerHTML=''; return; }
    _creCap().then(function(D){
      if(CREF!==S || !$('cref-cap')) return;
      if(d!==gesTxt($('cref-d').value) || n!==gesTxt($('cref-n').value) || pu!==gesTxt($('cref-c').value)) return;     /* ya escribió otra cosa */
      var T=_creSelloDe({ dni:d, nombre:n, puesto:pu }, D);
      if(T===null){ c.innerHTML='<p class="ayuda" id="cref-cap-no" style="margin:0 0 12px">Para que la credencial lleve el sello «Capacitación al día», define lo que exige cada puesto. El plan se arma en la app, en «Lo que exige cada puesto».</p>'; return; }
      var est=T.est, falta=est.items.filter(function(i){ return i.st!=='si' && i.st!=='pv'; }).map(function(i){ return i.t; });
      if(!est.n){ c.innerHTML=''; return; }
      c.innerHTML=est.completo ? '<div class="aviso ok" id="cref-cap-si" style="margin:0 0 12px">🎓 <b>Capacitación al día.</b> La credencial sale con el sello, vigente hasta el <b>'+esc(fechaLarga(T.hasta)||T.hasta)+'</b>.</div>'
        : '<div class="aviso" id="cref-cap-falta" style="margin:0 0 12px">🎯 <b>Al día: '+est.vig+' de '+est.n+'.</b> La credencial sale sin el sello «Capacitación al día» hasta que apruebe lo que le falta: '+
          esc(_quiLista(falta.slice(0, 4)))+(falta.length>4 ? ' y '+(falta.length-4)+' más' : '')+'.</div>';
    }, function(){ if(CREF===S && $('cref-cap')) $('cref-cap').innerHTML=''; });
  }
  function sos(){
    var t=S.t, hay=!!(t && (t.sangre || t.emergencia || t.emerQuien));
    $('cref-sos-s').hidden=!hay;
    if(hay) $('cref-sos-t').textContent='Incluir en el QR: '+[t.sangre ? 'grupo sanguíneo '+t.sangre : '', (t.emerQuien || t.emergencia) ? 'avisar a '+[t.emerQuien, t.emergencia].filter(Boolean).join(' · ') : ''].filter(Boolean).join(' · ');
  }
  function pon(t){ S.t=t; $('cref-n').value=t.nombre; $('cref-d').value=t.dni||''; $('cref-c').value=t.puesto||''; previa(); sos(); }
  sugGente($('cref-n'), { lista:function(){ return masGente().then(masActivos); }, alElegir:function(t){ pon(t); } });
  $('cref-n').addEventListener('input', function(){ if(S.t && nrm(this.value)!==nrm(S.t.nombre)){ S.t=null; sos(); } previa(); });
  $('cref-d').addEventListener('input', previa);
  $('cref-c').addEventListener('input', cap);
  $('cref-h').onclick=function(ev){
    var b=ev.target.closest('[data-k]'); if(!b) return;
    var k=b.getAttribute('data-k'), i=S.h.indexOf(k);
    if(i>-1) S.h.splice(i, 1); else S.h.push(k);
    b.classList.toggle('on', i<0); b.setAttribute('aria-pressed', i<0 ? 'true' : 'false');
  };
  masCupo('credencial', 1, (CREW.lista||[]).length).then(function(r){
    if(CREF!==S || !$('cref-cupo') || r.tope<0) return;
    var c=$('cref-cupo'); c.hidden=false;
    c.innerHTML='Tu plan <b>'+esc(r.plan)+'</b> trae '+r.tope+' credenciales: van <b>'+r.lleva+'</b>'+(r.queda ? ', quedan '+r.queda+'.' : ' y ya no queda ninguna.');
  });
  $('cref-ok').onclick=_crefGuardar;
  if(pre) pon(pre);
  setTimeout(function(){ try{ if(!pre) $('cref-n').focus(); }catch(e){} }, 60);
}
function _crefGuardar(){
  var S=CREF; if(!S || S.guardando) return;
  var m=$('cref-msg'), bt=$('cref-ok'), hoy=hoyISO();
  var n=gesTxt($('cref-n').value).slice(0, 120), d=gesTxt($('cref-d').value).slice(0, 20), c=gesTxt($('cref-c').value).slice(0, 80), v=$('cref-v').value;
  if(n.length<3) return _masMal(m, 'Escribe el nombre del trabajador.', 'cref-n');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v)) return _masMal(m, '¿Hasta cuándo queda habilitado?', 'cref-v');
  if(v<hoy) return _masMal(m, 'Esa fecha ya pasó: una credencial se emite con vigencia hacia adelante.', 'cref-v');
  if(v>_creMasMeses(hoy, 36)) return _masMal(m, 'La vigencia no pasa de tres años.', 'cref-v');
  var t=S.t, conSos=!!(t && $('cref-sos') && $('cref-sos').checked && !$('cref-sos-s').hidden), anula=(S.ya && $('cref-anula') && $('cref-anula').checked) ? S.ya : null;
  S.guardando=true; bt.disabled=true; _masDice(m, 'Emitiendo…');
  var cod='';
  /* sobre lo que el servidor tiene AHORA (otro pudo emitir o anular hace un minuto) */
  _creTraer().then(function(R){
    return masCupo('credencial', 1, R.lista.length-(anula ? 1 : 0)).then(function(r){
      if(!r.ok){ S.guardando=false; bt.disabled=false; _masDice(m, '', ''); return masTopeAviso(r, 'credenciales').then(function(){ return 'tope'; }); }
      return Promise.all([masCtx({ com:R.com, tumbas:R.tumbas }), _creCap().catch(function(){ return null; })]).then(function(rr){
        var C=rr[0], D=rr[1];
        var datos={ n:n, d:d, c:c, v:v, o:String((YO.obra||{}).nombre||'') };
        if(conSos){ if(t.sangre) datos.s=t.sangre; if(t.emergencia) datos.e=t.emergencia; if(t.emerQuien) datos.q=t.emerQuien.slice(0, 40); }
        if(S.h.length) datos.h=S.h.slice();
        /* el sello «Capacitación al día»: la fecha hasta la que está al día con lo que exige su puesto, firmada con lo demás */
        try{ var T=D ? _creSelloDe({ dni:d, nombre:n, puesto:c }, D) : null; if(T && T.k) datos.k=T.k; }catch(e){}
        try{ var mc=MAS_APP.usar(C).comiteRolCod(d, n); if(mc) datos.m=mc; }catch(e){}
        cod=MAS_APP.usar(C).credCodUnico(datos);
        var tumbas=R.tumbas, lista=R.lista.slice();
        if(anula){ tumbas=Object.assign({}, tumbas); tumbas[String(anula.cod)]=Date.now(); lista=lista.filter(function(x){ return x.cod!==anula.cod; }); }
        lista.unshift({ n:n, d:d, v:v, cod:cod, h:(datos.h||[]), c:c, trab:(t && t.ext) ? t.ext : null, hecho:new Date().toISOString() });
        return (anula ? estadoEscribirP('credenciales_anuladas', MAS_APP.tumbasVivas(tumbas)) : Promise.resolve(true)).then(function(){ return estadoEscribirP('credenciales', lista); }).then(function(){
          masSumar('credencial', 1);
          S.guardando=false; CREW.lista=lista; CREW.tumbas=tumbas; CREW.firma='';
          toast('Credencial emitida'+(datos.k ? ' con el sello «Capacitación al día»' : '')+(anula ? ', y la anterior quedó anulada.' : '.'));
          crePintar(); masRecargar();
          creVer(cod);
        });
      });
    });
  }).catch(function(e){ S.guardando=false; if(bt) bt.disabled=false; _masMal(m, 'No se pudo emitir. '+porQueFallo(e)); });
}
function crePdf(cod){
  return _creTraer().then(function(R){
    return masCtx({ com:R.com, tumbas:R.tumbas }).then(function(C){
      var M=MAS_APP.usar(C), sos=[]; try{ sos=M.emergsLocal(); }catch(e){ sos=[]; }
      var out=M.credPdf(cod, sos);
      if(!out || !out.blob) throw { portal:'Esa credencial no se puede leer.' };
      out.nombre=nombreArchivo(String(out.nombre||'Credencial.pdf').replace(/\.pdf$/i, ''))+'.pdf'; out.sos=sos.length;
      return out;
    });
  });
}
/* lo que exige su puesto y cómo va, con el botón para ponerle o quitarle el sello */
function _creCapHTML(c){
  var s=_creSelloInfo(c), e=_creSelloEst(s), T=s.toca, L=s.lleva, D=CREW.cap, h='';
  if(T===undefined) return '';
  if(T===null) return '<div class="seccion" id="crev-cap" data-e="sin-plan"><h3>Capacitación</h3><p class="ayuda" style="margin:0">'+(L && L.vig ? 'Su credencial lleva el sello «Capacitación al día» hasta el '+esc(fechaLarga(L.f)||L.f)+'. ' : '')+
    'La obra todavía no dice qué exige cada puesto: con eso se sabe si su credencial puede llevar el sello «Capacitación al día». El plan se arma en la app, en «Lo que exige cada puesto».</p></div>';
  var est=T.est;
  h='<div class="seccion" id="crev-cap" data-e="'+(est.n ? (est.completo ? 'al-dia' : 'falta') : 'nada')+'"><h3>Capacitación <span class="tenue" style="font-weight:400">· lo que exige su puesto'+(s.q.puesto ? ' ('+esc(s.q.puesto)+')' : '')+'</span></h3>';
  if(!est.n) return h+'<p class="ayuda" style="margin:0">El plan de la obra no le exige nada a su puesto. Revisa que su puesto esté bien escrito en su ficha, o agrégalo al plan.</p></div>';
  h+=est.completo ? '<div class="aviso ok" style="margin:0 0 8px">🎓 <b>Capacitación al día.</b> Todo lo que exige su puesto, aprobado y vigente hasta el <b>'+esc(fechaLarga(T.hasta)||T.hasta)+'</b>.</div>'
    : '<div class="aviso'+(L && L.vig ? ' ojo' : '')+'" style="margin:0 0 8px"><b>Al día: '+est.vig+' de '+est.n+'.</b> '+
      (L && L.vig ? 'Su credencial todavía dice «Capacitación al día», pero ahora le falta algo de lo que exige su puesto.' : 'Su credencial no lleva el sello «Capacitación al día» hasta que apruebe lo que le falta.')+'</div>';
  h+='<ul class="com-pl" id="crev-cap-l">'+est.items.map(function(i){
    var det=(i.st==='si' || i.st==='pv') ? 'vence el '+(fechaLarga(i.vence)||i.vence) : (i.st==='ven' ? 'venció el '+(fechaLarga(i.vence)||i.vence) : (i.st==='de' ? 'la rindió y no pasó' : 'todavía no la rinde'));
    return '<li class="com-pf"><span><b>'+esc(i.t)+'</b><small>'+esc(det)+'</small></span><span class="pill '+ST_CL[i.st]+'">'+esc(CRE_ST[i.st]||'')+'</span></li>'; }).join('')+'</ul>';
  if(e.que==='poner') h+='<div class="acciones" style="justify-content:flex-start;margin:10px 0 0"><button type="button" class="bt sec" id="crev-sello" data-que="poner">🪪 '+(e.otro ? 'Actualizar el sello de su credencial' : 'Ponerle el sello en su credencial')+'</button></div>';
  else if(e.que==='quitar') h+='<div class="acciones" style="justify-content:flex-start;margin:10px 0 0"><button type="button" class="bt sec" id="crev-sello" data-que="quitar">🪪 Quitarle el sello</button></div>';
  else if(L && L.vig && est.completo) h+='<p class="ayuda" id="crev-sello-ya" style="margin:10px 0 0">🪪 Su credencial ya lleva el sello.</p>';
  return h+'<p class="ayuda" style="margin:8px 0 0">Cuenta las evaluaciones aprobadas en la app y las capacitaciones registradas en «Realizadas». Lo aprobado vale '+D.plan.meses+' meses.</p></div>';
}
/* ponerle (o quitarle) el sello a una credencial ya emitida: se vuelve a emitir con los mismos datos y su «k» al día.
   Sobre lo que el servidor tiene ahora; el código de antes deja su lápida, para que no queden dos QR de la misma persona */
function creSello(cod, poner){
  return confirmar(poner ? '¿Ponerle el sello «Capacitación al día»?' : '¿Quitarle el sello «Capacitación al día»?',
    'La credencial se vuelve a emitir '+(poner ? 'con' : 'sin')+' el sello, y su QR cambia: el carné que ya esté impreso deja de valer y hay que imprimirlo otra vez. En el celular de tu equipo se actualiza solo.',
    { si:poner ? 'Sí, ponerle el sello' : 'Sí, quitárselo' }).then(function(si){
    if(!si) return false;
    return Promise.all([_creTraer(), _creCap(true)]).then(function(rr){
      var R=rr[0], D=rr[1], c=R.lista.filter(function(x){ return x.cod===cod; })[0];
      if(!c) return Promise.reject({ portal:'Esa credencial ya no está: la anularon o la cambiaron desde otro equipo.', fuera:true });
      CREW.lista=R.lista; CREW.tumbas=R.tumbas; CREW.gente=R.gente; CREW.com=R.com; CREW.cap=D;
      var v=MAS_APP.credDatos(cod); if(!v) return Promise.reject({ portal:'Esa credencial no se puede leer.' });
      var s=_creSelloInfo(c), kk=(s.toca && s.toca.k) || '';
      if(poner && !kk) return Promise.reject({ portal:'Ya no está al día con lo que exige su puesto: el sello no se le puede poner.', fuera:true });
      return masCtx({ com:R.com, tumbas:R.tumbas }).then(function(C){
        var M=MAS_APP.usar(C), d=JSON.parse(JSON.stringify(v));
        if(poner) d.k=kk; else delete d.k;
        /* ya que se vuelve a emitir, lo del comité va al día (como en la app) */
        try{ var mc=M.comiteRolCod(d.d, d.n); if(mc!==null){ if(mc) d.m=mc; else delete d.m; } }catch(e){}
        var nuevo=M.credCodUnico(d);
        if(nuevo===cod) return { cod:cod, igual:true };
        var tumbas=Object.assign({}, R.tumbas); tumbas[String(cod)]=Date.now();
        var lista=R.lista.map(function(x){ return x.cod===cod ? Object.assign({}, x, { cod:nuevo, n:d.n||x.n, d:d.d||'', c:d.c||'', h:(d.h||[]) }) : x; });
        return estadoEscribirP('credenciales_anuladas', MAS_APP.tumbasVivas(tumbas)).then(function(){ return estadoEscribirP('credenciales', lista); }).then(function(){
          CREW.lista=lista; CREW.tumbas=tumbas; CREW.firma='';
          return { cod:nuevo };
        });
      });
    }).then(function(X){
      toast(X.igual ? 'La credencial ya estaba así.' : (poner ? 'Listo: su credencial ya lleva el sello. Imprime su carné otra vez.' : 'Listo: su credencial ya no lleva el sello. Imprime su carné otra vez.'));
      crePintar(); masRecargar(); creVer(X.cod);
      return true;
    }, function(e){
      if(e && e.fuera){ toast(e.portal); CREW.firma=''; masRecargar(); if($('crev-cap')) cerrarHoja(); return false; }
      _masMal($('crev-msg'), 'No se pudo cambiar el sello. '+((e && e.portal) ? e.portal : porQueFallo(e)));
      return false;
    });
  });
}
function creVer(cod){
  _masCss(); _yaCss();
  var d=null; try{ d=MAS_APP.credDatos(cod); }catch(e){ d=null; }
  if(!d){ toast('Esa credencial no se puede leer.'); return; }
  var hoy=hoyISO(), c=(CREW.lista||[]).filter(function(x){ return x.cod===cod; })[0]||{ cod:cod, v:d.v }, E=_creEstado({ v:d.v }, hoy), qr='';
  try{ qr=MAS_APP.usar({ base:appBase() }).credQR(cod); }catch(e){ qr=''; }
  var hab=(d.h||[]).map(function(k){ return MAS_APP.habilDe(k); }).filter(Boolean), sello=MAS_APP.pcSelloQR(d.k), rol=d.m ? MAS_APP.comiteRolTexto(d.m) : null;
  var h='<div class="mas-cred"><div class="mas-cred-qr">'+(qr ? '<img src="'+qr+'" alt="El QR de la credencial">' : '<span>El QR no se pudo dibujar</span>')+'</div>'+
    '<div class="mas-cred-d"><b data-sin-pais>'+esc(d.n||'')+'</b><small data-sin-pais>'+esc([d.c, d.d ? docPersonaP()+' '+d.d : ''].filter(Boolean).join(' · '))+'</small><small>'+esc(d.o||'')+'</small>'+
      '<span class="pill '+E.cl+'">'+(E.k==='ven' ? 'Vencida: '+esc(E.t) : 'Habilitado '+esc(E.t))+'</span>'+
      (sello ? '<span class="pill '+(sello.vig ? 'ok' : 'ojo')+'">🎓 '+(sello.vig ? 'Capacitación al día hasta el ' : 'Capacitación vencida el ')+esc(fechaLarga(sello.f))+'</span>' : '')+
      (rol ? '<span class="pill azul">'+esc(rol[0])+' · '+esc(rol[1])+'</span>' : '')+'</div></div>'+
    (hab.length ? '<div class="seccion"><h3>Habilitaciones</h3><div class="chips">'+hab.map(function(x){ return '<span class="pill '+(x.bri ? 'azul' : 'gris')+'">'+x.ic+' '+esc(x.n)+'</span>'; }).join(' ')+'</div></div>' : '')+
    _creCapHTML(c)+
    ((d.s || d.e || d.q) ? '<div class="seccion"><h3>En caso de emergencia <span class="tenue" style="font-weight:400">· sale al escanear el QR</span></h3><dl class="datos" data-sin-pais>'+
      [['Grupo sanguíneo', d.s], ['Avisar a', [d.q, d.e].filter(Boolean).join(' · ')]].filter(function(x){ return x[1]; }).map(function(x){ return '<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>'; }).join('')+'</dl></div>' : '')+
    '<div class="seccion"><h3>El carné</h3><p class="ayuda" style="margin:0 0 8px">Una hoja A4 con la tarjeta en tamaño real (85,6 × 54 mm) para recortar y plastificar, y los datos escritos debajo.</p><div class="pdfv" id="crev-pdf" aria-label="Vista previa del carné"></div></div>'+
    '<div class="msg" id="crev-msg" role="status"></div>';
  abrirHoja('Credencial · '+(d.n||''), E.k==='ven' ? 'Vencida' : 'Vigente '+E.t, h,
    '<button type="button" class="bt mal" id="crev-anular">Anular</button><button type="button" class="bt sec" id="crev-qr">Solo el QR</button><button type="button" class="bt sec" id="crev-stk">🪖 Sticker del casco</button><button type="button" class="bt sec" id="crev-abrir">Abrir el PDF</button><button type="button" class="bt" id="crev-bajar">Descargar el carné</button>', {sinFoco:true, ancha:true});
  var caja=$('crev-pdf'), R0=null; caja.innerHTML='<div class="pdfv-msg">Armando el carné…</div>';
  var pide=crePdf(cod).then(function(R){ R0=R; if(caja.isConnected){ pdfVistaP(caja, R.blob); if(!R.sos) _masDice($('crev-msg'), 'El carné sale sin la franja «Emergencia en obra»: esta obra todavía no cargó sus números de emergencia. Se cargan en «Comité y emergencias», en «¿A quién acudo?».'); } return R; });
  if($('crev-sello')) $('crev-sello').onclick=function(){ var bt=this; bt.disabled=true; creSello(cod, bt.getAttribute('data-que')==='poner').then(function(){ if(bt.isConnected) bt.disabled=false; }); };
  pide.catch(function(){ if(caja.isConnected) caja.innerHTML='<div class="pdfv-msg">No se pudo armar el carné. Revisa tu conexión e inténtalo otra vez.</div>'; });
  function con(f){ return function(){ var bt=this; bt.disabled=true; (R0 ? Promise.resolve(R0) : crePdf(cod)).then(function(R){ bt.disabled=false; f(R); }, function(e){ bt.disabled=false; _masMal($('crev-msg'), 'No se pudo armar el carné. '+porQueFallo(e)); }); }; }
  $('crev-bajar').onclick=con(function(R){ bajarBlob(R.blob, R.nombre); });
  $('crev-abrir').onclick=con(masAbrirPdf);
  $('crev-qr').onclick=function(){
    if(!qr) return _masMal($('crev-msg'), 'El QR no se pudo dibujar.');
    try{ var bin=atob(qr.split(',')[1]), u=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); bajarBlob(new Blob([u], {type:'image/gif'}), nombreArchivo('QR - '+(d.n||'credencial'))+'.gif'); }catch(e){ _masMal($('crev-msg'), 'No se pudo bajar el QR.'); }
  };
  $('crev-anular').onclick=function(){ creAnular(c); };
  $('crev-stk').onclick=function(){ stkwAbrir([cod]); };
}
function creAnular(c){
  if(!c || !c.cod) return;
  var d=null; try{ d=MAS_APP.credDatos(c.cod); }catch(e){}
  var quien=(d && d.n) || c.n || 'este trabajador';
  confirmar('¿Anular esta credencial?', 'La credencial de '+quien+' deja de valer: sale de la lista aquí y en los celulares del equipo, y su QR ya no se podrá volver a emitir igual. El carné impreso hay que recogerlo.', {si:'Sí, anularla', mal:true}).then(function(si){
    if(!si) return;
    _creTraer().then(function(R){
      var tumbas=Object.assign({}, R.tumbas); tumbas[String(c.cod)]=Date.now();
      var lista=R.lista.filter(function(x){ return x.cod!==c.cod; });
      return estadoEscribirP('credenciales_anuladas', MAS_APP.tumbasVivas(tumbas)).then(function(){ return estadoEscribirP('credenciales', lista); }).then(function(){
        CREW.lista=lista; CREW.tumbas=tumbas; CREW.firma='';
        toast('Credencial anulada.'); cerrarHoja(); crePintar(); masRecargar();
      });
    }).catch(function(e){ toast('No se pudo anular. '+porQueFallo(e)); });
  });
}

/* ══ 6 · EL TRABAJADOR DEL MES ════════════════════════════════════════════════════════════════
   Una nota corta de seguridad por trabajador, cada día (sst_puntaje: { empresa, trabajador (el nombre), dni, fecha,
   criterios:{ punto:1|0|-1, _t }, promedio, supervisor }), y con eso el ranking del mes y el diploma del que ganó.
   Las reglas son las de la app y vienen de ella (mas-app.js): toda la cuadrilla de una vez y todos empiezan cumpliendo
   —se marca solo lo que falló—; los puntos con ⭐ suman cuando pasan y, si no pasan, no cuentan; un día es un día (si
   tiene dos notas, vale la última); entra en la carrera quien tiene al menos 3 días evaluados. Los puntos que se
   evalúan los decide la empresa (sst_doc, hoja «tdm-cfg»); en LITE son cuatro fijos. */
var TDMW = { tab:'dia', fecha:'', mes:'', C:null, cfg:null, cfgId:null, gente:[], L:[], guardado:{}, marcas:{}, fuera:{}, reportaron:{}, diaDe:'', diaPide:0, notas:null, notasDe:'', mesPide:0, q:'', area:'', n:0, caja:null, guardando:false };
function _tdmM(){ return MAS_APP.usar(Object.assign({}, TDMW.C, { cfg:TDMW.cfg })); }
function _tdmLlave(t){ return MAS_APP.ptLlave(t.dni, t.nombre); }
function _tdmCfgTraer(){
  return sbGet('sst_doc?empresa=eq.'+_enc(YO.obra.id)+'&hoja=eq.tdm-cfg&select=id,nota&limit=1').then(function(rows){
    var r=rows && rows[0], x=r ? nota(r.nota) : null;
    return { id:r ? r.id : null, cfg:(x && Array.isArray(x.lista) && x.lista.length) ? { lista:x.lista, propios:Array.isArray(x.propios) ? x.propios : [], t:x.t||0 } : null };
  });
}
function masVistaTdm(caja){
  _masCss(); _yaCss();
  TDMW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(!TDMW.fecha || TDMW.obra!==(YO.obra||{}).id){ TDMW.obra=(YO.obra||{}).id; TDMW.fecha=hoyISO(); TDMW.mes=MES; TDMW.marcas={}; TDMW.fuera={}; TDMW.guardado={}; TDMW.diaDe=''; TDMW.notas=null; TDMW.notasDe=''; TDMW.q=''; TDMW.area=''; TDMW.tab='dia'; }
  cargando(caja);
  function pinta(silencio){
    /* lo que se está marcando no se pisa con una recarga */
    if(silencio && $('tdm-cuerpo')){ if(TDMW.tab==='mes') _tdmMesTraer(true); return; }
    var n=++TDMW.n;
    Promise.all([masCtx(), _tdmCfgTraer().catch(function(){ return { id:null, cfg:null }; }), masGente()]).then(function(r){
      if(n!==TDMW.n || VISTA.actual!=='tdm') return;
      TDMW.C=r[0]; TDMW.cfg=r[1].cfg; TDMW.cfgId=r[1].id; TDMW.gente=masActivos(r[2]);
      TDMW.L=_tdmM().ptCriterios();
      _tdmArmar();
    }).catch(function(cod){ if(n!==TDMW.n || VISTA.actual!=='tdm') return; if(!silencio) fallo(caja, cod); });
  }
  VISTA.recargar=pinta; pinta();
}
function _tdmArmar(){
  var caja=TDMW.caja; if(!caja || !document.body.contains(caja)) return;
  var tabs=[['dia', 'Evaluar el día'], ['mes', 'El mes y el diploma'], ['puntos', 'Qué se evalúa']];
  caja.innerHTML='<div class="aviso" id="tdm-que"><b>Una nota corta de seguridad por trabajador, cada día.</b> Sale toda la cuadrilla y todos empiezan cumpliendo: se marca solo lo que falló. Con eso se arma el ranking del mes y el diploma del que ganó: '+
    'en obra el reconocimiento mueve más que el memorándum. Es el mismo registro de la app.</div>'+
    '<div class="seg" id="tdm-tabs" role="tablist" style="margin:0 0 14px">'+tabs.map(function(t){ var on=(t[0]===TDMW.tab); return '<button type="button" role="tab" aria-selected="'+(on ? 'true' : 'false')+'" class="'+(on ? 'on' : '')+'" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div>'+
    '<div id="tdm-cuerpo"></div>';
  $('tdm-tabs').onclick=function(ev){
    var b=ev.target.closest('[data-v]'); if(!b || b.getAttribute('data-v')===TDMW.tab) return;
    TDMW.tab=b.getAttribute('data-v');
    Array.prototype.forEach.call(this.querySelectorAll('button'), function(x){ var on=(x===b); x.className=on ? 'on' : ''; x.setAttribute('aria-selected', on ? 'true' : 'false'); });
    _tdmTab();
  };
  _tdmTab();
}
function _tdmTab(){ if(TDMW.tab==='mes') _tdmMes(); else if(TDMW.tab==='puntos') _tdmPuntos(); else _tdmDia(); }

/* ── el día ── */
function _tdmDefecto(t, c){ if(c.k==='reporto' && TDMW.reportaron[_tdmLlave(t)]) return 1; return c.mas ? -1 : 1; }
function _tdmValor(t, c){
  var k=_tdmLlave(t), m=TDMW.marcas[k];
  if(m && m[c.k]!==undefined) return m[c.k];
  var g=TDMW.guardado[k];
  if(g && g.crit && g.crit[c.k]!==undefined && g.crit[c.k]!==null) return g.crit[c.k];
  return _tdmDefecto(t, c);
}
function _tdmVals(t){ var o={}; TDMW.L.forEach(function(c){ o[c.k]=_tdmValor(t, c); }); return o; }
function _tdmIncluido(t){ var k=_tdmLlave(t); if(TDMW.fuera[k]) return false; if(TDMW.guardado[k] && !TDMW.marcas[k]) return false; return true; }
function _tdmDiaTraer(){
  var f=TDMW.fecha, yo=++TDMW.diaPide, E=_enc(YO.obra.id);
  TDMW.diaDe=''; TDMW.guardado={}; TDMW.reportaron={};
  return Promise.all([
    sbGet('sst_puntaje?empresa=eq.'+E+'&fecha=eq.'+f+'&select=trabajador,dni,promedio,criterios&order=trabajador.asc,dni.asc&limit=5000'),
    sbGet('sst_reporte?empresa=eq.'+E+'&fecha=eq.'+f+'&select=autor,anonimo&limit=1000').catch(function(){ return []; })
  ]).then(function(r){
    if(yo!==TDMW.diaPide) return false;
    var por={}; TDMW.gente.forEach(function(t){ por[_tdmLlave(t)]=t; });
    var mejor={};
    (r[0]||[]).forEach(function(p){
      var k=MAS_APP.ptLlave(p.dni, p.trabajador); if(!por[k]) return;
      var c=p.criterios||{}; if(typeof c==='string'){ try{ c=JSON.parse(c); }catch(e){ c={}; } }
      var tt=+c._t||0, ya=mejor[k];
      if(!ya || tt>=ya.t) mejor[k]={ t:tt, prom:parseFloat(p.promedio)||0, crit:c };
    });
    var rep={};
    (r[1]||[]).forEach(function(x){
      if(!x || x.anonimo || !x.autor) return;
      var cand=TDMW.gente.filter(function(t){ return MAS_APP.ptMismaPersona(x.autor, t.nombre); });
      if(cand.length===1) rep[_tdmLlave(cand[0])]=1;
    });
    TDMW.guardado=mejor; TDMW.reportaron=rep; TDMW.diaDe=f;
    return true;
  });
}
function _tdmDia(){
  var c=$('tdm-cuerpo'); if(!c) return;
  var hoy=hoyISO(), areas={}; TDMW.gente.forEach(function(t){ if(t.area) areas[t.area]=1; });
  var h='<div class="tarj"><div class="tarj-cab"><div class="herr" style="flex-wrap:wrap">'+
      '<label class="tdm-f">Día <input type="date" id="tdm-fecha" max="'+hoy+'" min="'+_creMasMeses(hoy, -3)+'" value="'+esc(TDMW.fecha)+'"></label>'+
      '<input type="search" id="tdm-q" placeholder="Buscar por nombre, documento o puesto" aria-label="Buscar" value="'+esc(TDMW.q)+'">'+
      (Object.keys(areas).length>1 ? '<select id="tdm-area" aria-label="Área"><option value="">Todas las áreas</option>'+Object.keys(areas).sort().map(function(a){ return '<option'+(a===TDMW.area ? ' selected' : '')+'>'+esc(a)+'</option>'; }).join('')+'</select>' : '')+
      '<span class="cuenta-f" id="tdm-cuenta"></span></div></div>'+
    '<div class="tarj-cuerpo" id="tdm-dia-c"><div class="vacio">Cargando…</div></div></div>'+
    '<div class="tdm-pie" id="tdm-pie" hidden><span id="tdm-pie-t"></span><span class="msg" id="tdm-msg" role="status"></span><button type="button" class="bt" id="tdm-guardar">Guardar las notas</button></div>';
  c.innerHTML=h;
  $('tdm-fecha').onchange=function(){
    var v=this.value; if(!/^\d{4}-\d{2}-\d{2}$/.test(v) || v>hoyISO()){ this.value=TDMW.fecha; return; }
    if(v===TDMW.fecha) return;
    var sin=Object.keys(TDMW.marcas).length || Object.keys(TDMW.fuera).length, yo=this;
    (sin ? confirmar('¿Cambiar de día?', 'Lo marcado del '+fechaLarga(TDMW.fecha)+' todavía no se guardó y se pierde.', {si:'Sí, cambiar', mal:true}) : Promise.resolve(true)).then(function(si){
      if(!si){ yo.value=TDMW.fecha; return; }
      TDMW.fecha=v; TDMW.marcas={}; TDMW.fuera={}; _tdmDiaCargar();
    });
  };
  $('tdm-q').oninput=function(){ TDMW.q=this.value; _tdmDiaLista(); };
  if($('tdm-area')) $('tdm-area').onchange=function(){ TDMW.area=this.value; _tdmDiaLista(); };
  $('tdm-guardar').onclick=tdmDiaGuardar;
  if(TDMW.diaDe===TDMW.fecha) _tdmDiaLista(); else _tdmDiaCargar();
}
function _tdmDiaCargar(){
  var c=$('tdm-dia-c'); if(c) c.innerHTML='<div class="vacio">Cargando…</div>';
  if($('tdm-pie')) $('tdm-pie').hidden=true;
  _tdmDiaTraer().then(function(ok){ if(ok && TDMW.tab==='dia') _tdmDiaLista(); }, function(e){ var x=$('tdm-dia-c'); if(x) x.innerHTML='<div class="vacio"><b>No se pudo cargar el día</b>'+esc(porQueFallo(e))+'</div>'; });
}
function _tdmNotaTxt(pr){ return Math.round(pr*100)+'%'; }
function _tdmNotaCl(pr){ return pr>=0.8 ? 'ok' : (pr>=0.5 ? 'ojo' : 'mal'); }
function _tdmVisibles(){
  var q=nrm(TDMW.q), a=TDMW.area;
  return TDMW.gente.filter(function(t){ if(a && t.area!==a) return false; return !q || (nrm(t.nombre)+' '+String(t.dni||'').toLowerCase()+' '+nrm(t.puesto)).indexOf(q)>-1; });
}
function _tdmCelda(t, c, v){
  var txt=(v===1) ? (c.mas ? '⭐' : '✓') : (v===0 ? '✕' : '—'), cl=(v===1) ? (c.mas ? 'mas' : 'si') : (v===0 ? 'no' : 'na');
  var et=(v===1) ? (c.mas ? 'pasó' : 'cumple') : (v===0 ? 'no cumple' : 'no aplica');
  return '<td class="tdm-c"><button type="button" class="tdm-b '+cl+'" data-k="'+esc(c.k)+'" aria-label="'+esc((c.c||c.t)+': '+et)+'" title="'+esc(c.t+' · '+et)+'">'+txt+'</button></td>';
}
function _tdmFila(t){
  var k=_tdmLlave(t), fuera=!!TDMW.fuera[k], g=TDMW.guardado[k], ed=!!TDMW.marcas[k], v=_tdmVals(t), nt=MAS_APP.ptNotaDe(v, TDMW.L);
  var estado=fuera ? '<span class="pill gris">no vino</span>' : (g && !ed ? '<span class="pill ok">guardada</span>' : (g ? '<span class="pill ojo">corregida</span>' : ''));
  return '<tr data-t="'+esc(k)+'" class="'+(fuera ? 'fuera' : '')+'"><th scope="row"><b data-sin-pais>'+esc(t.nombre)+'</b><small>'+esc([t.puesto, t.area].filter(Boolean).join(' · '))+'</small></th>'+
    TDMW.L.map(function(c){ return _tdmCelda(t, c, v[c.k]); }).join('')+
    '<td class="tdm-n">'+(fuera ? '—' : '<span class="pill '+_tdmNotaCl(nt.prom)+'">'+_tdmNotaTxt(nt.prom)+'</span>')+'</td>'+
    '<td class="tdm-e">'+estado+'</td>'+
    '<td class="tdm-v"><input type="checkbox" data-fuera="1" aria-label="No vino: '+esc(t.nombre)+'"'+(fuera ? ' checked' : '')+'></td></tr>';
}
function _tdmDiaLista(){
  var c=$('tdm-dia-c'); if(!c) return;
  _tdmM();     /* los nombres de los puntos salen de la app con el rubro de ESTA obra */
  var G=TDMW.gente, V=_tdmVisibles();
  if(!G.length){ c.innerHTML='<div class="vacio" id="tdm-sin-gente"><b>Todavía no hay personal en esta obra</b>Carga a tu gente en «Personal» y aquí sale toda la cuadrilla, lista para evaluar.</div>'; $('tdm-pie').hidden=true; $('tdm-cuenta').textContent=''; return; }
  c.innerHTML=V.length ? '<div class="tdm-caja"><table class="tdm-t" id="tdm-tabla"><thead><tr><th scope="col">Trabajador</th>'+TDMW.L.map(function(x){ return '<th scope="col" title="'+esc(x.t)+'"'+(x.propio ? ' data-sin-pais' : '')+'>'+esc(x.c||x.t)+(x.mas ? ' ⭐' : '')+'</th>'; }).join('')+
      '<th scope="col">Nota</th><th scope="col"></th><th scope="col">No vino</th></tr></thead><tbody>'+V.slice(0, 400).map(_tdmFila).join('')+'</tbody></table></div>'+
      (V.length>400 ? '<p class="ayuda" style="margin:8px 0 0">Se muestran 400 de '+V.length+': usa el buscador o el área para ver al resto.</p>' : '')+
      '<p class="ayuda" id="tdm-ley" style="margin:10px 0 0">✓ cumple · ✕ no cumple · — no aplica. Un toque cambia. Los puntos con ⭐ suman cuando pasan; si no pasan, no bajan la nota.</p>'
    : '<div class="vacio"><b>Nadie con ese filtro</b>Cambia la búsqueda o el área.</div>';
  var tb=$('tdm-tabla');
  if(tb) tb.onclick=function(ev){
    var b=ev.target.closest('button[data-k]'), f=ev.target.closest('input[data-fuera]'), tr=ev.target.closest('tr[data-t]'); if(!tr || (!b && !f)) return;
    var k=tr.getAttribute('data-t'), t=TDMW.gente.filter(function(x){ return _tdmLlave(x)===k; })[0]; if(!t) return;
    if(f){ if(f.checked) TDMW.fuera[k]=1; else delete TDMW.fuera[k]; }
    else {
      var ck=b.getAttribute('data-k'), cr=TDMW.L.filter(function(x){ return x.k===ck; })[0]; if(!cr || TDMW.fuera[k]) return;
      var v=_tdmValor(t, cr), sig=cr.mas ? (v===1 ? -1 : 1) : (v===1 ? 0 : (v===0 ? -1 : 1));
      var m=TDMW.marcas[k]||(TDMW.marcas[k]={}); m[ck]=sig;
      /* si quedó igual que lo guardado (o que lo que venía), no es un cambio */
      var g=TDMW.guardado[k], igual=TDMW.L.every(function(x){ if(m[x.k]===undefined) return true; var base=(g && g.crit && g.crit[x.k]!==undefined && g.crit[x.k]!==null) ? g.crit[x.k] : _tdmDefecto(t, x); return m[x.k]===base; });
      if(igual) delete TDMW.marcas[k];
    }
    var tmp=document.createElement('tbody'); tmp.innerHTML=_tdmFila(t); tr.parentNode.replaceChild(tmp.firstChild, tr);
    var nb=$('tdm-tabla').querySelector('tr[data-t="'+k.replace(/"/g, '')+'"] '+(f ? 'input[data-fuera]' : 'button[data-k="'+(b ? b.getAttribute('data-k') : '')+'"]')); if(nb) try{ nb.focus(); }catch(e){}
    _tdmDiaPie();
  };
  _tdmDiaPie();
}
function _tdmPorGuardar(){ return TDMW.gente.filter(_tdmIncluido); }
function _tdmDiaPie(){
  var G=TDMW.gente, por=_tdmPorGuardar(), ya=G.filter(function(t){ return !!TDMW.guardado[_tdmLlave(t)]; }).length, fu=Object.keys(TDMW.fuera).length, V=_tdmVisibles();
  $('tdm-cuenta').textContent=V.length+(V.length!==G.length ? ' de '+G.length : '')+' '+(G.length===1 ? 'trabajador' : 'trabajadores');
  var p=$('tdm-pie'); p.hidden=false;
  $('tdm-pie-t').innerHTML=(TDMW.fecha===hoyISO() ? 'Hoy' : esc(fechaLarga(TDMW.fecha)))+' · <b>'+por.length+'</b> '+(por.length===1 ? 'nota por guardar' : 'notas por guardar')+(ya ? ' · '+ya+' ya guardada'+(ya===1 ? '' : 's') : '')+(fu ? ' · '+fu+' no vino'+(fu===1 ? '' : 'eron') : '');
  var bt=$('tdm-guardar'); bt.disabled=!por.length || TDMW.guardando; bt.textContent=por.length ? 'Guardar '+gesPlural(por.length, 'nota', 'notas') : 'Nada por guardar';
}
function tdmDiaGuardar(){
  if(TDMW.guardando) return;
  var por=_tdmPorGuardar(), m=$('tdm-msg'), bt=$('tdm-guardar'); if(!por.length) return;
  var ahora=Date.now(), sup=gesQuien(), f=TDMW.fecha, oid=YO.obra.id;
  var filas=por.map(function(t){ var c=_tdmVals(t), n=MAS_APP.ptNotaDe(c, TDMW.L); c._t=ahora; return { empresa:oid, trabajador:t.nombre, dni:t.dni||'', fecha:f, criterios:c, promedio:n.prom, supervisor:sup }; });
  TDMW.guardando=true; bt.disabled=true; _masDice(m, 'Guardando…');
  var i=0, hechas=0;
  function sigue(){
    if(i>=filas.length) return Promise.resolve();
    var tanda=filas.slice(i, i+200);
    return sbPostP('sst_puntaje', tanda).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); hechas+=tanda.length; i+=tanda.length; return sigue(); });
  }
  sigue().then(function(){
    TDMW.guardando=false; TDMW.marcas={}; TDMW.notas=null; TDMW.notasDe='';
    _masDice(m, '', '');
    toast(filas.length===1 ? 'Nota guardada.' : 'Se guardaron las '+filas.length+' notas del día.');
    return _tdmDiaTraer().then(function(){ if(TDMW.tab==='dia') _tdmDiaLista(); });
  }).catch(function(e){
    TDMW.guardando=false; if(bt) bt.disabled=false;
    _masMal(m, (hechas ? 'Se guardaron '+hechas+' y el resto no. ' : 'No se pudo guardar. ')+porQueFallo(e));
    if(hechas) _tdmDiaTraer().then(function(){ por.slice(0, hechas).forEach(function(t){ delete TDMW.marcas[_tdmLlave(t)]; }); if(TDMW.tab==='dia') _tdmDiaLista(); }, function(){});
  });
}

/* ── el mes ── */
function _tdmNotasDe(mes){
  var E=_enc(YO.obra.id), ini=mes+'-01', fin=MAS_APP.tdmUltimoDia(mes), out=[];
  function pag(desde){
    return sbGet('sst_puntaje?empresa=eq.'+E+'&fecha=gte.'+ini+'&fecha=lte.'+fin+'&select=trabajador,dni,promedio,fecha,criterios&order=fecha.desc,trabajador.asc,dni.asc&limit=1000&offset='+desde).then(function(a){
      a=a||[]; out=out.concat(a); return (a.length<1000 || out.length>=40000) ? out : pag(desde+1000);
    });
  }
  return pag(0);
}
function _tdmMesTraer(silencio){
  var mes=TDMW.mes, yo=++TDMW.mesPide;
  return _tdmNotasDe(mes).then(function(a){
    if(yo!==TDMW.mesPide) return;
    var firma=''; try{ firma=a.length+'|'+JSON.stringify(a.slice(0, 3)); }catch(e){}
    if(silencio && TDMW.notasDe===mes && firma===TDMW.notasF) return;
    TDMW.notas=a; TDMW.notasDe=mes; TDMW.notasF=firma;
    if(TDMW.tab==='mes') _tdmMesPintar();
  }, function(e){ if(yo!==TDMW.mesPide || silencio) return; var c=$('tdm-mes-c'); if(c) c.innerHTML='<div class="vacio"><b>No se pudo cargar el mes</b>'+esc(porQueFallo(e))+'</div>'; });
}
function _tdmMes(){
  var c=$('tdm-cuerpo'); if(!c) return;
  var M=_tdmM(), meses=M.tdmMeses();
  c.innerHTML='<div class="tarj"><div class="tarj-cab"><div class="herr"><label class="tdm-f">Mes <select id="tdm-mes">'+meses.map(function(m){ return '<option value="'+m+'"'+(m===TDMW.mes ? ' selected' : '')+'>'+esc(_tdmMesTxt(m))+(m===MES ? ' (en curso)' : '')+'</option>'; }).join('')+'</select></label></div></div>'+
    '<div class="tarj-cuerpo" id="tdm-mes-c"><div class="vacio">Juntando las notas del mes…</div></div></div>'+
    '<details class="tarj tdm-reglas" id="tdm-reglas"><summary>Cómo se elige al trabajador del mes</summary><div class="tarj-cuerpo">'+_tdmReglasHTML()+'</div></details>';
  $('tdm-mes').onchange=function(){ TDMW.mes=this.value; TDMW.notas=null; $('tdm-mes-c').innerHTML='<div class="vacio">Juntando las notas del mes…</div>'; _tdmMesTraer(); };
  if(TDMW.notas && TDMW.notasDe===TDMW.mes) _tdmMesPintar(); else _tdmMesTraer();
}
function _tdmMesTxt(m){ var t=MAS_APP.mesBonito(m); return t.charAt(0).toUpperCase()+t.slice(1); }
function _tdmReglasHTML(){
  _tdmM();
  var L=TDMW.L, hayMas=L.some(function(x){ return x.mas; });
  return '<p style="margin:0 0 8px">Cada día se marcan, por trabajador, estos <b>'+L.length+'</b> puntos:</p><ul class="ges-lista-chica" style="margin:0 0 10px">'+L.map(function(x){ return '<li'+(x.propio ? ' data-sin-pais' : '')+'>'+esc(x.t)+(x.mas ? ' ⭐' : '')+'</li>'; }).join('')+'</ul>'+
    '<p class="ayuda" style="margin:0">La nota del día es el porcentaje de puntos cumplidos (los «no aplica» no cuentan). '+(hayMas ? 'Los que tienen ⭐ suman solo cuando pasan: si no pasan, no bajan la nota. ' : '')+
    'La nota del mes es el promedio de sus días; si un día tiene dos notas, vale la última. Entra en la carrera quien tiene <b>al menos '+MAS_APP.PT_MINIMO_DIAS+' días evaluados</b>; a igual nota gana quien tiene más ⭐ y, después, quien tiene más días. '+
    'El <b>último día del mes</b> el resultado queda cerrado y el diploma es el oficial; antes, sale marcado como avance.</p>';
}
function _tdmMesPintar(){
  var c=$('tdm-mes-c'); if(!c) return;
  var M=_tdmM(), mes=TDMW.mes, lista=M.tdmResumir(TDMW.notas||[]), min=MAS_APP.PT_MINIMO_DIAS, cerrado=M.tdmCerrado(mes), mt=MAS_APP.mesBonito(mes);
  if(!lista.length){
    c.innerHTML='<div class="vacio" id="tdm-mes-vacio"><b>Sin notas en '+esc(mt)+'</b>Nadie fue evaluado ese mes.'+(mes===MES ? ' Evalúa a tu gente unos días, en «Evaluar el día», y aquí sale quién va ganando.' : '')+'</div>';
    return;
  }
  var listos=lista.filter(function(x){ return x.dias>=min; }), fuera=lista.filter(function(x){ return x.dias<min; }), h='';
  TDMW.listos=listos;
  if(!listos.length){
    h+='<div class="aviso ojo" id="tdm-pocos"><b>Todavía nadie llega a '+min+' días evaluados.</b> Van '+gesPlural(lista.length, 'evaluado', 'evaluados')+' en '+esc(mt)+'. Con menos de '+min+' días no hay ganador: el premio se lo lleva quien trabaja seguro todo el mes, no quien tuvo un día bueno.</div>';
  } else {
    var g=listos[0];
    h+='<div class="tdm-gana" id="tdm-gana"><span class="tdm-copa" aria-hidden="true">🏆</span><div><small>'+(cerrado ? 'Trabajador del mes de '+esc(mt) : 'Va ganando en '+esc(mt)+' · el mes cierra el '+esc(fechaLarga(M.tdmUltimoDia(mes))))+'</small>'+
      '<b data-sin-pais>'+esc(g.nombre)+'</b><span>'+_tdmNotaTxt(g.prom)+' en '+gesPlural(g.dias, 'día evaluado', 'días evaluados')+(g.ini ? ' · ⭐ '+g.ini : '')+'</span></div>'+
      '<button type="button" class="bt" data-dip="0">'+(cerrado ? 'Generar su diploma' : 'Ver cómo quedaría el diploma')+'</button></div>';
    h+='<ol class="tdm-podio" id="tdm-podio">'+listos.slice(0, 50).map(function(x, i){
      return '<li><span class="tdm-pos">'+(i+1)+'</span><span class="tdm-q"><b data-sin-pais>'+esc(x.nombre)+'</b><small>'+x.dias+' d'+(x.ini ? ' · ⭐ '+x.ini : '')+'</small></span>'+
        '<span class="tdm-r"><i style="width:'+Math.round(x.prom*100)+'%"></i></span><b class="tdm-p">'+_tdmNotaTxt(x.prom)+'</b>'+
        (i>0 ? '<button type="button" class="bt-link" data-dip="'+i+'">Diploma</button>' : '<span></span>')+'</li>'; }).join('')+'</ol>'+
      (listos.length>50 ? '<p class="ayuda" style="margin:6px 0 0">Se muestran los 50 primeros de '+listos.length+'.</p>' : '')+
      (cerrado ? '' : '<p class="ayuda" style="margin:10px 0 0">Hasta el último día del mes el diploma sale marcado como <b>avance</b>; ese día ya sale el oficial.</p>');
  }
  if(fuera.length) h+='<details class="seccion" id="tdm-fuera"><summary>'+gesPlural(fuera.length, 'persona con menos de '+min+' días evaluados', 'personas con menos de '+min+' días evaluados')+'</summary><ul class="ges-lista-chica">'+
    fuera.slice(0, 200).map(function(x){ return '<li><span data-sin-pais>'+esc(x.nombre)+'</span> <small>· '+x.dias+' d · '+_tdmNotaTxt(x.prom)+'</small></li>'; }).join('')+'</ul></details>';
  h+='<div class="msg" id="tdm-mes-msg" role="status"></div>';
  c.innerHTML=h;
  Array.prototype.forEach.call(c.querySelectorAll('[data-dip]'), function(b){ b.onclick=function(){ tdmDiploma(+b.getAttribute('data-dip')); }; });
}
/* el diploma: el cartón A4 apaisado de la app, con el logo de la empresa. Del mes cerrado y del primer puesto, queda
   anotado en la obra (sst_doc, hoja «trabajador-mes»), una sola vez por mes */
function tdmDiploma(i){
  var g=(TDMW.listos||[])[i]; if(!g) return;
  var M=_tdmM(), mes=TDMW.mes, cerrado=M.tdmCerrado(mes), mt=MAS_APP.mesBonito(mes), R=null;
  try{ R={ blob:M.tdmDiploma(g, mes, i, cerrado), nombre:nombreArchivo((i===0 ? 'Trabajador del mes' : 'Reconocimiento a la seguridad')+' - '+mt+' - '+g.nombre)+'.pdf' }; }
  catch(e){ _masMal($('tdm-mes-msg'), 'No se pudo armar el diploma. Inténtalo otra vez.'); return; }
  abrirHoja((i===0 ? 'Trabajador del mes' : 'Reconocimiento · puesto '+(i+1))+' · '+g.nombre, _tdmMesTxt(mes)+(cerrado ? '' : ' · avance: el mes aún no cierra'),
    (TDMW.C && TDMW.C.emp && TDMW.C.emp.logo ? '' : '<div class="aviso ojo" id="tdmd-sin-logo">Esta obra no tiene logo cargado: el diploma sale sin él. Se carga en «Datos y logo de la empresa».</div>')+
    '<div class="pdfv" id="tdmd-pdf" aria-label="Vista previa del diploma"></div>',
    '<button type="button" class="bt sec" id="tdmd-abrir">Abrir el PDF</button><button type="button" class="bt" id="tdmd-bajar">Descargar el diploma</button>', {sinFoco:true, ancha:true});
  pdfVistaP($('tdmd-pdf'), R.blob);
  $('tdmd-bajar').onclick=function(){ bajarBlob(R.blob, R.nombre); };
  $('tdmd-abrir').onclick=function(){ masAbrirPdf(R); };
  if(cerrado && i===0){
    var oid=YO.obra.id, pref=mes+' · ';
    sbGet('sst_doc?empresa=eq.'+_enc(oid)+'&hoja=eq.trabajador-mes&select=id,nombre,nota&order=creado.desc&limit=40').then(function(rows){
      if((rows||[]).some(function(r){ return String(r.nota||'').indexOf(pref)===0 && nrm(r.nombre)===nrm(g.nombre); })) return;
      return sbPostP('sst_doc', { empresa:oid, hoja:'trabajador-mes', nombre:g.nombre, nota:mes+' · '+Math.round(g.prom*100)+'% en '+g.dias+' días'+(g.dni ? ' · '+((TDMW.C.docs||{})[String(g.dni).trim().toUpperCase()]||TDMW.C.doc||'DNI')+' '+g.dni : '') });
    }).then(function(){}, function(){});
  }
}

/* ── los puntos que se evalúan ── */
function _tdmPuntos(){
  var c=$('tdm-cuerpo'); if(!c) return;
  var M=_tdmM(), h='';
  if(!TDMW.C.libre){
    var P=planWebPlan(1);
    h='<div class="tarj"><div class="tarj-cab"><div><h2>Los 4 puntos del plan LITE</h2></div></div><div class="tarj-cuerpo"><ul class="ges-lista-chica" id="tdm-p-lite" style="margin:0 0 12px">'+MAS_APP.TDM_LITE.map(function(k){ var p=M.tdmPunto(k); return '<li>'+esc(p.t)+'</li>'; }).join('')+'</ul>'+
      '<div class="aviso" style="margin:0">🔒 En el plan LITE se evalúan <b>4 puntos fijos</b>.'+(P ? ' Desde el plan <b>'+esc(P.n)+'</b> son 8, y puedes quitarlos, cambiarlos o escribir los tuyos.' : '')+
      ' <button type="button" class="bt-link" id="tdm-p-plan">'+(planwPuedePagar() ? 'Ver los planes' : 'Ver mi plan')+'</button></div></div></div>';
    c.innerHTML=h; $('tdm-p-plan').onclick=function(){ navegar('plan'); };
    return;
  }
  var cfg=TDMW.cfg || { lista:MAS_APP.TDM_DE_FABRICA.slice(), propios:[], t:0 }, usa=cfg.lista.filter(function(k){ return !!M.tdmPunto(k); });
  if(usa.length<MAS_APP.TDM_MINIMO) usa=MAS_APP.TDM_DE_FABRICA.slice();
  var libres=MAS_APP.TDM_CATALOGO.filter(function(p){ return usa.indexOf(p.k)<0; }).concat((cfg.propios||[]).filter(function(p){ return p && usa.indexOf(p.k)<0; }));
  function fila(p, bt, acc){ return '<li class="tdm-pf"><span'+(p.propio ? ' data-sin-pais' : '')+'><b>'+esc(p.t)+'</b>'+(p.mas ? ' <span class="pill ojo">⭐ suma</span>' : '')+(p.propio ? ' <small>· escrito por tu empresa</small>' : '')+'</span><button type="button" class="bt sec chico" data-'+acc+'="'+esc(p.k)+'">'+bt+'</button></li>'; }
  h='<div class="tarj"><div class="tarj-cab"><div><h2>Se evalúan '+usa.length+' de '+MAS_APP.TDM_TOPE+'</h2><p class="sub">La lista vale para todos los supervisores de la obra, aquí y en la app. Las notas que ya se pusieron no cambian: cada día se guardó con los puntos que tenía.</p></div></div>'+
    '<div class="tarj-cuerpo"><ul class="tdm-pl" id="tdm-p-usa">'+usa.map(function(k){ return fila(M.tdmPunto(k), 'Quitar', 'q'); }).join('')+'</ul>'+
    (libres.length ? '<div class="seccion"><h3>Para agregar</h3><ul class="tdm-pl" id="tdm-p-libres">'+libres.map(function(p){ return fila(p, 'Agregar', 'a'); }).join('')+'</ul></div>' : '')+
    '<div class="seccion"><h3>Escribe uno tuyo</h3><div class="campo"><label for="tdm-p-t">Qué tiene que hacer el trabajador</label><input id="tdm-p-t" maxlength="90" placeholder="Usó bloqueador solar y se hidrató"></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="tdm-p-c">Nombre corto <span class="tenue">· sale en la tabla</span></label><input id="tdm-p-c" maxlength="22" placeholder="Bloqueador"></div>'+
      '<div class="campo"><label for="tdm-p-m">Cómo se marca</label><select id="tdm-p-m"><option value="si">✓ ✕ Cumple o no</option><option value="mas">⭐ Suma cuando pasa</option></select></div></div>'+
      '<p class="ayuda" style="margin:0 0 10px">«Cumple o no» empieza en ✓ y baja la nota si falla. «Suma cuando pasa» es para lo bueno que no pasa todos los días (reportar, ayudar a otro): si no pasa, no cuenta.</p>'+
      '<div class="acciones" style="justify-content:flex-start"><button type="button" class="bt sec" id="tdm-p-mas">＋ Agregar mi punto</button><button type="button" class="bt-link" id="tdm-p-fab">Volver a los ocho de fábrica</button></div></div>'+
    '<div class="msg" id="tdm-p-msg" role="status"></div></div></div>';
  c.innerHTML=h;
  function guarda(lista, propios){
    var m=$('tdm-p-msg'), nuevo={ lista:lista.slice(), propios:(propios||[]).slice(), t:Date.now() }, texto=JSON.stringify({ v:1, lista:nuevo.lista, propios:nuevo.propios, t:nuevo.t }), oid=YO.obra.id;
    _masDice(m, 'Guardando…');
    /* sobre la fila que el servidor tenga en ese momento */
    return sbGet('sst_doc?empresa=eq.'+_enc(oid)+'&hoja=eq.tdm-cfg&select=id&limit=1').then(function(rows){
      var id=rows && rows[0] && rows[0].id;
      return (id ? sbPatch('sst_doc?id=eq.'+_enc(id), { nota:texto }) : sbPostP('sst_doc', { empresa:oid, hoja:'tdm-cfg', nombre:'Puntos del trabajador del mes', nota:texto })).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); });
    }).then(function(){
      TDMW.cfg=nuevo; TDMW.L=_tdmM().ptCriterios(); TDMW.marcas={};
      _tdmPuntos(); _masDice($('tdm-p-msg'), 'Guardado para todos los supervisores de la obra.', 'ok');
    }, function(e){ _masMal($('tdm-p-msg'), 'No se pudo guardar. '+porQueFallo(e)); });
  }
  Array.prototype.forEach.call(c.querySelectorAll('[data-q]'), function(b){ b.onclick=function(){
    var a=usa.filter(function(x){ return x!==b.getAttribute('data-q'); });
    if(a.length<MAS_APP.TDM_MINIMO) return _masMal($('tdm-p-msg'), 'Con menos de '+MAS_APP.TDM_MINIMO+' puntos la nota del día no dice nada. Agrega otro antes de quitar este.');
    guarda(a, cfg.propios);
  }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-a]'), function(b){ b.onclick=function(){
    if(usa.length>=MAS_APP.TDM_TOPE) return _masMal($('tdm-p-msg'), 'Ya son '+MAS_APP.TDM_TOPE+': con más puntos la evaluación se vuelve tarea y se deja de hacer. Quita uno para agregar este.');
    guarda(usa.concat([b.getAttribute('data-a')]), cfg.propios);
  }; });
  $('tdm-p-mas').onclick=function(){
    var t=gesTxt($('tdm-p-t').value).slice(0, 90), cc=gesTxt($('tdm-p-c').value).slice(0, 22), m=$('tdm-p-msg');
    if(t.length<6) return _masMal(m, 'Escribe el punto: qué tiene que hacer el trabajador.', 'tdm-p-t');
    if(MAS_APP.TDM_CATALOGO.concat(cfg.propios||[]).some(function(p){ return p && nrm(p.t)===nrm(t); })) return _masMal(m, 'Ese punto ya está en la lista.', 'tdm-p-t');
    if(usa.length>=MAS_APP.TDM_TOPE) return _masMal(m, 'Ya son '+MAS_APP.TDM_TOPE+'. Quita uno para agregar el tuyo.');
    var p={ k:'x'+(Date.now().toString(36)+Math.random().toString(36).slice(2)).slice(-7), t:t, c:(cc || t.split(' ').slice(0, 3).join(' ')).slice(0, 22), propio:true };
    if($('tdm-p-m').value==='mas') p.mas=true;
    guarda(usa.concat([p.k]), (cfg.propios||[]).concat([p]));
  };
  $('tdm-p-fab').onclick=function(){
    confirmar('¿Volver a los ocho de fábrica?', 'Tus puntos escritos no se borran: quedan en «Para agregar».', {si:'Sí, volver'}).then(function(si){ if(si) guarda(MAS_APP.TDM_DE_FABRICA.slice(), cfg.propios); });
  };
}

/* ══ 7 · EL COMITÉ DE SST ═════════════════════════════════════════════════════════════════════
   Lo que le toca a la obra según su gente —comité, sub-comité o supervisor—, su padrón, las reuniones del año con sus
   actas, los acuerdos pendientes y el libro. Es el mismo documento de la app: sst_estado, llave «comite_emp:<código de
   la obra>» = { tipo, eleccion, instalacion, desde, hasta, libro, variasObras, variasEmpresas, miembros:[{ id, nombre,
   dni, puesto, lado, sup, cargo }], actas:[{ id, n, tipo, fecha, hora, lugar, asistentes:[ids], agenda, desarrollo,
   acuerdos:[{ t, quien, plazo, hecho }], ts }], quitadas:{ id: cuándo }, ts, tsP, tsQ, y lo que «¿A quién acudo?» guarda
   ahí mismo (mando, punto, emergs) }.
   Las reglas son las de la app y vienen de ella (mas-app.js): qué le toca, qué le falta, el quórum, los doce meses, la
   numeración, el PDF del acta y el del libro. Lo que aquí se dice de la norma es, letra por letra, lo que dice la app
   (armar.py lo comprueba).
   La web no guarda copia: cada cambio se hace sobre lo que el servidor tiene en ese momento y lleva el sello de la app
   (comiteSello: el padrón tiene su reloj y cada acta el suyo), así el celular lo junta con lo suyo sin pisarlo.
   Nombrar al supervisor se puede en cualquier plan; el padrón del comité, sus actas y su libro, desde el plan que trae
   «comité» en la vitrina (como en la app). El cartel con fotos («Brigada y carteles») trae a su gente de este padrón, y
   lo que ve el trabajador en su celular se publica en «¿A quién acudo?» (sección 8). */
var COMW = { caja:null, n:0, obra:null, C:null, com:null, firma:'', anio:'', borr:null, visto:null };
function _comDoc(v){ var d=(v && typeof v==='object' && !Array.isArray(v)) ? v : {}; if(!Array.isArray(d.miembros)) d.miembros=[]; if(!Array.isArray(d.actas)) d.actas=[]; return d; }
function _comM(){ return MAS_APP.usar(Object.assign({}, COMW.C, { com:COMW.com })); }
function _comRD(){ return !!(COMW.C && COMW.C.rd); }
function _comToca(){ return _comM().comiteLoQueToca(COMW.C.n); }
function _comEsCuerpo(toca){ return toca.tipo==='comite' || toca.tipo==='subcomite'; }
function _comCuerpo(toca){ return toca.tipo==='subcomite' ? 'sub-comité' : 'comité'; }
/* la cita de una norma del Perú, entre paréntesis. En una obra de afuera no se escribe (la app tampoco la muestra) */
function _comLey(c, suelta){ return _comRD() ? '' : ' <span class="mas-ley">'+(suelta ? '' : '(')+esc(c)+(suelta ? '' : ')')+'</span>'; }
function _comTitulares(d){ return (d.miembros||[]).filter(function(m){ return !m.sup; }); }
function _comRol(m){ return (m.cargo==='presidente' ? 'Presidente · ' : (m.cargo==='secretario' ? 'Secretario · ' : ''))+(m.lado==='empleador' ? 'Del empleador' : 'De los trabajadores')+(m.sup ? ' · suplente' : ''); }
function _comDias(n){ n=Math.abs(n); return n+' día'+(n===1 ? '' : 's'); }
function _comNo(e){ return (e && e.portal) ? e.portal : porQueFallo(e); }
function _comTraer(fresco){
  if(!(YO.obra||{}).codigo) return Promise.reject(404);
  var antes=fresco ? masGente(true).then(function(){ masCtxSoltar(); }, function(){}) : Promise.resolve();
  return antes.then(function(){ return Promise.all([masCtx(), estadoLeerP(_creClaveCom())]); }).then(function(r){ return { C:r[0], com:_comDoc(r[1] && r[1].valor) }; });
}
/* cada cambio se hace sobre lo que el servidor tiene EN ESE MOMENTO (lo que un celular subió hace un minuto no se
   pisa) y sale con el sello de la app. bloque: 'padron' (las preguntas, el período, los integrantes) o nada (las actas).
   mutar(d) puede devolver { portal:'por qué no' } para no guardar. Si no se pudo leer, no se escribe. */
function comCambiar(bloque, mutar){
  var oid=(YO.obra||{}).id;
  if(!(YO.obra||{}).codigo) return Promise.reject({ portal:'Esta obra no tiene su código: el comité se guarda con él.' });
  return cargarMasApp().then(function(){ return estadoLeerP(_creClaveCom()); }).then(function(fila){
    var d=_comDoc((fila && fila.valor && typeof fila.valor==='object') ? JSON.parse(JSON.stringify(fila.valor)) : null);
    var r=mutar(d);
    if(r && r.portal) return Promise.reject(r);
    MAS_APP.comiteSello(d, bloque);
    return estadoEscribirP(_creClaveCom(), d).then(function(){
      if((YO.obra||{}).id===oid){ COMW.com=d; COMW.firma=''; }
      return d;
    });
  });
}
function masVistaComite(caja){
  _masCss(); _yaCss();
  COMW.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(COMW.obra!==(YO.obra||{}).id){ COMW.obra=(YO.obra||{}).id; COMW.anio=''; COMW.borr=null; COMW.com=null; COMW.C=null; COMW.firma=''; }
  cargando(caja);
  function pinta(silencio){
    var n=++COMW.n, uc=VISTA.ultimoCambio, fresco=!silencio || !!(uc && uc!==COMW.visto && uc.tabla==='sst_trabajador');
    COMW.visto=uc||null;
    _comTraer(fresco).then(function(R){
      if(n!==COMW.n || VISTA.actual!=='comite') return;
      var firma=''; try{ firma=JSON.stringify([R.com, R.C.n, R.C.varias, R.C.rd, _dcOrdenPlan()])+hoyISO(); }catch(e){}
      if(silencio && firma && firma===COMW.firma && $('com-toca') && document.body.contains(caja)) return;
      COMW.C=R.C; COMW.com=R.com; comPintar(); COMW.firma=firma;
    }).catch(function(cod){
      if(n!==COMW.n || VISTA.actual!=='comite' || silencio) return;
      if(cod===404 && !(YO.obra||{}).codigo) caja.innerHTML='<div class="vacio"><b>Esta obra no tiene su código</b>El comité se guarda con el código de la obra. Ábrela una vez en la app y vuelve.</div>';
      else fallo(caja, cod);
    });
  }
  VISTA.recargar=pinta; pinta();
}
function comPintar(){
  var caja=COMW.caja; if(!caja || !document.body.contains(caja)) return;
  var M=_comM(), d=COMW.com, n=COMW.C.n, rd=_comRD(), toca=M.comiteLoQueToca(n), esC=_comEsCuerpo(toca), cuerpo=_comCuerpo(toca), hoy=hoyISO();
  var chip=function(k, v, t){ var on=(d[k]===v); return '<button type="button" class="chip'+(on ? ' on' : '')+'" data-ctx="'+k+'" data-v="'+(v ? 1 : 0)+'" aria-pressed="'+(on ? 'true' : 'false')+'">'+t+'</button>'; };
  var dos='<p class="com-p">'+(rd ? '' : '<b>2.</b> ')+'¿En esta obra trabajan varias empresas o es un consorcio?</p><div class="chips">'+chip('variasEmpresas', true, 'Sí, varias empresas')+chip('variasEmpresas', false, 'No, solo la mía')+'</div>';
  var h='<div class="aviso" id="com-que"><b>El comité de tu obra, completo.</b> Lo que le toca según su gente, el padrón, las reuniones del año con sus actas, los acuerdos que siguen pendientes y el libro para imprimir. '+
    'Es el mismo comité de la app: lo que armas aquí aparece en el celular, y lo del celular, aquí.</div>';
  h+='<div class="com-dos">'+
    '<div class="tarj" id="com-preg"><div class="tarj-cab"><div><h2>'+(rd ? 'Una pregunta' : 'Dos preguntas, y te digo qué te toca')+'</h2>'+
      (rd ? '' : '<p class="sub">De esto depende si acá va un comité, un sub-comité o un supervisor. Se contesta una vez.</p>')+'</div></div><div class="tarj-cuerpo">'+
      (rd ? dos : '<p class="com-p"><b>1.</b> ¿Tu empresa lleva más de una obra al mismo tiempo?</p><div class="chips" style="margin-bottom:14px">'+chip('variasObras', true, 'Sí, varias obras')+chip('variasObras', false, 'No, solo esta')+'</div>'+dos)+
      '<div class="msg" id="com-preg-msg" role="status"></div></div></div>'+
    '<div class="tarj com-toca" id="com-toca"><div class="tarj-cab"><div><h2>Lo que le toca a esta obra</h2></div></div><div class="tarj-cuerpo">'+
      '<p class="com-nombre" id="com-toca-n">'+esc(toca.nombre)+'</p><p class="com-dice">'+toca.dice+'</p>'+
      (toca.ojo ? '<p class="com-ojo">'+esc(toca.ojo)+'</p>' : '')+
      '<p class="mas-ley" id="com-toca-ley" style="margin:10px 0 0">'+esc(toca.ley)+'</p>'+
      (!n ? '<p class="com-ojo" id="com-sin-gente">Todavía no has registrado trabajadores, así que este cálculo sale en cero. <button type="button" class="bt-link" id="com-ir-personal">Registrar a mi personal</button></p>' : '')+
    '</div></div></div>';
  /* lo que aparece además */
  if(d.variasEmpresas===true && rd) h+='<div class="aviso" id="com-coord">🤝 <b>Además, las empresas se coordinan.</b> Cuando varias empresas trabajan en el mismo lugar, todas aplican la prevención y se coordinan; '+
    'el titular del lugar informa a los contratistas de los riesgos y de las medidas de emergencia. <span class="mas-ley">(Decreto 522-06, art. 10)</span></div>';
  else if(d.variasEmpresas===true) h+='<div class="aviso" id="com-coord">🤝 <b>Además va un Comité Técnico de Coordinación.</b> Con consorcio o varias empresas ejecutando la obra, el empleador principal '+
    '—o su representante— lidera un Comité Técnico de Coordinación en SST para coordinar la prevención de riesgos entre todas. No reemplaza a tu '+(esC ? cuerpo : 'supervisor')+': se suma.'+_comLey('D.S. 011-2019-TR, art. 2° b)', true)+'</div>';
  if(toca.ambito==='obra') h+='<div class="aviso" id="com-obra">🗓️ <b>El mandato dura lo que dura la obra.</b> No es el año o los dos años del comité de empresa: el sub-comité y el supervisor '+
    'de una obra ejercen mientras la obra exista.'+_comLey('D.S. 011-2019-TR, art. 28.1')+'</div>';
  /* el comité y el sub-comité, con el plan que los trae; el supervisor, en todos */
  if(esC && !planWebTrae('comite')){
    var P=planWebPlan((INI_VITRINA.filter(function(v){ return v.k==='comite'; })[0]||{}).desde);
    h+='<div class="aviso ojo" id="com-candado">🔒 <b>El libro del comité se abre con el plan '+esc(P ? P.n : 'siguiente')+'.</b> Ahí entran el padrón paritario, las doce actas del año y los acuerdos con responsable y plazo.'+
      '<div class="acciones" style="margin-top:10px"><button type="button" class="bt chico" id="com-planes">'+(planwPuedePagar() ? 'Ver los planes' : 'Ver mi plan')+'</button></div></div>';
    caja.innerHTML=h; _comEnchufar(toca); return;
  }
  /* el mandato */
  var dias=M.comiteDiasDeMandato();
  if(d.hasta && dias!==null) h+='<div class="aviso '+(dias<0 ? 'mal' : (dias<=60 ? 'ojo' : 'ok'))+'" id="com-mandato">'+(dias<0 ? '⛔ ' : (dias<=60 ? '⏳ ' : '✅ '))+
    esc(dias<0 ? 'El mandato venció hace '+_comDias(dias)+'. Hay que convocar a nuevas elecciones.' : (dias<=60 ? 'El mandato vence en '+_comDias(dias)+'. Conviene convocar a elecciones ya.' : 'Mandato vigente hasta el '+(fechaLarga(d.hasta)||d.hasta)+'.'))+'</div>';
  /* el padrón */
  var titP=esC ? 'El padrón' : (rd ? 'El coordinador' : 'El supervisor');
  var btP=d.miembros.length ? 'Editar el padrón' : (esC ? 'Armar el '+cuerpo : (rd ? 'Nombrar al coordinador' : (toca.ambito==='obra' ? 'Registrar al supervisor elegido' : 'Nombrar al supervisor')));
  h+='<div class="tarj" id="com-padron"><div class="tarj-cab"><div><h2>'+titP+'</h2>'+(esC ? '<p class="sub">Mitad y mitad: los mismos de la empresa que de los trabajadores. Es lo primero que se mira en una fiscalización.</p>' : '')+'</div>'+
    '<div class="acciones"><button type="button" class="bt'+(d.miembros.length ? ' sec' : '')+' chico" id="com-padron-bt">'+(d.miembros.length ? '' : '＋ ')+btP+'</button></div></div><div class="tarj-cuerpo">';
  if(!d.miembros.length) h+='<p class="tenue" id="com-padron-vacio" style="margin:0">Todavía no hay nadie registrado.</p>';
  else if(esC){
    h+='<div class="com-lados">'+MAS_APP.COMITE_LADOS.map(function(L){
      var tit=M.comiteTitulares(L[0]), sup=M.comiteSuplentes(L[0]);
      return '<div class="com-lado" data-lado="'+L[0]+'"><b>'+esc(L[1])+' · '+tit.length+'</b>'+(tit.length+sup.length ? tit.concat(sup).map(function(m){
        return '<div class="com-m"><i aria-hidden="true">'+(m.cargo==='presidente' ? '⭐' : (m.cargo==='secretario' ? '✒️' : '·'))+'</i><span><span data-sin-pais>'+esc(m.nombre)+'</span>'+(m.sup ? ' <em>(suplente)</em>' : '')+
          (m.cargo==='presidente' ? ' <small>· Presidente</small>' : (m.cargo==='secretario' ? ' <small>· Secretario</small>' : ''))+(m.puesto ? ' <small data-sin-pais>— '+esc(m.puesto)+'</small>' : '')+'</span></div>';
      }).join('') : '<p class="tenue" style="margin:0;font-size:13px">— nadie todavía —</p>')+'</div>';
    }).join('')+'</div>';
  } else {
    h+='<div class="com-lados">'+d.miembros.map(function(m){ return '<div class="com-lado"><b data-sin-pais>'+esc(m.nombre)+'</b><small class="tenue" data-sin-pais>'+esc(m.puesto||'—')+(m.dni ? ' · '+esc(docPersonaP())+' '+esc(m.dni) : '')+'</small></div>'; }).join('')+'</div>';
  }
  h+='</div></div>';
  /* lo que falta para estar en regla */
  var f=M.comiteFaltas();
  if(f.length) h+='<div class="aviso mal" id="com-faltas">⚠️ <b>Lo que te falta para estar en regla</b><ul class="com-ul">'+f.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul></div>';
  else if(d.miembros.length) h+='<div class="aviso ok" id="com-regla">✅ El '+esc(toca.nombre.charAt(0).toLowerCase()+toca.nombre.slice(1))+' está completo y en regla.</div>';
  if(!esC){
    h+=rd ? '<div class="aviso" id="com-pie-sup">ℹ️ El Coordinador de SST cumple funciones parecidas a las del comité <span class="mas-ley">(Manual-Guía del Comité Mixto · Ministerio de Trabajo)</span>. El día que llegues a 15 trabajadores, esta pantalla te lo va a decir sola: '+
        'ahí toca elegir a los representantes de los trabajadores y armar el Comité Mixto.</div>'
      : '<div class="aviso" id="com-pie-sup">ℹ️ El Supervisor de SST tiene las mismas funciones que el comité y las mismas facilidades'+_comLey('Ley 29783, art. 32')+'. El día que pases de 20 trabajadores, esta pantalla te lo va a decir sola: '+
        'ahí toca convocar a elecciones y armar el comité paritario.</div>';
    h+=_comPieApp(toca);
    caja.innerHTML=h; _comEnchufar(toca); return;
  }
  /* las doce reuniones del año */
  var anioHoy=hoy.slice(0, 4), anios={}; anios[anioHoy]=1;
  d.actas.forEach(function(a){ var y=String(a.fecha||'').slice(0, 4); if(/^\d{4}$/.test(y)) anios[y]=1; });
  var LA=Object.keys(anios).sort().reverse();
  if(!COMW.anio || !anios[COMW.anio]) COMW.anio=anioHoy;
  var anio=COMW.anio, meses=M.comiteMesesDelAnio(anio), hechas=meses.filter(function(m){ return m.estado==='hecha'; }).length, perdidas=meses.filter(function(m){ return m.estado==='perdida'; }).length;
  var EST={ hecha:['✓', 'hecha'], perdida:['✕', 'se pasó'], toca:['!', 'toca este mes'], futura:['·', 'por venir'] };
  h+='<div class="tarj" id="com-reun"><div class="tarj-cab"><div><h2>Las reuniones de '+(LA.length>1 ? '<select id="com-anio" aria-label="Año" class="com-anio">'+LA.map(function(y){ return '<option'+(y===anio ? ' selected' : '')+'>'+y+'</option>'; }).join('')+'</select>' : anio)+'</h2>'+
    '<p class="sub" id="com-reun-s">Una ordinaria al mes, en día fijado'+_comLey('D.S. 005-2012-TR, art. 68')+'. Llevas <b>'+hechas+' de 12</b>'+(perdidas ? ' y se te pasaron <b class="com-rojo">'+perdidas+'</b>' : '')+'.</p></div>'+
    '<div class="acciones"><button type="button" class="bt chico" id="com-acta-nueva">＋ Levantar un acta</button></div></div><div class="tarj-cuerpo">'+
    '<div class="com-meses" id="com-meses">'+meses.map(function(m){
      var e=EST[m.estado]||EST.futura, nom=MAS_APP.MESES_ES[m.mes-1];
      return '<button type="button" class="com-mes '+m.estado+'" data-ym="'+m.ym+'"'+(m.acta ? ' data-acta="'+esc(m.acta.id)+'"' : '')+' title="'+esc(nom.charAt(0).toUpperCase()+nom.slice(1)+': '+e[1]+(m.acta ? ' · acta N° '+(m.acta.n||'—') : '')+(m.extra.length ? ' · '+m.extra.length+' extraordinaria'+(m.extra.length===1 ? '' : 's') : ''))+'">'+
        '<small>'+MAS_APP.MESES_3[m.mes-1]+'</small><b aria-hidden="true">'+e[0]+'</b>'+(m.extra.length ? '<i aria-hidden="true">+'+m.extra.length+'</i>' : '')+'</button>';
    }).join('')+'</div><p class="ayuda" style="margin:0">✓ hecha · ✕ se pasó · ! toca este mes · · por venir. Toca un mes para abrir su acta o para levantarla.</p></div></div>'+
    '<div class="tarj" id="t-com-actas"></div>';
  /* los acuerdos, que es lo único que el comité produce de verdad */
  var ac=M.comiteAcuerdosPendientes(), venc=ac.filter(function(x){ return x.vencido; }).length;
  h+='<div class="tarj'+(ac.length ? '' : ' com-sola')+'" id="com-acu"><div class="tarj-cab"><div><h2>Acuerdos pendientes</h2><p class="sub" id="com-acu-s">'+(ac.length ? ac.length+' sin cerrar'+(venc ? ' · <b class="com-rojo">'+venc+' fuera de plazo</b>' : '')+'.' : 'No hay acuerdos sin cerrar.')+'</p></div></div>'+
    (ac.length ? '<div class="tarj-cuerpo"><ul class="com-acu">'+ac.slice(0, 60).map(function(x, i){
      return '<li><button type="button" class="com-acu-t" data-acta="'+esc(x.acta)+'"><b>'+esc(x.t)+'</b><small>'+(x.quien ? '<span data-sin-pais>'+esc(x.quien)+'</span> · ' : '')+
        (x.plazo ? (x.vencido ? '⛔ venció el ' : '📅 para el ')+esc(fechaLarga(x.plazo)||x.plazo) : 'sin plazo')+' · acta N° '+esc(x.n||'—')+'</small></button>'+
        '<button type="button" class="bt sec chico" data-cumple="'+i+'">Marcar cumplido</button></li>';
    }).join('')+'</ul>'+(ac.length>60 ? '<p class="ayuda">Se muestran 60 de '+ac.length+'.</p>' : '')+'</div>' : '')+'</div>';
  /* el libro */
  h+='<div class="tarj com-sola" id="com-libro"><div class="tarj-cab"><div><h2>El Libro de Actas</h2><p class="sub">La constitución, la instalación, las reuniones y los acuerdos van todos al mismo libro'+_comLey('D.S. 005-2012-TR, arts. 51 y 53')+'. '+
    'Este PDF es para imprimirlo y pegarlo en el libro legalizado, o para mandarlo entero.</p><div class="msg com-msg0" id="com-libro-msg" role="status"></div></div>'+
    '<div class="acciones"><button type="button" class="bt sec chico" id="com-libro-abrir">Abrir el PDF</button><button type="button" class="bt chico" id="com-libro-bt">Descargar el Libro de Actas '+anio+'</button></div></div></div>';
  h+=_comPieApp(toca);
  var est=$('t-com-actas') ? $('t-com-actas')._est : null;
  caja.innerHTML=h;
  if(est) $('t-com-actas')._est=est;
  _comEnchufar(toca);
  /* las actas del año, en su tabla */
  var nTit=_comTitulares(d).length, q=M.comiteQuorum();
  var filas=M.comiteActasDe(anio).map(function(a){
    var as=(a.asistentes||[]).length, acs=(a.acuerdos||[]), he=acs.filter(function(x){ return x.hecho; }).length;
    return { id:a.id, n:String(a.n||''), fecha:String(a.fecha||'').slice(0, 10), tipo:MAS_APP.COMITE_TIPOS[a.tipo]||'Reunión', as:as, quorum:(q>0 ? M.comiteHuboQuorum(a) : null), acs:acs.length, he:he };
  });
  var cols=[
    {k:'n', t:'N°', h:function(x){ return '<b>'+esc(x.n||'—')+'</b>'; }},
    {k:'fecha', t:'Fecha', h:function(x){ return esc(fechaLarga(x.fecha)||x.fecha); }, csv:function(x){ return fechaLarga(x.fecha)||x.fecha; }},
    {k:'tipo', t:'Tipo'},
    {k:'as', t:'Asistieron', h:function(x){ return x.as+' de '+nTit+(x.quorum===null ? '' : ' <span class="pill '+(x.quorum ? 'ok' : 'ojo')+'">'+(x.quorum ? 'con quórum' : 'sin quórum')+'</span>'); }, v:function(x){ return x.as; }, csv:function(x){ return x.as+' de '+nTit+(x.quorum===null ? '' : (x.quorum ? ' (con quórum)' : ' (sin quórum)')); }},
    {k:'acs', t:'Acuerdos', h:function(x){ return x.acs ? '<span class="pill '+(x.he===x.acs ? 'ok' : 'gris')+'">'+x.he+' de '+x.acs+' cumplidos</span>' : '<span class="tenue">—</span>'; }, v:function(x){ return x.acs; }, csv:function(x){ return x.acs ? x.he+' de '+x.acs+' cumplidos' : ''; }},
    {k:'_acc', t:'', acc:true, h:function(){ return '<button type="button" class="bt sec chico" data-acc="pdf">PDF</button>'; }}
  ];
  tabla($('t-com-actas'), cols, filas, {orden:'fecha', asc:false, unidad:'actas', archivo:'actas-del-comite-'+anio, vacio:'Ninguna acta en '+anio, vacioSub:'Levanta la primera con «＋ Levantar un acta»: sale numerada, con su quórum y sus acuerdos.',
    alClic:function(x){ comActaVer(x.id); }, accion:function(acc, x){ if(acc==='pdf') _comBajarActa(x.id); else comActaVer(x.id); }});
}
/* 07/10/2026 · lo que sale de este padrón, a un clic: el cartel con fotos (que lo trae de aquí: no se escribe dos veces) y
   lo que ve cada trabajador en su celular */
function _comPieApp(toca){
  return '<div class="tarj com-sola" id="com-pie-app"><div class="tarj-cab"><div><h2>Que la obra los conozca</h2><p class="sub">Con el padrón armado no hay que escribirlos otra vez: el cartel para la vitrina los trae de aquí, con la foto de cada uno, '+
    'y «¿A quién acudo?» los publica en el celular de cada trabajador.</p></div>'+
    '<div class="acciones"><button type="button" class="bt sec chico" id="com-ir-cargos">🖼 Cartel con fotos</button><button type="button" class="bt sec chico" id="com-ir-quien">🆘 ¿A quién acudo?</button></div></div></div>';
}
/* los botones de la pantalla */
function _comEnchufar(toca){
  var caja=COMW.caja, esC=_comEsCuerpo(toca);
  Array.prototype.forEach.call(caja.querySelectorAll('[data-ctx]'), function(b){ b.onclick=function(){
    var k=b.getAttribute('data-ctx'), v=(b.getAttribute('data-v')==='1'), m=$('com-preg-msg');
    if(COMW.com[k]===v || COMW.ocupado) return;
    COMW.ocupado=true; _masDice(m, 'Guardando…');
    comCambiar('padron', function(d){ d[k]=v; }).then(function(){ COMW.ocupado=false; comPintar(); }, function(e){ COMW.ocupado=false; _masMal($('com-preg-msg'), 'No se pudo guardar. '+_comNo(e)); });
  }; });
  var on=function(id, f){ if($(id)) $(id).onclick=f; };
  on('com-ir-personal', function(){ navegar('personal'); });
  /* al cartel, con el de este padrón ya elegido (comité, sub-comité o supervisor) */
  on('com-ir-cargos', function(){ try{ if(typeof PCG==='object' && PCG){ PCG.tipo=(toca.tipo==='subcomite' || toca.tipo==='supervisor') ? toca.tipo : 'comite'; PCG.rol=''; PCG.hoja=0; } }catch(e){} navegar('cargos'); });
  on('com-ir-quien', function(){ navegar('quien'); });
  on('com-planes', function(){ navegar('plan'); });
  on('com-padron-bt', function(){ comPadron(); });
  on('com-acta-nueva', function(){ comActaForm(null, ''); });
  if($('com-anio')) $('com-anio').onchange=function(){ COMW.anio=this.value; comPintar(); };
  if($('com-meses')) $('com-meses').onclick=function(ev){
    var b=ev.target.closest('.com-mes'); if(!b) return;
    if(b.getAttribute('data-acta')) comActaVer(b.getAttribute('data-acta')); else comActaForm(null, b.getAttribute('data-ym'));
  };
  var ac=esC ? _comM().comiteAcuerdosPendientes() : [];
  Array.prototype.forEach.call(caja.querySelectorAll('.com-acu-t'), function(b){ b.onclick=function(){ comActaVer(b.getAttribute('data-acta')); }; });
  Array.prototype.forEach.call(caja.querySelectorAll('[data-cumple]'), function(b){ b.onclick=function(){
    var x=ac[+b.getAttribute('data-cumple')]; if(!x || b.disabled) return;
    b.disabled=true;
    _comAcuerdo(x.acta, x.i, x.t, true).then(function(){ toast('Acuerdo cumplido.'); comPintar(); }, function(e){ b.disabled=false; toast('No se pudo marcar. '+_comNo(e)); if(e && e.portal) masRecargar(); });
  }; });
  var libro=function(f){ return function(){
    var bt=this, m=$('com-libro-msg'); bt.disabled=true; _masDice(m, 'Armando el libro…');
    masCtx({ com:COMW.com }).then(function(C){
      var R=MAS_APP.usar(C).comiteLibroPdf(COMW.anio);
      if(!R || !R.blob) throw { portal:'El libro no se pudo armar.' };
      bt.disabled=false; _masDice(m, '', ''); f(R);
    }).catch(function(e){ bt.disabled=false; _masMal(m, 'No se pudo armar el libro. '+_comNo(e)); });
  }; };
  on('com-libro-bt', libro(function(R){ bajarBlob(R.blob, R.nombre); }));
  on('com-libro-abrir', libro(masAbrirPdf));
}
/* un acuerdo, cumplido o pendiente. Se comprueba que siga siendo el mismo (otro equipo pudo editar el acta) */
function _comAcuerdo(idActa, i, texto, hecho){
  return comCambiar(null, function(d){
    var a=d.actas.filter(function(x){ return x.id===idActa; })[0];
    if(!a || !a.acuerdos || !a.acuerdos[i] || String(a.acuerdos[i].t||'')!==String(texto||'')) return { portal:'Esa acta cambió en otro equipo. Ya se puso al día: vuelve a intentarlo.' };
    a.acuerdos[i].hecho=hecho ? 1 : 0; a.ts=Date.now();
  });
}
function _comActaPdf(id){
  return masCtx({ com:COMW.com }).then(function(C){
    var R=MAS_APP.usar(C).comiteActaPdf(id);
    if(!R || !R.blob) throw { portal:'Esa acta ya no está.' };
    R.nombre=String(R.nombre||'acta-comite.pdf').replace(/[\\\/:*?"<>|\s]+/g, '-');
    return R;
  });
}
function _comBajarActa(id){ _comActaPdf(id).then(function(R){ bajarBlob(R.blob, R.nombre); }, function(e){ toast('No se pudo armar el acta. '+_comNo(e)); }); }

/* ── el padrón: el período y los integrantes. Cada cambio se guarda en el momento, como en la app ── */
var COMP = null;
function comPadron(){
  _masCss(); _yaCss();
  var toca=_comToca(), esC=_comEsCuerpo(toca), esSub=(toca.tipo==='subcomite'), rd=_comRD(), d=COMW.com;
  if(esC && !planWebTrae('comite')){ navegar('plan'); return; }
  COMP={ edita:null, ocupado:false };
  var f=function(id, et, v, mas){ return '<div class="campo"><label for="'+id+'">'+et+'</label><input type="date" id="'+id+'" value="'+esc(String(v||'').slice(0, 10))+'"'+(mas||'')+'></div>'; };
  var h='<div class="seccion" style="margin-top:0"><h3>El período</h3><div class="fila-c ya-al">'+f('comp-eleccion', 'Fecha de la elección', d.eleccion)+(esC ? f('comp-instalacion', 'Fecha del acta de instalación', d.instalacion) : '')+'</div>'+
    ((esC && !esSub) ? '<p class="ayuda" style="margin:-6px 0 12px">Los nuevos miembros inician funciones dentro de los 10 días hábiles de terminada la elección.</p>' : '')+
    '<div class="fila-c ya-al">'+f('comp-desde', 'Desde', d.desde)+f('comp-hasta', 'Hasta', d.hasta)+'</div>'+
    '<p class="ayuda" style="margin:-6px 0 12px">'+(toca.ambito==='obra' ? 'En la obra el mandato dura lo que dura la obra'+_comLey('D.S. 011-2019-TR, art. 28.1')+'.' : 'El mandato de los representantes de los trabajadores dura de 1 a 2 años'+_comLey('D.S. 005-2012-TR, art. 62')+'.')+'</p>'+
    (esC ? '<div class="campo"><label for="comp-libro">N° del Libro de Actas legalizado (opcional)</label><input id="comp-libro" maxlength="40" placeholder="Ej.: 0001-2026" value="'+esc(d.libro||'')+'"></div>' : '')+
    '<div class="acciones"><button type="button" class="bt sec" id="comp-per-ok">Guardar el período</button></div><div class="msg" id="comp-per-msg" role="status"></div></div>'+
    '<div class="seccion"><h3>'+(esC ? 'Integrantes' : (rd ? 'Coordinador nombrado' : 'Supervisor nombrado'))+'</h3><div id="comp-lista"></div></div>'+
    '<div class="seccion"><h3 id="comp-alta-t"></h3>'+
      '<div class="campo"><label for="comp-nombre">Apellidos y nombres</label><input id="comp-nombre" maxlength="120" placeholder="Escribe sus primeras letras o su documento"></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="comp-dni">'+esc(docPersonaP())+'</label><input id="comp-dni" maxlength="20"></div><div class="campo"><label for="comp-puesto">Puesto</label><input id="comp-puesto" maxlength="80"></div></div>'+
      (esC ? '<div class="fila-c ya-al"><div class="campo"><label for="comp-lado">Representa a</label><select id="comp-lado"><option value="empleador">Al empleador</option><option value="trabajador" selected>A los trabajadores</option></select></div>'+
        '<div class="campo"><label for="comp-sup">Como</label><select id="comp-sup"><option value="0" selected>Titular</option><option value="1">Suplente</option></select></div></div>' : '')+
      '<div class="msg" id="comp-msg" role="status"></div><div class="acciones"><button type="button" class="bt" id="comp-ok"></button><button type="button" class="bt sec" id="comp-cancela" hidden>Cancelar</button></div></div>';
  abrirHoja(esC ? (esSub ? 'El padrón del Sub-comité' : 'El padrón del Comité') : (rd ? 'El Coordinador de SST' : 'El Supervisor de SST'),
    esC ? 'Mitad y mitad: los mismos de la empresa que de los trabajadores' : (rd ? 'Queda con su período y su acta' : 'Lo nombran los propios trabajadores. Queda con su período y su acta'), h,
    '<button type="button" class="bt sec" id="comp-cerrar">Listo</button>', {sinFoco:true});
  $('comp-cerrar').onclick=cerrarHoja;
  var S=COMP;
  function ocupado(v){ S.ocupado=v; Array.prototype.forEach.call(document.querySelectorAll('#hoja-cuerpo button'), function(b){ b.disabled=v; }); }
  function hecho(txt, dejaForm){ ocupado(false); if(COMP!==S) return; lista(); if(!dejaForm) alta(); comPintar(); if(txt) toast(txt); }
  function noSePudo(m){ return function(e){ ocupado(false); if(COMP!==S) return; _masMal(m, 'No se pudo guardar. '+_comNo(e)); }; }
  function lista(){
    var c=$('comp-lista'), d=COMW.com; if(!c) return;
    if(!d.miembros.length){ c.innerHTML='<p class="tenue" style="margin:0">Todavía no hay nadie.</p>'; return; }
    var fila=function(m){
      return '<li class="com-pf" data-m="'+esc(m.id)+'"><span><b data-sin-pais>'+esc(m.nombre)+'</b>'+(m.sup ? ' <em>(suplente)</em>' : '')+'<small data-sin-pais>'+esc(m.puesto||'—')+(m.dni ? ' · '+esc(docPersonaP())+' '+esc(m.dni) : '')+'</small></span><span class="acciones">'+
        ((esC && !m.sup) ? '<button type="button" class="bt sec chico'+(m.cargo==='presidente' ? ' on' : '')+'" data-cargo="presidente" aria-pressed="'+(m.cargo==='presidente' ? 'true' : 'false')+'">'+(m.cargo==='presidente' ? '⭐ Presidente' : 'Hacer Presidente')+'</button>'+
          '<button type="button" class="bt sec chico'+(m.cargo==='secretario' ? ' on' : '')+'" data-cargo="secretario" aria-pressed="'+(m.cargo==='secretario' ? 'true' : 'false')+'">'+(m.cargo==='secretario' ? '✒️ Secretario' : 'Hacer Secretario')+'</button>' : '')+
        '<button type="button" class="bt sec chico" data-ed="1">Editar</button><button type="button" class="bt mal chico" data-qt="1">Quitar</button></span></li>';
    };
    c.innerHTML=esC ? MAS_APP.COMITE_LADOS.map(function(L){
      var g=d.miembros.filter(function(m){ return m.lado===L[0]; });
      return '<p class="com-lt"><b>'+esc(L[1])+'</b> · '+esc(L[2])+'</p>'+(g.length ? '<ul class="com-pl">'+g.map(fila).join('')+'</ul>' : '<p class="tenue" style="margin:0 0 6px;font-size:13px">— nadie todavía —</p>');
    }).join('') : '<ul class="com-pl">'+d.miembros.map(fila).join('')+'</ul>';
    Array.prototype.forEach.call(c.querySelectorAll('li[data-m]'), function(li){
      var id=li.getAttribute('data-m'), m=COMW.com.miembros.filter(function(x){ return x.id===id; })[0]; if(!m) return;
      Array.prototype.forEach.call(li.querySelectorAll('[data-cargo]'), function(b){ b.onclick=function(){
        if(S.ocupado) return;
        var cargo=b.getAttribute('data-cargo'); ocupado(true);
        comCambiar('padron', function(dd){
          var yo=dd.miembros.filter(function(x){ return x.id===id; })[0];
          if(!yo) return { portal:'Esa persona ya no está en el padrón: alguien lo cambió en otro equipo.' };
          var quitar=(yo.cargo===cargo);
          dd.miembros.forEach(function(x){ if(x.cargo===cargo) x.cargo='miembro'; });
          if(!quitar) yo.cargo=cargo;
        }).then(function(){ hecho('', true); }, function(e){ ocupado(false); toast('No se pudo guardar. '+_comNo(e)); if(COMP===S && e && e.portal) masRecargar(); });
      }; });
      li.querySelector('[data-ed]').onclick=function(){ if(S.ocupado) return; S.edita=id; alta(); try{ $('comp-nombre').focus(); $('comp-alta-t').scrollIntoView({ block:'nearest' }); }catch(e){} };
      li.querySelector('[data-qt]').onclick=function(){
        if(S.ocupado) return;
        confirmar('¿Quitar a '+m.nombre+'?', 'Sale del padrón. Las actas donde ya firmó no se tocan.', {si:'Sí, quitar', mal:true}).then(function(si){
          if(!si || COMP!==S) return;
          ocupado(true);
          comCambiar('padron', function(dd){ dd.miembros=dd.miembros.filter(function(x){ return x.id!==id; }); }).then(function(){ var era=(S.edita===id); if(era) S.edita=null; hecho(m.nombre+' salió del padrón.', !era); }, function(e){ ocupado(false); toast('No se pudo quitar. '+_comNo(e)); });
        });
      };
    });
  }
  function alta(){
    var ed=S.edita ? (COMW.com.miembros.filter(function(x){ return x.id===S.edita; })[0]||null) : null;
    if(S.edita && !ed) S.edita=null;
    $('comp-alta-t').textContent=ed ? 'Editar a '+ed.nombre : (esC ? 'Agregar un integrante' : (rd ? 'Nombrar al coordinador' : 'Nombrar al supervisor'));
    $('comp-nombre').value=ed ? (ed.nombre||'') : ''; $('comp-dni').value=ed ? (ed.dni||'') : ''; $('comp-puesto').value=ed ? (ed.puesto||'') : '';
    if(esC){ $('comp-lado').value=(ed && ed.lado==='empleador') ? 'empleador' : (ed ? 'trabajador' : $('comp-lado').value); $('comp-sup').value=(ed && ed.sup) ? '1' : (ed ? '0' : $('comp-sup').value); }
    $('comp-ok').textContent=ed ? 'Guardar los cambios' : (esC ? 'Agregar' : 'Nombrar');
    $('comp-cancela').hidden=!ed; _masDice($('comp-msg'), '', '');
  }
  sugGente($('comp-nombre'), { lista:function(){ return masGente().then(masActivos); }, alElegir:function(t){ $('comp-dni').value=t.dni||''; $('comp-puesto').value=t.puesto||''; } });
  $('comp-cancela').onclick=function(){ S.edita=null; alta(); };
  $('comp-per-ok').onclick=function(){
    if(S.ocupado) return;
    var m=$('comp-per-msg'), v=function(id){ return $(id) ? String($(id).value||'') : null; }, de=v('comp-desde'), ha=v('comp-hasta');
    if(de && ha && ha<=de) return _masMal(m, 'La fecha de «hasta» tiene que ser posterior a la de «desde».', 'comp-hasta');
    ocupado(true); _masDice(m, 'Guardando…');
    comCambiar('padron', function(dd){
      dd.eleccion=v('comp-eleccion')||''; if(esC) dd.instalacion=v('comp-instalacion')||''; dd.desde=de||''; dd.hasta=ha||''; if(esC) dd.libro=gesTxt(v('comp-libro')).slice(0, 40);
      dd.tipo=toca.tipo;
    }).then(function(){ ocupado(false); if(COMP!==S) return; _masDice(m, 'El período quedó registrado.', 'ok'); comPintar(); }, noSePudo(m));
  };
  $('comp-ok').onclick=function(){
    if(S.ocupado) return;
    var m=$('comp-msg'), nom=gesTxt($('comp-nombre').value).slice(0, 120), dni=gesTxt($('comp-dni').value).slice(0, 20), pto=gesTxt($('comp-puesto').value).slice(0, 80);
    var lado=esC ? $('comp-lado').value : 'trabajador', sup=esC ? ($('comp-sup').value==='1' ? 1 : 0) : 0, edita=S.edita;
    if(nom.length<3) return _masMal(m, 'Escribe el nombre completo.', 'comp-nombre');
    ocupado(true); _masDice(m, 'Guardando…');
    comCambiar('padron', function(dd){
      var yo=edita ? dd.miembros.filter(function(x){ return x.id===edita; })[0] : null;
      if(!esC && dd.miembros.length && !yo) return { portal:(rd ? 'Ya hay un coordinador nombrado.' : 'Ya hay un supervisor nombrado.')+' Edítalo o quítalo primero.' };
      var k=_creDocLlave(dni), otro=dd.miembros.filter(function(x){ return x!==yo && ((k && _creDocLlave(x.dni)===k) || nrm(x.nombre)===nrm(nom)); })[0];
      if(otro) return { portal:otro.nombre+' ya está en el padrón.' };
      if(esC && !sup && !yo && dd.miembros.filter(function(x){ return x.lado===lado && !x.sup; }).length>=6 && !rd)
        return { portal:esSub ? 'Ya hay 6 titulares de ese lado; el sub-comité no puede pasar de 12 (D.S. 011-2019-TR, art. 27.1).' : 'Ya hay 6 titulares de ese lado; el comité no puede pasar de 12 (D.S. 005-2012-TR, art. 43).' };
      if(!yo){ yo={ id:masId('cm'), cargo:'miembro' }; dd.miembros.push(yo); }
      yo.nombre=nom; yo.dni=dni; yo.puesto=pto; yo.lado=lado; yo.sup=sup;
      if(sup) yo.cargo='miembro';
    }).then(function(){ S.edita=null; hecho(edita ? 'Cambios guardados.' : nom+' entró al padrón.'); try{ $('comp-nombre').focus(); }catch(e){} }, noSePudo(m));
  };
  lista(); alta();
}

/* ── el acta: levantarla o corregirla ── */
var COMA = null;
function _comUltimoDia(ym){ var p=ym.split('-'); return new Date(+p[0], +p[1], 0).getDate(); }
function comActaForm(id, ym){
  _masCss(); _yaCss();
  var M=_comM(), d=COMW.com, rd=_comRD(), a=id ? M.actaComitePorId(id) : null, hoy=hoyISO();
  if(id && !a){ toast('Esa acta ya no está.'); masRecargar(); return; }
  if(!planWebTrae('comite')){ navegar('plan'); return; }
  ym=/^\d{4}-\d{2}$/.test(String(ym||'')) ? ym : '';
  var anio=(a ? String(a.fecha||hoy) : (ym||hoy)).slice(0, 4);
  /* el día que se propone: el de hoy si el mes es este; a mitad de mes si ya pasó; el mismo día de hoy si todavía no llega */
  var fecha=a ? String(a.fecha||'').slice(0, 10) : (!ym || ym===hoy.slice(0, 7) ? hoy : (ym<hoy.slice(0, 7) ? ym+'-15' : ym+'-'+dos(Math.min(+hoy.slice(8, 10), _comUltimoDia(ym)))));
  var B=COMW.borr, sigue=!!(B && B.id===(id||null) && B.sucio);
  var S=COMA=sigue ? B : { id:id||null, ym:ym, n:a ? String(a.n||'') : M.comiteNumeroSiguiente(anio), fecha:fecha, tipo:a ? (a.tipo||'ordinaria') : (d.actas.length ? 'ordinaria' : 'instalacion'), hora:a ? (a.hora||'') : '', lugar:a ? (a.lugar||'') : '',
    asis:a ? (a.asistentes||[]).slice() : _comTitulares(d).map(function(m){ return m.id; }), agenda:a ? (a.agenda||'') : '', desarrollo:a ? (a.desarrollo||'') : '',
    acu:a ? (a.acuerdos||[]).map(function(x){ return { t:x.t||'', quien:x.quien||'', plazo:x.plazo||'', hecho:x.hecho ? 1 : 0 }; }) : [], sucio:false };
  S.guardando=false;
  var nTit=_comTitulares(d).length, q=M.comiteQuorum();
  var h=(sigue && S.sucio ? '<div class="aviso ojo" id="coma-sigue">Seguimos con lo que habías escrito. <button type="button" class="bt-link" id="coma-cero">Empezar de cero</button></div>' : '')+
    '<div class="seccion" style="margin-top:0"><h3>La reunión</h3>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="coma-n">N° de acta</label><input id="coma-n" maxlength="12" value="'+esc(S.n)+'"></div><div class="campo"><label for="coma-fecha">Fecha</label><input type="date" id="coma-fecha" value="'+esc(S.fecha)+'"></div></div>'+
      '<div class="campo"><label for="coma-tipo">Tipo de reunión</label><select id="coma-tipo">'+Object.keys(MAS_APP.COMITE_TIPOS).map(function(k){ return '<option value="'+k+'"'+(S.tipo===k ? ' selected' : '')+'>'+esc(MAS_APP.COMITE_TIPOS[k])+'</option>'; }).join('')+'</select>'+
        '<p class="ayuda">'+(rd ? 'Por lo menos una reunión al mes; el acta va a la Dirección General de Higiene y Seguridad Industrial <span class="mas-ley">(Manual-Guía del Comité Mixto)</span>.'
          : 'La ordinaria es una al mes. La extraordinaria la convoca el Presidente, la piden dos miembros, o sale sola cuando hay un accidente mortal'+_comLey('D.S. 005-2012-TR, art. 68')+'.')+'</p></div>'+
      '<div class="fila-c ya-al"><div class="campo"><label for="coma-hora">Hora</label><input type="time" id="coma-hora" value="'+esc(S.hora)+'"></div><div class="campo"><label for="coma-lugar">Lugar</label><input id="coma-lugar" maxlength="90" placeholder="Sala de reuniones / obra" value="'+esc(S.lugar)+'"></div></div></div>'+
    '<div class="seccion"><h3>Quiénes asistieron</h3><p class="ayuda" style="margin:0 0 8px">'+(rd ? 'Marca a los que asistieron: firman el acta.' : 'El quórum es la mitad más uno: <b>'+q+'</b> de '+nTit+' titulares'+_comLey('D.S. 005-2012-TR, art. 69')+'.')+'</p>'+
      (d.miembros.length ? '<div class="ges-el"><div class="ges-el-lista" id="coma-asis" style="max-height:none">'+d.miembros.map(function(m){
        return '<label class="ges-el-f"><input type="checkbox" class="coma-as" data-id="'+esc(m.id)+'"'+(S.asis.indexOf(m.id)>-1 ? ' checked' : '')+'><span class="ges-el-n"><b data-sin-pais>'+esc(m.nombre)+'</b><small>'+esc(_comRol(m))+'</small></span></label>';
      }).join('')+'</div></div>' : '<div class="aviso ojo" id="coma-sin-padron">⚠️ No hay nadie en el padrón todavía. <button type="button" class="bt-link" id="coma-ir-padron">Armar el padrón</button></div>')+
      '<div class="msg" id="coma-quorum" role="status" style="margin-top:8px"></div></div>'+
    '<div class="seccion"><h3>Agenda</h3><textarea id="coma-agenda" rows="4" maxlength="4000" placeholder="Un punto por línea: lectura del acta anterior, avance del programa anual, accidentes del mes...">'+esc(S.agenda)+'</textarea></div>'+
    '<div class="seccion"><h3>Desarrollo</h3><textarea id="coma-desarrollo" rows="7" maxlength="12000" placeholder="Qué se trató y qué se dijo. Esto es lo que queda en el Libro de Actas.">'+esc(S.desarrollo)+'</textarea></div>'+
    '<div class="seccion"><h3>Acuerdos</h3><p class="ayuda" style="margin:0 0 8px">Un acuerdo sin responsable y sin fecha no es un acuerdo. Es lo primero que un inspector cruza con la siguiente acta.</p>'+
      '<div id="coma-acuerdos"></div><div class="acciones" style="margin-top:8px"><button type="button" class="bt sec chico" id="coma-acu-mas">＋ Agregar un acuerdo</button></div>'+
      '<datalist id="coma-gente">'+d.miembros.map(function(m){ return '<option value="'+esc(m.nombre)+'">'; }).join('')+'</datalist></div>'+
    '<div class="msg" id="coma-msg" role="status"></div>';
  abrirHoja(a ? 'Acta N° '+(a.n||'—') : 'Nueva acta', a ? 'Corrige lo que haga falta: se guarda sobre la misma acta' : 'Queda numerada, con su quórum y sus acuerdos; después sale en PDF con el espacio de cada firma', h,
    '<button type="button" class="bt sec" id="coma-no">Cancelar</button><button type="button" class="bt" id="coma-ok">Guardar el acta</button>', {sinFoco:true});
  COMW.borr=S;
  function leer(){
    S.n=gesTxt($('coma-n').value).slice(0, 12); S.fecha=$('coma-fecha').value||''; S.tipo=$('coma-tipo').value; S.hora=$('coma-hora').value||''; S.lugar=gesTxt($('coma-lugar').value).slice(0, 90);
    if($('coma-asis')) S.asis=[].map.call(document.querySelectorAll('.coma-as:checked'), function(x){ return x.getAttribute('data-id'); });
    S.agenda=$('coma-agenda').value; S.desarrollo=$('coma-desarrollo').value;
    S.acu.forEach(function(x, i){ if($('coma-at-'+i)){ x.t=$('coma-at-'+i).value; x.quien=$('coma-aq-'+i).value; x.plazo=$('coma-ap-'+i).value; } });
  }
  function quorum(){
    var c=$('coma-quorum'), n=document.querySelectorAll('.coma-as:checked').length;
    if(!c || !q){ if(c) c.textContent=''; return; }
    if(n>=q) _masDice(c, '✅ Hay quórum: '+n+' de '+q+' necesarios.', 'ok');
    else { c.className='msg com-ojo'; c.textContent='⚠️ Sin quórum: '+n+' de '+q+'. El acta igual se levanta, pero el Presidente tiene que citar a otra reunión dentro de los 8 días siguientes.'; }
  }
  function acuerdos(){
    var c=$('coma-acuerdos');
    c.innerHTML=S.acu.length ? S.acu.map(function(x, i){
      return '<div class="com-af"><div class="com-af-c"><b>Acuerdo '+(i+1)+'</b><button type="button" class="bt-link" data-qa="'+i+'">Quitar</button></div>'+
        '<textarea id="coma-at-'+i+'" rows="2" maxlength="600" placeholder="Qué se acordó hacer" aria-label="Acuerdo '+(i+1)+': qué se acordó hacer">'+esc(x.t)+'</textarea>'+
        '<div class="fila-c ya-al" style="margin-top:8px"><div class="campo" style="margin:0"><label for="coma-aq-'+i+'">Responsable</label><input id="coma-aq-'+i+'" maxlength="90" list="coma-gente" value="'+esc(x.quien)+'"></div>'+
        '<div class="campo" style="margin:0"><label for="coma-ap-'+i+'">Plazo</label><input type="date" id="coma-ap-'+i+'" value="'+esc(x.plazo)+'"></div></div></div>';
    }).join('') : '<p class="tenue" style="margin:0;font-size:13.5px">Sin acuerdos todavía.</p>';
    Array.prototype.forEach.call(c.querySelectorAll('[data-qa]'), function(b){ b.onclick=function(){ leer(); S.acu.splice(+b.getAttribute('data-qa'), 1); S.sucio=true; acuerdos(); }; });
  }
  acuerdos(); quorum();
  $('hoja-cuerpo').addEventListener('input', function(){ if(COMA===S){ S.sucio=true; leer(); } });
  if($('coma-asis')) $('coma-asis').addEventListener('change', quorum);
  $('coma-acu-mas').onclick=function(){ leer(); S.acu.push({ t:'', quien:'', plazo:'', hecho:0 }); S.sucio=true; acuerdos(); try{ $('coma-at-'+(S.acu.length-1)).focus(); }catch(e){} };
  if($('coma-ir-padron')) $('coma-ir-padron').onclick=function(){ leer(); comPadron(); };
  if($('coma-cero')) $('coma-cero').onclick=function(){ COMW.borr=null; comActaForm(id, ym); };
  $('coma-no').onclick=function(){ COMW.borr=null; cerrarHoja(); };
  $('coma-ok').onclick=function(){
    if(S.guardando) return;
    leer();
    var m=$('coma-msg'), bt=$('coma-ok');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(S.fecha)) return _masMal(m, 'Falta la fecha de la reunión.', 'coma-fecha');
    if(S.fecha<'2000-01-01' || S.fecha>(+hoy.slice(0, 4)+1)+'-12-31') return _masMal(m, 'Revisa el año de la fecha.', 'coma-fecha');
    var sinTexto=S.acu.filter(function(x){ return gesTxt(x.t).length<=2 && (gesTxt(x.quien) || x.plazo); }).length;
    if(sinTexto) return _masMal(m, 'Hay un acuerdo con responsable o plazo pero sin texto: escribe qué se acordó, o quítalo.');
    var acu=S.acu.filter(function(x){ return gesTxt(x.t).length>2; }).map(function(x){ return { t:String(x.t).replace(/\s+/g, ' ').trim().slice(0, 600), quien:gesTxt(x.quien).slice(0, 90), plazo:/^\d{4}-\d{2}-\d{2}$/.test(x.plazo||'') ? x.plazo : '', hecho:x.hecho ? 1 : 0 }; });
    var idA=S.id||masId('ca'), limpio=function(t, n){ return String(t||'').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, n); };
    S.guardando=true; bt.disabled=true; _masDice(m, 'Guardando…');
    comCambiar(null, function(dd){
      var yo=dd.actas.filter(function(x){ return x.id===idA; })[0];
      if(S.id && !yo) return { portal:'Esa acta ya no está: alguien la quitó en otro equipo.' };
      var rep=S.n ? dd.actas.filter(function(x){ return x.id!==idA && String(x.n||'')===S.n && String(x.fecha||'').slice(0, 4)===S.fecha.slice(0, 4); })[0] : null;
      if(rep) return { portal:'Ya hay un acta N° '+S.n+' en '+S.fecha.slice(0, 4)+' (la del '+(fechaLarga(rep.fecha)||rep.fecha)+'). Cámbiale el número.' };
      if(!yo){ yo={ id:idA }; dd.actas.push(yo); }
      yo.n=S.n; yo.tipo=MAS_APP.COMITE_TIPOS[S.tipo] ? S.tipo : 'ordinaria'; yo.fecha=S.fecha; yo.hora=S.hora; yo.lugar=S.lugar;
      yo.asistentes=S.asis.filter(function(x){ return dd.miembros.some(function(mm){ return mm.id===x; }); });
      yo.agenda=limpio(S.agenda, 4000); yo.desarrollo=limpio(S.desarrollo, 12000); yo.acuerdos=acu; yo.ts=Date.now();
      dd.actas.sort(function(x, y){ return String(y.fecha||'').localeCompare(String(x.fecha||'')); });
    }).then(function(){
      S.guardando=false; COMW.borr=null; COMW.anio=S.fecha.slice(0, 4);
      toast(S.id ? 'Acta corregida.' : 'Acta N° '+(S.n||'—')+' guardada.');
      comPintar(); comActaVer(idA);
    }, function(e){ S.guardando=false; if(bt) bt.disabled=false; _masMal(m, 'No se pudo guardar. '+_comNo(e)); });
  };
  _masFoco(a ? 'coma-agenda' : 'coma-lugar');
}

/* ── el acta guardada: verla, cerrar sus acuerdos, sacarla en PDF, corregirla o quitarla ── */
function comActaVer(id){
  _masCss(); _yaCss();
  var M=_comM(), d=COMW.com, rd=_comRD(), a=M.actaComitePorId(id), hoy=hoyISO();
  if(!a){ toast('Esa acta ya no está.'); masRecargar(); return; }
  var nom={}; d.miembros.forEach(function(m){ nom[m.id]=m; });
  var as=(a.asistentes||[]).map(function(x){ return nom[x]; }).filter(Boolean), n=(a.asistentes||[]).length, nTit=_comTitulares(d).length, q=M.comiteQuorum(), hubo=M.comiteHuboQuorum(a);
  var h=(rd ? '<div class="aviso" id="comv-quorum">👥 Asistieron '+n+' de '+nTit+' titulares.</div>'
            : '<div class="aviso '+(hubo ? 'ok' : 'ojo')+'" id="comv-quorum">'+(hubo ? '✅' : '⚠️')+' Asistieron '+n+' de '+nTit+' titulares. Quórum: '+q+'.</div>')+
    '<div class="seccion" style="margin-top:0"><h3>Asistentes</h3>'+(as.length ? '<div class="com-lados">'+as.map(function(m){ return '<div class="com-lado"><b data-sin-pais>'+esc(m.nombre)+'</b><small class="tenue">'+esc(_comRol(m))+'</small></div>'; }).join('')+'</div>'
      : '<p class="tenue" style="margin:0">No se marcó a nadie.</p>')+'</div>'+
    (a.agenda ? '<div class="seccion"><h3>Agenda</h3><p class="mas-texto">'+esc(a.agenda)+'</p></div>' : '')+
    (a.desarrollo ? '<div class="seccion"><h3>Desarrollo</h3><p class="mas-texto">'+esc(a.desarrollo)+'</p></div>' : '')+
    '<div class="seccion"><h3>Acuerdos</h3>'+((a.acuerdos||[]).length ? '<ul class="com-acu" id="comv-acu">'+a.acuerdos.map(function(x, i){
      var venc=!!(x.plazo && !x.hecho && x.plazo<hoy);
      return '<li><span class="com-acu-t"><b>'+(x.hecho ? '✅ ' : (venc ? '⛔ ' : '⏳ '))+esc(x.t)+'</b><small>'+(x.quien ? '<span data-sin-pais>'+esc(x.quien)+'</span> · ' : '')+(x.plazo ? (venc ? 'venció el ' : 'para el ')+esc(fechaLarga(x.plazo)||x.plazo) : 'sin plazo')+'</small></span>'+
        '<button type="button" class="bt sec chico" data-cumple="'+i+'">'+(x.hecho ? 'Marcar como pendiente' : 'Marcar cumplido')+'</button></li>';
    }).join('')+'</ul>' : '<p class="tenue" style="margin:0">Esta reunión no dejó acuerdos escritos.</p>')+'</div>'+
    '<div class="seccion"><h3>El papel</h3><p class="ayuda" style="margin:0 0 8px">'+(rd ? 'Sale con el espacio de firma de cada asistente, para imprimirla, firmarla y mandarla a la Dirección General de Higiene y Seguridad Industrial.'
      : 'Sale con el espacio de firma de cada asistente, para imprimirla y pegarla en el Libro de Actas legalizado.')+'</p><div class="pdfv" id="comv-pdf" aria-label="Vista previa del acta"></div></div>'+
    '<div class="msg" id="comv-msg" role="status"></div>';
  abrirHoja('Acta N° '+(a.n||'—'), [MAS_APP.COMITE_TIPOS[a.tipo]||'Reunión', fechaLarga(a.fecha)||a.fecha, a.hora, a.lugar].filter(Boolean).join(' · '), h,
    '<button type="button" class="bt mal" id="comv-quitar">Quitar esta acta</button><button type="button" class="bt sec" id="comv-editar">Editar el acta</button><button type="button" class="bt sec" id="comv-abrir">Abrir el PDF</button><button type="button" class="bt" id="comv-bajar">Descargar el acta en PDF</button>', {sinFoco:true, ancha:true});
  var caja=$('comv-pdf'), R0=null; caja.innerHTML='<div class="pdfv-msg">Armando el acta…</div>';
  _comActaPdf(id).then(function(R){ R0=R; if(caja.isConnected) pdfVistaP(caja, R.blob); }).catch(function(){ if(caja.isConnected) caja.innerHTML='<div class="pdfv-msg">No se pudo armar el acta. Revisa tu conexión e inténtalo otra vez.</div>'; });
  function con(f){ return function(){ var bt=this; bt.disabled=true; (R0 ? Promise.resolve(R0) : _comActaPdf(id)).then(function(R){ bt.disabled=false; f(R); }, function(e){ bt.disabled=false; _masMal($('comv-msg'), 'No se pudo armar el acta. '+_comNo(e)); }); }; }
  $('comv-bajar').onclick=con(function(R){ bajarBlob(R.blob, R.nombre); });
  $('comv-abrir').onclick=con(masAbrirPdf);
  $('comv-editar').onclick=function(){ COMW.borr=null; comActaForm(id, ''); };
  Array.prototype.forEach.call(document.querySelectorAll('#comv-acu [data-cumple]'), function(b){ b.onclick=function(){
    var i=+b.getAttribute('data-cumple'), x=a.acuerdos[i]; if(!x || b.disabled) return;
    b.disabled=true;
    _comAcuerdo(id, i, x.t, !x.hecho).then(function(){ toast(x.hecho ? 'Acuerdo otra vez pendiente.' : 'Acuerdo cumplido.'); comPintar(); comActaVer(id); },
      function(e){ b.disabled=false; _masMal($('comv-msg'), 'No se pudo marcar. '+_comNo(e)); if(e && e.portal){ masRecargar(); } });
  }; });
  $('comv-quitar').onclick=function(){
    confirmar('¿Quitar esta acta?', 'Se borra de aquí y de los celulares del equipo. Si ya la pegaste en el libro legalizado, ahí se queda.', {si:'Sí, quitar', mal:true}).then(function(si){
      if(!si) return;
      comCambiar(null, function(dd){
        dd.actas=dd.actas.filter(function(x){ return x.id!==id; });
        /* la marca de que se quitó: sin ella el celular que aún la tiene la volvería a subir */
        if(!dd.quitadas || typeof dd.quitadas!=='object' || Array.isArray(dd.quitadas)) dd.quitadas={};
        dd.quitadas[id]=Date.now();
      }).then(function(){ toast('Acta quitada.'); cerrarHoja(); comPintar(); }, function(e){ _masMal($('comv-msg'), 'No se pudo quitar. '+_comNo(e)); });
    });
  };
}

/* ══ 8 · «¿A QUIÉN ACUDO?» ════════════════════════════════════════════════════════════════════
   Lo que el trabajador ve en su celular, en «¿A quién acudo?»: los números de emergencia de la obra, el punto de
   reunión, la brigada, la línea de mando y quién lo representa (el comité o el supervisor de SST). Marcelo
   (07/10/2026): «…y avisar a quién acudo».
   Nada nuevo en el servidor, y nada escrito dos veces:
     · los números, el punto de reunión y la línea de mando se guardan donde los guarda la app: dentro del comité de la
       obra (sst_estado «comite_emp:<código>»: emergs, emerg, punto, mando), con su propio reloj (comiteSello 'quien').
       Cada cambio se hace sobre lo que el servidor tiene en ese momento, y se busca el renglón por lo que dice, no por
       su posición: si otro equipo movió la lista, no se toca el renglón equivocado;
     · el comité sale del padrón («Comité de SST») y la brigada, de las credenciales vigentes con «Brigadista» marcado
       («Credenciales»): aquí se ven, y se cambian en su sitio;
     · «Publicar» escribe la hoja que la app le entrega a quien entra con el código de la obra (sst_doc, hoja
       «quienes», una por obra). El paquete lo arma la app (mas-app.js · quienesPaquete): sin el documento de nadie y
       con la foto de la ficha de cada uno. Antes de publicar se vuelve a leer todo: si algo no se pudo leer, no se
       publica (saldría sin la brigada, o sin las fotos). */
var QUIW = { caja:null, n:0, obra:null, C:null, com:null, creds:[], gente:[], pub:null, pubIds:[], firma:'', ed:null, ocupado:false };
var QUIG = { obra:null, lista:null, t:0, pide:null };
var QUI_CAMBIO = 'Esa lista cambió desde otro equipo. Ya está al día: mira cómo quedó y repite el cambio.';
/* el personal con la foto de su ficha (si la base todavía no tiene esa columna, sin ella) */
function _quiGente(fresco){
  var oid=(YO.obra||{}).id;
  if(QUIG.obra!==oid){ QUIG.obra=oid; QUIG.lista=null; QUIG.t=0; QUIG.pide=null; }
  if(!fresco && QUIG.lista && Date.now()-QUIG.t<60000) return Promise.resolve(QUIG.lista);
  if(QUIG.pide) return QUIG.pide;
  var base='id,ext,nombre,dni,puesto,estatus';
  function pedir(sel){ return traerTodo('sst_trabajador', '&select='+sel+'&order=nombre.asc', 6000); }
  var p=pedir(base+',foto_url').catch(function(c){ if(c!==400) throw c; return pedir(base); }).then(function(l){
    if(QUIG.pide===p) QUIG.pide=null;
    var L=(l||[]).filter(function(t){ return t && t.nombre; });
    if((YO.obra||{}).id===oid){ QUIG.lista=L; QUIG.t=Date.now(); }
    return L;
  }, function(e){ if(QUIG.pide===p) QUIG.pide=null; throw e; });
  QUIG.pide=p; return p;
}
function _quiTraer(fresco){
  if(!(YO.obra||{}).codigo) return Promise.reject(404);
  var oid=(YO.obra||{}).id, nada=function(){ return null; };
  return Promise.all([masCtx(), estadoLeerP(_creClaveCom()), estadoLeerP('credenciales'), estadoLeerP('credenciales_anuladas').catch(nada), _quiGente(fresco),
                      sbGet('sst_doc?empresa=eq.'+_enc(oid)+'&hoja=eq.quienes&select=id,nota,creado&order=creado.desc&limit=4')]).then(function(r){
    var t=(r[3] && r[3].valor && typeof r[3].valor==='object' && !Array.isArray(r[3].valor)) ? MAS_APP.tumbasVivas(r[3].valor) : {};
    var filas=Array.isArray(r[5]) ? r[5] : [], pub=null;
    if(filas[0]){ try{ pub=(typeof filas[0].nota==='string') ? JSON.parse(filas[0].nota) : filas[0].nota; }catch(e){ pub=null; } }
    return { C:r[0], com:_comDoc(r[1] && r[1].valor), creds:_creLimpia(r[2] && r[2].valor, t), gente:r[4]||[],
             pub:(pub && typeof pub==='object' && !Array.isArray(pub)) ? pub : null, pubIds:filas.map(function(f){ return f && f.id; }).filter(Boolean) };
  });
}
function _quiPon(R){ var W=QUIW; W.C=R.C; W.com=R.com; W.creds=R.creds; W.gente=R.gente; W.pub=R.pub; W.pubIds=R.pubIds; }
/* la app, con lo de esta obra: el comité guardado, las credenciales (de ahí sale la brigada) y el personal con su foto
   (su id es el «ext» de la ficha: con él la credencial encuentra a su dueño) */
function _quiM(com){
  var W=QUIW;
  return MAS_APP.usar(Object.assign({}, W.C, { com:com||W.com, creds:W.creds,
    trabs:(W.gente||[]).map(function(t){ return { id:String(t.ext||''), nombre:gesTxt(t.nombre), dni:gesTxt(t.dni), puesto:gesTxt(t.puesto), fotoUrl:String(t.foto_url||'') }; }) }));
}
function _quiPaquete(){ return _quiM().quienesPaquete(); }
function _quiSos(p){ var s=MAS_APP.emergsLimpios(p && p.emergs); if(!s.length && p && p.emerg) s=MAS_APP.emergsLimpios([{ t:'Emergencia de la obra', tel:p.emerg }]); return s; }
/* «nada que publicar» es lo que la app llama así: sin números, sin comité, sin brigada y sin línea de mando */
function _quiVacio(p){ return !p || (!(p.org||[]).length && !(p.brig||[]).length && !(p.mando||[]).length && !_quiSos(p).length); }
function _quiCanon(v){
  if(Array.isArray(v)) return '['+v.map(_quiCanon).join(',')+']';
  if(v && typeof v==='object') return '{'+Object.keys(v).sort().map(function(k){ return JSON.stringify(k)+':'+_quiCanon(v[k]); }).join(',')+'}';
  return JSON.stringify(v===undefined ? null : v);
}
function _quiPartes(p){
  p=p||{};
  return { emergs:_quiCanon(_quiSos(p)), punto:String(p.punto||''), brig:_quiCanon(p.brig||[]), mando:_quiCanon(p.mando||[]), org:_quiCanon([p.tipo||'', p.titulo||'', p.org||[], p.periodo||null]) };
}
function _quiLista(a){ a=(a||[]).filter(Boolean); return a.length<2 ? (a[0]||'') : a.slice(0, -1).join(', ')+' y '+a[a.length-1]; }
/* qué pasa con lo publicado: nada · nunca · igual · cambio (y qué partes) · retirar (está publicado y aquí ya no hay nada) */
function _quiEstado(p){
  var pub=QUIW.pub, hayPub=!_quiVacio(pub), hay=!_quiVacio(p);
  if(!hay && !hayPub) return { k:'nada' };
  if(!hayPub) return { k:'nunca' };
  if(!hay) return { k:'retirar', al:String(pub.al||'') };
  var a=_quiPartes(p), b=_quiPartes(pub), dif=[];
  ['emergs', 'punto', 'brig', 'mando', 'org'].forEach(function(k){ if(a[k]!==b[k]) dif.push(k); });
  return dif.length ? { k:'cambio', dif:dif, al:String(pub.al||'') } : { k:'igual', al:String(pub.al||'') };
}
function _quiParteN(k, toca){
  if(k==='emergs') return 'los números de emergencia';
  if(k==='punto') return 'el punto de reunión';
  if(k==='brig') return 'la brigada';
  if(k==='mando') return 'la línea de mando';
  return _comEsCuerpo(toca) ? 'el '+_comCuerpo(toca) : 'el supervisor de SST';
}
/* dónde está un renglón en la lista que el servidor tiene ahora (por lo que dice) */
function _quiPos(lista, x, campos){
  for(var i=0;i<(lista||[]).length;i++){
    var y=lista[i]||{}, ok=true;
    for(var j=0;j<campos.length;j++) if(gesTxt(y[campos[j]])!==gesTxt((x||{})[campos[j]])){ ok=false; break; }
    if(ok) return i;
  }
  return -1;
}
function _quiIni(n){ var q=String(n||'').trim().split(/\s+/).filter(Boolean); if(!q.length) return '?'; return (q[0].charAt(0)+(q.length>1 ? q[1].charAt(0) : '')).toUpperCase(); }
function _quiCara(m, cl){
  return '<span class="qui-cara'+(cl ? ' '+cl : '')+'" aria-hidden="true">'+esc(_quiIni(m.n))+((m.f && /^https:\/\//.test(m.f)) ? '<img src="'+esc(m.f)+'" alt="" loading="lazy">' : '')+'</span>';
}
function masVistaQuien(caja){
  _masCss(); _yaCss();
  var W=QUIW; W.caja=caja;
  var ac=$('acciones'); if(ac) ac.innerHTML='';
  if(W.obra!==(YO.obra||{}).id){ W.obra=(YO.obra||{}).id; W.C=null; W.com=null; W.creds=[]; W.gente=[]; W.pub=null; W.pubIds=[]; W.firma=''; W.ed=null; W.ocupado=false; }
  cargando(caja);
  function pinta(silencio){
    var n=++W.n;
    _quiTraer(!silencio).then(function(R){
      if(n!==W.n || VISTA.actual!=='quien') return;
      var firma=''; try{ firma=JSON.stringify([R.com, R.creds, R.gente, R.pub, R.C.n, R.C.varias, R.C.rd])+hoyISO(); }catch(e){}
      /* el refresco callado no repinta si nada cambió, ni mientras se está escribiendo o guardando */
      if(silencio && $('qui-dos') && document.body.contains(caja)){
        var a=document.activeElement, escribe=!!(a && caja.contains(a) && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName));
        if((firma && firma===W.firma) || W.ed || W.ocupado || escribe) return;
      }
      _quiPon(R); W.firma=firma; quiPintar();
    }).catch(function(cod){
      if(n!==W.n || VISTA.actual!=='quien' || silencio) return;
      if(cod===404 && !(YO.obra||{}).codigo) caja.innerHTML='<div class="vacio"><b>Esta obra no tiene su código</b>«¿A quién acudo?» se guarda con el código de la obra. Ábrela una vez en la app y vuelve.</div>';
      else fallo(caja, cod);
    });
  }
  VISTA.recargar=pinta; pinta();
}
function quiPintar(){
  var W=QUIW, caja=W.caja; if(!caja || !document.body.contains(caja) || !W.C) return;
  var M=_quiM(), d=W.com, p=M.quienesPaquete(), toca=M.comiteLoQueToca(W.C.n), E=_quiEstado(p), sos=M.emergsLocal();
  var h='<div class="aviso" id="qui-que"><b>Lo que tu gente ve en «¿A quién acudo?», en su celular:</b> a quién llamar si pasa algo, adónde ir, quién manda en su frente y quién la representa. '+
    'Los números, el punto de reunión y la línea de mando se cargan aquí o en la app: es lo mismo. El comité sale de su padrón y la brigada, de las credenciales.</div>';
  h+=_quiPubHTML(E, toca);
  h+='<div class="qui-dos" id="qui-dos"><div class="qui-izq">'+_quiEmergsHTML(sos)+_quiPuntoHTML(d)+_quiMandoHTML(d)+_quiFuentesHTML(M, p, toca)+'</div>'+
    '<aside class="qui-lado" aria-label="Así lo ve tu gente"><p class="peq-lbl" id="qui-cel-t" style="margin:0 0 8px">'+((E.k==='cambio' || E.k==='nunca') ? 'Así lo va a ver tu gente' : 'Así lo ve tu gente')+'</p>'+
    '<div class="qui-cel" id="qui-cel">'+_quiCelHTML(p)+'</div></aside></div>';
  caja.innerHTML=h;
  _quiEnchufar(sos);
}
function _quiPubHTML(E, toca){
  var cuando=E.al ? 'el '+(fechaLarga(E.al)||E.al) : 'antes';
  if(E.k==='nada') return '<div class="qui-pub" id="qui-pub" data-e="nada"><span><b>Todavía no hay nada que publicar.</b> Carga los números de emergencia de la obra, arma el comité (o nombra al supervisor de SST) o marca a los brigadistas en sus credenciales: '+
    'entonces esto aparece en el celular de toda la obra.</span></div>';
  if(E.k==='nunca') return '<div class="qui-pub ojo" id="qui-pub" data-e="nunca"><span><b>Todavía no está publicado.</b> Tu gente no lo ve en su celular hasta que lo publiques.</span>'+
    '<button type="button" class="bt" id="qui-publicar">📣 Publicar en los celulares de la obra</button></div>';
  if(E.k==='igual') return '<div class="qui-pub ok" id="qui-pub" data-e="igual"><span>✅ <b>Publicado '+esc(cuando)+'.</b> Es lo que tu gente ve hoy en «¿A quién acudo?».</span></div>';
  if(E.k==='retirar') return '<div class="qui-pub ojo" id="qui-pub" data-e="retirar"><span><b>Tu gente sigue viendo lo que se publicó '+esc(cuando)+',</b> y aquí ya no queda nada. Si ya no va, retíralo.</span>'+
    '<button type="button" class="bt sec" id="qui-retirar">Retirar lo publicado</button></div>';
  return '<div class="qui-pub ojo" id="qui-pub" data-e="cambio"><span><b>Hay cambios sin publicar:</b> '+esc(_quiLista(E.dif.map(function(k){ return _quiParteN(k, toca); })))+'. Tu gente todavía ve lo que se publicó '+esc(cuando)+'.</span>'+
    '<button type="button" class="bt" id="qui-publicar">📣 Publicar los cambios</button></div>';
}
/* ── los números de emergencia: hasta ocho, en el orden en que hay que llamar ── */
function _quiEmergsHTML(sos){
  var ed=(QUIW.ed && QUIW.ed.que==='emerg') ? QUIW.ed : null, tope=sos.length>=MAS_APP.EMERG_MAX;
  var h='<div class="tarj" id="qui-emergs"><div class="tarj-cab"><div><h2>Números de emergencia de la obra</h2><p class="sub">A quién se llama cuando pasa algo, en el orden en que hay que llamar. Son de la obra: el contacto personal de cada trabajador va en su ficha.</p></div>'+
    '<div class="acciones"><button type="button" class="bt sec chico" id="qui-em-mas"'+((tope || QUIW.ed) ? ' disabled' : '')+'>＋ Agregar un número</button></div></div><div class="tarj-cuerpo">';
  if(sos.length) h+='<ul class="com-pl" id="qui-em-l">'+sos.map(function(x, i){
      return '<li class="com-pf"><span><b><i class="qui-n" aria-hidden="true">'+(i+1)+'</i>'+esc(x.t)+'</b><small><span data-sin-pais>'+esc(x.tel)+'</span>'+(i<MAS_APP.EMERG_EN_STICKER ? ' · sale en el carné' : '')+'</small></span><div class="acciones">'+
        (i>0 ? '<button type="button" class="bt sec chico" data-em-sube="'+i+'" aria-label="'+esc('Subir en la lista: '+x.t)+'" title="Se llama antes">▲</button>' : '')+
        '<button type="button" class="bt sec chico" data-em-ed="'+i+'" aria-label="'+esc('Editar el número de '+x.t)+'">Editar</button>'+
        '<button type="button" class="bt sec chico" data-em-q="'+i+'" aria-label="'+esc('Quitar el número de '+x.t)+'">Quitar</button></div></li>';
    }).join('')+'</ul>';
  else if(!ed) h+='<p class="ayuda" id="qui-em-vacio" style="margin:0">Todavía no hay ninguno. Empieza por el que contesta siempre: la ambulancia o el supervisor SST de turno.</p>';
  h+='<div id="qui-em-f">'+(ed ? _quiEmergForm(sos, ed) : '')+'</div>'+
    '<p class="ayuda" style="margin:10px 0 0">'+(tope ? 'Ocho es el tope: si falta uno, quita el que menos se usa. ' : '')+'Los dos primeros salen en el carné de cada trabajador y en el sticker del casco.</p>'+
    '<div class="msg com-msg0" id="qui-em-msg" role="status"></div></div></div>';
  return h;
}
function _quiEmergForm(sos, ed){
  var x=ed.x||{}, L=MAS_APP.EMERG_DE_QUIEN, otro=!!(x.t && L.indexOf(x.t)<0);
  return '<div class="qui-f" id="qui-emf"><div class="fila-c">'+
    '<div class="campo"><label for="qui-em-t">¿De quién es?</label><select id="qui-em-t">'+L.map(function(o){ return '<option value="'+esc(o)+'"'+(x.t===o ? ' selected' : '')+'>'+esc(o)+'</option>'; }).join('')+
      '<option value="__otro__"'+(otro ? ' selected' : '')+'>Otro…</option></select></div>'+
    '<div class="campo" id="qui-em-otro-c"'+(otro ? '' : ' hidden')+'><label for="qui-em-otro">¿Cómo se llama?</label><input id="qui-em-otro" maxlength="28" placeholder="Jefe de guardia" value="'+esc(otro ? x.t : '')+'"></div>'+
    '<div class="campo"><label for="qui-em-tel">Número</label><input id="qui-em-tel" type="tel" inputmode="tel" maxlength="22" autocomplete="off" placeholder="987 654 321" value="'+esc(x.tel||'')+'"></div></div>'+
    '<div class="acciones"><button type="button" class="bt sec chico" id="qui-em-no">Cancelar</button><button type="button" class="bt chico" id="qui-em-ok">'+(ed.x ? 'Guardar' : 'Agregar')+'</button></div></div>';
}
function _quiPuntoHTML(d){
  return '<div class="tarj" id="qui-punto-t"><div class="tarj-cab"><div><h2>Punto de reunión</h2><p class="sub">Adónde va la gente si hay que evacuar. Sale debajo de los números.</p></div></div><div class="tarj-cuerpo">'+
    '<div class="qui-linea"><input id="qui-punto" maxlength="90" placeholder="Explanada frente a la garita principal" aria-label="Punto de reunión" value="'+esc(d.punto||'')+'">'+
    '<button type="button" class="bt sec" id="qui-punto-ok" disabled>Guardar</button></div><div class="msg com-msg0" id="qui-punto-msg" role="status"></div></div></div>';
}
/* ── la línea de mando: quién manda en el frente, con su cargo y su teléfono ── */
function _quiCargos(L){
  var out=MAS_APP.CARGOS_SUGERIDOS.slice();
  /* un cargo que puso la app y no está en la lista se conserva: si no, al editar a esa persona se le cambiaría */
  (L||[]).forEach(function(m){ var c=gesTxt(m && m.cargo); if(c && out.indexOf(c)<0) out.push(c); });
  return out;
}
function _quiMandoHTML(d){
  var L=Array.isArray(d.mando) ? d.mando : [], ed=(QUIW.ed && QUIW.ed.que==='mando') ? QUIW.ed : null, vis=[];
  L.forEach(function(m, i){ if(m && gesTxt(m.n)) vis.push({ m:m, i:i }); });
  var h='<div class="tarj" id="qui-mando"><div class="tarj-cab"><div><h2>La línea de mando</h2><p class="sub">Quién es el capataz, el residente, el de producción, el de SSOMA: a quién subir cuando algo no se arregla abajo.</p></div>'+
    '<div class="acciones"><button type="button" class="bt sec chico" id="qui-mn-mas"'+(QUIW.ed ? ' disabled' : '')+'>＋ Agregar a alguien</button></div></div><div class="tarj-cuerpo">';
  if(vis.length) h+='<ul class="com-pl" id="qui-mn-l">'+vis.map(function(v, k){
      var m=v.m;
      return '<li class="com-pf"><span data-sin-pais><b>'+esc(m.n)+'</b><small>'+esc(m.cargo||'—')+(m.tel ? ' · '+esc(m.tel) : '')+'</small></span><div class="acciones">'+
        (k>0 ? '<button type="button" class="bt sec chico" data-mn-sube="'+v.i+'" aria-label="'+esc('Subir en la lista: '+m.n)+'" title="Subir en la lista">▲</button>' : '')+
        '<button type="button" class="bt sec chico" data-mn-ed="'+v.i+'" aria-label="'+esc('Editar a '+m.n)+'">Editar</button>'+
        '<button type="button" class="bt sec chico" data-mn-q="'+v.i+'" aria-label="'+esc('Quitar a '+m.n)+'">Quitar</button></div></li>';
    }).join('')+'</ul><p class="ayuda" style="margin:8px 0 0">El orden es el que ves: pon abajo al que está más cerca del trabajador.</p>';
  else if(!ed) h+='<p class="ayuda" id="qui-mn-vacio" style="margin:0">Todavía no cargaste a nadie. Empieza por el capataz: es el que tu gente tiene al lado y el primero al que van a acudir.</p>';
  h+='<div id="qui-mn-f">'+(ed ? _quiMandoForm(L, ed) : '')+'</div><div class="msg com-msg0" id="qui-mn-msg" role="status"></div></div></div>';
  return h;
}
function _quiMandoForm(L, ed){
  var x=ed.x||{}, cs=_quiCargos(L), hay=L.some(function(m){ return m && gesTxt(m.n); }), sel=gesTxt(x.cargo) || (hay ? cs[0] : 'Capataz');
  return '<div class="qui-f" id="qui-mnf"><div class="fila-c">'+
    '<div class="campo"><label for="qui-mn-cargo">Cargo</label><select id="qui-mn-cargo">'+cs.map(function(c){ return '<option value="'+esc(c)+'"'+(c===sel ? ' selected' : '')+'>'+esc(c)+'</option>'; }).join('')+'</select></div>'+
    '<div class="campo"><label for="qui-mn-n">Nombre</label><input id="qui-mn-n" maxlength="80" placeholder="Sus primeras letras, o su nombre" value="'+esc(x.n||'')+'"></div>'+
    '<div class="campo"><label for="qui-mn-tel">Teléfono <span class="tenue" style="font-weight:400">(opcional)</span></label><input id="qui-mn-tel" type="tel" inputmode="tel" maxlength="22" autocomplete="off" placeholder="987654321" value="'+esc(x.tel||'')+'"></div></div>'+
    '<p class="ayuda" style="margin:0 0 6px">Si está en «Personal», sale con la foto de su ficha.</p>'+
    '<div class="acciones"><button type="button" class="bt sec chico" id="qui-mn-no">Cancelar</button><button type="button" class="bt chico" id="qui-mn-ok">'+(ed.x ? 'Guardar' : 'Agregar')+'</button></div></div>';
}
/* ── el comité y la brigada: no se escriben aquí ── */
function _quiFuentesHTML(M, p, toca){
  var todos=M.brigadaDeLaObra(), venc=todos.filter(function(b){ return !b.vig; }).length, esC=_comEsCuerpo(toca), nOrg=p.org.length, nBr=p.brig.length;
  var orgT=esC ? esc(toca.nombre)+' · '+(nOrg ? nOrg+' integrante'+(nOrg===1 ? '' : 's') : 'todavía sin padrón')
               : esc(toca.nombre)+' · '+(nOrg ? '<span data-sin-pais>'+esc(p.org[0].n)+'</span>'+(nOrg>1 ? ' y '+(nOrg-1)+' más' : '') : 'todavía sin nombrar');
  return '<div class="tarj" id="qui-fuentes"><div class="tarj-cab"><div><h2>El comité y la brigada</h2><p class="sub">No se escriben aquí: salen de donde ya están, para no llevarlos dos veces.</p></div></div><div class="tarj-cuerpo"><ul class="com-pl" style="margin:0">'+
    '<li class="com-pf" id="qui-f-org"><span><b>🏛 '+orgT+'</b><small>Sale del padrón de «Comité de SST»: el nombre y el puesto de cada uno, sin su documento.</small></span>'+
      (vistaOcultaPais('comite') ? '' : '<div class="acciones"><button type="button" class="bt sec chico" data-ir="comite">'+(nOrg ? 'Ir al padrón' : (esC ? 'Armar el padrón' : 'Nombrarlo'))+'</button></div>')+'</li>'+
    '<li class="com-pf" id="qui-f-brig"><span><b>🚨 Brigada de emergencia · '+(nBr ? nBr+' brigadista'+(nBr===1 ? '' : 's') : 'todavía nadie')+'</b><small>Sale de las credenciales vigentes que tienen marcado «Brigadista».'+
      (venc ? ' '+(venc===1 ? 'Hay 1 con la credencial vencida, que no sale: renuévala.' : 'Hay '+venc+' con la credencial vencida, que no salen: renuévalas.') : '')+'</small></span>'+
      '<div class="acciones"><button type="button" class="bt sec chico" data-ir="cred">Ir a Credenciales</button></div></li></ul></div></div>';
}
/* ── la pantalla del trabajador, tal como la pinta la app ── */
function _quiCelHTML(p){
  var sos=_quiSos(p), h='<h3>🆘 ¿A quién acudo?</h3>';
  if(_quiVacio(p)) return h+'<div class="qui-vacio" id="qui-cel-vacio"><b>Todavía no hay nada.</b><br>Lo que cargues aparece aquí, tal como lo va a ver tu gente.</div>';
  if(sos.length || p.punto){
    h+='<p class="qui-st">Emergencia en la obra</p>';
    if(sos.length) h+='<div class="qui-sos">'+sos.map(function(x, i){
        return '<div class="qui-sos-n'+(i===0 ? ' uno' : '')+'"><span aria-hidden="true">📞</span><span><small>'+esc(x.t)+'</small><b data-sin-pais>'+esc(x.tel)+'</b></span><i>Llamar</i></div>'; }).join('')+'</div>';
    if(p.punto) h+='<p class="qui-punto">📍 <b>Punto de reunión:</b> <span data-sin-pais>'+esc(p.punto)+'</span></p>';
  }
  if((p.brig||[]).length){
    h+='<p class="qui-st">Si pasa algo, ahora</p>';
    ['bp', 'bf', 'be'].forEach(function(k){
      var x=MAS_APP.habilDe(k), g=p.brig.filter(function(b){ return (b.roles||[]).indexOf(k)>-1; });
      if(!x || !g.length) return;
      h+='<div class="qui-gr" data-brig="'+k+'"><div class="qui-gr-t">'+x.ic+' '+esc(x.n.replace('Brigadista · ', '').replace(/^./, function(c){ return c.toUpperCase(); }))+'</div>'+g.map(function(b){
        return '<div class="qui-p">'+_quiCara(b, 'brig')+'<span data-sin-pais><b>'+esc(b.n)+'</b>'+(b.c ? '<small>'+esc(b.c)+'</small>' : '')+'</span>'+(b.tel ? '<span class="qui-tel" data-sin-pais>📞 '+esc(b.tel)+'</span>' : '')+'</div>'; }).join('')+'</div>';
    });
  }
  if((p.mando||[]).length){
    h+='<p class="qui-st">Quién manda en tu frente</p><div class="qui-gr" data-mando>'+p.mando.map(function(m){
      return '<div class="qui-p">'+_quiCara(m, 'mando')+'<span data-sin-pais><b>'+esc(m.n)+'</b><small>'+esc(m.cargo||'—')+'</small></span>'+(m.tel ? '<span class="qui-tel" data-sin-pais>📞 '+esc(m.tel)+'</span>' : '')+'</div>'; }).join('')+'</div>';
  }
  if((p.org||[]).length){
    var esSup=(p.tipo==='supervisor');
    var bloque=function(tit, l, lado){
      if(!l.length) return '';
      return '<div class="qui-gr" data-org="'+lado+'"><div class="qui-gr-t">'+tit+'</div>'+l.map(function(m){
        var etq=(m.cargo && m.cargo!=='miembro') ? (MAS_APP.QUI_CARGO[m.cargo]||'Integrante') : (m.sup ? 'Suplente' : 'Titular');
        return '<div class="qui-p">'+_quiCara(m)+'<span><b data-sin-pais>'+esc(m.n)+'</b><small>'+esc(etq)+(m.p ? ' · <span data-sin-pais>'+esc(m.p)+'</span>' : '')+'</small></span></div>'; }).join('')+'</div>';
    };
    h+='<p class="qui-st">'+(esSup ? 'Tu Supervisor de SST' : 'Quién te representa')+'</p>';
    if(esSup) h+=bloque('El elegido', p.org, 's');
    else h+=bloque('👷 Por los trabajadores', p.org.filter(function(m){ return m.lado==='t'; }), 't')+bloque('🏢 Por la empresa', p.org.filter(function(m){ return m.lado==='e'; }), 'e');
    if(p.periodo && (p.periodo.desde || p.periodo.hasta)) h+='<p class="qui-nota">Mandato: '+esc([p.periodo.desde, p.periodo.hasta].filter(Boolean).map(function(x){ return /^\d{4}-\d{2}-\d{2}$/.test(x) ? (fechaLarga(x)||x) : x; }).join(' — '))+'</p>';
  }
  return h;
}
/* cada cambio de «¿A quién acudo?»: sobre lo que el servidor tiene ahora, con el reloj de su bloque */
function _quiCambiar(mutar, idMsg, dicho){
  var W=QUIW; if(W.ocupado) return Promise.resolve(false);
  W.ocupado=true; _masDice($(idMsg), 'Guardando…');
  return comCambiar('quien', function(d){ return mutar(d, MAS_APP.usar(Object.assign({}, W.C, { com:d }))); }).then(function(d){
    W.ocupado=false; W.com=d; W.ed=null; W.firma=''; quiPintar();
    if(dicho) toast(dicho);
    return true;
  }, function(e){
    W.ocupado=false;
    if(e && e.portal){ W.ed=null; quiPintar(); toast(e.portal); masRecargar(); return false; }
    _masMal($(idMsg), 'No se pudo guardar. '+_comNo(e)); return false;
  });
}
function _quiEnchufar(sos){
  var W=QUIW, caja=W.caja, L=Array.isArray(W.com.mando) ? W.com.mando : [];
  var cada=function(sel, f){ Array.prototype.forEach.call(caja.querySelectorAll(sel), f); }, on=function(id, f){ if($(id)) $(id).onclick=f; };
  var abre=function(que, x, foco){ if(W.ocupado) return; W.ed={ que:que, x:x||null }; quiPintar(); _masFoco(foco, 30); };
  var cierra=function(){ W.ed=null; quiPintar(); };
  cada('.qui-cara img', function(im){ im.onerror=function(){ im.remove(); }; });
  cada('[data-ir]', function(b){ b.onclick=function(){ navegar(b.getAttribute('data-ir')); }; });
  on('qui-publicar', function(){ quiPublicar(false); });
  on('qui-retirar', function(){ quiPublicar(true); });
  /* los números */
  var ponEm=function(dd, a){ dd.emergs=MAS_APP.emergsLimpios(a); dd.emerg=dd.emergs.length ? dd.emergs[0].tel : ''; };
  on('qui-em-mas', function(){ abre('emerg', null, 'qui-em-t'); });
  cada('[data-em-ed]', function(b){ b.onclick=function(){ abre('emerg', sos[+b.getAttribute('data-em-ed')], 'qui-em-tel'); }; });
  cada('[data-em-sube]', function(b){ b.onclick=function(){
    var x=sos[+b.getAttribute('data-em-sube')]; if(!x) return;
    _quiCambiar(function(dd, MM){ var a=MM.emergsLocal().slice(), j=_quiPos(a, x, ['t', 'tel']); if(j<1) return { portal:QUI_CAMBIO }; var y=a[j]; a[j]=a[j-1]; a[j-1]=y; ponEm(dd, a); }, 'qui-em-msg', '');
  }; });
  cada('[data-em-q]', function(b){ b.onclick=function(){
    var x=sos[+b.getAttribute('data-em-q')]; if(!x) return;
    confirmar('¿Quitar el número de '+x.t+'?', 'Deja de salir en «¿A quién acudo?» y en los carnés nuevos. Si ya está publicado, publícalo otra vez para que desaparezca del celular de tu gente.', { si:'Sí, quitarlo', no:'Dejarlo', mal:true }).then(function(si){
      if(!si) return;
      _quiCambiar(function(dd, MM){ var a=MM.emergsLocal().slice(), j=_quiPos(a, x, ['t', 'tel']); if(j<0) return { portal:QUI_CAMBIO }; a.splice(j, 1); ponEm(dd, a); }, 'qui-em-msg', 'Número quitado.');
    });
  }; });
  if($('qui-emf')){
    $('qui-em-t').onchange=function(){ var o=(this.value==='__otro__'); $('qui-em-otro-c').hidden=!o; if(o) try{ $('qui-em-otro').focus(); }catch(e){} };
    $('qui-em-no').onclick=cierra;
    $('qui-em-ok').onclick=function(){
      var m=$('qui-em-msg'), sel=$('qui-em-t').value, t=(sel==='__otro__') ? gesTxt($('qui-em-otro').value) : sel, tel=gesTxt($('qui-em-tel').value), dig=MAS_APP.emergTel(tel).replace(/[^0-9]/g, '');
      if(t.length<2) return _masMal(m, 'Escribe de quién es ese número.', 'qui-em-otro');
      if(dig.length<3) return _masMal(m, 'Escribe el número: mínimo tres cifras (106, 116…).', 'qui-em-tel');
      if(dig.length>15 || /[^0-9+()\-\s*#]/.test(tel)) return _masMal(m, 'Ese número no parece un teléfono. Solo cifras, espacios y el «+».', 'qui-em-tel');
      var uno={ t:t.slice(0, 28), tel:tel.slice(0, 22) }, antes=W.ed && W.ed.x;
      _quiCambiar(function(dd, MM){
        var a=MM.emergsLocal().slice();
        if(antes){ var j=_quiPos(a, antes, ['t', 'tel']); if(j<0) return { portal:QUI_CAMBIO }; a[j]=uno; }
        else { if(a.length>=MAS_APP.EMERG_MAX) return { portal:'Ocho es el tope: quita el que menos se usa.' }; a.push(uno); }
        ponEm(dd, a);
      }, 'qui-em-msg', 'Guardado. Publícalo para que le llegue a tu gente.');
    };
    $('qui-emf').onkeydown=function(ev){ if(ev.key==='Enter' && ev.target.tagName==='INPUT'){ ev.preventDefault(); $('qui-em-ok').click(); } else if(ev.key==='Escape'){ ev.stopPropagation(); cierra(); } };
  }
  /* el punto de reunión */
  var pu=$('qui-punto'), pb=$('qui-punto-ok');
  if(pu && pb){
    var era=gesTxt(W.com.punto);
    pu.oninput=function(){ pb.disabled=(gesTxt(pu.value)===era); };
    pu.onkeydown=function(ev){ if(ev.key==='Enter' && !pb.disabled){ ev.preventDefault(); pb.click(); } };
    pb.onclick=function(){
      var t=gesTxt(pu.value).slice(0, 90);
      _quiCambiar(function(dd){ dd.punto=t; }, 'qui-punto-msg', t ? 'Punto de reunión guardado. Publícalo para que le llegue a tu gente.' : 'Punto de reunión quitado.');
    };
  }
  /* la línea de mando */
  var CM=['cargo', 'n', 'tel'];
  on('qui-mn-mas', function(){ abre('mando', null, 'qui-mn-n'); });
  cada('[data-mn-ed]', function(b){ b.onclick=function(){ abre('mando', L[+b.getAttribute('data-mn-ed')], 'qui-mn-n'); }; });
  cada('[data-mn-sube]', function(b){ b.onclick=function(){
    var x=L[+b.getAttribute('data-mn-sube')]; if(!x) return;
    _quiCambiar(function(dd){
      var a=Array.isArray(dd.mando) ? dd.mando.slice() : [], j=_quiPos(a, x, CM), k=j-1;
      while(k>=0 && !(a[k] && gesTxt(a[k].n))) k--;       /* el anterior que se ve */
      if(j<0 || k<0) return { portal:QUI_CAMBIO };
      var y=a[j]; a[j]=a[k]; a[k]=y; dd.mando=a;
    }, 'qui-mn-msg', '');
  }; });
  cada('[data-mn-q]', function(b){ b.onclick=function(){
    var x=L[+b.getAttribute('data-mn-q')]; if(!x) return;
    confirmar('¿Quitar a '+(x.n||'esta persona')+' de la línea de mando?', 'Deja de salir en la línea de mando. Si ya está publicado, publícalo otra vez para que desaparezca del celular de tu gente.', { si:'Sí, quitarlo', no:'Dejarlo', mal:true }).then(function(si){
      if(!si) return;
      _quiCambiar(function(dd){ var a=Array.isArray(dd.mando) ? dd.mando.slice() : [], j=_quiPos(a, x, CM); if(j<0) return { portal:QUI_CAMBIO }; a.splice(j, 1); dd.mando=a; }, 'qui-mn-msg', 'Quitado de la línea de mando.');
    });
  }; });
  if($('qui-mnf')){
    try{ sugGente($('qui-mn-n'), { lista:function(){ return masGente().then(masActivos); }, alElegir:function(t){ $('qui-mn-n').value=t.nombre; try{ $('qui-mn-tel').focus(); }catch(e){} } }); }catch(e){}
    $('qui-mn-no').onclick=cierra;
    $('qui-mn-ok').onclick=function(){
      var m=$('qui-mn-msg'), n=gesTxt($('qui-mn-n').value).slice(0, 80), tel=gesTxt($('qui-mn-tel').value).slice(0, 22);
      if(n.length<3) return _masMal(m, 'Escribe el nombre completo de la persona.', 'qui-mn-n');
      if(tel && /[^0-9+()\-\s*#]/.test(tel)) return _masMal(m, 'Ese teléfono no parece un teléfono. Solo cifras, espacios y el «+».', 'qui-mn-tel');
      var uno={ cargo:$('qui-mn-cargo').value||'', n:n, tel:tel }, antes=W.ed && W.ed.x;
      _quiCambiar(function(dd){
        var a=Array.isArray(dd.mando) ? dd.mando.slice() : [];
        if(antes){ var j=_quiPos(a, antes, CM); if(j<0) return { portal:QUI_CAMBIO }; a[j]=uno; }
        else { if(a.length>=30) return { portal:'Treinta es el tope de la línea de mando.' }; a.push(uno); }
        dd.mando=a;
      }, 'qui-mn-msg', 'Guardado. Publícalo para que le llegue a tu gente.');
    };
    $('qui-mnf').onkeydown=function(ev){
      if(ev.key==='Escape'){ ev.stopPropagation(); cierra(); }
      else if(ev.key==='Enter' && ev.target.tagName==='INPUT' && !ev.defaultPrevented && ev.target.getAttribute('aria-expanded')!=='true'){ ev.preventDefault(); $('qui-mn-ok').click(); }
    };
  }
}
/* publicar (o retirar lo publicado): se vuelve a leer todo, se dice qué va a salir y se escribe la hoja de la obra */
function quiPublicar(retirar){
  var W=QUIW; if(W.ocupado) return;
  W.ocupado=true;
  var bts=[$('qui-publicar'), $('qui-retirar')].filter(Boolean); bts.forEach(function(b){ b.disabled=true; });
  var fin=function(){ W.ocupado=false; bts.forEach(function(b){ if(b.isConnected) b.disabled=false; }); };
  _quiTraer(true).then(function(R){
    _quiPon(R); W.firma='';
    var p=_quiPaquete(), vacio=_quiVacio(p);
    if(retirar ? !vacio : vacio){ fin(); quiPintar(); toast(retirar ? 'Ahora sí hay algo cargado: publícalo.' : 'Todavía no hay nada que publicar.'); return null; }
    var partes=[], sos=_quiSos(p), gente=p.org.concat(p.brig, p.mando), conFoto=gente.filter(function(x){ return x.f; }).length, conTel=p.brig.concat(p.mando).filter(function(x){ return x.tel; }).length;
    if(sos.length) partes.push(sos.length===1 ? 'el número de emergencia de la obra' : 'los '+sos.length+' números de emergencia de la obra');
    if(p.punto) partes.push('el punto de reunión');
    if(p.org.length) partes.push(p.tipo==='supervisor' ? 'tu supervisor de SST' : p.org.length+' integrante'+(p.org.length===1 ? '' : 's')+' del '+String(p.titulo||'comité').replace(/^./, function(c){ return c.toLowerCase(); }));
    if(p.brig.length) partes.push(p.brig.length===1 ? '1 brigadista' : p.brig.length+' brigadistas');
    if(p.mando.length) partes.push(p.mando.length===1 ? 'la línea de mando (1 persona)' : 'la línea de mando ('+p.mando.length+' personas)');
    var texto=retirar ? 'Tu gente deja de ver lo que estaba publicado: en su celular, «¿A quién acudo?» vuelve a decir que la obra todavía no lo publicó.'
      : 'Cualquiera con el código de esta obra lo va a ver en «¿A quién acudo?»: '+_quiLista(partes)+'.'+
        (gente.length ? (conFoto ? ' De cada persona va su nombre, su puesto y su foto (la de su ficha), para que la reconozcan; su documento no viaja.' : ' De cada persona va su nombre y su puesto; su documento no viaja.') : '')+
        (conTel ? ' Los teléfonos de la línea de mando sí viajan: en una emergencia eso es lo que se necesita.' : '');
    return confirmar(retirar ? '¿Retirar lo publicado?' : '¿Publicarlo para toda la obra?', texto, { si:retirar ? 'Sí, retirarlo' : 'Sí, publicarlo', no:'Todavía no', mal:!!retirar }).then(function(si){
      if(!si){ fin(); quiPintar(); return null; }
      var oid=(YO.obra||{}).id, nota=JSON.stringify(p), ids=W.pubIds||[];
      var sube=ids.length ? ids.reduce(function(c, id){ return c.then(function(){ return sbPatch('sst_doc?id=eq.'+_enc(id), { nombre:p.titulo, nota:nota }).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); }); }); }, Promise.resolve())
        : sbPostP('sst_doc', { empresa:oid, hoja:'quienes', nombre:p.titulo, nota:nota }).then(function(r){ if(Array.isArray(r) && !r.length) return Promise.reject(403); if(Array.isArray(r) && r[0] && r[0].id) W.pubIds=[r[0].id]; });
      return sube.then(function(){
        fin(); W.pub=p; W.firma=''; quiPintar();
        toast(retirar ? 'Retirado: tu gente ya no lo ve.' : 'Publicado: ya está en el celular de tu gente, en «¿A quién acudo?».');
      });
    });
  }).catch(function(e){ fin(); toast('No se pudo publicar. '+((e && e.portal) ? e.portal : porQueFallo(e))); });
}

/* ══ 10 · LOS STICKERS DEL CASCO (08/10/2026) ═══════════════════════════════════════════════════════════════
   Marcelo: «eso sí agrégalo por favor a la web, para poder generarlo, y aparte, tanto en la web como en la app, tener la
   opción de escoger el diseño y así mismo editar qué información saldría en el sticker… al menos 10 tipos de diseño…
   sacar en lote todos los stickers, o uno por uno» y «que la elaboración del sticker lo pueda previsualizar como todos».
   Los doce diseños, la vista previa y el PDF son los de la app (portal/stickers.js = stickers-base.js). Lo elegido es de la
   obra (sst_estado «stickers»): lo que se elige aquí sale igual en el celular, y al revés (gana lo último, por su «ts»).
   El grupo sanguíneo se imprime solo si la credencial lo lleva y el trabajador no retiró su autorización. */
var STKW = { cfg:null, cods:null, modo:'todos', ver:0, hoja:0, verHoja:false, busca:'', el:null, R:null, C:null, aut:null, sube:null, n:0 };
function _stkwCss(){
  if($('stkw-css')) return;
  var st=document.createElement('style'); st.id='stkw-css';
  st.textContent=[
    '.stkw{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:22px;align-items:start}',
    '@media (max-width:860px){.stkw{grid-template-columns:1fr}}',
    '.stkw-vista{background:repeating-conic-gradient(#EEF2F5 0 25%,#F8FAFB 0 50%) 0 0/18px 18px;border:1px solid var(--raya);border-radius:12px;padding:22px 16px 14px;position:sticky;top:0}',
    '.stkw-vista .stk-uno{display:block;margin:0 auto;max-width:100%;height:auto;filter:drop-shadow(0 2px 6px rgba(11,42,58,.25))}',
    '.stkw-ver{display:flex;align-items:center;gap:10px;margin-top:12px}.stkw-ver .t{flex:1;min-width:0;text-align:center;font-size:13px;color:var(--gris)}',
    '.stkw-ver .t b{display:block;color:var(--tinta);font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.stkw-med{text-align:center;color:var(--gris);font-size:12.5px;margin:8px 0 0}',
    '.stkw-diss{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}',
    '@media (max-width:520px){.stkw-diss{grid-template-columns:repeat(3,minmax(0,1fr))}}',
    '.stkw-dis{margin:0;padding:8px 6px;border:1px solid var(--raya2);border-radius:10px;background:var(--panel);cursor:pointer;font:inherit;color:var(--texto);display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}',
    '.stkw-dis .m{height:54px;display:flex;align-items:center;justify-content:center;width:100%}.stkw-dis .m svg{max-height:54px;max-width:100%;width:auto;height:auto}',
    '.stkw-dis b{font-size:12px;font-weight:600;color:var(--tinta);line-height:1.2}.stkw-dis small{font-size:10.5px;color:var(--gris)}',
    '.stkw-dis.on{border-color:var(--tinta);box-shadow:0 0 0 2px var(--tinta) inset;background:#F1F6F9}',
    '.stkw-dis:focus-visible,.stkw-col:focus-visible{outline:2px solid var(--azul);outline-offset:2px}',
    '.stkw-cols{display:flex;flex-wrap:wrap;gap:7px}',
    '.stkw-col{display:flex;align-items:center;gap:7px;margin:0;padding:5px 11px 5px 5px;border:1px solid var(--raya2);border-radius:999px;background:var(--panel);cursor:pointer;font:inherit;font-size:12.5px;color:var(--texto)}',
    '.stkw-col i{width:20px;height:20px;border-radius:50%;display:block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.18)}',
    '.stkw-col.on{border-color:var(--tinta);font-weight:600;box-shadow:0 0 0 1px var(--tinta) inset}',
    '.stkw-campo{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--raya)}',
    '.stkw-campo .tx{flex:1;min-width:0}.stkw-campo .tx b{display:block;font-weight:600;color:var(--tinta);font-size:13.5px}.stkw-campo .tx small{display:block;color:var(--gris);font-size:12px;line-height:1.35}',
    '.stkw-campo .chips{justify-content:flex-end}',
    '.stkw-hoja{background:#fff;border:1px solid var(--raya);border-radius:8px;overflow:hidden;margin-top:10px;box-shadow:var(--sombra)}.stkw-hoja svg{display:block;width:100%;height:auto}',
    '.stkw-lista{max-height:260px;overflow:auto;border:1px solid var(--raya);border-radius:10px;margin-top:8px}',
    '.stkw-fila{display:flex;align-items:center;gap:10px;padding:7px 11px;border-bottom:1px solid var(--raya);cursor:pointer;font-size:13.5px}.stkw-fila input{margin:0}',
    '.stkw-fila span{flex:1;min-width:0}.stkw-fila small{color:var(--gris);font-size:12px}',
    '.stkw-falta{margin:10px 0 0;font-size:12.5px;padding:8px 11px;border-radius:9px;background:var(--ojo-f);border:1px solid #EBD3A8;color:var(--texto)}'
  ].join('\n');
  document.head.appendChild(st);
}
/* lo que hace falta para dibujar: las credenciales, la obra (empresa, logo, números de emergencia), lo elegido y las autorizaciones */
function _stkwTraer(){
  var nada=function(){ return null; };
  return Promise.all([cargarStickers(), _creTraer(), estadoLeerP('stickers').catch(nada), _autwFilas().catch(function(){ return null; }), cargarAutoriza().catch(nada)]).then(function(r){
    var R=r[1];
    return masCtx({ com:R.com, tumbas:R.tumbas }).then(function(C){
      var nube=r[2] && r[2].valor;
      if(!STKW.cfg || (nube && (+nube.ts||0)>(+STKW.cfg.ts||0))) STKW.cfg=stkCfg(nube);
      STKW.R=R; STKW.C=C; STKW.aut=(r[3] && typeof autPorTrabajador==='function') ? autPorTrabajador(r[3], 'ext') : null;
      return true;
    });
  });
}
function _stkwCtx(){
  var C=STKW.C||{}, emp=C.emp||{}, sos=[];
  try{ sos=MAS_APP.usar(C).emergsLocal().slice(0, MAS_APP.EMERG_EN_STICKER || 2); }catch(e){ sos=[]; }
  return { sos:sos, empresa:emp.razon || C.obra || '', obra:C.obra || '', titulo:C.obra || '', logo:emp.logo || '' };
}
function _stkwVigentes(){
  var hoy=hoyISO();
  return ((STKW.R && STKW.R.lista) || []).filter(function(c){ return c && c.cod && (!c.v || String(c.v).slice(0, 10)>=hoy); })
    .sort(function(a, b){ return String(a.n||'').localeCompare(String(b.n||''), 'es', { sensitivity:'base' }); });
}
function _stkwPersona(c){ var g=(STKW.R && STKW.R.gente) || []; for(var i=0;i<g.length;i++){ if(c.trab && String(g[i].ext)===String(c.trab)) return g[i]; } return null; }
function _stkwItem(c, sinQR){
  var d=null; try{ d=MAS_APP.credDatos(c.cod); }catch(e){ d=null; } if(!d) return null;
  var t=_stkwPersona(c), s=String(d.s||'').trim();
  if(s && t && STKW.aut && typeof autVale==='function' && autVale(STKW.aut[String(t.ext)])==='no') s='';
  var sel=null; try{ sel=MAS_APP.pcSelloQR(d.k); }catch(e){}
  var url='https://obrasst.app'; if(!sinQR){ try{ url=MAS_APP.usar({ base:appBase() }).enlaceCred(c.cod); }catch(e){} }
  return { n:d.n||'', c:d.c||'', s:s, v:d.v||'', sello:(sel && sel.vig) ? sel.f : '', h:d.h||[], o:d.o||'', url:url, foto:(t && t.fotoUrl) || '', cod:c.cod, conS:!!String(d.s||'').trim() };
}
function _stkwElegidas(){
  var V=_stkwVigentes();
  if(STKW.modo==='uno' && STKW.cods) return ((STKW.R && STKW.R.lista) || []).filter(function(c){ return STKW.cods.indexOf(c.cod)>-1; });
  if(STKW.modo==='elegir' && STKW.el) return V.filter(function(c){ return STKW.el[c.cod]; });
  return V;
}
function _stkwItems(sinQR){ return _stkwElegidas().map(function(c){ return _stkwItem(c, sinQR); }).filter(Boolean); }
function _stkwGuardar(){
  STKW.cfg.ts=Date.now();
  if(STKW.sube) clearTimeout(STKW.sube);
  STKW.sube=setTimeout(function(){ STKW.sube=null; estadoEscribirP('stickers', STKW.cfg).catch(function(){ toast('No se pudo guardar lo elegido en la obra: revisa tu conexión.'); }); }, 900);
}
function _stkwPoner(cambios){
  var a=STKW.cfg || stkCfg(null);
  STKW.cfg=stkCfg(Object.assign({}, a, cambios||{}, { campos:Object.assign({}, a.campos, (cambios && cambios.campos) || {}) }));
  _stkwGuardar();
}
/* abrir: con una credencial (desde su carné) o con todas */
function stkwAbrir(cods){
  _masCss(); _yaCss(); _stkwCss();
  STKW.cods=(cods && cods.length) ? cods.slice() : null; STKW.modo=STKW.cods ? 'uno' : 'todos'; STKW.ver=0; STKW.hoja=0; STKW.verHoja=false; STKW.busca=''; STKW.el=null;
  var n=++STKW.n;
  abrirHoja('Stickers del casco', 'Doce diseños, lo que va impreso y la vista previa · los mismos de la app', '<div id="stkw-cuerpo"><div class="pdfv-msg">Preparando los diseños…</div></div>',
    '<button type="button" class="bt sec" id="stkw-fab">Volver al clásico de siempre</button><button type="button" class="bt" id="stkw-bajar">Descargar el PDF</button>', { ancha:true, sinFoco:true });
  $('stkw-bajar').onclick=stkwDescargar;
  $('stkw-fab').onclick=function(){ STKW.cfg=stkCfg(null); _stkwGuardar(); _stkwPintar(); };
  _stkwTraer().then(function(){ if(n===STKW.n && $('stkw-cuerpo')) _stkwPintar(); }, function(e){ if(n===STKW.n && $('stkw-cuerpo')) $('stkw-cuerpo').innerHTML='<div class="aviso mal">No se pudo preparar: '+esc(porQueFallo(e))+'</div>'; });
}
function _stkwPintar(){
  var c=$('stkw-cuerpo'); if(!c) return;
  var cfg=STKW.cfg;
  c.innerHTML='<div class="stkw"><div><div class="stkw-vista" id="stkw-vista"></div><div id="stkw-ver"></div><p class="stkw-med" id="stkw-med"></p><div id="stkw-falta"></div><div id="stkw-hoja"></div></div>'+
    '<div><div class="seccion" style="margin-top:0"><h3>Diseño</h3><div class="stkw-diss" id="stkw-diss" role="radiogroup" aria-label="Diseño del sticker"></div><p class="ayuda" id="stkw-dis-d" style="margin:8px 0 0"></p></div>'+
    '<div class="seccion"><h3>Color</h3><div class="stkw-cols" id="stkw-cols" role="radiogroup" aria-label="Color"></div></div>'+
    '<div class="seccion"><h3>Qué va impreso</h3><div id="stkw-campos"></div>'+
      '<div class="fila-c ya-al" style="margin-top:12px"><div class="campo"><label for="stkw-ley">El aviso</label><input id="stkw-ley" maxlength="40" value="'+esc(cfg.leyenda)+'" placeholder="'+esc(STK_LEYENDA)+'"></div>'+
      '<div class="campo"><label for="stkw-txt">Un texto propio <span class="tenue">· opcional</span></label><input id="stkw-txt" maxlength="48" value="'+esc(cfg.texto)+'" placeholder="Por ejemplo: No retirar este sticker"></div></div>'+
      '<p class="ayuda" style="margin:0">Nunca va impreso su documento ni su contacto personal de emergencia: esos se ven solo al escanear el QR.</p></div>'+
    '<div class="seccion"><h3>Para quién</h3><div id="stkw-quien"></div><div id="stkw-aut"></div></div>'+
    '<p class="ayuda" style="margin:14px 0 0">Lo que elijas queda para la obra: en la app y en el celular de tu equipo sale igual.</p><div class="msg" id="stkw-msg" role="status"></div></div></div>';
  var tl=null;
  $('stkw-ley').oninput=function(){ var v=this.value; clearTimeout(tl); tl=setTimeout(function(){ _stkwPoner({ leyenda:v }); _stkwCambio(true); }, 300); };
  $('stkw-txt').oninput=function(){ var v=String(this.value||'').trim(); clearTimeout(tl); tl=setTimeout(function(){ _stkwPoner({ texto:v, campos:{ texto:v ? 1 : 0 } }); _stkwCambio(true); }, 300); };
  _stkwCambio();
}
function _stkwCambio(sinCampos){ _stkwVista(); _stkwDisenos(); _stkwColores(); if(!sinCampos) _stkwCampos(); _stkwQuien(); _stkwAut(); _stkwHoja(); _stkwBoton(); }
function _stkwVista(){
  var caja=$('stkw-vista'); if(!caja) return;
  var L=_stkwItems(), cfg=STKW.cfg, ctx=_stkwCtx();
  if(!L.length){ caja.innerHTML='<p class="ayuda" style="text-align:center;margin:30px 0">Marca a quién le sacas el sticker.</p>'; $('stkw-ver').innerHTML=''; $('stkw-med').textContent=''; $('stkw-falta').innerHTML=''; return; }
  STKW.ver=Math.max(0, Math.min(STKW.ver, L.length-1));
  var it=L[STKW.ver], v=stkVistaUno(it, cfg, ctx, 'Vista previa del sticker de '+it.n), D=stkDiseno(cfg.dis), k=Math.min(5.2, 360/Math.max(D.w, D.h*1.1));
  caja.innerHTML=v.svg.replace('<svg ', '<svg style="width:'+Math.round(D.w*k)+'px" ');
  $('stkw-ver').innerHTML=L.length>1 ? '<div class="stkw-ver"><button type="button" class="bt sec chico" id="stkw-ant" aria-label="El anterior"'+(STKW.ver>0 ? '' : ' disabled')+'>‹</button>'+
    '<span class="t"><b data-sin-pais>'+esc(it.n)+'</b>'+(STKW.ver+1)+' de '+L.length+'</span><button type="button" class="bt sec chico" id="stkw-sig" aria-label="El siguiente"'+(STKW.ver<L.length-1 ? '' : ' disabled')+'>›</button></div>' : '';
  if($('stkw-ant')) $('stkw-ant').onclick=function(){ STKW.ver--; _stkwVista(); };
  if($('stkw-sig')) $('stkw-sig').onclick=function(){ STKW.ver++; _stkwVista(); };
  $('stkw-med').textContent=stkResumen(cfg, ctx);
  var F=stkFaltan(L, cfg, ctx);
  $('stkw-falta').innerHTML=F.length ? '<div class="stkw-falta">En este diseño no entra: <b>'+esc(F.map(function(x){ var K=stkCampo(x); return K ? K.n : x; }).join(', '))+'</b>. Prueba uno más grande.</div>' : '';
}
function _stkwDisenos(){
  var c=$('stkw-diss'); if(!c) return;
  var cfg=STKW.cfg, L=_stkwItems(true), it=L[Math.min(STKW.ver, L.length-1)] || { n:'Apellido Apellido, Nombre', c:'Cargo', s:'O+', url:'https://obrasst.app' }, ctx=_stkwCtx();
  c.innerHTML=STK_DISENOS.map(function(D){
    var on=cfg.dis===D.k, v=stkVistaUno(it, Object.assign({}, cfg, { dis:D.k }), ctx, D.n);
    return '<button type="button" role="radio" class="stkw-dis'+(on ? ' on' : '')+'" data-dis="'+D.k+'" aria-checked="'+(on ? 'true' : 'false')+'"><span class="m" aria-hidden="true">'+v.svg+'</span><b>'+esc(D.n)+'</b>'+
      '<small>'+(D.f==='circ' ? D.w+' mm' : String(D.w).replace('.', ',')+' × '+String(D.h).replace('.', ',')+' mm')+'</small></button>';
  }).join('');
  Array.prototype.forEach.call(c.querySelectorAll('[data-dis]'), function(b){ b.onclick=function(){ _stkwPoner({ dis:b.getAttribute('data-dis') }); STKW.hoja=0; _stkwCambio(); }; });
  $('stkw-dis-d').textContent=stkDiseno(cfg.dis).d;
}
function _stkwColores(){
  var c=$('stkw-cols'); if(!c) return;
  c.innerHTML=STK_COLORES.map(function(K){
    var on=STKW.cfg.color===K.k, b=K.claro ? 'linear-gradient(135deg,#fff 50%,#0B2A3A 50%)' : 'rgb('+K.band.join(',')+')';
    return '<button type="button" role="radio" class="stkw-col'+(on ? ' on' : '')+'" data-col="'+K.k+'" aria-checked="'+(on ? 'true' : 'false')+'"><i style="background:'+b+'"></i>'+esc(K.n)+'</button>';
  }).join('');
  Array.prototype.forEach.call(c.querySelectorAll('[data-col]'), function(b){ b.onclick=function(){ _stkwPoner({ color:b.getAttribute('data-col') }); _stkwCambio(); }; });
}
function _stkwCampos(){
  var c=$('stkw-campos'); if(!c) return;
  var C=STKW.cfg.campos, ctx=_stkwCtx(), h='';
  STK_CAMPOS.forEach(function(K){
    if(K.k==='texto') return;
    var ops=K.op ? K.op.slice() : [[1, 'Sí']]; ops.push([0, K.k==='marca' ? 'Nada' : 'No']);
    var nota=K.d || '';
    if(K.k==='sos' && !ctx.sos.length) nota='Tu obra todavía no tiene sus números de emergencia: se cargan en «¿A quién acudo?».';
    if(K.k==='marca' && C.marca==='logo' && !ctx.logo) nota='Tu empresa todavía no tiene logo: sale su nombre. Se carga en «Datos y logo».';
    h+='<div class="stkw-campo" data-campo="'+K.k+'"><span class="tx"><b>'+esc(K.n)+'</b>'+(nota ? '<small>'+esc(nota)+'</small>' : '')+'</span><span class="chips">'+
      ops.map(function(p){ var on=String(C[K.k])===String(p[0]); return '<button type="button" class="chip'+(on ? ' on' : '')+'" aria-pressed="'+(on ? 'true' : 'false')+'" data-k="'+K.k+'" data-v="'+p[0]+'">'+esc(p[1])+'</button>'; }).join('')+'</span></div>';
  });
  c.innerHTML=h;
  Array.prototype.forEach.call(c.querySelectorAll('[data-k]'), function(b){ b.onclick=function(){
    var k=b.getAttribute('data-k'), v=b.getAttribute('data-v'), K=stkCampo(k), o={};
    o[k]=(v==='0') ? 0 : (K.op ? (typeof K.op[0][0]==='number' ? +v : v) : 1);
    _stkwPoner({ campos:o }); _stkwCambio();
  }; });
}
function _stkwQuien(){
  var c=$('stkw-quien'); if(!c) return;
  var V=_stkwVigentes(), h='<div class="chips" role="radiogroup" aria-label="Para quién">';
  if(STKW.cods){ var d1=null; try{ d1=MAS_APP.credDatos(STKW.cods[0]); }catch(e){} h+='<button type="button" class="chip'+(STKW.modo==='uno' ? ' on' : '')+'" data-m="uno">Solo '+esc(STKW.cods.length===1 ? stkNombreCorto((d1 && d1.n) || '') || 'este trabajador' : STKW.cods.length+' trabajadores')+'</button>'; }
  h+='<button type="button" class="chip'+(STKW.modo==='todos' ? ' on' : '')+'" data-m="todos">Todo el personal ('+V.length+')</button><button type="button" class="chip'+(STKW.modo==='elegir' ? ' on' : '')+'" data-m="elegir">Elegir</button></div>';
  if(STKW.modo==='elegir'){
    var el=STKW.el||{}, q=nrm(STKW.busca), n=0; V.forEach(function(x){ if(el[x.cod]) n++; });
    h+='<div class="fila-c ya-al" style="margin-top:10px"><div class="campo" style="margin:0"><input id="stkw-q" type="search" placeholder="Buscar por nombre" value="'+esc(STKW.busca)+'" aria-label="Buscar"></div>'+
      '<div class="acciones" style="margin:0;justify-content:flex-start"><button type="button" class="bt sec chico" id="stkw-todos">Marcar todos</button><button type="button" class="bt sec chico" id="stkw-ninguno">Ninguno</button><span class="tenue" style="align-self:center;font-size:12.5px">'+n+' marcados</span></div></div>'+
      '<div class="stkw-lista">'+V.filter(function(x){ return !q || nrm(x.n||'').indexOf(q)>-1; }).map(function(x){
        var d=null; try{ d=MAS_APP.credDatos(x.cod); }catch(e){}
        return '<label class="stkw-fila"><input type="checkbox" data-cod="'+esc(x.cod)+'"'+(el[x.cod] ? ' checked' : '')+'><span><b data-sin-pais>'+esc((d && d.n) || x.n || '')+'</b> <small data-sin-pais>'+esc(((d && d.c) || '')+((d && d.s) ? ' · '+d.s : ''))+'</small></span></label>';
      }).join('')+'</div>';
  }
  c.innerHTML=h;
  Array.prototype.forEach.call(c.querySelectorAll('[data-m]'), function(b){ b.onclick=function(){
    STKW.modo=b.getAttribute('data-m'); STKW.ver=0; STKW.hoja=0;
    if(STKW.modo==='elegir' && !STKW.el){ STKW.el={}; (STKW.cods||[]).forEach(function(k){ STKW.el[k]=1; }); }
    _stkwCambio(true);
  }; });
  Array.prototype.forEach.call(c.querySelectorAll('[data-cod]'), function(b){ b.onchange=function(){ if(!STKW.el) STKW.el={}; var k=b.getAttribute('data-cod'); if(b.checked) STKW.el[k]=1; else delete STKW.el[k]; STKW.ver=0; _stkwVista(); _stkwAut(); _stkwHoja(); _stkwBoton(); }; });
  if($('stkw-q')) $('stkw-q').oninput=function(){ STKW.busca=this.value; var p=this.selectionStart; _stkwQuien(); var q2=$('stkw-q'); if(q2){ q2.focus(); try{ q2.setSelectionRange(p, p); }catch(e){} } };
  if($('stkw-todos')) $('stkw-todos').onclick=function(){ STKW.el={}; V.forEach(function(x){ STKW.el[x.cod]=1; }); _stkwCambio(true); };
  if($('stkw-ninguno')) $('stkw-ninguno').onclick=function(){ STKW.el={}; _stkwCambio(true); };
}
function _stkwAut(){
  var c=$('stkw-aut'); if(!c) return;
  var L=_stkwItems(true), sin=L.filter(function(x){ return !x.s; }).length, ret=L.filter(function(x){ return x.conS && !x.s; }).length;
  c.innerHTML=(STKW.cfg.campos.sangre && sin) ? '<div class="aviso" style="margin:12px 0 0">🩸 '+(L.length===1 ? 'Su sticker sale con «sin dato» en el grupo sanguíneo' : sin+' de '+L.length+' salen con «sin dato» en el grupo sanguíneo')+
    (ret ? ' ('+(ret===1 ? 'uno retiró su autorización' : ret+' retiraron su autorización')+')' : '')+'. El grupo sanguíneo es un dato de salud: va impreso solo con su autorización por escrito.'+
    (_autwPe() ? ' <button type="button" class="lnk" id="stkw-ir-aut">Ver las autorizaciones</button>' : '')+'</div>' : '';
  if($('stkw-ir-aut')) $('stkw-ir-aut').onclick=function(){ cerrarHoja(); navegar('autor'); };
}
function _stkwHoja(){
  var c=$('stkw-hoja'); if(!c) return;
  var L=_stkwItems(), cfg=STKW.cfg, ctx=_stkwCtx();
  if(!L.length){ c.innerHTML=''; return; }
  var por=stkPorHoja(cfg, ctx), n=Math.ceil(L.length/por);
  if(!STKW.verHoja){ c.innerHTML='<div class="acciones" style="justify-content:center;margin:14px 0 0"><button type="button" class="bt sec" id="stkw-verh">Ver la hoja A4 ('+n+' '+(n===1 ? 'hoja' : 'hojas')+', '+por+' por hoja)</button></div>'; $('stkw-verh').onclick=function(){ STKW.verHoja=true; _stkwHoja(); }; return; }
  STKW.hoja=Math.max(0, Math.min(STKW.hoja, n-1));
  var H=stkHojas(L, cfg, ctx)[STKW.hoja];
  c.innerHTML='<div class="stkw-hoja">'+stkVistaHoja(H, 'Hoja '+(STKW.hoja+1)+' de '+n)+'</div>'+
    '<div class="acciones" style="justify-content:center;margin:10px 0 0">'+(n>1 ? '<button type="button" class="bt sec chico" id="stkw-hant"'+(STKW.hoja>0 ? '' : ' disabled')+'>‹ Hoja anterior</button><span class="tenue" style="align-self:center">Hoja '+(STKW.hoja+1)+' de '+n+'</span><button type="button" class="bt sec chico" id="stkw-hsig"'+(STKW.hoja<n-1 ? '' : ' disabled')+'>Hoja siguiente ›</button>' : '')+
    '<button type="button" class="bt sec chico" id="stkw-hno">Ocultar la hoja</button></div>';
  if($('stkw-hant')) $('stkw-hant').onclick=function(){ STKW.hoja--; _stkwHoja(); };
  if($('stkw-hsig')) $('stkw-hsig').onclick=function(){ STKW.hoja++; _stkwHoja(); };
  $('stkw-hno').onclick=function(){ STKW.verHoja=false; _stkwHoja(); };
}
function _stkwBoton(){
  var b=$('stkw-bajar'); if(!b) return;
  var L=_stkwElegidas(), por=stkPorHoja(STKW.cfg, _stkwCtx()), n=Math.ceil(L.length/por);
  b.disabled=!L.length;
  b.textContent=!L.length ? 'Descargar el PDF' : 'Descargar el PDF · '+(L.length===1 ? '1 sticker' : L.length+' stickers')+(n>1 ? ', '+n+' hojas' : '');
}
function stkwDescargar(){
  var bt=$('stkw-bajar'), m=$('stkw-msg'), L=_stkwItems(), cfg=STKW.cfg, ctx=_stkwCtx();
  if(!L.length) return;
  var seguir=function(){
    bt.disabled=true; _masDice(m, 'Armando el PDF…');
    stkArmarPDF(L, cfg, ctx).then(function(r){
      bt.disabled=false; _masDice(m, '', '');
      bajarBlob(r.doc.output('blob'), nombreArchivo(r.nombre.replace(/\.pdf$/i, ''))+'.pdf'); toast('Stickers descargados: '+r.nombre);
    }, function(e){ bt.disabled=false; _masMal(m, 'No se pudo armar el PDF: '+((e && e.message) || e)); });
  };
  if(cfg.campos.sos && !ctx.sos.length){
    confirmar('Tu obra todavía no tiene su número de emergencia', 'El sticker lleva impreso a quién llamar si pasa algo en la obra: la ambulancia, el supervisor SST, producción o el brigadista. Se cargan en «¿A quién acudo?».',
      { si:'Sacarlo sin el número', no:'Cancelar' }).then(function(si){ if(si) seguir(); });
    return;
  }
  seguir();
}

/* ══ 11 · LA AUTORIZACIÓN DEL GRUPO SANGUÍNEO (08/10/2026) ═══════════════════════════════════════════════════
   Marcelo: «hay que agregar en app y web el formato de autorización para poder tener su tipo de sangre, y tener la opción de
   imprimirlo o que el trabajador lo autorice desde la app». El texto, su huella y los PDF son los de la app
   (portal/autoriza.js = autorizacion-base.js). Desde la web: la lista con el estado de cada uno; pedirla en su app; firmarla
   en esta pantalla; registrar el papel (con la foto o el escaneo); los formatos y las constancias; y poner al día las
   credenciales que ya no coinciden (al que revocó, sacarle el grupo del QR). Todo por las funciones de
   sql/2026-10-28-autorizacion-sangre.sql: la tabla no se escribe directo. */
var AUTW = { filas:null, por:null, gente:null, C:null, R:null, sin:false, caja:null, n:0, firma:'', t:null };
function _autwFilas(){
  return traerTodo('sst_autorizacion', '&select=id,trabajador,ext,nombre,doc,estado,canal,sangre,version,texto_hash,cuando,quien_nombre,foto_url,creado&order=cuando.desc', 6000);
}
function _autwEmp(){ var C=AUTW.C||{}, e=C.emp||{}; return { razon:e.razon||'', ruc:e.ruc||'', dom:e.dom||'', obra:C.obra||'', logo:e.logo||'' }; }
function _autwCtxPDF(){
  var C=AUTW.C||{}, E=_autwEmp(), f=(C.fmt && C.fmt['aut-sangre']) || {};
  return { emp:E, obra:E.obra, fmt:{ cod:f.cod||'', rev:f.rev||'', fecha:f.fecha||'' } };
}
function _autwTraer(){
  var nada=function(){ return null; };
  return Promise.all([cargarAutoriza(), masGente(true), _autwFilas().then(function(l){ AUTW.sin=false; return l; }, function(c){ if(c===404) AUTW.sin=true; return []; }), _creTraer().catch(nada)]).then(function(r){
    var R=r[3];
    return masCtx(R ? { com:R.com, tumbas:R.tumbas } : {}).then(function(C){
      AUTW.gente=masActivos(r[1]||[]); AUTW.filas=r[2]||[]; AUTW.por=autPorTrabajador(AUTW.filas, 'trabajador'); AUTW.C=C; AUTW.R=R;
      return true;
    });
  });
}
function _autwDe(t){ return (t && AUTW.por) ? (AUTW.por[String(t.id)] || null) : null; }
/* las credenciales cuyo QR no dice lo que dice su autorización */
function _autwDesfasadas(){
  var out=[], hoy=hoyISO();
  if(!AUTW.R || !AUTW.R.lista) return out;
  AUTW.gente.forEach(function(t){
    var e=_autwDe(t); if(!e || !e.ultima) return;
    var esperado=e.ultima.estado==='firmada' ? autGrupo(e.ultima.sangre) : '';
    AUTW.R.lista.forEach(function(c){
      if(!c || !c.cod || String(c.trab||'')!==String(t.ext) || (c.v && String(c.v).slice(0, 10)<hoy)) return;
      var d=null; try{ d=MAS_APP.credDatos(c.cod); }catch(x){}
      if(d && autGrupo(d.s)!==esperado) out.push({ t:t, c:c, quita:!esperado, s:esperado });
    });
  });
  return out;
}
/* el texto de la autorización está escrito sobre la ley peruana (Ley 29733 y su reglamento): en una obra de otro
   país no se ofrece, como en la app (paises.js lo esconde allá), hasta que tenga su versión */
function _autwPe(){ try{ return (typeof paisObraP!=='function') || paisObraP()==='pe'; }catch(e){ return true; } }
function masVistaAutor(caja){
  _masCss(); _yaCss();
  AUTW.caja=caja;
  var ac=$('acciones');
  if(!_autwPe()){
    if(ac) ac.innerHTML='';
    VISTA.recargar=null;
    caja.innerHTML='<div class="aviso">🩸 La autorización del grupo sanguíneo está escrita sobre la ley peruana de protección de datos personales (Ley N.° 29733 y su reglamento). '+
      'Para las obras de otros países todavía no tiene su versión: el grupo sanguíneo se registra en la ficha del trabajador, en la app, solo con su autorización por escrito.</div>';
    return;
  }
  if(ac){ ac.innerHTML='<button type="button" class="bt sec" id="autw-blanco">📄 Formato en blanco</button><button type="button" class="bt sec" id="autw-pr">📘 Procedimiento (Word)</button>';
    $('autw-blanco').onclick=function(){ _autwPdf([], 'formato', 'Autorizacion grupo sanguineo - formato'); };
    $('autw-pr').onclick=function(){ var a=document.createElement('a'); a.href='PR-15-tratamiento-del-grupo-sanguineo.docx'; a.download='OBRASST-PR-15-tratamiento-del-grupo-sanguineo.docx'; document.body.appendChild(a); a.click(); a.remove(); }; }
  cargando(caja);
  function pinta(silencio){
    var n=++AUTW.n;
    _autwTraer().then(function(){ if(n!==AUTW.n || VISTA.actual!=='autor') return; _autwPintar(); }, function(e){ if(n!==AUTW.n || VISTA.actual!=='autor') return; if(!silencio) fallo(caja, e); });
  }
  VISTA.recargar=pinta; pinta();
}
function _autwPintar(){
  var caja=AUTW.caja; if(!caja || !document.body.contains(caja)) return;
  var E=_autwEmp(), falta=autFaltaEmpresa(E), G=AUTW.gente||[], K={ firmada:0, pedida:0, no:0 };
  G.forEach(function(t){ var k=autEstadoTexto(_autwDe(t)).k; if(k==='firmada') K.firmada++; else if(k==='pedida') K.pedida++; else K.no++; });
  var D=_autwDesfasadas(), faltan=G.filter(function(t){ var k=autEstadoTexto(_autwDe(t)).k; return k==='falta' || k==='negada' || k==='revocada'; });
  var h='<div class="aviso" id="autw-que"><b>El grupo sanguíneo es un dato de salud:</b> se registra solo con la autorización por escrito de cada trabajador, y él la puede revocar cuando quiera. '+
    'Puede firmarla en su celular (se le pide desde aquí), en esta pantalla o en papel. Va en su ficha, en su credencial y en el sticker del casco.</div>';
  if(AUTW.sin) h+='<div class="aviso ojo" id="autw-sin">Esto todavía no está activo en el servidor de tu obra: falta correr su SQL (sql/2026-10-28-autorizacion-sangre.sql).</div>';
  if(falta.length) h+='<div class="aviso ojo" id="autw-falta"><b>Antes de pedirla, completa '+esc(falta.join(' y '))+' de tu empresa</b> en «Datos y logo»: el trabajador tiene que saber quién guarda su dato y dónde reclamar. <button type="button" class="lnk" id="autw-ir-emp">Ir a Datos y logo</button></div>';
  h+='<div class="rej">'+cifra('Autorizaron', K.firmada, G.length ? 'de '+G.length+' activos' : 'sin personal', K.firmada ? 'ok' : '')+cifra('Pendientes', K.pedida, K.pedida ? 'les sale en su app' : 'ninguna', K.pedida ? 'ojo' : '')+
    cifra('Sin autorización', K.no, K.no ? 'no se imprime su grupo' : 'ninguno', K.no ? 'ojo' : 'ok')+cifra('Credenciales por poner al día', D.length, D.length ? 'su QR no coincide' : 'todas coinciden', D.length ? 'mal' : 'ok')+'</div>';
  if(D.length){
    var q=D.filter(function(x){ return x.quita; }).length;
    h+='<div class="aviso'+(q ? ' mal' : ' ojo')+'" id="autw-desf"><b>'+(D.length===1 ? '1 credencial no coincide' : D.length+' credenciales no coinciden')+' con su autorización.</b> '+
      (q ? (q===1 ? 'Uno revocó o no autorizó y su QR todavía lleva su grupo sanguíneo. ' : q+' revocaron o no autorizaron y su QR todavía lleva su grupo sanguíneo. ') : '')+
      'Al ponerlas al día su QR cambia: hay que cambiarles el carné y el sticker. <button type="button" class="bt chico" id="autw-aldia">Ponerlas al día</button></div>';
  }
  h+='<div class="acciones" style="justify-content:flex-start;margin:0 0 12px"><button type="button" class="bt sec" id="autw-pedir"'+(faltan.length && !falta.length && !AUTW.sin ? '' : ' disabled')+'>📲 Pedir a los que faltan que la firmen en su app'+(faltan.length ? ' ('+faltan.length+')' : '')+'</button>'+
    '<button type="button" class="bt sec" id="autw-faltan"'+(faltan.length ? '' : ' disabled')+'>📄 Formatos de los que faltan'+(faltan.length ? ' ('+faltan.length+')' : '')+'</button></div>';
  h+='<div class="tarj" id="t-autw"></div>';
  var est=$('t-autw') ? $('t-autw')._est : null;
  caja.innerHTML=h; if(est) $('t-autw')._est=est;
  if($('autw-ir-emp')) $('autw-ir-emp').onclick=function(){ navegar('empresa'); };
  if($('autw-aldia')) $('autw-aldia').onclick=function(){ _autwAlDia(D); };
  $('autw-pedir').onclick=function(){ _autwPedir(faltan); };
  $('autw-faltan').onclick=function(){ _autwPdf(faltan.map(_autwPersona), 'formato', 'Autorizaciones grupo sanguineo - '+faltan.length+' formatos'); };
  var filas=G.map(function(t){ var e=_autwDe(t), s=autEstadoTexto(e), u=e && e.ultima; return { t:t, n:t.nombre, d:t.dni, c:t.puesto, s:s, g:s.g ? autGrupoTxt(s.g) : '', canal:u ? (AUT_CANAL[u.canal]||'') : '', f:u ? String(u.cuando||'') : (e && e.pedida ? String(e.pedida.cuando||'') : '') }; });
  tabla($('t-autw'), [
    { k:'n', t:'Trabajador', h:function(x){ return '<b>'+esc(x.n)+'</b><span class="sub" data-sin-pais>'+esc([x.d, x.c].filter(Boolean).join(' · '))+'</span>'; }, v:function(x){ return x.n+' '+x.d+' '+x.c; }, csv:function(x){ return x.n; } },
    { k:'d', t:'Documento', soloCsv:true }, { k:'c', t:'Cargo', soloCsv:true },
    { k:'e', t:'Autorización', h:function(x){ return '<span class="pill '+(x.s.cl==='ok' ? 'ok' : (x.s.cl==='mal' ? 'mal' : (x.s.cl==='ojo' ? 'ojo' : 'gris')))+'">'+esc(x.s.t)+'</span>'; }, v:function(x){ return x.s.t; }, csv:function(x){ return x.s.t; } },
    { k:'g', t:'Grupo', h:function(x){ return x.g ? '<b data-sin-pais>'+esc(x.g)+'</b>' : '<span class="tenue">—</span>'; }, v:function(x){ return x.g; } },
    { k:'f', t:'Fecha', h:function(x){ return x.f ? esc(fechaLarga(x.f)) : '<span class="tenue">—</span>'; }, v:function(x){ return x.f; }, csv:function(x){ return x.f ? fechaLarga(x.f) : ''; } },
    { k:'_acc', t:'', acc:true, h:function(){ return '<button type="button" class="bt sec chico" data-acc="ver">Abrir</button>'; } }
  ], filas, { orden:'n', asc:true, unidad:'trabajadores', archivo:'autorizaciones-grupo-sanguineo', vacio:'Todavía no hay personal', vacioSub:'Carga a tu gente en «Personal».',
    alClic:function(x){ autwVer(x.t); }, accion:function(acc, x){ autwVer(x.t); } });
}
function _autwPersona(t){ return { nombre:t.nombre, doc:t.dni||'', td:t.td||docPersonaP(), cargo:t.puesto||'' }; }
function _autwPdf(lista, modo, nombre){
  cargarAutoriza().then(function(){ return cargarEvPDF(); }).then(function(){
    var doc=autPDF(lista, _autwCtxPDF(), { modo:modo });
    bajarBlob(doc.output('blob'), nombreArchivo(nombre)+'.pdf'); toast('Descargado: '+nombre);
  }).catch(function(e){ toast('No se pudo armar el PDF. '+porQueFallo(e)); });
}
function _autwPedir(L){
  if(!L.length) return;
  confirmar('¿Pedírsela a '+(L.length===1 ? '1 trabajador' : L.length+' trabajadores')+'?', 'A cada uno le sale en su app para leerla y decidir: es voluntario. Al que todavía no tiene su cuenta, le sale cuando entre.', { si:'Sí, pedírsela' }).then(function(si){
    if(!si) return;
    sbRpc('sst_aut_pedir', { p:{ trabs:L.map(function(t){ return t.id; }), version:AUT_VERSION, quien_nombre:gesQuien() } }).then(function(j){
      if(!j || j.ok===false){ toast('No se pudo pedir: '+((j && j.motivo) || '')); return; }
      toast((j.pedidas===1 ? 'Se le pidió a 1 trabajador.' : 'Se les pidió a '+j.pedidas+' trabajadores.')+(j.sin_cuenta ? ' '+j.sin_cuenta+' todavía sin cuenta: le sale al entrar.' : '')+(j.ya ? ' A '+j.ya+' ya se le había pedido.' : ''));
      masRecargar();
    }, function(e){ toast('No se pudo pedir. '+porQueFallo(e)); });
  });
}
/* poner al día sus credenciales: se vuelven a emitir con el grupo que dice su autorización (o sin él), y la de antes queda anulada */
function _autwAlDia(D){
  if(!D.length) return;
  confirmar('¿Poner al día '+(D.length===1 ? 'su credencial' : 'estas '+D.length+' credenciales')+'?', 'Se vuelven a emitir con el grupo sanguíneo que dice su autorización (al que revocó o no autorizó, sin grupo). Su QR cambia: el carné y el sticker que tengan impresos dejan de valer y hay que cambiarlos.', { si:'Sí, ponerlas al día' }).then(function(si){
    if(!si) return;
    _creTraer().then(function(R){
      return masCtx({ com:R.com, tumbas:R.tumbas }).then(function(C){
        var M=MAS_APP.usar(C), tumbas=Object.assign({}, R.tumbas), lista=R.lista.slice(), n=0;
        D.forEach(function(x){
          var i=-1; lista.forEach(function(c, k){ if(c.cod===x.c.cod) i=k; }); if(i<0) return;
          var v=M.credDatos(x.c.cod); if(!v) return;
          var d=JSON.parse(JSON.stringify(v)); if(x.s) d.s=x.s; else delete d.s;
          var nuevo=M.credCodUnico(d); if(nuevo===x.c.cod) return;
          tumbas[String(x.c.cod)]=Date.now(); lista[i]=Object.assign({}, lista[i], { cod:nuevo }); n++;
        });
        if(!n) return 0;
        return estadoEscribirP('credenciales_anuladas', MAS_APP.tumbasVivas(tumbas)).then(function(){ return estadoEscribirP('credenciales', lista); }).then(function(){ CREW.firma=''; return n; });
      });
    }).then(function(n){ toast(n ? (n===1 ? 'Listo: 1 credencial al día. Cámbiale el carné y el sticker.' : 'Listo: '+n+' credenciales al día. Cámbiales el carné y el sticker.') : 'Ya estaban al día.'); masRecargar(); },
      function(e){ toast('No se pudo. '+porQueFallo(e)); });
  });
}
/* un trabajador: su estado, su historia y lo que se puede hacer */
function autwVer(t, aviso){
  _masCss(); _yaCss(); AUTW.t=t;
  var e=_autwDe(t), s=autEstadoTexto(e), u=e && e.ultima, E=_autwEmp(), falta=autFaltaEmpresa(E), bloq=(falta.length || AUTW.sin) ? ' disabled' : '';
  var h=(aviso ? '<div class="aviso ok" id="autw-ok">'+esc(aviso)+'</div>' : '')+
    '<div class="seccion" style="margin-top:0"><h3>Su autorización</h3><p style="margin:0"><span class="pill '+(s.cl==='ok' ? 'ok' : (s.cl==='mal' ? 'mal' : (s.cl==='ojo' ? 'ojo' : 'gris')))+'">'+esc(s.t)+'</span>'+(s.g ? ' <b data-sin-pais>'+esc(autGrupoTxt(s.g))+'</b>' : '')+'</p>'+
    (u ? '<p class="ayuda" style="margin:6px 0 0">'+esc(AUT_ESTADO[u.estado]||'')+' el '+esc(fechaLarga(u.cuando))+(u.quien_nombre && u.canal!=='app' ? ' · lo registró '+esc(u.quien_nombre) : '')+'.</p>' : '')+
    (e && e.pedida ? '<p class="ayuda" style="margin:6px 0 0">Se le pidió el '+esc(fechaLarga(e.pedida.cuando))+': le sale cuando abre su app.</p>' : '')+
    (!u && t.sangre ? '<p class="ayuda" style="margin:6px 0 0">Su ficha tiene '+esc(t.sangre)+', cargado antes de este registro. Puedes dejar su constancia con cualquiera de las opciones de abajo.</p>' : '')+'</div>'+
    (falta.length ? '<div class="aviso ojo" style="margin:12px 0 0">Completa '+esc(falta.join(' y '))+' de tu empresa en «Datos y logo»: van en el texto que firma.</div>' : '')+
    '<div class="seccion"><h3>Que la firme</h3><div class="acciones" style="justify-content:flex-start;flex-wrap:wrap">'+
      '<button type="button" class="bt" id="autw-aqui"'+bloq+'>✍️ Aquí, en esta pantalla</button><button type="button" class="bt sec" id="autw-app"'+bloq+'>📲 En su app (se le pide)</button>'+
      '<button type="button" class="bt sec" id="autw-papel"'+(AUTW.sin ? ' disabled' : '')+'>📝 Ya la firmó en papel</button><button type="button" class="bt sec" id="autw-form">📄 Su formato para imprimir</button></div><div id="autw-zona"></div></div>';
  if(u) h+='<div class="seccion"><h3>Lo registrado</h3><div class="acciones" style="justify-content:flex-start;flex-wrap:wrap"><button type="button" class="bt sec" id="autw-cons">📄 Su constancia (PDF)</button>'+
    (u.foto_url ? (String(u.foto_url).indexOf('salud:')===0 ? '<button type="button" class="bt sec" id="autw-foto">📷 El papel firmado</button>'
                                                          : '<a class="bt sec" href="'+esc(u.foto_url)+'" target="_blank" rel="noopener">📷 El papel firmado</a>') : '')+
    (u.estado==='firmada' ? '<button type="button" class="bt mal" id="autw-rev">Registrar que la revocó</button>' : '')+'</div></div>';
  if(e && e.hist && e.hist.length>1) h+='<div class="seccion"><h3>Historia</h3><ul class="com-pl">'+e.hist.slice(0, 20).map(function(r){
    return '<li class="com-pf"><span><b>'+esc(AUT_ESTADO[r.estado]||r.estado)+(r.estado==='firmada' && r.sangre ? ' · '+esc(autGrupoTxt(r.sangre)) : '')+'</b><small>'+esc(fechaLarga(r.cuando))+(r.canal ? ' · '+esc(AUT_CANAL[r.canal]||'') : '')+(r.quien_nombre && r.canal!=='app' ? ' · '+esc(r.quien_nombre) : '')+'</small></span></li>'; }).join('')+'</ul></div>';
  h+='<div class="msg" id="autw-msg" role="status"></div>';
  abrirHoja('Autorización · '+t.nombre, [t.puesto, t.dni ? docPersonaP()+' '+t.dni : ''].filter(Boolean).join(' · '), h, '', { sinFoco:true });
  $('autw-aqui').onclick=function(){ _autwFirmar(t); };
  $('autw-app').onclick=function(){
    var bt=this; bt.disabled=true;
    sbRpc('sst_aut_pedir', { p:{ trabs:[t.id], version:AUT_VERSION, quien_nombre:gesQuien() } }).then(function(j){
      bt.disabled=false;
      if(!j || j.ok===false) return _masMal($('autw-msg'), 'No se pudo pedir: '+((j && j.motivo) || ''));
      _masDice($('autw-msg'), j.ya ? 'Ya se la habían pedido (o ya la firmó con este texto).' : (j.sin_cuenta ? 'Listo. Todavía no tiene su cuenta en la app: apenas entre con su documento y su PIN, le sale para firmar.' : 'Listo: le sale para firmar apenas abra su app.'), 'ok');
      masRecargar();
    }, function(e2){ bt.disabled=false; _masMal($('autw-msg'), 'No se pudo pedir. '+porQueFallo(e2)); });
  };
  $('autw-papel').onclick=function(){ _autwPapel(t); };
  $('autw-form').onclick=function(){ _autwPdf([_autwPersona(t)], 'formato', 'Autorizacion grupo sanguineo - '+t.nombre); };
  if($('autw-cons')) $('autw-cons').onclick=function(){ _autwConstancia(t); };
  if($('autw-foto')) $('autw-foto').onclick=function(){
    var bt=this; bt.disabled=true;
    saludBlobP(u.foto_url).then(function(bl){ bt.disabled=false; bajarBlob(bl, nombreArchivo('Autorizacion firmada - '+t.nombre)+'.jpg'); },
                                function(e2){ bt.disabled=false; toast('No se pudo abrir la foto. '+porQueFallo(e2)); });
  };
  if($('autw-rev')) $('autw-rev').onclick=function(){
    confirmar('¿Registrar que revocó su autorización?', 'Su grupo sanguíneo sale de su ficha y no se imprime más. Su credencial tiene que volver a emitirse (su QR cambia) y hay que recoger su sticker y su carné, que lo llevan impreso.', { si:'Sí, registrar', mal:true }).then(function(si){
      if(si) _autwRegistrar(t, { estado:'revocada', canal:'papel' }, 'Registrado: revocó su autorización. Pon al día su credencial y recoge su sticker y su carné.');
    });
  };
}
function _autwRegistrar(t, o, ok){
  var p=Object.assign({ trab:t.id, version:AUT_VERSION, quien_nombre:gesQuien(), cuando:new Date().toISOString(), dispositivo:'web' }, o);
  return sbRpc('sst_aut_registrar', { p:p }).then(function(j){
    if(!j || j.ok===false){ _masMal($('autw-msg'), 'No se pudo registrar: '+((j && j.motivo) || '')); return false; }
    MASG.t=0; masRecargar();
    return _autwTraer().then(function(){ var t2=(AUTW.gente||[]).filter(function(x){ return x.id===t.id; })[0] || t; autwVer(t2, ok); return true; });
  }, function(e){ _masMal($('autw-msg'), 'No se pudo registrar. '+porQueFallo(e)); return false; });
}
/* firmarla aquí: el texto, el grupo que marca y su firma en el recuadro */
function _autwFirmar(t){
  var z=$('autw-zona'); if(!z) return;
  var E=_autwEmp(), d={ razon:E.razon, ruc:E.ruc, dom:E.dom, obra:E.obra, nombre:t.nombre, doc:t.dni, td:t.td||docPersonaP(), cargo:t.puesto, sangre:'' }, T=autTexto(d), g='';
  z.innerHTML='<div class="tarj piq-form" id="autw-f" style="margin:12px 0 0"><div class="tarj-cuerpo"><b>Que la lea y la firme</b><p class="ayuda" style="margin:2px 0 8px">Es voluntario: si no quiere, toca «No autoriza».</p>'+
    '<div class="aviso" style="max-height:300px;overflow:auto;margin:0 0 10px" data-sin-pais><p style="margin:0 0 8px">'+esc(T.intro)+'</p><ol style="margin:0;padding-left:20px">'+T.puntos.map(function(q){ return '<li style="margin:0 0 6px"><b>'+esc(q.t)+'.</b> '+esc(q.x)+'</li>'; }).join('')+'</ol>'+
    '<p class="ayuda" style="margin:6px 0 0">'+esc(T.base)+'</p></div>'+
    '<b style="display:block;margin:4px 0 6px">Su grupo sanguíneo</b><div class="chips" id="autw-g">'+AUT_GRUPOS.map(function(x){ return '<button type="button" class="chip" data-g="'+x+'">'+esc(autGrupoTxt(x))+'</button>'; }).join('')+'</div>'+
    '<div class="lienzo" id="autw-lienzo" style="margin-top:10px"><canvas></canvas><div class="guia"></div><div class="pista">Firma aquí con el mouse, el dedo o el lápiz</div></div>'+
    '<p class="msg" id="autw-fm"></p><div class="acciones"><button type="button" class="bt sec chico" id="autw-fb">Borrar y repetir</button><button type="button" class="bt sec" id="autw-fno">No autoriza</button><button type="button" class="bt ok" id="autw-fsi">Autoriza</button></div></div></div>';
  var limpia=function(){ _masDice($('autw-fm'), '', ''); };
  setTimeout(function(){ if($('autw-lienzo')){ prepLienzo($('autw-lienzo'), 170, limpia); try{ $('autw-f').scrollIntoView({ block:'start', behavior:'smooth' }); }catch(e){} } }, 30);
  $('autw-fb').onclick=function(){ prepLienzo($('autw-lienzo'), 170, limpia); };
  Array.prototype.forEach.call(z.querySelectorAll('[data-g]'), function(b){ b.onclick=function(){ g=b.getAttribute('data-g'); Array.prototype.forEach.call(z.querySelectorAll('[data-g]'), function(x){ x.classList.toggle('on', x===b); }); limpia(); }; });
  function guarda(si){
    var m=$('autw-fm'), tr=atsNorm(LIENZO.trazos);
    if(si && !g) return _masMal(m, 'Marca su grupo sanguíneo.');
    if(si && (!tr || lienzoPuntos()<12)) return _masMal(m, 'Falta su firma: se firma dentro del recuadro.');
    var dd=Object.assign({}, d, { sangre:si ? g : '' });
    _masDice(m, 'Guardando…');
    _autwRegistrar(t, { estado:si ? 'firmada' : 'negada', canal:'pantalla', sangre:si ? g : null, firma:(tr && lienzoPuntos()>=12) ? tr : null, texto_hash:autHuella(autTextoPlano(dd)) },
      si ? 'Autorización registrada: '+autGrupoTxt(g)+'. Pon al día su credencial para que su QR y su sticker lo lleven.' : 'Quedó registrado que no autoriza: su grupo no se registra ni se imprime.');
  }
  $('autw-fsi').onclick=function(){ guarda(true); };
  $('autw-fno').onclick=function(){ guarda(false); };
}
/* firmó en papel: lo que marcó y, si se quiere, la foto o el escaneo del formato firmado */
function _autwPapel(t){
  var z=$('autw-zona'); if(!z) return;
  var g=autGrupo(t.sangre), si=true, foto=null;
  z.innerHTML='<div class="tarj piq-form" id="autw-p" style="margin:12px 0 0"><div class="tarj-cuerpo"><b>Firmó el formato en papel</b><p class="ayuda" style="margin:2px 0 8px">Registra lo que marcó. Guarda el papel firmado: es la prueba.</p>'+
    '<div class="chips" id="autw-pd"><button type="button" class="chip on" data-d="1">Sí autorizo</button><button type="button" class="chip" data-d="0">No autorizo</button></div>'+
    '<div id="autw-pg"><b style="display:block;margin:10px 0 6px">Su grupo sanguíneo</b><div class="chips">'+AUT_GRUPOS.map(function(x){ return '<button type="button" class="chip'+(x===g ? ' on' : '')+'" data-g="'+x+'">'+esc(autGrupoTxt(x))+'</button>'; }).join('')+'</div></div>'+
    '<div class="campo" style="margin:12px 0 0"><label for="autw-pf">La foto o el escaneo del formato firmado <span class="tenue">· opcional</span></label><input type="file" id="autw-pf" accept="image/*"></div><div id="autw-pv"></div>'+
    '<p class="msg" id="autw-pm"></p><div class="acciones"><button type="button" class="bt sec" id="autw-pno">Cancelar</button><button type="button" class="bt ok" id="autw-pok">Guardar</button></div></div></div>';
  Array.prototype.forEach.call(z.querySelectorAll('[data-d]'), function(b){ b.onclick=function(){ si=b.getAttribute('data-d')==='1'; Array.prototype.forEach.call(z.querySelectorAll('[data-d]'), function(x){ x.classList.toggle('on', x===b); }); $('autw-pg').hidden=!si; }; });
  Array.prototype.forEach.call(z.querySelectorAll('[data-g]'), function(b){ b.onclick=function(){ g=b.getAttribute('data-g'); Array.prototype.forEach.call(z.querySelectorAll('[data-g]'), function(x){ x.classList.toggle('on', x===b); }); }; });
  $('autw-pf').onchange=function(){
    var f=this.files && this.files[0]; if(!f) return;
    masFotoDe(f, 1600).then(function(r){ foto=r; $('autw-pv').innerHTML='<img src="'+r.vista+'" alt="El formato firmado" style="max-width:220px;border-radius:8px;margin-top:8px">'; }, function(){ _masMal($('autw-pm'), 'Esa imagen no se pudo leer.'); });
  };
  $('autw-pno').onclick=function(){ z.innerHTML=''; };
  $('autw-pok').onclick=function(){
    var m=$('autw-pm'), bt=this;
    if(si && !g) return _masMal(m, 'Marca el grupo sanguíneo que escribió.');
    bt.disabled=true; _masDice(m, foto ? 'Subiendo la foto…' : 'Guardando…');
    /* 08/10/2026 · la foto del formato lleva un dato de salud: al balde privado «salud» (<obra>/aut/…), sin enlace público */
    (foto ? saludSubirP(YO.obra.id+'/aut/'+Date.now()+'-autorizacion.jpg', foto.blob).catch(function(){ return null; }) : Promise.resolve(null)).then(function(url){
      return _autwRegistrar(t, { estado:si ? 'firmada' : 'negada', canal:'papel', sangre:si ? g : null, foto_url:url||null },
        si ? 'Registrado: autorizó en papel ('+autGrupoTxt(g)+'). Pon al día su credencial para que su QR y su sticker lo lleven.' : 'Registrado: no autorizó.');
    }).then(function(){ if(bt.isConnected) bt.disabled=false; });
  };
}
/* su constancia: la fila completa (con su firma) y, si es papel, la foto */
function _autwConstancia(t){
  var e=_autwDe(t), u=e && e.ultima; if(!u) return;
  var revocada=null;
  if(u.estado==='revocada'){ var antes=(e.hist||[]).filter(function(r){ return r.estado==='firmada'; })[0]; if(antes){ revocada=u.cuando; u=antes; } }
  Promise.all([cargarAutoriza(), cargarEvPDF(), sbGet('sst_autorizacion?id=eq.'+_enc(u.id)+'&select=id,firma,texto_hash,foto_url,quien_nombre,canal,cuando,sangre,estado,version').catch(function(){ return null; })]).then(function(r){
    var reg=Object.assign({}, u, (r[2] && r[2][0]) || {}), p=Object.assign(_autwPersona(t), { reg:reg, revocada:revocada });
    var hacer=function(){ var doc=autPDF([p], _autwCtxPDF(), { modo:'constancia' }); bajarBlob(doc.output('blob'), nombreArchivo('Constancia autorizacion grupo sanguineo - '+t.nombre)+'.pdf'); toast('Constancia descargada.'); };
    /* la foto del papel: del balde privado (con la sesión) o, si es de antes, de su enlace */
    var src=(reg.foto_url && String(reg.foto_url).indexOf('salud:')===0) ? saludDataUrlP(reg.foto_url) : Promise.resolve(reg.foto_url);
    if(reg.foto_url) return Promise.all([(typeof stkImagen==='function') ? true : cargarStickers(), src]).then(function(x){ return x[1] ? stkImagen(x[1]) : null; })
      .then(function(im){ if(im){ p.fotoDU=im.du; p.fotoR=im.r; } hacer(); }, hacer);
    hacer();
  }).catch(function(e){ toast('No se pudo armar la constancia. '+porQueFallo(e)); });
}
