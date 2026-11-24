<script setup lang="ts">
import AppIcon from '../../@core/icons/AppIcon.vue';

export interface ToggleOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | string[];
    options: ToggleOption[];
    multiple?: boolean;
    variant?: 'segmented' | 'outline' | 'pill';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    label?: string;
  }>(),
  { multiple: false, variant: 'segmented', size: 'md', fullWidth: false, label: 'Toggle options' },
);

const emit = defineEmits<{ 'update:modelValue': [value: string | string[]] }>();

const isSelected = (val: string) =>
  Array.isArray(props.modelValue) ? props.modelValue.includes(val) : props.modelValue === val;

function handleSelect(val: string) {
  if (!props.multiple) {
    emit('update:modelValue', val);
    return;
  }
  const current = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
  const next = current.includes(val) ? current.filter((item) => item !== val) : [...current, val];
  emit('update:modelValue', next);
}

const sizeClass = { sm: 'h-7 px-2.5 text-xs', md: 'h-8 px-3 text-xs', lg: 'h-9 px-3.5 text-sm' };
</script>

<template>
  <div
    :role="multiple ? 'group' : 'radiogroup'"
    :aria-label="label"
    :style="{
      backgroundColor: variant === 'segmented' ? 'var(--color-canvas)' : 'transparent',
      borderColor: 'var(--color-border)',
      borderRadius: variant === 'pill' ? 'var(--radius-full)' : 'var(--radius-md)',
    }"
    :class="['inline-flex items-center gap-1 p-1', variant === 'segmented' && 'border', fullWidth && 'flex w-full']"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :role="multiple ? undefined : 'radio'"
      :aria-checked="multiple ? undefined : isSelected(opt.value)"
      :aria-pressed="multiple ? isSelected(opt.value) : undefined"
      :disabled="opt.disabled"
      :style="{
        backgroundColor: isSelected(opt.value)
          ? variant === 'segmented'
            ? 'var(--color-surface)'
            : 'var(--color-primary-surface)'
          : 'transparent',
        color: isSelected(opt.value) ? 'var(--color-primary)' : 'var(--color-text-muted)',
        borderColor:
          variant === 'outline'
            ? isSelected(opt.value)
              ? 'var(--color-primary)'
              : 'var(--color-border)'
            : 'transparent',
        borderRadius: variant === 'pill' ? 'var(--radius-full)' : 'var(--radius-sm)',
      }"
      :class="[
        'inline-flex cursor-pointer items-center justify-center gap-1.5 font-semibold transition-all hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50',
        isSelected(opt.value) && variant === 'segmented' && 'shadow-xs',
        variant === 'outline' && 'border',
        fullWidth && 'flex-1',
        sizeClass[size],
      ]"
      @click="handleSelect(opt.value)"
    >
      <AppIcon v-if="opt.icon" :name="opt.icon" :size="14" />
      <span>{{ opt.label }}</span>
    </button>
  </div>
</template>
