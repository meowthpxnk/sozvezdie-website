"use client";

import { buildCatalogHref } from "@shared/lib/catalog-url";
import { SORT_OPTIONS, SortType } from "@shared/model/sortType";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const PAGE_CONTENT_MAX_WIDTH = 1200;

function getPageHorizontalPadding(viewportWidth: number): number {
    if (viewportWidth >= 960) {
        return 32;
    }

    if (viewportWidth >= 640) {
        return 20;
    }

    return 12;
}
const CATALOG_FILTERS_OPEN_KEY = "catalog-filters-open";

const ProductSearchPannelStyles = styled.div`
    width: 100%;
    max-width: 100%;
    min-width: 0;
`;

const FIXED_HEADER_HEIGHT = 84;
const FLOATING_CONTROLS_TOP_OFFSET = 12;

const FiltersContainer = styled.div`
    width: 100%;
    max-width: ${PAGE_CONTENT_MAX_WIDTH}px;
    margin: 0 auto 20px;
    box-sizing: border-box;
`;

const ControlsPlaceholder = styled.div`
    height: 52px;
`;

const FiltersFullscreen = styled.div<{ $open: boolean }>`
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(9, 14, 24, 0.57);
    backdrop-filter: blur(6px);
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
    transition: opacity 0.2s ease;
`;

const ControlsRow = styled.div<{
    $floating: boolean;
    $top: number;
    $left: number;
    $width: number;
}>`
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    position: ${({ $floating }) => ($floating ? "fixed" : "relative")};
    top: ${({ $floating, $top }) => ($floating ? `${$top}px` : "auto")};
    left: ${({ $floating, $left }) => ($floating ? `${$left}px` : "auto")};
    width: ${({ $floating, $width }) =>
        $floating ? `${$width}px` : "100%"};
    max-width: 100%;
    z-index: ${({ $floating }) => ($floating ? 950 : 1)};
    transition: top 0.25s ease;
`;

const SearchBarWrapper = styled.div`
    position: relative;
    flex: 1;
    min-width: 0;
`;

const SearchIconWrapper = styled(Search)`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: #9aa3b2;
`;

const SearchFieldInput = styled.input<{ $showClear: boolean; $floating?: boolean }>`
    width: 100%;
    height: 52px;
    border-radius: 12px;
    border: 1px solid #d7ddea;
    background: #fff;
    padding: 0 ${({ $showClear }) => ($showClear ? "42px" : "12px")} 0 38px;
    color: #111;
    box-sizing: border-box;
    filter: ${({ $floating }) =>
        $floating ? "drop-shadow(0 0 15px rgba(9, 14, 24, 0.53))" : "none"};
    transition: filter 0.2s ease;

    &::placeholder {
        color: #8a97b1;
    }
`;

const ClearProductsSearchButton = styled.button`
    width: 28px;
    height: 28px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
    padding: 0;
    border: none;
    background-color: var(--neutral-surface-bg);
    color: #5d6b84;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;

    svg {
        width: 16px;
        height: 16px;
        margin: 0;
        stroke-width: 2.25;
        flex-shrink: 0;
    }

    &:hover {
        background-color: var(--main-color-tint-hover);
        color: #2d3a54;
    }
`;

const FilterButton = styled.button<{ $active: boolean; $floating?: boolean }>`
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: 12px;
    background: ${({ $active }) => ($active ? "var(--main-color)" : "var(--neutral-surface-bg)")};
    color: ${({ $active }) => ($active ? "#fff" : "var(--main-color)")};
    display: flex;
    align-items: center;
    justify-content: center;
    filter: ${({ $floating }) =>
        $floating ? "drop-shadow(0 0 15px rgba(9, 14, 24, 0.53))" : "none"};
    transition: background-color 0.2s ease, filter 0.2s ease;

    &:hover {
        background-color: ${({ $active }) => ($active ? "var(--main-color-hover)" : "var(--main-color-tint-hover)")};
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

const FiltersPanel = styled.div<{ $open: boolean }>`
    position: absolute;
    inset: 0;
    background: rgba(9, 14, 24, 0.42);
    backdrop-filter: blur(8px);
    padding: 162px 20px 20px;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    transform: translateY(${({ $open }) => ($open ? "0" : "12px")});
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    transition: transform 0.2s ease, opacity 0.2s ease;

    @media (min-width: 960px) {
        padding: 162px 32px 32px;
    }
