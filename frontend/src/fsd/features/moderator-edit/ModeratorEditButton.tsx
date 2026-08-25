"use client";

import Link from "next/link";
import styled from "styled-components";
import { Pencil } from "lucide-react";

const EditLink = styled(Link)<{ $variant: "default" | "on-dark" }>`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 4px;
    text-decoration: none;
    transition: background-color 0.2s ease;
    appearance: none;

    background: ${({ $variant }) =>
        $variant === "on-dark" ? "rgba(255, 255, 255, 0.2)" : "var(--main-color)"};
    color: #fff;

    &:hover {
        background: ${({ $variant }) =>
            $variant === "on-dark" ? "rgba(255, 255, 255, 0.28)" : "var(--main-color-hover)"};
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

type ModeratorEditButtonProps = {
    href: string;
    label: string;
    variant?: "default" | "on-dark";
};

export function ModeratorEditButton({
    href,
    label,
    variant = "default",
}: ModeratorEditButtonProps) {
    return (
        <EditLink
            href={href}
            $variant={variant}
            aria-label={label}
            title={label}
        >
            <Pencil strokeWidth={2} />
        </EditLink>
    );
}
