import { Outlet } from "react-router-dom";
import { NavBar } from "../navbar/navbar..component";
import "./root.style.css";
import { ToastContainer } from "react-toastify";

export const AppRoot = () => {
    return (
        <>
            <NavBar />
            <div className="body-container">
                <Outlet />
            </div>
            <ToastContainer />
        </>
    );
};
