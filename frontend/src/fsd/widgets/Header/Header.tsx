"use client";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { usePathname } from "next/navigation";
import { getAccessToken } from "@entities/auth/auth-token.service";
import { useAuth } from "@entities/auth/hooks";
import Logo from "@shared/ui/Logo";
import { isCatalogPath } from "@shared/lib/catalog-search";
import HeaderActions, { type HeaderActionsRole } from "./HeaderActions";
import { GuestHeaderAuth } from "./GuestHeaderAuth";
import HeaderSearchSection from "./HeaderSearchSection";
import {
    isManagementNavMode,
    syncHeaderNavContext,
    type HeaderNavMode,
} from "./header-nav";
import Link from "next/link";

const PAGE_CONTENT_MAX_WIDTH = 1200;

const HeaderBar = styled.header`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-sizing: border-box;
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--header-border-color);
    padding: 0 12px;

    @media (min-width: 640px) {
        padding: 0 20px;
    }

    @media (min-width: 960px) {
        padding: 0 32px;
    }
`;

const HeaderInner = styled.div`
    box-sizing: border-box;
    width: 100%;
    max-width: ${PAGE_CONTENT_MAX_WIDTH}px;
    margin: 0 auto;
    min-height: 72px;
    height: 72px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 16px;

    @media (max-width: 639px) {
        gap: 8px;
        min-height: 64px;
        height: 64px;
    }
`;

const HeaderLogoCell = styled.div`
    display: flex;
    align-items: center;
`;

const HeaderSearchCell = styled.div`
    min-width: 0;
    display: flex;
    justify-content: center;
`;

const HeaderActionsCell = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 639px) {
        gap: 0;
    }
`;

export interface HeaderProps {
    /** When true, the search block is hidden (e.g. admin shell). */
    hideSearch?: boolean;
    /** Роль для правого блока кнопок. По умолчанию обычный пользовательский хедер. */
    role?: HeaderActionsRole;
}

const HeaderOffset = styled.div`
    height: 72px;

    @media (max-width: 639px) {
        height: 64px;
    }
`;

const isHiddenSearchBlock = false;

export const Header = ({ hideSearch = false, role }: HeaderProps) => {
    const pathname = usePathname() ?? "";
    const { role: authRole, isAuthenticated, authReady } = useAuth();
    const [hasAccessToken, setHasAccessToken] = useState(false);
    const [navMode, setNavMode] = useState<HeaderNavMode>("storefront");
    const resolvedRole = role ?? authRole;

    useEffect(() => {
        setHasAccessToken(Boolean(getAccessToken()));
    }, [isAuthenticated]);

    useEffect(() => {
        if (!authReady) {
            return;
        }
        setNavMode(syncHeaderNavContext(pathname, resolvedRole));
    }, [pathname, resolvedRole, authReady]);

    const showSearch =
        !hideSearch &&
        !isManagementNavMode(navMode) &&
        !isHiddenSearchBlock &&
        !isCatalogPath(pathname);
    const showNavActions = hasAccessToken;

    return (
        <>
            <HeaderOffset />
            <HeaderBar>
                <HeaderInner>
                    <HeaderLogoCell>
                        <Link href="/">
                            <Logo />
                        </Link>
                    </HeaderLogoCell>
                    <HeaderSearchCell>
                        {showSearch ? <HeaderSearchSection /> : null}
                    </HeaderSearchCell>
                    <HeaderActionsCell>
                        {showNavActions ? (
                            <HeaderActions
                                key={`${pathname}-${navMode}`}
                                mode={navMode}
                                role={resolvedRole}
                                pathname={pathname}
                            />
                        ) : (
                            <GuestHeaderAuth />
                        )}
                    </HeaderActionsCell>
                </HeaderInner>
            </HeaderBar>
        </>
    );
};

export default Header;
