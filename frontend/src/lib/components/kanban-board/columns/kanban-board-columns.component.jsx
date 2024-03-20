import "./kanban-board-columns.style.css";

import { useDrop } from "react-dnd";
import { KanbanBoardCard } from "../card/kanban-board-card.component";
import { DragItemTypes } from "../../../utils/drag.types";
import { useDispatch, useSelector } from "react-redux";
import {
    getCardBeingProcessed,
    getHoverColumn,
    moveCardBetweenColumn,
    setColumnTransformation,
    setCurrentCardBeingProcessed,
    setHoverColumn,
    showDummyNewCard,
} from "../../../store/board";
import { useState, useRef } from "react";
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
import { Filter, GripHorizontal } from "lucide-react";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import { transformationConfigs } from "../../../utils/constants";

const dateFilters = [
    {
        label: "-- None --",
        value: transformationConfigs.CONFIGS.SORT.DATE.SORT_NONE,
    },
    {
        label: "Recently added - ascending",
        value: transformationConfigs.CONFIGS.SORT.DATE.RECENTLY_ADDED_ASC,
    },
    {
        label: "Recently added - descending",
        value: transformationConfigs.CONFIGS.SORT.DATE.RECENTLY_ADDED_DESC,
    },
    {
        label: "Recently modified - ascending",
        value: transformationConfigs.CONFIGS.SORT.DATE.RECENTLY_MODIFIED_ASC,
    },
    {
        label: "Recently modified - descending",
        value: transformationConfigs.CONFIGS.SORT.DATE.RECENTLY_MODIFIED_DESC,
    },
];

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
    const [showFilter, setShowFilter] = useState(false);
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

    const columnFilterContainerRef = useRef(null);
    const columnFilterContainerChildRef = useRef(null);

    function setColumnFilterContainerHeight() {
        if (
            columnFilterContainerRef.current &&
            columnFilterContainerChildRef.current
        ) {
            const container = columnFilterContainerRef.current;
            const child = columnFilterContainerChildRef.current;
            container.style.height =
                child.getBoundingClientRect().height + "px";

            if (showFilter) {
                container.style.overflow = "hidden";
            } else {
                setTimeout(() => {
                    container.style.overflow = "visible";
                }, 500);
            }
        }
    }

    return (
        <div ref={drop} className="h-100">
            <div className="mb-14 sticky-top">
                <div
                    className="d-flex d-justify-content-space-between d-align-items-center column-header"
                    onClick={() => {
                        setColumnFilterContainerHeight();
                        setShowFilter(!showFilter);
                    }}
                >
                    <h3 className="text-xl">{columnData.column_name}</h3>
                    <div>
                        <Popup
                            trigger={
                                <span>
                                    <MoreHorizVector className="more-button" />
                                </span>
                            }
                            position={"bottom left"}
                            closeOnDocumentClick
                            on={"hover"}
                            mouseLeaveDelay={0}
                            mouseEnterDelay={0}
                            contentStyle={{ padding: "0px", border: "none" }}
                            arrow={false}
                        >
                            <div className="column-popup-menu">
                                <ul>
                                    <li
                                        onClick={() =>
                                            setShowCreateColumnModal(true)
                                        }
                                    >
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
                </div>
                <div
                    ref={columnFilterContainerRef}
                    className={
                        "column-filter-container " + (!showFilter ? "h-0" : "")
                    }
                >
                    <div
                        ref={columnFilterContainerChildRef}
                        className={"px-12  transition py-30"}
                    >
                        <div className="d-flex d-align-items-center">
                            <Filter className="popup-icon" />
                            <h2>Sort & Filter</h2>
                        </div>
                        <div>
                            <div className="mt-13">
                                <span>Date</span>
                                <Dropdown
                                    options={dateFilters}
                                    onChange={(obj) => {
                                        dispatch(
                                            setColumnTransformation(
                                                columnId,
                                                transformationConfigs.TYPES
                                                    .SORT,
                                                transformationConfigs.BASIS.SORT
                                                    .DATE,
                                                transformationConfigs.CONFIGS
                                                    .SORT.DATE[obj.value]
                                            )
                                        );
                                    }}
                                    value={dateFilters[0]}
                                    placeholder="Select an option"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`h-100 mt-30 ${
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
                {isCardHoverOnCurrentColumn() && (
                    <div className="drop-hover-indicator">+</div>
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
                                    onClose={() => handleDeleteCard(index)}
                                    onCreateCard={async ({
                                        card_name,
                                        board_id,
                                        column_id,
                                    }) => {
                                        try {
                                            handleDeleteCard(index);
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
