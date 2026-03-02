import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-services',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './public-services.html',
  styleUrls: ['../public-shared/public-pages.css', './public-services.css']
})
export class PublicServicesComponent {
  services = [
    {
      name: 'Implementacion operativa',
      detail: 'Parametrizacion inicial, estructura de usuarios y configuracion de flujo.'
    },
    {
      name: 'Capacitacion por rol',
      detail: 'Entrenamiento para administracion, oficina y equipo de campo.'
    },
    {
      name: 'Analitica y reporteo',
      detail: 'Diseño de indicadores para seguimiento de recuperacion y riesgo.'
    },
    {
      name: 'Soporte evolutivo',
      detail: 'Ajustes funcionales conforme crece la operacion de cobranza.'
    }
  ];
}

