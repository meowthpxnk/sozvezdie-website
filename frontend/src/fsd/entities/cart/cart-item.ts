export type CartItem = {
    product_id: string;
    quantity: number;
}

export interface ICartItemResponse {
    items: CartItem[];
}
