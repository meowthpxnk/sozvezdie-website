export function adultQueryParams(isAdult?: boolean) {
    return { adult: isAdult ? "1" : "0" };
}

export function adultFlagsPayload(isAdult?: boolean) {
    return JSON.stringify({ is_adult: Boolean(isAdult) });
}

export function appendAdultFields(formData: FormData, isAdult?: boolean) {
    formData.append("flags", adultFlagsPayload(isAdult));
    formData.append("is_adult", isAdult ? "true" : "false");
    formData.append("adult", isAdult ? "1" : "0");
}
