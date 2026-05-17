export interface CartItem {
  medicineId: number;
  medicineName: string;
  sellingPrice: number;
  unitType: string;
  piecesPerUnit: number;
  availablePieces: number;
  quantityInPieces: number; // how many pieces the customer wants
  lineTotal: number;
}

export interface CreateOrderDto {
  discount: number;
  amountPaid: number;
  notes?: string;
  items: { medicineId: number; quantityInPieces: number }[];
}

export interface OrderItem {
  id: number;
  medicineId: number;
  medicineName: string;
  quantitySoldInPieces: number;
  unitPricePerPiece: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  invoiceNumber: string;
  orderDate: string;
  subTotal: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  change: number;
  status: string;
  notes?: string;
  items: OrderItem[];
}

export interface DashboardStats {
  totalMedicines: number;
  totalStockUnits: number;
  totalStockPieces: number;
  lowStockCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  todaySales: number;
  todayOrderCount: number;
  monthlySales: number;
  monthlyOrderCount: number;
  recentSales: RecentSale[];
  lowStockAlerts: LowStockAlert[];
  expiryAlerts: ExpiryAlert[];
  monthlySalesChart: MonthlySalesChart[];
}

export interface RecentSale {
  orderId: number;
  invoiceNumber: string;
  orderDate: string;
  grandTotal: number;
  itemCount: number;
}

export interface LowStockAlert {
  id: number;
  name: string;
  quantityInUnits: number;
  minStockLevel: number;
  unitType: string;
}

export interface ExpiryAlert {
  id: number;
  name: string;
  expireDate: string;
  isExpired: boolean;
}

export interface MonthlySalesChart {
  year: number;
  month: number;
  monthName: string;
  totalSales: number;
  orderCount: number;
}

export interface SalesReport {
  from: string;
  to: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalPiecesSold: number;
  orders: Order[];
  topMedicines: TopMedicine[];
}

export interface TopMedicine {
  medicineId: number;
  medicineName: string;
  totalPiecesSold: number;
  totalRevenue: number;
}
