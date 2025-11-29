import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ameen3Component } from './ameen3.component';

describe('Ameen3Component', () => {
  let component: Ameen3Component;
  let fixture: ComponentFixture<Ameen3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ameen3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ameen3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
