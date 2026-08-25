import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Product, productService } from "@entities/product";

import type { CartItem } from "../cart-item";

export function useCartProducts(cart: CartItem[]) {
    const queryClient = useQueryClient();
    const productIds = useMemo(
        () => [...cart.map((item) => item.product_id)].sort(),
        [cart]
    );

    const productsQuery = useQuery({
        queryKey: ["cart-products", productIds],
        queryFn: () => productService.getProductsBulk(productIds),
        enabled: productIds.length > 0,
    });

    useEffect(() => {
        if (!productsQuery.data) {
            return;
        }
        for (const product of productsQuery.data) {
            queryClient.setQueryData(["product", product.id], product);
        }
    }, [productsQuery.data, queryClient]);

    const productsById = useMemo(() => {
        const map = new Map<string, Product>();
        if (productsQuery.data) {
            for (const product of productsQuery.data) {
                map.set(product.id, product);
            }
        }
        for (const id of productIds) {
            if (!map.has(id)) {
                const cached = queryClient.getQueryData<Product>(["product", id]);
                if (cached) {
                    map.set(id, cached);
                }
            }
        }
        return map;
    }, [productsQuery.data, productIds, queryClient]);

    return {
        productsById,
        isLoading: productsQuery.isLoading,
        isFetching: productsQuery.isFetching,
        refetchProducts: productsQuery.refetch,
    };
}
