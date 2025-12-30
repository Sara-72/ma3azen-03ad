import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CentralStoreResponse {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  storeType: string;
  unit: string;
  storeKeeperSignature: string;
}

@Injectable({
  providedIn: 'root'
})
export class CentralStoreService {

  private apiUrl = 'https://newwinventoryapi.runasp.net/api/CentralStore';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CentralStoreResponse[]> {
    return this.http.get<CentralStoreResponse[]>(this.apiUrl);
  }

  add(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
