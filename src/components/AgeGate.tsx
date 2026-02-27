import { useEffect, useState } from "react";

const COOKIE_NAME = "age_verified";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

type GateState = "hidden" | "prompt" | "denied";

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

function setCookie(name: string, value: string, maxAge: number) {
  // biome-ignore lint/suspicious/noDocumentCookie: simple age gate, Cookie Store API not widely supported
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function AgeGate() {
  const [state, setState] = useState<GateState>("hidden");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      const timer = setTimeout(() => {
        setState("prompt");
        requestAnimationFrame(() => setShow(true));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (state === "hidden") return null;

  const handleConfirm = () => {
    setCookie(COOKIE_NAME, "true", MAX_AGE_SECONDS);
    setState("hidden");
  };

  return (
    <div className={`ageGate${show ? " visible" : ""}`}>
      <div className="ageGateCard">
        {state === "denied" ? (
          <div className="ageGateDenied">
            <span className="ageGateSad">:(</span>
            <div className="ageGateCan">
              <img src="/images/can.svg" alt="" width={80} height={160} />
            </div>
          </div>
        ) : (
          <>
            <img
              src="/images/bv-icon.svg"
              alt="Bryggverket"
              width={80}
              height={80}
            />
            <h2 className="font-marker">Är du 20 år eller äldre?</h2>
            <p>Du måste vara minst 20 år för att besöka denna webbplats.</p>
            <div className="ageGateButtons">
              <button type="button" className="btn" onClick={handleConfirm}>
                Ja
              </button>
              <button
                type="button"
                className="btn black"
                onClick={() => setState("denied")}
              >
                Nej
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
