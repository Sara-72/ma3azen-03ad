import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Login3PageComponent } from './login3-page.component';

describe('Login3PageComponent', () => {
  let component: Login3PageComponent;
  let fixture: ComponentFixture<Login3PageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login3PageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login3PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
