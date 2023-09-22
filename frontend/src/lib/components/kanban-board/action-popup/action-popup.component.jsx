import Popup from "reactjs-popup";
import "./action-popup.style.css";

export const KanbanActionPopup = ({
    heading,
    subHeading,
    trigger,
    children,
}) => {
    return (
        <Popup trigger={trigger} on={"click"} position={"bottom left"}>
            <div className="kanban-action-popup">
                <span className="fnt-12 fnt-wt-600">{heading}</span>
                <span className="text-color-grey">{subHeading}</span>
                <div className="mt-13">{children}</div>
            </div>
        </Popup>
    );
};
