import type { Metadata } from "next";
import { ModerationOrdersPage } from "@/src/fsd/pages/ModerationOrdersPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Заказы");

export default function ModerationOrdersRoute() {
    return <ModerationOrdersPage />;
}
