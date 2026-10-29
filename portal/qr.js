/* OBRASST · el generador de QR de la app (qrcode-generator de Kazuhiko Arase,
   licencia MIT, abajo), la dirección de los carteles y su dibujo, para el
   portal. Lo arma armar.py desde la app. No editar. */
var BASE_QR_APP = 'https://descarganomaspe.github.io/sst-capacita/d/';
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));
;
/* ══════════════════════════════════════════════════════════════════
   LOS CARTELES QR DE LOS DOCUMENTOS · EL DIBUJO (01/10/2026)
   Marcelo: «mejora el diseño de dichos QR de documentos… que salga el
   logo de la empresa también, que no salga pequeño o muy grande, el QR
   también, y su título correspondiente, con algunos diseños».
   Una hoja A4 vertical (1240 × 1754 px, 150 ppp), en tres diseños, con:
     · el logo de la empresa dentro de una caja fija (hasta 520 × 170 px:
       unos 8 × 2,6 cm impreso), sin su marco blanco y sin deformarlo, así
       sea chico o enorme el que se subió; sin logo, la razón social;
     · el título del cartel y, en el Perú, su nombre completo;
     · el QR de 640 px (unos 10 cm impreso), dibujado módulo por módulo
       para que salga nítido, con su margen blanco;
     · «Escanea con la cámara de tu celular» y la obra.
   El mismo dibujo en la app y en el portal: armar.py lo pone en la app y
   lo suma a portal/qr.js. Necesita qrcode() al dibujar.
   ══════════════════════════════════════════════════════════════════ */
var CARTEL_W = 1240, CARTEL_H = 1754;
var CARTEL_DISENOS = [
  {k:'clasico', n:'Clásico', d:'Blanco y sobrio, con el título en una franja oscura.'},
  {k:'senal',   n:'Señal',   d:'Como las señales de seguridad: azul para los documentos, verde para las emergencias.'},
  {k:'obra',    n:'Obra',    d:'Amarillo y negro, de alta visibilidad: se ve de lejos.'},
  /* 14/10/2026 · Marcelo, con la foto del «buzón virtual» de otra obra: «para que no sea solamente un QR vacío»:
     el cartel dice qué es y cómo se usa, en A4 vertical u horizontal (la orientación va en el mismo valor:
     «explica» o «explica-h»; una app de antes lee «explica-h» como el primero, el clásico) */
  {k:'explica', n:'Explicado', d:'Dice qué es y cómo se usa, en tres pasos. En A4 vertical u horizontal.'}
];
/* el nombre completo de cada cartel (en el Perú; afuera va solo el título) */
var CARTEL_LARGO = {
  risst:'Reglamento Interno de Seguridad y Salud en el Trabajo',
  pets:'Procedimientos Escritos de Trabajo Seguro',
  iperc:'Identificación de Peligros, Evaluación de Riesgos y Controles',
  msds:'Hojas de datos de seguridad de los productos químicos',
  plan:'Programa anual de seguridad y salud en el trabajo',
  objetivos:'Objetivos y metas de seguridad y salud en el trabajo',
  mapa:'Los peligros y riesgos de la obra, señalizados',
  emergencia:'Qué hacer y a dónde ir en una emergencia',
  politica:'Política de Seguridad y Salud en el Trabajo',
  hostigamiento:'Prevención y sanción del hostigamiento sexual',
  organigrama:'Quién es quién en la obra',
  comite:'Comité de Seguridad y Salud en el Trabajo',
  brigadistas:'Las brigadas de emergencia de la obra',
  contactos:'Los teléfonos para llamar en una emergencia',
  /* 14/10/2026 · el periódico mural (mural.js): todos los carteles en uno */
  mural:'Los documentos de la obra, en un solo lugar',
  /* 14/10/2026 · el tareo con el celular de cada uno (tareo-cel.js): el cartel de la puerta */
  tareo:'Con tu celular, al llegar y al irte'
};
var CARTEL_VERDE = { emergencia:1, brigadistas:1, contactos:1 };
/* 14/10/2026 · el buzón de sugerencias y denuncias (su QR abre la página b/, no un documento) */
var CARTEL_VIOLETA = { buzon:1 };
/* 14/10/2026 · el periódico mural (su QR abre la página m/: la pizarra con los archivos de los carteles) */
var CARTEL_TURQUESA = { mural:1 };
/* 14/10/2026 · el tareo (su QR se lee desde la app, con la ubicación: solo vale en la puerta) */
var CARTEL_NARANJA = { tareo:1 };
/* qué es cada cartel, para el diseño «Explicado» (sin citar normas: dice para qué sirve) */
var CARTEL_QUE = {
  risst:'Las reglas de seguridad de la obra: tus derechos, tus obligaciones y lo que no está permitido.',
  pets:'Los pasos para hacer cada trabajo de riesgo de forma segura.',
  iperc:'Los peligros de cada tarea, qué tan riesgosos son y cómo se controlan.',
  msds:'Los peligros de cada producto químico de la obra, cómo usarlo y qué hacer si hay un derrame o te salpica.',
  plan:'Lo que la obra hará este año por tu seguridad y tu salud: capacitaciones, inspecciones y simulacros.',
  objetivos:'Las metas de seguridad y salud de este año y cómo se miden.',
  mapa:'Dónde están los peligros de la obra y cómo están señalizados.',
  emergencia:'Qué hacer y a dónde ir si hay un sismo, un incendio o un accidente.',
  politica:'El compromiso de la empresa con tu seguridad y tu salud.',
  hostigamiento:'Cómo se previene y se sanciona el hostigamiento sexual, y a quién acudir.',
  organigrama:'Quién es quién en la obra y a quién reportarle.',
  comite:'Quiénes velan por la seguridad y la salud de todos en la obra, y cómo buscarlos.',
  brigadistas:'Quiénes te ayudan en una emergencia: primeros auxilios, incendios y evacuación.',
  contactos:'A quién llamar en una emergencia: bomberos, ambulancia, policía y la obra.',
  buzon:'Para sugerir una mejora, dar una queja o hacer una denuncia. Llega a la obra sin tu nombre.',
  mural:'Los documentos de la obra en un solo lugar: la política, el reglamento, los procedimientos y lo que publique tu supervisor.',
  tareo:'Para marcar tu entrada y tu salida con tu celular. Tus horas salen solas, sin depender de nadie.',
  _propio:'Un documento de la obra. Escanéalo para ver siempre la versión vigente.'
};
var CARTEL_PASOS = {
  doc:['Abre OBRASST y toca «Escanear QR»', 'Apunta al código QR', 'Se abre de frente: el documento o su carpeta'],
  buzon:['Abre la cámara de tu celular', 'Apunta al código QR', 'Toca el enlace y escríbelo'],
  mural:['Abre la cámara de tu celular', 'Apunta al código QR', 'Toca el enlace y mira el mural'],
  tareo:['Abre OBRASST y toca «Marcar entrada o salida»', 'Apunta al código QR', 'Deja que vea tu ubicación']
};
/* lo que va debajo del QR */
var CARTEL_PIE = { doc:'Siempre abre la versión vigente.', buzon:'Llega a la obra sin tu nombre.', mural:'Siempre con lo vigente.', tareo:'Solo vale junto a la puerta.' };
function cartelDiseno(k){ var b=String(k||'').replace(/-h$/, ''), r=CARTEL_DISENOS[0]; CARTEL_DISENOS.forEach(function(d){ if(d.k===b) r=d; }); return r; }
/* solo el «Explicado» tiene versión horizontal */
function cartelHorizontal(k){ return String(k||'') === 'explica-h'; }
function cartelValorDiseno(k, horizontal){ var d=cartelDiseno(k).k; return (d==='explica' && horizontal) ? 'explica-h' : d; }
function cartelColor(hoja){ return CARTEL_VIOLETA[hoja] ? '#6A3FB5' : (CARTEL_TURQUESA[hoja] ? '#0E7C86' : (CARTEL_NARANJA[hoja] ? '#B4540A' : (CARTEL_VERDE[hoja] ? '#1B7F3B' : '#1554B3'))); }

