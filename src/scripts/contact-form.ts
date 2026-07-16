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

function init(): void {
  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  const status = document.getElementById("contact-form-status");
  const submitButton = document.getElementById("contact-form-submit") as HTMLButtonElement | null;
  if (!form || !status || !submitButton) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector<HTMLInputElement>("#cf-company");
    if (honeypot && honeypot.value.trim() !== "") return;

    if (!validate(form)) {
      status.textContent = "Controlla i campi evidenziati e riprova.";
      return;
    }

    const endpoint = form.getAttribute("action");
    if (!endpoint) {
      status.textContent = "Il form non è ancora collegato a un servizio di invio. Contattaci via email nel frattempo.";
      return;
    }

    submitButton.disabled = true;
    status.textContent = "Invio in corso...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        status.textContent = "Messaggio inviato. Ti risponderemo il prima possibile.";
        form.reset();
      } else {
        status.textContent = "Invio non riuscito. Riprova più tardi o scrivici via email.";
      }
    } catch {
      status.textContent = "Invio non riuscito per un problema di connessione. Riprova più tardi.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

init();
