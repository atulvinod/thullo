import { useState } from "react";
import { Button, ButtonTypes } from "../../button/button.component";
import { FormInput } from "../../form-input/form-input.component";
import { KanbanActionPopup } from "../action-popup/action-popup.component";
import { InfoLabel } from "../../info-label/info-label.component";
import { Tag } from "../../tag/tag.component";
import { addLabelToCard } from "../../../services/board.services";
import { useSelector } from "react-redux";
import { getCurrentBoard } from "../../../store/board";
import { useRefreshBoard } from "../hooks/use-refresh-board.hook";
import { TagRow } from "../../tag-row/tag-row.component";
import { LabelVector } from "../../../vectors/components/label.vector";
import { useXHR } from "../../../hooks/xhr.hooks";

export const AddLabel = ({ cardDetail }) => {
    const currentBoard = useSelector(getCurrentBoard);
    const refreshBoard = useRefreshBoard();
    const xhr = useXHR();

    const colors = [
        "#219653",
        "#f2c94c",
        "#f2994a",
        "#eb5757",
        "#2f80ed",
        "#56ccf2",
        "#6fcf97",
        "#333",
        "#4f4f4f",
        "#828282",
        "#bdbdbd",
        "#e0e0e0",
    ];

    const [selectedColor, setSelectedColor] = useState(null);
    const [labelText, setLabelText] = useState(null);

    const postLabel = async () => {
        if (labelText && selectedColor) {
            await xhr(() =>
                addLabelToCard(
                    currentBoard.board_id,
                    cardDetail.card_id,
                    selectedColor,
                    labelText
                )
            );
            refreshBoard();
        }
    };

    return (
        <KanbanActionPopup
            heading={"Label"}
            subHeading={"Select a name and color"}
            trigger={
                <span>
                    <Button
                        label={"Labels"}
                        buttonType={ButtonTypes.SECONDARY}
                        buttonStyle={{ width: "100%" }}
                        buttonClasses="mt-12"
                        icon={
                            <LabelVector className="info-label-icon icon-color-grey" />
                        }
                    />
                </span>
            }
        >
            <FormInput
                placeholder={"Label.."}
                value={labelText}
                onChange={(event) => {
                    setLabelText(event.target.value);
                }}
            />
            <div className="label-input-grid">
                {colors.map((color) => (
                    <div
                        onClick={() => setSelectedColor(color)}
                        style={{
                            backgroundColor: color,
                        }}
                        className={`label-input-labels ${
                            selectedColor == color ? "label-selected" : ""
                        }`}
                    ></div>
                ))}
            </div>
            {cardDetail.card_labels?.length ? (
                <div className="mt-16">
                    <InfoLabel labelText={"Available"} />
                    <div className="mt-10">
                        <TagRow tags={cardDetail.card_labels} />
                    </div>
                </div>
            ) : (
                <></>
            )}
            <div className="mt-13 d-flex d-justify-content-center">
                <Button label={"Add"} onClick={postLabel} />
            </div>
        </KanbanActionPopup>
    );
};
