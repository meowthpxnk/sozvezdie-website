import styled from "styled-components";

const LOGO_URL =
    "https://sun9-14.userapi.com/s/v1/ig2/KRXsD93W8ra--rTg_L551ufuXBXWb1TS_bD6rCoL2aW7X-XzXFQJs5Bw3DuYDdaDLG-jOZfXNHtegXbqvD0JGIUk.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,1800x1800&from=bu&u=8XzLHtuQpgaanLRFnQgF5Acw-nLq12ZuwuXSl-agoNk&cs=1280x0";

const LogoStyles = styled.div`
    --size: 60px;
    border-radius: 9999px;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
    }

    @media (max-width: 639px) {
        --size: 44px;
    }
`;

export const Logo = () => {
    return (
        <LogoStyles className="cur-p min-size-box size-box">
            <img src={LOGO_URL} alt="Логотип" />
        </LogoStyles>
    );
};

export default Logo;
