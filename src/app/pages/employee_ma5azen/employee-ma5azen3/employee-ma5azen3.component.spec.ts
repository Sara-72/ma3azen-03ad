import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMa5azen3Component } from './employee-ma5azen3.component';

describe('EmployeeMa5azen3Component', () => {
  let component: EmployeeMa5azen3Component;
  let fixture: ComponentFixture<EmployeeMa5azen3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeMa5azen3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMa5azen3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
