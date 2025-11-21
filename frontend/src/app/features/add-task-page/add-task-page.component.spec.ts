import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskPageComponent } from './add-task-page.component';

describe('AddTaskPageComponent', () => {
  let component: AddTaskPageComponent;
  let fixture: ComponentFixture<AddTaskPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
