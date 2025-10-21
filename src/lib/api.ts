import axios from 'axios';

// Base Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5014",
    withCredentials: true,
});

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

export interface LoginResponseDto {
    result?: 'Success' | 'RequiresTwoFactor' | 'InvalidCredentials' | 'EmailNotVerified' | 'Banned';
    message?: string | null;
    accessToken?: string | null;
    user?: UserPrivateProfileDto | null;
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

// DTOs for Comment related operations
export interface CommentDto {
    id: number;
    text: string;
    torrentId: number;
    user?: UserDisplayDto;
    createdAt: string; // date-time
    editedAt?: string | null; // date-time
    floor: number;
    parentCommentId?: number | null;
    replyToUser?: UserDisplayDto | null;
    depth: number;
    replyCount: number;
}

export interface CommentListResponse {
    items: CommentDto[];
    hasMore: boolean;
    totalCount: number;
    loadedCount: number;
}

export interface CreateCommentRequestDto {
    text: string;
    parentCommentId?: number | null;
    replyToUserId?: number | null;
}

export interface UpdateCommentRequestDto {
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

export interface TorrentDto {
    id: number;
    name: string;
    description?: string | null;
    size: number;
    uploader?: UserDisplayDto;
    createdAt: string; // date-time
    category: TorrentCategory;
    isFree: boolean;
    freeUntil?: string | null; // date-time
    stickyStatus: TorrentStickyStatus;
    seeders: number;
    leechers: number;
    snatched: number;
    imdbId?: string | null;
    tmDbId?: number | null;
    originalTitle?: string | null;
    tagline?: string | null;
    year?: number | null;
    posterPath?: string | null;
    backdropPath?: string | null;
    runtime?: number | null;
    genres?: string | null;
    directors?: string | null;
    cast?: string | null;
    rating?: number | null;
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
        const response = await api.get('/api/users/me');
        return response.data;
    },
    updateMe: async (user: UpdateUserProfileDto): Promise<void> => {
        await api.patch('/api/users/me', user);
    },
    updateUserTitle: async (title: string): Promise<void> => {
        await api.put('/api/users/me/title', { title });
    },
    changePassword: async (passwords: ChangePasswordDto): Promise<void> => {
        await api.post('/api/users/me/password', passwords);
    },
    getUsers: async (page: number = 1, pageSize: number = 10, searchTerm?: string): Promise<UserPublicProfileDto[]> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        if (searchTerm) {
            params.append('searchTerm', searchTerm);
        }
        const response = await api.get(`/api/users?${params.toString()}`);
        return response.data;
    },
    getUserById: async (id: number): Promise<UserPublicProfileDto> => {
        const response = await api.get(`/api/users/${id}`);
        return response.data;
    },
    updateUserAdmin: async (id: number, user: UpdateUserAdminDto): Promise<void> => {
        await api.patch(`/api/users/${id}`, user);
    },
    getUserUploads: async (id: number): Promise<TorrentDto[]> => {
        const response = await api.get(`/api/users/${id}/uploads`);
        return response.data;
    },
    getUserPeers: async (id: number): Promise<PeerDto[]> => {
        const response = await api.get(`/api/users/${id}/peers`);
        return response.data;
    },
    getUserBadges: async (userId: number): Promise<unknown> => {
        const response = await api.get(`/api/users/${userId}/badges`);
        return response.data;
    },

    getMyBadges: async (): Promise<unknown> => {
        const response = await api.get('/api/users/me/badges');
        return response.data;
    },
    generate2faSetup: async (): Promise<{ qrCodeUri: string, manualEntryKey: string }> => {
        const response = await api.post('/api/users/me/2fa/generate-setup');
        return response.data;
    },
    switchToApp: async (data: TwoFactorVerificationRequestDto): Promise<void> => {
        await api.post('/api/users/me/2fa/switch-to-app', data);
    },
    switchToEmail: async (data: TwoFactorVerificationRequestDto): Promise<void> => {
        await api.post('/api/users/me/2fa/switch-to-email', data);
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
        const response = await api.post('/api/announcements', announcement);
        return response.data;
    },
    getAnnouncements: async (): Promise<AnnouncementDto[]> => {
        const response = await api.get('/api/announcements');
        return response.data;
    },
    updateAnnouncement: async (id: number, announcement: UpdateAnnouncementDto): Promise<AnnouncementDto> => {
        const response = await api.put(`/api/announcements/${id}`, announcement);
        return response.data;
    },
    deleteAnnouncement: async (id: number): Promise<void> => {
        await api.delete(`/api/announcements/${id}`);
    },
};

// Comments API Functions
export const comments = {
    createComment: async (torrentId: number, comment: CreateCommentRequestDto): Promise<CommentDto> => {
        const response = await api.post(`/api/torrents/${torrentId}/comments`, comment);
        return response.data;
    },
    getComments: async (torrentId: number, afterFloor: number = 0, limit: number = 30): Promise<CommentListResponse> => {
        const params = new URLSearchParams({
            afterFloor: afterFloor.toString(),
            limit: limit.toString(),
        });
        const response = await api.get(`/api/torrents/${torrentId}/comments?${params.toString()}`);
        return response.data;
    },
    updateComment: async (id: number, comment: UpdateCommentRequestDto): Promise<void> => {
        await api.put(`/api/comments/${id}`, comment);
    },
    deleteComment: async (id: number): Promise<void> => {
        await api.delete(`/api/comments/${id}`);
    },
};

