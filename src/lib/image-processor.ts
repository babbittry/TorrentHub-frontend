/**
 * 图像处理工具库
 * 功能：图片压缩（转 WebP）+ NSFW 鉴黄检测
 * 策略：先压缩，后鉴黄（只缩小不放大）
 */

import imageCompression from 'browser-image-compression';
import * as nsfwjs from 'nsfwjs';

// ==================== 配置常量 ====================

/**
 * 图片压缩配置
 */
export const IMAGE_COMPRESSION_CONFIG = {
  maxWidthOrHeight: 1920, // 最大分辨率（只缩小不放大）
  maxSizeMB: 5, // 最大文件大小（MB）
  useWebWorker: true, // 使用 Web Worker 提升性能
  fileType: 'image/webp' as const, // 输出格式
  quality: 0.85, // WebP 质量（0-1）
  initialQuality: 0.85, // 初始质量
};

/**
 * NSFW 检测阈值配置
 */
export const NSFW_THRESHOLDS = {
  porn: 0.6, // Porn 类别阈值（60%）
  hentai: 0.6, // Hentai 类别阈值（60%）
  sexy: 0.8, // Sexy 类别阈值（80%，相对宽松）
};

/**
 * NSFW 检测结果接口
 */
export interface NSFWResult {
  isSafe: boolean; // 是否安全
  predictions: Record<string, number>; // 各类别的概率
  riskLevel: 'safe' | 'warning' | 'blocked'; // 风险等级
  message?: string; // 提示信息
}

/**
 * 图像处理结果接口
 */
export interface ProcessedImage {
  file: File; // 处理后的 WebP 文件
  originalSize: number; // 原始大小（字节）
  compressedSize: number; // 压缩后大小（字节）
  compressionRatio: number; // 压缩比（百分比）
  nsfwResult?: NSFWResult; // NSFW 检测结果（可选）
}

// ==================== 核心功能函数 ====================

/**
 * 压缩图片并转换为 WebP 格式
 * 策略：只缩小不放大，保持原图质量
 * 
 * @param file - 原始图片文件
 * @param options - 自定义压缩选项（可选）
 * @returns 压缩后的 File 对象
 */
export async function compressImage(
  file: File,
  options?: Partial<typeof IMAGE_COMPRESSION_CONFIG>
): Promise<File> {
  const config = { ...IMAGE_COMPRESSION_CONFIG, ...options };

  try {
    // 读取原图尺寸
    const img = await createImageBitmap(file);
    const { width, height } = img;
    img.close();

    // 如果原图小于目标尺寸，只转换格式，不缩放
    if (width <= config.maxWidthOrHeight && height <= config.maxWidthOrHeight) {
      config.maxWidthOrHeight = Math.max(width, height);
    }

    const compressedFile = await imageCompression(file, config);

    // 确保文件名有正确的扩展名
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    return new File([compressedFile], `${nameWithoutExt}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    throw new Error(`图片压缩失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 检测图片是否包含 NSFW 内容
 * 
 * @param file - 图片文件（建议使用已压缩的文件）
 * @returns NSFW 检测结果
 */
export async function checkNSFW(file: File): Promise<NSFWResult> {
  try {
    // 加载 NSFW 模型（自动从 CDN 获取）
    const model = await nsfwjs.load();

    // 将 File 转换为 Image 元素
    const img = await fileToImage(file);

    // 执行预测
    const predictions = await model.classify(img);

    // 转换为 Record 格式
    const predictionMap: Record<string, number> = {};
    predictions.forEach((pred) => {
      predictionMap[pred.className] = pred.probability;
    });

    // 判断风险等级
    const pornScore = predictionMap['Porn'] || 0;
    const hentaiScore = predictionMap['Hentai'] || 0;
    const sexyScore = predictionMap['Sexy'] || 0;

    let riskLevel: NSFWResult['riskLevel'] = 'safe';
    let message = '';

    // 高风险：直接拦截
    if (pornScore >= NSFW_THRESHOLDS.porn || hentaiScore >= NSFW_THRESHOLDS.hentai) {
      riskLevel = 'blocked';
      message = '检测到不适宜内容，无法上传';
    }
    // 中风险：警告
    else if (sexyScore >= NSFW_THRESHOLDS.sexy) {
      riskLevel = 'warning';
      message = '图片内容可能存在风险，请谨慎';
    }
    // 低风险：安全
    else {
      riskLevel = 'safe';
      message = '图片内容安全';
    }

    return {
      isSafe: riskLevel !== 'blocked',
      predictions: predictionMap,
      riskLevel,
      message,
    };
  } catch (error) {
    throw new Error(`NSFW 检测失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 完整的图像处理流程
 * 1. 压缩图片（转 WebP）
 * 2. NSFW 检测
 * 
 * @param file - 原始图片文件
 * @param skipNSFW - 是否跳过 NSFW 检测（默认 false）
 * @returns 处理后的图片信息
 * @throws 如果图片不安全或处理失败
 */
export async function processImage(
  file: File,
  skipNSFW: boolean = false
): Promise<ProcessedImage> {
  const originalSize = file.size;

  // 第一步：压缩图片
  const compressedFile = await compressImage(file);
  const compressedSize = compressedFile.size;

  // 计算压缩比
  const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

  // 第二步：NSFW 检测（可选）
  let nsfwResult: NSFWResult | undefined;
  if (!skipNSFW) {
    nsfwResult = await checkNSFW(compressedFile);

    // 如果检测到高风险内容，抛出错误
    if (!nsfwResult.isSafe) {
      throw new Error(nsfwResult.message || '图片包含不适宜内容');
    }
  }

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    compressionRatio,
    nsfwResult,
  };
}

/**
 * 批量处理多张图片
 * 
 * @param files - 图片文件数组
 * @param skipNSFW - 是否跳过 NSFW 检测
 * @param onProgress - 进度回调
 * @returns 处理后的图片数组
 */
export async function processImages(
  files: File[],
  skipNSFW: boolean = false,
  onProgress?: (current: number, total: number) => void
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await processImage(files[i], skipNSFW);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return results;
}

// ==================== 辅助函数 ====================

/**
 * 将 File 对象转换为 HTMLImageElement
 * 
 * @param file - 图片文件
 * @returns Image 元素
 */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 格式化文件大小
 * 
 * @param bytes - 字节数
 * @returns 格式化后的字符串（如 "1.5 MB"）
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 验证文件是否为图片
 * 
 * @param file - 文件对象
 * @returns 是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * 验证图片文件大小
 * 
 * @param file - 文件对象
 * @param maxSizeMB - 最大大小（MB）
 * @returns 是否符合大小限制
 */
export function validateImageSize(file: File, maxSizeMB: number = 20): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}