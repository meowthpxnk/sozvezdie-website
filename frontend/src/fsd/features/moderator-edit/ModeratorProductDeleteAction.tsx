"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { moderationService } from "@entities/moderation";
import { resolvePathAfterProductDelete } from "@shared/lib/product-return";

import { ModeratorDeleteButton } from "./ModeratorDeleteButton";
import { ModeratorProductDeleteModal } from "./ModeratorProductDeleteModal";

type ModeratorProductDeleteActionProps = {
    productId: string;
    productName: string;
    variant?: "default" | "on-dark";
};

function getErrorDetail(error: unknown): string | null {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response?.data
            ?.detail === "string"
    ) {
        return (error as { response: { data: { detail: string } } }).response.data.detail;
    }

    return null;
}

export function ModeratorProductDeleteAction({
    productId,
    productName,
    variant = "default",
}: ModeratorProductDeleteActionProps) {
    const router = useRouter();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);

    const handleConfirm = (comment: string) => {
        setSubmitting(true);
        void moderationService
            .deleteCatalogProduct(productId, comment)
            .then(() => {
                toast.success("Товар удалён");
                setModalOpen(false);
                router.push(resolvePathAfterProductDelete(productId));
            })
            .catch((error: unknown) => {
                toast.error(getErrorDetail(error) ?? "Не удалось удалить товар");
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <>
            <ModeratorDeleteButton
                label="Удалить товар"
                variant={variant}
                disabled={isSubmitting}
                onClick={() => setModalOpen(true)}
            />
            <ModeratorProductDeleteModal
                isOpen={isModalOpen}
                productName={productName}
                isSubmitting={isSubmitting}
                onClose={() => {
                    if (!isSubmitting) {
                        setModalOpen(false);
                    }
                }}
                onConfirm={handleConfirm}
            />
        </>
    );
}
