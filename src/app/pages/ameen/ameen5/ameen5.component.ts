import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import {
  StoreKeeperStockService,
  StockResponse
} from '../../../services/store-keeper-stock.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ameen5',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    CommonModule,
    FormsModule   // 🔹 مهم للـ ngModel
  ],
  templateUrl: './ameen5.component.html',
  styleUrls: ['./ameen5.component.css']
})
export class Ameen5Component implements OnInit {
  userName: string = '';
  displayName: string = '';

  private stockService = inject(StoreKeeperStockService);

  stocks: StockResponse[] = [];
  filteredStocks: StockResponse[] = [];   // 🔹 للعرض
  categories: string[] = [];              // 🔹 الفئات
  selectedCategory: string = '';          // 🔹 المختارة
  isLoading = true;

  ngOnInit(): void {
    this.userName = localStorage.getItem('name') || '';
    this.displayName = this.getFirstTwoNames(this.userName);

    this.loadStocks();
  }

  getFirstTwoNames(fullName: string): string {
    if (!fullName) return '';
    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .join(' ');
  }
  private groupStocks(stocks: StockResponse[]): StockResponse[] {
  const grouped = new Map<string, StockResponse>();

  stocks.forEach(stock => {
    // 🔹 المفتاح اللي بيحدد التجميع
    const key = `${stock.category}|${stock.itemName}|${stock.storeType}|${stock.unit}`;

    if (grouped.has(key)) {
      // 🔹 لو موجود قبل كده → نجمع الكمية
      grouped.get(key)!.quantity += stock.quantity;
    } else {
      // 🔹 أول مرة → نخزن نسخة
      grouped.set(key, {
        ...stock,
        quantity: stock.quantity,
        // اختياري: نخلي التاريخ أحدث تاريخ
        date: stock.date
      });
    }
  });

  return Array.from(grouped.values());
}


  loadStocks(): void {
  this.isLoading = true;
  this.stockService.getAllStocks().subscribe({
    next: (data) => {

      // 🔹 تخزين الداتا الأصلية لو احتجناها
      this.stocks = data;

      // 🔹 تجميع المخزن
      const groupedStocks = this.groupStocks(data);

      // 🔹 استخراج الفئات من الداتا المجمعة
      this.categories = [
        ...new Set(groupedStocks.map(stock => stock.category))
      ];

      // 🔹 العرض يكون من الداتا المجمعة
      this.filteredStocks = groupedStocks;

      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error loading stocks', err);
      this.isLoading = false;
    }
  });
}


  // 🔹 فلترة حسب الفئة (عرض فقط)
  filterByCategory(): void {
  const groupedStocks = this.groupStocks(this.stocks);

  if (!this.selectedCategory) {
    this.filteredStocks = groupedStocks;
  } else {
    this.filteredStocks = groupedStocks.filter(
      stock => stock.category === this.selectedCategory
    );
  }
}


  // 🔹 trackBy لتحسين الأداء في *ngFor
  trackById(index: number, item: StockResponse) {
    return item.id;
  }

  // 🔹 يمكن استدعاؤها بعد أي إضافة أو تعديل
  reloadStocks() {
    this.loadStocks();
  }
}
