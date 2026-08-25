"use client";

import { useMemo } from "react";
import styled from "styled-components";

import { useProductTaxonomy } from "./useProductTaxonomy";
import { TaxonomySuggestInput } from "./TaxonomySuggestInput";

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const FieldLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #2d3a54;
`;

const SelectInput = styled.select`
    width: 100%;
    min-height: 42px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    padding: 10px 12px;
    font-size: 14px;
    color: #000;
    background: #fff;
    cursor: pointer;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TaxonomyFieldBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const NewTaxonomyHint = styled.p`
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: #8a5a12;
    background: #fff4e5;
    border-radius: 8px;
    padding: 8px 10px;
`;

type ProductTaxonomyFieldsProps = {
    categorySlug: string;
    subcategorySlug: string;
    subcategoryLabel: string;
    fandomSlug: string;
    fandomLabel: string;
    showUnapprovedTaxonomyHints?: boolean;
    onCategoryChange: (slug: string) => void;
    onSubcategoryChange: (label: string, slug: string) => void;
    onFandomChange: (label: string, slug: string) => void;
};

function isUnapprovedTaxonomySelection(
    options: { slug: string; title: string; isApproved?: boolean }[],
    slug: string,
    label: string
): boolean {
    const trimmed = label.trim();
    if (!trimmed) {
        return false;
    }

    const bySlug = slug ? options.find((option) => option.slug === slug) : undefined;
    if (bySlug) {
        return bySlug.isApproved !== true;
    }

    const byTitle = options.find(
        (option) => option.title.toLowerCase() === trimmed.toLowerCase()
    );
    if (byTitle) {
        return byTitle.isApproved !== true;
    }

    // Free-text value that does not match an existing option yet.
    return true;
}

export function ProductTaxonomyFields({
    categorySlug,
    subcategorySlug,
    subcategoryLabel,
    fandomSlug,
    fandomLabel,
    showUnapprovedTaxonomyHints = false,
    onCategoryChange,
    onSubcategoryChange,
    onFandomChange,
}: ProductTaxonomyFieldsProps) {
    const { categories, subcategories, fandoms, loading, subcategoriesLoading } =
        useProductTaxonomy(categorySlug);

    const showNewSubcategoryHint = useMemo(
        () =>
            showUnapprovedTaxonomyHints &&
            Boolean(categorySlug) &&
            isUnapprovedTaxonomySelection(
                subcategories,
                subcategorySlug,
                subcategoryLabel
            ),
        [
            categorySlug,
            showUnapprovedTaxonomyHints,
            subcategoryLabel,
            subcategorySlug,
            subcategories,
        ]
    );

    const showNewFandomHint = useMemo(
        () =>
            showUnapprovedTaxonomyHints &&
            isUnapprovedTaxonomySelection(fandoms, fandomSlug, fandomLabel),
        [fandomLabel, fandomSlug, fandoms, showUnapprovedTaxonomyHints]
    );

    return (
        <>
            <FieldGroup>
                <FieldLabel htmlFor="product-category">Категория</FieldLabel>
                <SelectInput
                    id="product-category"
                    value={categorySlug}
                    disabled={loading}
                    onChange={(event) => onCategoryChange(event.target.value)}
                >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                            {category.title}
                        </option>
                    ))}
                </SelectInput>
            </FieldGroup>

            {categorySlug ? (
                <TaxonomyFieldBlock>
                    <TaxonomySuggestInput
                        id="product-subcategory"
                        label="Подкатегория"
                        labelText={subcategoryLabel}
                        slug={subcategorySlug}
                        options={subcategories}
                        placeholder="Введите или выберите подкатегорию"
                        disabled={subcategoriesLoading}
                        emptyHint="Подкатегорий пока нет — введите своё название"
                        onChange={onSubcategoryChange}
                    />
                    {showNewSubcategoryHint ? (
                        <NewTaxonomyHint>
                            * новая подкатегория, которая ещё не проходила модерацию —
                            проверьте, нет ли уже такой подкатегории под другим названием
                        </NewTaxonomyHint>
                    ) : null}
                </TaxonomyFieldBlock>
            ) : null}

            <TaxonomyFieldBlock>
                <TaxonomySuggestInput
                    id="product-fandom"
                    label="Фандом"
                    labelText={fandomLabel}
                    slug={fandomSlug}
                    options={fandoms}
                    placeholder="Введите или выберите фандом"
                    disabled={loading}
                    emptyHint="Фандомов пока нет — введите своё название"
                    onChange={onFandomChange}
                />
                {showNewFandomHint ? (
                    <NewTaxonomyHint>
                        * новый фандом, который ещё не проходил модерацию — проверьте,
                        нет ли уже такого фандома под другим названием
                    </NewTaxonomyHint>
                ) : null}
            </TaxonomyFieldBlock>
        </>
    );
}
