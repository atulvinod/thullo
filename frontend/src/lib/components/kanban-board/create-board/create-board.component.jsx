import "./create-board.style.css";
import { FormInput } from "../../form-input/form-input.component";
import { Button, ButtonTypes } from "../../button/button.component";
import { useRef, useState } from "react";
import { createBoardAction, fetchBoards } from "../../../store/board";
import { useDispatch } from "react-redux";
import { Formik } from "formik";
import { createBoard } from "../../../services/board.services";
import { useGlobalLoader } from "../../../hooks/xhr.hooks";

export const CreateBoard = ({ setModalIsOpen }) => {
    const coverImageInputRef = useRef(null);
    const isPrivateCheckboxRef = useRef(null);

    const [previewImage, setPreviewImage] = useState(null);
    const dispatch = useDispatch();
    const showGlobalLoader = useGlobalLoader();

    const buttonStyle = {
        width: "50%",
        margin: "0 1rem",
    };

    return (
        <div className="create-board-container">
            <Formik
                initialValues={{
                    board_title: null,
                    is_private: false,
                    cover_image: null,
                }}
                validate={(values) => {
                    const errors = {};
                    if (!values.board_title) {
                        errors.board_title = "Board title is required";
                    }
                    return errors;
                }}
                onSubmit={async (values, { isSubmitting }) => {
                    try {
                        await showGlobalLoader(() => createBoard(values));
                        dispatch(fetchBoards());
                        setModalIsOpen(false);
                    } catch (error) {}
                }}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="cover-preview-container">
                            {values.cover_image ? (
                                <img src={previewImage} />
                            ) : (
                                <div className="no-preview-container d-flex d-justify-content-center d-align-items-center w-100 h-100">
                                    <span>No preview</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-21">
                            <FormInput
                                placeholder={"Add board title"}
                                value={values.board_title}
                                name="board_title"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                errors={
                                    errors &&
                                    touched.board_title &&
                                    errors.board_title
                                }
                            />
                        </div>
                        <div className="d-flex d-flex-direction-row mt-21">
                            <input
                                type="file"
                                accept="image/png"
                                style={{ display: "none" }}
                                ref={coverImageInputRef}
                                onChange={(event) => {
                                    const [file] = event.target.files;
                                    setPreviewImage(URL.createObjectURL(file));
                                    values.cover_image = file;
                                }}
                                name="cover_image"
                            />
                            <Button
                                label={"Cover"}
                                buttonType={ButtonTypes.SECONDARY}
                                buttonStyle={buttonStyle}
                                onClick={() =>
                                    coverImageInputRef.current.click()
                                }
                            />
                            <input
                                type="checkbox"
                                style={{ display: "none" }}
                                value={values.is_private}
                                name="is_private"
                                onChange={handleChange}
                                ref={isPrivateCheckboxRef}
                            />
                            <Button
                                label={"Is Private Board"}
                                buttonType={
                                    values.is_private
                                        ? ButtonTypes.PRIMARY
                                        : ButtonTypes.SECONDARY
                                }
                                buttonStyle={buttonStyle}
                                onClick={() => {
                                    isPrivateCheckboxRef.current.click();
                                }}
                            />
                        </div>
                        <div className="d-flex d-flex-direction-row d-justify-content-flex-end mt-21">
                            <Button
                                label={"Cancel"}
                                buttonType={ButtonTypes.NOBG}
                                onClick={() => setModalIsOpen(false)}
                            />
                            <Button
                                label={"Create"}
                                type="submit"
                                onClick={handleSubmit}
                            />
                        </div>
                    </form>
                )}
            </Formik>
        </div>
    );
};
