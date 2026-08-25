"use client";

import styled from "styled-components";
import Link from "next/link";
import { Archive, ClipboardList } from "lucide-react";
import { Header } from "@widgets/Header/ui/Header";
import {
    ACTIVE_ORDERS,
    ARCHIVED_ORDERS,
    ORDER_STATUS_LABELS,
    type OrderLineItem,
    type OrderStatusKey,
    type PreviousOrder,
} from "@/src/shared/mocks/orders";

const ORDER_STATUS_BADGE: Record<OrderStatusKey, { background: string; color: string }> = {
    cancelled: { background: "#fde6e9", color: "#863838" },
    delivered: { background: "#e3efd6", color: "#38593a" },
    received: { background: "#e3efd6", color: "#38593a" },
    awaiting_delivery: { background: "var(--main-color-tint-soft)", color: "#314e7b" },
    in_transit: { background: "var(--main-color-tint-soft)", color: "#314e7b" },
};

function parsePriceRub(text: string): number {
    return Number.parseInt(text.replace(/[^\d]/g, ""), 10) || 0;
}

function formatLineTotalRub(unitPriceText: string, quantity: number): string {
    const unit = parsePriceRub(unitPriceText);
    return `${(unit * quantity).toLocaleString("ru-RU")} ₽`;
}

const MainWrapper = styled.div`
    padding: 20px;
`;

const OrdersPageHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
`;

const OrdersTitleWrapper = styled.h2`
    margin: 0;
    font-size: 28px;
    color: var(--color);
`;

const ORDERS_NAV_ICONS = {
    archive: Archive,
    orders: ClipboardList,
} as const;

type OrdersNavIconKey = keyof typeof ORDERS_NAV_ICONS;

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

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
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
    background: #fff;
    color: #666;
    text-align: center;
    font-size: 15px;
    line-height: 1.45;
`;

const OrdersEmptyButtonWrap = styled.div`
    margin-top: 16px;
`;

const OrdersListWrapper = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const OrderCardWrapper = styled.li`
    list-style: none;
    background-color: #fff;
    border-radius: 14px;
    padding: 20px;
    color: #000;
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
`;

const OrderItemImageWrapper = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 10px;
    overflow: hidden;
    background-color: #f0f0f0;
    flex-shrink: 0;
    transition: opacity 0.2s ease;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    img[src="none"] {
        visibility: hidden;
    }
`;

const OrderItemImageLink = styled(Link)`
    display: flex;
    flex-shrink: 0;
    cursor: pointer;
    border-radius: 10px;
    outline-offset: 2px;

    &:focus-visible {
        outline: 2px solid var(--main-color);
    }

    &:hover ${OrderItemImageWrapper} {
        opacity: 0.92;
    }
`;

const OrderItemBody = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    min-height: 80px;
`;

const OrderItemNameLink = styled(Link)`
    display: block;
    width: 100%;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    outline-offset: 2px;

    &:hover {
        color: var(--main-color);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        border-radius: 4px;
    }
`;

const OrderItemName = styled.span`
    font-weight: 600;
    font-size: 16px;
    line-height: 1.35;
`;

const OrderItemPriceRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: nowrap;
    width: 100%;
    margin-top: auto;
`;

const OrderItemPrice = styled.span`
    font-weight: 600;
    color: var(--main-color);
    font-size: 20px;
`;

const OrderQuantityLine = styled.span`
    color: #666;
    font-size: 13px;
    font-weight: 500;
`;

const OrderSummaryWrapper = styled.div`
    margin-top: 16px;
`;

const OrderSummaryDash = styled.span`
    display: block;
    width: 100%;
    border-top: 1px dashed #cfd4dc;
    margin-bottom: 12px;
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
    margin-top: 4px;

    span {
        font-size: 18px;
        font-weight: 700;
    }
