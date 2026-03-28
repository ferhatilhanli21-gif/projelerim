'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Menu, X } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { createClient } from '@/lib/supabase/client';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  username: string;
  role: 'admin' | 'employee';
}

const ADMIN_LINKS = [
  { href: '/admin', label: 'Panel' },
  { href: '/admin/employees', label: 'Çalışanlar' },
  { href: '/admin/reports', label: 'Raporlar' },
  { href: '/admin/messages', label: 'Mesajlar' },
  { href: '/admin/group-chat', label: 'Sohbet' },
  { href: '/admin/leave-requests', label: 'İzinler' },
  { href: '/admin/announcements', label: 'Duyurular' },
  { href: '/admin/notes', label: 'Notlar' },
];

const EMPLOYEE_LINKS = [
  { href: '/dashboard', label: 'Panel' },
  { href: '/dashboard/messages', label: 'Mesajlar' },
  { href: '/dashboard/group-chat', label: 'Sohbet' },
  { href: '/dashboard/notes', label: 'Notlarım' },
  { href: '/dashboard/leave-request', label: 'İzin Bildir' },
  { href: '/dashboard/announcements', label: 'Duyurular' },
  { href: '/dashboard/workspace', label: '🤖 AI' },
];

export function Header({ username, role }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = role === 'admin' ? ADMIN_LINKS : EMPLOYEE_LINKS;

  async function handleLogout() {
    await fetch('/api/sessions/clock-out', { method: 'POST' }).catch(() => {});
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Hamburger — sadece mobil */}
            <button
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href={role === 'admin' ? '/admin' : '/dashboard'}>
              <Logo size="sm" />
            </Link>

            {/* Masaüstü nav */}
            <nav className="hidden md:flex items-center gap-4 text-sm">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  className={`transition-colors ${pathname === l.href ? 'text-red-600 font-medium' : 'text-gray-600 hover:text-red-600'}`}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg px-2.5 h-8 text-sm font-medium hover:bg-muted transition-colors">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{username}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobil menü drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <nav className="fixed top-14 left-0 right-0 bg-white border-b shadow-lg z-40 md:hidden">
            <div className="flex flex-col py-2">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    pathname === l.href
                      ? 'text-red-600 bg-red-50 border-l-2 border-red-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  {l.label}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 text-left flex items-center gap-2 border-t mt-1">
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
