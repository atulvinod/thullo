import { Formik } from "formik";
import { FormInput } from "../../form-input/form-input.component";
import { CustomModal } from "../../custom-modal/custom-modal.component";
import { Button, ButtonTypes } from "../../button/button.component";

export const CreateColumnModal = ({
    showCreateColumnModal,
    setShowCreateColumnModal,
    onSuccess,
    onSubmit,
    columnTitle = "",
    maxColumnOrderIndex = 0,
}) => {
    return (
        <CustomModal
            modalIsOpen={showCreateColumnModal}
            setModalIsOpen={setShowCreateColumnModal}
            modalTitle={columnTitle ? "Update list name" : "Create list"}
            modalStyles={{
                content: {
                    width: "50rem",
                    left: "50%",
                    transform: "translate(-50%)",
                    height: "fit-content",
                },
            }}
        >
            <Formik
                initialValues={{
                    column_title: columnTitle,
                }}
                validate={(values) => {
                    const errors = {};
                    if (!values.column_title || !values.column_title?.length) {
                        errors.column_title = "Required";
                    }
                    return errors;
                }}
                onSubmit={async (values, { isSubmitting }) => {
                    await onSubmit(values.column_title, ++maxColumnOrderIndex);
                    onSuccess();
                    setShowCreateColumnModal(false);
                }}
            >
                {({
                    isLoading,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    errors,
                    values,
                    touched,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <FormInput
                            placeholder={"List name"}
                            value={values.column_title}
                            name="column_title"
                            errors={
                                errors.column_title &&
                                touched.column_title &&
                                errors.column_title
                            }
                            onChange={handleChange}
                        />
                        <div className="d-flex d-justify-content-flex-end mt-21">
                            <Button
                                label={"Cancel"}
                                buttonType={ButtonTypes.NOBG}
                                onClick={() => setShowCreateColumnModal(false)}
                            />
                            <Button
                                label={columnTitle ? "Update" : "Create"}
                                type={"submit"}
                                onClick={handleSubmit}
                            />
                        </div>
                    </form>
                )}
            </Formik>
        </CustomModal>
    );
};
