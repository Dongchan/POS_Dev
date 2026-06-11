export type AppTab = "order" | "open" | "summary" | "settings";

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: "order", label: "주문" },
  { id: "open", label: "미전달" },
  { id: "summary", label: "요약" },
  { id: "settings", label: "설정" },
];

type BottomNavProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
  openCount: number;
};

export function BottomNav({ activeTab, onChange, openCount }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="주요 화면">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? "nav-button active" : "nav-button"}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          {tab.id === "open" && openCount > 0 ? <strong>{openCount}</strong> : null}
        </button>
      ))}
    </nav>
  );
}
