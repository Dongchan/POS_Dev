import type { CustomerColor, Order } from "./orderTypes";

export const customerColors: Array<{ value: CustomerColor; label: string }> = [
  { value: "red", label: "빨강" },
  { value: "yellow", label: "노랑" },
  { value: "green", label: "초록" },
  { value: "blue", label: "파랑" },
  { value: "purple", label: "보라" },
];

export function formatMoney(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function getTodayBusinessDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

export function createOrderId() {
  if ("crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }

  return `order-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getNextOrderNo(orders: Order[]) {
  const maxNo = orders.reduce((max, order) => {
    const match = order.orderNo.match(/^A-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `A-${String(maxNo + 1).padStart(3, "0")}`;
}

export function elapsedLabel(createdAt: number, now = Date.now()) {
  const diffMs = Math.max(0, now - createdAt);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  return `${hours}시간 ${minutes % 60}분`;
}

export function orderTimeLabel(timestamp: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
