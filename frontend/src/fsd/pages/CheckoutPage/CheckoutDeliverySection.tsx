"use client";

import { isAxiosError } from "axios";
import { Loader2, Navigation } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    deliveryService,
    type IAddressSuggestion,
    type IDeliveryCalculateResponse,
    type IUserAddress,
} from "../../entities/delivery";
import { toBackendDeliveryMethod } from "./checkout.mappers";
import type {
    CheckoutDeliveryMethod,
    CheckoutFormState,
    CheckoutLine,
    CheckoutSelectedAddress,
    DeliveryCalcState,
} from "./checkout.types";

const AddressBlock = styled.div`
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    min-width: 0;
`;

const AddressInputRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: flex-start;
    width: 100%;
`;

const AddressConfirmedWrap = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
`;

const AddressInputWrap = styled.div`
    position: relative;
    flex: 1;
    min-width: 0;
`;

const spin = keyframes`
    from {
        transform: translateY(-50%) rotate(0deg);
    }
    to {
        transform: translateY(-50%) rotate(360deg);
    }
`;

const AddressValidationSpinner = styled(Loader2)`
    position: absolute;
    right: 12px;
    top: 50%;
    width: 18px;
    height: 18px;
    color: var(--main-color);
    pointer-events: none;
    animation: ${spin} 0.8s linear infinite;
`;

const TextInput = styled.input<{ $hasError?: boolean; $withLoader?: boolean }>`
    width: 100%;
    min-height: 40px;
    padding: 0 ${({ $withLoader }) => ($withLoader ? "40px" : "12px")} 0 12px;
    border: 1px solid ${({ $hasError }) => ($hasError ? "#e53935" : "#d8dce3")};
    border-radius: 8px;
    font-size: 14px;
    color: #000;

    &:focus {
        outline: 2px solid ${({ $hasError }) => ($hasError ? "#e53935" : "var(--main-color)")};
        border-color: ${({ $hasError }) => ($hasError ? "#e53935" : "var(--main-color)")};
    }
`;

const IconButton = styled.button`
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid var(--main-color);
    background: #fff;
    color: var(--main-color);
    cursor: pointer;

    &:hover {
        background: #f0f5ff;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SuggestionsDropdown = styled.ul`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 30;
    list-style: none;
    margin: 0;
    padding: 0;
    border: 1px solid #e8eaee;
    border-radius: 8px;
    max-height: 240px;
    overflow-y: auto;
    background: #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

const SuggestionItem = styled.li`
    padding: 10px 12px;
    font-size: 14px;
    cursor: pointer;
    border-bottom: 1px solid #f0f1f3;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f6f8fc;
    }
`;

const SavedList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const SavedItemButton = styled.button<{ $active?: boolean }>`
    text-align: left;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid ${({ $active }) => ($active ? "var(--main-color)" : "#e8eaee")};
    background: ${({ $active }) => ($active ? "#f0f5ff" : "#fff")};
    font-size: 13px;
    cursor: pointer;
    color: #303237;
`;

const Hint = styled.p`
    margin: 0;
    font-size: 13px;
    color: #666;
`;

const ConfirmedAddressInner = styled.div`
    position: relative;
    width: 100%;
    min-width: 0;
`;

const SelectedAddressText = styled.button<{ $hasError?: boolean; $withLoader?: boolean }>`
    width: 100%;
    min-width: 0;
    padding: 10px ${({ $withLoader }) => ($withLoader ? "40px" : "12px")} 10px 12px;
    box-sizing: border-box;
    border-radius: 8px;
    border: 1px solid ${({ $hasError }) => ($hasError ? "#e53935" : "#e8eaee")};
    background: ${({ $hasError }) => ($hasError ? "#fff5f5" : "#f6f7f9")};
    font-size: 13px;
    line-height: 1.45;
    color: #303237;
    text-align: left;
    cursor: pointer;

    &:hover {
        border-color: ${({ $hasError }) => ($hasError ? "#e53935" : "#c5d4f5")};
        background: ${({ $hasError }) => ($hasError ? "#ffebee" : "#f0f5ff")};
    }
`;

const FieldError = styled.p`
    margin: 4px 0 0;
    font-size: 12px;
    font-weight: 500;
    color: #e53935;
`;

const DateSelect = styled.select`
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid #d8dce3;
    border-radius: 8px;
    font-size: 14px;
    background: #fff;
`;

