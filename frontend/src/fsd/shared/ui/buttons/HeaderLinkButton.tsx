import styled from "styled-components";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";

export type HeaderLinkTone = "default" | "dark";

const idleColor = (tone?: HeaderLinkTone) =>
    tone === "dark"
        ? "var(--header-management-icon-color)"
        : "var(--header-icon-color)";

const IconWrap = styled.div<{
    $active?: boolean;
    $tone?: HeaderLinkTone;
    $compact?: boolean;
}>`
    position: relative;
    width: ${({ $compact }) => ($compact ? "24px" : "24px")};
    height: ${({ $compact }) => ($compact ? "24px" : "24px")};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ $active, $tone }) =>
        $active ? "var(--main-color)" : idleColor($tone)};

    svg {
        width: ${({ $compact }) => ($compact ? "22px" : "22px")};
        height: ${({ $compact }) => ($compact ? "22px" : "22px")};
        stroke-width: ${({ $compact }) => ($compact ? "2.1" : "1.75")};
    }

    @media (max-width: 639px) {
        width: ${({ $compact }) => ($compact ? "20px" : "20px")};
        height: ${({ $compact }) => ($compact ? "20px" : "20px")};

        svg {
            width: ${({ $compact }) => ($compact ? "18px" : "18px")};
            height: ${({ $compact }) => ($compact ? "18px" : "18px")};
            stroke-width: ${({ $compact }) => ($compact ? "2.1" : "1.65")};
        }
    }
`;

const Label = styled.span<{ $active?: boolean; $tone?: HeaderLinkTone }>`
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
    color: ${({ $active, $tone }) =>
        $active ? "var(--main-color)" : idleColor($tone)};

    @media (max-width: 639px) {
        display: none;
    }
`;

const ButtonBadgeWrapper = styled.div`
    top: -6px;
    right: -8px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    background-color: var(--main-color);
    color: #111;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
        font-size: 10px;
        font-weight: 700;
        line-height: 1;
        color: #111;
    }

    @media (max-width: 639px) {
        top: -5px;
        right: -6px;
        min-width: 14px;
        height: 14px;
        padding: 0 3px;

        span {
            font-size: 9px;
        }
    }
`;

const HeaderLinkButtonStyles = styled(Link) <{
    $tone?: HeaderLinkTone;
    $compact?: boolean;
}>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ $compact }) => ($compact ? "0" : "4px")};
    padding: ${({ $compact }) => ($compact ? "2px 4px" : "4px 10px")};
    min-width: ${({ $compact }) => ($compact ? "auto" : "52px")};
    color: ${({ $tone }) => idleColor($tone)};
    background: transparent;
    text-decoration: none;
    transition: opacity 0.15s ease;

    &:hover {
        opacity: 0.65;
    }

    @media (max-width: 639px) {
        padding: ${({ $compact }) => ($compact ? "2px 3px" : "4px 6px")};
        min-width: auto;
    }
`;

export interface HeaderLinkButtonProps {
    Icon: LucideIcon;
    active?: boolean;
    badgeCount?: number;
    href: string;
    label?: string;
    tone?: HeaderLinkTone;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export const HeaderLinkButton = ({
    Icon,
    href,
    active = false,
    badgeCount = 0,
    label,
    tone = "default",
    onClick,
}: HeaderLinkButtonProps) => {
    const compact = tone === "dark";

    return (
        <HeaderLinkButtonStyles
            href={href}
            className="cur-p"
            aria-label={label}
            title={compact ? label : undefined}
            $tone={tone}
            $compact={compact}
            onClick={onClick}
        >
            <IconWrap $active={active} $tone={tone} $compact={compact}>
                <Icon stroke="currentColor" />
                {badgeCount > 0 ? (
                    <ButtonBadgeWrapper className="pos-a zi-2">
                        <span>{badgeCount > 99 ? "99+" : badgeCount}</span>
                    </ButtonBadgeWrapper>
                ) : null}
            </IconWrap>
            {label && !compact ? (
                <Label $active={active} $tone={tone}>
                    {label}
                </Label>
            ) : null}
        </HeaderLinkButtonStyles>
    );
};

export default HeaderLinkButton;
