"use client";

import styled from "styled-components";

const Page = styled.div`
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-sizing: border-box;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 28px;
    color: var(--title-color);
`;

const Intro = styled.p`
    margin: 0;
    padding-top: 10px;
    font-size: 15px;
    line-height: 1.5;
    color: #6b7890;
`;

const Card = styled.section`
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e8ecf3;
    overflow: hidden;
`;

const DetailsList = styled.dl`
    margin: 0;
`;

const DetailRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 180px) minmax(0, 1fr);
    gap: 12px 20px;
    padding: 16px 18px;
    border-top: 1px solid #eef2f7;

    &:first-child {
        border-top: none;
    }

    @media (max-width: 560px) {
        grid-template-columns: 1fr;
        gap: 6px;
    }
`;

const DetailTerm = styled.dt`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #6b7890;
`;

const DetailValue = styled.dd`
    margin: 0;
    font-size: 15px;
    line-height: 1.45;
    color: #132647;
    overflow-wrap: anywhere;
`;

const PhoneLink = styled.a`
    color: inherit;
    text-decoration: none;

    &:hover {
        color: var(--main-color);
    }
`;

const LEGAL_DETAILS = [
    {
        label: "ОГРН ИП",
        value: "325784700247730 от 31 июля 2025 г.",
    },
    {
        label: "ИНН",
        value: "784810810628",
    },
    {
        label: "Дата регистрации",
        value: "31.07.2025",
    },
    {
        label: "Номер телефона ИП",
        value: "+7 (911) 243-17-50",
        href: "tel:+79112431750",
    },
] as const;

export function LegalDetailsPage() {
    return (
        <Page>
            <div>
                <Title>Реквизиты</Title>
                <Intro>Юридическая информация об индивидуальном предпринимателе.</Intro>
            </div>

            <Card>
                <DetailsList>
                    {LEGAL_DETAILS.map((item) => (
                        <DetailRow key={item.label}>
                            <DetailTerm>{item.label}</DetailTerm>
                            <DetailValue>
                                {"href" in item ? (
                                    <PhoneLink href={item.href}>{item.value}</PhoneLink>
                                ) : (
                                    item.value
                                )}
                            </DetailValue>
                        </DetailRow>
                    ))}
                </DetailsList>
            </Card>
        </Page>
    );
}
