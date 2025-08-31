"use client";

import { useDisclosure, Button } from "@heroui/react";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@heroui/table";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/apiClient";
import { useTranslations } from "next-intl";
import { PurchaseCreditModal } from "./components/PurchaseCreditModal";
import { ChangeUsernameModal } from "./components/ChangeUsernameModal";

interface StoreItem {
    id: number;
    itemCode: number;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    badgeId: number | null;
}

const StorePage = () => {
    const t = useTranslations("Store");
    const [items, setItems] = useState<StoreItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

    const {
        isOpen: isCreditModalOpen,
        onOpen: onCreditModalOpen,
        onOpenChange: onCreditModalOpenChange
    } = useDisclosure();
    
    const {
        isOpen: isUsernameModalOpen,
        onOpen: onUsernameModalOpen,
        onOpenChange: onUsernameModalOpenChange
    } = useDisclosure();

    useEffect(() => {
        fetchApi<StoreItem[]>("/api/store/items").then((data) => {
            setItems(data);
        });
    }, []);

    const handlePurchaseClick = (item: StoreItem) => {
        setSelectedItem(item);
        // Assuming itemCode 0 is for UploadCredit and 5 is for CustomTitle/Username change
        if (item.itemCode === 0) {
            onCreditModalOpen();
        } else if (item.itemCode === 5) {
            onUsernameModalOpen();
        } else {
            // Fallback for other items, maybe a simple confirm?
            // For now, we can just log it.
            console.log("Purchase clicked for item:", item);
            alert(`Item: ${item.name}\nThis item has a different purchase flow not yet implemented.`);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
            <Table aria-label="Store items table">
                <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>{t("name")}</TableColumn>
                    <TableColumn>{t("description")}</TableColumn>
                    <TableColumn>{t("price")}</TableColumn>
                    <TableColumn>{t("actions")}</TableColumn>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.price}</TableCell>
                            <TableCell>
                                <Button color="primary" onClick={() => handlePurchaseClick(item)} disabled={!item.isAvailable}>
                                    {t("purchase")}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <PurchaseCreditModal
                isOpen={isCreditModalOpen}
                onOpenChange={onCreditModalOpenChange}
                item={selectedItem}
            />

            <ChangeUsernameModal
                isOpen={isUsernameModalOpen}
                onOpenChange={onUsernameModalOpenChange}
                item={selectedItem}
            />
        </div>
    );
};

export default StorePage;
