import { Product } from "@/src/fsd/entities";
import styled from "styled-components";
import { priceFormatter } from "@shared/formatters";
import { FormattedParagraphs } from "@shared/ui/FormattedParagraphs";

const ProductInfoStyles = styled.div`
    width: 100%;
    max-width: 100%;
    min-width: 0;
`;

const ProductDescription = styled(FormattedParagraphs)`
    line-height: 1.5;

    @media (min-width: 960px) {
        font-size: 15px;
    }
`;

const ProductHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ProductName = styled.h1`
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--title-color);
    overflow-wrap: break-word;

    @media (min-width: 960px) {
        font-size: 32px;
    }
`;

const PriceStockRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const ProductPrice = styled.p`
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--main-color, var(--main-color));
`;

const StockLabel = styled.span`
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    color: var(--cart-summary-text-color, #666);

    &[data-out-of-stock="true"] {
        color: var(--cart-stock-warning-color);
    }
`;

export interface ProductInfoProps extends
    Pick<Product, "price" | "stockCount" | "name" | "description"> { }

export const ProductInfo = ({ price, stockCount, name, description }: ProductInfoProps) => {
    const isOutOfStock = stockCount <= 0;

    return (
        <ProductInfoStyles>
            <div className="flex-c indent-list int-10">
                <ProductHeader>
                    <ProductName>{name}</ProductName>
                    <PriceStockRow>
                        <ProductPrice>{priceFormatter(price)}</ProductPrice>
                        <StockLabel data-out-of-stock={isOutOfStock}>
                            {isOutOfStock
                                ? "Нет в наличии"
                                : `В наличии: ${stockCount} шт.`}
                        </StockLabel>
                    </PriceStockRow>
                </ProductHeader>
                <ProductDescription
                    text={description}
                    paragraphClassName="span-not-important"
                />
            </div>
        </ProductInfoStyles>
    );
};
