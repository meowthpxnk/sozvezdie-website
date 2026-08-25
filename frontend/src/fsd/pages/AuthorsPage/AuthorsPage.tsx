"use client";

import styled from "styled-components";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authorService } from "@entities/author";
import { ItemList } from "@features";
import { AuthorMiniCard } from "@widgets";

const MainWrapper = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
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

const SearchBarWrapper = styled.div`
    position: relative;
    width: 100%;

    @media (min-width: 960px) {
        max-width: 480px;
    }
`;

const SearchIconWrapper = styled(Search)`
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    --size: 18px;
    color: var(--color-text-secondary);
`;

const SearchInputWrapper = styled.input`
    width: 100%;
    height: 42px;
    border-radius: 12px;
    border: 1px solid var(--color-border-secondary);
    background: var(--color-bg-primary);
    padding: 0 12px 0 38px;
    color: var(--color-text-primary);
    font-size: 15px;

    &::placeholder {
        color: var(--color-text-secondary);
    }

    &:focus-visible {
        outline: 2px solid var(--focus-ring-color);
        outline-offset: 1px;
        border-color: var(--main-color, var(--main-color));
    }
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    color: var(--cart-summary-text-color, #666);
`;

export const AuthorsPage = () => {
    const [searchValue, setSearchValue] = useState("");
    const queryClient = useQueryClient();

    const { data: authors, isLoading, isError } = useQuery({
        queryKey: ["authors"],
        queryFn: () => authorService.getAuthors(),
    });

    useEffect(() => {
        if (!authors) {
            return;
        }

        for (const author of authors) {
            queryClient.setQueryData(["author", author.id], author);
        }
    }, [authors, queryClient]);

    const filteredAuthors = useMemo(() => {
        if (!authors) {
            return [];
        }

        const query = searchValue.trim().toLowerCase();
        if (!query) {
            return authors;
        }

        return authors.filter((author) =>
            author.name.toLowerCase().includes(query)
        );
    }, [authors, searchValue]);

    return (
        <MainWrapper className="flex-c indent-list int-16">
            <PageTitle>Авторы</PageTitle>

            <SearchBarWrapper>
                <SearchIconWrapper className="size-box pos-a" />
                <SearchInputWrapper
                    type="search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Поиск автора по имени"
                    aria-label="Поиск автора по имени"
                />
            </SearchBarWrapper>

            {isLoading ? (
                <EmptyState>Загрузка авторов…</EmptyState>
            ) : isError ? (
                <EmptyState>Не удалось загрузить список авторов.</EmptyState>
            ) : filteredAuthors.length === 0 ? (
                <EmptyState>
                    {searchValue.trim()
                        ? "По вашему запросу авторы не найдены."
                        : "Авторы пока не добавлены."}
                </EmptyState>
            ) : (
                <ItemList
                    title="Все авторы"
                    items={filteredAuthors}
                    gridVariant="authors"
                    renderItem={(author) => <AuthorMiniCard author={author} />}
                />
            )}
        </MainWrapper>
    );
};
