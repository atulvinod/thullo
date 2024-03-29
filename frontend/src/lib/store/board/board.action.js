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

export const showDummyNewCard = (column_id, card_name) => (dispatch) =>{
    dispatch(createAction(BOARD_ACTION_TYPES.SHOW_NEW_DUMMY_CARD, {column_id, card_name}));
}

export const setColumnTransformation = (column_id, transformation_type, transformation_basis, transformation_config) => (dispatch) => {
    dispatch(createAction(BOARD_ACTION_TYPES.SET_COLUMN_TRANSFORMATION, { column_id, transformation_type, transformation_basis, transformation_config }))
}

export const deleteCard = (column_id, card_id) => (dispatch) => {
    dispatch(createAction(BOARD_ACTION_TYPES.DELETE_CARD, { card_id, column_id }))
}