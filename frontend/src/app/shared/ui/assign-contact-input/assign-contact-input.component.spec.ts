import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignContactInputComponent } from './assign-contact-input.component';

describe('AssignContactInputComponent', () => {
  let component: AssignContactInputComponent;
  let fixture: ComponentFixture<AssignContactInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignContactInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignContactInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
