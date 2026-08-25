"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@shared/store/store";
import { fetchCart } from "../cart/cartThunk";

import { applyPaidOrderToStore } from "./applyPaidOrder";
import orderService from "./order.service";
import {
    clearPendingCheckoutId,
    readPendingCheckoutId,
} from "./pendingCheckoutStorage";

export function usePendingPaymentSync(enabled = true) {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const syncingRef = useRef(false);
    const isPaymentReturnPage = pathname.includes("/orders/payment/return");

    const sync = useCallback(async (): Promise<boolean> => {
        if (!enabled || syncingRef.current || isPaymentReturnPage) {
            return false;
        }
        syncingRef.current = true;

        try {
            const pendingCheckoutId = readPendingCheckoutId();

            if (pendingCheckoutId !== null) {
                const result = await orderService.completeCheckout(pendingCheckoutId);
                if (result.status === "paid") {
                    if (result.order) {
                        await applyPaidOrderToStore(result.order, dispatch, queryClient);
                    } else {
                        clearPendingCheckoutId();
                        await dispatch(fetchCart());
                    }
                    return true;
                }
                if (result.status === "failed") {
                    clearPendingCheckoutId();
                    return false;
                }
            }

            const synced = await orderService.syncPendingPayments();
            const paidItem = synced.items.find((item) => item.status === "paid");
            if (paidItem) {
                if (paidItem.order) {
                    await applyPaidOrderToStore(paidItem.order, dispatch, queryClient);
                } else if (paidItem.product_ids.length > 0) {
                    await applyPaidOrderToStore(
                        {
                            items: paidItem.product_ids.map((product_id) => ({
                                product_id,
                            })),
                        },
                        dispatch,
                        queryClient
                    );
                } else {
                    clearPendingCheckoutId();
                    await dispatch(fetchCart());
                }
                return true;
            }
        } catch {
            // background sync is best-effort
        } finally {
            syncingRef.current = false;
        }

        return false;
    }, [dispatch, enabled, isPaymentReturnPage, queryClient]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        void sync();

        const onVisible = () => {
            if (document.visibilityState === "visible") {
                void sync();
            }
        };

        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [enabled, sync]);

    return { syncPendingPayment: sync };
}
