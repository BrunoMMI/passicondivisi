export {};

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } catch {
    succeeded = false;
  }
  document.body.removeChild(textarea);
  return succeeded;
}

async function copyIban(iban: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(iban);
      return true;
    } catch {
      return fallbackCopy(iban);
    }
  }
  return fallbackCopy(iban);
}

function init(): void {
  const button = document.getElementById("copy-iban-button");
  const feedback = document.getElementById("copy-iban-feedback");
  const iban = button?.dataset.iban;
  if (!button || !feedback || !iban) return;

  button.addEventListener("click", async () => {
    const success = await copyIban(iban);
    feedback.textContent = success
      ? "IBAN copiato negli appunti."
      : "Copia non riuscita: seleziona e copia manualmente l'IBAN.";
    feedback.classList.remove("sr-only");
    window.setTimeout(() => feedback.classList.add("sr-only"), 4000);
  });
}

init();
