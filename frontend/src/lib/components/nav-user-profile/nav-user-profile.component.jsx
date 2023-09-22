import { useDispatch, useSelector } from "react-redux";
import "./nav-user-profile.style.css";
import { currentUserSelector, tokenSelector } from "../../store";
import { Link } from "react-router-dom";
import chevron from "./chevron-down.svg";
import { useState } from "react";
import { logoutUserAction } from "../../store/user/user.action";
import { ProfileImage } from "../profile-image/profile-image.component";

export const NavUserProfile = () => {
    const token = useSelector(tokenSelector);
    const user = useSelector(currentUserSelector);
    const [dropdownState, setDropdownState] = useState(false);
    const dispatch = useDispatch();

    const logout = () => {
        setDropdownState(false);
        dispatch(logoutUserAction());
    };

    return (
        <>
            {token ? (
                <div className="d-flex user-profile-container">
                    <div className="mr-22">
                        <ProfileImage
                            name={user.name}
                            image_url={user.image_url}
                            showUserName={true}
                        />
                    </div>
                    <img
                        src={chevron}
                        alt="chevron"
                        className={
                            !dropdownState
                                ? "chevron"
                                : "chevron rotate-chevron"
                        }
                        onClick={() => {
                            setDropdownState(!dropdownState);
                        }}
                    />

                    <div
                        className={
                            dropdownState
                                ? "user-profile-actions-container dropdown-open"
                                : "user-profile-actions-container dropdown-closed"
                        }
                    >
                        <div className="user-profile-actions">
                            <span onClick={logout}>Logout</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="user-nav-link-container">
                    <Link to="/login">
                        <span>Login</span>
                    </Link>
                    <span> | </span>
                    <Link to="register">
                        <span>Register</span>
                    </Link>
                </div>
            )}
        </>
    );
};
