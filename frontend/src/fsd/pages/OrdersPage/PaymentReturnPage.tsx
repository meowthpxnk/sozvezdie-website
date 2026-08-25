"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { applyPaidOrderToStore } from "../../entities/order/applyPaidOrder";
import { orderService } from "../../entities/order";
import { clearPendingCheckoutId } from "../../entities/order/pendingCheckoutStorage";
import { useAuth } from "../../entities/auth/hooks";
import { useAppDispatch } from "../../shared/store/store";
import { fetchCart } from "../../entities/cart/cartThunk";
import { refreshCartStockState } from "../../entities/cart/refreshCartStockState";
import { isInsufficientStockApiError } from "@shared/lib/api-order-error";

const Wrapper = styled.div`
    max-width: 560px;
    margin: 48px auto;
    padding: 24px;
    text-align: center;
`;

const Title = styled.h1`
    margin: 0 0 12px;
    font-size: 24px;
`;

const Message = styled.p`
    margin: 0 0 24px;
    color: #555;
    line-height: 1.5;
`;

const Actions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
`;

const PrimaryLink = styled(Link)`
    display: inline-block;
    padding: 12px 24px;
    border-radius: 10px;
    background: var(--main-color);
    color: #fff;
    font-weight: 600;
    text-decoration: none;

    &:hover {
        background: #3d6fc8;
    }
`;

const SecondaryLink = styled(Link)`
    color: var(--main-color);
    font-weight: 600;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

type PaymentReturnState = "loading" | "paid" | "failed";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const PaymentReturnPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const { isAuthenticated, authReady } = useAuth();
    const [state, setState] = useState<PaymentReturnState>("loading");
    const [failMessage, setFailMessage] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);
    const completionStartedRef = useRef(false);

    const checkoutIdRaw = searchParams.get("checkout_id");
    const checkoutId = checkoutIdRaw ? Number(checkoutIdRaw) : NaN;

    useEffect(() => {
        if (!authReady) {
            return;
        }
        if (!isAuthenticated) {
            router.replace("/auth");
            return;
        }
        if (!checkoutIdRaw || Number.isNaN(checkoutId)) {
            setState("failed");
            setFailMessage("Некорректная ссылка возврата с оплаты");
            return;
        }
        if (completionStartedRef.current) {
            return;
        }
        completionStartedRef.current = true;

        let cancelled = false;

        const finishPaid = async (order: NonNullable<Awaited<ReturnType<typeof orderService.completeCheckout>>["order"]>) => {
            await applyPaidOrderToStore(order, dispatch, queryClient);
            setOrderId(order.id);
            setState("paid");
            toast.success("Оплата прошла успешно");
            router.replace("/orders");
        };

        const complete = async () => {
            const maxAttempts = 12;
            for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
                if (cancelled) {
                    return;
                }
                try {
                    const result = await orderService.completeCheckout(checkoutId);
                    if (cancelled) {
                        return;
                    }

                    if (result.status === "paid" && result.order) {
                        await finishPaid(result.order);
                        return;
                    }

                    if (result.status === "paid") {
                        clearPendingCheckoutId();
                        await dispatch(fetchCart());
                        setState("paid");
                        toast.success("Оплата прошла успешно");
                        router.replace("/orders");
                        return;
                    }

                    if (result.status === "failed") {
                        clearPendingCheckoutId();
                        setState("failed");
                        setFailMessage(result.message ?? "Оплата не прошла");
                        return;
                    }

                    if (attempt < maxAttempts - 1) {
                        await sleep(attempt < 4 ? 1000 : 2000);
                    }
                } catch (error) {
                    if (cancelled) {
                        return;
                    }
                    if (isInsufficientStockApiError(error)) {
                        clearPendingCheckoutId();
                        await refreshCartStockState(dispatch, queryClient);
                        router.replace("/cart?stock_depleted=1");
                        return;
                    }
                    setState("failed");
                    setFailMessage("Не удалось проверить оплату");
                    return;
                }
            }

            if (!cancelled) {
                setState("failed");
                setFailMessage(
                    "Оплата ещё не подтверждена. Откройте сайт снова — заказ оформится автоматически."
                );
            }
        };

        void complete();
        return () => {
            cancelled = true;
        };
    }, [
        authReady,
        checkoutId,
        checkoutIdRaw,
        dispatch,
        isAuthenticated,
        queryClient,
        router,
    ]);

    if (!authReady || state === "loading") {
        return (
            <Wrapper>
                <Title>Оформляем заказ…</Title>
                <Message>Подтверждаем оплату и создаём заказ. Это займёт несколько секунд.</Message>
            </Wrapper>
        );
    }

    if (state === "paid") {
        return (
            <Wrapper>
                <Title>Спасибо за оплату</Title>
                <Message>
                    {orderId
                        ? `Заказ №${orderId} оформлен. Корзина очищена.`
                        : "Заказ оформлен. Корзина очищена."}
                </Message>
                <Actions>
                    <PrimaryLink href="/orders">Перейти к заказам</PrimaryLink>
                </Actions>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <Title>Ошибка оплаты</Title>
            <Message>
                {failMessage ?? "Оплата не была завершена. Товары остались в корзине."}
            </Message>
            <Actions>
                <PrimaryLink href="/checkout">Вернуться к оформлению</PrimaryLink>
                <SecondaryLink href="/cart">Перейти в корзину</SecondaryLink>
            </Actions>
        </Wrapper>
    );
};
