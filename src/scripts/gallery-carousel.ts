export {};

function initGalleryCarousel(): void {
  const scroller = document.getElementById("gallery-scroll");
  const prevBtn = document.querySelector<HTMLButtonElement>("[data-gallery-prev]");
  const nextBtn = document.querySelector<HTMLButtonElement>("[data-gallery-next]");
  if (!scroller || !prevBtn || !nextBtn) return;

  function step(direction: 1 | -1): void {
    scroller!.scrollBy({ left: direction * scroller!.clientWidth * 0.8, behavior: "smooth" });
  }

  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
}

initGalleryCarousel();
