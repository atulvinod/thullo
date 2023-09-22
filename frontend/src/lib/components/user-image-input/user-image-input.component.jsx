import "./user-image-input.style.css";
import "react-image-crop/dist/ReactCrop.css";
import { v4 as uuidv4 } from "uuid";

import cameraImg from "./camera.svg";
import { useRef, useState } from "react";
import Modal from "react-modal";
import { ReactCrop } from "react-image-crop";
import { Button } from "../button/button.component";
import { canvasPreview } from "./canvas-preview";
import { CustomModal } from "../custom-modal/custom-modal.component";

export const UserImageInput = ({ handleSetImage }) => {
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const backgroundRef = useRef(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState();
    const imageRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [aspect, setAspect] = useState(4 / 4);

    const handleClick = () => {
        // 👇️ open file input box on click of another element
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) {
            return;
        }
        setSelectedImage(URL.createObjectURL(fileObj));
        setModalIsOpen(true);
        event.target.value = null;
    };

    const getCroppedImage = () => {
        canvasPreview(imageRef.current, canvasRef.current, completedCrop);
        canvasRef.current.toBlob((blob) => {
            const blobURL = URL.createObjectURL(blob);
            backgroundRef.current.style.background = `url(${blobURL})`;
            const file = new File([blob], uuidv4(), { type: blob.type });
            if (handleSetImage) {
                handleSetImage(file);
                setModalIsOpen(false);
            }
        });
    };

    return (
        <div className="mt-2">
            <label htmlFor="">Image</label>
            <div
                className="user-image-input-container"
                onClick={handleClick}
                ref={backgroundRef}
                style={{
                    backgroundSize: "contain",
                }}
            >
                <input
                    type="file"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png"
                />
                <img src={cameraImg} alt="cameraImage" />
            </div>
            <CustomModal
                modalTitle={"Crop Image"}
                modalIsOpen={modalIsOpen}
                setModalIsOpen={setModalIsOpen}
            >
                <div className="crop-content-container">
                    <ReactCrop
                        aspect={aspect}
                        crop={crop}
                        onChange={(_, c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        style={{
                            marginTop: "5rem",
                        }}
                    >
                        <img
                            ref={imageRef}
                            src={selectedImage}
                            alt=""
                            className="cropped-image-preview"
                        />
                    </ReactCrop>
                    <div className="crop-preview-container">
                        <span>Preview Image</span>
                        <canvas ref={canvasRef} className="preview-canvas" />
                        <Button
                            label={"Crop Image & Save"}
                            onClick={getCroppedImage}
                        />
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};
