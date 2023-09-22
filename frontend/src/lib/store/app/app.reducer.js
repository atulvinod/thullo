import { APP_ACTION_TYPES } from "./app.types";

const INITIAL_STATE = {
    isAPICallPending: false
}

export const appReducer = (state = INITIAL_STATE, payload = {}) => {
    const { type, action } = payload;
    switch (type) {
        case APP_ACTION_TYPES.SET_API_CALL_PENDING_STATE:
            return {
                ...state,
                isAPICallPending: action
            }
        default:
            return state;
    }
}