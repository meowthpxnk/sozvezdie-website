const NAVIGATION_RETURN_TO_STORAGE_KEY = "navigationReturnTo";

function getPathnameOnly(path: string): string {
    return path.split("?")[0]?.split("#")[0] ?? path;
}

function isExcludedReturnPath(path: string): boolean {
    const pathname = getPathnameOnly(path);

    if (pathname.startsWith("/product/")) {
        return true;
    }

    if (pathname === "/authors" || pathname.startsWith("/authors/")) {
        return false;
    }

    return pathname.startsWith("/author/");
}

function isEntityEntryPath(pathname: string): boolean {
    if (pathname.startsWith("/product/")) {
        return true;
    }

    if (pathname === "/authors" || pathname.startsWith("/authors/")) {
        return false;
    }

    return pathname.startsWith("/author/");
}

export function saveNavigationReturnPath(path: string): void {
    if (typeof window === "undefined") {
        return;
    }

    const normalizedPath = path.trim();
    if (!normalizedPath || isExcludedReturnPath(normalizedPath)) {
        return;
    }

    sessionStorage.setItem(NAVIGATION_RETURN_TO_STORAGE_KEY, normalizedPath);
}

export function captureNavigationReturnPath(): void {
    if (typeof window === "undefined") {
        return;
    }

    saveNavigationReturnPath(
        `${window.location.pathname}${window.location.search}${window.location.hash}`
    );
}

export function resolvePathAfterEntityDelete(
    entityPath: string,
    fallback: string
): string {
    if (typeof window === "undefined") {
        return fallback;
    }

    const storedPath = sessionStorage.getItem(NAVIGATION_RETURN_TO_STORAGE_KEY);
    sessionStorage.removeItem(NAVIGATION_RETURN_TO_STORAGE_KEY);

    if (
        storedPath &&
        storedPath !== entityPath &&
        !storedPath.startsWith(`${entityPath}?`)
    ) {
        return storedPath;
    }

    return fallback;
}

export function resolvePathAfterProductDelete(
    productId: string,
    fallback = "/products"
): string {
    return resolvePathAfterEntityDelete(`/product/${productId}`, fallback);
}

export function resolvePathAfterAuthorDelete(
    authorId: string,
    fallback = "/authors"
): string {
    return resolvePathAfterEntityDelete(`/author/${authorId}`, fallback);
}

export function shouldTrackEntityEntryPath(pathname: string): boolean {
    return isEntityEntryPath(pathname);
}

// Backward-compatible aliases
export const saveProductReturnPath = saveNavigationReturnPath;
