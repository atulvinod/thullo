import { MoreHorizVector } from "../../vectors/components/morehoriz.vector";
import "./button.style.css";

export const ButtonTypes = {
    PRIMARY: "PRIMARY",
    SECONDARY: "SECONDARY",
    NOBG: "NOBG",
    DANGER_OUTLINE: "DANGER_OUTLINE",
    NOBG_OUTLINE: "NOBG_OUTLINE",
    SUCCESS:"SUCCESS"
};

export const Button = ({
    label,
    onClick,
    type = "button",
    buttonType = ButtonTypes.PRIMARY,
    buttonStyle = {},
    buttonClasses = "",
    icon,
    ...props
}) => {
    const ButtonTypeClasses = {
        [ButtonTypes.NOBG]: "button button-nobg d-flex",
        [ButtonTypes.PRIMARY]: "button button-primary d-flex",
        [ButtonTypes.SECONDARY]: "button button-secondary d-flex",
        [ButtonTypes.DANGER_OUTLINE]: "button button-danger-outline d-flex",
        [ButtonTypes.NOBG_OUTLINE]: "button button-nobg-outline d-flex",
        [ButtonTypes.SUCCESS]: "button button-success d-flex",
    };
    return (
        <button
            onClick={onClick}
            className={`${ButtonTypeClasses[buttonType]} ${
                icon && !label ? "only-icon-padding" : "icon-and-label-padding"
            } ${buttonClasses}`}
            type={type}
            style={{ ...buttonStyle }}
            {...props}
        >
            {icon ? icon : <></>}
            {label ? (
                <span
                    style={{ marginLeft: icon ? "0.75rem" : "0" }}
                    className="fnt-wt-500 fnt-12"
                >
                    {label}
                </span>
            ) : (
                <></>
            )}
        </button>
    );
};
