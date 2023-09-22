import { useSelector } from "react-redux";
import {
    addMembersToCard,
    searchUserForCardAssignment,
} from "../../../services/board.services";
import { PlusVector } from "../../../vectors/components/plus.vector";
import { Button } from "../../button/button.component";
import { UserFinder } from "../../user-finder/user-finder.component";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { getCurrentBoard } from "../../../store/board";
import { KanbanActionPopup } from "../action-popup/action-popup.component";
import { useXHR } from "../../../hooks/xhr.hooks";

export const AssignUsersToCard = ({ cardData, trigger }) => {
    let cardMemberIds = [];
    const refreshBoard = useRefreshBoard();
    const currentBoard = useSelector(getCurrentBoard);
    const xhr = useXHR();

    const handleCardMemberAssignment = async () => {
        await xhr(() =>
            addMembersToCard(
                currentBoard.board_id,
                cardData.card_id,
                cardMemberIds
            )
        );
        cardMemberIds = [];
        refreshBoard();
    };

    return (
        <KanbanActionPopup
            heading={"Assign users to card"}
            subHeading={"Search users to want to assign to this card"}
            trigger={trigger}
        >
            <UserFinder
                onChange={(member_ids) => {
                    cardMemberIds = [...member_ids];
                }}
                onSearch={async (term) =>
                    searchUserForCardAssignment(
                        currentBoard.board_id,
                        cardData.card_id,
                        term
                    )
                }
            ></UserFinder>
            <div
                className="d-flex d-align-items-center d-justify-content-center mt-16"
                onClick={handleCardMemberAssignment}
            >
                <Button label={"Assign"} />
            </div>
        </KanbanActionPopup>
    );
};
