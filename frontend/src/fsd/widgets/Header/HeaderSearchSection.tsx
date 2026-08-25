import { useModalBehavior } from "@shared/hooks/useModalBehavior";
import styled from "styled-components";
import CatalogOpenButton from "@shared/ui/buttons/CatalogOpenButton";
import SearchBarOpenButton from "@shared/ui/buttons/SearchBarOpenButton";
import { SearchBarOverlay, CatalogOverlay, SearchBar } from "@widgets";

const HeaderSearchSectionStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 640px;
    justify-content: center;
`;

export const HeaderSearchSection = () => {
    const {
        isOpen: isCatalogOpen,
        close: closeCatalog,
        open: openCatalog,
    } = useModalBehavior();

    const {
        isOpen: isSearchBarOpen,
        close: closeSearchBar,
        open: openSearchBar,
    } = useModalBehavior();

    return (
        <>
            <HeaderSearchSectionStyles>
                <CatalogOpenButton onClick={openCatalog} />
                <SearchBarOpenButton onClick={openSearchBar} />
                <SearchBar />
            </HeaderSearchSectionStyles>
            <CatalogOverlay isCatalogOpen={isCatalogOpen} close={closeCatalog} />
            <SearchBarOverlay isSearchBarOpen={isSearchBarOpen} close={closeSearchBar} />
        </>
    );
};

export default HeaderSearchSection;