`;

const FiltersContent = styled.div`
    background: #fff;
    border: 1px solid #d7ddea;
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: ${PAGE_CONTENT_MAX_WIDTH}px;
    margin: 0 auto;
    box-sizing: border-box;
`;

const FiltersPanelHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const FiltersPanelTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #132647;
`;

const FiltersCloseButton = styled.button`
    min-height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    background: #fff;
    color: #2d3a54;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;

    &:hover {
        background: #f5f7fb;
        border-color: #b8c4da;
    }
`;

const FilterSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const FilterSectionTitle = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: #2d3a54;
`;

const FilterSearchBarWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const FilterSearchIcon = styled(Search)`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: #9aa3b2;
    pointer-events: none;
`;

const FilterSearchFieldInput = styled.input<{ $showClear: boolean }>`
    width: 100%;
    height: 44px;
    border-radius: 10px;
    border: 1px solid #d7ddea;
    background: #f6f7f9;
    padding: 0 ${({ $showClear }) => ($showClear ? "40px" : "12px")} 0 36px;
    color: #111;
    box-sizing: border-box;
    font-size: 14px;

    &::placeholder {
        color: #8a97b1;
    }
`;

const FilterClearSearchButton = styled.button`
    width: 26px;
    height: 26px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
    padding: 0;
    border: none;
    background-color: var(--neutral-surface-bg);
    color: #5d6b84;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    svg {
        width: 14px;
        height: 14px;
        stroke-width: 2.25;
    }

    &:hover {
        background-color: var(--main-color-tint-hover);
        color: #2d3a54;
    }
`;

const FilterEmptyState = styled.p`
    margin: 0;
    padding: 8px 2px;
    font-size: 14px;
    color: #8a97b1;
`;

const FilterSelectList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
`;

const filterSelectOptionStyles = `
    width: 100%;
    min-height: 48px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid #d7ddea;
    background: #f6f7f9;
    color: #2d3a54;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-sizing: border-box;
    cursor: pointer;
    text-align: left;
    text-decoration: none;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
        background: #eef2f9;
        border-color: #d4dceb;
    }
`;

const FilterSelectButton = styled.button<{ $active?: boolean }>`
    ${filterSelectOptionStyles}

    border-color: ${({ $active }) => ($active ? "var(--main-color)" : "#d7ddea")};
    background: ${({ $active }) => ($active ? "var(--main-color-tint-soft)" : "#f6f7f9")};
`;

const FilterSelectLink = styled(Link) <{ $active?: boolean }>`
    ${filterSelectOptionStyles}

    border-color: ${({ $active }) => ($active ? "var(--main-color)" : "#d7ddea")};
    background: ${({ $active }) => ($active ? "var(--main-color-tint-soft)" : "#f6f7f9")};
`;

const FilterSelectLabel = styled.span`
    font-weight: 600;
    flex: 1;
    min-width: 0;
`;

const FilterSelectCount = styled.span<{ $active?: boolean }>`
    flex-shrink: 0;
    min-width: 28px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    color: ${({ $active }) => ($active ? "#fff" : "#314e7b")};
    background: ${({ $active }) => ($active ? "var(--main-color)" : "var(--main-color-tint-soft)")};
`;

export type FilterSelectOption = {
    slug: string | null;
    title: string;
    count: number;
};

export interface ProductSearchPannelProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    sortType: SortType;
    setSortType: (value: SortType) => void;
    categoryOptions: FilterSelectOption[];
    allCatalogCount: number;
    subcategoryOptions: FilterSelectOption[];
    fandomOptions: FilterSelectOption[];
    allFandomCount: number;
    categorySlug?: string;
    subcategorySlug?: string;
}

