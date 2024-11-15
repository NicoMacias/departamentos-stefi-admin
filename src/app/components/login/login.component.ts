import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  usuario: string = '';
  password: string = '';

  loginForm: FormGroup | undefined;

  datosIncorrectos = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]], // Campo requerido
      password: ['', [Validators.required]], // Campo requerido
    });
  }

  onSubmit() {
    this.loginForm?.markAllAsTouched();
    if (this.loginForm?.valid) {
      this.login(this.loginForm.value);
    }
  }

  login(bodyData: any) {
    this.loginService.login(bodyData).subscribe(
      (response: any) => {
        // Aquí puedes guardar el token en el localStorage o hacer otras acciones necesarias
        if (response.token) {
          this.router.navigate(['/inicio']); // Redirige al dashboard o donde necesites
        } else {
          this.datosIncorrectos = true;
        }
      },
      (error) => {
        console.error('Error durante el login', error);
        // Mostrar un mensaje de error, por ejemplo:
        alert('Error en el login. Verifica tus credenciales.');
      }
    );
  }
}
