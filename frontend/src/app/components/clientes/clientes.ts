import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import { environment } from '../../../environments/environment';
import { resolveApiUrl } from '../../core/utils/api-url';

interface Cliente {
  id?: number;
  nombre: string;
  rfc: string;
  telefono: string;
  direccion: string;
  numeroCasa?: string;
  lat?: number;
  lng?: number;
  fechaRegistro?: Date;
  ineFrente?: string;
  selfie?: string;
  verificacionEstado?: string;
}

interface CreditoForm {
  otorgar: boolean;
  limiteCredito: number;
  tasaInteres: number;
  diaCorte: number;
}

interface CuentaLite {
  id: number;
  limiteCredito: number;
  saldo: number;
  tasaInteres: number;
  diaCorte: number;
  fechaApertura?: string;
  estatus?: string;
}

interface DireccionSugerida {
  display: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly URL = resolveApiUrl(environment.apiUrl);

  clientes = signal<Cliente[]>([]);
  clienteSeleccionado = signal<Cliente | null>(null);
  modoEdicion = signal(false);
  showModal = signal(false);
  showSuccess = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');
  isLoading = signal(true);
  isSaving = signal(false);
  isResolviendoDireccion = signal(false);
  isBuscandoDirecciones = signal(false);
  direccionQuery = '';
  direccionSugerencias = signal<DireccionSugerida[]>([]);
  private direccionSearchTimer: ReturnType<typeof setTimeout> | null = null;

  fieldErrors = signal<{ rfc: string; telefono: string }>({ rfc: '', telefono: '' });

  ineFile: File | null = null;
  selfieFile: File | null = null;

  clienteForm: Cliente = this.nuevoClienteBase();
  creditoForm: CreditoForm = this.nuevoCreditoBase();

  ngOnInit(): void {
    this.cargarClientes();
  }

  private nuevoClienteBase(): Cliente {
    return {
      nombre: '',
      rfc: '',
      telefono: '',
      direccion: '',
      numeroCasa: '',
      lat: undefined,
      lng: undefined
    };
  }

  private nuevoCreditoBase(): CreditoForm {
    return {
      otorgar: false,
      limiteCredito: 5000,
      tasaInteres: 0.03,
      diaCorte: 10
    };
  }

  cargarClientes(): void {
    this.isLoading.set(true);
    this.http.get<Cliente[]>(`${this.URL}/clientes`).subscribe({
      next: data => {
        this.clientes.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar clientes');
        this.isLoading.set(false);
      }
    });
  }

