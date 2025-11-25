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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TorrentCategoryDto, torrents, media, TMDbMovieDto, ApiError, TechnicalSpecsDto } from '@/lib/api';
import { processImage, formatFileSize, isImageFile, validateImageSize, type ProcessedImage } from '@/lib/image-processor';
import { parseTorrentName } from '@/lib/torrent-parser';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { X, Upload, AlertCircle, CheckCircle, Loader2, FileUp, FileText, Check } from 'lucide-react';
import StepIndicator from '@/app/[locale]/components/StepIndicator';
import RichEditor from '@/app/[locale]/components/RichEditor';

interface TorrentFileInfo {
    name: string;
    size: number;
    files?: Array<{ name: string; size: number }>;
}

interface FormData {
    torrentFile: File | null;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    imdbId: string;
    tmdbId?: number;
    isAnonymous: boolean;
    mediaInfo: string;
    technicalSpecs: TechnicalSpecsDto;
}

interface FormErrors {
    torrentFile?: string;
    title?: string;
    description?: string;
    category?: string;
    imdbId?: string;
    fetchMedia?: string;
    screenshots?: string;
    mediaInfo?: string;
    resolution?: string;
    videoCodec?: string;
    audioCodec?: string;
    source?: string;
}

interface ScreenshotState {
    original: File;
    processed?: ProcessedImage;
    preview: string;
    status: 'pending' | 'processing' | 'success' | 'error';
    error?: string;
}

const REQUIRED_SCREENSHOTS = 3;

