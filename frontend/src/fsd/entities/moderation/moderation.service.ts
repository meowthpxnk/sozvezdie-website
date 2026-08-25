import { axiosWithAuth } from "@shared/api/interceptors";
import type { ModerationStatus } from "@entities/author/seller-product.types";
import { adultQueryParams, appendAdultFields } from "@entities/product/productFormData";
import type {
    BackendOrderStatus,
    IUserOrderResponse,
    OrderLineItem,
} from "@entities/order/order.types";

import {
    type IModeratorOrderDetailApi,
    type IModeratorOrderListItemApi,
    type IModeratorOrdersListApi,
    type ModeratorOrderDetail,
    type ModeratorOrderListItem,
} from "./moderation-orders.types";
import {
    type IModerationEditApiResponse,
    type IModerationProposalApiResponse,
    mapModerationEdit,
    mapModerationProposal,
    type ModerationEdit,
    type ModerationProposal,
} from "./moderation.types";
import {
    type ISellerProductApiResponse,
    mapSellerProduct,
    type SellerProduct,
} from "@entities/author/seller-product.types";

const mapModeratorLineItem = (
    item: IUserOrderResponse["items"][number]
): OrderLineItem => ({
    productId: String(item.product_id),
    name: item.name,
    priceAtTime: item.price_at_time,
    lineTotal: item.line_total,
    image: item.image,
    quantity: item.quantity,
});

const mapModeratorCustomer = (
    customer: IModeratorOrderListItemApi["customer"]
): ModeratorOrderListItem["customer"] => ({
    id: customer.id,
    username: customer.username,
    fullName: customer.full_name,
    email: customer.email,
    phone: customer.phone,
});

