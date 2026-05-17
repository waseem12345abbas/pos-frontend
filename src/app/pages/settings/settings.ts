import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MedicineService } from '../../services/medicine.service';
import { ThemeService, Theme } from '../../services/theme.service';
import { Medicine } from '../../models/medicine';
import { MedicineDto } from '../../models/medicine';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  medicines: Medicine[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];
  loading = true;

  // Edit modal
  isEditOpen = false;
  editMedicine: MedicineDto | null = null;
  editingId = 0;
  saving = false;

  unitTypes = [
    { id: 0, label: 'Item' },
    { id: 1, label: 'Strip' },
    { id: 2, label: 'Box' },
    { id: 3, label: 'Dozen' }
  ];

  categoryOptions = [
    'Analgesic', 'Antibiotic', 'Antifungal', 'Antihistamine', 'Antiviral',
    'Cardiovascular', 'Dermatology', 'Diabetes', 'Digestive', 'ENT',
    'Eye Care', 'Neurological', 'Nutritional Supplement', 'Respiratory',
    'Urology', 'Vitamins', 'Other'
  ];

  private searchSubject = new Subject<string>();

  constructor(
    private medicineService: MedicineService,
    public themeService: ThemeService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.medicineService.search(term, this.selectedCategory))
    ).subscribe(data => { this.medicines = data; this.loading = false; });
  }

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.loading = true;
    this.medicineService.getAll().subscribe(list => {
      this.medicines = list;
      this.categories = [...new Set(list.map(m => m.category).filter(Boolean) as string[])].sort();
      this.loading = false;
    });
  }

  filter(): void {
    if (!this.searchTerm && !this.selectedCategory) { this.loadMedicines(); return; }
    this.loading = true;
    this.searchSubject.next(this.searchTerm);
  }

  // ── Edit ──────────────────────────────────────────────────────────────────

  openEdit(medicine: Medicine): void {
    this.editingId = medicine.id;
    this.editMedicine = {
      name: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      description: medicine.description,
      barcode: medicine.barcode,
      purchasePrice: medicine.purchasePrice,
      sellingPrice: medicine.sellingPrice,
      unitType: medicine.unitTypeId,
      piecesPerUnit: medicine.piecesPerUnit,
      quantityInUnits: medicine.quantityInUnits,
      minStockLevel: medicine.minStockLevel,
      expireDate: medicine.expireDate?.substring(0, 10)
    };
    this.isEditOpen = true;
  }

  closeEdit(): void {
    this.isEditOpen = false;
    this.editMedicine = null;
    this.editingId = 0;
  }

  saveEdit(): void {
    if (!this.editMedicine) return;
    this.saving = true;
    this.medicineService.updateMedicine(this.editingId, this.editMedicine).subscribe({
      next: () => {
        this.saving = false;
        this.closeEdit();
        Swal.fire({ title: 'Updated!', text: 'Medicine updated successfully.', icon: 'success', timer: 1800, showConfirmButton: false });
        this.loadMedicines();
      },
      error: (err) => {
        this.saving = false;
        Swal.fire('Error', err?.error?.message || 'Failed to update.', 'error');
      }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteMedicine(medicine: Medicine): void {
    Swal.fire({
      title: `Delete "${medicine.name}"?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.medicineService.deleteMedicine(medicine.id).subscribe({
          next: () => {
            this.medicines = this.medicines.filter(m => m.id !== medicine.id);
            Swal.fire({ title: 'Deleted', icon: 'success', timer: 1500, showConfirmButton: false });
          },
          error: () => Swal.fire('Error', 'Failed to delete. It may have existing sales records.', 'error')
        });
      }
    });
  }

  // ── Theme ─────────────────────────────────────────────────────────────────

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  get currentTheme(): Theme {
    return this.themeService.getTheme();
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
