"use client";

import styled from "styled-components";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";

import { Author, Product } from "@entities";
import { authorService } from "@entities/author";
import { categoryService } from "@entities/category";
import { fandomService } from "@entities/fandom";
import { productService } from "@entities/product";
import { ItemList } from "@features";
import { buildCatalogHref } from "@shared/lib/catalog-url";
import { CATALOG_SEARCH_QUERY_KEY } from "@shared/lib/catalog-search";
import { SortType } from "@shared/model/sortType";
import { ProductCard, ProductSearchPannel } from "@widgets";

const MainWrapper = styled.div`
    width: 100%;
    max-width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;

    @media (min-width: 960px) {
        gap: 28px;
    }
`;

const PageTitle = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--title-color);
`;

const Breadcrumbs = styled.nav`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--cart-summary-text-color, #666);
`;

const BreadcrumbLink = styled(Link)`
    color: var(--main-color, var(--main-color));
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const EmptyState = styled.p`
    margin: 0;
    padding: 28px 20px;
    border-radius: 14px;
    background: var(--product-page-card-bg, #fff);
    text-align: center;
    font-size: 15px;
    line-height: 1.45;
    color: var(--cart-summary-text-color, #666);
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);

    @media (min-width: 960px) {
        padding: 40px 32px;
    }
`;

const LoadMoreSentinel = styled.div`
    width: 100%;
    min-height: 1px;
`;

const LoadingMoreState = styled.p`
    margin: 0;
    padding: 8px 0 24px;
    text-align: center;
    font-size: 14px;
    color: var(--cart-summary-text-color, #666);
`;

export interface ProductsPageProps {
    categorySlug?: string;
    subcategorySlug?: string;
}

