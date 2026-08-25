"use client";

import Link from "next/link";
import styled from "styled-components";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import {
    BACKEND_ORDER_STATUS_LABELS,
    MODERATOR_ORDER_STATUS_TRANSITIONS,
} from "@entities/moderation";
import type { BackendOrderStatus, OrderLineItem } from "@entities/order/order.types";
import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS } from "@entities/order";
import { formatOrderDate, priceFormatter } from "@shared/formatters";
import { MEDIA_URL } from "@shared/api/interceptors";
import { SetAdminChrome } from "@widgets/AdminShell";
import { getApiErrorMessage } from "@shared/lib/api-order-error";

import { useModerationOrderDetail } from "./useModerationOrderDetail";

const Section = styled.section`
    background: #fff;
    border: 1px solid #e4e9f0;
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
`;

const SectionTitle = styled.h2`
    margin: 0;
    font-size: 15px;
    color: #132647;
`;

const Meta = styled.p`
    margin: 0;
    font-size: 13px;
    color: #4a5872;
    line-height: 1.45;
`;

const StatusBadge = styled.span<{ $status: BackendOrderStatus }>`
    display: inline-block;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
    font-weight: 700;
    color: ${({ $status }) =>
        $status === "CANCELED"
            ? "#863838"
            : $status === "DELIVERED"
              ? "#38593a"
              : "#314e7b"};
    background: ${({ $status }) =>
        $status === "CANCELED"
            ? "#fde6e9"
            : $status === "DELIVERED"
              ? "#e3efd6"
              : "var(--main-color-tint-soft)"};
`;

const IMAGE_BASE = `${MEDIA_URL}/images-bucket`;

const ItemsList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const ItemRow = styled.li`
    list-style: none;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f6f7f9;
`;

const ItemImageWrap = styled.div`
    width: 72px;
    height: 72px;
    border-radius: 10px;
    overflow: hidden;
    background: #e8eaee;
    flex-shrink: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const ItemBody = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const ItemName = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: #132647;
    line-height: 1.35;
`;

const ItemMeta = styled.span`
    font-size: 13px;
    color: #6b7890;
`;

const ItemPrice = styled.span`
    font-size: 15px;
    font-weight: 700;
    color: var(--main-color);
`;

const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: #4a5872;
    padding-top: 4px;
`;

const StatusActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const StatusButton = styled.button`
    min-height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--main-color);
    background: #fff;
    color: var(--main-color-accent);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TrackingLink = styled.a`
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    width: fit-content;
    gap: 6px;
    color: var(--main-color-accent);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;

    svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
    }

    &:hover {
        text-decoration: underline;
    }
`;

function OrderProductLine({ product }: { product: OrderLineItem }) {
    const imageSrc = product.image ? `${IMAGE_BASE}/${product.image}` : "";

    return (
        <ItemRow>
            <ItemImageWrap>
                {imageSrc ? <img src={imageSrc} alt={product.name} /> : null}
            </ItemImageWrap>
            <ItemBody>
                <ItemName>{product.name}</ItemName>
                <ItemMeta>
                    {product.quantity} шт. × {priceFormatter(product.priceAtTime)}
                </ItemMeta>
                <ItemPrice>{priceFormatter(product.lineTotal)}</ItemPrice>
            </ItemBody>
        </ItemRow>
    );
}

const ErrorText = styled.p`
    margin: 0;
    color: #863838;
    font-size: 13px;
`;

const EmptyState = styled.p`
    margin: 0;
    padding: 24px 0;
    text-align: center;
    color: #6b7890;
`;

const Stack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

function cdekTrackingUrl(uuid: string) {
    return `https://www.cdek.ru/ru/tracking/?order_id=${encodeURIComponent(uuid)}`;
}

