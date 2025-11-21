import { TestBed } from '@angular/core/testing';

import { SvgInlineService } from './svg-inline.service';

describe('SvgInlineService', () => {
  let service: SvgInlineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgInlineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
