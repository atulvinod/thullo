const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('./passport');

const config = require('../config/config');

function generateJWT(user_id, email) {
    const payload = { user_id, email };
    const token = jwt.sign(payload, config.jwtAuthOptions.secretOrKey, {
        expiresIn: config.jwtAuthOptions.expiry,
        issuer: config.jwtAuthOptions.issuer,
        audience: config.jwtAuthOptions.audience,
    });
    return token;
}

function generatePasswordHash(password) {
    const hash = bcrypt.hash(password, config.authSaltRounds);
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
