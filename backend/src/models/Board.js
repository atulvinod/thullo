const RequestError = require('@errors/RequestError');
const database = require('@lib/database');
const http_status = require('http-status-codes');
const file_storage = require('@lib/file_storage');
const constants = require('@lib/constants');
const commonUtility = require('@util/commonUtility');
const _ = require('lodash');

const BOARDS_TABLE = 'boards';
const USERS_TABLE = 'users';
const COLUMNS_TABLE = 'board_columns';
const BOARD_MEMBERS_TABLE = 'board_members';
const CARD_LABELS = 'card_labels';
const CARD_MEMBERS = 'card_members';
const CARD_ATTACHMENTS = 'card_attachments';
const CARD_COMMENTS = 'card_comments';
const CARD = 'card';

class Board {
    constructor(logger) {
        this.logger = logger;
    }

    /**
     * @param {Number} current_user_id,
     * @param {String?} search,
     * @returns {Promise<Array>}
     */
    async getBoards(current_user_id, search = null) {
        const select_clause = [
            'bt.id as board_id',
            'bt.board_title',
            'bt.cover_url',
            'u.id as created_by_user_id',
            'u.image_url as created_by_user_image_url',
            'u.name as created_by_user_name',
            'bmu.id as board_member_user_id',
            'bmu.image_url as board_member_image_url',
            'bmu.name as board_member_name',
        ];

        const base_query = database.slave(this.logger)
            .table(`${BOARDS_TABLE} as bt`)
            .leftJoin(`${USERS_TABLE} as u`, 'u.id', 'bt.created_by_user_id')
            .leftJoin(`${BOARD_MEMBERS_TABLE} as bm`, 'bm.board_id', 'bt.id')
            .leftJoin(`${USERS_TABLE} as bmu`, 'bm.user_id', 'bmu.id')
            .select(select_clause)
            .orderBy('bt.id', 'desc');

        if (search) {
            base_query.whereRaw(`LOWER(bt.board_title) LIKE %${search.toLowerCase()}%`);
        }

        const non_private_boards_query = base_query.clone()
            .where('bt.is_private', false);

        const current_user_private_boards_query = base_query.clone()
            .where('bt.is_private', true)
            .where('bt.created_by_user_id', current_user_id);

        const participating_private_boards_query = base_query.clone()
            .where('bt.is_private', true)
            .whereNot('bt.created_by_user_id', current_user_id)
            .whereRaw(`bt.id IN (SELECT board_id from board_members where user_id = ${current_user_id})`);

        const [non_private_boards, current_user_private_boards, participating_private_boards] = await Promise.all(
            [
                non_private_boards_query,
                current_user_private_boards_query,
                participating_private_boards_query
            ],
        );

        const board_member_fields = ['board_member_user_id', 'board_member_image_url', 'board_member_name'];

        const formatted_result = [
            ...non_private_boards,
            ...current_user_private_boards,
            ...participating_private_boards,
        ].reduce((agg, value) => {
            if (!agg[value.board_id]) {
                agg[value.board_id] = {
                    members: [],
                    ..._.omit(value, board_member_fields),
                };
            }
            if (value.board_member_user_id) {
                agg[value.board_id].members = _.uniqBy([...agg[value.board_id].members, _.pick(value, board_member_fields)], 'board_member_user_id');
            }
            return agg;
        }, {});

        return _.reverse(Object.values(formatted_result));
    }

    /**
     * @param {Number} created_by_user_id,
     * @param {{cover_url:String, board_title:String, is_private:Boolean}} board_data,
     * @returns {Promise<Number>}
     */
    async createBoard(created_by_user_id, board_data, cover_image) {
        const { board_title, is_private } = board_data;
        let cover_url = null;
        if (cover_image) {
            const { download_url } = await file_storage.uploadFile(
                constants.VALID_FOLDERS.BOARD_COVERS,
                commonUtility.getUuid(),
                cover_image,
            );
            cover_url = download_url;
        }

        const [id] = await database.master(this.logger)
            .table(BOARDS_TABLE)
            .insert({
                created_by_user_id,
                board_title,
                cover_url,
                is_private: JSON.parse(is_private),
            });
        await this.addMembersToBoard(id, [created_by_user_id]);
        return id;
    }

