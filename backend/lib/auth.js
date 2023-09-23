const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('./passport');

function generateJWT(user_id, email) {
    const payload = { user_id, email };
    const token = jwt.sign(payload, process.env.JWT_AUTH_OPTIONS__SECRET_OR_KEY, {
        expiresIn: process.env.JWT_AUTH_OPTIONS__EXPIRY,
        issuer: process.env.JWT_AUTH_OPTIONS__ISSUER,
        audience: process.env.JWT_AUTH_OPTIONS__AUDIENCE,
    });
    return token;
}

function generatePasswordHash(password) {
    const hash = bcrypt.hash(password, process.env.AUTH_SALT_ROUNDS);
    return hash;
}

async function comparePassword(password, password_hash) {
    return bcrypt.compare(password, password_hash);
}

function authenticate(req, res, next) {
    return passport.authenticate('jwt', { session: false })(req, res, next);
}

module.exports = {
    authenticate,
    generateJWT,
    generatePasswordHash,
    comparePassword,
};
