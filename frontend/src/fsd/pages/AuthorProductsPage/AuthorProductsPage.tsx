"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { Check, CircleAlert, Clock3, List as ListIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import { SetAdminChrome } from "@widgets/AdminShell";
import { IconActionButton } from "@/src/shared/ui/icon-action-button";
import {
    DELETION_REQUEST_STATUS_LABELS,
    MODERATION_STATUS_BADGE,
    MODERATION_STATUS_LABELS,
    type ModerationStatus,
    type SellerProduct,
} from "@entities/author/seller-product.types";
import authorService from "@entities/author/author.service";
import { getMediaImageUrl } from "@shared/lib/media-url";
import { priceFormatter } from "@shared/formatters";
import { useCancelModerationRequest } from "@entities/author/hooks/useCancelModerationRequest";
import { toast } from "sonner";

import { useAuthorProducts } from "./useAuthorProducts";

type ProductsFilter = ModerationStatus | "ALL";

const STATUS_FILTERS: {
    value: ProductsFilter;
    label: string;
    icon: typeof ListIcon;
}[] = [
    { value: "ALL", label: "Все", icon: ListIcon },
    { value: "PENDING", label: "На модерации", icon: Clock3 },
    { value: "APPROVED", label: "Одобрены", icon: Check },
    { value: "REJECTED", label: "Отклонены", icon: CircleAlert },
];

function parseStatusFilter(value: string | null): ProductsFilter {
    if (value === "PENDING" || value === "APPROVED" || value === "REJECTED") {
        return value;
    }
    return "ALL";
}

const AddProductButton = styled(Link)`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: var(--main-color);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 4px;
    text-decoration: none;
    transition: background-color 0.2s ease;
    appearance: none;

    &:hover {
        background: var(--main-color-hover);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    svg {
        width: 14px;
        height: 14px;
    }
`;

const PageLayout = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const FilterRow = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
    min-height: 30px;
    padding: 0 10px;
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
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;

    svg {
        width: 12px;
        height: 12px;
    }
`;

const List = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    background: #f6f7f9;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    min-height: 100px;
`;

const ItemLeft = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    flex: 1;
    position: relative;
`;

const ItemImageWrapper = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 10px;
    overflow: hidden;
    background: #f0f0f0;
    flex-shrink: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const ItemMeta = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 4px;
    min-width: 0;
    flex: 1;
    padding-right: 84px;
`;

const ItemName = styled.strong`
    display: block;
    width: 100%;
    font-size: 16px;
    font-weight: 600;
    color: #1f2430;
`;

const ItemActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    position: absolute;
    right: 12px;
    bottom: 10px;
`;

const EditButton = styled(Link)`
    width: 28px;
    height: 28px;
    padding: 0;
    text-decoration: none;
    border-radius: 8px;
    border: none;
    background: var(--main-color);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.2s ease;
    appearance: none;

    &:hover {
        background: var(--main-color-hover);
    }

    svg {
        width: 14px;
        height: 14px;
    }
`;

const DeleteButton = styled(IconActionButton).attrs({ $active: true })`
    background: #dc3545;
    border-color: #dc3545;
    color: #fff;

    &:hover {
        background: #c82333;
        border-color: #c82333;
    }
`;

const ItemBottomRow = styled.div`
    display: contents;
`;

const PriceStockColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
`;

const ItemPrice = styled.span`
    font-size: 20px;
    font-weight: 600;
    color: var(--main-color);
    line-height: 1.1;
`;

const ItemStock = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #666;
    text-align: left;
`;

const StatusBadge = styled.span<{ $status: keyof typeof MODERATION_STATUS_BADGE }>`
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    background: ${({ $status }) => MODERATION_STATUS_BADGE[$status].background};
    color: ${({ $status }) => MODERATION_STATUS_BADGE[$status].color};
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    color: #666;
`;

const EmptyLink = styled(Link)`
    color: var(--main-color);
    font-weight: 600;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

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
    width: min(100%, 520px);
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    color: #111;
`;

const ModalText = styled.p`
    margin: 0;
    font-size: 14px;
    color: #4a5872;
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

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const DangerButton = styled.button`
    min-height: 34px;
    padding: 0 10px;
    border-radius: 8px;
    border: 1px solid #f3c1c1;
    background: #fff5f5;
    color: #b52121;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
        background: #ffe7e7;
        border-color: #e7aaaa;
    }
`;

