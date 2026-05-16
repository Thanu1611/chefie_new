import Link from "next/link";
import { IconAlertCircle } from "@tabler/icons-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: {
    href: string;
    label: string;
  };
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  onRetry,
  retryLabel = "Try again",
  secondaryAction,
}: ErrorStateProps) {
  return (
    <div className="card flex flex-col items-center gap-3 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <IconAlertCircle className="h-7 w-7 text-red-500" stroke={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary">
            {retryLabel}
          </button>
        )}
        {secondaryAction && (
          <Link href={secondaryAction.href} className="btn-secondary">
            {secondaryAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}

