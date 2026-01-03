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

  loadStocks(): void {
    this.isLoading = true;
    this.stockService.getAllStocks().subscribe({
      next: (data) => {
        this.stocks = data;

        // 🔹 استخراج الفئات بدون تكرار
        this.categories = [...new Set(data.map(stock => stock.category))];

        // 🔹 في البداية نعرض الكل
        this.filteredStocks = [...this.stocks];

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
    if (!this.selectedCategory) {
      this.filteredStocks = [...this.stocks];
    } else {
      this.filteredStocks = this.stocks.filter(
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
