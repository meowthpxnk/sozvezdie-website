import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsPage } from "@pages";
import { createPageMetadata } from "@shared/lib/page-metadata";
import { fetchCategoryTitle } from "@shared/lib/server-metadata";

type CategoryProductsRouteProps = {
    params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata({
    params,
}: CategoryProductsRouteProps): Promise<Metadata> {
    const { categorySlug } = await params;
    const title = await fetchCategoryTitle(categorySlug);

    return createPageMetadata(title ?? "Каталог");
}

export default async function CategoryProductsRoute({
    params,
}: CategoryProductsRouteProps) {
    const { categorySlug } = await params;
    return (
        <Suspense fallback={null}>
            <ProductsPage categorySlug={categorySlug} />
        </Suspense>
    );
}
