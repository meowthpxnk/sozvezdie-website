import styled from "styled-components";

const Banner = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    border-radius: 10px;
    background: var(--cart-out-of-stock-bg);
    border: 1px solid #e0e3e8;
    color: var(--cart-stock-warning-color);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
`;

export const OutOfStockBanner = () => {
    return <Banner>Закончился</Banner>;
};
