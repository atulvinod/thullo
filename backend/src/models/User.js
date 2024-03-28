const RequestError = require('@errors/RequestError');
const bcrypt = require('bcrypt');
const auth = require('@lib/auth');
const http_status_codes = require('http-status-codes');
const { uploadFile } = require('@lib/file_storage');
const { VALID_FOLDERS } = require('@lib/constants');
const { getUuid } = require('@util/commonUtility');
const { Resend } = require('resend');
const Base = require('./Base');

const resend = new Resend(process.env.RESEND_API_KEY);

const table_name = 'users';

class User extends Base {
    constructor(logger) {
        super(logger);
        this.logger = logger;
    }

    #find(email) {
        return this.getSlaveDatabase()
            .table(table_name)
            .where('email', email.toLowerCase())
            .select(['id', 'name', 'image_url', 'password', 'email']);
    }

    async findOneByEmail(email) {
        return this.#find(email).first();
    }

    async findManyByEmail(email) {
        return this.#find(email);
    }

    async findManyByName(name) {
        return this.getSlaveDatabase()
            .table(table_name)
            .whereRaw(`LOWER(name) LIKE '%${name.toLowerCase()}%'`)
            .select(['id', 'name', 'image_url', 'email']);
    }

    async #create(name, email, password, image_url) {
        const existing_user = await this.findOneByEmail(email);
        if (existing_user) {
            throw new RequestError('User already exists with this email', 400);
        }
        const password_hash = await bcrypt.hash(
            password,
            Number(process.env.AUTH_SALT_ROUNDS),
        );
        const id = await this.insertToDb(table_name, {
            name,
            email,
            password: password_hash,
            image_url,
        });
        return id;
    }

    async authenticateUser(email, password) {
        const user = await this.findOneByEmail(email);
        if (user) {
            const is_password_match = await auth.comparePassword(
                password,
                user.password,
            );
            if (!is_password_match) {
                throw new RequestError(
                    'Invalid password',
                    http_status_codes.StatusCodes.FORBIDDEN,
                );
            }
            const token = auth.generateJWT({ id: user.id, email: user.email }, 'login');
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
        throw new RequestError(
            "User does'nt exist with this email",
            http_status_codes.StatusCodes.NOT_FOUND,
        );
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
        const token = auth.generateJWT({ user_id, email }, 'login');
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

    async sendForgotPasswordEmail(email, token) {
        const { data, error } = await resend.emails.send({
            from: 'Thullo <onboarding@resend.dev>',
            to: [email.toLowerCase().trim()],
            subject: 'Reset password',
            html: `
                <div>
                    <h1> Hello! </h1>
                    <span> Click on this link to reset your password</span><br>
                    <a href="${process.env.APP_HOST}/#/change-password?token=${token}">Change your password</a>
                </div>
            `,
        });
        if (error) {
            console.error(error)
        }
    }

    async forgotPassword(email) {
        const account = await this.findOneByEmail(email);
        if (!account) {
            throw new RequestError(
                'No account found with this email',
                http_status_codes.StatusCodes.BAD_REQUEST,
            );
        }
        const token = auth.generateJWT(
            { email, uuid: getUuid() },
            'reset-password',
            '30m',
        );
        const id = await this.insertToDb('forgot_password_tokens', {
            user_id: account.id,
            token,
        });
        await this.sendForgotPasswordEmail(email, token);
        return id;
    }

    async #getTokenFromDB(token, user_id) {
        const exists = await this.getSlaveDatabase()
            .table('forgot_password_tokens')
            .where({ token, is_used: false, user_id })
            .select(['id'])
            .first();
        return exists;
    }

    async changePassword(token, new_password) {
        try {
            const { email } = auth.validateToken(token);
            const account = await this.findOneByEmail(email);
            if (!account) {
                throw new RequestError(
                    'No email found with this address',
                    http_status_codes.StatusCodes.BAD_REQUEST,
                );
            }

            const db_token = await this.#getTokenFromDB(token, account.id);
            if (!db_token) {
                throw new RequestError(
                    'Invalid token',
                    http_status_codes.StatusCodes.BAD_REQUEST,
                );
            }

            const password_hash = await bcrypt.hash(
                new_password,
                Number(process.env.AUTH_SALT_ROUNDS),
            );
            await this.getMasterDatabase()
                .table('users')
                .update({ password: password_hash })
                .where({ id: account.id });

            await this.getMasterDatabase()
                .table('forgot_password_tokens')
                .update({ is_used: true })
                .where({ id: db_token.id });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

module.exports = User;