  get clientesFiltrados(): Cliente[] {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.clientes();

    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(search) ||
      (c.rfc || '').toLowerCase().includes(search) ||
      c.telefono.includes(search)
    );
  }

  abrirModalNuevo(): void {
    this.modoEdicion.set(false);
    this.clienteSeleccionado.set(null);
    this.resetForm();
    this.direccionQuery = this.clienteForm.direccion || '';
    this.direccionSugerencias.set([]);
    this.showModal.set(true);
  }

  abrirModalEditar(cliente: Cliente): void {
    this.modoEdicion.set(true);
    this.clienteSeleccionado.set(cliente);
    this.clienteForm = {
      id: cliente.id,
      nombre: cliente.nombre,
      rfc: (cliente.rfc || '').toUpperCase(),
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      numeroCasa: cliente.numeroCasa || '',
      lat: cliente.lat,
      lng: cliente.lng,
      ineFrente: cliente.ineFrente,
      selfie: cliente.selfie,
      verificacionEstado: cliente.verificacionEstado,
      fechaRegistro: cliente.fechaRegistro
    };
    this.creditoForm = this.nuevoCreditoBase();
    this.ineFile = null;
    this.selfieFile = null;
    this.errorMessage.set('');
    this.fieldErrors.set({ rfc: '', telefono: '' });
    this.direccionQuery = this.clienteForm.direccion || '';
    this.direccionSugerencias.set([]);
    this.showModal.set(true);
  }

  cerrarModal(): void {
    if (this.isSaving()) return;
    this.showModal.set(false);
    this.resetForm();
    this.direccionSugerencias.set([]);
    if (this.direccionSearchTimer) {
      clearTimeout(this.direccionSearchTimer);
      this.direccionSearchTimer = null;
    }
  }

  onFileChange(event: Event, tipo: 'ine' | 'selfie'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (tipo === 'ine') this.ineFile = file;
    if (tipo === 'selfie') this.selfieFile = file;
  }

  onRfcChange(): void {
    const rfc = this.normalizarRfc(this.clienteForm.rfc);
    this.clienteForm.rfc = rfc;
    this.setFieldError('rfc', this.validarRfcFormato(rfc));
  }

  onTelefonoChange(): void {
    const telefono = (this.clienteForm.telefono || '').replace(/\D/g, '').slice(0, 10);
    this.clienteForm.telefono = telefono;
    this.setFieldError('telefono', this.validarTelefonoFormato(telefono));
  }

  onDireccionQueryChange(): void {
    const query = (this.direccionQuery || '').trim();

    if (this.direccionSearchTimer) {
      clearTimeout(this.direccionSearchTimer);
      this.direccionSearchTimer = null;
    }

    if (query.length < 3) {
      this.direccionSugerencias.set([]);
      return;
    }

    this.direccionSearchTimer = setTimeout(() => {
      this.buscarDirecciones(query);
    }, 350);
  }

  buscarDirecciones(query: string): void {
    this.isBuscandoDirecciones.set(true);

    this.http.get<any[]>(`${this.URL}/geocode/search?q=${encodeURIComponent(query)}`).subscribe({
      next: (items) => {
        const sugerencias = (items || []).map((item: any) => ({
          display: (item?.display || '').toString(),
          lat: Number(item?.lat),
          lng: Number(item?.lng)
        } as DireccionSugerida)).filter(s => !!s.display && Number.isFinite(s.lat) && Number.isFinite(s.lng));

        this.direccionSugerencias.set(sugerencias);
        this.errorMessage.set('');
        this.isBuscandoDirecciones.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar direcciones en este momento.');
        this.direccionSugerencias.set([]);
        this.isBuscandoDirecciones.set(false);
      }
    });
  }

  seleccionarDireccion(sugerencia: DireccionSugerida): void {
    this.clienteForm.direccion = sugerencia.display;
    this.clienteForm.lat = Number(sugerencia.lat.toFixed(6));
    this.clienteForm.lng = Number(sugerencia.lng.toFixed(6));
    this.direccionQuery = sugerencia.display;
    this.direccionSugerencias.set([]);
    this.errorMessage.set('');
  }

  limpiarSugerenciasDireccion(): void {
    this.direccionSugerencias.set([]);
  }

  guardarCliente(): void {
    if (!this.validarFormulario()) return;

    this.isSaving.set(true);

    const formData = new FormData();
    formData.append('nombre', this.clienteForm.nombre.trim());
    formData.append('rfc', this.normalizarRfc(this.clienteForm.rfc));
    formData.append('telefono', this.clienteForm.telefono.trim());
    const direccionFinal = this.construirDireccionFinal();
    formData.append('direccion', direccionFinal);

    if (this.clienteForm.lat != null) formData.append('lat', String(this.clienteForm.lat));
    if (this.clienteForm.lng != null) formData.append('lng', String(this.clienteForm.lng));

    if (this.ineFile) formData.append('ineFrente', this.ineFile);
    if (this.selfieFile) formData.append('selfie', this.selfieFile);

    const isEdit = this.modoEdicion() && this.clienteSeleccionado()?.id;
    const method = isEdit ? 'put' : 'post';
    const url = isEdit ? `${this.URL}/clientes/${this.clienteSeleccionado()!.id}` : `${this.URL}/clientes`;

    this.http.request<Cliente>(method, url, { body: formData }).subscribe({
      next: clienteCreado => {
        if (!isEdit && this.creditoForm.otorgar && clienteCreado?.id) {
          this.crearCreditoInicial(clienteCreado.id);
          return;
        }
        this.finalizarGuardadoExitoso();
      },
      error: err => this.handleGuardarError(err)
    });
  }

  private crearCreditoInicial(idCliente: number): void {
    this.http.post(`${this.URL}/cuentas`, {
      idCliente,
      limiteCredito: this.creditoForm.limiteCredito,
      tasaInteres: this.creditoForm.tasaInteres,
      diaCorte: this.creditoForm.diaCorte
    }).subscribe({
      next: () => this.finalizarGuardadoExitoso(),
      error: err => {
        const detalle = err?.error?.detalle || 'Cliente registrado, pero no se pudo crear el credito inicial.';
        this.errorMessage.set(detalle);
        this.isSaving.set(false);
        this.cargarClientes();
      }
    });
  }

  private finalizarGuardadoExitoso(): void {
    this.showSuccess.set(true);
    this.cerrarModal();
    this.cargarClientes();
    this.isSaving.set(false);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  private handleGuardarError(err: any): void {
    this.isSaving.set(false);

    const detalle = err?.error?.detalle;
    const message = err?.error?.message;
    const fallback = err?.error?.error;

    let msg = 'No se pudo guardar el cliente. Revisa los datos.';

    if (typeof detalle === 'string' && detalle.trim()) {
      msg = detalle;
    } else if (detalle && typeof detalle === 'object') {
      const flat = Object.entries(detalle)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(' | ');
      if (flat) msg = flat;
    } else if (typeof message === 'string' && message.trim()) {
      msg = message;
    } else if (typeof fallback === 'string' && fallback.trim()) {
      msg = fallback;
    }

    this.errorMessage.set(msg);

    const low = msg.toLowerCase();
    if (low.includes('rfc')) this.setFieldError('rfc', msg);
    if (low.includes('telefono') || low.includes('celular')) this.setFieldError('telefono', msg);

    // Ayuda para depurar 400 desde consola
    console.error('Error guardando cliente', err);
  }

  eliminarCliente(cliente: Cliente): void {
    if (!confirm(`¿Seguro que deseas eliminar a ${cliente.nombre}?`)) return;

    this.http.delete(`${this.URL}/clientes/${cliente.id}`).subscribe({
      next: () => {
        this.showSuccess.set(true);
        this.cargarClientes();
        setTimeout(() => this.showSuccess.set(false), 3000);
      },
      error: () => {
        this.errorMessage.set('Error al eliminar cliente');
      }
    });
  }

  descargarContrato(cliente: Cliente): void {
    if (!cliente.id) {
      this.generarContratoDetallado(cliente, null);
      return;
    }

    this.http.get<CuentaLite[]>(`${this.URL}/cuentas/cliente/${cliente.id}`).subscribe({
      next: cuentas => {
        const cuenta = (cuentas || []).find(c => c.estatus === 'ACTIVA') || (cuentas || [])[0] || null;
        this.generarContratoDetallado(cliente, cuenta);
      },
      error: () => this.generarContratoDetallado(cliente, null)
    });
  }

  private generarContratoDetallado(cliente: Cliente, cuenta: CuentaLite | null): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const x = 14;
    const w = 182;
    let y = 14;

    const monto = cuenta?.limiteCredito ?? 0;
    const tasa = cuenta?.tasaInteres != null ? (cuenta.tasaInteres * 100).toFixed(2) : '___';
    const diaPago = cuenta?.diaCorte ?? '__';

    const ensure = (h: number) => {
      if (y + h > 280) {
        doc.addPage();
        y = 14;
      }
    };

    const block = (text: string) => {
      const lines = doc.splitTextToSize(text, w);
      ensure(lines.length * 5 + 2);
      doc.text(lines, x, y);
      y += lines.length * 5;
    };

    const section = (title: string, paragraphs: string[]) => {
      ensure(10);
      doc.setFont('helvetica', 'bold');
      doc.text(title, x, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      paragraphs.forEach(p => block(p));
      y += 2;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Contrato de Credito Alpay', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    block(`Fecha: ${new Date().toLocaleDateString('es-MX')}   Ciudad: __________, Mexico`);

    section('Antecedentes y Partes', [
      `ALPAY, S.A.P.I. de C.V. (en lo sucesivo "EL ACREEDOR"), representada por su apoderado legal __________, otorgara un credito al SR./SRA. ${cliente.nombre || '[Nombre del Cliente]'} (en lo sucesivo "EL ACREDITADO"), conforme a los terminos siguientes. Ambas partes manifiestan su capacidad legal para celebrar este contrato y acuerdan lo siguiente:`
    ]);

    section('1. Objeto del Credito', [
      `1.1 El ACREEDOR otorga a EL ACREDITADO un credito simple por un monto maximo de ${monto ? this.formatCurrency(monto) : '$________ MXN'} (pesos) en moneda nacional. El dinero sera entregado como prestamo para financiar las actividades del proyecto Alpay, conforme a su solicitud.`,
      '1.2 EL ACREDITADO se obliga a utilizar el monto del credito unica y exclusivamente para los fines permitidos y licitos del proyecto Alpay. Cualquier uso distinto debera contar con autorizacion previa por escrito del acreedor.'
    ]);

    section('2. Monto y Desembolso', [
      '2.1 El monto total del credito, incluyendo todas las disposiciones, no excedera la cantidad establecida en la caratula. El desembolso inicial se realizara mediante transferencia bancaria a la cuenta indicada por EL ACREDITADO dentro de un plazo no mayor a 5 dias habiles contados desde la firma del presente contrato.',
      '2.2 El ACREDITADO podra disponer de los fondos progresivamente (si el credito fuera revolvente) o en pagos parciales segun cronograma acordado. Cada disposicion queda sujeta al cumplimiento de las condiciones estipuladas en la Clausula 4.'
    ]);

    section('3. Plazo y Vencimiento', [
      '3.1 El plazo para el pago total del credito sera de ___ meses contados desde el primer desembolso. La fecha limite de pago se indicara en la caratula y no podra exceder del plazo establecido. Vencido el plazo, EL ACREDITADO debera reembolsar inmediatamente cualquier saldo pendiente.',
      '3.2 Si EL ACREDITADO no utiliza totalmente el credito dentro de ___ dias naturales desde la firma, el saldo no dispuesto quedara cancelado y EL ACREDITADO debera pagar el saldo dispuesto conforme al plan de pagos, o las partes renegociaran las condiciones de uso.'
    ]);

    section('4. Tasa de Interes y Pagos', [
      `4.1 La tasa de interes ordinaria sera del ${tasa}% anual (tasa fija), calculada sobre saldos insolutos, con base 360 dias comerciales.`,
      `4.2 El pago total exigible cada mes incluira capital e intereses. Las fechas de pago seran el dia ${diaPago} de cada mes (o el siguiente dia habil). EL ACREDITADO podra efectuar pagos anticipados sin penalizacion, informando con al menos 5 dias de anticipacion.`,
      '4.3 Todos los pagos deberan realizarse en moneda nacional a la cuenta designada por EL ACREEDOR. Si una fecha de pago cae en dia inhabil, el pago se hara al dia habil siguiente sin recargo adicional.'
    ]);

    section('5. Comisiones y Gastos', [
      '5.1 EL ACREDITADO pagara las comisiones siguientes: comision de apertura: ___% del monto total acreditado; comision por cobranza: $________ por cada gestion de cobro extrajudicial por impago; otras comisiones segun caratula.',
      '5.2 EL ACREDITADO asume el pago de gastos notariales, registrales u otros costos derivados de este contrato y sus garantias (conforme a legislacion aplicable).'
    ]);

    section('6. Garantias', [
      '6.1 Como garantia solidaria del credito, EL ACREDITADO constituira a favor del ACREEDOR las garantias pactadas en caratula (prenda, aval u otras).',
      '6.2 Dichas garantias permaneceran vigentes hasta la total liquidacion del credito. En caso de garantia real, el ACREDITADO gestionara su inscripcion en los registros aplicables.'
    ]);

    section('7. Destino de los Fondos', [
      '7.1 EL ACREDITADO se obliga a invertir los recursos del credito exclusivamente en el objeto pactado (proyecto Alpay). El incumplimiento de esta clausula constituye incumplimiento grave.'
    ]);

    section('8. Incumplimiento y Mora', [
      '8.1 Se considerara incumplimiento: no pagar en fecha, falsedad en declaraciones o documentos, incumplimiento de obligaciones relevantes y otorgamiento de garantias falsas o caducadas.',
      '8.2 En caso de mora, la parte no cubierta causara intereses moratorios equivalentes a __% anual, desde el dia siguiente al vencimiento y hasta su pago total, adicionando IVA correspondiente.',
      '8.3 Vencidos 30 dias de impago, EL ACREEDOR podra requerir el pago total del capital insoluto e intereses, incluyendo cobro judicial o ejecucion de garantias.'
    ]);

    section('9. Seguros', [
      '9.1 Como condicion para el credito, EL ACREDITADO contratara y mantendra vigente un seguro de vida (o invalidez/desempleo) que cubra al menos el monto total del prestamo. El beneficiario sera EL ACREEDOR.'
    ]);

    section('10. Terminacion Anticipada', [
      '10.1 Este contrato concluira automaticamente cuando EL ACREDITADO haya pagado la totalidad del principal, intereses, comisiones y accesorios adeudados.',
      '10.2 Cualquiera de las partes podra terminar anticipadamente este contrato por escrito con aviso minimo de 30 dias naturales. En tal caso, EL ACREDITADO liquidara inmediatamente todas las obligaciones pendientes.'
    ]);

    section('11. Otras Clausulas Generales', [
      '11.1 Legislacion aplicable: Ley General de Titulos y Operaciones de Credito, Codigo de Comercio y demas disposiciones financieras mexicanas pertinentes.',
      '11.2 Contratos electronicos: la firma puede ser autografa o electronica con plena validez legal.',
      '11.3 Notificaciones por escrito a domicilios o correos designados en caratula.',
      '11.4 Confidencialidad sobre los terminos del contrato, salvo requerimiento legal.',
      '11.5 Cualquier clausula contraria a la proteccion del usuario financiero sera nula.'
    ]);

    section('12. Datos del Cliente y Firma', [
      `Nombre: ${cliente.nombre || 'N/A'}`,
      `RFC: ${cliente.rfc || 'N/A'}`,
      `Telefono: ${cliente.telefono || 'N/A'}`,
      `Direccion: ${cliente.direccion || 'N/A'}`,
      `Coordenadas: ${cliente.lat ?? 'N/A'}, ${cliente.lng ?? 'N/A'}`
    ]);

    ensure(30);
    y += 8;
    block('En constancia de su aceptacion, las partes firman este contrato en ___ de __________ de 2026, en la Ciudad de __________, Mexico, quedando cada parte con un ejemplar.');
    y += 8;
    doc.line(16, y, 90, y);
    doc.line(118, y, 194, y);
    y += 6;
    doc.text('ALPAY, S.A.P.I. de C.V. (El Acreedor)', 17, y);
    doc.text(`${cliente.nombre || '[Nombre del Cliente]'} (El Acreditado)`, 119, y);
    y += 12;
    doc.text('Testigo 1: _____________________', 16, y);
    doc.text('Testigo 2: _____________________', 118, y);

    doc.save(`Contrato_Credito_${(cliente.nombre || 'cliente').replace(/\s+/g, '_')}.pdf`);
  }

  private normalizarRfc(rfc: string): string {
    return (rfc || '').trim().toUpperCase();
  }

  private validarRfcFormato(rfc: string): string {
    if (!rfc) return 'El RFC es obligatorio.';
    if (!/^[A-Z&\u00D1]{4}\d{6}[A-Z0-9]{3}$/.test(rfc)) {
      return 'RFC invalido. Usa formato de 13 caracteres (ej. XAXX010101000).';
    }
    return '';
  }

  private validarTelefonoFormato(telefono: string): string {
    if (!telefono) return 'El telefono es obligatorio.';
    if (!/^\d{10}$/.test(telefono)) {
      return 'Numero de celular invalido. Debe tener 10 digitos.';
    }
    return '';
  }

  private setFieldError(field: 'rfc' | 'telefono', message: string): void {
    const prev = this.fieldErrors();
    this.fieldErrors.set({ ...prev, [field]: message || '' });
  }

  private construirDireccionFinal(): string {
    const direccion = (this.clienteForm.direccion || '').trim();
    const numeroCasa = (this.clienteForm.numeroCasa || '').trim();

    if (!direccion) return '';
    if (!numeroCasa) return direccion;

    const etiquetaNumero = `No. ${numeroCasa}`;
    if (direccion.toLowerCase().includes(etiquetaNumero.toLowerCase())) {
      return direccion;
    }

    return `${etiquetaNumero}, ${direccion}`;
  }

  validarFormulario(): boolean {
    const nombre = this.clienteForm.nombre.trim();
    const rfc = this.normalizarRfc(this.clienteForm.rfc);
    const telefono = this.clienteForm.telefono.replace(/\D/g, '').slice(0, 10);
    const direccion = this.clienteForm.direccion.trim();
    const numeroCasa = (this.clienteForm.numeroCasa || '').trim();

    this.fieldErrors.set({ rfc: '', telefono: '' });

    if (nombre.length < 3) {
      this.errorMessage.set('Nombre invalido (minimo 3 caracteres).');
      return false;
    }

    const rfcError = this.validarRfcFormato(rfc);
    if (rfcError) {
      this.setFieldError('rfc', rfcError);
      this.errorMessage.set(rfcError);
      return false;
    }

    const telError = this.validarTelefonoFormato(telefono);
    if (telError) {
      this.setFieldError('telefono', telError);
      this.errorMessage.set(telError);
      return false;
    }

    if (!direccion) {
      this.errorMessage.set('La direccion es obligatoria para la ruta del cobrador.');
      return false;
    }

    if (!numeroCasa) {
      this.errorMessage.set('El numero de casa es obligatorio para ubicar al cliente.');
      return false;
    }

    if (!this.modoEdicion() && !this.ineFile) {
      this.errorMessage.set('INE es obligatoria para registrar al cliente.');
      return false;
    }

    if (!this.modoEdicion() && this.creditoForm.otorgar) {
      if (this.creditoForm.limiteCredito <= 0) {
        this.errorMessage.set('Limite de credito invalido.');
        return false;
      }
      if (this.creditoForm.tasaInteres < 0 || this.creditoForm.tasaInteres > 1) {
        this.errorMessage.set('Tasa de interes invalida. Usa valor entre 0 y 1.');
        return false;
      }
      if (this.creditoForm.diaCorte < 1 || this.creditoForm.diaCorte > 28) {
        this.errorMessage.set('Dia de corte invalido. Usa 1 a 28.');
        return false;
      }
    }

    this.errorMessage.set('');
    this.clienteForm.rfc = rfc;
    this.clienteForm.telefono = telefono;
    return true;
  }

  resetForm(): void {
    this.clienteForm = this.nuevoClienteBase();
    this.creditoForm = this.nuevoCreditoBase();
    this.ineFile = null;
    this.selfieFile = null;
    this.errorMessage.set('');
    this.fieldErrors.set({ rfc: '', telefono: '' });
    this.isSaving.set(false);
    this.isResolviendoDireccion.set(false);
    this.isBuscandoDirecciones.set(false);
    this.direccionQuery = '';
    this.direccionSugerencias.set([]);
  }


  getGoogleMapsSearchUrl(cliente: Cliente): string {
    const base = 'https://www.google.com/maps/search/?api=1';
    const direccion = (cliente.direccion || '').trim();

    if (direccion) {
      return `${base}&query=${encodeURIComponent(direccion)}`;
    }

    if (cliente.lat != null && cliente.lng != null) {
      return `${base}&query=${cliente.lat},${cliente.lng}`;
    }

    return base;
  }

  formatFecha(fecha: Date | undefined): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);
  }

  getNombreArchivo(path?: string): string {
    if (!path) return 'Sin archivo';
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
  }
}
