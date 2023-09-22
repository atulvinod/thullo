import "./user-finder.style.css";

import { SearchVector } from "../../vectors/components/search.vector";
import { FormInputWithAction } from "../form-input-with-action/form-input-with-action.component";
import { useState } from "react";
import { debounce } from "lodash";
import { searchUser } from "../../services/user.services";
import { ProfileImage } from "../profile-image/profile-image.component";
export const UserFinder = ({ onChange, onSearch }) => {
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [noResult, setNoResult] = useState(false);

    const debouncedSearch = debounce((term) => {
        if (!term.length) {
            return;
        }
        onSearch(term).then((result) => {
            if (!result || !result.length) {
                setNoResult(true);
                setSearchedUsers([]);
                return;
            }
            setNoResult(false);
            setSearchedUsers(result);
        });
    }, 1000);

    const handleSearch = (event) => {
        const { value } = event.target;
        setNoResult(false);
        setSearchedUsers([]);
        debouncedSearch(value);
    };

    const handleUserSelection = (user) => {
        const state = { ...selectedUsers };
        if (state[user.id]) {
            delete state[user.id];
        } else {
            state[user.id] = user;
        }
        if (onChange) onChange(Object.keys(state));
        setSelectedUsers(state);
    };

    return (
        <div className="mt-21">
            <FormInputWithAction
                placeHolder={"User..."}
                buttonIcon={
                    <SearchVector className="button-icon icon-color-white" />
                }
                onInputChange={handleSearch}
            />
            {noResult ? (
                <div className="d-flex d-align-items-center d-justify-content-center mt-10">
                    No results
                </div>
            ) : (
                <></>
            )}
            {searchedUsers.length ? (
                <div className={`mt-10 user-found-container `}>
                    {searchedUsers.map((user) => (
                        <div
                            onClick={() => handleUserSelection(user)}
                            className={`d-flex d-align-items-center users-found ${
                                selectedUsers[user.id] ? "user-selected" : ""
                            }`}
                        >
                            <ProfileImage
                                image_url={user.image_url}
                                name={user.name}
                                showUserName={true}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};
