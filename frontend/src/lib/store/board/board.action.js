import { getBoardDetails, getBoards } from "../../services/board.services"
import { createAction } from "../../utils/reducer.utils"
import { BOARD_ACTION_TYPES } from "./board.types"

export const setHoverColumn = (columnId) => (dispatch) => {
    dispatch(createAction(BOARD_ACTION_TYPES.SET_HOVER_COLUMN, { columnId }))
}

export const fetchBoards = () => async (dispatch) => {
    dispatch(createAction(BOARD_ACTION_TYPES.SET_LOADING, null));
    const boards = await getBoards();
    dispatch(createAction(BOARD_ACTION_TYPES.REFRESH_BOARDS, boards))
}

export const fetchCurrentBoard = (board_id, setLoading = true) => async (dispatch) => {
    if (setLoading)
    dispatch(createAction(BOARD_ACTION_TYPES.SET_LOADING, null));
    const board = await getBoardDetails(board_id);
    dispatch(createAction(BOARD_ACTION_TYPES.SET_CURRENT_BOARD, board));
}

export const setCurrentCardBeingProcessed = (card_id) => (dispatch) => {
    dispatch(createAction(BOARD_ACTION_TYPES.SET_CARD_BEING_PROCESSED, card_id))
}

export const moveCardBetweenColumn = (card_id, from_column, to_column) => async (dispatch) => {
    dispatch(createAction(BOARD_ACTION_TYPES.MOVE_CARD, { card_id, from_column, to_column }))
}