'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon, type IconName } from '../../@core/icons/registry';

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Form progress">
      <ol className="flex flex-wrap items-center gap-3">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!onStepClick || index > currentStep}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onStepClick?.(index)}
                className="flex cursor-pointer items-center gap-2 disabled:cursor-default"
              >
                <span
                  style={{
                    backgroundColor:
                      isCurrent || isComplete ? 'var(--color-primary)' : 'var(--color-canvas)',
                    color:
                      isCurrent || isComplete ? 'var(--color-on-solid)' : 'var(--color-text-muted)',
                    borderColor:
                      isCurrent || isComplete ? 'var(--color-primary)' : 'var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                  }}
                  className="tabular-nums flex size-7 items-center justify-center border text-xs font-semibold"
                >
                  {index + 1}
                </span>
                <span
                  style={{
                    color: isCurrent ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}
                  className="text-xs font-semibold"
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: 'var(--color-border)' }}
                  className="hidden h-px w-8 sm:inline-block"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface OptionCardProps {
  name?: string;
  value?: string;
  type?: 'radio' | 'checkbox';
  checked?: boolean;
  selected?: boolean;
  onChange?: (value: string) => void;
  onSelect?: () => void;
  title: string;
  description?: string;
  icon?: IconName;
  image?: string;
  badge?: string;
  disabled?: boolean;
}

export function OptionCard({
  name = 'option-card',
  value = '',
  type = 'radio',
  checked,
  selected,
  onChange,
  onSelect,
  title,
  description,
  icon,
  image,
  badge,
  disabled = false,
}: OptionCardProps) {
  const isChecked = checked ?? selected ?? false;
  return (
    <label
      style={{
        backgroundColor: isChecked ? 'var(--color-primary-surface)' : 'var(--color-surface)',
        borderColor: isChecked ? 'var(--color-primary)' : 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
      className={clsx(
        'flex cursor-pointer items-start gap-3 border p-4 transition-colors',
        disabled && 'cursor-not-allowed opacity-55',
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={isChecked}
        disabled={disabled}
        onChange={() => {
          onChange?.(value);
          onSelect?.();
        }}
        style={{ accentColor: 'var(--color-primary)' }}
        className="mt-1 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        {image && (
          <img
            src={image}
            alt=""
            style={{ borderRadius: 'var(--radius-sm)' }}
            className="mb-2 h-24 w-full object-cover"
          />
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && (
              <span
                style={{
                  backgroundColor: isChecked ? 'var(--color-primary)' : 'var(--color-canvas)',
                  color: isChecked ? 'var(--color-on-solid)' : 'var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}
                className="flex size-7 shrink-0 items-center justify-center"
              >
                <AppIcon name={icon} size={15} />
              </span>
            )}
            <span style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">
              {title}
            </span>
          </div>
          {badge && (
            <span
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-full)',
              }}
              className="px-2 py-0.5 text-[10px] font-semibold"
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <span style={{ color: 'var(--color-text-muted)' }} className="block text-xs">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}

export interface OptionCardItem {
  value: string;
  title: string;
  description?: string;
  icon?: IconName;
  image?: string;
  badge?: string;
  disabled?: boolean;
}

export interface OptionCardGroupProps {
  name: string;
  options: OptionCardItem[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function OptionCardGroup({
  name,
  options,
  value,
  onChange,
  multiple = false,
  columns = 2,
  className,
}: OptionCardGroupProps) {
  const selectedList = Array.isArray(value) ? value : [value];
  const gridCols =
    columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';

  const handleToggle = (optValue: string) => {
    if (!multiple) {
      onChange(optValue);
      return;
    }
    const next = selectedList.includes(optValue)
      ? selectedList.filter((v) => v !== optValue)
      : [...selectedList, optValue];
    onChange(next);
  };

  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      className={clsx('grid gap-3', gridCols, className)}
    >
      {options.map((opt) => (
        <OptionCard
          key={opt.value}
          name={name}
          value={opt.value}
          type={multiple ? 'checkbox' : 'radio'}
          checked={selectedList.includes(opt.value)}
          onChange={() => handleToggle(opt.value)}
          title={opt.title}
          description={opt.description}
          icon={opt.icon}
          image={opt.image}
          badge={opt.badge}
          disabled={opt.disabled}
        />
      ))}
    </div>
  );
}
