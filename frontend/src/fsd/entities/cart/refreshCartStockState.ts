import type { QueryClient } from "@tanstack/react-query";

import { productService } from "@entities/product";
import type { AppDispatch } from "@shared/store/store";

import type { CartItem } from "./cart-item";
import { fetchCart } from "./cartThunk";

/** Reload cart and product stock counts without changing cart quantities. */
export async function refreshCartStockState(
    dispatch: AppDispatch,
    queryClient: QueryClient
): Promise<CartItem[]> {
    const items = await dispatch(fetchCart()).unwrap();
    if (items.length === 0) {
        return items;
    }

    const products = await productService.getProductsBulk(
        items.map((item) => item.product_id)
    );
    for (const product of products) {
        queryClient.setQueryData(["product", product.id], product);
    }
    await queryClient.invalidateQueries({ queryKey: ["cart-products"] });

    return items;
}
