// src/app/components/login/login.ts
import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, LoginCredentials } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  credentials: LoginCredentials = {
    email: '',
    password: ''
  };

  errorMessage = signal('');
  isLoading = signal<boolean>(false);
  showPassword = signal(false);

  onLogin(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.credentials.email)) {
      this.errorMessage.set('Por favor ingresa un correo válido');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.credentials).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        if (error.status === 401) {
          this.errorMessage.set('Credenciales incorrectas');
        } else if (error.status === 0) {
          this.errorMessage.set('No se puede conectar con el servidor');
        } else {
          this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
        }

        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }

  // Método auxiliar para desarrollo
  fillDemoCredentials(): void {
    this.credentials = {
      email: 'demo@alpay.mx',
      password: 'demo123'
    };
  }
}
