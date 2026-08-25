export type {
    FavouriteProductToggle,
    FavouriteAuthorToggle,
    FavouriteProductItem,
    FavouriteAuthorItem,
    IFavouriteProductsResponse,
    IFavouriteAuthorsResponse,
} from "./favourite-item";
export { default as favouriteService } from "./favourite.service";
export { fetchFavouriteProducts, fetchFavouriteAuthors } from "./favouriteThunk";
export {
    useFavouriteProduct,
    useFavouriteAuthor,
    useFavouriteProductsList,
    useFavouriteAuthorsList,
} from "./hooks";
