import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modeer1Component } from './modeer1.component';

describe('Modeer1Component', () => {
  let component: Modeer1Component;
  let fixture: ComponentFixture<Modeer1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modeer1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modeer1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
