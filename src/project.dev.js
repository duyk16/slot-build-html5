window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  1: [ function(require, module, exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = "undefined" !== typeof Uint8Array ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len = b64.length;
      if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
      var validLen = b64.indexOf("=");
      -1 === validLen && (validLen = len);
      var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
      return [ validLen, placeHoldersLen ];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
      for (var i = 0; i < len; i += 4) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      if (2 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = 255 & tmp;
      }
      if (1 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[63 & num];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (255 & uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
      if (1 === extraBytes) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (2 === extraBytes) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }, {} ],
  2: [ function(require, module, exports) {
    (function(global) {
      "use strict";
      var base64 = require("base64-js");
      var ieee754 = require("ieee754");
      var isArray = require("isarray");
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      Buffer.TYPED_ARRAY_SUPPORT = void 0 !== global.TYPED_ARRAY_SUPPORT ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
      exports.kMaxLength = kMaxLength();
      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = {
            __proto__: Uint8Array.prototype,
            foo: function() {
              return 42;
            }
          };
          return 42 === arr.foo() && "function" === typeof arr.subarray && 0 === arr.subarray(1, 1).byteLength;
        } catch (e) {
          return false;
        }
      }
      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
      }
      function createBuffer(that, length) {
        if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = new Uint8Array(length);
          that.__proto__ = Buffer.prototype;
        } else {
          null === that && (that = new Buffer(length));
          that.length = length;
        }
        return that;
      }
      function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) return new Buffer(arg, encodingOrOffset, length);
        if ("number" === typeof arg) {
          if ("string" === typeof encodingOrOffset) throw new Error("If encoding is specified then the first argument must be a string");
          return allocUnsafe(this, arg);
        }
        return from(this, arg, encodingOrOffset, length);
      }
      Buffer.poolSize = 8192;
      Buffer._augment = function(arr) {
        arr.__proto__ = Buffer.prototype;
        return arr;
      };
      function from(that, value, encodingOrOffset, length) {
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
        if ("undefined" !== typeof ArrayBuffer && value instanceof ArrayBuffer) return fromArrayBuffer(that, value, encodingOrOffset, length);
        if ("string" === typeof value) return fromString(that, value, encodingOrOffset);
        return fromObject(that, value);
      }
      Buffer.from = function(value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        "undefined" !== typeof Symbol && Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true
        });
      }
      function assertSize(size) {
        if ("number" !== typeof size) throw new TypeError('"size" argument must be a number');
        if (size < 0) throw new RangeError('"size" argument must not be negative');
      }
      function alloc(that, size, fill, encoding) {
        assertSize(size);
        if (size <= 0) return createBuffer(that, size);
        if (void 0 !== fill) return "string" === typeof encoding ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
        return createBuffer(that, size);
      }
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(null, size, fill, encoding);
      };
      function allocUnsafe(that, size) {
        assertSize(size);
        that = createBuffer(that, size < 0 ? 0 : 0 | checked(size));
        if (!Buffer.TYPED_ARRAY_SUPPORT) for (var i = 0; i < size; ++i) that[i] = 0;
        return that;
      }
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(null, size);
      };
      function fromString(that, string, encoding) {
        "string" === typeof encoding && "" !== encoding || (encoding = "utf8");
        if (!Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
        var length = 0 | byteLength(string, encoding);
        that = createBuffer(that, length);
        var actual = that.write(string, encoding);
        actual !== length && (that = that.slice(0, actual));
        return that;
      }
      function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : 0 | checked(array.length);
        that = createBuffer(that, length);
        for (var i = 0; i < length; i += 1) that[i] = 255 & array[i];
        return that;
      }
      function fromArrayBuffer(that, array, byteOffset, length) {
        array.byteLength;
        if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
        if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
        array = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = array;
          that.__proto__ = Buffer.prototype;
        } else that = fromArrayLike(that, array);
        return that;
      }
      function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
          var len = 0 | checked(obj.length);
          that = createBuffer(that, len);
          if (0 === that.length) return that;
          obj.copy(that, 0, 0, len);
          return that;
        }
        if (obj) {
          if ("undefined" !== typeof ArrayBuffer && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if ("number" !== typeof obj.length || isnan(obj.length)) return createBuffer(that, 0);
            return fromArrayLike(that, obj);
          }
          if ("Buffer" === obj.type && isArray(obj.data)) return fromArrayLike(that, obj.data);
        }
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
      }
      function checked(length) {
        if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
        return 0 | length;
      }
      function SlowBuffer(length) {
        +length != length && (length = 0);
        return Buffer.alloc(+length);
      }
      Buffer.isBuffer = function isBuffer(b) {
        return !!(null != b && b._isBuffer);
      };
      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
         case "hex":
         case "utf8":
         case "utf-8":
         case "ascii":
         case "latin1":
         case "binary":
         case "base64":
         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return true;

         default:
          return false;
        }
      };
      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (0 === list.length) return Buffer.alloc(0);
        var i;
        if (void 0 === length) {
          length = 0;
          for (i = 0; i < list.length; ++i) length += list[i].length;
        }
        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) return string.length;
        if ("undefined" !== typeof ArrayBuffer && "function" === typeof ArrayBuffer.isView && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
        "string" !== typeof string && (string = "" + string);
        var len = string.length;
        if (0 === len) return 0;
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "ascii":
         case "latin1":
         case "binary":
          return len;

         case "utf8":
         case "utf-8":
         case void 0:
          return utf8ToBytes(string).length;

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return 2 * len;

         case "hex":
          return len >>> 1;

         case "base64":
          return base64ToBytes(string).length;

         default:
          if (loweredCase) return utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        var loweredCase = false;
        (void 0 === start || start < 0) && (start = 0);
        if (start > this.length) return "";
        (void 0 === end || end > this.length) && (end = this.length);
        if (end <= 0) return "";
        end >>>= 0;
        start >>>= 0;
        if (end <= start) return "";
        encoding || (encoding = "utf8");
        while (true) switch (encoding) {
         case "hex":
          return hexSlice(this, start, end);

         case "utf8":
         case "utf-8":
          return utf8Slice(this, start, end);

         case "ascii":
          return asciiSlice(this, start, end);

         case "latin1":
         case "binary":
          return latin1Slice(this, start, end);

         case "base64":
          return base64Slice(this, start, end);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return utf16leSlice(this, start, end);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.prototype._isBuffer = true;
      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (var i = 0; i < len; i += 2) swap(this, i, i + 1);
        return this;
      };
      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer.prototype.toString = function toString() {
        var length = 0 | this.length;
        if (0 === length) return "";
        if (0 === arguments.length) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return 0 === Buffer.compare(this, b);
      };
      Buffer.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
          this.length > max && (str += " ... ");
        }
        return "<Buffer " + str + ">";
      };
      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) throw new TypeError("Argument must be a Buffer");
        void 0 === start && (start = 0);
        void 0 === end && (end = target ? target.length : 0);
        void 0 === thisStart && (thisStart = 0);
        void 0 === thisEnd && (thisEnd = this.length);
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
        if (thisStart >= thisEnd && start >= end) return 0;
        if (thisStart >= thisEnd) return -1;
        if (start >= end) return 1;
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (0 === buffer.length) return -1;
        if ("string" === typeof byteOffset) {
          encoding = byteOffset;
          byteOffset = 0;
        } else byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648);
        byteOffset = +byteOffset;
        isNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1);
        byteOffset < 0 && (byteOffset = buffer.length + byteOffset);
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (!dir) return -1;
          byteOffset = 0;
        }
        "string" === typeof val && (val = Buffer.from(val, encoding));
        if (Buffer.isBuffer(val)) {
          if (0 === val.length) return -1;
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        }
        if ("number" === typeof val) {
          val &= 255;
          if (Buffer.TYPED_ARRAY_SUPPORT && "function" === typeof Uint8Array.prototype.indexOf) return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;
        if (void 0 !== encoding) {
          encoding = String(encoding).toLowerCase();
          if ("ucs2" === encoding || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding) {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i) {
          return 1 === indexSize ? buf[i] : buf.readUInt16BE(i * indexSize);
        }
        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
            -1 === foundIndex && (foundIndex = i);
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            -1 !== foundIndex && (i -= i - foundIndex);
            foundIndex = -1;
          }
        } else {
          byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength);
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return -1 !== this.indexOf(val, byteOffset, encoding);
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (length) {
          length = Number(length);
          length > remaining && (length = remaining);
        } else length = remaining;
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
        length > strLen / 2 && (length = strLen / 2);
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(2 * i, 2), 16);
          if (isNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer.prototype.write = function write(string, offset, length, encoding) {
        if (void 0 === offset) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (void 0 === length && "string" === typeof offset) {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else {
          if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
          offset |= 0;
          if (isFinite(length)) {
            length |= 0;
            void 0 === encoding && (encoding = "utf8");
          } else {
            encoding = length;
            length = void 0;
          }
        }
        var remaining = this.length - offset;
        (void 0 === length || length > remaining) && (length = remaining);
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
        encoding || (encoding = "utf8");
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "hex":
          return hexWrite(this, string, offset, length);

         case "utf8":
         case "utf-8":
          return utf8Write(this, string, offset, length);

         case "ascii":
          return asciiWrite(this, string, offset, length);

         case "latin1":
         case "binary":
          return latin1Write(this, string, offset, length);

         case "base64":
          return base64Write(this, string, offset, length);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return ucs2Write(this, string, offset, length);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      };
      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        return 0 === start && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
             case 1:
              firstByte < 128 && (codePoint = firstByte);
              break;

             case 2:
              secondByte = buf[i + 1];
              if (128 === (192 & secondByte)) {
                tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte;
                tempCodePoint > 127 && (codePoint = tempCodePoint);
              }
              break;

             case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte)) {
                tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte;
                tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint);
              }
              break;

             case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte) && 128 === (192 & fourthByte)) {
                tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte;
                tempCodePoint > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint);
              }
            }
          }
          if (null === codePoint) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | 1023 & codePoint;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
        var res = "";
        var i = 0;
        while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        return res;
      }
      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(127 & buf[i]);
        return ret;
      }
      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
        return ret;
      }
      function hexSlice(buf, start, end) {
        var len = buf.length;
        (!start || start < 0) && (start = 0);
        (!end || end < 0 || end > len) && (end = len);
        var out = "";
        for (var i = start; i < end; ++i) out += toHex(buf[i]);
        return out;
      }
      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
        return res;
      }
      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = void 0 === end ? len : ~~end;
        if (start < 0) {
          start += len;
          start < 0 && (start = 0);
        } else start > len && (start = len);
        if (end < 0) {
          end += len;
          end < 0 && (end = 0);
        } else end > len && (end = len);
        end < start && (end = start);
        var newBuf;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) newBuf[i] = this[i + start];
        }
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        return val;
      };
      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
        return val;
      };
      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
      };
      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        if (!(128 & this[offset])) return this[offset];
        return -1 * (255 - this[offset] + 1);
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 255, 0);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        this[offset] = 255 & value;
        return offset + 1;
      };
      function objectWriteUInt16(buf, value, offset, littleEndian) {
        value < 0 && (value = 65535 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> 8 * (littleEndian ? i : 1 - i);
      }
      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      function objectWriteUInt32(buf, value, offset, littleEndian) {
        value < 0 && (value = 4294967295 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) buf[offset + i] = value >>> 8 * (littleEndian ? i : 3 - i) & 255;
      }
      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = 255 & value;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 127, -128);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        value < 0 && (value = 255 + value + 1);
        this[offset] = 255 & value;
        return offset + 1;
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        value < 0 && (value = 4294967295 + value + 1);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        start || (start = 0);
        end || 0 === end || (end = this.length);
        targetStart >= target.length && (targetStart = target.length);
        targetStart || (targetStart = 0);
        end > 0 && end < start && (end = start);
        if (end === start) return 0;
        if (0 === target.length || 0 === this.length) return 0;
        if (targetStart < 0) throw new RangeError("targetStart out of bounds");
        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        end > this.length && (end = this.length);
        target.length - targetStart < end - start && (end = target.length - targetStart + start);
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; i < len; ++i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
        return len;
      };
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        if ("string" === typeof val) {
          if ("string" === typeof start) {
            encoding = start;
            start = 0;
            end = this.length;
          } else if ("string" === typeof end) {
            encoding = end;
            end = this.length;
          }
          if (1 === val.length) {
            var code = val.charCodeAt(0);
            code < 256 && (val = code);
          }
          if (void 0 !== encoding && "string" !== typeof encoding) throw new TypeError("encoding must be a string");
          if ("string" === typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        } else "number" === typeof val && (val &= 255);
        if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
        if (end <= start) return this;
        start >>>= 0;
        end = void 0 === end ? this.length : end >>> 0;
        val || (val = 0);
        var i;
        if ("number" === typeof val) for (i = start; i < end; ++i) this[i] = val; else {
          var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
        }
        return this;
      };
      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) str += "=";
        return str;
      }
      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, "");
      }
      function toHex(n) {
        if (n < 16) return "0" + n.toString(16);
        return n.toString(16);
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              if (i + 1 === length) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              (units -= 3) > -1 && bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = 65536 + (leadSurrogate - 55296 << 10 | codePoint - 56320);
          } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          } else {
            if (!(codePoint < 1114112)) throw new Error("Invalid code point");
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isnan(val) {
        return val !== val;
      }
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "base64-js": 1,
    ieee754: 4,
    isarray: 3
  } ],
  3: [ function(require, module, exports) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return "[object Array]" == toString.call(arr);
    };
  }, {} ],
  4: [ function(require, module, exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (;nBits > 0; e = 256 * e + buffer[offset + i], i += d, nBits -= 8) ;
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (;nBits > 0; m = 256 * m + buffer[offset + i], i += d, nBits -= 8) ;
      if (0 === e) e = 1 - eBias; else {
        if (e === eMax) return m ? NaN : Infinity * (s ? -1 : 1);
        m += Math.pow(2, mLen);
        e -= eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = 23 === mLen ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || 0 === value && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || Infinity === value) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e += eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (;mLen >= 8; buffer[offset + i] = 255 & m, i += d, m /= 256, mLen -= 8) ;
      e = e << mLen | m;
      eLen += mLen;
      for (;eLen > 0; buffer[offset + i] = 255 & e, i += d, e /= 256, eLen -= 8) ;
      buffer[offset + i - d] |= 128 * s;
    };
  }, {} ],
  5: [ function(require, module, exports) {
    function EventLite() {
      if (!(this instanceof EventLite)) return new EventLite();
    }
    (function(EventLite) {
      "undefined" !== typeof module && (module.exports = EventLite);
      var LISTENERS = "listeners";
      var methods = {
        on: on,
        once: once,
        off: off,
        emit: emit
      };
      mixin(EventLite.prototype);
      EventLite.mixin = mixin;
      function mixin(target) {
        for (var key in methods) target[key] = methods[key];
        return target;
      }
      function on(type, func) {
        getListeners(this, type).push(func);
        return this;
      }
      function once(type, func) {
        var that = this;
        wrap.originalListener = func;
        getListeners(that, type).push(wrap);
        return that;
        function wrap() {
          off.call(that, type, wrap);
          func.apply(this, arguments);
        }
      }
      function off(type, func) {
        var that = this;
        var listners;
        if (arguments.length) if (func) {
          listners = getListeners(that, type, true);
          if (listners) {
            listners = listners.filter(ne);
            if (!listners.length) return off.call(that, type);
            that[LISTENERS][type] = listners;
          }
        } else {
          listners = that[LISTENERS];
          if (listners) {
            delete listners[type];
            if (!Object.keys(listners).length) return off.call(that);
          }
        } else delete that[LISTENERS];
        return that;
        function ne(test) {
          return test !== func && test.originalListener !== func;
        }
      }
      function emit(type, value) {
        var that = this;
        var listeners = getListeners(that, type, true);
        if (!listeners) return false;
        var arglen = arguments.length;
        if (1 === arglen) listeners.forEach(zeroarg); else if (2 === arglen) listeners.forEach(onearg); else {
          var args = Array.prototype.slice.call(arguments, 1);
          listeners.forEach(moreargs);
        }
        return !!listeners.length;
        function zeroarg(func) {
          func.call(that);
        }
        function onearg(func) {
          func.call(that, value);
        }
        function moreargs(func) {
          func.apply(that, args);
        }
      }
      function getListeners(that, type, readonly) {
        if (readonly && !that[LISTENERS]) return;
        var listeners = that[LISTENERS] || (that[LISTENERS] = {});
        return listeners[type] || (listeners[type] = []);
      }
    })(EventLite);
  }, {} ],
  6: [ function(require, module, exports) {
    arguments[4][4][0].apply(exports, arguments);
  }, {
    dup: 4
  } ],
  7: [ function(require, module, exports) {
    (function(Buffer) {
      var Uint64BE, Int64BE, Uint64LE, Int64LE;
      !function(exports) {
        var UNDEFINED = "undefined";
        var BUFFER = UNDEFINED !== typeof Buffer && Buffer;
        var UINT8ARRAY = UNDEFINED !== typeof Uint8Array && Uint8Array;
        var ARRAYBUFFER = UNDEFINED !== typeof ArrayBuffer && ArrayBuffer;
        var ZERO = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
        var isArray = Array.isArray || _isArray;
        var BIT32 = 4294967296;
        var BIT24 = 16777216;
        var storage;
        Uint64BE = factory("Uint64BE", true, true);
        Int64BE = factory("Int64BE", true, false);
        Uint64LE = factory("Uint64LE", false, true);
        Int64LE = factory("Int64LE", false, false);
        function factory(name, bigendian, unsigned) {
          var posH = bigendian ? 0 : 4;
          var posL = bigendian ? 4 : 0;
          var pos0 = bigendian ? 0 : 3;
          var pos1 = bigendian ? 1 : 2;
          var pos2 = bigendian ? 2 : 1;
          var pos3 = bigendian ? 3 : 0;
          var fromPositive = bigendian ? fromPositiveBE : fromPositiveLE;
          var fromNegative = bigendian ? fromNegativeBE : fromNegativeLE;
          var proto = Int64.prototype;
          var isName = "is" + name;
          var _isInt64 = "_" + isName;
          proto.buffer = void 0;
          proto.offset = 0;
          proto[_isInt64] = true;
          proto.toNumber = toNumber;
          proto.toString = toString;
          proto.toJSON = toNumber;
          proto.toArray = toArray;
          BUFFER && (proto.toBuffer = toBuffer);
          UINT8ARRAY && (proto.toArrayBuffer = toArrayBuffer);
          Int64[isName] = isInt64;
          exports[name] = Int64;
          return Int64;
          function Int64(buffer, offset, value, raddix) {
            if (!(this instanceof Int64)) return new Int64(buffer, offset, value, raddix);
            return init(this, buffer, offset, value, raddix);
          }
          function isInt64(b) {
            return !!(b && b[_isInt64]);
          }
          function init(that, buffer, offset, value, raddix) {
            if (UINT8ARRAY && ARRAYBUFFER) {
              buffer instanceof ARRAYBUFFER && (buffer = new UINT8ARRAY(buffer));
              value instanceof ARRAYBUFFER && (value = new UINT8ARRAY(value));
            }
            if (!buffer && !offset && !value && !storage) {
              that.buffer = newArray(ZERO, 0);
              return;
            }
            if (!isValidBuffer(buffer, offset)) {
              var _storage = storage || Array;
              raddix = offset;
              value = buffer;
              offset = 0;
              buffer = new _storage(8);
            }
            that.buffer = buffer;
            that.offset = offset |= 0;
            if (UNDEFINED === typeof value) return;
            if ("string" === typeof value) fromString(buffer, offset, value, raddix || 10); else if (isValidBuffer(value, raddix)) fromArray(buffer, offset, value, raddix); else if ("number" === typeof raddix) {
              writeInt32(buffer, offset + posH, value);
              writeInt32(buffer, offset + posL, raddix);
            } else value > 0 ? fromPositive(buffer, offset, value) : value < 0 ? fromNegative(buffer, offset, value) : fromArray(buffer, offset, ZERO, 0);
          }
          function fromString(buffer, offset, str, raddix) {
            var pos = 0;
            var len = str.length;
            var high = 0;
            var low = 0;
            "-" === str[0] && pos++;
            var sign = pos;
            while (pos < len) {
              var chr = parseInt(str[pos++], raddix);
              if (!(chr >= 0)) break;
              low = low * raddix + chr;
              high = high * raddix + Math.floor(low / BIT32);
              low %= BIT32;
            }
            if (sign) {
              high = ~high;
              low ? low = BIT32 - low : high++;
            }
            writeInt32(buffer, offset + posH, high);
            writeInt32(buffer, offset + posL, low);
          }
          function toNumber() {
            var buffer = this.buffer;
            var offset = this.offset;
            var high = readInt32(buffer, offset + posH);
            var low = readInt32(buffer, offset + posL);
            unsigned || (high |= 0);
            return high ? high * BIT32 + low : low;
          }
          function toString(radix) {
            var buffer = this.buffer;
            var offset = this.offset;
            var high = readInt32(buffer, offset + posH);
            var low = readInt32(buffer, offset + posL);
            var str = "";
            var sign = !unsigned && 2147483648 & high;
            if (sign) {
              high = ~high;
              low = BIT32 - low;
            }
            radix = radix || 10;
            while (1) {
              var mod = high % radix * BIT32 + low;
              high = Math.floor(high / radix);
              low = Math.floor(mod / radix);
              str = (mod % radix).toString(radix) + str;
              if (!high && !low) break;
            }
            sign && (str = "-" + str);
            return str;
          }
          function writeInt32(buffer, offset, value) {
            buffer[offset + pos3] = 255 & value;
            value >>= 8;
            buffer[offset + pos2] = 255 & value;
            value >>= 8;
            buffer[offset + pos1] = 255 & value;
            value >>= 8;
            buffer[offset + pos0] = 255 & value;
          }
          function readInt32(buffer, offset) {
            return buffer[offset + pos0] * BIT24 + (buffer[offset + pos1] << 16) + (buffer[offset + pos2] << 8) + buffer[offset + pos3];
          }
        }
        function toArray(raw) {
          var buffer = this.buffer;
          var offset = this.offset;
          storage = null;
          if (false !== raw && 0 === offset && 8 === buffer.length && isArray(buffer)) return buffer;
          return newArray(buffer, offset);
        }
        function toBuffer(raw) {
          var buffer = this.buffer;
          var offset = this.offset;
          storage = BUFFER;
          if (false !== raw && 0 === offset && 8 === buffer.length && Buffer.isBuffer(buffer)) return buffer;
          var dest = new BUFFER(8);
          fromArray(dest, 0, buffer, offset);
          return dest;
        }
        function toArrayBuffer(raw) {
          var buffer = this.buffer;
          var offset = this.offset;
          var arrbuf = buffer.buffer;
          storage = UINT8ARRAY;
          if (false !== raw && 0 === offset && arrbuf instanceof ARRAYBUFFER && 8 === arrbuf.byteLength) return arrbuf;
          var dest = new UINT8ARRAY(8);
          fromArray(dest, 0, buffer, offset);
          return dest.buffer;
        }
        function isValidBuffer(buffer, offset) {
          var len = buffer && buffer.length;
          offset |= 0;
          return len && offset + 8 <= len && "string" !== typeof buffer[offset];
        }
        function fromArray(destbuf, destoff, srcbuf, srcoff) {
          destoff |= 0;
          srcoff |= 0;
          for (var i = 0; i < 8; i++) destbuf[destoff++] = 255 & srcbuf[srcoff++];
        }
        function newArray(buffer, offset) {
          return Array.prototype.slice.call(buffer, offset, offset + 8);
        }
        function fromPositiveBE(buffer, offset, value) {
          var pos = offset + 8;
          while (pos > offset) {
            buffer[--pos] = 255 & value;
            value /= 256;
          }
        }
        function fromNegativeBE(buffer, offset, value) {
          var pos = offset + 8;
          value++;
          while (pos > offset) {
            buffer[--pos] = 255 & -value ^ 255;
            value /= 256;
          }
        }
        function fromPositiveLE(buffer, offset, value) {
          var end = offset + 8;
          while (offset < end) {
            buffer[offset++] = 255 & value;
            value /= 256;
          }
        }
        function fromNegativeLE(buffer, offset, value) {
          var end = offset + 8;
          value++;
          while (offset < end) {
            buffer[offset++] = 255 & -value ^ 255;
            value /= 256;
          }
        }
        function _isArray(val) {
          return !!val && "[object Array]" == Object.prototype.toString.call(val);
        }
      }("object" === typeof exports && "string" !== typeof exports.nodeName ? exports : this || {});
    }).call(this, require("buffer").Buffer);
  }, {
    buffer: 2
  } ],
  8: [ function(require, module, exports) {
    arguments[4][3][0].apply(exports, arguments);
  }, {
    dup: 3
  } ],
  9: [ function(require, module, exports) {
    exports.encode = require("./encode").encode;
    exports.decode = require("./decode").decode;
    exports.Encoder = require("./encoder").Encoder;
    exports.Decoder = require("./decoder").Decoder;
    exports.createCodec = require("./ext").createCodec;
    exports.codec = require("./codec").codec;
  }, {
    "./codec": 18,
    "./decode": 20,
    "./decoder": 21,
    "./encode": 23,
    "./encoder": 24,
    "./ext": 28
  } ],
  10: [ function(require, module, exports) {
    (function(Buffer) {
      module.exports = c("undefined" !== typeof Buffer && Buffer) || c(this.Buffer) || c("undefined" !== typeof window && window.Buffer) || this.Buffer;
      function c(B) {
        return B && B.isBuffer && B;
      }
    }).call(this, require("buffer").Buffer);
  }, {
    buffer: 2
  } ],
  11: [ function(require, module, exports) {
    var MAXBUFLEN = 8192;
    exports.copy = copy;
    exports.toString = toString;
    exports.write = write;
    function write(string, offset) {
      var buffer = this;
      var index = offset || (offset |= 0);
      var length = string.length;
      var chr = 0;
      var i = 0;
      while (i < length) {
        chr = string.charCodeAt(i++);
        if (chr < 128) buffer[index++] = chr; else if (chr < 2048) {
          buffer[index++] = 192 | chr >>> 6;
          buffer[index++] = 128 | 63 & chr;
        } else if (chr < 55296 || chr > 57343) {
          buffer[index++] = 224 | chr >>> 12;
          buffer[index++] = 128 | chr >>> 6 & 63;
          buffer[index++] = 128 | 63 & chr;
        } else {
          chr = 65536 + (chr - 55296 << 10 | string.charCodeAt(i++) - 56320);
          buffer[index++] = 240 | chr >>> 18;
          buffer[index++] = 128 | chr >>> 12 & 63;
          buffer[index++] = 128 | chr >>> 6 & 63;
          buffer[index++] = 128 | 63 & chr;
        }
      }
      return index - offset;
    }
    function toString(encoding, start, end) {
      var buffer = this;
      var index = 0 | start;
      end || (end = buffer.length);
      var string = "";
      var chr = 0;
      while (index < end) {
        chr = buffer[index++];
        if (chr < 128) {
          string += String.fromCharCode(chr);
          continue;
        }
        192 === (224 & chr) ? chr = (31 & chr) << 6 | 63 & buffer[index++] : 224 === (240 & chr) ? chr = (15 & chr) << 12 | (63 & buffer[index++]) << 6 | 63 & buffer[index++] : 240 === (248 & chr) && (chr = (7 & chr) << 18 | (63 & buffer[index++]) << 12 | (63 & buffer[index++]) << 6 | 63 & buffer[index++]);
        if (chr >= 65536) {
          chr -= 65536;
          string += String.fromCharCode(55296 + (chr >>> 10), 56320 + (1023 & chr));
        } else string += String.fromCharCode(chr);
      }
      return string;
    }
    function copy(target, targetStart, start, end) {
      var i;
      start || (start = 0);
      end || 0 === end || (end = this.length);
      targetStart || (targetStart = 0);
      var len = end - start;
      if (target === this && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; i--) target[i + targetStart] = this[i + start]; else for (i = 0; i < len; i++) target[i + targetStart] = this[i + start];
      return len;
    }
  }, {} ],
  12: [ function(require, module, exports) {
    var Bufferish = require("./bufferish");
    var exports = module.exports = alloc(0);
    exports.alloc = alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Array(size);
    }
    function from(value) {
      if (!Bufferish.isBuffer(value) && Bufferish.isView(value)) value = Bufferish.Uint8Array.from(value); else if (Bufferish.isArrayBuffer(value)) value = new Uint8Array(value); else {
        if ("string" === typeof value) return Bufferish.from.call(exports, value);
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
      }
      return Array.prototype.slice.call(value);
    }
  }, {
    "./bufferish": 16
  } ],
  13: [ function(require, module, exports) {
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var exports = module.exports = Bufferish.hasBuffer ? alloc(0) : [];
    exports.alloc = Bufferish.hasBuffer && Buffer.alloc || alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Buffer(size);
    }
    function from(value) {
      if (!Bufferish.isBuffer(value) && Bufferish.isView(value)) value = Bufferish.Uint8Array.from(value); else if (Bufferish.isArrayBuffer(value)) value = new Uint8Array(value); else {
        if ("string" === typeof value) return Bufferish.from.call(exports, value);
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
      }
      return Buffer.from && 1 !== Buffer.from.length ? Buffer.from(value) : new Buffer(value);
    }
  }, {
    "./bufferish": 16
  } ],
  14: [ function(require, module, exports) {
    var BufferLite = require("./buffer-lite");
    exports.copy = copy;
    exports.slice = slice;
    exports.toString = toString;
    exports.write = gen("write");
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var isBufferShim = Bufferish.hasBuffer && "TYPED_ARRAY_SUPPORT" in Buffer;
    var brokenTypedArray = isBufferShim && !Buffer.TYPED_ARRAY_SUPPORT;
    function copy(target, targetStart, start, end) {
      var thisIsBuffer = Bufferish.isBuffer(this);
      var targetIsBuffer = Bufferish.isBuffer(target);
      if (thisIsBuffer && targetIsBuffer) return this.copy(target, targetStart, start, end);
      if (brokenTypedArray || thisIsBuffer || targetIsBuffer || !Bufferish.isView(this) || !Bufferish.isView(target)) return BufferLite.copy.call(this, target, targetStart, start, end);
      var buffer = start || null != end ? slice.call(this, start, end) : this;
      target.set(buffer, targetStart);
      return buffer.length;
    }
    function slice(start, end) {
      var f = this.slice || !brokenTypedArray && this.subarray;
      if (f) return f.call(this, start, end);
      var target = Bufferish.alloc.call(this, end - start);
      copy.call(this, target, 0, start, end);
      return target;
    }
    function toString(encoding, start, end) {
      var f = !isBufferShim && Bufferish.isBuffer(this) ? this.toString : BufferLite.toString;
      return f.apply(this, arguments);
    }
    function gen(method) {
      return wrap;
      function wrap() {
        var f = this[method] || BufferLite[method];
        return f.apply(this, arguments);
      }
    }
  }, {
    "./buffer-lite": 11,
    "./bufferish": 16
  } ],
  15: [ function(require, module, exports) {
    var Bufferish = require("./bufferish");
    var exports = module.exports = Bufferish.hasArrayBuffer ? alloc(0) : [];
    exports.alloc = alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Uint8Array(size);
    }
    function from(value) {
      if (Bufferish.isView(value)) {
        var byteOffset = value.byteOffset;
        var byteLength = value.byteLength;
        value = value.buffer;
        if (value.byteLength !== byteLength) if (value.slice) value = value.slice(byteOffset, byteOffset + byteLength); else {
          value = new Uint8Array(value);
          value.byteLength !== byteLength && (value = Array.prototype.slice.call(value, byteOffset, byteOffset + byteLength));
        }
      } else {
        if ("string" === typeof value) return Bufferish.from.call(exports, value);
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
      }
      return new Uint8Array(value);
    }
  }, {
    "./bufferish": 16
  } ],
  16: [ function(require, module, exports) {
    var Buffer = exports.global = require("./buffer-global");
    var hasBuffer = exports.hasBuffer = Buffer && !!Buffer.isBuffer;
    var hasArrayBuffer = exports.hasArrayBuffer = "undefined" !== typeof ArrayBuffer;
    var isArray = exports.isArray = require("isarray");
    exports.isArrayBuffer = hasArrayBuffer ? isArrayBuffer : _false;
    var isBuffer = exports.isBuffer = hasBuffer ? Buffer.isBuffer : _false;
    var isView = exports.isView = hasArrayBuffer ? ArrayBuffer.isView || _is("ArrayBuffer", "buffer") : _false;
    exports.alloc = alloc;
    exports.concat = concat;
    exports.from = from;
    var BufferArray = exports.Array = require("./bufferish-array");
    var BufferBuffer = exports.Buffer = require("./bufferish-buffer");
    var BufferUint8Array = exports.Uint8Array = require("./bufferish-uint8array");
    var BufferProto = exports.prototype = require("./bufferish-proto");
    function from(value) {
      return "string" === typeof value ? fromString.call(this, value) : auto(this).from(value);
    }
    function alloc(size) {
      return auto(this).alloc(size);
    }
    function concat(list, length) {
      if (!length) {
        length = 0;
        Array.prototype.forEach.call(list, dryrun);
      }
      var ref = this !== exports && this || list[0];
      var result = alloc.call(ref, length);
      var offset = 0;
      Array.prototype.forEach.call(list, append);
      return result;
      function dryrun(buffer) {
        length += buffer.length;
      }
      function append(buffer) {
        offset += BufferProto.copy.call(buffer, result, offset);
      }
    }
    var _isArrayBuffer = _is("ArrayBuffer");
    function isArrayBuffer(value) {
      return value instanceof ArrayBuffer || _isArrayBuffer(value);
    }
    function fromString(value) {
      var expected = 3 * value.length;
      var that = alloc.call(this, expected);
      var actual = BufferProto.write.call(that, value);
      expected !== actual && (that = BufferProto.slice.call(that, 0, actual));
      return that;
    }
    function auto(that) {
      return isBuffer(that) ? BufferBuffer : isView(that) ? BufferUint8Array : isArray(that) ? BufferArray : hasBuffer ? BufferBuffer : hasArrayBuffer ? BufferUint8Array : BufferArray;
    }
    function _false() {
      return false;
    }
    function _is(name, key) {
      name = "[object " + name + "]";
      return function(value) {
        return null != value && {}.toString.call(key ? value[key] : value) === name;
      };
    }
  }, {
    "./buffer-global": 10,
    "./bufferish-array": 12,
    "./bufferish-buffer": 13,
    "./bufferish-proto": 14,
    "./bufferish-uint8array": 15,
    isarray: 8
  } ],
  17: [ function(require, module, exports) {
    var IS_ARRAY = require("isarray");
    exports.createCodec = createCodec;
    exports.install = install;
    exports.filter = filter;
    var Bufferish = require("./bufferish");
    function Codec(options) {
      if (!(this instanceof Codec)) return new Codec(options);
      this.options = options;
      this.init();
    }
    Codec.prototype.init = function() {
      var options = this.options;
      options && options.uint8array && (this.bufferish = Bufferish.Uint8Array);
      return this;
    };
    function install(props) {
      for (var key in props) Codec.prototype[key] = add(Codec.prototype[key], props[key]);
    }
    function add(a, b) {
      return a && b ? ab : a || b;
      function ab() {
        a.apply(this, arguments);
        return b.apply(this, arguments);
      }
    }
    function join(filters) {
      filters = filters.slice();
      return function(value) {
        return filters.reduce(iterator, value);
      };
      function iterator(value, filter) {
        return filter(value);
      }
    }
    function filter(filter) {
      return IS_ARRAY(filter) ? join(filter) : filter;
    }
    function createCodec(options) {
      return new Codec(options);
    }
    exports.preset = createCodec({
      preset: true
    });
  }, {
    "./bufferish": 16,
    isarray: 8
  } ],
  18: [ function(require, module, exports) {
    require("./read-core");
    require("./write-core");
    exports.codec = {
      preset: require("./codec-base").preset
    };
  }, {
    "./codec-base": 17,
    "./read-core": 30,
    "./write-core": 33
  } ],
  19: [ function(require, module, exports) {
    exports.DecodeBuffer = DecodeBuffer;
    var preset = require("./read-core").preset;
    var FlexDecoder = require("./flex-buffer").FlexDecoder;
    FlexDecoder.mixin(DecodeBuffer.prototype);
    function DecodeBuffer(options) {
      if (!(this instanceof DecodeBuffer)) return new DecodeBuffer(options);
      if (options) {
        this.options = options;
        if (options.codec) {
          var codec = this.codec = options.codec;
          codec.bufferish && (this.bufferish = codec.bufferish);
        }
      }
    }
    DecodeBuffer.prototype.codec = preset;
    DecodeBuffer.prototype.fetch = function() {
      return this.codec.decode(this);
    };
  }, {
    "./flex-buffer": 29,
    "./read-core": 30
  } ],
  20: [ function(require, module, exports) {
    exports.decode = decode;
    var DecodeBuffer = require("./decode-buffer").DecodeBuffer;
    function decode(input, options) {
      var decoder = new DecodeBuffer(options);
      decoder.write(input);
      return decoder.read();
    }
  }, {
    "./decode-buffer": 19
  } ],
  21: [ function(require, module, exports) {
    exports.Decoder = Decoder;
    var EventLite = require("event-lite");
    var DecodeBuffer = require("./decode-buffer").DecodeBuffer;
    function Decoder(options) {
      if (!(this instanceof Decoder)) return new Decoder(options);
      DecodeBuffer.call(this, options);
    }
    Decoder.prototype = new DecodeBuffer();
    EventLite.mixin(Decoder.prototype);
    Decoder.prototype.decode = function(chunk) {
      arguments.length && this.write(chunk);
      this.flush();
    };
    Decoder.prototype.push = function(chunk) {
      this.emit("data", chunk);
    };
    Decoder.prototype.end = function(chunk) {
      this.decode(chunk);
      this.emit("end");
    };
  }, {
    "./decode-buffer": 19,
    "event-lite": 5
  } ],
  22: [ function(require, module, exports) {
    exports.EncodeBuffer = EncodeBuffer;
    var preset = require("./write-core").preset;
    var FlexEncoder = require("./flex-buffer").FlexEncoder;
    FlexEncoder.mixin(EncodeBuffer.prototype);
    function EncodeBuffer(options) {
      if (!(this instanceof EncodeBuffer)) return new EncodeBuffer(options);
      if (options) {
        this.options = options;
        if (options.codec) {
          var codec = this.codec = options.codec;
          codec.bufferish && (this.bufferish = codec.bufferish);
        }
      }
    }
    EncodeBuffer.prototype.codec = preset;
    EncodeBuffer.prototype.write = function(input) {
      this.codec.encode(this, input);
    };
  }, {
    "./flex-buffer": 29,
    "./write-core": 33
  } ],
  23: [ function(require, module, exports) {
    exports.encode = encode;
    var EncodeBuffer = require("./encode-buffer").EncodeBuffer;
    function encode(input, options) {
      var encoder = new EncodeBuffer(options);
      encoder.write(input);
      return encoder.read();
    }
  }, {
    "./encode-buffer": 22
  } ],
  24: [ function(require, module, exports) {
    exports.Encoder = Encoder;
    var EventLite = require("event-lite");
    var EncodeBuffer = require("./encode-buffer").EncodeBuffer;
    function Encoder(options) {
      if (!(this instanceof Encoder)) return new Encoder(options);
      EncodeBuffer.call(this, options);
    }
    Encoder.prototype = new EncodeBuffer();
    EventLite.mixin(Encoder.prototype);
    Encoder.prototype.encode = function(chunk) {
      this.write(chunk);
      this.emit("data", this.read());
    };
    Encoder.prototype.end = function(chunk) {
      arguments.length && this.encode(chunk);
      this.flush();
      this.emit("end");
    };
  }, {
    "./encode-buffer": 22,
    "event-lite": 5
  } ],
  25: [ function(require, module, exports) {
    exports.ExtBuffer = ExtBuffer;
    var Bufferish = require("./bufferish");
    function ExtBuffer(buffer, type) {
      if (!(this instanceof ExtBuffer)) return new ExtBuffer(buffer, type);
      this.buffer = Bufferish.from(buffer);
      this.type = type;
    }
  }, {
    "./bufferish": 16
  } ],
  26: [ function(require, module, exports) {
    exports.setExtPackers = setExtPackers;
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var packTypedArray = Bufferish.Uint8Array.from;
    var _encode;
    var ERROR_COLUMNS = {
      name: 1,
      message: 1,
      stack: 1,
      columnNumber: 1,
      fileName: 1,
      lineNumber: 1
    };
    function setExtPackers(codec) {
      codec.addExtPacker(14, Error, [ packError, encode ]);
      codec.addExtPacker(1, EvalError, [ packError, encode ]);
      codec.addExtPacker(2, RangeError, [ packError, encode ]);
      codec.addExtPacker(3, ReferenceError, [ packError, encode ]);
      codec.addExtPacker(4, SyntaxError, [ packError, encode ]);
      codec.addExtPacker(5, TypeError, [ packError, encode ]);
      codec.addExtPacker(6, URIError, [ packError, encode ]);
      codec.addExtPacker(10, RegExp, [ packRegExp, encode ]);
      codec.addExtPacker(11, Boolean, [ packValueOf, encode ]);
      codec.addExtPacker(12, String, [ packValueOf, encode ]);
      codec.addExtPacker(13, Date, [ Number, encode ]);
      codec.addExtPacker(15, Number, [ packValueOf, encode ]);
      if ("undefined" !== typeof Uint8Array) {
        codec.addExtPacker(17, Int8Array, packTypedArray);
        codec.addExtPacker(18, Uint8Array, packTypedArray);
        codec.addExtPacker(19, Int16Array, packTypedArray);
        codec.addExtPacker(20, Uint16Array, packTypedArray);
        codec.addExtPacker(21, Int32Array, packTypedArray);
        codec.addExtPacker(22, Uint32Array, packTypedArray);
        codec.addExtPacker(23, Float32Array, packTypedArray);
        "undefined" !== typeof Float64Array && codec.addExtPacker(24, Float64Array, packTypedArray);
        "undefined" !== typeof Uint8ClampedArray && codec.addExtPacker(25, Uint8ClampedArray, packTypedArray);
        codec.addExtPacker(26, ArrayBuffer, packTypedArray);
        codec.addExtPacker(29, DataView, packTypedArray);
      }
      Bufferish.hasBuffer && codec.addExtPacker(27, Buffer, Bufferish.from);
    }
    function encode(input) {
      _encode || (_encode = require("./encode").encode);
      return _encode(input);
    }
    function packValueOf(value) {
      return value.valueOf();
    }
    function packRegExp(value) {
      value = RegExp.prototype.toString.call(value).split("/");
      value.shift();
      var out = [ value.pop() ];
      out.unshift(value.join("/"));
      return out;
    }
    function packError(value) {
      var out = {};
      for (var key in ERROR_COLUMNS) out[key] = value[key];
      return out;
    }
  }, {
    "./bufferish": 16,
    "./encode": 23
  } ],
  27: [ function(require, module, exports) {
    exports.setExtUnpackers = setExtUnpackers;
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var _decode;
    var ERROR_COLUMNS = {
      name: 1,
      message: 1,
      stack: 1,
      columnNumber: 1,
      fileName: 1,
      lineNumber: 1
    };
    function setExtUnpackers(codec) {
      codec.addExtUnpacker(14, [ decode, unpackError(Error) ]);
      codec.addExtUnpacker(1, [ decode, unpackError(EvalError) ]);
      codec.addExtUnpacker(2, [ decode, unpackError(RangeError) ]);
      codec.addExtUnpacker(3, [ decode, unpackError(ReferenceError) ]);
      codec.addExtUnpacker(4, [ decode, unpackError(SyntaxError) ]);
      codec.addExtUnpacker(5, [ decode, unpackError(TypeError) ]);
      codec.addExtUnpacker(6, [ decode, unpackError(URIError) ]);
      codec.addExtUnpacker(10, [ decode, unpackRegExp ]);
      codec.addExtUnpacker(11, [ decode, unpackClass(Boolean) ]);
      codec.addExtUnpacker(12, [ decode, unpackClass(String) ]);
      codec.addExtUnpacker(13, [ decode, unpackClass(Date) ]);
      codec.addExtUnpacker(15, [ decode, unpackClass(Number) ]);
      if ("undefined" !== typeof Uint8Array) {
        codec.addExtUnpacker(17, unpackClass(Int8Array));
        codec.addExtUnpacker(18, unpackClass(Uint8Array));
        codec.addExtUnpacker(19, [ unpackArrayBuffer, unpackClass(Int16Array) ]);
        codec.addExtUnpacker(20, [ unpackArrayBuffer, unpackClass(Uint16Array) ]);
        codec.addExtUnpacker(21, [ unpackArrayBuffer, unpackClass(Int32Array) ]);
        codec.addExtUnpacker(22, [ unpackArrayBuffer, unpackClass(Uint32Array) ]);
        codec.addExtUnpacker(23, [ unpackArrayBuffer, unpackClass(Float32Array) ]);
        "undefined" !== typeof Float64Array && codec.addExtUnpacker(24, [ unpackArrayBuffer, unpackClass(Float64Array) ]);
        "undefined" !== typeof Uint8ClampedArray && codec.addExtUnpacker(25, unpackClass(Uint8ClampedArray));
        codec.addExtUnpacker(26, unpackArrayBuffer);
        codec.addExtUnpacker(29, [ unpackArrayBuffer, unpackClass(DataView) ]);
      }
      Bufferish.hasBuffer && codec.addExtUnpacker(27, unpackClass(Buffer));
    }
    function decode(input) {
      _decode || (_decode = require("./decode").decode);
      return _decode(input);
    }
    function unpackRegExp(value) {
      return RegExp.apply(null, value);
    }
    function unpackError(Class) {
      return function(value) {
        var out = new Class();
        for (var key in ERROR_COLUMNS) out[key] = value[key];
        return out;
      };
    }
    function unpackClass(Class) {
      return function(value) {
        return new Class(value);
      };
    }
    function unpackArrayBuffer(value) {
      return new Uint8Array(value).buffer;
    }
  }, {
    "./bufferish": 16,
    "./decode": 20
  } ],
  28: [ function(require, module, exports) {
    require("./read-core");
    require("./write-core");
    exports.createCodec = require("./codec-base").createCodec;
  }, {
    "./codec-base": 17,
    "./read-core": 30,
    "./write-core": 33
  } ],
  29: [ function(require, module, exports) {
    exports.FlexDecoder = FlexDecoder;
    exports.FlexEncoder = FlexEncoder;
    var Bufferish = require("./bufferish");
    var MIN_BUFFER_SIZE = 2048;
    var MAX_BUFFER_SIZE = 65536;
    var BUFFER_SHORTAGE = "BUFFER_SHORTAGE";
    function FlexDecoder() {
      if (!(this instanceof FlexDecoder)) return new FlexDecoder();
    }
    function FlexEncoder() {
      if (!(this instanceof FlexEncoder)) return new FlexEncoder();
    }
    FlexDecoder.mixin = mixinFactory(getDecoderMethods());
    FlexDecoder.mixin(FlexDecoder.prototype);
    FlexEncoder.mixin = mixinFactory(getEncoderMethods());
    FlexEncoder.mixin(FlexEncoder.prototype);
    function getDecoderMethods() {
      return {
        bufferish: Bufferish,
        write: write,
        fetch: fetch,
        flush: flush,
        push: push,
        pull: pull,
        read: read,
        reserve: reserve,
        offset: 0
      };
      function write(chunk) {
        var prev = this.offset ? Bufferish.prototype.slice.call(this.buffer, this.offset) : this.buffer;
        this.buffer = prev ? chunk ? this.bufferish.concat([ prev, chunk ]) : prev : chunk;
        this.offset = 0;
      }
      function flush() {
        while (this.offset < this.buffer.length) {
          var start = this.offset;
          var value;
          try {
            value = this.fetch();
          } catch (e) {
            if (e && e.message != BUFFER_SHORTAGE) throw e;
            this.offset = start;
            break;
          }
          this.push(value);
        }
      }
      function reserve(length) {
        var start = this.offset;
        var end = start + length;
        if (end > this.buffer.length) throw new Error(BUFFER_SHORTAGE);
        this.offset = end;
        return start;
      }
    }
    function getEncoderMethods() {
      return {
        bufferish: Bufferish,
        write: write,
        fetch: fetch,
        flush: flush,
        push: push,
        pull: pull,
        read: read,
        reserve: reserve,
        send: send,
        maxBufferSize: MAX_BUFFER_SIZE,
        minBufferSize: MIN_BUFFER_SIZE,
        offset: 0,
        start: 0
      };
      function fetch() {
        var start = this.start;
        if (start < this.offset) {
          var end = this.start = this.offset;
          return Bufferish.prototype.slice.call(this.buffer, start, end);
        }
      }
      function flush() {
        while (this.start < this.offset) {
          var value = this.fetch();
          value && this.push(value);
        }
      }
      function pull() {
        var buffers = this.buffers || (this.buffers = []);
        var chunk = buffers.length > 1 ? this.bufferish.concat(buffers) : buffers[0];
        buffers.length = 0;
        return chunk;
      }
      function reserve(length) {
        var req = 0 | length;
        if (this.buffer) {
          var size = this.buffer.length;
          var start = 0 | this.offset;
          var end = start + req;
          if (end < size) {
            this.offset = end;
            return start;
          }
          this.flush();
          length = Math.max(length, Math.min(2 * size, this.maxBufferSize));
        }
        length = Math.max(length, this.minBufferSize);
        this.buffer = this.bufferish.alloc(length);
        this.start = 0;
        this.offset = req;
        return 0;
      }
      function send(buffer) {
        var length = buffer.length;
        if (length > this.minBufferSize) {
          this.flush();
          this.push(buffer);
        } else {
          var offset = this.reserve(length);
          Bufferish.prototype.copy.call(buffer, this.buffer, offset);
        }
      }
    }
    function write() {
      throw new Error("method not implemented: write()");
    }
    function fetch() {
      throw new Error("method not implemented: fetch()");
    }
    function read() {
      var length = this.buffers && this.buffers.length;
      if (!length) return this.fetch();
      this.flush();
      return this.pull();
    }
    function push(chunk) {
      var buffers = this.buffers || (this.buffers = []);
      buffers.push(chunk);
    }
    function pull() {
      var buffers = this.buffers || (this.buffers = []);
      return buffers.shift();
    }
    function mixinFactory(source) {
      return mixin;
      function mixin(target) {
        for (var key in source) target[key] = source[key];
        return target;
      }
    }
  }, {
    "./bufferish": 16
  } ],
  30: [ function(require, module, exports) {
    var ExtBuffer = require("./ext-buffer").ExtBuffer;
    var ExtUnpacker = require("./ext-unpacker");
    var readUint8 = require("./read-format").readUint8;
    var ReadToken = require("./read-token");
    var CodecBase = require("./codec-base");
    CodecBase.install({
      addExtUnpacker: addExtUnpacker,
      getExtUnpacker: getExtUnpacker,
      init: init
    });
    exports.preset = init.call(CodecBase.preset);
    function getDecoder(options) {
      var readToken = ReadToken.getReadToken(options);
      return decode;
      function decode(decoder) {
        var type = readUint8(decoder);
        var func = readToken[type];
        if (!func) throw new Error("Invalid type: " + (type ? "0x" + type.toString(16) : type));
        return func(decoder);
      }
    }
    function init() {
      var options = this.options;
      this.decode = getDecoder(options);
      options && options.preset && ExtUnpacker.setExtUnpackers(this);
      return this;
    }
    function addExtUnpacker(etype, unpacker) {
      var unpackers = this.extUnpackers || (this.extUnpackers = []);
      unpackers[etype] = CodecBase.filter(unpacker);
    }
    function getExtUnpacker(type) {
      var unpackers = this.extUnpackers || (this.extUnpackers = []);
      return unpackers[type] || extUnpacker;
      function extUnpacker(buffer) {
        return new ExtBuffer(buffer, type);
      }
    }
  }, {
    "./codec-base": 17,
    "./ext-buffer": 25,
    "./ext-unpacker": 27,
    "./read-format": 31,
    "./read-token": 32
  } ],
  31: [ function(require, module, exports) {
    var ieee754 = require("ieee754");
    var Int64Buffer = require("int64-buffer");
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    exports.getReadFormat = getReadFormat;
    exports.readUint8 = uint8;
    var Bufferish = require("./bufferish");
    var BufferProto = require("./bufferish-proto");
    var HAS_MAP = "undefined" !== typeof Map;
    var NO_ASSERT = true;
    function getReadFormat(options) {
      var binarraybuffer = Bufferish.hasArrayBuffer && options && options.binarraybuffer;
      var int64 = options && options.int64;
      var usemap = HAS_MAP && options && options.usemap;
      var readFormat = {
        map: usemap ? map_to_map : map_to_obj,
        array: array,
        str: str,
        bin: binarraybuffer ? bin_arraybuffer : bin_buffer,
        ext: ext,
        uint8: uint8,
        uint16: uint16,
        uint32: uint32,
        uint64: read(8, int64 ? readUInt64BE_int64 : readUInt64BE),
        int8: int8,
        int16: int16,
        int32: int32,
        int64: read(8, int64 ? readInt64BE_int64 : readInt64BE),
        float32: read(4, readFloatBE),
        float64: read(8, readDoubleBE)
      };
      return readFormat;
    }
    function map_to_obj(decoder, len) {
      var value = {};
      var i;
      var k = new Array(len);
      var v = new Array(len);
      var decode = decoder.codec.decode;
      for (i = 0; i < len; i++) {
        k[i] = decode(decoder);
        v[i] = decode(decoder);
      }
      for (i = 0; i < len; i++) value[k[i]] = v[i];
      return value;
    }
    function map_to_map(decoder, len) {
      var value = new Map();
      var i;
      var k = new Array(len);
      var v = new Array(len);
      var decode = decoder.codec.decode;
      for (i = 0; i < len; i++) {
        k[i] = decode(decoder);
        v[i] = decode(decoder);
      }
      for (i = 0; i < len; i++) value.set(k[i], v[i]);
      return value;
    }
    function array(decoder, len) {
      var value = new Array(len);
      var decode = decoder.codec.decode;
      for (var i = 0; i < len; i++) value[i] = decode(decoder);
      return value;
    }
    function str(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      return BufferProto.toString.call(decoder.buffer, "utf-8", start, end);
    }
    function bin_buffer(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return Bufferish.from(buf);
    }
    function bin_arraybuffer(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return Bufferish.Uint8Array.from(buf).buffer;
    }
    function ext(decoder, len) {
      var start = decoder.reserve(len + 1);
      var type = decoder.buffer[start++];
      var end = start + len;
      var unpack = decoder.codec.getExtUnpacker(type);
      if (!unpack) throw new Error("Invalid ext type: " + (type ? "0x" + type.toString(16) : type));
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return unpack(buf);
    }
    function uint8(decoder) {
      var start = decoder.reserve(1);
      return decoder.buffer[start];
    }
    function int8(decoder) {
      var start = decoder.reserve(1);
      var value = decoder.buffer[start];
      return 128 & value ? value - 256 : value;
    }
    function uint16(decoder) {
      var start = decoder.reserve(2);
      var buffer = decoder.buffer;
      return buffer[start++] << 8 | buffer[start];
    }
    function int16(decoder) {
      var start = decoder.reserve(2);
      var buffer = decoder.buffer;
      var value = buffer[start++] << 8 | buffer[start];
      return 32768 & value ? value - 65536 : value;
    }
    function uint32(decoder) {
      var start = decoder.reserve(4);
      var buffer = decoder.buffer;
      return 16777216 * buffer[start++] + (buffer[start++] << 16) + (buffer[start++] << 8) + buffer[start];
    }
    function int32(decoder) {
      var start = decoder.reserve(4);
      var buffer = decoder.buffer;
      return buffer[start++] << 24 | buffer[start++] << 16 | buffer[start++] << 8 | buffer[start];
    }
    function read(len, method) {
      return function(decoder) {
        var start = decoder.reserve(len);
        return method.call(decoder.buffer, start, NO_ASSERT);
      };
    }
    function readUInt64BE(start) {
      return new Uint64BE(this, start).toNumber();
    }
    function readInt64BE(start) {
      return new Int64BE(this, start).toNumber();
    }
    function readUInt64BE_int64(start) {
      return new Uint64BE(this, start);
    }
    function readInt64BE_int64(start) {
      return new Int64BE(this, start);
    }
    function readFloatBE(start) {
      return ieee754.read(this, start, false, 23, 4);
    }
    function readDoubleBE(start) {
      return ieee754.read(this, start, false, 52, 8);
    }
  }, {
    "./bufferish": 16,
    "./bufferish-proto": 14,
    ieee754: 6,
    "int64-buffer": 7
  } ],
  32: [ function(require, module, exports) {
    var ReadFormat = require("./read-format");
    exports.getReadToken = getReadToken;
    function getReadToken(options) {
      var format = ReadFormat.getReadFormat(options);
      return options && options.useraw ? init_useraw(format) : init_token(format);
    }
    function init_token(format) {
      var i;
      var token = new Array(256);
      for (i = 0; i <= 127; i++) token[i] = constant(i);
      for (i = 128; i <= 143; i++) token[i] = fix(i - 128, format.map);
      for (i = 144; i <= 159; i++) token[i] = fix(i - 144, format.array);
      for (i = 160; i <= 191; i++) token[i] = fix(i - 160, format.str);
      token[192] = constant(null);
      token[193] = null;
      token[194] = constant(false);
      token[195] = constant(true);
      token[196] = flex(format.uint8, format.bin);
      token[197] = flex(format.uint16, format.bin);
      token[198] = flex(format.uint32, format.bin);
      token[199] = flex(format.uint8, format.ext);
      token[200] = flex(format.uint16, format.ext);
      token[201] = flex(format.uint32, format.ext);
      token[202] = format.float32;
      token[203] = format.float64;
      token[204] = format.uint8;
      token[205] = format.uint16;
      token[206] = format.uint32;
      token[207] = format.uint64;
      token[208] = format.int8;
      token[209] = format.int16;
      token[210] = format.int32;
      token[211] = format.int64;
      token[212] = fix(1, format.ext);
      token[213] = fix(2, format.ext);
      token[214] = fix(4, format.ext);
      token[215] = fix(8, format.ext);
      token[216] = fix(16, format.ext);
      token[217] = flex(format.uint8, format.str);
      token[218] = flex(format.uint16, format.str);
      token[219] = flex(format.uint32, format.str);
      token[220] = flex(format.uint16, format.array);
      token[221] = flex(format.uint32, format.array);
      token[222] = flex(format.uint16, format.map);
      token[223] = flex(format.uint32, format.map);
      for (i = 224; i <= 255; i++) token[i] = constant(i - 256);
      return token;
    }
    function init_useraw(format) {
      var i;
      var token = init_token(format).slice();
      token[217] = token[196];
      token[218] = token[197];
      token[219] = token[198];
      for (i = 160; i <= 191; i++) token[i] = fix(i - 160, format.bin);
      return token;
    }
    function constant(value) {
      return function() {
        return value;
      };
    }
    function flex(lenFunc, decodeFunc) {
      return function(decoder) {
        var len = lenFunc(decoder);
        return decodeFunc(decoder, len);
      };
    }
    function fix(len, method) {
      return function(decoder) {
        return method(decoder, len);
      };
    }
  }, {
    "./read-format": 31
  } ],
  33: [ function(require, module, exports) {
    var ExtBuffer = require("./ext-buffer").ExtBuffer;
    var ExtPacker = require("./ext-packer");
    var WriteType = require("./write-type");
    var CodecBase = require("./codec-base");
    CodecBase.install({
      addExtPacker: addExtPacker,
      getExtPacker: getExtPacker,
      init: init
    });
    exports.preset = init.call(CodecBase.preset);
    function getEncoder(options) {
      var writeType = WriteType.getWriteType(options);
      return encode;
      function encode(encoder, value) {
        var func = writeType[typeof value];
        if (!func) throw new Error('Unsupported type "' + typeof value + '": ' + value);
        func(encoder, value);
      }
    }
    function init() {
      var options = this.options;
      this.encode = getEncoder(options);
      options && options.preset && ExtPacker.setExtPackers(this);
      return this;
    }
    function addExtPacker(etype, Class, packer) {
      packer = CodecBase.filter(packer);
      var name = Class.name;
      if (name && "Object" !== name) {
        var packers = this.extPackers || (this.extPackers = {});
        packers[name] = extPacker;
      } else {
        var list = this.extEncoderList || (this.extEncoderList = []);
        list.unshift([ Class, extPacker ]);
      }
      function extPacker(value) {
        packer && (value = packer(value));
        return new ExtBuffer(value, etype);
      }
    }
    function getExtPacker(value) {
      var packers = this.extPackers || (this.extPackers = {});
      var c = value.constructor;
      var e = c && c.name && packers[c.name];
      if (e) return e;
      var list = this.extEncoderList || (this.extEncoderList = []);
      var len = list.length;
      for (var i = 0; i < len; i++) {
        var pair = list[i];
        if (c === pair[0]) return pair[1];
      }
    }
  }, {
    "./codec-base": 17,
    "./ext-buffer": 25,
    "./ext-packer": 26,
    "./write-type": 35
  } ],
  34: [ function(require, module, exports) {
    var ieee754 = require("ieee754");
    var Int64Buffer = require("int64-buffer");
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    var uint8 = require("./write-uint8").uint8;
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var IS_BUFFER_SHIM = Bufferish.hasBuffer && "TYPED_ARRAY_SUPPORT" in Buffer;
    var NO_TYPED_ARRAY = IS_BUFFER_SHIM && !Buffer.TYPED_ARRAY_SUPPORT;
    var Buffer_prototype = Bufferish.hasBuffer && Buffer.prototype || {};
    exports.getWriteToken = getWriteToken;
    function getWriteToken(options) {
      return options && options.uint8array ? init_uint8array() : NO_TYPED_ARRAY || Bufferish.hasBuffer && options && options.safe ? init_safe() : init_token();
    }
    function init_uint8array() {
      var token = init_token();
      token[202] = writeN(202, 4, writeFloatBE);
      token[203] = writeN(203, 8, writeDoubleBE);
      return token;
    }
    function init_token() {
      var token = uint8.slice();
      token[196] = write1(196);
      token[197] = write2(197);
      token[198] = write4(198);
      token[199] = write1(199);
      token[200] = write2(200);
      token[201] = write4(201);
      token[202] = writeN(202, 4, Buffer_prototype.writeFloatBE || writeFloatBE, true);
      token[203] = writeN(203, 8, Buffer_prototype.writeDoubleBE || writeDoubleBE, true);
      token[204] = write1(204);
      token[205] = write2(205);
      token[206] = write4(206);
      token[207] = writeN(207, 8, writeUInt64BE);
      token[208] = write1(208);
      token[209] = write2(209);
      token[210] = write4(210);
      token[211] = writeN(211, 8, writeInt64BE);
      token[217] = write1(217);
      token[218] = write2(218);
      token[219] = write4(219);
      token[220] = write2(220);
      token[221] = write4(221);
      token[222] = write2(222);
      token[223] = write4(223);
      return token;
    }
    function init_safe() {
      var token = uint8.slice();
      token[196] = writeN(196, 1, Buffer.prototype.writeUInt8);
      token[197] = writeN(197, 2, Buffer.prototype.writeUInt16BE);
      token[198] = writeN(198, 4, Buffer.prototype.writeUInt32BE);
      token[199] = writeN(199, 1, Buffer.prototype.writeUInt8);
      token[200] = writeN(200, 2, Buffer.prototype.writeUInt16BE);
      token[201] = writeN(201, 4, Buffer.prototype.writeUInt32BE);
      token[202] = writeN(202, 4, Buffer.prototype.writeFloatBE);
      token[203] = writeN(203, 8, Buffer.prototype.writeDoubleBE);
      token[204] = writeN(204, 1, Buffer.prototype.writeUInt8);
      token[205] = writeN(205, 2, Buffer.prototype.writeUInt16BE);
      token[206] = writeN(206, 4, Buffer.prototype.writeUInt32BE);
      token[207] = writeN(207, 8, writeUInt64BE);
      token[208] = writeN(208, 1, Buffer.prototype.writeInt8);
      token[209] = writeN(209, 2, Buffer.prototype.writeInt16BE);
      token[210] = writeN(210, 4, Buffer.prototype.writeInt32BE);
      token[211] = writeN(211, 8, writeInt64BE);
      token[217] = writeN(217, 1, Buffer.prototype.writeUInt8);
      token[218] = writeN(218, 2, Buffer.prototype.writeUInt16BE);
      token[219] = writeN(219, 4, Buffer.prototype.writeUInt32BE);
      token[220] = writeN(220, 2, Buffer.prototype.writeUInt16BE);
      token[221] = writeN(221, 4, Buffer.prototype.writeUInt32BE);
      token[222] = writeN(222, 2, Buffer.prototype.writeUInt16BE);
      token[223] = writeN(223, 4, Buffer.prototype.writeUInt32BE);
      return token;
    }
    function write1(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(2);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset] = value;
      };
    }
    function write2(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(3);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset++] = value >>> 8;
        buffer[offset] = value;
      };
    }
    function write4(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(5);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset++] = value >>> 24;
        buffer[offset++] = value >>> 16;
        buffer[offset++] = value >>> 8;
        buffer[offset] = value;
      };
    }
    function writeN(type, len, method, noAssert) {
      return function(encoder, value) {
        var offset = encoder.reserve(len + 1);
        encoder.buffer[offset++] = type;
        method.call(encoder.buffer, value, offset, noAssert);
      };
    }
    function writeUInt64BE(value, offset) {
      new Uint64BE(this, offset, value);
    }
    function writeInt64BE(value, offset) {
      new Int64BE(this, offset, value);
    }
    function writeFloatBE(value, offset) {
      ieee754.write(this, value, offset, false, 23, 4);
    }
    function writeDoubleBE(value, offset) {
      ieee754.write(this, value, offset, false, 52, 8);
    }
  }, {
    "./bufferish": 16,
    "./write-uint8": 36,
    ieee754: 6,
    "int64-buffer": 7
  } ],
  35: [ function(require, module, exports) {
    var IS_ARRAY = require("isarray");
    var Int64Buffer = require("int64-buffer");
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    var Bufferish = require("./bufferish");
    var BufferProto = require("./bufferish-proto");
    var WriteToken = require("./write-token");
    var uint8 = require("./write-uint8").uint8;
    var ExtBuffer = require("./ext-buffer").ExtBuffer;
    var HAS_UINT8ARRAY = "undefined" !== typeof Uint8Array;
    var HAS_MAP = "undefined" !== typeof Map;
    var extmap = [];
    extmap[1] = 212;
    extmap[2] = 213;
    extmap[4] = 214;
    extmap[8] = 215;
    extmap[16] = 216;
    exports.getWriteType = getWriteType;
    function getWriteType(options) {
      var token = WriteToken.getWriteToken(options);
      var useraw = options && options.useraw;
      var binarraybuffer = HAS_UINT8ARRAY && options && options.binarraybuffer;
      var isBuffer = binarraybuffer ? Bufferish.isArrayBuffer : Bufferish.isBuffer;
      var bin = binarraybuffer ? bin_arraybuffer : bin_buffer;
      var usemap = HAS_MAP && options && options.usemap;
      var map = usemap ? map_to_map : obj_to_map;
      var writeType = {
        boolean: bool,
        function: nil,
        number: number,
        object: useraw ? object_raw : object,
        string: _string(useraw ? raw_head_size : str_head_size),
        symbol: nil,
        undefined: nil
      };
      return writeType;
      function bool(encoder, value) {
        var type = value ? 195 : 194;
        token[type](encoder, value);
      }
      function number(encoder, value) {
        var ivalue = 0 | value;
        var type;
        if (value !== ivalue) {
          type = 203;
          token[type](encoder, value);
          return;
        }
        type = -32 <= ivalue && ivalue <= 127 ? 255 & ivalue : 0 <= ivalue ? ivalue <= 255 ? 204 : ivalue <= 65535 ? 205 : 206 : -128 <= ivalue ? 208 : -32768 <= ivalue ? 209 : 210;
        token[type](encoder, ivalue);
      }
      function uint64(encoder, value) {
        var type = 207;
        token[type](encoder, value.toArray());
      }
      function int64(encoder, value) {
        var type = 211;
        token[type](encoder, value.toArray());
      }
      function str_head_size(length) {
        return length < 32 ? 1 : length <= 255 ? 2 : length <= 65535 ? 3 : 5;
      }
      function raw_head_size(length) {
        return length < 32 ? 1 : length <= 65535 ? 3 : 5;
      }
      function _string(head_size) {
        return string;
        function string(encoder, value) {
          var length = value.length;
          var maxsize = 5 + 3 * length;
          encoder.offset = encoder.reserve(maxsize);
          var buffer = encoder.buffer;
          var expected = head_size(length);
          var start = encoder.offset + expected;
          length = BufferProto.write.call(buffer, value, start);
          var actual = head_size(length);
          if (expected !== actual) {
            var targetStart = start + actual - expected;
            var end = start + length;
            BufferProto.copy.call(buffer, buffer, targetStart, start, end);
          }
          var type = 1 === actual ? 160 + length : actual <= 3 ? 215 + actual : 219;
          token[type](encoder, length);
          encoder.offset += length;
        }
      }
      function object(encoder, value) {
        if (null === value) return nil(encoder, value);
        if (isBuffer(value)) return bin(encoder, value);
        if (IS_ARRAY(value)) return array(encoder, value);
        if (Uint64BE.isUint64BE(value)) return uint64(encoder, value);
        if (Int64BE.isInt64BE(value)) return int64(encoder, value);
        var packer = encoder.codec.getExtPacker(value);
        packer && (value = packer(value));
        if (value instanceof ExtBuffer) return ext(encoder, value);
        map(encoder, value);
      }
      function object_raw(encoder, value) {
        if (isBuffer(value)) return raw(encoder, value);
        object(encoder, value);
      }
      function nil(encoder, value) {
        var type = 192;
        token[type](encoder, value);
      }
      function array(encoder, value) {
        var length = value.length;
        var type = length < 16 ? 144 + length : length <= 65535 ? 220 : 221;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        for (var i = 0; i < length; i++) encode(encoder, value[i]);
      }
      function bin_buffer(encoder, value) {
        var length = value.length;
        var type = length < 255 ? 196 : length <= 65535 ? 197 : 198;
        token[type](encoder, length);
        encoder.send(value);
      }
      function bin_arraybuffer(encoder, value) {
        bin_buffer(encoder, new Uint8Array(value));
      }
      function ext(encoder, value) {
        var buffer = value.buffer;
        var length = buffer.length;
        var type = extmap[length] || (length < 255 ? 199 : length <= 65535 ? 200 : 201);
        token[type](encoder, length);
        uint8[value.type](encoder);
        encoder.send(buffer);
      }
      function obj_to_map(encoder, value) {
        var keys = Object.keys(value);
        var length = keys.length;
        var type = length < 16 ? 128 + length : length <= 65535 ? 222 : 223;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        keys.forEach(function(key) {
          encode(encoder, key);
          encode(encoder, value[key]);
        });
      }
      function map_to_map(encoder, value) {
        if (!(value instanceof Map)) return obj_to_map(encoder, value);
        var length = value.size;
        var type = length < 16 ? 128 + length : length <= 65535 ? 222 : 223;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        value.forEach(function(val, key, m) {
          encode(encoder, key);
          encode(encoder, val);
        });
      }
      function raw(encoder, value) {
        var length = value.length;
        var type = length < 32 ? 160 + length : length <= 65535 ? 218 : 219;
        token[type](encoder, length);
        encoder.send(value);
      }
    }
  }, {
    "./bufferish": 16,
    "./bufferish-proto": 14,
    "./ext-buffer": 25,
    "./write-token": 34,
    "./write-uint8": 36,
    "int64-buffer": 7,
    isarray: 8
  } ],
  36: [ function(require, module, exports) {
    var constant = exports.uint8 = new Array(256);
    for (var i = 0; i <= 255; i++) constant[i] = write0(i);
    function write0(type) {
      return function(encoder) {
        var offset = encoder.reserve(1);
        encoder.buffer[offset] = type;
      };
    }
  }, {} ],
  37: [ function(require, module, exports) {
    var msgpack = require("msgpack-lite");
    var options = {
      codec: msgpack.createCodec({
        binarraybuffer: true,
        preset: false
      })
    };
    var compressPublishPacket = function(object) {
      if ("#publish" != object.event || null == object.data) return;
      var pubArray = [ object.data.channel, object.data.data ];
      null != object.cid && pubArray.push(object.cid);
      object.p = pubArray;
      delete object.event;
      delete object.data;
      delete object.cid;
    };
    var decompressPublishPacket = function(object) {
      if (null == object.p) return;
      object.event = "#publish";
      object.data = {
        channel: object.p[0],
        data: object.p[1]
      };
      null != object.p[2] && (object.cid = object.p[2]);
      delete object.p;
    };
    var compressEmitPacket = function(object) {
      if (null == object.event) return;
      object.e = [ object.event, object.data ];
      null != object.cid && object.e.push(object.cid);
      delete object.event;
      delete object.data;
      delete object.cid;
    };
    var decompressEmitPacket = function(object) {
      if (null == object.e) return;
      object.event = object.e[0];
      object.data = object.e[1];
      null != object.e[2] && (object.cid = object.e[2]);
      delete object.e;
    };
    var compressResponsePacket = function(object) {
      if (null == object.rid) return;
      object.r = [ object.rid, object.error, object.data ];
      delete object.rid;
      delete object.error;
      delete object.data;
    };
    var decompressResponsePacket = function(object) {
      if (null == object.r) return;
      object.rid = object.r[0];
      object.error = object.r[1];
      object.data = object.r[2];
      delete object.r;
    };
    var clonePacket = function(object) {
      var clone = {};
      for (var i in object) object.hasOwnProperty(i) && (clone[i] = object[i]);
      return clone;
    };
    var compressSinglePacket = function(object) {
      object = clonePacket(object);
      compressPublishPacket(object);
      compressEmitPacket(object);
      compressResponsePacket(object);
      return object;
    };
    var decompressSinglePacket = function(object) {
      decompressEmitPacket(object);
      decompressPublishPacket(object);
      decompressResponsePacket(object);
    };
    module.exports.encode = function(object) {
      if (object) if (Array.isArray(object)) {
        var len = object.length;
        for (var i = 0; i < len; i++) object[i] = compressSinglePacket(object[i]);
      } else null == object.event && null == object.rid || (object = compressSinglePacket(object));
      return msgpack.encode(object, options);
    };
    module.exports.decode = function(str) {
      str = new Uint8Array(str);
      var object = msgpack.decode(str, options);
      if (Array.isArray(object)) {
        var len = object.length;
        for (var i = 0; i < len; i++) decompressSinglePacket(object[i]);
      } else decompressSinglePacket(object);
      return object;
    };
  }, {
    "msgpack-lite": 9
  } ],
  AccumulatedBar1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "70436sroTRDw6DUOZ0pjarm", "AccumulatedBar1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AccumulatedBar_1 = require("../../../scripts/Components/AccumulatedBar");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AccumulatedBar1 = function(_super) {
      __extends(AccumulatedBar1, _super);
      function AccumulatedBar1() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AccumulatedBar1 = __decorate([ ccclass ], AccumulatedBar1);
      return AccumulatedBar1;
    }(AccumulatedBar_1.default);
    exports.default = AccumulatedBar1;
    cc._RF.pop();
  }, {
    "../../../scripts/Components/AccumulatedBar": "AccumulatedBar"
  } ],
  AccumulatedBar2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2400bjcxatI3aMiaRjnFYPJ", "AccumulatedBar2");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AccumulatedBar_1 = require("../../../scripts/Components/AccumulatedBar");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AccumulatedBar2 = function(_super) {
      __extends(AccumulatedBar2, _super);
      function AccumulatedBar2() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AccumulatedBar2 = __decorate([ ccclass ], AccumulatedBar2);
      return AccumulatedBar2;
    }(AccumulatedBar_1.default);
    exports.default = AccumulatedBar2;
    cc._RF.pop();
  }, {
    "../../../scripts/Components/AccumulatedBar": "AccumulatedBar"
  } ],
  AccumulatedBar: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d943fjlle1CPIHPsnhlogIb", "AccumulatedBar");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var EType;
    (function(EType) {
      EType[EType["BAR"] = 1] = "BAR";
      EType[EType["CIRCLE"] = 2] = "CIRCLE";
    })(EType = exports.EType || (exports.EType = {}));
    var AccumulatedBar = function(_super) {
      __extends(AccumulatedBar, _super);
      function AccumulatedBar() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.bar = null;
        _this.lbPercent = null;
        _this.type = EType.BAR;
        _this.maxLength = 0;
        _this.minLength = 0;
        _this.progress = 1;
        _this.lerpRatio = 10;
        _this.fps = 30;
        _this.loop = false;
        _this.listenner = void 0;
        _this.loopListenner = void 0;
        _this.nodeTail = void 0;
        _this.maskTail = void 0;
        _this._tempProgress = 0;
        _this._tempSetTimeout = null;
        return _this;
      }
      AccumulatedBar.prototype.onLoad = function() {
        this.updateProgress(0);
        if (this.type == EType.CIRCLE) {
          this.maskTail = this.bar.getChildByName("tail");
          this.maskTail && (this.nodeTail = this.maskTail.getChildByName("tail"));
        }
      };
      AccumulatedBar.prototype.setProgress = function(progres, animation) {
        void 0 === animation && (animation = true);
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!animation) return [ 3, 5 ];
              if (!!this.loop) return [ 3, 1 ];
              this.updateProgress(progres);
              return [ 3, 4 ];

             case 1:
              if (!(progres < this.progress)) return [ 3, 3 ];
              this.updateProgress(1);
              return [ 4, new Promise(function(res, rej) {
                _this.lerpRatio = 50;
                _this.loopListenner = function(percent) {
                  1 === percent && res();
                };
              }) ];

             case 2:
              _a.sent();
              if (this && this.node && this._tempProgress && this.updateLength) {
                this.lerpRatio = 10;
                this._tempProgress = 0;
                this.updateLength();
              }
              _a.label = 3;

             case 3:
              this && this.node && this.updateProgress && this.updateProgress(progres);
              _a.label = 4;

             case 4:
              return [ 3, 6 ];

             case 5:
              this.progress = progres;
              this._tempProgress = progres;
              this.updateLength();
              _a.label = 6;

             case 6:
              return [ 2 ];
            }
          });
        });
      };
      AccumulatedBar.prototype.updateProgress = function(progress) {
        var _this = this;
        if (null != progress) {
          progress > 1 && (progress = 1);
          progress < 0 && (progress = 0);
          this.progress = progress;
        }
        this.updateLength();
        if (Math.abs(this.progress - this._tempProgress) < .004) {
          this._tempProgress = this.progress;
          if (1 == this._tempProgress && this.type == EType.CIRCLE && !this.loop && this.nodeTail) {
            this.nodeTail.stopAllActions();
            this.nodeTail.runAction(cc.repeatForever(cc.sequence(cc.rotateBy(.7, 360).easing(cc.easeCubicActionOut()), cc.delayTime(.4))));
          }
          return true;
        }
        var delta = this.progress - this._tempProgress;
        -1 != this.lerpRatio ? this._tempProgress = delta * this.lerpRatio / 10 / this.fps + this._tempProgress : this._tempProgress += .2 * (this.progress - this._tempProgress);
        this.node.runAction(cc.sequence(cc.delayTime(1 / this.fps), cc.callFunc(function() {
          _this.updateProgress();
          _this.lbPercent && (_this.lbPercent.string = (100 * _this._tempProgress).toFixed(0) + "%");
          _this.listenner && _this.listenner(100 * _this._tempProgress);
          _this.loopListenner && _this.loopListenner(_this._tempProgress);
        })));
      };
      AccumulatedBar.prototype.setListener = function(listenner) {
        this.listenner = listenner;
      };
      AccumulatedBar.prototype.onDestroy = function() {};
      AccumulatedBar.prototype.updateLength = function() {
        if (this.type === EType.BAR) this.bar.width = (this.maxLength - this.minLength) * this._tempProgress + this.minLength; else if (this.type === EType.CIRCLE) {
          this.bar.getComponent(cc.Sprite).fillRange = -this._tempProgress;
          if (this.maskTail) {
            this.nodeTail.getNumberOfRunningActions() && this.nodeTail.stopAllActions();
            this._tempProgress < .4 ? this.maskTail.setContentSize(cc.size(.5 * this.bar.width, this.bar.height)) : this._tempProgress >= .4 && this.maskTail.setContentSize(cc.size(0, 0));
          }
          this.maskTail && this.nodeTail && (this.nodeTail.rotation = 360 * this._tempProgress + 5);
        }
      };
      __decorate([ property(cc.Node) ], AccumulatedBar.prototype, "bar", void 0);
      __decorate([ property(cc.Label) ], AccumulatedBar.prototype, "lbPercent", void 0);
      __decorate([ property({
        type: cc.Enum(EType)
      }) ], AccumulatedBar.prototype, "type", void 0);
      __decorate([ property(cc.Float) ], AccumulatedBar.prototype, "maxLength", void 0);
      __decorate([ property(cc.Float) ], AccumulatedBar.prototype, "minLength", void 0);
      __decorate([ property({
        type: cc.Float,
        min: 0,
        max: 1,
        slide: true
      }) ], AccumulatedBar.prototype, "progress", void 0);
      __decorate([ property(cc.Integer) ], AccumulatedBar.prototype, "lerpRatio", void 0);
      __decorate([ property(cc.Integer) ], AccumulatedBar.prototype, "fps", void 0);
      __decorate([ property(cc.Boolean) ], AccumulatedBar.prototype, "loop", void 0);
      AccumulatedBar = __decorate([ ccclass ], AccumulatedBar);
      return AccumulatedBar;
    }(cc.Component);
    exports.default = AccumulatedBar;
    cc._RF.pop();
  }, {} ],
  AndroidAdmob: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5d46851zJRPi7E2wa+NDVIh", "AndroidAdmob");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AndroidAdmob = function() {
      function AndroidAdmob() {
        this.tag = "AndroidAdmob";
        this.isBannerShow = false;
      }
      AndroidAdmob.getIns = function() {
        this.intance || (this.intance = new AndroidAdmob());
        return this.intance;
      };
      AndroidAdmob.prototype.init = function() {
        game.log(this.tag, "admob", "init");
        var plugin = sdkbox.PluginAdMob;
        plugin.setListener({
          adViewDidReceiveAd: function(name) {
            AndroidAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.DIDRECEIVEAD,
              name: name
            });
          },
          adViewDidFailToReceiveAdWithError: function(name, msg) {
            AndroidAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.DIDFAILTORECEIVEADWITHERROR,
              name: name,
              msg: msg
            });
          },
          adViewWillPresentScreen: function(name) {
            AndroidAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.WILLPRESENTSCREEN,
              name: name
            });
          },
          adViewDidDismissScreen: function(name) {
            AndroidAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.DIDDISMISSSCREEN,
              name: name
            });
          },
          adViewWillDismissScreen: function(name) {
            AndroidAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.WILLDISMISSSCREEN,
              name: name
            });
          },
          adViewWillLeaveApplication: function(name) {
            AndroidAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.WILLLEAVEAPPLICATION,
              name: name
            });
          },
          reward: function(name, currency, amount) {
            AndroidAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.REWARD,
              name: name,
              currency: currency,
              amount: amount
            });
          }
        });
        plugin.init();
      };
      AndroidAdmob.prototype.cache = function() {
        game.log(this.tag, "admob", "cache");
        sdkbox.PluginAdMob.cache("banner");
        sdkbox.PluginAdMob.cache("interstitial");
        sdkbox.PluginAdMob.cache("rewarded");
      };
      AndroidAdmob.prototype.showBanner = function() {
        game.log(this.tag, "admob", "show banner");
        sdkbox.PluginAdMob.show("banner");
        this.isBannerShow = true;
      };
      AndroidAdmob.prototype.hideBanner = function() {
        game.log(this.tag, "admob", "hide banner");
        sdkbox.PluginAdMob.hide("banner");
        this.isBannerShow = false;
      };
      AndroidAdmob.prototype.getBannerHeight = function() {
        var height = 0;
        this.isBannerShow && (height = sdkbox.PluginAdMob.getCurrBannerHeightInPixel("banner"));
        game.log(this.tag, "admob", "get banner banner height", height);
        return height;
      };
      AndroidAdmob.prototype.getBannerWidth = function() {
        var width = sdkbox.PluginAdMob.getCurrBannerWidthInPixel("banner");
        game.log(this.tag, "admob", "get banner banner width", width);
        return width;
      };
      AndroidAdmob.prototype.isShowBanner = function() {
        var isShow = this.isBannerShow;
        game.log(this.tag, "admob", "is show banner", isShow);
        return isShow;
      };
      AndroidAdmob.prototype.isAvailableBanner = function() {
        var isAvai = sdkbox.PluginAdMob.isAvailable("banner");
        game.log(this.tag, "admob", "is avaiable banner", isAvai);
        return isAvai;
      };
      AndroidAdmob.prototype.showInterstitial = function() {
        game.log(this.tag, "admob", "show interstitial");
        sdkbox.PluginAdMob.show("interstitial");
      };
      AndroidAdmob.prototype.isAvailableInterstitial = function() {
        var isAvai = sdkbox.PluginAdMob.isAvailable("interstitial");
        game.log(this.tag, "admob", "is avaiable interstitial", isAvai);
        return isAvai;
      };
      AndroidAdmob.prototype.showRewarded = function() {
        game.log(this.tag, "admob", "show rewarded");
        sdkbox.PluginAdMob.show("rewarded");
      };
      AndroidAdmob.prototype.isAvailableRewarded = function() {
        var isAvai = sdkbox.PluginAdMob.isAvailable("rewarded");
        game.log(this.tag, "admob", "is avaiable rewarded", isAvai);
        return isAvai;
      };
      AndroidAdmob.prototype.listenner = function(data) {
        if (!data) return;
        if (!data.name) return;
        "banner" === data.name ? this.bannerListenner(data) : "interstitial" === data.name ? this.interstitialListenner(data) : "rewarded" === data.name && this.rewardedListenner(data);
      };
      AndroidAdmob.prototype.bannerListenner = function(data) {
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.ADMOB_LISTENNER.DIDRECEIVEAD:
          game.log(this.tag, "banner listenner", "DIDRECEIVEAD");
          break;

         case define.type.ADMOB_LISTENNER.DIDFAILTORECEIVEADWITHERROR:
          game.log(this.tag, "banner listenner", "DIDFAILTORECEIVEADWITHERROR");
          break;

         case define.type.ADMOB_LISTENNER.WILLPRESENTSCREEN:
          game.log(this.tag, "banner listenner", "WILLPRESENTSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.DIDDISMISSSCREEN:
          game.log(this.tag, "banner listenner", "DIDDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLDISMISSSCREEN:
          game.log(this.tag, "banner listenner", "WILLDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLLEAVEAPPLICATION:
          game.log(this.tag, "banner listenner", "WILLLEAVEAPPLICATION");
          break;

         case define.type.ADMOB_LISTENNER.REWARD:
          game.log(this.tag, "banner listenner", "REWARD");
          break;

         default:
          game.log(this.tag, "banner listenner", "UKNOW");
        }
      };
      AndroidAdmob.prototype.interstitialListenner = function(data) {
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.ADMOB_LISTENNER.DIDRECEIVEAD:
          game.log(this.tag, "interstitial listenner", "DIDRECEIVEAD");
          break;

         case define.type.ADMOB_LISTENNER.DIDFAILTORECEIVEADWITHERROR:
          game.log(this.tag, "interstitial listenner", "DIDFAILTORECEIVEADWITHERROR");
          break;

         case define.type.ADMOB_LISTENNER.WILLPRESENTSCREEN:
          game.log(this.tag, "interstitial listenner", "WILLPRESENTSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.DIDDISMISSSCREEN:
          game.log(this.tag, "interstitial listenner", "DIDDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLDISMISSSCREEN:
          game.log(this.tag, "interstitial listenner", "WILLDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLLEAVEAPPLICATION:
          game.log(this.tag, "interstitial listenner", "WILLLEAVEAPPLICATION");
          break;

         case define.type.ADMOB_LISTENNER.REWARD:
          game.log(this.tag, "interstitial listenner", "REWARD");
          break;

         default:
          game.log(this.tag, "interstitial listenner", "UKNOW");
        }
      };
      AndroidAdmob.prototype.rewardedListenner = function(data) {
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.ADMOB_LISTENNER.DIDRECEIVEAD:
          game.log(this.tag, "rewarded listenner", "DIDRECEIVEAD");
          break;

         case define.type.ADMOB_LISTENNER.DIDFAILTORECEIVEADWITHERROR:
          game.log(this.tag, "rewarded listenner", "DIDFAILTORECEIVEADWITHERROR");
          break;

         case define.type.ADMOB_LISTENNER.WILLPRESENTSCREEN:
          game.log(this.tag, "rewarded listenner", "WILLPRESENTSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.DIDDISMISSSCREEN:
          game.log(this.tag, "rewarded listenner", "DIDDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLDISMISSSCREEN:
          game.log(this.tag, "rewarded listenner", "WILLDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLLEAVEAPPLICATION:
          game.log(this.tag, "rewarded listenner", "WILLLEAVEAPPLICATION");
          break;

         case define.type.ADMOB_LISTENNER.REWARD:
          game.log(this.tag, "rewarded listenner", "REWARD");
          break;

         default:
          game.log(this.tag, "rewarded listenner", "UKNOW");
        }
      };
      AndroidAdmob.intance = null;
      return AndroidAdmob;
    }();
    exports.default = AndroidAdmob;
    cc._RF.pop();
  }, {} ],
  AndroidFacebook: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d798b1Ca29DtajfzxSu6ujS", "AndroidFacebook");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AndroidFacebook = function() {
      function AndroidFacebook() {
        this.tag = "AndroidFacebook";
        this.loginCallback = void 0;
      }
      AndroidFacebook.getIns = function() {
        this.intance || (this.intance = new AndroidFacebook());
        return this.intance;
      };
      AndroidFacebook.prototype.init = function() {
        game.log(this.tag, "facebook", "init");
        if (!sdkbox) return false;
        if (!sdkbox.PluginFacebook) return false;
        sdkbox.PluginFacebook.setListener({
          onLogin: function(isLogin, msg) {
            AndroidFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.LOGIN,
              isLogin: isLogin,
              msg: msg
            });
          },
          onAPI: function(tag, data) {
            AndroidFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.API,
              tag: tag,
              data: data
            });
          },
          onSharedSuccess: function(data) {
            AndroidFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.SHARED_SUCCESS,
              data: data
            });
          },
          onSharedFailed: function(data) {
            AndroidFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.SHARED_FAILED,
              data: data
            });
          },
          onSharedCancel: function() {
            AndroidFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.SHARED_CANCEL
            });
          },
          onPermission: function(isLogin, msg) {
            AndroidFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.PERMISSON,
              isLogin: isLogin,
              msg: msg
            });
          }
        });
        sdkbox.PluginFacebook.init();
        return true;
      };
      AndroidFacebook.prototype.login = function() {
        var _this = this;
        game.log(this.tag, "facebook", "login");
        tracking.send(tracking.event.FACEBOOK_LOGIN_CLICK);
        return new Promise(function(res, rej) {
          if (sdkbox && sdkbox.PluginFacebook) {
            sdkbox.PluginFacebook.requestReadPermissions([ "public_profile", "email" ]);
            sdkbox.PluginFacebook.login();
          } else {
            game.log(_this.tag, "login facebook: sdkbox or plugin null");
            rej();
          }
          _this.loginCallback = function() {
            res(platform.facebook.getAccessToken());
          };
        });
      };
      AndroidFacebook.prototype.logout = function() {
        game.log(this.tag, "facebook", "logout");
        sdkbox && sdkbox.PluginFacebook ? sdkbox.PluginFacebook.logout() : game.log("login facebook: sdkbox or plugin null");
      };
      AndroidFacebook.prototype.isLoggedIn = function() {
        if (sdkbox && sdkbox.PluginFacebook) {
          var isLoggedIn = sdkbox.PluginFacebook.isLoggedIn();
          game.log(this.tag, "facebook", "is loggedin", isLoggedIn);
          return isLoggedIn;
        }
        game.log("login facebook: sdkbox or plugin null");
      };
      AndroidFacebook.prototype.getUserID = function() {
        if (sdkbox && sdkbox.PluginFacebook) {
          var userId = sdkbox.PluginFacebook.getUserID();
          game.log(this.tag, "facebook", "userId: ", userId);
          return userId;
        }
        game.log("login facebook: sdkbox or plugin null");
      };
      AndroidFacebook.prototype.getAccessToken = function() {
        if (sdkbox && sdkbox.PluginFacebook) {
          var tokken = sdkbox.PluginFacebook.getAccessToken();
          game.log(this.tag, "facebook", "userId: ", tokken);
          return tokken;
        }
        game.log("login facebook: sdkbox or plugin null");
      };
      AndroidFacebook.prototype.shareHandle = function(option) {
        if (!option) return;
        if (!option.type) return;
        game.log(this.tag, "facebook", "share handle", option);
        tracking.send(tracking.event.FACEBOOK_SHARE_CLICK);
        var info = option;
        sdkbox.PluginFacebook.dialog(info);
      };
      AndroidFacebook.prototype.share = function(option) {
        if (!option) return;
        this.shareHandle(__assign({
          type: "link"
        }, option));
      };
      AndroidFacebook.prototype.sharePhoto = function(option) {
        if (!option) return;
        this.shareHandle(__assign({
          type: "photo"
        }, option));
      };
      AndroidFacebook.prototype.sendLogEvent = function(eventName, valueToSum) {
        game.log(this.tag, "facebook", "send log event", eventName, valueToSum);
        "undefined" === typeof valueToSum ? sdkbox.PluginFacebook.logEvent(eventName) : sdkbox.PluginFacebook.logEvent(eventName, valueToSum);
      };
      AndroidFacebook.prototype.sendLogPurchase = function(mount, currency) {
        game.log(this.tag, "facebook", "send log purchase", mount, currency);
        sdkbox.PluginFacebook.logPurchase(mount, currency);
      };
      AndroidFacebook.prototype.openGroup = function() {
        game.warn(this.tag, "openGroup method not implemented.");
      };
      AndroidFacebook.prototype.openFanpage = function() {
        game.warn(this.tag, "openFanpage method not implemented.");
      };
      AndroidFacebook.prototype.listenner = function(data) {
        var _this = this;
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.FACEBOOK_LISTENNER.LOGIN:
          game.log(this.tag, "facebook listenner", "LOGIN", "isLogin: " + data.isLogin + " - msg: " + data.msg);
          var strLoginData = cc.sys.localStorage.getItem(define.key.local.LOGIN_DATA.replace("IP", api.HOST)) || JSON.stringify({
            expires: void 0,
            token: "",
            type: 0,
            uid: 0
          });
          var loginData = JSON.parse(strLoginData);
          game.log("IOSFacebook", "listenner", JSON.stringify(loginData));
          loginData.type !== define.type.LOGIN_TYPE.FACEBOOK ? api.sendGD({
            e: "connectFB",
            accessToken: platform.facebook.getAccessToken()
          }, function(err, data) {
            game.log("IOSFacebook", "send connect facebook", JSON.stringify(err), JSON.stringify(data));
            if (err) return game.error(err);
            var setNewLoginData = function(cb) {
              api.getToken({
                type: define.type.LOGIN_TYPE.FACEBOOK,
                data: platform.facebook.getAccessToken()
              }).then(function(data) {
                var loginData = {
                  expires: data.expires,
                  token: data.token,
                  type: define.type.LOGIN_TYPE.FACEBOOK,
                  uid: data.uid
                };
                cc.sys.localStorage.setItem(define.key.local.LOGIN_DATA.replace("IP", api.HOST), JSON.stringify(loginData));
                cb && cb();
              });
            };
            switch (data.code) {
             case 402:
              game.log(_this.tag, "Login FB success", "need merge facebook", data);
              controller.ui.showDialog({
                title: "Account already exists",
                name: "facebook_accout_exists",
                message: {
                  message: data.message
                },
                buttons: [ {
                  title: "Cancel",
                  theme: define.type.CLASS_THEME.DANGER
                }, {
                  title: "OK",
                  theme: define.type.CLASS_THEME.SUCCESS,
                  callback: function() {
                    api.sendGD({
                      e: "confirmMergeFB",
                      uid: game.user.id
                    }, function(err, data) {
                      if (err) return game.error(err);
                      if ("success" === data) {
                        game.log(_this.tag, "Login FB success", "merge facebook success");
                        setNewLoginData(function() {
                          cc.game.restart();
                        });
                      } else game.error("Cai nay chua lam");
                    });
                  }
                }, {
                  title: "Another\nAccount",
                  theme: define.type.CLASS_THEME.SUCCESS,
                  callback: function() {
                    _this.logout();
                    _this.login();
                  }
                } ]
              });
              break;

             case 401:
              game.log(_this.tag, "Login FB success", "facebook loged");
              controller.ui.showDialog({
                title: "Alert",
                name: "facebook_accout_logged",
                message: {
                  message: "Your account has been logged on this device"
                },
                buttons: [ {
                  title: "Confirm",
                  theme: define.type.CLASS_THEME.DANGER
                } ]
              });
              break;

             default:
              controller.ui.showDialog({
                title: "Messaage",
                name: "facebook_success",
                message: {
                  message: "Loggin facebook success"
                },
                buttons: [ {
                  title: "OK",
                  theme: define.type.CLASS_THEME.SUCCESS
                } ]
              });
              setNewLoginData(function() {
                _this.loginCallback && _this.loginCallback();
              });
              game.user.fbid = platform.facebook.getUserID();
              store.emit(store.key.UPDATE_USER_AVATAR, "");
            }
          }) : this.loginCallback && this.loginCallback();
          break;

         case define.type.FACEBOOK_LISTENNER.API:
          game.log(this.tag, "facebook listenner", "API", "tag: " + data.tag + " - data: " + data.data);
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_SUCCESS:
          game.log(this.tag, "facebook listenner", "SHARED_SUCCESS", "data: " + data.data);
          tracking.send(tracking.event.FACEBOOK_SHARE_SUCCESS);
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_FAILED:
          game.log(this.tag, "facebook listenner", "SHARED_FAILED", "data: " + data.data);
          tracking.send(tracking.event.FACEBOOK_SHARE_FAILED);
          if (!platform.handle.checkAppInstall("com.facebook.katana ")) {
            this.listenner({
              type: define.type.FACEBOOK_LISTENNER.FACEBOOK_NOT_INSTALL
            });
            return;
          }
          controller.ui.showDialog({
            title: "Message",
            type: define.type.DIALOG_TYPE.NORMAL,
            name: "share_failed",
            message: {
              message: "Facebook shared failed"
            },
            buttons: [ {
              title: "Confirm",
              theme: define.type.CLASS_THEME.DANGER
            } ]
          });
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_CANCEL:
          game.log(this.tag, "facebook listenner", "SHARED_CANCEL");
          tracking.send(tracking.event.FACEBOOK_SHARE_CANCELED);
          break;

         case define.type.FACEBOOK_LISTENNER.PERMISSON:
          game.log(this.tag, "facebook listenner", "LOGIN", "isLogin: " + data.isLogin + " - msg: " + data.msg);
          break;

         case define.type.FACEBOOK_LISTENNER.FETCHFRIENDS:
          game.log(this.tag, "facebook listenner", "FETCHFRIENDS");
          break;

         case define.type.FACEBOOK_LISTENNER.REQUESTINVITABLEFRIENDS:
          game.log(this.tag, "facebook listenner", "REQUESTINVITABLEFRIENDS");
          break;

         case define.type.FACEBOOK_LISTENNER.INVITEFRIENDSWITHINVITEIDSRESULT:
          game.log(this.tag, "facebook listenner", "INVITEFRIENDSWITHINVITEIDSRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.INVITEFRIENDSRESULT:
          game.log(this.tag, "facebook listenner", "INVITEFRIENDSRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.GETUSERINFO:
          game.log(this.tag, "facebook listenner", "GETUSERINFO");
          break;

         case define.type.FACEBOOK_LISTENNER.REQUESTGIFTRESULT:
          game.log(this.tag, "facebook listenner", "REQUESTGIFTRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.SENDGIFTRESULT:
          game.log(this.tag, "facebook listenner", "SENDGIFTRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.FACEBOOK_NOT_INSTALL:
          game.log(this.tag, "facebook listenner", "FACEBOOK_NOT_INSTALL");
          controller.ui.showDialog({
            title: "Message",
            type: define.type.DIALOG_TYPE.NORMAL,
            name: "facebook_not_install",
            message: {
              message: "Facebook application has not been installed"
            },
            buttons: [ {
              title: "Confirm",
              theme: define.type.CLASS_THEME.DANGER
            } ]
          });
          break;

         default:
          game.log(this.tag, "facebook listenner", "UNKNOW");
        }
      };
      AndroidFacebook.intance = null;
      return AndroidFacebook;
    }();
    exports.default = AndroidFacebook;
    cc._RF.pop();
  }, {} ],
  AndroidFirebase: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "677c4+YLy9Nk4QmModf6JFB", "AndroidFirebase");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AndroidFirebase = function() {
      function AndroidFirebase() {
        this.tag = "AndroidFirebase";
      }
      AndroidFirebase.getIns = function() {
        this.intance || (this.intance = new AndroidFirebase());
        return this.intance;
      };
      AndroidFirebase.prototype.init = function() {
        if (!sdkbox || !sdkbox.firebase) return false;
        game.log(this.tag, "firebase", "init");
        sdkbox.firebase.Analytics.init();
        return true;
      };
      AndroidFirebase.prototype.sendLogEvent = function(event, params) {
        game.log(this.tag, "firebase", "send log event", event, params);
        sdkbox.firebase.Analytics.logEvent(event, params);
      };
      AndroidFirebase.prototype.getVersion = function() {
        var ver = sdkbox.firebase.Analytics.getVersion();
        game.log(this.tag, "getVersion", ver);
        return ver;
      };
      AndroidFirebase.prototype.setUserProperty = function(name, value) {
        game.log(this.tag, "setUserProperty", name, value);
        sdkbox.firebase.Analytics.setUserProperty(name, value);
      };
      AndroidFirebase.prototype.setUserID = function(userID) {
        game.log(this.tag, "setUserID", userID);
        sdkbox.firebase.Analytics.setUserID(userID);
      };
      AndroidFirebase.prototype.setScreenName = function(screen, screenClass) {
        game.log(this.tag, "setScreenName", screen, screenClass);
        sdkbox.firebase.Analytics.setScreenName(screen, screenClass);
      };
      AndroidFirebase.prototype.resetAnalyticsData = function() {
        game.log(this.tag, "resetAnalyticsData");
        sdkbox.firebase.Analytics.resetAnalyticsData();
      };
      AndroidFirebase.prototype.setAnalyticsCollectionEnabled = function(enabled) {
        game.log(this.tag, "setAnalyticsCollectionEnabled", enabled);
        sdkbox.firebase.Analytics.setAnalyticsCollectionEnabled(enabled);
      };
      AndroidFirebase.intance = null;
      return AndroidFirebase;
    }();
    exports.default = AndroidFirebase;
    cc._RF.pop();
  }, {} ],
  AndroidHandle: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a2dadPUYytOtopxd0oqNJmk", "AndroidHandle");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AndroidHandle = function() {
      function AndroidHandle() {
        this.tag = "AndroidHandle";
      }
      AndroidHandle.getIns = function() {
        this.intance || (this.intance = new AndroidHandle());
        return this.intance;
      };
      AndroidHandle.prototype.showMessageBox = function(title, msg) {
        var res = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "showMessageBox", "(Ljava/lang/String;Ljava/lang/String;)Z", title, msg);
        game.log(this.tag, "handle", "send message box", res);
        return res;
      };
      AndroidHandle.prototype.getDeviceId = function() {
        var deviceId = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "getDeviceId", "()Ljava/lang/String;");
        game.log(this.tag, "handle", "get device id", deviceId);
        return deviceId;
      };
      AndroidHandle.prototype.getPackageName = function() {
        var packageName = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "getPackageName", "()Ljava/lang/String;");
        game.log(this.tag, "handle", "get package name", packageName);
        return packageName;
      };
      AndroidHandle.prototype.getVersionGame = function() {
        var version = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "getVersionGame", "()Ljava/lang/String;");
        game.log(this.tag, "handle", "get version game", version);
        return version;
      };
      AndroidHandle.prototype.getCountryCode = function() {
        var code = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "getCountryCode", "()Ljava/lang/String;");
        game.log(this.tag, "handle", "get country code", code);
        "string" === typeof code && (code = code.toLowerCase());
        return code;
      };
      AndroidHandle.prototype.getOSVersion = function() {
        var version = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "getOSVersion", "()Ljava/lang/String;");
        game.log(this.tag, "handle", "get os version", version);
        return version;
      };
      AndroidHandle.prototype.isConnecting = function() {
        var isConnect = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "isConnecting", "()Z");
        game.log(this.tag, "handle", "is connecting", isConnect);
        return isConnect;
      };
      AndroidHandle.prototype.checkAppInstall = function(pkg) {
        var installed = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "checkAppInstall", "(Ljava/lang/String;)Z", pkg);
        game.log(this.tag, "handle", "check app installed", installed);
        return installed;
      };
      AndroidHandle.prototype.setWakeLock = function(req) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/PlatformHandle", "setWakeLock", "(Z)V", req);
        game.log(this.tag, "handle", "check set wakelock");
      };
      AndroidHandle.prototype.openLink = function(url) {
        url && "string" === typeof url ? cc.sys.openURL(url) : game.error(this.tag, "handle", "url is not useable");
      };
      AndroidHandle.prototype.screenshot = function() {
        var node = new cc.Node();
        node.parent = cc.director.getScene();
        node.x = .5 * cc.winSize.width;
        node.y = .5 * cc.winSize.height;
        var camera = node.addComponent(cc.Camera);
        camera.cullingMask = 4294967295;
        var texture = new cc.RenderTexture();
        var gl = cc.game._renderContext;
        texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, gl.STENCIL_INDEX8);
        camera.targetTexture = texture;
        camera.render();
        var data = texture.readPixels();
        var rowBytes = 4 * texture.width;
        var bytes = new Uint8Array(data.length);
        for (var row = 0; row < texture.height; row++) {
          var srow = texture.height - 1 - row;
          var start = srow * texture.width * 4;
          for (var i = 0; i < rowBytes; i++) bytes[row * rowBytes + i] = data[start + i];
        }
        var filePath = this.getWritablePath("screenshot.png");
        this.saveImageData({
          data: bytes,
          width: texture.width,
          height: texture.height,
          filePath: filePath
        });
        node.destroy();
        game.log(this.tag, "screenshot", "save in path", filePath);
        return {
          texture: texture,
          path: filePath
        };
      };
      AndroidHandle.prototype.getWritablePath = function(suffix) {
        if ("string" !== typeof suffix) {
          game.warn(this.tag, "getWritablePath", "suffix error", suffix);
          return;
        }
        return jsb.fileUtils.getWritablePath() + suffix;
      };
      AndroidHandle.prototype.saveImageData = function(option) {
        option = option || {};
        if ("undefined" === typeof option.data || "number" !== typeof option.width || "number" !== typeof option.height || "string" !== typeof option.filePath) {
          game.warn(this.tag, "saveImageData", "input error", option);
          return;
        }
        jsb.saveImageData(option.data, option.width, option.height, option.filePath);
      };
      AndroidHandle.intance = null;
      return AndroidHandle;
    }();
    exports.default = AndroidHandle;
    cc._RF.pop();
  }, {} ],
  AndroidIap: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b8037ZMYAZL27vXSFUgiY8C", "AndroidIap");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AndroidIap = function() {
      function AndroidIap() {
        this.tag = "AndroidIap";
        this.listenner = {
          onInitialized: function(success) {
            game.log("platform.iap", "iap listenner", "on initialized", "success: " + JSON.stringify(success));
          },
          onSuccess: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_SUCCESS, this.itemBuying);
            tracking.purchase(product.id, product.priceValue);
            game.log("platform.iap", "iap listenner", "on success", "product: " + JSON.stringify(product));
            game.log("platform.iap", "iap listenner", "send game data");
            this.itemBuying.type === define.type.ESHOP.GENERAL_SHOP ? api.sendGD({
              e: define.key.api.BUY_SHOP_ITEM,
              method: "IAP_ANDROID",
              itemId: this.itemBuying.id,
              receipt: JSON.parse(product.receipt)
            }, function(err, data) {
              game.log("platform.iap", "iap listenner", "receive data", err, JSON.stringify(data));
              if (data.megaWheel) {
                view.popup["shop"] && view.popup["shop"].onClose();
                game.data.megaWheel = data.megaWheel;
                if (view.screen.wheelBonus) {
                  view.screen.wheelBonus.init();
                  view.screen.wheelBonus.onSpin();
                } else controller.ui.openWheelBonus(define.type.WHEEL_BONUS.GOLD);
              }
              var title = void 0;
              var msg = "";
              if (err) {
                1 == err && (err = "Error");
                msg = err;
              } else {
                title = "Thank you";
                msg = "Your purchase was successful";
              }
              controller.ui.showDialog({
                title: title,
                type: define.type.DIALOG_TYPE.HIGH,
                name: "iap_msg",
                message: {
                  message: msg
                },
                buttons: [ {
                  title: "OK",
                  theme: err ? define.type.CLASS_THEME.DANGER : define.type.CLASS_THEME.SUCCESS
                } ]
              });
            }) : this.itemBuying.type === define.type.ESHOP.MEGA_WHEEL ? api.sendGD({
              e: "buyMegaWheel",
              method: "IAP_ANDROID",
              receipt: JSON.parse(product.receipt)
            }, function(err, data) {
              if (err) {
                1 == err && (err = "Error");
                controller.ui.showDialog({
                  title: "Message",
                  type: define.type.DIALOG_TYPE.HIGH,
                  name: "iap_msg",
                  message: {
                    message: err
                  },
                  buttons: [ {
                    title: "OK",
                    theme: define.type.CLASS_THEME.DANGER
                  } ]
                });
                return;
              }
              if (data && data.status && data.megaWheel) {
                game.data.megaWheel = {
                  array: data.megaWheel.array,
                  result: data.megaWheel.result
                };
                if (view.screen.wheelBonus) {
                  view.screen.wheelBonus.init();
                  view.screen.wheelBonus.onSpin();
                } else controller.ui.openWheelBonus(define.type.WHEEL_BONUS.GOLD);
              }
            }) : this.itemBuying.type === define.type.ESHOP.DEAL_SHOP && api.sendGD({
              e: define.key.api.BUY_DEAL_SHOP,
              method: "IAP_ANDROID",
              receipt: JSON.parse(product.receipt)
            }, function(err, data) {
              1 == err && (err = "Error");
              controller.ui.showDialog({
                title: "Message",
                type: define.type.DIALOG_TYPE.HIGH,
                name: "iap_msg",
                message: {
                  message: err
                },
                buttons: [ {
                  title: "OK",
                  theme: define.type.CLASS_THEME.DANGER
                } ]
              });
              if (data) {
                game.data.shop[define.type.ESHOP.DEAL_SHOP] = void 0;
                store.emit(store.key.UPDATE_SHOP_DATA, game.data.shop);
                var title = "Thank you";
                var msg = "Your purchase was successful";
                controller.ui.showDialog({
                  title: title,
                  type: define.type.DIALOG_TYPE.HIGH,
                  name: "iap_msg",
                  message: {
                    message: msg
                  },
                  buttons: [ {
                    title: "OK",
                    theme: err ? define.type.CLASS_THEME.DANGER : define.type.CLASS_THEME.SUCCESS
                  } ]
                });
              }
            });
          }.bind(this),
          onFailure: function(product, msg) {
            tracking.send(tracking.event.IAP_PURCHASE_FAILED);
            game.error("platform.iap", "iap listenner", "on failure", "product: " + JSON.stringify(product) + " - msg: " + JSON.stringify(msg));
            controller.ui.showDialog({
              type: define.type.DIALOG_TYPE.HIGH,
              name: "iap_msg",
              message: {
                message: "Purchase failure"
              },
              buttons: [ {
                title: "OK",
                theme: define.type.CLASS_THEME.DANGER
              } ]
            });
          },
          onCanceled: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_CANCELED);
            game.warn("platform.iap", "iap listenner", "on canceled", "product: " + JSON.stringify(product));
            controller.ui.showDialog({
              type: define.type.DIALOG_TYPE.HIGH,
              name: "iap_msg",
              message: {
                message: "Purchase canceled"
              },
              buttons: [ {
                title: "OK",
                theme: define.type.CLASS_THEME.DANGER
              } ]
            });
          },
          onRestored: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_RESTORED);
            game.log("platform.iap", "iap listenner", "on restored", "product: " + JSON.stringify(product));
          },
          onRestoreComplete: function(ok, msg) {
            tracking.send(tracking.event.IAP_PURCHASE_RESTOR_COMPLETED);
            game.log("platform.iap", "iap listenner", "on restore complete", "ok: " + JSON.stringify(ok) + " - msg: " + JSON.stringify(msg));
          },
          onProductRequestSuccess: function(products) {
            game.log("platform.iap", "iap listenner", "on product request success", "product: " + JSON.stringify(products));
            for (var i = 0; i < products.length; i++) ;
          },
          onProductRequestFailure: function(msg) {
            game.log("platform.iap", "iap listenner", "on product request failure", "msg: " + JSON.stringify(msg));
          },
          onShouldAddStorePayment: function(productName) {
            game.log("platform.iap", "iap listenner", "on should add store payment", "productName: " + JSON.stringify(productName));
          },
          onFetchStorePromotionOrder: function(productNames, error) {
            game.log("platform.iap", "iap listenner", "on fetch store promotion order", "productNames: " + JSON.stringify(productNames) + " - error: " + JSON.stringify(error));
          },
          onFetchStorePromotionVisibility: function(productName, visibility, error) {
            game.log("platform.iap", "iap listenner", "on fetch store promotion visibility", "productName: " + JSON.stringify(productName) + " - visibility: " + JSON.stringify(visibility) + " - error: " + JSON.stringify(error));
          },
          onUpdateStorePromotionOrder: function(error) {
            game.log("platform.iap", "iap listenner", "on update store promotion order", "error: " + JSON.stringify(error));
          },
          onUpdateStorePromotionVisibility: function(error) {
            game.log("platform.iap", "iap listenner", "on update store promotion visibility", "error: " + JSON.stringify(error));
          },
          onPurchaseHistory: function(purchases) {
            game.log("platform.iap", "iap listenner", "on purchase history", "purchase: " + JSON.stringify(purchases));
          },
          onConsumed: function(p, error) {
            game.log("platform.iap", "iap listenner", "on consumed", "p: " + JSON.stringify(p) + ") - error: " + JSON.stringify(error));
          },
          onDeferred: function(p) {
            game.log("platform.iap", "iap listenner", "on deferred", "p: " + JSON.stringify(p));
          }
        };
      }
      AndroidIap.getIns = function() {
        this.intance || (this.intance = new AndroidIap());
        return this.intance;
      };
      AndroidIap.prototype.init = function() {
        game.log(this.tag, "iap", "init");
        var plugin = sdkbox.IAP;
        plugin.setListener(this.listenner);
        plugin.init();
        plugin.enableUserSideVerification();
      };
      AndroidIap.prototype.setDebug = function(debug) {
        game.log(this.tag, "iap", "set debug");
        sdkbox.IAP.setDebug(debug);
      };
      AndroidIap.prototype.purchase = function(name) {
        tracking.send(tracking.event.IAP_PURCHASE_CLICK, {
          pack: name
        });
        config.setup["testIAP"] && this.purchaseTest(name);
        game.log(this.tag, "iap", "purchase", name);
        sdkbox.IAP.purchase(name);
      };
      AndroidIap.prototype.purchaseByProductID = function(productID) {
        var item = Object.values(define.key.iap.android).find(function(o) {
          return o.id == productID;
        });
        item ? this.purchase(item.name) : game.warn(this.tag, "purchaseByProductID", "item wasn't defined");
      };
      AndroidIap.prototype.purchaseTest = function(name) {
        var _this = this;
        var item = Object.values(define.key.iap.web).find(function(o) {
          return o.name == name;
        });
        if (!item) return game.warn(this.tag, "purchaseByProductID", "item wasn't defined");
        api.sendGD({
          e: "deleteReceipt",
          orderId: JSON.parse(item.test["receipt"]).orderId
        }, function(err, data) {
          game.log(err, data);
          _this.listenner.onSuccess(item.test);
        });
      };
      AndroidIap.prototype.refresh = function() {
        game.log(this.tag, "iap", "refresh");
        sdkbox.IAP.refresh();
      };
      AndroidIap.prototype.restore = function() {
        game.log(this.tag, "iap", "restore");
        sdkbox.IAP.restore();
      };
      AndroidIap.prototype.removeListener = function() {
        game.log(this.tag, "iap", "remove listener");
        sdkbox.IAP.removeListener();
      };
      AndroidIap.prototype.enableUserSideVerification = function() {
        game.log(this.tag, "iap", "enable user side verification");
        sdkbox.IAP.enableUserSideVerification();
      };
      AndroidIap.prototype.isAutoFinishTransaction = function() {
        game.log(this.tag, "iap", "is auto finish transaction");
        return sdkbox.IAP.isAutoFinishTransaction();
      };
      AndroidIap.prototype.setAutoFinishTransaction = function(b) {
        game.log(this.tag, "iap", "set auto finish transaction");
        sdkbox.IAP.setAutoFinishTransaction(b);
      };
      AndroidIap.prototype.finishTransaction = function(productid) {
        game.log(this.tag, "iap", "finish transaction", "productid: " + productid);
        sdkbox.IAP.finishTransaction(productid);
      };
      AndroidIap.prototype.fetchStorePromotionOrder = function() {
        game.log(this.tag, "iap", "fetch store promotion order");
        sdkbox.IAP.fetchStorePromotionOrder();
      };
      AndroidIap.prototype.updateStorePromotionOrder = function(productNames) {
        game.log(this.tag, "iap", "update store promotion order", "productNames: " + productNames);
        sdkbox.IAP.updateStorePromotionOrder(productNames);
      };
      AndroidIap.prototype.fetchStorePromotionVisibility = function(productName) {
        game.log(this.tag, "iap", "fetchStore promotion visibility", "productNames: " + productName);
        sdkbox.IAP.fetchStorePromotionVisibility(productName);
      };
      AndroidIap.prototype.updateStorePromotionVisibility = function(productName, visibility) {
        game.log(this.tag, "iap", "updateStore promotion visibility", "productNames: " + productName);
        sdkbox.IAP.updateStorePromotionVisibility(productName, visibility);
      };
      AndroidIap.prototype.getPurchaseHistory = function() {
        game.log(this.tag, "iap", "get purchase history");
        sdkbox.IAP.getPurchaseHistory();
      };
      AndroidIap.prototype.getInitializedErrMsg = function() {
        game.log(this.tag, "iap", "get initialized err msg");
        sdkbox.IAP.getInitializedErrMsg();
      };
      AndroidIap.prototype.requestUpdateTransaction = function() {
        game.log(this.tag, "iap", "request update transaction");
        sdkbox.IAP.requestUpdateTransaction();
      };
      AndroidIap.intance = null;
      return AndroidIap;
    }();
    exports.default = AndroidIap;
    cc._RF.pop();
  }, {} ],
  AndroidOnesignal: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "41083zECpxE26nO/v/eDZiS", "AndroidOnesignal");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AndroidOnesignal = function() {
      function AndroidOnesignal() {
        this.tag = "AndroidOnesignal";
      }
      AndroidOnesignal.getIns = function() {
        this.intance || (this.intance = new AndroidOnesignal());
        return this.intance;
      };
      AndroidOnesignal.prototype.init = function() {
        game.log(this.tag, "onesignal", "init");
        var plugin = sdkbox.PluginOneSignal;
        plugin.setListener({
          onSendTag: function(success, key, message) {
            game.log("onesignal", "send tag", "success: " + success + " - key: " + key + " - message: " + message);
          },
          onGetTags: function(jsonString) {
            game.log("onesignal", "get tag", "jsonString: " + jsonString);
          },
          onIdsAvailable: function(userId, pushToken) {
            game.log("onesignal", "ids avaiable", "userId: " + userId + " - pushToken: " + pushToken);
          },
          onPostNotification: function(success, message) {
            game.log("onesignal", "on post notification", "success: " + success + " - message: " + message);
          },
          onNotification: function(isActive, message, additionalData) {
            game.log("onesignal", "on notification", "isActive: " + isActive + " - message: " + message + " - additionalData: " + additionalData);
          }
        });
        plugin.init();
      };
      AndroidOnesignal.prototype.registerPushNotifications = function() {
        game.log(this.tag, "onesignal", "register push notification");
        sdkbox.PluginOneSignal.registerForPushNotifications();
      };
      AndroidOnesignal.prototype.sendTag = function(key, value) {
        game.log(this.tag, "onesignal", "send tag", "key: " + key + " - value: " + value);
        sdkbox.PluginOneSignal.sendTag(key, value);
      };
      AndroidOnesignal.prototype.getTags = function() {
        game.log(this.tag, "onesignal", "get tags");
        sdkbox.PluginOneSignal.getTags();
      };
      AndroidOnesignal.prototype.deleteTag = function(key) {
        game.log(this.tag, "onesignal", "delete tag", "key: " + key);
        sdkbox.PluginOneSignal.deleteTag(key);
      };
      AndroidOnesignal.prototype.setEmail = function(email) {
        game.log(this.tag, "onesignal", "set email", "email: " + email);
        sdkbox.PluginOneSignal.setEmail(email);
      };
      AndroidOnesignal.prototype.idsAvailable = function() {
        game.log(this.tag, "onesignal", "ids avaiable");
        sdkbox.PluginOneSignal.idsAvailable();
      };
      AndroidOnesignal.prototype.enableInAppAlertNotification = function(enable) {
        game.log(this.tag, "onesignal", "in app alert notification", "enable: " + enable);
        sdkbox.PluginOneSignal.enableInAppAlertNotification(enable);
      };
      AndroidOnesignal.prototype.setSubscription = function(enable) {
        game.log(this.tag, "onesignal", "set subscription", "enable: " + enable);
        sdkbox.PluginOneSignal.setSubscription(enable);
      };
      AndroidOnesignal.prototype.postNotification = function(jsonString) {
        game.log(this.tag, "onesignal", "post notification", "json: " + jsonString);
        sdkbox.PluginOneSignal.postNotification(jsonString);
      };
      AndroidOnesignal.intance = null;
      return AndroidOnesignal;
    }();
    exports.default = AndroidOnesignal;
    cc._RF.pop();
  }, {} ],
  AnimationController1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ec6025Cc+VDc6CR9njwzZi6", "AnimationController1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController_1 = require("../../../scripts/Slots/AnimationController");
    var AnimationController1 = function(_super) {
      __extends(AnimationController1, _super);
      function AnimationController1() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AnimationController1 = __decorate([ ccclass ], AnimationController1);
      return AnimationController1;
    }(AnimationController_1.default);
    exports.default = AnimationController1;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/AnimationController": "AnimationController"
  } ],
  AnimationController2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d376a4AvPRFcZsBDpwXN4gl", "AnimationController2");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController_1 = require("../../../scripts/Slots/AnimationController");
    var AnimationController2 = function(_super) {
      __extends(AnimationController2, _super);
      function AnimationController2() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AnimationController2 = __decorate([ ccclass ], AnimationController2);
      return AnimationController2;
    }(AnimationController_1.default);
    exports.default = AnimationController2;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/AnimationController": "AnimationController"
  } ],
  AnimationController3: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d08e5PKM71AlqXM2LdKQkVO", "AnimationController3");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController_1 = require("../../../scripts/Slots/AnimationController");
    var AnimationController3 = function(_super) {
      __extends(AnimationController3, _super);
      function AnimationController3() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AnimationController3 = __decorate([ ccclass ], AnimationController3);
      return AnimationController3;
    }(AnimationController_1.default);
    exports.default = AnimationController3;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/AnimationController": "AnimationController"
  } ],
  AnimationController4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "48afd1zIvdKjqMzMyWdrWo7", "AnimationController4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AnimationController_1 = require("../../../scripts/Slots/AnimationController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController4 = function(_super) {
      __extends(AnimationController4, _super);
      function AnimationController4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.boderWinItem = null;
        _this.nodeAnchor = null;
        _this.reward = 0;
        _this.ItemIds = null;
        _this._lines = [];
        return _this;
      }
      AnimationController4.prototype.onLoad = function() {
        _super.prototype.onLoad.call(this);
        this._slotController = this.node.getComponent("SlotController4");
      };
      AnimationController4.prototype.checkWay = function(data) {
        var _this = this;
        var loop = 0;
        var indexLoop = 0;
        this._listItem = this._slotController.strMatrixToArray(data.spinResult.mat[0], 5, 3);
        var totalLines = config.game.PAY_LINES[243];
        var payLines = [];
        var relsult = [];
        totalLines.forEach(function(line, index) {
          var lineItem = line.map(function(row, col) {
            return _this._listItem[col][row];
          });
          var symbol = lineItem[0];
          var counter = 1;
          lineItem.forEach(function(item, index) {
            if (0 == index) return;
            if (counter < index) return;
            item !== symbol && "w" != item && "w" != symbol || counter++;
            "w" == symbol && "w" != item && (symbol = item);
          });
          if (counter > 2) {
            relsult.push(symbol);
            payLines.push(index);
            loop = 0;
          }
        });
        this.ItemIds = Array.from(new Set(relsult));
        return payLines;
      };
      AnimationController4.prototype.setAnimationData = function(data) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            this.reward = data.spinResult.score.reward;
            this._lines = this.checkWay(data);
            return [ 2 ];
          });
        });
      };
      AnimationController4.prototype.showAllLines = function(count) {
        return __awaiter(this, void 0, void 0, function() {
          var i;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this) return [ 2 ];
              if (count && this._slotController.isSpin) return [ 2 ];
              for (i = 0; i < this._lines.length; i++) this.showAllBox(this._lines[i]);
              return [ 4, util.game.delay(2e3) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      AnimationController4.prototype.showEachLine = function() {
        return __awaiter(this, void 0, void 0, function() {
          var leap, i;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this) return [ 2 ];
              leap = this._lines.length;
              i = 0;
              _a.label = 1;

             case 1:
              if (!(i < leap)) return [ 3, 4 ];
              if (this._slotController.isSpin) return [ 3, 4 ];
              this.showBox(this._lines[i]);
              return [ 4, util.game.delay(2e3) ];

             case 2:
              _a.sent();
              _a.label = 3;

             case 3:
              i++;
              return [ 3, 1 ];

             case 4:
              return [ 2 ];
            }
          });
        });
      };
      AnimationController4.prototype.showAllBox = function(item) {
        if (null == this._slotController || !this) return;
        var listItem = this._slotController.reelController[0]._listItem.slice(1);
        var payTable = config.game.PAY_LINES[this.totalPayLines];
        var line = payTable[item];
        for (var i = 0; i < this.ItemIds.length; i++) {
          var _loop_1 = function(j) {
            var temp1 = this_1.checkIndex(line[j]);
            if (listItem[temp1][j].id != this_1.ItemIds[i] && listItem[temp1][j].id != this_1.wildItemId) return "break";
            listItem[temp1][j].playZoomAnimation();
            setTimeout(function() {
              return listItem[temp1][j].stopZoomAnimation();
            }, 1400);
          };
          var this_1 = this;
          for (var j = 0; j < line.length; j++) {
            var state_1 = _loop_1(j);
            if ("break" === state_1) break;
          }
        }
      };
      AnimationController4.prototype.showBox = function(item) {
        var listItem = this._slotController.reelController[0]._listItem.slice(1);
        var payTable = config.game.PAY_LINES[this.totalPayLines];
        var line = payTable[item];
        if (!this.ItemIds) return;
        for (var i = 0; i < this.ItemIds.length; i++) {
          if (!this.ItemIds) continue;
          for (var j = 0; j < line.length; j++) {
            var temp1 = this.checkIndex(line[j]);
            if (listItem[temp1][j].id != this.ItemIds[i] && listItem[temp1][j].id != this.wildItemId) break;
            listItem[temp1][j].playZoomAnimation();
          }
          util.game.delay(2e3);
        }
      };
      AnimationController4.prototype.checkIndex = function(temp1) {
        var temp = temp1;
        temp = 2 == temp ? 0 : 0 == temp ? 2 : 1;
        return temp;
      };
      AnimationController4.prototype.showPartical = function(data) {
        var _this = this;
        var listItem = this._slotController.reelController[0]._listItem.slice(1);
        listItem.forEach(function(item) {
          item.forEach(function(ele) {
            if ("w" == ele.id) {
              ele.partical.active = true;
              ele.partical.zIndex = 1;
              game.log(ele.partical.zIndex);
              setTimeout(function() {
                ele.partical.runAction(cc.moveTo(.5, _this.nodeAnchor.getPosition()).easing(cc.easeCircleActionInOut()));
              }, 1e3);
            }
          });
        });
      };
      __decorate([ property(cc.Node) ], AnimationController4.prototype, "boderWinItem", void 0);
      __decorate([ property(cc.Node) ], AnimationController4.prototype, "nodeAnchor", void 0);
      AnimationController4 = __decorate([ ccclass ], AnimationController4);
      return AnimationController4;
    }(AnimationController_1.default);
    exports.default = AnimationController4;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/AnimationController": "AnimationController"
  } ],
  AnimationController5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f9738wVjnRMMKzciCT5eApg", "AnimationController5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController_1 = require("../../../scripts/Slots/AnimationController");
    var AnimationController5 = function(_super) {
      __extends(AnimationController5, _super);
      function AnimationController5() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AnimationController5 = __decorate([ ccclass ], AnimationController5);
      return AnimationController5;
    }(AnimationController_1.default);
    exports.default = AnimationController5;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/AnimationController": "AnimationController"
  } ],
  AnimationController6: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9eb0bFXKA9ETYLDQu2Hy5+K", "AnimationController6");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController_1 = require("../../../scripts/Slots/AnimationController");
    var AnimationController6 = function(_super) {
      __extends(AnimationController6, _super);
      function AnimationController6() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AnimationController6.prototype.setAnimationData = function(data) {
        if (data.features.freeReelGame && data.features.freeReelGame.userSpined) {
          this.lines = data.features.freeReelGameResult.map(function(item) {
            return item.score.lines;
          });
          this.reward = data.spinResult.score.reward;
        } else _super.prototype.setAnimationData.call(this, data);
      };
      AnimationController6 = __decorate([ ccclass ], AnimationController6);
      return AnimationController6;
    }(AnimationController_1.default);
    exports.default = AnimationController6;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/AnimationController": "AnimationController"
  } ],
  AnimationController7: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5ef01XT1HpLlp3tCOqxW2WJ", "AnimationController7");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController_1 = require("../../../scripts/Slots/AnimationController");
    var AnimationController7 = function(_super) {
      __extends(AnimationController7, _super);
      function AnimationController7() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.shieldSke = null;
        _this.parShield = null;
        _this.tornado = null;
        _this.birdAni = null;
        _this.dataShield = [];
        _this.listShield = [];
        _this.shield = [];
        _this.position = [];
        return _this;
      }
      AnimationController7.prototype.onLoad = function() {
        this.shieldSke.enabled = false;
        _super.prototype.onLoad.call(this);
        this._slotController7 = this.node.getComponent("SlotController7");
      };
      AnimationController7.prototype.setAnimationData = function(spinResult) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _super.prototype.setAnimationData.call(this, spinResult);
              return [ 4, this.animationShield() ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      AnimationController7.prototype.animationShield = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.listShield = [];
              this.shield = [];
              this.position = [];
              this.dataShield = this._slotController7.dataSpin.spinResult.score.sum[6].arr;
              if (!(this._slotController7.dataSpin.freeSpin.c > 0 && this._slotController7.dataSpin.freeSpin.b > 0)) return [ 3, 4 ];
              this.dataShield.forEach(function(elem) {
                if (elem.valid) {
                  var positionShield = _this._slotController7._listItem[elem.position.col][elem.position.row + 1];
                  if (!("k" == positionShield.id)) {
                    _this.listShield.push(positionShield);
                    _this.shield.push(elem);
                  }
                }
              });
              if (!(this.listShield.length > 0)) return [ 3, 2 ];
              return [ 4, util.game.delay(500) ];

             case 1:
              _a.sent();
              _a.label = 2;

             case 2:
              this.listShield.forEach(function(item) {
                _this.position.push(item.node.getPosition());
              });
              if (!(this.position.length > 0)) return [ 3, 4 ];
              return [ 4, this.aniShield() ];

             case 3:
              _a.sent();
              _a.label = 4;

             case 4:
              return [ 4, this.shieldEffect() ];

             case 5:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      AnimationController7.prototype.aniShield = function() {
        var _this = this;
        return new Promise(function(res) {
          var position = _this._slotController7.tableView.getPosition();
          var birdSkeleton = _this.birdAni.getComponent(sp.Skeleton);
          birdSkeleton.setCompleteListener(function() {
            birdSkeleton.loop = false;
            birdSkeleton.animation = "ani_attack";
            setTimeout(function() {
              if (!_this.position || !_this) return;
              _this.position.forEach(function(item, index) {
                setTimeout(function() {
                  if (!_this.parShield || !_this || !item) return;
                  _this.parShield.active = true;
                  _this.parShield.runAction(cc.sequence([ cc.moveTo(1, cc.v2(item.x + position.x, item.y + position.y)).easing(cc.easeQuadraticActionIn()), cc.callFunc(function() {
                    _this.listShield[index].node.runAction(cc.sequence([ cc.callFunc(function() {
                      _this.tornado.setPosition(item.x + position.x, item.y + position.y);
                      _this.tornado.getComponent(sp.Skeleton).enabled = true;
                    }), cc.callFunc(function() {
                      _this.listShield[index].node.children[1].active = true;
                      _this.listShield[index].node.children[0].getComponent(sp.Skeleton).animation = "caikhien";
                      "number" == typeof _this.shield[index].value ? _this.listShield[index].node.children[1].getComponent(cc.Label).string = util.game.abbreviateNumber(_this.shield[index].value * _this._slotController7.dataSpin.spinResult.totalBet, 0) : _this.listShield[index].node.children[1].getComponent(cc.Label).string = "" + _this.shield[index].value;
                    }), cc.callFunc(function() {
                      setTimeout(function() {
                        if (!_this.tornado || !_this) return;
                        _this.tornado.getComponent(sp.Skeleton).enabled = false;
                        _this.tornado.getComponent(sp.Skeleton).setBonesToSetupPose();
                      }, 1e3);
                    }) ]));
                  }) ]));
                  _this.parShield.zIndex = 1;
                }, 1200 * index);
              });
              setTimeout(function() {
                if (!_this.parShield || !_this) return;
                _this.parShield.setPosition(358, -135);
                _this.parShield.getComponent(cc.ParticleSystem).resetSystem();
                _this.parShield.active = false;
                res();
              }, 1200 * _this.position.length + 500);
            }, 1200);
            birdSkeleton.setCompleteListener(function() {
              birdSkeleton.loop = true;
              birdSkeleton.animation = "ani_bay";
              birdSkeleton.setCompleteListener(function() {
                return null;
              });
            });
          });
        });
      };
      AnimationController7.prototype.shieldEffect = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this.dataShield.length) return [ 2 ];
              return [ 4, util.game.delay(1500) ];

             case 1:
              _a.sent();
              this.dataShield.forEach(function(item) {
                if (item.valid) {
                  var itemNode_1 = _this._slotController7._listItem[item.position.col][item.position.row + 1].node;
                  itemNode_1.runAction(cc.sequence([ cc.callFunc(function() {
                    itemNode_1.children[2].active = true;
                    itemNode_1.children[2].getComponent(sp.Skeleton).animation = "chem_ani";
                  }), cc.scaleTo(.3, 1.2), cc.scaleTo(.2, 1) ]));
                }
              });
              return [ 4, this._slotController7.totalWin() ];

             case 2:
              _a.sent();
              return [ 4, util.game.delay(500) ];

             case 3:
              return [ 2, _a.sent() ];
            }
          });
        });
      };
      __decorate([ property(sp.Skeleton) ], AnimationController7.prototype, "shieldSke", void 0);
      __decorate([ property(cc.Node) ], AnimationController7.prototype, "parShield", void 0);
      __decorate([ property(cc.Node) ], AnimationController7.prototype, "tornado", void 0);
      __decorate([ property(cc.Node) ], AnimationController7.prototype, "birdAni", void 0);
      AnimationController7 = __decorate([ ccclass ], AnimationController7);
      return AnimationController7;
    }(AnimationController_1.default);
    exports.default = AnimationController7;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/AnimationController": "AnimationController"
  } ],
  AnimationController8: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2126fiOpBJPi6tDIw5/aCCo", "AnimationController8");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController_1 = require("../../../scripts/Slots/AnimationController");
    var AnimationController8 = function(_super) {
      __extends(AnimationController8, _super);
      function AnimationController8() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AnimationController8 = __decorate([ ccclass ], AnimationController8);
      return AnimationController8;
    }(AnimationController_1.default);
    exports.default = AnimationController8;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/AnimationController": "AnimationController"
  } ],
  AnimationController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3d72bR6jslGsYSbra1OLiEg", "AnimationController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController = function(_super) {
      __extends(AnimationController, _super);
      function AnimationController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.delayTime = 2.2;
        _this.wildItemId = "w";
        _this.totalPayLines = 20;
        _this.lines = null;
        _this.reward = 0;
        _this._tempIsShowWin = false;
        _this.reelController = null;
        return _this;
      }
      AnimationController.prototype.onLoad = function() {
        this._slotController = this.node.getComponent("SlotController");
      };
      AnimationController.prototype.refreshSlotAnimation = function() {
        this.reelController = this.reelController || this._slotController.reelController;
        this._slotController.reelController.forEach(function(item) {
          return item.linesController.refreshShowLines();
        });
        this.stopZoomLineItems();
        this._tempIsShowWin = false;
      };
      AnimationController.prototype.setAnimationData = function(dataSpin) {
        this.lines = [ dataSpin.spinResult.score.lines ];
        this.reward = dataSpin.spinResult.score.reward;
      };
      AnimationController.prototype.setLinesData = function(data) {
        var gameSize = config.game.GAME_SIZE[this._slotController.gameSizeType];
        var itemAmountInReel = gameSize.length * gameSize[0];
        game.log(itemAmountInReel);
      };
      AnimationController.prototype.showAllLines = function(count) {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (count && this._slotController.isSpin) return [ 2 ];
              return [ 4, Promise.all(this._slotController.reelController.map(function(item, index) {
                return item.linesController.showAllLines(_this.lines[index].map(function(item) {
                  return item.l;
                }).filter(function(item) {
                  return item >= 0;
                }), _this.totalPayLines);
              })) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      AnimationController.prototype.showWinAmount = function() {
        !this._tempIsShowWin && view.screen.slot && this._slotController.uuid === view.screen.slot.SlotController.uuid && view.bar.bottom.gameBar.updateWinAmount(this.reward);
        this._tempIsShowWin = true;
      };
      AnimationController.prototype.showEachLine = function() {
        return __awaiter(this, void 0, void 0, function() {
          var lines, _loop_1, this_1, i, length, state_1;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this || !this.lines) return [ 2 ];
              lines = this.lines;
              _loop_1 = function(i, length) {
                return __generator(this, function(_a) {
                  switch (_a.label) {
                   case 0:
                    if (this_1._slotController.isSpin) return [ 2, "break" ];
                    if (!lines || !lines[0][i] || lines[0][i].l < 0) return [ 2, "continue" ];
                    this_1.playZoomLineItems(lines[0][i]);
                    return [ 4, Promise.all(this_1._slotController.reelController.map(function(item) {
                      return item.linesController.showLine(lines[0][i].l);
                    })) ];

                   case 1:
                    _a.sent();
                    this_1.stopZoomLineItems();
                    return [ 2 ];
                  }
                });
              };
              this_1 = this;
              i = 0, length = lines[0].length;
              _a.label = 1;

             case 1:
              if (!(i < length)) return [ 3, 4 ];
              return [ 5, _loop_1(i, length) ];

             case 2:
              state_1 = _a.sent();
              if ("break" === state_1) return [ 3, 4 ];
              _a.label = 3;

             case 3:
              i++;
              return [ 3, 1 ];

             case 4:
              return [ 2 ];
            }
          });
        });
      };
      AnimationController.prototype.playZoomLineItems = function(item) {
        var _this = this;
        var listItem = this.reelController[0]._listItem.slice(1);
        var payTable = config.game.PAY_LINES[this.totalPayLines];
        var line = payTable[item.l];
        var itemId = parseInt(item.s[0]);
        var isDone = false;
        line.forEach(function(item, i) {
          if (isDone) return;
          listItem[item][i].id == itemId || listItem[item][i].id == _this.wildItemId ? listItem[item][i].playZoomAnimation() : isDone = true;
        });
      };
      AnimationController.prototype.stopZoomLineItems = function() {
        if (!this || !this.reelController) return;
        var listItem = this.reelController.map(function(item) {
          return item._listItem.slice(1);
        });
        listItem.forEach(function(item) {
          return item.forEach(function(item) {
            return item.forEach(function(item) {
              return item.stopZoomAnimation();
            });
          });
        });
      };
      AnimationController.prototype.spinItems = function(listItem) {
        var _this = this;
        listItem.forEach(function(item) {
          item.forEach(function(item) {
            _this.node.runAction(cc.sequence([ cc.delayTime(.2 * item.x), cc.callFunc(function() {
              item.move();
            }) ]));
          });
        });
      };
      AnimationController.prototype.stopAllAction = function() {
        if (!this || !this.lines) return;
        var lines = this.lines;
        for (var i = 0, length = lines[0].length; i < length; i++) {
          if (lines[0][i].l < 0) continue;
          this._slotController.reelController.map(function(item) {
            return item.linesController.stopShowLines();
          });
        }
        lines[0] && (lines[0].length = 0);
        this.stopZoomLineItems();
      };
      __decorate([ property(cc.Float) ], AnimationController.prototype, "delayTime", void 0);
      __decorate([ property(cc.String) ], AnimationController.prototype, "wildItemId", void 0);
      __decorate([ property(cc.Integer) ], AnimationController.prototype, "totalPayLines", void 0);
      AnimationController = __decorate([ ccclass ], AnimationController);
      return AnimationController;
    }(cc.Component);
    exports.default = AnimationController;
    cc._RF.pop();
  }, {} ],
  Api: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "798c96BirVCt69SsVnT+Xy6", "Api");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var scCodecMinBin = require("sc-codec-min-bin");
    var DefineKey = require("./Define/DefineKey");
    var auth_1 = require("./lib/auth");
    var DefineType_1 = require("./Define/DefineType");
    var API = function() {
      function API() {
        this.HOST = "64.120.114.208";
        this.key = DefineKey.api;
        return API.instance || (API.instance = this);
      }
      API.prototype.loginNow = function() {
        return __awaiter(this, void 0, void 0, function() {
          var strLoginData, loginData;
          return __generator(this, function(_a) {
            try {
              strLoginData = cc.sys.localStorage.getItem(define.key.local.LOGIN_DATA.replace("IP", api.HOST)) || JSON.stringify({
                expires: void 0,
                token: "",
                type: 0,
                uid: 0
              });
              loginData = JSON.parse(strLoginData);
              game.log(loginData);
              game.user.loginType = loginData.type;
              if (!loginData.token || loginData.expires && new Date(loginData.expires) < new Date()) {
                game.log("API", "token not exist or expied", "login type:", loginData.type);
                this.login(loginData.type);
                return [ 2 ];
              }
              game.log("API", "token exist login now", "login type:", define.type.LOGIN_TYPE[loginData.type]);
              this.connectSocket(loginData.token);
            } catch (error) {
              game.log("get token error", error);
              tracking.send(tracking.event.LOGIN_FAILED);
            }
            return [ 2 ];
          });
        });
      };
      API.prototype.login = function(type) {
        return __awaiter(this, void 0, void 0, function() {
          var data, tokenReq, loginData;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              data = void 0;
              if (!(type === DefineType_1.LOGIN_TYPE.FACEBOOK)) return [ 3, 2 ];
              return [ 4, platform.facebook.login() ];

             case 1:
              data = _a.sent();
              return [ 3, 3 ];

             case 2:
              data = game.data.deviceId;
              _a.label = 3;

             case 3:
              return [ 4, this.getToken({
                type: type,
                data: data
              }) ];

             case 4:
              tokenReq = _a.sent();
              game.log("API", "get token done", tokenReq);
              loginData = {
                token: tokenReq.token,
                expires: tokenReq.expires,
                uid: tokenReq.uid,
                type: type
              };
              cc.sys.localStorage.setItem(define.key.local.LOGIN_DATA.replace("IP", api.HOST), JSON.stringify(loginData));
              this.connectSocket(loginData.token);
              return [ 2 ];
            }
          });
        });
      };
      API.prototype.getToken = function(data) {
        var _this = this;
        game.log("API", "start get token", data);
        return new Promise(function(resolve, reject) {
          var _a;
          var url = "";
          var key = "";
          if (data.type == define.type.LOGIN_TYPE.FACEBOOK) {
            url = "http://" + _this.HOST + ":8000/v1/authfb";
            key = "accessToken";
          } else {
            url = "http://" + _this.HOST + ":8000/v1/authdev";
            key = "ID";
          }
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {
            if (4 == xhr.readyState) {
              if (xhr.status >= 200 && xhr.status < 400) {
                tracking.send(tracking.event.GET_TOKKEN_SUCCESSED);
                var responseObj = JSON.parse(xhr.responseText);
                return resolve(responseObj);
              }
              tracking.send(tracking.event.GET_TOKKEN_ERROR);
              return reject(xhr.responseText);
            }
          };
          xhr.open("POST", url, true);
          cc.sys.isNative && xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
          xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
          xhr.send(JSON.stringify((_a = {}, _a[key] = data.data, _a)));
        });
      };
      API.prototype.connectSocket = function(token) {
        var _this = this;
        var TOKENKEY_STORE = "socketCluster.authToken";
        var authEngine;
        if (token) {
          authEngine = new auth_1.AuthEngine();
          authEngine.saveToken(TOKENKEY_STORE, token);
        }
        this.socket = socketCluster.connect({
          port: 8001,
          hostname: this.HOST,
          perMessageDeflate: true,
          codecEngine: scCodecMinBin,
          multiplex: false,
          autoReconnect: false
        });
        this.socket.on("error", function(err) {
          game.error("socket.on error", JSON.stringify(err));
        });
        this.socket.on("connect", function(status) {
          return __awaiter(_this, void 0, void 0, function() {
            var data, authToken, e_1;
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                _a.trys.push([ 0, 2, , 3 ]);
                game.log("Socket is connected", this.socket.authToken, this.socket.signedAuthToken, status);
                return [ 4, this.sendGDPromise({
                  e: "regisClient",
                  deviceInfo: "developer",
                  deviceOs: game.data.deviceOs,
                  packageName: game.data.packageName,
                  versionGame: game.data.versionGame
                }) ];

               case 1:
                data = _a.sent();
                tracking.send(tracking.event.LOGIN_SUCCESSED);
                store.emit(store.key.LOGIN_DONE, "");
                game.logEvent("Login data:", data);
                view.dialog["connection_error"] && view.dialog["connection_error"].onClose();
                tracking.setUserID(data.userid);
                game.user.id = data.userid;
                game.user.fbid = data.authfb && data.authfb.fbid ? data.authfb.fbid : "";
                game.data.shop = data.shop;
                game.data.megaWheel = data.megaWheel;
                store.emit(store.key.UPDATE_USER_BALANCE, 0, {
                  delayTime: 0,
                  lerpRatio: 200
                });
                store.emit(store.key.UPDATE_USER_BALANCE, data.coin, {
                  delayTime: 0,
                  lerpRatio: 50
                });
                store.emit(store.key.UPDATE_USER_LEVEL, data.level, {
                  delayTime: 0,
                  lerpRatio: 50
                });
                store.emit(store.key.UPDATE_USER_AVATAR, "");
                store.emit(store.key.UPDATE_SHOP_DATA, game.data.shop);
                store.emit(store.key.DAILYQUEST, data.dailyQuest, {
                  delayTime: 0,
                  lerpRatio: 50
                });
                store.emit(store.key.DAILYBONUS, data.dailyBonus, {
                  delayTime: 0,
                  lerpRatio: 50
                });
                store.emit(store.key.WEEKLY_ACCUMILATION, data.weeklyAccumilation, {
                  delayTime: 0,
                  lerpRatio: 50
                });
                game.data.megaWheel && store.emit(store.key.UPDATE_MEGAWHEEL_DATA, game.data.megaWheel);
                game.data.now = new Date(data.now);
                game.data.dTime = new Date().getTime() - game.data.now.getTime();
                if (status.isAuthenticated) {
                  authToken = this.socket.authToken;
                  this.subscribeChanel(authToken.uid);
                }
                return [ 3, 3 ];

               case 2:
                e_1 = _a.sent();
                game.log(e_1);
                tracking.send(tracking.event.LOGIN_FAILED);
                return [ 3, 3 ];

               case 3:
                return [ 2 ];
              }
            });
          });
        });
        this.socket.on("authenticate", function(signedAuthToken) {
          game.log("on.authenticate", signedAuthToken);
        });
        this.socket.on("deauthenticate", function(a, b, c) {
          this.socket.disconnect();
          this.loginNow();
        }.bind(this));
        this.socket.on("random", function(data) {
          game.log('Received "random" event with data: ' + data.number);
        });
        this.socket.on("disconnect", function(data) {
          var _this = this;
          controller.ui.showDialog({
            title: "Connection Error",
            type: define.type.DIALOG_TYPE.FORCE,
            name: "connection_error",
            message: {
              message: "Failed to connect to the server.\nPlease check your Internet connection."
            },
            buttons: [ {
              title: "Reload",
              theme: define.type.CLASS_THEME.DANGER,
              callback: function() {
                _this.socket.reconnect();
              }
            } ]
          });
        }.bind(this));
        this.socket.on("error", function(err) {
          controller.ui.showDialog({
            title: "Connection Error",
            type: define.type.DIALOG_TYPE.FORCE,
            name: "connection_error",
            message: {
              message: "Failed to connect to the server.\nPlease check your Internet connection."
            },
            buttons: [ {
              title: "Reload",
              theme: define.type.CLASS_THEME.DANGER,
              callback: function() {
                _this.socket.reconnect();
              }
            } ]
          });
        });
      };
      API.prototype.subscribeChanel = function(uid) {
        var channelME = this.socket.subscribe("u:" + uid);
        channelME.unwatch();
        channelME.on("subscribeFail", function(err) {
          game.error("Failed to subscribe to the channelME channel due to error: " + err);
        });
        channelME.watch(function(data) {
          game.logEvent(data);
          switch (data.type) {
           case api.key.SLOT_SPIN:
            var slotScene = Object.values(view.slot).find(function(item) {
              return item && item.gameId == data.spinResult.id;
            });
            slotScene && slotScene.SlotController.watchEvent(data);
            store.emit(store.key.UPDATE_USER_BALANCE, data.userInfo.coinBalance);
            var level = game.user.level;
            store.emit(store.key.UPDATE_USER_LEVEL, __assign({}, level, {
              currentExp: data.userInfo.exp
            }));
            break;

           case api.key.SLOT_BONUS_RESULT:
            game.user.balance = data.ccoin;
            if (view.screen.game) {
              var slotController = Object.values(view.slot).find(function(item) {
                return item && item.gameId == data.smid;
              });
              if (slotController) return;
            }
            store.emit(store.key.UPDATE_USER_BALANCE, data.ccoin);
            break;

           case api.key.LEVEL_UP:
            var rewards = data.rewards;
            var nextRewards = data.nextRewards;
            store.emit(store.key.UPDATE_USER_BALANCE, data.balance, {
              delayTime: 0,
              lerpRatio: 50
            });
            store.emit(store.key.UPDATE_USER_LEVEL, {
              currentExp: data.exp,
              currentLevel: data.level,
              requiredExp: data.requiredExp
            }, {
              delayTime: 0,
              lerpRatio: 50
            });
            var slot_1 = view.screen.slot;
            slot_1 && slot_1.SlotController.getStatusGame().then(function() {
              slot_1.SlotController.importData();
            });
            api.sendGD({
              e: define.key.api.GET_SHOP_INFO,
              method: game.data.deviceOs
            }, function(err, data) {
              store.emit(store.key.UPDATE_SHOP_DATA, data);
            });
            controller.ui.playPrefabAnimation("levelup", {
              level: data.level,
              coin: rewards
            });
            break;

           case api.key.DAILYQUEST_INFO:
            store.emit(store.key.DAILYQUEST, data);
            break;

           case api.key.WEEKLY_ACCUMILATION_INFO:
            store.emit(store.key.WEEKLY_ACCUMILATION, data);
            break;

           default:
            data.coin && store.emit(store.key.UPDATE_USER_BALANCE, data.coin);
          }
        });
      };
      API.prototype.registerClient = function() {
        this.sendGD({
          e: api.key.REGIS
        }, function(err, data) {
          if (err) return game.log(err);
          game.log(data);
        });
      };
      API.prototype.sendGD = function(data, cb) {
        this.socket.emit("GD", data, function(err, data) {
          game.logEvent(err, data);
          cb(err, data);
        });
      };
      API.prototype.sendGDPromise = function(data) {
        var _this = this;
        return new Promise(function(res, rej) {
          var cb = function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
            if (args[0]) return rej(args[0]);
            return res(args[1]);
          };
          _this.socket.emit("GD", data, function(err, data) {
            game.logEvent(err, data);
            cb(err, data);
          });
        });
      };
      API.prototype.onSceneChanged = function(sceneName) {
        game.log("onSceneChanged", sceneName);
        this.socket.emit("clientreact", {
          data: sceneName || 1
        }, function(err, res) {
          game.log("clientreact result", err, res);
        });
      };
      return API;
    }();
    exports.default = new API();
    cc._RF.pop();
  }, {
    "./Define/DefineKey": "DefineKey",
    "./Define/DefineType": "DefineType",
    "./lib/auth": "auth",
    "sc-codec-min-bin": 37
  } ],
  AtributeStatic: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "150e3IRMttCLZc24LilVNrB", "AtributeStatic");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AtributeStatic = function(_super) {
      __extends(AtributeStatic, _super);
      function AtributeStatic() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AtributeStatic_1 = AtributeStatic;
      AtributeStatic.prototype.setIdBetSelect = function(idBetSelect) {
        AtributeStatic_1.idBetSelect = idBetSelect;
      };
      var AtributeStatic_1;
      AtributeStatic.idBetSelect = null;
      AtributeStatic.bonusData = [];
      AtributeStatic.loop = 0;
      AtributeStatic.idJackpot = 0;
      AtributeStatic = AtributeStatic_1 = __decorate([ ccclass ], AtributeStatic);
      return AtributeStatic;
    }(cc.Component);
    exports.default = AtributeStatic;
    cc._RF.pop();
  }, {} ],
  AutoFitCanvas: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47ca3UOMgpCWrc3zu85EsQe", "AutoFitCanvas");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      NewClass.prototype.onLoad = function() {
        var realScreenSize = cc.view.getFrameSize();
        var realScreenRatio = realScreenSize.width / realScreenSize.height;
        var designScreenRatio = 1280 / 720;
        var canvas = this.node.getComponent(cc.Canvas);
        if (realScreenRatio < designScreenRatio) {
          canvas.fitHeight = false;
          canvas.fitWidth = true;
        } else {
          canvas.fitHeight = true;
          canvas.fitWidth = false;
        }
      };
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ],
  Avatar: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9b7c3vvUBNKn6t+X9JOuCHf", "Avatar");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Avatar = function(_super) {
      __extends(Avatar, _super);
      function Avatar() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.img = void 0;
        _this.border = void 0;
        _this.callback = void 0;
        return _this;
      }
      Avatar.prototype.onLoad = function() {};
      Avatar.prototype.setAvatar = function(data) {
        var _this = this;
        data = data || {};
        var facebookID = data.facebookID, avatarID = data.avatarID;
        if ("undefined" == typeof facebookID && "undefined" == typeof avatarID) return game.warn("Avatar", "input error");
        if (facebookID) {
          var url = define.string.URL_AVT_FACEBOOK.replace("%facebookID%", facebookID);
          util.game.loadSpriteFrame(url, function(d) {
            _this.img.spriteFrame = d.spriteFrame;
            _this.img.node.setContentSize(cc.size(56, 56));
          });
        }
      };
      Avatar.prototype.setCallback = function(callback) {
        this.callback = callback;
      };
      Avatar.prototype.onClickAvatart = function() {
        game.log("On click avatar");
        this.callback && this.callback();
      };
      __decorate([ property(cc.Sprite) ], Avatar.prototype, "img", void 0);
      __decorate([ property(cc.Sprite) ], Avatar.prototype, "border", void 0);
      Avatar = __decorate([ ccclass ], Avatar);
      return Avatar;
    }(cc.Component);
    exports.default = Avatar;
    cc._RF.pop();
  }, {} ],
  BasePopup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ab08aBub7hPBqf0+XKkL0BI", "BasePopup");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineType_1 = require("./Define/DefineType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BasePopup = function(_super) {
      __extends(BasePopup, _super);
      function BasePopup() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.popupName = "";
        _this.type = DefineType_1.POPUP_TYPE.NONE;
        _this.effect = DefineType_1.EFFECT_TYPE.BOUCE;
        _this.overlay = void 0;
        _this.popBg = void 0;
        _this.autoOpen = true;
        _this.allowClose = true;
        _this.autoRelease = true;
        _this.timeIn = .25;
        _this.timeOut = .12;
        _this.isOpen = false;
        _this.mask = void 0;
        _this.popup = void 0;
        _this.oriPos = void 0;
        return _this;
      }
      BasePopup.prototype.onLoad = function() {
        this.mask = this.overlay || this.node.getChildByName("mask");
        this.popup = this.popBg || this.node.getChildByName("popup");
        this.oriPos = this.node.getPosition();
        this.popup || cc.warn("BasePopup", "Please add popup background in script for run");
        !this.popupName || (view.popup[this.popupName] = this);
        this.mask && (this.mask.active = true);
        this.type !== DefineType_1.POPUP_TYPE.NONE && (this.node.zIndex = this.type);
        if (!this.autoOpen) {
          util.game.hideNode(this.node);
          this.node.x = cc.winSize.width + this.oriPos.x;
        }
      };
      BasePopup.prototype.start = function() {
        this.autoOpen && this.onOpen();
      };
      BasePopup.prototype.init = function(data) {};
      BasePopup.prototype.reOpen = function(data) {
        this.init(data);
        this.onOpen();
      };
      BasePopup.prototype.onOpen = function(callback) {
        var _this = this;
        return new Promise(function(res, rej) {
          var _a = _this, popup = _a.popup, mask = _a.mask, timeIn = _a.timeIn, node = _a.node, popupName = _a.popupName, type = _a.type, oriPos = _a.oriPos;
          if (!popup) {
            cc.warn("BasePopup", "Please add popup background in script for run");
            return;
          }
          util.game.showNode(node, type !== DefineType_1.POPUP_TYPE.NONE ? type : 1);
          node.x = oriPos.x;
          popup.opacity = 0;
          mask && (mask.opacity = 0);
          node.stopAllActions();
          popup.stopAllActions();
          mask && mask.stopAllActions();
          mask && mask.runAction(cc.fadeTo(timeIn, 175));
          var option = {
            time: timeIn,
            callback: function() {
              game.log("BasePopup", "popup " + popupName + " open complete");
              _this.isOpen = true;
              callback && callback();
              _this.openCallback();
              res();
            }
          };
          var popEffect = effect.getEffectName(DefineType_1.EFFECT_KIND.IN, _this.effect);
          popup.runAction(effect.get(popEffect, option));
        });
      };
      BasePopup.prototype.onClose = function(callback) {
        var _this = this;
        var _a = this, popup = _a.popup, mask = _a.mask, popupName = _a.popupName, autoRelease = _a.autoRelease, timeOut = _a.timeOut, node = _a.node, oriPos = _a.oriPos;
        if (!popup) {
          cc.warn("BasePopup", "Please add popup background in script for run");
          return;
        }
        node.stopAllActions();
        popup.stopAllActions();
        mask && mask.stopAllActions();
        mask && mask.runAction(cc.fadeOut(timeOut));
        var option = {
          time: timeOut,
          callback: function() {
            game.log("BasePopup", "popup " + popupName + " close complete");
            _this.isOpen = false;
            if (autoRelease) _this.onRelease(); else {
              util.game.hideNode(node);
              node.x = cc.winSize.width + oriPos.x;
            }
            callback && callback();
            _this.closeCallback();
          }
        };
        var popEffect = effect.getEffectName(DefineType_1.EFFECT_KIND.OUT, this.effect);
        popup.runAction(effect.get(popEffect, option));
      };
      BasePopup.prototype.openCallback = function() {};
      BasePopup.prototype.closeCallback = function() {};
      BasePopup.prototype.onClickClose = function(event) {
        if (!this.allowClose && event && ("btnClose" === event.currentTarget.name || event.currentTarget.name === this.mask.name)) {
          game.log("BasePopup", "onClose", "popup do not allow close by close button or mask");
          return;
        }
        game.log("BasePopup", "onClickClose");
        this.onClose();
      };
      BasePopup.prototype.onRelease = function() {
        var _a = this, node = _a.node, popupName = _a.popupName;
        node.destroy();
        !!popupName && view.popup[popupName] && delete view.popup[popupName];
      };
      __decorate([ property ], BasePopup.prototype, "popupName", void 0);
      __decorate([ property({
        type: cc.Enum(DefineType_1.POPUP_TYPE),
        displayName: "Popup Type"
      }) ], BasePopup.prototype, "type", void 0);
      __decorate([ property({
        type: cc.Enum(DefineType_1.EFFECT_TYPE)
      }) ], BasePopup.prototype, "effect", void 0);
      __decorate([ property({
        type: cc.Node
      }) ], BasePopup.prototype, "overlay", void 0);
      __decorate([ property({
        type: cc.Node,
        displayName: "Popup Background"
      }) ], BasePopup.prototype, "popBg", void 0);
      __decorate([ property ], BasePopup.prototype, "autoOpen", void 0);
      __decorate([ property ], BasePopup.prototype, "allowClose", void 0);
      __decorate([ property ], BasePopup.prototype, "autoRelease", void 0);
      __decorate([ property ], BasePopup.prototype, "timeIn", void 0);
      __decorate([ property ], BasePopup.prototype, "timeOut", void 0);
      BasePopup = __decorate([ ccclass ], BasePopup);
      return BasePopup;
    }(cc.Component);
    exports.default = BasePopup;
    cc._RF.pop();
  }, {
    "./Define/DefineType": "DefineType"
  } ],
  BottomBarController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2e8benZlMBIu42SLCLkIQOe", "BottomBarController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BAR_TYPE;
    (function(BAR_TYPE) {
      BAR_TYPE["HOME"] = "HOME";
      BAR_TYPE["GAME"] = "GAME";
    })(BAR_TYPE || (BAR_TYPE = {}));
    var BottomBarController = function(_super) {
      __extends(BottomBarController, _super);
      function BottomBarController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.homeBar = void 0;
        _this.gameBar = void 0;
        _this.model = void 0;
        _this.barType = BAR_TYPE.HOME;
        return _this;
      }
      BottomBarController.prototype.onLoad = function() {
        this.homeBar = this.node.getChildByName("home").getComponent("BottomHomeBarController");
        this.gameBar = this.node.getChildByName("game").getComponent("BottomGameBarController");
        this.model = this.node.getChildByName("model");
        this.updateBarView();
      };
      BottomBarController.prototype.lock = function() {
        this.model.active = true;
      };
      BottomBarController.prototype.unlock = function() {
        this.model.active = false;
      };
      BottomBarController.prototype.hide = function(effect) {
        var _this = this;
        void 0 === effect && (effect = true);
        return new Promise(function(res, rej) {
          if (effect) {
            _this.node.y = -360;
            _this.node.stopAllActions();
            _this.lock();
            _this.node.runAction(cc.sequence(cc.moveBy(.1, cc.v2(0, -_this.node.height)), cc.callFunc(function() {
              _this.unlock();
              res();
            })));
          } else {
            _this.node.y = -360 - _this.node.height;
            _this.node.stopAllActions();
            _this.unlock();
            res();
          }
        });
      };
      BottomBarController.prototype.show = function(effect) {
        var _this = this;
        void 0 === effect && (effect = true);
        return new Promise(function(res, rej) {
          if (effect) {
            _this.node.y = -360 - _this.node.height;
            _this.node.stopAllActions();
            _this.lock();
            _this.node.runAction(cc.sequence(cc.moveBy(.2, cc.v2(0, _this.node.height)), cc.callFunc(function() {
              _this.unlock();
              res();
            })));
          } else {
            _this.node.y = -360;
            _this.node.stopAllActions();
            _this.unlock();
            res();
          }
        });
      };
      BottomBarController.prototype.toggleEffect = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, this.hide() ];

             case 1:
              _a.sent();
              return [ 4, this.updateBarView() ];

             case 2:
              _a.sent();
              return [ 4, this.show() ];

             case 3:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      BottomBarController.prototype.updateBarView = function() {
        this.showNodeBar(this.barType === BAR_TYPE.HOME ? this.homeBar.node : this.gameBar.node);
        this.hiddenNodeBar(this.barType === BAR_TYPE.HOME ? this.gameBar.node : this.homeBar.node);
      };
      BottomBarController.prototype.showGameBar = function() {
        if (this.barType === BAR_TYPE.GAME) return;
        this.barType = BAR_TYPE.GAME;
        this.toggleEffect();
        this.gameBar.showContentBar();
      };
      BottomBarController.prototype.showHomeBar = function() {
        if (this.barType === BAR_TYPE.HOME) return;
        this.barType = BAR_TYPE.HOME;
        this.toggleEffect();
        this.gameBar.hiddenContentBar();
      };
      BottomBarController.prototype.hiddenNodeBar = function(bar) {
        bar.y = -bar.height;
        bar.opacity = 0;
      };
      BottomBarController.prototype.showNodeBar = function(bar) {
        bar.y = 0;
        bar.opacity = 255;
      };
      BottomBarController.prototype.updateView = function() {
        if (this.barType === BAR_TYPE.HOME && controller.ui.onView === define.type.VIEW.HOME || this.barType === BAR_TYPE.GAME && controller.ui.onView === define.type.VIEW.GAME) return;
        controller.ui.onView === define.type.VIEW.GAME ? this.showGameBar() : this.showHomeBar();
      };
      BottomBarController = __decorate([ ccclass ], BottomBarController);
      return BottomBarController;
    }(cc.Component);
    exports.default = BottomBarController;
    cc._RF.pop();
  }, {} ],
  BottomGameBarController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "87074QkXOxOTI12esJd2SQF", "BottomGameBarController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BottomGameBarController = function(_super) {
      __extends(BottomGameBarController, _super);
      function BottomGameBarController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.winLabel = null;
        _this.betLabel = null;
        _this.spinButton = null;
        _this.holdTime = 500;
        _this.autoBet = null;
        _this.normalSpin = null;
        _this.stopAutoSpin = null;
        _this.stopNormalSpin = null;
        _this.bottomActive = [];
        _this.bottomLock = [];
        _this.dailyNode = null;
        _this.statusLabel = null;
        _this.spinSprite = null;
        _this.autoSpinLabel = null;
        _this.lerpRatio = 10;
        _this.winAmount = 0;
        _this.currentBet = 0;
        _this.betArray = [];
        _this.isUpdattingWinAmount = false;
        _this._tempWin = 0;
        _this._isPress = false;
        _this._setTimeout = null;
        _this._isShow = false;
        _this.container = null;
        _this.key = [];
        return _this;
      }
      BottomGameBarController.prototype.onLoad = function() {
        this.initialize();
        this.resetWinAmount();
        this.addSpinButtonEvent();
        this.registerEvent();
      };
      BottomGameBarController.prototype.initialize = function() {
        this.container = this.node.getChildByName("container");
        this.container.getComponent(cc.Widget).updateAlignment();
        this.container.getComponent(cc.Widget).enabled = false;
        this.spinSprite = this.spinButton.node.getComponent(cc.Sprite);
        var status = this.container.getChildByName("status");
        this.statusLabel = status.getChildByName("lbStatus").getComponent(cc.Label);
        this.autoSpinLabel = this.spinButton.node.getComponentInChildren(cc.Label);
      };
      BottomGameBarController.prototype.onClickDailyQuest = function() {
        controller.ui.showPopup("daily");
        game.log("BottomHomeBarController", "onClickDailyQuest");
      };
      BottomGameBarController.prototype.resetWinAmount = function() {
        this.winLabel.string = "0";
      };
      BottomGameBarController.prototype.addSpinButtonEvent = function() {
        var _this = this;
        this.spinButton.node.on(cc.Node.EventType.TOUCH_START, function(e) {
          game.log("Spin button start click");
          _this._isPress = true;
          _this._setTimeout = setTimeout(function() {
            if (!_this.autoBet.active) {
              _this.showAutoBet();
              _this.autoBet.zIndex = -1;
            }
            _this._isPress = false;
          }, _this.holdTime);
        });
        this.spinButton.node.on(cc.Node.EventType.TOUCH_END, function(e) {
          game.log("Spin button end click");
          if (_this._isPress) {
            view.screen.game.onClickSpin();
            _this.bottomBarEvent(define.type.BottomBar.lock);
            _this.updateSpinFrame(define.type.SpinButton.stopNormalSpin);
            clearTimeout(_this._setTimeout);
            _this._isPress = false;
          }
        });
        this.spinButton.node.on(cc.Node.EventType.TOUCH_CANCEL, function(e) {
          game.log("Spin button cancel click");
          _this._isPress = false;
          clearTimeout(_this._setTimeout);
        });
      };
      BottomGameBarController.prototype.bottomBarEvent = function(type) {
        var _this = this;
        var betArea = this.betLabel.node.parent;
        var nameBottomBar = [ "btn-bet-down", "btn-bet-up" ];
        var maxBet = this.node.getChildByName("container").getChildByName("btn-maxbet");
        switch (type) {
         case define.type.BottomBar.active:
          nameBottomBar.forEach(function(item, index) {
            betArea.getChildByName(item).getComponent(cc.Sprite).spriteFrame = _this.bottomActive[index];
            betArea.getChildByName(item).getComponent(cc.Button).interactable = true;
          });
          maxBet.getComponent(cc.Sprite).spriteFrame = this.bottomActive[2];
          maxBet.getComponent(cc.Button).interactable = true;
          break;

         case define.type.BottomBar.lock:
          nameBottomBar.forEach(function(item, index) {
            betArea.getChildByName(item).getComponent(cc.Sprite).spriteFrame = _this.bottomLock[index];
            betArea.getChildByName(item).getComponent(cc.Button).interactable = false;
          });
          maxBet.getComponent(cc.Sprite).spriteFrame = this.bottomLock[2];
          maxBet.getComponent(cc.Button).interactable = false;
        }
      };
      BottomGameBarController.prototype.displayBetLabel = function() {
        var time = .15;
        this.betLabel.node.runAction(cc.scaleTo(time, 1.05));
        this.betLabel.string = util.string.formatMoney(this.currentBet);
        this.betLabel.node.runAction(cc.sequence(cc.delayTime(time), cc.scaleTo(time, 1)));
      };
      BottomGameBarController.prototype.autoSpin = function(e, times) {
        var _this = this;
        tracking.send(tracking.event.AUTO_SPIN.replace("NUMSPIN", times));
        view.screen.slot.SlotController.autoSpin(Number(times));
        this.updateSpinFrame(define.type.SpinButton.stopAutoSpin);
        setTimeout(function() {
          return _this.hideAutoBet();
        }, 100);
      };
      BottomGameBarController.prototype.showAutoBet = function() {
        game.log("Show auto bet");
        this.autoBet.active = true;
        this.autoBet.runAction(cc.moveBy(.4, cc.v2(0, this.autoBet.height)));
        util.game.showNode(this.autoBet);
      };
      BottomGameBarController.prototype.hideAutoBet = function() {
        var _this = this;
        game.log("Hide auto bet");
        this.autoBet.runAction(cc.sequence(cc.moveBy(.1, cc.v2(0, -this.autoBet.height)), cc.callFunc(function() {
          util.game.hideNode(_this.autoBet);
          _this.autoBet && (_this.autoBet.active = false);
        })));
      };
      BottomGameBarController.prototype.updateInfo = function() {
        var currentSlot = view.screen.slot || null;
        if (!currentSlot) return;
        this.betArray = currentSlot.SlotController.betArray;
        this.currentBet = currentSlot.SlotController.currentBet;
        this.displayBetLabel();
        this.winAmount = currentSlot.SlotController.lastWin;
        this.winLabel.string = this.winAmount.toString();
      };
      BottomGameBarController.prototype.changeBetAmount = function(e, i) {
        game.log("BottomGameBarController", "changeBetAmount");
        i = Number(i);
        var index = this.betArray.indexOf(this.currentBet);
        0 == index && -1 == i ? this.currentBet = this.betArray[this.betArray.length - 1] : index == this.betArray.length - 1 && 1 == i ? this.currentBet = this.betArray[0] : this.currentBet = index < 0 ? this.betArray[0] : this.betArray[index + i];
        view.screen.slot && view.screen.slot.SlotController.updateCurrentBet(this.currentBet);
        this.displayBetLabel();
      };
      BottomGameBarController.prototype.updateSpinFrame = function(type) {
        switch (type) {
         case define.type.SpinButton.normal:
          this.spinSprite.spriteFrame = this.normalSpin;
          this.autoSpinLabel.node.active = false;
          break;

         case define.type.SpinButton.stopAutoSpin:
          this.spinSprite.spriteFrame = this.stopAutoSpin;
          this.autoSpinLabel.node.active = true;
          break;

         case define.type.SpinButton.stopNormalSpin:
          this.spinSprite.spriteFrame = this.stopNormalSpin;
        }
      };
      BottomGameBarController.prototype.updateAutoSpinTime = function(spinTimes) {
        try {
          this.autoSpinLabel.string = spinTimes < 0 ? "BONUS" : spinTimes.toString();
          this.updateSpinFrame(define.type.SpinButton.stopAutoSpin);
        } catch (e) {
          game.log(e);
        }
      };
      BottomGameBarController.prototype.maxBetAmount = function() {
        this.currentBet = this.betArray[this.betArray.length - 1];
        view.screen.slot && view.screen.slot.SlotController.updateCurrentBet(this.currentBet);
        this.displayBetLabel();
      };
      BottomGameBarController.prototype.updateWinAmount = function(num) {
        this.winAmount = num;
        this.isUpdattingWinAmount = true;
      };
      BottomGameBarController.prototype.update = function(dt) {
        this._updateWinAmount(dt);
      };
      BottomGameBarController.prototype._updateWinAmount = function(dt) {
        if (this.isUpdattingWinAmount) {
          var delta = this.winAmount - this._tempWin;
          this._tempWin = delta * this.lerpRatio * dt + this._tempWin;
          this.winLabel.string = util.string.formatMoney(this._tempWin);
          if (this.winAmount - this._tempWin < 1) {
            this.winLabel.string = util.string.formatMoney(this.winAmount);
            this.isUpdattingWinAmount = false;
            this._tempWin = 0;
          }
        }
      };
      BottomGameBarController.prototype.updateStatus = function(status) {
        var label = this.statusLabel;
        var showAnim = false;
        if (status.freeSpin) {
          showAnim = !label.string.includes("Freespin");
          label.string = "Freespin: " + status.freeSpin;
        } else if (status.winType === define.type.WIN_TYPE.MEGAWIN) {
          showAnim = !label.string.includes("Mega Win");
          label.string = "Mega Win";
        } else if (status.winType === define.type.WIN_TYPE.BIGWIN) {
          showAnim = !label.string.includes("Big Win");
          label.string = "Big Win";
        } else {
          showAnim = !(label.string.includes("Win") && !label.string.includes("Big") && !label.string.includes("Mega"));
          label.string = "Win";
        }
        if (showAnim) {
          var oriPos = cc.v2(0, 8);
          label.node.stopAllActions();
          label.node.runAction(cc.sequence(cc.moveBy(.2, cc.v2(0, -100)), cc.moveTo(.3, oriPos)));
        }
      };
      BottomGameBarController.prototype.showContentBar = function() {
        if (!view.screen.slot) return;
        var slot = view.screen.slot.SlotController;
        if (view.screen.slot.SlotController.autoSpinTimes <= 0) {
          this.bottomBarEvent(define.type.BottomBar.active);
          this.updateSpinFrame(define.type.SpinButton.normal);
        } else {
          this.bottomBarEvent(define.type.BottomBar.lock);
          this.updateAutoSpinTime(slot.autoSpinTimes);
        }
        slot.statusGame.freeSpin = slot.freeSpin;
        slot.freeSpin > 0 && this.updateStatus(slot.statusGame);
        game.log("FS", slot.freeSpin);
        game.log("AUTO", slot.autoSpinTimes);
      };
      BottomGameBarController.prototype.hiddenContentBar = function() {
        var spin = this.spinButton.node.parent;
        spin.getChildByName("list-auto").active && this.hideAutoBet();
      };
      BottomGameBarController.prototype.registerEvent = function() {
        var _this = this;
        var keyQuest = store.register(store.key.DAILYQUEST, function(dailyQuest) {
          var content = _this.dailyNode.getChildByName("content");
          var text = content.getChildByName("text").getComponent(cc.Label);
          var progress = content.getChildByName("progress").getComponent("AccumulatedBar");
          if (!dailyQuest || !dailyQuest.missions || "undefined" == typeof dailyQuest.currentQuest || !dailyQuest.missions[dailyQuest.currentQuest]) {
            if (dailyQuest.completeAll) {
              progress.node.opacity = 0;
              text.node.opacity = 255;
              text.string = "Completed";
            }
            return;
          }
          game.data.dailyQuest = dailyQuest;
          var percent = dailyQuest.currentProgress / dailyQuest.missions[dailyQuest.currentQuest].goal;
          percent = percent > 100 ? 100 : percent;
          if (percent >= progress.progress) progress.updateProgress(percent); else {
            progress.setProgress(0, false);
            progress.updateProgress(percent);
          }
          _this.dailyNode.stopAllActions();
          var questCur = dailyQuest.missions[dailyQuest.currentQuest];
          var questType = questCur.requireType;
          if (3 === questType || questCur.goal == dailyQuest.currentProgress) {
            if (questCur.goal <= dailyQuest.currentProgress) text.string = "Claim"; else {
              var questProgress = dailyQuest.currentCount;
              text.string = questProgress + " " + (questProgress > 1 ? "times" : "time");
            }
            text.node.opacity = 255;
            _this.dailyNode.runAction(cc.sequence(cc.callFunc(function() {
              if (!text || !progress) return;
              var effIn = effect.bouceIn({
                time: .3
              });
              var effOut = effect.bouceOut({
                time: .3
              });
              if (255 == text.node.opacity) {
                text.node.runAction(effOut);
                progress.node.runAction(effIn);
              } else {
                text.node.runAction(effIn);
                progress.node.runAction(effOut);
              }
            }), cc.delayTime(3)).repeatForever());
          } else {
            text.node.opacity = 0;
            progress.node.opacity = 255;
            progress.node.runAction(effect.bouceIn({
              time: .3
            }));
          }
        });
        this.key.push(keyQuest);
      };
      BottomGameBarController.prototype.onDestroy = function() {
        this.key.forEach(function(o) {
          return store.unRegister(o);
        });
      };
      __decorate([ property(cc.Label) ], BottomGameBarController.prototype, "winLabel", void 0);
      __decorate([ property(cc.Label) ], BottomGameBarController.prototype, "betLabel", void 0);
      __decorate([ property(cc.Button) ], BottomGameBarController.prototype, "spinButton", void 0);
      __decorate([ property(cc.Integer) ], BottomGameBarController.prototype, "holdTime", void 0);
      __decorate([ property(cc.Node) ], BottomGameBarController.prototype, "autoBet", void 0);
      __decorate([ property(cc.SpriteFrame) ], BottomGameBarController.prototype, "normalSpin", void 0);
      __decorate([ property(cc.SpriteFrame) ], BottomGameBarController.prototype, "stopAutoSpin", void 0);
      __decorate([ property(cc.SpriteFrame) ], BottomGameBarController.prototype, "stopNormalSpin", void 0);
      __decorate([ property(cc.SpriteFrame) ], BottomGameBarController.prototype, "bottomActive", void 0);
      __decorate([ property(cc.SpriteFrame) ], BottomGameBarController.prototype, "bottomLock", void 0);
      __decorate([ property(cc.Node) ], BottomGameBarController.prototype, "dailyNode", void 0);
      BottomGameBarController = __decorate([ ccclass ], BottomGameBarController);
      return BottomGameBarController;
    }(cc.Component);
    exports.default = BottomGameBarController;
    cc._RF.pop();
  }, {} ],
  BottomHomeBarController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "07d6f5ZTGZNTqjNaetpjylt", "BottomHomeBarController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BottomHomeBarController = function(_super) {
      __extends(BottomHomeBarController, _super);
      function BottomHomeBarController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.nodeWheel = void 0;
        _this.lbDailyTitle = void 0;
        _this.lbDailyTime = void 0;
        _this.lbTitle = void 0;
        _this.lbTime = void 0;
        _this.key = [];
        return _this;
      }
      BottomHomeBarController.prototype.onLoad = function() {
        this.countTimeWheelBonus();
        this.registerStore();
      };
      BottomHomeBarController.prototype.countTimeWheelBonus = function() {
        setInterval(function() {
          if (!this.lbDailyTime || !this.lbDailyTime.node || !this.lbTime) return;
          this.lbDailyTime.string = util.string.formatTime(util.game.timeToNextday());
          this.lbTime.string = util.string.formatTime(util.game.timeToNextday());
        }.bind(this), 1e3);
      };
      BottomHomeBarController.prototype.registerStore = function() {
        var keyBonus = store.register(store.key.DAILYBONUS, function(data) {
          if (!data || !data.freeWheel) return;
          var isTaken = data.freeWheel.isTaken;
          if (isTaken) {
            this.lbDailyTime.node.active = true;
            this.lbDailyTitle.string = "DAILY BONUS";
            this.lbDailyTitle.node.y = 18;
            this.lbDailyTitle.getComponent(cc.Animation).stop();
          } else {
            this.lbDailyTime.node.active = false;
            this.lbDailyTitle.string = "SPIN AND WIN";
            this.lbDailyTitle.node.y = 8;
            this.lbDailyTitle.getComponent(cc.Animation).play();
          }
        }.bind(this));
        this.key.push(keyBonus);
        var keyQuest = store.register(store.key.DAILYQUEST, function(data) {
          if (!data) return;
          this.lbTitle.string = data.completedQuests.length + "/" + data.missions.length;
        }.bind(this));
        this.key.push(keyQuest);
      };
      BottomHomeBarController.prototype.onClickWheelBonus = function() {
        game.log("BottomHomeBarController", "onClickWheelBonus");
        if (game.data.dailyBonus.freeWheel.isTaken) controller.ui.openWheelBonus(define.type.WHEEL_BONUS.GOLD); else {
          var _a = game.data.dailyBonus.freeWheel, array = _a.array, result = _a.result;
          controller.ui.openWheelBonus(define.type.WHEEL_BONUS.SILVER, {
            result: result,
            items: array
          });
        }
      };
      BottomHomeBarController.prototype.onClickDailyQuest = function() {
        game.log("BottomHomeBarController", "onClickDailyQuest");
        controller.ui.showPopup("daily");
      };
      BottomHomeBarController.prototype.onClickDailyGift = function() {
        game.log("BottomHomeBarController", "onClickDailyGift");
      };
      BottomHomeBarController.prototype.onDestroy = function() {
        this.key.forEach(function(o) {
          return store.unRegister(o);
        });
      };
      __decorate([ property(cc.Node) ], BottomHomeBarController.prototype, "nodeWheel", void 0);
      __decorate([ property(cc.Label) ], BottomHomeBarController.prototype, "lbDailyTitle", void 0);
      __decorate([ property(cc.Label) ], BottomHomeBarController.prototype, "lbDailyTime", void 0);
      __decorate([ property(cc.Label) ], BottomHomeBarController.prototype, "lbTitle", void 0);
      __decorate([ property(cc.Label) ], BottomHomeBarController.prototype, "lbTime", void 0);
      BottomHomeBarController = __decorate([ ccclass ], BottomHomeBarController);
      return BottomHomeBarController;
    }(cc.Component);
    exports.default = BottomHomeBarController;
    cc._RF.pop();
  }, {} ],
  CoinAnimation: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d54917s8iZLHKZg3jb3DkMU", "CoinAnimation");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var CoinAnimation = function(_super) {
      __extends(CoinAnimation, _super);
      function CoinAnimation() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.coin = [];
        return _this;
      }
      CoinAnimation.prototype.play = function() {
        var _this = this;
        return new Promise(function(res, rej) {
          _this.coin.forEach(function(o) {
            o && o.resetSystem();
          });
          setTimeout(function() {
            res();
          }, 3800);
        });
      };
      __decorate([ property({
        type: [ cc.ParticleSystem ]
      }) ], CoinAnimation.prototype, "coin", void 0);
      CoinAnimation = __decorate([ ccclass ], CoinAnimation);
      return CoinAnimation;
    }(cc.Component);
    exports.default = CoinAnimation;
    cc._RF.pop();
  }, {} ],
  CoinLabel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "38713mHWmRFML2UHJo56Vtc", "CoinLabel");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel = function() {
      function CoinLabel(coinLabel, lerpRatio, prefix, subfix, fps) {
        this.coinLabel = null;
        this.lerpRatio = 10;
        this.userBalance = 0;
        this._tempUserBalance = 0;
        this.isUpdattingBalance = false;
        this.prefix = "";
        this.subfix = "";
        this.fps = 30;
        this.coinLabel = coinLabel;
        lerpRatio && (this.lerpRatio = lerpRatio);
        prefix && (this.prefix = prefix);
        subfix && (this.subfix = subfix);
        fps && (this.fps = fps);
      }
      CoinLabel.prototype.updateUserBalance = function(num, option) {
        return __awaiter(this, void 0, void 0, function() {
          var delta;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!option) return [ 3, 3 ];
              if (!option.delayTime) return [ 3, 2 ];
              return [ 4, util.game.delay(option.delayTime, this.coinLabel.node).catch(function(e) {}) ];

             case 1:
              _a.sent();
              _a.label = 2;

             case 2:
              option.lerpRatio && (this.lerpRatio = option.lerpRatio);
              option.prefix && (this.prefix = option.prefix);
              option.subfix && (this.subfix = option.subfix);
              _a.label = 3;

             case 3:
              if ("number" === typeof num) {
                this._tempUserBalance = this.userBalance;
                this.userBalance = num;
                this.isUpdattingBalance = true;
              }
              delta = this.userBalance - this._tempUserBalance;
              this._tempUserBalance = delta * this.lerpRatio / this.fps + this._tempUserBalance;
              if (this.coinLabel && this.coinLabel.node) {
                this.coinLabel.string = this.prefix + util.string.formatMoney(this._tempUserBalance) + this.subfix;
                if (Math.abs(this.userBalance - this._tempUserBalance) < 1) {
                  this.coinLabel.string = this.prefix + util.string.formatMoney(this.userBalance) + this.subfix;
                  return [ 2, true ];
                }
              }
              setTimeout(function() {
                if (!_this.coinLabel.node || !_this.coinLabel.node.isValid) return;
                _this.updateUserBalance();
              }, 1e3 / this.fps);
              return [ 2 ];
            }
          });
        });
      };
      return CoinLabel;
    }();
    exports.default = CoinLabel;
    cc._RF.pop();
  }, {} ],
  DailyRewardAnimation: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "59c48nfPKpAVIUyy5sSA0hz", "DailyRewardAnimation");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var DailyRewardAnimation = function(_super) {
      __extends(DailyRewardAnimation, _super);
      function DailyRewardAnimation() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.bg = void 0;
        _this.nodeTitle = void 0;
        _this.lbCoin = void 0;
        _this.icGift = void 0;
        _this.icMark = void 0;
        _this.data = void 0;
        _this.coinController = void 0;
        _this.effectLayout = void 0;
        return _this;
      }
      DailyRewardAnimation.prototype.init = function(data) {
        this.data = data;
      };
      DailyRewardAnimation.prototype.play = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.coinController = new CoinLabel_1.default(this.lbCoin);
              this.effectLayout = this.getComponent("EffectLayout");
              this.icMark.opacity = 0;
              this.lbCoin.node.opacity = 0;
              this.bg.opacity = 0;
              return [ 4, this.onOpen() ];

             case 1:
              _a.sent();
              return [ 4, this.onClose() ];

             case 2:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      DailyRewardAnimation.prototype.onOpen = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, Promise.all([ new Promise(function(res, rej) {
                _this.effectLayout.onOpen().then(function() {
                  res();
                });
              }), new Promise(function(res, rej) {
                _this.bg ? _this.bg.runAction(effect.bouceIn({
                  time: .5,
                  callback: function() {
                    res();
                  }
                })) : res();
              }) ]) ];

             case 1:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                return __awaiter(_this, void 0, void 0, function() {
                  var _this = this;
                  return __generator(this, function(_a) {
                    switch (_a.label) {
                     case 0:
                      if (!(this.coinController && this.lbCoin)) return [ 3, 2 ];
                      return [ 4, Promise.all([ new Promise(function(res, rej) {
                        _this.coinController.updateUserBalance(_this.data.coin, {
                          subfix: " Coins"
                        }).then(function() {
                          res();
                        });
                      }), new Promise(function(res, rej) {
                        _this.lbCoin.node.runAction(effect.bouceIn({
                          callback: function() {
                            res();
                          }
                        }));
                      }) ]) ];

                     case 1:
                      _a.sent();
                      _a.label = 2;

                     case 2:
                      res();
                      return [ 2 ];
                    }
                  });
                });
              }) ];

             case 2:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this.node.runAction(effect.delay({
                  time: 1.5,
                  callback: function() {
                    res();
                  }
                }));
              }) ];

             case 3:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                var stamp = effect.stamp({
                  scale: 4,
                  rotate: false
                });
                _this.icMark && _this.icMark.runAction(stamp);
                var springy = cc.sequence(cc.delayTime(.9 * stamp.getDuration()), effect.springy({
                  callback: function() {
                    res();
                  }
                }));
                _this.bg ? _this.bg.runAction(springy) : res();
              }) ];

             case 4:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this.node.runAction(effect.delay({
                  time: 2,
                  callback: function() {
                    res();
                  }
                }));
              }) ];

             case 5:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      DailyRewardAnimation.prototype.onClose = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, new Promise(function(res, rej) {
                _this.bg.runAction(effect.bouceOut({
                  callback: function() {
                    res();
                  }
                }));
              }) ];

             case 1:
              _a.sent();
              if (!this.effectLayout) return [ 3, 3 ];
              return [ 4, this.effectLayout.onClose() ];

             case 2:
              _a.sent();
              _a.label = 3;

             case 3:
              this.node && this.onRelease();
              return [ 2 ];
            }
          });
        });
      };
      DailyRewardAnimation.prototype.onRelease = function() {
        this.effectLayout.onRelease();
      };
      __decorate([ property(cc.Node) ], DailyRewardAnimation.prototype, "bg", void 0);
      __decorate([ property(cc.Node) ], DailyRewardAnimation.prototype, "nodeTitle", void 0);
      __decorate([ property(cc.Label) ], DailyRewardAnimation.prototype, "lbCoin", void 0);
      __decorate([ property(cc.Node) ], DailyRewardAnimation.prototype, "icGift", void 0);
      __decorate([ property(cc.Node) ], DailyRewardAnimation.prototype, "icMark", void 0);
      DailyRewardAnimation = __decorate([ ccclass ], DailyRewardAnimation);
      return DailyRewardAnimation;
    }(cc.Component);
    exports.default = DailyRewardAnimation;
    cc._RF.pop();
  }, {
    "../Components/CoinLabel": "CoinLabel"
  } ],
  DefineColor: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "23ce2zcWh1E2rVuEE6tWton", "DefineColor");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Green = {
      r: 137,
      g: 239,
      b: 149,
      a: 255
    };
    exports.Yellow = {
      r: 219,
      g: 176,
      b: 23,
      a: 255
    };
    exports.Orange = {
      r: 255,
      g: 192,
      b: 37,
      a: 255
    };
    exports.Red = {
      r: 188,
      g: 12,
      b: 22,
      a: 255
    };
    exports.Blue = {
      r: 6,
      g: 154,
      b: 220,
      a: 255
    };
    exports.Violet = {
      r: 147,
      g: 76,
      b: 147,
      a: 255
    };
    cc._RF.pop();
  }, {} ],
  DefineInterface: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ab72a0pQsxG05X00Uj6BcTR", "DefineInterface");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  DefineKey: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3c8d9kaaFNEJ4e05E2NMq5m", "DefineKey");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CONFIG_SOUND = "CONFIG_SOUND";
    exports.CONFIG_MUSIC = "CONFIG_MUSIC";
    exports.local = {
      LOGIN_DATA: "LOGIN_DATA_IP",
      DEVICE_ID: "DEVICE_ID",
      PLATFORM_INIT: "PLATFORM_INIT"
    };
    exports.store = {
      LOGIN_DONE: "LOGIN_DONE",
      UPDATE_USER_AVATAR: "UPDATE_USER_AVATAR",
      UPDATE_USER_BALANCE: "UPDATE_USER_BALANCE",
      UPDATE_USER_LEVEL: "UPDATE_USER_LEVEL",
      UPDATE_SHOP_DATA: "UPDATE_SHOP_DATA",
      UPDATE_MEGAWHEEL_DATA: "UPDATE_MEGAWHEEL_DATA",
      DAILYQUEST: "DAILY_QUEST",
      DAILYBONUS: "DAILYBONUS",
      WEEKLY_ACCUMILATION: "WEEKLY_ACCUMILATION"
    };
    exports.api = {
      REGIS: "regisClient",
      SMINFO: "sminfo",
      SLOT_SPIN: "slotspin",
      LEVEL_UP: "levelUp",
      BUY_COIN: "buycoin",
      SLOT_GET_BONUS: "slotgetbonus",
      SLOT_BONUS_RESULT: "slotbonus",
      SLOT_FREE_REEL_GAME: "spinFreeReelGameWheel",
      DAILYQUEST_REWARD: "getDailyQuestRewards",
      DAILYQUEST_INFO: "dailyquestinfo",
      WEEKLY_ACCUMILATION_INFO: "getWeeklyAccumilationInfo",
      WEEKLY_ACCUMILATION_REWARD: "getWeeklyAccumilationRewards",
      BUY_SHOP_ITEM: "buyShopItem",
      BUY_MEGA_WHEEL: "buyMegaWheel",
      GET_MEGA_WHEEL_REWARD: "getMegaWheelReward",
      GET_DAILY_BONUS_REWARD: "getDailyBonusReward",
      GET_SHOP_INFO: "getShopInfo",
      BUY_DEAL_SHOP: "buyDealShop"
    };
    exports.iap = {
      android: {
        item1: {
          id: "org.cocos.slotpro.shop.1",
          name: "item1",
          test: "item1"
        },
        item2: {
          id: "org.cocos.slotpro.shop.2",
          name: "item2",
          test: {
            receiptCipheredPayload: "dc3TGyGHPUFOybmNe2SZjZpvvkGo+HA55W7JAHQskC1x413YbMfsSsuQcqVn3y5tSMSQNHHvXBzB2HKBjLQmcD4oKPTi5+uxQtrjcVQ4VlzoXfrhuLnILBsUSxG/+h8PIbcmdl+zxncrsyMxOcT338+kcQDXhu9zsYwE8LZBHLBqh+9dOVWAAppS7sP2tsQqvYLDr3YXftBuAFrhFfNpX6lj5NaNLihlvlKybnN+hocAPmvuo4WmTp8ctxrG/I5f/TuMVJMkygegSLnbsrD6VnU1cPIl/W0emodxV7XkNA/vjxGnDNaYJIrRpb2Zff7GS92ZIRO5FtEe0omgWHM3Xg==",
            receipt: '{"orderId":"GPA.3309-2982-4662-75240","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.2","purchaseTime":1565962353107,"purchaseState":0,"purchaseToken":"kbfmbdjnjomipffjgpfbkbbi.AO-J1OwLkWhi4xiddtlL3YVT4Ixw35jnxkzQ0a-oPNbxONJsqvtCdWmBxVM8VTTm4F_UrZxYtdwXzmN6Wf6mSKbtKc8WdpMfJLPJrTZcZb7IC0543DHaykv6lxucA-hqE-a8wbNvA9sG"}',
            currencyCode: "VND",
            transactionID: "GPA.3309-2982-4662-75240",
            priceValue: 23e3,
            price: "23.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.2",
            name: "item2"
          }
        },
        item3: {
          id: "org.cocos.slotpro.shop.3",
          name: "item3",
          test: {
            receiptCipheredPayload: "HU4sA2376TuMAk8kYpd68/eesfTJXtt7yOxmPDf54988zB0IJLD+37PFcGA1NleeWY1U1W+ZYcxmfZ0Wy1D3EMQxcNMzZaNIZMFdONhxLslG3WhLvp2BRNFUUV+1v0g5F0AToedBHV3IXIx1mJY1/hI3RFST4xwHLfztjed1j/qFH8zso3RqjT2FGPfmN4X6VgZPqkdEILvUB+bLftgAjxPWZqg4w4mublFz0ayDirXxB+SVBv2KckQ99PJoMgyfoowAy/H50G4bI0o23/H4T68d9gntpsLjIm/DZzF8mrLU+yQkq0aFeV+N1BzS6GyCc9w2r8SAnxIXZtKUU/HeiQ==",
            receipt: '{"orderId":"GPA.3391-9127-1603-74381","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.3","purchaseTime":1565962284557,"purchaseState":0,"purchaseToken":"pkigamijfljbbnimclkimhca.AO-J1OzHF-XYwDV5V02kYXvkrJh5DN-KvN2C8KDcLvNVxZH2TtG0SqX1gDe_hjjw2F5zX2-c-wDQhjYyTNHHYm6lGuifaC2QwZoOwoff5zAxf3VKAe-Q4g0AVhAfwzuoiofZ1tHuItIx"}',
            currencyCode: "VND",
            transactionID: "GPA.3391-9127-1603-74381",
            priceValue: 46e3,
            price: "46.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.3",
            name: "item3"
          }
        },
        item4: {
          id: "org.cocos.slotpro.shop.4",
          name: "item4",
          test: {
            receiptCipheredPayload: "IH4vO25y1e5lbKIanA9Tdtxq0FHASjqiAxq02a5LgtNL4NsV8cQnsGCkkRF3SoE5y2jC/HHGJpcgJ2/4QlnKcdnI+ExxqnLoHYQXZqq6vV209VJd9Er5kpdm9hRhosO3sdpCX/clVDpboKB/SoqXizP0ouUWOT2Fd0fpyObbEN1Kv8K1YnTkYVavv5+s8wlsaT4hwuw5un+LtweJk3qf7bKa5H7sZz8tGDpDzG1+f6JHe6cISLUE1JMer3Dd/MFidb4uhkq3f/C87RvtHDmiQ1J5lgrTi6PFdLYgv9Dn3z2v7bYwifp/ZMJgw9RrUNiictOo7P4AvT/JoSVzedTb1g==",
            receipt: '{"orderId":"GPA.3328-3045-4691-76797","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.4","purchaseTime":1565962489753,"purchaseState":0,"purchaseToken":"bedegoamhoccapkemcagebjg.AO-J1OybTUfGb59iBjj920rrEUYF4eXZS9l4olkvFIB_HY6mG1JiQWmvo6HxSCwwbx7TmZPXhV5aVbI3XJziLtjOLld0_-LofUl3UHxjpwZ8v6jBTlJMse2aTG3dr--CwHsSfn99hSmz"}',
            currencyCode: "VND",
            transactionID: "GPA.3328-3045-4691-76797",
            priceValue: 115e3,
            price: "115.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.4",
            name: "item4"
          }
        },
        item5: {
          id: "org.cocos.slotpro.shop.5",
          name: "item5",
          test: {
            receiptCipheredPayload: "AXiRwZY/xP2URFvaeI5FrhnzPIt5RxYrEHI3fhp8MWmyHCv40/Rm34umLUtbgrREv+vC4XXB6sioFcdi71M/p9pZJGDBBcDo3p1MqIrZOorldLUviAgAZOqlIJ/iadrTDiqtAwPafFqaiOgMply0gLmkH4A1YvsCF3w5M8V2OwMe+okmXduVECU5600JTxm1HVe+LcnQu4bY3CQxC4kOgRbWKSQ2WDCtYZ3yaTgdqNa8mE5Q4lcfosPq/+ULqcAZzre4SRA7OAHI7lEj2u8/llxkZg7BRtm2sZG+GPJWXl8vgyOddKO8/VmUWSjWk56cdfYEUQnzr8g0EK0QIHUUnw==",
            receipt: '{"orderId":"GPA.3331-9312-3410-01013","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.5","purchaseTime":1565962450502,"purchaseState":0,"purchaseToken":"dbmlajfmlhlfekjlmegkdflg.AO-J1OzrrqMAMT3C7ZtIbF6P2CuxG9bFRTCHZ_bq03TheQkaBAWw1p4l4f8P1J49Zg2EDQdPsQbfKxcaa5L2wgFsugwfAbSA9__hwNQQz7bKspaymOsJMW2hGwk3Cyr2NssFAJdwCj1-"}',
            currencyCode: "VND",
            transactionID: "GPA.3331-9312-3410-01013",
            priceValue: 23e4,
            price: "230.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.5",
            name: "item5"
          }
        },
        item6: {
          id: "org.cocos.slotpro.shop.6",
          name: "item6",
          test: {
            receiptCipheredPayload: "DqPDJo/7Z6CSchM2cX3WfJlO+hj7avGWDG7zc4BycjL32Wl1heqaAnU/zgBZRoJX8k45USBCmatzCrok8sKiY+n/tX3AJ8CkOjEYDy8c1C67c69Gad6+Pe3n3zvmn+EL8fZAxctg0zQadgOveY47itVkh4aku8ASx1GkVBq5frvfFbbwfBKEos5bMlX3tJTQr08jBKvMXOA8CKJfln06pfLj9bzHoVnqAZNbYArclpPLevmA9HUyL1FXWcWYu7jYp/KmUK7iMUSgnX+5qUooymVHKwKfrZE8MSbsvppZxDul2bWmVetkq9699dqlSUQhX/wbSs1sp3FjxstPURIUaw==",
            receipt: '{"orderId":"GPA.3358-4575-3419-47067","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.6","purchaseTime":1565962516465,"purchaseState":0,"purchaseToken":"jejbeamhcifeckfdhohcgfij.AO-J1OzLCw_utrOMgNmnZM_2hqfHYuwTS51naG6lAdWj0p9WZ4NAGQ3c9xPGYA55_dpzrlFmB8ezeRSNkzAFy35uVV7fvn_mfNb0OAOCPV8sgvyH2ugNyFKNgIQx3NU0W8KcFe8I9HVd"}',
            currencyCode: "VND",
            transactionID: "GPA.3358-4575-3419-47067",
            priceValue: 345e3,
            price: "345.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.6",
            name: "item6"
          }
        }
      },
      ios: {
        item1: {
          id: "org.cocos.slotpro.shop.1",
          name: "item1",
          test: "item1"
        },
        item2: {
          id: "org.cocos.slotpro.shop.2",
          name: "item2",
          test: {
            receiptCipheredPayload: "dc3TGyGHPUFOybmNe2SZjZpvvkGo+HA55W7JAHQskC1x413YbMfsSsuQcqVn3y5tSMSQNHHvXBzB2HKBjLQmcD4oKPTi5+uxQtrjcVQ4VlzoXfrhuLnILBsUSxG/+h8PIbcmdl+zxncrsyMxOcT338+kcQDXhu9zsYwE8LZBHLBqh+9dOVWAAppS7sP2tsQqvYLDr3YXftBuAFrhFfNpX6lj5NaNLihlvlKybnN+hocAPmvuo4WmTp8ctxrG/I5f/TuMVJMkygegSLnbsrD6VnU1cPIl/W0emodxV7XkNA/vjxGnDNaYJIrRpb2Zff7GS92ZIRO5FtEe0omgWHM3Xg==",
            receipt: '{"orderId":"GPA.3309-2982-4662-75240","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.2","purchaseTime":1565962353107,"purchaseState":0,"purchaseToken":"kbfmbdjnjomipffjgpfbkbbi.AO-J1OwLkWhi4xiddtlL3YVT4Ixw35jnxkzQ0a-oPNbxONJsqvtCdWmBxVM8VTTm4F_UrZxYtdwXzmN6Wf6mSKbtKc8WdpMfJLPJrTZcZb7IC0543DHaykv6lxucA-hqE-a8wbNvA9sG"}',
            currencyCode: "VND",
            transactionID: "GPA.3309-2982-4662-75240",
            priceValue: 23e3,
            price: "23.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.2",
            name: "item2"
          }
        },
        item3: {
          id: "org.cocos.slotpro.shop.3",
          name: "item3",
          test: {
            receiptCipheredPayload: "HU4sA2376TuMAk8kYpd68/eesfTJXtt7yOxmPDf54988zB0IJLD+37PFcGA1NleeWY1U1W+ZYcxmfZ0Wy1D3EMQxcNMzZaNIZMFdONhxLslG3WhLvp2BRNFUUV+1v0g5F0AToedBHV3IXIx1mJY1/hI3RFST4xwHLfztjed1j/qFH8zso3RqjT2FGPfmN4X6VgZPqkdEILvUB+bLftgAjxPWZqg4w4mublFz0ayDirXxB+SVBv2KckQ99PJoMgyfoowAy/H50G4bI0o23/H4T68d9gntpsLjIm/DZzF8mrLU+yQkq0aFeV+N1BzS6GyCc9w2r8SAnxIXZtKUU/HeiQ==",
            receipt: '{"orderId":"GPA.3391-9127-1603-74381","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.3","purchaseTime":1565962284557,"purchaseState":0,"purchaseToken":"pkigamijfljbbnimclkimhca.AO-J1OzHF-XYwDV5V02kYXvkrJh5DN-KvN2C8KDcLvNVxZH2TtG0SqX1gDe_hjjw2F5zX2-c-wDQhjYyTNHHYm6lGuifaC2QwZoOwoff5zAxf3VKAe-Q4g0AVhAfwzuoiofZ1tHuItIx"}',
            currencyCode: "VND",
            transactionID: "GPA.3391-9127-1603-74381",
            priceValue: 46e3,
            price: "46.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.3",
            name: "item3"
          }
        },
        item4: {
          id: "org.cocos.slotpro.shop.4",
          name: "item4",
          test: {
            receiptCipheredPayload: "IH4vO25y1e5lbKIanA9Tdtxq0FHASjqiAxq02a5LgtNL4NsV8cQnsGCkkRF3SoE5y2jC/HHGJpcgJ2/4QlnKcdnI+ExxqnLoHYQXZqq6vV209VJd9Er5kpdm9hRhosO3sdpCX/clVDpboKB/SoqXizP0ouUWOT2Fd0fpyObbEN1Kv8K1YnTkYVavv5+s8wlsaT4hwuw5un+LtweJk3qf7bKa5H7sZz8tGDpDzG1+f6JHe6cISLUE1JMer3Dd/MFidb4uhkq3f/C87RvtHDmiQ1J5lgrTi6PFdLYgv9Dn3z2v7bYwifp/ZMJgw9RrUNiictOo7P4AvT/JoSVzedTb1g==",
            receipt: '{"orderId":"GPA.3328-3045-4691-76797","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.4","purchaseTime":1565962489753,"purchaseState":0,"purchaseToken":"bedegoamhoccapkemcagebjg.AO-J1OybTUfGb59iBjj920rrEUYF4eXZS9l4olkvFIB_HY6mG1JiQWmvo6HxSCwwbx7TmZPXhV5aVbI3XJziLtjOLld0_-LofUl3UHxjpwZ8v6jBTlJMse2aTG3dr--CwHsSfn99hSmz"}',
            currencyCode: "VND",
            transactionID: "GPA.3328-3045-4691-76797",
            priceValue: 115e3,
            price: "115.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.4",
            name: "item4"
          }
        },
        item5: {
          id: "org.cocos.slotpro.shop.5",
          name: "item5",
          test: {
            receiptCipheredPayload: "AXiRwZY/xP2URFvaeI5FrhnzPIt5RxYrEHI3fhp8MWmyHCv40/Rm34umLUtbgrREv+vC4XXB6sioFcdi71M/p9pZJGDBBcDo3p1MqIrZOorldLUviAgAZOqlIJ/iadrTDiqtAwPafFqaiOgMply0gLmkH4A1YvsCF3w5M8V2OwMe+okmXduVECU5600JTxm1HVe+LcnQu4bY3CQxC4kOgRbWKSQ2WDCtYZ3yaTgdqNa8mE5Q4lcfosPq/+ULqcAZzre4SRA7OAHI7lEj2u8/llxkZg7BRtm2sZG+GPJWXl8vgyOddKO8/VmUWSjWk56cdfYEUQnzr8g0EK0QIHUUnw==",
            receipt: '{"orderId":"GPA.3331-9312-3410-01013","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.5","purchaseTime":1565962450502,"purchaseState":0,"purchaseToken":"dbmlajfmlhlfekjlmegkdflg.AO-J1OzrrqMAMT3C7ZtIbF6P2CuxG9bFRTCHZ_bq03TheQkaBAWw1p4l4f8P1J49Zg2EDQdPsQbfKxcaa5L2wgFsugwfAbSA9__hwNQQz7bKspaymOsJMW2hGwk3Cyr2NssFAJdwCj1-"}',
            currencyCode: "VND",
            transactionID: "GPA.3331-9312-3410-01013",
            priceValue: 23e4,
            price: "230.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.5",
            name: "item5"
          }
        },
        item6: {
          id: "org.cocos.slotpro.shop.6",
          name: "item6",
          test: {
            receiptCipheredPayload: "DqPDJo/7Z6CSchM2cX3WfJlO+hj7avGWDG7zc4BycjL32Wl1heqaAnU/zgBZRoJX8k45USBCmatzCrok8sKiY+n/tX3AJ8CkOjEYDy8c1C67c69Gad6+Pe3n3zvmn+EL8fZAxctg0zQadgOveY47itVkh4aku8ASx1GkVBq5frvfFbbwfBKEos5bMlX3tJTQr08jBKvMXOA8CKJfln06pfLj9bzHoVnqAZNbYArclpPLevmA9HUyL1FXWcWYu7jYp/KmUK7iMUSgnX+5qUooymVHKwKfrZE8MSbsvppZxDul2bWmVetkq9699dqlSUQhX/wbSs1sp3FjxstPURIUaw==",
            receipt: '{"orderId":"GPA.3358-4575-3419-47067","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.6","purchaseTime":1565962516465,"purchaseState":0,"purchaseToken":"jejbeamhcifeckfdhohcgfij.AO-J1OzLCw_utrOMgNmnZM_2hqfHYuwTS51naG6lAdWj0p9WZ4NAGQ3c9xPGYA55_dpzrlFmB8ezeRSNkzAFy35uVV7fvn_mfNb0OAOCPV8sgvyH2ugNyFKNgIQx3NU0W8KcFe8I9HVd"}',
            currencyCode: "VND",
            transactionID: "GPA.3358-4575-3419-47067",
            priceValue: 345e3,
            price: "345.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.6",
            name: "item6"
          }
        }
      },
      web: {
        item1: {
          id: "org.cocos.slotpro.shop.1",
          name: "item1",
          test: "item1"
        },
        item2: {
          id: "org.cocos.slotpro.shop.2",
          name: "item2",
          test: {
            receiptCipheredPayload: "dc3TGyGHPUFOybmNe2SZjZpvvkGo+HA55W7JAHQskC1x413YbMfsSsuQcqVn3y5tSMSQNHHvXBzB2HKBjLQmcD4oKPTi5+uxQtrjcVQ4VlzoXfrhuLnILBsUSxG/+h8PIbcmdl+zxncrsyMxOcT338+kcQDXhu9zsYwE8LZBHLBqh+9dOVWAAppS7sP2tsQqvYLDr3YXftBuAFrhFfNpX6lj5NaNLihlvlKybnN+hocAPmvuo4WmTp8ctxrG/I5f/TuMVJMkygegSLnbsrD6VnU1cPIl/W0emodxV7XkNA/vjxGnDNaYJIrRpb2Zff7GS92ZIRO5FtEe0omgWHM3Xg==",
            receipt: '{"orderId":"GPA.3309-2982-4662-75240","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.2","purchaseTime":1565962353107,"purchaseState":0,"purchaseToken":"kbfmbdjnjomipffjgpfbkbbi.AO-J1OwLkWhi4xiddtlL3YVT4Ixw35jnxkzQ0a-oPNbxONJsqvtCdWmBxVM8VTTm4F_UrZxYtdwXzmN6Wf6mSKbtKc8WdpMfJLPJrTZcZb7IC0543DHaykv6lxucA-hqE-a8wbNvA9sG"}',
            currencyCode: "VND",
            transactionID: "GPA.3309-2982-4662-75240",
            priceValue: 23e3,
            price: "23.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.2",
            name: "item2"
          }
        },
        item3: {
          id: "org.cocos.slotpro.shop.3",
          name: "item3",
          test: {
            receiptCipheredPayload: "HU4sA2376TuMAk8kYpd68/eesfTJXtt7yOxmPDf54988zB0IJLD+37PFcGA1NleeWY1U1W+ZYcxmfZ0Wy1D3EMQxcNMzZaNIZMFdONhxLslG3WhLvp2BRNFUUV+1v0g5F0AToedBHV3IXIx1mJY1/hI3RFST4xwHLfztjed1j/qFH8zso3RqjT2FGPfmN4X6VgZPqkdEILvUB+bLftgAjxPWZqg4w4mublFz0ayDirXxB+SVBv2KckQ99PJoMgyfoowAy/H50G4bI0o23/H4T68d9gntpsLjIm/DZzF8mrLU+yQkq0aFeV+N1BzS6GyCc9w2r8SAnxIXZtKUU/HeiQ==",
            receipt: '{"orderId":"GPA.3391-9127-1603-74381","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.3","purchaseTime":1565962284557,"purchaseState":0,"purchaseToken":"pkigamijfljbbnimclkimhca.AO-J1OzHF-XYwDV5V02kYXvkrJh5DN-KvN2C8KDcLvNVxZH2TtG0SqX1gDe_hjjw2F5zX2-c-wDQhjYyTNHHYm6lGuifaC2QwZoOwoff5zAxf3VKAe-Q4g0AVhAfwzuoiofZ1tHuItIx"}',
            currencyCode: "VND",
            transactionID: "GPA.3391-9127-1603-74381",
            priceValue: 46e3,
            price: "46.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.3",
            name: "item3"
          }
        },
        item4: {
          id: "org.cocos.slotpro.shop.4",
          name: "item4",
          test: {
            receiptCipheredPayload: "IH4vO25y1e5lbKIanA9Tdtxq0FHASjqiAxq02a5LgtNL4NsV8cQnsGCkkRF3SoE5y2jC/HHGJpcgJ2/4QlnKcdnI+ExxqnLoHYQXZqq6vV209VJd9Er5kpdm9hRhosO3sdpCX/clVDpboKB/SoqXizP0ouUWOT2Fd0fpyObbEN1Kv8K1YnTkYVavv5+s8wlsaT4hwuw5un+LtweJk3qf7bKa5H7sZz8tGDpDzG1+f6JHe6cISLUE1JMer3Dd/MFidb4uhkq3f/C87RvtHDmiQ1J5lgrTi6PFdLYgv9Dn3z2v7bYwifp/ZMJgw9RrUNiictOo7P4AvT/JoSVzedTb1g==",
            receipt: '{"orderId":"GPA.3328-3045-4691-76797","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.4","purchaseTime":1565962489753,"purchaseState":0,"purchaseToken":"bedegoamhoccapkemcagebjg.AO-J1OybTUfGb59iBjj920rrEUYF4eXZS9l4olkvFIB_HY6mG1JiQWmvo6HxSCwwbx7TmZPXhV5aVbI3XJziLtjOLld0_-LofUl3UHxjpwZ8v6jBTlJMse2aTG3dr--CwHsSfn99hSmz"}',
            currencyCode: "VND",
            transactionID: "GPA.3328-3045-4691-76797",
            priceValue: 115e3,
            price: "115.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.4",
            name: "item4"
          }
        },
        item5: {
          id: "org.cocos.slotpro.shop.5",
          name: "item5",
          test: {
            receiptCipheredPayload: "AXiRwZY/xP2URFvaeI5FrhnzPIt5RxYrEHI3fhp8MWmyHCv40/Rm34umLUtbgrREv+vC4XXB6sioFcdi71M/p9pZJGDBBcDo3p1MqIrZOorldLUviAgAZOqlIJ/iadrTDiqtAwPafFqaiOgMply0gLmkH4A1YvsCF3w5M8V2OwMe+okmXduVECU5600JTxm1HVe+LcnQu4bY3CQxC4kOgRbWKSQ2WDCtYZ3yaTgdqNa8mE5Q4lcfosPq/+ULqcAZzre4SRA7OAHI7lEj2u8/llxkZg7BRtm2sZG+GPJWXl8vgyOddKO8/VmUWSjWk56cdfYEUQnzr8g0EK0QIHUUnw==",
            receipt: '{"orderId":"GPA.3331-9312-3410-01013","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.5","purchaseTime":1565962450502,"purchaseState":0,"purchaseToken":"dbmlajfmlhlfekjlmegkdflg.AO-J1OzrrqMAMT3C7ZtIbF6P2CuxG9bFRTCHZ_bq03TheQkaBAWw1p4l4f8P1J49Zg2EDQdPsQbfKxcaa5L2wgFsugwfAbSA9__hwNQQz7bKspaymOsJMW2hGwk3Cyr2NssFAJdwCj1-"}',
            currencyCode: "VND",
            transactionID: "GPA.3331-9312-3410-01013",
            priceValue: 23e4,
            price: "230.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.5",
            name: "item5"
          }
        },
        item6: {
          id: "org.cocos.slotpro.shop.6",
          name: "item6",
          test: {
            receiptCipheredPayload: "DqPDJo/7Z6CSchM2cX3WfJlO+hj7avGWDG7zc4BycjL32Wl1heqaAnU/zgBZRoJX8k45USBCmatzCrok8sKiY+n/tX3AJ8CkOjEYDy8c1C67c69Gad6+Pe3n3zvmn+EL8fZAxctg0zQadgOveY47itVkh4aku8ASx1GkVBq5frvfFbbwfBKEos5bMlX3tJTQr08jBKvMXOA8CKJfln06pfLj9bzHoVnqAZNbYArclpPLevmA9HUyL1FXWcWYu7jYp/KmUK7iMUSgnX+5qUooymVHKwKfrZE8MSbsvppZxDul2bWmVetkq9699dqlSUQhX/wbSs1sp3FjxstPURIUaw==",
            receipt: '{"orderId":"GPA.3358-4575-3419-47067","packageName":"org.cocos2d.SlotPro","productId":"org.cocos.slotpro.shop.6","purchaseTime":1565962516465,"purchaseState":0,"purchaseToken":"jejbeamhcifeckfdhohcgfij.AO-J1OzLCw_utrOMgNmnZM_2hqfHYuwTS51naG6lAdWj0p9WZ4NAGQ3c9xPGYA55_dpzrlFmB8ezeRSNkzAFy35uVV7fvn_mfNb0OAOCPV8sgvyH2ugNyFKNgIQx3NU0W8KcFe8I9HVd"}',
            currencyCode: "VND",
            transactionID: "GPA.3358-4575-3419-47067",
            priceValue: 345e3,
            price: "345.000\xa0\u20ab",
            description: "Amazing Shop",
            title: "Amazing Shop (Amazing Slot)",
            id: "org.cocos.slotpro.shop.6",
            name: "item6"
          }
        }
      }
    };
    exports.track = {
      APP_LAUNCHER: "app_launcher",
      GET_TOKKEN_SUCCESSED: "get_tokken_successed",
      GET_TOKKEN_ERROR: "get_tokken_error",
      LOGIN_SUCCESSED: "login_successed",
      LOGIN_FAILED: "login_failed",
      FACEBOOK_LOGIN_CLICK: "facebook_login_click",
      FACEBOOK_SHARE_CLICK: "facebook_share_click",
      FACEBOOK_SHARE_SUCCESS: "facebook_share_success",
      FACEBOOK_SHARE_FAILED: "facebook_share_failed",
      FACEBOOK_SHARE_CANCELED: "facebook_share_canceled",
      IAP_PURCHASE_CLICK: "iap_purchase_click",
      IAP_PURCHASE_ITEM: "iap_purchase_item",
      IAP_PURCHASE_WHEEL: "iap_purchase_wheel",
      IAP_PURCHASE_DEAL: "iap_purchase_deal",
      IAP_PURCHASE_SUCCESS: "iap_purchase_success",
      IAP_PURCHASE_FAILED: "iap_purchase_failed",
      IAP_PURCHASE_CANCELED: "iap_purchase_canceled",
      IAP_PURCHASE_RESTORED: "iap_purchase_restored",
      IAP_PURCHASE_RESTOR_COMPLETED: "iap_purchase_restor_completed",
      POPUP_POPUPNAME_OPEN: "popup_POPUPNAME_open",
      OPEN_HOME: "open_home",
      OPEN_GAME: "open_game",
      OPEN_WHEEL: "open_wheel",
      OPEN_BONUS: "open_bonus",
      OPEN_SLOT: "open_slot_SMID",
      MULTI_SHOW: "multi_show",
      MULTI_HIDE: "multi_hide",
      MULTI_OPEN_GAME: "multi_open_game",
      MINIMIZE_GAME: "minimize_game",
      BACK_GAME: "back_game",
      SOUND_OFF: "sound_off",
      SOUND_ON: "sound_on",
      MUSIC_OFF: "music_off",
      MUSIC_ON: "music_on",
      RATE_GAME: "rate_game",
      QUEST_COMPLETE: "quest_complete",
      WEEK_COMPLETE: "week_complete",
      SPIN_SLOT: "spin_slot",
      AUTO_SPIN: "auto_spin_NUMSPIN"
    };
    cc._RF.pop();
  }, {} ],
  DefineString: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "86920azjvlF2aegI5lFwsX2", "DefineString");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.URL_STORE_ANDROID = "https://play.google.com/store/apps/details?id=PACKAGE_NAME";
    exports.URL_STORE_IOS = "https://apps.apple.com/vn/app/mots-cookies/id1268958178?l=vi";
    exports.URL_FANPAGE = "https://www.facebook.com/PAGEID/";
    exports.URL_GROUP = "https://www.facebook.com/groups/GROUPID";
    exports.URL_AVT_FACEBOOK = "https://graph.facebook.com/v2.4/%facebookID%/picture?width=200&height=200&redirect=true";
    cc._RF.pop();
  }, {} ],
  DefineType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "32547KClMBKu7TJmMCb7CuI", "DefineType");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineZIndex_1 = require("./DefineZIndex");
    var Device;
    (function(Device) {
      Device[Device["NORMAL"] = 0] = "NORMAL";
      Device[Device["IPAD"] = 1] = "IPAD";
      Device[Device["IPHONEX"] = 2] = "IPHONEX";
    })(Device = exports.Device || (exports.Device = {}));
    var DEVICE_OS;
    (function(DEVICE_OS) {
      DEVICE_OS["IOS_NAVITE"] = "IOS_NAVITE";
      DEVICE_OS["ANDROID_NAVITE"] = "ANDROID_NAVITE";
      DEVICE_OS["WEB_MOBILE"] = "WEB_MOBILE";
      DEVICE_OS["WEB_PC"] = "WEB_PC";
      DEVICE_OS["UNKNOW"] = "UNKNOW";
    })(DEVICE_OS = exports.DEVICE_OS || (exports.DEVICE_OS = {}));
    var LOGIN_TYPE;
    (function(LOGIN_TYPE) {
      LOGIN_TYPE[LOGIN_TYPE["PLAYNOW"] = 0] = "PLAYNOW";
      LOGIN_TYPE[LOGIN_TYPE["FACEBOOK"] = 1] = "FACEBOOK";
    })(LOGIN_TYPE = exports.LOGIN_TYPE || (exports.LOGIN_TYPE = {}));
    var GAME_OS;
    (function(GAME_OS) {
      GAME_OS["IOS_COCOS"] = "iOS_cocos";
      GAME_OS["ANDROID_COCOS"] = "Android_cocos";
      GAME_OS["WEB_COCOS"] = "Web_cocos";
    })(GAME_OS = exports.GAME_OS || (exports.GAME_OS = {}));
    var FACEBOOK_LISTENNER;
    (function(FACEBOOK_LISTENNER) {
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["LOGIN"] = 1] = "LOGIN";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["API"] = 2] = "API";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["SHARED_SUCCESS"] = 3] = "SHARED_SUCCESS";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["SHARED_FAILED"] = 4] = "SHARED_FAILED";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["SHARED_CANCEL"] = 5] = "SHARED_CANCEL";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["PERMISSON"] = 6] = "PERMISSON";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["FETCHFRIENDS"] = 7] = "FETCHFRIENDS";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["REQUESTINVITABLEFRIENDS"] = 8] = "REQUESTINVITABLEFRIENDS";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["INVITEFRIENDSWITHINVITEIDSRESULT"] = 9] = "INVITEFRIENDSWITHINVITEIDSRESULT";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["INVITEFRIENDSRESULT"] = 10] = "INVITEFRIENDSRESULT";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["GETUSERINFO"] = 11] = "GETUSERINFO";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["REQUESTGIFTRESULT"] = 12] = "REQUESTGIFTRESULT";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["SENDGIFTRESULT"] = 13] = "SENDGIFTRESULT";
      FACEBOOK_LISTENNER[FACEBOOK_LISTENNER["FACEBOOK_NOT_INSTALL"] = 14] = "FACEBOOK_NOT_INSTALL";
    })(FACEBOOK_LISTENNER = exports.FACEBOOK_LISTENNER || (exports.FACEBOOK_LISTENNER = {}));
    var ADMOB_LISTENNER;
    (function(ADMOB_LISTENNER) {
      ADMOB_LISTENNER[ADMOB_LISTENNER["DIDRECEIVEAD"] = 1] = "DIDRECEIVEAD";
      ADMOB_LISTENNER[ADMOB_LISTENNER["DIDFAILTORECEIVEADWITHERROR"] = 2] = "DIDFAILTORECEIVEADWITHERROR";
      ADMOB_LISTENNER[ADMOB_LISTENNER["WILLPRESENTSCREEN"] = 3] = "WILLPRESENTSCREEN";
      ADMOB_LISTENNER[ADMOB_LISTENNER["DIDDISMISSSCREEN"] = 4] = "DIDDISMISSSCREEN";
      ADMOB_LISTENNER[ADMOB_LISTENNER["WILLDISMISSSCREEN"] = 5] = "WILLDISMISSSCREEN";
      ADMOB_LISTENNER[ADMOB_LISTENNER["WILLLEAVEAPPLICATION"] = 6] = "WILLLEAVEAPPLICATION";
      ADMOB_LISTENNER[ADMOB_LISTENNER["REWARD"] = 7] = "REWARD";
    })(ADMOB_LISTENNER = exports.ADMOB_LISTENNER || (exports.ADMOB_LISTENNER = {}));
    var SpinButton;
    (function(SpinButton) {
      SpinButton[SpinButton["normal"] = 1] = "normal";
      SpinButton[SpinButton["stopAutoSpin"] = 2] = "stopAutoSpin";
      SpinButton[SpinButton["stopNormalSpin"] = 3] = "stopNormalSpin";
    })(SpinButton = exports.SpinButton || (exports.SpinButton = {}));
    var BottomBar;
    (function(BottomBar) {
      BottomBar[BottomBar["active"] = 1] = "active";
      BottomBar[BottomBar["lock"] = -1] = "lock";
    })(BottomBar = exports.BottomBar || (exports.BottomBar = {}));
    var DIRECTION;
    (function(DIRECTION) {
      DIRECTION["LEFT"] = "LEFT";
      DIRECTION["RIGHT"] = "RIGHT";
      DIRECTION["UP"] = "UP";
      DIRECTION["DOWN"] = "DOWN";
    })(DIRECTION = exports.DIRECTION || (exports.DIRECTION = {}));
    var EFFECT;
    (function(EFFECT) {
      EFFECT[EFFECT["BOUCE_IN"] = 1] = "BOUCE_IN";
      EFFECT[EFFECT["BOUCE_OUT"] = 2] = "BOUCE_OUT";
      EFFECT[EFFECT["MOVE_IN_BY_LEFT"] = 3] = "MOVE_IN_BY_LEFT";
      EFFECT[EFFECT["MOVE_IN_BY_RIGHT"] = 4] = "MOVE_IN_BY_RIGHT";
      EFFECT[EFFECT["MOVE_IN_BY_UP"] = 5] = "MOVE_IN_BY_UP";
      EFFECT[EFFECT["MOVE_IN_BY_DOWN"] = 6] = "MOVE_IN_BY_DOWN";
      EFFECT[EFFECT["MOVE_OUT_BY_LEFT"] = 7] = "MOVE_OUT_BY_LEFT";
      EFFECT[EFFECT["MOVE_OUT_BY_RIGHT"] = 8] = "MOVE_OUT_BY_RIGHT";
      EFFECT[EFFECT["MOVE_OUT_BY_UP"] = 9] = "MOVE_OUT_BY_UP";
      EFFECT[EFFECT["MOVE_OUT_BY_DOWN"] = 10] = "MOVE_OUT_BY_DOWN";
    })(EFFECT = exports.EFFECT || (exports.EFFECT = {}));
    var EFFECT_KIND;
    (function(EFFECT_KIND) {
      EFFECT_KIND[EFFECT_KIND["IN"] = 1] = "IN";
      EFFECT_KIND[EFFECT_KIND["OUT"] = 2] = "OUT";
    })(EFFECT_KIND = exports.EFFECT_KIND || (exports.EFFECT_KIND = {}));
    var EFFECT_TYPE;
    (function(EFFECT_TYPE) {
      EFFECT_TYPE[EFFECT_TYPE["BOUCE"] = 1] = "BOUCE";
      EFFECT_TYPE[EFFECT_TYPE["MOVE_BY_LEFT"] = 2] = "MOVE_BY_LEFT";
      EFFECT_TYPE[EFFECT_TYPE["MOVE_BY_RIGHT"] = 3] = "MOVE_BY_RIGHT";
      EFFECT_TYPE[EFFECT_TYPE["MOVE_BY_UP"] = 4] = "MOVE_BY_UP";
      EFFECT_TYPE[EFFECT_TYPE["MOVE_BY_DOWN"] = 5] = "MOVE_BY_DOWN";
    })(EFFECT_TYPE = exports.EFFECT_TYPE || (exports.EFFECT_TYPE = {}));
    var POPUP_TYPE;
    (function(POPUP_TYPE) {
      POPUP_TYPE[POPUP_TYPE["NONE"] = 0] = "NONE";
      POPUP_TYPE[POPUP_TYPE["NORMAL"] = DefineZIndex_1.POPUP] = "NORMAL";
      POPUP_TYPE[POPUP_TYPE["HIGH"] = DefineZIndex_1.HIGH_POPUP] = "HIGH";
    })(POPUP_TYPE = exports.POPUP_TYPE || (exports.POPUP_TYPE = {}));
    var DIALOG_TYPE;
    (function(DIALOG_TYPE) {
      DIALOG_TYPE[DIALOG_TYPE["NONE"] = 0] = "NONE";
      DIALOG_TYPE[DIALOG_TYPE["NORMAL"] = DefineZIndex_1.DIALOG] = "NORMAL";
      DIALOG_TYPE[DIALOG_TYPE["HIGH"] = DefineZIndex_1.HIGH_DIALOG] = "HIGH";
      DIALOG_TYPE[DIALOG_TYPE["FORCE"] = DefineZIndex_1.FORCE_DIALOG] = "FORCE";
    })(DIALOG_TYPE = exports.DIALOG_TYPE || (exports.DIALOG_TYPE = {}));
    var WIN_TYPE;
    (function(WIN_TYPE) {
      WIN_TYPE[WIN_TYPE["NULL"] = 0] = "NULL";
      WIN_TYPE[WIN_TYPE["NORMAL"] = 1] = "NORMAL";
      WIN_TYPE[WIN_TYPE["BIGWIN"] = 2] = "BIGWIN";
      WIN_TYPE[WIN_TYPE["MEGAWIN"] = 3] = "MEGAWIN";
    })(WIN_TYPE = exports.WIN_TYPE || (exports.WIN_TYPE = {}));
    var VIEW;
    (function(VIEW) {
      VIEW[VIEW["HOME"] = 0] = "HOME";
      VIEW[VIEW["GAME"] = 1] = "GAME";
    })(VIEW = exports.VIEW || (exports.VIEW = {}));
    var WHEEL_BONUS;
    (function(WHEEL_BONUS) {
      WHEEL_BONUS[WHEEL_BONUS["GOLD"] = 0] = "GOLD";
      WHEEL_BONUS[WHEEL_BONUS["SILVER"] = 1] = "SILVER";
    })(WHEEL_BONUS = exports.WHEEL_BONUS || (exports.WHEEL_BONUS = {}));
    var EDailyBonus;
    (function(EDailyBonus) {
      EDailyBonus[EDailyBonus["LUCY"] = 1] = "LUCY";
      EDailyBonus[EDailyBonus["LEVEL"] = 2] = "LEVEL";
      EDailyBonus[EDailyBonus["FREE_WHEEL"] = 3] = "FREE_WHEEL";
    })(EDailyBonus = exports.EDailyBonus || (exports.EDailyBonus = {}));
    var MASK_TYPE;
    (function(MASK_TYPE) {
      MASK_TYPE[MASK_TYPE["NONE"] = 0] = "NONE";
      MASK_TYPE[MASK_TYPE["ENABLE"] = 1] = "ENABLE";
    })(MASK_TYPE = exports.MASK_TYPE || (exports.MASK_TYPE = {}));
    var COIN_TYPE;
    (function(COIN_TYPE) {
      COIN_TYPE[COIN_TYPE["NONE"] = 0] = "NONE";
      COIN_TYPE[COIN_TYPE["ACTIVE"] = 1] = "ACTIVE";
      COIN_TYPE[COIN_TYPE["PLAY_ON_LOAD"] = 2] = "PLAY_ON_LOAD";
      COIN_TYPE[COIN_TYPE["PLAY_AFTER_ANIMATION"] = 3] = "PLAY_AFTER_ANIMATION";
    })(COIN_TYPE = exports.COIN_TYPE || (exports.COIN_TYPE = {}));
    var CLASS_THEME;
    (function(CLASS_THEME) {
      CLASS_THEME[CLASS_THEME["PRIMARY"] = 0] = "PRIMARY";
      CLASS_THEME[CLASS_THEME["SECONDARY"] = 1] = "SECONDARY";
      CLASS_THEME[CLASS_THEME["SUCCESS"] = 2] = "SUCCESS";
      CLASS_THEME[CLASS_THEME["DANGER"] = 3] = "DANGER";
      CLASS_THEME[CLASS_THEME["WARNING"] = 4] = "WARNING";
      CLASS_THEME[CLASS_THEME["INFO"] = 5] = "INFO";
      CLASS_THEME[CLASS_THEME["LIGHT"] = 6] = "LIGHT";
      CLASS_THEME[CLASS_THEME["DARK"] = 7] = "DARK";
    })(CLASS_THEME = exports.CLASS_THEME || (exports.CLASS_THEME = {}));
    var SIZE;
    (function(SIZE) {
      SIZE[SIZE["NONE"] = 0] = "NONE";
      SIZE[SIZE["TINY"] = 1] = "TINY";
      SIZE[SIZE["NORMAL"] = 2] = "NORMAL";
      SIZE[SIZE["LANGEST"] = 3] = "LANGEST";
    })(SIZE = exports.SIZE || (exports.SIZE = {}));
    var ESHOP;
    (function(ESHOP) {
      ESHOP["GENERAL_SHOP"] = "GENERAL_SHOP";
      ESHOP["MEGA_WHEEL"] = "MEGA_WHEEL";
      ESHOP["DEAL_SHOP"] = "DEAL_SHOP";
    })(ESHOP = exports.ESHOP || (exports.ESHOP = {}));
    cc._RF.pop();
  }, {
    "./DefineZIndex": "DefineZIndex"
  } ],
  DefineZIndex: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47bf7Wr5uBLNIx61CJzDgpW", "DefineZIndex");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.HOME = 1;
    exports.GAME = 2;
    exports.MINIGAME = 3;
    exports.POPUP = 4;
    exports.MULTI = 5;
    exports.BAR = 6;
    exports.HIGH_POPUP = 7;
    exports.DIALOG = 8;
    exports.HIGH_DIALOG = 9;
    exports.EFFECT = 10;
    exports.MODEL = 12;
    exports.FORCE_DIALOG = 13;
    exports.SHORT_LOADING = 14;
    cc._RF.pop();
  }, {} ],
  Dialog: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3e79fLmWapEfp6KcYzgMANs", "Dialog");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var BasePopup_1 = require("../BasePopup");
    var DefineType_1 = require("../Define/DefineType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ButtonResource = function() {
      function ButtonResource() {
        this.type = DefineType_1.CLASS_THEME.SUCCESS;
        this.resource = void 0;
      }
      __decorate([ property({
        type: cc.Enum(DefineType_1.CLASS_THEME)
      }) ], ButtonResource.prototype, "type", void 0);
      __decorate([ property({
        type: cc.SpriteFrame
      }) ], ButtonResource.prototype, "resource", void 0);
      ButtonResource = __decorate([ ccclass("ButtonResource") ], ButtonResource);
      return ButtonResource;
    }();
    exports.ButtonResource = ButtonResource;
    var DialogItem = function() {
      function DialogItem() {
        this.node = void 0;
        this.message = void 0;
        this.editbox = void 0;
        this.button = void 0;
        this.layButton = void 0;
      }
      __decorate([ property({
        type: cc.Node
      }) ], DialogItem.prototype, "node", void 0);
      __decorate([ property({
        type: cc.Node
      }) ], DialogItem.prototype, "message", void 0);
      __decorate([ property({
        type: cc.Node
      }) ], DialogItem.prototype, "editbox", void 0);
      __decorate([ property({
        type: cc.Node
      }) ], DialogItem.prototype, "button", void 0);
      __decorate([ property({
        type: cc.Node
      }) ], DialogItem.prototype, "layButton", void 0);
      DialogItem = __decorate([ ccclass("DialogItem") ], DialogItem);
      return DialogItem;
    }();
    exports.DialogItem = DialogItem;
    var Dialog = function(_super) {
      __extends(Dialog, _super);
      function Dialog() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.type = DefineType_1.DIALOG_TYPE.NORMAL;
        _this.layTitle = void 0;
        _this.lbTitle = void 0;
        _this.buttonResource = [];
        _this.dialogItems = new DialogItem();
        _this.data = void 0;
        _this.editboxs = [];
        return _this;
      }
      Dialog.prototype.onLoad = function() {
        this.mask = this.overlay || this.node.getChildByName("mask");
        this.popup = this.popBg || this.node.getChildByName("popup");
        this.oriPos = this.node.getPosition();
        this.popup || cc.warn("BasePopup", "Please add popup background in script for run");
        !this.popupName || (view.dialog[this.popupName] = this);
        this.mask && (this.mask.active = true);
        this.type !== DefineType_1.DIALOG_TYPE.NONE && (this.node.zIndex = this.type);
        if (!this.autoOpen) {
          util.game.hideNode(this.node);
          this.node.x = cc.winSize.width + this.oriPos.x;
        }
        this.render();
        this.type === DefineType_1.DIALOG_TYPE.FORCE ? this.allowClose = false : false === this.data.allowClose ? this.allowClose = false : this.allowClose = true;
      };
      Dialog.prototype.init = function(input) {
        this.data = input;
        this.type = "undefined" === typeof input.type ? DefineType_1.DIALOG_TYPE.NORMAL : input.type;
        this.popupName = input.name || util.game.generateUUID();
      };
      Dialog.prototype.render = function() {
        var _this = this;
        var _a = this.data, type = _a.type, title = _a.title, message = _a.message, editboxs = _a.editboxs, buttons = _a.buttons;
        if (title) {
          this.layTitle.active = true;
          this.lbTitle.string = title;
        } else this.layTitle.active = false;
        if (message) {
          var nodeMessage = cc.instantiate(this.dialogItems.message);
          nodeMessage.x = 0;
          nodeMessage.parent = this.popup;
          nodeMessage.height = message.size == DefineType_1.SIZE.LANGEST ? 330 : message.size == DefineType_1.SIZE.TINY ? 110 : 220;
          var lbMessage = nodeMessage.getComponent(cc.Label);
          lbMessage.string = message.message;
          editboxs && (lbMessage.overflow = cc.Label.Overflow.NONE);
        }
        editboxs && (this.editboxs = editboxs.map(function(o) {
          var nodeEdit = cc.instantiate(_this.dialogItems.editbox);
          nodeEdit.x = 0;
          nodeEdit.parent = _this.popup;
          var editbox = nodeEdit.getComponent(cc.EditBox);
          Object.keys(o).forEach(function(k) {
            editbox[k] = o[k];
          });
          return editbox;
        }));
        if (buttons) {
          var layBtn_1 = cc.instantiate(this.dialogItems.layButton).getComponent(cc.Layout);
          layBtn_1.spacingX = 2 == buttons.length ? 100 : 30;
          layBtn_1.node.x = 0;
          layBtn_1.node.parent = this.popup;
          buttons.forEach(function(o, i) {
            var title = o.title, theme = o.theme, countdown = o.countdown;
            var button = cc.instantiate(_this.dialogItems.button).getComponent(cc.Button);
            var lbButton = button.node.getChildByName("text").getComponent(cc.Label);
            button.node.parent = layBtn_1.node;
            button.node.y = 0;
            title = title || "OK";
            lbButton.string = title;
            var source = _this.buttonResource.find(function(o) {
              return o.type === theme;
            }) || _this.buttonResource.find(function(o) {
              return o.type === DefineType_1.CLASS_THEME.SUCCESS;
            });
            button.getComponent(cc.Sprite).spriteFrame = source.resource;
            var eventHandler = new cc.Component.EventHandler();
            eventHandler.target = _this.node;
            eventHandler.component = "Dialog";
            eventHandler.handler = "onClickButton";
            eventHandler.customEventData = i.toString();
            button.clickEvents.push(eventHandler);
            var timeCount = countdown;
            countdown && button.node.runAction(cc.repeat(cc.sequence(cc.delayTime(1), cc.callFunc(function() {
              lbButton && timeCount >= 0 && (lbButton.string = title + "(" + timeCount + ")");
              0 === timeCount && _this && _this.onClickButton && _this.onClickButton(button, i.toString());
              timeCount--;
            })), countdown + 1));
          });
        }
        this.dialogItems.node.active = false;
      };
      Dialog.prototype.onClose = function() {
        var popupName = this.popupName;
        !!popupName && view.dialog[popupName] && delete view.dialog[popupName];
        _super.prototype.onClose.call(this);
      };
      Dialog.prototype.onClickButton = function(button, customEventData) {
        game.log("Dialog", "onClickButton", "button:" + customEventData);
        if (!this || !this.data || !this.data.buttons || !this.data.buttons[parseInt(customEventData)]) {
          game.log("Dialog", "onClickButton", "button data error");
          return;
        }
        var btnData = this.data.buttons[parseInt(customEventData)];
        var callback = btnData.callback || function(data) {}.bind(this);
        var allowClose = "boolean" != typeof btnData.allowClose || btnData.allowClose;
        callback({
          editboxs: this.editboxs.map(function(o) {
            return o.string;
          })
        });
        allowClose && this.onClose();
      };
      Dialog.prototype.onRelease = function() {
        var node = this.node;
        node.destroy();
      };
      __decorate([ property({
        type: cc.Enum(DefineType_1.DIALOG_TYPE),
        displayName: "Popup Type",
        override: true
      }) ], Dialog.prototype, "type", void 0);
      __decorate([ property({
        type: cc.Node
      }) ], Dialog.prototype, "layTitle", void 0);
      __decorate([ property({
        type: cc.Label
      }) ], Dialog.prototype, "lbTitle", void 0);
      __decorate([ property({
        type: [ ButtonResource ]
      }) ], Dialog.prototype, "buttonResource", void 0);
      __decorate([ property({
        type: DialogItem
      }) ], Dialog.prototype, "dialogItems", void 0);
      Dialog = __decorate([ ccclass ], Dialog);
      return Dialog;
    }(BasePopup_1.default);
    exports.default = Dialog;
    cc._RF.pop();
  }, {
    "../BasePopup": "BasePopup",
    "../Define/DefineType": "DefineType"
  } ],
  DownloadCtr: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "02850mIi71MA6l6R9T/3e4h", "DownloadCtr");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        label: cc.Label,
        sprite: cc.Sprite,
        imgUrl: "http://www.cocos.com/wp-content/themes/cocos/img/download1.png",
        txtUrl: "https://raw.githubusercontent.com/cocos-creator/tutorial-dark-slash/master/LICENSE.md",
        tempImgUrl: "http://www.cocos.com/wp-content/uploads/2018/03/%E9%BB%98%E8%AE%A4%E6%A0%87%E9%A2%98_%E5%85%AC%E4%BC%97%E5%8F%B7%E5%BA%95%E9%83%A8%E4%BA%8C%E7%BB%B4%E7%A0%81_2018.03.08.png",
        audioUrl: "http://tools.itharbors.com/christmas/res/sounds/ss.mp3",
        _downloader: null,
        _imgTask: null,
        _txtTask: null,
        _audioTask: null,
        _storagePath: "",
        _inited: false
      },
      onLoad: function onLoad() {
        true;
        this.label.string = "Downloader is a NATIVE ONLY feature.";
        return;
      },
      onSucceed: function onSucceed(task) {
        var _this = this;
        -1 !== this._audioID && cc.audioEngine.stop(this._audioID);
        switch (task.requestURL) {
         case this.imgUrl:
          cc.loader.load(task.storagePath, function(err, tex) {
            _this.sprite.spriteFrame = new cc.SpriteFrame(tex);
            _this.sprite.node.active = true;
            _this.label.node.active = false;
          });
          break;

         case this.txtUrl:
          var content = jsb.fileUtils.getStringFromFile(task.storagePath);
          this.sprite.node.active = false;
          this.label.node.active = true;
          this.label.string = content.substr(0, 350);
          break;

         case this.audioUrl:
          this.sprite.node.active = false;
          this.label.node.active = true;
          this.label.string = "Audio Download Complete.";
          cc.loader.load(task.storagePath, function(err, clip) {
            _this._audioID = cc.audioEngine.play(clip);
          });
        }
      },
      onProgress: function onProgress(task, bytesReceived, totalBytesReceived, totalBytesExpected) {},
      onError: function onError(task, errorCode, errorCodeInternal, errorStr) {
        this.sprite.node.active = false;
        this.label.node.active = true;
        this.label.string = "Failed to download file (" + task.requestURL + "): " + errorStr + "(" + errorCode + ")";
      },
      downloadImg: function downloadImg() {
        if (!this.imgUrl || !this._inited) return;
        this.sprite.node.active = false;
        this.label.node.active = true;
        this.label.string = "Downloading image";
        this._imgTask = this._downloader.createDownloadFileTask(this.imgUrl, this._storagePath + "download1.png");
      },
      loadImg: function loadImg() {
        var _this2 = this;
        if (!this.tempImgUrl || !this._inited) return;
        cc.loader.load(this.tempImgUrl, function(error, tex) {
          if (error) console.log("Load remote image failed: " + error); else {
            _this2.sprite.spriteFrame = new cc.SpriteFrame(tex);
            _this2.sprite.node.active = true;
            _this2.label.node.active = false;
            cc.audioEngine.stop(_this2._audioID);
          }
        });
      },
      loadSource: function loadSource(url) {
        return new Promise(function(resolve, reject) {
          cc.loader.load(url, function(err, texture) {
            if (err) {
              game.log(err);
              return reject(err);
            }
            return resolve(texture);
          });
        });
      },
      loadImgFromStorage: function loadImgFromStorage() {
        var _this3 = this;
        var filePath = this._storagePath + "download1.png";
        game.log(jsb.fileUtils.isFileExist(filePath));
        this.loadSource(filePath).then(function(sprite) {
          game.log(sprite);
          _this3.sprite.spriteFrame = new cc.SpriteFrame(sprite);
        }).catch(function(err) {
          game.log("error loading banner", JSON.stringify(err));
        });
      },
      downloadTxt: function downloadTxt() {
        if (!this.txtUrl || !this._inited) return;
        this.label.node.active = true;
        this.sprite.node.active = false;
        this.label.string = "Downloading Txt";
        this._txtTask = this._downloader.createDownloadFileTask(this.txtUrl, this._storagePath + "imagine.txt");
      },
      downloadAudio: function downloadAudio() {
        if (!this.audioUrl || !this._inited) return;
        this.sprite.node.active = false;
        this.label.node.active = true;
        this.label.string = "Downloading Audio";
        this._audioTask = this._downloader.createDownloadFileTask(this.audioUrl, this._storagePath + "audioTest.mp3");
      },
      onDisable: function onDisable() {
        cc.audioEngine.stop(this._audioID);
      }
    });
    cc._RF.pop();
  }, {} ],
  EffectLayout: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "daca62Wj9dAVLnlm9/Y1MyW", "EffectLayout");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinAnimation_1 = require("./Animation/CoinAnimation");
    var ItemAnimation_1 = require("./Animation/ItemAnimation");
    var DefineType_1 = require("./Define/DefineType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationData = function() {
      function AnimationData() {
        this.skeletonData = void 0;
        this.animation = "animation";
        this.loop = false;
        this.autoRun = true;
        this.fadeOut = true;
        this.autoRelease = true;
        this.position = new cc.Vec2(0, 0);
      }
      __decorate([ property(sp.SkeletonData) ], AnimationData.prototype, "skeletonData", void 0);
      __decorate([ property() ], AnimationData.prototype, "animation", void 0);
      __decorate([ property() ], AnimationData.prototype, "loop", void 0);
      __decorate([ property() ], AnimationData.prototype, "autoRun", void 0);
      __decorate([ property() ], AnimationData.prototype, "fadeOut", void 0);
      __decorate([ property() ], AnimationData.prototype, "autoRelease", void 0);
      __decorate([ property(cc.v2) ], AnimationData.prototype, "position", void 0);
      AnimationData = __decorate([ ccclass("AnimationData") ], AnimationData);
      return AnimationData;
    }();
    exports.AnimationData = AnimationData;
    var EffectLayout = function(_super) {
      __extends(EffectLayout, _super);
      function EffectLayout() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.maskEnable = DefineType_1.MASK_TYPE.ENABLE;
        _this.coinEffect = DefineType_1.COIN_TYPE.NONE;
        _this.animData = new AnimationData();
        _this.autoRelease = true;
        _this.mask = void 0;
        _this.coin = void 0;
        _this.anim = void 0;
        return _this;
      }
      EffectLayout.prototype.onLoad = function() {
        this.initalization();
      };
      EffectLayout.prototype.init = function(option) {
        option = option || {};
        "undefined" === typeof option.maskEnable && (option.maskEnable = DefineType_1.MASK_TYPE.ENABLE);
        "undefined" === typeof option.coinEffect && (option.coinEffect = DefineType_1.COIN_TYPE.NONE);
        "undefined" === typeof option.autoRelease && (option.autoRelease = true);
        this.maskEnable = option.maskEnable;
        this.coinEffect = option.coinEffect;
        this.animData = option.animationData;
        this.autoRelease = option.autoRelease;
        this.initalization();
      };
      EffectLayout.prototype.initalization = function() {
        if (this.mask) if (this.maskEnable === DefineType_1.MASK_TYPE.NONE) this.mask.active = false; else {
          this.mask.active = true;
          this.mask.opacity = 0;
          this.mask.width = cc.winSize.width;
          this.mask.height = cc.winSize.height;
        }
        this.animData && this.animData.skeletonData && "" !== this.animData.animation && (this.anim.node.position = this.animData.position);
        this.coin && this.coinEffect === DefineType_1.COIN_TYPE.NONE && (this.coin.node.active = false);
      };
      EffectLayout.prototype.play = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, this.onOpen() ];

             case 1:
              _a.sent();
              return [ 4, this.onClose() ];

             case 2:
              _a.sent();
              this.onRelease();
              return [ 2 ];
            }
          });
        });
      };
      EffectLayout.prototype.onOpen = function() {
        return __awaiter(this, void 0, void 0, function() {
          var data;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.mask && this.mask.runAction(cc.fadeTo(.1, 175));
              if (!(this.coin && this.coinEffect === DefineType_1.COIN_TYPE.PLAY_ON_LOAD)) return [ 3, 3 ];
              this.coin.node.active = true;
              if (!(this.animData && this.animData.skeletonData && "" !== this.animData.animation)) return [ 3, 1 ];
              this.coin.play();
              return [ 3, 3 ];

             case 1:
              return [ 4, this.coin.play() ];

             case 2:
              _a.sent();
              _a.label = 3;

             case 3:
              if (!(this.animData && this.animData.skeletonData && "" !== this.animData.animation)) return [ 3, 6 ];
              data = this.animData;
              return [ 4, this.anim.init(data) ];

             case 4:
              _a.sent();
              if (!(this.coin && this.coinEffect === DefineType_1.COIN_TYPE.PLAY_AFTER_ANIMATION)) return [ 3, 6 ];
              this.coin.node.active = true;
              return [ 4, this.coin.play() ];

             case 5:
              _a.sent();
              _a.label = 6;

             case 6:
              return [ 2 ];
            }
          });
        });
      };
      EffectLayout.prototype.onClose = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this.mask) return [ 3, 2 ];
              return [ 4, new Promise(function(res, rej) {
                _this.mask.runAction(cc.sequence(cc.fadeOut(.1), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 1:
              _a.sent();
              _a.label = 2;

             case 2:
              return [ 2 ];
            }
          });
        });
      };
      EffectLayout.prototype.onRelease = function() {
        if (this.autoRelease) {
          this.node.destroy();
          view.animation && (view.animation = void 0);
        }
      };
      __decorate([ property({
        type: cc.Enum(DefineType_1.MASK_TYPE)
      }) ], EffectLayout.prototype, "maskEnable", void 0);
      __decorate([ property({
        type: cc.Enum(DefineType_1.COIN_TYPE)
      }) ], EffectLayout.prototype, "coinEffect", void 0);
      __decorate([ property(AnimationData) ], EffectLayout.prototype, "animData", void 0);
      __decorate([ property() ], EffectLayout.prototype, "autoRelease", void 0);
      __decorate([ property(cc.Node) ], EffectLayout.prototype, "mask", void 0);
      __decorate([ property(CoinAnimation_1.default) ], EffectLayout.prototype, "coin", void 0);
      __decorate([ property(ItemAnimation_1.default) ], EffectLayout.prototype, "anim", void 0);
      EffectLayout = __decorate([ ccclass ], EffectLayout);
      return EffectLayout;
    }(cc.Component);
    exports.default = EffectLayout;
    cc._RF.pop();
  }, {
    "./Animation/CoinAnimation": "CoinAnimation",
    "./Animation/ItemAnimation": "ItemAnimation",
    "./Define/DefineType": "DefineType"
  } ],
  Effect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1085fUXxh9AOLb35Gkb8Rog", "Effect");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineType_1 = require("./Define/DefineType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Effect = function(_super) {
      __extends(Effect, _super);
      function Effect() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      Effect_1 = Effect;
      Effect.ins = function() {
        this.instance || (this.instance = new Effect_1());
        return this.instance;
      };
      Effect.prototype.get = function(name, option) {
        option = option || {};
        switch (name) {
         case DefineType_1.EFFECT.BOUCE_IN:
          return this.bouceIn(option);

         case DefineType_1.EFFECT.BOUCE_OUT:
          return this.bouceOut(option);

         case DefineType_1.EFFECT.MOVE_IN_BY_DOWN:
          option.direction = DefineType_1.DIRECTION.DOWN;
          return this.moveInBy(option);

         case DefineType_1.EFFECT.MOVE_IN_BY_UP:
          option.direction = DefineType_1.DIRECTION.UP;
          return this.moveInBy(option);

         case DefineType_1.EFFECT.MOVE_IN_BY_LEFT:
          option.direction = DefineType_1.DIRECTION.LEFT;
          return this.moveInBy(option);

         case DefineType_1.EFFECT.MOVE_IN_BY_RIGHT:
          option.direction = DefineType_1.DIRECTION.RIGHT;
          return this.moveInBy(option);

         case DefineType_1.EFFECT.MOVE_OUT_BY_DOWN:
          option.direction = DefineType_1.DIRECTION.DOWN;
          return this.moveOutBy(option);

         case DefineType_1.EFFECT.MOVE_OUT_BY_UP:
          option.direction = DefineType_1.DIRECTION.UP;
          return this.moveOutBy(option);

         case DefineType_1.EFFECT.MOVE_OUT_BY_LEFT:
          option.direction = DefineType_1.DIRECTION.LEFT;
          return this.moveOutBy(option);

         case DefineType_1.EFFECT.MOVE_OUT_BY_RIGHT:
          option.direction = DefineType_1.DIRECTION.RIGHT;
          return this.moveOutBy(option);
        }
      };
      Effect.prototype.getEffectName = function(kind, type) {
        if (kind === DefineType_1.EFFECT_KIND.IN) switch (type) {
         case DefineType_1.EFFECT_TYPE.BOUCE:
          return DefineType_1.EFFECT.BOUCE_IN;

         case DefineType_1.EFFECT_TYPE.MOVE_BY_DOWN:
          return DefineType_1.EFFECT.MOVE_IN_BY_DOWN;

         case DefineType_1.EFFECT_TYPE.MOVE_BY_UP:
          return DefineType_1.EFFECT.MOVE_IN_BY_UP;

         case DefineType_1.EFFECT_TYPE.MOVE_BY_LEFT:
          return DefineType_1.EFFECT.MOVE_IN_BY_LEFT;

         case DefineType_1.EFFECT_TYPE.MOVE_BY_RIGHT:
          return DefineType_1.EFFECT.MOVE_IN_BY_RIGHT;

         default:
          return DefineType_1.EFFECT.BOUCE_IN;
        } else switch (type) {
         case DefineType_1.EFFECT_TYPE.BOUCE:
          return DefineType_1.EFFECT.BOUCE_OUT;

         case DefineType_1.EFFECT_TYPE.MOVE_BY_DOWN:
          return DefineType_1.EFFECT.MOVE_OUT_BY_DOWN;

         case DefineType_1.EFFECT_TYPE.MOVE_BY_UP:
          return DefineType_1.EFFECT.MOVE_OUT_BY_UP;

         case DefineType_1.EFFECT_TYPE.MOVE_BY_LEFT:
          return DefineType_1.EFFECT.MOVE_OUT_BY_LEFT;

         case DefineType_1.EFFECT_TYPE.MOVE_BY_RIGHT:
          return DefineType_1.EFFECT.MOVE_OUT_BY_RIGHT;

         default:
          return DefineType_1.EFFECT.BOUCE_OUT;
        }
      };
      Effect.prototype.delay = function(option) {
        var time = option.time, callback = option.callback;
        return cc.sequence(cc.delayTime(time), cc.callFunc(function() {
          callback && callback();
        }));
      };
      Effect.prototype.bouceIn = function(option) {
        option = option || {};
        var time = option.time, scale = option.scale, easing = option.easing, callback = option.callback, pScale = option.pScale;
        time = !time ? .25 : time;
        scale = !scale ? 1 : scale;
        pScale = !pScale ? 0 : pScale;
        easing = "undefined" === typeof easing || easing;
        var pre = cc.spawn(cc.fadeOut(0), cc.scaleTo(0, pScale));
        var effect = cc.spawn(cc.fadeIn(time), easing ? cc.scaleTo(time, scale).easing(cc.easeBackOut()) : cc.scaleTo(time, scale));
        var call = cc.callFunc(function() {
          callback && callback();
        });
        return cc.sequence(pre, effect, call);
      };
      Effect.prototype.bouceOut = function(option) {
        option = option || {};
        var time = option.time, scale = option.scale, easing = option.easing, callback = option.callback;
        time = !time ? .15 : time;
        scale = !scale ? 0 : scale;
        easing = "undefined" === typeof easing || easing;
        var effect = cc.spawn(cc.fadeOut(time), easing ? cc.scaleTo(time, scale).easing(cc.easeBackIn()) : cc.scaleTo(time, scale));
        var call = cc.callFunc(function() {
          callback && callback();
        });
        return cc.sequence(effect, call);
      };
      Effect.prototype.moveInBy = function(option) {
        option = option || {
          direction: DefineType_1.DIRECTION.LEFT
        };
        var time = option.time, direction = option.direction, distance = option.distance, easing = option.easing, callback = option.callback;
        time = !time ? .15 : time;
        direction = !direction ? DefineType_1.DIRECTION.LEFT : direction;
        distance = !distance ? 200 : distance;
        easing = "undefined" === typeof easing || easing;
        var vec = void 0;
        direction == DefineType_1.DIRECTION.LEFT && (vec = cc.v2(distance, 0));
        direction == DefineType_1.DIRECTION.RIGHT && (vec = cc.v2(-distance, 0));
        direction == DefineType_1.DIRECTION.UP && (vec = cc.v2(0, -distance));
        direction == DefineType_1.DIRECTION.DOWN && (vec = cc.v2(0, distance));
        var pre = cc.spawn(cc.fadeOut(0), cc.moveBy(0, -vec.x, -vec.y));
        var effect = cc.spawn(cc.fadeIn(time), easing ? cc.moveBy(time, vec.x, vec.y).easing(cc.easeBackOut()) : cc.moveBy(time, vec.x, vec.y));
        var call = cc.callFunc(function() {
          callback && callback();
        });
        return cc.sequence(pre, effect, call);
      };
      Effect.prototype.moveOutBy = function(option) {
        option = option || {
          direction: DefineType_1.DIRECTION.LEFT
        };
        var time = option.time, direction = option.direction, distance = option.distance, easing = option.easing, callback = option.callback;
        time = !time ? .15 : time;
        direction = !direction ? DefineType_1.DIRECTION.LEFT : direction;
        distance = !distance ? 200 : distance;
        easing = "undefined" === typeof easing || easing;
        var vec = void 0;
        direction == DefineType_1.DIRECTION.LEFT && (vec = cc.v2(-distance, 0));
        direction == DefineType_1.DIRECTION.RIGHT && (vec = cc.v2(distance, 0));
        direction == DefineType_1.DIRECTION.UP && (vec = cc.v2(0, distance));
        direction == DefineType_1.DIRECTION.DOWN && (vec = cc.v2(0, -distance));
        var effect = cc.spawn(cc.fadeOut(time), easing ? cc.moveBy(time, vec.x, vec.y).easing(cc.easeBackIn()) : cc.moveBy(time, vec.x, vec.y));
        var end = cc.moveBy(0, -vec.x, -vec.y);
        var call = cc.callFunc(function() {
          callback && callback();
        });
        return cc.sequence(effect, end, call);
      };
      Effect.prototype.shake = function(option) {
        option = option || {};
        var delay = option.delay, timeShake = option.timeShake, loop = option.loop;
        delay = delay || 3;
        timeShake = timeShake || 4;
        loop = "boolean" !== typeof loop || loop;
        var act = cc.sequence(cc.repeat(cc.sequence(cc.rotateBy(.05, 10), cc.rotateBy(.05, -10)), timeShake), cc.delayTime(delay));
        loop && (act = act.repeatForever());
        return act;
      };
      Effect.prototype.jelly = function(option) {
        option = option || {};
        var time = option.time, loop = option.loop;
        time = time || 1;
        loop = "boolean" !== typeof loop || loop;
        var scaleDown = cc.scaleTo(.2 * time / 1, 1.25, .75);
        var scaleUp = cc.scaleTo(.8 * time / 1, 1, 1).easing(cc.easeElasticOut(.01));
        var delayTime = cc.delayTime(1);
        var act = cc.sequence(scaleDown, scaleUp, delayTime);
        loop && (act = act.repeatForever());
        return act;
      };
      Effect.prototype.stamp = function(option) {
        option = option || {};
        var time = option.time, rotate = option.rotate, scale = option.scale, callback = option.callback;
        time = time || .3;
        scale = scale || 2;
        rotate = "boolean" !== typeof rotate || rotate;
        var preFade = cc.fadeOut(0);
        var preSca = cc.scaleTo(0, scale);
        var preRot = cc.rotateBy(0, -20);
        var pre = cc.spawn(preFade, preSca, rotate ? preRot : void 0);
        var actFade = cc.fadeIn(time).easing(cc.easeCubicActionIn());
        var actSca = cc.scaleTo(time, 1);
        var actRot = cc.rotateBy(time, 20);
        var act = cc.spawn(actFade, actSca, rotate ? actRot : void 0);
        var action = cc.sequence(pre, act, callback ? cc.callFunc(function() {
          callback();
        }) : void 0);
        return action;
      };
      Effect.prototype.springy = function(option) {
        option = option || {};
        var time = option.time, callback = option.callback;
        time = time || .6;
        var scaIn = cc.scaleTo(.2 * time / .7, .9);
        var scaOut = cc.scaleTo(.5 * time / .7, 1).easing(cc.easeBackOut());
        var call = cc.callFunc(function() {
          callback && callback();
        });
        var act = cc.sequence(scaIn, scaOut, call);
        return act;
      };
      var Effect_1;
      Effect.instance = void 0;
      Effect = Effect_1 = __decorate([ ccclass ], Effect);
      return Effect;
    }(cc.Component);
    exports.default = Effect;
    cc._RF.pop();
  }, {
    "./Define/DefineType": "DefineType"
  } ],
  GameConfig: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3cd21EwkSRDvL7ZGEzj9bOb", "GameConfig");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameConfig = function() {
      function GameConfig() {}
      GameConfig.convertPayLineForServer = function(array) {
        return array.map(function(item) {
          return item.map(function(item, index) {
            return 5 * item + index;
          });
        });
      };
      GameConfig.GAME_SIZE = {
        1: [ 3, 3, 3, 3, 3 ],
        2: [ 4, 4, 4, 4, 4 ],
        3: [ 4, 4, 4, 4, 4, 4 ],
        4: [ 1, 3, 5, 3, 1 ],
        5: [ 2, 3, 4, 3, 2 ]
      };
      GameConfig.PAY_LINES = {
        9: [ [ 1, 1, 1, 1, 1 ], [ 0, 0, 0, 0, 0 ], [ 2, 2, 2, 2, 2 ], [ 0, 1, 2, 1, 0 ], [ 2, 1, 0, 1, 2 ], [ 1, 0, 0, 0, 1 ], [ 1, 2, 2, 2, 1 ], [ 0, 0, 1, 2, 2 ], [ 2, 2, 1, 0, 0 ] ],
        20: [ [ 1, 1, 1, 1, 1 ], [ 0, 0, 0, 0, 0 ], [ 2, 2, 2, 2, 2 ], [ 0, 1, 2, 1, 0 ], [ 2, 1, 0, 1, 2 ], [ 1, 0, 0, 0, 1 ], [ 1, 2, 2, 2, 1 ], [ 0, 0, 1, 2, 2 ], [ 2, 2, 1, 0, 0 ], [ 1, 2, 1, 0, 1 ], [ 1, 0, 1, 2, 1 ], [ 0, 1, 1, 1, 0 ], [ 2, 1, 1, 1, 2 ], [ 0, 1, 0, 1, 0 ], [ 2, 1, 2, 1, 2 ], [ 1, 1, 0, 1, 1 ], [ 1, 1, 2, 1, 1 ], [ 0, 0, 2, 0, 0 ], [ 2, 2, 0, 2, 2 ], [ 0, 2, 2, 2, 0 ] ],
        25: [ [ 1, 1, 1, 1, 1 ], [ 0, 0, 0, 0, 0 ], [ 2, 2, 2, 2, 2 ], [ 0, 1, 2, 1, 0 ], [ 2, 1, 0, 1, 2 ], [ 1, 0, 1, 2, 1 ], [ 1, 2, 1, 0, 1 ], [ 0, 0, 1, 2, 2 ], [ 2, 2, 1, 0, 0 ], [ 0, 1, 0, 1, 0 ], [ 2, 1, 2, 1, 2 ], [ 1, 0, 0, 0, 1 ], [ 1, 2, 2, 2, 1 ], [ 0, 1, 1, 1, 0 ], [ 2, 1, 1, 1, 2 ], [ 1, 1, 0, 1, 1 ], [ 1, 1, 2, 1, 1 ], [ 1, 0, 1, 0, 1 ], [ 1, 2, 1, 2, 1 ], [ 0, 0, 0, 1, 2 ], [ 2, 2, 2, 1, 0 ], [ 0, 1, 2, 2, 2 ], [ 2, 1, 0, 0, 0 ], [ 1, 1, 1, 0, 1 ], [ 1, 1, 1, 2, 1 ] ],
        50: [ [ 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2, 2 ], [ 0, 0, 0, 0, 0 ], [ 3, 3, 3, 3, 3 ], [ 0, 1, 2, 1, 0 ], [ 3, 2, 1, 2, 3 ], [ 1, 2, 3, 2, 1 ], [ 2, 1, 0, 1, 2 ], [ 0, 1, 0, 1, 0 ], [ 3, 2, 3, 2, 3 ], [ 1, 0, 1, 0, 1 ], [ 2, 3, 2, 3, 2 ], [ 1, 2, 1, 2, 1 ], [ 2, 1, 2, 1, 2 ], [ 0, 0, 1, 0, 0 ], [ 3, 3, 2, 3, 3 ], [ 1, 1, 2, 1, 1 ], [ 2, 2, 1, 2, 2 ], [ 2, 2, 3, 2, 2 ], [ 1, 1, 0, 1, 1 ], [ 1, 2, 2, 2, 1 ], [ 2, 1, 1, 1, 2 ], [ 1, 0, 0, 0, 1 ], [ 2, 3, 3, 3, 2 ], [ 3, 2, 2, 2, 3 ], [ 0, 1, 1, 1, 0 ], [ 2, 0, 0, 0, 2 ], [ 1, 3, 3, 3, 1 ], [ 3, 1, 1, 1, 3 ], [ 0, 2, 2, 2, 0 ], [ 2, 2, 0, 2, 2 ], [ 1, 1, 3, 1, 1 ], [ 0, 0, 2, 0, 0 ], [ 3, 3, 1, 3, 3 ], [ 3, 3, 0, 3, 3 ], [ 0, 0, 3, 0, 0 ], [ 3, 2, 1, 0, 0 ], [ 0, 1, 2, 3, 3 ], [ 0, 0, 1, 2, 3 ], [ 3, 3, 2, 1, 0 ], [ 2, 1, 0, 0, 0 ], [ 1, 2, 3, 3, 3 ], [ 0, 0, 0, 1, 2 ], [ 3, 3, 3, 2, 1 ], [ 3, 2, 1, 1, 1 ], [ 0, 1, 2, 2, 2 ], [ 1, 1, 1, 2, 3 ], [ 2, 2, 2, 1, 0 ], [ 1, 3, 0, 3, 1 ], [ 2, 0, 3, 0, 2 ] ],
        80: [ [ 1, 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2, 2, 2 ], [ 0, 0, 0, 0, 0, 0 ], [ 3, 3, 3, 3, 3, 3 ], [ 0, 1, 2, 2, 1, 0 ], [ 3, 2, 1, 1, 2, 3 ], [ 1, 2, 3, 3, 2, 1 ], [ 2, 1, 0, 0, 1, 2 ], [ 0, 1, 0, 0, 1, 0 ], [ 3, 2, 3, 3, 2, 3 ], [ 1, 0, 1, 1, 0, 1 ], [ 2, 3, 2, 2, 3, 2 ], [ 1, 2, 1, 1, 2, 1 ], [ 2, 1, 2, 2, 1, 2 ], [ 0, 0, 1, 1, 0, 0 ], [ 3, 3, 2, 2, 3, 3 ], [ 1, 1, 2, 2, 1, 1 ], [ 2, 2, 1, 1, 2, 2 ], [ 2, 2, 3, 3, 2, 2 ], [ 1, 1, 0, 0, 1, 1 ], [ 1, 2, 2, 2, 2, 1 ], [ 2, 1, 1, 1, 1, 2 ], [ 1, 0, 0, 0, 0, 1 ], [ 2, 3, 3, 3, 3, 2 ], [ 3, 2, 2, 2, 2, 3 ], [ 0, 1, 1, 1, 1, 0 ], [ 2, 0, 0, 0, 0, 2 ], [ 1, 3, 3, 3, 3, 1 ], [ 3, 1, 1, 1, 1, 3 ], [ 0, 2, 2, 2, 2, 0 ], [ 2, 2, 0, 0, 2, 2 ], [ 1, 1, 3, 3, 1, 1 ], [ 0, 0, 2, 2, 0, 0 ], [ 3, 3, 1, 1, 3, 3 ], [ 3, 3, 0, 0, 3, 3 ], [ 0, 0, 3, 3, 0, 0 ], [ 3, 2, 1, 0, 0, 0 ], [ 0, 1, 2, 3, 3, 3 ], [ 0, 0, 0, 1, 2, 3 ], [ 3, 3, 3, 2, 1, 0 ], [ 2, 1, 0, 0, 0, 0 ], [ 1, 2, 3, 3, 3, 3 ], [ 0, 0, 0, 0, 1, 2 ], [ 3, 3, 3, 3, 2, 1 ], [ 3, 2, 1, 1, 1, 1 ], [ 0, 1, 2, 2, 2, 2 ], [ 1, 1, 1, 1, 2, 3 ], [ 2, 2, 2, 2, 1, 0 ], [ 1, 3, 0, 0, 3, 0 ], [ 2, 0, 3, 3, 0, 2 ], [ 0, 3, 0, 0, 3, 0 ], [ 3, 0, 3, 3, 0, 3 ], [ 0, 1, 0, 1, 0, 1 ], [ 3, 2, 3, 2, 3, 2 ], [ 1, 2, 1, 2, 1, 2 ], [ 2, 1, 2, 1, 2, 1 ], [ 2, 3, 2, 3, 2, 3 ], [ 1, 0, 1, 0, 1, 0 ], [ 0, 2, 0, 2, 0, 2 ], [ 3, 1, 3, 1, 3, 1 ], [ 1, 3, 1, 3, 1, 3 ], [ 2, 0, 2, 0, 2, 0 ], [ 0, 3, 0, 3, 3, 0 ], [ 3, 0, 3, 0, 3, 0 ], [ 0, 1, 2, 3, 2, 1 ], [ 3, 2, 1, 0, 1, 2 ], [ 1, 2, 3, 2, 1, 0 ], [ 2, 1, 0, 1, 2, 3 ], [ 0, 1, 0, 1, 2, 3 ], [ 3, 2, 3, 2, 1, 0 ], [ 1, 2, 1, 0, 1, 2 ], [ 2, 1, 2, 3, 2, 1 ], [ 0, 3, 3, 3, 3, 0 ], [ 3, 0, 0, 0, 0, 3 ], [ 1, 0, 1, 2, 1, 0 ], [ 2, 3, 2, 1, 2, 3 ], [ 0, 2, 3, 3, 2, 0 ], [ 3, 1, 0, 0, 1, 3 ], [ 1, 3, 0, 3, 0, 2 ], [ 2, 0, 3, 0, 3, 1 ] ],
        243: [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 1 ], [ 0, 0, 0, 0, 2 ], [ 0, 0, 0, 1, 0 ], [ 0, 0, 0, 1, 1 ], [ 0, 0, 0, 1, 2 ], [ 0, 0, 0, 2, 0 ], [ 0, 0, 0, 2, 1 ], [ 0, 0, 0, 2, 2 ], [ 0, 0, 1, 0, 0 ], [ 0, 0, 1, 0, 1 ], [ 0, 0, 1, 0, 2 ], [ 0, 0, 1, 1, 0 ], [ 0, 0, 1, 1, 1 ], [ 0, 0, 1, 1, 2 ], [ 0, 0, 1, 2, 0 ], [ 0, 0, 1, 2, 1 ], [ 0, 0, 1, 2, 2 ], [ 0, 0, 2, 0, 0 ], [ 0, 0, 2, 0, 1 ], [ 0, 0, 2, 0, 2 ], [ 0, 0, 2, 1, 0 ], [ 0, 0, 2, 1, 1 ], [ 0, 0, 2, 1, 2 ], [ 0, 0, 2, 2, 0 ], [ 0, 0, 2, 2, 1 ], [ 0, 0, 2, 2, 2 ], [ 0, 1, 0, 0, 0 ], [ 0, 1, 0, 0, 1 ], [ 0, 1, 0, 0, 2 ], [ 0, 1, 0, 1, 0 ], [ 0, 1, 0, 1, 1 ], [ 0, 1, 0, 1, 2 ], [ 0, 1, 0, 2, 0 ], [ 0, 1, 0, 2, 1 ], [ 0, 1, 0, 2, 2 ], [ 0, 1, 1, 0, 0 ], [ 0, 1, 1, 0, 1 ], [ 0, 1, 1, 0, 2 ], [ 0, 1, 1, 1, 0 ], [ 0, 1, 1, 1, 1 ], [ 0, 1, 1, 1, 2 ], [ 0, 1, 1, 2, 0 ], [ 0, 1, 1, 2, 1 ], [ 0, 1, 1, 2, 2 ], [ 0, 1, 2, 0, 0 ], [ 0, 1, 2, 0, 1 ], [ 0, 1, 2, 0, 2 ], [ 0, 1, 2, 1, 0 ], [ 0, 1, 2, 1, 1 ], [ 0, 1, 2, 1, 2 ], [ 0, 1, 2, 2, 0 ], [ 0, 1, 2, 2, 1 ], [ 0, 1, 2, 2, 2 ], [ 0, 2, 0, 0, 0 ], [ 0, 2, 0, 0, 1 ], [ 0, 2, 0, 0, 2 ], [ 0, 2, 0, 1, 0 ], [ 0, 2, 0, 1, 1 ], [ 0, 2, 0, 1, 2 ], [ 0, 2, 0, 2, 0 ], [ 0, 2, 0, 2, 1 ], [ 0, 2, 0, 2, 2 ], [ 0, 2, 1, 0, 0 ], [ 0, 2, 1, 0, 1 ], [ 0, 2, 1, 0, 2 ], [ 0, 2, 1, 1, 0 ], [ 0, 2, 1, 1, 1 ], [ 0, 2, 1, 1, 2 ], [ 0, 2, 1, 2, 0 ], [ 0, 2, 1, 2, 1 ], [ 0, 2, 1, 2, 2 ], [ 0, 2, 2, 0, 0 ], [ 0, 2, 2, 0, 1 ], [ 0, 2, 2, 0, 2 ], [ 0, 2, 2, 1, 0 ], [ 0, 2, 2, 1, 1 ], [ 0, 2, 2, 1, 2 ], [ 0, 2, 2, 2, 0 ], [ 0, 2, 2, 2, 1 ], [ 0, 2, 2, 2, 2 ], [ 1, 0, 0, 0, 0 ], [ 1, 0, 0, 0, 1 ], [ 1, 0, 0, 0, 2 ], [ 1, 0, 0, 1, 0 ], [ 1, 0, 0, 1, 1 ], [ 1, 0, 0, 1, 2 ], [ 1, 0, 0, 2, 0 ], [ 1, 0, 0, 2, 1 ], [ 1, 0, 0, 2, 2 ], [ 1, 0, 1, 0, 0 ], [ 1, 0, 1, 0, 1 ], [ 1, 0, 1, 0, 2 ], [ 1, 0, 1, 1, 0 ], [ 1, 0, 1, 1, 1 ], [ 1, 0, 1, 1, 2 ], [ 1, 0, 1, 2, 0 ], [ 1, 0, 1, 2, 1 ], [ 1, 0, 1, 2, 2 ], [ 1, 0, 2, 0, 0 ], [ 1, 0, 2, 0, 1 ], [ 1, 0, 2, 0, 2 ], [ 1, 0, 2, 1, 0 ], [ 1, 0, 2, 1, 1 ], [ 1, 0, 2, 1, 2 ], [ 1, 0, 2, 2, 0 ], [ 1, 0, 2, 2, 1 ], [ 1, 0, 2, 2, 2 ], [ 1, 1, 0, 0, 0 ], [ 1, 1, 0, 0, 1 ], [ 1, 1, 0, 0, 2 ], [ 1, 1, 0, 1, 0 ], [ 1, 1, 0, 1, 1 ], [ 1, 1, 0, 1, 2 ], [ 1, 1, 0, 2, 0 ], [ 1, 1, 0, 2, 1 ], [ 1, 1, 0, 2, 2 ], [ 1, 1, 1, 0, 0 ], [ 1, 1, 1, 0, 1 ], [ 1, 1, 1, 0, 2 ], [ 1, 1, 1, 1, 0 ], [ 1, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 2 ], [ 1, 1, 1, 2, 0 ], [ 1, 1, 1, 2, 1 ], [ 1, 1, 1, 2, 2 ], [ 1, 1, 2, 0, 0 ], [ 1, 1, 2, 0, 1 ], [ 1, 1, 2, 0, 2 ], [ 1, 1, 2, 1, 0 ], [ 1, 1, 2, 1, 1 ], [ 1, 1, 2, 1, 2 ], [ 1, 1, 2, 2, 0 ], [ 1, 1, 2, 2, 1 ], [ 1, 1, 2, 2, 2 ], [ 1, 2, 0, 0, 0 ], [ 1, 2, 0, 0, 1 ], [ 1, 2, 0, 0, 2 ], [ 1, 2, 0, 1, 0 ], [ 1, 2, 0, 1, 1 ], [ 1, 2, 0, 1, 2 ], [ 1, 2, 0, 2, 0 ], [ 1, 2, 0, 2, 1 ], [ 1, 2, 0, 2, 2 ], [ 1, 2, 1, 0, 0 ], [ 1, 2, 1, 0, 1 ], [ 1, 2, 1, 0, 2 ], [ 1, 2, 1, 1, 0 ], [ 1, 2, 1, 1, 1 ], [ 1, 2, 1, 1, 2 ], [ 1, 2, 1, 2, 0 ], [ 1, 2, 1, 2, 1 ], [ 1, 2, 1, 2, 2 ], [ 1, 2, 2, 0, 0 ], [ 1, 2, 2, 0, 1 ], [ 1, 2, 2, 0, 2 ], [ 1, 2, 2, 1, 0 ], [ 1, 2, 2, 1, 1 ], [ 1, 2, 2, 1, 2 ], [ 1, 2, 2, 2, 0 ], [ 1, 2, 2, 2, 1 ], [ 1, 2, 2, 2, 2 ], [ 2, 0, 0, 0, 0 ], [ 2, 0, 0, 0, 1 ], [ 2, 0, 0, 0, 2 ], [ 2, 0, 0, 1, 0 ], [ 2, 0, 0, 1, 1 ], [ 2, 0, 0, 1, 2 ], [ 2, 0, 0, 2, 0 ], [ 2, 0, 0, 2, 1 ], [ 2, 0, 0, 2, 2 ], [ 2, 0, 1, 0, 0 ], [ 2, 0, 1, 0, 1 ], [ 2, 0, 1, 0, 2 ], [ 2, 0, 1, 1, 0 ], [ 2, 0, 1, 1, 1 ], [ 2, 0, 1, 1, 2 ], [ 2, 0, 1, 2, 0 ], [ 2, 0, 1, 2, 1 ], [ 2, 0, 1, 2, 2 ], [ 2, 0, 2, 0, 0 ], [ 2, 0, 2, 0, 1 ], [ 2, 0, 2, 0, 2 ], [ 2, 0, 2, 1, 0 ], [ 2, 0, 2, 1, 1 ], [ 2, 0, 2, 1, 2 ], [ 2, 0, 2, 2, 0 ], [ 2, 0, 2, 2, 1 ], [ 2, 0, 2, 2, 2 ], [ 2, 1, 0, 0, 0 ], [ 2, 1, 0, 0, 1 ], [ 2, 1, 0, 0, 2 ], [ 2, 1, 0, 1, 0 ], [ 2, 1, 0, 1, 1 ], [ 2, 1, 0, 1, 2 ], [ 2, 1, 0, 2, 0 ], [ 2, 1, 0, 2, 1 ], [ 2, 1, 0, 2, 2 ], [ 2, 1, 1, 0, 0 ], [ 2, 1, 1, 0, 1 ], [ 2, 1, 1, 0, 2 ], [ 2, 1, 1, 1, 0 ], [ 2, 1, 1, 1, 1 ], [ 2, 1, 1, 1, 2 ], [ 2, 1, 1, 2, 0 ], [ 2, 1, 1, 2, 1 ], [ 2, 1, 1, 2, 2 ], [ 2, 1, 2, 0, 0 ], [ 2, 1, 2, 0, 1 ], [ 2, 1, 2, 0, 2 ], [ 2, 1, 2, 1, 0 ], [ 2, 1, 2, 1, 1 ], [ 2, 1, 2, 1, 2 ], [ 2, 1, 2, 2, 0 ], [ 2, 1, 2, 2, 1 ], [ 2, 1, 2, 2, 2 ], [ 2, 2, 0, 0, 0 ], [ 2, 2, 0, 0, 1 ], [ 2, 2, 0, 0, 2 ], [ 2, 2, 0, 1, 0 ], [ 2, 2, 0, 1, 1 ], [ 2, 2, 0, 1, 2 ], [ 2, 2, 0, 2, 0 ], [ 2, 2, 0, 2, 1 ], [ 2, 2, 0, 2, 2 ], [ 2, 2, 1, 0, 0 ], [ 2, 2, 1, 0, 1 ], [ 2, 2, 1, 0, 2 ], [ 2, 2, 1, 1, 0 ], [ 2, 2, 1, 1, 1 ], [ 2, 2, 1, 1, 2 ], [ 2, 2, 1, 2, 0 ], [ 2, 2, 1, 2, 1 ], [ 2, 2, 1, 2, 2 ], [ 2, 2, 2, 0, 0 ], [ 2, 2, 2, 0, 1 ], [ 2, 2, 2, 0, 2 ], [ 2, 2, 2, 1, 0 ], [ 2, 2, 2, 1, 1 ], [ 2, 2, 2, 1, 2 ], [ 2, 2, 2, 2, 0 ], [ 2, 2, 2, 2, 1 ], [ 2, 2, 2, 2, 2 ] ],
        100: [ [ 1, 1, 1, 1, 1 ], [ 0, 0, 0, 0, 0 ], [ 2, 2, 2, 2, 2 ], [ 0, 1, 2, 1, 0 ], [ 2, 1, 0, 1, 2 ], [ 1, 0, 0, 0, 1 ], [ 1, 2, 2, 2, 1 ], [ 0, 0, 1, 2, 2 ], [ 2, 2, 1, 0, 0 ], [ 1, 2, 1, 0, 1 ], [ 1, 0, 1, 2, 1 ], [ 0, 1, 1, 1, 0 ], [ 2, 1, 1, 1, 2 ], [ 0, 1, 0, 1, 0 ], [ 2, 1, 2, 1, 2 ], [ 1, 1, 0, 1, 1 ], [ 1, 1, 2, 1, 1 ], [ 0, 0, 2, 0, 0 ], [ 2, 2, 0, 2, 2 ], [ 0, 2, 2, 2, 0 ], [ 2, 0, 0, 0, 2 ], [ 1, 2, 0, 2, 1 ], [ 1, 0, 2, 0, 1 ], [ 0, 2, 0, 2, 0 ], [ 2, 0, 2, 0, 2 ], [ 2, 0, 1, 2, 0 ], [ 0, 2, 1, 0, 2 ], [ 0, 2, 1, 2, 0 ], [ 2, 0, 1, 0, 2 ], [ 2, 1, 0, 0, 1 ], [ 0, 1, 2, 2, 1 ], [ 0, 0, 2, 2, 2 ], [ 2, 2, 0, 0, 0 ], [ 1, 0, 2, 1, 2 ], [ 1, 2, 0, 1, 0 ], [ 0, 1, 0, 1, 2 ], [ 2, 1, 2, 1, 0 ], [ 1, 2, 2, 0, 0 ], [ 0, 0, 1, 1, 2 ], [ 2, 2, 1, 1, 0 ], [ 2, 0, 0, 0, 0 ], [ 0, 2, 2, 2, 2 ], [ 2, 2, 2, 2, 0 ], [ 0, 0, 0, 0, 2 ], [ 1, 0, 1, 0, 1 ], [ 1, 2, 1, 2, 1 ], [ 0, 1, 2, 2, 2 ], [ 2, 1, 0, 0, 0 ], [ 0, 1, 1, 1, 1 ], [ 2, 1, 1, 1, 1 ], [ 0, 0, 0, 0, 1 ], [ 0, 0, 0, 1, 1 ], [ 0, 0, 0, 1, 2 ], [ 0, 0, 1, 0, 0 ], [ 0, 0, 1, 1, 0 ], [ 0, 0, 1, 1, 1 ], [ 0, 0, 1, 2, 1 ], [ 0, 1, 0, 0, 0 ], [ 0, 1, 0, 1, 1 ], [ 2, 0, 1, 0, 1 ], [ 0, 2, 1, 2, 1 ], [ 0, 1, 0, 2, 0 ], [ 2, 1, 2, 0, 2 ], [ 0, 1, 1, 1, 2 ], [ 2, 1, 1, 1, 0 ], [ 0, 1, 1, 2, 2 ], [ 1, 0, 0, 0, 0 ], [ 1, 0, 0, 1, 1 ], [ 1, 0, 0, 1, 2 ], [ 0, 1, 1, 0, 1 ], [ 1, 0, 1, 1, 2 ], [ 1, 0, 1, 2, 2 ], [ 1, 1, 0, 0, 0 ], [ 1, 1, 0, 0, 1 ], [ 1, 1, 0, 1, 2 ], [ 0, 0, 2, 1, 0 ], [ 1, 1, 1, 0, 0 ], [ 1, 1, 2, 2, 2 ], [ 2, 2, 2, 2, 1 ], [ 1, 1, 1, 1, 2 ], [ 0, 1, 0, 2, 1 ], [ 1, 2, 2, 2, 2 ], [ 1, 2, 1, 0, 0 ], [ 2, 2, 1, 0, 1 ], [ 2, 2, 1, 1, 1 ], [ 2, 1, 2, 1, 1 ], [ 0, 0, 0, 2, 0 ], [ 2, 2, 2, 0, 2 ], [ 2, 0, 2, 2, 2 ], [ 0, 2, 0, 0, 0 ], [ 2, 2, 0, 1, 2 ], [ 1, 0, 1, 1, 1 ], [ 1, 2, 1, 1, 1 ], [ 1, 1, 2, 1, 0 ], [ 2, 1, 2, 2, 2 ], [ 0, 2, 1, 1, 1 ], [ 2, 0, 1, 1, 1 ], [ 1, 1, 1, 2, 0 ], [ 1, 1, 1, 0, 2 ], [ 1, 1, 1, 1, 0 ] ]
      };
      GameConfig.SMID = {
        1: "sm2003",
        2: "sm2004",
        3: "sm2005",
        4: "sm2002",
        5: "sm2001",
        6: "sm2006",
        7: "sm2007",
        8: "sm2008"
      };
      return GameConfig;
    }();
    exports.default = GameConfig;
    cc._RF.pop();
  }, {} ],
  GameDefine: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c6926SdoZlB9JB+QR/dFKGc", "GameDefine");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  GameScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a56c9oArvRLpKUSqfmJzbIc", "GameScene");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var GameScene = function(_super) {
      __extends(GameScene, _super);
      function GameScene() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.center = null;
        _this.bigBg = null;
        _this.btnMini = null;
        return _this;
      }
      GameScene.prototype.onLoad = function() {
        this.initState();
      };
      GameScene.prototype.onOpen = function() {
        var _this = this;
        var _a = this, bigBg = _a.bigBg, btnMini = _a.btnMini;
        bigBg.node.runAction(cc.sequence([ cc.moveBy(.5, cc.v2(0, bigBg.node.height * (1 === game.data.deviceKind ? 1.5 : 1.2))).easing(cc.easeSineOut()), cc.callFunc(function() {
          var slotController = view.screen.slot.SlotController;
          (0 == slotController.autoSpinTimes || !slotController.bonus && slotController.autoSpinTimes < 0) && view.bar.bottom.gameBar.updateSpinFrame(define.type.SpinButton.normal);
        }), cc.callFunc(function() {
          return __awaiter(_this, void 0, void 0, function() {
            return __generator(this, function(_a) {
              view.screen.slot.SlotController.startSlot();
              view.screen.slot.SlotNode.runAction(cc.fadeIn(.5));
              view.multi.loadContent();
              view.screen.slot.SlotController.showContent();
              return [ 2 ];
            });
          });
        }) ]));
        btnMini.node.active || (btnMini.node.active = true);
        btnMini.node.scale = 0;
        btnMini.node.runAction(effect.bouceIn({
          time: .2
        }));
      };
      GameScene.prototype.onResume = function() {
        var multi = view.multi;
        util.game.showNode(this.node, define.zIndex.GAME);
        util.game.showNode(view.screen.slot.SlotNode);
        this.node.position = cc.v2(multi.node.x, multi.node.y + multi.content.height);
        this.node.scale = 0;
        this.node.runAction(cc.scaleTo(.2, 1).easing(cc.easeIn(.6)));
        this.node.runAction(cc.moveTo(.2, cc.v2(0, 0)));
        this.btnMini.node.scale = 0;
        this.btnMini.node.runAction(effect.bouceIn({
          time: .2
        }));
      };
      GameScene.prototype.onClose = function() {
        var _this = this;
        if (!view.screen.slot) {
          cc.warn("GameScene", "onClose", "Slot is null");
          return;
        }
        return new Promise(function(res, rej) {
          _this.btnMini.node.runAction(effect.bouceOut({
            time: .2
          }));
          view.screen.slot.SlotController.animationController.stopAllAction();
          view.screen.slot.SlotNode.runAction(cc.sequence(cc.fadeOut(.5), cc.callFunc(function() {
            _this.hideBg();
            controller.ui.updateBar();
          }), cc.delayTime(.75), cc.callFunc(function() {
            util.game.hideNode(_this.node);
            _this.node.position = cc.v2(cc.winSize.width, 0);
            view.screen.slot.SlotNode.destroy();
            view.screen.slot = null;
            view.multi.loadContent();
            res();
          })));
        });
      };
      GameScene.prototype.initState = function() {
        this.center.active = true;
        this.btnMini = this.node.getChildByName("minimize-game").getComponent(cc.Button);
        this.btnMini.node.zIndex = 1;
      };
      GameScene.prototype.loadBgSlot = function(id) {
        cc.log("load bg");
        var slotScene = view.slot[id];
        this.bigBg.node.active = false;
        this.bigBg.node.y = -this.bigBg.node.height * (1 === game.data.deviceKind ? 1.5 : 1.2);
        this.bigBg.node.active = true;
        this.bigBg.spriteFrame = slotScene.SlotController.resourceController.getSprite("bg-big");
      };
      GameScene.prototype.hideBg = function(time) {
        void 0 === time && (time = .5);
        this.bigBg.node.runAction(cc.moveBy(time, cc.v2(0, -this.bigBg.node.height * (1 === game.data.deviceKind ? 1.5 : 1.2))).easing(cc.easeSineIn()));
      };
      GameScene.prototype.onClickSpin = function() {
        view.screen.slot.SlotController.clickSpin();
      };
      GameScene.prototype.onClickMinimize = function() {
        controller.ui.minimizeGameScene();
      };
      GameScene.prototype.onClickBack = function() {
        controller.ui.deleteSlot();
      };
      __decorate([ property(cc.Node) ], GameScene.prototype, "center", void 0);
      __decorate([ property(cc.Sprite) ], GameScene.prototype, "bigBg", void 0);
      GameScene = __decorate([ ccclass ], GameScene);
      return GameScene;
    }(cc.Component);
    exports.default = GameScene;
    cc._RF.pop();
  }, {} ],
  GameUtil: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "db2f28fnWxPGojlwcz9F8oR", "GameUtil");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineType_1 = require("../Define/DefineType");
    var DefineKey_1 = require("../Define/DefineKey");
    var PlatformController_1 = require("../Platform/PlatformController");
    var GameUtil = function() {
      function GameUtil() {}
      GameUtil.generateUUID = function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          var r = 16 * Math.random() | 0, v = "x" == c ? r : 3 & r | 8;
          return v.toString(16);
        });
      };
      GameUtil.getDeviceOS = function() {
        var _deviceOs = DefineType_1.DEVICE_OS.UNKNOW;
        _deviceOs = cc.sys.isMobile && cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS ? DefineType_1.DEVICE_OS.IOS_NAVITE : cc.sys.isMobile && cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID ? DefineType_1.DEVICE_OS.ANDROID_NAVITE : cc.sys.isMobile && cc.sys.isBrowser ? DefineType_1.DEVICE_OS.WEB_MOBILE : !cc.sys.isMobile && cc.sys.isBrowser ? DefineType_1.DEVICE_OS.WEB_PC : DefineType_1.DEVICE_OS.UNKNOW;
        _deviceOs === DefineType_1.DEVICE_OS.UNKNOW && (cc.sys.isNative && cc.sys.os === cc.sys.OS_OSX ? _deviceOs = DefineType_1.DEVICE_OS.WEB_PC : cc.sys.isNative && (_deviceOs = DefineType_1.DEVICE_OS.ANDROID_NAVITE));
        game.data.deviceOs = _deviceOs;
        game.data.deviceOsName = DefineType_1.DEVICE_OS[_deviceOs];
        _deviceOs === DefineType_1.DEVICE_OS.IOS_NAVITE ? game.data.gameOS = DefineType_1.GAME_OS.IOS_COCOS : _deviceOs === DefineType_1.DEVICE_OS.ANDROID_NAVITE ? game.data.gameOS = DefineType_1.GAME_OS.ANDROID_COCOS : _deviceOs !== DefineType_1.DEVICE_OS.WEB_MOBILE && _deviceOs !== DefineType_1.DEVICE_OS.WEB_PC || (game.data.gameOS = DefineType_1.GAME_OS.WEB_COCOS);
        return _deviceOs;
      };
      GameUtil.loadRes = function(path, type) {
        void 0 === type && (type = null);
        return new Promise(function(res, rej) {
          cc.loader.loadRes(path, type, function(err, data) {
            if (err) return rej(err);
            res(data);
          });
        });
      };
      GameUtil.showNode = function(node, zIndex) {
        node.opacity = 255;
        node.zIndex = zIndex || 1;
      };
      GameUtil.hideNode = function(node) {
        node.zIndex = -1;
        node.opacity = 0;
      };
      GameUtil.delay = function(time, target, callback) {
        var canvas = cc.find("Main");
        var temp = false;
        target instanceof cc.Node && (temp = true);
        return new Promise(function(res, rej) {
          canvas.runAction(cc.sequence([ cc.delayTime(time / 1e3), cc.callFunc(function() {
            if (temp && (!target || !target.isValid)) return rej("Node was detroyed before");
            callback && callback();
            return res();
          }) ]));
        });
      };
      GameUtil.abbreviateNumber = function(num, fixed) {
        if (null === num || "undefined" === typeof num) return null;
        if (0 === num) return "0";
        fixed = !fixed || fixed < 0 ? 0 : fixed;
        var b = num.toPrecision(2).split("e");
        var k = 1 === b.length ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3);
        var c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, 3 * k)).toFixed(1 + fixed);
        var d = (c < 0 ? c : Math.abs(c)) + [ "", "K", "M", "B", "T" ][k];
        return d;
      };
      GameUtil.getDefaultImage = function(name) {
        return name.includes(".png") || name.includes(".jpg") ? name : name + ".png";
      };
      GameUtil.date = function(time) {
        return void 0 !== time ? new Date(new Date(time).getTime() - game.data.dTime) : new Date(new Date().getTime() - game.data.dTime);
      };
      GameUtil.timeToNextday = function() {
        var today = GameUtil.date();
        var nday = GameUtil.date();
        nday.setUTCDate(today.getDate() + 1);
        nday.setUTCHours(0, 0, 0, 0);
        return nday.getTime() - today.getTime();
      };
      GameUtil.restartGame = function() {
        cc.sys.isNative && cc.sys.localStorage.setItem(DefineKey_1.local.PLATFORM_INIT, PlatformController_1.default.ins().inited);
        cc.game.restart();
      };
      GameUtil.loadTextTure = function(url, callback) {
        var input = -1 == url.indexOf(".png") ? {
          url: url,
          type: "png"
        } : url;
        cc.loader.load(input, function(err, tex) {
          if (err) {
            game.error("util.game", "load texture error", url, err);
            return;
          }
          callback({
            texture: tex
          });
        }.bind(this));
      };
      GameUtil.loadSpriteFrame = function(url, callback) {
        this.loadTextTure(url, function(data) {
          var spriteFrame = new cc.SpriteFrame(data.texture);
          callback({
            spriteFrame: spriteFrame
          });
        }.bind(this));
      };
      return GameUtil;
    }();
    exports.default = GameUtil;
    cc._RF.pop();
  }, {
    "../Define/DefineKey": "DefineKey",
    "../Define/DefineType": "DefineType",
    "../Platform/PlatformController": "PlatformController"
  } ],
  HomeScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6ff7cpxeexOW4heej6ansRg", "HomeScene");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var HomeScene = function(_super) {
      __extends(HomeScene, _super);
      function HomeScene() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listGameView = null;
        _this.itemGame = null;
        _this.itemBanner = null;
        _this.animationclip = null;
        _this.btnMenu = null;
        _this.banner = null;
        return _this;
      }
      HomeScene.prototype.onLoad = function() {};
      HomeScene.prototype.start = function() {
        this.onOpen();
        this.initialize();
      };
      HomeScene.prototype.initialize = function() {
        this.initItem();
        this.initBanner();
      };
      HomeScene.prototype.initBanner = function() {
        var _this = this;
        var bannerData = [ {
          spriteFrame: controller.ui.slot[1].img,
          id: 2
        }, {
          spriteFrame: controller.ui.slot[3].img,
          id: 4
        }, {
          spriteFrame: controller.ui.slot[4].img,
          id: 5
        }, {
          spriteFrame: controller.ui.slot[5].img,
          id: 6
        } ];
        this.banner.removeAllPages();
        bannerData.forEach(function(o) {
          var banner = cc.instantiate(_this.itemBanner);
          var sp = banner.getComponent(cc.Sprite);
          sp.spriteFrame = o.spriteFrame;
          banner.on(cc.Node.EventType.TOUCH_END, function() {
            controller.ui.openGame(o.id, config.game.SMID[o.id]);
          });
          _this.banner.addPage(banner);
        });
        this.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(3), cc.callFunc(function() {
          var banner = _this.banner;
          if (!banner) return;
          var index = banner.getCurrentPageIndex();
          var numPage = banner.getPages().length;
          var nIndex = index + 1 < numPage ? index + 1 : 0;
          banner.scrollToPage(nIndex, 1);
        }))));
      };
      HomeScene.prototype.initItem = function() {
        var _this = this;
        controller.ui.slot.forEach(function(o, i) {
          var itemGame = cc.instantiate(_this.itemGame);
          itemGame.parent = _this.listGameView.content;
          itemGame.height = 390;
          itemGame.active = true;
          itemGame.getComponent("ItemGame").setData(++i, o.img);
          itemGame.scale = 0;
          itemGame.runAction(cc.sequence(cc.delayTime(.2 * i), effect.bouceIn({
            time: .2,
            pScale: .7
          })));
        });
      };
      HomeScene.prototype.onOpen = function() {
        this.btnMenu.node.runAction(effect.bouceIn({
          time: .2
        }));
        this.banner.node.runAction(effect.bouceIn({
          time: .3
        }));
      };
      HomeScene.prototype.openSlot = function(e) {
        return __awaiter(this, void 0, void 0, function() {
          var slotIcon, id, smid;
          return __generator(this, function(_a) {
            slotIcon = e.target.getComponent("ItemGame");
            id = slotIcon.id;
            smid = slotIcon.smid;
            controller.ui.openGame(slotIcon, id, smid);
            return [ 2 ];
          });
        });
      };
      HomeScene.prototype.onClickMenu = function() {
        game.log("HomeScene", "onClickMenu");
      };
      __decorate([ property(cc.ScrollView) ], HomeScene.prototype, "listGameView", void 0);
      __decorate([ property(cc.Node) ], HomeScene.prototype, "itemGame", void 0);
      __decorate([ property(cc.Node) ], HomeScene.prototype, "itemBanner", void 0);
      __decorate([ property(cc.AnimationClip) ], HomeScene.prototype, "animationclip", void 0);
      __decorate([ property(cc.Button) ], HomeScene.prototype, "btnMenu", void 0);
      __decorate([ property(cc.PageView) ], HomeScene.prototype, "banner", void 0);
      HomeScene = __decorate([ ccclass ], HomeScene);
      return HomeScene;
    }(cc.Component);
    exports.default = HomeScene;
    cc._RF.pop();
  }, {} ],
  IOSAdmob: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ae575VjQOFE5K59O3P3dbrP", "IOSAdmob");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var IOSAdmob = function() {
      function IOSAdmob() {
        this.tag = "IOSAdmob";
        this.isBannerShow = false;
      }
      IOSAdmob.getIns = function() {
        this.intance || (this.intance = new IOSAdmob());
        return this.intance;
      };
      IOSAdmob.prototype.init = function() {
        game.log(this.tag, "admob", "init");
        var plugin = sdkbox.PluginAdMob;
        plugin.setListener({
          adViewDidReceiveAd: function(name) {
            IOSAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.DIDRECEIVEAD,
              name: name
            });
          },
          adViewDidFailToReceiveAdWithError: function(name, msg) {
            IOSAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.DIDFAILTORECEIVEADWITHERROR,
              name: name,
              msg: msg
            });
          },
          adViewWillPresentScreen: function(name) {
            IOSAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.WILLPRESENTSCREEN,
              name: name
            });
          },
          adViewDidDismissScreen: function(name) {
            IOSAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.DIDDISMISSSCREEN,
              name: name
            });
          },
          adViewWillDismissScreen: function(name) {
            IOSAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.WILLDISMISSSCREEN,
              name: name
            });
          },
          adViewWillLeaveApplication: function(name) {
            IOSAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.WILLLEAVEAPPLICATION,
              name: name
            });
          },
          reward: function(name, currency, amount) {
            IOSAdmob.getIns().listenner({
              type: define.type.ADMOB_LISTENNER.REWARD,
              name: name,
              currency: currency,
              amount: amount
            });
          }
        });
        plugin.init();
      };
      IOSAdmob.prototype.cache = function() {
        game.log(this.tag, "admob", "cache");
        sdkbox.PluginAdMob.cache("banner");
        sdkbox.PluginAdMob.cache("interstitial");
        sdkbox.PluginAdMob.cache("rewarded");
      };
      IOSAdmob.prototype.showBanner = function() {
        game.log(this.tag, "admob", "show banner");
        sdkbox.PluginAdMob.show("banner");
        this.isBannerShow = true;
      };
      IOSAdmob.prototype.hideBanner = function() {
        game.log(this.tag, "admob", "hide banner");
        sdkbox.PluginAdMob.hide("banner");
        this.isBannerShow = false;
      };
      IOSAdmob.prototype.getBannerHeight = function() {
        var height = 0;
        this.isBannerShow && (height = sdkbox.PluginAdMob.getCurrBannerHeightInPixel("banner"));
        game.log(this.tag, "admob", "get banner banner height", height);
        return height;
      };
      IOSAdmob.prototype.getBannerWidth = function() {
        var width = sdkbox.PluginAdMob.getCurrBannerWidthInPixel("banner");
        game.log(this.tag, "admob", "get banner banner width", width);
        return width;
      };
      IOSAdmob.prototype.isShowBanner = function() {
        var isShow = this.isBannerShow;
        game.log(this.tag, "admob", "is show banner", isShow);
        return isShow;
      };
      IOSAdmob.prototype.isAvailableBanner = function() {
        var isAvai = sdkbox.PluginAdMob.isAvailable("banner");
        game.log(this.tag, "admob", "is avaiable banner", isAvai);
        return isAvai;
      };
      IOSAdmob.prototype.showInterstitial = function() {
        game.log(this.tag, "admob", "show interstitial");
        sdkbox.PluginAdMob.show("interstitial");
      };
      IOSAdmob.prototype.isAvailableInterstitial = function() {
        var isAvai = sdkbox.PluginAdMob.isAvailable("interstitial");
        game.log(this.tag, "admob", "is avaiable interstitial", isAvai);
        return isAvai;
      };
      IOSAdmob.prototype.showRewarded = function() {
        game.log(this.tag, "admob", "show rewarded");
        sdkbox.PluginAdMob.show("rewarded");
      };
      IOSAdmob.prototype.isAvailableRewarded = function() {
        var isAvai = sdkbox.PluginAdMob.isAvailable("rewarded");
        game.log(this.tag, "admob", "is avaiable rewarded", isAvai);
        return isAvai;
      };
      IOSAdmob.prototype.listenner = function(data) {
        if (!data) return;
        if (!data.name) return;
        "banner" === data.name ? this.bannerListenner(data) : "interstitial" === data.name ? this.interstitialListenner(data) : "rewarded" === data.name && this.rewardedListenner(data);
      };
      IOSAdmob.prototype.bannerListenner = function(data) {
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.ADMOB_LISTENNER.DIDRECEIVEAD:
          game.log(this.tag, "banner listenner", "DIDRECEIVEAD");
          break;

         case define.type.ADMOB_LISTENNER.DIDFAILTORECEIVEADWITHERROR:
          game.log(this.tag, "banner listenner", "DIDFAILTORECEIVEADWITHERROR");
          break;

         case define.type.ADMOB_LISTENNER.WILLPRESENTSCREEN:
          game.log(this.tag, "banner listenner", "WILLPRESENTSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.DIDDISMISSSCREEN:
          game.log(this.tag, "banner listenner", "DIDDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLDISMISSSCREEN:
          game.log(this.tag, "banner listenner", "WILLDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLLEAVEAPPLICATION:
          game.log(this.tag, "banner listenner", "WILLLEAVEAPPLICATION");
          break;

         case define.type.ADMOB_LISTENNER.REWARD:
          game.log(this.tag, "banner listenner", "REWARD");
          break;

         default:
          game.log(this.tag, "banner listenner", "UKNOW");
        }
      };
      IOSAdmob.prototype.interstitialListenner = function(data) {
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.ADMOB_LISTENNER.DIDRECEIVEAD:
          game.log(this.tag, "interstitial listenner", "DIDRECEIVEAD");
          break;

         case define.type.ADMOB_LISTENNER.DIDFAILTORECEIVEADWITHERROR:
          game.log(this.tag, "interstitial listenner", "DIDFAILTORECEIVEADWITHERROR");
          break;

         case define.type.ADMOB_LISTENNER.WILLPRESENTSCREEN:
          game.log(this.tag, "interstitial listenner", "WILLPRESENTSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.DIDDISMISSSCREEN:
          game.log(this.tag, "interstitial listenner", "DIDDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLDISMISSSCREEN:
          game.log(this.tag, "interstitial listenner", "WILLDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLLEAVEAPPLICATION:
          game.log(this.tag, "interstitial listenner", "WILLLEAVEAPPLICATION");
          break;

         case define.type.ADMOB_LISTENNER.REWARD:
          game.log(this.tag, "interstitial listenner", "REWARD");
          break;

         default:
          game.log(this.tag, "interstitial listenner", "UKNOW");
        }
      };
      IOSAdmob.prototype.rewardedListenner = function(data) {
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.ADMOB_LISTENNER.DIDRECEIVEAD:
          game.log(this.tag, "rewarded listenner", "DIDRECEIVEAD");
          break;

         case define.type.ADMOB_LISTENNER.DIDFAILTORECEIVEADWITHERROR:
          game.log(this.tag, "rewarded listenner", "DIDFAILTORECEIVEADWITHERROR");
          break;

         case define.type.ADMOB_LISTENNER.WILLPRESENTSCREEN:
          game.log(this.tag, "rewarded listenner", "WILLPRESENTSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.DIDDISMISSSCREEN:
          game.log(this.tag, "rewarded listenner", "DIDDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLDISMISSSCREEN:
          game.log(this.tag, "rewarded listenner", "WILLDISMISSSCREEN");
          break;

         case define.type.ADMOB_LISTENNER.WILLLEAVEAPPLICATION:
          game.log(this.tag, "rewarded listenner", "WILLLEAVEAPPLICATION");
          break;

         case define.type.ADMOB_LISTENNER.REWARD:
          game.log(this.tag, "rewarded listenner", "REWARD");
          break;

         default:
          game.log(this.tag, "rewarded listenner", "UKNOW");
        }
      };
      IOSAdmob.intance = null;
      return IOSAdmob;
    }();
    exports.default = IOSAdmob;
    cc._RF.pop();
  }, {} ],
  IOSFacebook: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "279e09E1HlOc4wpBvf2crKy", "IOSFacebook");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var IOSFacebook = function() {
      function IOSFacebook() {
        this.tag = "IOSFacebook";
        this.loginCallback = void 0;
      }
      IOSFacebook.getIns = function() {
        this.intance || (this.intance = new IOSFacebook());
        return this.intance;
      };
      IOSFacebook.prototype.init = function() {
        game.log(this.tag, "facebook", "init");
        if (!sdkbox) return false;
        if (!sdkbox.PluginFacebook) return false;
        sdkbox.PluginFacebook.setListener({
          onLogin: function(isLogin, msg) {
            IOSFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.LOGIN,
              isLogin: isLogin,
              msg: msg
            });
          },
          onAPI: function(tag, data) {
            IOSFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.API,
              tag: tag,
              data: data
            });
          },
          onSharedSuccess: function(data) {
            IOSFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.SHARED_SUCCESS,
              data: data
            });
          },
          onSharedFailed: function(data) {
            IOSFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.SHARED_FAILED,
              data: data
            });
          },
          onSharedCancel: function() {
            IOSFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.SHARED_CANCEL
            });
          },
          onPermission: function(isLogin, msg) {
            IOSFacebook.getIns().listenner({
              type: define.type.FACEBOOK_LISTENNER.PERMISSON,
              isLogin: isLogin,
              msg: msg
            });
          }
        });
        sdkbox.PluginFacebook.init();
        return true;
      };
      IOSFacebook.prototype.login = function() {
        var _this = this;
        game.log(this.tag, "facebook", "login");
        tracking.send(tracking.event.FACEBOOK_LOGIN_CLICK);
        return new Promise(function(res, rej) {
          if (sdkbox && sdkbox.PluginFacebook) {
            sdkbox.PluginFacebook.requestReadPermissions([ "public_profile", "email" ]);
            sdkbox.PluginFacebook.login();
          } else {
            game.log(_this.tag, "login facebook: sdkbox or plugin null");
            rej();
          }
          _this.loginCallback = function() {
            res(platform.facebook.getAccessToken());
          };
        });
      };
      IOSFacebook.prototype.logout = function() {
        game.log(this.tag, "facebook", "logout");
        sdkbox && sdkbox.PluginFacebook ? sdkbox.PluginFacebook.logout() : game.log("login facebook: sdkbox or plugin null");
      };
      IOSFacebook.prototype.isLoggedIn = function() {
        if (sdkbox && sdkbox.PluginFacebook) {
          var isLoggedIn = sdkbox.PluginFacebook.isLoggedIn();
          game.log(this.tag, "facebook", "is loggedin", isLoggedIn);
          return isLoggedIn;
        }
        game.log("login facebook: sdkbox or plugin null");
      };
      IOSFacebook.prototype.getUserID = function() {
        if (sdkbox && sdkbox.PluginFacebook) {
          var userId = sdkbox.PluginFacebook.getUserID();
          game.log(this.tag, "facebook", "userId: ", userId);
          return userId;
        }
        game.log("login facebook: sdkbox or plugin null");
      };
      IOSFacebook.prototype.getAccessToken = function() {
        if (sdkbox && sdkbox.PluginFacebook) {
          var tokken = sdkbox.PluginFacebook.getAccessToken();
          game.log(this.tag, "facebook", "userId: ", tokken);
          return tokken;
        }
        game.log("login facebook: sdkbox or plugin null");
      };
      IOSFacebook.prototype.shareHandle = function(option) {
        if (!option) return;
        if (!option.type) return;
        game.log(this.tag, "facebook", "share handle", option);
        tracking.send(tracking.event.FACEBOOK_SHARE_CLICK);
        var info = option;
        sdkbox.PluginFacebook.dialog(info);
      };
      IOSFacebook.prototype.share = function(option) {
        if (!option) return;
        this.shareHandle(__assign({
          type: "link"
        }, option));
      };
      IOSFacebook.prototype.sharePhoto = function(option) {
        if (!option) return;
        this.shareHandle(__assign({
          type: "photo"
        }, option));
      };
      IOSFacebook.prototype.sendLogEvent = function(eventName, valueToSum) {
        game.log(this.tag, "facebook", "send log event", eventName, valueToSum);
        "undefined" === typeof valueToSum ? sdkbox.PluginFacebook.logEvent(eventName) : sdkbox.PluginFacebook.logEvent(eventName, valueToSum);
      };
      IOSFacebook.prototype.sendLogPurchase = function(mount, currency) {
        game.log(this.tag, "facebook", "send log purchase", mount, currency);
        sdkbox.PluginFacebook.logPurchase(mount, currency);
      };
      IOSFacebook.prototype.openGroup = function() {
        game.warn(this.tag, "openGroup method not implemented.");
      };
      IOSFacebook.prototype.openFanpage = function() {
        game.warn(this.tag, "openFanpage method not implemented.");
      };
      IOSFacebook.prototype.listenner = function(data) {
        var _this = this;
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.FACEBOOK_LISTENNER.LOGIN:
          game.log(this.tag, "facebook listenner", "LOGIN", "isLogin: " + data.isLogin + " - msg: " + data.msg);
          var strLoginData = cc.sys.localStorage.getItem(define.key.local.LOGIN_DATA.replace("IP", api.HOST)) || JSON.stringify({
            expires: void 0,
            token: "",
            type: 0,
            uid: 0
          });
          var loginData = JSON.parse(strLoginData);
          game.log("IOSFacebook", "listenner", JSON.stringify(loginData));
          loginData.type !== define.type.LOGIN_TYPE.FACEBOOK ? api.sendGD({
            e: "connectFB",
            accessToken: platform.facebook.getAccessToken()
          }, function(err, data) {
            game.log("IOSFacebook", "send connect facebook", JSON.stringify(err), JSON.stringify(data));
            if (err) return game.error(err);
            var setNewLoginData = function(cb) {
              api.getToken({
                type: define.type.LOGIN_TYPE.FACEBOOK,
                data: platform.facebook.getAccessToken()
              }).then(function(data) {
                var loginData = {
                  expires: data.expires,
                  token: data.token,
                  type: define.type.LOGIN_TYPE.FACEBOOK,
                  uid: data.uid
                };
                cc.sys.localStorage.setItem(define.key.local.LOGIN_DATA.replace("IP", api.HOST), JSON.stringify(loginData));
                cb && cb();
              });
            };
            switch (data.code) {
             case 402:
              game.log(_this.tag, "Login FB success", "need merge facebook", data);
              controller.ui.showDialog({
                title: "Account already exists",
                name: "facebook_accout_exists",
                message: {
                  message: data.message
                },
                buttons: [ {
                  title: "Cancel",
                  theme: define.type.CLASS_THEME.DANGER
                }, {
                  title: "OK",
                  theme: define.type.CLASS_THEME.SUCCESS,
                  callback: function() {
                    api.sendGD({
                      e: "confirmMergeFB",
                      uid: game.user.id
                    }, function(err, data) {
                      if (err) return game.error(err);
                      if ("success" === data) {
                        game.log(_this.tag, "Login FB success", "merge facebook success");
                        setNewLoginData(function() {
                          cc.game.restart();
                        });
                      } else game.error("Cai nay chua lam");
                    });
                  }
                }, {
                  title: "Another\nAccount",
                  theme: define.type.CLASS_THEME.SUCCESS,
                  callback: function() {
                    _this.logout();
                    _this.login();
                  }
                } ]
              });
              break;

             case 401:
              game.log(_this.tag, "Login FB success", "facebook loged");
              controller.ui.showDialog({
                title: "Alert",
                name: "facebook_accout_logged",
                message: {
                  message: "Your account has been logged on this device"
                },
                buttons: [ {
                  title: "Confirm",
                  theme: define.type.CLASS_THEME.DANGER
                } ]
              });
              break;

             default:
              controller.ui.showDialog({
                title: "Messaage",
                name: "facebook_success",
                message: {
                  message: "Loggin facebook success"
                },
                buttons: [ {
                  title: "OK",
                  theme: define.type.CLASS_THEME.SUCCESS
                } ]
              });
              setNewLoginData(function() {
                _this.loginCallback && _this.loginCallback();
              });
              game.user.fbid = platform.facebook.getUserID();
              store.emit(store.key.UPDATE_USER_AVATAR, "");
            }
          }) : this.loginCallback && this.loginCallback();
          break;

         case define.type.FACEBOOK_LISTENNER.API:
          game.log(this.tag, "facebook listenner", "API", "tag: " + data.tag + " - data: " + data.data);
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_SUCCESS:
          game.log(this.tag, "facebook listenner", "SHARED_SUCCESS", "data: " + data.data);
          tracking.send(tracking.event.FACEBOOK_SHARE_SUCCESS);
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_FAILED:
          game.log(this.tag, "facebook listenner", "SHARED_FAILED", "data: " + data.data);
          tracking.send(tracking.event.FACEBOOK_SHARE_FAILED);
          if (!platform.handle.checkAppInstall("com.facebook.katana ")) {
            this.listenner({
              type: define.type.FACEBOOK_LISTENNER.FACEBOOK_NOT_INSTALL
            });
            return;
          }
          controller.ui.showDialog({
            title: "Message",
            type: define.type.DIALOG_TYPE.NORMAL,
            name: "share_failed",
            message: {
              message: "Facebook shared failed"
            },
            buttons: [ {
              title: "Confirm",
              theme: define.type.CLASS_THEME.DANGER
            } ]
          });
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_CANCEL:
          game.log(this.tag, "facebook listenner", "SHARED_CANCEL");
          tracking.send(tracking.event.FACEBOOK_SHARE_CANCELED);
          break;

         case define.type.FACEBOOK_LISTENNER.PERMISSON:
          game.log(this.tag, "facebook listenner", "LOGIN", "isLogin: " + data.isLogin + " - msg: " + data.msg);
          break;

         case define.type.FACEBOOK_LISTENNER.FETCHFRIENDS:
          game.log(this.tag, "facebook listenner", "FETCHFRIENDS");
          break;

         case define.type.FACEBOOK_LISTENNER.REQUESTINVITABLEFRIENDS:
          game.log(this.tag, "facebook listenner", "REQUESTINVITABLEFRIENDS");
          break;

         case define.type.FACEBOOK_LISTENNER.INVITEFRIENDSWITHINVITEIDSRESULT:
          game.log(this.tag, "facebook listenner", "INVITEFRIENDSWITHINVITEIDSRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.INVITEFRIENDSRESULT:
          game.log(this.tag, "facebook listenner", "INVITEFRIENDSRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.GETUSERINFO:
          game.log(this.tag, "facebook listenner", "GETUSERINFO");
          break;

         case define.type.FACEBOOK_LISTENNER.REQUESTGIFTRESULT:
          game.log(this.tag, "facebook listenner", "REQUESTGIFTRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.SENDGIFTRESULT:
          game.log(this.tag, "facebook listenner", "SENDGIFTRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.FACEBOOK_NOT_INSTALL:
          game.log(this.tag, "facebook listenner", "FACEBOOK_NOT_INSTALL");
          controller.ui.showDialog({
            title: "Message",
            type: define.type.DIALOG_TYPE.NORMAL,
            name: "facebook_not_install",
            message: {
              message: "Facebook application has not been installed"
            },
            buttons: [ {
              title: "Confirm",
              theme: define.type.CLASS_THEME.DANGER
            } ]
          });
          break;

         default:
          game.log(this.tag, "facebook listenner", "UNKNOW");
        }
      };
      IOSFacebook.intance = null;
      return IOSFacebook;
    }();
    exports.default = IOSFacebook;
    cc._RF.pop();
  }, {} ],
  IOSFireBase: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9a238xr6fRAtbvrnqkW7T//", "IOSFireBase");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var IOSFirebase = function() {
      function IOSFirebase() {
        this.tag = "IOSFirebase";
      }
      IOSFirebase.getIns = function() {
        this.intance || (this.intance = new IOSFirebase());
        return this.intance;
      };
      IOSFirebase.prototype.init = function() {
        if (!sdkbox || !sdkbox.firebase) return false;
        game.log(this.tag, "firebase", "init");
        sdkbox.firebase.Analytics.init();
        return true;
      };
      IOSFirebase.prototype.sendLogEvent = function(event, params) {
        game.log(this.tag, "firebase", "send log event", event, params);
        sdkbox.firebase.Analytics.logEvent(event, params);
      };
      IOSFirebase.prototype.getVersion = function() {
        var ver = sdkbox.firebase.Analytics.getVersion();
        game.log(this.tag, "getVersion", ver);
        return ver;
      };
      IOSFirebase.prototype.setUserProperty = function(name, value) {
        game.log(this.tag, "setUserProperty", name, value);
        sdkbox.firebase.Analytics.setUserProperty(name, value);
      };
      IOSFirebase.prototype.setUserID = function(userID) {
        game.log(this.tag, "setUserID", userID);
        sdkbox.firebase.Analytics.setUserID(userID);
      };
      IOSFirebase.prototype.setScreenName = function(screen, screenClass) {
        game.log(this.tag, "setScreenName", screen, screenClass);
        sdkbox.firebase.Analytics.setScreenName(screen, screenClass);
      };
      IOSFirebase.prototype.resetAnalyticsData = function() {
        game.log(this.tag, "resetAnalyticsData");
        sdkbox.firebase.Analytics.resetAnalyticsData();
      };
      IOSFirebase.prototype.setAnalyticsCollectionEnabled = function(enabled) {
        game.log(this.tag, "setAnalyticsCollectionEnabled", enabled);
        sdkbox.firebase.Analytics.setAnalyticsCollectionEnabled(enabled);
      };
      IOSFirebase.intance = null;
      return IOSFirebase;
    }();
    exports.default = IOSFirebase;
    cc._RF.pop();
  }, {} ],
  IOSHandle: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "02159JFfgNJR7mOEBurfKit", "IOSHandle");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var IOSHandle = function() {
      function IOSHandle() {
        this.tag = "IOSHandle";
      }
      IOSHandle.getIns = function() {
        this.intance || (this.intance = new IOSHandle());
        return this.intance;
      };
      IOSHandle.prototype.showMessageBox = function(title, msg) {
        var res = jsb.reflection.callStaticMethod("PlatformHandle", "showMessageBox:andContent:", title, msg);
        game.log(this.tag, "handle", "show message box", res);
        return res;
      };
      IOSHandle.prototype.getDeviceId = function() {
        var res = jsb.reflection.callStaticMethod("PlatformHandle", "getDeviceId");
        game.log(this.tag, "handle", "get device id", res);
        return res;
      };
      IOSHandle.prototype.getPackageName = function() {
        var packageName = jsb.reflection.callStaticMethod("PlatformHandle", "getPackageName");
        game.log(this.tag, "handle", "get package name", packageName);
        return packageName;
      };
      IOSHandle.prototype.getVersionGame = function() {
        var version = jsb.reflection.callStaticMethod("PlatformHandle", "getVersionGame");
        game.log(this.tag, "handle", "get version game", version);
        return version;
      };
      IOSHandle.prototype.getCountryCode = function() {
        var code = jsb.reflection.callStaticMethod("PlatformHandle", "getCountryCode");
        game.log(this.tag, "handle", "get country code", code);
        "string" === typeof code && (code = code.toLowerCase());
        return code;
      };
      IOSHandle.prototype.getOSVersion = function() {
        var version = jsb.reflection.callStaticMethod("PlatformHandle", "getOSVersion");
        game.log(this.tag, "handle", "get os version", version);
        return version;
      };
      IOSHandle.prototype.isConnecting = function() {
        var isConnect = jsb.reflection.callStaticMethod("PlatformHandle", "isConnecting");
        game.log(this.tag, "handle", "is connecting", isConnect);
        return isConnect;
      };
      IOSHandle.prototype.checkAppInstall = function(pkg) {
        var installed = jsb.reflection.callStaticMethod("PlatformHandle", "checkAppInstall:", pkg);
        game.log(this.tag, "handle", "check app installed", installed);
        return installed;
      };
      IOSHandle.prototype.setWakeLock = function(req) {
        jsb.reflection.callStaticMethod("PlatformHandle", "setWakeLock:", req);
        game.log(this.tag, "handle", "check set wakelock");
      };
      IOSHandle.prototype.openLink = function(url) {
        url && "string" === typeof url ? cc.sys.openURL(url) : game.error(this.tag, "handle", "url is not useable");
      };
      IOSHandle.prototype.screenshot = function() {
        var node = new cc.Node();
        node.parent = cc.director.getScene();
        node.x = .5 * cc.winSize.width;
        node.y = .5 * cc.winSize.height;
        var camera = node.addComponent(cc.Camera);
        camera.cullingMask = 4294967295;
        var texture = new cc.RenderTexture();
        var gl = cc.game._renderContext;
        texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, gl.STENCIL_INDEX8);
        camera.targetTexture = texture;
        camera.render();
        var data = texture.readPixels();
        var rowBytes = 4 * texture.width;
        var bytes = new Uint8Array(data.length);
        for (var row = 0; row < texture.height; row++) {
          var srow = texture.height - 1 - row;
          var start = srow * texture.width * 4;
          for (var i = 0; i < rowBytes; i++) bytes[row * rowBytes + i] = data[start + i];
        }
        var filePath = platform.handle.getWritablePath("screenshot.png");
        platform.handle.saveImageData({
          data: bytes,
          width: texture.width,
          height: texture.height,
          filePath: filePath
        });
        node.destroy();
        game.log(this.tag, "screenshot", "save in path", filePath);
        return {
          texture: texture,
          path: filePath
        };
      };
      IOSHandle.prototype.getWritablePath = function(suffix) {
        if ("string" !== typeof suffix) {
          game.warn(this.tag, "getWritablePath", "suffix error", suffix);
          return;
        }
        return jsb.fileUtils.getWritablePath() + suffix;
      };
      IOSHandle.prototype.saveImageData = function(option) {
        option = option || {};
        if ("undefined" === typeof option.data || "number" !== typeof option.width || "number" !== typeof option.height || "string" !== typeof option.filePath) {
          game.warn(this.tag, "saveImageData", "input error", option);
          return;
        }
        jsb.saveImageData(option.data, option.width, option.height, option.filePath);
      };
      IOSHandle.intance = null;
      return IOSHandle;
    }();
    exports.default = IOSHandle;
    cc._RF.pop();
  }, {} ],
  IOSIap: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d6dafeWCdVJS5j0GJjMgvKe", "IOSIap");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var IOSIap = function() {
      function IOSIap() {
        this.tag = "IOSIap";
        this.listenner = {
          onInitialized: function(success) {
            game.log("platform.iap", "iap listenner", "on initialized", "success: " + success);
          },
          onSuccess: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_SUCCESS, this.itemBuying);
            tracking.purchase(product.id, product.priceValue);
            game.log("platform.iap", "iap listenner", "on success", "product: " + product);
          },
          onFailure: function(product, msg) {
            tracking.send(tracking.event.IAP_PURCHASE_FAILED);
            game.error("platform.iap", "iap listenner", "on failure", "product: " + product + " - msg: " + msg);
          },
          onCanceled: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_CANCELED);
            game.warn("platform.iap", "iap listenner", "on canceled", "product: " + product);
          },
          onRestored: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_RESTORED);
            game.log("platform.iap", "iap listenner", "on restored", "product: " + product);
          },
          onRestoreComplete: function(ok, msg) {
            tracking.send(tracking.event.IAP_PURCHASE_RESTOR_COMPLETED);
            game.log("platform.iap", "iap listenner", "on restore complete", "ok: " + ok + " - msg: " + msg);
          },
          onProductRequestSuccess: function(products) {
            game.log("platform.iap", "iap listenner", "on product request success", "product: " + products);
            for (var i = 0; i < products.length; i++) ;
          },
          onProductRequestFailure: function(msg) {
            game.log("platform.iap", "iap listenner", "on product request failure", "msg: " + msg);
          },
          onShouldAddStorePayment: function(productName) {
            game.log("platform.iap", "iap listenner", "on should add store payment", "productName: " + productName);
          },
          onFetchStorePromotionOrder: function(productNames, error) {
            game.log("platform.iap", "iap listenner", "on fetch store promotion order", "productNames: " + productNames + " - error: " + error);
          },
          onFetchStorePromotionVisibility: function(productName, visibility, error) {
            game.log("platform.iap", "iap listenner", "on fetch store promotion visibility", "productName: " + productName + " - visibility: " + visibility + " - error: " + error);
          },
          onUpdateStorePromotionOrder: function(error) {
            game.log("platform.iap", "iap listenner", "on update store promotion order", "error: " + error);
          },
          onUpdateStorePromotionVisibility: function(error) {
            game.log("platform.iap", "iap listenner", "on update store promotion visibility", "error: " + error);
          },
          onPurchaseHistory: function(purchases) {
            game.log("platform.iap", "iap listenner", "on purchase history", "purchase: " + purchases);
          },
          onConsumed: function(p, error) {
            game.log("platform.iap", "iap listenner", "on consumed", "p: " + p + " - error: " + error);
          },
          onDeferred: function(p) {
            game.log("platform.iap", "iap listenner", "on deferred", "p: " + p);
          }
        };
      }
      IOSIap.getIns = function() {
        this.intance || (this.intance = new IOSIap());
        return this.intance;
      };
      IOSIap.prototype.init = function() {
        game.log(this.tag, "iap", "init");
        var plugin = sdkbox.IAP;
        plugin.setListener(this.listenner);
        plugin.init();
        plugin.enableUserSideVerification();
      };
      IOSIap.prototype.setDebug = function(debug) {
        game.log(this.tag, "iap", "set debug");
        sdkbox.IAP.setDebug(debug);
      };
      IOSIap.prototype.purchase = function(name) {
        tracking.send(tracking.event.IAP_PURCHASE_CLICK, {
          pack: name
        });
        config.setup["testIAP"] && this.purchaseTest(name);
        game.log(this.tag, "iap", "purchase");
        sdkbox.IAP.purchase(name);
      };
      IOSIap.prototype.purchaseByProductID = function(productID) {
        var item = Object.values(define.key.iap.ios).find(function(o) {
          return o.id == productID;
        });
        item ? this.purchase(item.name) : game.warn(this.tag, "purchaseByProductID", "item wasn't defined");
      };
      IOSIap.prototype.purchaseTest = function(name) {
        var _this = this;
        var item = Object.values(define.key.iap.web).find(function(o) {
          return o.name == name;
        });
        if (!item) return game.warn(this.tag, "purchaseByProductID", "item wasn't defined");
        api.sendGD({
          e: "deleteReceipt",
          orderId: JSON.parse(item.test["receipt"]).orderId
        }, function(err, data) {
          game.log(err, data);
          _this.listenner.onSuccess(item.test);
        });
      };
      IOSIap.prototype.refresh = function() {
        game.log(this.tag, "iap", "refresh");
        sdkbox.IAP.refresh();
      };
      IOSIap.prototype.restore = function() {
        game.log(this.tag, "iap", "restore");
        sdkbox.IAP.restore();
      };
      IOSIap.prototype.removeListener = function() {
        game.log(this.tag, "iap", "remove listener");
        sdkbox.IAP.removeListener();
      };
      IOSIap.prototype.enableUserSideVerification = function() {
        game.log(this.tag, "iap", "enable user side verification");
        sdkbox.IAP.enableUserSideVerification();
      };
      IOSIap.prototype.isAutoFinishTransaction = function() {
        game.log(this.tag, "iap", "is auto finish transaction");
        return sdkbox.IAP.isAutoFinishTransaction();
      };
      IOSIap.prototype.setAutoFinishTransaction = function(b) {
        game.log(this.tag, "iap", "set auto finish transaction");
        sdkbox.IAP.setAutoFinishTransaction(b);
      };
      IOSIap.prototype.finishTransaction = function(productid) {
        game.log(this.tag, "iap", "finish transaction", "productid: " + productid);
        sdkbox.IAP.finishTransaction(productid);
      };
      IOSIap.prototype.fetchStorePromotionOrder = function() {
        game.log(this.tag, "iap", "fetch store promotion order");
        sdkbox.IAP.fetchStorePromotionOrder();
      };
      IOSIap.prototype.updateStorePromotionOrder = function(productNames) {
        game.log(this.tag, "iap", "update store promotion order", "productNames: " + productNames);
        sdkbox.IAP.updateStorePromotionOrder(productNames);
      };
      IOSIap.prototype.fetchStorePromotionVisibility = function(productName) {
        game.log(this.tag, "iap", "fetchStore promotion visibility", "productNames: " + productName);
        sdkbox.IAP.fetchStorePromotionVisibility(productName);
      };
      IOSIap.prototype.updateStorePromotionVisibility = function(productName, visibility) {
        game.log(this.tag, "iap", "updateStore promotion visibility", "productNames: " + productName);
        sdkbox.IAP.updateStorePromotionVisibility(productName, visibility);
      };
      IOSIap.prototype.getPurchaseHistory = function() {
        game.log(this.tag, "iap", "get purchase history");
        sdkbox.IAP.getPurchaseHistory();
      };
      IOSIap.prototype.getInitializedErrMsg = function() {
        game.log(this.tag, "iap", "get initialized err msg");
        sdkbox.IAP.getInitializedErrMsg();
      };
      IOSIap.prototype.requestUpdateTransaction = function() {
        game.log(this.tag, "iap", "request update transaction");
        sdkbox.IAP.requestUpdateTransaction();
      };
      IOSIap.intance = null;
      return IOSIap;
    }();
    exports.default = IOSIap;
    cc._RF.pop();
  }, {} ],
  IOSOnesignal: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "94bbb56XClEJIBkoJgLrW3E", "IOSOnesignal");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var IOSOnesignal = function() {
      function IOSOnesignal() {
        this.tag = "IOSOnesignal";
      }
      IOSOnesignal.getIns = function() {
        this.intance || (this.intance = new IOSOnesignal());
        return this.intance;
      };
      IOSOnesignal.prototype.init = function() {
        game.log(this.tag, "onesignal", "init");
        var plugin = sdkbox.PluginOneSignal;
        plugin.setListener({
          onSendTag: function(success, key, message) {
            game.log("onesignal", "send tag", "success: " + success + " - key: " + key + " - message: " + message);
          },
          onGetTags: function(jsonString) {
            game.log("onesignal", "get tag", "jsonString: " + jsonString);
          },
          onIdsAvailable: function(userId, pushToken) {
            game.log("onesignal", "ids avaiable", "userId: " + userId + " - pushToken: " + pushToken);
          },
          onPostNotification: function(success, message) {
            game.log("onesignal", "on post notification", "success: " + success + " - message: " + message);
          },
          onNotification: function(isActive, message, additionalData) {
            game.log("onesignal", "on notification", "isActive: " + isActive + " - message: " + message + " - additionalData: " + additionalData);
          }
        });
        plugin.init();
      };
      IOSOnesignal.prototype.registerPushNotifications = function() {
        game.log(this.tag, "onesignal", "register push notification");
        sdkbox.PluginOneSignal.registerForPushNotifications();
      };
      IOSOnesignal.prototype.sendTag = function(key, value) {
        game.log(this.tag, "onesignal", "send tag", "key: " + key + " - value: " + value);
        sdkbox.PluginOneSignal.sendTag(key, value);
      };
      IOSOnesignal.prototype.getTags = function() {
        game.log(this.tag, "onesignal", "get tags");
        sdkbox.PluginOneSignal.getTags();
      };
      IOSOnesignal.prototype.deleteTag = function(key) {
        game.log(this.tag, "onesignal", "delete tag", "key: " + key);
        sdkbox.PluginOneSignal.deleteTag(key);
      };
      IOSOnesignal.prototype.setEmail = function(email) {
        game.log(this.tag, "onesignal", "set email", "email: " + email);
        sdkbox.PluginOneSignal.setEmail(email);
      };
      IOSOnesignal.prototype.idsAvailable = function() {
        game.log(this.tag, "onesignal", "ids avaiable");
        sdkbox.PluginOneSignal.idsAvailable();
      };
      IOSOnesignal.prototype.enableInAppAlertNotification = function(enable) {
        game.log(this.tag, "onesignal", "in app alert notification", "enable: " + enable);
        sdkbox.PluginOneSignal.enableInAppAlertNotification(enable);
      };
      IOSOnesignal.prototype.setSubscription = function(enable) {
        game.log(this.tag, "onesignal", "set subscription", "enable: " + enable);
        sdkbox.PluginOneSignal.setSubscription(enable);
      };
      IOSOnesignal.prototype.postNotification = function(jsonString) {
        game.log(this.tag, "onesignal", "post notification", "json: " + jsonString);
        sdkbox.PluginOneSignal.postNotification(jsonString);
      };
      IOSOnesignal.intance = null;
      return IOSOnesignal;
    }();
    exports.default = IOSOnesignal;
    cc._RF.pop();
  }, {} ],
  ImageScale: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "da9c5MQc85PTbxoX5CVhQIY", "ImageScale");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ImageScale = function(_super) {
      __extends(ImageScale, _super);
      function ImageScale() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      ImageScale.prototype.onLoad = function() {
        var realScreenSize = cc.view.getFrameSize();
        var realScreenRatio = realScreenSize.width / realScreenSize.height;
        var scaleRatio = this.node.width * realScreenSize.height / (this.node.height * realScreenSize.width);
        if (realScreenRatio < 1.5) {
          this.node.width *= scaleRatio;
          this.node.scaleY *= scaleRatio;
        }
        if (realScreenRatio > 2) {
          this.node.width /= scaleRatio;
          this.node.scaleY /= scaleRatio;
        }
      };
      ImageScale = __decorate([ ccclass ], ImageScale);
      return ImageScale;
    }(cc.Component);
    exports.default = ImageScale;
    cc._RF.pop();
  }, {} ],
  ItemAnimation: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "30e3dpNqI1BX68JHeVB7wO1", "ItemAnimation");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ItemAnimation = function(_super) {
      __extends(ItemAnimation, _super);
      function ItemAnimation() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.skeletonData = null;
        _this.animation = "";
        _this.loop = false;
        _this.autoRun = true;
        _this.fadeOut = true;
        _this.autoRelease = true;
        _this.timeOut = .5;
        _this.skeleton = null;
        _this.callback = null;
        return _this;
      }
      ItemAnimation.prototype.onLoad = function() {
        this.skeleton = this.node.getComponent(sp.Skeleton);
        this.node.active = false;
        this.updateSkeletonData();
        this.autoRun && this.skeletonData && this.animation && this.playSkeleton();
      };
      ItemAnimation.prototype.init = function(option) {
        return __awaiter(this, void 0, void 0, function() {
          var key;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              option = option || {};
              if (!option.skeletonData) {
                game.error("ItemAnimation", "init", "skeleton animation not have skeleton data");
                return [ 2 ];
              }
              option.animation = option.animation || "animation";
              "undefined" === typeof option.loop && (option.loop = false);
              "undefined" === typeof option.autoRun && (option.autoRun = true);
              "undefined" === typeof option.autoRelease && (option.autoRelease = true);
              "undefined" === typeof option.fadeOut && (option.fadeOut = true);
              "undefined" === typeof option.callback && (option.callback = null);
              for (key in option) option.hasOwnProperty(key) && (this[key] = option[key]);
              this.updateSkeletonData();
              if (!this.autoRun) return [ 3, 2 ];
              return [ 4, this.playSkeleton() ];

             case 1:
              _a.sent();
              _a.label = 2;

             case 2:
              return [ 2 ];
            }
          });
        });
      };
      ItemAnimation.prototype.updateSkeletonData = function() {
        this.skeleton.skeletonData = this.skeletonData;
        this.skeleton.animation = this.animation;
        this.skeleton.loop = this.loop;
        this.skeleton.node.scale = 0;
      };
      ItemAnimation.prototype.playSkeleton = function(option) {
        var _this = this;
        return new Promise(function(res, rej) {
          option = option || {};
          "string" === typeof option.animation && (_this.animation = option.animation);
          "boolean" === typeof option.loop && (_this.loop = option.loop);
          "boolean" === typeof option.autoRun && (_this.autoRun = option.autoRun);
          "boolean" === typeof option.autoRelease && (_this.autoRelease = option.autoRelease);
          "boolean" === typeof option.fadeOut && (_this.fadeOut = option.fadeOut);
          "function" === typeof option.callback && (_this.callback = option.callback);
          "number" === typeof option.timeOut && (_this.timeOut = option.timeOut);
          _this.node.active = true;
          _this.loop ? res() : _this.skeleton.setCompleteListener(function() {
            var _this = this;
            if (this.autoRelease) if (this.fadeOut) this.node.runAction(cc.sequence(cc.delayTime(this.timeOut), cc.fadeOut(.5), cc.callFunc(function() {
              _this && _this.node && _this.node.destroy();
              res();
            }))); else {
              this.node.destroy();
              res();
            } else res();
          }.bind(_this));
          _this.skeleton.setAnimation(0, _this.animation, _this.loop);
          _this.skeleton.node.runAction(effect.bouceIn({
            time: .25
          }));
        });
      };
      ItemAnimation.prototype.onDestroy = function() {
        this.callback && this.callback();
      };
      __decorate([ property(sp.SkeletonData) ], ItemAnimation.prototype, "skeletonData", void 0);
      __decorate([ property({
        tooltip: "Custom Animation"
      }) ], ItemAnimation.prototype, "animation", void 0);
      __decorate([ property(cc.Boolean) ], ItemAnimation.prototype, "loop", void 0);
      __decorate([ property(cc.Boolean) ], ItemAnimation.prototype, "autoRun", void 0);
      __decorate([ property(cc.Boolean) ], ItemAnimation.prototype, "fadeOut", void 0);
      __decorate([ property(cc.Boolean) ], ItemAnimation.prototype, "autoRelease", void 0);
      __decorate([ property({
        tooltip: "Time destroy"
      }) ], ItemAnimation.prototype, "timeOut", void 0);
      ItemAnimation = __decorate([ ccclass ], ItemAnimation);
      return ItemAnimation;
    }(cc.Component);
    exports.default = ItemAnimation;
    cc._RF.pop();
  }, {} ],
  ItemGame: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5bbeb6hzUpObodJ2mdI9+U3", "ItemGame");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AccumulatedBar_1 = require("../Components/AccumulatedBar");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ItemGame = function(_super) {
      __extends(ItemGame, _super);
      function ItemGame() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.image = null;
        _this.loadingPrefab = null;
        _this.id = 0;
        _this.smid = "";
        _this.loadingNode = null;
        _this.accumulatedBar = null;
        return _this;
      }
      ItemGame.prototype.setData = function(id, image) {
        this.id = id;
        this.image.spriteFrame = image;
        this.smid = config.game.SMID[id] || "";
      };
      ItemGame.prototype.initDownloadProgress = function() {
        var _this = this;
        if (this.loadingNode) return;
        this.image.node.runAction(cc.tintTo(.3, 40, 40, 40));
        this.loadingNode = cc.instantiate(this.loadingPrefab);
        this.accumulatedBar = this.loadingNode.getComponent(AccumulatedBar_1.default);
        this.loadingNode.parent = this.node;
        this.loadingNode.setPosition(0, 0);
        this.loadingNode.opacity = 0;
        this.loadingNode.runAction(effect.bouceIn({
          time: .3
        }));
        this.accumulatedBar.lerpRatio = 10;
        var progressFunc = function(count, totalCount) {
          _this.accumulatedBar.setProgress(count / totalCount);
        };
        return progressFunc;
      };
      ItemGame.prototype.removeDownloadProgress = function(slotNode) {
        var _this = this;
        if (!this.loadingNode) return;
        this.loadingNode.runAction(cc.sequence([ cc.delayTime(.3), cc.callFunc(function() {
          _this.loadingNode.runAction(effect.bouceOut({
            time: .3
          }));
          _this.image.node.runAction(cc.tintTo(.3, 255, 255, 255));
        }), cc.delayTime(.3), cc.callFunc(function() {
          _this.loadingNode.destroy();
          slotNode && slotNode.destroy();
        }) ]));
      };
      __decorate([ property(cc.Sprite) ], ItemGame.prototype, "image", void 0);
      __decorate([ property(cc.Prefab) ], ItemGame.prototype, "loadingPrefab", void 0);
      ItemGame = __decorate([ ccclass ], ItemGame);
      return ItemGame;
    }(cc.Component);
    exports.default = ItemGame;
    cc._RF.pop();
  }, {
    "../Components/AccumulatedBar": "AccumulatedBar"
  } ],
  ItemSkeleton: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2c5c63AwXNGqrfxds6qJcO7", "ItemSkeleton");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ItemSkeleton = function(_super) {
      __extends(ItemSkeleton, _super);
      function ItemSkeleton() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.skeleton = null;
        return _this;
      }
      ItemSkeleton.prototype.onLoad = function() {
        window["item"] = this;
        this.skeleton = this.node.getComponent(sp.Skeleton);
        game.log(this.skeleton.skeletonData.skeletonJson);
      };
      ItemSkeleton = __decorate([ ccclass ], ItemSkeleton);
      return ItemSkeleton;
    }(cc.Component);
    exports.default = ItemSkeleton;
    cc._RF.pop();
  }, {} ],
  Item: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "693baJDbAJFE4FJLNuwUi2N", "Item");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Item = function(_super) {
      __extends(Item, _super);
      function Item() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.id = "";
        _this.spritesFrame = null;
        _this.skeletonData = null;
        return _this;
      }
      Item.prototype.setInfo = function(id, spriteFrame, skeletonData) {
        this.id = id;
        spriteFrame && (this.spritesFrame = spriteFrame);
        skeletonData && (this.skeletonData = skeletonData);
      };
      __decorate([ property(cc.String) ], Item.prototype, "id", void 0);
      __decorate([ property(cc.SpriteFrame) ], Item.prototype, "spritesFrame", void 0);
      __decorate([ property(sp.SkeletonData) ], Item.prototype, "skeletonData", void 0);
      Item = __decorate([ ccclass ], Item);
      return Item;
    }(cc.Component);
    exports.default = Item;
    cc._RF.pop();
  }, {} ],
  LevelUpAnimation: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9d0c8zOhG9EaK0azzeGQEhb", "LevelUpAnimation");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var LevelUpAnimation = function(_super) {
      __extends(LevelUpAnimation, _super);
      function LevelUpAnimation() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.lbLevel = void 0;
        _this.lbCoin = void 0;
        _this.btnCollect = void 0;
        _this.coinController = void 0;
        _this.effectLayout = void 0;
        _this.data = {
          level: 10,
          coin: 2e6
        };
        _this.enableCollect = false;
        _this.releaseCallback = void 0;
        return _this;
      }
      LevelUpAnimation.prototype.init = function(data) {
        this.data = data;
      };
      LevelUpAnimation.prototype.play = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.coinController = new CoinLabel_1.default(this.lbCoin);
              this.effectLayout = this.getComponent("EffectLayout");
              this.lbCoin.node.opacity = 0;
              this.btnCollect.node.opacity = 0;
              this.lbLevel.string = this.data.level.toString();
              this.enableCollect = true;
              return [ 4, this.onOpen() ];

             case 1:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this.releaseCallback = function() {
                  res();
                };
              }) ];

             case 2:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      LevelUpAnimation.prototype.onOpen = function() {
        var _this = this;
        return Promise.all([ new Promise(function(res, rej) {
          _this.effectLayout.onOpen().then(function() {
            res();
          });
        }), new Promise(function(res, rej) {
          _this.lbCoin.node.runAction(effect.bouceIn({
            time: .3,
            callback: function() {
              _this.coinController && _this.coinController.updateUserBalance(_this.data.coin, {
                subfix: " $"
              });
              _this.effectLayout && _this.effectLayout.coin.play();
              res();
            }
          }));
        }), new Promise(function(res, rej) {
          _this.btnCollect.node.runAction(effect.bouceIn({
            time: .5,
            callback: function() {
              res();
            }
          }));
        }) ]);
      };
      LevelUpAnimation.prototype.onClose = function() {
        return __awaiter(this, void 0, void 0, function() {
          var listNode;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              listNode = [ this.effectLayout.anim.node, this.lbCoin.node, this.btnCollect.node ];
              return [ 4, Promise.all(listNode.map(function(o, i) {
                return new Promise(function(res, rej) {
                  o && o.runAction(effect.bouceOut({
                    time: .3 + .15 * i,
                    callback: function() {
                      res();
                    }
                  }));
                });
              })) ];

             case 1:
              _a.sent();
              if (!this.effectLayout) return [ 3, 3 ];
              return [ 4, this.effectLayout.onClose() ];

             case 2:
              _a.sent();
              _a.label = 3;

             case 3:
              this.node && this.onRelease();
              return [ 2 ];
            }
          });
        });
      };
      LevelUpAnimation.prototype.onClickCollect = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              game.log("LevelUpAnimation", "onClickCollect");
              if (!this.enableCollect) {
                game.log("LevelUpAnimation", "onClickCollect", "enableCollect is false");
                return [ 2 ];
              }
              return [ 4, this.onClose() ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      LevelUpAnimation.prototype.onRelease = function() {
        this.effectLayout.onRelease();
        this.releaseCallback && this.releaseCallback();
      };
      __decorate([ property(cc.Label) ], LevelUpAnimation.prototype, "lbLevel", void 0);
      __decorate([ property(cc.Label) ], LevelUpAnimation.prototype, "lbCoin", void 0);
      __decorate([ property(cc.Button) ], LevelUpAnimation.prototype, "btnCollect", void 0);
      LevelUpAnimation = __decorate([ ccclass ], LevelUpAnimation);
      return LevelUpAnimation;
    }(cc.Component);
    exports.default = LevelUpAnimation;
    cc._RF.pop();
  }, {
    "../Components/CoinLabel": "CoinLabel"
  } ],
  LinesController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ddc65mv5XtJr6Rcm5HohZzJ", "LinesController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var LinesController = function(_super) {
      __extends(LinesController, _super);
      function LinesController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.tableView = null;
        _this.lineAnimate = null;
        _this.lineSprite = null;
        _this.lineItem = null;
        _this.totalLines = 20;
        _this.lineNode = [];
        _this.getLine = function(l) {
          var payTable = config.game.PAY_LINES[_this.totalLines];
          var line = payTable[l];
          var _a = _this._slotController, distanceItemX = _a.distanceItemX, distanceItemY = _a.distanceItemY;
          var gameSize = _this._slotController.gameSizeType;
          var width = 3;
          3 != gameSize && 2 != gameSize || (width = 4);
          var points = line.reduce(function(result, item, index) {
            result.push({
              x: (index + .5) * distanceItemX,
              y: (width - (item + .5)) * distanceItemY
            });
            return result;
          }, []);
          points = [ {
            x: 0,
            y: points[0].y
          } ].concat(points, [ {
            x: points[points.length - 1].x + distanceItemX / 2,
            y: points[points.length - 1].y
          } ]);
          var colorLine = _this.getColorLine(l);
          var totalLineNode = new cc.Node("TotalLineNode");
          totalLineNode.parent = _this.node;
          _this.lineNode.push(totalLineNode);
          for (var i = 0; i < points.length - 1; i++) {
            var lineNode = cc.instantiate(_this.lineItem);
            var length = 4 + Math.sqrt(Math.pow(points[i].x - points[i + 1].x, 2) + Math.pow(points[i].y - points[i + 1].y, 2));
            var angle = -(180 + 180 * Math.atan2(points[i].y - points[i + 1].y, points[i].x - points[i + 1].x) / Math.PI);
            lineNode.parent = totalLineNode;
            lineNode.active = true;
            lineNode.width = length;
            lineNode.rotation = angle;
            lineNode.color = colorLine;
            lineNode.setPosition(points[i]);
          }
        };
        return _this;
      }
      LinesController.prototype.init = function(slotController) {
        return __awaiter(this, void 0, void 0, function() {
          var sp;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this._slotController = slotController;
              return [ 4, this.loadRes() ];

             case 1:
              _a.sent();
              this.lineItem = new cc.Node("Linepay");
              sp = this.lineItem.addComponent(cc.Sprite);
              sp.spriteFrame = this.lineSprite;
              this.lineItem.anchorX = .015;
              this.lineItem.anchorY = .5;
              this.initPosition();
              this.initAnimation();
              return [ 2 ];
            }
          });
        });
      };
      LinesController.prototype.loadRes = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _a;
          return __generator(this, function(_b) {
            switch (_b.label) {
             case 0:
              return [ 4, Promise.all([ util.game.loadRes("0_animation/Slots/LineAni", cc.AnimationClip), util.game.loadRes("0_textures/Slots/Linepay", cc.SpriteFrame) ]) ];

             case 1:
              _a = _b.sent(), this.lineAnimate = _a[0], this.lineSprite = _a[1];
              return [ 2 ];
            }
          });
        });
      };
      LinesController.prototype.initPosition = function() {
        this.node.parent = this.tableView;
        this.node.anchorX = 0;
        this.node.anchorY = 0;
        this.node.width = this.tableView.width;
        this.node.height = this.tableView.height;
        this.node.x = 0;
        this.node.y = 0;
        this.node.zIndex = 2;
      };
      LinesController.prototype.initAnimation = function() {
        this.node.addComponent(cc.Animation);
        this.animation = this.node.getComponent(cc.Animation);
        this.animation.addClip(this.lineAnimate);
        this.lineItem.height = 11;
        this.lineItem.anchorX = .015;
        this.lineItem.anchorY = .5;
      };
      LinesController.prototype.showAllLines = function(arr, totalLines) {
        var _this = this;
        this.node.active = true;
        totalLines && (this.totalLines = totalLines);
        util.game.showNode(this.node, 2);
        arr.forEach(function(item) {
          _this.getLine(item);
        });
        this.animation.play("LineAni");
        return new Promise(function(res, rej) {
          _this.node.runAction(cc.sequence([ cc.delayTime(1.3), cc.callFunc(function() {
            _this.stopShowLines();
            res();
          }) ]));
        });
      };
      LinesController.prototype.showLine = function(item) {
        var _this = this;
        this.node.active = true;
        util.game.showNode(this.node, 2);
        this.getLine(item);
        this.animation.play("LineAni");
        return new Promise(function(res, rej) {
          _this.node.runAction(cc.sequence([ cc.delayTime(1.5), cc.callFunc(function() {
            _this.stopShowLines();
            res();
          }) ]));
        });
      };
      LinesController.prototype.stopShowLines = function() {
        if (!this.node) return;
        this.animation && this.animation.stop();
        this.lineNode && this.lineNode.forEach(function(item) {
          item.active = false;
          cc.isValid(item) && item.destroy();
        });
        this.node.active = false;
      };
      LinesController.prototype.refreshShowLines = function() {
        this.animation && this.animation.stop();
        util.game.hideNode(this.node);
        this.lineNode && this.lineNode.forEach(function(item) {
          cc.isValid(item) && item.destroy();
        });
        this.lineNode = [];
      };
      LinesController.prototype.getColorLine = function(n) {
        var _a;
        var _b = define.color, Green = _b.Green, Yellow = _b.Yellow, Orange = _b.Orange, Red = _b.Red, Blue = _b.Blue, Violet = _b.Violet;
        var lineColors = [ Green, Yellow, Orange, Red, Blue, Violet ];
        n %= lineColors.length;
        return new ((_a = cc.Color).bind.apply(_a, [ void 0 ].concat(Object.values(lineColors[n]))))();
      };
      __decorate([ property(cc.Node) ], LinesController.prototype, "tableView", void 0);
      LinesController = __decorate([ ccclass ], LinesController);
      return LinesController;
    }(cc.Component);
    exports.default = LinesController;
    cc._RF.pop();
  }, {} ],
  LoadingScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a3f48OKaENFD52GSjKZD7zy", "LoadingScene");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AccumulatedBar_1 = require("../Components/AccumulatedBar");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var LoadingScene = function(_super) {
      __extends(LoadingScene, _super);
      function LoadingScene() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.bg = void 0;
        _this.logo = void 0;
        _this.progress = void 0;
        _this.lbPercent = void 0;
        _this.loadDone = false;
        _this.numComplete = 0;
        _this.numProgress = 0;
        _this.key = [];
        return _this;
      }
      LoadingScene.prototype.onLoad = function() {
        var _this = this;
        this.bg.width = cc.winSize.width;
        this.bg.height = cc.winSize.height;
        this.progress.lerpRatio = 20;
        this.progress.setListener(function(percent) {
          return __awaiter(_this, void 0, void 0, function() {
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                if (this.loadDone) return [ 2 ];
                this.lbPercent && (this.lbPercent.string = "Loading: " + percent.toFixed(2) + "%");
                if (!(100 === percent)) return [ 3, 3 ];
                this.loadDone = true;
                return [ 4, this.onClose() ];

               case 1:
                _a.sent();
                return [ 4, controller.ui.openHomeScene() ];

               case 2:
                _a.sent();
                game.data.megaWheel && "number" == typeof game.data.megaWheel.result && controller.ui.openWheelBonus(define.type.WHEEL_BONUS.GOLD);
                view.bar.top.lerpOn = true;
                view.bar.top.updateBarData();
                _a.label = 3;

               case 3:
                return [ 2 ];
              }
            });
          });
        });
        this.initListenner();
        this.initialize();
      };
      LoadingScene.prototype.initListenner = function() {
        var _this = this;
        var cb = function() {
          if (!_this || !_this.node || !_this.numComplete || !_this.progress) return;
          _this.numProgress++;
          _this.progress.setProgress(_this.numProgress / _this.numComplete);
        };
        this.numComplete++;
        var keyLogin = store.register(store.key.LOGIN_DONE, function() {
          if (config.setup["skipLogin"]) {
            _this.progress.setProgress(.99, false);
            _this.progress.lerpRatio = 100;
            _this.progress.setProgress(1);
          } else cb();
        });
        this.key.push(keyLogin);
      };
      LoadingScene.prototype.initialize = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, this.onOpen() ];

             case 1:
              _a.sent();
              api.loginNow();
              return [ 2 ];
            }
          });
        });
      };
      LoadingScene.prototype.onOpen = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              util.game.delay(1, this.node);
              return [ 4, new Promise(function(res, rej) {
                _this && _this.logo && _this.logo.node && _this.logo.node.runAction(effect.bouceIn({
                  callback: function() {
                    res();
                  }
                }));
              }) ];

             case 1:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this && _this.progress && _this.progress.node && _this.progress.node.runAction(cc.sequence(cc.fadeIn(.2), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 2:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this && _this.lbPercent && _this.lbPercent.node && _this.lbPercent.node.runAction(cc.sequence(cc.fadeIn(.01), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 3:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      LoadingScene.prototype.onClose = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, new Promise(function(res, rej) {
                _this && _this.lbPercent && _this.lbPercent.node && _this.lbPercent.node.runAction(cc.sequence(cc.fadeIn(.1), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 1:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this && _this.progress && _this.progress.node && _this.progress.node.runAction(cc.sequence(cc.fadeOut(.1), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 2:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this && _this.logo && _this.logo.node && _this.logo.node.runAction(effect.bouceOut({
                  callback: function() {
                    res();
                  }
                }));
              }) ];

             case 3:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this && _this.bg && _this.bg.runAction(cc.sequence(cc.moveTo(.3, cc.v2(0, -_this.bg.height)).easing(cc.easeOut(.7)), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 4:
              _a.sent();
              this.onRelease();
              return [ 2 ];
            }
          });
        });
      };
      LoadingScene.prototype.onRelease = function() {
        this.node && this.node.destroy();
        view.screen.loading = void 0;
      };
      LoadingScene.prototype.onDestroy = function() {
        this.key.forEach(function(o) {
          return store.unRegister(o);
        });
      };
      __decorate([ property(cc.Node) ], LoadingScene.prototype, "bg", void 0);
      __decorate([ property(sp.Skeleton) ], LoadingScene.prototype, "logo", void 0);
      __decorate([ property(AccumulatedBar_1.default) ], LoadingScene.prototype, "progress", void 0);
      __decorate([ property(cc.Label) ], LoadingScene.prototype, "lbPercent", void 0);
      LoadingScene = __decorate([ ccclass ], LoadingScene);
      return LoadingScene;
    }(cc.Component);
    exports.default = LoadingScene;
    cc._RF.pop();
  }, {
    "../Components/AccumulatedBar": "AccumulatedBar"
  } ],
  Main: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1c171djw71FS6tvzt/Atvwj", "Main");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameUtil_1 = require("./Util/GameUtil");
    var StringUtil_1 = require("./Util/StringUtil");
    var Api_1 = require("./Api");
    var Store_1 = require("./Store");
    var GameConfig_1 = require("./GameConfig");
    var SoundController_1 = require("./SoundController");
    var Effect_1 = require("./Effect");
    var PlatformController_1 = require("./Platform/PlatformController");
    var Tracking_1 = require("./Tracking");
    var DefineType = require("./Define/DefineType");
    var DefineString = require("./Define/DefineString");
    var DefineColor = require("./Define/DefineColor");
    var DefineKey = require("./Define/DefineKey");
    var DefineZIndex = require("./Define/DefineZIndex");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var EIP;
    (function(EIP) {
      EIP[EIP["64.120.114.208"] = 1] = "64.120.114.208";
      EIP[EIP["192.168.31.119"] = 2] = "192.168.31.119";
    })(EIP = exports.EIP || (exports.EIP = {}));
    var Main = function(_super) {
      __extends(Main, _super);
      function Main() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.ip = EIP["64.120.114.208"];
        _this.showLog = false;
        _this.testKey = false;
        _this.testIAP = false;
        _this.skipLogin = false;
        return _this;
      }
      Main.prototype.onLoad = function() {
        this.initGlobal();
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
        this.resiterStore();
        this.initialize();
        tracking.send(tracking.event.APP_LAUNCHER);
      };
      Main.prototype.start = function() {
        var _this = this;
        controller.ui.openLoadingScene();
        setTimeout(function() {
          _this && _this.checkInternetConnection && _this.checkInternetConnection();
        }, 3e3);
      };
      Main.prototype.initialize = function() {
        var keyTest = cc.director.getScene().getChildByName("TestKey");
        this.testKey && keyTest && (keyTest.active = true);
      };
      Main.prototype.initGlobal = function() {
        var _this = this;
        window.controller = {
          ui: this.node.getComponent("UIController"),
          sound: SoundController_1.default.ins()
        };
        var bar = cc.director.getScene().getChildByName("Canvas").getChildByName("bar");
        var topBar = bar.getChildByName("topBar").getComponent("TopBarController");
        var botBar = bar.getChildByName("bottomBar").getComponent("BottomBarController");
        window.view = {
          screen: {
            loading: void 0,
            home: void 0,
            game: void 0,
            slot: void 0,
            bonus: void 0,
            wheelBonus: void 0,
            model: cc.director.getScene().getChildByName("Canvas").getChildByName("Model")
          },
          slot: {
            1: void 0,
            2: void 0,
            3: void 0,
            4: void 0,
            5: void 0,
            6: void 0,
            7: void 0,
            8: void 0
          },
          popup: {},
          dialog: {},
          progress: void 0,
          bar: {
            node: bar,
            top: topBar,
            bottom: botBar
          },
          multi: cc.director.getScene().getChildByName("Canvas").getChildByName("multiSlot").getComponent("MultiScene"),
          animation: void 0
        };
        window.define = {
          type: DefineType,
          color: DefineColor,
          key: DefineKey,
          string: DefineString,
          zIndex: DefineZIndex
        };
        window.config = {
          game: GameConfig_1.default,
          setup: {
            showLog: this.showLog,
            testKey: this.testKey,
            testIAP: this.testIAP,
            skipLogin: this.skipLogin
          }
        };
        window.api = Api_1.default;
        window.api.HOST = EIP[this.ip];
        window.store = Store_1.default;
        window.util = {
          game: GameUtil_1.default,
          string: StringUtil_1.default
        };
        window.game = {
          data: {
            deviceKind: define.type.Device.NORMAL,
            deviceOs: define.type.DEVICE_OS.UNKNOW,
            deviceOsName: "",
            gameOS: define.type.GAME_OS.WEB_COCOS,
            countryCode: "",
            deviceId: "",
            packageName: "",
            versionGame: "",
            versionOS: "",
            dealTime: void 0,
            shop: {},
            megaWheel: null,
            fanpage: "huycoiminecraft",
            groupFB: "150748192018164",
            dailyBonus: {
              freeWheel: {
                array: [],
                isTaken: false,
                result: 0
              },
              lucy: {
                isTaken: false,
                value: 0
              }
            },
            dailyQuest: {
              completeAll: false,
              completedQuests: [],
              missions: [],
              totalPoints: 0,
              totalRewards: 0,
              currentQuest: 0,
              currentProgress: 0,
              doneThisQuest: true,
              startWeek: new Date()
            },
            now: void 0,
            dTime: 0,
            weeklyAccumilation: {
              currentProgress: 0,
              rewardsInfo: [],
              totalRewards: 0,
              takenRewards: 0,
              isCompleted: true
            }
          },
          user: {
            balance: 0,
            id: 0,
            fbid: "",
            loginType: void 0,
            level: {
              currentExp: 0,
              currentLevel: 0,
              requiredExp: 0
            }
          },
          log: function(msg) {
            var subst = [];
            for (var _i = 1; _i < arguments.length; _i++) subst[_i - 1] = arguments[_i];
            _this.showLog && console.log.apply(console, [ msg ].concat(subst));
          },
          logSystem: function(msg) {
            var subst = [];
            for (var _i = 1; _i < arguments.length; _i++) subst[_i - 1] = arguments[_i];
            _this.showLog && console.log.apply(console, [ "%c SYSTEM ", "background: #d32f2f; color: #fff", msg ].concat(subst));
          },
          logEvent: function(msg) {
            var subst = [];
            for (var _i = 1; _i < arguments.length; _i++) subst[_i - 1] = arguments[_i];
            _this.showLog && console.log.apply(console, [ "%c EVENT ", "background: #4a148c; color: #fff", msg ].concat(subst));
          },
          logTracking: function(msg) {
            var subst = [];
            for (var _i = 1; _i < arguments.length; _i++) subst[_i - 1] = arguments[_i];
            _this.showLog && console.log.apply(console, [ "%c Tracking %s ", "background: #6d4c41; color: #fff", msg ].concat(subst));
          },
          logTest: function(msg) {
            var subst = [];
            for (var _i = 1; _i < arguments.length; _i++) subst[_i - 1] = arguments[_i];
            _this.showLog && console.log.apply(console, [ "%c LOGTEST ", "background: #222; color: #bada55", msg ].concat(subst));
          },
          warn: function(msg) {
            var subst = [];
            for (var _i = 1; _i < arguments.length; _i++) subst[_i - 1] = arguments[_i];
            _this.showLog && console.warn.apply(console, [ msg ].concat(subst));
          },
          error: function(msg) {
            var subst = [];
            for (var _i = 1; _i < arguments.length; _i++) subst[_i - 1] = arguments[_i];
            _this.showLog && console.error.apply(console, [ msg ].concat(subst));
          }
        };
        window.effect = Effect_1.default.ins();
        window.platform = PlatformController_1.default.ins();
        window.tracking = Tracking_1.default.ins();
        window.controller.sound.init();
        window.platform.init();
      };
      Main.prototype.resiterStore = function() {
        store.register(store.key.UPDATE_USER_BALANCE, function(amount) {
          game.user.balance = amount;
        });
        store.register(store.key.UPDATE_USER_LEVEL, function(level) {
          game.user.level = level;
        });
        store.register(store.key.UPDATE_SHOP_DATA, function(data) {
          game.data.shop = data;
          if (game.data.megaWheel) game.data.megaWheel.array = data[define.type.ESHOP.MEGA_WHEEL].config; else {
            game.data.megaWheel = {
              array: [],
              result: void 0
            };
            game.data.megaWheel.array = data[define.type.ESHOP.MEGA_WHEEL].config;
          }
          store.emit(store.key.UPDATE_MEGAWHEEL_DATA, game.data.megaWheel);
        });
        store.register(store.key.UPDATE_MEGAWHEEL_DATA, function(data) {
          game.data.megaWheel = data;
        });
        store.register(store.key.DAILYQUEST, function(dailyQuest) {
          game.data.dailyQuest = dailyQuest;
        });
        store.register(store.key.DAILYBONUS, function(dailyBonus) {
          game.data.dailyBonus = dailyBonus;
        });
        store.register(store.key.WEEKLY_ACCUMILATION, function(weeklyAccumilation) {
          game.data.weeklyAccumilation = weeklyAccumilation;
        });
      };
      Main.prototype.onGameHide = function() {
        game.log("%c GAME HIDDEN, SEE YOU AGAIN!!! ", "background: #1B5E20; color: #fff");
      };
      Main.prototype.onGameShow = function() {
        game.log("%c GAME SHOW, NICE TO MEET YOU ^^ ", "background: #01579B; color: #fff");
        this.checkInternetConnection();
      };
      Main.prototype.checkInternetConnection = function() {
        platform.handle.isConnecting() || controller.ui.showDialog({
          title: "Connection Error",
          type: define.type.DIALOG_TYPE.FORCE,
          name: "connection_error",
          message: {
            message: "Failed to connect to the server.\nPlease check your Internet connection."
          },
          buttons: [ {
            title: "Reload",
            theme: define.type.CLASS_THEME.DANGER,
            callback: function() {
              api.socket.reconnect();
            }
          } ]
        });
      };
      Main.prototype.onTestKey = function(editbox) {
        switch (parseInt(editbox.string)) {
         case 1:
          platform.firebase.getVersion();
          break;

         case 2:
          platform.firebase.setUserProperty("hehe", "huhu");
          break;

         case 3:
          platform.firebase.setUserID("1000000");
          break;

         case 4:
          platform.firebase.setScreenName("Main", "MainScene");
          break;

         case 5:
          platform.firebase.sendLogEvent("test", [ "test1", "test2" ]);
          break;

         case 6:
          platform.firebase.resetAnalyticsData();
          break;

         case 7:
          platform.firebase.setAnalyticsCollectionEnabled(true);
          break;

         case 8:
          platform.admob.cache();
          break;

         case 9:
          platform.admob.showBanner();
          break;

         case 10:
          platform.admob.showInterstitial();
          break;

         case 11:
          platform.admob.showRewarded();
          break;

         case 12:
          platform.facebook.login();
          break;

         case 13:
          platform.onesignal.registerPushNotifications();
          break;

         case 14:
          platform.onesignal.sendTag("test", "test hihi");
          break;

         case 15:
          platform.onesignal.getTags();
          break;

         case 16:
          platform.onesignal.deleteTag("test");
          break;

         case 17:
          platform.onesignal.setEmail("huyvk3110@gmail.com");
          break;

         case 18:
          platform.onesignal.idsAvailable();
          break;

         case 19:
          platform.onesignal.enableInAppAlertNotification(true);
          break;

         case 20:
          platform.onesignal.setSubscription(true);
          break;

         case 21:
          platform.onesignal.postNotification("hihi hehe");
          break;

         case 22:
          platform.iap.setDebug(true);
          break;

         case 23:
          platform.iap.purchase("coin_package");
          break;

         case 24:
          platform.iap.refresh();
          break;

         case 25:
          platform.iap.restore();
          break;

         case 26:
          platform.iap.removeListener();
          break;

         case 27:
          platform.iap.enableUserSideVerification();
          break;

         case 28:
          platform.iap.isAutoFinishTransaction();
          break;

         case 29:
          platform.iap.setAutoFinishTransaction(true);
          break;

         case 30:
          platform.iap.finishTransaction("com.cocos2dx.plugintest2");
          break;

         case 31:
          platform.iap.fetchStorePromotionOrder();
          break;

         case 32:
          platform.iap.updateStorePromotionOrder("coin_package");
          break;

         case 33:
          platform.iap.fetchStorePromotionVisibility("coin_package");
          break;

         case 34:
          platform.iap.updateStorePromotionVisibility("coin_package", true);
          break;

         case 35:
          platform.iap.getPurchaseHistory();
          break;

         case 36:
          platform.iap.getInitializedErrMsg();
          break;

         case 37:
          platform.iap.requestUpdateTransaction();
          break;

         case 38:
          platform.iap.purchase("item1");
          break;

         case 39:
          platform.iap.purchase("item2");
          break;

         case 40:
          platform.iap.purchase("item3");
          break;

         case 41:
          sdkbox.firebase.Analytics.logEvent("test1");
          break;

         case 42:
          sdkbox.firebase.Analytics.logEvent("test2", "params1");
          break;

         case 43:
          sdkbox.firebase.Analytics.logEvent("test3", [ "params1", "params2" ]);
          break;

         case 44:
          sdkbox.firebase.Analytics.logEvent("test3", [ "0_params1", "1_params2" ]);
          break;

         case 45:
          console.log(JSON.stringify(sdkbox.firebase.Analytics.Event));
          break;

         case 46:
          console.log(JSON.stringify(sdkbox.firebase.Analytics.Param));
          break;

         case 47:
          console.log("Send logEvent 47");
          sdkbox.firebase.Analytics.logEvent("test4", {
            key1: "param1",
            key2: "param2"
          });
          break;

         default:
          game.log("Key not defined");
        }
      };
      Main.prototype.onClickTest = function() {
        var editbox = cc.director.getScene().getChildByName("TestKey").getChildByName("editBox").getComponent(cc.EditBox);
        this.onTestKey(editbox);
      };
      __decorate([ property({
        type: cc.Enum(EIP),
        displayName: "IP"
      }) ], Main.prototype, "ip", void 0);
      __decorate([ property(cc.Boolean) ], Main.prototype, "showLog", void 0);
      __decorate([ property(cc.Boolean) ], Main.prototype, "testKey", void 0);
      __decorate([ property(cc.Boolean) ], Main.prototype, "testIAP", void 0);
      __decorate([ property(cc.Boolean) ], Main.prototype, "skipLogin", void 0);
      Main = __decorate([ ccclass ], Main);
      return Main;
    }(cc.Component);
    exports.default = Main;
    cc._RF.pop();
  }, {
    "./Api": "Api",
    "./Define/DefineColor": "DefineColor",
    "./Define/DefineKey": "DefineKey",
    "./Define/DefineString": "DefineString",
    "./Define/DefineType": "DefineType",
    "./Define/DefineZIndex": "DefineZIndex",
    "./Effect": "Effect",
    "./GameConfig": "GameConfig",
    "./Platform/PlatformController": "PlatformController",
    "./SoundController": "SoundController",
    "./Store": "Store",
    "./Tracking": "Tracking",
    "./Util/GameUtil": "GameUtil",
    "./Util/StringUtil": "StringUtil"
  } ],
  MarginWithIphoneX: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4d82a3moCNLpq7LGl4XXnsC", "MarginWithIphoneX");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MarginWithIphoneX = function(_super) {
      __extends(MarginWithIphoneX, _super);
      function MarginWithIphoneX() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.marginLeft = 100;
        _this.marginRight = 100;
        return _this;
      }
      MarginWithIphoneX.prototype.onLoad = function() {
        var realScreenSize = cc.view.getFrameSize();
        var realScreenRatio = realScreenSize.width / realScreenSize.height;
        if (realScreenRatio >= 2 && this.node.getComponent(cc.Widget)) {
          this.marginLeft >= 0 && (this.node.getComponent(cc.Widget).left = this.marginLeft);
          this.marginRight >= 0 && (this.node.getComponent(cc.Widget).right = this.marginRight);
        }
      };
      __decorate([ property(cc.Integer) ], MarginWithIphoneX.prototype, "marginLeft", void 0);
      __decorate([ property(cc.Integer) ], MarginWithIphoneX.prototype, "marginRight", void 0);
      MarginWithIphoneX = __decorate([ ccclass ], MarginWithIphoneX);
      return MarginWithIphoneX;
    }(cc.Component);
    exports.default = MarginWithIphoneX;
    cc._RF.pop();
  }, {} ],
  MinigameController1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d7e56NGG8tI3odhnrwKgR9b", "MinigameController1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var ResourceMinigame1_1 = require("./ResourceMinigame1");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MinigameController1 = function(_super) {
      __extends(MinigameController1, _super);
      function MinigameController1() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.collectBonus = null;
        _this.itemsContainer = null;
        _this.multipleLabel = null;
        _this.baseScoreLabel = null;
        _this.gameResult = null;
        _this.mainGame = null;
        _this.scoreLabel = null;
        _this.resourceMinigame = null;
        _this._slotController = null;
        _this.listItem = [];
        _this.playArray = [];
        _this.baseScore = 0;
        _this.totalMultiple = 0;
        _this._isLock = false;
        _this._time = 0;
        return _this;
      }
      MinigameController1.prototype.startMiniGame = function(mul, mulArr, w) {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            this.playArray = mulArr;
            this.baseScore = w;
            this.baseScoreLabel.string = "$ " + util.string.formatMoney(this.baseScore);
            this.coinController = new CoinLabel_1.default(this.scoreLabel);
            this.coinController.updateUserBalance(0);
            this.listItem = this.itemsContainer.children;
            this.listItem.forEach(function(item) {
              item.once(cc.Node.EventType.TOUCH_END, function(e) {
                _this.selectItem(e.currentTarget);
              });
            });
            this.resourceMinigame.resourceController = this._slotController.resourceController;
            this.resourceMinigame.loadResources();
            return [ 2 ];
          });
        });
      };
      MinigameController1.prototype.selectItem = function(node) {
        return __awaiter(this, void 0, void 0, function() {
          var num;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (this._isLock) return [ 2 ];
              this._isLock = true;
              num = this.playArray[this._time];
              this.updateTotalMultiple(num);
              this.itemAction(node, num);
              this._time++;
              if (!(this._time == this.playArray.length)) return [ 3, 2 ];
              node.children[2].active = false;
              return [ 4, this.showEndGame() ];

             case 1:
              _a.sent();
              _a.label = 2;

             case 2:
              this._isLock = false;
              return [ 2 ];
            }
          });
        });
      };
      MinigameController1.prototype.updateTotalMultiple = function(num) {
        var _this = this;
        this.totalMultiple += num;
        this.multipleLabel.node.runAction(cc.sequence(cc.scaleTo(.2, 1.2), cc.callFunc(function() {
          _this.multipleLabel.string = _this.totalMultiple + "X";
        }), cc.scaleTo(.3, 1)));
      };
      MinigameController1.prototype.itemAction = function(node, num) {
        node.children[1].active = true;
        node.children[2].active = true;
        node.children[1].scale = .3;
        node.children[2].scale = .3;
        node.children[1].getComponent(cc.Label).string = "X" + num;
        node.children[0].runAction(cc.sequence(cc.fadeOut(.2), cc.callFunc(function() {
          node.children[1].runAction(cc.sequence(cc.scaleTo(.3, 1.3), cc.scaleTo(.3, 1)));
          node.children[2].runAction(cc.sequence(cc.scaleTo(.3, 1.3), cc.scaleTo(.3, 1)));
        })));
      };
      MinigameController1.prototype.showEndGame = function() {
        var _this = this;
        return new Promise(function(res, rej) {
          return __awaiter(_this, void 0, void 0, function() {
            var error_1;
            var _this = this;
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                _a.trys.push([ 0, 2, , 3 ]);
                this.gameResult.active = true;
                this.gameResult.opacity = 0;
                return [ 4, util.game.delay(1e3, this.node, res) ];

               case 1:
                _a.sent();
                this.mainGame.runAction(cc.fadeOut(.3));
                this.gameResult.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
                  _this.coinController.updateUserBalance(_this.totalMultiple * _this.baseScore);
                  api.sendGD({
                    e: api.key.SLOT_GET_BONUS,
                    gtype: config.game.SMID[1]
                  }, function(err, data) {
                    game.log(data);
                  });
                }) ]));
                return [ 3, 3 ];

               case 2:
                error_1 = _a.sent();
                res();
                return [ 3, 3 ];

               case 3:
                return [ 2 ];
              }
            });
          });
        });
      };
      MinigameController1.prototype.backToSlot = function() {
        var _this = this;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          store.emit(store.key.UPDATE_USER_BALANCE, game.user.balance, 0);
          _this.node.destroy();
          view.screen.slot.SlotController.bonusNode = void 0;
          view.screen.bonus = void 0;
          view.screen.slot && view.screen.slot.SlotController.checkAutoSpin(_this._slotController);
          controller.ui.showBar();
        }) ]));
      };
      __decorate([ property(cc.Button) ], MinigameController1.prototype, "collectBonus", void 0);
      __decorate([ property(cc.Node) ], MinigameController1.prototype, "itemsContainer", void 0);
      __decorate([ property(cc.Label) ], MinigameController1.prototype, "multipleLabel", void 0);
      __decorate([ property(cc.Label) ], MinigameController1.prototype, "baseScoreLabel", void 0);
      __decorate([ property(cc.Node) ], MinigameController1.prototype, "gameResult", void 0);
      __decorate([ property(cc.Node) ], MinigameController1.prototype, "mainGame", void 0);
      __decorate([ property(cc.Label) ], MinigameController1.prototype, "scoreLabel", void 0);
      __decorate([ property(ResourceMinigame1_1.default) ], MinigameController1.prototype, "resourceMinigame", void 0);
      MinigameController1 = __decorate([ ccclass ], MinigameController1);
      return MinigameController1;
    }(cc.Component);
    exports.default = MinigameController1;
    cc._RF.pop();
  }, {
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "./ResourceMinigame1": "ResourceMinigame1"
  } ],
  MinigameController2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7483edFQmlMXp65QBTipnR0", "MinigameController2");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var ResourceMinigame2_1 = require("./ResourceMinigame2");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MiniGameController2 = function(_super) {
      __extends(MiniGameController2, _super);
      function MiniGameController2() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.itemContainer = null;
        _this.stopGame = null;
        _this.gameResult = null;
        _this.mainGame = null;
        _this.multipleLabel = null;
        _this.baseScoreLabel = null;
        _this.scoreLabel = null;
        _this.stopOverlay = null;
        _this.resourceMinigame = null;
        _this._slotController = null;
        _this.listItem = [];
        _this.velocity = 0;
        _this.acc = 500;
        _this.maxVelocity = 1100;
        _this.baseScore = 0;
        _this._isMove = false;
        _this._isStopGame = false;
        _this._flagStop = 0;
        _this.mul = 0;
        _this.arrayBase = [ 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 8, 8, 10, 10, 20 ];
        return _this;
      }
      MiniGameController2.prototype.startMiniGame = function(mul, mulArr, w) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            this.baseScore = w;
            this.mul = mul;
            this.baseScoreLabel.string = "$ " + util.string.formatMoney(this.baseScore);
            this.listItem = this.itemContainer.children;
            this.coinController = new CoinLabel_1.default(this.scoreLabel, 11);
            this.coinController.updateUserBalance(0);
            this.resourceMinigame.resourceController = this._slotController.resourceController;
            this.resourceMinigame.loadResources();
            return [ 2 ];
          });
        });
      };
      MiniGameController2.prototype.startGame = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this._isMove = true;
              this.velocity = 0;
              this._isStopGame = false;
              this.stopGame.active = true;
              this.stopGame.getComponent(cc.Button).interactable = false;
              return [ 4, util.game.delay(3e3, this.node).catch(function(e) {}) ];

             case 1:
              _a.sent();
              this.stopGame.getComponent(cc.Button).interactable = true;
              return [ 2 ];
            }
          });
        });
      };
      MiniGameController2.prototype.stopMiniGame = function() {
        this.stopOverlay.active = true;
        this._isStopGame = true;
        this.stopGame.getComponent(cc.Button).interactable = false;
      };
      MiniGameController2.prototype.update = function(dt) {
        var _this = this;
        if (this._isMove) {
          this.velocity < this.maxVelocity ? this.velocity += this.acc * dt : this.velocity = this.maxVelocity;
          this.listItem.forEach(function(item) {
            item.x += _this.velocity * dt;
            if (item.x > 700) {
              var xMin_1 = 0;
              _this.listItem.forEach(function(item) {
                item.x < xMin_1 && (xMin_1 = item.x);
              });
              item.x = xMin_1 - 350;
              item.getComponentInChildren(cc.Label).string = "X" + _this.arrayBase[Math.floor(0 + Math.random() * _this.arrayBase.length)];
              if (_this._isStopGame) {
                _this.listItem = _this.listItem.sort(function(a, b) {
                  return a.x - b.x;
                });
                if (_this._flagStop > 3) {
                  _this._isMove = false;
                  _this._isStopGame = false;
                  _this.listItem[1].getComponentInChildren(cc.Label).string = "X" + _this.mul;
                  _this._flagStop = 0;
                  setTimeout(function() {
                    _this.listItem[1].getComponentInChildren(cc.Label).node.runAction(cc.sequence(cc.scaleTo(.2, 1.3), cc.scaleTo(.2, 1), cc.scaleTo(.3, 1.1), cc.callFunc(function() {
                      var labelNode = _this.listItem[1].getComponentInChildren(cc.Label).node;
                      var newNode = cc.instantiate(labelNode);
                      newNode.parent = labelNode.parent;
                      newNode.runAction(cc.moveTo(.3, cc.v2({
                        x: 0,
                        y: 200
                      })));
                    })));
                  }, 1700);
                  _this.endMove();
                  _this.showEndGame();
                } else _this._flagStop++;
              }
            }
          });
        }
      };
      MiniGameController2.prototype.endMove = function() {
        var _this = this;
        this.listItem.forEach(function(item, index) {
          item.runAction(cc.moveTo(.8, cc.v2({
            x: 350 * (index + 1) - 700,
            y: 0
          })).easing(cc.easeQuadraticActionOut()));
        });
        setTimeout(function() {
          _this.multipleLabel.node.runAction(cc.sequence(cc.scaleTo(.2, 1.3), cc.callFunc(function() {
            _this.multipleLabel.string = "X" + _this.mul;
          }), cc.scaleTo(.3, 1)));
        }, 2470);
      };
      MiniGameController2.prototype.showEndGame = function() {
        var _this = this;
        return new Promise(function(res, rej) {
          return __awaiter(_this, void 0, void 0, function() {
            var _this = this;
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                this.gameResult.active = true;
                this.gameResult.opacity = 0;
                return [ 4, util.game.delay(4500, this.node, res).catch(function(e) {}) ];

               case 1:
                _a.sent();
                this.mainGame.runAction(cc.fadeOut(.3));
                this.gameResult.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
                  _this.coinController.updateUserBalance(_this.mul * _this.baseScore);
                  api.sendGD({
                    e: api.key.SLOT_GET_BONUS,
                    gtype: config.game.SMID[2]
                  }, function(err, data) {
                    game.log(data);
                  });
                }) ]));
                return [ 2 ];
              }
            });
          });
        });
      };
      MiniGameController2.prototype.backToSlot = function() {
        var _this = this;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          store.emit(store.key.UPDATE_USER_BALANCE, game.user.balance, 0);
          _this.node.destroy();
          view.screen.slot.SlotController.bonusNode = void 0;
          view.screen.bonus = void 0;
          view.screen.slot && view.screen.slot.SlotController.checkAutoSpin(_this._slotController);
          controller.ui.showBar();
        }) ]));
      };
      __decorate([ property(cc.Node) ], MiniGameController2.prototype, "itemContainer", void 0);
      __decorate([ property(cc.Node) ], MiniGameController2.prototype, "stopGame", void 0);
      __decorate([ property(cc.Node) ], MiniGameController2.prototype, "gameResult", void 0);
      __decorate([ property(cc.Node) ], MiniGameController2.prototype, "mainGame", void 0);
      __decorate([ property(cc.Label) ], MiniGameController2.prototype, "multipleLabel", void 0);
      __decorate([ property(cc.Label) ], MiniGameController2.prototype, "baseScoreLabel", void 0);
      __decorate([ property(cc.Label) ], MiniGameController2.prototype, "scoreLabel", void 0);
      __decorate([ property(cc.Node) ], MiniGameController2.prototype, "stopOverlay", void 0);
      __decorate([ property(ResourceMinigame2_1.default) ], MiniGameController2.prototype, "resourceMinigame", void 0);
      MiniGameController2 = __decorate([ ccclass ], MiniGameController2);
      return MiniGameController2;
    }(cc.Component);
    exports.default = MiniGameController2;
    cc._RF.pop();
  }, {
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "./ResourceMinigame2": "ResourceMinigame2"
  } ],
  MinigameController3: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "77f8aXiQAFHJZ2hdN9f6vul", "MinigameController3");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceMinigame3_1 = require("./ResourceMinigame3");
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MiniGameController3 = function(_super) {
      __extends(MiniGameController3, _super);
      function MiniGameController3() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.resourceController = null;
        _this.rowBonus = [];
        _this.total = null;
        _this.gameResult = null;
        _this.mainGame = null;
        _this.scoreLabel = null;
        _this.startMinigame = null;
        _this._slotController = null;
        _this.listItem = [];
        _this.level = 0;
        _this.winScore = 0;
        _this.arrBonus = null;
        _this.arrBase = [ [ [ 5, 10, 15, 20, 25, 50 ], [ 15, 20, 25, 30, 35, 40, 100 ], [ 35, 45, 55, 65, 75, 150 ], [ 100, 150, 200, 250, 500 ] ], [ [ 25, 50, 75, 100, 125, 150, 300 ], [ 150, 200, 250, 300, 600 ], [ 400, 500, 600, 1200 ], [ 700, 1e3, 1300, 1600, 1900, 2200, 4400 ] ], [ [ 50, 100, 150, 200, 250, 300, 600 ], [ 300, 400, 500, 600, 1200 ], [ 800, 1e3, 1200, 2400 ], [ 1400, 2e3, 2600, 3200, 3800, 4400, 8800 ] ] ];
        _this.isEvent = true;
        _this._lockRow = [];
        _this.updateTot = 0;
        return _this;
      }
      MiniGameController3.prototype.startGame = function() {
        var _this = this;
        this.startMinigame.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          _this.startMinigame.active = false;
        }) ]));
        this.mainGame.active = true;
      };
      MiniGameController3.prototype.startMiniGame = function(c, w, arr) {
        return __awaiter(this, void 0, void 0, function() {
          var arrItem;
          var _this = this;
          return __generator(this, function(_a) {
            this.level = c;
            this.winScore = w;
            this.arrBonus = arr;
            arrItem = [];
            this.rowBonus.forEach(function(item) {
              arrItem.push(item.children);
            });
            this.listItem = arrItem;
            this.itemEvent(0);
            this.coinController = new CoinLabel_1.default(this.scoreLabel, 11);
            this.coinController.updateUserBalance(0);
            this.resourceController.resourceController = this._slotController.resourceController;
            this.resourceController.loadResources();
            this.listItem.forEach(function(item, index) {
              item.forEach(function(item) {
                var spf = _this.resourceController.resourceController.spriteList.find(function(item) {
                  return 0 == index ? item.name == _this.resourceController.listResourceName.nomal[index + 1] : item.name == _this.resourceController.listResourceName.items[index + 1];
                });
                item.getComponent(cc.Sprite).spriteFrame = spf;
              });
            });
            return [ 2 ];
          });
        });
      };
      MiniGameController3.prototype.itemEvent = function(index) {
        var _this = this;
        game.log(this.isEvent);
        index < 4 && true == this.isEvent ? this.listItem[index].forEach(function(item) {
          item.once(cc.Node.EventType.TOUCH_START, function(e) {
            game.log("LOCK ROW", index);
            if (_this._lockRow.includes(index)) return;
            _this._lockRow.push(index);
            item.runAction(cc.fadeIn(4));
            setTimeout(function() {
              _this && _this.node && _this.activeRow && _this.activeRow(index);
            }, 4e3);
            _this.selectItem(e.currentTarget, index);
          });
        }) : this.showEndGame();
      };
      MiniGameController3.prototype.activeRow = function(index) {
        var _this = this;
        setTimeout(function() {
          if (_this.isEvent) {
            _this.itemEvent(index + 1);
            if (3 == index) return;
            game.log(_this.listItem[index + 1]);
            _this.listItem[index + 1].forEach(function(item) {
              item.getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
                return item.name == _this.resourceController.listResourceName.nomal[index + 2];
              });
            });
          }
        }, 1500);
      };
      MiniGameController3.prototype.selectItem = function(node, index) {
        var _this = this;
        if (!node || !this) return;
        var nodeUnselected = [];
        this.listItem[index].forEach(function(item) {
          if (item == node) return;
          nodeUnselected.push(item);
        });
        node.getComponent(cc.Sprite).spriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.nomal[index + 1];
        });
        var nodeAlpha = new cc.Node();
        nodeAlpha.parent = node.parent;
        nodeAlpha.zIndex = -1;
        nodeAlpha.setPosition(node.getPosition());
        nodeAlpha.addComponent(cc.Sprite).spriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.white[index + 1];
        });
        nodeAlpha.runAction(cc.repeatForever(cc.sequence([ cc.fadeIn(.3), cc.delayTime(.1), cc.fadeOut(.3) ])));
        var labelAnimation = node.getComponentInChildren(cc.Label).node;
        labelAnimation.active = true;
        labelAnimation.opacity = 0;
        var pumpkin = this.arrBase[this.level - 1][index][this.arrBase[this.level - 1][index].length - 1];
        setTimeout(function() {
          labelAnimation.runAction(cc.sequence([ cc.callFunc(function() {
            if (_this.arrBonus[index] == pumpkin) {
              node.getComponentInChildren(cc.Label).string = "";
              node.runAction(cc.sequence([ cc.fadeOut(.3), cc.callFunc(function() {
                return _this.checkYellowPumpkin(index, node);
              }) ]));
            } else labelAnimation.getComponent(cc.Label).string = "" + _this.arrBonus[index];
            if (void 0 == _this.arrBonus[index]) {
              node.runAction(cc.repeatForever(cc.sequence([ cc.fadeOut(.4), cc.fadeIn(1) ])));
              nodeAlpha.destroy();
              _this.isEvent = false;
              labelAnimation.getComponent(cc.Label).string = "";
              node.getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
                return item.name == _this.resourceController.listResourceName.snake[0];
              });
            }
          }), cc.callFunc(function() {
            return labelAnimation.runAction(cc.fadeIn(.5));
          }), cc.scaleTo(.4, 1.5), cc.scaleTo(.3, 1) ]));
        }, 2500);
        setTimeout(function() {
          nodeUnselected.forEach(function(item) {
            var itemUnselected = item.getComponentInChildren(cc.Label);
            itemUnselected.node.active = true;
            itemUnselected.string = _this.arrBase[_this.level - 1][index][Math.floor(0 + Math.random() * (_this.arrBase[_this.level - 1][index].length - 1))];
            itemUnselected.node.color = new cc.Color(150, 150, 150, 255);
            itemUnselected.node.runAction(cc.sequence([ cc.callFunc(function() {
              return itemUnselected.node.runAction(cc.fadeIn(.5));
            }), cc.scaleTo(.5, 1.3), cc.scaleTo(.5, 1) ]));
            item.getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
              return item.name == _this.resourceController.listResourceName.items[index + 1];
            });
          });
          if (index >= 1) {
            var n = 0;
            while (n < 4) {
              var i = Math.floor(0 + 5 * Math.random());
              var snake = nodeUnselected[i];
              snake.getComponentInChildren(cc.Label).string = "";
              snake.getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
                return item.name == _this.resourceController.listResourceName.snake[0];
              });
              n++;
            }
          }
          if (!(_this.arrBonus[index] == pumpkin)) {
            var pumpkin_1 = nodeUnselected[Math.round(0 + 4 * Math.random())];
            pumpkin_1.getComponentInChildren(cc.Label).string = "";
            pumpkin_1.getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
              return item.name == _this.resourceController.listResourceName.gold[index + 1];
            });
          }
          if (void 0 == _this.arrBonus[index]) {
            _this.total.string = ": " + (_this.updateTot += 0);
            _this.showEndGame();
          } else _this.total.string = ": " + (_this.updateTot += _this.arrBonus[index]);
        }, 5500);
      };
      MiniGameController3.prototype.checkYellowPumpkin = function(index, node) {
        var _this = this;
        node.runAction(cc.sequence([ cc.callFunc(function() {
          node.getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
            return item.name == _this.resourceController.listResourceName.gold[index + 1];
          });
        }), cc.callFunc(function() {
          return node.runAction(cc.fadeIn(.3));
        }), cc.scaleTo(0, 0), cc.scaleTo(.4, 1) ]));
      };
      MiniGameController3.prototype.showEndGame = function() {
        var _this = this;
        return new Promise(function(res, rej) {
          return __awaiter(_this, void 0, void 0, function() {
            var _this = this;
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                return [ 4, util.game.delay(3e3) ];

               case 1:
                _a.sent();
                if (!this.gameResult || !this.mainGame) return [ 2 ];
                this.gameResult.active = true;
                this.mainGame.runAction(cc.fadeOut(.3));
                this.gameResult.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
                  _this.coinController.updateUserBalance(_this.winScore);
                  api.sendGD({
                    e: api.key.SLOT_GET_BONUS,
                    gtype: config.game.SMID[3]
                  }, function(err, data) {
                    game.log(data);
                  });
                }) ]));
                res();
                return [ 2 ];
              }
            });
          });
        });
      };
      MiniGameController3.prototype.backToSlot = function() {
        var _this = this;
        if (!this.node) return;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          store.emit(store.key.UPDATE_USER_BALANCE, game.user.balance, 0);
          _this.node.destroy();
          view.screen.slot.SlotController.bonusNode = void 0;
          view.screen.bonus = void 0;
          view.screen.slot && view.screen.slot.SlotController.checkAutoSpin(_this._slotController);
          controller.ui.showBar();
        }) ]));
      };
      __decorate([ property(ResourceMinigame3_1.default) ], MiniGameController3.prototype, "resourceController", void 0);
      __decorate([ property(cc.Node) ], MiniGameController3.prototype, "rowBonus", void 0);
      __decorate([ property(cc.Label) ], MiniGameController3.prototype, "total", void 0);
      __decorate([ property(cc.Node) ], MiniGameController3.prototype, "gameResult", void 0);
      __decorate([ property(cc.Node) ], MiniGameController3.prototype, "mainGame", void 0);
      __decorate([ property(cc.Label) ], MiniGameController3.prototype, "scoreLabel", void 0);
      __decorate([ property(cc.Node) ], MiniGameController3.prototype, "startMinigame", void 0);
      MiniGameController3 = __decorate([ ccclass ], MiniGameController3);
      return MiniGameController3;
    }(cc.Component);
    exports.default = MiniGameController3;
    cc._RF.pop();
  }, {
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "./ResourceMinigame3": "ResourceMinigame3"
  } ],
  MinigameController4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "94608N0ZWxGmJDiObfqNnTw", "MinigameController4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceMinigame4_1 = require("./ResourceMinigame4");
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var AtributeStatic_1 = require("../AtributeStatic");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MinigameController4 = function(_super) {
      __extends(MinigameController4, _super);
      function MinigameController4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.itemsContainer = null;
        _this.mainGame = null;
        _this.gameResult = null;
        _this.labelGr = null;
        _this.labelMa = null;
        _this.labelMino = null;
        _this.labelMini = null;
        _this.coinLabel = null;
        _this.labelJackpot = null;
        _this.resourceController = null;
        _this._slotController = null;
        _this.bonusList = [];
        _this._isLock = false;
        _this._time = 0;
        _this.idJackpot = 0;
        _this.coinController = null;
        _this.score = 0;
        _this.listItem = [];
        _this.bgBig = null;
        _this.game = null;
        _this.result = null;
        _this.title = null;
        _this.top = null;
        return _this;
      }
      MinigameController4.prototype.startMiniGame = function(dataBonus, grand, major, minor, mini) {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              AtributeStatic_1.default.bonusData = dataBonus;
              this.bonusList = dataBonus;
              this.idJackpot = dataBonus[dataBonus.length - 1];
              this.labelGr.string = grand.string;
              this.labelMa.string = major.string;
              this.labelMino.string = minor.string;
              this.labelMini.string = mini.string;
              this.bgBig = cc.find("bg-big", this.node);
              this.top = cc.find("top", this.node);
              this.game = cc.find("game", this.node);
              this.result = cc.find("result-table", this.node);
              this.title = cc.find("title", this.game);
              this.itemsContainer = cc.find("itemsContainer", this.game);
              this.coinController = new CoinLabel_1.default(this.coinLabel.getComponent(cc.Label), 9);
              this.coinController.updateUserBalance(this.score);
              game.log("score = ", this.score);
              this.listItem = this.itemsContainer.children;
              this.resourceController.resourceController = this._slotController.resourceController;
              return [ 4, this.resourceController.loadResources() ];

             case 1:
              _a.sent();
              this.listItem.forEach(function(item) {
                item.addComponent(cc.Sprite);
                var sprites = item.getComponent(cc.Sprite);
                sprites.spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
                  return item.name == _this.resourceController.listResourceName.itemNormal[0];
                });
                item.once(cc.Node.EventType.TOUCH_END, function(e) {
                  _this.selectItem(e.currentTarget);
                });
              });
              return [ 2 ];
            }
          });
        });
      };
      MinigameController4.prototype.selectItem = function(node) {
        return __awaiter(this, void 0, void 0, function() {
          var num;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (this._isLock) return [ 2 ];
              this._isLock = true;
              num = this.bonusList[this._time];
              this.itemAction(node, num);
              this._time++;
              if (!(this._time == this.bonusList.length)) return [ 3, 3 ];
              return [ 4, util.game.delay(2e3) ];

             case 1:
              _a.sent();
              return [ 4, this.showEndGame() ];

             case 2:
              _a.sent();
              _a.label = 3;

             case 3:
              this._isLock = false;
              return [ 2 ];
            }
          });
        });
      };
      MinigameController4.prototype.itemAction = function(node, num) {
        var _this = this;
        node.children[0].scale = .3;
        node.children[0].addComponent(cc.Sprite);
        node.children[0].getComponent(cc.Sprite).spriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.items[num];
        });
        node.runAction(cc.sequence(cc.scaleTo(.3, 1), cc.delayTime(.5), cc.fadeOut(.2), cc.callFunc(function() {
          node.children[0].active = true;
          node.children[0].runAction(cc.sequence(cc.scaleTo(.3, 1.3), cc.scaleTo(.3, 1)));
          node.opacity = 255;
        })));
      };
      MinigameController4.prototype.setWinGame = function(id) {
        var labelJP = [ "Grand Jackpot", "Major Jackpot", "Minor Jackpot", "Mini Jackpot" ];
        var coinJP = [ this.labelGr.string, this.labelMa.string, this.labelMino.string, this.labelMini.string ];
        this.coinLabel.string = coinJP[id];
        this.labelJackpot.string = labelJP[id];
      };
      MinigameController4.prototype.showEndGame = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            return [ 2, new Promise(function(res, rej) {
              return __awaiter(_this, void 0, void 0, function() {
                var _this = this;
                return __generator(this, function(_a) {
                  switch (_a.label) {
                   case 0:
                    this.gameResult.active = true;
                    this.gameResult.opacity = 0;
                    this.setWinGame(this.idJackpot);
                    return [ 4, util.game.delay(1e3) ];

                   case 1:
                    _a.sent();
                    this.mainGame.runAction(cc.fadeOut(.3));
                    this.gameResult.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
                      _this.gameResult.zIndex = 1;
                      var slotController = view.slot[4].SlotController;
                      _this.score = slotController.listJP[_this.idJackpot];
                      _this.coinController.updateUserBalance(_this.score);
                      api.sendGD({
                        e: api.key.SLOT_GET_BONUS,
                        gtype: config.game.SMID[4]
                      }, function(err, data) {
                        game.log(data);
                      });
                    }) ]));
                    res();
                    return [ 2 ];
                  }
                });
              });
            }) ];
          });
        });
      };
      MinigameController4.prototype.backToSlot = function() {
        var _this = this;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          store.emit(store.key.UPDATE_USER_BALANCE, game.user.balance, 0);
          _this.node.destroy();
          view.screen.slot.SlotController.bonusNode = void 0;
          view.screen.bonus = void 0;
          view.screen.slot && view.screen.slot.SlotController.checkAutoSpin(_this._slotController);
          controller.ui.showBar();
        }) ]));
      };
      __decorate([ property(cc.Node) ], MinigameController4.prototype, "itemsContainer", void 0);
      __decorate([ property(cc.Node) ], MinigameController4.prototype, "mainGame", void 0);
      __decorate([ property(cc.Node) ], MinigameController4.prototype, "gameResult", void 0);
      __decorate([ property(cc.Label) ], MinigameController4.prototype, "labelGr", void 0);
      __decorate([ property(cc.Label) ], MinigameController4.prototype, "labelMa", void 0);
      __decorate([ property(cc.Label) ], MinigameController4.prototype, "labelMino", void 0);
      __decorate([ property(cc.Label) ], MinigameController4.prototype, "labelMini", void 0);
      __decorate([ property(cc.Label) ], MinigameController4.prototype, "coinLabel", void 0);
      __decorate([ property(cc.Label) ], MinigameController4.prototype, "labelJackpot", void 0);
      __decorate([ property(ResourceMinigame4_1.default) ], MinigameController4.prototype, "resourceController", void 0);
      MinigameController4 = __decorate([ ccclass ], MinigameController4);
      return MinigameController4;
    }(cc.Component);
    exports.default = MinigameController4;
    cc._RF.pop();
  }, {
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "../AtributeStatic": "AtributeStatic",
    "./ResourceMinigame4": "ResourceMinigame4"
  } ],
  MinigameController5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1958fQ+oxFFpqrhzE+2a3xA", "MinigameController5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceMiniGame5_1 = require("./ResourceMiniGame5");
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MinigameController5 = function(_super) {
      __extends(MinigameController5, _super);
      function MinigameController5() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.itemsContainer = null;
        _this.scoreLabel = null;
        _this.rightBox = null;
        _this.coinResultLabel = null;
        _this.resourceController = null;
        _this._slotController = null;
        _this.selectTable = null;
        _this.mainGame = null;
        _this.gameResult = null;
        _this.coinController = null;
        _this.coinResultController = null;
        _this.playArray = [];
        _this.baseScore = 0;
        _this.listItem = [];
        _this._isLock = false;
        _this.score = 0;
        _this._time = 0;
        _this._trappedTime = 0;
        return _this;
      }
      MinigameController5.prototype.startMiniGame = function(playArray, baseScore) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            this.playArray = playArray;
            this.baseScore = baseScore;
            this.node.children.forEach(function(item) {
              return item.active = false;
            });
            this.node.children[0].active = true;
            this.selectTable = cc.find("select-table", this.node);
            this.mainGame = cc.find("main-game", this.node);
            this.gameResult = cc.find("result-table", this.node);
            this.coinController = new CoinLabel_1.default(this.scoreLabel);
            this.coinController.updateUserBalance(this.score);
            this.coinResultController = new CoinLabel_1.default(this.coinResultLabel, 15, "", 60);
            this.coinResultController.updateUserBalance(this.score);
            this.listItem = this.itemsContainer.children;
            this.selectTable.active = true;
            this.resourceController.resourceController = this._slotController.resourceController;
            this.resourceController.loadResources();
            return [ 2 ];
          });
        });
      };
      MinigameController5.prototype.selectMiniGame = function() {
        var _this = this;
        this.mainGame.active = true;
        this.mainGame.opacity = 0;
        this.mainGame.runAction(cc.sequence(cc.fadeIn(.5), cc.callFunc(function() {
          _this.selectTable.active = false;
        })));
        this.loadMainGame();
      };
      MinigameController5.prototype.loadMainGame = function() {
        var _this = this;
        this.listItem.forEach(function(itemNode, index) {
          itemNode.opacity = 0;
          var sprite = itemNode.children[0].addComponent(cc.Sprite);
          sprite.spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
            return item.name == _this.resourceController.listResourceName.items[index + 1].normal;
          });
          itemNode.children[0].once(cc.Node.EventType.TOUCH_END, function(e) {
            _this.selectItem(e.currentTarget);
          });
          setTimeout(function() {
            itemNode.runAction(cc.fadeIn(.5));
          }, 1e3 * Math.random() + 500);
        });
        this.updateTrap();
      };
      MinigameController5.prototype.selectItem = function(node) {
        return __awaiter(this, void 0, void 0, function() {
          var num;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (this._isLock) return [ 2 ];
              this._isLock = true;
              num = this.playArray[this._time];
              if (!(0 == num)) return [ 3, 4 ];
              this._trappedTime++;
              this.updateTrap();
              return [ 4, this.itemAction(node, new cc.Color(255, 0, 0, 255), 0) ];

             case 1:
              _a.sent();
              if (!(this._trappedTime >= 2)) return [ 3, 3 ];
              return [ 4, util.game.delay(1e3) ];

             case 2:
              _a.sent();
              this.showEndGame();
              _a.label = 3;

             case 3:
              return [ 3, 6 ];

             case 4:
              this.score += num * this.baseScore;
              setTimeout(function() {
                _this.scoreLabel.node.runAction(cc.sequence([ cc.scaleTo(.2, 1.2), cc.scaleTo(.2, 1) ]));
                game.log(_this.score);
                _this.coinController.updateUserBalance(_this.score);
              }, 300);
              this.itemAction(node, new cc.Color(255, 255, 0, 255), num * this.baseScore);
              return [ 4, util.game.delay(150) ];

             case 5:
              _a.sent();
              _a.label = 6;

             case 6:
              this._time++;
              this._isLock = false;
              return [ 2 ];
            }
          });
        });
      };
      MinigameController5.prototype.itemAction = function(node, color, score) {
        var _this = this;
        var name = node.name;
        var index = Number(name.slice(-2)).toString();
        var shadowNode = cc.instantiate(node);
        var shadowSprite = shadowNode.getComponent(cc.Sprite);
        var scoreNode = node.parent.children[1];
        var scoreLabel = scoreNode.getComponent(cc.Label);
        node.runAction(cc.sequence([ cc.delayTime(.2), cc.fadeOut(1), cc.callFunc(function() {
          node.destroy();
        }) ]));
        shadowNode.parent = node.parent;
        shadowSprite.spriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.items[index].white;
        });
        shadowNode.color = color;
        shadowNode.opacity = 0;
        shadowNode.runAction(cc.sequence([ cc.fadeTo(.4, 150), cc.fadeOut(1), cc.callFunc(function() {
          shadowNode.destroy();
        }) ]));
        if (score) {
          scoreNode.active = true;
          scoreNode.opacity = 0;
          scoreNode.setPosition(cc.v2(node.x, node.y));
          scoreLabel.fontSize = 50;
          scoreLabel.lineHeight = 60;
          scoreLabel.string = util.string.formatMoney(score);
          scoreNode.runAction(cc.sequence([ cc.delayTime(.4), cc.moveBy(1, cc.v2(1, 45)) ]));
          scoreNode.runAction(cc.sequence([ cc.delayTime(.2), cc.fadeIn(.3), cc.delayTime(.5), cc.fadeOut(.5), cc.callFunc(function() {
            scoreNode.destroy();
          }) ]));
        } else {
          var failNode = new cc.Node();
          var failSprite = failNode.addComponent(cc.Sprite);
          failSprite.spriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
            return item.name == _this.resourceController.listResourceName.fail.active;
          });
          failNode.parent = node.parent;
          failNode.color = new cc.Color(255, 255, 255, 255);
          failNode.setPosition(cc.v2(node.x, node.y));
          failNode.runAction(cc.sequence([ cc.delayTime(.3), cc.moveBy(1, cc.v2(1, 45)) ]));
          failNode.runAction(cc.sequence([ cc.delayTime(.2), cc.fadeIn(.3), cc.delayTime(.5), cc.fadeOut(.5), cc.callFunc(function() {
            scoreNode.destroy();
          }) ]));
        }
      };
      MinigameController5.prototype.updateTrap = function() {
        var _this = this;
        var fail1 = this.rightBox.children[1].getComponent(cc.Sprite);
        var fail2 = this.rightBox.children[2].getComponent(cc.Sprite);
        var fireNormalSpriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.fail.normal;
        });
        var fireAcitveSpriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.fail.active;
        });
        switch (this._trappedTime) {
         case 1:
          fail1.spriteFrame = fireAcitveSpriteFrame;
          setTimeout(function() {
            fail1.node.children[0].active = true;
          }, 200);
          break;

         case 2:
          fail2.spriteFrame = fireAcitveSpriteFrame;
          setTimeout(function() {
            fail2.node.children[0].active = true;
          }, 200);
          break;

         default:
          fail1.spriteFrame = fireNormalSpriteFrame;
          fail2.spriteFrame = fireNormalSpriteFrame;
          fail1.node.children[0].active = false;
          fail2.node.children[0].active = false;
        }
      };
      MinigameController5.prototype.showEndGame = function() {
        var _this = this;
        controller.ui.showModel();
        this.gameResult.active = true;
        this.gameResult.opacity = 0;
        this.gameResult.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
          _this.coinResultController.updateUserBalance(_this.score);
          api.sendGD({
            e: api.key.SLOT_GET_BONUS,
            gtype: config.game.SMID[5]
          }, function(err, data) {
            game.log(data);
          });
          controller.ui.hideModel();
        }) ]));
      };
      MinigameController5.prototype.backToSlot = function() {
        var _this = this;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          store.emit(store.key.UPDATE_USER_BALANCE, game.user.balance, 0);
          _this.node.destroy();
          view.screen.slot.SlotController.bonusNode = void 0;
          view.screen.bonus = void 0;
          view.screen.slot && view.screen.slot.SlotController.checkAutoSpin(_this._slotController);
          controller.ui.showBar();
        }) ]));
      };
      __decorate([ property(cc.Node) ], MinigameController5.prototype, "itemsContainer", void 0);
      __decorate([ property(cc.Label) ], MinigameController5.prototype, "scoreLabel", void 0);
      __decorate([ property(cc.Node) ], MinigameController5.prototype, "rightBox", void 0);
      __decorate([ property(cc.Label) ], MinigameController5.prototype, "coinResultLabel", void 0);
      __decorate([ property(ResourceMiniGame5_1.default) ], MinigameController5.prototype, "resourceController", void 0);
      MinigameController5 = __decorate([ ccclass ], MinigameController5);
      return MinigameController5;
    }(cc.Component);
    exports.default = MinigameController5;
    cc._RF.pop();
  }, {
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "./ResourceMiniGame5": "ResourceMiniGame5"
  } ],
  MinigameController6: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "981af1BTgZF/bp1iOEyEXSR", "MinigameController6");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceMiniGame6_1 = require("./ResourceMiniGame6");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MinigameController6 = function(_super) {
      __extends(MinigameController6, _super);
      function MinigameController6() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.startSpin = null;
        _this.mainReel1 = null;
        _this.mainReel2 = null;
        _this.backgroundSpin = null;
        _this.deactiveSpin = null;
        _this.resourceController = null;
        _this._slotController = null;
        _this.gameCount = 0;
        _this.stickyWildReel = [];
        _this.extraSpin = 0;
        _this.flagSpin = false;
        _this.readyToStop = true;
        _this.isSpin = false;
        _this.itemAmount = 8;
        _this.maxVelocity = 700;
        _this.acceleration = 300;
        _this.resultPosition = [];
        _this.originalRotation = 0;
        _this.reel1Result = -1;
        _this.reel2Result = -1;
        _this.reel1Array = [ 2, 3, 4, 3, 2, 5, 4, 3 ];
        _this.reel2Array = [ "[4,5]", "[1]", "[3,5]", "[1,3,5]", "[3,4,5]", "[1,3]", "[1,2,4,5]", "[3,4]" ];
        _this._time = 0;
        return _this;
      }
      MinigameController6.prototype.onLoad = function() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0);
        window["reel1"] = this.mainReel1;
        window["reel2"] = this.mainReel2;
        window["mini"] = this;
      };
      MinigameController6.prototype.startMinigame = function(gameCount, stickyWildReel, extraSpin) {
        var _this = this;
        this.gameCount = gameCount;
        this.stickyWildReel = stickyWildReel;
        this.extraSpin = extraSpin || 0;
        this.backgroundSpin.runAction(cc.rotateBy(1, 100).repeatForever());
        this.backgroundSpin.runAction(cc.sequence([ cc.fadeTo(1, 100), cc.fadeTo(1, 255) ]).repeatForever());
        this.resultPosition = Array(this.itemAmount).fill(0).map(function(item, index) {
          return (_this.originalRotation + index * (360 / _this.itemAmount)) % 360;
        });
        this.resourceController.resourceController = this._slotController.resourceController;
        this.resourceController.loadResources();
      };
      MinigameController6.prototype.setPosition = function() {
        var _this = this;
        setTimeout(function() {
          _this.mainReel1.node.setPosition(0, 0);
          _this.mainReel2.node.setPosition(0, 0);
        }, 100);
      };
      MinigameController6.prototype.spin = function() {
        var _this = this;
        if (this.isSpin) return;
        var gameCount = this.gameCount;
        this.extraSpin > 0 && (gameCount = 5);
        var reel1Array = this.reel1Array.reduce(function(array, item, index) {
          return item == gameCount ? array.concat([ index ]) : array;
        }, []);
        var reel2Json = JSON.stringify(this.stickyWildReel);
        this.reel1Result = reel1Array[Math.random() * reel1Array.length | 0];
        this.reel2Result = this.reel2Array.findIndex(function(item) {
          return item === reel2Json;
        });
        this.isSpin = true;
        this.flagSpin = true;
        this.readyToStop = false;
        this.deactiveSpin.active = true;
        this.deactiveSpin.opacity = 100;
        this.deactiveSpin.runAction(cc.fadeIn(.3));
        setTimeout(function() {
          _this.flagSpin = false;
        }, 5e3);
      };
      MinigameController6.prototype.backToSlot = function() {
        var _this = this;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          api.sendGD({
            e: api.key.SLOT_GET_BONUS,
            gtype: config.game.SMID[6]
          }, function(error, data) {
            if (error) return;
            _this._slotController.dataStatus.freeReelGame = _this._slotController.dataStatus.freeReelGame || {};
            _this._slotController.dataStatus.freeReelGame.gameCount = data.gameCount;
            _this._slotController.dataStatus.freeReelGame.userSpined = true;
            _this._slotController.dataStatus.freeReelGame.freeSpin = data.freeSpin;
            _this._slotController.dataStatus.freeSpin.t = data.freeSpin + (0 | data.extraSpin);
            _this._slotController.dataStatus.freeSpin.c = data.freeSpin + (0 | data.extraSpin);
            _this._slotController.dataStatus.freeSpin.w = 0;
            _this._slotController.startSlot(true);
            _this.node.destroy();
            view.screen.slot.SlotController.bonusNode = void 0;
            view.screen.bonus = void 0;
            view.screen.slot && view.screen.slot.SlotController.checkAutoSpin(_this._slotController);
            controller.ui.showBar();
          });
        }) ]));
      };
      MinigameController6.prototype.endSpin = function(currentRotation, result, direction, node) {
        var _this = this;
        void 0 === direction && (direction = 1);
        var resPosition = this.resultPosition[result];
        var s = resPosition - direction * currentRotation + 720;
        var delta = 360 / this.itemAmount / 10;
        var time = this._time | s / 200;
        this._time = time;
        node.runAction(cc.sequence([ cc.rotateBy(time, (s + delta) * direction).easing(cc.easeSineOut()), cc.rotateBy(.6, -delta * direction).easing(cc.easeBackOut()), cc.callFunc(function() {
          setTimeout(function() {
            _this.isSpin = false;
            _this._time = 0;
          }, 200);
          _this.deactiveSpin.runAction(cc.fadeOut(.2));
          if (_this.extraSpin > 0) {
            _this.extraSpin = 0;
            return;
          }
          setTimeout(function() {
            direction > 0 && _this.backToSlot();
          }, 500);
        }) ]));
      };
      MinigameController6.prototype.update = function(dt) {
        if (this.flagSpin) {
          if (Math.abs(this.mainReel1.angularVelocity) >= this.maxVelocity) return;
          this.mainReel1.angularVelocity += this.acceleration * dt * 1;
          this.mainReel2.angularVelocity += this.acceleration * dt * -1;
        } else {
          if (this.readyToStop) return;
          if (Math.abs(this.mainReel1.angularVelocity) <= 500) {
            this.mainReel1.angularVelocity = 0;
            this.mainReel2.angularVelocity = 0;
            this.endSpin(this.mainReel1.node.rotation % 360, this.reel1Result, 1, this.mainReel1.node);
            this.endSpin(this.mainReel2.node.rotation % 360, this.reel2Result, -1, this.mainReel2.node);
            this.readyToStop = true;
            return;
          }
          this.mainReel1.angularVelocity += -this.acceleration * dt * 1;
          this.mainReel2.angularVelocity += -this.acceleration * dt * -1;
        }
      };
      __decorate([ property(cc.Node) ], MinigameController6.prototype, "startSpin", void 0);
      __decorate([ property(cc.RigidBody) ], MinigameController6.prototype, "mainReel1", void 0);
      __decorate([ property(cc.RigidBody) ], MinigameController6.prototype, "mainReel2", void 0);
      __decorate([ property(cc.Node) ], MinigameController6.prototype, "backgroundSpin", void 0);
      __decorate([ property(cc.Node) ], MinigameController6.prototype, "deactiveSpin", void 0);
      __decorate([ property(ResourceMiniGame6_1.default) ], MinigameController6.prototype, "resourceController", void 0);
      MinigameController6 = __decorate([ ccclass ], MinigameController6);
      return MinigameController6;
    }(cc.Component);
    exports.default = MinigameController6;
    cc._RF.pop();
  }, {
    "./ResourceMiniGame6": "ResourceMiniGame6"
  } ],
  MinigameController7: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9d157zJ0idPO49aCIicrPkX", "MinigameController7");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceMiniGame7_1 = require("./ResourceMiniGame7");
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MinigameController7 = function(_super) {
      __extends(MinigameController7, _super);
      function MinigameController7() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.buttonThuner = null;
        _this.mainReel = null;
        _this.resourceController = null;
        _this.frostmourne = null;
        _this.meltingIce = [];
        _this.thunder = null;
        _this.buttonFalse = null;
        _this.supper = null;
        _this.labelShield = null;
        _this.alpha = null;
        _this.freeSpin = null;
        _this.reward = null;
        _this.overlay = null;
        _this.jackpotsFreeSpins = null;
        _this._slotController = null;
        _this.gameCount = null;
        _this.flagSpin = false;
        _this.readyToStop = true;
        _this.isSpin = false;
        _this.itemAmount = 10;
        _this.maxVelocity = 600;
        _this.acceleration = 180;
        _this.resultPosition = [];
        _this.originalRotation = 0;
        _this.reelResult = -1;
        _this.reelArray = [ 2, "MINI", 5, "MINOR", "f12", "MINI", 10, "MEGA", "f8", "MAJOR" ];
        _this._time = 0;
        _this.isPlayGame = false;
        return _this;
      }
      MinigameController7.prototype.onLoad = function() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0);
      };
      MinigameController7.prototype.startMiniGame = function(gameCount) {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            game.log(gameCount.result);
            "SUPPER" == gameCount.type && (this.supper.active = true);
            this.resourceController.resourceController = this._slotController.resourceController;
            setTimeout(function() {
              _this.mainReel.node.runAction(cc.moveTo(0, cc.v2(0, -820)));
              _this.mainReel.node.active = true;
              var data = 0;
              var arrResult = [ 2, 5, 10 ];
              data = _this._slotController.dataSpin ? _this._slotController.dataSpin.spinResult.totalBet : _this._slotController.dataStatus.lastBet;
              _this.labelShield.children.forEach(function(item, index) {
                item.getComponent(cc.Label).string = "" + util.game.abbreviateNumber(arrResult[index] * data, 2);
              });
            }, 100);
            this.gameCount = gameCount;
            this.resultPosition = Array(this.itemAmount).fill(0).map(function(item, index) {
              return (_this.originalRotation + index * (360 / _this.itemAmount)) % 360;
            });
            this.resourceController.loadResources();
            this.spin();
            this.frostmourne.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
              _this.mainReel.node.runAction(cc.sequence([ cc.fadeIn(.5), cc.moveTo(1.4, cc.v2(0, -420)) ]));
            }), cc.moveTo(1.5, cc.v2(0, 360)).easing(cc.easeQuadraticActionIn()), cc.moveTo(.1, cc.v2(0, 320)) ]));
            setTimeout(function() {
              if (!_this.buttonThuner || !_this) return;
              _this.buttonThuner.opacity = 0;
              _this.buttonThuner.active = true;
              _this.buttonThuner.getChildByName("stop_active").getComponent(sp.Skeleton).animation = "thunder_3";
              _this.buttonThuner.runAction(cc.sequence([ cc.scaleTo(0, .2), cc.callFunc(function() {
                _this.buttonThuner.opacity = 255;
                _this.nodeScale(_this.buttonThuner, 1.1, .3, .1);
              }) ]));
            }, 3e3);
            setTimeout(function() {
              if (!_this.flagSpin) return;
              _this.flagSpin && _this.stopMinigame();
            }, 1e4);
            return [ 2 ];
          });
        });
      };
      MinigameController7.prototype.spin = function() {
        if (this.isSpin) return;
        var gameCount = this.gameCount.result;
        var reelsArray = this.reelArray.reduce(function(array, item, index) {
          return item == gameCount ? array.concat([ index ]) : array;
        }, []);
        this.reelResult = reelsArray[Math.floor(Math.random() * reelsArray.length)];
        this.isSpin = true;
        this.flagSpin = true;
        this.readyToStop = false;
      };
      MinigameController7.prototype.showEndGame = function() {
        var _this = this;
        return new Promise(function(res, rej) {
          return __awaiter(_this, void 0, void 0, function() {
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                return [ 4, util.game.delay(500) ];

               case 1:
                _a.sent();
                api.sendGD({
                  e: api.key.SLOT_GET_BONUS,
                  gtype: config.game.SMID[7]
                }, function(err, data) {
                  game.log(data);
                });
                res();
                return [ 2 ];
              }
            });
          });
        });
      };
      MinigameController7.prototype.backToSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, this.showEndGame() ];

             case 1:
              _a.sent();
              if (!this.node || !this) return [ 2 ];
              this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
                store.emit(store.key.UPDATE_USER_BALANCE, game.user.balance, 9);
                _this.node.destroy();
                view.screen.slot.SlotController.bonusNode = void 0;
                view.screen.bonus = void 0;
                view.screen.slot && view.screen.slot.SlotController.checkAutoSpin(_this._slotController);
                controller.ui.showBar();
              }), cc.callFunc(function() {
                if (_this.gameCount.fs > 0) {
                  var fs = void 0;
                  fs = _this._slotController.dataSpin ? _this._slotController.dataSpin.freeSpin.c : _this._slotController.dataStatus.freeSpin.c;
                  var slot = view.screen.slot.SlotController;
                  slot.freeSpin = fs + _this.gameCount.fs;
                  slot.statusGame = fs + _this.gameCount.fs;
                  view.bar.bottom.gameBar.updateStatus(slot.statusGame);
                }
              }) ]));
              return [ 2 ];
            }
          });
        });
      };
      MinigameController7.prototype.stopMinigame = function() {
        this.buttonThuner.active = false;
        this.buttonFalse.active = true;
        this.buttonFalse.getChildByName("stop_ani").getComponent(sp.Skeleton).animation = "thunder";
        this.buttonFalse.getChildByName("stop_active").getComponent(sp.Skeleton).animation = "thunder_3";
        this.frostmourne.getComponent(cc.Animation).play();
        this.flagSpin = false;
      };
      MinigameController7.prototype.endSpin = function(currentRotation, result) {
        var _this = this;
        var s = this.resultPosition[result] - currentRotation + 720;
        var delta = 360 / this.itemAmount;
        var time = this._time | s / 150;
        this._time = time;
        this.mainReel.node.runAction(cc.sequence([ cc.callFunc(function() {
          setTimeout(function() {
            _this.frostmourne.getComponent(cc.Animation).pause();
            _this.frostmourne.runAction(cc.sequence([ cc.moveTo(.1, cc.v2(0, 360)), cc.moveTo(0, cc.v2(0, 250)), cc.moveTo(.1, cc.v2(0, 240)), cc.callFunc(function() {
              _this.meltingIce[0].active = false;
              _this.meltingIce[1].active = true;
              _this.meltingIce[1].getComponent(sp.Skeleton).animation = "animation";
              _this.thunder.active = true;
              _this.thunder.getComponent(sp.Skeleton).animation = "animation";
              _this.alphaShield(result);
              _this.mainReel.node.runAction(cc.moveTo(.1, cc.v2(0, -430)));
            }), cc.moveTo(.1, cc.v2(0, 250)), cc.callFunc(function() {
              _this.mainReel.node.runAction(cc.moveTo(.1, cc.v2(0, -420)));
            }) ]));
          }, 1e3 * time - 150);
        }), cc.rotateBy(time, s + delta), cc.callFunc(function() {
          setTimeout(function() {
            _this.isSpin = false;
            _this._time = 0;
          }, 200);
          _this.showJackpots(result);
        }) ]));
      };
      MinigameController7.prototype.showJackpots = function(rs) {
        return __awaiter(this, void 0, void 0, function() {
          var color_1, reward, flag_1;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, util.game.delay(3e3) ];

             case 1:
              _a.sent();
              if (!(this.gameCount.fs > 0)) return [ 3, 2 ];
              this.jackpotsFreeSpins.opacity = 0;
              this.jackpotsFreeSpins.active = true;
              this.jackpotsFreeSpins.runAction(cc.sequence([ cc.scaleTo(0, .1), cc.callFunc(function() {
                _this.jackpotsFreeSpins.children[2].children[1].getComponent(cc.Label).string = _this.gameCount.fs;
                _this.jackpotsFreeSpins.children[1].active = false;
                _this.overlay.active = true;
                _this.jackpotsFreeSpins.opacity = 255;
                _this.nodeScale(_this.jackpotsFreeSpins, 1.1, .3, .1);
              }), cc.callFunc(function() {
                setTimeout(function() {
                  if (!_this.jackpotsFreeSpins || !_this) return;
                  var start = _this.jackpotsFreeSpins.children[1];
                  start.opacity = 0;
                  start.active = true;
                  start.runAction(cc.sequence([ cc.scaleTo(0, .1), cc.callFunc(function() {
                    start.opacity = 255;
                    _this.nodeScale(start, 1.1, .3, .1);
                  }) ]));
                }, 200);
              }) ]));
              return [ 3, 5 ];

             case 2:
              color_1 = {
                0: [ 253, 168, 83 ],
                1: [ 102, 208, 38 ],
                2: [ 57, 189, 252 ],
                3: [ 241, 57, 111 ],
                4: [ 253, 183, 43 ],
                5: [ 253, 183, 43 ],
                6: [ 253, 183, 43 ]
              };
              reward = [ "MINI", "MINOR", "MAJOR", "MEGA", 2, 5, 10 ];
              return [ 4, reward.forEach(function(item, index) {
                if (item == _this.reelArray[rs]) {
                  _this.reward.opacity = 0;
                  _this.overlay.active = true;
                  _this.reward.active = true;
                  _this.reward.children[0].color = cc.color(color_1[index][0], color_1[index][1], color_1[index][2]);
                  _this.reward.runAction(cc.sequence([ cc.callFunc(function() {
                    isNaN(_this.reelArray[rs]) ? _this.reward.children[2].getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
                      return item.name == _this.resourceController.listResourceName.jackpots[index + 1];
                    }) : _this.reward.children[2].getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
                      return item.name == _this.resourceController.listResourceName.jackpots[5];
                    });
                  }), cc.scaleTo(0, .1), cc.callFunc(function() {
                    _this.reward.opacity = 255;
                    var totalWin;
                    _this.coinController = new CoinLabel_1.default(_this.reward.children[3].getComponent(cc.Label), 8);
                    totalWin = _this._slotController.dataSpin ? _this._slotController.dataSpin.spinResult.score.sum[2].w * _this._slotController.dataSpin.spinResult.totalBet : _this._slotController.dataStatus.bonus.w * _this._slotController.dataStatus.lastBet;
                    "SUPPER" === _this.gameCount.type ? _this.reward.children[3].getComponent(cc.Label).string = "" + _this.coinController.updateUserBalance(2 * totalWin) : _this.reward.children[3].getComponent(cc.Label).string = "" + _this.coinController.updateUserBalance(totalWin);
                    _this.nodeScale(_this.reward, 1.2, .3, .1);
                  }) ]));
                }
              }) ];

             case 3:
              _a.sent();
              return [ 4, util.game.delay(1e3) ];

             case 4:
              _a.sent();
              flag_1 = 1;
              this.overlay.on(cc.Node.EventType.TOUCH_START, function(event) {
                if (1 === flag_1) {
                  _this.isPlayGame = true;
                  _this.backToSlot();
                  flag_1++;
                }
              });
              setTimeout(function() {
                if (!_this) return;
                _this.isPlayGame || _this.backToSlot();
              }, 1e4);
              _a.label = 5;

             case 5:
              return [ 2 ];
            }
          });
        });
      };
      MinigameController7.prototype.alphaShield = function(res) {
        (res > 9 || res < 0 || "number" != typeof res) && (res = 0);
        var color = {
          0: [ 250, 255, 255 ],
          1: [ 253, 144, 39 ],
          2: [ 250, 255, 255 ],
          3: [ 102, 227, 42 ],
          4: [ 255, 245, 55 ],
          5: [ 253, 144, 39 ],
          6: [ 250, 255, 255 ],
          7: [ 253, 98, 241 ],
          8: [ 255, 245, 55 ],
          9: [ 83, 223, 253 ]
        };
        this.alpha.active = true;
        this.alpha.color = new cc.Color(color[res][0], color[res][1], color[res][2]);
        this.alpha.runAction(cc.repeatForever(cc.sequence([ cc.fadeIn(.1), cc.fadeOut(.9) ])));
        if (4 === res || 8 === res) {
          this.freeSpin.active = true;
          4 === res ? this.freeSpin.children[0].active = true : this.freeSpin.children[1].active = true;
        }
      };
      MinigameController7.prototype.nodeScale = function(node, scale, timeStar, timeEnd) {
        node.runAction(cc.sequence([ cc.scaleTo(timeStar, scale), cc.scaleTo(timeEnd, 1) ]));
      };
      MinigameController7.prototype.update = function(dt) {
        if (this.flagSpin) {
          if (Math.abs(this.mainReel.angularVelocity) >= this.maxVelocity) return;
          this.mainReel.angularVelocity += this.acceleration * dt;
        } else {
          if (this.readyToStop) return;
          if (Math.abs(this.mainReel.angularVelocity) <= 180) {
            this.mainReel.angularVelocity = 0;
            this.endSpin(this.mainReel.node.rotation % 360, this.reelResult);
            this.readyToStop = true;
            return;
          }
          this.mainReel.angularVelocity += -this.acceleration * dt;
        }
      };
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "buttonThuner", void 0);
      __decorate([ property(cc.RigidBody) ], MinigameController7.prototype, "mainReel", void 0);
      __decorate([ property(ResourceMiniGame7_1.default) ], MinigameController7.prototype, "resourceController", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "frostmourne", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "meltingIce", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "thunder", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "buttonFalse", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "supper", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "labelShield", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "alpha", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "freeSpin", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "reward", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "overlay", void 0);
      __decorate([ property(cc.Node) ], MinigameController7.prototype, "jackpotsFreeSpins", void 0);
      MinigameController7 = __decorate([ ccclass ], MinigameController7);
      return MinigameController7;
    }(cc.Component);
    exports.default = MinigameController7;
    cc._RF.pop();
  }, {
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "./ResourceMiniGame7": "ResourceMiniGame7"
  } ],
  MinigameController8: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "938dfVsB4lMZoA87UUNOy5C", "MinigameController8");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var ResourceMiniGame8_1 = require("./ResourceMiniGame8");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MinigameController8 = function(_super) {
      __extends(MinigameController8, _super);
      function MinigameController8() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.processBar = null;
        _this.itemsContainer = null;
        _this.rightBox = null;
        _this.coinResultLabel = null;
        _this.resourceController = null;
        _this.failNode = null;
        _this.bar = null;
        _this.skeletonData = null;
        _this.selectTable = null;
        _this.overlay = null;
        _this._slotController = null;
        _this.mainGame = null;
        _this.gameResult = null;
        _this.topLabel = null;
        _this.top = null;
        _this.bottom = null;
        _this.dataLength = [ 30, 38, 53, 72, 87, 95, 95, 95, 95, 149 ];
        _this.index = 0;
        _this.sum = 0;
        _this._tempProgress = 0;
        _this._tempSetTimeout = null;
        _this.coinResultController = null;
        _this.data = [];
        _this.coinWin = 0;
        _this.res = 0;
        _this.playArray = [];
        _this.listItem = [];
        _this.listLabel = [];
        _this._time = 0;
        _this._trappedTime = 0;
        _this.lockTouchBook = false;
        _this.rand = 7;
        _this.isEvent = true;
        return _this;
      }
      MinigameController8.prototype.startMiniGame = function(data, coinWin, res) {
        var _this = this;
        if (!this) return;
        this.resourceController.resourceController = this._slotController.resourceController;
        this.resourceController.loadResources();
        this.selectTable = cc.find("bonus_active", this.node);
        this.mainGame = cc.find("main-game", this.node);
        this.gameResult = cc.find("result-table", this.node);
        this.top = cc.find("top", this.mainGame);
        this.topLabel = cc.find("bg_power_win-02", this.top);
        this.bottom = cc.find("bottom", this.mainGame);
        this.rightBox = cc.find("bg_fail", this.bottom);
        this.thienthan = cc.find("thienthan_ani", this.top);
        this.thienthan.addComponent(sp.Skeleton).skeletonData = this.skeletonData;
        this.thienthan.getComponent(sp.Skeleton).animation = "thienthan_ani";
        this.data = data;
        this.coinWin = coinWin;
        this.res = res;
        this.rand = Math.floor(3 * Math.random()) + 3;
        this.node.children.forEach(function(item) {
          return item.active = false;
        });
        this.overlay.addComponent(cc.Button).interactable = true;
        this.overlay.active = true;
        this.coinResultController = new CoinLabel_1.default(this.coinResultLabel, 9);
        this.coinResultController.updateUserBalance(0);
        this.listItem = this.itemsContainer.children;
        this.listLabel = this.topLabel.children;
        this.listLabel.forEach(function(item) {
          var index = Number(item.name.slice(-2)).toString();
          item.getComponent(cc.Label).string = data[index];
        });
        this.selectTable.active = true;
        this.addSkeletonItem();
        this.selectTable.children.forEach(function(item) {
          item.on(cc.Node.EventType.TOUCH_END, function(e) {
            if (!_this.lockTouchBook) {
              _this.selectBookItem(e.currentTarget);
              _this.lockTouchBook = true;
            }
          });
        });
        this.playArray = this.getArrayResult(this.rand, res);
        this.processBar.progress = 0;
        this.loadMainGame();
      };
      MinigameController8.prototype.addSkeletonItem = function() {
        var _this = this;
        this.selectTable.children.forEach(function(item) {
          item.children[0].addComponent(sp.Skeleton).skeletonData = _this.skeletonData;
          item.children[0].getComponent(sp.Skeleton).animation = item.children[0].name;
        });
      };
      MinigameController8.prototype.getArrayResult = function(randNumber, result) {
        var arr = [];
        for (var i = 0; i < randNumber - 1; i++) arr.push(0);
        for (var i = randNumber - 1; i < result + randNumber - 1; i++) arr.push(1);
        this.shuffle(arr);
        arr.push(0);
        return arr;
      };
      MinigameController8.prototype.shuffle = function(array) {
        array.sort(function() {
          return Math.random() - .5;
        });
      };
      MinigameController8.prototype.selectMiniGame = function() {
        var _this = this;
        util.game.delay(2);
        this.mainGame.active = true;
        this.mainGame.opacity = 0;
        setTimeout(function() {
          _this.mainGame.runAction(cc.sequence(cc.fadeIn(2), cc.callFunc(function() {
            _this.selectTable.destroy();
            _this.overlay.destroy();
          })));
        }, 2500);
      };
      MinigameController8.prototype.selectBookItem = function(node) {
        var _this = this;
        if (!this.selectTable || !this || !view.screen.slot) return;
        node.children[0].getComponent(sp.Skeleton).setCompleteListener(function() {
          node.children[1].active = true;
          node.children[1].getComponent(cc.Label).string = _this.rand + " Fails";
          node.children[1].runAction(cc.sequence([ cc.delayTime(.3), cc.moveBy(.5, cc.v2(1, 60)) ]));
          setTimeout(function() {
            return node.children[0].getComponent(sp.Skeleton).enabled = false;
          }, 300);
        });
        this.selectTable.children.forEach(function(item) {
          if (item.name != node.name) {
            item.children[0].getComponent(sp.Skeleton).enabled = false;
            _this.lockTouchBook = true;
            item.getComponent(cc.Sprite).spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
              return item.name == _this.resourceController.listResourceName.disable;
            });
          }
        });
        this.selectMiniGame();
      };
      MinigameController8.prototype.loadMainGame = function() {
        var _this = this;
        this.listItem.forEach(function(itemNode, index) {
          var num = 0;
          itemNode.opacity = 0;
          var sprite = itemNode.children[0].addComponent(cc.Sprite);
          sprite.spriteFrame = _this.resourceController.resourceController.spriteList.find(function(item) {
            return item.name == _this.resourceController.listResourceName.itemNormal;
          });
          _this.itemEvent();
          itemNode.runAction(cc.sequence(cc.delayTime(Math.random() + .5), cc.fadeIn(.5)));
        });
        this.showFails(this.rand);
      };
      MinigameController8.prototype.itemEvent = function() {
        var _this = this;
        this.listItem.forEach(function(item) {
          item.children[0].on(cc.Node.EventType.TOUCH_START, function(e) {
            if (_this.isEvent) {
              _this.selectItem(e.currentTarget);
              _this.isEvent = false;
            }
          });
        });
      };
      MinigameController8.prototype.selectItem = function(node) {
        return __awaiter(this, void 0, void 0, function() {
          var num;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              num = this.playArray[this._time];
              if (!(0 == num)) return [ 3, 2 ];
              this._trappedTime++;
              return [ 4, this.itemAction(node, new cc.Color(255, 0, 0, 255), 0) ];

             case 1:
              _a.sent();
              if (!this.showFails) return [ 2 ];
              setTimeout(function() {
                return _this.showFails(_this.rand);
              }, 2300);
              this._trappedTime >= this.rand && setTimeout(function() {
                return _this.showEndGame();
              }, 3300);
              return [ 3, 3 ];

             case 2:
              this.sum += this.dataLength[this.index];
              this.index++;
              this.itemAction(node, new cc.Color(255, 255, 0, 255), num);
              if (!this.updateProgress) return [ 2 ];
              setTimeout(function() {
                return _this.updateProgress(_this.sum / _this.processBar.totalLength);
              }, 2300);
              _a.label = 3;

             case 3:
              this._time++;
              return [ 2 ];
            }
          });
        });
      };
      MinigameController8.prototype.itemAction = function(node, color, num) {
        var _this = this;
        node.addComponent(cc.Button);
        var ske = cc.instantiate(node);
        ske.removeComponent(cc.Sprite);
        ske.addComponent(sp.Skeleton).skeletonData = this.skeletonData;
        ske.parent = node.parent;
        node.opacity = 0;
        node.runAction(cc.sequence([ cc.delayTime(.2), cc.fadeOut(.3), cc.callFunc(function() {
          node.opacity = 0;
        }) ]));
        ske.runAction(cc.sequence([ cc.fadeIn(.2), cc.callFunc(function() {
          ske.getComponent(sp.Skeleton).loop = false;
          ske.getComponent(sp.Skeleton).animation = "quantai_ani";
        }) ]));
        ske.getComponent(sp.Skeleton).setCompleteListener(function() {
          _this.getItemResult(node, color, num);
          _this.isEvent = true;
          node.getComponent(cc.Button).interactable = false;
          _this._trappedTime == _this.rand && (_this.isEvent = false);
        });
      };
      MinigameController8.prototype.getItemResult = function(node, color, num) {
        var _this = this;
        var shadowNode = cc.instantiate(node);
        var resultNode = cc.instantiate(node);
        var shadowSprite = shadowNode.getComponent(cc.Sprite);
        var resultSprite = resultNode.getComponent(cc.Sprite);
        var skeleNode = cc.instantiate(node);
        skeleNode.removeComponent(cc.Sprite);
        skeleNode.addComponent(sp.Skeleton).skeletonData = this.skeletonData;
        skeleNode.parent = node.parent;
        shadowNode.parent = node.parent;
        resultNode.parent = node.parent;
        resultNode.opacity = 255;
        shadowSprite.spriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.itemEffect;
        });
        resultSprite.spriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.items[num];
        });
        shadowNode.color = color;
        shadowNode.opacity = 0;
        shadowNode.runAction(cc.sequence([ cc.fadeTo(.4, 150), cc.fadeOut(1), cc.callFunc(function() {
          shadowNode.destroy();
        }) ]));
        if (1 == num) {
          resultNode.active = false;
          skeleNode.active = true;
          skeleNode.opacity = 0;
          skeleNode.setPosition(cc.v2(node.x, node.y));
          skeleNode.runAction(cc.sequence([ cc.fadeIn(.2), cc.callFunc(function() {
            skeleNode.getComponent(sp.Skeleton).loop = true;
            skeleNode.getComponent(sp.Skeleton).animation = "thienthan_ani";
          }) ]));
          skeleNode.runAction(cc.sequence([ cc.delayTime(.4), cc.moveBy(1, cc.v2(1, 45)) ]));
          skeleNode.runAction(cc.sequence([ cc.delayTime(.2), cc.fadeIn(.3), cc.delayTime(.5), cc.fadeOut(.5), cc.callFunc(function() {
            skeleNode.destroy();
          }) ]));
          resultNode.active = true;
          resultNode.opacity = 0;
          resultNode.runAction(cc.sequence([ cc.delayTime(1.5), cc.fadeIn(.8) ]));
        } else {
          var failNode = new cc.Node();
          var failSprite = failNode.addComponent(cc.Sprite);
          failSprite.spriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
            return item.name == _this.resourceController.listResourceName.fail.active;
          });
          failNode.parent = node.parent;
          failNode.color = new cc.Color(255, 255, 255, 255);
          failNode.setPosition(cc.v2(node.x, node.y));
          failNode.runAction(cc.sequence([ cc.delayTime(.3), cc.moveBy(1, cc.v2(1, 45)) ]));
          failNode.runAction(cc.sequence([ cc.delayTime(.2), cc.fadeIn(.3), cc.delayTime(.5), cc.fadeOut(.5), cc.callFunc(function() {}) ]));
        }
      };
      MinigameController8.prototype.showFails = function(num) {
        var _this = this;
        var fireAcitveSpriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.fail.active;
        });
        var fireNormalSpriteFrame = this.resourceController.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.listResourceName.fail.normal;
        });
        this.rightBox.children.forEach(function(item) {
          return item.active = false;
        });
        for (var i = 0; i < num; i++) {
          this.rightBox.children[i].getComponent(cc.Sprite).spriteFrame = fireNormalSpriteFrame;
          this.rightBox.children[i].active = true;
          this.rightBox.children[i].setPosition((i + .5) * (this.rightBox.width - 27) / num + 12, this.rightBox.height / 2);
        }
        this.showItemFailActive(this._trappedTime, fireAcitveSpriteFrame);
      };
      MinigameController8.prototype.showItemFailActive = function(num, sprite) {
        for (var i = 0; i < num; i++) this.rightBox.children[i].getComponent(cc.Sprite).spriteFrame = sprite;
      };
      MinigameController8.prototype.updateProgress = function(progress) {
        var _this = this;
        if (null != progress) {
          progress > 1 && (progress = 1);
          progress < 0 && (progress = 0);
          this.processBar.progress = progress;
        }
        this.updateLength();
        if (Math.abs(this.processBar.progress - this._tempProgress) < .001) {
          this._tempProgress = this.processBar.progress;
          return true;
        }
        var delta = this.processBar.progress - this._tempProgress;
        this._tempProgress = 5 * delta / 10 / 30 + this._tempProgress;
        this._tempSetTimeout = setTimeout(function() {
          _this.updateProgress();
        }, 1e3 / 30);
      };
      MinigameController8.prototype.onDestroy = function() {
        clearTimeout(this._tempSetTimeout);
      };
      MinigameController8.prototype.updateLength = function() {
        this.bar.width = this.processBar.totalLength * this._tempProgress;
      };
      MinigameController8.prototype.showEndGame = function() {
        var _this = this;
        controller.ui.showModel();
        this.gameResult.active = true;
        this.gameResult.opacity = 0;
        this.gameResult.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
          _this.coinResultController.updateUserBalance(_this.coinWin);
          api.sendGD({
            e: api.key.SLOT_GET_BONUS,
            gtype: config.game.SMID[8]
          }, function(err, data) {
            game.log(data);
          });
          controller.ui.hideModel();
        }) ]));
      };
      MinigameController8.prototype.backToSlot = function() {
        var _this = this;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          store.emit(store.key.UPDATE_USER_BALANCE, game.user.balance, 0);
          _this.node.destroy();
          view.screen.slot.SlotController.bonusNode = void 0;
          view.screen.bonus = void 0;
          controller.ui.showBar();
        }) ]));
      };
      __decorate([ property(cc.ProgressBar) ], MinigameController8.prototype, "processBar", void 0);
      __decorate([ property(cc.Node) ], MinigameController8.prototype, "itemsContainer", void 0);
      __decorate([ property(cc.Node) ], MinigameController8.prototype, "rightBox", void 0);
      __decorate([ property(cc.Label) ], MinigameController8.prototype, "coinResultLabel", void 0);
      __decorate([ property(ResourceMiniGame8_1.default) ], MinigameController8.prototype, "resourceController", void 0);
      __decorate([ property(cc.Node) ], MinigameController8.prototype, "failNode", void 0);
      __decorate([ property(cc.Node) ], MinigameController8.prototype, "bar", void 0);
      __decorate([ property(sp.SkeletonData) ], MinigameController8.prototype, "skeletonData", void 0);
      __decorate([ property(cc.Node) ], MinigameController8.prototype, "selectTable", void 0);
      __decorate([ property(cc.Node) ], MinigameController8.prototype, "overlay", void 0);
      MinigameController8 = __decorate([ ccclass ], MinigameController8);
      return MinigameController8;
    }(cc.Component);
    exports.default = MinigameController8;
    cc._RF.pop();
  }, {
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "./ResourceMiniGame8": "ResourceMiniGame8"
  } ],
  MultiScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "71368zSgR5C6Z9YinXw0fTN", "MultiScene");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MultiScene = function(_super) {
      __extends(MultiScene, _super);
      function MultiScene() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.list = null;
        _this.content = null;
        _this.overlay = null;
        _this.slotItem = null;
        _this.isShow = false;
        _this.resPath = "3_homeScene/slotIcon";
        _this._isLock = false;
        return _this;
      }
      MultiScene.prototype.onLoad = function() {
        this.initialize();
      };
      MultiScene.prototype.initialize = function() {};
      MultiScene.prototype.loadContent = function() {
        var _this = this;
        var scenesManager = Object.values(view.slot).filter(function(o) {
          return !!o;
        });
        this.list.content.removeAllChildren();
        this.listScene = [];
        scenesManager.forEach(function(item) {
          var button = cc.instantiate(_this.slotItem);
          var scene = {
            uuid: item.uuid,
            id: item.id,
            button: button,
            smid: item.gameId
          };
          button.parent = _this.list.content;
          button.active = true;
          var gameId = scene.id;
          var icon = button.getChildByName("icon").getChildByName("ic").getComponent(cc.Sprite);
          var titleLabel = button.getChildByName("title-label").getComponent(cc.Label);
          var betLabel = button.getChildByName("bet-label").getComponent(cc.Label);
          var autoBetLabel = button.getChildByName("auto-label").getComponent(cc.Label);
          var btnClose = button.getChildByName("btnClose").getComponent(cc.Button);
          icon.spriteFrame = controller.ui.slot.find(function(item) {
            return item.icon.name === gameId.toString();
          }).icon;
          titleLabel.string = item.name;
          betLabel.string = "Bet: " + util.game.abbreviateNumber(item.SlotController.currentBet);
          item.SlotController.autoSpinTimes < 0 ? autoBetLabel.string = "Auto: ++" : autoBetLabel.string = "Auto: " + item.SlotController.autoSpinTimes;
          var event = new cc.Component.EventHandler();
          event.target = _this.node;
          event.component = "MultiScene";
          event.handler = "onClickClose";
          event.customEventData = item.id.toString();
          btnClose.clickEvents.push(event);
          _this.listScene.push(scene);
        });
        this.addEventButton();
      };
      MultiScene.prototype.toggleButton = function() {
        var _this = this;
        if (this._isLock) return;
        this._isLock = true;
        if (this.isShow) {
          tracking.send(tracking.event.MULTI_HIDE);
          this.content.runAction(cc.moveBy(.2, cc.v2(0, this.content.height)));
        } else {
          tracking.send(tracking.event.MULTI_SHOW);
          this.content.runAction(cc.moveBy(.2, cc.v2(0, -this.content.height)));
        }
        this.isShow = !this.isShow;
        this.overlay.active = this.isShow;
        setTimeout(function() {
          _this._isLock = false;
        }, 400);
      };
      MultiScene.prototype.addEventButton = function() {
        var _this = this;
        game.log("On click item");
        this.listScene.forEach(function(item) {
          item.button.on("click", function() {
            tracking.send(tracking.event.MULTI_OPEN_GAME);
            if (_this && "boolean" === typeof _this._isLock && _this._isLock) return;
            if (view.screen.slot) if (view.screen.slot.uuid != item.uuid) {
              view.screen.slot.SlotController.hideContent();
              controller.ui.switchSlot(item.uuid, item.id);
              view.bar.bottom.gameBar.showContentBar();
              view.bar.bottom.gameBar.hiddenContentBar();
              _this.toggleButton();
              game.log("Switch");
            } else game.log("You currently on this game"); else {
              controller.ui.resumeSlot(item.uuid, item.id);
              _this.toggleButton();
            }
          });
        });
      };
      MultiScene.prototype.onClickClose = function(event, data) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this._isLock = true;
              return [ 4, controller.ui.deleteSlot(parseInt(data)) ];

             case 1:
              _a.sent();
              this._isLock = false;
              return [ 2 ];
            }
          });
        });
      };
      __decorate([ property(cc.ScrollView) ], MultiScene.prototype, "list", void 0);
      __decorate([ property(cc.Node) ], MultiScene.prototype, "content", void 0);
      __decorate([ property(cc.Node) ], MultiScene.prototype, "overlay", void 0);
      __decorate([ property(cc.Node) ], MultiScene.prototype, "slotItem", void 0);
      MultiScene = __decorate([ ccclass ], MultiScene);
      return MultiScene;
    }(cc.Component);
    exports.default = MultiScene;
    cc._RF.pop();
  }, {} ],
  PayTableResource: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e8d3cYI4HFDcYNx//wgEaXN", "PayTableResource");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("./ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var PayTableResource = function(_super) {
      __extends(PayTableResource, _super);
      function PayTableResource() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      PayTableResource = __decorate([ ccclass ], PayTableResource);
      return PayTableResource;
    }(ResourcePrefab_1.default);
    exports.default = PayTableResource;
    cc._RF.pop();
  }, {
    "./ResourcePrefab": "ResourcePrefab"
  } ],
  PayTable: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fc83dYJYQlA+L+P6fyfzniM", "PayTable");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var PayTableResource_1 = require("./PayTableResource");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BUTTON_TYPE;
    (function(BUTTON_TYPE) {
      BUTTON_TYPE["BACK"] = "BACK";
      BUTTON_TYPE["RETURN"] = "RETURN";
      BUTTON_TYPE["NEXT"] = "NEXT";
    })(BUTTON_TYPE || (BUTTON_TYPE = {}));
    var PayTableData = function() {
      function PayTableData() {
        this.titleText = "";
        this.titleImgName = "";
        this.contentImgName = "";
        this.contentNode = void 0;
      }
      __decorate([ property() ], PayTableData.prototype, "titleText", void 0);
      __decorate([ property() ], PayTableData.prototype, "titleImgName", void 0);
      __decorate([ property() ], PayTableData.prototype, "contentImgName", void 0);
      __decorate([ property(cc.Node) ], PayTableData.prototype, "contentNode", void 0);
      PayTableData = __decorate([ ccclass("PayTableData") ], PayTableData);
      return PayTableData;
    }();
    exports.PayTableData = PayTableData;
    var PayTable = function(_super) {
      __extends(PayTable, _super);
      function PayTable() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.page = void 0;
        _this.title = void 0;
        _this.btnBack = void 0;
        _this.btnReturn = void 0;
        _this.btnNext = void 0;
        _this.resource = void 0;
        _this.enableIndicator = true;
        _this.data = [];
        _this.popupControl = void 0;
        _this.dataRender = [];
        return _this;
      }
      PayTable.prototype.onLoad = function() {
        var _this = this;
        this.popupControl = this.getComponent("BasePopup");
        this.btnBack.node.opacity = 0;
        this.btnReturn.node.opacity = 0;
        this.btnNext.node.opacity = 0;
        this.popupControl.openCallback = function() {
          this.onOpen();
        }.bind(this);
        this.resource.resourceController = view.screen.slot.SlotController.resourceController;
        this.resource.loadResources();
        this.page.indicator.node.active = this.enableIndicator;
        this.renderData();
        this.page.content.removeAllChildren();
        this.dataRender.forEach(function(o, i) {
          var content = o.content;
          content && _this.page.content.addChild(content);
        });
        this.title.removeAllChildren();
        this.dataRender.length && this.dataRender[0].title && (this.dataRender[0].title.parent = this.title);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "PayTable";
        eventHandler.handler = "listenner";
        this.page.scrollEvents.push(eventHandler);
      };
      PayTable.prototype.onOpen = function() {
        if (!this || !this.node || !this.btnBack || !this.btnReturn || !this.btnNext) return;
        var _a = this, btnBack = _a.btnBack, btnNext = _a.btnNext, btnReturn = _a.btnReturn;
        var tReturn = .3;
        var tArrow = .5;
        btnReturn.node.runAction(effect.bouceIn({
          time: tReturn
        }));
        btnBack.node.runAction(cc.sequence(cc.delayTime(tReturn), effect.moveInBy({
          time: tArrow,
          direction: define.type.DIRECTION.RIGHT
        })));
        btnNext.node.runAction(cc.sequence(cc.delayTime(tReturn), effect.moveInBy({
          time: tArrow,
          direction: define.type.DIRECTION.LEFT
        })));
      };
      PayTable.prototype.renderData = function() {
        var _this = this;
        this.dataRender = this.data.map(function(o, i) {
          var title = new cc.Node();
          if ("" !== o.titleText) {
            var label = title.addComponent(cc.Label);
            label.string = o.titleText;
          } else if (o.titleImgName) {
            var sp = title.addComponent(cc.Sprite);
            sp.spriteFrame = _this.resource.resourceController.spriteList.find(function(r) {
              return r.name == o.titleImgName;
            });
          } else title = void 0;
          var content = new cc.Node();
          content.width = _this.page.node.width;
          content.height = _this.page.node.height;
          if (o.contentImgName) {
            var node = new cc.Node();
            node.parent = content;
            var sp = node.addComponent(cc.Sprite);
            sp.spriteFrame = _this.resource.resourceController.spriteList.find(function(r) {
              return r.name == o.contentImgName;
            });
          } else if (o.contentNode) content = o.contentNode; else {
            content = void 0;
            cc.warn("Paytable", "renderData", "Data input error content must exist", "Index:", i);
          }
          return {
            title: title,
            content: content
          };
        });
      };
      PayTable.prototype.listenner = function(page, event) {
        if (event == cc.ScrollView.EventType.SCROLL_ENDED) {
          var dataRender = this.dataRender;
          var index = this.page.getCurrentPageIndex();
          this.title.removeAllChildren();
          dataRender[index] && dataRender[index].title && (dataRender[index].title.parent = this.title);
        }
      };
      PayTable.prototype.onClickButtonControl = function(e, data) {
        game.log("PayTable", "onClickButtonControl", data);
        switch (data) {
         case BUTTON_TYPE.RETURN:
          this.popupControl.onClose();
          break;

         case BUTTON_TYPE.BACK:
         case BUTTON_TYPE.NEXT:
          var numPage = this.page.getPages().length;
          var index = this.page.getCurrentPageIndex();
          index += data === BUTTON_TYPE.BACK ? -1 : 1;
          index = index < 0 && numPage > 0 ? numPage - 1 : index >= numPage && numPage > 0 ? 0 : index;
          this.page.scrollToPage(index, 1);
        }
      };
      __decorate([ property(cc.PageView) ], PayTable.prototype, "page", void 0);
      __decorate([ property(cc.Node) ], PayTable.prototype, "title", void 0);
      __decorate([ property(cc.Button) ], PayTable.prototype, "btnBack", void 0);
      __decorate([ property(cc.Button) ], PayTable.prototype, "btnReturn", void 0);
      __decorate([ property(cc.Button) ], PayTable.prototype, "btnNext", void 0);
      __decorate([ property(PayTableResource_1.default) ], PayTable.prototype, "resource", void 0);
      __decorate([ property() ], PayTable.prototype, "enableIndicator", void 0);
      __decorate([ property(PayTableData) ], PayTable.prototype, "data", void 0);
      PayTable = __decorate([ ccclass ], PayTable);
      return PayTable;
    }(cc.Component);
    exports.default = PayTable;
    cc._RF.pop();
  }, {
    "./PayTableResource": "PayTableResource"
  } ],
  PlatformController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "088abEninNB1IxzzoaPna8N", "PlatformController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineType_1 = require("../Define/DefineType");
    var DefineKey_1 = require("../Define/DefineKey");
    var IOSHandle_1 = require("./ios/IOSHandle");
    var AndroidHandle_1 = require("./android/AndroidHandle");
    var WebHandle_1 = require("./web/WebHandle");
    var IOSFacebook_1 = require("./ios/IOSFacebook");
    var AndroidFacebook_1 = require("./android/AndroidFacebook");
    var WebFacebook_1 = require("./web/WebFacebook");
    var IOSAdmob_1 = require("./ios/IOSAdmob");
    var AndroidAdmob_1 = require("./android/AndroidAdmob");
    var WebAdmob_1 = require("./web/WebAdmob");
    var IOSFireBase_1 = require("./ios/IOSFireBase");
    var AndroidFirebase_1 = require("./android/AndroidFirebase");
    var WebFirebase_1 = require("./web/WebFirebase");
    var IOSOnesignal_1 = require("./ios/IOSOnesignal");
    var AndroidOnesignal_1 = require("./android/AndroidOnesignal");
    var WebOnesignal_1 = require("./web/WebOnesignal");
    var IOSIap_1 = require("./ios/IOSIap");
    var AndroidIAP_1 = require("./android/AndroidIAP");
    var WebIap_1 = require("./web/WebIap");
    var PlatformController = function() {
      function PlatformController() {
        this.tag = "platform.base";
        this.inited = false;
        this.deviceOs = DefineType_1.DEVICE_OS.UNKNOW;
        this.deviceOsName = "";
        this.deviceId = void 0;
        this.admob = null;
        this.facebook = null;
        this.firebase = null;
        this.handle = null;
        this.onesignal = null;
        this.iap = null;
      }
      PlatformController.ins = function() {
        this.instance || (this.instance = new PlatformController());
        return this.instance;
      };
      PlatformController.prototype.init = function() {
        if ("true" === cc.sys.localStorage.getItem(DefineKey_1.local.PLATFORM_INIT)) {
          cc.sys.localStorage.setItem(DefineKey_1.local.PLATFORM_INIT, false);
          return;
        }
        this.deviceOs = util.game.getDeviceOS();
        this.deviceOsName = DefineType_1.DEVICE_OS[this.deviceOs];
        if (this.deviceOs === DefineType_1.DEVICE_OS.IOS_NAVITE) {
          this.admob = IOSAdmob_1.default.getIns();
          this.facebook = IOSFacebook_1.default.getIns();
          this.firebase = IOSFireBase_1.default.getIns();
          this.handle = IOSHandle_1.default.getIns();
          this.onesignal = IOSOnesignal_1.default.getIns();
          this.iap = IOSIap_1.default.getIns();
        } else if (this.deviceOs === DefineType_1.DEVICE_OS.ANDROID_NAVITE) {
          this.admob = AndroidAdmob_1.default.getIns();
          this.facebook = AndroidFacebook_1.default.getIns();
          this.firebase = AndroidFirebase_1.default.getIns();
          this.handle = AndroidHandle_1.default.getIns();
          this.onesignal = AndroidOnesignal_1.default.getIns();
          this.iap = AndroidIAP_1.default.getIns();
        } else if (this.deviceOs === DefineType_1.DEVICE_OS.WEB_MOBILE || this.deviceOs === DefineType_1.DEVICE_OS.WEB_PC) {
          this.admob = WebAdmob_1.default.getIns();
          this.facebook = WebFacebook_1.default.getIns();
          this.firebase = WebFirebase_1.default.getIns();
          this.handle = WebHandle_1.default.getIns();
          this.onesignal = WebOnesignal_1.default.getIns();
          this.iap = WebIap_1.default.getIns();
        } else {
          this.admob = WebAdmob_1.default.getIns();
          this.facebook = WebFacebook_1.default.getIns();
          this.firebase = WebFirebase_1.default.getIns();
          this.handle = WebHandle_1.default.getIns();
          this.onesignal = WebOnesignal_1.default.getIns();
          this.iap = WebIap_1.default.getIns();
        }
        this.deviceId = this.handle.getDeviceId();
        game.data.deviceId = this.deviceId;
        game.data.packageName = this.handle.getPackageName();
        game.data.versionGame = this.handle.getVersionGame();
        game.data.countryCode = this.handle.getCountryCode();
        game.data.versionOS = this.handle.getOSVersion();
        if (platform.handle.isConnecting()) {
          this.admob.init();
          this.facebook.init();
          this.firebase.init();
          this.onesignal.init();
          this.iap.init();
          this.inited = true;
        }
      };
      PlatformController.instance = null;
      return PlatformController;
    }();
    exports.default = PlatformController;
    cc._RF.pop();
  }, {
    "../Define/DefineKey": "DefineKey",
    "../Define/DefineType": "DefineType",
    "./android/AndroidAdmob": "AndroidAdmob",
    "./android/AndroidFacebook": "AndroidFacebook",
    "./android/AndroidFirebase": "AndroidFirebase",
    "./android/AndroidHandle": "AndroidHandle",
    "./android/AndroidIAP": "AndroidIap",
    "./android/AndroidOnesignal": "AndroidOnesignal",
    "./ios/IOSAdmob": "IOSAdmob",
    "./ios/IOSFacebook": "IOSFacebook",
    "./ios/IOSFireBase": "IOSFireBase",
    "./ios/IOSHandle": "IOSHandle",
    "./ios/IOSIap": "IOSIap",
    "./ios/IOSOnesignal": "IOSOnesignal",
    "./web/WebAdmob": "WebAdmob",
    "./web/WebFacebook": "WebFacebook",
    "./web/WebFirebase": "WebFirebase",
    "./web/WebHandle": "WebHandle",
    "./web/WebIap": "WebIap",
    "./web/WebOnesignal": "WebOnesignal"
  } ],
  PopupDailyQuest: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c4af6h0/z9HirFHu6mbDzbZ", "PopupDailyQuest");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var BasePopup_1 = require("../BasePopup");
    var AccumulatedBar_1 = require("../Components/AccumulatedBar");
    var CoinLabel_1 = require("../Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var STATUS;
    (function(STATUS) {
      STATUS[STATUS["DOING"] = 0] = "DOING";
      STATUS[STATUS["COMPLETE"] = 1] = "COMPLETE";
      STATUS[STATUS["LOCK"] = 2] = "LOCK";
    })(STATUS || (STATUS = {}));
    var MAX_GIFT_POINT = 1e3;
    var ITEM_UPDATE_EVENT = "ITEM_UPDATE_EVENT";
    var Item = function() {
      function Item() {
        this.doing = void 0;
        this.complete = void 0;
        this.lock = void 0;
      }
      __decorate([ property(cc.Node) ], Item.prototype, "doing", void 0);
      __decorate([ property(cc.Node) ], Item.prototype, "complete", void 0);
      __decorate([ property(cc.Node) ], Item.prototype, "lock", void 0);
      Item = __decorate([ ccclass("item") ], Item);
      return Item;
    }();
    exports.Item = Item;
    var PopupDailyQuest = function(_super) {
      __extends(PopupDailyQuest, _super);
      function PopupDailyQuest() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.time = null;
        _this.item = new Item();
        _this.listContent = void 0;
        _this.lablePointBottom = null;
        _this.bottom = null;
        _this.barWeekly = void 0;
        _this.storeKey = [];
        _this.itemKey = "";
        _this.currentQuestIndex = void 0;
        return _this;
      }
      PopupDailyQuest.prototype.onLoad = function() {
        _super.prototype.onLoad.call(this);
        this.addScrollListenner();
        this.countTimeDaily();
        this.initiate();
        this.effectIn();
      };
      PopupDailyQuest.prototype.start = function() {
        _super.prototype.start.call(this);
        this.registerStore();
      };
      PopupDailyQuest.prototype.addScrollListenner = function() {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "PopupDailyQuest";
        eventHandler.handler = "listenner";
        this.listContent.scrollEvents.push(eventHandler);
      };
      PopupDailyQuest.prototype.listenner = function(scroll, event) {
        var scrollBar = this.listContent.node.getChildByName("scrollBar");
        var bar = scrollBar.getChildByName("bar");
        var percent = scroll.getScrollOffset().y;
        event === cc.ScrollView.EventType.SCROLL_TO_TOP ? percent = 0 : event === cc.ScrollView.EventType.SCROLL_TO_BOTTOM && (percent = 100);
        event === cc.ScrollView.EventType.SCROLLING && percent >= 0 && percent <= 100 && (bar.y = -percent / 100 * (scrollBar.height - bar.height));
      };
      PopupDailyQuest.prototype.initiate = function() {
        var _this = this;
        var bottom = this.bottom;
        var gift1 = bottom.getChildByName("daily-slot-icon-gift-1");
        var gift1_lock = bottom.getChildByName("daily-slot-icon-gift-1-lock");
        var gift2 = bottom.getChildByName("daily-slot-icon-gift-2");
        var gift2_lock = bottom.getChildByName("daily-slot-icon-gift-2-lock");
        this.weeklyLabel = new CoinLabel_1.default(this.lablePointBottom);
        this.barWeekly.lerpRatio = -1;
        this.barWeekly.setListener(function(percent) {
          if (percent >= 70) {
            if (!gift1.active) {
              gift1.active = true;
              gift1.runAction(effect.jelly());
              gift1_lock.active = false;
              if (0 == game.data.weeklyAccumilation.takenRewards) {
                var eventHandler = new cc.Component.EventHandler();
                eventHandler.target = _this.node;
                eventHandler.component = "PopupDailyQuest";
                eventHandler.handler = "onClickWeeklyItem";
                var button = gift1.getComponent(cc.Button);
                button.clickEvents.push(eventHandler);
              } else gift1.stopAllActions();
            }
          } else if (gift1.active) {
            gift1.active = false;
            gift1_lock.active = true;
          }
          if (percent >= 100) {
            if (!gift2.active) {
              gift2.active = true;
              gift2.runAction(effect.jelly());
              gift2_lock.active = false;
              if (game.data.weeklyAccumilation.takenRewards <= 1) {
                var eventHandler = new cc.Component.EventHandler();
                eventHandler.target = _this.node;
                eventHandler.component = "PopupDailyQuest";
                eventHandler.handler = "onClickWeeklyItem";
                var button = gift2.getComponent(cc.Button);
                button.clickEvents.push(eventHandler);
              } else gift2.stopAllActions();
            }
          } else if (gift2.active) {
            gift2.active = false;
            gift2_lock.active = true;
          }
        });
      };
      PopupDailyQuest.prototype.registerStore = function() {
        var _this = this;
        var keyDaily = store.register(store.key.DAILYQUEST, function(dailyQuest) {
          game.data.dailyQuest = dailyQuest;
          if (_this.currentQuestIndex != dailyQuest.currentQuest) {
            _this.currentQuestIndex = dailyQuest.currentQuest;
            _this.renderItem();
          }
          store.emit(ITEM_UPDATE_EVENT, dailyQuest);
        });
        this.storeKey.push(keyDaily);
        var keyWeekly = store.register(store.key.WEEKLY_ACCUMILATION, function(weeklyAccumilation) {
          _this.weeklyLabel.updateUserBalance(weeklyAccumilation.currentProgress, {
            subfix: "/" + MAX_GIFT_POINT
          });
          var percent = weeklyAccumilation.currentProgress / MAX_GIFT_POINT;
          percent = percent > 100 ? 100 : percent;
          _this.barWeekly.updateProgress(weeklyAccumilation.currentProgress / MAX_GIFT_POINT);
        });
        this.storeKey.push(keyWeekly);
      };
      PopupDailyQuest.prototype.countTimeDaily = function() {
        setInterval(function() {
          if (!this || !this.time) return;
          this.time.getComponent(cc.Label).string = util.string.formatTime(util.game.timeToNextday()) + " Left";
        }.bind(this), 1e3);
      };
      PopupDailyQuest.prototype.renderItem = function() {
        var _this = this;
        var daily = game.data.dailyQuest;
        var data = daily.missions.map(function(object, index) {
          if (index < daily.currentQuest) object.status = STATUS.COMPLETE; else if (index == daily.currentQuest) {
            object.status = STATUS.DOING;
            object.currentProgress = daily.currentProgress;
          } else object.status = STATUS.LOCK;
          return object;
        });
        var item = void 0;
        this.listContent.content.removeAllChildren();
        if (game.data.dailyQuest.completeAll) for (var i = 0; i < data.length; i++) {
          item = cc.instantiate(this.item.complete);
          this.listContent.content.addChild(item);
          item.setPosition(0, 0);
        } else data.forEach(function(data) {
          if (data.status == STATUS.DOING) {
            store.unRegister(_this.itemKey);
            item = cc.instantiate(_this.item.doing);
            var goal = data.goal;
            var progress_1 = item.getChildByName("progressBar-Daily").getComponent(AccumulatedBar_1.default);
            var labelDes = item.getChildByName("lable").getComponent(cc.Label);
            var itemPlus = item.getChildByName("popup-quest-bg-money");
            var labelForItemPlus_1 = itemPlus.getChildByName("label").getComponent(cc.Label);
            var percentLabel_1 = item.getChildByName("progressBar-Daily").getChildByName("percent");
            var giftDaily_1 = item.getChildByName("daily-icon-quest-gift");
            var giftDaily_lock_1 = item.getChildByName("daily-icon-quest-gift-lock");
            giftDaily_1.active = false;
            if ("" == data.description) labelDes.string = "This is a description"; else if ("object" === typeof data.require) {
              itemPlus.active = true;
              "number" === typeof data.require.minCoin && (labelDes.string = data.description.toString().replace("$x", data.require.minCoin + "\n"));
              "number" === typeof data.require.times && (labelDes.string = data.description.toString().replace("$x", goal + "\n").replace("$x", data.require.times));
            } else {
              itemPlus.active = false;
              labelDes.string = data.description.toString().replace("$x", goal);
            }
            3 !== data.requireType ? percentLabel_1.getComponent(cc.Label).string = "00.00%" : percentLabel_1.getComponent(cc.Label).string = "0 coin";
            var itemDoing_1 = item;
            progress_1.lerpRatio = -1;
            progress_1.setListener(function(percent) {
              3 !== data.requireType && (percentLabel_1.getComponent(cc.Label).string = percent.toFixed(2) + "%");
              if (100 == percent) {
                giftDaily_lock_1.active = false;
                giftDaily_1.active = true;
                giftDaily_1.runAction(effect.jelly());
                var eventHandler = new cc.Component.EventHandler();
                eventHandler.target = _this.node;
                eventHandler.component = "PopupDailyQuest";
                eventHandler.handler = "onClickDailyItem";
                var button = itemDoing_1.getComponent(cc.Button);
                button.zoomScale = .95;
                button.clickEvents.push(eventHandler);
              }
            });
            _this.itemKey = store.register(ITEM_UPDATE_EVENT, function(data) {
              var quest = data.missions[data.currentQuest];
              if (!quest) return;
              progress_1 && progress_1.updateProgress(data.currentProgress / quest.goal);
              if (3 == quest.requireType) {
                percentLabel_1 && (percentLabel_1.getComponent(cc.Label).string = util.string.formatMoney(data.currentProgress) + " coins");
                labelForItemPlus_1 && (labelForItemPlus_1.string = data.currentCount + " " + (data.currentCount > 1 ? "times" : "time") + " left");
              }
            });
          } else if (data.status == STATUS.LOCK) {
            item = cc.instantiate(_this.item.lock);
            var lockItem = item.getChildByName("iconLock");
            lockItem.runAction(effect.shake());
          } else data.status == STATUS.COMPLETE && (item = cc.instantiate(_this.item.complete));
          item.setPosition(0, 0);
          _this.listContent.content.addChild(item);
        });
      };
      PopupDailyQuest.prototype.effectIn = function() {
        this.listContent.content.children && this.listContent.content.children.forEach(function(item, index) {
          item.opacity = 0;
          item.runAction(cc.sequence(cc.delayTime(.15), effect.moveInBy({
            time: .3 + .3 * index,
            direction: define.type.DIRECTION.RIGHT
          })));
        });
      };
      PopupDailyQuest.prototype.onClickDailyItem = function() {
        game.log("PopupDailyQuest", "onClickDailyItem");
        if (!game.data.dailyQuest.doneThisQuest) return;
        var dailyQuest = game.data.dailyQuest;
        var currentQuest = dailyQuest.missions[dailyQuest.currentQuest];
        api.sendGD({
          e: api.key.DAILYQUEST_REWARD
        }, function(err, data) {
          if (err) {
            game.error(err);
            return;
          }
          if (data) {
            game.log("PopupDailyQuest", "onClickDailyItem", "Data reward", data);
            tracking.send(tracking.event.QUEST_COMPLETE);
            game.data.weeklyAccumilation.currentProgress += currentQuest.point;
            store.emit(store.key.DAILYQUEST, data.dailyQuest);
            store.emit(store.key.WEEKLY_ACCUMILATION, game.data.weeklyAccumilation);
            store.emit(store.key.UPDATE_USER_BALANCE, data.userBalance);
            controller.ui.playPrefabAnimation("dailyReward", {
              coin: currentQuest.rewards
            });
          } else game.warn("PopupDailyQuest", "onClickDailyItem", "Data error", data);
        });
      };
      PopupDailyQuest.prototype.onClickWeeklyItem = function(event, customData) {
        game.log("PopupDailyQuest", "onClickWeeklyItem");
        var button = event.target.getComponent(cc.Button);
        button.clickEvents = [];
        button.node.stopAllActions();
        api.sendGD({
          e: api.key.WEEKLY_ACCUMILATION_REWARD
        }, function(err, data) {
          if (err) {
            game.error(err);
            return;
          }
          if (data && data.userAccumilation && data.userBalance) {
            tracking.send(tracking.event.WEEK_COMPLETE);
            store.emit(store.key.WEEKLY_ACCUMILATION, data.userAccumilation);
            store.emit(store.key.UPDATE_USER_BALANCE, data.userBalance);
            var weekData = data.userAccumilation;
            controller.ui.playPrefabAnimation("dailyReward", {
              coin: weekData.rewardsInfo[weekData.takenRewards - 1]
            });
          } else game.warn("PopupDailyQuest", "onClickWeeklyItem", "Data error", data);
        });
      };
      PopupDailyQuest.prototype.onDestroy = function() {
        this.storeKey.forEach(function(key) {
          return store.unRegister(key);
        });
        store.unRegister(this.itemKey);
      };
      __decorate([ property(cc.Node) ], PopupDailyQuest.prototype, "time", void 0);
      __decorate([ property(Item) ], PopupDailyQuest.prototype, "item", void 0);
      __decorate([ property(cc.ScrollView) ], PopupDailyQuest.prototype, "listContent", void 0);
      __decorate([ property(cc.Label) ], PopupDailyQuest.prototype, "lablePointBottom", void 0);
      __decorate([ property(cc.Node) ], PopupDailyQuest.prototype, "bottom", void 0);
      __decorate([ property(AccumulatedBar_1.default) ], PopupDailyQuest.prototype, "barWeekly", void 0);
      PopupDailyQuest = __decorate([ ccclass ], PopupDailyQuest);
      return PopupDailyQuest;
    }(BasePopup_1.default);
    exports.default = PopupDailyQuest;
    cc._RF.pop();
  }, {
    "../BasePopup": "BasePopup",
    "../Components/AccumulatedBar": "AccumulatedBar",
    "../Components/CoinLabel": "CoinLabel"
  } ],
  PopupSetting: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "28bf82JlApLapyy9xtwN1Eo", "PopupSetting");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var BasePopup_1 = require("../BasePopup");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var PopupSetting = function(_super) {
      __extends(PopupSetting, _super);
      function PopupSetting() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listSetting = void 0;
        return _this;
      }
      PopupSetting.prototype.onLoad = function() {
        _super.prototype.onLoad.call(this);
        this.initialize();
        this.addScrollListenner();
      };
      PopupSetting.prototype.initialize = function() {
        var content = this.listSetting.content;
        var facebook = content.getChildByName("loginFB");
        game.user.loginType == define.type.LOGIN_TYPE.FACEBOOK && (facebook.active = false);
        var sound = content.getChildByName("sound");
        var soundToggle = sound.getChildByName("toggle").getComponent(cc.Toggle);
        soundToggle.isChecked = controller.sound.getSoundStatus();
        var music = content.getChildByName("music");
        var musicToggle = music.getChildByName("toggle").getComponent(cc.Toggle);
        musicToggle.isChecked = controller.sound.getMusicStatus();
        var gift = content.getChildByName("gift");
        var giftToggle = gift.getChildByName("toggle").getComponent(cc.Toggle);
        var noti = content.getChildByName("notification");
        var notiToggle = noti.getChildByName("toggle").getComponent(cc.Toggle);
      };
      PopupSetting.prototype.addScrollListenner = function() {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "PopupSetting";
        eventHandler.handler = "listenner";
        this.listSetting.scrollEvents.push(eventHandler);
      };
      PopupSetting.prototype.listenner = function(scroll, event) {
        var scrollBar = this.listSetting.node.getChildByName("scrollBar");
        var bar = scrollBar.getChildByName("bar");
        var percent = scroll.getScrollOffset().y;
        event === cc.ScrollView.EventType.SCROLL_TO_TOP ? percent = 0 : event === cc.ScrollView.EventType.SCROLL_TO_BOTTOM && (percent = 100);
        if (event === cc.ScrollView.EventType.SCROLLING) {
          percent = percent < 0 ? 0 : percent;
          percent = percent > 100 ? 100 : percent;
          bar.y = -percent / 100 * (scrollBar.height - bar.height);
        }
      };
      PopupSetting.prototype.onLoginFB = function(button) {
        game.log("Popup Setting", "onLoginFB", button);
        platform.facebook.login();
      };
      PopupSetting.prototype.onToggleSound = function(toggle) {
        game.log("Popup Setting", "onToggleSound", toggle.isChecked);
        tracking.send(toggle.isChecked ? tracking.event.SOUND_ON : tracking.event.SOUND_OFF);
        controller.sound.setSoundStatus(toggle.isChecked);
      };
      PopupSetting.prototype.onToggleMusic = function(toggle) {
        game.log("Popup Setting", "onToggleMusic", toggle.isChecked);
        tracking.send(toggle.isChecked ? tracking.event.MUSIC_ON : tracking.event.MUSIC_OFF);
        controller.sound.setMusicStatus(toggle.isChecked);
      };
      PopupSetting.prototype.onToggleGift = function(toggle) {
        game.log("Popup Setting", "onToggleGift", toggle.isChecked);
      };
      PopupSetting.prototype.onToggleNotification = function(toggle) {
        game.log("Popup Setting", "onToggleNotification", toggle.isChecked);
      };
      PopupSetting.prototype.onClickInviteSMS = function(button) {
        game.log("Popup Setting", "onClickInviteSMS", button);
      };
      PopupSetting.prototype.onClickInviteEmail = function(button) {
        game.log("Popup Setting", "onClickInviteEmail", button);
      };
      __decorate([ property(cc.ScrollView) ], PopupSetting.prototype, "listSetting", void 0);
      PopupSetting = __decorate([ ccclass ], PopupSetting);
      return PopupSetting;
    }(BasePopup_1.default);
    exports.default = PopupSetting;
    cc._RF.pop();
  }, {
    "../BasePopup": "BasePopup"
  } ],
  PopupShop: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6b1f8TfK3RHpZh1jWySkWC0", "PopupShop");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var BasePopup_1 = require("../BasePopup");
    var DefineType_1 = require("../Define/DefineType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var EShopItemTag;
    (function(EShopItemTag) {
      EShopItemTag[EShopItemTag["NONE"] = 0] = "NONE";
      EShopItemTag[EShopItemTag["POPULAR"] = 1] = "POPULAR";
      EShopItemTag[EShopItemTag["BEST"] = 2] = "BEST";
      EShopItemTag[EShopItemTag["DEAL"] = 3] = "DEAL";
    })(EShopItemTag = exports.EShopItemTag || (exports.EShopItemTag = {}));
    var ItemResource = function() {
      function ItemResource() {
        this.tag = EShopItemTag.NONE;
        this.spTag = void 0;
        this.fontCoin = void 0;
        this.bgItem = void 0;
        this.bgPromo = void 0;
        this.bgCoin = void 0;
        this.btnAniName = "";
      }
      __decorate([ property({
        type: cc.Enum(EShopItemTag)
      }) ], ItemResource.prototype, "tag", void 0);
      __decorate([ property(cc.SpriteFrame) ], ItemResource.prototype, "spTag", void 0);
      __decorate([ property(cc.Font) ], ItemResource.prototype, "fontCoin", void 0);
      __decorate([ property(cc.SpriteFrame) ], ItemResource.prototype, "bgItem", void 0);
      __decorate([ property(cc.SpriteFrame) ], ItemResource.prototype, "bgPromo", void 0);
      __decorate([ property(cc.SpriteFrame) ], ItemResource.prototype, "bgCoin", void 0);
      __decorate([ property() ], ItemResource.prototype, "btnAniName", void 0);
      ItemResource = __decorate([ ccclass("ItemResource") ], ItemResource);
      return ItemResource;
    }();
    exports.ItemResource = ItemResource;
    var PopupShop = function(_super) {
      __extends(PopupShop, _super);
      function PopupShop() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.resource = [];
        _this.nodeItem = void 0;
        _this.list = void 0;
        _this.data = [];
        _this.key = [];
        return _this;
      }
      PopupShop.prototype.onLoad = function() {
        _super.prototype.onLoad.call(this);
      };
      PopupShop.prototype.start = function() {
        this.registerStore();
        _super.prototype.start.call(this);
      };
      PopupShop.prototype.registerStore = function() {
        var _this = this;
        var shopKey = store.register(store.key.UPDATE_SHOP_DATA, function(data) {
          _this.list.content.removeAllChildren();
          if (!data[define.type.ESHOP.GENERAL_SHOP] && !data[define.type.ESHOP.GENERAL_SHOP].length) {
            game.log("PopupShop", "initialization", "data error");
            return;
          }
          _this.data = data[define.type.ESHOP.GENERAL_SHOP].map(function(o) {
            var itemDat = {
              id: o._id,
              productId: o.productId,
              tag: o.displayInfo.tag in EShopItemTag ? EShopItemTag[o.displayInfo.tag] : EShopItemTag.NONE,
              coin: o.displayInfo.oldValue,
              promotion: o.displayInfo.salePercent,
              total: o.displayInfo.currValue,
              wheel: "MEGA_WHEEL" == o.bonus,
              amount: o.displayInfo.price,
              type: DefineType_1.ESHOP.GENERAL_SHOP
            };
            return itemDat;
          });
          var items = _this.data.map(function(o, i) {
            var item = _this.initItem(o, i);
            item.parent = _this.list.content;
            return item;
          });
        });
        this.key.push(shopKey);
      };
      PopupShop.prototype.initItem = function(data, index) {
        var item = cc.instantiate(this.nodeItem);
        var resource = this.resource.find(function(o) {
          return o.tag === data.tag;
        });
        var bg = item.getChildByName("bg").getComponent(cc.Sprite);
        var tag = bg.node.getChildByName("tag").getComponent(cc.Sprite);
        var text = bg.node.getChildByName("text").getComponent(cc.Label);
        var promotion = bg.node.getChildByName("promotion").getComponent(cc.Sprite);
        var lbPromotion = promotion.node.getChildByName("text").getComponent(cc.Label);
        var coin = bg.node.getChildByName("coin").getComponent(cc.Sprite);
        var lbCoin = coin.node.getChildByName("text").getComponent(cc.Label);
        var icWheel = coin.node.getChildByName("icon-wheel");
        var btnBuy = bg.node.getChildByName("btnBuy").getComponent(cc.Button);
        var lbBtnBuy = btnBuy.node.getChildByName("text").getComponent(cc.Label);
        bg.spriteFrame = resource.bgItem;
        resource.spTag ? tag.spriteFrame = resource.spTag : tag.node.active = false;
        text.font = resource.fontCoin;
        promotion.spriteFrame = resource.bgPromo;
        coin.spriteFrame = resource.bgCoin;
        btnBuy.getComponent(sp.Skeleton).animation = resource.btnAniName;
        text.string = util.string.formatMoney(data.coin);
        lbPromotion.string = "+" + data.promotion + "%";
        lbCoin.string = util.string.formatMoney(data.total);
        icWheel.active = data.wheel;
        lbBtnBuy.string = "$" + data.amount.toFixed(2) + " USD";
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "PopupShop";
        eventHandler.handler = "onClickBuy";
        eventHandler.customEventData = JSON.stringify(data);
        btnBuy.clickEvents.push(eventHandler);
        bg.node.opacity = 0;
        bg.node.runAction(cc.sequence(cc.delayTime(.07 * index), effect.moveInBy({
          time: .5,
          direction: define.type.DIRECTION.DOWN
        })));
        return item;
      };
      PopupShop.prototype.onClickBuy = function(button, customData) {
        game.log("PopupShop", "onClickBuy", customData);
        var item = JSON.parse(customData);
        platform.iap.itemBuying = item;
        tracking.send(tracking.event.IAP_PURCHASE_ITEM, item);
        platform.iap.purchaseByProductID(item.productId);
      };
      PopupShop.prototype.onDestroy = function() {
        this.key.forEach(function(o) {
          store.unRegister(o);
        });
      };
      __decorate([ property([ ItemResource ]) ], PopupShop.prototype, "resource", void 0);
      __decorate([ property(cc.Node) ], PopupShop.prototype, "nodeItem", void 0);
      __decorate([ property(cc.ScrollView) ], PopupShop.prototype, "list", void 0);
      PopupShop = __decorate([ ccclass ], PopupShop);
      return PopupShop;
    }(BasePopup_1.default);
    exports.default = PopupShop;
    cc._RF.pop();
  }, {
    "../BasePopup": "BasePopup",
    "../Define/DefineType": "DefineType"
  } ],
  ResourceController1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ccd21d0I/FHWbNRD2GcSIuP", "ResourceController1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController1 = function(_super) {
      __extends(ResourceController1, _super);
      function ResourceController1() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spriteListName = {
          item: {
            s: "img/item/item-egypt-2",
            s2: "img/item/item-egypt-1",
            c: "img/item/egypt-coin-2",
            w: "img/item/item-egypt-3",
            sw: "img/item/item-egypt-3",
            0: "img/item/item-egypt-7",
            1: "img/item/item-egypt-8",
            2: "img/item/item-egypt-9",
            3: "img/item/item-egypt-4",
            4: "img/item/item-egypt-5",
            5: "img/item/item-egypt-6",
            6: "img/item/item-egypt-11",
            7: "img/item/item-egypt-12",
            8: "img/item/item-egypt-13",
            9: "img/item/item-egypt-14"
          },
          subItem: {
            coinGray: "img/item/egypt-coin-3",
            coin: "img/item/egypt-coin-1",
            wildBorder: "img/item/wild-border",
            bg: "img/bg-big"
          },
          payTable: {}
        };
        _this.audioListName = {
          "01": "background.mp3"
        };
        _this.storageBase = "game-slot/1_Slot1/";
        _this.resourcePath = "4_gameScene/1_Slot1/";
        return _this;
      }
      ResourceController1 = __decorate([ ccclass ], ResourceController1);
      return ResourceController1;
    }(ResourceController_1.default);
    exports.default = ResourceController1;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  ResourceController2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "342b50tHJZPUIUrOPLwjhVW", "ResourceController2");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController2 = function(_super) {
      __extends(ResourceController2, _super);
      function ResourceController2() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spriteListName = {
          item: {
            s: "img/item/game-dra-item-free-spin-1",
            s2: "img/item/game-dra-item-freespin-2",
            c: "img/item/game-dra-item-coin-gold-mon",
            w: "img/item/game-dra-item-dra-wild-update",
            sw: "img/item/game-dra-item-dra-wild-update",
            0: "img/item/game-dra-item-1",
            1: "img/item/game-dra-item-2",
            2: "img/item/game-dra-item-3",
            3: "img/item/game-dra-item-4",
            4: "img/item/game-dra-item-5",
            5: "img/item/game-dra-item-6",
            6: "img/item/game-dra-item-7",
            7: "img/item/game-dra-item-special-1",
            8: "img/item/game-dra-item-special-2",
            9: "img/item/game-dra-item-special-3"
          },
          itemBorder: {
            sw: "img/item/game-dra-item-wild-bg",
            w: "img/item/game-dra-item-wild-bg",
            7: "img/item/game-dra-item-special-1-bg",
            8: "img/item/game-dra-item-special-2-bg",
            9: "img/item/game-dra-item-special-3-bg",
            bg: "/img/bg-big"
          },
          subItem: {
            coinGray: "img/item/game-dra-item-coin-gray-mon",
            coin: "img/item/game-dra-item-coin-gold",
            wildBorder: "img/item/game-dra-item-wild-bg"
          },
          payTable: {}
        };
        _this.storageBase = "game-slot/2_Slot2/";
        _this.resourcePath = "4_gameScene/2_Slot2/";
        return _this;
      }
      ResourceController2.prototype.getListItemBorder = function() {
        var _this = this;
        var listBorderName = Object.keys(this.spriteListName.itemBorder);
        return listBorderName.reduce(function(res, i) {
          return res.concat([ {
            id: i,
            img: _this.spriteList.find(function(x) {
              return x.name == _this.spriteListName.itemBorder[i].split("/").pop();
            })
          } ]);
        }, []);
      };
      ResourceController2 = __decorate([ ccclass ], ResourceController2);
      return ResourceController2;
    }(ResourceController_1.default);
    exports.default = ResourceController2;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  ResourceController3: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f0516qHNG1Pg6XRVf2I3Fb1", "ResourceController3");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController3 = function(_super) {
      __extends(ResourceController3, _super);
      function ResourceController3() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spriteListName = {
          item: {},
          payTable: {},
          subItem: {
            bg: "img/bg-big"
          },
          minigame: [ "minigame/bap_cai_dark", "minigame/cu_hanh_dark", "minigame/huong_duong_dark", "minigame/ca_rot_dark", "minigame/snake", "minigame/gold_bap_cai", "minigame/gold_cu_hanh", "minigame/gold_huong_duong", "minigame/gold_ca_rot", "minigame/bap_cai_alpha", "minigame/cu_hanh_alpha", "minigame/huong_duong_alpha", "minigame/ca_rot_alpha" ]
        };
        _this.storageBase = "game-slot/3_Slot3/";
        _this.resourcePath = "4_gameScene/3_Slot3/";
        return _this;
      }
      ResourceController3 = __decorate([ ccclass ], ResourceController3);
      return ResourceController3;
    }(ResourceController_1.default);
    exports.default = ResourceController3;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  ResourceController4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c35c9qovltLIZDUmx3E5FtT", "ResourceController4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController4 = function(_super) {
      __extends(ResourceController4, _super);
      function ResourceController4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.storageBase = "game-slot/4_Slot4/";
        _this.resourcePath = "4_gameScene/4_Slot4/";
        _this.spriteListName = {
          item: {
            s: "img/Item/item-casino-scatter",
            w: "img/Item/item-casino-wild",
            0: "img/Item/item-casino-1",
            1: "img/Item/item-casino-2",
            2: "img/Item/item-casino-3",
            3: "img/Item/item-casino-4",
            4: "img/Item/item-casino-5",
            5: "img/Item/item-casino-6",
            11: "img/Item/item-casino-7",
            12: "img/Item/item-casino-8",
            13: "img/Item/item-casino-9",
            14: "img/Item/item-casino-10",
            15: "img/Item/item-casino-11",
            22: "img/Item/item-casino-8-gold",
            23: "img/Item/item-casino-9-gold",
            24: "img/Item/item-casino-10-gold",
            25: "img/Item/item-casino-11-gold"
          },
          payTable: {},
          itemBorder: {
            12: "img/bg-item-casino-8",
            13: "img/bg-item-casino-9",
            14: "img/bg-item-casino-10",
            15: "img/bg-item-casino-11",
            22: "img/bg-item-casino-8",
            23: "img/bg-item-casino-9",
            24: "img/bg-item-casino-10",
            25: "img/bg-item-casino-11",
            w: "img/bg-item-casino-wild",
            s: "img/bg-item-casino-scatter"
          },
          itemGold: {
            4: "img/Item/item-casino-7",
            3: "img/Item/item-casino-8-gold",
            2: "img/Item/item-casino-9-gold",
            1: "img/Item/item-casino-10-gold",
            0: "img/Item/item-casino-11-gold"
          },
          subItem: {
            bg: "img/bg-big.jpg"
          },
          minigame: [ "minigame/casino-slot-coin-grand", "minigame/casino-slot-coin-major", "minigame/casino-slot-coin-minor", "minigame/casino-slot-coin-mini", "minigame/casino-slot-coin-normal" ],
          borderWinItem: [ "img/casino-slot-stroke-win" ],
          borderBet: [ "img/borderBet" ]
        };
        return _this;
      }
      ResourceController4.prototype.getListItemBorder = function() {
        var _this = this;
        var listBorderName = Object.keys(this.spriteListName.itemBorder);
        listBorderName = listBorderName.reduce(function(res, i) {
          return res.concat([ {
            id: i,
            img: _this.spriteList.find(function(x) {
              return x.name == _this.spriteListName.itemBorder[i].split("/").pop();
            })
          } ]);
        }, []);
        return listBorderName;
      };
      ResourceController4 = __decorate([ ccclass ], ResourceController4);
      return ResourceController4;
    }(ResourceController_1.default);
    exports.default = ResourceController4;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  ResourceController5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0cc3c7p7CpEm43DoqhIpGsS", "ResourceController5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController5 = function(_super) {
      __extends(ResourceController5, _super);
      function ResourceController5() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spriteListName = {
          item: {
            b: "img/item/item-bonus-gem",
            s: "img/item/item-scatter-gem",
            w: "img/item/item-wild-gem",
            0: "img/item/gem-item-ingame-1",
            1: "img/item/gem-item-ingame-2",
            2: "img/item/gem-item-ingame-3",
            3: "img/item/gem-item-ingame-4",
            4: "img/item/gem-item-ingame-5",
            5: "img/item/gem-item-ingame-6",
            6: "img/item/gem-item-ingame-7",
            7: "img/item/gem-item-ingame-8",
            8: "img/item/gem-item-ingame-9"
          },
          payTable: {},
          itemBorder: {
            b: "img/item/bg-bonus-gem",
            s: "img/item/bg-scatter-gem",
            w: "img/item/bg-wild-gem"
          },
          subItem: {
            bg: "img/bg-big"
          },
          minigame: [ "minigame/gem_minigame_bonus_item_01", "minigame/gem_minigame_bonus_item_02", "minigame/gem_minigame_bonus_item_03", "minigame/gem_minigame_bonus_item_04", "minigame/gem_minigame_bonus_item_05", "minigame/gem_minigame_bonus_item_06", "minigame/gem_minigame_bonus_item_07", "minigame/gem_minigame_bonus_item_08", "minigame/gem_minigame_bonus_item_09", "minigame/gem_minigame_bonus_item_10", "minigame/gem_minigame_bonus_item_11", "minigame/gem_minigame_bonus_item_12", "minigame/gem_minigame_bonus_item_13", "minigame/gem_minigame_bonus_item_14", "minigame/gem_minigame_bonus_item_15", "minigame/gem_minigame_bonus_item_fail_01", "minigame/gem_minigame_bonus_item_fail_02", "minigame/gem_minigame_bonus_item_total", "minigame/gem_minigame_bonus_item_white_01", "minigame/gem_minigame_bonus_item_white_02", "minigame/gem_minigame_bonus_item_white_03", "minigame/gem_minigame_bonus_item_white_04", "minigame/gem_minigame_bonus_item_white_05", "minigame/gem_minigame_bonus_item_white_06", "minigame/gem_minigame_bonus_item_white_07", "minigame/gem_minigame_bonus_item_white_08", "minigame/gem_minigame_bonus_item_white_09", "minigame/gem_minigame_bonus_item_white_10", "minigame/gem_minigame_bonus_item_white_11", "minigame/gem_minigame_bonus_item_white_12", "minigame/gem_minigame_bonus_item_white_13", "minigame/gem_minigame_bonus_item_white_14", "minigame/gem_minigame_bonus_item_white_15", "minigame/gem_minigame_bonus_item_white_fail" ]
        };
        _this.storageBase = "game-slot/5_Slot5/";
        _this.resourcePath = "4_gameScene/5_Slot5/";
        return _this;
      }
      ResourceController5.prototype.getListItemBorder = function() {
        var _this = this;
        var listBorderName = Object.keys(this.spriteListName.itemBorder);
        return listBorderName.reduce(function(res, i) {
          return res.concat([ {
            id: i,
            img: _this.spriteList.find(function(x) {
              return x.name == _this.spriteListName.itemBorder[i].split("/").pop();
            })
          } ]);
        }, []);
      };
      ResourceController5 = __decorate([ ccclass ], ResourceController5);
      return ResourceController5;
    }(ResourceController_1.default);
    exports.default = ResourceController5;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  ResourceController6: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0b042bTVWBBuKjiup0pyodv", "ResourceController6");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController6 = function(_super) {
      __extends(ResourceController6, _super);
      function ResourceController6() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spriteListName = {
          item: {},
          payTable: {},
          slotComponent: {
            originalBack: "img/bg_game_02",
            bonusBack: "img/bonus_game_bg"
          },
          subItem: {
            bg: "img/bg-big"
          },
          minigame: []
        };
        _this.audioListName = {};
        _this.storageBase = "game-slot/6_Slot6/";
        _this.resourcePath = "4_gameScene/6_Slot6/";
        return _this;
      }
      ResourceController6 = __decorate([ ccclass ], ResourceController6);
      return ResourceController6;
    }(ResourceController_1.default);
    exports.default = ResourceController6;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  ResourceController7: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3a62a3ASLRBvqlnpG/gAYhV", "ResourceController7");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController3_1 = require("../3_Slot3/ResourceController3");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController7 = function(_super) {
      __extends(ResourceController7, _super);
      function ResourceController7() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spriteListName = {
          item: {},
          subItem: {
            bg: "img/bg-big"
          },
          reelColor: {
            1: "img/item/khung_reels_1",
            2: "img/item/khung_reels_2",
            3: "img/item/khung_reels_3",
            4: "img/item/khung_reels_4",
            5: "img/item/khung_reels_5"
          },
          activeReels: {
            1: "img/item/active_reels_button_01",
            2: "img/item/active_reels_button_02",
            3: "img/item/active_reels_button_03",
            4: "img/item/active_reels_button_04",
            5: "img/item/active_reels_button_05"
          },
          lockReels: {
            1: "img/item/power_reels_lock_1",
            2: "img/item/power_reels_lock_2",
            3: "img/item/power_reels_lock_3",
            4: "img/item/power_reels_lock_4",
            5: "img/item/power_reels_lock_5"
          },
          reward: {
            MINI: "img/item/mini",
            MINOR: "img/item/minor",
            MAJOR: "img/item/major",
            MEGA: "img/item/mega"
          },
          minigame: [ "/minigame/reward", "/minigame/mini", "/minigame/minor", "/minigame/major", "/minigame/mega", "/minigame/total" ],
          payTable: {
            "scatter-shields": "paytable/scatter-shields",
            scatter_shields_txt: "paytable/scatter_shields_txt",
            title_free_spins: "paytable/title_free_spins",
            free_spins_txt: "paytable/free_spins_txt",
            title_rules: "paytable/title_rules",
            rules_txt: "paytable/rules_txt",
            title_wheel_spins: "paytable/title_wheel_spins",
            wheel_spins_tx: "paytable/wheel_spins_txt"
          }
        };
        _this.storageBase = "game-slot/7_Slot7/";
        _this.resourcePath = "4_gameScene/7_Slot7/";
        return _this;
      }
      ResourceController7 = __decorate([ ccclass ], ResourceController7);
      return ResourceController7;
    }(ResourceController3_1.default);
    exports.default = ResourceController7;
    cc._RF.pop();
  }, {
    "../3_Slot3/ResourceController3": "ResourceController3"
  } ],
  ResourceController8: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ca95706i69GIKjY5dAWHKuj", "ResourceController8");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController8 = function(_super) {
      __extends(ResourceController8, _super);
      function ResourceController8() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spriteListName = {
          item: {},
          subItem: {
            bg: "img/bg-big"
          },
          minigame: [ "minigame/active_effect_white", "minigame/daulau_red", "minigame/daulau_white", "minigame/quantai_boxuong", "minigame/quantai_off", "minigame/thienthan", "minigame/sach_gray" ],
          payTable: {
            bg_paytable: "img/bg_paytable",
            backtogame_left: "img/backtogame_left",
            backtogame_right: "img/backtogame_right",
            paytable1: "paytable/paytable1",
            paytable2: "paytable/paytable2",
            paytable3: "paytable/paytable3",
            paytable4: "paytable/paytable4"
          }
        };
        _this.storageBase = "game-slot/8_Slot8/";
        _this.resourcePath = "4_gameScene/8_Slot8/";
        return _this;
      }
      ResourceController8 = __decorate([ ccclass ], ResourceController8);
      return ResourceController8;
    }(ResourceController_1.default);
    exports.default = ResourceController8;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  ResourceController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8344bl+dlVHd4RXGWkNuWkQ", "ResourceController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("./ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ImageItem = function() {
      function ImageItem() {
        this.image = null;
        this.customName = "";
        this.folderPath = "";
      }
      ImageItem.prototype.getName = function() {
        return this.customName || this.image.name;
      };
      ImageItem.prototype.getPath = function() {
        this.folderPath || (this.folderPath = "img");
        return this.folderPath + "/" + util.game.getDefaultImage(this.getName());
      };
      __decorate([ property({
        type: cc.Node,
        tooltip: "K\xe9o node ch\u1ee9a h\xecnh \u1ea3nh mu\u1ed1n load resource v\xe0o. H\xecnh \u1ea3nh s\u1ebd \u0111\u01b0\u1ee3c load m\u1eb7c \u0111\u1ecbnh d\u1ef1a theo t\xean c\u1ee7a node n\xe0y."
      }) ], ImageItem.prototype, "image", void 0);
      __decorate([ property({
        tooltip: "Custom name \u0111\u1ec3 load h\xecnh \u1ea3nh n\u1ebfu k mu\u1ed1n d\xf9ng t\xean c\u1ee7a node."
      }) ], ImageItem.prototype, "customName", void 0);
      __decorate([ property({
        tooltip: "Custom path h\xecnh \u1ea3nh \u0111\u1ec3 load."
      }) ], ImageItem.prototype, "folderPath", void 0);
      ImageItem = __decorate([ ccclass("ImageItem") ], ImageItem);
      return ImageItem;
    }();
    exports.ImageItem = ImageItem;
    var SkeletonItem = function() {
      function SkeletonItem() {
        this.skeleton = null;
        this.folderName = "";
        this.animationName = "";
      }
      SkeletonItem.prototype.getName = function() {
        return this.folderName || this.skeleton.node.name;
      };
      SkeletonItem.prototype.getPath = function() {
        return "skeleton/" + this.getName();
      };
      __decorate([ property({
        type: sp.Skeleton,
        tooltip: "K\xe9o th\u1ea3 skeleton c\u1ea7n load source v\xe0o \u0111\xe2y"
      }) ], SkeletonItem.prototype, "skeleton", void 0);
      __decorate([ property({
        tooltip: "T\xean folder ch\u1ee9a 3 files c\u1ee7a skeleton."
      }) ], SkeletonItem.prototype, "folderName", void 0);
      __decorate([ property({
        tooltip: "T\xean animation m\u1eb7c \u0111\u1ecbnh \u0111\u01b0\u1ee3c ch\u1ea1y khi load xong resource."
      }) ], SkeletonItem.prototype, "animationName", void 0);
      SkeletonItem = __decorate([ ccclass("SkeletonItem") ], SkeletonItem);
      return SkeletonItem;
    }();
    exports.SkeletonItem = SkeletonItem;
    var PrefabItem = function() {
      function PrefabItem() {
        this.prefab = null;
        this.customPath = "";
      }
      PrefabItem.prototype.getName = function() {
        return this.customPath || this.prefab.name;
      };
      PrefabItem.prototype.getAllSpriteName = function() {
        var _this = this;
        var resourcePrefab = this.prefab.data.getComponentInChildren(ResourcePrefab_1.default);
        if (!resourcePrefab) return [];
        var result = resourcePrefab.listImage.map(function(item) {
          var customPath = item.folderPath || _this.getName();
          return customPath + "/" + util.game.getDefaultImage(item.getName());
        });
        return result;
      };
      PrefabItem.prototype.getAllSkeletonName = function() {
        var resourcePrefab = this.prefab.data.getComponentInChildren(ResourcePrefab_1.default);
        if (!resourcePrefab) return [];
        var result = resourcePrefab.listSkeleton.map(function(item) {
          return "" + item.getName();
        });
        return result;
      };
      __decorate([ property({
        type: cc.Prefab,
        tooltip: "K\xe9o th\u1ea3 c\xe1c prefab con c\u1ea7n load resource v\xe0o \u0111\xe2y. C\xe1c prefab n\xe0y c\u1ea7n c\xf3 1 node ch\u01b0a component ResourcePrefab \u0111\u1ec3 k\xe9o th\u1ea3 v\xe0 load source"
      }) ], PrefabItem.prototype, "prefab", void 0);
      __decorate([ property({
        tooltip: "\u0110\u01b0\u1eddng d\u1eabn tu\u1ef3 ch\u1ec9nh. M\u1eb7c \u0111\u1ecbnh s\u1ebd l\u1ea5y t\xean c\u1ee7a prefab."
      }) ], PrefabItem.prototype, "customPath", void 0);
      PrefabItem = __decorate([ ccclass("PrefabItem") ], PrefabItem);
      return PrefabItem;
    }();
    exports.PrefabItem = PrefabItem;
    var ResourceController = function(_super) {
      __extends(ResourceController, _super);
      function ResourceController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.storageBase = "game-slot/1_Slot1/";
        _this.resourcePath = "4_gameScene/1_Slot1/";
        _this.maxConcurrentDownloader = 5;
        _this.spriteListName = {
          item: {},
          payTable: {}
        };
        _this.skeletonListName = {};
        _this.audioListName = {};
        _this.resourceLinkBase = "http://64.120.114.208:9009/";
        _this.spriteList = [];
        _this.skeletonList = [];
        _this.audioList = [];
        _this.listImage = [];
        _this.listImageName = [];
        _this.listSkeleton = [];
        _this.listSkeletonFolder = [];
        _this.listPrefab = [];
        _this.totalResourcePath = [];
        _this.totalSpritePath = [];
        _this.totalSkeletonPath = [];
        _this.totalAudioPath = [];
        _this.writablePath = "";
        _this.omittedItemsPath = [];
        return _this;
      }
      ResourceController.prototype.checkData = function() {
        this.getResourceName();
        false;
        return true;
      };
      ResourceController.prototype.startDownload = function(doneCb, progressCb) {
        return __awaiter(this, void 0, Promise, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              true;
              return [ 3, 2 ];

             case 1:
              _a.sent();
              _a.label = 2;

             case 2:
              return [ 2 ];
            }
          });
        });
      };
      ResourceController.prototype.loadResourcesFromDisk = function(doneCb, progressCb) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              true;
              return [ 3, 2 ];

             case 1:
              _a.sent();
              return [ 3, 4 ];

             case 2:
              return [ 4, this.loadWebRes() ];

             case 3:
              _a.sent();
              _a.label = 4;

             case 4:
              this.loadSprites();
              this.loadSkeleton();
              return [ 2 ];
            }
          });
        });
      };
      ResourceController.prototype.getResourceName = function() {
        var _this = this;
        this.listImage.forEach(function(item) {
          _this.listImageName.push(item.getPath());
        });
        this.listPrefab.forEach(function(prefabItem) {
          _this.listImageName = _this.listImageName.concat(prefabItem.getAllSpriteName());
        });
        this.listSkeleton.forEach(function(item) {
          _this.listSkeletonFolder.push("" + item.getName());
        });
        this.listPrefab.forEach(function(prefabItem) {
          _this.listSkeletonFolder = _this.listSkeletonFolder.concat(prefabItem.getAllSkeletonName());
        });
      };
      ResourceController.prototype.getResourcePaths = function() {
        var _this = this;
        this.writablePath = jsb.fileUtils.getWritablePath();
        this.totalSpritePath = this.listImageName.map(function(item) {
          return _this.writablePath + _this.storageBase + item;
        });
        for (var x in this.spriteListName) for (var y in this.spriteListName[x]) {
          var name = this.spriteListName[x][y];
          name.includes(".jpg") || name.includes(".png") || (name += ".png");
          this.totalSpritePath.push(this.writablePath + this.storageBase + name);
        }
        this.listSkeletonFolder.forEach(function(item) {
          _this.totalSkeletonPath.push(_this.writablePath + _this.storageBase + "skeleton/" + item + "/skeleton.png");
          _this.totalSkeletonPath.push(_this.writablePath + _this.storageBase + "skeleton/" + item + "/skeleton.atlas");
          _this.totalSkeletonPath.push(_this.writablePath + _this.storageBase + "skeleton/" + item + "/skeleton.json");
        });
        this.totalAudioPath = Object.keys(this.audioListName).reduce(function(array, key) {
          var name = _this.audioListName[key];
          if (!name) return array;
          name.includes(".mp3") || (name += ".mp3");
          return array.concat([ _this.writablePath + _this.storageBase + "audio/" + name ]);
        }, []);
        this.totalSpritePath = Array.from(new Set(this.totalSpritePath));
        this.totalAudioPath = Array.from(new Set(this.totalAudioPath));
      };
      ResourceController.prototype.checkResources = function() {
        var omittedItems = [];
        this.totalSpritePath.forEach(function(item) {
          jsb.fileUtils.isFileExist(item) || omittedItems.push(item);
          jsb.fileUtils.isFileExist(item + ".meta") || omittedItems.push(item + ".meta");
        });
        this.totalSkeletonPath.forEach(function(item) {
          jsb.fileUtils.isFileExist(item) || omittedItems.push(item);
        });
        this.totalAudioPath.forEach(function(item) {
          jsb.fileUtils.isFileExist(item) || omittedItems.push(item);
        });
        if (0 == omittedItems.length) return true;
        var index = this.writablePath.length;
        this.omittedItemsPath = omittedItems.map(function(item) {
          return item.substr(index);
        });
        return false;
      };
      ResourceController.prototype.downloadResources = function(doneCb, progressCb) {
        var _this = this;
        return new Promise(function(res, rej) {
          game.log("Starting download ...");
          var completedCount = 0;
          var totalCount = _this.omittedItemsPath.length;
          var concurrent = 0;
          var index = 0;
          var date = Date.now();
          _this.omittedItemsPath.length || res();
          var newDirectories = Array.from(new Set(_this.omittedItemsPath.map(function(item) {
            return item.slice(0, item.lastIndexOf("/"));
          })));
          newDirectories.forEach(function(item) {
            jsb.fileUtils.createDirectory(_this.writablePath + item);
          });
          var downloadTask = function() {
            if (index >= totalCount) return;
            if (concurrent > _this.maxConcurrentDownloader) return;
            var downloader = new jsb.Downloader();
            downloader.createDownloadFileTask(_this.resourceLinkBase + _this.omittedItemsPath[index], _this.writablePath + _this.omittedItemsPath[index]);
            downloader.setOnFileTaskSuccess(function(task) {
              completedCount++;
              concurrent--;
              progressCb && progressCb(completedCount, totalCount);
              downloadTask();
              if (completedCount == totalCount) {
                game.log("Downloaded in", Date.now() - date);
                doneCb && doneCb(null);
                return res();
              }
            });
            downloader.setOnTaskError(function(task, errorCode, errorCodeInternal, errorStr) {
              game.log("download error", task, errorStr);
              doneCb(errorStr);
              return rej(errorStr);
            });
            concurrent++;
            index++;
            downloadTask();
          };
          downloadTask();
        });
      };
      ResourceController.prototype.loadNativeRes = function(doneCb, progressCb) {
        return __awaiter(this, void 0, Promise, function() {
          var completedCount_1, totalCount_1, updateProgress, error_1;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _a.trys.push([ 0, 2, , 3 ]);
              completedCount_1 = 0;
              totalCount_1 = this.totalSpritePath.length + this.listSkeletonFolder.length + this.totalAudioPath.length;
              updateProgress = function() {
                completedCount_1++;
                progressCb && progressCb(completedCount_1, totalCount_1);
              };
              return [ 4, Promise.all([ this.loadImageResNative(updateProgress), this.loadSkeletonResNative(updateProgress), this.loadAudioResNative(updateProgress) ]) ];

             case 1:
              _a.sent();
              doneCb && doneCb(null);
              return [ 2, true ];

             case 2:
              error_1 = _a.sent();
              doneCb && doneCb(error_1);
              return [ 2, false ];

             case 3:
              return [ 2 ];
            }
          });
        });
      };
      ResourceController.prototype.loadImageResNative = function(updateProgress) {
        var _this = this;
        return new Promise(function(res, rej) {
          var listImage = _this.totalSpritePath.filter(function(item) {
            return item.includes(".png") || item.includes(".jpg");
          });
          cc.loader.load(listImage, function(err, data) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                switch (_a.label) {
                 case 0:
                  if (err) {
                    game.log("load error", err);
                    return [ 2, rej(err) ];
                  }
                  return [ 4, Promise.all(listImage.map(function(item) {
                    return new Promise(function(res, rej) {
                      var source = data.getContent(item);
                      var index = source.url.lastIndexOf("/");
                      var name = source.url.substr(index + 1);
                      var sprite = new cc.SpriteFrame(source);
                      sprite.name = name.split(".")[0];
                      _this.spriteList.push(sprite);
                      cc.loader.load(item + ".meta", function(err, data) {
                        if (err) return rej(err);
                        _this.loadConfigToSpriteFrame(sprite, data);
                        res();
                      });
                    });
                  })) ];

                 case 1:
                  _a.sent();
                  res();
                  return [ 2 ];
                }
              });
            });
          });
        });
      };
      ResourceController.prototype.loadSkeletonResNative = function(updateProgress) {
        var _this = this;
        return Promise.all(this.listSkeletonFolder.map(function(item) {
          return __awaiter(_this, void 0, void 0, function() {
            var baseURL, _a, texture, atlasJson, spineJson, skeletonData;
            return __generator(this, function(_b) {
              switch (_b.label) {
               case 0:
                baseURL = this.writablePath + this.storageBase + "skeleton/" + item;
                return [ 4, Promise.all([ new Promise(function(res, rej) {
                  cc.loader.load(baseURL + "/skeleton.png", function(err, texture) {
                    return res(texture);
                  });
                }), new Promise(function(res, rej) {
                  cc.loader.load({
                    url: baseURL + "/skeleton.atlas",
                    type: "txt"
                  }, function(err, atlasJson) {
                    return res(atlasJson);
                  });
                }), new Promise(function(res, rej) {
                  cc.loader.load({
                    url: baseURL + "/skeleton.json",
                    type: "txt"
                  }, function(err, spineJson) {
                    return res(spineJson);
                  });
                }) ]) ];

               case 1:
                _a = _b.sent(), texture = _a[0], atlasJson = _a[1], spineJson = _a[2];
                skeletonData = new sp.SkeletonData();
                skeletonData.name = item;
                skeletonData.textures = [ texture ];
                skeletonData.atlasText = atlasJson;
                skeletonData.skeletonJson = JSON.parse(spineJson);
                skeletonData["textureNames"] = [ "skeleton.png" ];
                this.skeletonList.push(skeletonData);
                updateProgress && updateProgress();
                return [ 2 ];
              }
            });
          });
        }));
      };
      ResourceController.prototype.loadAudioResNative = function(updateProgress) {
        return __awaiter(this, void 0, void 0, function() {
          var _a;
          return __generator(this, function(_b) {
            switch (_b.label) {
             case 0:
              _a = this;
              return [ 4, Promise.all(this.totalAudioPath.map(function(item) {
                return new Promise(function(res) {
                  cc.loader.load(item, function(err, data) {
                    err && game.log(err);
                    data.name = item.split("/").pop().replace(".mp3", "");
                    res(data);
                    updateProgress && updateProgress();
                  });
                });
              })) ];

             case 1:
              _a.audioList = _b.sent();
              return [ 2 ];
            }
          });
        });
      };
      ResourceController.prototype.loadWebRes = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, Promise.all([ new Promise(function(res, rej) {
                cc.loader.loadResDir(_this.resourcePath, cc.SpriteFrame, function(err, data) {
                  if (err) return rej(err);
                  _this.spriteList = data;
                  res(data);
                });
              }), Promise.all(this.listSkeletonFolder.map(function(item) {
                return __awaiter(_this, void 0, void 0, function() {
                  var baseURL, skeletonData;
                  return __generator(this, function(_a) {
                    switch (_a.label) {
                     case 0:
                      baseURL = this.resourcePath + "skeleton/" + item + "/skeleton";
                      return [ 4, new Promise(function(res, rej) {
                        cc.loader.loadRes(baseURL, sp.SkeletonData, function(err, data) {
                          err && rej(err);
                          res(data);
                        });
                      }) ];

                     case 1:
                      skeletonData = _a.sent();
                      skeletonData.name = item;
                      this.skeletonList.push(skeletonData);
                      return [ 2 ];
                    }
                  });
                });
              })), new Promise(function(res, rej) {
                cc.loader.loadResDir(_this.resourcePath, cc.AudioClip, function(err, data) {
                  if (err) return rej(err);
                  _this.audioList = data;
                  res(data);
                });
              }) ]) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      ResourceController.prototype.loadSprites = function() {
        var _this = this;
        this.listImage.forEach(function(item) {
          if (!item.image) return;
          var sprite = _this.spriteList.find(function(ele) {
            return ele.name == item.getName();
          });
          item.image.getComponent(cc.Sprite).spriteFrame = sprite;
        });
      };
      ResourceController.prototype.loadSkeleton = function() {
        var _this = this;
        this.listSkeleton.forEach(function(item) {
          var name = item.folderName || item.skeleton.node.name;
          item.skeleton.skeletonData = _this.skeletonList.find(function(item) {
            return item.name == name;
          });
          item.skeleton.animation = item.animationName || "";
        });
      };
      ResourceController.prototype.getlistImgItem = function() {
        var _this = this;
        return Object.keys(this.spriteListName.item).reduce(function(res, cur) {
          return res.concat([ {
            id: cur,
            img: _this.spriteList.find(function(x) {
              return x.name == _this.spriteListName.item[cur].split("/").pop();
            })
          } ]);
        }, []);
      };
      ResourceController.prototype.loadConfigToSpriteFrame = function(spriteFrame, data) {
        try {
          var meta = JSON.parse(data);
          var config = meta.subMetas[Object.keys(meta.subMetas)[0]];
          spriteFrame.insetLeft = config.borderLeft;
          spriteFrame.insetRight = config.borderRight;
          spriteFrame.insetTop = config.borderTop;
          spriteFrame.insetBottom = config.borderBottom;
        } catch (error) {
          game.log("Load config to sprite fail:", error);
        }
      };
      ResourceController.prototype.getSprite = function(name) {
        return this.spriteList.find(function(x) {
          return x.name == name;
        });
      };
      ResourceController.prototype.getAudio = function(audioName) {
        if (!audioName) return;
        audioName.includes(".mp3") && (audioName = audioName.replace(".mp3", ""));
        return this.audioList.find(function(item) {
          return item.name == audioName;
        });
      };
      __decorate([ property({
        type: ImageItem,
        tooltip: "Nh\u1eadp s\u1ed1 l\u01b0\u1ee3ng \u1ea3nh c\u1ea7n load"
      }) ], ResourceController.prototype, "listImage", void 0);
      __decorate([ property({
        type: SkeletonItem,
        tooltip: "Nh\u1eadp s\u1ed1 l\u01b0\u1ee3ng skeleton c\u1ea7n load"
      }) ], ResourceController.prototype, "listSkeleton", void 0);
      __decorate([ property({
        type: PrefabItem,
        tooltip: "Nh\u1eadp s\u1ed1 l\u01b0\u1ee3ng prefab con c\u1ea7n load"
      }) ], ResourceController.prototype, "listPrefab", void 0);
      ResourceController = __decorate([ ccclass ], ResourceController);
      return ResourceController;
    }(cc.Component);
    exports.default = ResourceController;
    cc._RF.pop();
  }, {
    "./ResourcePrefab": "ResourcePrefab"
  } ],
  ResourceMiniGame5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "db42duYvd5AmaX9huAw3pKj", "ResourceMiniGame5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("../../../../scripts/Slots/ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceMinigame5 = function(_super) {
      __extends(ResourceMinigame5, _super);
      function ResourceMinigame5() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listResourceName = {
          items: {
            1: {
              normal: "gem_minigame_bonus_item_01",
              white: "gem_minigame_bonus_item_white_01"
            },
            2: {
              normal: "gem_minigame_bonus_item_02",
              white: "gem_minigame_bonus_item_white_02"
            },
            3: {
              normal: "gem_minigame_bonus_item_03",
              white: "gem_minigame_bonus_item_white_03"
            },
            4: {
              normal: "gem_minigame_bonus_item_04",
              white: "gem_minigame_bonus_item_white_04"
            },
            5: {
              normal: "gem_minigame_bonus_item_05",
              white: "gem_minigame_bonus_item_white_05"
            },
            6: {
              normal: "gem_minigame_bonus_item_06",
              white: "gem_minigame_bonus_item_white_06"
            },
            7: {
              normal: "gem_minigame_bonus_item_07",
              white: "gem_minigame_bonus_item_white_07"
            },
            8: {
              normal: "gem_minigame_bonus_item_08",
              white: "gem_minigame_bonus_item_white_08"
            },
            9: {
              normal: "gem_minigame_bonus_item_09",
              white: "gem_minigame_bonus_item_white_09"
            },
            10: {
              normal: "gem_minigame_bonus_item_10",
              white: "gem_minigame_bonus_item_white_10"
            },
            11: {
              normal: "gem_minigame_bonus_item_11",
              white: "gem_minigame_bonus_item_white_11"
            },
            12: {
              normal: "gem_minigame_bonus_item_12",
              white: "gem_minigame_bonus_item_white_12"
            },
            13: {
              normal: "gem_minigame_bonus_item_13",
              white: "gem_minigame_bonus_item_white_13"
            },
            14: {
              normal: "gem_minigame_bonus_item_14",
              white: "gem_minigame_bonus_item_white_14"
            },
            15: {
              normal: "gem_minigame_bonus_item_15",
              white: "gem_minigame_bonus_item_white_15"
            }
          },
          fail: {
            active: "gem_minigame_bonus_item_fail_01",
            normal: "gem_minigame_bonus_item_fail_02"
          },
          labelFrame: "gem_minigame_bonus_item_total",
          selectTable: {
            1: "gem-minigame-select-bonus-1",
            2: "gem-minigame-select-bonus-2"
          }
        };
        return _this;
      }
      ResourceMinigame5 = __decorate([ ccclass ], ResourceMinigame5);
      return ResourceMinigame5;
    }(ResourcePrefab_1.default);
    exports.default = ResourceMinigame5;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourcePrefab": "ResourcePrefab"
  } ],
  ResourceMiniGame6: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8e1beFss1lGab9ZTBeG+VeS", "ResourceMiniGame6");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("../../../../scripts/Slots/ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceMinigame6 = function(_super) {
      __extends(ResourceMinigame6, _super);
      function ResourceMinigame6() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listResourceName = {
          items: {
            1: {
              normal: "gem_minigame_bonus_item_01",
              white: "gem_minigame_bonus_item_white_01"
            },
            2: {
              normal: "gem_minigame_bonus_item_02",
              white: "gem_minigame_bonus_item_white_02"
            },
            3: {
              normal: "gem_minigame_bonus_item_03",
              white: "gem_minigame_bonus_item_white_03"
            },
            4: {
              normal: "gem_minigame_bonus_item_04",
              white: "gem_minigame_bonus_item_white_04"
            },
            5: {
              normal: "gem_minigame_bonus_item_05",
              white: "gem_minigame_bonus_item_white_05"
            },
            6: {
              normal: "gem_minigame_bonus_item_06",
              white: "gem_minigame_bonus_item_white_06"
            },
            7: {
              normal: "gem_minigame_bonus_item_07",
              white: "gem_minigame_bonus_item_white_07"
            },
            8: {
              normal: "gem_minigame_bonus_item_08",
              white: "gem_minigame_bonus_item_white_08"
            },
            9: {
              normal: "gem_minigame_bonus_item_09",
              white: "gem_minigame_bonus_item_white_09"
            },
            10: {
              normal: "gem_minigame_bonus_item_10",
              white: "gem_minigame_bonus_item_white_10"
            },
            11: {
              normal: "gem_minigame_bonus_item_11",
              white: "gem_minigame_bonus_item_white_11"
            },
            12: {
              normal: "gem_minigame_bonus_item_12",
              white: "gem_minigame_bonus_item_white_12"
            },
            13: {
              normal: "gem_minigame_bonus_item_13",
              white: "gem_minigame_bonus_item_white_13"
            },
            14: {
              normal: "gem_minigame_bonus_item_14",
              white: "gem_minigame_bonus_item_white_14"
            },
            15: {
              normal: "gem_minigame_bonus_item_15",
              white: "gem_minigame_bonus_item_white_15"
            }
          },
          fail: {
            active: "gem_minigame_bonus_item_fail_01",
            normal: "gem_minigame_bonus_item_fail_02"
          },
          labelFrame: "gem_minigame_bonus_item_total",
          selectTable: {
            1: "gem-minigame-select-bonus-1",
            2: "gem-minigame-select-bonus-2"
          }
        };
        return _this;
      }
      ResourceMinigame6 = __decorate([ ccclass ], ResourceMinigame6);
      return ResourceMinigame6;
    }(ResourcePrefab_1.default);
    exports.default = ResourceMinigame6;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourcePrefab": "ResourcePrefab"
  } ],
  ResourceMiniGame7: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "dc29aH0/9NEMYUL5CzTkZdZ", "ResourceMiniGame7");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("../../../../scripts/Slots/ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceMinigame7 = function(_super) {
      __extends(ResourceMinigame7, _super);
      function ResourceMinigame7() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listResourceName = {
          jackpots: {
            0: "reward",
            1: "mini",
            2: "minor",
            3: "major",
            4: "mega",
            5: "total"
          }
        };
        return _this;
      }
      ResourceMinigame7 = __decorate([ ccclass ], ResourceMinigame7);
      return ResourceMinigame7;
    }(ResourcePrefab_1.default);
    exports.default = ResourceMinigame7;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourcePrefab": "ResourcePrefab"
  } ],
  ResourceMiniGame8: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "75951An3Q9Ks5jY1SgMt5rB", "ResourceMiniGame8");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("../../../../scripts/Slots/ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceMinigame8 = function(_super) {
      __extends(ResourceMinigame8, _super);
      function ResourceMinigame8() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listResourceName = {
          fail: {
            active: "daulau_white",
            normal: "daulau_red"
          },
          items: {
            1: "thienthan",
            0: "quantai_boxuong"
          },
          itemNormal: "quantai_off",
          itemEffect: "active_effect_white",
          disable: "sach_gray"
        };
        return _this;
      }
      ResourceMinigame8 = __decorate([ ccclass ], ResourceMinigame8);
      return ResourceMinigame8;
    }(ResourcePrefab_1.default);
    exports.default = ResourceMinigame8;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourcePrefab": "ResourcePrefab"
  } ],
  ResourceMinigame1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4c76aTINXRMko6EeEm7vSjK", "ResourceMinigame1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("../../../../scripts/Slots/ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceMinigame1 = function(_super) {
      __extends(ResourceMinigame1, _super);
      function ResourceMinigame1() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      ResourceMinigame1 = __decorate([ ccclass ], ResourceMinigame1);
      return ResourceMinigame1;
    }(ResourcePrefab_1.default);
    exports.default = ResourceMinigame1;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourcePrefab": "ResourcePrefab"
  } ],
  ResourceMinigame2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ea71940qQ9BDLbQbaUDXGhG", "ResourceMinigame2");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("../../../../scripts/Slots/ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceMinigame2 = function(_super) {
      __extends(ResourceMinigame2, _super);
      function ResourceMinigame2() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      ResourceMinigame2 = __decorate([ ccclass ], ResourceMinigame2);
      return ResourceMinigame2;
    }(ResourcePrefab_1.default);
    exports.default = ResourceMinigame2;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourcePrefab": "ResourcePrefab"
  } ],
  ResourceMinigame3: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ce8f0vjBKZBJJ1EC6oiKRxw", "ResourceMinigame3");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("../../../../scripts/Slots/ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceMinigame3 = function(_super) {
      __extends(ResourceMinigame3, _super);
      function ResourceMinigame3() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listResourceName = {
          items: {
            1: "bap_cai_dark",
            2: "cu_hanh_dark",
            3: "huong_duong_dark",
            4: "ca_rot_dark"
          },
          nomal: {
            1: "bap_cai_final",
            2: "cu_hanh_final",
            3: "huong_duong_alpha-13",
            4: "ca_rot_final"
          },
          snake: {
            0: "snake"
          },
          gold: {
            1: "gold_bap_cai",
            2: "gold_cu_hanh",
            3: "gold_huong_duong",
            4: "gold_ca_rot"
          },
          white: {
            1: "bap_cai_alpha",
            2: "cu_hanh_alpha",
            3: "huong_duong_alpha",
            4: "ca_rot_alpha"
          }
        };
        return _this;
      }
      ResourceMinigame3 = __decorate([ ccclass ], ResourceMinigame3);
      return ResourceMinigame3;
    }(ResourcePrefab_1.default);
    exports.default = ResourceMinigame3;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourcePrefab": "ResourcePrefab"
  } ],
  ResourceMinigame4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3030cAzQURD1ZwN5t1Kyglx", "ResourceMinigame4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcePrefab_1 = require("../../../../scripts/Slots/ResourcePrefab");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceMinigame4 = function(_super) {
      __extends(ResourceMinigame4, _super);
      function ResourceMinigame4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listResourceName = {
          items: {
            0: "casino-slot-coin-grand",
            1: "casino-slot-coin-major",
            2: "casino-slot-coin-minor",
            3: "casino-slot-coin-mini"
          },
          itemNormal: [ "casino-slot-coin-normal" ]
        };
        return _this;
      }
      ResourceMinigame4 = __decorate([ ccclass ], ResourceMinigame4);
      return ResourceMinigame4;
    }(ResourcePrefab_1.default);
    exports.default = ResourceMinigame4;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourcePrefab": "ResourcePrefab"
  } ],
  ResourcePrefab: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7a417UEGSFI/6Du/8W335dX", "ResourcePrefab");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("./ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourcePrefab = function(_super) {
      __extends(ResourcePrefab, _super);
      function ResourcePrefab() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.listImage = [];
        _this.listSkeleton = [];
        _this.resourceController = null;
        return _this;
      }
      ResourcePrefab.prototype.loadResources = function() {
        this.loadSprites();
        this.loadSkeletons();
      };
      ResourcePrefab.prototype.loadSprites = function() {
        var _this = this;
        this.listImage.forEach(function(item) {
          if (!item.image) return;
          var sprite = _this.resourceController.spriteList.find(function(ele) {
            return ele.name == item.getName();
          });
          item.image.getComponent(cc.Sprite).spriteFrame = sprite;
        });
      };
      ResourcePrefab.prototype.loadSkeletons = function() {
        var _this = this;
        this.listSkeleton.forEach(function(item) {
          if (!item.skeleton) return;
          var name = item.folderName || item.skeleton.node.name;
          item.skeleton.skeletonData = _this.resourceController.skeletonList.find(function(item) {
            return item.name == name;
          });
          item.skeleton.animation = item.animationName || "";
        });
      };
      __decorate([ property({
        type: ResourceController_1.ImageItem,
        tooltip: "K\xe9o th\u1ea3 h\xecnh \u1ea3nh v\xe0o \u0111\xe2y ^.^"
      }) ], ResourcePrefab.prototype, "listImage", void 0);
      __decorate([ property({
        type: ResourceController_1.SkeletonItem,
        tooltip: "K\xe9o th\u1ea3 skeleton v\xe0o \u0111\xe2y"
      }) ], ResourcePrefab.prototype, "listSkeleton", void 0);
      ResourcePrefab = __decorate([ ccclass ], ResourcePrefab);
      return ResourcePrefab;
    }(cc.Component);
    exports.default = ResourcePrefab;
    cc._RF.pop();
  }, {
    "./ResourceController": "ResourceController"
  } ],
  SlotController1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0a173IQnrZAgLibwPTvUO3q", "SlotController1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController1_1 = require("./ResourceController1");
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var AccumulatedBar1_1 = require("./AccumulatedBar1");
    var CoinLabel_1 = require("../../../scripts/Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController1 = function(_super) {
      __extends(SlotController1, _super);
      function SlotController1() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.accumilatedBar = null;
        _this.coinBonusLabel = null;
        _this.coinBonusLerp = 10;
        _this.originalCoin = null;
        _this.stickyWildContainer = null;
        _this.miniGame = null;
        _this.resourceController = null;
        _this.coinBonus = 0;
        _this.coinBonusController = null;
        _this.stickyList = [];
        return _this;
      }
      SlotController1.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          var error_1;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _a.trys.push([ 0, 4, , 5 ]);
              this.stickyWildContainer.parent = this.tableView;
              this.stickyWildContainer.zIndex = 1;
              this.coinBonusController = new CoinLabel_1.default(this.coinBonusLabel, this.coinBonusLerp, "$");
              _super.prototype.startSlot.call(this);
              if (!this.dataStatus.bonus) return [ 3, 2 ];
              if (!this.dataStatus.bonus.w) return [ 3, 2 ];
              this.bonus = true;
              controller.ui.showModel();
              game.log("start load bonus");
              return [ 4, this.playBonus(this.dataStatus.bonus) ];

             case 1:
              _a.sent();
              controller.ui.hideModel();
              _a.label = 2;

             case 2:
              return [ 4, util.game.delay(200, this.node) ];

             case 3:
              _a.sent();
              this.dataStatus.collect = this.dataStatus.collect || {
                c: 0,
                tc: 100
              };
              this.accumilatedBar.updateProgress(this.dataStatus.collect.c / this.dataStatus.collect.tc);
              this.coinBonus = this.dataStatus.collect.w;
              this.coinBonusController.updateUserBalance(this.coinBonus);
              if (this.dataStatus.freeSpin.c > 0) {
                this.accumilatedBar.node.runAction(cc.sequence([ cc.delayTime(.2), cc.fadeOut(.4) ]));
                this.handleStickyWild(this.dataStatus.lastmat);
              }
              return [ 3, 5 ];

             case 4:
              error_1 = _a.sent();
              game.error(error_1);
              return [ 3, 5 ];

             case 5:
              return [ 2 ];
            }
          });
        });
      };
      SlotController1.prototype.getAnimationController = function() {
        this.animationController = this.node.getComponent("AnimationController");
      };
      SlotController1.prototype.handleCollectCoin = function(_a) {
        var _this = this;
        var collect = _a.features.collect;
        return new Promise(function(res, rej) {
          return __awaiter(_this, void 0, void 0, function() {
            var listItem, listCoin_1, error_2;
            var _this = this;
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                _a.trys.push([ 0, 5, , 6 ]);
                listItem = this.reelController[0]._listItem.slice(1);
                listCoin_1 = [];
                listItem.forEach(function(item) {
                  item.forEach(function(item) {
                    "c" === item.id && listCoin_1.push(item);
                  });
                });
                if (!listCoin_1.length) return [ 3, 2 ];
                listCoin_1.forEach(function(item) {
                  var coin = new cc.Node("coin");
                  var front = new cc.Node("coin");
                  var mainPosition = _this.originalCoin.parent.convertToWorldSpaceAR(cc.v2(0, 0));
                  var coinPosition = item.node.convertToWorldSpaceAR(cc.v2(0, 0));
                  coin.addComponent(cc.Sprite);
                  front.addComponent(cc.Sprite);
                  coin.getComponent(cc.Sprite).spriteFrame = _this.resourceController.getSprite(_this.resourceController.spriteListName.subItem.coin.split("/").pop());
                  front.getComponent(cc.Sprite).spriteFrame = _this.resourceController.getSprite(_this.resourceController.spriteListName.item.c.split("/").pop());
                  item.mainItem.getComponent(cc.Sprite).spriteFrame = _this.resourceController.getSprite(_this.resourceController.spriteListName.subItem.coinGray.split("/").pop());
                  front.parent = item.node;
                  front.setPosition(0, 0);
                  item.node.getComponentInChildren(cc.Label).node.zIndex = 2;
                  front.runAction(cc.sequence(cc.fadeOut(.6), cc.callFunc(function() {
                    front.destroy();
                    coin.parent = _this.originalCoin.parent;
                    coin.setPosition(coinPosition.x - mainPosition.x, coinPosition.y - mainPosition.y + 2);
                    coin.opacity = 0;
                    coin.runAction(cc.fadeIn(.2));
                  }), cc.callFunc(function() {
                    coin.runAction(cc.sequence(cc.scaleTo(.5, 1.2), cc.callFunc(function() {
                      var time = .7;
                      coin.runAction(cc.moveTo(time, _this.originalCoin.getPosition()));
                      coin.runAction(cc.sequence(cc.skewTo(time / 2 - time / 5, 45, 45), cc.skewTo(time / 2 - time / 5, 0, 0)));
                      coin.runAction(cc.scaleTo(time / 2, .6));
                      coin.runAction(cc.sequence(cc.delayTime(time), cc.scaleTo(.1, .55), cc.scaleTo(.1, .6), cc.delayTime(.1), cc.callFunc(function() {
                        coin.destroy();
                      })));
                    })));
                  })));
                });
                return [ 4, util.game.delay(2e3, this.node, res) ];

               case 1:
                _a.sent();
                this.accumilatedBar.updateProgress(collect.c / collect.tc);
                this.coinBonusController.updateUserBalance(collect.w);
                this.coinBonusController.coinLabel.node.runAction(cc.sequence(cc.scaleTo(.2, 1.2), cc.scaleTo(.2, 1)));
                return [ 3, 4 ];

               case 2:
                return [ 4, util.game.delay(100, this.node, res).catch(function(e) {}) ];

               case 3:
                _a.sent();
                _a.label = 4;

               case 4:
                return [ 3, 6 ];

               case 5:
                error_2 = _a.sent();
                res();
                return [ 3, 6 ];

               case 6:
                return [ 2 ];
              }
            });
          });
        });
      };
      SlotController1.prototype.handleFreeSpin = function(dataSpin) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            if (dataSpin.spinResult.freeSpin) {
              this.freeSpin = dataSpin.spinResult.freeSpin;
              this.accumilatedBar.node.opacity && this.accumilatedBar.node.runAction(cc.fadeOut(.3));
            } else 0 === this.accumilatedBar.node.opacity && this.accumilatedBar.node.runAction(cc.fadeIn(.3));
            _super.prototype.handleFreeSpin.call(this, dataSpin);
            this.handleStickyWild(dataSpin.spinResult.mat[0]);
            dataSpin.freeSpin && 0 == dataSpin.freeSpin.c && this.destroyStickyWild();
            return [ 2 ];
          });
        });
      };
      SlotController1.prototype.handleStickyWild = function(mat) {
        var swPosition = mat.split(",").reduce(function(arr, item, index) {
          return "sw" === item ? arr.concat([ index ]) : arr;
        }, []);
        swPosition = swPosition.map(function(item, index) {
          return {
            x: item / 6 | 0,
            y: item % 6,
            index: item
          };
        });
        swPosition.length && this.showStickyWild(swPosition);
      };
      SlotController1.prototype.showStickyWild = function(swPosition) {
        var _this = this;
        var listItem = this.reelController[0]._listItem.slice(1);
        var list = swPosition.map(function(item) {
          return {
            index: item.index,
            slotItem: listItem[item.x][item.y]
          };
        });
        list.forEach(function(item) {
          if (_this.stickyList.map(function(item) {
            return item.index;
          }).indexOf(item.index) >= 0) return;
          var newNode = new cc.Node("sticky");
          var newSprite = newNode.addComponent(cc.Sprite);
          newSprite.spriteFrame = item.slotItem.mainItemSprite.spriteFrame;
          var mainNode = new cc.Node("borderSticky");
          var mainSprite = mainNode.addComponent(cc.Sprite);
          mainSprite.spriteFrame = _this.resourceController.getSprite(_this.resourceController.spriteListName.subItem.wildBorder.split("/").pop());
          var targetPosition = _this.stickyWildContainer.convertToWorldSpaceAR(cc.v2(0, 0));
          var wildPosition = item.slotItem.node.convertToWorldSpaceAR(cc.v2(0, 0));
          mainNode.parent = _this.stickyWildContainer;
          mainNode.setPosition(wildPosition.sub(targetPosition));
          newNode.parent = mainNode;
          _this.stickyList.push({
            index: item.index,
            node: mainNode
          });
        });
        game.log(this.stickyList);
      };
      SlotController1.prototype.destroyStickyWild = function() {
        this.stickyList.forEach(function(item) {
          item.node.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
            item.node.destroy();
          })));
        });
        this.stickyList = [];
      };
      SlotController1.prototype.handleBonus = function(dataSpin) {
        this.playBonus(dataSpin.spinResult.score.sum[2]);
      };
      SlotController1.prototype.playBonus = function(_a) {
        var mul = _a.mul, mulArr = _a.mulArr, w = _a.w;
        return __awaiter(this, void 0, void 0, function() {
          var canvas, miniGameNode, miniGameController;
          return __generator(this, function(_b) {
            switch (_b.label) {
             case 0:
              canvas = cc.find("Canvas");
              miniGameNode = cc.instantiate(this.miniGame);
              miniGameController = miniGameNode.getComponent("MinigameController1");
              miniGameController._slotController = this;
              miniGameNode.x = cc.winSize.width;
              miniGameNode.opacity = 0;
              miniGameNode.zIndex = define.zIndex.MINIGAME;
              miniGameNode.parent = canvas;
              return [ 4, miniGameController.startMiniGame(mul, mulArr, w) ];

             case 1:
              _b.sent();
              miniGameNode.parent = void 0;
              this.bonusNode = miniGameNode;
              this.checkShowBonusDialog();
              return [ 2 ];
            }
          });
        });
      };
      __decorate([ property(AccumulatedBar1_1.default) ], SlotController1.prototype, "accumilatedBar", void 0);
      __decorate([ property(cc.Label) ], SlotController1.prototype, "coinBonusLabel", void 0);
      __decorate([ property(cc.Integer) ], SlotController1.prototype, "coinBonusLerp", void 0);
      __decorate([ property(cc.Node) ], SlotController1.prototype, "originalCoin", void 0);
      __decorate([ property(cc.Node) ], SlotController1.prototype, "stickyWildContainer", void 0);
      __decorate([ property(cc.Prefab) ], SlotController1.prototype, "miniGame", void 0);
      __decorate([ property(ResourceController1_1.default) ], SlotController1.prototype, "resourceController", void 0);
      SlotController1 = __decorate([ ccclass ], SlotController1);
      return SlotController1;
    }(SlotController_1.default);
    exports.default = SlotController1;
    cc._RF.pop();
  }, {
    "../../../scripts/Components/CoinLabel": "CoinLabel",
    "../../../scripts/Slots/SlotController": "SlotController",
    "./AccumulatedBar1": "AccumulatedBar1",
    "./ResourceController1": "ResourceController1"
  } ],
  SlotController2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fc160JMdmFJoLP26bXfNzO3", "SlotController2");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController2_1 = require("./ResourceController2");
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var AccumulatedBar2_1 = require("./AccumulatedBar2");
    var CoinLabel_1 = require("../../../scripts/Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController2 = function(_super) {
      __extends(SlotController2, _super);
      function SlotController2() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.accumilatedBar = null;
        _this.coinBonusLabel = null;
        _this.coinBonusLerp = 5;
        _this.stickyWildContainer = null;
        _this.originalCoin = null;
        _this.miniGame = null;
        _this.particleCoinBonus = null;
        _this.lightCoin = null;
        _this.resourceController = null;
        _this.coinBonus = 0;
        _this.coinBonusController = null;
        _this.stickyList = [];
        return _this;
      }
      SlotController2.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.coinBonusController = new CoinLabel_1.default(this.coinBonusLabel, this.coinBonusLerp, "$");
              _super.prototype.startSlot.call(this);
              if (!this.dataStatus.bonus) return [ 3, 2 ];
              if (!this.dataStatus.bonus.w) return [ 3, 2 ];
              this.bonus = true;
              controller.ui.showModel();
              game.log("start load bonus");
              return [ 4, this.playBonus(this.dataStatus.bonus) ];

             case 1:
              _a.sent();
              controller.ui.hideModel();
              _a.label = 2;

             case 2:
              setTimeout(function() {
                _this.accumilatedBar.updateProgress(_this.dataStatus.collect.c / _this.dataStatus.collect.tc);
                _this.coinBonus = _this.dataStatus.collect.w;
                _this.coinBonusController.updateUserBalance(_this.coinBonus, {
                  lerpRatio: 10
                });
                if (_this.dataStatus.freeSpin.c > 0) {
                  setTimeout(function() {
                    _this.accumilatedBar.node.runAction(cc.fadeOut(.4));
                  }, 200);
                  _this.handleStickyWild(_this.dataStatus.lastmat);
                }
              }, 200);
              this.dataStatus.bonus;
              return [ 2 ];
            }
          });
        });
      };
      SlotController2.prototype.loadBorderRes = function() {
        var _this = this;
        var listBorderImg = this.resourceController.getListItemBorder();
        listBorderImg.forEach(function(res) {
          var item = {
            id: res.id,
            img: res.img
          };
          _this._listBorderImg.push(item);
        });
      };
      SlotController2.prototype.getAnimationController = function() {
        this.animationController = this.node.getComponent("AnimationController");
      };
      SlotController2.prototype.handleCollectCoin = function(_a) {
        var _this = this;
        var collect = _a.features.collect;
        return new Promise(function(res, rej) {
          var listItem = _this.reelController[0]._listItem.slice(1);
          var listCoin = [];
          listItem.forEach(function(item) {
            item.forEach(function(item) {
              "c" === item.id && listCoin.push(item);
            });
          });
          if (listCoin.length) {
            listCoin.forEach(function(item) {
              var coin = new cc.Node("coin");
              var front = new cc.Node("coin");
              var mainPosition = _this.originalCoin.parent.convertToWorldSpaceAR(cc.v2(0, 0));
              var coinPosition = item.node.convertToWorldSpaceAR(cc.v2(0, 0));
              coin.addComponent(cc.Sprite);
              front.addComponent(cc.Sprite);
              coin.getComponent(cc.Sprite).spriteFrame = _this.resourceController.getSprite(_this.resourceController.spriteListName.subItem.coin.split("/").pop());
              front.getComponent(cc.Sprite).spriteFrame = _this.resourceController.getSprite(_this.resourceController.spriteListName.item.c.split("/").pop());
              item.mainItem.getComponent(cc.Sprite).spriteFrame = _this.resourceController.getSprite(_this.resourceController.spriteListName.subItem.coinGray.split("/").pop());
              front.parent = item.node;
              front.setPosition(0, 0);
              item.node.getComponentInChildren(cc.Label).node.zIndex = 2;
              front.runAction(cc.sequence(cc.fadeOut(.6), cc.callFunc(function() {
                front.destroy();
                coin.parent = _this.originalCoin.parent;
                coin.setPosition(coinPosition.x - mainPosition.x, coinPosition.y - mainPosition.y + 2);
                coin.opacity = 0;
                coin.runAction(cc.fadeIn(.2));
              }), cc.callFunc(function() {
                coin.runAction(cc.sequence(cc.scaleTo(.5, 1.2), cc.callFunc(function() {
                  var time = .7;
                  coin.runAction(cc.moveTo(time, _this.originalCoin.getPosition()));
                  coin.runAction(cc.sequence(cc.skewTo(time / 2 - time / 5, 45, 45), cc.skewTo(time / 2 - time / 5, 0, 0)));
                  coin.runAction(cc.scaleTo(time / 2, .6));
                  coin.runAction(cc.sequence(cc.delayTime(time), cc.scaleTo(.1, .55), cc.scaleTo(.1, .6), cc.delayTime(.1), cc.callFunc(function() {
                    coin.destroy();
                  })));
                })));
              })));
            });
            setTimeout(function() {
              _this.accumilatedBar.updateProgress(collect.c / collect.tc);
              _this.coinBonusController.updateUserBalance(collect.w, {
                lerpRatio: 10
              });
              _this.coinBonusController.coinLabel.node.runAction(cc.sequence(cc.callFunc(function() {
                _this.lightCoin.getComponent(cc.Animation).play();
                _this.particleCoin();
              }), cc.scaleTo(.2, 1.2), cc.scaleTo(.2, 1)));
              res();
            }, 2e3);
          } else setTimeout(function() {
            return res();
          }, 100);
        });
      };
      SlotController2.prototype.handleFreeSpin = function(dataSpin) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            if (dataSpin.spinResult.freeSpin) {
              this.freeSpin = dataSpin.spinResult.freeSpin;
              this.accumilatedBar.node.opacity && this.accumilatedBar.node.runAction(cc.fadeOut(.3));
            } else 0 === this.accumilatedBar.node.opacity && this.accumilatedBar.node.runAction(cc.fadeIn(.3));
            _super.prototype.handleFreeSpin.call(this, dataSpin);
            this.handleStickyWild(dataSpin.spinResult.mat[0]);
            dataSpin.freeSpin && 0 == dataSpin.freeSpin.c && this.destroyStickyWild();
            return [ 2 ];
          });
        });
      };
      SlotController2.prototype.handleStickyWild = function(mat) {
        var swPosition = mat.split(",").reduce(function(arr, item, index) {
          return "sw" === item ? arr.concat([ index ]) : arr;
        }, []);
        swPosition = swPosition.map(function(item, index) {
          return {
            x: item / 6 | 0,
            y: item % 6,
            index: item
          };
        });
        swPosition.length && this.showStickyWild(swPosition);
      };
      SlotController2.prototype.showStickyWild = function(swPosition) {
        var _this = this;
        var listItem = this.reelController[0]._listItem.slice(1);
        var list = swPosition.map(function(item) {
          return {
            index: item.index,
            slotItem: listItem[item.x][item.y]
          };
        });
        list.forEach(function(item) {
          if (_this.stickyList.map(function(item) {
            return item.index;
          }).indexOf(item.index) >= 0) return;
          var newNode = new cc.Node("sticky");
          newNode.addComponent(cc.Sprite);
          newNode.getComponent(cc.Sprite).spriteFrame = item.slotItem.mainItemSprite.spriteFrame;
          var mainNode = new cc.Node("borderSticky");
          mainNode.addComponent(cc.Sprite);
          mainNode.getComponent(cc.Sprite).spriteFrame = _this.resourceController.getSprite(_this.resourceController.spriteListName.subItem.wildBorder.split("/").pop());
          var targetPosition = _this.stickyWildContainer.convertToWorldSpaceAR(cc.v2(0, 0));
          var wildPosition = item.slotItem.node.convertToWorldSpaceAR(cc.v2(0, 0));
          mainNode.parent = _this.stickyWildContainer;
          mainNode.setPosition(wildPosition.sub(targetPosition));
          newNode.parent = mainNode;
          _this.stickyList.push({
            index: item.index,
            node: mainNode
          });
        });
      };
      SlotController2.prototype.destroyStickyWild = function() {
        this.stickyList.forEach(function(item) {
          item.node.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
            item.node.destroy();
          })));
        });
        this.stickyList = [];
      };
      SlotController2.prototype.handleBonus = function(dataSpin) {
        this.playBonus(dataSpin.spinResult.score.sum[2]);
      };
      SlotController2.prototype.playBonus = function(_a) {
        var mul = _a.mul, mulArr = _a.mulArr, w = _a.w;
        return __awaiter(this, void 0, void 0, function() {
          var canvas, miniGameNode, miniGameController;
          return __generator(this, function(_b) {
            switch (_b.label) {
             case 0:
              canvas = cc.find("Canvas");
              miniGameNode = cc.instantiate(this.miniGame);
              miniGameController = miniGameNode.getComponent("MinigameController2");
              miniGameController._slotController = this;
              miniGameNode.x = cc.winSize.width;
              miniGameNode.opacity = 0;
              miniGameNode.zIndex = define.zIndex.MINIGAME;
              miniGameNode.parent = canvas;
              view.screen.bonus = miniGameController;
              return [ 4, miniGameController.startMiniGame(mul, mulArr, w) ];

             case 1:
              _b.sent();
              miniGameNode.parent = void 0;
              this.bonusNode = miniGameNode;
              this.checkShowBonusDialog();
              return [ 2 ];
            }
          });
        });
      };
      SlotController2.prototype.particleCoin = function() {
        var _this = this;
        this.particleCoinBonus.active = true;
        setTimeout(function() {
          _this.particleCoinBonus.active = false;
        }, 1500);
      };
      __decorate([ property(AccumulatedBar2_1.default) ], SlotController2.prototype, "accumilatedBar", void 0);
      __decorate([ property(cc.Label) ], SlotController2.prototype, "coinBonusLabel", void 0);
      __decorate([ property(cc.Integer) ], SlotController2.prototype, "coinBonusLerp", void 0);
      __decorate([ property(cc.Node) ], SlotController2.prototype, "stickyWildContainer", void 0);
      __decorate([ property(cc.Node) ], SlotController2.prototype, "originalCoin", void 0);
      __decorate([ property(cc.Prefab) ], SlotController2.prototype, "miniGame", void 0);
      __decorate([ property(cc.Node) ], SlotController2.prototype, "particleCoinBonus", void 0);
      __decorate([ property(cc.Node) ], SlotController2.prototype, "lightCoin", void 0);
      __decorate([ property(ResourceController2_1.default) ], SlotController2.prototype, "resourceController", void 0);
      SlotController2 = __decorate([ ccclass ], SlotController2);
      return SlotController2;
    }(SlotController_1.default);
    exports.default = SlotController2;
    cc._RF.pop();
  }, {
    "../../../scripts/Components/CoinLabel": "CoinLabel",
    "../../../scripts/Slots/SlotController": "SlotController",
    "./AccumulatedBar2": "AccumulatedBar2",
    "./ResourceController2": "ResourceController2"
  } ],
  SlotController3: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cece9ZRt9ZL/br9ZC/R4Bml", "SlotController3");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var ResourceController3_1 = require("./ResourceController3");
    var Item_1 = require("../../../scripts/Slots/Item");
    var SlotController3 = function(_super) {
      __extends(SlotController3, _super);
      function SlotController3() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.miniGamePrefab = null;
        _this.resourceController = null;
        _this.listItemSkeleton = {
          b: "bonus",
          s: "scatter",
          w: "wild",
          0: "quabingo",
          1: "quacachua",
          2: "quaduahau",
          3: "quadua",
          4: "quaoi",
          5: "quathanglong",
          6: "conbo",
          7: "concho",
          8: "conde"
        };
        return _this;
      }
      SlotController3.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _super.prototype.startSlot.call(this);
              if (!this.dataStatus.bonus) return [ 3, 3 ];
              if (!this.dataStatus.bonus.w) return [ 3, 3 ];
              this.bonus = true;
              controller.ui.showModel();
              return [ 4, util.game.delay(200) ];

             case 1:
              _a.sent();
              game.log("start load bonus");
              return [ 4, this.playBonus(this.dataStatus.bonus) ];

             case 2:
              _a.sent();
              controller.ui.hideModel();
              _a.label = 3;

             case 3:
              return [ 2 ];
            }
          });
        });
      };
      SlotController3.prototype.loadItemRes = function() {
        var _this = this;
        var dataSkeleton = this.resourceController.skeletonList["item_spine"];
        Object.keys(this.listItemSkeleton).forEach(function(id) {
          var item = new Item_1.default();
          item.setInfo(id, null, dataSkeleton);
          _this._listItemData.push(item);
        });
      };
      SlotController3.prototype.playBonus = function(_a) {
        var c = _a.c, w = _a.w, arr = _a.arr;
        return __awaiter(this, void 0, void 0, function() {
          var canvas, miniGameNode, miniGameController;
          return __generator(this, function(_b) {
            switch (_b.label) {
             case 0:
              canvas = cc.find("Canvas");
              miniGameNode = cc.instantiate(this.miniGamePrefab);
              miniGameController = miniGameNode.getComponent("MinigameController3");
              miniGameController._slotController = this;
              miniGameNode.x = cc.winSize.width;
              miniGameNode.opacity = 0;
              miniGameNode.zIndex = define.zIndex.MINIGAME;
              miniGameNode.parent = canvas;
              return [ 4, miniGameController.startMiniGame(c, w, arr) ];

             case 1:
              _b.sent();
              return [ 4, util.game.delay(1500) ];

             case 2:
              _b.sent();
              miniGameNode.parent = void 0;
              this.bonusNode = miniGameNode;
              this.checkShowBonusDialog();
              return [ 2 ];
            }
          });
        });
      };
      SlotController3.prototype.handleBonus = function(dataSpin) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              controller.ui.showModel();
              return [ 4, this.playBonus(dataSpin.spinResult.score.sum[2]) ];

             case 1:
              _a.sent();
              controller.ui.hideModel();
              return [ 2 ];
            }
          });
        });
      };
      __decorate([ property(cc.Prefab) ], SlotController3.prototype, "miniGamePrefab", void 0);
      __decorate([ property(ResourceController3_1.default) ], SlotController3.prototype, "resourceController", void 0);
      SlotController3 = __decorate([ ccclass ], SlotController3);
      return SlotController3;
    }(SlotController_1.default);
    exports.default = SlotController3;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/Item": "Item",
    "../../../scripts/Slots/SlotController": "SlotController",
    "./ResourceController3": "ResourceController3"
  } ],
  SlotController4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7a7534/6fZKq6oRk2EwSkCp", "SlotController4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController4_1 = require("./ResourceController4");
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var AtributeStatic_1 = require("./AtributeStatic");
    var CoinLabel_1 = require("../../../scripts/Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController4 = function(_super) {
      __extends(SlotController4, _super);
      function SlotController4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.minigamePrefab = null;
        _this.betNode = null;
        _this.itemsContainer = null;
        _this.activeBet = null;
        _this.lockBet = null;
        _this.tableGold = null;
        _this.resourceController = null;
        _this.grandLabel = null;
        _this.majorLabel = null;
        _this.miniLabel = null;
        _this.minorLabel = null;
        _this._listItemSelectData = [];
        _this._listItemSelectImg = [];
        _this._betValue = 0;
        _this.betLevels = [];
        _this.idEventBet = "";
        _this.jackpots = [];
        _this.baseJP = [];
        _this._listGoldItem = [];
        _this.coinGrand = null;
        _this.coinMajor = null;
        _this.coinMinor = null;
        _this.coinMini = null;
        _this.betId = 4;
        _this.isSelect = false;
        _this.listJP = [];
        return _this;
      }
      SlotController4.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _super.prototype.startSlot.call(this);
              this.coinGrand = new CoinLabel_1.default(this.grandLabel.getComponent(cc.Label), 9);
              this.coinMajor = new CoinLabel_1.default(this.majorLabel.getComponent(cc.Label), 9);
              this.coinMinor = new CoinLabel_1.default(this.minorLabel.getComponent(cc.Label), 9);
              this.coinMini = new CoinLabel_1.default(this.miniLabel.getComponent(cc.Label), 9);
              this.getLableJackpot(this.currentBet, this.jackpots);
              this.getListItemGold();
              this.updateActiveGold(this.dataStatus.lastBet);
              if (!this.dataStatus.bonus) return [ 3, 2 ];
              this.bonus = true;
              game.log("you get a bonus");
              return [ 4, this.playBonus(this.dataStatus.bonus) ];

             case 1:
              _a.sent();
              return [ 3, 5 ];

             case 2:
              if (!(this.dataStatus.freeSpin.c > 0)) return [ 3, 3 ];
              this.betNode.active = false;
              return [ 3, 5 ];

             case 3:
              return [ 4, this.showActiveBetNode(true) ];

             case 4:
              _a.sent();
              _a.label = 5;

             case 5:
              return [ 2 ];
            }
          });
        });
      };
      SlotController4.prototype.showBet = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              controller.ui.lockBar();
              if (!(this.dataStatus.freeSpin.c > 0)) return [ 3, 1 ];
              this.activeBet.active = false;
              this.lockBet.active = true;
              this.betNode.active = false;
              return [ 3, 3 ];

             case 1:
              return [ 4, util.game.delay(400) ];

             case 2:
              _a.sent();
              this.showActiveBetNode(true);
              _a.label = 3;

             case 3:
              return [ 2 ];
            }
          });
        });
      };
      SlotController4.prototype.showActiveBetNode = function(activeNode) {
        var _this = this;
        !activeNode ? controller.ui.unlockBar() : controller.ui.lockBar();
        this.betNode.opacity = 0;
        this.betNode.active = activeNode;
        this.betNode.runAction(cc.sequence([ cc.scaleTo(0, .1), cc.callFunc(function() {
          _this.betNode.opacity = 255;
        }), cc.scaleTo(.3, 1) ]));
      };
      SlotController4.prototype.getBetId = function(e, data) {
        var _this = this;
        this.betId = data;
        AtributeStatic_1.default.idBetSelect = this.betId.toString();
        this.itemsContainer.children[data].children[1].addComponent(cc.Sprite);
        this.itemsContainer.children[data].children[1].getComponent(cc.Sprite).spriteFrame = this.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.spriteListName.borderBet[0].split("/").pop();
        });
        this.itemsContainer.children[data].children[1].active = true;
        this.itemsContainer.children.forEach(function(item, index) {
          index != data && (item.children[1].active = false);
        });
        this.isSelect = true;
        setTimeout(function() {
          return _this.betNode.runAction(cc.sequence([ cc.scaleTo(.2, .1), cc.callFunc(function() {
            _this.betNode.active = false;
            _this.itemsContainer.children[data].children[1].active = false;
          }) ]));
        }, 500);
        this.activeBet.active = true;
        this.lockBet.active = false;
        controller.ui.unlockBar();
        this.getCurrentBet(data);
        this.showActiveGoldItem();
        this.updateActiveGold(this.betLevels[data]);
      };
      SlotController4.prototype.getListItemGold = function() {
        this._listGoldItem = this.tableGold.children;
      };
      SlotController4.prototype.showActiveGoldItem = function() {
        switch (this.betId) {
         case 0:
          this._listGoldItem.forEach(function(item, index) {
            item.name < "05" ? item.opacity = 128 : item.opacity = 255;
          });
          break;

         case 1:
          this._listGoldItem.forEach(function(item) {
            item.name < "04" ? item.opacity = 128 : item.opacity = 255;
          });
          break;

         case 2:
          this._listGoldItem.forEach(function(item) {
            item.name < "03" ? item.opacity = 128 : item.opacity = 255;
          });
          break;

         case 3:
          this._listGoldItem.forEach(function(item) {
            item.name < "02" ? item.opacity = 128 : item.opacity = 255;
          });
          break;

         case 4:
          this._listGoldItem.forEach(function(item) {
            item.opacity = 255;
          });
          break;

         default:
          this._listGoldItem.forEach(function(item) {
            item.opacity = 255;
          });
          game.log("default");
          return;
        }
      };
      SlotController4.prototype.playBonus = function(dataBonus) {
        return __awaiter(this, void 0, void 0, function() {
          var canvas, miniNode, miniControllers;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              AtributeStatic_1.default.idJackpot = dataBonus[dataBonus.length - 1];
              canvas = cc.find("Canvas");
              miniNode = cc.instantiate(this.minigamePrefab);
              miniControllers = miniNode.getComponent("MinigameController4");
              miniControllers._slotController = this;
              miniNode.x = cc.winSize.width;
              miniNode.opacity = 0;
              miniNode.zIndex = define.zIndex.MINIGAME;
              miniNode.parent = canvas;
              return [ 4, miniControllers.startMiniGame(dataBonus, this.grandLabel, this.majorLabel, this.minorLabel, this.miniLabel) ];

             case 1:
              _a.sent();
              miniNode.parent = void 0;
              this.bonusNode = miniNode;
              this.checkShowBonusDialog();
              return [ 2 ];
            }
          });
        });
      };
      SlotController4.prototype.loadBorderRes = function() {
        var _this = this;
        var listBorderImg = this.resourceController.getListItemBorder();
        listBorderImg.forEach(function(res) {
          var item = {
            id: res.id,
            img: res.img
          };
          _this._listBorderImg.push(item);
        });
      };
      SlotController4.prototype.importData = function() {
        this.betArray = this.dataStatus.betArr;
        this.betLevels = this.dataStatus.betLevels;
        this.jackpots = this.dataStatus.jackpots;
        this.currentBet = this.dataStatus.lastBet;
        this.baseJP = this.dataStatus.baseJP;
        this.bonus = this.dataStatus.bonus;
        view.bar.bottom.gameBar.updateInfo();
      };
      SlotController4.prototype.updateJackpot = function(baseJackpot, bet, jp) {
        var str = baseJackpot * bet + jp;
        return str;
      };
      SlotController4.prototype.getLableJackpot = function(bet, JP) {
        this.listJP = [ this.updateJackpot(this.baseJP[0], bet, JP[0]), this.updateJackpot(this.baseJP[1], bet, JP[1]), this.updateJackpot(this.baseJP[2], bet, JP[2]), this.updateJackpot(this.baseJP[3], bet, JP[3]) ];
        this.grandLabel.string = util.string.formatMoney(this.listJP[0]);
        this.majorLabel.string = util.string.formatMoney(this.listJP[1]);
        this.minorLabel.string = util.string.formatMoney(this.listJP[2]);
        this.miniLabel.string = util.string.formatMoney(this.listJP[3]);
        this.coinGrand.updateUserBalance(this.listJP[0]);
        this.coinMajor.updateUserBalance(this.listJP[1]);
        this.coinMinor.updateUserBalance(this.listJP[2]);
        this.coinMini.updateUserBalance(this.listJP[3]);
      };
      SlotController4.prototype.updateActiveGold = function(bet) {
        var atri = new AtributeStatic_1.default();
        bet >= this.betLevels[4] ? this.betId = 4 : bet >= this.betLevels[3] ? this.betId = 3 : bet >= this.betLevels[2] ? this.betId = 2 : bet >= this.betLevels[1] ? this.betId = 1 : this.betId = 0;
        this.showActiveGoldItem();
        view.bar.bottom.gameBar.updateInfo();
      };
      SlotController4.prototype.getCurrentBet = function(idBet) {
        var bet = this.betLevels[idBet];
        this.updateCurrentBet(bet);
        view.bar.bottom.gameBar.updateInfo();
      };
      SlotController4.prototype.updateCurrentBet = function(bet) {
        this.currentBet = bet;
        this.updateActiveGold(bet);
        this.getLableJackpot(bet, this.jackpots);
      };
      SlotController4.prototype.watchEvent = function(data) {
        this.lockBet.active = true;
        this.activeBet.active = false;
        data.spinResult.score.reward > 0 && (data.spinResult.score.sum[1].c = 1);
        switch (data.type) {
         case api.key.SLOT_SPIN:
          "string" === typeof data.spinResult.mat && (data.spinResult.mat = [ data.spinResult.mat ]);
          this.dataSpin = data;
          this.isReceivedData = true;
          this.reelController.forEach(function(reel, index) {
            reel._listItem.forEach(function(item) {
              item.forEach(function(item) {
                item.getComponent("SlotItem").setMatrixEnd(data.spinResult.mat[index].split(","));
              });
            });
          });
          this.isSpin || this.spin(data);
          this.lastWin = data.spinResult.score.reward;
          this.getLableJackpot(this.currentBet, this.dataSpin.features.jackpots);
        }
        this.updateStatus(data);
      };
      SlotController4.prototype.handleBonus = function(data) {
        this.playBonus(data.spinResult.score.sum[2].arr);
      };
      SlotController4.prototype.handleCollectCoin = function(dataSpin) {
        if (!(dataSpin.freeSpin.c > 0)) {
          this.activeBet.active = true;
          this.lockBet.active = false;
        }
      };
      SlotController4.prototype.hideContent = function() {
        if (true == this.betNode.active) {
          this.betNode.active = false;
          this.isSelect = false;
        }
      };
      SlotController4.prototype.showContent = function() {
        var _this = this;
        this.betNode.active = !this.isSelect;
        true == this.betNode.active && this.betNode.runAction(cc.sequence([ cc.scaleTo(0, .1), cc.callFunc(function() {
          _this.betNode.opacity = 255;
        }), cc.scaleTo(.3, 1) ]));
      };
      __decorate([ property(cc.Prefab) ], SlotController4.prototype, "minigamePrefab", void 0);
      __decorate([ property(cc.Node) ], SlotController4.prototype, "betNode", void 0);
      __decorate([ property(cc.Node) ], SlotController4.prototype, "itemsContainer", void 0);
      __decorate([ property(cc.Node) ], SlotController4.prototype, "activeBet", void 0);
      __decorate([ property(cc.Node) ], SlotController4.prototype, "lockBet", void 0);
      __decorate([ property(cc.Node) ], SlotController4.prototype, "tableGold", void 0);
      __decorate([ property(ResourceController4_1.default) ], SlotController4.prototype, "resourceController", void 0);
      __decorate([ property(cc.Label) ], SlotController4.prototype, "grandLabel", void 0);
      __decorate([ property(cc.Label) ], SlotController4.prototype, "majorLabel", void 0);
      __decorate([ property(cc.Label) ], SlotController4.prototype, "miniLabel", void 0);
      __decorate([ property(cc.Label) ], SlotController4.prototype, "minorLabel", void 0);
      SlotController4 = __decorate([ ccclass ], SlotController4);
      return SlotController4;
    }(SlotController_1.default);
    exports.default = SlotController4;
    cc._RF.pop();
  }, {
    "../../../scripts/Components/CoinLabel": "CoinLabel",
    "../../../scripts/Slots/SlotController": "SlotController",
    "./AtributeStatic": "AtributeStatic",
    "./ResourceController4": "ResourceController4"
  } ],
  SlotController5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "eaf93LzNJxMZpSfPcUbAmxZ", "SlotController5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var ResourceController5_1 = require("./ResourceController5");
    var SlotController5 = function(_super) {
      __extends(SlotController5, _super);
      function SlotController5() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.miniGamePrefab = null;
        _this.resourceController = null;
        return _this;
      }
      SlotController5.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, _super.prototype.startSlot.call(this) ];

             case 1:
              _a.sent();
              if (!this.dataStatus.bonus) return [ 3, 4 ];
              if (!this.dataStatus.bonus.arr) return [ 3, 4 ];
              this.bonus = true;
              controller.ui.showModel();
              return [ 4, util.game.delay(500) ];

             case 2:
              _a.sent();
              game.log("start load bonus");
              return [ 4, this.playBonus(this.dataStatus.bonus.arr, this.dataStatus.lastBet) ];

             case 3:
              _a.sent();
              controller.ui.hideModel();
              _a.label = 4;

             case 4:
              return [ 2 ];
            }
          });
        });
      };
      SlotController5.prototype.loadBorderRes = function() {
        var _this = this;
        var listBorderImg = this.resourceController.getListItemBorder();
        listBorderImg.forEach(function(res) {
          var item = {
            id: res.id,
            img: res.img
          };
          _this._listBorderImg.push(item);
        });
      };
      SlotController5.prototype.playBonus = function(bonusArr, lastBet) {
        return __awaiter(this, void 0, void 0, function() {
          var canvas, miniGameNode, miniGameController;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              canvas = cc.find("Canvas");
              miniGameNode = cc.instantiate(this.miniGamePrefab);
              miniGameController = miniGameNode.getComponent("MinigameController5");
              miniGameController._slotController = this;
              miniGameNode.x = cc.winSize.width;
              miniGameNode.opacity = 0;
              miniGameNode.zIndex = define.zIndex.MINIGAME;
              miniGameNode.parent = canvas;
              return [ 4, miniGameController.startMiniGame(bonusArr, lastBet) ];

             case 1:
              _a.sent();
              miniGameNode.parent = void 0;
              this.bonusNode = miniGameNode;
              this.checkShowBonusDialog();
              return [ 2 ];
            }
          });
        });
      };
      SlotController5.prototype.handleBonus = function(dataSpin) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              controller.ui.showModel();
              return [ 4, this.playBonus(dataSpin.spinResult.score.sum[2].arr, dataSpin.spinResult.totalBet) ];

             case 1:
              _a.sent();
              controller.ui.hideModel();
              return [ 2 ];
            }
          });
        });
      };
      __decorate([ property(cc.Prefab) ], SlotController5.prototype, "miniGamePrefab", void 0);
      __decorate([ property(ResourceController5_1.default) ], SlotController5.prototype, "resourceController", void 0);
      SlotController5 = __decorate([ ccclass ], SlotController5);
      return SlotController5;
    }(SlotController_1.default);
    exports.default = SlotController5;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotController": "SlotController",
    "./ResourceController5": "ResourceController5"
  } ],
  SlotController6: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2e376b7L2JH7KulVgAzoW8a", "SlotController6");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var ResourceController6_1 = require("./ResourceController6");
    var MinigameController6_1 = require("./Minigame/MinigameController6");
    var LinesController_1 = require("../../../scripts/Slots/LinesController");
    var Item_1 = require("../../../scripts/Slots/Item");
    var SlotController6 = function(_super) {
      __extends(SlotController6, _super);
      function SlotController6() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.miniGamePrefab = null;
        _this.resourceController = null;
        _this.denLong = null;
        _this.originalBackground = null;
        _this.bonusBackground = null;
        _this.listItemSkeleton = {
          b: "bonus",
          w: "wild",
          0: "ngocboi",
          1: "tuitien",
          2: "binhruou",
          3: "caitrong",
          4: "ngocbua",
          5: "khobau",
          6: "a",
          7: "k",
          8: "q",
          9: "j"
        };
        return _this;
      }
      SlotController6.prototype.startSlot = function(again) {
        var _this = this;
        if (again) {
          this.tableView.children.forEach(function(item) {
            if ("LinesController" == item.name) return;
            item.destroy();
          });
          setTimeout(function() {
            _super.prototype.startSlot.call(_this);
          }, 0);
          return;
        }
        if (this.dataStatus.freeReelGame && !this.dataStatus.freeReelGame.userSpined) {
          this.bonus = true;
          this.playBonus(this.dataStatus.freeReelGame.gameCount, this.dataStatus.freeReelGame.stickyWildReels, this.dataStatus.freeReelGame.extraSpin);
        }
        this.originalBackground = this.resourceController.spriteList.find(function(item) {
          return "bg_game_02" == item.name;
        });
        this.bonusBackground = this.resourceController.spriteList.find(function(item) {
          return "bonus_game_bg" == item.name;
        });
        _super.prototype.startSlot.call(this);
      };
      SlotController6.prototype.loadItemRes = function() {
        var _this = this;
        var dataSkeleton = this.resourceController.skeletonList["item_spine"];
        Object.keys(this.listItemSkeleton).forEach(function(id) {
          var item = new Item_1.default();
          item.setInfo(id, null, dataSkeleton);
          _this._listItemData.push(item);
        });
      };
      SlotController6.prototype.initState = function() {
        var _this = this;
        _super.prototype.initState.call(this);
        if (this.dataStatus.freeSpin.c > 0 && this.dataStatus.freeReelGame.userSpined) {
          game.log("init reel");
          this.initReel(this.dataStatus.freeReelGame.gameCount);
        }
        this.reelController.forEach(function(item) {
          return item.linesController.init(_this);
        });
      };
      SlotController6.prototype.initReel = function(reelAmount) {
        var _this = this;
        void 0 === reelAmount && (reelAmount = 1);
        this.reelController = Array(reelAmount).fill(0).map(function(item, index) {
          var tableView;
          var linesController;
          if (index > 0) {
            var tableViewParent = cc.instantiate(_this.tableView.parent);
            tableViewParent.parent = _this.tableView.parent.parent;
            tableView = tableViewParent.getChildByName("table-view");
            if (tableView.children.length) {
              linesController = tableView.getComponentInChildren(LinesController_1.default);
              linesController.node.parent = tableView;
            } else {
              var linesControllerNode = new cc.Node("LinesController");
              linesControllerNode.parent = tableView;
              linesController = linesControllerNode.addComponent(LinesController_1.default);
            }
            linesController.tableView = tableView;
          } else {
            tableView = _this.tableView;
            linesController = _this.node.getComponentInChildren(LinesController_1.default);
          }
          if (reelAmount > 1) {
            var background = _this.reelController[0].tableView.parent.getChildByName("slot-background");
            background.getComponent(cc.Sprite).spriteFrame = _this.bonusBackground;
            background.y = 10;
            _this.denLong.active = false;
          }
          return {
            tableView: tableView,
            linesController: linesController
          };
        });
        switch (reelAmount) {
         case 1:
          this.reelController[0].tableView.parent.scale = 1;
          this.reelController[0].tableView.parent.setPosition(0, 15);
          break;

         case 2:
          this.reelController.forEach(function(item) {
            return item.tableView.parent.scale = .55;
          });
          this.reelController[0].tableView.parent.setPosition(-250, 10);
          this.reelController[1].tableView.parent.setPosition(250, 10);
          break;

         case 3:
          this.reelController.forEach(function(item) {
            return item.tableView.parent.scale = .43;
          });
          this.reelController[0].tableView.parent.setPosition(0, 130);
          this.reelController[1].tableView.parent.setPosition(-200, -135);
          this.reelController[2].tableView.parent.setPosition(200, -135);
          break;

         case 4:
          this.reelController.forEach(function(item) {
            return item.tableView.parent.scale = .41;
          });
          this.reelController[0].tableView.parent.setPosition(-190, 140);
          this.reelController[1].tableView.parent.setPosition(190, 140);
          this.reelController[2].tableView.parent.setPosition(-190, -135);
          this.reelController[3].tableView.parent.setPosition(190, -135);
        }
      };
      SlotController6.prototype.deleteSubReels = function() {
        this.reelController.forEach(function(item, index) {
          if (0 == index) return;
          item.tableView.parent.destroy();
          item.linesController.destroy();
        });
        this.reelController = [ this.reelController[0] ];
        this.reelController[0].tableView.parent.scale = 1;
        this.reelController[0].tableView.parent.setPosition(0, 0);
        var background = this.reelController[0].tableView.parent.getChildByName("slot-background");
        background.getComponent(cc.Sprite).spriteFrame = this.originalBackground;
        background.y = 0;
        this.denLong.active = true;
        this.dataStatus.freeSpin = null;
      };
      SlotController6.prototype.playBonus = function(gameCount, stickyWildReels, extraSpin) {
        var canvas = cc.find("Canvas");
        var miniGameNode = cc.instantiate(this.miniGamePrefab);
        var miniGameController = miniGameNode.getComponent(MinigameController6_1.default);
        miniGameController._slotController = this;
        miniGameNode.x = cc.winSize.width;
        miniGameNode.opacity = 0;
        miniGameNode.zIndex = define.zIndex.MINIGAME;
        miniGameNode.parent = canvas;
        miniGameController.startMinigame(gameCount, stickyWildReels, extraSpin);
        miniGameNode.parent = void 0;
        this.bonusNode = miniGameNode;
        this.checkShowBonusDialog(function() {
          miniGameController.setPosition();
        });
      };
      SlotController6.prototype.handleBonus = function(_a) {
        var freeReelGame = _a.features.freeReelGame;
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_b) {
            switch (_b.label) {
             case 0:
              controller.ui.showModel();
              return [ 4, this.playBonus(freeReelGame.gameCount, freeReelGame.stickyWildReels, freeReelGame.extraSpin) ];

             case 1:
              _b.sent();
              controller.ui.hideModel();
              this.isSpin = false;
              return [ 2 ];
            }
          });
        });
      };
      SlotController6.prototype.handleFreeSpin = function(dataSpin) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, _super.prototype.handleFreeSpin.call(this, dataSpin) ];

             case 1:
              _a.sent();
              (!dataSpin.freeSpin || dataSpin.freeSpin.c < 1) && this.deleteSubReels();
              return [ 2 ];
            }
          });
        });
      };
      SlotController6.prototype.watchEvent = function(data) {
        data.features.freeReelGame && data.features.freeReelGame.userSpined && (data.spinResult.mat = data.features.freeReelGameResult.map(function(item) {
          return item.matstr;
        }));
        _super.prototype.watchEvent.call(this, data);
      };
      __decorate([ property(cc.Prefab) ], SlotController6.prototype, "miniGamePrefab", void 0);
      __decorate([ property(ResourceController6_1.default) ], SlotController6.prototype, "resourceController", void 0);
      __decorate([ property(cc.Node) ], SlotController6.prototype, "denLong", void 0);
      SlotController6 = __decorate([ ccclass ], SlotController6);
      return SlotController6;
    }(SlotController_1.default);
    exports.default = SlotController6;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/Item": "Item",
    "../../../scripts/Slots/LinesController": "LinesController",
    "../../../scripts/Slots/SlotController": "SlotController",
    "./Minigame/MinigameController6": "MinigameController6",
    "./ResourceController6": "ResourceController6"
  } ],
  SlotController7: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ffc09fygINLyIuWrcreDebd", "SlotController7");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var ResourceController7_1 = require("./ResourceController7");
    var CoinLabel_1 = require("../../../scripts/Components/CoinLabel");
    var Item_1 = require("../../../scripts/Slots/Item");
    var SlotController7 = function(_super) {
      __extends(SlotController7, _super);
      function SlotController7() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.miniGamePrefab = null;
        _this.resourceController = null;
        _this.lbReward = [];
        _this.review = null;
        _this.activeReel = null;
        _this.reelsColor = null;
        _this.overlay = null;
        _this.reel = null;
        _this.Lockreels = null;
        _this.rewardWin = null;
        _this._listItem = [];
        _this.reels = 5;
        _this.reward = [ [ 12, 18, 50, 250 ], [ 8, 12, 30, 160 ], [ 6, 9, 25, 125 ], [ 4, 6, 15, 80 ], [ 3, 5, 12, 60 ] ];
        _this.totalB = 0;
        _this.listItemSkeleton = {
          k: "caikhien",
          s: "trungchim",
          w: "longchim",
          0: "thanhkiem",
          1: "conheongu",
          2: "chimmaudo",
          3: "khoibang",
          4: "conheongoc",
          5: "nine",
          6: "ten",
          7: "j",
          8: "q",
          9: "k",
          10: "a"
        };
        return _this;
      }
      SlotController7.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _a;
          return __generator(this, function(_b) {
            switch (_b.label) {
             case 0:
              _super.prototype.startSlot.call(this);
              localStorage.getItem("review") ? localStorage.setItem("review", "" + (parseInt(localStorage.getItem("review")) + 1)) : localStorage.setItem("review", "1");
              if (!(parseInt(localStorage.getItem("review")) < 4)) return [ 3, 2 ];
              return [ 4, this.showReview() ];

             case 1:
              _a = _b.sent();
              return [ 3, 4 ];

             case 2:
              return [ 4, this.showActiveReel() ];

             case 3:
              _a = _b.sent();
              _b.label = 4;

             case 4:
              _a;
              this.dataStatus.lastReels > 0 && this.activeSpriteFrame(this.dataStatus.lastReels);
              if (!this.dataStatus.bonus) return [ 3, 7 ];
              this.bonus = true;
              controller.ui.showModel();
              return [ 4, util.game.delay(200) ];

             case 5:
              _b.sent();
              game.log("start load bonus");
              return [ 4, this.playBonus(this.dataStatus.bonus) ];

             case 6:
              _b.sent();
              controller.ui.hideModel();
              _b.label = 7;

             case 7:
              this.rewardFormat();
              return [ 4, util.game.delay(400) ];

             case 8:
              _b.sent();
              return [ 2 ];
            }
          });
        });
      };
      SlotController7.prototype.showReview = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!(this.dataStatus.freeSpin.c > 0)) return [ 3, 1 ];
              this.reel.active = false;
              this.Lockreels.active = true;
              return [ 3, 3 ];

             case 1:
              view.bar.bottom.lock();
              return [ 4, util.game.delay(400) ];

             case 2:
              _a.sent();
              this.overlay.active = true;
              this.review.opacity = 0;
              this.review.active = true;
              if (!this || !this.overlay || !this.review) return [ 2 ];
              this.review.runAction(cc.sequence([ cc.scaleTo(0, .1), cc.callFunc(function() {
                return _this.review.opacity = 255;
              }), cc.scaleTo(.3, 1), cc.callFunc(function() {
                setTimeout(function() {
                  if (!view.screen.slot || !_this.review) return;
                  _this.review.runAction(cc.sequence([ cc.fadeOut(.2), cc.callFunc(function() {
                    _this.review.active = false;
                    _this.overlay.active = false;
                    _this.showActiveReel();
                  }) ]));
                }, 4e3);
              }) ]));
              _a.label = 3;

             case 3:
              return [ 2 ];
            }
          });
        });
      };
      SlotController7.prototype.loadItemRes = function() {
        var _this = this;
        var dataSkeleton = this.resourceController.skeletonList["item_spine"];
        Object.keys(this.listItemSkeleton).forEach(function(id) {
          var item = new Item_1.default();
          item.setInfo(id, null, dataSkeleton);
          _this._listItemData.push(item);
        });
      };
      SlotController7.prototype.watchEvent = function(data) {
        this.reel.active = false;
        this.Lockreels.active = true;
        if (data.freeSpin.c >= 0 && data.freeSpin.b > 0) {
          data.spinResult.newMat = data.spinResult.mat;
          data.spinResult.mat = data.features.oldMat;
        }
        _super.prototype.watchEvent.call(this, data);
      };
      SlotController7.prototype.listItemFormat = function() {
        var _this = this;
        this._listItem = [ [], [], [], [], [] ];
        this.reelController.forEach(function(item) {
          item._listItem.forEach(function(item) {
            for (var i = 0; i < 5; i++) _this._listItem[i].push(item[i]);
          });
        });
      };
      SlotController7.prototype.showActiveReel = function() {
        var _this = this;
        view.bar.bottom.lock();
        this.overlay.active = true;
        this.activeReel.opacity = 0;
        this.activeReel.active = true;
        this.activeReel.runAction(cc.sequence([ cc.scaleTo(0, .1), cc.callFunc(function() {
          return _this.activeReel.opacity = 255;
        }), cc.scaleTo(.3, 1) ]));
      };
      SlotController7.prototype.activeColumn = function(e, data) {
        var _this = this;
        this.reels = data;
        game.log("Sent " + this.reels);
        this.activeReel.runAction(cc.sequence([ cc.scaleTo(.2, .1), cc.callFunc(function() {
          return _this.activeReel.active = false;
        }) ]));
        this.activeSpriteFrame(data);
        view.bar.bottom.unlock();
        this.overlay.active = false;
      };
      SlotController7.prototype.activeSpriteFrame = function(reels) {
        var _this = this;
        this.reelsColor.getComponent(cc.Sprite).spriteFrame = this.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.spriteListName.reelColor[reels].split("/").pop();
        });
        this.reel.children[0].getComponent(cc.Sprite).spriteFrame = this.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.spriteListName.activeReels[reels].split("/").pop();
        });
        this.Lockreels.children[0].getComponent(cc.Sprite).spriteFrame = this.resourceController.spriteList.find(function(item) {
          return item.name == _this.resourceController.spriteListName.lockReels[reels].split("/").pop();
        });
        this.rewardFormat();
      };
      SlotController7.prototype.spin = function(data) {
        if (this.currentBet > game.user.balance) {
          this.autoSpinTimes = 0;
          game.log("User do not have enough coin to spin ...");
          return;
        }
        this.isSpin = true;
        this.isReceivedData = !!data;
        data || api.sendGD({
          e: api.key.SLOT_SPIN,
          gtype: this.gameId,
          totalbet: this.currentBet,
          choosedReels: this.reels
        }, function(err, res) {
          game.log("callback", res);
        });
        this.listItemFormat();
        this.timeManager();
        this.activeColumn(void 0, this.reels);
      };
      SlotController7.prototype.playBonus = function(c) {
        return __awaiter(this, void 0, void 0, function() {
          var canvas, miniGameNode, miniGameController;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              canvas = cc.find("Canvas");
              miniGameNode = cc.instantiate(this.miniGamePrefab);
              miniGameController = miniGameNode.getComponent("MinigameController7");
              miniGameController._slotController = this;
              miniGameNode.x = cc.winSize.width;
              miniGameNode.opacity = 0;
              miniGameNode.zIndex = define.zIndex.MINIGAME;
              miniGameNode.parent = canvas;
              return [ 4, miniGameController.startMiniGame(c) ];

             case 1:
              _a.sent();
              miniGameNode.zIndex = 3;
              miniGameNode.parent = void 0;
              this.bonusNode = miniGameNode;
              this.checkShowBonusDialog();
              return [ 2 ];
            }
          });
        });
      };
      SlotController7.prototype.updateCurrentBet = function(bet) {
        this.totalB = bet;
        this.rewardFormat();
        _super.prototype.updateCurrentBet.call(this, bet);
      };
      SlotController7.prototype.rewardFormat = function() {
        var _this = this;
        0 == this.totalB && (this.totalB = this.dataStatus.lastBet);
        this.lbReward.forEach(function(item, index) {
          item.string = util.string.formatMoney(_this.reward[_this.reels - 1][index] * _this.totalB);
        });
      };
      SlotController7.prototype.handleBonus = function(data) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              controller.ui.showModel();
              return [ 4, this.playBonus(data.spinResult.score.sum[2]) ];

             case 1:
              _a.sent();
              controller.ui.hideModel();
              return [ 2 ];
            }
          });
        });
      };
      SlotController7.prototype.handleCollectCoin = function(dataSpin) {
        if (!(dataSpin.freeSpin.c > 0)) {
          this.reel.active = true;
          this.Lockreels.active = false;
        }
      };
      SlotController7.prototype.totalWin = function() {
        return __awaiter(this, void 0, void 0, function() {
          var arrReward, checkReward;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              arrReward = [];
              checkReward = this.dataSpin.spinResult.score.sum[6].arr;
              checkReward.forEach(function(elem) {
                "string" != typeof elem.value || "SUPPER" == elem.value || "WHEEL" == elem.value || true != elem.valid || arrReward.push(elem);
              });
              this.dataSpin.spinResult.score.sum[0].w > 0 && arrReward.unshift({
                value: "MEGA",
                valid: true
              });
              arrReward.forEach(function(item, index) {
                return setTimeout(function() {
                  if (!view.screen.slot || !item) return;
                  _this.showJackpots(item, arrReward.length);
                }, 4500 * index);
              });
              return [ 4, util.game.delay(4500 * arrReward.length) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      SlotController7.prototype.showJackpots = function(rew, arr) {
        return __awaiter(this, void 0, void 0, function() {
          var bonus, color, indexBonus;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, util.game.delay(2e3) ];

             case 1:
              _a.sent();
              bonus = [ "MINI", "MINOR", "MAJOR", "MEGA" ];
              color = {
                0: [ 253, 168, 83 ],
                1: [ 102, 208, 38 ],
                2: [ 57, 189, 252 ],
                3: [ 241, 57, 111 ]
              };
              indexBonus = bonus.indexOf(rew.value);
              if (bonus.includes(rew.value)) {
                if (!bonus || !rew) return [ 2 ];
                this.rewardWin.opacity = 0;
                this.overlay.active = true;
                this.rewardWin.active = true;
                if (!view.screen.slot || !this.rewardWin || !this) return [ 2 ];
                this.rewardWin.runAction(cc.sequence([ cc.scaleTo(0, .1), cc.callFunc(function() {
                  _this.rewardWin.children[0].color = cc.color(color[indexBonus][0], color[indexBonus][1], color[indexBonus][2]);
                  _this.rewardWin.children[2].getComponent(cc.Sprite).spriteFrame = _this.resourceController.spriteList.find(function(item) {
                    return item.name == _this.resourceController.spriteListName.reward[rew.value].split("/").pop();
                  });
                  _this.coinController = new CoinLabel_1.default(_this.rewardWin.children[3].getComponent(cc.Label), 8);
                  _this.rewardWin.children[3].addComponent(cc.LabelOutline);
                  _this.coinController.updateUserBalance(_this.reward[_this.reels - 1][indexBonus] * _this.totalB);
                  setTimeout(function() {
                    if (!view.screen.slot) return;
                    _this.rewardWin.active = false;
                    _this.overlay.active = false;
                  }, 4e3);
                }), cc.callFunc(function() {
                  _this.rewardWin.opacity = 255;
                }), cc.scaleTo(.3, 1.1), cc.scaleTo(.1, 1) ]));
              }
              return [ 2 ];
            }
          });
        });
      };
      SlotController7.prototype.hideContent = function() {
        _super.prototype.hideContent.call(this);
        view.bar.bottom.unlock();
      };
      SlotController7.prototype.showContent = function() {
        _super.prototype.showContent.call(this);
        game.log("Show content", view.screen.slot.id);
        (this.activeReel.active || this.review.active) && view.bar.bottom.lock();
      };
      __decorate([ property(cc.Prefab) ], SlotController7.prototype, "miniGamePrefab", void 0);
      __decorate([ property(ResourceController7_1.default) ], SlotController7.prototype, "resourceController", void 0);
      __decorate([ property(cc.Label) ], SlotController7.prototype, "lbReward", void 0);
      __decorate([ property(cc.Node) ], SlotController7.prototype, "review", void 0);
      __decorate([ property(cc.Node) ], SlotController7.prototype, "activeReel", void 0);
      __decorate([ property(cc.Node) ], SlotController7.prototype, "reelsColor", void 0);
      __decorate([ property(cc.Node) ], SlotController7.prototype, "overlay", void 0);
      __decorate([ property(cc.Node) ], SlotController7.prototype, "reel", void 0);
      __decorate([ property(cc.Node) ], SlotController7.prototype, "Lockreels", void 0);
      __decorate([ property(cc.Node) ], SlotController7.prototype, "rewardWin", void 0);
      SlotController7 = __decorate([ ccclass ], SlotController7);
      return SlotController7;
    }(SlotController_1.default);
    exports.default = SlotController7;
    cc._RF.pop();
  }, {
    "../../../scripts/Components/CoinLabel": "CoinLabel",
    "../../../scripts/Slots/Item": "Item",
    "../../../scripts/Slots/SlotController": "SlotController",
    "./ResourceController7": "ResourceController7"
  } ],
  SlotController8: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f8b3dAjILRFLpr6beashjl8", "SlotController8");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var ResourceController8_1 = require("./ResourceController8");
    var Item_1 = require("../../../scripts/Slots/Item");
    var SlotController8 = function(_super) {
      __extends(SlotController8, _super);
      function SlotController8() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.miniGamePrefab = null;
        _this.resourceController = null;
        _this.listItemSkeleton = {
          b: "bonus",
          s: "scatter",
          w: "wild",
          0: "somuoi",
          1: "j",
          2: "q",
          3: "k",
          4: "gieng",
          5: "noi",
          6: "bingo",
          7: "daulau"
        };
        _this.indexSlide8 = 0;
        return _this;
      }
      SlotController8.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, _super.prototype.startSlot.call(this) ];

             case 1:
              _a.sent();
              if (!this) return [ 2 ];
              if (this.dataStatus.bonus && this.dataStatus.bonus.arr) {
                this.bonus = true;
                controller.ui.showModel();
                this.playBonus(this.dataStatus.bonus.arr, this.dataStatus.bonus.w, this.dataStatus.bonus.res);
                controller.ui.hideModel();
              }
              return [ 2 ];
            }
          });
        });
      };
      SlotController8.prototype.loadItemRes = function() {
        var _this = this;
        Object.keys(this.listItemSkeleton).forEach(function(id) {
          var item = new Item_1.default();
          item.setInfo(id, null, null);
          _this._listItemData.push(item);
        });
      };
      SlotController8.prototype.playBonus = function(bonusArr, coinWin, res) {
        var canvas = cc.find("Canvas");
        var miniGameNode = cc.instantiate(this.miniGamePrefab);
        var miniGameController = miniGameNode.getComponent("MinigameController8");
        miniGameController._slotController = this;
        miniGameNode.x = cc.winSize.width;
        miniGameNode.opacity = 0;
        miniGameNode.zIndex = define.zIndex.MINIGAME;
        miniGameNode.parent = canvas;
        if (!miniGameController) return;
        miniGameController.startMiniGame(bonusArr, coinWin, res);
        miniGameNode.parent = void 0;
        this.bonusNode = miniGameNode;
        this.checkShowBonusDialog();
      };
      SlotController8.prototype.handleBonus = function(dataSpin) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this.playBonus) return [ 2 ];
              controller.ui.showModel();
              return [ 4, this.playBonus(dataSpin.spinResult.score.sum[2].arr, dataSpin.spinResult.score.sum[2].w, dataSpin.spinResult.score.sum[2].res) ];

             case 1:
              _a.sent();
              controller.ui.hideModel();
              return [ 2 ];
            }
          });
        });
      };
      __decorate([ property(cc.Prefab) ], SlotController8.prototype, "miniGamePrefab", void 0);
      __decorate([ property(ResourceController8_1.default) ], SlotController8.prototype, "resourceController", void 0);
      SlotController8 = __decorate([ ccclass ], SlotController8);
      return SlotController8;
    }(SlotController_1.default);
    exports.default = SlotController8;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/Item": "Item",
    "../../../scripts/Slots/SlotController": "SlotController",
    "./ResourceController8": "ResourceController8"
  } ],
  SlotController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8694fkUlCRAJJzy6KdYvvZS", "SlotController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Item_1 = require("./Item");
    var AnimationController_1 = require("./AnimationController");
    var SlotItem_1 = require("./SlotItem");
    var LinesController_1 = require("./LinesController");
    var DefineType_1 = require("../Define/DefineType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SoundKey;
    (function(SoundKey) {
      SoundKey[SoundKey["INTRO"] = 0] = "INTRO";
      SoundKey[SoundKey["BACKGROUND"] = 1] = "BACKGROUND";
      SoundKey[SoundKey["WIN"] = 2] = "WIN";
    })(SoundKey = exports.SoundKey || (exports.SoundKey = {}));
    var SlotController = function(_super) {
      __extends(SlotController, _super);
      function SlotController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.gameId = "";
        _this.gameSizeType = 1;
        _this.tableView = null;
        _this.itemSlot = null;
        _this.IPadScale = 1.2;
        _this.payTable = void 0;
        _this.reelController = [];
        _this._listItemData = [];
        _this._listBorderImg = [];
        _this.listItemSkeleton = {};
        _this.betArray = [];
        _this.lastWin = 0;
        _this.isAutoSpin = false;
        _this.autoSpinTimes = 0;
        _this.dataStatus = null;
        _this.isSpin = false;
        _this.isReceivedData = false;
        _this.isReFresh = false;
        _this.dataSpin = null;
        _this.freeSpin = 0;
        _this.bonus = false;
        _this.bonusNode = void 0;
        _this.statusGame = null;
        _this.spinDoneCallback = {
          status: void 0,
          winType: void 0
        };
        _this.resourceReady = false;
        return _this;
      }
      SlotController.prototype.checkResources = function() {
        this.resourceReady = this.resourceController.checkData();
        return this.resourceReady;
      };
      SlotController.prototype.downloadResources = function(downloadProgress) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, this.resourceController.startDownload(null, downloadProgress) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      SlotController.prototype.getInfoAndResource = function(downloadProgress) {
        return __awaiter(this, void 0, void 0, function() {
          var e_1;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _a.trys.push([ 0, 2, , 3 ]);
              return [ 4, Promise.all([ this.getSlotResources(), this.getStatusGame() ]) ];

             case 1:
              _a.sent();
              this.importData();
              this.loadItemRes();
              this.loadBorderRes();
              return [ 3, 3 ];

             case 2:
              e_1 = _a.sent();
              cc.log("Get data error", e_1);
              return [ 3, 3 ];

             case 3:
              return [ 2 ];
            }
          });
        });
      };
      SlotController.prototype.getSlotResources = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, this.resourceController.loadResourcesFromDisk(null, function(c, t) {
                cc.log(c + " / " + t);
              }) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      SlotController.prototype.getStatusGame = function(smid) {
        var _this = this;
        return new Promise(function(res, rej) {
          api.sendGD({
            e: api.key.SMINFO,
            gtype: smid || _this.gameId
          }, function(err, data) {
            err && rej(err);
            _this.dataStatus = data;
            _this.updateStatus(data);
            res(data);
          });
        });
      };
      SlotController.prototype.startSlot = function() {
        this.initState();
        this.initializeItem();
        this.checkFreeSpin();
      };
      SlotController.prototype.importData = function() {
        this.betArray = this.dataStatus.betArr;
        this.currentBet = this.dataStatus.lastBet;
        view.bar.bottom.gameBar.updateInfo();
      };
      SlotController.prototype.loadItemRes = function() {
        var _this = this;
        var listImgItem = this.resourceController.getlistImgItem();
        listImgItem.forEach(function(data) {
          var item = new Item_1.default();
          item.setInfo(data.id, data.img);
          _this._listItemData.push(item);
        });
      };
      SlotController.prototype.loadBorderRes = function() {};
      SlotController.prototype.loadItemSelectRes = function() {};
      SlotController.prototype.initState = function() {
        var _this = this;
        this.playSound(SoundKey.INTRO);
        this.animationController = this.node.getComponent(AnimationController_1.default);
        var realScreenSize = cc.view.getFrameSize();
        var realScreenRatio = realScreenSize.width / realScreenSize.height;
        realScreenRatio < 1.5 && (this.node.scale *= this.IPadScale);
        this.reelController = [ 0 ].map(function() {
          return {
            tableView: _this.tableView
          };
        });
        this.reelController[0].linesController = this.node.getComponentInChildren(LinesController_1.default);
        this.reelController[0].linesController.init(this);
      };
      SlotController.prototype.initializeItem = function() {
        var _this = this;
        this.gameSize = config.game.GAME_SIZE[this.gameSizeType];
        this.maxCol = this.gameSize.length;
        this.maxRow = Math.max.apply(Math, this.gameSize);
        this.reelController.forEach(function(item, index) {
          var listItem = [];
          for (var x = 0; x < _this.gameSize.length; x++) for (var y = 0; y < _this.gameSize[x] + 1; y++) {
            var item_1 = _this.getRandomItem();
            var slotItem = _this.instantiateSlotItem(item_1, x, y, index);
            listItem.push(slotItem);
          }
          item._listItem = _this.sortListItem(listItem);
        });
        window["reel"] = this.reelController;
      };
      SlotController.prototype.getRandomItem = function(option) {
        return this._listItemData[Math.floor(Math.random() * this._listItemData.length)];
      };
      SlotController.prototype.instantiateSlotItem = function(itemInfo, x, y, index) {
        void 0 === index && (index = 0);
        this.distanceItemX = this.reelController[index].tableView.width / this.maxCol;
        this.distanceItemY = this.reelController[index].tableView.height / this.maxRow;
        var item = cc.instantiate(this.itemSlot);
        item.parent = this.reelController[index].tableView;
        item.setPosition((x + .5) * this.distanceItemX, (y + .5) * this.distanceItemY);
        var component = item.getComponent(SlotItem_1.default);
        component.setItemInfo(itemInfo, x, y);
        if (this.dataStatus.lastmat) {
          component.setMatrixEnd(this.dataStatus.lastmat.split(","));
          component.setItemSprite(null);
        }
        item.active = true;
        return component;
      };
      SlotController.prototype.sortListItem = function(listItem) {
        var sortedList = [ [] ];
        var a = 3;
        var b = 4;
        if (2 == this.gameSizeType) {
          a = 4;
          b = 5;
        }
        if (3 == this.gameSizeType) {
          a = 4;
          b = 5;
        }
        listItem.forEach(function(item, i) {
          var index = a - i % b;
          sortedList[index] || (sortedList[index] = []);
          sortedList[index].push(item);
        });
        return sortedList;
      };
      SlotController.prototype.checkFreeSpin = function() {
        if (this.dataStatus.freeSpin.c > 0) {
          this.freeSpin = this.dataStatus.freeSpin.c;
          this.statusGame.freeSpin = this.freeSpin;
          view.bar.bottom.gameBar.updateStatus(this.statusGame);
          this.clickSpin();
        }
      };
      SlotController.prototype.watchEvent = function(data) {
        switch (data.type) {
         case api.key.SLOT_SPIN:
          "string" === typeof data.spinResult.mat && (data.spinResult.mat = [ data.spinResult.mat ]);
          this.dataSpin = data;
          this.isReceivedData = true;
          this.reelController.forEach(function(reel, index) {
            reel._listItem.forEach(function(item) {
              item.forEach(function(item) {
                item.getComponent("SlotItem").setMatrixEnd(data.spinResult.mat[index].split(","));
              });
            });
          });
          this.isSpin || this.spin(data);
          this.lastWin = data.spinResult.score.reward;
          this.updateStatus(data);
        }
      };
      SlotController.prototype.timeManager = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _a, dataSpin, spinResult, winType, _b, tw, b, rate, error_1;
          var _this = this;
          return __generator(this, function(_c) {
            switch (_c.label) {
             case 0:
              _c.trys.push([ 0, 24, , 25 ]);
              view.multi.loadContent();
              if (!this.isReFresh) {
                this.animationController && this.animationController.refreshSlotAnimation();
                view.bar.bottom.gameBar.resetWinAmount();
                this.isReFresh = true;
              }
              this.reelController.forEach(function(item) {
                return _this.animationController.spinItems(item._listItem);
              });
              this.playSound(SoundKey.BACKGROUND);
              if (this.freeSpin > 0) {
                this.freeSpin--;
                if (view.screen.slot && this.gameId == view.screen.slot.SlotController.gameId) {
                  this.statusGame.freeSpin = this.freeSpin;
                  view.bar.bottom.gameBar.updateStatus(this.statusGame);
                }
              }
              this.reelController.map(function(item) {
                return _this.animationController.spinItems(item._listItem);
              });
              return [ 4, util.game.delay(3e3, this.node) ];

             case 1:
              _c.sent();
              if (!(this.isReceivedData && this.dataSpin && this.dataSpin.spinResult)) return [ 3, 23 ];
              _a = this, dataSpin = _a.dataSpin, spinResult = _a.dataSpin.spinResult;
              if (!this.node || !this.handleCollectCoin) return [ 2 ];
              return [ 4, this.handleCollectCoin(dataSpin) ];

             case 2:
              _c.sent();
              if (!this.node || !this.animationController) return [ 2 ];
              return [ 4, this.animationController.setAnimationData(dataSpin) ];

             case 3:
              _c.sent();
              if (!this.node) return [ 2 ];
              if (!(this.dataSpin.spinResult.score.winType && !this.dataSpin.freeSpin.c && (define.type[this.dataSpin.spinResult.score.winType] == define.type.WIN_TYPE.BIGWIN || define.type[this.dataSpin.spinResult.score.winType] == define.type.WIN_TYPE.MEGAWIN))) return [ 3, 5 ];
              return [ 4, this.showWinType(this.dataSpin.spinResult.score.winType, this.dataSpin.spinResult.score.reward) ];

             case 4:
              _c.sent();
              _c.label = 5;

             case 5:
              this.spinDoneCallback && this.spinDoneCallback.status && this.spinDoneCallback.status();
              if (!(spinResult.score.reward > 0)) return [ 3, 7 ];
              this.playSound(SoundKey.WIN);
              this.animationController.showWinAmount();
              return [ 4, this.animationController.showAllLines() ];

             case 6:
              _c.sent();
              return [ 3, 8 ];

             case 7:
              view.bar.bottom.gameBar.resetWinAmount();
              _c.label = 8;

             case 8:
              if (!this.node) return [ 2 ];
              if (!(spinResult.score.sum[2] && (spinResult.score.sum[2].w > 0 || spinResult.score.sum[2].c > 0))) return [ 3, 10 ];
              return [ 4, util.game.delay(500, this.node) ];

             case 9:
              _c.sent();
              if (!this.node || !this.handleBonus) return [ 2 ];
              game.log("You get a bonus");
              this.bonus = true;
              this.isSpin = false;
              this.isReFresh = false;
              this.handleBonus(dataSpin);
              return [ 2 ];

             case 10:
              if (!this.node || !this.handleFreeSpin) return [ 2 ];
              return [ 4, this.handleFreeSpin(dataSpin) ];

             case 11:
              _c.sent();
              this.isSpin = false;
              this.isReFresh = false;
              if (!(this.dataSpin.freeSpin.t > 0 && 0 == this.dataSpin.freeSpin.c)) return [ 3, 13 ];
              winType = "BIGWIN";
              _b = this.dataSpin.freeSpin, tw = _b.tw, b = _b.b;
              rate = tw / b;
              rate >= 50 && (winType = "MEGAWIN");
              return [ 4, this.showWinType(winType, this.dataSpin.freeSpin.tw) ];

             case 12:
              _c.sent();
              _c.label = 13;

             case 13:
              view.multi.loadContent();
              if (!this.isAutoSpin && view.screen.slot) {
                if (dataSpin.spinResult.id != view.screen.slot.SlotController.gameId) return [ 2 ];
                view.bar.bottom.gameBar.bottomBarEvent(define.type.BottomBar.active);
                view.bar.bottom.gameBar.updateSpinFrame(define.type.SpinButton.normal);
              }
              if (!this.isAutoSpin) return [ 3, 16 ];
              if (!(this.autoSpinTimes >= 0)) return [ 3, 15 ];
              return [ 4, util.game.delay(200) ];

             case 14:
              _c.sent();
              _c.label = 15;

             case 15:
              if (0 == this.autoSpinTimes) {
                this.isAutoSpin = false;
                setTimeout(function() {
                  view.bar.bottom.gameBar.bottomBarEvent(define.type.BottomBar.active);
                  view.bar.bottom.gameBar.updateSpinFrame(define.type.SpinButton.normal);
                }, 100);
              } else {
                this.autoSpinTimes < 0 && true == this.bonus && view.bar.bottom.gameBar.updateSpinFrame(define.type.SpinButton.normal);
                this.autoSpin(this.autoSpinTimes);
              }
              _c.label = 16;

             case 16:
              if (!(0 == Object.keys(dataSpin.freeSpin).length)) return [ 3, 20 ];
              if (!(spinResult.score.sum[1].c > 0)) return [ 3, 20 ];
              _c.label = 17;

             case 17:
              if (!(!this.isSpin && !this.isAutoSpin && this.animationController)) return [ 3, 20 ];
              return [ 4, this.animationController.showEachLine() ];

             case 18:
              _c.sent();
              return [ 4, this.animationController.showAllLines(1) ];

             case 19:
              _c.sent();
              return [ 3, 17 ];

             case 20:
              if (!(dataSpin.freeSpin && dataSpin.freeSpin.c > 0)) return [ 3, 22 ];
              game.log("free spin", this.dataSpin.freeSpin);
              return [ 4, util.game.delay(200) ];

             case 21:
              _c.sent();
              this.clickSpin();
              view.bar.bottom.gameBar.bottomBarEvent(define.type.BottomBar.lock);
              view.bar.bottom.gameBar.updateSpinFrame(define.type.SpinButton.stopNormalSpin);
              _c.label = 22;

             case 22:
              return [ 3, 23 ];

             case 23:
              return [ 3, 25 ];

             case 24:
              error_1 = _c.sent();
              this.isSpin = false;
              this.isReFresh = false;
              this.isAutoSpin = false;
              game.log("Time manager error:", error_1);
              return [ 3, 25 ];

             case 25:
              return [ 2 ];
            }
          });
        });
      };
      SlotController.prototype.autoSpin = function(times) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.autoSpinTimes = times;
              if (this.isSpin) {
                this.isAutoSpin = true;
                return [ 2 ];
              }
              game.log(this.autoSpinTimes);
              this.isAutoSpin = true;
              return [ 4, this.spin() ];

             case 1:
              _a.sent();
              view.screen.slot && view.screen.slot.SlotController && this.autoSpinTimes == view.screen.slot.SlotController.autoSpinTimes && view.bar.bottom.gameBar.updateAutoSpinTime(this.autoSpinTimes);
              this.autoSpinTimes--;
              return [ 2 ];
            }
          });
        });
      };
      SlotController.prototype.clickSpin = function() {
        view.bar.bottom.gameBar.autoBet.active && view.bar.bottom.gameBar.hideAutoBet();
        if (this.isAutoSpin) {
          this.isAutoSpin = false;
          view.bar.bottom.gameBar.updateSpinFrame(define.type.SpinButton.normal);
          this.autoSpinTimes = 0;
          return;
        }
        if (this.isSpin) return;
        this.spin();
      };
      SlotController.prototype.spin = function(data) {
        tracking.send(tracking.event.SPIN_SLOT);
        this.isAutoSpin ? view.screen.slot && view.screen.slot.SlotController.autoSpinTimes > 0 && view.bar.bottom.gameBar.bottomBarEvent(define.type.BottomBar.lock) : view.bar.bottom.gameBar.bottomBarEvent(define.type.BottomBar.active);
        if (this.currentBet > game.user.balance) {
          this.autoSpinTimes = 0;
          game.log("User do not have enough coin to spin ...");
          return;
        }
        this.isSpin = true;
        this.isReceivedData = !!data;
        data || api.sendGD({
          e: api.key.SLOT_SPIN,
          gtype: this.gameId,
          totalbet: this.currentBet
        }, function(err, res) {
          game.log("callback", res);
        });
        this.timeManager();
      };
      SlotController.prototype.strMatrixToArray = function(str, x, y) {
        void 0 === x && (x = 5);
        void 0 === y && (y = 3);
        str = str.split(",");
        var data = [];
        for (var i = 0; i < x; i++) {
          var arr1 = [];
          for (var j = 0; j < y; j++) arr1.push(str[(y - 1 - j) * x + i]);
          data.push(arr1);
        }
        return data;
      };
      SlotController.prototype.updateCurrentBet = function(bet) {
        this.currentBet = bet;
      };
      SlotController.prototype.handleFreeSpin = function(dataSpin) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            if (view.screen.slot && dataSpin.freeSpin.c > 0 && !dataSpin.spinResult.score.freeSpin) {
              if (dataSpin.spinResult.id != view.screen.slot.SlotController.gameId) return [ 2 ];
              this.freeSpin = dataSpin.freeSpin.c;
              this.statusGame.freeSpin = this.freeSpin;
              view.bar.bottom.gameBar.updateStatus(this.statusGame);
            } else this.freeSpin = 0;
            return [ 2 ];
          });
        });
      };
      SlotController.prototype.checkAutoSpin = function(slots) {
        game.log(slots.autoSpinTimes);
        slots.autoSpinTimes > 0 ? slots.autoSpin(slots.autoSpinTimes) : view.bar.bottom.gameBar.updateSpinFrame(define.type.SpinButton.normal);
      };
      SlotController.prototype.showPayTable = function() {
        this.payTable ? controller.ui.showPopupPrefab(this.payTable) : game.warn("SlotController", "showPayTable", "Slot " + this.gameId + " paytable prefab not exist");
      };
      SlotController.prototype.hideContent = function() {};
      SlotController.prototype.showContent = function() {};
      SlotController.prototype.handleBonus = function(data) {};
      SlotController.prototype.checkShowBonusDialog = function(cb) {
        var _this = this;
        if (!this.bonus || !this.bonusNode || !view.screen.slot || view.screen.slot.SlotController.gameId !== this.gameId) return;
        controller.ui.showDialog({
          title: "You got a bonus",
          type: define.type.DIALOG_TYPE.HIGH,
          allowClose: false,
          name: "check_show_bonus_dialog",
          message: {
            message: "You got a bonus.\nPress OK to play"
          },
          buttons: [ {
            title: "OK",
            theme: define.type.CLASS_THEME.INFO,
            callback: function() {
              view.screen.bonus = _this.bonusNode;
              _this.bonusNode.x = 0;
              _this.bonusNode.parent = controller.ui.canvas;
              _this.bonusNode.runAction(cc.fadeIn(.5));
              controller.ui.hideBar();
              cb && cb();
            }
          } ]
        });
      };
      SlotController.prototype.handleCollectCoin = function(dataSpin) {};
      SlotController.prototype.playSound = function(name) {
        var sound;
        switch (name) {
         case SoundKey.INTRO:
          sound = this.resourceController.getAudio(this.resourceController.audioListName.intro);
          controller.sound.playSound(sound, {
            tag: this.gameId
          });
          return;

         case SoundKey.BACKGROUND:
          sound = this.resourceController.getAudio(this.resourceController.audioListName.background);
          controller.sound.playSound(sound, {
            tag: this.gameId
          });
          return;

         case SoundKey.WIN:
          sound = this.resourceController.getAudio(this.resourceController.audioListName.win);
          controller.sound.playSound(sound, {
            tag: this.gameId,
            volume: .5
          });
          return;
        }
      };
      SlotController.prototype.updateStatus = function(data) {
        var _this = this;
        var status = null;
        if ("slotspin" === data.type) {
          var result = data.spinResult.score;
          status = {
            win: Math.round(result.reward),
            winType: result.winType && DefineType_1.WIN_TYPE[result.winType] ? DefineType_1.WIN_TYPE[result.winType] : DefineType_1.WIN_TYPE.NORMAL,
            freeSpin: data.freeSpin && data.freeSpin.c > 0 ? data.freeSpin.c : result.freeSpin ? result.freeSpin : 0,
            isBonus: !(!result.sum[2] || !(result.sum[2].w > 0 || result.sum[2].c > 0)),
            autoSpin: this.autoSpinTimes > 0 ? this.autoSpinTimes : 0
          };
          this.spinDoneCallback.status = function() {
            view.screen.slot && view.screen.slot.SlotController.gameId === _this.gameId && view.bar.bottom.gameBar.updateStatus(status);
            view.bar.top.pushStatus(status, _this.gameId);
          };
        } else {
          status = {
            win: 0,
            winType: define.type.WIN_TYPE.NORMAL,
            freeSpin: data.freeSpin && data.freeSpin.c > 0 ? data.freeSpin.c : 0,
            isBonus: !!data.bonus,
            autoSpin: this.autoSpinTimes > 0 ? this.autoSpinTimes : 0
          };
          view.bar.bottom.gameBar.updateStatus(status);
        }
        this.statusGame = status;
      };
      SlotController.prototype.showWinType = function(type, coin) {
        return __awaiter(this, void 0, void 0, function() {
          var animType;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!view.screen.slot || view.screen.slot.SlotController.gameId !== this.gameId) return [ 2 ];
              animType = DefineType_1.WIN_TYPE[type];
              return [ 4, controller.ui.playPrefabAnimation("win", {
                type: animType,
                coin: coin
              }) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      __decorate([ property(cc.String) ], SlotController.prototype, "gameId", void 0);
      __decorate([ property(cc.Integer) ], SlotController.prototype, "gameSizeType", void 0);
      __decorate([ property(cc.Node) ], SlotController.prototype, "tableView", void 0);
      __decorate([ property(cc.Node) ], SlotController.prototype, "itemSlot", void 0);
      __decorate([ property(cc.Float) ], SlotController.prototype, "IPadScale", void 0);
      __decorate([ property(cc.Prefab) ], SlotController.prototype, "payTable", void 0);
      SlotController = __decorate([ ccclass ], SlotController);
      return SlotController;
    }(cc.Component);
    exports.default = SlotController;
    cc._RF.pop();
  }, {
    "../Define/DefineType": "DefineType",
    "./AnimationController": "AnimationController",
    "./Item": "Item",
    "./LinesController": "LinesController",
    "./SlotItem": "SlotItem"
  } ],
  SlotItem1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2f3e7JQJ5lPJav3AfWf9gNI", "SlotItem1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SlotItem_1 = require("../../../scripts/Slots/SlotItem");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotItem1 = function(_super) {
      __extends(SlotItem1, _super);
      function SlotItem1() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.slotsController = null;
        return _this;
      }
      SlotItem1.prototype.setItemSprite = function(item, first) {
        _super.prototype.setItemSprite.call(this, item);
        var coinLabel = this.node.getComponentInChildren(cc.Label);
        if (!coinLabel) return;
        if ("c" == this.id) {
          this.node.children[2].active = true;
          this.mainItemSprite.spriteFrame = this.slotsController.resourceController.getSprite("egypt-coin-3");
        } else this.node.children[2].active = false;
        if (this.slotsController.dataSpin) {
          "c" == this.id && (this.mainItemSprite.spriteFrame = this.slotsController.resourceController.getSprite("egypt-coin-2"));
          coinLabel.string = "$" + this.slotsController.dataSpin.spinResult.totalBet / 100;
        } else coinLabel.string = "$" + this.slotsController.dataStatus.lastBet / 100;
      };
      __decorate([ property({
        override: true
      }) ], SlotItem1.prototype, "slotsController", void 0);
      SlotItem1 = __decorate([ ccclass ], SlotItem1);
      return SlotItem1;
    }(SlotItem_1.default);
    exports.default = SlotItem1;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotItem": "SlotItem"
  } ],
  SlotItem2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "18b984gERFAQYDhHRd3FjKq", "SlotItem2");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SlotItem_1 = require("../../../scripts/Slots/SlotItem");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotItem2 = function(_super) {
      __extends(SlotItem2, _super);
      function SlotItem2() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.slotsController = null;
        return _this;
      }
      SlotItem2.prototype.setItemSprite = function(item, first) {
        _super.prototype.setItemSprite.call(this, item);
        var coinLabel = this.node.children[2].getComponent(cc.Label);
        if ("c" == this.id) {
          this.node.children[2].active = true;
          this.mainItemSprite.spriteFrame = this.slotsController.resourceController.getSprite("game-dra-item-coin-gray-mon");
        } else this.node.children[2].active = false;
        if (this.slotsController.dataSpin) {
          "c" == this.id && (this.mainItemSprite.spriteFrame = this.slotsController.resourceController.getSprite("game-dra-item-coin-gold-mon"));
          coinLabel.string = "$" + this.slotsController.dataSpin.spinResult.totalBet / 100;
        } else coinLabel.string = "$" + this.slotsController.dataStatus.lastBet / 100;
      };
      SlotItem2.prototype.checkSpecialItem = function(itemId) {
        if ("7" == itemId || "8" == itemId || "9" == itemId || "w" == itemId || "sw" == itemId) return true;
        return false;
      };
      __decorate([ property({
        override: true
      }) ], SlotItem2.prototype, "slotsController", void 0);
      SlotItem2 = __decorate([ ccclass ], SlotItem2);
      return SlotItem2;
    }(SlotItem_1.default);
    exports.default = SlotItem2;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotItem": "SlotItem"
  } ],
  SlotItem3: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a6d3exTRQhI6auP1LrWmYDA", "SlotItem3");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotSkeleton_1 = require("../../../scripts/Slots/SlotSkeleton");
    var SlotItem3 = function(_super) {
      __extends(SlotItem3, _super);
      function SlotItem3() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      SlotItem3 = __decorate([ ccclass ], SlotItem3);
      return SlotItem3;
    }(SlotSkeleton_1.default);
    exports.default = SlotItem3;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotSkeleton": "SlotSkeleton"
  } ],
  SlotItem4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a73fbloCxtHDIET+yNuHXbr", "SlotItem4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SlotItem_1 = require("../../../scripts/Slots/SlotItem");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotItem4 = function(_super) {
      __extends(SlotItem4, _super);
      function SlotItem4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.borderWin = null;
        _this.partical = null;
        return _this;
      }
      SlotItem4.prototype.onLoad = function() {
        _super.prototype.onLoad.call(this);
        this.borderWin.active = false;
      };
      SlotItem4.prototype.updateShowBorderWin = function() {
        var _this = this;
        this.borderWin.active = true;
        if (true == this.border.active) {
          this.border.active = false;
          setTimeout(function() {
            return _this.border.active = true;
          }, 1400);
        }
      };
      SlotItem4.prototype.hideBorderWin = function() {
        this.borderWin.active = false;
      };
      SlotItem4.prototype.checkSpecialItem = function(itemId) {
        if ("s" == itemId || "w" == itemId || "12" == itemId || "13" == itemId || "14" == itemId || "15" == itemId || "22" == itemId || "23" == itemId || "24" == itemId || "25" == itemId) return true;
        return false;
      };
      SlotItem4.prototype.playZoomAnimation = function() {
        _super.prototype.playZoomAnimation.call(this);
        this.node.children[0].active = true;
      };
      SlotItem4.prototype.stopZoomAnimation = function() {
        if (!this || !view.screen.slot || !this.node) return;
        _super.prototype.stopZoomAnimation.call(this);
        this.node.children[0].active = false;
        this.node.children[0].stopAllActions();
        this.node.stopAllActions();
      };
      __decorate([ property(cc.Node) ], SlotItem4.prototype, "borderWin", void 0);
      __decorate([ property(cc.Node) ], SlotItem4.prototype, "partical", void 0);
      SlotItem4 = __decorate([ ccclass ], SlotItem4);
      return SlotItem4;
    }(SlotItem_1.default);
    exports.default = SlotItem4;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotItem": "SlotItem"
  } ],
  SlotItem5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c69b03tvv9KQZLdNmcJcwHr", "SlotItem5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotItem_1 = require("../../../scripts/Slots/SlotItem");
    var SlotItem5 = function(_super) {
      __extends(SlotItem5, _super);
      function SlotItem5() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      SlotItem5 = __decorate([ ccclass ], SlotItem5);
      return SlotItem5;
    }(SlotItem_1.default);
    exports.default = SlotItem5;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotItem": "SlotItem"
  } ],
  SlotItem6: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b28b2desdRKna+K1V1C4gvK", "SlotItem6");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotSkeleton_1 = require("../../../scripts/Slots/SlotSkeleton");
    var SlotItem6 = function(_super) {
      __extends(SlotItem6, _super);
      function SlotItem6() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      SlotItem6.prototype.setItemInfo = function(item, x, y) {
        _super.prototype.setItemInfo.call(this, item, x, y);
        if (this.slotsController.dataSpin && this.slotsController.dataSpin.features.freeReelGame && this.slotsController.dataSpin.features.freeReelGame.userSpined) {
          var sticky = this.slotsController.dataStatus.freeReelGame.stickyWildReels;
          if (!sticky) return;
          sticky.indexOf(this.x + 1) >= 0 && this.checkStikyWild();
        }
      };
      SlotItem6.prototype.setItemSprite = function(item) {
        if (this.slotsController.dataSpin && this.slotsController.dataSpin.features.freeReelGame && this.slotsController.dataSpin.features.freeReelGame.userSpined) {
          var sticky = this.slotsController.dataSpin.features.freeReelGame.stickyWildReels;
          if (sticky.indexOf(this.x + 1) >= 0) {
            this.checkStikyWild();
            return;
          }
        }
        _super.prototype.setItemSprite.call(this, item);
      };
      SlotItem6.prototype.checkStikyWild = function() {
        this.id = "w";
        this.setItemSkeleton("wild");
      };
      SlotItem6 = __decorate([ ccclass ], SlotItem6);
      return SlotItem6;
    }(SlotSkeleton_1.default);
    exports.default = SlotItem6;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotSkeleton": "SlotSkeleton"
  } ],
  SlotItem7: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f995aMrajBOQLo9kdlBnyOl", "SlotItem7");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotSkeleton_1 = require("../../../scripts/Slots/SlotSkeleton");
    var SlotItem7 = function(_super) {
      __extends(SlotItem7, _super);
      function SlotItem7() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.slotsController = null;
        _this.aniBorder = null;
        _this.value = [ .25, .5, .25, .5, .25, .5, .75, 1, 1.5, 2, 2.5, .75, 1, 1.5, 2, 2.5, .75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 3, 3.5, 4, 4.5, 5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, "MINI", "MINI", "MINI", "MINI", "MINI", "MINOR", "MINOR", "MINOR", "MAJOR", "MAJOR", "WHEEL", "WHEEL", "SUPPER" ];
        _this.listItemAni = [ "0", "1", "2", "3", "4" ];
        return _this;
      }
      SlotItem7.prototype.setItemSprite = function(randomItem, first) {
        return __awaiter(this, void 0, void 0, function() {
          var shieldLabel, valueRandom, totalB, data_1;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _super.prototype.setItemSprite.call(this, randomItem);
              shieldLabel = this.node.children[1].getComponent(cc.Label);
              valueRandom = this.value[Math.floor(0 + Math.random() * this.value.length)];
              if ("k" == this.id) {
                this.node.children[1].active = true;
                if ("number" == typeof valueRandom) {
                  totalB = 0;
                  totalB = this.slotsController.dataSpin ? this.slotsController.dataSpin.spinResult.totalBet : this.slotsController.dataStatus.lastBet;
                  shieldLabel.string = "" + util.game.abbreviateNumber(valueRandom * totalB, 0);
                } else shieldLabel.string = "" + valueRandom;
              } else this.node.children[1].active = false;
              if (!this.slotsController.dataSpin) return [ 3, 2 ];
              return [ 4, util.game.delay(1e3) ];

             case 1:
              _a.sent();
              if (!view.screen.slot || !this || !this.slotsController || !this.slotsController.dataSpin) return [ 2 ];
              data_1 = this.slotsController.dataSpin.spinResult.score.sum[6].arr;
              data_1.forEach(function(item, index) {
                var listItemShield = _this.slotsController._listItem[item.position.col][item.position.row + 1];
                "number" == typeof data_1[index].value ? listItemShield.node.children[1].getComponent(cc.Label).string = "" + util.game.abbreviateNumber(data_1[index].value * _this.slotsController.dataSpin.spinResult.totalBet, 0) : listItemShield.node.children[1].getComponent(cc.Label).string = "" + data_1[index].value;
              });
              _a.label = 2;

             case 2:
              return [ 2 ];
            }
          });
        });
      };
      SlotItem7.prototype.playZoomAnimation = function() {
        _super.prototype.playZoomAnimation.call(this);
        this.node.children[3].active = true;
        this.listItemAni.includes(this.id) && this.node.children[0].runAction(cc.repeatForever(cc.sequence([ cc.fadeOut(.4), cc.fadeIn(.6) ])));
      };
      SlotItem7.prototype.stopZoomAnimation = function() {
        _super.prototype.stopZoomAnimation.call(this);
        this.node.children[0].stopAllActions();
        this.node.children[0].opacity = 255;
        this.node.children[3].active = false;
      };
      __decorate([ property({
        override: true
      }) ], SlotItem7.prototype, "slotsController", void 0);
      __decorate([ property(cc.Node) ], SlotItem7.prototype, "aniBorder", void 0);
      SlotItem7 = __decorate([ ccclass ], SlotItem7);
      return SlotItem7;
    }(SlotSkeleton_1.default);
    exports.default = SlotItem7;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotSkeleton": "SlotSkeleton"
  } ],
  SlotItem8: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a076dq++lFHt5SZnwTBtVKG", "SlotItem8");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotSkeleton_1 = require("../../../scripts/Slots/SlotSkeleton");
    var SlotItem8 = function(_super) {
      __extends(SlotItem8, _super);
      function SlotItem8() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      SlotItem8 = __decorate([ ccclass ], SlotItem8);
      return SlotItem8;
    }(SlotSkeleton_1.default);
    exports.default = SlotItem8;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotSkeleton": "SlotSkeleton"
  } ],
  SlotItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5fd32DWbaVC7rErwd21rsCa", "SlotItem");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SlotController_1 = require("./SlotController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotItem = function(_super) {
      __extends(SlotItem, _super);
      function SlotItem() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.mainItemSprite = null;
        _this.slotsControllerNode = null;
        _this.border = null;
        _this.zoomAni = null;
        _this.a = .5;
        _this.c = 1900;
        _this.maxCount = 5;
        _this.id = "";
        _this.x = 0;
        _this.y = 0;
        _this.count = 0;
        return _this;
      }
      SlotItem.prototype.onLoad = function() {
        this.isMove = false;
        this.time = 0;
        this.duration = 0;
        this.y0 = this.node.y;
        this.distance = 0;
        this.slotsController = this.slotsControllerNode.getComponent(SlotController_1.default);
        this.maxY = (this.slotsController.maxRow + .5) * this.slotsController.distanceItemY;
        this.minY = -.5 * this.slotsController.distanceItemY;
        this.initZoomAnimation();
      };
      SlotItem.prototype.setItemInfo = function(item, x, y) {
        this.id = item.id;
        this.mainItemSprite.spriteFrame = item.spritesFrame;
        this.x = x;
        this.y = y;
        if (this.slotsController._listBorderImg.length > 0) if (this.checkSpecialItem(item.id)) {
          var borderImg = this.slotsController._listBorderImg.find(function(x) {
            return x.id === item.id;
          });
          this.border.active = true;
          this.border.getComponent(cc.Sprite).spriteFrame = borderImg.img;
        } else this.border.active = false;
      };
      SlotItem.prototype.setItemSprite = function(randomItem, first) {
        var _this = this;
        var item = this.slotsController.getRandomItem();
        if (randomItem) {
          this.mainItemSprite.spriteFrame = item.spritesFrame;
          this.id = item.id;
        } else if (null != this.arrResult && this.y <= this.slotsController.maxRow - 1) {
          var index_1 = this.slotsController.maxCol * (this.slotsController.maxRow - this.y - 1) + this.x;
          item = this.slotsController._listItemData.find(function(x) {
            return x.id == _this.arrResult[index_1];
          });
          this.id = item.id;
          this.mainItemSprite.spriteFrame = item.spritesFrame;
        }
        if (this.slotsController._listBorderImg.length > 0) if (this.checkSpecialItem(item.id)) {
          var borderImg = this.slotsController._listBorderImg.find(function(x) {
            return x.id === item.id;
          });
          this.border.active = true;
          this.border.getComponent(cc.Sprite).spriteFrame = borderImg.img;
        } else this.border.active = false;
      };
      SlotItem.prototype.checkSpecialItem = function(itemId) {
        if ("b" == itemId || "s" == itemId || "w" == itemId) return true;
        return false;
      };
      SlotItem.prototype.move = function() {
        var _this = this;
        var self = this;
        this.node.runAction(cc.sequence(cc.moveTo(.3, cc.v2(this.node.x, (this.y + .6) * this.slotsController.distanceItemY)), cc.callFunc(function() {
          _this.isMove = true;
          _this.time = 0;
          _this.y0 = self.node.y;
          _this.count = 0;
        })));
      };
      SlotItem.prototype.setMatrixEnd = function(data) {
        this.arrResult = data;
      };
      SlotItem.prototype.stop = function() {
        this.endingMove = true;
      };
      SlotItem.prototype.scaleAnim = function(time) {
        var self = this;
        var action = cc.scaleTo(.5, 1.2);
        this.node.runAction(action);
        setTimeout(function() {
          var action = cc.scaleTo(.5, 1);
          null != self.node && self.node.runAction(action);
        }, 500);
      };
      SlotItem.prototype.initZoomAnimation = function() {
        this.mainItem = this.node.children[1] || this.node;
        this.zoomAnimation = this.mainItem.addComponent(cc.Animation);
        this.zoomAni.speed = 1.1;
        this.zoomAnimation.addClip(this.zoomAni);
      };
      SlotItem.prototype.playZoomAnimation = function() {
        this.zoomAnimation.play("ZoomItem");
      };
      SlotItem.prototype.stopZoomAnimation = function() {
        if (!this.zoomAnimation) return;
        this.zoomAnimation.setCurrentTime(0);
        this.zoomAnimation.stop("ZoomItem");
      };
      SlotItem.prototype.update = function(dt) {
        this.time += dt;
        this.duration += dt;
        if (true == this.isMove) {
          this.node.y = this.y0 - this.c * this.time;
          if (this.node.y <= this.minY) {
            this.count++;
            if (!this.reallyStop) {
              var delta = this.minY - this.node.y;
              this.node.y = this.maxY - delta;
              this.y0 = this.node.y;
              this.time = 0;
            }
            this.setItemSprite(true);
            var maxCount = this.maxCount;
            if (this.count >= maxCount) {
              this.endingMove = true;
              this.setItemSprite(false);
              this.reallyStop = true;
            }
          }
          if (this.reallyStop && this.node.y <= (this.y + .3) * this.slotsController.distanceItemY) {
            this.node.y = (this.y + .3) * this.slotsController.distanceItemY;
            this.endingMove = false;
            this.isMove = false;
            var action = cc.moveTo(.2, cc.v2(this.node.x, (this.y + .5) * this.slotsController.distanceItemY)).easing(cc.easeBackOut());
            this.node.runAction(cc.sequence([ action, cc.callFunc(function() {}) ]));
            this.reallyStop = false;
          }
        }
      };
      __decorate([ property(cc.Sprite) ], SlotItem.prototype, "mainItemSprite", void 0);
      __decorate([ property(cc.Node) ], SlotItem.prototype, "slotsControllerNode", void 0);
      __decorate([ property(cc.Node) ], SlotItem.prototype, "border", void 0);
      __decorate([ property(cc.AnimationClip) ], SlotItem.prototype, "zoomAni", void 0);
      __decorate([ property ], SlotItem.prototype, "a", void 0);
      __decorate([ property ], SlotItem.prototype, "c", void 0);
      __decorate([ property ], SlotItem.prototype, "maxCount", void 0);
      SlotItem = __decorate([ ccclass ], SlotItem);
      return SlotItem;
    }(cc.Component);
    exports.default = SlotItem;
    cc._RF.pop();
  }, {
    "./SlotController": "SlotController"
  } ],
  SlotSkeleton: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "86f79nJDm1CrrvlJ1GslRXC", "SlotSkeleton");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotItem_1 = require("./SlotItem");
    var SlotSkeleton = function(_super) {
      __extends(SlotSkeleton, _super);
      function SlotSkeleton() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.mainItemSke = null;
        _this.listItemSkeleton = {};
        return _this;
      }
      SlotSkeleton.prototype.onLoad = function() {
        _super.prototype.onLoad.call(this);
        this.listItemSkeleton = this.slotsController.listItemSkeleton;
      };
      SlotSkeleton.prototype.setItemInfo = function(item, x, y) {
        this.id = item.id;
        this.x = x;
        this.y = y;
        var keys = Object.keys(this.listItemSkeleton);
        this.setItemSkeleton(this.listItemSkeleton[keys[Math.random() * keys.length | 0]]);
      };
      SlotSkeleton.prototype.setItemSprite = function(item) {
        var _this = this;
        if (item) {
          item = this.slotsController.getRandomItem();
          this.setItemSkeleton(this.listItemSkeleton[item.id]);
          this.id = item.id;
        } else {
          item = this.slotsController.getRandomItem();
          if (null != this.arrResult) {
            if (this.y <= this.slotsController.maxRow - 1) {
              var index_1 = this.slotsController.maxCol * (this.slotsController.maxRow - this.y - 1) + this.x;
              item = this.slotsController._listItemData.find(function(x) {
                return x.id == _this.arrResult[index_1];
              });
              this.id = item.id;
              this.setItemSkeleton(this.listItemSkeleton[item.id]);
            }
          } else this.setItemSkeleton(this.listItemSkeleton[item.id]);
        }
      };
      SlotSkeleton.prototype.setItemSkeleton = function(name) {
        this.mainItemSke.animation = name;
      };
      SlotSkeleton.prototype.initZoomAnimation = function() {};
      SlotSkeleton.prototype.playZoomAnimation = function() {
        var name = this.mainItemSke.animation;
        this.mainItemSke.animation = name + "_run";
      };
      SlotSkeleton.prototype.stopZoomAnimation = function() {
        if (!this.mainItemSke) return;
        var name = this.mainItemSke.animation;
        this.mainItemSke.animation = name.includes("_run") ? name.slice(0, name.length - 4) : name;
      };
      __decorate([ property(sp.Skeleton) ], SlotSkeleton.prototype, "mainItemSke", void 0);
      SlotSkeleton = __decorate([ ccclass ], SlotSkeleton);
      return SlotSkeleton;
    }(SlotItem_1.default);
    exports.default = SlotSkeleton;
    cc._RF.pop();
  }, {
    "./SlotItem": "SlotItem"
  } ],
  SoundController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ba032ooKTBJ14H9we97QPTJ", "SoundController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SoundController = function() {
      function SoundController() {
        this.sounds = {};
        this.soundOn = false;
        this.musicOn = false;
        this.listSounds = [];
        this.buttonSFXName = "click";
        this.popupSFXName = "slide";
        this.dialogSFXName = "pop";
      }
      SoundController.ins = function() {
        this.instance || (this.instance = new SoundController());
        return this.instance;
      };
      SoundController.prototype.init = function() {
        if (null === cc.sys.localStorage.getItem(define.key.CONFIG_SOUND)) {
          this.soundOn = true;
          cc.sys.localStorage.setItem(define.key.CONFIG_SOUND, this.soundOn);
        }
        this.soundOn = "true" === cc.sys.localStorage.getItem(define.key.CONFIG_SOUND);
        if (null === cc.sys.localStorage.getItem(define.key.CONFIG_MUSIC)) {
          this.musicOn = true;
          cc.sys.localStorage.setItem(define.key.CONFIG_MUSIC, this.musicOn);
        }
        this.musicOn = "true" === cc.sys.localStorage.getItem(define.key.CONFIG_MUSIC);
        this.listSounds = [];
      };
      SoundController.prototype.toggleSound = function() {
        this.soundOn = "true" === cc.sys.localStorage.getItem(define.key.CONFIG_SOUND);
        this.setSoundStatus(!this.soundOn);
      };
      SoundController.prototype.setSoundStatus = function(status) {
        this.soundOn = status;
        cc.sys.localStorage.setItem(define.key.CONFIG_SOUND, this.soundOn);
        this.soundOn || this.stopAllSounds();
        game.log("SoundController", "toggle sound", "sound on: ", this.soundOn);
        return this.soundOn;
      };
      SoundController.prototype.toggleMusic = function() {
        this.musicOn = "true" === cc.sys.localStorage.getItem(define.key.CONFIG_MUSIC);
        this.setMusicStatus(!this.musicOn);
      };
      SoundController.prototype.setMusicStatus = function(status) {
        this.musicOn = status;
        cc.sys.localStorage.setItem(define.key.CONFIG_MUSIC, this.musicOn);
        this.musicOn ? this.playMusic() : this.stopMusic();
        game.log("SoundController", "toggle music", "music on: ", this.musicOn);
        return this.musicOn;
      };
      SoundController.prototype.getSoundStatus = function() {
        return this.soundOn;
      };
      SoundController.prototype.getMusicStatus = function() {
        return this.musicOn;
      };
      SoundController.prototype.setMusicVolume = function(volume) {
        if ("number" !== typeof volume || volume < 0 || volume > 1) {
          cc.warn("SoundController", "setMusicVolume", "volume must be number between 0 and 1", volume);
          return;
        }
        cc.audioEngine.setMusicVolume(volume);
      };
      SoundController.prototype.setSoundVolume = function(volume) {
        if ("number" !== typeof volume || volume < 0 || volume > 1) {
          cc.warn("SoundController", "setSoundVolume", "volume must be number between 0 and 1", volume);
          return;
        }
        cc.audioEngine.setEffectsVolume(volume);
      };
      SoundController.prototype.getMusicVolume = function() {
        return cc.audioEngine.getMusicVolume();
      };
      SoundController.prototype.getSoundVolume = function() {
        return cc.audioEngine.getEffectsVolume();
      };
      SoundController.prototype.playMusic = function(name, loop) {
        if (!this.musicOn) return;
        "undefined" === typeof loop && (loop = true);
        var id = void 0;
        "string" === typeof name ? this.sounds && this.sounds[name] ? id = cc.audioEngine.playMusic(this.sounds[name], loop) : cc.warn("SoundController", "playMusic", "music " + name + " not defined in resource", this.sounds) : this.sounds && this.sounds["music"] && (id = cc.audioEngine.playMusic(this.sounds["music"], loop));
        return id;
      };
      SoundController.prototype.pauseMusic = function() {
        cc.audioEngine.pauseMusic();
      };
      SoundController.prototype.resumeMusic = function() {
        if (!this.musicOn) return;
        cc.audioEngine.resumeMusic();
      };
      SoundController.prototype.stopMusic = function() {
        cc.audioEngine.stopMusic();
      };
      SoundController.prototype.isMusicPlaying = function() {
        return cc.audioEngine.isMusicPlaying();
      };
      SoundController.prototype.playSound = function(source, option) {
        if (!source) return game.warn("Audio source is not available.");
        if (!this.soundOn) return;
        option || (option = {});
        "undefined" === typeof option.loop && (option.loop = false);
        var id = void 0;
        var name = "";
        name = source instanceof cc.AudioClip ? source.name : source;
        "string" === typeof source && this.sounds && this.sounds[name] ? id = cc.audioEngine.playEffect(this.sounds[name], option.loop) : source instanceof cc.AudioClip ? id = cc.audioEngine.playEffect(source, option.loop) : cc.warn("SoundController", "playSound", "sound " + name + " not defined in resource", this.sounds);
        cc.audioEngine.setVolume(id, option.volume || 1);
        "number" === typeof id && this.listSounds.push({
          name: name,
          id: id,
          tag: option.tag || "default"
        });
        return id;
      };
      SoundController.prototype.setVolumeByTag = function(tag, volume) {
        if (volume > 1 || volume < 0) return false;
        this.listSounds.forEach(function(item) {
          item.tag === tag && cc.audioEngine.setVolume(item.id, volume);
        });
        return true;
      };
      SoundController.prototype.disableAudioByTag = function(tag) {
        return this.setVolumeByTag(tag, 0);
      };
      SoundController.prototype.pauseSound = function(name) {
        var list = this.listSounds.filter(function(o) {
          return o.name === name && cc.audioEngine.getState(o.id) === cc.audioEngine.AudioState.PLAYING;
        });
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
          var sound = list_1[_i];
          cc.audioEngine.pauseEffect(sound.id);
        }
      };
      SoundController.prototype.pauseAllSounds = function() {
        cc.audioEngine.pauseAllEffects();
      };
      SoundController.prototype.resumeSound = function(name) {
        if (!this.soundOn) return;
        var sound = this.listSounds.find(function(o) {
          return o.name === name && cc.audioEngine.getState(o.id) === cc.audioEngine.AudioState.PAUSED;
        });
        sound && cc.audioEngine.resumeEffect(sound.id);
      };
      SoundController.prototype.resumeAllSounds = function() {
        if (!this.soundOn) return;
        cc.audioEngine.resumeAllEffects();
      };
      SoundController.prototype.stopSound = function(name) {
        if ("string" === typeof name) {
          var list = this.listSounds.filter(function(o) {
            return o.name === name && cc.audioEngine.getState(o.id) === cc.audioEngine.AudioState.PLAYING;
          });
          for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
            var sound = list_2[_i];
            cc.audioEngine.stopEffect(sound.id);
          }
        } else "number" === typeof name && cc.audioEngine.stopEffect(name);
      };
      SoundController.prototype.stopAllSounds = function() {
        cc.audioEngine.stopAllEffects();
      };
      SoundController.prototype.isSoundsPlaying = function(name) {
        var list = this.listSounds.filter(function(o) {
          return o.name === name && cc.audioEngine.getState(o.id) === cc.audioEngine.AudioState.PLAYING;
        });
        if (list && list.length && list.length > 0) return true;
        return false;
      };
      SoundController.prototype.pauseAll = function() {
        this.pauseMusic();
        this.pauseAllSounds();
      };
      SoundController.prototype.resumeAll = function() {
        this.resumeMusic();
        this.resumeAllSounds();
      };
      SoundController.prototype.stopAll = function() {
        this.stopMusic();
        this.stopAllSounds();
      };
      SoundController.prototype.playButtonSFX = function() {
        this.isSoundsPlaying(this.popupSFXName) || this.isSoundsPlaying(this.dialogSFXName) || this.playSound(this.buttonSFXName);
      };
      SoundController.prototype.stopButtonSFX = function() {
        this.stopSound(this.buttonSFXName);
      };
      SoundController.prototype.playPopupSFX = function() {
        this.stopButtonSFX();
        this.playSound(this.popupSFXName);
      };
      SoundController.prototype.stopPopupSFX = function() {
        this.stopSound(this.popupSFXName);
      };
      SoundController.prototype.playDialogSFX = function() {
        this.stopButtonSFX();
        this.playSound(this.dialogSFXName);
      };
      SoundController.prototype.stopDialogSFX = function() {
        this.stopSound(this.dialogSFXName);
      };
      SoundController.instance = void 0;
      return SoundController;
    }();
    exports.default = SoundController;
    cc._RF.pop();
  }, {} ],
  Store: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8d5df9Kfl1LNISDiv4sLJhx", "Store");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineKey = require("./Define/DefineKey");
    var Store = function() {
      function Store() {
        this.eventList = {};
        this.subUid = -1;
        this.key = DefineKey.store;
        Store._instance = Store._instance || this;
        Store._instance.data = Store._instance.data || {};
        return Store._instance;
      }
      Store.prototype.register = function(event, callback) {
        var token = (++this.subUid).toString();
        var data = this.data[event];
        this.eventList[event] ? this.eventList[event].push({
          token: token,
          callback: callback
        }) : this.eventList[event] = [ {
          token: token,
          callback: callback
        } ];
        data && callback && callback(data);
        return token;
      };
      Store.prototype.unRegister = function(token) {
        var eventList = this.eventList;
        Object.keys(eventList).forEach(function(key) {
          if (!eventList[key]) return;
          var index = eventList[key].findIndex(function(item) {
            return item.token == token;
          });
          if (index < 0) return;
          eventList[key].splice(index, 1);
          return true;
        });
      };
      Store.prototype.emit = function(event, data, option) {
        if (!this.eventList[event]) return false;
        this.data[event] = data;
        this.eventList[event].forEach(function(item) {
          item.callback(data, option);
        });
      };
      return Store;
    }();
    exports.default = new Store();
    cc._RF.pop();
  }, {
    "./Define/DefineKey": "DefineKey"
  } ],
  StringUtil: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ba958kkuGVE/prrUc//BcIQ", "StringUtil");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var StringUtil = function() {
      function StringUtil() {}
      StringUtil.formatMoney = function(n, c) {
        void 0 === c && (c = ",");
        return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, c);
      };
      StringUtil.formatTime = function(ms, level, prefix) {
        void 0 === level && (level = "h");
        void 0 === prefix && (prefix = false);
        var str = "";
        var s = ms / 1e3;
        var d = Math.floor(s / 86400);
        s %= 86400;
        var h = Math.floor(s / 3600);
        s %= 3600;
        var m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        str += d > 0 ? StringUtil.zeroPad(d, 2) + (prefix ? "d:" : ":") : "d" === level ? "00:" : "";
        str += h > 0 ? StringUtil.zeroPad(h, 2) + (prefix ? "h:" : ":") : "d" === level || "h" === level ? "00:" : "";
        str += m > 0 ? StringUtil.zeroPad(m, 2) + (prefix ? "m:" : ":") : "d" === level || "h" === level || "m" === level ? "00:" : "";
        str += s > 0 ? StringUtil.zeroPad(s, 2) + (prefix ? "s" : "") : "d" === level || "h" === level || "m" === level || "s" === level ? "00" : "";
        return str;
      };
      StringUtil.zeroPad = function(number, width, z) {
        z = z || "0";
        var num = number.toString() + "";
        return num.length >= width ? num : new Array(width - num.length + 1).join(z) + num;
      };
      return StringUtil;
    }();
    exports.default = StringUtil;
    cc._RF.pop();
  }, {} ],
  TopBarController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "388b1L76zZKf4od6mv6qXzi", "TopBarController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../Components/CoinLabel");
    var AccumulatedBar_1 = require("../Components/AccumulatedBar");
    var Avatar_1 = require("../Components/Avatar");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BAR_TYPE;
    (function(BAR_TYPE) {
      BAR_TYPE["NONE"] = "NONE";
      BAR_TYPE["HOME"] = "HOME";
      BAR_TYPE["GAME"] = "GAME";
    })(BAR_TYPE || (BAR_TYPE = {}));
    var TopBarController = function(_super) {
      __extends(TopBarController, _super);
      function TopBarController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.tag = "TopBarController";
        _this.coinController = void 0;
        _this.keyList = [];
        _this.model = void 0;
        _this.lbStatusTitle = void 0;
        _this.lbStatus = void 0;
        _this.avt = void 0;
        _this.btnBack = void 0;
        _this.lbCoin = void 0;
        _this.barExp = void 0;
        _this.lbLevel = void 0;
        _this.nodeStatus = void 0;
        _this.nodeBuyDeal = void 0;
        _this.nodeBuyFull = void 0;
        _this.lbDeal = void 0;
        _this.menu = void 0;
        _this.barType = BAR_TYPE.NONE;
        _this.lerpOn = false;
        return _this;
      }
      TopBarController.prototype.onLoad = function() {
        this.model = this.node.getChildByName("model");
        this.coinController = new CoinLabel_1.default(this.lbCoin);
        this.initialize();
        this.resgisterEvent();
        this.lbStatusTitle = this.nodeStatus.getChildByName("title").getComponent(cc.Label);
        this.lbStatus = this.nodeStatus.getChildByName("status").getComponent(cc.Label);
      };
      TopBarController.prototype.initialize = function() {};
      TopBarController.prototype.resgisterEvent = function() {
        var _this = this;
        var keyCoin = store.register(store.key.UPDATE_USER_BALANCE, function(amount, option) {
          return __awaiter(_this, void 0, void 0, function() {
            return __generator(this, function(_a) {
              if (!this.lerpOn) return [ 2 ];
              this.coinController.updateUserBalance(amount, option);
              return [ 2 ];
            });
          });
        });
        this.keyList.push(keyCoin);
        var keyLevel = store.register(store.key.UPDATE_USER_LEVEL, function(data, option) {
          return __awaiter(_this, void 0, void 0, function() {
            var currentExp, requiredExp, currentLevel, percent;
            return __generator(this, function(_a) {
              if (!this.lerpOn) return [ 2 ];
              currentExp = data.currentExp, requiredExp = data.requiredExp, currentLevel = data.currentLevel;
              percent = currentExp <= requiredExp ? currentExp / requiredExp : 1;
              this.barExp.setProgress(percent);
              this.lbLevel.string = currentLevel;
              return [ 2 ];
            });
          });
        });
        this.keyList.push(keyLevel);
        var keyAvt = store.register(store.key.UPDATE_USER_AVATAR, function() {
          _this.avt.setAvatar({
            facebookID: game.user.fbid
          });
        });
        this.keyList.push(keyAvt);
        var keyShop = store.register(store.key.UPDATE_SHOP_DATA, function(data) {
          var dealData = data[define.type.ESHOP.DEAL_SHOP];
          if (dealData && new Date(dealData.expire) > util.game.date() && !dealData.isTaken && dealData.productId) {
            var dealData_1 = data[define.type.ESHOP.DEAL_SHOP];
            _this.nodeBuyDeal.active = true;
            _this.nodeBuyFull.active = false;
            _this.lbDeal.node.stopAllActions();
            _this.lbDeal.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(.5), cc.callFunc(function() {
              if (!_this.lbDeal) return;
              if (new Date(dealData_1.expire) > util.game.date()) {
                var time = new Date(dealData_1.expire).getTime() - util.game.date().getTime();
                _this.lbDeal.string = util.string.formatTime(time);
              } else {
                _this.lbDeal.node.stopAllActions();
                _this.lbDeal.string = "00:00:00";
                game.data.shop[define.type.ESHOP.DEAL_SHOP] = void 0;
                store.emit(store.key.UPDATE_SHOP_DATA, game.data.shop);
              }
            }))));
          } else {
            _this.nodeBuyDeal.active = false;
            _this.nodeBuyFull.active = true;
          }
        });
        this.keyList.push(keyShop);
      };
      TopBarController.prototype.updateBarData = function() {
        this.coinController.updateUserBalance(game.user.balance);
        var _a = game.user.level, currentExp = _a.currentExp, requiredExp = _a.requiredExp, currentLevel = _a.currentLevel;
        var percent = currentExp <= requiredExp ? currentExp / requiredExp : 1;
        this.barExp.setProgress(percent);
        this.lbLevel.string = currentLevel.toString();
      };
      TopBarController.prototype.hide = function(effect) {
        var _this = this;
        void 0 === effect && (effect = true);
        return new Promise(function(res, rej) {
          if (effect) {
            _this.node.y = 360;
            _this.node.stopAllActions();
            _this.lock();
            _this.node.runAction(cc.sequence(cc.moveBy(.1, cc.v2(0, _this.node.height)), cc.callFunc(function() {
              _this.unlock();
              res();
            })));
          } else {
            _this.node.y = 360 + _this.node.height;
            _this.node.stopAllActions();
            _this.unlock();
            res();
          }
        });
      };
      TopBarController.prototype.show = function(effect) {
        var _this = this;
        void 0 === effect && (effect = true);
        return new Promise(function(res, rej) {
          if (effect) {
            _this.node.y = 360 + _this.node.height;
            _this.node.stopAllActions();
            _this.lock();
            _this.node.runAction(cc.sequence(cc.moveBy(.2, cc.v2(0, -_this.node.height)), cc.callFunc(function() {
              _this.unlock();
              res();
            })));
          } else {
            _this.node.y = 360;
            _this.node.stopAllActions();
            _this.unlock();
            res();
          }
        });
      };
      TopBarController.prototype.lock = function() {
        this.model.active = true;
      };
      TopBarController.prototype.unlock = function() {
        this.model.active = false;
      };
      TopBarController.prototype.updateView = function() {
        if (this.barType === BAR_TYPE.HOME && controller.ui.onView === define.type.VIEW.HOME || this.barType === BAR_TYPE.GAME && controller.ui.onView === define.type.VIEW.GAME) return;
        if (controller.ui.onView === define.type.VIEW.GAME) {
          this.barType = BAR_TYPE.GAME;
          this.updateViewGame();
        } else {
          this.barType = BAR_TYPE.HOME;
          this.updateViewHome();
        }
      };
      TopBarController.prototype.updateViewGame = function() {
        var avtAct = cc.scaleTo(.25, 0).easing(cc.easeBackIn());
        this.avt.node.runAction(avtAct);
        var backAct = cc.sequence(cc.delayTime(avtAct.getDuration()), cc.scaleTo(.15, 1));
        this.btnBack.runAction(backAct);
      };
      TopBarController.prototype.updateViewHome = function() {
        var backAct = cc.scaleTo(.25, 0).easing(cc.easeBackIn());
        this.btnBack.runAction(backAct);
        var avtAct = cc.sequence(cc.delayTime(backAct.getDuration()), cc.scaleTo(.15, 1));
        this.avt.node.runAction(avtAct);
      };
      TopBarController.prototype.pushStatus = function(status, gameId) {
        var _a = this, lbStatus = _a.lbStatus, lbStatusTitle = _a.lbStatusTitle;
        var statusData = JSON.parse(JSON.stringify(status));
        var statusArray = [];
        statusData.isBonus && statusArray.push({
          key: "isBonus",
          data: true
        });
        status.win && statusData.winType === define.type.WIN_TYPE.BIGWIN && statusArray.push({
          key: "bigwin",
          data: status.win
        });
        status.win && statusData.winType === define.type.WIN_TYPE.MEGAWIN && statusArray.push({
          key: "megawin",
          data: status.win
        });
        status.freeSpin && statusArray.push({
          key: "freeSpin",
          data: status.freeSpin
        });
        status.win && statusData.winType === define.type.WIN_TYPE.NORMAL && statusArray.push({
          key: "win",
          data: status.win
        });
        status.autoSpin && statusArray.push({
          key: "autoSpin",
          data: status.autoSpin
        });
        if (!statusArray.length) return;
        var gameName = "Slot " + (Object.values(config.game.SMID).findIndex(function(o) {
          return o === gameId;
        }) + 1);
        var getStatus = function(object) {
          var key = object.key, data = object.data;
          if ("megawin" === key) return "Mega Win: " + util.string.formatMoney(data);
          if ("bigwin" === key) return "Big Win: " + util.string.formatMoney(data);
          if ("isBonus" === key) return "You got bonus";
          if ("freeSpin" === key) return "FreeSpin: " + data;
          if ("win" === key) return "Win: " + util.string.formatMoney(data);
          if ("autoSpin" === key) return "Auto spin: " + data;
          return "";
        };
        if (lbStatusTitle.string !== gameName) {
          lbStatusTitle.node.stopAllActions();
          lbStatusTitle.node.runAction(cc.sequence(cc.moveBy(.15, cc.v2(0, 20)), cc.callFunc(function() {
            if (!lbStatusTitle) return;
            lbStatusTitle.string = gameName;
            lbStatusTitle.node.y = 37;
            lbStatusTitle.node.opacity || (lbStatusTitle.node.opacity = 255);
          }), cc.moveTo(.15, cc.v2(0, 17)), cc.delayTime(1)));
        }
        lbStatus.node.stopAllActions();
        lbStatus.node.runAction(cc.repeat(cc.sequence(cc.moveBy(.15, cc.v2(0, -20)), cc.callFunc(function() {
          if (!lbStatus) return;
          lbStatus.string = getStatus(statusArray[0]);
          lbStatus.node.y = -20;
          statusArray = statusArray.slice(1);
          lbStatus.node.opacity || (lbStatus.node.opacity = 255);
        }), cc.moveTo(.15, cc.v2(0, -1.7)), cc.delayTime(1)), statusArray.length));
      };
      TopBarController.prototype.showMenu = function() {
        var overlay = this.menu.getChildByName("overlay");
        var menu = this.menu.getChildByName("mask").getChildByName("bg");
        var payTable = menu.getChildByName("payTable");
        var fullScreen = menu.getChildByName("fullScreen");
        var rate = menu.getChildByName("rate");
        menu.active = true;
        payTable.active = this.barType == BAR_TYPE.GAME;
        fullScreen.active = game.data.deviceOs == define.type.DEVICE_OS.WEB_PC;
        rate.active = cc.sys.isNative;
        overlay.active = true;
        menu.y = 0;
        menu.opacity = 0;
        menu.stopAllActions();
        menu.runAction(effect.moveInBy({
          time: .4,
          direction: define.type.DIRECTION.UP,
          distance: menu.height
        }));
        var btnMenu = this.node.getChildByName("btnMenu");
        var menuAct = cc.scaleTo(.25, 0).easing(cc.easeBackIn());
        btnMenu.runAction(menuAct);
        var btnClose = this.node.getChildByName("btnClose");
        btnClose.runAction(cc.sequence(cc.delayTime(menuAct.getDuration()), cc.scaleTo(.15, 1)));
      };
      TopBarController.prototype.hideMenu = function() {
        var overlay = this.menu.getChildByName("overlay");
        var menu = this.menu.getChildByName("mask").getChildByName("bg");
        overlay.active = false;
        menu.stopAllActions();
        menu.runAction(effect.moveOutBy({
          time: .2,
          direction: define.type.DIRECTION.UP,
          distance: menu.height,
          callback: function() {
            menu && (menu.active = false);
          }
        }));
        var btnClose = this.node.getChildByName("btnClose");
        var closeAct = cc.scaleTo(.25, 0).easing(cc.easeBackIn());
        btnClose.runAction(closeAct);
        var btnMenu = this.node.getChildByName("btnMenu");
        btnMenu.runAction(cc.sequence(cc.delayTime(closeAct.getDuration()), cc.scaleTo(.15, 1)));
      };
      TopBarController.prototype.onClickBuy = function() {
        game.log("TopBarController", "onClickBuy");
        game.log(this.tag, "onClickBuy");
        controller.ui.showPopup("shop");
      };
      TopBarController.prototype.onClickDeal = function() {
        game.log(this.tag, "onClickDeal");
        var data = game.data.shop.DEAL_SHOP;
        if (!data || new Date(data.expire) <= util.game.date() || data.isTaken || !data.productId) return;
        controller.ui.showDialog({
          title: "Deal",
          type: define.type.DIALOG_TYPE.HIGH,
          name: "iap_msg",
          message: {
            message: "Current value: " + data.displayInfo.currValue + "\nOld value: " + data.displayInfo.currValue + "\nPrice: " + data.displayInfo.price + "\nSale: " + data.displayInfo.salePercent
          },
          buttons: [ {
            title: "Cancel",
            theme: define.type.CLASS_THEME.DANGER
          }, {
            title: "OK",
            theme: define.type.CLASS_THEME.SUCCESS,
            callback: function() {
              var item = {
                type: define.type.ESHOP.DEAL_SHOP,
                id: data.productId
              };
              platform.iap.itemBuying = item;
              tracking.send(tracking.event.IAP_PURCHASE_DEAL, item);
              platform.iap.purchaseByProductID(data.productId);
            }
          } ]
        });
      };
      TopBarController.prototype.onClickMulti = function() {
        game.log("TopBarController", "onClickMulti");
        game.log(this.tag, "onClickMulti");
        view.multi.toggleButton();
      };
      TopBarController.prototype.onClickMenu = function() {
        game.log("TopBarController", "onClickMenu");
        this.showMenu();
      };
      TopBarController.prototype.onClickBack = function() {
        game.log("TopBarController", "onClickBack");
        if (view.screen.slot) {
          tracking.send(tracking.event.BACK_GAME);
          controller.ui.deleteSlot();
        }
      };
      TopBarController.prototype.onClickFullScreen = function() {
        game.log("TopBarController", "onClickFullScreen");
        var menu = this.menu.getChildByName("mask").getChildByName("bg");
        var fullScreen = menu.getChildByName("fullScreen");
        var text = fullScreen.getChildByName("text").getComponent(cc.Label);
        var screen = cc.screen;
        screen.fullScreen() ? screen.exitFullScreen() : screen.requestFullScreen();
        text.string = screen.fullScreen() ? "Fullscreen" : "Minimize";
      };
      TopBarController.prototype.onClickPayTable = function() {
        game.log("TopBarController", "onClickPayTable");
        view.screen.slot && view.screen.slot.SlotController && view.screen.slot.SlotController.showPayTable();
      };
      TopBarController.prototype.onClickRateUs = function() {
        game.log("TopBarController", "onClickRateUs");
        tracking.send(tracking.event.RATE_GAME);
        var link = "";
        game.data.deviceOs === define.type.DEVICE_OS.ANDROID_NAVITE ? link = define.string.URL_STORE_ANDROID.replace("PACKAGE_NAME", game.data.packageName) : game.data.deviceOs === define.type.DEVICE_OS.IOS_NAVITE && (link = define.string.URL_STORE_IOS);
        platform.handle.openLink(link);
      };
      TopBarController.prototype.onClickShare = function() {
        game.log("TopBarController", "onClickShare");
        var title = "#gamehayvailoan";
        if (cc.sys.isBrowser) platform.facebook.share({
          link: document.URL,
          title: title
        }); else {
          var path = platform.handle.screenshot().path;
          platform.facebook.sharePhoto({
            title: title,
            image: path
          });
        }
      };
      TopBarController.prototype.onClickSetting = function() {
        game.log("TopBarController", "onClickSetting");
        controller.ui.showPopup("setting");
      };
      TopBarController.prototype.onClickAbout = function() {
        game.log("TopBarController", "onClickAbout");
      };
      TopBarController.prototype.onDestroy = function() {
        this.keyList.forEach(function(key) {
          return store.unRegister(key);
        });
      };
      __decorate([ property(Avatar_1.default) ], TopBarController.prototype, "avt", void 0);
      __decorate([ property(cc.Node) ], TopBarController.prototype, "btnBack", void 0);
      __decorate([ property(cc.Label) ], TopBarController.prototype, "lbCoin", void 0);
      __decorate([ property(AccumulatedBar_1.default) ], TopBarController.prototype, "barExp", void 0);
      __decorate([ property(cc.Label) ], TopBarController.prototype, "lbLevel", void 0);
      __decorate([ property(cc.Node) ], TopBarController.prototype, "nodeStatus", void 0);
      __decorate([ property(cc.Node) ], TopBarController.prototype, "nodeBuyDeal", void 0);
      __decorate([ property(cc.Node) ], TopBarController.prototype, "nodeBuyFull", void 0);
      __decorate([ property(cc.Label) ], TopBarController.prototype, "lbDeal", void 0);
      __decorate([ property(cc.Node) ], TopBarController.prototype, "menu", void 0);
      TopBarController = __decorate([ ccclass ], TopBarController);
      return TopBarController;
    }(cc.Component);
    exports.default = TopBarController;
    cc._RF.pop();
  }, {
    "../Components/AccumulatedBar": "AccumulatedBar",
    "../Components/Avatar": "Avatar",
    "../Components/CoinLabel": "CoinLabel"
  } ],
  Tracking: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "12ed9cBbf1OXK7zjE/tJG4B", "Tracking");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineKey_1 = require("./Define/DefineKey");
    var Tracking = function() {
      function Tracking() {
        this.event = void 0;
      }
      Tracking.ins = function() {
        if (!this.instance) {
          this.instance = new Tracking();
          this.instance.event = DefineKey_1.track;
        }
        return this.instance;
      };
      Tracking.prototype.setUserID = function(userID) {
        try {
          game.logTracking("setUserID", userID);
          platform.firebase.setUserID(userID);
        } catch (e) {
          game.error(e);
        }
      };
      Tracking.prototype.send = function(event, params) {
        try {
          game.logTracking("send", event, params);
          var os = "unknow";
          game.data.deviceOs == define.type.DEVICE_OS.ANDROID_NAVITE ? os = "android" : game.data.deviceOs == define.type.DEVICE_OS.IOS_NAVITE ? os = "ios" : game.data.deviceOs == define.type.DEVICE_OS.WEB_MOBILE ? os = "webmobile" : game.data.deviceOs == define.type.DEVICE_OS.WEB_PC && (os = "webpc");
          var ver = game.data.versionGame;
          var verOs = game.data.versionOS;
          var deviceID = game.data.deviceId;
          params = params || {};
          params.os = os;
          params.version = ver;
          params.os_version = verOs;
          params.deviceID = deviceID;
          platform.firebase.sendLogEvent(event.replace(/\./g, "_"), params);
          platform.facebook.sendLogEvent((os + "_" + ver + "_" + event).replace(/\./g, "_"));
        } catch (e) {
          game.error(e);
        }
      };
      Tracking.prototype.purchase = function(mount, currency) {
        try {
          game.logTracking("purchase", mount, currency);
          platform.facebook.sendLogPurchase(mount, currency);
        } catch (e) {
          game.error(e);
        }
      };
      Tracking.instance = void 0;
      return Tracking;
    }();
    exports.default = Tracking;
    cc._RF.pop();
  }, {
    "./Define/DefineKey": "DefineKey"
  } ],
  UIController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b5626ARq+VCVp5u2EAHN17N", "UIController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineType_1 = require("./Define/DefineType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var PopupData = function() {
      function PopupData() {
        this.name = "";
        this.prefab = void 0;
        this.componentName = "";
      }
      __decorate([ property({
        tooltip: "Name of popup, to open popup by name, view can view instance of popup in view.popup[name]"
      }) ], PopupData.prototype, "name", void 0);
      __decorate([ property({
        type: cc.Prefab,
        tooltip: "Prefab of popup with popup name"
      }) ], PopupData.prototype, "prefab", void 0);
      __decorate([ property({
        tooltip: "Component name of popup prefab"
      }) ], PopupData.prototype, "componentName", void 0);
      PopupData = __decorate([ ccclass("PopupData") ], PopupData);
      return PopupData;
    }();
    exports.PopupData = PopupData;
    var AnimationPrefabData = function() {
      function AnimationPrefabData() {
        this.name = "";
        this.prefab = void 0;
        this.componentName = "";
      }
      __decorate([ property({
        tooltip: "Name of popup, to open popup by name, view can view instance of popup in view.popup[name]"
      }) ], AnimationPrefabData.prototype, "name", void 0);
      __decorate([ property({
        type: cc.Prefab,
        tooltip: "Prefab of popup with popup name"
      }) ], AnimationPrefabData.prototype, "prefab", void 0);
      __decorate([ property({
        tooltip: "Component name of popup prefab"
      }) ], AnimationPrefabData.prototype, "componentName", void 0);
      AnimationPrefabData = __decorate([ ccclass("AnimationPrefabData") ], AnimationPrefabData);
      return AnimationPrefabData;
    }();
    exports.AnimationPrefabData = AnimationPrefabData;
    var AnimationPrefab = function() {
      function AnimationPrefab() {
        this.layout = null;
        this.data = [];
      }
      __decorate([ property(cc.Prefab) ], AnimationPrefab.prototype, "layout", void 0);
      __decorate([ property([ AnimationPrefabData ]) ], AnimationPrefab.prototype, "data", void 0);
      AnimationPrefab = __decorate([ ccclass("AnimationPrefab") ], AnimationPrefab);
      return AnimationPrefab;
    }();
    exports.AnimationPrefab = AnimationPrefab;
    var Component = function() {
      function Component() {}
      Component = __decorate([ ccclass("Component") ], Component);
      return Component;
    }();
    exports.Component = Component;
    var GamePrefab = function() {
      function GamePrefab() {
        this.loadingScene = null;
        this.homeScene = null;
        this.gameScene = null;
        this.wheelGold = null;
        this.wheelSilver = null;
        this.dialog = null;
        this.shortLoading = null;
        this.animation = new AnimationPrefab();
        this.component = new Component();
        this.popupData = [];
      }
      __decorate([ property(cc.Prefab) ], GamePrefab.prototype, "loadingScene", void 0);
      __decorate([ property(cc.Prefab) ], GamePrefab.prototype, "homeScene", void 0);
      __decorate([ property(cc.Prefab) ], GamePrefab.prototype, "gameScene", void 0);
      __decorate([ property(cc.Prefab) ], GamePrefab.prototype, "wheelGold", void 0);
      __decorate([ property(cc.Prefab) ], GamePrefab.prototype, "wheelSilver", void 0);
      __decorate([ property(cc.Prefab) ], GamePrefab.prototype, "dialog", void 0);
      __decorate([ property(cc.Prefab) ], GamePrefab.prototype, "shortLoading", void 0);
      __decorate([ property(AnimationPrefab) ], GamePrefab.prototype, "animation", void 0);
      __decorate([ property(Component) ], GamePrefab.prototype, "component", void 0);
      __decorate([ property({
        type: PopupData
      }) ], GamePrefab.prototype, "popupData", void 0);
      GamePrefab = __decorate([ ccclass("GamePrefab") ], GamePrefab);
      return GamePrefab;
    }();
    exports.GamePrefab = GamePrefab;
    var SlotGameData = function() {
      function SlotGameData() {
        this.img = null;
        this.icon = null;
        this.prefab = null;
      }
      __decorate([ property(cc.SpriteFrame) ], SlotGameData.prototype, "img", void 0);
      __decorate([ property(cc.SpriteFrame) ], SlotGameData.prototype, "icon", void 0);
      __decorate([ property(cc.Prefab) ], SlotGameData.prototype, "prefab", void 0);
      SlotGameData = __decorate([ ccclass("SlotGameData") ], SlotGameData);
      return SlotGameData;
    }();
    exports.SlotGameData = SlotGameData;
    var UIController = function(_super) {
      __extends(UIController, _super);
      function UIController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.prefab = new GamePrefab();
        _this.slot = [];
        _this.onView = null;
        _this.canvas = null;
        _this.animPromise = new Promise(function(res, rej) {
          res();
        });
        return _this;
      }
      UIController.prototype.onLoad = function() {
        this.canvas = cc.director.getScene().getChildByName("Canvas");
        this.initialize();
      };
      UIController.prototype.initialize = function() {
        cc.game.addPersistRootNode(this.node);
        view.multi.node.zIndex = define.zIndex.MULTI;
        view.bar.node.zIndex = define.zIndex.BAR;
        view.screen.model.zIndex = define.zIndex.MODEL;
        var _a = cc.view.getFrameSize(), width = _a.width, height = _a.height;
        var screenRatio = width / height;
        screenRatio > 2 ? game.data.deviceKind = define.type.Device.IPHONEX : screenRatio < 1.5 && (game.data.deviceKind = define.type.Device.IPAD);
      };
      UIController.prototype.openLoadingScene = function() {
        game.log("UIController", "openLoadingScene");
        if (!view.screen.loading) {
          view.screen.loading = cc.instantiate(this.prefab.loadingScene).getComponent("LoadingScene");
          view.screen.loading.node.zIndex = define.zIndex.HOME;
          view.screen.loading.node.parent = this.canvas;
        }
      };
      UIController.prototype.openHomeScene = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              game.log("UIController", "openHomeScene");
              tracking.send(tracking.event.OPEN_HOME);
              view.screen.loading && view.screen.loading.onRelease();
              this.onView = DefineType_1.VIEW.HOME;
              this.updateBar();
              return [ 4, this.showBar() ];

             case 1:
              _a.sent();
              if (!view.screen.home) {
                view.screen.home = cc.instantiate(this.prefab.homeScene).getComponent("HomeScene");
                view.screen.home.node.zIndex = define.zIndex.HOME;
                view.screen.home.node.parent = this.canvas;
              }
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.openGame = function(slotIcon, id, smid) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              game.log("UIController", "openGame");
              tracking.send(tracking.event.OPEN_GAME);
              if (view.screen.game) {
                util.game.showNode(view.screen.game.node, define.zIndex.GAME);
                view.screen.game.node.position = cc.v2(0, 0);
              } else {
                view.screen.game = cc.instantiate(this.prefab.gameScene).getComponent("GameScene");
                view.screen.game.node.zIndex = define.zIndex.GAME;
                view.screen.game.node.parent = this.canvas;
              }
              this.onView = DefineType_1.VIEW.GAME;
              return [ 4, this.openSlot(slotIcon, id) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.resumeGame = function() {
        game.log("UIController", "resumeGame");
        if (!view.screen.game) {
          cc.warn("Please open game before open slot");
          return;
        }
        var gameView = view.screen.game;
        var slotNode = view.screen.slot.SlotNode;
        slotNode.parent = gameView.node;
        slotNode.active = true;
        slotNode.opacity = 0;
        slotNode.zIndex = 0;
        slotNode.runAction(cc.fadeIn(.5));
        view.multi.loadContent();
        this.onView = DefineType_1.VIEW.GAME;
        this.updateBar();
      };
      UIController.prototype.minimizeGameScene = function() {
        var _this = this;
        tracking.send(tracking.event.MINIMIZE_GAME);
        game.log("UIController", "minimizeGameScene");
        if (!view.screen.game) {
          cc.warn("Please open game before open slot");
          return;
        }
        var gameView = view.screen.game;
        this.onView = DefineType_1.VIEW.HOME;
        this.updateBar();
        view.screen.slot.SlotNode.runAction(cc.sequence(cc.callFunc(function() {
          var multi = view.multi;
          gameView.node.runAction(cc.scaleTo(.2, .1));
          gameView.node.runAction(cc.moveTo(.3, cc.v2(multi.node.x, multi.node.y + multi.content.height)));
        }), cc.delayTime(.3), cc.callFunc(function() {
          util.game.hideNode(gameView.node);
          gameView.node.position = cc.v2(cc.winSize.width, 0);
          gameView.node.scale = 1;
        }), cc.delayTime(.01), cc.callFunc(function() {
          gameView.hideBg(.01);
        }), cc.delayTime(.01), cc.callFunc(function() {
          view.screen.slot.SlotController.hideContent();
          util.game.hideNode(view.screen.slot.SlotNode);
          view.screen.slot = null;
          view.multi.loadContent();
          _this.unlockBar();
        })));
      };
      UIController.prototype.openWheelBonus = function(type, data) {
        game.log("UIController", "openWheelBonus");
        if (view.screen.wheelBonus) {
          cc.warn("UIController", "openWheelBonus", "wheel bonus is opening");
          return;
        }
        tracking.send(tracking.event.OPEN_WHEEL);
        var pre = void 0;
        var com = "";
        if (type === DefineType_1.WHEEL_BONUS.GOLD) {
          pre = this.prefab.wheelGold;
          com = "WheelGold";
        } else {
          if (type !== DefineType_1.WHEEL_BONUS.SILVER) return game.log(type + " wasn't defined in type");
          pre = this.prefab.wheelSilver;
          com = "WheelSilver";
        }
        view.screen.wheelBonus = cc.instantiate(pre).getComponent(com);
        view.screen.wheelBonus.init(data);
        view.screen.wheelBonus.node.parent = this.canvas;
        view.screen.wheelBonus.node.zIndex = define.zIndex.GAME;
        this.hideBar();
      };
      UIController.prototype.closeWheelBonus = function() {
        return __awaiter(this, void 0, void 0, function() {
          var bonus;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              game.log("UIController", "closeWheelBonus");
              bonus = view.screen.wheelBonus;
              if (!bonus) return [ 2 ];
              return [ 4, bonus.onClose() ];

             case 1:
              _a.sent();
              bonus && bonus.node && bonus.node.destroy();
              view.screen.wheelBonus = void 0;
              controller.ui.showBar();
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.openSlot = function(slotIcon, id) {
        return __awaiter(this, void 0, void 0, function() {
          var date, slotData, slotScene, resourceReady, progressFunc, error_1;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _a.trys.push([ 0, 5, , 6 ]);
              date = Date.now();
              game.log("START");
              game.log("UIController", "openSlot");
              if (!view.screen.game) {
                cc.warn("Please open game before open slot");
                return [ 2 ];
              }
              slotData = view.slot[id];
              if (slotData) {
                this.resumeSlot(slotData.uuid, slotData.id);
                return [ 2 ];
              }
              view.screen.game.btnMini && (view.screen.game.btnMini.node.scale = 0);
              return [ 4, this.instantiateSlot(id) ];

             case 1:
              slotScene = _a.sent();
              game.log("INTANTIATED SLOT", Date.now() - date);
              resourceReady = slotScene.SlotController.checkResources();
              if (!!resourceReady) return [ 3, 3 ];
              this.onView = DefineType_1.VIEW.HOME;
              util.game.hideNode(view.screen.game.node);
              view.screen.game.hideBg(.01);
              progressFunc = slotIcon.initDownloadProgress();
              return [ 4, slotScene.SlotController.downloadResources(progressFunc) ];

             case 2:
              _a.sent();
              slotIcon.removeDownloadProgress();
              return [ 2 ];

             case 3:
              game.log("OPEN SHORT", Date.now() - date);
              this.openShortLoading();
              game.log("OPEN SHORT DONE", Date.now() - date);
              view.slot[id] = slotScene;
              view.screen.slot = slotScene;
              return [ 4, slotScene.SlotController.getInfoAndResource() ];

             case 4:
              _a.sent();
              game.log("CLOSE SHORT", Date.now() - date);
              this.closeShortLoading();
              this.updateBar();
              view.screen.game.loadBgSlot(id);
              util.game.showNode(this.node, define.zIndex.GAME);
              this.node.position = cc.v2(0, 0);
              view.screen.game.onOpen();
              tracking.send(tracking.event.OPEN_SLOT.replace("SMID", view.screen.slot.gameId));
              return [ 3, 6 ];

             case 5:
              error_1 = _a.sent();
              cc.log("open slot fail", error_1);
              return [ 2 ];

             case 6:
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.resumeSlot = function(uuid, id) {
        return __awaiter(this, void 0, void 0, function() {
          var gameView, statusGame;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              game.log("UIController", "resumeSlot");
              if (!view.screen.game) {
                cc.warn("Please open game before open slot");
                return [ 2 ];
              }
              gameView = view.screen.game;
              util.game.hideNode(gameView.node);
              view.screen.slot = Object.values(view.slot).find(function(item) {
                return item && item.uuid == uuid;
              });
              statusGame = view.screen.slot.SlotController.statusGame;
              statusGame && view.bar.bottom.gameBar.updateStatus(statusGame);
              return [ 4, gameView.loadBgSlot(id) ];

             case 1:
              _a.sent();
              gameView.bigBg.node.runAction(cc.sequence([ cc.moveBy(.01, cc.v2(0, gameView.bigBg.node.height * (1 === game.data.deviceKind ? 1.5 : 1.2))).easing(cc.easeSineOut()), cc.callFunc(function() {
                view.bar.bottom.gameBar.updateInfo();
                _this.resumeGame();
                gameView.onResume();
              }), cc.delayTime(.2), cc.callFunc(function() {
                view.screen.slot.SlotController.showContent();
                view.screen.slot.SlotController.checkShowBonusDialog();
                tracking.send(tracking.event.OPEN_SLOT.replace("SMID", view.screen.slot.gameId));
              }) ]));
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.switchSlot = function(uuid, id) {
        game.log("UIController", "switchSlot");
        if (!view.screen.game) {
          cc.warn("Please open game before open slot");
          return;
        }
        var gameView = view.screen.game;
        var slotScene = Object.values(view.slot).find(function(item) {
          return item && item.uuid == uuid;
        });
        gameView.bigBg.node.active = true;
        gameView.bigBg.spriteFrame = slotScene.SlotController.resourceController.getSprite("bg-big");
        util.game.hideNode(view.screen.slot.SlotNode);
        view.screen.slot = slotScene;
        util.game.showNode(view.screen.slot.SlotNode);
        view.bar.bottom.gameBar.updateInfo();
        view.screen.game.node.position = cc.v2(0, 0);
        view.screen.slot.SlotNode.opacity = 0;
        view.screen.slot.SlotNode.runAction(cc.fadeIn(.5));
        view.screen.slot.SlotController.showContent();
        view.screen.slot.SlotController.checkShowBonusDialog();
        var statusGame = view.screen.slot.SlotController.statusGame;
        statusGame && view.bar.bottom.gameBar.updateStatus(statusGame);
        tracking.send(tracking.event.OPEN_SLOT.replace("SMID", view.screen.slot.gameId));
      };
      UIController.prototype.deleteSlot = function(id) {
        return __awaiter(this, void 0, void 0, function() {
          var slot;
          return __generator(this, function(_a) {
            game.log("UIController", "deleteSlot");
            if (!view.screen.game) {
              cc.warn("Please open game before open slot");
              return [ 2 ];
            }
            if (!id || view.screen.slot && id === view.screen.slot.id) {
              id = view.screen.slot.id;
              this.onView = DefineType_1.VIEW.HOME;
              view.slot[id] && (view.slot[id] = void 0);
              view.screen.slot.SlotController.hideContent();
              view.screen.game.onClose();
            } else if (view.slot[id]) {
              slot = view.slot[id];
              slot.SlotNode.destroy();
              slot = null;
              view.slot[id] && (view.slot[id] = void 0);
              view.multi.loadContent();
            }
            return [ 2 ];
          });
        });
      };
      UIController.prototype.instantiateSlot = function(id) {
        return __awaiter(this, void 0, void 0, function() {
          var gameView, prefab, slotNode, slotController, slotScene;
          return __generator(this, function(_a) {
            if (!view.screen.game) {
              cc.warn("Please open game before open slot");
              return [ 2 ];
            }
            gameView = view.screen.game;
            prefab = this.slot[id - 1].prefab;
            if (null == prefab.name) return [ 2 ];
            slotNode = cc.instantiate(prefab);
            slotController = slotNode.getComponent("SlotController");
            slotScene = {
              id: id,
              gameId: slotController.gameId,
              uuid: util.game.generateUUID(),
              name: "Slot " + id,
              SlotNode: slotNode,
              SlotController: slotController
            };
            slotNode.opacity = 0;
            slotNode.parent = gameView.center;
            return [ 2, slotScene ];
          });
        });
      };
      UIController.prototype.hideBar = function(effect) {
        void 0 === effect && (effect = true);
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              game.log("UIController", "hideBar");
              return [ 4, Promise.all([ view.bar.top.hide(effect), view.bar.bottom.hide(effect) ]) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.showBar = function(effect) {
        void 0 === effect && (effect = true);
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              game.log("UIController", "showBar");
              return [ 4, Promise.all([ view.bar.top.show(effect), view.bar.bottom.show(effect) ]) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.lockBar = function() {
        game.log("UIController", "lockBar");
        view.bar.top.lock();
        view.bar.bottom.lock();
      };
      UIController.prototype.unlockBar = function() {
        game.log("UIController", "unlockBar");
        view.bar.top.unlock();
        view.bar.bottom.unlock();
      };
      UIController.prototype.updateBar = function() {
        game.log("UIController", "updateBar");
        view.bar.top.updateView();
        view.bar.bottom.updateView();
      };
      UIController.prototype.showModel = function() {
        game.log("UIController", "showModel");
        view.screen.model.active = true;
        view.screen.model.zIndex = define.zIndex.MODEL;
      };
      UIController.prototype.hideModel = function() {
        game.log("UIController", "hideModel");
        view.screen.model.active = false;
        view.screen.model.zIndex = 0;
      };
      UIController.prototype.showPopup = function(name, data) {
        tracking.send(tracking.event.POPUP_POPUPNAME_OPEN.replace("POPUPNAME", name));
        var popup = view.popup[name];
        if (popup) popup.isOpen || popup.reOpen(data); else {
          var popData = this.prefab.popupData.find(function(o) {
            return o.name === name;
          });
          if (popData) {
            popup = cc.instantiate(popData.prefab).getComponent(popData.componentName);
            popup.popupName = name;
            popup.node.x = 0;
            popup.node.y = 0;
            popup.node.parent = this.canvas;
            popup.init(data);
          } else cc.warn("UIController", "showPopup", "Can't find popup name " + name);
        }
        return popup;
      };
      UIController.prototype.showPopupPrefab = function(pop, data) {
        var popup = view.popup[pop.popupName];
        if (popup) popup.isOpen || popup.reOpen(data); else {
          popup = cc.instantiate(pop).getComponent("BasePopup");
          popup.node.x = 0;
          popup.node.y = 0;
          popup.node.parent = this.canvas;
          popup.init(data);
        }
        return popup;
      };
      UIController.prototype.closePopup = function(name) {
        var popup = view.popup[name];
        popup ? popup.onClose() : cc.warn("UIController", "closePopup", "Can't find popup name " + name);
      };
      UIController.prototype.showDialog = function(option) {
        if (option && option.name && view.dialog[option.name]) {
          game.log("UIController", "showDialog", "popup existed");
          return;
        }
        var dialog = cc.instantiate(this.prefab.dialog).getComponent("Dialog");
        dialog.init(option);
        dialog.node.x = 0;
        dialog.node.y = 0;
        dialog.node.parent = option.parent || this.canvas;
        var name = option.name ? option.name : util.game.generateUUID();
        view.dialog[name] = dialog;
      };
      UIController.prototype.closeDialog = function(name) {
        var dialog = view.dialog[name];
        dialog ? dialog.onClose() : cc.warn("UIController", "closeDialog", "Can't find dialog name " + name);
      };
      UIController.prototype.playAnimation = function(option) {
        return __awaiter(this, void 0, void 0, function() {
          var animPromise;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              animPromise = this.animPromise;
              this.animPromise = new Promise(function(res, rej) {
                return __awaiter(_this, void 0, void 0, function() {
                  var animation;
                  return __generator(this, function(_a) {
                    switch (_a.label) {
                     case 0:
                      return [ 4, animPromise ];

                     case 1:
                      _a.sent();
                      animation = cc.instantiate(this.prefab.animation.layout).getComponent("EffectLayout");
                      view.animation = animation.node;
                      animation.node.parent = this.canvas;
                      animation.node.zIndex = define.zIndex.EFFECT;
                      animation.init(option);
                      return [ 4, animation.play() ];

                     case 2:
                      _a.sent();
                      res();
                      return [ 2 ];
                    }
                  });
                });
              });
              return [ 4, this.animPromise ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.playPrefabAnimation = function(name, data) {
        return __awaiter(this, void 0, void 0, function() {
          var animPromise, animationData;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              game.log("UIController", "playPrefabAnimation", name, data);
              animPromise = this.animPromise;
              animationData = this.prefab.animation.data.find(function(o) {
                return o.name == name;
              });
              animationData ? this.animPromise = new Promise(function(res, rej) {
                return __awaiter(_this, void 0, void 0, function() {
                  var animation;
                  return __generator(this, function(_a) {
                    switch (_a.label) {
                     case 0:
                      return [ 4, animPromise ];

                     case 1:
                      _a.sent();
                      animation = cc.instantiate(animationData.prefab).getComponent(animationData.componentName);
                      view.animation = animation.node;
                      animation.node.parent = this.canvas;
                      animation.node.zIndex = define.zIndex.EFFECT;
                      animation.init(data);
                      return [ 4, animation.play() ];

                     case 2:
                      _a.sent();
                      res();
                      return [ 2 ];
                    }
                  });
                });
              }) : game.log("UIController", "playPrefabAnimation", "play custom animation", name);
              return [ 4, this.animPromise ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      UIController.prototype.openShortLoading = function() {
        if (view.progress) return;
        view.progress = cc.instantiate(this.prefab.shortLoading);
        view.progress.parent = this.canvas;
        view.progress.zIndex = define.zIndex.SHORT_LOADING;
        view.progress.opacity = 0;
        view.progress.runAction(cc.fadeIn(.1));
      };
      UIController.prototype.closeShortLoading = function() {
        if (!view.progress) return;
        view.progress.runAction(cc.sequence([ cc.fadeOut(.1), cc.callFunc(function() {
          view.progress.destroy();
          view.progress = void 0;
        }) ]));
      };
      __decorate([ property(GamePrefab) ], UIController.prototype, "prefab", void 0);
      __decorate([ property([ SlotGameData ]) ], UIController.prototype, "slot", void 0);
      UIController = __decorate([ ccclass ], UIController);
      return UIController;
    }(cc.Component);
    exports.default = UIController;
    cc._RF.pop();
  }, {
    "./Define/DefineType": "DefineType"
  } ],
  UserInfoController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0983ea9pZtEF4fD8mosgb6y", "UserInfoController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var UserInfoController = function(_super) {
      __extends(UserInfoController, _super);
      function UserInfoController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.coinLabel = null;
        _this.userLevel = null;
        _this.userName = null;
        _this.userClan = null;
        _this.coinController = null;
        _this._eventList = [];
        return _this;
      }
      UserInfoController.prototype.onLoad = function() {
        this.initialize();
        this.resgisterEvent();
      };
      UserInfoController.prototype.initialize = function() {
        this.coinController = new CoinLabel_1.default(this.coinLabel);
      };
      UserInfoController.prototype.resgisterEvent = function() {
        this._eventList = [ store.register(store.key.UPDATE_USER_BALANCE, this.updateUserBalance.bind(this)) ];
      };
      UserInfoController.prototype.updateUserBalance = function(amount, option) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            this.coinController.updateUserBalance(amount, option);
            return [ 2 ];
          });
        });
      };
      UserInfoController.prototype.onDestroy = function() {
        this._eventList.forEach(function(item) {
          return store.unRegister(item);
        });
      };
      __decorate([ property(cc.Label) ], UserInfoController.prototype, "coinLabel", void 0);
      __decorate([ property(cc.Label) ], UserInfoController.prototype, "userLevel", void 0);
      __decorate([ property(cc.Label) ], UserInfoController.prototype, "userName", void 0);
      __decorate([ property(cc.Label) ], UserInfoController.prototype, "userClan", void 0);
      UserInfoController = __decorate([ ccclass ], UserInfoController);
      return UserInfoController;
    }(cc.Component);
    exports.default = UserInfoController;
    cc._RF.pop();
  }, {
    "../Components/CoinLabel": "CoinLabel"
  } ],
  WebAdmob: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "03862IC0gBJ77UNq3s5/iwm", "WebAdmob");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var WebAdmob = function() {
      function WebAdmob() {
        this.tag = "WebAdmob";
        this.isBannerShow = false;
      }
      WebAdmob.getIns = function() {
        this.intance || (this.intance = new WebAdmob());
        return this.intance;
      };
      WebAdmob.prototype.init = function() {
        game.warn(this.tag, "init method not implemented.");
      };
      WebAdmob.prototype.cache = function() {
        game.warn(this.tag, "cache method not implemented.");
      };
      WebAdmob.prototype.showBanner = function() {
        game.warn(this.tag, "showBanner method not implemented.");
      };
      WebAdmob.prototype.hideBanner = function() {
        game.warn(this.tag, "hideBanner method not implemented.");
      };
      WebAdmob.prototype.getBannerHeight = function() {
        game.warn(this.tag, "getBannerHeight method not implemented.");
        return 0;
      };
      WebAdmob.prototype.getBannerWidth = function() {
        game.warn(this.tag, "getBannerWidth method not implemented.");
        return 0;
      };
      WebAdmob.prototype.isShowBanner = function() {
        game.warn(this.tag, "isShowBanner method not implemented.");
        return false;
      };
      WebAdmob.prototype.isAvailableBanner = function() {
        game.warn(this.tag, "isAvailableBanner method not implemented.");
        return false;
      };
      WebAdmob.prototype.showInterstitial = function() {
        game.warn(this.tag, "showInterstitial method not implemented.");
      };
      WebAdmob.prototype.isAvailableInterstitial = function() {
        game.warn(this.tag, "isAvailableInterstitial method not implemented.");
        return false;
      };
      WebAdmob.prototype.showRewarded = function() {
        game.warn(this.tag, "showRewarded method not implemented.");
      };
      WebAdmob.prototype.isAvailableRewarded = function() {
        game.warn(this.tag, "isAvailableRewarded method not implemented.");
        return false;
      };
      WebAdmob.prototype.listenner = function(data) {
        game.warn(this.tag, "listenner method not implemented.");
      };
      WebAdmob.prototype.bannerListenner = function(data) {
        game.warn(this.tag, "bannerListenner method not implemented.");
      };
      WebAdmob.prototype.interstitialListenner = function(data) {
        game.warn(this.tag, "interstitialListenner method not implemented.");
      };
      WebAdmob.prototype.rewardedListenner = function(data) {
        game.warn(this.tag, "rewardedListenner method not implemented.");
      };
      WebAdmob.intance = null;
      return WebAdmob;
    }();
    exports.default = WebAdmob;
    cc._RF.pop();
  }, {} ],
  WebFacebook: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47a36XhT7BE5YPjstQExNqA", "WebFacebook");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var WebFacebook = function() {
      function WebFacebook() {
        this.tag = "WebFacebook";
        this.isLogin = false;
        this.userID = "";
        this.accessToken = "";
        this.loginCallback = void 0;
      }
      WebFacebook.getIns = function() {
        this.intance || (this.intance = new WebFacebook());
        return this.intance;
      };
      WebFacebook.prototype.init = function() {
        game.log(this.tag, "facebook", "init");
        window.fbAsyncInit = function() {
          FB.init({
            appId: "2695783060451481",
            autoLogAppEvents: true,
            xfbml: true,
            version: "v3.2"
          });
          FB.AppEvents.setAppVersion(game.data.versionGame);
        };
        var id = "facebook-jssdk";
        var sdkUrl = "https://connect.facebook.net/en_US/sdk.js";
        var firstScript = document.getElementsByTagName("script")[0];
        if (document.getElementById(id)) return true;
        var newScript = document.createElement("script");
        newScript.id = id;
        newScript.src = sdkUrl;
        firstScript.parentNode.insertBefore(newScript, firstScript);
        return true;
      };
      WebFacebook.prototype.login = function() {
        var _this = this;
        game.log(this.tag, "facebook", "login");
        tracking.send(tracking.event.FACEBOOK_LOGIN_CLICK);
        return new Promise(function(res, rej) {
          FB.login(function(response) {
            if ("connected" === response.status) {
              if (this) {
                this.isLogin = true;
                this.accessToken = response.authResponse.accessToken;
                this.userID = response.authResponse.userID;
                this.listenner({
                  type: define.type.FACEBOOK_LISTENNER.LOGIN,
                  isLogin: true,
                  msg: ""
                });
              }
            } else game.log("The person is not logged into this app or we are unable to tell.");
          }.bind(_this), {
            scope: "public_profile, email"
          });
          _this.loginCallback = function() {
            res(platform.facebook.getAccessToken());
          };
        });
      };
      WebFacebook.prototype.logout = function() {
        game.log(this.tag, "facebook", "logout");
        FB.logout();
        this.isLogin = false;
      };
      WebFacebook.prototype.isLoggedIn = function() {
        var isLogin = this.isLogin;
        game.log(this.tag, "facebook", "is login", isLogin);
        return isLogin;
      };
      WebFacebook.prototype.getUserID = function() {
        var userId = this.userID;
        game.log(this.tag, "facebook", "userId: ", userId);
        return FB.getUserID();
      };
      WebFacebook.prototype.getAccessToken = function() {
        var tokken = this.accessToken;
        game.log(this.tag, "facebook", "tokken: ", tokken);
        return FB.getAccessToken();
      };
      WebFacebook.prototype.shareHandle = function(option) {
        if (!option) return;
        if (!option.type) return;
        tracking.send(tracking.event.FACEBOOK_SHARE_CLICK);
        var image = option.image, type = option.type, link = option.link, text = option.text, title = option.title;
        game.log(this.tag, "facebook", "share handle", option);
        FB.ui({
          method: "share",
          href: link,
          hashtag: title,
          quote: text
        }, function(response) {
          "error_message" === response ? this.listenner({
            type: define.type.FACEBOOK_LISTENNER.SHARED_FAILED,
            data: {}
          }) : response ? this.listenner({
            type: define.type.FACEBOOK_LISTENNER.SHARED_SUCCESS,
            data: response
          }) : this.listenner({
            type: define.type.FACEBOOK_LISTENNER.SHARED_CANCEL
          });
        }.bind(this));
      };
      WebFacebook.prototype.share = function(option) {
        this.shareHandle(__assign({
          type: "link"
        }, option));
      };
      WebFacebook.prototype.sharePhoto = function(option) {
        this.shareHandle(__assign({
          type: "photo"
        }, option));
      };
      WebFacebook.prototype.sendLogEvent = function(eventName, valueToSum) {
        if ("undefined" == typeof FB) return game.log(this.tag, "sendLogEvent", "facebook wasn't init");
        game.log(this.tag, "facebook", "send log event", eventName, valueToSum);
        "undefined" === typeof valueToSum ? FB.AppEvents.logEvent(eventName) : FB.AppEvents.logEvent(eventName, valueToSum);
      };
      WebFacebook.prototype.sendLogPurchase = function(mount, currency) {
        game.log(this.tag, "facebook", "send log purchase", mount, currency);
        FB.AppEvents.logPurchase(mount, currency);
      };
      WebFacebook.prototype.openGroup = function() {
        game.log(this.tag, "facebook", "openGroup");
        platform.handle.openLink(define.string.URL_GROUP.replace("GROUPID", game.data.groupFB));
      };
      WebFacebook.prototype.openFanpage = function() {
        game.log(this.tag, "facebook", "openFanpage");
        platform.handle.openLink(define.string.URL_FANPAGE.replace("PAGEID", game.data.fanpage));
      };
      WebFacebook.prototype.listenner = function(data) {
        var _this = this;
        if (!data) return;
        if (!data.type) return;
        switch (data.type) {
         case define.type.FACEBOOK_LISTENNER.LOGIN:
          game.log(this.tag, "facebook listenner", "LOGIN", "isLogin: " + data.isLogin + " - msg: " + data.msg);
          var strLoginData = cc.sys.localStorage.getItem(define.key.local.LOGIN_DATA.replace("IP", api.HOST)) || JSON.stringify({
            expires: void 0,
            token: "",
            type: 0,
            uid: 0
          });
          var loginData = JSON.parse(strLoginData);
          loginData.type !== define.type.LOGIN_TYPE.FACEBOOK ? api.sendGD({
            e: "connectFB",
            accessToken: platform.facebook.getAccessToken()
          }, function(err, data) {
            if (err) return game.error(err);
            var setNewLoginData = function(cb) {
              api.getToken({
                type: define.type.LOGIN_TYPE.FACEBOOK,
                data: platform.facebook.getAccessToken()
              }).then(function(data) {
                var loginData = {
                  expires: data.expires,
                  token: data.token,
                  type: define.type.LOGIN_TYPE.FACEBOOK,
                  uid: data.uid
                };
                cc.sys.localStorage.setItem(define.key.local.LOGIN_DATA.replace("IP", api.HOST), JSON.stringify(loginData));
                cb && cb();
              });
            };
            switch (data.code) {
             case 402:
              game.log(_this.tag, "Login FB success", "need merge facebook", data);
              controller.ui.showDialog({
                title: "Account already exists",
                name: "facebook_accout_exists",
                message: {
                  message: data.message
                },
                buttons: [ {
                  title: "Cancel",
                  theme: define.type.CLASS_THEME.DANGER
                }, {
                  title: "OK",
                  theme: define.type.CLASS_THEME.SUCCESS,
                  callback: function() {
                    api.sendGD({
                      e: "confirmMergeFB",
                      uid: game.user.id
                    }, function(err, data) {
                      if (err) return game.error(err);
                      if ("success" === data) {
                        game.log(_this.tag, "Login FB success", "merge facebook success");
                        setNewLoginData(function() {
                          cc.game.restart();
                        });
                      } else game.error("Cai nay chua lam");
                    });
                  }
                }, {
                  title: "Another\nAccount",
                  theme: define.type.CLASS_THEME.SUCCESS,
                  callback: function() {
                    _this.isLogin = false;
                    FB.logout(function(res) {
                      _this.login();
                    });
                  }
                } ]
              });
              break;

             case 401:
              game.log(_this.tag, "Login FB success", "facebook loged");
              controller.ui.showDialog({
                title: "Alert",
                name: "facebook_accout_logged",
                message: {
                  message: "Your account has been logged on this device"
                },
                buttons: [ {
                  title: "Confirm",
                  theme: define.type.CLASS_THEME.DANGER
                } ]
              });
              break;

             default:
              controller.ui.showDialog({
                title: "Messaage",
                name: "facebook_success",
                message: {
                  message: "Loggin facebook success"
                },
                buttons: [ {
                  title: "OK",
                  theme: define.type.CLASS_THEME.SUCCESS
                } ]
              });
              setNewLoginData(function() {
                _this.loginCallback && _this.loginCallback();
              });
              game.user.fbid = platform.facebook.getUserID();
              store.emit(store.key.UPDATE_USER_AVATAR, "");
            }
          }) : this.loginCallback && this.loginCallback();
          break;

         case define.type.FACEBOOK_LISTENNER.API:
          game.log(this.tag, "facebook listenner", "API", "tag: " + data.tag + " - data: " + data.data);
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_SUCCESS:
          game.log(this.tag, "facebook listenner", "SHARED_SUCCESS", "data: " + data.data);
          tracking.send(tracking.event.FACEBOOK_SHARE_SUCCESS);
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_FAILED:
          game.log(this.tag, "facebook listenner", "SHARED_FAILED", "data: " + data.data);
          tracking.send(tracking.event.FACEBOOK_SHARE_FAILED);
          break;

         case define.type.FACEBOOK_LISTENNER.SHARED_CANCEL:
          game.log(this.tag, "facebook listenner", "SHARED_CANCEL");
          tracking.send(tracking.event.FACEBOOK_SHARE_CANCELED);
          break;

         case define.type.FACEBOOK_LISTENNER.PERMISSON:
          game.log(this.tag, "facebook listenner", "LOGIN", "isLogin: " + data.isLogin + " - msg: " + data.msg);
          break;

         case define.type.FACEBOOK_LISTENNER.FETCHFRIENDS:
          game.log(this.tag, "facebook listenner", "FETCHFRIENDS");
          break;

         case define.type.FACEBOOK_LISTENNER.REQUESTINVITABLEFRIENDS:
          game.log(this.tag, "facebook listenner", "REQUESTINVITABLEFRIENDS");
          break;

         case define.type.FACEBOOK_LISTENNER.INVITEFRIENDSWITHINVITEIDSRESULT:
          game.log(this.tag, "facebook listenner", "INVITEFRIENDSWITHINVITEIDSRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.INVITEFRIENDSRESULT:
          game.log(this.tag, "facebook listenner", "INVITEFRIENDSRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.GETUSERINFO:
          game.log(this.tag, "facebook listenner", "GETUSERINFO");
          break;

         case define.type.FACEBOOK_LISTENNER.REQUESTGIFTRESULT:
          game.log(this.tag, "facebook listenner", "REQUESTGIFTRESULT");
          break;

         case define.type.FACEBOOK_LISTENNER.SENDGIFTRESULT:
          game.log(this.tag, "facebook listenner", "SENDGIFTRESULT");
          break;

         default:
          game.log(this.tag, "facebook listenner", "UNKNOW");
        }
      };
      WebFacebook.intance = null;
      return WebFacebook;
    }();
    exports.default = WebFacebook;
    cc._RF.pop();
  }, {} ],
  WebFirebase: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a4e22IfrqNGxZweA8enIzCo", "WebFirebase");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var WebFirebase = function() {
      function WebFirebase() {
        this.tag = "WebFirebase";
      }
      WebFirebase.getIns = function() {
        this.intance || (this.intance = new WebFirebase());
        return this.intance;
      };
      WebFirebase.prototype.init = function() {
        game.log(this.tag, "firebase", "init");
        var id = "firebase-jssdk";
        var sdkUrl = "https://www.gstatic.com/firebasejs/6.3.5/firebase-app.js";
        var firstScript = document.getElementsByTagName("script")[0];
        if (document.getElementById(id)) return;
        var newScript = document.createElement("script");
        newScript.id = id;
        newScript.src = sdkUrl;
        firstScript.parentNode.insertBefore(newScript, firstScript);
        var init = function() {
          setTimeout(function() {
            if ("function" !== typeof window.firebase) init(); else {
              var firebaseConfig = {
                apiKey: "AIzaSyDqGlZbdfRM0krQxR2JSNys3eiRls9LtYQ",
                authDomain: "slotpro-fb650.firebaseapp.com",
                databaseURL: "https://slotpro-fb650.firebaseio.com",
                projectId: "slotpro-fb650",
                storageBucket: "",
                messagingSenderId: "634306148939",
                appId: "1:634306148939:web:1a69baefffe991dc"
              };
              window.firebase.initializeApp(firebaseConfig);
            }
          }, 2e3);
        };
        init();
        return true;
      };
      WebFirebase.prototype.sendLogEvent = function(event, params) {};
      WebFirebase.prototype.getVersion = function() {
        game.warn(this.tag, "getVersion method not implemented.");
        return "";
      };
      WebFirebase.prototype.setUserProperty = function(name, value) {
        game.warn(this.tag, "setUserProperty method not implemented.");
      };
      WebFirebase.prototype.setUserID = function(userID) {
        game.warn(this.tag, "setUserID method not implemented.");
      };
      WebFirebase.prototype.setScreenName = function(screen, screenClass) {
        game.warn(this.tag, "setScreenName method not implemented.");
      };
      WebFirebase.prototype.resetAnalyticsData = function() {
        game.warn(this.tag, "resetAnalyticsData method not implemented.");
      };
      WebFirebase.prototype.setAnalyticsCollectionEnabled = function(enable) {
        game.warn(this.tag, "setAnalyticsCollectionEnabled method not implemented.");
      };
      WebFirebase.intance = null;
      return WebFirebase;
    }();
    exports.default = WebFirebase;
    cc._RF.pop();
  }, {} ],
  WebHandle: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8ac8eHg8sVLvqoru3uKEe9e", "WebHandle");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DefineKey_1 = require("../../Define/DefineKey");
    var WebHandle = function() {
      function WebHandle() {
        this.tag = "WebHandle";
        this.package = "com.sloto.mania";
        this.version = "1.0";
      }
      WebHandle.getIns = function() {
        this.intance || (this.intance = new WebHandle());
        return this.intance;
      };
      WebHandle.prototype.showMessageBox = function(title, msg) {
        if ("string" !== typeof title && "string" !== typeof msg) return;
        alert(msg);
        game.log(this.tag, "handle", "show message box", true);
        return true;
      };
      WebHandle.prototype.getDeviceId = function() {
        var deviceId = cc.sys.localStorage.getItem(DefineKey_1.local.DEVICE_ID);
        deviceId || (deviceId = util.game.generateUUID());
        cc.sys.localStorage.setItem(DefineKey_1.local.DEVICE_ID, deviceId);
        game.log(this.tag, "handle", "get device id", deviceId);
        return deviceId;
      };
      WebHandle.prototype.getPackageName = function() {
        return this.package;
      };
      WebHandle.prototype.getVersionGame = function() {
        return this.version;
      };
      WebHandle.prototype.getCountryCode = function() {
        return "";
      };
      WebHandle.prototype.getOSVersion = function() {
        return cc.sys.osVersion;
      };
      WebHandle.prototype.isConnecting = function() {
        return true;
      };
      WebHandle.prototype.checkAppInstall = function(pkg) {
        game.warn("Method not implemented.");
        return true;
      };
      WebHandle.prototype.setWakeLock = function(req) {
        game.warn("Method not implemented.");
      };
      WebHandle.prototype.openLink = function(url) {
        url && "string" === typeof url ? cc.sys.openURL(url) : game.error(this.tag, "handle", "url is not useable");
      };
      WebHandle.prototype.screenshot = function() {
        var node = new cc.Node();
        node.parent = cc.director.getScene();
        node.x = .5 * cc.winSize.width;
        node.y = .5 * cc.winSize.height;
        var camera = node.addComponent(cc.Camera);
        camera.cullingMask = 4294967295;
        var texture = new cc.RenderTexture();
        var gl = cc.game._renderContext;
        texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, gl.STENCIL_INDEX8);
        camera.targetTexture = texture;
        camera.render();
        var data = texture.readPixels();
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = texture.width;
        canvas.height = texture.height;
        var rowBytes = 4 * canvas.width;
        var bytes = new Uint8Array(data.length);
        for (var row = 0; row < canvas.height; row++) {
          var srow = canvas.height - 1 - row;
          var start = srow * canvas.width * 4;
          for (var i = 0; i < rowBytes; i++) bytes[row * rowBytes + i] = data[start + i];
        }
        for (var row = 0; row < canvas.height; row++) {
          var srow = canvas.height - 1 - row;
          var imageData = ctx.createImageData(canvas.width, 1);
          var start = srow * canvas.width * 4;
          for (var i = 0; i < rowBytes; i++) imageData.data[i] = bytes[start + i];
          ctx.putImageData(imageData, 0, row);
        }
        var dataURL = canvas.toDataURL("image/jpeg");
        var img = document.createElement("img");
        img.src = dataURL;
        node.destroy();
        game.log(this.tag, "screenshot", "save in path", img.src);
        return {
          texture: texture,
          path: img.src
        };
      };
      WebHandle.prototype.getWritablePath = function(suffix) {
        game.warn("Method not implemented.");
        return "";
      };
      WebHandle.prototype.saveImageData = function(option) {
        game.warn("Method not implemented.");
      };
      WebHandle.intance = null;
      return WebHandle;
    }();
    exports.default = WebHandle;
    cc._RF.pop();
  }, {
    "../../Define/DefineKey": "DefineKey"
  } ],
  WebIap: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b135dkgEKJAwI22dvit4hcg", "WebIap");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var WebIap = function() {
      function WebIap() {
        this.tag = "WebIap";
        this.listenner = {
          onInitialized: function(success) {
            game.log("platform.iap", "iap listenner", "on initialized", "success: " + JSON.stringify(success));
          },
          onSuccess: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_SUCCESS, this.itemBuying);
            tracking.purchase(product.id, product.priceValue);
            game.log("platform.iap", "iap listenner", "on success", "product: " + JSON.stringify(product));
            game.log("platform.iap", "iap listenner", "send game data");
            this.itemBuying.type === define.type.ESHOP.GENERAL_SHOP ? api.sendGD({
              e: define.key.api.BUY_SHOP_ITEM,
              method: "IAP_ANDROID",
              itemId: this.itemBuying.id,
              receipt: JSON.parse(product.receipt)
            }, function(err, data) {
              game.log("platform.iap", "iap listenner", "receive data", err, JSON.stringify(data));
              if (data.megaWheel) {
                view.popup["shop"] && view.popup["shop"].onClose();
                game.data.megaWheel = data.megaWheel;
                if (view.screen.wheelBonus) {
                  view.screen.wheelBonus.init();
                  view.screen.wheelBonus.onSpin();
                } else controller.ui.openWheelBonus(define.type.WHEEL_BONUS.GOLD);
              }
              var title = void 0;
              var msg = "";
              if (err) {
                1 == err && (err = "Error");
                msg = err;
              } else {
                title = "Thank you";
                msg = "Your purchase was successful";
              }
              controller.ui.showDialog({
                title: title,
                type: define.type.DIALOG_TYPE.HIGH,
                name: "iap_msg",
                message: {
                  message: msg
                },
                buttons: [ {
                  title: "OK",
                  theme: err ? define.type.CLASS_THEME.DANGER : define.type.CLASS_THEME.SUCCESS
                } ]
              });
            }) : this.itemBuying.type === define.type.ESHOP.MEGA_WHEEL ? api.sendGD({
              e: "buyMegaWheel",
              method: "IAP_ANDROID",
              receipt: JSON.parse(product.receipt)
            }, function(err, data) {
              if (err) {
                1 == err && (err = "Error");
                controller.ui.showDialog({
                  title: "Message",
                  type: define.type.DIALOG_TYPE.HIGH,
                  name: "iap_msg",
                  message: {
                    message: err
                  },
                  buttons: [ {
                    title: "OK",
                    theme: define.type.CLASS_THEME.DANGER
                  } ]
                });
                return;
              }
              if (data && data.status && data.megaWheel) {
                game.data.megaWheel = {
                  array: data.megaWheel.array,
                  result: data.megaWheel.result
                };
                if (view.screen.wheelBonus) {
                  view.screen.wheelBonus.init();
                  view.screen.wheelBonus.onSpin();
                } else controller.ui.openWheelBonus(define.type.WHEEL_BONUS.GOLD);
              }
            }) : this.itemBuying.type === define.type.ESHOP.DEAL_SHOP && api.sendGD({
              e: define.key.api.BUY_DEAL_SHOP,
              method: "IAP_ANDROID",
              receipt: JSON.parse(product.receipt)
            }, function(err, data) {
              1 == err && (err = "Error");
              controller.ui.showDialog({
                title: "Message",
                type: define.type.DIALOG_TYPE.HIGH,
                name: "iap_msg",
                message: {
                  message: err
                },
                buttons: [ {
                  title: "OK",
                  theme: define.type.CLASS_THEME.DANGER
                } ]
              });
              if (data) {
                game.data.shop[define.type.ESHOP.DEAL_SHOP] = void 0;
                store.emit(store.key.UPDATE_SHOP_DATA, game.data.shop);
                var title = "Thank you";
                var msg = "Your purchase was successful";
                controller.ui.showDialog({
                  title: title,
                  type: define.type.DIALOG_TYPE.HIGH,
                  name: "iap_msg",
                  message: {
                    message: msg
                  },
                  buttons: [ {
                    title: "OK",
                    theme: err ? define.type.CLASS_THEME.DANGER : define.type.CLASS_THEME.SUCCESS
                  } ]
                });
              }
            });
          }.bind(this),
          onFailure: function(product, msg) {
            tracking.send(tracking.event.IAP_PURCHASE_FAILED);
            game.error("platform.iap", "iap listenner", "on failure", "product: " + JSON.stringify(product) + " - msg: " + JSON.stringify(msg));
            controller.ui.showDialog({
              type: define.type.DIALOG_TYPE.HIGH,
              name: "iap_msg",
              message: {
                message: "Purchase failure"
              },
              buttons: [ {
                title: "OK",
                theme: define.type.CLASS_THEME.DANGER
              } ]
            });
          },
          onCanceled: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_CANCELED);
            game.warn("platform.iap", "iap listenner", "on canceled", "product: " + JSON.stringify(product));
            controller.ui.showDialog({
              type: define.type.DIALOG_TYPE.HIGH,
              name: "iap_msg",
              message: {
                message: "Purchase canceled"
              },
              buttons: [ {
                title: "OK",
                theme: define.type.CLASS_THEME.DANGER
              } ]
            });
          },
          onRestored: function(product) {
            tracking.send(tracking.event.IAP_PURCHASE_RESTORED);
            game.log("platform.iap", "iap listenner", "on restored", "product: " + JSON.stringify(product));
          },
          onRestoreComplete: function(ok, msg) {
            tracking.send(tracking.event.IAP_PURCHASE_RESTOR_COMPLETED);
            game.log("platform.iap", "iap listenner", "on restore complete", "ok: " + JSON.stringify(ok) + " - msg: " + JSON.stringify(msg));
          },
          onProductRequestSuccess: function(products) {
            game.log("platform.iap", "iap listenner", "on product request success", "product: " + JSON.stringify(products));
            for (var i = 0; i < products.length; i++) ;
          },
          onProductRequestFailure: function(msg) {
            game.log("platform.iap", "iap listenner", "on product request failure", "msg: " + JSON.stringify(msg));
          },
          onShouldAddStorePayment: function(productName) {
            game.log("platform.iap", "iap listenner", "on should add store payment", "productName: " + JSON.stringify(productName));
          },
          onFetchStorePromotionOrder: function(productNames, error) {
            game.log("platform.iap", "iap listenner", "on fetch store promotion order", "productNames: " + JSON.stringify(productNames) + " - error: " + JSON.stringify(error));
          },
          onFetchStorePromotionVisibility: function(productName, visibility, error) {
            game.log("platform.iap", "iap listenner", "on fetch store promotion visibility", "productName: " + JSON.stringify(productName) + " - visibility: " + JSON.stringify(visibility) + " - error: " + JSON.stringify(error));
          },
          onUpdateStorePromotionOrder: function(error) {
            game.log("platform.iap", "iap listenner", "on update store promotion order", "error: " + JSON.stringify(error));
          },
          onUpdateStorePromotionVisibility: function(error) {
            game.log("platform.iap", "iap listenner", "on update store promotion visibility", "error: " + JSON.stringify(error));
          },
          onPurchaseHistory: function(purchases) {
            game.log("platform.iap", "iap listenner", "on purchase history", "purchase: " + JSON.stringify(purchases));
          },
          onConsumed: function(p, error) {
            game.log("platform.iap", "iap listenner", "on consumed", "p: " + JSON.stringify(p) + ") - error: " + JSON.stringify(error));
          },
          onDeferred: function(p) {
            game.log("platform.iap", "iap listenner", "on deferred", "p: " + JSON.stringify(p));
          }
        };
      }
      WebIap.getIns = function() {
        this.intance || (this.intance = new WebIap());
        return this.intance;
      };
      WebIap.prototype.init = function() {
        game.warn(this.tag, "init method not implemented.");
      };
      WebIap.prototype.setDebug = function(debug) {
        game.warn(this.tag, "setDebug method not implemented.");
      };
      WebIap.prototype.purchase = function(name) {
        tracking.send(tracking.event.IAP_PURCHASE_CLICK, {
          pack: name
        });
        config.setup["testIAP"] && this.purchaseTest(name);
        game.warn(this.tag, "purchase method not implemented.");
      };
      WebIap.prototype.purchaseByProductID = function(productID) {
        var item = Object.values(define.key.iap.web).find(function(o) {
          return o.id == productID;
        });
        item ? this.purchase(item.name) : game.warn(this.tag, "purchaseByProductID", "item wasn't defined");
      };
      WebIap.prototype.purchaseTest = function(name) {
        var _this = this;
        var item = Object.values(define.key.iap.web).find(function(o) {
          return o.name == name;
        });
        if (!item) return game.warn(this.tag, "purchaseByProductID", "item wasn't defined");
        api.sendGD({
          e: "deleteReceipt",
          orderId: JSON.parse(item.test["receipt"]).orderId
        }, function(err, data) {
          game.log(err, data);
          _this.listenner.onSuccess(item.test);
        });
      };
      WebIap.prototype.refresh = function() {
        game.warn(this.tag, "refresh method not implemented.");
      };
      WebIap.prototype.restore = function() {
        game.warn(this.tag, "restore method not implemented.");
      };
      WebIap.prototype.removeListener = function() {
        game.warn(this.tag, "removeListener method not implemented.");
      };
      WebIap.prototype.enableUserSideVerification = function() {
        game.warn(this.tag, "enableUserSideVerification method not implemented.");
      };
      WebIap.prototype.isAutoFinishTransaction = function() {
        game.warn(this.tag, "isAutoFinishTransaction method not implemented.");
        return false;
      };
      WebIap.prototype.setAutoFinishTransaction = function(b) {
        game.warn(this.tag, "setAutoFinishTransaction method not implemented.");
      };
      WebIap.prototype.finishTransaction = function(productid) {
        game.warn(this.tag, "finishTransaction method not implemented.");
      };
      WebIap.prototype.fetchStorePromotionOrder = function() {
        game.warn(this.tag, "fetchStorePromotionOrder method not implemented.");
      };
      WebIap.prototype.updateStorePromotionOrder = function(productNames) {
        game.warn(this.tag, "updateStorePromotionOrder method not implemented.");
      };
      WebIap.prototype.fetchStorePromotionVisibility = function(productName) {
        game.warn(this.tag, "fetchStorePromotionVisibility method not implemented.");
      };
      WebIap.prototype.updateStorePromotionVisibility = function(productName, visibility) {
        game.warn(this.tag, "updateStorePromotionVisibility method not implemented.");
      };
      WebIap.prototype.getPurchaseHistory = function() {
        game.warn(this.tag, "getPurchaseHistory method not implemented.");
      };
      WebIap.prototype.getInitializedErrMsg = function() {
        game.warn(this.tag, "getInitializedErrMsg method not implemented.");
      };
      WebIap.prototype.requestUpdateTransaction = function() {
        game.warn(this.tag, "requestUpdateTransaction method not implemented.");
      };
      WebIap.intance = null;
      return WebIap;
    }();
    exports.default = WebIap;
    cc._RF.pop();
  }, {} ],
  WebOnesignal: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3e05dpZBRFPqoKIBTF2VZHL", "WebOnesignal");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var WebOnesignal = function() {
      function WebOnesignal() {
        this.tag = "WebOnesignal";
      }
      WebOnesignal.getIns = function() {
        this.intance || (this.intance = new WebOnesignal());
        return this.intance;
      };
      WebOnesignal.prototype.init = function() {
        game.log(this.tag, "init");
        window.OneSignal = window.OneSignal || [];
        var id = "onesignal-jssdk";
        var sdkUrl = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
        var firstScript = document.getElementsByTagName("script")[0];
        if (document.getElementById(id)) return;
        var newScript = document.createElement("script");
        newScript.id = id;
        newScript.src = sdkUrl;
        firstScript.parentNode.insertBefore(newScript, firstScript);
        var init = function() {
          window.OneSignal.push(function() {
            window.OneSignal.init({
              appId: "c2e17187-f1a7-4933-84dd-0182ddd5faa8",
              autoResubscribe: true,
              allowLocalhostAsSecureOrigin: true,
              notifyButton: {
                enable: true
              }
            });
          });
          setTimeout(function() {
            "function" !== typeof window.OneSignal && init();
          }, 2e3);
        };
        init();
      };
      WebOnesignal.prototype.registerPushNotifications = function() {
        game.log(this.tag, "onesignal", "register push notification");
        window.OneSignal.showNativePrompt();
      };
      WebOnesignal.prototype.sendTag = function(key, value) {
        game.log(this.tag, "onesignal", "send tag", "key: " + key + " - value: " + value);
        window.OneSignal.sendTag(key, value);
      };
      WebOnesignal.prototype.getTags = function() {
        game.log(this.tag, "onesignal", "get tags");
        window.OneSignal.getTags();
      };
      WebOnesignal.prototype.deleteTag = function(key) {
        game.log(this.tag, "onesignal", "delete tag", "key: " + key);
        window.OneSignal.deleteTag(key);
      };
      WebOnesignal.prototype.setEmail = function(email) {
        game.log(this.tag, "onesignal", "set email", "email: " + email);
        window.OneSignal.setEmail(email);
      };
      WebOnesignal.prototype.idsAvailable = function() {
        game.log(this.tag, "onesignal", "ids avaiable");
        window.OneSignal.isPushNotificationsEnabled();
      };
      WebOnesignal.prototype.enableInAppAlertNotification = function(enable) {
        game.log(this.tag, "onesignal", "in app alert notification", "enable: " + enable);
      };
      WebOnesignal.prototype.setSubscription = function(enable) {
        game.log(this.tag, "onesignal", "set subscription", "enable: " + enable);
        window.OneSignal.setSubscription(enable);
      };
      WebOnesignal.prototype.postNotification = function(jsonString) {
        game.log(this.tag, "onesignal", "post notification", "json: " + jsonString);
      };
      WebOnesignal.intance = null;
      return WebOnesignal;
    }();
    exports.default = WebOnesignal;
    cc._RF.pop();
  }, {} ],
  WheelBonus: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c971aFRCxlDkL9PfVJH+TzS", "WheelBonus");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var WheelComp_1 = require("../Components/WheelComp");
    var CoinLabel_1 = require("../Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var WheelBonus = function(_super) {
      __extends(WheelBonus, _super);
      function WheelBonus() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.wheel = void 0;
        _this.bg = void 0;
        _this.nodeModel = void 0;
        _this.nodeTable = void 0;
        _this.nodeLight = void 0;
        _this.lbReward = void 0;
        _this.btnClose = void 0;
        _this.coinControl = void 0;
        _this.data = {
          result: 0,
          items: []
        };
        _this.isOnReward = false;
        _this.isSpinning = false;
        return _this;
      }
      WheelBonus.prototype.onLoad = function() {
        this.initialize();
      };
      WheelBonus.prototype.start = function() {
        this.onOpen();
      };
      WheelBonus.prototype.initialize = function() {
        var _this = this;
        this.wheel.node.opacity = 0;
        this.nodeModel.opacity = 0;
        this.nodeTable.opacity = 0;
        this.btnClose.node.opacity = 0;
        this.btnClose.node.scale = 0;
        this.bg.opacity = 0;
        this.bg.setContentSize(cc.winSize);
        this.coinControl = new CoinLabel_1.default(this.lbReward, 0, "", "COIN");
        this.flicker(.3);
        this.wheel.setEndSpinCallback(function() {
          _this.flicker(.3);
          _this.onReward();
          _this.isSpinning = false;
        });
      };
      WheelBonus.prototype.init = function(data) {
        "number" === typeof data.result && (this.data.result = data.result);
        this.data.items = data.items;
        this.wheel.init({
          result: data.result,
          items: data.items
        });
      };
      WheelBonus.prototype.setResult = function(result) {
        "number" === typeof result && this.wheel.setResult(result);
      };
      WheelBonus.prototype.onSpin = function() {
        this.isSpinning = true;
        this.btnClose.node.runAction(effect.bouceOut());
        this.resetReward();
        this.wheel.spin();
        this.flicker(.1);
        this.wheel.flicker(.1);
      };
      WheelBonus.prototype.onOpen = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [ 2 ];
          });
        });
      };
      WheelBonus.prototype.onClose = function() {};
      WheelBonus.prototype.onReward = function() {
        var data = this.data;
        this.wheel.unLock();
        this.isOnReward = true;
        this.coinControl.updateUserBalance(data.items[data.result]);
        var sub = this.nodeTable.getChildByName("sub");
        var main = this.nodeTable.getChildByName("main");
        sub.stopAllActions();
        sub.runAction(cc.moveTo(.4, cc.v2(0, -100)).easing(cc.easeIn(.7)));
        main.stopAllActions();
        main.runAction(cc.moveTo(.4, cc.v2(0, 67)).easing(cc.easeIn(.7)));
      };
      WheelBonus.prototype.resetReward = function() {
        this.isOnReward = false;
        this.coinControl.updateUserBalance(0);
        var sub = this.nodeTable.getChildByName("sub");
        var main = this.nodeTable.getChildByName("main");
        sub.stopAllActions();
        sub.runAction(cc.moveTo(.4, cc.v2(0, 0)).easing(cc.easeOut(.7)));
        main.stopAllActions();
        main.runAction(cc.moveTo(.4, cc.v2(0, 0)).easing(cc.easeOut(.7)));
      };
      WheelBonus.prototype.flicker = function(tper) {
        if (!this.nodeLight) return;
        var light1 = this.nodeLight.getChildByName("light1");
        var light2 = this.nodeLight.getChildByName("light2");
        this.nodeLight.stopAllActions();
        this.nodeLight.runAction(cc.repeatForever(cc.sequence(cc.delayTime(tper), cc.callFunc(function() {
          light1.active = !light1.active;
          light2.active = !light2.active;
        }))));
      };
      WheelBonus.prototype.onClickSpin = function() {
        this.onSpin();
      };
      WheelBonus.prototype.onClickCollect = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this.isOnReward) {
                cc.warn("WheelBonus", "onClickCollect", "Wheel still rotate");
                return [ 2 ];
              }
              game.log("WheelBonus", "onClickCollect");
              return [ 4, new Promise(function(res, rej) {
                api.sendGD({
                  e: api.key.GET_DAILY_BONUS_REWARD,
                  type: define.type.EDailyBonus.FREE_WHEEL
                }, function(err, data) {
                  if (err) return;
                  if (data.status) {
                    _this.isOnReward = false;
                    store.emit(store.key.UPDATE_USER_BALANCE, data.userBalance);
                    game.data.dailyBonus.freeWheel.isTaken = true;
                    store.emit(store.key.DAILYBONUS, game.data.dailyBonus);
                    res();
                  }
                });
              }) ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      WheelBonus.prototype.onClickClose = function() {
        if (this.isOnReward || this.isSpinning) {
          var msg = "";
          this.isOnReward && (msg = "You must receive the reward before exit");
          this.isSpinning && (msg = "You cannot exit the game when the wheel is spinning");
          controller.ui.showDialog({
            title: "Message",
            type: define.type.DIALOG_TYPE.HIGH,
            name: "wheel_msg",
            message: {
              message: msg
            },
            buttons: [ {
              title: "OK",
              theme: define.type.CLASS_THEME.INFO
            } ]
          });
          return;
        }
        controller.ui.closeWheelBonus();
      };
      __decorate([ property(WheelComp_1.default) ], WheelBonus.prototype, "wheel", void 0);
      __decorate([ property(cc.Node) ], WheelBonus.prototype, "bg", void 0);
      __decorate([ property(cc.Node) ], WheelBonus.prototype, "nodeModel", void 0);
      __decorate([ property(cc.Node) ], WheelBonus.prototype, "nodeTable", void 0);
      __decorate([ property(cc.Node) ], WheelBonus.prototype, "nodeLight", void 0);
      __decorate([ property(cc.Label) ], WheelBonus.prototype, "lbReward", void 0);
      __decorate([ property(cc.Button) ], WheelBonus.prototype, "btnClose", void 0);
      WheelBonus = __decorate([ ccclass ], WheelBonus);
      return WheelBonus;
    }(cc.Component);
    exports.default = WheelBonus;
    cc._RF.pop();
  }, {
    "../Components/CoinLabel": "CoinLabel",
    "../Components/WheelComp": "WheelComp"
  } ],
  WheelComp: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9e5acvPfHtCTZIjh0Qu3VGO", "WheelComp");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var WheelComp = function(_super) {
      __extends(WheelComp, _super);
      function WheelComp() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.btnSpin = void 0;
        _this.nodeLight = void 0;
        _this.nodeLight1 = void 0;
        _this.nodeLight2 = void 0;
        _this.nodeWheel = void 0;
        _this.nodeTrans = void 0;
        _this.nodeArrow = void 0;
        _this.timeAutoStop = 2e3;
        _this.maxVelocity = 400;
        _this.accel = 100;
        _this.items = [];
        _this.rigWheel = void 0;
        _this.onSpin = false;
        _this.lockSpin = false;
        _this.startAngle = 0;
        _this.resultNum = void 0;
        _this.endSpinCallBack = void 0;
        return _this;
      }
      WheelComp.prototype.onLoad = function() {
        var physics = cc.director.getPhysicsManager();
        physics.enabled = true;
        physics.gravity = cc.v2(0, -100);
        this.rigWheel = this.nodeWheel.getComponent(cc.RigidBody);
        this.flicker(.3);
      };
      WheelComp.prototype.init = function(data) {
        var result = data.result, items = data.items;
        if (!items || "number" == typeof result && (result < 0 || result >= items.length)) {
          cc.warn("Input error", result, items);
          return;
        }
        var nodeItem = this.nodeWheel.getChildByName("item");
        var lbItems = nodeItem.children.map(function(o) {
          return o.getComponent(cc.Label);
        });
        if (lbItems.length !== items.length) {
          cc.warn("Size of items data != size of label items of prefab");
          return;
        }
        this.items = items;
        lbItems.forEach(function(o, i) {
          o.string = util.string.formatMoney(items[i]);
        });
        "number" === typeof result && (this.resultNum = result);
      };
      WheelComp.prototype.setResult = function(result) {
        "number" === typeof result && (this.resultNum = result);
      };
      WheelComp.prototype.flicker = function(tper) {
        var _this = this;
        this.nodeLight.stopAllActions();
        this.nodeLight.runAction(cc.repeatForever(cc.sequence(cc.delayTime(tper), cc.callFunc(function() {
          _this.nodeLight1.active = !_this.nodeLight1.active;
          _this.nodeLight2.active = !_this.nodeLight2.active;
        }))));
      };
      WheelComp.prototype.spin = function() {
        var _this = this;
        game.log("WheelBonus", "onClickSpin");
        if (this.lockSpin) return;
        this.onSpin = !this.onSpin;
        this.lock();
        if (this.onSpin) {
          this.node.stopAllActions();
          this.nodeTrans.stopAllActions();
          this.nodeWheel.stopAllActions();
          this.rigWheel.angularVelocity = 0;
          this.nodeTrans.active = false;
          this.nodeTrans.opacity = 0;
          this.node.runAction(cc.sequence(cc.delayTime(this.timeAutoStop / 1e3), cc.callFunc(function() {
            if (!_this || !_this.node || !_this.onSpin) return;
            _this.onSpin = false;
          })));
        }
      };
      WheelComp.prototype.lock = function() {
        this.lockSpin = true;
      };
      WheelComp.prototype.unLock = function() {
        this.lockSpin = false;
      };
      WheelComp.prototype.getItemNum = function() {
        if (!this.items || !this.items.length) return;
        var ang = this.getItemAng();
        return Math.abs(Math.floor(ang * this.items.length / 360));
      };
      WheelComp.prototype.getItemAng = function(numItem) {
        if ("undefined" === typeof numItem) return this.nodeWheel.rotation % 360 - this.startAngle;
        if (this.items && this.items.length) return 360 - numItem * (360 / this.items.length);
      };
      WheelComp.prototype.setEndSpinCallback = function(cb) {
        this.endSpinCallBack = cb;
      };
      WheelComp.prototype.update = function(dt) {
        var _this = this;
        if (this.onSpin) Math.abs(this.rigWheel.angularVelocity) < this.maxVelocity ? this.rigWheel.angularVelocity += this.accel * dt : this.lockSpin && (this.btnSpin.node.color = cc.color(255, 255, 255)); else {
          var minVelocity = 150;
          if (Math.abs(this.rigWheel.angularVelocity) > minVelocity + 50) this.rigWheel.angularVelocity -= this.accel * dt; else if (this.rigWheel.angularVelocity > 0 && this.items && this.items.length) {
            var resultNum = this.resultNum;
            var endNum = this.getItemNum();
            var angPerItem = 360 / this.items.length;
            var step = resultNum >= endNum ? resultNum - endNum : this.items.length - endNum + resultNum;
            var angle = 720 + step * angPerItem - (this.nodeWheel.rotation % 24 > 12 ? 12 : 0);
            this.rigWheel.angularVelocity = 0;
            var tAct = angle / minVelocity;
            this.nodeWheel.runAction(cc.rotateBy(angle / minVelocity, angle).easing(cc.easeSineOut()));
            this.nodeTrans.active = true;
            this.nodeTrans.opacity = 0;
            this.nodeTrans.rotation = this.getItemAng(this.resultNum);
            this.nodeTrans.runAction(cc.sequence(cc.delayTime(.7 * tAct), cc.fadeIn(.3 * tAct)));
            this.node.runAction(cc.sequence(cc.delayTime(tAct), cc.callFunc(function() {
              if (!_this || !_this.node) return;
              _this.flicker(.3);
              _this.endSpinCallBack && _this.endSpinCallBack();
            })));
          }
        }
      };
      __decorate([ property(cc.Button) ], WheelComp.prototype, "btnSpin", void 0);
      __decorate([ property(cc.Node) ], WheelComp.prototype, "nodeLight", void 0);
      __decorate([ property(cc.Node) ], WheelComp.prototype, "nodeLight1", void 0);
      __decorate([ property(cc.Node) ], WheelComp.prototype, "nodeLight2", void 0);
      __decorate([ property(cc.Node) ], WheelComp.prototype, "nodeWheel", void 0);
      __decorate([ property(cc.Node) ], WheelComp.prototype, "nodeTrans", void 0);
      __decorate([ property(cc.Node) ], WheelComp.prototype, "nodeArrow", void 0);
      __decorate([ property ], WheelComp.prototype, "timeAutoStop", void 0);
      __decorate([ property ], WheelComp.prototype, "maxVelocity", void 0);
      __decorate([ property ], WheelComp.prototype, "accel", void 0);
      WheelComp = __decorate([ ccclass ], WheelComp);
      return WheelComp;
    }(cc.Component);
    exports.default = WheelComp;
    cc._RF.pop();
  }, {} ],
  WheelGold: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "13c74Jx+xNEbYOCOUaSqnBp", "WheelGold");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var WheelBonus_1 = require("./WheelBonus");
    var DefineType_1 = require("../Define/DefineType");
    var CoinLabel_1 = require("../Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var WheelGold = function(_super) {
      __extends(WheelGold, _super);
      function WheelGold() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.shopItem = void 0;
        _this.key = [];
        return _this;
      }
      WheelGold.prototype.start = function() {
        this.registerStore();
        _super.prototype.start.call(this);
      };
      WheelGold.prototype.init = function() {
        if ("number" == typeof game.data.megaWheel.result) {
          this.data.result = game.data.megaWheel.result;
          this.wheel.setResult(game.data.megaWheel.result);
          this.btnClose.node.runAction(effect.bouceOut());
        }
        this.registerStore();
        this.updateButtonSpin();
      };
      WheelGold.prototype.registerStore = function() {
        var _this = this;
        var keyShop = store.register(store.key.UPDATE_SHOP_DATA, function(data) {
          _this.wheel.btnSpin.node.getChildByName("text").getComponent(cc.Label).string = "$" + data.MEGA_WHEEL.price.toFixed(2);
          var megaWheelData = data[DefineType_1.ESHOP.MEGA_WHEEL];
          _this.shopItem = {
            price: megaWheelData.price,
            type: DefineType_1.ESHOP.MEGA_WHEEL,
            productId: megaWheelData.productId
          };
        });
        this.key.push(keyShop);
        var keyWheel = store.register(store.key.UPDATE_MEGAWHEEL_DATA, function(data) {
          if (data.array) {
            _this.data.items = data.array;
            _this.wheel.init({
              items: data.array
            });
          }
        });
        this.key.push(keyWheel);
      };
      WheelGold.prototype.initialize = function() {
        var _this = this;
        this.wheel.node.opacity = 0;
        this.nodeModel.opacity = 0;
        this.nodeTable.opacity = 0;
        this.btnClose.node.opacity = 0;
        this.btnClose.node.scale = 0;
        this.bg.opacity = 0;
        this.bg.setContentSize(cc.winSize);
        this.coinControl = new CoinLabel_1.default(this.lbReward, 0, "", "\nCOIN");
        this.flicker(.3);
        this.wheel.setEndSpinCallback(function() {
          _this.flicker(.3);
          _this.onReward();
          _this.isSpinning = false;
        });
      };
      WheelGold.prototype.onOpen = function() {
        return __awaiter(this, void 0, void 0, function() {
          var tBg, tEff;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              tBg = .3;
              tEff = 1;
              return [ 4, new Promise(function(res, rej) {
                _this.bg.y = -cc.winSize.height;
                _this.bg.opacity = 255;
                _this.bg.runAction(cc.sequence(cc.moveTo(tBg, cc.v2(0, 0)).easing(cc.easeIn(.7)), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 1:
              _a.sent();
              if (!this || !this.node) return [ 2 ];
              if (!this.nodeModel) return [ 2 ];
              this.nodeModel.runAction(effect.moveInBy({
                time: tEff,
                direction: define.type.DIRECTION.LEFT,
                distance: 300
              }));
              if (!this.nodeTable) return [ 2 ];
              this.nodeTable.runAction(effect.moveInBy({
                time: tEff,
                direction: define.type.DIRECTION.RIGHT,
                distance: 300
              }));
              if (!this.wheel) return [ 2 ];
              this.wheel.node.opacity = 0;
              this.wheel.node.runAction(cc.fadeIn(tEff));
              return [ 4, new Promise(function(res, rej) {
                _this.node.runAction(cc.sequence(cc.delayTime(tEff), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 2:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this.btnClose && "number" != typeof game.data.megaWheel.result ? _this.btnClose.node.runAction(effect.bouceIn({
                  callback: function() {
                    res();
                  }
                })) : res();
              }) ];

             case 3:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      WheelGold.prototype.onClose = function() {
        var _this = this;
        var tBg = .2;
        var tEff = .5;
        this.bg.runAction(cc.sequence(cc.delayTime(tEff), cc.moveTo(tBg, cc.v2(0, -cc.winSize.height)).easing(cc.easeOut(.7))));
        this.nodeModel.runAction(effect.moveOutBy({
          time: tEff,
          direction: define.type.DIRECTION.LEFT,
          distance: 300
        }));
        this.nodeTable.runAction(effect.moveOutBy({
          time: tEff,
          direction: define.type.DIRECTION.RIGHT,
          distance: 300
        }));
        this.wheel.node.runAction(cc.fadeOut(tEff));
        this.btnClose.node.runAction(effect.bouceOut());
        return new Promise(function(res, rej) {
          _this.node.runAction(cc.sequence(cc.delayTime(tEff + tBg), cc.callFunc(function() {
            res();
          })));
        });
      };
      WheelGold.prototype.updateButtonSpin = function() {
        var btnSpin = this.wheel.btnSpin;
        var title = btnSpin.node.getChildByName("title");
        var text = btnSpin.node.getChildByName("text");
        if ("number" == typeof game.data.megaWheel.result) {
          title.y = 0;
          text.opacity = 0;
        } else {
          title.y = 18;
          text.opacity = 255;
        }
      };
      WheelGold.prototype.showDialogClose = function() {
        var _this = this;
        controller.ui.showDialog({
          title: "Mega Wheel",
          type: define.type.DIALOG_TYPE.HIGH,
          name: "iap_msg",
          message: {
            message: "All wedges are worth X20 the mega bonus!\n Win up to 400,000 Coins\nFor only " + this.shopItem.price.toFixed(2) + "$"
          },
          buttons: [ {
            title: "Spin Now",
            theme: define.type.CLASS_THEME.SUCCESS
          }, {
            title: "Quit",
            theme: define.type.CLASS_THEME.DANGER,
            callback: function() {
              _this.onClickClose();
            }
          } ]
        });
      };
      WheelGold.prototype.onClickCollect = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this.isOnReward) {
                cc.warn("WheelBonus", "onClickCollect", "Wheel still rotate");
                return [ 2 ];
              }
              game.log("WheelBonus", "onClickCollect");
              return [ 4, new Promise(function(res, rej) {
                api.sendGD({
                  e: api.key.GET_MEGA_WHEEL_REWARD,
                  type: define.type.EDailyBonus.FREE_WHEEL
                }, function(err, data) {
                  if (err) return;
                  if (data.status) {
                    var coin = data.coin;
                    _this.isOnReward = false;
                    game.data.megaWheel.result = null;
                    _this.updateButtonSpin();
                    res();
                  }
                });
              }) ];

             case 1:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this.coinControl.updateUserBalance(0);
                var sub = _this.nodeTable.getChildByName("sub");
                var main = _this.nodeTable.getChildByName("main");
                sub.stopAllActions();
                sub.runAction(cc.moveTo(.4, cc.v2(0, 0)).easing(cc.easeIn(.7)));
                main.stopAllActions();
                main.runAction(cc.moveTo(.4, cc.v2(0, 0)).easing(cc.easeIn(.7)));
                _this.node.runAction(effect.delay({
                  time: .4,
                  callback: function() {
                    res();
                  }
                }));
              }) ];

             case 2:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this.btnClose && _this.btnClose.node.runAction(effect.bouceIn({
                  callback: function() {
                    res();
                  }
                }));
              }) ];

             case 3:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      WheelGold.prototype.onClickSpin = function() {
        if (this.isOnReward || this.isSpinning) {
          game.log("WheelSilver", "onClickSpin", "can't spin on this time");
          return;
        }
        if ("number" !== typeof game.data.megaWheel.result) {
          platform.iap.itemBuying = this.shopItem;
          tracking.send(tracking.event.IAP_PURCHASE_WHEEL, this.shopItem);
          platform.iap.purchaseByProductID(this.shopItem.productId);
        } else {
          "undefined" === typeof this.wheel.resultNum && this.wheel.setResult(game.data.megaWheel.result);
          this.onSpin();
        }
      };
      WheelGold.prototype.onClickClose = function() {
        if ("number" == typeof game.data.megaWheel.result) return;
        _super.prototype.onClickClose.call(this);
      };
      WheelGold.prototype.onDestroy = function() {
        this.key.forEach(function(o) {
          store.unRegister(o);
        });
      };
      WheelGold = __decorate([ ccclass ], WheelGold);
      return WheelGold;
    }(WheelBonus_1.default);
    exports.default = WheelGold;
    cc._RF.pop();
  }, {
    "../Components/CoinLabel": "CoinLabel",
    "../Define/DefineType": "DefineType",
    "./WheelBonus": "WheelBonus"
  } ],
  WheelSilver: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "32dd9SAg39PbbK9Br7jyUCl", "WheelSilver");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var WheelBonus_1 = require("./WheelBonus");
    var CoinLabel_1 = require("../Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var WheelSilver = function(_super) {
      __extends(WheelSilver, _super);
      function WheelSilver() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.nodeLogo = void 0;
        _this.btnCollect = void 0;
        _this.spfCollectActive = void 0;
        _this.spfCollectInactive = void 0;
        return _this;
      }
      WheelSilver.prototype.initialize = function() {
        var _this = this;
        this.wheel.node.opacity = 0;
        this.nodeModel.opacity = 0;
        this.nodeTable.opacity = 0;
        this.nodeLogo.opacity = 0;
        this.btnCollect.node.opacity = 0;
        this.btnClose.node.opacity = 0;
        this.btnClose.node.scale = 0;
        this.bg.opacity = 0;
        this.bg.setContentSize(cc.winSize);
        this.coinControl = new CoinLabel_1.default(this.lbReward, 0, "", " COIN");
        this.wheel.setEndSpinCallback(function() {
          _this.onReward();
          _this.btnClose.node.runAction(effect.bouceOut());
        });
      };
      WheelSilver.prototype.onOpen = function() {
        return __awaiter(this, void 0, void 0, function() {
          var tBg, tEff;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              tBg = .3;
              tEff = 1;
              return [ 4, new Promise(function(res, rej) {
                _this.bg.y = -cc.winSize.height;
                _this.bg.opacity = 255;
                _this.bg.runAction(cc.sequence(cc.moveTo(tBg, cc.v2(0, 0)).easing(cc.easeIn(.7)), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 1:
              _a.sent();
              if (!this || !this.node) return [ 2 ];
              if (!this.nodeModel) return [ 2 ];
              this.nodeModel.runAction(effect.moveInBy({
                time: tEff,
                direction: define.type.DIRECTION.LEFT,
                distance: 300
              }));
              if (!this.nodeTable) return [ 2 ];
              this.nodeTable.runAction(cc.sequence(cc.delayTime(tEff), effect.moveInBy({
                time: .25,
                easing: false,
                direction: define.type.DIRECTION.LEFT,
                distance: 300
              })));
              if (!this.nodeLogo) return [ 2 ];
              this.nodeLogo.runAction(effect.bouceIn());
              if (!this.btnCollect) return [ 2 ];
              this.btnCollect.node.runAction(effect.bouceIn());
              if (!this.wheel) return [ 2 ];
              this.wheel.node.opacity = 0;
              this.wheel.node.runAction(cc.fadeIn(tEff));
              return [ 4, new Promise(function(res, rej) {
                _this.node.runAction(cc.sequence(cc.delayTime(tEff), cc.callFunc(function() {
                  res();
                })));
              }) ];

             case 2:
              _a.sent();
              return [ 4, new Promise(function(res, rej) {
                _this.btnClose ? _this.btnClose.node.runAction(effect.bouceIn({
                  callback: function() {
                    res();
                  }
                })) : res();
              }) ];

             case 3:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      WheelSilver.prototype.onClose = function() {
        var _this = this;
        var tBg = .2;
        var tTable = .25;
        var tEff = .5;
        this.bg.runAction(cc.sequence(cc.delayTime(tTable + tEff), cc.moveTo(tBg, cc.v2(0, -cc.winSize.height)).easing(cc.easeOut(.7))));
        this.nodeModel.runAction(cc.sequence(cc.delayTime(tTable), effect.moveOutBy({
          time: tEff,
          direction: define.type.DIRECTION.LEFT,
          distance: 300
        })));
        this.nodeTable.runAction(effect.moveOutBy({
          time: tTable,
          easing: false,
          direction: define.type.DIRECTION.LEFT,
          distance: 300
        }));
        this.wheel.node.runAction(cc.sequence(cc.delayTime(tTable), cc.fadeOut(tEff)));
        this.nodeLogo.runAction(cc.sequence(cc.delayTime(tTable), effect.bouceOut()));
        this.btnCollect.node.runAction(cc.sequence(cc.delayTime(tTable), effect.bouceOut()));
        this.btnClose.node.runAction(effect.bouceOut());
        return new Promise(function(res, rej) {
          _this.node.runAction(cc.sequence(cc.delayTime(tEff + tBg + tTable), cc.callFunc(function() {
            res();
          })));
        });
      };
      WheelSilver.prototype.onReward = function() {
        var data = this.data;
        this.wheel.unLock();
        this.isOnReward = true;
        this.coinControl.updateUserBalance(data.items[data.result]);
        this.btnCollect.getComponent(cc.Sprite).spriteFrame = this.spfCollectActive;
      };
      WheelSilver.prototype.resetReward = function() {
        this.isOnReward = false;
        this.coinControl.updateUserBalance(0);
        this.btnCollect.getComponent(cc.Sprite).spriteFrame = this.spfCollectInactive;
      };
      WheelSilver.prototype.onClickSpin = function() {
        if (this.isOnReward || this.isSpinning || game.data.dailyBonus.freeWheel.isTaken) {
          game.log("WheelSilver", "onClickSpin", "can't spin on this time");
          return;
        }
        this.onSpin();
      };
      WheelSilver.prototype.onClickCollect = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this.isOnReward) {
                cc.warn("WheelBonus", "onClickCollect", "Wheel still rotate");
                return [ 2 ];
              }
              game.log("WheelBonus", "onClickCollect");
              return [ 4, new Promise(function(res, rej) {
                api.sendGD({
                  e: api.key.GET_DAILY_BONUS_REWARD,
                  type: define.type.EDailyBonus.FREE_WHEEL
                }, function(err, data) {
                  if (err) return;
                  if (data.status) {
                    _this.isOnReward = false;
                    store.emit(store.key.UPDATE_USER_BALANCE, data.userBalance);
                    game.data.dailyBonus.freeWheel.isTaken = true;
                    store.emit(store.key.DAILYBONUS, game.data.dailyBonus);
                    res();
                  }
                });
              }) ];

             case 1:
              _a.sent();
              return [ 4, controller.ui.closeWheelBonus() ];

             case 2:
              _a.sent();
              return [ 4, controller.ui.openWheelBonus(define.type.WHEEL_BONUS.GOLD) ];

             case 3:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      __decorate([ property(cc.Node) ], WheelSilver.prototype, "nodeLogo", void 0);
      __decorate([ property(cc.Button) ], WheelSilver.prototype, "btnCollect", void 0);
      __decorate([ property(cc.SpriteFrame) ], WheelSilver.prototype, "spfCollectActive", void 0);
      __decorate([ property(cc.SpriteFrame) ], WheelSilver.prototype, "spfCollectInactive", void 0);
      WheelSilver = __decorate([ ccclass ], WheelSilver);
      return WheelSilver;
    }(WheelBonus_1.default);
    exports.default = WheelSilver;
    cc._RF.pop();
  }, {
    "../Components/CoinLabel": "CoinLabel",
    "./WheelBonus": "WheelBonus"
  } ],
  WinAnimation: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d5ddbfIaTVOiqo/5lHuc5A8", "WinAnimation");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../Components/CoinLabel");
    var DefineType_1 = require("../Define/DefineType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var WinAnimation = function(_super) {
      __extends(WinAnimation, _super);
      function WinAnimation() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.lbCoin = void 0;
        _this.skeletonDataBigWin = null;
        _this.skeletonDataMegaWin = null;
        _this.coinController = void 0;
        _this.effectLayout = void 0;
        _this.data = {
          type: DefineType_1.WIN_TYPE.NORMAL,
          coin: 2e6
        };
        return _this;
      }
      WinAnimation.prototype.init = function(data) {
        this.data = data;
      };
      WinAnimation.prototype.play = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.coinController = new CoinLabel_1.default(this.lbCoin);
              this.effectLayout = this.getComponent("EffectLayout");
              this.lbCoin.node.opacity = 0;
              if (this.data.type == DefineType_1.WIN_TYPE.BIGWIN) {
                this.effectLayout.animData.skeletonData = this.skeletonDataBigWin;
                this.effectLayout.animData.animation = "bigwin";
              }
              if (this.data.type == DefineType_1.WIN_TYPE.MEGAWIN) {
                this.effectLayout.animData.skeletonData = this.skeletonDataMegaWin;
                this.effectLayout.animData.animation = "megawin";
              }
              return [ 4, this.onOpen() ];

             case 1:
              _a.sent();
              return [ 4, this.onClose() ];

             case 2:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      WinAnimation.prototype.onOpen = function() {
        var _this = this;
        return Promise.all([ new Promise(function(res, rej) {
          _this.effectLayout.onOpen().then(function() {
            res();
          });
        }), new Promise(function(res, rej) {
          _this.lbCoin.node.runAction(effect.bouceIn({
            time: .3,
            callback: function() {
              _this.coinController && _this.coinController.updateUserBalance(_this.data.coin, {
                subfix: " $"
              });
              _this.effectLayout && _this.effectLayout.coin.play();
              res();
            }
          }));
        }) ]);
      };
      WinAnimation.prototype.onClose = function() {
        return __awaiter(this, void 0, void 0, function() {
          var listNode;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              listNode = [ this.lbCoin.node ];
              return [ 4, Promise.all(listNode.map(function(o, i) {
                return new Promise(function(res, rej) {
                  o ? o.runAction(effect.bouceOut({
                    time: .3 + .15 * i,
                    callback: function() {
                      res();
                    }
                  })) : res();
                });
              })) ];

             case 1:
              _a.sent();
              if (!this.effectLayout) return [ 3, 3 ];
              return [ 4, this.effectLayout.onClose() ];

             case 2:
              _a.sent();
              _a.label = 3;

             case 3:
              this.node && this.onRelease();
              return [ 2 ];
            }
          });
        });
      };
      WinAnimation.prototype.onRelease = function() {
        this.effectLayout.onRelease();
      };
      __decorate([ property(cc.Label) ], WinAnimation.prototype, "lbCoin", void 0);
      __decorate([ property(sp.SkeletonData) ], WinAnimation.prototype, "skeletonDataBigWin", void 0);
      __decorate([ property(sp.SkeletonData) ], WinAnimation.prototype, "skeletonDataMegaWin", void 0);
      WinAnimation = __decorate([ ccclass ], WinAnimation);
      return WinAnimation;
    }(cc.Component);
    exports.default = WinAnimation;
    cc._RF.pop();
  }, {
    "../Components/CoinLabel": "CoinLabel",
    "../Define/DefineType": "DefineType"
  } ],
  auth: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a2a548X5aVKa73+sUjHuuhj", "auth");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AuthEngine = function() {
      function AuthEngine() {
        this._internalStorage = {};
        this.isLocalStorageEnabled = this._checkLocalStorageEnabled();
      }
      AuthEngine.prototype._checkLocalStorageEnabled = function() {
        var err;
        try {
          cc.sys.localStorage;
          cc.sys.localStorage.setItem("__scLocalStorageTest", 1);
          cc.sys.localStorage.removeItem("__scLocalStorageTest");
        } catch (e) {
          err = e;
        }
        return !err;
      };
      AuthEngine.prototype.saveToken = function(name, token, options, callback) {
        this.isLocalStorageEnabled && cc.sys.localStorage ? cc.sys.localStorage.setItem(name, token) : this._internalStorage[name] = token;
        callback && callback(null, token);
      };
      AuthEngine.prototype.removeToken = function(name, callback) {
        var token;
        this.loadToken(name, function(err, authToken) {
          token = authToken;
        });
        this.isLocalStorageEnabled && cc.sys.localStorage ? cc.sys.localStorage.removeItem(name) : delete this._internalStorage[name];
        callback && callback(null, token);
      };
      AuthEngine.prototype.loadToken = function(name, callback) {
        var token;
        token = this.isLocalStorageEnabled && cc.sys.localStorage ? cc.sys.localStorage.getItem(name) : this._internalStorage[name] || null;
        callback(null, token);
      };
      return AuthEngine;
    }();
    exports.AuthEngine = AuthEngine;
    cc._RF.pop();
  }, {} ]
}, {}, [ "AccumulatedBar1", "AnimationController1", "MinigameController1", "ResourceMinigame1", "ResourceController1", "SlotController1", "SlotItem1", "AccumulatedBar2", "AnimationController2", "MinigameController2", "ResourceMinigame2", "ResourceController2", "SlotController2", "SlotItem2", "AnimationController3", "ItemSkeleton", "MinigameController3", "ResourceMinigame3", "ResourceController3", "SlotController3", "SlotItem3", "AnimationController4", "AtributeStatic", "ResourceController4", "SlotController4", "SlotItem4", "MinigameController4", "ResourceMinigame4", "AnimationController5", "MinigameController5", "ResourceMiniGame5", "ResourceController5", "SlotController5", "SlotItem5", "AnimationController6", "MinigameController6", "ResourceMiniGame6", "ResourceController6", "SlotController6", "SlotItem6", "AnimationController7", "MinigameController7", "ResourceMiniGame7", "ResourceController7", "SlotController7", "SlotItem7", "AnimationController8", "MinigameController8", "ResourceMiniGame8", "ResourceController8", "SlotController8", "SlotItem8", "CoinAnimation", "DailyRewardAnimation", "ItemAnimation", "LevelUpAnimation", "WinAnimation", "Api", "BottomBarController", "BottomGameBarController", "BottomHomeBarController", "MultiScene", "TopBarController", "BasePopup", "AccumulatedBar", "Avatar", "CoinLabel", "WheelComp", "DefineColor", "DefineInterface", "DefineKey", "DefineString", "DefineType", "DefineZIndex", "Dialog", "DownloadCtr", "Effect", "EffectLayout", "GameConfig", "GameDefine", "GameScene", "HomeScene", "ItemGame", "UserInfoController", "LoadingScene", "Main", "PlatformController", "AndroidAdmob", "AndroidFacebook", "AndroidFirebase", "AndroidHandle", "AndroidIap", "AndroidOnesignal", "IOSAdmob", "IOSFacebook", "IOSFireBase", "IOSHandle", "IOSIap", "IOSOnesignal", "WebAdmob", "WebFacebook", "WebFirebase", "WebHandle", "WebIap", "WebOnesignal", "PopupDailyQuest", "PopupSetting", "PopupShop", "AutoFitCanvas", "ImageScale", "MarginWithIphoneX", "AnimationController", "Item", "LinesController", "PayTable", "PayTableResource", "ResourceController", "ResourcePrefab", "SlotController", "SlotItem", "SlotSkeleton", "SoundController", "Store", "Tracking", "UIController", "GameUtil", "StringUtil", "WheelBonus", "WheelGold", "WheelSilver", "auth" ]);