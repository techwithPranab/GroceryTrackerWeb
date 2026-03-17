export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'superadmin';
  householdId: string | null;
  avatarInitials: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Household {
  _id: string;
  name: string;
  createdBy: User;
  members: HouseholdMember[];
  memberCount: number;
  createdAt: string;
}

export interface HouseholdMember {
  userId: User;
  role: 'admin' | 'member' | 'superadmin';
  joinedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  householdId: string;
  createdBy: Pick<User, '_id' | 'name'>;
  itemCount?: number;
}

export interface Location {
  _id: string;
  name: string;
  description: string;
  householdId: string;
  createdBy: Pick<User, '_id' | 'name'>;
  itemCount?: number;
}

export type ExpiryStatus = 'none' | 'ok' | 'warning' | 'critical' | 'expired';
export type Unit = 'pcs' | 'kg' | 'g' | 'lbs' | 'oz' | 'liters' | 'ml' | 'bottles' | 'cans' | 'boxes' | 'bags' | 'packs' | 'dozen';

export interface InventoryItem {
  _id: string;
  itemName: string;
  categoryId: Category;
  quantity: number;
  unitSize: number | null;
  unit: Unit;
  minimumThreshold: number;
  expirationDate: string | null;
  locationId: Location | null;
  householdId: string;
  createdBy: Pick<User, '_id' | 'name' | 'avatarInitials'>;
  notes: string;
  brand: string;
  isLowStock: boolean;
  totalAmount: number | null;
  expiryStatus: ExpiryStatus;
  daysUntilExpiry?: number;
  createdAt: string;
  updatedAt: string;
}

export type ShoppingItemStatus = 'pending' | 'purchased';
export type Priority = 'low' | 'medium' | 'high';

export interface ShoppingListItem {
  _id: string;
  itemName: string;
  quantityNeeded: number;
  unitSize: number | null;
  unit: string;
  categoryId: Category | null;
  householdId: string;
  status: ShoppingItemStatus;
  addedBy: Pick<User, '_id' | 'name' | 'avatarInitials'> | null;
  purchasedBy: Pick<User, '_id' | 'name' | 'avatarInitials'> | null;
  purchasedAt: string | null;
  autoAdded: boolean;
  inventoryItemId: string | null;
  notes: string;
  priority: Priority;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  userId: Pick<User, '_id' | 'name' | 'avatarInitials'>;
  householdId: string;
  action: string;
  itemId: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  totalInventory: number;
  lowStockItems: number;
  expiringItems: {
    expired: number;
    expiringIn3Days: number;
    expiringIn7Days: number;
  };
  shoppingList: {
    pending: number;
    purchased: number;
    total: number;
  };
  recentActivity: ActivityLog[];
}

export interface CategoryDistribution {
  _id: string;
  categoryName: string;
  color: string;
  count: number;
  totalQuantity: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface InventoryState {
  items: InventoryItem[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  selectedItem: InventoryItem | null;
}

export interface ShoppingListState {
  items: ShoppingListItem[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardState {
  stats: DashboardStats | null;
  categoryDistribution: CategoryDistribution[];
  topItems: Array<{ _id: string; itemName: string; quantity: number; unit: string; activityCount: number }>;
  isLoading: boolean;
  error: string | null;
}

export interface HouseholdState {
  household: Household | null;
  members: HouseholdMember[];
  isLoading: boolean;
  error: string | null;
}
