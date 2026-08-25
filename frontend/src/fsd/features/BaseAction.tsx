import styled from "styled-components";
import { PropsWithChildren } from "react";

const ButtonWrapper = styled.button`
    color: var(--color);
    background-color: var(--main-color);
    transition: background-color 0.5s;

    &:focus-visible,
    &:hover {
        background-color: var(--main-color-lighter);
    }

    &:disabled {
        background-color: var(--few-gray-color);
        color: var(--disabled-color);
    }
`;

interface ButtonProps
    extends Omit<Partial<HTMLButtonElement>, "children">,
    PropsWithChildren {
    onClick?: () => void;
}

function Button({
    className,
    disabled = false,
    children,
    type,
    onClick,
}: ButtonProps) {
    return (
        <ButtonWrapper
            onClick={onClick}
            className={className}
            disabled={disabled}
            type={type}
        >
            {children}
        </ButtonWrapper>
    );
}

export default Button;
