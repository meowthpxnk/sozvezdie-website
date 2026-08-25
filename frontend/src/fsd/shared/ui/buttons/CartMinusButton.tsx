import styled from "styled-components";
import { Minus } from "lucide-react";
import type { MouseEvent } from "react";

const CartMinusButtonStyles = styled.button<{ $active?: boolean, $size?: number, $padding?: number }>`
    --size: ${({ $size }) => $size ?? 28}px;
    border-radius: 8px 0 0 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: ${({ $padding }) => $padding ?? 6}px;
    transition: background-color 0.2s ease;
    appearance: none;

    background: ${({ $active = false }) => ($active ? "var(--main-color)" : "var(--neutral-surface-bg)")};
    color: ${({ $active = false }) => ($active ? "#fff" : "var(--main-color)")};

    &:hover {
        background: ${({ $active = false }) => ($active ? "var(--main-color-hover)" : "var(--main-color-tint-hover)")};
    }
`;

export interface CartMinusButtonProps {
    onClick: (event: MouseEvent<HTMLButtonElement>) => void,
    active?: boolean,
    size?: number,
    padding?: number,
}

export const CartMinusButton = ({ onClick, active = true, size = 28, padding = 6 }: CartMinusButtonProps) => {
    return <CartMinusButtonStyles $size={size} $padding={padding} $active={active} onClick={onClick} className="cur-p size-box">
        <Minus
        />
    </CartMinusButtonStyles>;
}
export default CartMinusButton
