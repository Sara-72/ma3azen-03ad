import { Component, OnInit, inject, signal } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { forkJoin, of, lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CentralStoreService } from '../../../services/central-store.service';
import { SpendPermissionService } from '../../../services/spend-permission.service';
import { LedgerService, LedgerEntry } from '../../../services/ledger.service';

@Component({
  selector: 'app-ameen2',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './ameen4.component.html',
  styleUrls: ['./ameen4.component.css']
})
export class Ameen4Component implements OnInit {

  userName = '';
  displayName = '';

  private centralStoreService = inject(CentralStoreService);
  private spendService = inject(SpendPermissionService);
  private ledgerService = inject(LedgerService);

  consumerEntries = signal<any[]>([]);
  durableEntries = signal<any[]>([]);

  ngOnInit(): void {
    this.userName = localStorage.getItem('name') || '';
    this.displayName = this.getFirstTwoNames(this.userName);

    this.loadLedgerEntries();
    this.updateLedgerFromStores();
  }

  getFirstTwoNames(fullName: string): string {
    return fullName ? fullName.trim().split(/\s+/).slice(0, 2).join(' ') : '';
  }

  private loadLedgerEntries() {
    this.ledgerService.getLedgerEntries().pipe(
      catchError(() => of([]))
    ).subscribe((ledgerEntries: LedgerEntry[]) => {

      const consumer: any[] = [];
      const durable: any[] = [];

      ledgerEntries
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach(entry => {
          const row = {
            date: entry.date ? new Date(entry.date) : new Date(),
            itemName: entry.itemName,
            category: entry.storeType === 0 ? 'مستهلك' : 'مستديم',
            quantity: entry.itemsValue,
            source: entry.documentReference
          };

          entry.storeType === 0 ? consumer.push(row) : durable.push(row);
        });

      this.consumerEntries.set(consumer);
      this.durableEntries.set(durable);

      localStorage.setItem('consumerEntries', JSON.stringify(consumer));
      localStorage.setItem('durableEntries', JSON.stringify(durable));
    });
  }

  private updateLedgerFromStores() {
    forkJoin({
      central: this.centralStoreService.getAll().pipe(catchError(() => of([]))),
      spend: this.spendService.getAll().pipe(catchError(() => of([]))),
      ledger: this.ledgerService.getLedgerEntries().pipe(catchError(() => of([])))
    }).subscribe(async ({ central, spend, ledger }) => {

      const requests: Promise<any>[] = [];

      // فقط المخزن المركزي يحتاج تفادي duplicates
      const ledgerKeys = new Set(
        ledger.map(l => `${l.itemName}|${l.date}|${l.documentReference}|${l.storeType}`)
      );

      /* ======================
         1️⃣ المخزن المركزي
      ====================== */
      central.forEach(entry => {
        const e = entry as any;

        if (e.ledgerEntriesStatus !== 'لم يسجل') return;

        const key = `${e.itemName}|${e.date}|وارد من|${e.storeType === 'مستهلك' ? 0 : 1}`;
        if (ledgerKeys.has(key)) return;

        const ledgerEntry: LedgerEntry = {
          date: e.date || new Date(),
          itemName: e.itemName,
          documentReference: 'وارد من',
          itemsValue: Math.abs(e.quantity || 0),
          storeType: e.storeType === 'مستهلك' ? 0 : 1,
          spendPermissionId: null,
          spendPermission: null
        };

        ledgerKeys.add(key);

        requests.push(
          lastValueFrom(this.ledgerService.addLedgerEntry(ledgerEntry))
            .then(() =>
              lastValueFrom(
                this.centralStoreService.update(e.id, {
                  ...e,
                  ledgerEntriesStatus: 'تم التسجيل'
                })
              )
            )
        );
      });

      /* ======================
         2️⃣ أذونات الصرف
         ✅ كل الصرف يتم تسجيله بالقيمة الموجبة حتى لو نفس العنصر والفئة والتاريخ
      ====================== */
      spend.forEach(sp => {
        const s = sp as any;

        if (
          s.ledgerEntriesStatus === 'تم التسجيل' || 
          (s.permissionStatus !== 'تم الصرف' && s.permissionStatus !== 'تم الاسترجاع')
        ) return;

        const sourceText = s.permissionStatus === 'تم الصرف' ? 'منصرف إلى' : 'وارد من';
        const storeType = (s.storeHouse || '').toLowerCase().includes('مستهلك') ? 0 : 1;

        const ledgerEntry: LedgerEntry = {
          date: s.issueDate || new Date(),
          itemName: s.itemName,
          documentReference: sourceText,
          itemsValue: Math.abs(s.issuedQuantity || 0), // ✅ دائمًا موجبة
          storeType,
          spendPermissionId: s.id,
          spendPermission: null
        };

        requests.push(
          lastValueFrom(this.ledgerService.addLedgerEntry(ledgerEntry))
            .then(() =>
              lastValueFrom(
                this.spendService.update(s.id, {
                  ...s,
                  ledgerEntriesStatus: 'تم التسجيل'
                })
              )
            )
        );
      });

      await Promise.all(requests);
      this.loadLedgerEntries();
    });
  }
}
