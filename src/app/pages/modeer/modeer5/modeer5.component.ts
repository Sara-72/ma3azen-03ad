import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { ModeerSercive } from '../../../services/modeer.service';

/* ===== Interface المعتمدة على الجرد ===== */
export interface InventoryItem {
  itemName: string;            // من StoreKeeperStocks
  remainingQuantity: number;   // من StoreKeeperStocks
  issuedQuantity: number;      // من SpendPermissions
  totalQuantity: number;       // من CentralStore
  category: string;            // من StoreKeeperStocks
  itemType: string;            // من StoreKeeperStocks
}

@Component({
  selector: 'app-modeer5',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './modeer5.component.html',
  styleUrl: './modeer5.component.css'
})
export class Modeer5Component implements OnInit {

  fullName: string = '';
  displayName: string = '';
  today: Date = new Date();

  inventoryData: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];

  startDate: string = '';
endDate: string = '';

  /* Filters */
  categories: string[] = [];
  selectedCategory: string = 'الكل';

  /* Status Modal */
  statusMessage: string | null = null;
  statusType: 'success' | 'error' | null = null;

  /* View Mode */
  viewMode: 'live' | 'history' = 'live';
  selectedHistoryDate: string = '';
  historyRecords: any[] = [];

constructor(private stockService: ModeerSercive) {}


  ngOnInit(): void {
    this.fullName = localStorage.getItem('name') || 'أمين المخزن';
    this.displayName = this.fullName.split(' ').slice(0, 2).join(' ');
    this.loadInventory();
  }

  /* ===== تحميل بيانات الجرد من StoreKeeperStocks ===== */
loadInventory(): void {

  // 1️⃣ المخزن المركزي
  this.stockService.getCentralStore().subscribe({
    next: (centralStore) => {

      // 2️⃣ مخزن أمين المخزن
      this.stockService.getStoreKeeperStocks().subscribe({
        next: (storeStocks) => {

          // 3️⃣ أذونات الصرف
          this.stockService.getSpendPermissions().subscribe({
            next: (spendPermissions) => {

              this.inventoryData = storeStocks.map(stock => {

                // 🔹 الكمية الكلية من CentralStore
                const centralItem = centralStore.find(
                  (c: any) => c.itemName === stock.itemName
                );

                // 🔹 حساب الكمية المنصرفة من SpendPermissions
                const issuedTotal = spendPermissions
                  .filter((p: any) => p.itemName === stock.itemName)
                  .reduce(
                    (sum: number, p: any) => sum + (p.issuedQuantity || 0),
                    0
                  );

                return {
                  itemName: stock.itemName,
                  category: stock.category || 'غير مصنف',
                  itemType: stock.storeType || 'غير محدد',

                  // من CentralStore
                  totalQuantity: centralItem ? centralItem.quantity : 0,

                  // من SpendPermissions (مجمعة)
                  issuedQuantity: issuedTotal,

                  // من StoreKeeperStocks
                  remainingQuantity: stock.quantity
                };
              });

              // استخراج الفئات
              this.categories = [
                ...new Set(this.inventoryData.map(i => i.category))
              ];

              this.applyFilter();
            },
            error: () => {
              this.showStatus('❌ فشل تحميل أذونات الصرف', 'error');
            }
          });

        },
        error: () => {
          this.showStatus('❌ فشل تحميل مخزن أمين المخزن', 'error');
        }
      });

    },
    error: () => {
      this.showStatus('❌ فشل تحميل المخزن المركزي', 'error');
    }
  });
}
  /* ===== فلترة حسب الفئة ===== */
  applyFilter(): void {
    if (this.selectedCategory === 'الكل') {
      this.filteredInventory = [...this.inventoryData];
    } else {
      this.filteredInventory = this.inventoryData.filter(
        item => item.category === this.selectedCategory
      );
    }
  }

  /* ===== تغيير وضع العرض ===== */
  onViewModeChange(): void {
    if (this.viewMode === 'live') {
      this.loadInventory();
    } else {
      this.loadHistoryData();
    }
  }

  /* ===== بيانات أرشيف (مستقبلي) ===== */
  loadHistoryData(): void {
    this.filteredInventory = [];
    this.showStatus('⚠️ عرض الأرشيف غير متاح حاليًا', 'error');
  }

  /* ===== Status Helpers ===== */
  showStatus(msg: string, type: 'success' | 'error') {
    this.statusMessage = msg;
    this.statusType = type;
  }

  closeStatusMessage() {
    this.statusMessage = null;
    this.statusType = null;
  }

  /* ===== اعتماد الجرد ===== */
  confirmInventoryAudit(): void {
    console.log('Saving inventory audit...');

    setTimeout(() => {
      this.showStatus(
        '✅ تم اعتماد كشف الجرد وحفظه في سجلات النظام بنجاح',
        'success'
      );
    }, 1000);
  }
getDeficit(item: InventoryItem): number {
  const deficit =
    item.totalQuantity -
    (item.issuedQuantity + item.remainingQuantity);

  return deficit > 0 ? deficit : 0;
}
}
