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

  groupedPermissions: any[] = [];
  confirmingPerm: any = null;

  constructor(
    private spendPermissionService: SpendPermissionService,
    private stockService: StoreKeeperStockService,
    private spendNoteService: SpendNoteService
  ) {}

  ngOnInit() {
    this.loadNewPermissions();
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

    if (!this.confirmingPerm.storeKeeperSignature || this.confirmingPerm.storeKeeperSignature.trim() === '') {
      alert('❌ من فضلك أدخل اسم أمين المخازن أولاً');
      return;
    }

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
  let completed = 0;
  let errorOccurred = false;
  const total = perm.items.length;

  // رسالة للمستخدم أثناء التنفيذ
  alert('⏳ جاري معالجة إذن الصرف...');

  const handleComplete = () => {
    completed++;
    if (completed === total) {
  if (errorOccurred) {
    alert('❌ لم يتم الصرف بسبب خطأ في المخزون');
    this.confirmingPerm = null;
    return;
  }
  updateSpendNote(perm);
}

  };

  const updateSpendNote = (perm: any) => {
  const permissionUpdates = perm.items.map((item: any) =>
    this.spendPermissionService.update(item.permissionId, {
      id: item.permissionId,
      permissionStatus: 'تم الصرف',
      issuedQuantity: item.requestedQuantity,
      storeKeeperSignature: perm.storeKeeperSignature
    })
  );

  forkJoin(permissionUpdates).subscribe({
    next: () => {
      if (!perm.spendNote?.id) {
        finalizeApproval(perm);
        return;
      }

      this.spendNoteService.update(perm.spendNote.id, {
        id: perm.spendNote.id,
        permissinStatus: 'تم الصرف',
        confirmationStatus: 'تم الصرف'
      }).subscribe({
        next: () => finalizeApproval(perm),
        error: err => {
          console.error(err);
          alert('❌ فشل تحديث SpendNote');
        }
      });
    }
  });
};


  const finalizeApproval = (perm: any) => {
    // إزالة الإذن من القائمة فورًا بدون ريستارت الصفحة
    this.groupedPermissions = this.groupedPermissions.filter(p => p !== perm);
    this.confirmingPerm = null;
    alert(' تم الصرف والتحديث   بنجاح');
  };

  // خصم المخزون
  this.stockService.getAllStocks().subscribe({
    next: (stocks) => {
      perm.items.forEach((item: any) => {
        const existing = stocks.find(s =>
          this.normalize(s.itemName) === this.normalize(item.itemName) &&
          this.normalize(s.category) === this.normalize(perm.category) &&
          this.normalize(s.unit) === this.normalize(item.unit)
        );

        if (!existing) {
          alert(`❌ الصنف ${item.itemName} غير موجود في المخزن`);
          errorOccurred = true;
          handleComplete(); 
          return;
        }

        if (existing.quantity < item.requestedQuantity) {
          alert(`❌ الكمية غير كافية للصنف ${item.itemName}. المتوفر: ${existing.quantity}`);
          errorOccurred = true;
          handleComplete(); 
          return;
        }

        const updatedBody = {
          stock: {
            itemName: existing.itemName,
            category: existing.category,
            storeType: existing.storeType,
            unit: existing.unit,
            quantity: existing.quantity - item.requestedQuantity,
            storeKeeperSignature: perm.storeKeeperSignature,
            additionId: existing.additionId,
            spendPermissionId: item.permissionId
          }
        };

        this.stockService.updateStock(existing.id, updatedBody).subscribe({
          next: () => handleComplete(),
          error: () => handleComplete()
        });
      });
    },
    error: err => {
      console.error('خطأ في جلب المخزون', err);
      alert('❌ حدث خطأ أثناء جلب بيانات المخزن');
    }
  });
}



}
