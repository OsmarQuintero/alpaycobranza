// src/app/components/reportes/reportes.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiAlpayService } from '../../services/api-alpay';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { UiNotificationService } from '../../core/services/ui-notification.service';
import { UiDialogService } from '../../core/services/ui-dialog.service';

interface ReporteSummary {
  totalCuentas: number;
  totalCredito: number;
  totalSaldo: number;
  totalRecaudado: number;
  promedioSaldo: number;
  cuentasActivas: number;
  cuentasMora: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit {
  private apiService = inject(ApiAlpayService);
  private ui = inject(UiNotificationService);
  private dialog = inject(UiDialogService);

  summary = signal<ReporteSummary>({
    totalCuentas: 0,
    totalCredito: 0,
    totalSaldo: 0,
    totalRecaudado: 0,
    promedioSaldo: 0,
    cuentasActivas: 0,
    cuentasMora: 0
  });

  isLoading = signal(true);
  todayLabel = new Date().toLocaleDateString('es-MX');

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.isLoading.set(true);
    this.apiService.getCuentas().subscribe({
      next: (cuentas) => {
        const totalCuentas = cuentas.length;
        const totalCredito = cuentas.reduce((sum, c) => sum + c.limiteCredito, 0);
        const totalSaldo = cuentas.reduce((sum, c) => sum + c.saldo, 0);
        const totalRecaudado = totalCredito - totalSaldo;
        const cuentasActivas = cuentas.filter(c => c.estatus === 'ACTIVA').length;
        const cuentasMora = cuentas.filter(c => c.estatus === 'SUSPENDIDA').length;

        this.summary.set({
          totalCuentas,
          totalCredito,
          totalSaldo,
          totalRecaudado,
          promedioSaldo: totalCuentas > 0 ? totalSaldo / totalCuentas : 0,
          cuentasActivas,
          cuentasMora
        });

        this.isLoading.set(false);
      },
      error: () => {
        this.ui.error('No se pudieron cargar los reportes.');
        this.isLoading.set(false);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }

  calcularPorcentajeRecuperacion(): number {
    const s = this.summary();
    if (s.totalCredito === 0) return 0;
    return (s.totalRecaudado / s.totalCredito) * 100;
  }

  async exportarPDF(): Promise<void> {
    const data = document.getElementById('report-content-pdf');
    if (!data) {
      this.ui.error('No se encontro el contenido para exportar PDF.');
      return;
    }

    const prevDisplay = data.style.display;
    const prevPosition = data.style.position;
    const prevLeft = data.style.left;
    const prevTop = data.style.top;

    data.style.display = 'block';
    data.style.position = 'fixed';
    data.style.left = '-10000px';
    data.style.top = '0';

    const canvas = await html2canvas(data, {
      backgroundColor: '#ffffff',
      scale: 2
    });

    const imgWidth = 208;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const contentDataURL = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    pdf.addImage(contentDataURL, 'PNG', 0, 8, imgWidth, imgHeight);
    pdf.save('Reporte_Alpay.pdf');

    data.style.display = prevDisplay;
    data.style.position = prevPosition;
    data.style.left = prevLeft;
    data.style.top = prevTop;

    this.ui.success('Reporte PDF generado.');
  }

  exportarExcel(): void {
    this.apiService.exportarReporteExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte_Alpay.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.ui.success('Reporte Excel generado.');
      },
      error: () => this.ui.error('Error al generar Excel')
    });
  }

  async enviarPorEmail(): Promise<void> {
    const email = await this.dialog.prompt({
      title: 'Enviar reporte por correo',
      message: 'Captura el correo al que se enviara el reporte.',
      placeholder: 'correo@dominio.com',
      confirmText: 'Enviar',
      cancelText: 'Cancelar'
    });

    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.ui.warning('Correo invalido. Verifica el formato.');
      return;
    }

    this.apiService.enviarReportePorEmail(email).subscribe({
      next: () => this.ui.success('Reporte enviado por correo.'),
      error: () => this.ui.error('Error al enviar correo')
    });
  }
}
