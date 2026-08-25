import styled from "styled-components";

import { AdvertBanner, Author, ProductWithAuthor } from "@entities";
import { ItemList } from "@features";
import { AuthorMiniCard, LandingBanner, ProductCard } from "@widgets";

const LandingPageStyles = styled.div`
    width: 100%;
    max-width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 28px;

    @media (min-width: 960px) {
        gap: 40px;
    }
`;

const SectionDivider = styled.hr`
    border: none;
    margin: 0;
    width: 100%;
    height: 0;
    border-top: 1px dashed var(--color-border-secondary, #d7ddea);
`;

export interface LandingPageProps {
    recommendedProductList: ProductWithAuthor[],
    newProductList: ProductWithAuthor[]
    advertBanners?: AdvertBanner[],
    popularAuthors: Author[],
}

export const LandingPage = ({ recommendedProductList, newProductList, advertBanners, popularAuthors, }: LandingPageProps) => {
    return (
        <LandingPageStyles className="flex-c indent-list int-16">
            {advertBanners && advertBanners.length > 0 ? (
                <>
                    <LandingBanner banners={advertBanners} />
                    <SectionDivider />
                </>
            ) : null}
            <ItemList
                title="Новые товары"
                href="/products"
                items={newProductList}
                renderItem={(product) => <ProductCard product={product} author={product.author} />}
                layout="marquee"
            />
            <SectionDivider />
            <ItemList
                title="Популярные товары"
                href="/products"
                items={recommendedProductList}
                renderItem={(product) => <ProductCard product={product} author={product.author} />}
                gridVariant="catalog"
            />
            <SectionDivider />
            <ItemList
                title="Популярные авторы"
                href="/authors"
                items={popularAuthors}
                renderItem={(author) => <AuthorMiniCard author={author} />}
                gridVariant="authors"
            />
        </LandingPageStyles>
    );
}
export default LandingPage
