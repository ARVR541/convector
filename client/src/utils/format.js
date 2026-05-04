const LOCALE = "ru-RU";
export const formatAmount = (value, maxFractionDigits = 2) => new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits
}).format(value);
export const formatCurrencyValue = (value, currencyCode) => {
    try {
        return new Intl.NumberFormat(LOCALE, {
            style: "currency",
            currency: currencyCode,
            maximumFractionDigits: 2
        }).format(value);
    }
    catch {
        return `${formatAmount(value)} ${currencyCode}`;
    }
};
export const formatDate = (rawDate) => {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
        return rawDate;
    }
    return parsed.toLocaleDateString(LOCALE);
};
export const formatDateTime = (rawDate) => {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
        return String(rawDate);
    }
    return parsed.toLocaleString(LOCALE);
};
