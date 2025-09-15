import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { ContextItem } from '../../services/context.service';
import { ContextStore } from '../../services/context.store';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty/empty-state.component';
import { BrowserGlobals } from '../../services/browser-globals.service';

@Component({
  selector: 'app-context-list',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, LoadingComponent, EmptyStateComponent, DatePipe, NgIf],
  template: `
    <div class="list-header">
      <div class="title">Contexts</div>
      <div class="actions">
        <button (click)="refresh()" class="btn">Refresh</button>
        <button (click)="toggleStale()" class="btn outline">{{ includeStale ? 'Hide Stale' : 'Show Stale' }}</button>
      </div>
    </div>
    <app-loading [show]="(loading$ | async) ?? false" text="Loading contexts..."></app-loading>
    <div class="list" *ngIf="(all$ | async) as all">
      <ng-container *ngIf="all.length; else empty">
        <div class="item" *ngFor="let c of all" (click)="select(c)" [class.selected]="(selectedId===c.id)">
          <div class="row1">
            <div class="name">{{ c.name }}</div>
            <app-status-badge [status]="c.status"></app-status-badge>
          </div>
          <div class="row2">
            <span class="meta">Model: {{ c.model }}</span>
            <span class="dot">•</span>
            <span class="meta">Tokens: {{ c.tokens }}</span>
            <span class="dot">•</span>
            <span class="meta">Updated: {{ c.updatedAt | date:'short' }}</span>
          </div>
        </div>
      </ng-container>
      <ng-template #empty>
        <app-empty-state title="No contexts found" subtitle="Create a new context to get started.">
          <button class="btn" (click)="emitCreate()">New Context</button>
        </app-empty-state>
      </ng-template>
    </div>
  `,
  styles: [`
    .list-header { display:flex; align-items:center; justify-content:space-between; padding: 8px 12px; }
    .title { font-weight: 700; color:#202124; }
    .actions { display:flex; gap:8px; }
    .btn { padding:6px 12px; background:#1a73e8; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
    .btn.outline { background:transparent; border:1px solid #d1d5db; color:#1a73e8; }
    .list { display:flex; flex-direction:column; gap:8px; padding: 8px; }
    .item { border:1px solid #e5e7eb; border-radius:8px; padding:10px; cursor:pointer; transition: box-shadow .2s; background:#fff; }
    .item.selected { box-shadow: 0 0 0 2px #1a73e8 inset; }
    .item:hover { box-shadow: 0 1px 2px rgba(0,0,0,.08); }
    .row1 { display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px; }
    .name { font-weight:600; color:#111827; }
    .row2 { color:#6b7280; font-size:12px; display:flex; align-items:center; gap:6px; }
    .dot { color:#9ca3af; }
    .meta { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  `]
})
export class ContextListComponent implements OnInit {
  private readonly store = inject(ContextStore);
  private readonly globals = inject(BrowserGlobals);
  all$ = this.store.all$;
  loading$ = this.store.loadingState$;
  includeStale = true;
  selectedId: string | null = null;

  ngOnInit(): void {
    this.store.load(this.includeStale);
    this.store.selected$.subscribe(sel => this.selectedId = sel?.id ?? null);
  }

  refresh(): void {
    this.store.load(this.includeStale);
  }

  toggleStale(): void {
    this.includeStale = !this.includeStale;
    this.refresh();
  }

  select(c: ContextItem): void {
    this.store.select(c.id);
  }

  emitCreate(): void {
    this.globals.dispatchEvent('new-context');
  }
}
