import { useCallback } from "react";

import {
    setCartItemSelected,
    toggleCartItemSelected,
} from "../../../shared/store/CartSlice";
import { RootState, useAppDispatch, useAppSelector } from "../../../shared/store/store";

export const useCartSelection = (productId: string) => {
    const dispatch = useAppDispatch();
    const isSelected = useAppSelector((state: RootState) =>
        state.cart.selectedIds.includes(productId)
    );

    const toggleSelected = useCallback(() => {
        dispatch(toggleCartItemSelected(productId));
    }, [dispatch, productId]);

    const setSelected = useCallback(
        (selected: boolean) => {
            dispatch(setCartItemSelected({ productId, selected }));
        },
        [dispatch, productId]
    );

    return { isSelected, toggleSelected, setSelected };
};

export const useCartSelectedIds = () => {
    return useAppSelector((state: RootState) => state.cart.selectedIds);
};
