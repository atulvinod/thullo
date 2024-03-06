import { findInArray } from "../../utils/common.util";
import { BOARD_ACTION_TYPES } from "./board.types";

export const INITIAL_STATE = {
    currentHoverColumn: null,
    allBoards: [],
    isLoading: true,
    currentBoard: null,
    currentCardBeingProcessed: null
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
                allBoards: action,
                currentCardBeingProcessed: null
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
                isLoading: false,
                currentCardBeingProcessed: null
            }
        }
        case BOARD_ACTION_TYPES.SET_CARD_BEING_PROCESSED: {
            return {
                ...state,
                currentCardBeingProcessed: action
            }
        }
        case BOARD_ACTION_TYPES.MOVE_CARD: {
            const { card_id, from_column: from_column_id, to_column: to_column_id } = action;
            const newBoardConfig = { ...state.currentBoard };
            const [fromColumnArray] = newBoardConfig.columns.filter((c) => c.column_id === from_column_id);
            const [toColumnArray] = newBoardConfig.columns.filter((c) => c.column_id === to_column_id);

            const fromColumnIndex = findInArray(newBoardConfig.columns, (obj) => obj.column_id === from_column_id);
            const toColumnIndex = findInArray(newBoardConfig.columns, (obj) => obj.column_id === to_column_id)

            const [cardData] = fromColumnArray.cards.filter((c) => c.card_id === card_id)
            newBoardConfig.columns[toColumnIndex].cards = [...toColumnArray.cards, cardData];
            newBoardConfig.columns[fromColumnIndex].cards = [...fromColumnArray.cards.filter((c) => c.card_id !== card_id)]
            return {
                ...state,
                currentBoard: newBoardConfig
            }
        }

        case BOARD_ACTION_TYPES.SHOW_NEW_DUMMY_CARD: {
            const { column_id, card_name } = action;
            const newBoardConfig = { ...state.currentBoard };
            const [requiredColumn] = newBoardConfig.columns.filter((c) => c.column_id === column_id)
            requiredColumn.cards.push({
                card_attachments: [],
                card_comments: [],
                card_id: -1,
                card_labels: [],
                card_members: [],
                card_name,
                cover_image_url: null,
            })

            return {
                ...state,
                currentBoard: newBoardConfig,
                currentCardBeingProcessed: -1
            }
        }
        default:
            return state;

    }
}