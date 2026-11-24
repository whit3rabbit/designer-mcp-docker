<script setup lang="ts">
import { computed } from 'vue';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
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
  Moon,
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
  TrendingUp,
  User,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-vue-next';

const ICON_MAP = {
  activity: Activity,
  'arrow-down-right': ArrowDownRight,
  'arrow-up-right': ArrowUpRight,
  award: Award,
  'bar-chart-3': BarChart3,
  bell: Bell,
  bot: Bot,
  briefcase: Briefcase,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  clock: Clock,
  coins: Coins,
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
  moon: Moon,
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
  'trending-up': TrendingUp,
  user: User,
  'user-plus': UserPlus,
  users: Users,
  x: X,
  zap: Zap,
} as const;

export type IconName = keyof typeof ICON_MAP | (string & {});

const props = withDefaults(
  defineProps<{
    name: IconName;
    size?: number;
    strokeWidth?: number;
  }>(),
  { size: 18, strokeWidth: 1.5 },
);

const IconComponent = computed(() => ICON_MAP[props.name as keyof typeof ICON_MAP] ?? LayoutDashboard);
</script>

<template>
  <component :is="IconComponent" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>
