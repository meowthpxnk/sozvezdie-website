import styled from "styled-components";

export const IconActionButton = styled.button<{ $active?: boolean }>`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 4px;
    transition: background-color 0.2s ease;
    appearance: none;

    background: ${({ $active = false }) => ($active ? "var(--main-color)" : "var(--neutral-surface-bg)")};
    color: ${({ $active = false }) => ($active ? "#fff" : "var(--main-color)")};

    &:hover {
        background: ${({ $active = false }) => ($active ? "var(--main-color-hover)" : "var(--main-color-tint-hover)")};
    }

    svg {
        width: 14px;
        height: 14px;
    }
`;
