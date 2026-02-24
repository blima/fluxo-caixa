interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
  color?: string;
}

const variants: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
};

export default function Badge({ children, variant = 'gray', color }: BadgeProps) {
  const style = color
    ? { backgroundColor: color + '20', color }
    : undefined;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        color ? '' : variants[variant]
      }`}
      style={style}
    >
      {children}
    </span>
  );
}
