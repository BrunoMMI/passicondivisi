export {};

type ConsentState = { necessary: true; analytics: boolean; marketing: boolean };

const STORAGE_KEY = "passi-condivisi-cookie-consent";

function readConsent(): ConsentState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function writeConsent(state: ConsentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: state }));
}

function showBanner(): void {
  document.getElementById("cookie-banner")?.removeAttribute("hidden");
}
function hideBanner(): void {
  document.getElementById("cookie-banner")?.setAttribute("hidden", "");
}
function showPreferences(): void {
  document.getElementById("cookie-preferences")?.removeAttribute("hidden");
}
function hidePreferences(): void {
  document.getElementById("cookie-preferences")?.setAttribute("hidden", "");
}

function init(): void {
  const existing = readConsent();
  if (!existing) showBanner();

  document.getElementById("cookie-accept-all")?.addEventListener("click", () => {
    writeConsent({ necessary: true, analytics: true, marketing: true });
    hideBanner();
  });

  document.getElementById("cookie-reject-all")?.addEventListener("click", () => {
    writeConsent({ necessary: true, analytics: false, marketing: false });
    hideBanner();
  });

  document.getElementById("cookie-open-preferences")?.addEventListener("click", () => {
    showPreferences();
  });

  document.getElementById("cookie-preferences-save")?.addEventListener("click", () => {
    const analytics =
      (document.getElementById("cookie-pref-analytics") as HTMLInputElement | null)?.checked ?? false;
    const marketing =
      (document.getElementById("cookie-pref-marketing") as HTMLInputElement | null)?.checked ?? false;
    writeConsent({ necessary: true, analytics, marketing });
    hidePreferences();
    hideBanner();
  });

  document.getElementById("cookie-preferences-close")?.addEventListener("click", hidePreferences);

  document.getElementById("reopen-cookie-preferences")?.addEventListener("click", () => {
    const current = readConsent();
    if (current) {
      const analyticsInput = document.getElementById("cookie-pref-analytics") as HTMLInputElement | null;
      const marketingInput = document.getElementById("cookie-pref-marketing") as HTMLInputElement | null;
      if (analyticsInput) analyticsInput.checked = current.analytics;
      if (marketingInput) marketingInput.checked = current.marketing;
    }
    showPreferences();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hidePreferences();
  });
}

declare global {
  interface Window {
    getCookieConsent: () => ConsentState | null;
    openCookiePreferences: () => void;
  }
}
window.getCookieConsent = readConsent;
window.openCookiePreferences = showPreferences;

init();
