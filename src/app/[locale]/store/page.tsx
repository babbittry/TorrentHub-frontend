"use client";

import {
    useDisclosure,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@heroui/react";
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
import { PurchaseCreditModal } from "./components/PurchaseCreditModal";
import { ChangeUsernameModal } from "./components/ChangeUsernameModal";

const StorePage = () => {
    const t = useTranslations("Store");
    const [items, setItems] = useState<StoreItemDto[]>([]);
    const [selectedItem, setSelectedItem] = useState<StoreItemDto | null>(null);

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

    const {
        isOpen: isInfoModalOpen,
        onOpen: onInfoModalOpen,
        onOpenChange: onInfoModalOpenChange
    } = useDisclosure();
    const [infoModalContent, setInfoModalContent] = useState({ title: "", body: "" });

    useEffect(() => {
        store.getItems().then((data) => {
            setItems(data);
        });
    }, []);

    const handlePurchaseClick = (item: StoreItemDto) => {
        setSelectedItem(item);
        // Assuming itemCode 0 is for UploadCredit and 5 is for CustomTitle/Username change
        if (item.itemCode === 0) {
            onCreditModalOpen();
        } else if (item.itemCode === 5) {
            onUsernameModalOpen();
        } else {
            setInfoModalContent({
                title: t("noticeTitle"),
                body: t("unimplementedFlow", { itemName: item.name })
            });
            onInfoModalOpen();
        }
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

            <Modal isOpen={isInfoModalOpen} onOpenChange={onInfoModalOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{infoModalContent.title}</ModalHeader>
                            <ModalBody>
                                <p className="whitespace-pre-wrap">{infoModalContent.body}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={onClose}>
                                    {t("close")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default StorePage;
