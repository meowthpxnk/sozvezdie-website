import styled from "styled-components";
import { ImageLightboxProps } from "./ImageLightbox";
import { AnimatePresence, motion, MotionProps } from "framer-motion";

export interface LightBoxLayoutProps extends Pick<ImageLightboxProps, "onClose" | "isOpen"> {
    children: React.ReactNode;
}

const LightboxOverlay = styled(motion.div)`
    inset: 0;
    z-index: 1200;
    background: rgba(9, 14, 24, 0.57);
    backdrop-filter: blur(6px);
    padding: 16px;
    overscroll-behavior: none;
`;

const LightboxContent = styled(motion.div)`
    width: min(1100px, 100%);
    height: calc(100vh - 32px);
    padding: 72px 0 18px;
`;

export const LightBoxLayout = ({ onClose, isOpen, children }: LightBoxLayoutProps) => {
    const overlayAnimationProps: MotionProps = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: "easeOut" },
    };

    const contentAnimationProps: MotionProps = {
        initial: { opacity: 0, y: 14, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.985 },
        transition: { duration: 0.24, ease: "easeOut" },
    };


    return <AnimatePresence>
        {isOpen && <LightboxOverlay
            className="pos-f flex-c jc-c ai-c"
            onClick={onClose}
            {...overlayAnimationProps}
        >
            <LightboxContent
                className="flex-c ai-c jc-sb pos-r"
                onClick={(event) => event.stopPropagation()}
                {...contentAnimationProps}
            >
                {children}
            </LightboxContent>
        </LightboxOverlay>
        }
    </AnimatePresence>;
}
