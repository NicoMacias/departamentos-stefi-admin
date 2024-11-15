import { Component, OnDestroy, OnInit } from '@angular/core';
import { Modal, Toast } from 'bootstrap';
import { ReservasService } from '../../services/reservas.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ModalStateService } from '../../services/modal-state.service';
import { DepartamentosService } from '../../services/departamentos.service';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css'],
})
export class ReservasComponent implements OnInit, OnDestroy {
  esEdicion = false;

  fechaIngreso: string | Date = '';
  fechaEgreso: string | Date = '';
  departamento: any;
  personas: any;
  precioPorDia: any;
  montoSenia: any;
  nombre: string = '';
  apellido: string = '';
  direccion: string = '';
  ciudad: string = '';
  celular1: string = '';
  celular2: string = '';
  observaciones: string = '';
  dni: any;
  edad: any;
  patenteAuto: string = '';
  modeloAuto: string = '';
  montoTotalEstadia: any;

  reservas: any[] = [];
  departamentos: any[] = [];

  idReservaSeleccionada = '';

  reservaAEliminar: any; // Almacena la reserva a eliminar

  reservaForm: FormGroup | undefined;

  token: string | null = localStorage.getItem('token');
  formattedDate: any;

  modalOpen: boolean = false;

  public paginaActual: number = 1; // Inicia en la página 1
  public reservasPorPagina: number = 10; // Número de reservas por página

  reservasFiltradas: any[] = [];
  filtroNombre: string = '';
  filtroDepartamento: string = '';
  filtroFechaIngresoInicio: string = '';
  filtroFechaIngresoFin: string = '';

  constructor(
    private reservaService: ReservasService,
    private fb: FormBuilder,
    private modalStateService: ModalStateService,
    private departamentoService: DepartamentosService
  ) {}

  ngOnInit(): void {
    this.reservaForm = this.fb.group(
      {
        fechaIngreso: ['', [Validators.required]], // Campo requerido
        fechaEgreso: ['', [Validators.required]], // Campo requerido
        departamento: ['', [Validators.required]], // Campo requerido
        personas: ['', [Validators.required]], // Campo requerido
        precioPorDia: ['', [Validators.required, Validators.min(1)]], // Campo requerido
        montoSenia: ['', [Validators.required, Validators.min(1)]], // Campo requerido
        nombre: ['', [Validators.required]], // Campo requerido
        apellido: ['', [Validators.required]], // Campo requerido
        direccion: ['', [Validators.required]], // Campo requerido
        ciudad: ['', [Validators.required]], // Campo requerido
        celular1: ['', [Validators.required]], // Campo requerido
        celular2: [''], // Campo requerido
        observaciones: [''], // Campo requerido
        dni: [''], // Campo requerido
        edad: [''], // Campo requerido
        patenteAuto: [''], // Campo requerido
        modeloAuto: [''], // Campo requerido
        montoTotalEstadia: ['', Validators.min(1)], // Campo requerido
        // capacidad: ['', [Validators.required, Validators.min(1)]], // Campo requerido y mayor que 0
        // descripcion: ['', [Validators.required]], // Campo requerido
      },
      { validator: this.fechasValidas }
    );

    this.modalStateService.modalOpen$.subscribe((isOpen) => {
      this.modalOpen = isOpen;
      if (isOpen) {
        this.abrirModalAgregar(); // Llama a tu método para abrir el modal
      }
    });

    this.obtenerReservas();
    this.obtenerDepartamentos();
  }

