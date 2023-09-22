import "./custom-modal.style.css";
import Modal from "react-modal";
import { Button } from "../button/button.component";
import { CloseVector } from "../../vectors/components/close.vector";

export const CustomModal = ({
    modalTitle,
    modalIsOpen,
    setModalIsOpen,
    children,
    modalClasses,
    modalStyles,
}) => {
    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            className={modalClasses}
            style={modalStyles}
        >
            <div className="modal-content">
                <div className="modal-controls">
                    <h1>{modalTitle}</h1>
                    <Button
                        onClick={() => setModalIsOpen(false)}
                        icon={
                            <CloseVector className="button-icon icon-color-white" />
                        }
                    />
                </div>
                <div style={{ marginTop: "20px", flex: "1" }}>{children}</div>
            </div>
        </Modal>
    );
};
