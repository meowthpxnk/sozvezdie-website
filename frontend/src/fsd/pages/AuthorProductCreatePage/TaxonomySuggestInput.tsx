"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import { isValidSlug, translitToSlug } from "@shared/lib/slug";

export type TaxonomySuggestOption = {
    slug: string;
    title: string;
};

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

const InputWrap = styled.div`
    position: relative;
`;

const TextInput = styled.input`
    width: 100%;
    min-height: 42px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    padding: 10px 12px;
    font-size: 14px;
    color: #000;
    background: #fff;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const SuggestionsList = styled.ul`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 40;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    background: #fff;
    max-height: 180px;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.12);
`;

const SuggestionItem = styled.li`
    padding: 8px 12px;
    font-size: 14px;
    color: #2d3a54;
    cursor: pointer;

    &:hover,
    &:focus-visible {
        background: #eef3fc;
    }

    mark {
        background: #dce8ff;
        color: inherit;
        padding: 0;
    }
`;

const HintText = styled.span`
    font-size: 12px;
    color: #6b7890;
`;

type TaxonomySuggestInputProps = {
    id: string;
    label: string;
    labelText: string;
    slug: string;
    options: TaxonomySuggestOption[];
    placeholder: string;
    disabled?: boolean;
    emptyHint?: string;
    onChange: (label: string, slug: string) => void;
};

function highlightMatch(title: string, query: string) {
    if (!query.trim()) {
        return title;
    }

    const index = title.toLowerCase().indexOf(query.trim().toLowerCase());
    if (index < 0) {
        return title;
    }

    const before = title.slice(0, index);
    const match = title.slice(index, index + query.trim().length);
    const after = title.slice(index + query.trim().length);

    return (
        <>
            {before}
            <mark>{match}</mark>
            {after}
        </>
    );
}

function resolveSlugFromLabel(label: string, options: TaxonomySuggestOption[]): string {
    const trimmed = label.trim();
    if (!trimmed) {
        return "";
    }

    const byTitle = options.find(
        (option) => option.title.toLowerCase() === trimmed.toLowerCase()
    );
    if (byTitle) {
        return byTitle.slug;
    }

    const bySlug = options.find((option) => option.slug === trimmed);
    if (bySlug) {
        return bySlug.slug;
    }

    const slug = translitToSlug(trimmed);
    return slug && isValidSlug(slug) ? slug : "";
}

export function TaxonomySuggestInput({
    id,
    label,
    labelText,
    slug,
    options,
    placeholder,
    disabled = false,
    emptyHint,
    onChange,
}: TaxonomySuggestInputProps) {
    const inputWrapRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const displayLabel = useMemo(() => {
        if (!slug) {
            return labelText;
        }

        const match = options.find((option) => option.slug === slug);
        if (!match) {
            return labelText;
        }

        if (!labelText || labelText === slug) {
            return match.title;
        }

        return labelText;
    }, [labelText, options, slug]);

    const filteredOptions = useMemo(() => {
        const query = displayLabel.trim().toLowerCase();
        if (!query) {
            return options;
        }

        return options.filter(
            (option) =>
                option.title.toLowerCase().includes(query) ||
                option.slug.toLowerCase().includes(query)
        );
    }, [displayLabel, options]);

    const showSuggestions = isFocused && filteredOptions.length > 0;

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (!inputWrapRef.current?.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [isFocused]);

    return (
        <FieldGroup>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputWrap ref={inputWrapRef}>
                <TextInput
                    id={id}
                    value={displayLabel}
                    disabled={disabled}
                    placeholder={placeholder}
                    onFocus={() => setIsFocused(true)}
                    onChange={(event) => {
                        const nextLabel = event.target.value;
                        onChange(nextLabel, resolveSlugFromLabel(nextLabel, options));
                    }}
                    onBlur={() => {
                        window.setTimeout(() => setIsFocused(false), 120);
                    }}
                />
                {showSuggestions ? (
                    <SuggestionsList>
                        {filteredOptions.map((option) => (
                            <SuggestionItem
                                key={option.slug}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    onChange(option.title, option.slug);
                                    setIsFocused(false);
                                }}
                            >
                                {highlightMatch(option.title, displayLabel)}
                            </SuggestionItem>
                        ))}
                    </SuggestionsList>
                ) : null}
            </InputWrap>
            {!isFocused && !options.length && emptyHint ? <HintText>{emptyHint}</HintText> : null}
        </FieldGroup>
    );
}
