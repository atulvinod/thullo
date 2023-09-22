import { useSelector } from "react-redux";
import { tokenSelector } from "../../store";
import { Navigate } from "react-router-dom";

export const withAuthGuard = (WrappedComponent) => {
    return (props) => {
        const token = useSelector(tokenSelector);
        if (!token) {
            return <Navigate to="/login" />;
        }

        return <WrappedComponent {...props} />;
    };
};
