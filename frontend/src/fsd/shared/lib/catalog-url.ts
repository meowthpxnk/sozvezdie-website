export function buildCatalogPath(
    categorySlug?: string,
    subcategorySlug?: string
): string {
    if (categorySlug && subcategorySlug) {
        return `/products/${categorySlug}/${subcategorySlug}`;
    }

    if (categorySlug) {
        return `/products/${categorySlug}`;
    }

    return "/products";
}

export function appendFandomQuery(path: string, fandomSlug?: string | null): string {
    if (!fandomSlug) {
        return path;
    }

    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}fandom=${encodeURIComponent(fandomSlug)}`;
}

export function buildCatalogHref(
    options: {
        categorySlug?: string;
        subcategorySlug?: string;
        fandomSlug?: string | null;
    } = {}
): string {
    const path = buildCatalogPath(options.categorySlug, options.subcategorySlug);
    return appendFandomQuery(path, options.fandomSlug);
}
