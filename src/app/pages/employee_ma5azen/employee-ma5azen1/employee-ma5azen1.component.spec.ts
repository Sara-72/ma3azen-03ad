import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMa5azen1Component } from './employee-ma5azen1.component';

describe('EmployeeMa5azen1Component', () => {
  let component: EmployeeMa5azen1Component;
  let fixture: ComponentFixture<EmployeeMa5azen1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeMa5azen1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMa5azen1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
