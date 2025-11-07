'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { coins, TipCoinsRequestDto } from '@/lib/api';
import { AxiosError } from 'axios';
import { FormField } from '@/components/ui/form-field';

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
            if (err instanceof AxiosError && err.response?.data?.message) {
                const errorKey = err.response.data.message;
                const translatedError = t(errorKey, { defaultValue: t('TipModal.error_generic') });
                setError(translatedError);
            } else {
                setError(t('TipModal.error_generic'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('TipModal.title', { username: recipientName })}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}
                    <FormField
                        type="number"
                        label={t('TipModal.amount_label')}
                        placeholder={t('TipModal.amount_placeholder')}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? t('common.loading') : t('TipModal.submit_button')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TipModal;