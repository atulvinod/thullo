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
import { KanbanActionPopup } from "../action-popup/action-popup.component";
import { AddLabel } from "./add-label.component";
import { AddCover } from "./add-cover.component";
import { LabelVector } from "../../../vectors/components/label.vector";
import { ProfileCircle } from "../../../vectors/components/profile-circle.vector";

export const CardDetailModal = ({
    setModalIsOpen,
    isModalOpen,
    cardDetail,
    columnDetail,
}) => {
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
                                <AddCover cardDetail={cardDetail} />
                                <AddLabel cardDetail={cardDetail} />
                            </div>
                        </div>
                        <div className="card-detail-members mt-20">
                            <InfoLabel
                                labelText={"Members"}
                                icon={
                                    <LabelVector className="info-label-icon icon-color-grey" />
                                }
                            />
                            {cardDetail.card_members.map((member) => (
                                <div className="mt-16">
                                    <ProfileImage
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
                    </div>
                </div>
            </div>
        </Modal>
    );
};
