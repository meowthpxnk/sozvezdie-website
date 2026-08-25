"use client";

import styled from "styled-components";
import Link from "next/link";
import { Archive, ClipboardList, LucideIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo, useState } from "react";

import { formatOrderDate, priceFormatter } from "@shared/formatters";
import {
    DELIVERY_METHOD_LABELS,
    ORDER_STATUS_LABELS,
    PAYMENT_METHOD_LABELS,
    OrderLineItem,
    OrderStatusKey,
    UserOrder,
    orderService,
} from "../../entities/order";
import { MEDIA_URL } from "@shared/api/interceptors";

const IMAGE_BASE = `${MEDIA_URL}/images-bucket`;

const ORDER_STATUS_BADGE: Record<OrderStatusKey, { background: string; color: string }> = {
    cancelled: { background: "#fde6e9", color: "#863838" },
    delivered: { background: "#e3efd6", color: "#38593a" },
    received: { background: "#e3efd6", color: "#38593a" },
    awaiting_delivery: { background: "var(--main-color-tint-soft)", color: "#314e7b" },
    in_transit: { background: "var(--main-color-tint-soft)", color: "#314e7b" },
};

const MainWrapper = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
`;

const OrdersPageHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;

    @media (min-width: 960px) {
        margin-bottom: 28px;
    }
`;

const OrdersTitleWrapper = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--title-color);
`;

const OrdersLinkButton = styled(Link)`
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    appearance: none;
    cursor: pointer;
    text-decoration: none;
    width: auto;
    min-height: 42px;
    height: 42px;
    padding: 8px 12px;
    border-radius: 10px;
    gap: 8px;
    background: var(--main-color);
    color: #fff;
    transition: background-color 0.2s ease;

    &:hover {
        background: var(--main-color-hover);
    }

    svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }

    .orders-nav-label {
        font-size: 13px;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
    }
`;

const OrdersEmptyState = styled.div`
    padding: 28px 20px;
    border-radius: 14px;
    background: var(--product-page-card-bg, #fff);
    color: var(--cart-summary-text-color, #666);
    text-align: center;
    font-size: 15px;
    line-height: 1.45;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);

    @media (min-width: 960px) {
        padding: 40px 32px;
        max-width: 560px;
        margin: 0 auto;
    }
`;

const OrdersEmptyButtonWrap = styled.div`
    margin-top: 16px;
`;

const OrdersListWrapper = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (min-width: 960px) {
        gap: 24px;
    }
`;

const OrderCardWrapper = styled.li`
    list-style: none;
    background-color: var(--product-page-card-bg, #fff);
    border-radius: 14px;
    padding: 20px;
    color: var(--product-page-card-color, #000);
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);

    @media (min-width: 960px) {
        padding: 24px;
        border-radius: 16px;
    }
`;

const OrderCardBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (min-width: 960px) {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 300px);
        gap: 24px;
        align-items: start;
    }
`;

const OrderCardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    margin-bottom: 16px;
`;

const OrderNumberLine = styled.div`
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 500;
    color: #666;
`;

const OrderStatusLine = styled.span<{ $statusKey: OrderStatusKey }>`
    flex-shrink: 0;
    display: inline-block;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 6px;
    background: ${({ $statusKey }) => ORDER_STATUS_BADGE[$statusKey].background};
    color: ${({ $statusKey }) => ORDER_STATUS_BADGE[$statusKey].color};
`;

const OrderItemsWrapper = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const OrderItemRow = styled.li`
    list-style: none;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f6f7f9;

    @media (min-width: 960px) {
        padding: 12px 14px;
    }
`;

const OrderItemImageWrapper = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 10px;
    overflow: hidden;
    background-color: #f0f0f0;
    flex-shrink: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const OrderItemImageLink = styled(Link)`
    display: flex;
    flex-shrink: 0;
    border-radius: 10px;
`;

const OrderItemBody = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 80px;
`;

const OrderItemNameLink = styled(Link)`
    text-decoration: none;
    color: inherit;

    &:hover {
        color: var(--main-color);
    }
`;

const OrderItemName = styled.span`
    font-weight: 600;
    font-size: 16px;
    line-height: 1.35;
`;

const OrderItemPriceRow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    width: 100%;
    margin-top: auto;

    @media (min-width: 960px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
`;

const OrderItemUnitPrice = styled.span`
    color: #666;
    font-size: 13px;
    font-weight: 500;
`;

const OrderItemPrice = styled.span`
    font-weight: 600;
    color: var(--main-color);
    font-size: 20px;
`;

const OrderSummaryWrapper = styled.div`
    margin-top: 0;

    @media (min-width: 960px) {
        padding: 16px;
        border-radius: 12px;
        background: #f6f7f9;
        position: sticky;
        top: 96px;
    }
`;

