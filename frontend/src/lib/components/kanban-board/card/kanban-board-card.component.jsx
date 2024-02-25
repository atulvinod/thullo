import "./kanban-board-card.style.css";
import { useDrag } from "react-dnd";
import { DragItemTypes } from "../../../utils/drag.types";
import { Button } from "../../button/button.component";
import { PlusVector } from "../../../vectors/components/plus.vector";
import { useState } from "react";
import { ProfileImage } from "../../profile-image/profile-image.component";
import { CardDetailModal } from "../card-detail-modal/card-detail-modal.component";
import { AssignUsersToCard } from "./assign-users.component";
import { CardStats } from "./card-stats.component";
import { MessageVector } from "../../../vectors/components/message.vector";
import { AttachmentVector } from "../../../vectors/components/attachment.vector";
import { TagRow } from "../../tag-row/tag-row.component";
import * as _ from "lodash";
import { MoonLoader as Loader } from "react-spinners";
import { useSelector } from "react-redux";
import { getCardBeingProcessed } from "../../../store/board";

export const KanbanBoardCard = ({ cardData, columnData }) => {
    const [showCardDetailModal, setShowCardDetailModal] = useState(false);
    const cardBeingProcessed = useSelector(getCardBeingProcessed);

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
                    <div>
                        {cardBeingProcessed == cardData.card_id ? (
                            <div className="mt-27">
                                <Loader size={22} color="blue" />
                            </div>
                        ) : (
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
                                {/* card info div */}
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
                                                text={
                                                    cardData.card_comments
                                                        .length
                                                }
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
                                            text={
                                                cardData.card_attachments.length
                                            }
                                        />
                                    ) : (
                                        <></>
                                    )}
                                    {cardBeingProcessed == cardData.card_id && (
                                        <Loader size={22} color="blue" />
                                    )}
                                </div>
                            </div>
                        )}
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
