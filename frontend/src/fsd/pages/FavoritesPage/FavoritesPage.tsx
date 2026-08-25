"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ItemList } from "@features";
import { AuthorMiniCard, ProductCard } from "@widgets";
import { useAuth } from "../../entities/auth/hooks";
import {
    useFavouriteAuthorsList,
    useFavouriteProductsList,
} from "../../entities/favourite/hooks";

const MainWrapper = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 28px;

    @media (min-width: 960px) {
        gap: 40px;
    }
`;

const PageTitle = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--title-color);
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    color: var(--cart-summary-text-color, #666);
`;

export const FavoritesPage = () => {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const {
        products,
        authorsById,
        loading: productsLoading,
        isEmpty: productsEmpty,
    } = useFavouriteProductsList();
    const {
        authors,
        loading: authorsLoading,
        isEmpty: authorsEmpty,
    } = useFavouriteAuthorsList();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            // router.replace("/auth");
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading || !isAuthenticated) {
        return null;
    }

    return (
        <MainWrapper className="flex-c indent-list int-16">
            <PageTitle>Избранное</PageTitle>

            {productsLoading ? (
                <EmptyState>Загрузка товаров…</EmptyState>
            ) : productsEmpty ? (
                <EmptyState>У вас пока нет избранных товаров.</EmptyState>
            ) : (
                <ItemList
                    title="Товары"
                    href="/products"
                    items={products}
                    gridVariant="catalog"
                    renderItem={(product) => (
                        <ProductCard
                            product={product}
                            author={authorsById.get(product.authorId)}
                        />
                    )}
                />
            )}

            {authorsLoading ? (
                <EmptyState>Загрузка авторов…</EmptyState>
            ) : authorsEmpty ? (
                <EmptyState>У вас пока нет избранных авторов.</EmptyState>
            ) : (
                <ItemList
                    title="Авторы"
                    href="/authors"
                    items={authors}
                    gridVariant="authors"
                    renderItem={(author) => <AuthorMiniCard author={author} />}
                />
            )}
        </MainWrapper>
    );
};
