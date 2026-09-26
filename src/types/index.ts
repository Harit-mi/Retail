// DukaanPOS Core Type Definitions

export interface Product {
  id: string;
  name: string;
  retailPrice: number;
  wholesalePrice?: number;
  stock: number | null;
  minStockWarning?: number;
  unit: string;
  category: string;
  hsn?: string;
  gst: number;
  barcode?: string;
  vertical?: string;
}

export interface CartItem extends Product {
  qty: number;
  total: number;
  discount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  loyaltyPoints?: number;
  address?: string;
  gstNo?: string;
}

export interface TaxDetails {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalTax: number;
}

export interface SaleTransaction {
  id: string;
  timestamp: number;
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxDetails: TaxDetails;
  grandTotal: number;
  paymentMode: 'cash' | 'upi' | 'card' | 'khata';
}

export interface StoreConfig {
  name: string;
  address: string;
  phone: string;
  gstNo: string;
  currency: string;
  pin: string;
}

export interface ShiftAudit {
  openingCash: number;
  shiftCashSales: number;
  cashDrops: number;
  expectedTotal: number;
  timestamp: number;
}

export interface StoreContextType {
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  sales: SaleTransaction[];
  storeConfig: StoreConfig;
  currentLanguage: string;
  activeTab: string;
  isCounterLocked: boolean;
  
  // Handlers
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  completeSale: (sale: SaleTransaction) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomerBalance: (customerId: string, amount: number) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateStoreConfig: (config: Partial<StoreConfig>) => void;
  lockCounter: () => void;
  unlockCounter: (pin: string) => boolean;
  changeLanguage: (lang: string) => void;
  setActiveTab: (tab: string) => void;
}
