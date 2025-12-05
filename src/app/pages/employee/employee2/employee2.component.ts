import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';


@Component({
  selector: 'app-employee2',
  imports: [
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './employee2.component.html',
  styleUrl: './employee2.component.css'
})
export class Employee2Component {

}
