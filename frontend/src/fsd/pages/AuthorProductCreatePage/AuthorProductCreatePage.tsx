"use client";

import { AuthorProductComposer } from "./AuthorProductComposer";
import { useAuthorProductCreate } from "./useAuthorProductCreate";

export function AuthorProductCreatePage() {
    const { submitProduct, checkingSeller } = useAuthorProductCreate();

    if (checkingSeller) {
        return null;
    }

    return <AuthorProductComposer onSubmitForm={submitProduct} />;
}
