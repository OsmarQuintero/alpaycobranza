import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiAlpayService } from '../../services/api-alpay';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {
  token = '';
  password = '';
  confirm = '';

  isLoading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiAlpayService) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  restablecer(): void {
    if (!this.token || !this.password || this.password !== this.confirm) {
      this.error.set('Verifica la informacion ingresada');
      return;
    }

    this.isLoading.set(true);
    this.api.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.success.set(true);
        this.isLoading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => {
        this.error.set('No se pudo restablecer la contrasena');
        this.isLoading.set(false);
      }
    });
  }
}
