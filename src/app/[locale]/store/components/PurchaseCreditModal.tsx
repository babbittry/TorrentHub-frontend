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
import { useState } from "react";
import { useTranslations } from "next-intl";
import { fetchApi } from "@/lib/apiClient";

interface StoreItem {
    id: number;
    itemCode: number;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    badgeId: number | null;
}

interface PurchaseCreditModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    item: StoreItem | null;
}

export const PurchaseCreditModal = ({ isOpen, onOpenChange, item }: PurchaseCreditModalProps) => {
    const t = useTranslations("Store");
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmPurchase = () => {
        if (!item) return;

        setIsLoading(true);
        fetchApi("/api/store/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                storeItemId: item.id,
                quantity: quantity,
            }),
        })
        .then(() => {
            // TODO: Show success notification
            onOpenChange();
        })
        .catch((error) => {
            // TODO: Show error notification
            console.error(error);
        })
        .finally(() => {
            setIsLoading(false);
        });
    };
    
    if (!item) return null;

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t("confirmPurchase")}</ModalHeader>
                        <ModalBody>
                            <p><strong>{t("name")}:</strong> {item.name}</p>
                            <p><strong>{t("description")}:</strong> {item.description}</p>
                            <p><strong>{t("price")}:</strong> {item.price}</p>
                            <div className="mt-4">
                                <Input
                                    type="number"
                                    label={t("quantity")}
                                    placeholder="Enter quantity"
                                    min="1"
                                    value={String(quantity)}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                {t("cancel")}
                            </Button>
                            <Button color="primary" onPress={handleConfirmPurchase} disabled={isLoading}>
                                {isLoading ? t("purchasing") : t("confirm")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};