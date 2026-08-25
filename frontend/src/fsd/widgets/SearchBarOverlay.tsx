"use client";

import styled from "styled-components";
import { SearchBar } from "@widgets/SearchBar";

const PAGE_CONTENT_MAX_WIDTH = 1200;

const SearchBarOverlayStyles = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    inset: 0;
    z-index: 1100;
    background: rgba(6, 10, 18, 0.63);
    backdrop-filter: blur(10px);
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
    transition: opacity 0.2s ease;
`;

const SearchPanel = styled.div`
    background: transparent;
    min-height: 100vh;
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;

    @media (min-width: 960px) {
        padding: 24px 32px 32px;
    }
`;

const SearchBarStyles = styled.div`
    width: 100%;
    max-width: ${PAGE_CONTENT_MAX_WIDTH}px;
    height: var(--search-section-size);
`;

export interface SearchBarOverlayProps {
    close: () => void;
    isSearchBarOpen: boolean;
}

export const SearchBarOverlay = ({ isSearchBarOpen, close }: SearchBarOverlayProps) => {
    const handleClose = () => close();

    return (
        <SearchBarOverlayStyles
            $isOpen={isSearchBarOpen}
            onClick={handleClose}
        >
            <SearchPanel onClick={handleClose}>
                <SearchBarStyles onClick={(event) => event.stopPropagation()}>
                    <SearchBar
                        hide={false}
                        autoFocus={isSearchBarOpen}
                        onAfterSubmit={handleClose}
                        onClose={handleClose}
                    />
                </SearchBarStyles>
            </SearchPanel>
        </SearchBarOverlayStyles>
    );
};
export default SearchBarOverlay
