// src/app/components/reportes/reportes.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiAlpayService } from '../../services/api-alpay';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      error: (err) => {
        console.error('Error:', err);
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
    if (!data) return;

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
      },
      error: () => alert('Error al generar Excel')
    });
  }

  enviarPorEmail(): void {
    const email = prompt('Ingresa el correo');

    if (!email) return;

    this.apiService.enviarReportePorEmail(email).subscribe({
      next: () => alert('Reporte enviado'),
      error: () => alert('Error al enviar correo')
    });
  }
}
