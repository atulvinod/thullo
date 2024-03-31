import "./navbar.style.css";
import logo from "./Logo.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NavUserProfile } from "../nav-user-profile/nav-user-profile.component";
import { useSelector } from "react-redux";
import { tokenSelector } from "../../store";
import { getCurrentBoard } from "../../store/board";
import { Button, ButtonTypes } from "../button/button.component";
import { FormInputWithAction } from "../form-input-with-action/form-input-with-action.component";
import { ProgressBar } from "../progress-bar/progress-bar.component";
import { apiCallStateSelector } from "../../store/app";
import { debounce } from "lodash";
import { useGlobalLoader } from "../../hooks/xhr.hooks";
import { searchBoards } from "../../services/board.services";
import { useState } from "react";
import { useComponentVisible } from "../../hooks/component-visible.hooks";
import { Dice5 } from "lucide-react";

export const NavBar = () => {
    const navigate = useNavigate();
    const token = useSelector(tokenSelector);
    const location = useLocation();
    const currentBoard = useSelector(getCurrentBoard);
    const isAPICallPending = useSelector(apiCallStateSelector);
    const [searchResults, setSearchResults] = useState([]);
    const { ref, isComponentVisible, setIsComponentVisible } =
        useComponentVisible(false);
    const showGlobalLoader = useGlobalLoader(false);

    const search = debounce(async (query) => {
        try {
            if (!query || !query.length) {
                return;
            }
            const result = await showGlobalLoader(() => searchBoards(query));
            setIsComponentVisible(true);
            setSearchResults(result.boards);
        } catch (error) {}
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
                                        <Dice5 className="button-icon icon-color-grey" />
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