    /**
     * @param {{board_id:Number, column_title:String, column_order_index:Number}} column_data,
     * @returns {Promise<Number>}
     */
    async createColumn(board_id, column_data) {
        const { column_title, column_order_index = 1 } = column_data;
        if (!board_id || !column_title) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }
        const [id] = await database.master(this.logger)
            .table(COLUMNS_TABLE)
            .insert({
                board_id,
                column_title,
                column_order_index,
            });
        return id;
    }

    /**
     * @param {Number} board_id,
     * @param {Number} member_user_id,
     * @returns {Promise<Number>}
     */
    async addMembersToBoard(board_id, member_user_ids) {
        if (!board_id || !member_user_ids) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }
        for (const user_id of member_user_ids) {
            await database.master(this.logger).table(BOARD_MEMBERS_TABLE)
                .insert({
                    board_id,
                    user_id,
                });
        }
    }

    /**
     * @param {Number} card_id,
     * @param {String} label_color,
     * @param {String} label_name
     * @returns {Promise<Number>}
     */
    async addLabelToCard(card_id, label_color, label_name) {
        if (!card_id || !label_color || !label_name) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }
        const [id] = await database.master(this.logger)
            .table(CARD_LABELS)
            .insert({
                card_id,
                label_color,
                label_name,
            });
        return id;
    }

    async #getCardsForColumn(column_id) {
        const cards = [];
        const card_query = database.slave(this.logger)
            .table(CARD)
            .select([
                'id as card_id',
                'card_name',
                'cover_image_url',
            ]).where('column_id', column_id)
            .orderBy('column_order');

        const card_data = await card_query;

        for (const card of card_data) {
            const card_obj = {
                card_id: card.card_id,
                card_name: card.card_name,
                cover_image_url: card.cover_image_url,
                card_labels: [],
                card_members: [],
                card_attachments: [],
                card_comments: [],
            };
            const label_query = database.slave(this.logger)
                .table(CARD_LABELS)
                .where('card_id', card.card_id)
                .select([
                    'id',
                    'label_color',
                    'label_name',
                ]);
            const label_data = await label_query;
            const card_member_query = database.slave(this.logger)
                .table(`${CARD_MEMBERS} as cm`)
                .join(`${USERS_TABLE} as u`, 'u.id', 'cm.user_id')
                .select(
                    'u.id as member_id',
                    'u.image_url',
                    'u.name',
            )
                .where('cm.card_id', card.card_id);

            const card_attachments_query = database.slave(this.logger)
                .table(CARD_ATTACHMENTS)
                .where('card_id', card.card_id);

            const card_comments_query = database.slave(this.logger)
                .table(`${CARD_COMMENTS} as co`)
                .join(`${USERS_TABLE} as u`, 'u.id', 'co.user_id')
                .select([
                    'u.id as user_id',
                    'u.name as name',
                    'u.image_url',
                    'co.comment',
                    'co.created',
                    'co.id'
                ])
                .where('co.card_id', card.card_id);

            const card_member_data = await card_member_query;
            const card_attachments = await card_attachments_query;
            const card_comments = await card_comments_query;
            card_obj.card_attachments.push(...card_attachments);
            card_obj.card_labels.push(...label_data);
            card_obj.card_members.push(...card_member_data);
            card_obj.card_comments.push(...card_comments);
            cards.push(card_obj);
        }
        return cards;
    }

    async #getBoardColumns(board_columns) {
        const columns = [];
        for (const column of board_columns) {
            const column_obj = {
                column_id: column.column_id,
                column_name: column.column_title,
                column_order_index: column.column_order_index,
                cards: [],
            };

            const cards = await this.#getCardsForColumn(column.column_id);
            column_obj.cards.push(...cards);
            columns.push(column_obj);
        }
        return columns;
    }

    async getBoardDetails(board_id) {
        const board_data_query = database.slave(this.logger)
            .table(BOARDS_TABLE)
            .where('id', board_id)
            .select([
                'board_title',
                'id as board_id',
                'is_private as is_board_private',
                'created_by_user_id',
                'created as created_on',
                'description',
            ])
            .first();

        const board_columns_query = database.slave(this.logger)
            .table(COLUMNS_TABLE)
            .select([
                'id as column_id',
                'column_title',
                'column_order_index',
            ]).where('board_id', board_id);

        const board_members_query = database.slave(this.logger)
            .table(`${BOARD_MEMBERS_TABLE} as bm`)
            .join(`${USERS_TABLE} as u`, 'u.id', 'bm.user_id')
            .select([
                'u.id as board_member_id',
                'u.name as board_member_name',
                'u.image_url as board_member_image_url'
            ])
            .where('bm.board_id', board_id);


        const [board_data, board_columns, board_members] = await Promise.all(
            [
                board_data_query,
                board_columns_query,
                board_members_query
            ]
        );
        const result_obj = {
            board_title: board_data.board_title,
            board_id: board_data.board_id,
            is_board_private: board_data.is_board_private,
            created_by_user_id: board_data.created_by_user_id,
            created_on: board_data.created_on,
            description: board_data.description,
            columns: [],
            board_members,
        };
        const columns = await this.#getBoardColumns(board_columns);
        result_obj.columns.push(...columns);

        return result_obj;
    }

    /**
     * @param {Number} card_id,
     * @param {Number} member_id
     * @returns {Promise<Number>}
     */
    async addMembersToCard(card_id, member_ids) {
        if (!card_id || !member_ids) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }
        for (const member_id of member_ids) {
            await database.master(this.logger)
            .table(CARD_MEMBERS)
            .insert({
                card_id,
                user_id: member_id,
            });
        }
    }

    /**
     * 
     * @param {Number} card_id,
     * @param {Number} added_by_user_id,
     * @param {Number} attachment_file,
     * @returns {Promise<{id:Number, attachment_url:String}>}
     */
    async addAttachmentToCard(card_id, added_by_user_id, attachment_file) {
        const folder = constants.VALID_FOLDERS.ATTACHMENTS;
        const fileUUID = commonUtility.getUuid();
        const { download_url: attachment_url } = await file_storage.uploadFile(
            folder,
            fileUUID,
            attachment_file,
        );
        const [id] = await database.master(this.logger)
            .table(CARD_ATTACHMENTS)
            .insert({
                attachment_title: attachment_file.originalname,
                attachment_type: attachment_file.mimetype,
                attachment_url,
                card_id,
                user_id: added_by_user_id,
            });
        return { id, attachment_url };
    }

    /**
     * @param {Number} card_id,
     * @param {Number} user_id,
     * @param {String} comment,
     * @returns {Promise<Number>}
     */
    async addCommentToCard(card_id, user_id, comment) {
        if (!card_id || !user_id || !comment) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }
        const [id] = await database.master(this.logger)
            .table(CARD_COMMENTS)
            .insert(
                {
                    card_id,
                    user_id,
                    comment,
                },
            );
        return id;
    }

    async deleteCommentFromCard(comment_id) {
        await database.master(this.logger)
            .table(CARD_COMMENTS)
            .where({ id: comment_id })
            .del();
    }

    async updateCardComment(comment_id, comment) {
        await database.master(this.logger)
            .table(CARD_COMMENTS)
            .update({ comment })
            .where({ id: comment_id })
    }

    async #getMaxColumnOrder(column_id) {
        const { max_column_order } = await database.slave(this.logger)
            .table(CARD)
            .select(database.raw('max(column_order) as max_column_order'))
            .where({ column_id })
            .first();
        return max_column_order;
    }

    async createCard(created_by_user_id, card_data) {
        if (!created_by_user_id || !card_data) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }
        const { board_id, column_id, card_name } = card_data;
        const max_column_order = await this.#getMaxColumnOrder(column_id);
        const [id] = await database.master(this.logger)
            .table(CARD)
            .insert({
                board_id,
                column_id,
                card_name,
                column_order: (max_column_order + 1)
            })
        return id;
    }

    async updateColumnName(column_id, column_title) {
        if (!column_id) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }
        await database.master(this.logger)
            .table(COLUMNS_TABLE)
            .update({
                column_title
            }).where('id', column_id);
    }

    async #deleteCards(column_id) {
        await database.master(this.logger)
            .table(CARD)
            .where({ column_id })
            .del();
    }

    async #deleteColumn(column_id) {
        await database.master(this.logger)
            .table(COLUMNS_TABLE)
            .where({ id: column_id })
            .del();
    }

    async deleteColumn(column_id) {
        await this.#deleteCards(column_id);
        await this.#deleteColumn(column_id);
    }

    async updateBoardDescription(board_id, description) {
        if (!board_id || !description) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }
        await database.master(this.logger)
            .table(BOARDS_TABLE)
            .update({
                description
            }).where({ id: board_id });
    }

    async deleteBoardMember(board_id, user_id) {
        if (!board_id || !user_id) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }

        const delete_board_member_query = await database.master(this.logger)
            .table(BOARD_MEMBERS_TABLE)
            .del()
            .where({
                board_id,
                user_id,
            });

        const delete_member_query = database.master(this.logger)
            .table(CARD_MEMBERS)
            .join(`${CARD} as c`, `${CARD_MEMBERS}.card_id`, 'c.id')
            .join(`${BOARDS_TABLE} as b`, 'b.id', 'c.board_id')
            .where({
                'b.id': board_id,
                [`${CARD_MEMBERS}.user_id`]: user_id
            })
            .del();

        await Promise.all([delete_board_member_query, delete_member_query])
    }

    async updateVisibility(board_id, is_private) {
        if (!board_id) {
            throw new RequestError('Missing required fields', http_status.StatusCodes.BAD_REQUEST);
        }

        await database.master(this.logger)
            .table(BOARDS_TABLE)
            .update({
                is_private: JSON.parse(is_private)
            });
    }

    async moveCard(board_id, card_id, from_column_id, to_column_id) {
        const max_column_order = await this.#getMaxColumnOrder(to_column_id);
        const query = database.master(this.logger)
            .table(CARD)
            .update({ column_id: to_column_id, column_order: (max_column_order + 1) })
            .where({
                board_id,
                column_id: from_column_id,
                id: card_id,
            })
        await query;
    }

    async deleteAttachment(attachment_id) {
        await database.master(this.logger)
            .table(CARD_ATTACHMENTS)
            .del()
            .where({
                id: attachment_id
            });
    }

    async setCardCover(card_id, cover_image_url) {
        await database.master(this.logger)
            .table(CARD)
            .update({ cover_image_url })
            .where('id', card_id);
    }

    async searchUserForBoardAssignment(board_id, query) {
        if (!query || !query.length) {
            return [];
        }
        const get_users_for_board_query = database.slave(this.logger)
            .table(database.raw(` (
                SELECT
                    user_id
                FROM
                    board_members
                WHERE
                    board_id = ${board_id}
            ) AS u`)).rightJoin('users ', 'users.id', 'u.user_id').whereNull('u.user_id')
            .select([
                'users.id',
                'users.name',
                'users.email',
                'users.image_url'
            ])
            .whereRaw(`LOWER(users.name) LIKE '%${query.toString()}%'`);

        return get_users_for_board_query;
    }

    async searchUserForCardAssignment(board_id, card_id, query) {
        if (!query || !query.length) {
            return []
        }

        const get_users_for_card_query = database.slave(this.logger)
            .table(`${USERS_TABLE} as u`)
            .whereRaw(`u.id in (SELECT user_id from ${BOARD_MEMBERS_TABLE} where board_id = ${board_id})`)
            .whereRaw(`u.id not in (SELECT user_id from ${CARD_MEMBERS} where card_id = ${card_id})`)
            .select([
                'u.id',
                'u.name',
                'u.email',
                'u.image_url'
            ]);

        return get_users_for_card_query;
    }
}
module.exports = Board;
