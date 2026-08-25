"use client"

import styled, { keyframes } from "styled-components";
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
    type PointerEvent as ReactPointerEvent,
} from "react";
import { flushSync } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { animate, motion, useMotionValue } from "framer-motion";
import Link from "next/link";
import { AdvertBanner } from "@entities";
import { MEDIA_URL } from "@shared/api/interceptors";

const LandingBannerStyles = styled.section`
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: hidden;
    margin-bottom: 0;
`;

const BannerFrame = styled.div<{ $draggable: boolean }>`
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    touch-action: ${({ $draggable }) => ($draggable ? "pan-y" : "auto")};

    @media (min-width: 960px) {
        border-radius: 18px;
    }
`;

const bannerSlideStyles = `
    position: relative;
    flex-shrink: 0;
    display: block;
    aspect-ratio: 16 / 6;
    max-height: 200px;
    background: var(--neutral-surface-bg);

    @media (min-width: 960px) {
        aspect-ratio: 3 / 1;
        max-height: 240px;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const BannerSlide = styled(Link)`${bannerSlideStyles}`;
const BannerSlideExternal = styled.a`${bannerSlideStyles}`;
const BannerSlideStatic = styled.div`${bannerSlideStyles}`;

const BANNER_HREF_PROTOCOL_RE = /^https?:\/\//i;

function resolveBannerHref(href: string): { href: string; external: boolean } | null {
    const trimmed = href.trim();
    if (!trimmed) {
        return null;
    }

    if (BANNER_HREF_PROTOCOL_RE.test(trimmed)) {
        return { href: trimmed, external: true };
    }

    if (trimmed.startsWith("/")) {
        return { href: trimmed, external: false };
    }

    return { href: `https://${trimmed}`, external: true };
}

const BannerSlideTextBlock = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    width: 100%;
    padding: 12px 20px 14px 16px;

    @media (min-width: 960px) {
        padding: 20px 28px 22px 24px;
    }
    pointer-events: none;
    overflow: visible;
    background: linear-gradient(
        to top,
        rgba(9, 14, 24, 0.78) 0%,
        rgba(9, 14, 24, 0.22) 62%,
        transparent 100%
    );
`;

const BannerSlideTitle = styled.p`
    margin: 0;
    font-size: clamp(14px, 2.6vw, 20px);
    font-weight: 700;
    line-height: 1.28;
    letter-spacing: -0.02em;
    color: #fff;
    overflow: visible;
    /* короткая тень — длинный blur обрезался у края узкого shrink-wrap блока */
    text-shadow:
        0 1px 2px rgba(0, 0, 0, 0.65),
        0 0 1px rgba(0, 0, 0, 0.4);
`;

const BannerNavButton = styled.button<{ $left?: boolean }>`
    position: absolute;
    top: 50%;
    ${({ $left }) => ($left ? "left: 10px;" : "right: 10px;")}
    transform: translateY(-50%);
    width: 30px;
    height: 30px;

    @media (min-width: 960px) {
        ${({ $left }) => ($left ? "left: 16px;" : "right: 16px;")}
        width: 40px;
        height: 40px;
    }
    border-radius: 8px;
    border: 0;
    background: rgba(9, 14, 24, 0.58);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;

    &:hover {
        background: rgba(9, 14, 24, 0.72);
    }

    svg {
        width: 15px;
        height: 15px;
    }
`;

const BannerDots = styled.div`
    position: absolute;
    left: 50%;
    top: 12px;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    pointer-events: auto;
`;

const BannerDot = styled.button<{ $active: boolean }>`
    width: 7px;
    height: 7px;
    min-width: 7px;
    border-radius: 999px;
    border: 0;
    padding: 0;
    cursor: pointer;
    background: ${({ $active }) => ($active ? "#fff" : "rgba(255, 255, 255, 0.38)")};
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
    transform: scale(${({ $active }) => ($active ? 1.2 : 1)});
    transition: transform 0.2s ease, background-color 0.2s ease;
