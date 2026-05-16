import { IconMoodEmpty } from "@tabler/icons-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
        <IconMoodEmpty className="h-8 w-8 text-brand" stroke={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action}
    </div>
  );
}
