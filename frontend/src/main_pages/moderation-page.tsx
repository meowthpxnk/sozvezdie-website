"use client";

import { useMemo, useState } from "react";
import { Fragment } from "react";
import styled from "styled-components";
import { Check, CircleAlert, Clock3, Eye, X } from "lucide-react";
import { SetAdminChrome } from "@widgets/AdminShell";
import { MODERATION_ACTION_LABELS, MODERATION_PROPOSALS } from "@/src/shared/mocks/moderation-feed";
import type { ModerationStatus } from "@/src/shared/types/seller";
import { IconActionButton } from "@/src/shared/ui/icon-action-button";

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
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
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

const ORDER_STATUS_BADGE: Record<ModerationStatus, { background: string; color: string }> = {
    rejected: { background: "#fde6e9", color: "#863838" },
    approved: { background: "#e3efd6", color: "#38593a" },
    pending: { background: "var(--main-color-tint-soft)", color: "#314e7b" },
};

const StatusBadge = styled.span<{ $status: ModerationStatus }>`
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 700;
    color: ${({ $status }) => ORDER_STATUS_BADGE[$status].color};
    background: ${({ $status }) => ORDER_STATUS_BADGE[$status].background};
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

const ViewButton = styled(IconActionButton).attrs({ $active: true })``;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(6, 10, 18, 0.63);
    backdrop-filter: blur(10px);
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
`;

const ModalCard = styled.section`
    width: min(100%, 760px);
    max-height: calc(100vh - 40px);
    overflow: auto;
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
`;

const ModalCloseButton = styled.button`
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid #dc3545;
    background: #dc3545;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 22px;
    color: #111;
`;

const PreviewCard = styled.section`
    border-radius: 12px;
    border: 1px solid #d7ddea;
    background: #fff;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const ProductPreviewImage = styled.img`
    width: 100%;
    height: 220px;
    border-radius: 10px;
    object-fit: cover;
    display: block;
    background: #f1f4fa;
    border: 1px solid #dfe5f1;
`;

const ProductPreviewPrice = styled.strong`
    font-size: 26px;
    color: var(--main-color);
    line-height: 1.1;
`;

const ProductPreviewTitle = styled.strong`
    font-size: 18px;
    color: #111;
`;

const ProductPreviewDescription = styled.p`
    margin: 0;
    font-size: 13px;
    color: #4a5872;
    line-height: 1.45;
`;

const BrandPreviewBanner = styled.div`
    width: 100%;
    min-height: 150px;
    border-radius: 12px;
    padding: 18px;
    color: #fff;
    background: var(--author-banner-gradient-strong);
    display: flex;
    align-items: center;
    gap: 12px;
    background-size: cover;
    background-position: center;
`;

const BrandPreviewAvatar = styled.img`
    width: 58px;
    height: 58px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
    object-fit: cover;
    display: block;
`;

const BrandPreviewMeta = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const BrandPreviewTitle = styled.strong`
    font-size: 20px;
`;

const BrandPreviewDescription = styled.p`
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.92);
`;

const ChangesTable = styled.div`
    display: grid;
    grid-template-columns: 180px 1fr 1fr;
    gap: 8px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: 6px;
    }
`;

const TableHead = styled.div`
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    color: #6b7890;
    padding: 6px 8px;

    @media (max-width: 640px) {
        display: none;
    }
`;

const TableCell = styled.div<{ $after?: boolean; $label?: boolean; $mobileTitle?: string }>`
    border-radius: 8px;
    border: 1px solid ${({ $after }) => ($after ? "#cde1fd" : "#e3e8f4")};
    background: ${({ $after, $label }) => ($label ? "#f4f7fc" : $after ? "#edf6ff" : "#fafbfe")};
    padding: 8px;
    font-size: 13px;
    color: ${({ $label }) => ($label ? "var(--main-color-accent)" : "#2d3a54")};
    font-weight: ${({ $label }) => ($label ? 700 : 500)};
    overflow-wrap: anywhere;

    @media (max-width: 640px) {
        ${({ $label }) =>
        $label
            ? `
            margin-top: 6px;
            border-color: #d6e1f6;
            background: #edf3ff;
        `
            : ""}

        ${({ $mobileTitle, $label }) =>
        !$label && $mobileTitle
            ? `
            &::before {
                content: "${$mobileTitle}";
                display: block;
                margin-bottom: 6px;
                font-size: 11px;
                text-transform: uppercase;
                font-weight: 700;
                color: #6b7890;
            }
        `
            : ""}
    }
