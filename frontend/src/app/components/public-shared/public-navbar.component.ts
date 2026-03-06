import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg auth-nav" [class.sticky-top]="sticky">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center py-0" routerLink="/">
          <img src="assets/img/features/logo.png" alt="ALPAY" class="navbar-logo">
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" [attr.data-bs-target]="'#' + collapseId">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" [id]="collapseId">
          <ul class="navbar-nav mx-auto gap-4">
            <li class="nav-item"><a routerLink="/acerca" class="nav-link text-secondary fw-semibold">Acerca de</a></li>
            <li class="nav-item"><a routerLink="/caracteristicas" class="nav-link text-secondary fw-semibold">Caracteristicas</a></li>
            <li class="nav-item"><a routerLink="/servicios" class="nav-link text-secondary fw-semibold">Servicios</a></li>
            <li class="nav-item"><a routerLink="/politicas" class="nav-link text-secondary fw-semibold">Politicas</a></li>
          </ul>
          <div class="d-flex gap-3 align-items-center ms-auto">
            <div class="d-flex gap-2" *ngIf="showSocial">
              <a href="https://linkedin.com" target="_blank" class="btn btn-sm btn-outline-secondary rounded-circle" title="LinkedIn"><i class="bi bi-linkedin"></i></a>
              <a href="https://github.com" target="_blank" class="btn btn-sm btn-outline-secondary rounded-circle" title="GitHub"><i class="bi bi-github"></i></a>
              <a href="https://twitter.com" target="_blank" class="btn btn-sm btn-outline-secondary rounded-circle" title="Twitter"><i class="bi bi-twitter"></i></a>
            </div>
            <div class="vr" *ngIf="showSocial"></div>
            <a [routerLink]="['/planes']" class="btn btn-link text-decoration-none text-secondary fw-semibold">Iniciar sesion</a>
            <a [routerLink]="['/register']" class="btn btn-primary-moon shadow-sm">Comenzar ahora</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar-logo {
        height: 40px;
        width: auto;
        max-width: 200px;
        object-fit: contain;
        transition: transform 0.25s ease;
        filter: brightness(1.2);
      }

      .navbar-logo:hover {
        transform: scale(1.03);
      }

      .auth-nav {
        z-index: 20;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      .btn-primary-moon {
        background-color: #4f46e5;
        border-color: #4f46e5;
        color: #fff;
      }

      .btn-primary-moon:hover {
        background-color: #3730a3;
        border-color: #3730a3;
        color: #fff;
      }

      @media (max-width: 768px) {
        .navbar-logo {
          height: 32px;
          max-width: 140px;
        }
      }
    `
  ]
})
export class PublicNavbarComponent {
  @Input() collapseId = 'publicNavbar';
  @Input() showSocial = true;
  @Input() sticky = false;
}
