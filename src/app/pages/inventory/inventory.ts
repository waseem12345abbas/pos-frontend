import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MedicineService } from '../../services/medicine.service';
import { OrderService } from '../../services/order.service';
import { Medicine } from '../../models/medicine';
import { CartItem } from '../../models/order';

@Component({
  selector: 'app-inventory',
  standalone: false,
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory implements OnInit {
  medicines: Medicine[] = [];
  categories: string[] = [];
  searchTerm = '';
  selectedCategory = '';
  loading = true;
  isCartOpen = false;

  cart: CartItem[] = [];

  private searchSubject = new Subject<string>();

  constructor(
    private medicineService: MedicineService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.medicineService.search(term, this.selectedCategory))
    ).subscribe(data => this.medicines = data);
  }

  ngOnInit(): void {
    this.loadMedicines();
    // Restore cart if navigating back
    this.cart = this.orderService.getCart();
    if (this.cart.length > 0) this.isCartOpen = true;
  }

  loadMedicines(): void {
    this.loading = true;
    this.medicineService.getAll().subscribe(medicines => {
      this.medicines = medicines;
      this.categories = [...new Set(medicines.map(m => m.category).filter(Boolean) as string[])].sort();
      this.loading = false;
    });
  }

  filterMedicines(): void {
    if (!this.searchTerm && !this.selectedCategory) {
      this.loadMedicines();
      return;
    }
    if (this.selectedCategory && !this.searchTerm) {
      this.medicineService.search('', this.selectedCategory).subscribe(d => this.medicines = d);
      return;
    }
    this.searchSubject.next(this.searchTerm);
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  addToCart(medicine: Medicine): void {
    if (medicine.totalPiecesInStock === 0) return;
    const existing = this.cart.find(i => i.medicineId === medicine.id);
    if (existing) {
      if (existing.quantityInPieces < medicine.totalPiecesInStock) {
        existing.quantityInPieces++;
        existing.lineTotal = existing.quantityInPieces * existing.sellingPrice;
      }
    } else {
      this.cart.push({
        medicineId: medicine.id,
        medicineName: medicine.name,
        sellingPrice: medicine.sellingPrice,
        unitType: medicine.unitType,
        piecesPerUnit: medicine.piecesPerUnit,
        availablePieces: medicine.totalPiecesInStock,
        quantityInPieces: 1,
        lineTotal: medicine.sellingPrice
      });
    }
    this.isCartOpen = true;
    this.saveCart();
  }

  increment(medicineId: number): void {
    const item = this.cart.find(i => i.medicineId === medicineId);
    if (item && item.quantityInPieces < item.availablePieces) {
      item.quantityInPieces++;
      item.lineTotal = item.quantityInPieces * item.sellingPrice;
      this.saveCart();
    }
  }

  decrement(medicineId: number): void {
    const item = this.cart.find(i => i.medicineId === medicineId);
    if (!item) return;
    if (item.quantityInPieces > 1) {
      item.quantityInPieces--;
      item.lineTotal = item.quantityInPieces * item.sellingPrice;
    } else {
      this.removeItem(medicineId);
    }
    this.saveCart();
  }

  removeItem(medicineId: number): void {
    this.cart = this.cart.filter(i => i.medicineId !== medicineId);
    if (this.cart.length === 0) this.isCartOpen = false;
    this.saveCart();
  }

  clearCart(): void {
    this.cart = [];
    this.isCartOpen = false;
    this.saveCart();
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, i) => sum + i.lineTotal, 0);
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, i) => sum + i.quantityInPieces, 0);
  }

  goToSales(): void {
    this.saveCart();
    this.router.navigate(['/sales']);
  }

  private saveCart(): void {
    this.orderService.setCart(this.cart);
  }

  formatCurrency(value: number): string {
    return 'Rs ' + value.toLocaleString('en-PK', { maximumFractionDigits: 0 });
  }

  getStockClass(medicine: Medicine): string {
    if (medicine.isExpired) return 'status-expired';
    if (medicine.totalPiecesInStock === 0) return 'status-out';
    if (medicine.isLowStock) return 'status-low';
    return 'status-ok';
  }

  getStockLabel(medicine: Medicine): string {
    if (medicine.isExpired) return 'Expired';
    if (medicine.totalPiecesInStock === 0) return 'Out of Stock';
    if (medicine.isLowStock) return 'Low';
    return 'In Stock';
  }
}
