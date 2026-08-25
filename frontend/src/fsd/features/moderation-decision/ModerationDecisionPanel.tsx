"use client";

import { useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";

import { useModalBehavior } from "@shared/hooks/useModalBehavior";

import { ModerationRejectModal } from "./ModerationRejectModal";
import { useModerationDecide } from "./useModerationDecide";

const Panel = styled.section`
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
`;

const PanelTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #132647;
`;

const CommentField = styled.textarea`
    min-height: 88px;
    border-radius: 10px;
    border: 1px solid #d7ddea;
    padding: 10px 12px;
    font-size: 14px;
    resize: vertical;
    color: #132647;

    &:focus {
        outline: 2px solid var(--main-color);
        outline-offset: 1px;
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;

const RejectButton = styled.button`
    flex: 1;
    min-width: 140px;
    min-height: 42px;
    border: none;
    border-radius: 10px;
    background: #fff1f0;
    color: #c0392b;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ApproveButton = styled.button`
    flex: 1;
    min-width: 140px;
    min-height: 42px;
    border: none;
    border-radius: 10px;
    background: var(--main-color);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

type ModerationDecisionPanelProps = {
    proposalId: string;
    onBeforeApprove?: () => Promise<boolean | void>;
    approveLabel?: string;
    rejectLabel?: string;
    approvePendingLabel?: string;
};

export function ModerationDecisionPanel({
    proposalId,
    onBeforeApprove,
    approveLabel = "Принять",
    rejectLabel = "Отклонить",
    approvePendingLabel = "Принимаем...",
}: ModerationDecisionPanelProps) {
    const router = useRouter();
    const { deciding, decide } = useModerationDecide();
    const rejectModal = useModalBehavior();
    const [approveComment, setApproveComment] = useState("");

    const isDeletion = proposalId.startsWith("product-delete-");
    const rejectModalTitle = isDeletion ? "Отклонить удаление?" : "Отклонить заявку?";
    const rejectModalDescription = isDeletion
        ? "Укажите причину отказа в удалении — автор увидит комментарий в личном кабинете."
        : "Укажите причину отказа — автор увидит комментарий в личном кабинете.";

    const handleApprove = async () => {
        if (onBeforeApprove) {
            try {
                const canProceed = await onBeforeApprove();
                if (canProceed === false) {
                    return;
                }
            } catch {
                return;
            }
        }

        const success = await decide(
            proposalId,
            "APPROVED",
            approveComment.trim() || undefined
        );
        if (success) {
            router.replace("/moderation");
        }
    };

    const handleReject = async (comment: string) => {
        const success = await decide(proposalId, "REJECTED", comment);
        if (success) {
            rejectModal.close();
            router.replace("/moderation");
        }
    };

    return (
        <>
            <Panel>
                <PanelTitle>Решение по заявке</PanelTitle>
                <CommentField
                    value={approveComment}
                    onChange={(event) => setApproveComment(event.target.value)}
                    placeholder="Комментарий при принятии (необязательно)"
                />
                <Actions>
                    <RejectButton
                        type="button"
                        disabled={deciding}
                        onClick={rejectModal.open}
                    >
                        {rejectLabel}
                    </RejectButton>
                    <ApproveButton
                        type="button"
                        disabled={deciding}
                        onClick={() => void handleApprove()}
                    >
                        {deciding ? approvePendingLabel : approveLabel}
                    </ApproveButton>
                </Actions>
            </Panel>

            <ModerationRejectModal
                isOpen={rejectModal.isOpen}
                title={rejectModalTitle}
                description={rejectModalDescription}
                confirmLabel={rejectLabel}
                submitting={deciding}
                onClose={rejectModal.close}
                onConfirm={handleReject}
            />
        </>
    );
}
