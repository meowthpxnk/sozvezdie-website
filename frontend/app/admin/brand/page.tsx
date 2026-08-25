import type { Metadata } from "next";
import { AuthorBrandPage } from "@pages";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Редактирование бренда");

export default function AdminBrandRoute() {
    return <AuthorBrandPage />;
}
