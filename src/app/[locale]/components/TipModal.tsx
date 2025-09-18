'use client';

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useTranslations } from 'next-intl';
import { coins, TipCoinsRequestDto } from '@/lib/api';
import { AxiosError } from 'axios';

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: number;
    recipientName: string;
    contextType: 'Torrent' | 'Comment' | 'ForumPost';
    contextId: number;
}

const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, recipientId, recipientName, contextType, contextId }) => {
    const t = useTranslations();
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) {
            setError(t('TipModal.error_invalid_amount'));
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const tipData: TipCoinsRequestDto = {
                toUserId: recipientId,
                amount: Number(amount),
                contextType,
                contextId,
            };
            await coins.tip(tipData);
            setSuccess(t('TipModal.success_message'));
            setTimeout(() => {
                onClose();
                setSuccess(null);
            }, 2000);
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || t('TipModal.error_generic'));
            } else {
                setError(t('TipModal.error_generic'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>{t('TipModal.title', { username: recipientName })}</ModalHeader>
                <ModalBody>
                    {error && <p className="text-danger text-sm mb-4">{error}</p>}
                    {success && <p className="text-success text-sm mb-4">{success}</p>}
                    <Input
                        type="number"
                        label={t('TipModal.amount_label')}
                        placeholder={t('TipModal.amount_placeholder')}
                        value={amount}
                        onValueChange={setAmount}
                        isRequired
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button color="primary" onClick={handleSubmit} isLoading={isSubmitting}>
                        {t('TipModal.submit_button')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TipModal;