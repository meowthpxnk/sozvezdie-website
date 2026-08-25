import styled from "styled-components";
import { Trash2 } from "lucide-react";
import type { MouseEvent } from "react";

const CartTrashButtonStyles = styled.button<{ $active?: boolean }>`
    --size: 28px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 6px;
    transition: background-color 0.2s ease;
    appearance: none;

    background: ${({ $active = false }) => ($active ? "var(--main-color)" : "var(--neutral-surface-bg)")};
    color: ${({ $active = false }) => ($active ? "#fff" : "var(--main-color)")};

    &:hover {
        background: ${({ $active = false }) => ($active ? "var(--main-color-hover)" : "var(--main-color-tint-hover)")};
    }
`;

export interface CartTrashButtonProps {
    onClick: (event: MouseEvent<HTMLButtonElement>) => void,
}

export const CartTrashButton = ({ onClick }: CartTrashButtonProps) => {
    return <CartTrashButtonStyles onClick={onClick} className="cur-p size-box">
        <Trash2
            stroke="var(--main-color)"
            strokeWidth={2}
        />
    </CartTrashButtonStyles>;
}
export default CartTrashButton
