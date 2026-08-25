"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Check, CircleAlert, Clock3, List as ListIcon } from "lucide-react";

import { SetAdminChrome } from "@widgets/AdminShell";
import {
    AUTHOR_FEED_OPERATION_LABELS,
    type AuthorFeedFilter,
} from "@entities/author/author-feed.types";
import {
    MODERATION_STATUS_BADGE,
    MODERATION_STATUS_LABELS,
    type ModerationStatus,
} from "@entities/author/seller-product.types";
import { formatOrderDate } from "@shared/formatters";

import {
    parseModerationRequestTarget,
} from "@entities/author/cancel-moderation-request";
import { useCancelModerationRequest } from "@entities/author/hooks/useCancelModerationRequest";

import { useAuthorFeed } from "./useAuthorFeed";

const FilterWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const FilterRow = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const ScrollbarTrack = styled.div`
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: var(--scrollbar-track-subtle);
    overflow: hidden;
`;

const ScrollbarThumb = styled.div<{ $widthPercent: number; $leftPercent: number }>`
    height: 100%;
    width: ${({ $widthPercent }) => `${$widthPercent}%`};
    transform: translateX(${({ $leftPercent }) => `${$leftPercent}%`});
    border-radius: 999px;
    background: var(--scrollbar-thumb-strong);
    transition: transform 0.1s linear;
`;

const FilterButton = styled.button<{ $active: boolean }>`
    min-height: 30px;
    padding: 0 7px;
    border-radius: 8px;
    border: 1px solid ${({ $active }) => ($active ? "var(--main-color)" : "#d7ddea")};
    background: ${({ $active }) => ($active ? "var(--main-color)" : "#fff")};
    color: ${({ $active }) => ($active ? "#fff" : "#2d3a54")};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex: 0 0 auto;
    justify-content: center;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;

    svg {
        width: 12px;
        height: 12px;
    }
`;

const List = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (min-width: 960px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }
`;

const Item = styled.li`
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);

    @media (min-width: 960px) {
        padding: 16px;
        border-radius: 14px;
    }
`;

const MetaText = styled.span`
    font-size: 12px;
    color: #6b7890;
`;

const OperationType = styled.span`
    font-size: 12px;
    color: var(--main-color-accent);
    font-weight: 700;
`;

const TitleText = styled.strong`
    font-size: 15px;
    color: #132647;
`;

const DetailsList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const DetailRow = styled.li`
    font-size: 13px;
    color: #4a5872;
`;

const ModeratorNote = styled.section<{ $variant: "approved" | "rejected" }>`
    border-radius: 10px;
    border: 1px solid
        ${({ $variant }) => ($variant === "rejected" ? "#f3c1c1" : "#c8dcc0")};
    background: ${({ $variant }) => ($variant === "rejected" ? "#fff5f5" : "#f4faf1")};
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const ModeratorLabel = styled.strong<{ $variant: "approved" | "rejected" }>`
    font-size: 12px;
    color: ${({ $variant }) => ($variant === "rejected" ? "#863838" : "#38593a")};
    text-transform: uppercase;
`;

const ModeratorText = styled.p<{ $variant: "approved" | "rejected" }>`
    margin: 0;
    font-size: 13px;
    color: ${({ $variant }) => ($variant === "rejected" ? "#7b2b2b" : "#3f5a42")};
    line-height: 1.45;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
`;

const ModeratorExtendedCard = styled.section<{ $variant: "approved" | "rejected" }>`
    border-radius: 12px;
    border: 1px solid
        ${({ $variant }) => ($variant === "rejected" ? "#f2b7b7" : "#b8d4ae")};
    background: ${({ $variant }) =>
        $variant === "rejected"
            ? "linear-gradient(180deg, #fff5f5 0%, #fff 100%)"
            : "linear-gradient(180deg, #f4faf1 0%, #fff 100%)"};
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Row = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
`;

const Badge = styled.span<{ $status: ModerationStatus }>`
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 700;
    color: ${({ $status }) => MODERATION_STATUS_BADGE[$status].color};
    background: ${({ $status }) => MODERATION_STATUS_BADGE[$status].background};
`;

const EmptyState = styled.p`
    margin: 0;
    padding: 24px 12px;
    text-align: center;
    color: #6b7890;
    font-size: 14px;
`;

const CancelRequestButton = styled.button`
    align-self: flex-start;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    background: #fff;
    color: #2d3a54;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover:not(:disabled) {
        background: #f5f7fb;
        border-color: #b8c4da;
    }

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
`;

const FILTERS: { value: AuthorFeedFilter; label: string; icon: typeof ListIcon }[] = [
    { value: "ALL", label: "Все", icon: ListIcon },
    { value: "PENDING", label: "На модерации", icon: Clock3 },
    { value: "APPROVED", label: "Одобрены", icon: Check },
    { value: "REJECTED", label: "Отклонены", icon: CircleAlert },
];

