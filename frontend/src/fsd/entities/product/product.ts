import { Author } from "@entities";

export interface ProductFacetCountItem {
    slug: string;
    count: number;
}

export interface ProductFacets {
    total: number;
    items: ProductFacetCountItem[];
}

export interface ProductsPageResult {
    items: Product[];
    nextCursorId: string | null;
    hasMore: boolean;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    mainImage: string;
    images: string[];
    authorId: string;
    stockCount: number;
    categorySlug?: string | null;
    subcategorySlug?: string | null;
    fandomSlug?: string | null;
    isAdult?: boolean;
}



export interface ProductWithAuthor extends Product {
    author: Pick<Author, "id" | "name">;
}

export interface ProductPageDetails extends Product {
    author: Pick<Author, "id" | "name" | "avatarImage">;
}
