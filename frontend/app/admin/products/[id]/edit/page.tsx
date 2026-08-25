import type { Metadata } from "next";
import { AuthorProductEditPage } from "@/src/fsd/pages/AuthorProductEditPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

type AdminProductEditRouteProps = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = createPageMetadata("Редактирование товара");

export default async function AdminProductEditRoute({ params }: AdminProductEditRouteProps) {
    const { id } = await params;
    return <AuthorProductEditPage productId={id} />;
}
