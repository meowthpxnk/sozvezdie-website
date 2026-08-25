import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    FavouriteAuthorItem,
    FavouriteProductItem,
} from "../../entities/favourite/favourite-item";
import {
    fetchFavouriteAuthors,
    fetchFavouriteProducts,
} from "../../entities/favourite/favouriteThunk";

export interface IFavouriteStoreState {
    products: FavouriteProductItem[];
    authors: FavouriteAuthorItem[];
    productsLoading: boolean;
    authorsLoading: boolean;
}

const initialState: IFavouriteStoreState = {
    products: [],
    authors: [],
    productsLoading: false,
    authorsLoading: false,
};

export const favouriteSlice = createSlice({
    name: "favourite",
    initialState,
    reducers: {
        setFavouriteProducts: (
            state,
            action: PayloadAction<FavouriteProductItem[]>
        ) => {
            state.products = action.payload;
        },
        setFavouriteAuthors: (
            state,
            action: PayloadAction<FavouriteAuthorItem[]>
        ) => {
            state.authors = action.payload;
        },
        toggleFavouriteProduct: (
            state,
            action: PayloadAction<{ product_id: string; liked: boolean }>
        ) => {
            if (action.payload.liked) {
                const exists = state.products.some(
                    (item) => item.product_id === action.payload.product_id
                );
                if (!exists) {
                    state.products.unshift({
                        product_id: action.payload.product_id,
                        created_at: new Date().toISOString(),
                    });
                }
                return;
            }
            state.products = state.products.filter(
                (item) => item.product_id !== action.payload.product_id
            );
        },
        toggleFavouriteAuthor: (
            state,
            action: PayloadAction<{ author_id: string; liked: boolean }>
        ) => {
            if (action.payload.liked) {
                const exists = state.authors.some(
                    (item) => item.author_id === action.payload.author_id
                );
                if (!exists) {
                    state.authors.unshift({
                        author_id: action.payload.author_id,
                        created_at: new Date().toISOString(),
                    });
                }
                return;
            }
            state.authors = state.authors.filter(
                (item) => item.author_id !== action.payload.author_id
            );
        },
        resetFavourites: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFavouriteProducts.pending, (state) => {
                state.productsLoading = true;
            })
            .addCase(fetchFavouriteProducts.fulfilled, (state, action) => {
                state.productsLoading = false;
                state.products = action.payload;
            })
            .addCase(fetchFavouriteProducts.rejected, (state) => {
                state.productsLoading = false;
            })
            .addCase(fetchFavouriteAuthors.pending, (state) => {
                state.authorsLoading = true;
            })
            .addCase(fetchFavouriteAuthors.fulfilled, (state, action) => {
                state.authorsLoading = false;
                state.authors = action.payload;
            })
            .addCase(fetchFavouriteAuthors.rejected, (state) => {
                state.authorsLoading = false;
            });
    },
});

export const {
    setFavouriteProducts,
    setFavouriteAuthors,
    toggleFavouriteProduct,
    toggleFavouriteAuthor,
    resetFavourites,
} = favouriteSlice.actions;