const ReasonField = styled.textarea`
    width: 100%;
    min-height: 88px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    padding: 10px;
    font-size: 14px;
    color: #000;
    resize: vertical;
    box-sizing: border-box;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const BadgeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const ModeratorComment = styled.p<{ $variant: "approved" | "rejected" }>`
    margin: 0;
    width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid
        ${({ $variant }) => ($variant === "rejected" ? "#f3c1c1" : "#c8dcc0")};
    background: ${({ $variant }) => ($variant === "rejected" ? "#fff5f5" : "#f4faf1")};
    color: ${({ $variant }) => ($variant === "rejected" ? "#7b2b2b" : "#3f5a42")};
    font-size: 12px;
    line-height: 1.45;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
`;

const SecondaryButton = styled.button`
    min-height: 34px;
    padding: 0 10px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    background: #fff;
    color: #2d3a54;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

const getProductImage = (images: string[]): string =>
    getMediaImageUrl(images[0]) ?? "https://placeholdpicsum.dev/photo/200/200?seed=product";

type DeleteModalMode = "cancel-create" | "request-deletion" | "cancel-deletion";

function resolveDeleteModalMode(product: SellerProduct | null): DeleteModalMode | null {
    if (!product) {
        return null;
    }

    if (product.deletionRequestStatus === "APPROVED") {
        return null;
    }

    if (product.moderationStatus === "PENDING") {
        return "cancel-create";
    }

    if (product.deletionRequestStatus === "PENDING") {
        return "cancel-deletion";
    }

    if (product.moderationStatus === "APPROVED") {
        return "request-deletion";
    }

    return null;
}

function canShowDeleteAction(product: SellerProduct): boolean {
    return resolveDeleteModalMode(product) !== null;
}

