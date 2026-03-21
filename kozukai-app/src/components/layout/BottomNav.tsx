'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, List, BarChart2, Settings } from 'lucide-react';

const NAV = [
  { href: '/',          label: 'ホーム',   Icon: Home },
  { href: '/add',       label: '追加',     Icon: PlusCircle },
  { href: '/expenses',  label: '履歴',     Icon: List },
  { href: '/analytics', label: '分析',     Icon: BarChart2 },
  { href: '/settings',  label: '設定',     Icon: Settings },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="mx-auto max-w-md flex">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                active ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className={active ? 'font-semibold' : ''}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
