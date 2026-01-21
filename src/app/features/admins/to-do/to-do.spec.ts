import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToDoAdminComponent } from './to-do';

describe('ToDo', () => {
  let component: ToDoAdminComponent;
  let fixture: ComponentFixture<ToDoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToDoAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToDoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
