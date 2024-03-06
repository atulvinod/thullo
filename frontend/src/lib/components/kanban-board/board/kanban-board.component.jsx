import "./kanban-board.style.css";
import "react-toastify/dist/ReactToastify.css";

import { useDispatch, useSelector } from "react-redux";
import {
    fetchCurrentBoard,
    getBoardsIsLoading,
    getCurrentBoard,
} from "../../../store/board";
import { KanbanBoardColumns } from "../columns/kanban-board-columns.component";
import { ProfileImage } from "../../profile-image/profile-image.component";
import { useParams } from "react-router-dom";
import { Button, ButtonTypes } from "../../button/button.component";
import { useEffect, useState } from "react";
import {
    addMembersToBoard,
    createColumn,
    searchUserForBoardAssignment,
} from "../../../services/board.services";
import { MoonLoader as Loader } from "react-spinners";
import { KanbanActionButton } from "../kanban-action-button/kanban-action-button.component";
import { CreateColumnModal } from "../create-column-modal/create-column-modal.component";
import { MoreHorizVector } from "../../../vectors/components/morehoriz.vector";
import { PlusVector } from "../../../vectors/components/plus.vector";
import { UserFinder } from "../../user-finder/user-finder.component";
import { MenuModal } from "../../menu-modal/menu-modal.component";
import { KanbanActionPopup } from "../action-popup/action-popup.component";
import { BoardVisibilityPopup } from "../board-visibility-popup/board-visibility.component";
import { ToastContainer } from "react-toastify";
import { useGlobalLoader } from "../../../hooks/xhr.hooks";

export const KanbanBoard = () => {
    const isLoading = useSelector(getBoardsIsLoading);
    const currentBoard = useSelector(getCurrentBoard);
    const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
    const [usersToInvite, setUsersToInvite] = useState(null);
    const [showMenuModal, setShowMenuModal] = useState(false);
    const { board_id } = useParams();
    const dispatch = useDispatch();
    const showGlobalLoader = useGlobalLoader();

    const handleUserInvitation = async () => {
        try {
            if (usersToInvite && usersToInvite.length) {
                await showGlobalLoader(() =>
                    addMembersToBoard(board_id, usersToInvite)
                );
                dispatch(fetchCurrentBoard(board_id));
                setUsersToInvite(null);
            }
        } catch (error) {}
    };

    const getAdminUser = (members, created_by_user_id) => {
        if (!members) {
            return null;
        }
        const [user] = members.filter(
            (m) => m.board_member_id == created_by_user_id
        );
        return user;
    };

    useEffect(() => {
        dispatch(fetchCurrentBoard(board_id));
    }, [board_id]);

    useEffect(() => {
        if (currentBoard) {
            document.title = `Th | ${currentBoard.board_title}`;
        }
    }, [isLoading]);

    return (
        <div className=" h-100">
            {isLoading ? (
                <div className="d-flex d-justify-content-center d-align-items-center h-100">
                    <Loader size={80} />
                </div>
            ) : (
                <div className="kanban-board-container">
                    <div className="kanban-board-menu-container d-flex d-justify-content-space-between mb-22">
                        <div className="board-members-container">
                            <span className="mr-13">
                                <BoardVisibilityPopup
                                    currentBoard={currentBoard}
                                />
                            </span>

                            {currentBoard?.board_members?.map((members) => (
                                <div
                                    className="mr-15"
                                    key={members.board_member_id}
                                >
                                    <ProfileImage
                                        key={members.board_member_id}
                                        image_url={
                                            members.board_member_image_url
                                        }
                                        name={members.board_member_name}
                                    />
                                </div>
                            ))}
                            <KanbanActionPopup
                                heading={"Invite to board"}
                                subHeading={"Search users you want to invite"}
                                trigger={
                                    <span>
                                        <Button
                                            icon={
                                                <PlusVector className="button-icon icon-color-white" />
                                            }
                                        />
                                    </span>
                                }
                            >
                                <UserFinder
                                    onChange={(result) => {
                                        console.log(result);
                                        setUsersToInvite(result);
                                    }}
                                    onSearch={async (query) =>
                                        searchUserForBoardAssignment(
                                            currentBoard.board_id,
                                            query
                                        )
                                    }
                                />
                                <div className="d-flex d-align-items-center d-justify-content-center mt-16">
                                    <Button
                                        label={"Invite"}
                                        onClick={handleUserInvitation}
                                    />
                                </div>
                            </KanbanActionPopup>
                        </div>
                        <Button
                            label={"Show menu"}
                            buttonType={ButtonTypes.SECONDARY}
                            icon={<MoreHorizVector className="button-icon" />}
                            onClick={() => setShowMenuModal(true)}
                        />
                    </div>

                    <ul className="kanban-board-columns-container">
                        {currentBoard?.columns?.map((columnObject) => (
                            <li key={columnObject.column_id}>
                                <KanbanBoardColumns
                                    boardId={board_id}
                                    columnData={columnObject}
                                    columnId={columnObject.column_id}
                                />
                            </li>
                        ))}
                        <li>
                            <KanbanActionButton
                                onClick={() => setShowCreateColumnModal(true)}
                                label={"Add another column"}
                                icon={<PlusVector className="button-icon" />}
                            />
                        </li>
                    </ul>
                    <CreateColumnModal
                        setShowCreateColumnModal={setShowCreateColumnModal}
                        showCreateColumnModal={showCreateColumnModal}
                        onSuccess={() => dispatch(fetchCurrentBoard(board_id))}
                        onSubmit={(column_title, column_order_index) =>
                            showGlobalLoader(
                                () =>
                                    createColumn(
                                        board_id,
                                        column_title,
                                        column_order_index
                                    ),
                                "Added list"
                            )
                        }
                        maxColumnOrderIndex={currentBoard?.columns?.reduce(
                            (agg, columns) => {
                                agg = Math.max(agg, columns.column_order_index);
                                return agg;
                            },
                            0
                        )}
                    />
                    <MenuModal
                        isModalOpen={showMenuModal}
                        setModalIsOpen={setShowMenuModal}
                        currentBoard={currentBoard}
                        adminUser={getAdminUser(
                            currentBoard?.board_members,
                            currentBoard?.created_by_user_id
                        )}
                    ></MenuModal>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};
