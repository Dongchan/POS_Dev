import { useMemo, useState } from "react";
import { menuItems } from "../menu/menuData";
import type { CustomerColor, MenuCategory, MenuItem, Order, OrderItem, PaymentMethod } from "./orderTypes";
import { createOrderId, customerColors, formatMoney, getNextOrderNo } from "./orderUtils";

type CartLine = {
  item: MenuItem;
  quantity: number;
};

type OrderEntryProps = {
  businessDate: string;
  orders: Order[];
  isTestMode: boolean;
  isClosed: boolean;
  storageError: string;
  onSave: (order: Order) => Promise<void>;
};

const paymentOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: "card", label: "카드 완료" },
  { value: "cash", label: "현금 완료" },
  { value: "unpaid", label: "미결제" },
];

export function OrderEntry({ businessDate, orders, isTestMode, isClosed, storageError, onSave }: OrderEntryProps) {
  const [category, setCategory] = useState<MenuCategory>("food");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerMemo, setCustomerMemo] = useState("");
  const [customerColor, setCustomerColor] = useState<CustomerColor>("yellow");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredMenu = useMemo(
    () => menuItems.filter((item) => item.category === category).sort((a, b) => a.sortOrder - b.sortOrder),
    [category],
  );

  const totalAmount = cart.reduce((total, line) => total + line.item.price * line.quantity, 0);
  const nextOrderNo = getNextOrderNo(orders);

  const addItem = (item: MenuItem) => {
    setSaveError("");
    setSuccessMessage("");
    setCart((current) => {
      const existing = current.find((line) => line.item.id === item.id);
      if (existing) {
        return current.map((line) => (line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [...current, { item, quantity: 1 }];
    });
  };

  const changeQuantity = (itemId: string, delta: number) => {
    setCart((current) =>
      current
        .map((line) => (line.item.id === itemId ? { ...line, quantity: line.quantity + delta } : line))
        .filter((line) => line.quantity > 0),
    );
  };

  const submitOrder = async () => {
    if (!cart.length || isSaving || isClosed) return;
    setSaveError("");
    setSuccessMessage("");

    const now = Date.now();
    const items: OrderItem[] = cart.map(({ item, quantity }) => ({
      menuItemId: item.id,
      name: item.name,
      option: item.option,
      unitPrice: item.price,
      quantity,
      subtotal: item.price * quantity,
      ...(item.note ? { note: item.note } : {}),
    }));

    const order: Order = {
      id: createOrderId(),
      businessDate,
      orderNo: nextOrderNo,
      customerMemo: customerMemo.trim(),
      customerColor,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "unpaid" ? "unpaid" : "paid",
      status: "open",
      isTest: isTestMode,
      createdAt: now,
      updatedAt: now,
    };

    setIsSaving(true);
    try {
      await onSave(order);
      setCart([]);
      setCustomerMemo("");
      setPaymentMethod("card");
      setSuccessMessage(`${order.orderNo} 주문이 등록되었습니다.`);
    } catch (error) {
      setSaveError(getSaveErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="panel order-entry" aria-labelledby="order-entry-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">다음 주문번호</p>
          <h2 id="order-entry-title">{nextOrderNo}</h2>
        </div>
        {isTestMode ? <span className="status-pill warning">테스트</span> : null}
      </div>

      {isClosed ? (
        <div className="notice danger">오늘 영업이 마감되었습니다. 설정에서 영업을 재개하면 주문을 받을 수 있습니다.</div>
      ) : null}
      {storageError ? <div className="notice danger">Firebase 연결 오류: {storageError}</div> : null}
      {saveError ? <div className="notice danger">{saveError}</div> : null}
      {successMessage ? <div className="notice success">{successMessage}</div> : null}

      <div className="segmented" role="tablist" aria-label="메뉴 카테고리">
        <button className={category === "food" ? "active" : ""} type="button" onClick={() => setCategory("food")}>
          안주/요리
        </button>
        <button className={category === "drink" ? "active" : ""} type="button" onClick={() => setCategory("drink")}>
          주류/음료
        </button>
      </div>

      <div className="menu-grid">
        {filteredMenu.map((item) => (
          <button key={item.id} className="menu-button" type="button" onClick={() => addItem(item)}>
            <span className="menu-name">{item.name}</span>
            <span className="menu-meta">
              {item.option} · {formatMoney(item.price)}
            </span>
            {item.note ? <small>{item.note}</small> : null}
          </button>
        ))}
      </div>

      <div className="cart-area">
        <div className="cart-heading">
          <h3>현재 주문</h3>
          <strong>{formatMoney(totalAmount)}</strong>
        </div>

        {cart.length ? (
          <div className="cart-list">
            {cart.map(({ item, quantity }) => (
              <div className="cart-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.option}</span>
                </div>
                <div className="stepper" aria-label={`${item.name} 수량`}>
                  <button type="button" onClick={() => changeQuantity(item.id, -1)}>
                    -
                  </button>
                  <b>{quantity}</b>
                  <button type="button" onClick={() => changeQuantity(item.id, 1)}>
                    +
                  </button>
                </div>
                <strong>{formatMoney(item.price * quantity)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">메뉴를 누르면 여기에 주문이 쌓입니다.</p>
        )}
      </div>

      <div className="form-grid">
        <label>
          손님 메모
          <input
            type="text"
            value={customerMemo}
            placeholder="검은 모자, 입구 앞 두 명"
            onChange={(event) => setCustomerMemo(event.target.value)}
          />
        </label>

        <div className="field-block">
          <span>식별 색상</span>
          <div className="color-row">
            {customerColors.map((color) => (
              <button
                key={color.value}
                className={customerColor === color.value ? `color-dot ${color.value} active` : `color-dot ${color.value}`}
                type="button"
                aria-label={color.label}
                onClick={() => setCustomerColor(color.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="segmented payment-group" role="group" aria-label="결제 상태">
        {paymentOptions.map((option) => (
          <button
            key={option.value}
            className={paymentMethod === option.value ? "active" : ""}
            type="button"
            onClick={() => setPaymentMethod(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button className="primary-action" type="button" disabled={!cart.length || isSaving || isClosed} onClick={submitOrder}>
        {isSaving ? "등록 중" : `주문 넣기 · ${formatMoney(totalAmount)}`}
      </button>
    </section>
  );
}

function getSaveErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = rawMessage.toLowerCase();

  if (lowerMessage.includes("permission") || lowerMessage.includes("insufficient")) {
    return "주문 저장 권한이 없습니다. Firebase Console에서 Firestore Database 생성 여부와 Rules를 확인하세요.";
  }

  if (lowerMessage.includes("not-found") || lowerMessage.includes("database")) {
    return "Firestore Database를 찾을 수 없습니다. Firebase Console에서 Firestore Database를 먼저 생성하세요.";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("offline")) {
    return "네트워크 연결 문제로 주문을 저장하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러주세요.";
  }

  return `주문 저장에 실패했습니다: ${rawMessage}`;
}
