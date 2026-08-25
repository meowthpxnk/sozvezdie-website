import { Suspense } from "react";
import type { Metadata } from "next";

import { PaymentReturnPage } from "@pages/OrdersPage/PaymentReturnPage";

export const metadata: Metadata = {
    title: "Оплата заказа",
};

export default function PaymentReturnRoute() {
    return (
        <Suspense fallback={null}>
            <PaymentReturnPage />
        </Suspense>
    );
}
