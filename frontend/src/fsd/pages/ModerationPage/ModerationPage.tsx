"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Check, CircleAlert, Clock3, Pencil } from "lucide-react";
import { SetAdminChrome } from "@widgets/AdminShell";
import {
    MODERATION_ACTION_LABELS,
    MODERATION_PROPOSAL_STATUS_LABELS,
    type ModerationFilter,
} from "@entities/moderation";
import {
    MODERATION_STATUS_BADGE,
    type ModerationStatus,
} from "@entities/author/seller-product.types";
import { formatOrderDate } from "@shared/formatters";
import { IconActionButton } from "@/src/shared/ui/icon-action-button";
import { useModeration } from "./useModeration";

const FilterRow = styled.div`
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const FilterButton = styled.button<{ $active: boolean }>`
    min-height: 32px;
    padding: 0 10px;
    border-radius: 8px;
    border: 1px solid ${({ $active }) => ($active ? "var(--main-color)" : "#d7ddea")};
    background: ${({ $active }) => ($active ? "var(--main-color)" : "#fff")};
    color: ${({ $active }) => ($active ? "#fff" : "#2d3a54")};
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
`;

const List = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Card = styled.li`
    background: #fff;
    border: 1px solid #e4e9f0;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const TypeLabel = styled.span`
    font-size: 12px;
    font-weight: 700;
    color: var(--main-color-accent);
`;

const StatusBadge = styled.span<{ $status: ModerationStatus }>`
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 700;
    color: ${({ $status }) => MODERATION_STATUS_BADGE[$status].color};
    background: ${({ $status }) => MODERATION_STATUS_BADGE[$status].background};
`;

const Title = styled.strong`
    color: #132647;
    font-size: 15px;
`;

const Meta = styled.span`
    color: #6b7890;
    font-size: 12px;
`;

const Description = styled.p`
    margin: 0;
    font-size: 13px;
    color: #4a5872;
    line-height: 1.45;
`;

const OpenButton = styled(IconActionButton).attrs({ $active: true })`
    align-self: flex-end;
`;

const EmptyState = styled.p`
    margin: 0;
    padding: 24px 12px;
    text-align: center;
    color: #6b7890;
    font-size: 14px;
`;

const FILTERS: { value: ModerationFilter; label: string; icon: typeof Clock3 }[] = [
    { value: "PENDING", label: "На модерации", icon: Clock3 },
    { value: "APPROVED", label: "Принятые", icon: Check },
    { value: "REJECTED", label: "Отклоненные", icon: CircleAlert },
];

export function ModerationPage() {
    const router = useRouter();
    const { filter, setFilter, proposals, loading, isError } = useModeration();

    return (
        <>
            <SetAdminChrome title="Лента модерации" />
            <FilterRow>
                {FILTERS.map(({ value, label, icon: Icon }) => (
                    <FilterButton
                        key={value}
                        type="button"
                        $active={filter === value}
                        onClick={() => setFilter(value)}
                    >
                        <Icon size={12} />
                        {label}
                    </FilterButton>
                ))}
            </FilterRow>

            {loading ? <EmptyState>Загрузка заявок…</EmptyState> : null}
            {!loading && isError ? (
                <EmptyState>Не удалось загрузить заявки на модерацию.</EmptyState>
            ) : null}
            {!loading && !isError && proposals.length === 0 ? (
                <EmptyState>Нет заявок с выбранным статусом.</EmptyState>
            ) : null}

            {!loading && !isError && proposals.length > 0 ? (
                <List>
                    {proposals.map((item) => (
                        <Card key={item.id}>
                            <Row>
                                <TypeLabel>{MODERATION_ACTION_LABELS[item.type]}</TypeLabel>
                                <StatusBadge $status={item.status}>
                                    {MODERATION_PROPOSAL_STATUS_LABELS[item.status]}
                                </StatusBadge>
                            </Row>
                            <Title>{item.title}</Title>
                            <Meta>{formatOrderDate(item.createdAt)}</Meta>
                            <Description>Автор предложения: {item.submittedBy}</Description>
                            {item.moderatedBy ? (
                                <Description>Промодерировал: {item.moderatedBy}</Description>
                            ) : null}
                            {item.moderationComment ? (
                                <Description>Комментарий: {item.moderationComment}</Description>
                            ) : null}
                            {item.status === "PENDING" || item.status === "REJECTED" ? (
                                <OpenButton
                                    type="button"
                                    aria-label={
                                        item.status === "REJECTED"
                                            ? "Открыть отклонённую заявку"
                                            : "Открыть редактирование"
                                    }
                                    title={
                                        item.status === "REJECTED"
                                            ? "Открыть для редактирования"
                                            : "Открыть редактирование"
                                    }
                                    onClick={() => router.push(`/moderation/${item.id}`)}
                                >
                                    <Pencil size={14} />
                                </OpenButton>
                            ) : null}
                        </Card>
                    ))}
                </List>
            ) : null}
        </>
    );
}
