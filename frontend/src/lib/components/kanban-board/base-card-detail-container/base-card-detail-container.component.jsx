import { DocumentVector } from "../../../vectors/components/document.vector";
import { Button, ButtonTypes } from "../../button/button.component";
import { InfoLabel } from "../../info-label/info-label.component";

export const BaseCardDetailContainer = ({
    containerLabel,
    containerIcon,
    actionButtonText,
    actionButtonIcon,
    onActionButtonClick,
    children,
    showActionButton,
    ...props
}) => {
    return (
        <div className="mt-20">
            <div className="d-flex d-align-items-center">
                <div className="mr-13">
                    <InfoLabel
                        labelText={containerLabel}
                        icon={
                            <DocumentVector className="info-label-icon icon-color-grey" />
                        }
                    />
                </div>
                {showActionButton ? (
                    <Button
                        buttonType={ButtonTypes.NOBG_OUTLINE}
                        label={actionButtonText}
                        icon={actionButtonIcon}
                        onClick={onActionButtonClick}
                    />
                ) : (
                    <></>
                )}
            </div>
            <div className="mt-12">{children}</div>
        </div>
    );
};
