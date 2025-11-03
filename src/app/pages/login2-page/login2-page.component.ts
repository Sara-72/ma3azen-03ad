import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-login2-page',
  imports: [
    FooterComponent
  ],
  templateUrl: './login2-page.component.html',
  styleUrl: './login2-page.component.css'
})
export class Login2PageComponent {

  constructor(private router: Router) { }


  goToLogin() {

    this.router.navigate(['/']);
    console.log('Navigating to login page...');
  }


}
