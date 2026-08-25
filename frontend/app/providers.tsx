"use client";

import { PropsWithChildren } from "react";

// import { ReduxProvider } from "@/src/providers/redux-provider";
import { QueryProvider } from "@/src/providers/query-provider";
import { ToastProvider } from "@/src/providers/toast-provider";
import { AuthRequiredProvider } from "@features/auth-required";
import store from "@/src/fsd/shared/store/store";
import { Provider } from "react-redux";

export function Providers({ children }: PropsWithChildren) {
    return (
        <QueryProvider>
            <Provider store={store}>
                <AuthRequiredProvider>{children}</AuthRequiredProvider>
            </Provider>
            <ToastProvider />
        </QueryProvider>
    );
}
