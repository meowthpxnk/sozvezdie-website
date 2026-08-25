"use client";

import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ProductLikeButton } from "@shared/ui/buttons";
import { AdultBlurredMedia } from "@shared/ui/AdultBlurredMedia";
import { Author, Product } from "@entities";
import { priceFormatter, truncateText } from "@shared/formatters";
import { captureNavigationReturnPath } from "@shared/lib/product-return";
import { useFavouriteProduct } from "../entities/favourite/hooks";
import { useAgeConfirmation } from "@entities/auth";
import { MEDIA_URL } from "../shared/api/interceptors";

const PRODUCT_NAME_MAX_LENGTH = 18;

const ProductCardStyles = styled.article`
    background-color: var(--product-card-bg);
    color: var(--color-text-primary);
    text-decoration: none;
    box-shadow: var(--product-card-shadow);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    cursor: pointer;

    &:hover {
        box-shadow: var(--product-card-shadow-hover);
        transform: translateY(-2px);
    }
`;

const ProductName = styled.h4`
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
`;

export interface ProductCardProps {
    product: Product,
    author?: Author,
}


export const ProductCard = ({ product, author }: ProductCardProps) => {
    const router = useRouter();
    const { isFavourite, setFavourite } = useFavouriteProduct(product.id);
    const { shouldBlurAdult } = useAgeConfirmation();
    const blurred = shouldBlurAdult(product.isAdult);

    const openProduct = () => {
        captureNavigationReturnPath();
        router.push(`/product/${product.id}`);
    };

    return (
        <ProductCardStyles
            className="b-rad-14 flex-c indent-box int-10"
            role="link"
            tabIndex={0}
            onClick={openProduct}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openProduct();
                }
            }}
        >
            <div className="image-box b-rad-10">
                <AdultBlurredMedia blurred={blurred}>
                    <img src={`${MEDIA_URL}/images-bucket/${product.images[0]}`} alt={product.name} />
                </AdultBlurredMedia>
            </div>
            <div className="flex-c">
                <div className="flex-r jc-sb ai-c">
                    <h2 className="mcf">{priceFormatter(product.price)}</h2>
                    <ProductLikeButton
                        active={isFavourite ? true : false}
                        onClick={(event) => {
                            event.stopPropagation();
                            setFavourite(event);
                        }}
                    />
                </div>
                <div>
                    <ProductName title={product.name}>
                        {truncateText(product.name, PRODUCT_NAME_MAX_LENGTH)}
                    </ProductName>
                </div>
                {author ? (
                    <div onClick={(event) => event.stopPropagation()}>
                        <Link href={`/author/${author.id}`}>
                            <h5 className="span-link">{author.name}</h5>
                        </Link>
                    </div>
                ) : null}
            </div>
        </ProductCardStyles>
    )
}
export default ProductCard
