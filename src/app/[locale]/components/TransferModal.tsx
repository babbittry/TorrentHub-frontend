'use client';

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { useTranslations } from 'next-intl';
import { coins } from '@/lib/api';
import { AxiosError } from 'axios';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: number;
    recipientName: string;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, recipientId, recipientName }) => {
    const t = useTranslations();
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) {
            setError(t('TransferModal.error_invalid_amount'));
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await coins.transfer({
                toUserId: recipientId,
                amount: Number(amount),
                notes: notes,
            });
            setSuccess(t('TransferModal.success_message'));
            setTimeout(() => {
                onClose();
                setSuccess(null);
            }, 2000);
        } catch (err) {
            if (err instanceof AxiosError) {
                const errorKey = err.response?.data?.message;
                if (errorKey) {
                    const translated = t(errorKey);
                    setError(translated !== errorKey ? translated : t('TransferModal.error_generic'));
                } else {
                    setError(t('TransferModal.error_generic'));
                }
            } else {
                setError(t('TransferModal.error_generic'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>{t('TransferModal.title', { username: recipientName })}</ModalHeader>
                <ModalBody>
                    {error && <p className="text-danger text-sm mb-4">{error}</p>}
                    {success && <p className="text-success text-sm mb-4">{success}</p>}
                    <Input
                        type="number"
                        label={t('TransferModal.amount_label')}
                        placeholder={t('TransferModal.amount_placeholder')}
                        value={amount}
                        onValueChange={setAmount}
                        isRequired
                    />
                    <Textarea
                        label={t('TransferModal.notes_label')}
                        placeholder={t('TransferModal.notes_placeholder')}
                        value={notes}
                        onValueChange={setNotes}
                        maxLength={200}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button color="primary" onClick={handleSubmit} isLoading={isSubmitting}>
                        {t('TransferModal.submit_button')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TransferModal;