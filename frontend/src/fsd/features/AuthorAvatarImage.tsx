import { Author } from "@entities";
import styled from "styled-components";
import { MEDIA_URL } from "@shared/api/interceptors";

const AuthorAvatarImageStyles = styled.div`
    --size: 44px;
    flex-shrink: 0;
    background: var(--author-mini-card-avatar-bg);
    color: var(--author-mini-card-avatar-fg);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
    }
`;

export interface AuthorAvatarImageProps {
    author: Author;
}

export const AuthorAvatarImage = ({ author }: AuthorAvatarImageProps) => {
    const firstLetter = author.name.slice(0, 1).toUpperCase();
    return <AuthorAvatarImageStyles className="image-box size-box b-rad-12 ov-h flex-c jc-c ai-c">
        {author.avatarImage ? (
            <img src={`${MEDIA_URL}/images-bucket/${author.avatarImage}`} />
        ) : <h3>{firstLetter}</h3>}
    </AuthorAvatarImageStyles>;
}
