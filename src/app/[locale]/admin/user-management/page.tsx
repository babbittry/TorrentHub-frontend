"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { admin, users, UserAdminProfileDto, UpdateUserAdminDto, UserRole, BanStatus } from '@/lib/api';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';

const UserManagementPage = () => {
    const t = useTranslations('Admin');
    const [userList, setUserList] = useState<UserAdminProfileDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedUser, setSelectedUser] = useState<UserAdminProfileDto | null>(null);
    const [editFormData, setEditFormData] = useState<UpdateUserAdminDto>({});
    const [isOpen, setIsOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await admin.getUsers(page, pageSize, searchTerm);
            setUserList(data?.items || []);
            setTotalCount(data?.totalItems || 0);
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

    const handleEdit = (user: UserAdminProfileDto) => {
        setSelectedUser(user);
        setEditFormData({ role: user.role, banStatus: user.banStatus, banReason: user.banReason });
        setIsOpen(true);
    };

    const handleFormChange = (name: string, value: string | boolean | UserRole | null | BanStatus) => {
        if (name === 'banStatus') {
            const isBanned = value as boolean;
            setEditFormData(prev => ({
                ...prev,
                banStatus: isBanned ? 1 : 0,
                banReason: isBanned ? prev.banReason : null,
            }));
        } else {
            setEditFormData(prev => ({ ...prev, [name]: value as string | UserRole | null }));
        }
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;
        try {
            await users.updateUserAdmin(selectedUser.id, editFormData);
            fetchUsers();
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update user:", error);
            alert(t('userManagement.alert.updateFailed'));
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('userManagement.title')}</h1>

            <Card>
                <CardHeader>
                    <FormField
                        label={t('userManagement.searchLabel')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>{t('userManagement.loading')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('userManagement.table.username')}</TableHead>
                                    <TableHead>{t('userManagement.table.role')}</TableHead>
                                    <TableHead>{t('userManagement.table.email')}</TableHead>
                                    <TableHead>{t('userManagement.table.createdAt')}</TableHead>
                                    <TableHead>{t('userManagement.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userList.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.userName}</TableCell>
                                        <TableCell>{item.role}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEdit(item)} size="sm">{t('userManagement.editButton')}</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <CardFooter className="justify-center pt-6">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); if (page > 1) setPage(p => p - 1); }}
                                    aria-disabled={page === 1}
                                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pageNumber = i + 1;
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); setPage(pageNumber); }}
                                            isActive={page === pageNumber}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(p => p + 1); }}
                                    aria-disabled={page === totalPages}
                                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('userManagement.modal.title', { username: selectedUser?.userName ?? '' })}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('userManagement.modal.roleLabel')}</Label>
                            <Select
                                value={editFormData.role ?? 'none'}
                                onValueChange={(value) => handleFormChange('role', value === 'none' ? null : value as UserRole)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t('userManagement.modal.selectRole')}</SelectItem>
                                    {Object.values(UserRole).map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={!!editFormData.banStatus && editFormData.banStatus > 0}
                                onCheckedChange={(val: boolean) => handleFormChange('banStatus', val)}
                            />
                            <Label>{t('userManagement.modal.bannedLabel')}</Label>
                        </div>
                        {!!editFormData.banStatus && editFormData.banStatus > 0 && (
                            <FormField
                                label={t('userManagement.modal.banReasonLabel')}
                                value={editFormData.banReason?.toString() ?? ''}
                                onChange={(e) => handleFormChange('banReason', e.target.value)}
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>{t('userManagement.modal.cancelButton')}</Button>
                        <Button onClick={handleUpdate}>{t('userManagement.modal.saveButton')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagementPage;
