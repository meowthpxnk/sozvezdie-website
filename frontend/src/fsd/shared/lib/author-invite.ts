const AUTHOR_INVITE_STORAGE_KEY = "authorInvite";

export function persistAuthorInviteFromSearch(search: string = window.location.search) {
    const token = new URLSearchParams(search).get("authorInvite")?.trim();
    if (token) {
        sessionStorage.setItem(AUTHOR_INVITE_STORAGE_KEY, token);
    }
}

export function shouldOpenRegisterFromSearch(
    search: string = window.location.search
): boolean {
    const params = new URLSearchParams(search);
    return params.get("mode") === "register" || Boolean(params.get("authorInvite")?.trim());
}

export function getStoredAuthorInvite(): string | null {
    return sessionStorage.getItem(AUTHOR_INVITE_STORAGE_KEY);
}

export function clearStoredAuthorInvite() {
    sessionStorage.removeItem(AUTHOR_INVITE_STORAGE_KEY);
}
