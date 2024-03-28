import "./allboards.style.css";
import { withAuthGuard } from "../../components/route-guard/route-guard.component";
import { Button } from "../../components/button/button.component";
import { useEffect, useState } from "react";
import { CustomModal } from "../../components/custom-modal/custom-modal.component";
import { CreateBoard } from "../../components/kanban-board/create-board/create-board.component";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBoards,
    getAllBoards,
    getBoardsIsLoading,
} from "../../store/board";
import { BoardCard } from "../../components/board-card/board-card.component";
import { MoonLoader as Loader } from "react-spinners";
import { PlusVector } from "../../vectors/components/plus.vector";
import AppLoader from "../../components/app-loader/app-loader";

const AllBoardsPage = () => {
    const [isModalOpen, setModalIsOpen] = useState(false);
    const allBoards = useSelector(getAllBoards);
    const isLoading = useSelector(getBoardsIsLoading);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchBoards());
    }, []);

    return (
        <>
            <div className="all-boards-page-container h-100">
                <div className="all-boards-heading-container d-flex d-flex-direction-row w-100 d-justify-content-space-between">
                    <span className="all-boards-heading">All boards</span>
                    <Button
                        label={"Add board"}
                        onClick={() => setModalIsOpen(!isModalOpen)}
                        icon={
                            <PlusVector className="button-icon icon-color-white" />
                        }
                    />
                </div>
                {isLoading ? (
                    <div className="d-flex d-justify-content-center w-100 d-align-items-center all-boards-loader-container">
                        <AppLoader />
                    </div>
                ) : (
                    <div className="all-boards-cards-container">
                        {allBoards.length ? (
                            allBoards.map((boardData) => (
                                <BoardCard
                                    key={boardData.board_id}
                                    boardData={boardData}
                                />
                            ))
                        ) : (
                            <p>No boards available</p>
                        )}
                    </div>
                )}
            </div>
            <CustomModal
                modalIsOpen={isModalOpen}
                modalTitle={"Create new board"}
                setModalIsOpen={setModalIsOpen}
                modalStyles={{
                    content: {
                        width: "50rem",
                        left: "50%",
                        transform: "translate(-50%)",
                        height: "fit-content",
                    },
                }}
            >
                <CreateBoard setModalIsOpen={setModalIsOpen} />
            </CustomModal>
        </>
    );
};

export default withAuthGuard(AllBoardsPage);
