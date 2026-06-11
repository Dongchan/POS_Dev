import type { Order } from "../features/order/orderTypes";
import type { OrderRepository } from "./orderRepository";

const STORAGE_KEY = "pocha-pos:orders:v1";

function readOrders(): Order[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function createLocalOrderRepository(): OrderRepository {
  const listeners = new Set<() => void>();
  const channel = "BroadcastChannel" in window ? new BroadcastChannel("pocha-pos-orders") : null;

  const emit = () => {
    listeners.forEach((listener) => listener());
    channel?.postMessage("changed");
  };

  channel?.addEventListener("message", () => {
    listeners.forEach((listener) => listener());
  });

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      listeners.forEach((listener) => listener());
    }
  });

  return {
    mode: "local",
    subscribe(businessDate, onData) {
      const publish = () => {
        const orders = readOrders()
          .filter((order) => order.businessDate === businessDate)
          .sort((a, b) => a.createdAt - b.createdAt);
        onData(orders);
      };

      publish();
      listeners.add(publish);
      return () => listeners.delete(publish);
    },
    async save(order) {
      writeOrders([...readOrders(), order]);
      emit();
    },
    async update(id, patch) {
      const orders = readOrders().map((order) => (order.id === id ? { ...order, ...patch } : order));
      writeOrders(orders);
      emit();
    },
    async deleteByIds(ids) {
      const idSet = new Set(ids);
      writeOrders(readOrders().filter((order) => !idSet.has(order.id)));
      emit();
    },
  };
}
