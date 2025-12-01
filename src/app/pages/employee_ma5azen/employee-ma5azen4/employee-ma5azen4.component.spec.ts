import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMa5azen4Component } from './employee-ma5azen4.component';

describe('EmployeeMa5azen4Component', () => {
  let component: EmployeeMa5azen4Component;
  let fixture: ComponentFixture<EmployeeMa5azen4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeMa5azen4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMa5azen4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
