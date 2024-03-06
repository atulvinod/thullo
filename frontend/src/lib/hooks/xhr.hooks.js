import { AxiosError, HttpStatusCode } from "axios";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createAction } from "../utils/reducer.utils";
import { APP_ACTION_TYPES } from "../store/app";

export const useGlobalLoader = (showToast = true) => {
    const dispatch = useDispatch();
    return async function (apiCall, success = 'Success', error_message = 'Something went wrong') {

        try {
            dispatch(createAction(APP_ACTION_TYPES.SET_API_CALL_PENDING_STATE, true))
            const data = await apiCall();
            if (showToast) toast.success(success);
            dispatch(createAction(APP_ACTION_TYPES.SET_API_CALL_PENDING_STATE, false))

            return data;
        } catch (error) {
            dispatch(createAction(APP_ACTION_TYPES.SET_API_CALL_PENDING_STATE, false))

            if (error instanceof AxiosError) {
                if (error?.response?.status == HttpStatusCode.InternalServerError) {
                    if (showToast) toast.error('Something went wrong')
                } else {
                    if (showToast) toast.error(error.response?.data ?? error_message);
                }
            } else {
                toast.error(error_message);
            }
            return Promise.reject();
        }
    }
}