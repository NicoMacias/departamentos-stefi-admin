import { Component, OnInit } from '@angular/core';
import { Modal, Toast } from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartamentosService } from '../../services/departamentos.service';

@Component({
  selector: 'app-departamentos',
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css'],
})
export class DepartamentosComponent implements OnInit {
  esEdicion = false;

  nombre: any;
  capacidad: string = '';
  descripcion: string = '';

  departamentos: any[] = [];

  idDepartamentoSeleccionado = '';

  departamentoAEliminar: any; // Almacena el departamento a eliminar

  departamentoForm: FormGroup | undefined;

  token: string | null = localStorage.getItem('token');

  constructor(
    private departamentoService: DepartamentosService,
    private fb: FormBuilder
  ) {
    this.obtenerDepartamentos();
  }

  ngOnInit(): void {
    this.departamentoForm = this.fb.group({
      nombre: ['', [Validators.required]], // Campo requerido
      capacidad: ['', [Validators.required, Validators.min(1)]], // Campo requerido y mayor que 0
      descripcion: ['', [Validators.required]], // Campo requerido
    });
  }

  obtenerDepartamentos() {
    this.departamentoService.obtenerDepartamentos().subscribe(
      (response: any) => {
        this.departamentos = response.data;
      },
      (error: any) => {
        console.error('Error al obtener departamentos', error);
      }
    );
  }

  onSubmit() {
    this.departamentoForm?.markAllAsTouched();
    if (this.departamentoForm?.valid) {
      if (this.idDepartamentoSeleccionado == '') {
        this.registrarDepartamento(this.departamentoForm.value);
      } else {
        this.actualizarDepartamento(this.departamentoForm.value);
      }
    }
  }

  // Abrir el modal para agregar un nuevo departamento
  abrirModalAgregar() {
    this.esEdicion = false;

    const modalElement = document.getElementById('departamentoModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  registrarDepartamento(bodyData: any) {
    this.departamentoService
      .registrarDepartamento(bodyData, this.token ?? '')
      .subscribe(
        (resultData: any) => {
          // Cerrar el modal de confirmación
          const modalElement = document.getElementById('departamentoModal');
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

          // Volver a cargar la lista de departamentos
          this.obtenerDepartamentos();
        },
        (error: any) => {
          console.error('Error al registrar departamento', error);
        }
      );
  }

  setearDepartamentoModificar(departamento: any) {
    this.idDepartamentoSeleccionado = departamento._id;

    this.departamentoForm?.patchValue({
      nombre: departamento.nombre,
      capacidad: departamento.capacidad,
      descripcion: departamento.descripcion,
    });

    this.esEdicion = true;

    const modalElement = document.getElementById('departamentoModal');
    if (modalElement) {
      const modal = new Modal(modalElement).show();
    }
  }

  actualizarDepartamento(bodyData: any) {
    this.departamentoService
      .actualizarDepartamento(
        this.idDepartamentoSeleccionado,
        bodyData,
        this.token ?? ''
      )
      .subscribe(
        (resultData: any) => {
          // Cerrar el modal de confirmación
          const modalElement = document.getElementById('departamentoModal');
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

          this.obtenerDepartamentos();
        },
        (error: any) => {
          console.error('Error al actualizar departamento', error);
        }
      );
  }

  // Mostrar el modal de confirmación de eliminación
  setearEliminarDepartamento(departamento: any) {
    this.departamentoAEliminar = departamento;

    const modalElement = document.getElementById('eliminarModal');
    if (modalElement) {
      const modal = new Modal(modalElement).show();
    }
  }

  // Eliminar departamento
  eliminarDepartamento() {
    if (this.departamentoAEliminar && this.departamentoAEliminar._id) {
      this.departamentoService
        .eliminarDepartamento(this.departamentoAEliminar._id, this.token ?? '')
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

            this.obtenerDepartamentos();
          },
          (error: any) => {
            console.error('Error al eliminar departamento', error);
          }
        );
    }

    this.departamentoAEliminar = null; // Limpiar el departamento a eliminar
  }

  // Método para reiniciar el formulario
  resetForm() {
    this.departamentoForm?.reset();
  }
}
