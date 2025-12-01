import { Component ,OnInit,inject , signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, FormBuilder,ReactiveFormsModule, FormGroup, Validators ,FormArray } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
// Assuming you have an ApiService to handle HTTP requests
// import { ApiService } from '../services/api.service';



interface ConsumableRow {
  itemNumber: string;
  itemName: string;
  unit: string;
  quantityRequired: string;
  quantityAuthorized: string;
  quantityIssued: string;
  itemCondition: string;
  unitPrice: string;
  value: string;
}
@Component({
  selector: 'app-modeer2',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './modeer2.component.html',
  styleUrl: './modeer2.component.css'
})

export class Modeer2Component implements OnInit {


 // --- PROPERTIES ---
  tableRows: ConsumableRow[] = [this.createEmptyRow()];
  consumableForm!: FormGroup; // Use '!' for non-null assertion, initialized in constructor
  isSubmitting = signal(false); // 💡 signal imported now

  // --- DEPENDENCY INJECTION ---
  private router = inject(Router);
  private fb = inject(FormBuilder);
  // private apiService = inject(ApiService);

  // --- CONSTRUCTOR & INITIALIZATION ---

  //  Constructor is REQUIRED to initialize FormGroup using FormBuilder
  constructor() {
    this.consumableForm = this.fb.group({
      // Top Info Section Fields (Add actual fields based on your form image)
      destinationName: ['', Validators.required],
      storehouse: ['', Validators.required],
      requestDateGroup: this.fb.group({
          yy: ['', [Validators.required, Validators.pattern('[0-9]{2}')]],
          mm: ['', [Validators.required, Validators.pattern('[0-9]{2}')]],
          dd: ['', [Validators.required, Validators.pattern('[0-9]{2}')]]
      }),
      regularDateGroup: this.fb.group({
          yy: ['', [Validators.required, Validators.pattern('[0-9]{2}')]],
          mm: ['', [Validators.required, Validators.pattern('[0-9]{2}')]],
          dd: ['', [Validators.required, Validators.pattern('[0-9]{2}')]]
      }),
      authorizationNumber: ['', Validators.required],
      requestorName: ['', Validators.required],
      documentNumber: [''],

      // Table Data using FormArray
      tableData: this.fb.array([])
    });
  }

  //  ngOnInit is REQUIRED when implementing OnInit (even if empty)
  ngOnInit(): void {
    // Initialize the FormArray with the initial row data
    this.tableRows.forEach(() => {
      this.tableData.push(this.createTableRowFormGroup());
    });
  }

  // Helper getter to easily access the FormArray
  get tableData(): FormArray {
    return this.consumableForm.get('tableData') as FormArray;
  }

  // Helper function to create the form group for a single table row
  private createTableRowFormGroup(): FormGroup {
    return this.fb.group({
      itemNumber: [''],
      itemName: [''],
      unit: [''],
      quantityRequired: [''],
      quantityAuthorized: [''],
      quantityIssued: [''],
      itemCondition: [''],
      unitPrice: [''],
      value: ['']
    });
  }

  // Helper function to create an empty row object (for display/interface consistency)
  private createEmptyRow(): ConsumableRow {
    // ... (same as your original)
    return {
        itemNumber: '', itemName: '', unit: '', quantityRequired: '',
        quantityAuthorized: '', quantityIssued: '', itemCondition: '',
        unitPrice: '', value: ''
    };
  }

  // --- ROW MANAGEMENT LOGIC (Synchronized with FormArray) ---

  // ➕ Method to add a new row
  addRow(): void {
    this.tableRows.push(this.createEmptyRow());
    this.tableData.push(this.createTableRowFormGroup()); // Add corresponding FormGroup
  }

  // ➖ Method to remove the last row
  removeRow(): void {
    if (this.tableRows.length > 1) {
      this.tableRows.pop();
      this.tableData.removeAt(this.tableData.length - 1); // Remove corresponding FormGroup
    } else if (this.tableRows.length === 1) {
      this.tableRows[0] = this.createEmptyRow();
      this.tableData.at(0).reset(); // Clear data in the single remaining FormGroup
    }
  }

  // --- SAVE BUTTON LOGIC ---

  onSubmit(): void {
    if (this.consumableForm.invalid) {
      this.consumableForm.markAllAsTouched();
      console.warn('Form is invalid. Cannot submit.');
      return;
    }

    this.isSubmitting.set(true); // Disable the button
    const formData = this.consumableForm.value;
    console.log('Sending Form Data:', formData);

    // --- ACTUAL API CALL OR PLACEHOLDER ---
    // Example: Replace this setTimeout with your apiService call
    setTimeout(() => {
      console.log('Request submitted successfully!');
      this.isSubmitting.set(false);
      // Navigate to a confirmation page or /ameen3
      
    }, 2000);
    // -------------------------------------
  }

}
