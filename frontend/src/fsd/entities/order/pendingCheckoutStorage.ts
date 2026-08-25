export const PENDING_CHECKOUT_STORAGE_KEY = "soz_pending_checkout_id";

export function savePendingCheckoutId(checkoutId: number): void {
    if (typeof window === "undefined") {
        return;
    }
    const value = String(checkoutId);
    sessionStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, value);
    localStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, value);
}

export function readPendingCheckoutId(): number | null {
    if (typeof window === "undefined") {
        return null;
    }
    const raw =
        sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY) ??
        localStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
    if (!raw) {
        return null;
    }
    const id = Number(raw);
    return Number.isNaN(id) ? null : id;
}

export function clearPendingCheckoutId(): void {
    if (typeof window === "undefined") {
        return;
    }
    sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
    localStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
}