const mapModeratorOrderListItem = (
    order: IModeratorOrderListItemApi
): ModeratorOrderListItem => ({
    id: order.id,
    status: order.status,
    paymentMethod: order.payment_method,
    deliveryMethod: order.delivery_method,
    itemsTotal: order.items_total,
    deliveryCost: order.delivery_cost,
    total: order.total,
    createdAt: order.created_at,
    deliveryDate: order.delivery_date,
    deliveryAddressText: order.delivery_address_text,
    deliveryFlat: order.delivery_flat,
    cdekPvzCode: order.cdek_pvz_code,
    cdekPvzAddress: order.cdek_pvz_address,
    customer: mapModeratorCustomer(order.customer),
    itemCount: (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
});

const mapModeratorOrderDetail = (
    order: IModeratorOrderDetailApi
): ModeratorOrderDetail => ({
    ...mapModeratorOrderListItem(order),
    cdekOrderUuid: order.cdek_order_uuid,
    cdekError: order.cdek_error,
    yookassaPaymentId: order.yookassa_payment_id,
    products: (order.items ?? []).map(mapModeratorLineItem),
});

class ModerationService {
    private BASE_URL = "/moderation";

    async getOrders(params?: {
        status?: BackendOrderStatus;
        archive?: boolean;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ items: ModeratorOrderListItem[]; total: number }> {
        const response = await axiosWithAuth.get<IModeratorOrdersListApi>(
            `${this.BASE_URL}/orders`,
            { params }
        );
        return {
            items: response.data.items.map(mapModeratorOrderListItem),
            total: response.data.total,
        };
    }

    async getOrder(orderId: number): Promise<ModeratorOrderDetail> {
        const response = await axiosWithAuth.get<IModeratorOrderDetailApi>(
            `${this.BASE_URL}/orders/${orderId}`
        );
        return mapModeratorOrderDetail(response.data);
    }

    async updateOrderStatus(
        orderId: number,
        status: BackendOrderStatus
    ): Promise<ModeratorOrderDetail> {
        const response = await axiosWithAuth.patch<IModeratorOrderDetailApi>(
            `${this.BASE_URL}/orders/${orderId}/status`,
            { status }
        );
        return mapModeratorOrderDetail(response.data);
    }

    async getProposals(status?: ModerationStatus): Promise<ModerationProposal[]> {
        const response = await axiosWithAuth.get<IModerationProposalApiResponse[]>(
            `${this.BASE_URL}/proposals`,
            {
                params: status ? { status } : undefined,
            }
        );

        return response.data.map(mapModerationProposal);
    }

    async getProposalEdit(proposalId: string): Promise<ModerationEdit> {
        const response = await axiosWithAuth.get<IModerationEditApiResponse>(
            `${this.BASE_URL}/proposals/${proposalId}`
        );

        return mapModerationEdit(response.data);
    }

    async updateProposalProduct(
        proposalId: string,
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
            `${this.BASE_URL}/proposals/${proposalId}/product`,
            formData,
            {
                params: adultQueryParams(data.isAdult),
            }
        );

        return mapSellerProduct(response.data);
    }

    async updateProposalBrand(
        proposalId: string,
        data: {
            name: string;
            desc: string;
            avatarFile: File | null;
            bannerFile: File | null;
            tiktokUrl?: string;
            telegramChannelUrl?: string;
            vkUrl?: string;
        }
    ): Promise<ModerationEdit> {
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

        const response = await axiosWithAuth.put<IModerationEditApiResponse>(
            `${this.BASE_URL}/proposals/${proposalId}/brand`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return mapModerationEdit(response.data);
    }

    async decide(
        proposalId: string,
        data: {
            status: Extract<ModerationStatus, "APPROVED" | "REJECTED">;
            comment?: string;
        }
    ): Promise<ModerationProposal> {
        const response = await axiosWithAuth.post<IModerationProposalApiResponse>(
            `${this.BASE_URL}/proposals/${proposalId}/decide`,
            data
        );

        return mapModerationProposal(response.data);
    }

    async getCatalogProductEdit(productId: string): Promise<ModerationEdit> {
        const response = await axiosWithAuth.get<IModerationEditApiResponse>(
            `${this.BASE_URL}/catalog/products/${productId}`
        );

        return mapModerationEdit(response.data);
    }

    async updateCatalogProduct(
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
            comment?: string;
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
        if (data.comment?.trim()) {
            formData.append("comment", data.comment.trim());
        }

        const response = await axiosWithAuth.put<ISellerProductApiResponse>(
            `${this.BASE_URL}/catalog/products/${productId}`,
            formData,
            {
                params: adultQueryParams(data.isAdult),
            }
        );

        return mapSellerProduct(response.data);
    }

    async getCatalogBrandEdit(sellerCardId: string): Promise<ModerationEdit> {
        const response = await axiosWithAuth.get<IModerationEditApiResponse>(
            `${this.BASE_URL}/catalog/brands/${sellerCardId}`
        );

        return mapModerationEdit(response.data);
    }

    async updateCatalogBrand(
        sellerCardId: string,
        data: {
            name: string;
            desc: string;
            avatarFile: File | null;
            bannerFile: File | null;
            tiktokUrl?: string;
            telegramChannelUrl?: string;
            vkUrl?: string;
            comment?: string;
        }
    ): Promise<ModerationEdit> {
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
        if (data.comment?.trim()) {
            formData.append("comment", data.comment.trim());
        }

        const response = await axiosWithAuth.put<IModerationEditApiResponse>(
            `${this.BASE_URL}/catalog/brands/${sellerCardId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return mapModerationEdit(response.data);
    }

    async deleteCatalogProduct(productId: string, comment?: string): Promise<SellerProduct> {
        const response = await axiosWithAuth.post<ISellerProductApiResponse>(
            `${this.BASE_URL}/catalog/products/${productId}/delete`,
            { comment: comment?.trim() || null }
        );

        return mapSellerProduct(response.data);
    }

    async deleteCatalogBrand(
        sellerCardId: string,
        comment?: string
    ): Promise<{ id: string }> {
        const response = await axiosWithAuth.post<{ id: string }>(
            `${this.BASE_URL}/catalog/brands/${sellerCardId}/delete`,
            { comment: comment?.trim() || null }
        );

        return response.data;
    }
}

export const moderationService = new ModerationService();