/* ── lo de siempre ── */
function _cqCaja(g, x, y, w, h, r){
  g.beginPath(); g.moveTo(x+r, y); g.lineTo(x+w-r, y); g.quadraticCurveTo(x+w, y, x+w, y+r);
  g.lineTo(x+w, y+h-r); g.quadraticCurveTo(x+w, y+h, x+w-r, y+h); g.lineTo(x+r, y+h);
  g.quadraticCurveTo(x, y+h, x, y+h-r); g.lineTo(x, y+r); g.quadraticCurveTo(x, y, x+r, y); g.closePath();
}
function _cqLineas(g, txt, ancho){
  var pal=String(txt||'').split(/\s+/), lin=[], act='';
  pal.forEach(function(p){ if(!p) return; var t=act ? act+' '+p : p; if(g.measureText(t).width > ancho && act){ lin.push(act); act=p; } else act=t; });
  if(act) lin.push(act);
  return lin;
}
/* el tamaño de letra más grande con el que el texto entra en «maxL» líneas;
   si ni con la letra más chica entra, una línea más; y si tampoco, se corta con «…».
   07/10/2026 · «piso» (solo el título): los carteles propios llevan el título que escribe la obra,
   hasta 80 letras; antes de cortarlo, la letra baja un poco más, hasta ese piso. */
