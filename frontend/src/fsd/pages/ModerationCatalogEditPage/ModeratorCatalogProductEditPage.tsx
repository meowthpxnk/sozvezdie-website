"use client";

import { useRef, useState } from "react";
import styled from "styled-components";

import { ModeratorCatalogSavePanel } from "@features/moderator-edit/ModeratorCatalogSavePanel";
import { SetAdminChrome } from "@widgets/AdminShell";
import { AuthorProductComposer } from "../AuthorProductCreatePage/AuthorProductComposer";
import { useModeratorCatalogProductEdit } from "./useModeratorCatalogProductEdit";

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

type ModeratorCatalogProductEditPageProps = {
    productId: string;
};

export function ModeratorCatalogProductEditPage({
    productId,
}: ModeratorCatalogProductEditPageProps) {
    const submitRef = useRef<(() => Promise<void>) | null>(null);
    const [saving, setSaving] = useState(false);
    const { proposal, initialForm, loading, isError, submitProduct, saveWithComment } =
        useModeratorCatalogProductEdit(productId);

    if (isError) {
        return (
            <>
                <SetAdminChrome title="Редактирование товара" />
                <EmptyState>Не удалось загрузить товар для редактирования.</EmptyState>
            </>
        );
    }

    return (
        <>
            <SetAdminChrome title="Редактирование товара" />
            {proposal ? (
                <MetaCard>
                    <MetaTitle>{proposal.title}</MetaTitle>
                    <MetaText>Изменения применяются сразу, без отправки на модерацию.</MetaText>
                </MetaCard>
            ) : null}
            <AuthorProductComposer
                key={productId}
                mode="edit"
                loading={loading || !initialForm}
                initialForm={initialForm}
                shellTitle="Редактирование товара"
                formTitle="Карточка товара"
                formDescription="После сохранения изменения сразу появятся в каталоге и в ленте модерации."
                hideSubmit
                showUnapprovedTaxonomyHints
                successRedirectPath={null}
                onRegisterSubmit={(submit) => {
                    submitRef.current = submit;
                }}
                onSubmitForm={submitProduct}
            />
            <FooterWrap>
                <ModeratorCatalogSavePanel
                    saving={saving}
                    onSave={async (comment) => {
                        if (!submitRef.current) {
                            return;
                        }

                        setSaving(true);
                        try {
                            await saveWithComment(comment, submitRef.current);
                        } finally {
                            setSaving(false);
                        }
                    }}
                />
            </FooterWrap>
        </>
    );
}
