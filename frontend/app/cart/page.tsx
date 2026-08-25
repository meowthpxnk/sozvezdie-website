import type { Metadata } from "next";
import { Suspense } from "react";
import { CartPage } from "@pages";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Корзина");

export default function CartRoute() {
    return (
        <Suspense fallback={null}>
            <CartPage />
        </Suspense>
    );
}
