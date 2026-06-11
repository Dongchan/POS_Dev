import { useMemo, useState } from "react";
import { BottomNav, type AppTab } from "./components/BottomNav";
import { OrderEntry } from "./features/order/OrderEntry";
import { getTodayBusinessDate } from "./features/order/orderUtils";
import { OpenOrdersBoard } from "./features/queue/OpenOrdersBoard";
import { SalesSummary } from "./features/summary/SalesSummary";
import { SettingsPanel } from "./features/settings/SettingsPanel";
import { useOrders } from "./hooks/useOrders";

const TEST_MODE_KEY = "pocha-pos:test-mode";

function readBoolean(key: string, defaultValue = false) {
  return window.localStorage.getItem(key) ? window.localStorage.getItem(key) === "true" : defaultValue;
}

function closedKey(businessDate: string) {
  return `pocha-pos:closed:${businessDate}`;
}

export default function App() {
  const businessDate = getTodayBusinessDate();
  const [activeTab, setActiveTab] = useState<AppTab>("order");
  const [isTestMode, setIsTestModeState] = useState(() => readBoolean(TEST_MODE_KEY));
  const [isClosed, setIsClosedState] = useState(() => readBoolean(closedKey(businessDate)));
  const { orders, storageMode, storageError, saveOrder, updateOrder, deleteOrders } = useOrders(businessDate);

  const openOrders = useMemo(() => orders.filter((order) => order.status === "open"), [orders]);
  const paidTotal = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "cancelled" && order.paymentStatus === "paid")
        .reduce((total, order) => total + order.totalAmount, 0),
    [orders],
  );

  const setIsTestMode = (enabled: boolean) => {
    setIsTestModeState(enabled);
    window.localStorage.setItem(TEST_MODE_KEY, String(enabled));
  };

  const setIsClosed = (closed: boolean) => {
    setIsClosedState(closed);
    window.localStorage.setItem(closedKey(businessDate), String(closed));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="brand-mark">P</span>
          <div>
            <p>동백꽃 상점</p>
            <h1>PochaPOS</h1>
          </div>
        </div>
        <div className="header-stats">
          <div>
            <span>미전달</span>
            <strong>{openOrders.length}건</strong>
          </div>
          <div>
            <span>결제 합계</span>
            <strong>{paidTotal.toLocaleString("ko-KR")}원</strong>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className={activeTab === "order" ? "desktop-order-layout active" : "desktop-order-layout"}>
          <OrderEntry
            businessDate={businessDate}
            orders={orders}
            isTestMode={isTestMode}
            isClosed={isClosed}
            onSave={saveOrder}
          />
          <OpenOrdersBoard orders={orders} onUpdate={updateOrder} />
        </div>

        <div className={activeTab === "open" ? "mobile-panel active" : "mobile-panel"}>
          <OpenOrdersBoard orders={orders} onUpdate={updateOrder} />
        </div>

        <div className={activeTab === "summary" ? "mobile-panel active" : "mobile-panel"}>
          <SalesSummary orders={orders} />
        </div>

        <div className={activeTab === "settings" ? "mobile-panel active" : "mobile-panel"}>
          <SettingsPanel
            businessDate={businessDate}
            storageMode={storageMode}
            storageError={storageError}
            isTestMode={isTestMode}
            onTestModeChange={setIsTestMode}
            isClosed={isClosed}
            onClosedChange={setIsClosed}
            orders={orders}
            onDeleteOrders={deleteOrders}
          />
        </div>
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} openCount={openOrders.length} />
    </div>
  );
}
