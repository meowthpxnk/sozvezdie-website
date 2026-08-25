"use client";

import styled from "styled-components";
import { Trash2 } from "lucide-react";

const DeleteButton = styled.button<{ $variant: "default" | "on-dark" }>`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    appearance: none;

    background: ${({ $variant }) =>
        $variant === "on-dark" ? "rgba(220, 53, 69, 0.88)" : "#dc3545"};
    color: #fff;

    &:hover:not(:disabled) {
        background: ${({ $variant }) =>
            $variant === "on-dark" ? "rgba(200, 35, 51, 0.95)" : "#c82333"};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:focus-visible {
        outline: 2px solid #dc3545;
        outline-offset: 2px;
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

type ModeratorDeleteButtonProps = {
    label: string;
    variant?: "default" | "on-dark";
    disabled?: boolean;
    onClick: () => void;
};

export function ModeratorDeleteButton({
    label,
    variant = "default",
    disabled = false,
    onClick,
}: ModeratorDeleteButtonProps) {
    return (
        <DeleteButton
            type="button"
            $variant={variant}
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
        >
            <Trash2 strokeWidth={2} />
        </DeleteButton>
    );
}
