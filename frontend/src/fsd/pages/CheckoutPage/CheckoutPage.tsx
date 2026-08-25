"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Check, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getApiErrorMessage,
    isInsufficientStockApiError,
} from "@shared/lib/api-order-error";

// import { Header } from "@widgets/Header/ui/Header";
import { priceFormatter } from "@shared/formatters";
import { orderService } from "../../entities/order";
import { useAuth } from "../../entities/auth/hooks";
import { useAgeConfirmation } from "@entities/auth";
import { AdultBlurredMedia } from "@shared/ui/AdultBlurredMedia";
import { useAppDispatch } from "../../shared/store/store";
import { removeManyFromCart } from "../../shared/store/CartSlice";
import { fetchCart } from "../../entities/cart/cartThunk";
import { refreshCartStockState } from "../../entities/cart/refreshCartStockState";

import { CheckoutDeliverySection } from "./CheckoutDeliverySection";
import { applyPaidOrderToStore } from "../../entities/order/applyPaidOrder";
import { usePendingPaymentSync } from "../../entities/order/usePendingPaymentSync";
import {
    clearPendingCheckoutId,
    savePendingCheckoutId,
} from "../../entities/order/pendingCheckoutStorage";
import { mapCheckoutToOrderRequest } from "./checkout.mappers";
import type { CheckoutFormState, DeliveryCalcState } from "./checkout.types";
import { useCheckoutLines } from "./useCheckoutLines";

const INFO_ALERT_TEXT =
    "Пожалуйста, проверяйте свою электронную почту. Туда будут приходить важные уведомления о статусе заказа и возможных корректировках наличия товаров.";

const PaymentOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.92);
    color: #000;
`;

const PaymentOverlayTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
`;

const PaymentOverlayHint = styled.div`
    font-size: 15px;
    color: #555;
    max-width: 320px;
    text-align: center;
    line-height: 1.45;
`;

const PaymentSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid #e6e6e6;
    border-top-color: var(--main-color);
    border-radius: 50%;
    animation: checkout-spin 0.8s linear infinite;

    @keyframes checkout-spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const DEFAULT_PICKUP_ADDRESS = "г. Санкт-Петербург, ул. Печатника Григорьева, 8";
const DEFAULT_STORAGE_PERIOD =
    "Срок хранения 14 дней, если вы не можете забрать заказ, свяжитесь с нами";

const MainWrapper = styled.div`
    /* padding: 20px; */
    max-width: 1100px;
    margin: 0 auto;
`;

const PageHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px 12px;
    margin-bottom: 20px;
`;

const PageTitle = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--title-color);
`;

const PageTitleMeta = styled.span`
    font-size: 16px;
    font-weight: 500;
    color: #666;
`;

const BackToCart = styled(Link)`
    display: inline-block;
    margin-bottom: 8px;
    color: var(--main-color);
    text-decoration: none;
    font-size: 15px;
    font-weight: 600;

    &:hover,
    &:focus-visible {
        text-decoration: underline;
    }
`;

const CheckoutGrid = styled.div`
    display: grid;
    gap: 20px;
    align-items: start;

    @media (min-width: 960px) {
        grid-template-columns: minmax(0, 1fr) 360px;
    }
`;

const FormColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
`;

const SectionCard = styled.section`
    background-color: #fff;
    border-radius: 14px;
    /* padding: 20px; */
    color: #000;
`;

const BlockTitle = styled.h2`
    margin: 0 0 14px;
    font-size: 18px;
    font-weight: 700;
    color: #000;
