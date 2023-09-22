const crypto = require("crypto");


const AES_KEY_SIZES = [128, 192, 256];
const AES_MODES = ["ecb", "cbc"];
const RSA_ENCRYPTION_PADDING_TYPES = {
    "no": crypto.constants.RSA_NO_PADDING,
    "pkcs1": crypto.constants.RSA_PKCS1_PADDING,
    "pkcs1-oaep": crypto.constants.RSA_PKCS1_OAEP_PADDING
}

/**
 * Generates and returns hash using the specified `algorithm`
 * @param {string} algorithm - Supported algorithms depends on the version of OpenSSL on the system
 * Reference: https://nodejs.org/docs/latest-v14.x/api/crypto.html#crypto_crypto_createhash_algorithm_options
 * @param {crypto.BinaryLike} data 
 * @param {crypto.BinaryToTextEncoding} outputEncoding - defaults to `"hex"`
 * @param {crypto.HashOptions} options - defaults to `{}`
 */
function generateHash(algorithm, data, outputEncoding = "hex", options = {}) {
    return crypto.createHash(algorithm, options).update(data).digest(outputEncoding);
}

/**
 * Generates and returns HMAC using the specified `algorithm`
 * @param {string} algorithm - Supported algorithms depends on the version of OpenSSL on the system
 * Reference: https://nodejs.org/docs/latest-v14.x/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options
 * @param {crypto.BinaryLike | crypto.KeyObject} secret  
 * @param {crypto.BinaryLike} data 
 * @param {crypto.BinaryToTextEncoding} outputEncoding - defaults to `"hex"`
 */
function generateHmac(algorithm, secret, data, outputEncoding = "hex") {
    return crypto.createHmac(algorithm, secret).update(data).digest(outputEncoding);
}

/**
 * Encrypts `data` using AES algorithm with the specified key, mode and padding
 * @param {128|192|256} keySize 
 * @param {"ecb"|"cbc"} mode 
 * @param {string} key 
 * @param {string} keyEncoding 
 * @param {string} data 
 * @param {boolean} padding - defaults to `false`
 * @param {crypto.BinaryLike|null} iv - defaults to `null` (always `null` for `ecb` mode)
 * @param {"utf8"|"ascii"|"binary"} dataEncoding - defaults to `"utf8"`
 * @param {"binary"|"base64"|"hex"} outputEncoding - defaults to `"hex"` 
 */
function aesEncrypt(keySize, mode, key, keyEncoding, data, padding = false, iv = null, dataEncoding = "utf8", outputEncoding = "hex") {
    const algo = getAesEncryptionAlgorithm(keySize, mode);
    iv = algo.endsWith("ecb")? null: iv;
    const cipher = crypto.createCipheriv(algo, Buffer.from(key, keyEncoding), iv).setAutoPadding(padding);
    let response = cipher.update(data, dataEncoding, outputEncoding);
    response += cipher.final(outputEncoding);
    return response;
}

/**
 * Generate algorithm name for AES encryption/decryption
 * @param {128|192|256|null} keySize 
 * @param {"ecb"|"cbc"|null} encMode 
 * @returns {"aes-(128|192|256)-(ecb|cbc)"}
 */
 function getAesEncryptionAlgorithm(keySize, encMode) {
    let bits, mode;
    if (AES_KEY_SIZES.includes(keySize) && AES_MODES.includes(encMode)) {
        bits = keySize;
        mode = encMode;
    } else {
        throw new Error("Invalid keySize or mode specified for AES encryption/decryption");
    }
    return `aes-${bits}-${mode}`;
}

/**
 * Decrypts data with AES algorithm with the specified key, mode and padding
 * @param {128|192|256} keySize 
 * @param {"ecb"|"cbc"} mode 
 * @param {string} key 
 * @param {string} keyEncoding 
 * @param {string} data 
 * @param {boolean} padding - defaults to `false`
 * @param {crypto.BinaryLike|null} iv - defaults to `null` (always `null` for `ecb` mode)
 * @param {"binary"|"base64"|"hex"} dataEncoding - defaults to `"hex"`
 * @param {"utf8"|"ascii"|"binary"} outputEncoding - defaults to `"utf8"`
 */
function aesDecrypt(keySize, mode, key, keyEncoding, data, padding = false, iv = null, dataEncoding = "hex", outputEncoding = "utf8") {
    const algo = getAesEncryptionAlgorithm(keySize, mode);
    iv = algo.endsWith("ecb")? null: iv;
    const decipher = crypto.createDecipheriv(algo, Buffer.from(key, keyEncoding), iv).setAutoPadding(padding);
    let response = decipher.update(data, dataEncoding, outputEncoding);
    response += decipher.final(outputEncoding);
    return response;
}

/**
 * Encrypts data using RSA algorithm with the specified public (or private) key and padding
 * @param {crypto.KeyLike} key - PEM encoded public or private key (since public key can be derived from it)
 * @param {crypto.constants} paddingType
 * @param {string} data
 * @param {"utf8"|"base64"|"hex"|*} dataEncoding - defaults to `"utf8"`
 * @param {"base64"|"hex"|*} outputEncoding - defaults to `"base64"`
 * @returns 
 */
function rsaEncrypt(key, paddingType, data, dataEncoding = "utf8", outputEncoding = "base64") {
    const padding = getRsaEncryptionPadding(paddingType);
    return crypto.publicEncrypt({ key: key, padding: padding }, Buffer.from(data, dataEncoding)).toString(outputEncoding);
}

/**
 * Generate algorithm name for RSA encryption/decryption
 * @param {"no"|"pkcs1"|"pkcs1-oaep"} paddingType - defaults to `"pkcs1"` 
 * @returns {number}
 */
function getRsaEncryptionPadding(paddingType) {
    const padding = RSA_ENCRYPTION_PADDING_TYPES[paddingType] || RSA_ENCRYPTION_PADDING_TYPES["pkcs1"];
    return padding;
}

/**
 * Decrypts data using RSA algorithm with the specified private key and padding
 * @param {crypto.KeyLike} key - PEM encoded private key
 * @param {crypto.constants} paddingType
 * @param {string} data
 * @param {"utf8"|"base64"|"hex"|*} dataEncoding - defaults to `"base64"`
 * @param {"base64"|"hex"|*} outputEncoding - defaults to `"utf8"`
 * @returns 
 */
function rsaDecrypt(key, paddingType, data, dataEncoding = "base64", outputEncoding = "utf8") {
    const padding = getRsaEncryptionPadding(paddingType);
    return crypto.privateDecrypt({ key: key, padding: padding }, Buffer.from(data, dataEncoding)).toString(outputEncoding);
}

module.exports = {
    generateHash: generateHash,
    generateHmac: generateHmac,
    aesEncrypt: aesEncrypt,
    aesDecrypt: aesDecrypt,
    rsaEncrypt: rsaEncrypt,
    rsaDecrypt: rsaDecrypt
}