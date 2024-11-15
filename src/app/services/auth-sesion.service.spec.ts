import { TestBed } from '@angular/core/testing';

import { AuthSesionService } from './auth-sesion.service';

describe('AuthSesionService', () => {
  let service: AuthSesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSesionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
