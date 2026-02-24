'use client';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export default function DateInput({ value, onChange, className = 'input-field text-sm', required }: DateInputProps) {
  return (
    <div className="relative">
      <input
        type="date"
        className={`${className} sm:text-transparent-none date-input-custom`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      {/* No mobile, mostra texto formatado sobre o input */}
      <div
        className="absolute inset-0 flex items-center px-3 text-sm text-gray-900 pointer-events-none sm:hidden"
      >
        {value ? formatDateBR(value) : <span className="text-gray-400">dd/mm/aaaa</span>}
      </div>
    </div>
  );
}
