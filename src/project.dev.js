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
    "use strict";
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    module.exports = function(qs, sep, eq, options) {
      sep = sep || "&";
      eq = eq || "=";
      var obj = {};
      if ("string" !== typeof qs || 0 === qs.length) return obj;
      var regexp = /\+/g;
      qs = qs.split(sep);
      var maxKeys = 1e3;
      options && "number" === typeof options.maxKeys && (maxKeys = options.maxKeys);
      var len = qs.length;
      maxKeys > 0 && len > maxKeys && (len = maxKeys);
      for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, "%20"), idx = x.indexOf(eq), kstr, vstr, k, v;
        if (idx >= 0) {
          kstr = x.substr(0, idx);
          vstr = x.substr(idx + 1);
        } else {
          kstr = x;
          vstr = "";
        }
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
        hasOwnProperty(obj, k) ? isArray(obj[k]) ? obj[k].push(v) : obj[k] = [ obj[k], v ] : obj[k] = v;
      }
      return obj;
    };
    var isArray = Array.isArray || function(xs) {
      return "[object Array]" === Object.prototype.toString.call(xs);
    };
  }, {} ],
  6: [ function(require, module, exports) {
    "use strict";
    var stringifyPrimitive = function(v) {
      switch (typeof v) {
       case "string":
        return v;

       case "boolean":
        return v ? "true" : "false";

       case "number":
        return isFinite(v) ? v : "";

       default:
        return "";
      }
    };
    module.exports = function(obj, sep, eq, name) {
      sep = sep || "&";
      eq = eq || "=";
      null === obj && (obj = void 0);
      if ("object" === typeof obj) return map(objectKeys(obj), function(k) {
        var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
        return isArray(obj[k]) ? map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep) : ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }).join(sep);
      if (!name) return "";
      return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
    };
    var isArray = Array.isArray || function(xs) {
      return "[object Array]" === Object.prototype.toString.call(xs);
    };
    function map(xs, f) {
      if (xs.map) return xs.map(f);
      var res = [];
      for (var i = 0; i < xs.length; i++) res.push(f(xs[i], i));
      return res;
    }
    var objectKeys = Object.keys || function(obj) {
      var res = [];
      for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && res.push(key);
      return res;
    };
  }, {} ],
  7: [ function(require, module, exports) {
    "use strict";
    exports.decode = exports.parse = require("./decode");
    exports.encode = exports.stringify = require("./encode");
  }, {
    "./decode": 5,
    "./encode": 6
  } ],
  8: [ function(require, module, exports) {
    arguments[4][1][0].apply(exports, arguments);
  }, {
    dup: 1
  } ],
  9: [ function(require, module, exports) {
    "use strict";
    var base64 = require("base64-js");
    var ieee754 = require("ieee754");
    exports.Buffer = Buffer;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
    Buffer.TYPED_ARRAY_SUPPORT || "undefined" === typeof console || "function" !== typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    function typedArraySupport() {
      try {
        var arr = new Uint8Array(1);
        arr.__proto__ = {
          __proto__: Uint8Array.prototype,
          foo: function() {
            return 42;
          }
        };
        return 42 === arr.foo();
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer.isBuffer(this)) return;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer.isBuffer(this)) return;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) throw new RangeError('The value "' + length + '" is invalid for option "size"');
      var buf = new Uint8Array(length);
      buf.__proto__ = Buffer.prototype;
      return buf;
    }
    function Buffer(arg, encodingOrOffset, length) {
      if ("number" === typeof arg) {
        if ("string" === typeof encodingOrOffset) throw new TypeError('The "string" argument must be of type string. Received type number');
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    "undefined" !== typeof Symbol && null != Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    });
    Buffer.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if ("string" === typeof value) return fromString(value, encodingOrOffset);
      if (ArrayBuffer.isView(value)) return fromArrayLike(value);
      if (null == value) throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) return fromArrayBuffer(value, encodingOrOffset, length);
      if ("number" === typeof value) throw new TypeError('The "value" argument must not be of type number. Received type number');
      var valueOf = value.valueOf && value.valueOf();
      if (null != valueOf && valueOf !== value) return Buffer.from(valueOf, encodingOrOffset, length);
      var b = fromObject(value);
      if (b) return b;
      if ("undefined" !== typeof Symbol && null != Symbol.toPrimitive && "function" === typeof value[Symbol.toPrimitive]) return Buffer.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    }
    Buffer.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;
    function assertSize(size) {
      if ("number" !== typeof size) throw new TypeError('"size" argument must be of type number');
      if (size < 0) throw new RangeError('The value "' + size + '" is invalid for option "size"');
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) return createBuffer(size);
      if (void 0 !== fill) return "string" === typeof encoding ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      return createBuffer(size);
    }
    Buffer.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : 0 | checked(size));
    }
    Buffer.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      "string" === typeof encoding && "" !== encoding || (encoding = "utf8");
      if (!Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
      var length = 0 | byteLength(string, encoding);
      var buf = createBuffer(length);
      var actual = buf.write(string, encoding);
      actual !== length && (buf = buf.slice(0, actual));
      return buf;
    }
    function fromArrayLike(array) {
      var length = array.length < 0 ? 0 : 0 | checked(array.length);
      var buf = createBuffer(length);
      for (var i = 0; i < length; i += 1) buf[i] = 255 & array[i];
      return buf;
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError('"offset" is outside of buffer bounds');
      if (array.byteLength < byteOffset + (length || 0)) throw new RangeError('"length" is outside of buffer bounds');
      var buf;
      buf = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
      buf.__proto__ = Buffer.prototype;
      return buf;
    }
    function fromObject(obj) {
      if (Buffer.isBuffer(obj)) {
        var len = 0 | checked(obj.length);
        var buf = createBuffer(len);
        if (0 === buf.length) return buf;
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (void 0 !== obj.length) {
        if ("number" !== typeof obj.length || numberIsNaN(obj.length)) return createBuffer(0);
        return fromArrayLike(obj);
      }
      if ("Buffer" === obj.type && Array.isArray(obj.data)) return fromArrayLike(obj.data);
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      return 0 | length;
    }
    function SlowBuffer(length) {
      +length != length && (length = 0);
      return Buffer.alloc(+length);
    }
    Buffer.isBuffer = function isBuffer(b) {
      return null != b && true === b._isBuffer && b !== Buffer.prototype;
    };
    Buffer.compare = function compare(a, b) {
      isInstance(a, Uint8Array) && (a = Buffer.from(a, a.offset, a.byteLength));
      isInstance(b, Uint8Array) && (b = Buffer.from(b, b.offset, b.byteLength));
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
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
      if (!Array.isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
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
        isInstance(buf, Uint8Array) && (buf = Buffer.from(buf));
        if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer.isBuffer(string)) return string.length;
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) return string.byteLength;
      if ("string" !== typeof string) throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
      var len = string.length;
      var mustMatch = arguments.length > 2 && true === arguments[2];
      if (!mustMatch && 0 === len) return 0;
      var loweredCase = false;
      for (;;) switch (encoding) {
       case "ascii":
       case "latin1":
       case "binary":
        return len;

       case "utf8":
       case "utf-8":
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
        if (loweredCase) return mustMatch ? -1 : utf8ToBytes(string).length;
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
      var length = this.length;
      if (0 === length) return "";
      if (0 === arguments.length) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer.prototype.toLocaleString = Buffer.prototype.toString;
    Buffer.prototype.equals = function equals(b) {
      if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
      if (this === b) return true;
      return 0 === Buffer.compare(this, b);
    };
    Buffer.prototype.inspect = function inspect() {
      var str = "";
      var max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      this.length > max && (str += " ... ");
      return "<Buffer " + str + ">";
    };
    Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      isInstance(target, Uint8Array) && (target = Buffer.from(target, target.offset, target.byteLength));
      if (!Buffer.isBuffer(target)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
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
      numberIsNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1);
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
        if ("function" === typeof Uint8Array.prototype.indexOf) return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
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
      length > strLen / 2 && (length = strLen / 2);
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(2 * i, 2), 16);
        if (numberIsNaN(parsed)) return i;
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
        offset >>>= 0;
        if (isFinite(length)) {
          length >>>= 0;
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
      var newBuf = this.subarray(start, end);
      newBuf.__proto__ = Buffer.prototype;
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
      offset >>>= 0;
      byteLength >>>= 0;
      noAssert || checkOffset(offset, byteLength, this.length);
      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
      return val;
    };
    Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
      offset >>>= 0;
      byteLength >>>= 0;
      noAssert || checkOffset(offset, byteLength, this.length);
      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
      return val;
    };
    Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
    };
    Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
      offset >>>= 0;
      byteLength >>>= 0;
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
      offset >>>= 0;
      byteLength >>>= 0;
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
      offset >>>= 0;
      noAssert || checkOffset(offset, 1, this.length);
      if (!(128 & this[offset])) return this[offset];
      return -1 * (255 - this[offset] + 1);
    };
    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 2, this.length);
      var val = this[offset] | this[offset + 1] << 8;
      return 32768 & val ? 4294901760 | val : val;
    };
    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | this[offset] << 8;
      return 32768 & val ? 4294901760 | val : val;
    };
    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset >>>= 0;
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
      offset >>>= 0;
      byteLength >>>= 0;
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
      offset >>>= 0;
      byteLength >>>= 0;
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
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 1, 255, 0);
      this[offset] = 255 & value;
      return offset + 1;
    };
    Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = 255 & value;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = 255 & value;
      return offset + 2;
    };
    Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = 255 & value;
      return offset + 4;
    };
    Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = 255 & value;
      return offset + 4;
    };
    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
      value = +value;
      offset >>>= 0;
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
      offset >>>= 0;
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
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 1, 127, -128);
      value < 0 && (value = 255 + value + 1);
      this[offset] = 255 & value;
      return offset + 1;
    };
    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = 255 & value;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = 255 & value;
      return offset + 2;
    };
    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = 255 & value;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
      value < 0 && (value = 4294967295 + value + 1);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = 255 & value;
      return offset + 4;
    };
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset >>>= 0;
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
      value = +value;
      offset >>>= 0;
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
      if (!Buffer.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      start || (start = 0);
      end || 0 === end || (end = this.length);
      targetStart >= target.length && (targetStart = target.length);
      targetStart || (targetStart = 0);
      end > 0 && end < start && (end = start);
      if (end === start) return 0;
      if (0 === target.length || 0 === this.length) return 0;
      if (targetStart < 0) throw new RangeError("targetStart out of bounds");
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      end > this.length && (end = this.length);
      target.length - targetStart < end - start && (end = target.length - targetStart + start);
      var len = end - start;
      if (this === target && "function" === typeof Uint8Array.prototype.copyWithin) this.copyWithin(targetStart, start, end); else if (this === target && start < targetStart && targetStart < end) for (var i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
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
        if (void 0 !== encoding && "string" !== typeof encoding) throw new TypeError("encoding must be a string");
        if ("string" === typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        if (1 === val.length) {
          var code = val.charCodeAt(0);
          ("utf8" === encoding && code < 128 || "latin1" === encoding) && (val = code);
        }
      } else "number" === typeof val && (val &= 255);
      if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
      if (end <= start) return this;
      start >>>= 0;
      end = void 0 === end ? this.length : end >>> 0;
      val || (val = 0);
      var i;
      if ("number" === typeof val) for (i = start; i < end; ++i) this[i] = val; else {
        var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
        var len = bytes.length;
        if (0 === len) throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
      }
      return this;
    };
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) str += "=";
      return str;
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
    function isInstance(obj, type) {
      return obj instanceof type || null != obj && null != obj.constructor && null != obj.constructor.name && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
  }, {
    "base64-js": 8,
    ieee754: 13
  } ],
  10: [ function(require, module, exports) {
    (function(Buffer) {
      var clone = function() {
        "use strict";
        function _instanceof(obj, type) {
          return null != type && obj instanceof type;
        }
        var nativeMap;
        try {
          nativeMap = Map;
        } catch (_) {
          nativeMap = function() {};
        }
        var nativeSet;
        try {
          nativeSet = Set;
        } catch (_) {
          nativeSet = function() {};
        }
        var nativePromise;
        try {
          nativePromise = Promise;
        } catch (_) {
          nativePromise = function() {};
        }
        function clone(parent, circular, depth, prototype, includeNonEnumerable) {
          if ("object" === typeof circular) {
            depth = circular.depth;
            prototype = circular.prototype;
            includeNonEnumerable = circular.includeNonEnumerable;
            circular = circular.circular;
          }
          var allParents = [];
          var allChildren = [];
          var useBuffer = "undefined" != typeof Buffer;
          "undefined" == typeof circular && (circular = true);
          "undefined" == typeof depth && (depth = Infinity);
          function _clone(parent, depth) {
            if (null === parent) return null;
            if (0 === depth) return parent;
            var child;
            var proto;
            if ("object" != typeof parent) return parent;
            if (_instanceof(parent, nativeMap)) child = new nativeMap(); else if (_instanceof(parent, nativeSet)) child = new nativeSet(); else if (_instanceof(parent, nativePromise)) child = new nativePromise(function(resolve, reject) {
              parent.then(function(value) {
                resolve(_clone(value, depth - 1));
              }, function(err) {
                reject(_clone(err, depth - 1));
              });
            }); else if (clone.__isArray(parent)) child = []; else if (clone.__isRegExp(parent)) {
              child = new RegExp(parent.source, __getRegExpFlags(parent));
              parent.lastIndex && (child.lastIndex = parent.lastIndex);
            } else if (clone.__isDate(parent)) child = new Date(parent.getTime()); else {
              if (useBuffer && Buffer.isBuffer(parent)) {
                child = new Buffer(parent.length);
                parent.copy(child);
                return child;
              }
              if (_instanceof(parent, Error)) child = Object.create(parent); else if ("undefined" == typeof prototype) {
                proto = Object.getPrototypeOf(parent);
                child = Object.create(proto);
              } else {
                child = Object.create(prototype);
                proto = prototype;
              }
            }
            if (circular) {
              var index = allParents.indexOf(parent);
              if (-1 != index) return allChildren[index];
              allParents.push(parent);
              allChildren.push(child);
            }
            _instanceof(parent, nativeMap) && parent.forEach(function(value, key) {
              var keyChild = _clone(key, depth - 1);
              var valueChild = _clone(value, depth - 1);
              child.set(keyChild, valueChild);
            });
            _instanceof(parent, nativeSet) && parent.forEach(function(value) {
              var entryChild = _clone(value, depth - 1);
              child.add(entryChild);
            });
            for (var i in parent) {
              var attrs;
              proto && (attrs = Object.getOwnPropertyDescriptor(proto, i));
              if (attrs && null == attrs.set) continue;
              child[i] = _clone(parent[i], depth - 1);
            }
            if (Object.getOwnPropertySymbols) {
              var symbols = Object.getOwnPropertySymbols(parent);
              for (var i = 0; i < symbols.length; i++) {
                var symbol = symbols[i];
                var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
                if (descriptor && !descriptor.enumerable && !includeNonEnumerable) continue;
                child[symbol] = _clone(parent[symbol], depth - 1);
                descriptor.enumerable || Object.defineProperty(child, symbol, {
                  enumerable: false
                });
              }
            }
            if (includeNonEnumerable) {
              var allPropertyNames = Object.getOwnPropertyNames(parent);
              for (var i = 0; i < allPropertyNames.length; i++) {
                var propertyName = allPropertyNames[i];
                var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
                if (descriptor && descriptor.enumerable) continue;
                child[propertyName] = _clone(parent[propertyName], depth - 1);
                Object.defineProperty(child, propertyName, {
                  enumerable: false
                });
              }
            }
            return child;
          }
          return _clone(parent, depth);
        }
        clone.clonePrototype = function clonePrototype(parent) {
          if (null === parent) return null;
          var c = function() {};
          c.prototype = parent;
          return new c();
        };
        function __objToStr(o) {
          return Object.prototype.toString.call(o);
        }
        clone.__objToStr = __objToStr;
        function __isDate(o) {
          return "object" === typeof o && "[object Date]" === __objToStr(o);
        }
        clone.__isDate = __isDate;
        function __isArray(o) {
          return "object" === typeof o && "[object Array]" === __objToStr(o);
        }
        clone.__isArray = __isArray;
        function __isRegExp(o) {
          return "object" === typeof o && "[object RegExp]" === __objToStr(o);
        }
        clone.__isRegExp = __isRegExp;
        function __getRegExpFlags(re) {
          var flags = "";
          re.global && (flags += "g");
          re.ignoreCase && (flags += "i");
          re.multiline && (flags += "m");
          return flags;
        }
        clone.__getRegExpFlags = __getRegExpFlags;
        return clone;
      }();
      "object" === typeof module && module.exports && (module.exports = clone);
    }).call(this, require("buffer").Buffer);
  }, {
    buffer: 2
  } ],
  11: [ function(require, module, exports) {
    "undefined" !== typeof module && (module.exports = Emitter);
    function Emitter(obj) {
      if (obj) return mixin(obj);
    }
    function mixin(obj) {
      for (var key in Emitter.prototype) obj[key] = Emitter.prototype[key];
      return obj;
    }
    Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
      this._callbacks = this._callbacks || {};
      (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
      return this;
    };
    Emitter.prototype.once = function(event, fn) {
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }
      on.fn = fn;
      this.on(event, on);
      return this;
    };
    Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
      this._callbacks = this._callbacks || {};
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }
      var callbacks = this._callbacks["$" + event];
      if (!callbacks) return this;
      if (1 == arguments.length) {
        delete this._callbacks["$" + event];
        return this;
      }
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };
    Emitter.prototype.emit = function(event) {
      this._callbacks = this._callbacks || {};
      var args = [].slice.call(arguments, 1), callbacks = this._callbacks["$" + event];
      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) callbacks[i].apply(this, args);
      }
      return this;
    };
    Emitter.prototype.listeners = function(event) {
      this._callbacks = this._callbacks || {};
      return this._callbacks["$" + event] || [];
    };
    Emitter.prototype.hasListeners = function(event) {
      return !!this.listeners(event).length;
    };
  }, {} ],
  12: [ function(require, module, exports) {
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
  13: [ function(require, module, exports) {
    arguments[4][4][0].apply(exports, arguments);
  }, {
    dup: 4
  } ],
  14: [ function(require, module, exports) {
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
  15: [ function(require, module, exports) {
    arguments[4][3][0].apply(exports, arguments);
  }, {
    dup: 3
  } ],
  16: [ function(require, module, exports) {
    "use strict";
    var errorMessage;
    errorMessage = "An argument without append, prepend, or detach methods was given to `List";
    function List() {
      if (arguments.length) return List.from(arguments);
    }
    var ListPrototype;
    ListPrototype = List.prototype;
    List.of = function() {
      return List.from.call(this, arguments);
    };
    List.from = function(items) {
      var list = new this(), length, iterator, item;
      if (items && (length = items.length)) {
        iterator = -1;
        while (++iterator < length) {
          item = items[iterator];
          null !== item && void 0 !== item && list.append(item);
        }
      }
      return list;
    };
    ListPrototype.head = null;
    ListPrototype.tail = null;
    ListPrototype.toArray = function() {
      var item = this.head, result = [];
      while (item) {
        result.push(item);
        item = item.next;
      }
      return result;
    };
    ListPrototype.prepend = function(item) {
      if (!item) return false;
      if (!item.append || !item.prepend || !item.detach) throw new Error(errorMessage + "#prepend`.");
      var self, head;
      self = this;
      head = self.head;
      if (head) return head.prepend(item);
      item.detach();
      item.list = self;
      self.head = item;
      return item;
    };
    ListPrototype.append = function(item) {
      if (!item) return false;
      if (!item.append || !item.prepend || !item.detach) throw new Error(errorMessage + "#append`.");
      var self, head, tail;
      self = this;
      tail = self.tail;
      if (tail) return tail.append(item);
      head = self.head;
      if (head) return head.append(item);
      item.detach();
      item.list = self;
      self.head = item;
      return item;
    };
    function ListItem() {}
    List.Item = ListItem;
    var ListItemPrototype = ListItem.prototype;
    ListItemPrototype.next = null;
    ListItemPrototype.prev = null;
    ListItemPrototype.list = null;
    ListItemPrototype.detach = function() {
      var self = this, list = self.list, prev = self.prev, next = self.next;
      if (!list) return self;
      list.tail === self && (list.tail = prev);
      list.head === self && (list.head = next);
      list.tail === list.head && (list.tail = null);
      prev && (prev.next = next);
      next && (next.prev = prev);
      self.prev = self.next = self.list = null;
      return self;
    };
    ListItemPrototype.prepend = function(item) {
      if (!item || !item.append || !item.prepend || !item.detach) throw new Error(errorMessage + "Item#prepend`.");
      var self = this, list = self.list, prev = self.prev;
      if (!list) return false;
      item.detach();
      if (prev) {
        item.prev = prev;
        prev.next = item;
      }
      item.next = self;
      item.list = list;
      self.prev = item;
      self === list.head && (list.head = item);
      list.tail || (list.tail = self);
      return item;
    };
    ListItemPrototype.append = function(item) {
      if (!item || !item.append || !item.prepend || !item.detach) throw new Error(errorMessage + "Item#append`.");
      var self = this, list = self.list, next = self.next;
      if (!list) return false;
      item.detach();
      if (next) {
        item.next = next;
        next.prev = item;
      }
      item.prev = self;
      item.list = list;
      self.next = item;
      self !== list.tail && list.tail || (list.tail = item);
      return item;
    };
    module.exports = List;
  }, {} ],
  17: [ function(require, module, exports) {
    "use strict";
    module.exports = require("./_source/linked-list.js");
  }, {
    "./_source/linked-list.js": 16
  } ],
  18: [ function(require, module, exports) {
    exports.encode = require("./encode").encode;
    exports.decode = require("./decode").decode;
    exports.Encoder = require("./encoder").Encoder;
    exports.Decoder = require("./decoder").Decoder;
    exports.createCodec = require("./ext").createCodec;
    exports.codec = require("./codec").codec;
  }, {
    "./codec": 27,
    "./decode": 29,
    "./decoder": 30,
    "./encode": 32,
    "./encoder": 33,
    "./ext": 37
  } ],
  19: [ function(require, module, exports) {
    (function(Buffer) {
      module.exports = c("undefined" !== typeof Buffer && Buffer) || c(this.Buffer) || c("undefined" !== typeof window && window.Buffer) || this.Buffer;
      function c(B) {
        return B && B.isBuffer && B;
      }
    }).call(this, require("buffer").Buffer);
  }, {
    buffer: 2
  } ],
  20: [ function(require, module, exports) {
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
  21: [ function(require, module, exports) {
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
    "./bufferish": 25
  } ],
  22: [ function(require, module, exports) {
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
    "./bufferish": 25
  } ],
  23: [ function(require, module, exports) {
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
    "./buffer-lite": 20,
    "./bufferish": 25
  } ],
  24: [ function(require, module, exports) {
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
    "./bufferish": 25
  } ],
  25: [ function(require, module, exports) {
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
    "./buffer-global": 19,
    "./bufferish-array": 21,
    "./bufferish-buffer": 22,
    "./bufferish-proto": 23,
    "./bufferish-uint8array": 24,
    isarray: 15
  } ],
  26: [ function(require, module, exports) {
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
    "./bufferish": 25,
    isarray: 15
  } ],
  27: [ function(require, module, exports) {
    require("./read-core");
    require("./write-core");
    exports.codec = {
      preset: require("./codec-base").preset
    };
  }, {
    "./codec-base": 26,
    "./read-core": 39,
    "./write-core": 42
  } ],
  28: [ function(require, module, exports) {
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
    "./flex-buffer": 38,
    "./read-core": 39
  } ],
  29: [ function(require, module, exports) {
    exports.decode = decode;
    var DecodeBuffer = require("./decode-buffer").DecodeBuffer;
    function decode(input, options) {
      var decoder = new DecodeBuffer(options);
      decoder.write(input);
      return decoder.read();
    }
  }, {
    "./decode-buffer": 28
  } ],
  30: [ function(require, module, exports) {
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
    "./decode-buffer": 28,
    "event-lite": 12
  } ],
  31: [ function(require, module, exports) {
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
    "./flex-buffer": 38,
    "./write-core": 42
  } ],
  32: [ function(require, module, exports) {
    exports.encode = encode;
    var EncodeBuffer = require("./encode-buffer").EncodeBuffer;
    function encode(input, options) {
      var encoder = new EncodeBuffer(options);
      encoder.write(input);
      return encoder.read();
    }
  }, {
    "./encode-buffer": 31
  } ],
  33: [ function(require, module, exports) {
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
    "./encode-buffer": 31,
    "event-lite": 12
  } ],
  34: [ function(require, module, exports) {
    exports.ExtBuffer = ExtBuffer;
    var Bufferish = require("./bufferish");
    function ExtBuffer(buffer, type) {
      if (!(this instanceof ExtBuffer)) return new ExtBuffer(buffer, type);
      this.buffer = Bufferish.from(buffer);
      this.type = type;
    }
  }, {
    "./bufferish": 25
  } ],
  35: [ function(require, module, exports) {
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
    "./bufferish": 25,
    "./encode": 32
  } ],
  36: [ function(require, module, exports) {
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
    "./bufferish": 25,
    "./decode": 29
  } ],
  37: [ function(require, module, exports) {
    require("./read-core");
    require("./write-core");
    exports.createCodec = require("./codec-base").createCodec;
  }, {
    "./codec-base": 26,
    "./read-core": 39,
    "./write-core": 42
  } ],
  38: [ function(require, module, exports) {
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
    "./bufferish": 25
  } ],
  39: [ function(require, module, exports) {
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
    "./codec-base": 26,
    "./ext-buffer": 34,
    "./ext-unpacker": 36,
    "./read-format": 40,
    "./read-token": 41
  } ],
  40: [ function(require, module, exports) {
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
    "./bufferish": 25,
    "./bufferish-proto": 23,
    ieee754: 13,
    "int64-buffer": 14
  } ],
  41: [ function(require, module, exports) {
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
    "./read-format": 40
  } ],
  42: [ function(require, module, exports) {
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
    "./codec-base": 26,
    "./ext-buffer": 34,
    "./ext-packer": 35,
    "./write-type": 44
  } ],
  43: [ function(require, module, exports) {
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
    "./bufferish": 25,
    "./write-uint8": 45,
    ieee754: 13,
    "int64-buffer": 14
  } ],
  44: [ function(require, module, exports) {
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
    "./bufferish": 25,
    "./bufferish-proto": 23,
    "./ext-buffer": 34,
    "./write-token": 43,
    "./write-uint8": 45,
    "int64-buffer": 14,
    isarray: 15
  } ],
  45: [ function(require, module, exports) {
    var constant = exports.uint8 = new Array(256);
    for (var i = 0; i <= 255; i++) constant[i] = write0(i);
    function write0(type) {
      return function(encoder) {
        var offset = encoder.reserve(1);
        encoder.buffer[offset] = type;
      };
    }
  }, {} ],
  46: [ function(require, module, exports) {
    var Emitter = require("component-emitter");
    var SCChannel = function(name, client, options) {
      var self = this;
      Emitter.call(this);
      this.PENDING = "pending";
      this.SUBSCRIBED = "subscribed";
      this.UNSUBSCRIBED = "unsubscribed";
      this.name = name;
      this.state = this.UNSUBSCRIBED;
      this.client = client;
      this.options = options || {};
      this.setOptions(this.options);
    };
    SCChannel.prototype = Object.create(Emitter.prototype);
    SCChannel.prototype.setOptions = function(options) {
      options || (options = {});
      this.waitForAuth = options.waitForAuth || false;
      this.batch = options.batch || false;
      void 0 !== options.data && (this.data = options.data);
    };
    SCChannel.prototype.getState = function() {
      return this.state;
    };
    SCChannel.prototype.subscribe = function(options) {
      this.client.subscribe(this.name, options);
    };
    SCChannel.prototype.unsubscribe = function() {
      this.client.unsubscribe(this.name);
    };
    SCChannel.prototype.isSubscribed = function(includePending) {
      return this.client.isSubscribed(this.name, includePending);
    };
    SCChannel.prototype.publish = function(data, callback) {
      this.client.publish(this.name, data, callback);
    };
    SCChannel.prototype.watch = function(handler) {
      this.client.watch(this.name, handler);
    };
    SCChannel.prototype.unwatch = function(handler) {
      this.client.unwatch(this.name, handler);
    };
    SCChannel.prototype.watchers = function() {
      return this.client.watchers(this.name);
    };
    SCChannel.prototype.destroy = function() {
      this.client.destroyChannel(this.name);
    };
    module.exports.SCChannel = SCChannel;
  }, {
    "component-emitter": 11
  } ],
  47: [ function(require, module, exports) {
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
    "msgpack-lite": 18
  } ],
  48: [ function(require, module, exports) {
    module.exports = function decycle(object) {
      var objects = [], paths = [];
      return function derez(value, path) {
        var i, name, nu;
        if ("object" === typeof value && null !== value && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {
          for (i = 0; i < objects.length; i += 1) if (objects[i] === value) return {
            $ref: paths[i]
          };
          objects.push(value);
          paths.push(path);
          if ("[object Array]" === Object.prototype.toString.apply(value)) {
            nu = [];
            for (i = 0; i < value.length; i += 1) nu[i] = derez(value[i], path + "[" + i + "]");
          } else {
            nu = {};
            for (name in value) Object.prototype.hasOwnProperty.call(value, name) && (nu[name] = derez(value[name], path + "[" + JSON.stringify(name) + "]"));
          }
          return nu;
        }
        return value;
      }(object, "$");
    };
  }, {} ],
  49: [ function(require, module, exports) {
    var decycle = require("./decycle");
    var isStrict = function() {
      return !this;
    }();
    function AuthTokenExpiredError(message, expiry) {
      this.name = "AuthTokenExpiredError";
      this.message = message;
      this.expiry = expiry;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    AuthTokenExpiredError.prototype = Object.create(Error.prototype);
    function AuthTokenInvalidError(message) {
      this.name = "AuthTokenInvalidError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    AuthTokenInvalidError.prototype = Object.create(Error.prototype);
    function AuthTokenNotBeforeError(message, date) {
      this.name = "AuthTokenNotBeforeError";
      this.message = message;
      this.date = date;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    AuthTokenNotBeforeError.prototype = Object.create(Error.prototype);
    function AuthTokenError(message) {
      this.name = "AuthTokenError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    AuthTokenError.prototype = Object.create(Error.prototype);
    function SilentMiddlewareBlockedError(message, type) {
      this.name = "SilentMiddlewareBlockedError";
      this.message = message;
      this.type = type;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    SilentMiddlewareBlockedError.prototype = Object.create(Error.prototype);
    function InvalidActionError(message) {
      this.name = "InvalidActionError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    InvalidActionError.prototype = Object.create(Error.prototype);
    function InvalidArgumentsError(message) {
      this.name = "InvalidArgumentsError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    InvalidArgumentsError.prototype = Object.create(Error.prototype);
    function InvalidOptionsError(message) {
      this.name = "InvalidOptionsError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    InvalidOptionsError.prototype = Object.create(Error.prototype);
    function InvalidMessageError(message) {
      this.name = "InvalidMessageError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    InvalidMessageError.prototype = Object.create(Error.prototype);
    function SocketProtocolError(message, code) {
      this.name = "SocketProtocolError";
      this.message = message;
      this.code = code;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    SocketProtocolError.prototype = Object.create(Error.prototype);
    function ServerProtocolError(message) {
      this.name = "ServerProtocolError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    ServerProtocolError.prototype = Object.create(Error.prototype);
    function HTTPServerError(message) {
      this.name = "HTTPServerError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    HTTPServerError.prototype = Object.create(Error.prototype);
    function ResourceLimitError(message) {
      this.name = "ResourceLimitError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    ResourceLimitError.prototype = Object.create(Error.prototype);
    function TimeoutError(message) {
      this.name = "TimeoutError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    TimeoutError.prototype = Object.create(Error.prototype);
    function BadConnectionError(message, type) {
      this.name = "BadConnectionError";
      this.message = message;
      this.type = type;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    BadConnectionError.prototype = Object.create(Error.prototype);
    function BrokerError(message) {
      this.name = "BrokerError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    BrokerError.prototype = Object.create(Error.prototype);
    function ProcessExitError(message, code) {
      this.name = "ProcessExitError";
      this.message = message;
      this.code = code;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    ProcessExitError.prototype = Object.create(Error.prototype);
    function UnknownError(message) {
      this.name = "UnknownError";
      this.message = message;
      Error.captureStackTrace && !isStrict ? Error.captureStackTrace(this, arguments.callee) : this.stack = new Error().stack;
    }
    UnknownError.prototype = Object.create(Error.prototype);
    module.exports = {
      AuthTokenExpiredError: AuthTokenExpiredError,
      AuthTokenInvalidError: AuthTokenInvalidError,
      AuthTokenNotBeforeError: AuthTokenNotBeforeError,
      AuthTokenError: AuthTokenError,
      SilentMiddlewareBlockedError: SilentMiddlewareBlockedError,
      InvalidActionError: InvalidActionError,
      InvalidArgumentsError: InvalidArgumentsError,
      InvalidOptionsError: InvalidOptionsError,
      InvalidMessageError: InvalidMessageError,
      SocketProtocolError: SocketProtocolError,
      ServerProtocolError: ServerProtocolError,
      HTTPServerError: HTTPServerError,
      ResourceLimitError: ResourceLimitError,
      TimeoutError: TimeoutError,
      BadConnectionError: BadConnectionError,
      BrokerError: BrokerError,
      ProcessExitError: ProcessExitError,
      UnknownError: UnknownError
    };
    module.exports.socketProtocolErrorStatuses = {
      1001: "Socket was disconnected",
      1002: "A WebSocket protocol error was encountered",
      1003: "Server terminated socket because it received invalid data",
      1005: "Socket closed without status code",
      1006: "Socket hung up",
      1007: "Message format was incorrect",
      1008: "Encountered a policy violation",
      1009: "Message was too big to process",
      1010: "Client ended the connection because the server did not comply with extension requirements",
      1011: "Server encountered an unexpected fatal condition",
      4000: "Server ping timed out",
      4001: "Client pong timed out",
      4002: "Server failed to sign auth token",
      4003: "Failed to complete handshake",
      4004: "Client failed to save auth token",
      4005: "Did not receive #handshake from client before timeout",
      4006: "Failed to bind socket to message broker",
      4007: "Client connection establishment timed out",
      4008: "Server rejected handshake from client"
    };
    module.exports.socketProtocolIgnoreStatuses = {
      1000: "Socket closed normally",
      1001: "Socket hung up"
    };
    var unserializableErrorProperties = {
      domain: 1,
      domainEmitter: 1,
      domainThrown: 1
    };
    module.exports.dehydrateError = function dehydrateError(error, includeStackTrace) {
      var dehydratedError;
      if (error && "object" === typeof error) {
        dehydratedError = {
          message: error.message
        };
        includeStackTrace && (dehydratedError.stack = error.stack);
        for (var i in error) unserializableErrorProperties[i] || (dehydratedError[i] = error[i]);
      } else dehydratedError = "function" === typeof error ? "[function " + (error.name || "anonymous") + "]" : error;
      return decycle(dehydratedError);
    };
    module.exports.hydrateError = function hydrateError(error) {
      var hydratedError = null;
      if (null != error) if ("object" === typeof error) {
        hydratedError = new Error(error.message);
        for (var i in error) error.hasOwnProperty(i) && (hydratedError[i] = error[i]);
      } else hydratedError = error;
      return hydratedError;
    };
    module.exports.decycle = decycle;
  }, {
    "./decycle": 48
  } ],
  50: [ function(require, module, exports) {
    (function(global) {
      var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var validJSONStartRegex = /^[ \n\r\t]*[{\[]/;
      var arrayBufferToBase64 = function(arraybuffer) {
        var bytes = new Uint8Array(arraybuffer);
        var len = bytes.length;
        var base64 = "";
        for (var i = 0; i < len; i += 3) {
          base64 += base64Chars[bytes[i] >> 2];
          base64 += base64Chars[(3 & bytes[i]) << 4 | bytes[i + 1] >> 4];
          base64 += base64Chars[(15 & bytes[i + 1]) << 2 | bytes[i + 2] >> 6];
          base64 += base64Chars[63 & bytes[i + 2]];
        }
        len % 3 === 2 ? base64 = base64.substring(0, base64.length - 1) + "=" : len % 3 === 1 && (base64 = base64.substring(0, base64.length - 2) + "==");
        return base64;
      };
      var binaryToBase64Replacer = function(key, value) {
        if (global.ArrayBuffer && value instanceof global.ArrayBuffer) return {
          base64: true,
          data: arrayBufferToBase64(value)
        };
        if (global.Buffer) {
          if (value instanceof global.Buffer) return {
            base64: true,
            data: value.toString("base64")
          };
          if (value && "Buffer" === value.type && Array.isArray(value.data)) {
            var rehydratedBuffer;
            rehydratedBuffer = global.Buffer.from ? global.Buffer.from(value.data) : new global.Buffer(value.data);
            return {
              base64: true,
              data: rehydratedBuffer.toString("base64")
            };
          }
        }
        return value;
      };
      module.exports.decode = function(input) {
        if (null == input) return null;
        if ("#1" === input || "#2" === input) return input;
        var message = input.toString();
        if (!validJSONStartRegex.test(message)) return message;
        try {
          return JSON.parse(message);
        } catch (err) {}
        return message;
      };
      module.exports.encode = function(object) {
        if ("#1" === object || "#2" === object) return object;
        return JSON.stringify(object, binaryToBase64Replacer);
      };
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {} ],
  51: [ function(require, module, exports) {
    var SCClientSocket = require("./lib/scclientsocket");
    var factory = require("./lib/factory");
    module.exports.factory = factory;
    module.exports.SCClientSocket = SCClientSocket;
    module.exports.Emitter = require("component-emitter");
    module.exports.create = function(options) {
      return factory.create(options);
    };
    module.exports.connect = module.exports.create;
    module.exports.destroy = function(socket) {
      return factory.destroy(socket);
    };
    module.exports.clients = factory.clients;
    module.exports.version = "14.2.2";
  }, {
    "./lib/factory": 53,
    "./lib/scclientsocket": 55,
    "component-emitter": 11
  } ],
  52: [ function(require, module, exports) {
    (function(global) {
      var AuthEngine = function() {
        this._internalStorage = {};
        this.isLocalStorageEnabled = this._checkLocalStorageEnabled();
      };
      AuthEngine.prototype._checkLocalStorageEnabled = function() {
        var err;
        try {
          global.localStorage;
          global.localStorage.setItem("__scLocalStorageTest", 1);
          global.localStorage.removeItem("__scLocalStorageTest");
        } catch (e) {
          err = e;
        }
        return !err;
      };
      AuthEngine.prototype.saveToken = function(name, token, options, callback) {
        this.isLocalStorageEnabled && global.localStorage ? global.localStorage.setItem(name, token) : this._internalStorage[name] = token;
        callback && callback(null, token);
      };
      AuthEngine.prototype.removeToken = function(name, callback) {
        var token;
        this.loadToken(name, function(err, authToken) {
          token = authToken;
        });
        this.isLocalStorageEnabled && global.localStorage ? global.localStorage.removeItem(name) : delete this._internalStorage[name];
        callback && callback(null, token);
      };
      AuthEngine.prototype.loadToken = function(name, callback) {
        var token;
        token = this.isLocalStorageEnabled && global.localStorage ? global.localStorage.getItem(name) : this._internalStorage[name] || null;
        callback(null, token);
      };
      module.exports.AuthEngine = AuthEngine;
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {} ],
  53: [ function(require, module, exports) {
    (function(global) {
      var SCClientSocket = require("./scclientsocket");
      var scErrors = require("sc-errors");
      var uuid = require("uuid");
      var InvalidArgumentsError = scErrors.InvalidArgumentsError;
      var _clients = {};
      function getMultiplexId(options) {
        var protocolPrefix = options.secure ? "https://" : "http://";
        var queryString = "";
        if (options.query) if ("string" === typeof options.query) queryString = options.query; else {
          var queryArray = [];
          var queryMap = options.query;
          for (var key in queryMap) queryMap.hasOwnProperty(key) && queryArray.push(key + "=" + queryMap[key]);
          queryArray.length && (queryString = "?" + queryArray.join("&"));
        }
        var host;
        host = options.host ? options.host : options.hostname + ":" + options.port;
        return protocolPrefix + host + options.path + queryString;
      }
      function isUrlSecure() {
        return global.location && "https:" === location.protocol;
      }
      function getPort(options, isSecureDefault) {
        var isSecure = null == options.secure ? isSecureDefault : options.secure;
        return options.port || (global.location && location.port ? location.port : isSecure ? 443 : 80);
      }
      function create(options) {
        var self = this;
        options = options || {};
        if (options.host && !options.host.match(/[^:]+:\d{2,5}/)) throw new InvalidArgumentsError('The host option should include both the hostname and the port number in the format "hostname:port"');
        if (options.host && options.hostname) throw new InvalidArgumentsError('The host option should already include the hostname and the port number in the format "hostname:port" - Because of this, you should never use host and hostname options together');
        if (options.host && options.port) throw new InvalidArgumentsError('The host option should already include the hostname and the port number in the format "hostname:port" - Because of this, you should never use host and port options together');
        var isSecureDefault = isUrlSecure();
        var opts = {
          port: getPort(options, isSecureDefault),
          hostname: global.location && location.hostname || "localhost",
          path: "/socketcluster/",
          secure: isSecureDefault,
          autoConnect: true,
          autoReconnect: true,
          autoSubscribeOnConnect: true,
          connectTimeout: 2e4,
          ackTimeout: 1e4,
          timestampRequests: false,
          timestampParam: "t",
          authEngine: null,
          authTokenName: "socketCluster.authToken",
          binaryType: "arraybuffer",
          multiplex: true,
          pubSubBatchDuration: null,
          cloneData: false
        };
        for (var i in options) options.hasOwnProperty(i) && (opts[i] = options[i]);
        opts.clientMap = _clients;
        if (false === opts.multiplex) {
          opts.clientId = uuid.v4();
          var socket = new SCClientSocket(opts);
          _clients[opts.clientId] = socket;
          return socket;
        }
        opts.clientId = getMultiplexId(opts);
        _clients[opts.clientId] ? opts.autoConnect && _clients[opts.clientId].connect() : _clients[opts.clientId] = new SCClientSocket(opts);
        return _clients[opts.clientId];
      }
      function destroy(socket) {
        socket.destroy();
      }
      module.exports = {
        create: create,
        destroy: destroy,
        clients: _clients
      };
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "./scclientsocket": 55,
    "sc-errors": 49,
    uuid: 58
  } ],
  54: [ function(require, module, exports) {
    var scErrors = require("sc-errors");
    var InvalidActionError = scErrors.InvalidActionError;
    var Response = function(socket, id) {
      this.socket = socket;
      this.id = id;
      this.sent = false;
    };
    Response.prototype._respond = function(responseData) {
      if (this.sent) throw new InvalidActionError("Response " + this.id + " has already been sent");
      this.sent = true;
      this.socket.send(this.socket.encode(responseData));
    };
    Response.prototype.end = function(data) {
      if (this.id) {
        var responseData = {
          rid: this.id
        };
        void 0 !== data && (responseData.data = data);
        this._respond(responseData);
      }
    };
    Response.prototype.error = function(error, data) {
      if (this.id) {
        var err = scErrors.dehydrateError(error);
        var responseData = {
          rid: this.id,
          error: err
        };
        void 0 !== data && (responseData.data = data);
        this._respond(responseData);
      }
    };
    Response.prototype.callback = function(error, data) {
      error ? this.error(error, data) : this.end(data);
    };
    module.exports.Response = Response;
  }, {
    "sc-errors": 49
  } ],
  55: [ function(require, module, exports) {
    (function(global) {
      var Emitter = require("component-emitter");
      var SCChannel = require("sc-channel").SCChannel;
      var Response = require("./response").Response;
      var AuthEngine = require("./auth").AuthEngine;
      var formatter = require("sc-formatter");
      var SCTransport = require("./sctransport").SCTransport;
      var querystring = require("querystring");
      var LinkedList = require("linked-list");
      var Buffer = require("buffer/").Buffer;
      var clone = require("clone");
      var scErrors = require("sc-errors");
      var InvalidArgumentsError = scErrors.InvalidArgumentsError;
      var InvalidMessageError = scErrors.InvalidMessageError;
      var InvalidActionError = scErrors.InvalidActionError;
      var SocketProtocolError = scErrors.SocketProtocolError;
      var TimeoutError = scErrors.TimeoutError;
      var BadConnectionError = scErrors.BadConnectionError;
      var isBrowser = "undefined" !== typeof window;
      var SCClientSocket = function(opts) {
        var self = this;
        Emitter.call(this);
        this.id = null;
        this.state = this.CLOSED;
        this.authState = this.UNAUTHENTICATED;
        this.signedAuthToken = null;
        this.authToken = null;
        this.pendingReconnect = false;
        this.pendingReconnectTimeout = null;
        this.preparingPendingSubscriptions = false;
        this.clientId = opts.clientId;
        this.connectTimeout = opts.connectTimeout;
        this.ackTimeout = opts.ackTimeout;
        this.channelPrefix = opts.channelPrefix || null;
        this.disconnectOnUnload = null == opts.disconnectOnUnload || opts.disconnectOnUnload;
        this.authTokenName = opts.authTokenName;
        this.pingTimeout = this.ackTimeout;
        this.pingTimeoutDisabled = !!opts.pingTimeoutDisabled;
        this.active = true;
        this._clientMap = opts.clientMap || {};
        var maxTimeout = Math.pow(2, 31) - 1;
        var verifyDuration = function(propertyName) {
          if (self[propertyName] > maxTimeout) throw new InvalidArgumentsError("The " + propertyName + " value provided exceeded the maximum amount allowed");
        };
        verifyDuration("connectTimeout");
        verifyDuration("ackTimeout");
        this._localEvents = {
          connect: 1,
          connectAbort: 1,
          close: 1,
          disconnect: 1,
          message: 1,
          error: 1,
          raw: 1,
          kickOut: 1,
          subscribe: 1,
          unsubscribe: 1,
          subscribeStateChange: 1,
          authStateChange: 1,
          authenticate: 1,
          deauthenticate: 1,
          removeAuthToken: 1,
          subscribeRequest: 1
        };
        this.connectAttempts = 0;
        this._emitBuffer = new LinkedList();
        this.channels = {};
        this.options = opts;
        this._cid = 1;
        this.options.callIdGenerator = function() {
          return self._cid++;
        };
        if (this.options.autoReconnect) {
          null == this.options.autoReconnectOptions && (this.options.autoReconnectOptions = {});
          var reconnectOptions = this.options.autoReconnectOptions;
          null == reconnectOptions.initialDelay && (reconnectOptions.initialDelay = 1e4);
          null == reconnectOptions.randomness && (reconnectOptions.randomness = 1e4);
          null == reconnectOptions.multiplier && (reconnectOptions.multiplier = 1.5);
          null == reconnectOptions.maxDelay && (reconnectOptions.maxDelay = 6e4);
        }
        null == this.options.subscriptionRetryOptions && (this.options.subscriptionRetryOptions = {});
        this.options.authEngine ? this.auth = this.options.authEngine : this.auth = new AuthEngine();
        this.options.codecEngine ? this.codec = this.options.codecEngine : this.codec = formatter;
        if (this.options.protocol) {
          var protocolOptionError = new InvalidArgumentsError('The "protocol" option does not affect socketcluster-client. If you want to utilize SSL/TLS - use "secure" option instead');
          this._onSCError(protocolOptionError);
        }
        this.options.path = this.options.path.replace(/\/$/, "") + "/";
        this.options.query = opts.query || {};
        "string" === typeof this.options.query && (this.options.query = querystring.parse(this.options.query));
        this._channelEmitter = new Emitter();
        this._unloadHandler = function() {
          self.disconnect();
        };
        isBrowser && this.disconnectOnUnload && global.addEventListener && global.addEventListener("beforeunload", this._unloadHandler, false);
        this._clientMap[this.clientId] = this;
        this.options.autoConnect && this.connect();
      };
      SCClientSocket.prototype = Object.create(Emitter.prototype);
      SCClientSocket.CONNECTING = SCClientSocket.prototype.CONNECTING = SCTransport.prototype.CONNECTING;
      SCClientSocket.OPEN = SCClientSocket.prototype.OPEN = SCTransport.prototype.OPEN;
      SCClientSocket.CLOSED = SCClientSocket.prototype.CLOSED = SCTransport.prototype.CLOSED;
      SCClientSocket.AUTHENTICATED = SCClientSocket.prototype.AUTHENTICATED = "authenticated";
      SCClientSocket.UNAUTHENTICATED = SCClientSocket.prototype.UNAUTHENTICATED = "unauthenticated";
      SCClientSocket.PENDING = SCClientSocket.prototype.PENDING = "pending";
      SCClientSocket.ignoreStatuses = scErrors.socketProtocolIgnoreStatuses;
      SCClientSocket.errorStatuses = scErrors.socketProtocolErrorStatuses;
      SCClientSocket.prototype._privateEventHandlerMap = {
        "#publish": function(data) {
          var undecoratedChannelName = this._undecorateChannelName(data.channel);
          var isSubscribed = this.isSubscribed(undecoratedChannelName, true);
          isSubscribed && this._channelEmitter.emit(undecoratedChannelName, data.data);
        },
        "#kickOut": function(data) {
          var undecoratedChannelName = this._undecorateChannelName(data.channel);
          var channel = this.channels[undecoratedChannelName];
          if (channel) {
            Emitter.prototype.emit.call(this, "kickOut", data.message, undecoratedChannelName);
            channel.emit("kickOut", data.message, undecoratedChannelName);
            this._triggerChannelUnsubscribe(channel);
          }
        },
        "#setAuthToken": function(data, response) {
          var self = this;
          if (data) {
            var triggerAuthenticate = function(err) {
              if (err) {
                response.error(err);
                self._onSCError(err);
              } else {
                self._changeToAuthenticatedState(data.token);
                response.end();
              }
            };
            this.auth.saveToken(this.authTokenName, data.token, {}, triggerAuthenticate);
          } else response.error(new InvalidMessageError("No token data provided by #setAuthToken event"));
        },
        "#removeAuthToken": function(data, response) {
          var self = this;
          this.auth.removeToken(this.authTokenName, function(err, oldToken) {
            if (err) {
              response.error(err);
              self._onSCError(err);
            } else {
              Emitter.prototype.emit.call(self, "removeAuthToken", oldToken);
              self._changeToUnauthenticatedStateAndClearTokens();
              response.end();
            }
          });
        },
        "#disconnect": function(data) {
          this.transport.close(data.code, data.data);
        }
      };
      SCClientSocket.prototype.getState = function() {
        return this.state;
      };
      SCClientSocket.prototype.getBytesReceived = function() {
        return this.transport.getBytesReceived();
      };
      SCClientSocket.prototype.deauthenticate = function(callback) {
        var self = this;
        this.auth.removeToken(this.authTokenName, function(err, oldToken) {
          if (err) self._onSCError(err); else {
            Emitter.prototype.emit.call(self, "removeAuthToken", oldToken);
            self.state !== self.CLOSED && self.emit("#removeAuthToken");
            self._changeToUnauthenticatedStateAndClearTokens();
          }
          callback && callback(err);
        });
      };
      SCClientSocket.prototype.connect = SCClientSocket.prototype.open = function() {
        var self = this;
        if (!this.active) {
          var error = new InvalidActionError("Cannot connect a destroyed client");
          this._onSCError(error);
          return;
        }
        if (this.state === this.CLOSED) {
          this.pendingReconnect = false;
          this.pendingReconnectTimeout = null;
          clearTimeout(this._reconnectTimeoutRef);
          this.state = this.CONNECTING;
          Emitter.prototype.emit.call(this, "connecting");
          this.transport && this.transport.off();
          this.transport = new SCTransport(this.auth, this.codec, this.options);
          this.transport.on("open", function(status) {
            self.state = self.OPEN;
            self._onSCOpen(status);
          });
          this.transport.on("error", function(err) {
            self._onSCError(err);
          });
          this.transport.on("close", function(code, data) {
            self.state = self.CLOSED;
            self._onSCClose(code, data);
          });
          this.transport.on("openAbort", function(code, data) {
            self.state = self.CLOSED;
            self._onSCClose(code, data, true);
          });
          this.transport.on("event", function(event, data, res) {
            self._onSCEvent(event, data, res);
          });
        }
      };
      SCClientSocket.prototype.reconnect = function(code, data) {
        this.disconnect(code, data);
        this.connect();
      };
      SCClientSocket.prototype.disconnect = function(code, data) {
        code = code || 1e3;
        if ("number" !== typeof code) throw new InvalidArgumentsError("If specified, the code argument must be a number");
        if (this.state === this.OPEN || this.state === this.CONNECTING) this.transport.close(code, data); else {
          this.pendingReconnect = false;
          this.pendingReconnectTimeout = null;
          clearTimeout(this._reconnectTimeoutRef);
        }
      };
      SCClientSocket.prototype.destroy = function(code, data) {
        isBrowser && global.removeEventListener && global.removeEventListener("beforeunload", this._unloadHandler, false);
        this.active = false;
        this.disconnect(code, data);
        delete this._clientMap[this.clientId];
      };
      SCClientSocket.prototype._changeToUnauthenticatedStateAndClearTokens = function() {
        if (this.authState !== this.UNAUTHENTICATED) {
          var oldState = this.authState;
          var oldSignedToken = this.signedAuthToken;
          this.authState = this.UNAUTHENTICATED;
          this.signedAuthToken = null;
          this.authToken = null;
          var stateChangeData = {
            oldState: oldState,
            newState: this.authState
          };
          Emitter.prototype.emit.call(this, "authStateChange", stateChangeData);
          Emitter.prototype.emit.call(this, "deauthenticate", oldSignedToken);
        }
      };
      SCClientSocket.prototype._changeToAuthenticatedState = function(signedAuthToken) {
        this.signedAuthToken = signedAuthToken;
        this.authToken = this._extractAuthTokenData(signedAuthToken);
        if (this.authState !== this.AUTHENTICATED) {
          var oldState = this.authState;
          this.authState = this.AUTHENTICATED;
          var stateChangeData = {
            oldState: oldState,
            newState: this.authState,
            signedAuthToken: signedAuthToken,
            authToken: this.authToken
          };
          this.preparingPendingSubscriptions || this.processPendingSubscriptions();
          Emitter.prototype.emit.call(this, "authStateChange", stateChangeData);
        }
        Emitter.prototype.emit.call(this, "authenticate", signedAuthToken);
      };
      SCClientSocket.prototype.decodeBase64 = function(encodedString) {
        return Buffer.from(encodedString, "base64").toString("utf8");
      };
      SCClientSocket.prototype.encodeBase64 = function(decodedString) {
        return Buffer.from(decodedString, "utf8").toString("base64");
      };
      SCClientSocket.prototype._extractAuthTokenData = function(signedAuthToken) {
        var tokenParts = (signedAuthToken || "").split(".");
        var encodedTokenData = tokenParts[1];
        if (null != encodedTokenData) {
          var tokenData = encodedTokenData;
          try {
            tokenData = this.decodeBase64(tokenData);
            return JSON.parse(tokenData);
          } catch (e) {
            return tokenData;
          }
        }
        return null;
      };
      SCClientSocket.prototype.getAuthToken = function() {
        return this.authToken;
      };
      SCClientSocket.prototype.getSignedAuthToken = function() {
        return this.signedAuthToken;
      };
      SCClientSocket.prototype.authenticate = function(signedAuthToken, callback) {
        var self = this;
        this.emit("#authenticate", signedAuthToken, function(err, authStatus) {
          authStatus && null != authStatus.isAuthenticated ? authStatus.authError && (authStatus.authError = scErrors.hydrateError(authStatus.authError)) : authStatus = {
            isAuthenticated: self.authState,
            authError: null
          };
          if (err) {
            "BadConnectionError" !== err.name && "TimeoutError" !== err.name && self._changeToUnauthenticatedStateAndClearTokens();
            callback && callback(err, authStatus);
          } else self.auth.saveToken(self.authTokenName, signedAuthToken, {}, function(err) {
            err && self._onSCError(err);
            authStatus.isAuthenticated ? self._changeToAuthenticatedState(signedAuthToken) : self._changeToUnauthenticatedStateAndClearTokens();
            callback && callback(err, authStatus);
          });
        });
      };
      SCClientSocket.prototype._tryReconnect = function(initialDelay) {
        var self = this;
        var exponent = this.connectAttempts++;
        var reconnectOptions = this.options.autoReconnectOptions;
        var timeout;
        if (null == initialDelay || exponent > 0) {
          var initialTimeout = Math.round(reconnectOptions.initialDelay + (reconnectOptions.randomness || 0) * Math.random());
          timeout = Math.round(initialTimeout * Math.pow(reconnectOptions.multiplier, exponent));
        } else timeout = initialDelay;
        timeout > reconnectOptions.maxDelay && (timeout = reconnectOptions.maxDelay);
        clearTimeout(this._reconnectTimeoutRef);
        this.pendingReconnect = true;
        this.pendingReconnectTimeout = timeout;
        this._reconnectTimeoutRef = setTimeout(function() {
          self.connect();
        }, timeout);
      };
      SCClientSocket.prototype._onSCOpen = function(status) {
        var self = this;
        this.preparingPendingSubscriptions = true;
        if (status) {
          this.id = status.id;
          this.pingTimeout = status.pingTimeout;
          this.transport.pingTimeout = this.pingTimeout;
          status.isAuthenticated ? this._changeToAuthenticatedState(status.authToken) : this._changeToUnauthenticatedStateAndClearTokens();
        } else this._changeToUnauthenticatedStateAndClearTokens();
        this.connectAttempts = 0;
        this.options.autoSubscribeOnConnect && this.processPendingSubscriptions();
        Emitter.prototype.emit.call(this, "connect", status, function() {
          self.processPendingSubscriptions();
        });
        this.state === this.OPEN && this._flushEmitBuffer();
      };
      SCClientSocket.prototype._onSCError = function(err) {
        var self = this;
        setTimeout(function() {
          if (self.listeners("error").length < 1) throw err;
          Emitter.prototype.emit.call(self, "error", err);
        }, 0);
      };
      SCClientSocket.prototype._suspendSubscriptions = function() {
        var channel, newState;
        for (var channelName in this.channels) if (this.channels.hasOwnProperty(channelName)) {
          channel = this.channels[channelName];
          newState = channel.state === channel.SUBSCRIBED || channel.state === channel.PENDING ? channel.PENDING : channel.UNSUBSCRIBED;
          this._triggerChannelUnsubscribe(channel, newState);
        }
      };
      SCClientSocket.prototype._abortAllPendingEventsDueToBadConnection = function(failureType) {
        var currentNode = this._emitBuffer.head;
        var nextNode;
        while (currentNode) {
          nextNode = currentNode.next;
          var eventObject = currentNode.data;
          clearTimeout(eventObject.timeout);
          delete eventObject.timeout;
          currentNode.detach();
          currentNode = nextNode;
          var callback = eventObject.callback;
          if (callback) {
            delete eventObject.callback;
            var errorMessage = "Event '" + eventObject.event + "' was aborted due to a bad connection";
            var error = new BadConnectionError(errorMessage, failureType);
            callback.call(eventObject, error, eventObject);
          }
          eventObject.cid && this.transport.cancelPendingResponse(eventObject.cid);
        }
      };
      SCClientSocket.prototype._onSCClose = function(code, data, openAbort) {
        var self = this;
        this.id = null;
        this.transport && this.transport.off();
        this.pendingReconnect = false;
        this.pendingReconnectTimeout = null;
        clearTimeout(this._reconnectTimeoutRef);
        this._suspendSubscriptions();
        this._abortAllPendingEventsDueToBadConnection(openAbort ? "connectAbort" : "disconnect");
        this.options.autoReconnect && (4e3 === code || 4001 === code || 1005 === code ? this._tryReconnect(0) : 1e3 !== code && code < 4500 && this._tryReconnect());
        openAbort ? Emitter.prototype.emit.call(self, "connectAbort", code, data) : Emitter.prototype.emit.call(self, "disconnect", code, data);
        Emitter.prototype.emit.call(self, "close", code, data);
        if (!SCClientSocket.ignoreStatuses[code]) {
          var closeMessage;
          closeMessage = data ? "Socket connection closed with status code " + code + " and reason: " + data : "Socket connection closed with status code " + code;
          var err = new SocketProtocolError(SCClientSocket.errorStatuses[code] || closeMessage, code);
          this._onSCError(err);
        }
      };
      SCClientSocket.prototype._onSCEvent = function(event, data, res) {
        var handler = this._privateEventHandlerMap[event];
        handler ? handler.call(this, data, res) : Emitter.prototype.emit.call(this, event, data, function() {
          res && res.callback.apply(res, arguments);
        });
      };
      SCClientSocket.prototype.decode = function(message) {
        return this.transport.decode(message);
      };
      SCClientSocket.prototype.encode = function(object) {
        return this.transport.encode(object);
      };
      SCClientSocket.prototype._flushEmitBuffer = function() {
        var currentNode = this._emitBuffer.head;
        var nextNode;
        while (currentNode) {
          nextNode = currentNode.next;
          var eventObject = currentNode.data;
          currentNode.detach();
          this.transport.emitObject(eventObject);
          currentNode = nextNode;
        }
      };
      SCClientSocket.prototype._handleEventAckTimeout = function(eventObject, eventNode) {
        eventNode && eventNode.detach();
        delete eventObject.timeout;
        var callback = eventObject.callback;
        if (callback) {
          delete eventObject.callback;
          var error = new TimeoutError("Event response for '" + eventObject.event + "' timed out");
          callback.call(eventObject, error, eventObject);
        }
        eventObject.cid && this.transport.cancelPendingResponse(eventObject.cid);
      };
      SCClientSocket.prototype._emit = function(event, data, callback) {
        var self = this;
        this.state === this.CLOSED && this.connect();
        var eventObject = {
          event: event,
          callback: callback
        };
        var eventNode = new LinkedList.Item();
        this.options.cloneData ? eventObject.data = clone(data) : eventObject.data = data;
        eventNode.data = eventObject;
        eventObject.timeout = setTimeout(function() {
          self._handleEventAckTimeout(eventObject, eventNode);
        }, this.ackTimeout);
        this._emitBuffer.append(eventNode);
        this.state === this.OPEN && this._flushEmitBuffer();
      };
      SCClientSocket.prototype.send = function(data) {
        this.transport.send(data);
      };
      SCClientSocket.prototype.emit = function(event, data, callback) {
        if (null == this._localEvents[event]) this._emit(event, data, callback); else if ("error" === event) Emitter.prototype.emit.call(this, event, data); else {
          var error = new InvalidActionError('The "' + event + '" event is reserved and cannot be emitted on a client socket');
          this._onSCError(error);
        }
      };
      SCClientSocket.prototype.publish = function(channelName, data, callback) {
        var pubData = {
          channel: this._decorateChannelName(channelName),
          data: data
        };
        this.emit("#publish", pubData, callback);
      };
      SCClientSocket.prototype._triggerChannelSubscribe = function(channel, subscriptionOptions) {
        var channelName = channel.name;
        if (channel.state !== channel.SUBSCRIBED) {
          var oldState = channel.state;
          channel.state = channel.SUBSCRIBED;
          var stateChangeData = {
            channel: channelName,
            oldState: oldState,
            newState: channel.state,
            subscriptionOptions: subscriptionOptions
          };
          channel.emit("subscribeStateChange", stateChangeData);
          channel.emit("subscribe", channelName, subscriptionOptions);
          Emitter.prototype.emit.call(this, "subscribeStateChange", stateChangeData);
          Emitter.prototype.emit.call(this, "subscribe", channelName, subscriptionOptions);
        }
      };
      SCClientSocket.prototype._triggerChannelSubscribeFail = function(err, channel, subscriptionOptions) {
        var channelName = channel.name;
        var meetsAuthRequirements = !channel.waitForAuth || this.authState === this.AUTHENTICATED;
        if (channel.state !== channel.UNSUBSCRIBED && meetsAuthRequirements) {
          channel.state = channel.UNSUBSCRIBED;
          channel.emit("subscribeFail", err, channelName, subscriptionOptions);
          Emitter.prototype.emit.call(this, "subscribeFail", err, channelName, subscriptionOptions);
        }
      };
      SCClientSocket.prototype._cancelPendingSubscribeCallback = function(channel) {
        if (null != channel._pendingSubscriptionCid) {
          this.transport.cancelPendingResponse(channel._pendingSubscriptionCid);
          delete channel._pendingSubscriptionCid;
        }
      };
      SCClientSocket.prototype._decorateChannelName = function(channelName) {
        this.channelPrefix && (channelName = this.channelPrefix + channelName);
        return channelName;
      };
      SCClientSocket.prototype._undecorateChannelName = function(decoratedChannelName) {
        if (this.channelPrefix && 0 === decoratedChannelName.indexOf(this.channelPrefix)) return decoratedChannelName.replace(this.channelPrefix, "");
        return decoratedChannelName;
      };
      SCClientSocket.prototype._trySubscribe = function(channel) {
        var self = this;
        var meetsAuthRequirements = !channel.waitForAuth || this.authState === this.AUTHENTICATED;
        if (this.state === this.OPEN && !this.preparingPendingSubscriptions && null == channel._pendingSubscriptionCid && meetsAuthRequirements) {
          var options = {
            noTimeout: true
          };
          var subscriptionOptions = {
            channel: this._decorateChannelName(channel.name)
          };
          if (channel.waitForAuth) {
            options.waitForAuth = true;
            subscriptionOptions.waitForAuth = options.waitForAuth;
          }
          channel.data && (subscriptionOptions.data = channel.data);
          if (channel.batch) {
            options.batch = true;
            subscriptionOptions.batch = true;
          }
          channel._pendingSubscriptionCid = this.transport.emit("#subscribe", subscriptionOptions, options, function(err) {
            delete channel._pendingSubscriptionCid;
            err ? self._triggerChannelSubscribeFail(err, channel, subscriptionOptions) : self._triggerChannelSubscribe(channel, subscriptionOptions);
          });
          Emitter.prototype.emit.call(this, "subscribeRequest", channel.name, subscriptionOptions);
        }
      };
      SCClientSocket.prototype.subscribe = function(channelName, options) {
        var channel = this.channels[channelName];
        if (channel) options && channel.setOptions(options); else {
          channel = new SCChannel(channelName, this, options);
          this.channels[channelName] = channel;
        }
        if (channel.state === channel.UNSUBSCRIBED) {
          channel.state = channel.PENDING;
          this._trySubscribe(channel);
        }
        return channel;
      };
      SCClientSocket.prototype._triggerChannelUnsubscribe = function(channel, newState) {
        var channelName = channel.name;
        var oldState = channel.state;
        channel.state = newState || channel.UNSUBSCRIBED;
        this._cancelPendingSubscribeCallback(channel);
        if (oldState === channel.SUBSCRIBED) {
          var stateChangeData = {
            channel: channelName,
            oldState: oldState,
            newState: channel.state
          };
          channel.emit("subscribeStateChange", stateChangeData);
          channel.emit("unsubscribe", channelName);
          Emitter.prototype.emit.call(this, "subscribeStateChange", stateChangeData);
          Emitter.prototype.emit.call(this, "unsubscribe", channelName);
        }
      };
      SCClientSocket.prototype._tryUnsubscribe = function(channel) {
        var self = this;
        if (this.state === this.OPEN) {
          var options = {
            noTimeout: true
          };
          channel.batch && (options.batch = true);
          this._cancelPendingSubscribeCallback(channel);
          var decoratedChannelName = this._decorateChannelName(channel.name);
          this.transport.emit("#unsubscribe", decoratedChannelName, options);
        }
      };
      SCClientSocket.prototype.unsubscribe = function(channelName) {
        var channel = this.channels[channelName];
        if (channel && channel.state !== channel.UNSUBSCRIBED) {
          this._triggerChannelUnsubscribe(channel);
          this._tryUnsubscribe(channel);
        }
      };
      SCClientSocket.prototype.channel = function(channelName, options) {
        var currentChannel = this.channels[channelName];
        if (!currentChannel) {
          currentChannel = new SCChannel(channelName, this, options);
          this.channels[channelName] = currentChannel;
        }
        return currentChannel;
      };
      SCClientSocket.prototype.destroyChannel = function(channelName) {
        var channel = this.channels[channelName];
        if (channel) {
          channel.unwatch();
          channel.unsubscribe();
          delete this.channels[channelName];
        }
      };
      SCClientSocket.prototype.subscriptions = function(includePending) {
        var subs = [];
        var channel, includeChannel;
        for (var channelName in this.channels) if (this.channels.hasOwnProperty(channelName)) {
          channel = this.channels[channelName];
          includeChannel = includePending ? channel && (channel.state === channel.SUBSCRIBED || channel.state === channel.PENDING) : channel && channel.state === channel.SUBSCRIBED;
          includeChannel && subs.push(channelName);
        }
        return subs;
      };
      SCClientSocket.prototype.isSubscribed = function(channelName, includePending) {
        var channel = this.channels[channelName];
        if (includePending) return !!channel && (channel.state === channel.SUBSCRIBED || channel.state === channel.PENDING);
        return !!channel && channel.state === channel.SUBSCRIBED;
      };
      SCClientSocket.prototype.processPendingSubscriptions = function() {
        var self = this;
        this.preparingPendingSubscriptions = false;
        var pendingChannels = [];
        for (var i in this.channels) if (this.channels.hasOwnProperty(i)) {
          var channel = this.channels[i];
          channel.state === channel.PENDING && pendingChannels.push(channel);
        }
        pendingChannels.sort(function(a, b) {
          var ap = a.priority || 0;
          var bp = b.priority || 0;
          if (ap > bp) return -1;
          if (ap < bp) return 1;
          return 0;
        });
        pendingChannels.forEach(function(channel) {
          self._trySubscribe(channel);
        });
      };
      SCClientSocket.prototype.watch = function(channelName, handler) {
        if ("function" !== typeof handler) throw new InvalidArgumentsError("No handler function was provided");
        this._channelEmitter.on(channelName, handler);
      };
      SCClientSocket.prototype.unwatch = function(channelName, handler) {
        handler ? this._channelEmitter.removeListener(channelName, handler) : this._channelEmitter.removeAllListeners(channelName);
      };
      SCClientSocket.prototype.watchers = function(channelName) {
        return this._channelEmitter.listeners(channelName);
      };
      module.exports = SCClientSocket;
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "./auth": 52,
    "./response": 54,
    "./sctransport": 56,
    "buffer/": 9,
    clone: 10,
    "component-emitter": 11,
    "linked-list": 17,
    querystring: 7,
    "sc-channel": 46,
    "sc-errors": 49,
    "sc-formatter": 50
  } ],
  56: [ function(require, module, exports) {
    (function(global) {
      var Emitter = require("component-emitter");
      var Response = require("./response").Response;
      var querystring = require("querystring");
      var WebSocket;
      var createWebSocket;
      if (global.WebSocket) {
        WebSocket = global.WebSocket;
        createWebSocket = function(uri, options) {
          return new WebSocket(uri);
        };
      } else {
        WebSocket = require("ws");
        createWebSocket = function(uri, options) {
          return new WebSocket(uri, null, options);
        };
      }
      var scErrors = require("sc-errors");
      var TimeoutError = scErrors.TimeoutError;
      var BadConnectionError = scErrors.BadConnectionError;
      var SCTransport = function(authEngine, codecEngine, options) {
        var self = this;
        this.state = this.CLOSED;
        this.auth = authEngine;
        this.codec = codecEngine;
        this.options = options;
        this.connectTimeout = options.connectTimeout;
        this.pingTimeout = options.ackTimeout;
        this.pingTimeoutDisabled = !!options.pingTimeoutDisabled;
        this.callIdGenerator = options.callIdGenerator;
        this.authTokenName = options.authTokenName;
        this._pingTimeoutTicker = null;
        this._callbackMap = {};
        this._batchSendList = [];
        this.state = this.CONNECTING;
        var uri = this.uri();
        var wsSocket = createWebSocket(uri, this.options);
        wsSocket.binaryType = this.options.binaryType;
        this.socket = wsSocket;
        wsSocket.onopen = function() {
          self._onOpen();
        };
        wsSocket.onclose = function(event) {
          var code;
          code = null == event.code ? 1005 : event.code;
          self._onClose(code, event.reason);
        };
        wsSocket.onmessage = function(message, flags) {
          self._onMessage(message.data);
        };
        wsSocket.onerror = function(error) {
          self.state === self.CONNECTING && self._onClose(1006);
        };
        this._connectTimeoutRef = setTimeout(function() {
          self._onClose(4007);
          self.socket.close(4007);
        }, this.connectTimeout);
      };
      SCTransport.prototype = Object.create(Emitter.prototype);
      SCTransport.CONNECTING = SCTransport.prototype.CONNECTING = "connecting";
      SCTransport.OPEN = SCTransport.prototype.OPEN = "open";
      SCTransport.CLOSED = SCTransport.prototype.CLOSED = "closed";
      SCTransport.prototype.uri = function() {
        var query = this.options.query || {};
        var schema = this.options.secure ? "wss" : "ws";
        this.options.timestampRequests && (query[this.options.timestampParam] = new Date().getTime());
        query = querystring.encode(query);
        query.length && (query = "?" + query);
        var host;
        if (this.options.host) host = this.options.host; else {
          var port = "";
          this.options.port && ("wss" === schema && 443 !== this.options.port || "ws" === schema && 80 !== this.options.port) && (port = ":" + this.options.port);
          host = this.options.hostname + port;
        }
        return schema + "://" + host + this.options.path + query;
      };
      SCTransport.prototype._onOpen = function() {
        var self = this;
        clearTimeout(this._connectTimeoutRef);
        this._resetPingTimeout();
        this._handshake(function(err, status) {
          if (err) {
            var statusCode;
            statusCode = status && status.code ? status.code : 4003;
            self._onError(err);
            self._onClose(statusCode, err.toString());
            self.socket.close(statusCode);
          } else {
            self.state = self.OPEN;
            Emitter.prototype.emit.call(self, "open", status);
            self._resetPingTimeout();
          }
        });
      };
      SCTransport.prototype._handshake = function(callback) {
        var self = this;
        this.auth.loadToken(this.authTokenName, function(err, token) {
          if (err) callback(err); else {
            var options = {
              force: true
            };
            self.emit("#handshake", {
              authToken: token
            }, options, function(err, status) {
              if (status) {
                status.authToken = token;
                status.authError && (status.authError = scErrors.hydrateError(status.authError));
              }
              callback(err, status);
            });
          }
        });
      };
      SCTransport.prototype._abortAllPendingEventsDueToBadConnection = function(failureType) {
        for (var i in this._callbackMap) if (this._callbackMap.hasOwnProperty(i)) {
          var eventObject = this._callbackMap[i];
          delete this._callbackMap[i];
          clearTimeout(eventObject.timeout);
          delete eventObject.timeout;
          var errorMessage = "Event '" + eventObject.event + "' was aborted due to a bad connection";
          var badConnectionError = new BadConnectionError(errorMessage, failureType);
          var callback = eventObject.callback;
          delete eventObject.callback;
          callback.call(eventObject, badConnectionError, eventObject);
        }
      };
      SCTransport.prototype._onClose = function(code, data) {
        delete this.socket.onopen;
        delete this.socket.onclose;
        delete this.socket.onmessage;
        delete this.socket.onerror;
        clearTimeout(this._connectTimeoutRef);
        clearTimeout(this._pingTimeoutTicker);
        clearTimeout(this._batchTimeout);
        if (this.state === this.OPEN) {
          this.state = this.CLOSED;
          Emitter.prototype.emit.call(this, "close", code, data);
          this._abortAllPendingEventsDueToBadConnection("disconnect");
        } else if (this.state === this.CONNECTING) {
          this.state = this.CLOSED;
          Emitter.prototype.emit.call(this, "openAbort", code, data);
          this._abortAllPendingEventsDueToBadConnection("connectAbort");
        }
      };
      SCTransport.prototype._handleEventObject = function(obj, message) {
        if (obj && null != obj.event) {
          var response = new Response(this, obj.cid);
          Emitter.prototype.emit.call(this, "event", obj.event, obj.data, response);
        } else if (obj && null != obj.rid) {
          var eventObject = this._callbackMap[obj.rid];
          if (eventObject) {
            clearTimeout(eventObject.timeout);
            delete eventObject.timeout;
            delete this._callbackMap[obj.rid];
            if (eventObject.callback) {
              var rehydratedError = scErrors.hydrateError(obj.error);
              eventObject.callback(rehydratedError, obj.data);
            }
          }
        } else Emitter.prototype.emit.call(this, "event", "raw", message);
      };
      SCTransport.prototype._onMessage = function(message) {
        Emitter.prototype.emit.call(this, "event", "message", message);
        var obj = this.decode(message);
        if ("#1" === obj) {
          this._resetPingTimeout();
          this.socket.readyState === this.socket.OPEN && this.sendObject("#2");
        } else if (Array.isArray(obj)) {
          var len = obj.length;
          for (var i = 0; i < len; i++) this._handleEventObject(obj[i], message);
        } else this._handleEventObject(obj, message);
      };
      SCTransport.prototype._onError = function(err) {
        Emitter.prototype.emit.call(this, "error", err);
      };
      SCTransport.prototype._resetPingTimeout = function() {
        if (this.pingTimeoutDisabled) return;
        var self = this;
        var now = new Date().getTime();
        clearTimeout(this._pingTimeoutTicker);
        this._pingTimeoutTicker = setTimeout(function() {
          self._onClose(4e3);
          self.socket.close(4e3);
        }, this.pingTimeout);
      };
      SCTransport.prototype.getBytesReceived = function() {
        return this.socket.bytesReceived;
      };
      SCTransport.prototype.close = function(code, data) {
        code = code || 1e3;
        if (this.state === this.OPEN) {
          var packet = {
            code: code,
            data: data
          };
          this.emit("#disconnect", packet);
          this._onClose(code, data);
          this.socket.close(code);
        } else if (this.state === this.CONNECTING) {
          this._onClose(code, data);
          this.socket.close(code);
        }
      };
      SCTransport.prototype.emitObject = function(eventObject, options) {
        var simpleEventObject = {
          event: eventObject.event,
          data: eventObject.data
        };
        if (eventObject.callback) {
          simpleEventObject.cid = eventObject.cid = this.callIdGenerator();
          this._callbackMap[eventObject.cid] = eventObject;
        }
        this.sendObject(simpleEventObject, options);
        return eventObject.cid || null;
      };
      SCTransport.prototype._handleEventAckTimeout = function(eventObject) {
        eventObject.cid && delete this._callbackMap[eventObject.cid];
        delete eventObject.timeout;
        var callback = eventObject.callback;
        if (callback) {
          delete eventObject.callback;
          var error = new TimeoutError("Event response for '" + eventObject.event + "' timed out");
          callback.call(eventObject, error, eventObject);
        }
      };
      SCTransport.prototype.emit = function(event, data, a, b) {
        var self = this;
        var callback, options;
        if (b) {
          options = a;
          callback = b;
        } else if (a instanceof Function) {
          options = {};
          callback = a;
        } else options = a;
        var eventObject = {
          event: event,
          data: data,
          callback: callback
        };
        callback && !options.noTimeout && (eventObject.timeout = setTimeout(function() {
          self._handleEventAckTimeout(eventObject);
        }, this.options.ackTimeout));
        var cid = null;
        (this.state === this.OPEN || options.force) && (cid = this.emitObject(eventObject, options));
        return cid;
      };
      SCTransport.prototype.cancelPendingResponse = function(cid) {
        delete this._callbackMap[cid];
      };
      SCTransport.prototype.decode = function(message) {
        return this.codec.decode(message);
      };
      SCTransport.prototype.encode = function(object) {
        return this.codec.encode(object);
      };
      SCTransport.prototype.send = function(data) {
        this.socket.readyState !== this.socket.OPEN ? this._onClose(1005) : this.socket.send(data);
      };
      SCTransport.prototype.serializeObject = function(object) {
        var str, formatError;
        try {
          str = this.encode(object);
        } catch (err) {
          formatError = err;
          this._onError(formatError);
        }
        if (!formatError) return str;
        return null;
      };
      SCTransport.prototype.sendObjectBatch = function(object) {
        var self = this;
        this._batchSendList.push(object);
        if (this._batchTimeout) return;
        this._batchTimeout = setTimeout(function() {
          delete self._batchTimeout;
          if (self._batchSendList.length) {
            var str = self.serializeObject(self._batchSendList);
            null != str && self.send(str);
            self._batchSendList = [];
          }
        }, this.options.pubSubBatchDuration || 0);
      };
      SCTransport.prototype.sendObjectSingle = function(object) {
        var str = this.serializeObject(object);
        null != str && this.send(str);
      };
      SCTransport.prototype.sendObject = function(object, options) {
        options && options.batch ? this.sendObjectBatch(object) : this.sendObjectSingle(object);
      };
      module.exports.SCTransport = SCTransport;
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "./response": 54,
    "component-emitter": 11,
    querystring: 7,
    "sc-errors": 49,
    ws: 57
  } ],
  57: [ function(require, module, exports) {
    var global;
    global = "undefined" !== typeof WorkerGlobalScope ? self : "undefined" !== typeof window && window || function() {
      return this;
    }();
    var WebSocket = global.WebSocket || global.MozWebSocket;
    function ws(uri, protocols, opts) {
      var instance;
      instance = protocols ? new WebSocket(uri, protocols) : new WebSocket(uri);
      return instance;
    }
    WebSocket && (ws.prototype = WebSocket.prototype);
    module.exports = WebSocket ? ws : null;
  }, {} ],
  58: [ function(require, module, exports) {
    var v1 = require("./v1");
    var v4 = require("./v4");
    var uuid = v4;
    uuid.v1 = v1;
    uuid.v4 = v4;
    module.exports = uuid;
  }, {
    "./v1": 61,
    "./v4": 62
  } ],
  59: [ function(require, module, exports) {
    var byteToHex = [];
    for (var i = 0; i < 256; ++i) byteToHex[i] = (i + 256).toString(16).substr(1);
    function bytesToUuid(buf, offset) {
      var i = offset || 0;
      var bth = byteToHex;
      return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
    }
    module.exports = bytesToUuid;
  }, {} ],
  60: [ function(require, module, exports) {
    var getRandomValues = "undefined" != typeof crypto && crypto.getRandomValues.bind(crypto) || "undefined" != typeof msCrypto && msCrypto.getRandomValues.bind(msCrypto);
    if (getRandomValues) {
      var rnds8 = new Uint8Array(16);
      module.exports = function whatwgRNG() {
        getRandomValues(rnds8);
        return rnds8;
      };
    } else {
      var rnds = new Array(16);
      module.exports = function mathRNG() {
        for (var i = 0, r; i < 16; i++) {
          0 === (3 & i) && (r = 4294967296 * Math.random());
          rnds[i] = r >>> ((3 & i) << 3) & 255;
        }
        return rnds;
      };
    }
  }, {} ],
  61: [ function(require, module, exports) {
    var rng = require("./lib/rng");
    var bytesToUuid = require("./lib/bytesToUuid");
    var _nodeId;
    var _clockseq;
    var _lastMSecs = 0;
    var _lastNSecs = 0;
    function v1(options, buf, offset) {
      var i = buf && offset || 0;
      var b = buf || [];
      options = options || {};
      var node = options.node || _nodeId;
      var clockseq = void 0 !== options.clockseq ? options.clockseq : _clockseq;
      if (null == node || null == clockseq) {
        var seedBytes = rng();
        null == node && (node = _nodeId = [ 1 | seedBytes[0], seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5] ]);
        null == clockseq && (clockseq = _clockseq = 16383 & (seedBytes[6] << 8 | seedBytes[7]));
      }
      var msecs = void 0 !== options.msecs ? options.msecs : new Date().getTime();
      var nsecs = void 0 !== options.nsecs ? options.nsecs : _lastNSecs + 1;
      var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
      dt < 0 && void 0 === options.clockseq && (clockseq = clockseq + 1 & 16383);
      (dt < 0 || msecs > _lastMSecs) && void 0 === options.nsecs && (nsecs = 0);
      if (nsecs >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq;
      msecs += 122192928e5;
      var tl = (1e4 * (268435455 & msecs) + nsecs) % 4294967296;
      b[i++] = tl >>> 24 & 255;
      b[i++] = tl >>> 16 & 255;
      b[i++] = tl >>> 8 & 255;
      b[i++] = 255 & tl;
      var tmh = msecs / 4294967296 * 1e4 & 268435455;
      b[i++] = tmh >>> 8 & 255;
      b[i++] = 255 & tmh;
      b[i++] = tmh >>> 24 & 15 | 16;
      b[i++] = tmh >>> 16 & 255;
      b[i++] = clockseq >>> 8 | 128;
      b[i++] = 255 & clockseq;
      for (var n = 0; n < 6; ++n) b[i + n] = node[n];
      return buf || bytesToUuid(b);
    }
    module.exports = v1;
  }, {
    "./lib/bytesToUuid": 59,
    "./lib/rng": 60
  } ],
  62: [ function(require, module, exports) {
    var rng = require("./lib/rng");
    var bytesToUuid = require("./lib/bytesToUuid");
    function v4(options, buf, offset) {
      var i = buf && offset || 0;
      if ("string" == typeof options) {
        buf = "binary" === options ? new Array(16) : null;
        options = null;
      }
      options = options || {};
      var rnds = options.random || (options.rng || rng)();
      rnds[6] = 15 & rnds[6] | 64;
      rnds[8] = 63 & rnds[8] | 128;
      if (buf) for (var ii = 0; ii < 16; ++ii) buf[i + ii] = rnds[ii];
      return buf || bytesToUuid(rnds);
    }
    module.exports = v4;
  }, {
    "./lib/bytesToUuid": 59,
    "./lib/rng": 60
  } ],
  AccumulatedBar1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "70436sroTRDw6DUOZ0pjarm", "AccumulatedBar1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AccumulatedBar1 = function(_super) {
      __extends(AccumulatedBar1, _super);
      function AccumulatedBar1() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.bar = null;
        _this.maxLength = 0;
        _this.minLength = 0;
        _this.progress = 1;
        _this.lerpRatio = 5;
        _this.fps = 30;
        _this._tempProgress = 0;
        return _this;
      }
      AccumulatedBar1.prototype.onLoad = function() {
        this.updateProgress(0);
      };
      AccumulatedBar1.prototype.updateProgress = function(progress) {
        var _this = this;
        if (null != progress) {
          progress > 1 && (progress = 1);
          progress < 0 && (progress = 0);
          this.progress = progress;
        }
        this.updateLength();
        if (Math.abs(this.progress - this._tempProgress) < .001) {
          this._tempProgress = this.progress;
          return true;
        }
        var delta = this.progress - this._tempProgress;
        this._tempProgress = delta * this.lerpRatio / 10 / this.fps + this._tempProgress;
        setTimeout(function() {
          _this.updateProgress();
        }, 1e3 / this.fps);
      };
      AccumulatedBar1.prototype.updateLength = function() {
        this.bar.width = (this.maxLength - this.minLength) * this._tempProgress + this.minLength;
      };
      __decorate([ property(cc.Node) ], AccumulatedBar1.prototype, "bar", void 0);
      __decorate([ property(cc.Float) ], AccumulatedBar1.prototype, "maxLength", void 0);
      __decorate([ property(cc.Float) ], AccumulatedBar1.prototype, "minLength", void 0);
      __decorate([ property({
        type: cc.Float,
        min: 0,
        max: 1,
        slide: true
      }) ], AccumulatedBar1.prototype, "progress", void 0);
      __decorate([ property(cc.Integer) ], AccumulatedBar1.prototype, "lerpRatio", void 0);
      __decorate([ property(cc.Integer) ], AccumulatedBar1.prototype, "fps", void 0);
      AccumulatedBar1 = __decorate([ ccclass ], AccumulatedBar1);
      return AccumulatedBar1;
    }(cc.Component);
    exports.default = AccumulatedBar1;
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
        return null !== _super && _super.apply(this, arguments) || this;
      }
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
  AnimationController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3d72bR6jslGsYSbra1OLiEg", "AnimationController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameConfig_1 = require("../GameConfig");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var AnimationController = function(_super) {
      __extends(AnimationController, _super);
      function AnimationController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.delayTime = 2.2;
        _this.wildItemId = "w";
        _this.totalPayLines = 20;
        _this._tempIsShowWin = false;
        _this.lines = null;
        _this.reward = 0;
        return _this;
      }
      AnimationController.prototype.onLoad = function() {
        this._slotController = this.node.getComponent("SlotController");
        this._linesController = this.node.getComponentInChildren("LinesController");
      };
      AnimationController.prototype.refreshSlotAnimation = function() {
        this._linesController.refreshShowLines();
        this.stopZoomLineItems();
        this._tempIsShowWin = false;
      };
      AnimationController.prototype.setAnimationData = function(data) {
        this.lines = data.score.lines;
        this.reward = data.score.reward;
        this._listItem = this._slotController._listItem;
      };
      AnimationController.prototype.showAllLines = function(count) {
        if (count && this._slotController.isSpin) return;
        return this._linesController.showAllLines(this.lines.map(function(item) {
          return item.l;
        }).filter(function(item) {
          return item >= 0;
        }), this.totalPayLines);
      };
      AnimationController.prototype.showWinAmount = function() {
        !this._tempIsShowWin && window.GameScene.currentSlot && this._slotController.uuid === window.GameScene.currentSlot.SlotController.uuid && window.GameScene._bottomBarController.updateWinAmount(this.reward);
        this._tempIsShowWin = true;
      };
      AnimationController.prototype.showEachLine = function() {
        return __awaiter(this, void 0, void 0, function() {
          var lines, i, length;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              lines = this.lines;
              i = 0, length = lines.length;
              _a.label = 1;

             case 1:
              if (!(i < length)) return [ 3, 4 ];
              if (this._slotController.isSpin) return [ 3, 4 ];
              if (lines[i].l < 0) return [ 3, 3 ];
              this.stopZoomLineItems();
              this.playZoomLineItems(lines[i]);
              return [ 4, this._linesController.showLine(lines[i].l) ];

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
      AnimationController.prototype.playZoomLineItems = function(item) {
        var _this = this;
        var listItem = this._listItem.slice(1);
        var payTable = GameConfig_1.default.PAY_LINES[this.totalPayLines];
        var line = payTable[item.l];
        var itemId = parseInt(item.s[0]);
        var isDone = false;
        line.forEach(function(item, i) {
          if (isDone) return;
          listItem[item][i].id == itemId || listItem[item][i].id == _this.wildItemId ? listItem[item][i].playZoomAnimation() : isDone = true;
        });
      };
      AnimationController.prototype.stopZoomLineItems = function() {
        if (!this._listItem) return;
        var listItem = this._listItem.slice(1);
        listItem.forEach(function(item) {
          return item.forEach(function(item) {
            return item.stopZoomAnimation();
          });
        });
      };
      AnimationController.prototype.spinItems = function(listItem) {
        listItem.forEach(function(item) {
          item.forEach(function(item) {
            setTimeout(function() {
              item.move();
            }, 200 * item.x);
          });
        });
      };
      __decorate([ property(cc.Float) ], AnimationController.prototype, "delayTime", void 0);
      __decorate([ property(cc.String) ], AnimationController.prototype, "wildItemId", void 0);
      __decorate([ property(cc.Integer) ], AnimationController.prototype, "totalPayLines", void 0);
      AnimationController = __decorate([ ccclass ], AnimationController);
      return AnimationController;
    }(cc.Component);
    exports.default = AnimationController;
    cc._RF.pop();
  }, {
    "../GameConfig": "GameConfig"
  } ],
  ApiDataType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "38b24S4q7VEfpEPJHanEqil", "ApiDataType");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  Api: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "798c96BirVCt69SsVnT+Xy6", "Api");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SocketCluster = require("socketcluster-client");
    var scCodecMinBin = require("sc-codec-min-bin");
    var auth_1 = require("./lib/auth");
    var GameConfig_1 = require("./GameConfig");
    var Concos_1 = require("./Concos");
    var HOST = "64.120.114.208";
    var API = function() {
      function API() {
        return API.instance || (API.instance = this);
      }
      API.prototype.login = function() {
        return __awaiter(this, void 0, void 0, function() {
          var tokenReq, error_1;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _a.trys.push([ 0, 2, , 3 ]);
              return [ 4, this.getToken("12345678913") ];

             case 1:
              tokenReq = _a.sent();
              console.log("get token done", tokenReq.token);
              this.connectSocket(tokenReq.token);
              return [ 3, 3 ];

             case 2:
              error_1 = _a.sent();
              console.log("get token error", error_1);
              return [ 3, 3 ];

             case 3:
              return [ 2 ];
            }
          });
        });
      };
      API.prototype.getToken = function(deviceID) {
        return new Promise(function(resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {
            if (4 == xhr.readyState) {
              if (xhr.status >= 200 && xhr.status < 400) {
                var responseObj = JSON.parse(xhr.responseText);
                return resolve(responseObj);
              }
              return reject(xhr.responseText);
            }
          };
          xhr.open("POST", "http://" + HOST + ":8000/v1/authdev", true);
          cc.sys.isNative && xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
          xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
          xhr.send(JSON.stringify({
            ID: deviceID
          }));
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
        this.socket = SocketCluster.connect({
          port: 8001,
          hostname: HOST,
          perMessageDeflate: true,
          codecEngine: scCodecMinBin,
          multiplex: false,
          autoReconnect: false
        });
        this.socket.on("error", function(err) {
          console.error("socket.on error", JSON.stringify(err));
        });
        this.socket.on("connect", function(status) {
          return __awaiter(_this, void 0, void 0, function() {
            var userInfo, authToken, e_1;
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                _a.trys.push([ 0, 2, , 3 ]);
                console.log("Socket is connected", this.socket.authToken, this.socket.signedAuthToken, status);
                window.GameController.gotoHomeScene();
                return [ 4, this.sendGDPromise({
                  e: "regisClient",
                  device_info: "developer"
                }) ];

               case 1:
                userInfo = _a.sent();
                Concos_1.default.emit(Concos_1.Event.UPDATE_USER_BALANCE, 0, {
                  delayTime: 0,
                  lerpRatio: 200
                });
                Concos_1.default.emit(Concos_1.Event.UPDATE_USER_BALANCE, userInfo.coin, {
                  delayTime: 0,
                  lerpRatio: 50
                });
                if (status.isAuthenticated) {
                  authToken = this.socket.authToken;
                  this.subscribeChanel(authToken.uid);
                }
                return [ 3, 3 ];

               case 2:
                e_1 = _a.sent();
                cc.log(e_1);
                return [ 3, 3 ];

               case 3:
                return [ 2 ];
              }
            });
          });
        });
        this.socket.on("authenticate", function(signedAuthToken) {
          console.log("on.authenticate", signedAuthToken);
        });
        this.socket.on("deauthenticate", function(a, b, c) {
          console.log("deauthenticate", a, b, c);
        });
        this.socket.on("random", function(data) {
          console.log('Received "random" event with data: ' + data.number);
        });
      };
      API.prototype.subscribeChanel = function(uid) {
        var channelME = this.socket.subscribe("u:" + uid);
        channelME.unwatch();
        channelME.on("subscribeFail", function(err) {
          console.error("Failed to subscribe to the channelME channel due to error: " + err);
        });
        channelME.watch(function(data) {
          console.log("channelME channel message:", data);
          switch (data.type) {
           case GameConfig_1.default.EVENT.SLOT_SPIN:
            window.GameController.slotWatch(data);
            break;

           case GameConfig_1.default.EVENT.SLOT_BONUS_RESULT:
            window.GameController.userBalance = data.ccoin;
            if (window.GameScene) {
              var slotController = window.GameScene.ScenesManager.find(function(item) {
                return item.SlotController.gameId == data.smid;
              });
              if (slotController) return;
            }
            Concos_1.default.emit(Concos_1.Event.UPDATE_USER_BALANCE, data.ccoin);
          }
        });
      };
      API.prototype.registerClient = function() {
        this.sendGD({
          e: GameConfig_1.default.EVENT.REGIS
        }, function(err, data) {
          if (err) return cc.log(err);
          cc.log(data);
        });
      };
      API.prototype.sendGD = function(data, cb) {
        this.socket.emit("GD", data, cb);
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
          _this.socket.emit("GD", data, cb);
        });
      };
      API.prototype.onSceneChanged = function(sceneName) {
        cc.log("onSceneChanged", sceneName);
        this.socket.emit("clientreact", {
          data: sceneName || 1
        }, function(err, res) {
          console.log("clientreact result", err, res);
        });
      };
      return API;
    }();
    exports.default = new API();
    cc._RF.pop();
  }, {
    "./Concos": "Concos",
    "./GameConfig": "GameConfig",
    "./lib/auth": "auth",
    "sc-codec-min-bin": 47,
    "socketcluster-client": 51
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
      AtributeStatic = AtributeStatic_1 = __decorate([ ccclass ], AtributeStatic);
      return AtributeStatic;
    }(cc.Component);
    exports.default = AtributeStatic;
    cc._RF.pop();
  }, {} ],
  AutoFitCanvas: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7f7e78Rb8dBbJCW/0AzBYED", "AutoFitCanvas");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        widthDesign: 1280,
        heightDesign: 720
      },
      start: function start() {
        var realScreenSize = cc.view.getFrameSize();
        var realScreenRatio = realScreenSize.width / realScreenSize.height;
        var designScreenRatio = this.widthDesign / this.heightDesign;
        var canvas = this.node.getComponent(cc.Canvas);
        if (realScreenRatio < designScreenRatio) {
          canvas.fitHeight = false;
          canvas.fitWidth = true;
        } else {
          canvas.fitHeight = true;
          canvas.fitWidth = false;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  BetResource: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "475cc5KLedPKq3241A+fII9", "BetResource");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BetResource = function(_super) {
      __extends(BetResource, _super);
      function BetResource() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.list = {
          item: {
            0: "ItemBet/select-bet-play-1",
            1: "ItemBet/select-bet-play-2",
            2: "ItemBet/select-bet-play-3",
            3: "ItemBet/select-bet-play-4",
            4: "ItemBet/select-bet-play-5"
          },
          itemBorderBet: {
            0: "img/ItemBet/borderBet"
          }
        };
        _this.resPathTotal = "4_gameScene/4_Slot4/ItemBet";
        return _this;
      }
      BetResource.prototype.getlistBorderBet = function() {
        var _this = this;
        var listBorder = Object.keys(this.list.itemBorderBet);
        listBorder = listBorder.reduce(function(res, i) {
          return res.concat([ {
            id: i,
            img: _this.listResImage.find(function(x) {
              return x.name === _this.list.itemBorderBet[i].split("/").pop();
            })
          } ]);
        }, []);
        return listBorder;
      };
      BetResource = __decorate([ ccclass ], BetResource);
      return BetResource;
    }(ResourceController_1.default);
    exports.default = BetResource;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  BetsController4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f10e1uxCF9B+rzTl7cduCyC", "BetsController4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Item_1 = require("../../../../scripts/Slots/Item");
    var BetResource_1 = require("./BetResource");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BetsController4 = function(_super) {
      __extends(BetsController4, _super);
      function BetsController4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.resource = new BetResource_1.default();
        _this._listItemBetData = [];
        _this._listBet = [];
        _this._listBetBorder = [];
        _this.distanceItemY = 0;
        _this.distancceItemX = 0;
        _this.betItemId = "";
        _this.playArray = [];
        _this.betLevels = [];
        _this.right = null;
        _this.left = null;
        _this.bgSelectBet = null;
        _this.goldCtrl = null;
        _this.tableSelect = null;
        _this.itemSelect = null;
        _this.bgBet = null;
        return _this;
      }
      BetsController4.prototype.startBet = function(playArr, betLevel) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              window["game"] = this;
              this.playArray = playArr;
              this.betLevels = betLevel;
              this.node.children.forEach(function(item) {
                return item.active = false;
              });
              this.bgSelectBet = cc.find("select-bet-bg", this.node);
              this.tableSelect = cc.find("tableSelect", this.node);
              this.itemSelect = cc.find("itemSelect", this.tableSelect);
              this.right = cc.find("right", this.node);
              this.left = cc.find("left", this.node);
              return [ 4, this.loadRes() ];

             case 1:
              _a.sent();
              window.GameController.hideModel();
              return [ 2 ];
            }
          });
        });
      };
      BetsController4.prototype.loadRes = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              window.GameController.showModel();
              return [ 4, this.resource.loadAllRes() ];

             case 1:
              _a.sent();
              this.loadItemBetRes();
              this.loadBorderBetRes();
              this.init();
              this.bgSelectBet.active = true;
              this.right.active = true;
              this.left.active = true;
              this.tableSelect.active = true;
              this.itemSelect.active = true;
              return [ 2 ];
            }
          });
        });
      };
      BetsController4.prototype.loadItemBetRes = function() {
        var _this = this;
        var listItemSelectImg = this.resource.getlistImgItem();
        listItemSelectImg.forEach(function(data) {
          var item = new Item_1.default();
          item.setInfo(data.id, data.img);
          _this._listItemBetData.push(item);
        });
      };
      BetsController4.prototype.loadBorderBetRes = function() {
        var _this = this;
        var listBorderImg = this.resource.getlistBorderBet();
        listBorderImg.forEach(function(res) {
          var item = {
            id: res.id,
            img: res.img
          };
          _this._listBetBorder.push(item);
        });
      };
      BetsController4.prototype.getBetItem = function(id) {
        return this._listItemBetData[id];
      };
      BetsController4.prototype.instantiateBetsItem = function(itemInfo, x, y) {
        var self = this;
        this.distancceItemX = self.tableSelect.width / this.numberCol;
        this.distanceItemY = self.tableSelect.height / this.numberRow;
        var item = cc.instantiate(self.itemSelect);
        item.parent = self.tableSelect;
        item.setPosition((x + .5) * this.distancceItemX, (y + .5) * this.distanceItemY);
        var component = item.getComponent("BetsItem4");
        component.setBetItemInfo(itemInfo, x, y);
        component.betsController = self;
        item.active = true;
        this._listBet.push(component);
      };
      BetsController4.prototype.init = function() {
        this.numberCol = 1;
        this.numberRow = 5;
        this.bgBet.active = true;
        this.bgBet.zIndex = 10;
        for (var x = 0; x < this.numberCol; x++) for (var y = 0; y < this.numberRow; y++) {
          var item = this.getBetItem(y);
          this.instantiateBetsItem(item, x, y);
        }
      };
      BetsController4.prototype.changeView = function() {
        this.bgBet.active = !this.bgBet.active;
      };
      __decorate([ property(cc.Node) ], BetsController4.prototype, "tableSelect", void 0);
      __decorate([ property(cc.Node) ], BetsController4.prototype, "itemSelect", void 0);
      __decorate([ property(cc.Node) ], BetsController4.prototype, "bgBet", void 0);
      BetsController4 = __decorate([ ccclass ], BetsController4);
      return BetsController4;
    }(cc.Component);
    exports.default = BetsController4;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/Item": "Item",
    "./BetResource": "BetResource"
  } ],
  BetsItem4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5f6a1xzL3ZJyJVf3vxNL2S0", "BetsItem4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var BetsController4_1 = require("./BetsController4");
    var AtributeStatic_1 = require("../AtributeStatic");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BetsItem4 = function(_super) {
      __extends(BetsItem4, _super);
      function BetsItem4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spritesFrame = null;
        _this.betsController = null;
        _this.borderBet = null;
        _this.id = "";
        _this.x = 0;
        _this.y = 0;
        _this.count = 0;
        _this.idBet = "";
        _this.goldCtrl = null;
        return _this;
      }
      BetsItem4.prototype.onload = function() {
        this.borderBet.active = false;
      };
      BetsItem4.prototype.setBetItemInfo = function(item, x, y) {
        this.id = item.id;
        this.spritesFrame.spriteFrame = item.spritesFrame;
        this.x = x;
        this.y = y;
      };
      BetsItem4.prototype.addEventButton = function() {
        return __awaiter(this, void 0, void 0, function() {
          var atr, idBetE;
          return __generator(this, function(_a) {
            this.borderBet.active = !this.borderBet.active;
            this.idBet = this.id;
            atr = new AtributeStatic_1.default();
            atr.setIdBetSelect(this.id);
            cc.log("id = ", AtributeStatic_1.default.idBetSelect);
            idBetE = parseInt(AtributeStatic_1.default.idBetSelect);
            cc.log("idBetE = ", idBetE);
            window.SlotCtl4.goldCtr.updateActiveGold(AtributeStatic_1.default.idBetSelect);
            window.SlotCtl4.getCurrentBet(idBetE);
            return [ 2 ];
          });
        });
      };
      BetsItem4.prototype.getIdBetEvent = function() {
        return this.idBet;
      };
      BetsItem4.prototype.eventChangeView = function() {
        return __awaiter(this, void 0, void 0, function() {
          var idEvent, borderImg;
          var _this = this;
          return __generator(this, function(_a) {
            idEvent = this.idBet;
            if (idEvent == this.id) {
              this.borderBet.active = true;
              setTimeout(function() {
                return _this.betsController.changeView();
              }, 500);
              setTimeout(function() {
                return _this.borderBet.active = !_this.borderBet.active;
              }, 450);
              borderImg = this.betsController._listBetBorder[0];
              this.borderBet.getComponent(cc.Sprite).spriteFrame = borderImg.img;
            } else this.borderBet.active = false;
            return [ 2 ];
          });
        });
      };
      __decorate([ property(cc.Sprite) ], BetsItem4.prototype, "spritesFrame", void 0);
      __decorate([ property(BetsController4_1.default) ], BetsItem4.prototype, "betsController", void 0);
      __decorate([ property(cc.Node) ], BetsItem4.prototype, "borderBet", void 0);
      BetsItem4 = __decorate([ ccclass ], BetsItem4);
      return BetsItem4;
    }(cc.Component);
    exports.default = BetsItem4;
    cc._RF.pop();
  }, {
    "../AtributeStatic": "AtributeStatic",
    "./BetsController4": "BetsController4"
  } ],
  BottomBarController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "87074QkXOxOTI12esJd2SQF", "BottomBarController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Util_1 = require("../lib/Util");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BottomBarController = function(_super) {
      __extends(BottomBarController, _super);
      function BottomBarController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.winLabel = null;
        _this.betLabel = null;
        _this.spinButton = null;
        _this.holdTime = 500;
        _this.autoBet = null;
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
        return _this;
      }
      BottomBarController.prototype.onLoad = function() {
        this.initialize();
        this.resetWinAmount();
        this.addSpinButtonEvent();
      };
      BottomBarController.prototype.initialize = function() {
        this.container = this.node.getChildByName("container");
      };
      BottomBarController.prototype.toggleBar = function(time) {
        void 0 === time && (time = .5);
        this.container.runAction(cc.moveBy(time, cc.v2(0, this.container.height * (this._isShow ? -1 : 1))).easing(cc.easeSineOut()));
        this.container.runAction(this._isShow ? cc.fadeOut(time) : cc.fadeIn(time));
        this._isShow = !this._isShow;
      };
      BottomBarController.prototype.resetWinAmount = function() {
        this.winLabel.string = "0";
      };
      BottomBarController.prototype.addSpinButtonEvent = function() {
        var _this = this;
        this.spinButton.node.on(cc.Node.EventType.TOUCH_START, function(e) {
          _this._isPress = true;
          _this._setTimeout = setTimeout(function() {
            _this.autoBet.active || _this.showAutoBet();
            _this._isPress = false;
          }, _this.holdTime);
        });
        this.spinButton.node.on(cc.Node.EventType.TOUCH_END, function(e) {
          if (_this._isPress) {
            window.GameScene.clickSpin();
            clearTimeout(_this._setTimeout);
            _this._isPress = false;
          }
        });
        this.spinButton.node.on(cc.Node.EventType.TOUCH_CANCEL, function(e) {
          _this._isPress = false;
          clearTimeout(_this._setTimeout);
        });
      };
      BottomBarController.prototype.displayBetLabel = function() {
        var _this = this;
        var time = .15;
        this.betLabel.node.runAction(cc.scaleTo(time, 1.05));
        this.betLabel.string = Util_1.default.formatMoney(this.currentBet);
        setTimeout(function() {
          _this.betLabel.node.runAction(cc.scaleTo(time, 1));
        }, 1e3 * time);
      };
      BottomBarController.prototype.autoSpin = function(e, times) {
        var _this = this;
        window.GameScene.currentSlot.SlotController.autoSpin(Number(times));
        setTimeout(function() {
          _this.hideAutoBet();
        }, 100);
      };
      BottomBarController.prototype.showAutoBet = function() {
        this.autoBet.active = true;
        this.autoBet.runAction(cc.moveBy(.4, cc.v2(0, this.autoBet.height - 15)));
        Util_1.default.showNode(this.autoBet);
      };
      BottomBarController.prototype.hideAutoBet = function() {
        var _this = this;
        Util_1.default.hideNode(this.autoBet);
        this.autoBet.runAction(cc.moveBy(.1, cc.v2(0, 15 - this.autoBet.height)));
        setTimeout(function() {
          _this.autoBet.active = false;
        }, 300);
      };
      BottomBarController.prototype.updateInfo = function() {
        var currentSlot = window.GameScene.currentSlot || null;
        if (!currentSlot) return;
        this.betArray = currentSlot.SlotController.betArray;
        this.currentBet = currentSlot.SlotController.currentBet;
        this.displayBetLabel();
        this.winAmount = currentSlot.SlotController.lastWin;
        this.winLabel.string = this.winAmount.toString();
      };
      BottomBarController.prototype.changeBetAmount = function(e, i) {
        i = Number(i);
        var index = this.betArray.indexOf(this.currentBet);
        0 == index && -1 == i ? this.currentBet = this.betArray[this.betArray.length - 1] : index == this.betArray.length - 1 && 1 == i ? this.currentBet = this.betArray[0] : this.currentBet = index < 0 ? this.betArray[0] : this.betArray[index + i];
        window.GameScene.currentSlot && window.GameScene.currentSlot.SlotController.updateCurrentBet(this.currentBet);
        this.displayBetLabel();
      };
      BottomBarController.prototype.maxBetAmount = function() {
        this.currentBet = this.betArray[this.betArray.length - 1];
        window.GameScene.currentSlot && (window.GameScene.currentSlot.SlotController.currentBet = this.currentBet);
        this.displayBetLabel();
      };
      BottomBarController.prototype.updateWinAmount = function(num) {
        this.winAmount = num;
        this.isUpdattingWinAmount = true;
      };
      BottomBarController.prototype.update = function(dt) {
        this._updateWinAmount(dt);
      };
      BottomBarController.prototype._updateWinAmount = function(dt) {
        if (this.isUpdattingWinAmount) {
          var delta = this.winAmount - this._tempWin;
          this._tempWin = delta * this.lerpRatio * dt + this._tempWin;
          this.winLabel.string = Util_1.default.formatMoney(this._tempWin);
          if (this.winAmount - this._tempWin < 1) {
            this.winLabel.string = Util_1.default.formatMoney(this.winAmount);
            this.isUpdattingWinAmount = false;
            this._tempWin = 0;
          }
        }
      };
      __decorate([ property(cc.Label) ], BottomBarController.prototype, "winLabel", void 0);
      __decorate([ property(cc.Label) ], BottomBarController.prototype, "betLabel", void 0);
      __decorate([ property(cc.Button) ], BottomBarController.prototype, "spinButton", void 0);
      __decorate([ property(cc.Integer) ], BottomBarController.prototype, "holdTime", void 0);
      __decorate([ property(cc.Node) ], BottomBarController.prototype, "autoBet", void 0);
      BottomBarController = __decorate([ ccclass ], BottomBarController);
      return BottomBarController;
    }(cc.Component);
    exports.default = BottomBarController;
    cc._RF.pop();
  }, {
    "../lib/Util": "Util"
  } ],
  CoinLabel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "38713mHWmRFML2UHJo56Vtc", "CoinLabel");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Util_1 = require("../lib/Util");
    var CoinLabel = function() {
      function CoinLabel(coinLabel, lerpRatio, prefix) {
        this.coinLabel = null;
        this.lerpRatio = 10;
        this.userBalance = 0;
        this._tempUserBalance = 0;
        this.isUpdattingBalance = false;
        this.prefix = "";
        this.coinLabel = coinLabel;
        lerpRatio && (this.lerpRatio = lerpRatio);
        prefix && (this.prefix = prefix);
      }
      CoinLabel.prototype.updateUserBalance = function(num, option) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!option) return [ 3, 3 ];
              if (!option.delayTime) return [ 3, 2 ];
              return [ 4, Util_1.default.delay(option.delayTime) ];

             case 1:
              _a.sent();
              _a.label = 2;

             case 2:
              option.lerpRatio && (this.lerpRatio = option.lerpRatio);
              option.prefix && (this.prefix = option.prefix);
              _a.label = 3;

             case 3:
              this._tempUserBalance = this.userBalance;
              this.userBalance = num;
              this.isUpdattingBalance = true;
              return [ 2 ];
            }
          });
        });
      };
      CoinLabel.prototype._updateUserBalance = function(dt) {
        if (this.isUpdattingBalance) {
          var delta = this.userBalance - this._tempUserBalance;
          this._tempUserBalance = delta * this.lerpRatio * dt + this._tempUserBalance;
          this.coinLabel.string = this.prefix + Util_1.default.formatMoney(this._tempUserBalance);
          if (Math.abs(this.userBalance - this._tempUserBalance) < 1) {
            this.coinLabel.string = this.prefix + Util_1.default.formatMoney(this.userBalance);
            this.isUpdattingBalance = false;
          }
        }
      };
      return CoinLabel;
    }();
    exports.default = CoinLabel;
    cc._RF.pop();
  }, {
    "../lib/Util": "Util"
  } ],
  Concos: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d2a9c2xE+ZI44CCI+XTWMyZ", "Concos");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Event = {
      UPDATE_USER_BALANCE: "UPDATE_USER_BALANCE"
    };
    var Concos = function() {
      function Concos() {
        this.eventList = {};
        this.subUid = -1;
        return Concos._instance || (Concos._instance = this);
      }
      Concos.prototype.register = function(event, callback) {
        var token = (++this.subUid).toString();
        this.eventList[event] ? this.eventList[event].push({
          token: token,
          callback: callback
        }) : this.eventList[event] = [ {
          token: token,
          callback: callback
        } ];
        return token;
      };
      Concos.prototype.unRegister = function(token) {
        var eventList = this.eventList;
        for (var m in eventList) if (eventList[m]) for (var i = 0, j = eventList[m].length; i < j; i++) if (eventList[m][i].token === token) {
          eventList[m].splice(i, 1);
          return eventList;
        }
      };
      Concos.prototype.emit = function(event, data, option) {
        if (!this.eventList[event]) return false;
        this.eventList[event].forEach(function(item) {
          item.callback(data, option);
        });
      };
      return Concos;
    }();
    exports.default = new Concos();
    cc._RF.pop();
  }, {} ],
  DialogController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "33a9d/xzr9E2Y7H9ED3kqDe", "DialogController");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        notiDialog: {
          type: cc.Prefab,
          default: null
        },
        buyChipDialog: {
          type: require("NotiDialog"),
          default: null
        }
      },
      start: function start() {},
      showDialog: function showDialog(prefab, parent) {
        var node = cc.instantiate(prefab);
        node.parent = parent || this.node;
        node.setScale(.5, .5);
        node.opacity = 100;
        node.runAction(cc.fadeIn(1)).easing(cc.easeElasticOut(3));
        node.runAction(cc.scaleTo(1, 1), .5).easing(cc.easeElasticOut(3));
      },
      showNotiDialog: function showNotiDialog(parent) {
        cc.log("open noti dialog");
        this.showDialog(this.notiDialog, parent);
      }
    });
    cc._RF.pop();
  }, {
    NotiDialog: "NotiDialog"
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
              cc.log(err);
              return reject(err);
            }
            return resolve(texture);
          });
        });
      },
      loadImgFromStorage: function loadImgFromStorage() {
        var _this3 = this;
        var filePath = this._storagePath + "download1.png";
        cc.log(jsb.fileUtils.isFileExist(filePath));
        this.loadSource(filePath).then(function(sprite) {
          cc.log(sprite);
          _this3.sprite.spriteFrame = new cc.SpriteFrame(sprite);
        }).catch(function(err) {
          cc.log("error loading banner", JSON.stringify(err));
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
  FitWidthIphoneX: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b0badbZFiVCdbCKaIyB8Y1p", "FitWidthIphoneX");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        marrgin: 100
      },
      onLoad: function onLoad() {
        var realScreenSize = cc.view.getFrameSize();
        var realScreenRatio = realScreenSize.width / realScreenSize.height;
        if (realScreenRatio >= 2.165 && this.node.getComponent(cc.Widget)) {
          this.node.getComponent(cc.Widget).left = this.marrgin;
          this.node.getComponent(cc.Widget).right = this.marrgin;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  GameConfig: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3cd21EwkSRDvL7ZGEzj9bOb", "GameConfig");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameConfig = function() {
      function GameConfig() {}
      GameConfig.GAME_SIZE = {
        1: [ 3, 3, 3, 3, 3 ],
        2: [ 4, 4, 4, 4, 4 ],
        3: [ 4, 4, 4, 4, 4, 4 ],
        4: [ 1, 3, 5, 3, 1 ],
        5: [ 2, 3, 4, 3, 2 ]
      };
      GameConfig.PAY_LINES = {
        20: [ [ 1, 1, 1, 1, 1 ], [ 0, 0, 0, 0, 0 ], [ 2, 2, 2, 2, 2 ], [ 0, 1, 2, 1, 0 ], [ 2, 1, 0, 1, 2 ], [ 1, 0, 0, 0, 1 ], [ 1, 2, 2, 2, 1 ], [ 0, 0, 1, 2, 2 ], [ 2, 2, 1, 0, 0 ], [ 1, 2, 1, 0, 1 ], [ 1, 0, 1, 2, 1 ], [ 0, 1, 1, 1, 0 ], [ 2, 1, 1, 1, 2 ], [ 0, 1, 0, 1, 0 ], [ 2, 1, 2, 1, 2 ], [ 1, 1, 0, 1, 1 ], [ 1, 1, 2, 1, 1 ], [ 0, 0, 2, 0, 0 ], [ 2, 2, 0, 2, 2 ], [ 0, 2, 2, 2, 0 ] ],
        80: [ [ 1, 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2, 2, 2 ], [ 0, 0, 0, 0, 0, 0 ], [ 3, 3, 3, 3, 3, 3 ], [ 0, 1, 2, 2, 1, 0 ], [ 3, 2, 1, 1, 2, 3 ], [ 1, 2, 3, 3, 2, 1 ], [ 2, 1, 0, 0, 1, 2 ], [ 0, 1, 0, 0, 1, 0 ], [ 3, 2, 3, 3, 2, 3 ], [ 1, 0, 1, 1, 0, 1 ], [ 2, 3, 2, 2, 3, 2 ], [ 1, 2, 1, 1, 2, 1 ], [ 2, 1, 2, 2, 1, 2 ], [ 0, 0, 1, 1, 0, 0 ], [ 3, 3, 2, 2, 3, 3 ], [ 1, 1, 2, 2, 1, 1 ], [ 2, 2, 1, 1, 2, 2 ], [ 2, 2, 3, 3, 2, 2 ], [ 1, 1, 0, 0, 1, 1 ], [ 1, 2, 2, 2, 2, 1 ], [ 2, 1, 1, 1, 1, 2 ], [ 1, 0, 0, 0, 0, 1 ], [ 2, 3, 3, 3, 3, 2 ], [ 3, 2, 2, 2, 2, 3 ], [ 0, 1, 1, 1, 1, 0 ], [ 2, 0, 0, 0, 0, 2 ], [ 1, 3, 3, 3, 3, 1 ], [ 3, 1, 1, 1, 1, 3 ], [ 0, 2, 2, 2, 2, 0 ], [ 2, 2, 0, 0, 2, 2 ], [ 1, 1, 3, 3, 1, 1 ], [ 0, 0, 2, 2, 0, 0 ], [ 3, 3, 1, 1, 3, 3 ], [ 3, 3, 0, 0, 3, 3 ], [ 0, 0, 3, 3, 0, 0 ], [ 3, 2, 1, 0, 0, 0 ], [ 0, 1, 2, 3, 3, 3 ], [ 0, 0, 0, 1, 2, 3 ], [ 3, 3, 3, 2, 1, 0 ], [ 2, 1, 0, 0, 0, 0 ], [ 1, 2, 3, 3, 3, 3 ], [ 0, 0, 0, 0, 1, 2 ], [ 3, 3, 3, 3, 2, 1 ], [ 3, 2, 1, 1, 1, 1 ], [ 0, 1, 2, 2, 2, 2 ], [ 1, 1, 1, 1, 2, 3 ], [ 2, 2, 2, 2, 1, 0 ], [ 1, 3, 0, 0, 3, 0 ], [ 2, 0, 3, 3, 0, 2 ], [ 0, 3, 0, 0, 3, 0 ], [ 3, 0, 3, 3, 0, 3 ], [ 0, 1, 0, 1, 0, 1 ], [ 3, 2, 3, 2, 3, 2 ], [ 1, 2, 1, 2, 1, 2 ], [ 2, 1, 2, 1, 2, 1 ], [ 2, 3, 2, 3, 2, 3 ], [ 1, 0, 1, 0, 1, 0 ], [ 0, 2, 0, 2, 0, 2 ], [ 3, 1, 3, 1, 3, 1 ], [ 1, 3, 1, 3, 1, 3 ], [ 2, 0, 2, 0, 2, 0 ], [ 0, 3, 0, 3, 3, 0 ], [ 3, 0, 3, 0, 3, 0 ], [ 0, 1, 2, 3, 2, 1 ], [ 3, 2, 1, 0, 1, 2 ], [ 1, 2, 3, 2, 1, 0 ], [ 2, 1, 0, 1, 2, 3 ], [ 0, 1, 0, 1, 2, 3 ], [ 3, 2, 3, 2, 1, 0 ], [ 1, 2, 1, 0, 1, 2 ], [ 2, 1, 2, 3, 2, 1 ], [ 0, 3, 3, 3, 3, 0 ], [ 3, 0, 0, 0, 0, 3 ], [ 1, 0, 1, 2, 1, 0 ], [ 2, 3, 2, 1, 2, 3 ], [ 0, 2, 3, 3, 2, 0 ], [ 3, 1, 0, 0, 1, 3 ], [ 1, 3, 0, 3, 0, 2 ], [ 2, 0, 3, 0, 3, 1 ] ]
      };
      GameConfig.LINE_COLORS = [ [ 137, 239, 149 ], [ 219, 176, 23 ], [ 255, 192, 37 ], [ 188, 12, 22 ], [ 6, 154, 220 ], [ 147, 76, 147 ] ];
      GameConfig.EVENT = {
        REGIS: "regisClient",
        SMINFO: "sminfo",
        SLOT_SPIN: "slotspin",
        BUY_COIN: "buycoin",
        SLOT_GET_BONUS: "slotgetbonus",
        SLOT_BONUS_RESULT: "slotbonus"
      };
      GameConfig.SMID = {
        4: "sm2002",
        5: "sm2001"
      };
      return GameConfig;
    }();
    exports.default = GameConfig;
    cc._RF.pop();
  }, {} ],
  GameController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b5626ARq+VCVp5u2EAHN17N", "GameController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Api_1 = require("./Api");
    var util_1 = require("./lib/util");
    var Concos_1 = require("./Concos");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var GameController = function(_super) {
      __extends(GameController, _super);
      function GameController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.mainNode = null;
        _this.homeScenePrefab = null;
        _this.gameScenePrefab = null;
        _this.modelNode = null;
        _this.userBalance = 0;
        return _this;
      }
      GameController.prototype.onLoad = function() {
        this.initialize();
        this.login();
        this.registerEvent();
        window["concos"] = Concos_1.default;
        window["api"] = Api_1.default;
      };
      GameController.prototype.initialize = function() {
        cc.game.addPersistRootNode(this.node);
        window.GameController = this;
        this.modelNode.zIndex = 8;
      };
      GameController.prototype.login = function() {
        Api_1.default.login();
      };
      GameController.prototype.registerEvent = function() {
        Concos_1.default.register(Concos_1.Event.UPDATE_USER_BALANCE, this.updateUserBalance.bind(this));
      };
      GameController.prototype.gotoHomeScene = function() {
        if (null == this.homeScene) {
          var node = cc.instantiate(this.homeScenePrefab);
          node.parent = this.mainNode;
          this.homeScene = node;
        }
      };
      GameController.prototype.openSlot = function(id, smid) {
        if (null == this.gameScene) {
          this.gameScene = cc.instantiate(this.gameScenePrefab);
          this.gameScene.parent = this.mainNode;
        } else util_1.default.showNode(this.gameScene);
        this.gameScene.getComponent("GameScene").openSlot(id);
      };
      GameController.prototype.slotWatch = function(data) {
        window.GameScene && window.GameScene.slotWatch(data);
        Concos_1.default.emit(Concos_1.Event.UPDATE_USER_BALANCE, data.ccoin);
      };
      GameController.prototype.showModel = function() {
        this.modelNode.active = true;
      };
      GameController.prototype.hideModel = function() {
        this.modelNode.active = false;
      };
      GameController.prototype.updateUserBalance = function(amount) {
        this.userBalance = amount;
      };
      __decorate([ property(cc.Node) ], GameController.prototype, "mainNode", void 0);
      __decorate([ property(cc.Prefab) ], GameController.prototype, "homeScenePrefab", void 0);
      __decorate([ property(cc.Prefab) ], GameController.prototype, "gameScenePrefab", void 0);
      __decorate([ property(cc.Node) ], GameController.prototype, "modelNode", void 0);
      GameController = __decorate([ ccclass ], GameController);
      return GameController;
    }(cc.Component);
    exports.default = GameController;
    cc._RF.pop();
  }, {
    "./Api": "Api",
    "./Concos": "Concos",
    "./lib/util": "Util"
  } ],
  GameScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a56c9oArvRLpKUSqfmJzbIc", "GameScene");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Util_1 = require("../lib/Util");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var GameScene = function(_super) {
      __extends(GameScene, _super);
      function GameScene() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.top = null;
        _this.bottom = null;
        _this.center = null;
        _this.bigBg = null;
        _this._topBarController = null;
        _this._bottomBarController = null;
        _this.ScenesManager = [];
        return _this;
      }
      GameScene.prototype.onLoad = function() {
        this.initState();
        this.initPosition();
      };
      GameScene.prototype.initState = function() {
        window.GameScene = this;
        this.top.active = true;
        this.center.active = true;
        this.bottom.active = true;
        this._topBarController = this.node.getComponentInChildren("TopBarController");
        this._bottomBarController = this.node.getComponentInChildren("BottomBarController");
      };
      GameScene.prototype.initPosition = function() {
        this.top.getComponent(cc.Widget).enabled = false;
        this.top.y += this.top.height;
        this.bottom.getComponent(cc.Widget).enabled = false;
        this.bottom.y -= this.bottom.height;
      };
      GameScene.prototype.openSlot = function(id) {
        return __awaiter(this, void 0, void 0, function() {
          var slotScene;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              slotScene = this.ScenesManager.find(function(x) {
                return x.id == id;
              });
              if (slotScene) return [ 2, this.resumeSlot(slotScene.uuid, slotScene.id) ];
              this._topBarController.hideFreeSpin(.1);
              window.GameController.showModel();
              return [ 4, Promise.all([ this.instantiateSlot(id), this.loadBgSlot(id) ]) ];

             case 1:
              _a.sent();
              Util_1.default.showNode(this.node);
              this.bigBg.node.runAction(cc.sequence([ cc.moveBy(.5, cc.v2(0, this.bigBg.node.height)).easing(cc.easeSineOut()), cc.callFunc(function() {
                _this.toggleTopBottomBar();
              }), cc.delayTime(.5), cc.callFunc(function() {
                return __awaiter(_this, void 0, void 0, function() {
                  return __generator(this, function(_a) {
                    this.currentSlot.SlotController.startSlot();
                    this.currentSlot.SlotNode.runAction(cc.fadeIn(.5));
                    window.MultiScene.loadContent();
                    window.GameController.hideModel();
                    return [ 2 ];
                  });
                });
              }) ]));
              return [ 2 ];
            }
          });
        });
      };
      GameScene.prototype.resumeSlot = function(uuid, id) {
        return __awaiter(this, void 0, void 0, function() {
          var freeSpin;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              Util_1.default.hideNode(this.node);
              this.currentSlot = this.ScenesManager.find(function(item) {
                return item.uuid == uuid;
              });
              freeSpin = this.currentSlot.SlotController.freeSpin;
              if (freeSpin > 0) {
                this._topBarController.updateFreeSpin(freeSpin);
                this._topBarController.showFreeSpin(.1);
              } else this._topBarController.hideFreeSpin(.1);
              return [ 4, this.loadBgSlot(id) ];

             case 1:
              _a.sent();
              this.bigBg.node.runAction(cc.sequence([ cc.moveBy(.01, cc.v2(0, this.bigBg.node.height)).easing(cc.easeSineOut()), cc.callFunc(function() {
                window.GameScene._bottomBarController.updateInfo();
                _this.toggleTopBottomBar(.01);
              }), cc.callFunc(function() {
                _this.resumeGame();
              }), cc.callFunc(function() {
                _this.node.runAction(cc.scaleTo(.01, .1));
                _this.node.runAction(cc.moveBy(.01, cc.v2(1e3, 0)));
              }), cc.delayTime(.1), cc.callFunc(function() {
                Util_1.default.showNode(_this.node);
                _this.node.runAction(cc.scaleTo(.3, 1));
                _this.node.runAction(cc.moveBy(.3, cc.v2(-1e3, 0)));
              }) ]));
              return [ 2 ];
            }
          });
        });
      };
      GameScene.prototype.switchSlot = function(uuid, id) {
        return __awaiter(this, void 0, void 0, function() {
          var slotScene, resPath, freeSpin;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              slotScene = this.ScenesManager.find(function(item) {
                return item.uuid == uuid;
              });
              resPath = "4_gameScene/" + id + "_Slot" + id + "/img/bg-big";
              return [ 4, new Promise(function(res, rej) {
                cc.loader.loadRes(resPath, function(err, texture) {
                  if (0 == texture.length) return;
                  _this.bigBg.node.active = true;
                  _this.bigBg.spriteFrame = new cc.SpriteFrame(texture);
                  res();
                });
              }) ];

             case 1:
              _a.sent();
              Util_1.default.hideNode(this.currentSlot.SlotNode);
              this.currentSlot = slotScene;
              Util_1.default.showNode(this.currentSlot.SlotNode);
              window.GameScene._bottomBarController.updateInfo();
              this.currentSlot.SlotNode.opacity = 0;
              this.currentSlot.SlotNode.runAction(cc.fadeIn(.5));
              freeSpin = this.currentSlot.SlotController.freeSpin;
              if (freeSpin > 0) {
                this._topBarController.updateFreeSpin(freeSpin);
                this._topBarController.showFreeSpin();
              } else this._topBarController.hideFreeSpin();
              return [ 2 ];
            }
          });
        });
      };
      GameScene.prototype.minimizeGameScene = function() {
        var _this = this;
        this.currentSlot.SlotNode.runAction(cc.sequence(cc.callFunc(function() {
          _this.node.runAction(cc.scaleTo(.2, .1));
          _this.node.runAction(cc.moveBy(.3, cc.v2(1e3, 0)));
        }), cc.delayTime(.3), cc.callFunc(function() {
          Util_1.default.hideNode(_this.node);
          _this.node.runAction(cc.scaleTo(.02, 1));
          _this.node.runAction(cc.moveBy(.03, cc.v2(-1e3, 0)));
        }), cc.fadeOut(.01), cc.callFunc(function() {
          _this.toggleTopBottomBar(.01);
        }), cc.delayTime(.01), cc.callFunc(function() {
          _this.hideBg(.01);
        }), cc.delayTime(.01), cc.callFunc(function() {
          _this.currentSlot = null;
          window.MultiScene.loadContent();
        })));
      };
      GameScene.prototype.deleteSlot = function() {
        var _this = this;
        this.ScenesManager = this.ScenesManager.filter(function(item) {
          return item.uuid != _this.currentSlot.uuid;
        });
        this.currentSlot.SlotNode.runAction(cc.sequence(cc.fadeOut(.5), cc.callFunc(function() {
          _this.toggleTopBottomBar();
        }), cc.delayTime(.5), cc.callFunc(function() {
          _this.hideBg();
        }), cc.delayTime(.75), cc.callFunc(function() {
          Util_1.default.hideNode(_this.node);
          _this.currentSlot.SlotNode.destroy();
          _this.currentSlot = null;
          window.MultiScene.loadContent();
        })));
      };
      GameScene.prototype.resumeGame = function() {
        var slotNode = this.currentSlot.SlotNode;
        slotNode.parent = this.node;
        slotNode.active = true;
        slotNode.opacity = 0;
        slotNode.runAction(cc.fadeIn(.5));
        window.MultiScene.loadContent();
      };
      GameScene.prototype.instantiateSlot = function(id) {
        var _this = this;
        return new Promise(function(res, rej) {
          var resPath = "5_Games/" + id + "_Slot" + id + "/Slot" + id;
          cc.loader.loadRes(resPath, function(err, prefab) {
            err && rej(err);
            if (null == prefab.name) return;
            var slotNode = cc.instantiate(prefab);
            var slotScene = {
              id: id,
              uuid: Util_1.default.generateUUID(),
              SlotNode: slotNode,
              SlotController: slotNode.getComponent("SlotController")
            };
            slotNode.opacity = 0;
            slotNode.parent = _this.center;
            _this.ScenesManager.push(slotScene);
            _this.currentSlot = slotScene;
            slotScene.SlotController.getData().then(res).catch(rej);
          });
        });
      };
      GameScene.prototype.loadBgSlot = function(id) {
        var _this = this;
        return new Promise(function(res, rej) {
          _this.bigBg.node.active = false;
          _this.bigBg.node.y = -_this.bigBg.node.height;
          var resPath = "4_gameScene/" + id + "_Slot" + id + "/img/bg-big";
          cc.loader.loadRes(resPath, function(err, sprite) {
            if (0 == sprite.length) return;
            _this.bigBg.node.active = true;
            _this.bigBg.spriteFrame = new cc.SpriteFrame(sprite);
            res();
          });
        });
      };
      GameScene.prototype.toggleTopBottomBar = function(time) {
        void 0 === time && (time = .5);
        this._topBarController.toggleBar(time);
        this._bottomBarController.toggleBar(time);
      };
      GameScene.prototype.hideBg = function(time) {
        void 0 === time && (time = .5);
        this.bigBg.node.runAction(cc.moveBy(time, cc.v2(0, -this.node.height)).easing(cc.easeSineIn()));
      };
      GameScene.prototype.clickSpin = function() {
        this.currentSlot.SlotController.clickSpin();
      };
      GameScene.prototype.slotWatch = function(data) {
        var slotScene = this.ScenesManager.find(function(x) {
          return x.SlotController.gameId == data.smid;
        });
        if (!slotScene) return;
        slotScene.SlotController.watchEvent(data);
      };
      __decorate([ property(cc.Node) ], GameScene.prototype, "top", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "bottom", void 0);
      __decorate([ property(cc.Node) ], GameScene.prototype, "center", void 0);
      __decorate([ property(cc.Sprite) ], GameScene.prototype, "bigBg", void 0);
      GameScene = __decorate([ ccclass ], GameScene);
      return GameScene;
    }(cc.Component);
    exports.default = GameScene;
    cc._RF.pop();
  }, {
    "../lib/Util": "Util"
  } ],
  GoldCtrl4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8a956aWUqFAN65XxApAjmPz", "GoldCtrl4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceGold4_1 = require("./ResourceGold4");
    var Item_1 = require("../../../../scripts/Slots/Item");
    var AtributeStatic_1 = require("../AtributeStatic");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var GoldCtrl4 = function(_super) {
      __extends(GoldCtrl4, _super);
      function GoldCtrl4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.resource = new ResourceGold4_1.default();
        _this._listItemGoldData = [];
        _this._listGoldItem = [];
        _this.distanceItemY = 0;
        _this.distancceItemX = 0;
        _this.idEvent = "";
        _this.isClick = false;
        _this._betController = null;
        _this.tableSelect = null;
        _this.itemSelect = null;
        _this.betPrefab = null;
        _this.SlotNode = null;
        return _this;
      }
      GoldCtrl4.prototype.onLoad = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, this.resource.loadAllRes() ];

             case 1:
              _a.sent();
              this.loadItemGoldRes();
              this.isClick = true;
              this.init();
              return [ 2 ];
            }
          });
        });
      };
      GoldCtrl4.prototype.loadItemGoldRes = function() {
        var _this = this;
        var listItemSelectImg = this.resource.getlistImgItem();
        listItemSelectImg.forEach(function(data) {
          var item = new Item_1.default();
          item.setInfo(data.id, data.img);
          _this._listItemGoldData.push(item);
        });
      };
      GoldCtrl4.prototype.getGoldItem = function(id) {
        return this._listItemGoldData[id];
      };
      GoldCtrl4.prototype.instantiateBetsItem = function(itemInfo, x, y) {
        var self = this;
        this.distancceItemX = self.tableSelect.width / this.numberCol;
        this.distanceItemY = self.tableSelect.height / this.numberRow;
        var item = cc.instantiate(self.itemSelect);
        item.parent = self.tableSelect;
        item.setPosition((x + .5) * this.distancceItemX, (y + .5) * this.distanceItemY);
        var component = item.getComponent("GoldItems4");
        component.setGoldItemInfo(itemInfo, x, y, AtributeStatic_1.default.idBetSelect);
        component.controller = self;
        item.active = true;
        this._listGoldItem.push(component);
      };
      GoldCtrl4.prototype.init = function() {
        this.numberCol = 5;
        this.numberRow = 1;
        for (var x = this.numberCol - 1; x >= 0; x--) for (var y = 0; y < this.numberRow; y++) {
          var item = this.getGoldItem(x);
          this.instantiateBetsItem(item, x, y);
        }
      };
      GoldCtrl4.prototype.statusButton = function() {
        this.isClick = !this.isClick;
      };
      GoldCtrl4.prototype.updateActiveGold = function(idBet) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (idBet) {
             case "0":
              this._listGoldItem.forEach(function(item) {
                item.id < 4 ? item.node.opacity = 128 : item.node.opacity = 255;
              });
              AtributeStatic_1.default.idBetSelect = null;
              break;

             case "1":
              this._listGoldItem.forEach(function(item) {
                item.id < 3 ? item.node.opacity = 128 : item.node.opacity = 255;
              });
              break;

             case "2":
              this._listGoldItem.forEach(function(item) {
                item.id < 2 ? item.node.opacity = 128 : item.node.opacity = 255;
              });
              break;

             case "3":
              this._listGoldItem.forEach(function(item) {
                item.id < 1 ? item.node.opacity = 128 : item.node.opacity = 255;
              });
              break;

             case "4":
              this._listGoldItem.forEach(function(item) {
                item.node.opacity = 255;
              });
              break;

             default:
              this._listGoldItem.forEach(function(item) {
                item.node.opacity = 255;
              });
              cc.log("default");
              return [ 2 ];
            }
            return [ 2 ];
          });
        });
      };
      __decorate([ property(cc.Node) ], GoldCtrl4.prototype, "tableSelect", void 0);
      __decorate([ property(cc.Node) ], GoldCtrl4.prototype, "itemSelect", void 0);
      __decorate([ property(cc.Prefab) ], GoldCtrl4.prototype, "betPrefab", void 0);
      __decorate([ property(cc.Node) ], GoldCtrl4.prototype, "SlotNode", void 0);
      GoldCtrl4 = __decorate([ ccclass ], GoldCtrl4);
      return GoldCtrl4;
    }(cc.Component);
    exports.default = GoldCtrl4;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/Item": "Item",
    "../AtributeStatic": "AtributeStatic",
    "./ResourceGold4": "ResourceGold4"
  } ],
  GoldItems4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "59eab4YcDxLlI4RRkQgu22U", "GoldItems4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GoldCtrl4_1 = require("./GoldCtrl4");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var GoldItems4 = function(_super) {
      __extends(GoldItems4, _super);
      function GoldItems4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.spritesFrame = null;
        _this.controller = null;
        _this.id = "";
        _this.x = 0;
        _this.y = 0;
        _this.count = 0;
        return _this;
      }
      GoldItems4.prototype.setGoldItemInfo = function(item, x, y, idEvent) {
        this.id = item.id;
        this.spritesFrame.spriteFrame = item.spritesFrame;
        this.x = x;
        this.y = y;
        this.setGoldItemActive(item, idEvent);
      };
      GoldItems4.prototype.setGoldItemActive = function(item, idEvent) {
        "0" == idEvent && item.id < 4 && (item.opacity = 128);
        "1" == idEvent && item.id < 3 && (item.opacity = 128);
        "2" == idEvent && item.id < 2 && (item.opacity = 128);
        "3" == idEvent && item.id < 1 && (item.opacity = 128);
      };
      GoldItems4.prototype.update = function() {};
      __decorate([ property(cc.Sprite) ], GoldItems4.prototype, "spritesFrame", void 0);
      __decorate([ property(GoldCtrl4_1.default) ], GoldItems4.prototype, "controller", void 0);
      GoldItems4 = __decorate([ ccclass ], GoldItems4);
      return GoldItems4;
    }(cc.Component);
    exports.default = GoldItems4;
    cc._RF.pop();
  }, {
    "./GoldCtrl4": "GoldCtrl4"
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
        _this.listItemGame = [];
        _this.itemGame = null;
        _this.animationclip = null;
        return _this;
      }
      HomeScene.prototype.onLoad = function() {
        this.initialize();
      };
      HomeScene.prototype.initialize = function() {
        var _this = this;
        window.HomeScene = this;
        this._userInfoController = this.node.getComponentInChildren("UserInfoController");
        this.listItemGame.forEach(function(sprite, i) {
          var itemGame = cc.instantiate(_this.itemGame);
          itemGame.parent = _this.listGameView;
          itemGame.active = true;
          itemGame.getComponent("ItemGame").setData(++i, sprite);
        });
      };
      HomeScene.prototype.gotoStartScene = function() {
        cc.director.loadScene("LoginScene");
      };
      HomeScene.prototype.openSlot = function(e) {
        return __awaiter(this, void 0, void 0, function() {
          var ItemGame, id, smid;
          return __generator(this, function(_a) {
            ItemGame = e.target.getComponent("ItemGame");
            id = ItemGame.id;
            smid = ItemGame.smid;
            window.GameController.openSlot(id, smid);
            ItemGame.checkRes();
            return [ 2 ];
          });
        });
      };
      __decorate([ property(cc.Node) ], HomeScene.prototype, "listGameView", void 0);
      __decorate([ property([ cc.SpriteFrame ]) ], HomeScene.prototype, "listItemGame", void 0);
      __decorate([ property(cc.Node) ], HomeScene.prototype, "itemGame", void 0);
      __decorate([ property(cc.AnimationClip) ], HomeScene.prototype, "animationclip", void 0);
      HomeScene = __decorate([ ccclass ], HomeScene);
      return HomeScene;
    }(cc.Component);
    exports.default = HomeScene;
    cc._RF.pop();
  }, {} ],
  ImageScaleResolution: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "473a2Shyi9HF41rOaPbPjcy", "ImageScaleResolution");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        this.init();
      },
      init: function init() {
        var realScreenSize = cc.view.getFrameSize();
        var realScreenRatio = realScreenSize.width / realScreenSize.height;
        var designScreenRatio = this.node.width / this.node.height;
        var scaleRatio = this.node.width * realScreenSize.height / (this.node.height * realScreenSize.width);
        if (realScreenRatio < designScreenRatio) {
          this.node.width *= scaleRatio;
          this.node.scaleY *= scaleRatio;
        } else {
          this.node.width /= scaleRatio;
          this.node.scaleY /= scaleRatio;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  ItemGame: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5bbeb6hzUpObodJ2mdI9+U3", "ItemGame");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SlotsDownloadCtr_1 = require("../Slots/SlotsDownloadCtr");
    var GameConfig_1 = require("../GameConfig");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ItemGame = function(_super) {
      __extends(ItemGame, _super);
      function ItemGame() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.id = 0;
        _this.smid = "";
        return _this;
      }
      ItemGame.prototype.setData = function(id, image) {
        this.id = id;
        this.node.getComponent(cc.Sprite).spriteFrame = image;
        this.smid = GameConfig_1.default.SMID[id] || "";
        var slotsDownloadCtr = new SlotsDownloadCtr_1.default();
        slotsDownloadCtr.getUrls(1);
      };
      ItemGame.prototype.setComponentResCtr = function() {
        var _this = this;
        var resPath = "5_Games/" + this.id + "_Slot" + this.id + "/Slot" + this.id + "ResCtr";
        cc.loader.loadRes(resPath, cc.Prefab, function(err, resCtr) {
          if (err) return;
          _this.node.addComponent(resCtr.getComponent(""));
          _this.resCtr = resCtr;
        });
      };
      ItemGame.prototype.checkRes = function() {};
      ItemGame = __decorate([ ccclass ], ItemGame);
      return ItemGame;
    }(cc.Component);
    exports.default = ItemGame;
    cc._RF.pop();
  }, {
    "../GameConfig": "GameConfig",
    "../Slots/SlotsDownloadCtr": "SlotsDownloadCtr"
  } ],
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
      Item.prototype.setInfo = function(id, spriteFrame) {
        this.id = id;
        this.spritesFrame = spriteFrame;
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
  LinesController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ddc65mv5XtJr6Rcm5HohZzJ", "LinesController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameConfig_1 = require("../GameConfig");
    var Util_1 = require("../../scripts/lib/Util");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var LinesController = function(_super) {
      __extends(LinesController, _super);
      function LinesController() {
        var _this_1 = null !== _super && _super.apply(this, arguments) || this;
        _this_1.tableView = null;
        _this_1.lineAnimate = null;
        _this_1.lineSprite = null;
        _this_1.lineItem = null;
        _this_1.totalLines = 20;
        _this_1.lineNode = [];
        return _this_1;
      }
      LinesController.prototype.onLoad = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, this.loadRes() ];

             case 1:
              _a.sent();
              this.initialize();
              this.initState();
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
              return [ 4, Promise.all([ Util_1.default.loadRes("0_animation/Slots/LineAni", cc.AnimationClip), Util_1.default.loadRes("0_textures/Slots/Linepay", cc.SpriteFrame) ]) ];

             case 1:
              _a = _b.sent(), this.lineAnimate = _a[0], this.lineSprite = _a[1];
              return [ 2 ];
            }
          });
        });
      };
      LinesController.prototype.initState = function() {
        this._slotController = this.node.parent.getComponent("SlotController");
      };
      LinesController.prototype.initialize = function() {
        this.lineItem = new cc.Node("Linepay");
        var sp = this.lineItem.addComponent(cc.Sprite);
        sp.spriteFrame = this.lineSprite;
        this.lineItem.anchorX = .015;
        this.lineItem.anchorY = .5;
      };
      LinesController.prototype.initPosition = function() {
        this.node.parent = this.tableView;
        this.node.anchorX = 0;
        this.node.anchorY = 0;
        this.node.width = this.tableView.width;
        this.node.height = this.tableView.height;
        this.node.x = 0;
        this.node.y = 0;
        this.node.zIndex = 1;
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
        var _this_1 = this;
        this.node.active = true;
        totalLines && (this.totalLines = totalLines);
        Util_1.default.showNode(this.node, 1);
        arr.forEach(function(item) {
          _this_1.getLine(item);
        });
        this.animation.play("LineAni");
        return new Promise(function(res, rej) {
          setTimeout(function() {
            _this_1.stopShowLines();
            res();
          }, 1200);
        });
      };
      LinesController.prototype.showLine = function(item) {
        var _this_1 = this;
        this.node.active = true;
        Util_1.default.showNode(this.node, 1);
        this.getLine(item);
        this.animation.play("LineAni");
        return new Promise(function(res, rej) {
          setTimeout(function() {
            _this_1.stopShowLines();
            res();
          }, 1400);
        });
      };
      LinesController.prototype.stopShowLines = function() {
        this.animation && this.animation.stop();
        this.lineNode.forEach(function(item) {
          item.active = false;
          cc.isValid(item) && item.destroy();
        });
        this.node.active = false;
      };
      LinesController.prototype.refreshShowLines = function() {
        this.animation.stop();
        Util_1.default.hideNode(this.node);
        this.lineNode && this.lineNode.forEach(function(item) {
          cc.isValid(item) && item.destroy();
        });
        this.lineNode = [];
      };
      LinesController.prototype.getLine = function(l) {
        var _this_1 = this;
        var _this = this;
        var payTable = GameConfig_1.default.PAY_LINES[this.totalLines];
        var line = payTable[l];
        var _a = this._slotController, distanceItemX = _a.distanceItemX, distanceItemY = _a.distanceItemY;
        var points = line.reduce(function(result, item, index) {
          var gameSize = _this_1._slotController.gameSizeType;
          var width = 3;
          3 == gameSize && (width = 4);
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
        var colorLine = this.getColorLine(l);
        var totalLineNode = new cc.Node("TotalLineNode");
        totalLineNode.parent = this.node;
        this.lineNode.push(totalLineNode);
        for (var i = 0; i < points.length - 1; i++) {
          var lineNode = cc.instantiate(_this.lineItem);
          var length = 4 + Math.sqrt(Math.pow(points[i].x - points[i + 1].x, 2) + Math.pow(points[i].y - points[i + 1].y, 2));
          var angle = 180 + 180 * Math.atan2(points[i].y - points[i + 1].y, points[i].x - points[i + 1].x) / Math.PI;
          lineNode.parent = totalLineNode;
          lineNode.active = true;
          lineNode.width = length;
          lineNode.angle = angle;
          lineNode.color = colorLine;
          lineNode.setPosition(points[i]);
        }
      };
      LinesController.prototype.getColorLine = function(n) {
        var _a;
        var lineColors = GameConfig_1.default.LINE_COLORS;
        n %= lineColors.length;
        return new ((_a = cc.Color).bind.apply(_a, [ void 0 ].concat(lineColors[n])))();
      };
      __decorate([ property(cc.Node) ], LinesController.prototype, "tableView", void 0);
      LinesController = __decorate([ ccclass ], LinesController);
      return LinesController;
    }(cc.Component);
    exports.default = LinesController;
    cc._RF.pop();
  }, {
    "../../scripts/lib/Util": "Util",
    "../GameConfig": "GameConfig"
  } ],
  LocalScaleResolution: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0535a6ZSb5HuLSjxeJVwBNF", "LocalScaleResolution");
    "use strict";
    var scaleRatio = -1;
    var realScreenRatio = -1;
    var designScreenRatio = -1;
    cc.myDesignResolution = {
      width: 960,
      height: 640
    };
    cc.Class({
      extends: cc.Component,
      properties: {
        fitHeight: {
          default: false
        },
        fitWidth: {
          default: false
        },
        listOfRatios: {
          default: [],
          type: [ "Float" ]
        },
        listOfScales: {
          default: [],
          type: [ "Float" ]
        },
        designResolutionWidth: {
          default: -1
        },
        designResolutionHeight: {
          default: -1
        },
        keepSizeRatio: {
          default: false
        },
        localizedSize: {
          default: false
        }
      },
      onLoad: function onLoad() {
        this.forceLocalize();
      },
      forceLocalize: function forceLocalize() {
        if (this.localizedScale) return;
        this.localizedScale = true;
        if (-1 == realScreenRatio) {
          var realScreenSize = cc.view.getFrameSize();
          realScreenRatio = realScreenSize.width / realScreenSize.height;
        }
        if (-1 == this.designResolutionWidth) {
          var designResolution = cc.myDesignResolution;
          designScreenRatio = designResolution.width / designResolution.height;
        } else designScreenRatio = this.designResolutionWidth / this.designResolutionHeight;
        scaleRatio = realScreenRatio < designScreenRatio ? this.fitWidth ? this.keepSizeRatio ? designScreenRatio / realScreenRatio : 1 : realScreenRatio / designScreenRatio : this.fitHeight ? this.keepSizeRatio ? realScreenRatio / designScreenRatio : 1 : designScreenRatio / realScreenRatio;
        var eps = .001;
        if (this.listOfRatios.length > 0) for (var i = 0; i < this.listOfRatios.length; i++) if (realScreenRatio - this.listOfRatios[i] > -eps) {
          if (-1 == this.listOfScales[i]) break;
          if (-2 == this.listOfScales[i]) return;
          this.node.scaleX = this.node.scaleY = this.listOfScales[i];
          return;
        }
        if (this.localizedSize) {
          this.node.width *= scaleRatio;
          this.node.height *= scaleRatio;
        } else {
          this.node.scaleX *= scaleRatio;
          this.node.scaleY *= scaleRatio;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  MinigameController1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d7e56NGG8tI3odhnrwKgR9b", "MinigameController1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Api_1 = require("../../../../scripts/Api");
    var Concos_1 = require("../../../../scripts/Concos");
    var Util_1 = require("../../../../scripts/lib/Util");
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MiniGameController1 = function(_super) {
      __extends(MiniGameController1, _super);
      function MiniGameController1() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.collectBonus = null;
        _this.itemsContainer = null;
        _this.multipleLabel = null;
        _this.baseScoreLabel = null;
        _this.gameResult = null;
        _this.mainGame = null;
        _this.scoreLabel = null;
        _this._slotController = null;
        _this.listItem = [];
        _this.playArray = [];
        _this.baseScore = 0;
        _this.totalMultiple = 0;
        _this._isLock = false;
        _this._time = 0;
        return _this;
      }
      MiniGameController1.prototype.startMiniGame = function(mul, mulArr, w) {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              cc.log(mulArr, w);
              window["game"] = this;
              this.playArray = mulArr;
              this.baseScore = w;
              this.baseScoreLabel.string = "$ " + Util_1.default.formatMoney(this.baseScore);
              this.coinController = new CoinLabel_1.default(this.scoreLabel);
              this.coinController.updateUserBalance(0);
              this.listItem = this.itemsContainer.children;
              this.listItem.forEach(function(item) {
                item.once(cc.Node.EventType.TOUCH_END, function(e) {
                  _this.selectItem(e.currentTarget);
                });
              });
              return [ 4, this.loadResource() ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      MiniGameController1.prototype.loadResource = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [ 2 ];
          });
        });
      };
      MiniGameController1.prototype.selectItem = function(node) {
        return __awaiter(this, void 0, void 0, function() {
          var num;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              cc.log("Touch");
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
      MiniGameController1.prototype.updateTotalMultiple = function(num) {
        var _this = this;
        this.totalMultiple += num;
        this.multipleLabel.node.runAction(cc.sequence(cc.scaleTo(.2, 1.2), cc.callFunc(function() {
          _this.multipleLabel.string = _this.totalMultiple + "X";
        }), cc.scaleTo(.3, 1)));
      };
      MiniGameController1.prototype.itemAction = function(node, num) {
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
      MiniGameController1.prototype.showEndGame = function() {
        var _this = this;
        return new Promise(function(res, rej) {
          return __awaiter(_this, void 0, void 0, function() {
            var _this = this;
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                this.gameResult.active = true;
                this.gameResult.opacity = 0;
                return [ 4, Util_1.default.delay(1e3) ];

               case 1:
                _a.sent();
                this.mainGame.runAction(cc.fadeOut(.3));
                this.gameResult.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
                  _this.coinController.updateUserBalance(_this.totalMultiple * _this.baseScore);
                  Api_1.default.sendGD({
                    e: "slotgetbonus",
                    gtype: "sm2003"
                  }, function(err, data) {
                    cc.log(data);
                  });
                }) ]));
                res();
                return [ 2 ];
              }
            });
          });
        });
      };
      MiniGameController1.prototype.backToSlot = function() {
        var _this = this;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          Concos_1.default.emit(Concos_1.Event.UPDATE_USER_BALANCE, window.GameController.userBalance, 0);
          _this.node.destroy();
        }) ]));
      };
      MiniGameController1.prototype.update = function(dt) {
        this.coinController._updateUserBalance(dt);
      };
      __decorate([ property(cc.Button) ], MiniGameController1.prototype, "collectBonus", void 0);
      __decorate([ property(cc.Node) ], MiniGameController1.prototype, "itemsContainer", void 0);
      __decorate([ property(cc.Label) ], MiniGameController1.prototype, "multipleLabel", void 0);
      __decorate([ property(cc.Label) ], MiniGameController1.prototype, "baseScoreLabel", void 0);
      __decorate([ property(cc.Node) ], MiniGameController1.prototype, "gameResult", void 0);
      __decorate([ property(cc.Node) ], MiniGameController1.prototype, "mainGame", void 0);
      __decorate([ property(cc.Label) ], MiniGameController1.prototype, "scoreLabel", void 0);
      MiniGameController1 = __decorate([ ccclass ], MiniGameController1);
      return MiniGameController1;
    }(cc.Component);
    exports.default = MiniGameController1;
    cc._RF.pop();
  }, {
    "../../../../scripts/Api": "Api",
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "../../../../scripts/Concos": "Concos",
    "../../../../scripts/lib/Util": "Util"
  } ],
  MinigameController5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1958fQ+oxFFpqrhzE+2a3xA", "MinigameController5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Util_1 = require("../../../../scripts/lib/Util");
    var ResourceMiniGame5_1 = require("./ResourceMiniGame5");
    var CoinLabel_1 = require("../../../../scripts/Components/CoinLabel");
    var Api_1 = require("../../../../scripts/Api");
    var Concos_1 = require("../../../../scripts/Concos");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MinigameController5 = function(_super) {
      __extends(MinigameController5, _super);
      function MinigameController5() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.itemsContainer = null;
        _this.scoreLabel = null;
        _this.rightBox = null;
        _this.coinResultLabel = null;
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
        _this._resourceController = new ResourceMiniGame5_1.default();
        return _this;
      }
      MinigameController5.prototype.startMiniGame = function(playArray, baseScore) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.playArray = playArray;
              this.baseScore = baseScore;
              this.node.children.forEach(function(item) {
                return item.active = false;
              });
              this.selectTable = cc.find("select-table", this.node);
              this.mainGame = cc.find("main-game", this.node);
              this.gameResult = cc.find("result-table", this.node);
              this.coinController = new CoinLabel_1.default(this.scoreLabel);
              this.coinController.updateUserBalance(this.score);
              this.coinResultController = new CoinLabel_1.default(this.coinResultLabel);
              this.coinResultController.updateUserBalance(this.score);
              this.listItem = this.itemsContainer.children;
              return [ 4, this.loadResource() ];

             case 1:
              _a.sent();
              return [ 2 ];
            }
          });
        });
      };
      MinigameController5.prototype.loadResource = function() {
        return __awaiter(this, void 0, void 0, function() {
          var date;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              date = Date.now();
              return [ 4, this._resourceController.loadAllRes() ];

             case 1:
              _a.sent();
              cc.log("load done in:", Date.now() - date);
              this.selectTable.active = true;
              return [ 2 ];
            }
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
          sprite.spriteFrame = _this._resourceController.loadRes(_this._resourceController.listResourceName.items[index + 1].normal);
          itemNode.children[0].once(cc.Node.EventType.TOUCH_END, function(e) {
            _this.selectItem(e.currentTarget);
          });
          setTimeout(function() {
            itemNode.runAction(cc.fadeIn(.5));
          }, 1e3 * Math.random() + 500);
        });
        this.fireNormalSpriteFrame = this._resourceController.loadRes(this._resourceController.listResourceName.fail.normal);
        this.fireAcitveSpriteFrame = this._resourceController.loadRes(this._resourceController.listResourceName.fail.active);
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
              return [ 4, Util_1.default.delay(1e3) ];

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
                cc.log(_this.score);
                _this.coinController.updateUserBalance(_this.score);
              }, 300);
              this.itemAction(node, new cc.Color(255, 255, 0, 255), num * this.baseScore);
              return [ 4, Util_1.default.delay(150) ];

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
        shadowSprite.spriteFrame = this._resourceController.loadRes(this._resourceController.listResourceName.items[index].white);
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
          scoreLabel.string = Util_1.default.formatMoney(score);
          scoreNode.runAction(cc.sequence([ cc.delayTime(.4), cc.moveBy(1, cc.v2(1, 45)) ]));
          scoreNode.runAction(cc.sequence([ cc.delayTime(.2), cc.fadeIn(.3), cc.delayTime(.5), cc.fadeOut(.5), cc.callFunc(function() {
            scoreNode.destroy();
          }) ]));
        } else {
          var failNode = new cc.Node();
          var failSprite = failNode.addComponent(cc.Sprite);
          failSprite.spriteFrame = this.fireAcitveSpriteFrame;
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
        var fail1 = this.rightBox.children[1].getComponent(cc.Sprite);
        var fail2 = this.rightBox.children[2].getComponent(cc.Sprite);
        switch (this._trappedTime) {
         case 1:
          fail1.spriteFrame = this.fireAcitveSpriteFrame;
          setTimeout(function() {
            fail1.node.children[0].active = true;
          }, 200);
          break;

         case 2:
          fail2.spriteFrame = this.fireAcitveSpriteFrame;
          setTimeout(function() {
            fail2.node.children[0].active = true;
          }, 200);
          break;

         default:
          fail1.spriteFrame = this.fireNormalSpriteFrame;
          fail2.spriteFrame = this.fireNormalSpriteFrame;
          fail1.node.children[0].active = false;
          fail2.node.children[0].active = false;
        }
      };
      MinigameController5.prototype.showEndGame = function() {
        var _this = this;
        this.gameResult.active = true;
        this.gameResult.opacity = 0;
        this.gameResult.runAction(cc.sequence([ cc.fadeIn(.5), cc.callFunc(function() {
          _this.coinResultController.updateUserBalance(_this.score);
          Api_1.default.sendGD({
            e: "slotgetbonus",
            gtype: "sm2001"
          }, function(err, data) {
            cc.log(data);
          });
        }) ]));
      };
      MinigameController5.prototype.backToSlot = function() {
        var _this = this;
        this.node.runAction(cc.sequence([ cc.fadeOut(.5), cc.callFunc(function() {
          Concos_1.default.emit(Concos_1.Event.UPDATE_USER_BALANCE, window.GameController.userBalance, 0);
          _this.node.destroy();
        }) ]));
      };
      MinigameController5.prototype.update = function(dt) {
        this.coinController._updateUserBalance(dt);
        this.coinResultController._updateUserBalance(dt);
      };
      __decorate([ property(cc.Node) ], MinigameController5.prototype, "itemsContainer", void 0);
      __decorate([ property(cc.Label) ], MinigameController5.prototype, "scoreLabel", void 0);
      __decorate([ property(cc.Node) ], MinigameController5.prototype, "rightBox", void 0);
      __decorate([ property(cc.Label) ], MinigameController5.prototype, "coinResultLabel", void 0);
      MinigameController5 = __decorate([ ccclass ], MinigameController5);
      return MinigameController5;
    }(cc.Component);
    exports.default = MinigameController5;
    cc._RF.pop();
  }, {
    "../../../../scripts/Api": "Api",
    "../../../../scripts/Components/CoinLabel": "CoinLabel",
    "../../../../scripts/Concos": "Concos",
    "../../../../scripts/lib/Util": "Util",
    "./ResourceMiniGame5": "ResourceMiniGame5"
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
        _this.content = null;
        _this.sceneButton = null;
        _this._expandBtn = null;
        _this._listView = null;
        _this.isShow = false;
        return _this;
      }
      MultiScene.prototype.onLoad = function() {
        this.initialize();
      };
      MultiScene.prototype.initialize = function() {
        window.MultiScene = this;
        this._expandBtn = this.node.getChildByName("ExpandBtn");
        this._listView = this.node.getChildByName("ListView");
        this._expandBtn.on("mousedown", this.toggleButton.bind(this));
      };
      MultiScene.prototype.loadContent = function() {
        var _this = this;
        var scenesManager = window.GameScene.ScenesManager;
        this.content.removeAllChildren();
        this.listScene = [];
        scenesManager.forEach(function(item) {
          var button = cc.instantiate(_this.sceneButton);
          button.parent = _this.content;
          button.active = true;
          var scene = {
            uuid: item.uuid,
            id: item.id,
            button: button
          };
          _this.listScene.push(scene);
        });
        this.addEventButton();
      };
      MultiScene.prototype.toggleButton = function() {
        this.node.runAction(cc.moveBy(.3, cc.v2(this._listView.width * (this.isShow ? 1 : -1), 0)));
        this.isShow = !this.isShow;
      };
      MultiScene.prototype.addEventButton = function() {
        this.listScene.forEach(function(item) {
          item.button.on("click", function() {
            window.GameScene.currentSlot ? window.GameScene.currentSlot.uuid != item.uuid ? window.GameScene.switchSlot(item.uuid, item.id) : cc.log("You currently on this game") : window.GameScene.resumeSlot(item.uuid, item.id);
          });
        });
      };
      __decorate([ property(cc.Node) ], MultiScene.prototype, "content", void 0);
      __decorate([ property(cc.Node) ], MultiScene.prototype, "sceneButton", void 0);
      MultiScene = __decorate([ ccclass ], MultiScene);
      return MultiScene;
    }(cc.Component);
    exports.default = MultiScene;
    cc._RF.pop();
  }, {} ],
  NotiDialog: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d5674CFpuJPRrIlw3pTQgf1", "NotiDialog");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {},
      closeDialog: function closeDialog() {}
    });
    cc._RF.pop();
  }, {} ],
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
        _this.list = {
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
            coinBar: "img/item/coin-egypt-ingame",
            wildBorder: "img/item/wild-border"
          }
        };
        _this.resPathTotal = "4_gameScene/1_Slot1/img";
        _this.listResImage = [];
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
  ResourceController5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0cc3c7p7CpEm43DoqhIpGsS", "ResourceController5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResController5 = function(_super) {
      __extends(ResController5, _super);
      function ResController5() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.list = {
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
          itemBorder: {
            b: "img/item/bg-bonus-gem",
            s: "img/item/bg-scatter-gem",
            w: "img/item/bg-wild-gem"
          }
        };
        _this.resPathTotal = "4_gameScene/5_Slot5/img";
        return _this;
      }
      ResController5.prototype.getListItemBorder = function() {
        var _this = this;
        var listBorderName = Object.keys(this.list.itemBorder);
        return listBorderName.reduce(function(res, i) {
          return res.concat([ {
            id: i,
            img: _this.listResImage.find(function(x) {
              return x.name == _this.list.itemBorder[i].split("/").pop();
            })
          } ]);
        }, []);
      };
      ResController5 = __decorate([ ccclass ], ResController5);
      return ResController5;
    }(ResourceController_1.default);
    exports.default = ResController5;
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
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceController = function(_super) {
      __extends(ResourceController, _super);
      function ResourceController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.list = {
          item: {}
        };
        _this.listResImage = [];
        return _this;
      }
      ResourceController.prototype.loadRes = function(name) {
        return this.listResImage.find(function(x) {
          return x.name == name;
        });
      };
      ResourceController.prototype.loadAllRes = function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
          cc.loader.loadResDir(_this.resPathTotal, cc.SpriteFrame, function(err, res) {
            if (err) return reject(err);
            _this.listResImage = res;
            resolve(res);
          });
        });
      };
      ResourceController.prototype.getBgTable = function() {
        return this.loadRes("bg-ingame-egypt");
      };
      ResourceController.prototype.getlistImgItem = function() {
        var _this = this;
        var listItemName = Object.keys(this.list.item);
        return listItemName.reduce(function(res, cur) {
          return res.concat([ {
            id: cur,
            img: _this.listResImage.find(function(x) {
              return x.name == _this.list.item[cur].split("/").pop();
            })
          } ]);
        }, []);
      };
      ResourceController = __decorate([ ccclass ], ResourceController);
      return ResourceController;
    }(cc.Component);
    exports.default = ResourceController;
    cc._RF.pop();
  }, {} ],
  ResourceGold4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9bd38FHqIpMha0qDrfsmhow", "ResourceGold4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ResourceGold4 = function(_super) {
      __extends(ResourceGold4, _super);
      function ResourceGold4() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.list = {
          item: {
            4: "img/itemGold/item-casino-7",
            3: "img/itemGold/item-casino-8-gold",
            2: "img/itemGold/item-casino-9-gold",
            1: "img/itemGold/item-casino-10-gold",
            0: "img/itemGold/item-casino-11-gold"
          }
        };
        _this.resPathTotal = "4_gameScene/4_Slot4/img/itemGold";
        return _this;
      }
      ResourceGold4 = __decorate([ ccclass ], ResourceGold4);
      return ResourceGold4;
    }(ResourceController_1.default);
    exports.default = ResourceGold4;
    cc._RF.pop();
  }, {
    "../../../../scripts/Slots/ResourceController": "ResourceController"
  } ],
  ResourceMingigame1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4c76aTINXRMko6EeEm7vSjK", "ResourceMingigame1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.label = null;
        _this.text = "hello";
        return _this;
      }
      NewClass.prototype.start = function() {};
      __decorate([ property(cc.Label) ], NewClass.prototype, "label", void 0);
      __decorate([ property ], NewClass.prototype, "text", void 0);
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ],
  ResourceMiniGame5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "db42duYvd5AmaX9huAw3pKj", "ResourceMiniGame5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceMinigame5 = function() {
      function ResourceMinigame5() {
        this.resPathTotal = "4_gameScene/5_Slot5/minigame";
        this.listResImage = [];
        this.listResourceName = {
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
      }
      ResourceMinigame5.prototype.loadRes = function(name) {
        return this.listResImage.find(function(item) {
          return item.name == name;
        });
      };
      ResourceMinigame5.prototype.loadAllRes = function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
          cc.loader.loadResDir(_this.resPathTotal, cc.SpriteFrame, function(err, res) {
            if (err) return reject(err);
            _this.listResImage = res;
            resolve(res);
          });
        });
      };
      return ResourceMinigame5;
    }();
    exports.default = ResourceMinigame5;
    cc._RF.pop();
  }, {} ],
  Slot4Ctr: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7a7534/6fZKq6oRk2EwSkCp", "Slot4Ctr");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Slot4ResCtr_1 = require("./Slot4ResCtr");
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var GameConfig_1 = require("../../../scripts/GameConfig");
    var Api_1 = require("../../../scripts/Api");
    var Util_1 = require("../../../scripts/lib/Util");
    var AtributeStatic_1 = require("./AtributeStatic");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Slot4Ctr = function(_super) {
      __extends(Slot4Ctr, _super);
      function Slot4Ctr() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.resourceController = new Slot4ResCtr_1.default();
        _this._listItemSelectData = [];
        _this._listItemSelectImg = [];
        _this._betValue = 0;
        _this.betLevels = [];
        _this.idEventBet = "";
        _this.goldCtr = null;
        _this.betPrefab = null;
        _this.centerNode = null;
        _this.btnHelp = null;
        _this.goldNode = null;
        return _this;
      }
      Slot4Ctr.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _super.prototype.startSlot.call(this);
              window.SlotCtl4 = this;
              this.goldCtr = this.goldNode.getComponent("GoldCtrl4");
              window.GameController.showModel();
              return [ 4, this.playBetController() ];

             case 1:
              _a.sent();
              window.GameController.hideModel();
              return [ 2 ];
            }
          });
        });
      };
      Slot4Ctr.prototype.playBetController = function() {
        return __awaiter(this, void 0, void 0, function() {
          var betNode, betsController;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              window.GameController.showModel();
              betNode = cc.instantiate(this.betPrefab);
              betsController = betNode.getComponent("BetsController4");
              betNode.parent = this.centerNode;
              betNode.zIndex = 10;
              return [ 4, betsController.startBet(this.betArray, this.betLevels) ];

             case 1:
              _a.sent();
              betNode.runAction(cc.fadeIn(.5));
              window.GameController.hideModel();
              return [ 2 ];
            }
          });
        });
      };
      Slot4Ctr.prototype.importData = function() {
        this.betArray = this.dataStatus.betArr;
        this.betLevels = this.dataStatus.betLevels;
        this.currentBet = 1e3;
        window.GameScene._bottomBarController.updateInfo();
      };
      Slot4Ctr.prototype.timeManager = function() {
        return __awaiter(this, void 0, void 0, function() {
          var dataSpin;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this.isReFresh) {
                this.animationController.refreshSlotAnimation();
                this.isReFresh = true;
              }
              this.animationController.spinItems(this._listItem);
              if (this.freeSpin > 0) {
                this.freeSpin--;
                this._topBarController.updateFreeSpin(this.freeSpin);
                this._topBarController.showFreeSpin();
              } else this._topBarController.hideFreeSpin();
              return [ 4, Util_1.default.delay(3e3) ];

             case 1:
              _a.sent();
              if (!this.isReceivedData) return [ 3, 16 ];
              dataSpin = this.dataSpin;
              this.animationController.setAnimationData(dataSpin);
              if (!(dataSpin.score.sum[1].c > 0)) return [ 3, 3 ];
              this.animationController.showWinAmount();
              return [ 4, this.animationController.showAllLines() ];

             case 2:
              _a.sent();
              return [ 3, 5 ];

             case 3:
              window.GameScene._bottomBarController.resetWinAmount();
              return [ 4, Util_1.default.delay(500) ];

             case 4:
              _a.sent();
              _a.label = 5;

             case 5:
              if (!(dataSpin.freeSpin.c > 0)) return [ 3, 8 ];
              dataSpin.score.sum[3].c > 0 && cc.log("You get " + dataSpin.score.sum[3].c + " free spins");
              this._topBarController.updateFreeSpin(dataSpin.freeSpin.c);
              if (!!this._topBarController._isShowFreeSpin) return [ 3, 7 ];
              this._topBarController.showFreeSpin();
              this.freeSpin = dataSpin.freeSpin.c;
              return [ 4, Util_1.default.delay(200) ];

             case 6:
              _a.sent();
              _a.label = 7;

             case 7:
              return [ 3, 9 ];

             case 8:
              this._topBarController._isShowFreeSpin && this._topBarController.hideFreeSpin();
              _a.label = 9;

             case 9:
              this.isSpin = false;
              this.isReFresh = false;
              if (!this.isAutoSpin) return [ 3, 11 ];
              this.autoSpinTimes--;
              if (!(this.autoSpinTimes >= 0)) return [ 3, 11 ];
              return [ 4, Util_1.default.delay(300) ];

             case 10:
              _a.sent();
              this.autoSpin(this.autoSpinTimes);
              _a.label = 11;

             case 11:
              if (!(this.dataSpin.score.sum[1].c > 0)) return [ 3, 15 ];
              _a.label = 12;

             case 12:
              if (!!this.isSpin) return [ 3, 15 ];
              return [ 4, this.animationController.showEachLine() ];

             case 13:
              _a.sent();
              return [ 4, this.animationController.showAllLines() ];

             case 14:
              _a.sent();
              return [ 3, 12 ];

             case 15:
              return [ 3, 16 ];

             case 16:
              return [ 2 ];
            }
          });
        });
      };
      Slot4Ctr.prototype.getStatusGame = function(smid) {
        var _this = this;
        return new Promise(function(res, rej) {
          Api_1.default.sendGD({
            e: GameConfig_1.default.EVENT.SMINFO,
            gtype: smid || _this.gameId
          }, function(err, data) {
            err && rej(err);
            cc.log(data);
            _this.dataStatus = data;
            res(data);
          });
        });
      };
      Slot4Ctr.prototype.loadBorderRes = function() {
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
      Slot4Ctr.prototype.eventChangeView = function() {
        window.GameController.hideModel();
        var betNode = cc.instantiate(this.betPrefab);
        betNode.parent = this.centerNode;
        var betsController = betNode.getComponent("BetsController4");
        betsController.startBet(this.betArray, this.betLevels);
        betNode.runAction(cc.fadeIn(.5));
      };
      Slot4Ctr.prototype.updateActiveGold = function(bet) {
        var atri = new AtributeStatic_1.default();
        bet >= this.betLevels[4] ? atri.setIdBetSelect("4") : bet >= this.betLevels[3] ? atri.setIdBetSelect("3") : bet >= this.betLevels[2] ? atri.setIdBetSelect("2") : bet >= this.betLevels[1] ? atri.setIdBetSelect("1") : atri.setIdBetSelect("0");
        this.goldCtr.updateActiveGold(AtributeStatic_1.default.idBetSelect);
      };
      Slot4Ctr.prototype.getCurrentBet = function(idBet) {
        var bet = this.betLevels[idBet];
        this.updateCurrentBet(bet);
        window.GameScene._bottomBarController.updateInfo();
      };
      Slot4Ctr.prototype.updateCurrentBet = function(bet) {
        this.currentBet = bet;
        this.updateActiveGold(bet);
      };
      __decorate([ property(cc.Prefab) ], Slot4Ctr.prototype, "betPrefab", void 0);
      __decorate([ property(cc.Node) ], Slot4Ctr.prototype, "centerNode", void 0);
      __decorate([ property(cc.Button) ], Slot4Ctr.prototype, "btnHelp", void 0);
      __decorate([ property(cc.Node) ], Slot4Ctr.prototype, "goldNode", void 0);
      Slot4Ctr = __decorate([ ccclass ], Slot4Ctr);
      return Slot4Ctr;
    }(SlotController_1.default);
    exports.default = Slot4Ctr;
    cc._RF.pop();
  }, {
    "../../../scripts/Api": "Api",
    "../../../scripts/GameConfig": "GameConfig",
    "../../../scripts/Slots/SlotController": "SlotController",
    "../../../scripts/lib/Util": "Util",
    "./AtributeStatic": "AtributeStatic",
    "./Slot4ResCtr": "Slot4ResCtr"
  } ],
  Slot4ResCtr: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c35c9qovltLIZDUmx3E5FtT", "Slot4ResCtr");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourceController_1 = require("../../../scripts/Slots/ResourceController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Slot4ResCtr = function(_super) {
      __extends(Slot4ResCtr, _super);
      function Slot4ResCtr() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.list = {
          item: {
            s: "img/item/item-casino-scatter",
            w: "img/item/item-casino-wild",
            0: "img/item/item-casino-1",
            1: "img/item/item-casino-2",
            2: "img/item/item-casino-3",
            3: "img/item/item-casino-4",
            4: "img/item/item-casino-5",
            5: "img/item/item-casino-6",
            11: "img/itemGold/item-casino-7",
            12: "img/item/item-casino-8",
            13: "img/item/item-casino-9",
            14: "img/item/item-casino-10",
            15: "img/item/item-casino-11",
            22: "img/itemGold/item-casino-8-gold",
            23: "img/itemGold/item-casino-9-gold",
            24: "img/itemGold/item-casino-10-gold",
            25: "img/itemGold/item-casino-11-gold"
          },
          img: [ "img/bg-game-slot" ],
          itemBorder: {
            12: "img/border/bg-item-casino-8",
            13: "img/border/bg-item-casino-9",
            14: "img/border/bg-item-casino-10",
            15: "img/border/bg-item-casino-11",
            22: "img/border/bg-item-casino-8",
            23: "img/border/bg-item-casino-9",
            24: "img/border/bg-item-casino-10",
            25: "img/border/bg-item-casino-11",
            w: "img/border/bg-item-casino-wild",
            s: "img/border/bg-item-casino-scatter"
          }
        };
        _this.resPathTotal = "4_gameScene/4_Slot4/img";
        return _this;
      }
      Slot4ResCtr.prototype.getListItemBorder = function() {
        var _this = this;
        var listBorderName = Object.keys(this.list.itemBorder);
        listBorderName = listBorderName.reduce(function(res, i) {
          return res.concat([ {
            id: i,
            img: _this.listResImage.find(function(x) {
              return x.name == _this.list.itemBorder[i].split("/").pop();
            })
          } ]);
        }, []);
        return listBorderName;
      };
      Slot4ResCtr = __decorate([ ccclass ], Slot4ResCtr);
      return Slot4ResCtr;
    }(ResourceController_1.default);
    exports.default = Slot4ResCtr;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/ResourceController": "ResourceController"
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
        _this.coinBonusLerp = 5;
        _this.originalCoin = null;
        _this.stickyWildContainer = null;
        _this.miniGame = null;
        _this.resourceController = new ResourceController1_1.default();
        _this.coinBonus = 0;
        _this.coinBonusController = null;
        _this.stickyList = [];
        return _this;
      }
      SlotController1.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.coinBonusController = new CoinLabel_1.default(this.coinBonusLabel, this.coinBonusLerp, "$");
              _super.prototype.startSlot.call(this);
              if (!this.dataStatus.bonus) return [ 3, 2 ];
              if (!this.dataStatus.bonus.w) return [ 3, 2 ];
              window.GameController.showModel();
              cc.log("start load bonus");
              return [ 4, this.playBonus(this.dataStatus.bonus) ];

             case 1:
              _a.sent();
              window.GameController.hideModel();
              _a.label = 2;

             case 2:
              setTimeout(function() {
                _this.accumilatedBar.updateProgress(_this.dataStatus.collect.c / _this.dataStatus.collect.tc);
                _this.coinBonus = _this.dataStatus.collect.w;
                _this.coinBonusController.updateUserBalance(_this.coinBonus);
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
      SlotController1.prototype.getAnimationController = function() {
        this.animationController = this.node.getComponent("AnimationController");
      };
      SlotController1.prototype.handleCollectCoin = function(dataSpin) {
        var _this = this;
        return new Promise(function(res, rej) {
          var listItem = _this._listItem.slice(1);
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
              coin.getComponent(cc.Sprite).spriteFrame = _this.resourceController.loadRes(_this.resourceController.list.subItem.coin.split("/").pop());
              front.getComponent(cc.Sprite).spriteFrame = _this.resourceController.loadRes(_this.resourceController.list.item.c.split("/").pop());
              item.mainItem.getComponent(cc.Sprite).spriteFrame = _this.resourceController.loadRes(_this.resourceController.list.subItem.coinGray.split("/").pop());
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
              _this.accumilatedBar.updateProgress(dataSpin.collect.c / dataSpin.collect.tc);
              _this.coinBonusController.updateUserBalance(dataSpin.collect.w);
              _this.coinBonusController.coinLabel.node.runAction(cc.sequence(cc.scaleTo(.2, 1.2), cc.scaleTo(.2, 1)));
              res();
            }, 2e3);
          } else setTimeout(function() {
            return res();
          }, 100);
        });
      };
      SlotController1.prototype.handleFreeSpin = function(dataSpin) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            dataSpin.freeSpin.c > 0 ? this.accumilatedBar.node.opacity && this.accumilatedBar.node.runAction(cc.fadeOut(.3)) : 0 === this.accumilatedBar.node.opacity && this.accumilatedBar.node.runAction(cc.fadeIn(.3));
            _super.prototype.handleFreeSpin.call(this, dataSpin);
            this.handleStickyWild(dataSpin.mat);
            0 == dataSpin.freeSpin.c && this.destroyStickyWild();
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
        var listItem = this._listItem.slice(1);
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
          mainNode.getComponent(cc.Sprite).spriteFrame = _this.resourceController.loadRes(_this.resourceController.list.subItem.wildBorder.split("/").pop());
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
      SlotController1.prototype.destroyStickyWild = function() {
        this.stickyList.forEach(function(item) {
          item.node.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
            item.node.destroy();
          })));
        });
        this.stickyList = [];
      };
      SlotController1.prototype.handleBonus = function(dataSpin) {
        this.playBonus(dataSpin.score.sum[2]);
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
              miniGameNode.opacity = 0;
              miniGameNode.parent = canvas;
              return [ 4, miniGameController.startMiniGame(mul, mulArr, w) ];

             case 1:
              _b.sent();
              miniGameNode.runAction(cc.fadeIn(.5));
              return [ 2 ];
            }
          });
        });
      };
      SlotController1.prototype.update = function(dt) {
        this.coinBonusController && this.coinBonusController._updateUserBalance(dt);
      };
      __decorate([ property(AccumulatedBar1_1.default) ], SlotController1.prototype, "accumilatedBar", void 0);
      __decorate([ property(cc.Label) ], SlotController1.prototype, "coinBonusLabel", void 0);
      __decorate([ property(cc.Integer) ], SlotController1.prototype, "coinBonusLerp", void 0);
      __decorate([ property(cc.Node) ], SlotController1.prototype, "originalCoin", void 0);
      __decorate([ property(cc.Node) ], SlotController1.prototype, "stickyWildContainer", void 0);
      __decorate([ property(cc.Prefab) ], SlotController1.prototype, "miniGame", void 0);
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
  SlotController5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "eaf93LzNJxMZpSfPcUbAmxZ", "SlotController5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController_1 = require("../../../scripts/Slots/SlotController");
    var ResourceController5_1 = require("./ResourceController5");
    var Util_1 = require("../../../scripts/lib/Util");
    var SlotController5 = function(_super) {
      __extends(SlotController5, _super);
      function SlotController5() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.miniGamePrefab = null;
        _this.resourceController = new ResourceController5_1.default();
        return _this;
      }
      SlotController5.prototype.startSlot = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              _super.prototype.startSlot.call(this);
              if (!this.dataStatus.bonus) return [ 3, 3 ];
              if (!this.dataStatus.bonus.arr) return [ 3, 3 ];
              window.GameController.showModel();
              return [ 4, Util_1.default.delay(500) ];

             case 1:
              _a.sent();
              cc.log("start load bonus");
              return [ 4, this.playBonus(this.dataStatus.bonus.arr, this.dataStatus.lastBet) ];

             case 2:
              _a.sent();
              window.GameController.hideModel();
              _a.label = 3;

             case 3:
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
              miniGameNode.opacity = 0;
              miniGameNode.parent = canvas;
              return [ 4, miniGameController.startMiniGame(bonusArr, lastBet) ];

             case 1:
              _a.sent();
              miniGameNode.runAction(cc.fadeIn(.5));
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
              window.GameController.showModel();
              return [ 4, this.playBonus(dataSpin.score.sum[2].arr, dataSpin.totalbet) ];

             case 1:
              _a.sent();
              window.GameController.hideModel();
              return [ 2 ];
            }
          });
        });
      };
      __decorate([ property(cc.Prefab) ], SlotController5.prototype, "miniGamePrefab", void 0);
      SlotController5 = __decorate([ ccclass ], SlotController5);
      return SlotController5;
    }(SlotController_1.default);
    exports.default = SlotController5;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotController": "SlotController",
    "../../../scripts/lib/Util": "Util",
    "./ResourceController5": "ResourceController5"
  } ],
  SlotController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8694fkUlCRAJJzy6KdYvvZS", "SlotController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Item_1 = require("./Item");
    var Util_1 = require("../lib/Util");
    var Api_1 = require("../Api");
    var GameConfig_1 = require("../GameConfig");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotController = function(_super) {
      __extends(SlotController, _super);
      function SlotController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.gameId = "";
        _this.gameSizeType = 1;
        _this.tableView = null;
        _this.itemSlot = null;
        _this._listItemData = [];
        _this._listBorderImg = [];
        _this._listItem = [];
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
        _this._topBarController = null;
        _this._bottomBarController = null;
        return _this;
      }
      SlotController.prototype.getData = function() {
        var _this = this;
        return new Promise(function(res, rej) {
          return __awaiter(_this, void 0, void 0, function() {
            var e_1;
            return __generator(this, function(_a) {
              switch (_a.label) {
               case 0:
                _a.trys.push([ 0, 2, , 3 ]);
                return [ 4, Promise.all([ this.resourceController.loadAllRes(), this.getStatusGame() ]) ];

               case 1:
                _a.sent();
                this.importData();
                this.loadItemRes();
                this.loadBorderRes();
                res();
                return [ 3, 3 ];

               case 2:
                e_1 = _a.sent();
                rej(e_1);
                return [ 3, 3 ];

               case 3:
                return [ 2 ];
              }
            });
          });
        });
      };
      SlotController.prototype.startSlot = function() {
        this.initState();
        this.initializeItem();
        this.sortListItem();
        this.getAnimationController();
        this.checkFreeSpin();
      };
      SlotController.prototype.getStatusGame = function(smid) {
        var _this = this;
        return new Promise(function(res, rej) {
          Api_1.default.sendGD({
            e: GameConfig_1.default.EVENT.SMINFO,
            gtype: smid || _this.gameId
          }, function(err, data) {
            err && rej(err);
            cc.log(data);
            _this.dataStatus = data;
            res(data);
          });
        });
      };
      SlotController.prototype.importData = function() {
        this.betArray = this.dataStatus.betArr;
        this.currentBet = this.dataStatus.lastBet;
        window.GameScene._bottomBarController.updateInfo();
      };
      SlotController.prototype.getAnimationController = function() {
        this.animationController = this.node.getComponent("AnimationController");
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
        this._topBarController = window.GameScene._topBarController;
        this._bottomBarController = window.GameScene._bottomBarController;
      };
      SlotController.prototype.initializeItem = function() {
        this.gameSize = GameConfig_1.default.GAME_SIZE[this.gameSizeType];
        this.maxCol = this.gameSize.length;
        this.maxRow = Math.max.apply(Math, this.gameSize);
        for (var x = 0; x < this.gameSize.length; x++) for (var y = 0; y < this.gameSize[x] + 1; y++) {
          var item = this.getRandomItem();
          this.instantiateSlotsItem(item, x, y);
        }
      };
      SlotController.prototype.getRandomItem = function() {
        return this._listItemData[Math.floor(Math.random() * this._listItemData.length)];
      };
      SlotController.prototype.instantiateSlotsItem = function(itemInfo, x, y) {
        var self = this;
        this.distanceItemX = self.tableView.width / self.maxCol;
        this.distanceItemY = self.tableView.height / self.maxRow;
        var item = cc.instantiate(self.itemSlot);
        item.parent = self.tableView;
        item.setPosition((x + .5) * this.distanceItemX, (y + .5) * this.distanceItemY);
        var component = item.getComponent("SlotsItem");
        component.setItemInfo(itemInfo, x, y);
        component.slotsController = self;
        if (this.dataStatus.lastmat) {
          component.setMatrixEnd(this.dataStatus.lastmat.split(","));
          component.setItemSprite(null, true);
        }
        item.active = true;
        this._listItem.push(component);
      };
      SlotController.prototype.checkFreeSpin = function() {
        if (this.dataStatus.freeSpin.c > 0) {
          this.freeSpin = this.dataStatus.freeSpin.c;
          this._topBarController.updateFreeSpin(this.freeSpin);
          this._topBarController.showFreeSpin();
        }
      };
      SlotController.prototype.watchEvent = function(data) {
        switch (data.type) {
         case GameConfig_1.default.EVENT.SLOT_SPIN:
          this.dataSpin = data;
          this.isReceivedData = true;
          this._listItem.forEach(function(item) {
            item.forEach(function(item) {
              item.getComponent("SlotsItem").setMatrixEnd(data.mat.split(","));
            });
          });
          this.isSpin || this.spin(data);
          this.lastWin = data.score.reward;
        }
      };
      SlotController.prototype.timeManager = function() {
        return __awaiter(this, void 0, void 0, function() {
          var dataSpin;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              if (!this.isReFresh) {
                this.animationController.refreshSlotAnimation();
                window.GameScene._bottomBarController.resetWinAmount();
                this.isReFresh = true;
              }
              this.animationController.spinItems(this._listItem);
              if (this.freeSpin > 0) {
                this.freeSpin--;
                this._topBarController.updateFreeSpin(this.freeSpin);
                this._topBarController.showFreeSpin();
              } else this._topBarController.hideFreeSpin();
              return [ 4, Util_1.default.delay(3e3) ];

             case 1:
              _a.sent();
              if (!this.isReceivedData) return [ 3, 15 ];
              dataSpin = this.dataSpin;
              return [ 4, this.handleCollectCoin(dataSpin) ];

             case 2:
              _a.sent();
              this.animationController.setAnimationData(dataSpin);
              if (!(dataSpin.score.sum[1].c > 0)) return [ 3, 4 ];
              this.animationController.showWinAmount();
              return [ 4, this.animationController.showAllLines() ];

             case 3:
              _a.sent();
              return [ 3, 5 ];

             case 4:
              window.GameScene._bottomBarController.resetWinAmount();
              _a.label = 5;

             case 5:
              if (!(dataSpin.score.sum[2].w > 0)) return [ 3, 7 ];
              return [ 4, Util_1.default.delay(500) ];

             case 6:
              _a.sent();
              cc.log("You get a bonus");
              this.isSpin = false;
              this.isReFresh = false;
              this.handleBonus(dataSpin);
              return [ 2 ];

             case 7:
              return [ 4, this.handleFreeSpin(dataSpin) ];

             case 8:
              _a.sent();
              this.isSpin = false;
              this.isReFresh = false;
              if (!this.isAutoSpin) return [ 3, 10 ];
              this.autoSpinTimes--;
              if (!(this.autoSpinTimes >= 0)) return [ 3, 10 ];
              return [ 4, Util_1.default.delay(200) ];

             case 9:
              _a.sent();
              this.autoSpin(this.autoSpinTimes);
              _a.label = 10;

             case 10:
              if (!(this.dataSpin.score.sum[1].c > 0)) return [ 3, 14 ];
              _a.label = 11;

             case 11:
              if (!(!this.isSpin && !this.isAutoSpin)) return [ 3, 14 ];
              return [ 4, this.animationController.showEachLine() ];

             case 12:
              _a.sent();
              return [ 4, this.animationController.showAllLines(1) ];

             case 13:
              _a.sent();
              return [ 3, 11 ];

             case 14:
              return [ 3, 15 ];

             case 15:
              return [ 2 ];
            }
          });
        });
      };
      SlotController.prototype.autoSpin = function(times) {
        this.autoSpinTimes = times;
        if (this.isSpin) return;
        if (this.autoSpinTimes <= 0) {
          this.isAutoSpin = false;
          return;
        }
        cc.log(this.autoSpinTimes);
        this.isAutoSpin = true;
        this.spin();
      };
      SlotController.prototype.clickSpin = function() {
        window.GameScene._bottomBarController.autoBet.active && window.GameScene._bottomBarController.hideAutoBet();
        if (this.isAutoSpin) {
          this.isAutoSpin = false;
          this.autoSpinTimes = 0;
          return;
        }
        if (!this.isAutoSpin && this.isSpin) return;
        this.spin();
      };
      SlotController.prototype.spin = function(data) {
        if (this.currentBet > window.GameController.userBalance) {
          this.autoSpinTimes = 0;
          cc.log("User do not have enough coin to spin ...");
          return;
        }
        this.isSpin = true;
        this.isReceivedData = !!data;
        data || Api_1.default.sendGD({
          e: GameConfig_1.default.EVENT.SLOT_SPIN,
          gtype: this.gameId,
          totalbet: this.currentBet
        }, function(err, res) {
          cc.log("callback", res);
        });
        this.timeManager();
      };
      SlotController.prototype.sortListItem = function() {
        var sortedList = [ [] ];
        var a = 3;
        var b = 4;
        if (2 == this.gameSizeType) {
          a = 4;
          b = 4;
        }
        if (3 == this.gameSizeType) {
          a = 4;
          b = 5;
        }
        this._listItem.forEach(function(item, i) {
          var index = a - i % b;
          sortedList[index] || (sortedList[index] = []);
          sortedList[index].push(item);
        });
        this._listItem = sortedList;
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
            switch (_a.label) {
             case 0:
              if (!(dataSpin.freeSpin.c > 0)) return [ 3, 3 ];
              this._topBarController.updateFreeSpin(dataSpin.freeSpin.c);
              if (!!this._topBarController._isShowFreeSpin) return [ 3, 2 ];
              this._topBarController.showFreeSpin();
              this.freeSpin = dataSpin.freeSpin.c;
              return [ 4, Util_1.default.delay(200) ];

             case 1:
              _a.sent();
              _a.label = 2;

             case 2:
              return [ 3, 4 ];

             case 3:
              this._topBarController._isShowFreeSpin && this._topBarController.hideFreeSpin();
              _a.label = 4;

             case 4:
              return [ 2 ];
            }
          });
        });
      };
      SlotController.prototype.handleBonus = function(data) {};
      SlotController.prototype.handleCollectCoin = function(dataSpin) {};
      __decorate([ property(cc.String) ], SlotController.prototype, "gameId", void 0);
      __decorate([ property(cc.Integer) ], SlotController.prototype, "gameSizeType", void 0);
      __decorate([ property(cc.Node) ], SlotController.prototype, "tableView", void 0);
      __decorate([ property(cc.Node) ], SlotController.prototype, "itemSlot", void 0);
      SlotController = __decorate([ ccclass ], SlotController);
      return SlotController;
    }(cc.Component);
    exports.default = SlotController;
    cc._RF.pop();
  }, {
    "../Api": "Api",
    "../GameConfig": "GameConfig",
    "../lib/Util": "Util",
    "./Item": "Item"
  } ],
  SlotItem1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2f3e7JQJ5lPJav3AfWf9gNI", "SlotItem1");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SlotsItem_1 = require("../../../scripts/Slots/SlotsItem");
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
        var coinLabel = this.node.children[2].getComponent(cc.Label);
        if ("c" == this.id) {
          this.node.children[2].active = true;
          this.mainItemSprite.spriteFrame = this.slotsController.resourceController.loadRes("egypt-coin-3");
        } else this.node.children[2].active = false;
        if (this.slotsController.dataSpin) {
          "c" == this.id && (this.mainItemSprite.spriteFrame = this.slotsController.resourceController.loadRes("egypt-coin-2"));
          coinLabel.string = "$" + this.slotsController.dataSpin.totalbet / 100;
        } else coinLabel.string = "$" + this.slotsController.dataStatus.lastBet / 100;
      };
      __decorate([ property({
        override: true
      }) ], SlotItem1.prototype, "slotsController", void 0);
      SlotItem1 = __decorate([ ccclass ], SlotItem1);
      return SlotItem1;
    }(SlotsItem_1.default);
    exports.default = SlotItem1;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotsItem": "SlotsItem"
  } ],
  SlotItem5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c69b03tvv9KQZLdNmcJcwHr", "SlotItem5");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotsItem_1 = require("../../../scripts/Slots/SlotsItem");
    var SlotsItem5 = function(_super) {
      __extends(SlotsItem5, _super);
      function SlotsItem5() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      SlotsItem5 = __decorate([ ccclass ], SlotsItem5);
      return SlotsItem5;
    }(SlotsItem_1.default);
    exports.default = SlotsItem5;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotsItem": "SlotsItem"
  } ],
  SlotsDownloadCtr: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47cb4qOft9Ak7C8Ceh0Sa9R", "SlotsDownloadCtr");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotsDownloadCtr = function(_super) {
      __extends(SlotsDownloadCtr, _super);
      function SlotsDownloadCtr() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      SlotsDownloadCtr.prototype.loadSrc = function() {
        cc.log("test");
      };
      SlotsDownloadCtr.prototype.getUrls = function(id) {
        var resPath = "4_gameScene/" + id + "_Slot" + id;
        cc.loader.loadResDir(resPath, function(err, resCtr, urls) {});
      };
      SlotsDownloadCtr = __decorate([ ccclass ], SlotsDownloadCtr);
      return SlotsDownloadCtr;
    }(cc.Component);
    exports.default = SlotsDownloadCtr;
    cc._RF.pop();
  }, {} ],
  SlotsItem4: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a73fbloCxtHDIET+yNuHXbr", "SlotsItem4");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SlotsItem_1 = require("../../../scripts/Slots/SlotsItem");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotsItem4 = function(_super) {
      __extends(SlotsItem4, _super);
      function SlotsItem4() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      SlotsItem4.prototype.onload = function() {
        _super.prototype.onLoad.call(this);
      };
      SlotsItem4.prototype.checkSpecialItem = function(itemId) {
        if ("s" == itemId || "w" == itemId || "12" == itemId || "13" == itemId || "14" == itemId || "15" == itemId || "22" == itemId || "23" == itemId || "24" == itemId || "25" == itemId) return true;
        return false;
      };
      SlotsItem4 = __decorate([ ccclass ], SlotsItem4);
      return SlotsItem4;
    }(SlotsItem_1.default);
    exports.default = SlotsItem4;
    cc._RF.pop();
  }, {
    "../../../scripts/Slots/SlotsItem": "SlotsItem"
  } ],
  SlotsItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "916798ID0tG3qx1bYPHCH7v", "SlotsItem");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SlotController_1 = require("./SlotController");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var SlotsItem = function(_super) {
      __extends(SlotsItem, _super);
      function SlotsItem() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.mainItemSprite = null;
        _this.slotsController = null;
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
      SlotsItem.prototype.onLoad = function() {
        this.isMove = false;
        this.time = 0;
        this.duration = 0;
        this.y0 = this.node.y;
        this.distance = 0;
        this.maxY = (this.slotsController.maxRow + .5) * this.slotsController.distanceItemY;
        this.minY = -.5 * this.slotsController.distanceItemY;
        this.initZoomAnimation();
      };
      SlotsItem.prototype.setItemInfo = function(item, x, y) {
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
      SlotsItem.prototype.setItemSprite = function(item, first) {
        var _this = this;
        if (item) {
          item = this.slotsController.getRandomItem();
          this.mainItemSprite.spriteFrame = item.spritesFrame;
        } else {
          item = this.slotsController.getRandomItem();
          if (null != this.arrResult && this.y <= this.slotsController.maxRow - 1) {
            var index_1 = this.slotsController.maxCol * (this.slotsController.maxRow - this.y - 1) + this.x;
            item = this.slotsController._listItemData.find(function(x) {
              return x.id == _this.arrResult[index_1];
            });
            this.id = item.id;
            this.mainItemSprite.spriteFrame = item.spritesFrame;
          }
        }
        if (this.slotsController._listBorderImg.length > 0) if (this.checkSpecialItem(item.id)) {
          var borderImg = this.slotsController._listBorderImg.find(function(x) {
            return x.id === item.id;
          });
          this.border.active = true;
          this.border.getComponent(cc.Sprite).spriteFrame = borderImg.img;
        } else this.border.active = false;
      };
      SlotsItem.prototype.checkSpecialItem = function(itemId) {
        if ("b" == itemId || "s" == itemId || "w" == itemId) return true;
        return false;
      };
      SlotsItem.prototype.move = function() {
        var _this = this;
        var self = this;
        this.node.runAction(cc.sequence(cc.moveTo(.3, cc.v2(this.node.x, (this.y + .6) * this.slotsController.distanceItemY)), cc.callFunc(function() {
          _this.isMove = true;
          _this.time = 0;
          _this.y0 = self.node.y;
          _this.count = 0;
        })));
      };
      SlotsItem.prototype.setMatrixEnd = function(data) {
        this.arrResult = data;
      };
      SlotsItem.prototype.stop = function() {
        this.endingMove = true;
      };
      SlotsItem.prototype.scaleAnim = function(time) {
        var self = this;
        var action = cc.scaleTo(.5, 1.2);
        this.node.runAction(action);
        setTimeout(function() {
          var action = cc.scaleTo(.5, 1);
          null != self.node && self.node.runAction(action);
        }, 500);
      };
      SlotsItem.prototype.initZoomAnimation = function() {
        this.mainItem = this.node.children[1] || this.node;
        this.mainItem.addComponent(cc.Animation);
        this.zoomAnimation = this.mainItem.getComponent(cc.Animation);
        this.zoomAni.speed = 1.1;
        this.zoomAnimation.addClip(this.zoomAni);
      };
      SlotsItem.prototype.playZoomAnimation = function() {
        this.zoomAnimation.play("ZoomItem");
      };
      SlotsItem.prototype.stopZoomAnimation = function() {
        this.zoomAnimation.setCurrentTime(0);
        this.zoomAnimation.stop("ZoomItem");
      };
      SlotsItem.prototype.update = function(dt) {
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
            var item = this.slotsController.getRandomItem();
            this.setItemSprite(item);
            var maxCount = this.maxCount;
            if (this.count >= maxCount) {
              this.endingMove = true;
              this.setItemSprite(null);
              this.reallyStop = true;
            }
          }
          if (this.reallyStop && this.node.y <= (this.y + .3) * this.slotsController.distanceItemY) {
            this.node.y = (this.y + .3) * this.slotsController.distanceItemY;
            this.endingMove = false;
            this.isMove = false;
            this.node.runAction(cc.moveTo(.2, cc.v2(this.node.x, (this.y + .5) * this.slotsController.distanceItemY)).easing(cc.easeBackOut()));
            this.reallyStop = false;
          }
        }
      };
      __decorate([ property(cc.Sprite) ], SlotsItem.prototype, "mainItemSprite", void 0);
      __decorate([ property(SlotController_1.default) ], SlotsItem.prototype, "slotsController", void 0);
      __decorate([ property(cc.Node) ], SlotsItem.prototype, "border", void 0);
      __decorate([ property(cc.AnimationClip) ], SlotsItem.prototype, "zoomAni", void 0);
      __decorate([ property ], SlotsItem.prototype, "a", void 0);
      __decorate([ property ], SlotsItem.prototype, "c", void 0);
      __decorate([ property ], SlotsItem.prototype, "maxCount", void 0);
      SlotsItem = __decorate([ ccclass ], SlotsItem);
      return SlotsItem;
    }(cc.Component);
    exports.default = SlotsItem;
    cc._RF.pop();
  }, {
    "./SlotController": "SlotController"
  } ],
  Socket: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9e325AnWpBFIpYAbyYs+aqr", "Socket");
    cc._RF.pop();
  }, {} ],
  Start: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b84degjEwlMgb9Fb6T4/ijg", "Start");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Start = function(_super) {
      __extends(Start, _super);
      function Start() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      Start.prototype.start = function() {
        setTimeout(function() {}, 100);
      };
      Start = __decorate([ ccclass ], Start);
      return Start;
    }(cc.Component);
    exports.default = Start;
    cc._RF.pop();
  }, {} ],
  TopBarController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "45740NJ8+xLiYAmUQFFrNMf", "TopBarController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Util_1 = require("../lib/Util");
    var CoinLabel_1 = require("../Components/CoinLabel");
    var Concos_1 = require("../Concos");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var TopBarController = function(_super) {
      __extends(TopBarController, _super);
      function TopBarController() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.coinLabel = null;
        _this.userLevel = null;
        _this.userName = null;
        _this.userClan = null;
        _this.freeSpinNode = null;
        _this._isShowFreeSpin = false;
        _this.freeSpinLabel = null;
        _this.coinController = null;
        _this._eventList = [];
        _this._isShow = false;
        _this.container = null;
        return _this;
      }
      TopBarController.prototype.onLoad = function() {
        this.initialize();
        this.registerEvent();
      };
      TopBarController.prototype.initialize = function() {
        this.coinController = new CoinLabel_1.default(this.coinLabel);
        this.coinLabel.string = Util_1.default.formatMoney(window.GameController.userBalance);
        this.freeSpinLabel = this.freeSpinNode.getComponentInChildren(cc.Label);
        this.container = this.node.getChildByName("container");
      };
      TopBarController.prototype.toggleBar = function(time) {
        void 0 === time && (time = .5);
        this.container.runAction(cc.moveBy(time, cc.v2(0, this.container.height * (this._isShow ? 1 : -1))).easing(cc.easeSineOut()));
        this.container.runAction(this._isShow ? cc.fadeOut(time) : cc.fadeIn(time));
        this._isShow = !this._isShow;
      };
      TopBarController.prototype.registerEvent = function() {
        this._eventList = [ Concos_1.default.register(Concos_1.Event.UPDATE_USER_BALANCE, this.updateUserBalance.bind(this)) ];
      };
      TopBarController.prototype.updateUserBalance = function(amount, delayTime) {
        void 0 === delayTime && (delayTime = 3e3);
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, Util_1.default.delay(delayTime) ];

             case 1:
              _a.sent();
              this.coinController.updateUserBalance(amount);
              return [ 2 ];
            }
          });
        });
      };
      TopBarController.prototype.onDestroy = function() {
        this._eventList.forEach(function(token) {
          return Concos_1.default.unRegister(token);
        });
      };
      TopBarController.prototype.updateFreeSpin = function(times) {
        this.freeSpinLabel.string = "FREE SPINS: " + times;
      };
      TopBarController.prototype.showFreeSpin = function(time) {
        void 0 === time && (time = .3);
        if (this._isShowFreeSpin) return;
        this._isShowFreeSpin = true;
        this.freeSpinNode.active = true;
        this.freeSpinNode.runAction(cc.moveBy(time, cc.v2(0, -50)));
      };
      TopBarController.prototype.hideFreeSpin = function(time) {
        var _this = this;
        void 0 === time && (time = .3);
        if (!this._isShowFreeSpin) return;
        this._isShowFreeSpin = false;
        this.freeSpinNode.runAction(cc.sequence(cc.moveBy(time, cc.v2(0, 50)), cc.callFunc(function() {
          _this.freeSpinNode.active = false;
        })));
      };
      TopBarController.prototype.update = function(dt) {
        this.coinController._updateUserBalance(dt);
      };
      __decorate([ property(cc.Label) ], TopBarController.prototype, "coinLabel", void 0);
      __decorate([ property(cc.Label) ], TopBarController.prototype, "userLevel", void 0);
      __decorate([ property(cc.Label) ], TopBarController.prototype, "userName", void 0);
      __decorate([ property(cc.Label) ], TopBarController.prototype, "userClan", void 0);
      __decorate([ property(cc.Node) ], TopBarController.prototype, "freeSpinNode", void 0);
      TopBarController = __decorate([ ccclass ], TopBarController);
      return TopBarController;
    }(cc.Component);
    exports.default = TopBarController;
    cc._RF.pop();
  }, {
    "../Components/CoinLabel": "CoinLabel",
    "../Concos": "Concos",
    "../lib/Util": "Util"
  } ],
  UserInfoController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0983ea9pZtEF4fD8mosgb6y", "UserInfoController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var CoinLabel_1 = require("../Components/CoinLabel");
    var Concos_1 = require("../Concos");
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
        this._eventList = [ Concos_1.default.register(Concos_1.Event.UPDATE_USER_BALANCE, this.updateUserBalance.bind(this)) ];
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
          return Concos_1.default.unRegister(item);
        });
      };
      UserInfoController.prototype.update = function(dt) {
        this.coinController._updateUserBalance(dt);
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
    "../Components/CoinLabel": "CoinLabel",
    "../Concos": "Concos"
  } ],
  Util: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f627cIfo7VP64PEhfSD+uOL", "Util");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Util = function() {
      function Util() {}
      Util.generateUUID = function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          var r = 16 * Math.random() | 0, v = "x" == c ? r : 3 & r | 8;
          return v.toString(16);
        });
      };
      Util.loadRes = function(path, type) {
        void 0 === type && (type = null);
        return new Promise(function(res, rej) {
          cc.loader.loadRes(path, type, function(err, data) {
            if (err) return rej(err);
            res(data);
          });
        });
      };
      Util.formatMoney = function(n, c) {
        void 0 === c && (c = ",");
        return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, c);
      };
      Util.showNode = function(node, zIndex) {
        node.opacity = 255;
        node.zIndex = zIndex || 0;
      };
      Util.hideNode = function(node) {
        node.opacity = 0;
        node.zIndex = -1;
      };
      Util.delay = function(time) {
        return new Promise(function(res) {
          return setTimeout(res, time);
        });
      };
      return Util;
    }();
    exports.default = Util;
    cc._RF.pop();
  }, {} ],
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
}, {}, [ "AccumulatedBar1", "AnimationController1", "MinigameController1", "ResourceMingigame1", "ResourceController1", "SlotController1", "SlotItem1", "AnimationController4", "AtributeStatic", "Slot4Ctr", "Slot4ResCtr", "SlotsItem4", "GoldCtrl4", "GoldItems4", "ResourceGold4", "BetResource", "BetsController4", "BetsItem4", "AnimationController5", "MinigameController5", "ResourceMiniGame5", "ResourceController5", "SlotController5", "SlotItem5", "Socket", "Api", "CoinLabel", "Concos", "DialogController", "NotiDialog", "DownloadCtr", "GameConfig", "GameController", "BottomBarController", "GameScene", "TopBarController", "HomeScene", "ItemGame", "UserInfoController", "MultiScene", "AutoFitCanvas", "FitWidthIphoneX", "ImageScaleResolution", "LocalScaleResolution", "AnimationController", "ApiDataType", "Item", "LinesController", "ResourceController", "SlotController", "SlotsDownloadCtr", "SlotsItem", "Start", "Util", "auth" ]);