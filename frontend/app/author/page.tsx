import type { Metadata } from "next";
import { AuthorsPage } from "@pages";
import { createPageMetadata } from "@shared/lib/page-metadata";

export const metadata: Metadata = createPageMetadata("Авторы");

export default function AuthorsRoutePage() {
    return <AuthorsPage />;
}
