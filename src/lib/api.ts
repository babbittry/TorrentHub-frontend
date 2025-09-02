import axios from 'axios';

// Base Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5014",
    withCredentials: true,
});

export default api;

// DTOs for User related operations
export enum UserRole {
    Mosquito,
    User,
    PowerUser,
    EliteUser,
    CrazyUser,
    VeteranUser,
    VIP,
    Uploader,
    Seeder,
    Moderator,
    Administrator,
}

export type BanStatus = number;

export type NullableOfUserRole = UserRole | null;

export interface UserForRegistrationDto {
    userName: string;
    password: string;
    email: string;
    inviteCode: string;
    avatarSvg: string;
}

export interface UserForLoginDto {
    userName: string;
    password: string;
}

export interface LoginResponseDto {
    accessToken: string;
    user: UserPrivateProfileDto;
}


export interface UserPublicProfileDto {
    id: number;
    userName: string;
    avatar?: string | null;
    signature?: string | null;
    uploadedBytes: number;
    downloadedBytes: number;
    role: UserRole;
    createdAt: string; // date-time
    coins: number;
    isDoubleUploadActive: boolean;
    doubleUploadExpiresAt?: string | null; // date-time
    isNoHRActive: boolean;
    noHRExpiresAt?: string | null; // date-time
    totalSeedingTimeMinutes: number;
    inviteNum: number;
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
}


export interface UpdateUserProfileDto {
    avatarUrl?: string | null;
    signature?: string | null;
    language?: string | null;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateUserAdminDto {
    role?: NullableOfUserRole | null;
    isBanned?: boolean | null;
    banReason?: string | null;
    banUntil?: string | null; // date-time
}

export interface UpdateRegistrationSettingsDto {
    isOpen: boolean;
}

export interface UserProfileDetailDto {
    id: number;
    userName: string;
    avatar?: string | null;
    invitedBy?: string | null;
    role: UserRole;
    coins: number;
    seedingSize: number;
    email: string;
    createdAt: string; // date-time
    nominalUploadedBytes: number;
    nominalDownloadedBytes: number;
    uploadedBytes: number;
    downloadedBytes: number;
    currentSeedingCount: number;
    currentLeechingCount: number;
    totalLeechingTimeMinutes: number;
    totalSeedingTimeMinutes: number;
    isBanned: boolean;
    banReason?: string | null;
    banUntil?: string | null;
}

// Other DTOs follow...
// (Keeping the rest of the DTOs as they were, assuming they are still valid)

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
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
    user?: UserPublicProfileDto;
    createdAt: string; // date-time
    editedAt?: string | null; // date-time
}

export interface CreateCommentRequestDto {
    text: string;
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
    requestedByUser?: UserPublicProfileDto;
    filledByUser?: UserPublicProfileDto;
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
    authorId: number;
    authorName: string | null;
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
    authorId: number;
    authorName: string | null;
    authorAvatar: string | null;
    createdAt: string; // date-time
    editedAt: string | null; // date-time
    floor: number;
}

export interface ForumTopicDetailDto {
    id: number;
    title: string;
    categoryId: number;
    categoryName: string | null;
    authorId: number;
    authorName: string | null;
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
}

export interface UpdateForumTopicDto {
    title: string;
}

export interface UpdateForumPostDto {
    content: string;
}

// DTOs for Store related operations
export enum StoreItemCode {
    UploadCredit10GB,
    UploadCredit50GB,
    InviteOne,
    InviteFive,
    DoubleUpload,
    NoHitAndRun,
    Badge,
}

export interface StoreItemDto {
    id: number;
    itemCode?: StoreItemCode;
    name: string;
    description?: string | null;
    price: number;
    isAvailable: boolean;
    badgeId?: number | null;
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

export interface TorrentDto {
    id: number;
    name: string;
    description?: string | null;
    size: number;
    uploaderUsername: string;
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
    logout: async (): Promise<void> => {
        await api.post('/api/auth/logout');
    },
    refresh: async (): Promise<LoginResponseDto> => {
        const response = await api.post<LoginResponseDto>('/api/auth/refresh');
        return response.data;
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
    getUserProfile: async (id: number): Promise<UserProfileDetailDto> => {
        const response = await api.get(`/api/users/${id}/profile`);
        return response.data;
    },
    getUserUploads: async (id: number): Promise<TorrentDto[]> => {
        const response = await api.get(`/api/users/${id}/uploads`);
        return response.data;
    },
    getUserPeers: async (id: number): Promise<PeerDto[]> => {
        const response = await api.get(`/api/users/${id}/peers`);
        return response.data;
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
    getComments: async (torrentId: number, page: number = 1, pageSize: number = 10): Promise<PaginatedResult<CommentDto>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
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
    createTopic: async (topicData: CreateForumTopicDto): Promise<ForumTopicDetailDto> => {
        const response = await api.post('/api/forum/topics', topicData);
        return response.data;
    },
    createPost: async (topicId: number, postData: CreateForumPostDto): Promise<ForumPostDto> => {
        const response = await api.post(`/api/forum/topics/${topicId}/posts`, postData);
        return response.data;
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
    uploadTorrent: async (torrentFile: File, description: string, category: string): Promise<void> => {
        const formData = new FormData();
        formData.append('torrentFile', torrentFile);
        formData.append('Description', description);
        formData.append('Category', category);

        await api.post('/api/torrents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
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
    options: PollOptionDto[];
    totalVotes: number;
    createdAt: string; // date-time
    createdBy: number;
}

export interface CreatePollDto {
    question: string;
    options: string[];
}

export interface VoteDto {
    optionId: number;
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
    }
};

// Admin API Functions
export const admin = {
    getUsers: async (page: number = 1, pageSize: number = 50, searchTerm?: string): Promise<PaginatedResult<UserProfileDetailDto>> => {
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
