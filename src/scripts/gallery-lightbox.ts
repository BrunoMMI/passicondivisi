export {};

declare global {
  interface Window {
    __galleryData: { sources: string[]; alts: string[] };
  }
}

function initGalleryLightbox(): void {
  const data = window.__galleryData;
  if (!data) return;
  const dialog = document.getElementById("gallery-lightbox");
  const imageEl = document.getElementById("gallery-lightbox-image") as HTMLImageElement | null;
  const closeBtn = document.getElementById("gallery-lightbox-close");
  const prevBtn = document.getElementById("gallery-lightbox-prev");
  const nextBtn = document.getElementById("gallery-lightbox-next");
  const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-gallery-item]"));
  if (!dialog || !imageEl || !closeBtn || !prevBtn || !nextBtn || triggers.length === 0) return;

  let currentIndex = 0;
  let lastFocused: HTMLElement | null = null;

  function render(): void {
    imageEl!.src = data.sources[currentIndex];
    imageEl!.alt = data.alts[currentIndex];
  }

  function open(index: number): void {
    currentIndex = index;
    render();
    lastFocused = document.activeElement as HTMLElement;
    dialog!.hidden = false;
    closeBtn!.focus();
    document.body.style.overflow = "hidden";
  }

  function close(): void {
    dialog!.hidden = true;
    document.body.style.overflow = "";
    lastFocused?.focus();
  }

  function step(delta: number): void {
    currentIndex = (currentIndex + delta + data.sources.length) % data.sources.length;
    render();
  }

  triggers.forEach((trigger, index) => trigger.addEventListener("click", () => open(index)));
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  document.addEventListener("keydown", (event) => {
    if (dialog!.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });
}

initGalleryLightbox();
