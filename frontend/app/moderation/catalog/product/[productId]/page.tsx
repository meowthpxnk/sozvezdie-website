import type { Metadata } from "next";
import { ModeratorCatalogProductEditPage } from "@/src/fsd/pages/ModerationCatalogEditPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

type ModeratorCatalogProductRouteProps = {
    params: Promise<{ productId: string }>;
};

export const metadata: Metadata = createPageMetadata("Редактирование товара");

export default async function ModeratorCatalogProductRoute({
    params,
}: ModeratorCatalogProductRouteProps) {
    const { productId } = await params;
    return <ModeratorCatalogProductEditPage productId={productId} />;
}
