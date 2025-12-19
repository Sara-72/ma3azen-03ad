import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class SpendNoteService {
  private apiUrl = 'http://newwinventoryapi.runasp.net/api/SpendNotes';

  constructor(private http: HttpClient) {}

  update(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
