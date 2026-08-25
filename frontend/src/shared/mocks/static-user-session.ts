import type { AuthorMock, ProductMock } from "./types";
import productsCatalogJson from "./json/products-catalog.json";
import productDetailContext from "./json/product-detail-context.json";

/** Полный витринный каталог до слияния с seller snapshot */
export const MOCK_PRODUCTS_CATALOG: ProductMock[] = productsCatalogJson as ProductMock[];

/** Авторы витрины из мока (база для overlay бренда продавца) */
export const MOCK_BASE_STOREFRONT_AUTHORS: AuthorMock[] = productDetailContext.storefrontAuthors as AuthorMock[];

/**
 Единые статические «избранное» и корзина для всех экранов.
 Редактируйте эти константы вместо JSON-веток и localStorage.
 */
export const MOCK_LIKED_PRODUCT_IDS: readonly string[] = [];

export const MOCK_LIKED_AUTHOR_IDS: readonly string[] = [];

export const MOCK_CART_QUANTITIES: Readonly<Record<string, number>> = {};
