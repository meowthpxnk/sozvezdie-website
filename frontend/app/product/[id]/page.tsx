// import { ProductPage } from "@/src/main_pages/product-page";
import type { Metadata } from "next";
import { SingleProductPage } from "@pages";
import { createPageMetadata } from "@shared/lib/page-metadata";
import { fetchProductMeta } from "@shared/lib/server-metadata";

type ProductRouteProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({
    params,
}: ProductRouteProps): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProductMeta(id);

    return createPageMetadata(product?.name ?? "Товар");
}

export default async function ProductRoute({ params }: ProductRouteProps) {
    const { id } = await params;

    // return <ProductPage productId={id} />;
    return <SingleProductPage id={id} />;
}
