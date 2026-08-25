"use client";

import styled from "styled-components";
import type { ReactNode } from "react";

import { useAdminChrome } from "./AdminChromeContext";

export const PAGE_CONTENT_MAX_WIDTH = 1200;

const AdminPageWrapper = styled.div`
    width: 100%;
    max-width: ${PAGE_CONTENT_MAX_WIDTH}px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-sizing: border-box;

    @media (min-width: 960px) {
        gap: 28px;
    }
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const PageTitle = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--title-color);
`;

function AdminPageChrome() {
    const { title, titleRight } = useAdminChrome();

    if (!title) {
        return null;
    }

    return (
        <TitleRow>
            <PageTitle>{title}</PageTitle>
            {titleRight ? <div>{titleRight}</div> : null}
        </TitleRow>
    );
}

export function AdminPageLayout({ children }: { children: ReactNode }) {
    return (
        <AdminPageWrapper className="flex-c indent-list int-16">
            <AdminPageChrome />
            {children}
        </AdminPageWrapper>
    );
}
