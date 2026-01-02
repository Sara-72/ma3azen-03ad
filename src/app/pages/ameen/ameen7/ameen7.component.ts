import { Component ,OnInit} from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { CommonModule } from '@angular/common'; // 1. Import this
import { FormsModule } from '@angular/forms';
import { ModeerSercive } from '../../../services/modeer.service';


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


  custodyData: any[] = [];
  searchTerm: string = '';

  constructor(private stockService: ModeerSercive) {}

  ngOnInit(): void {
    this.loadCustodyData();
  }

loadCustodyData() {
  // Even if the database doesn't send "status", the UI will show "تم الاستلام"
  this.custodyData = [
    {
      employeeName: 'أحمد محمد علي',
      itemName: 'جهاز كمبيوتر لاب توب',
      quantity: 1,
      receivedDate: '2023-10-01'
    },
    {
      employeeName: 'سارة إبراهيم',
      itemName: 'طابعة ليزر',
      quantity: 1,
      receivedDate: '2023-11-15'
    }
  ];
}

  filteredCustody() {
    if (!this.searchTerm) return this.custodyData;
    return this.custodyData.filter(item =>
      item.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openDetailModal(item: any) {
    // Logic for viewing item details
    console.log('Viewing details for:', item);
  }

}
