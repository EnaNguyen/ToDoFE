import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToDoUser } from './to-do';

describe('ToDoUser', () => {
  let component: ToDoUser;
  let fixture: ComponentFixture<ToDoUser>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToDoUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToDoUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