function _cqAjustar(g, txt, ancho, maxL, grande, chico, peso, piso){
  var fam=' system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
  for(var extra=0; extra<2; extra++){
    for(var s=grande; s>=chico; s-=2){
      g.font=(peso||'800')+' '+s+'px'+fam;
      var l=_cqLineas(g, txt, ancho);
      if(l.length<=maxL+extra && l.every(function(x){ return g.measureText(x).width<=ancho; })) return {s:s, l:l};
    }
  }
  if(piso && piso<chico){
    for(var s3=chico-2; s3>=piso; s3-=2){
      g.font=(peso||'800')+' '+s3+'px'+fam;
      var l3=_cqLineas(g, txt, ancho);
      if(l3.length<=maxL+1 && l3.every(function(x){ return g.measureText(x).width<=ancho; })) return {s:s3, l:l3};
    }
  }
  g.font=(peso||'800')+' '+chico+'px'+fam;
  var l2=_cqLineas(g, txt, ancho), n=maxL+1;
  if(l2.length>n){ l2=l2.slice(0, n); var u=l2[n-1]; while(u.length>1 && g.measureText(u+'…').width>ancho) u=u.slice(0, -1); l2[n-1]=u.replace(/\s+$/, '')+'…'; }
  return {s:chico, l:l2};
}
function _cqTexto(g, lineas, x, y, s, alto, color){
  g.fillStyle=color; g.textAlign='center'; g.textBaseline='alphabetic';
  lineas.forEach(function(l, i){ g.fillText(l, x, y + i*alto); });
  return y + (lineas.length-1)*alto;
}
function _cqFuente(s, peso){ return (peso||'700')+' '+s+'px system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif'; }
/* el QR, módulo por módulo (nítido a cualquier tamaño), con su margen blanco */
function _cqQR(g, enlace, cx, top, lado){
  var qr=qrcode(0, 'M'); qr.addData(enlace); qr.make();
  var n=qr.getModuleCount(), m=Math.floor(lado/(n+8)), q=m*(n+8), x0=Math.round(cx-q/2), y0=top+Math.round((lado-q)/2);
  g.fillStyle='#ffffff'; g.fillRect(x0, y0, q, q);
  g.fillStyle='#000000';
  for(var r=0;r<n;r++) for(var c=0;c<n;c++) if(qr.isDark(r, c)) g.fillRect(x0+(c+4)*m, y0+(r+4)*m, m, m);
  return {x:x0, y:y0, lado:q};
}
/* las esquinas que enmarcan el QR */
function _cqEsquinas(g, x, y, w, h, largo, grueso, color){
  g.strokeStyle=color; g.lineWidth=grueso; g.lineCap='round';
  [[x, y, 1, 1], [x+w, y, -1, 1], [x, y+h, 1, -1], [x+w, y+h, -1, -1]].forEach(function(p){
    g.beginPath(); g.moveTo(p[0], p[1]+p[3]*largo); g.lineTo(p[0], p[1]); g.lineTo(p[0]+p[2]*largo, p[1]); g.stroke();
  });
}
/* un documento, dibujado (no un emoji: sale igual en todos los celulares) */
function _cqIconoDoc(g, cx, cy, s, color){
  var w=s*0.72, h=s, x=cx-w/2, y=cy-h/2, d=s*0.24;
  g.fillStyle=color; g.beginPath(); g.moveTo(x, y); g.lineTo(x+w-d, y); g.lineTo(x+w, y+d); g.lineTo(x+w, y+h); g.lineTo(x, y+h); g.closePath(); g.fill();
  g.fillStyle='rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(x+w-d, y); g.lineTo(x+w-d, y+d); g.lineTo(x+w, y+d); g.closePath(); g.fill();
  g.fillStyle='#ffffff';
  for(var i=0;i<4;i++){ var ly=y+h*0.42+i*h*0.13; g.fillRect(x+w*0.18, ly, w*(i===3 ? 0.4 : 0.64), h*0.05); }
}
/* un celular */
function _cqIconoCel(g, cx, cy, s, color){
  var w=s*0.56, h=s, x=cx-w/2, y=cy-h/2;
  g.fillStyle=color; _cqCaja(g, x, y, w, h, s*0.1); g.fill();
  g.fillStyle='#ffffff'; _cqCaja(g, x+s*0.06, y+s*0.12, w-s*0.12, h-s*0.26, s*0.03); g.fill();
  g.fillStyle=color; var q=s*0.09, qx=cx-q*1.5, qy=cy-q*1.2;
  [[0,0],[2,0],[0,2],[1,1],[2,2]].forEach(function(p){ g.fillRect(qx+p[0]*q, qy+p[1]*q, q*0.9, q*0.9); });
}
/* 14/10/2026 · un QR chiquito (los tres cuadros de las esquinas y unos puntos), un globo de diálogo y el número de un paso */
function _cqIconoQR(g, cx, cy, s, color){
  var m=s/7, x0=cx-s/2, y0=cy-s/2;
  function ojo(x, y){ g.fillStyle=color; g.fillRect(x, y, m*3, m*3); g.fillStyle='#ffffff'; g.fillRect(x+m*0.7, y+m*0.7, m*1.6, m*1.6); g.fillStyle=color; g.fillRect(x+m*1.1, y+m*1.1, m*0.8, m*0.8); }
  ojo(x0, y0); ojo(x0+m*4, y0); ojo(x0, y0+m*4);
  g.fillStyle=color;
  [[4,4],[5.5,4],[4,5.5],[5.5,5.5],[4.75,4.75]].forEach(function(p){ g.fillRect(x0+p[0]*m, y0+p[1]*m, m*0.9, m*0.9); });
}
function _cqIconoBuzon(g, cx, cy, s, color){
  var w=s, h=s*0.72, x=cx-w/2, y=cy-s/2;
  g.fillStyle=color; _cqCaja(g, x, y, w, h, s*0.16); g.fill();
  g.beginPath(); g.moveTo(x+w*0.22, y+h-1); g.lineTo(x+w*0.18, y+s); g.lineTo(x+w*0.46, y+h-1); g.closePath(); g.fill();
  g.fillStyle='#ffffff';
  for(var i=0;i<3;i++) g.fillRect(x+w*0.18, y+h*0.24+i*h*0.2, w*(i===2 ? 0.38 : 0.64), h*0.09);
}
/* una pizarra con tres hojas clavadas */
function _cqIconoMural(g, cx, cy, s, color){
  var w=s, h=s*0.72, x=cx-w/2, y=cy-h/2;
  g.fillStyle=color; _cqCaja(g, x, y, w, h, s*0.06); g.fill();
  g.fillStyle='#ffffff'; _cqCaja(g, x+s*0.06, y+s*0.06, w-s*0.12, h-s*0.12, s*0.03); g.fill();
  g.fillStyle=color;
  [[0.12,0.14,0.22,0.3],[0.39,0.12,0.22,0.36],[0.66,0.16,0.22,0.26]].forEach(function(p){ g.fillRect(x+w*p[0], y+h*p[1], w*p[2], h*p[3]); });
  g.fillRect(x+w*0.2, y+h, w*0.06, s*0.2); g.fillRect(x+w*0.74, y+h, w*0.06, s*0.2);
}
/* el reloj del tareo y la ubicación (14/10/2026) */
function _cqIconoReloj(g, cx, cy, s, color){
  var r=s*0.46;
  g.fillStyle=color; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI*2); g.fill();
  g.fillStyle='#ffffff'; g.beginPath(); g.arc(cx, cy, r*0.8, 0, Math.PI*2); g.fill();
  g.strokeStyle=color; g.lineCap='round'; g.lineWidth=Math.max(3, s*0.08);
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy-r*0.55); g.stroke();
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx+r*0.42, cy+r*0.12); g.stroke();
  g.lineCap='butt';
  g.fillStyle=color; for(var i=0; i<12; i++){ var a=i*Math.PI/6; g.beginPath(); g.arc(cx+Math.sin(a)*r*0.66, cy-Math.cos(a)*r*0.66, Math.max(1.5, s*0.025), 0, Math.PI*2); g.fill(); }
}
function _cqIconoUbic(g, cx, cy, s, color){
  var r=s*0.3, top=cy-s*0.42;
  g.fillStyle=color; g.beginPath(); g.arc(cx, top+r, r, Math.PI, 0); g.lineTo(cx, cy+s*0.42); g.closePath(); g.fill();
  g.fillStyle='#ffffff'; g.beginPath(); g.arc(cx, top+r, r*0.42, 0, Math.PI*2); g.fill();
}
function _cqNum(g, cx, cy, r, n, color){
  g.fillStyle=color; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI*2); g.fill();
  g.lineWidth=Math.max(3, r*0.14); g.strokeStyle='#ffffff'; g.stroke();
  g.fillStyle='#ffffff'; g.font=_cqFuente(Math.round(r*1.15), '900'); g.textAlign='center'; g.textBaseline='middle';
  g.fillText(String(n), cx, cy+r*0.04); g.textBaseline='alphabetic';
}
/* el rótulo de una sección: una barrita de color y el texto en mayúsculas, separado */
function _cqRotulo(g, x, y, txt, color, s){
  s=s||26; g.fillStyle=color; _cqCaja(g, x, y-s*0.82, 10, s*0.95, 4); g.fill();
  g.font=_cqFuente(s, '900'); g.textAlign='left'; g.fillStyle=color;
  try{ g.letterSpacing=Math.round(s*0.12)+'px'; }catch(e){}
  g.fillText(String(txt).toUpperCase(), x+26, y);
  try{ g.letterSpacing='0px'; }catch(e){}
}
function _cqTextoIzq(g, lineas, x, y, alto, color){
  g.fillStyle=color; g.textAlign='left'; g.textBaseline='alphabetic';
  lineas.forEach(function(l, i){ g.fillText(l, x, y + i*alto); });
  return y + (lineas.length-1)*alto;
}
/* la cinta de peligro (amarillo y negro) */
function _cqFranjas(g, x, y, w, h){
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle='#F5C400'; g.fillRect(x, y, w, h);
  g.fillStyle='#1A1A1A'; var p=h*1.1;
  for(var i=-2; i*p < w+h; i++){ g.beginPath(); g.moveTo(x+i*p, y+h); g.lineTo(x+i*p+p/2, y+h); g.lineTo(x+i*p+p/2+h, y); g.lineTo(x+i*p+h, y); g.closePath(); g.fill(); }
  g.restore();
}
/* el logo sin su marco blanco (una vez por logo), para que salga del tamaño de su caja */
var _CQ_LOGO = {};
function cartelLogo(du){
  if(!du) return Promise.resolve(null);
  var k=String(du).length+':'+String(du).slice(-40);
  if(_CQ_LOGO[k]) return _CQ_LOGO[k];
  _CQ_LOGO[k]=new Promise(function(ok){
    var im=new Image();
    im.onload=function(){
      var w=im.naturalWidth||im.width, h=im.naturalHeight||im.height, r={im:im, sx:0, sy:0, sw:w, sh:h};
      try{
        var c=document.createElement('canvas'); c.width=w; c.height=h;
        var g=c.getContext('2d'); g.drawImage(im, 0, 0);
        var d=g.getImageData(0, 0, w, h).data, x0=w, y0=h, x1=-1, y1=-1;
        for(var y=0;y<h;y++) for(var x=0;x<w;x++){
          var i=(y*w+x)*4;
          if(d[i+3]<24) continue;
          if(d[i]>234 && d[i+1]>234 && d[i+2]>234) continue;
          if(x<x0) x0=x; if(x>x1) x1=x; if(y<y0) y0=y; if(y>y1) y1=y;
        }
        if(x1>=0){ r={im:im, sx:x0, sy:y0, sw:x1-x0+1, sh:y1-y0+1}; }
      }catch(e){}
      ok(r);
    };
    im.onerror=function(){ ok(null); };
    im.src=du;
  });
  return _CQ_LOGO[k];
}
/* el logo dentro de su caja, centrado y con su proporción; sin logo, el nombre */
function _cqLogo(g, L, cx, top, cw, ch, nombre, color){
  if(L && L.im){
    var r=L.sw/L.sh, w=cw, h=cw/r;
    if(h>ch){ h=ch; w=ch*r; }
    g.drawImage(L.im, L.sx, L.sy, L.sw, L.sh, Math.round(cx-w/2), Math.round(top+(ch-h)/2), Math.round(w), Math.round(h));
    return true;
  }
  if(!nombre) return false;
  var f=_cqAjustar(g, nombre, cw, 2, 64, 36, '800');
  var alto=f.s*1.12, y0=top+ch/2-((f.l.length-1)*alto)/2+f.s*0.35;
  _cqTexto(g, f.l, cx, y0, f.s, alto, color);
  return false;
}

/* «Escanea…» con el celular a la izquierda, el grupo centrado y sin salirse */
function _cqEscanea(g, cy, t1, t2, color, gris){
  var f=_cqAjustar(g, t1, CARTEL_W-300, 1, 46, 30, '800'), s=f.s;
  g.font=_cqFuente(s, '800'); var tw=g.measureText(f.l[0]||'').width, ic=s*1.55, gap=s*0.55, tot=ic*0.56+gap+tw, x0=CARTEL_W/2-tot/2;
  _cqIconoCel(g, x0+ic*0.28, cy-s*0.36, ic, color);
  g.textAlign='left'; g.fillStyle=color; g.fillText(f.l[0]||'', x0+ic*0.56+gap, cy);
  var f2=_cqAjustar(g, t2, CARTEL_W-240, 1, 30, 22, '500');
  _cqTexto(g, f2.l, CARTEL_W/2, cy+s*0.5+f2.s+12, f2.s, 0, gris);
  return cy+s*0.5+f2.s+12;
}
/* el primer renglón de un bloque de «n» líneas, centrado en una franja */
function _cqBase(n, s, lh, top, alto){ var bloque=(n-1)*lh+s*0.74; return top+(alto-bloque)/2+s*0.74; }

