'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-64 right-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UserCircleIcon className="h-5 w-5" />
          <span>{user?.nome}</span>
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
