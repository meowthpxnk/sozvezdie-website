import { axiosClassic } from "@shared/api/interceptors";
import { Category } from "./category";
import { Subcategory } from "../subcategory/subcategory";

class CategoryService {
    private BASE_URL = "/category";

    async getCategories() {
        const response = await axiosClassic.get<Category[]>(this.BASE_URL);
        return response.data;
    }

    async getCategory(slug: string) {
        const response = await axiosClassic.get<Category>(
            `${this.BASE_URL}/${slug}`
        );
        return response.data;
    }

    async getSubcategories(categorySlug: string) {
        const response = await axiosClassic.get<Subcategory[]>(
            `${this.BASE_URL}/${categorySlug}/subcategory`
        );
        return response.data;
    }
}

const categoryService = new CategoryService();
export default categoryService;
