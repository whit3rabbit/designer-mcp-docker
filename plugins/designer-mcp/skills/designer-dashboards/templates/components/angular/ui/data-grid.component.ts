import { Component, input, output } from '@angular/core';

export interface DataGridColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
}

@Component({
  selector: 'rd-data-grid',
  standalone: true,
  template: `
    <div style="border-color: var(--color-border); border-radius: var(--radius-lg); background-color: var(--color-surface)" class="overflow-x-auto border">
      <table class="w-full border-collapse text-start text-sm">
        <thead>
          <tr style="border-color: var(--color-border); background-color: var(--color-canvas)" class="border-b">
            @for (col of columns(); track col.key) {
              <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider">
                {{ col.header }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track $index) {
            <tr
              style="border-color: var(--color-border)"
              class="border-b last:border-b-0 hover:opacity-90"
              (click)="rowClick.emit(row)"
            >
              @for (col of columns(); track col.key) {
                <td class="px-4 py-3">{{ row[col.key] }}</td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length" style="color: var(--color-text-muted)" class="px-4 py-8 text-center text-sm">
                No records found.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataGridComponent<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly columns = input.required<DataGridColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly rowClick = output<T>();
}
