import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty">
      <div class="icon">🧠</div>
      <div class="title">{{ title }}</div>
      <div class="subtitle">{{ subtitle }}</div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty { padding:32px; text-align:center; color:#5f6368; }
    .icon { font-size:32px; margin-bottom:8px; }
    .title { font-weight:600; color:#202124; margin-bottom:4px; }
    .subtitle { font-size: 13px; }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No data';
  @Input() subtitle = 'There is nothing to display yet.';
}
