// Update with your config settings.
require('dotenv').config();

module.exports = {
    master: {
        client: process.env.DATABASE_CLIENT || 'pg',
        connection: process.env.DB__CONNECTIONS__MASTER__DATABASE_URL || {
            user: process.env.DB__CONNECTIONS__MASTER__USERNAME,
            password: process.env.DB__CONNECTIONS__MASTER__PASSWORD,
            host: process.env.DB__CONNECTIONS__MASTER__HOST,
            port: process.env.DB__CONNECTIONS__MASTER__PORT,
            database: process.env.DB__CONNECTIONS__MASTER__DATABASE || 'thullo',
        },
        searchPath: 'thullo',
    },
    slave: {
        client: process.env.DATABASE_CLIENT || 'pg',
        connection: process.env.DB__CONNECTIONS__SLAVE__DATABASE_URL || {
            user: process.env.DB__CONNECTIONS__SLAVE__USERNAME,
            password: process.env.DB__CONNECTIONS__SLAVE__PASSWORD,
            host: process.env.DB__CONNECTIONS__SLAVE__HOST,
            port: process.env.DB__CONNECTIONS__SLAVE__PORT,
            database: process.env.DB__CONNECTIONS__SLAVE__DATABASE || 'thullo',
        },
        searchPath: 'thullo',
    },
};
