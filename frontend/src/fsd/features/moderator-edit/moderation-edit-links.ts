export function buildProductModerationEditHref(productId: string) {
    return `/moderation/product-${productId}`;
}

export function buildBrandModerationEditHref(sellerCardId: string) {
    return `/moderation/brand-seller-${sellerCardId}`;
}

export function buildProductCatalogEditHref(productId: string) {
    return `/moderation/catalog/product/${productId}`;
}

export function buildBrandCatalogEditHref(sellerCardId: string) {
    return `/moderation/catalog/brand/${sellerCardId}`;
}
