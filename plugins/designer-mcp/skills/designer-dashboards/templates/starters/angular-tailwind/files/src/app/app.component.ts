import { Component, inject, OnInit, signal } from '@angular/core';
import { AppShellComponent } from '../@layouts/app-shell.component';
import { ThemeService } from '../@core/theme/theme.service';
import {
  AlertComponent,
  ButtonComponent,
  KpiCardComponent,
  WidgetCardComponent,
} from '../components/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent, AlertComponent, ButtonComponent, KpiCardComponent, WidgetCardComponent],
  template: `
    <rd-app-shell brandName="Designer Dashboards Angular" [pathname]="pathname()" (navigate)="pathname.set($event)">
      <div class="space-y-6">
        <rd-alert tone="info" title="OpenDesign Contract Active">
          Zoneless Angular signals starter governed by design-system/theme.json and styles.css.
        </rd-alert>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <rd-kpi-card label="Monthly Revenue" value="$84,210" [delta]="12.4" deltaLabel="vs last month" tone="primary" />
          <rd-kpi-card label="Active Users" value="18,490" [delta]="6.1" deltaLabel="vs last month" tone="success" />
          <rd-kpi-card label="Conversion" value="4.28%" [delta]="-0.4" deltaLabel="vs last month" tone="warning" />
          <rd-kpi-card label="API Latency" value="42 ms" [delta]="8.2" deltaLabel="faster" tone="info" />
        </div>

        <rd-widget-card title="Analytics Overview" subtitle="Angular standalone components + Tailwind v4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs" style="color: var(--color-text-muted)">
              Active route: {{ pathname() }}
            </p>
            <div class="flex items-center gap-2">
              <rd-button variant="outline" tone="neutral" size="sm" (click)="theme.toggleDir()">
                {{ theme.dir().toUpperCase() }}
              </rd-button>
              <rd-button variant="solid" tone="primary" size="sm" (click)="theme.toggleDarkMode()">
                Toggle Theme
              </rd-button>
            </div>
          </div>
        </rd-widget-card>
      </div>
    </rd-app-shell>
  `,
})
export class AppComponent implements OnInit {
  readonly theme = inject(ThemeService);
  readonly pathname = signal('/dashboard/analytics');

  ngOnInit(): void {
    this.theme.applyDom();
  }
}
