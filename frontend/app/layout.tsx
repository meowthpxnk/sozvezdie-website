import type { Metadata } from "next";
import { Providers } from "./providers";
import { StyledComponentsRegistry } from "@/src/shared/lib/styled-components-registry";
import { PageShell } from "@widgets";
import "@shared/ui/styles/index.scss";
import { AppInitializer } from "./initializer";
import { SITE_TITLE, SITE_TITLE_SUFFIX } from "@shared/lib/page-metadata";




// import { getAccessToken } from "@shared/services/auth-token.service";
// import { cartSlice } from "@/src/fsd/shared/store/CartSlice";
// import { useData } from "@/src/fsd/shared/hooks/useData";
// import { cartService } from "@/src/fsd/entities/cart";
// // import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/src/fsd/shared/store/store";
// import { setCart } from "@/src/fsd/shared/store/CartSlice";

export const metadata: Metadata = {
    title: {
        default: SITE_TITLE,
        template: `%s | ${SITE_TITLE_SUFFIX}`,
    },
    icons: {
        icon: "/favicon.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const accessToken = getAccessToken();
    // if (accessToken) {
    //     const { objects: cartItems } = useData({
    //         queryFn: () => cartService.getCart(),
    //         queryKey: ["getUser"],
    //     });

    //     const dispatch = useDispatch();
    //     const cart = useSelector((state: RootState) => state.cart);
    //     dispatch(setCart(cartItems || []));
    // }

    return (
        <html lang="en">
            <body>
                <StyledComponentsRegistry>
                    <Providers>
                        <AppInitializer />
                        <PageShell>{children}</PageShell>
                    </Providers>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}
