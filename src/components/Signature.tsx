import { cn } from "../lib/cn";

export function Signature({ className = "" }: { className?: string }) {
  return <img className={cn("signature", className)} src="/assets/images/signature.png" width="720" height="720" alt="" decoding="async" />;
}
