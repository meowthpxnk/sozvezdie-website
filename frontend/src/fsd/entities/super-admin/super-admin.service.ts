import { axiosWithAuth } from "@shared/api/interceptors";
import type { AdvertBanner } from "@entities/advert-banner/advert-banner";
import type { Category } from "@entities/category/category";
import type { Fandom } from "@entities/fandom/fandom";
import {
    type FaqItem,
    type FaqItemApiResponse,
    type FaqItemPayload,
    mapFaqItem,
} from "@entities/faq/faq.types";
import type { Subcategory } from "@entities/subcategory/subcategory";

import {
    type AssignableUserRole,
    type ISuperAdminUserApiResponse,
    mapSuperAdminUser,
    type SuperAdminUser,
} from "./super-admin.types";

class SuperAdminService {
    private BASE_URL = "/super-admin";

    async getUsers(search?: string): Promise<SuperAdminUser[]> {
        const response = await axiosWithAuth.get<ISuperAdminUserApiResponse[]>(
            `${this.BASE_URL}/users`,
            {
                params: search ? { search } : undefined,
            }
        );

        return response.data.map(mapSuperAdminUser);
    }

    async assignRole(
        userId: number,
        role: AssignableUserRole,
        options?: { oneCAuthorId?: string; deleteFrom1c?: boolean; deleteShop?: boolean }
    ): Promise<SuperAdminUser> {
        const response = await axiosWithAuth.patch<ISuperAdminUserApiResponse>(
            `${this.BASE_URL}/users/${userId}/role`,
            {
                role,
                one_c_author_id: options?.oneCAuthorId,
                delete_from_1c: options?.deleteFrom1c ?? false,
                delete_shop: options?.deleteShop ?? false,
            }
        );

        return mapSuperAdminUser(response.data);
    }

    async assignOneCAuthorId(userId: number, oneCAuthorId: string): Promise<SuperAdminUser> {
        const response = await axiosWithAuth.patch<ISuperAdminUserApiResponse>(
            `${this.BASE_URL}/users/${userId}/one-c`,
            { one_c_author_id: oneCAuthorId }
        );

        return mapSuperAdminUser(response.data);
    }

    async deleteFrom1c(userId: number): Promise<SuperAdminUser> {
        const response = await axiosWithAuth.delete<ISuperAdminUserApiResponse>(
            `${this.BASE_URL}/users/${userId}/one-c`
        );
        return mapSuperAdminUser(response.data);
    }

    async deleteShop(userId: number): Promise<SuperAdminUser> {
        const response = await axiosWithAuth.delete<ISuperAdminUserApiResponse>(
            `${this.BASE_URL}/users/${userId}/shop`
        );
        return mapSuperAdminUser(response.data);
    }

    async generateOneCAuthor(): Promise<void> {
        await axiosWithAuth.post(`${this.BASE_URL}/one-c/authors`);
    }

    async createAuthorInvite(oneCAuthorId: string): Promise<{ token: string }> {
        const response = await axiosWithAuth.post<{ token: string }>(
            `${this.BASE_URL}/author-invites`,
            { one_c_author_id: oneCAuthorId }
        );
        return response.data;
    }

    async getBanners(): Promise<AdvertBanner[]> {
        const response = await axiosWithAuth.get<AdvertBanner[]>(`${this.BASE_URL}/banners`);
        return response.data;
    }

