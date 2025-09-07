"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { store, StoreItemDto, StoreActionType } from "@/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';

interface GenericPurchaseModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    item: StoreItemDto | null;
}

export const GenericPurchaseModal = ({ isOpen, onOpenChange, item }: GenericPurchaseModalProps) => {
    const t = useTranslations("Store");
    const { refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    // State for different action types
    const [quantity, setQuantity] = useState(1);
    const [newUsername, setNewUsername] = useState("");

    // Reset state when a new item is selected or modal is closed
    useEffect(() => {
        if (isOpen && item) {
            // Reset quantity state
            if (item.actionType === StoreActionType.PurchaseWithQuantity) {
                setQuantity(item.actionMetadata?.min || 1);
            } else {
                setQuantity(1);
            }
            // Reset username state
            setNewUsername("");
        }
    }, [isOpen, item]);


    const handleConfirmPurchase = async () => {
        if (!item) return;

        setIsLoading(true);
        try {
            switch (item.actionType) {
                case StoreActionType.PurchaseWithQuantity:
                    await store.purchaseItem(item.id, { quantity });
                    // TODO: Show success notification
                    break;
                case StoreActionType.ChangeUsername:
                    await store.purchaseItem(item.id, { params: { newUsername: newUsername.trim() } });
                     // TODO: Show success notification and update user context
                    break;
                default:
                    console.log(`Purchase action for ${item.actionType} is not implemented.`);
                    // TODO: Show a generic "not implemented" message
                    break;
            }
            await refreshUser(); // Refresh user data to update coin balance, etc.
            onOpenChange(); // Close modal on success
        } catch (error) {
            console.error("Purchase failed", error);
            // TODO: Show error notification
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
                        <Input
                            type="number"
                            label={t("quantity")}
                            placeholder={t("enterQuantity")}
                            min={String(item.actionMetadata?.min || 1)}
                            max={String(item.actionMetadata?.max || 100)}
                            step={String(item.actionMetadata?.step || 1)}
                            value={String(quantity)}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        />
                    </div>
                );
            case StoreActionType.ChangeUsername:
                 return (
                    <div className="mt-4">
                        <Input
                            type="text"
                            label={t(item.actionMetadata?.inputLabelKey || "newUsername")}
                            placeholder={t(item.actionMetadata?.placeholderKey || "enterNewUsername")}
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
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
            return newUsername.trim() === "";
        }
        return false;
    };

    if (!item) {
        return null;
    }
    
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {t(item.nameKey)}
                        </ModalHeader>
                        <ModalBody>
                            <p>{t(item.descriptionKey)}</p>
                            <p><strong>{t("price")}:</strong> {item.price}</p>
                            {renderModalContent()}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose} disabled={isLoading}>
                                {t("cancel")}
                            </Button>
                            <Button color="primary" onPress={handleConfirmPurchase} disabled={isConfirmDisabled()}>
                                {isLoading ? t("purchasing") : t("confirm")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};