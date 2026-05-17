import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderDto, DashboardStats, Order, SalesReport } from '../models/order';
import { CartItem } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly ordersUrl = 'http://localhost:5000/api/orders';
  private readonly dashboardUrl = 'http://localhost:5000/api/dashboard';
  private readonly reportsUrl = 'http://localhost:5000/api/reports';

  // Cart shared between Inventory and Sales pages
  private cart: CartItem[] = [];

  constructor(private http: HttpClient) {}

  // ── Cart management ────────────────────────────────────────────────────────
  getCart(): CartItem[] { return this.cart; }
  setCart(items: CartItem[]): void { this.cart = items; }
  clearCart(): void { this.cart = []; }

  // ── API calls ──────────────────────────────────────────────────────────────
  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.ordersUrl, dto);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.ordersUrl}/${id}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.ordersUrl);
  }

  // Dashboard (split endpoints)
  getDashboardSalesSummary(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/sales-summary`);
  }

  getDashboardRecentSales(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/recent-sales`);
  }

  getDashboardLowStock(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/low-stock`);
  }

  getDashboardExpiryAlerts(days: number = 30): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/expiry-alerts`, {
      params: { days: days.toString() }
    });
  }

  getDashboardMonthlyChart(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/monthly-chart`);
  }

  // Backward compatible full dashboard (still works)
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.dashboardUrl}/stats`);
  }


  getSalesReport(from: string, to: string): Observable<SalesReport> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<SalesReport>(`${this.reportsUrl}/sales`, { params });
  }

  getTodayReport(): Observable<SalesReport> {
    return this.http.get<SalesReport>(`${this.reportsUrl}/today`);
  }

  getMonthlyReport(year?: number, month?: number): Observable<SalesReport> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get<SalesReport>(`${this.reportsUrl}/monthly`, { params });
  }
}
