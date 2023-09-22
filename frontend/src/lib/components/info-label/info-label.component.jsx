import "./info-label.style.css";

export const InfoLabel = ({ labelText, icon }) => {
    return (
        <div className="d-flex info-label">
            {icon ? (
                <span className="mr-5 info-label-icon">{icon}</span>
            ) : (
                <></>
            )}
            <span>{labelText}</span>
        </div>
    );
};
