import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsPage } from "@pages";

export const metadata: Metadata = {
    title: "Каталог",
};

export default function ProductsRoute() {
    return (
        <Suspense fallback={null}>
            <ProductsPage />
        </Suspense>
    );
}
