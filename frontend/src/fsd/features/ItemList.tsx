import Link from "next/link";
import styled from "styled-components";
import { MarqueListLayout } from "@widgets";

const ItemListStyles = styled.div`
    width: 100%;
    max-width: 100%;
    min-width: 0;

    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.25;
    }

    @media (min-width: 960px) {
        h2 {
            font-size: 24px;
        }
    }
`;

type layoutType = "grid" | "marquee";
type GridVariant = "default" | "catalog" | "authors";

export interface ItemListProps<T extends { id: string }> {
    title: string;
    href?: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    children?: React.ReactNode;
    layout?: layoutType;
    gridVariant?: GridVariant;
}

const ShowAllLink = styled(Link)`
    color: var(--item-list-link-color);

    &:hover,
    &:focus-visible {
        text-decoration: underline;
    }
`;

const ListItems = styled.ul<{ $variant?: GridVariant }>`
    display: grid;
    gap: 20px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    /* Запас внутри сетки — box-shadow карточек не обрезается */
    padding: 6px 4px 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > li {
        min-width: 0;
        overflow: visible;
        padding: 2px;
        box-sizing: border-box;
    }

    ${({ $variant }) =>
        ($variant === "default" || $variant === "catalog") &&
        `
        @media (min-width: 640px) {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        @media (min-width: 960px) {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 24px;
        }

        @media (min-width: 1200px) {
            grid-template-columns: repeat(5, minmax(0, 1fr));
        }
    `}

    ${({ $variant }) =>
        $variant === "authors" &&
        `
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;

        @media (min-width: 640px) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
        }

        @media (min-width: 960px) {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
        }

        @media (min-width: 1200px) {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    `}
`;

export const ItemList = <T extends { id: string }>({
    title,
    href,
    items,
    renderItem,
    layout = "grid",
    gridVariant = "default",
    children,
}: ItemListProps<T>) => {
    const itemsList = items.map((item) => (
        <li key={item.id}>
            {renderItem(item)}
        </li>
    ));

    const listContent =
        layout === "marquee" ? (
            <MarqueListLayout>{itemsList}</MarqueListLayout>
        ) : (
            <ListItems $variant={gridVariant}>{itemsList}</ListItems>
        );

    return (
        <ItemListStyles className="indent-list int-16 flex-c">
            <div className="flex-r jc-sb ai-c">
                <h2>{title}</h2>
                {href ? <ShowAllLink href={href}>Показать все</ShowAllLink> : null}
            </div>
            {children}
            {listContent}
        </ItemListStyles>
    );
};
