"use client";

import { useMemo } from "react";
import type { CreateSellerProductPayload, SellerSnapshot, UpdateSellerBrandPayload, UpdateSellerProductPayload } from "@/src/shared/types/seller";
import { createDefaultSellerSnapshot } from "@/src/shared/mocks/seller-snapshot-factory";
import { MOCK_BASE_STOREFRONT_AUTHORS, MOCK_PRODUCTS_CATALOG } from "@/src/shared/mocks/static-user-session";
import { buildStorefrontAuthors, buildStorefrontProducts } from "@/src/shared/mocks/storefront-from-snapshot";
import type { AuthorMock, ProductMock } from "@/src/shared/mocks/types";

export function useSellerData(): {
    snapshot: SellerSnapshot;
    storefrontAuthors: AuthorMock[];
    storefrontProducts: ProductMock[];
    refresh: () => Promise<void>;
    createProduct: (payload: CreateSellerProductPayload) => Promise<void>;
    updateProduct: (payload: UpdateSellerProductPayload) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    updateBrand: (payload: UpdateSellerBrandPayload) => Promise<void>;
} {
    const snapshot = useMemo(() => createDefaultSellerSnapshot(), []);
    const storefrontAuthors = useMemo(
        () => buildStorefrontAuthors(snapshot, MOCK_BASE_STOREFRONT_AUTHORS),
        [snapshot],
    );
    const storefrontProducts = useMemo(
        () => buildStorefrontProducts(snapshot, MOCK_PRODUCTS_CATALOG),
        [snapshot],
    );

    return {
        snapshot,
        storefrontAuthors,
        storefrontProducts,
        refresh: async () => {},
        createProduct: async (_payload: CreateSellerProductPayload) => {},
        updateProduct: async (_payload: UpdateSellerProductPayload) => {},
        deleteProduct: async (_id: string) => {},
        updateBrand: async (_payload: UpdateSellerBrandPayload) => {},
    };
}
