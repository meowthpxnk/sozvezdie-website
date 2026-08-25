"use client";

import { categoryService } from "@entities/category";
import { productService } from "@entities/product";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import styled from "styled-components";

const PAGE_CONTENT_MAX_WIDTH = 1200;

const CatalogOverlayStyles = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    inset: 0;
    z-index: 1100;
    background: rgba(6, 10, 18, 0.63);
    backdrop-filter: blur(10px);
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
    transition: opacity 0.2s ease;
`;

const CatalogPanel = styled.div`
    background: transparent;
    min-height: 100vh;
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;

    @media (min-width: 960px) {
        padding: 24px 32px 32px;
    }
`;

const CatalogContentCard = styled.section`
    width: 100%;
    max-width: ${PAGE_CONTENT_MAX_WIDTH}px;
    margin: 0 auto;
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-sizing: border-box;

    @media (min-width: 960px) {
        padding: 24px;
        border-radius: 16px;
    }
`;

const CatalogPanelHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
`;

const CatalogPanelTitle = styled.h2`
    color: #111;
    font-size: 22px;
    font-weight: 700;
    margin: 0;
`;

const CatalogPanelDescription = styled.p`
    margin: 0;
    color: #4a5872;
    font-size: 14px;
    line-height: 1.45;
`;

const CatalogCloseButton = styled.button`
    width: 42px;
    height: 42px;
    border-radius: 10px;
    border: 1px solid #d7ddea;
    background: var(--neutral-surface-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--main-color);
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;

    &:hover {
        background: var(--main-color-tint-hover);
        border-color: #c8d3e8;
    }
`;

const CatalogCategoriesGrid = styled.ul`
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    list-style: none;
    padding: 0;
    margin: 0;

    @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    @media (min-width: 960px) {
        grid-template-columns: repeat(3, 1fr);
    }
`;

const catalogItemStyles = `
    background: #f6f7f9;
    border: 1px solid #dfe5f1;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #2d3a54;
    font-size: 15px;
    min-height: 56px;
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
    cursor: pointer;
    text-decoration: none;
    box-sizing: border-box;
    width: 100%;

    &:hover {
        background: #eef2f9;
        border-color: #d4dceb;
    }

    &:active {
        transform: translateY(1px);
    }
`;

const CatalogCategoryLink = styled(Link)`
    ${catalogItemStyles}
`;

const CatalogCategoryName = styled.span`
    font-weight: 600;
    text-align: left;
`;

const CatalogCategoryCount = styled.span`
    flex-shrink: 0;
    min-width: 28px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    color: #314e7b;
    background: var(--main-color-tint-soft);
`;

const CatalogAllLink = styled(Link)`
    ${catalogItemStyles}
    background: var(--main-color-tint-soft);
    border-color: #c8d8f0;
    font-weight: 600;
`;

const CatalogEmptyState = styled.p`
    margin: 0;
    color: #4a5872;
    font-size: 14px;
`;

export interface CatalogOverlayProps {
    close: () => void;
    isCatalogOpen: boolean;
}

export const CatalogOverlay = ({ isCatalogOpen, close }: CatalogOverlayProps) => {
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getCategories(),
        enabled: isCatalogOpen,
    });

    const { data: categoryFacets, isLoading: facetsLoading } = useQuery({
        queryKey: ["product-facets-categories"],
        queryFn: () => productService.getCategoryFacets(),
        enabled: isCatalogOpen,
    });

    const totalCount = categoryFacets?.total ?? 0;

    const categoryCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of categoryFacets?.items ?? []) {
            counts.set(item.slug, item.count);
        }
        return counts;
    }, [categoryFacets]);

    const isLoading = categoriesLoading || facetsLoading;

    const handleClose = () => {
        close();
    };

    return (
        <CatalogOverlayStyles
            $isOpen={isCatalogOpen}
            onClick={handleClose}
            aria-hidden={!isCatalogOpen}
        >
            <CatalogPanel onClick={handleClose}>
                <CatalogContentCard onClick={(event) => event.stopPropagation()}>
                    <CatalogPanelHeader>
                        <CatalogPanelTitle>Каталог</CatalogPanelTitle>
                        <CatalogCloseButton
                            type="button"
                            aria-label="Закрыть каталог"
                            onClick={handleClose}
                        >
                            <X size={18} />
                        </CatalogCloseButton>
                    </CatalogPanelHeader>

                    <CatalogPanelDescription>
                        Выберите категорию или откройте весь каталог.
                    </CatalogPanelDescription>

                    <CatalogCategoriesGrid>
                        <li>
                            <CatalogAllLink
                                href="/products"
                                onClick={handleClose}
                            >
                                <CatalogCategoryName>
                                    Весь каталог
                                </CatalogCategoryName>
                                {!isLoading ? (
                                    <CatalogCategoryCount>
                                        {totalCount}
                                    </CatalogCategoryCount>
                                ) : null}
                            </CatalogAllLink>
                        </li>
                        {isLoading ? (
                            <li>
                                <CatalogEmptyState>
                                    Загрузка каталога…
                                </CatalogEmptyState>
                            </li>
                        ) : (
                            categories
                                .filter(
                                    (category) =>
                                        (categoryCounts.get(category.slug) ?? 0) >
                                        0
                                )
                                .map((category) => (
                                    <li key={category.slug}>
                                        <CatalogCategoryLink
                                            href={`/products/${category.slug}`}
                                            onClick={handleClose}
                                        >
                                            <CatalogCategoryName>
                                                {category.title}
                                            </CatalogCategoryName>
                                            <CatalogCategoryCount>
                                                {categoryCounts.get(category.slug) ??
                                                    0}
                                            </CatalogCategoryCount>
                                        </CatalogCategoryLink>
                                    </li>
                                ))
                        )}
                    </CatalogCategoriesGrid>
                </CatalogContentCard>
            </CatalogPanel>
        </CatalogOverlayStyles>
    );
};

export default CatalogOverlay;
