/* ═══════════════════════════════════════════════════════════════════════════
   OBRASST · PORTAL WEB · Generador Nativo de Formatos Excel para Informe en 8 Carpetas
   1. Estadistica_Mensual_SST_<Mes>_<Anio>.xlsx (10 hojas con fórmulas nativas)
   2. Panel_Fotografico_SST_<Mes>_<Anio>.xlsx (5 hojas con imágenes reales incrustadas)
   3. Registro_de_Trabajadores_en_Obra_<Mes>_<Anio>.xlsx (29 columnas en mayúsculas)
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  /* Catálogo oficial de 10 categorías (16 subtipos) alineado al formato de Estadística Mensual */
  var TIPOS_CHARLA_OFICIAL = [
    { cod:'a.1', grp:'a', lbl:'Inducción Hombre Nuevo',                              grpLbl:'a) Inducción' },
    { cod:'a.2', grp:'a', lbl:'Inducción de proveedor',                              grpLbl:'a) Inducción' },
    { cod:'a.3', grp:'a', lbl:'Inducción visitas',                                   grpLbl:'a) Inducción' },
    { cod:'b.1', grp:'b', lbl:'Capacitaciones específicas programadas',              grpLbl:'b) Capacitaciones específicas' },
    { cod:'b.2', grp:'b', lbl:'Capacitaciones específicas no programadas',           grpLbl:'b) Capacitaciones específicas' },
    { cod:'c',   grp:'c', lbl:'Sensibilización / Retroalimentación',                 grpLbl:'c) Sensibilización / Retroalimentación' },
    { cod:'d',   grp:'d', lbl:'Talleres',                                            grpLbl:'d) Talleres' },
    { cod:'e',   grp:'e', lbl:'Entrenamiento',                                       grpLbl:'e) Entrenamiento' },
    { cod:'f',   grp:'f', lbl:'Paradas de seguridad',                                grpLbl:'f) Paradas de seguridad' },
    { cod:'g',   grp:'g', lbl:'Reunión SST / Comité Técnico SST',                    grpLbl:'g) Reunión SST / Comité Técnico SST' },
    { cod:'h',   grp:'h', lbl:'Reunión de Seguridad Vial',                           grpLbl:'h) Reunión de Seguridad Vial' },
    { cod:'i',   grp:'i', lbl:'Difusión',                                            grpLbl:'i) Difusión' },
    { cod:'j.1', grp:'j', lbl:'Reunión de inicio de jornada (Personal Staff)',       grpLbl:'j) Reunión de inicio de jornada' },
    { cod:'j.2', grp:'j', lbl:'Reunión de inicio de jornada (Personal Obra)',        grpLbl:'j) Reunión de inicio de jornada' },
    { cod:'j.3', grp:'j', lbl:'Reunión semanal (Personal Staff)',                    grpLbl:'j) Reunión de inicio de jornada' },
    { cod:'j.4', grp:'j', lbl:'Reunión semanal (Personal Obra)',                     grpLbl:'j) Reunión de inicio de jornada' }
  ];

  /* Mapeo retrocompatible: cualquier registro previo "Charla de 5 minutos" pasa a j.1 / j.2 */
  function mapearTipoCharla(textoTipo, esStaff){
    var s = String(textoTipo || '').toLowerCase();
    if(/hombre nuevo|induccion general|inducción general/.test(s)) return 'a.1';
    if(/proveedor/.test(s)) return 'a.2';
    if(/visita/.test(s)) return 'a.3';
    if(/inducci/.test(s)) return 'a.1';
    if(/no programada/.test(s)) return 'b.2';
    if(/capacitaci|espec[ií]fica/.test(s)) return 'b.1';
    if(/sensibiliz|retroaliment/.test(s)) return 'c';
    if(/taller/.test(s)) return 'd';
    if(/entrenamiento|simulacro/.test(s)) return 'e';
    if(/parada/.test(s)) return 'f';
    if(/comit[eé]|subcomit/.test(s)) return 'g';
    if(/vial|tr[aá]nsito|manejo defensivo/.test(s)) return 'h';
    if(/difusi[oó]n|msds|sga|nfpa|pets|risst/.test(s)) return 'i';
    if(/semanal/.test(s)) return esStaff ? 'j.3' : 'j.4';
    if(/5 min|cinco min|diaria|inicio de jornada|pausa activa|charla/.test(s)) return esStaff ? 'j.1' : 'j.2';
    return esStaff ? 'j.1' : 'j.2';
  }

  function _xEsc(v){
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  }

  function _colLetra(n){
    var s = '';
    while(n > 0){ var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - m) / 26); }
    return s;
  }

  function _crearLibroXlsx(){
    return { hojas: [], imagenes: [] };
  }

  function _nuevaHoja(libro, nombre){
    var h = {
      nombre: String(nombre || 'Hoja').replace(/[\\\/\?\*\[\]:]/g, '').slice(0, 31),
      celdas: {},
      merges: [],
      anchos: {},
      altos: {},
      imgs: []
    };
    libro.hojas.push(h);
    return h;
  }

  function _setCelda(h, r, c, val, styleId, formula){
    var k = r + ':' + c;
    if(formula){
      h.celdas[k] = { f: String(formula).replace(/^=/, ''), s: styleId || 0 };
      return;
    }
    if(typeof val === 'number' && !isNaN(val)){
      h.celdas[k] = { v: val, t: 'n', s: styleId || 0 };
    } else {
      h.celdas[k] = { v: val == null ? '' : String(val), t: 'inlineStr', s: styleId || 0 };
    }
  }

  function _merge(h, r1, c1, r2, c2){
    h.merges.push(_colLetra(c1) + r1 + ':' + _colLetra(c2) + r2);
  }

  function _stylesXml(){
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="1"><numFmt numFmtId="164" formatCode="0.0%"/></numFmts>' +
      '<fonts count="4">' +
        '<font><sz val="10"/><name val="Calibri"/></font>' +
        '<font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +
        '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +
        '<font><b/><sz val="10"/><color rgb="FF08222F"/><name val="Calibri"/></font>' +
      '</fonts>' +
      '<fills count="6">' +
        '<fill><patternFill patternType="none"/></fill>' +
        '<fill><patternFill patternType="gray125"/></fill>' +
        '<fill><patternFill patternType="solid"><fgColor rgb="FF0B2A3A"/></patternFill></fill>' +
        '<fill><patternFill patternType="solid"><fgColor rgb="FFFFC933"/></patternFill></fill>' +
        '<fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/></patternFill></fill>' +
        '<fill><patternFill patternType="solid"><fgColor rgb="FFE0F2FE"/></patternFill></fill>' +
      '</fills>' +
      '<borders count="2">' +
        '<border><left/><right/><top/><bottom/><diagonal/></border>' +
        '<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>' +
      '</borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="9">' +
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
        '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
        '<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
        '<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>' +
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
        '<xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
        '<xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>' +
        '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
      '</cellXfs></styleSheet>';
  }

  function _compilarXlsxBlob(libro){
    if(typeof JSZip === 'undefined'){
      return Promise.reject(new Error('JSZip no está disponible en el portal.'));
    }
    var zip = new JSZip();
    var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default ContentType="application/vnd.openxmlformats-package.relationships+xml" Extension="rels"/>' +
      '<Default ContentType="application/xml" Extension="xml"/>' +
      '<Default ContentType="image/jpeg" Extension="jpg"/>' +
      '<Default ContentType="image/png" Extension="png"/>' +
      '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" PartName="/xl/workbook.xml"/>' +
      '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" PartName="/xl/styles.xml"/>';

    var wbSheets = '', wbRels = '';
    var drawingCount = 0;

    libro.imagenes.forEach(function(im, idx){
      zip.file('xl/media/image' + (idx + 1) + '.' + im.ext, im.bytes);
    });

    libro.hojas.forEach(function(h, idx){
      var sNum = idx + 1;
      ct += '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" PartName="/xl/worksheets/sheet' + sNum + '.xml"/>';
      wbSheets += '<sheet name="' + _xEsc(h.nombre) + '" sheetId="' + sNum + '" r:id="rId' + sNum + '"/>';
      wbRels += '<Relationship Id="rId' + sNum + '" Target="worksheets/sheet' + sNum + '.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"/>';

      var rowsMap = {};
      Object.keys(h.celdas).forEach(function(k){
        var p = k.split(':'), r = parseInt(p[0], 10), c = parseInt(p[1], 10);
        if(!rowsMap[r]) rowsMap[r] = [];
        rowsMap[r].push({ c: c, cell: h.celdas[k] });
      });
      Object.keys(h.altos).forEach(function(rk){
        var r = parseInt(rk, 10);
        if(!rowsMap[r]) rowsMap[r] = [];
      });

      var colsXml = '';
      var colKeys = Object.keys(h.anchos).map(Number).sort(function(a,b){ return a - b; });
      if(colKeys.length){
        colsXml = '<cols>' + colKeys.map(function(ci){
          return '<col min="' + ci + '" max="' + ci + '" width="' + h.anchos[ci] + '" customWidth="1"/>';
        }).join('') + '</cols>';
      }

      var sheetData = '';
      Object.keys(rowsMap).map(Number).sort(function(a,b){ return a - b; }).forEach(function(r){
        var ht = h.altos[r] ? ' ht="' + h.altos[r] + '" customHeight="1"' : '';
        sheetData += '<row r="' + r + '"' + ht + '>';
        rowsMap[r].sort(function(a,b){ return a.c - b.c; }).forEach(function(it){
          var ref = _colLetra(it.c) + r, cl = it.cell;
          if(cl.f){
            sheetData += '<c r="' + ref + '" s="' + cl.s + '"><f>' + _xEsc(cl.f) + '</f></c>';
          } else if(cl.t === 'n'){
            sheetData += '<c r="' + ref + '" s="' + cl.s + '"><v>' + cl.v + '</v></c>';
          } else {
            sheetData += '<c r="' + ref + '" t="inlineStr" s="' + cl.s + '"><is><t>' + _xEsc(cl.v) + '</t></is></c>';
          }
        });
        sheetData += '</row>';
      });

      var mergesXml = h.merges.length
        ? '<mergeCells count="' + h.merges.length + '">' + h.merges.map(function(m){ return '<mergeCell ref="' + m + '"/>'; }).join('') + '</mergeCells>'
        : '';

      var drawingTag = '';
      if(h.imgs.length){
        drawingCount++;
        ct += '<Override ContentType="application/vnd.openxmlformats-officedocument.drawing+xml" PartName="/xl/drawings/drawing' + drawingCount + '.xml"/>';
        drawingTag = '<drawing r:id="rId1"/>';
        zip.file('xl/worksheets/_rels/sheet' + sNum + '.xml.rels',
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Target="../drawings/drawing' + drawingCount + '.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing"/>' +
          '</Relationships>');

        var dRels = '', anchors = '';
        h.imgs.forEach(function(imRef, j){
          var imObj = libro.imagenes[imRef.imgIdx];
          var relId = 'rId' + (j + 1);
          dRels += '<Relationship Id="' + relId + '" Target="../media/image' + (imRef.imgIdx + 1) + '.' + imObj.ext + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"/>';
          anchors += '<xdr:twoCellAnchor>' +
            '<xdr:from><xdr:col>' + imRef.c1 + '</xdr:col><xdr:colOff>38100</xdr:colOff><xdr:row>' + imRef.r1 + '</xdr:row><xdr:rowOff>38100</xdr:rowOff></xdr:from>' +
            '<xdr:to><xdr:col>' + imRef.c2 + '</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>' + imRef.r2 + '</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>' +
            '<xdr:pic><xdr:nvPicPr><xdr:cNvPr id="' + (j + 2) + '" name="Foto ' + (j + 1) + '"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>' +
            '<xdr:blipFill><a:blip r:embed="' + relId + '"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>' +
            '<xdr:spPr><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:twoCellAnchor>';
        });
        zip.file('xl/drawings/_rels/drawing' + drawingCount + '.xml.rels',
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + dRels + '</Relationships>');
        zip.file('xl/drawings/drawing' + drawingCount + '.xml',
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          anchors + '</xdr:wsDr>');
      }

      zip.file('xl/worksheets/sheet' + sNum + '.xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        colsXml + '<sheetData>' + sheetData + '</sheetData>' + mergesXml + drawingTag + '</worksheet>');
    });

    ct += '</Types>';
    var styleRelId = 'rId' + (libro.hojas.length + 1);
    wbRels += '<Relationship Id="' + styleRelId + '" Target="styles.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"/>';

    zip.file('[Content_Types].xml', ct);
    zip.file('_rels/.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Target="xl/workbook.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"/>' +
      '</Relationships>');
    zip.file('xl/workbook.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets>' + wbSheets + '</sheets></workbook>');
    zip.file('xl/_rels/workbook.xml.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + wbRels + '</Relationships>');
    zip.file('xl/styles.xml', _stylesXml());

    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /* Convierte cualquier imagen descargada (incluyendo WebP) a JPG/PNG compatible con Excel */
  function _descargarImagenBytes(url){
    if(!url) return Promise.resolve(null);
    return fetch(url).then(function(r){
      if(!r.ok) return null;
      var ct = (r.headers.get('content-type') || '').toLowerCase();
      if(ct.indexOf('webp') >= 0){
        return r.blob().then(function(bl){
          return new Promise(function(res){
            var im = new Image();
            var objUrl = URL.createObjectURL(bl);
            im.onload = function(){
              try{
                var cv = document.createElement('canvas');
                cv.width = im.naturalWidth || 800; cv.height = im.naturalHeight || 600;
                cv.getContext('2d').drawImage(im, 0, 0);
                cv.toBlob(function(jBlob){
                  URL.revokeObjectURL(objUrl);
                  if(!jBlob){ res(null); return; }
                  jBlob.arrayBuffer().then(function(ab){ res({ bytes: new Uint8Array(ab), ext: 'jpg' }); }, function(){ res(null); });
                }, 'image/jpeg', 0.88);
              }catch(_e){ URL.revokeObjectURL(objUrl); res(null); }
            };
            im.onerror = function(){ URL.revokeObjectURL(objUrl); res(null); };
            im.src = objUrl;
          });
        });
      }
      var ext = ct.indexOf('png') >= 0 ? 'png' : 'jpg';
      return r.arrayBuffer().then(function(buf){ return { bytes: new Uint8Array(buf), ext: ext }; });
    }).catch(function(){ return null; });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     FORMATO 1 · ESTADÍSTICA MENSUAL DE SST (10 HOJAS CON FÓRMULAS NATIVAS)
     ═══════════════════════════════════════════════════════════════════════════ */
  function generarEstadisticaSSTXlsx(datos){
    datos = datos || {};
    var emp = datos.empresa || {};
    var anio = Number(datos.anio || new Date().getFullYear());
    var mesIdx = Math.max(0, Math.min(11, Number(datos.mesIdx != null ? datos.mesIdx : new Date().getMonth())));
    var mesNom = MESES_ES[mesIdx];
    var mesesData = datos.meses || {};
    var charlasMes = Array.isArray(datos.charlasMes) ? datos.charlasMes : [];
    var obsMes = Array.isArray(datos.observaciones) ? datos.observaciones : [];
    var expositores = Array.isArray(datos.expositores) ? datos.expositores : [];

    var libro = _crearLibroXlsx();

    /* 1. Carátula */
    var hCar = _nuevaHoja(libro, 'Carátula');
    hCar.anchos = { 1:26, 2:22, 3:28, 4:24 };
    hCar.altos = { 1:28, 5:22, 9:46, 12:38, 15:46, 18:46 };
    _setCelda(hCar, 1, 1, 'REGISTRO DE ESTADÍSTICA MENSUAL DE SEGURIDAD Y SALUD EN EL TRABAJO', 1);
    _merge(hCar, 1, 1, 1, 4);
    _setCelda(hCar, 3, 1, 'DATOS DEL EMPLEADOR', 7); _merge(hCar, 3, 1, 3, 4);
    _setCelda(hCar, 4, 1, '1. RAZÓN SOCIAL', 2); _setCelda(hCar, 4, 2, '2. RUC / ID FISCAL', 2);
    _setCelda(hCar, 4, 3, '3. DOMICILIO / OBRA', 2); _setCelda(hCar, 4, 4, '4. ACTIVIDAD ECONÓMICA', 2);
    _setCelda(hCar, 5, 1, emp.nombre || 'Empresa de Ejemplo', 4);
    _setCelda(hCar, 5, 2, emp.ruc || '', 5);
    _setCelda(hCar, 5, 3, emp.direccion || emp.obra || '', 4);
    _setCelda(hCar, 5, 4, emp.actividad || 'CONSTRUCCIÓN DE EDIFICIOS', 4);
    _setCelda(hCar, 7, 1, '5. PERIODO REPORTADO:', 6); _setCelda(hCar, 7, 2, mesNom.toUpperCase() + ' ' + anio, 5);
    _setCelda(hCar, 8, 1, '6. DESCRIBIR LOS RESULTADOS ESTADÍSTICOS (COMPARAR CON OBJETIVOS Y METAS)', 7); _merge(hCar, 8, 1, 8, 4);
    _setCelda(hCar, 9, 1, datos.resumenResultados || ('Consolidado estadístico de ' + mesNom + ' ' + anio + ': horas hombre trabajadas, horas capacitadas, inspecciones y seguimiento de observaciones SST.'), 4); _merge(hCar, 9, 1, 9, 4);
    _setCelda(hCar, 11, 1, '7. ANÁLISIS DE CAUSAS DE DESVIACIONES', 7); _merge(hCar, 11, 1, 11, 4);
    _setCelda(hCar, 12, 1, datos.analisisDesviaciones || 'Sin desviaciones críticas reportadas en el período evaluado.', 4); _merge(hCar, 12, 1, 12, 4);
    _setCelda(hCar, 14, 1, '8. PRINCIPALES ACTIVIDADES DESARROLLADAS', 7); _merge(hCar, 14, 1, 14, 4);
    _setCelda(hCar, 15, 1, datos.actividades || '1. Ejecución diaria de reuniones de inicio de jornada por frente.\n2. Inspecciones programadas de campo y control de equipos.\n3. Seguimiento y levantamiento de observaciones SST.', 4); _merge(hCar, 15, 1, 15, 4);
    _setCelda(hCar, 17, 1, '9. CONCLUSIONES Y RECOMENDACIONES', 7); _merge(hCar, 17, 1, 17, 4);
    _setCelda(hCar, 18, 1, datos.conclusiones || 'Mantener la frecuencia diaria de reuniones de inicio de jornada y el cierre oportuno de hallazgos.', 4); _merge(hCar, 18, 1, 18, 4);
    _setCelda(hCar, 20, 1, '10. RESPONSABLE DEL REGISTRO', 7); _merge(hCar, 20, 1, 20, 4);
    _setCelda(hCar, 21, 1, 'Nombre:', 6); _setCelda(hCar, 21, 2, datos.responsable || '', 4); _merge(hCar, 21, 2, 21, 4);
    _setCelda(hCar, 22, 1, 'Cargo:', 6);  _setCelda(hCar, 22, 2, datos.cargoResponsable || 'SUPERVISOR SSOMA', 4); _merge(hCar, 22, 2, 22, 4);
    _setCelda(hCar, 23, 1, 'Fecha:', 6);  _setCelda(hCar, 23, 2, datos.fechaEmision || new Date().toISOString().slice(0, 10), 4); _merge(hCar, 23, 2, 23, 4);

    /* 2. Cumplimiento de Objetivos y Metas */
    var hObj = _nuevaHoja(libro, 'Cumplimiento de Obj y meta');
    hObj.anchos = { 1:28, 2:32, 3:36 };
    for(var mc = 4; mc <= 15; mc++) hObj.anchos[mc] = 13;
    _setCelda(hObj, 1, 1, 'CUMPLIMIENTO DE OBJETIVOS Y METAS DE SST ' + anio, 1); _merge(hObj, 1, 1, 1, 15);
    _setCelda(hObj, 3, 1, 'OBJETIVO GENERAL', 2); _setCelda(hObj, 3, 2, 'OBJETIVO ESPECÍFICO', 2); _setCelda(hObj, 3, 3, 'INDICADOR', 2);
    MESES_ES.forEach(function(mn, i){ _setCelda(hObj, 3, 4 + i, mn.slice(0, 3) + ' ' + anio, 2); });
    var filasObj = [
      ['Prevenir accidentes e incidentes', 'Controlar el índice de frecuencia', '(N° Accidentes CTP / HHT) x 1,000,000', '< 1.5', function(i){ return '=IFERROR(ANX1!O' + (7 + i) + ',0)'; }, 5],
      ['Control en ambientes de trabajo', 'Ejecutar inspecciones programadas', '(Inspecciones ejecutadas / Programadas) x 100%', '100%', function(i){ return '=IFERROR(\'Gráfica 3\'!' + _colLetra(2 + i) + '6,0)'; }, 8],
      ['Participación de trabajadores', 'Cierre oportuno de reportes', '(Reportes cerrados / Total reportes) x 100%', '> 90%', function(){ return 1; }, 8],
      ['Competencia y sensibilización', 'Cumplir ratio de horas capacitadas', '(HHC / HHT) x 100%', '> 2%', function(i){ return '=IF(ANX1!E' + (7 + i) + '>0,ANX2!L' + (7 + i) + '/ANX1!E' + (7 + i) + ',0)'; }, 8]
    ];
    filasObj.forEach(function(fo, idx){
      var r = 4 + idx * 2;
      _setCelda(hObj, r, 1, fo[0], 4); _setCelda(hObj, r, 2, fo[1], 4); _setCelda(hObj, r, 3, fo[2], 4);
      _setCelda(hObj, r + 1, 3, 'META', 3);
      for(var i = 0; i < 12; i++){
        var valF = fo[4](i);
        if(typeof valF === 'string' && valF.charAt(0) === '=') _setCelda(hObj, r, 4 + i, '', fo[5], valF);
        else _setCelda(hObj, r, 4 + i, valF, fo[5]);
        _setCelda(hObj, r + 1, 4 + i, fo[3], 6);
      }
    });

    /* 3. ANX1 · Estadística Mensual General (Obrero vs Empleado + IF/IS/IA) */
    var hA1 = _nuevaHoja(libro, 'ANX1');
    hA1.anchos = { 2:14, 3:12, 4:12, 5:12, 6:14, 7:11, 8:11, 9:11, 10:12, 12:12, 14:12, 15:12, 16:12, 17:12, 18:12, 19:12, 20:12, 21:12, 22:12 };
    _setCelda(hA1, 2, 2, 'ANEXO 1: ESTADÍSTICA MENSUAL DE SST · INFORMACIÓN GENERAL (' + anio + ')', 1); _merge(hA1, 2, 2, 2, 34);
    var grpA1 = [
      [2,2,'MES'], [3,5,'H/P Trabajadas'], [6,6,'H/P Acumulado'], [7,9,'Cantidad de Personal'],
      [10,11,'Accidente Mortal'], [12,22,'Accidentes de Trabajo Incapacitantes (ATI)'],
      [23,28,'Enfermedad Ocupacional'], [29,31,'Trabajo Restringido'], [32,34,'Accidentes Leves / Incidentes']
    ];
    grpA1.forEach(function(g){ _setCelda(hA1, 5, g[0], g[2], 2); if(g[1] > g[0]) _merge(hA1, 5, g[0], 5, g[1]); });
    var subA1 = [
      [3,'Obrero'],[4,'Empleado'],[5,'Total'],[6,'Horas Acum.'],
      [7,'Obrero'],[8,'Empleado'],[9,'Total'],
      [10,'N° Mortal'],[11,'Área'],
      [12,'N° ATI'],[13,'Área'],[14,'ATI Acum.'],[15,'IF'],[16,'IF Acum.'],[17,'Días Perd.'],[18,'DP Acum.'],[19,'IS'],[20,'IS Acum.'],[21,'IA'],[22,'IA Acum.'],
      [23,'N° Enf. Oc.'],[24,'Área'],[25,'Enf. Acum.'],[26,'Expuestos'],[27,'Tasa Inc.'],[28,'Cáncer Prof.'],
      [29,'N° Restring.'],[30,'Área'],[31,'Acum.'],[32,'N° Leves'],[33,'N° Inc. Pelig.'],[34,'N° Incidentes']
    ];
    subA1.forEach(function(s){ _setCelda(hA1, 6, s[0], s[1], 3); });
    for(var m = 0; m < 12; m++){
      var r1 = 7 + m, dm = mesesData[m] || {};
      _setCelda(hA1, r1, 2, MESES_ES[m], 4);
      _setCelda(hA1, r1, 3, Number(dm.hpObrero || 0), 5);
      _setCelda(hA1, r1, 4, Number(dm.hpEmpleado || 0), 5);
      _setCelda(hA1, r1, 5, '', 5, 'SUM(C' + r1 + ':D' + r1 + ')');
      _setCelda(hA1, r1, 6, '', 5, m === 0 ? 'E7' : ('F' + (r1 - 1) + '+E' + r1));
      _setCelda(hA1, r1, 7, Number(dm.persObrero || 0), 5);
      _setCelda(hA1, r1, 8, Number(dm.persEmpleado || 0), 5);
      _setCelda(hA1, r1, 9, '', 5, 'G' + r1 + '+H' + r1);
      _setCelda(hA1, r1, 10, Number(dm.mortales || 0), 5); _setCelda(hA1, r1, 11, dm.areaMortal || '-', 5);
      _setCelda(hA1, r1, 12, Number(dm.ati || 0), 5); _setCelda(hA1, r1, 13, dm.areaAti || '-', 5);
      _setCelda(hA1, r1, 14, '', 5, m === 0 ? 'L7' : ('N' + (r1 - 1) + '+L' + r1));
      _setCelda(hA1, r1, 15, '', 5, 'IF(E' + r1 + '>0,L' + r1 + '*1000000/E' + r1 + ',0)');
      _setCelda(hA1, r1, 16, '', 5, 'IF(F' + r1 + '>0,N' + r1 + '*1000000/F' + r1 + ',0)');
      _setCelda(hA1, r1, 17, Number(dm.diasPerd || 0), 5);
      _setCelda(hA1, r1, 18, '', 5, m === 0 ? 'Q7' : ('R' + (r1 - 1) + '+Q' + r1));
      _setCelda(hA1, r1, 19, '', 5, 'IF(E' + r1 + '>0,Q' + r1 + '*1000000/E' + r1 + ',0)');
      _setCelda(hA1, r1, 20, '', 5, 'IF(F' + r1 + '>0,R' + r1 + '*1000000/F' + r1 + ',0)');
      _setCelda(hA1, r1, 21, '', 5, '(O' + r1 + '*S' + r1 + ')/1000');
      _setCelda(hA1, r1, 22, '', 5, '(P' + r1 + '*T' + r1 + ')/1000');
      _setCelda(hA1, r1, 23, Number(dm.enfOc || 0), 5); _setCelda(hA1, r1, 24, '-', 5);
      _setCelda(hA1, r1, 25, '', 5, m === 0 ? 'W7' : ('Y' + (r1 - 1) + '+W' + r1));
      _setCelda(hA1, r1, 26, Number(dm.expuestos || 0), 5);
      _setCelda(hA1, r1, 27, '', 5, 'IF(E' + r1 + '>0,W' + r1 + '*1000000/E' + r1 + ',0)');
      _setCelda(hA1, r1, 28, Number(dm.cancer || 0), 5);
      _setCelda(hA1, r1, 29, Number(dm.restringido || 0), 5); _setCelda(hA1, r1, 30, '-', 5);
      _setCelda(hA1, r1, 31, '', 5, m === 0 ? 'AC7' : ('AE' + (r1 - 1) + '+AC' + r1));
      _setCelda(hA1, r1, 32, Number(dm.leves || 0), 5);
      _setCelda(hA1, r1, 33, Number(dm.incPel || 0), 5);
      _setCelda(hA1, r1, 34, Number(dm.inc || 0), 5);
    }
    _setCelda(hA1, 19, 2, 'Total', 6);
    [3,4,5,7,8,9,10,12,17,23,26,28,29,32,33,34].forEach(function(ci){
      var cl = _colLetra(ci);
      _setCelda(hA1, 19, ci, '', 6, 'SUM(' + cl + '7:' + cl + '18)');
    });
    _setCelda(hA1, 19, 6, '', 6, 'F18'); _setCelda(hA1, 19, 14, '', 6, 'N18');
    _setCelda(hA1, 19, 15, '', 6, 'IF(E19>0,L19*1000000/E19,0)');
    _setCelda(hA1, 19, 19, '', 6, 'IF(E19>0,Q19*1000000/E19,0)');
    _setCelda(hA1, 19, 21, '', 6, '(O19*S19)/1000');

    /* 4. ANX2.1 · Detalle de Capacitación SST del Mes (16 subcategorías) */
    var hA21 = _nuevaHoja(libro, 'ANX2.1');
    hA21.anchos = { 1:14, 2:42, 3:14, 4:13, 5:14, 6:26, 7:24, 8:16 };
    _setCelda(hA21, 1, 1, 'ANEXO 2.1 · DETALLE DE CAPACITACIÓN SST · MES: ' + mesNom.toUpperCase() + ' ' + anio, 1); _merge(hA21, 1, 1, 1, 8);
    _setCelda(hA21, 3, 1, 'Código', 2); _setCelda(hA21, 3, 2, 'Tipo / Subtipo de Capacitación', 2);
    _setCelda(hA21, 3, 3, 'HHC', 2); _setCelda(hA21, 3, 4, 'Asistentes', 2);

    var agrupadas = {};
    TIPOS_CHARLA_OFICIAL.forEach(function(t){ agrupadas[t.cod] = []; });
    charlasMes.forEach(function(ch){
      var cod = ch.codTipo || mapearTipoCharla(ch.tipo || ch.tema, ch.esStaff);
      if(!agrupadas[cod]) agrupadas[cod] = [];
      agrupadas[cod].push(ch);
    });

    var filaDetalle = 23;
    TIPOS_CHARLA_OFICIAL.forEach(function(t, idx){
      var list = agrupadas[t.cod] || [];
      var rIni = filaDetalle + 2;
      _setCelda(hA21, filaDetalle, 1, t.cod + ') ' + t.lbl, 7); _merge(hA21, filaDetalle, 1, filaDetalle, 8);
      ['Fecha','Tema','Minut. Cap.','Asistentes','Horas Cap.','Expositor','Cargo','Frente'].forEach(function(hd, ci){
        _setCelda(hA21, filaDetalle + 1, ci + 1, hd, 3);
      });
      var nFilas = Math.max(1, list.length);
      for(var k = 0; k < nFilas; k++){
        var rr = rIni + k, it = list[k];
        if(it){
          _setCelda(hA21, rr, 1, it.fecha || '', 5);
          _setCelda(hA21, rr, 2, it.tema || t.lbl, 4);
          _setCelda(hA21, rr, 3, Number(it.minutos || 10), 5);
          _setCelda(hA21, rr, 4, Number(it.asistentes || 0), 5);
          _setCelda(hA21, rr, 5, '', 5, 'C' + rr + '*D' + rr + '/60');
          _setCelda(hA21, rr, 6, it.expositor || '', 4);
          _setCelda(hA21, rr, 7, it.cargo || '', 4);
          _setCelda(hA21, rr, 8, it.frente || 'GENERAL', 5);
        } else {
          _setCelda(hA21, rr, 3, 0, 5); _setCelda(hA21, rr, 4, 0, 5);
          _setCelda(hA21, rr, 5, '', 5, 'C' + rr + '*D' + rr + '/60');
        }
      }
      var rTot = rIni + nFilas;
      _setCelda(hA21, rTot, 2, 'Subtotal ' + t.cod, 6);
      _setCelda(hA21, rTot, 4, '', 6, 'SUM(D' + rIni + ':D' + (rTot - 1) + ')');
      _setCelda(hA21, rTot, 5, '', 6, 'SUM(E' + rIni + ':E' + (rTot - 1) + ')');

      var rRes = 4 + idx;
      _setCelda(hA21, rRes, 1, t.cod, 5);
      _setCelda(hA21, rRes, 2, t.lbl, 4);
      _setCelda(hA21, rRes, 3, '', 5, 'E' + rTot);
      _setCelda(hA21, rRes, 4, '', 5, 'D' + rTot);

      filaDetalle = rTot + 2;
    });
    _setCelda(hA21, 20, 2, 'TOTAL HHC DEL MES', 6);
    _setCelda(hA21, 20, 3, '', 6, 'SUM(C4:C19)');
    _setCelda(hA21, 20, 4, '', 6, 'SUM(D4:D19)');

    /* 5. ANX2 · Resumen Anual Capacitación SST (a–j) */
    var hA2 = _nuevaHoja(libro, 'ANX2');
    hA2.anchos = { 1:14, 2:12, 3:14, 4:14, 5:12, 6:12, 7:13, 8:14, 9:14, 10:12, 11:15, 12:13, 13:14 };
    _setCelda(hA2, 2, 1, 'ANEXO 2: ESTADÍSTICA MENSUAL DE CAPACITACIÓN SST (' + anio + ')', 1); _merge(hA2, 2, 1, 2, 13);
    var colsA2 = [
      'Mes', 'a) Inducción', 'b) Capacitaciones específicas', 'c) Sensibilización / Retroalim.',
      'd) Talleres', 'e) Entrenamiento', 'f) Paradas de seguridad', 'g) Reunión SST / Comité',
      'h) Seguridad vial', 'i) Difusión', 'j) Reunión de inicio de jornada', 'HHC Total', 'HHC Acumuladas'
    ];
    colsA2.forEach(function(hd, ci){ _setCelda(hA2, 5, ci + 1, hd, 2); });
    var grpFormulasMesActivo = {
      2: 'SUM(ANX2.1!C4:C6)',  3: 'SUM(ANX2.1!C7:C8)',  4: 'ANX2.1!C9',   5: 'ANX2.1!C10',
      6: 'ANX2.1!C11',         7: 'ANX2.1!C12',         8: 'ANX2.1!C13',  9: 'ANX2.1!C14',
      10: 'ANX2.1!C15',        11: 'SUM(ANX2.1!C16:C19)'
    };
    for(var m2 = 0; m2 < 12; m2++){
      var r2 = 7 + m2, dm2 = (mesesData[m2] && mesesData[m2].hhc) || {};
      _setCelda(hA2, r2, 1, MESES_ES[m2], 4);
      for(var c2 = 2; c2 <= 11; c2++){
        if(m2 === mesIdx){
          _setCelda(hA2, r2, c2, '', 5, grpFormulasMesActivo[c2]);
        } else {
          var keyLet = String.fromCharCode(95 + c2);
          _setCelda(hA2, r2, c2, Number(dm2[keyLet] || 0), 5);
        }
      }
      _setCelda(hA2, r2, 12, '', 5, 'SUM(B' + r2 + ':K' + r2 + ')');
      _setCelda(hA2, r2, 13, '', 5, m2 === 0 ? 'L7' : ('L' + r2 + '+M' + (r2 - 1)));
    }
    _setCelda(hA2, 19, 1, 'Total', 6);
    for(var tc = 2; tc <= 12; tc++){
      var cl2 = _colLetra(tc);
      _setCelda(hA2, 19, tc, '', 6, 'SUM(' + cl2 + '7:' + cl2 + '18)');
    }
    _setCelda(hA2, 19, 13, '', 6, 'M18');

    /* 6. ANX3 · Herramientas SST */
    var hA3 = _nuevaHoja(libro, 'ANX3');
    hA3.anchos = { 1:14, 2:10, 3:11, 4:11, 5:11, 6:13, 8:12, 9:12, 10:12, 11:12, 12:12, 13:12, 14:12, 15:12, 17:11, 18:11, 19:11 };
    _setCelda(hA3, 1, 1, 'ANEXO 3 · ESTADÍSTICA MENSUAL DE HERRAMIENTAS SST (' + anio + ')', 1); _merge(hA3, 1, 1, 1, 19);
    var hdA3 = [
      [1,'Mes'],[2,'# PETS'],[3,'# IPERC'],[4,'# PETAR'],[5,'# ATS'],[6,'Check List Equipos'],
      [8,'Inspecciones'],[9,'Actos Sub. (Insp)'],[10,'Cond. Sub. (Insp)'],
      [11,'Reportes Liderazgo'],[12,'Felicitaciones'],[13,'Sugerencias'],[14,'Actos Sub.'],[15,'Cond. Sub.'],
      [17,'Auditorías'],[18,'Monitoreo'],[19,'Simulacros']
    ];
    hdA3.forEach(function(x){ _setCelda(hA3, 4, x[0], x[1], 2); });
    for(var m3 = 0; m3 < 12; m3++){
      var r3 = 6 + m3, dm3 = mesesData[m3] || {};
      _setCelda(hA3, r3, 1, MESES_ES[m3], 4);
      _setCelda(hA3, r3, 2, Number(dm3.pets || 0), 5);
      _setCelda(hA3, r3, 3, Number(dm3.iperc || 0), 5);
      _setCelda(hA3, r3, 4, Number(dm3.petar || 0), 5);
      _setCelda(hA3, r3, 5, Number(dm3.ats || 0), 5);
      _setCelda(hA3, r3, 6, Number(dm3.checklist || 0), 5);
      _setCelda(hA3, r3, 8, Number(dm3.inspReal || 0), 5);
      _setCelda(hA3, r3, 9, Number(dm3.inspActos || 0), 5);
      _setCelda(hA3, r3, 10, Number(dm3.inspCond || 0), 5);
      _setCelda(hA3, r3, 11, '', 5, 'SUM(L' + r3 + ':O' + r3 + ')');
      _setCelda(hA3, r3, 12, Number(dm3.ralsFel || 0), 5);
      _setCelda(hA3, r3, 13, Number(dm3.ralsSug || 0), 5);
      _setCelda(hA3, r3, 14, Number(dm3.ralsActos || 0), 5);
      _setCelda(hA3, r3, 15, Number(dm3.ralsCond || 0), 5);
      _setCelda(hA3, r3, 17, Number(dm3.aud || 0), 5);
      _setCelda(hA3, r3, 18, Number(dm3.mon || 0), 5);
      _setCelda(hA3, r3, 19, Number(dm3.sim || 0), 5);
    }
    _setCelda(hA3, 18, 1, 'Total', 6);
    [2,3,4,5,6,8,9,10,11,12,13,14,15,17,18,19].forEach(function(ci){
      var cl3 = _colLetra(ci); _setCelda(hA3, 18, ci, '', 6, 'SUM(' + cl3 + '6:' + cl3 + '17)');
    });

    /* 7. ANX3.1 · Observaciones */
    var hA31 = _nuevaHoja(libro, 'ANX3.1');
    hA31.anchos = { 1:14, 2:22, 3:22, 4:16, 5:38, 6:18, 7:20, 8:32, 9:16, 10:22 };
    _setCelda(hA31, 1, 1, 'ANEXO 3.1 · REGISTRO DE OBSERVACIONES (ACTOS Y CONDICIONES SUBESTÁNDAR)', 1); _merge(hA31, 1, 1, 1, 10);
    ['Fecha de registro','Empresa Reportante','Empresa Observada','Frente','Descripción de la observación','Origen','Tipo','Plan de acción','Fecha de cumplimiento','Autor']
      .forEach(function(hd, ci){ _setCelda(hA31, 4, ci + 1, hd, 2); });
    obsMes.forEach(function(ob, idx){
      var ro = 5 + idx;
      _setCelda(hA31, ro, 1, ob.fecha || '', 5);
      _setCelda(hA31, ro, 2, ob.reportante || emp.nombre || '', 4);
      _setCelda(hA31, ro, 3, ob.observada || emp.nombre || '', 4);
      _setCelda(hA31, ro, 4, ob.frente || 'GENERAL', 5);
      _setCelda(hA31, ro, 5, ob.descripcion || '', 4);
      _setCelda(hA31, ro, 6, ob.origen || 'Inspección Interna', 5);
      _setCelda(hA31, ro, 7, ob.tipo || 'Condición Subestándar', 5);
      _setCelda(hA31, ro, 8, ob.planAccion || '', 4);
      _setCelda(hA31, ro, 9, ob.fechaCumplimiento || '', 5);
      _setCelda(hA31, ro, 10, ob.autor || '', 4);
    });

    /* 8. Gráfica 1 y 2 · Pirámide de Bird */
    var hG12 = _nuevaHoja(libro, 'Gráfica 1 y 2');
    hG12.anchos = { 1:34 };
    for(var gc = 2; gc <= 14; gc++) hG12.anchos[gc] = 10;
    _setCelda(hG12, 1, 1, 'GRÁFICO 1 Y 2 · PIRÁMIDE DE BIRD (' + anio + ')', 1); _merge(hG12, 1, 1, 1, 14);
    _setCelda(hG12, 3, 1, 'Clasificación', 2);
    MESES_ES.forEach(function(mn, i){ _setCelda(hG12, 3, 2 + i, mn.slice(0, 3), 2); });
    _setCelda(hG12, 3, 14, 'Acumulado', 2);
    var birdRows = [
      ['Accidentes Mortales / Graves', function(i){ return 'ANX1!J' + (7 + i); }],
      ['Accidentes con Tiempo Perdido (ATI)', function(i){ return 'ANX1!L' + (7 + i); }],
      ['Accidente Leve / Trabajo Restringido', function(i){ return 'ANX1!AF' + (7 + i) + '+ANX1!AC' + (7 + i); }],
      ['Incidentes / Incidentes Peligrosos', function(i){ return 'ANX1!AG' + (7 + i) + '+ANX1!AH' + (7 + i); }],
      ['Condiciones Subestándar', function(i){ return 'ANX3!J' + (6 + i) + '+ANX3!O' + (6 + i); }],
      ['Actos Subestándar', function(i){ return 'ANX3!I' + (6 + i) + '+ANX3!N' + (6 + i); }]
    ];
    birdRows.forEach(function(br, idx){
      var rb = 4 + idx;
      _setCelda(hG12, rb, 1, br[0], 4);
      for(var i = 0; i < 12; i++) _setCelda(hG12, rb, 2 + i, '', 5, br[1](i));
      _setCelda(hG12, rb, 14, '', 6, 'SUM(B' + rb + ':M' + rb + ')');
    });

    /* 9. Gráfica 3 · Inspecciones realizadas vs planificadas */
    var hG3 = _nuevaHoja(libro, 'Gráfica 3');
    hG3.anchos = { 1:26 };
    for(var g3c = 2; g3c <= 14; g3c++) hG3.anchos[g3c] = 11;
    _setCelda(hG3, 1, 1, 'GRÁFICO 3: INSPECCIONES REALIZADAS VS PLANIFICADAS (' + anio + ')', 1); _merge(hG3, 1, 1, 1, 14);
    _setCelda(hG3, 3, 1, 'Tipo de inspección', 2);
    MESES_ES.forEach(function(mn, i){ _setCelda(hG3, 3, 2 + i, mn.slice(0, 3), 2); });
    _setCelda(hG3, 3, 14, 'Total Año', 2);
    _setCelda(hG3, 4, 1, 'Inspecciones planificadas', 4);
    _setCelda(hG3, 5, 1, 'Inspecciones realizadas', 4);
    _setCelda(hG3, 6, 1, '% Cumplimiento', 6);
    for(var m4 = 0; m4 < 12; m4++){
      var cl4 = _colLetra(2 + m4), dm4 = mesesData[m4] || {};
      _setCelda(hG3, 4, 2 + m4, Number(dm4.inspPlan || 0), 5);
      _setCelda(hG3, 5, 2 + m4, '', 5, 'ANX3!H' + (6 + m4));
      _setCelda(hG3, 6, 2 + m4, '', 8, 'IF(' + cl4 + '4>0,' + cl4 + '5/' + cl4 + '4,0)');
    }
    _setCelda(hG3, 4, 14, '', 6, 'SUM(B4:M4)');
    _setCelda(hG3, 5, 14, '', 6, 'SUM(B5:M5)');
    _setCelda(hG3, 6, 14, '', 8, 'IF(N4>0,N5/N4,0)');

    /* 10. Expositores */
    var hExp = _nuevaHoja(libro, 'Expositores');
    hExp.anchos = { 1:28, 2:28, 3:20 };
    ['Expositor', 'Cargo', 'Frente'].forEach(function(hd, ci){ _setCelda(hExp, 2, ci + 1, hd, 2); });
    expositores.forEach(function(ex, idx){
      _setCelda(hExp, 3 + idx, 1, ex.nombre || '', 4);
      _setCelda(hExp, 3 + idx, 2, ex.cargo || 'Supervisor SST', 4);
      _setCelda(hExp, 3 + idx, 3, ex.frente || 'GENERAL', 5);
    });

    return _compilarXlsxBlob(libro);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     FORMATO 2 · PANEL FOTOGRÁFICO SST (5 HOJAS CON FOTOS REALES INCRUSTADAS)
     ═══════════════════════════════════════════════════════════════════════════ */
  function generarPanelFotograficoXlsx(datos){
    datos = datos || {};
    var emp = datos.empresa || {};
    var area = datos.area || datos.frente || 'OBRA GENERAL';
    var secciones = [
      { key: 'capacitacion',     hoja: 'a. Capacitación',         titulo: 'a. Capacitación (Reunión de inicio de jornada, capacitaciones, pausas activas/dinámicas)' },
      { key: 'control',          hoja: 'b. Control Operacional',  titulo: 'b. Control Operacional (Inspecciones, señalización, delimitación, equipos)' },
      { key: 'emergencia',       hoja: 'c. Emergencia',           titulo: 'c. Preparación y Respuesta a Emergencias (Estaciones de emergencia, extintores, botiquín, simulacros)' },
      { key: 'epp',              hoja: 'd. EPP y EPC',            titulo: 'd. EPP y EPC (Uso de EPP por puesto y protecciones colectivas)' },
      { key: 'bienestar',        hoja: 'e. Bienestar y Difusión', titulo: 'e. Bienestar, Salud Ocupacional y Difusión (Periódico mural, boletines, comedor, orden)' },
      { key: 'ambiente',         hoja: 'f. Medio Ambiente',       titulo: 'f. Medio Ambiente (Batería de residuos NTP 900.058, almacén MATPEL, MSDS, SGA, NFPA, kit antiderrame)' }
    ];

    var fotosPorSeccion = {};
    secciones.forEach(function(s){ fotosPorSeccion[s.key] = []; });

    if(datos.fotos && !Array.isArray(datos.fotos) && typeof datos.fotos === 'object'){
      secciones.forEach(function(s){
        if(Array.isArray(datos.fotos[s.key])) fotosPorSeccion[s.key] = datos.fotos[s.key];
      });
    } else if(Array.isArray(datos.fotos)){
      datos.fotos.forEach(function(f){
        if(!f) return;
        var sk = String(f.secc || f.sec || f.bloque || f.cat || '').toLowerCase();
        var destino = 'capacitacion';
        if(/capacita|charla|induc|dinam/i.test(sk) || sk === 'a') destino = 'capacitacion';
        else if(/inspec|control|sen|delimi|equip/i.test(sk) || sk === 'b') destino = 'control';
        else if(/emerg|extin|botiq|simul/i.test(sk) || sk === 'c') destino = 'emergencia';
        else if(/epp|epc|protec/i.test(sk) || sk === 'd') destino = 'epp';
        else if(/bienest|salud|difus|mural|bolet|comed|orden/i.test(sk) || sk === 'e') destino = 'bienestar';
        else if(/ambien|resid|matpel|msds|sga|nfpa|derrame/i.test(sk) || sk === 'f') destino = 'ambiente';
        fotosPorSeccion[destino].push(f);
      });
    }

    var libro = _crearLibroXlsx();
    var tareas = [];

    secciones.forEach(function(sec){
      var lista = fotosPorSeccion[sec.key] || [];
      var h = _nuevaHoja(libro, sec.hoja);
      h.anchos = { 1:18, 2:18, 3:18, 4:4, 5:18, 6:18, 7:18 };
      h.altos[1] = 24; h.altos[3] = 22; h.altos[5] = 20;
      _setCelda(h, 1, 1, 'EMPRESA: ' + String(emp.nombre || 'EMPRESA').toUpperCase(), 1); _merge(h, 1, 1, 1, 7);
      _setCelda(h, 3, 1, sec.titulo, 7); _merge(h, 3, 1, 3, 7);
      _setCelda(h, 5, 1, 'Área / Frente: ' + area, 4); _merge(h, 5, 1, 5, 7);

      var totalSlots = lista.length > 0 ? (lista.length + (lista.length % 2)) : 2;
      for(var i = 0; i < totalSlots; i += 2){
        var rowImg = 6 + (i / 2) * 2;
        var rowCap = rowImg + 1;
        h.altos[rowImg] = 175;
        h.altos[rowCap] = 24;

        [0, 1].forEach(function(lado){
          var idxFoto = i + lado;
          var cIni = lado === 0 ? 1 : 5;
          var cFin = lado === 0 ? 3 : 7;
          var item = lista[idxFoto];
          _merge(h, rowImg, cIni, rowImg, cFin);
          _merge(h, rowCap, cIni, rowCap, cFin);
          _setCelda(h, rowImg, cIni, item ? '' : '(Sin foto asignada en esta posición)', 5);

          var pieTexto = '';
          if(item){
            pieTexto = String(item.pie || item.titulo || item.desc || item.t || '').trim();
          }
          _setCelda(h, rowCap, cIni, 'Foto ' + (idxFoto + 1) + (pieTexto ? ': ' + pieTexto : ''), 3);

          if(item && item.url){
            tareas.push((function(hojaRef, rImg0, c0, cEnd0, urlFoto){
              return _descargarImagenBytes(urlFoto).then(function(bin){
                if(!bin) return;
                var imgIdx = libro.imagenes.length;
                libro.imagenes.push(bin);
                hojaRef.imgs.push({ imgIdx: imgIdx, c1: c0, r1: rImg0, c2: cEnd0, r2: rImg0 + 1 });
              });
            })(h, rowImg - 1, cIni - 1, cFin, item.url));
          }
        });
      }
    });

    return Promise.all(tareas).then(function(){ return _compilarXlsxBlob(libro); });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     FORMATO 3 · REGISTRO DE TRABAJADORES EN OBRA (29 COLUMNAS · MAYÚSCULAS)
     ═══════════════════════════════════════════════════════════════════════════ */
  function generarRegistroTrabajadoresXlsx(datos){
    datos = datos || {};
    var emp = datos.empresa || {};
    var mesIdx = Math.max(0, Math.min(11, Number(datos.mesIdx != null ? datos.mesIdx : new Date().getMonth())));
    var anio = Number(datos.anio || new Date().getFullYear());
    var trabs = Array.isArray(datos.trabajadores) ? datos.trabajadores : [];
    var libro = _crearLibroXlsx();
    var h = _nuevaHoja(libro, 'Registro de Trabajadores');

    var anchos = [6,26,14,34,28,14,16,15,20,16,15,15,14,16,14,14,13,13,13,13,13,13,13,13,13,13,13,13,26];
    anchos.forEach(function(w, i){ h.anchos[i + 1] = w; });
    h.altos = { 1:28, 7:34 };

    _setCelda(h, 1, 1, 'REGISTRO DE TRABAJADORES EN OBRA', 1); _merge(h, 1, 1, 1, 29);
    _setCelda(h, 2, 1, 'Empresa titular:', 6); _merge(h, 2, 1, 2, 2);
    _setCelda(h, 2, 3, String(emp.nombre || '').toUpperCase(), 4); _merge(h, 2, 3, 2, 7);
    _setCelda(h, 3, 1, 'Responsable del envío:', 6); _merge(h, 3, 1, 3, 2);
    _setCelda(h, 3, 3, String(datos.responsable || '').toUpperCase(), 4); _merge(h, 3, 3, 3, 7);
    _setCelda(h, 4, 1, 'Periodo (Mes):', 6); _merge(h, 4, 1, 4, 2);
    _setCelda(h, 4, 3, (MESES_ES[mesIdx] + ' ' + anio).toUpperCase(), 4); _merge(h, 4, 3, 4, 7);
    _setCelda(h, 4, 8, 'Fecha de actualización:', 6); _merge(h, 4, 8, 4, 10);
    _setCelda(h, 4, 11, datos.fechaActualizacion || new Date().toISOString().slice(0, 10), 5); _merge(h, 4, 11, 4, 13);

    _setCelda(h, 6, 1, 'LA INFORMACIÓN DEBE SER REDACTADA EN MAYÚSCULA', 3); _merge(h, 6, 1, 6, 16);
    _setCelda(h, 6, 17, 'INMUNIZACIONES', 2); _merge(h, 6, 17, 6, 28);

    var cols = [
      'N°','Nombre de la empresa','DNI / CE','Apellidos, nombres','Cargo/puesto de trabajo según EMO',
      'Talla del respirador','Status *','Fecha de último EMO','Restricción','Entrega de resultados de EMO',
      'Fecha de ingreso a Obra','Fecha de retiro de Obra','Fecha EMOR','Lugar de trabajo',
      '¿En seguimiento médico?','¿Está en descanso médico?',
      'INFLUENZA','HEPATITIS B 1RA DOSIS','HEPATITIS B 2DA DOSIS','HEPATITIS B 3RA DOSIS',
      'TÉTANOS 1RA DOSIS','TÉTANOS 2DA DOSIS','TÉTANOS 3RA DOSIS',
      'COVID-19 1RA DOSIS','COVID-19 2DA DOSIS','COVID-19 3RA DOSIS','COVID-19 4TA DOSIS','COVID-19 REFUERZO',
      'Observación'
    ];
    cols.forEach(function(c, i){ _setCelda(h, 7, i + 1, c, 2); });

    var up = function(v){ return String(v == null ? '' : v).trim().toUpperCase(); };
    trabs.forEach(function(t, idx){
      var r = 8 + idx;
      var inm = t.inmunizaciones || {};
      var stRaw = String(t.estatus || 'activo').toLowerCase();
      var status = stRaw === 'cesado' ? 'CESADO' : (stRaw === 'reubicado' ? 'REUBICADO' : 'ACTIVO EN OBRA');
      var fila = [
        idx + 1,
        up(t.empresaNombre || emp.nombre || ''),
        up(t.dni || ''),
        up(t.nombre || ''),
        up(t.puesto || ''),
        up(t.talla_respirador || ''),
        status,
        up(t.fecha_emo || ''),
        up(t.restriccion_emo || 'NINGUNA'),
        up(t.entrega_emo || 'SI'),
        up(t.fecha_ingreso || ''),
        up(t.fecha_retiro || ''),
        up(t.fecha_emor || ''),
        up(t.area || t.proyecto || ''),
        up(t.seguimiento_med || 'NO'),
        up(t.descanso_med || 'NO'),
        up(inm.influenza || ''),
        up(inm.hepB1 || ''), up(inm.hepB2 || ''), up(inm.hepB3 || ''),
        up(inm.tetanos1 || ''), up(inm.tetanos2 || ''), up(inm.tetanos3 || ''),
        up(inm.covid1 || ''), up(inm.covid2 || ''), up(inm.covid3 || ''), up(inm.covid4 || ''), up(inm.covidRef || ''),
        up(t.observacion_reg || '')
      ];
      fila.forEach(function(val, ci){ _setCelda(h, r, ci + 1, val, ci === 0 || ci === 2 || ci === 6 ? 5 : 4); });
    });

    return _compilarXlsxBlob(libro);
  }

  window.OBRASST_FORMATOS_INFORME = {
    TIPOS_CHARLA_OFICIAL: TIPOS_CHARLA_OFICIAL,
    mapearTipoCharla: mapearTipoCharla,
    generarEstadisticaSSTXlsx: generarEstadisticaSSTXlsx,
    generarPanelFotograficoXlsx: generarPanelFotograficoXlsx,
    generarRegistroTrabajadoresXlsx: generarRegistroTrabajadoresXlsx
  };
})();
