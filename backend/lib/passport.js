const passport = require('passport');
const logger = require('@lib/logger').getLogger();
const database = require('@lib/database');

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const opts = {
    secretOrKey: process.env.JWT_AUTH_OPTIONS__SECRET_OR_KEY,
    issuer: process.env.JWT_AUTH_OPTIONS__ISSUER,
    audience: process.env.JWT_AUTH_OPTIONS__AUDIENCE,
    expiry: process.env.JWT_AUTH_OPTIONS__EXPIRY,
};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

async function findUser(email) {
    return database.slave(logger)
        .table('users')
        .select(['id', 'name', 'email'])
        .where('email', email)
        .first();
}

passport.use(new JwtStrategy(opts, ((jwt_payload, done) => {
    findUser(jwt_payload.email).then((_user) => {
        if (_user) {
            return done(null, _user);
        }
        return done(new Error('User does not exist'), false);
    }).catch((err) => done(err, false));
})));

module.exports = passport;
