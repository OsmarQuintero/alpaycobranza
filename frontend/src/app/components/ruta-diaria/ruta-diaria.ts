import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Cliente } from '../../models/cliente.model';

interface RutaParada {
  nombre: string;
  direccion?: string;
  telefono?: string;
  lat: number;
  lng: number;
  distanciaKm?: number;
  etaMin?: number;
  ventana?: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  estado?: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADA';
}

@Component({
  selector: 'app-ruta-diaria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ruta-diaria.html',
  styleUrls: ['./ruta-diaria.css']
})
export class RutaDiariaComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() clientes: Cliente[] = [];
  @Input() titulo = 'Ruta diaria del cobrador';

  private platformId = inject(PLATFORM_ID);
  private map: any;
  private markersLayer: any;
  private routeLine: any;
  private currentPosition?: { lat: number; lng: number };
  private initAttempts = 0;

  paradas: RutaParada[] = [];
  totalRutaKm = 0;
  totalRutaMin = 0;
  mapaListo = false;
  errorMapa = '';

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientes'] && this.mapaListo) {
      this.actualizarRuta();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private initMap(): void {
    if (!this.isBrowser()) return;

    const L = (window as any).L;
    if (!L) {
      this.initAttempts += 1;
      if (this.initAttempts <= 5) {
        setTimeout(() => this.initMap(), 300);
        return;
      }
      this.errorMapa = 'No se pudo cargar el mapa.';
      return;
    }

    const center = this.getDefaultCenter();
    this.map = L.map('ruta-map', {
      center: [center.lat, center.lng],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.mapaListo = true;
    this.actualizarRuta();
  }

  private getDefaultCenter(): { lat: number; lng: number } {
    const first = this.getClientesConCoords()[0];
    if (first) return { lat: first.lat, lng: first.lng };
    return { lat: 25.6866, lng: -100.3161 };
  }

  private getClientesConCoords(): RutaParada[] {
    const ventanas = ['08:00 - 09:30', '09:30 - 11:00', '11:00 - 12:30', '12:30 - 14:00', '14:00 - 16:00'];

    return (this.clientes || [])
      .filter(c => c.lat != null && c.lng != null)
      .map((c, index) => ({
        nombre: c.nombre,
        direccion: c.direccion,
        telefono: c.telefono,
        lat: Number(c.lat),
        lng: Number(c.lng),
        ventana: ventanas[index % ventanas.length],
        prioridad: index % 4 === 0 ? 'ALTA' : index % 2 === 0 ? 'MEDIA' : 'BAJA',
        estado: 'PENDIENTE'
      }));
  }

  private actualizarRuta(): void {
    if (!this.map || !this.mapaListo) return;

    const L = (window as any).L;
    if (!L) return;

    setTimeout(() => {
      this.markersLayer.clearLayers();
      if (this.routeLine) {
        this.routeLine.remove();
        this.routeLine = null;
      }

      const paradas = this.ordenarRuta(this.getClientesConCoords());
      this.paradas = paradas;
      this.calcularTotales();

      if (paradas.length === 0) return;

      const puntos = paradas.map(p => [p.lat, p.lng]);
      this.routeLine = L.polyline(puntos, { color: '#2dd4bf', weight: 4, opacity: 0.95 }).addTo(this.map);

      paradas.forEach((p, index) => {
        const marker = L.marker([p.lat, p.lng]).addTo(this.markersLayer);
        marker.bindPopup(`<b>${index + 1}. ${p.nombre}</b><br>${p.direccion || 'Sin dirección'}<br>${p.telefono || ''}`);
      });

      const bounds = L.latLngBounds(puntos as any);
      this.map.fitBounds(bounds, { padding: [24, 24] });
    }, 0);
  }

  centrarEnMiUbicacion(): void {
    if (!this.isBrowser() || !navigator.geolocation) {
      this.errorMapa = 'Geolocalización no disponible.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        this.currentPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (this.map) {
          this.map.setView([this.currentPosition.lat, this.currentPosition.lng], 13);
        }
        this.actualizarRuta();
      },
      () => {
        this.errorMapa = 'No se pudo obtener tu ubicación.';
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  recalcularRuta(): void {
    this.actualizarRuta();
  }

  iniciarParada(index: number): void {
    this.paradas = this.paradas.map((p, i) => ({
      ...p,
      estado: i === index ? 'EN_CURSO' : p.estado === 'COMPLETADA' ? 'COMPLETADA' : 'PENDIENTE'
    }));
  }

  completarParada(index: number): void {
    this.paradas = this.paradas.map((p, i) => ({
      ...p,
      estado: i === index ? 'COMPLETADA' : p.estado
    }));
  }

  get completadas(): number {
    return this.paradas.filter(p => p.estado === 'COMPLETADA').length;
  }

  get progresoPct(): number {
    if (!this.paradas.length) return 0;
    return Math.round((this.completadas / this.paradas.length) * 100);
  }

  get objetivosCumplidos(): number {
    return this.paradas.filter(p => p.estado !== 'PENDIENTE').length;
  }

  get objetivosTotales(): number {
    return this.paradas.length;
  }

  get paradasAltaPrioridad(): number {
    return this.paradas.filter(p => p.prioridad === 'ALTA').length;
  }

  get pendientesAltaPrioridad(): number {
    return this.paradas.filter(p => p.prioridad === 'ALTA' && p.estado !== 'COMPLETADA').length;
  }

  get estadoRuta(): 'SIN_INICIAR' | 'EN_CURSO' | 'FINALIZADA' {
    if (!this.paradas.length) return 'SIN_INICIAR';
    if (this.completadas === this.paradas.length) return 'FINALIZADA';
    if (this.completadas > 0 || this.paradas.some(p => p.estado === 'EN_CURSO')) return 'EN_CURSO';
    return 'SIN_INICIAR';
  }


  getGoogleMapsNavigationUrl(parada: RutaParada): string {
    const base = 'https://www.google.com/maps/dir/?api=1';
    const destinoDireccion = (parada.direccion || '').trim();

    if (destinoDireccion) {
      return `${base}&destination=${encodeURIComponent(destinoDireccion)}`;
    }

    return `${base}&destination=${parada.lat},${parada.lng}`;
  }

  get tituloEstadoRuta(): string {
    if (this.estadoRuta === 'FINALIZADA') return 'Ruta completada';
    if (this.estadoRuta === 'EN_CURSO') return 'Ruta en progreso';
    return 'Ruta pendiente de inicio';
  }

  private ordenarRuta(paradas: RutaParada[]): RutaParada[] {
    if (!this.currentPosition) {
      return this.enriquecerRuta(paradas);
    }

    const restantes = [...paradas];
    const ruta: RutaParada[] = [];
    let actual = { ...this.currentPosition };

    while (restantes.length) {
      let idx = 0;
      let mejorDist = Number.MAX_VALUE;

      restantes.forEach((p, i) => {
        const d = this.distanciaKm(actual.lat, actual.lng, p.lat, p.lng);
        if (d < mejorDist) {
          mejorDist = d;
          idx = i;
        }
      });

      const elegido = restantes.splice(idx, 1)[0];
      elegido.distanciaKm = this.distanciaKm(actual.lat, actual.lng, elegido.lat, elegido.lng);
      ruta.push(elegido);
      actual = { lat: elegido.lat, lng: elegido.lng };
    }

    return this.enriquecerRuta(ruta);
  }

  private enriquecerRuta(ruta: RutaParada[]): RutaParada[] {
    const minPorKm = 3;
    return ruta.map((p, i) => {
      const km = p.distanciaKm ?? (i === 0 ? 0 : this.distanciaKm(ruta[i - 1].lat, ruta[i - 1].lng, p.lat, p.lng));
      return {
        ...p,
        distanciaKm: Number(km.toFixed(2)),
        etaMin: Math.max(8, Math.round(km * minPorKm) + 6)
      };
    });
  }

  private calcularTotales(): void {
    this.totalRutaKm = Number(this.paradas.reduce((acc, p) => acc + (p.distanciaKm ?? 0), 0).toFixed(2));
    this.totalRutaMin = this.paradas.reduce((acc, p) => acc + (p.etaMin ?? 0), 0);
  }

  private distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
