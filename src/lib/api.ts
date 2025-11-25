import axios, { AxiosError, AxiosResponse } from 'axios';

// ==================== API 响应格式和错误处理 (U-14) ====================

/**
 * 统一的 API 响应包装器
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * 自定义 API 错误类
 */
export class ApiError extends Error {
    public readonly errors?: Record<string, string[]>;

    constructor(message: string, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiError';
        this.errors = errors;
    }
}

// Base Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5014",
    withCredentials: true,
});

/**
 * 统一的 API 调用包装器
 * @param requestPromise - 一个返回 AxiosResponse<ApiResponse<T>> 的 Promise
 * @returns 返回解包后的数据 T
 * @throws {ApiError} 如果请求失败或 success 为 false
 */
async function callApi<T>(requestPromise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
    try {
        const response = await requestPromise;
        const apiResponse = response.data;

        if (apiResponse.success) {
            // 后端可能在成功时不返回 data，但 TypeScript 类型需要它
            return apiResponse.data as T;
        } else {
            throw new ApiError(apiResponse.message || 'An unknown API error occurred', apiResponse.errors);
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>;
            if (axiosError.response && axiosError.response.data) {
                const errorData = axiosError.response.data;
                throw new ApiError(errorData.message || axiosError.message, errorData.errors);
            } else {
                throw new ApiError(axiosError.message);
            }
        }
        // 重新抛出非 axios 错误
        throw error;
    }
}

export default api;

// DTOs for User related operations
export enum UserRole {
    // Standard User Tiers (increasing privileges)
    Mosquito = "Mosquito",   // 低分享率用户
    User = "User",           // 普通用户 (新注册用户的默认角色)
    PowerUser = "PowerUser",      // 高级用户
    EliteUser = "EliteUser",      // 精英用户
    CrazyUser = "CrazyUser",      // 狂热用户
    VeteranUser = "VeteranUser",    // 资深用户
    VIP = "VIP",            // VIP用户（例如，捐赠者或特殊贡献者）

    // Functional Roles
    Uploader = "Uploader",       // 认证上传者
    Seeder = "Seeder",         // 保种用户
    Moderator = "Moderator",      // 版主
    Administrator = "Administrator",  // 管理员
}

export type BanStatus = number;

export type NullableOfUserRole = UserRole | null;

export interface UserForRegistrationDto {
    userName: string;
    password: string;
    email: string;
    inviteCode: string;
    avatarSvg: string;
    language?: string;
}

export interface UserForLoginDto {
    userNameOrEmail: string;
    password: string;
}

export interface PendingTwoFactorUserDto {
    userName: string;
    email: string;
    twoFactorMethod: string;
}

export interface LoginResponseDto {
    result?: 'Success' | 'RequiresTwoFactor' | 'InvalidCredentials' | 'EmailNotVerified' | 'Banned';
    message?: string | null;
    accessToken?: string | null;
    user?: UserPrivateProfileDto | null;
    pending2faUser?: PendingTwoFactorUserDto | null;
}

export interface UserForLogin2faDto {
    userName: string;
    code: string;
}

export interface SendEmailCodeRequestDto {
    userName: string;
}


export interface ResendVerificationRequestDto {
    userNameOrEmail: string;
}

export interface UserPublicProfileDto {
    id: number;
    userName: string;
    avatar?: string | null;
    signature?: string | null;
    uploadedBytes: number;
    downloadedBytes: number;
    nominalUploadedBytes: number;
    nominalDownloadedBytes: number;
    role: UserRole;
    createdAt: string; // date-time
    coins: number;
    isDoubleUploadActive: boolean;
    doubleUploadExpiresAt?: string | null; // date-time
    isNoHRActive: boolean;
    noHRExpiresAt?: string | null; // date-time
    totalSeedingTimeMinutes: number;
    totalLeechingTimeMinutes: number;
    inviteNum: number;
    invitedBy?: string | null;
    seedingSize: number;
    currentSeedingCount: number;
    currentLeechingCount: number;
    userTitle?: string | null;
    equippedBadgeId?: number | null;
    colorfulUsernameExpiresAt?: string | null;
}

export enum BadgeCode {
    EarlySupporter = "EarlySupporter",
    TorrentMaster = "TorrentMaster",
}

export interface BadgeDto {
    id: number;
    code: BadgeCode;
}

export interface UserDisplayDto {
    id: number;
    username: string;
    avatar?: string | null;
    userLevelName?: string | null;
    userLevelColor?: string | null;
    equippedBadge?: BadgeDto | null;
    userTitle?: string | null;
    isColorfulUsernameActive: boolean;
}

export interface UserPrivateProfileDto {
    email: string;
    banStatus: BanStatus;
    banReason?: string | null;
    banUntil?: string | null; // date-time
    language?: string | null;
    cheatWarningCount: number;
    id: number;
    userName: string;
    avatar?: string | null;
    signature?: string | null;
    uploadedBytes: number;
    downloadedBytes: number;
    nominalUploadedBytes: number;
    nominalDownloadedBytes: number;
    role: UserRole;
    createdAt: string; // date-time
    coins: number;
    isDoubleUploadActive: boolean;
    doubleUploadExpiresAt?: string | null; // date-time
    isNoHRActive: boolean;
    noHRExpiresAt?: string | null; // date-time
    totalSeedingTimeMinutes: number;
    totalLeechingTimeMinutes: number;
    inviteNum: number;
    twoFactorMethod: string;
    userTitle?: string | null;
    unreadMessagesCount: number;
}


export interface UpdateUserProfileDto {
    avatarUrl?: string | null;
    signature?: string | null;
    language?: string | null;
}

export interface TwoFactorVerificationRequestDto {
    code: string;
}

/**
 * 2FA 设置响应 (新增 - Users 模块需要)
 */
