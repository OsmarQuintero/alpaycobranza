import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiAlpayService } from '../../services/api-alpay';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  constructor(private api: ApiAlpayService) {}

  solicitar(): void {
    if (!this.email) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.api.forgotPassword(this.email).subscribe({
      next: () => {
        this.success.set(true);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo enviar el correo. Verifica el email.');
        this.isLoading.set(false);
      }
    });
  }
}
