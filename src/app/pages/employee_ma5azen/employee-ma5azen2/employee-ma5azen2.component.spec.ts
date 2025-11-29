import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMa5azen2Component } from './employee-ma5azen2.component';

describe('EmployeeMa5azen2Component', () => {
  let component: EmployeeMa5azen2Component;
  let fixture: ComponentFixture<EmployeeMa5azen2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeMa5azen2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMa5azen2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