export interface TwoFactorSetupDto {
    manualEntryKey: string;
    qrCodeImageUrl: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateUserAdminDto {
    role?: NullableOfUserRole | null;
    banStatus?: BanStatus | null;
    banReason?: string | null;
    banUntil?: string | null; // date-time
}

export interface UpdateRegistrationSettingsDto {
    isOpen: boolean;
}

export interface UserAdminProfileDto {
    id: number;
    userName: string;
    email: string;
    avatar?: string | null;
    signature?: string | null;
    uploadedBytes: number;
    downloadedBytes: number;
    nominalUploadedBytes: number;
    nominalDownloadedBytes: number;
    role: UserRole;
    createdAt: string;
    coins: number;
    isDoubleUploadActive: boolean;
    doubleUploadExpiresAt?: string | null;
    isNoHRActive: boolean;
    noHRExpiresAt?: string | null;
    totalSeedingTimeMinutes: number;
    totalLeechingTimeMinutes: number;
    inviteNum: number;
    banStatus: BanStatus;
    banReason?: string | null;
    banUntil?: string | null;
    invitedBy?: string | null;
    seedingSize: number;
    currentSeedingCount: number;
    currentLeechingCount: number;
}

export interface PaginatedResult<T> {
    items: T[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// DTOs for Announcement related operations
export interface AnnouncementDto {
    id: number;
    title: string;
    content: string;
    createdAt: string; // date-time
    createdByUser?: UserPublicProfileDto;
}

export interface CreateAnnouncementRequestDto {
    title: string;
    content: string;
    sendToInbox: boolean;
}

export interface UpdateAnnouncementDto {
    title: string;
    content: string;
}

// DTOs for Comment related operations (Unified)
export enum CommentableType {
    Torrent = 'torrent',
    Request = 'request',
    ForumTopic = 'forumtopic',
}

export interface CommentDto {
    id: number;
    commentableType: CommentableType;
    commentableId: number;
    userId: number;
    user?: UserDisplayDto;
    content: string;
    floor: number;
    parentCommentId?: number | null;
    replyToUserId?: number | null;
    replyToUser?: UserDisplayDto | null;
    depth: number;
    replyCount: number;
    createdAt: string; // date-time
    editedAt?: string | null; // date-time
    reactions?: CommentReactionsDto;
}

export interface CommentListResponse {
    items: CommentDto[];
    hasMore: boolean;
    totalItems: number;
    loadedCount: number;
}

export interface CreateCommentDto {
    content: string;
    parentCommentId?: number | null;
    replyToUserId?: number | null;
}

export interface UpdateCommentDto {
    content: string;
}

export interface PeerDto {
    torrentId?: number;
    torrentName: string;
    userAgent: string;
    ipAddress: string;
    port: number;
    uploaded: number;
    downloaded: number;
    isSeeder: boolean;
    lastAnnounceAt: string; // date-time
}

// DTOs for Invite related operations
export interface InviteDto {
    id: string; // uuid
    code: string;
    generatorUsername: string;
    usedByUsername?: string | null;
    expiresAt: string; // date-time
    createdAt: string; // date-time
}

// DTOs for Message related operations
export interface MessageDto {
    id: number;
    sender?: UserPublicProfileDto;
    receiver?: UserPublicProfileDto;
    subject: string;
    content: string;
    sentAt: string; // date-time
    isRead: boolean;
}

export interface SendMessageRequestDto {
    receiverId: number;
    subject: string;
    content: string;
}

// DTOs for Report related operations
export enum ReportReason {
    IllegalContent = 0,
    MisleadingCategory,
    LowQuality,
    Duplicate,
    DeadTorrent,
    Other,
}

export interface ReportDto {
    id: number;
    torrent?: TorrentDto;
    reporterUser?: UserPublicProfileDto;
    reason: ReportReason;
    details?: string | null;
    reportedAt: string; // date-time
    isProcessed: boolean;
    processedByUser?: UserPublicProfileDto;
    processedAt?: string | null; // date-time
    adminNotes?: string | null;
}

export interface SubmitReportRequestDto {
    torrentId: number;
    reason: ReportReason;
    details?: string | null;
}

export interface ProcessReportRequestDto {
    adminNotes: string;
    markAsProcessed: boolean;
}

// DTOs for Request related operations
export enum RequestStatus {
    Pending = "Pending",
    Filled = "Filled",
    PendingConfirmation = "PendingConfirmation",
    Rejected = "Rejected",
}

export interface RejectFulfillmentDto {
    reason: string;
}

// 求种列表专用 DTO（精简版）
export interface RequestSummaryDto {
    id: number;
    title: string;
    bountyAmount: number;
    status: RequestStatus;
    createdAt: string;
    requestedByUser: UserDisplayDto;
}

// 求种详情 DTO（完整版）
export interface RequestDto {
    id: number;
    title: string;
    description: string;
    requestedByUser?: UserDisplayDto;
    filledByUser?: UserDisplayDto;
    filledWithTorrentId?: number | null;
    status: RequestStatus;
    rejectionReason?: string | null;
    createdAt: string; // date-time
    filledAt?: string | null; // date-time
    bountyAmount: number;
}

export interface CreateRequestDto {
    title: string;
    description: string;
    initialBounty?: number;
}

export interface AddBountyRequestDto {
    amount: number;
}

export interface FillRequestDto {
    torrentId?: number;
}

// DTOs for Forum related operations
export enum ForumCategoryCode {
    Announcement,
    General,
    Feedback,
    Invite,
    Watering
}

export interface ForumCategoryDto {
    id: number;
    code: string;
    title: string;
    description: string;
    topicCount: number;
    postCount: number;
}

export interface ForumTopicDto {
    id: number;
    title: string;
    categoryId: number;
    author?: UserDisplayDto;
    postCount: number;
    isSticky: boolean;
    isLocked: boolean;
    createdAt: string; // date-time
    lastPostTime: string | null; // date-time
}

export interface ForumPostDto {
    id: number;
    topicId: number;
    content: string;
    author?: UserDisplayDto;
    createdAt: string; // date-time
    editedAt: string | null; // date-time
    floor: number;
    parentPostId?: number | null;
    replyToUser?: UserDisplayDto | null;
    depth: number;
    replyCount: number;
    reactions?: CommentReactionsDto; // 新增：表情回应数据
}

export type ForumPostListResponse = PaginatedResult<ForumPostDto>;

export interface ForumTopicDetailDto {
    id: number;
    title: string;
    categoryId: number;
    categoryName: string | null;
    author?: UserDisplayDto;
    isSticky: boolean;
    isLocked: boolean;
    createdAt: string; // date-time
    posts: PaginatedResult<ForumPostDto>;
}

export interface CreateForumTopicDto {
    categoryId: number;
    title: string;
    content: string;
}

export interface CreateForumPostDto {
    content: string;
    parentPostId?: number | null;
    replyToUserId?: number | null;
}

export interface UpdateForumTopicDto {
    title: string;
}

export interface UpdateForumPostDto {
    content: string;
}

// DTOs for Store related operations
export enum StoreActionType {
    SimplePurchase = "SimplePurchase",
    PurchaseWithQuantity = "PurchaseWithQuantity",
    ChangeUsername = "ChangeUsername",
    PurchaseBadge = "PurchaseBadge",
}

export interface ActionMetadata {
    min?: number;
    max?: number;
    step?: number;
    unitKey?: string;
    inputLabelKey?: string;
    placeholderKey?: string;
    badgeId?: number;
}

export interface StoreItemDto {
    id: number;
    nameKey: string;
    descriptionKey: string;
    price: number;
    isAvailable: boolean;
    actionType: StoreActionType;
    actionMetadata?: ActionMetadata | null;
}

// DTOs for Media related operations
export interface Genre {
    name: string;
}

export interface CastMember {
    name: string;
    order: number;
}

export interface CrewMember {
    name: string;
    job: string;
}

export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

export interface TMDbMovieDto {
    id: number;
    imdb_id?: string | null;
    title?: string | null;
    original_title?: string | null;
    overview?: string | null;
    release_date?: string | null;
    poster_path?: string | null;
    backdrop_path?: string | null;
    tagline?: string | null;
    runtime?: number | null;
    genres: Genre[];
    credits: Credits;
    vote_average?: number | null;
}

// DTOs for Torrent related operations
export enum TorrentStickyStatus {
    Normal = 0,
    Sticky = 1,
    GlobalSticky = 2,
}

export enum TorrentCategory {
    Movie = 0,
    Documentary = 1,
    Series = 2,
    Animation = 3,
    Game = 4,
    Music = 5,
    Variety = 6,
    Sports = 7,
    Concert = 8,
    Other = 9
}

export enum TorrentDeleteReason {
    Duplicate = 0,
    LowQuality = 1,
    Dead = 2,
    RulesViolation = 3,
    Other = 4
}

export interface TorrentCategoryDto {
    id: number;
    name: string;
    key: string;
}

export interface UploadTorrentResponseDto {
    id: number;
    name: string;
    description?: string | null;
    size: number;
    uploader?: UserDisplayDto;
    createdAt: string;
    category: TorrentCategory;
    isFree: boolean;
    stickyStatus: TorrentStickyStatus;
    seeders: number;
    leechers: number;
    snatched: number;
    imdbId?: string | null;
}

export interface TechnicalSpecsDto {
    resolution?: string | null;
    videoCodec?: string | null;
    audioCodec?: string | null;
    subtitles?: string | null;
    source?: string | null;
}

export interface TorrentFileDto {
    name: string;
    size: number;
}

export interface CastMemberDto {
    name: string;
    character?: string | null;
    profilePath?: string | null;
}

export interface TorrentDto {
    id: number;
    name: string;
    description?: string | null;
    plot?: string | null;
    subtitle?: string | null;
    isAnonymous: boolean;
    mediaInfo?: string | null;
    size: number;
    uploader?: UserDisplayDto;
    createdAt: string; // date-time
    category: TorrentCategory;
    isFree: boolean;
    freeUntil?: string | null; // date-time
    stickyStatus: TorrentStickyStatus;
    isDeleted: boolean;
    deleteReason?: TorrentDeleteReason | null;
    seeders: number;
    leechers: number;
    snatched: number;
    imdbId?: string | null;
    tmDbId?: number | null;
    originalTitle?: string | null;
    year?: number | null;
    posterPath?: string | null;
    backdropPath?: string | null;
    runtime?: number | null;
    genres?: string[] | null;
    directors?: string | null;
    cast?: CastMemberDto[] | null;
    rating?: number | null;
    imdbRating?: number | null;
    technicalSpecs?: TechnicalSpecsDto | null;
    files?: TorrentFileDto[] | null;
    country?: string | null;
    screenshots?: string[] | null; // 截图URL数组
}

export interface SetStickyRequestDto {
    status: TorrentStickyStatus;
}

export interface CompleteInfoRequestDto {
    imdbId: string;
}

// DTOs for TopPlayers related operations
export enum TopPlayerType {
    Uploaded = 0,
    Downloaded = 1,
    Coins = 2,
    SeedingTime = 3,
    SeedingSize = 4,
}

// DTOs for Coins related operations
export interface UpdateCoinsRequestDto {
    amount: number;
}

export interface TransferCoinsRequestDto {
    toUserId: number;
    amount: number;
    notes?: string;
}

export interface TipCoinsRequestDto {
    toUserId: number;
    amount: number;
    contextType: 'Torrent' | 'Comment' | 'ForumPost';
    contextId: number;
}

// DTOs for Reaction related operations
// CommentType 常量
export const COMMENT_TYPE = {
    TORRENT: 'torrent',
    REQUEST: 'request',
    FORUM_TOPIC: 'forumtopic',
} as const;

export type CommentType = typeof COMMENT_TYPE[keyof typeof COMMENT_TYPE];

// 表情类型枚举（与后端保持一致：数字枚举）
export enum ReactionType {
    ThumbsUp = 1,
    ThumbsDown = 2,
    Heart = 3,
    Celebration = 4,
    Thinking = 5,
    Laugh = 6,
    Eyes = 7
}

// 单个表情回应的汇总
export interface ReactionSummaryDto {
    type: ReactionType;
    count: number;
    viewerReacted: boolean;
    users: UserDisplayDto[];  // 单个接口最多10个，批量接口为空数组
}

// 评论的所有回应
export interface CommentReactionsDto {
    totalItems: number;
    reactions: ReactionSummaryDto[];
}

// 添加回应请求
export interface AddReactionRequestDto {
    type: ReactionType;
}

// 批量获取请求
export interface GetReactionsBatchRequestDto {
    commentIds: number[];
}

// For file uploads
export type IFormFile = File;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5014";

// Auth API Functions
export const auth = {
    login: async (user: UserForLoginDto): Promise<LoginResponseDto> => {
        const response = await api.post<LoginResponseDto>('/api/auth/login', user);
        return response.data;
    },
    register: async (user: UserForRegistrationDto): Promise<unknown> => {
        const response = await api.post('/api/auth/register', user);
        return response.data;
    },
    verifyEmail: async (token: string): Promise<void> => {
        await api.get(`/api/auth/verify-email?token=${token}`);
    },
    login2fa: async (data: UserForLogin2faDto): Promise<LoginResponseDto> => {
        const response = await api.post<LoginResponseDto>('/api/auth/login-2fa', data);
        return response.data;
    },
    sendEmailCode: async (data: SendEmailCodeRequestDto): Promise<void> => {
        await api.post('/api/auth/send-email-code', data);
    },
    logout: async (): Promise<void> => {
        await api.post('/api/auth/logout');
    },
    refresh: async (): Promise<LoginResponseDto> => {
        const response = await api.post<LoginResponseDto>('/api/auth/refresh');
        return response.data;
    },
    resendVerification: async (data: ResendVerificationRequestDto): Promise<void> => {
        await api.post('/api/auth/resend-verification', data);
    },
};

// Users API Functions
export const users = {
    getMe: async (): Promise<UserPrivateProfileDto> => {
        return callApi(api.get<ApiResponse<UserPrivateProfileDto>>('/api/users/me'));
    },
    updateMe: async (user: UpdateUserProfileDto): Promise<UserPrivateProfileDto> => {
        return callApi(api.patch<ApiResponse<UserPrivateProfileDto>>('/api/users/me', user));
    },
    updateUserTitle: async (title: string): Promise<void> => {
        return callApi(api.put<ApiResponse<void>>('/api/users/me/title', { title }));
    },
    changePassword: async (passwords: ChangePasswordDto): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>('/api/users/me/password', passwords));
    },
    getUsers: async (page: number = 1, pageSize: number = 10, searchTerm?: string): Promise<UserPublicProfileDto[]> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        if (searchTerm) {
            params.append('searchTerm', searchTerm);
        }
        return callApi(api.get<ApiResponse<UserPublicProfileDto[]>>(`/api/users?${params.toString()}`));
    },
    getUserById: async (id: number): Promise<UserPublicProfileDto> => {
        return callApi(api.get<ApiResponse<UserPublicProfileDto>>(`/api/users/${id}`));
    },
    updateUserAdmin: async (id: number, user: UpdateUserAdminDto): Promise<UserPublicProfileDto> => {
        return callApi(api.patch<ApiResponse<UserPublicProfileDto>>(`/api/users/${id}`, user));
    },
    getUserUploads: async (id: number): Promise<TorrentDto[]> => {
        return callApi(api.get<ApiResponse<TorrentDto[]>>(`/api/users/${id}/uploads`));
    },
    getUserPeers: async (id: number): Promise<PeerDto[]> => {
        return callApi(api.get<ApiResponse<PeerDto[]>>(`/api/users/${id}/peers`));
    },
    getUserBadges: async (userId: number): Promise<BadgeDto[]> => {
        return callApi(api.get<ApiResponse<BadgeDto[]>>(`/api/users/${userId}/badges`));
    },

