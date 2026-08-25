import { createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "./cart.service";

export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, thunkAPI) => {
        try {
            const res = await cartService.getCart();
            console.log("res", res);
            return res.items;
        } catch (e) {
            return thunkAPI.rejectWithValue("Failed to fetch cart");
        }
    }
);
