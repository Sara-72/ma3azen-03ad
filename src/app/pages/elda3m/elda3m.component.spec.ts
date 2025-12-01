import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Elda3mComponent } from './elda3m.component';

describe('Elda3mComponent', () => {
  let component: Elda3mComponent;
  let fixture: ComponentFixture<Elda3mComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Elda3mComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Elda3mComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
