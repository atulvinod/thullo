import { BOARD_ACTION_TYPES } from "./board.types";

export const INITIAL_STATE = {
    currentHoverColumn: null,
    allBoards: [],
    isLoading: true,
    currentBoard: null,
}

export const boardReducer = (state = INITIAL_STATE, payload = {}) => {
    const { type, action } = payload;
    switch (type) {
        case BOARD_ACTION_TYPES.SET_HOVER_COLUMN:
            const { columnId } = action;
            return {
                ...state,
                currentHoverColumn: columnId
            }
        case BOARD_ACTION_TYPES.REFRESH_BOARDS:
            return {
                ...state,
                isLoading: false,
                allBoards: action
            }
        case BOARD_ACTION_TYPES.SET_LOADING: {
            return {
                ...state,
                isLoading: true
            }
        }
        case BOARD_ACTION_TYPES.SET_CURRENT_BOARD: {
            return {
                ...state,
                currentBoard: action,
                isLoading: false
            }
        }
        default:
            return state;

    }
}