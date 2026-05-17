import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicine, MedicineDto } from '../models/medicine';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private readonly apiUrl = 'http://localhost:5000/api/medicines';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.apiUrl);
  }

  getById(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
  }

  search(searchTerm: string, category: string): Observable<Medicine[]> {
    let params = new HttpParams();
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (category) params = params.set('category', category);
    return this.http.get<Medicine[]>(`${this.apiUrl}/search`, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getLowStock(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(`${this.apiUrl}/low-stock`);
  }

  getExpiringSoon(days = 30): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(`${this.apiUrl}/expiring-soon?days=${days}`);
  }

  addMedicine(dto: MedicineDto): Observable<Medicine> {
    return this.http.post<Medicine>(this.apiUrl, dto);
  }

  updateMedicine(id: number, dto: MedicineDto): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/${id}`, dto);
  }

  deleteMedicine(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