  ngOnDestroy() {
    this.modalStateService.closeModal(); // Limpia el estado al salir
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

        // Ordenar las reservas por fecha de ingreso de forma descendente
        this.reservas.sort((a, b) => {
          return (
            new Date(b.fechaIngreso).getTime() -
            new Date(a.fechaIngreso).getTime()
          );
        });

        this.reservasFiltradas = [...this.reservas];
      },
      (error: any) => {
        console.error('Error al obtener reservas', error);
      }
    );
  }

  onSubmit() {
    this.reservaForm?.markAllAsTouched();
    if (this.reservaForm?.valid) {
      if (this.idReservaSeleccionada == '') {
        this.registrarReserva(this.reservaForm.value);
      } else {
        this.actualizarReserva(this.reservaForm.value);
      }
    }
  }

  // Abrir el modal para agregar una nueva reserva
  abrirModalAgregar() {
    this.esEdicion = false;

    const modalElement = document.getElementById('reservaModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  registrarReserva(bodyData: any) {
    // Convertir las fechas al horario de Argentina (UTC-3)
    const fechaIngreso = new Date(bodyData.fechaIngreso);
    const fechaEgreso = new Date(bodyData.fechaEgreso);

    const offsetIngreso = fechaIngreso.getTimezoneOffset(); // Obtener desfase en minutos
    const offsetEgreso = fechaEgreso.getTimezoneOffset();

    const adjustedFechaIngreso = new Date(
      fechaIngreso.getTime() - offsetIngreso * 60000
    ); // Ajustar fechaIngreso
    const adjustedFechaEgreso = new Date(
      fechaEgreso.getTime() - offsetEgreso * 60000
    ); // Ajustar fechaEgreso

    bodyData.fechaIngreso = adjustedFechaIngreso.toISOString(); // Convertir a formato ISO
    bodyData.fechaEgreso = adjustedFechaEgreso.toISOString();

    this.reservaService.registrarReservas(bodyData, this.token ?? '').subscribe(
      (resultData: any) => {
        // Cerrar el modal de confirmación
        const modalElement = document.getElementById('reservaModal');
        if (modalElement) {
          const modal = Modal.getInstance(modalElement);
          if (modal != null) modal.hide();
        }

        // Mostrar toast
        const toastEl = document.getElementById('toastAgregar');
        if (toastEl) {
          const toast = new Toast(toastEl);
          toast.show();
        }

        // Volver a cargar la lista de usuarios
        this.obtenerReservas();
      },
      (error: any) => {
        console.error('Error al registrar reserva', error);
      }
    );
  }

  setearReservaModificar(reserva: any) {
    this.idReservaSeleccionada = reserva._id;

    this.reservaForm?.patchValue({
      fechaIngreso: reserva.fechaIngreso,
      fechaEgreso: reserva.fechaEgreso,
      departamento: reserva.departamento._id,
      personas: reserva.personas,
      precioPorDia: reserva.precioPorDia,
      montoSenia: reserva.montoSenia,
      nombre: reserva.nombre,
      apellido: reserva.apellido,
      direccion: reserva.direccion,
      ciudad: reserva.ciudad,
      celular1: reserva.celular1,
      celular2: reserva.celular2,
      observaciones: reserva.observaciones,
      dni: reserva.dni,
      edad: reserva.edad,
      patenteAuto: reserva.patenteAuto,
      modeloAuto: reserva.modeloAuto,
      montoTotalEstadia: reserva.montoTotalEstadia,
    });

    this.esEdicion = true;

    const modalElement = document.getElementById('reservaModal');
    if (modalElement) {
      const modal = new Modal(modalElement).show();
    }
  }

  actualizarReserva(bodyData: any) {
    this.reservaService
      .actualizarReservas(
        this.idReservaSeleccionada,
        bodyData,
        this.token ?? ''
      )
      .subscribe(
        (resultData: any) => {
          // Cerrar el modal de confirmación
          const modalElement = document.getElementById('reservaModal');
          if (modalElement) {
            const modal = Modal.getInstance(modalElement);
            if (modal != null) modal.hide();
          }

          // Mostrar toast
          const toastEl = document.getElementById('toastModificar');
          if (toastEl) {
            const toast = new Toast(toastEl);
            toast.show();
          }

          this.obtenerReservas();
        },
        (error: any) => {
          console.error('Error al actualizar reserva', error);
        }
      );
  }

  // Mostrar el modal de confirmación de eliminación
  setearEliminarDepartamento(reserva: any) {
    this.reservaAEliminar = reserva;

    const modalElement = document.getElementById('eliminarModal');
    if (modalElement) {
      const modal = new Modal(modalElement).show();
    }
  }

  // Eliminar reserva
  eliminarReserva() {
    if (this.reservaAEliminar && this.reservaAEliminar._id) {
      this.reservaService
        .eliminarReservas(this.reservaAEliminar._id, this.token ?? '')
        .subscribe(
          (resultData: any) => {
            // Cerrar el modal de confirmación
            const modalElement = document.getElementById('eliminarModal');
            if (modalElement) {
              const modal = Modal.getInstance(modalElement);
              if (modal != null) modal.hide();
            }

            // Mostrar toast
            const toastEl = document.getElementById('toastEliminar');
            if (toastEl) {
              const toast = new Toast(toastEl);
              toast.show();
            }

            this.obtenerReservas();
          },
          (error: any) => {
            console.error('Error al eliminar reserva', error);
          }
        );
    }

    this.reservaAEliminar = null; // Limpiar el departamento a eliminar
  }

  // Método para reiniciar el formulario
  resetForm() {
    this.reservaForm?.reset();
  }

  formatearFecha(fecha: string): any {
    const reservaFecha = new Date(fecha); // Convertir a Date

    // Suma 3 horas para ajustar el horario (angular me lo trae a horario de argentina y me lo rompe)
    const adjustedDate = new Date(reservaFecha.getTime() + 3 * 60 * 60 * 1000);

    const year = adjustedDate.getFullYear();
    const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const day = adjustedDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  obtenerDepartamentos() {
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

  fechasValidas(control: AbstractControl) {
    const fechaIngreso = control.get('fechaIngreso')?.value;
    const fechaEgreso = control.get('fechaEgreso')?.value;

    if (fechaIngreso && fechaEgreso && fechaIngreso >= fechaEgreso) {
      return { fechasInvalidas: true };
    }
    return null;
  }

  aplicarFiltros(): void {
    this.reservasFiltradas = this.reservas.filter((reserva) => {
      return (
        this.filtrarPorNombre(reserva) &&
        this.filtrarPorDepartamento(reserva) &&
        this.filtrarPorRangoFechasIngreso(reserva)
      );
    });
    this.paginaActual = 1;
  }

  filtrarPorNombre(reserva: any): boolean {
    return this.filtroNombre
      ? reserva.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
      : true;
  }

  filtrarPorDepartamento(reserva: any): boolean {
    return this.filtroDepartamento
      ? reserva.departamento.nombre === this.filtroDepartamento
      : true;
  }

  filtrarPorRangoFechasIngreso(reserva: any): boolean {
    const fechaInicio = this.filtroFechaIngresoInicio
      ? new Date(this.filtroFechaIngresoInicio)
      : null;
    const fechaFin = this.filtroFechaIngresoFin
      ? new Date(this.filtroFechaIngresoFin)
      : null;
    const fechaIngreso = new Date(reserva.fechaIngreso);

    if (fechaInicio && fechaFin) {
      return fechaIngreso >= fechaInicio && fechaIngreso <= fechaFin;
    }
    if (fechaInicio) {
      return fechaIngreso >= fechaInicio;
    }
    if (fechaFin) {
      return fechaIngreso <= fechaFin;
    }
    return true;
  }
}