/* ══ EL «EXPLICADO» (14/10/2026) ═══════════════════════════════════
   El logo, el título en su franja, «¿Qué es?» en una o dos frases, y
   «¿Cómo se usa?»: tres pasos dibujados al lado del QR, que sale de unos
   9 cm (vertical) u 8 cm (horizontal). Abajo, la obra. El color va por
   familia: azul los documentos, verde las emergencias, violeta el buzón. */
function _cqExplica(g, o, L, W, H, hz, tx){
  var C=cartelColor(o.hoja), OSC='#0B2A3A', GRIS='#4A5A66', esBuzon=(o.hoja==='buzon'), esMural=(o.hoja==='mural'), esTareo=(o.hoja==='tareo');
  var titulo=String(o.titulo||'Documento'), largo=o.largo ? String(tx(o.largo)||o.largo) : '';
  var que=String(tx(o.que || CARTEL_QUE[o.hoja] || CARTEL_QUE._propio));
  var pasos=(esBuzon ? CARTEL_PASOS.buzon : (esMural ? CARTEL_PASOS.mural : (esTareo ? CARTEL_PASOS.tareo : CARTEL_PASOS.doc))).map(function(t){ return String(tx(t)); });
  /* el mural «solo para su gente» (Prevencionista, Supervisor SST, o la obra lo eligió): se abre con la cuenta de la app */
  var pie1=String(tx(esBuzon ? CARTEL_PIE.buzon : (esMural ? CARTEL_PIE.mural : (esTareo ? CARTEL_PIE.tareo : CARTEL_PIE.doc))));
  /* el tareo se marca desde la app, con la cuenta del trabajador */
  var pie2=String(tx(esTareo ? 'Con tu cuenta de trabajador en OBRASST.' : ((esMural && o.privado) ? 'Solo para el personal de la obra, con su cuenta.'
    : ((esBuzon || esMural) ? 'No necesitas instalar nada.' : 'Sin OBRASST, con la cámara del celular.'))));
  var empresa=String(o.empresa||''), obra=String(o.obra||''), marca=empresa || obra;
  var rQue=tx('¿Qué es?'), rUso=tx('¿Cómo se usa?');
  g.fillStyle='#ffffff'; g.fillRect(0, 0, W, H);
  g.fillStyle=C; g.fillRect(0, 0, W, 20);
  function icono(i, cx, cy, s){
    if(i===0) _cqIconoCel(g, cx, cy, s, OSC);
    else if(i===1) _cqIconoQR(g, cx, cy, s*0.74, OSC);
    else if(esBuzon) _cqIconoBuzon(g, cx, cy, s*0.84, OSC);
    else if(esMural) _cqIconoMural(g, cx, cy, s*0.9, OSC);
    else if(esTareo) _cqIconoUbic(g, cx, cy, s*0.9, OSC);
    else _cqIconoDoc(g, cx, cy, s*0.9, OSC);
  }
  /* ── arriba: el logo y la franja con el título ── */
  var X=hz ? 70 : 80, AN=W-2*X, by, ft;
  if(!hz){ _cqLogo(g, L, W/2, 46, 520, 156, marca, OSC); by=224; ft=_cqAjustar(g, titulo.toUpperCase(), AN, 2, 82, 54, '900', 40); }
  else { _cqLogo(g, L, X+230, 36, 460, 118, marca, OSC); by=172; ft=_cqAjustar(g, titulo.toUpperCase(), AN, 2, 76, 50, '900', 38); }
  var lht=ft.s*1.06, fl=largo ? _cqAjustar(g, largo, AN, 2, hz ? 30 : 32, 22, '600') : null, lhl=fl ? fl.s*1.22 : 0;
  var bh=44 + (ft.l.length-1)*lht + ft.s*0.74 + (fl ? 18 + fl.s*0.74 + (fl.l.length-1)*lhl : 0) + 42;
  g.fillStyle=C; g.fillRect(0, by, W, bh);
  g.font=_cqFuente(ft.s, '900');
  var yt=hz ? _cqTextoIzq(g, ft.l, X, by + 44 + ft.s*0.74, lht, '#ffffff') : _cqTexto(g, ft.l, W/2, by + 44 + ft.s*0.74, ft.s, lht, '#ffffff');
  if(fl){
    g.font=_cqFuente(fl.s, '600');
    if(hz) _cqTextoIzq(g, fl.l, X, yt + 18 + fl.s*0.74 + 4, lhl, 'rgba(255,255,255,.93)');
    else _cqTexto(g, fl.l, W/2, yt + 18 + fl.s*0.74 + 4, fl.s, lhl, 'rgba(255,255,255,.93)');
  }
  var be=by + bh, pieY=H - (hz ? 84 : 104), pad=26;
  /* ── el cuerpo: se mide primero y después se reparte el aire que sobra ── */
  var QR, qrBox, colW, anQ;
  if(hz){ QR=Math.max(400, Math.min(560, pieY - 92 - (be + 40) - 2*pad)); qrBox=QR + 2*pad; colW=W - X - qrBox - X - 64; anQ=colW; }
  else { QR=Math.max(420, Math.min(600, Math.round(AN*0.58) - 2*pad)); qrBox=QR + 2*pad; colW=AN - qrBox - 40; anQ=AN; }
  var fq=_cqAjustar(g, que, anQ, 3, hz ? 34 : 40, 26, '600'), lhq=fq.s*1.28;
  var ic=hz ? 84 : 86, sep=hz ? 40 : 30, tw=colW - ic - sep - 6, fp=null;
  pasos.forEach(function(t){ var f=_cqAjustar(g, t, tw, hz ? 2 : 3, hz ? 32 : 32, 22, '700'); if(fp===null || f.s<fp) fp=f.s; });
  g.font=_cqFuente(fp, '700');
  var filas=pasos.map(function(t){ return _cqLineas(g, t, tw).slice(0, 4); });
  var altoFila=function(l){ return Math.max(ic + 18, (l.length-1)*fp*1.22 + fp*0.74 + 24); };
  var sumaF=0; filas.forEach(function(l){ sumaF+=altoFila(l); });
  var rot=hz ? 24 : 26, hQue=rot + 20 + fq.s*0.92 + (fq.l.length-1)*lhq;
  var cap=hz ? 46 : 50, hCap=cap + 30 + 34;
  var hPasosMin=sumaF + 2*16;
  var y0=be + (hz ? 40 : 52), g1=hz ? 0 : 10, g2=hz ? 58 : 62;
  var aire=0;
  if(!hz){
    var cuerpo=g1 + hQue + g2 + rot + 30 + Math.max(qrBox, hPasosMin) + hCap;
    aire=Math.max(0, pieY - 36 - y0 - cuerpo);
    /* con aire, la letra de «qué es» y los pasos pueden crecer un poco, y el resto se reparte */
    g1+=aire*0.25; g2+=aire*0.25;
  }
  /* «¿Qué es?» */
  var y=y0 + g1 + (hz ? 26 : 0) + rot*0.8;
  _cqRotulo(g, X, y, rQue, C, rot);
  g.font=_cqFuente(fq.s, '600');
  y=_cqTextoIzq(g, fq.l, X, y + 20 + fq.s*0.92, lhq, OSC);
  y+=g2;
  _cqRotulo(g, X, y, rUso, C, rot);
  var area=y + 30 + (hz ? 0 : aire*0.25);
  var qrX=W - X - qrBox, qrY=hz ? y0 : area;
  /* los tres pasos, uno debajo del otro, a la izquierda del QR */
  var finPasos=hz ? (pieY - 40) : (qrY + qrBox), iniPasos=hz ? area : qrY;
  var gap=Math.max(14, Math.min(hz ? 46 : 60, (finPasos - iniPasos - sumaF)/2));
  var fy=iniPasos + Math.max(0, (finPasos - iniPasos - sumaF - 2*gap)/2);
  filas.forEach(function(l, i){
    var hfila=altoFila(l), cy=fy + hfila/2, cx=X + ic/2 + 6;
    g.fillStyle='#EEF3F8'; g.beginPath(); g.arc(cx, cy, ic*0.62, 0, Math.PI*2); g.fill();
    icono(i, cx, cy, ic*0.86);
    _cqNum(g, cx - ic*0.52, cy - ic*0.46, hz ? 21 : 24, i + 1, C);
    g.font=_cqFuente(fp, '700');
    _cqTextoIzq(g, l, X + ic + sep, cy - ((l.length-1)*fp*1.22)/2 + fp*0.36, fp*1.22, OSC);
    fy+=hfila + gap;
  });
  /* el QR con su marco del color del cartel, y lo que dice debajo */
  g.fillStyle='#ffffff'; _cqCaja(g, qrX, qrY, qrBox, qrBox, 24); g.fill();
  g.lineWidth=10; g.strokeStyle=C; _cqCaja(g, qrX, qrY, qrBox, qrBox, 24); g.stroke();
  _cqQR(g, o.enlace, qrX + qrBox/2, qrY + pad, QR);
  var qcx=qrX + qrBox/2, yc=qrY + qrBox + cap;
  var f1=_cqAjustar(g, pie1, qrBox + (hz ? 40 : 20), 1, hz ? 28 : 30, 20, '800'); g.font=_cqFuente(f1.s, '800'); _cqTexto(g, f1.l, qcx, yc, f1.s, 0, C);
  var f2=_cqAjustar(g, pie2, qrBox + (hz ? 40 : 20), 1, hz ? 24 : 26, 18, '600'); g.font=_cqFuente(f2.s, '600'); _cqTexto(g, f2.l, qcx, yc + f1.s*0.5 + f2.s + 8, f2.s, 0, GRIS);
  /* el pie: la obra y la marca */
  g.fillStyle=C; g.fillRect(0, pieY, W, H - pieY);
  var fo=_cqAjustar(g, obra, hz ? W - 520 : W - 260, 1, hz ? 34 : 38, 22, '700'); g.font=_cqFuente(fo.s, '700');
  if(hz){
    _cqTextoIzq(g, fo.l, X, pieY + (H - pieY)/2 + fo.s*0.36, 0, '#ffffff');
    g.font=_cqFuente(22, '800'); g.fillStyle='rgba(255,255,255,.85)'; g.textAlign='right'; g.fillText('◆ OBRASST', W - X, pieY + (H - pieY)/2 + 8);
  } else {
    _cqTexto(g, fo.l, W/2, pieY + 52, fo.s, 0, '#ffffff');
    g.font=_cqFuente(20, '800'); g.fillStyle='rgba(255,255,255,.82)'; g.textAlign='center'; g.fillText('◆ OBRASST', W/2, pieY + 86);
  }
}
/* ══ EL CARTEL ══
   o: { diseno, hoja, titulo, largo, enlace, empresa (razón social), obra,
        logo (data URL o nada), tx (traducir, si hay), que (qué es, si no
        es el de siempre) }
   Devuelve una promesa con el lienzo, su PNG y su tamaño (w, h,
   horizontal: el «Explicado» puede ir apaisado). */
