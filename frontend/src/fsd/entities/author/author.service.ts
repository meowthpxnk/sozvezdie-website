import { axiosWithAuth, axiosClassic } from "@shared/api/interceptors";
import { adultQueryParams, appendAdultFields } from "@entities/product/productFormData";
import { Author } from "./author";
import type { ModerationStatus } from "./seller-product.types";

type IAuthorApiResponse = {
    id: string;
    name: string;
    desc: string;
    bannerImage: string | null;
    avatarImage: string | null;
    tiktokUrl?: string | null;
    telegramChannelUrl?: string | null;
    vkUrl?: string | null;
    moderationStatus?: ModerationStatus;
};

function mapAuthorFromApi(data: IAuthorApiResponse): Author {
    return {
        id: data.id,
        name: data.name,
        description: data.desc,
        bannerImage: data.bannerImage ?? undefined,
        avatarImage: data.avatarImage ?? undefined,
        tiktokUrl: data.tiktokUrl ?? undefined,
        telegramChannelUrl: data.telegramChannelUrl ?? undefined,
        vkUrl: data.vkUrl ?? undefined,
        moderationStatus: data.moderationStatus,
    };
}
import {
    type AuthorDashboard,
    type IAuthorDashboardApiResponse,
    mapAuthorDashboard,
} from "./author-dashboard.types";
import {
    type ISellerProductApiResponse,
    mapSellerProduct,
    type SellerProduct,
} from "./seller-product.types";
import { Product } from "../product";

class AuthorService {
    private BASE_URL = "/author";
    private AUTHORS_URL = "/authors";

    async getAuthors() {
        const response = await axiosClassic.get<IAuthorApiResponse[]>(`${this.BASE_URL}`);
        return response.data.map(mapAuthorFromApi);
    }

    async getPopularAuthors() {
        const response = await axiosClassic.get<IAuthorApiResponse[]>(this.AUTHORS_URL, {
            params: { popular: true },
        });
        return response.data.map(mapAuthorFromApi);
    }

    async getAuthor(id: string) {
        const response = await axiosClassic.get<IAuthorApiResponse>(`${this.BASE_URL}/${id}`);
        return mapAuthorFromApi(response.data);
    }

    async getAuthorsBulk(ids: string[]) {
        if (!ids.length) {
            return [];
        }

        const response = await axiosClassic.get<IAuthorApiResponse[]>(`${this.BASE_URL}/bulk`, {
            params: { ids: ids.join(",") },
        });
        return response.data.map(mapAuthorFromApi);
    }

    async getProductsByAuthor(authorId: string) {
        const response = await axiosClassic.get<Product[]>(`${this.BASE_URL}/${authorId}/products`);
        return response.data;
    }

    async getMyDashboard(): Promise<AuthorDashboard> {
        const response = await axiosWithAuth.get<IAuthorDashboardApiResponse>(
            `${this.BASE_URL}/me`
        );
        return mapAuthorDashboard(response.data);
    }

    async getMyProducts(includeDeleted = false): Promise<SellerProduct[]> {
        const response = await axiosWithAuth.get<ISellerProductApiResponse[]>(
            `${this.BASE_URL}/me/products`,
            {
                params: includeDeleted ? { include_deleted: true } : undefined,
            }
        );
        return response.data.map(mapSellerProduct);
    }

    async getMyProduct(productId: string): Promise<SellerProduct> {
        const response = await axiosWithAuth.get<ISellerProductApiResponse>(
            `${this.BASE_URL}/me/products/${productId}`
        );
        return mapSellerProduct(response.data);
    }

    async updateMyProduct(
        productId: string,
        data: {
            name: string;
            desc: string;
            price: number;
            quantity: number;
            imageSlots: Array<{ type: "existing"; uuid: string } | { type: "new" }>;
            files: File[];
            categorySlug?: string;
            subcategorySlug?: string;
            fandomSlug?: string;
            isAdult?: boolean;
        }
    ): Promise<SellerProduct> {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("desc", data.desc);
        formData.append("price", String(data.price));
        formData.append("quantity", String(data.quantity));
        formData.append("image_slots", JSON.stringify(data.imageSlots));
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

        const response = await axiosWithAuth.put<ISellerProductApiResponse>(
            `${this.BASE_URL}/me/products/${productId}`,
            formData,
            {
                params: adultQueryParams(data.isAdult),
            }
        );

        return mapSellerProduct(response.data);
    }

    async createSellerCard(data: {
        name: string;
        desc: string;
        avatarFile: File;
        bannerFile: File;
        tiktokUrl?: string;
        telegramChannelUrl?: string;
        vkUrl?: string;
    }) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("desc", data.desc);
        formData.append("avatar_image", data.avatarFile);
        formData.append("banner_image", data.bannerFile);
        formData.append("tiktok_url", data.tiktokUrl?.trim() ?? "");
        formData.append("telegram_channel_url", data.telegramChannelUrl?.trim() ?? "");
        formData.append("vk_url", data.vkUrl?.trim() ?? "");

        const response = await axiosWithAuth.post<IAuthorApiResponse>(`${this.BASE_URL}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return mapAuthorFromApi(response.data);
    }

    async updateSellerCard(data: {
        name: string;
        desc: string;
        avatarFile?: File | null;
        bannerFile?: File | null;
        tiktokUrl?: string;
        telegramChannelUrl?: string;
        vkUrl?: string;
    }) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("desc", data.desc);
        formData.append("tiktok_url", data.tiktokUrl?.trim() ?? "");
        formData.append("telegram_channel_url", data.telegramChannelUrl?.trim() ?? "");
        formData.append("vk_url", data.vkUrl?.trim() ?? "");
        if (data.avatarFile) {
            formData.append("avatar_image", data.avatarFile);
        }
        if (data.bannerFile) {
            formData.append("banner_image", data.bannerFile);
        }

        const response = await axiosWithAuth.put<IAuthorApiResponse>(`${this.BASE_URL}/me`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return mapAuthorFromApi(response.data);
    }

    async getMyBrandModerations() {
        const response = await axiosWithAuth.get<
            Array<{
                id: string;
                createdAt: string;
                actionType: string;
                status: import("./seller-product.types").ModerationStatus;
                title: string;
                details: string[];
                moderatorComment?: string | null;
            }>
        >(`${this.BASE_URL}/me/brand-moderations`);

        return response.data;
    }

    async cancelProductModerationRequest(productId: string): Promise<void> {
        await axiosWithAuth.delete(
            `${this.BASE_URL}/me/products/${productId}/moderation-request`
        );
    }

    async requestProductDeletion(productId: string, reason?: string): Promise<SellerProduct> {
        const response = await axiosWithAuth.post<ISellerProductApiResponse>(
            `${this.BASE_URL}/me/products/${productId}/deletion-request`,
            { reason: reason?.trim() || null }
        );
        return mapSellerProduct(response.data);
    }

    async cancelProductDeletionRequest(productId: string): Promise<SellerProduct> {
        const response = await axiosWithAuth.delete<ISellerProductApiResponse>(
            `${this.BASE_URL}/me/products/${productId}/deletion-request`
        );
        return mapSellerProduct(response.data);
    }

    async cancelBrandModerationRequest(moderationId: string): Promise<void> {
        await axiosWithAuth.delete(
            `${this.BASE_URL}/me/brand-moderations/${moderationId}`
        );
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

const authorService = new AuthorService();
export default authorService;
