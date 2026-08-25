import type { Metadata } from "next";
import { AuthorProductCreatePage } from "@/src/fsd/pages/AuthorProductCreatePage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Новый товар");

export default function AdminProductCreateRoute() {
    return <AuthorProductCreatePage />;
}
