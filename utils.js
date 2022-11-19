const crypto = require('crypto');
const fs = require('fs');
const iv = crypto.randomBytes(16);
const algorithm = 'aes-256-ctr';
const process = require('process');
const secretKey = process.env.SECRET;
const PeerId = require('peer-id')

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
};

const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  return decrpyted.toString();
};

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function(err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

async function writeFile(path, data) {
  return new Promise((resolve, reject) => {

    fs.writeFile(path, data, function(err) {
      if (err) {
        reject(err)
      };
      console.log('File ' + path + ' produced.');
    })
  });
}

async function exportNewPrivateKey() {
  console.log('Creating peer-id')
  const peerId = await PeerId.create()
  console.log('Peer Id created:', peerId._idB58String)
  const privKey = peerId.toJSON().privKey
  const encryptedPrivKey = encrypt(privKey)
  await writeFile('encrypted_key', JSON.stringify(encryptedPrivKey))
  console.log('private key exported')
}

async function importPersistedKey() {
  const encryptedKey = await readFile('encrypted_key')
  const privKey = (decrypt(JSON.parse(encryptedKey)))
  console.log('private-key-imported')
  return privKey
}

module.exports = {
  encrypt,
  decrypt,
  readFile,
  writeFile,
  exportNewPrivateKey,
  importPersistedKey
};
