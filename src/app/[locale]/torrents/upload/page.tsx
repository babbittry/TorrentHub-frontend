'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Progress,
    Input,
    Select,
    SelectItem,
    Alert,
} from '@heroui/react';
import { CustomInput, CustomTextarea } from '@/app/[locale]/components/CustomInputs';
import { TorrentCategory, TorrentCategoryDto, torrents } from '@/lib/api';
import { AxiosError } from 'axios';

interface TorrentFileInfo {
    name: string;
    size: number;
    files?: Array<{ name: string; size: number }>;
}

interface FormData {
    torrentFile: File | null;
    description: string;
    category: string;
    imdbId: string;
}

interface FormErrors {
    torrentFile?: string;
    description?: string;
    category?: string;
    imdbId?: string;
}

export default function TorrentUploadPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    // Form state
    const [formData, setFormData] = useState<FormData>({
        torrentFile: null,
        description: '',
        category: '',
        imdbId: '',
    });

    const [torrentInfo, setTorrentInfo] = useState<TorrentFileInfo | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [categories, setCategories] = useState<TorrentCategoryDto[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesList = await torrents.getCategories();
                setCategories(categoriesList);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                // Fallback to enum-based categories if API fails
                const fallbackCategories = Object.entries(TorrentCategory)
                    .filter(([key]) => isNaN(Number(key)))
                    .map(([key, value]) => ({
                        id: value as number,
                        name: key,
                        key: key.toLowerCase(),
                    }));
                setCategories(fallbackCategories);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.torrentFile) {
            newErrors.torrentFile = t('torrentUpload.error_no_file');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('torrentUpload.error_description_required');
        } else if (formData.description.length > 4096) {
            newErrors.description = `${t('torrentUpload.error_description_required')} (Max 4096 chars)`;
        }

        if (!formData.category) {
            newErrors.category = t('torrentUpload.error_category_required');
        }

        if (formData.imdbId && !/^tt\d{7,8}$/.test(formData.imdbId)) {
            newErrors.imdbId = 'IMDB ID must be in format tt1234567';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileSelect = (file: File) => {
        if (!file.name.endsWith('.torrent')) {
            setErrors({ torrentFile: t('torrentUpload.error_invalid_file') });
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            setErrors({ torrentFile: t('torrentUpload.error_file_too_large') });
            return;
        }

        setFormData({ ...formData, torrentFile: file });
        setErrors({ ...errors, torrentFile: undefined });

        // Parse torrent file info
        parseTorrentFile(file);
    };

    const parseTorrentFile = async (file: File) => {
        try {
            const buffer = await file.arrayBuffer();
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(buffer);

            // Extract filename from torrent (basic parsing)
            const nameMatch = text.match(/name(\d+):/);
            const info: TorrentFileInfo = {
                name: file.name,
                size: file.size,
            };

            setTorrentInfo(info);
        } catch (err) {
            console.error('Failed to parse torrent file:', err);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!formData.torrentFile) {
            setErrorMessage(t('torrentUpload.error_no_file'));
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await torrents.uploadTorrent(
                formData.torrentFile,
                formData.description,
                formData.category,
                formData.imdbId,
                (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round(
                            (progressEvent.loaded / progressEvent.total) * 100
                        );
                        setUploadProgress(progress);
                    }
                }
            );

            setSuccessMessage(t('torrentUpload.uploadSuccess'));

            // Redirect to torrent details page after 2 seconds
            setTimeout(() => {
                router.push(`/${locale}/torrents/${response.id}`);
            }, 2000);
        } catch (err) {
            const axiosError = err as AxiosError<{
                errors?: Record<string, string[]>;
                error?: string;
            }>;
            const errorData = axiosError.response?.data;

            if (errorData?.errors) {
                const firstError = Object.values(errorData.errors)[0];
                setErrorMessage(Array.isArray(firstError) ? firstError[0] : String(firstError));
            } else if (errorData?.error) {
                setErrorMessage(errorData.error);
            } else {
                setErrorMessage(t('torrentUpload.uploadFailed'));
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader className="flex flex-col items-start gap-2 pb-6">
                    <h1 className="text-2xl font-bold">{t('torrentUpload.title')}</h1>
                    <p className="text-default-500">{t('torrentUpload.description')}</p>
                </CardHeader>
                <CardBody>
                    {successMessage && (
                        <Alert color="success" className="mb-4">
                            {successMessage}
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert color="danger" className="mb-4">
                            {errorMessage}
                        </Alert>
                    )}

                    <form onSubmit={handleUpload}>
                        {/* File Upload Area */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                {t('torrentUpload.selectFile')} <span className="text-danger">*</span>
                            </label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${isDragging
                                        ? 'border-primary bg-primary-50'
                                        : 'border-default-300 hover:border-primary'
                                    } ${errors.torrentFile ? 'border-danger' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".torrent"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleFileSelect(e.target.files[0]);
                                        }
                                    }}
                                    disabled={isUploading}
                                    className="hidden"
                                />

                                {formData.torrentFile ? (
                                    <div>
                                        <p className="text-success font-medium">{t('torrentUpload.fileSelected')}</p>
                                        <p className="text-default-500 text-sm mt-2">
                                            {formData.torrentFile.name}
                                        </p>
                                        <p className="text-default-400 text-xs">
                                            {(formData.torrentFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-default-700 font-medium">
                                            {t('torrentUpload.dragDropHint')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {errors.torrentFile && (
                                <p className="text-danger text-sm mt-2">{errors.torrentFile}</p>
                            )}
                        </div>

                        {/* Torrent Info Preview */}
                        {torrentInfo && (
                            <div className="mb-6 p-4 bg-default-100 rounded-lg">
                                <h3 className="font-medium mb-2">{t('torrentUpload.torrentInfo')}</h3>
                                <p className="text-sm text-default-600">
                                    <span className="font-medium">{t('torrentUpload.fileName')}:</span>{' '}
                                    {torrentInfo.name}
                                </p>
                                <p className="text-sm text-default-600">
                                    <span className="font-medium">{t('torrentUpload.fileSize')}:</span>{' '}
                                    {(torrentInfo.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}

                        {/* Description Field */}
                        <div className="mb-6">
                            <CustomTextarea
                                label={t('torrentUpload.description_label')}
                                placeholder={t('torrentUpload.description_placeholder')}
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData({ ...formData, description: e.target.value });
                                    if (errors.description) {
                                        setErrors({ ...errors, description: undefined });
                                    }
                                }}
                                maxLength={4096}
                                minRows={4}
                                isInvalid={!!errors.description}
                                errorMessage={errors.description}
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="mb-6">
                            <Select
                                label={t('torrentUpload.category_label')}
                                placeholder={t('torrentUpload.category_placeholder')}
                                selectedKeys={formData.category ? [formData.category] : new Set()}
                                onChange={(e) => {
                                    setFormData({ ...formData, category: e.target.value });
                                    if (errors.category) {
                                        setErrors({ ...errors, category: undefined });
                                    }
                                }}
                                isInvalid={!!errors.category}
                                errorMessage={errors.category}
                                isDisabled={isLoadingCategories}
                            >
                                {categories.map((cat) => (
                                    <SelectItem key={cat.key}>
                                        {t("categories." + cat.name)}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* IMDB ID Field */}
                        <div className="mb-6">
                            <CustomInput
                                label={t('torrentUpload.imdb_label')}
                                placeholder={t('torrentUpload.imdb_placeholder')}
                                value={formData.imdbId}
                                onChange={(e) => {
                                    setFormData({ ...formData, imdbId: e.target.value });
                                    if (errors.imdbId) {
                                        setErrors({ ...errors, imdbId: undefined });
                                    }
                                }}
                                description={t('torrentUpload.imdb_hint')}
                                isInvalid={!!errors.imdbId}
                                errorMessage={errors.imdbId}
                            />
                        </div>

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className="mb-6">
                                <Progress
                                    value={uploadProgress}
                                    label={`${t('torrentUpload.uploadingProgress')}: ${uploadProgress}%`}
                                    className="max-w-md"
                                />
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-2 mt-8">
                            <Button
                                color="primary"
                                type="submit"
                                isLoading={isUploading}
                                isDisabled={isUploading || !formData.torrentFile}
                            >
                                {t('torrentUpload.uploadButton')}
                            </Button>
                            <Button
                                variant="flat"
                                onClick={() => router.back()}
                                isDisabled={isUploading}
                            >
                                {t('torrentUpload.cancel')}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}