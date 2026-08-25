"use client";

import styled from "styled-components";
import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { Header } from "@widgets/Header/ui/Header";
import { IconActionButton } from "@/src/shared/ui/icon-action-button";
import { getStaticStorefrontProducts } from "@/src/shared/mocks/storefront-static";
import { MOCK_CART_QUANTITIES, MOCK_LIKED_PRODUCT_IDS } from "@/src/shared/mocks/static-user-session";
import { CartItem } from "../fsd/widgets/CartItem";

const MainWrapper = styled.div`
    padding: 20px;
`;

const CartTitleWrapper = styled.h2`
    margin-bottom: 20px;
    font-size: 28px;
    color: var(--color);
`;

const CartCardWrapper = styled.div`
    background-color: #fff;
    border-radius: 14px;
    padding: 20px;
    color: #000;
`;

const CartItemsWrapper = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const CartPlusButton = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 0;
    background-color: var(--main-color);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1;
    padding: 0;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
        background-color: var(--main-color-hover);
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        background-color: var(--main-color-disabled);
    }
`;

const CartMinusButton = styled(CartPlusButton)`
    line-height: 0;
    font-size: 20px;
`;

const CartSummaryWrapper = styled.div`
    margin-top: 16px;
`;

const CartSummaryDash = styled.span`
    display: block;
    width: 100%;
    border-top: 1px dashed #cfd4dc;
    margin-bottom: 12px;
`;

const CartSummaryRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;

    span {
        font-size: 15px;
        font-weight: 500;
        color: #303237;
    }
`;

const CartSummaryTotalRow = styled(CartSummaryRow)`
    margin-bottom: 14px;

    span {
        font-size: 18px;
        font-weight: 700;
    }
`;

const checkoutButtonCss = `
    width: 100%;
    height: 40px;
    border-radius: 8px;
    background: var(--main-color);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    box-sizing: border-box;
    border: none;
    cursor: pointer;

    &:hover {
        background-color: var(--main-color-hover);
    }
`;

const CartCheckoutButton = styled.button`
    ${checkoutButtonCss}

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        background: var(--main-color-disabled);
    }

    &:disabled:hover {
        background: var(--main-color-disabled);
    }
`;

const CartCheckoutLink = styled(Link)`
    ${checkoutButtonCss}
`;

const CartStockWarning = styled.p`
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 600;
    color: #c62828;
    line-height: 1.35;
`;

const ConfirmOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.68);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
`;

const ConfirmModal = styled.div`
    width: 100%;
    max-width: 360px;
    border-radius: 12px;
    background: #fff;
    padding: 16px;
    color: #000;
`;

const ConfirmText = styled.p`
    font-size: 14px;
    color: #4b4f56;
    margin-bottom: 14px;
`;

const ConfirmActions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
`;

const ConfirmButton = styled.button<{ $danger?: boolean }>`
    height: 36px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    background: ${({ $danger }) => ($danger ? "#e44b4b" : "var(--neutral-surface-bg)")};
    color: ${({ $danger }) => ($danger ? "#fff" : "#2f3440")};
`;

type ConfirmAction = {
    productId: string;
    productName: string;
    action: "minus" | "delete";
};

