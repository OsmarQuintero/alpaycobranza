import { Injectable, signal } from '@angular/core';

export type UiDialogType = 'alert' | 'confirm' | 'prompt';
export type UiDialogTone = 'default' | 'danger';

export interface UiDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  value?: string;
  tone?: UiDialogTone;
}

interface UiDialogState extends UiDialogOptions {
  type: UiDialogType;
  resolve: (value: boolean | string | null | void) => void;
}

@Injectable({ providedIn: 'root' })
export class UiDialogService {
  readonly state = signal<UiDialogState | null>(null);

  alert(options: string | UiDialogOptions): Promise<void> {
    const cfg = this.normalize(options, 'alert');
    return this.open(cfg).then(() => undefined);
  }

  confirm(options: string | UiDialogOptions): Promise<boolean> {
    const cfg = this.normalize(options, 'confirm');
    return this.open(cfg).then(value => value === true);
  }

  prompt(options: UiDialogOptions): Promise<string | null> {
    const cfg = this.normalize(options, 'prompt');
    return this.open(cfg).then(value => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed ? trimmed : null;
    });
  }

  resolve(value: boolean | string | null | void): void {
    const current = this.state();
    if (!current) return;
    this.state.set(null);
    current.resolve(value);
  }

  cancel(): void {
    const current = this.state();
    if (!current) return;

    if (current.type === 'confirm') {
      this.resolve(false);
      return;
    }

    if (current.type === 'prompt') {
      this.resolve(null);
      return;
    }

    this.resolve(undefined);
  }

  private open(state: Omit<UiDialogState, 'resolve'>): Promise<boolean | string | null | void> {
    const pending = this.state();
    if (pending) {
      pending.resolve(pending.type === 'confirm' ? false : null);
      this.state.set(null);
    }

    return new Promise(resolve => {
      this.state.set({ ...state, resolve });
    });
  }

  private normalize(options: string | UiDialogOptions, type: UiDialogType): Omit<UiDialogState, 'resolve'> {
    const base: UiDialogOptions = typeof options === 'string' ? { message: options } : options;

    return {
      type,
      title: base.title || this.defaultTitle(type),
      message: base.message,
      confirmText: base.confirmText || (type === 'alert' ? 'Aceptar' : 'Confirmar'),
      cancelText: base.cancelText || 'Cancelar',
      placeholder: base.placeholder || '',
      value: base.value || '',
      tone: base.tone || 'default'
    };
  }

  private defaultTitle(type: UiDialogType): string {
    if (type === 'confirm') return 'Confirmacion requerida';
    if (type === 'prompt') return 'Ingresa un dato';
    return 'Aviso';
  }
}
