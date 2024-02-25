import client from "../utils/axios.util";

export const createBoard = async (board_data) => {
    const { data } = await client.post('boards', board_data, {
        headers: {
            "Content-Type": 'multipart/form-data'
        }
    });
    return data.data;
}

export const getBoards = async () => {
    const { data } = await client.get('boards');
    return data.data.boards;
}

export const searchBoards = async (query) => {
    const { data } = await client.get('boards', { params: { query } });
    return data.data;
}

export const getBoardDetails = async (board_id) => {
    const { data } = await client.get(`boards/${board_id}`)
    return data.data;
}

export const createColumn = async (board_id, column_title, column_order_index) => {
    const { data } = await client.post(`boards/${board_id}/columns`, { board_id, column_title, column_order_index });
    return data.data;
}

export const updateColumnTitle = async (board_id, column_id, column_title) => {
    await client.patch(`boards/${board_id}/columns/${column_id}/column_title`, { column_title });
}

export const deleteColumn = async (board_id, column_id) => {
    await client.delete(`boards/${board_id}/columns/${column_id}`);
}

export const addMembersToBoard = async (board_id, member_user_ids) => {
    await client.post(`boards/${board_id}/members`, { member_user_ids })
}

export const updateBoardDescription = async (board_id, description) => {
    await client.patch(`/boards/${board_id}/description`, { description })
}

export const deleteBoardMember = async (board_id, member_id) => {
    await client.delete(`/boards/${board_id}/members/${member_id}`);
}

export const updateBoardVisibility = async (board_id, is_private) => {
    await client.patch(`/boards/${board_id}/is_private`, { is_private })
}

export const createCard = async (board_id, column_id, card_name) => {
    const { data } = await client.post(`/boards/${board_id}/card`, { board_id, column_id, card_name });
    return data.data;
}

export const sendMoveCardRequest = async (board_id, card_id, from_column_id, to_column_id) => {
    await client.patch(`/boards/${board_id}/card/${card_id}/column`, { from_column_id, to_column_id })
}

export const addMembersToCard = async (board_id, card_id, member_ids) => {
    await client.post(`/boards/${board_id}/card/${card_id}/members`, { member_ids });
}

export const addAttachmentToCard = async (board_id, card_id, attachment_file) => {
    const { data } = await client.post(`boards/${board_id}/card/${card_id}/attachments`, { attachment_file }, { headers: { "Content-Type": 'multipart/form-data' } })
    return data.data;
}

export const deleteCardAttachment = async (board_id, card_id, attachment_id) => {
    await client.delete(`/boards/${board_id}/card/${card_id}/attachments/${attachment_id}`);
}

export const addCommentToCard = async (board_id, card_id, comment) => {
    const { data } = await client.post(`/boards/${board_id}/card/${card_id}/comments`, { comment })
    return data.data;
}

export const addLabelToCard = async (board_id, card_id, label_color, label_name) => {
    const { data } = await client.post(`/boards/${board_id}/card/${card_id}/labels`, { label_color, label_name });
    return data.data;
}

export const addCoverToCard = async (board_id, card_id, cover_image_url) => {
    await client.patch(`/boards/${board_id}/card/${card_id}/cover_image`, { cover_image_url });
}

export const searchUserForBoardAssignment = async (board_id, query) => {
    const { data } = await client.get(`/boards/${board_id}/search_user`, { params: { query } })
    return data.data;
}

export const searchUserForCardAssignment = async (board_id, card_id, query) => {
    const { data } = await client.get(`/boards/${board_id}/card/${card_id}/search_user`, { params: { query } });
    return data.data;
}

export const deleteComment = async (board_id, card_id, comment_id) => {
    await client.delete(`/boards/${board_id}/card/${card_id}/comments/${comment_id}`,)
}

export const updateComment = async (board_id, card_id, comment_id, comment) => {
    await client.patch(`/boards/${board_id}/card/${card_id}/comments/${comment_id}`, { comment });
}