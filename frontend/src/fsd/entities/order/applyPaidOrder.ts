import type { QueryClient } from "@tanstack/react-query";

import type { AppDispatch } from "@shared/store/store";
import { removeManyFromCart } from "@shared/store/CartSlice";
import { fetchCart } from "../cart/cartThunk";

import type { IUserOrderResponse } from "./order.types";
import { clearPendingCheckoutId } from "./pendingCheckoutStorage";

export async function applyPaidOrderToStore(
    order: IUserOrderResponse | { items: { product_id: number }[] },
    dispatch: AppDispatch,
    queryClient: QueryClient
) {
    const productIds = order.items.map((item) => String(item.product_id));
    dispatch(removeManyFromCart(productIds));
    await dispatch(fetchCart());
    await queryClient.invalidateQueries({ queryKey: ["product"] });
    await queryClient.invalidateQueries({ queryKey: ["products-bulk"] });
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    clearPendingCheckoutId();
}
