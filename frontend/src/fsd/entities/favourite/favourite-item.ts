export type FavouriteProductToggle = {
    product_id: string;
    liked: boolean;
};

export type FavouriteAuthorToggle = {
    author_id: string;
    liked: boolean;
};

export type FavouriteProductItem = {
    product_id: string;
    created_at: string;
};

export type FavouriteAuthorItem = {
    author_id: string;
    created_at: string;
};

export interface IFavouriteProductsResponse {
    items: FavouriteProductItem[];
}

export interface IFavouriteAuthorsResponse {
    items: FavouriteAuthorItem[];
}
