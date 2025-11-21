import { TestBed } from '@angular/core/testing';

import { SVGInlineService } from './svg-inline.service';

describe('SVGInlineService', () => {
  let service: SVGInlineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SVGInlineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