`;

const OptionList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const OptionCardLabel = styled.label<{ $checked: boolean }>`
    position: relative;
    display: block;
    cursor: pointer;
    border-radius: 10px;
    border: 2px solid ${({ $checked }) => ($checked ? "var(--main-color)" : "#e6e6e6")};
    background: #fff;
    padding: 12px 40px 12px 14px;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    box-shadow: ${({ $checked }) => ($checked ? "0 0 0 1px var(--focus-ring-color-soft)" : "none")};

    &:hover {
        border-color: ${({ $checked }) => ($checked ? "var(--main-color)" : "#cfd4dc")};
    }

    &:focus-within {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const OptionCardInput = styled.input`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
`;

const OptionCardTitle = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #000;
    line-height: 1.35;
`;

const OptionCardHint = styled.div`
    margin-top: 4px;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    line-height: 1.35;
`;

const OptionCheck = styled.span<{ $visible: boolean }>`
    position: absolute;
    right: 12px;
    top: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: var(--main-color);
    color: #fff;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    pointer-events: none;
    transition: opacity 0.15s ease;

    svg {
        width: 14px;
        height: 14px;
    }
`;

const MutedBlock = styled.div`
    margin-top: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background: #f6f7f9;
    font-size: 14px;
    font-weight: 500;
    color: #303237;
    line-height: 1.45;
`;

const MutedBlockTight = styled(MutedBlock)`
    margin-top: 0;
`;

const MutedTitle = styled.div`
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #666;
    margin-bottom: 6px;
`;

const SdekRow = styled.div`
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
`;

const SecondaryButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid var(--main-color);
    background: #fff;
    color: var(--main-color);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
        background-color 0.2s ease,
        color 0.2s ease;

    &:hover {
        background: #f0f5ff;
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const SdekNote = styled.span`
    font-size: 13px;
    color: #666;
    font-weight: 500;
`;

const InfoAlert = styled.div`
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--main-color-tint-soft);
    color: #314e7b;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.45;

    svg {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-top: 1px;
    }
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const FieldLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #2d3a54;
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 100px;
    box-sizing: border-box;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    font-size: 14px;
    color: #000;
    font-family: inherit;
    resize: vertical;
    line-height: 1.45;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const SummaryColumn = styled.aside`
    @media (min-width: 960px) {
        position: sticky;
        top: 16px;
    }
`;

const SummaryCard = styled(SectionCard)``;

const LineItemsList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 14px;
    list-style: none;
    margin: 0 0 16px;
    padding: 0;
`;

const LineItemRow = styled.li`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f6f7f9;
`;

const LineItemImageWrap = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 10px;
    overflow: hidden;
    background: #f0f0f0;
    flex-shrink: 0;
    transition: opacity 0.2s ease;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    img[src="none"] {
        visibility: hidden;
    }
`;

const LineItemImageLink = styled(Link)`
    display: flex;
    flex-shrink: 0;
    border-radius: 10px;
    text-decoration: none;
    color: inherit;

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    &:hover ${LineItemImageWrap} {
        opacity: 0.92;
    }
`;

const LineItemBody = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const LineItemName = styled(Link)`
    font-weight: 600;
    font-size: 15px;
    line-height: 1.3;
    color: inherit;
    text-decoration: none;

    &:hover {
        color: var(--main-color);
    }
`;

const LineItemBottom = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
`;

const LineItemPrice = styled.span`
    font-weight: 600;
    color: var(--main-color);
    font-size: 17px;
`;

const LineItemOldPrice = styled.span`
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
    margin-left: 6px;
`;

/** Количество только для просмотра (как в списке заказов) */
const LineItemQtyLine = styled.span`
    color: #666;
    font-size: 13px;
    font-weight: 500;
`;

const OrderSummaryDash = styled.span`
    display: block;
    width: 100%;
    border-top: 1px dashed #cfd4dc;
    margin-bottom: 12px;
`;

const OrderSummaryRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;

    span {
        font-size: 15px;
        font-weight: 500;
        color: #303237;
    }
`;

const OrderSummaryTotalRow = styled(OrderSummaryRow)`
    margin-bottom: 16px;
    margin-top: 4px;

    span {
        font-size: 18px;
        font-weight: 700;
    }
`;