    getMyBadges: async (): Promise<BadgeDto[]> => {
        return callApi(api.get<ApiResponse<BadgeDto[]>>('/api/users/me/badges'));
    },
    generate2faSetup: async (): Promise<TwoFactorSetupDto> => {
        return callApi(api.post<ApiResponse<TwoFactorSetupDto>>('/api/users/me/2fa/generate-setup'));
    },
    switchToApp: async (data: TwoFactorVerificationRequestDto): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>('/api/users/me/2fa/switch-to-app', data));
    },
    switchToEmail: async (data: TwoFactorVerificationRequestDto): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>('/api/users/me/2fa/switch-to-email', data));
    },
};

// Stats API Functions
export const stats = {
    getStats: async (): Promise<SiteStatsDto> => {
        const response = await api.get('/api/Stats');
        return response.data;
    },
};

// Announcements API Functions
export const announcements = {
    createAnnouncement: async (announcement: CreateAnnouncementRequestDto): Promise<AnnouncementDto> => {
        return callApi(api.post<ApiResponse<AnnouncementDto>>('/api/announcements', announcement));
    },
    getAnnouncements: async (): Promise<AnnouncementDto[]> => {
        return callApi(api.get<ApiResponse<AnnouncementDto[]>>('/api/announcements'));
    },
    updateAnnouncement: async (id: number, announcement: UpdateAnnouncementDto): Promise<AnnouncementDto> => {
        return callApi(api.put<ApiResponse<AnnouncementDto>>(`/api/announcements/${id}`, announcement));
    },
    deleteAnnouncement: async (id: number): Promise<void> => {
        return callApi(api.delete<ApiResponse<void>>(`/api/announcements/${id}`));
    },
};

