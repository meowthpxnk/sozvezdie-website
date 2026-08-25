import styled from "styled-components";
import { Star } from "lucide-react";
import type { MouseEvent } from "react";

const AuthorLikeButtonStyles = styled.button<{ $active?: boolean }>`
    --size: 38px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 10px;
    transition: background-color 0.2s ease;
    appearance: none;

    background: ${({ $active }) => ($active ? "var(--main-color)" : "rgba(255, 255, 255, 0.2)")};
    color: ${({ $active = false }) => ($active ? "#fff" : "var(--main-color)")};

    &:hover {
        background: ${({ $active }) => ($active ? "var(--main-color-hover)" : "rgba(255, 255, 255, 0.28)")};
    }
`;

export interface AuthorLikeButtonProps {
    active: boolean,
    onClick: (event: MouseEvent<HTMLButtonElement>) => void,
}

export const AuthorLikeButton = ({ active, onClick }: AuthorLikeButtonProps) => {
    return (
        <AuthorLikeButtonStyles
            $active={active}
            onClick={onClick}
            className="cur-p size-box"
            type="button"
            aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
        >
            <Star
                fill={active ? "#fff" : "none"}
                stroke="#fff"
                strokeWidth={2}
            />
        </AuthorLikeButtonStyles>
    );
};

export default AuthorLikeButton;
