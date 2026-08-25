import type { Metadata } from "next";
import { CheckoutPage } from "@pages";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Оформление заказа");

export default function CheckoutRoute() {
    return <CheckoutPage />;
}
