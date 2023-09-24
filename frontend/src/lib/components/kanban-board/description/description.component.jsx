import { useSelector } from "react-redux";
import { getCurrentBoard } from "../../../store/board";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { useState } from "react";
import { InfoLabel } from "../../info-label/info-label.component";
import { Formik } from "formik";
import { Button, ButtonTypes } from "../../button/button.component";
import { PencilVector } from "../../../vectors/components/pencil.vector";
import { updateBoardDescription } from "../../../services/board.services";
import { BaseCardDetailContainer } from "../base-card-detail-container/base-card-detail-container.component";
import { useXHR } from "../../../hooks/xhr.hooks";

export const Description = ({ description, ...props }) => {
    const currentBoard = useSelector(getCurrentBoard);
    const [isEditMode, setEditMode] = useState(false);
    const refreshBoard = useRefreshBoard();
    const xhr = useXHR();

    return (
        <BaseCardDetailContainer
            containerLabel={"Description"}
            showActionButton={!isEditMode}
            actionButtonText={"Edit"}
            onActionButtonClick={() => setEditMode(true)}
            actionButtonIcon={
                <PencilVector className="button-icon icon-color-grey" />
            }
        >
            {isEditMode ? (
                <Formik
                    initialValues={{
                        description: currentBoard.description,
                    }}
                    onSubmit={async (values, { isSubmitting }) => {
                       try {
                           await xhr(() =>
                               updateBoardDescription(
                                   currentBoard.board_id,
                                   values.description
                               )
                           );
                           refreshBoard();
                           setEditMode(false);
                       } catch (error) {}
                    }}
                >
                    {({
                        values,
                        errors,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                    }) => (
                        <form>
                            <textarea
                                name="description"
                                onChange={handleChange}
                                value={values.description}
                                className="w-100"
                            ></textarea>
                            <div className="d-flex mt-13">
                                <Button
                                    label={"Save"}
                                    buttonType={ButtonTypes.SUCCESS}
                                    onClick={handleSubmit}
                                />
                                <Button
                                    label={"Cancel"}
                                    buttonType={ButtonTypes.NOBG}
                                    onClick={() => setEditMode(false)}
                                />
                            </div>
                        </form>
                    )}
                </Formik>
            ) : (
                <div>
                    {currentBoard.description ? (
                        <p>{currentBoard.description}</p>
                    ) : (
                        <p>No description</p>
                    )}
                </div>
            )}
        </BaseCardDetailContainer>
    );
};
