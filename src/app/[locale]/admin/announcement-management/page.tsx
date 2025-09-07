"use client";
import React, { useEffect, useState } from 'react';
import { announcements, AnnouncementDto, CreateAnnouncementRequestDto, UpdateAnnouncementDto } from '../../../../lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { CustomInput, CustomTextarea } from '../../components/CustomInputs';
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

const AnnouncementManagementPage = () => {
    const t = useTranslations('Admin');
    const [allAnnouncements, setAllAnnouncements] = useState<AnnouncementDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementDto | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sendToInbox, setSendToInbox] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await announcements.getAnnouncements();
            setAllAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleEdit = (announcement: AnnouncementDto) => {
        setEditingAnnouncement(announcement);
        setTitle(announcement.title);
        setContent(announcement.content);
        setSendToInbox(false); // Not available for edit
        setIsCreatingNew(false);
    };

    const handleCreateNew = () => {
        setEditingAnnouncement(null);
        setTitle('');
        setContent('');
        setSendToInbox(false);
        setIsCreatingNew(true);
    };

    const handleCancel = () => {
        setEditingAnnouncement(null);
        setIsCreatingNew(false);
        setTitle('');
        setContent('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert(t('announcementManagement.alert.empty'));
            return;
        }

        try {
            if (isCreatingNew) {
                const createDto: CreateAnnouncementRequestDto = { title, content, sendToInbox };
                await announcements.createAnnouncement(createDto);
            } else if (editingAnnouncement) {
                const updateDto: UpdateAnnouncementDto = { title, content };
                await announcements.updateAnnouncement(editingAnnouncement.id, updateDto);
            }
            fetchAnnouncements();
            handleCancel();
        } catch (error) {
            console.error("Failed to save announcement:", error);
            alert(t('announcementManagement.alert.saveFailed'));
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(t('announcementManagement.alert.deleteConfirm'))) {
            try {
                await announcements.deleteAnnouncement(id);
                fetchAnnouncements();
            } catch (error) {
                console.error('Failed to delete announcement:', error);
                alert(t('announcementManagement.alert.deleteFailed'));
            }
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('announcementManagement.title')}</h1>

            {(isCreatingNew || editingAnnouncement) && (
                <Card>
                    <CardHeader>{isCreatingNew ? t('announcementManagement.createNew') : t('announcementManagement.edit')}</CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title">{t('announcementManagement.form.titleLabel')}</label>
                                <CustomInput id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} fullWidth maxLength={100} />
                            </div>
                            <div>
                                <label htmlFor="content">{t('announcementManagement.form.contentLabel')}</label>
                                <CustomTextarea id="content" value={content} onChange={e => setContent(e.target.value)} fullWidth maxLength={500} />
                            </div>
                            {isCreatingNew && (
                                <div>
                                    <Checkbox isSelected={sendToInbox} onValueChange={setSendToInbox}>
                                        {t('announcementManagement.form.sendToInbox')}
                                    </Checkbox>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2">
                                <Button onClick={handleCancel} variant="flat">{t('announcementManagement.form.cancelButton')}</Button>
                                <Button type="submit" color="primary">{isCreatingNew ? t('announcementManagement.form.createButton') : t('announcementManagement.form.updateButton')}</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            <Card>
                <CardHeader className="flex justify-between items-center">
                    <span>{t('announcementManagement.existingAnnouncements')}</span>
                    {!isCreatingNew && !editingAnnouncement && (
                         <Button onClick={handleCreateNew} color="primary" startContent={<FontAwesomeIcon icon={faPlus} />}>
                            {t('announcementManagement.createNew')}
                        </Button>
                    )}
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <p>{t('announcementManagement.loading')}</p>
                    ) : (
                        <Table aria-label={t('announcementManagement.existingAnnouncements')}>
                            <TableHeader>
                                <TableColumn>{t('announcementManagement.table.title')}</TableColumn>
                                <TableColumn>{t('announcementManagement.table.createdAt')}</TableColumn>
                                <TableColumn>{t('announcementManagement.table.actions')}</TableColumn>
                            </TableHeader>
                            <TableBody items={allAnnouncements}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                        <TableCell className="flex space-x-2">
                                            <Button isIconOnly onClick={() => handleEdit(item)} color="default" variant="light">
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button isIconOnly onClick={() => handleDelete(item.id)} color="danger" variant="light">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default AnnouncementManagementPage;