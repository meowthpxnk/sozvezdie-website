export type ModerationStatus = "pending" | "approved" | "rejected";

export type SellerBrand = {
    id: string;
    sellerId: string;
    brandName: string;
    brandDescription: string;
    avatar: string;
    banner: string;
    updatedAt: string;
};

export type SellerProductImage = {
    id: string;
    url: string;
};

export type SellerProduct = {
    id: string;
    sellerId: string;
    brandId: string;
    name: string;
    description: string;
    price: number;
    stockCount: number;
    images: SellerProductImage[];
    coverImageId: string;
    moderationStatus: ModerationStatus;
    moderationComment?: string;
    updatedAt: string;
};

export type SellerSnapshot = {
    sellerId: string;
    brand: SellerBrand;
    products: SellerProduct[];
};

export type UpdateSellerProductPayload = {
    id: string;
    name: string;
    description: string;
    price: number;
    stockCount: number;
    images: SellerProductImage[];
    coverImageId: string;
};

export type CreateSellerProductPayload = {
    name: string;
    description: string;
    price: number;
    images: SellerProductImage[];
    coverImageId: string;
};

export type UpdateSellerBrandPayload = {
    brandName: string;
    brandDescription: string;
    avatar: string;
    banner: string;
};