export function ModerationOrderDetailPage() {
    const { order, loading, isError, updateStatus, updating } = useModerationOrderDetail();

    const handleStatusChange = async (nextStatus: BackendOrderStatus) => {
        if (!order) {
            return;
        }
        try {
            await updateStatus(nextStatus);
            toast.success(`Статус изменён: ${BACKEND_ORDER_STATUS_LABELS[nextStatus]}`);
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Не удалось изменить статус"));
        }
    };

    if (loading) {
        return (
            <>
                <SetAdminChrome title="Заказ" />
                <EmptyState>Загрузка…</EmptyState>
            </>
        );
    }

    if (isError || !order) {
        return (
            <>
                <SetAdminChrome title="Заказ" />
                <EmptyState>Заказ не найден.</EmptyState>
            </>
        );
    }

    const nextStatuses = MODERATOR_ORDER_STATUS_TRANSITIONS[order.status];

    return (
        <>
            <SetAdminChrome title={`Заказ №${order.id}`} />
            <Stack>
                <Section>
                    <SectionTitle>Статус и оплата</SectionTitle>
                    <StatusBadge $status={order.status}>
                        {BACKEND_ORDER_STATUS_LABELS[order.status]}
                    </StatusBadge>
                    <Meta>Создан: {formatOrderDate(order.createdAt)}</Meta>
                    <Meta>Оплата: {PAYMENT_METHOD_LABELS[order.paymentMethod]}</Meta>
                    <Meta>Доставка: {DELIVERY_METHOD_LABELS[order.deliveryMethod]}</Meta>
                    <Meta>Итого: {priceFormatter(order.total)}</Meta>
                    {nextStatuses.length > 0 ? (
                        <>
                            <Meta>Изменить статус:</Meta>
                            <StatusActions>
                                {nextStatuses.map((status) => (
                                    <StatusButton
                                        key={status}
                                        type="button"
                                        disabled={updating}
                                        onClick={() => void handleStatusChange(status)}
                                    >
                                        {BACKEND_ORDER_STATUS_LABELS[status]}
                                    </StatusButton>
                                ))}
                            </StatusActions>
                        </>
                    ) : null}
                </Section>

                <Section>
                    <SectionTitle>Покупатель</SectionTitle>
                    <Meta>Логин: {order.customer.username}</Meta>
                    {order.customer.fullName ? (
                        <Meta>Имя: {order.customer.fullName}</Meta>
                    ) : null}
                    {order.customer.email ? <Meta>Email: {order.customer.email}</Meta> : null}
                    {order.customer.phone ? <Meta>Телефон: {order.customer.phone}</Meta> : null}
                </Section>

                <Section>
                    <SectionTitle>Доставка</SectionTitle>
                    {order.deliveryDate ? (
                        <Meta>Дата: {formatOrderDate(order.deliveryDate)}</Meta>
                    ) : null}
                    {order.deliveryAddressText ? (
                        <Meta>
                            Адрес: {order.deliveryAddressText}
                            {order.deliveryFlat ? `, кв. ${order.deliveryFlat}` : ""}
                        </Meta>
                    ) : null}
                    {order.cdekPvzAddress ? <Meta>ПВЗ: {order.cdekPvzAddress}</Meta> : null}
                </Section>

                <Section>
                    <SectionTitle>Отслеживание СДЭК</SectionTitle>
                    {order.cdekOrderUuid ? (
                        <TrackingLink
                            href={cdekTrackingUrl(order.cdekOrderUuid)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Открыть на cdek.ru
                            <ExternalLink size={14} />
                        </TrackingLink>
                    ) : (
                        <Meta>Заказ в СДЭК ещё не создан</Meta>
                    )}
                    {order.cdekOrderUuid ? (
                        <Meta>UUID: {order.cdekOrderUuid}</Meta>
                    ) : null}
                    {order.cdekError ? <ErrorText>Ошибка СДЭК: {order.cdekError}</ErrorText> : null}
                    {order.yookassaPaymentId ? (
                        <Meta>Платёж ЮKassa: {order.yookassaPaymentId}</Meta>
                    ) : null}
                </Section>

                <Section>
                    <SectionTitle>Состав заказа</SectionTitle>
                    {order.products.length === 0 ? (
                        <Meta>В заказе нет позиций</Meta>
                    ) : (
                        <>
                            <ItemsList>
                                {order.products.map((product, index) => (
                                    <OrderProductLine
                                        key={`${order.id}-${product.productId}-${index}`}
                                        product={product}
                                    />
                                ))}
                            </ItemsList>
                            <SummaryRow>
                                <span>Товары</span>
                                <span>{priceFormatter(order.itemsTotal)}</span>
                            </SummaryRow>
                            <SummaryRow>
                                <span>Доставка</span>
                                <span>
                                    {order.deliveryCost > 0
                                        ? priceFormatter(order.deliveryCost)
                                        : "бесплатно"}
                                </span>
                            </SummaryRow>
                            <SummaryRow>
                                <strong>Итого</strong>
                                <strong>{priceFormatter(order.total)}</strong>
                            </SummaryRow>
                        </>
                    )}
                </Section>

                <Meta>
                    <Link href="/moderation/orders">← К списку заказов</Link>
                </Meta>
            </Stack>
        </>
    );
}