// Comments API Functions (Unified)
export const comments = {
    getComments: async (type: CommentType, id: number, page: number = 1, pageSize: number = 20): Promise<CommentListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        return callApi(api.get<ApiResponse<CommentListResponse>>(`/api/Comment/${type}/${id}?${params.toString()}`));
    },
    createComment: async (type: CommentType, id: number, data: CreateCommentDto): Promise<CommentDto> => {
        return callApi(api.post<ApiResponse<CommentDto>>(`/api/Comment/${type}/${id}`, data));
    },
    updateComment: async (commentId: number, data: UpdateCommentDto): Promise<CommentDto> => {
        return callApi(api.put<ApiResponse<CommentDto>>(`/api/Comment/${commentId}`, data));
    },
    deleteComment: async (commentId: number): Promise<void> => {
        return callApi(api.delete<ApiResponse<void>>(`/api/Comment/${commentId}`));
    },
    getCommentDetail: async (commentId: number): Promise<CommentDto> => {
        return callApi(api.get<ApiResponse<CommentDto>>(`/api/Comment/detail/${commentId}`));
    },
    getUserComments: async (userId: number, page: number = 1, pageSize: number = 20): Promise<CommentListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        return callApi(api.get<ApiResponse<CommentListResponse>>(`/api/Comment/user/${userId}?${params.toString()}`));
    },
};

// Invites API Functions
export const invites = {
    getInvites: async (): Promise<InviteDto[]> => {
        return callApi(api.get<ApiResponse<InviteDto[]>>('/api/invites/me'));
    },
    createInvite: async (): Promise<InviteDto> => {
        return callApi(api.post<ApiResponse<InviteDto>>('/api/invites'));
    },
};

