"use client";

import styled from "styled-components";

import { ModeratorCatalogSavePanel } from "@features/moderator-edit/ModeratorCatalogSavePanel";
import { SetAdminChrome } from "@widgets/AdminShell";
import { AuthorBrandPage } from "../AuthorBrandPage/AuthorBrandPage";
import { useModeratorCatalogBrandEdit } from "./useModeratorCatalogBrandEdit";

const MetaCard = styled.section`
    background: #fff;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 12px;
`;

const MetaTitle = styled.h2`
    margin: 0;
    font-size: 17px;
    color: #132647;
`;

const MetaText = styled.p`
    margin: 6px 0 0;
    font-size: 13px;
    color: #6b7890;
`;

const FooterWrap = styled.div`
    margin-top: 16px;
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    color: #666;
`;

type ModeratorCatalogBrandEditPageProps = {
    sellerCardId: string;
};

export function ModeratorCatalogBrandEditPage({
    sellerCardId,
}: ModeratorCatalogBrandEditPageProps) {
    const { controller, proposal, isError, loading, saving, saveWithComment } =
        useModeratorCatalogBrandEdit(sellerCardId);

    if (isError) {
        return (
            <>
                <SetAdminChrome title="Редактирование бренда" />
                <EmptyState>Не удалось загрузить бренд для редактирования.</EmptyState>
            </>
        );
    }

    if (!controller && !loading) {
        return (
            <>
                <SetAdminChrome title="Редактирование бренда" />
                <EmptyState>Бренд не найден.</EmptyState>
            </>
        );
    }

    if (!controller) {
        return (
            <>
                <SetAdminChrome title="Редактирование бренда" />
                <EmptyState>Загрузка…</EmptyState>
            </>
        );
    }

    return (
        <>
            {proposal ? (
                <MetaCard>
                    <MetaTitle>{proposal.title}</MetaTitle>
                    <MetaText>Изменения применяются сразу, без отправки на модерацию.</MetaText>
                </MetaCard>
            ) : null}
            <AuthorBrandPage
                controller={controller}
                hideSubmit
                footer={
                    <FooterWrap>
                        <ModeratorCatalogSavePanel
                            saving={saving}
                            onSave={(comment) => saveWithComment(comment)}
                        />
                    </FooterWrap>
                }
            />
        </>
    );
}
