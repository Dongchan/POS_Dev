import { useState } from "react";

type PinGateProps = {
  onUnlock: () => void;
};

export function isPinEnabled() {
  return Boolean(import.meta.env.VITE_APP_PIN);
}

export function PinGate({ onUnlock }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submitPin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pin === import.meta.env.VITE_APP_PIN) {
      window.sessionStorage.setItem("pocha-pos:pin-unlocked", "true");
      onUnlock();
      return;
    }

    setError("PIN이 맞지 않습니다.");
    setPin("");
  };

  return (
    <main className="pin-screen">
      <form className="pin-card" onSubmit={submitPin}>
        <span className="brand-mark">P</span>
        <div>
          <p className="section-label">동백꽃 상점</p>
          <h1>PochaPOS 잠금</h1>
        </div>
        <label>
          PIN
          <input
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            type="password"
            value={pin}
            placeholder="PIN 입력"
            onChange={(event) => {
              setError("");
              setPin(event.target.value);
            }}
          />
        </label>
        {error ? <div className="notice danger">{error}</div> : null}
        <button className="primary-action pin-action" type="submit" disabled={!pin}>
          열기
        </button>
      </form>
    </main>
  );
}
