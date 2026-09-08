import { Signature } from "./Signature";

export function InternalIntro({ index, eyebrow, title, copy }: { index: string; eyebrow: string; title: string; copy: string }) {
  return <section className="internal-intro"><div className="internal-kicker"><Signature /><span>{eyebrow}</span></div><span className="sr-only">{index}</span><h1>{title}</h1><p className="internal-copy">{copy}</p></section>;
}
