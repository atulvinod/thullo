import "./board-card.style.css";
import { useNavigate } from "react-router-dom";
import { ProfileImage } from "../profile-image/profile-image.component";
import { useDispatch } from "react-redux";
import { fetchCurrentBoard } from "../../store/board";
import { take } from "lodash";
import { Lock } from "lucide-react";

export const BoardCard = ({ boardData }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const goToBoard = () => {
        dispatch(fetchCurrentBoard(boardData.board_id));
        navigate(`boards/${boardData.board_id}`);
    };
    return (
        <div className="board-card-container" onClick={goToBoard}>
            <div className="board-image-container">
                {boardData.cover_url ? (
                    <img src={boardData.cover_url} alt="" />
                ) : (
                    <div className="no-cover-image-container d-flex w-100 h-100 d-align-items-center d-justify-content-center">
                        <span>No Cover Image</span>
                    </div>
                )}
            </div>
            <span className="my-12 board-card-heading">
                {boardData.board_title}{" "}
                {boardData.is_private && <Lock size={12} className="ml-5" />}
            </span>
            <div className="d-flex d-align-items-center">
                {take(boardData.members, 3).map((member) => (
                    <div className="mr-11" key={member.board_member_user_id}>
                        <ProfileImage
                            key={member.board_member_user_id}
                            image_url={member.board_member_image_url}
                            name={member.board_member_name}
                        />
                    </div>
                ))}
                {boardData.members.length > 3 ? (
                    <span className="text-color-grey">
                        +{boardData.members.length - 3} members{" "}
                    </span>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};
