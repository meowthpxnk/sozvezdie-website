export type ProductMock = {
    id: string;
    imageSrc?: string;
    imageAlt?: string;
    images?: string[];
    priceText: string;
    stockCount: number;
    nameText: string;
    brandText: string;
    favourite?: boolean;
};

export type AuthorMock = {
    id: string;
    name: string;
    avatarImageSrc: string;
    bannerImageSrc: string;
    description: string;
};

export type BannerMock = {
    id: string;
    imageSrc: string;
    imageAlt: string;
    href: string;
    titleText: string;
};
