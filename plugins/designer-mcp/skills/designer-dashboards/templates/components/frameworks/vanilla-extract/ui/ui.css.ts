import { keyframes, style } from '@vanilla-extract/css';
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { vars } from '../theme/tokens.css';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const scaleIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
  to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

const focusRing = {
  ':focus-visible': {
    outline: `2px solid ${vars.color.primary}`,
    outlineOffset: '2px',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

export const buttonRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: vars.font.sans,
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: vars.radius.md,
    border: '1px solid transparent',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease',
    whiteSpace: 'nowrap',
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    ...focusRing,
  },
  variants: {
    variant: {
      solid: {},
      outline: { backgroundColor: 'transparent' },
      tonal: {},
      ghost: { backgroundColor: 'transparent' },
    },
    tone: {
      primary: {},
      neutral: {},
      success: {},
      warning: {},
      error: {},
      info: {},
    },
    size: {
      sm: { height: '2rem', paddingInline: '0.75rem', fontSize: '0.75rem', gap: '0.375rem' },
      md: { height: '2.375rem', paddingInline: '1rem', fontSize: '0.875rem', gap: '0.5rem' },
      lg: { height: '2.75rem', paddingInline: '1.25rem', fontSize: '0.875rem', gap: '0.5rem' },
    },
    iconOnly: {
      true: { paddingInline: 0 },
    },
    fullWidth: {
      true: { width: '100%' },
    },
  },
  compoundVariants: [
    // Solid
    {
      variants: { variant: 'solid', tone: 'primary' },
      style: {
        backgroundColor: vars.color.primary,
        color: vars.color.onSolid,
        ':hover': { backgroundColor: vars.color.primaryHover },
      },
    },
    {
      variants: { variant: 'solid', tone: 'neutral' },
      style: {
        backgroundColor: vars.color.text,
        color: vars.color.surface,
        ':hover': { opacity: 0.9 },
      },
    },
    {
      variants: { variant: 'solid', tone: 'success' },
      style: { backgroundColor: vars.color.success, color: vars.color.onSolid, ':hover': { opacity: 0.92 } },
    },
    {
      variants: { variant: 'solid', tone: 'warning' },
      style: { backgroundColor: vars.color.warning, color: vars.color.onSolid, ':hover': { opacity: 0.92 } },
    },
    {
      variants: { variant: 'solid', tone: 'error' },
      style: { backgroundColor: vars.color.error, color: vars.color.onSolid, ':hover': { opacity: 0.92 } },
    },
    {
      variants: { variant: 'solid', tone: 'info' },
      style: { backgroundColor: vars.color.info, color: vars.color.onSolid, ':hover': { opacity: 0.92 } },
    },
    // Outline
    {
      variants: { variant: 'outline', tone: 'primary' },
      style: {
        borderColor: vars.color.primaryBorder,
        color: vars.color.primary,
        ':hover': { backgroundColor: vars.color.primarySurface },
      },
    },
    {
      variants: { variant: 'outline', tone: 'neutral' },
      style: {
        borderColor: vars.color.border,
        backgroundColor: vars.color.surface,
        color: vars.color.text,
        ':hover': { backgroundColor: vars.color.surfaceSubtle },
      },
    },
    {
      variants: { variant: 'outline', tone: 'success' },
      style: { borderColor: vars.color.successBorder, color: vars.color.success, ':hover': { backgroundColor: vars.color.successSurface } },
    },
    {
      variants: { variant: 'outline', tone: 'warning' },
      style: { borderColor: vars.color.warningBorder, color: vars.color.warning, ':hover': { backgroundColor: vars.color.warningSurface } },
    },
    {
      variants: { variant: 'outline', tone: 'error' },
      style: { borderColor: vars.color.errorBorder, color: vars.color.error, ':hover': { backgroundColor: vars.color.errorSurface } },
    },
    {
      variants: { variant: 'outline', tone: 'info' },
      style: { borderColor: vars.color.infoBorder, color: vars.color.info, ':hover': { backgroundColor: vars.color.infoSurface } },
    },
    // Tonal
    {
      variants: { variant: 'tonal', tone: 'primary' },
      style: { backgroundColor: vars.color.primarySurface, color: vars.color.primary },
    },
    {
      variants: { variant: 'tonal', tone: 'neutral' },
      style: { backgroundColor: vars.color.surfaceSubtle, color: vars.color.text },
    },
    {
      variants: { variant: 'tonal', tone: 'success' },
      style: { backgroundColor: vars.color.successSurface, color: vars.color.success },
    },
    {
      variants: { variant: 'tonal', tone: 'warning' },
      style: { backgroundColor: vars.color.warningSurface, color: vars.color.warning },
    },
    {
      variants: { variant: 'tonal', tone: 'error' },
      style: { backgroundColor: vars.color.errorSurface, color: vars.color.error },
    },
    {
      variants: { variant: 'tonal', tone: 'info' },
      style: { backgroundColor: vars.color.infoSurface, color: vars.color.info },
    },
    // Ghost
    {
      variants: { variant: 'ghost', tone: 'primary' },
      style: { color: vars.color.primary, ':hover': { backgroundColor: vars.color.primarySurface } },
    },
    {
      variants: { variant: 'ghost', tone: 'neutral' },
      style: { color: vars.color.text, ':hover': { backgroundColor: vars.color.surfaceSubtle } },
    },
    {
      variants: { variant: 'ghost', tone: 'error' },
      style: { color: vars.color.error, ':hover': { backgroundColor: vars.color.errorSurface } },
    },
    // Icon-only sizes
    { variants: { iconOnly: true, size: 'sm' }, style: { width: '2rem' } },
    { variants: { iconOnly: true, size: 'md' }, style: { width: '2.375rem' } },
    { variants: { iconOnly: true, size: 'lg' }, style: { width: '2.75rem' } },
  ],
  defaultVariants: {
    variant: 'solid',
    tone: 'primary',
    size: 'md',
    iconOnly: false,
    fullWidth: false,
  },
});

