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

interface ChangeUsernameModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    item: StoreItem | null;
}

export const ChangeUsernameModal = ({ isOpen, onOpenChange, item }: ChangeUsernameModalProps) => {
    const t = useTranslations("Store");
    const [newUsername, setNewUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmPurchase = () => {
        if (!item || !newUsername.trim()) return;

        setIsLoading(true);
        // NOTE: This assumes a different endpoint or a different payload structure
        // for changing the username. This needs to be coordinated with the backend.
        // For now, we'll call the standard purchase endpoint.
        fetchApi("/api/store/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                storeItemId: item.id,
                // The backend will need to handle this extra payload data
                newUsername: newUsername.trim(),
            }),
        })
        .then(() => {
            // TODO: Show success notification and possibly update user state
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
                        <ModalHeader className="flex flex-col gap-1">{item.name}</ModalHeader>
                        <ModalBody>
                            <p>{item.description}</p>
                            <p><strong>{t("price")}:</strong> {item.price}</p>
                            <div className="mt-4">
                                <Input
                                    type="text"
                                    label={t("newUsername")}
                                    placeholder={t("enterNewUsername")}
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                {t("cancel")}
                            </Button>
                            <Button color="primary" onPress={handleConfirmPurchase} disabled={isLoading || !newUsername.trim()}>
                                {isLoading ? t("purchasing") : t("confirm")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};