import { axiosWithAuth, axiosClassic } from "@shared/api/interceptors";
import { CartItem, ICartItemResponse } from "./cart-item";

class CartService {
    private BASE_URL = "/cart";

    async updateCartItem(cartItem: CartItem) {
        const response = await axiosWithAuth.put<CartItem>(`${this.BASE_URL}`, cartItem);
        return response.data;
    }
    async getCart() {
        const response = await axiosWithAuth.get<ICartItemResponse>(`${this.BASE_URL}`);
        return response.data;
    }

    async removeCartItems(productIds: string[]) {
        await Promise.all(
            productIds.map((product_id) =>
                this.updateCartItem({ product_id, quantity: 0 })
            )
        );
    }
}

const cartService = new CartService();
export default cartService;
