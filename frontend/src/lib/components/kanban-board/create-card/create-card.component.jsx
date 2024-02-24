import "./create-card.style.css";

import { Formik } from "formik";
import { Button, ButtonTypes } from "../../button/button.component";
import { toast } from "react-toastify";
export const CreateCard = ({
    onCreateCard,
    index,
    boardId,
    columnId,
    deleteCard,
}) => {
    return (
        <div className="create-card-component">
            <Formik
                initialValues={{
                    card_name: "",
                    board_id: boardId,
                    column_id: columnId,
                }}
                onSubmit={(values) => {
                    if (!values.card_name || !values.card_name.length) {
                        toast.error("Card name is required");
                        return;
                    }
                    onCreateCard(values, index);
                }}
            >
                {({ handleChange, values, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <textarea
                            rows={1}
                            type="text"
                            value={values.card_name}
                            onChange={(event) => {
                                let target = event.target;
                                target.style.height = "1px";
                                target.style.height =
                                    target.scrollHeight + "px";
                                handleChange(event);
                            }}
                            className="create-card-form-input"
                            placeholder="Enter a title for the card..."
                            name="card_name"
                        />
                        <div className="mt-21 d-flex">
                            <Button
                                buttonType={ButtonTypes.SUCCESS}
                                onClick={handleSubmit}
                                label={"Save"}
                            />
                            <Button
                                buttonType={ButtonTypes.NOBG}
                                onClick={deleteCard}
                                label={"Cancel"}
                            />
                        </div>
                    </form>
                )}
            </Formik>
        </div>
    );
};
