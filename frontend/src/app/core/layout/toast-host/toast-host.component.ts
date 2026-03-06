import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiNotificationService } from '../../services/ui-notification.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" *ngIf="ui.notifications().length">
      <div class="toast-item" *ngFor="let item of ui.notifications()" [ngClass]="item.type">
        <span>{{ item.message }}</span>
        <button type="button" class="toast-close" (click)="ui.remove(item.id)">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 3000;
        display: grid;
        gap: 10px;
        width: min(360px, calc(100vw - 32px));
      }

      .toast-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #e2e8f0;
        font-size: 0.92rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      }

      .toast-item.success { background: rgba(22, 163, 74, 0.25); }
      .toast-item.info { background: rgba(37, 99, 235, 0.25); }
      .toast-item.warning { background: rgba(245, 158, 11, 0.25); }
      .toast-item.error { background: rgba(239, 68, 68, 0.25); }

      .toast-close {
        border: none;
        background: transparent;
        color: #e2e8f0;
        opacity: 0.8;
        cursor: pointer;
        line-height: 1;
      }

      .toast-close:hover {
        opacity: 1;
      }
    `
  ]
})
export class ToastHostComponent {
  protected readonly ui = inject(UiNotificationService);
}
