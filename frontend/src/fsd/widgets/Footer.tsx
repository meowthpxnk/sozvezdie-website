"use client";

import Link from "next/link";
import styled from "styled-components";

export interface FooterLink {
    href: string;
    label: string;
}

const FooterStyles = styled.footer`
    padding: 14px 16px;
    background-color: var(--footer-bg);
    color: var(--footer-color);
    border-top: 1px solid var(--footer-separator-color);

    @media (max-width: 479px) {
        padding: 12px;
    }
`;

const FooterInner = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    line-height: 1.35;
    text-align: center;

    @media (max-width: 479px) {
        gap: 10px;
        font-size: 12px;
    }

    @media (min-width: 720px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 0;
    }
`;

const Copyright = styled.span`
    color: var(--footer-color);
    white-space: nowrap;

    @media (max-width: 479px) {
        font-size: 11px;
    }

    @media (min-width: 720px) {
        &::after {
            content: "·";
            margin: 0 10px;
            opacity: 0.45;
            user-select: none;
        }
    }
`;

const FooterNav = styled.nav`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, max-content));
    justify-content: center;
    justify-items: center;
    column-gap: 20px;
    row-gap: 8px;
    width: 100%;
    max-width: 260px;

    @media (min-width: 480px) and (max-width: 719px) {
        grid-template-columns: repeat(2, minmax(0, max-content));
        column-gap: 28px;
        row-gap: 10px;
        max-width: 320px;
    }

    @media (min-width: 720px) {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        width: auto;
        max-width: none;
        gap: 0;
    }
`;

const FooterNavLink = styled(Link)`
    color: var(--footer-color);
    white-space: nowrap;
    font-size: inherit;
    text-decoration: none;

    @media (max-width: 719px) {
        font-size: clamp(11px, 3.2vw, 13px);
    }

    &:hover {
        color: var(--footer-link-hover-color);
    }

    @media (min-width: 720px) {
        &:not(:first-child)::before {
            content: "·";
            margin: 0 10px;
            opacity: 0.45;
            color: var(--footer-color);
            pointer-events: none;
        }
    }
`;

export interface FooterProps {
    links?: FooterLink[];
}

export const Footer = ({ links }: FooterProps) => {
    return (
        <FooterStyles>
            <FooterInner>
                <Copyright>© {new Date().getFullYear()} Созвездие | Полки</Copyright>
                {links && links.length > 0 ? (
                    <FooterNav aria-label="Навигация в подвале">
                        {links.map((link) => (
                            <FooterNavLink key={link.href} href={link.href}>
                                {link.label}
                            </FooterNavLink>
                        ))}
                    </FooterNav>
                ) : null}
            </FooterInner>
        </FooterStyles>
    );
};
