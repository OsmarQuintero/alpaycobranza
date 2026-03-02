import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiAlpayService, UsuarioAdmin, UsuarioUpdateRequest } from '../../services/api-alpay';

interface NuevoUsuarioPayload {
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'COBRADOR' | 'OFICINA';
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css']
})
export class AdminUsuariosComponent {
  private api = inject(ApiAlpayService);

  usuarios = signal<UsuarioAdmin[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  isCreating = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  editable: UsuarioUpdateRequest & { id?: number } = {
    nombre: '',
    email: '',
    rol: 'COBRADOR',
    estado: 'A'
  };

  nuevo: NuevoUsuarioPayload = {
    nombre: '',
    email: '',
    password: '',
    rol: 'OFICINA'
  };

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.isLoading.set(true);
    this.api.getUsuarios().subscribe({
      next: data => {
        this.usuarios.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo cargar usuarios');
      }
    });
  }

  abrirCrear(): void {
    this.isCreating.set(true);
    this.nuevo = { nombre: '', email: '', password: '', rol: 'OFICINA' };
    this.showModal.set(true);
  }

  abrirEditar(usuario: UsuarioAdmin): void {
    this.isCreating.set(false);
    this.editable = {
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      estado: (usuario.estado as 'A' | 'I') || 'A'
    };
    this.showModal.set(true);
  }

  cerrarModal(): void {
    this.showModal.set(false);
    this.isCreating.set(false);
    this.editable = { nombre: '', email: '', rol: 'COBRADOR', estado: 'A' };
  }

  guardar(): void {
    if (!this.editable.id) return;

    const payload: UsuarioUpdateRequest = {
      nombre: this.editable.nombre,
      email: this.editable.email,
      rol: this.editable.rol,
      estado: this.editable.estado,
      password: this.editable.password
    };

    this.api.actualizarUsuario(this.editable.id, payload).subscribe({
      next: () => {
        this.successMessage.set('Usuario actualizado');
        this.cerrarModal();
        this.cargar();
        setTimeout(() => this.successMessage.set(null), 2500);
      },
      error: () => {
        this.errorMessage.set('No se pudo actualizar');
        setTimeout(() => this.errorMessage.set(null), 2500);
      }
    });
  }

  crear(): void {
    if (!this.nuevo.nombre || !this.nuevo.email || !this.nuevo.password) {
      this.errorMessage.set('Completa los campos obligatorios');
      setTimeout(() => this.errorMessage.set(null), 2500);
      return;
    }

    this.api.crearUsuarioAdmin(this.nuevo).subscribe({
      next: () => {
        this.successMessage.set('Usuario creado');
        this.cerrarModal();
        this.cargar();
        setTimeout(() => this.successMessage.set(null), 2500);
      },
      error: () => {
        this.errorMessage.set('No se pudo crear el usuario');
        setTimeout(() => this.errorMessage.set(null), 2500);
      }
    });
  }

  eliminar(usuario: UsuarioAdmin): void {
    if (!confirm(`Eliminar al usuario ${usuario.nombre}?`)) return;

    this.api.eliminarUsuario(usuario.id_usuario).subscribe({
      next: () => this.cargar(),
      error: () => this.errorMessage.set('No se pudo eliminar')
    });
  }
}
