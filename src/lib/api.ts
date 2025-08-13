// DTOs for User related operations
export enum UserRole {
    User = 0,
    Admin = 1,
    // Add other roles as defined in your backend
}

export enum NullableOfUserBanReason {
    // Define ban reasons if available in your OpenAPI spec
}

export type NullableOfUserRole = UserRole | null;

export interface UserForRegistrationDto {
    userName: string;
    password: string;
    email: string;
    inviteCode: string;
}

export interface UserForLoginDto {
    userName: string;
    password: string;
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
    banReason?: NullableOfUserBanReason | null;
    banUntil?: string | null; // date-time
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

export interface UpdateUserProfileDto {
    avatarUrl?: string | null;
    signature?: string | null;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateUserAdminDto {
    role?: NullableOfUserRole | null;
    isBanned?: boolean | null;
    banReason?: NullableOfUserBanReason | null;
    banUntil?: string | null; // date-time
}

// DTOs for Announcement related operations
export interface AnnouncementDto {
    id: number;
    title: string;
    content: string;
    createdAt: string; // date-time
    createdByUser?: UserPublicProfileDto; // Assuming UserPublicProfileDto is defined elsewhere
}

export interface CreateAnnouncementRequestDto {
    title: string;
    content: string;
    sendToInbox: boolean;
}

// DTOs for Comment related operations
export interface CommentDto {
    id: number;
    text: string;
    torrentId: number;
    user?: UserPublicProfileDto; // Assuming UserPublicProfileDto is defined elsewhere
    createdAt: string; // date-time
    editedAt?: string | null; // date-time
}

export interface CreateCommentRequestDto {
    text: string;
}

export interface UpdateCommentRequestDto {
    content: string;
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
    torrent?: TorrentDto; // Assuming TorrentDto is defined elsewhere
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
}

export interface RequestDto {
    id: number;
    title: string;
    description: string;
    requestedByUser?: UserPublicProfileDto;
    filledByUser?: UserPublicProfileDto;
    filledWithTorrentId?: number | null;
    status: RequestStatus;
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
    Movie,
    TV,
    Anime,
    Music,
    Game,
    Software,
    Documentary,
    Other,
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

import { fetchApi, downloadApi } from './apiClient';

// Auth API Functions
export const auth = {
    login: async (user: UserForLoginDto): Promise<unknown> => {
        return fetchApi('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
    },

    register: async (user: UserForRegistrationDto): Promise<unknown> => {
        return fetchApi('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
    },

    logout: async (): Promise<void> => {
        await fetchApi('/api/auth/logout', {
            method: 'POST',
        });
    },

    refresh: async (): Promise<unknown> => {
        return fetchApi('/api/auth/refresh', {
            method: 'POST',
        });
    },
};

// Users API Functions
export const users = {
    getMe: async (): Promise<UserPrivateProfileDto> => {
        return fetchApi('/api/users/me');
    },

    updateMe: async (user: UpdateUserProfileDto): Promise<void> => {
        await fetchApi('/api/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
    },

    changePassword: async (passwords: ChangePasswordDto): Promise<void> => {
        await fetchApi('/api/users/me/password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(passwords),
        });
    },

    getUsers: async (page: number = 1, pageSize: number = 10, searchTerm?: string): Promise<UserPublicProfileDto[]> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        if (searchTerm) {
            params.append('searchTerm', searchTerm);
        }
        return fetchApi(`/api/users?${params.toString()}`);
    },

    getUserById: async (id: number): Promise<UserPublicProfileDto> => {
        return fetchApi(`/api/users/${id}`);
    },

    updateUserAdmin: async (id: number, user: UpdateUserAdminDto): Promise<void> => {
        await fetchApi(`/api/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
    },

    getUserBadges: async (userId: number): Promise<unknown> => {
        return fetchApi(`/api/users/${userId}/badges`);
    },

    getMyBadges: async (): Promise<unknown> => {
        return fetchApi('/api/users/me/badges');
    },
};

// Announcements API Functions
export const announcements = {
    createAnnouncement: async (announcement: CreateAnnouncementRequestDto): Promise<AnnouncementDto> => {
        return fetchApi('/api/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(announcement),
        });
    },

    getAnnouncements: async (): Promise<AnnouncementDto[]> => {
        return fetchApi('/api/announcements');
    },
};

// Comments API Functions
export const comments = {
    createComment: async (torrentId: number, comment: CreateCommentRequestDto): Promise<CommentDto> => {
        return fetchApi(`/api/torrents/${torrentId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(comment),
        });
    },

    getComments: async (torrentId: number, page: number = 1, pageSize: number = 10): Promise<CommentDto[]> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        return fetchApi(`/api/torrents/${torrentId}/comments?${params.toString()}`);
    },

    updateComment: async (id: number, comment: UpdateCommentRequestDto): Promise<void> => {
        await fetchApi(`/api/comments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(comment),
        });
    },

    deleteComment: async (id: number): Promise<void> => {
        await fetchApi(`/api/comments/${id}`, {
            method: 'DELETE',
        });
    },
};

// Invites API Functions
export const invites = {
    getInvites: async (): Promise<InviteDto[]> => {
        return fetchApi('/api/invites/me');
    },

    createInvite: async (): Promise<InviteDto> => {
        return fetchApi('/api/invites', {
            method: 'POST',
        });
    },
};

// Messages API Functions
export const messages = {
    sendMessage: async (message: SendMessageRequestDto): Promise<void> => {
        await fetchApi('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    },

    getInboxMessages: async (): Promise<MessageDto[]> => {
        return fetchApi('/api/messages/inbox');
    },

    getSentMessages: async (): Promise<MessageDto[]> => {
        return fetchApi('/api/messages/sent');
    },

    getMessageById: async (messageId: number): Promise<MessageDto> => {
        return fetchApi(`/api/messages/${messageId}`);
    },

    deleteMessage: async (messageId: number): Promise<void> => {
        await fetchApi(`/api/messages/${messageId}`, {
            method: 'DELETE',
        });
    },

    markMessageAsRead: async (messageId: number): Promise<void> => {
        await fetchApi(`/api/messages/${messageId}/read`, {
            method: 'PATCH',
        });
    },
};

// Reports API Functions
export const reports = {
    submitReport: async (report: SubmitReportRequestDto): Promise<void> => {
        await fetchApi('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(report),
        });
    },

    getPendingReports: async (): Promise<ReportDto[]> => {
        return fetchApi('/api/reports/pending');
    },

    getProcessedReports: async (): Promise<ReportDto[]> => {
        return fetchApi('/api/reports/processed');
    },

    processReport: async (reportId: number, processData: ProcessReportRequestDto): Promise<void> => {
        await fetchApi(`/api/reports/${reportId}/process`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processData),
        });
    },
};

// Requests API Functions
export const requests = {
    createRequest: async (request: CreateRequestDto): Promise<RequestDto> => {
        return fetchApi('/api/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
    },

    getRequests: async (status?: string): Promise<RequestDto[]> => {
        const params = new URLSearchParams();
        if (status) {
            params.append('status', status);
        }
        return fetchApi(`/api/requests?${params.toString()}`);
    },

    addBounty: async (requestId: number, amount: AddBountyRequestDto): Promise<void> => {
        await fetchApi(`/api/requests/${requestId}/bounty`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(amount),
        });
    },

    getRequestById: async (id: number): Promise<RequestDto> => {
        return fetchApi(`/api/requests/${id}`);
    },

    fillRequest: async (requestId: number, fillData: FillRequestDto): Promise<void> => {
        await fetchApi(`/api/requests/${requestId}/fill`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fillData),
        });
    },
};

// Coins API Functions
export const coins = {
    updateCoins: async (userId: number, data: UpdateCoinsRequestDto): Promise<void> => {
        await fetchApi(`/api/coins/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    },
};

// Stats API Functions
export const stats = {
    getStats: async (): Promise<unknown> => {
        return fetchApi('/api/stats');
    },
};

// Store API Functions
export const store = {
    getItems: async (): Promise<StoreItemDto[]> => {
        return fetchApi('/api/store/items');
    },

    purchaseItem: async (itemId: number): Promise<void> => {
        await fetchApi(`/api/store/items/${itemId}/purchase`, {
            method: 'POST',
        });
    },
};

// TopPlayers API Functions
export const topPlayers = {
    getTopPlayers: async (type: TopPlayerType): Promise<UserPublicProfileDto[]> => {
        return fetchApi(`/api/top-players/${type}`);
    },

    refreshCache: async (): Promise<void> => {
        await fetchApi('/api/top-players/refresh-cache', {
            method: 'POST',
        });
    },
};

// Torrents API Functions
export const torrents = {
    uploadTorrent: async (torrentFile: File, description: string, category: string): Promise<void> => {
        const formData = new FormData();
        formData.append('torrentFile', torrentFile);
        formData.append('Description', description);
        formData.append('Category', category);

        await fetchApi('/api/torrents', {
            method: 'POST',
            body: formData,
            // Note: Do NOT set Content-Type header for FormData, browser sets it automatically with boundary
        });
    },

    getTorrentById: async (id: number): Promise<TorrentDto> => {
        return fetchApi(`/api/torrents/${id}`);
    },

    deleteTorrent: async (id: number): Promise<void> => {
        await fetchApi(`/api/torrents/${id}`, {
            method: 'DELETE',
        });
    },

    setTorrentFree: async (torrentId: number, freeUntil: string): Promise<void> => {
        await fetchApi(`/api/torrents/${torrentId}/free`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(freeUntil),
        });
    },

    setTorrentSticky: async (torrentId: number, status: SetStickyRequestDto): Promise<void> => {
        await fetchApi(`/api/torrents/${torrentId}/sticky`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(status),
        });
    },

    downloadTorrent: async (torrentId: number): Promise<Blob> => {
        return downloadApi(`/api/torrents/${torrentId}/download`, {
            method: 'GET',
        });
    },

    completeTorrentInfo: async (torrentId: number, info: CompleteInfoRequestDto): Promise<void> => {
        await fetchApi(`/api/torrents/${torrentId}/info`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(info),
        });
    },

    applyFreeleech: async (torrentId: number): Promise<void> => {
        await fetchApi(`/api/torrents/${torrentId}/freeleech`, {
            method: 'PATCH',
        });
    },
};

// TorrentListing API Functions
export const torrentListing = {
    getTorrentListing: async (pageNumber: number = 1, pageSize: number = 10, category?: string, searchTerm?: string, sortBy?: string, sortOrder?: string): Promise<TorrentDto[]> => {
        const params = new URLSearchParams({
            PageNumber: pageNumber.toString(),
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
        return fetchApi(`/api/torrents/listing?${params.toString()}`);
    },
};
