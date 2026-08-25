

export const priceFormatter = (value: number): string => {
    const rubles = value / 100

    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: rubles % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(rubles)
}
