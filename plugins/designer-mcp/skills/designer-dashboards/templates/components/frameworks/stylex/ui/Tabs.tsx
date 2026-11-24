import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../theme/tokens.stylex';

export type TabsVariant = 'underline' | 'pills' | 'segmented';

interface TabsContextValue {
  value: string;
  setValue: (val: string) => void;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  children: React.ReactNode;
}

export interface TabsListProps {
  'aria-label'?: string;
  children: React.ReactNode;
}

export interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  listUnderline: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.border,
  },
  listPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  listSegmented: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.surfaceSubtle,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens.border,
    alignSelf: 'flex-start',
  },
  triggerBase: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: tokens.fontSans,
    fontSize: tokens.textSm,
    fontWeight: 500,
    cursor: {
      default: 'pointer',
      ':disabled': 'not-allowed',
    },
    opacity: {
      default: 1,
      ':disabled': 0.5,
    },
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: {
      default: tokens.textMuted,
      ':hover': tokens.text,
    },
    transitionProperty: 'color, background-color, border-color',
    transitionDuration: '150ms',
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': tokens.primary,
    },
    outlineOffset: '2px',
  },
  triggerUnderline: {
    paddingBlock: '10px',
    paddingInline: '14px',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    marginBottom: '-1px',
  },
  triggerUnderlineActive: {
    color: tokens.primary,
    borderBottomColor: tokens.primary,
  },
  triggerPills: {
    paddingBlock: '6px',
    paddingInline: '14px',
    borderRadius: tokens.radiusFull,
  },
  triggerPillsActive: {
    backgroundColor: tokens.primarySurface,
    color: tokens.primary,
  },
  triggerSegmented: {
    paddingBlock: '6px',
    paddingInline: '12px',
    borderRadius: tokens.radiusSm,
  },
  triggerSegmentedActive: {
    backgroundColor: tokens.surface,
    color: tokens.text,
    boxShadow: tokens.shadowSm,
  },
  panel: {
    outlineStyle: 'none',
  },
});

export function Tabs({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  variant = 'underline',
  children,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = controlledValue ?? uncontrolled;
  const baseId = React.useId();

  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue, variant, baseId }}>
      <div {...stylex.props(styles.root)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ 'aria-label': ariaLabel, children }: TabsListProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsList must be used inside Tabs');

  const listStyle =
    ctx.variant === 'pills'
      ? styles.listPills
      : ctx.variant === 'segmented'
        ? styles.listSegmented
        : styles.listUnderline;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isRtl =
      typeof document !== 'undefined' &&
      (e.currentTarget.closest('[dir]')?.getAttribute('dir') ?? document.documentElement.dir) === 'rtl';
    const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
    if (e.key !== nextKey && e.key !== prevKey) return;

    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    const idx = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (idx === -1) return;

    e.preventDefault();
    const nextIdx = e.key === nextKey ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
    tabs[nextIdx]?.focus();
    tabs[nextIdx]?.click();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      {...stylex.props(listStyle)}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, disabled = false, children }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used inside Tabs');
  const active = ctx.value === value;

  const variantStyle =
    ctx.variant === 'pills'
      ? [styles.triggerPills, active && styles.triggerPillsActive]
      : ctx.variant === 'segmented'
        ? [styles.triggerSegmented, active && styles.triggerSegmentedActive]
        : [styles.triggerUnderline, active && styles.triggerUnderlineActive];

  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      {...stylex.props(styles.triggerBase, ...variantStyle)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used inside Tabs');
  if (ctx.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      tabIndex={0}
      {...stylex.props(styles.panel)}
    >
      {children}
    </div>
  );
}
