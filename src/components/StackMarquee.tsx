const stack = [
  ["React", "react"], ["TypeScript", "typescript"], ["FastAPI", "fastapi"], ["PostgreSQL", "postgresql"], ["Docker", "docker"],
  ["Cloudflare", "cloudflare"], ["Proxmox", "proxmox"], ["GitHub", "github"], ["Python", "python"], ["Figma", "figma"],
] as const;

function StackItems({ duplicate = false }: { duplicate?: boolean }) {
  return <>{stack.map(([item, slug]) => <div className="stack-card" key={`${duplicate ? "copy" : "main"}-${item}`}><img className="stack-glyph" src={`/assets/stack/${slug}.svg`} alt={duplicate ? "" : `Logo ${item}`} width="24" height="24" loading="lazy" /><span>{item}</span></div>)}</>;
}

export function StackMarquee() {
  return (
    <section className="marquee" aria-label="Strumenti di lavoro" tabIndex={0}>
      <div className="marquee-track"><div className="marquee-group"><StackItems /></div><div className="marquee-group" aria-hidden="true"><StackItems duplicate /></div></div>
    </section>
  );
}
