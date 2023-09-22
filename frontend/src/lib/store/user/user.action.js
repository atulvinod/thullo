import { loginWithEmailAndPassword, registerUser } from "../../services/user.services";
import { createAction } from "../../utils/reducer.utils";
import { USER_ACTION_TYPES } from "./user.types";

export const loginUserAction = ({ email, password }) => async (dispatch) => {
    try {
        dispatch(createAction(USER_ACTION_TYPES.ATTEMPT_ACTION, null));
        const loginDetails = await loginWithEmailAndPassword(email, password);
        dispatch(createAction(USER_ACTION_TYPES.LOGIN_SUCCESS, loginDetails));
    } catch (error) {
        dispatch(createAction(USER_ACTION_TYPES.LOGIN_ERROR, error));
    }
}

export const registerUserAction = (user_data) => async (dispatch) => {
    try {
        dispatch(createAction(USER_ACTION_TYPES.ATTEMPT_ACTION, null));
        const registerUserDetails = await registerUser(user_data);
        console.log("register user details ", registerUserDetails);
        dispatch(createAction(USER_ACTION_TYPES.REGISTER_SUCCESS, registerUserDetails));
    } catch (error) {
        dispatch(createAction(USER_ACTION_TYPES.REGISTER_ERROR, error));
    }
}

export const logoutUserAction = () => async (dispatch) => {
    try {
        dispatch(createAction(USER_ACTION_TYPES.LOGOUT, null));
    } catch (error) {

    }
}