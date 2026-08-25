import type { Metadata } from "next";
import { AuthorDashboardPage } from "@pages";

export const metadata: Metadata = {
    title: "Кабинет автора",
};

export default function AdminRoute() {
    return <AuthorDashboardPage />;
}