// Invites API Functions
export const invites = {
    getInvites: async (): Promise<InviteDto[]> => {
        const response = await api.get('/api/invites/me');
        return response.data;
    },
    createInvite: async (): Promise<InviteDto> => {
        const response = await api.post('/api/invites');
        return response.data;
    },
};

// Messages API Functions
export const messages = {
    sendMessage: async (message: SendMessageRequestDto): Promise<void> => {
        await api.post('/api/messages', message);
    },
    getInboxMessages: async (): Promise<MessageDto[]> => {
        const response = await api.get('/api/messages/inbox');
        return response.data;
    },
    getSentMessages: async (): Promise<MessageDto[]> => {
        const response = await api.get('/api/messages/sent');
        return response.data;
    },
    getMessageById: async (messageId: number): Promise<MessageDto> => {
        const response = await api.get(`/api/messages/${messageId}`);
        return response.data;
    },
    deleteMessage: async (messageId: number): Promise<void> => {
        await api.delete(`/api/messages/${messageId}`);
    },
    markMessageAsRead: async (messageId: number): Promise<void> => {
        await api.patch(`/api/messages/${messageId}/read`);
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
        const response = await api.post('/api/requests', request);
        return response.data;
    },
    getRequests: async (page: number = 1, pageSize: number = 20, status?: string, sortBy?: string, sortOrder?: string): Promise<PaginatedResult<RequestDto>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        if (status) params.append('status', status);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        const response = await api.get(`/api/requests?${params.toString()}`);
        return response.data;
    },
    addBounty: async (requestId: number, amount: AddBountyRequestDto): Promise<void> => {
        await api.patch(`/api/requests/${requestId}/bounty`, amount);
    },
    getRequestById: async (id: number): Promise<RequestDto> => {
        const response = await api.get(`/api/requests/${id}`);
        return response.data;
    },
    fillRequest: async (requestId: number, fillData: FillRequestDto): Promise<void> => {
        await api.patch(`/api/requests/${requestId}/fill`, fillData);
    },
    confirm: async (requestId: number): Promise<void> => {
        await api.post(`/api/requests/${requestId}/confirm`);
    },
    reject: async (requestId: number, rejectData: RejectFulfillmentDto): Promise<void> => {
        await api.post(`/api/requests/${requestId}/reject`, rejectData);
    },
};

