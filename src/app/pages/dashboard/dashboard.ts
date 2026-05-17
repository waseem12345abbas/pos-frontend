import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { DashboardStats } from '../../models/order';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';
    this.stats = {
      totalMedicines: 0,
      totalStockUnits: 0,
      totalStockPieces: 0,
      lowStockCount: 0,
      expiredCount: 0,
      expiringSoonCount: 0,
      todaySales: 0,
      todayOrderCount: 0,
      monthlySales: 0,
      monthlyOrderCount: 0,
      recentSales: [],
      lowStockAlerts: [],
      expiryAlerts: [],
      monthlySalesChart: []
    };

    // Load full stats in one request (backend: /api/dashboard/stats)
    this.orderService.getDashboardStats().subscribe({
      next: (data: any) => {
        if (!this.stats) return;

        // Backend DashboardStatsDto uses PascalCase; Angular model expects camelCase.
        const normalized = {
          totalMedicines: data?.totalMedicines ?? data?.TotalMedicines ?? 0,
          totalStockUnits: data?.totalStockUnits ?? data?.TotalStockUnits ?? 0,
          totalStockPieces: data?.totalStockPieces ?? data?.TotalStockPieces ?? 0,

          lowStockCount: data?.lowStockCount ?? data?.LowStockCount ?? 0,
          expiredCount: data?.expiredCount ?? data?.ExpiredCount ?? 0,
          expiringSoonCount: data?.expiringSoonCount ?? data?.ExpiringSoonCount ?? 0,

          todaySales: data?.todaySales ?? data?.TodaySales ?? 0,
          todayOrderCount: data?.todayOrderCount ?? data?.TodayOrderCount ?? 0,
          monthlySales: data?.monthlySales ?? data?.MonthlySales ?? 0,
          monthlyOrderCount: data?.monthlyOrderCount ?? data?.MonthlyOrderCount ?? 0,

          recentSales: data?.recentSales ?? data?.RecentSales ?? [],
          lowStockAlerts: data?.lowStockAlerts ?? data?.LowStockAlerts ?? [],
          expiryAlerts: data?.expiryAlerts ?? data?.ExpiryAlerts ?? [],
          monthlySalesChart: data?.monthlySalesChart ?? data?.MonthlySalesChart ?? []
        };
        this.stats = normalized;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }



  getBarHeight(value: number): string {
    if (!this.stats?.monthlySalesChart?.length) return '0%';
    const max = Math.max(...this.stats.monthlySalesChart.map(m => m.totalSales));
    if (max === 0) return '4px';
    return `${Math.max(4, (value / max) * 100)}%`;
  }

  formatCurrency(value: number): string {
    return 'Rs ' + value.toLocaleString('en-PK', { maximumFractionDigits: 0 });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  daysUntilExpiry(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
