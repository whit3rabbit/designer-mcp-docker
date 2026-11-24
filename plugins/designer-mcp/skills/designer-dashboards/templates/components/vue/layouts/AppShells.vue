<script setup lang="ts">
export type AppShellKind =
  | 'list-detail'
  | 'board'
  | 'stream'
  | 'full-canvas'
  | 'pos'
  | 'map-split'
  | 'docs-toc'
  | 'workspace-rail'
  | 'affix-form'
  | 'masonry'
  | 'resizable-split';

withDefaults(
  defineProps<{
    kind?: AppShellKind;
  }>(),
  { kind: 'list-detail' },
);
</script>

<template>
  <!-- List-Detail (2/3-pane) -->
  <div
    v-if="kind === 'list-detail'"
    :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }"
    class="grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12"
  >
    <aside v-if="$slots.sidebar" :style="{ borderColor: 'var(--color-border)' }" class="border-b p-4 lg:col-span-2 lg:border-b-0 lg:border-e">
      <slot name="sidebar" />
    </aside>
    <section :style="{ borderColor: 'var(--color-border)' }" class="overflow-y-auto border-b lg:border-b-0 lg:border-e" :class="$slots.sidebar ? 'lg:col-span-4' : 'lg:col-span-5'">
      <slot name="list" />
    </section>
    <section class="overflow-y-auto p-6" :class="$slots.sidebar ? 'lg:col-span-6' : 'lg:col-span-7'">
      <slot name="detail" />
    </section>
  </div>

  <!-- Board (Kanban) -->
  <div v-else-if="kind === 'board'" class="flex gap-4 overflow-x-auto pb-2">
    <slot />
  </div>

  <!-- Threaded Stream (Chat / AI / Activity) -->
  <div
    v-else-if="kind === 'stream'"
    :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }"
    class="grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12"
  >
    <aside v-if="$slots.sidebar" :style="{ borderColor: 'var(--color-border)' }" class="border-b p-4 lg:col-span-3 lg:border-b-0 lg:border-e">
      <slot name="sidebar" />
    </aside>
    <div class="flex flex-col" :class="$slots.sidebar ? 'lg:col-span-9' : 'lg:col-span-12'">
      <div class="flex-1 overflow-y-auto p-6">
        <slot name="stream" />
      </div>
      <div :style="{ borderColor: 'var(--color-border)' }" class="border-t p-4">
        <slot name="composer" />
      </div>
    </div>
  </div>

  <!-- Point of Sale (Catalog + Ticket Cart) -->
  <div v-else-if="kind === 'pos'" class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <section class="lg:col-span-8 xl:col-span-9">
      <slot name="catalog" />
    </section>
    <aside
      :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }"
      class="rd-card sticky top-20 border p-4 lg:col-span-4 xl:col-span-3"
    >
      <slot name="ticket" />
    </aside>
  </div>

  <!-- Map Split (List + Interactive Map) -->
  <div
    v-else-if="kind === 'map-split'"
    :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }"
    class="rd-card grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12"
  >
    <section :style="{ borderColor: 'var(--color-border)' }" class="overflow-y-auto border-b p-4 lg:col-span-5 lg:border-b-0 lg:border-e">
      <slot name="list" />
    </section>
    <section class="relative min-h-[360px] lg:col-span-7">
      <slot name="map" />
    </section>
  </div>

  <!-- 3-Column Docs + ScrollSpy TOC -->
  <div v-else-if="kind === 'docs-toc'" class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <aside :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }" class="rd-card h-fit border p-4 lg:sticky lg:top-20 lg:col-span-3">
      <slot name="nav" />
    </aside>
    <article :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }" class="rd-card mx-auto w-full max-w-[800px] border p-6 lg:col-span-6">
      <slot />
    </article>
    <aside :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }" class="rd-card hidden h-fit border p-4 lg:sticky lg:top-20 lg:col-span-3 lg:block">
      <slot name="toc" />
    </aside>
  </div>

  <!-- Workspace + Right Rail (9+3) -->
  <div v-else-if="kind === 'workspace-rail'" class="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
    <div class="space-y-6 xl:col-span-9">
      <slot />
    </div>
    <aside class="space-y-6 xl:sticky xl:top-20 xl:col-span-3">
      <slot name="rail" />
    </aside>
  </div>

  <!-- Affix Form (Sticky Left Nav + Form + Sticky Bottom Bar) -->
  <div v-else-if="kind === 'affix-form'" class="space-y-6">
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <aside :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }" class="rd-card border p-4 lg:sticky lg:top-20 lg:col-span-3">
        <slot name="nav" />
      </aside>
      <div class="space-y-6 lg:col-span-9">
        <slot />
      </div>
    </div>
    <div v-if="$slots.footer" :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }" class="rd-card sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 border px-6 py-4 shadow-md">
      <slot name="footer" />
    </div>
  </div>

  <!-- Masonry Grid -->
  <div v-else-if="kind === 'masonry'" class="columns-1 gap-5 md:columns-2 xl:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
    <slot />
  </div>

  <!-- Resizable Split -->
  <div
    v-else-if="kind === 'resizable-split'"
    :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }"
    class="rd-card grid min-h-[540px] grid-cols-1 overflow-hidden border lg:grid-cols-12"
  >
    <section :style="{ borderColor: 'var(--color-border)' }" class="overflow-auto border-b p-4 lg:col-span-5 lg:border-b-0 lg:border-e">
      <slot name="left" />
    </section>
    <section class="overflow-auto p-4 lg:col-span-7">
      <slot name="right" />
    </section>
  </div>

  <!-- Full-Canvas (Calendar / Settings / Profile) -->
  <div
    v-else
    :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)' }"
    class="border p-6"
  >
    <div v-if="$slots.toolbar" class="mb-4">
      <slot name="toolbar" />
    </div>
    <slot />
  </div>
</template>
