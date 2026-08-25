"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Product, productService } from "@entities/product";
import { useAppSelector } from "../../shared/store/store";

import type { CheckoutLine } from "./checkout.types";
import { MEDIA_URL } from "@shared/api/interceptors";

const IMAGE_BASE = `${MEDIA_URL}/images-bucket`;

export function useCheckoutLines() {
    const queryClient = useQueryClient();
    const cart = useAppSelector((state) => state.cart.cart);
    const selectedIds = useAppSelector((state) => state.cart.selectedIds);
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const cartForCheckout = useMemo(
        () => cart.filter((item) => selectedSet.has(item.product_id)),
        [cart, selectedSet]
    );

    const [lines, setLines] = useState<CheckoutLine[]>([]);

    const missingIds = useMemo(
        () =>
            cartForCheckout
                .map((item) => item.product_id)
                .filter((id) => !queryClient.getQueryData<Product>(["product", id])),
        [cartForCheckout, queryClient]
    );

    const { data: missingProducts, isFetching: isFetchingProducts } = useQuery({
        queryKey: ["products-bulk", missingIds],
        queryFn: () => productService.getProductsBulk(missingIds),
        enabled: missingIds.length > 0,
    });

    useEffect(() => {
        if (!missingProducts) {
            return;
        }

        for (const product of missingProducts) {
            queryClient.setQueryData(["product", product.id], product);
        }
    }, [missingProducts, queryClient]);

    useEffect(() => {
        const nextLines = cartForCheckout
            .map((item) => {
                const product = queryClient.getQueryData<Product>([
                    "product",
                    item.product_id,
                ]);
                if (!product || item.quantity <= 0 || product.stockCount <= 0) {
                    return null;
                }

                const imageUuid = product.images[0] ?? product.mainImage;
                return {
                    productId: product.id,
                    title: product.name,
                    imageSrc: imageUuid
                        ? `${IMAGE_BASE}/${imageUuid}`
                        : undefined,
                    unitPrice: product.price,
                    quantity: item.quantity,
                    stockCount: product.stockCount,
                    isAdult: Boolean(product.isAdult),
                } satisfies CheckoutLine;
            })
            .filter((line) => line !== null);

        setLines(nextLines);
    }, [cartForCheckout, queryClient, missingProducts]);

    const inStockSelectedCount = useMemo(
        () =>
            cartForCheckout.filter((item) => {
                const product = queryClient.getQueryData<Product>([
                    "product",
                    item.product_id,
                ]);
                return product && product.stockCount > 0;
            }).length,
        [cartForCheckout, queryClient]
    );

    const isLoading =
        inStockSelectedCount > 0 &&
        (isFetchingProducts || lines.length < inStockSelectedCount);

    return {
        lines,
        isLoading,
        isEmpty: inStockSelectedCount === 0,
        hasSelection: inStockSelectedCount > 0,
    };
}