    async createBanner(data: {
        image: File;
        link: string;
        text: string;
    }): Promise<AdvertBanner> {
        const formData = new FormData();
        formData.append("image", data.image);
        formData.append("link", data.link);
        formData.append("text", data.text);

        const response = await axiosWithAuth.post<AdvertBanner>(
            `${this.BASE_URL}/banners`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    }

    async updateBanner(
        bannerId: number,
        data: {
            link: string;
            text: string;
            image?: File | null;
        }
    ): Promise<AdvertBanner> {
        const formData = new FormData();
        formData.append("link", data.link);
        formData.append("text", data.text);
        if (data.image) {
            formData.append("image", data.image);
        }

        const response = await axiosWithAuth.put<AdvertBanner>(
            `${this.BASE_URL}/banners/${bannerId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    }

    async deleteBanner(bannerId: number): Promise<void> {
        await axiosWithAuth.delete(`${this.BASE_URL}/banners/${bannerId}`);
    }

    async reorderBanners(orderedIds: number[]): Promise<AdvertBanner[]> {
        const response = await axiosWithAuth.put<AdvertBanner[]>(
            `${this.BASE_URL}/banners/reorder`,
            { ordered_ids: orderedIds }
        );

        return response.data;
    }

    async getFaqItems(search?: string): Promise<FaqItem[]> {
        const response = await axiosWithAuth.get<FaqItemApiResponse[]>(
            `${this.BASE_URL}/faq`,
            {
                params: search ? { search } : undefined,
            }
        );

        return response.data.map(mapFaqItem);
    }

    async createFaqItem(data: FaqItemPayload): Promise<FaqItem> {
        const response = await axiosWithAuth.post<FaqItemApiResponse>(
            `${this.BASE_URL}/faq`,
            {
                question: data.question,
                answer: data.answer,
                is_published: data.isPublished,
            }
        );

        return mapFaqItem(response.data);
    }

    async updateFaqItem(itemId: number, data: FaqItemPayload): Promise<FaqItem> {
        const response = await axiosWithAuth.put<FaqItemApiResponse>(
            `${this.BASE_URL}/faq/${itemId}`,
            {
                question: data.question,
                answer: data.answer,
                is_published: data.isPublished,
            }
        );

        return mapFaqItem(response.data);
    }

    async reorderFaqItems(orderedIds: number[]): Promise<FaqItem[]> {
        const response = await axiosWithAuth.put<FaqItemApiResponse[]>(
            `${this.BASE_URL}/faq/reorder`,
            { ordered_ids: orderedIds }
        );

        return response.data.map(mapFaqItem);
    }

    async deleteFaqItem(itemId: number): Promise<void> {
        await axiosWithAuth.delete(`${this.BASE_URL}/faq/${itemId}`);
    }

    async getFandoms(search?: string): Promise<Fandom[]> {
        const response = await axiosWithAuth.get<Fandom[]>(`${this.BASE_URL}/fandoms`, {
            params: search ? { search } : undefined,
        });
        return response.data;
    }

    async createFandom(data: {
        title: string;
        slug: string;
        isApproved?: boolean;
    }): Promise<Fandom> {
        const response = await axiosWithAuth.post<Fandom>(`${this.BASE_URL}/fandoms`, {
            title: data.title,
            slug: data.slug,
            is_approved: data.isApproved ?? true,
        });
        return response.data;
    }

    async updateFandom(
        slug: string,
        data: { title: string; isApproved: boolean }
    ): Promise<Fandom> {
        const response = await axiosWithAuth.put<Fandom>(
            `${this.BASE_URL}/fandoms/${slug}`,
            {
                title: data.title,
                is_approved: data.isApproved,
            }
        );
        return response.data;
    }

    async deleteFandom(slug: string): Promise<void> {
        await axiosWithAuth.delete(`${this.BASE_URL}/fandoms/${slug}`);
    }

    async getCategories(search?: string): Promise<Category[]> {
        const response = await axiosWithAuth.get<Category[]>(
            `${this.BASE_URL}/categories`,
            {
                params: search ? { search } : undefined,
            }
        );
        return response.data;
    }

    async createCategory(data: { title: string; slug: string }): Promise<Category> {
        const response = await axiosWithAuth.post<Category>(
            `${this.BASE_URL}/categories`,
            data
        );
        return response.data;
    }

    async updateCategory(slug: string, data: { title: string }): Promise<Category> {
        const response = await axiosWithAuth.put<Category>(
            `${this.BASE_URL}/categories/${slug}`,
            data
        );
        return response.data;
    }

    async deleteCategory(slug: string): Promise<void> {
        await axiosWithAuth.delete(`${this.BASE_URL}/categories/${slug}`);
    }

    async getSubcategories(params?: {
        search?: string;
        categorySlug?: string;
    }): Promise<Subcategory[]> {
        const response = await axiosWithAuth.get<Subcategory[]>(
            `${this.BASE_URL}/subcategories`,
            {
                params: {
                    search: params?.search || undefined,
                    category_slug: params?.categorySlug || undefined,
                },
            }
        );
        return response.data;
    }

    async createSubcategory(data: {
        title: string;
        slug: string;
        categorySlug: string;
        isApproved?: boolean;
    }): Promise<Subcategory> {
        const response = await axiosWithAuth.post<Subcategory>(
            `${this.BASE_URL}/subcategories`,
            {
                title: data.title,
                slug: data.slug,
                category_slug: data.categorySlug,
                is_approved: data.isApproved ?? true,
            }
        );
        return response.data;
    }

    async updateSubcategory(
        subcategoryId: number,
        data: { title: string; isApproved: boolean }
    ): Promise<Subcategory> {
        const response = await axiosWithAuth.put<Subcategory>(
            `${this.BASE_URL}/subcategories/${subcategoryId}`,
            {
                title: data.title,
                is_approved: data.isApproved,
            }
        );
        return response.data;
    }

    async deleteSubcategory(subcategoryId: number): Promise<void> {
        await axiosWithAuth.delete(`${this.BASE_URL}/subcategories/${subcategoryId}`);
    }
}

export const superAdminService = new SuperAdminService();
