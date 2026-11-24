import { Component, input } from '@angular/core';

export type AngularAppShellKind =
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

@Component({
  selector: 'rd-app-shells',
  standalone: true,
  template: `
    @if (kind() === 'list-detail') {
      <div
        style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)"
        class="grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12"
      >
        <section style="border-color: var(--color-border)" class="overflow-y-auto border-b p-4 lg:col-span-5 lg:border-b-0 lg:border-e">
          <ng-content select="[slot=list]" />
        </section>
        <section class="overflow-y-auto p-6 lg:col-span-7">
          <ng-content select="[slot=detail]" />
        </section>
      </div>
    } @else if (kind() === 'board') {
      <div class="flex gap-4 overflow-x-auto pb-2">
        <ng-content />
      </div>
    } @else if (kind() === 'stream') {
      <div
        style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)"
        class="flex min-h-[560px] flex-col overflow-hidden border"
      >
        <div class="flex-1 overflow-y-auto p-6">
          <ng-content select="[slot=stream]" />
        </div>
        <div style="border-color: var(--color-border)" class="border-t p-4">
          <ng-content select="[slot=composer]" />
        </div>
      </div>
    } @else if (kind() === 'pos') {
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section class="lg:col-span-8 xl:col-span-9">
          <ng-content select="[slot=catalog]" />
        </section>
        <aside style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)" class="rd-card sticky top-20 border p-4 lg:col-span-4 xl:col-span-3">
          <ng-content select="[slot=ticket]" />
        </aside>
      </div>
    } @else if (kind() === 'map-split') {
      <div style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)" class="rd-card grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12">
        <section style="border-color: var(--color-border)" class="overflow-y-auto border-b p-4 lg:col-span-5 lg:border-b-0 lg:border-e">
          <ng-content select="[slot=list]" />
        </section>
        <section class="relative min-h-[360px] lg:col-span-7">
          <ng-content select="[slot=map]" />
        </section>
      </div>
    } @else if (kind() === 'docs-toc') {
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)" class="rd-card h-fit border p-4 lg:sticky lg:top-20 lg:col-span-3">
          <ng-content select="[slot=nav]" />
        </aside>
        <article style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)" class="rd-card mx-auto w-full max-w-[800px] border p-6 lg:col-span-6">
          <ng-content />
        </article>
        <aside style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)" class="rd-card hidden h-fit border p-4 lg:sticky lg:top-20 lg:col-span-3 lg:block">
          <ng-content select="[slot=toc]" />
        </aside>
      </div>
    } @else if (kind() === 'workspace-rail') {
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div class="space-y-6 xl:col-span-9"><ng-content /></div>
        <aside class="space-y-6 xl:sticky xl:top-20 xl:col-span-3"><ng-content select="[slot=rail]" /></aside>
      </div>
    } @else if (kind() === 'affix-form') {
      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <aside style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)" class="rd-card border p-4 lg:sticky lg:top-20 lg:col-span-3">
          <ng-content select="[slot=nav]" />
        </aside>
        <div class="space-y-6 lg:col-span-9"><ng-content /></div>
      </div>
    } @else if (kind() === 'masonry') {
      <div class="columns-1 gap-5 md:columns-2 xl:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
        <ng-content />
      </div>
    } @else if (kind() === 'resizable-split') {
      <div style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)" class="rd-card grid min-h-[540px] grid-cols-1 overflow-hidden border lg:grid-cols-12">
        <section style="border-color: var(--color-border)" class="overflow-auto border-b p-4 lg:col-span-5 lg:border-b-0 lg:border-e">
          <ng-content select="[slot=left]" />
        </section>
        <section class="overflow-auto p-4 lg:col-span-7">
          <ng-content select="[slot=right]" />
        </section>
      </div>
    } @else {
      <div
        style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)"
        class="border p-6"
      >
        <ng-content />
      </div>
    }
  `,
})
export class AppShellsComponent {
  readonly kind = input<AngularAppShellKind>('list-detail');
}