const PrimaryWideButton = styled.button`
    width: 100%;
    min-height: 44px;
    border-radius: 8px;
    border: none;
    background: var(--main-color);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
        background: var(--main-color-hover);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }
`;

const LegalNote = styled.p`
    margin: 12px 0 0;
    font-size: 12px;
    font-weight: 500;
    color: #666;
    line-height: 1.45;
    text-align: center;
`;

const EmptyState = styled.div`
    padding: 28px 20px;
    border-radius: 14px;
    background: #fff;
    color: #666;
    text-align: center;
    font-size: 15px;
    line-height: 1.45;
    max-width: 420px;
`;

const EmptyLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 16px;
    min-height: 42px;
    padding: 0 20px;
    border-radius: 10px;
    background: var(--main-color);
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.2s ease;

    &:hover {
        background: var(--main-color-hover);
    }
`;

function formatItemsCountRu(n: number): string {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) {
        return `${n} товар`;
    }
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 > 20)) {
        return `${n} товара`;
    }
    return `${n} товаров`;
}

export const CheckoutPage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const { isAuthenticated, authReady } = useAuth();
    const { shouldBlurAdult } = useAgeConfirmation();
    const { lines, isLoading: linesLoading, isEmpty, hasSelection } = useCheckoutLines();
    usePendingPaymentSync(isAuthenticated && authReady);

    const [form, setForm] = useState<CheckoutFormState>({
        deliveryMethod: "pickup",
        pickupAddressText: DEFAULT_PICKUP_ADDRESS,
        orderStoragePeriodText: DEFAULT_STORAGE_PERIOD,
        paymentMethod: "card_online",
        orderComment: "",
        selectedAddress: null,
        deliveryDate: null,
        pvzCode: null,
        pvzAddress: null,
    });

    const [deliveryCalc, setDeliveryCalc] = useState<DeliveryCalcState>({
        deliveryCost: 0,
        availableDates: [],
        isCalculating: false,
    });

    const [paymentPhase, setPaymentPhase] = useState<"idle" | "waiting">("idle");
    const [checkoutSessionId] = useState(() => crypto.randomUUID());

    const itemsCount = lines.reduce((acc, line) => acc + line.quantity, 0);
    const itemsSubtotal = lines.reduce(
        (acc, line) => acc + line.unitPrice * line.quantity,
        0
    );
    const deliveryCost =
        form.deliveryMethod === "pickup" ? 0 : deliveryCalc.deliveryCost;
    const hasCdekAddress = Boolean(form.selectedAddress);
    const isCdekDeliveryReady =
        hasCdekAddress &&
        !deliveryCalc.isCalculating &&
        deliveryCalc.availableDates.length > 0;
    const showOrderTotal =
        form.deliveryMethod === "pickup" || isCdekDeliveryReady;
    const total = itemsSubtotal + deliveryCost;

    const createOrderMutation = useMutation({
        mutationFn: orderService.createOrder.bind(orderService),
    });

    const initiatePaymentMutation = useMutation({
        mutationFn: orderService.initiatePayment.bind(orderService),
    });

    const isSubmitting =
        createOrderMutation.isPending || initiatePaymentMutation.isPending;

    useEffect(() => {
        if (!authReady) {
            return;
        }
        if (!isAuthenticated) {
            router.replace("/auth");
            return;
        }
        void dispatch(fetchCart());
    }, [authReady, isAuthenticated, router, dispatch]);

    useEffect(() => {
        if (!linesLoading && isAuthenticated && !hasSelection) {
            toast.error("Выберите товары в корзине");
            router.replace("/cart");
        }
    }, [linesLoading, isAuthenticated, hasSelection, router]);

    const hasStockIssues = lines.some((line) => line.quantity > line.stockCount);
    const canConfirmOrder =
        showOrderTotal && !isSubmitting && !hasStockIssues && paymentPhase === "idle";

    const deliverySummaryLabel =
        form.deliveryMethod === "pickup"
            ? "бесплатно"
            : !isCdekDeliveryReady
              ? "..."
              : deliveryCost > 0
                ? priceFormatter(deliveryCost)
                : "бесплатно";

    const onConfirmOrder = async () => {
        if (form.deliveryMethod === "pvz" && !form.selectedAddress) {
            toast.error("Выберите адрес доставки");
            return;
        }
        if (form.deliveryMethod === "pvz" && !form.deliveryDate) {
            toast.error("Выберите дату доставки");
            return;
        }
        if (form.deliveryMethod === "pvz" && !form.pvzCode) {
            toast.error("Пункт выдачи не определён — уточните адрес");
            return;
        }
        if (deliveryCalc.isCalculating) {
            toast.error("Дождитесь расчёта доставки");
            return;
        }

        const overStockLine = lines.find((line) => line.quantity > line.stockCount);
        if (overStockLine) {
            toast.error(
                `«${overStockLine.title}»: доступно ${overStockLine.stockCount} шт., в заказе ${overStockLine.quantity} шт.`
            );
            return;
        }

        const orderRequest = mapCheckoutToOrderRequest(
            form,
            lines.map((line) => ({
                productId: line.productId,
                quantity: line.quantity,
            })),
            deliveryCost,
            checkoutSessionId
        );

        try {
            if (form.paymentMethod === "card_online") {
                clearPendingCheckoutId();
                setPaymentPhase("waiting");
                const payment = await initiatePaymentMutation.mutateAsync(orderRequest);

                if (payment.already_paid && payment.order) {
                    await applyPaidOrderToStore(payment.order, dispatch, queryClient);
                    setPaymentPhase("idle");
                    toast.success("Заказ оплачен");
                    router.replace("/orders");
                    return;
                }

                savePendingCheckoutId(payment.checkout_id);
                window.location.href = payment.payment_confirmation_url;
                return;
            }

            await createOrderMutation.mutateAsync(orderRequest);
            const orderedIds = lines.map((line) => line.productId);
            dispatch(removeManyFromCart(orderedIds));
            await dispatch(fetchCart());
            await queryClient.invalidateQueries({ queryKey: ["product"] });
            await queryClient.invalidateQueries({ queryKey: ["products-bulk"] });
            toast.success("Заказ оформлен");
            router.push("/orders");
        } catch (error) {
            setPaymentPhase("idle");
            if (isInsufficientStockApiError(error)) {
                await refreshCartStockState(dispatch, queryClient);
                router.replace("/cart?stock_depleted=1");
                return;
            }
            toast.error(
                getApiErrorMessage(
                    error,
                    form.paymentMethod === "card_online"
                        ? "Не удалось перейти к оплате"
                        : "Не удалось оформить заказ"
                )
            );
        }
    };

    if (!authReady || !isAuthenticated) {
        return null;
    }

    if (linesLoading) {
        return (
            <div>
                {/* <Header /> */}
                <MainWrapper>
                    <EmptyState>Загрузка корзины…</EmptyState>
                </MainWrapper>
            </div>
        );
    }

    if (isEmpty || lines.length === 0) {
        return (
            <div>
                {/* <Header /> */}
                <MainWrapper>
                    <EmptyState>
                        Корзина пуста — добавьте товары, чтобы оформить заказ.
                        <div>
                            <EmptyLink href="/cart">Перейти в корзину</EmptyLink>
                        </div>
                    </EmptyState>
                </MainWrapper>
            </div>
        );
    }

    return (
        <div>
            {paymentPhase === "waiting" ? (
                <PaymentOverlay role="alertdialog" aria-busy="true" aria-live="polite">
                    <PaymentSpinner aria-hidden />
                    <PaymentOverlayTitle>Ожидание оплаты</PaymentOverlayTitle>
                    <PaymentOverlayHint>
                        Сейчас откроется страница ЮKassa. Корзина сохранится, пока оплата не
                        завершится.
                    </PaymentOverlayHint>
                </PaymentOverlay>
            ) : null}
            {/* <Header /> */}
            <MainWrapper>
                <BackToCart href="/cart">← Корзина</BackToCart>
                <PageHeader>
                    <PageTitle>Оформление заказа</PageTitle>
                    <PageTitleMeta>{formatItemsCountRu(itemsCount)}</PageTitleMeta>
                </PageHeader>

                <CheckoutGrid>
                    <FormColumn>
                        <SectionCard aria-labelledby="delivery-heading">
                            <BlockTitle id="delivery-heading">Способ доставки</BlockTitle>
                            <OptionList>
                                <OptionCardLabel $checked={form.deliveryMethod === "pickup"}>
                                    <OptionCardInput
                                        type="radio"
                                        name="delivery"
                                        checked={form.deliveryMethod === "pickup"}
                                        onChange={() =>
                                            setForm((f) => ({
                                                ...f,
                                                deliveryMethod: "pickup",
                                                deliveryDate: null,
                                                pvzCode: null,
                                                pvzAddress: null,
                                            }))
                                        }
                                    />
                                    <OptionCheck $visible={form.deliveryMethod === "pickup"}>
                                        <Check strokeWidth={3} />
                                    </OptionCheck>
                                    <OptionCardTitle>Самовывоз</OptionCardTitle>
                                    <OptionCardHint>бесплатно</OptionCardHint>
                                </OptionCardLabel>

                                <OptionCardLabel $checked={form.deliveryMethod === "pvz"}>
                                    <OptionCardInput
                                        type="radio"
                                        name="delivery"
                                        checked={form.deliveryMethod === "pvz"}
                                        onChange={() =>
                                            setForm((f) => ({
                                                ...f,
                                                deliveryMethod: "pvz",
                                                deliveryDate: null,
                                                pvzCode: null,
                                                pvzAddress: null,
                                            }))
                                        }
                                    />
                                    <OptionCheck $visible={form.deliveryMethod === "pvz"}>
                                        <Check strokeWidth={3} />
                                    </OptionCheck>
                                    <OptionCardTitle>До пункта выдачи</OptionCardTitle>
                                    <OptionCardHint>СДЭК</OptionCardHint>
                                </OptionCardLabel>
                            </OptionList>

                            <CheckoutDeliverySection
                                form={form}
                                setForm={setForm}
                                lines={lines}
                                deliveryCalc={deliveryCalc}
                                setDeliveryCalc={setDeliveryCalc}
                            />
                        </SectionCard>

                        {form.deliveryMethod === "pickup" && (
                            <SectionCard aria-labelledby="pickup-heading">
                                <BlockTitle id="pickup-heading">Адрес</BlockTitle>
                                <MutedBlock>{form.pickupAddressText}</MutedBlock>
                                <MutedTitle style={{ marginTop: 16 }}>Срок хранения заказа</MutedTitle>
                                <MutedBlockTight as="p">{form.orderStoragePeriodText}</MutedBlockTight>
                            </SectionCard>
                        )}

                        <SectionCard aria-labelledby="payment-heading">
                            <BlockTitle id="payment-heading">Способ оплаты</BlockTitle>
                            <OptionList>
                                <OptionCardLabel $checked={form.paymentMethod === "card_online"}>
                                    <OptionCardInput
                                        type="radio"
                                        name="payment"
                                        checked={form.paymentMethod === "card_online"}
                                        onChange={() =>
                                            setForm((f) => ({ ...f, paymentMethod: "card_online" }))
                                        }
                                    />
                                    <OptionCheck $visible={form.paymentMethod === "card_online"}>
                                        <Check strokeWidth={3} />
                                    </OptionCheck>
                                    <OptionCardTitle>Картой онлайн</OptionCardTitle>
                                    <OptionCardHint>Оплата через ЮKassa</OptionCardHint>
                                </OptionCardLabel>
                                <OptionCardLabel $checked={form.paymentMethod === "on_receipt"}>
                                    <OptionCardInput
                                        type="radio"
                                        name="payment"
                                        checked={form.paymentMethod === "on_receipt"}
                                        onChange={() =>
                                            setForm((f) => ({ ...f, paymentMethod: "on_receipt" }))
                                        }
                                    />
                                    <OptionCheck $visible={form.paymentMethod === "on_receipt"}>
                                        <Check strokeWidth={3} />
                                    </OptionCheck>
                                    <OptionCardTitle>При получении</OptionCardTitle>
                                    <OptionCardHint>Наличными или картой</OptionCardHint>
                                </OptionCardLabel>
                            </OptionList>
                        </SectionCard>

                        <SectionCard aria-labelledby="comment-heading">
                            <FieldGroup>
                                <FieldLabel id="comment-heading" htmlFor="checkout-comment">
                                    Комментарий к заказу
                                </FieldLabel>
                                <TextArea
                                    id="checkout-comment"
                                    name="orderComment"
                                    value={form.orderComment}
                                    onChange={(e) => setForm((f) => ({ ...f, orderComment: e.target.value }))}
                                    placeholder="Необязательно"
                                />
                            </FieldGroup>
                        </SectionCard>
                    </FormColumn>

                    <SummaryColumn>
                        <SummaryCard aria-labelledby="summary-heading">
                            <BlockTitle id="summary-heading">Содержимое заказа</BlockTitle>
                            <LineItemsList>
                                {lines.map((line) => {
                                    const lineTotal = line.unitPrice * line.quantity;
                                    return (
                                        <LineItemRow key={line.productId}>
                                            <LineItemImageLink
                                                href={`/product/${line.productId}`}
                                                aria-label={`Открыть ${line.title}`}
                                            >
                                                <LineItemImageWrap>
                                                    {line.imageSrc ? (
                                                        <AdultBlurredMedia
                                                            blurred={shouldBlurAdult(line.isAdult)}
                                                        >
                                                            <img src={line.imageSrc} alt={line.title} />
                                                        </AdultBlurredMedia>
                                                    ) : null}
                                                </LineItemImageWrap>
                                            </LineItemImageLink>
                                            <LineItemBody>
                                                <LineItemName href={`/product/${line.productId}`}>
                                                    {line.title}
                                                </LineItemName>
                                                <LineItemBottom>
                                                    <LineItemPrice>
                                                        {priceFormatter(lineTotal)}
                                                    </LineItemPrice>
                                                    <LineItemQtyLine>
                                                        {line.quantity} шт. × {priceFormatter(line.unitPrice)}
                                                    </LineItemQtyLine>
                                                </LineItemBottom>
                                            </LineItemBody>
                                        </LineItemRow>
                                    );
                                })}
                            </LineItemsList>

                            <OrderSummaryDash />
                            <OrderSummaryRow>
                                <span>Товары ({itemsCount})</span>
                                <span>{priceFormatter(itemsSubtotal)}</span>
                            </OrderSummaryRow>
                            {form.deliveryMethod !== "pickup" ? (
                                <OrderSummaryRow>
                                    <span>Доставка до ПВЗ</span>
                                    <span>{deliverySummaryLabel}</span>
                                </OrderSummaryRow>
                            ) : null}
                            {showOrderTotal ? (
                                <OrderSummaryTotalRow>
                                    <span>Итого</span>
                                    <span>{priceFormatter(total)}</span>
                                </OrderSummaryTotalRow>
                            ) : null}

                            <PrimaryWideButton
                                type="button"
                                onClick={onConfirmOrder}
                                disabled={!canConfirmOrder}
                            >
                                {isSubmitting
                                    ? form.paymentMethod === "card_online"
                                        ? "Переход к оплате…"
                                        : "Оформление…"
                                    : "Подтвердить заказ"}
                            </PrimaryWideButton>
                        </SummaryCard>
                    </SummaryColumn>
                </CheckoutGrid>
            </MainWrapper>
        </div>
    );
};
