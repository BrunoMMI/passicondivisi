export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Cosa offriamo", href: "/cosa-offriamo" },
  { label: "Il nostro progetto", href: "/il-nostro-progetto" },
  { label: "Contatti", href: "/contatti" },
];

export const DONATE_LINK: NavLink = { label: "Sostienici", href: "/sostienici" };

export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];
