import "./navbar.style.css";
import logo from "./Logo.svg";
import { Link, json, useLocation, useNavigate } from "react-router-dom";
import { NavUserProfile } from "../nav-user-profile/nav-user-profile.component";
import { useSelector } from "react-redux";
import { tokenSelector } from "../../store";
import { getCurrentBoard } from "../../store/board";
import { Button, ButtonTypes } from "../button/button.component";
import { MenuVector } from "../../vectors/components/menu.vector";
import { FormInputWithAction } from "../form-input-with-action/form-input-with-action.component";
import { ProgressBar } from "../progress-bar/progress-bar.component";
import { apiCallStateSelector } from "../../store/app";
import { debounce, take } from "lodash";
import { useXHR } from "../../hooks/xhr.hooks";
import { searchBoards } from "../../services/board.services";
import { useState } from "react";
import { useComponentVisible } from "../../hooks/component-visible.hooks";

export const NavBar = () => {
    const navigate = useNavigate();
    const token = useSelector(tokenSelector);
    const location = useLocation();
    const currentBoard = useSelector(getCurrentBoard);
    const isAPICallPending = useSelector(apiCallStateSelector);
    const [searchResults, setSearchResults] = useState([]);
    const { ref, isComponentVisible, setIsComponentVisible } =
        useComponentVisible(false);
    const xhr = useXHR(false);

    const search = debounce(async (query) => {
        if (!query || !query.length) {
            return;
        }
        xhr(() => searchBoards(query)).then((result) => {
            setIsComponentVisible(true);
            setSearchResults(result.boards);
        });
    }, 1000);

    return (
        <div>
            <nav className="nav-container">
                <div className="d-flex d-align-items-center">
                    <Link to="/">
                        <img src={logo} alt="logo" className="nav-logo" />
                    </Link>
                    {token && location.pathname != "/" ? (
                        <>
                            <div className="current-board-container">
                                <h2>{currentBoard?.board_title}</h2>
                            </div>
                            <div className="all-boards-button-container">
                                <Button
                                    buttonType={ButtonTypes.SECONDARY}
                                    label={"All boards"}
                                    onClick={() => navigate("/")}
                                    buttonStyle={{ marginLeft: "2rem" }}
                                    icon={
                                        <MenuVector className="button-icon icon-color-grey" />
                                    }
                                ></Button>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}
                </div>

                <div className="nav-search-user-profile-container">
                    {token ? (
                        <div className="mr-44 flex-1 board-search">
                            <FormInputWithAction
                                placeHolder={"Keyword"}
                                buttonText={"Search"}
                                onInputChange={(event) => {
                                    const { value } = event.target;
                                    search(value);
                                }}
                            />
                            {isComponentVisible && (
                                <div
                                    className="board-search-result-container w-100"
                                    ref={ref}
                                >
                                    {searchResults.map((result) => (
                                        <div
                                            key={result.board_id}
                                            className="search-result"
                                            onClick={() => {
                                                setIsComponentVisible(false);
                                                navigate(
                                                    `/boards/${result.board_id}`
                                                );
                                            }}
                                        >
                                            <p className="fnt-wt-600">
                                                {result.board_title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <></>
                    )}

                    <NavUserProfile />
                </div>
            </nav>
            {isAPICallPending ? <ProgressBar /> : <></>}
        </div>
    );
};
