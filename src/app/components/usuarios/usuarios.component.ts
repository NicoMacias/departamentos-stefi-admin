import { Component, OnInit } from '@angular/core';
import { Modal, Toast } from 'bootstrap';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  esEdicion = false;

  nombre: string = '';
  apellido: string = '';
  usuario: string = '';
  password: string = '';
  passwordConfirmar: string = '';
  passwordsNoCoinciden: boolean = false; // Inicialmente se asume que no coinciden
  usuarioExistente: boolean = false; // Inicialmente se asume que no existe

  usuarios: any[] = [];

  idUsuarioSeleccionado = '';

  usuarioAEliminar: any; // Almacena el usuario a eliminar

  cantidadUsuarios: any;

  usuarioForm: FormGroup | undefined;

  token: string | null = localStorage.getItem('token');

  constructor(
    private usuarioService: UsuariosService,
    private fb: FormBuilder
  ) {
    this.obtenerUsuarios();
  }

  ngOnInit(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required]], // Campo requerido
      apellido: ['', [Validators.required]], // Campo requerido
      usuario: ['', [Validators.required]], // Campo requerido
      password: [''], // Campo requerido
      passwordConfirmar: [''], // Campo requerido
    });
  }

  obtenerUsuarios(): void {
    this.usuarioService.obtenerUsuarios(this.token ?? '').subscribe(
      (response: any) => {
        this.usuarios = response.data; // Ajusta esto según la estructura de tu respuesta
        this.cantidadUsuarios = this.usuarios.length;
      },
      (error: any) => {
        console.error('Error al obtener usuarios', error);
      }
    );
  }

  onSubmit() {
    this.usuarioForm?.markAllAsTouched();
    // Si el formulario es válido, pero la contraseña no ha sido modificada, elimina las validaciones de contraseña
    const password = this.usuarioForm?.get('password')?.value;
    const passwordConfirmar = this.usuarioForm?.get('passwordConfirmar')?.value;

    // Si no hay nuevas contraseñas, eliminamos las validaciones
    if (!password && !passwordConfirmar && this.esEdicion) {
      this.usuarioForm?.get('password')?.clearValidators();
      this.usuarioForm?.get('passwordConfirmar')?.clearValidators();
    } else {
      // Si hay nuevas contraseñas, debemos validar que coincidan
      this.usuarioForm
        ?.get('password')
        ?.setValidators([
          Validators.required,
          this.passwordMatchValidator.bind(this),
        ]);
      this.usuarioForm
        ?.get('passwordConfirmar')
        ?.setValidators([
          Validators.required,
          this.passwordMatchValidator.bind(this),
        ]);
    }

    // Vuelve a validar el formulario después de ajustar las validaciones
    this.usuarioForm?.get('password')?.updateValueAndValidity();
    this.usuarioForm?.get('passwordConfirmar')?.updateValueAndValidity();

    if (this.usuarioForm?.valid) {
      const bodyData = { ...this.usuarioForm.value };
      // Verifica si las contraseñas están vacías y las elimina si es necesario
      if (!bodyData.password) {
        delete bodyData.password;
        delete bodyData.passwordConfirmar; // Asegúrate de que también se elimine la confirmación
      }
      if (this.idUsuarioSeleccionado == '') {
        this.registrarUsuario(this.usuarioForm.value);
      } else {
        this.actualizarUsuario(this.usuarioForm.value);
      }
    }
  }

  // Abrir el modal para agregar un nuevo departamento
  abrirModalAgregar() {
    this.esEdicion = false;

    const modalElement = document.getElementById('usuarioModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  registrarUsuario(bodyData: any) {
    // Verifica si las contraseñas coinciden
    const password = this.usuarioForm?.get('password')?.value;
    const confirmPassword = this.usuarioForm?.get('passwordConfirmar')?.value;

    if (password !== confirmPassword) {
      // Puedes mostrar un error si no coinciden
      this.passwordsNoCoinciden = true;
      return; // Detiene el envío del formulario
    }

    this.passwordsNoCoinciden = false;

    this.usuarioService.registrarUsuario(bodyData, this.token ?? '').subscribe(
      (resultData: any) => {
        // Cerrar el modal de confirmación
        const modalElement = document.getElementById('usuarioModal');
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
        this.obtenerUsuarios();
      },
      (error: any) => {
        // Establecer usuarioExistente en true si el error es un 400 y contiene el mensaje adecuado
        if (
          error.status === 400 &&
          error.error.message === 'El usuario ya existe'
        ) {
          this.usuarioExistente = true;
        }
      }
    );
  }

  setearUsuarioModificar(usuario: any) {
    this.idUsuarioSeleccionado = usuario._id;

    this.usuarioForm?.patchValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      usuario: usuario.usuario,
      password: '',
      passwordConfirmar: '',
    });

    this.esEdicion = true;

    const modalElement = document.getElementById('usuarioModal');
    if (modalElement) {
      const modal = new Modal(modalElement).show();
    }
  }

  actualizarUsuario(bodyData: any) {
    if (!bodyData.password) {
      delete bodyData.password;
    }

    this.usuarioService
      .actualizarUsuario(this.idUsuarioSeleccionado, bodyData, this.token ?? '')
      .subscribe(
        (resultData: any) => {
          // Cerrar el modal de confirmación
          const modalElement = document.getElementById('usuarioModal');
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

          this.obtenerUsuarios();
        },
        (error: any) => {
          console.error('Error al actualizar usuario', error);
        }
      );
  }

  // Mostrar el modal de confirmación de eliminación
  setearEliminarUsuario(usuario: any) {
    this.usuarioAEliminar = usuario;

    const modalElement = document.getElementById('eliminarModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  // Eliminar departamento
  eliminarUsuario() {
    if (this.cantidadUsuarios > 1) {
      if (this.usuarioAEliminar && this.usuarioAEliminar._id) {
        this.usuarioService
          .eliminarUsuario(this.usuarioAEliminar._id, this.token ?? '')
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

              this.obtenerUsuarios();
            },
            (error: any) => {
              console.error('Error al eliminar usuario', error);
            }
          );
      }
    } else {
      // Cerrar el modal de confirmación
      const modalElement = document.getElementById('eliminarModal');
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        if (modal != null) modal.hide();
      }
      // Mostrar toast
      const toastError = document.getElementById('toastError');
      if (toastError) {
        const toast = new Toast(toastError).show();
      }
    }

    this.usuarioAEliminar = null; // Limpiar el departamento a eliminar
  }

  // Método para reiniciar el formulario
  resetForm() {
    this.usuarioForm?.reset();
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = this.usuarioForm?.get('password')?.value;
    const passwordConfirmar = control.value;

    return password && password === passwordConfirmar
      ? null
      : { noMatch: true };
  }
}
