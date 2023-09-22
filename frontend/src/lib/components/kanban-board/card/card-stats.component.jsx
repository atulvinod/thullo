export const CardStats = ({ icon, text }) => {
    return (
        <div className="d-flex d-flex-dir-row h-100 d-align-items-center">
            <span
                className="w-12 h-12 icon-color-grey"
                style={{ marginRight: "0.5rem" }}
            >
                {icon}
            </span>
            <span className="text-color-grey fnt-10">{text}</span>
        </div>
    );
};
