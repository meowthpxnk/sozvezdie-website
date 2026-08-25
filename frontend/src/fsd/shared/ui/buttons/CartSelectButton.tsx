import styled from "styled-components";
import { Check } from "lucide-react";
import type { MouseEvent } from "react";

const CartSelectButtonStyles = styled.button<{ $active?: boolean; $disabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border-radius: 6px;
    border: 2px solid
        ${({ $active = false, $disabled }) =>
            $disabled ? "#cfd4dc" : $active ? "var(--main-color)" : "#cfd4dc"};
    background: ${({ $active = false, $disabled }) =>
        $disabled ? "transparent" : $active ? "var(--main-color)" : "transparent"};
    color: #fff;
    flex-shrink: 0;
    transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        opacity 0.2s ease;
    appearance: none;
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};

    svg {
        width: 14px;
        height: 14px;
        opacity: ${({ $active = false }) => ($active ? 1 : 0)};
    }

    &:hover:not(:disabled) {
        border-color: var(--main-color);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

export interface CartSelectButtonProps {
    active: boolean;
    disabled?: boolean;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const CartSelectButton = ({
    active,
    disabled = false,
    onClick,
}: CartSelectButtonProps) => {
    return (
        <CartSelectButtonStyles
            type="button"
            $active={active}
            $disabled={disabled}
            disabled={disabled}
            onClick={onClick}
            aria-label={active ? "Снять выбор" : "Выбрать для заказа"}
            aria-pressed={active}
            className="cur-p"
        >
            <Check strokeWidth={3} />
        </CartSelectButtonStyles>
    );
};

export default CartSelectButton;
