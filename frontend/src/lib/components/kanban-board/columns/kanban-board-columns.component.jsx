import "./kanban-board-columns.style.css";

import { useDrop } from "react-dnd";
import { KanbanBoardCard } from "../card/kanban-board-card.component";
import { DragItemTypes } from "../../../utils/drag.types";
import { useDispatch, useSelector } from "react-redux";
import {
    getCardBeingProcessed,
    getHoverColumn,
    moveCardBetweenColumn,
    setCurrentCardBeingProcessed,
    setHoverColumn,
    showDummyNewCard,
} from "../../../store/board";
import { useState } from "react";
import { store } from "../../../store/store";
import { KanbanActionButton } from "../kanban-action-button/kanban-action-button.component";
import { MoreHorizVector } from "../../../vectors/components/morehoriz.vector";
import Popup from "reactjs-popup";
import { CreateColumnModal } from "../create-column-modal/create-column-modal.component";
import {
    createCard,
    deleteColumn,
    sendMoveCardRequest,
    updateColumnTitle,
} from "../../../services/board.services";
import { PlusVector } from "../../../vectors/components/plus.vector";
import { CreateCard } from "../create-card/create-card.component";

import { pullAt } from "lodash";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { useGlobalLoader } from "../../../hooks/xhr.hooks";

export const KanbanBoardColumns = ({
    boardId,
    columnId,
    columnData,
    ...props
}) => {
    const dispatch = useDispatch();
    const hoverColumn = useSelector(getHoverColumn);
    const cardBeingProcessed = useSelector(getCardBeingProcessed);

    const [hoverCardData, setHoverCardData] = useState();
    const [showCreateColumnModal, setShowCreateColumnModal] = useState();
    const [createNewCardComponents, setCreateNewCardComponents] = useState([]);
    const refreshBoard = useRefreshBoard();
    const showGlobalLoader = useGlobalLoader();

    const [{ isOver }, drop] = useDrop(() => ({
        accept: DragItemTypes.CARD,
        drop: (cardData) => {
            dispatch(setHoverColumn(null));
            setHoverCardData(null);
            if (cardData.fromColumn != columnId) {
                showGlobalLoader(async () => {
                    dispatch(setCurrentCardBeingProcessed(cardData.cardId));
                    dispatch(
                        moveCardBetweenColumn(
                            cardData.cardId,
                            cardData.fromColumn,
                            columnId
                        )
                    );
                    await sendMoveCardRequest(
                        boardId,
                        cardData.cardId,
                        cardData.fromColumn,
                        columnId
                    );
                })
                    .then(() => {
                        dispatch(setCurrentCardBeingProcessed(null));
                        refreshBoard();
                    })
                    .catch((err) => {
                        //incase of error, revert card move
                        dispatch(
                            moveCardBetweenColumn(
                                cardData.cardId,
                                columnId,
                                cardData.fromColumn
                            )
                        );
                    });
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
        hover: function (cardData, monitor) {
            if (monitor.isOver()) {
                const { board } = store.getState();
                const hoverColumn = board.currentHoverColumn;
                if (hoverColumn != columnId) {
                    return dispatch(setHoverColumn(columnId));
                }
                setHoverCardData(cardData);
            } else {
                setHoverCardData(null);
            }
        },
    }));

    const handleDeleteCard = (index) => {
        pullAt(createNewCardComponents, index);
        setCreateNewCardComponents(createNewCardComponents);
    };

    function isCardHoverOnCurrentColumn() {
        return (
            hoverColumn == columnId &&
            hoverCardData &&
            hoverCardData.fromColumn != columnId
        );
    }

    return (
        <div ref={drop} className="h-100">
            <div className="d-flex d-justify-content-space-between d-align-items-center column-header">
                <h3 className="text-xl">{columnData.column_name}</h3>
                <Popup
                    trigger={
                        <span>
                            <MoreHorizVector className="more-button" />
                        </span>
                    }
                    position={"bottom left"}
                    on="hover"
                    closeOnDocumentClick
                    mouseLeaveDelay={0}
                    mouseEnterDelay={0}
                    contentStyle={{ padding: "0px", border: "none" }}
                    arrow={false}
                >
                    <div className="column-popup-menu">
                        <ul>
                            <li onClick={() => setShowCreateColumnModal(true)}>
                                Rename
                            </li>
                            <li
                                onClick={async () => {
                                    try {
                                        await showGlobalLoader(() =>
                                            deleteColumn(
                                                boardId,
                                                columnData.column_id
                                            )
                                        );
                                        refreshBoard();
                                    } catch (error) {}
                                }}
                            >
                                Delete this list
                            </li>
                        </ul>
                    </div>
                </Popup>
            </div>
            <div
                className={`h-100 ${
                    isCardHoverOnCurrentColumn() ? "column-highlight" : ""
                }`}
            >
                {columnData.cards.map((data) => (
                    <KanbanBoardCard
                        cardData={data}
                        columnData={columnData}
                        key={data.card_id}
                        cardBeingProcessed={cardBeingProcessed}
                    />
                ))}
                {isCardHoverOnCurrentColumn() ? (
                    <div className="drop-hover-indicator">+</div>
                ) : (
                    <></>
                )}
                {createNewCardComponents.map((c) => c)}

                {!isCardHoverOnCurrentColumn() && (
                    <KanbanActionButton
                        label={"Add another card"}
                        icon={<PlusVector className="button-icon" />}
                        onClick={() => {
                            const index = createNewCardComponents.length;
                            setCreateNewCardComponents([
                                ...createNewCardComponents,
                                <CreateCard
                                    key={index}
                                    boardId={boardId}
                                    columnId={columnId}
                                    index={index}
                                    deleteCard={() => handleDeleteCard(index)}
                                    onCreateCard={async ({
                                        card_name,
                                        board_id,
                                        column_id,
                                    }) => {
                                        try {
                                            dispatch(
                                                showDummyNewCard(
                                                    column_id,
                                                    card_name
                                                )
                                            );
                                            await showGlobalLoader(() =>
                                                createCard(
                                                    board_id,
                                                    column_id,
                                                    card_name
                                                )
                                            );
                                            handleDeleteCard(index);
                                            refreshBoard();
                                        } catch (error) {}
                                    }}
                                ></CreateCard>,
                            ]);
                        }}
                    />
                )}
            </div>
            <CreateColumnModal
                columnTitle={columnData.column_name}
                setShowCreateColumnModal={setShowCreateColumnModal}
                showCreateColumnModal={showCreateColumnModal}
                onSuccess={() => setShowCreateColumnModal(false)}
                onSubmit={async (column_title) => {
                    showGlobalLoader(() =>
                        updateColumnTitle(
                            boardId,
                            columnData.column_id,
                            column_title
                        )
                    ).then(() => {
                        if (refreshBoard) {
                            refreshBoard();
                        }
                    });
                }}
            />
        </div>
    );
};
