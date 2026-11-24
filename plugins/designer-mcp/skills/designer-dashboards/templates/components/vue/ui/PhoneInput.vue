<script setup lang="ts">
export interface PhoneValue {
  countryCode: string;
  dialCode: string;
  number: string;
}

const COUNTRIES = [
  { code: 'US', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', dial: '+44', flag: '🇬🇧' },
  { code: 'CA', dial: '+1', flag: '🇨🇦' },
  { code: 'DE', dial: '+49', flag: '🇩🇪' },
  { code: 'AE', dial: '+971', flag: '🇦🇪' },
  { code: 'IN', dial: '+91', flag: '🇮🇳' },
];

const props = withDefaults(
  defineProps<{
    modelValue: PhoneValue;
    invalid?: boolean;
    placeholder?: string;
  }>(),
  { invalid: false, placeholder: '(555) 234-5678' },
);

const emit = defineEmits<{ 'update:modelValue': [value: PhoneValue] }>();

function onCountryChange(code: string) {
  const match = COUNTRIES.find((c) => c.code === code);
  if (match) emit('update:modelValue', { ...props.modelValue, countryCode: match.code, dialCode: match.dial });
}
</script>

<template>
  <div
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
      borderRadius: 'var(--radius-md)',
    }"
    class="flex w-full items-stretch overflow-hidden border"
  >
    <select
      aria-label="Country dial code"
      :value="modelValue.countryCode"
      style="background-color: var(--color-canvas); border-color: var(--color-border); color: var(--color-text)"
      class="h-[38px] shrink-0 cursor-pointer border-e px-2.5 text-xs font-medium focus:outline-none"
      @change="onCountryChange(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="c in COUNTRIES" :key="c.code" :value="c.code">{{ c.flag }} {{ c.dial }}</option>
    </select>
    <input
      type="tel"
      aria-label="Phone number"
      :value="modelValue.number"
      :placeholder="placeholder"
      style="color: var(--color-text)"
      class="h-[38px] min-w-0 flex-1 bg-transparent px-3 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none"
      @input="
        emit('update:modelValue', {
          ...modelValue,
          number: ($event.target as HTMLInputElement).value.replace(/[^\d\s()-]/g, ''),
        })
      "
    />
  </div>
</template>
