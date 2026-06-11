import { useMemo } from "react";
import type { Order } from "../order/orderTypes";
import { formatMoney } from "../order/orderUtils";

type SalesSummaryProps = {
  orders: Order[];
};

export function SalesSummary({ orders }: SalesSummaryProps) {
  const summary = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== "cancelled");
    const completedOrders = activeOrders.filter((order) => order.status === "served");
    const paidOrders = activeOrders.filter((order) => order.paymentStatus === "paid");
    const cancelledOrders = orders.filter((order) => order.status === "cancelled");
    const openOrders = activeOrders.filter((order) => order.status === "open");

    const cardRevenue = paidOrders
      .filter((order) => order.paymentMethod === "card")
      .reduce((total, order) => total + order.totalAmount, 0);
    const cashRevenue = paidOrders
      .filter((order) => order.paymentMethod === "cash")
      .reduce((total, order) => total + order.totalAmount, 0);
    const unpaidAmount = activeOrders
      .filter((order) => order.paymentStatus === "unpaid")
      .reduce((total, order) => total + order.totalAmount, 0);

    const menuSales = new Map<string, { label: string; quantity: number; revenue: number }>();
    activeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = `${item.name}-${item.option}`;
        const label = item.option === "기본" ? item.name : `${item.name} ${item.option}`;
        const current = menuSales.get(key) ?? { label, quantity: 0, revenue: 0 };
        menuSales.set(key, {
          label,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.subtotal,
        });
      });
    });

    return {
      activeOrders,
      completedOrders,
      cancelledOrders,
      openOrders,
      cardRevenue,
      cashRevenue,
      unpaidAmount,
      menuRows: Array.from(menuSales.values()).sort((a, b) => b.revenue - a.revenue),
    };
  }, [orders]);

  return (
    <section className="panel summary-panel" aria-labelledby="summary-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">오늘 요약</p>
          <h2 id="summary-title">{formatMoney(summary.cardRevenue + summary.cashRevenue)}</h2>
        </div>
        <span className="status-pill">취소 제외 기준</span>
      </div>

      <div className="metric-grid">
        <Metric label="전체 주문" value={`${summary.activeOrders.length}건`} />
        <Metric label="전달 완료" value={`${summary.completedOrders.length}건`} />
        <Metric label="미전달" value={`${summary.openOrders.length}건`} />
        <Metric label="취소" value={`${summary.cancelledOrders.length}건`} />
        <Metric label="카드 매출" value={formatMoney(summary.cardRevenue)} />
        <Metric label="현금 매출" value={formatMoney(summary.cashRevenue)} />
        <Metric label="미결제" value={formatMoney(summary.unpaidAmount)} />
      </div>

      <div className="table-panel">
        <h3>메뉴별 판매</h3>
        {summary.menuRows.length ? (
          <div className="sales-table">
            {summary.menuRows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <b>{row.quantity}개</b>
                <strong>{formatMoney(row.revenue)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">아직 집계할 주문이 없습니다.</p>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
