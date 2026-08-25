"use client";

import styled from "styled-components";

import { ModerationDecisionPanel } from "@features/moderation-decision/ModerationDecisionPanel";
import { MODERATION_ACTION_LABELS } from "@entities/moderation";
import { SetAdminChrome } from "@widgets/AdminShell";
import { AuthorBrandPage } from "../AuthorBrandPage/AuthorBrandPage";
import { useModeratorBrandEdit } from "./useModeratorBrandEdit";

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

type ModeratorBrandEditPageProps = {
    proposalId: string;
};

export function ModeratorBrandEditPage({ proposalId }: ModeratorBrandEditPageProps) {
    const { controller, proposal, isError, loading } = useModeratorBrandEdit(proposalId);

    if (isError) {
        return (
            <>
                <SetAdminChrome title="Модерация бренда" />
                <EmptyState>Не удалось загрузить заявку на модерацию.</EmptyState>
            </>
        );
    }

    if (!controller && !loading) {
        return (
            <>
                <SetAdminChrome title="Модерация бренда" />
                <EmptyState>Заявка не найдена.</EmptyState>
            </>
        );
    }

    if (!controller) {
        return (
            <>
                <SetAdminChrome title="Модерация бренда" />
                <EmptyState>Загрузка заявки…</EmptyState>
            </>
        );
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
            <AuthorBrandPage
                controller={controller}
                hideSubmit
                footer={
                    <DecisionWrap>
                        <ModerationDecisionPanel
                            proposalId={proposalId}
                            onBeforeApprove={() => controller.saveBrand()}
                        />
                    </DecisionWrap>
                }
            />
        </>
    );
}
