import type { Metadata } from "next";
import { AuthorProductsPage } from "@pages";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Товары");

export default function AdminProductsRoute() {
    return <AuthorProductsPage />;
}