function isValidHouseSuggestion(item: IAddressSuggestion): boolean {
    if (!item.house) {
        return false;
    }
    const lat = item.geo_lat ? parseFloat(item.geo_lat) : NaN;
    const lon = item.geo_lon ? parseFloat(item.geo_lon) : NaN;
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return false;
    }
    const qc = item.qc_geo != null ? Number(item.qc_geo) : 99;
    return qc <= 1;
}

function suggestionMatchesQuery(item: IAddressSuggestion, query: string): boolean {
    const normalized = query.trim().toLowerCase();
    return (
        (item.value?.trim().toLowerCase() === normalized) ||
        (item.unrestricted_value?.trim().toLowerCase() === normalized)
    );
}

function suggestionToSelected(
    item: IAddressSuggestion,
    userAddressId: number | null = null
): CheckoutSelectedAddress | null {
    const lat = item.geo_lat ? parseFloat(item.geo_lat) : NaN;
    const lon = item.geo_lon ? parseFloat(item.geo_lon) : NaN;
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return null;
    }
    return {
        formatted_address: item.unrestricted_value || item.value || "",
        city: item.city,
        street: item.street,
        house: item.house,
        postal_code: item.postal_code,
        lat,
        lon,
        user_address_id: userAddressId,
        suggestion: item,
    };
}

type AddressValidationState = {
    isValidating: boolean;
    hasValidated: boolean;
    errorKind: "invalid" | "flat" | null;
};

const initialAddressValidation: AddressValidationState = {
    isValidating: false,
    hasValidated: false,
    errorKind: null,
};

function getApiErrorDetail(error: unknown): string {
    if (!isAxiosError(error)) {
        return "";
    }
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
        return detail;
    }
    if (Array.isArray(detail)) {
        return detail
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }
                if (item && typeof item === "object" && "msg" in item) {
                    return String(item.msg);
                }
                return "";
            })
            .filter(Boolean)
            .join(" ");
    }
    return "";
}

function parseAddressErrorKind(detail: string): "invalid" | "flat" {
    const lower = detail.toLowerCase();
    if (lower.includes("квартир")) {
        return "flat";
    }
    return "invalid";
}

function logNearestPvzDebug(
    method: CheckoutDeliveryMethod,
    address: CheckoutSelectedAddress,
    result: IDeliveryCalculateResponse
) {
    // if (process.env.NODE_ENV !== "development") {
    //     return;
    // }
    if (method !== "pvz" || !result.pvz_code) {
        return;
    }

    console.log("[checkout] Ближайший ПВЗ СДЭК", {
        code: result.pvz_code,
        name: result.pvz_name,
        address: result.pvz_address,
        coordinates: {
            lat: result.pvz_lat,
            lon: result.pvz_lon,
        },
        distanceM: result.pvz_distance_m,
        cdekCityCode: result.pvz_search_city_code,
        fromAddress: {
            formatted: address.formatted_address,
            city: address.city,
            postalCode: address.postal_code,
            lat: address.lat,
            lon: address.lon,
        },
    });
}

function savedToSelected(addr: IUserAddress): CheckoutSelectedAddress {
    return {
        formatted_address: addr.formatted_address,
        city: addr.city,
        street: addr.street,
        house: addr.house,
        postal_code: addr.postal_code,
        lat: addr.lat ?? 0,
        lon: addr.lon ?? 0,
        user_address_id: addr.id,
    };
}

type Props = {
    form: CheckoutFormState;
    setForm: React.Dispatch<React.SetStateAction<CheckoutFormState>>;
    lines: CheckoutLine[];
    deliveryCalc: DeliveryCalcState;
    setDeliveryCalc: React.Dispatch<React.SetStateAction<DeliveryCalcState>>;
};

