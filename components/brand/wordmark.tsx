import { cn } from "@/lib/utils/cn";

/**
 * N300 wordmark. Two modes:
 *  - default: plain "N300" + optional "libreta de atleta" tagline, used at
 *    small sizes (sidenav, form headers). Matches components-sidenav.html.
 *  - mark: larger brand mark with the red superscript dot. Matches
 *    brand-logo.html / assets/wordmark.svg.
 */
export function Wordmark({
  className,
  tagline,
  mark,
}: {
  className?: string;
  tagline?: boolean;
  mark?: boolean;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="inline-flex items-baseline font-semibold leading-none tracking-tight">
        <span>N300</span>
        {mark ? (
          <sup
            aria-hidden
            className="relative -top-[0.4em] ml-[0.1em] font-normal"
            style={{ color: "hsl(var(--metric-rhr))", fontSize: "0.4em" }}
          >
            ·
          </sup>
        ) : null}
      </span>
      {tagline ? (
        <span className="mt-1 text-xs text-muted-foreground">libreta de atleta</span>
      ) : null}
    </div>
  );
}
