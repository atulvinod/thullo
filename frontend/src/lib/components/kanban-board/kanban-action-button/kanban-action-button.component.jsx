import "./kanban-action-button.style.css";

export const KanbanActionButton = ({ label, onClick, icon }) => {
    return (
        <button
            onClick={onClick}
            className="kanban-action-button d-flex d-justify-content-space-between"
        >
            <span>{label}</span>
            {icon ? icon : <></>}
        </button>
    );
};
