"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { store, StoreItemDto, StoreActionType } from "@/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { FormField } from "@/components/ui/form-field";

interface GenericPurchaseModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    item: StoreItemDto | null;
}

export const GenericPurchaseModal = ({ isOpen, onOpenChange, item }: GenericPurchaseModalProps) => {
    const t = useTranslations("Store");
    const { refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    const [quantity, setQuantity] = useState(1);
    const [newTitle, setNewTitle] = useState("");

    useEffect(() => {
        if (isOpen && item) {
            if (item.actionType === StoreActionType.PurchaseWithQuantity) {
                setQuantity(item.actionMetadata?.min || 1);
            } else {
                setQuantity(1);
            }
            setNewTitle("");
        }
    }, [isOpen, item]);

    const handleConfirmPurchase = async () => {
        if (!item) return;

        setIsLoading(true);
        try {
            switch (item.actionType) {
                case StoreActionType.PurchaseWithQuantity:
                    await store.purchaseItem(item.id, { quantity });
                    break;
                case StoreActionType.ChangeUsername:
                    await store.purchaseItem(item.id, { params: { newTitle: newTitle.trim() } });
                    break;
                default:
                    console.log(`Purchase action for ${item.actionType} is not implemented.`);
                    break;
            }
            await refreshUser();
            onOpenChange();
        } catch (error) {
            console.error("Purchase failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderModalContent = () => {
        if (!item) return null;

        switch (item.actionType) {
            case StoreActionType.PurchaseWithQuantity:
                return (
                    <div className="mt-4">
                        <FormField
                            type="number"
                            label={t("quantity")}
                            placeholder={t("enterQuantity")}
                            min={item.actionMetadata?.min || 1}
                            max={item.actionMetadata?.max || 100}
                            step={item.actionMetadata?.step || 1}
                            value={String(quantity)}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        />
                    </div>
                );
            case StoreActionType.ChangeUsername:
                return (
                    <div className="mt-4">
                        <FormField
                            type="text"
                            label={t(item.actionMetadata?.inputLabelKey || "newUsername")}
                            placeholder={t(item.actionMetadata?.placeholderKey || "enterNewTitle")}
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                    </div>
                );
            default:
                return null;
        }
    };
    
    const isConfirmDisabled = () => {
        if (isLoading) return true;
        if (item?.actionType === StoreActionType.ChangeUsername) {
            return newTitle.trim() === "";
        }
        return false;
    };

    if (!item) {
        return null;
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t(item.nameKey)}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>{t(item.descriptionKey)}</p>
                    <p><strong>{t("price")}:</strong> {item.price}</p>
                    {renderModalContent()}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onOpenChange} disabled={isLoading}>
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleConfirmPurchase} disabled={isConfirmDisabled()}>
                        {isLoading ? t("purchasing") : t("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};