`;

const BANNER_TIMER_RADIUS = 9;
const BANNER_TIMER_STROKE_LEN = 2 * Math.PI * BANNER_TIMER_RADIUS;

const bannerTimerStrokeFill = keyframes`
    from {
        stroke-dashoffset: ${BANNER_TIMER_STROKE_LEN};
    }
    to {
        stroke-dashoffset: 0;
    }
`;

const BannerAutoTimerRing = styled.div<{ $durationMs: number; $paused: boolean }>`
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 2;
    width: 22px;
    height: 22px;
    pointer-events: none;

    svg {
        display: block;
    }

    circle.track {
        fill: none;
        stroke: rgba(255, 255, 255, 0.32);
        stroke-width: 2;
    }

    circle.progress {
        fill: none;
        stroke: rgba(255, 255, 255, 0.95);
        stroke-width: 2;
        stroke-linecap: round;
        stroke-dasharray: ${BANNER_TIMER_STROKE_LEN};
        stroke-dashoffset: ${BANNER_TIMER_STROKE_LEN};
        animation-name: ${bannerTimerStrokeFill};
        animation-duration: ${({ $durationMs }) => $durationMs}ms;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-play-state: ${({ $paused }) => ($paused ? "paused" : "running")};
    }
`;

const BANNER_AUTO_ADVANCE_MS = 5000;
const BANNER_MOBILE_MAX_WIDTH_PX = 959;

function useIsMobileBannerViewport() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        return window.matchMedia(`(max-width: ${BANNER_MOBILE_MAX_WIDTH_PX}px)`).matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(max-width: ${BANNER_MOBILE_MAX_WIDTH_PX}px)`);
        const sync = () => setIsMobile(mediaQuery.matches);

        sync();
        mediaQuery.addEventListener("change", sync);

        return () => {
            mediaQuery.removeEventListener("change", sync);
        };
    }, []);

    return isMobile;
}

export interface LandingBannerProps {
    banners: AdvertBanner[];
}

