import { KanbanBoard } from "../../components/kanban-board/board/kanban-board.component";
import { withAuthGuard } from "../../components/route-guard/route-guard.component";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const BoardsPage = () => {
    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <KanbanBoard />
            </DndProvider>
        </>
    );
};

export default withAuthGuard(BoardsPage);
