import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors,
  AbstractControl,
  FormBuilder,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  imports: [
    HeaderComponent,
    FooterComponent ,CommonModule,
    ReactiveFormsModule,

  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  adminForm: FormGroup;

  roles = ['موظف', 'موظف مخزن', 'أمين مخزن', 'مدير مخزن'];
  colleges = [
    'كلية التربية',
    'كلية الحاسبات والذكاء الاصطناعي',
    'كلية الألسن',
    'كلية السياحة والفنادق',
    'مركزية'
  ];

  showCollegeSelection: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      college: ['', Validators.required],
    });
  }

  submit() {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const form = this.adminForm.value;

    const body = {
      email: form.email,
      password: form.password,
      faculty: form.college
    };

    switch (form.role) {
      case 'موظف':
        this.auth.addUser(body).subscribe(() => alert('تم إضافة الموظف'));
        break;

      case 'موظف مخزن':
        this.auth.addEmployee(body).subscribe(() => alert('تم إضافة موظف مخزن'));
        break;

      case 'أمين مخزن':
        this.auth.addStoreKeeper(body).subscribe(() => alert('تم إضافة أمين مخزن'));
        break;

      case 'مدير مخزن':
        this.auth.addInventoryManager(body).subscribe(() => alert('تم إضافة مدير مخزن'));
        break;
    }

    this.adminForm.reset();
  }

  ngOnInit(): void {
    // 🚨 Add subscription to the role control
    this.adminForm.get('role')?.valueChanges.subscribe(selectedRole => {
        // Assuming the value for Employee is 'موظف'
        this.showCollegeSelection = (selectedRole === 'موظف');

        // Optional: If you want to enforce validation only when 'موظف' is selected
        const collegeControl = this.adminForm.get('college');
        if (this.showCollegeSelection) {
            collegeControl?.setValidators(Validators.required);
        } else {
            collegeControl?.clearValidators();
            collegeControl?.setValue(''); // Clear selection when hidden
        }
        collegeControl?.updateValueAndValidity();
    })
}
}
