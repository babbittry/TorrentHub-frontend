"use client";
import React, { useEffect, useState } from 'react';
import { announcements, AnnouncementDto, CreateAnnouncementRequestDto, UpdateAnnouncementDto } from '../../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
                    <CardHeader>
                        <CardTitle>{isCreatingNew ? t('announcementManagement.createNew') : t('announcementManagement.edit')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">{t('announcementManagement.form.titleLabel')}</Label>
                                <Input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">{t('announcementManagement.form.contentLabel')}</Label>
                                <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} maxLength={500} />
                            </div>
                            {isCreatingNew && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sendToInbox" checked={sendToInbox} onCheckedChange={(checked) => setSendToInbox(checked === true)} />
                                    <Label htmlFor="sendToInbox" className="cursor-pointer">
                                        {t('announcementManagement.form.sendToInbox')}
                                    </Label>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2">
                                <Button type="button" onClick={handleCancel} variant="outline">{t('announcementManagement.form.cancelButton')}</Button>
                                <Button type="submit">{isCreatingNew ? t('announcementManagement.form.createButton') : t('announcementManagement.form.updateButton')}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>{t('announcementManagement.existingAnnouncements')}</CardTitle>
                    {!isCreatingNew && !editingAnnouncement && (
                        <Button onClick={handleCreateNew}>
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            {t('announcementManagement.createNew')}
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>{t('announcementManagement.loading')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('announcementManagement.table.title')}</TableHead>
                                    <TableHead>{t('announcementManagement.table.createdAt')}</TableHead>
                                    <TableHead>{t('announcementManagement.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allAnnouncements.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                        <TableCell className="flex space-x-2">
                                            <Button size="icon" onClick={() => handleEdit(item)} variant="ghost">
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button size="icon" onClick={() => handleDelete(item.id)} variant="ghost">
                                                <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AnnouncementManagementPage;