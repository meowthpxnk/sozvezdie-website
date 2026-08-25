import { axiosWithAuth, axiosClassic } from "@shared/api/interceptors";
import { Product, ProductFacets, ProductsPageResult } from "../product";
import { SortType } from "@shared/model/sortType";
import { adultQueryParams, appendAdultFields } from "./productFormData";

const PRODUCTS_PAGE_SIZE = 20;

type ProductApi = Product & { is_adult?: boolean };

function mapProduct(data: ProductApi): Product {
    return {
        ...data,
        isAdult: Boolean(data.isAdult ?? data.is_adult),
    };
}

class ProductService {
    private BASE_URL = "/product";

    async getProductsPage(filters?: {
        categorySlug?: string | null;
        subcategorySlug?: string | null;
        fandomSlug?: string | null;
        afterId?: string | null;
        limit?: number;
        sort?: SortType;
        startsWith?: string | null;
    }) {
        const params: Record<string, string> = {
            limit: String(filters?.limit ?? PRODUCTS_PAGE_SIZE),
        };

        if (filters?.categorySlug) {
            params.category_slug = filters.categorySlug;
        }
        if (filters?.subcategorySlug) {
            params.subcategory_slug = filters.subcategorySlug;
        }
        if (filters?.fandomSlug) {
            params.fandom_slug = filters.fandomSlug;
        }
        if (filters?.afterId) {
            params.after_id = filters.afterId;
        }
        if (filters?.sort) {
            params.sort = filters.sort;
        }
        if (filters?.startsWith) {
            params.starts_with = filters.startsWith;
        }

        const response = await axiosClassic.get<ProductsPageResult>(
            `${this.BASE_URL}`,
            { params }
        );
        return {
            ...response.data,
            items: response.data.items.map(mapProduct),
        };
    }

    async getProduct(id: string) {
        const response = await axiosClassic.get<ProductApi>(`${this.BASE_URL}/${id}`);
        return mapProduct(response.data);
    }

    async getSimilarProducts(id: string, limit = 20) {
        const response = await axiosClassic.get<ProductApi[]>(
            `${this.BASE_URL}/${id}/similar`,
            { params: { limit: String(limit) } }
        );
        return response.data.map(mapProduct);
    }

    async getCategoryFacets(fandomSlug?: string | null) {
        const params: Record<string, string> = {};
        if (fandomSlug) {
            params.fandom_slug = fandomSlug;
        }

        const response = await axiosClassic.get<ProductFacets>(
            `${this.BASE_URL}/facets/categories`,
            { params: Object.keys(params).length > 0 ? params : undefined }
        );
        return response.data;
    }

    async getSubcategoryFacets(
        categorySlug: string,
        fandomSlug?: string | null
    ) {
        const params: Record<string, string> = {
            category_slug: categorySlug,
        };
        if (fandomSlug) {
            params.fandom_slug = fandomSlug;
        }

        const response = await axiosClassic.get<ProductFacets>(
            `${this.BASE_URL}/facets/subcategories`,
            { params }
        );
        return response.data;
    }

    async getFandomFacets(filters?: {
        categorySlug?: string | null;
        subcategorySlug?: string | null;
    }) {
        const params: Record<string, string> = {};
        if (filters?.categorySlug) {
            params.category_slug = filters.categorySlug;
        }
        if (filters?.subcategorySlug) {
            params.subcategory_slug = filters.subcategorySlug;
        }

        const response = await axiosClassic.get<ProductFacets>(
            `${this.BASE_URL}/facets/fandoms`,
            { params: Object.keys(params).length > 0 ? params : undefined }
        );
        return response.data;
    }

    async getProductsBulk(ids: string[]) {
        if (!ids.length) {
            return [];
        }

        const response = await axiosClassic.get<Product[]>(
            `${this.BASE_URL}/bulk`,
            {
                params: { ids: ids.join(",") },
            }
        );
        return response.data;
    }

    async createProduct(data: {
        name: string;
        desc: string;
        price: number;
        quantity: number;
        files: File[];
        categorySlug?: string;
        subcategorySlug?: string;
        fandomSlug?: string;
        isAdult?: boolean;
    }) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("desc", data.desc);
        formData.append("price", String(data.price));
        formData.append("quantity", String(data.quantity));
        appendAdultFields(formData, data.isAdult);

        for (const file of data.files) {
            formData.append("files", file);
        }

        if (data.categorySlug) {
            formData.append("category_slug", data.categorySlug);
        }
        if (data.subcategorySlug) {
            formData.append("subcategory_slug", data.subcategorySlug);
        }
        if (data.fandomSlug) {
            formData.append("fandom_slug", data.fandomSlug);
        }

        await axiosWithAuth.post(`${this.BASE_URL}`, formData, {
            params: adultQueryParams(data.isAdult),
        });
    }


    // async deleteDevice(device_name: TypeDeviceName) {
    //     await axiosWithAuth.delete(`${this.BASE_URL}/${device_name}`);
    // }

    // async updateDevcie(data: IDeviceProps) {
    //     await axiosWithAuth.put(`${this.BASE_URL}/${data.name}`, data);
    // }

    // async createDevice(device: IDevice) {
    //     await axiosWithAuth.post(`${this.BASE_URL}/create`, device);
    // }

    // async reloadDevice(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/reload`);
    // }

    // async stopDevice(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/stop`);
    // }

    // async startDevice(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/start`);
    // }

    // async removeAuth(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(
    //         `${this.BASE_URL}/${device_name}/remove_auth`
    //     );
    // }

    // async clearOutbox(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(
    //         `${this.BASE_URL}/${device_name}/clear_outbox`
    //     );
    // }

    // async updateProxy(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/proxy`);
    // }
}

const productService = new ProductService();
export default productService;
