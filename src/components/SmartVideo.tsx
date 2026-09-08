import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

type SmartVideoProps = {
  src: string;
  poster: string;
  className?: string;
  lazy?: boolean;
};

export function SmartVideo({ src, poster, className, lazy = false }: SmartVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [near, setNear] = useState(!lazy);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    setAllowed(!reduced && !saveData);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !allowed) return;
    const observer = new IntersectionObserver(([entry]) => {
      setNear(entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight * 1.5);
      if (entry.intersectionRatio > .3 && !document.hidden) void video.play().catch(() => undefined);
      else video.pause();
    }, { rootMargin: lazy ? "80% 0px" : "0px", threshold: [0, .3] });
    observer.observe(video);
    const visibility = () => { if (document.hidden) video.pause(); else if (video.getBoundingClientRect().top < innerHeight && video.getBoundingClientRect().bottom > 0) void video.play().catch(() => undefined); };
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); video.pause(); };
  }, [allowed, lazy]);

  if (!allowed || failed) return <img className={cn("smart-video", className)} src={poster} alt="" aria-hidden="true" loading={lazy ? "lazy" : "eager"} fetchPriority={lazy ? "low" : "high"} />;
  return <video ref={ref} className={cn("smart-video", className)} muted loop playsInline autoPlay={!lazy} preload={lazy ? "none" : "metadata"} poster={poster} aria-hidden="true" tabIndex={-1} onError={() => setFailed(true)}>{near && <source src={src} type="video/mp4" />}</video>;
}
