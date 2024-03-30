import "./card-detail-modal.style.css";
import { CloseVector } from "../../../vectors/components/close.vector";
import { Button, ButtonTypes } from "../../button/button.component";
import Modal from "react-modal";
import { KanbanActionButton } from "../kanban-action-button/kanban-action-button.component";
import { PlusVector } from "../../../vectors/components/plus.vector";
import { Description } from "../description/description.component";
import { InfoLabel } from "../../info-label/info-label.component";
import { ProfileImage } from "../../profile-image/profile-image.component";
import { CommentsSection } from "./comments-section.component";
import { AssignUsersToCard } from "../card/assign-users.component";
import { Attachments } from "./attachments.component";
import { AddLabel } from "./add-label.component";
import { AddCover } from "./add-cover.component";
import { LabelVector } from "../../../vectors/components/label.vector";
import { ProfileCircle } from "../../../vectors/components/profile-circle.vector";
import { TagRow } from "../../tag-row/tag-row.component";
import { currentUserSelector } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { deleteCard, getCurrentBoard } from "../../../store/board";
import {
    addCoverToCard,
    deleteCardRequest,
} from "../../../services/board.services";
import { toast } from "react-toastify";

export const CardDetailModal = ({
    setModalIsOpen,
    isModalOpen,
    cardDetail,
    columnDetail,
}) => {
    const user = useSelector(currentUserSelector);
    const currentBoard = useSelector(getCurrentBoard);
    const dispatch = useDispatch();

    const deleteCurrentCard = async () => {
        try {
            const confirm = window.confirm(
                "Are you sure you want to delete this card?"
            );
            if (confirm) {
                toast.info("Deleting card");
                await deleteCardRequest(
                    currentBoard.board_id,
                    cardDetail.card_id
                );
                dispatch(
                    deleteCard(columnDetail.column_id, cardDetail.card_id)
                );
                setModalIsOpen(false);
                toast.success("Card deleted");
            }
        } catch (e) {
            toast.error("Failed to delete the card");
        }
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setModalIsOpen(false)}
            style={{
                content: {
                    width: "46%",
                    transform: "translate(-50%)",
                    left: "50%",
                },
            }}
        >
            <div className="card-detail-modal">
                <div className="card-detail-modal-head">
                    <div className="card-detail-close">
                        <Button
                            onClick={() => setModalIsOpen(false)}
                            icon={
                                <CloseVector className="button-icon icon-color-white" />
                            }
                        />
                    </div>
                    <div
                        className="card-cover-image-container"
                        style={{
                            height: "13rem",
                            backgroundSize: "cover",
                            background: `${
                                cardDetail.cover_image_url
                                    ? `url(${cardDetail.cover_image_url})`
                                    : "lightgrey"
                            }`,
                        }}
                    ></div>
                </div>
                <div className="card-detail-modal-content">
                    <div className="card-detail">
                        <div className="card-detail-title">
                            <p className="fnt-16 fnt-wt-400">
                                {cardDetail.card_name}
                            </p>
                            <p>
                                <span className="card-detail-list-tag fnt-10 fnt-wt-600">
                                    In list{" "}
                                </span>
                                <span className="fnt-10 fnt-wt-600 card-detail-column-tag">
                                    {columnDetail.column_name}
                                </span>
                            </p>
                            <div className={"mt-10"}>
                                <TagRow tags={cardDetail.card_labels} />
                            </div>
                        </div>
                        <div className="mt-24">
                            <Description description={cardDetail.description} />
                        </div>
                        <div className="mt-24">
                            <Attachments cardData={cardDetail} />
                        </div>
                        <div className="mt-24">
                            <CommentsSection cardData={cardDetail} />
                        </div>
                    </div>
                    <div className="card-detail-subdetail">
                        <div className="card-detail-actions">
                            <InfoLabel
                                labelText={"Actions"}
                                icon={
                                    <ProfileCircle className="info-label-icon" />
                                }
                            />
                            <div className="mt-20">
                                <AddCover
                                    cardDetail={cardDetail}
                                    addCover={(cover_image_url) =>
                                        addCoverToCard(
                                            currentBoard.board_id,
                                            cardDetail.card_id,
                                            cover_image_url
                                        )
                                    }
                                />
                                <AddLabel cardDetail={cardDetail} />
                                <div className="mt-10"></div>
                            </div>
                        </div>
                        <div className="card-detail-members mt-20">
                            <InfoLabel
                                labelText={"Members"}
                                icon={
                                    <LabelVector className="info-label-icon icon-color-grey" />
                                }
                            />
                            {cardDetail.card_members.map((member, index) => (
                                <div className="mt-16" key={index}>
                                    <ProfileImage
                                        key={member.member_id}
                                        showUserName={true}
                                        image_url={member.image_url}
                                        name={member.name}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-20">
                            <AssignUsersToCard
                                cardData={cardDetail}
                                trigger={
                                    <div>
                                        <KanbanActionButton
                                            label={"Assign a member"}
                                            icon={
                                                <PlusVector className="button-icon" />
                                            }
                                        />
                                    </div>
                                }
                            />
                        </div>
                        {currentBoard.created_by_user_id === user.id && (
                            <div className="mt-full">
                                <Button
                                    onClick={deleteCurrentCard}
                                    label={"Delete card"}
                                    buttonType={ButtonTypes.DANGER_OUTLINE}
                                    buttonClasses={
                                        "w-100 d-justify-content-center"
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
