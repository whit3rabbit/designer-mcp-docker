<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';

export interface AccordionItemData {
  value: string;
  title: string;
  content: string;
}

const props = withDefaults(
  defineProps<{
    items: AccordionItemData[];
    multiple?: boolean;
  }>(),
  { multiple: false },
);

const openKeys = ref<string[]>([]);

function toggle(key: string) {
  const exists = openKeys.value.includes(key);
  if (props.multiple) {
    openKeys.value = exists ? openKeys.value.filter((k) => k !== key) : [...openKeys.value, key];
  } else {
    openKeys.value = exists ? [] : [key];
  }
}
</script>

<template>
  <div
    :style="{
      borderColor: 'var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
    }"
    class="divide-y divide-[var(--color-border)] border"
  >
    <div v-for="item in items" :key="item.value">
      <button
        type="button"
        :aria-expanded="openKeys.includes(item.value)"
        :style="{ color: 'var(--color-text)' }"
        class="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-start text-sm font-semibold"
        @click="toggle(item.value)"
      >
        <span>{{ item.title }}</span>
        <AppIcon
          name="chevron-down"
          :size="16"
          :class="['shrink-0 transition-transform duration-200', openKeys.includes(item.value) && 'rotate-180']"
        />
      </button>
      <div
        v-if="openKeys.includes(item.value)"
        :style="{ color: 'var(--color-text-muted)' }"
        class="px-5 pb-4 text-xs leading-relaxed"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>