export const spinnerIcon = style({
  animation: `${spin} 0.8s linear infinite`,
});

export type ButtonVariants = RecipeVariants<typeof buttonRecipe>;

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

export const cardRecipe = recipe({
  base: {
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    color: vars.color.text,
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  },
  variants: {
    variant: {
      default: { backgroundColor: vars.color.surface },
      elevated: {
        backgroundColor: vars.color.surfaceElevated,
        boxShadow: '0 4px 16px -4px color-mix(in oklab, var(--color-text) 10%, transparent)',
      },
      subtle: { backgroundColor: vars.color.surfaceSubtle },
    },
    padding: {
      none: { padding: 0 },
      sm: { padding: '0.875rem' },
      md: { padding: '1.25rem' },
      lg: { padding: '1.5rem' },
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  marginBottom: '1rem',
});

export const cardTitle = style({
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: vars.color.text,
});

export const cardSubtitle = style({
  margin: '0.25rem 0 0',
  fontSize: '0.8125rem',
  color: vars.color.textMuted,
});

export type CardVariants = RecipeVariants<typeof cardRecipe>;

/* -------------------------------------------------------------------------- */
/* Badge                                                                      */
/* -------------------------------------------------------------------------- */

export const badgeRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontWeight: 600,
    lineHeight: 1,
    borderRadius: vars.radius.full,
    border: '1px solid transparent',
    whiteSpace: 'nowrap',
  },
  variants: {
    variant: {
      tonal: {},
      solid: {},
      outline: { backgroundColor: 'transparent' },
    },
    tone: {
      primary: {},
      neutral: {},
      success: {},
      warning: {},
      error: {},
      info: {},
    },
    size: {
      sm: { paddingBlock: '0.1875rem', paddingInline: '0.5rem', fontSize: '0.75rem' },
      md: { paddingBlock: '0.25rem', paddingInline: '0.625rem', fontSize: '0.8125rem' },
    },
  },
  compoundVariants: [
    { variants: { variant: 'tonal', tone: 'primary' }, style: { backgroundColor: vars.color.primarySurface, color: vars.color.primary } },
    { variants: { variant: 'tonal', tone: 'neutral' }, style: { backgroundColor: vars.color.surfaceSubtle, color: vars.color.textMuted } },
    { variants: { variant: 'tonal', tone: 'success' }, style: { backgroundColor: vars.color.successSurface, color: vars.color.success } },
    { variants: { variant: 'tonal', tone: 'warning' }, style: { backgroundColor: vars.color.warningSurface, color: vars.color.warning } },
    { variants: { variant: 'tonal', tone: 'error' }, style: { backgroundColor: vars.color.errorSurface, color: vars.color.error } },
    { variants: { variant: 'tonal', tone: 'info' }, style: { backgroundColor: vars.color.infoSurface, color: vars.color.info } },
    { variants: { variant: 'solid', tone: 'primary' }, style: { backgroundColor: vars.color.primary, color: vars.color.onSolid } },
    { variants: { variant: 'solid', tone: 'neutral' }, style: { backgroundColor: vars.color.text, color: vars.color.surface } },
    { variants: { variant: 'solid', tone: 'success' }, style: { backgroundColor: vars.color.success, color: vars.color.onSolid } },
    { variants: { variant: 'solid', tone: 'warning' }, style: { backgroundColor: vars.color.warning, color: vars.color.onSolid } },
    { variants: { variant: 'solid', tone: 'error' }, style: { backgroundColor: vars.color.error, color: vars.color.onSolid } },
    { variants: { variant: 'solid', tone: 'info' }, style: { backgroundColor: vars.color.info, color: vars.color.onSolid } },
    { variants: { variant: 'outline', tone: 'primary' }, style: { borderColor: vars.color.primaryBorder, color: vars.color.primary } },
    { variants: { variant: 'outline', tone: 'neutral' }, style: { borderColor: vars.color.border, color: vars.color.textMuted } },
    { variants: { variant: 'outline', tone: 'success' }, style: { borderColor: vars.color.successBorder, color: vars.color.success } },
    { variants: { variant: 'outline', tone: 'warning' }, style: { borderColor: vars.color.warningBorder, color: vars.color.warning } },
    { variants: { variant: 'outline', tone: 'error' }, style: { borderColor: vars.color.errorBorder, color: vars.color.error } },
    { variants: { variant: 'outline', tone: 'info' }, style: { borderColor: vars.color.infoBorder, color: vars.color.info } },
  ],
  defaultVariants: {
    variant: 'tonal',
    tone: 'primary',
    size: 'sm',
  },
});

