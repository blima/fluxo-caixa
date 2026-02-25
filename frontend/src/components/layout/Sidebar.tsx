'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  TagIcon,
  MapPinIcon,
  FlagIcon,
  CreditCardIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type NavLink = { name: string; href: string; icon: React.ForwardRefExoticComponent<any> };
type NavGroup = { name: string; children: NavLink[] };
type NavItem = NavLink | NavGroup;

const navigation: NavItem[] = [
  { name: 'Fluxo de Caixa', href: '/dashboard', icon: HomeIcon },
  { name: 'Lançamentos', href: '/lancamentos', icon: BanknotesIcon },
  { name: 'Extrato', href: '/extrato', icon: DocumentTextIcon },
  {
    name: 'Cadastros',
    children: [
      { name: 'Lojas', href: '/cadastros/lojas', icon: BuildingStorefrontIcon },
      { name: 'Origens', href: '/cadastros/origens', icon: MapPinIcon },
      { name: 'Destinos', href: '/cadastros/destinos', icon: FlagIcon },
      { name: 'Etiquetas', href: '/cadastros/etiquetas', icon: TagIcon },
      { name: 'Tipos de Pagamento', href: '/cadastros/tipos-pagamento', icon: CreditCardIcon },
      { name: 'Usuários', href: '/cadastros/usuarios', icon: UsersIcon },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-primary-900 text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-primary-800">
          <div className="flex items-center">
            <Squares2X2Icon className="h-7 w-7 text-primary-300 mr-3" />
            <span className="text-lg font-bold">Fluxo de Caixa</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-primary-300 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navigation.map((item) => {
            if ('href' in item) {
              const link = item as NavLink;
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1 ${
                    active
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            }

            const group = item as NavGroup;
            return (
              <div key={group.name} className="mb-2">
                <p className="px-3 py-2 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                  {group.name}
                </p>
                {group.children.map((child) => {
                  const active = pathname === child.href;
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-0.5 ${
                        active
                          ? 'bg-primary-700 text-white'
                          : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                      }`}
                    >
                      <ChildIcon className="h-5 w-5" />
                      {child.name}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
