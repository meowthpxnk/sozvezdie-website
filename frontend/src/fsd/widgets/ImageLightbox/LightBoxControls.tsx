import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import styled from "styled-components";

const LightBoxControlsStyles = styled.div`
    width: fit-content;
    min-height: 28px;
`;

const LightboxButtonStyles = styled.button`
    background: rgba(9, 14, 24, 0.58);
    color: #fff;
    padding: 4px;

    svg {
        width: 14px;
        height: 14px;
    }
`;

const DotsWrapper = styled.div<{ $width: number }>`
    pointer-events: none;
    width: ${({ $width }) => `${$width}px`};
`;

const DotsTrack = styled.div<{ $offset: number }>`
    transform: translateX(${({ $offset }) => `${$offset}px`});
    transition: transform 0.2s ease;
`;

const Dot = styled.span<{ $active: boolean }>`
    background: ${({ $active }) => ($active ? "var(--lightbox-dot-active)" : "var(--lightbox-dot-inactive)")};
    transform: scale(${({ $active }) => ($active ? 1 : 0.8)});
    transition: transform 0.2s ease, background-color 0.2s ease;
`;

export interface LightBoxControlsProps {
    images: string[];
    activeIndex: number;
    setPrevImage: () => void;
    setNextImage: () => void;
}

interface LightBoxButtonProps {
    onClick: () => void;
    children: React.ReactNode;
}

const LightboxButton = ({ onClick, children }: LightBoxButtonProps) => {
    return <LightboxButtonStyles type="button" onClick={onClick} className="b-rad-8 size-28 cur-p flex-center shrink-0 btn-reset">
        {children}
    </LightboxButtonStyles>
}

const DOT_GAP = 8;
const DOT_SIZE = 10;
const VISIBLE_DOTS_COUNT = 5;

const calculateDotsOffset = (images: string[], activeIndex: number) => {
    const visibleDotsCount = Math.min(VISIBLE_DOTS_COUNT, images.length);
    const dotStep = DOT_GAP + DOT_SIZE;
    const maxWindowStart = Math.max(0, images.length - visibleDotsCount);
    const centeredStart = activeIndex - Math.floor(visibleDotsCount / 2);
    const visibleStartIndex = Math.min(Math.max(centeredStart, 0), maxWindowStart);

    return {
        dotsOffset: -(visibleStartIndex * dotStep),
        dotsViewportWidth: visibleDotsCount * DOT_SIZE + Math.max(0, visibleDotsCount - 1) * DOT_GAP,
    };
}

export const LightBoxControls = ({ images, activeIndex, setPrevImage, setNextImage }: LightBoxControlsProps) => {
    const { dotsOffset, dotsViewportWidth } = useMemo(() => {
        return calculateDotsOffset(images, activeIndex);
    }, [activeIndex, images.length]);

    return <LightBoxControlsStyles className="grid ai-c jc-c int-12" style={{ gridTemplateColumns: "28px auto 28px" }}>
        <LightboxButton onClick={setPrevImage}>
            <ChevronLeft />
        </LightboxButton>

        <DotsWrapper $width={dotsViewportWidth} aria-hidden="true" className="ov-h">
            <DotsTrack className="flex-r ai-c indent-list int-8" $offset={dotsOffset}>
                {images.map((_, index) => (
                    <Dot key={`lightbox-dot-${index}`} className="size-10 b-rad-inf min-size-box" $active={index === activeIndex} />
                ))}
            </DotsTrack>
        </DotsWrapper>

        <LightboxButton onClick={setNextImage}>
            <ChevronRight />
        </LightboxButton>
    </LightBoxControlsStyles>;
}
