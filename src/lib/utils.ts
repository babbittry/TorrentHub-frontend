import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将后端返回的数字或枚举值映射到分类代码字符串
 * 用于处理 ForumCategoryDto.code 字段
 */
const FORUM_CATEGORY_CODE_MAP: Record<string | number, string> = {
  // 支持数字索引
  0: 'Announcement',
  1: 'General',
  2: 'Feedback',
  3: 'Invite',
  4: 'Watering',
  // 支持字符串代码（直接返回）
  'Announcement': 'Announcement',
  'General': 'General',
  'Feedback': 'Feedback',
  'Invite': 'Invite',
  'Watering': 'Watering',
};

/**
 * 规范化论坛分类代码
 * @param code 后端返回的代码（可能是数字或字符串）
 * @returns 规范化的分类代码字符串
 */
export function normalizeForumCategoryCode(code: string | number | undefined | null): string {
  if (code === undefined || code === null) {
    return 'General'; // 默认分类
  }
  
  // 尝试从映射表中获取
  const normalized = FORUM_CATEGORY_CODE_MAP[code];
  if (normalized) {
    return normalized;
  }
  
  // 如果是字符串且不在映射表中，直接返回（可能是新增的分类）
  if (typeof code === 'string') {
    return code;
  }
  
  // 无法识别的值，返回默认
  console.warn(`Unknown forum category code: ${code}, using default 'General'`);
  return 'General';
}

/**
 * 将后端返回的数字或枚举值映射到用户角色代码字符串
 * 用于处理 UserRole 枚举字段
 */
const USER_ROLE_CODE_MAP: Record<string | number, string> = {
  // 支持数字索引（根据 API 中的 UserRole 枚举顺序）
  0: 'Mosquito',
  1: 'User',
  2: 'PowerUser',
  3: 'EliteUser',
  4: 'CrazyUser',
  5: 'VeteranUser',
  6: 'VIP',
  7: 'Uploader',
  8: 'Seeder',
  9: 'Moderator',
  10: 'Administrator',
  // 支持字符串代码（直接返回）
  'Mosquito': 'Mosquito',
  'User': 'User',
  'PowerUser': 'PowerUser',
  'EliteUser': 'EliteUser',
  'CrazyUser': 'CrazyUser',
  'VeteranUser': 'VeteranUser',
  'VIP': 'VIP',
  'Uploader': 'Uploader',
  'Seeder': 'Seeder',
  'Moderator': 'Moderator',
  'Administrator': 'Administrator',
};

/**
 * 规范化用户角色代码
 * @param role 后端返回的角色代码（可能是数字或字符串）
 * @returns 规范化的角色代码字符串
 */
export function normalizeUserRoleCode(role: string | number | undefined | null): string {
  if (role === undefined || role === null) {
    return 'User'; // 默认角色
  }
  
  // 尝试从映射表中获取
  const normalized = USER_ROLE_CODE_MAP[role];
  if (normalized) {
    return normalized;
  }
  
  // 如果是字符串且不在映射表中，直接返回（可能是新增的角色）
  if (typeof role === 'string') {
    return role;
  }
  
  // 无法识别的值，返回默认
  console.warn(`Unknown user role code: ${role}, using default 'User'`);
  return 'User';
}