export type BadgeVariants = RecipeVariants<typeof badgeRecipe>;

/* -------------------------------------------------------------------------- */
/* Alert                                                                      */
/* -------------------------------------------------------------------------- */

export const alertRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingBlock: '0.875rem',
    paddingInline: '1rem',
    borderRadius: vars.radius.md,
    border: '1px solid transparent',
    fontSize: '0.875rem',
  },
  variants: {
    tone: {
      info: {
        backgroundColor: vars.color.infoSurface,
        borderColor: vars.color.infoBorder,
        color: vars.color.info,
      },
      success: {
        backgroundColor: vars.color.successSurface,
        borderColor: vars.color.successBorder,
        color: vars.color.success,
      },
      warning: {
        backgroundColor: vars.color.warningSurface,
        borderColor: vars.color.warningBorder,
        color: vars.color.warning,
      },
      error: {
        backgroundColor: vars.color.errorSurface,
        borderColor: vars.color.errorBorder,
        color: vars.color.error,
      },
    },
  },
  defaultVariants: {
    tone: 'info',
  },
});

export const alertBody = style({
  flex: 1,
  minWidth: 0,
  color: vars.color.text,
});

export const alertTitle = style({
  margin: 0,
  fontWeight: 600,
  fontSize: '0.875rem',
  color: vars.color.text,
});

