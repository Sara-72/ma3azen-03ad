import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'https://newwinventoryapi.runasp.net/api';

  constructor(private http: HttpClient) {}

  // ===== LOGIN =====
adminLogin(data: any) {
  return this.http.post(`${this.api}/Auth/admin/login`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
}

employeeLogin(data: any) {
  return this.http.post(`${this.api}/Auth/employee/login`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
}

storeKeeperLogin(data: any) {
  return this.http.post(`${this.api}/Auth/store-keeper/login`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
}

inventoryManagerLogin(data: any) {
  return this.http.post(`${this.api}/Auth/inventory-manager/login`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
}


 userLogin(data: any) {
  return this.http.post(`${this.api}/Auth/user/login`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
}


  // ===== ADMIN CREATE =====
  addUser(data: any) {
    return this.http.post(`${this.api}/Users`, data);
  }

  addEmployee(data: any) {
    return this.http.post(`${this.api}/Employees`, data);
  }

  addStoreKeeper(data: any) {
    return this.http.post(`${this.api}/StoreKeepers`, data);
  }

  addInventoryManager(data: any) {
    return this.http.post(`${this.api}/InventoryManagers`, data);
  }
  checkEmailExists(email: string, role: string) {
    let url = '';
    switch (role) {
     case 'موظف':
      url = `${this.api}/Users?email=${email}`;
      break;
     case 'موظف مخزن':
      url = `${this.api}/Employees?email=${email}`;
      break;
     case 'أمين مخزن':
      url = `${this.api}/StoreKeepers?email=${email}`;
      break;
     case 'مدير مخزن':
      url = `${this.api}/InventoryManagers?email=${email}`;
      break;
     }
    return this.http.get(url); // يفترض السيرفر يرجع [] لو مش موجود أو object لو موجود
  }
  loginByRole(role: string, data: { email: string; password: string }) {
  switch (role) {
    case 'ADMIN':
      return this.adminLogin(data);

    case 'EMPLOYEE':
      return this.employeeLogin(data);

    case 'STORE_KEEPER':
      return this.storeKeeperLogin(data);

    case 'INVENTORY_MANAGER':
      return this.inventoryManagerLogin(data);

    default:
      return this.userLogin(data);
  }
}


}