export function AuthorFeedPage() {
    const { filter, setFilter, items, loading, isError } = useAuthorFeed();
    const { cancelRequest, isCancelling } = useCancelModerationRequest();
    const filtersRef = useRef<HTMLDivElement | null>(null);
    const [thumbLeftPercent, setThumbLeftPercent] = useState(0);
    const [thumbWidthPercent, setThumbWidthPercent] = useState(100);

    useEffect(() => {
        const node = filtersRef.current;
        if (!node) {
            return;
        }

        const updateThumb = () => {
            const { scrollLeft, scrollWidth, clientWidth } = node;
            if (scrollWidth <= clientWidth) {
                setThumbWidthPercent(100);
                setThumbLeftPercent(0);
                return;
            }

            const widthPercent = (clientWidth / scrollWidth) * 100;
            const maxScroll = scrollWidth - clientWidth;
            const leftPercent = (scrollLeft / maxScroll) * (100 - widthPercent);
            setThumbWidthPercent(widthPercent);
            setThumbLeftPercent(leftPercent);
        };

        updateThumb();
        node.addEventListener("scroll", updateThumb, { passive: true });
        window.addEventListener("resize", updateThumb);

        return () => {
            node.removeEventListener("scroll", updateThumb);
            window.removeEventListener("resize", updateThumb);
        };
    }, []);

    return (
        <>
            <SetAdminChrome title="Лента" />
            <FilterWrap>
                <FilterRow ref={filtersRef}>
                    {FILTERS.map(({ value, label, icon: Icon }) => (
                        <FilterButton
                            key={value}
                            type="button"
                            $active={filter === value}
                            onClick={() => setFilter(value)}
                        >
                            <Icon aria-hidden />
                            {label}
                        </FilterButton>
                    ))}
                </FilterRow>
                <ScrollbarTrack>
                    <ScrollbarThumb
                        $widthPercent={thumbWidthPercent}
                        $leftPercent={thumbLeftPercent}
                    />
                </ScrollbarTrack>
            </FilterWrap>

            {loading ? <EmptyState>Загрузка ленты…</EmptyState> : null}
            {!loading && isError ? (
                <EmptyState>Не удалось загрузить ленту операций.</EmptyState>
            ) : null}
            {!loading && !isError && items.length === 0 ? (
                <EmptyState>
                    {filter === "ALL"
                        ? "Операций пока нет. Создайте товар — он появится здесь после отправки на модерацию."
                        : "Нет операций с выбранным статусом."}
                </EmptyState>
            ) : null}

            {!loading && !isError && items.length > 0 ? (
                <List>
                    {items.map((item) => {
                        const hasModeratorComment =
                            item.status !== "PENDING" && Boolean(item.moderatorComment);
                        const moderatorVariant =
                            item.status === "REJECTED" ? "rejected" : "approved";
                        const hasExtendedModeratorCard =
                            hasModeratorComment && item.moderatorComment!.length > 120;

                        return (
                            <Item key={item.id}>
                                <Row>
                                    <OperationType>
                                        {AUTHOR_FEED_OPERATION_LABELS[item.operationType]}
                                    </OperationType>
                                    <Badge $status={item.status}>
                                        {MODERATION_STATUS_LABELS[item.status]}
                                    </Badge>
                                </Row>
                                <TitleText>{item.title}</TitleText>
                                <MetaText>{formatOrderDate(item.createdAt)}</MetaText>
                                <DetailsList>
                                    {item.details.map((detail) => (
                                        <DetailRow key={`${item.id}-${detail}`}>{detail}</DetailRow>
                                    ))}
                                </DetailsList>
                                {item.status === "PENDING" ? (
                                    (() => {
                                        const target = parseModerationRequestTarget(item.id);
                                        if (!target) {
                                            return null;
                                        }

                                        return (
                                            <CancelRequestButton
                                                type="button"
                                                disabled={isCancelling(item.id)}
                                                onClick={() => {
                                                    void cancelRequest(item.id, target);
                                                }}
                                            >
                                                {isCancelling(item.id)
                                                    ? "Отмена…"
                                                    : "Отменить заявку"}
                                            </CancelRequestButton>
                                        );
                                    })()
                                ) : null}
                                {hasModeratorComment ? (
                                    hasExtendedModeratorCard ? (
                                        <ModeratorExtendedCard $variant={moderatorVariant}>
                                            <ModeratorLabel $variant={moderatorVariant}>
                                                Комментарий модератора
                                            </ModeratorLabel>
                                            <ModeratorText $variant={moderatorVariant}>
                                                {item.moderatorComment}
                                            </ModeratorText>
                                        </ModeratorExtendedCard>
                                    ) : (
                                        <ModeratorNote $variant={moderatorVariant}>
                                            <ModeratorLabel $variant={moderatorVariant}>
                                                Комментарий модератора
                                            </ModeratorLabel>
                                            <ModeratorText $variant={moderatorVariant}>
                                                {item.moderatorComment}
                                            </ModeratorText>
                                        </ModeratorNote>
                                    )
                                ) : null}
                            </Item>
                        );
                    })}
                </List>
            ) : null}
        </>
    );
}
