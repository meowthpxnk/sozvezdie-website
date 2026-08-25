"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/src/fsd/shared/store/store";
// import { fetchCart } from "@/entities/cart/model/cartThunks";
import { getAccessToken } from "@shared/services/auth-token.service";
import { fetchMe } from "@/src/fsd/entities/auth/authThunk";
import { beginSessionCheck } from "@/src/fsd/shared/store/AuthSlice";
import { fetchCart } from "@/src/fsd/entities/cart/cartThunk";
import {
    fetchFavouriteAuthors,
    fetchFavouriteProducts,
} from "@/src/fsd/entities/favourite/favouriteThunk";
import { PendingPaymentSyncRunner } from "@/src/fsd/entities/order/PendingPaymentSyncRunner";


export const AppInitializer = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = getAccessToken();

        if (token) {
            dispatch(beginSessionCheck());
            dispatch(fetchMe());
            dispatch(fetchCart());
            dispatch(fetchFavouriteProducts());
            dispatch(fetchFavouriteAuthors());
        }
    }, [dispatch]);

    return <PendingPaymentSyncRunner />;
};
