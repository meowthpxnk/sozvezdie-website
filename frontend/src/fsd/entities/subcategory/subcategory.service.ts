import { axiosWithAuth } from "@shared/api/interceptors";
import { Subcategory, SubcategoryCreatePayload } from "./subcategory";

class SubcategoryService {
    async createSubcategory(
        categorySlug: string,
        payload: SubcategoryCreatePayload
    ) {
        const response = await axiosWithAuth.post<Subcategory>(
            `/category/${categorySlug}/subcategory`,
            payload
        );
        return response.data;
    }
}

const subcategoryService = new SubcategoryService();
export default subcategoryService;
