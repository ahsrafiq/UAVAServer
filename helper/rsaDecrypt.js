const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const privateKey = fs.readFileSync(path.join(__dirname, '../keys/private.key'), 'utf8');

function decryptData(encryptedData) {
  try {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(encryptedData, 'base64')
    );

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw new Error('Invalid encryption data');
  }
}

module.exports = decryptData;