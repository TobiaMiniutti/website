import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Signature } from "../components/Signature";

export function ConfirmationPage() {
  return <main id="contenuto" className="status-page"><div className="status-mark"><Check aria-hidden="true" /></div><p className="eyebrow">RICHIESTA RICEVUTA</p><h1>Messaggio inviato.</h1><p>La richiesta è stata ricevuta correttamente. Riceverai un riscontro all’indirizzo email indicato.</p><a className="button button-dark" href="/#home">Torna alla Home <ArrowUpRight aria-hidden="true" /></a></main>;
}

export function NotFoundPage() {
  return <main id="contenuto" className="status-page not-found"><Signature /><p className="error-code">404</p><p className="eyebrow">INDICE NON TROVATO</p><h1>Questa pagina non esiste.</h1><p>Il percorso può essere cambiato oppure non è mai stato pubblicato.</p><a className="button button-dark" href="/"><ArrowLeft aria-hidden="true" /> Torna alla Home</a></main>;
}
