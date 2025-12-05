import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';


@Component({
  selector: 'app-employee1',
  imports: [
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './employee1.component.html',
  styleUrl: './employee1.component.css'
})
export class Employee1Component {

}
