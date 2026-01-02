import { Component ,OnInit} from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { CommonModule } from '@angular/common'; // 1. Import this
import { FormsModule } from '@angular/forms';
import { ModeerSercive } from '../../../services/modeer.service';

export type CustodyStatus = 'pending' | 'received' | 'returned';
@Component({
  selector: 'app-ameen7',
  standalone: true,
  imports: [
    HeaderComponent, FooterComponent,
    CommonModule,FormsModule

  ],
  templateUrl: './ameen7.component.html',
  styleUrl: './ameen7.component.css'
})


export class Ameen7Component implements OnInit {

  constructor(private stockService: ModeerSercive) {}


  custodyData: any[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedItem: any = null;
  tempStatus: CustodyStatus = 'pending';


  // Helper to count statuses for the summary cards
  getStatusCount(status: CustodyStatus): number {
    return this.custodyData.filter(item => item.status === status).length;
  }


  ngOnInit(): void {
    this.loadCustodyData();
  }

loadCustodyData() {
  this.custodyData = [
    { employeeName: 'أحمد محمد علي', itemName: 'لاب توب', quantity: 1, receivedDate: '2023-10-01', status: 'pending' },
    { employeeName: 'سارة إبراهيم', itemName: 'طابعة', quantity: 1, receivedDate: '2023-11-15', status: 'received' },
    { employeeName: 'خالد حسن', itemName: 'شاشة', quantity: 1, receivedDate: '2023-12-01', status: 'returned' }
  ];
}

filteredCustody() {
  if (!this.searchTerm) return this.custodyData;
  const search = this.searchTerm.toLowerCase();

  return this.custodyData.filter(item =>
    item.employeeName.toLowerCase().includes(search) ||
    item.itemName.toLowerCase().includes(search) ||
    item.status.toLowerCase().includes(search) // Now searches by status too!
  );
}

  openDetailModal(item: any) {
    // Logic for viewing item details
    console.log('Viewing details for:', item);
  }


onStatusClick(item: any) {
    this.selectedItem = item;
    this.tempStatus = item.status;
    this.showModal = true;
  }
 // Updated confirm logic to handle any change
  confirmStatus() {

    if (this.selectedItem) {
      this.selectedItem.status = this.tempStatus;
    }
    this.closeModal();
  }

closeModal() {
    this.showModal = false;
    this.selectedItem = null;
  }
}
