import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextListComponent } from '../../components/context-list/context-list.component';
import { ContextDetailComponent } from '../../components/context-detail/context-detail.component';
import { CreateContextComponent } from '../../components/create-context/create-context.component';
import { ContextService } from '../../services/context.service';
import { ContextStore } from '../../services/context.store';
import { environment } from '../../../environments/environment';
import { BrowserGlobals } from '../../services/browser-globals.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ContextListComponent, ContextDetailComponent, CreateContextComponent],
  template: `
    <div class="header">
      <div class="branding">
        <div class="logo">🧩</div>
        <div class="title">{{ appTitle }}</div>
      </div>
      <div class="right">
        <button class="btn" (click)="openCreate()">New Context</button>
      </div>
    </div>

    <div class="layout">
      <aside class="left">
        <app-context-list></app-context-list>
      </aside>
      <main class="right">
        <app-context-detail></app-context-detail>
      </main>
    </div>

    <app-create-context #creator (submitNew)="create($event)"></app-create-context>
  `,
  styles: [`
    :host { display:block; min-height: 100vh; background: #f6f8fb; }
    .header { position: sticky; top: 0; z-index: 10; background:#fff; border-bottom:1px solid #eef2f7; padding: 10px 14px; display:flex; align-items:center; justify-content:space-between; }
    .branding { display:flex; align-items:center; gap:8px; }
    .logo { font-size: 18px; }
    .title { font-weight:800; letter-spacing: .2px; color:#202124; }
    .layout { display:grid; grid-template-columns: 340px 1fr; gap: 12px; padding: 12px; max-width: 1400px; margin: 0 auto; }
    aside.left { background:#fff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; min-height: calc(100vh - 84px); }
    main.right { min-height: calc(100vh - 84px); }
    .btn { padding:6px 12px; background:#1a73e8; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
    @media (max-width: 1000px){
      .layout { grid-template-columns: 1fr; }
      aside.left { min-height: auto; }
      main.right { min-height: auto; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('creator') creator?: CreateContextComponent;
  private readonly api = inject(ContextService);
  private readonly store = inject(ContextStore);
  private readonly globals = inject(BrowserGlobals);
  appTitle = environment.APP_TITLE;

  private onNewContextHandler = () => this.openCreate();

  ngOnInit(): void {
    this.globals.addDocumentEventListener('new-context', this.onNewContextHandler);
  }
  ngOnDestroy(): void {
    this.globals.removeDocumentEventListener('new-context', this.onNewContextHandler);
  }

  openCreate(): void {
    this.creator?.show();
  }

  create(data: {name:string; model:string}): void {
    this.api.createContext({ name: data.name, model: data.model }).subscribe({
      next: (created) => {
        if (created) {
          this.store.upsertLocal(created);
          this.store.select(created.id);
        } else {
          this.globals.alert('Create failed.');
        }
      },
      error: () => this.globals.alert('Create failed.')
    });
  }
}
