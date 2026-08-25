import { fetchMe } from "../../entities/auth/authThunk";
import { fetchCart } from "../../entities/cart/cartThunk";
import {
    fetchFavouriteAuthors,
    fetchFavouriteProducts,
} from "../../entities/favourite/favouriteThunk";
import { clearPendingCheckoutId } from "../../entities/order/pendingCheckoutStorage";
import { beginSessionCheck, logout } from "./AuthSlice";
import { resetCart } from "./CartSlice";
import { resetFavourites } from "./FavouriteSlice";
import type { AppDispatch } from "./store";

export function clearClientData(dispatch: AppDispatch) {
    dispatch(resetCart());
    dispatch(resetFavourites());
    clearPendingCheckoutId();
}

export function clearStoreOnLogout(dispatch: AppDispatch) {
    clearClientData(dispatch);
    dispatch(logout());
}

export async function restoreSessionAfterAuth(dispatch: AppDispatch) {
    clearClientData(dispatch);
    dispatch(beginSessionCheck());
    await dispatch(fetchMe());
    void dispatch(fetchCart());
    void dispatch(fetchFavouriteProducts());
    void dispatch(fetchFavouriteAuthors());
}
