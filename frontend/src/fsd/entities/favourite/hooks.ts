export { useFavouriteProductsList } from "./hooks/useFavouriteProductsList";
export { useFavouriteAuthorsList } from "./hooks/useFavouriteAuthorsList";

import { useAuthRequired } from "@features/auth-required";
import { toast } from "sonner";

import { toggleFavouriteAuthor, toggleFavouriteProduct } from "../../shared/store/FavouriteSlice";
import { useAppDispatch, useAppSelector } from "../../shared/store/store";
import { favouriteService } from ".";

export const useFavouriteAuthor = (authorId: string) => {
    const dispatch = useAppDispatch();
    const { requireAuth } = useAuthRequired();
    const favourite = useAppSelector((state) => state.favourite);
    const isFavourite = favourite.authors.find((item) => item.author_id === authorId);

    const setFavourite = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        requireAuth(() => {
            dispatch(
                toggleFavouriteAuthor({
                    author_id: authorId,
                    liked: !isFavourite,
                })
            );
            favouriteService
                .toggleFavouriteAuthor({
                    author_id: authorId,
                    liked: !isFavourite,
                })
                .catch((error: Error) => {
                    console.error("Error toggling favourite author", error);
                    toast.error("Не удалось обновить избранное");
                    dispatch(
                        toggleFavouriteAuthor({
                            author_id: authorId,
                            liked: Boolean(isFavourite),
                        })
                    );
                });
        });
    };

    return { isFavourite, setFavourite };
};

export const useFavouriteProduct = (productId: string) => {
    const dispatch = useAppDispatch();
    const { requireAuth } = useAuthRequired();
    const favourite = useAppSelector((state) => state.favourite);
    const isFavourite = favourite.products.find((item) => item.product_id === productId);

    const setFavourite = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        requireAuth(() => {
            dispatch(
                toggleFavouriteProduct({
                    product_id: productId,
                    liked: !isFavourite,
                })
            );
            favouriteService
                .toggleFavouriteProduct({
                    product_id: productId,
                    liked: !isFavourite,
                })
                .catch((error: Error) => {
                    console.error("Error toggling favourite product", error);
                    toast.error("Не удалось обновить избранное");
                    dispatch(
                        toggleFavouriteProduct({
                            product_id: productId,
                            liked: Boolean(isFavourite),
                        })
                    );
                });
        });
    };

    return { isFavourite, setFavourite };
};
