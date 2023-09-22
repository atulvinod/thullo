import { USER_ACTION_TYPES } from "./user.types";

const getUserFromLocalStorage = () => {
    const user = localStorage.getItem('user');
    return JSON.parse(user);
}

const getTokenFromLocalStorage = () => {
    const token = localStorage.getItem('token');
    return token;
}

export const INITIAL_STATE = {
    user: getUserFromLocalStorage(),
    token: getTokenFromLocalStorage(),
    loginError: null,
    registerError: null,
    isLoading: false,
}

const persistUserDetails = ({ user, token }) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token);
}

const clearUserDetails = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}

export const userReducer = (state = INITIAL_STATE, payload = {}) => {
    const { type, action } = payload;
    switch (type) {
        case USER_ACTION_TYPES.REGISTER_SUCCESS:
        case USER_ACTION_TYPES.LOGIN_SUCCESS:
            persistUserDetails(action);
            return {
                ...state,
                isLoading: false,
                user: action.user,
                token: action.token
            }
        case USER_ACTION_TYPES.LOGIN_ERROR:
            return {
                ...state,
                isLoading: false,
                loginError: action
            }
        case USER_ACTION_TYPES.ATTEMPT_ACTION:
            return {
                ...state,
                isLoading: true
            }
        case USER_ACTION_TYPES.REGISTER_ERROR:
            return {
                ...state,
                isLoading: false,
                registerError: action
            }
        case USER_ACTION_TYPES.LOGOUT:
            clearUserDetails();
            return {
                ...state,
                user: null,
                token: null,
            }
        default:
            return state;
    }
};
