const ACCESS_TOKEN_NAME = "Access-Token";

const canUseStorage = () => typeof window !== "undefined";

export const getAccessToken = () => {
    if (!canUseStorage()) {
        return null;
    }
    const accessToken = localStorage.getItem(ACCESS_TOKEN_NAME);
    return accessToken || null;
};

export const saveAccessToken = (accessToken: string) => {
    if (!canUseStorage()) {
        return;
    }
    localStorage.setItem(ACCESS_TOKEN_NAME, accessToken);
};

export const removeAccessToken = () => {
    if (!canUseStorage()) {
        return;
    }
    localStorage.removeItem(ACCESS_TOKEN_NAME);
};