function cartelDibujar(o){
  o=o||{};
  var tx=o.tx||function(z){ return z; };
  return cartelLogo(o.logo).then(function(L){
    var dis=cartelDiseno(o.diseno).k, hz=(dis==='explica' && cartelHorizontal(o.diseno));
    var cv=document.createElement('canvas'); cv.width=hz ? CARTEL_H : CARTEL_W; cv.height=hz ? CARTEL_W : CARTEL_H;
    var g=cv.getContext('2d'), W=CARTEL_W, H=CARTEL_H, cx=W/2;
    if(dis==='explica'){
      _cqExplica(g, o, L, cv.width, cv.height, hz, tx);
      return { canvas:cv, png:cv.toDataURL('image/png'), w:cv.width, h:cv.height, horizontal:hz };
    }
    var titulo=String(o.titulo||'Documento'), largo=o.largo ? String(tx(o.largo)||o.largo) : '';
    /* 28/10/2026 · el de un documento se escanea desde OBRASST («Escanear QR»): entra de frente a su carpeta; con la cámara también abre */
    var esDoc=!(o.hoja==='tareo' || o.hoja==='buzon' || o.hoja==='mural');
    var t1=tx(o.hoja==='tareo' ? 'Escanéalo desde OBRASST: «Marcar entrada o salida»' : (esDoc ? 'Escanéalo desde OBRASST: «Escanear QR»' : 'Escanea con la cámara de tu celular')),
        t2=tx(o.hoja==='buzon' ? 'Escríbelo sin tu nombre: llega a la obra.'
              : (o.hoja==='mural' ? 'Los documentos de la obra, siempre vigentes.'
              : (o.hoja==='tareo' ? 'Al llegar y al irte. Solo vale junto a la puerta.' : 'O con la cámara del celular. Siempre la versión vigente.')));
    var empresa=String(o.empresa||''), obra=String(o.obra||''), marca=empresa || obra;
    g.fillStyle='#ffffff'; g.fillRect(0, 0, W, H);
    /* lo de abajo va fijo: el QR se acomoda en lo que queda (640 px, unos 10 cm; con un título
       larguísimo baja hasta 440 px, unos 7,5 cm, que igual se lee a un par de metros) */
    function qrEn(top, pieArriba, pad){
      var libre=pieArriba-top-2*pad-190;
      return Math.max(440, Math.min(640, libre));
    }
    if(dis==='senal'){
      var col=cartelColor(o.hoja);
      _cqLogo(g, L, cx, 56, 520, 170, marca, '#0B2A3A');
      var ft=_cqAjustar(g, titulo.toUpperCase(), W-150, 2, 92, 58, '900', 42), lht=ft.s*1.06;
      var fl=largo ? _cqAjustar(g, largo, W-200, 2, 36, 26, '600') : null, lhl=fl ? fl.s*1.24 : 0;
      var py=262, icoH=196, bloque=(ft.l.length-1)*lht+ft.s*0.74+(fl ? 24+fl.l.length*lhl : 0), ph=icoH+bloque+64;
      g.fillStyle=col; g.fillRect(0, py, W, ph);
      g.fillStyle='#ffffff'; g.beginPath(); g.arc(cx, py+100, 74, 0, Math.PI*2); g.fill();
      if(o.hoja==='buzon') _cqIconoBuzon(g, cx, py+100, 96, col); else if(o.hoja==='mural') _cqIconoMural(g, cx, py+100, 104, col);
      else if(o.hoja==='tareo') _cqIconoReloj(g, cx, py+100, 120, col); else _cqIconoDoc(g, cx, py+100, 92, col);
      var yb=py+icoH+ft.s*0.74;
      g.font=_cqFuente(ft.s, '900'); var yt=_cqTexto(g, ft.l, cx, yb, ft.s, lht, '#ffffff');
      if(fl){ g.font=_cqFuente(fl.s, '600'); _cqTexto(g, fl.l, cx, yt+24+fl.s, fl.s, lhl, 'rgba(255,255,255,.93)'); }
      var pie=H-110, pad=30, QR=qrEn(py+ph+40, pie, pad), qy=py+ph+40+pad;
      g.fillStyle='#ffffff'; _cqCaja(g, cx-QR/2-pad, qy-pad, QR+pad*2, QR+pad*2, 26); g.fill();
      g.lineWidth=12; g.strokeStyle=col; _cqCaja(g, cx-QR/2-pad, qy-pad, QR+pad*2, QR+pad*2, 26); g.stroke();
      _cqQR(g, o.enlace, cx, qy, QR);
      _cqEscanea(g, qy+QR+pad+78, t1, t2, col, '#4A5A66');
      g.fillStyle=col; g.fillRect(0, pie, W, 110);
      var fo=_cqAjustar(g, obra, W-260, 1, 38, 24, '700'); g.font=_cqFuente(fo.s, '700'); _cqTexto(g, fo.l, cx, pie+54, fo.s, 0, '#ffffff');
      g.font=_cqFuente(20, '800'); g.fillStyle='rgba(255,255,255,.82)'; g.textAlign='center'; g.fillText('◆ OBRASST', cx, pie+90);
    } else if(dis==='obra'){
      _cqFranjas(g, 0, 0, W, 60);
      var ft2=_cqAjustar(g, titulo.toUpperCase(), W-140, 2, 104, 62, '900', 42), lht2=ft2.s*1.04;
      var fl2=largo ? _cqAjustar(g, largo, W-180, 2, 36, 26, '700') : null, lhl2=fl2 ? fl2.s*1.24 : 0;
      var bloque2=(ft2.l.length-1)*lht2+ft2.s*0.74+(fl2 ? 22+fl2.l.length*lhl2 : 0), yh=60, ah=48+214+44+bloque2+44;
      g.fillStyle='#F5C400'; g.fillRect(0, yh, W, ah);
      g.fillStyle='#ffffff'; _cqCaja(g, cx-320, yh+48, 640, 214, 24); g.fill();
      _cqLogo(g, L, cx, yh+70, 560, 170, marca, '#1A1A1A');
      var yb2=yh+48+214+44+ft2.s*0.74;
      g.font=_cqFuente(ft2.s, '900'); var yt2=_cqTexto(g, ft2.l, cx, yb2, ft2.s, lht2, '#1A1A1A');
      if(fl2){ g.font=_cqFuente(fl2.s, '700'); _cqTexto(g, fl2.l, cx, yt2+22+fl2.s, fl2.s, lhl2, '#3A3000'); }
      var pie2=H-160, pad2=28, QR2=qrEn(yh+ah+40, pie2, pad2), qy2=yh+ah+40+pad2;
      g.fillStyle='#ffffff'; _cqCaja(g, cx-QR2/2-pad2, qy2-pad2, QR2+pad2*2, QR2+pad2*2, 22); g.fill();
      g.lineWidth=14; g.strokeStyle='#1A1A1A'; _cqCaja(g, cx-QR2/2-pad2, qy2-pad2, QR2+pad2*2, QR2+pad2*2, 22); g.stroke();
      _cqQR(g, o.enlace, cx, qy2, QR2);
      _cqEscanea(g, qy2+QR2+pad2+80, t1, t2, '#1A1A1A', '#4A4A4A');
      var fo2=_cqAjustar(g, obra, W-200, 1, 40, 24, '800'); g.font=_cqFuente(fo2.s, '800'); _cqTexto(g, fo2.l, cx, H-104, fo2.s, 0, '#1A1A1A');
      g.font=_cqFuente(20, '800'); g.fillStyle='#8A7400'; g.textAlign='center'; g.fillText('◆ OBRASST', cx, H-74);
      _cqFranjas(g, 0, H-60, W, 60);
    } else {
      /* clásico */
      g.fillStyle='#0B2A3A'; g.fillRect(0, 0, W, 22);
      _cqLogo(g, L, cx, 66, 520, 170, marca, '#0B2A3A');
      g.fillStyle='#E3E9ED'; g.fillRect(120, 274, W-240, 3);
      var ft3=_cqAjustar(g, titulo, W-240, 2, 96, 60, '800', 44), lht3=ft3.s*1.08;
      var hb=Math.round((ft3.l.length-1)*lht3+ft3.s*0.74+ft3.s*1.1), yb3=_cqBase(ft3.l.length, ft3.s, lht3, 306, hb);
      g.fillStyle='#0B2A3A'; _cqCaja(g, 70, 306, W-140, hb, 30); g.fill();
      g.fillStyle='#F5B700'; _cqCaja(g, cx-90, 306+hb-12, 180, 12, 6); g.fill();
      g.font=_cqFuente(ft3.s, '800'); _cqTexto(g, ft3.l, cx, yb3, ft3.s, lht3, '#ffffff');
      var abajo=306+hb;
      if(largo){ var fl3=_cqAjustar(g, largo, W-220, 2, 36, 26, '600'); g.font=_cqFuente(fl3.s, '600'); abajo=_cqTexto(g, fl3.l, cx, abajo+44+fl3.s*0.74, fl3.s, fl3.s*1.24, '#3E5968')+10; }
      var pie3=H-120, pad3=30, QR3=qrEn(abajo+56, pie3, pad3), qy3=abajo+56+pad3;
      g.fillStyle='#ffffff'; _cqCaja(g, cx-QR3/2-pad3, qy3-pad3, QR3+pad3*2, QR3+pad3*2, 26); g.fill();
      g.lineWidth=4; g.strokeStyle='#CBD6DD'; _cqCaja(g, cx-QR3/2-pad3, qy3-pad3, QR3+pad3*2, QR3+pad3*2, 26); g.stroke();
      _cqEsquinas(g, cx-QR3/2-pad3-16, qy3-pad3-16, QR3+pad3*2+32, QR3+pad3*2+32, 92, 12, '#F5B700');
      _cqQR(g, o.enlace, cx, qy3, QR3);
      _cqEscanea(g, qy3+QR3+pad3+84, t1, t2, '#0B2A3A', '#5B7282');
      g.fillStyle='#0B2A3A'; g.fillRect(0, pie3, W, 120);
      var fo3=_cqAjustar(g, obra, W-260, 1, 38, 24, '700'); g.font=_cqFuente(fo3.s, '700'); _cqTexto(g, fo3.l, cx, pie3+58, fo3.s, 0, '#ffffff');
      g.font=_cqFuente(20, '800'); g.fillStyle='#F5B700'; g.textAlign='center'; g.fillText('◆ OBRASST', cx, pie3+96);
    }
    return { canvas:cv, png:cv.toDataURL('image/png'), w:cv.width, h:cv.height, horizontal:false };
  });
}