`;

const ImageDiffInline = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 640px) {
        align-items: flex-start;
    }
`;

const ImageDiffThumb = styled.button`
    width: 42px;
    height: 42px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    background: #f0f4fb;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: zoom-in;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const FullscreenImageOverlay = styled.div<{ $open: boolean }>`
    position: fixed;
    inset: 0;
    z-index: 1400;
    background: rgba(9, 14, 24, 0.78);
    backdrop-filter: blur(6px);
    display: ${({ $open }) => ($open ? "flex" : "none")};
    align-items: center;
    justify-content: center;
    padding: 16px;
`;

const FullscreenImage = styled.img`
    max-width: min(1200px, 100%);
    max-height: calc(100vh - 32px);
    object-fit: contain;
    border-radius: 12px;
    display: block;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const ApproveButton = styled.button`
    min-height: 34px;
    padding: 0 12px;
    border-radius: 8px;
    border: none;
    background: var(--main-color);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: var(--main-color-hover);
    }
`;

const statusLabels: Record<ModerationStatus, string> = {
    pending: "На модерации",
    approved: "Принято",
    rejected: "Отклонено",
};

const getChangeValue = (
    changes: Array<{ label: string; before: string; after: string }>,
    target: string,
    mode: "before" | "after"
) => changes.find((item) => item.label === target)?.[mode] ?? "—";

