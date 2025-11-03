import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Login4PageComponent } from './login4-page.component';

describe('Login4PageComponent', () => {
  let component: Login4PageComponent;
  let fixture: ComponentFixture<Login4PageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login4PageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login4PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