`;

function OrderLine({ product }: { product: OrderLineItem }) {
    const lineTotal = formatLineTotalRub(product.priceText, product.quantity);

    return (
        <OrderItemRow>
            <OrderItemImageLink
                href={`/product/${product.productId}`}
                aria-label={`Открыть ${product.name}`}
            >
                <OrderItemImageWrapper>
                    <img src={product.imageSrc} alt={product.imageAlt} />
                </OrderItemImageWrapper>
            </OrderItemImageLink>

            <OrderItemBody>
                <OrderItemNameLink
                    href={`/product/${product.productId}`}
                    aria-label={`Открыть ${product.name}`}
                >
                    <OrderItemName>{product.name}</OrderItemName>
                </OrderItemNameLink>

                <OrderItemPriceRow>
                    <OrderQuantityLine>{product.quantity} шт.</OrderQuantityLine>
                    <OrderItemPrice>{lineTotal}</OrderItemPrice>
                </OrderItemPriceRow>
            </OrderItemBody>
        </OrderItemRow>
    );
}

type OrdersShellProps = {
    orders: PreviousOrder[];
    title: string;
    nav?: { href: string; label: string; icon: OrdersNavIconKey };
    emptyText: string;
    emptyLink?: { href: string; label: string; icon: OrdersNavIconKey };
};

function OrdersNavGlyph({ icon }: { icon: OrdersNavIconKey }) {
    const Icon = ORDERS_NAV_ICONS[icon];
    return <Icon size={18} strokeWidth={2} aria-hidden />;
}

function OrdersShell({ orders, title, nav, emptyText, emptyLink }: OrdersShellProps) {
    return (
        <div>
            <Header />
            <MainWrapper>
                <OrdersPageHeader>
                    <OrdersTitleWrapper>{title}</OrdersTitleWrapper>
                    {nav ? (
                        <OrdersLinkButton href={nav.href}>
                            <OrdersNavGlyph icon={nav.icon} />
                            <span className="orders-nav-label">{nav.label}</span>
                        </OrdersLinkButton>
                    ) : null}
                </OrdersPageHeader>

                {orders.length === 0 ? (
                    <OrdersEmptyState>
                        {emptyText}
                        {emptyLink ? (
                            <OrdersEmptyButtonWrap>
                                <OrdersLinkButton href={emptyLink.href}>
                                    <OrdersNavGlyph icon={emptyLink.icon} />
                                    <span className="orders-nav-label">{emptyLink.label}</span>
                                </OrdersLinkButton>
                            </OrdersEmptyButtonWrap>
                        ) : null}
                    </OrdersEmptyState>
                ) : (
                    <OrdersListWrapper>
                        {orders.map((order) => {
                            const itemsCount = order.products.reduce((acc, p) => acc + p.quantity, 0);

                            return (
                                <OrderCardWrapper key={order.id}>
                                    <OrderCardHeader>
                                        <OrderNumberLine>Заказ №{order.id}</OrderNumberLine>
                                        <OrderStatusLine $statusKey={order.statusKey}>
                                            {ORDER_STATUS_LABELS[order.statusKey]}
                                        </OrderStatusLine>
                                    </OrderCardHeader>

                                    <OrderItemsWrapper>
                                        {order.products.map((product, index) => (
                                            <OrderLine
                                                key={`${order.id}-${index}`}
                                                product={product}
                                            />
                                        ))}
                                    </OrderItemsWrapper>

                                    <OrderSummaryWrapper>
                                        <OrderSummaryDash />
                                        <OrderSummaryRow>
                                            <span>Дата оформления</span>
                                            <span>{order.dateLabel}</span>
                                        </OrderSummaryRow>
                                        <OrderSummaryRow>
                                            <span>Способ оплаты</span>
                                            <span>{order.paymentType}</span>
                                        </OrderSummaryRow>
                                        <OrderSummaryRow>
                                            <span>Способ доставки</span>
                                            <span>{order.deliveryMethod}</span>
                                        </OrderSummaryRow>
                                        <OrderSummaryRow>
                                            <span>Стоимость доставки</span>
                                            <span>{order.deliveryCostText}</span>
                                        </OrderSummaryRow>
                                        <OrderSummaryRow>
                                            <span>Количество товаров</span>
                                            <span>{itemsCount} шт.</span>
                                        </OrderSummaryRow>
                                        <OrderSummaryTotalRow>
                                            <span>Итого</span>
                                            <span>{order.total}</span>
                                        </OrderSummaryTotalRow>
                                    </OrderSummaryWrapper>
                                </OrderCardWrapper>
                            );
                        })}
                    </OrdersListWrapper>
                )}
            </MainWrapper>
        </div>
    );
}

export const OrdersPage = () => (
    <OrdersShell
        orders={ACTIVE_ORDERS}
        title="Заказы"
        nav={{ href: "/orders/archive", label: "Архив", icon: "archive" }}
        emptyText="Сейчас нет заказов в работе. Завершённые и отменённые заказы можно посмотреть в архиве."
        emptyLink={{ href: "/orders/archive", label: "Перейти в архив", icon: "archive" }}
    />
);

export const OrdersArchivePage = () => (
    <OrdersShell
        orders={ARCHIVED_ORDERS}
        title="Архив"
        nav={{ href: "/orders", label: "Заказы", icon: "orders" }}
        emptyText="В архиве пока нет завершённых или отменённых заказов."
        emptyLink={{ href: "/orders", label: "К активным заказам", icon: "orders" }}
    />
);
