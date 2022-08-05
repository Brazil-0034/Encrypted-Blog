/**
 * This file is used to test a different encryption algorithm, one I never got to finishing.
 * I don't really remember how it was supposed to work.
 * It's just here for reference.
 */
// imports, essential
var seeded = require('seedrandom');
const encrypt = require('encrypt-with-password');

// user inputs passkey
let passKey = "password";

// seed the passkey so it is now a number
passKey = seeded(passKey);
passKey = passKey();
passKey *= 1000000000;
passKey = Math.floor(passKey);
passKey = passKey.toString().replace(/0/g, '1');

const test = "Here is some text!!!"

// encrypt the text
const encrypted = encrypt.encrypt(test, passKey);
const decrypted = encrypt.decrypt(encrypted, passKey);

console.log("Original: " + test);
console.log("Encrypted: " + encrypted);
console.log("Decrypted: " + decrypted);