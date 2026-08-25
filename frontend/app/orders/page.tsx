import type { Metadata } from "next";
import { OrdersPage } from "@pages";

export const metadata: Metadata = {
    title: "Заказы",
};

export default function OrdersRoute() {
    return <OrdersPage />;
}
