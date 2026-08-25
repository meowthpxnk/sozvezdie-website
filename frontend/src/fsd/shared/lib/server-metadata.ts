import { API_URL } from "@shared/config/public-env";

type NamedEntityMeta = {
    name: string;
};

async function fetchApiText(
    path: string,
    fields: Array<"name" | "title">
): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}${path}`, {
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as Partial<Record<"name" | "title", string>>;

        for (const field of fields) {
            const value = data[field]?.trim();
            if (value) {
                return value;
            }
        }

        return null;
    } catch {
        return null;
    }
}

async function fetchNamedEntity(path: string): Promise<NamedEntityMeta | null> {
    const name = await fetchApiText(path, ["name"]);

    if (!name) {
        return null;
    }

    return { name };
}

export async function fetchProductMeta(id: string): Promise<NamedEntityMeta | null> {
    return fetchNamedEntity(`/product/${encodeURIComponent(id)}`);
}

export async function fetchAuthorMeta(id: string): Promise<NamedEntityMeta | null> {
    return fetchNamedEntity(`/author/${encodeURIComponent(id)}`);
}

export async function fetchCategoryTitle(slug: string): Promise<string | null> {
    return fetchApiText(`/category/${encodeURIComponent(slug)}`, ["title"]);
}

export async function fetchSubcategoryTitle(
    categorySlug: string,
    subcategorySlug: string
): Promise<string | null> {
    try {
        const response = await fetch(
            `${API_URL}/category/${encodeURIComponent(categorySlug)}/subcategory`,
            { next: { revalidate: 60 } }
        );

        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as Array<{ slug: string; title: string }>;
        const subcategory = data.find((item) => item.slug === subcategorySlug);

        return subcategory?.title?.trim() ?? null;
    } catch {
        return null;
    }
}

export async function fetchFandomTitle(slug: string): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}/fandom`, {
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as Array<{ slug: string; title: string }>;
        const fandom = data.find((item) => item.slug === slug);

        return fandom?.title?.trim() ?? null;
    } catch {
        return null;
    }
}
