"use client";

import { useOrders } from "../../entities/order";
import { OrdersShell } from "./OrdersShell";

export const OrdersArchivePage = () => {
    const { orders, loading } = useOrders(true);

    return (
        <OrdersShell
            orders={orders}
            loading={loading}
            title="Архив"
            nav={{ href: "/orders", label: "Заказы", icon: "orders" }}
            emptyText="В архиве пока нет завершённых или отменённых заказов."
            emptyLink={{ href: "/orders", label: "К активным заказам", icon: "orders" }}
        />
    );
};
