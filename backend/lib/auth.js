const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('./passport');

function generateJWT(data, type, expiresIn) {
    const payload = { ...data, type };
    const token = jwt.sign(payload, process.env.JWT_AUTH_OPTIONS__SECRET_OR_KEY, {
        expiresIn: expiresIn || process.env.JWT_AUTH_OPTIONS__EXPIRY,
        issuer: process.env.JWT_AUTH_OPTIONS__ISSUER,
        audience: process.env.JWT_AUTH_OPTIONS__AUDIENCE,
    });
    return token;
}

function generatePasswordHash(password) {
    const hash = bcrypt.hash(password, Number(process.env.AUTH_SALT_ROUNDS));
    return hash;
}

async function comparePassword(password, password_hash) {
    return bcrypt.compare(password, password_hash);
}

function authenticate(req, res, next) {
    return passport.authenticate('jwt', { session: false })(req, res, next);
}

function validateToken(token) {
    return jwt.verify(token, process.env.JWT_AUTH_OPTIONS__SECRET_OR_KEY);
}

module.exports = {
    authenticate,
    generateJWT,
    generatePasswordHash,
    comparePassword,
    validateToken,
};