export default function TorrentUploadPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    // Steps state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;
    const stepTitles = [
        t('torrentUpload.step1_file'),
        t('torrentUpload.step2_details'),
        t('torrentUpload.step3_confirm')
    ];

    // Form state
    const [formData, setFormData] = useState<FormData>({
        torrentFile: null,
        title: '',
        subtitle: '',
        description: '',
        category: '',
        imdbId: '',
        isAnonymous: false,
        mediaInfo: '',
        technicalSpecs: {
            resolution: '',
            videoCodec: '',
            audioCodec: '',
            source: '',
            subtitles: ''
        }
    });

    const [mediaInput, setMediaInput] = useState('');
    const [mediaInfo, setMediaInfo] = useState<TMDbMovieDto | null>(null);
    const [isFetchingMediaInfo, setIsFetchingMediaInfo] = useState(false);
    const [torrentInfo, setTorrentInfo] = useState<TorrentFileInfo | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const screenshotInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [categories, setCategories] = useState<TorrentCategoryDto[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // Screenshots state
    const [screenshots, setScreenshots] = useState<ScreenshotState[]>([]);
    const [isProcessingScreenshots, setIsProcessingScreenshots] = useState(false);

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

    const validateStep1 = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.torrentFile) {
            newErrors.torrentFile = t('torrentUpload.error_no_file');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.torrentFile, t]);

    const validateStep2 = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = t('torrentUpload.error_title_required');
        }

        if (formData.description.length > 4096) {
            newErrors.description = `${t('torrentUpload.error_description_max_length')}`;
        }

        if (!formData.category) {
            newErrors.category = t('torrentUpload.error_category_required');
        }

        if (!formData.mediaInfo.trim()) {
            newErrors.mediaInfo = '媒体信息不能为空';
        }

        if (!formData.technicalSpecs.resolution?.trim()) {
            newErrors.resolution = '分辨率不能为空';
        }
        if (!formData.technicalSpecs.videoCodec?.trim()) {
            newErrors.videoCodec = '视频编码不能为空';
        }
        if (!formData.technicalSpecs.audioCodec?.trim()) {
            newErrors.audioCodec = '音频编码不能为空';
        }
        if (!formData.technicalSpecs.source?.trim()) {
            newErrors.source = '媒介/来源不能为空';
        }

        // 验证截图数量（必须恰好 3 张且全部处理成功）
        const successfulScreenshots = screenshots.filter(s => s.status === 'success');
        if (successfulScreenshots.length !== REQUIRED_SCREENSHOTS) {
            newErrors.screenshots = `请上传恰好 ${REQUIRED_SCREENSHOTS} 张截图（当前：${successfulScreenshots.length} 张）`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, screenshots, t]);

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            if (validateStep2()) {
                setCurrentStep(3);
            }
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFileSelect = (file: File) => {
        // Reset previous state
        setTorrentInfo(null);
        setErrors(prev => ({ ...prev, torrentFile: undefined }));

        if (!file.name.endsWith('.torrent')) {
            setErrors(prev => ({ ...prev, torrentFile: t('torrentUpload.error_invalid_file') }));
            return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            setErrors(prev => ({ ...prev, torrentFile: t('torrentUpload.error_file_too_large') }));
            return;
        }

        // Parse torrent name for auto-fill
        const parsedInfo = parseTorrentName(file.name.replace('.torrent', ''));
        
        setFormData(prev => ({
            ...prev,
            torrentFile: file,
            technicalSpecs: {
                ...prev.technicalSpecs,
                resolution: parsedInfo.resolution || prev.technicalSpecs.resolution,
                videoCodec: parsedInfo.videoCodec || prev.technicalSpecs.videoCodec,
                audioCodec: parsedInfo.audioCodec || prev.technicalSpecs.audioCodec,
                source: parsedInfo.source || prev.technicalSpecs.source,
                subtitles: parsedInfo.subtitles || prev.technicalSpecs.subtitles,
            }
        }));

        // Basic torrent info parsing
        setTorrentInfo({ name: file.name, size: file.size });

        // Auto advance to next step after a short delay to show success state
        setTimeout(() => {
            setCurrentStep(2);
        }, 1000);
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
                setFormData((prev) => ({ ...prev, imdbId: data.imdb_id!, tmdbId: data.id }));
            } else if (data.id) {
                setFormData((prev) => ({ ...prev, tmdbId: data.id }));
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

    // 处理截图选择
    const handleScreenshotSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const remainingSlots = REQUIRED_SCREENSHOTS - screenshots.length;

        if (fileArray.length > remainingSlots) {
            toast.error(`最多只能上传 ${REQUIRED_SCREENSHOTS} 张截图，当前还可以添加 ${remainingSlots} 张`);
            return;
        }

        // 验证文件
        for (const file of fileArray) {
            if (!isImageFile(file)) {
                toast.error(`${file.name} 不是有效的图片文件`);
                return;
            }
            if (!validateImageSize(file, 20)) {
                toast.error(`${file.name} 文件过大（最大 20MB）`);
                return;
            }
        }

        // 创建初始状态
        const newScreenshots: ScreenshotState[] = fileArray.map(file => ({
            original: file,
            preview: URL.createObjectURL(file),
            status: 'pending' as const,
        }));

        setScreenshots(prev => [...prev, ...newScreenshots]);
        setErrors(prev => ({ ...prev, screenshots: undefined }));

        // 依次处理每张图片
        setIsProcessingScreenshots(true);
        for (let i = 0; i < newScreenshots.length; i++) {
            const screenshot = newScreenshots[i];
            const index = screenshots.length + i;

            try {
                // 更新状态为 processing
                setScreenshots(prev => {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], status: 'processing' };
                    return updated;
                });

                // 处理图片（压缩 + 鉴黄）
                const processed = await processImage(screenshot.original);

                // 更新为成功状态
                setScreenshots(prev => {
                    const updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        processed,
                        status: 'success',
                    };
                    return updated;
                });

                toast.success(`${screenshot.original.name} 处理成功！压缩率：${processed.compressionRatio}%`);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : '处理失败';
                
                // 更新为错误状态
                setScreenshots(prev => {
                    const updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        status: 'error',
                        error: errorMsg,
                    };
                    return updated;
                });

                toast.error(`${screenshot.original.name}: ${errorMsg}`);
            }
        }
        setIsProcessingScreenshots(false);
    };

    // 删除截图
    const handleRemoveScreenshot = (index: number) => {
        setScreenshots(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview); // 释放内存
            updated.splice(index, 1);
            return updated;
        });
        setErrors(prev => ({ ...prev, screenshots: undefined }));
    };

    const handleUpload = async () => {
        if (!validateStep2()) {
            setCurrentStep(2);
            return;
        }

        if (!formData.torrentFile) {
            toast.error(t('torrentUpload.error_no_file'));
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // 获取处理后的截图文件
            const processedScreenshots = screenshots
                .filter(s => s.status === 'success' && s.processed)
                .map(s => s.processed!.file);

            const response = await torrents.uploadTorrent(
                formData.torrentFile,
                {
                    title: formData.title,
                    subtitle: formData.subtitle,
                    description: formData.description,
                    category: formData.category,
                    imdbId: formData.imdbId,
                    tmdbId: formData.tmdbId,
                    isAnonymous: formData.isAnonymous,
                    mediaInfo: formData.mediaInfo,
                    technicalSpecs: formData.technicalSpecs
                },
                processedScreenshots,
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

    // Render Step 1: File Upload
    const renderStep1 = () => (
        <div className="space-y-6">
            <div>
                <Label className="block text-sm font-medium mb-2">
                    {t('torrentUpload.selectFile')} <span className="text-destructive">*</span>
                </Label>
                <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 
                        ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border hover:border-primary hover:bg-secondary/50'} 
                        ${errors.torrentFile ? 'border-destructive' : ''}`}
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
                        <div className="space-y-2">
                            <FileUp className="w-12 h-12 mx-auto text-primary" />
                            <p className="text-lg font-medium text-foreground">{t('torrentUpload.fileSelected')}</p>
                            <p className="text-muted-foreground">{formData.torrentFile.name}</p>
                            <p className="text-xs text-muted-foreground bg-secondary inline-block px-2 py-1 rounded">
                                {(formData.torrentFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="text-lg font-medium text-foreground">{t('torrentUpload.dragDropHint')}</p>
                            <p className="text-sm text-muted-foreground">或点击选择文件</p>
                        </div>
                    )}
                </div>
                {errors.torrentFile && <p className="text-destructive text-sm mt-2">{errors.torrentFile}</p>}
            </div>

            {torrentInfo && (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>文件解析成功</AlertTitle>
                    <AlertDescription>
                        已自动解析文件名中的元数据，将在下一步中自动填充。
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );

    // Render Step 2: Details
    const renderStep2 = () => (
        <div className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">基本信息</h3>
                
                <div className="space-y-2">
                    <Label htmlFor="title">标题 <span className="text-destructive">*</span></Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="请输入种子标题"
                        className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subtitle">副标题</Label>
                    <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="请输入副标题"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>分类 <span className="text-destructive">*</span></Label>
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
                    <div className="flex items-center space-x-2 pt-8">
                        <Checkbox
                            id="anonymous"
                            checked={formData.isAnonymous}
                            onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked as boolean })}
                        />
                        <Label htmlFor="anonymous" className="cursor-pointer">匿名发布</Label>
                    </div>
                </div>
            </div>

            {/* External Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">外部信息 (IMDb/TMDB)</h3>
                <div className="space-y-4">
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
                    <p className="text-sm text-muted-foreground">{t('torrentUpload.media_hint')}</p>

                    {mediaInfo && (
                        <div className="p-4 bg-secondary rounded-lg flex space-x-4 animate-in fade-in slide-in-from-top-2">
                            {mediaInfo.poster_path && (
                                <div className="shrink-0 w-24">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${mediaInfo.poster_path}`}
                                        alt={mediaInfo.title || 'Movie Poster'}
                                        className="rounded-md shadow-sm"
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
                </div>
            </div>

            {/* Technical Specs */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">文件信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>分辨率 <span className="text-destructive">*</span></Label>
                        <Input
                            value={formData.technicalSpecs.resolution || ''}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    technicalSpecs: { ...formData.technicalSpecs, resolution: e.target.value }
                                });
                                if (errors.resolution) setErrors({ ...errors, resolution: undefined });
                            }}
                            placeholder="e.g. 1080p"
                            className={errors.resolution ? 'border-destructive' : ''}
                        />
                        {errors.resolution && <p className="text-destructive text-sm">{errors.resolution}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>视频编码 <span className="text-destructive">*</span></Label>
                        <Input
                            value={formData.technicalSpecs.videoCodec || ''}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    technicalSpecs: { ...formData.technicalSpecs, videoCodec: e.target.value }
                                });
                                if (errors.videoCodec) setErrors({ ...errors, videoCodec: undefined });
                            }}
                            placeholder="e.g. x265"
                            className={errors.videoCodec ? 'border-destructive' : ''}
                        />
                        {errors.videoCodec && <p className="text-destructive text-sm">{errors.videoCodec}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>音频编码 <span className="text-destructive">*</span></Label>
                        <Input
                            value={formData.technicalSpecs.audioCodec || ''}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    technicalSpecs: { ...formData.technicalSpecs, audioCodec: e.target.value }
                                });
                                if (errors.audioCodec) setErrors({ ...errors, audioCodec: undefined });
                            }}
                            placeholder="e.g. AAC"
                            className={errors.audioCodec ? 'border-destructive' : ''}
                        />
                        {errors.audioCodec && <p className="text-destructive text-sm">{errors.audioCodec}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>媒介/来源 <span className="text-destructive">*</span></Label>
                        <Input
                            value={formData.technicalSpecs.source || ''}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    technicalSpecs: { ...formData.technicalSpecs, source: e.target.value }
                                });
                                if (errors.source) setErrors({ ...errors, source: undefined });
                            }}
                            placeholder="e.g. BluRay"
                            className={errors.source ? 'border-destructive' : ''}
                        />
                        {errors.source && <p className="text-destructive text-sm">{errors.source}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>字幕</Label>
                        <Input
                            value={formData.technicalSpecs.subtitles || ''}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    technicalSpecs: { ...formData.technicalSpecs, subtitles: e.target.value }
                                });
                            }}
                            placeholder="e.g. Chs, Eng"
                        />
                    </div>
                </div>
            </div>

            {/* Media Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                    媒体信息 (MediaInfo) <span className="text-destructive">*</span>
                </h3>
                <Textarea
                    placeholder="请在此处粘贴 MediaInfo 文本..."
                    value={formData.mediaInfo}
                    onChange={(e) => {
                        setFormData({ ...formData, mediaInfo: e.target.value });
                        if (errors.mediaInfo) setErrors({ ...errors, mediaInfo: undefined });
                    }}
                    className={`font-mono text-xs min-h-[150px] ${errors.mediaInfo ? 'border-destructive' : ''}`}
                />
                {errors.mediaInfo && <p className="text-destructive text-sm">{errors.mediaInfo}</p>}
            </div>

            {/* Screenshots */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                    截图上传 <span className="text-destructive">*</span>
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            恰好 {REQUIRED_SCREENSHOTS} 张，自动压缩为 WebP 并进行内容安全检测
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => screenshotInputRef.current?.click()}
                            disabled={isUploading || isProcessingScreenshots || screenshots.length >= REQUIRED_SCREENSHOTS}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            选择截图
                        </Button>
                        <input
                            ref={screenshotInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleScreenshotSelect(e.target.files)}
                            disabled={isUploading || isProcessingScreenshots || screenshots.length >= REQUIRED_SCREENSHOTS}
                            className="hidden"
                        />
                    </div>

                    {screenshots.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {screenshots.map((screenshot, index) => (
                                <div
                                    key={index}
                                    className={`relative border-2 rounded-lg overflow-hidden ${
                                        screenshot.status === 'success'
                                            ? 'border-green-500'
                                            : screenshot.status === 'error'
                                            ? 'border-destructive'
                                            : screenshot.status === 'processing'
                                            ? 'border-primary'
                                            : 'border-border'
                                    }`}
                                >
                                    <div className="aspect-video relative bg-secondary">
                                        <img
                                            src={screenshot.preview}
                                            alt={`Screenshot ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {screenshot.status === 'processing' && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            </div>
                                        )}
                                        {!isUploading && screenshot.status !== 'processing' && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveScreenshot(index)}
                                                className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-2 bg-background text-xs">
                                        {screenshot.status === 'success' && screenshot.processed && (
                                            <div className="flex items-center text-green-600">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                <span>{formatFileSize(screenshot.processed.compressedSize)} ({screenshot.processed.compressionRatio}%)</span>
                                            </div>
                                        )}
                                        {screenshot.status === 'error' && (
                                            <div className="flex items-center text-destructive">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                <span className="truncate">{screenshot.error}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.screenshots && <p className="text-destructive text-sm">{errors.screenshots}</p>}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                    简介描述
                </h3>
                <div className="space-y-2">
                    <RichEditor
                        value={formData.description}
                        onChange={(val) => {
                            setFormData({ ...formData, description: val });
                            if (errors.description) setErrors({ ...errors, description: undefined });
                        }}
                        placeholder={t('torrentUpload.description_placeholder')}
                        height={400}
                        maxLength={4096}
                    />
                    {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                </div>
            </div>
        </div>
    );

    // Render Step 3: Confirm
    const renderStep3 = () => (
        <div className="space-y-6">
            <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>准备发布</AlertTitle>
                <AlertDescription>
                    请仔细核对以下信息，确认无误后点击“确认发布”。
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">基本信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">标题:</span>
                            <span className="font-medium text-right">{formData.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">副标题:</span>
                            <span className="font-medium text-right">{formData.subtitle || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">分类:</span>
                            <span className="font-medium text-right">
                                {categories.find(c => c.key === formData.category)?.name || formData.category}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">匿名发布:</span>
                            <span className="font-medium text-right">{formData.isAnonymous ? '是' : '否'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">文件规格</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">文件名:</span>
                            <span className="font-medium text-right truncate max-w-[200px]" title={formData.torrentFile?.name}>
                                {formData.torrentFile?.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">大小:</span>
                            <span className="font-medium text-right">
                                {formData.torrentFile ? formatFileSize(formData.torrentFile.size) : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">分辨率:</span>
                            <span className="font-medium text-right">{formData.technicalSpecs.resolution || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">编码:</span>
                            <span className="font-medium text-right">
                                {formData.technicalSpecs.videoCodec} / {formData.technicalSpecs.audioCodec}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">字幕:</span>
                            <span className="font-medium text-right">
                                {formData.technicalSpecs.subtitles || '-'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">简介预览</h4>
                <div className="p-4 border rounded-lg bg-secondary/20 max-h-[200px] overflow-y-auto text-sm">
                    {formData.description.slice(0, 500)}...
                </div>
            </div>

            {isUploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>上传中...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                </div>
            )}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="min-h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-2xl text-center mb-6">{t('torrentUpload.title')}</CardTitle>
                    <StepIndicator
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        stepTitles={stepTitles}
                    />
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                    <div className="flex-grow">
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                    </div>

                    <div className="flex justify-between pt-8 mt-8 border-t">
                        <Button
                            variant="outline"
                            onClick={currentStep === 1 ? () => router.back() : handlePrevStep}
                            disabled={isUploading}
                        >
                            {currentStep === 1 ? t('common.cancel') : '上一步'}
                        </Button>

                        {currentStep < 3 ? (
                            <Button onClick={handleNextStep} disabled={isUploading}>
                                下一步
                            </Button>
                        ) : (
                            <Button onClick={handleUpload} disabled={isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        发布中...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        确认发布
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}