export const LandingBanner = ({ banners }: LandingBannerProps) => {
    const isMobileViewport = useIsMobileBannerViewport();
    const isBannerDraggable = isMobileViewport;
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);
    const [frameWidth, setFrameWidth] = useState(0);
    const [bannerTimerPaused, setBannerTimerPaused] = useState(false);
    const frameRef = useRef<HTMLDivElement | null>(null);
    const frameWidthRef = useRef(0);
    const animatingRef = useRef(false);
    const dragPointerIdRef = useRef<number | null>(null);
    const dragStartClientXRef = useRef(0);
    const dragStartXRef = useRef(0);
    const dragMovedRef = useRef(false);
    const suppressBannerLinkClickRef = useRef(false);
    const x = useMotionValue(0);
    const hasMultipleBanners = banners.length > 1;
    const getWrappedBannerIndex = (index: number) =>
        (index + banners.length) % banners.length;
    const bannerWindowIndexes = [
        getWrappedBannerIndex(activeBannerIndex - 1),
        getWrappedBannerIndex(activeBannerIndex),
        getWrappedBannerIndex(activeBannerIndex + 1),
    ];

    useLayoutEffect(() => {
        const el = frameRef.current;
        if (!el) {
            return;
        }

        const syncWidth = () => {
            const w = el.clientWidth;
            frameWidthRef.current = w;
            setFrameWidth(w);
            if (w > 0 && !animatingRef.current && dragPointerIdRef.current === null) {
                x.set(-w);
            }
        };

        syncWidth();
        const observer = new ResizeObserver(syncWidth);
        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const sync = () => {
            setBannerTimerPaused(typeof document !== "undefined" && document.hidden);
        };
        sync();
        document.addEventListener("visibilitychange", sync);
        return () => {
            document.removeEventListener("visibilitychange", sync);
        };
    }, []);

    const snapTrackToCenter = () => {
        const w = frameWidthRef.current;
        if (w > 0) {
            x.set(-w);
        }
    };

    const runSlideNext = async () => {
        const w = frameWidthRef.current;
        if (!hasMultipleBanners || w <= 0 || animatingRef.current) {
            return;
        }
        animatingRef.current = true;
        try {
            await animate(x, -2 * w, { duration: 0.28, ease: "easeOut" });
            flushSync(() => {
                setActiveBannerIndex((prev) => getWrappedBannerIndex(prev + 1));
            });
            snapTrackToCenter();
        } finally {
            animatingRef.current = false;
        }
    };

    const runSlidePrev = async () => {
        const w = frameWidthRef.current;
        if (!hasMultipleBanners || w <= 0 || animatingRef.current) {
            return;
        }
        animatingRef.current = true;
        try {
            await animate(x, 0, { duration: 0.28, ease: "easeOut" });
            flushSync(() => {
                setActiveBannerIndex((prev) => getWrappedBannerIndex(prev - 1));
            });
            snapTrackToCenter();
        } finally {
            animatingRef.current = false;
        }
    };

    useEffect(() => {
        if (!hasMultipleBanners) {
            return;
        }

        const id = window.setInterval(() => {
            if (typeof document !== "undefined" && document.hidden) {
                return;
            }
            if (dragPointerIdRef.current !== null) {
                return;
            }
            void runSlideNext();
        }, BANNER_AUTO_ADVANCE_MS);

        return () => {
            window.clearInterval(id);
        };
    }, [hasMultipleBanners, activeBannerIndex]);

    const onPrevBanner = () => {
        void runSlidePrev();
    };

    const onNextBanner = () => {
        void runSlideNext();
    };

    const releaseBannerPointerIfNeeded = (event: ReactPointerEvent<HTMLDivElement>) => {
        const el = frameRef.current;
        if (el?.hasPointerCapture(event.pointerId)) {
            el.releasePointerCapture(event.pointerId);
        }
    };

    const onBannerSlideClickCapture = (event: ReactMouseEvent<HTMLAnchorElement>) => {
        if (suppressBannerLinkClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressBannerLinkClickRef.current = false;
        }
    };

    const onBannerPointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!isBannerDraggable) {
            return;
        }
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }
        if (!hasMultipleBanners || animatingRef.current || frameWidthRef.current <= 0) {
            return;
        }
        if ((event.target as HTMLElement).closest("button")) {
            return;
        }

        dragPointerIdRef.current = event.pointerId;
        dragStartClientXRef.current = event.clientX;
        dragStartXRef.current = x.get();
        dragMovedRef.current = false;

        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            dragPointerIdRef.current = null;
        }
    };

    const onBannerPointerMoveCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!isBannerDraggable) {
            return;
        }
        if (dragPointerIdRef.current !== event.pointerId) {
            return;
        }
        const w = frameWidthRef.current;
        if (w <= 0) {
            return;
        }

        const dx = event.clientX - dragStartClientXRef.current;
        if (Math.abs(dx) > 6) {
            dragMovedRef.current = true;
        }

        const next = dragStartXRef.current + dx;
        const clamped = Math.min(0, Math.max(-2 * w, next));
        x.set(clamped);
    };

    const finishBannerPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!isBannerDraggable) {
            return;
        }
        if (dragPointerIdRef.current !== event.pointerId) {
            return;
        }

        releaseBannerPointerIfNeeded(event);
        dragPointerIdRef.current = null;

        if (!hasMultipleBanners || animatingRef.current) {
            dragMovedRef.current = false;
            return;
        }

        const w = frameWidthRef.current;
        if (w <= 0) {
            dragMovedRef.current = false;
            return;
        }

        const moved = dragMovedRef.current;
        dragMovedRef.current = false;

        const rest = -w;
        const cur = x.get();
        const offset = cur - rest;
        const commitThreshold = Math.max(48, w * 0.15);

        if (!moved && Math.abs(offset) < 3) {
            return;
        }

        if (moved) {
            suppressBannerLinkClickRef.current = true;
            window.setTimeout(() => {
                suppressBannerLinkClickRef.current = false;
            }, 400);
        }

        if (offset < -commitThreshold) {
            void runSlideNext();
            return;
        }

        if (offset > commitThreshold) {
            void runSlidePrev();
            return;
        }

        animatingRef.current = true;
        void (async () => {
            try {
                await animate(x, rest, { duration: 0.22, ease: "easeOut" });
            } finally {
                animatingRef.current = false;
            }
        })();
    };

    if (banners.length === 0) {
        return null;
    }

    return <LandingBannerStyles>
        <BannerFrame
            ref={frameRef}
            $draggable={isBannerDraggable && hasMultipleBanners}
            {...(isBannerDraggable && hasMultipleBanners
                ? {
                      onPointerDownCapture: onBannerPointerDownCapture,
                      onPointerMoveCapture: onBannerPointerMoveCapture,
                      onPointerUpCapture: finishBannerPointer,
                      onPointerCancelCapture: finishBannerPointer,
                  }
                : {})}
        >
            <motion.div
                style={{
                    x,
                    display: "flex",
                    width: frameWidth > 0 ? frameWidth * 3 : "300%",
                }}
            >
                {bannerWindowIndexes.map((bannerIndex, windowIndex) => {
                    const banner = banners[bannerIndex];
                    const resolvedHref = resolveBannerHref(banner.href);
                    const slideStyle = { width: frameWidth > 0 ? frameWidth : "33.3333%" };
                    const slideKey = `${banner.id}-${activeBannerIndex}-${windowIndex}`;
                    const slideContent = (
                        <>
                            <img src={`${MEDIA_URL}/images-bucket/${banner.image}`} alt="" draggable={false} />
                            <BannerSlideTextBlock>
                                <BannerSlideTitle>{banner.title}</BannerSlideTitle>
                            </BannerSlideTextBlock>
                        </>
                    );

                    if (!resolvedHref) {
                        return (
                            <BannerSlideStatic
                                key={slideKey}
                                style={slideStyle}
                                aria-label={banner.title}
                            >
                                {slideContent}
                            </BannerSlideStatic>
                        );
                    }

                    if (resolvedHref.external) {
                        return (
                            <BannerSlideExternal
                                href={resolvedHref.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={slideKey}
                                style={slideStyle}
                                onClickCapture={onBannerSlideClickCapture}
                                aria-label={`${banner.title}. ${banner.image}`}
                            >
                                {slideContent}
                            </BannerSlideExternal>
                        );
                    }

                    return (
                        <BannerSlide
                            href={resolvedHref.href}
                            key={slideKey}
                            style={slideStyle}
                            onClickCapture={onBannerSlideClickCapture}
                            aria-label={`${banner.title}. ${banner.image}`}
                        >
                            {slideContent}
                        </BannerSlide>
                    );
                })}
            </motion.div>
            {hasMultipleBanners ? (
                <>
                    <BannerDots>
                        {banners.map((banner, index) => (
                            <BannerDot
                                key={`${banner.id}-dot`}
                                type="button"
                                $active={index === activeBannerIndex}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    if (animatingRef.current) {
                                        return;
                                    }
                                    setActiveBannerIndex(index);
                                    snapTrackToCenter();
                                }}
                                aria-label={`Перейти к баннеру ${index + 1}`}
                            />
                        ))}
                    </BannerDots>
                    <BannerNavButton
                        $left
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onPrevBanner();
                        }}
                        aria-label="Предыдущий баннер"
                    >
                        <ChevronLeft />
                    </BannerNavButton>
                    <BannerNavButton
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onNextBanner();
                        }}
                        aria-label="Следующий баннер"
                    >
                        <ChevronRight />
                    </BannerNavButton>
                    <BannerAutoTimerRing
                        key={activeBannerIndex}
                        $durationMs={BANNER_AUTO_ADVANCE_MS}
                        $paused={bannerTimerPaused}
                        aria-hidden
                    >
                        <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true">
                            <circle className="track" cx="11" cy="11" r={BANNER_TIMER_RADIUS} />
                            <g transform="rotate(-90 11 11)">
                                <circle
                                    className="progress"
                                    cx="11"
                                    cy="11"
                                    r={BANNER_TIMER_RADIUS}
                                />
                            </g>
                        </svg>
                    </BannerAutoTimerRing>
                </>
            ) : null}
        </BannerFrame>
    </LandingBannerStyles>;
}
