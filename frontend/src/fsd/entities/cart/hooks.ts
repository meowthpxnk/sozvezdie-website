import { toast } from "sonner";

import { useAuthRequired } from "@features/auth-required";

import { cartService } from ".";
import { updateCartItemQuantity } from "../../shared/store/CartSlice";
import { RootState, useAppDispatch, useAppSelector } from "../../shared/store/store";

type UseCartQuantityOptions = {
    maxStock?: number;
};

const clampQuantity = (
    requested: number,
    maxStock: number | undefined
): number | null => {
    if (requested <= 0) {
        return 0;
    }

    if (maxStock === undefined) {
        return requested;
    }

    if (maxStock <= 0) {
        toast.error("Товар закончился");
        return null;
    }

    if (requested > maxStock) {
        toast.error(`В наличии только ${maxStock} шт.`);
        return maxStock;
    }

    return requested;
};

export const useCartQuantity = (
    productId: string,
    options?: UseCartQuantityOptions
) => {
    const dispatch = useAppDispatch();
    const { requireAuth } = useAuthRequired();
    const cart = useAppSelector((state: RootState) => state.cart);
    const quantity =
        cart.cart.find((item) => item.product_id === productId)?.quantity || 0;
    const maxStock = options?.maxStock;

    const setQuantity = (newQuantity: number) => {
        const clamped = clampQuantity(newQuantity, maxStock);
        if (clamped === null || clamped === quantity) {
            return;
        }

        requireAuth(() => {
            const previousQuantity = quantity;
            dispatch(
                updateCartItemQuantity({
                    product_id: productId,
                    quantity: clamped,
                })
            );
            cartService
                .updateCartItem({
                    product_id: productId,
                    quantity: clamped,
                })
                .catch((error: Error) => {
                    console.error("Error updating cart item", error);
                    toast.error("Не удалось обновить корзину");
                    dispatch(
                        updateCartItemQuantity({
                            product_id: productId,
                            quantity: previousQuantity,
                        })
                    );
                });
        });
    };

    return { quantity, setQuantity };
};
