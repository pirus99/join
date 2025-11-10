import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignSubtaskInputComponent } from './assign-subtask-input.component';

describe('AssignSubtaskInputComponent', () => {
  let component: AssignSubtaskInputComponent;
  let fixture: ComponentFixture<AssignSubtaskInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignSubtaskInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignSubtaskInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
