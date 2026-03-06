import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="py-5 footer-public">
      <div class="container text-center">
        <div class="row align-items-center">
          <div class="col-md-4 text-md-start">
            <p class="fw-bold text-white mb-0">ALPAY<span class="text-accent">.</span></p>
            <p class="small text-white">© 2026 Universidad Tecnologica Gral. Mariano Escobedo</p>
          </div>
          <div class="col-md-8 text-md-end">
            <span class="text-slate-500 small">Equipo de desarrollo:</span>
            <div class="d-flex justify-content-md-end gap-3 mt-1 flex-wrap">
              <span class="badge bg-light text-dark border">Osmar Isaias Quintero Valadez</span>
              <span class="badge bg-light text-dark border">David Azael Lopez Dominguez</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer-public {
        position: relative;
        z-index: 1;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(26, 26, 46, 0.92));
        border-top: 1px solid rgba(125, 151, 185, 0.25);
      }

      .footer-public .badge {
        font-size: 0.75rem;
      }

      .text-slate-500 {
        color: #94a3b8;
      }

      .text-accent {
        color: #0ea5e9;
      }
    `
  ]
})
export class PublicFooterComponent {}
