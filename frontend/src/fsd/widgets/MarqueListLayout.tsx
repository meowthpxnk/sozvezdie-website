import styled from "styled-components";

export interface MarqueListLayoutProps {
    children: React.ReactNode;
}

const MarqueListLayoutStyles = styled.div`
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    /* Вертикальный запас — тень карточек не режется секцией сверху/снизу */
    padding-block: 8px;
    margin-block: -8px;
`;

const MarqueeScroll = styled.div`
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    overscroll-behavior-y: none;
    touch-action: pan-x pinch-zoom;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 8px;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    /* Горизонтальный и вертикальный запас внутри скролла — тени карточек видны */
    padding: 12px 8px 20px;

    @media (min-width: 960px) {
        scroll-padding-inline: 4px;
        padding: 12px 4px 20px;
    }

    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);

    &::-webkit-scrollbar {
        height: 6px;
    }

    &::-webkit-scrollbar-track {
        border-radius: 999px;
        background: var(--scrollbar-track-subtle);
    }

    &::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: var(--scrollbar-thumb-strong);
    }
`;

const MarqueeTrack = styled.ul`
    display: flex;
    gap: 16px;
    width: max-content;
    padding-block: 2px;

    li {
        flex: 0 0 168px;
        width: 168px;
        min-width: 0;
        scroll-snap-align: start;
        overflow: visible;
        padding-inline: 2px;
        box-sizing: border-box;
    }

    @media (min-width: 960px) {
        gap: 20px;

        li {
            flex: 0 0 220px;
            width: 220px;
        }
    }
`;

export const MarqueListLayout = ({ children }: MarqueListLayoutProps) => {
    return (
        <MarqueListLayoutStyles>
            <MarqueeScroll>
                <MarqueeTrack>{children}</MarqueeTrack>
            </MarqueeScroll>
        </MarqueListLayoutStyles>
    );
};
export default MarqueListLayout;
