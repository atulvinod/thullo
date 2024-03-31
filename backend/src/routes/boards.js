const Boards = require('@src/models/Board');
const router = require('@util/routerUtility').Router();
const http_status = require('http-status-codes');

router.get('/', async (req, res, logger) => {
    const search_query = req.query.search;
    const boards = new Boards(logger);
    const data = await boards.getBoards(req.user.id, search_query);
    return res.json({ data: { boards: data } });
});

router.post('/', async (req, res, logger) => {
    const boards = new Boards(logger);
    const [cover_image] = req.files;
    const id = await boards.createBoard(req.user.id, req.body, cover_image);
    return res.json({ data: { id, ...req.body } })
        .status(http_status.StatusCodes.CREATED);
});

router.post('/:id/columns', async (req, res, logger) => {
    const boards = new Boards(logger);
    const id = await boards.createColumn(req.params.id, req.body);
    return res.json({ data: { id, ...req.body } })
        .status(http_status.StatusCodes.CREATED);
});

router.patch('/:board_id/columns/:column_id/column_title', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { column_id } = req.params;
    const { column_title } = req.body;
    await boards.updateColumnName(column_id, column_title);
    return res.json({ message: 'Name updated' }).status(http_status.StatusCodes.OK);
});

router.delete('/:board_id/columns/:column_id', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { column_id } = req.params;
    await boards.deleteColumn(column_id);
    return res.json({ message: 'Deleted column' });
});

router.post('/:id/members', async (req, res, logger) => {
    const boards = new Boards(logger);
    const id = await boards.addMembersToBoard(req.params.id, req.body.member_user_ids);
    return res.json({ data: { id, ...req.body } })
        .status(http_status.StatusCodes.CREATED);
});

router.post('/:id/card', async (req, res, logger) => {
    const boards = new Boards(logger);
    const id = await boards.createCard(req.user.id, req.body);
    return res.json({ message: 'Created card', data: { ...req.body, id } })
        .status(http_status.StatusCodes.CREATED);
});

router.post('/:id/card/:card_id/labels', async (req, res, logger) => {
    const boards = new Boards(logger);
    const id = await boards.addLabelToCard(
        req.params.card_id,
        req.body.label_color,
        req.body.label_name,
    );
    return res.json({ data: { id, ...req.body } })
        .status(http_status.StatusCodes.CREATED);
});

router.patch('/:id/card/:card_id/cover_image', async (req, res, logger) => {
    const boards = new Boards(logger);
    await boards.setCardCover(req.params.card_id, req.body.cover_image_url);
    return res.json({ message: 'Cover image updated' });
});

router.patch('/:id/card/:card_id/column', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { id, card_id } = req.params;
    await boards.moveCard(id, card_id, req.body.from_column_id, req.body.to_column_id);
    return res.json({ message: 'Card moved' });
});

router.post('/:id/card/:card_id/members', async (req, res, logger) => {
    const boards = new Boards(logger);
    const id = await boards.addMembersToCard(req.params.card_id, req.body.member_ids);
    return res.json({
        data: {
            id,
            ...req.body,
        },
    }).status(http_status.StatusCodes.CREATED);
});

router.post('/:id/card/:card_id/attachments', async (req, res, logger) => {
    const [attachment] = req.files;
    const boards = new Boards(logger);
    const results = await boards.addAttachmentToCard(req.params.card_id, req.user.id, attachment);
    return res.json({
        data: {
            ...results,
        },
    }).status(http_status.StatusCodes.CREATED);
});

router.delete('/:id/card/:card_id/attachments/:attachment_id', async (req, res, logger) => {
    const boards = new Boards(logger);
    await boards.deleteAttachment(req.params.attachment_id);
    return res.json({
        message: 'Attachment deleted',
    });
});

router.post('/:id/card/:card_id/comments', async (req, res, logger) => {
    const boards = new Boards(logger);
    const id = await boards.addCommentToCard(req.params.card_id, req.user.id, req.body.comment);
    return res.json({
        data: {
            id,
            ...req.body,
        },
    }).status(http_status.StatusCodes.CREATED);
});

router.delete('/:id/card/:card_id/comments/:comment_id', async (req, res, logger) => {
    const boards = new Boards(logger);
    await boards.deleteCommentFromCard(req.params.comment_id);
    return res.json({ message: 'Comment deleted' });
});

router.patch('/:id/card/:card_id/comments/:comment_id', async (req, res, logger) => {
    const boards = new Boards(logger);
    await boards.updateCardComment(req.params.comment_id, req.body.comment);
    return res.json({ message: 'Comment updated' });
});

router.get('/:id', async (req, res, logger) => {
    const boards = new Boards(logger);
    const data = await boards.getBoardDetails(req.params.id);
    return res.json({
        data,
    });
});

router.delete('/:board_id/members/:member_id', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { board_id, member_id } = req.params;
    await boards.deleteBoardMember(board_id, member_id);
    return res.json(({ message: 'Member deleted' }));
});

router.patch('/:board_id/description', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { board_id } = req.params;
    await boards.updateBoardDescription(board_id, req.body.description);
    return res.json({ message: 'Description updated' });
});

router.patch('/:board_id/is_private', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { is_private } = req.body;
    const { board_id } = req.params;
    await boards.updateVisibility(board_id, is_private);
    return res.json({ message: 'Updated visibility' });
});

router.patch('/:board_id/cover_url', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { cover_url } = req.body;
    await boards.updateBoardImage(req.user.id, req.params.board_id, cover_url);
    return res.json({ message: "Updated cover url" });
})

router.get('/:board_id/search_user', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { query } = req.query;
    const { board_id } = req.params;
    const users = await boards.searchUserForBoardAssignment(board_id, query);
    return res.json({ data: users });
});

router.get('/:board_id/card/:card_id/search_user', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { board_id, card_id } = req.params;
    const { query } = req.query;
    const users = await boards.searchUserForCardAssignment(board_id, card_id, query);
    return res.json({ data: users });
});

router.delete('/:board_id/card/:card_id', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { board_id, card_id } = req.params;
    await boards.deleteCard(req.user.id, board_id, card_id);
    return res.json({ message: 'Card deleted' });
});

router.delete('/:board_id', async (req, res, logger) => {
    const boards = new Boards(logger);
    const { board_id } = req.params;
    await boards.deleteBoard(req.user.id, board_id);
    return res.json({ message: 'Deleted board' });
})

module.exports = router;
