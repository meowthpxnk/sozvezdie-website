import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsPage } from "@pages";
import { createPageMetadata } from "@shared/lib/page-metadata";
import { fetchSubcategoryTitle } from "@shared/lib/server-metadata";

type SubcategoryProductsRouteProps = {
    params: Promise<{
        categorySlug: string;
        subcategorySlug: string;
    }>;
};

export async function generateMetadata({
    params,
}: SubcategoryProductsRouteProps): Promise<Metadata> {
    const { categorySlug, subcategorySlug } = await params;
    const title = await fetchSubcategoryTitle(categorySlug, subcategorySlug);

    return createPageMetadata(title ?? "Каталог");
}

export default async function SubcategoryProductsRoute({
    params,
}: SubcategoryProductsRouteProps) {
    const { categorySlug, subcategorySlug } = await params;
    return (
        <Suspense fallback={null}>
            <ProductsPage
                categorySlug={categorySlug}
                subcategorySlug={subcategorySlug}
            />
        </Suspense>
    );
}
