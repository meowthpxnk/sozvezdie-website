"use client";

import styled from "styled-components";
import { Check } from "lucide-react";

const Row = styled.div`
    display: flex;
    align-items: center;
    padding: 4px 2px 12px;
`;

const CheckboxButton = styled.button<{
    $checked: boolean;
    $indeterminate: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border-radius: 6px;
    border: 2px solid
        ${({ $checked, $indeterminate }) =>
            $checked || $indeterminate ? "var(--main-color)" : "#cfd4dc"};
    background: ${({ $checked, $indeterminate }) => {
        if ($checked) {
            return "var(--main-color)";
        }
        if ($indeterminate) {
            return "var(--main-color-tint-soft)";
        }
        return "transparent";
    }};
    color: #fff;
    cursor: pointer;
    flex-shrink: 0;
    transition:
        border-color 0.2s ease,
        background-color 0.2s ease;

    svg {
        width: 14px;
        height: 14px;
        opacity: ${({ $checked, $indeterminate }) =>
            $checked || $indeterminate ? 1 : 0};
    }

    &:hover:not(:disabled) {
        border-color: var(--main-color);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`;

export interface CartSelectAllRowProps {
    checked: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    onChange: () => void;
}

export const CartSelectAllRow = ({
    checked,
    indeterminate = false,
    disabled = false,
    onChange,
}: CartSelectAllRowProps) => {
    const showCheck = checked || indeterminate;

    return (
        <Row>
            <CheckboxButton
                type="button"
                $checked={checked}
                $indeterminate={indeterminate}
                disabled={disabled}
                aria-label={checked ? "Снять выбор со всех" : "Выбрать все"}
                aria-checked={indeterminate ? "mixed" : checked}
                onClick={onChange}
            >
                {showCheck ? <Check strokeWidth={3} /> : null}
            </CheckboxButton>
        </Row>
    );
};
