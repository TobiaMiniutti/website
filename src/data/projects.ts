export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type ProjectFile = {
  name: string;
  href: string;
  format: string;
  size: string;
};

export type ProjectGalleryItem = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export type Project = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  services: string[];
  role?: string;
  status?: string;
  year?: string;
  tech: string[];
  cover: { eyebrow: string; accent: string; code: string };
  gallery: ProjectGalleryItem[];
  files: ProjectFile[];
  links: ProjectLink[];
  challenge: string;
  approach: string;
  highlights: string[];
  published: boolean;
  seo: { title: string; description: string; socialImage?: string };
};

export const projects: Project[] = [
  {
    slug: "mns-warehouse",
    title: "MNS Warehouse",
    shortDescription: "Piattaforma per inventario e operazioni, costruita attorno a flussi reali, controllo degli accessi e affidabilità.",
    description: "Un gestionale web per rendere leggibili ubicazioni, articoli e movimenti senza separare il dato dall’operatività quotidiana.",
    category: "Gestionale operativo",
    services: ["Applicazione web", "Infrastruttura", "Sicurezza"],
    role: "Progettazione e sviluppo",
    tech: ["FastAPI", "PostgreSQL", "Docker", "Cloudflare", "PWA"],
    cover: { eyebrow: "Inventario / Operazioni", accent: "#C9A74C", code: "MNS—01" },
    gallery: [], files: [], links: [],
    challenge: "Riunire inventario, catalogazione, ubicazioni e responsabilità operative in un sistema utilizzabile sul campo e controllabile nel tempo.",
    approach: "Il progetto parte dai flussi reali di magazzino: dati strutturati, accessi separati per ruolo, cronologia delle operazioni e un’interfaccia pensata anche per l’uso da smartphone.",
    highlights: ["Ubicazioni e movimenti tracciabili", "Controllo degli accessi per ruolo", "Ricerca e acquisizione rapida dei prodotti", "Architettura self-hosted e distribuibile"],
    published: true,
    seo: { title: "MNS Warehouse | Progetto di Tobia Miniutti", description: "MNS Warehouse: piattaforma web per inventario, operazioni e controllo degli accessi." },
  },
  {
    slug: "culina",
    title: "Culina",
    shortDescription: "Ricettario avanzato con organizzazione personale e funzioni social dedicate alla cucina.",
    description: "Uno spazio personale per costruire un ricettario ricco di dettagli e, quando serve, condividere idee e preparazioni con altre persone.",
    category: "Prodotto digitale",
    services: ["Product design", "Applicazione web", "Sistemi social"],
    role: "Ideazione, progettazione e sviluppo",
    tech: ["Python", "PostgreSQL", "Redis", "Docker"],
    cover: { eyebrow: "Ricette / Comunità", accent: "#74237C", code: "CUL—02" },
    gallery: [], files: [], links: [],
    challenge: "Conservare la profondità di un ricettario personale senza trasformare l’esperienza in un modulo complesso, aggiungendo una dimensione sociale coerente con la cucina.",
    approach: "L’architettura distingue organizzazione privata e condivisione pubblica. Liste, immagini, preferenze e opzioni restano adattabili alle abitudini dell’utente.",
    highlights: ["Ricette strutturate e personalizzabili", "Liste e organizzazione personale", "Condivisione e interazioni sociali", "Configurazione iniziale modificabile"],
    published: true,
    seo: { title: "Culina | Progetto di Tobia Miniutti", description: "Culina: ricettario avanzato con organizzazione personale e funzioni social dedicate alla cucina." },
  },
  {
    slug: "little-printer-revival",
    title: "Little Printer Revival",
    shortDescription: "Recupero di un dispositivo dismesso tramite analisi del protocollo e una nuova piattaforma di servizio.",
    description: "Un lavoro di reverse engineering e ricostruzione del servizio per rimettere in funzione una piccola stampante connessa non più supportata.",
    category: "Reverse engineering",
    services: ["Protocol analysis", "Embedded systems", "Piattaforma web"],
    role: "Analisi e sviluppo",
    tech: ["Python", "WebSocket", "Embedded Linux", "Bottle"],
    cover: { eyebrow: "Protocollo / Hardware", accent: "#008C45", code: "LPR—03" },
    gallery: [], files: [], links: [],
    challenge: "Riattivare un oggetto dipendente da server non più disponibili, lavorando con un sistema embedded datato e un protocollo proprietario.",
    approach: "Il comportamento del dispositivo è stato osservato e ricostruito fino a definire il ciclo di connessione, consegna dei dati, conferma e stampa, mantenendo compatibilità con l’hardware originale.",
    highlights: ["Analisi del protocollo di comunicazione", "Nuovo servizio compatibile", "Gestione del ciclo di stampa", "Recupero senza modifiche distruttive al dispositivo"],
    published: true,
    seo: { title: "Little Printer Revival | Progetto di Tobia Miniutti", description: "Recupero di Little Printer mediante analisi del protocollo e una nuova piattaforma di servizio." },
  },
  {
    slug: "secure-garage-access",
    title: "Secure Garage Access",
    shortDescription: "Gestione sicura degli accessi e automazione del cancello.",
    description: "Un sistema web che porta controllo, autorizzazioni e tracciabilità in un’automazione domestica nata da un’esigenza concreta.",
    category: "Automazione sicura",
    services: ["Automazione", "Access control", "Infrastruttura"],
    role: "Progettazione e sviluppo",
    tech: ["Node.js", "Docker", "Cloudflare", "eWeLink"],
    cover: { eyebrow: "Accessi / Automazione", accent: "#CD212A", code: "SGA—04" },
    gallery: [], files: [], links: [],
    challenge: "Consentire l’apertura controllata del cancello senza rinunciare a semplicità d’uso, revoca degli accessi e visibilità sulle operazioni.",
    approach: "Il comando fisico è isolato dietro un servizio autenticato. Utenti e codici temporanei ricevono permessi e limiti verificati lato server, con una cronologia dedicata.",
    highlights: ["Account e codici temporanei", "Limiti di validità e utilizzo", "Controlli server-side", "Storico degli accessi"],
    published: true,
    seo: { title: "Secure Garage Access | Progetto di Tobia Miniutti", description: "Sistema web per gestione sicura degli accessi e automazione di un cancello." },
  },
];

export const publishedProjects = projects.filter((project) => project.published);

export function getProject(slug: string) {
  return publishedProjects.find((project) => project.slug === slug);
}
