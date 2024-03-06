import { useRef } from "react";
import { PlusVector } from "../../../vectors/components/plus.vector";
import { BaseCardDetailContainer } from "../base-card-detail-container/base-card-detail-container.component";
import { Formik } from "formik";
import {
    addAttachmentToCard,
    deleteCardAttachment,
} from "../../../services/board.services";
import { useSelector } from "react-redux";
import { getCurrentBoard } from "../../../store/board";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { Button, ButtonTypes } from "../../button/button.component";
import * as moment from "moment";
import { useGlobalLoader } from "../../../hooks/xhr.hooks";

export const Attachments = ({ cardData, ...props }) => {
    const inputFileRef = useRef(null);
    const currentBoard = useSelector(getCurrentBoard);
    const refreshBoard = useRefreshBoard();
    const showGlobalLoader = useGlobalLoader();

    return (
        <BaseCardDetailContainer
            containerLabel={"Attachments"}
            showActionButton={true}
            actionButtonText={"Add"}
            actionButtonIcon={
                <PlusVector className="button-icon icon-color-grey" />
            }
            onActionButtonClick={() => inputFileRef.current.click()}
        >
            <Formik
                initialValues={{
                    attachment_file: "",
                }}
            >
                {({ values, handleChange, handleSubmit }) => (
                    <form>
                        <input
                            ref={inputFileRef}
                            style={{ display: "none" }}
                            type="file"
                            name="attachment_file"
                            value={values.attachment_file}
                            onChange={async (event) => {
                                const [file] = event.target.files;
                                showGlobalLoader(() =>
                                    addAttachmentToCard(
                                        currentBoard.board_id,
                                        cardData.card_id,
                                        file
                                    )
                                )
                                    .then((result) => {
                                        refreshBoard();
                                    })
                                    .catch((error) => {});
                            }}
                        />
                    </form>
                )}
            </Formik>
            {cardData.card_attachments ? (
                cardData.card_attachments.map((attachment) => (
                    <div
                        className="mt-27 d-flex d-flex-row"
                        key={attachment.id}
                    >
                        <div className="attachment-preview">
                            {attachment.attachment_type.includes("image") ? (
                                <img
                                    src={attachment.attachment_url}
                                    className="w-100"
                                />
                            ) : (
                                <span className="text-color-white">
                                    {attachment.attachment_type.split("/")[1]}
                                </span>
                            )}
                        </div>
                        <div className="ml-13">
                            <p className="fnt-8 fnt-wt-500 text-color-grey">
                                Added{" "}
                                {moment(attachment.created).format(
                                    "MMMM do, YYYY"
                                )}
                            </p>
                            <p className="fnt-10 fnt-wt-500">
                                {attachment.attachment_title}
                            </p>
                            <div className="d-flex mt-5">
                                <a
                                    href={attachment.attachment_url}
                                    download
                                    target="_blank"
                                    style={{
                                        textDecoration: "none",
                                    }}
                                >
                                    <Button
                                        buttonType={ButtonTypes.NOBG_OUTLINE}
                                        label={"Download"}
                                    />
                                </a>
                                <Button
                                    buttonClasses="ml-8"
                                    buttonType={ButtonTypes.NOBG_OUTLINE}
                                    label={"Delete"}
                                    onClick={async () => {
                                        try {
                                            await showGlobalLoader(() =>
                                                deleteCardAttachment(
                                                    currentBoard.board_id,
                                                    cardData.card_id,
                                                    attachment.id
                                                )
                                            );
                                            refreshBoard();
                                        } catch (error) {}
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>No Attachments</p>
            )}
        </BaseCardDetailContainer>
    );
};
