import { useDispatch, useSelector } from "react-redux"
import { fetchCurrentBoard, getCurrentBoard } from "../../../store/board"

export const useRefreshBoard = () => {
    const currentBoard = useSelector(getCurrentBoard);
    const dispatch = useDispatch();
    return () => {
        dispatch(fetchCurrentBoard(currentBoard.board_id, false))
    }
}