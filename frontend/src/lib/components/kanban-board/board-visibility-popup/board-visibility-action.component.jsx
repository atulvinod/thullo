import "./board-visibility.style.css";

export const BoardVisibilityActionComponent = ({
    isSelected,
    icon,
    heading,
    subHeading,
    onClick,
    ...props
}) => {
    return (
        <div
            className={`board-visibility-action-container ${
                isSelected ? "visibility-selected" : ""
            }`}
            onClick={onClick}
            {...props}
        >
            <div>
                <span>{icon}</span>
                <span className="visibility-heading">{heading}</span>
            </div>
            <p className="visibility-subheading">{subHeading}</p>
        </div>
    );
};
