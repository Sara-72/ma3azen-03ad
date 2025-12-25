import { Component, OnInit } from '@angular/core';
import { SpendPermissionService } from '../../../services/spend-permission.service';
import { StoreKeeperStockService } from '../../../services/store-keeper-stock.service';
import { SpendNoteService } from '../../../services/spend-note.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ameen3',
  standalone: true,
  templateUrl: './ameen3.component.html',
  styleUrls: ['./ameen3.component.css'],
  imports: [CommonModule, FooterComponent, HeaderComponent, FormsModule]
})
export class Ameen3Component implements OnInit {
userName: string = '';
  fullName: string = '';        // الاسم الكامل (رباعي)
displayName: string = '';     // الاسم الثنائي (لـ مرحباً بك)
today: Date = new Date();




  groupedPermissions: any[] = [];
  confirmingPerm: any = null;

  constructor(
    private spendPermissionService: SpendPermissionService,
    private stockService: StoreKeeperStockService,
    private spendNoteService: SpendNoteService
  ) {}

 ngOnInit(): void {
  this.fullName = localStorage.getItem('name') || '';

  // الاسم الثنائي
  this.displayName = this.getFirstTwoNames(this.fullName);

  this.loadNewPermissions();
}

 getFirstTwoNames(fullName: string): string {
    if (!fullName) return '';

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .join(' ');
  }
  // اسم كامل (للتوقيع)
getFullName(): string {
  return this.fullName;
}

  /* =========================
      Helper
  ========================= */
  normalize(value: string) {
    return value?.trim().toLowerCase();
  }

  /* =========================
      Confirm UI
  ========================= */
  openConfirmInline(perm: any) {
    this.confirmingPerm = perm;
  }

  cancelConfirm() {
    this.confirmingPerm = null;
  }

 confirmApprove() {
  if (!this.confirmingPerm) return;
  this.approvePermission(this.confirmingPerm);
}


  /* =========================
      تحميل الأذونات الجديدة
  ========================= */
  loadNewPermissions() {
    this.spendPermissionService.getAll().subscribe({
      next: (res) => {
        const newOnes = res.filter(p => p.permissionStatus === 'جديد');
        const grouped: any = {};

        newOnes.forEach(p => {
          const key = `${p.requestorName}|${p.requestDate}|${p.documentDate}|${p.category}`;

          if (!grouped[key]) {
            grouped[key] = {
              destinationName: p.destinationName,
              category: p.category,
              requestDate: p.requestDate,
              documentDate: p.documentDate,
              requestorName: p.requestorName,
              documentNumber: p.documentNumber,
              managerSignature: p.managerSignature,
              spendNote: p.spendNote,
              permissionStatus: p.permissionStatus,
              storeKeeperSignature: '',
              items: []
            };
          }

          grouped[key].items.push({
            permissionId: p.id,
            fullPermission: p,
            itemName: p.itemName,
            unit: p.unit,
            requestedQuantity: p.requestedQuantity,
            approvedQuantity: p.approvedQuantity,
            issuedQuantity: p.issuedQuantity,
            storeHouse: p.storeHouse,
            stockStatus: p.stockStatus,
            unitPrice: p.unitPrice,
            totalValue: p.totalValue
          });
        });

        this.groupedPermissions = Object.values(grouped);
      },
      error: (err) => console.error('خطأ في تحميل الأذونات', err)
    });
  }

  /* =========================
      تنفيذ عملية الصرف
  ========================= */
 approvePermission(perm: any) {
  if (!perm) return;

  const issueDate = new Date().toISOString();

  // ========= 1️⃣ خصم المخزن =========
  this.stockService.getAllStocks().subscribe({
    next: stocks => {

      const stockRequests = perm.items.map((item: any) => {
        const stock = stocks.find(s =>
          this.normalize(s.itemName) === this.normalize(item.itemName) &&
          this.normalize(s.category) === this.normalize(perm.category) &&
          this.normalize(s.storeType) === this.normalize(item.storeHouse) &&
          this.normalize(s.unit) === this.normalize(item.unit)
        );

        if (!stock) {
          throw new Error(`الصنف ${item.itemName} غير موجود في المخزن`);
        }

        if (stock.quantity < item.requestedQuantity) {
          throw new Error(`الكمية غير كافية للصنف ${item.itemName}`);
        }

        return this.stockService.updateStock(stock.id, {
          stock: {
            itemName: stock.itemName,
            category: stock.category,
            storeType: stock.storeType,
            unit: stock.unit,
            quantity: stock.quantity - item.requestedQuantity,
            storeKeeperSignature: this.fullName,
            additionId: stock.additionId,
            spendPermissionId: item.permissionId
          }
        });
      });

      forkJoin(stockRequests).subscribe({
        next: () => {

          // ========= 2️⃣ تحديث SpendPermissions =========
          const permissionRequests = perm.items.map((item: any) =>
            this.spendPermissionService.update(
  item.permissionId,
  {
    ...item.fullPermission,        // 👈 OBJECT كامل
    permissionStatus: 'تم الصرف',
    issuedQuantity: item.requestedQuantity,
    issueDate: issueDate,
    storeKeeperSignature: this.fullName
  }
)

          );

          forkJoin(permissionRequests).subscribe({
            next: () => {

              // ========= 3️⃣ تحديث SpendNotes =========
              if (perm.spendNote?.id) {
               this.spendNoteService.update(
  perm.spendNote.id,
  {
    ...perm.spendNote,          // 👈 OBJECT كامل
    PermissinStatus: 'تم الصرف',
   // confirmationStatus: 'تم الصرف'
  }
)
.subscribe({
                  next: () => this.finishUI(perm),
                  error: () => alert('❌ فشل تحديث SpendNotes')
                });
              } else {
                this.finishUI(perm);
              }
            },
            error: () => alert('❌ فشل تحديث SpendPermissions')
          });
        },
        error: (err) => alert(err.message || '❌ خطأ أثناء خصم المخزن')
      });
    }
  });
}
finishUI(perm: any) {
  // إزالة الإذن فورًا بدون Refresh
  this.groupedPermissions =
    this.groupedPermissions.filter(p => p !== perm);

  this.confirmingPerm = null;

  alert('✅ تم الصرف بنجاح');
}





}
