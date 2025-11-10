import { TestBed } from '@angular/core/testing';

import { GetInitialLettersService } from './get-initial-letters.service';

describe('GetInitialLettersService', () => {
  let service: GetInitialLettersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetInitialLettersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
