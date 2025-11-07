'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { coins } from '@/lib/api';
import { AxiosError } from 'axios';
import { FormField } from '@/components/ui/form-field';

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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('TransferModal.title', { username: recipientName })}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}
                    <FormField
                        type="number"
                        label={t('TransferModal.amount_label')}
                        placeholder={t('TransferModal.amount_placeholder')}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('TransferModal.notes_label')}</label>
                        <Textarea
                            placeholder={t('TransferModal.notes_placeholder')}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={200}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? t('common.loading') : t('TransferModal.submit_button')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TransferModal;