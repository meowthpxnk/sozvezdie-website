import type { Metadata } from "next";
import { ModerationPage } from "@/src/fsd/pages/ModerationPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Модерация");

export default function ModerationRoute() {
    return <ModerationPage />;
}
