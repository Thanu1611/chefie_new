import { IconLoader2 } from "@tabler/icons-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <IconLoader2
        className="h-10 w-10 animate-spin text-brand"
        stroke={1.5}
        aria-hidden
      />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