export const ModerationPage = () => {
    const [filter, setFilter] = useState<ModerationStatus>("pending");
    const [openedId, setOpenedId] = useState<string | null>(null);
    const [fullscreenImage, setFullscreenImage] = useState<{ src: string; alt: string } | null>(null);
    const [proposals, setProposals] = useState(MODERATION_PROPOSALS);
    const filtered = useMemo(() => proposals.filter((item) => item.status === filter), [filter, proposals]);
    const openedProposal = proposals.find((item) => item.id === openedId) ?? null;

    return (
        <>
            <SetAdminChrome title="Лента модерации" />
            <FilterRow>
                <FilterButton type="button" $active={filter === "pending"} onClick={() => setFilter("pending")}>
                    <Clock3 size={12} />
                    На модерации
                </FilterButton>
                <FilterButton type="button" $active={filter === "approved"} onClick={() => setFilter("approved")}>
                    <Check size={12} />
                    Принятые
                </FilterButton>
                <FilterButton type="button" $active={filter === "rejected"} onClick={() => setFilter("rejected")}>
                    <CircleAlert size={12} />
                    Отклоненные
                </FilterButton>
            </FilterRow>
            <List>
                {filtered.map((item) => (
                    <Card key={item.id}>
                        <Row>
                            <TypeLabel>{MODERATION_ACTION_LABELS[item.type]}</TypeLabel>
                            <StatusBadge $status={item.status}>{statusLabels[item.status]}</StatusBadge>
                        </Row>
                        <Title>{item.title}</Title>
                        <Meta>{item.createdAt}</Meta>
                        <Description>Автор предложения: {item.submittedBy}</Description>
                        {item.moderatedBy ? <Description>Промодерировал: {item.moderatedBy}</Description> : null}
                        {item.moderationComment ? <Description>Комментарий: {item.moderationComment}</Description> : null}
                        <ViewButton type="button" aria-label="Посмотреть изменения" title="Посмотреть изменения" onClick={() => setOpenedId(item.id)}>
                            <Eye size={14} />
                        </ViewButton>
                    </Card>
                ))}
            </List>
            <ModalOverlay $isOpen={openedProposal !== null} onClick={() => setOpenedId(null)}>
                <ModalCard onClick={(event) => event.stopPropagation()}>
                    <ModalCloseButton type="button" aria-label="Закрыть" onClick={() => setOpenedId(null)}>
                        <X size={16} />
                    </ModalCloseButton>
                    <ModalTitle>{openedProposal?.title}</ModalTitle>
                    <Description>{openedProposal ? MODERATION_ACTION_LABELS[openedProposal.type] : ""}</Description>
                    {openedProposal && openedProposal.type !== "delete_product" ? (
                        <PreviewCard>
                            {openedProposal.type === "create_product" || openedProposal.type === "update_product" ? (
                                <>
                                    <ProductPreviewImage
                                        src={openedProposal.previewImageUrl ?? "https://placeholdpicsum.dev/photo/1200/900?seed=mod-fallback-preview"}
                                        alt={openedProposal.title}
                                    />
                                    <ProductPreviewPrice>{getChangeValue(openedProposal.changes, "Цена", "after")}</ProductPreviewPrice>
                                    <ProductPreviewTitle>{getChangeValue(openedProposal.changes, "Название", "after")}</ProductPreviewTitle>
                                    <ProductPreviewDescription>
                                        {getChangeValue(openedProposal.changes, "Описание", "after")}
                                    </ProductPreviewDescription>
                                </>
                            ) : (
                                <BrandPreviewBanner
                                    style={{
                                        backgroundImage: `var(--author-banner-gradient-strong), url(${openedProposal.previewBannerUrl ?? "https://placeholdpicsum.dev/photo/1400/700?seed=mod-fallback-banner"})`,
                                    }}
                                >
                                    <BrandPreviewAvatar
                                        src={openedProposal.previewAvatarUrl ?? "https://placeholdpicsum.dev/photo/300/300?seed=mod-fallback-avatar"}
                                        alt="Аватар"
                                    />
                                    <BrandPreviewMeta>
                                        <BrandPreviewTitle>
                                            {openedProposal.type === "update_brand"
                                                ? getChangeValue(openedProposal.changes, "Название бренда", "after")
                                                : getChangeValue(openedProposal.changes, "Название магазина", "after")}
                                        </BrandPreviewTitle>
                                        <BrandPreviewDescription>
                                            {openedProposal.type === "update_brand"
                                                ? getChangeValue(openedProposal.changes, "Описание бренда", "after")
                                                : getChangeValue(openedProposal.changes, "Описание", "after")}
                                        </BrandPreviewDescription>
                                    </BrandPreviewMeta>
                                </BrandPreviewBanner>
                            )}
                        </PreviewCard>
                    ) : null}
                    {openedProposal ? (
                        <ChangesTable>
                            <TableHead>Поле</TableHead>
                            <TableHead>Было</TableHead>
                            <TableHead>Стало</TableHead>
                            {openedProposal.changes.map((change) => (
                                <Fragment key={`${openedProposal.id}-${change.label}`}>
                                    <TableCell $label>
                                        {change.label}
                                    </TableCell>
                                    <TableCell $mobileTitle="Было">
                                        {change.beforeImageUrl ? (
                                            <ImageDiffInline>
                                                <ImageDiffThumb
                                                    type="button"
                                                    aria-label={`Открыть изображение "было" для поля ${change.label}`}
                                                    onClick={() =>
                                                        setFullscreenImage({ src: change.beforeImageUrl as string, alt: `${change.label} — было` })
                                                    }
                                                >
                                                    <img src={change.beforeImageUrl} alt={`${change.label} — было`} />
                                                </ImageDiffThumb>
                                                <span>{change.before}</span>
                                            </ImageDiffInline>
                                        ) : (
                                            change.before
                                        )}
                                    </TableCell>
                                    <TableCell $after $mobileTitle="Стало">
                                        {change.afterImageUrl ? (
                                            <ImageDiffInline>
                                                <ImageDiffThumb
                                                    type="button"
                                                    aria-label={`Открыть изображение "стало" для поля ${change.label}`}
                                                    onClick={() =>
                                                        setFullscreenImage({ src: change.afterImageUrl as string, alt: `${change.label} — стало` })
                                                    }
                                                >
                                                    <img src={change.afterImageUrl} alt={`${change.label} — стало`} />
                                                </ImageDiffThumb>
                                                <span>{change.after}</span>
                                            </ImageDiffInline>
                                        ) : (
                                            change.after
                                        )}
                                    </TableCell>
                                </Fragment>
                            ))}
                        </ChangesTable>
                    ) : null}
                    {openedProposal?.status === "pending" ? (
                        <ModalActions>
                            <ApproveButton
                                type="button"
                                onClick={() => {
                                    const proposalId = openedProposal.id;
                                    setProposals((prev) =>
                                        prev.map((item) =>
                                            item.id === proposalId
                                                ? {
                                                    ...item,
                                                    status: "approved",
                                                    moderatedBy: "@moderator.current",
                                                    moderationComment: "Заявка принята модератором.",
                                                }
                                                : item
                                        )
                                    );
                                    setOpenedId(null);
                                    setFilter("approved");
                                }}
                            >
                                Принять
                            </ApproveButton>
                        </ModalActions>
                    ) : null}
                </ModalCard>
            </ModalOverlay>
            <FullscreenImageOverlay $open={fullscreenImage !== null} onClick={() => setFullscreenImage(null)}>
                {fullscreenImage ? (
                    <FullscreenImage src={fullscreenImage.src} alt={fullscreenImage.alt} onClick={(event) => event.stopPropagation()} />
                ) : null}
            </FullscreenImageOverlay>
        </>
    );
};
