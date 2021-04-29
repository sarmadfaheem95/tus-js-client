/**
 * readAsByteArray converts a File object to a Uint8Array.
 * This function is only used on the Apache Cordova platform.
 * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
 * 
 */

var CryptoJS = require('crypto-js');

export default function readAsByteArray(chunk,data) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var value = Buffer.from(reader.result);
      value = encryptData(value,data)
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

function encryptData(data,keys) {
  data = Buffer.from(data).toString('base64');
  var string = CryptoJS.enc.Base64.parse(data);
  var parsedBase64Key = CryptoJS.enc.Base64.parse(keys.key);
  var parsedBase64IV = CryptoJS.enc.Base64.parse(keys.iv);
  var encryptedData = CryptoJS.AES.encrypt(string, parsedBase64Key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding,
    iv: parsedBase64IV
  });
  let result = _base64ToArrayBuffer(encryptedData.toString())
  return result
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