export const CartPage = () => {
    const productsCatalog = getStaticStorefrontProducts();
    const isLiked = (id: string) => MOCK_LIKED_PRODUCT_IDS.includes(id);
    const getCartQuantity = (id: string) => MOCK_CART_QUANTITIES[id] ?? 0;
    const toggleLike = () => { };
    const setCartQuantity = (_productId: string, _quantity: number) => { };

    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

    const onPlus = (productId: string) => {
        const product = productsCatalog.find((item) => item.id === productId);
        const currentQty = getCartQuantity(productId);
        if (product && currentQty >= product.stockCount) {
            return;
        }
        setCartQuantity(productId, currentQty + 1);
    };

    const onMinus = (productId: string) => {
        const currentQty = getCartQuantity(productId);
        if (currentQty > 1) {
            setCartQuantity(productId, currentQty - 1);
            return;
        }

        const product = productsCatalog.find((item) => item.id === productId);
        if (!product) {
            return;
        }

        setConfirmAction({
            productId,
            productName: product.nameText,
            action: "delete",
        });
    };

    const onDelete = (productId: string) => {
        const product = productsCatalog.find((item) => item.id === productId);
        if (!product) {
            return;
        }

        setConfirmAction({
            productId,
            productName: product.nameText,
            action: "delete",
        });
    };

    const onToggleLike = (productId: string) => {
        toggleLike(productId);
    };

    const visibleProducts = productsCatalog.filter((p) => getCartQuantity(p.id) > 0);
    const totalItems = visibleProducts.reduce((acc, product) => acc + getCartQuantity(product.id), 0);
    const totalPrice = visibleProducts.reduce((acc, product) => {
        const unitPrice = Number.parseInt(product.priceText.replace(/[^\d]/g, ""), 10) || 0;
        return acc + unitPrice * getCartQuantity(product.id);
    }, 0);
    const cartExceedsStock = visibleProducts.some(
        (product) => getCartQuantity(product.id) > product.stockCount,
    );
    const canProceedToCheckout = totalItems > 0 && !cartExceedsStock;
    const getProductTotalPriceText = (productId: string, unitPriceText: string) => {
        const unitPrice = Number.parseInt(unitPriceText.replace(/[^\d]/g, ""), 10) || 0;
        const lineTotal = unitPrice * getCartQuantity(productId);
        return `${lineTotal.toLocaleString("ru-RU")} ₽`;
    };
    const onConfirmAction = () => {
        if (!confirmAction) {
            return;
        }

        if (confirmAction.action === "minus") {
            setCartQuantity(confirmAction.productId, getCartQuantity(confirmAction.productId) - 1);
        } else {
            setCartQuantity(confirmAction.productId, 0);
        }

        setConfirmAction(null);
    };

    return (
        <div>
            <Header />
            <MainWrapper>
                <CartTitleWrapper>Корзина</CartTitleWrapper>

                <CartCardWrapper>
                    <CartItemsWrapper>
                        {visibleProducts.map((product) => (
                            <CartItem product={product} />
                        ))}
                    </CartItemsWrapper>

                    <CartSummaryWrapper>
                        <CartSummaryDash />
                        <CartSummaryRow>
                            <span>Количество товаров</span>
                            <span>{totalItems} шт.</span>
                        </CartSummaryRow>
                        <CartSummaryTotalRow>
                            <span>Итого</span>
                            <span>{totalPrice.toLocaleString("ru-RU")} ₽</span>
                        </CartSummaryTotalRow>
                        {cartExceedsStock && (
                            <CartStockWarning>
                                В корзине есть позиции в количестве больше, чем доступно на складе. Уменьшите количество
                                до остатка или удалите лишнее — иначе оформление заказа недоступно.
                            </CartStockWarning>
                        )}
                        {canProceedToCheckout ? (
                            <CartCheckoutLink href="/checkout">Оформить заказ</CartCheckoutLink>
                        ) : (
                            <CartCheckoutButton type="button" disabled>
                                Оформить заказ
                            </CartCheckoutButton>
                        )}
                    </CartSummaryWrapper>
                </CartCardWrapper>
            </MainWrapper>
            {confirmAction && (
                <ConfirmOverlay onClick={() => setConfirmAction(null)}>
                    <ConfirmModal onClick={(event) => event.stopPropagation()}>
                        <ConfirmText>
                            {confirmAction.action === "minus"
                                ? `Уменьшить количество товара "${confirmAction.productName}" на 1?`
                                : `Удалить товар "${confirmAction.productName}" из корзины?`}
                        </ConfirmText>
                        <ConfirmActions>
                            <ConfirmButton type="button" onClick={() => setConfirmAction(null)}>
                                Отмена
                            </ConfirmButton>
                            <ConfirmButton $danger type="button" onClick={onConfirmAction}>
                                Подтвердить
                            </ConfirmButton>
                        </ConfirmActions>
                    </ConfirmModal>
                </ConfirmOverlay>
            )}
        </div>
    );
};
