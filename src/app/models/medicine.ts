export type UnitType = 'Item' | 'Strip' | 'Box' | 'Dozen';

export interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  description?: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  unitType: UnitType;
  unitTypeId: number;
  piecesPerUnit: number;
  quantityInUnits: number;
  totalPiecesInStock: number;
  minStockLevel: number;
  isLowStock: boolean;
  isExpiringSoon: boolean;
  isExpired: boolean;
  expireDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicineDto {
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  description?: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  unitType: number; // 0=Item, 1=Strip, 2=Box, 3=Dozen
  piecesPerUnit: number;
  quantityInUnits: number;
  minStockLevel: number;
  expireDate: string;
}
