"use client";

import { useOrders } from "../../entities/order";
import { OrdersShell } from "./OrdersShell";

export const OrdersPage = () => {
    const { orders, loading } = useOrders(false);

    return (
        <OrdersShell
            orders={orders}
            loading={loading}
            title="Заказы"
            nav={{ href: "/orders/archive", label: "Архив", icon: "archive" }}
            emptyText="Сейчас нет заказов в работе. Завершённые и отменённые заказы можно посмотреть в архиве."
            emptyLink={{ href: "/orders/archive", label: "Перейти в архив", icon: "archive" }}
        />
    );
};
