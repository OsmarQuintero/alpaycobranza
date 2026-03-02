import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { resolveApiUrl } from '../../core/utils/api-url';

interface NewUser {
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'COBRADOR' | 'OFICINA';
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private API_URL = `${resolveApiUrl(environment.apiUrl)}/usuarios/registro`;

  newUser: NewUser = {
    nombre: '',
    email: '',
    password: '',
    rol: 'COBRADOR'
  };

  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  passwordStrength = 0;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onRegister(form?: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form) {
      form.form.markAllAsTouched();
      if (form.invalid) {
        this.errorMessage = 'Revisa los campos marcados en rojo.';
        return;
      }
    }

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.http.post<any>(this.API_URL, { ...this.newUser, rol: 'COBRADOR' }).subscribe({
      next: () => {
        this.successMessage = '¡Usuario registrado correctamente!';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: () => {
        this.errorMessage = 'Error al registrar usuario. Verifica los datos.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.newUser.nombre || !this.newUser.email || !this.newUser.password) {
      this.errorMessage = 'Completa todos los campos';
      return false;
    }

    if (this.newUser.nombre.trim().split(' ').length < 2) {
      this.errorMessage = 'Ingresa nombre y apellido';
      return false;
    }

    if (!this.newUser.email.endsWith('@alpay.mx')) {
      this.errorMessage = 'Solo se permiten correos @alpay.mx';
      return false;
    }

    if (this.newUser.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener mínimo 8 caracteres';
      return false;
    }

    if (!this.isPasswordStrong(this.newUser.password)) {
      this.errorMessage = 'La contraseña no es segura';
      return false;
    }

    if (this.newUser.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }

    return true;
  }

  isPasswordStrong(password: string): boolean {
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  }

  calculatePasswordStrength(): void {
    let strength = 0;
    const password = this.newUser.password;

    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;

    this.passwordStrength = Math.min(strength, 100);
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 40) return 'danger';
    if (this.passwordStrength < 70) return 'warning';
    return 'success';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength < 40) return 'Débil';
    if (this.passwordStrength < 70) return 'Media';
    return 'Fuerte';
  }
}








