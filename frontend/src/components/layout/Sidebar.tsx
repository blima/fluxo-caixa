'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TagIcon,
  MapPinIcon,
  FlagIcon,
  CreditCardIcon,
  UsersIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

type NavLink = { name: string; href: string; icon: React.ForwardRefExoticComponent<any> };
type NavGroup = { name: string; children: NavLink[] };
type NavItem = NavLink | NavGroup;

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Lançamentos',
    children: [
      { name: 'Receitas', href: '/lancamentos/receitas', icon: ArrowTrendingUpIcon },
      { name: 'Despesas', href: '/lancamentos/despesas', icon: ArrowTrendingDownIcon },
    ],
  },
  {
    name: 'Cadastros',
    children: [
      { name: 'Origens', href: '/cadastros/origens', icon: MapPinIcon },
      { name: 'Destinos', href: '/cadastros/destinos', icon: FlagIcon },
      { name: 'Etiquetas', href: '/cadastros/etiquetas', icon: TagIcon },
      { name: 'Tipos de Pagamento', href: '/cadastros/tipos-pagamento', icon: CreditCardIcon },
      { name: 'Usuários', href: '/cadastros/usuarios', icon: UsersIcon },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary-900 text-white flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-primary-800">
        <Squares2X2Icon className="h-7 w-7 text-primary-300 mr-3" />
        <span className="text-lg font-bold">Fluxo de Caixa</span>
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
  );
}
