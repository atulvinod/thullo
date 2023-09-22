import Popup from "reactjs-popup";
import "./board-visibility.style.css";
import { Button, ButtonTypes } from "../../button/button.component";
import { KanbanActionPopup } from "../action-popup/action-popup.component";
import { BoardVisibilityActionComponent } from "./board-visibility-action.component";
import { updateBoardVisibility } from "../../../services/board.services";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentBoard } from "../../../store/board";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { LockVector } from "../../../vectors/components/lock.vector";
import { useXHR } from "../../../hooks/xhr.hooks";

export const BoardVisibilityPopup = ({ ...props }) => {
    const currentBoard = useSelector(getCurrentBoard);
    const refreshBoard = useRefreshBoard();
    const xhr = useXHR();
    return (
        <KanbanActionPopup
            heading={"Visibility"}
            subHeading={"Choose who can see this board"}
            trigger={
                <span>
                    <Button
                        buttonType={ButtonTypes.SECONDARY}
                        icon={
                            <LockVector className="button-icon icon-color-grey" />
                        }
                        label={
                            currentBoard.is_board_private ? "Private" : "Public"
                        }
                    />
                </span>
            }
        >
            <div className="board-visibility-container">
                <BoardVisibilityActionComponent
                    heading={"Public"}
                    subHeading={"Anyone on the internet can see this list"}
                    isSelected={!currentBoard.is_board_private}
                    onClick={async () => {
                        if (!currentBoard.is_board_private) {
                            return;
                        }
                        await xhr(() =>
                            updateBoardVisibility(currentBoard.board_id, false)
                        );
                        refreshBoard();
                    }}
                />
                <BoardVisibilityActionComponent
                    heading={"Private"}
                    subHeading={"Only board members can see this this"}
                    isSelected={currentBoard.is_board_private}
                    onClick={async () => {
                        if (currentBoard.is_board_private) {
                            return;
                        }
                        await xhr(() =>
                            updateBoardVisibility(currentBoard.board_id, true)
                        );
                        refreshBoard();
                    }}
                />
            </div>
        </KanbanActionPopup>
    );
};
