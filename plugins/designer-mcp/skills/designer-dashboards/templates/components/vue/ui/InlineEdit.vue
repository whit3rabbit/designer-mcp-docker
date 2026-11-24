<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    ariaLabel?: string;
  }>(),
  { placeholder: 'Click to edit...', ariaLabel: 'Edit value' },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const editing = ref(false);
const draft = ref(props.modelValue);
const inputEl = ref<HTMLInputElement | null>(null);

watch(
  () => props.modelValue,
  (val) => {
    draft.value = val;
  },
);

async function startEdit() {
  editing.value = true;
  await nextTick();
  inputEl.value?.focus();
  inputEl.value?.select();
}

function commit() {
  editing.value = false;
  const trimmed = draft.value.trim();
  if (trimmed && trimmed !== props.modelValue) {
    emit('update:modelValue', trimmed);
  } else {
    draft.value = props.modelValue;
  }
}

function cancel() {
  draft.value = props.modelValue;
  editing.value = false;
}
</script>

<template>
  <input
    v-if="editing"
    ref="inputEl"
    v-model="draft"
    type="text"
    :aria-label="ariaLabel"
    style="background-color: var(--color-surface); border-color: var(--color-primary); color: var(--color-text); border-radius: var(--radius-sm)"
    class="h-8 w-full border px-2 text-sm focus:outline-none"
    @blur="commit"
    @keydown.enter.prevent="commit"
    @keydown.escape="cancel"
  />
  <button
    v-else
    type="button"
    :aria-label="`${ariaLabel}: ${modelValue || placeholder}`"
    style="border-radius: var(--radius-sm)"
    class="group inline-flex cursor-pointer items-center gap-2 px-2 py-1 text-start text-sm transition-colors hover:bg-[var(--color-canvas)]"
    @click="startEdit"
  >
    <span :style="{ color: modelValue ? 'var(--color-text)' : 'var(--color-text-muted)' }">
      {{ modelValue || placeholder }}
    </span>
    <AppIcon
      name="pencil"
      :size="13"
      class="text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
    />
  </button>
</template>
