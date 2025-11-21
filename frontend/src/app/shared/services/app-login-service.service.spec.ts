import { TestBed } from '@angular/core/testing';

import { LoginService } from './app-login-service.service';

describe('AppLoginServiceService', () => {
  let service: LoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
