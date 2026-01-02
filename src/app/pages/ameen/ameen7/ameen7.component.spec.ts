import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ameen7Component } from './ameen7.component';

describe('Ameen7Component', () => {
  let component: Ameen7Component;
  let fixture: ComponentFixture<Ameen7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ameen7Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ameen7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
