import { Component, OnInit } from '@angular/core';
import { ModeerSercive } from '../../../services/modeer.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../../../components/footer/footer.component";
import { HeaderComponent } from "../../../components/header/header.component";

@Component({
  selector: 'app-modeer3',
  templateUrl: './modeer3.component.html',
  styleUrls: ['./modeer3.component.css'],
  imports: [CommonModule, FooterComponent, HeaderComponent]
})
export class Modeer3Component implements OnInit {
userName: string = '';
  displayName: string = '';

  spendNotes: any[] = [];
  groupedNotes: any[] = [];

  constructor(private modeerService: ModeerSercive) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('name') || '';
    this.displayName = this.getFirstTwoNames(this.userName);
    this.loadNotes();
  }
  getFirstTwoNames(fullName: string): string {
    if (!fullName) return '';
    return fullName.trim().split(/\s+/).slice(0, 2).join(' ');
  }

  loadNotes(): void {
    this.modeerService.getSpendNotes().subscribe({
      next: (data) => {
        this.spendNotes = data.filter(n => n.permissinStatus === 'قيد المراجعة');

        this.groupedNotes = this.groupNotes(this.spendNotes);
      },
      error: (err) => console.error('Load SpendNotes Error', err)
    });
  }

  groupNotes(notes: any[]): any[] {
    const map = new Map<string, any>();

    notes.forEach(note => {
      const dateStr = new Date(note.requestDate).toDateString();
      const key = `${dateStr}-${note.category || ''}-${note.userSignature || ''}`;

      if (!map.has(key)) {
        map.set(key, {
          id: note.id,
          requestDate: note.requestDate,
          category: note.category,
          userSignature: note.userSignature,
          college: note.college,
          collageKeeper: note.collageKeeper,
          permissinStatus: note.permissinStatus,
          showButtons: true,
          currentStatus: '',
          items: [{ itemName: note.itemName, quantity: note.quantity }]
        });
      } else {
        map.get(key).items.push({ itemName: note.itemName, quantity: note.quantity });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }

// 1. تحديث دالة changeStatus
changeStatus(note: any, decision: 'مقبول' | 'مرفوض'): void {
  note.showButtons = false;

  // تخزين القرار لاتخاذ الإجراء المناسب عند التأكيد
  note.decision = decision;

  // النص الذي يظهر للمستخدم في الواجهة
  note.currentStatus = decision === 'مقبول' ? 'هل تريد قبول الطلب ؟' : 'هل تريد رفض الطلب ؟';
}

// 2. تحديث دالة confirmNote
confirmNote(note: any): void {
  const finalStatus = note.decision === 'مقبول' ? 'الطلب مقبول' : 'الطلب مرفوض';
  const matchedNotes = this.spendNotes.filter(n =>
    n.category === note.category &&
    n.userSignature === note.userSignature &&
    new Date(n.requestDate).toDateString() === new Date(note.requestDate).toDateString() &&
    n.college === note.college
  );

 let updatedCount = 0;
  matchedNotes.forEach(n => {
    const updatedNote = { ...n, permissinStatus: finalStatus };
    this.modeerService.updateSpendNoteStatus(n.id, updatedNote).subscribe({
      next: () => {
        updatedCount++;
        // If all items in this group are updated, show the modal
        if (updatedCount === matchedNotes.length) {
          this.statusType = 'success';
          this.statusMessage = `✅ تم قبول الطلب بنجاح`;
        }
      },
      error: err => {
        console.error('Update Error', err);
        this.statusType = 'error';
        this.statusMessage = '❌ حدث خطأ أثناء تحديث حالة الطلب';
      }
    });
  });

  this.groupedNotes = this.groupedNotes.filter(n => n !== note);
}
  cancelChange(note: any): void {
    note.showButtons = true;
    note.currentStatus = '';
    note.pendingStatus = '';
  }


  // 1. Add these properties to the class
statusMessage: string | null = null;
statusType: 'success' | 'error' | null = null;

// 2. Add the close method
closeStatusMessage(): void {
  this.statusMessage = null;
  this.statusType = null;
}

}
