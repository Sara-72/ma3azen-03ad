import { Component, OnInit } from '@angular/core';
import { SpendPermissionService } from '../../../services/spend-permission.service';
import { StoreKeeperStockService } from '../../../services/store-keeper-stock.service';
import { SpendNoteService } from '../../../services/spend-note.service';
import { FooterComponent } from "../../../components/footer/footer.component";
import { HeaderComponent } from "../../../components/header/header.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ameen3',
  templateUrl: './ameen3.component.html',
  styleUrl: './ameen3.component.css',
  imports: [CommonModule, FooterComponent, HeaderComponent]
})
export class Ameen3Component implements OnInit {
[x: string]: any;

  newPermissions: any[] = [];
  groupedPermissions: any[] = [];
  showConfirmModal = false;
selectedPermission: any = null;
confirmingPerm: any = null;




  constructor(
    private spendPermissionService: SpendPermissionService,
    private stockService: StoreKeeperStockService,
    private spendNoteService: SpendNoteService
  ) {}

  ngOnInit() {
    this.loadNewPermissions();
  }
  openConfirmInline(perm: any) {
  this.confirmingPerm = perm;
}

cancelConfirm() {
  this.confirmingPerm = null;
}

confirmApprove() {
  if (!this.confirmingPerm) return;

  this.approvePermission(this.confirmingPerm);
  this.confirmingPerm = null;
}



  // 1️⃣ تحميل الأذونات الجديدة
  loadNewPermissions() {
  this.spendPermissionService.getAll().subscribe(res => {

    const newOnes = res.filter(p => p.permissionStatus === 'جديد');

    const grouped: any = {};

    newOnes.forEach(p => {

      const key = `
        ${p.requestorName}|
        ${p.requestDate}|
        ${p.documentDate}|
        ${p.category}
      `;

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

          // 👈 هنا الأصناف
          items: []
        };
      }

     grouped[key].items.push({
  permissionId: p.id,
  fullPermission: p,   // ⭐⭐⭐ مهم
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
  });
}


  // 2️⃣ زر القبول
  approvePermission(perm: any) {

  // // 🔔 تأكيد UI
  // const confirmed = confirm('⚠ هل أنت متأكد من قبول إذن الصرف بالكامل؟');
  // if (!confirmed) return;

  perm.items.forEach((item: any) => {

    this.stockService.getAllStocks().subscribe(stocks => {

      const stock = stocks.find(s =>
        s.itemName === item.itemName &&
        s.category === perm.category &&
        s.unit === item.unit
      );

      if (!stock || stock.quantity < item.requestedQuantity) {
        alert(`❌ الكمية غير كافية للصنف ${item.itemName}`);
        return;
      }

      // 1️⃣ خصم المخزن
      this.stockService.updateStock(stock.id, {
        stock: {
          ...stock,
          quantity: stock.quantity - item.requestedQuantity
        }
      }).subscribe(() => {

        // 2️⃣ تحديث SpendPermission (كامل)
        const updatedPermission = {
          ...item.fullPermission,
          permissionStatus: ' الطلب مقبول'
        };

        this.spendPermissionService
          .update(item.permissionId, updatedPermission)
          .subscribe();
      });
    });
  });

  // 3️⃣ تحديث SpendNote مرة واحدة
  this.spendNoteService.update(perm.spendNote.id, {
    ...perm.spendNote,
    permissinStatus: ' الطلب مقبول'
  }).subscribe(() => {
   
  // ✅ حذف الإذن من الواجهة فورًا
  this.groupedPermissions =
    this.groupedPermissions.filter(p => p !== perm);

  alert('✅ تم قبول إذن الصرف بالكامل');
  });
}


}
