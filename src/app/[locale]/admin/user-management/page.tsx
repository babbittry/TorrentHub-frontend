"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { admin, users, UserProfileDetailDto, UpdateUserAdminDto, UserRole } from '../../../../lib/api';
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { CustomInput } from '../../components/CustomInputs';
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/react";
import { Switch } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Pagination } from "@heroui/pagination";

const UserManagementPage = () => {
    const t = useTranslations('Admin');
    const [userList, setUserList] = useState<UserProfileDetailDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedUser, setSelectedUser] = useState<UserProfileDetailDto | null>(null);
    const [editFormData, setEditFormData] = useState<UpdateUserAdminDto>({});
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await admin.getUsers(page, pageSize, searchTerm);
            setUserList(data.items);
            setTotalCount(data.totalCount);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, page, fetchUsers]);

    const handleEdit = (user: UserProfileDetailDto) => {
        setSelectedUser(user);
        setEditFormData({ role: user.role, isBanned: user.isBanned, banReason: user.banReason });
        onOpen();
    };

    const handleFormChange = (name: string, value: string | boolean | UserRole | null) => {
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;
        try {
            await users.updateUserAdmin(selectedUser.id, editFormData);
            fetchUsers();
            onClose();
        } catch (error) {
            console.error("Failed to update user:", error);
            alert(t('userManagement.alert.updateFailed'));
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('userManagement.title')}</h1>

            <Card>
                <CardHeader>
                    <CustomInput
                        label={t('userManagement.searchLabel')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                    />
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <p>{t('userManagement.loading')}</p>
                    ) : (
                        <Table aria-label="User List">
                            <TableHeader>
                                <TableColumn>{t('userManagement.table.username')}</TableColumn>
                                <TableColumn>{t('userManagement.table.role')}</TableColumn>
                                <TableColumn>{t('userManagement.table.email')}</TableColumn>
                                <TableColumn>{t('userManagement.table.createdAt')}</TableColumn>
                                <TableColumn>{t('userManagement.table.actions')}</TableColumn>
                            </TableHeader>
                            <TableBody items={userList}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.userName}</TableCell>
                                        <TableCell>{item.role}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEdit(item)} size="sm">{t('userManagement.editButton')}</Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
                <CardFooter>
                    <Pagination
                        total={Math.ceil(totalCount / pageSize)}
                        page={page}
                        onChange={setPage}
                    />
                </CardFooter>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>{t('userManagement.modal.title', { username: selectedUser?.userName ?? '' })}</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Select
                                label={t('userManagement.modal.roleLabel')}
                                selectedKeys={editFormData.role ? [editFormData.role] : []}
                                onChange={(e) => handleFormChange('role', e.target.value as UserRole)}
                            >
                                {Object.values(UserRole).map(role => (
                                    <SelectItem key={role}>{role}</SelectItem>
                                ))}
                            </Select>
                            <Switch
                                isSelected={editFormData.isBanned ?? false}
                                onValueChange={(val) => handleFormChange('isBanned', val)}
                            >
                                {t('userManagement.modal.bannedLabel')}
                            </Switch>
                            {editFormData.isBanned && (
                                <CustomInput
                                    label={t('userManagement.modal.banReasonLabel')}
                                    value={editFormData.banReason?.toString() ?? ''}
                                    onChange={(e) => handleFormChange('banReason', e.target.value)}
                                />
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onClick={onClose}>{t('userManagement.modal.cancelButton')}</Button>
                        <Button color="primary" onClick={handleUpdate}>{t('userManagement.modal.saveButton')}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
