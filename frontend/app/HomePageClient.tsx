"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authorService } from "@entities/author";
import { productService } from "@entities/product";
import { advertBannerService } from "@entities/advert-banner";
import { LandingPage } from "@pages";
import { Author, ProductWithAuthor } from "@entities";

const LANDING_PRODUCTS_LIMIT = 20;

function buildAuthorsMap(...authorLists: (Author[] | undefined)[]) {
    const map = new Map<string, Author>();

    for (const authors of authorLists) {
        if (!authors) {
            continue;
        }

        for (const author of authors) {
            map.set(String(author.id), author);
        }
    }

    return map;
}

export function HomePageClient() {
    const queryClient = useQueryClient();

    const { data: newestProductsPage, isLoading: productsLoading } = useQuery({
        queryKey: ["products", "landing", "newest"],
        queryFn: () =>
            productService.getProductsPage({
                limit: LANDING_PRODUCTS_LIMIT,
                sort: "newest",
            }),
    });

    const { data: banners } = useQuery({
        queryKey: ["advertBanners"],
        queryFn: () => advertBannerService.getAdvertBanners(),
    });

    const newestProducts = useMemo(
        () => newestProductsPage?.items ?? [],
        [newestProductsPage?.items]
    );

    useEffect(() => {
        for (const product of newestProducts) {
            queryClient.setQueryData(["product", product.id], product);
        }
    }, [newestProducts, queryClient]);

    const landingAuthorIds = useMemo(
        () => [...new Set(newestProducts.map((product) => String(product.authorId)))],
        [newestProducts]
    );

    const { data: bulkAuthors, isFetching: bulkAuthorsLoading } = useQuery({
        queryKey: ["authors-bulk", "landing", landingAuthorIds],
        queryFn: () => authorService.getAuthorsBulk(landingAuthorIds),
        enabled: landingAuthorIds.length > 0,
    });

    const { data: popularAuthors } = useQuery({
        queryKey: ["authors", "popular"],
        queryFn: () => authorService.getPopularAuthors(),
    });

    useEffect(() => {
        for (const author of [...(bulkAuthors ?? []), ...(popularAuthors ?? [])]) {
            queryClient.setQueryData(["author", author.id], author);
        }
    }, [bulkAuthors, popularAuthors, queryClient]);

    const authorsById = useMemo(
        () => buildAuthorsMap(bulkAuthors, popularAuthors),
        [bulkAuthors, popularAuthors]
    );

    const productsWithAuthors = useMemo((): ProductWithAuthor[] => {
        if (productsLoading && newestProducts.length === 0) {
            return [];
        }

        return newestProducts
            .map((product) => {
                const author = authorsById.get(String(product.authorId));

                if (!author) {
                    return null;
                }

                return { ...product, author };
            })
            .filter((product): product is ProductWithAuthor => product !== null);
    }, [authorsById, newestProducts, productsLoading]);

    const authorsResolved =
        landingAuthorIds.length === 0 ||
        landingAuthorIds.every((id) => authorsById.has(id));

    const landingProductList =
        productsLoading && newestProducts.length === 0
            ? []
            : authorsResolved || !bulkAuthorsLoading
                ? productsWithAuthors
                : [];

    return (
        <LandingPage
            newProductList={landingProductList}
            recommendedProductList={landingProductList}
            advertBanners={banners}
            popularAuthors={popularAuthors ?? []}
        />
    );
}
