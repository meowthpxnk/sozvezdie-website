export interface Subcategory {
    id: number;
    slug: string;
    title: string;
    categorySlug: string;
    authorId?: string | null;
    isApproved?: boolean;
}

export interface SubcategoryCreatePayload {
    title: string;
    slug: string;
}
