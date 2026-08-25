import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { LightBoxControls } from "./LightBoxControls";
import { ImageLightboxProps } from "./ImageLightbox";
import { MEDIA_URL } from "@shared/api/interceptors";

const LightboxMediaWrapper = styled.div`
    flex: 1;
    width: 100%;
    min-height: 0;
    touch-action: none;
    overscroll-behavior: none;
`;

const lightboxImageVariants = {
    enter: (direction: 1 | -1) => ({ opacity: 0, x: direction > 0 ? 60 : -60 }),
    exit: (direction: 1 | -1) => ({ opacity: 0, x: direction > 0 ? -60 : 60 }),
    center: { opacity: 1, x: 0 },
};

const LightboxImage = styled(motion.img)`
    width: min(760px, 100%);
    min-width: min(320px, 100%);
    max-width: 100%;
    max-height: calc(100vh - 120px);
    object-fit: contain;
    user-select: none;
    border-radius: 14px;
    touch-action: none;
`;


export interface LigthBoxContentProps extends ImageLightboxProps { }

const OFFSET_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 500;

const useLightboxContent = ({
    images,
    clickedImageIndex,
    isOpen,
    onClose,
}: Pick<ImageLightboxProps, "images" | "clickedImageIndex" | "isOpen" | "onClose">) => {
    const [activeIndex, setActiveIndex] = useState(clickedImageIndex);
    const [lightboxDirection, setLightboxDirection] = useState<1 | -1>(-1);
    const changeImage = (direction: 1 | -1) => {
        setLightboxDirection(direction);
        setActiveIndex((prev) => (prev + direction + images.length) % images.length);
    };
    const setNextImage = () => {
        changeImage(1);
    };
    const setPrevImage = () => {
        changeImage(-1);
    };
    const onLightboxDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (images.length <= 1) {
            return;
        }
        if (info.offset.x <= -OFFSET_THRESHOLD || info.velocity.x <= -VELOCITY_THRESHOLD) {
            setNextImage();
            return;
        }
        if (info.offset.x >= OFFSET_THRESHOLD || info.velocity.x >= VELOCITY_THRESHOLD) {
            setPrevImage();
            return;
        }
    };
    const hasMultipleImages = images.length > 1;

    useEffect(() => {
        if (isOpen) {
            setActiveIndex(clickedImageIndex);
        }
    }, [isOpen, clickedImageIndex]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }
            if (images.length <= 1) {
                return;
            }
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                setPrevImage();
                return;
            }
            if (event.key === "ArrowRight") {
                event.preventDefault();
                setNextImage();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose, images.length]);

    return {
        activeIndex,
        lightboxDirection,
        setPrevImage,
        setNextImage,
        onLightboxDragEnd,
        hasMultipleImages,
    }

}

export const LigthBoxContent = ({ images, clickedImageIndex, onClose, isOpen }: LigthBoxContentProps) => {
    const {
        activeIndex,
        lightboxDirection,
        setPrevImage,
        setNextImage,
        onLightboxDragEnd,
        hasMultipleImages
    } = useLightboxContent({ images, clickedImageIndex, isOpen, onClose });

    return (
        <>
            <LightboxMediaWrapper className="flex-center" onClick={onClose}>
                <AnimatePresence mode="wait" initial={false} custom={lightboxDirection}>
                    <LightboxImage
                        className="b-rad-14"
                        key={activeIndex}
                        src={`${MEDIA_URL}/images-bucket/${images[activeIndex]}`}
                        drag={hasMultipleImages ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.16}
                        whileDrag={{ scale: 0.985 }}
                        variants={lightboxImageVariants}
                        custom={lightboxDirection}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        onClick={(event) => event.stopPropagation()}
                        onDragEnd={onLightboxDragEnd}
                    />
                </AnimatePresence>
            </LightboxMediaWrapper>
            {hasMultipleImages ? (
                <LightBoxControls
                    images={images}
                    activeIndex={activeIndex}
                    setPrevImage={setPrevImage}
                    setNextImage={setNextImage}
                />

            ) : null}
        </>
    )
}
