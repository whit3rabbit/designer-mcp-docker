<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    preset?: 'credit-card' | 'phone' | 'date' | 'expiry' | 'currency' | 'postal';
    mask?: string;
    placeholder?: string;
    invalid?: boolean;
  }>(),
  { preset: 'phone', invalid: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const PRESETS: Record<string, string> = {
  'credit-card': '#### #### #### ####',
  phone: '(###) ###-####',
  date: '##/##/####',
  expiry: '##/##',
  postal: '#####-####',
};

function formatValue(raw: string): string {
  if (props.preset === 'currency' && !props.mask) {
    const cleaned = raw.replace(/[^\d.]/g, '');
    const [whole = '', dec] = cleaned.split('.');
    const fmt = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec !== undefined ? `${fmt}.${dec.slice(0, 2)}` : fmt;
  }
  const pattern = props.mask ?? PRESETS[props.preset] ?? '';
  const clean = raw.replace(/[^a-zA-Z0-9]/g, '');
  let out = '';
  let ci = 0;
  for (let pi = 0; pi < pattern.length && ci < clean.length; pi++) {
    const t = pattern[pi];
    if (t === '#' && /\d/.test(clean[ci])) {
      out += clean[ci++];
    } else if (t === 'A' && /[a-zA-Z]/.test(clean[ci])) {
      out += clean[ci++].toUpperCase();
    } else if (t === '*') {
      out += clean[ci++];
    } else if (t !== '#' && t !== 'A') {
      out += t;
    } else {
      ci++;
      pi--;
    }
  }
  return out;
}
</script>

<template>
  <input
    :value="modelValue"
    :placeholder="placeholder || (preset === 'credit-card' ? '4532 •••• •••• ••••' : '(555) 010-9988')"
    :aria-invalid="invalid || undefined"
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
      color: 'var(--color-text)',
      borderRadius: 'var(--radius-md)',
    }"
    class="h-[38px] w-full border px-3 text-sm placeholder:text-[var(--color-text-muted)]"
    @input="emit('update:modelValue', formatValue(($event.target as HTMLInputElement).value))"
  />
</template>
