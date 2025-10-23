import { fumadocsI18n } from "@/i18n/fumadocs-i18n";
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    fumadocsI18n,
    // different props based on `locale`
  };
}