import { TestBed } from '@angular/core/testing';

import { TaskComService } from './task-com.service';

describe('TaskComService', () => {
  let service: TaskComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
