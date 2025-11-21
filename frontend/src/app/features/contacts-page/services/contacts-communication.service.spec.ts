import { TestBed } from '@angular/core/testing';

import { ContactsCommunicationService } from './contacts-communication.service';

describe('ContactsCommunicationService', () => {
  let service: ContactsCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactsCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
