"use client";

import styled from "styled-components";

import { ModerationDecisionPanel } from "@features/moderation-decision/ModerationDecisionPanel";
import { MODERATION_ACTION_LABELS } from "@entities/moderation";
import { getMediaImageUrl } from "@shared/lib/media-url";
import { priceFormatter } from "@shared/formatters";

import { useModeratorProductDeletion } from "./useModeratorProductDeletion";

const MetaCard = styled.section`
    background: #fff;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
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
    line-height: 1.45;
`;

const PreviewImage = styled.img`
    width: 100%;
    max-width: 280px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid #d7ddea;
`;

const ChangesList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const ChangeRow = styled.li`
    font-size: 13px;
    color: #4a5872;
`;

const DecisionWrap = styled.div`
    margin-top: 16px;
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    color: #666;
`;

type ModeratorProductDeletionPageProps = {
    proposalId: string;
};

export function ModeratorProductDeletionPage({
    proposalId,
}: ModeratorProductDeletionPageProps) {
    const { proposal, product, loading, isError } =
        useModeratorProductDeletion(proposalId);

    if (loading) {
        return <EmptyState>Загрузка заявки…</EmptyState>;
    }

    if (isError || !proposal) {
        return <EmptyState>Не удалось загрузить заявку на удаление.</EmptyState>;
    }

    const previewUrl =
        getMediaImageUrl(proposal.previewImageUrl) ??
        getMediaImageUrl(product?.images[0]) ??
        null;

    return (
        <>
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
                {product ? (
                    <MetaText>
                        {priceFormatter(product.price)} · в наличии {product.stockCount} шт.
                    </MetaText>
                ) : null}
                {previewUrl ? (
                    <PreviewImage src={previewUrl} alt={proposal.title} />
                ) : null}
                <ChangesList>
                    {proposal.changes.map((change) => (
                        <ChangeRow key={`${change.label}-${change.after}`}>
                            {change.label}: {change.before} → {change.after}
                        </ChangeRow>
                    ))}
                </ChangesList>
            </MetaCard>
            {proposal.status === "PENDING" || proposal.status === "REJECTED" ? (
                <DecisionWrap>
                    <ModerationDecisionPanel
                        proposalId={proposalId}
                        approveLabel="Подтвердить удаление"
                        rejectLabel="Отклонить удаление"
                        approvePendingLabel="Удаляем..."
                    />
                </DecisionWrap>
            ) : null}
        </>
    );
}
