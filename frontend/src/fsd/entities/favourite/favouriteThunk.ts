import { createAsyncThunk } from "@reduxjs/toolkit";
import favouriteService from "./favourite.service";

export const fetchFavouriteProducts = createAsyncThunk(
    "favourite/fetchFavouriteProducts",
    async (_, thunkAPI) => {
        try {
            const res = await favouriteService.getFavouriteProducts();
            return res.items;
        } catch {
            return thunkAPI.rejectWithValue("Failed to fetch favourite products");
        }
    }
);

export const fetchFavouriteAuthors = createAsyncThunk(
    "favourite/fetchFavouriteAuthors",
    async (_, thunkAPI) => {
        try {
            const res = await favouriteService.getFavouriteAuthors();
            return res.items;
        } catch {
            return thunkAPI.rejectWithValue("Failed to fetch favourite authors");
        }
    }
);
