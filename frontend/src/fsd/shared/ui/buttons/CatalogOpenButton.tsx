import { LayoutGrid } from "lucide-react";
import styled from "styled-components";

const CatalogOpenButtonStyles = styled.button<{ $showText?: boolean }>`
    height: var(--search-section-size);
    padding: 8px 12px;
    border-radius: 9999px;
    gap: 6px;
    border: 1px solid #e5e5e5;
    background-color: #fff;
    color: var(--header-icon-color);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    svg {
        width: 18px;
        height: 18px;
    }

    span {
        display: ${({ $showText }) => ($showText ? "inline" : "none")};
        font-size: 13px;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
    }

    &:hover {
        background-color: var(--header-search-bg);
        border-color: #d5d5d5;
    }

    @media (max-width: 640px) {
        span {
            display: none;
        }
    }
`;

export interface CatalogOpenButtonProps {
    onClick: () => void;
}

export const CatalogOpenButton = ({ onClick }: CatalogOpenButtonProps) => {
    return (
        <CatalogOpenButtonStyles onClick={onClick} type="button">
            <LayoutGrid />
            <span>Каталог</span>
        </CatalogOpenButtonStyles>
    );
};

export default CatalogOpenButton;
