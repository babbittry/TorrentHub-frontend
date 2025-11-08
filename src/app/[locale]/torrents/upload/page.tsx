'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TorrentCategory, TorrentCategoryDto, torrents, media, TMDbMovieDto, ApiError } from '@/lib/api';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

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
    fetchMedia?: string;
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

    const [mediaInput, setMediaInput] = useState('');
    const [mediaInfo, setMediaInfo] = useState<TMDbMovieDto | null>(null);
    const [isFetchingMediaInfo, setIsFetchingMediaInfo] = useState(false);
    const [torrentInfo, setTorrentInfo] = useState<TorrentFileInfo | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
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
                toast.error(t('torrentUpload.error_fetch_categories'));
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [t]);

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.torrentFile) {
            newErrors.torrentFile = t('torrentUpload.error_no_file');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('torrentUpload.error_description_required');
        } else if (formData.description.length > 4096) {
            newErrors.description = `${t('torrentUpload.error_description_max_length')}`;
        }

        if (!formData.category) {
            newErrors.category = t('torrentUpload.error_category_required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, t]);

    const handleFileSelect = (file: File) => {
        if (!file.name.endsWith('.torrent')) {
            setErrors(prev => ({ ...prev, torrentFile: t('torrentUpload.error_invalid_file') }));
            return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            setErrors(prev => ({ ...prev, torrentFile: t('torrentUpload.error_file_too_large') }));
            return;
        }

        setFormData({ ...formData, torrentFile: file });
        setErrors(prev => ({ ...prev, torrentFile: undefined }));

        // Basic torrent info parsing
        setTorrentInfo({ name: file.name, size: file.size });
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

    const handleFetchMediaInfo = async () => {
        if (!mediaInput) return;
        setIsFetchingMediaInfo(true);
        setErrors(prev => ({ ...prev, fetchMedia: undefined }));
        setMediaInfo(null);
        try {
            const data = await media.getMetadata(mediaInput, locale);
            setMediaInfo(data);
            if (data.imdb_id) {
                setFormData((prev) => ({ ...prev, imdbId: data.imdb_id! }));
            }
        } catch (error) {
            console.error('Failed to fetch media info:', error);
            const errorMessage = error instanceof ApiError ? error.message : t('torrentUpload.error_fetch_generic');
            setErrors(prev => ({ ...prev, fetchMedia: errorMessage }));
            setMediaInfo(null);
        } finally {
            setIsFetchingMediaInfo(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!formData.torrentFile) {
            toast.error(t('torrentUpload.error_no_file'));
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const response = await torrents.uploadTorrent(
                formData.torrentFile,
                formData.description,
                formData.category,
                formData.imdbId,
                (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setUploadProgress(progress);
                    }
                }
            );

            toast.success(t('torrentUpload.uploadSuccess'));

            setTimeout(() => {
                router.push(`/${locale}/torrents/${response.id}`);
            }, 2000);
        } catch (err) {
            const axiosError = err as AxiosError<{ errors?: Record<string, string[]>; error?: string; }>;
            const errorData = axiosError.response?.data;

            let message = t('torrentUpload.uploadFailed');
            if (errorData?.errors) {
                const firstError = Object.values(errorData.errors)[0];
                message = Array.isArray(firstError) ? firstError[0] : String(firstError);
            } else if (errorData?.error) {
                message = errorData.error;
            }
            toast.error(message);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{t('torrentUpload.title')}</CardTitle>
                    <p className="text-muted-foreground pt-2">{t('torrentUpload.description')}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-8">
                        {/* File Upload Area */}
                        <div>
                            <Label className="block text-sm font-medium mb-2">
                                {t('torrentUpload.selectFile')} <span className="text-destructive">*</span>
                            </Label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'} ${errors.torrentFile ? 'border-destructive' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".torrent"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    disabled={isUploading}
                                    className="hidden"
                                />

                                {formData.torrentFile ? (
                                    <div>
                                        <p className="text-green-600 font-medium">{t('torrentUpload.fileSelected')}</p>
                                        <p className="text-muted-foreground text-sm mt-2">{formData.torrentFile.name}</p>
                                        <p className="text-muted-foreground text-xs">{(formData.torrentFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <p className="text-foreground font-medium">{t('torrentUpload.dragDropHint')}</p>
                                )}
                            </div>
                            {errors.torrentFile && <p className="text-destructive text-sm mt-2">{errors.torrentFile}</p>}
                        </div>

                        {/* Torrent Info Preview */}
                        {torrentInfo && (
                            <div className="p-4 bg-secondary rounded-lg">
                                <h3 className="font-medium mb-2">{t('torrentUpload.torrentInfo')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">{t('torrentUpload.fileName')}:</span> {torrentInfo.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">{t('torrentUpload.fileSize')}:</span> {(torrentInfo.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}

                        {/* Description Field */}
                        <div className="space-y-2">
                            <Label htmlFor="description">{t('torrentUpload.description_label')}</Label>
                            <Textarea
                                id="description"
                                placeholder={t('torrentUpload.description_placeholder')}
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData({ ...formData, description: e.target.value });
                                    if (errors.description) setErrors({ ...errors, description: undefined });
                                }}
                                maxLength={4096}
                                className={`min-h-[100px] ${errors.description ? 'border-destructive' : ''}`}
                            />
                            {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                        </div>

                        {/* Category Dropdown */}
                        <div className="space-y-2">
                            <Label>{t('torrentUpload.category_label')}</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => {
                                    setFormData({ ...formData, category: value });
                                    if (errors.category) setErrors({ ...errors, category: undefined });
                                }}
                                disabled={isLoadingCategories}
                            >
                                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                                    <SelectValue placeholder={t('torrentUpload.category_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.key} value={cat.key}>{t(`categories.${cat.name}`)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-destructive text-sm">{errors.category}</p>}
                        </div>

                        {/* Media Info Fetcher */}
                        <div>
                            <div className="flex items-end space-x-2">
                                <FormField
                                    label={t('torrentUpload.media_label')}
                                    placeholder={t('torrentUpload.media_placeholder')}
                                    value={mediaInput}
                                    onChange={(e) => setMediaInput(e.target.value)}
                                    error={errors.fetchMedia}
                                    containerClassName="grow"
                                />
                                <Button type="button" onClick={handleFetchMediaInfo} disabled={isFetchingMediaInfo}>
                                    {isFetchingMediaInfo ? t('common.loading') : t('torrentUpload.fetchInfo')}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{t('torrentUpload.media_hint')}</p>
                        </div>

                        {/* Media Info Preview */}
                        {mediaInfo && (
                            <div className="p-4 bg-secondary rounded-lg flex space-x-4">
                                {mediaInfo.poster_path && (
                                    <div className="shrink-0 w-24">
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${mediaInfo.poster_path}`}
                                            alt={mediaInfo.title || 'Movie Poster'}
                                            className="rounded-md"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg">{mediaInfo.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {mediaInfo.release_date ? new Date(mediaInfo.release_date).getFullYear() : 'N/A'}
                                    </p>
                                    <p className="text-sm mt-2 text-foreground line-clamp-3">{mediaInfo.overview}</p>
                                </div>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className="space-y-2">
                                <Label>{`${t('torrentUpload.uploadingProgress')}: ${uploadProgress}%`}</Label>
                                <Progress value={uploadProgress} />
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={isUploading || !formData.torrentFile}>
                                {isUploading ? t('common.loading') : t('torrentUpload.uploadButton')}
                            </Button>
                            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isUploading}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}