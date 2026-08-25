import styled from "styled-components";
import { Star } from "lucide-react";
import type { MouseEvent } from "react";

const AuthorInfoLikeButtonStyles = styled.button<{ $active?: boolean }>`
    width: 100%;
    height: 100%;
    border-radius: 0 8px 8px 0;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 16px;
    transition: background-color 0.2s ease;

    svg {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
    }
    appearance: none;

    background: ${({ $active = false }) => ($active ? "var(--main-color)" : "var(--neutral-surface-bg)")};
    color: ${({ $active = false }) => ($active ? "#fff" : "var(--main-color)")};

    &:hover {
        background: ${({ $active = false }) => ($active ? "var(--main-color-hover)" : "var(--main-color-tint-hover)")};
    }
`;

export interface AuthorInfoLikeButtonProps {
    active: boolean,
    onClick: (event: MouseEvent<HTMLButtonElement>) => void,
}

export const AuthorInfoLikeButton = ({ active, onClick }: AuthorInfoLikeButtonProps) => {
    return <AuthorInfoLikeButtonStyles $active={active} onClick={onClick} className="cur-p">
        <Star
            size={24}
            fill={active ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
        />
    </AuthorInfoLikeButtonStyles>;
}
export default AuthorInfoLikeButton
