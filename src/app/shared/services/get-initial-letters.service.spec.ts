import { TestBed } from '@angular/core/testing';

import { InitialLettersService } from './get-initial-letters.service';

describe('InitialLettersService', () => {
  let service: InitialLettersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitialLettersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