const OrderSummaryDash = styled.span`
    display: block;
    width: 100%;
    border-top: 1px dashed #cfd4dc;
    margin-bottom: 12px;

    @media (min-width: 960px) {
        display: none;
    }
`;

const OrderSummaryRow = styled.div`
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

const OrderSummaryTotalRow = styled(OrderSummaryRow)`
    margin-bottom: 0;

    span {
        font-size: 18px;
        font-weight: 700;
    }
`;

const OrderActionsRow = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 10px;
`;

const OrderActionButton = styled.button`
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    appearance: none;
    cursor: pointer;
    text-decoration: none;
    width: auto;
    min-height: 40px;
    height: 40px;
    padding: 8px 12px;
    border-radius: 10px;
    background: #f0f1f3;
    color: #1b2b48;
    font-size: 13px;
    font-weight: 700;
    transition: background-color 0.2s ease, opacity 0.2s ease;

    &:hover {
        background: #e6e7ea;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

function OrderLine({ product }: { product: OrderLineItem }) {
    const imageSrc = product.image ? `${IMAGE_BASE}/${product.image}` : "";

    return (
        <OrderItemRow>
            <OrderItemImageLink
                href={`/product/${product.productId}`}
                aria-label={`Открыть ${product.name}`}
            >
                <OrderItemImageWrapper>
                    {imageSrc ? <img src={imageSrc} alt={product.name} /> : null}
                </OrderItemImageWrapper>
            </OrderItemImageLink>
            <OrderItemBody>
                <OrderItemNameLink href={`/product/${product.productId}`}>
                    <OrderItemName>{product.name}</OrderItemName>
                </OrderItemNameLink>
                <OrderItemPriceRow>
                    <OrderItemUnitPrice>
                        {product.quantity} шт. × {priceFormatter(product.priceAtTime)}
                    </OrderItemUnitPrice>
                    <OrderItemPrice>{priceFormatter(product.lineTotal)}</OrderItemPrice>
                </OrderItemPriceRow>
            </OrderItemBody>
        </OrderItemRow>
    );
}

export type OrdersNavIcon = "archive" | "orders";

const NAV_ICONS: Record<OrdersNavIcon, LucideIcon> = {
    archive: Archive,
    orders: ClipboardList,
};

export interface OrdersShellProps {
    orders: UserOrder[];
    loading: boolean;
    title: string;
    nav?: { href: string; label: string; icon: OrdersNavIcon };
    emptyText: string;
    emptyLink?: { href: string; label: string; icon: OrdersNavIcon };
}

export const OrdersShell = ({
    orders,
    loading,
    title,
    nav,
    emptyText,
    emptyLink,
}: OrdersShellProps) => {
    const queryClient = useQueryClient();
    const [cancelingOrderIds, setCancelingOrderIds] = useState<Set<string>>(
        () => new Set()
    );

    const cancelableIds = useMemo(() => {
        const set = new Set<string>();
        for (const order of orders) {
            if (order.statusKey === "awaiting_delivery") {
                set.add(order.id);
            }
        }
        return set;
    }, [orders]);

    const cancelOrder = async (orderId: string) => {
        setCancelingOrderIds((prev) => new Set(prev).add(orderId));
        try {
            const result = await orderService.cancelOrder(Number(orderId));

            const cdekMsg =
                result.cdek.status === "failed"
                    ? `СДЭК: ${result.cdek.message ?? "ошибка"}`
                    : null;
            const paymentMsg =
                result.payment.status === "failed"
                    ? `ЮKassa: ${result.payment.message ?? "ошибка"}`
                    : null;

            if (cdekMsg || paymentMsg) {
                toast.message("Заказ отменён с предупреждениями", {
                    description: [cdekMsg, paymentMsg].filter(Boolean).join(". "),
                });
            } else {
                toast.success("Заказ отменён");
            }

            await queryClient.invalidateQueries({ queryKey: ["orders"] });
        } catch (error: any) {
            toast.error(
                error?.response?.data?.detail ?? "Не удалось отменить заказ"
            );
        } finally {
            setCancelingOrderIds((prev) => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    };

    const NavIcon = nav ? NAV_ICONS[nav.icon] : null;
    const EmptyIcon = emptyLink ? NAV_ICONS[emptyLink.icon] : null;

    return (
        <MainWrapper>
            <OrdersPageHeader>
                <OrdersTitleWrapper>{title}</OrdersTitleWrapper>
                {nav && NavIcon ? (
                    <OrdersLinkButton href={nav.href}>
                        <NavIcon size={18} strokeWidth={2} aria-hidden />
                        <span className="orders-nav-label">{nav.label}</span>
                    </OrdersLinkButton>
                ) : null}
            </OrdersPageHeader>

            {loading ? (
                <OrdersEmptyState>Загрузка заказов…</OrdersEmptyState>
            ) : orders.length === 0 ? (
                <OrdersEmptyState>
                    {emptyText}
                    {emptyLink && EmptyIcon ? (
                        <OrdersEmptyButtonWrap>
                            <OrdersLinkButton href={emptyLink.href}>
                                <EmptyIcon size={18} strokeWidth={2} aria-hidden />
                                <span className="orders-nav-label">{emptyLink.label}</span>
                            </OrdersLinkButton>
                        </OrdersEmptyButtonWrap>
                    ) : null}
                </OrdersEmptyState>
            ) : (
                <OrdersListWrapper>
                    {orders.map((order) => {
                        const itemsCount = order.products.reduce(
                            (acc, product) => acc + product.quantity,
                            0
                        );
                        const canCancel = cancelableIds.has(order.id);
                        const canceling = cancelingOrderIds.has(order.id);

                        return (
                            <OrderCardWrapper key={order.id}>
                                <OrderCardHeader>
                                    <OrderNumberLine>Заказ №{order.id}</OrderNumberLine>
                                    <OrderStatusLine $statusKey={order.statusKey}>
                                        {ORDER_STATUS_LABELS[order.statusKey]}
                                    </OrderStatusLine>
                                </OrderCardHeader>
                                <OrderCardBody>
                                    <OrderItemsWrapper>
                                        {order.products.map((product, index) => (
                                            <OrderLine
                                                key={`${order.id}-${product.productId}-${index}`}
                                                product={product}
                                            />
                                        ))}
                                    </OrderItemsWrapper>
                                    <OrderSummaryWrapper>
                                        <OrderSummaryDash />
                                        <OrderSummaryRow>
                                            <span>Дата оформления</span>
                                            <span>
                                                {order.createdAt
                                                    ? formatOrderDate(order.createdAt)
                                                    : "—"}
                                            </span>
                                        </OrderSummaryRow>
                                        <OrderSummaryRow>
                                            <span>Способ оплаты</span>
                                            <span>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
                                        </OrderSummaryRow>
                                        <OrderSummaryRow>
                                            <span>Способ доставки</span>
                                            <span>
                                                {DELIVERY_METHOD_LABELS[order.deliveryMethod]}
                                            </span>
                                        </OrderSummaryRow>
                                        {order.deliveryAddressText ? (
                                            <OrderSummaryRow>
                                                <span>Адрес</span>
                                                <span>
                                                    {order.deliveryAddressText}
                                                    {order.deliveryFlat
                                                        ? `, кв. ${order.deliveryFlat}`
                                                        : ""}
                                                </span>
                                            </OrderSummaryRow>
                                        ) : null}
                                        {order.cdekPvzAddress ? (
                                            <OrderSummaryRow>
                                                <span>Пункт выдачи</span>
                                                <span>{order.cdekPvzAddress}</span>
                                            </OrderSummaryRow>
                                        ) : null}
                                        {order.deliveryDate ? (
                                            <OrderSummaryRow>
                                                <span>Дата доставки</span>
                                                <span>
                                                    {new Date(
                                                        order.deliveryDate
                                                    ).toLocaleDateString("ru-RU")}
                                                </span>
                                            </OrderSummaryRow>
                                        ) : null}
                                        <OrderSummaryRow>
                                            <span>Стоимость доставки</span>
                                            <span>
                                                {order.deliveryCost > 0
                                                    ? priceFormatter(order.deliveryCost)
                                                    : "бесплатно"}
                                            </span>
                                        </OrderSummaryRow>
                                        <OrderSummaryRow>
                                            <span>Количество товаров</span>
                                            <span>{itemsCount} шт.</span>
                                        </OrderSummaryRow>
                                        <OrderSummaryRow>
                                            <span>Стоимость товаров</span>
                                            <span>{priceFormatter(order.itemsTotal)}</span>
                                        </OrderSummaryRow>
                                        <OrderSummaryTotalRow>
                                            <span>Итого к оплате</span>
                                            <span>{priceFormatter(order.total)}</span>
                                        </OrderSummaryTotalRow>
                                        {canCancel ? (
                                            <OrderActionsRow>
                                                <OrderActionButton
                                                    type="button"
                                                    onClick={() => void cancelOrder(order.id)}
                                                    disabled={canceling || loading}
                                                >
                                                    {canceling ? "Отменяем…" : "Отменить заказ"}
                                                </OrderActionButton>
                                            </OrderActionsRow>
                                        ) : null}
                                    </OrderSummaryWrapper>
                                </OrderCardBody>
                            </OrderCardWrapper>
                        );
                    })}
                </OrdersListWrapper>
            )}
        </MainWrapper>
    );
};
