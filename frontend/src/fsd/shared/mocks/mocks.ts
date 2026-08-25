import { AdvertBanner, Author, Product, CartItem } from "@entities";

export const PRODUCT_LIST: Product[] = [
    {
        "id": "1",
        "mainImage": "https://ghostshelf.shop/api/uploads/products/photo1/29f0a7ba-2641-43d0-b277-12a2b41d9742/default.jpg?v=1769862262215",
        "images": [
            "https://ghostshelf.shop/api/uploads/products/photo1/29f0a7ba-2641-43d0-b277-12a2b41d9742/default.jpg?v=1769862262215",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1c",
            "https://ghostshelf.shop/api/uploads/products/photo1/29f0a7ba-2641-43d0-b277-12a2b41d9742/default.jpg?v=1769862262215",
            "https://upload.wikimedia.org/wikipedia/en/0/05/Silksong.jpg",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1c",
            "https://ghostshelf.shop/api/uploads/products/photo1/29f0a7ba-2641-43d0-b277-12a2b41d9742/default.jpg?v=1769862262215",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1c",
            "https://ghostshelf.shop/api/uploads/products/photo1/29f0a7ba-2641-43d0-b277-12a2b41d9742/default.jpg?v=1769862262215",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1c",
            "https://ghostshelf.shop/api/uploads/products/photo1/29f0a7ba-2641-43d0-b277-12a2b41d9742/default.jpg?v=1769862262215",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-1c",

        ],
        "price": 30000,
        "description": "Брелок Крутой872",
        "name": "Брелок Крутой872",
        "authorId": "1",
        "stockCount": 24,
    },
    {
        "id": "2",
        "mainImage": "https://placeholdpicsum.dev/photo/800/800?seed=product-2a",
        "images": [
            "https://placeholdpicsum.dev/photo/800/800?seed=product-2a",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-2b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-2c"
        ],
        "price": 30000,
        "name": "Брелок Крутой872",
        "description": "Брелок Крутой872",
        "authorId": "2",
        "stockCount": 15,
    },
    {
        "id": "3",
        "mainImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPIS_MT5gzSXgWzQQalTiDsxS2VCRIwpkBlQ&s",
        "images": [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPIS_MT5gzSXgWzQQalTiDsxS2VCRIwpkBlQ&s",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-3b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-3c"
        ],
        "price": 30000,
        "description": "Брелок Крутой872",
        "stockCount": 3,
        "name": "Брелок Крутой872",
        "authorId": "3",
    },
    {
        "id": "6",
        "mainImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9YYh5Fk1u9VsWWr1MhkyQeOzeNbtnnMO96g&s",
        "images": [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9YYh5Fk1u9VsWWr1MhkyQeOzeNbtnnMO96g&s",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-6b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-6c",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-6d",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-6e",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-6f",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-6g",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-6h"
        ],
        "price": 30000,
        "description": "Брелок Крутой872",
        "stockCount": 30,
        "name": "Брелок Крутой872",
        "authorId": "2",
    },
    {
        "id": "4",
        "mainImage": "https://preview.redd.it/some-of-my-favourite-bird-images-from-the-last-12-months-v0-xeq2o4k737se1.jpg?width=640&crop=smart&auto=webp&s=20e34f50040ae8a8520d257ec8116d64f095fc02",
        "images": [
            "https://preview.redd.it/some-of-my-favourite-bird-images-from-the-last-12-months-v0-xeq2o4k737se1.jpg?width=640&crop=smart&auto=webp&s=20e34f50040ae8a8520d257ec8116d64f095fc02",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-4b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-4c"
        ],
        "price": 30000,
        "description": "Брелок Крутой872",
        "stockCount": 42,
        "name": "Брелок Крутой872",
        "authorId": "3",
    },
    {
        "id": "5",
        "mainImage": "https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=",
        "images": [
            "https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE="
        ],
        "price": 30000,
        "description": "Брелок Крутой872",
        "stockCount": 8,
        "name": "Брелок Крутой872",
        "authorId": "2",
    },
    {
        "id": "7",
        "mainImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9YYh5Fk1u9VsWWr1MhkyQeOzeNbtnnMO96g&s",
        "images": [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9YYh5Fk1u9VsWWr1MhkyQeOzeNbtnnMO96g&s",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-7b",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-7c",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-7d",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-7e",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-7f",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-7g",
            "https://placeholdpicsum.dev/photo/800/800?seed=product-7h"
        ],
        "price": 30000,
        "description": "Брелок Крутой872",
        "stockCount": 6,
        "name": "Брелок Крутой872",
        "authorId": "3",
    }
]

export const BANNER_LIST: AdvertBanner[] = [
    {
        "id": "banner-1",
        "image": "https://placeholdpicsum.dev/photo/1280/560?seed=banner-1",
        "href": "/products",
        "title": "Весенняя коллекция — скидки до 30%"
    },
    {
        "id": "banner-2",
        "image": "https://placeholdpicsum.dev/photo/1280/560?seed=banner-2",
        "href": "/authors",
        "title": "Новые авторы и свежие работы"
    },
    {
        "id": "banner-3",
        "image": "https://placeholdpicsum.dev/photo/1280/560?seed=banner-3",
        "href": "/favorites",
        "title": "Подборка недели в избранном"
    }
]

export const AUTHOR_LIST: Author[] = [
    {
        "id": "1",
        "name": "KERE",
        "avatarImage": "https://placeholdpicsum.dev/photo/200/200?seed=author-1-avatar",
        "bannerImage": "https://placeholdpicsum.dev/photo/1280/500?seed=author-1-banner",
        "description": "KERE создает яркие аксессуары и небольшие предметы декора, где смешивает графичные формы, смелые цвета и городские мотивы."
    },
    {
        "id": "2",
        "name": "LARGO",
        // "avatarImage": "https://photobooth.cdn.sports.ru/preset/message/b/76/3869ee28a4ac1a100a192d8ba2bfd.png?f=webp&q=90&s=2x&w=730",
        "bannerImage": "https://u.cubeupload.com/KawaiiSocks/674largowallpaper2deskt.jpg",
        "description": "МООООЙ ОСТРОВ В ОКЕАНЕ АНЕ АНЕ АНЕ!"
    },
    {
        "id": "3",
        "name": "KERES",
        "avatarImage": "https://placeholdpicsum.dev/photo/200/200?seed=author-3-avatar",
        "bannerImage": "https://placeholdpicsum.dev/photo/1280/500?seed=author-3-banner",
        "description": "KERES развивает экспериментальное направление бренда: ограниченные серии, необычные материалы и акцент на деталях ручной работы."
    }
]



export const CART_ITEMS: CartItem[] = [
    {
        "product": PRODUCT_LIST[0],
        "quantity": 1
    },
    {
        "product": PRODUCT_LIST[1],
        "quantity": 2
    },
    {
        "product": PRODUCT_LIST[2],
        "quantity": 3
    }
]
