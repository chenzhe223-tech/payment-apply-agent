import {
  Bot,
  Code,
  Globe,
  Sparkles,
  FileText,
  Lightbulb,
} from 'lucide-react';

/**
 * 图标映射
 * 统一使用 lucide 原生 props（size / color / className），
 * 避免与 tdesign-icons-react 的 props 约定冲突。
 */
export const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number | string; color?: string; className?: string }>
> = {
  Bot,
  Sparkles,
  Code,
  FileText,
  Globe,
  Lightbulb,
};

export default ICON_MAP;
