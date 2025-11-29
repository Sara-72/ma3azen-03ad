import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modeer2Component } from './modeer2.component';

describe('Modeer2Component', () => {
  let component: Modeer2Component;
  let fixture: ComponentFixture<Modeer2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modeer2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modeer2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
