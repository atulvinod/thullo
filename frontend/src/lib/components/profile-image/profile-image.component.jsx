import Popup from "reactjs-popup";
import "./profile-image.style.css";

export const ProfileImage = ({
    name,
    image_url,
    showUserName = false,
    subText,
}) => {
    const getUserInitials = (name) => {
        const [firstLetter, secondLetter] = name
            .split(" ")
            .map((n) => n.substring(0, 1).toUpperCase());
        return firstLetter + (secondLetter ? secondLetter : "");
    };

    return (
        <div className="d-flex d-align-items-center">
            <Popup
                trigger={
                    <div className="d-flex d-align-items-center">
                        <div className="profile-image-container">
                            {image_url ? (
                                <img
                                    src={image_url}
                                    alt=""
                                    className="profile-image"
                                />
                            ) : (
                                <div className="user-initials-container">
                                    <span className="fnt-12 user-initials">
                                        {getUserInitials(name)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                }
                on={"hover"}
            >
                <span className="profile-image-tooltip">{name}</span>
            </Popup>
            <div>
                {showUserName ? (
                    <div className="ml-10">
                        <span className="fnt-12 fnt-wt-600">{name}</span>
                        <p className="text-color-grey fnt-wt-500 fnt-10">
                            {subText}
                        </p>
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};