// Messages API Functions
export const messages = {
    sendMessage: async (message: SendMessageRequestDto): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>('/api/messages', message));
    },
    getInboxMessages: async (): Promise<MessageDto[]> => {
        return callApi(api.get<ApiResponse<MessageDto[]>>('/api/messages/inbox'));
    },
    getSentMessages: async (): Promise<MessageDto[]> => {
        return callApi(api.get<ApiResponse<MessageDto[]>>('/api/messages/sent'));
    },
    getMessageById: async (messageId: number): Promise<MessageDto> => {
        return callApi(api.get<ApiResponse<MessageDto>>(`/api/messages/${messageId}`));
    },
    deleteMessage: async (messageId: number): Promise<void> => {
        return callApi(api.delete<ApiResponse<void>>(`/api/messages/${messageId}`));
    },
    markMessageAsRead: async (messageId: number): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/messages/${messageId}/read`));
    },
};

// Reports API Functions
export const reports = {
    submitReport: async (report: SubmitReportRequestDto): Promise<void> => {
        await api.post('/api/reports', report);
    },
    getPendingReports: async (): Promise<ReportDto[]> => {
        const response = await api.get('/api/reports/pending');
        return response.data;
    },
    getProcessedReports: async (): Promise<ReportDto[]> => {
        const response = await api.get('/api/reports/processed');
        return response.data;
    },
    processReport: async (reportId: number, processData: ProcessReportRequestDto): Promise<void> => {
        await api.patch(`/api/reports/${reportId}/process`, processData);
    },
    getReportById: async (reportId: number): Promise<ReportDto> => {
        // This endpoint doesn't exist in the spec, so we'll filter the pending reports
        // This is not ideal, but it's the best we can do without a dedicated endpoint
        const pending = await reports.getPendingReports();
        const report = pending.find(r => r.id === reportId);
        if (report) {
            return report;
        }
        const processed = await reports.getProcessedReports();
        const reportFromProcessed = processed.find(r => r.id === reportId);
        if (reportFromProcessed) {
            return reportFromProcessed;
        }
        throw new Error(`Report with id ${reportId} not found`);
    }
};

// Requests API Functions
export const requests = {
    createRequest: async (request: CreateRequestDto): Promise<RequestDto> => {
        return callApi(api.post<ApiResponse<RequestDto>>('/api/requests', request));
    },
    getRequests: async (page: number = 1, pageSize: number = 20, status?: string, sortBy?: string, sortOrder?: string): Promise<PaginatedResult<RequestSummaryDto>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        if (status) params.append('status', status);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        return callApi(api.get<ApiResponse<PaginatedResult<RequestSummaryDto>>>(`/api/requests?${params.toString()}`));
    },
    addBounty: async (requestId: number, amount: AddBountyRequestDto): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/requests/${requestId}/bounty`, amount));
    },
    getRequestById: async (id: number): Promise<RequestDto> => {
        return callApi(api.get<ApiResponse<RequestDto>>(`/api/requests/${id}`));
    },
    fillRequest: async (requestId: number, fillData: FillRequestDto): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/requests/${requestId}/fill`, fillData));
    },
    confirm: async (requestId: number): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>(`/api/requests/${requestId}/confirm`));
    },
    reject: async (requestId: number, rejectData: RejectFulfillmentDto): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>(`/api/requests/${requestId}/reject`, rejectData));
    },
};

// Forum API Functions
export const forum = {
    getCategories: async (): Promise<ForumCategoryDto[]> => {
        return callApi(api.get<ApiResponse<ForumCategoryDto[]>>('/api/forum/categories'));
    },
    getTopics: async (categoryId: number, page: number = 1, pageSize: number = 20): Promise<PaginatedResult<ForumTopicDto>> => {
        const params = new URLSearchParams({
            categoryId: categoryId.toString(),
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        return callApi(api.get<ApiResponse<PaginatedResult<ForumTopicDto>>>(`/api/forum/topics?${params.toString()}`));
    },
    getTopicById: async (topicId: number, page: number = 1, pageSize: number = 20): Promise<ForumTopicDetailDto> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        return callApi(api.get<ApiResponse<ForumTopicDetailDto>>(`/api/forum/topics/${topicId}?${params.toString()}`));
    },
    createTopic: async (topicData: CreateForumTopicDto): Promise<ForumTopicDetailDto> => {
        return callApi(api.post<ApiResponse<ForumTopicDetailDto>>('/api/forum/topics', topicData));
    },
    updateTopic: async (topicId: number, topicData: UpdateForumTopicDto): Promise<void> => {
        return callApi(api.put<ApiResponse<void>>(`/api/forum/topics/${topicId}`, topicData));
    },
    deleteTopic: async (topicId: number): Promise<void> => {
        return callApi(api.delete<ApiResponse<void>>(`/api/forum/topics/${topicId}`));
    },
    lockTopic: async (topicId: number): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/forum/topics/${topicId}/lock`));
    },
    unlockTopic: async (topicId: number): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/forum/topics/${topicId}/unlock`));
    },
    stickyTopic: async (topicId: number): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/forum/topics/${topicId}/sticky`));
    },
    unstickyTopic: async (topicId: number): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/forum/topics/${topicId}/unsticky`));
    },
};

// Coins API Functions
export const coins = {
    updateCoins: async (userId: number, data: UpdateCoinsRequestDto): Promise<void> => {
        await api.patch(`/api/coins/${userId}`, data);
    },
    transfer: async (data: TransferCoinsRequestDto): Promise<void> => {
        await api.post('/api/coins/transfer', data);
    },
    tip: async (data: TipCoinsRequestDto): Promise<void> => {
        await api.post('/api/coins/tip', data);
    },
};

// Reactions API Functions
export const reactions = {
    getReactions: async (commentId: number): Promise<CommentReactionsDto> => {
        return callApi(api.get<ApiResponse<CommentReactionsDto>>(`/api/reactions/comment/${commentId}`));
    },
    addReaction: async (commentId: number, data: AddReactionRequestDto): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>(`/api/reactions/comment/${commentId}`, data));
    },
    removeReaction: async (commentId: number, type: ReactionType): Promise<void> => {
        return callApi(api.delete<ApiResponse<void>>(`/api/reactions/comment/${commentId}/${type}`));
    },
    getReactionsBatch: async (commentIds: number[]): Promise<Record<number, CommentReactionsDto>> => {
        const data: GetReactionsBatchRequestDto = { commentIds };
        return callApi(api.post<ApiResponse<Record<number, CommentReactionsDto>>>('/api/reactions/batch', data));
    }
};

// TopPlayers API Functions
export const topPlayers = {
    getTopPlayers: async (type: TopPlayerType): Promise<UserPublicProfileDto[]> => {
        const response = await api.get(`/api/top-players/${type}`);
        return response.data;
    },

    refreshCache: async (): Promise<void> => {
        await api.post('/api/top-players/refresh-cache');
    },
};

// Store API Functions
export const store = {
    getItems: async (): Promise<StoreItemDto[]> => {
        const response = await api.get('/api/store/items');
        return response.data;
    },
    purchaseItem: async (itemId: number, payload?: object): Promise<void> => {
        await api.post(`/api/store/purchase`, { storeItemId: itemId, ...payload });
    },
};

// Media API Functions
export const media = {
    getMetadata: async (input: string, language: string = 'zh-CN'): Promise<TMDbMovieDto> => {
        const params = new URLSearchParams({
            input: input,
            language: language,
        });
        return callApi(api.get<ApiResponse<TMDbMovieDto>>(`/api/Media/metadata?${params.toString()}`));
    },
};

// Torrents API Functions
export const torrents = {
    getCategories: async (): Promise<TorrentCategoryDto[]> => {
        return callApi(api.get<ApiResponse<TorrentCategoryDto[]>>('/api/torrents/categories'));
    },
    uploadTorrent: async (
        torrentFile: File,
        metadata: {
            title?: string;
            subtitle?: string;
            description: string;
            category: string;
            imdbId?: string;
            tmdbId?: number;
            isAnonymous?: boolean;
            mediaInfo?: string;
            technicalSpecs?: TechnicalSpecsDto;
        },
        screenshots?: File[], // 用户上传的截图（恰好 3 张）
        onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
    ): Promise<UploadTorrentResponseDto> => {
        const formData = new FormData();
        formData.append('File', torrentFile);
        formData.append('Description', metadata.description);
        formData.append('Category', metadata.category);
        
        if (metadata.title) formData.append('Title', metadata.title);
        if (metadata.subtitle) formData.append('Subtitle', metadata.subtitle);
        if (metadata.imdbId) formData.append('ImdbId', metadata.imdbId);
        if (metadata.tmdbId) formData.append('TMDbId', metadata.tmdbId.toString());
        if (metadata.isAnonymous) formData.append('IsAnonymous', metadata.isAnonymous.toString());
        if (metadata.mediaInfo) formData.append('MediaInfo', metadata.mediaInfo);
        
        if (metadata.technicalSpecs) {
            if (metadata.technicalSpecs.resolution) formData.append('TechnicalSpecs.Resolution', metadata.technicalSpecs.resolution);
            if (metadata.technicalSpecs.videoCodec) formData.append('TechnicalSpecs.VideoCodec', metadata.technicalSpecs.videoCodec);
            if (metadata.technicalSpecs.audioCodec) formData.append('TechnicalSpecs.AudioCodec', metadata.technicalSpecs.audioCodec);
            if (metadata.technicalSpecs.source) formData.append('TechnicalSpecs.Source', metadata.technicalSpecs.source);
            // Subtitles might be handled differently if it's a list, but assuming string for now based on DTO
            if (metadata.technicalSpecs.subtitles) formData.append('TechnicalSpecs.Subtitles', metadata.technicalSpecs.subtitles);
        }
        
        // 添加截图（必须恰好 3 张）
        if (screenshots && screenshots.length > 0) {
            screenshots.forEach((screenshot) => {
                formData.append('Screenshots', screenshot);
            });
        }

        return callApi(api.post<ApiResponse<UploadTorrentResponseDto>>('/api/torrents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress
        }));
    },
    getTorrentById: async (id: number): Promise<TorrentDto> => {
        return callApi(api.get<ApiResponse<TorrentDto>>(`/api/torrents/${id}`));
    },
    deleteTorrent: async (id: number): Promise<void> => {
        return callApi(api.delete<ApiResponse<void>>(`/api/torrents/${id}`));
    },
    setTorrentFree: async (torrentId: number, freeUntil: string): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/torrents/${torrentId}/free`, JSON.stringify(freeUntil)));
    },
    setTorrentSticky: async (torrentId: number, status: SetStickyRequestDto): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/torrents/${torrentId}/sticky`, status));
    },
    downloadTorrent: async (torrentId: number): Promise<Blob> => {
        const response = await api.get(`/api/torrents/${torrentId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
    completeTorrentInfo: async (torrentId: number, info: CompleteInfoRequestDto): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/torrents/${torrentId}/info`, info));
    },
    applyFreeleech: async (torrentId: number): Promise<void> => {
        return callApi(api.patch<ApiResponse<void>>(`/api/torrents/${torrentId}/freeleech`));
    },
};
// ... and so on for all other API groups

// DTOs for Stats related operations
export interface SiteStatsDto {
    totalUsers: number;
    userRoleCounts: Record<string, number>;
    totalTorrents: number;
    deadTorrents: number;
    totalTorrentsSize: number;
    totalPeers: number;
    totalUploaded: number;
    totalDownloaded: number;
    nominalUploaded: number;
    nominalDownloaded: number;
    usersRegisteredToday: number;
    torrentsAddedToday: number;
    totalSeeders: number;
    totalLeechers: number;
    totalRequests: number;
    filledRequests: number;
    totalForumTopics: number;
    totalForumPosts: number;
    totalBannedUsers: number;
}

export interface PollOptionDto {
    id: number;
    text: string;
    voteCount: number;
}

export interface PollDto {
    id: number;
    question: string;
    // Note: The backend seems to return different shapes for this.
    // GET /api/polls returns PollOptionDto[], but GET /api/polls/latest returns Record<string, number>
    // We will handle this defensively in the component.
    options?: PollOptionDto[] | Record<string, number>;
    results?: Record<string, number>; // from latest
    totalVotes: number;
    createdAt: string; // date-time
    createdBy?: number;
    userVotedOption?: string | null; // This is returned by /latest but not in the generated spec
    isActive?: boolean; // This is returned by /latest but not in the generated spec
}

export interface CreatePollDto {
    question: string;
    options: string[];
    expiresAt?: string;
}

export interface VoteDto {
    optionId?: number; // Kept for compatibility if needed elsewhere
    option?: string; // As per the actual endpoint requirement
}

/**
 * Credential DTO - 下载凭证信息（U-9: 添加使用统计）
 */
export interface CredentialDto {
    id: number;
    torrentId: number;
    torrentName: string;
    credential: string; // UUID格式
    isRevoked: boolean;
    createdAt: string; // ISO 8601 date-time
    revokedAt: string | null; // ISO 8601 date-time
    
    // U-9: 使用统计信息
    totalUploadedBytes?: number;      // 总上传字节数
    totalDownloadedBytes?: number;    // 总下载字节数
    announceCount?: number;           // Announce 次数
    firstUsedAt?: string | null;      // 首次使用时间
    lastUsedAt?: string | null;       // 最后使用时间
    lastIpAddress?: string | null;    // 最后使用的IP
    lastUserAgent?: string | null;    // 最后使用的客户端
}

export interface RevokeCredentialRequest {
    reason?: string | null;
}

/**
 * 批量撤销凭证响应 (U-5)
 */
export interface RevokeAllCredentialsResponse {
    revokedCount: number;           // 撤销数量
    affectedTorrentIds: number[];   // 受影响的种子ID列表
    message: string;                // 结果消息
}

/**
 * RSS Feed 类型枚举 - 数字枚举（U-6: 类型安全改进）
 */
export enum RssFeedType {
    Latest = 0,
    Category = 1,
    Bookmarks = 2,
    Custom = 3,
}

/**
 * RSS Feed Token DTO（U-6: feedType 改为数字枚举）
 */
export interface RssFeedTokenDto {
    id: number;
    token: string; // UUID格式
    feedType: RssFeedType; // 🔄 数字枚举（原为 string）
    name: string | null;
    categoryFilter: string[] | null; // ✅ 后端现在直接返回数组
    maxResults: number;
    isActive: boolean;
    expiresAt: string | null; // ISO 8601 date-time
    lastUsedAt: string | null; // ISO 8601 date-time
    usageCount: number;
    userAgent: string | null;
    lastIp: string | null;
    createdAt: string; // ISO 8601 date-time
    revokedAt: string | null; // ISO 8601 date-time
}

/**
 * 创建 RSS Feed Token 请求（U-6: feedType 改为数字枚举）
 */
export interface CreateRssFeedTokenRequest {
    feedType: RssFeedType; // 🔄 数字枚举
    name?: string | null;
    categoryFilter?: string[] | null; // 数组类型
    maxResults?: number; // 默认50
    expiresAt?: string | null; // ISO 8601 date-time
}

export interface RssFeedTokenResponse {
    token: RssFeedTokenDto;
    rssUrl: string;
}

// ==================== 作弊检测枚举 (U-1, U-6, U-8) ====================

/**
 * 作弊检测类型 - 数字枚举（与后端一致）
 */
export enum CheatDetectionType {
    AnnounceFrequency = 1,
    MultiLocation = 2,
}

/**
 * 作弊严重等级 - 数字枚举
 */
export enum CheatSeverity {
    Low = 1,      // 轻微
    Medium = 2,   // 中等
    High = 3,     // 严重
    Critical = 4, // 致命
}

/**
 * 作弊日志DTO
 * @remarks
 * - reason 字段已删除（U-1: 与 detectionType 冗余）
 * - severity 字段已添加（U-8: 支持严重等级）
 * - detectionType 改为数字枚举（U-6: 类型安全）
 */
export interface CheatLogDto {
    id: number;
    userId: number;
    userName: string | null;
    torrentId: number | null;
    torrentName: string | null;
    detectionType: CheatDetectionType; // 数字枚举
    severity: CheatSeverity;           // 严重等级
    details: string | null;            // 详细信息（整合了原 reason 的内容）
    ipAddress: string | null;
    timestamp: string; // ISO 8601 date-time
    isProcessed: boolean;
    processedAt: string | null;
    processedByUserId: number | null;
    processedByUsername: string | null;
    adminNotes: string | null;
}

export interface CheatLogFilters {
    page?: number;
    pageSize?: number;
    userId?: number;
    detectionType?: CheatDetectionType;
}

export interface SystemLogDto {
    id: number;
    level: string;
    message: string;
    timestamp: string; // date-time
    exception?: string;
}

export interface UserSummaryDto {
    id: number;
    userName?: string | null;
}

export interface DuplicateIpUserDto {
    ip?: string | null;
    users?: UserSummaryDto[] | null;
}

export interface BannedClientDto {
    id: number;
    peer_id_prefix?: string | null;
    user_agent_pattern?: string | null;
    reason?: string | null;
}

export interface SiteSettingsDto {
    // 1. 基础设置 (General)
    siteName: string;
    logoUrl?: string | null;
    contactEmail?: string | null;

    // 2. 注册设置 (Registration)
    isRegistrationOpen: boolean;

    // 3. 功能开关 (Features)
    isRequestSystemEnabled: boolean;
    isForumEnabled: boolean;

    // 4. Tracker设置 (Tracker)
    trackerUrl: string;
    announceIntervalSeconds: number;
    globalFreeleechEnabled: boolean;

    // 5. Announce间隔控制
    minAnnounceIntervalSeconds: number;
    enforcedMinAnnounceIntervalSeconds: number;

    // 6. 多地点检测 (Multi-Location Detection)
    enableMultiLocationDetection: boolean;
    multiLocationDetectionWindowMinutes: number;
    logMultiLocationCheating: boolean;

    // 7. IP变更容忍 (IP Change Tolerance)
    allowIpChange: boolean;
    minIpChangeIntervalMinutes: number;

    // 8. 速度限制 (Speed Limits)
    maxUploadSpeed: number;
    maxDownloadSpeed: number;

    // 9. 速度检查配置
    minSpeedCheckIntervalSeconds: number;
    enableDownloadSpeedCheck: boolean;

    // 10. 作弊检测 (Cheat Detection)
    cheatWarningAnnounceThreshold: number;
    autoBanAfterCheatWarnings: number;

    // 11. 凭证清理 (Credential Cleanup)
    credentialCleanupDays: number;
    enableCredentialAutoCleanup: boolean;

    // 12. 金币系统 (Coins)
    invitePrice: number;
    inviteExpirationDays: number;
    createRequestCost: number;
    fillRequestBonus: number;
    commentBonus: number;
    uploadTorrentBonus: number;
    maxDailyCommentBonuses: number;
    tipTaxRate: number;
    transferTaxRate: number;

    // 13. 种子设置 (Torrents)
    torrentStoragePath: string;
    maxTorrentSize: number;

    // 14. 金币生成系统 (Coin Generation)
    generationIntervalMinutes: number;
    baseGenerationRate: number;
    sizeFactorMultiplier: number;
    mosquitoFactorMultiplier: number;
    seederFactorMultiplier: number;

    // 15. 内容审核 (Content Moderation)
    contentEditWindowMinutes: number;
}

/**
 * 匿名用户可访问的公开配置（无需认证）
 * 用于注册页、登录页、页脚等场景
 */
export interface AnonymousPublicSettingsDto {
  siteName: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  isRegistrationOpen: boolean;
  isForumEnabled: boolean;
}

/**
 * 认证用户可访问的完整公开配置（需要认证）
 * 继承匿名配置，添加金币系统相关字段
 */
export interface PublicSiteSettingsDto extends AnonymousPublicSettingsDto {
  // 认证用户额外字段
  isRequestSystemEnabled: boolean;
  createRequestCost: number;
  fillRequestBonus: number;
  tipTaxRate: number;
  transferTaxRate: number;
  invitePrice: number;
  commentBonus: number;
  uploadTorrentBonus: number;
  maxDailyCommentBonuses: number;
}

// Polls API Functions
export const polls = {
    getPolls: async (): Promise<PollDto[]> => {
        const response = await api.get('/api/polls');
        return response.data;
    },
    createPoll: async (poll: CreatePollDto): Promise<PollDto> => {
        const response = await api.post('/api/polls', poll);
        return response.data;
    },
    deletePoll: async (id: number): Promise<void> => {
        await api.delete(`/api/polls/${id}`);
    },
    vote: async (id: number, vote: VoteDto): Promise<void> => {
        await api.post(`/api/polls/${id}/vote`, vote);
    },
    getLatest: async (): Promise<PollDto> => {
        const response = await api.get('/api/polls/latest');
        return response.data;
    }
};

// Admin API Functions
export const admin = {
    getUsers: async (page: number = 1, pageSize: number = 50, searchTerm?: string): Promise<PaginatedResult<UserAdminProfileDto>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        if (searchTerm) {
            params.append('q', searchTerm);
        }
        return callApi(api.get<ApiResponse<PaginatedResult<UserAdminProfileDto>>>(`/api/Admin/users?${params.toString()}`));
    },
    updateRegistrationSettings: async (settings: UpdateRegistrationSettingsDto): Promise<void> => {
        await api.put('/api/Admin/settings/registration', settings);
    },
    getSiteSettings: async (): Promise<SiteSettingsDto> => {
        return callApi(api.get<ApiResponse<SiteSettingsDto>>('/api/Admin/settings/site'));
    },
    updateSiteSettings: async (settings: SiteSettingsDto): Promise<void> => {
        return callApi(api.put<ApiResponse<void>>('/api/Admin/settings/site', settings));
    },
    getBannedClients: async (): Promise<BannedClientDto[]> => {
        return callApi(api.get<ApiResponse<BannedClientDto[]>>('/api/Admin/banned-clients'));
    },
    addBannedClient: async (client: BannedClientDto): Promise<BannedClientDto> => {
        return callApi(api.post<ApiResponse<BannedClientDto>>('/api/Admin/banned-clients', client));
    },
    deleteBannedClient: async (id: number): Promise<void> => {
        return callApi(api.delete<ApiResponse<void>>(`/api/Admin/banned-clients/${id}`));
    },
    getDuplicateIps: async (): Promise<DuplicateIpUserDto[]> => {
        return callApi(api.get<ApiResponse<DuplicateIpUserDto[]>>('/api/Admin/duplicate-ips'));
    },
    getSystemLogs: async (q?: string, level?: string, offset?: number, limit?: number): Promise<SystemLogDto[]> => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (level) params.append('level', level);
        if (offset) params.append('offset', offset.toString());
        if (limit) params.append('limit', limit.toString());
        return callApi(api.get<ApiResponse<SystemLogDto[]>>(`/api/Admin/logs/system?${params.toString()}`));
    },
};

export const settings = {
    /**
     * 获取匿名公开配置（无需认证）
     * 用于注册页、登录页、页脚等场景
     */
    getAnonymousPublicSettings: async (): Promise<AnonymousPublicSettingsDto> => {
        try {
            return await callApi(api.get<ApiResponse<AnonymousPublicSettingsDto>>('/api/settings/public/anonymous'));
        } catch (error) {
            console.error('Failed to fetch anonymous settings:', error);
            // 返回默认配置作为降级方案
            return {
                siteName: 'TorrentHub',
                logoUrl: null,
                contactEmail: null,
                isRegistrationOpen: false, // 默认关闭注册（安全优先）
                isForumEnabled: true,
            };
        }
    },

    /**
     * 获取完整公开配置（需要认证）
     * 包含金币系统等完整配置信息
     */
    getPublicSettings: async (): Promise<PublicSiteSettingsDto> => {
        return callApi(api.get<ApiResponse<PublicSiteSettingsDto>>('/api/settings/public'));
    },
};

// TorrentListing API Functions
export const torrentListing = {
    getTorrentListing: async (page: number = 1, pageSize: number = 50, category?: string, searchTerm?: string, sortBy?: string, sortOrder?: string): Promise<PaginatedResult<TorrentDto>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        if (category) {
            params.append('category', category);
        }
        if (searchTerm) {
            params.append('searchTerm', searchTerm);
        }
        if (sortBy) {
            params.append('sortBy', sortBy);
        }
        if (sortOrder) {
            params.append('sortOrder', sortOrder);
        }
        const response = await api.get(`/api/torrents/listing?${params.toString()}`);
        return response.data;
    },
};

// ==================== Credential认证系统 API ====================
export const credential = {
    /**
     * 获取当前用户的所有凭证列表（支持分页和筛选）
     * @param options 查询选项
     */
    getMy: async (options?: {
        searchKeyword?: string;
        includeRevoked?: boolean;
        onlyRevoked?: boolean;
        sortBy?: string;
        sortDirection?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResult<CredentialDto>> => {
        const params = new URLSearchParams();
        if (options?.searchKeyword) params.append('SearchKeyword', options.searchKeyword);
        if (options?.includeRevoked !== undefined) params.append('IncludeRevoked', options.includeRevoked.toString());
        if (options?.onlyRevoked !== undefined) params.append('OnlyRevoked', options.onlyRevoked.toString());
        if (options?.sortBy) params.append('SortBy', options.sortBy);
        if (options?.sortDirection) params.append('SortDirection', options.sortDirection);
        if (options?.page) params.append('Page', options.page.toString());
        if (options?.pageSize) params.append('PageSize', options.pageSize.toString());

        return callApi(api.get<ApiResponse<PaginatedResult<CredentialDto>>>(`/api/Credential/my?${params.toString()}`));
    },

    /**
     * 撤销单个凭证（使用UUID）
     * @param credentialUuid 凭证的UUID
     * @param reason 撤销原因（可选）
     */
    revoke: async (credentialUuid: string, reason?: string): Promise<void> => {
        const data: RevokeCredentialRequest = reason ? { reason } : {};
        return callApi(api.post<ApiResponse<void>>(`/api/Credential/revoke/${credentialUuid}`, data));
    },

    /**
     * 撤销当前用户的所有凭证
     * @param reason 撤销原因（可选）
     * @returns 返回撤销统计信息
     */
    revokeAll: async (reason?: string): Promise<RevokeAllCredentialsResponse> => {
        const data: RevokeCredentialRequest = reason ? { reason } : {};
        return callApi(api.post<ApiResponse<RevokeAllCredentialsResponse>>('/api/Credential/revoke-all', data));
    },

    /**
     * 批量撤销指定的凭证（使用UUID数组）
     * @param credentialUuids 凭证UUID数组
     * @param reason 撤销原因（可选）
     * @returns 返回撤销统计信息
     */
    revokeBatch: async (credentialUuids: string[], reason?: string): Promise<RevokeAllCredentialsResponse> => {
        const data = {
            credentialIds: credentialUuids,
            reason: reason || undefined,
        };
        return callApi(api.post<ApiResponse<RevokeAllCredentialsResponse>>('/api/Credential/revoke-batch', data));
    },

    /**
     * 获取指定种子的凭证信息
     * @param torrentId 种子ID
     */
    getByTorrent: async (torrentId: number): Promise<string> => {
        return callApi(api.get<ApiResponse<string>>(`/api/Credential/torrent/${torrentId}`));
    },

    // ========== 管理员专用API ==========
    /**
     * 获取指定用户的所有凭证（管理员，支持分页和筛选）
     * @param userId 用户ID
     * @param options 查询选项
     */
    getUserCredentials: async (userId: number, options?: {
        searchKeyword?: string;
        includeRevoked?: boolean;
        onlyRevoked?: boolean;
        sortBy?: string;
        sortDirection?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResult<CredentialDto>> => {
        const params = new URLSearchParams();
        if (options?.searchKeyword) params.append('SearchKeyword', options.searchKeyword);
        if (options?.includeRevoked !== undefined) params.append('IncludeRevoked', options.includeRevoked.toString());
        if (options?.onlyRevoked !== undefined) params.append('OnlyRevoked', options.onlyRevoked.toString());
        if (options?.sortBy) params.append('SortBy', options.sortBy);
        if (options?.sortDirection) params.append('SortDirection', options.sortDirection);
        if (options?.page) params.append('Page', options.page.toString());
        if (options?.pageSize) params.append('PageSize', options.pageSize.toString());

        return callApi(api.get<ApiResponse<PaginatedResult<CredentialDto>>>(`/api/Credential/user/${userId}?${params.toString()}`));
    },

    /**
     * 撤销单个凭证（管理员）
     * @param credentialUuid 凭证的UUID
     * @param reason 撤销原因
     */
    adminRevoke: async (credentialUuid: string, reason: string): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>(`/api/Credential/admin/revoke/${credentialUuid}`, { reason }));
    },

    /**
     * 撤销指定用户的所有凭证（管理员）
     * @param userId 用户ID
     * @param reason 撤销原因
     * @returns 返回撤销统计信息
     */
    adminRevokeUser: async (userId: number, reason: string): Promise<RevokeAllCredentialsResponse> => {
        return callApi(api.post<ApiResponse<RevokeAllCredentialsResponse>>(`/api/Credential/admin/revoke-user/${userId}`, { reason }));
    },

    /**
     * 批量撤销凭证（管理员）
     * @param credentialUuids 凭证UUID数组
     * @param reason 撤销原因
     * @returns 返回撤销统计信息
     */
    adminRevokeBatch: async (credentialUuids: string[], reason: string): Promise<RevokeAllCredentialsResponse> => {
        const data = {
            credentialIds: credentialUuids,
            reason,
        };
        return callApi(api.post<ApiResponse<RevokeAllCredentialsResponse>>('/api/Credential/admin/revoke-batch', data));
    },

    /**
     * 清理不活跃的凭证（管理员）
     * @param inactiveDays 不活跃天数阈值（默认90天）
     * @returns 返回清理数量
     */
    adminCleanup: async (inactiveDays: number = 90): Promise<number> => {
        const params = new URLSearchParams({
            inactiveDays: inactiveDays.toString(),
        });
        return callApi(api.post<ApiResponse<number>>(`/api/Credential/admin/cleanup?${params.toString()}`));
    },
};

// ==================== RSS Feed Token系统 API ====================
export const rssFeed = {
    /**
     * 创建新的RSS Token
     * @param data 创建请求数据
     */
    createToken: async (data: CreateRssFeedTokenRequest): Promise<RssFeedTokenResponse> => {
        return callApi(api.post<ApiResponse<RssFeedTokenResponse>>('/api/RssFeed/tokens', data));
    },

    /**
     * 获取当前用户的所有RSS Tokens
     */
    getTokens: async (): Promise<RssFeedTokenDto[]> => {
        return callApi(api.get<ApiResponse<RssFeedTokenDto[]>>('/api/RssFeed/tokens'));
    },

    /**
     * 更新RSS Token（U-11：新增功能）
     * @param tokenId Token的ID
     * @param data 更新数据（所有字段均为可选）
     * @remarks
     * 后端端点: PATCH /api/RssFeed/tokens/{id}
     * 响应格式: ApiResponse<RssFeedTokenDto>
     */
    updateToken: async (tokenId: number, data: Partial<CreateRssFeedTokenRequest>): Promise<RssFeedTokenDto> => {
        return callApi(api.patch<ApiResponse<RssFeedTokenDto>>(`/api/RssFeed/tokens/${tokenId}`, data));
    },

    /**
     * 撤销单个RSS Token
     * @param tokenId Token的ID
     */
    revokeToken: async (tokenId: number): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>(`/api/RssFeed/tokens/${tokenId}/revoke`));
    },

    /**
     * 撤销所有RSS Tokens
     * @returns 返回撤销数量
     */
    revokeAll: async (): Promise<number> => {
        return callApi(api.post<ApiResponse<number>>('/api/RssFeed/tokens/revoke-all'));
    },

    /**
     * 生成RSS Feed URL（前端辅助函数）
     * @param token Token的UUID
     */
    getFeedUrl: (token: string): string => {
        return `${API_BASE_URL}/api/RssFeed/feed/${token}`;
    },
};

// ==================== 反作弊系统 API（管理员专用）====================

/**
 * CheatLog 处理状态接口（U-12）
 */
export interface ProcessCheatLogRequest {
    notes?: string | null;
}

export interface BatchProcessCheatLogsRequest {
    logIds: number[];
    notes?: string | null;
}

export interface BatchProcessResponse {
    processedCount: number;
    totalRequested: number;
}

export const cheatLogs = {
    /**
     * 获取作弊日志列表（分页+筛选）
     * @param filters 筛选条件
     */
    getLogs: async (filters: CheatLogFilters = {}): Promise<PaginatedResult<CheatLogDto>> => {
        const params = new URLSearchParams({
            page: (filters.page || 1).toString(),
            pageSize: (filters.pageSize || 20).toString(),
        });
        
        if (filters.userId !== undefined) {
            params.append('userId', filters.userId.toString());
        }
        if (filters.detectionType !== undefined) {
            params.append('detectionType', filters.detectionType.toString());
        }

        return callApi(api.get<ApiResponse<PaginatedResult<CheatLogDto>>>(`/api/Admin/logs/cheat?${params.toString()}`));
    },

    /**
     * 处理单个作弊日志（U-12）
     * @param id 日志ID
     * @param request 处理请求
     */
    processLog: async (id: number, request: ProcessCheatLogRequest): Promise<CheatLogDto> => {
        return callApi(api.post<ApiResponse<CheatLogDto>>(`/api/Admin/logs/cheat/${id}/process`, request));
    },

    /**
     * 批量处理作弊日志（U-12）
     * @param request 批量处理请求
     */
    processBatch: async (request: BatchProcessCheatLogsRequest): Promise<BatchProcessResponse> => {
        return callApi(api.post<ApiResponse<BatchProcessResponse>>('/api/Admin/logs/cheat/process-batch', request));
    },

    /**
     * 取消处理作弊日志（U-12）
     * @param id 日志ID
     */
    unprocessLog: async (id: number): Promise<void> => {
        return callApi(api.post<ApiResponse<void>>(`/api/Admin/logs/cheat/${id}/unprocess`));
    },
};
