import type { Metadata } from "next";

export const SITE_TITLE = "Созвездие | Полки";
export const SITE_TITLE_SUFFIX = "Созвездие";

export function createPageMetadata(title: string): Metadata {
    return { title };
}

export function createAuthorPageMetadata(authorName?: string | null): Metadata {
    const name = authorName?.trim();

    return createPageMetadata(name ? `${name} (автор)` : "Автор");
}