export const alertDescription = style({
  margin: '0.25rem 0 0',
  fontSize: '0.8125rem',
  color: vars.color.textMuted,
});

export type AlertVariants = RecipeVariants<typeof alertRecipe>;

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

export const fieldWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
});

export const fieldLabel = style({
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: vars.color.text,
});

export const inputControlWrapper = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

export const inputRecipe = recipe({
  base: {
    width: '100%',
    fontFamily: vars.font.sans,
    backgroundColor: vars.color.surface,
    color: vars.color.text,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
    '::placeholder': {
      color: vars.color.textMuted,
    },
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      backgroundColor: vars.color.surfaceSubtle,
    },
    ...focusRing,
  },
  variants: {
    size: {
      sm: { height: '2rem', paddingInline: '0.625rem', fontSize: '0.8125rem' },
      md: { height: '2.375rem', paddingInline: '0.75rem', fontSize: '0.875rem' },
      lg: { height: '2.75rem', paddingInline: '0.875rem', fontSize: '0.9375rem' },
    },
    invalid: {
      true: {
        borderColor: vars.color.error,
      },
    },
    hasLeadingIcon: {
      true: { paddingInlineStart: '2.25rem' },
    },
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
    hasLeadingIcon: false,
  },
});

export const inputLeadingIcon = style({
  position: 'absolute',
  insetInlineStart: '0.75rem',
  color: vars.color.textMuted,
  pointerEvents: 'none',
  display: 'inline-flex',
});

export const fieldHint = style({
  margin: 0,
  fontSize: '0.75rem',
  color: vars.color.textMuted,
});

export const fieldError = style({
  margin: 0,
  fontSize: '0.75rem',
  color: vars.color.error,
});

export type InputVariants = RecipeVariants<typeof inputRecipe>;

/* -------------------------------------------------------------------------- */
/* Select (Ark UI)                                                            */
/* -------------------------------------------------------------------------- */

export const selectTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  width: '100%',
  height: '2.375rem',
  paddingInline: '0.75rem',
  backgroundColor: vars.color.surface,
  color: vars.color.text,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  fontFamily: vars.font.sans,
  fontSize: '0.875rem',
  cursor: 'pointer',
  ...focusRing,
});

export const selectContent = style({
  zIndex: 60,
  minWidth: 'var(--reference-width)',
  backgroundColor: vars.color.surfaceElevated,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: '0.25rem',
  boxShadow: '0 10px 30px -8px color-mix(in oklab, var(--color-text) 16%, transparent)',
  animation: `${fadeIn} 120ms ease`,
});

export const selectItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  paddingBlock: '0.4375rem',
  paddingInline: '0.625rem',
  borderRadius: vars.radius.sm,
  fontSize: '0.875rem',
  color: vars.color.text,
  cursor: 'pointer',
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: vars.color.primarySurface,
      color: vars.color.primary,
    },
    '&[data-state="checked"]': {
      fontWeight: 600,
    },
  },
});

/* -------------------------------------------------------------------------- */
/* Dialog (Ark UI)                                                            */
/* -------------------------------------------------------------------------- */

export const dialogBackdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'color-mix(in oklab, var(--color-text) 45%, transparent)',
  backdropFilter: 'blur(2px)',
  animation: `${fadeIn} 150ms ease`,
});

export const dialogPositioner = style({
  position: 'fixed',
  inset: 0,
  zIndex: 51,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
});

