import { configureStore } from "@reduxjs/toolkit";
import { cartSlice } from "./CartSlice";
import { favouriteSlice } from "./FavouriteSlice";
import { authSlice } from "./AuthSlice";
import { useDispatch, useSelector } from "react-redux";

const store = configureStore({
    reducer: {
        cart: cartSlice.reducer,
        favourite: favouriteSlice.reducer,
        auth: authSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector as unknown as <T>(
    selector: (state: RootState) => T
) => T;

export default store;
