import type { Metadata } from "next";
import { FaqPage } from "@/src/fsd/pages/FaqPage";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Часто задаваемые вопросы");

export default function FaqRoute() {
    return <FaqPage />;
}
