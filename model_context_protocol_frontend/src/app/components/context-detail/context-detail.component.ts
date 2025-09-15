import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContextHistoryEvent, ContextItem, ContextService, UpdateContextRequest } from '../../services/context.service';
import { ContextStore } from '../../services/context.store';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { BrowserGlobals } from '../../services/browser-globals.service';

@Component({
  selector: 'app-context-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TitleCasePipe, NgIf, NgFor, StatusBadgeComponent, LoadingComponent],
  template: `
    <div class="wrap" *ngIf="selected() as ctx; else noSel">
      <div class="header">
        <div class="title">
          <span class="name">{{ ctx.name }}</span>
          <app-status-badge [status]="ctx.status"></app-status-badge>
        </div>
        <div class="header-actions">
          <button class="btn danger" (click)="deleteContext(ctx)">Delete</button>
          <button class="btn" (click)="save(ctx)">Save</button>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-title">Details</div>
          <div class="form">
            <label>
              <span>Name</span>
              <input [(ngModel)]="formName" />
            </label>
            <label>
              <span>Status</span>
              <select [(ngModel)]="formStatus">
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="stale">Stale</option>
                <option value="error">Error</option>
              </select>
            </label>
            <label>
              <span>Metadata (JSON)</span>
              <textarea [(ngModel)]="formMetadata" rows="6" placeholder='{"team":"research"}'></textarea>
            </label>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Stats</div>
          <div class="stats">
            <div class="stat">
              <div class="label">Model</div>
              <div class="value">{{ ctx.model }}</div>
            </div>
            <div class="stat">
              <div class="label">Tokens</div>
              <div class="value">{{ ctx.tokens }}</div>
            </div>
            <div class="stat">
              <div class="label">Created</div>
              <div class="value">{{ ctx.createdAt | date:'short' }}</div>
            </div>
            <div class="stat">
              <div class="label">Updated</div>
              <div class="value">{{ ctx.updatedAt | date:'short' }}</div>
            </div>
          </div>
        </div>

        <div class="card col-span">
          <div class="card-title">History</div>
          <app-loading [show]="loadingHistory()" text="Loading history..."></app-loading>
          <div class="timeline" *ngIf="history().length">
            <div class="event" *ngFor="let ev of history()">
              <div class="marker" [class.error]="ev.type==='error'"></div>
              <div class="content">
                <div class="row">
                  <div class="etype">{{ ev.type | titlecase }}</div>
                  <div class="time">{{ ev.timestamp | date:'short' }}</div>
                </div>
                <div class="desc">{{ ev.description }}</div>
              </div>
            </div>
          </div>
          <div class="muted" *ngIf="!history().length && !loadingHistory()">No history yet.</div>
        </div>
      </div>
    </div>

    <ng-template #noSel>
      <div class="empty">Select a context to view details.</div>
    </ng-template>
  `,
  styles: [`
    .wrap { padding: 12px; }
    .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
    .title { display:flex; align-items:center; gap:10px; }
    .name { font-weight:700; font-size:18px; color:#202124; }
    .header-actions { display:flex; gap:8px; }
    .btn { padding:6px 12px; background:#1a73e8; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
    .btn.danger { background:#d93025; }
    .grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:12px; }
    .card { border:1px solid #e5e7eb; border-radius:10px; background:#fff; padding:12px; }
    .card-title { font-weight:600; color:#374151; margin-bottom: 10px; }
    .form label { display:flex; flex-direction:column; gap:6px; margin-bottom: 10px; color:#374151; font-size:13px; }
    input, select, textarea { border:1px solid #d1d5db; border-radius:8px; padding:8px; font-size:14px; }
    .stats { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
    .stat { background:#f9fafb; border:1px solid #f3f4f6; border-radius:8px; padding:10px; }
    .label { color:#6b7280; font-size:12px; }
    .value { color:#111827; font-weight:600; }
    .timeline { display:flex; flex-direction:column; gap:10px; position:relative; }
    .event { display:flex; gap:10px; align-items:flex-start; }
    .marker { width:10px; height:10px; border-radius:50%; background:#1a73e8; margin-top:6px; }
    .marker.error { background:#d93025; }
    .content { flex:1; }
    .row { display:flex; align-items:center; justify-content:space-between; color:#374151; }
    .desc { color:#6b7280; font-size:13px; }
    .muted { color:#9aa0a6; font-size:13px; }
    .col-span { grid-column: span 2 / span 2; }
    .empty { color:#5f6368; padding: 24px; text-align: center; }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
      .col-span { grid-column: auto; }
    }
  `]
})
export class ContextDetailComponent implements OnInit, OnDestroy {
  private readonly store = inject(ContextStore);
  private readonly api = inject(ContextService);
  private readonly globals = inject(BrowserGlobals);

  selected = signal<ContextItem | null>(null);
  history = signal<ContextHistoryEvent[]>([]);
  loadingHistory = signal<boolean>(false);

  formName = '';
  formStatus: 'active'|'idle'|'stale'|'error' = 'idle';
  formMetadata = '';

  private sub: any;

  ngOnInit(): void {
    this.sub = this.store.selected$.subscribe(sel => {
      this.selected.set(sel);
      if (sel) {
        // populate form
        this.formName = sel.name;
        this.formStatus = sel.status;
        this.formMetadata = JSON.stringify(sel.metadata ?? {}, null, 2);
        this.loadHistory(sel.id);
      } else {
        this.history.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  private loadHistory(id: string): void {
    this.loadingHistory.set(true);
    this.api.getContextHistory(id, 50).subscribe({
      next: (events) => {
        this.history.set(events);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false)
    });
  }

  save(ctx: ContextItem): void {
    let meta: Record<string, any> | undefined;
    try {
      meta = this.formMetadata?.trim() ? JSON.parse(this.formMetadata) : undefined;
    } catch {
      this.globals.alert('Invalid metadata JSON.');
      return;
    }
    const payload: UpdateContextRequest = {
      name: this.formName,
      status: this.formStatus,
      metadata: meta
    };
    this.api.updateContext(ctx.id, payload).subscribe({
      next: (updated) => {
        if (updated) {
          this.store.upsertLocal(updated);
          this.globals.alert('Context saved.');
        } else {
          this.globals.alert('Save failed.');
        }
      },
      error: () => this.globals.alert('Save failed.')
    });
  }

  deleteContext(ctx: ContextItem): void {
    if (!this.globals.confirm(`Delete context "${ctx.name}"?`)) return;
    this.api.deleteContext(ctx.id).subscribe({
      next: (ok) => {
        if (ok) {
          this.store.removeLocal(ctx.id);
          this.globals.alert('Deleted.');
        } else {
          this.globals.alert('Delete failed.');
        }
      },
      error: () => this.globals.alert('Delete failed.')
    });
  }
}
