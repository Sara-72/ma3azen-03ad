import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ameen1Component } from './ameen1.component';

describe('Ameen1Component', () => {
  let component: Ameen1Component;
  let fixture: ComponentFixture<Ameen1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ameen1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ameen1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
