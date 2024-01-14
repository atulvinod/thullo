const knex = require('knex');
const stack_trace = require('stack-trace');
const util = require('util');

const canonical_log_util = require('@util/canonicalLoggingUtility');

const database_configs = {
    db: {
        master: {
            host: process.env.DB__CONNECTIONS__MASTER__HOST,
            port: process.env.DB__CONNECTIONS__MASTER__PORT,
            password: process.env.DB__CONNECTIONS__MASTER__PASSWORD,
            database: process.env.DB__CONNECTIONS__MASTER__DATABASE,
            username: process.env.DB__CONNECTIONS__MASTER__USERNAME,
            maxConnections: process.env.DB__CONNECTIONS__MASTER__MAX_CONNECTIONS,
        },
        slave: {
            host: process.env.DB__CONNECTIONS__SLAVE__HOST,
            port: process.env.DB__CONNECTIONS__SLAVE__PORT,
            password: process.env.DB__CONNECTIONS__SLAVE__PASSWORD,
            database: process.env.DB__CONNECTIONS__SLAVE__DATABASE,
            username: process.env.DB__CONNECTIONS__SLAVE__USERNAME,
            maxConnections: process.env.DB__CONNECTIONS__SLAVE__MAX_CONNECTIONS,
        },
    },
};

/**
 * @param {string} client
 * @param {Object} dsn_config
 * @returns {knex.Knex}
 */
function configureDsn(client, dsn_config) {
    return knex({
        client,
        connection: {
            host: dsn_config.host,
            port: dsn_config.port,
            user: dsn_config.username,
            password: dsn_config.password,
            database: dsn_config.database,
        },
        debug: false,
        pool: {
            min: dsn_config.minConnections ? Number(dsn_config.minConnections) : 2,
            max: dsn_config.macConnections ? Number(dsn_config.maxConnections) : 10,
        },
    });
}

class BaseDB {
    #dsn;

    /** @type {knex.Knex} */
    #master_db;

    /** @type {knex.Knex} */
    #slave_db;

    /** @type {knex.Knex} */
    #raw_builder;

    /**
     * @param {string} dsn
     * @param {string} client - Knex SQL Adaptor Client
     */
    constructor(dsn, client) {
        this.#dsn = dsn;

        const dsn_details = database_configs[dsn];
        if (!dsn_details) throw new Error(`DSN details not found in config for: ${dsn}`);
        this.#raw_builder = knex({ client });
        this.#master_db = configureDsn(client, dsn_details.master);
        this.#slave_db = configureDsn(client, dsn_details.slave);
    }

    /**
     * @param {Logger} logger
     */
    master(logger) {
        return this.#getQueryBuilder(this.#master_db, logger);
    }

    /**
     * @param {Logger} logger
     */
    slave(logger) {
        return this.#getQueryBuilder(this.#slave_db, logger);
    }

    /**
     * @param {knex.Knex} db
     * @param {Logger} logger
     */
    #getQueryBuilder(db, logger) {
        if (!logger) throw new Error('Missing argument logger');
        const builder = db.queryBuilder();
        const log_options = { trace: stack_trace.get()[2], context: 'QUERY' };
        let started_at;
        builder.on('query', (query) => {
            started_at = new Date();
            canonical_log_util.incrementQueryCounter(logger, query.method);
        });
        builder.on('query-error', (error) => {
            started_at = undefined;
            logger.error(error, log_options);
        });
        builder.on('query-response', (_response, query) => {
            const time_taken = new Date() - started_at;
            started_at = undefined;
            const raw_query = this.#buildSQLQuery(query.sql, query.bindings);
            if (query.method !== 'select' || process.env.DB__SETTINGS__ENABLE_SELECT_QUERY_LOGS) {
                logger.info(`${raw_query} | tt: ${time_taken}ms`, log_options);
            }
        });
        return builder;
    }

    #buildSQLQuery(sql, bindings) {
        const final_sql = process.env.DATABASE_CLIENT === 'pg' ? bindings.reduce((agg, value, index) => {
            agg = agg.replace(`$${index + 1}`, value);
            return agg;
        }, sql) : this.raw(sql, bindings).toString();
        return final_sql || sql;
    }

    /**
     * @param {string} sql
     * @param  {...knex.Knex.RawBinding} bindings
     */
    raw(sql, ...bindings) {
        return this.#raw_builder.raw(sql, ...bindings);
    }

    /**
     * @param {Logger} logger
     */
    async validateConnection(logger) {
        let dsn_in_test;
        try {
            dsn_in_test = 'master';
            await this.master(logger).select(this.raw(1 + 1)).timeout(10000);
            dsn_in_test = 'slave';
            await this.slave(logger).select(this.raw(1 + 1)).timeout(10000);
        } catch (error) {
            return {
                isConnected: false,
                connectionError: `DB connection error [${this.#dsn}-${dsn_in_test}]: ${util.inspect(error)}`,
            };
        }
        return { isConnected: true, connectionError: null };
    }
}

module.exports = BaseDB;
