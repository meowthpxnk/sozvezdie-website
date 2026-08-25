const STORAGE_KEY = "soz_age_confirmed";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type StoredAgeConfirmation = {
    confirmedAt: number;
};

type Listener = () => void;

const listeners = new Set<Listener>();

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export function subscribeGuestAgeConfirmation(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function readGuestAgeConfirmation(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return false;
        }

        const parsed = JSON.parse(raw) as StoredAgeConfirmation;
        if (!parsed?.confirmedAt || typeof parsed.confirmedAt !== "number") {
            localStorage.removeItem(STORAGE_KEY);
            return false;
        }

        if (Date.now() - parsed.confirmedAt > TTL_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return false;
        }

        return true;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return false;
    }
}

export function writeGuestAgeConfirmation(): void {
    if (typeof window === "undefined") {
        return;
    }

    const payload: StoredAgeConfirmation = { confirmedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    notifyListeners();
}
