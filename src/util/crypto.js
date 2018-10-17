const Crypto = require("crypto");

const algo = "aes-256-cbc";
const iv = "b13aa1a51d5bfef6ff0e0142935e5353";

function encrypt(key, data) {
    if (key.length !== 32) {
        key = derive(key, '');
    }

    const cipher = Crypto.createCipheriv(algo, key, Buffer.from(iv, 'hex'));

    const encrypted = cipher.update(data);
    const finalBuffer = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("hex") + ':' + finalBuffer.toString("hex");
}

function decrypt(key, data) {
    if (key.length !== 32) {
        key = derive(key, '');
    }

    const encryptedArray = data.split(':');

    const iv = Buffer.from(encryptedArray[0], 'hex');
    const encrypted = Buffer.from(encryptedArray[1], 'hex');

    const decipher = Crypto.createDecipheriv(algo, key, iv);
    const decrypted = decipher.update(encrypted);

    return Buffer.concat([decrypted, decipher.final()]).toString();
}

function derive(key, ...ids) {
    let newKey = key;
    for (let i = 0; i < ids.length; i++) {
        newKey = Crypto.pbkdf2Sync(newKey, ids[i], 100000, 16, 'sha256').toString('hex');
    }

    return newKey;
}

module.exports = {
    encrypt,
    decrypt,
    derive,
};
