import { Component ,OnInit,inject , signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, FormBuilder,ReactiveFormsModule, FormGroup, Validators ,FormArray } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
// Assuming you have an ApiService to handle HTTP requests
// import { ApiService } from '../services/api.service';



interface ConsumableRow {

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
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './modeer2.component.html',
  styleUrl: './modeer2.component.css'
})

export class Modeer2Component implements OnInit {
// ------------------- SEARCHABLE DROPDOWN PROPERTIES (ADDED) -------------------

    //  Array to hold the list of item names currently displayed in the dropdown
    filteredItemNames: string[] = [];
    isDropdownOpen: boolean[] = [];

    //  Array to track the open/close state for EACH ROW's dropdown
    // Initialized in ngOnInit/addRow


    // --- PROPERTIES FOR DROPDOWN OPTIONS ---
    days: string[] = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')); // "01" to "31"
    months: string[] = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')); // "01" to "12"
    years: string[] = Array.from({ length: 100 }, (_, i) => String(2000 + i));

    // Item Name and Condition Arrays (Example data - replace with your actual options)
    itemNames: string[] = ['أثاث', 'قرطاسية', 'إلكترونيات', 'أدوات نظافة', 'خزائن ملفات', 'أجهزة عرض', 'مواد كيميائية'];
    itemConditions: string[] = ['جديدة', 'مستعمل', 'قابل للإصلاح', 'كهنة أو خردة'];
    documentNumbers:string[]=[' كشف العجز',' سند خصم' ,' أصناف تالفة أو تالفة ',' محضر بيع جلب تشغيل-',' إهداءات ليست للنشاط الرئيسي للجهة'];

    // --- FORM PROPERTIES ---
    tableRows: ConsumableRow[] = [this.createEmptyRow()];
    consumableForm!: FormGroup;
    isSubmitting = signal(false);


    // --- DEPENDENCY INJECTION ---
    private router = inject(Router);
    private fb = inject(FormBuilder);

  // --- CONSTRUCTOR & INITIALIZATION ---
  constructor(private http: HttpClient) {
    this.consumableForm = this.fb.group({
      // Top Info Section Fields - ALL REQUIRED
      destinationName: ['', Validators.required],
      storehouse: ['', Validators.required],

            // Date Groups - Now relying on selection (dropdowns)
            requestDateGroup: this.fb.group({
                yy: ['', Validators.required],
                mm: ['', Validators.required],
                dd: ['', Validators.required]
            }),
            regularDateGroup: this.fb.group({
                yy: ['', Validators.required],
                mm: ['', Validators.required],
                dd: ['', Validators.required]
            }),

            requestorName: ['', Validators.required], // Matches 'اسم الطالب'
            documentNumber: ['', Validators.required], // Matches 'سند الصرف'

            // Table Data using FormArray
            tableData: this.fb.array([])
        });

        // Initialize the filtered list in the constructor
        this.filteredItemNames = [...this.itemNames];
    }

    ngOnInit(): void {
        // Initialize the FormArray with the initial row data
        this.tableRows.forEach(() => {
            this.tableData.push(this.createTableRowFormGroup());
        });

        // 🚨 Initialize the dropdown state array (one entry for each row)
      this.isDropdownOpen = new Array(this.tableData.length).fill(false);
        // this.consumableForm.get('requestorName')?.setValue('New Name');
    }

    // Helper getter to easily access the FormArray
    get tableData(): FormArray {
        return this.consumableForm.get('tableData') as FormArray;
    }

    // Helper function to create the form group for a single table row
    private createTableRowFormGroup(): FormGroup {
        return this.fb.group({
            // MANDATORY FIELDS FOR VALIDATION
            itemName: ['', Validators.required], // اسم الصنف (Dropdown)
            unit: ['', Validators.required], // الوحدة
            quantityRequired: ['', Validators.required], // الكمية المطلوبة

            quantityAuthorized: [''],
            quantityIssued: [''],
            itemCondition: [''],
            unitPrice: [''],
            value: ['']
        });
    }

    // Helper function to create an empty row object
    private createEmptyRow(): ConsumableRow {
        return {
            itemName: '', unit: '', quantityRequired: '',
            quantityAuthorized: '', quantityIssued: '', itemCondition: '',
            unitPrice: '', value: ''
        };
    }

    // ------------------- SEARCHABLE DROPDOWN METHODS (ADDED) -------------------

