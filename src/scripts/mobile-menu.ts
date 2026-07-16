function initMobileMenu(): void {
  const toggle = document.getElementById("mobile-menu-toggle");
  const closeBtn = document.getElementById("mobile-menu-close");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu || !closeBtn) return;

  const focusableSelector = "a[href], button:not([disabled])";

  function openMenu(): void {
    menu!.hidden = false;
    toggle!.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const first = menu!.querySelector<HTMLElement>(focusableSelector);
    first?.focus();
  }

  function closeMenu(): void {
    menu!.hidden = true;
    toggle!.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    toggle!.focus();
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeBtn.addEventListener("click", closeMenu);

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menu!.hidden) return;
    closeMenu();
  });

  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || menu!.hidden) return;
    const focusable = Array.from(menu!.querySelectorAll<HTMLElement>(focusableSelector));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function initHeaderScrollState(): void {
  const header = document.getElementById("site-header");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("shadow-md", window.scrollY > 8);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

initMobileMenu();
initHeaderScrollState();
