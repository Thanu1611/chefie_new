import { IconAlertCircle } from "@tabler/icons-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <IconAlertCircle className="h-8 w-8 text-red-500" stroke={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary mt-2">
          Try again
        </button>
      )}
    </div>
  );
}