    /**
     * Filters the global item list based on the user's input.
     * This filtered list is used by all rows.
     */
    filterItems(searchTerm: string): void {
        if (!searchTerm) {
            this.filteredItemNames = [...this.itemNames];
            return;
        }
        const term = searchTerm.toLowerCase();
        this.filteredItemNames = this.itemNames.filter(name =>
            name.toLowerCase().includes(term)
        );
    }

    /**
     * Sets the selected item name back to the correct form control in the correct row.
     * @param selectedName The item name to set.
     * @param rowIndex The index of the row being edited.
     */
// --- Modeer2Component.ts ---

selectItem(selectedName: string, rowIndex: number): void {
    // 1. Get the FormGroup for the specific row
    const rowGroup = this.tableData.at(rowIndex) as FormGroup;

    // 🚨 FIX: Add a guard clause to prevent access if the row doesn't exist
    if (!rowGroup) {
        console.error(`Row group not found at index: ${rowIndex}. Skipping value setting.`);
        // If the row doesn't exist, we must also close the dropdown and exit.
        this.isDropdownOpen[rowIndex] = false;
        return;
    }

    // 2. Set the value safely
    rowGroup.get('itemName')?.setValue(selectedName);

    // 3. Close the dropdown for this row
    this.isDropdownOpen[rowIndex] = false;

    this.filteredItemNames = [...this.itemNames];
}
    /**
     * Helper function for ngFor/trackBy (optional but good practice)
     */
    trackByItem(index: number, item: string): string {
        return item;
    }


    closeDropdown(rowIndex: number): void {
    // We delay closing the dropdown slightly to allow the (mousedown) on an item
    // to complete before the dropdown disappears.
    setTimeout(() => {
        if (this.isDropdownOpen[rowIndex]) {
            this.isDropdownOpen[rowIndex] = false;
        }
    }, 150); // A small delay (e.g., 150ms)
}

    // ------------------- ROW MANAGEMENT LOGIC (UPDATED) -------------------
    addRow(): void {
        this.tableRows.push(this.createEmptyRow());
        this.tableData.push(this.createTableRowFormGroup());

        // 🚨 Update dropdown state for the new row
        this.isDropdownOpen.push(false);
    }

    removeRow(): void {
        if (this.tableRows.length > 1) {
            this.tableRows.pop();
            this.tableData.removeAt(this.tableData.length - 1);

            // 🚨 Update dropdown state
            this.isDropdownOpen.pop();
        } else if (this.tableRows.length === 1) {
            this.tableData.at(0).reset();
        }
    }

    // --- SAVE BUTTON LOGIC ---
    onSubmit(): void {
        // ... (existing submission logic) ...
        if (this.consumableForm.invalid) {
            this.consumableForm.markAllAsTouched();
            console.warn('Form is invalid. Cannot submit.');
            return;
        }

  this.isSubmitting.set(true);

  const reqDate = this.consumableForm.value.requestDateGroup;
  const docDate = this.consumableForm.value.regularDateGroup;

  const basePayload = {
    destinationName: this.consumableForm.value.destinationName,
    storeHouse: this.consumableForm.value.storehouse,

    requestDate: new Date(reqDate.yy, reqDate.mm - 1, reqDate.dd).toISOString(),
    documentDate: new Date(docDate.yy, docDate.mm - 1, docDate.dd).toISOString(),

    requestorName: this.consumableForm.value.requestorName,
    documentNumber: this.consumableForm.value.documentNumber
  };

  const requests = this.tableData.value.map((row: any) => {
    const payload = {
      ...basePayload,

      itemName: row.itemName,
      unit: row.unit,
      requestedQuantity: Number(row.quantityRequired),
      approvedQuantity: Number(row.quantityAuthorized || 0),
      issuedQuantity: Number(row.quantityIssued || 0),
      stockStatus: row.itemCondition || 'جديدة',
      unitPrice: Number(row.unitPrice || 0),
      totalValue: Number(row.value || 0)
    };

    return this.http.post(
      'http://newwinventoryapi.runasp.net/api/SpendPermissions',
      payload
    );
  });

  Promise.all(requests.map((r: any) => r.toPromise()))
    .then(() => {
      alert('تم الحفظ بنجاح ✅');
      this.consumableForm.reset();
      this.isSubmitting.set(false);
    })
    .catch(err => {
      console.error(err);
      alert('حصل خطأ أثناء الحفظ ❌');
      this.isSubmitting.set(false);
    });
}


}