export const AuthorProductsPage = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const statusFilter = parseStatusFilter(searchParams.get("status"));
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [deletionReason, setDeletionReason] = useState("");
    const [isSubmitting, setSubmitting] = useState(false);
    const { products, loading, isError, refetch } = useAuthorProducts();
    const { cancelRequest, isCancelling } = useCancelModerationRequest();
    const filteredProducts = useMemo(() => {
        if (statusFilter === "ALL") {
            return products;
        }
        return products.filter((product) => product.moderationStatus === statusFilter);
    }, [products, statusFilter]);
    const deletingProduct = products.find((product) => product.id === deletingProductId) ?? null;
    const deleteModalMode = resolveDeleteModalMode(deletingProduct);
    const isPendingCancellation =
        deleteModalMode === "cancel-create" && deletingProductId
            ? isCancelling(`product-${deletingProductId}`)
            : deleteModalMode === "cancel-deletion" && deletingProductId
              ? isCancelling(`product-delete-${deletingProductId}`)
              : false;
    const isBusy = isPendingCancellation || isSubmitting;

    const setStatusFilter = (nextFilter: ProductsFilter) => {
        const params = new URLSearchParams(searchParams.toString());
        if (nextFilter === "ALL") {
            params.delete("status");
        } else {
            params.set("status", nextFilter);
        }
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    const titleRight = useMemo(
        () => (
            <AddProductButton href="/admin/products/new" aria-label="Добавить товар">
                <Plus aria-hidden />
            </AddProductButton>
        ),
        []
    );

    if (loading) {
        return (
            <>
                <SetAdminChrome title="Товары" titleRight={titleRight} />
                <EmptyState>Загрузка товаров…</EmptyState>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <SetAdminChrome title="Товары" titleRight={titleRight} />
                <EmptyState>Не удалось загрузить список товаров.</EmptyState>
            </>
        );
    }

    const emptyMessage =
        products.length === 0 ? (
            <>
                Товаров пока нет.{" "}
                <EmptyLink href="/admin/products/new">Создать первый товар</EmptyLink>
            </>
        ) : statusFilter === "PENDING" ? (
            "Нет товаров на модерации."
        ) : statusFilter === "APPROVED" ? (
            "Нет одобренных товаров."
        ) : statusFilter === "REJECTED" ? (
            "Нет отклонённых товаров."
        ) : (
            "Товаров пока нет."
        );

    return (
        <>
            <SetAdminChrome title="Товары" titleRight={titleRight} />
            <PageLayout>
                <FilterRow>
                    {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
                        <FilterButton
                            key={value}
                            type="button"
                            $active={statusFilter === value}
                            onClick={() => setStatusFilter(value)}
                        >
                            <Icon aria-hidden />
                            {label}
                        </FilterButton>
                    ))}
                </FilterRow>
                {filteredProducts.length === 0 ? (
                    <EmptyState>{emptyMessage}</EmptyState>
                ) : (
                    <List>
                        {filteredProducts.map((product) => (
                            <Item key={product.id}>
                                <ItemLeft>
                                    <ItemImageWrapper>
                                        <img
                                            src={getProductImage(product.images)}
                                            alt={product.name}
                                        />
                                    </ItemImageWrapper>
                                    <ItemMeta>
                                        <ItemName>{product.name}</ItemName>
                                        <BadgeRow>
                                            <StatusBadge $status={product.moderationStatus}>
                                                {MODERATION_STATUS_LABELS[product.moderationStatus]}
                                            </StatusBadge>
                                            {product.deletionRequestStatus ? (
                                                <StatusBadge $status={product.deletionRequestStatus}>
                                                    {
                                                        DELETION_REQUEST_STATUS_LABELS[
                                                            product.deletionRequestStatus
                                                        ]
                                                    }
                                                </StatusBadge>
                                            ) : null}
                                        </BadgeRow>
                                        <ItemActions>
                                            {product.deletionRequestStatus !== "PENDING" &&
                                            product.deletionRequestStatus !== "APPROVED" ? (
                                                <EditButton
                                                    href={`/admin/products/${product.id}/edit`}
                                                    aria-label={`Редактировать ${product.name}`}
                                                >
                                                    <Pencil size={14} />
                                                </EditButton>
                                            ) : null}
                                            {canShowDeleteAction(product) ? (
                                                <DeleteButton
                                                    type="button"
                                                    aria-label={
                                                        product.deletionRequestStatus === "PENDING"
                                                            ? `Отменить заявку на удаление ${product.name}`
                                                            : product.moderationStatus === "PENDING"
                                                              ? `Отменить заявку на модерацию ${product.name}`
                                                              : `Запросить удаление ${product.name}`
                                                    }
                                                    onClick={() => {
                                                        setDeletingProductId(product.id);
                                                        setDeletionReason(
                                                            product.deletionRequestReason ?? ""
                                                        );
                                                        setDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </DeleteButton>
                                            ) : null}
                                        </ItemActions>
                                        <ItemBottomRow>
                                            <PriceStockColumn>
                                                <ItemPrice>
                                                    {priceFormatter(product.price)}
                                                </ItemPrice>
                                                <ItemStock>
                                                    В наличии: {product.stockCount} шт.
                                                </ItemStock>
                                            </PriceStockColumn>
                                        </ItemBottomRow>
                                    </ItemMeta>
                                </ItemLeft>
                                {product.moderationStatus === "REJECTED" &&
                                product.moderatorComment ? (
                                    <ModeratorComment $variant="rejected">
                                        {product.moderatorComment}
                                    </ModeratorComment>
                                ) : null}
                            </Item>
                        ))}
                    </List>
                )}
            </PageLayout>
            <ModalOverlay
                $isOpen={isDeleteModalOpen}
                onClick={() => (!isBusy ? setDeleteModalOpen(false) : undefined)}
            >
                <ModalCard onClick={(event) => event.stopPropagation()}>
                    <ModalCloseButton
                        type="button"
                        aria-label="Закрыть модальное окно"
                        onClick={() => {
                            if (!isBusy) {
                                setDeleteModalOpen(false);
                                setDeletingProductId(null);
                                setDeletionReason("");
                            }
                        }}
                    >
                        <X size={16} />
                    </ModalCloseButton>
                    <ModalTitle>
                        {deleteModalMode === "request-deletion"
                            ? "Запросить удаление товара?"
                            : deleteModalMode === "cancel-deletion"
                              ? "Отменить заявку на удаление?"
                              : "Отменить заявку на модерацию?"}
                    </ModalTitle>
                    <ModalText>
                        {deleteModalMode === "request-deletion" && deletingProduct
                            ? `Товар «${deletingProduct.name}» останется в каталоге до решения модератора. После одобрения он будет удалён без возможности восстановления.`
                            : deleteModalMode === "cancel-deletion" && deletingProduct
                              ? `Заявка на удаление «${deletingProduct.name}» будет отменена, товар снова останется активным.`
                              : deletingProduct
                                ? `Товар «${deletingProduct.name}» будет удалён, заявка исчезнет из ленты модерации.`
                                : "Заявка будет отменена."}
                    </ModalText>
                    {deleteModalMode === "request-deletion" ? (
                        <ReasonField
                            value={deletionReason}
                            onChange={(event) => setDeletionReason(event.target.value)}
                            placeholder="Причина удаления (необязательно)"
                        />
                    ) : null}
                    <ModalActions>
                        <SecondaryButton
                            type="button"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setDeletingProductId(null);
                                setDeletionReason("");
                            }}
                            disabled={isBusy}
                        >
                            Назад
                        </SecondaryButton>
                        <DangerButton
                            type="button"
                            disabled={isBusy || !deletingProductId || !deleteModalMode}
                            onClick={() => {
                                if (!deletingProductId || !deleteModalMode) {
                                    return;
                                }

                                if (deleteModalMode === "request-deletion") {
                                    setSubmitting(true);
                                    void authorService
                                        .requestProductDeletion(
                                            deletingProductId,
                                            deletionReason
                                        )
                                        .then(() => {
                                            toast.success(
                                                "Заявка на удаление отправлена модератору"
                                            );
                                            setDeleteModalOpen(false);
                                            setDeletingProductId(null);
                                            setDeletionReason("");
                                            void refetch();
                                        })
                                        .catch((error: unknown) => {
                                            const detail =
                                                typeof error === "object" &&
                                                error !== null &&
                                                "response" in error &&
                                                typeof (
                                                    error as {
                                                        response?: { data?: { detail?: string } };
                                                    }
                                                ).response?.data?.detail === "string"
                                                    ? (
                                                          error as {
                                                              response: {
                                                                  data: { detail: string };
                                                              };
                                                          }
                                                      ).response.data.detail
                                                    : null;
                                            toast.error(
                                                detail ??
                                                    "Не удалось отправить заявку на удаление"
                                            );
                                        })
                                        .finally(() => setSubmitting(false));
                                    return;
                                }

                                const cancelTarget =
                                    deleteModalMode === "cancel-deletion"
                                        ? {
                                              feedItemId: `product-delete-${deletingProductId}`,
                                              target: {
                                                  kind: "product-deletion" as const,
                                                  productId: deletingProductId,
                                              },
                                          }
                                        : {
                                              feedItemId: `product-${deletingProductId}`,
                                              target: {
                                                  kind: "product" as const,
                                                  productId: deletingProductId,
                                              },
                                          };

                                void cancelRequest(
                                    cancelTarget.feedItemId,
                                    cancelTarget.target
                                ).then((success) => {
                                    if (success) {
                                        setDeleteModalOpen(false);
                                        setDeletingProductId(null);
                                        setDeletionReason("");
                                        void refetch();
                                    }
                                });
                            }}
                        >
                            {isBusy
                                ? "Обработка…"
                                : deleteModalMode === "request-deletion"
                                  ? "Отправить на удаление"
                                  : "Да, отменить"}
                        </DangerButton>
                    </ModalActions>
                </ModalCard>
            </ModalOverlay>
        </>
    );
};
