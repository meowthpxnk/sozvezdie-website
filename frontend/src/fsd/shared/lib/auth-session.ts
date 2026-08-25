import { removeAccessToken } from "@shared/services/auth-token.service";

/** Сессия считается определённой: можно опираться на role / isAuthenticated. */
export function isAuthSessionReady(
    hasAccessToken: boolean,
    sessionChecked: boolean
): boolean {
    if (!hasAccessToken) {
        return true;
    }

    return sessionChecked;
}

/** Сбрасывает access token и перенаправляет на страницу входа. */
export function redirectToLogin() {
    removeAccessToken();

    if (typeof window === "undefined") {
        return;
    }

    if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
    }
}