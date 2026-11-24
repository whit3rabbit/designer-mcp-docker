<script setup lang="ts">
import { ref, computed } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    type?: string;
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    invalid?: boolean;
    disabled?: boolean;
    id?: string;
  }>(),
  { type: 'text', size: 'md', invalid: false, disabled: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const showPassword = ref(false);

const inputType = computed(() =>
  props.type === 'password' ? (showPassword.value ? 'text' : 'password') : props.type,
);

const sizeClass = computed(() =>
  props.size === 'sm' ? 'h-8 text-xs' : props.size === 'lg' ? 'h-11 text-sm' : 'h-[38px] text-sm',
);
</script>

<template>
  <div class="relative flex items-center">
    <input
      :id="id"
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
      }"
      :class="[
        'w-full border px-3 transition-colors placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-55',
        sizeClass,
        type === 'password' && 'pe-9',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="type === 'password'"
      type="button"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      class="absolute end-3 cursor-pointer p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      @click="showPassword = !showPassword"
    >
      <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="16" />
    </button>
  </div>
</template>
