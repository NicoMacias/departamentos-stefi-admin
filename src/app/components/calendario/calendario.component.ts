import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReservasService } from '../../services/reservas.service';
import { DepartamentosService } from '../../services/departamentos.service'; // Asegúrate de tener este servicio
import esLocale from '@fullcalendar/core/locales/es';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
})
export class CalendarioComponent implements OnInit {
  reservas: any[] = [];
  departamentos: any[] = []; // Lista de departamentos
  token: string | null = localStorage.getItem('token');
  departamentoSeleccionado: string = ''; // Departamento filtrado

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    locale: esLocale,
    initialView: 'dayGridWeek',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    aspectRatio: 1,
    events: [],
    eventContent: function (arg) {
      let eventTitle = document.createElement('div');
      eventTitle.style.fontSize = '25px';
      eventTitle.style.whiteSpace = 'normal'; // Permite que el texto se ajuste en varias líneas
      eventTitle.style.wordWrap = 'break-word'; // Hace que el texto largo se rompa cuando sea necesario
      eventTitle.innerHTML = arg.event.title;

      // Agregar tooltip
      eventTitle.setAttribute('data-bs-toggle', 'tooltip');
      eventTitle.setAttribute('title', arg.event.title); // Aquí se muestra el texto completo al hacer hover

      let arrayOfDomNodes = [eventTitle];
      return { domNodes: arrayOfDomNodes };
    },
    eventsSet: function () {
      // Inicializar todos los tooltips
      var tooltipTriggerList = Array.from(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });
    },
  };

  constructor(
    private reservaService: ReservasService,
    private departamentoService: DepartamentosService // Asegúrate de tener este servicio
  ) {}

  ngOnInit() {
    this.fetchDepartamentos();
    this.fetchEvents();
  }

  fetchDepartamentos() {
    this.departamentoService.obtenerDepartamentos().subscribe(
      (response: any) => {
        this.departamentos = response.data.map((departamento: any) => {
          return { _id: departamento._id, nombre: departamento.nombre };
        });
      },
      (error: any) => {
        console.error('Error al obtener departamentos', error);
      }
    );
  }

  fetchEvents() {
    this.reservaService.obtenerReservas(this.token ?? '').subscribe(
      (response: any) => {
        this.reservas = response.data.map((reserva: any) => ({
          ...reserva,
          fechaIngreso: this.formatearFecha(reserva.fechaIngreso),
          fechaEgreso: this.formatearFecha(reserva.fechaEgreso),
        }));
        this.updateCalendarEvents();
      },
      (error: any) => {
        console.error('Error al obtener reservas', error);
      }
    );
  }

  updateCalendarEvents() {
    // Filtra las reservas si se ha seleccionado un departamento
    const reservasFiltradas = this.departamentoSeleccionado
      ? this.reservas.filter(
          (reserva) =>
            reserva.departamento._id === this.departamentoSeleccionado
        )
      : this.reservas;

    this.calendarOptions.events = reservasFiltradas.map((evento) => ({
      title:
        evento.nombre +
        ' ' +
        evento.apellido +
        ' - ' +
        evento.departamento.nombre,
      start: evento.fechaIngreso,
      end: evento.fechaEgreso,
    }));
  }

  onDepartamentoChange(event: any) {
    this.departamentoSeleccionado = event.target.value;
    this.updateCalendarEvents(); // Actualiza los eventos según el departamento seleccionado
  }

  formatearFecha(fecha: string): any {
    const reservaFecha = new Date(fecha);
    const adjustedDate = new Date(reservaFecha.getTime() + 3 * 60 * 60 * 1000);
    const year = adjustedDate.getFullYear();
    const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = adjustedDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
