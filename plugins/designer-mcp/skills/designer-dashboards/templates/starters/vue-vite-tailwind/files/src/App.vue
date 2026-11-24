<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppShell from './@layouts/AppShell.vue';
import { useThemeStore } from './@core/theme/themeStore';
import { Alert, Button, KpiCard, Switch, Toaster, WidgetCard } from './components/ui';

const themeStore = useThemeStore();
const pathname = ref('/dashboard/analytics');
const liveStream = ref(true);

onMounted(() => themeStore.applyDom());
</script>

<template>
  <Toaster />
  <AppShell brand-name="Designer Dashboards Vue" :pathname="pathname" @navigate="(p) => (pathname = p)">
    <div class="space-y-6">
      <Alert tone="info" title="OpenDesign Contract Active" dismissible>
        All Vue 3 UI primitives are driven by design-system/theme.json and styles.css.
      </Alert>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Monthly Revenue" value="$84,210" :delta="12.4" delta-label="vs last month" icon="dollar-sign" tone="primary" />
        <KpiCard label="Active Users" value="18,490" :delta="6.1" delta-label="vs last month" icon="users" tone="success" />
        <KpiCard label="Conversion Rate" value="4.28%" :delta="-0.4" delta-label="vs last month" icon="trending-up" tone="warning" />
        <KpiCard label="API Latency" value="42 ms" :delta="8.2" delta-label="faster" icon="activity" tone="info" />
      </div>

      <WidgetCard
        title="Analytics Overview"
        subtitle="Vue 3 + Pinia + Tailwind v4 starter governed by design-system/theme.json"
        allow-fullscreen
        allow-pin
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <Switch v-model="liveStream" label="Realtime telemetry" description="Stream live events" />
          <div class="flex items-center gap-2">
            <Button variant="outline" tone="neutral" size="sm" @click="themeStore.toggleDir()">
              {{ themeStore.dir.toUpperCase() }}
            </Button>
            <Button variant="solid" tone="primary" size="sm" @click="themeStore.toggleDarkMode()">
              Toggle Theme
            </Button>
          </div>
        </div>
      </WidgetCard>
    </div>
  </AppShell>
</template>
