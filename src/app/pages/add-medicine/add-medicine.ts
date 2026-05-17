import { Component } from '@angular/core';
import { MedicineService } from '../../services/medicine.service';
import { MedicineDto } from '../../models/medicine';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-medicine',
  standalone: false,
  templateUrl: './add-medicine.html',
  styleUrl: './add-medicine.css'
})
export class AddMedicine {
  submitting = false;

  unitTypes = [
    { id: 0, label: 'Item', description: 'Single unit: tablet, capsule, bottle...' },
    { id: 1, label: 'Strip', description: 'e.g. 1 strip = 10 tablets' },
    { id: 2, label: 'Box', description: 'e.g. 1 box = 10 strips = 100 pcs' },
    { id: 3, label: 'Dozen', description: 'e.g. 1 dozen = 12 items' }
  ];

  categories = [
    'Analgesic', 'Antibiotic', 'Antifungal', 'Antihistamine', 'Antiviral',
    'Cardiovascular', 'Dermatology', 'Diabetes', 'Digestive', 'ENT',
    'Eye Care', 'Neurological', 'Nutritional Supplement', 'Respiratory',
    'Urology', 'Vitamins', 'Other'
  ];

  medicine: MedicineDto = this.getEmptyDto();

  constructor(private medicineService: MedicineService) {}

  getEmptyDto(): MedicineDto {
    return {
      name: '', genericName: '', category: '', manufacturer: '',
      description: '', barcode: '',
      purchasePrice: 0, sellingPrice: 0,
      unitType: 0, piecesPerUnit: 1,
      quantityInUnits: 0, minStockLevel: 10, expireDate: ''
    };
  }

  get selectedUnitLabel(): string {
    return this.unitTypes.find(u => u.id === this.medicine.unitType)?.label || 'Item';
  }

  get showPiecesPerUnit(): boolean {
    return this.medicine.unitType !== 0; // Items are already individual
  }

  get piecesPerUnitLabel(): string {
    const labels: Record<number, string> = {
      1: 'Tablets / Pieces per Strip',
      2: 'Tablets / Pieces per Box',
      3: 'Items per Dozen'
    };
    return labels[this.medicine.unitType] || 'Pieces per Unit';
  }

  get totalPiecesPreview(): number {
    return (this.medicine.quantityInUnits || 0) * (this.medicine.piecesPerUnit || 1);
  }

  get profitMargin(): number {
    if (!this.medicine.purchasePrice || !this.medicine.sellingPrice) return 0;
    return ((this.medicine.sellingPrice - this.medicine.purchasePrice) / this.medicine.purchasePrice) * 100;
  }

  onUnitTypeChange(): void {
    const defaults: Record<number, number> = { 0: 1, 1: 10, 2: 100, 3: 12 };
    this.medicine.piecesPerUnit = defaults[this.medicine.unitType] ?? 1;
  }

  submitForm(form: any): void {
    if (form.invalid) {
      Object.values(form.controls).forEach((c: any) => c.markAsTouched());
      Swal.fire({ title: 'Validation Error', text: 'Please fill all required fields.', icon: 'error' });
      return;
    }

    if (this.medicine.sellingPrice < this.medicine.purchasePrice) {
      Swal.fire({
        title: 'Price Warning',
        text: `Selling price is less than purchase price. Are you sure?`,
        icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, save anyway'
      }).then(r => { if (r.isConfirmed) this.save(form); });
      return;
    }
    this.save(form);
  }

  private save(form: any): void {
    this.submitting = true;
    this.medicineService.addMedicine(this.medicine).subscribe({
      next: () => {
        this.submitting = false;
        Swal.fire({ title: 'Added!', text: 'Medicine added successfully.', icon: 'success', timer: 2000, showConfirmButton: false });
        this.medicine = this.getEmptyDto();
        form.resetForm();
      },
      error: (err) => {
        this.submitting = false;
        Swal.fire({ title: 'Error', text: err?.error?.message || 'Failed to add medicine.', icon: 'error' });
      }
    });
  }
}
