import { Component ,OnInit, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormArray } from '@angular/forms';
import { catchError, lastValueFrom, Observable, of } from 'rxjs';
import { LedgerService, LedgerEntry } from '../../../services/ledger.service';


@Component({
  selector: 'app-ameen2',
  imports: [
    HeaderComponent,
    FooterComponent,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './ameen2.component.html',
  styleUrl: './ameen2.component.css'
})
export class Ameen2Component implements OnInit {

 userName: string = '';
displayName: string = '';


  // 1. Define your item options
  availableItems: string[] = [
    'جهاز كمبيوتر لاب توب',
    'طابعة ليزر',
    'ورق A4',
    'كراسي مكتب',
    'أحبار طابعات'
  ];


  assetTypes: string[] = ['مستهلك', 'مستديم'];


  sourceDestinationOptions: string[] = [
    'وارد من',
    'منصرف الى'

  ];

  inventoryLogForm!: FormGroup;
  isSubmitting = signal(false);

  private fb = inject(FormBuilder);
  private ledgerService = inject(LedgerService);

  constructor() {
  this.inventoryLogForm = this.fb.group({

    assetType: ['', Validators.required],
    tableData: this.fb.array([])
  });
}

  ngOnInit(): void {
    this.userName = localStorage.getItem('name') || '';
    this.displayName = this.getFirstTwoNames(this.userName);

    // Start with one empty row
    this.tableData.push(this.createTableRowFormGroup());
  }


 getFirstTwoNames(fullName: string): string {
    if (!fullName) return '';

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .join(' ');
  }

  // Helper getter to easily access the FormArray
  get tableData(): FormArray {
    return this.inventoryLogForm.get('tableData') as FormArray;
  }

  // Helper function to create the form group for a single table row (7 columns)
  private createTableRowFormGroup(): FormGroup {
    return this.fb.group({
      date: ['',Validators.required],             // التاريخ
      itemName: ['', Validators.required],

      sourceOrDestination: ['',Validators.required], // وارد من / منصرف إلى
      addedValue: ['',Validators.required],       // قيمة الأصناف المضافة
      issuedValue: ['',Validators.required],      // قيمة الأصناف المنصرفة

      itemValue: ['', [Validators.required, Validators.min(0)]], // Number input
      transactionType: ['added', Validators.required] // To keep logic clean



    });
  }

  //  Method to add a new row
  addRow(): void {
    this.tableData.push(this.createTableRowFormGroup());
  }

  // Method to remove the last row
  removeRow(): void {
    if (this.tableData.length > 1) {
      this.tableData.removeAt(this.tableData.length - 1);
    } else if (this.tableData.length === 1) {
      this.tableData.at(0).reset();
    }
  }

  // --- SAVE BUTTON LOGIC ---

// Update your onSubmit mapping to handle the new structure
  onSubmit(): void {
  if (this.inventoryLogForm.invalid) {
    this.inventoryLogForm.markAllAsTouched();
    return;
  }

  this.isSubmitting.set(true);

  const assetTypeIndex = this.assetTypes.indexOf(this.inventoryLogForm.value.assetType);

  const requests = this.tableData.value.map((row: any) => {

    // تحديد قيمة itemsValue بناءً على نوع المعاملة
    const itemsValue =
      row.transactionType === 'added'
        ? Number(row.addedValue) || 0
        : -(Number(row.issuedValue) || 0); // سالب لو منصرف

    const entry: LedgerEntry = {
      date: new Date(row.date).toISOString(),
      itemName: row.itemName,
      documentReference: row.sourceOrDestination,
      itemsValue: itemsValue,
      storeType: assetTypeIndex,  // 0 = مستهلك | 1 = مستديم
      spendPermissionId: null,
      spendPermission: null
    };

    return lastValueFrom(
      this.ledgerService.addLedgerEntry(entry).pipe(
        catchError(err => {
          console.error('API Error:', err);
          throw err; 
        })
      )
    );
  });

  Promise.all(requests)
    .then(() => {
      alert('تم حفظ البيانات بنجاح');
      this.inventoryLogForm.reset();
      this.tableData.clear();
      this.addRow();
    })
    .catch(() => {
      alert('فشل حفظ البيانات');
    })
    .finally(() => this.isSubmitting.set(false));
}




}
