"use client";

import { LightBoxLayout } from "./LightBoxLayout";
import { LigthBoxContent } from "./LigthBoxContent";

export interface ImageLightboxProps {
    images: string[];
    clickedImageIndex: number;
    onClose: () => void;
    isOpen: boolean;
}

export const ImageLightbox = (props: ImageLightboxProps) => {
    const { onClose, isOpen } = props;

    return (
        <LightBoxLayout onClose={onClose} isOpen={isOpen}>
            <LigthBoxContent {...props} />
        </LightBoxLayout>
    )
}