export const ProductsPage = ({
    categorySlug,
    subcategorySlug,
}: ProductsPageProps) => {
    const searchParams = useSearchParams();
    const initialSearch =
        searchParams.get(CATALOG_SEARCH_QUERY_KEY)?.trim() ?? "";
    const [searchValue, setSearchValue] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [sortType, setSortType] = useState<SortType>("popular");
    const fandomSlug = searchParams.get("fandom");
    const queryClient = useQueryClient();
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(searchValue.trim());
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [searchValue]);

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getCategories(),
    });

    const { data: subcategories = [] } = useQuery({
        queryKey: ["subcategories", categorySlug],
        queryFn: () => categoryService.getSubcategories(categorySlug!),
        enabled: Boolean(categorySlug),
    });

    const { data: fandoms = [] } = useQuery({
        queryKey: ["fandoms"],
        queryFn: () => fandomService.getFandoms(),
    });

    const activeFandom = useMemo(
        () => fandoms.find((item) => item.slug === fandomSlug),
        [fandoms, fandomSlug]
    );

    const activeCategory = useMemo(
        () => categories.find((item) => item.slug === categorySlug),
        [categories, categorySlug]
    );

    const activeSubcategory = useMemo(
        () => subcategories.find((item) => item.slug === subcategorySlug),
        [subcategories, subcategorySlug]
    );

    const { data: categoryFacets } = useQuery({
        queryKey: ["product-facets-categories", fandomSlug ?? null],
        queryFn: () => productService.getCategoryFacets(fandomSlug),
    });

    const { data: subcategoryFacets } = useQuery({
        queryKey: [
            "product-facets-subcategories",
            categorySlug ?? null,
            fandomSlug ?? null,
        ],
        queryFn: () =>
            productService.getSubcategoryFacets(categorySlug!, fandomSlug),
        enabled: Boolean(categorySlug),
    });

    const { data: fandomFacets } = useQuery({
        queryKey: [
            "product-facets-fandoms",
            categorySlug ?? null,
            subcategorySlug ?? null,
        ],
        queryFn: () =>
            productService.getFandomFacets({
                categorySlug,
                subcategorySlug,
            }),
    });

    const categoryCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of categoryFacets?.items ?? []) {
            counts.set(item.slug, item.count);
        }
        return counts;
    }, [categoryFacets]);

    const categoryOptions = useMemo(
        () =>
            categories
                .map((category) => ({
                    slug: category.slug,
                    title: category.title,
                    count: categoryCounts.get(category.slug) ?? 0,
                }))
                .filter((category) => category.count > 0),
        [categories, categoryCounts]
    );

    const allCatalogCount = categoryFacets?.total ?? 0;

    const subcategoryCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of subcategoryFacets?.items ?? []) {
            counts.set(item.slug, item.count);
        }
        return counts;
    }, [subcategoryFacets]);

    const subcategoryOptions = useMemo(() => {
        if (!categorySlug) {
            return [];
        }

        return [
            { slug: null, title: "Все", count: subcategoryFacets?.total ?? 0 },
            ...subcategories
                .map((subcategory) => ({
                    slug: subcategory.slug,
                    title: subcategory.title,
                    count: subcategoryCounts.get(subcategory.slug) ?? 0,
                }))
                .filter((subcategory) => subcategory.count > 0),
        ];
    }, [categorySlug, subcategories, subcategoryCounts, subcategoryFacets]);

    const fandomCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of fandomFacets?.items ?? []) {
            counts.set(item.slug, item.count);
        }
        return counts;
    }, [fandomFacets]);

    const fandomOptions = useMemo(
        () =>
            fandoms
                .filter((fandom) => (fandomCounts.get(fandom.slug) ?? 0) > 0)
                .map((fandom) => ({
                    slug: fandom.slug,
                    title: fandom.title,
                    count: fandomCounts.get(fandom.slug) ?? 0,
                })),
        [fandomCounts, fandoms]
    );

    const allFandomCount = fandomFacets?.total ?? 0;

    const {
        data: productsData,
        isLoading: productsLoading,
        isError: productsError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: [
            "products",
            categorySlug ?? null,
            subcategorySlug ?? null,
            fandomSlug ?? null,
            sortType,
            debouncedSearch || null,
        ],
        queryFn: ({ pageParam }) =>
            productService.getProductsPage({
                categorySlug,
                subcategorySlug,
                fandomSlug,
                afterId: pageParam,
                sort: sortType,
                startsWith: debouncedSearch || null,
            }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) =>
            lastPage.hasMore ? lastPage.nextCursorId ?? undefined : undefined,
    });

    const products = useMemo(
        () => productsData?.pages.flatMap((page) => page.items) ?? [],
        [productsData]
    );

    const { data: authors } = useQuery({
        queryKey: ["authors"],
        queryFn: () => authorService.getAuthors(),
    });

    useEffect(() => {
        if (!products) {
            return;
        }

        for (const product of products) {
            queryClient.setQueryData(["product", product.id], product);
        }
    }, [products, queryClient]);

    useEffect(() => {
        if (!authors) {
            return;
        }

        for (const author of authors) {
            queryClient.setQueryData(["author", author.id], author);
        }
    }, [authors, queryClient]);

    const authorsById = useMemo(() => {
        const map = new Map<string, Author>();
        for (const author of authors ?? []) {
            map.set(author.id, author);
        }
        return map;
    }, [authors]);

    const displayedProducts = products;

    useEffect(() => {
        const sentinel = loadMoreRef.current;
        if (!sentinel) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (
                    entry?.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    void fetchNextPage();
                }
            },
            { rootMargin: "240px" }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, displayedProducts.length]);

    const pageTitle = subcategorySlug
        ? activeSubcategory?.title ?? subcategorySlug
        : categorySlug
          ? activeCategory?.title ?? categorySlug
          : "Каталог";

    const listTitle = subcategorySlug
        ? activeSubcategory?.title ?? "Товары"
        : categorySlug
          ? activeCategory?.title ?? "Товары"
          : "Все товары";

    const hasActiveFilters =
        Boolean(debouncedSearch) || Boolean(fandomSlug);

    return (
        <MainWrapper className="flex-c indent-list int-16">
            <PageTitle>{pageTitle}</PageTitle>

            {(categorySlug || subcategorySlug) && (
                <Breadcrumbs aria-label="Навигация по каталогу">
                    <BreadcrumbLink
                        href={buildCatalogHref({ fandomSlug })}
                    >
                        Каталог
                    </BreadcrumbLink>
                    {categorySlug ? (
                        <>
                            <span>/</span>
                            {subcategorySlug ? (
                                <BreadcrumbLink
                                    href={buildCatalogHref({
                                        categorySlug,
                                        fandomSlug,
                                    })}
                                >
                                    {activeCategory?.title ?? categorySlug}
                                </BreadcrumbLink>
                            ) : (
                                <span>{activeCategory?.title ?? categorySlug}</span>
                            )}
                        </>
                    ) : null}
                    {fandomSlug ? (
                        <>
                            <span>·</span>
                            <span>{activeFandom?.title ?? fandomSlug}</span>
                        </>
                    ) : null}
                    {subcategorySlug ? (
                        <>
                            <span>/</span>
                            <span>
                                {activeSubcategory?.title ?? subcategorySlug}
                            </span>
                        </>
                    ) : null}
                </Breadcrumbs>
            )}

            <ProductSearchPannel
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                sortType={sortType}
                setSortType={setSortType}
                categoryOptions={categoryOptions}
                allCatalogCount={allCatalogCount}
                subcategoryOptions={subcategoryOptions}
                fandomOptions={fandomOptions}
                allFandomCount={allFandomCount}
                categorySlug={categorySlug}
                subcategorySlug={subcategorySlug}
            />

            {productsLoading ? (
                <EmptyState>Загрузка товаров…</EmptyState>
            ) : productsError ? (
                <EmptyState>Не удалось загрузить каталог.</EmptyState>
            ) : displayedProducts.length === 0 ? (
                <EmptyState>
                    {hasActiveFilters
                        ? "По выбранным фильтрам товары не найдены."
                        : categorySlug
                          ? subcategorySlug
                              ? "В этой подкатегории пока нет товаров."
                              : "В этой категории пока нет товаров."
                          : "Товары пока не добавлены."}
                </EmptyState>
            ) : (
                <>
                    <ItemList
                        title={listTitle}
                        items={displayedProducts}
                        layout="grid"
                        gridVariant="catalog"
                        renderItem={(product: Product) => (
                            <ProductCard
                                product={product}
                                author={authorsById.get(product.authorId)}
                            />
                        )}
                    />
                    <LoadMoreSentinel ref={loadMoreRef} aria-hidden />
                    {isFetchingNextPage ? (
                        <LoadingMoreState>Загрузка товаров…</LoadingMoreState>
                    ) : null}
                </>
            )}
        </MainWrapper>
    );
};
