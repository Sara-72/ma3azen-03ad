import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ameen2Component } from './ameen2.component';

describe('Ameen2Component', () => {
  let component: Ameen2Component;
  let fixture: ComponentFixture<Ameen2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ameen2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ameen2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
