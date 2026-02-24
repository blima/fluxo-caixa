import { InboxIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  message?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  message = 'Nenhum registro encontrado',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <InboxIcon className="h-12 w-12 mb-3" />
      <p className="text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
