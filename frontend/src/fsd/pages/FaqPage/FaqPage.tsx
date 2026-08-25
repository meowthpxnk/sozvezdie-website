"use client";

import { useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { faqService } from "@entities/faq";

const Page = styled.div`
    width: 100%;
    max-width: 760px;
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

const SearchBarWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const SearchIconWrapper = styled(Search)`
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    --size: 18px;
    color: var(--color-text-secondary);
    pointer-events: none;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 42px;
    border-radius: 12px;
    border: 1px solid var(--color-border-secondary, #d7ddea);
    background: var(--color-bg-primary, #fff);
    padding: 0 12px 0 38px;
    font-size: 15px;
    color: var(--color-text-primary, #132647);
    box-sizing: border-box;

    &:focus-visible {
        outline: 2px solid var(--focus-ring-color);
        outline-offset: 1px;
        border-color: var(--main-color, var(--main-color));
    }
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    min-width: 0;
`;

const FaqCard = styled.article`
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e8ecf3;
    overflow: hidden;
    box-sizing: border-box;
`;

const FaqQuestionButton = styled.button<{ $open: boolean }>`
    width: 100%;
    max-width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px;
    border: none;
    background: ${({ $open }) => ($open ? "#f7f9fd" : "#fff")};
    text-align: left;
    font-size: 15px;
    font-weight: 700;
    color: #132647;
    cursor: pointer;
    box-sizing: border-box;
`;

const QuestionText = styled.span`
    flex: 1;
    min-width: 0;
    line-height: 1.4;
    overflow-wrap: anywhere;
    word-break: break-word;
`;

const Chevron = styled.span<{ $open: boolean }>`
    flex-shrink: 0;
    margin-top: 2px;
    transform: rotate(${({ $open }) => ($open ? "180deg" : "0")});
    transition: transform 0.25s ease;
    color: #6b7890;
`;

const AnswerMotion = styled(motion.div)`
    overflow: hidden;
`;

const FaqAnswer = styled.div`
    padding: 14px 18px 18px;
    font-size: 14px;
    line-height: 1.55;
    color: #3d4d66;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 14px;
    color: #6b7890;
`;

function toggleOpenId(openIds: Set<number>, id: number): Set<number> {
    const next = new Set(openIds);
    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }
    return next;
}

export function FaqPage() {
    const [search, setSearch] = useState("");
    const [openIds, setOpenIds] = useState<Set<number>>(() => new Set());
    const trimmedSearch = search.trim();

    const faqQuery = useQuery({
        queryKey: ["faq", trimmedSearch],
        queryFn: () => faqService.getItems(trimmedSearch || undefined),
    });

    const items = faqQuery.data ?? [];

    return (
        <Page>
            <div>
                <Title>Часто задаваемые вопросы</Title>
                <Intro>Ответы на популярные вопросы о заказах, доставке и работе магазина.</Intro>
            </div>

            <SearchBarWrapper>
                <SearchIconWrapper className="size-box pos-a" aria-hidden />
                <SearchInput
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Поиск по вопросам и ответам"
                    aria-label="Поиск по вопросам"
                />
            </SearchBarWrapper>

            {faqQuery.isLoading ? <EmptyState>Загрузка…</EmptyState> : null}
            {faqQuery.isError ? (
                <EmptyState>Не удалось загрузить вопросы. Попробуйте позже.</EmptyState>
            ) : null}

            {!faqQuery.isLoading && !faqQuery.isError && items.length === 0 ? (
                <EmptyState>
                    {trimmedSearch
                        ? "По вашему запросу ничего не найдено."
                        : "Пока нет опубликованных вопросов."}
                </EmptyState>
            ) : null}

            <List>
                {items.map((item) => {
                    const isOpen = openIds.has(item.id);

                    return (
                        <FaqCard key={item.id}>
                            <FaqQuestionButton
                                type="button"
                                $open={isOpen}
                                aria-expanded={isOpen}
                                onClick={() => setOpenIds((prev) => toggleOpenId(prev, item.id))}
                            >
                                <QuestionText>{item.question}</QuestionText>
                                <Chevron $open={isOpen} aria-hidden>
                                    ▾
                                </Chevron>
                            </FaqQuestionButton>
                            <AnimatePresence initial={false}>
                                {isOpen ? (
                                    <AnswerMotion
                                        key="answer"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                        <FaqAnswer>{item.answer}</FaqAnswer>
                                    </AnswerMotion>
                                ) : null}
                            </AnimatePresence>
                        </FaqCard>
                    );
                })}
            </List>
        </Page>
    );
}
