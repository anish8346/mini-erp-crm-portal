export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export type StockMovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  customerType: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followUps: number;
    challans: number;
  };
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouse?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stockMovements: number;
    challanItems: number;
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: StockMovementType;
  reason?: string | null;
  createdBy: string;
  createdAt: string;
  product?: {
    id: string;
    productName: string;
    sku: string;
    category?: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
    role?: Role;
  };
}

export interface ChallanItem {
  id: string;
  challanId?: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalPrice: number;
  product?: {
    id: string;
    productName: string;
    sku: string;
    currentStock: number;
  };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  creator?: User;
  items?: ChallanItem[];
  _count?: {
    items: number;
  };
}

export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string;
  createdBy: string;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
}
