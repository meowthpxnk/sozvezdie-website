import CartPlusButton from "@shared/ui/buttons/CartPlusButton";
import CartMinusButton from "@shared/ui/buttons/CartMinusButton";

import styled from "styled-components";

const CartQtyStyles = styled.div``;

const CartNumberStyles = styled.div`
    min-width: 24px;
    padding: 0 8px;
`

export interface CartQtyProps {
    quantity: number;
    className?: string;
    controlsActive?: boolean;
    canIncrease?: boolean;
    canDecrease?: boolean;
    changeQuantity: (quantity: number) => void;
}

export const CartQty = ({
    quantity,
    className,
    controlsActive = true,
    canIncrease = true,
    canDecrease = true,
    changeQuantity,
}: CartQtyProps) => {
    return (
        <CartQtyStyles
            className={`flex-r ai-c stl-mbc stl-fc b-rad-10 ${className ?? ""}`.trim()}
        >
            <CartMinusButton
                active={controlsActive && canDecrease}
                onClick={() => changeQuantity(quantity - 1)}
            />
            <CartNumberStyles className="jc-c ai-c flex">
                <span>{quantity}</span>
            </CartNumberStyles>
            <CartPlusButton
                active={controlsActive && canIncrease}
                onClick={() => changeQuantity(quantity + 1)}
            />
        </CartQtyStyles>
    );
};
export default CartQty
