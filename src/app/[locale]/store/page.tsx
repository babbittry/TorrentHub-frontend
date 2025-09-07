"use client";

import { Button } from "@heroui/react";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@heroui/table";
import { useEffect, useState } from "react";
import { store, StoreItemDto } from "@/lib/api";
import { useTranslations } from "next-intl";
import { PurchaseFlowProvider, usePurchaseFlow } from "./components/PurchaseFlowManager";

const StoreContent = () => {
    const t = useTranslations("Store");
    const [items, setItems] = useState<StoreItemDto[]>([]);
    const { openPurchaseFlow } = usePurchaseFlow();

    useEffect(() => {
        store.getItems().then((data) => {
            setItems(data || []);
        });
    }, []);

    const handlePurchaseClick = (item: StoreItemDto) => {
        openPurchaseFlow(item);
    };

    return (
        <div className="container mx-auto p-4">
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
                            <TableCell>{t(item.nameKey)}</TableCell>
                            <TableCell>{t(item.descriptionKey)}</TableCell>
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
        </div>
    );
};

const StorePage = () => {
    return (
        <PurchaseFlowProvider>
            <StoreContent />
        </PurchaseFlowProvider>
    );
};

export default StorePage;
