import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { SalesReport, TopMedicine } from '../../models/order';

type ReportType = 'today' | 'monthly' | 'custom';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit {
  reportType: ReportType = 'today';
  report: SalesReport | null = null;
  loading = false;
  error = '';

  // Custom range
  fromDate = '';
  toDate = '';

  // Monthly selector
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.error = '';
    this.report = null;

    const obs = this.reportType === 'today'
      ? this.orderService.getTodayReport()
      : this.reportType === 'monthly'
        ? this.orderService.getMonthlyReport(this.selectedYear, this.selectedMonth)
        : this.orderService.getSalesReport(this.fromDate, this.toDate + 'T23:59:59');
    console.log("TTTTTTTTt = ", obs)
    obs.subscribe({
      next: (r) => {
        console.log('Reports(today) response:', r);
        this.report = r;
        this.loading = false;
      },
      error: (err) => {
        console.error('Reports(today) error:', err);
        this.error = 'Failed to load report.';
        this.loading = false;
      },
      complete: () => {
        console.log('Reports(today) request complete');
        // keep loading=false set in next/error, but ensure it here too
        this.loading = false;
      }
    });
  }

  printReport(): void {
    window.print();
  }

  getMaxRevenue(): number {
    if (!this.report?.topMedicines?.length) return 1;
    return Math.max(...this.report.topMedicines.map(m => m.totalRevenue));
  }

  barWidth(revenue: number): string {
    const pct = (revenue / this.getMaxRevenue()) * 100;
    return `${Math.max(2, pct)}%`;
  }

  formatCurrency(v: number): string {
    return 'Rs ' + (v || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(d: string): string {
    return new Date(d).toLocaleString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  get reportTitle(): string {
    if (this.reportType === 'today') return "Today's Report";
    if (this.reportType === 'monthly') return `${this.months[this.selectedMonth - 1]} ${this.selectedYear} Report`;
    return 'Custom Range Report';
  }
}
