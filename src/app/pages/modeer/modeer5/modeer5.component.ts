import { Component, OnInit,signal } from '@angular/core';
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
// User Info
  fullName: string = '';
  displayName: string = '';
  today: Date = new Date();

  // Data Arrays
  inventoryData: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];
  categories: string[] = [];

  // Filter States
  selectedCategory: string = 'الكل';
  viewMode: 'live' | 'history' = 'live';

  // Date Period Variables
  startDate: string = '';
  endDate: string = '';

  // Status Modal State
  statusMessage: string | null = null;
  statusType: 'success' | 'error' | null = null;
  isSubmitting = signal(false);

  constructor(private stockService: ModeerSercive) {}

  ngOnInit(): void {
    // Initialize User Data
    this.fullName = localStorage.getItem('name') || 'أمين المخزن';
    this.displayName = this.fullName.split(' ').slice(0, 2).join(' ');

    // Initial Load
    this.loadInventory();
  }

  /* ===== Load Live Inventory Data ===== */
  loadInventory(): void {
    // Reset filters when loading live data
    this.startDate = '';
    this.endDate = '';

    // Fetch from 3 sources: Central Store, Keeper Stocks, and Spend Permissions
    this.stockService.getCentralStore().subscribe({
      next: (centralStore) => {
        this.stockService.getStoreKeeperStocks().subscribe({
          next: (storeStocks) => {
            this.stockService.getSpendPermissions().subscribe({
              next: (spendPermissions) => {

                // Map and combine data into the InventoryItem format
                this.inventoryData = storeStocks.map(stock => {
                  const centralItem = centralStore.find((c: any) => c.itemName === stock.itemName);

                  const issuedTotal = spendPermissions
                    .filter((p: any) => p.itemName === stock.itemName)
                    .reduce((sum: number, p: any) => sum + (p.issuedQuantity || 0), 0);

                  return {
                    itemName: stock.itemName,
                    category: stock.category || 'غير مصنف',
                    itemType: stock.storeType || 'غير محدد',
                    totalQuantity: centralItem ? centralItem.quantity : 0,
                    issuedQuantity: issuedTotal,
                    remainingQuantity: stock.quantity
                  };
                });

                // Extract unique categories for the dropdown
                this.categories = [...new Set(this.inventoryData.map(i => i.category))];
                this.applyFilter();
              },
              error: () => this.showStatus('❌ فشل تحميل أذونات الصرف', 'error')
            });
          },
          error: () => this.showStatus('❌ فشل تحميل مخزن أمين المخزن', 'error')
        });
      },
      error: () => this.showStatus('❌ فشل تحميل المخزن المركزي', 'error')
    });
  }

  /* ===== Date Period Logic (History) ===== */
  loadHistoryByPeriod(): void {
    if (!this.startDate || !this.endDate) return;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (start > end) {
      this.showStatus('خطأ: تاريخ البداية يجب أن يكون قبل تاريخ النهاية', 'error');
      return;
    }

    // Simulate fetching historical records
    // In a real app, you would call: this.stockService.getHistory(this.startDate, this.endDate)
    console.log(`Fetching records from ${this.startDate} to ${this.endDate}`);
    this.showStatus(`عرض السجلات للفترة من ${this.startDate} إلى ${this.endDate}`, 'success');
  }

  /* ===== UI Logic ===== */
  applyFilter(): void {
    if (this.selectedCategory === 'الكل') {
      this.filteredInventory = [...this.inventoryData];
    } else {
      this.filteredInventory = this.inventoryData.filter(
        item => item.category === this.selectedCategory
      );
    }
  }

  onViewModeChange(): void {
    if (this.viewMode === 'live') {
      this.loadInventory();
    } else {
      // Clear current table until dates are selected in history mode
      this.filteredInventory = [];
      this.inventoryData = [];
    }
  }

  getDeficit(item: InventoryItem): number {
    const deficit = item.totalQuantity - (item.issuedQuantity + item.remainingQuantity);
    return deficit > 0 ? deficit : 0;
  }

  /* ===== Form Actions ===== */
  confirmInventoryAudit(): void {
    this.isSubmitting.set(true);

    // Simulate API Save Call
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.showStatus('✅ تم اعتماد كشف الجرد وحفظه في سجلات النظام بنجاح', 'success');
    }, 1500);
  }

  /* ===== Status Modal Helpers ===== */
  showStatus(msg: string, type: 'success' | 'error') {
    this.statusMessage = msg;
    this.statusType = type;
  }

  closeStatusMessage() {
    this.statusMessage = null;
    this.statusType = null;
  }

}
