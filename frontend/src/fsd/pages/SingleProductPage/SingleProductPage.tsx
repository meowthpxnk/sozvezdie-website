"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProductInfo } from "./ProductInfo";
import { ImageGallery, ProductCard } from "@widgets";
import { AuthorInfo } from "./AuthorInfo";
import { ProductCartQuantityCounter } from "./ProductCartQuantityCounter";
import { OutOfStockBanner } from "./OutOfStockBanner";
import { ItemList } from "@features";
import { Author } from "@entities";
import { productService } from "../../entities/product";
import { authorService } from "../../entities/author";
import { useFavouriteAuthor } from "../../entities/favourite/hooks";
import { useAuth, useAgeConfirmation } from "../../entities/auth";
import { AgeGateModal } from "@features/age-gate";
import { canAccessModeration } from "@shared/lib/roles";
import { useCartQuantity } from "../../entities/cart/hooks";
import { ModeratorEditButton } from "@features/moderator-edit/ModeratorEditButton";
import { ModeratorProductDeleteAction } from "@features/moderator-edit/ModeratorProductDeleteAction";
import { buildProductCatalogEditHref } from "@features/moderator-edit/moderation-edit-links";

const SIMILAR_PRODUCTS_LIMIT = 20;

const SingleProductPageStyles = styled.div`
    width: 100%;
    max-width: 100%;
    min-width: 0;
`;

const PRODUCT_SPLIT_BP = 660;

const ProductLayout = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 100%;
    min-width: 0;

    @media (min-width: ${PRODUCT_SPLIT_BP}px) {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 20px;
        align-items: start;
    }

    @media (min-width: 960px) {
        gap: 32px;
    }
`;

const GalleryColumn = styled.div`
    min-width: 0;
    width: 100%;
    max-width: 100%;

    @media (min-width: ${PRODUCT_SPLIT_BP}px) {
        width: fit-content;
        max-width: 100%;
        display: flex;
        justify-content: flex-start;
    }
`;

const DetailsHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
`;

const DetailsHeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
`;

const DetailsHeaderMain = styled.div`
    flex: 1;
    min-width: 0;
`;

const DetailsColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    width: 100%;
    max-width: 100%;

    @media (min-width: ${PRODUCT_SPLIT_BP}px) {
        justify-content: flex-start;
        align-items: stretch;
    }

    @media (min-width: 960px) {
        position: sticky;
        top: 96px;
        gap: 20px;
    }
`;

const PurchaseActionsRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
`;

const AuthorLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    min-width: 0;
    width: 100%;
`;

const CartActionsWrap = styled.div`
    width: 100%;
`;

const SimilarSection = styled.section`
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding-top: 8px;

    @media (min-width: 960px) {
        padding-top: 16px;
    }
`;

export interface SingleProductPageProps {
    id: string;
}

