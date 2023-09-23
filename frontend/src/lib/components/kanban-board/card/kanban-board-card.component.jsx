import "./kanban-board-card.style.css";
import { useDrag } from "react-dnd";
import { DragItemTypes } from "../../../utils/drag.types";
import { Button, ButtonTypes } from "../../button/button.component";
import { PlusVector } from "../../../vectors/components/plus.vector";
import { useRef, useState } from "react";
import { KanbanActionPopup } from "../action-popup/action-popup.component";
import { UserFinder } from "../../user-finder/user-finder.component";
import { addMembersToCard } from "../../../services/board.services";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { getCurrentBoard } from "../../../store/board";
import { useSelector } from "react-redux";
import { ProfileImage } from "../../profile-image/profile-image.component";
import { CardDetailModal } from "../card-detail-modal/card-detail-modal.component";
import { AssignUsersToCard } from "./assign-users.component";
import { CardStats } from "./card-stats.component";
import { MessageVector } from "../../../vectors/components/message.vector";
import { AttachmentVector } from "../../../vectors/components/attachment.vector";
import { TagRow } from "../../tag-row/tag-row.component";
import * as _ from "lodash";

export const KanbanBoardCard = ({ cardData, columnData, ...props }) => {
    let cardMemberIds = [];
    const refreshBoard = useRefreshBoard();
    const currentBoard = useSelector(getCurrentBoard);
    const [showCardDetailModal, setShowCardDetailModal] = useState(false);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: DragItemTypes.CARD,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        item: { cardId: cardData.card_id, fromColumn: columnData.column_id },
    }));

    return (
        <>
            <div
                className="kanban-board-card"
                ref={drag}
                onClick={() => setShowCardDetailModal(true)}
            >
                <div>
                    {cardData.cover_image_url ? (
                        <div
                            className="kanban-card-cover"
                            style={{
                                borderRadius: "1.2rem",
                                marginBottom: "1.2rem",
                                backgroundSize: "cover",
                                height: "13rem",
                                background: `url(${cardData.cover_image_url})`,
                            }}
                        ></div>
                    ) : (
                        <></>
                    )}

                    <span className="kanban-board-card-title">
                        {cardData.card_name}
                    </span>
                    <div className="mt-14">
                        <TagRow tags={cardData.card_labels} />
                    </div>
                    <div className="d-flex d-flex-dir-row mt-27 d-justify-content-space-between">
                        <div className="d-flex">
                            {_.take(cardData.card_members ?? [], 2).map(
                                (member) => (
                                    <div
                                        className="mr-8"
                                        key={member.member_id}
                                    >
                                        <ProfileImage
                                            key={member.member_id}
                                            image_url={member.image_url}
                                            name={member.name}
                                        />
                                    </div>
                                )
                            )}
                            <AssignUsersToCard
                                cardData={cardData}
                                trigger={
                                    <div>
                                        <Button
                                            icon={
                                                <PlusVector className="button-icon icon-color-white" />
                                            }
                                        />
                                    </div>
                                }
                            />
                        </div>
                        <div className="d-flex d-flex-dir-row">
                            {cardData.card_comments?.length ? (
                                <div className="mr-10">
                                    <CardStats
                                        icon={
                                            <MessageVector
                                                style={{
                                                    height: "1.2rem",
                                                    width: "1.2rem",
                                                }}
                                            />
                                        }
                                        text={cardData.card_comments.length}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}

                            {cardData.card_attachments?.length ? (
                                <CardStats
                                    icon={
                                        <AttachmentVector
                                            style={{
                                                height: "1.2rem",
                                                width: "1.2rem",
                                            }}
                                        />
                                    }
                                    text={cardData.card_attachments.length}
                                />
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>
                {isDragging ? (
                    <div className=" kanban-board-card-ondrag"></div>
                ) : (
                    <></>
                )}
            </div>
            <CardDetailModal
                setModalIsOpen={setShowCardDetailModal}
                isModalOpen={showCardDetailModal}
                cardDetail={cardData}
                columnDetail={columnData}
            />
        </>
    );
};
