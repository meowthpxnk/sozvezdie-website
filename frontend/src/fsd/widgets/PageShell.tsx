"use client";

import styled from "styled-components";
import { usePathname } from "next/navigation";
import { Header, Footer } from "@widgets";
import { useProductReturnPathTracker } from "@shared/hooks/useProductReturnPathTracker";

const PATHS_WITHOUT_HEADER = ["/auth"];
const PAGE_CONTENT_MAX_WIDTH = 1200;

const PageShellStyles = styled.div`
    width: 100%;
    max-width: 100%;
    min-height: 100vh;
    min-height: 100dvh;
`;

const MainContainer = styled.main`
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
    min-width: 0;
`;

const PageContent = styled.div`
    width: 100%;
    max-width: ${PAGE_CONTENT_MAX_WIDTH}px;
    min-width: 0;
    box-sizing: border-box;
    padding: 20px 12px;

    @media (min-width: 640px) {
        padding: 20px;
    }

    @media (min-width: 960px) {
        padding: 24px 32px 40px;
    }
`;

export interface PageShellProps {
    children: React.ReactNode;
};

function isPathWithoutHeader(pathname: string): boolean {
    return PATHS_WITHOUT_HEADER.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
}

export const PageShell = ({ children }: PageShellProps) => {
    const pathname = usePathname();
    const hideHeader = isPathWithoutHeader(pathname);
    useProductReturnPathTracker();

    return <PageShellStyles className="flex-c">
        {!hideHeader ? <Header /> : null}
        <MainContainer>
            <PageContent className="flex-c">{children}</PageContent>
        </MainContainer>
        <Footer links={[
            { href: "/products", label: "Каталог" },
            { href: "/authors", label: "Авторы" },
            { href: "/faq", label: "FAQ" },
            { href: "/legal-details", label: "Реквизиты" },
        ]} />
    </PageShellStyles>;
};
