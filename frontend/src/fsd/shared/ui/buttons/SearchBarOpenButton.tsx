import { Search } from "lucide-react";
import styled from "styled-components";

const SearchBarOpenButtonStyles = styled.button`
    width: var(--search-section-size);
    height: var(--search-section-size);
    padding: 8px;
    border-radius: 9999px;
    border: 1px solid #e5e5e5;
    background-color: var(--header-search-bg);
    color: var(--header-icon-color);
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
        width: 18px;
        height: 18px;
    }

    @media (max-width: 480px) {
        display: flex;
    }
`;

export interface SearchBarOpenButtonProps {
    onClick: () => void;
}

export const SearchBarOpenButton = ({ onClick }: SearchBarOpenButtonProps) => {
    return (
        <SearchBarOpenButtonStyles onClick={onClick} type="button">
            <Search />
        </SearchBarOpenButtonStyles>
    );
};

export default SearchBarOpenButton;
