import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="wrap" *ngIf="show">
      <div class="spinner"></div>
      <div class="text">{{ text }}</div>
    </div>
  `,
  styles: [`
    .wrap { display:flex; align-items:center; gap:10px; color:#5f6368; }
    .spinner {
      width:16px; height:16px; border:2px solid #cfd8dc; border-top-color:#1a73e8;
      border-radius:50%; animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg);} }
    .text { font-size: 13px; }
  `]
})
export class LoadingComponent {
  @Input() show = false;
  @Input() text = 'Loading...';
}
