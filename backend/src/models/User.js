const RequestError = require('@errors/RequestError');
const bcrypt = require('bcrypt');
const auth = require('@lib/auth');
const http_status_codes = require('http-status-codes');
const database = require('../../lib/database');
const { uploadFile } = require('@lib/file_storage');
const { VALID_FOLDERS } = require('@lib/constants');
const { getUuid } = require('@util/commonUtility');

const table_name = 'users';

class User {
    constructor(logger) {
        this.logger = logger;
    }

    #find(email) {
        return database.slave(this.logger)
            .table(table_name)
            .where('email', email)
            .select(['id', 'name', 'image_url', 'password', 'email']);
    }

    async findOneByEmail(email) {
        return this.#find(email).first();
    }

    async findManyByEmail(email) {
        return this.#find(email);
    }

    async findManyByName(name) {
        return database.slave(this.logger)
            .table(table_name)
            .whereRaw(`LOWER(name) LIKE '%${name.toLowerCase()}%'`)
            .select(['id', 'name', 'image_url', 'email']);
    }

    async #create(name, email, password, image_url) {
        const existing_user = await this.findOneByEmail(email);
        if (existing_user) {
            throw new RequestError('User already exists with this email', 400);
        }
        const password_hash = await bcrypt.hash(password, Number(process.env.AUTH_SALT_ROUNDS));
        const [id] = await database.master(this.logger)
            .table(table_name)
            .insert({
                name, email, password: password_hash, image_url,
            });
        return id;
    }

    async authenticateUser(email, password) {
        const user = await this.findOneByEmail(email);
        if (user) {
            const is_password_match = await auth.comparePassword(password, user.password);
            if (!is_password_match) {
                throw new RequestError('Invalid password', http_status_codes.StatusCodes.FORBIDDEN);
            }
            const token = auth.generateJWT(user.id, user.email);
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    image_url: user.image_url,
                    email: user.email,
                },
                token,
            };
        }
        throw new RequestError('User does\'nt exist with this email', http_status_codes.StatusCodes.NOT_FOUND);
    }

    async createUser(name, email, password, image) {
        if (!email || !password) {
            throw new RequestError('Missing required fields');
        }
        let image_upload_result = null;
        if (image) {
            image_upload_result = await uploadFile(
                VALID_FOLDERS.PROFILE_IMAGES,
                getUuid(),
                image,
            );
        }
        const user_id = await this.#create(
            name,
            email,
            password,
            image_upload_result?.download_url,
        );
        const token = auth.generateJWT(user_id, email);
        return {
            user: {
                id: user_id,
                name,
                email,
                image_url: image_upload_result?.download_url,
            },
            token,
        };
    }
}

module.exports = User;
