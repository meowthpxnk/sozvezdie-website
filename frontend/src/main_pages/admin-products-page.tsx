"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { SetAdminChrome } from "@widgets/AdminShell";
import { createDefaultSellerSnapshot } from "@/src/shared/mocks/seller-snapshot-factory";
import { IconActionButton } from "@/src/shared/ui/icon-action-button";

const SNAPSHOT = createDefaultSellerSnapshot();

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

const List = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const Item = styled.li`
    background: #f6f7f9;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    gap: 12px;
    position: relative;
    min-height: 100px;
`;

const ItemLeft = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    flex: 1;
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

const formatPrice = (price: number): string => `${Math.max(0, Math.round(price)).toLocaleString("ru-RU")} ₽`;

const getCoverImage = (images: { id: string; url: string }[], coverImageId: string): string =>
    images.find((image) => image.id === coverImageId)?.url ?? images[0]?.url ?? "none";

export const AdminProductsPage = () => {
    const snapshot = SNAPSHOT;

    const deleteProduct = async (_id: string) => { };
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [isDeleting, setDeleting] = useState(false);
    const products = snapshot?.products ?? [];
    const deletingProduct = products.find((product) => product.id === deletingProductId) ?? null;

    const titleRight = useMemo(
        () => (
            <AddProductButton href="/admin/products/new" aria-label="Добавить товар">
                <Plus aria-hidden />
            </AddProductButton>
        ),
        []
    );

    return (
        <>
            <SetAdminChrome title="Товары" titleRight={titleRight} />
            <List>
                {products.map((product) => (
                    <Item key={product.id}>
                        <ItemLeft>
                            <ItemImageWrapper>
                                <img src={getCoverImage(product.images, product.coverImageId)} alt={product.name} />
                            </ItemImageWrapper>
                            <ItemMeta>
                                <ItemName>{product.name}</ItemName>
                                <ItemActions>
                                    <EditButton href={`/admin/products/${product.id}/edit`} aria-label={`Редактировать ${product.name}`}>
                                        <Pencil size={14} />
                                    </EditButton>
                                    <DeleteButton
                                        type="button"
                                        aria-label={`Удалить ${product.name}`}
                                        onClick={() => {
                                            setDeletingProductId(product.id);
                                            setDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </DeleteButton>
                                </ItemActions>
                                <ItemBottomRow>
                                    <PriceStockColumn>
                                        <ItemPrice>{formatPrice(product.price)}</ItemPrice>
                                        <ItemStock>В наличии: {product.stockCount} шт.</ItemStock>
                                    </PriceStockColumn>
                                </ItemBottomRow>
                            </ItemMeta>
                        </ItemLeft>
                    </Item>
                ))}
            </List>
            <ModalOverlay $isOpen={isDeleteModalOpen} onClick={() => (!isDeleting ? setDeleteModalOpen(false) : undefined)}>
                <ModalCard onClick={(event) => event.stopPropagation()}>
                    <ModalCloseButton
                        type="button"
                        aria-label="Закрыть модальное окно"
                        onClick={() => {
                            if (!isDeleting) {
                                setDeleteModalOpen(false);
                                setDeletingProductId(null);
                            }
                        }}
                    >
                        <X size={16} />
                    </ModalCloseButton>
                    <ModalTitle>Удалить товар?</ModalTitle>
                    <ModalText>
                        {deletingProduct ? `Товар «${deletingProduct.name}» будет удален без возможности восстановления.` : "Этот товар будет удален без возможности восстановления."}
                    </ModalText>
                    <ModalActions>
                        <SecondaryButton
                            type="button"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setDeletingProductId(null);
                            }}
                            disabled={isDeleting}
                        >
                            Отмена
                        </SecondaryButton>
                        <DangerButton
                            type="button"
                            disabled={isDeleting || !deletingProductId}
                            onClick={() => {
                                if (!deletingProductId) {
                                    return;
                                }
                                setDeleting(true);
                                void deleteProduct(deletingProductId).then(() => {
                                    setDeleteModalOpen(false);
                                    setDeletingProductId(null);
                                }).finally(() => {
                                    setDeleting(false);
                                });
                            }}
                        >
                            {isDeleting ? "Удаляем..." : "Да, удалить"}
                        </DangerButton>
                    </ModalActions>
                </ModalCard>
            </ModalOverlay>
        </>
    );
};
