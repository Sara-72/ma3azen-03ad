import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-login-page',
  imports: [
    FooterComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  constructor(private router: Router) { }


  goToLogin() {

    this.router.navigate(['/']);
    console.log('Navigating to login page...');
  }

}