/* ══ EL CARTEL DE UN EQUIPO (14/10/2026, lote 11) ═══════════════════
   Marcelo, con la foto del porta extintor: «se puede colocar tipo un QR y que se escanee para hacerle
   inspección al extintor y también, quizás, saber cómo se usa… replicar para las demás».
   Va pegado sobre el equipo (el porta extintor, junto al lavaojos, en el tablero): arriba su señal (la de
   la NTP, para los de emergencia), qué es, su código y de qué es; al medio CÓMO USARLO (los pasos que
   escribió la obra; el extintor y el lavaojos traen los de siempre) y, del extintor, para qué fuegos
   sirve y hasta cuándo vale su recarga; abajo el QR de su etiqueta (/h/): al escanearlo se ve cómo
   usarlo, si está al día, y se entra a su inspección. A4 vertical, como los demás carteles.
   o: { codigo, tipo (ya traducido), detalle, enlace, color, picto (el cuerpo SVG de la señal NTP, en su
        caja de 0 a 100), pasos:[[título, detalle]…], propios (los pasos son de la obra), antes, luego,
        clases:[[letra, qué es]…], nousar, recarga ('03/2027'), vencida, obra, empresa, logo, tx }
   Devuelve una promesa con { canvas, png }. Sin la señal (no cargó), va sin ella. */
