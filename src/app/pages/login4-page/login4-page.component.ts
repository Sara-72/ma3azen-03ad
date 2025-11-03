import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-login4-page',
  imports: [
    FooterComponent
  ],
  templateUrl: './login4-page.component.html',
  styleUrl: './login4-page.component.css'
})
export class Login4PageComponent {

  constructor(private router: Router) { }


  goToLogin() {

    this.router.navigate(['/']);
    console.log('Navigating to login page...');
  }


}
