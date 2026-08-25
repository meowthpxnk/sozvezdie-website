"use client";

import { useRef } from "react";
import styled from "styled-components";

import { ModerationDecisionPanel } from "@features/moderation-decision/ModerationDecisionPanel";
import { MODERATION_ACTION_LABELS } from "@entities/moderation";
import { AuthorProductComposer } from "../AuthorProductCreatePage/AuthorProductComposer";
import { useModeratorProductEdit } from "./useModeratorProductEdit";

const MetaCard = styled.section`
    background: #fff;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const MetaTitle = styled.h2`
    margin: 0;
    font-size: 17px;
    color: #132647;
`;

const MetaText = styled.p`
    margin: 0;
    font-size: 13px;
    color: #6b7890;
`;

const DecisionWrap = styled.div`
    margin-top: 16px;
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    color: #666;
`;

type ModeratorProductEditPageProps = {
    proposalId: string;
};

export function ModeratorProductEditPage({ proposalId }: ModeratorProductEditPageProps) {
    const submitRef = useRef<(() => Promise<void>) | null>(null);
    const { proposal, initialForm, loading, isError, submitProduct } =
        useModeratorProductEdit(proposalId);

    if (isError) {
        return <EmptyState>Не удалось загрузить заявку на модерацию.</EmptyState>;
    }

    return (
        <>
            {proposal ? (
                <MetaCard>
                    <MetaTitle>{proposal.title}</MetaTitle>
                    <MetaText>{MODERATION_ACTION_LABELS[proposal.type]}</MetaText>
                    <MetaText>Автор: {proposal.submittedBy}</MetaText>
                    {proposal.moderatedBy ? (
                        <MetaText>Промодерировал: {proposal.moderatedBy}</MetaText>
                    ) : null}
                    {proposal.moderationComment ? (
                        <MetaText>Комментарий: {proposal.moderationComment}</MetaText>
                    ) : null}
                </MetaCard>
            ) : null}
            <AuthorProductComposer
                key={proposalId}
                mode="edit"
                loading={loading || !initialForm}
                initialForm={initialForm}
                shellTitle="Модерация товара"
                formTitle="Редактирование товара"
                formDescription="Измените карточку при необходимости и нажмите «Принять» или «Отклонить»."
                hideSubmit
                showUnapprovedTaxonomyHints
                successRedirectPath={null}
                onRegisterSubmit={(submit) => {
                    submitRef.current = submit;
                }}
                onSubmitForm={submitProduct}
            />
            <DecisionWrap>
                <ModerationDecisionPanel
                    proposalId={proposalId}
                    onBeforeApprove={async () => {
                        if (!submitRef.current) {
                            return false;
                        }

                        await submitRef.current();
                    }}
                />
            </DecisionWrap>
        </>
    );
}
