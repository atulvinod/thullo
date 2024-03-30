import { useState } from "react";
import { searchPhoto } from "../../../services/unsplash.service";
import { SearchVector } from "../../../vectors/components/search.vector";
import { Button, ButtonTypes } from "../../button/button.component";
import { FormInputWithAction } from "../../form-input-with-action/form-input-with-action.component";
import { KanbanActionPopup } from "../action-popup/action-popup.component";
import { debounce } from "lodash";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { addCoverToCard } from "../../../services/board.services";
import { useSelector } from "react-redux";
import { getCurrentBoard } from "../../../store/board";
import { PictureVector } from "../../../vectors/components/picture.vector";
import { useGlobalLoader } from "../../../hooks/xhr.hooks";

export const AddCover = ({ cardDetail , addCover}) => {
    const [searchResults, setSearchResults] = useState([]);
    const refreshBoard = useRefreshBoard();
    const currentBoard = useSelector(getCurrentBoard);
    const showGlobalLoader = useGlobalLoader();

    const search = debounce((event) => {
        const { value: keyword } = event.target;
        if (!keyword || !keyword.length) {
            return;
        }
        searchPhoto(keyword).then((results) => {
            console.log(results);
            setSearchResults(results);
        });
    }, 1000);

    const handleOnResultClick = async (cover_image_url) => {
        await showGlobalLoader(() =>
            addCover(cover_image_url)
        );
        refreshBoard();
    };

    return (
        <KanbanActionPopup
            heading={"Photo search"}
            subHeading={"Search UnSplash for photos"}
            trigger={
                <span>
                    <Button
                        label={"Cover"}
                        buttonType={ButtonTypes.SECONDARY}
                        buttonStyle={{ width: "100%" }}
                        icon={
                            <PictureVector className="info-label-icon icon-color-grey"></PictureVector>
                        }
                    />
                </span>
            }
        >
            <FormInputWithAction
                onInputChange={search}
                placeHolder={"Keywords..."}
                buttonIcon={
                    <SearchVector className="button-icon icon-color-white" />
                }
            />
            <div className="add-cover-results mt-18">
                {searchResults.map((result) => (
                    <div
                        onClick={() => handleOnResultClick(result.urls.full)}
                        className="add-cover-result b-rd-4"
                        style={{ background: `url(${result.urls.thumb})` }}
                    ></div>
                ))}
            </div>
        </KanbanActionPopup>
    );
};
