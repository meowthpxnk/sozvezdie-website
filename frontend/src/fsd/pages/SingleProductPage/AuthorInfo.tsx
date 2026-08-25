import { AuthorInfoLikeButton } from "@shared/ui/buttons";
import { Author } from "@entities";
import styled from "styled-components";
import { MEDIA_URL } from "@shared/api/interceptors";

const AuthorInfoStyles = styled.div`
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: 52px;
`;

export interface AuthorInfoProps {
    author: Pick<Author, "id" | "name" | "avatarImage">;
    isFavourite: boolean;
    setFavourite: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const AuthorCardButton = styled.div`
    padding: 8px 10px;
    background: var(--product-author-card-bg);
    text-align: left;
    height: 100%;
    border-radius: 8px 0 0 8px;
    flex: 1;
    min-width: 0;
`;

const AuthorAvatar = styled.div`
    flex-shrink: 0;
    background: var(--product-author-avatar-bg);
    color: var(--product-author-avatar-fg);
    --size: 40px;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
    }
`;

const AuthorInfoContent = styled.div`
    min-width: 0;
`;

const AuthorLikeButton = styled.div`
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: stretch;
    background: var(--product-author-like-button-bg);
    color: var(--product-author-like-button-fg);
    border-radius: 0 8px 8px 0;
    overflow: hidden;
`;

export const AuthorInfo = ({ author, isFavourite, setFavourite }: AuthorInfoProps) => {
    const { name, avatarImage } = author;
    return (
        <AuthorInfoStyles className="flex-r ai-c cur-p">
            <AuthorCardButton className="flex-r ai-c indent-list int-8">
                <AuthorAvatar className="image-box size-box b-rad-10 flex-center ov-h">
                    {author.avatarImage ? (
                        <img src={`${MEDIA_URL}/images-bucket/${avatarImage}`} />
                    ) : <h3>{name.slice(0, 1).toUpperCase()}</h3>}
                </AuthorAvatar>
                <AuthorInfoContent className="flex-c ov-h">
                    <span className="span-not-important text-caption">Автор товара</span>
                    <h5 className="truncate fw-600">{name}</h5>
                </AuthorInfoContent>
            </AuthorCardButton>
            <AuthorLikeButton>
                <AuthorInfoLikeButton
                    active={isFavourite}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setFavourite(event);
                    }}
                />
            </AuthorLikeButton>
        </AuthorInfoStyles>
    );
}
