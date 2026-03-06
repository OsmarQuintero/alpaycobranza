import { Injectable, signal } from '@angular/core';

export type UiNotificationType = 'success' | 'info' | 'warning' | 'error';

export interface UiNotification {
  id: number;
  type: UiNotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class UiNotificationService {
  readonly notifications = signal<UiNotification[]>([]);
  private nextId = 1;

  push(type: UiNotificationType, message: string, ttlMs = 4500): void {
    const item: UiNotification = { id: this.nextId++, type, message };
    this.notifications.update(current => [...current, item]);

    if (ttlMs > 0) {
      setTimeout(() => this.remove(item.id), ttlMs);
    }
  }

  success(message: string, ttlMs?: number): void {
    this.push('success', message, ttlMs);
  }

  info(message: string, ttlMs?: number): void {
    this.push('info', message, ttlMs);
  }

  warning(message: string, ttlMs?: number): void {
    this.push('warning', message, ttlMs);
  }

  error(message: string, ttlMs?: number): void {
    this.push('error', message, ttlMs);
  }

  remove(id: number): void {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications.set([]);
  }
}
