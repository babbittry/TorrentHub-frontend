"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { store, StoreItemDto, StoreActionType } from "@/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

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
            toast.success(t("purchase_success"));
            onOpenChange();
        } catch (error: any) {
            console.error("Purchase failed", error);
            
            // 映射后端错误消息到翻译键
            let errorKey = "error_unknown";
            // callApi 包装器会将错误消息放在 error.message 中
            const apiMessage = error?.message || "";
            
            // 根据后端返回的11种错误消息映射到对应的翻译键
            if (apiMessage.includes("Item not found or is unavailable")) {
                errorKey = "error_item_not_found";
            } else if (apiMessage.includes("Insufficient Coins")) {
                errorKey = "error_insufficient_coins";
            } else if (apiMessage.includes("Badges can only be purchased one at a time")) {
                errorKey = "error_badge_single_purchase";
            } else if (apiMessage.includes("Invalid badge item configuration")) {
                errorKey = "error_invalid_badge_config";
            } else if (apiMessage.includes("You already own this badge")) {
                errorKey = "error_badge_already_owned";
            } else if (apiMessage.includes("New username must be provided")) {
                errorKey = "error_username_required";
            } else if (apiMessage.includes("This username is already taken")) {
                errorKey = "error_username_taken";
            } else if (apiMessage.includes("New title must be provided")) {
                errorKey = "error_title_required";
            } else if (apiMessage.includes("Title is too long")) {
                errorKey = "error_title_too_long";
            } else if (apiMessage.includes("unexpected error") || apiMessage.includes("rolled back")) {
                errorKey = "error_transaction_failed";
            }
            
            toast.error(t("purchase_failed"), {
                description: t(errorKey)
            });
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