export const SingleProductPage = ({ id }: SingleProductPageProps) => {
    const { role } = useAuth();
    const isModerator = canAccessModeration(role);
    const { authReady, ageConfirmed, shouldBlurAdult, confirmAge, saving } =
        useAgeConfirmation();
    const [ageGateOpen, setAgeGateOpen] = useState(false);
    const declinedProductIdRef = useRef<string | null>(null);

    const { data: product } = useQuery({
        queryKey: ["product", id],
        queryFn: () => productService.getProduct(id),
    });

    const { quantity, setQuantity } = useCartQuantity(id, {
        maxStock: product?.stockCount,
    });

    const { data: author } = useQuery({
        queryKey: ["author", product?.authorId],
        queryFn: () => authorService.getAuthor(product!.authorId),
        enabled: !!product?.authorId,
    });

    const { isFavourite, setFavourite } = useFavouriteAuthor(product?.authorId ?? "");

    const { data: similarProducts = [] } = useQuery({
        queryKey: ["product", id, "similar"],
        queryFn: () =>
            productService.getSimilarProducts(id, SIMILAR_PRODUCTS_LIMIT),
        enabled: !!product,
    });

    const similarAuthorIds = useMemo(
        () => [...new Set(similarProducts.map((item) => String(item.authorId)))],
        [similarProducts]
    );

    const { data: similarAuthors } = useQuery({
        queryKey: ["authors-bulk", "similar", id, similarAuthorIds],
        queryFn: () => authorService.getAuthorsBulk(similarAuthorIds),
        enabled: similarAuthorIds.length > 0,
    });

    const similarAuthorsById = useMemo(() => {
        const map = new Map<string, Author>();

        for (const similarAuthor of similarAuthors ?? []) {
            map.set(String(similarAuthor.id), similarAuthor);
        }

        return map;
    }, [similarAuthors]);

    useLayoutEffect(() => {
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
    }, [id]);

    useEffect(() => {
        declinedProductIdRef.current = null;
        setAgeGateOpen(false);
    }, [id]);

    useEffect(() => {
        if (!product?.isAdult) {
            setAgeGateOpen(false);
            return;
        }
        if (!authReady) {
            return;
        }
        if (ageConfirmed) {
            setAgeGateOpen(false);
            return;
        }
        if (declinedProductIdRef.current === product.id) {
            return;
        }
        setAgeGateOpen(true);
    }, [product?.id, product?.isAdult, authReady, ageConfirmed]);

    if (!product || !author) {
        return null;
    }

    const isOutOfStock = product.stockCount <= 0;
    const blurred = shouldBlurAdult(product.isAdult);

    const handleConfirmAge = async () => {
        const confirmed = await confirmAge();
        if (confirmed) {
            declinedProductIdRef.current = null;
            setAgeGateOpen(false);
        }
    };

    const handleDeclineAge = () => {
        declinedProductIdRef.current = product.id;
        setAgeGateOpen(false);
    };

    return (
        <SingleProductPageStyles className="flex-c indent-list int-16">
            <ProductLayout>
                <GalleryColumn>
                    <ImageGallery
                        images={product.images}
                        blurred={blurred}
                        onRestrictedClick={() => {
                            declinedProductIdRef.current = null;
                            setAgeGateOpen(true);
                        }}
                    />
                </GalleryColumn>
                <DetailsColumn>
                    {isOutOfStock ? <OutOfStockBanner /> : null}
                    <DetailsHeader>
                        <DetailsHeaderMain>
                            <ProductInfo
                                price={product.price}
                                stockCount={product.stockCount}
                                name={product.name}
                                description={product.description}
                            />
                        </DetailsHeaderMain>
                        {isModerator ? (
                            <DetailsHeaderActions>
                                <ModeratorEditButton
                                    href={buildProductCatalogEditHref(id)}
                                    label="Редактировать товар"
                                />
                                <ModeratorProductDeleteAction
                                    productId={id}
                                    productName={product.name}
                                />
                            </DetailsHeaderActions>
                        ) : null}
                    </DetailsHeader>
                    <PurchaseActionsRow>
                        <AuthorLink href={`/author/${author.id}`}>
                            <AuthorInfo
                                author={{
                                    id: author.id,
                                    name: author.name,
                                    avatarImage: author.avatarImage,
                                }}
                                isFavourite={isFavourite}
                                setFavourite={setFavourite}
                            />
                        </AuthorLink>
                        <CartActionsWrap>
                            <ProductCartQuantityCounter
                                quantity={quantity}
                                stockCount={product.stockCount}
                                setQuantity={setQuantity}
                            />
                        </CartActionsWrap>
                    </PurchaseActionsRow>
                </DetailsColumn>
            </ProductLayout>
            {similarProducts.length > 0 ? (
                <SimilarSection>
                    <ItemList
                        title="Похожие товары"
                        items={similarProducts}
                        layout="marquee"
                        renderItem={(similarProduct) => (
                            <ProductCard
                                product={similarProduct}
                                author={similarAuthorsById.get(
                                    String(similarProduct.authorId)
                                )}
                            />
                        )}
                    />
                </SimilarSection>
            ) : null}
            <AgeGateModal
                isOpen={ageGateOpen}
                confirming={saving}
                onConfirm={handleConfirmAge}
                onDecline={handleDeclineAge}
            />
        </SingleProductPageStyles>
    );
};
