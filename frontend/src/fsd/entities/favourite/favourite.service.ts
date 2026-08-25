import { axiosWithAuth } from "@shared/api/interceptors";
import {
    FavouriteAuthorToggle,
    FavouriteProductToggle,
    IFavouriteAuthorsResponse,
    IFavouriteProductsResponse,
} from "./favourite-item";

class FavouriteService {
    private BASE_URL = "/favourite";

    async toggleFavouriteProduct(item: FavouriteProductToggle) {
        const response = await axiosWithAuth.put(
            `${this.BASE_URL}/product`,
            item
        );
        return response.data;
    }

    async getFavouriteProducts() {
        const response = await axiosWithAuth.get<IFavouriteProductsResponse>(
            `${this.BASE_URL}/product`
        );
        return response.data;
    }

    async toggleFavouriteAuthor(item: FavouriteAuthorToggle) {
        const response = await axiosWithAuth.put(
            `${this.BASE_URL}/author`,
            item
        );
        return response.data;
    }

    async getFavouriteAuthors() {
        const response = await axiosWithAuth.get<IFavouriteAuthorsResponse>(
            `${this.BASE_URL}/author`
        );
        return response.data;
    }
}

const favouriteService = new FavouriteService();
export default favouriteService;
