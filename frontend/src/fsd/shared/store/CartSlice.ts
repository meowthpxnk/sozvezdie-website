import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "../../entities/cart/cart-item";
import { fetchCart } from "../../entities/cart/cartThunk";

export interface ICartStoreState {
    cart: CartItem[];
    selectedIds: string[];
    loading: boolean;
}

const initialState: ICartStoreState = {
    cart: [],
    selectedIds: [],
    loading: false,
};

const pruneSelectedIds = (selectedIds: string[], cart: CartItem[]) => {
    const cartIds = new Set(cart.map((item) => item.product_id));
    return selectedIds.filter((id) => cartIds.has(id));
};

export const cartSlice = createSlice({
    name: "cart",
    initialState: initialState,
    reducers: {
        updateCartItemQuantity: (
            state,
            action: PayloadAction<{ product_id: string; quantity: number }>
        ) => {
            const { product_id, quantity } = action.payload;
            const item = state.cart.find(
                (cartItem) => cartItem.product_id === product_id
            );

            if (!item) {
                if (quantity > 0) {
                    state.cart.push({ product_id, quantity });
                    if (!state.selectedIds.includes(product_id)) {
                        state.selectedIds.push(product_id);
                    }
                }
                return;
            }

            item.quantity = quantity;

            if (quantity === 0) {
                state.cart = state.cart.filter(
                    (cartItem) => cartItem.product_id !== product_id
                );
                state.selectedIds = state.selectedIds.filter(
                    (id) => id !== product_id
                );
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cart = state.cart.filter(
                (item) => item.product_id !== action.payload
            );
            state.selectedIds = state.selectedIds.filter(
                (id) => id !== action.payload
            );
        },
        removeManyFromCart: (state, action: PayloadAction<string[]>) => {
            const ids = new Set(action.payload);
            state.cart = state.cart.filter(
                (item) => !ids.has(item.product_id)
            );
            state.selectedIds = state.selectedIds.filter((id) => !ids.has(id));
        },
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.cart = action.payload;
            state.selectedIds = pruneSelectedIds(state.selectedIds, action.payload);
        },
        toggleCartItemSelected: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            if (state.selectedIds.includes(productId)) {
                state.selectedIds = state.selectedIds.filter(
                    (id) => id !== productId
                );
            } else {
                state.selectedIds.push(productId);
            }
        },
        setCartItemSelected: (
            state,
            action: PayloadAction<{ productId: string; selected: boolean }>
        ) => {
            const { productId, selected } = action.payload;
            const hasId = state.selectedIds.includes(productId);

            if (selected && !hasId) {
                state.selectedIds.push(productId);
            }
            if (!selected && hasId) {
                state.selectedIds = state.selectedIds.filter(
                    (id) => id !== productId
                );
            }
        },
        setAllCartItemsSelected: (
            state,
            action: PayloadAction<{ productIds: string[]; selected: boolean }>
        ) => {
            const { productIds, selected } = action.payload;
            if (!selected) {
                state.selectedIds = [];
                return;
            }

            state.selectedIds = [...new Set(productIds)];
        },
        resetCart: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                state.selectedIds = pruneSelectedIds(
                    state.selectedIds,
                    action.payload
                );
            })
            .addCase(fetchCart.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const {
    removeFromCart,
    removeManyFromCart,
    updateCartItemQuantity,
    setCart,
    toggleCartItemSelected,
    setCartItemSelected,
    setAllCartItemsSelected,
    resetCart,
} = cartSlice.actions;
