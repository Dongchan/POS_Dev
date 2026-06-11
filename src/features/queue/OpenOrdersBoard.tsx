import { useEffect, useMemo, useState } from "react";
import type { Order, OrderStatus, PaymentMethod } from "../order/orderTypes";
import { customerColors, elapsedLabel, formatMoney, orderTimeLabel } from "../order/orderUtils";

type OpenOrdersBoardProps = {
  orders: Order[];
  onUpdate: (id: string, patch: Partial<Order>) => Promise<void>;
};

const filters: Array<{ value: OrderStatus; label: string }> = [
  { value: "open", label: "미전달" },
  { value: "served", label: "전달완료" },
  { value: "cancelled", label: "취소" },
];

export function OpenOrdersBoard({ orders, onUpdate }: OpenOrdersBoardProps) {
  const [filter, setFilter] = useState<OrderStatus>("open");
  const [now, setNow] = useState(Date.now());
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const openOrders = orders.filter((order) => order.status === "open");
  const oldestOpen = openOrders[0];
  const filteredOrders = useMemo(() => {
    const visible = orders.filter((order) => order.status === filter);
    return visible.sort((a, b) => (filter === "open" ? a.createdAt - b.createdAt : b.updatedAt - a.updatedAt));
  }, [filter, orders]);

  const markServed = async (order: Order) => {
    const timestamp = Date.now();
    try {
      setActionError("");
      await onUpdate(order.id, {
        status: "served",
        updatedAt: timestamp,
        servedAt: timestamp,
      });
    } catch (error) {
      setActionError(getActionErrorMessage(error));
    }
  };

  const markPaid = async (order: Order, paymentMethod: Exclude<PaymentMethod, "unpaid">) => {
    try {
      setActionError("");
      await onUpdate(order.id, {
        paymentMethod,
        paymentStatus: "paid",
        updatedAt: Date.now(),
      });
    } catch (error) {
      setActionError(getActionErrorMessage(error));
    }
  };

  const cancelOrder = async (order: Order) => {
    if (!window.confirm(`${order.orderNo} 주문을 취소할까요?`)) return;
    const timestamp = Date.now();
    try {
      setActionError("");
      await onUpdate(order.id, {
        status: "cancelled",
        updatedAt: timestamp,
        cancelledAt: timestamp,
      });
    } catch (error) {
      setActionError(getActionErrorMessage(error));
    }
  };

  return (
    <section className="panel open-board" aria-labelledby="open-board-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">미전달 주문</p>
          <h2 id="open-board-title">{openOrders.length}건 대기</h2>
        </div>
        <div className="wait-meter">
          <span>최장 대기</span>
          <strong>{oldestOpen ? elapsedLabel(oldestOpen.createdAt, now) : "없음"}</strong>
        </div>
      </div>

      <div className="segmented" role="tablist" aria-label="주문 상태">
        {filters.map((item) => (
          <button
            key={item.value}
            className={filter === item.value ? "active" : ""}
            type="button"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {actionError ? <div className="notice danger">{actionError}</div> : null}

      <div className="order-list">
        {filteredOrders.length ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              now={now}
              onMarkServed={() => markServed(order)}
              onCancel={() => cancelOrder(order)}
              onMarkPaid={(method) => markPaid(order, method)}
            />
          ))
        ) : (
          <p className="empty-text">
            {filter === "open" ? "현재 손님에게 전달할 주문이 없습니다." : "해당 상태의 주문이 없습니다."}
          </p>
        )}
      </div>
    </section>
  );
}

function getActionErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = rawMessage.toLowerCase();

  if (lowerMessage.includes("permission") || lowerMessage.includes("insufficient")) {
    return "상태 변경 권한이 없습니다. Firebase Firestore Rules를 확인하세요.";
  }

  return `상태 변경에 실패했습니다: ${rawMessage}`;
}

type OrderCardProps = {
  order: Order;
  now: number;
  onMarkServed: () => void;
  onCancel: () => void;
  onMarkPaid: (method: Exclude<PaymentMethod, "unpaid">) => void;
};

function OrderCard({ order, now, onMarkServed, onCancel, onMarkPaid }: OrderCardProps) {
  const colorLabel = customerColors.find((color) => color.value === order.customerColor)?.label ?? "";

  return (
    <article className={`order-card ${order.status}`}>
      <header>
        <div className="order-identity">
          <span className={`color-chip ${order.customerColor}`} />
          <div>
            <strong>{order.orderNo}</strong>
            <span>{order.customerMemo || "메모 없음"}</span>
          </div>
        </div>
        <div className="order-time">
          <strong>{elapsedLabel(order.createdAt, now)}</strong>
          <span>{orderTimeLabel(order.createdAt)}</span>
        </div>
      </header>

      <div className="order-items">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.menuItemId}`}>
            <span>
              {item.name} {item.option !== "기본" ? item.option : ""}
            </span>
            <b>{item.quantity}</b>
          </div>
        ))}
      </div>

      <footer>
        <div>
          <span>{colorLabel} 태그</span>
          <strong>{formatMoney(order.totalAmount)}</strong>
          <em className={order.paymentStatus === "paid" ? "paid" : "unpaid"}>
            {order.paymentStatus === "paid" ? `${order.paymentMethod === "card" ? "카드" : "현금"} 완료` : "미결제"}
          </em>
          {order.isTest ? <em className="test-order">테스트</em> : null}
        </div>

        {order.status === "open" ? (
          <div className="card-actions">
            {order.paymentStatus === "unpaid" ? (
              <>
                <button type="button" onClick={() => onMarkPaid("card")}>
                  카드 완료
                </button>
                <button type="button" onClick={() => onMarkPaid("cash")}>
                  현금 완료
                </button>
              </>
            ) : null}
            <button className="success" type="button" onClick={onMarkServed}>
              전달 완료
            </button>
            <button className="danger" type="button" onClick={onCancel}>
              취소
            </button>
          </div>
        ) : null}
      </footer>
    </article>
  );
}
