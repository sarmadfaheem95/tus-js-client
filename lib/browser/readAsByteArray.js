/**
 * readAsByteArray converts a File object to a Uint8Array.
 * This function is only used on the Apache Cordova platform.
 * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
 * 
 */

var CryptoJS = require('crypto-js');


export default function readAsByteArray(chunk) {
  return new Promise(function (resolve, reject) {
    debugger
    var reader = new FileReader();

    reader.onload = function () {
      var value = new Uint8Array(reader.result);
      value = encryptData(value)
      resolve({
        value: value
      });
    };

    reader.onerror = function (err) {
      reject(err);
    };

    reader.readAsArrayBuffer(chunk);
  });
}


function encryptData(data) {
  // working for txt
  // let string = Utf8ArrayToStr(data)
  let string = bytesArrToBase64(data)
  // let string = arrayBufferToString(data)
  var encryptedBase64Key = "RE8wcS4wMnBATlpnVGIzMjFrVnhqMiwuNUMkLGRCWXo=";
  var iv = "MTIzNDU2Nzg5MDEyMzQ1Ng==";
  var parsedBase64Key = CryptoJS.enc.Base64.parse(encryptedBase64Key);
  var parsedBase64IV = CryptoJS.enc.Base64.parse(iv);
  var encryptedData = CryptoJS.AES.encrypt(string, parsedBase64Key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding,
    iv: parsedBase64IV
  });
  return _base64ToArrayBuffer(encryptedData.toString())
}

function bytesArrToBase64(arr) {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; // base64 alphabet
  const bin = n => n.toString(2).padStart(8,0); // convert num to 8-bit binary string
  const l = arr.length
  let result = '';

  for(let i=0; i<=(l-1)/3; i++) {
    let c1 = i*3+1>=l; // case when "=" is on end
    let c2 = i*3+2>=l; // case when "=" is on end
    let chunk = bin(arr[3*i]) + bin(c1? 0:arr[3*i+1]) + bin(c2? 0:arr[3*i+2]);
    let r = chunk.match(/.{1,6}/g).map((x,j)=> j==3&&c2 ? '=' :(j==2&&c1 ? '=':abc[+('0b'+x)]));  
    result += r.join('');
  }

  return result;
}

function  arrayBufferToString(exportedPrivateKey){
  var byteArray = new Uint8Array(exportedPrivateKey);
  var byteString = '';
  for(var i=0; i < byteArray.byteLength; i++) {
      byteString += String.fromCodePoint(byteArray[i]);
  }
  return byteString;
}

var utf8ToStr = (function () {
  var charCache = new Array(128);  // Preallocate the cache for the common single byte chars
  var charFromCodePt = String.fromCodePoint || String.fromCharCode;
  var result = [];

  return function (array) {
      var codePt, byte1;
      var buffLen = array.length;

      result.length = 0;

      for (var i = 0; i < buffLen;) {
          byte1 = array[i++];

          if (byte1 <= 0x7F) {
              codePt = byte1;
          } else if (byte1 <= 0xDF) {
              codePt = ((byte1 & 0x1F) << 6) | (array[i++] & 0x3F);
          } else if (byte1 <= 0xEF) {
              codePt = ((byte1 & 0x0F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F);
          } else if (String.fromCodePoint) {
              codePt = ((byte1 & 0x07) << 18) | ((array[i++] & 0x3F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F);
          } else {
              codePt = 63;    // Cannot convert four byte code points, so use "?" instead
              i += 3;
          }

          result.push(charCache[codePt] || (charCache[codePt] = charFromCodePt(codePt)));
      }

      return result.join('');
  };
})();

function base64ArrayBuffer(arrayBuffer) {
  var base64    = ''
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  var bytes         = new Uint8Array(arrayBuffer)
  var byteLength    = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength    = byteLength - byteRemainder

  var a, b, c, d
  var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }
  
  return base64
}

function _base64ToArrayBuffer(base64) {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}


function Utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while(i < len) {
  c = array[i++];
  switch(c >> 4)
  { 
    case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
      // 0xxxxxxx
      out += String.fromCharCode(c);
      break;
    case 12: case 13:
      // 110x xxxx   10xx xxxx
      char2 = array[i++];
      out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
      break;
    case 14:
      // 1110 xxxx  10xx xxxx  10xx xxxx
      char2 = array[i++];
      char3 = array[i++];
      out += String.fromCharCode(((c & 0x0F) << 12) |
                     ((char2 & 0x3F) << 6) |
                     ((char3 & 0x3F) << 0));
      break;
  }
  }

  return out;
}

// function arrayBufferToString(buffer){
//   var byteArray = new Uint8Array(buffer);
//   var str = "", cc = 0, numBytes = 0;
//   for(var i=0, len = byteArray.length; i<len; ++i){
//       var v = byteArray[i];
//       if(numBytes > 0){
//           //2 bit determining that this is a tailing byte + 6 bit of payload
//           if((cc&192) === 192){
//               //processing tailing-bytes
//               cc = (cc << 6) | (v & 63);
//           }else{
//               throw new Error("this is no tailing-byte");
//           }
//       }else if(v < 128){
//           //single-byte
//           numBytes = 1;
//           cc = v;
//       }else if(v < 192){
//           //these are tailing-bytes
//           throw new Error("invalid byte, this is a tailing-byte")
//       }else if(v < 224){
//           //3 bits of header + 5bits of payload
//           numBytes = 2;
//           cc = v & 31;
//       }else if(v < 240){
//           //4 bits of header + 4bit of payload
//           numBytes = 3;
//           cc = v & 15;
//       }else{
//           //UTF-8 theoretically supports up to 8 bytes containing up to 42bit of payload
//           //but JS can only handle 16bit.
//           throw new Error("invalid encoding, value out of range")
//       }
//       if(--numBytes === 0){
//           str += String.fromCharCode(cc);
//       }
//   }
//   if(numBytes){
//       throw new Error("the bytes don't sum up");
//   }
//   return str;
// }