import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine';
import { CartItem, CreateOrderDto, Order } from '../../models/order';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sales',
  standalone: false,
  templateUrl: './sales.html',
  styleUrl: './sales.css'
})
export class Sales implements OnInit {
  // Cart (loaded from service — may come from Inventory page)
  cart: CartItem[] = [];

  // Medicine search panel
  allMedicines: Medicine[] = [];
  searchTerm = '';
  filteredMedicines: Medicine[] = [];

  // Checkout
  discount = 0;
  amountPaid = 0;
  notes = '';
  submitting = false;

  // Completed invoice (shown after order)
  completedOrder: Order | null = null;
  showInvoice = false;

  constructor(
    private orderService: OrderService,
    private medicineService: MedicineService
  ) {}

  ngOnInit(): void {
    // Load cart from service (shared from Inventory)
    this.cart = this.orderService.getCart();
    // Load medicines for the search panel
    this.medicineService.getAll().subscribe(m => {
      this.allMedicines = m;
      this.filteredMedicines = m;
    });
  }

  // ── Medicine search panel ─────────────────────────────────────────────────

  filterMedicines(): void {
    const t = this.searchTerm.toLowerCase();
    this.filteredMedicines = t
      ? this.allMedicines.filter(m =>
          m.name.toLowerCase().includes(t) ||
          (m.genericName?.toLowerCase().includes(t)) ||
          (m.barcode?.includes(this.searchTerm)))
      : this.allMedicines;
  }

  addToCart(medicine: Medicine): void {
    if (medicine.totalPiecesInStock === 0 || medicine.isExpired) return;
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
    this.saveCart();
  }

  // ── Cart operations ───────────────────────────────────────────────────────

  increment(id: number): void {
    const item = this.cart.find(i => i.medicineId === id);
    if (item && item.quantityInPieces < item.availablePieces) {
      item.quantityInPieces++;
      item.lineTotal = item.quantityInPieces * item.sellingPrice;
      this.saveCart();
    }
  }

  decrement(id: number): void {
    const item = this.cart.find(i => i.medicineId === id);
    if (!item) return;
    if (item.quantityInPieces > 1) {
      item.quantityInPieces--;
      item.lineTotal = item.quantityInPieces * item.sellingPrice;
    } else {
      this.cart = this.cart.filter(i => i.medicineId !== id);
    }
    this.saveCart();
  }

  removeItem(id: number): void {
    this.cart = this.cart.filter(i => i.medicineId !== id);
    this.saveCart();
  }

  clearCart(): void {
    this.cart = [];
    this.saveCart();
    this.amountPaid = 0;
    this.discount = 0;
    this.notes = '';
  }

  private saveCart(): void {
    this.orderService.setCart(this.cart);
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  get subTotal(): number {
    return this.cart.reduce((s, i) => s + i.lineTotal, 0);
  }

  get grandTotal(): number {
    return Math.max(0, this.subTotal - (this.discount || 0));
  }

  get change(): number {
    return Math.max(0, (this.amountPaid || 0) - this.grandTotal);
  }

  get isPaymentValid(): boolean {
    return this.amountPaid >= this.grandTotal && this.grandTotal > 0;
  }

  // ── Checkout ──────────────────────────────────────────────────────────────

  confirmOrder(): void {
    if (this.cart.length === 0) {
      Swal.fire('Empty Cart', 'Please add at least one medicine to the cart.', 'warning');
      return;
    }
    if (!this.isPaymentValid) {
      Swal.fire('Insufficient Payment', `Amount paid (Rs ${this.amountPaid}) is less than grand total (Rs ${this.grandTotal}).`, 'error');
      return;
    }

    const dto: CreateOrderDto = {
      discount: this.discount || 0,
      amountPaid: this.amountPaid,
      notes: this.notes || undefined,
      items: this.cart.map(i => ({
        medicineId: i.medicineId,
        quantityInPieces: i.quantityInPieces
      }))
    };

    this.submitting = true;
    this.orderService.createOrder(dto).subscribe({
      next: (order) => {
        this.submitting = false;
        this.completedOrder = order;
        this.showInvoice = true;
        this.orderService.clearCart();
        this.cart = [];
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message || 'Failed to place order. Please try again.';
        Swal.fire({ title: 'Order Failed', text: msg, icon: 'error' });
      }
    });
  }

  // ── Invoice ───────────────────────────────────────────────────────────────

  newOrder(): void {
    this.completedOrder = null;
    this.showInvoice = false;
    this.discount = 0;
    this.amountPaid = 0;
    this.notes = '';
    // Reload medicine stock after sale
    this.medicineService.getAll().subscribe(m => {
      this.allMedicines = m;
      this.filteredMedicines = m;
    });
  }

  printInvoice(): void {
    window.print();
  }

  formatCurrency(value: number): string {
    return 'Rs ' + (value || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