function _cqImgSvg(cuerpo, px){
  if(!cuerpo) return Promise.resolve(null);
  return new Promise(function(ok){
    var im=new Image(), hecho=false, fin=function(v){ if(!hecho){ hecho=true; ok(v); } };
    setTimeout(function(){ fin(null); }, 8000);
    im.onload=function(){ fin(im); }; im.onerror=function(){ fin(null); };
    im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="'+px+'" height="'+px+'">'+cuerpo+'</svg>');
  });
}
function cartelEquipo(o){
  o=o||{};
  var tx=o.tx||function(z){ return z; };
  return Promise.all([cartelLogo(o.logo), _cqImgSvg(o.picto, 600)]).then(function(r){
    var L=r[0], P=r[1], W=CARTEL_W, H=CARTEL_H, X=70, AN=W-2*X;
    var cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    var g=cv.getContext('2d'), C=o.color||'#0B2A3A', OSC='#0B2A3A', GRIS='#4A5A66', ROJO='#B42318';
    var MONO='ui-monospace,Menlo,Consolas,"Courier New",monospace';
    g.fillStyle='#ffffff'; g.fillRect(0, 0, W, H);
    /* ── 1 · la franja: la señal, qué es, su código y de qué es ── */
    var pic=P ? 260 : 0, x0=P ? X+pic+54 : X, tw=W-X-x0;
    var tipo=String(o.tipo||'').toUpperCase(), cod=String(o.codigo||''), det=String(o.detalle||'');
    var ft=_cqAjustar(g, tipo, tw, 1, 112, 76, '900', 44), lht=ft.s*1.04;
    var fc=78; g.font='800 '+fc+'px '+MONO; while(fc>40 && g.measureText(cod).width>tw){ fc-=4; g.font='800 '+fc+'px '+MONO; }
    var fd=det ? _cqAjustar(g, det, tw, 1, 42, 30, '700') : null, lhd=fd ? fd.s*1.2 : 0;
    var alto=ft.s*0.74+(ft.l.length-1)*lht + 28+fc*0.9 + (fd ? 24+fd.s*0.9+(fd.l.length-1)*lhd : 0);
    var bandaH=Math.round(Math.max(P ? pic+84 : 0, alto+90));
    g.fillStyle=C; g.fillRect(0, 0, W, bandaH);
    if(P){ var py=(bandaH-pic)/2; g.fillStyle='#ffffff'; _cqCaja(g, X-10, py-10, pic+20, pic+20, 20); g.fill(); g.drawImage(P, X, py, pic, pic); }
    var y=(bandaH-alto)/2 + ft.s*0.74;
    g.font=_cqFuente(ft.s, '900'); y=_cqTextoIzq(g, ft.l, x0, y, lht, '#ffffff');
    y+=28+fc*0.9; g.font='800 '+fc+'px '+MONO; g.fillStyle='#ffffff'; g.textAlign='left'; g.fillText(cod, x0, y);
    if(fd){ g.font=_cqFuente(fd.s, '700'); _cqTextoIzq(g, fd.l, x0, y+24+fd.s*0.9, lhd, 'rgba(255,255,255,.93)'); }

    /* ── 2 · el cuerpo: se mide con una escala; si no entra, la letra baja (y, al final, se cortan pasos) ── */
    var pasos=(o.pasos||[]).filter(function(p){ return p && p[0]; }), grilla=pasos.length===4 && pasos.every(function(p){ return p[1]; });
    var clases=o.clases||[], pieY=H-84, pad=22, qrMin=300, bloqueQR=qrMin+2*pad+12, colW=(AN-36)/2;
    /* varios textos con LA MISMA letra (la más grande con la que entran todos): { s, l:[las líneas de cada uno] } */
    function comun(textos, ancho, maxL, grande, chico, peso){
      var s0=grande;
      textos.forEach(function(t){ var f=_cqAjustar(g, t, ancho, maxL, grande, chico, peso); if(f.s<s0) s0=f.s; });
      g.font=_cqFuente(s0, peso);
      return { s:s0, l:textos.map(function(t){ var l=_cqLineas(g, t, ancho); if(l.length>maxL+1){ l=l.slice(0, maxL+1); l[maxL]=l[maxL].replace(/\s+\S*$/, '')+'…'; } return l; }) };
    }
    function medir(e, n){
      var M={ e:e, n:n, alto:0 };
      if(n){
        M.rot=Math.round(30*e);
        M.fa=o.antes ? _cqAjustar(g, o.antes, AN, 2, Math.round(28*e), 20, '600') : null;
        if(grilla){
          var tW=colW-96, ps=pasos.slice(0, n), A1=comun(ps.map(function(p){ return p[0]; }), tW, 2, Math.round(37*e), 24, '800'),
              B1=comun(ps.map(function(p){ return p[1]; }), tW, 2, Math.round(27*e), 19, '500');
          M.cel=ps.map(function(p, i){ var a={ s:A1.s, l:A1.l[i] }, b={ s:B1.s, l:B1.l[i] };
            return { a:a, b:b, h:Math.max(80, 20+a.s*0.9+(a.l.length-1)*a.s*1.12+12+b.s*0.9+(b.l.length-1)*b.s*1.22+20)+16 }; });
          M.pasosH=Math.max(M.cel[0] ? M.cel[0].h : 0, M.cel[1] ? M.cel[1].h : 0)+Math.max(M.cel[2] ? M.cel[2].h : 0, M.cel[3] ? M.cel[3].h : 0);
        } else {
          var lw=AN-84, F1=comun(pasos.slice(0, n).map(function(p){ return p[0]; }), lw, 2, Math.round(33*e), 22, '700');
          M.fil=F1.l.map(function(l){ var a={ s:F1.s, l:l };
            return { a:a, h:Math.max(64, a.s*0.9+(a.l.length-1)*a.s*1.2+20)+12 }; });
          M.pasosH=0; M.fil.forEach(function(f){ M.pasosH+=f.h; });
        }
        M.fl=o.luego ? _cqAjustar(g, o.luego, AN, 2, Math.round(27*e), 19, '700') : null;
        M.alto+=M.rot+20 + (M.fa ? M.fa.s*0.9+(M.fa.l.length-1)*M.fa.s*1.24+18 : 0) + M.pasosH + (M.fl ? 4+M.fl.s*0.9+(M.fl.l.length-1)*M.fl.s*1.24 : 0) + 34;
        if(n<pasos.length) M.alto+=40;
      }
      if(clases.length){
        M.rot2=Math.round(28*e);
        var C1=comun(clases.map(function(c){ return c[1]; }), AN-74, 2, Math.round(28*e), 22, '600');
        M.cla=C1.l.map(function(l){ return { s:C1.s, l:l }; });
        M.claH=0; M.cla.forEach(function(f){ M.claH+=Math.max(52, f.s*0.9+(f.l.length-1)*f.s*1.2+18)+8; });
        M.fno=o.nousar ? _cqAjustar(g, o.nousar, AN, 2, Math.round(27*e), 19, '700') : null;
        M.alto+=M.rot2+20+M.claH+(M.fno ? 10+M.fno.s*0.9+(M.fno.l.length-1)*M.fno.s*1.24 : 0)+30;
      }
      if(o.recarga) M.alto+=50;
      return M;
    }
    /* con aire, la letra crece (hasta 1,3 veces) dejando un QR de al menos 440 px; si no, baja hasta 0,76 con el QR de 300 */
    var y0=bandaH+40, libre=pieY-30-bloqueQR-y0, libreG=pieY-30-(440+2*pad+12)-y0, M=null, k;
    for(k=0; k<=5 && !M; k++){ var Mg=medir(1.3-k*0.06, pasos.length); if(Mg.alto<=libreG) M=Mg; }
    for(k=0; k<=4 && !M; k++){ var Mc=medir(1-k*0.06, pasos.length); if(Mc.alto<=libre || k===4) M=Mc; }
    for(var n=pasos.length-1; n>=1 && M.alto>libre; n--) M=medir(M.e, n);
    y=y0;
    if(M.n){
      _cqRotulo(g, X, y+M.rot*0.8, tx('Cómo usarlo'), C, M.rot); y+=M.rot+20;
      if(M.fa){ g.font=_cqFuente(M.fa.s, '600'); y=_cqTextoIzq(g, M.fa.l, X, y+M.fa.s*0.9, M.fa.s*1.24, OSC)+18; }
      if(M.cel){
        for(var fi=0; fi<2; fi++){
          var hf=Math.max(M.cel[fi*2] ? M.cel[fi*2].h : 0, M.cel[fi*2+1] ? M.cel[fi*2+1].h : 0);
          for(var ci=0; ci<2; ci++){
            var k=fi*2+ci, c=M.cel[k]; if(!c) continue;
            var cx0=X+ci*(colW+36);
            g.fillStyle='#F2F5F8'; _cqCaja(g, cx0, y, colW, hf-16, 18); g.fill();
            _cqNum(g, cx0+46, y+48, 30, k+1, C);
            g.font=_cqFuente(c.a.s, '800'); var ya=_cqTextoIzq(g, c.a.l, cx0+92, y+20+c.a.s*0.9, c.a.s*1.12, OSC);
            g.font=_cqFuente(c.b.s, '500'); _cqTextoIzq(g, c.b.l, cx0+92, ya+12+c.b.s*0.9, c.b.s*1.22, GRIS);
          }
          y+=hf;
        }
      } else {
        M.fil.forEach(function(f, i){
          _cqNum(g, X+30, y+30, 27, i+1, C);
          g.font=_cqFuente(f.a.s, '700'); _cqTextoIzq(g, f.a.l, X+84, y+10+f.a.s*0.9, f.a.s*1.2, OSC);
          y+=f.h;
        });
      }
      if(M.n<pasos.length){ g.font=_cqFuente(26, '700'); g.fillStyle=GRIS; g.textAlign='left'; g.fillText(tx('Y más pasos: escanea el QR.'), X, y+26); y+=40; }
      if(M.fl){ g.font=_cqFuente(M.fl.s, '700'); y=_cqTextoIzq(g, M.fl.l, X, y+4+M.fl.s*0.9, M.fl.s*1.24, o.color==='#C8102E' ? ROJO : OSC); }
      y+=34;
    }
    if(clases.length){
      _cqRotulo(g, X, y+M.rot2*0.8, tx('Sirve para'), C, M.rot2); y+=M.rot2+20;
      clases.forEach(function(c, i){
        var f=M.cla[i], hh=Math.max(52, f.s*0.9+(f.l.length-1)*f.s*1.2+18);
        g.fillStyle=C; _cqCaja(g, X, y+(hh-52)/2, 52, 52, 10); g.fill();
        g.fillStyle='#ffffff'; g.font=_cqFuente(34, '900'); g.textAlign='center'; g.textBaseline='middle'; g.fillText(c[0], X+26, y+hh/2+2); g.textBaseline='alphabetic';
        g.font=_cqFuente(f.s, '600'); _cqTextoIzq(g, f.l, X+74, y+hh/2-((f.l.length-1)*f.s*1.2)/2+f.s*0.36, f.s*1.2, OSC);
        y+=hh+8;
      });
      if(M.fno){ g.font=_cqFuente(M.fno.s, '700'); y=_cqTextoIzq(g, M.fno.l, X, y+10+M.fno.s*0.9, M.fno.s*1.24, ROJO); }
      y+=30;
    }
    if(o.recarga){
      g.font=_cqFuente(29, '700'); g.textAlign='left'; g.fillStyle=o.vencida ? ROJO : '#14663A';
      g.fillText((o.vencida ? '⚠ ' : '✓ ')+(o.vencida ? tx('La recarga venció en {0}.').replace('{0}', o.recarga) : tx('Recarga vigente hasta {0}.').replace('{0}', o.recarga)), X, y+24);
      y+=50;
    }

    /* ── 3 · el QR (lo que quedó de alto: de 300 a 560 px, de 5 a 9,5 cm) con lo que hace, y el logo ── */
    var QR=Math.max(qrMin, Math.min(560, pieY-30-y-2*pad)), caja=QR+2*pad, qx=W-X-caja, qy=Math.max(y, pieY-30-caja);
    g.fillStyle='#ffffff'; _cqCaja(g, qx, qy, caja, caja, 22); g.fill();
    g.lineWidth=10; g.strokeStyle=C; _cqCaja(g, qx, qy, caja, caja, 22); g.stroke();
    _cqQR(g, o.enlace, qx+caja/2, qy+pad, QR);
    var lw2=qx-X-36, fe=_cqAjustar(g, tx('ESCANÉAME'), lw2, 1, 72, 40, '900');
    var f2=_cqAjustar(g, tx('Con la cámara de tu celular: cómo usarlo, si está al día y su inspección.'), lw2, 4, 33, 22, '700');
    /* el logo de la empresa (o su razón social); la obra va en el pie, no dos veces */
    var hayLogo=!!(L || (o.empresa && o.empresa!==o.obra)), hLogo=hayLogo ? Math.min(110, Math.max(0, caja-(fe.s*0.9+20+f2.s*0.9+(f2.l.length-1)*f2.s*1.24)-36)) : 0;
    var bloque=fe.s*0.9+20+f2.s*0.9+(f2.l.length-1)*f2.s*1.24+(hLogo>=50 ? 36+hLogo : 0), ty=qy+Math.max(0, (caja-bloque)/2)+fe.s*0.9;
    g.font=_cqFuente(fe.s, '900'); g.fillStyle=C; g.textAlign='left'; g.fillText(fe.l[0]||'', X, ty);
    g.font=_cqFuente(f2.s, '700'); ty=_cqTextoIzq(g, f2.l, X, ty+20+f2.s*0.9, f2.s*1.24, OSC);
    if(hLogo>=50) _cqLogo(g, L, X+Math.min(lw2, 420)/2, ty+36, Math.min(lw2, 420), hLogo, o.empresa, OSC);
    /* ── 4 · el pie: la obra ── */
    g.fillStyle=C; g.fillRect(0, pieY, W, H-pieY);
    var fo=_cqAjustar(g, String(o.obra||''), W-300, 1, 32, 20, '700'); g.font=_cqFuente(fo.s, '700'); _cqTexto(g, fo.l, W/2, pieY+42, fo.s, 0, '#ffffff');
    g.font=_cqFuente(18, '800'); g.fillStyle='rgba(255,255,255,.85)'; g.textAlign='center'; g.fillText('◆ OBRASST', W/2, pieY+70);
    return { canvas:cv, png:cv.toDataURL('image/png'), w:W, h:H };
  });
}
