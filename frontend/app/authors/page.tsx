import type { Metadata } from "next";
import { AuthorsPage } from "@pages";

export const metadata: Metadata = {
    title: "Авторы",
};

export default function AuthorsRoute() {
    return <AuthorsPage />;
}
