import type { SellerProduct, SellerSnapshot } from "@/src/shared/types/seller";
import type { AuthorMock, ProductMock } from "./types";

export function sellerProductToStorefront(product: SellerProduct, brandName: string): ProductMock {
    const cover = product.images.find((img) => img.id === product.coverImageId) ?? product.images[0];
    return {
        id: product.id,
        imageSrc: cover?.url,
        images: product.images.map((img) => img.url),
        priceText: `${product.price} ₽`,
        stockCount: product.stockCount,
        nameText: product.name,
        brandText: brandName,
    };
}

/** Товары других брендов из каталога + товары продавца из snapshot (вместо статичного списка «KERE» в JSON) */
export function buildStorefrontProducts(snapshot: SellerSnapshot, catalogProducts: ProductMock[]): ProductMock[] {
    const brandName = snapshot.brand.brandName;
    const nonSellerBrand = catalogProducts.filter((p) => p.brandText !== brandName);
    const sellerProducts = snapshot.products.map((p) => sellerProductToStorefront(p, brandName));
    return [...nonSellerBrand, ...sellerProducts];
}

/** Подмешиваем бренд из snapshot в карточку автора с тем же именем, что и brandName */
export function buildStorefrontAuthors(snapshot: SellerSnapshot, baseAuthors: AuthorMock[]): AuthorMock[] {
    return baseAuthors.map((author) =>
        author.name === snapshot.brand.brandName
            ? {
                  ...author,
                  name: snapshot.brand.brandName,
                  avatarImageSrc: snapshot.brand.avatar,
                  bannerImageSrc: snapshot.brand.banner,
                  description: snapshot.brand.brandDescription,
              }
            : author,
    );
}
