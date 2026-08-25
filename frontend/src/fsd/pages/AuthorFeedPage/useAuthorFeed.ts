"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import authorService from "@entities/author/author.service";
import {
    type AuthorFeedFilter,
    type AuthorFeedItem,
    mapBrandModerationToFeedItem,
    mapProductDeletionToFeedItem,
    mapProductToFeedItem,
} from "@entities/author/author-feed.types";

import { useAuthorProducts } from "../AuthorProductsPage/useAuthorProducts";

export function useAuthorFeed() {
    const [filter, setFilter] = useState<AuthorFeedFilter>("ALL");
    const {
        products,
        loading: productsLoading,
        isError: productsError,
        refetch: refetchProducts,
    } = useAuthorProducts({ includeDeleted: true });

    const brandQuery = useQuery({
        queryKey: ["author", "brand-moderations"],
        queryFn: () => authorService.getMyBrandModerations(),
    });

    const items = useMemo<AuthorFeedItem[]>(() => {
        const productItems = products.flatMap((product) => {
            const items =
                product.deletionRequestStatus === "APPROVED"
                    ? []
                    : [mapProductToFeedItem(product)];
            if (product.deletionRequestStatus) {
                items.push(mapProductDeletionToFeedItem(product));
            }
            return items;
        });
        const brandItems = (brandQuery.data ?? []).map(mapBrandModerationToFeedItem);
        return [...productItems, ...brandItems].sort(
            (left, right) =>
                new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        );
    }, [brandQuery.data, products]);

    const filteredItems = useMemo(() => {
        if (filter === "ALL") {
            return items;
        }

        return items.filter((item) => item.status === filter);
    }, [filter, items]);

    return {
        filter,
        setFilter,
        items: filteredItems,
        loading: productsLoading || brandQuery.isLoading,
        isError: productsError || brandQuery.isError,
        refetch: async () => {
            await Promise.all([refetchProducts(), brandQuery.refetch()]);
        },
    };
}