export const ProductSearchPannel = ({
    searchValue,
    setSearchValue,
    sortType,
    setSortType,
    categoryOptions,
    allCatalogCount,
    subcategoryOptions,
    fandomOptions,
    allFandomCount,
    categorySlug,
    subcategorySlug,
}: ProductSearchPannelProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const fandomSlug = searchParams.get("fandom");

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [fandomSearchValue, setFandomSearchValue] = useState("");
    const controlsRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [controlsMetrics, setControlsMetrics] = useState({
        top: 0,
        left: 0,
        width: 0,
    });
    const [isControlsFloating, setIsControlsFloating] = useState(false);

    const getContentBounds = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            return {
                left: rect.left,
                width: rect.width,
            };
        }

        const horizontalPadding = getPageHorizontalPadding(window.innerWidth);
        const width = Math.min(
            PAGE_CONTENT_MAX_WIDTH,
            window.innerWidth - horizontalPadding * 2
        );

        return {
            left: (window.innerWidth - width) / 2,
            width,
        };
    }, []);

    const getFloatingControlsMetrics = useCallback(() => {
        const bounds = getContentBounds();

        return {
            top: FIXED_HEADER_HEIGHT + FLOATING_CONTROLS_TOP_OFFSET,
            left: bounds.left,
            width: bounds.width,
        };
    }, [getContentBounds]);

    useEffect(() => {
        document.body.style.overflow = isFiltersOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isFiltersOpen]);

    useEffect(() => {
        if (!isControlsFloating) {
            return;
        }

        const updateMetrics = () => {
            setControlsMetrics(getFloatingControlsMetrics());
        };

        updateMetrics();
        window.addEventListener("resize", updateMetrics);

        return () => window.removeEventListener("resize", updateMetrics);
    }, [getFloatingControlsMetrics, isControlsFloating]);

    const openFilters = useCallback(() => {
        const targetMetrics = getFloatingControlsMetrics();

        if (controlsRef.current) {
            const rect = controlsRef.current.getBoundingClientRect();
            setControlsMetrics({
                top: rect.top,
                left: targetMetrics.left,
                width: targetMetrics.width,
            });
        } else {
            setControlsMetrics(targetMetrics);
        }

        setIsControlsFloating(true);
        setIsFiltersOpen(true);
        sessionStorage.setItem(CATALOG_FILTERS_OPEN_KEY, "1");

        requestAnimationFrame(() => {
            setControlsMetrics(getFloatingControlsMetrics());
        });
    }, [getFloatingControlsMetrics]);

    const closeFilters = useCallback(() => {
        const bounds = getContentBounds();

        sessionStorage.removeItem(CATALOG_FILTERS_OPEN_KEY);

        if (!containerRef.current) {
            setIsFiltersOpen(false);
            setIsControlsFloating(false);
            return;
        }

        setIsFiltersOpen(false);
        setFandomSearchValue("");

        const rect = containerRef.current.getBoundingClientRect();
        requestAnimationFrame(() => {
            setControlsMetrics({
                top: rect.top,
                left: bounds.left,
                width: bounds.width,
            });
        });

        window.setTimeout(() => {
            setIsControlsFloating(false);
        }, 250);
    }, [getContentBounds]);

    const keepFiltersOpen = useCallback(() => {
        sessionStorage.setItem(CATALOG_FILTERS_OPEN_KEY, "1");
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        if (sessionStorage.getItem(CATALOG_FILTERS_OPEN_KEY) !== "1") {
            return;
        }

        openFilters();
    }, [openFilters]);

    const handleFandomChange = (slug: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (slug) {
            params.set("fandom", slug);
        } else {
            params.delete("fandom");
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    const showFandomSection = fandomOptions.length > 0;

    const filteredFandomOptions = useMemo(() => {
        const query = fandomSearchValue.trim().toLowerCase();
        if (!query) {
            return fandomOptions;
        }

        return fandomOptions.filter((option) =>
            option.title.toLowerCase().includes(query)
        );
    }, [fandomOptions, fandomSearchValue]);

    const showAllFandomOption = useMemo(() => {
        const query = fandomSearchValue.trim().toLowerCase();
        if (!query) {
            return true;
        }

        return "все".includes(query);
    }, [fandomSearchValue]);

    const filtersOverlay =
        typeof document !== "undefined" ? (
            <FiltersFullscreen
                $open={isFiltersOpen}
                onClick={isFiltersOpen ? closeFilters : undefined}
            >
                <FiltersPanel
                    $open={isFiltersOpen}
                    onClick={(event) => event.stopPropagation()}
                >
                    <FiltersContent>
                        <FiltersPanelHeader>
                            <FiltersPanelTitle>Фильтры</FiltersPanelTitle>
                            <FiltersCloseButton
                                type="button"
                                onClick={closeFilters}
                                aria-label="Закрыть фильтры"
                            >
                                <X size={16} aria-hidden />
                                Готово
                            </FiltersCloseButton>
                        </FiltersPanelHeader>
                        {!categorySlug ? (
                            <FilterSection>
                                <FilterSectionTitle>
                                    Категория
                                </FilterSectionTitle>
                                <FilterSelectList>
                                    <FilterSelectLink
                                        href={buildCatalogHref({ fandomSlug })}
                                        onClick={keepFiltersOpen}
                                        $active={!categorySlug}
                                    >
                                        <FilterSelectLabel>
                                            Весь каталог
                                        </FilterSelectLabel>
                                        <FilterSelectCount $active={!categorySlug}>
                                            {allCatalogCount}
                                        </FilterSelectCount>
                                    </FilterSelectLink>
                                    {categoryOptions.map((option) => (
                                        <FilterSelectLink
                                            key={option.slug}
                                            href={buildCatalogHref({
                                                categorySlug: option.slug!,
                                                fandomSlug,
                                            })}
                                            onClick={keepFiltersOpen}
                                        >
                                            <FilterSelectLabel>
                                                {option.title}
                                            </FilterSelectLabel>
                                            <FilterSelectCount>
                                                {option.count}
                                            </FilterSelectCount>
                                        </FilterSelectLink>
                                    ))}
                                </FilterSelectList>
                            </FilterSection>
                        ) : (
                            <FilterSection>
                                <FilterSectionTitle>
                                    Подкатегория
                                </FilterSectionTitle>
                                <FilterSelectList>
                                    {subcategoryOptions.map((option) => {
                                        const isActive = option.slug
                                            ? subcategorySlug === option.slug
                                            : !subcategorySlug;

                                        if (option.slug === null) {
                                            return (
                                                <FilterSelectLink
                                                    key="all-subcategories"
                                                    href={buildCatalogHref({
                                                        categorySlug,
                                                        fandomSlug,
                                                    })}
                                                    onClick={keepFiltersOpen}
                                                    $active={isActive}
                                                >
                                                    <FilterSelectLabel>
                                                        {option.title}
                                                    </FilterSelectLabel>
                                                    <FilterSelectCount
                                                        $active={isActive}
                                                    >
                                                        {option.count}
                                                    </FilterSelectCount>
                                                </FilterSelectLink>
                                            );
                                        }

                                        return (
                                            <FilterSelectLink
                                                key={option.slug}
                                                href={buildCatalogHref({
                                                    categorySlug,
                                                    subcategorySlug:
                                                        option.slug,
                                                    fandomSlug,
                                                })}
                                                onClick={keepFiltersOpen}
                                                $active={isActive}
                                            >
                                                <FilterSelectLabel>
                                                    {option.title}
                                                </FilterSelectLabel>
                                                <FilterSelectCount
                                                    $active={isActive}
                                                >
                                                    {option.count}
                                                </FilterSelectCount>
                                            </FilterSelectLink>
                                        );
                                    })}
                                </FilterSelectList>
                            </FilterSection>
                        )}

                        {showFandomSection ? (
                            <FilterSection>
                                <FilterSectionTitle>Фэндом</FilterSectionTitle>
                                <FilterSearchBarWrapper>
                                    <FilterSearchIcon aria-hidden />
                                    <FilterSearchFieldInput
                                        type="text"
                                        value={fandomSearchValue}
                                        onChange={(event) =>
                                            setFandomSearchValue(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Поиск фэндома"
                                        aria-label="Поиск фэндома"
                                        $showClear={fandomSearchValue.length > 0}
                                    />
                                    {fandomSearchValue.length > 0 ? (
                                        <FilterClearSearchButton
                                            type="button"
                                            aria-label="Очистить поиск фэндома"
                                            onClick={() =>
                                                setFandomSearchValue("")
                                            }
                                        >
                                            <X aria-hidden strokeWidth={2.25} />
                                        </FilterClearSearchButton>
                                    ) : null}
                                </FilterSearchBarWrapper>
                                <FilterSelectList>
                                    {showAllFandomOption ? (
                                        <FilterSelectButton
                                            type="button"
                                            $active={!fandomSlug}
                                            onClick={() =>
                                                handleFandomChange(null)
                                            }
                                        >
                                            <FilterSelectLabel>
                                                Все
                                            </FilterSelectLabel>
                                            <FilterSelectCount
                                                $active={!fandomSlug}
                                            >
                                                {allFandomCount}
                                            </FilterSelectCount>
                                        </FilterSelectButton>
                                    ) : null}
                                    {filteredFandomOptions.map((option) => {
                                        const isActive =
                                            fandomSlug === option.slug;

                                        return (
                                            <FilterSelectButton
                                                key={option.slug}
                                                type="button"
                                                $active={isActive}
                                                onClick={() =>
                                                    handleFandomChange(
                                                        isActive
                                                            ? null
                                                            : option.slug
                                                    )
                                                }
                                            >
                                                <FilterSelectLabel>
                                                    {option.title}
                                                </FilterSelectLabel>
                                                <FilterSelectCount
                                                    $active={isActive}
                                                >
                                                    {option.count}
                                                </FilterSelectCount>
                                            </FilterSelectButton>
                                        );
                                    })}
                                    {!showAllFandomOption &&
                                        filteredFandomOptions.length === 0 ? (
                                        <FilterEmptyState>
                                            Фэндомы не найдены
                                        </FilterEmptyState>
                                    ) : null}
                                </FilterSelectList>
                            </FilterSection>
                        ) : null}

                        <FilterSection>
                            <FilterSectionTitle>Сортировка</FilterSectionTitle>
                            <FilterSelectList>
                                {SORT_OPTIONS.map((option) => {
                                    const isActive = sortType === option.value;

                                    return (
                                        <FilterSelectButton
                                            key={option.value}
                                            type="button"
                                            $active={isActive}
                                            onClick={() => {
                                                setSortType(option.value);
                                            }}
                                        >
                                            <FilterSelectLabel>
                                                {option.title}
                                            </FilterSelectLabel>
                                        </FilterSelectButton>
                                    );
                                })}
                            </FilterSelectList>
                        </FilterSection>
                    </FiltersContent>
                </FiltersPanel>
            </FiltersFullscreen>
        ) : null;

    return (
        <ProductSearchPannelStyles>
            <FiltersContainer ref={containerRef}>
                {isControlsFloating ? <ControlsPlaceholder /> : null}
                <ControlsRow
                    ref={controlsRef}
                    $floating={isControlsFloating}
                    $top={controlsMetrics.top}
                    $left={controlsMetrics.left}
                    $width={controlsMetrics.width}
                >
                    <SearchBarWrapper>
                        <SearchIconWrapper />
                        <SearchFieldInput
                            type="text"
                            value={searchValue}
                            onChange={(event) =>
                                setSearchValue(event.target.value)
                            }
                            placeholder="Поиск товара"
                            aria-label="Поиск товара или автора"
                            $showClear={searchValue.length > 0}
                            $floating={isControlsFloating}
                        />
                        {searchValue.length > 0 ? (
                            <ClearProductsSearchButton
                                type="button"
                                aria-label="Очистить поиск"
                                onClick={() => setSearchValue("")}
                            >
                                <X aria-hidden strokeWidth={2.25} />
                            </ClearProductsSearchButton>
                        ) : null}
                    </SearchBarWrapper>
                    <FilterButton
                        type="button"
                        $active={isFiltersOpen}
                        $floating={isControlsFloating}
                        aria-label={
                            isFiltersOpen
                                ? "Закрыть фильтры"
                                : "Открыть фильтры"
                        }
                        onClick={isFiltersOpen ? closeFilters : openFilters}
                    >
                        <SlidersHorizontal size={16} />
                    </FilterButton>
                </ControlsRow>
            </FiltersContainer>

            {filtersOverlay ? createPortal(filtersOverlay, document.body) : null}
        </ProductSearchPannelStyles>
    );
};

export default ProductSearchPannel;
