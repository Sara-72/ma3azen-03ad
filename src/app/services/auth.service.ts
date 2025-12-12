import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private baseUrl = "http://newinventoryapi.runasp.net/api/Auth";

    constructor(private http: HttpClient) { }

    login(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/admin/login`, data);
    }
}

