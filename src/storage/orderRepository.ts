import type { Order } from "../features/order/orderTypes";

export type StorageMode = "firebase" | "local";

export type OrderRepository = {
  mode: StorageMode;
  subscribe: (
    businessDate: string,
    onData: (orders: Order[]) => void,
    onError: (message: string) => void,
  ) => () => void;
  save: (order: Order) => Promise<void>;
  update: (id: string, patch: Partial<Order>) => Promise<void>;
  deleteByIds: (ids: string[]) => Promise<void>;
};
