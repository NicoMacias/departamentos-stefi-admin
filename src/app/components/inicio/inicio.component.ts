import { Component, OnInit } from '@angular/core';
import { Chart, ChartType } from 'chart.js';
import { ModalStateService } from '../../services/modal-state.service';
import { Router } from '@angular/router';
import { ReservasService } from '../../services/reservas.service';
import { DepartamentosService } from '../../services/departamentos.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  public chart: Chart | undefined;

  reservas: any[] = [];
  ingresosDelDia: any[] = [];
  egresosDelDia: any[] = [];
  departamentos: number = 0;
  token: string | null = localStorage.getItem('token');
  formattedDate: any;

  constructor(
    private router: Router,
    private modalStateService: ModalStateService,
    private reservaService: ReservasService,
    private departamentoService: DepartamentosService
  ) {}

  agregarReserva() {
    this.modalStateService.openModal(); // Indica que el modal debe abrirse
    this.router.navigate(['/reservas']); // Cambia esto a la ruta de tu modal
  }

  ngOnInit(): void {
    this.obtenerReservas();
  }

  obtenerReservas() {
    this.reservaService.obtenerReservas(this.token ?? '').subscribe(
      (response: any) => {
        this.reservas = response.data.map((reserva: any) => {
          //Formatear la fecha antes de asignarla
          return {
            ...reserva, // Mantenemos el resto de las propiedades de la reserva
            fechaIngreso: this.formatearFecha(reserva.fechaIngreso),
            fechaEgreso: this.formatearFecha(reserva.fechaEgreso),
          };
        });

        this.totalLlegasPartidas();
        this.obtenerDepartamentos();
      },
      (error: any) => {
        console.error('Error al obtener reservas', error);
      }
    );
  }

  formatearFecha(fecha: string): any {
    const reservaFecha = new Date(fecha); // Convertir a Date

    // Suma 3 horas para ajustar el horario (angular me lo trae a horario de argentina y me lo rompe)
    const adjustedDate = new Date(reservaFecha.getTime() + 3 * 60 * 60 * 1000);

    const year = adjustedDate.getFullYear();
    const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const day = adjustedDate.getDate().toString().padStart(2, '0');

    return `${year}/${month}/${day}`;
  }

  totalLlegasPartidas() {
    const hoy = formatDate(new Date(), 'yyyy/MM/dd', 'en-US');

    this.ingresosDelDia = this.reservas.filter(
      (reserva) => reserva.fechaIngreso === hoy
    );
    this.egresosDelDia = this.reservas.filter(
      (reserva) => reserva.fechaEgreso === hoy
    );
  }

  obtenerDepartamentos() {
    this.departamentoService.obtenerDepartamentos().subscribe(
      (response: any) => {
        this.departamentos = response.data.length;
        this.actualizarChart();
      },
      (error: any) => {
        console.error('Error al obtener departamentos', error);
      }
    );
  }

  actualizarChart() {
    const departamentosOcupados = this.calcularDepartamentosOcupados();
    const departamentosDesocupados = this.departamentos - departamentosOcupados;

    const data = {
      labels: ['Ocupado', 'Disponible'],
      datasets: [
        {
          data: [departamentosOcupados, departamentosDesocupados],
          backgroundColor: ['rgb(220, 53, 69)', 'rgb(50, 205, 100)'],
          hoverOffset: 4,
        },
      ],
    };

    this.chart = new Chart('chart', {
      type: 'doughnut' as ChartType,
      data,
    });
  }

  calcularDepartamentosOcupados() {
    const hoy = formatDate(new Date(), 'yyyy/MM/dd', 'en-US');
    // Filtra las reservas que están ocupadas hoy
    const ocupadosHoy = this.reservas.filter(
      (reserva) => reserva.fechaIngreso <= hoy && reserva.fechaEgreso >= hoy
    );
    // Usamos un Set para obtener solo los IDs únicos de los departamentos ocupados
    const ocupados = new Set(ocupadosHoy.map((reserva) => reserva._id));
    return ocupados.size;
  }
}