export function CheckoutDeliverySection({
    form,
    setForm,
    lines,
    deliveryCalc,
    setDeliveryCalc,
}: Props) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<IAddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [isAddressInputFocused, setIsAddressInputFocused] = useState(false);
    const [hasAddressInputStarted, setHasAddressInputStarted] = useState(false);
    const [addressValidation, setAddressValidation] =
        useState<AddressValidationState>(initialAddressValidation);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const validationGenRef = useRef(0);
    const blurCommitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const focusInputAfterEditRef = useRef(false);
    /** Текст инпута после выбора из списка / сохранённого / геолокации — suggest не дергаем */
    const committedQueryRef = useRef<string | null>(null);

    const isCdek = form.deliveryMethod === "pvz";

    const suggestParams = {
        restrictToHouse: true,
        allowFlat: false,
    };

    const shouldShowAddressErrors = form.selectedAddress
        ? true
        : hasAddressInputStarted && !isAddressInputFocused;

    const showInvalidAddressError =
        shouldShowAddressErrors &&
        addressValidation.hasValidated &&
        !addressValidation.isValidating &&
        addressValidation.errorKind === "invalid";

    const showFlatMissingError =
        shouldShowAddressErrors &&
        addressValidation.hasValidated &&
        !addressValidation.isValidating &&
        addressValidation.errorKind === "flat";

    const showAddressFieldError = showInvalidAddressError || showFlatMissingError;
    const isAddressValidating = addressValidation.isValidating;

    const commitAddressQuery = (text: string) => {
        committedQueryRef.current = text;
    };

    const resetAddressValidation = () => {
        validationGenRef.current += 1;
        setAddressValidation(initialAddressValidation);
    };

    const { data: savedAddresses = [] } = useQuery({
        queryKey: ["saved-addresses"],
        queryFn: () => deliveryService.listSavedAddresses(),
        enabled: isCdek,
    });

    useEffect(() => {
        setSuggestions([]);
        setShowSuggestions(false);
        focusInputAfterEditRef.current = false;
        setIsAddressInputFocused(false);
        resetAddressValidation();

        if (form.selectedAddress) {
            const displayText = form.selectedAddress.formatted_address;
            commitAddressQuery(displayText);
            setQuery(displayText);
            setHasAddressInputStarted(true);
        }
    }, [form.deliveryMethod]);

    useEffect(() => {
        if (!form.selectedAddress && focusInputAfterEditRef.current) {
            focusInputAfterEditRef.current = false;
            requestAnimationFrame(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            });
        }
    }, [form.selectedAddress]);

    const enterAddressEditMode = (text?: string) => {
        cancelBlurCommit();
        committedQueryRef.current = null;
        focusInputAfterEditRef.current = true;
        if (text !== undefined) {
            setQuery(text);
        }
        setForm((f) => ({
            ...f,
            selectedAddress: null,
            pvzCode: null,
            pvzAddress: null,
            deliveryDate: null,
        }));
        setDeliveryCalc({
            deliveryCost: 0,
            availableDates: [],
            isCalculating: false,
        });
        resetAddressValidation();
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const validateAddressWithBackend = useCallback(
        async (address: CheckoutSelectedAddress, method: CheckoutDeliveryMethod) => {
            const backendMethod = toBackendDeliveryMethod(method);
            if (!backendMethod) {
                return;
            }

            const gen = ++validationGenRef.current;
            setAddressValidation({
                isValidating: true,
                hasValidated: false,
                errorKind: null,
            });
            setDeliveryCalc((s) => ({ ...s, isCalculating: true }));

            try {
                const result = await deliveryService.calculateDelivery({
                    delivery_method: backendMethod,
                    address: {
                        formatted_address: address.formatted_address,
                        city: address.city,
                        street: address.street,
                        house: address.house,
                        postal_code: address.postal_code,
                        lat: address.lat,
                        lon: address.lon,
                        user_address_id: address.user_address_id,
                    },
                    items: lines.map((l) => ({
                        product_id: Number(l.productId),
                        quantity: l.quantity,
                    })),
                });

                if (gen !== validationGenRef.current) {
                    return;
                }

                logNearestPvzDebug(method, address, result);

                setAddressValidation({
                    isValidating: false,
                    hasValidated: true,
                    errorKind: null,
                });
                setDeliveryCalc({
                    deliveryCost: result.delivery_cost,
                    availableDates: result.available_dates,
                    isCalculating: false,
                });
                setForm((f) => ({
                    ...f,
                    pvzCode: result.pvz_code,
                    pvzAddress: result.pvz_address,
                    deliveryDate: result.available_dates[0] ?? null,
                }));
            } catch (error) {
                if (gen !== validationGenRef.current) {
                    return;
                }

                const detail = getApiErrorDetail(error);
                setAddressValidation({
                    isValidating: false,
                    hasValidated: true,
                    errorKind: parseAddressErrorKind(detail),
                });
                setDeliveryCalc({
                    deliveryCost: 0,
                    availableDates: [],
                    isCalculating: false,
                });
                setForm((f) => ({
                    ...f,
                    pvzCode: null,
                    pvzAddress: null,
                    deliveryDate: null,
                }));
            }
        },
        [lines, setDeliveryCalc, setForm]
    );

    useEffect(() => {
        if (!form.selectedAddress || !isCdek) {
            if (!isCdek) {
                setDeliveryCalc({
                    deliveryCost: 0,
                    availableDates: [],
                    isCalculating: false,
                });
            }
            return;
        }
        void validateAddressWithBackend(
            form.selectedAddress,
            form.deliveryMethod
        );
    }, [
        form.selectedAddress,
        form.deliveryMethod,
        isCdek,
        lines,
        validateAddressWithBackend,
        setDeliveryCalc,
    ]);

    useEffect(() => {
        if (committedQueryRef.current !== null && query === committedQueryRef.current) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (!query.trim() || query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(async () => {
            try {
                const items = await deliveryService.suggestAddress(
                    query,
                    suggestParams
                );
                setSuggestions(items);
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            }
        }, 400);
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, form.deliveryMethod]);

    const applySuggestion = (item: IAddressSuggestion, options?: { silent?: boolean }) => {
        const selected = suggestionToSelected(item);
        if (!selected) {
            if (!options?.silent) {
                toast.error("Уточните адрес до номера дома");
            }
            return false;
        }
        setHasAddressInputStarted(true);
        setForm((f) => ({
            ...f,
            selectedAddress: selected,
            pvzCode: null,
            pvzAddress: null,
            deliveryDate: null,
        }));
        const displayText = selected.formatted_address;
        commitAddressQuery(displayText);
        setQuery(displayText);
        setSuggestions([]);
        setShowSuggestions(false);
        return true;
    };

    const onSelectSuggestion = (item: IAddressSuggestion) => {
        applySuggestion(item);
    };

    const cancelBlurCommit = () => {
        if (blurCommitRef.current) {
            clearTimeout(blurCommitRef.current);
            blurCommitRef.current = null;
        }
    };

    const commitAddressOnBlur = async () => {
        const trimmed = query.trim();
        if (trimmed.length < 3) {
            return;
        }

        if (committedQueryRef.current === trimmed && form.selectedAddress) {
            return;
        }

        const gen = ++validationGenRef.current;
        setAddressValidation({
            isValidating: true,
            hasValidated: false,
            errorKind: null,
        });

        const finishInvalid = () => {
            if (gen !== validationGenRef.current) {
                return;
            }
            setAddressValidation({
                isValidating: false,
                hasValidated: true,
                errorKind: "invalid",
            });
        };

        const fromOpenList = suggestions.find(
            (s) => suggestionMatchesQuery(s, trimmed) && isValidHouseSuggestion(s)
        );
        if (fromOpenList) {
            if (!applySuggestion(fromOpenList, { silent: true })) {
                finishInvalid();
            }
            return;
        }

        try {
            const items = await deliveryService.suggestAddress(
                trimmed,
                suggestParams
            );
            const exact = items.find(
                (s) => suggestionMatchesQuery(s, trimmed) && isValidHouseSuggestion(s)
            );
            const picked =
                exact ?? items.find((s) => isValidHouseSuggestion(s)) ?? null;

            if (picked) {
                if (!applySuggestion(picked, { silent: true })) {
                    finishInvalid();
                }
                return;
            }
        } catch {
            /* оставляем в режиме ввода */
        }

        finishInvalid();
    };

    const onInputBlur = () => {
        setIsAddressInputFocused(false);
        setShowSuggestions(false);
        cancelBlurCommit();
        blurCommitRef.current = setTimeout(() => {
            void commitAddressOnBlur();
        }, 200);
    };

    const onSelectSaved = (addr: IUserAddress) => {
        const selected = savedToSelected(addr);
        const displayText = addr.formatted_address;
        commitAddressQuery(displayText);
        setHasAddressInputStarted(true);
        setForm((f) => ({
            ...f,
            selectedAddress: selected,
            pvzCode: null,
            pvzAddress: null,
            deliveryDate: null,
        }));
        setQuery(displayText);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const onEditSelectedAddress = () => {
        enterAddressEditMode(form.selectedAddress?.formatted_address ?? query);
    };

    const onQueryChange = (value: string) => {
        if (value.trim().length > 0) {
            setHasAddressInputStarted(true);
        }
        setQuery(value);
        if (
            committedQueryRef.current !== null &&
            value !== committedQueryRef.current
        ) {
            committedQueryRef.current = null;
            setForm((f) => ({
                ...f,
                selectedAddress: null,
                pvzCode: null,
                pvzAddress: null,
                deliveryDate: null,
            }));
            setDeliveryCalc({
                deliveryCost: 0,
                availableDates: [],
                isCalculating: false,
            });
            resetAddressValidation();
        }
    };

    const onGeolocate = () => {
        if (!navigator.geolocation) {
            toast.error("Геолокация недоступна в браузере");
            return;
        }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const items = await deliveryService.geolocateAddress(
                        pos.coords.latitude,
                        pos.coords.longitude
                    );
                    if (items.length === 0) {
                        toast.error("Адрес по координатам не найден");
                        return;
                    }
                    onSelectSuggestion(items[0]);
                } catch {
                    toast.error("Не удалось определить адрес");
                } finally {
                    setGeoLoading(false);
                }
            },
            () => {
                toast.error("Не удалось получить координаты");
                setGeoLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    if (!isCdek) {
        return null;
    }

    return (
        <AddressBlock>
            {savedAddresses.length > 0 ? (
                <SavedList>
                    <Hint>Сохранённые адреса</Hint>
                    {savedAddresses.map((addr) => (
                        <SavedItemButton
                            key={addr.id}
                            type="button"
                            $active={form.selectedAddress?.user_address_id === addr.id}
                            onClick={() => {
                                if (
                                    form.selectedAddress?.user_address_id === addr.id
                                ) {
                                    enterAddressEditMode(addr.formatted_address);
                                    return;
                                }
                                onSelectSaved(addr);
                            }}
                        >
                            {addr.formatted_address}
                        </SavedItemButton>
                    ))}
                </SavedList>
            ) : null}

            <Hint>Адрес доставки</Hint>
            {form.selectedAddress ? (
                <AddressConfirmedWrap>
                    <ConfirmedAddressInner>
                        <SelectedAddressText
                            type="button"
                            $hasError={showAddressFieldError}
                            $withLoader={isAddressValidating}
                            onClick={onEditSelectedAddress}
                            title="Нажмите, чтобы изменить адрес"
                        >
                            {form.selectedAddress.formatted_address}
                        </SelectedAddressText>
                        {isAddressValidating ? (
                            <AddressValidationSpinner aria-hidden />
                        ) : null}
                    </ConfirmedAddressInner>
                    {showInvalidAddressError ? (
                        <FieldError>Неверный адрес — укажите улицу и дом</FieldError>
                    ) : showFlatMissingError ? (
                        <FieldError>
                            Укажите квартиру в адресе (например: …, кв. 12)
                        </FieldError>
                    ) : null}
                </AddressConfirmedWrap>
            ) : (
                <AddressInputRow>
                    <IconButton
                        type="button"
                        title="Определить по геолокации"
                        onClick={onGeolocate}
                        disabled={geoLoading}
                    >
                        <Navigation size={18} />
                    </IconButton>
                    <AddressInputWrap>
                        <TextInput
                            ref={inputRef}
                            value={query}
                            $hasError={showAddressFieldError}
                            $withLoader={isAddressValidating}
                            onChange={(e) => onQueryChange(e.target.value)}
                            onBlur={onInputBlur}
                            onFocus={() => {
                                setIsAddressInputFocused(true);
                                cancelBlurCommit();
                                if (
                                    committedQueryRef.current === null &&
                                    suggestions.length > 0
                                ) {
                                    setShowSuggestions(true);
                                }
                            }}
                            placeholder="Начните вводить адрес"
                            autoComplete="off"
                        />
                        {showSuggestions && suggestions.length > 0 ? (
                            <SuggestionsDropdown>
                                {suggestions.map((item, idx) => (
                                    <SuggestionItem
                                        key={`${item.value}-${idx}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            cancelBlurCommit();
                                        }}
                                        onClick={() => onSelectSuggestion(item)}
                                    >
                                        {item.value}
                                    </SuggestionItem>
                                ))}
                            </SuggestionsDropdown>
                        ) : null}
                        {showInvalidAddressError ? (
                            <FieldError>Неверный адрес — укажите улицу и дом</FieldError>
                        ) : showFlatMissingError ? (
                            <FieldError>
                                Укажите квартиру в адресе (например: …, кв. 12)
                            </FieldError>
                        ) : null}
                    </AddressInputWrap>
                </AddressInputRow>
            )}

            {deliveryCalc.availableDates.length > 0 ? (
                <div>
                    <Hint>Дата доставки</Hint>
                    <DateSelect
                        value={form.deliveryDate ?? ""}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                deliveryDate: e.target.value || null,
                            }))
                        }
                    >
                        {deliveryCalc.availableDates.map((d) => (
                            <option key={d} value={d}>
                                {new Date(d).toLocaleDateString("ru-RU", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "long",
                                })}
                            </option>
                        ))}
                    </DateSelect>
                </div>
            ) : null}
        </AddressBlock>
    );
}
