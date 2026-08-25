"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Search } from "lucide-react";

import { BACKEND_ORDER_STATUS_LABELS } from "@entities/moderation";
import type { BackendOrderStatus } from "@entities/order/order.types";
import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS } from "@entities/order";
import { formatOrderDate, priceFormatter } from "@shared/formatters";
import { SetAdminChrome } from "@widgets/AdminShell";

import {
    type ModerationOrdersFilter,
    useModerationOrders,
} from "./useModerationOrders";

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
`;

const SearchRow = styled.form`
    margin-top: 12px;
`;

const SearchBarWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const SearchIcon = styled(Search)`
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    color: #6b7890;
    pointer-events: none;
`;

const SearchInput = styled.input`
    width: 100%;
    min-height: 36px;
    border-radius: 10px;
    border: 1px solid #d7ddea;
    padding: 0 12px 0 32px;
    font-size: 14px;
    box-sizing: border-box;

    &::placeholder {
        color: #8a97b1;
    }
`;

const List = styled.ul`
    margin: 16px 0 0;
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
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
    transition: box-shadow 0.15s ease, border-color 0.15s ease;

    &:hover {
        border-color: #d7ddea;
        box-shadow: 0 12px 28px rgba(17, 31, 60, 0.08);
    }
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const StatusBadge = styled.span<{ $status: BackendOrderStatus }>`
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 12px;
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

const Title = styled.strong`
    color: #132647;
    font-size: 15px;
`;

const Meta = styled.span`
    color: #6b7890;
    font-size: 12px;
`;

const EmptyState = styled.p`
    margin: 16px 0 0;
    padding: 24px 12px;
    text-align: center;
    color: #6b7890;
    font-size: 14px;
`;

const FILTERS: { value: ModerationOrdersFilter; label: string }[] = [
    { value: "active", label: "Активные" },
    { value: "archive", label: "Архив" },
    { value: "PENDING", label: "Ожидают оплаты" },
    { value: "PAID", label: "Оплаченные" },
    { value: "SHIPPED", label: "В пути" },
];

export function ModerationOrdersPage() {
    const router = useRouter();
    const {
        filter,
        setFilter,
        searchInput,
        setSearchInput,
        applySearch,
        orders,
        total,
        loading,
        isError,
    } = useModerationOrders();

    return (
        <>
            <SetAdminChrome title="Заказы" />
            <FilterRow>
                {FILTERS.map(({ value, label }) => (
                    <FilterButton
                        key={value}
                        type="button"
                        $active={filter === value}
                        onClick={() => setFilter(value)}
                    >
                        {label}
                    </FilterButton>
                ))}
            </FilterRow>

            <SearchRow
                onSubmit={(event) => {
                    event.preventDefault();
                    applySearch();
                }}
            >
                <SearchBarWrapper>
                    <SearchIcon aria-hidden />
                    <SearchInput
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="№ заказа, логин, email, телефон"
                    />
                </SearchBarWrapper>
            </SearchRow>

            {!loading && !isError ? (
                <Meta>
                    Найдено: {total}
                    {total > orders.length ? ` (показано ${orders.length})` : null}
                </Meta>
            ) : null}

            {loading ? <EmptyState>Загрузка заказов…</EmptyState> : null}
            {!loading && isError ? (
                <EmptyState>Не удалось загрузить заказы.</EmptyState>
            ) : null}
            {!loading && !isError && orders.length === 0 ? (
                <EmptyState>Заказы не найдены.</EmptyState>
            ) : null}

            {!loading && !isError && orders.length > 0 ? (
                <List>
                    {orders.map((order) => (
                        <Card
                            key={order.id}
                            onClick={() => router.push(`/moderation/orders/${order.id}`)}
                        >
                            <Row>
                                <Title>Заказ №{order.id}</Title>
                                <StatusBadge $status={order.status}>
                                    {BACKEND_ORDER_STATUS_LABELS[order.status]}
                                </StatusBadge>
                            </Row>
                            <Meta>{formatOrderDate(order.createdAt)}</Meta>
                            <Meta>
                                {order.customer.fullName || order.customer.username}
                                {order.customer.phone ? ` · ${order.customer.phone}` : ""}
                            </Meta>
                            <Meta>
                                {order.itemCount} поз. · {priceFormatter(order.total)} ·{" "}
                                {PAYMENT_METHOD_LABELS[order.paymentMethod]} ·{" "}
                                {DELIVERY_METHOD_LABELS[order.deliveryMethod]}
                            </Meta>
                        </Card>
                    ))}
                </List>
            ) : null}
        </>
    );
}
