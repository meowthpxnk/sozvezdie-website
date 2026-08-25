"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import authorService from "@entities/author/author.service";

import { useAuthorProducts } from "../AuthorProductsPage/useAuthorProducts";

export function useAuthorDashboard() {
    const query = useQuery({
        queryKey: ["author", "dashboard"],
        queryFn: () => authorService.getMyDashboard(),
    });
    const {
        products,
        loading: productsLoading,
        isError: productsError,
    } = useAuthorProducts();

    const dashboard = useMemo(() => {
        if (!query.data) {
            return undefined;
        }

        return {
            ...query.data,
            productsCount: products.length,
            stockTotal: products.reduce(
                (total, product) => total + product.stockCount,
                0
            ),
            pendingCount: products.filter(
                (product) => product.moderationStatus === "PENDING"
            ).length,
            approvedCount: products.filter(
                (product) => product.moderationStatus === "APPROVED"
            ).length,
        };
    }, [products, query.data]);

    return {
        dashboard,
        loading: query.isLoading || productsLoading,
        isError: query.isError || productsError,
        refetch: query.refetch,
    };
}
