import type { Metadata } from "next";
import { AuthPage } from "@pages";

export const metadata: Metadata = {
    title: "Вход",
};

export default function AuthRoute() {
    return <AuthPage />;
}
