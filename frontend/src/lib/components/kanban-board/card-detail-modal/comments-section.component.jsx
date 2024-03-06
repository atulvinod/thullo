import { useSelector } from "react-redux";
import { Button, ButtonTypes } from "../../button/button.component";
import { currentUserSelector } from "../../../store";
import { ProfileImage } from "../../profile-image/profile-image.component";
import { Formik } from "formik";
import { getCurrentBoard } from "../../../store/board";
import { addCommentToCard } from "../../../services/board.services";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { useGlobalLoader } from "../../../hooks/xhr.hooks";
import { Comment } from "./comment.component";

export const CommentsSection = ({ cardData }) => {
    const user = useSelector(currentUserSelector);
    const currentBoard = useSelector(getCurrentBoard);
    const refreshBoard = useRefreshBoard();
    const showGlobalLoader = useGlobalLoader();

    return (
        <div>
            <div className="comment-input-container app-component-container p-13">
                <Formik
                    initialValues={{
                        comment: "",
                    }}
                    onSubmit={async (values) => {
                        try {
                            const { comment } = values;
                            showGlobalLoader(() =>
                                addCommentToCard(
                                    currentBoard.board_id,
                                    cardData.card_id,
                                    comment
                                )
                            );
                            refreshBoard();
                        } catch (error) {}
                    }}
                >
                    {({ values, handleChange, handleSubmit, errors }) => (
                        <form>
                            <div className="comment-input d-flex">
                                <ProfileImage
                                    name={user.name}
                                    image_url={user.image_url}
                                />
                                <textarea
                                    name="comment"
                                    value={values.comment}
                                    onChange={handleChange}
                                    placeholder="Write a comment"
                                    className="ml-10"
                                ></textarea>
                            </div>
                            <div className="d-flex d-justify-content-flex-end mt-20">
                                <Button label={"Save"} onClick={handleSubmit} />
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
            <div>
                {cardData.card_comments.map((comment) => (
                    <Comment
                        comment={comment}
                        card_id={cardData.card_id}
                        key={comment.id}
                    />
                ))}
            </div>
        </div>
    );
};
