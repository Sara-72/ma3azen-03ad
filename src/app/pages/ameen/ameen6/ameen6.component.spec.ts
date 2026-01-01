import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ameen6Component } from './ameen6.component';

describe('Ameen6Component', () => {
  let component: Ameen6Component;
  let fixture: ComponentFixture<Ameen6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ameen6Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ameen6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
