import type { ImageMetadata } from "astro";
import imgAssistenzaDomiciliare from "../assets/stock/service-assistenza-domiciliare.jpg";
import imgMediazioneFamiliare from "../assets/stock/service-mediazione-familiare.jpg";
import imgAssistenzaScolastica from "../assets/stock/service-assistenza-scolastica.jpg";
import imgLaboratorioTerritoriale from "../assets/stock/service-laboratorio-territoriale.jpg";

export type Service = {
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  colorToken: "brand-red" | "brand-orange" | "brand-green" | "brand-blue";
  image: ImageMetadata;
  imageAlt: string;
};

export const SERVICES: Service[] = [
  {
    slug: "assistenza-domiciliare",
    title: "Assistenza domiciliare socio-assistenziale",
    summary: "Assistenza domiciliare ad anziani e persone con disabilità.",
    objectives: [
      "Garantire alla persona anziana e/o con disabilità la permanenza presso il proprio domicilio in condizioni di sicurezza e benessere.",
      "Preservare le relazioni sociali, le abitudini di vita e il livello di autonomia residua.",
      "Sostenere i caregiver e contribuire a prevenire l'istituzionalizzazione.",
    ],
    colorToken: "brand-red",
    image: imgAssistenzaDomiciliare,
    imageAlt: "Un'operatrice sorride a una persona anziana durante una visita domiciliare",
  },
  {
    slug: "mediazione-familiare",
    title: "Servizio di mediazione familiare",
    summary:
      "Un intervento mirato per affrontare e rielaborare situazioni di criticità o conflitto nella relazione genitori-figli.",
    objectives: [
      "Promuovere attivamente l'autonomia decisionale delle parti coinvolte.",
      "Facilitare le competenze relazionali e comunicative.",
      "Favorire e stimolare il dialogo, la stima e la fiducia reciproca.",
      "Prevenire, attenuare e gestire il disagio delle parti coinvolte nelle situazioni di crisi.",
    ],
    colorToken: "brand-orange",
    image: imgMediazioneFamiliare,
    imageAlt: "Una madre abbraccia con affetto il proprio bambino",
  },
  {
    slug: "assistenza-scolastica",
    title: "Servizio di assistenza scolastica",
    summary:
      "Sostegno socio-educativo specialistico rivolto a persone con disabilità, a garanzia del diritto allo studio.",
    objectives: [
      "Facilitare la comunicazione.",
      "Favorire la socializzazione.",
      "Sostenere l'inserimento e l'integrazione scolastica.",
      "Promuovere l'apprendimento e lo sviluppo delle potenzialità residue dell'utente.",
    ],
    colorToken: "brand-green",
    image: imgAssistenzaScolastica,
    imageAlt: "Un'assistente aiuta un bambino a colorare al tavolo",
  },
  {
    slug: "laboratorio-educativa-territoriale",
    title: "Laboratorio di educativa territoriale",
    summary:
      "Laboratori guidati da due fari pedagogici ed etici: la conquista dell'autonomia e la dignità dell'inclusione.",
    objectives: [
      "Accompagnare la conquista dell'autonomia: saper scegliere, comunicare i propri bisogni, muoversi nello spazio, gestire piccoli compiti personali e domestici.",
      "Costruire ponti verso l'esterno attraverso il lavoro e l'espressione creativa, in un'ottica di risorsa e non di limite.",
      "Offrire alle famiglie un'alleanza educativa solida e competenze specialistiche.",
    ],
    colorToken: "brand-blue",
    image: imgLaboratorioTerritoriale,
    imageAlt: "Un gruppo di persone dipinge insieme durante un laboratorio creativo",
  },
];
