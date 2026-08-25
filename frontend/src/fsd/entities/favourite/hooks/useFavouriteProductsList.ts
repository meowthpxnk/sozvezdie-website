"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Author, authorService } from "@entities/author";
import { Product, productService } from "@entities/product";
import { getAccessToken } from "../../auth/auth-token.service";
import { useAppDispatch, useAppSelector } from "../../../shared/store/store";
import { fetchFavouriteProducts } from "../favouriteThunk";

export const useFavouriteProductsList = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const favouriteProducts = useAppSelector((state) => state.favourite.products);
    const storeLoading = useAppSelector((state) => state.favourite.productsLoading);
    const [snapshotIds, setSnapshotIds] = useState<string[] | null>(null);
    const [cacheTick, setCacheTick] = useState(0);
    const [productsHydrated, setProductsHydrated] = useState(false);
    const [authorsHydrated, setAuthorsHydrated] = useState(false);

    useEffect(() => {
        setSnapshotIds(null);
        setProductsHydrated(false);
        setAuthorsHydrated(false);
        if (!getAccessToken()) {
            return;
        }
        dispatch(fetchFavouriteProducts());
    }, [dispatch]);

    useEffect(() => {
        if (storeLoading || snapshotIds !== null) {
            return;
        }
        setSnapshotIds(favouriteProducts.map((item) => item.product_id));
    }, [storeLoading, favouriteProducts, snapshotIds]);

    const productIds = snapshotIds ?? [];

    const missingProductIds = useMemo(
        () =>
            productIds.filter(
                (id) => !queryClient.getQueryData<Product>(["product", id])
            ),
        [productIds, queryClient, cacheTick]
    );

    const {
        data: bulkProducts,
        isFetching: isProductsBulkFetching,
        isFetched: isProductsBulkFetched,
    } = useQuery({
        queryKey: ["favorites-page-products-bulk", missingProductIds],
        queryFn: () => productService.getProductsBulk(missingProductIds),
        enabled: snapshotIds !== null && missingProductIds.length > 0,
    });

    useEffect(() => {
        if (snapshotIds === null) {
            return;
        }
        if (productIds.length === 0 || missingProductIds.length === 0) {
            setProductsHydrated(true);
            return;
        }
        if (!isProductsBulkFetched) {
            return;
        }

        for (const product of bulkProducts ?? []) {
            queryClient.setQueryData(["product", product.id], product);
        }
        setCacheTick((value) => value + 1);
        setProductsHydrated(true);
    }, [
        bulkProducts,
        isProductsBulkFetched,
        missingProductIds.length,
        productIds.length,
        queryClient,
        snapshotIds,
    ]);

    const products = useMemo(() => {
        return productIds
            .map((id) => queryClient.getQueryData<Product>(["product", id]))
            .filter((product): product is Product => Boolean(product));
    }, [productIds, cacheTick, queryClient]);

    const missingAuthorIds = useMemo(() => {
        const ids = new Set<string>();

        for (const product of products) {
            if (
                product.authorId &&
                !queryClient.getQueryData<Author>(["author", product.authorId])
            ) {
                ids.add(product.authorId);
            }
        }

        return [...ids];
    }, [products, queryClient, cacheTick]);

    const { data: bulkAuthors, isFetching: isAuthorsBulkFetching } = useQuery({
        queryKey: ["favorites-page-product-authors-bulk", missingAuthorIds],
        queryFn: () => authorService.getAuthorsBulk(missingAuthorIds),
        enabled: snapshotIds !== null && missingAuthorIds.length > 0,
    });

    useEffect(() => {
        if (!bulkAuthors?.length) {
            return;
        }

        for (const author of bulkAuthors) {
            queryClient.setQueryData(["author", author.id], author);
        }
        setCacheTick((value) => value + 1);
    }, [bulkAuthors, queryClient]);

    const authorsById = useMemo(() => {
        const map = new Map<string, Author>();

        for (const product of products) {
            const author = queryClient.getQueryData<Author>([
                "author",
                product.authorId,
            ]);
            if (author) {
                map.set(author.id, author);
            }
        }

        return map;
    }, [products, cacheTick, queryClient]);

    const loading =
        snapshotIds === null ||
        storeLoading ||
        (productIds.length > 0 && !productsHydrated) ||
        isProductsBulkFetching ||
        (productsHydrated &&
            missingAuthorIds.length > 0 &&
            !authorsHydrated) ||
        isAuthorsBulkFetching;

    return {
        products,
        authorsById,
        loading,
        isEmpty: snapshotIds !== null && productIds.length === 0,
    };
};
