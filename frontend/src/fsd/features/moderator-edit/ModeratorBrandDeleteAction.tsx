"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { moderationService } from "@entities/moderation";
import { resolvePathAfterAuthorDelete } from "@shared/lib/product-return";

import { ModeratorDeleteButton } from "./ModeratorDeleteButton";
import { ModeratorBrandDeleteModal } from "./ModeratorBrandDeleteModal";

type ModeratorBrandDeleteActionProps = {
    authorId: string;
    brandName: string;
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

export function ModeratorBrandDeleteAction({
    authorId,
    brandName,
    variant = "default",
}: ModeratorBrandDeleteActionProps) {
    const router = useRouter();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);

    const handleConfirm = (comment: string) => {
        setSubmitting(true);
        void moderationService
            .deleteCatalogBrand(authorId, comment)
            .then(() => {
                toast.success("Магазин удалён");
                setModalOpen(false);
                router.push(resolvePathAfterAuthorDelete(authorId));
            })
            .catch((error: unknown) => {
                toast.error(getErrorDetail(error) ?? "Не удалось удалить магазин");
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <>
            <ModeratorDeleteButton
                label="Удалить магазин"
                variant={variant}
                disabled={isSubmitting}
                onClick={() => setModalOpen(true)}
            />
            <ModeratorBrandDeleteModal
                isOpen={isModalOpen}
                brandName={brandName}
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
