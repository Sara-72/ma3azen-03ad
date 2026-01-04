import { Component, OnInit, inject, signal } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LedgerService, LedgerEntry } from '../../../services/ledger.service';

@Component({
  selector: 'app-ameen4',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './ameen4.component.html',
  styleUrls: ['./ameen4.component.css']
})
export class Ameen4Component implements OnInit {

  userName = '';
  displayName = '';

  private ledgerService = inject(LedgerService);

  consumerEntries = signal<any[]>([]);
  durableEntries = signal<any[]>([]);

  ngOnInit(): void {
    this.userName = localStorage.getItem('name') || '';
    this.displayName = this.getFirstTwoNames(this.userName);

    this.loadLedgerEntries();
  }

  getFirstTwoNames(fullName: string): string {
    return fullName
      ? fullName.trim().split(/\s+/).slice(0, 2).join(' ')
      : '';
  }

  private loadLedgerEntries() {
    this.ledgerService.getLedgerEntries().pipe(
      catchError(() => of([]))
    ).subscribe((ledgerEntries: LedgerEntry[]) => {

      const consumer: any[] = [];
      const durable: any[] = [];

      ledgerEntries
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .forEach(entry => {

          const row = {
            date: entry.date,
            itemName: entry.itemName,
            unit: entry.unit,                         // ✅
            source: entry.documentReference,
            quantity: entry.itemsValue
          };

          entry.storeType === 0
            ? consumer.push(row)
            : durable.push(row);
        });

      this.consumerEntries.set(consumer);
      this.durableEntries.set(durable);
    });
  }
}