export const dialogContent = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 52,
  width: 'min(100% - 2rem, 32rem)',
  backgroundColor: vars.color.surfaceElevated,
  color: vars.color.text,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: '1.5rem',
  boxShadow: '0 20px 50px -12px color-mix(in oklab, var(--color-text) 24%, transparent)',
  animation: `${scaleIn} 160ms ease`,
  ...focusRing,
});

export const dialogHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  marginBottom: '0.75rem',
});

export const dialogTitle = style({
  margin: 0,
  fontSize: '1.125rem',
  fontWeight: 600,
  color: vars.color.text,
});

export const dialogDescription = style({
  margin: '0 0 1rem',
  fontSize: '0.875rem',
  color: vars.color.textMuted,
});

export const dialogFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '0.5rem',
  marginTop: '1.25rem',
});

/* -------------------------------------------------------------------------- */
/* Tabs (Ark UI)                                                              */
/* -------------------------------------------------------------------------- */

export const tabsList = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.25rem',
  backgroundColor: vars.color.surfaceSubtle,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
});

export const tabsTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  paddingBlock: '0.375rem',
  paddingInline: '0.75rem',
  borderRadius: vars.radius.sm,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.textMuted,
  fontFamily: vars.font.sans,
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background-color 150ms ease, color 150ms ease',
  selectors: {
    '&[data-selected]': {
      backgroundColor: vars.color.surface,
      color: vars.color.text,
      boxShadow: '0 1px 2px color-mix(in oklab, var(--color-text) 8%, transparent)',
    },
  },
  ...focusRing,
});

export const tabsContent = style({
  marginTop: '1rem',
  ...focusRing,
});

/* -------------------------------------------------------------------------- */
/* KPI Card                                                                   */
/* -------------------------------------------------------------------------- */

export const kpiCardRecipe = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1.25rem',
    backgroundColor: vars.color.surface,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    textAlign: 'start',
    width: '100%',
    transition: 'border-color 150ms ease, transform 150ms ease',
  },
  variants: {
    variant: {
      default: {},
      bordered: { borderWidth: '1.5px' },
      horizontal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        ':hover': {
          borderColor: vars.color.primaryBorder,
        },
        ...focusRing,
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    interactive: false,
  },
});

export const kpiHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
});

export const kpiIconBox = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.25rem',
  height: '2.25rem',
  borderRadius: vars.radius.md,
  flexShrink: 0,
});

export const kpiLabel = style({
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: vars.color.textMuted,
});

export const kpiValue = style({
  fontSize: '1.625rem',
  fontWeight: 700,
  lineHeight: 1.2,
  color: vars.color.text,
  fontVariantNumeric: 'tabular-nums',
});

export const kpiFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
});

/* -------------------------------------------------------------------------- */
/* DataTable                                                                  */
/* -------------------------------------------------------------------------- */

export const tableContainer = style({
  width: '100%',
  overflowX: 'auto',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
});

export const tableRoot = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem',
  textAlign: 'start',
});

export const tableHead = style({
  backgroundColor: vars.color.surfaceSubtle,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const tableHeadCell = style({
  paddingBlock: '0.75rem',
  paddingInline: '1rem',
  fontWeight: 600,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: vars.color.textMuted,
  textAlign: 'start',
  whiteSpace: 'nowrap',
});

export const tableSortButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: 0,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textTransform: 'inherit',
  letterSpacing: 'inherit',
  cursor: 'pointer',
  ...focusRing,
});

export const tableRow = style({
  borderBottom: `1px solid ${vars.color.border}`,
  transition: 'background-color 120ms ease',
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: vars.color.surfaceSubtle,
    },
  },
});

export const tableCell = style({
  paddingBlock: '0.75rem',
  paddingInline: '1rem',
  color: vars.color.text,
  fontVariantNumeric: 'tabular-nums',
});

export const tablePagination = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  paddingBlock: '0.75rem',
  paddingInline: '1rem',
  borderTop: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  fontSize: '0.8125rem',
  color: vars.color.textMuted,
});
