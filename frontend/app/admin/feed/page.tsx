import type { Metadata } from "next";
import { AuthorFeedPage } from "@/src/fsd/pages/AuthorFeedPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Лента");

export default function AdminFeedRoute() {
    return <AuthorFeedPage />;
}
