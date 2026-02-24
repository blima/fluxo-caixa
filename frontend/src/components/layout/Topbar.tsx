'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 z-30 h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className="lg:hidden" />
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UserCircleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{user?.nome}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
          title="Sair"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
