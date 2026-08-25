import type { Metadata } from "next";
import { OrdersArchivePage } from "@pages";

export const metadata: Metadata = {
    title: "Архив заказов",
};

export default function OrdersArchiveRoute() {
    return <OrdersArchivePage />;
}
