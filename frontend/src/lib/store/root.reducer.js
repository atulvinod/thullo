import { combineReducers } from "redux";
import { userReducer } from "./user";
import { boardReducer } from "./board";
import { appReducer } from "./app";

export const rootReducer = combineReducers({
    user: userReducer,
    board: boardReducer,
    app: appReducer
})