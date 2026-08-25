import styled from "styled-components";
import { Star } from "lucide-react";
import type { MouseEvent } from "react";

const ProductLikeButtonStyles = styled.button<{ $active?: boolean }>`
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

export interface ProductLikeButtonProps {
    active: boolean,
    onClick: (event: MouseEvent<HTMLButtonElement>) => void,
}

export const ProductLikeButton = ({ active, onClick }: ProductLikeButtonProps) => {
    return (
        <ProductLikeButtonStyles
            $active={active}
            onClick={onClick}
            className="cur-p size-box"
            type="button"
            aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
        >
        <Star
            fill={active ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
        />
        </ProductLikeButtonStyles>
    );
};

export default ProductLikeButton;
