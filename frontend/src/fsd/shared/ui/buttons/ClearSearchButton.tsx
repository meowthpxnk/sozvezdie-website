import { X } from "lucide-react";
import styled from "styled-components";

const ClearSearchButtonStyles = styled.button`
    width: 28px;
    height: 28px;
    border: none;
    background-color: var(--neutral-surface-bg);
    color: #5d6b84;

    cursor: pointer;
    flex-shrink: 0;

    padding: 4px;

    &:hover {
        background-color: var(--main-color-tint-hover);
        color: #2d3a54;
    }
`;

export interface ClearSearchButtonProps {
    onClick: () => void;
}

export const ClearSearchButton = ({ onClick }: ClearSearchButtonProps) => {
    return (
        <ClearSearchButtonStyles
            className="b-rad-6"
            type="button"
            aria-label="Очистить поиск"
            onClick={onClick}
        >
            <X aria-hidden strokeWidth={2.25} />
        </ClearSearchButtonStyles>
    );
}
export default ClearSearchButton
