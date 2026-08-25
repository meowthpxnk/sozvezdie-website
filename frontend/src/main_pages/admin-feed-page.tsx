"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Check, CircleAlert, Clock3, List as ListIcon } from "lucide-react";
import { SetAdminChrome } from "@widgets/AdminShell";
import { ADMIN_FEED_OPERATIONS, ADMIN_OPERATION_LABELS } from "@/src/shared/mocks/admin-feed";
import type { ModerationStatus } from "@/src/shared/types/seller";

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
`;

const Item = styled.li`
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
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

const ModeratorNote = styled.section`
    border-radius: 10px;
    border: 1px solid #f3c1c1;
    background: #fff5f5;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const ModeratorLabel = styled.strong`
    font-size: 12px;
    color: #863838;
    text-transform: uppercase;
`;

const ModeratorText = styled.p`
    margin: 0;
    font-size: 13px;
    color: #7b2b2b;
    line-height: 1.45;
`;

const ModeratorExtendedCard = styled.section`
    border-radius: 12px;
    border: 1px solid #f2b7b7;
    background: linear-gradient(180deg, #fff5f5 0%, #fff 100%);
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
    color: ${({ $status }) => ($status === "approved" ? "#38593a" : $status === "rejected" ? "#863838" : "#314e7b")};
    background: ${({ $status }) => ($status === "approved" ? "#e3efd6" : $status === "rejected" ? "#fde6e9" : "var(--main-color-tint-soft)")};
`;

const moderationLabels: Record<ModerationStatus, string> = {
    pending: "На модерации",
    approved: "Одобрен",
    rejected: "Отклонен",
};

export const AdminFeedPage = () => {
    const [filter, setFilter] = useState<ModerationStatus | "all">("all");
    const [thumbLeftPercent, setThumbLeftPercent] = useState(0);
    const [thumbWidthPercent, setThumbWidthPercent] = useState(100);
    const filtersRef = useRef<HTMLDivElement | null>(null);
    const filtered = useMemo(() => {
        if (filter === "all") {
            return ADMIN_FEED_OPERATIONS;
        }
        return ADMIN_FEED_OPERATIONS.filter((operation) => operation.status === filter);
    }, [filter]);

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
                    <FilterButton type="button" $active={filter === "all"} onClick={() => setFilter("all")}>
                        <ListIcon aria-hidden />
                        Все
                    </FilterButton>
                    <FilterButton type="button" $active={filter === "pending"} onClick={() => setFilter("pending")}>
                        <Clock3 aria-hidden />
                        На модерации
                    </FilterButton>
                    <FilterButton type="button" $active={filter === "approved"} onClick={() => setFilter("approved")}>
                        <Check aria-hidden />
                        Одобрены
                    </FilterButton>
                    <FilterButton type="button" $active={filter === "rejected"} onClick={() => setFilter("rejected")}>
                        <CircleAlert aria-hidden />
                        Отклонены
                    </FilterButton>
                </FilterRow>
                <ScrollbarTrack>
                    <ScrollbarThumb $widthPercent={thumbWidthPercent} $leftPercent={thumbLeftPercent} />
                </ScrollbarTrack>
            </FilterWrap>
            <List>
                {filtered.map((product) => (
                    <Item key={product.id}>
                        <Row>
                            <OperationType>{ADMIN_OPERATION_LABELS[product.type]}</OperationType>
                            <Badge $status={product.status}>{moderationLabels[product.status]}</Badge>
                        </Row>
                        <TitleText>{product.title}</TitleText>
                        <MetaText>{product.createdAt}</MetaText>
                        <DetailsList>
                            {product.details.map((detail) => (
                                <DetailRow key={`${product.id}-${detail}`}>{detail}</DetailRow>
                            ))}
                        </DetailsList>
                        {product.status === "rejected" && product.moderatorMessage ? (
                            product.hasExtendedModeratorCard ? (
                                <ModeratorExtendedCard>
                                    <ModeratorLabel>Комментарий модератора</ModeratorLabel>
                                    <ModeratorText>{product.moderatorMessage}</ModeratorText>
                                </ModeratorExtendedCard>
                            ) : (
                                <ModeratorNote>
                                    <ModeratorLabel>Комментарий модератора</ModeratorLabel>
                                    <ModeratorText>{product.moderatorMessage}</ModeratorText>
                                </ModeratorNote>
                            )
                        ) : null}
                    </Item>
                ))}
            </List>
        </>
    );
};
