import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';


@Component({
  selector: 'app-login3-page',
  imports: [
    FooterComponent
  ],
  templateUrl: './login3-page.component.html',
  styleUrl: './login3-page.component.css'
})
export class Login3PageComponent {

  constructor(private router: Router) { }


  goToLogin() {

    this.router.navigate(['/']);
    console.log('Navigating to login page...');
  }

}
