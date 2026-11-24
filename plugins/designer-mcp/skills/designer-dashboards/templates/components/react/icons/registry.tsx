'use client';

import * as React from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  Gauge,
  Globe,
  LayoutDashboard,
  LogOut,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
  Moon,
  Palette,
  Pencil,
  Phone,
  Pin,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sun,
  Table2,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  User,
  UserPlus,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const ICON_REGISTRY = {
  activity: Activity,
  'arrow-down-right': ArrowDownRight,
  'arrow-up-right': ArrowUpRight,
  award: Award,
  'bar-chart-3': BarChart3,
  bell: Bell,
  bot: Bot,
  briefcase: Briefcase,
  calendar: Calendar,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  clock: Clock,
  coins: Coins,
  copy: Copy,
  'dollar-sign': DollarSign,
  download: Download,
  eye: Eye,
  'eye-off': EyeOff,
  gauge: Gauge,
  globe: Globe,
  'layout-dashboard': LayoutDashboard,
  'log-out': LogOut,
  maximize: Maximize2,
  menu: Menu,
  minimize: Minimize2,
  minus: Minus,
  moon: Moon,
  palette: Palette,
  pencil: Pencil,
  phone: Phone,
  pin: Pin,
  plus: Plus,
  receipt: Receipt,
  'rotate-ccw': RotateCcw,
  search: Search,
  settings: Settings,
  'shield-alert': ShieldAlert,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  sparkles: Sparkles,
  sun: Sun,
  table: Table2,
  target: Target,
  'trash-2': Trash2,
  'trending-up': TrendingUp,
  upload: Upload,
  user: User,
  'user-plus': UserPlus,
  users: Users,
  x: X,
  zap: Zap,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_REGISTRY;

export interface AppIconProps {
  name: IconName | string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

export function AppIcon({
  name,
  size = 18,
  strokeWidth = 1.5,
  className,
  'aria-hidden': ariaHidden = true,
}: AppIconProps) {
  const Component = ICON_REGISTRY[name as IconName] ?? LayoutDashboard;
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
