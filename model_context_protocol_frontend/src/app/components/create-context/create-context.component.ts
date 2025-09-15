import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-context',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay" *ngIf="open">
      <div class="modal">
        <div class="head">
          <div class="title">New Context</div>
          <button class="icon" (click)="close()">✕</button>
        </div>
        <div class="body">
          <label>
            <span>Name</span>
            <input [(ngModel)]="name" placeholder="Experiment A" />
          </label>
          <label>
            <span>Model</span>
            <input [(ngModel)]="model" placeholder="gpt-4o" />
          </label>
        </div>
        <div class="foot">
          <button class="btn outline" (click)="close()">Cancel</button>
          <button class="btn" [disabled]="!name || !model" (click)="create()">Create</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay { position:fixed; inset:0; background: rgba(0,0,0,.3); display:flex; align-items:center; justify-content:center; }
    .modal { width: 420px; max-width: calc(100% - 24px); background:#fff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; }
    .head { display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid #f3f4f6; }
    .title { font-weight:700; color:#202124; }
    .icon { background:transparent; border:none; font-size:18px; cursor:pointer; }
    .body { padding:12px; display:flex; flex-direction:column; gap:10px; }
    label { display:flex; flex-direction:column; gap:6px; font-size:13px; color:#374151; }
    input { border:1px solid #d1d5db; border-radius:8px; padding:8px; font-size:14px; }
    .foot { display:flex; justify-content:flex-end; gap:8px; padding:12px; border-top:1px solid #f3f4f6; }
    .btn { padding:6px 12px; background:#1a73e8; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
    .btn.outline { background:transparent; border:1px solid #d1d5db; color:#1a73e8; }
  `]
})
export class CreateContextComponent {
  open = false;
  name = '';
  model = '';
  @Output() submitNew = new EventEmitter<{name:string; model:string}>();

  show(): void { this.open = true; }
  close(): void { this.open = false; this.name=''; this.model=''; }

  create(): void {
    this.submitNew.emit({ name: this.name.trim(), model: this.model.trim() });
    this.close();
  }
}
