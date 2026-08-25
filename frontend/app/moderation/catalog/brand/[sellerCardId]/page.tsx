import type { Metadata } from "next";
import { ModeratorCatalogBrandEditPage } from "@/src/fsd/pages/ModerationCatalogEditPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

type ModeratorCatalogBrandRouteProps = {
    params: Promise<{ sellerCardId: string }>;
};

export const metadata: Metadata = createPageMetadata("Редактирование бренда");

export default async function ModeratorCatalogBrandRoute({
    params,
}: ModeratorCatalogBrandRouteProps) {
    const { sellerCardId } = await params;
    return <ModeratorCatalogBrandEditPage sellerCardId={sellerCardId} />;
}
