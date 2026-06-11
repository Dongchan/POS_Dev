import type { Order } from "../order/orderTypes";

type SettingsPanelProps = {
  businessDate: string;
  storageMode: "firebase" | "local";
  storageError: string;
  isTestMode: boolean;
  onTestModeChange: (enabled: boolean) => void;
  isClosed: boolean;
  onClosedChange: (closed: boolean) => void;
  orders: Order[];
  onDeleteOrders: (ids: string[]) => Promise<void>;
};

export function SettingsPanel({
  businessDate,
  storageMode,
  storageError,
  isTestMode,
  onTestModeChange,
  isClosed,
  onClosedChange,
  orders,
  onDeleteOrders,
}: SettingsPanelProps) {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "미설정";
  const testOrderCount = orders.filter((order) => order.isTest).length;

  const clearTestOrders = async () => {
    if (!testOrderCount) return;
    if (!window.confirm(`테스트 주문 ${testOrderCount}건을 삭제할까요?`)) return;
    await onDeleteOrders(orders.filter((order) => order.isTest).map((order) => order.id));
  };

  const clearTodayOrders = async () => {
    if (!orders.length) return;
    const answer = window.prompt("오늘 주문을 모두 삭제하려면 '오늘 데이터 삭제'를 입력하세요.");
    if (answer !== "오늘 데이터 삭제") return;
    await onDeleteOrders(orders.map((order) => order.id));
  };

  return (
    <section className="panel settings-panel" aria-labelledby="settings-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">운영 설정</p>
          <h2 id="settings-title">{businessDate}</h2>
        </div>
        <span className={storageMode === "firebase" ? "status-pill online" : "status-pill"}>
          {storageMode === "firebase" ? "Firebase" : "로컬 저장"}
        </span>
      </div>

      <div className="settings-list">
        <div className="setting-row">
          <div>
            <strong>영업 상태</strong>
            <span>{isClosed ? "마감됨" : "주문 접수 가능"}</span>
          </div>
          <button className={isClosed ? "success" : "danger"} type="button" onClick={() => onClosedChange(!isClosed)}>
            {isClosed ? "영업 재개" : "영업 마감"}
          </button>
        </div>

        <div className="setting-row">
          <div>
            <strong>테스트 모드</strong>
            <span>켜져 있으면 새 주문에 테스트 표시가 붙습니다.</span>
          </div>
          <label className="switch">
            <input checked={isTestMode} type="checkbox" onChange={(event) => onTestModeChange(event.target.checked)} />
            <span />
          </label>
        </div>

        <div className="setting-row">
          <div>
            <strong>Firebase 프로젝트</strong>
            <span>{projectId}</span>
            {storageError ? <em className="error-text">{storageError}</em> : null}
          </div>
          <span className="muted-text">{storageMode === "firebase" ? "실시간 동기화" : "환경변수 없음"}</span>
        </div>
      </div>

      <div className="danger-zone">
        <h3>데이터 정리</h3>
        <div className="danger-actions">
          <button type="button" onClick={clearTestOrders} disabled={!testOrderCount}>
            테스트 데이터 초기화
          </button>
          <button className="danger" type="button" onClick={clearTodayOrders} disabled={!orders.length}>
            오늘 데이터 초기화
          </button>
        </div>
      </div>
    </section>
  );
}
