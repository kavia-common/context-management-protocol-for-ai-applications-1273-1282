import { Component, Input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [TitleCasePipe],
  template: `
    <span class="badge" [class.active]="status==='active'"
                        [class.idle]="status==='idle'"
                        [class.stale]="status==='stale'"
                        [class.error]="status==='error'">
      {{ status | titlecase }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      line-height: 18px;
      font-weight: 600;
      border: 1px solid transparent;
    }
    .badge.active { background: #E6F4EA; color:#0F9D58; border-color:#98D7B9; }
    .badge.idle { background: #E8F0FE; color:#1A73E8; border-color:#9BB9FF; }
    .badge.stale { background: #FFF7E0; color:#D29A00; border-color:#F3D27A; }
    .badge.error { background: #FDECEA; color:#D93025; border-color:#F3B1A7; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: 'active'|'idle'|'stale'|'error' = 'idle';
}
