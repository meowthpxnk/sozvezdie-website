export type SortType =
    | "popular"
    | "newest"
    | "oldest"
    | "price-asc"
    | "price-desc";

export const SORT_OPTIONS: { value: SortType; title: string }[] = [
    { value: "popular", title: "По популярности" },
    { value: "newest", title: "Сначала новые" },
    { value: "oldest", title: "Сначала старые" },
    { value: "price-asc", title: "Цена: по возрастанию" },
    { value: "price-desc", title: "Цена: по убыванию" },
];
