import styled from "styled-components";
import AuthorLikeButton from "@shared/ui/buttons/AuthorLikeButton";

const AuthorBannerStyles = styled.section<{ $backgroundImage: string }>`
    --indentation: 24px;
    color: var(--color);

    background-image:
        var(--author-banner-gradient),
        url(${({ $backgroundImage }) => $backgroundImage});
    background-size: cover;
    background-position: center;
`;


const ImageBoxStyles = styled.div`
    --size: 88px;
`

export interface AuthorBannerProps {
    authorName: string;
    description: string;
    bannerImageSrc: string;
    avatarImageSrc: string;
    authorLiked: boolean;
}

export const AuthorBanner = ({ authorName, description, bannerImageSrc, avatarImageSrc, authorLiked }: AuthorBannerProps) => {
    return (
        <AuthorBannerStyles
            className="flex-r jc-sb ai-c indent-box b-rad-14 fill-w"
            $backgroundImage={bannerImageSrc}
        >
            <ImageBoxStyles className="image-box size-box b-rad-10">
                <img src={avatarImageSrc ?? "none"} />
            </ImageBoxStyles>

            <div className="flex-r jc-sb ai-c fg-1">
                <div className="flex-c">
                    <h1>{authorName}</h1>
                    <p>{description}</p>
                </div>
                <AuthorLikeButton
                    active={authorLiked}
                    onClick={() => { }}
                />
            </div>
        </AuthorBannerStyles>
    )
};
export default AuthorBanner
