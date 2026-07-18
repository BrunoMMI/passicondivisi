export {};

function setFieldError(id: string, message: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors(): void {
  document.querySelectorAll('[role="alert"]').forEach((el) => (el.textContent = ""));
}

function validate(form: HTMLFormElement): boolean {
  clearErrors();
  let valid = true;

  const nome = form.querySelector<HTMLInputElement>("#cf-nome")!;
  if (!nome.value.trim()) {
    setFieldError("cf-nome-error", "Inserisci il tuo nome.");
    valid = false;
  }

  const cognome = form.querySelector<HTMLInputElement>("#cf-cognome")!;
  if (!cognome.value.trim()) {
    setFieldError("cf-cognome-error", "Inserisci cognome o organizzazione.");
    valid = false;
  }

  const email = form.querySelector<HTMLInputElement>("#cf-email")!;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    setFieldError("cf-email-error", "Inserisci un indirizzo email valido.");
    valid = false;
  }

  const messaggio = form.querySelector<HTMLTextAreaElement>("#cf-messaggio")!;
  if (!messaggio.value.trim()) {
    setFieldError("cf-messaggio-error", "Scrivi un messaggio.");
    valid = false;
  }

  const privacy = form.querySelector<HTMLInputElement>("#cf-privacy")!;
  if (!privacy.checked) {
    setFieldError("cf-privacy-error", "Devi accettare la Privacy Policy per inviare il messaggio.");
    valid = false;
  }

  return valid;
}

function buildWhatsappMessage(form: HTMLFormElement): string {
  const value = (id: string) => form.querySelector<HTMLInputElement | HTMLTextAreaElement>(id)?.value.trim() ?? "";

  const argomentoSelect = form.querySelector<HTMLSelectElement>("#cf-argomento")!;
  const argomento = argomentoSelect.options[argomentoSelect.selectedIndex]?.text ?? "";

  const lines = [
    "Ciao Passi Condivisi, vi scrivo dal sito:",
    `Nome: ${value("#cf-nome")} ${value("#cf-cognome")}`,
    `Email: ${value("#cf-email")}`,
  ];

  const telefono = value("#cf-telefono");
  if (telefono) lines.push(`Telefono: ${telefono}`);

  lines.push(`Argomento: ${argomento}`, "", value("#cf-messaggio"));

  return lines.join("\n");
}

function init(): void {
  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  const status = document.getElementById("contact-form-status");
  const submitButton = document.getElementById("contact-form-submit") as HTMLButtonElement | null;
  if (!form || !status || !submitButton) return;

  const whatsappNumber = form.dataset.whatsapp?.replace(/\D/g, "");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const honeypot = form.querySelector<HTMLInputElement>("#cf-company");
    if (honeypot && honeypot.value.trim() !== "") return;

    if (!validate(form)) {
      status.textContent = "Controlla i campi evidenziati e riprova.";
      return;
    }

    if (!whatsappNumber) {
      status.textContent = "Il form non è ancora collegato a un numero WhatsApp.";
      return;
    }

    const message = buildWhatsappMessage(form);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");

    status.textContent = "Stiamo per aprire WhatsApp con il messaggio pronto: conferma l'invio da lì per completarlo.";
    form.reset();
  });
}

init();