// Forum API Functions
export const forum = {
    getCategories: async (): Promise<ForumCategoryDto[]> => {
        const response = await api.get('/api/forum/categories');
        return response.data;
    },
    getTopics: async (categoryId: number, page: number = 1, pageSize: number = 20): Promise<PaginatedResult<ForumTopicDto>> => {
        const params = new URLSearchParams({
            categoryId: categoryId.toString(),
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        const response = await api.get(`/api/forum/topics?${params.toString()}`);
        return response.data;
    },
    getTopicById: async (topicId: number, page: number = 1, pageSize: number = 20): Promise<ForumTopicDetailDto> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        const response = await api.get(`/api/forum/topics/${topicId}?${params.toString()}`);
        return response.data;
    },
    getTopicPosts: async (topicId: number, page: number = 1, pageSize: number = 30): Promise<ForumPostListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        const response = await api.get(`/api/forum/topics/${topicId}/posts?${params.toString()}`);
        return response.data;
    },
    createTopic: async (topicData: CreateForumTopicDto): Promise<ForumTopicDetailDto> => {
        const response = await api.post('/api/forum/topics', topicData);
        return response.data;
    },
    createPost: async (topicId: number, postData: CreateForumPostDto): Promise<ForumPostDto> => {
        const response = await api.post(`/api/forum/topics/${topicId}/posts`, postData);
        return response.data;
    },
    updateTopic: async (topicId: number, topicData: UpdateForumTopicDto): Promise<void> => {
        await api.put(`/api/forum/topics/${topicId}`, topicData);
    },
    deleteTopic: async (topicId: number): Promise<void> => {
        await api.delete(`/api/forum/topics/${topicId}`);
    },
    updatePost: async (postId: number, postData: UpdateForumPostDto): Promise<void> => {
        await api.put(`/api/forum/posts/${postId}`, postData);
    },
    deletePost: async (postId: number): Promise<void> => {
        await api.delete(`/api/forum/posts/${postId}`);
    },
    lockTopic: async (topicId: number): Promise<void> => {
        await api.patch(`/api/forum/topics/${topicId}/lock`);
    },
    unlockTopic: async (topicId: number): Promise<void> => {
        await api.patch(`/api/forum/topics/${topicId}/unlock`);
    },
    stickyTopic: async (topicId: number): Promise<void> => {
        await api.patch(`/api/forum/topics/${topicId}/sticky`);
    },
    unstickyTopic: async (topicId: number): Promise<void> => {
        await api.patch(`/api/forum/topics/${topicId}/unsticky`);
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

// Torrents API Functions
export const torrents = {
    getCategories: async (): Promise<TorrentCategoryDto[]> => {
        const response = await api.get('/api/torrents/categories');
        return response.data;
    },
    uploadTorrent: async (
        torrentFile: File,
        description: string,
        category: string,
        imdbId?: string,
        onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
    ): Promise<UploadTorrentResponseDto> => {
        const formData = new FormData();
        formData.append('torrentFile', torrentFile);
        formData.append('Description', description);
        formData.append('Category', category);
        if (imdbId) {
            formData.append('ImdbId', imdbId);
        }

        const response = await api.post<UploadTorrentResponseDto>('/api/torrents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress
        });
        return response.data;
    },
    getTorrentById: async (id: number): Promise<TorrentDto> => {
        const response = await api.get(`/api/torrents/${id}`);
        return response.data;
    },
    deleteTorrent: async (id: number): Promise<void> => {
        await api.delete(`/api/torrents/${id}`);
    },
    setTorrentFree: async (torrentId: number, freeUntil: string): Promise<void> => {
        await api.patch(`/api/torrents/${torrentId}/free`, JSON.stringify(freeUntil));
    },
    setTorrentSticky: async (torrentId: number, status: SetStickyRequestDto): Promise<void> => {
        await api.patch(`/api/torrents/${torrentId}/sticky`, status);
    },
    downloadTorrent: async (torrentId: number): Promise<Blob> => {
        const response = await api.get(`/api/torrents/${torrentId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
    completeTorrentInfo: async (torrentId: number, info: CompleteInfoRequestDto): Promise<void> => {
        await api.patch(`/api/torrents/${torrentId}/info`, info);
    },
    applyFreeleech: async (torrentId: number): Promise<void> => {
        await api.patch(`/api/torrents/${torrentId}/freeleech`);
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
export interface CheatLogDto {
    id: number;
    userId: number;
    userName?: string | null;
    torrentId: number;
    torrentName?: string | null;
    client?: string | null;
    reason?: string | null;
    details?: string | null;
    createdAt: string; // date-time
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
    siteName?: string | null;
    siteDescription?: string | null;
    isRegistrationOpen: boolean;
    isInviteOnly: boolean;
    maintenanceMode: boolean;
}

export interface PublicSiteSettingsDto {
  siteName: string;
  isRequestSystemEnabled: boolean;
  createRequestCost: number;
  fillRequestBonus: number;
  tipTaxRate: number;
  transferTaxRate: number;
  invitePrice: number;
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
        const response = await api.get(`/api/admin/users?${params.toString()}`);
        return response.data;
    },
    updateRegistrationSettings: async (settings: UpdateRegistrationSettingsDto): Promise<void> => {
        await api.put('/api/admin/settings/registration', settings);
    },
    getCheatLogs: async (): Promise<CheatLogDto[]> => {
        const response = await api.get('/api/admin/logs/cheat');
        return response.data;
    },
    getSiteSettings: async (): Promise<SiteSettingsDto> => {
        const response = await api.get('/api/admin/settings/site');
        return response.data;
    },
    updateSiteSettings: async (settings: SiteSettingsDto): Promise<void> => {
        await api.put('/api/admin/settings/site', settings);
    },
    getBannedClients: async (): Promise<BannedClientDto[]> => {
        const response = await api.get('/api/admin/banned-clients');
        return response.data;
    },
    addBannedClient: async (client: BannedClientDto): Promise<BannedClientDto> => {
        const response = await api.post('/api/admin/banned-clients', client);
        return response.data;
    },
    deleteBannedClient: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/banned-clients/${id}`);
    },
    getDuplicateIps: async (): Promise<DuplicateIpUserDto[]> => {
        const response = await api.get('/api/admin/duplicate-ips');
        return response.data;
    },
    getSystemLogs: async (q?: string, level?: string, offset?: number, limit?: number): Promise<SystemLogDto[]> => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (level) params.append('level', level);
        if (offset) params.append('offset', offset.toString());
        if (limit) params.append('limit', limit.toString());
        const response = await api.get(`/api/admin/logs/system?${params.toString()}`);
        return response.data;
    },
};

export const settings = {
    getPublicSettings: async (): Promise<PublicSiteSettingsDto> => {
        const response = await api.get('/api/settings/public');
        return response.data;
    },
};

// TorrentListing API Functions
export const torrentListing = {
    getTorrentListing: async (page: number = 1, pageSize: number = 50, category?: string, searchTerm?: string, sortBy?: string, sortOrder?: string): Promise<PaginatedResult<TorrentDto>> => {
        const params = new URLSearchParams({
            PageNumber: page.toString(),
            PageSize: pageSize.toString(),
        });
        if (category) {
            params.append('Category', category);
        }
        if (searchTerm) {
            params.append('SearchTerm', searchTerm);
        }
        if (sortBy) {
            params.append('SortBy', sortBy);
        }
        if (sortOrder) {
            params.append('SortOrder', sortOrder);
        }
        const response = await api.get(`/api/torrents/listing?${params.toString()}`);
        return response.data;
    },
};
