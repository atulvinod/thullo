import { useEffect, useState } from "react";
import { CloseVector } from "../../vectors/components/close.vector";
import { Button, ButtonTypes } from "../button/button.component";
import { InfoLabel } from "../info-label/info-label.component";
import { ProfileImage } from "../profile-image/profile-image.component";
import "./menu-modal.style.css";
import Modal from "react-modal";
import { PencilVector } from "../../vectors/components/pencil.vector";
import { Formik } from "formik";
import {
    deleteBoardMember,
    updateBoardDescription,
} from "../../services/board.services";
import { useRefreshBoard } from "../kanban-board/hooks/use-refresh-board.hook";
import { Description } from "../kanban-board/description/description.component";
import { useSelector } from "react-redux";
import { getCurrentBoard } from "../../store/board";
import moment from "moment";
import { ProfileCircle } from "../../vectors/components/profile-circle.vector";
import { DocumentVector } from "../../vectors/components/document.vector";
import { useGlobalLoader } from "../../hooks/xhr.hooks";

export const MenuModal = ({
    setModalIsOpen,
    isModalOpen,
    adminUser,
    ...props
}) => {
    const refreshBoard = useRefreshBoard();
    const currentBoard = useSelector(getCurrentBoard);
    const showGlobalLoader = useGlobalLoader();
    return (
        <>
            {isModalOpen ? (
                <div className="menu-modal-container">
                    <div className="menu-modal-header d-flex d-justify-content-space-between d-align-items-center">
                        <span>Menu</span>
                        <Button
                            onClick={() => setModalIsOpen(false)}
                            buttonType={ButtonTypes.NOBG}
                            icon={
                                <CloseVector
                                    className="
    button-icon"
                                ></CloseVector>
                            }
                        />
                    </div>
                    <div className="mt-9">
                        <InfoLabel
                            labelText={"Made By"}
                            icon={<ProfileCircle className="info-label-icon" />}
                        />
                        <div className="mt-13">
                            <ProfileImage
                                name={adminUser.board_member_name}
                                image_url={adminUser.image_url}
                                showUserName={true}
                                subText={`on ${moment(
                                    currentBoard.created_on
                                ).format("do MMM, yyyy")}`}
                            />
                        </div>
                        <Description />
                        <div className="mt-20">
                            <InfoLabel
                                labelText={"Team"}
                                icon={
                                    <DocumentVector className="info-label-icon icon-color-grey" />
                                }
                            />
                            <div className="mt-13"></div>
                            {currentBoard.board_members.map((member) => (
                                <div className="d-flex d-justify-content-space-between mt-18">
                                    <ProfileImage
                                        name={member.board_member_name}
                                        image_url={
                                            member.board_member_image_url
                                        }
                                        showUserName={true}
                                    />

                                    <Button
                                        label={
                                            adminUser.board_member_id ==
                                            member.board_member_id
                                                ? "Admin"
                                                : "Remove"
                                        }
                                        buttonType={
                                            adminUser.board_member_id ==
                                            member.board_member_id
                                                ? ButtonTypes.NOBG
                                                : ButtonTypes.DANGER_OUTLINE
                                        }
                                        onClick={async () => {
                                            try {
                                                if (
                                                    adminUser.board_member_id ==
                                                    member.board_member_id
                                                ) {
                                                    return;
                                                }
                                                await showGlobalLoader(() =>
                                                    deleteBoardMember(
                                                        currentBoard.board_id,
                                                        member.board_member_id
                                                    )
                                                );
                                                refreshBoard();
                                            } catch (error) {}
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </>
    );
};
