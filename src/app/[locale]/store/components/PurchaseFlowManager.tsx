"use client";

import { useDisclosure } from "@heroui/react";
import { useState, createContext, useContext, ReactNode } from "react";
import { StoreItemDto } from "@/lib/api";
import { GenericPurchaseModal } from "./GenericPurchaseModal";

interface PurchaseFlowContextType {
    openPurchaseFlow: (item: StoreItemDto) => void;
}

const PurchaseFlowContext = createContext<PurchaseFlowContextType | undefined>(undefined);

export const usePurchaseFlow = () => {
    const context = useContext(PurchaseFlowContext);
    if (!context) {
        throw new Error("usePurchaseFlow must be used within a PurchaseFlowProvider");
    }
    return context;
};

interface PurchaseFlowProviderProps {
    children: ReactNode;
}

export const PurchaseFlowProvider = ({ children }: PurchaseFlowProviderProps) => {
    const [selectedItem, setSelectedItem] = useState<StoreItemDto | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const openPurchaseFlow = (item: StoreItemDto) => {
        setSelectedItem(item);
        onOpen();
    };

    return (
        <PurchaseFlowContext.Provider value={{ openPurchaseFlow }}>
            {children}
            <GenericPurchaseModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                item={selectedItem}
            />
        </PurchaseFlowContext.Provider>
    );
};