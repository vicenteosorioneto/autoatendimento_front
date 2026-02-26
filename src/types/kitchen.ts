export interface KitchenOrder {
  orderId: string;
  tableNumber: number;
  createdAt: string;
  status: 'PENDING' | 'PREPARING' | 'READY';
  items: {
    name: string;
    quantity: number;
  }[];
}
