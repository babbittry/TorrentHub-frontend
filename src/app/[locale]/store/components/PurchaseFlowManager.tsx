"use client";

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
    const [isOpen, setIsOpen] = useState(false);

    const openPurchaseFlow = (item: StoreItemDto) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    return (
        <PurchaseFlowContext.Provider value={{ openPurchaseFlow }}>
            {children}
            <GenericPurchaseModal
                isOpen={isOpen}
                onOpenChange={() => setIsOpen(false)}
                item={selectedItem}
            />
        </PurchaseFlowContext.Provider>
    );
};