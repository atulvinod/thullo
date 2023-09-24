import { useSelector } from "react-redux";
import { currentUserSelector } from "../../../store";
import { Button, ButtonTypes } from "../../button/button.component";
import { ProfileImage } from "../../profile-image/profile-image.component";
import * as moment from "moment";
import { useXHR } from "../../../hooks/xhr.hooks";
import { deleteComment, updateComment } from "../../../services/board.services";
import { getCurrentBoard } from "../../../store/board";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { useRef, useState } from "react";
import { Formik } from "formik";

export const Comment = ({ card_id, comment, ...props }) => {
    const user = useSelector(currentUserSelector);
    const currentBoard = useSelector(getCurrentBoard);
    const refreshBoard = useRefreshBoard();
    const [isEditMode, setIsEditMode] = useState(false);
    const xhr = useXHR();

    const handleDelete = async () => {
        try {
            await xhr(
                () => deleteComment(currentBoard.board_id, card_id, comment.id),
                "Comment deleted"
            );
            refreshBoard();
        } catch (error) {}
    };

    return (
        <div className="mt-25">
            <div className="d-flex d-justify-content-space-between">
                <ProfileImage
                    image_url={comment.image_url}
                    name={comment.name}
                    showUserName={true}
                    subText={`${moment(comment.created).format(
                        "do MMM"
                    )} at ${moment(comment.created).format("hh:mm")}`}
                />

                {comment.user_id == user.id && (
                    <div className="d-flex d-align-items-center">
                        <Button
                            label={"Edit"}
                            buttonType={ButtonTypes.NOBG}
                            onClick={() => {
                                setIsEditMode(true);
                            }}
                        />

                        <Button
                            label={"Delete"}
                            buttonType={ButtonTypes.NOBG}
                            onClick={handleDelete}
                        />
                    </div>
                )}
            </div>

            <div className="mt-13">
                {!isEditMode ? (
                    <p className="fnt-wt-400 fnt-14 text-color-darkgrey">
                        {comment.comment}
                    </p>
                ) : (
                    <Formik
                        initialValues={{
                            comment: comment.comment,
                        }}
                        onSubmit={async (values) => {
                            try {
                                await xhr(() =>
                                    updateComment(
                                        currentBoard.board_id,
                                        card_id,
                                        comment.id,
                                        values.comment
                                    )
                                );
                                setIsEditMode(false);
                                refreshBoard();
                            } catch (error) {}
                        }}
                    >
                        {({ values, handleChange, handleSubmit }) => (
                            <form>
                                <div className="comment-input">
                                    <textarea
                                        className="w-100 edit-comment"
                                        name="comment"
                                        value={values.comment}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <div className="d-flex mt-2">
                                    <Button
                                        buttonType={ButtonTypes.SUCCESS}
                                        label={"Update"}
                                        onClick={handleSubmit}
                                    />
                                    <Button
                                        buttonType={ButtonTypes.NOBG}
                                        label={"Cancel"}
                                        onClick={() => setIsEditMode(false)}
                                    />
                                </div>
                            </form>
                        )}
                    </Formik>
                )}
            </div>
        </div>
    );
};
