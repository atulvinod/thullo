import "./form-input-with-action.style.css";

import { Button } from "../button/button.component";

export const FormInputWithAction = ({
    buttonIcon,
    placeHolder,
    buttonText,
    onButtonClick,
    onInputChange,
    value,
    ...props
}) => {
    return (
        <div className="form-input-with-action-container">
            <input
                value={value}
                type="text"
                placeholder={placeHolder}
                className="form-input-with-action-input"
                onChange={onInputChange}
            />
            <Button
                label={buttonText}
                icon={buttonIcon}
                onClick={onButtonClick}
            />
        </div>
    );
};
