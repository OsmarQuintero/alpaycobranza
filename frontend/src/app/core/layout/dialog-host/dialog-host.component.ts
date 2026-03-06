import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiDialogService } from '../../services/ui-dialog.service';

@Component({
  selector: 'app-dialog-host',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-backdrop" *ngIf="dialog.state() as modal" (click)="onBackdropClick($event)">
      <div class="dialog-card" [class.danger]="modal.tone === 'danger'" role="dialog" aria-modal="true">
        <div class="dialog-header">
          <h5>{{ modal.title }}</h5>
          <button type="button" class="close-btn" aria-label="Cerrar" (click)="dialog.cancel()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="dialog-body">
          <p>{{ modal.message }}</p>

          <input
            *ngIf="modal.type === 'prompt'"
            class="dialog-input"
            [placeholder]="modal.placeholder || 'Escribe aqui'"
            [(ngModel)]="promptValue"
            (keydown.enter)="confirm()"
          />
        </div>

        <div class="dialog-actions">
          <button
            *ngIf="modal.type !== 'alert'"
            type="button"
            class="btn btn-secondary"
            (click)="dialog.cancel()"
          >
            {{ modal.cancelText || 'Cancelar' }}
          </button>

          <button
            type="button"
            class="btn"
            [class.btn-danger]="modal.tone === 'danger'"
            [class.btn-primary]="modal.tone !== 'danger'"
            (click)="confirm()"
          >
            {{ modal.confirmText || 'Aceptar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.72);
        display: grid;
        place-items: center;
        z-index: 3500;
        padding: 16px;
      }

      .dialog-card {
        width: min(520px, 100%);
        background: linear-gradient(180deg, #0c1424 0%, #070d18 100%);
        border: 1px solid rgba(59, 130, 246, 0.35);
        border-radius: 14px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        color: #e2e8f0;
      }

      .dialog-card.danger {
        border-color: rgba(239, 68, 68, 0.45);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 18px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      }

      .dialog-header h5 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
      }

      .close-btn {
        border: none;
        background: transparent;
        color: #94a3b8;
        cursor: pointer;
      }

      .dialog-body {
        padding: 16px 18px 12px;
      }

      .dialog-body p {
        margin: 0;
        white-space: pre-line;
        color: #cbd5e1;
      }

      .dialog-input {
        margin-top: 12px;
        width: 100%;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(15, 23, 42, 0.65);
        color: #f8fafc;
        padding: 10px 12px;
        outline: none;
      }

      .dialog-input:focus {
        border-color: rgba(59, 130, 246, 0.75);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 14px 18px 18px;
      }

      .btn {
        border-radius: 10px;
        border: none;
        min-width: 110px;
        padding: 8px 14px;
        font-weight: 600;
      }

      .btn-primary {
        background: linear-gradient(135deg, #2563eb, #0ea5e9);
        color: #eff6ff;
      }

      .btn-danger {
        background: linear-gradient(135deg, #dc2626, #ef4444);
        color: #fff1f2;
      }

      .btn-secondary {
        background: rgba(148, 163, 184, 0.2);
        color: #e2e8f0;
      }

      @media (max-width: 520px) {
        .dialog-actions {
          flex-direction: column-reverse;
        }

        .btn {
          width: 100%;
        }
      }
    `
  ]
})
export class DialogHostComponent {
  protected readonly dialog = inject(UiDialogService);
  promptValue = '';

  constructor() {
    effect(() => {
      const state = this.dialog.state();
      this.promptValue = state?.value || '';
    });
  }

  confirm(): void {
    const modal = this.dialog.state();
    if (!modal) return;

    if (modal.type === 'prompt') {
      this.dialog.resolve(this.promptValue);
      return;
    }

    this.dialog.resolve(true);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.dialog.cancel();
    }
  }
}
