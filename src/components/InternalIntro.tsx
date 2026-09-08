import { Signature } from "./Signature";

export function InternalIntro({ index, eyebrow, title, copy }: { index: string; eyebrow: string; title: string; copy: string }) {
  return <section className="internal-intro"><div className="internal-kicker"><Signature /><span>{index}</span></div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="internal-copy">{copy}</p></section>;
}
