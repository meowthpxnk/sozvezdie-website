import CartMinusButton from "@/src/fsd/shared/ui/buttons/CartMinusButton";
import CartPlusButton from "@/src/fsd/shared/ui/buttons/CartPlusButton";
import { ShoppingCart } from "lucide-react";
import styled from "styled-components";

const ProductCartQuantityCounterStyles = styled.div<{ $hasCounter: boolean }>`
    gap: ${({ $hasCounter }) => ($hasCounter ? "10px" : "0")};
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 52px;
`;

export interface ProductCartQuantityCounterProps {
    quantity: number;
    stockCount: number;
    setQuantity: (quantity: number) => void;
}

const AddToCartButton = styled.button<{ $active: boolean; $disabled: boolean }>`
    padding: 0 16px;
    height: 52px;
    flex: 1;
    min-width: 0;

    background: ${({ $active, $disabled }) =>
        $disabled
            ? "var(--main-color-disabled)"
            : $active
              ? "var(--product-cart-in-cart-bg)"
              : "var(--product-cart-add-bg)"};
    color: var(--color);
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    opacity: ${({ $disabled }) => ($disabled ? 0.85 : 1)};
`;

const CounterWrapper = styled.div<{ $visible: boolean }>`
    width: ${({ $visible }) => ($visible ? "156px" : "0")};
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    flex-shrink: 0;
    overflow: hidden;
    transition: width 0.25s ease, opacity 0.25s ease;
    pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
`;

const CartNumberStyles = styled.div`
    min-width: 24px;
    padding: 0 8px;
    --size: 52px;
`;

export const ProductCartQuantityCounter = ({
    quantity,
    stockCount,
    setQuantity,
}: ProductCartQuantityCounterProps) => {
    const isOutOfStock = stockCount <= 0;
    const inCart = quantity > 0;
    const canIncrease = !isOutOfStock && quantity < stockCount;

    const handleToggleCart = () => {
        if (isOutOfStock) {
            return;
        }
        if (quantity === 0) {
            setQuantity(1);
        } else {
            setQuantity(0);
        }
    };

    return (
        <ProductCartQuantityCounterStyles
            className="flex-r ai-c"
            $hasCounter={inCart && !isOutOfStock}
        >
            <AddToCartButton
                $active={inCart}
                $disabled={isOutOfStock}
                type="button"
                disabled={isOutOfStock}
                onClick={handleToggleCart}
                aria-label={
                    isOutOfStock
                        ? "Товар закончился"
                        : "Добавить или удалить товар из корзины"
                }
                className="b-rad-10 flex-r ai-c jc-c int-8 fill-w h-52 fs-14 fw-600 ws-nw"
            >
                <span className="size-16">
                    <ShoppingCart stroke="#fff" strokeWidth={2} />
                </span>
                {isOutOfStock ? "Нет в наличии" : inCart ? "В корзине" : "В корзину"}
            </AddToCartButton>
            <CounterWrapper $visible={inCart && !isOutOfStock} aria-hidden={!inCart}>
                <div className="h-52 flex-r ai-c stl-mbc stl-fc b-rad-10">
                    <CartMinusButton
                        size={52}
                        padding={12}
                        active={quantity > 0}
                        onClick={() => setQuantity(quantity - 1)}
                    />
                    <CartNumberStyles className="jc-c ai-c flex size-box">
                        <span>{quantity}</span>
                    </CartNumberStyles>
                    <CartPlusButton
                        size={52}
                        padding={12}
                        active={canIncrease}
                        onClick={() => setQuantity(quantity + 1)}
                    />
                </div>
            </CounterWrapper>
        </ProductCartQuantityCounterStyles>
    );
};
