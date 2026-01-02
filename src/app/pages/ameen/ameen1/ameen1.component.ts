import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { catchError, of, Subscription } from 'rxjs';
import {
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';

import {
  StoreKeeperStockService
} from '../../../services/store-keeper-stock.service';
import { CentralStoreService } from '../../../services/central-store.service';

interface CategoryItemMap {
  [key: string]: string[];
}

@Component({
  selector: 'app-ameen1',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './ameen1.component.html',
  styleUrl: './ameen1.component.css'
})
export class Ameen1Component implements OnInit, OnDestroy {

  /* ===================== Static Data ===================== */
  categoryItemMap: CategoryItemMap = {
    'أثاث مكتبي': ['مكتب مدير', 'كرسي دوار', 'خزانة ملفات'],
    'قرطاسية': ['أقلام حبر', 'أوراق A4', 'دفاتر ملاحظات'],
    'إلكترونيات': ['حاسوب محمول', 'طابعة ليزر', 'شاشة عرض'],
    'أدوات نظافة': ['مطهرات', 'مكانس', 'مناشف ورقية']
  };

  categories: string[] = Object.keys(this.categoryItemMap);
  itemTypes: string[] = ['مستهلك', 'مستديم'];
  availableItemsByRow: string[][] = [];

  /* ===================== State ===================== */
  simpleForm!: FormGroup;
  isSubmitting = signal(false);

  userName = '';
  displayName = '';

  statusMessage: string | null = null;
  statusType: 'success' | 'error' | null = null;

  private subscriptions: Subscription[] = [];

  /* ===================== DI ===================== */
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stockService = inject(StoreKeeperStockService);
  private centralStoreService = inject(CentralStoreService);

  constructor() {
    this.simpleForm = this.fb.group({
      tableData: this.fb.array([])
    });
  }

  /* ===================== Lifecycle ===================== */
  ngOnInit(): void {
    this.userName = localStorage.getItem('name') || '';
    this.displayName = this.getFirstTwoNames(this.userName);

    const firstRow = this.createTableRowFormGroup();
    this.tableData.push(firstRow);
    this.availableItemsByRow.push([]);
    this.addCategoryListener(firstRow, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /* ===================== Helpers ===================== */
  get tableData(): FormArray {
    return this.simpleForm.get('tableData') as FormArray;
  }

  private getFirstTwoNames(fullName: string): string {
    return fullName?.trim().split(/\s+/).slice(0, 2).join(' ') || '';
  }

  private sameDay(d1: string, d2: string): boolean {
  const day1 = d1.split('T')[0];
  const day2 = d2.split('T')[0];
  return day1 === day2;
}


  private createTableRowFormGroup(): FormGroup {
    return this.fb.group({
      category: ['', Validators.required],
      item: [null, Validators.required],
      itemType: ['', Validators.required],
      unit: ['', Validators.required],
      count: ['', Validators.required],
      entryDate: ['', Validators.required]
    });
  }

  private addCategoryListener(rowGroup: FormGroup, index: number): void {
    const sub = rowGroup.get('category')?.valueChanges.subscribe(cat => {
      this.availableItemsByRow[index] = this.categoryItemMap[cat] || [];
      rowGroup.get('item')?.reset(null, { emitEvent: false });
    });
    if (sub) this.subscriptions.push(sub);
  }

  /* ===================== Rows ===================== */
  addRow(): void {
    const row = this.createTableRowFormGroup();
    const index = this.tableData.length;
    this.tableData.push(row);
    this.availableItemsByRow.push([]);
    this.addCategoryListener(row, index);
  }

  removeRow(): void {
    if (this.tableData.length > 1) {
      this.tableData.removeAt(this.tableData.length - 1);
      this.availableItemsByRow.pop();
      this.subscriptions.pop()?.unsubscribe();
    } else {
      this.tableData.at(0).reset();
    }
  }

  /* ===================== Submit ===================== */
  onSubmit(): void {
  if (this.simpleForm.invalid) {
    this.simpleForm.markAllAsTouched();
    return;
  }

  this.isSubmitting.set(true);

  /* ========== STEP 1: GROUP FORM ROWS ========== */
  const rawRows = this.simpleForm.getRawValue().tableData;

  const groupedMap = new Map<string, any>();

  rawRows.forEach((row: any) => {
    const key = [
      row.item,
      row.category,
      row.itemType,
      row.unit,
      row.entryDate
    ].join('|');

    if (groupedMap.has(key)) {
      groupedMap.get(key).count += Number(row.count);
    } else {
      groupedMap.set(key, {
        ...row,
        count: Number(row.count)
      });
    }
  });

  const rows = Array.from(groupedMap.values());

  /* ========== STEP 2: SAVE TO DATABASE ========== */
  let completed = 0;
  const total = rows.length;

  rows.forEach((row: any) => {
    const { item, category, itemType, unit, entryDate, count } = row;
    const newQuantity = Number(count);

    /* ========== StoreKeeperStocks ========== */
    this.stockService.getAllStocks().pipe(
      catchError(() => of([]))
    ).subscribe(storeStocks => {

      const existingStore = storeStocks.find((s: any) =>
        s.itemName === item &&
        s.category === category &&
        s.storeType === itemType &&
        s.unit === unit &&
        this.sameDay(s.date, entryDate)
      );

      const afterStore = () => {
        /* ========== CentralStore ========== */
        this.centralStoreService.getAll().pipe(
          catchError(() => of([]))
        ).subscribe(centralStocks => {

          const existingCentral = centralStocks.find((c: any) =>
            c.itemName === item &&
            c.category === category &&
            c.storeType === itemType &&
            c.unit === unit &&
            this.sameDay(c.date, entryDate)
          );

          if (existingCentral) {
            this.centralStoreService.update(existingCentral.id, {
              itemName: item,
              category,
              storeType: itemType,
              unit,
              quantity: existingCentral.quantity + newQuantity,
              date: entryDate,
              storeKeeperSignature: this.displayName
            }).subscribe(() => this.handleComplete(++completed, total));
          } else {
            this.centralStoreService.add({
              itemName: item,
              category,
              storeType: itemType,
              unit,
              quantity: newQuantity,
              date: entryDate,
              storeKeeperSignature: this.displayName
            }).subscribe(() => this.handleComplete(++completed, total));
          }
        });
      };

      if (existingStore) {
        this.stockService.updateStock(existingStore.id, {
          stock: {
            itemName: item,
            category,
            storeType: itemType,
            unit,
            quantity: existingStore.quantity + newQuantity,
            date: entryDate,
            storeKeeperSignature: this.displayName
          }
        }).subscribe(afterStore);
      } else {
        this.stockService.addStock({
          stock: {
            itemName: item,
            category,
            storeType: itemType,
            unit,
            quantity: newQuantity,
            date: entryDate,
            storeKeeperSignature: this.displayName
          }
        }).subscribe(afterStore);
      }
    });
  });
}


  /* ===================== UI ===================== */
  private handleComplete(done: number, total: number) {
    if (done === total) {
      this.isSubmitting.set(false);
      this.showStatus('تم حفظ البيانات بنجاح وتحديث أرصدة المخازن', 'success');
      this.simpleForm.reset();
      this.tableData.clear();
      this.addRow();
    }
  }

  showStatus(msg: string, type: 'success' | 'error') {
    this.statusMessage = msg;
    this.statusType = type;
  }

  closeStatusMessage() {
    this.statusMessage = null;
    this.statusType = null;
  }
}
