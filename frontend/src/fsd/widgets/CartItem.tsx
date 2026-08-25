import CartTrashButton from "@shared/ui/buttons/CartTrashButton";
import CartSelectButton from "@shared/ui/buttons/CartSelectButton";
import ProductLikeButton from "@shared/ui/buttons/ProductLikeButton";
import styled, { css } from "styled-components";
import { Product } from "@entities";
import { CartQty } from "@widgets";
import { priceFormatter } from "../shared/formatters";
import { useFavouriteProduct } from "../entities/favourite/hooks";
import { useCartQuantity, useCartSelection } from "../entities/cart/hooks/index";
import Link from "next/link";
import { MEDIA_URL } from "@shared/api/interceptors";
import { AdultBlurredMedia } from "@shared/ui/AdultBlurredMedia";
import { useAgeConfirmation } from "@entities/auth";

const IMAGE_SIZE = "80px";

const CartItemStyles = styled.div<{
    $outOfStock: boolean;
    $selected: boolean;
}>`
    --indentation: 12px;
    display: grid;
    gap: 12px;
    align-items: start;
    padding: var(--indentation);
    border-radius: 10px;
    background-color: ${({ $outOfStock }) =>
        $outOfStock ? "var(--cart-out-of-stock-bg)" : "var(--color-bg-primary)"};
    transition:
        background-color 0.2s ease,
        opacity 0.2s ease,
        box-shadow 0.2s ease;
    opacity: ${({ $selected, $outOfStock }) =>
        !$selected && !$outOfStock ? 0.55 : $outOfStock ? 0.72 : 1};

    @media (min-width: 481px) {
        grid-template-columns: ${IMAGE_SIZE} minmax(0, 1fr) auto;
        grid-template-areas: "image info aside";
    }

    @media (max-width: 480px) {
        grid-template-columns: ${IMAGE_SIZE} minmax(0, 1fr);
        grid-template-areas:
            "image info"
            "bottom bottom";
        gap: 10px;
        --indentation: 10px;

        h2 {
            font-size: 18px;
            line-height: 1.2;
        }

        h3 {
            font-size: 14px;
            line-height: 1.25;
        }

        h5 {
            font-size: 12px;
            line-height: 1.2;
        }
    }

    ${({ $outOfStock }) =>
        $outOfStock &&
        css`
            img {
                filter: grayscale(1);
            }

            h2,
            h3,
            h5,
            a {
                color: var(--cart-out-of-stock-color) !important;
            }
        `}
`;

const ImageWrapper = styled.div`
    grid-area: image;
    --size: ${IMAGE_SIZE};
    position: relative;
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
    flex-shrink: 0;
`;

const SelectButtonWrap = styled.div`
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 2;
`;

const InfoColumn = styled.div`
    grid-area: info;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;

    @media (max-width: 480px) {
        gap: 2px;
    }
`;

const AsideColumn = styled.div`
    grid-area: aside;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    gap: 6px;
    align-self: stretch;

    @media (max-width: 480px) {
        display: none;
    }
`;

const MobilePrice = styled.div`
    display: none;

    @media (max-width: 480px) {
        display: block;
    }
`;

const DesktopPrice = styled.div`
    @media (max-width: 480px) {
        display: none;
    }
`;

const DesktopActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 480px) {
        display: none;
    }
`;

const MobileStockLabel = styled.div`
    @media (min-width: 481px) {
        display: none;
    }
`;

const MobileBottomBar = styled.div`
    grid-area: bottom;
    display: none;

    @media (max-width: 480px) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;

        span {
            font-size: 14px;
        }
    }
`;

const MobileActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const OutOfStockBadge = styled.span`
    display: inline-block;
    margin-top: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--cart-stock-warning-color);

    @media (max-width: 480px) {
        font-size: 11px;
        margin-top: 0;
    }
`;

export interface CartItemProps {
    product: Product;
    quantity: number;
}

export const CartItem = ({ product }: CartItemProps) => {
    const { isFavourite, setFavourite } = useFavouriteProduct(product.id);
    const { quantity, setQuantity } = useCartQuantity(product.id, {
        maxStock: product.stockCount,
    });
    const { isSelected, toggleSelected } = useCartSelection(product.id);
    const { shouldBlurAdult } = useAgeConfirmation();
    const blurred = shouldBlurAdult(product.isAdult);

    const isOutOfStock = product.stockCount <= 0;
    const canIncrease = !isOutOfStock && quantity < product.stockCount;
    const totalPrice = priceFormatter(product.price * quantity);

    const secondaryActions = (
        <>
            <ProductLikeButton active={isFavourite} onClick={setFavourite} />
            <CartTrashButton onClick={() => setQuantity(0)} />
        </>
    );

    const stockLabel = isOutOfStock ? (
        <h5 className="span-not-important">Закончился</h5>
    ) : (
        <h5 className="span-not-important">
            В наличии: {product.stockCount} шт.
        </h5>
    );

    return (
        <CartItemStyles $outOfStock={isOutOfStock} $selected={isSelected && !isOutOfStock}>
            <ImageWrapper className="image-box size-box b-rad-10">
                <AdultBlurredMedia blurred={blurred}>
                    <img
                        src={`${MEDIA_URL}/images-bucket/${product.images[0]}`}
                        alt={product.name}
                    />
                </AdultBlurredMedia>
                {!isOutOfStock ? (
                    <SelectButtonWrap>
                        <CartSelectButton
                            active={isSelected}
                            onClick={(event) => {
                                event.preventDefault();
                                toggleSelected();
                            }}
                        />
                    </SelectButtonWrap>
                ) : null}
            </ImageWrapper>

            <InfoColumn>
                <MobilePrice className="stl-mc">
                    <h2>{totalPrice}</h2>
                </MobilePrice>
                <Link href={`/product/${product.id}`}>
                    <h3>{product.name}</h3>
                </Link>
                {isOutOfStock ? (
                    <OutOfStockBadge>Нет в наличии</OutOfStockBadge>
                ) : null}
                <DesktopActions>{secondaryActions}</DesktopActions>
                <MobileStockLabel>{stockLabel}</MobileStockLabel>
            </InfoColumn>

            <AsideColumn>
                <DesktopPrice className="stl-mc">
                    <h2>{totalPrice}</h2>
                </DesktopPrice>
                {stockLabel}
                <CartQty
                    quantity={quantity}
                    changeQuantity={setQuantity}
                    canIncrease={canIncrease}
                />
            </AsideColumn>

            <MobileBottomBar>
                <MobileActions>{secondaryActions}</MobileActions>
                <CartQty
                    quantity={quantity}
                    changeQuantity={setQuantity}
                    canIncrease={canIncrease}
                />
            </MobileBottomBar>
        </CartItemStyles>
    );
};

export default CartItem;
