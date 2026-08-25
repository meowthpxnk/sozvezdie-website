import { createDefaultSellerSnapshot } from "./seller-snapshot-factory";
import { MOCK_BASE_STOREFRONT_AUTHORS, MOCK_PRODUCTS_CATALOG } from "./static-user-session";
import { buildStorefrontAuthors, buildStorefrontProducts } from "./storefront-from-snapshot";
import type { AuthorMock, ProductMock } from "./types";

export function getStaticStorefrontProducts(): ProductMock[] {
    return buildStorefrontProducts(createDefaultSellerSnapshot(), MOCK_PRODUCTS_CATALOG);
}

export function getStaticStorefrontAuthors(): AuthorMock[] {
    return buildStorefrontAuthors(createDefaultSellerSnapshot(), MOCK_BASE_STOREFRONT_AUTHORS);
}
