export const CATALOG_SEARCH_QUERY_KEY = "q";

/** Header search → catalog with optional initial query (read once on ProductsPage mount). */
export function buildGlobalCatalogSearchHref(query: string): string {
    const trimmed = query.trim();
    if (!trimmed) {
        return "/products";
    }

    return `/products?${CATALOG_SEARCH_QUERY_KEY}=${encodeURIComponent(trimmed)}`;
}

export function isCatalogPath(pathname: string | null): boolean {
    return pathname?.startsWith("/products") ?? false;
}
