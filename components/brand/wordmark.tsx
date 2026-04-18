import { cn } from "@/lib/utils/cn";

/**
 * N300 wordmark. Sets the name in Inter semibold with tight tracking and a
 * small red superscript dot after it — matches assets/wordmark.svg in the
 * design system bundle.
 */
export function Wordmark({
  className,
  tagline,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="inline-flex items-baseline font-semibold leading-none tracking-tight">
        <span>N300</span>
        <sup
          aria-hidden
          className="relative -top-[0.4em] ml-[0.1em] font-normal"
          style={{ color: "hsl(var(--metric-rhr))", fontSize: "0.4em" }}
        >
          ·
        </sup>
      </span>
      {tagline ? (
        <span className="mt-1 text-xs text-muted-foreground">libreta de atleta</span>
      ) : null}
    </div>
  );
}
