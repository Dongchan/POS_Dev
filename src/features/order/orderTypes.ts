export type MenuCategory = "food" | "drink";
export type PaymentMethod = "card" | "cash" | "unpaid";
export type PaymentStatus = "paid" | "unpaid";
export type OrderStatus = "open" | "served" | "cancelled";
export type CustomerColor = "red" | "yellow" | "green" | "blue" | "purple";

export type MenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  option: string;
  price: number;
  note?: string;
  sortOrder: number;
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  option: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  note?: string;
};

export type Order = {
  id: string;
  businessDate: string;
  orderNo: string;
  customerMemo: string;
  customerColor: CustomerColor;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  isTest: boolean;
  createdAt: number;
  updatedAt: number;
  servedAt?: number;
  cancelledAt?: number;
};
