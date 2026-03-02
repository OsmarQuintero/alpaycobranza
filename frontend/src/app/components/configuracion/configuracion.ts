// src/app/components/configuracion/configuracion.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiAlpayService, ConfiguracionRequest } from '../../services/api-alpay';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent implements OnInit {
  private authService = inject(AuthService);
  private api = inject(ApiAlpayService);

  currentUser = this.authService.currentUser;
  showSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  fotoPreview = signal<string | null>(null);

  userConfig = {
    nombre: this.currentUser()?.nombre || '',
    email: this.currentUser()?.email || '',
    telefono: '',
    notificaciones: true,
    emailAlerts: true,
    whatsappAlerts: true
  };

  systemConfig = {
    tasaInteres: 3.5,
    diasGracia: 5,
    montoMinimoPago: 100,
    envioAutomaticoRecibos: true,
    recordatoriosPago: true
  };

  ngOnInit(): void {
    const userId = this.getUserId();
    if (!userId) return;

    this.isLoading.set(true);
    this.api.getConfiguracion(userId).subscribe({
      next: data => {
        this.userConfig = {
          ...this.userConfig,
          ...data.userConfig
        };
        this.systemConfig = {
          ...this.systemConfig,
          ...data.systemConfig
        };
        const current: any = this.currentUser();
        if (current?.foto_url) {
          this.fotoPreview.set(current.foto_url);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo cargar la configuracion');
      }
    });
  }

  guardarConfiguracion(): void {
    const userId = this.getUserId();
    if (!userId) return;

    const payload: ConfiguracionRequest = {
      userConfig: {
        telefono: this.userConfig.telefono,
        notificaciones: this.userConfig.notificaciones,
        emailAlerts: this.userConfig.emailAlerts,
        whatsappAlerts: this.userConfig.whatsappAlerts
      },
      systemConfig: {
        tasaInteres: this.systemConfig.tasaInteres,
        diasGracia: this.systemConfig.diasGracia,
        montoMinimoPago: this.systemConfig.montoMinimoPago,
        envioAutomaticoRecibos: this.systemConfig.envioAutomaticoRecibos,
        recordatoriosPago: this.systemConfig.recordatoriosPago
      }
    };

    this.api.actualizarConfiguracion(userId, payload).subscribe({
      next: () => {
        this.showSuccess.set(true);
        setTimeout(() => this.showSuccess.set(false), 3000);
      },
      error: () => {
        this.errorMessage.set('No se pudo guardar la configuracion');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  subirFoto(event: Event): void {
    const userId = this.getUserId();
    if (!userId) return;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.api.subirFotoUsuario(userId, file).subscribe({
      next: (data) => {
        const foto = (data as any).foto_url || (data as any).user?.foto_url || null;
        if (foto) {
          this.fotoPreview.set(foto);
          this.updateLocalUserFoto(foto);
        }
        this.showSuccess.set(true);
        setTimeout(() => this.showSuccess.set(false), 3000);
      },
      error: () => {
        this.errorMessage.set('No se pudo subir la foto');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  cambiarPassword(): void {
    const nuevaPassword = prompt('Ingresa tu nueva contrasena:');
    if (nuevaPassword) {
      alert('Contrasena actualizada correctamente');
    }
  }

  limpiarHistorial(): void {
    if (confirm('¿Estas seguro de eliminar todo el historial?\n\nEsta accion NO se puede deshacer.')) {
      alert('Historial eliminado correctamente');
    }
  }

  restablecerConfiguracion(): void {
    if (confirm('¿Restablecer toda la configuracion a valores por defecto?')) {
      this.systemConfig = {
        tasaInteres: 3.5,
        diasGracia: 5,
        montoMinimoPago: 100,
        envioAutomaticoRecibos: true,
        recordatoriosPago: true
      };
      alert('Configuracion restablecida');
    }
  }

  cerrarTodasSesiones(): void {
    if (confirm('¿Cerrar sesion en todos los dispositivos?')) {
      this.authService.logout();
    }
  }

  esCobrador(): boolean {
    return this.currentUser()?.rol === 'COBRADOR';
  }

  private getUserId(): number | null {
    const user = this.currentUser();
    if (!user) return null;
    const anyUser = user as any;
    return anyUser.id_usuario || user.id || null;
  }

  private updateLocalUserFoto(fotoUrl: string): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    user.foto_url = fotoUrl;
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }
}
